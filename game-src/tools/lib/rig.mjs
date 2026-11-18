// RIG BAKER — a tiny 2D skeletal system whose only output is pixel-perfect baked frames.
//   art-src/rigs/<name>/rig.json   bones, IK chains, groups, parts, secondary-motion bones
//   art-src/rigs/<name>/parts.mjs  part sprites in the ASCII DSL (roles, never RGB)
//   art-src/rigs/<name>/clips.mjs  clips = explicit key frames with holds (no runtime tweening)
// Pipeline per frame: FK -> IK -> secondary motion -> rotate parts (majority sampling, no AA)
//   -> per-group coloured outline -> composite -> hand-fix overlays -> fx -> rim-light flags.
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { Img, PAL, NAME, MASTER, step, ROOT, RIM_L, RIM_R, IDX, hash2 } from './pix.mjs';

const D2R = Math.PI / 180;

export async function bakeRig(name) {
  const dir = path.join(ROOT, 'art-src/rigs', name);
  const rig = JSON.parse(fs.readFileSync(path.join(dir, 'rig.json'), 'utf8'));
  const bust = '?v=' + Date.now();
  const parts = (await import(pathToFileURL(path.join(dir, 'parts.mjs')).href + bust)).default;
  const clipsMod = (await import(pathToFileURL(path.join(dir, 'clips.mjs')).href + bust)).default;
  const pal = PAL.rigs[rig.pal || name];

  /* ---- role table: role index -> master colour index ---- */
  const roles = [0], letter = {}, byMaster = {};
  const addRole = (m) => { roles.push(m); return roles.length - 1; };
  for (const [ch, col] of Object.entries(pal.roles)) { letter[ch] = addRole(NAME[col]); }
  const roleOfMaster = (m) => {
    for (let i = 1; i < roles.length; i++) if (roles[i] === m) return i;
    return byMaster[m] || (byMaster[m] = addRole(m));
  };
  const resolve = (v) => letter[v] || roleOfMaster(NAME[v]);
  const defOl = resolve(pal.default_ol || 'K');
  const olOf = {};
  for (const [ch, o] of Object.entries(pal.ol || {})) olOf[letter[ch]] = resolve(o);
  const outlineFor = (r) => olOf[r] || defOl;
  const isOutline = new Set([defOl, ...Object.values(olOf)]);
  const shadeRole = (r, d) => roleOfMaster(step(roles[r], d));

  /* ---- sprites ---- */
  const spr = {};
  for (const [k, rows] of Object.entries(parts)) spr[k] = Img.ascii(rows, letter);
  const shaded = {};
  const getSprite = (nm, sh) => {
    if (!spr[nm]) throw new Error(name + ': missing sprite ' + nm);
    if (!sh) return spr[nm];
    const key = nm + '|' + sh;
    if (!shaded[key]) { const s = spr[nm].clone(); for (let i = 0; i < s.d.length; i++) if (s.d[i]) s.d[i] = shadeRole(s.d[i], sh); shaded[key] = s; }
    return shaded[key];
  };

  /* ---- skeleton ---- */
  const order = [];
  (function topo() {
    const done = new Set();
    const visit = (b) => { if (done.has(b)) return; const p = rig.bones[b].parent; if (p) visit(p); done.add(b); order.push(b); };
    Object.keys(rig.bones).forEach(visit);
  })();
  const rot = (x, y, a) => [x * Math.cos(a) - y * Math.sin(a), x * Math.sin(a) + y * Math.cos(a)];

  function fk(pose, worldRot = {}) {
    const W = {};
    for (const b of order) {
      const def = rig.bones[b], pb = (pose.b && pose.b[b]) || {};
      const lr = (def.sign || 1) * ((def.r || 0) + (pb.r || 0)) * D2R;
      const lx = (def.x || 0) + (pb.x || 0), ly = (def.y || 0) + (pb.y || 0);
      if (!def.parent) { W[b] = { x: lx, y: ly, rot: lr }; continue; }
      const P = W[def.parent], [dx, dy] = rot(lx, ly, P.rot);
      W[b] = { x: P.x + dx, y: P.y + dy, rot: worldRot[b] != null ? worldRot[b] : P.rot + lr };
    }
    return W;
  }
  function solve(pose) {
    let W = fk(pose);
    if (pose.ik) {
      const wr = {};
      for (const [chain, tgt] of Object.entries(pose.ik)) {
        const def = rig.ik[chain]; if (!def) throw new Error('unknown ik chain ' + chain);
        const A = W[def.a], L1 = rig.bones[def.b].y, L2 = def.len2;
        let dx = tgt[0] - A.x, dy = tgt[1] - A.y, d = Math.hypot(dx, dy);
        const dmax = L1 + L2 - .05, dmin = Math.abs(L1 - L2) + .05;
        if (d > dmax) { dx *= dmax / d; dy *= dmax / d; d = dmax; } else if (d < dmin) { d = dmin; }
        const phi = Math.atan2(dy, dx), al = Math.acos(Math.max(-1, Math.min(1, (L1 * L1 + d * d - L2 * L2) / (2 * L1 * d))));
        const bend = (tgt[3] != null ? tgt[3] : def.bend) || 1;          // +1 joint forward (+x), -1 joint backward
        let k1 = [A.x + L1 * Math.cos(phi - al), A.y + L1 * Math.sin(phi - al)], k2 = [A.x + L1 * Math.cos(phi + al), A.y + L1 * Math.sin(phi + al)];
        const K = (k1[0] > k2[0]) === (bend > 0) ? k1 : k2;
        wr[def.a] = Math.atan2(-(K[0] - A.x), K[1] - A.y);
        wr[def.b] = Math.atan2(-(A.x + dx - K[0]), A.y + dy - K[1]);
        if (def.end) wr[def.end] = (tgt[2] || 0) * D2R;
      }
      W = fk(pose, wr);
    }
    return W;
  }

  /* ---- render one pose to a role-indexed frame ---- */
  const [FW, FH] = rig.frame, [OX, OY] = rig.origin;
  function render(pose, W) {
    const frame = new Img(FW, FH);
    const groups = Object.entries(rig.groups).map(([g, def]) => ({ g, z: pose.z && pose.z[g] != null ? pose.z[g] : def.z, ol: def.outline !== false }));
    groups.sort((a, b) => a.z - b.z);
    for (const G of groups) {
      if (pose.hide && pose.hide.includes(G.g)) continue;
      const buf = new Img(FW, FH);
      for (const p of rig.parts) {
        if (p.group !== G.g) continue;
        if (pose.hide && pose.hide.includes(p.name)) continue;
        const sname = (pose.swap && pose.swap[p.name]) || p.sprite;
        if (sname === 'none') continue;
        const s = getSprite(sname, p.shade), B = W[p.bone];
        const piv = (rig.pivots && rig.pivots[sname]) || p.pivot;
        const r = B.rot + (p.r || 0) * D2R;
        const fx = OX + Math.round(B.x), fy = OY + Math.round(B.y);
        if (Math.abs(r) < .035) buf.blit(s, fx - piv[0], fy - piv[1]);
        else { const R = s.rotated(r, piv[0] + .5, piv[1] + .5); buf.blit(R.img, fx - R.ox, fy - R.oy); }
      }
      if (G.ol) buf.outline(outlineFor);
      frame.blit(buf, 0, 0);
    }
    for (const o of pose.overlay || []) frame.blit(getSprite(o.s), OX + o.x, OY + o.y, o.atop ? { atop: true } : {});
    let out = frame;
    if (pose.sx != null && pose.sx !== 1) {                                 // nearest-neighbour x scale about the origin (paper turn)
      out = new Img(FW, FH);
      const s = pose.sx;
      for (let y = 0; y < FH; y++) for (let x = 0; x < FW; x++) { const u = Math.round(OX + (x - OX) / s); if (u >= 0 && u < FW) out.d[y * FW + x] = frame.d[y * FW + u]; }
      const src = out.clone();                                              // keep the outline closed after squeezing
      for (let y = 0; y < FH; y++) for (let x = 0; x < FW; x++) if (src.d[y * FW + x] && !isOutline.has(src.d[y * FW + x]) && (!src.get(x - 1, y) || !src.get(x + 1, y))) out.d[y * FW + x] = outlineFor(src.d[y * FW + x]);
    }
    if (pose.fx && pose.fx.dissolve != null) out = dissolve(out, pose.fx.dissolve, pose.fx.seed || 7);
    return rim(out);
  }

  /* ---- fx: the body breaks into rising rune motes (no gore). t: 0 intact .. 1 gone ---- */
  function dissolve(src, t, seed) {
    const out = new Img(FW, FH), v1 = resolve('rune3'), v2 = resolve('rune5'), b = src.bounds();
    if (!b) return out;
    for (let y = 0; y < FH; y++) for (let x = 0; x < FW; x++) {
      const v = src.d[y * FW + x]; if (!v) continue;
      const hgt = 1 - (y - b.y) / Math.max(1, b.h);                           // top goes first
      const thr = hash2(x >> 1, y >> 1, seed) * .55 + hgt * .0 + (1 - hgt) * .35;
      const k = (t * 1.25 - thr) / .3;                                        // <0 intact, 0..1 glowing+rising, >1 gone
      if (k < 0) out.d[y * FW + x] = v;
      else if (k < 1) {
        const lift = Math.round(k * k * (6 + hash2(x, y, seed + 1) * 12)), dx = Math.round((hash2(y, x, seed + 2) - .5) * k * 6);
        if (hash2(x, y, seed + 3) > k * .8) out.set(x + dx, y - lift, k < .35 ? v2 : v1);
      }
    }
    return out;
  }

  /* ---- rim flags: bit6 = pixel sits on the right silhouette edge, bit7 = on the left edge ---- */
  function rim(f) {
    const src = f.clone();
    for (let y = 0; y < FH; y++) for (let x = 0; x < FW; x++) {
      const v = src.d[y * FW + x]; if (!v) continue;
      let fl = 0;
      if (!src.get(x + 1, y)) fl |= RIM_R; else if (isOutline.has(v) === false && !src.get(x + 2, y) && isOutline.has(src.get(x + 1, y))) fl |= RIM_R;
      if (!src.get(x - 1, y)) fl |= RIM_L; else if (isOutline.has(v) === false && !src.get(x - 2, y) && isOutline.has(src.get(x - 1, y))) fl |= RIM_L;
      f.d[y * FW + x] = v | fl;
    }
    return f;
  }

  /* ---- clips ---- */
  const out = { name, frameW: FW, frameH: FH, origin: [OX, OY], frames: [], clips: {}, roles: null, isOutline: null };
  const seen = new Map();
  const sec = rig.secondary || {};
  for (const [cname, clip] of Object.entries(clipsMod)) {
    const poses = clip.frames.map((p) => ({ ...p, b: { ...(p.b || {}) } }));
    // secondary motion: hanging things lag behind the motion of the point they hang from
    const Ws = poses.map(solve);
    for (const [bone, k] of Object.entries(sec)) {
      const n = poses.length, tg = new Array(n).fill(0);
      for (let i = 0; i < n; i++) {
        const j = clip.loop ? (i - 1 + n) % n : Math.max(0, i - 1);
        const vx = Ws[i][bone].x - Ws[j][bone].x, vy = Ws[i][bone].y - Ws[j][bone].y;
        tg[i] = Math.max(-k.max, Math.min(k.max, -k.kx * vx + k.ky * vy));
      }
      for (let i = 0; i < n; i++) {
        const j = clip.loop ? (i - 1 + n) % n : Math.max(0, i - 1);
        const add = Math.round((tg[i] * .55 + tg[j] * .45) / 5) * 5;
        if (add) { poses[i].b[bone] = { ...(poses[i].b[bone] || {}) }; poses[i].b[bone].r = (poses[i].b[bone].r || 0) + add; }
      }
    }
    const frames = [];
    poses.forEach((pose) => {
      const Wp = solve(pose), img = render(pose, Wp);
      // weapon anchor (rig.meta.hand = [bone, length]): where the fist is in this frame and the angle the weapon is held at
      let hand = 0;
      if (rig.meta && rig.meta.hand) { const B = Wp[rig.meta.hand[0]], [hx, hy] = rot(0, rig.meta.hand[1], B.rot); hand = [Math.round(B.x + hx), Math.round(B.y + hy), pose.w == null ? 30 : pose.w]; }
      const key = Buffer.from(img.d).toString('latin1');
      let idx = seen.get(key);
      if (idx == null) { idx = out.frames.length; out.frames.push(img); seen.set(key, idx); }
      frames.push({ f: idx, hold: pose.hold || 1, ev: pose.ev || null, h: hand });
    });
    out.clips[cname] = { fps: clip.fps, loop: !!clip.loop, frames };
  }
  out.roles = roles.slice();
  out.isOutline = roles.map((_, i) => isOutline.has(i));
  // attachment helper for the runtime (e.g. where is the head top -> name tag)
  out.meta = rig.meta || {};
  return out;
}

/** role LUT -> rgb for review sheets (rim: 0 none, 1 key light from the right, -1 from the left) */
export function roleLut(baked, opts = {}) {
  const { MASTER_RGB } = opts.pix;
  const lut = new Array(256).fill(null).map(() => [0, 0, 0]);
  const zl = opts.zone || null;
  for (let i = 1; i < 256; i++) {
    const r = i & IDX; if (!r || r >= baked.roles.length) continue;
    let m = baked.roles[r];
    const edgeR = i & RIM_R, edgeL = i & RIM_L, ol = baked.isOutline[r];
    if (opts.rim) {
      const lit = opts.rim > 0 ? edgeR : edgeL, back = opts.rim > 0 ? edgeL : edgeR;
      if (lit && !ol) m = step(m, 1);
      if (back && ol) m = NAME[opts.backRim || 'rune1'];
    }
    if (zl) m = zl[m];
    lut[i] = MASTER_RGB[m];
  }
  return lut;
}

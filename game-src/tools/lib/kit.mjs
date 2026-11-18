// ENVIRONMENT KIT — reusable pixel-art builders shared by every zone (masonry, arches, gears,
// chains, flames, banded glows). All output is palette-indexed, no AA, no gradients:
// ramps are banded and their edges ordered-dithered.
import { Img, c, step, dith, hash2, rng, EMI, IDX } from './pix.mjs';

/** Irregular ashlar masonry. Seamless when w is a multiple of `wrap` (joints wrap horizontally).
 *  cols = [mortar, dark, mid, light]. Light comes from the top-left: top/left edge lighter. */
export function masonry(img, x0, y0, w, h, o = {}) {
  const bh = o.bh || 8, bw = o.bw || 16, seed = o.seed || 1, cols = o.cols, wrap = o.wrap || 0;
  const [mo, dk, md, lt] = cols;
  for (let row = 0; row * bh < h; row++) {
    const ry = y0 + row * bh, hh = Math.min(bh, h - row * bh);
    const W = wrap || w, joints = [];
    let x = Math.floor(hash2(row, 7, seed) * bw);
    while (x < W) { joints.push(x); x += Math.max(5, Math.round(bw * (.65 + hash2(row, x, seed + 1) * .8))); }
    if (joints.length < 2) joints.push((joints[0] + (W >> 1)) % W);
    joints.sort((a, b) => a - b);
    for (let j = 0; j < joints.length; j++) {
      const a = joints[j], b = j + 1 < joints.length ? joints[j + 1] : joints[0] + W, bwid = b - a;
      const r = hash2(row * 31 + j, a, seed + 2), base = r < (o.darkP == null ? .35 : o.darkP) ? dk : md;
      for (let i = 0; i < bwid; i++) for (let k = 0; k < hh; k++) {
        const X = x0 + ((a + i) % W) + (wrap ? 0 : 0), Y = ry + k;
        if (!wrap && a + i >= w) continue;
        let v = base;
        if (i === bwid - 1 || k === hh - 1) v = mo;                               // mortar right / bottom
        else if (k === 0 && lt && r > (o.litP == null ? .45 : 1 - o.litP)) v = base === dk ? md : lt;   // lit top edge
        else if (i === 0 && lt && r > .8) v = base === dk ? md : lt;
        // chipped corners + worn clusters (clusters, never single-pixel noise)
        if (o.chips !== 0) {
          if ((i === 0 || i === bwid - 2) && (k === 0 || k === hh - 2) && hash2(a + i, row + k, seed + 3) < .3) v = mo;
          const wx = Math.floor(hash2(a, row, seed + 4) * (bwid - 4)) + 1, wy = Math.floor(hash2(row, a, seed + 5) * Math.max(1, hh - 4)) + 1;
          if (r > .72 && i >= wx && i <= wx + 2 && k >= wy && k <= wy + 1 && !(i === wx + 2 && k === wy)) v = base === md ? dk : mo;
        }
        img.set(X, Y, v);
      }
    }
  }
  return img;
}

/** points of a pointed (gothic) arch outline: returns for each y the half-width at that row. */
export function archHalf(w, h, spring) {
  // two-centred arch: straight jambs up to `spring` px from the bottom of the arch head
  const half = w / 2, head = h - spring, out = [];
  const R = (half * half + head * head) / (2 * half);       // circle centred on the opposite jamb line
  for (let y = 0; y < h; y++) {
    if (y >= head) { out.push(half); continue; }
    const dy = head - y;                                    // distance above the spring line
    const xx = Math.sqrt(Math.max(0, R * R - dy * dy)) - (R - half);
    out.push(Math.max(0, xx));
  }
  return out;
}
/** fill a pointed arch (cx = centre, top y, width, height). v: index or fn(x,y) */
export function archFill(img, cx, top, w, h, spring, v) {
  const hw = archHalf(w, h, spring);
  for (let y = 0; y < h; y++) { const a = Math.round(cx - hw[y]), b = Math.round(cx + hw[y]); for (let x = a; x < b; x++) img.set(x, top + y, typeof v === 'function' ? v(x, top + y) : v); }
}
/** voussoir ring around a pointed arch: band of thickness t outside the arch opening */
export function archRing(img, cx, top, w, h, spring, t, cols, seed = 3) {
  const [mo, dk, md, lt] = cols, tmp = new Img(img.w, img.h);
  archFill(tmp, cx, top - t, w + t * 2, h + t, spring, 1);
  const hole = new Img(img.w, img.h); archFill(hole, cx, top, w, h, spring, 1);
  for (let y = 0; y < img.h; y++) for (let x = 0; x < img.w; x++) {
    if (!tmp.d[y * img.w + x] || hole.d[y * img.w + x]) continue;
    // voussoir joints radiate: use the angle around the arch centre in the head, rows on the jambs
    const head = h - spring, inHead = y < top + head;
    let v = md, joint;
    if (inHead) { const a = Math.atan2(y - (top + head), x - cx); joint = Math.floor((a + Math.PI) / (Math.PI / 14)); const fa = ((a + Math.PI) / (Math.PI / 14)) % 1; if (fa < .1) v = mo; }
    else { joint = 100 + Math.floor((y - top) / 10); if ((y - top) % 10 === 0) v = mo; }
    if (v !== mo) { v = hash2(joint, 3, seed) < .35 ? dk : md; if (!hole.get(x, y + 1) && !tmp.get(x, y - 1)) v = lt; if (!tmp.get(x - 1, y) && x < cx) v = lt; }
    if (hole.get(x + 1, y) || hole.get(x - 1, y) || hole.get(x, y + 1)) v = dk;      // inner lip in shadow
    img.set(x, y, v);
  }
}

/** a toothed gear. phase in [0,1) = fraction of one SPOKE period. cols=[outline, dark, mid, light] */
export function gear(R, teeth, spokes, phase, cols, o = {}) {
  const S = R * 2 + 3, im = new Img(S, S), cx = R + 1, cy = R + 1;
  const th = o.tooth || Math.max(2, Math.round(R * .16)), rim = o.rim || Math.max(2, Math.round(R * .2)), hub = o.hub || Math.max(2, Math.round(R * .26));
  const rot = phase * (Math.PI * 2 / spokes), pitch = Math.PI * 2 / teeth, sw = o.spokeW || Math.max(1.2, R * .09);
  const [ol, dk, md, lt] = cols;
  for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) {
    const dx = x - cx, dy = y - cy, r = Math.hypot(dx, dy), a = Math.atan2(dy, dx) - rot;
    const ft = (((a / pitch) % 1) + 1) % 1, tooth = ft < .5;
    const Rout = tooth ? R : R - th;
    let solid = false, kind = 0;
    if (r <= Rout && r >= R - th - rim) { solid = true; kind = 1; }
    else if (r <= hub) { solid = r >= (o.hole == null ? Math.max(1, hub * .35) : o.hole); kind = 2; }
    else if (r < R - th - rim) {
      const sa = (((a / (Math.PI * 2 / spokes)) % 1) + 1) % 1, da = Math.min(sa, 1 - sa) * (Math.PI * 2 / spokes);
      if (Math.sin(da) * r <= sw) { solid = true; kind = 3; }
    }
    if (!solid) continue;
    // light from top-left, banded
    const n = (-dx - dy) / (R * 1.6);
    let v = n > .28 ? lt : n > -.3 ? md : dk;
    if (kind === 1 && r > R - th - 1 && !tooth) v = dk;
    if (kind === 1 && r < R - th - rim + 1) v = dk;
    if (kind === 2 && r > hub - 1) v = dk;
    im.set(x, y, v);
  }
  im.outline(ol);
  if (o.rivets) for (let i = 0; i < spokes; i++) { const a = rot + (i + .5) * Math.PI * 2 / spokes, rr = R - th - rim / 2; im.set(Math.round(cx + Math.cos(a) * rr), Math.round(cy + Math.sin(a) * rr), lt); }
  return im;
}

/** hanging chain as a 2-segment pendulum. frame f of n. returns Img w x len */
export function chain(len, f, n, cols, o = {}) {
  const amp = o.amp == null ? 3 : o.amp, W = o.w || 17, im = new Img(W, len), cx = W >> 1;
  const [dk, md, lt] = cols, ph = f / n * Math.PI * 2;
  let x = cx, y = 0, i = 0;
  while (y < len - (o.end ? o.end.h : 0)) {
    const t = y / len, off = Math.sin(ph) * amp * t + Math.sin(ph - .9) * amp * .7 * t * t;
    const X = Math.round(cx + off);
    if (i % 2 === 0) { im.set(X, y, md); im.set(X - 1, y + 1, dk); im.set(X + 1, y + 1, md); im.set(X - 1, y + 2, dk); im.set(X + 1, y + 2, lt); im.set(X, y + 3, dk); y += 3; }
    else { im.set(X, y, dk); im.set(X, y + 1, md); im.set(X, y + 2, dk); y += 2; }
    x = X; i++;
  }
  if (o.end) im.blit(o.end, x - (o.end.w >> 1), y);
  return im;
}

/** looping pixel flame. frame f of n. ramp = colours cool/outer -> hot/core (indices, EMI flags allowed) */
export function flame(w, h, f, n, ramp, o = {}) {
  const im = new Img(w, h), ph = f / n * Math.PI * 2, cx = (w - 1) / 2, seed = o.seed || 0;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const t = 1 - y / (h - 1);                                   // 0 at the base, 1 at the tip
    const sway = Math.sin(ph + t * 3.1 + seed) * (w * .1) * t + Math.sin(ph * 2 + t * 5.3 + seed * 2) * (w * .07) * t * t;
    const width = (w * .5) * Math.pow(1 - t, .75) * (.82 + .18 * Math.sin(ph * 2 + t * 7 + seed)) * (o.fat || 1);
    const dx = Math.abs(x - cx - sway) / Math.max(.6, width);
    if (dx >= 1 || t > .96 + .04 * Math.sin(ph + seed)) continue;
    // heat: hottest low and central; licks cool toward the edge and the tip
    const heat = (1 - dx) * (1 - t * (.8 + .12 * Math.sin(ph + x * .9))) * 1.15;
    const lv = Math.max(0, Math.min(ramp.length - 1, Math.floor(heat * ramp.length + (dith(x, y + f, .5) ? .18 : -.18))));
    im.set(x, y, ramp[lv]);
  }
  // detached sparks rising
  for (let i = 0; i < (o.sparks == null ? 2 : o.sparks); i++) {
    const p = ((f / n + i * .37 + seed * .13) % 1), sx = Math.round(cx + Math.sin(i * 2.4 + seed) * w * .28 + Math.sin(ph + i) * 1.5), sy = Math.round(h * .45 * (1 - p)) - 1;
    if (p < .8) im.set(sx, sy, ramp[Math.max(0, ramp.length - 2 - Math.floor(p * 3))]);
  }
  return im;
}

/** banded vertical ramp fill with dithered band edges. stops: [[t, index], ...] t in 0..1 top->bottom */
export function bands(img, x0, y0, w, h, stops, o = {}) {
  const soft = o.soft == null ? .5 : o.soft;
  for (let y = 0; y < h; y++) {
    const t = y / Math.max(1, h - 1);
    let i = 0; while (i + 1 < stops.length && t >= stops[i + 1][0]) i++;
    const a = stops[i], b = stops[Math.min(stops.length - 1, i + 1)];
    const k = b[0] > a[0] ? (t - a[0]) / (b[0] - a[0]) : 0;
    for (let x = 0; x < w; x++) {
      const lv = (k - (1 - soft)) / Math.max(.001, soft);          // only the last `soft` share of a band dithers
      img.set(x0 + x, y0 + y, lv > 0 && dith(x0 + x, y0 + y, lv) ? b[1] : a[1]);
    }
  }
}

/** rivet row helper */
export function rivets(img, x0, y, x1, stepPx, lt, dk) { for (let x = x0; x <= x1; x += stepPx) { img.set(x, y, lt); img.set(x + 1, y + 1, dk); } }

/** iron band (horizontal) with highlight, body, shadow and rivets */
export function ironBand(img, x, y, w, hgt, o = {}) {
  const lt = c('iron2'), md = c('iron1'), dk = c('iron0'), ol = c('void2');
  img.rect(x, y, w, hgt, md); img.rect(x, y, w, 1, lt); img.rect(x, y + hgt - 1, w, 1, dk); img.rect(x, y + hgt, w, 1, ol);
  if (o.rivets !== 0) for (let i = x + 3; i < x + w - 2; i += (o.rivets || 9)) { img.set(i, y + (hgt >> 1), c('iron3')); img.set(i + 1, y + (hgt >> 1), dk); }
}

/** 1px selective outline around everything opaque, colour chosen from the neighbour's ramp (darkest step) */
export function rampOutline(img, fallback) {
  return img.outline((n) => { try { return step(n & IDX, -9); } catch (e) { return fallback; } });
}

/** stencil capitals used for wall paint (own glyphs, 7x9) */
export const STENCIL = {
  B: ['XXXXX. ', 'XX..XX ', 'XX..XX ', 'XXXXX. ', 'XX..XX ', 'XX..XX ', 'XX..XX ', 'XX..XX ', 'XXXXX. '],
  U: ['XX..XX ', 'XX..XX ', 'XX..XX ', 'XX..XX ', 'XX..XX ', 'XX..XX ', 'XX..XX ', 'XX..XX ', '.XXXX. '],
  I: ['XXXX ', '.XX. ', '.XX. ', '.XX. ', '.XX. ', '.XX. ', '.XX. ', '.XX. ', 'XXXX '],
  L: ['XX.... ', 'XX.... ', 'XX.... ', 'XX.... ', 'XX.... ', 'XX.... ', 'XX.... ', 'XX.... ', 'XXXXXX '],
  D: ['XXXXX. ', 'XX..XX ', 'XX..XX ', 'XX..XX ', 'XX..XX ', 'XX..XX ', 'XX..XX ', 'XX..XX ', 'XXXXX. '],
  F: ['XXXXXX ', 'XX.... ', 'XX.... ', 'XXXXX. ', 'XX.... ', 'XX.... ', 'XX.... ', 'XX.... ', 'XX.... '],
  A: ['.XXXX. ', 'XX..XX ', 'XX..XX ', 'XX..XX ', 'XXXXXX ', 'XX..XX ', 'XX..XX ', 'XX..XX ', 'XX..XX '],
  R: ['XXXXX. ', 'XX..XX ', 'XX..XX ', 'XXXXX. ', 'XXXX.. ', 'XX.XX. ', 'XX..XX ', 'XX..XX ', 'XX..XX '],
  E: ['XXXXXX ', 'XX.... ', 'XX.... ', 'XXXXX. ', 'XX.... ', 'XX.... ', 'XX.... ', 'XX.... ', 'XXXXXX '],
  ' ': ['   ', '   ', '   ', '   ', '   ', '   ', '   ', '   ', '   ']
};
export function stencil(img, str, x, y, v, o = {}) {
  let cx = x;
  for (const ch of str) {
    const g = STENCIL[ch]; if (!g) continue;
    g.forEach((row, j) => { for (let i = 0; i < row.length; i++) if (row[i] === 'X') { const col = typeof v === 'function' ? v(cx + i, y + j) : v; if (col) img.set(cx + i, y + j, col); } });
    cx += g[0].length;
  }
  return cx - x;
}

/** the code-glyph sigils of Veyrath: { } ; < > / = drawn as carved runes (7x9 cells) */
export const SIGIL = {
  '{': ['..XX', '.X..', '.X..', '.X..', 'X...', '.X..', '.X..', '.X..', '..XX'],
  '}': ['XX..', '..X.', '..X.', '..X.', '...X', '..X.', '..X.', '..X.', 'XX..'],
  ';': ['....', '.XX.', '.XX.', '....', '....', '.XX.', '.XX.', '..X.', '.X..'],
  '<': ['...X', '..X.', '.X..', 'X...', 'X...', '.X..', '..X.', '...X', '....'],
  '>': ['X...', '.X..', '..X.', '...X', '...X', '..X.', '.X..', 'X...', '....'],
  '/': ['...X', '...X', '..X.', '..X.', '.X..', '.X..', 'X...', 'X...', '....'],
  '=': ['....', '....', 'XXXX', '....', '....', 'XXXX', '....', '....', '....']
};
export function sigil(img, ch, x, y, v) { SIGIL[ch].forEach((row, j) => { for (let i = 0; i < row.length; i++) if (row[i] === 'X') img.set(x + i, y + j, v); }); }

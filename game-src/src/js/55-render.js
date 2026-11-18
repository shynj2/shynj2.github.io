/* ==========================================================================
   RENDER — back to front:
   world (baked chunks, animated decor, props, NPCs, Shyn, player)  ->  darkness x banded lights
   ->  emissive pass  ->  parallax + sky slipped in BEHIND the world (so far planes are never lit)
   ->  particles, foreground silhouettes, vignette, name tag, flash, fade.
   Every coordinate is an integer; nothing here allocates per frame.
   ========================================================================== */
const View = { L: null, lg: null, E: null, eg: null, vig: null, sky: null, skyKey: '' };

function viewBuild() {
  cv.width = VW; cv.height = VH; ctx.imageSmoothingEnabled = false;
  View.L = mk(VW, VH); View.lg = View.L.getContext('2d'); View.lg.imageSmoothingEnabled = false;
  View.E = mk(VW, VH); View.eg = View.E.getContext('2d'); View.eg.imageSmoothingEnabled = false;
  // vignette: ordered-dither frame, heavier in the corners
  const v = mk(VW, VH), g = v.getContext('2d'), id = g.createImageData(VW, VH), o = new Uint32Array(id.data.buffer), ink = rgba32(PALRGB[ART.names.void0]);
  for (let y = 0; y < VH; y++) for (let x = 0; x < VW; x++) {
    const dx = (x - VW / 2) / (VW / 2), dy = (y - VH / 2) / (VH / 2), d = Math.sqrt(dx * dx * .72 + dy * dy * .9);
    const a = clamp((d - .88) / .5, 0, 1) * .7;
    if (a > (B4[(y & 3) * 4 + (x & 3)] + .5) / 16) o[y * VW + x] = ink;
  }
  g.putImageData(id, 0, 0); View.vig = v; View.skyKey = '';
}
function skyBuild(z) {
  const key = z.id + VW + Art.kit.key; if (View.skyKey === key) return; View.skyKey = key;
  const s = View.sky || (View.sky = mk(VW, VH)); s.width = VW; s.height = VH;
  const g = s.getContext('2d'), bands = z.sky || ['void1', 'void2'], bh = Math.ceil(VH * .8 / bands.length);
  g.fillStyle = Art.zc(bands[0]); g.fillRect(0, 0, VW, VH);
  for (let i = 1; i < bands.length; i++) {
    const y0 = i * bh, col = Art.zc(bands[i]);
    for (let k = 0; k < 8; k++) Dither.fill(g, 0, y0 - 32 + k * 4, VW, 4, col, (k + 1) / 9);      // dithered seam, no gradient
    g.fillStyle = col; g.fillRect(0, y0, VW, VH - y0);
  }
}

/* ---------------- particles (fixed pool) ---------------- */
const FX = { p: [], MAX: 240, next: 0, clear() { for (let i = 0; i < this.MAX; i++) this.p[i].on = 0; } };
for (let i = 0; i < FX.MAX; i++) FX.p.push({ on: 0, kind: 0, x: 0, y: 0, vx: 0, vy: 0, life: 0, max: 1, col: '', col2: '', size: 1, grav: 0, s: '', fps: 0, lit: 0, sway: 0 });
function fxGet() {
  for (let k = 0; k < FX.MAX; k++) { const p = FX.p[FX.next = (FX.next + 1) % FX.MAX]; if (!p.on) return p; }
  return FX.p[FX.next = (FX.next + 1) % FX.MAX];
}
/** a one-shot sprite strip; x,y = bottom-centre */
function fxSprite(name, x, y, fps, lit) {
  const r = sprRect(name, 0); if (!r) return;
  const p = fxGet(); p.on = 1; p.kind = 1; p.s = name; p.x = Math.round(x - r[2] / 2); p.y = Math.round(y - r[3]); p.vx = p.vy = 0; p.life = 0; p.fps = fps || 14; p.max = sprFrames(name) / p.fps; p.lit = lit ? 1 : 0;
}
function fxPix(x, y, vx, vy, life, col, col2, size, grav, sway) {
  const p = fxGet(); p.on = 1; p.kind = 0; p.x = x; p.y = y; p.vx = vx; p.vy = vy; p.life = 0; p.max = life; p.col = col; p.col2 = col2 || col; p.size = size || 1; p.grav = grav || 0; p.sway = sway || 0; p.lit = 0;
}
const PIX = {}; ['rune2', 'rune3', 'rune4', 'rune5', 'ember2', 'ember3', 'ember4', 'gold3', 'gold4', 'bone1', 'bone2', 'bone4', 'soot4', 'stone3', 'stone4', 'void1', 'void0', 'cold3', 'moss3', 'moss1', 'bone3'].forEach((n) => { PIX[n] = palHex(n); });
const burstCols = {};
/** legacy signature kept: colour arrives as an 'rgba(r,g,b,' prefix and is snapped to the palette */
function burst(x, y, col, n, sp) {
  let pair = burstCols[col];
  if (!pair) {
    const m = (col || '').match(/(\d+),\s*(\d+),\s*(\d+)/), r = m ? +m[1] : 190, g = m ? +m[2] : 150, b = m ? +m[3] : 255;
    pair = burstCols[col] = (r > 230 && g > 180) ? ['gold4', 'gold3'] : (r > 220 && b < 160) ? ['ember4', 'ember3'] : ['rune4', 'rune3'];
  }
  for (let i = 0; i < n; i++) {
    const a = Math.random() * TAU, v = sp * (.35 + Math.random() * .75);
    fxPix(x, y, Math.cos(a) * v, Math.sin(a) * v - sp * .3, .35 + Math.random() * .45, PIX[pair[0]], PIX[pair[1]], Math.random() < .3 ? 2 : 1, 160);
  }
  if (n >= 10) fxSprite('fx_burst', x, y + 16, 16, 0);
}
function updateFX(dt) {
  for (let i = 0; i < FX.MAX; i++) {
    const p = FX.p[i]; if (!p.on) continue;
    p.life += dt; if (p.life >= p.max) { p.on = 0; continue; }
    if (p.kind === 0) { p.vy += p.grav * dt; p.x += (p.vx + (p.sway ? Math.sin(p.life * 3 + i) * p.sway : 0)) * dt; p.y += p.vy * dt; }
  }
}
function drawFX(lit, cx, cy) {
  for (let i = 0; i < FX.MAX; i++) {
    const p = FX.p[i]; if (!p.on || p.lit !== lit) continue;
    if (p.kind === 1) spr(ctx, p.s, p.x - cx, p.y - cy, Math.min(sprFrames(p.s) - 1, (p.life * p.fps) | 0));
    else { ctx.fillStyle = p.life > p.max * .6 ? p.col2 : p.col; ctx.fillRect(Math.round(p.x - cx), Math.round(p.y - cy), p.size, p.size); }
  }
}
let moteT = 0, glintT = 0;
function ambientFX(z, dt) {
  if (REDUCED) return;
  const x0 = G.camX - 40, x1 = G.camX + VW + 40;
  for (let i = 0; i < World.emitters.length; i++) {              // embers climbing from every fire in view
    const e = World.emitters[i]; if (e.x < x0 || e.x > x1) continue;
    e.t -= dt;
    if (e.t <= 0) { e.t = .12 + Math.random() * .3; fxPix(e.x + (Math.random() - .5) * 10, e.y, (Math.random() - .5) * 14, -22 - Math.random() * 30, 1 + Math.random() * 1.4, PIX.gold4, PIX.ember3, 1, -6, 9); }
  }
  moteT -= dt;
  if (moteT <= 0) {                                              // dust hanging in the air
    moteT = .28;
    fxPix(G.camX + Math.random() * VW, G.camY + 40 + Math.random() * (VH - 120), (Math.random() - .5) * 6, 2 + Math.random() * 4, 3 + Math.random() * 3, PIX.soot4, PIX.stone3, 1, 0, 5);
  }
  glintT -= dt;
  if (glintT <= 0) {                                             // unread inscriptions call out
    glintT = 1.4;
    const ps = z.props;
    for (let i = 0; i < ps.length; i++) { const p = ps[i]; if (p.t === 'note' && !(p.cv ? G.flags[p.id] : G.notes[p.id]) && p.x > x0 && p.x < x1) fxSprite('fx_glint', p.x + (Math.random() - .5) * 14, p.sy + 8 + Math.random() * 12, 12, 0); }
  }
}

/* ---------------- actors (drawn twice: once lit, once as a mask for the emissive layer) ---------------- */
const SHYN_ANIM = Anim('shyn');
function drawActors(g, cx, cy, t, shadows) {
  const z = World.z, ps = z.props, pcx = P.x + P.w / 2, sk = Special.kind();
  for (let i = 0; i < ps.length; i++) {
    const p = ps[i]; if (p.t !== 'npc' || p.x - cx < -80 || p.x - cx > VW + 80 || (p.flag && !G.flags[p.flag])) continue;
    if (p.look === 'goblin') { Goblin.draw(g, p, cx, cy, t); continue; }
    if (p.id === 'resync' && Resync.drawProp(g, p, cx, cy, t)) continue;          // his farewell and the white flower (66-resync.js)
    if (shadows) spr(g, 'fx_shadow', p.x - 5 - cx, p.gy - 2 - cy, 0);
    if (p.anim) drawRig(g, p.anim, p.x - cx, p.gy - cy, pcx < p.x ? -1 : 1, lightSide);
    else Special.drawShade(g, p, i, cx, cy, t, false);
  }
  if (P.visible && P.anim) {
    const fx = Math.round(pcx) - cx, fy = Math.round(P.y + P.h) - cy;
    if (shadows && P.onGround) spr(g, 'fx_shadow', fx - 5, fy - 2, 0);
    if (sk !== 'meiko') Arsenal.draw(g, fx, fy, true);                                                      // the weapon on the back (64-weapons.js)
    drawRig(g, P.anim, fx, fy, P.face, lightSide, shadows && P.hurt > 0 && ((t * 16) | 0) % 2 === 0);
    if (sk !== 'meiko') Arsenal.draw(g, fx, fy, false);                                                     // the weapon in the hand, during the fight
  }
  const fr = World.front;
  for (let i = 0; i < fr.length; i++) { const it = fr[i]; if (it.x - cx > VW || it.x + it.w - cx < 0) continue; spr(g, it.s, it.x - cx, it.y - cy, it.n > 1 ? frameOf(it, t) : it.frame); }
}

/* ---------------- the frame ---------------- */
const frameOf = (it, t) => { const f = (((t * it.fps) | 0) * it.rev + it.ph) % it.n; return f < 0 ? f + it.n : f; };
let lightSide = 1;

function render() {
  const z = World.z, g = ctx;
  g.globalCompositeOperation = 'source-over';
  if (!z || !Art.kit) { g.fillStyle = '#040208'; g.fillRect(0, 0, VW, VH); return; }
  const t = G.time;
  let cx = Math.round(G.camX), cy = Math.round(G.camY);
  if (G.shake > .2 && !REDUCED) { const k = Calm() ? .25 : 1; cx += Math.round((Math.random() - .5) * G.shake * k); cy += Math.round((Math.random() - .5) * G.shake * k); }
  g.clearRect(0, 0, VW, VH);
  if (Override.term) {                                   // Round 9: the hall as a terminal (69-override.js) replaces the whole picture
    Override.render(g, cx, cy, t); Override.post(g, t);
    if (G.fade > 0) Dither.fill(g, 0, 0, VW, VH, PIX.void0, G.fade);
    return;
  }

  /* 1 · static world */
  const c0 = Math.max(0, Math.floor(cx / CHUNK)), c1 = Math.min(World.cw - 1, Math.floor((cx + VW - 1) / CHUNK));
  const r0 = Math.max(0, Math.floor(cy / CHUNK)), r1 = Math.min(World.ch - 1, Math.floor((cy + VH - 1) / CHUNK));
  for (let j = r0; j <= r1; j++) for (let i = c0; i <= c1; i++) g.drawImage(World.chunk(i, j).col, i * CHUNK - cx, j * CHUNK - cy);
  Puzzle.draw(g, cx, cy, t, false);
  Dojo.draw(g, cx, cy, t);
  /* 2 · animated decor */
  const dyn = World.dyn;
  for (let i = 0; i < dyn.length; i++) { const it = dyn[i]; if (it.x - cx > VW || it.x + it.w - cx < 0) continue; spr(g, it.s, it.x - cx, it.y - cy, frameOf(it, t)); }
  /* 3 · props */
  const ps = z.props, pcx = P.x + P.w / 2;
  for (let i = 0; i < ps.length; i++) {
    const p = ps[i]; if (p.x - cx < -120 || p.x - cx > VW + 120) continue;
    if (p.t === 'note') { const read = !!(p.cv ? G.flags[p.id] : G.notes[p.id]); p.light.on = read ? 0 : 1; spr(g, p.spr, p.sx - cx, p.sy - cy, read ? 1 : 0); }
    else if (p.t === 'door') { if (p.locked === 'mercy' && !G.flags.mercy) spr(g, 'door_leaf', p.leaf.x - cx, p.leaf.y - cy, 0); }
  }
  /* 4 · Shyn (rig: art-src/rigs/shyn — clips idle, cast, hurt, kneel follow BOSS.pose) + orbs */
  if (G.zone === 'arena') {
    const gy = World.groundNear(BOSS.x), a = SHYN_ANIM;
    if (G.meikoMeeting && BOSS.active) {
      const wantPose = (Dlg.on && Dlg.li >= 2) ? 'idle' : 'kneel';
      if (BOSS.pose !== wantPose) { BOSS.pose = wantPose; BOSS.repose = 1; }
    }
    const want = a.rig && a.rig.def.clips[BOSS.pose] ? BOSS.pose : 'idle';
    if (a.name !== want || BOSS.repose) { animPlay(a, want, true); BOSS.repose = 0; }
    animTick(a, Math.min(.05, Math.max(0, t - (a._t || t)))); a._t = t;
    if (!BOSS.hide) drawRig(g, a, Math.round(BOSS.x) - cx, gy - cy - (BOSS.lift | 0), BOSS.active ? (BOSS.face || -1) : (P.x + P.w / 2 < BOSS.x ? -1 : 1), -1, BOSS.flash > 0 || (BOSS.pose === 'hurt' && a.i === 0));
    if (G.meikoMeeting) Special.drawMeeting(g, cx, cy, gy, t, false);
  }
  /* 5 · NPCs, the Recruiter, the hollows, things in front of them, lit particles */
  Enemy.draw(g, cx, cy, t, true);
  drawActors(g, cx, cy, t, true);
  drawFX(1, cx, cy);

  /* 7 · darkness and light */
  const L = View.lg, sk = Special.kind();
  L.globalCompositeOperation = 'source-over';
  L.fillStyle = z.ambCss; L.fillRect(0, 0, VW, VH);
  L.globalCompositeOperation = 'lighter';
  const ls = World.lights, tick = (t * 9) | 0; let best = 1e9;
  for (let i = 0; i < ls.length; i++) {
    const l = ls[i]; if (!l.on) continue;
    const sx = l.x - cx, sy = l.y - cy; if (sx < -l.r || sx > VW + l.r || sy < -l.r || sy > VH + l.r) continue;
    const r = (!l.steady && !REDUCED && hash2(i, tick, 7) > .62) ? l.r - 6 : l.r;
    L.drawImage(Lights.sprite(r, l.c), sx - r, sy - r);
    const d = Math.abs(l.x - pcx) + Math.abs(l.y - P.y) * .5; if (d < best && l.c !== 'dim') { best = d; lightSide = l.x >= pcx ? 1 : -1; }
  }
  if (P.visible) {
    const lx = Math.round(pcx) - cx, ly = Math.round(P.y + 12) - cy;
    if (sk === 'meiko') {
      const r1 = (!REDUCED && (tick & 1)) ? 162 : 168, r2 = 90;
      L.drawImage(Lights.sprite(r1, 'gold'), lx - r1, ly - 6 - r1);
      L.drawImage(Lights.sprite(r2, 'fire'), lx - r2, ly - 8 - r2);
    } else if (sk === 'miku') {
      const pr = G.zone === 'arena' ? 104 : 76;
      L.drawImage(Lights.sprite(pr, 'cold'), lx - pr, ly - pr);
    } else {
      const pr = G.zone === 'arena' ? 96 : 56;
      L.drawImage(Lights.sprite(pr, G.zone === 'arena' ? 'rune' : 'dim'), lx - pr, ly + 2 - pr);
    }
  }
  L.globalCompositeOperation = 'destination-in'; L.drawImage(cv, 0, 0);
  g.globalCompositeOperation = 'multiply'; g.drawImage(View.L, 0, 0);

  /* 8 · emissive: runes, flames and cores ignore the darkness. They are gathered on their own layer
         and the actors are punched out of it, so a fire BEHIND someone never draws over them. */
  const E = View.eg; g.globalCompositeOperation = 'source-over';
  E.globalCompositeOperation = 'source-over'; E.clearRect(0, 0, VW, VH);
  for (let j = r0; j <= r1; j++) for (let i = c0; i <= c1; i++) { const e = World.chunk(i, j).emi; if (e) E.drawImage(e, i * CHUNK - cx, j * CHUNK - cy); }
  for (let i = 0; i < dyn.length; i++) { const it = dyn[i]; if (!it.e || it.x - cx > VW || it.x + it.w - cx < 0) continue; sprE(E, it.s, it.x - cx, it.y - cy, frameOf(it, t)); }
  for (let i = 0; i < ps.length; i++) { const p = ps[i]; if (p.t === 'note' && !(p.cv ? G.flags[p.id] : G.notes[p.id]) && p.x - cx > -80 && p.x - cx < VW + 80) sprE(E, p.spr, p.sx - cx, p.sy - cy, 0); }
  Puzzle.draw(E, cx, cy, t, true);
  Special.backGlow(E, cx, cy, t);
  E.globalCompositeOperation = 'destination-out'; drawActors(E, cx, cy, t, false);
  E.globalCompositeOperation = 'source-over';
  for (let i = 0; i < ps.length; i++) {
    const p = ps[i];
    if (p.t === 'npc' && !p.anim && p.look !== 'goblin' && !(p.flag && !G.flags[p.flag]) && p.x - cx >= -80 && p.x - cx <= VW + 80) {
      Special.drawShade(E, p, i, cx, cy, t, true);
    }
  }
  if (P.visible && P.anim && sk !== 'meiko') {
    const fx = Math.round(pcx) - cx, fy = Math.round(P.y + P.h) - cy;
    Arsenal.draw(E, fx, fy, true, true);
    Arsenal.draw(E, fx, fy, false, true);
  }
  if (G.zone === 'arena' && G.meikoMeeting) Special.drawMeeting(E, cx, cy, World.groundNear(BOSS.x), t, true);
  Special.glow(E, cx, cy, t); Goblin.drawE(E, cx, cy, t); Resync.drawE(E, cx, cy, t);      // his candle and the coin glow; the white flower
  g.drawImage(View.E, 0, 0);
  Enemy.draw(g, cx, cy, t, false);                                                                                    // the hollows over the lit picture
  if (G.zone === 'arena') { Fight.draw(g, cx, cy, t); Ally.draw(g, cx, cy, t); } else Combat.draw(g, cx, cy, t);      // blows glow in every hall
  Ward.draw(g, cx, cy);
  Dojo.drawCounter(g, cx, cy);
                              // everything that hurts, and the Recruiter's own blows: drawn over the light, so they glow

  /* 9 · far planes go in behind everything drawn so far */
  g.globalCompositeOperation = 'destination-over';
  const px = z.parallax || [], maxY = Math.max(0, World.H - VH);
  for (let i = px.length - 1; i >= 0; i--) {
    const p = px[i], im = Art.px[p.img]; if (!im) continue;
    const y = p.y + Math.round((maxY - cy) * p.fy);
    let x = -Math.round(cx * p.fx) % im.width; if (x > 0) x -= im.width;
    for (; x < VW; x += im.width) g.drawImage(im, x, y);
  }
  skyBuild(z); g.drawImage(View.sky, 0, 0);

  /* 10 · over everything */
  g.globalCompositeOperation = 'source-over';
  drawFX(0, cx, cy);
  const fg = World.fg;
  for (let i = 0; i < fg.length; i++) {
    const it = fg[i], sx = Math.round(it.x - cx * it.f), sy = Math.round(it.y - cy * (it.fy == null ? it.f : it.fy));     // fy: 0 pins a foreground piece to the screen vertically
    if (sx > VW || sx + it.w < 0) continue;
    spr(g, it.s, sx, sy, it.n > 1 ? ((t * 5) | 0) + it.ph : 0);
  }
  g.drawImage(View.vig, 0, 0);
  if (P.visible && Tag.cv && !Dlg.on && (G.scene === 'world' || G.scene === 'boss') && P.anim && P.anim.rig) {
    g.drawImage(Tag.cv, Math.round(pcx) - cx - (Tag.cv.width >> 1), Math.round(P.y + P.h) - cy + P.anim.rig.def.meta.headTop - 10);
  }
  Override.post(g, t);                                                         // Round 9: the picture breaks before the terminal phase, and heals after it
  Goblin.over(g);                                                              // the screen cracks, then goes dark
  if (G.flash > 0) Dither.fill(g, 0, 0, VW, VH, PIX.rune4, REDUCED ? 0 : G.flash * .5);
  if (G.fade > 0) Dither.fill(g, 0, 0, VW, VH, PIX.void0, G.fade);
}

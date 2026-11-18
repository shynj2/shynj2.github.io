// WEAPONS & COMBAT ARCS — high-detail pixel-art arsenal for Veyrath.
//   wi_<id>  32x32 ornate inventory/HUD icon
//   w_<id>   12 rotated frames (72x72, step 30°; grip at centre (36, 36))
//   Plus bespoke Light, Heavy, Dash, Flurry, Chi-Palm, Quake-Wave, Comet, Cross & Sky-Glyph FX!
import { Img, c } from '../../tools/lib/pix.mjs';

const K   = c('void1');
const i0 = c('iron0'), i1 = c('iron1'), i2 = c('iron2'), i3 = c('iron3');
const b2 = c('bone2'), b3 = c('bone3'), b4 = c('bone4');
const g0 = c('gold0'), g1 = c('gold1'), g2 = c('gold2'), G3 = c('gold3', 'e'), G4 = c('gold4', 'e');
const e0 = c('ember0'), e1 = c('ember1'), e2 = c('ember2'), E3 = c('ember3', 'e'), E4 = c('ember4', 'e');
const r1 = c('rune1'), R2 = c('rune2', 'e'), R3 = c('rune3', 'e'), R4 = c('rune4', 'e'), R5 = c('rune5', 'e');
const s1 = c('soot1'), s2 = c('soot2'), s3 = c('soot3');
const c1 = c('cold1'), c2 = c('cold2'), C3E = c('cold3', 'e'), C4E = c('cold4', 'e');

const KEEP_OWN_OL = new Set([G4, R4, R5, E4, C4E]);
function outline(im) {
  const w = im.w, h = im.h, add = [];
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    if (im.get(x, y)) continue;
    let nb = 0, bright = false;
    for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) {
      const v = im.get(x + dx, y + dy);
      if (v) { nb++; if (KEEP_OWN_OL.has(v)) bright = true; }
    }
    if (nb && !bright) add.push([x, y]);
  }
  for (const [x, y] of add) im.set(x, y, K);
  return im;
}

function rot(src, deg, gx, gy, N = 72) {
  const out = new Img(N, N), a = deg * Math.PI / 180, ca = Math.cos(a), sa = Math.sin(a), cx = N >> 1, cy = N >> 1;
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
    const dx = x - cx, dy = y - cy;
    const sx = Math.round(gx + dx * ca + dy * sa), sy = Math.round(gy - dx * sa + dy * ca);
    const v = src.get(sx, sy); if (v) out.set(x, y, v);
  }
  return outline(out);
}
const spin = (src, gx, gy) => Array.from({ length: 12 }, (_, k) => rot(src, k * 30, gx, gy));

function flipX(im) {
  const o = new Img(im.w, im.h);
  for (let y = 0; y < im.h; y++) for (let x = 0; x < im.w; x++) o.set(im.w - 1 - x, y, im.get(x, y));
  return o;
}

function makeIcon(src, gx, gy, accentFn) {
  const ic = new Img(32, 32), a = -Math.PI / 4, ca = Math.cos(a), sa = Math.sin(a);
  if (accentFn) accentFn(ic);
  for (let y = 1; y < 31; y++) for (let x = 1; x < 31; x++) {
    const dx = (x - 16) * 1.24, dy = (y - 16) * 1.24;
    const sx = Math.round(gx + 10 + dx * ca + dy * sa), sy = Math.round(gy - dx * sa + dy * ca);
    const v = src.get(sx, sy); if (v) ic.set(x, y, v);
  }
  return outline(ic);
}

/* ============================================================================
   ALL 7 WEAPONS — authored pointing right (+X), grip at (gx=8, gy=9) in 48x19
   ============================================================================ */
const GX = 8, GY = 9;

// 1. KATANA — Moon-steel uchigatana with wavy hamon temper line, diamond-wrapped crimson tsuka, golden tsuba & pommel tassel
function drawKatana() {
  const t = new Img(48, 19);
  // Crimson pommel tassel + kashira cap
  t.set(0, 11, E3); t.set(1, 10, e2); t.set(1, 11, E3); t.set(2, 9, G3);
  // Tsuka (crimson silk ito diamond-wrap over rayskin)
  for (let x = 3; x <= 9; x++) {
    t.set(x, 8, (x & 1) ? E3 : b3);
    t.set(x, 9, (x & 1) ? e1 : E3);
    t.set(x, 10, e0);
  }
  // Ornate gilded tsuba handguard + brass habaki collar
  t.rect(10, 5, 2, 9, g2); t.set(10, 5, G3); t.set(10, 13, g0); t.set(11, 9, G4);
  t.rect(12, 8, 2, 3, G3); t.set(12, 10, g1);
  // Gracefully curved single-edged blade with gleaming hamon wave & spine fuller
  for (let x = 14; x < 45; x++) {
    const u = (x - 14) / 30;
    const curve = Math.round(u * u * 2.6);
    const yTop = 8 - curve;
    t.set(x, yTop, b4);                                          // razor cutting edge (ha)
    t.set(x, yTop + 1, (x % 4 < 2) ? C4E : b3);                  // wavy hamon temper line
    if (x < 42) t.set(x, yTop + 2, i2);                          // blade body (shinogi)
    if (x < 37) t.set(x, yTop + 3, i1);                          // dark spine (mune)
  }
  // Kissaki (chiseled point)
  t.set(45, 5, b4); t.set(46, 5, C4E); t.set(45, 6, b3);
  return t;
}

// 2. CRUSADER GREATSWORD — Sacred Templar broadsword with winged golden cross-guard, ruby gem & glowing rune fuller
function drawCrusader() {
  const t = new Img(48, 19);
  // Wheel pommel with ruby heart
  t.rect(1, 7, 3, 5, g2); t.set(1, 7, G3); t.set(2, 9, E4); t.set(3, 11, g0);
  // Cord-wrapped leather two-handed grip
  for (let x = 4; x <= 10; x++) {
    t.set(x, 8, (x & 1) ? s3 : s2);
    t.set(x, 9, s2);
    t.set(x, 10, s1);
  }
  // Swept winged golden cross-guard with central sacred ruby
  t.rect(11, 3, 3, 13, g2);
  t.set(10, 2, G3); t.set(11, 2, G4); t.set(10, 16, g1); t.set(11, 16, g2);
  t.line(11, 3, 11, 15, G3);
  t.rect(11, 8, 3, 3, G4); t.set(12, 9, E4);
  // Gilded ricasso collar
  t.rect(14, 7, 4, 5, g1); t.rect(14, 7, 4, 1, G3); t.rect(14, 9, 4, 1, G4);
  // Broad double-edged steel blade with glowing golden-rune fuller
  for (let x = 18; x < 43; x++) {
    t.set(x, 6, b4);
    t.set(x, 7, b3);
    t.set(x, 8, i3);
    t.set(x, 9, (x % 3 === 0) ? G4 : (x % 3 === 1 ? G3 : g1));   // inscribed sacred runes
    t.set(x, 10, i2);
    t.set(x, 11, i1);
    t.set(x, 12, i3);
  }
  // Tapered diamond point
  t.rect(43, 7, 2, 5, b3); t.set(43, 7, b4); t.set(43, 9, G3);
  t.rect(45, 8, 2, 3, b4); t.set(47, 9, b4);
  return t;
}

// 3. GREAT HAMMER — Colossal Rune-Forged Anvil Warhammer with molten rune core & armor-piercing top spike
function drawHammer() {
  const t = new Img(48, 19);
  // Counterweight brass pommel ring
  t.rect(1, 8, 3, 3, g2); t.set(1, 8, G3);
  // Brass-banded heavy ironwood haft
  for (let x = 4; x < 30; x++) {
    const band = (x === 10 || x === 18 || x === 26);
    t.set(x, 8, band ? G3 : s3);
    t.set(x, 9, band ? g2 : s2);
    t.set(x, 10, band ? g0 : s1);
  }
  // Colossal twin-faced warhammer head (x=28..43, y=1..17)
  t.rect(28, 2, 15, 15, i1);
  t.rect(28, 2, 15, 2, i3); t.rect(29, 1, 13, 1, b3);            // upper bevel
  t.rect(28, 15, 15, 2, i0); t.rect(29, 17, 13, 1, i0);          // lower shadow bevel
  // Heavy striking face (right) + back armor-spike (top/left)
  t.rect(42, 3, 3, 13, g2); t.line(43, 3, 43, 15, G3); t.line(44, 4, 44, 14, G4);
  t.rect(26, 4, 2, 11, g2); t.line(26, 4, 26, 14, G3);
  // Gilded corner brackets
  t.rect(29, 3, 3, 2, G3); t.rect(29, 14, 3, 2, g1);
  t.rect(39, 3, 3, 2, G3); t.rect(39, 14, 3, 2, g1);
  // Blazing Rune-Furnace Core in the center of the anvil head
  t.rect(32, 6, 7, 7, r1);
  t.rect(33, 7, 5, 5, R3);
  t.rect(34, 8, 3, 3, R4);
  t.set(35, 9, R5); t.set(33, 9, G4); t.set(37, 9, G4); t.set(35, 7, R4); t.set(35, 11, R4);
  // Forward spike tip
  t.rect(45, 8, 2, 3, G3); t.set(46, 9, b4);
  return t;
}

// 4. ARCHMAGE STAFF — Spiral-bound Spire-Staff with twin golden astrolabe rings & levitating star-crystal
function drawStaff() {
  const t = new Img(48, 19);
  // Pointed brass butt-cap with rune bead
  t.set(1, 9, G3); t.rect(2, 8, 3, 3, g2); t.set(3, 8, G3);
  // Spiral gold-ribboned darkwood shaft + trailing violet talisman ribbon
  for (let x = 5; x < 33; x++) {
    const goldWrap = (x % 5 === 0);
    t.set(x, 8, goldWrap ? G3 : s3);
    t.set(x, 9, goldWrap ? g2 : s2);
    t.set(x, 10, goldWrap ? g1 : s1);
  }
  // Flowing rune-silk ribbon beneath the collar
  t.line(30, 11, 25, 15, R3); t.line(31, 11, 27, 16, R2); t.set(25, 15, R4); t.set(27, 16, G3);
  // Ornate gilded lotus collar
  t.rect(32, 6, 3, 7, g2); t.line(32, 6, 34, 6, G3); t.set(33, 9, G4);
  // Twin golden astrolabe crescents cradling a levitating star-crystal
  t.ring(40, 9, 5.5, 7.2, g2);
  t.ring(40, 9, 6.2, 7.2, G3, -Math.PI * 0.85, Math.PI * 0.25);
  t.set(47, 9, G4); t.set(40, 2, G4); t.set(40, 16, g1);
  // Levitating radiant arcane crystal core
  t.poly([[40, 5], [44, 9], [40, 13], [36, 9]], R3);
  t.poly([[40, 6], [43, 9], [40, 12], [37, 9]], R4);
  t.rect(39, 8, 3, 3, R5); t.set(40, 9, C4E);
  return t;
}

// 5. TWIN DAGGERS — Curved assassin stiletto-kama with S-guard, crimson grip & glowing rune-venom edge
function drawDaggers() {
  const t = new Img(48, 19);
  // Ringed assassin pommel
  t.ring(3, 9, 1.2, 2.2, G3);
  // Crimson cord-wrapped grip
  for (let x = 5; x <= 10; x++) {
    t.set(x, 8, (x & 1) ? E3 : e1);
    t.set(x, 9, e2);
    t.set(x, 10, e0);
  }
  // Swept S-curved gilded guard
  t.line(11, 4, 12, 9, G3); t.line(12, 9, 13, 14, g2);
  t.set(10, 4, G4); t.set(14, 14, G3); t.set(12, 9, R4);
  // Wickedly curved hollow-ground dagger blade with violet rune-etched fuller
  for (let x = 13; x < 35; x++) {
    const u = (x - 13) / 21;
    const cy = 9 - Math.round(Math.sin(u * Math.PI * 0.85) * 1.6);
    t.set(x, cy - 2, b4);                                        // razor top edge
    t.set(x, cy - 1, b3);
    t.set(x, cy, (x % 3 === 0) ? R5 : R3);                       // glowing venom-rune fuller
    if (x < 31) t.set(x, cy + 1, i2);
    if (x < 27) t.set(x, cy + 2, b3);                            // lower twin cutting edge
  }
  t.set(35, 7, b4); t.set(36, 7, R5); t.set(37, 6, b4);
  return t;
}

// 6. HAPKIDO DRAGON GAUNTLETS — Articulated bronze/gold martial cestus with crimson wrist-wraps & blazing chi-focus gem
function drawGauntlets() {
  const t = new Img(48, 19);
  // Crimson martial cloth wraps around forearm (x=3..8)
  for (let x = 3; x <= 8; x++) {
    t.set(x, 6, (x & 1) ? E3 : e2);
    t.rect(x, 7, 1, 5, (x & 1) ? e2 : e1);
    t.set(x, 12, e0);
  }
  // Articulated steel-and-gold vambrace cuff + dragon-scale knuckle plates (x=8..23, centered over hand!)
  t.rect(8, 5, 14, 9, i2);
  t.rect(8, 5, 14, 2, G3); t.rect(8, 12, 14, 2, g0);
  for (const px of [10, 14, 18]) {
    t.line(px, 5, px, 13, g2);
    t.set(px + 1, 6, G4);
  }
  // Blazing Chi-Core Gem set into the back of the gauntlet
  t.rect(13, 7, 5, 5, g1);
  t.rect(14, 8, 3, 3, E4); t.set(15, 9, G4);
  // Heavy spiked gold knuckle-guard & impact studs (x=21..26)
  t.rect(21, 5, 3, 9, G3); t.line(23, 5, 23, 13, G4);
  for (const ky of [5, 7, 9, 11, 13]) { t.set(24, ky, G4); t.set(25, ky, b4); }
  t.set(26, 9, G4);
  return t;
}

// 7. MIKU'S HARMONIC VOX-LANCE (preserved & crisp)
function drawMicrophone() {
  const t = new Img(48, 19);
  t.rect(2, 8, 2, 3, C3E); t.set(1, 9, C4E);
  t.rect(4, 7, 18, 4, i1); t.rect(4, 7, 18, 1, i3); t.rect(4, 10, 18, 1, i0);
  t.rect(9, 7, 2, 4, C3E); t.set(9, 7, C4E);
  t.rect(15, 7, 2, 4, E3); t.set(15, 7, E4);
  t.poly([[20, 7], [24, 3], [27, 3], [23, 8]], C3E);
  t.line(21, 7, 25, 3, C4E);
  t.poly([[20, 11], [24, 15], [27, 15], [23, 10]], C3E);
  t.line(21, 11, 25, 15, i2);
  t.rect(22, 6, 3, 6, g2); t.rect(22, 6, 3, 1, G3); t.set(23, 8, E4); t.set(23, 9, E3);
  t.ellipse(30, 9, 6, 5, i2); t.ellipse(29, 8, 5, 4, i3);
  for (let y = 5; y <= 13; y += 2) for (let x = 26; x <= 34; x += 2) {
    if (Math.hypot((x - 30) / 6, (y - 9) / 5) <= 0.9) t.set(x, y, (x + y) % 4 === 0 ? b4 : i1);
  }
  t.rect(29, 4, 2, 10, C3E); t.set(29, 5, C4E); t.set(29, 6, C4E);
  t.set(37, 6, C4E); t.set(38, 7, C4E); t.set(39, 9, C4E); t.set(38, 11, C4E); t.set(37, 12, C4E);
  return t;
}

/* ============================================================================
   BESPOKE LIGHT, HEAVY & WEAPON-SPECIFIC COMBAT FX
   ============================================================================ */

// Upgraded Light Slash Crescent (46x40, 3 frames): crisp steel-and-rune blade arc with trailing sparks
function makeLightSlash() {
  return [0, 1, 2].map((f) => {
    const t = new Img(46, 40);
    const a0 = [-1.25, -1.0, -0.55][f], a1 = [0.65, 1.15, 1.35][f];
    for (let k = 0; k <= 96; k++) {
      const u = k / 96, a = a0 + (a1 - a0) * u;
      const bell = Math.sin(u * Math.PI);
      const th = (f === 0 ? 5.5 : f === 1 ? 4.2 : 2.4) * bell;
      for (let dr = 0; dr <= th; dr += 0.5) {
        const r = 21 - dr, x = Math.round(9 + Math.cos(a) * r * 1.48), y = Math.round(20 + Math.sin(a) * r * 0.92);
        t.set(x, y, dr < 1.1 ? b4 : dr < 2.3 ? R5 : dr < 3.6 ? R4 : R2);
      }
    }
    // Motion speed-streaks & tip glints
    if (f < 2) {
      t.line(24, 9 + f * 3, 41, 12 + f * 4, R4);
      t.set(42, 12 + f * 4, b4); t.set(38, 26 - f * 2, R5);
    } else {
      for (const [sx, sy] of [[36, 26], [31, 31], [40, 20], [26, 34]]) t.set(sx, sy, R4);
    }
    return outline(t);
  });
}

// NEW Heavy Attack Double-Crescent Cleave (62x54, 4 frames): massive blazing gold-and-violet shock-cleave!
function makeHeavySlash() {
  return [0, 1, 2, 3].map((f) => {
    const t = new Img(62, 54);
    const a0 = [-1.4, -1.25, -0.85, -0.35][f], a1 = [0.55, 1.15, 1.42, 1.48][f];
    // Outer blazing golden-rune shockwave crescent
    for (let k = 0; k <= 120; k++) {
      const u = k / 120, a = a0 + (a1 - a0) * u;
      const bell = Math.sin(u * Math.PI);
      const th = [8.5, 9.5, 6.5, 3.2][f] * bell;
      const jag = ((k % 9 === 0) && f < 3) ? 2.5 : 0;
      for (let dr = -jag; dr <= th; dr += 0.5) {
        const r = 29 - dr, x = Math.round(10 + Math.cos(a) * r * 1.58), y = Math.round(27 + Math.sin(a) * r * 0.92);
        const col = dr < 1.0 ? G4 : dr < 2.6 ? R5 : dr < 4.8 ? G3 : dr < 6.8 ? R4 : R2;
        t.set(x, y, col);
      }
    }
    // Inner secondary crimson-violet echo crescent
    if (f <= 2) {
      for (let k = 0; k <= 70; k++) {
        const u = k / 70, a = (a0 + 0.18) + (a1 - a0 - 0.3) * u;
        const th = 2.6 * Math.sin(u * Math.PI);
        for (let dr = 0; dr <= th; dr += 0.6) {
          const r = 17 - dr, x = Math.round(10 + Math.cos(a) * r * 1.45), y = Math.round(27 + Math.sin(a) * r * 0.86);
          t.set(x, y, dr < 1 ? E4 : R3);
        }
      }
    }
    // Impact star-sparks flying off the heavy edge
    const sparks = [
      [[48, 12], [55, 22], [52, 32]],
      [[54, 16], [59, 27], [53, 39], [44, 45]],
      [[56, 24], [51, 38], [42, 46], [33, 49]],
      [[48, 36], [39, 45], [29, 48]],
    ][f];
    for (const [sx, sy] of sparks) {
      t.set(sx, sy, G4); t.set(sx - 1, sy, G3); t.set(sx + 1, sy, R5);
      t.set(sx, sy - 1, G3); t.set(sx, sy + 1, E3);
    }
    return outline(t);
  });
}

// NEW Katana Iaijutsu Speed-Cut Streak (68x26, 3 frames) for Katana Heavy & Special Dash!
function makeKatanaDash() {
  return [0, 1, 2].map((f) => {
    const t = new Img(68, 26);
    const y0 = 13;
    const xStart = [2, 6, 18][f], xEnd = [62, 66, 65][f];
    const halfH = [4, 3, 1.5][f];
    for (let x = xStart; x <= xEnd; x++) {
      const u = (x - xStart) / Math.max(1, xEnd - xStart);
      const hh = halfH * Math.sin(u * Math.PI);
      for (let dy = -Math.ceil(hh); dy <= Math.ceil(hh); dy++) {
        if (Math.abs(dy) <= hh) {
          const ad = Math.abs(dy);
          t.set(x, y0 + dy, ad < 0.8 ? b4 : ad < 1.8 ? C4E : ad < 2.8 ? E3 : R3);
        }
      }
    }
    // Cross glint near the blade tip
    const gx = [54, 60, 62][f];
    t.line(gx - 5, y0 - 6 + f, gx + 4, y0 + 6 - f, C4E);
    t.line(gx - 4, y0 + 5 - f, gx + 5, y0 - 5 + f, b4);
    if (f < 2) { t.line(10 + f * 8, y0 - 5, 42 + f * 8, y0 - 3, E4); t.line(14 + f * 8, y0 + 5, 46 + f * 6, y0 + 3, C3E); }
    return outline(t);
  });
}

// NEW Daggers Twin Criss-Cross X-Flurry (46x38, 3 frames)
function makeDaggerFlurry() {
  return [0, 1, 2].map((f) => {
    const t = new Img(46, 38);
    // Slash 1 (down-right crimson/white)
    if (f <= 1) {
      for (let k = 0; k <= 40; k++) {
        const u = k / 40, x = Math.round(6 + u * 35), y = Math.round(5 + u * 27 + Math.sin(u * Math.PI) * -3);
        const w = Math.round(Math.sin(u * Math.PI) * (f === 0 ? 3 : 2));
        for (let d = -w; d <= w; d++) t.set(x, y + d, d === 0 ? b4 : Math.abs(d) === 1 ? E4 : E3);
      }
    }
    // Slash 2 (up-right violet/silver)
    if (f >= 1) {
      for (let k = 0; k <= 40; k++) {
        const u = k / 40, x = Math.round(6 + u * 36), y = Math.round(33 - u * 27 + Math.sin(u * Math.PI) * 3);
        const w = Math.round(Math.sin(u * Math.PI) * (f === 1 ? 3 : 2));
        for (let d = -w; d <= w; d++) t.set(x, y + d, d === 0 ? b4 : Math.abs(d) === 1 ? R5 : R3);
      }
    }
    // X-intersection flash
    if (f === 1) { t.rect(22, 17, 4, 4, b4); t.set(20, 18, E4); t.set(27, 18, R5); }
    return outline(t);
  });
}

// NEW Gauntlets Golden Chi-Palm Shockwave Burst (42x38, 3 frames)
function makeChiPalm() {
  return [0, 1, 2].map((f) => {
    const t = new Img(42, 38);
    const cx = 18 + f * 4, cy = 19, rx = [8, 12, 15][f], ry = [11, 15, 17][f];
    // Expanding golden martial shockwave ring
    for (let a = -1.35; a <= 1.35; a += 0.04) {
      const th = f === 2 ? 1.5 : 3.2;
      for (let dr = 0; dr < th; dr += 0.6) {
        const x = Math.round(cx + Math.cos(a) * (rx - dr)), y = Math.round(cy + Math.sin(a) * (ry - dr));
        t.set(x, y, dr < 1 ? G4 : dr < 2 ? G3 : E3);
      }
    }
    // Impact fist-star burst in frames 0..1
    if (f < 2) {
      t.line(6, cy, cx + 6, cy, G4, 2);
      t.line(cx - 4, cy - 6, cx + 5, cy + 6, E4);
      t.line(cx - 4, cy + 6, cx + 5, cy - 6, G4);
      t.ellipse(cx, cy, 4 - f, 4 - f, b4);
    }
    return outline(t);
  });
}

// NEW Hammer Molten Rune Quake-Wave (30x28, 4 frames) — erupting stone & golden rune-fire spikes!
function makeQuakeWave() {
  return [0, 1, 2, 3].map((f) => {
    const t = new Img(30, 28);
    const spikes = [
      [[7, 14, 5], [15, 22, 7], [23, 12, 4]],
      [[6, 10, 4], [14, 25, 8], [22, 18, 6]],
      [[8, 16, 5], [16, 23, 7], [24, 14, 5]],
      [[7, 12, 4], [15, 19, 6], [22, 10, 4]],
    ][f];
    for (const [sx, hgt, hw] of spikes) {
      t.poly([[sx - hw, 26], [sx, 26 - hgt], [sx + hw, 26]], g1);
      t.poly([[sx - hw + 1, 26], [sx, 27 - hgt], [sx + hw - 1, 26]], G3);
      t.line(sx, 27 - hgt, sx, 25, G4);
      t.set(sx, 26 - hgt, b4);
      if (hgt > 16) { t.set(sx - 1, 26 - (hgt >> 1), R5); t.set(sx + 1, 26 - (hgt >> 1), E4); }
    }
    t.rect(2, 25, 26, 2, G3); t.line(4, 26, 25, 26, E3);
    return outline(t);
  });
}

// NEW Staff Heavy Piercing Star-Comet (30x18, 4 frames)
function makeComet() {
  return [0, 1, 2, 3].map((f) => {
    const t = new Img(30, 18);
    // Spiraling violet-cyan comet tail
    for (let x = 2; x < 21; x++) {
      const u = x / 21;
      const wy = Math.round(Math.sin(u * 5 + f * 1.6) * 2.2 * (1 - u * 0.5));
      const hh = Math.max(1, Math.round(u * 3.5));
      for (let dy = -hh; dy <= hh; dy++) {
        t.set(x, 9 + wy + dy, Math.abs(dy) === 0 ? R5 : Math.abs(dy) === 1 ? R4 : R2);
      }
    }
    // Radiant diamond star-head
    t.ellipse(22, 9, 5, 5, R3);
    t.ellipse(22, 9, 3.5, 3.5, R4);
    t.rect(21, 8, 3, 3, R5); t.set(22, 9, C4E);
    t.line(22, 2, 22, 16, R5); t.line(16, 9, 28, 9, b4);
    return outline(t);
  });
}

// Upgraded Crusader Sacred Cross Wave (34x52, 4 frames)
function makeCrossWave() {
  return [0, 1, 2, 3].map((f) => {
    const t = new Img(34, 52), bob = f & 1;
    // Radiant golden-rune halo ring behind the cross
    t.ring(17, 20 + bob, 9, 11, (f & 1) ? G3 : R3);
    // Vertical & horizontal sacred cross blades
    t.poly([[17, 2 + bob], [21, 9 + bob], [20, 46 + bob], [17, 50 + bob], [14, 46 + bob], [13, 9 + bob]], G3);
    t.poly([[3, 20 + bob], [9, 16 + bob], [25, 16 + bob], [31, 20 + bob], [25, 24 + bob], [9, 24 + bob]], G3);
    t.rect(16, 5 + bob, 3, 42, G4);
    t.rect(6, 19 + bob, 22, 3, G4);
    t.rect(15, 18 + bob, 5, 5, b4); t.set(17, 20 + bob, E4);
    if (f % 2 === 0) { t.set(8, 10, R5); t.set(26, 10, G4); t.set(9, 34, G4); t.set(25, 34, R5); }
    else { t.set(7, 13, G4); t.set(27, 13, R5); t.set(11, 38, R5); t.set(23, 38, G4); }
    return outline(t);
  });
}

// NEW Staff Special Sky-Glyph Ground Ring (48x14, 4 frames) & Celestial Pillar (26x88, 3 frames)
function makeGlyphRing() {
  return [0, 1, 2, 3].map((f) => {
    const t = new Img(48, 14);
    t.ellipse(24, 7, 22, 5, r1);
    t.ring(24, 7, 19, 22, (f & 1) ? R4 : R3);
    t.ring(24, 7, 10, 12, (f & 1) ? G3 : R4);
    for (let k = 0; k < 8; k++) {
      const a = (k / 8) * Math.PI * 2 + f * 0.4;
      const x = Math.round(24 + Math.cos(a) * 16), y = Math.round(7 + Math.sin(a) * 3.8);
      t.rect(x - 1, y - 1, 2, 2, (k & 1) ? R5 : G4);
    }
    return outline(t);
  });
}

function makeGlyphBeam() {
  return [0, 1, 2].map((f) => {
    const t = new Img(26, 88);
    const hw = [9, 7, 4][f];
    for (let y = 0; y < 88; y++) {
      const flare = y > 74 ? Math.round((y - 74) * 0.35) : 0;
      const w = hw + flare;
      for (let dx = -w; dx <= w; dx++) {
        const ad = Math.abs(dx);
        const spiral = Math.round(Math.sin(y * 0.18 + f * 2) * (w * 0.65));
        let col = ad < w * 0.32 ? b4 : ad < w * 0.58 ? R5 : ad < w * 0.82 ? R4 : R2;
        if (dx === spiral) col = G4;
        t.set(13 + dx, y, col);
      }
    }
    return outline(t);
  });
}

// Miku's Harmonic FX (preserved)
function makeMikuSlash() {
  return [0, 1, 2].map((f) => {
    const t = new Img(48, 42);
    const a0 = [-1.2, -0.95, -0.5][f], a1 = [0.6, 1.1, 1.3][f];
    for (let k = 0; k <= 90; k++) {
      const u = k / 90, a = a0 + (a1 - a0) * u;
      const th = (f === 0 ? 6 : f === 1 ? 4.5 : 2.5) * Math.sin(u * Math.PI);
      for (let dr = 0; dr <= th; dr += 0.6) {
        const r = 21 - dr, x = Math.round(10 + Math.cos(a) * r * 1.45), y = Math.round(21 + Math.sin(a) * r * 0.9);
        t.set(x, y, dr < 1.3 ? C4E : dr < 2.8 ? C3E : dr < 4.2 ? E4 : c2);
      }
    }
    if (f < 2) {
      const sx = f === 0 ? 34 : 38, sy = f === 0 ? 11 : 25;
      t.set(sx, sy, b4); t.set(sx - 1, sy, C4E); t.set(sx + 1, sy, C4E); t.set(sx, sy - 1, C4E); t.set(sx, sy + 1, E4);
    }
    return outline(t);
  });
}

function makeNotes() {
  const mk = (fn) => { const t = new Img(16, 16); fn(t); return outline(t); };
  return [
    mk((t) => {
      t.ellipse(6, 11, 3, 2, C3E); t.ellipse(6, 11, 2, 1, C4E);
      t.rect(8, 3, 2, 8, C4E);
      t.line(9, 3, 13, 5, E4); t.line(9, 4, 13, 6, E3); t.line(13, 5, 12, 8, E3);
    }),
    mk((t) => {
      t.ellipse(4, 12, 2, 2, C3E); t.set(4, 12, C4E);
      t.ellipse(11, 10, 2, 2, C3E); t.set(11, 10, C4E);
      t.rect(5, 4, 2, 8, C4E); t.rect(12, 2, 2, 8, C4E);
      t.line(5, 4, 13, 2, E4); t.line(5, 5, 13, 3, C3E);
    }),
    mk((t) => {
      t.ellipse(6, 11, 3, 2, E3); t.ellipse(6, 11, 2, 1, E4);
      t.rect(8, 3, 2, 8, E4);
      t.line(9, 3, 13, 5, C4E); t.line(9, 4, 13, 6, C3E);
      t.set(3, 5, C4E); t.set(13, 11, G4);
    }),
    mk((t) => {
      t.line(7, 2, 7, 13, C4E); t.line(8, 2, 8, 13, C3E);
      t.ellipse(8, 5, 3, 2, C3E); t.set(9, 5, b4);
      t.ellipse(7, 10, 3, 2, E3); t.set(6, 10, E4);
    }),
  ];
}

function makeSonicWave() {
  return [0, 1, 2].map((f) => {
    const t = new Img(28, 36);
    for (let ring = 0; ring < 2; ring++) {
      const r = 9 + ring * 6 + f * 1.5;
      for (let a = -1.15; a <= 1.15; a += 0.05) {
        const x = Math.round(6 + Math.cos(a) * r), y = Math.round(18 + Math.sin(a) * r * 1.15);
        t.set(x, y, ring === 0 ? C4E : E4);
        t.set(x - 1, y, ring === 0 ? C3E : E3);
      }
    }
    t.rect(11, 16, 3, 4, b4); t.set(15, 10 + f, G4); t.set(15, 25 - f, G4);
    return outline(t);
  });
}

export default function weapons() {
  const S = {};
  const katana    = drawKatana();
  const crusader  = drawCrusader();
  const hammer    = drawHammer();
  const staff     = drawStaff();
  const daggers   = drawDaggers();
  const gauntlets = drawGauntlets();
  const mic       = drawMicrophone();

  // 12-angle rotated in-hand sprites
  S.w_katana     = spin(katana,    GX, GY);
  S.w_crusader   = spin(crusader,  GX, GY);
  S.w_hammer     = spin(hammer,    GX, GY);
  S.w_staff      = spin(staff,     GX, GY);
  S.w_daggers    = spin(daggers,   GX, GY);
  S.w_gauntlets  = spin(gauntlets, 15, GY);    // centered right over the fist!
  S.w_microphone = spin(mic,       GX, GY);

  // Ornate 32x32 HUD & Arsenal Icons (wi_<id>)
  S.wi_katana = makeIcon(katana, GX + 6, GY, (ic) => {
    ic.ring(16, 16, 11, 12, C3E, -2.4, -0.4);
    ic.set(7, 8, E4); ic.set(24, 23, C4E);
  });
  S.wi_crusader = makeIcon(crusader, GX + 6, GY, (ic) => {
    ic.line(16, 4, 16, 27, g1); ic.line(5, 16, 27, 16, g1);
    ic.ring(16, 16, 9, 10, G3);
  });
  S.wi_hammer = makeIcon(hammer, GX + 10, GY, (ic) => {
    for (const [x, y] of [[7, 9], [25, 7], [26, 19], [10, 24]]) { ic.set(x, y, G4); ic.set(x + 1, y, R4); }
  });
  S.wi_staff = makeIcon(staff, GX + 10, GY, (ic) => {
    ic.ring(19, 12, 7, 8, R3);
    for (const [x, y] of [[9, 8], [26, 18], [13, 24]]) ic.set(x, y, R5);
  });
  // Twin crossed daggers icon!
  {
    const ic = new Img(32, 32), a1 = -Math.PI / 4, a2 = -3 * Math.PI / 4;
    for (const [ang, ox] of [[a2, 0], [a1, 0]]) {
      const ca = Math.cos(ang), sa = Math.sin(ang);
      for (let y = 1; y < 31; y++) for (let x = 1; x < 31; x++) {
        const dx = (x - 16 + ox) * 1.12, dy = (y - 16) * 1.12;
        const sx = Math.round(GX + 11 + dx * ca + dy * sa), sy = Math.round(GY - dx * sa + dy * ca);
        const v = daggers.get(sx, sy); if (v) ic.set(x, y, v);
      }
    }
    ic.set(16, 16, b4); ic.set(16, 7, R5); ic.set(16, 25, E4);
    S.wi_daggers = outline(ic);
  }
  S.wi_gauntlets = makeIcon(gauntlets, 6, GY, (ic) => {
    ic.ring(16, 16, 10, 11, G3);
    ic.set(8, 10, E4); ic.set(24, 22, G4);
  });
  S.wi_microphone = makeIcon(mic, GX + 6, GY, (ic) => {
    ic.set(6, 10, C4E); ic.set(25, 8, E4); ic.set(26, 19, C4E);
  });

  // Combat Slash, Heavy, Weapon-Specific & Special Sprites
  S.fx_slash          = makeLightSlash();
  S.fx_slash_l        = S.fx_slash.map(flipX);
  S.fx_heavy_slash    = makeHeavySlash();
  S.fx_heavy_slash_l  = S.fx_heavy_slash.map(flipX);
  S.fx_katana_dash    = makeKatanaDash();
  S.fx_katana_dash_l  = S.fx_katana_dash.map(flipX);
  S.fx_dagger_flurry   = makeDaggerFlurry();
  S.fx_dagger_flurry_l = S.fx_dagger_flurry.map(flipX);
  S.fx_chi_palm       = makeChiPalm();
  S.fx_chi_palm_l     = S.fx_chi_palm.map(flipX);
  S.fx_quake_wave     = makeQuakeWave();
  S.fx_quake_wave_l   = S.fx_quake_wave.map(flipX);
  S.fx_comet          = makeComet();
  S.fx_comet_l        = S.fx_comet.map(flipX);
  S.fx_cross          = makeCrossWave();
  S.fx_glyph_ring     = makeGlyphRing();
  S.fx_glyph_beam     = makeGlyphBeam();

  S.fx_miku_slash   = makeMikuSlash();
  S.fx_miku_slash_l = S.fx_miku_slash.map(flipX);
  S.fx_note         = makeNotes();
  S.fx_sonic_wave   = makeSonicWave();
  S.fx_sonic_wave_l = S.fx_sonic_wave.map(flipX);

  return S;
}

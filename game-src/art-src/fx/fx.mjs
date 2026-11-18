// FX — high-detail pixel-art dust puffs, jump/landing rings, arcane orbs & impact bursts.
import { Img, c } from '../../tools/lib/pix.mjs';
const K = c('void1');
const s0 = c('stone0'), s1 = c('stone1'), s2 = c('stone2'), s3 = c('stone3'), b3 = c('bone3');
const r1 = c('rune1'), R2 = c('rune2', 'e'), R3 = c('rune3', 'e'), R4 = c('rune4', 'e'), R5 = c('rune5', 'e');
const g2 = c('gold2'), G3 = c('gold3', 'e'), G4 = c('gold4', 'e');

const puff = (w, h, blobs) => {
  const t = new Img(w, h);
  for (const [x, y, rx, ry, v] of blobs) t.ellipse(x, y, rx, ry, v);
  t.each(0, 0, w, h, (x, y, v) => {
    if (!v) return;
    if (!t.get(x, y - 1)) return v === s1 ? s2 : v === s2 ? s3 : b3;
    if (!t.get(x, y + 1)) return s0;
  });
  return t;
};

export default function fx() {
  const S = {};

  // Step dust (5 frames, 18x10)
  S.fx_dust = [
    puff(18, 10, [[9, 7, 3.5, 2.2, s2], [6, 8, 2, 1.5, s1]]),
    puff(18, 10, [[6, 6, 3.2, 2.2, s2], [12, 7, 3, 2, s2], [9, 5, 2, 1.5, s3]]),
    puff(18, 10, [[4, 5, 2.8, 2, s2], [13, 5, 2.8, 2, s1], [9, 4, 1.8, 1.2, s2]]),
    puff(18, 10, [[3, 4, 2, 1.4, s1], [15, 4, 2, 1.4, s1]]),
    puff(18, 10, [[2, 3, 1.2, 1, s1], [16, 3, 1.2, 1, s0]]),
  ];

  // Jump takeoff V-ring + twin puffs (5 frames, 28x14)
  S.fx_jump = [
    puff(28, 14, [[14, 11, 7, 2.5, s2], [14, 10, 4, 2, s3]]),
    puff(28, 14, [[9, 9, 4, 3, s2], [19, 9, 4, 3, s2], [14, 11, 5, 1.8, s1]]),
    puff(28, 14, [[6, 7, 3.5, 2.5, s2], [22, 7, 3.5, 2.5, s2], [14, 11, 3, 1.2, s1]]),
    puff(28, 14, [[4, 5, 2.5, 2, s1], [24, 5, 2.5, 2, s1]]),
    puff(28, 14, [[3, 3, 1.4, 1.2, s1], [25, 3, 1.4, 1.2, s0]]),
  ];

  // Heavy landing shock-dust (6 frames, 36x14)
  S.fx_land = [
    puff(36, 14, [[18, 11, 9, 2.5, s3], [11, 11, 4, 2, s2], [25, 11, 4, 2, s2]]),
    puff(36, 14, [[10, 9, 5.5, 3.2, s2], [26, 9, 5.5, 3.2, s2], [18, 11, 6, 2, s1]]),
    puff(36, 14, [[6, 8, 5, 3.2, s2], [30, 8, 5, 3.2, s2], [14, 10, 2.5, 1.8, s1], [22, 10, 2.5, 1.8, s1]]),
    puff(36, 14, [[4, 6, 4, 2.5, s1], [32, 6, 4, 2.5, s1]]),
    puff(36, 14, [[3, 5, 2.8, 2, s1], [33, 5, 2.8, 2, s1]]),
    puff(36, 14, [[2, 4, 1.5, 1.2, s0], [34, 4, 1.5, 1.2, s0]]),
  ];

  // Arcane Rune Orb (6 frames, 16x16): pulsing core + orbiting satellite runes
  S.fx_orb = Array.from({ length: 6 }, (_, f) => {
    const t = new Img(16, 16), a = f * Math.PI / 3;
    t.ellipse(8, 8, 6.2, 6.2, K);
    t.ellipse(8, 8, 5, 5, R2);
    t.ellipse(8, 8, 3.6, 3.6, R3);
    t.ellipse(8, 8, 2.4, 2.4, R4);
    t.rect(7, 7, 2, 2, R5);
    for (let k = 0; k < 2; k++) {
      const ang = a + k * Math.PI;
      const sx = Math.round(8 + Math.cos(ang) * 5.6), sy = Math.round(8 + Math.sin(ang) * 5.6);
      t.set(sx, sy, k === 0 ? R5 : G4);
    }
    return t;
  });

  // Radiant Rune/Gold Impact Burst (6 frames, 28x28)
  S.fx_burst = Array.from({ length: 6 }, (_, f) => {
    const t = new Img(28, 28);
    if (f === 0) {
      t.ellipse(14, 14, 6, 6, R4); t.ellipse(14, 14, 3.5, 3.5, R5);
      t.line(14, 3, 14, 25, G4); t.line(3, 14, 25, 14, R5);
    } else if (f < 4) {
      t.ring(14, 14, f * 3 - 1, f * 3 + 1.5, f === 1 ? R5 : f === 2 ? R4 : R2);
    }
    for (let k = 0; k < 8; k++) {
      const a = k * Math.PI / 4 + f * 0.18, r0 = f * 2.4, r1x = 4 + f * 3.6;
      if (r0 < r1x) {
        t.line(
          14 + Math.cos(a) * r0, 14 + Math.sin(a) * r0,
          14 + Math.cos(a) * Math.min(13, r1x), 14 + Math.sin(a) * Math.min(13, r1x),
          f < 2 ? (k & 1 ? G4 : R5) : f < 4 ? R4 : R2
        );
      }
    }
    return t;
  });

  // Boss Ground Telegraph Reticle (fx_warn, 4 frames, 34x12, centered at 17, 6)
  S.fx_warn = [0, 1, 2, 3].map((f) => {
    const t = new Img(34, 12);
    const rx = 13 + (f & 1) * 2, ry = 3.6 + (f & 1) * 0.6;
    for (let y = 0; y < 12; y++) for (let x = 0; x < 34; x++) {
      const d = Math.hypot((x - 17) / rx, (y - 6) / ry);
      if (d > 0.78 && d < 1.05) t.set(x, y, f & 1 ? R5 : R4);
      else if (d > 0.45 && d <= 0.78 && ((x + y + f) % 3 === 0)) t.set(x, y, G3);
    }
    t.line(17, 1, 17, 10, f & 1 ? G4 : R4);
    t.line(6, 6, 28, 6, R3);
    t.set(17, 6, R5);
    return t;
  });

  // Boss Falling Orb Trail (fx_orbtrail, 4 frames, 5x24)
  S.fx_orbtrail = [0, 1, 2, 3].map((f) => {
    const t = new Img(5, 24);
    for (let y = 0; y < 24; y++) {
      const w = y > 16 ? 2 : y > 8 ? 1 : 0;
      for (let dx = -w; dx <= w; dx++) {
        const core = dx === 0 && y > 6;
        if (y < 5 && ((y + f) & 1)) continue;
        t.set(2 + dx, y, core ? (y > 15 ? R5 : R4) : (y > 12 ? R3 : R2));
      }
    }
    t.set(1 + (f & 1 ? 2 : 0), 6 + f * 3, G4);
    return t;
  });

  // Sovereign Boss Colossal Cleave Crescent (fx_bslash / fx_bslash_l, 3 frames, 88x72)
  const flipX = (im) => {
    const o = new Img(im.w, im.h);
    for (let y = 0; y < im.h; y++) for (let x = 0; x < im.w; x++) o.set(im.w - 1 - x, y, im.get(x, y));
    return o;
  };
  S.fx_bslash = [0, 1, 2].map((f) => {
    const t = new Img(88, 72);
    const cx = 8, cy = 36;
    const a0 = f === 0 ? -1.15 : f === 1 ? -0.95 : -0.65;
    const a1 = f === 0 ? 0.55 : f === 1 ? 1.05 : 1.15;
    for (let y = 0; y < 72; y++) for (let x = 0; x < 88; x++) {
      const dx = (x - cx) / 1.18, dy = y - cy;
      const r = Math.hypot(dx, dy), a = Math.atan2(dy, dx);
      if (a < a0 || a > a1) continue;
      const u = (a - a0) / (a1 - a0);
      const thick = Math.sin(u * Math.PI) * (f === 0 ? 11 : f === 1 ? 8.5 : 4.5);
      const dist = Math.abs(r - (56 + f * 3));
      if (dist <= thick) {
        if (f < 2 && dist < thick * 0.28) t.set(x, y, R5);
        else if (dist < thick * 0.58) t.set(x, y, (x + y) & 1 ? G4 : R4);
        else if (dist < thick * 0.85) t.set(x, y, R3);
        else t.set(x, y, R2);
      } else if (f < 2 && Math.abs(r - 40) < thick * 0.32 && u > 0.18 && u < 0.86) {
        t.set(x, y, dist < 2 ? G3 : R2);
      }
    }
    // Arcane rune sparks trailing the cleave
    for (let k = 0; k < 7; k++) {
      const a = a0 + (a1 - a0) * ((k + 0.5) / 7), rr = 58 + (k & 1 ? 5 : -5) + f * 2;
      const sx = Math.round(cx + Math.cos(a) * rr * 1.15), sy = Math.round(cy + Math.sin(a) * rr);
      t.set(sx, sy, k & 1 ? G4 : R5);
      if (f < 2) { t.set(sx - 1, sy, R3); t.set(sx + 1, sy, G3); }
    }
    return t;
  });
  S.fx_bslash_l = S.fx_bslash.map(flipX);

  return S;
}

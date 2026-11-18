// Shared painters for the Frontend Forest (tiles, sets and parallax all use the same foliage and bark).
import { Img, c, hash2, dith } from '../tools/lib/pix.mjs';

/** a mass of leaves: overlapping clumps, each lit from the upper left. cols = [shadow, dark, mid, light] (light may be null) */
export function leaves(im, cx, cy, rx, ry, cols, seed = 1, o = {}) {
  const n = o.n || Math.max(5, Math.round(rx * ry / 55)), cl = [];
  for (let i = 0; i < n; i++) {
    const a = hash2(i, seed, 1) * Math.PI * 2, d = Math.sqrt(hash2(i, seed, 2));
    cl.push({ x: cx + Math.cos(a) * d * rx * .8, y: cy + Math.sin(a) * d * ry * .7, r: (o.r || 7) + hash2(i, seed, 3) * (o.rv == null ? 6 : o.rv) });
  }
  cl.sort((p, q) => q.y - p.y);                                   // lower clumps first, upper ones overlap them
  for (const k of cl) {
    im.ellipse(k.x, k.y, k.r, k.r * .8, cols[0]);
    im.ellipse(k.x - k.r * .12, k.y - k.r * .16, k.r * .82, k.r * .62, cols[1]);
    if (cols[2]) im.ellipse(k.x - k.r * .3, k.y - k.r * .32, k.r * .5, k.r * .36, cols[2]);
    if (cols[3]) { for (let j = 0; j < 4; j++) im.set(k.x - k.r * .45 + hash2(j, k.x | 0, seed) * k.r * .6, k.y - k.r * .55 + hash2(j, k.y | 0, seed + 3) * k.r * .35, cols[3]); }
    for (let j = 0; j < 5; j++) { const a = hash2(j, k.x | 0, 7) * 6.28; im.set(k.x + Math.cos(a) * (k.r + 1), k.y + Math.sin(a) * (k.r * .8 + 1), cols[0]); }   // ragged edge leaves
  }
  return im;
}

/** bark column, tileable in y. cols = [shadow, dark, mid, light], lit from the left */
export function bark(w, h, cols, seed = 1) {
  const im = new Img(w, h);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const u = x / (w - 1), wob = Math.round(Math.sin(y / h * Math.PI * 4 + x * .6 + seed) * 1.3);
    let k = u < .08 ? 2 : u < .34 ? 3 : u < .62 ? 2 : u < .86 ? 1 : 0;
    if ((x + wob + seed * 3) % 5 === 0 && k > 0) k--;                                          // grooves
    if (hash2(x, (y / 3) | 0, seed) < .06 && k < 3) k++;                                       // flecks
    im.set(x, y, cols[k]);
  }
  for (let i = 0; i < Math.max(1, (w * h) / 1400); i++) {                                      // knots
    const kx = 5 + hash2(i, seed, 11) * (w - 10), ky = 6 + hash2(i, seed, 12) * (h - 12);
    im.ellipse(kx, ky, 3, 4, cols[0]); im.ellipse(kx, ky, 1, 2, cols[1]); im.set(kx - 3, ky - 2, cols[3]);
  }
  return im;
}

/** soil, seamless at 64 px: soft strata, pebbles, root threads. cols = [deep, dark, mid, light] */
export function soil(cols, seed = 1, o = {}) {
  const im = new Img(64, 64), T = Math.PI * 2 / 64;
  for (let y = 0; y < 64; y++) for (let x = 0; x < 64; x++) {
    const v = Math.sin(y * T * 3 + Math.sin(x * T * 2 + seed) * 1.4) * .55 + Math.sin(x * T * 4 + y * T * 2 + seed * 2) * .3 + (hash2(x, y, seed) - .5) * .5;
    im.set(x, y, v < -.42 ? cols[0] : v < .38 ? cols[1] : cols[2]);
  }
  for (let i = 0; i < (o.pebbles == null ? 9 : o.pebbles); i++) {
    const px = 5 + hash2(i, seed, 21) * 52, py = 5 + hash2(i, seed, 22) * 52, r = 1.5 + hash2(i, seed, 23) * 2.5;
    im.ellipse(px, py, r + 1, r, cols[0]); im.ellipse(px, py - 1, r, r - .5, cols[2]); if (cols[3]) im.set(px - 1, py - 1 - r * .5, cols[3]);
  }
  for (let i = 0; i < (o.roots == null ? 3 : o.roots); i++) {                                  // pale root threads
    let x = 8 + hash2(i, seed, 31) * 48, y = 6 + hash2(i, seed, 32) * 30;
    for (let k = 0; k < 16; k++) { im.set(x, y, cols[3] || cols[2]); im.set(x + 1, y + 1, cols[0]); x += hash2(k, i, seed + 5) < .5 ? 1 : -1; y += 1; }
  }
  return im;
}
export { Img, c, hash2, dith };

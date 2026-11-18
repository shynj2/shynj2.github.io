// Indexed pixel toolkit. An Img is a w*h grid of palette indices (0 = transparent).
// For environment art the index is a MASTER palette index (1..63); bit 7 (EMI) marks the pixel
// as emissive (drawn again after the darkness pass). For character atlases the index is a ROLE
// index; bit 6 / bit 7 mark silhouette edges (rim-light flags).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { encodeRGBA } from './png.mjs';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
export const EMI = 128, RIM_R = 64, RIM_L = 128, IDX = 63;

/* ---------------- palette ---------------- */
export const PAL = JSON.parse(fs.readFileSync(path.join(ROOT, 'art-src/palette.json'), 'utf8'));
export const MASTER = [null];            // index -> '#rrggbb' (0 = transparent)
export const NAME = {};                   // 'stone2' -> index
export const RAMP_OF = [null];            // index -> [rampName, step]
for (const [ramp, cols] of Object.entries(PAL.ramps)) {
  cols.forEach((hex, i) => { NAME[ramp + i] = MASTER.length; RAMP_OF.push([ramp, i]); MASTER.push(hex.toLowerCase()); });
}
if (MASTER.length > 64) throw new Error('master palette must stay <= 63 colours');
export const MASTER_RGB = MASTER.map((h) => h ? [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)] : [0, 0, 0]);
/** colour name -> master index. c('stone2'), c('rune4','e') = emissive */
export function c(name, emissive) {
  const i = NAME[name];
  if (!i) throw new Error('unknown colour ' + name);
  return emissive ? i | EMI : i;
}
/** one step darker / lighter along the same ramp (clamped) */
export function step(idx, d) {
  const [ramp, s] = RAMP_OF[idx & IDX];
  const n = PAL.ramps[ramp].length;
  return NAME[ramp + Math.max(0, Math.min(n - 1, s + d))] | (idx & ~IDX);
}
/** master->master LUT (array of 64) from palette.json "luts" */
export function zoneLut(name) {
  const def = PAL.luts[name] || {};
  const lut = MASTER.map((_, i) => i);
  for (const [from, to] of Object.entries(def.ramp || {})) {
    const a = PAL.ramps[from], b = PAL.ramps[to];
    a.forEach((_, i) => { lut[NAME[from + i]] = NAME[to + Math.min(b.length - 1, Math.round(i * (b.length - 1) / Math.max(1, a.length - 1)))]; });
  }
  for (const [from, to] of Object.entries(def.map || {})) lut[NAME[from]] = NAME[to];
  return lut;
}

/* ---------------- deterministic noise ---------------- */
export function rng(seed) {
  let a = seed | 0;
  return () => {
    a = a + 0x6D2B79F5 | 0;
    let t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}
export function hash2(x, y, s = 0) {
  let h = Math.imul(x | 0, 374761393) + Math.imul(y | 0, 668265263) + Math.imul(s | 0, 2246822519);
  h = Math.imul(h ^ h >>> 13, 1274126177);
  return ((h ^ h >>> 16) >>> 0) / 4294967296;
}
const B4 = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
/** ordered dither: true when level (0..1) beats the 4x4 Bayer threshold at x,y */
export function dith(x, y, level) { return level > (B4[(y & 3) * 4 + (x & 3)] + .5) / 16; }

/* ---------------- image ---------------- */
export class Img {
  constructor(w, h, fill = 0) { this.w = w; this.h = h; this.d = new Uint8Array(w * h); if (fill) this.d.fill(fill); }
  static ascii(rows, map) {
    const w = Math.max(...rows.map((r) => r.length)), im = new Img(w, rows.length);
    rows.forEach((r, y) => { for (let x = 0; x < r.length; x++) { const ch = r[x]; if (ch !== '.' && ch !== ' ') { const v = map[ch]; if (v == null) throw new Error('ascii: unknown role "' + ch + '"'); im.d[y * w + x] = v; } } });
    return im;
  }
  in(x, y) { return x >= 0 && y >= 0 && x < this.w && y < this.h; }
  get(x, y) { return this.in(x, y) ? this.d[y * this.w + x] : 0; }
  set(x, y, v) { x |= 0; y |= 0; if (this.in(x, y)) this.d[y * this.w + x] = v; return this; }
  clone() { const i = new Img(this.w, this.h); i.d.set(this.d); return i; }
  rect(x, y, w, h, v) { x |= 0; y |= 0; for (let j = Math.max(0, y); j < Math.min(this.h, y + h); j++) for (let i = Math.max(0, x); i < Math.min(this.w, x + w); i++) this.d[j * this.w + i] = v; return this; }
  /** fill with a per-pixel function f(x,y,old) -> index | undefined (skip) */
  each(x, y, w, h, f) { x |= 0; y |= 0; for (let j = Math.max(0, y); j < Math.min(this.h, y + h); j++) for (let i = Math.max(0, x); i < Math.min(this.w, x + w); i++) { const v = f(i, j, this.d[j * this.w + i]); if (v != null) this.d[j * this.w + i] = v; } return this; }
  line(x0, y0, x1, y1, v, th = 1) {
    x0 = Math.round(x0); y0 = Math.round(y0); x1 = Math.round(x1); y1 = Math.round(y1);
    const dx = Math.abs(x1 - x0), dy = -Math.abs(y1 - y0), sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1;
    let e = dx + dy;
    for (;;) {
      if (th <= 1) this.set(x0, y0, v); else this.rect(x0 - ((th - 1) >> 1), y0 - ((th - 1) >> 1), th, th, v);
      if (x0 === x1 && y0 === y1) break;
      const e2 = 2 * e;
      if (e2 >= dy) { e += dy; x0 += sx; }
      if (e2 <= dx) { e += dx; y0 += sy; }
    }
    return this;
  }
  ellipse(cx, cy, rx, ry, v, fill = true) {
    for (let y = Math.floor(cy - ry); y <= Math.ceil(cy + ry); y++) for (let x = Math.floor(cx - rx); x <= Math.ceil(cx + rx); x++) {
      const q = ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2;
      if (fill ? q <= 1 : q <= 1 && (((x - cx) / (rx - 1)) ** 2 + ((y - cy) / (ry - 1)) ** 2 > 1 || rx <= 1 || ry <= 1)) this.set(x, y, typeof v === 'function' ? v(x, y) : v);
    }
    return this;
  }
  /** ring between radii r0<r1 (optionally an arc a0..a1 radians) */
  ring(cx, cy, r0, r1, v, a0 = 0, a1 = Math.PI * 2) {
    for (let y = Math.floor(cy - r1); y <= Math.ceil(cy + r1); y++) for (let x = Math.floor(cx - r1); x <= Math.ceil(cx + r1); x++) {
      const dx = x - cx, dy = y - cy, r = Math.hypot(dx, dy);
      if (r < r0 || r > r1) continue;
      if (a1 - a0 < Math.PI * 2 - 1e-6) { let a = Math.atan2(dy, dx); while (a < a0) a += Math.PI * 2; if (a > a1) continue; }
      this.set(x, y, typeof v === 'function' ? v(x, y, r) : v);
    }
    return this;
  }
  poly(pts, v) {
    let y0 = Infinity, y1 = -Infinity;
    pts.forEach((p) => { y0 = Math.min(y0, p[1]); y1 = Math.max(y1, p[1]); });
    for (let y = Math.floor(y0); y <= Math.ceil(y1); y++) {
      const xs = [];
      for (let i = 0; i < pts.length; i++) {
        const a = pts[i], b = pts[(i + 1) % pts.length];
        if ((a[1] <= y + .5 && b[1] > y + .5) || (b[1] <= y + .5 && a[1] > y + .5)) xs.push(a[0] + (y + .5 - a[1]) / (b[1] - a[1]) * (b[0] - a[0]));
      }
      xs.sort((p, q) => p - q);
      for (let i = 0; i + 1 < xs.length; i += 2) for (let x = Math.round(xs[i]); x < Math.round(xs[i + 1]); x++) this.set(x, y, typeof v === 'function' ? v(x, y) : v);
    }
    return this;
  }
  /** copy src onto this. opts: flipX, map(fn old->new), mask(only where this already opaque) */
  blit(src, dx, dy, o = {}) {
    dx = Math.round(dx); dy = Math.round(dy);
    for (let y = 0; y < src.h; y++) for (let x = 0; x < src.w; x++) {
      let v = src.d[y * src.w + (o.flipX ? src.w - 1 - x : x)];
      if (!v) continue;
      const X = dx + x, Y = dy + y;
      if (!this.in(X, Y)) continue;
      if (o.atop && !this.d[Y * this.w + X]) continue;
      if (o.map) v = o.map(v, X, Y);
      if (v) this.d[Y * this.w + X] = v;
    }
    return this;
  }
  crop(x, y, w, h) { const i = new Img(w, h); for (let j = 0; j < h; j++) for (let k = 0; k < w; k++) i.d[j * w + k] = this.get(x + k, y + j); return i; }
  flip() { const i = new Img(this.w, this.h); for (let y = 0; y < this.h; y++) for (let x = 0; x < this.w; x++) i.d[y * this.w + x] = this.d[y * this.w + this.w - 1 - x]; return i; }
  bounds() {
    let x0 = this.w, y0 = this.h, x1 = -1, y1 = -1;
    for (let y = 0; y < this.h; y++) for (let x = 0; x < this.w; x++) if (this.d[y * this.w + x]) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
    return x1 < 0 ? null : { x: x0, y: y0, w: x1 - x0 + 1, h: y1 - y0 + 1 };
  }
  /** 1px outline around opaque pixels. col: index or fn(neighbourIndex)->index */
  outline(col, diag = false) {
    const src = this.clone();
    const N = diag ? [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [-1, 1], [1, -1], [-1, -1]] : [[1, 0], [-1, 0], [0, 1], [0, -1]];
    for (let y = 0; y < this.h; y++) for (let x = 0; x < this.w; x++) {
      if (src.d[y * this.w + x]) continue;
      for (const [ax, ay] of N) { const n = src.get(x + ax, y + ay); if (n) { this.d[y * this.w + x] = typeof col === 'function' ? col(n) : col; break; } }
    }
    return this;
  }
  /** pixel-safe shading helper: shade(x,y)->delta steps along each pixel's ramp */
  shade(f) { for (let y = 0; y < this.h; y++) for (let x = 0; x < this.w; x++) { const v = this.d[y * this.w + x]; if (!v) continue; const dlt = f(x, y, v); if (dlt) this.d[y * this.w + x] = step(v, dlt); } return this; }
  /** rotate about (px,py) by rad (screen-clockwise). 3x3 majority sampling keeps hard pixels (rotsprite-lite). */
  rotated(rad, px, py) {
    if (Math.abs(rad) < 1e-4) return { img: this, ox: px, oy: py };
    const cs = Math.cos(rad), sn = Math.sin(rad);
    let minx = Infinity, miny = Infinity, maxx = -Infinity, maxy = -Infinity;
    for (const [x, y] of [[0, 0], [this.w, 0], [0, this.h], [this.w, this.h]]) {
      const dx = x - px, dy = y - py, rx = dx * cs - dy * sn, ry = dx * sn + dy * cs;
      minx = Math.min(minx, rx); maxx = Math.max(maxx, rx); miny = Math.min(miny, ry); maxy = Math.max(maxy, ry);
    }
    const x0 = Math.floor(minx) - 1, y0 = Math.floor(miny) - 1, W = Math.ceil(maxx) - x0 + 2, H = Math.ceil(maxy) - y0 + 2;
    const out = new Img(W, H), cnt = new Map();
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      cnt.clear(); let op = 0;
      for (let sy = 0; sy < 3; sy++) for (let sx = 0; sx < 3; sx++) {
        const dx = x + x0 + (sx + .5) / 3, dy = y + y0 + (sy + .5) / 3;
        const ux = Math.floor(dx * cs + dy * sn + px), uy = Math.floor(-dx * sn + dy * cs + py);
        const v = this.get(ux, uy);
        if (v) { op++; cnt.set(v, (cnt.get(v) || 0) + (sx === 1 && sy === 1 ? 1.5 : 1)); }
      }
      if (op >= 5) { let best = 0, bv = 0; for (const [v, n] of cnt) if (n > best) { best = n; bv = v; } out.d[y * W + x] = bv; }
    }
    return { img: out, ox: -x0, oy: -y0 };
  }
  /** -> RGBA bytes using a lut: index -> [r,g,b] */
  rgba(lut = MASTER_RGB, bg = null) {
    const o = new Uint8Array(this.w * this.h * 4);
    for (let i = 0; i < this.d.length; i++) {
      const v = this.d[i];
      if (v) { const col = lut[v] || lut[v & IDX]; o[i * 4] = col[0]; o[i * 4 + 1] = col[1]; o[i * 4 + 2] = col[2]; o[i * 4 + 3] = 255; }
      else if (bg) { o[i * 4] = bg[0]; o[i * 4 + 1] = bg[1]; o[i * 4 + 2] = bg[2]; o[i * 4 + 3] = 255; }
    }
    return o;
  }
}

/** write a review PNG (RGBA) scaled by integer k */
export function savePNG(file, w, h, rgba, k = 1) {
  let W = w, H = h, data = rgba;
  if (k > 1) {
    W = w * k; H = h * k; data = new Uint8Array(W * H * 4);
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { const s = (((y / k) | 0) * w + ((x / k) | 0)) * 4, d = (y * W + x) * 4; data[d] = rgba[s]; data[d + 1] = rgba[s + 1]; data[d + 2] = rgba[s + 2]; data[d + 3] = rgba[s + 3]; }
  }
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, encodeRGBA(W, H, data));
}

/* ---------------- tiny 3x5 pixel font (own glyphs) — for review sheets + in-game name tag ---------------- */
const F = {
  A: '010101111101101', B: '110101110101110', C: '011100100100011', D: '110101101101110', E: '111100110100111', F: '111100110100100',
  G: '011100101101011', H: '101101111101101', I: '111010010010111', J: '001001001101010', K: '101101110101101', L: '100100100100111',
  M: '101111111101101', N: '110101101101101', O: '010101101101010', P: '110101110100100', Q: '010101101110011', R: '110101110101101',
  S: '011100010001110', T: '111010010010010', U: '101101101101011', V: '101101101010010', W: '101101111111101', X: '101101010101101',
  Y: '101101010010010', Z: '111001010100111',
  0: '010101101101010', 1: '010110010010111', 2: '110001010100111', 3: '110001010001110', 4: '101101111001001', 5: '111100110001110',
  6: '011100110101010', 7: '111001010010010', 8: '010101010101010', 9: '010101011001110',
  ' ': '000000000000000', '.': '000000000000010', '-': '000000111000000', '_': '000000000000111', ':': '000010000010000', '/': '001001010100100',
  '#': '101111101111101', '>': '100010001010100', '+': '000010111010000', '\'': '010010000000000', '!': '010010010000010', '?': '110001010000010', '@': '111101111100111'
};
export const FONT3 = F;
export function text(img, str, x, y, v) {
  str = String(str).toUpperCase();
  for (let i = 0; i < str.length; i++) {
    const g = F[str[i]] || F['?'];
    for (let j = 0; j < 15; j++) if (g[j] === '1') img.set(x + i * 4 + (j % 3), y + ((j / 3) | 0), v);
  }
  return img;
}

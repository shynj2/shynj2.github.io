// Shelf packer + review sheet for environment sprites.
import { Img, MASTER_RGB, NAME, savePNG, text, IDX, EMI } from './pix.mjs';

/** sprites: {name: Img | Img[]} -> {img: Img (atlas), rects: {name: [x,y,w,h] | name: [[x,y,w,h],...]}} */
export function pack(sprites, maxW = 1024) {
  const items = [];
  for (const [name, v] of Object.entries(sprites)) {
    if (Array.isArray(v)) v.forEach((im, i) => items.push({ name, i, im })); else items.push({ name, i: -1, im: v });
  }
  items.sort((a, b) => b.im.h - a.im.h || b.im.w - a.im.w);
  let x = 0, y = 0, rowH = 0, W = 0;
  for (const it of items) {
    if (x + it.im.w > maxW) { x = 0; y += rowH + 1; rowH = 0; }
    it.x = x; it.y = y; x += it.im.w + 1; rowH = Math.max(rowH, it.im.h); W = Math.max(W, x);
  }
  const H = y + rowH, img = new Img(W, H), rects = {};
  for (const it of items) {
    img.blit(it.im, it.x, it.y);
    const r = [it.x, it.y, it.im.w, it.im.h];
    if (it.i < 0) rects[it.name] = r; else (rects[it.name] = rects[it.name] || [])[it.i] = r;
  }
  return { img, rects };
}

/** labelled contact sheet of environment sprites (first frame of strips, plus frame count) */
export function assetSheet(sprites, file, o = {}) {
  const k = o.scale || 2, maxW = o.width || 760, pad = 6, items = [];
  for (const [name, v] of Object.entries(sprites)) { const frames = Array.isArray(v) ? v : [v]; items.push({ name: name + (frames.length > 1 ? ' x' + frames.length : ''), frames: o.allFrames ? frames : frames.slice(0, Math.min(frames.length, o.maxFrames || 3)) }); }
  let x = pad, y = pad, rowH = 0; const place = [];
  for (const it of items) {
    const w = Math.max(it.name.length * 4, it.frames.reduce((a, f) => a + f.w + 2, 0)), h = Math.max(...it.frames.map((f) => f.h)) + 8;
    if (x + w > maxW) { x = pad; y += rowH + pad; rowH = 0; }
    place.push({ it, x, y }); x += w + pad; rowH = Math.max(rowH, h);
  }
  const W = maxW, H = y + rowH + pad, out = new Uint8Array(W * H * 4);
  const bg = MASTER_RGB[NAME[o.bg || 'soot1']], ink = MASTER_RGB[NAME.bone2];
  for (let i = 0; i < W * H; i++) { out[i * 4] = bg[0]; out[i * 4 + 1] = bg[1]; out[i * 4 + 2] = bg[2]; out[i * 4 + 3] = 255; }
  const put = (X, Y, c) => { if (X < 0 || Y < 0 || X >= W || Y >= H) return; const i = (Y * W + X) * 4; out[i] = c[0]; out[i + 1] = c[1]; out[i + 2] = c[2]; };
  for (const p of place) {
    const lab = new Img(p.it.name.length * 4, 5); text(lab, p.it.name, 0, 0, 1);
    for (let j = 0; j < 5; j++) for (let i = 0; i < lab.w; i++) if (lab.d[j * lab.w + i]) put(p.x + i, p.y + j, ink);
    let fx = p.x;
    for (const f of p.it.frames) { for (let j = 0; j < f.h; j++) for (let i = 0; i < f.w; i++) { const v = f.d[j * f.w + i]; if (v) put(fx + i, p.y + 8 + j, MASTER_RGB[v & IDX]); } fx += f.w + 2; }
  }
  savePNG(file, W, H, out, k);
}

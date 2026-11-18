// Review sheets: clip filmstrips with frame numbers + fps, silhouette test, 3-view.
import path from 'node:path';
import { Img, MASTER_RGB, NAME, ROOT, savePNG, text, IDX } from './pix.mjs';
import * as pix from './pix.mjs';
import { roleLut } from './rig.mjs';

/** all clips as filmstrips. Returns the file path. */
export function clipSheet(baked, file, o = {}) {
  const k = o.scale || 3, FW = baked.frameW, FH = baked.frameH, pad = 2, labelH = 8;
  const clips = Object.entries(baked.clips);
  const cols = Math.max(...clips.map(([, c]) => c.frames.length));
  const W = cols * (FW + pad) + pad, rowH = FH + labelH + pad, H = clips.length * rowH + pad;
  const lut = roleLut(baked, { pix, rim: 1 });
  const out = new Uint8Array(W * H * 4);
  const bgA = MASTER_RGB[NAME.stone0], bgB = MASTER_RGB[NAME.stone1], ink = MASTER_RGB[NAME.stone4], gnd = MASTER_RGB[NAME.stone2];
  const put = (x, y, c) => { if (x < 0 || y < 0 || x >= W || y >= H) return; const i = (y * W + x) * 4; out[i] = c[0]; out[i + 1] = c[1]; out[i + 2] = c[2]; out[i + 3] = 255; };
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) put(x, y, MASTER_RGB[NAME.void1]);
  clips.forEach(([name, clip], r) => {
    const y0 = pad + r * rowH;
    const lab = new Img(W, 5);
    text(lab, `${name}  ${clip.frames.length}F @${clip.fps}FPS${clip.loop ? ' LOOP' : ''}  HOLDS ${clip.frames.map((f) => f.hold).join('')}`, 0, 0, 1);
    for (let y = 0; y < 5; y++) for (let x = 0; x < W; x++) if (lab.d[y * W + x]) put(pad + x, y0 + 1 + y, ink);
    clip.frames.forEach((fr, i) => {
      const x0 = pad + i * (FW + pad), yy = y0 + labelH, img = baked.frames[fr.f];
      for (let y = 0; y < FH; y++) for (let x = 0; x < FW; x++) {
        const v = img.d[y * FW + x];
        put(x0 + x, yy + y, v ? lut[v] : (y >= baked.origin[1] ? gnd : ((i & 1) ? bgA : bgB)));
      }
      const num = new Img(12, 5); text(num, String(i), 0, 0, 1);
      for (let y = 0; y < 5; y++) for (let x = 0; x < 12; x++) if (num.d[y * 12 + x]) put(x0 + 1 + x, yy + 1 + y, ink);
    });
  });
  savePNG(file, W, H, out, k);
  return file;
}

/** idle / key action / hit pose in colour + the same three as pure silhouettes at 100% and 25%-ish (squint) */
export function threeView(baked, file, picks, o = {}) {
  const k = o.scale || 4, FW = baked.frameW, FH = baked.frameH, n = picks.length;
  const W = n * FW * 2 + 4, H = FH + 2;
  const lut = roleLut(baked, { pix, rim: 1 });
  const out = new Uint8Array(W * H * 4);
  const put = (x, y, c) => { const i = (y * W + x) * 4; out[i] = c[0]; out[i + 1] = c[1]; out[i + 2] = c[2]; out[i + 3] = 255; };
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) put(x, y, x < n * FW + 2 ? MASTER_RGB[NAME.stone1] : MASTER_RGB[NAME.bone4]);
  picks.forEach(([clip, fi], i) => {
    const img = baked.frames[baked.clips[clip].frames[fi].f];
    for (let y = 0; y < FH; y++) for (let x = 0; x < FW; x++) {
      const v = img.d[y * FW + x]; if (!v) continue;
      put(1 + i * FW + x, 1 + y, lut[v]);
      put(n * FW + 3 + i * FW + x, 1 + y, MASTER_RGB[NAME.void0]);
    }
  });
  savePNG(file, W, H, out, k);
  return file;
}

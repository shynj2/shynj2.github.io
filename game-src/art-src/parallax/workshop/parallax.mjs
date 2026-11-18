// WORKSHOP PARALLAX — four depth planes behind the playfield, each seamless in x.
// Value discipline: every plane owns its own value band so no two planes merge:
//   far   furnace-haze city      (void2 on ember0/ember1 haze, 3 values)
//   l4    colossal gear train    (soot0 / void2, the darkest plane against the haze)
//   l3    arcade of forge-arches (soot1 faces, small ember mouths)
//   l2    near pillars + rafters (soot1/soot2, the strongest detail behind the wall)
import { Img, c, dith, hash2, step } from '../../../tools/lib/pix.mjs';
import { masonry, archFill, archRing, gear, bands, ironBand } from '../../../tools/lib/kit.mjs';

const V0 = c('void0'), V1 = c('void1'), V2 = c('void2');
const s0 = c('soot0'), s1 = c('soot1'), s2 = c('soot2'), s3 = c('soot3');
const e0 = c('ember0'), e1 = c('ember1'), e2 = c('ember2'), e3 = c('ember3');

function wrapBlit(dst, src, x, y) { x = ((x % dst.w) + dst.w) % dst.w; dst.blit(src, x, y); if (x + src.w > dst.w) dst.blit(src, x - dst.w, y); }
function wrapRect(dst, x, y, w, h, v) { x = ((x % dst.w) + dst.w) % dst.w; dst.rect(x, y, w, h, v); if (x + w > dst.w) dst.rect(x - dst.w, y, w, h, v); }

export default function parallax() {
  const L = {};

  /* ---- far: chimneys and forge-towers drowning in furnace haze ---- */
  {
    const W = 512, H = 280, im = new Img(W, H);
    // haze glow rising from below the horizon (the sky itself is a runtime banded ramp)
    for (let y = 120; y < H; y++) for (let x = 0; x < W; x++) { const t = (y - 120) / (H - 120), n = Math.sin(x * .021) * .12 + Math.sin(x * .05 + 2) * .06; const lv = t * 1.25 + n; if (lv > .95 && dith(x, y, (lv - .95) * 3)) im.set(x, y, e1); else if (lv > .2 && dith(x, y, (lv - .2) * 1.6)) im.set(x, y, e0); }
    // tower skyline
    let x = 0, k = 0;
    while (x < W) {
      const w = 14 + Math.floor(hash2(k, 1, 3) * 30), h = 60 + Math.floor(hash2(k, 2, 3) * 150), top = H - h, kind = hash2(k, 3, 3);
      wrapRect(im, x, top, w, h, V2);
      if (kind < .45) { wrapRect(im, x + (w >> 1) - 3, top - 26, 6, 26, V2); wrapRect(im, x + (w >> 1) - 5, top - 30, 10, 4, V2); }       // chimney
      else if (kind < .7) { for (let j = 0; j < w / 2; j++) wrapRect(im, x + j, top - (w >> 1) + j, w - j * 2, 1, V2); }                  // spire
      else { wrapRect(im, x - 2, top - 4, w + 4, 4, V2); wrapRect(im, x + 2, top - 10, 3, 6, V2); wrapRect(im, x + w - 5, top - 10, 3, 6, V2); } // battlement
      for (let y = top + 6; y < H - 10; y += 9) for (let j = 3; j < w - 3; j += 5) if (hash2(x + j, y, 5) < .18) wrapRect(im, x + j, y, 1, 2, hash2(j, y, 6) < .4 ? e3 : e2);   // lit windows
      if (w >= 24 && top < H - 90) { im.ring(((x + (w >> 1)) % W + W) % W, top + 16, 3, 5, s0); wrapRect(im, x + (w >> 1), top + 16, 2, 2, e3); } // distant gothic rose window!
      for (let y = top; y < H; y++) if (y > 150 || dith(x, y, .5)) wrapRect(im, x, y, 1, 1, e0);                                         // haze-lit flank
      x += w + Math.floor(hash2(k, 4, 3) * 26) - 4; k++;
    }
    // smoke plumes
    for (let p = 0; p < 5; p++) { const px = 40 + p * 104, base = 70 + (p % 3) * 22; for (let y = 0; y < base; y++) for (let dx = -14; dx <= 14; dx++) { const wob = Math.sin(y * .09 + p) * 8, wd = 3 + (base - y) * .16; const d = Math.abs(dx - wob) / wd; if (d < 1 && dith(px + dx, y, (1 - d) * .55)) wrapRect(im, px + dx, y, 1, 1, V2); } }
    L.px_far = im;
  }

  /* ---- l4: the colossal gear train and crane arms, pure silhouette ---- */
  {
    const W = 640, H = 330, im = new Img(W, H), G = [V1, V2, s0, s0];
    const put = (R, teeth, sp, x, y, ph) => wrapBlit(im, gear(R, teeth, sp, ph, G, { tooth: Math.max(4, R * .12), rivets: 0 }), x - R, y - R);
    put(88, 28, 8, 120, 190, .1); put(52, 18, 6, 262, 150, .4); put(110, 34, 10, 470, 230, .7); put(36, 12, 6, 330, 240, .2); put(30, 10, 5, 600, 110, .5);
    // truss bridge across the top + crane cables
    wrapRect(im, 0, 26, W, 6, s0); wrapRect(im, 0, 54, W, 4, s0); wrapRect(im, 0, 32, W, 1, V2);
    for (let x = 0; x < W; x += 28) { im.line(x, 32, x + 14, 54, s0); im.line(x + 14, 54, x + 28, 32, s0); }
    for (const [x, l] of [[60, 70], [250, 44], [392, 96], [560, 30]]) { wrapRect(im, x, 58, 1, l, s0); wrapRect(im, x - 3, 58 + l, 7, 5, s0); }
    L.px_l4 = im;
  }

  /* ---- l3: arcade of forge-arches, small ember mouths burning in the dark ---- */
  {
    const W = 640, H = 340, im = new Img(W, H);
    masonry(im, 0, 150, W, H - 150, { bw: 26, bh: 12, cols: [V2, s0, s1, null], seed: 41, wrap: W, chips: 0, darkP: .5 });
    im.rect(0, 150, W, 3, s2); im.rect(0, 153, W, 2, V2);
    for (let k = 0; k < 4; k++) {
      const cx = 80 + k * 160;
      archFill(im, cx, 176, 84, 164, 96, 0);                                                    // see-through bay
      archRing(im, cx, 176, 84, 164, 96, 6, [V2, s1, s1, s2], 3 + k);
      // pier between bays with a capital
      wrapRect(im, cx + 62, 100, 36, 240, s1); wrapRect(im, cx + 62, 100, 3, 240, s2); wrapRect(im, cx + 93, 100, 5, 240, s0); wrapRect(im, cx + 56, 94, 48, 8, s1); wrapRect(im, cx + 56, 94, 48, 1, s2); wrapRect(im, cx + 56, 101, 48, 1, V2);
      for (let y = 120; y < 340; y += 40) wrapRect(im, cx + 62, y, 36, 1, V2);
      // a furnace mouth glowing low inside every other bay
      if (k % 2 === 0) { const fx = cx - 14, fy = 300; im.rect(fx - 4, fy - 6, 36, 46, s0); archFill(im, fx + 14, fy, 24, 34, 20, (x, y) => (y > fy + 26 ? e3 : y > fy + 16 ? (dith(x, y, .5) ? e3 : e2) : y > fy + 8 ? e2 : e1)); }
    }
    L.px_l3 = im;
  }

  /* ---- l2: near pillars, rafters, hanging hooks ---- */
  {
    const W = 768, H = 380, im = new Img(W, H);
    // rafters across the top
    wrapRect(im, 0, 8, W, 12, s1); wrapRect(im, 0, 8, W, 1, s2); wrapRect(im, 0, 19, W, 2, V2);
    wrapRect(im, 0, 58, W, 8, s1); wrapRect(im, 0, 58, W, 1, s2); wrapRect(im, 0, 65, W, 1, V2);
    for (let x = 0; x < W; x += 64) { im.line(x, 57, x + 32, 21, s1, 3); im.line(x + 32, 21, x + 64, 57, s1, 3); im.line(x, 56, x + 32, 20, s2, 1); }
    // pillars
    for (const px of [96, 480]) {
      for (let y = 20; y < H; y++) for (let x = 0; x < 44; x++) { const u = x / 43; let v = u < .1 ? s3 : u < .4 ? s2 : u < .8 ? s1 : s0; if (x % 9 === 8) v = step(v, -1); if (y % 52 === 51) v = V2; im.set(px + x, y, v); }
      wrapRect(im, px - 8, 20, 60, 10, s2); wrapRect(im, px - 8, 20, 60, 1, s3); wrapRect(im, px - 8, 29, 60, 1, V2); wrapRect(im, px - 4, 30, 52, 6, s1);
      ironBand(im, px - 1, 150, 46, 5, { rivets: 7 }); ironBand(im, px - 1, 290, 46, 5, { rivets: 7 });
    }
    // chains + hooks hanging from the lower rafter
    for (const [x, l] of [[220, 80], [300, 130], [350, 56], [640, 104], [700, 70]]) { for (let y = 66; y < 66 + l; y += 3) { im.set(x, y, s2); im.set(x, y + 1, s1); im.set(x + (y % 2 ? 1 : -1), y + 2, s1); } wrapRect(im, x - 2, 66 + l, 5, 2, s2); wrapRect(im, x - 2, 68 + l, 1, 5, s1); wrapRect(im, x - 2, 73 + l, 4, 1, s1); }
    L.px_l2 = im;
  }
  return L;
}

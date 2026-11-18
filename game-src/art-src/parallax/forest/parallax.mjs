// FRONTEND FOREST PARALLAX — four planes of trees stepping back into mist, each seamless in x.
//   far  pale trunks dissolving in mist      l4  tall dark trunks, thin crowns
//   l3   heavier trunks with hanging canopy  l2  the nearest trunks and a roof of leaves
import { Img, c, hash2, dith, leaves } from '../../lib-forest.mjs';
const V0 = c('void0'), V1 = c('void1'), V2 = c('void2'), m0 = c('moss0'), m1 = c('moss1'), m2 = c('moss2'), m3 = c('moss3'), s0 = c('soot0'), s1 = c('soot1');

function plane(W, H, o) {
  const im = new Img(W, H);
  const put = (f) => { f(0); f(-W); f(W); };                                  // draw three times so everything wraps
  let x = o.x0 || 0, k = 0;
  while (x < W - 8) {
    const w = o.w[0] + Math.floor(hash2(k, o.seed, 1) * o.w[1]), lean = (hash2(k, o.seed, 2) - .5) * o.lean;
    put((dx) => {
      for (let y = 0; y < H; y++) { const xx = x + dx + lean * (1 - y / H) * 30, flare = y > H - 40 ? Math.pow((y - (H - 40)) / 40, 2) * w * .6 : 0;
        im.rect(xx - flare, y, w + flare * 2, 1, o.trunk); if (o.rim) im.set(xx - flare, y, o.rim); if (o.shade) im.rect(xx + w * .65 + flare, y, Math.ceil(w * .35), 1, o.shade); }
      for (let b = 0; b < o.branches; b++) { const by = 40 + hash2(k, b, o.seed) * (H * .5), dir = hash2(k, b, 7) < .5 ? -1 : 1, len = 20 + hash2(k, b, 8) * 40; im.line(x + dx + w / 2, by + 14, x + dx + w / 2 + dir * len, by, o.trunk, Math.max(1, w / 6 | 0)); if (o.leaf) leaves(im, x + dx + w / 2 + dir * len, by - 2, 14, 7, o.leaf, k * 7 + b, { n: 5, r: 5, rv: 4 }); }
    });
    x += w + o.gap[0] + Math.floor(hash2(k, o.seed, 4) * o.gap[1]); k++;
  }
  if (o.roof) for (let i = 0; i < W / 26; i++) { const cx = i * 26 + hash2(i, o.seed, 5) * 18, ry = o.roof[0] + hash2(i, o.seed, 6) * o.roof[1]; put((dx) => leaves(im, cx + dx, ry * .35, 26, ry * .55, o.leaf, i + o.seed * 3, { n: 9, r: 8, rv: 7 })); }
  if (o.brush) for (let i = 0; i < W / 22; i++) { const cx = i * 22 + hash2(i, o.seed, 9) * 14; put((dx) => leaves(im, cx + dx, H - 6, 18, o.brush, o.leaf, i + 50, { n: 6, r: 6, rv: 5 })); }
  return im;
}

export default function parallax() {
  const L = {};
  {
    const W = 512, H = 400, im = plane(W, H, { seed: 3, w: [5, 9], gap: [14, 30], lean: .5, trunk: m1, branches: 1, leaf: [m1, m1, null, null], roof: [50, 40], brush: 16 });
    // mist: the lower half of the far plane dissolves into the sky colour (dither, never a gradient)
    for (let y = 150; y < H; y++) for (let x = 0; x < W; x++) { const lv = Math.min(.8, (y - 150) / 230 + Math.sin(x * Math.PI * 2 / W * 3) * .08); if (im.get(x, y) && dith(x, y, lv)) im.set(x, y, m2); }
    // shafts of light falling through the roof + ancient mossy ruin monoliths in the mist
    for (const [rx, rh] of [[96, 54], [274, 68], [438, 48]]) {
      im.rect(rx, H - rh - 18, 10, rh, m0); im.rect(rx, H - rh - 18, 2, rh, m2);
      im.rect(rx - 2, H - rh - 20, 14, 3, m1);
    }
    for (let s = 0; s < 5; s++) { const sx = 40 + s * 104; for (let y = 30; y < 330; y++) for (let k = 0; k < 22; k++) { const x = (sx + k - Math.round((y - 30) * .35) + W * 4) % W, lv = .34 * (1 - Math.abs(k - 11) / 11) * (1 - (y - 30) / 320); if (dith(x, y, lv)) im.set(x, y, im.get(x, y) ? m2 : m3); } }
    L.px_far = im;
  }
  L.px_l4 = plane(640, 420, { seed: 7, w: [9, 12], gap: [26, 44], lean: .35, trunk: m0, rim: m1, branches: 2, leaf: [m0, m0, m1, null], roof: [60, 40], brush: 20 });
  L.px_l3 = plane(768, 430, { seed: 11, w: [16, 16], gap: [50, 70], lean: .25, trunk: V2, rim: m0, shade: V1, branches: 2, leaf: [V2, m0, m1, null], roof: [70, 50], brush: 26 });
  L.px_l2 = plane(896, 440, { seed: 17, w: [26, 22], gap: [96, 110], lean: .15, trunk: s0, rim: s1, shade: V1, branches: 1, leaf: [V1, V2, m0, null], roof: [84, 50], brush: 30, x0: 30 });
  return L;
}

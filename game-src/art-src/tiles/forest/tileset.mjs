// FRONTEND FOREST TILESET — same keys as the Workshop set (the autotiler does not care what a zone is made of):
// dark loam under a lip of grass, root-bound sides, and living branches for the one-way platforms.
import { Img, c, hash2, soil, leaves } from '../../lib-forest.mjs';

export default function tileset() {
  const S = {};
  const V1 = c('void1'), V2 = c('void2'), s0 = c('soot0'), s1 = c('soot1'), s2 = c('soot2'), s3 = c('soot3'), s4 = c('soot4');
  const m0 = c('moss0'), m1 = c('moss1'), m2 = c('moss2'), m3 = c('moss3'), b1 = c('bone1'), b2 = c('bone2');

  S.sol_in = soil([s0, s1, s2, s3], 3);
  S.sol_deep = soil([V1, V2, s0, s1], 8, { pebbles: 6, roots: 2 });
  // "back wall" in a forest = a thicket: only used if a map draws '.' or ','
  const thicket = (seed, cols) => { const im = new Img(64, 64, cols[0]); for (let i = 0; i < 40; i++) { const x = hash2(i, seed, 1) * 64, y = hash2(i, seed, 2) * 64; for (const [ox, oy] of [[0, 0], [-64, 0], [0, -64], [-64, -64]]) leaves(im, x + ox, y + oy, 1, 1, cols, seed + i, { n: 1, r: 4, rv: 4 }); } return im; };
  S.wall = thicket(4, [V2, m0, m1, null]);
  S.wall_dark = thicket(9, [V1, V2, m0, null]);

  /* top: grass lip. Blades hang over the soil at uneven lengths. */
  const top = (seed, extra) => {
    const t = new Img(16, 16);
    for (let x = 0; x < 16; x++) {
      const len = 3 + Math.floor(hash2(x, seed, 1) * 4);
      t.set(x, 0, hash2(x, seed, 2) < .45 ? m3 : m2);
      for (let y = 1; y < len; y++) t.set(x, y, y === 1 ? m2 : y < len - 1 ? m1 : m0);
      t.set(x, len, V2);                                                    // contact shadow under the turf
    }
    if (extra) extra(t);
    return t;
  };
  S.sol_top = [
    top(1, (t) => { t.set(6, 0, c('gold3')); t.set(7, 1, m3); }),
    top(2, (t) => { t.set(4, 0, b2); t.set(5, 0, c('bone4')); t.set(11, 1, m3); }),
    top(3, (t) => { t.rect(6, 4, 4, 3, s3); t.rect(6, 4, 4, 1, s4); t.set(9, 6, s1); }),      // a stone in the turf
    top(4, (t) => { t.set(3, 6, b1); t.set(4, 7, b1); t.set(5, 8, b1); t.set(5, 9, s3); t.set(12, 0, c('rune4')); }),   // a root & rune-bud
    top(5, (t) => { t.set(9, 0, c('gold3')); })
  ];
  const bot = (f) => { const t = new Img(16, 16); t.rect(0, 15, 16, 1, V1); t.rect(0, 14, 16, 1, V2); for (let x = 1; x < 16; x += 3) t.set(x, 13, s0); if (f) f(t); return t; };
  S.sol_bot = [bot(), bot((t) => { t.rect(5, 15, 2, 1, 0); t.set(9, 15, 0); t.set(12, 14, b1); t.set(12, 15, b1); })];
  const side = (lit, seed) => {
    const t = new Img(16, 16), x0 = lit ? 0 : 15, d = lit ? 1 : -1;
    for (let y = 0; y < 16; y++) {
      const mossy = hash2(y, seed, 4) < .5;
      t.set(x0, y, lit ? (mossy ? m2 : s3) : V1); t.set(x0 + d, y, lit ? (mossy ? m1 : s2) : s0);
      if (hash2(y, seed, 6) < .2) t.set(x0 + d * 2, y, lit ? b1 : V2);                        // root ends
    }
    return t;
  };
  S.sol_l = [side(true, 1), side(true, 2)];
  S.sol_r = [side(false, 1), side(false, 2)];

  /* one-way platform: a living branch with leaf tufts */
  const branch = (kind) => {
    const t = new Img(16, 16);
    t.rect(0, 1, 16, 1, s4); t.rect(0, 2, 16, 2, s3); t.rect(0, 4, 16, 1, s2); t.rect(0, 5, 16, 1, s0); t.rect(0, 6, 16, 1, V1);
    for (let x = (kind === 1 ? 2 : 6); x < 16; x += 7) { t.set(x, 2, s2); t.set(x + 1, 3, s2); t.set(x + 1, 2, s4); }          // bark nicks
    for (let x = 0; x < 16; x++) if (hash2(x, kind === 1 ? 5 : 9, 3) < .5) t.set(x, 0, hash2(x, 1, 8) < .5 ? m3 : m2);        // moss on top
    const tuft = (x, y, n) => { for (let i = 0; i < n; i++) { t.set(x + i, y + (i % 2), m1); t.set(x + i, y + 1 + (i % 2), i % 3 ? m0 : m2); } };
    tuft(kind === 1 ? 9 : 2, 7, 5); if (kind === 1) tuft(1, 8, 3);
    if (kind === 'l') { t.rect(0, 1, 2, 5, 0); t.set(1, 2, s3); t.set(1, 3, s2); t.set(0, 3, s2); leaves(t, 2, 4, 2, 2, [m0, m1, m2, m3], 3, { n: 3, r: 2.5, rv: 1 }); }
    if (kind === 'r') { t.rect(14, 1, 2, 5, 0); t.set(14, 2, s3); t.set(14, 3, s2); t.set(15, 3, s1); leaves(t, 13, 4, 2, 2, [m0, m1, m2, m3], 5, { n: 3, r: 2.5, rv: 1 }); }
    return t;
  };
  S.plat_l = branch('l'); S.plat_m = [branch(0), branch(1)]; S.plat_r = branch('r');

  const blank = () => new Img(16, 16);
  S.deco_crack = [blank()]; S.deco_stain = [new Img(16, 32)]; S.deco_plate = blank(); S.deco_vent = blank(); S.deco_sigil = [blank()];
  return S;
}

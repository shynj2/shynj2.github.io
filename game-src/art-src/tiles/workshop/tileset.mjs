// WORKSHOP TILESET — 16x16 grid. Black forge-stone (warm 'soot' ramp) + iron.
// The runtime autotiler composes every solid cell from:  interior macro-texture (64x64, 4x4 cells,
// picked by position so masonry never repeats on the tile grid)  +  edge overlays chosen from the
// cell's neighbours (top cap / underside / sides) with seeded variants  +  deco stamps.
// Other zones reuse this set through a zone LUT until their own tileset is authored (TODO_ART).
import { Img, c, hash2, dith } from '../../../tools/lib/pix.mjs';
import { masonry, sigil } from '../../../tools/lib/kit.mjs';

export default function tileset() {
  const S = {};
  const V1 = c('void1'), V2 = c('void2'), s0 = c('soot0'), s1 = c('soot1'), s2 = c('soot2'), s3 = c('soot3'), s4 = c('soot4');
  const i0 = c('iron0'), i1 = c('iron1'), i2 = c('iron2'), i3 = c('iron3');

  /* interior macro textures (seamless 64x64) */
  S.sol_in = masonry(new Img(64, 64), 0, 0, 64, 64, { bw: 22, bh: 16, cols: [V2, s2, s3, s4], seed: 5, wrap: 64, litP: .5 });
  S.sol_deep = masonry(new Img(64, 64), 0, 0, 64, 64, { bw: 30, bh: 16, cols: [V1, s0, s1, null], seed: 9, wrap: 64, darkP: .6 });
  S.wall = masonry(new Img(64, 64), 0, 0, 64, 64, { bw: 15, bh: 8, cols: [s0, s1, s2, s3], seed: 21, wrap: 64, litP: .16, darkP: .45 });
  S.wall_dark = masonry(new Img(64, 64), 0, 0, 64, 64, { bw: 15, bh: 8, cols: [V2, s0, s1, null], seed: 23, wrap: 64, darkP: .5 });

  /* top cap: worn flagstone edge that catches the light */
  const top = (joints, extra) => {
    const t = new Img(16, 16);
    t.rect(0, 0, 16, 1, s4); t.rect(0, 1, 16, 2, s3); t.rect(0, 3, 16, 1, s2); t.rect(0, 4, 16, 1, V2); t.rect(0, 5, 16, 1, s1);
    joints.forEach((j) => { t.rect(j, 0, 1, 4, s1); if (j + 1 < 16) t.set(j + 1, 0, s4); if (j > 0) t.set(j - 1, 0, s3); });
    if (extra) extra(t);
    return t;
  };
  S.sol_top = [
    top([6]),
    top([12], (t) => { t.rect(2, 0, 3, 1, s3); t.set(3, 1, s2); }),                       // chipped lip
    top([], (t) => { t.set(5, 1, s1); t.set(6, 2, s1); t.set(7, 2, s1); t.set(8, 3, s1); }), // hairline crack
    top([2, 10], (t) => { t.rect(13, 1, 2, 2, i1); t.set(13, 1, i3); }),                  // iron stud
    top([8], (t) => { t.rect(0, 0, 16, 1, s3); t.rect(3, 0, 5, 1, s4); t.rect(11, 0, 3, 1, s4); }) // scuffed, duller
  ];
  /* underside: shadowed lip, the odd broken stone */
  const bot = (f) => { const t = new Img(16, 16); t.rect(0, 15, 16, 1, V1); t.rect(0, 14, 16, 1, V2); t.rect(0, 13, 16, 1, s0); if (f) f(t); return t; };
  S.sol_bot = [bot(), bot((t) => { t.rect(4, 15, 3, 1, 0); t.rect(5, 14, 1, 1, V1); t.rect(11, 15, 2, 1, 0); })];
  /* sides: left faces the key light, right falls into shadow */
  const side = (lit, f) => {
    const t = new Img(16, 16);
    if (lit) { t.rect(0, 0, 1, 16, s3); t.rect(1, 0, 1, 16, s2); for (let y = 3; y < 16; y += 8) { t.set(0, y, s1); t.set(1, y, s1); } }
    else { t.rect(15, 0, 1, 16, V1); t.rect(14, 0, 1, 16, s0); for (let y = 7; y < 16; y += 8) t.set(14, y, V2); }
    if (f) f(t); return t;
  };
  S.sol_l = [side(true), side(true, (t) => { t.set(0, 9, 0); t.set(0, 10, 0); t.set(1, 9, s3); t.set(1, 10, s3); })];
  S.sol_r = [side(false), side(false, (t) => { t.set(15, 4, 0); t.set(15, 5, 0); t.set(14, 4, V1); t.set(14, 5, V1); })];

  /* iron gantry (one-way platform): riveted plate over an open truss */
  const plat = (kind) => {
    const t = new Img(16, 16);
    t.rect(0, 0, 16, 1, i3); t.rect(0, 1, 16, 2, i2); t.rect(0, 3, 16, 1, i1); t.rect(0, 4, 16, 1, i0); t.rect(0, 5, 16, 1, V1);   // walking plate
    for (let x = 2; x < 16; x += 5) { t.set(x, 1, i3); t.set(x, 2, i0); }                                                       // rivets
    t.rect(0, 12, 16, 2, i1); t.rect(0, 12, 16, 1, i2); t.rect(0, 14, 16, 1, V1);                                              // lower chord
    for (let k = 0; k < 7; k++) { const o = kind === 1 ? 8 : 0; t.set((k + o) % 16, 5 + k, i1); t.set((k + o + 1) % 16, 5 + k, i0); t.set((15 - k + o) % 16, 5 + k, i0); }   // lattice
    if (kind === 'l') { t.rect(0, 0, 2, 14, i1); t.rect(0, 0, 1, 14, i2); t.rect(0, 14, 2, 1, V1); t.set(1, 2, i3); t.set(1, 7, i3); }
    if (kind === 'r') { t.rect(14, 0, 2, 14, i0); t.rect(14, 0, 1, 14, i1); t.rect(14, 14, 2, 1, V1); t.set(14, 2, i2); t.set(14, 7, i2); }
    return t;
  };
  S.plat_l = plat('l'); S.plat_m = [plat(0), plat(1)]; S.plat_r = plat('r');

  /* deco stamps for the back wall (stamped by seeded hash, never on a grid rhythm) */
  const crack = (pts) => { const t = new Img(16, 16); pts.forEach(([x, y]) => { t.set(x, y, V1); }); return t; };
  S.deco_crack = [
    crack([[3, 1], [4, 2], [4, 3], [5, 4], [6, 5], [6, 6], [7, 7], [9, 8], [8, 8], [9, 9], [10, 10], [5, 5], [4, 6], [3, 7]]),
    crack([[12, 2], [11, 3], [11, 4], [10, 5], [9, 6], [9, 7], [8, 8], [8, 9], [7, 10], [7, 11], [6, 12], [10, 6], [11, 7]]),
    crack([[2, 9], [3, 9], [4, 10], [5, 10], [6, 11], [7, 11], [8, 12], [9, 12], [10, 13], [6, 12], [6, 13]])
  ];
  const stain = (seed) => { const t = new Img(16, 32); for (let y = 0; y < 32; y++) for (let x = 0; x < 16; x++) { const d = Math.abs(x - 8 + Math.sin(y * .4 + seed) * 2) / 7; const lv = (1 - d) * (1 - y / 34) * .9; if (lv > 0 && dith(x, y, lv)) t.set(x, y, V2); } return t; };
  S.deco_stain = [stain(1), stain(4)];
  const plate = new Img(16, 16); plate.rect(1, 1, 14, 14, i0); plate.rect(1, 1, 14, 1, i2); plate.rect(1, 1, 1, 14, i1); plate.rect(1, 14, 14, 1, V1); plate.rect(14, 1, 1, 14, V1);
  plate.rect(5, 5, 6, 6, V1); plate.rect(6, 6, 4, 4, i1); plate.set(7, 7, c('gold2'));
  [[3, 3], [12, 3], [3, 12], [12, 12]].forEach(([x, y]) => { plate.set(x, y, i3); plate.set(x + 1, y + 1, V1); });
  S.deco_plate = plate;
  const vent = new Img(16, 16); vent.rect(2, 3, 12, 10, V1); vent.rect(2, 3, 12, 1, s0); for (let y = 5; y < 12; y += 2) vent.rect(3, y, 10, 1, i0); vent.rect(2, 13, 12, 1, s2);
  S.deco_vent = vent;
  // carved code-glyph sigils: groove + a lit lower lip (carved, not painted)
  S.deco_sigil = ['{', '}', ';', '<', '>', '/', '='].map((ch) => { const t = new Img(16, 16); sigil(t, ch, 7, 5, s2); sigil(t, ch, 6, 4, V1); return t; });
  return S;
}

// HALLS OF THE MACHINE MIND TILESET — bespoke Cyber-Basalt Conduit masonry matching the runtime autotiler contract!
//   sol_in / sol_deep / wall / wall_dark (64x64 seamless) + sol_top / sol_bot / sol_l / sol_r + plat_l / plat_m / plat_r + deco_*
import { Img, c, hash2, dith } from '../../../tools/lib/pix.mjs';
import { masonry, sigil } from '../../../tools/lib/kit.mjs';

export default function tileset() {
  const S = {};
  const V1 = c('void1'), V2 = c('void2');
  const s0 = c('soot0'), s1 = c('soot1'), s2 = c('soot2'), s3 = c('soot3'), s4 = c('soot4');
  const i0 = c('iron0'), i1 = c('iron1'), i2 = c('iron2'), i3 = c('iron3');
  const c1 = c('cold1'), c2 = c('cold2'), C3E = c('cold3', 'e'), C4E = c('cold4', 'e');

  /* 1 · Seamless 64x64 interior & wall macro textures with recessed circuit conduits */
  const solIn = masonry(new Img(64, 64), 0, 0, 64, 64, { bw: 20, bh: 16, cols: [V2, s2, s3, s4], seed: 31, wrap: 64, litP: .45 });
  for (let y = 7; y < 64; y += 16) {
    solIn.rect(0, y, 64, 1, i0);
    for (let x = 6; x < 64; x += 16) { solIn.set(x, y, c2); solIn.set(x + 1, y, i2); }
  }
  S.sol_in = solIn;
  S.sol_deep = masonry(new Img(64, 64), 0, 0, 64, 64, { bw: 28, bh: 16, cols: [V1, s0, s1, null], seed: 39, wrap: 64, darkP: .6 });

  const wall = masonry(new Img(64, 64), 0, 0, 64, 64, { bw: 16, bh: 8, cols: [s0, s1, s2, s3], seed: 29, wrap: 64, litP: .18, darkP: .45 });
  for (let x = 15; x < 64; x += 32) {
    wall.rect(x, 0, 2, 64, V1);
    for (let y = 5; y < 64; y += 16) wall.set(x, y, c1);
  }
  S.wall = wall;
  S.wall_dark = masonry(new Img(64, 64), 0, 0, 64, 64, { bw: 16, bh: 8, cols: [V2, s0, s1, null], seed: 37, wrap: 64, darkP: .55 });

  /* 2 · Top, bottom & side edge overlays: forged steel-basalt coping with glowing cyan micro-nodes */
  const top = (joints, extra) => {
    const t = new Img(16, 16);
    t.rect(0, 0, 16, 1, i3);
    t.rect(0, 1, 16, 2, s3);
    t.rect(0, 3, 16, 1, i0);
    t.rect(0, 4, 16, 1, V2);
    t.rect(0, 5, 16, 1, s1);
    joints.forEach((j) => { t.rect(j, 0, 1, 4, V1); if (j + 1 < 16) t.set(j + 1, 0, s4); });
    if (extra) extra(t);
    return t;
  };
  S.sol_top = [
    top([7], (t) => { t.set(3, 2, c2); t.set(12, 2, c2); }),
    top([12], (t) => { t.set(5, 2, C3E); }),
    top([4], (t) => { t.rect(9, 1, 3, 2, i2); t.set(10, 1, C3E); }),
    top([2, 11], (t) => { t.set(6, 2, c2); t.set(14, 1, i3); }),
    top([8], (t) => { t.rect(2, 1, 4, 1, i3); t.set(12, 2, c1); }),
  ];

  const bot = (f) => { const t = new Img(16, 16); t.rect(0, 15, 16, 1, V1); t.rect(0, 14, 16, 1, i0); t.rect(0, 13, 16, 1, s0); if (f) f(t); return t; };
  S.sol_bot = [bot(), bot((t) => { t.set(6, 13, c1); t.set(12, 14, V1); })];

  const side = (lit, f) => {
    const t = new Img(16, 16);
    if (lit) { t.rect(0, 0, 1, 16, i2); t.rect(1, 0, 1, 16, s2); for (let y = 4; y < 16; y += 8) t.set(0, y, c2); }
    else { t.rect(15, 0, 1, 16, V1); t.rect(14, 0, 1, 16, i0); }
    if (f) f(t);
    return t;
  };
  S.sol_l = [side(true), side(true, (t) => { t.set(0, 8, C3E); })];
  S.sol_r = [side(false), side(false, (t) => { t.set(14, 6, V1); })];

  /* 3 · One-way steel data-conduit gantry platforms */
  const plat = (kind) => {
    const t = new Img(16, 16);
    t.rect(0, 0, 16, 1, i3); t.rect(0, 1, 16, 2, i2); t.rect(0, 3, 16, 2, V1); t.rect(0, 5, 16, 1, i0);
    for (let x = 2; x < 15; x += 5) { t.set(x, 3, C3E); t.set(x + 1, 4, c2); }
    t.rect(0, 12, 16, 2, i1); t.rect(0, 12, 16, 1, i2); t.rect(0, 14, 16, 1, V1);
    for (let k = 0; k < 6; k++) { const o = kind === 1 ? 8 : 0; t.set((k + o) % 16, 6 + k, i1); t.set((15 - k + o) % 16, 6 + k, i0); }
    if (kind === 'l') { t.rect(0, 0, 2, 14, i2); t.set(1, 3, C4E); }
    if (kind === 'r') { t.rect(14, 0, 2, 14, i1); t.set(14, 3, C3E); }
    return t;
  };
  S.plat_l = plat('l'); S.plat_m = [plat(0), plat(1)]; S.plat_r = plat('r');

  /* 4 · Wall circuit traces, vents, plates & code-sigils */
  S.deco_crack = [0, 1, 2].map((k) => {
    const t = new Img(16, 16), y0 = 3 + k * 2;
    t.line(2, y0, 9, y0, V1); t.line(9, y0, 9, 13, V1); t.line(9, 13, 14, 13, V1);
    t.set(2, y0, c1); t.set(14, 13, c2);
    return t;
  });
  S.deco_stain = [1, 4].map((seed) => {
    const t = new Img(16, 32);
    for (let y = 0; y < 32; y++) for (let x = 0; x < 16; x++) {
      const d = Math.abs(x - 8 + Math.sin(y * .35 + seed) * 1.5) / 6;
      const lv = (1 - d) * (1 - y / 34) * .85;
      if (lv > 0 && dith(x, y, lv)) t.set(x, y, V1);
    }
    return t;
  });
  {
    const plate = new Img(16, 16);
    plate.rect(1, 1, 14, 14, i0); plate.rect(1, 1, 14, 1, i2); plate.rect(1, 14, 14, 1, V1);
    plate.rect(5, 5, 6, 6, V1); plate.rect(7, 7, 2, 2, C4E);
    [[3, 3], [12, 3], [3, 12], [12, 12]].forEach(([x, y]) => plate.set(x, y, i3));
    S.deco_plate = plate;
  }
  {
    const vent = new Img(16, 16);
    vent.rect(2, 3, 12, 10, V1); vent.rect(2, 3, 12, 1, i1);
    for (let y = 5; y < 12; y += 2) vent.rect(3, y, 10, 1, i0);
    S.deco_vent = vent;
  }
  S.deco_sigil = ['{', '}', ';', '<', '>', '/', '='].map((ch) => {
    const t = new Img(16, 16);
    sigil(t, ch, 7, 5, c1); sigil(t, ch, 6, 4, V1);
    return t;
  });
  return S;
}

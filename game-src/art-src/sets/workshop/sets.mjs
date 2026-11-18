// THE FORGOTTEN WORKSHOP — set pieces and props. Warm, cramped, origin story.
// Everything is drawn into palette-indexed images with the pixel kit: placed light, hard pixels,
// banded + dithered ramps. Pixels flagged emissive (c(name,'e')) are drawn again AFTER the
// darkness pass, so fire and runes glow independently of ambient light.
// Arrays are animation strips. `cuts` are masks that carve precise openings out of the back wall.
import { Img, c, step, dith, hash2, EMI, IDX } from '../../../tools/lib/pix.mjs';
import { masonry, archFill, archRing, archHalf, gear, chain, flame, bands, ironBand, rivets, stencil, sigil } from '../../../tools/lib/kit.mjs';

const V0 = c('void0'), V1 = c('void1'), V2 = c('void2');
const s0 = c('soot0'), s1 = c('soot1'), s2 = c('soot2'), s3 = c('soot3'), s4 = c('soot4');
const i0 = c('iron0'), i1 = c('iron1'), i2 = c('iron2'), i3 = c('iron3');
const g0 = c('gold0'), g1 = c('gold1'), g2 = c('gold2'), g3 = c('gold3'), g4 = c('gold4');
const E = (n) => c(n, 'e');
const FIRE = [E('ember1'), E('ember2'), E('ember3'), E('ember4'), E('gold3'), E('gold4')];
const RUNEFIRE = [E('rune0'), E('rune1'), E('rune2'), E('rune3'), E('rune4'), E('rune5')];
const STONE = [V2, s2, s3, s4];         // set-piece stone: one step lighter than the wall behind it
const STONE_D = [V1, s1, s2, s3];

const A = (rows, map) => Img.ascii(rows, map);
const TOOL = { i: i0, j: i1, k: i2, l: i3, w: g0, x: g1, y: g2, z: g3, 0: V1 };

export default function sets() {
  const S = {}, cuts = {};

  /* ============ THE GREAT FORGE (hero set piece, 144x192) ============ */
  {
    const W = 144, H = 192, im = new Img(W, H), tmp = new Img(W, H);
    masonry(tmp, 0, 0, W, H, { bw: 22, bh: 12, cols: STONE, seed: 31, litP: .55 });
    // chimney 56 wide (y 0..40), hood trapezoid (y 40..96), body (y 96..192)
    const half = (y) => y < 40 ? 28 : y < 96 ? 28 + (y - 40) / 56 * 44 : 72;
    for (let y = 0; y < H; y++) { const h = Math.round(half(y)); for (let x = 72 - h; x < 72 + h; x++) im.set(x, y, tmp.get(x, y)); }
    for (let y = 0; y < H; y++) { const h = Math.round(half(y)); im.set(72 - h, y, s4); im.set(72 - h + 1, y, s3); im.set(72 + h - 1, y, V2); im.set(72 + h - 2, y, s1); }
    // hood: shaded under-lip where it meets the body, iron bands with rivets
    im.rect(0, 96, W, 2, V2); im.rect(0, 98, W, 1, s1);
    ironBand(im, 44, 34, 56, 5); ironBand(im, 20, 66, 104, 5); ironBand(im, 2, 90, 140, 5);
    // mouth: pointed arch full of banded fire-light
    const mw = 68, mh = 76, mt = 108, sp = 40;
    archRing(im, 72, mt, mw, mh, sp, 8, [V2, s3, s4, c('bone1')], 5);
    const glow = new Img(W, H);
    bands(glow, 72 - mw / 2, mt, mw, mh, [[0, E('ember0')], [.22, E('ember1')], [.45, E('ember2')], [.66, E('ember3')], [.82, E('ember4')], [.93, E('gold3')], [1, E('gold4')]], { soft: .6 });
    archFill(im, 72, mt, mw, mh, sp, (x, y) => {
      const v = glow.get(x, y), dx = Math.abs(x - 72) / (mw / 2);
      return dx > .8 && dith(x, y, (dx - .8) * 4) ? step(v, -1) : v;           // throat darkens toward the jambs
    });
    // coals + grate bars
    for (let x = 72 - 30; x < 72 + 30; x++) { const hgt = 3 + Math.floor(hash2(x >> 2, 1, 4) * 5); for (let y = 0; y < hgt; y++) im.set(x, mt + mh - 1 - y, hash2(x >> 1, y >> 1, 9) < .3 ? E('gold4') : hash2(x, y, 3) < .5 ? E('ember2') : V2); }
    for (let x = 72 - 26; x <= 72 + 26; x += 9) { im.rect(x, mt + 34, 2, mh - 34, V1); im.rect(x + 2, mt + 36, 1, mh - 38, E('ember3')); }
    im.rect(72 - 34, mt + 34, 68, 3, V1); im.rect(72 - 34, mt + 33, 68, 1, i1);
    // keystone with the first sigil of the Architect
    im.rect(66, mt - 13, 12, 14, s4); im.rect(66, mt - 13, 12, 1, c('bone1')); im.rect(77, mt - 13, 1, 14, s2); im.rect(66, mt, 12, 1, V2);
    sigil(im, '{', 68, mt - 10, E('rune3')); sigil(im, '}', 72, mt - 10, E('rune3'));
    // hearth ledge
    im.rect(0, 184, W, 8, s3); im.rect(0, 184, W, 1, s4); im.rect(0, 191, W, 1, V2);
    for (let x = 9; x < W; x += 23) im.rect(x, 185, 1, 6, s1);
    // soot licking up from the mouth
    for (let y = 60; y < mt - 8; y++) for (let x = 40; x < 104; x++) { const lv = (1 - Math.abs(x - 72) / 30) * ((y - 60) / (mt - 68)) * .75; if (lv > 0 && dith(x, y, lv) && (im.get(x, y) & IDX) !== i1 && (im.get(x, y) & IDX) !== i2 && (im.get(x, y) & IDX) !== i0) im.set(x, y, V2); }
    im.outline(V1);
    S.forge = im;
    S.forge_chimney = (() => { const t = new Img(56, 32); for (let y = 0; y < 32; y++) for (let x = 0; x < 56; x++) t.set(x, y, tmp.get(44 + x, y + 4)); for (let y = 0; y < 32; y++) { t.set(0, y, V1); t.set(1, y, s4); t.set(2, y, s3); t.set(54, y, s1); t.set(55, y, V1); } ironBand(t, 1, 12, 54, 4); return t; })();
    // living fire inside the mouth: 8 frames
    S.forge_fire = Array.from({ length: 8 }, (_, f) => {
      const t = new Img(56, 44);
      for (let k = 0; k < 4; k++) { const fl = flame(18 + (k % 2) * 6, 26 + ((k * 7) % 3) * 6, (f + k * 3) % 8, 8, FIRE, { seed: k * 1.7, sparks: 1, fat: 1.1 }); t.blit(fl, 2 + k * 11, 44 - fl.h); }
      return t;
    });
  }

  /* ============ BELLOWS (6 frames, 56x40): leather lungs feeding the forge ============ */
  S.bellows = Array.from({ length: 6 }, (_, f) => {
    const t = new Img(56, 44), k = [0, .35, .8, 1, .6, .2][f], open = 6 + Math.round(k * 12);
    const by = 34;                                   // bottom board
    t.rect(4, by, 40, 3, g1); t.rect(4, by, 40, 1, g2); t.rect(4, by + 2, 40, 1, g0);
    // leather folds between the boards
    for (let x = 6; x < 42; x++) { const hgt = Math.round(open * (1 - (x - 6) / 46)); for (let y = 0; y < hgt; y++) { const fold = ((y * 3 / Math.max(3, hgt) * 2) | 0) % 2; t.set(x, by - 1 - y, fold ? c('ember1') : c('ember0')); } if (hgt > 0) t.set(x, by - hgt, c('ember2')); }
    // top board, hinged at the nozzle
    for (let x = 4; x < 44; x++) { const y = by - 1 - Math.round(open * (1 - (x - 6) / 46)); t.rect(x, y - 3, 1, 3, g1); t.set(x, y - 3, g2); t.set(x, y - 1, g0); }
    rivets(t, 8, by + 1, 40, 8, i3, i0);
    // nozzle + handle
    t.rect(44, by - 3, 10, 4, i1); t.rect(44, by - 3, 10, 1, i2); t.rect(44, by, 10, 1, i0); t.rect(53, by - 4, 2, 6, i2);
    t.rect(0, by - 6 - open, 6, 2, g1); t.rect(0, by - 6 - open, 2, 5, g2);
    t.rect(8, by + 3, 3, 6, i0); t.rect(36, by + 3, 3, 6, i0); t.rect(6, by + 8, 36, 2, i0); t.rect(6, by + 8, 36, 1, i1);
    return t.outline(V1);
  });

  /* ============ GEARS: rotating strips (one spoke-period per loop) ============ */
  const IRON = [V1, i0, i1, i2], BRASS = [V1, g0, g1, g2], DARK = [V0, V2, s1, s2];
  const strip = (R, teeth, spokes, cols, o) => Array.from({ length: 6 }, (_, f) => gear(R, teeth, spokes, f / 6, cols, o));
  S.gear_s = strip(11, 8, 4, BRASS, { rivets: 0 });
  S.gear_m = strip(20, 12, 6, IRON, { rivets: 1 });
  S.gear_l = strip(34, 16, 8, IRON, { rivets: 1 });
  S.gear_xl = strip(52, 24, 8, DARK, { rivets: 1, tooth: 6 });
  S.gear_brass = strip(26, 12, 6, BRASS, { rivets: 1 });

  /* ============ GEAR-WALL housing at the exit (static, 240x272) ============ */
  {
    const W = 240, H = 272, im = new Img(W, H);
    masonry(im, 0, 0, W, H, { bw: 26, bh: 14, cols: STONE_D, seed: 77 });
    // a deep round-headed recess where the train turns
    const rec = new Img(W, H); archFill(rec, 120, 20, 200, 252, 150, 1);
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (rec.get(x, y)) im.set(x, y, hash2(x >> 3, y >> 3, 5) < .5 ? V1 : V2);
    archRing(im, 120, 20, 200, 252, 150, 10, STONE, 9);
    // axle beams
    [84, 150, 214].forEach((y) => { ironBand(im, 14, y, 212, 6, { rivets: 14 }); });
    im.rect(0, 0, W, 2, s4); im.rect(0, H - 6, W, 6, s3); im.rect(0, H - 6, W, 1, s4);
    im.outline(V1);
    S.gearwall = im;
  }

  /* ============ ARCHITECTURE ============ */
  // tall pillar (48 wide): base, fluted shaft, capital. Built as one 48x352 piece.
  {
    const H = 352, im = new Img(48, H);
    for (let y = 0; y < H; y++) for (let x = 10; x < 38; x++) { const u = (x - 10) / 27; let v = u < .12 ? s4 : u < .45 ? s3 : u < .8 ? s2 : s1; if ((x - 10) % 7 === 6) v = step(v, -1); if (y % 44 === 43) v = V2; if (y % 44 === 0 && v !== V2) v = step(v, 1); im.set(x, y, v); }
    const block = (y, h, inset) => { for (let j = 0; j < h; j++) for (let x = inset; x < 48 - inset; x++) { const u = (x - inset) / (47 - inset * 2); im.set(x, y + j, j === 0 ? s4 : j === h - 1 ? V2 : u < .15 ? s4 : u < .6 ? s3 : s2); } };
    block(0, 6, 0); block(6, 5, 3); block(11, 4, 6); block(15, 3, 8);                       // capital
    block(H - 10, 10, 0); block(H - 18, 8, 3); block(H - 24, 6, 6);                           // base
    ironBand(im, 9, 120, 30, 4, { rivets: 6 }); ironBand(im, 9, 240, 30, 4, { rivets: 6 });
    S.pillar = im.outline(V1);
  }
  // pointed arch opening in the back wall (frame + the mask that cuts the wall away)
  const archPiece = (w, h, sp, t, seed) => {
    const W = w + t * 2 + 2, H = h + t + 1, im = new Img(W, H), cut = new Img(W, H);
    archRing(im, W / 2, t + 1, w, h, sp, t, STONE, seed);
    archFill(cut, W / 2, t + 1, w, h, sp, 1);
    im.rect(1, H - 3, t, 3, s4); im.rect(W - 1 - t, H - 3, t, 3, s3);
    return [im.outline(V1), cut];
  };
  [S.arch_big, cuts.arch_big] = archPiece(112, 176, 96, 9, 3);
  [S.arch_mid, cuts.arch_mid] = archPiece(72, 128, 72, 7, 8);
  // lancet window: iron mullions over furnace-lit glass (emissive, banded)
  {
    const w = 34, h = 126, t = 6, W = w + t * 2 + 2, H = h + t + 9, im = new Img(W, H);
    archRing(im, W / 2, t + 1, w, h, 84, t, STONE, 12);
    const gl = new Img(W, H);
    bands(gl, 0, t + 1, W, h, [[0, E('ember1')], [.3, E('ember2')], [.62, E('ember3')], [.86, E('ember4')], [1, E('gold3')]], { soft: .7 });
    archFill(im, W / 2, t + 1, w, h, 84, (x, y) => gl.get(x, y));
    const hw = archHalf(w, h, 84);
    for (let y = 0; y < h; y++) { const a = Math.round(W / 2 - hw[y]), b = Math.round(W / 2 + hw[y]); if (b - a < 3) continue; im.set(Math.round(W / 2), t + 1 + y, V1); im.set(Math.round(W / 2) - 1, t + 1 + y, i0); if (y % 14 === 13) for (let x = a; x < b; x++) im.set(x, t + 1 + y, V1); }
    // gear-rose tracery in the head
    const gr = gear(9, 8, 4, 0, [V1, V1, V1, V1], { hole: 2 }); im.blit(gr, Math.round(W / 2) - 10, t + 18);
    im.rect(0, H - 8, W, 5, s3); im.rect(0, H - 8, W, 1, s4); im.rect(2, H - 3, W - 4, 3, s2);
    S.window = im.outline(V1);
  }
  // rafters (tileable truss strip, 96x48) for the playfield ceiling
  {
    const im = new Img(96, 48);
    im.rect(0, 0, 96, 9, g0); im.rect(0, 0, 96, 1, g1); im.rect(0, 8, 96, 1, V1); im.rect(0, 9, 96, 1, V2);
    for (let x = 0; x < 96; x += 2) if (hash2(x, 3, 1) < .25) im.rect(x, 2 + Math.floor(hash2(x, 1, 2) * 5), 5, 1, s0);
    im.rect(0, 38, 96, 7, g0); im.rect(0, 38, 96, 1, g1); im.rect(0, 44, 96, 1, V1);
    for (let k = 0; k < 2; k++) { const x0 = k * 48; im.line(x0 + 2, 37, x0 + 24, 10, g0, 3); im.line(x0 + 24, 10, x0 + 46, 37, g0, 3); im.line(x0 + 1, 37, x0 + 23, 10, g1, 1); im.rect(x0 + 22, 9, 5, 30, g0); im.rect(x0 + 22, 9, 1, 30, g1); im.rect(x0 + 21, 5, 7, 5, i1); im.rect(x0 + 21, 5, 7, 1, i2); im.set(x0 + 24, 7, i3); }
    S.rafter = im.outline(V1);
  }

  /* ============ FURNITURE & TOOLS ============ */
  const hammer = A(['.kkkkkk.', 'ljjjjjji', 'ljjjjjji', '.iiiiii.', '...xw...', '...xw...', '...xw...', '...xw...', '...xw...', '...xw...', '...xw...', '...xw...', '...xw...', '...yw...'], TOOL);
  const tongs = A(['.k..k.', '.j..j.', '.j..j.', '..jj..', '..kj..', '..jj..', '.j..j.', '.j..j.', '.j..j.', '.j..j.', '.j..j.', '.j..j.', '.j..j.', '.i..i.', '.i..i.'], TOOL);
  const wrench = A(['k...k', 'kj.jk', '.jjj.', '..j..', '..k..', '..j..', '..j..', '..j..', '..j..', '..j..', '..j..', '.jjj.', '.j.j.', '.jjj.'], TOOL);
  const bigkey = A(['..zzz..', '.z...z.', 'z..y..z', 'z.yyy.z', 'z..y..z', '.z...z.', '..zzz..', '...y...', '...y...', '...y...', '...y...', '...y...', '...y...', '...yyy.', '...y...', '...yy..', '...y...'], TOOL);
  const saw = A(['xxxxx.......', 'xw.wx.......', 'xxxxxkkkkkkk', '..ijjjjjjjjj', '..i.i.i.i.i.'], TOOL);
  {
    const im = new Img(96, 44);
    im.rect(0, 2, 96, 5, g1); im.rect(0, 2, 96, 1, g2); im.rect(0, 6, 96, 1, g0); im.rect(0, 7, 96, 1, V1);
    for (let x = 6; x < 96; x += 14) { im.rect(x, 5, 2, 3, i2); im.set(x, 8, i0); }
    im.blit(hammer, 3, 9); im.blit(tongs, 18, 9); im.blit(wrench, 33, 9); im.blit(bigkey, 45, 9); im.blit(hammer, 60, 9); im.blit(wrench, 75, 9); im.blit(tongs, 86, 9);
    S.toolrack = im.outline(V1);
  }
  {
    // shelf of half-finished tools: boards, brackets, unfinished blanks, a small rune core
    const im = new Img(88, 58);
    for (const y of [20, 48]) { im.rect(0, y, 88, 4, g1); im.rect(0, y, 88, 1, g2); im.rect(0, y + 3, 88, 1, g0); im.rect(0, y + 4, 88, 1, V1); im.line(6, y + 4, 12, y + 9, i0); im.line(81, y + 4, 75, y + 9, i0); }
    const blank = (x, y, w, h, col) => { im.rect(x, y - h, w, h, col); im.rect(x, y - h, w, 1, step(col, 1)); im.rect(x + w - 1, y - h, 1, h, step(col, -1)); };
    blank(4, 20, 10, 6, i1); blank(18, 20, 5, 12, i0); blank(26, 20, 12, 4, g1); blank(44, 20, 6, 9, i1); blank(54, 20, 14, 5, i0); blank(72, 20, 8, 10, g0);
    im.blit(gear(6, 8, 4, .2, BRASS), 30, 3); im.blit(saw, 56, 10);
    blank(3, 48, 16, 7, i0); blank(24, 48, 7, 14, i1); blank(36, 48, 18, 5, g0); blank(60, 48, 6, 10, i1); blank(70, 48, 12, 8, i0);
    im.rect(40, 36, 6, 6, E('rune2')); im.rect(41, 37, 4, 4, E('rune4')); im.rect(39, 42, 8, 1, i2);            // a sleeping rune core
    S.shelf = im.outline(V1);
  }
  {
    // workbench with vise and a pinned blueprint
    const im = new Img(104, 46);
    im.rect(0, 16, 104, 6, g1); im.rect(0, 16, 104, 1, g2); im.rect(0, 21, 104, 1, g0); im.rect(0, 22, 104, 1, V1);
    for (const x of [4, 92]) { im.rect(x, 23, 7, 23, g0); im.rect(x, 23, 1, 23, g1); }
    im.rect(11, 34, 81, 3, g0); im.rect(11, 34, 81, 1, g1);
    im.rect(70, 6, 14, 10, i1); im.rect(70, 6, 14, 1, i2); im.rect(84, 9, 10, 3, i2); im.rect(93, 5, 2, 11, i1); im.rect(66, 2, 6, 14, i0); im.rect(66, 2, 6, 1, i1);
    const P1 = c('bone2'), P2 = c('bone3');
    im.rect(14, 4, 34, 12, c('cold1')); im.rect(14, 4, 34, 1, c('cold2'));
    im.line(18, 13, 30, 7, c('cold3')); im.line(30, 7, 44, 13, c('cold3')); im.rect(22, 9, 5, 1, c('cold3')); im.set(36, 6, c('cold4')); im.set(40, 11, c('cold4'));
    im.blit(hammer, 50, 2);
    im.rect(8, 12, 4, 4, P1); im.rect(9, 11, 4, 1, P2);
    S.workbench = im.outline(V1);
  }
  // anvil on a stump (prop, 34x30)
  {
    const im = A([
      '.kkkkkkkkkkkkkkkkkkkkkkkkk.......',
      'lkkjjjjjjjjjjjjjjjjjjjjjjjjjkk...',
      'ljjjjjjjjjjjjjjjjjjjjjjjjjjjjjjk.',
      '.ijjjjjjjjjjjjjjjjjjjjjjjjiiiii..',
      '...iijjjjjjjjjjjjjjjjjiii........',
      '......ikjjjjjjjjjjjii............',
      '.......kjjjjjjjjjji..............',
      '.......kjjjjjjjjjji..............',
      '......kkjjjjjjjjjjii.............',
      '....kkkjjjjjjjjjjjjjii...........',
      '...lkkkkkkkkkkkkkkkkkki..........',
      '...ijjjjjjjjjjjjjjjjjji..........',
      '....wxxxxyxxxxxxxxxxxw...........',
      '....wxxwxxxxxxwxxxxxxw...........',
      '....wxxwxxxxxxwxxwxxxw...........',
      '....wxxxxxwxxxxxxwxxxw...........',
      '....wxxxxxwxxxxxxxxxxw...........',
      '....wwxxxxxxxwxxxxxxww...........'], TOOL);
    S.anvil = im.outline(V1);
  }
  // crates & barrel
  const crate = (w, h, seed) => { const im = new Img(w, h); for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { let v = ((x / 6) | 0) % 2 ? g1 : g0; if (hash2(x, y >> 2, seed) < .12) v = g0; im.set(x, y, v); } im.rect(0, 0, w, 3, g1); im.rect(0, 0, w, 1, g2); im.rect(0, h - 3, w, 3, g0); im.rect(0, 0, 3, h, g1); im.rect(w - 3, 0, 3, h, g0); im.line(3, 3, w - 4, h - 4, g1, 2); im.line(3, 3, w - 5, h - 5, g2, 1); [[1, 1], [w - 2, 1], [1, h - 2], [w - 2, h - 2]].forEach(([x, y]) => im.set(x, y, i3)); return im.outline(V1); };
  S.crate = crate(30, 30, 1); S.crate_s = crate(20, 18, 5);
  {
    const im = new Img(20, 28);
    for (let y = 0; y < 28; y++) { const bulge = Math.round(2 * Math.sin(y / 27 * Math.PI)); for (let x = 2 - bulge; x < 18 + bulge; x++) { const u = (x - (2 - bulge)) / (15 + bulge * 2); im.set(x, y, u < .2 ? g2 : u < .65 ? g1 : g0); if ((x + 2) % 4 === 0) im.set(x, y, g0); } }
    for (const y of [4, 13, 22]) { for (let x = 0; x < 20; x++) if (im.get(x, y)) { im.set(x, y, i1); im.set(x, y + 1, i0); } im.set(4, y, i3); }
    S.barrel = im.outline(V1);
  }
  // pinned blueprint scroll
  {
    const im = new Img(40, 30); const B1 = c('cold0'), B2 = c('cold1'), L = c('cold3');
    im.rect(1, 2, 38, 26, B2); for (let y = 2; y < 28; y++) for (let x = 1; x < 39; x++) if (dith(x, y, .3) && (x + y) % 9 < 3) im.set(x, y, B1);
    im.rect(1, 2, 38, 2, c('cold2')); im.rect(1, 26, 38, 2, B1);
    im.ring(14, 15, 5, 7.5, L); im.rect(13, 14, 3, 3, L); for (let k = 0; k < 8; k++) im.set(Math.round(14 + Math.cos(k * .785) * 9), Math.round(15 + Math.sin(k * .785) * 9), L);
    im.line(24, 9, 36, 9, L); im.line(24, 13, 33, 13, L); im.line(24, 17, 35, 17, L); im.line(24, 21, 30, 21, L); im.rect(28, 22, 7, 3, c('cold4'));
    im.set(2, 3, g3); im.set(37, 3, g3);
    S.blueprint = im.outline(V1);
  }
  // wall paint: BUILD / FAIL / REBUILD — flaking bone-white, dripping
  {
    const im = new Img(72, 48); const P = c('bone2'), Pd = c('bone1');
    const paint = (x, y) => hash2(x, y, 3) < .05 ? 0 : hash2(x, y, 8) < .22 ? Pd : P;
    stencil(im, 'BUILD', 10, 2, paint); stencil(im, 'FAIL', 14, 16, paint); stencil(im, 'REBUILD', 0, 30, (x, y) => hash2(x, y, 5) < .04 ? 0 : hash2(x, y, 8) < .15 ? c('bone2') : c('bone3'));
    for (const [x, y, l] of [[13, 11, 3], [33, 11, 2], [22, 25, 4], [5, 39, 5], [30, 39, 3], [47, 39, 6], [38, 25, 2]]) im.rect(x, y, 1, l, Pd);
    S.walltext = im;
  }
  // pipes
  {
    const h = new Img(32, 10); h.rect(0, 1, 32, 8, i0); h.rect(0, 1, 32, 1, i1); h.rect(0, 2, 32, 2, i2); h.rect(0, 4, 32, 2, i1); h.rect(0, 8, 32, 1, V1); h.rect(13, 0, 5, 10, i1); h.rect(13, 0, 5, 1, i3); h.rect(13, 9, 5, 1, V1); h.set(15, 3, i3);
    S.pipe_h = h;
    const v = new Img(10, 32); v.rect(1, 0, 8, 32, i0); v.rect(1, 0, 1, 32, i1); v.rect(2, 0, 2, 32, i2); v.rect(4, 0, 2, 32, i1); v.rect(8, 0, 1, 32, V1); v.rect(0, 13, 10, 5, i1); v.rect(0, 13, 10, 1, i3); v.rect(0, 17, 10, 1, V1);
    S.pipe_v = v;
  }

  /* ============ LIGHT SOURCES ============ */
  // brazier: iron bowl on a tripod (flame is a separate emissive strip)
  {
    const im = new Img(24, 30);
    for (let y = 0; y < 8; y++) { const hw = Math.round(11 - y * y * .13); for (let x = 12 - hw; x < 12 + hw; x++) { const u = (x - (12 - hw)) / (hw * 2); im.set(x, y, y === 0 ? i2 : u < .25 ? i2 : u < .7 ? i1 : i0); } }
    im.rect(1, 0, 22, 1, i3); for (let x = 3; x < 22; x += 4) im.set(x, 2, V1);
    im.rect(11, 8, 2, 16, i1); im.rect(11, 8, 1, 16, i2); im.line(11, 14, 3, 29, i1); im.line(12, 14, 20, 29, i0); im.rect(1, 29, 5, 1, i1); im.rect(18, 29, 5, 1, i0); im.rect(9, 24, 6, 2, i0); im.rect(9, 24, 6, 1, i2);
    for (let x = 4; x < 20; x += 2) im.set(x, 0, hash2(x, 0, 1) < .5 ? E('ember3') : E('gold3'));               // coals in the bowl
    S.brazier = im.outline(V1);
    S.flame = Array.from({ length: 8 }, (_, f) => flame(16, 22, f, 8, FIRE, { seed: .4 }));
    S.flame_b = Array.from({ length: 8 }, (_, f) => flame(14, 18, f, 8, FIRE, { seed: 2.2, fat: .9 }));
  }
  // hanging cage lamp on a chain
  {
    const im = new Img(12, 18);
    im.rect(5, 0, 2, 3, i1); im.rect(2, 3, 8, 2, i1); im.rect(2, 3, 8, 1, i2); im.rect(1, 5, 1, 9, i0); im.rect(10, 5, 1, 9, i0); im.rect(5, 5, 1, 9, i0); im.rect(1, 14, 10, 2, i1); im.rect(3, 16, 6, 1, i0); im.rect(5, 17, 2, 1, i0);
    im.rect(3, 7, 2, 6, E('gold3')); im.rect(6, 7, 3, 6, E('ember4')); im.rect(4, 9, 3, 3, E('gold4'));
    S.cagelamp = im.outline(V1);
  }
  // rune-hearth (rest point): ring of carved stones around a violet rune-fire
  {
    const im = new Img(44, 16);
    for (let k = 0; k < 6; k++) { const x = 1 + k * 7, hgt = 7 + (k % 2) * 2 + (k === 2 || k === 3 ? -2 : 0); im.rect(x, 16 - hgt, 6, hgt, s3); im.rect(x, 16 - hgt, 6, 1, s4); im.rect(x + 5, 16 - hgt, 1, hgt, s1); im.set(x, 16 - hgt, s3); }
    sigil(im, '<', 2, 8, E('rune2')); sigil(im, '/', 16, 9, E('rune3')); sigil(im, '>', 37, 8, E('rune2')); sigil(im, '=', 30, 7, E('rune2'));
    im.rect(15, 13, 14, 3, V2); for (let x = 16; x < 28; x += 2) im.set(x, 13, E('rune3'));
    S.hearth = im.outline(V1);
    S.runefire = Array.from({ length: 8 }, (_, f) => flame(18, 26, f, 8, RUNEFIRE, { seed: 1.1, fat: .95 }));
  }

  /* ============ NOTES ============ */
  const tablet = (lit) => { const im = new Img(22, 22); masonry(im, 0, 0, 22, 22, { bw: 30, bh: 22, cols: [s1, s3, s3, s4], seed: 2, chips: 0 }); im.rect(0, 0, 22, 1, s4); im.rect(0, 21, 22, 1, s1); im.rect(21, 0, 1, 22, s1); im.rect(2, 2, 18, 18, s2); im.rect(2, 2, 18, 1, s1); const col = lit ? E('rune4') : c('rune1'); sigil(im, '{', 4, 6, col); sigil(im, ';', 9, 6, col); sigil(im, '}', 14, 6, col); im.rect(4, 17, 14, 1, lit ? E('rune2') : c('rune0')); return im.outline(V1); };
  S.note_tablet = [tablet(true), tablet(false)];
  const stele = (lit) => { const im = new Img(20, 38); for (let y = 0; y < 38; y++) { const hw = y < 5 ? 5 + y : 10 - (y > 33 ? 0 : 1); for (let x = 10 - hw; x < 10 + hw; x++) { const u = (x - (10 - hw)) / (hw * 2); im.set(x, y, u < .15 ? s4 : u < .7 ? s3 : s2); } } im.rect(0, 34, 20, 4, s3); im.rect(0, 34, 20, 1, s4); im.rect(0, 37, 20, 1, s1); const col = lit ? E('rune4') : c('rune1'); sigil(im, '<', 4, 8, col); sigil(im, '>', 11, 8, col); sigil(im, '/', 8, 20, col); im.rect(5, 18, 10, 1, lit ? E('rune2') : c('rune0')); im.set(6, 5, s2); im.set(7, 6, s2); im.set(13, 30, s2); im.set(14, 31, s2); return im.outline(V1); };
  S.note_stele = [stele(true), stele(false)];

  /* ============ MONUMENTS ============ */
  {
    // statue 'gear': a broken great gear set upright on a plinth, hammer laid against it
    const im = new Img(64, 92);
    const gr = gear(26, 12, 6, .3, [V1, s2, s3, s4]); im.blit(gr, 5, 4);
    for (let y = 4; y < 30; y++) for (let x = 40; x < 64; x++) if (x - 40 + (30 - y) > 30 + hash2(x >> 2, y >> 2, 3) * 6) im.set(x, y, 0);        // broken away
    im.rect(4, 62, 56, 6, s3); im.rect(4, 62, 56, 1, s4); im.rect(8, 68, 48, 18, s2); masonry(im, 8, 68, 48, 18, { bw: 16, bh: 9, cols: STONE, seed: 4 }); im.rect(2, 86, 60, 6, s3); im.rect(2, 86, 60, 1, s4); im.rect(2, 91, 60, 1, V2);
    sigil(im, '{', 26, 73, c('rune1')); sigil(im, '}', 33, 73, c('rune1'));
    im.blit(hammer, 44, 48);
    S.statue_gear = im.outline(V1);
  }
  {
    // statue 'anvil': a colossal anvil raised like an altar
    const im = new Img(72, 80);
    const big = new Img(66, 40), src = S.anvil;
    for (let y = 0; y < 20; y++) for (let x = 0; x < 33; x++) { const v = src.get(x + 1, y + 1); if (v && y < 12) { const m = { [i0]: s2, [i1]: s3, [i2]: s4, [i3]: s4 }[v & IDX] || s2; big.rect(x * 2, y * 2, 2, 2, m); } }
    // re-cut the doubled pixels so it is carved stone, not a scaled sprite
    for (let y = 0; y < 40; y++) for (let x = 0; x < 66; x++) { if (!big.get(x, y)) continue; if (!big.get(x, y - 1)) big.set(x, y, s4); else if (!big.get(x, y + 1) || !big.get(x + 1, y)) big.set(x, y, s1); else if (hash2(x >> 2, y >> 2, 6) < .2) big.set(x, y, s2); }
    im.blit(big, 4, 16);
    im.rect(8, 40, 56, 5, s3); im.rect(8, 40, 56, 1, s4); masonry(im, 12, 45, 48, 27, { bw: 16, bh: 9, cols: STONE, seed: 14 }); im.rect(6, 72, 60, 8, s3); im.rect(6, 72, 60, 1, s4); im.rect(6, 79, 60, 1, V2);
    sigil(im, '=', 34, 54, c('rune1'));
    S.statue_anvil = im.outline(V1);
  }

  /* ============ DOOR (64x96): stone arch + iron-bound leaf that lifts like a portcullis ============ */
  {
    const [frame, cut] = archPiece(44, 84, 56, 9, 21);
    S.door_frame = frame; cuts.door = cut;
    const leaf = new Img(frame.w, frame.h);
    archFill(leaf, frame.w / 2, 10, 44, 84, 56, (x, y) => { const p = ((x - 9) / 6) | 0; let v = p % 2 ? g1 : g0; if ((x - 9) % 6 === 0) v = V2; if (hash2(x, y >> 3, 2) < .08) v = g0; return v; });
    for (const y of [34, 58, 82]) for (let x = 0; x < frame.w; x++) if (leaf.get(x, y)) { leaf.set(x, y - 1, i2); leaf.set(x, y, i1); leaf.set(x, y + 1, i1); leaf.set(x, y + 2, i0); if (x % 7 === 3) leaf.set(x, y, i3); }
    const cx = Math.round(frame.w / 2);
    leaf.ring(cx, 46, 5, 7.5, i1); leaf.ring(cx, 46, 0, 4.5, V2); sigil(leaf, '/', cx - 2, 42, E('rune3'));
    S.door_leaf = leaf;
    const dark = new Img(frame.w, frame.h); archFill(dark, frame.w / 2, 10, 44, 84, 56, (x, y) => (y > 70 && dith(x, y, (y - 70) / 40) ? V2 : V1));
    S.door_dark = dark;
  }

  /* ============ CHAINS & HOOKS (8-frame sway) ============ */
  const hook = A(['.j.', '.j.', '.k.', '.j.', '.j.', 'j.j', 'j.k', 'j.j', '.jj'], TOOL);
  S.chain_long = Array.from({ length: 8 }, (_, f) => chain(120, f, 8, [i0, i1, i2], { amp: 3 }));
  S.chain_hook = Array.from({ length: 8 }, (_, f) => chain(84, f, 8, [i0, i1, i2], { amp: 4, end: hook }));
  S.chain_short = Array.from({ length: 8 }, (_, f) => chain(52, f, 8, [i0, i1, i2], { amp: 2 }));

  /* ============ FOREGROUND SILHOUETTES (near-black, parallax > 1) ============ */
  const FG = [V0, V0, V1];
  S.fg_chain = Array.from({ length: 8 }, (_, f) => { const im = chain(200, f, 8, FG, { amp: 6, w: 25 }); return im; });
  S.fg_hook = Array.from({ length: 8 }, (_, f) => { const big = new Img(9, 14); big.rect(3, 0, 3, 6, V0); big.rect(0, 5, 3, 7, V0); big.rect(6, 5, 3, 5, V0); big.rect(1, 11, 7, 3, V0); return chain(150, (f + 3) % 8, 8, FG, { amp: 5, w: 25, end: big }); });
  {
    const im = new Img(72, 400);
    for (let y = 0; y < 400; y++) for (let x = 12; x < 60; x++) im.set(x, y, x > 55 ? V1 : V0);
    im.rect(0, 0, 72, 14, V0); im.rect(4, 14, 64, 8, V0); im.rect(8, 22, 56, 6, V0); im.rect(0, 380, 72, 20, V0); im.rect(4, 370, 64, 10, V0);
    for (let y = 40; y < 360; y += 3) if (hash2(y, 2, 2) < .3) im.set(59, y, c('soot1'));
    for (const y of [130, 260]) { im.rect(9, y, 54, 7, V0); im.rect(60, y, 3, 7, V1); }
    S.fg_pillar = im;
  }
  {
    // broken beam + hanging tatters framing the top of the screen
    const im = new Img(240, 56);
    im.rect(0, 0, 240, 16, V0); for (let x = 0; x < 240; x++) { const d = Math.floor(hash2(x >> 3, 1, 7) * 5 + Math.sin(x * .08) * 3); im.rect(x, 16, 1, Math.max(0, d), V0); }
    im.line(30, 14, 86, 52, V0, 7); im.line(210, 14, 160, 44, V0, 6);
    im.rect(0, 15, 240, 1, V1);
    S.fg_beam = im;
  }

  /* ============ BESPOKE ZONE HERO PROPS (CATHEDRAL · REPOSITORY · THRONE HALL · DOJO) ============ */
  // Cathedral Saint of Design Statue (42x80): robed marble architect-saint holding golden compass & halo!
  {
    const im = new Img(42, 80);
    // Stepped carved plinth
    im.rect(3, 72, 36, 8, s3); im.rect(3, 72, 36, 1, s4); im.rect(3, 79, 36, 1, V2);
    masonry(im, 7, 56, 28, 16, { bw: 14, bh: 8, cols: STONE, seed: 19 });
    im.rect(5, 53, 32, 3, s3); im.rect(5, 53, 32, 1, s4);
    sigil(im, '{', 16, 60, E('gold3')); sigil(im, '}', 22, 60, E('gold3'));
    // Carved stone halo ring behind head
    im.ring(21, 13, 7, 9, g2); im.ring(21, 13, 8, 9, E('gold3'));
    // Draped classical marble robes & cowl
    im.poly([[14, 21], [28, 21], [31, 53], [11, 53]], s3);
    im.poly([[14, 21], [21, 21], [20, 53], [11, 53]], s4);
    im.line(18, 24, 16, 52, s2); im.line(24, 24, 26, 52, s2);
    // Sculpted head & bowed face
    im.ellipse(21, 14, 4.5, 5.5, s3); im.ellipse(20, 13, 3, 4, s4);
    // Golden Architect's Compass & Astrolabe held before the chest
    im.ring(21, 31, 4, 5.5, g2); im.set(21, 31, E('gold4'));
    im.line(21, 27, 17, 38, E('gold3')); im.line(21, 27, 25, 38, g2);
    S.statue_saint = im.outline(V1);
  }

  // Cathedral 3-Branched Gilded Candelabra (24x52, 4 animated frames!)
  S.lamp_gold = [0, 1, 2, 3].map((f) => {
    const im = new Img(24, 52);
    im.rect(6, 48, 12, 4, g1); im.rect(6, 48, 12, 1, g3);
    im.rect(9, 44, 6, 4, g2);
    im.rect(11, 14, 2, 31, g2); im.line(11, 14, 11, 44, g3);
    // Sweeping twin golden candle-arms
    im.line(11, 24, 4, 17, g2, 2); im.line(12, 24, 19, 17, g1, 2);
    for (const [cx, cy, ph] of [[4, 11, 0], [11, 8, 1], [19, 11, 2]]) {
      im.rect(cx - 1, cy + 5, 4, 2, g3);
      im.rect(cx, cy, 2, 5, c('bone4'));
      const sway = ((f + ph) & 1) ? 0 : 1;
      im.rect(cx, cy - 4, 2, 4, E('gold3'));
      im.set(cx + sway, cy - 5, E('gold4'));
      im.set(cx, cy - 2, E('gold4'));
    }
    return im.outline(V1);
  });

  // Repository Wrought-Iron Violet Archive Streetlamp (20x50, 4 animated frames!)
  S.lamp_violet = [0, 1, 2, 3].map((f) => {
    const im = new Img(20, 50);
    im.rect(5, 46, 10, 4, i1); im.rect(5, 46, 10, 1, i3);
    im.rect(9, 12, 2, 35, i1); im.line(9, 12, 9, 46, i2);
    // Scrollwork iron bracket + hexagonal rune-glass lantern
    im.poly([[6, 6], [14, 6], [16, 11], [14, 19], [6, 19], [4, 11]], i1);
    im.rect(6, 5, 8, 2, i3); im.set(10, 3, i2); im.set(10, 4, i3);
    im.poly([[7, 8], [13, 8], [14, 12], [13, 17], [7, 17], [6, 12]], E('rune3'));
    im.rect(8, 10, 4, 5, (f & 1) ? E('rune5') : E('rune4'));
    im.line(10, 7, 10, 18, i0);
    return im.outline(V1);
  });

  // Throne Hall Royal Sovereign Tapestry Banner (28x88)
  {
    const im = new Img(28, 88);
    // Iron crossbar & brass finials
    im.rect(1, 2, 26, 3, i2); im.line(1, 2, 26, 2, i3);
    im.rect(0, 1, 3, 5, g2); im.rect(25, 1, 3, 5, g2); im.set(1, 1, g3); im.set(26, 1, g3);
    // Swallowtail royal crimson-violet banner cloth with gilded border
    im.poly([[4, 5], [24, 5], [24, 84], [14, 72], [4, 84]], c('ember1'));
    im.poly([[4, 5], [14, 5], [14, 72], [4, 84]], c('ember2'));
    im.line(5, 6, 5, 81, g2); im.line(22, 6, 22, 81, g1);
    im.line(5, 81, 14, 71, g2); im.line(22, 81, 14, 71, g1);
    // Glowing golden-rune Root-Key emblem woven in the center!
    im.ring(14, 30, 5, 7, g2); im.ring(14, 30, 5.5, 6.5, E('gold3'));
    im.set(14, 30, E('rune5')); im.rect(13, 37, 2, 18, E('gold3'));
    im.rect(15, 42, 4, 2, g2); im.rect(15, 48, 5, 2, E('gold3'));
    S.arena_banner = im.outline(V1);
  }

  // Dojo Backlit Shoji Lattice Window (44x62)
  {
    const im = new Img(44, 62);
    im.rect(0, 0, 44, 62, g0); im.rect(0, 0, 44, 2, g2); im.rect(0, 60, 44, 2, V2);
    // Warm sunlit rice-paper panes with soft bamboo silhouette
    im.rect(4, 4, 36, 54, c('bone3'));
    im.rect(6, 6, 32, 34, c('bone4'));
    // Subtle bamboo stalk & leaves silhouette behind the paper
    im.line(15, 56, 19, 8, c('bone2'), 2);
    im.line(18, 22, 26, 17, c('bone2')); im.line(17, 34, 10, 29, c('bone2'));
    // Cedar shoji lattice grid
    for (let x = 13; x < 40; x += 9) im.rect(x, 4, 2, 54, g1);
    for (let y = 15; y < 56; y += 11) im.rect(4, y, 36, 2, g1);
    S.dojo_shoji = im.outline(V1);
  }

  // Dojo Silk Hanging Calligraphy Scroll (22x56)
  {
    const im = new Img(22, 56);
    im.line(11, 0, 4, 5, g2); im.line(11, 0, 18, 5, g2); im.set(11, 0, g3);
    im.rect(1, 5, 20, 3, c('ember2')); im.rect(0, 5, 2, 3, g3); im.rect(20, 5, 2, 3, g2);
    im.rect(3, 8, 16, 42, c('bone2')); im.rect(5, 11, 12, 36, c('bone4'));
    // Bold ink brush-strokes ("STEEL / HEART")
    im.rect(9, 15, 4, 2, V1); im.rect(7, 19, 8, 2, V1); im.rect(10, 15, 2, 12, V1);
    im.line(7, 25, 14, 22, V1);
    im.rect(8, 32, 6, 2, V1); im.line(11, 30, 8, 41, V1, 2); im.line(10, 35, 15, 41, V1);
    im.rect(13, 42, 2, 2, c('ember3')); // red artist seal!
    im.rect(1, 50, 20, 3, c('ember2')); im.rect(0, 50, 2, 3, g3); im.rect(20, 50, 2, 3, g2);
    S.dojo_scroll = im.outline(V1);
  }

  // Dojo Warm Paper Lantern (18x34, 4 animated frames!)
  S.dojo_lantern = [0, 1, 2, 3].map((f) => {
    const im = new Img(18, 34);
    im.rect(8, 0, 2, 6, i1);
    im.rect(5, 6, 8, 2, i2);
    im.ellipse(9, 16, 6.5, 8.5, E('ember3'));
    im.ellipse(9, 16, 4.5, 6.5, E('gold3'));
    im.ellipse(9, 16 + (f & 1 ? 0 : -1), 2.5, 3.5, E('gold4'));
    for (const ry of [11, 16, 21]) im.line(3, ry, 15, ry, c('ember1'));
    im.rect(5, 24, 8, 2, i2);
    im.line(9, 26, 9 + (f === 1 ? 1 : f === 3 ? -1 : 0), 32, E('gold3'));
    return im.outline(V1);
  });

  return { sprites: S, cuts };
}

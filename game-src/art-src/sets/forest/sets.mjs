// FRONTEND FOREST SETS — great trees you can climb, undergrowth, lanterns, rune stones, fireflies.
// Doors, tablets and steles are the Workshop's stone pieces (ruins the forest grew around).
import { Img, c, hash2, dith, leaves, bark } from '../../lib-forest.mjs';
import workshop from '../workshop/sets.mjs';

export default function sets() {
  const S = {}, W = workshop().sprites;
  for (const k of ['door_frame', 'door_leaf', 'door_dark', 'note_tablet', 'note_stele', 'walltext', 'brazier', 'flame', 'hearth', 'runefire', 'statue_anvil']) S[k] = W[k];
  const V0 = c('void0'), V1 = c('void1'), V2 = c('void2'), s0 = c('soot0'), s1 = c('soot1'), s2 = c('soot2'), s3 = c('soot3'), s4 = c('soot4');
  const m0 = c('moss0'), m1 = c('moss1'), m2 = c('moss2'), m3 = c('moss3'), b1 = c('bone1'), b2 = c('bone2'), b3 = c('bone3');
  const st1 = c('stone1'), st2 = c('stone2'), st3 = c('stone3'), g1 = c('gold1'), g2 = c('gold2');
  const G3 = c('gold3', 'e'), G4 = c('gold4', 'e'), R2 = c('rune2', 'e'), R4 = c('rune4', 'e'), R5 = c('rune5', 'e');
  const LEAF = [m0, m1, m2, m3], LEAF_D = [V2, m0, m1, null], LEAF_DD = [V1, V2, m0, null];

  /* ---- the great trees (climbable: their branches are the '-' platforms in the map) ---- */
  S.trunk = bark(44, 96, [s0, s1, s2, s3], 2);                                // stack these upward from the base
  {
    const b = new Img(120, 56);                                              // flared base with roots gripping the ground
    for (let y = 0; y < 56; y++) { const k = Math.pow(y / 55, 2.6), half = 22 + k * 34; for (let x = Math.round(60 - half); x <= Math.round(60 + half); x++) { const u = (x - (60 - half)) / (half * 2); b.set(x, y, u < .1 ? s2 : u < .36 ? s3 : u < .62 ? s2 : u < .86 ? s1 : s0); } }
    for (let i = 0; i < 9; i++) { const x0 = 44 + i * 4; b.line(x0, 0, 60 + (x0 - 60) * 2.3, 55, i % 2 ? s1 : s0); }
    for (const [x, w] of [[6, 20], [34, 14], [76, 16], [98, 18]]) { b.ellipse(x + w / 2, 55, w / 2, 5, s2); b.ellipse(x + w / 2 - 1, 53, w / 2 - 2, 3, s3); }
    for (let x = 14; x < 110; x += 3) if (hash2(x, 3, 3) < .5) { b.set(x, 54 - (hash2(x, 1, 1) * 3 | 0), m2); b.set(x + 1, 55, m1); }
    b.ellipse(60, 30, 5, 8, V1); b.ellipse(59, 29, 3, 6, s0); b.set(57, 24, s4);                               // a hollow
    S.tree_base = b;
  }
  const crown = (w, h, cols, seed, n) => leaves(new Img(w, h), w / 2, h / 2, w / 2 - 12, h / 2 - 10, cols, seed, { n, r: 9, rv: 8 });
  S.crown_a = crown(150, 84, LEAF, 3, 34); S.crown_b = crown(110, 66, LEAF, 8, 22); S.crown_c = crown(76, 50, LEAF, 5, 13);
  S.crown_dark = crown(170, 96, LEAF_D, 11, 36); S.crown_dark_b = crown(120, 70, LEAF_D, 14, 22);

  /* ---- smaller trees standing behind the path (not climbable; one value band darker) ---- */
  const tree = (w, h, tw, seed, cols, lf) => {
    const t = new Img(w, h), cx = w >> 1;
    const tr = bark(tw, h - 30, cols, seed); t.blit(tr, cx - (tw >> 1), 30);
    for (let y = h - 14; y < h; y++) { const k = (y - (h - 14)) / 14; t.rect(cx - (tw >> 1) - k * 7, y, 1 + k * 7, 1, cols[1]); t.rect(cx + (tw >> 1), y, k * 7, 1, cols[0]); }
    t.line(cx, h * .42, cx - w * .32, h * .26, cols[1], 3); t.line(cx, h * .5, cx + w * .34, h * .3, cols[0], 3); t.line(cx, 40, cx + 6, 14, cols[1], 3);
    leaves(t, cx, h * .2, w * .46, h * .17, lf, seed, { n: Math.round(w * h / 620), r: 8, rv: 7 });
    return t;
  };
  S.tree_a = tree(120, 250, 22, 4, [V2, s0, s1, s2], LEAF_D);
  S.tree_b = tree(96, 200, 16, 7, [V2, s0, s1, s2], LEAF_D);
  S.tree_far = tree(110, 280, 26, 9, [V1, V2, s0, s0], LEAF_DD);
  S.sapling = tree(44, 78, 6, 12, [s0, s1, s2, s3], LEAF);

  /* ---- undergrowth ---- */
  const tuft = (w, h, seed) => { const t = new Img(w, h); for (let x = 0; x < w; x++) { const len = 1 + Math.floor(hash2(x, seed, 1) * (h - 1)); for (let y = h - len; y < h; y++) t.set(x + (y < h - len + 2 && hash2(x, y, seed) < .5 ? 1 : 0), y, y === h - len ? m3 : y < h - 2 ? m2 : m1); } return t; };
  S.grass_a = tuft(14, 5, 1); S.grass_b = tuft(16, 8, 2); S.grass_c = tuft(11, 11, 3);
  {
    const f = new Img(24, 16);                                               // fern: arcing fronds
    for (const [dx, hgt] of [[-10, 9], [-6, 13], [-2, 15], [3, 14], [7, 12], [11, 8]]) for (let k = 0; k <= 10; k++) { const u = k / 10, x = 12 + dx * u, y = 15 - hgt * Math.sin(u * 1.9) ; f.set(x, y, u > .7 ? m3 : m2); if (k % 2) { f.set(x, y + 1, m1); f.set(x + Math.sign(dx || 1), y - 1, m2); } }
    S.fern = f;
  }
  const bush = (w, h, seed) => { const t = leaves(new Img(w, h), w / 2, h * .62, w / 2 - 6, h * .32, LEAF, seed, { n: Math.round(w / 5), r: 5, rv: 4 }); return t; };
  S.bush_a = bush(40, 24, 2); S.bush_b = bush(56, 30, 6);
  S.bush_dark = leaves(new Img(72, 36), 36, 23, 28, 10, LEAF_D, 9, { n: 12, r: 6, rv: 5 });
  {
    const fr = (k) => { const t = new Img(12, 11); t.rect(5, 5, 2, 6, b2); t.set(5, 6, b1); t.ellipse(6, 4, 5, 3, k ? R4 : R2); t.rect(1, 5, 10, 1, R2); t.set(4, 2, R5); t.set(7, 3, k ? R5 : R4); t.set(9, 9, R2); return t; };
    S.mush = [fr(0), fr(0), fr(1), fr(0)];                                   // rune-cap mushrooms, slowly pulsing
    const t = new Img(8, 10); t.rect(3, 4, 1, 6, m1); t.set(2, 7, m2); t.set(4, 6, m2); t.set(3, 1, b3); t.set(2, 2, b3); t.set(4, 2, b3); t.set(3, 3, b2); t.set(3, 2, g2); S.flower = t;
  }
  {
    const r = new Img(20, 12); r.ellipse(10, 8, 9, 5, st1); r.ellipse(9, 7, 7, 4, st2); r.ellipse(7, 5, 3, 1, st3); for (let x = 3; x < 17; x += 2) if (hash2(x, 2, 2) < .6) r.set(x, 3 + (x % 3), m2); r.rect(1, 11, 18, 1, V2); S.rock = r;
    const l = new Img(58, 16); l.rect(4, 4, 50, 10, s1); l.rect(4, 4, 50, 2, s3); l.rect(4, 12, 50, 2, s0); l.ellipse(5, 9, 4, 5, s2); l.ellipse(5, 9, 2, 3, s4); l.ellipse(5, 9, 1, 1, s2); l.ellipse(53, 9, 3, 5, s0);
    for (let x = 10; x < 52; x += 6) { l.set(x, 7, s0); l.set(x + 1, 8, s0); } for (let x = 12; x < 50; x += 2) if (hash2(x, 4, 4) < .55) l.set(x, 3 + (x % 2), x % 4 ? m2 : m3); S.log = l;
    const s = new Img(26, 18); s.rect(5, 4, 16, 14, s1); s.rect(5, 4, 4, 14, s3); s.rect(17, 4, 4, 14, s0); s.ellipse(13, 4, 8, 3, s3); s.ellipse(13, 4, 6, 2, s4); s.ellipse(13, 4, 3, 1, s2); s.rect(2, 15, 5, 3, s2); s.rect(20, 15, 5, 3, s0); s.set(9, 2, m3); s.set(10, 2, m2); S.stump = s;
  }
  S.vine = [22, 34, 46].map((h, i) => { const t = new Img(7, h); for (let y = 0; y < h; y++) { const x = 3 + Math.round(Math.sin(y * .3 + i) * 1.4); t.set(x, y, m1); if (y % 4 === i % 4) { t.set(x - 1, y, m2); t.set(x - 2, y + 1, m3); } if (y % 5 === 2) t.set(x + 1, y, m2); } t.set(3, h - 1, m3); return t; });

  /* ---- light: lantern posts, a rune stone, fireflies ---- */
  {
    const p = new Img(22, 50);
    p.rect(9, 8, 3, 42, s1); p.rect(9, 8, 1, 42, s3); p.rect(11, 8, 1, 42, s0); p.rect(6, 47, 9, 3, s2); p.rect(6, 47, 9, 1, s3);
    p.rect(9, 6, 11, 2, s2); p.rect(9, 6, 11, 1, s3); p.set(18, 8, s1); p.set(18, 9, s1);
    p.rect(15, 10, 7, 9, g1); p.rect(15, 10, 7, 1, g2); p.rect(16, 11, 5, 7, G3); p.rect(17, 12, 3, 4, G4); p.rect(15, 19, 7, 1, s0); p.set(18, 20, s1);
    for (let y = 30; y < 46; y += 2) if (hash2(y, 3, 1) < .6) p.set(8, y, m2);
    S.lamp_lantern = p;
  }
  {
    const r = new Img(34, 56);                                               // mossy rune stone ('statue' in this zone)
    r.poly([[5, 55], [3, 20], [9, 5], [18, 0], [27, 7], [31, 24], [29, 55]], st1);
    r.each(0, 0, 34, 56, (x, y, o) => (o === st1 && x < 12 ? st2 : o === st1 && x > 24 ? c('stone0') : undefined));
    r.line(4, 20, 9, 5, st3); r.line(9, 5, 18, 0, st3);
    for (const [x, y] of [[14, 14], [20, 14], [13, 15], [21, 15], [14, 16], [20, 16]]) r.set(x, y, R4);              // { }
    r.set(12, 15, R4); r.set(22, 15, R4); r.rect(16, 22, 2, 12, R4); r.rect(14, 26, 6, 2, R2); r.set(17, 38, R5); r.set(16, 38, R5);
    for (let y = 30; y < 56; y++) for (let x = 3; x < 31; x++) if (r.get(x, y) && hash2(x, y, 6) < (y - 30) / 40) r.set(x, y, hash2(x, y, 2) < .5 ? m1 : m2);
    S.statue_gear = r;
  }
  S.firefly = Array.from({ length: 12 }, (_, f) => {                         // three motes drifting on small loops, blinking
    const t = new Img(40, 30);
    for (let k = 0; k < 3; k++) { const a = (f / 12 + k / 3) * Math.PI * 2, x = 20 + Math.cos(a) * (10 + k * 3) + k * 2 - 2, y = 15 + Math.sin(a * 2 + k) * (6 + k * 2); if ((f + k * 4) % 12 < 8) { t.set(x, y, G4); if ((f + k * 4) % 12 < 4) { t.set(x + 1, y, G3); t.set(x, y + 1, G3); } } }
    return t;
  });
  /* ---- foreground: black leaves hanging into the frame ---- */
  const FG = [V0, V0, V0, null];
  S.fg_leaves = leaves(new Img(220, 80), 110, 10, 100, 34, FG, 4, { n: 30, r: 12, rv: 10 });
  S.fg_leaves_b = leaves(new Img(150, 60), 75, 8, 66, 26, FG, 9, { n: 18, r: 10, rv: 8 });
  { const t = new Img(60, 300); t.blit(bark(34, 300, [V0, V0, V0, V1], 3), 13, 0); S.fg_trunk = t; }
  return { sprites: S, cuts: {} };
}

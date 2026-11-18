// THE BUDGET GOBLIN — an accountant behind his desk in Chamber 499: visor, spectacles, quill, ledger,
// abacus, coin stacks, one candle. Frame 100x78, feet line = bottom row, the goblin sits at x = 50.
//   frames 0-7  counting (the quill scratches, a bead clicks, an ear twitches, he blinks)
//   frames 8-9  talking  (he looks up at the Recruiter)
//   frames 10-11 laughing (head back, arms up)
// Also: `coin` (6 frames, a spinning point) and `coin_pile` (floor decor).
// The game picks the frame in src/js/63-goblin.js.
import { Img, c } from '../../tools/lib/pix.mjs';

export default function goblin() {
  const K = c('void0'), V1 = c('void1'), V2 = c('void2');
  const so = [c('soot0'), c('soot1'), c('soot2'), c('soot3'), c('soot4')];
  const ir = [c('iron0'), c('iron1'), c('iron2'), c('iron3')];
  const bn = [c('bone0'), c('bone1'), c('bone2'), c('bone3'), c('bone4')];
  const gd = [c('gold0'), c('gold1'), c('gold2'), c('gold3'), c('gold4')], GE = c('gold4', 'e'), G3E = c('gold3', 'e');
  const sk = [c('moss0'), c('moss1'), c('moss2'), c('moss3')];
  const co = [c('cold0'), c('cold1'), c('cold2'), c('cold3'), c('cold4')];
  const em = [c('ember1'), c('ember2'), c('ember3'), c('ember4')], EE = c('ember4', 'e');
  const W = 100, H = 78, TOP = 46;                       // TOP = the desk surface

  function frame(o) {
    const p = new Img(W, H), hx = o.head[0], hy = o.head[1], cx = 50 + hx, cy = 20 + hy;

    /* ---- body behind the desk: shirt, waistcoat, tie ---- */
    p.poly([[37, 34], [63, 34], [67, TOP + 1], [33, TOP + 1]], bn[3]);                 // shirt
    p.poly([[40, 35], [47, 35], [49, TOP + 1], [37, TOP + 1]], ir[1]);                 // waistcoat, two halves
    p.poly([[53, 35], [60, 35], [63, TOP + 1], [51, TOP + 1]], ir[0]);
    p.rect(40, 35, 1, 12, ir[2]);
    p.rect(49, 35, 2, 3, bn[4]); p.rect(49, 38, 2, 7, em[2]); p.set(49, 38, em[3]); p.set(50, 44, em[1]);   // collar and a thin red tie
    p.set(45, 40, gd[3]); p.set(45, 43, gd[3]); p.set(55, 40, gd[2]); p.set(55, 43, gd[2]);                // buttons

    /* ---- arms ---- */
    const up = o.arms === 1, clasped = o.arms === 2, bob = o.armBob || 0;
    const lh = up ? [31, 30 + bob] : clasped ? [46, TOP - 2] : [40, TOP - 2];
    const rh = up ? [69, 29 - bob] : clasped ? [53, TOP - 2] : [61 + o.quill, TOP - 3];
    const arm = (sx, sy, ex, ey, hand, dark) => {
      p.line(sx, sy, ex, ey, dark ? bn[2] : bn[3], 3); p.line(ex, ey, hand[0], hand[1], dark ? bn[2] : bn[3], 3);
      p.rect(Math.round((sx + ex) / 2) - 1, Math.round((sy + ey) / 2) - 1, 3, 1, gd[2]);                    // sleeve garter
      p.rect(hand[0] - 2, hand[1] - 1, 4, 3, sk[3]); p.set(hand[0] - 2, hand[1] + 1, sk[2]); p.set(hand[0] + 1, hand[1] + 1, sk[1]);
    };
    arm(39, 37, up ? 32 : 33, up ? 37 : 43, lh, false);
    arm(61, 37, up ? 68 : 68, up ? 37 : 43, rh, true);
    // the quill, in the right hand (or neatly set down beside the inkwell while bowing to Meiko!)
    if (clasped) {
      p.line(63, TOP - 1, 71, TOP - 9, bn[4]); p.line(64, TOP - 2, 71, TOP - 8, bn[3]); p.set(63, TOP - 1, K);
    } else {
      const qx = rh[0], qy = rh[1];
      p.line(qx - 1, qy + 2, qx + 5, qy - 12, bn[4]); p.line(qx, qy - 3, qx + 7, qy - 13, bn[3]); p.line(qx + 2, qy - 6, qx + 8, qy - 11, bn[4]);
      p.set(qx + 6, qy - 14, bn[4]); p.set(qx - 1, qy + 2, K);
    }

    /* ---- head: flat skull, long ragged ears, a hooked nose over a grin full of teeth ---- */
    const ear = o.ear || 0, open = o.mouth === 2;
    p.rect(44, 33, 13, 3, bn[4]); p.set(50, 35, bn[2]);                                                    // collar
    p.poly([[cx - 10, cy - 6], [cx - 11, cy + 3], [cx - 19, cy - 3 + ear], [cx - 30, cy - 14 + ear], [cx - 18, cy - 9 + ear]], sk[3]);
    p.poly([[cx + 10, cy - 6], [cx + 11, cy + 3], [cx + 19, cy - 3 + ear], [cx + 30, cy - 14 + ear], [cx + 18, cy - 9 + ear]], sk[2]);
    p.line(cx - 12, cy - 1, cx - 23, cy - 9 + ear, sk[1]); p.line(cx + 12, cy - 1, cx + 23, cy - 9 + ear, sk[1]);
    p.set(cx + 21, cy - 4 + ear, 0); p.set(cx + 22, cy - 5 + ear, 0); p.set(cx + 21, cy - 5 + ear, 0); p.set(cx + 22, cy - 6 + ear, 0);   // a notch torn out of the right ear
    p.rect(cx - 17, cy, 2, 3, gd[3]); p.set(cx - 17, cy, gd[4]);                                           // a gold ring in the left ear
    p.ellipse(cx, cy - 1, 13, 9, sk[3]);                                                                   // skull
    const chin = open ? 17 : 15;
    p.poly([[cx - 11, cy + 3], [cx + 12, cy + 3], [cx + 8, cy + chin - 3], [cx + 2, cy + chin], [cx - 4, cy + chin - 3]], sk[3]);   // cheeks down to a pointed chin
    p.each(cx - 14, cy - 11, 30, 30, (x, y, old) => (old === sk[3] && ((x - cx) * .9 + (y - cy) * .45 > 7.5 || (y > cy + 5 && x > cx - 3)) ? sk[2] : undefined));   // shade: right side and under the nose
    p.set(cx + 9, cy + 6, sk[1]); p.set(cx + 10, cy + 7, sk[1]); p.set(cx + 9, cy + 7, sk[3]);              // a wart
    for (const x of [-4, -2, 1, 3, 5]) p.set(cx + x, cy - 10 - (x & 1), V2);                               // a few hairs
    // the green eyeshade
    p.rect(cx - 12, cy - 7, 25, 2, co[1]); p.rect(cx - 12, cy - 7, 25, 1, co[2]);
    p.poly([[cx - 17, cy - 5], [cx + 10, cy - 5], [cx + 8, cy - 3], [cx - 19, cy - 3]], co[2]);
    p.rect(cx - 17, cy - 5, 26, 1, co[3]); p.set(cx - 18, cy - 4, co[3]); p.rect(cx - 19, cy - 3, 27, 1, co[1]);
    // spectacles over yellow eyes
    const lens = (ex) => {
      p.ellipse(ex, cy + 1, 4, 4, gd[4]); p.ring(ex, cy + 1, 3.5, 4.6, ir[3]);
      if (o.blink) { p.ellipse(ex, cy + 1, 3, 3, sk[2]); p.rect(ex - 3, cy + 2, 7, 1, sk[0]); }
      else if (open) { p.ellipse(ex, cy + 1, 3, 3, sk[3]); p.set(ex - 3, cy + 2, K); p.set(ex - 2, cy + 1, K); p.rect(ex - 1, cy, 3, 1, K); p.set(ex + 2, cy + 1, K); p.set(ex + 3, cy + 2, K); }   // squeezed shut, laughing
      else { p.rect(ex + o.pupil[0], cy - 1 + o.pupil[1], 2, 4, K); p.set(ex - 2, cy - 1, GE); }
    };
    lens(cx - 6); lens(cx + 5); p.rect(cx - 1, cy, 2, 1, ir[3]); p.set(cx + 10, cy, ir[2]); p.set(cx - 11, cy, ir[3]);
    // the nose: long and hooked, pointing left
    p.poly([[cx - 2, cy + 2], [cx + 2, cy + 2], [cx + 1, cy + 9], [cx - 4, cy + 12], [cx - 11, cy + 11], [cx - 10, cy + 8], [cx - 5, cy + 7]], sk[3]);
    p.line(cx + 2, cy + 2, cx + 1, cy + 9, sk[1]); p.line(cx + 1, cy + 9, cx - 4, cy + 12, sk[0]); p.line(cx - 4, cy + 12, cx - 11, cy + 11, sk[0]); p.set(cx - 11, cy + 10, sk[1]);
    p.set(cx - 7, cy + 10, K); p.set(cx - 8, cy + 9, sk[2]); p.rect(cx - 9, cy + 8, 2, 1, bn[2]);           // nostril, and the tip catches the light
    // the mouth
    if (o.mouth === 3) { p.line(cx - 1, cy + 12, cx + 6, cy + 12, sk[0]); p.set(cx + 7, cy + 11, sk[1]); } // humble respectful expression (no grin)
    else if (o.mouth === 0) { p.line(cx - 1, cy + 12, cx + 9, cy + 9, K); p.set(cx + 10, cy + 8, K); for (const x of [1, 3, 5, 7]) p.set(cx + x, cy + 12 - Math.round(x * .3), bn[4]); }
    else if (o.mouth === 1) { p.poly([[cx - 1, cy + 11], [cx + 10, cy + 8], [cx + 8, cy + 13], [cx + 1, cy + 14]], K); for (const x of [1, 3, 5, 7]) p.set(cx + x, cy + 11 - Math.round(x * .3), bn[4]); p.set(cx + 3, cy + 13, bn[4]); p.set(cx + 6, cy + 12, bn[4]); }
    else { p.poly([[cx - 2, cy + 9], [cx + 11, cy + 6], [cx + 9, cy + 14], [cx + 1, cy + 15]], K);
      for (let x = 0; x < 10; x += 2) p.rect(cx - 1 + x, cy + 9 - Math.round(x * .25), 1, 2, bn[4]);
      for (let x = 2; x < 8; x += 2) p.set(cx + x, cy + 13, bn[4]);
      p.rect(cx + 2, cy + 11, 5, 2, em[2]); p.rect(cx + 3, cy + 11, 2, 1, em[3]); }

    // the cigar, clamped in the right corner of the grin (in his raised hand while he laughs, or set aside on the desk when bowing to Meiko!)
    { const gx = clasped ? 34 : open ? rh[0] + 2 : cx + 9, gy = clasped ? TOP - 2 : open ? rh[1] - 4 : cy + 9 + (o.mouth === 1 ? 1 : 0);
      p.rect(gx, gy, 7, 2, gd[0]); p.rect(gx, gy, 7, 1, gd[1]); p.rect(gx + 2, gy, 1, 2, gd[3]); p.rect(gx + 7, gy, 1, 2, EE); p.set(gx + 8, gy, em[2]);
      if (o.puff) { p.set(gx + 9, gy - 2, bn[2]); p.set(gx + 10, gy - 4, bn[1]); } }

    /* ---- on the desk ---- */
    // open ledger under his hands
    p.poly([[38, TOP], [50, TOP - 3], [50, TOP + 1], [38, TOP + 1]], bn[4]); p.poly([[50, TOP - 3], [63, TOP], [63, TOP + 1], [50, TOP + 1]], bn[3]);
    p.rect(50, TOP - 3, 1, 4, bn[1]); for (let x = 40; x < 49; x += 2) p.set(x, TOP - 1, bn[1]); for (let x = 52; x < 52 + 3 + o.quill * 2; x += 2) p.set(x, TOP - 1, V2);
    // inkwell
    p.rect(66, TOP - 4, 4, 4, ir[0]); p.rect(66, TOP - 4, 4, 1, ir[2]); p.set(67, TOP - 5, V1); p.set(68, TOP - 5, V1);
    // abacus
    p.rect(73, TOP - 19, 17, 19, ir[1]); p.rect(74, TOP - 18, 15, 17, V1); p.rect(73, TOP - 19, 17, 1, ir[3]); p.rect(73, TOP - 19, 1, 19, ir[2]); p.rect(72, TOP - 1, 19, 1, ir[0]);
    const rods = [[TOP - 15, em[2], em[3]], [TOP - 10, gd[2], gd[3]], [TOP - 5, co[2], co[3]]];
    rods.forEach(([y, a, b], i) => {
      p.rect(74, y, 15, 1, ir[0]);
      const shift = i === 1 ? o.bead : 0, xs = i === 0 ? [75, 78, 85] : i === 1 ? [75 + shift * 6, 81 + shift * 3, 86] : [75, 78, 81, 86];
      xs.forEach((x) => { p.rect(x, y - 1, 2, 3, a); p.set(x, y - 1, b); });
    });
    // coin stacks (the points he keeps)
    const stack = (x, n) => { for (let k = 0; k < n; k++) { const y = TOP - 2 - k * 2; p.rect(x, y, 6, 2, k % 2 ? gd[2] : gd[3]); p.set(x, y, gd[4]); p.set(x + 5, y + 1, gd[1]); } p.rect(x, TOP - 2 - (n - 1) * 2, 6, 1, gd[4]); p.set(x + 1, TOP - 2 - (n - 1) * 2, GE); };
    stack(15, 5); stack(22, 9); stack(29, 3);
    p.rect(34, TOP - 1, 3, 1, gd[3]); p.set(34, TOP - 1, GE);
    // candle
    p.rect(8, TOP - 2, 5, 2, ir[1]); p.rect(8, TOP - 2, 5, 1, ir[3]); p.rect(9, TOP - 8, 3, 6, bn[4]); p.rect(11, TOP - 8, 1, 6, bn[2]); p.set(10, TOP - 9, V1);
    const fl = o.flame % 3; p.set(10, TOP - 10, GE); p.set(10, TOP - 11, GE); p.set(10 + (fl === 1 ? 1 : 0), TOP - 12, EE); if (fl !== 2) p.set(10, TOP - 13, EE);
    p.set(9, TOP - 10, EE); p.set(11, TOP - 10, EE);

    /* ---- the desk ---- */
    p.rect(6, TOP, 88, 4, so[3]); p.rect(6, TOP, 88, 1, so[4]); p.rect(6, TOP + 3, 88, 1, so[1]);          // top slab
    p.each(6, TOP, 88, 1, (x, y, old) => (old === so[4] || old === so[3] ? undefined : old));
    p.rect(10, TOP + 4, 80, H - TOP - 4, so[2]); p.rect(10, TOP + 4, 80, 2, so[1]);                         // shadow under the slab
    p.rect(10, TOP + 4, 2, H - TOP - 4, so[3]); p.rect(88, TOP + 4, 2, H - TOP - 4, so[0]);
    for (const x of [14, 59]) { p.rect(x, TOP + 9, 27, 17, so[1]); p.rect(x, TOP + 9, 27, 1, so[0]); p.rect(x, TOP + 9, 1, 17, so[0]); p.rect(x + 1, TOP + 25, 26, 1, so[3]); p.rect(x + 26, TOP + 10, 1, 16, so[3]);
      p.rect(x + 1, TOP + 17, 25, 1, so[0]); p.rect(x + 1, TOP + 18, 25, 1, so[2]);
      for (const y of [TOP + 13, TOP + 21]) { p.rect(x + 11, y, 5, 2, gd[3]); p.rect(x + 11, y, 5, 1, gd[4]); } }      // two drawers each, brass pulls
    p.rect(43, TOP + 9, 15, 9, bn[3]); p.rect(43, TOP + 9, 15, 1, bn[4]); p.rect(43, TOP + 17, 15, 1, bn[1]); p.set(43, TOP + 9, ir[2]); p.set(57, TOP + 9, ir[2]);
    p.rect(8, H - 3, 84, 3, so[1]); p.rect(8, H - 3, 84, 1, so[3]);                                          // plinth
    p.each(10, TOP + 6, 80, H - TOP - 9, (x, y, old) => (old === so[2] && (x * 13 + y * 7) % 23 === 0 ? so[1] : undefined));   // grain
    p.outline(K);
    return p;
  }

  const base = { head: [0, 0], pupil: [0, 0], blink: 0, mouth: 0, quill: 0, ear: 0, bead: 0, flame: 0, arms: 0 };
  const frames = [];
  [0, 1, 2, 3, 2, 1, 0, -1].forEach((q, f) => frames.push(frame({ ...base, quill: q, blink: 0, ear: 0, bead: 0, flame: f, head: [0, f === 3 || f === 4 ? 1 : 0] })));
  frames.push(frame({ ...base, head: [-1, -1], pupil: [-1, -1], mouth: 0, flame: 0, ear: -1 }));
  frames.push(frame({ ...base, head: [-1, -1], pupil: [-1, -1], mouth: 1, flame: 1, ear: -1 }));
  frames.push(frame({ ...base, head: [0, -3], mouth: 2, arms: 1, armBob: 0, flame: 0, ear: -3 }));
  frames.push(frame({ ...base, head: [0, -2], mouth: 2, arms: 1, armBob: 2, flame: 2, ear: -1 }));
  /* Round 9 — idle extras, mixed in at random by Goblin.frame() in 63-goblin.js:
     12 blink · 13-14 ear twitch · 15 glance left · 16 glance right · 17-18 a bead clicks on the abacus · 19 breath in · 20 a puff on the cigar */
  frames.push(frame({ ...base, quill: 1, blink: 1 }));
  frames.push(frame({ ...base, quill: 1, ear: -2, flame: 1 }));
  frames.push(frame({ ...base, quill: 2, ear: -3, flame: 2 }));
  frames.push(frame({ ...base, head: [-1, 0], pupil: [-1, 0], flame: 1 }));
  frames.push(frame({ ...base, head: [1, 0], pupil: [1, 0], flame: 2 }));
  frames.push(frame({ ...base, quill: 3, bead: 1, head: [0, 1], pupil: [1, 1] }));
  frames.push(frame({ ...base, quill: 3, bead: 0, head: [0, 1], pupil: [1, 1], flame: 1 }));
  frames.push(frame({ ...base, quill: 0, head: [0, -1], flame: 2 }));
  frames.push(frame({ ...base, quill: 0, head: [0, -1], puff: 1, flame: 1 }));
  /* Reverent bowing frames when Meiko approaches (desk stays 100% level!):
     21 lowering into bow · 22-23 deep respectful bow loop (hands clasped, quill & cigar set aside) · 24 bowed humble speaking */
  frames.push(frame({ ...base, arms: 2, head: [-1, 3], ear: 2, blink: 1, mouth: 3, flame: 0 }));
  frames.push(frame({ ...base, arms: 2, head: [-2, 6], ear: 4, blink: 1, mouth: 3, flame: 1 }));
  frames.push(frame({ ...base, arms: 2, head: [-2, 7], ear: 4, blink: 1, mouth: 3, flame: 2 }));
  frames.push(frame({ ...base, arms: 2, head: [-2, 4], ear: 3, pupil: [-1, -1], mouth: 1, flame: 1 }));

  /* the coin: one point, spinning */
  const coin = [9, 7, 3, 1, 3, 7].map((w, f) => {
    const p = new Img(11, 11), x0 = 5 - (w >> 1);
    for (let y = 1; y < 10; y++) { const half = y < 2 || y > 8 ? Math.max(0, (w >> 1) - 2) : y < 3 || y > 7 ? Math.max(0, (w >> 1) - 1) : w >> 1; for (let x = 5 - half; x <= 5 + half; x++) p.set(x, y, c('gold3', 'e')); }
    if (w >= 7) { p.rect(x0 + 1, 3, 1, 5, GE); p.set(x0 + 2, 2, GE); p.rect(5, 4, 1, 3, c('gold1', 'e')); p.set(4, 4, c('gold1', 'e')); p.set(6, 6, c('gold1', 'e')); p.rect(x0 + w - 2, 4, 1, 4, c('gold2', 'e')); }
    else if (w === 3) { p.rect(4, 2, 1, 7, GE); p.rect(6, 2, 1, 7, c('gold2', 'e')); }
    else p.rect(5, 1, 1, 9, GE);
    return p.outline(c('gold1'));
  });
  /* a heap of coins on the floor */
  const pile = new Img(30, 14);
  for (let y = 0; y < 13; y++) { const half = 3 + y; for (let x = 15 - half; x <= 15 + half; x++) if (x >= 1 && x < 29) pile.set(x, y + 1, (x * 5 + y * 3) % 7 < 2 ? gd[2] : gd[3]); }
  for (let k = 0; k < 16; k++) { const x = 3 + (k * 11) % 24, y = 3 + (k * 7) % 10; if (pile.get(x, y)) { pile.rect(x, y, 3, 1, gd[4]); pile.set(x, y + 1, gd[1]); } }
  pile.set(14, 1, GE); pile.set(9, 6, GE); pile.set(20, 8, GE); pile.set(15, 4, G3E);
  pile.outline(K);

  /* ---------------- Round 9 — the counting house: furniture for Chamber 499 ---------------- */
  const wood = [so[1], so[2], so[3], so[4]];
  // a tall shelf: ledgers, jars of coins, a small balance, scroll bundles
  const shelf = new Img(74, 66);
  shelf.rect(0, 0, 74, 66, wood[0]); shelf.rect(2, 2, 70, 62, V1);
  shelf.rect(0, 0, 74, 2, wood[2]); shelf.rect(0, 0, 2, 66, wood[1]); shelf.rect(72, 0, 2, 66, K);
  for (const y of [20, 41, 62]) { shelf.rect(2, y, 70, 3, wood[1]); shelf.rect(2, y, 70, 1, wood[3]); shelf.rect(2, y + 3, 70, 1, K); }
  const book = (x, y, w, h, a, b, band) => { shelf.rect(x, y - h, w, h, a); shelf.rect(x, y - h, 1, h, b); if (band) shelf.rect(x, y - h + 3, w, 1, band); shelf.set(x + w - 1, y - 1, K); };
  let bx = 4; [[4, 14, em[0], em[1], gd[3]], [3, 12, co[1], co[2], 0], [5, 15, bn[1], bn[2], em[1]], [3, 11, gd[0], gd[1], 0], [4, 13, co[0], co[1], gd[2]], [4, 15, em[0], em[1], 0], [3, 12, bn[1], bn[2], 0]]
    .forEach(([w, h, a, b, band]) => { book(bx, 20, w, h, a, b, band); bx += w + 1; });
  shelf.poly([[bx + 1, 20], [bx + 5, 6], [bx + 9, 8], [bx + 6, 20]], co[1]); shelf.line(bx + 5, 6, bx + 2, 19, co[2]);      // one ledger leans
  const jar = (x, y, n) => { shelf.rect(x, y - 11, 8, 11, co[0]); shelf.rect(x, y - 11, 1, 11, co[2]); shelf.rect(x + 1, y - 13, 6, 2, bn[1]); shelf.rect(x + 1, y - 13, 6, 1, bn[3]); for (let k = 0; k < n; k++) { shelf.rect(x + 1, y - 2 - k * 2, 6, 2, k % 2 ? gd[2] : gd[3]); } shelf.set(x + 2, y - 2 - (n - 1) * 2, GE); shelf.set(x + 6, y - 9, co[3]); };
  jar(46, 20, 4); jar(57, 20, 2);
  bx = 5; [[5, 16, bn[1], bn[2], gd[3]], [4, 13, em[0], em[1], 0], [3, 15, co[1], co[2], 0]].forEach(([w, h, a, b, band]) => { book(bx, 41, w, h, a, b, band); bx += w + 1; });
  shelf.rect(24, 39, 9, 2, gd[1]); shelf.rect(28, 26, 1, 13, gd[2]); shelf.rect(21, 27, 15, 1, gd[3]); shelf.set(28, 25, GE);      // the small balance
  shelf.line(21, 28, 19, 33, gd[1]); shelf.line(21, 28, 23, 33, gd[1]); shelf.rect(18, 33, 7, 1, gd[3]); shelf.rect(19, 32, 4, 1, gd[4]);
  shelf.line(35, 28, 33, 31, gd[1]); shelf.line(35, 28, 37, 31, gd[1]); shelf.rect(32, 31, 7, 1, gd[3]);
  for (let k = 0; k < 4; k++) { shelf.ellipse(46 + k * 6, 37 - (k % 2) * 2, 3, 3, bn[3]); shelf.set(46 + k * 6, 37 - (k % 2) * 2, bn[1]); shelf.set(45 + k * 6, 36 - (k % 2) * 2, bn[4]); }   // scroll ends
  bx = 4; [[6, 15, gd[0], gd[1], 0], [4, 12, co[0], co[1], gd[2]], [5, 16, em[0], em[1], 0], [4, 14, bn[1], bn[2], 0], [3, 11, co[1], co[2], 0], [5, 15, em[0], em[1], gd[3]]]
    .forEach(([w, h, a, b, band]) => { book(bx, 62, w, h, a, b, band); bx += w + 1; });
  shelf.rect(42, 54, 16, 8, ir[0]); shelf.rect(42, 54, 16, 1, ir[2]); shelf.rect(49, 57, 2, 3, gd[3]); shelf.set(49, 57, GE);                 // a locked cash box
  jar(61, 62, 5);
  shelf.each(2, 2, 70, 62, (x, y, old) => (old === V1 && (x * 7 + y * 11) % 29 === 0 ? so[0] : undefined));

  // a brass balance on a pedestal: coins on one pan, a feather on the other — and the feather is heavier
  const scales = new Img(40, 46);
  scales.rect(14, 40, 12, 6, wood[1]); scales.rect(12, 44, 16, 2, wood[0]); scales.rect(14, 40, 12, 1, wood[3]);
  scales.rect(19, 10, 2, 30, gd[2]); scales.rect(19, 10, 1, 30, gd[3]); scales.ellipse(20, 8, 2, 2, gd[3]); scales.set(19, 7, GE);
  scales.line(5, 9, 35, 15, gd[3], 1); scales.line(5, 10, 35, 16, gd[1], 1);
  scales.line(5, 10, 1, 20, gd[1]); scales.line(5, 10, 9, 20, gd[1]); scales.rect(0, 20, 11, 2, gd[2]); scales.rect(0, 20, 11, 1, gd[4]);
  for (let k = 0; k < 3; k++) scales.rect(2 + k, 18 - k * 2, 6 - k, 2, k % 2 ? gd[2] : gd[3]); scales.set(4, 13, GE);
  scales.line(35, 16, 31, 28, gd[1]); scales.line(35, 16, 39, 28, gd[1]); scales.rect(30, 28, 10, 2, gd[2]); scales.rect(30, 28, 10, 1, gd[4]);
  scales.line(32, 27, 38, 22, bn[4]); scales.line(33, 27, 38, 23, bn[2]); scales.set(38, 21, bn[4]);
  scales.outline(K);

  // the strongbox, lid thrown back
  const chest = new Img(40, 28);
  chest.rect(3, 12, 34, 16, wood[1]); chest.rect(3, 12, 34, 2, wood[3]); chest.rect(3, 26, 34, 2, wood[0]);
  for (const x of [3, 19, 35]) { chest.rect(x, 12, 2, 16, ir[1]); chest.set(x, 14, ir[3]); chest.set(x, 24, ir[3]); }
  chest.poly([[3, 12], [6, 1], [38, 1], [36, 12]], wood[0]); chest.rect(6, 1, 32, 2, wood[2]); chest.rect(7, 3, 30, 8, V1);
  for (let x = 5; x < 35; x++) { const h = 2 + ((x * 7) % 4) + (x > 12 && x < 28 ? 2 : 0); chest.rect(x, 12 - h, 1, h, (x * 5) % 3 ? gd[3] : gd[2]); }
  chest.set(9, 8, GE); chest.set(17, 6, GE); chest.set(24, 7, G3E); chest.set(30, 9, GE); chest.rect(18, 17, 4, 5, gd[2]); chest.set(19, 19, K);
  chest.outline(K);

  // money sacks
  const sacks = new Img(34, 22);
  const sack = (x, w, h) => { sacks.ellipse(x, 21 - h / 2, w / 2, h / 2, bn[2]); sacks.ellipse(x - 1, 20 - h / 2, w / 2 - 2, h / 2 - 2, bn[3]); sacks.rect(x - 2, 21 - h - 2, 4, 3, bn[2]); sacks.rect(x - 3, 21 - h, 6, 1, em[1]); sacks.rect(x - 1, 21 - h / 2 - 2, 2, 4, gd[2]); sacks.set(x - 1, 21 - h / 2 - 2, gd[4]); };
  sack(9, 16, 16); sack(24, 14, 13); sacks.outline(K);

  // the sign that hangs over the desk: 500 struck through, 499 painted beneath it
  const sign = new Img(46, 40);
  sign.rect(8, 0, 1, 14, ir[2]); sign.rect(37, 0, 1, 14, ir[2]); for (let y = 1; y < 14; y += 3) { sign.set(8, y, ir[0]); sign.set(37, y, ir[0]); }
  sign.rect(1, 14, 44, 25, wood[1]); sign.rect(1, 14, 44, 2, wood[3]); sign.rect(1, 37, 44, 2, wood[0]); sign.rect(1, 14, 1, 25, wood[2]); sign.rect(44, 14, 1, 25, K);
  for (const [x, y] of [[3, 16], [42, 16], [3, 36], [42, 36]]) sign.set(x, y, gd[3]);
  sign.outline(K);

  // a hanging counting-house lantern (the flame is emissive)
  const lantern = new Img(16, 44);
  lantern.rect(7, 0, 2, 22, ir[1]); for (let y = 1; y < 22; y += 3) lantern.set(7, y, ir[3]);
  lantern.poly([[3, 26], [8, 21], [13, 26]], ir[2]); lantern.rect(2, 26, 12, 1, ir[3]); lantern.rect(3, 27, 10, 13, gd[0]); lantern.rect(3, 27, 1, 13, ir[1]); lantern.rect(12, 27, 1, 13, ir[1]); lantern.rect(7, 27, 2, 13, ir[1]);
  lantern.rect(4, 31, 3, 7, G3E); lantern.rect(9, 31, 3, 7, G3E); lantern.rect(5, 33, 1, 4, GE); lantern.rect(10, 33, 1, 4, GE); lantern.rect(2, 40, 12, 2, ir[2]); lantern.rect(6, 42, 4, 2, ir[1]);
  lantern.outline(K);

  // a runner of worn red carpet for the floor in front of the desk
  const rug = new Img(150, 5);
  rug.rect(0, 0, 150, 5, em[0]); rug.rect(0, 0, 150, 1, em[1]); rug.rect(0, 4, 150, 1, K);
  for (let x = 4; x < 146; x += 9) { rug.rect(x, 2, 3, 1, gd[1]); rug.set(x + 1, 1, gd[2]); rug.set(x + 1, 3, gd[0]); }
  for (let x = 0; x < 150; x += 2) rug.set(x, 0, (x * 7) % 5 ? em[1] : gd[1]);
  for (const x of [0, 1, 148, 149]) rug.rect(x, 0, 1, 5, (x & 1) ? gd[1] : em[1]);

  // a deep niche in the back wall with a barred vault door: the depth layer behind everything
  const vault = new Img(70, 96);
  vault.poly([[4, 96], [4, 30], [14, 12], [35, 3], [56, 12], [66, 30], [66, 96]], so[0]);
  vault.poly([[9, 96], [9, 32], [18, 17], [35, 9], [52, 17], [61, 32], [61, 96]], K);
  vault.ellipse(35, 58, 20, 22, ir[0]); vault.ring(35, 58, 17, 20, ir[1]); vault.ring(35, 58, 8, 10, ir[2]);
  for (let a = 0; a < 6; a++) { const an = a * Math.PI / 3; vault.line(35 + Math.cos(an) * 3, 58 + Math.sin(an) * 3, 35 + Math.cos(an) * 14, 58 + Math.sin(an) * 14, ir[1], 1); }
  vault.ellipse(35, 58, 3, 3, gd[2]); vault.set(34, 57, gd[4]);
  for (let a = 0; a < 12; a++) { const an = a * Math.PI / 6; vault.set(35 + Math.cos(an) * 18.5, 58 + Math.sin(an) * 18.5, ir[3]); }
  for (let y = 84; y < 96; y += 4) vault.rect(9, y, 52, 1, so[0]);
  vault.each(4, 3, 62, 93, (x, y, old) => (old === so[0] && (x * 5 + y * 9) % 17 === 0 ? so[1] : undefined));

  // a cloth banner with the coin of the house
  const banner = new Img(20, 58);
  banner.rect(0, 0, 20, 2, ir[2]); banner.rect(2, 2, 16, 48, em[0]); banner.rect(2, 2, 2, 48, em[1]); banner.rect(16, 2, 2, 48, K);
  banner.poly([[2, 50], [10, 57], [18, 50]], em[0]); banner.rect(4, 4, 12, 1, gd[1]); banner.rect(4, 46, 12, 1, gd[1]);
  banner.ellipse(10, 24, 5, 5, gd[2]); banner.ring(10, 24, 3.4, 5, gd[3]); banner.rect(9, 21, 2, 6, gd[0]); banner.set(8, 21, gd[4]);
  banner.each(2, 2, 16, 48, (x, y, old) => (old === em[0] && (x + y * 3) % 11 === 0 ? em[1] : undefined));

  return { npc_goblin: frames, coin, coin_pile: pile, g_shelf: shelf, g_scales: scales, g_chest: chest, g_sacks: sacks, g_sign: sign, g_lantern: lantern, g_rug: rug, g_vault: vault, g_banner: banner };
}

/* ==========================================================================
   STILLS (Round 9 §3) — six life-stage pictures, shown full-screen behind the narrator's sentences and behind
   a few lines of dialogue, each with a caption.

   The pictures are drawn here, pixel by pixel, from the game's palette (art-src/palette.json): no photographs, no files.
   Each is 320×180 and is shown at twice its size. The figure is the same in all six: dark hair, navy coat, a satchel.
   To change a picture, edit its function in SCENES (R = rectangle, grad = dithered blend, disc = filled circle, glow = dithered light).
   To show one during a dialogue, give the block  stills: { lineIndex: 'key' }  (10-content.js).
   Keys: child · teen · dojo · freelance · machine · threshold      Captions: still.<key> in STR.
   ========================================================================== */
const Stills = (() => {
  const W = 320, H = 180, cache = {};
  const C = (n) => palHex(n);
  const R = (g, col, x, y, w, h) => { g.fillStyle = C(col); g.fillRect(x | 0, y | 0, w | 0, h | 0); };
  /** ordered dither from colour a (top/left) to b (bottom/right) */
  const grad = (g, x, y, w, h, a, b, horiz) => { R(g, a, x, y, w, h); g.fillStyle = C(b); for (let yy = 0; yy < h; yy++) for (let xx = 0; xx < w; xx++) { const k = horiz ? xx / w : yy / h; if (B4[(xx & 3) + ((yy & 3) << 2)] / 16 < k) g.fillRect(x + xx, y + yy, 1, 1); } };
  const disc = (g, col, cx, cy, r) => { g.fillStyle = C(col); for (let y = -r; y <= r; y++) { const w = Math.round(Math.sqrt(r * r - y * y)); g.fillRect(cx - w, cy + y, w * 2 + 1, 1); } };
  /** light: dense at the centre, thinning to nothing at radius r */
  const glow = (g, col, cx, cy, r, power) => { g.fillStyle = C(col); for (let y = -r; y <= r; y++) for (let x = -r; x <= r; x++) { const d = Math.sqrt(x * x + y * y) / r; if (d >= 1) continue; const px = cx + x, py = cy + y; if (B4[(px & 3) + ((py & 3) << 2)] / 16 < (1 - d) * (power || .7)) g.fillRect(px, py, 1, 1); } };
  const ring = (g, col, cx, cy, r) => { g.fillStyle = C(col); for (let a = 0; a < 360; a += 2) g.fillRect(Math.round(cx + Math.cos(a * Math.PI / 180) * r), Math.round(cy + Math.sin(a * Math.PI / 180) * r), 1, 1); };
  const line = (g, col, x0, y0, x1, y1) => { g.fillStyle = C(col); const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0)) | 0; for (let i = 0; i <= n; i++) g.fillRect(Math.round(x0 + (x1 - x0) * i / (n || 1)), Math.round(y0 + (y1 - y0) * i / (n || 1)), 1, 1); };
  /** the head: sculpted windswept hair with highlights, ear & lit cheek. f = facing (1 right, -1 left), s = size */
  const head = (g, x, y, s, f, back) => {
    disc(g, 'void1', x, y, s);
    disc(g, 'soot0', x, y - 1, s);
    R(g, 'bone1', x - Math.ceil(s * .45), y - s + 1, Math.max(3, s - 2), 2);
    if (!back) {
      const hair = Math.ceil(s * .68);
      const fx = f > 0 ? x - 1 : x - s + 1;
      R(g, 'bone3', fx, y - s + hair, s, s * 2 - hair - 1);
      R(g, 'bone4', f > 0 ? x + s - 3 : x - s + 1, y - s + hair, 2, Math.max(2, s - 3));
      R(g, 'bone2', fx + 1, y + s - 1, Math.max(2, s - 2), 1);
      R(g, 'bone2', f > 0 ? x - 2 : x + 1, y, 1, 2); // ear
      R(g, 'void1', f > 0 ? x + s - 3 : x - s + 2, y - s + hair + 2, 1, 2);
      R(g, 'soot0', f > 0 ? x + s - 4 : x - s + 2, y - s + hair + 1, 2, 1); // brow
    } else {
      R(g, 'bone0', x - s + 2, y - 2, s * 2 - 4, s);
    }
  };
  /** the stitched leather satchel on its strap */
  const bag = (g, x, y, f) => {
    line(g, 'gold1', x - f * 5, y - 16, x + f * 2, y);
    R(g, 'void0', x - 2, y, 11, 8);
    R(g, 'gold0', x - 1, y, 9, 7);
    R(g, 'gold1', x - 1, y, 9, 3);
    R(g, 'gold2', x, y, 7, 1);
    R(g, 'gold3', x + 3, y + 3, 2, 2);
    R(g, 'gold4', x + 3, y + 3, 1, 1);
  };

  const SCENES = {
    /* a boy and his first computer */
    child(g) {
      grad(g, 0, 0, W, 140, 'void1', 'cold0'); grad(g, 0, 140, W, 40, 'soot1', 'void1');
      R(g, 'soot2', 226, 24, 62, 52); R(g, 'cold1', 230, 28, 54, 44); disc(g, 'bone4', 268, 42, 7); disc(g, 'cold1', 271, 40, 6); R(g, 'soot2', 256, 28, 2, 44); R(g, 'soot2', 230, 49, 54, 2);
      [[238, 34], [246, 60], [278, 64], [262, 32], [240, 52]].forEach(([x, y]) => R(g, 'bone3', x, y, 1, 1));
      glow(g, 'cold2', 150, 88, 74, .55); glow(g, 'cold3', 150, 88, 40, .7);
      R(g, 'soot3', 84, 116, 132, 5); R(g, 'soot2', 84, 121, 132, 2); R(g, 'soot2', 90, 123, 4, 34); R(g, 'soot2', 206, 123, 4, 34);
      R(g, 'bone2', 124, 66, 56, 44); R(g, 'bone1', 124, 106, 56, 4); R(g, 'stone1', 128, 70, 48, 34); R(g, 'cold3', 130, 72, 44, 30);          // the monitor
      [[134, 76, 18], [134, 80, 26], [138, 84, 14], [134, 88, 30], [134, 92, 10]].forEach(([x, y, w]) => R(g, 'cold4', x, y, w, 1)); R(g, 'bone4', 146, 96, 3, 2);
      R(g, 'bone2', 140, 110, 24, 3); R(g, 'bone1', 132, 113, 40, 3); R(g, 'stone2', 134, 114, 36, 1);                                          // stand and keyboard
      R(g, 'soot3', 96, 118, 4, 40); R(g, 'soot3', 96, 132, 26, 4); R(g, 'soot3', 118, 136, 3, 22); R(g, 'soot3', 96, 100, 3, 20);               // the chair, too big for him
      R(g, 'cold1', 102, 108, 14, 24); R(g, 'cold2', 112, 110, 4, 20); R(g, 'cold1', 114, 112, 16, 4); R(g, 'bone3', 130, 112, 4, 3);            // the boy: body, arm to the keys
      R(g, 'soot0', 104, 132, 14, 5); R(g, 'soot0', 114, 136, 5, 12); R(g, 'bone1', 113, 148, 7, 3);                                             // legs that do not reach the floor
      head(g, 109, 100, 7, 1);
      R(g, 'ember2', 40, 150, 14, 8); R(g, 'gold3', 44, 146, 6, 4); disc(g, 'moss3', 66, 154, 4);                                               // toys on the floor
      R(g, 'soot2', 20, 60, 40, 3); R(g, 'ember1', 24, 48, 5, 12); R(g, 'cold2', 30, 50, 4, 10); R(g, 'gold2', 35, 46, 6, 14); R(g, 'moss2', 43, 51, 4, 9);
    },
    /* a teenager, coding at night */
    teen(g) {
      grad(g, 0, 0, W, 138, 'void0', 'void1'); grad(g, 0, 138, W, 42, 'soot0', 'void0');
      R(g, 'soot1', 20, 20, 76, 58); grad(g, 24, 24, 68, 50, 'cold0', 'void1');                                                                    // window: the city asleep
      for (let i = 0; i < 9; i++) { const x = 26 + i * 7, h = 10 + ((i * 37) % 22); R(g, 'void0', x, 74 - h, 6, h); if (i % 2) R(g, 'gold3', x + 2, 74 - h + 4 + (i % 3) * 3, 1, 1); if (i % 3 === 0) R(g, 'gold2', x + 4, 74 - h + 9, 1, 1); }
      disc(g, 'bone3', 80, 34, 4); R(g, 'soot1', 58, 24, 2, 50);
      ring(g, 'bone1', 250, 34, 10); line(g, 'bone3', 250, 34, 250, 27); line(g, 'bone3', 250, 34, 254, 37);                                      // the clock: far too late
      glow(g, 'moss2', 176, 84, 70, .5); glow(g, 'gold2', 268, 96, 34, .6);
      R(g, 'soot2', 110, 112, 190, 5); R(g, 'soot1', 110, 117, 190, 2); R(g, 'soot1', 118, 119, 4, 40); R(g, 'soot1', 290, 119, 4, 40);
      R(g, 'stone1', 140, 58, 78, 50); R(g, 'void1', 143, 61, 72, 44); R(g, 'stone1', 172, 108, 14, 4);                                             // the screen: code
      [['moss3', 4, 12], ['cold3', 8, 30], ['cold3', 8, 22], ['gold3', 12, 16], ['moss3', 12, 34], ['cold3', 8, 18], ['ember3', 12, 24], ['moss3', 4, 8], ['cold3', 4, 28], ['gold3', 8, 14]].forEach(([c, ind, w], i) => R(g, c, 146 + ind, 64 + i * 4, w, 1));
      R(g, 'bone4', 190, 100, 3, 2);
      R(g, 'stone1', 150, 112, 56, 3); R(g, 'iron1', 152, 113, 52, 1);
      R(g, 'iron1', 262, 110, 12, 2); line(g, 'iron2', 268, 110, 262, 92); line(g, 'iron2', 262, 92, 272, 86); R(g, 'gold4', 270, 84, 8, 4);        // the lamp
      R(g, 'bone2', 228, 104, 8, 8); R(g, 'ember1', 280, 100, 14, 4); R(g, 'cold1', 281, 96, 12, 4); R(g, 'moss2', 282, 92, 10, 4);                 // cup, books
      R(g, 'soot1', 104, 120, 5, 38); R(g, 'soot1', 104, 134, 30, 4); R(g, 'soot1', 100, 96, 4, 26);
      R(g, 'cold1', 108, 102, 18, 32); R(g, 'cold0', 108, 102, 6, 32); R(g, 'cold1', 122, 108, 26, 5); R(g, 'bone3', 148, 109, 4, 3);              // hunched, in a hood
      R(g, 'void1', 112, 134, 20, 6); R(g, 'void1', 128, 138, 6, 20); R(g, 'bone1', 127, 156, 9, 3);
      head(g, 122, 94, 7, 1); R(g, 'iron2', 114, 88, 16, 2); R(g, 'iron2', 114, 90, 3, 8);                                                        // headphones
    },
    /* a young man in a dojo */
    dojo(g) {
      grad(g, 0, 0, W, 124, 'soot2', 'soot3'); for (let x = 0; x < W; x += 46) R(g, 'soot1', x, 0, 4, 124); R(g, 'soot1', 0, 30, W, 3);
      grad(g, 0, 124, W, 56, 'gold1', 'soot2'); for (let y = 132; y < H; y += 10) R(g, 'soot2', 0, y, W, 1); for (let x = 20; x < W; x += 64) R(g, 'soot2', x, 124, 1, 56);
      R(g, 'soot1', 18, 40, 70, 78); for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) R(g, 'bone4', 21 + i * 17, 43 + j * 19, 14, 16);        // the paper window
      glow(g, 'bone3', 54, 84, 80, .4);
      R(g, 'bone3', 108, 40, 24, 66); R(g, 'soot1', 106, 38, 28, 3); R(g, 'soot1', 106, 105, 28, 3);                                                // the scroll
      line(g, 'void1', 116, 48, 124, 60); line(g, 'void1', 124, 60, 114, 72); line(g, 'void1', 114, 72, 126, 84); line(g, 'void1', 120, 84, 120, 98); R(g, 'ember3', 125, 96, 4, 4);
      R(g, 'soot1', 232, 60, 4, 64); R(g, 'soot1', 292, 60, 4, 64); [70, 84, 98].forEach((y, i) => { R(g, 'soot1', 230, y + 6, 68, 2); R(g, i ? 'ember1' : 'void1', 238, y, 54, 3); R(g, i ? 'soot3' : 'gold3', 250, y - 1, 2, 5); });      // the rack
      // the figure: kneeling, the sheathed blade at his left side
      R(g, 'cold0', 132, 132, 60, 20); R(g, 'cold1', 140, 128, 44, 8); for (let x = 138; x < 190; x += 8) R(g, 'void1', x, 134, 1, 16);            // hakama
      R(g, 'bone3', 148, 100, 28, 30); R(g, 'bone2', 148, 100, 8, 30); line(g, 'bone1', 162, 100, 156, 126); line(g, 'bone1', 162, 100, 170, 126); // the white jacket
      R(g, 'void1', 148, 124, 28, 4);                                                                                                           // the belt
      R(g, 'bone3', 142, 106, 7, 20); R(g, 'bone3', 175, 106, 7, 20); R(g, 'bone3', 143, 126, 6, 4); R(g, 'bone3', 175, 126, 6, 4);
      head(g, 162, 92, 8, 1);
      line(g, 'void1', 120, 146, 176, 122); line(g, 'void1', 120, 147, 176, 123); R(g, 'gold3', 170, 122, 3, 5); line(g, 'soot3', 176, 121, 188, 116); line(g, 'soot3', 176, 122, 188, 117);
      R(g, 'soot2', 110, 152, 104, 3);
    },
    /* the freelancer */
    freelance(g) {
      grad(g, 0, 0, W, 136, 'stone1', 'stone0'); grad(g, 0, 136, W, 44, 'soot2', 'soot0');
      R(g, 'soot2', 214, 18, 84, 66); grad(g, 218, 22, 76, 58, 'ember2', 'gold2'); disc(g, 'gold4', 262, 64, 9); R(g, 'soot2', 255, 22, 2, 58); R(g, 'soot2', 218, 50, 76, 2);      // the window: evening
      glow(g, 'gold2', 256, 60, 70, .35);
      [[24, 26, 44, 30], [74, 22, 30, 40], [28, 62, 36, 24], [70, 68, 40, 20]].forEach(([x, y, w, h], i) => { R(g, 'bone1', x, y, w, h); R(g, 'stone0', x + 1, y + 1, w - 2, h - 2); R(g, 'bone1', x + 3, y + 3, w - 6, 3); R(g, 'stone2', x + 3, y + 9, (w - 6) * .6, h - 13); R(g, 'stone2', x + 5 + (w - 6) * .6, y + 9, (w - 6) * .4 - 2, 4); if (i < 2) R(g, 'rune3', x + 5 + (w - 6) * .6, y + 15, 8, 3); });      // wireframes pinned to the wall
      [['gold3', 122, 30], ['ember3', 134, 38], ['moss3', 124, 46], ['gold3', 138, 26]].forEach(([c, x, y]) => R(g, c, x, y, 8, 8));
      R(g, 'soot3', 96, 114, 180, 5); R(g, 'soot2', 96, 119, 180, 2); R(g, 'soot2', 104, 121, 4, 38); R(g, 'soot2', 266, 121, 4, 38);
      R(g, 'iron2', 166, 80, 54, 34); R(g, 'cold3', 169, 83, 48, 28); R(g, 'iron1', 160, 114, 66, 3);                                               // the laptop: a page being built
      R(g, 'bone4', 172, 86, 42, 3); R(g, 'cold4', 172, 92, 20, 12); R(g, 'bone3', 195, 92, 19, 2); R(g, 'bone3', 195, 96, 15, 2); R(g, 'gold3', 195, 101, 10, 3); R(g, 'cold2', 172, 106, 42, 3);
      R(g, 'bone3', 238, 106, 8, 8); R(g, 'bone3', 246, 108, 2, 4); line(g, 'bone1', 241, 102, 243, 96); line(g, 'bone1', 243, 96, 240, 90);       // coffee
      R(g, 'ember1', 252, 102, 10, 12); disc(g, 'moss3', 257, 94, 6); disc(g, 'moss2', 254, 90, 3);                                                // a plant
      R(g, 'soot1', 110, 122, 5, 36); R(g, 'soot1', 110, 134, 30, 4); R(g, 'soot1', 106, 90, 4, 34);
      R(g, 'cold1', 114, 98, 20, 36); R(g, 'cold0', 114, 98, 6, 36); R(g, 'cold2', 130, 100, 3, 30); R(g, 'cold1', 128, 108, 30, 5); R(g, 'bone3', 158, 109, 4, 3);      // navy coat
      R(g, 'bone4', 131, 98, 3, 8); R(g, 'void1', 118, 134, 22, 6); R(g, 'void1', 136, 138, 6, 20); R(g, 'soot0', 134, 156, 11, 3);
      head(g, 127, 90, 7, 1);
      bag(g, 100, 112, -1);                                                                                                                     // the satchel hangs on the chair
    },
    /* the builder, with the machines that speak */
    machine(g) {
      grad(g, 0, 0, W, 142, 'void0', 'void1'); grad(g, 0, 142, W, 38, 'cold0', 'void0'); for (let x = 30; x < W; x += 58) { R(g, 'stone0', x, 0, 8, 142); R(g, 'void1', x + 6, 0, 2, 142); }
      glow(g, 'rune1', 196, 78, 96, .5); glow(g, 'rune2', 196, 78, 62, .6); glow(g, 'rune4', 196, 78, 26, .8); disc(g, 'rune5', 196, 78, 9); disc(g, 'bone4', 196, 78, 4);
      ring(g, 'rune4', 196, 78, 22); ring(g, 'rune3', 196, 78, 36); ring(g, 'rune2', 196, 78, 50);
      [[0, 36], [50, 50], [120, 22], [200, 36], [250, 50], [310, 22]].forEach(([a, r]) => disc(g, 'rune5', Math.round(196 + Math.cos(a * Math.PI / 180) * r), Math.round(78 + Math.sin(a * Math.PI / 180) * r), 1));
      // three things he builds: a page, a phone, a game
      [[262, 30], [270, 86], [246, 132]].forEach(([x, y]) => line(g, 'rune3', 196, 78, x, y));
      R(g, 'bone2', 248, 14, 50, 34); R(g, 'void1', 250, 16, 46, 30); R(g, 'bone3', 252, 18, 42, 3); R(g, 'cold3', 252, 24, 18, 12); R(g, 'bone2', 273, 24, 20, 2); R(g, 'bone2', 273, 28, 14, 2); R(g, 'gold3', 273, 33, 10, 3); R(g, 'stone2', 252, 39, 42, 4);
      R(g, 'bone2', 276, 62, 22, 40); R(g, 'void1', 278, 66, 18, 30); R(g, 'cold3', 280, 68, 14, 8); R(g, 'bone2', 280, 79, 14, 2); R(g, 'bone2', 280, 83, 10, 2); R(g, 'moss3', 280, 88, 14, 5); R(g, 'bone3', 285, 98, 4, 2);
      R(g, 'iron2', 232, 122, 40, 18); R(g, 'iron1', 232, 136, 10, 8); R(g, 'iron1', 262, 136, 10, 8); R(g, 'void1', 239, 128, 8, 2); R(g, 'void1', 242, 125, 2, 8); disc(g, 'ember3', 262, 127, 2); disc(g, 'moss3', 256, 132, 2);
      R(g, 'cold1', 0, 142, W, 1);
      // the figure: coat and satchel, one hand raised to the light
      R(g, 'cold0', 92, 84, 22, 44); R(g, 'cold1', 104, 84, 10, 44); R(g, 'cold2', 112, 86, 2, 40); R(g, 'cold0', 90, 120, 26, 12);
      R(g, 'cold1', 112, 88, 24, 5); R(g, 'cold1', 132, 80, 5, 10); R(g, 'bone3', 132, 76, 5, 5);
      R(g, 'void1', 94, 130, 8, 26); R(g, 'void1', 106, 130, 8, 26); R(g, 'soot0', 92, 154, 12, 3); R(g, 'soot0', 104, 154, 12, 3);
      head(g, 104, 76, 8, 1); R(g, 'rune4', 111, 72, 1, 8);
      bag(g, 92, 108, -1);
      grad(g, 86, 157, 40, 10, 'cold0', 'void0');
    },
    /* the figure at the final threshold */
    threshold(g) {
      grad(g, 0, 0, W, H, 'void0', 'void1');
      for (let y = 0; y < 150; y += 12) for (let x = (y / 12 % 2) * 14; x < W; x += 28) R(g, 'stone0', x, y, 26, 10);
      R(g, 'stone1', 84, 0, 20, 150); R(g, 'stone2', 100, 0, 4, 150); R(g, 'stone1', 216, 0, 20, 150); R(g, 'stone0', 216, 0, 4, 150);                // pillars
      // the door: a pointed arch full of light
      for (let y = 20; y < 150; y++) { const k = y < 70 ? Math.sqrt(Math.max(0, 1 - Math.pow((70 - y) / 50, 2))) : 1, w = Math.round(48 * k); R(g, 'stone3', 160 - w - 4, y, w * 2 + 8, 1); R(g, 'gold3', 160 - w, y, w * 2, 1); }
      for (let y = 26; y < 150; y++) { const k = y < 70 ? Math.sqrt(Math.max(0, 1 - Math.pow((70 - y) / 44, 2))) : 1, w = Math.round(36 * k); R(g, 'gold4', 160 - w, y, w * 2, 1); }
      for (let y = 40; y < 150; y++) { const k = y < 76 ? Math.sqrt(Math.max(0, 1 - Math.pow((76 - y) / 36, 2))) : 1, w = Math.round(20 * k); R(g, 'bone4', 160 - w, y, w * 2, 1); }
      glow(g, 'gold3', 160, 96, 110, .45); glow(g, 'gold4', 160, 100, 70, .4);
      [[112, 60], [108, 84], [108, 108], [208, 60], [212, 84], [212, 108], [136, 26], [184, 26], [160, 14]].forEach(([x, y]) => { R(g, 'rune4', x, y, 3, 3); R(g, 'rune5', x + 1, y + 1, 1, 1); });      // runes on the arch
      R(g, 'stone2', 96, 150, 128, 6); R(g, 'stone1', 84, 156, 152, 8); R(g, 'stone0', 70, 164, 180, 16);                                          // the steps
      grad(g, 124, 150, 72, 6, 'gold3', 'stone2'); grad(g, 116, 156, 88, 8, 'gold2', 'stone1');
      // the figure, from behind: coat, satchel, a long shadow towards us
      R(g, 'void1', 150, 104, 22, 44); R(g, 'cold0', 152, 106, 18, 40); R(g, 'cold1', 152, 106, 2, 40); R(g, 'cold1', 168, 106, 2, 40); R(g, 'void1', 148, 140, 26, 8);
      R(g, 'void1', 152, 146, 7, 14); R(g, 'void1', 163, 146, 7, 14);
      head(g, 161, 96, 8, 1, true);
      line(g, 'soot3', 153, 106, 170, 128); R(g, 'soot3', 166, 126, 10, 8); R(g, 'ember1', 166, 126, 10, 2);
      for (let y = 160; y < H; y++) { const w = 10 + (y - 160) * .9; R(g, 'void0', 161 - w, y, w * 2, 1); }
    }
  };
  function picture(key) {
    if (!cache[key]) {
      const c = mk(W, H), g = c.getContext('2d'); g.imageSmoothingEnabled = false;
      SCENES[key](g);
      // Subtle pixel-art vignette border + gilded corner filigree on every narrative still
      R(g, 'void0', 0, 0, W, 2); R(g, 'void0', 0, H - 2, W, 2); R(g, 'void0', 0, 0, 2, H); R(g, 'void0', W - 2, 0, 2, H);
      R(g, 'stone1', 2, 2, W - 4, 1); R(g, 'stone1', 2, H - 3, W - 4, 1); R(g, 'stone1', 2, 2, 1, H - 4); R(g, 'stone1', W - 3, 2, 1, H - 4);
      for (const [cx, cy, sx, sy] of [[3, 3, 1, 1], [W - 4, 3, -1, 1], [3, H - 4, 1, -1], [W - 4, H - 4, -1, -1]]) {
        R(g, 'gold2', cx, cy, sx * 6, sy); R(g, 'gold2', cx, cy, sx, sy * 6);
        R(g, 'gold3', cx, cy, 1, 1); R(g, 'rune4', cx + sx * 2, cy + sy * 2, 1, 1);
      }
      cache[key] = c;
    }
    return cache[key];
  }
  let box = null, cur = '';
  return {
    keys: Object.keys(SCENES), picture,
    /** show a picture inside `parent` (the intro screen or the stage), with its caption */
    show(key, parent) {
      if (!SCENES[key]) return;
      if (!box) { box = document.createElement('div'); box.id = 'still'; box.setAttribute('data-noi18n', ''); box.innerHTML = '<canvas width="' + W + '" height="' + H + '"></canvas><div class="cap"></div>'; }
      if (box.parentNode !== parent) parent.insertBefore(box, parent.firstChild);
      if (cur !== key) { const g = box.firstChild.getContext('2d'); g.imageSmoothingEnabled = false; g.drawImage(picture(key), 0, 0); cur = key; box.classList.remove('on'); void box.offsetWidth; }
      const cap = box.querySelector('.cap'); cap.textContent = tr('still.' + key); cap.dir = RTL[LANG] ? 'rtl' : 'ltr';
      // whole device pixels per picture pixel, as large as fits
      const pw = parent.clientWidth || innerWidth, ph = (parent.id === 'stage' && parent.classList.contains('tall') ? parseFloat(getComputedStyle(parent).getPropertyValue('--gh')) || parent.clientHeight : parent.clientHeight) || innerHeight, d = devicePixelRatio || 1;
      // in a dialogue on a wide screen the box sits under the picture, so the picture gets the room above it
      const wide = parent.id === 'stage' && !parent.classList.contains('tall'), em = parseFloat(getComputedStyle(parent).fontSize) || 16;
      const room = wide ? ph - (el('dlg').offsetHeight || em * 8) - em * 3.4 : parent.id === 'intro' && pw > ph ? ph - em * 6.4 : ph;      // the intro's sentence sits under the picture too
      const k = Math.max(d, Math.floor(Math.min(pw * d / W, room * d / H) + .01)) / d;                                                // never smaller than one screen pixel per picture pixel
      box.firstChild.style.width = (W * k) + 'px'; box.firstChild.style.height = (H * k) + 'px';
      box.dataset.key = key; box.classList.add('on'); parent.classList.add('still-on'); this.host = parent;
    },
    hide() { if (box) { box.classList.remove('on'); cur = ''; } if (this.host) { this.host.classList.remove('still-on'); this.host = null; } },
    shown() { return box && box.classList.contains('on') ? box.dataset.key : ''; }
  };
})();

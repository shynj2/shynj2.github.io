// SHYN, THE RUNE ARCHITECT — Sovereign of Veyrath high-detail procedural part sprites.
//   K outline · d m l r arch-coat (void2..rune3) · D M L forged steel / tunic · s S h ashen skin
//   n N o sculpted horns · v V W radiant rune light · b g G y gilded filigree & brass.
function grid(w, h) {
  const a = Array.from({ length: h }, () => Array(w).fill('.'));
  const G = {
    a, w, h,
    set(x, y, c) { x = Math.round(x); y = Math.round(y); if (x >= 0 && y >= 0 && x < w && y < h) a[y][x] = c; },
    get(x, y) { return x >= 0 && y >= 0 && x < w && y < h ? a[y][x] : '.'; },
    span(y, x0, x1, c) { for (let x = Math.round(x0); x <= Math.round(x1); x++) G.set(x, y, c); },
    rect(x, y, ww, hh, c) { for (let j = 0; j < hh; j++) G.span(y + j, x, x + ww - 1, c); },
    ell(cx, cy, rx, ry, c) { for (let y = Math.ceil(cy - ry); y <= cy + ry; y++) { const k = 1 - ((y - cy) / ry) ** 2; if (k < 0) continue; const d = rx * Math.sqrt(k); G.span(y, cx - d, cx + d, c); } },
    line(x0, y0, x1, y1, c, th = 1) { const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0)) || 1; for (let i = 0; i <= n; i++) { const x = x0 + (x1 - x0) * i / n, y = y0 + (y1 - y0) * i / n; for (let k = 0; k < th; k++) G.set(x, y + k, c); } },
    path(pts, c, th) { for (let i = 0; i < pts.length - 1; i++) G.line(pts[i][0], pts[i][1], pts[i + 1][0], pts[i + 1][1], c, th); },
    vol(ph, [d, m, l, r], lo = .3, hi = .68) {
      for (let y = 0; y < h; y++) { let x0 = -1, x1 = -1; for (let x = 0; x < w; x++) if (a[y][x] === ph) { if (x0 < 0) x0 = x; x1 = x; } if (x0 < 0) continue;
        for (let x = x0; x <= x1; x++) if (a[y][x] === ph) { const t = (x - x0) / Math.max(1, x1 - x0); a[y][x] = x === x1 ? r : t < lo ? d : t < hi ? m : l; } }
    },
    rows() { return a.map((r) => r.join('')); }
  };
  return G;
}

function coat(sway = 0, kneel = 0) {
  const W = 46, H = 84, cx = 22, G = grid(W, H), top = 7 + kneel, hem = 73, waist = top + 27;
  // Armored greaves & sabatons visible beneath the split sovereign coat
  if (!kneel) for (const bx of [-8, 3]) {
    G.rect(cx + bx, hem - 5, 5, 14, 'D'); G.span(hem - 3, cx + bx + 1, cx + bx + 3, 'g');
    G.rect(cx + bx, hem + 6, 8, 4, 'D'); G.span(hem + 6, cx + bx + 1, cx + bx + 6, 'M'); G.set(cx + bx + 6, hem + 7, 'L');
    G.span(hem - 1, cx + bx + 3, cx + bx + 4, 'L');
  }
  for (let y = top; y <= hem; y++) {
    const yy = y - top, u = Math.max(0, (y - waist) / (hem - waist));
    const half = yy < 6 ? 15 : y <= waist ? 15 - (yy - 6) / 21 * 5 : 10 + Math.pow(u, .8) * (kneel ? 15 : 10.5);
    const sh = Math.round(Math.sin(u * 2.2 + sway) * sway * 1.6 * u), open = y <= waist ? 2 : 2 + u * 5;
    for (let x = Math.round(cx - half + sh); x <= Math.round(cx + half + sh); x++) {
      const dx = x - cx - sh * (y > waist ? 1 : 0);
      G.set(x, y, Math.abs(dx) <= open ? 'D' : 'A');
      if (Math.round(Math.abs(dx)) === Math.round(open) + 1) G.set(x, y, y % 4 === 0 ? 'y' : 'g');
      if (Math.round(Math.abs(dx)) === Math.round(open) + 3 && y > waist + 4 && y < hem - 3 && y % 6 < 3) G.set(x, y, 'v');
    }
    // Glowing central ribcage / breastplate rune spine
    if (y < waist && yy > 2) {
      G.set(cx, y, yy % 4 === 0 ? 'W' : yy % 4 === 1 ? 'V' : 'v');
      if (yy % 6 === 2) { G.set(cx - 2, y, 'g'); G.set(cx + 2, y, 'G'); }
    }
    if (y > waist + 3 && !kneel && Math.abs(u - .5) < .5) { G.set(cx - 3, y, 'M'); G.set(cx + 3, y, 'M'); }
  }
  // Ornate rune-gilded coat hem
  for (let x = 0; x < W; x++) {
    if ((x * 7) % 5 === 0) { if (G.get(x, hem) !== '.') G.set(x, hem, '.'); }
    else if (G.get(x, hem) === 'A') G.set(x, hem, x % 3 === 0 ? 'y' : 'g');
    if (G.get(x, hem - 1) === 'A' && x % 4 === 0) G.set(x, hem - 1, 'G');
  }
  G.vol('A', ['d', 'm', 'l', 'r']);
  for (let y = waist + 6; y < hem; y++) {
    const u = (y - waist) / (hem - waist);
    for (const k of [-.62, .55]) {
      const x = Math.round(cx + k * (10 + u * 10) + Math.sin(y * .2 + sway) * .8);
      if ('ml'.includes(G.get(x, y))) G.set(x, y, 'd');
      if (k > 0 && 'ml'.includes(G.get(x + 1, y))) G.set(x + 1, y, 'l');
    }
  }
  // Sovereign belt, gemmed clasp & hanging Root-Key talisman
  G.rect(cx - 11, waist, 23, 3, 'b'); G.span(waist, cx - 10, cx + 10, 'G'); G.span(waist + 2, cx - 10, cx + 10, 'g');
  G.rect(cx - 3, waist - 1, 7, 5, 'G'); G.rect(cx - 2, waist, 5, 3, 'y'); G.set(cx, waist + 1, 'W'); G.set(cx - 1, waist + 1, 'V'); G.set(cx + 1, waist + 1, 'V');
  G.line(cx, waist + 4, cx, waist + 8, 'y'); G.set(cx + 1, waist + 6, 'G'); G.set(cx + 1, waist + 8, 'y');
  // Multi-tiered rune-etched pauldrons & high arch-collar
  for (const s of [-1, 1]) {
    for (let k = 0; k < 3; k++) {
      const px = cx + s * (11 + k * 2), py = top + 1 + k * 3;
      G.ell(px, py, 6 - k, 3, 'P');
      G.span(py + 3, px - 5 + k, px + 5 - k, k === 0 ? 'y' : 'g');
      if (k === 0) G.set(px, py + 1, 'V');
    }
    G.path([[cx + s * 4, top + 1], [cx + s * 8, top - 3], [cx + s * 10, top - 8]], s < 0 ? 'd' : 'l', 3);
    G.path([[cx + s * 5, top], [cx + s * 10, top - 8]], s > 0 ? 'y' : 'g', 1);
  }
  G.vol('P', ['D', 'M', 'L', 'y']);
  return G.rows();
}

function head() {                                   // 30 x 30, neck pivot at (14, 28)
  const G = grid(30, 30);
  // Far horn with ridge rings
  G.path([[18, 13], [16, 7], [12, 3], [6, 1]], 'n', 2); G.set(6, 1, 'N');
  // Flowing dark mane
  G.ell(12, 16, 7.5, 6.5, 'D'); G.rect(5, 16, 6, 11, 'D'); G.rect(4, 22, 4, 6, 'D');
  G.line(7, 15, 6, 25, 'M'); G.line(10, 14, 9, 24, 'M');
  // Sculpted sovereign face
  G.ell(15, 19, 5.5, 6, 's'); G.span(25, 13, 19, 's'); G.span(26, 14, 18, 's'); G.span(27, 15, 17, 's'); G.rect(12, 26, 4, 3, 's');
  for (let y = 12; y < 28; y++) for (let x = 17; x < 24; x++) if (G.get(x, y) === 's') G.set(x, y, 'S');
  G.set(21, 19, 'h'); G.set(21, 20, 'S'); G.set(20, 17, 'h'); G.set(19, 21, 'h');
  G.ell(13, 13, 7, 3, 'D'); G.span(15, 9, 14, 'D');
  // Royal Rune-Crown Circlet with spires & central star-gem
  G.span(14, 10, 21, 'G'); G.span(13, 12, 20, 'g');
  G.set(15, 11, 'y'); G.set(19, 11, 'y'); G.set(19, 12, 'y');
  G.set(18, 13, 'W'); G.set(17, 13, 'V'); G.set(19, 14, 'y');
  // Burning violet Architect eye & brow
  G.span(17, 16, 21, 'D'); G.set(17, 18, 'V'); G.set(18, 18, 'W'); G.set(19, 18, 'W'); G.set(20, 18, 'V'); G.set(16, 19, 'v');
  G.span(23, 17, 19, 'D'); G.rect(15, 25, 4, 3, 'D'); G.set(16, 28, 'D');
  // Pointed ear with gold cuff
  G.set(11, 19, 's'); G.set(10, 18, 's'); G.set(9, 17, 'S'); G.set(8, 16, 'y'); G.set(10, 19, 's');
  // Swept near horn with bright ivory highlights
  G.path([[13, 12], [10, 7], [5, 3], [1, 1]], 'n', 3);
  G.path([[13, 12], [10, 7], [5, 3], [1, 1]], 'N', 1);
  G.set(1, 1, 'o'); G.set(2, 1, 'o'); G.set(3, 2, 'o'); G.set(8, 6, 'n'); G.set(5, 3, 'N');
  return G.rows();
}

function arm() {                                    // 11 x 34, shoulder pivot at (5, 2)
  const G = grid(11, 34);
  G.rect(2, 0, 7, 16, 'A'); G.vol('A', ['d', 'm', 'l', 'r']);
  G.span(8, 2, 8, 'g');
  G.rect(1, 16, 9, 12, 'B'); G.vol('B', ['b', 'g', 'G', 'y']);
  G.span(16, 1, 9, 'y'); G.span(20, 1, 9, 'b'); G.span(24, 1, 9, 'b'); G.span(27, 1, 9, 'y');
  G.rect(9, 17, 2, 10, 'L'); G.set(9, 19, 'V'); G.set(9, 20, 'W'); G.set(9, 21, 'W'); G.set(10, 20, 'V'); G.set(9, 22, 'v');
  G.rect(2, 28, 7, 6, 'D'); G.span(29, 3, 8, 'L'); G.span(31, 3, 8, 'M');
  return G.rows();
}

function staff() {                                  // THE ROOTKEY: 17 x 116, grip pivot at (8, 76)
  const G = grid(17, 116);
  for (let y = 16; y < 112; y++) {
    G.set(7, y, 'D'); G.set(8, y, 'M'); G.set(9, y, y % 6 === 0 ? 'v' : 'L');
    if (y % 12 === 3) { G.span(y, 6, 10, 'G'); G.set(10, y, 'y'); }
  }
  // Ornate twin-ring astrolabe bow of the Root-Key
  G.ell(8, 8, 7.5, 7.5, 'g');
  for (let y = 0; y < 16; y++) for (let x = 8; x < 17; x++) if (G.get(x, y) === 'g') G.set(x, y, y < 8 ? 'y' : 'G');
  G.ell(8, 8, 4.5, 4.5, '.');
  // Levitating radiant rune-star inside the key bow
  G.set(8, 8, 'W'); G.set(7, 8, 'W'); G.set(9, 8, 'W'); G.set(8, 7, 'W'); G.set(8, 9, 'W');
  G.set(6, 8, 'V'); G.set(10, 8, 'V'); G.set(8, 6, 'V'); G.set(8, 10, 'V');
  G.set(7, 7, 'v'); G.set(9, 7, 'v'); G.set(7, 9, 'v'); G.set(9, 9, 'v');
  // Finials & intricate warded key-teeth
  G.set(8, 0, 'y'); G.set(0, 8, 'G'); G.set(16, 8, 'y');
  G.rect(5, 15, 7, 3, 'G'); G.span(15, 5, 11, 'y');
  G.rect(10, 19, 6, 3, 'G'); G.span(19, 10, 15, 'y'); G.set(14, 20, 'W');
  G.rect(10, 23, 4, 3, 'g'); G.span(23, 10, 13, 'G');
  G.rect(10, 27, 6, 3, 'G'); G.span(27, 10, 15, 'y'); G.set(14, 28, 'V');
  // Weighted rune pommel spike
  G.rect(6, 107, 5, 5, 'G'); G.span(107, 6, 10, 'y'); G.set(8, 109, 'W');
  G.span(112, 7, 9, 'g'); G.set(8, 113, 'y'); G.set(8, 114, 'G'); G.set(8, 115, 'b');
  return G.rows();
}

const glyph = (rows) => rows.map((r) => r.replace(/#/g, 'W').replace(/\+/g, 'V').replace(/o/g, 'v'));
export default {
  coat: coat(0), coatB: coat(1), coatK: coat(.5, 16),
  head: head(), arm: arm(), staff: staff(),
  g1: glyph(['.o+#.', '.+#..', '.#...', '##+..', '.#...', '.+#..', '.o+#.']),      // {
  g2: glyph(['.#+o.', '..#+.', '...#.', '..+##', '...#.', '..#+.', '.#+o.']),      // }
  g3: glyph(['...+#', '..+#o', '.+#o.', '+#o..', '#o...']),                        // /
  g4: glyph(['.#.', '+W+', '.o.', '.#.', '.+#', '#o.'])                            // ;
};

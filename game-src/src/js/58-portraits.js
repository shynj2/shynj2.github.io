/* ==========================================================================
   PORTRAITS — true 46x46 pixel-art dialogue portraits (scaled 2x cleanly from 23x23 -> 46x46)
   using the 47-colour master palette + Bayer dithering. Rigged characters are overridden in 59-portraits-rig.js.
   ========================================================================== */
const PORTR = {};
const PORTR_B4 = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];

function portraitFor(who, cls) {
  if (cls === 'silence' || !who) return null;
  if (who === 'who.you' || cls === 'player') return 'player';
  if (who === 'who.shyn' || who === 'who.shyn_full' || cls === 'shyn' || cls === 'architect') return 'shyn';
  if (who === 'who.librarian') return 'librarian';
  if (who === 'who.resync') return 'resync';
  if (who === 'who.goblin') return 'goblin';
  if (who === 'who.wanderer') return 'wanderer';
  if (who === 'who.prompt_keeper' || who === 'who.herald') return 'keeper';
  if (who === 'who.bot') return 'bot';
  if (who === 'who.prototype' || who === 'who.refactor') return 'shroud';
  return 'stone';
}

function makePixPortrait(drawFn, bgTop, bgBot, frameCol, gemCol) {
  const c = mk(46, 46), g = c.getContext('2d');
  g.imageSmoothingEnabled = false;

  const px = (x, y, col, w = 1, h = 1) => {
    g.fillStyle = palHex(col);
    g.fillRect(x * 2, y * 2, w * 2, h * 2);
  };
  // 23x23 logical pixel canvas (2x = 46x46) for razor-sharp pixel consistency with rig portraits!
  for (let y = 0; y < 23; y++) {
    for (let x = 0; x < 23; x++) {
      const u = y / 22;
      const d = PORTR_B4[(y & 3) * 4 + (x & 3)] / 16;
      px(x, y, u > d ? bgBot : bgTop);
    }
  }

  drawFn(px, g);

  // Ornate pixel-art portrait border (46x46)
  g.fillStyle = palHex('void0');
  g.fillRect(0, 0, 46, 2); g.fillRect(0, 44, 46, 2); g.fillRect(0, 0, 2, 46); g.fillRect(44, 0, 2, 46);
  g.fillStyle = palHex(frameCol || 'stone2');
  g.fillRect(2, 2, 42, 1); g.fillRect(2, 43, 42, 1); g.fillRect(2, 2, 1, 42); g.fillRect(43, 2, 1, 42);
  g.fillStyle = palHex(gemCol || 'gold3');
  for (const [cx, cy] of [[2, 2], [42, 2], [2, 42], [42, 42]]) g.fillRect(cx, cy, 2, 2);
  return c;
}

let getPortrait = function (key) {
  if (!key) return null;
  if (PORTR[key]) return PORTR[key];
  let cv;
  if (key === 'wanderer') {
    cv = makePixPortrait((px) => {
      px(17, 10, 'gold1', 4, 5); px(18, 11, 'gold3', 2, 3); px(18, 12, 'gold4', 2, 2);
      px(18, 9, 'soot3', 2, 1); px(19, 6, 'soot2', 1, 16);
      px(3, 16, 'moss0', 14, 6); px(5, 16, 'moss1', 10, 6); px(7, 17, 'moss2', 7, 5);
      px(6, 15, 'ember2', 9, 2); px(8, 15, 'ember3', 6, 1); px(10, 17, 'gold3', 2, 1);
      px(7, 10, 'bone2', 7, 5); px(9, 10, 'bone3', 5, 4);
      px(9, 12, 'void1', 1, 1); px(12, 12, 'void1', 1, 1);
      px(10, 14, 'soot2', 3, 1);
      px(7, 3, 'soot1', 7, 5); px(9, 2, 'soot2', 4, 2); px(11, 1, 'soot3', 2, 1);
      px(6, 7, 'gold2', 9, 1); px(10, 7, 'gold4', 2, 1);
      px(3, 8, 'soot2', 15, 2); px(4, 8, 'soot3', 12, 1);
    }, 'moss0', 'void1', 'gold1', 'gold3');
  } else if (key === 'keeper') {
    cv = makePixPortrait((px) => {
      for (const cx of [3, 19]) {
        px(cx, 10, 'bone3', 2, 5); px(cx, 10, 'bone4', 1, 4);
        px(cx, 7, 'cold4', 1, 2); px(cx + 1, 8, 'rune4', 1, 2);
      }
      px(4, 16, 'cold0', 15, 6); px(6, 16, 'cold1', 11, 6);
      px(10, 16, 'cold3', 3, 6); px(11, 17, 'rune5', 1, 1); px(11, 20, 'cold4', 1, 1);
      px(6, 5, 'cold1', 11, 11); px(8, 4, 'cold2', 7, 2); px(10, 3, 'cold3', 3, 1);
      px(8, 8, 'void0', 7, 7);
      px(7, 7, 'gold2', 9, 1); px(11, 7, 'gold4', 1, 1);
      px(9, 11, 'cold4', 2, 1); px(13, 11, 'cold4', 2, 1);
      px(10, 11, 'rune5', 1, 1); px(13, 11, 'rune5', 1, 1);
    }, 'cold0', 'void1', 'cold2', 'cold4');
  } else if (key === 'bot') {
    cv = makePixPortrait((px) => {
      px(11, 2, 'iron2', 1, 3); px(11, 1, 'gold4', 1, 1); px(10, 2, 'rune4', 1, 1); px(12, 2, 'rune4', 1, 1);
      px(4, 16, 'iron0', 15, 6); px(5, 16, 'iron2', 13, 2);
      px(8, 18, 'void0', 7, 4); px(9, 19, 'gold3', 5, 2); px(11, 19, 'rune5', 1, 2);
      px(5, 5, 'iron1', 13, 10); px(5, 5, 'iron3', 13, 1); px(5, 14, 'gold1', 13, 1);
      px(4, 8, 'gold2', 1, 4); px(18, 8, 'gold2', 1, 4);
      px(7, 7, 'void0', 9, 6);
      px(8, 9, 'rune5', 2, 2); px(13, 9, 'rune5', 2, 2);
      px(9, 9, 'bone4', 1, 1); px(14, 9, 'bone4', 1, 1);
      px(9, 12, 'rune3', 5, 1); px(11, 11, 'rune4', 1, 1);
    }, 'rune0', 'void1', 'gold1', 'rune4');
  } else if (key === 'shroud') {
    cv = makePixPortrait((px) => {
      px(18, 5, 'bone2', 3, 4); px(19, 6, 'rune3', 1, 2);
      px(4, 15, 'void2', 15, 7); px(6, 15, 'stone0', 11, 7);
      px(11, 16, 'rune3', 1, 5); px(11, 17, 'rune5', 1, 1); px(11, 20, 'rune4', 1, 1);
      px(6, 4, 'stone0', 11, 11); px(9, 3, 'stone1', 5, 2); px(11, 2, 'stone2', 2, 1);
      px(8, 7, 'void0', 7, 7);
      px(9, 10, 'rune4', 2, 1); px(13, 10, 'rune5', 2, 1);
    }, 'void2', 'void0', 'rune2', 'rune4');
  } else if (key === 'stone') {
    cv = makePixPortrait((px) => {
      px(5, 4, 'stone0', 13, 18); px(6, 3, 'stone2', 11, 19);
      px(6, 3, 'stone3', 11, 1); px(6, 3, 'stone3', 1, 19); px(16, 4, 'stone0', 1, 18);
      px(8, 7, 'rune4', 2, 1); px(8, 8, 'rune4', 1, 3); px(7, 10, 'rune5', 1, 1); px(8, 11, 'rune4', 1, 3); px(8, 14, 'rune4', 2, 1);
      px(13, 7, 'rune4', 2, 1); px(14, 8, 'rune4', 1, 3); px(15, 10, 'rune5', 1, 1); px(14, 11, 'rune4', 1, 3); px(13, 14, 'rune4', 2, 1);
      px(11, 9, 'gold4', 1, 4); px(11, 15, 'gold3', 1, 1);
      px(9, 18, 'rune2', 5, 1); px(8, 20, 'rune2', 7, 1);
      px(3, 7, 'rune5', 1, 1); px(19, 11, 'gold4', 1, 1);
    }, 'rune0', 'void0', 'stone3', 'rune4');
  } else {
    cv = makePixPortrait((px) => {
      px(5, 15, 'cold1', 13, 7); px(9, 15, 'bone4', 5, 5); px(11, 16, 'ember3', 1, 6);
      px(7, 4, 'bone0', 9, 5); px(9, 4, 'bone1', 4, 2);
      px(8, 8, 'bone3', 7, 6); px(10, 10, 'void1', 1, 1); px(13, 10, 'void1', 1, 1);
    }, 'cold0', 'void1', 'gold1', 'gold3');
  }
  PORTR[key] = cv;
  return cv;
};

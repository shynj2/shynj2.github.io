// THE LIBRARIAN — high-detail scholar rig (palette.json -> rigs.librarian).
//   K outline · d m l r cowl & robe (stone2..bone3) · D M L silver-iron clasp · s S h skin · e shadow/blindfold seam
//   v V W rune thread · g G y gold embroidery & clasps · p P parchment pages · c C / b B tome covers.
const head = [                 // embroidered deep scholar cowl, silver-gold brow trim, serene blindfolded face
  '...mmllrr...',
  '..mllGGyrr..',
  '.mllllllrrr.',
  '.mllddddlrr.',
  'mmlsSSSShlr.',
  'mdppPPPPph..',
  'mdseeeeeeh..',
  'mddsSSSSsh..',
  '.mlddsss....',
  '.mlldddgG...',
  '..mmlllgg...',
  '...mmmm.....',
];

function robe(sway) {
  const rows = [];
  for (let y = 0; y < 52; y++) {
    const t = y / 51, half = Math.round(5 + t * 4 + (t > .8 ? (t - .8) * 14 : 0)), cx = 11;
    let r = '';
    for (let x = 0; x < 23; x++) {
      const dx = x - cx;
      if (dx < -half || dx > half) { r += '.'; continue; }
      let ch = dx < -half * .45 ? 'd' : dx > half * .48 ? 'l' : 'm';
      if (dx === half && y > 3) ch = 'r';
      const fold = (k, ph) => Math.round(k * (1 + t * .9) + Math.sin(y * .16 + ph) * (sway ? 1.2 : .6));
      if (y > 14 && (dx === fold(-3, 0) || dx === fold(2.4, 2))) ch = 'd';
      if (y > 18 && (dx === fold(-3, 0) + 1 || dx === fold(2.4, 2) + 1)) ch = 'l';
      // Embroidered golden stole + central glowing rune thread
      if (Math.abs(dx) === 2 && y >= 2 && y < 38) ch = y % 4 === 0 ? 'y' : 'g';
      if (dx === 0 && y > 2 && y < 45) ch = (y % 6 === 2) ? 'W' : (y % 6 === 3) ? 'V' : (y % 6 < 5 ? 'v' : 'm');
      if (y >= 11 && y <= 13) ch = dx === 0 ? 'W' : Math.abs(dx) <= 1 ? 'y' : (Math.abs(dx) === half ? 'g' : 'G');
      if (y === 49) ch = (x + (sway ? 1 : 0)) % 3 === 0 ? 'v' : 'd';
      if (y >= 50) ch = (x + (sway ? 1 : 0)) % 3 === 0 ? 'y' : (x % 2 ? 'G' : 'g');
      if (y < 3) ch = Math.abs(dx) === 3 ? 'G' : (dx > 1 ? 'l' : 'm');
      r += ch;
    }
    rows.push(r);
  }
  return rows;
}

const sleeve = [               // wide ceremonial scholar sleeve with gilded rune cuff
  '..mml..',
  '.dmmll.',
  '.dmmllr',
  '.dmmllr',
  'ddmmllr',
  'ddmmllr',
  'ddmvllr',
  'ddmmllr',
  'ddmmmlr',
  'dddmmlr',
  'dddmmlr',
  '.ddgyGl',
  '.ddgWGl',
  '..ggyg.',
];
const hand = ['sSh', 'sSS', '.sS'];
const handOpen = ['sShh', 'sSSh', 'SSS.', '.s..'];

// Ornate rune-clasped grimoires (closed & open)
const book = (c, C) => [
  'g' + c + c + c + c + 'g',
  'G' + C + 'y' + 'W' + C + 'p',
  'g' + C + 'y' + 'y' + C + 'P',
  'G' + C + C + C + C + 'P',
  'g' + c + c + c + c + 'p',
];
const bookOpen = [
  'pPP.PPp',
  'pPvWvPp',
  'cpPdPpc',
  '.cgygc.',
];

// Natural kneeling transition & kneeling loop robes (matching librarian/rig.json pivots)
const robeM = [
  '.......dddmmmmlll.......',
  '......ddddgmvmGlll......',
  '.....dddddgmvmgllll.....',
  '.....dddddgmmmgllll.....',
  '.....dddddgWmmgllll.....',
  '.....dddddgmmmgllll.....',
  '.....dddddgmvmgllll.....',
  '......ddddgmmmGlll......',
  '......ggGGyyWyGGgg......',
  '......ggGGyyyyGGgg......',
  '.....dddddgmvmgllll.....',
  '.....dddddgmvmgllll.....',
  '....ddddddgmmmglllll....',
  '....ddddddgmvmglllll....',
  '....ddddddgmmmglllll....',
  '....ddddddgmWmglllllr...',
  '...dddddddgmmmglllllr...',
  '...dddddddgmvmglllllr...',
  '...dddddddmmmmlllllllr..',
  '...dddddddmWmmlllllllr..',
  '..ddddddddmmmmlllllllr..',
  '..ddddddddmvmmllllllllr.',
  '..ddddddddmmmmllllllllr.',
  '..ddddddddmWmmllllllllr.',
  '.dddddddddmmmmllllllllr.',
  '.dddddddddmvmmlllllllllr',
  '.dddddddddmmmmlllllllllr',
  '.dddddddddmmWmlllllllllr',
  'ddddddddddmmmmlllllllllr',
  'ddddddddddmvmmlllllllllr',
  'ddddddddddmmmmlllllllll.',
  'ddddddddddmmWmlllllllll.',
  'ddddddddddmmmmlllllllll.',
  'ddddddddddmvmmlllllllll.',
  'dddddddddddmmmlllllllll.',
  'dddddddddddmmmlllllllll.',
  'dddddddddddmmmlllllllll.',
  'dddddddddddmmmlllllllll.',
  'dddddddddddmmmlllllllll.',
  'dddddddddddmmmlllllllll.',
  'dddddddddddmmmlllllllll.',
  'dddddddddddmmmlllllllll.',
  '.gyGgyGgyGgyGgyGgyGgyGg.',
  '.gGgGgGgGgGgGgGgGgGgGgG.',
];
const robeK = [
  '.........ddmmmmlll..........',
  '........dddgmvmGlll.........',
  '.......ddddgmvmgllll........',
  '.......ddddgmmmgllll........',
  '.......ddddgWmmgllll........',
  '.......ddddgmmmgllll........',
  '.......ddddgmvmgllll........',
  '........dddgmmmGlll.........',
  '........ggGGyWyGgg..........',
  '........ggGGyyyygg..........',
  '.......ddddgmvmglll.........',
  '.......ddddgmmmglll.........',
  '......dddddgmvmgllll........',
  '......dddddmmmmllllll.......',
  '......dddddmWmmllllllllr....',
  '.....ddddddmmmmllllllllllr..',
  '.....ddddddmvmmlllllllllllr.',
  '....dddddddmmmmddddllllllllr',
  '....dddddddmmWmdddlllllllllr',
  '...ddddddddmmmmdd..llllllllr',
  '...ddddddddmvmmdd..dlllllllr',
  '..dddddddddmmmmd...dlllllllr',
  '..dddddddddmmWmd...dlllllllr',
  '.ddddddddddmmmmd...dlllllllr',
  '.ddddddddddmvmmd...dlllllllr',
  'dddddddddddmmmmd...dlllllllr',
  'dddddddddddmmmmd...dlllllll.',
  'ddddddddddddmmmd...gyGgyGgy.',
  'ddddddddddddmmmd....gGgGgGg.',
  'gyGgyGgyGgyGgyG.............',
  'gGgGgGgGgGgGgGg.............',
];

export default {
  head, robe: robe(0), robeB: robe(1), robeM, robeK, sleeve, hand, handOpen,
  bookR: book('c', 'C'), bookB: book('b', 'B'), bookG: book('g', 'G'), bookV: book('v', 'V'), bookOpen
};

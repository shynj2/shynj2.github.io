/* ==========================================================================
   THE KNIGHTS OF THE LORD (Round 9 §8.5) — a silent route for a few names typed at the gate.
   Add a name to KNIGHTS to make another knight. Names are compared in lower case, trimmed,
   with spaces and underscores read as dots ("Sir Matw", "sir_matw" and "SIR.MATW" are the same name).
   Nothing on screen ever lists them.
   A knight: G.flags.knight = true (kept in the save) · the armoured figure (art-src/rigs/knight) and its portrait ·
   the Crusader Sword in hand from the first step · a herald's greeting · the Keeper greets them by name (68-boss.js).
   ========================================================================== */
const KNIGHTS = ['sir.matw', 'vahid', 'resync'];
const Knight = {
  is(name) { return KNIGHTS.indexOf(String(name == null ? '' : name).trim().toLowerCase().replace(/[\s_]+/g, '.')) >= 0; },
  /** called when a new pilgrimage begins, after the flags were cleared */
  enlist(name) { if (this.is(name)) G.flags.knight = true; this.apply(); },
  /** the right body for this visitor */
  apply() {
    const sk = typeof Special !== 'undefined' ? Special.kind() : '';
    const body = (typeof Roster !== 'undefined') ? Roster.cur().rig : 'recruiter';
    const want = sk && Art.rigs[sk] ? sk : (G.flags && G.flags.knight && Art.rigs.knight ? 'knight' : (Art.rigs[body] ? body : 'recruiter'));
    if (!P.anim || P.anim.rigName !== want) P.anim = Anim(want);
  },
  /** the herald speaks once, right after the name is given */
  herald() {
    if (!G.flags.knight || G.flags.knightHeralded) return;
    G.flags.knightHeralded = true; save();
    let tries = 0;
    const speak = () => {                                  // waits for the zone card to leave, then speaks
      if (!G.flags.knight || ++tries > 60) return;
      if (G.scene !== 'world' || Dlg.on || G.fade > 0 || el('stage').classList.contains('titlecard')) { setTimeout(speak, 300); return; }
      Dlg.open([{ who: 'who.herald', cls: 'npc', lines: [['knight_herald.1', G.name], 'knight_herald.2', 'knight_herald.3'] }]);
    };
    setTimeout(speak, 1200);
  }
};
/* a knight's face in the dialogue box is cut from the knight rig */
const plainPortrait = getPortrait;
getPortrait = function (kind) {
  const R = kind === 'player' && G.flags && G.flags.knight && Art.rigs.knight;
  if (!R || !R.def.meta.portrait) return plainPortrait(kind);
  if (!PORTR['rig:knight']) {
    const c = mk(46, 46), g = c.getContext('2d'), d = R.def, p = d.meta.portrait, f = d.clips.idle.f[0][0];
    g.imageSmoothingEnabled = false;
    for (let y = 0; y < 23; y++) for (let x = 0; x < 23; x++) {
      const u = y / 22, b = PORTR_B4[(y & 3) * 4 + (x & 3)] / 16;
      g.fillStyle = palHex(u > b ? 'void1' : 'ember0');
      g.fillRect(x * 2, y * 2, 2, 2);
    }
    g.drawImage(R.cv[0][0], (f % d.cols) * d.fw + p[0], ((f / d.cols) | 0) * d.fh + p[1], p[2], p[3], 0, 0, 46, 46);
    g.fillStyle = palHex('void0');
    g.fillRect(0, 0, 46, 2); g.fillRect(0, 44, 46, 2); g.fillRect(0, 0, 2, 46); g.fillRect(44, 0, 2, 46);
    g.fillStyle = palHex('gold2');
    g.fillRect(2, 2, 42, 1); g.fillRect(2, 43, 42, 1); g.fillRect(2, 2, 1, 42); g.fillRect(43, 2, 1, 42);
    g.fillStyle = palHex('gold4');
    for (const [cx, cy] of [[2, 2], [42, 2], [2, 42], [42, 42]]) g.fillRect(cx, cy, 2, 2);
    PORTR['rig:knight'] = c;
  }
  return PORTR['rig:knight'];
};

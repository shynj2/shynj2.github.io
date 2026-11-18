/* ==========================================================================
   67 · THE ROSTER — who walks into Veyrath (owner request, 18 Nov).

   A character select before the name is spoken. Every card is a body the game can
   actually play (its rig exists in art-src/rigs), its own numbers, and one line of
   who it is. The angel (Meiko) is deliberately NOT in the list: her pilgrimage is a
   different story (67-special.js) and the owner asked that she never be offered here.

   How a body changes play:
     hp    courage (determination hearts, 5 for the Recruiter)
     run   legs (px/s, PHYS.run is 155)          dmg   every blow × this
     stam  stamina pool                          stamG what stamina comes back per second
     reach every melee reach × this              parry the perfect-guard window, seconds
     perk  id of a rule applied in this file
   `shynJ2` is the owner's own name and is meant to be absurd: it walks faster than
   any enemy runs, hits for four times a normal blow, cannot be staggered out of the
   air, heals itself, and its perfect guard erases what it guards against.
   ========================================================================== */
const ROSTER = [
  {
    id: 'recruiter', rig: 'recruiter', name: 'rc.recruiter.name', sub: 'rc.recruiter.sub', line: 'rc.recruiter.line',
    hp: 5, run: 1, dmg: 1, stam: 1, stamG: 1, reach: 1, parry: 1, parryDmg: 1,
    bars: [3, 3, 3, 3], perk: '', start: 'katana'
  },
  {
    id: 'knight', rig: 'knight', name: 'rc.knight.name', sub: 'rc.knight.sub', line: 'rc.knight.line',
    hp: 6, run: .92, dmg: 1.15, stam: 1.1, stamG: 1, reach: 1, parry: 1.1, parryDmg: 1.4,
    bars: [4, 2, 3, 4], perk: 'plate', start: 'crusader'
  },
  {
    id: 'miku', rig: 'miku', name: 'rc.miku.name', sub: 'rc.miku.sub', line: 'rc.miku.line',
    hp: 4, run: 1.05, dmg: .95, stam: 1.05, stamG: 1.15, reach: 1.05, parry: 1.1, parryDmg: 1.2,
    bars: [3, 4, 4, 2], perk: 'song', start: ''
  },
  {
    id: 'resync', rig: 'resync', name: 'rc.resync.name', sub: 'rc.resync.sub', line: 'rc.resync.line',
    hp: 5, run: 1, dmg: .9, stam: 1.2, stamG: 1.3, reach: 1, parry: 1, parryDmg: 1,
    bars: [2, 3, 3, 3], perk: 'tinker', start: ''
  },
  {
    id: 'librarian', rig: 'librarian', name: 'rc.librarian.name', sub: 'rc.librarian.sub', line: 'rc.librarian.line',
    hp: 5, run: .9, dmg: 1, stam: 1.1, stamG: 1.1, reach: 1.1, parry: 1.15, parryDmg: 1.2,
    bars: [3, 2, 4, 3], perk: 'read', start: ''
  },
  {
    id: 'shynj2', rig: 'shynj2', name: 'rc.shynj2.name', sub: 'rc.shynj2.sub', line: 'rc.shynj2.line',
    hp: 12, run: 1.85, dmg: 4, stam: 2.5, stamG: 2.6, reach: 1.5, parry: 2.6, parryDmg: 3.2,
    bars: [5, 5, 5, 5], perk: 'architect', start: 'katana', op: true
  }
];

const Roster = {
  pick: null,                 // the chosen entry (an object of ROSTER)
  open: false,
  entry(id) { return ROSTER.find((r) => r.id === id) || ROSTER[0]; },
  cur() { return this.pick || this.entry((G.flags && G.flags.body) || 'recruiter'); },
  /** the numbers in play (fallbacks keep old saves working) */
  hp() { return this.cur().hp || 5; },
  op() { return !!this.cur().op; },

  /** warm the rigs before the visitor is asked to choose (the intro calls this while the first sentence plays) */
  warm() { if (typeof Art !== 'undefined' && Art.need && (!Art.rigs || !Art.rigs.recruiter)) Art.need(ZONES.workshop).catch(() => {}); },

  /* ---------------- the card art: a portrait cut from the rig ---------------- */
  _por: {},
  portrait(r) {
    if (this._por[r.id]) return this._por[r.id];
    const R = Art.rigs[r.rig]; if (!R || !R.def.meta.portrait) return '';
    const d = R.def, p = d.meta.portrait, f = d.clips.idle.f[0][0];
    const c = mk(p[2] * 2, p[3] * 2), g = c.getContext('2d');
    g.imageSmoothingEnabled = false;
    g.drawImage(R.cv[0][0], (f % d.cols) * d.fw + p[0], ((f / d.cols) | 0) * d.fh + p[1], p[2], p[3], 0, 0, p[2] * 2, p[3] * 2);
    return (this._por[r.id] = c.toDataURL());
  },
  /** a whole body in idle, for the tall strip beside a card */
  _body: {},
  body(r) {
    if (this._body[r.id]) return this._body[r.id];
    const R = Art.rigs[r.rig]; if (!R) return '';
    const c = mk(R.def.fw, R.def.fh), g = c.getContext('2d'), f = R.def.clips.idle.f[0][0];
    g.drawImage(R.cv[0][0], (f % R.def.cols) * R.def.fw, ((f / R.def.cols) | 0) * R.def.fh, R.def.fw, R.def.fh, 0, 0, R.def.fw, R.def.fh);
    return (this._body[r.id] = c.toDataURL());
  },

  /* ---------------- the screen ---------------- */
  show(after, back) {
    // the cards need the rigs decoded: on a cold boot they are not in yet, so decode them and come back
    if (!Art.rigs || !Art.rigs.recruiter) {
      const want = { workshop: 'workshop' };
      const go = () => { Art.rigsReady = true; this.show(after, back); };
      if (Art.need) Art.need(ZONES.workshop).then(go).catch(() => { if (after) after(); });
      else if (after) after();
      return;
    }
    let d = el('roster');
    if (!d) {
      d = document.createElement('div'); d.id = 'roster'; d.className = 'ov'; d.setAttribute('data-noi18n', '');
      el('stage').appendChild(d);
    }
    this.open = true; this.back = back || null;
    const cur = this.pick || this.entry((G.flags && G.flags.body) || 'recruiter');
    d.innerHTML =
      '<div class="rs">' +
        '<div class="rs-h"><b data-i18n="rc.title"></b><i data-i18n="rc.lead"></i></div>' +
        '<div class="rs-grid">' +
          ROSTER.map((r) => {
            const on = r.id === cur.id;
            return '<button type="button" class="rs-card' + (on ? ' on' : '') + (r.op ? ' op' : '') + '" data-rc="' + r.id + '">' +
              '<span class="rs-bod" style="background-image:url(' + this.body(r) + ')"></span>' +
              '<span class="rs-por" style="background-image:url(' + this.portrait(r) + ')"></span>' +
              '<span class="rs-n">' + tr(r.name) + '</span>' +
              '<span class="rs-s">' + tr(r.sub) + '</span>' +
              (r.op ? '<span class="rs-tag">' + tr('rc.op') + '</span>' : '') +
              '<span class="rs-bars">' + r.bars.map((v) => '<em>' + '<u class="on"></u>'.repeat(v) + '<u></u>'.repeat(5 - v) + '</em>').join('') + '</span>' +
            '</button>';
          }).join('') +
        '</div>' +
        '<div class="rs-foot"><span class="rs-line">' + tr(cur.line) + '</span>' +
          '<button type="button" class="btn pri" id="rsGo" data-i18n="rc.go"></button>' +
          (this.back ? '<button type="button" class="btn" id="rsBack" data-i18n="rc.back"></button>' : '') +
        '</div>' +
      '</div>';
    d.classList.add('on');
    I18N.apply(d);
    Sound.open();
    d.querySelectorAll('[data-rc]').forEach((b) => {
      b.addEventListener('click', () => {
        this.pick = this.entry(b.dataset.rc);
        d.querySelectorAll('[data-rc]').forEach((n) => n.classList.toggle('on', n === b));
        const line = d.querySelector('.rs-line'); if (line) line.textContent = tr(this.pick.line);
        Sound.key();
      });
    });
    const go = el('rsGo');
    if (go) go.addEventListener('click', () => { this.confirm(); d.classList.remove('on'); this.open = false; if (after) after(); });
    const bk = el('rsBack');
    if (bk) bk.addEventListener('click', () => { d.classList.remove('on'); this.open = false; if (this.back) this.back(); });
  },
  hide() { const d = el('roster'); if (d) d.classList.remove('on'); this.open = false; },

  /** apply the chosen body to the run (called before a new pilgrimage begins) */
  confirm() {
    const r = this.cur();
    G.flags.body = r.id;
    Roster.apply(r);
    if (typeof Special !== 'undefined') Special.sync();   // the portraits, the Vox-Lance, the Shyn dialogue
    save();
  },
  /** the numbers, stamped on the systems that already own them */
  apply(r) {
    r = r || this.cur();
    PHYS.run = 155 * (r.run || 1);
    Combat.STAM = Math.round(100 * (r.stam || 1));
    Combat.stam = Combat.STAM;
    G.flags.body = r.id;
    if (G.flags.bodyNew !== r.id) { G.flags.bodyNew = r.id; G.det = this.hp(); }   // a new body starts with its own hearts
    G.det = Math.min(G.det, this.hp());
    if (typeof Knight !== 'undefined') Knight.apply();
    hudSync();
  },
  /** called from boot/enterWorld: restore the body the save remembers */
  restore() {
    const r = this.entry((G.flags && G.flags.body) || 'recruiter');
    this.pick = r; this.apply(r);
  },

  /* ---------------- the rules the roster can bend ---------------- */
  dmg() { return this.cur().dmg || 1; },
  reach() { return this.cur().reach || 1; },
  parryWin() { return this.cur().parry || 1; },
  stamRegen() { return this.cur().stamG || 1; },
  /** plate: the knight loses 1 less from the first blow of every count? no — plate simply turns a fifth of all harm */
  hurt(dmg) {
    const r = this.cur();
    if (r.perk === 'plate') return Math.random() < .22 ? 0 : dmg;
    return dmg;
  },
  /** after a kill: the architect (shynJ2) swallows a shard and mends a heart; the songbird finds stamina */
  onKill() {
    const r = this.cur();
    if (r.perk === 'architect') { if (G.det < this.hp()) setDet(G.det + 1); Combat.stam = Combat.STAM; }
    else if (r.perk === 'song') Combat.stam = Math.min(Combat.STAM, Combat.stam + 18);
    else if (r.perk === 'tinker') Combat.stam = Math.min(Combat.STAM, Combat.stam + 8);
  },
  /** read: the librarian earns double from every inscription */
  reading() { return this.cur().perk === 'read' ? 2 : 1; }
};

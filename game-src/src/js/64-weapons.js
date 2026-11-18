/* ==========================================================================
   WEAPONS (Round 9 §8.1) — the data, the armoury and how a weapon is drawn in the hand.

   To tune a weapon, change its numbers below; `node tools/balance.mjs` prints DPS and time-to-kill.
   Every move is one object:
     dmg    damage            poise  how much it shakes his stance      stam   stamina it costs
     wind   seconds before it lands · act  seconds it is live · rec  seconds to recover
     reach  pixels in front of the Recruiter (melee)           clip   the body animation (rigs/recruiter)
     lunge  speed forward while winding up · dash  speed forward while live · back  speed backward while live
     inv    true = cannot be hit while live                    hits   lands this many times
     bleed  stacks of bleeding per hit                         grab   a throw: only lands if he is within reach
     bolt   { speed, range, pierce }  a rune bolt              wave   { speed, range }  a wave along the floor
     glyph  { delay, r }  a mark on the floor that bursts      cross  { speed, range }  the cross-shaped wave
   Weapon perks:  punish (damage x this in the moment after his attack)   parry (seconds of the perfect-guard window)
                  parryDmg (damage dealt by a perfect guard)   blockCost (stamina factor)   riposte (damage answered from guard)
   ========================================================================== */
/* WEAPONS:BEGIN */
const WEAPONS = {
  katana: {
    zone: 'workshop', back: 125, punish: 1.5, parry: .18,
    light: [
      { dmg: 7, poise: 6, stam: 9, wind: .07, act: .09, rec: .13, reach: 38, clip: 'atk1' },
      { dmg: 7, poise: 6, stam: 9, wind: .07, act: .09, rec: .13, reach: 38, clip: 'atk2' },
      { dmg: 11, poise: 9, stam: 11, wind: .09, act: .10, rec: .20, reach: 44, clip: 'atk3', lunge: 90 }
    ],
    heavy: { dmg: 19, poise: 14, stam: 24, wind: .20, act: .12, rec: .26, reach: 62, clip: 'atk3', dash: 300 },
    special: { charge: .45, dmg: 34, poise: 24, stam: 40, wind: .08, act: .14, rec: .34, reach: 96, clip: 'atk1', dash: 620, inv: true }
  },
  daggers: {
    zone: 'forest', back: 100, parry: .16,
    light: [
      { dmg: 4, poise: 2, stam: 5, wind: .04, act: .06, rec: .07, reach: 26, clip: 'atk1', bleed: 1 },
      { dmg: 4, poise: 2, stam: 5, wind: .04, act: .06, rec: .07, reach: 26, clip: 'atk2', bleed: 1 },
      { dmg: 4, poise: 2, stam: 5, wind: .04, act: .06, rec: .07, reach: 26, clip: 'atk1', bleed: 1 },
      { dmg: 4, poise: 2, stam: 5, wind: .04, act: .06, rec: .07, reach: 26, clip: 'atk2', bleed: 1 },
      { dmg: 6, poise: 4, stam: 6, wind: .05, act: .07, rec: .16, reach: 30, clip: 'atk3', bleed: 1, lunge: 60 }
    ],
    heavy: { dmg: 0, poise: 0, stam: 16, wind: .02, act: .20, rec: .08, reach: 0, clip: 'dodge', back: 330, inv: true },
    special: { charge: .40, dmg: 4, poise: 3, stam: 36, wind: .08, act: .48, rec: .26, reach: 32, clip: 'atk1', dash: 120, hits: 7, bleed: 1 }
  },
  crusader: {
    zone: 'cathedral', back: 120, parry: .20, blockCost: .5, riposte: 12,
    light: [
      { dmg: 9, poise: 9, stam: 11, wind: .11, act: .10, rec: .17, reach: 42, clip: 'atk1' },
      { dmg: 9, poise: 9, stam: 11, wind: .11, act: .10, rec: .17, reach: 42, clip: 'atk2' },
      { dmg: 14, poise: 13, stam: 13, wind: .13, act: .11, rec: .24, reach: 46, clip: 'atk1', lunge: 50 }
    ],
    heavy: { dmg: 25, poise: 30, stam: 28, wind: .32, act: .12, rec: .34, reach: 46, clip: 'heavy' },
    special: { charge: .50, dmg: 28, poise: 22, stam: 42, wind: .22, act: .10, rec: .36, reach: 0, clip: 'special', cross: { speed: 300, range: 250 } }
  },
  hammer: {
    zone: 'catacombs', back: -110, parry: .14,
    light: [
      { dmg: 15, poise: 22, stam: 17, wind: .24, act: .11, rec: .28, reach: 42, clip: 'atk1' },
      { dmg: 19, poise: 28, stam: 19, wind: .26, act: .11, rec: .36, reach: 44, clip: 'heavy' }
    ],
    heavy: { dmg: 30, poise: 46, stam: 34, wind: .42, act: .12, rec: .44, reach: 46, clip: 'heavy', breaker: true, wave: { speed: 260, range: 140, dmg: 12 } },
    special: { charge: .60, dmg: 44, poise: 100, stam: 50, wind: .30, act: .14, rec: .55, reach: 60, clip: 'heavy', breaker: true, quake: true }
  },
  staff: {
    zone: 'repository', back: -105, parry: .14,
    light: [
      { dmg: 8, poise: 5, stam: 12, wind: .22, act: .08, rec: .22, reach: 0, clip: 'special', bolt: { speed: 330, range: 340 } }
    ],
    heavy: { dmg: 17, poise: 12, stam: 26, wind: .38, act: .08, rec: .30, reach: 0, clip: 'special', bolt: { speed: 420, range: 420, pierce: true } },
    special: { charge: .55, dmg: 32, poise: 26, stam: 44, wind: .16, act: .08, rec: .30, reach: 0, clip: 'special', glyph: { delay: .7, r: 46 } }
  },
  gauntlets: {
    zone: 'arena', back: 0, parry: .30, parryDmg: 28, blockCost: .7,
    light: [
      { dmg: 6, poise: 7, stam: 7, wind: .06, act: .07, rec: .10, reach: 24, clip: 'atk3' },
      { dmg: 6, poise: 7, stam: 7, wind: .06, act: .07, rec: .10, reach: 24, clip: 'atk1' },
      { dmg: 10, poise: 12, stam: 9, wind: .08, act: .08, rec: .18, reach: 26, clip: 'atk3', lunge: 70 }
    ],
    heavy: { dmg: 17, poise: 34, stam: 24, wind: .16, act: .10, rec: .30, reach: 30, clip: 'atk2', grab: true },
    special: { charge: .40, dmg: 0, poise: 0, stam: 30, wind: .02, act: .70, rec: .12, reach: 0, clip: 'guard', stance: true }
  },
  microphone: {
    zone: 'workshop', back: -118, parry: .24, parryDmg: 14,
    light: [
      { dmg: 11, poise: 9,  stam: 10, wind: .10, act: .09, rec: .14, reach: 42, clip: 'atk1', mikuNote: 0 },
      { dmg: 12, poise: 11, stam: 11, wind: .10, act: .09, rec: .14, reach: 44, clip: 'atk2', mikuNote: 1 },
      { dmg: 16, poise: 18, stam: 14, wind: .12, act: .10, rec: .20, reach: 50, clip: 'atk3', lunge: 54, mikuChord: true }
    ],
    heavy:   { dmg: 23, poise: 28, stam: 24, wind: .20, act: .11, rec: .25, reach: 54, clip: 'heavy', lunge: 42, sonicWave: true },
    special: { charge: .46, dmg: 35, poise: 36, stam: 38, wind: .14, act: .12, rec: .26, reach: 0, clip: 'special', glyph: { delay: .52, r: 50, encore: true } }
  }
};
/* rewrites by RE-sync (66-resync.js): a weapon's level 0..UP_MAX, each level +UP_GAIN damage, bought with points */
const UP_MAX = 3, UP_COST = [40, 60, 80], UP_GAIN = .2;
const WEAPON_ORDER = ['katana', 'daggers', 'crusader', 'hammer', 'staff', 'gauntlets'];
const ZONE_ORDER = ['workshop', 'forest', 'cathedral', 'catacombs', 'repository', 'arena', 'room499'];
/** the four bars of the armoury card, 1..5, worked out from the same numbers the fight uses */
function weaponBars(id) {
  const raw = (k) => {
    const w = WEAPONS[k], L = w.light;
    const time = L.reduce((a, m) => a + m.wind + m.act + m.rec, 0), dmg = L.reduce((a, m) => a + m.dmg * (m.hits || 1), 0), poise = L.reduce((a, m) => a + m.poise, 0);
    return [dmg / time, L.length / time, Math.max(...L.map((m) => m.reach || (m.bolt ? m.bolt.range / 3 : 0))), poise / time];
  };
  const all = WEAPON_ORDER.map(raw), mine = raw(id);
  return mine.map((v, i) => { const lo = Math.min(...all.map((a) => a[i])), hi = Math.max(...all.map((a) => a[i])); return 1 + Math.round(4 * (v - lo) / (hi - lo || 1)); });
}
/* WEAPONS:END */

/* ---------------- what the Recruiter owns and carries ---------------- */
const Arsenal = {
  owned() { if (!Array.isArray(G.flags.wp)) G.flags.wp = []; return G.flags.wp; },
  has(id) { return this.owned().indexOf(id) >= 0; },
  level(id) { const u = G.flags.up; return u && typeof u === 'object' ? clamp(u[id] | 0, 0, UP_MAX) : 0; },
  multAt(lv) { return 1 + UP_GAIN * lv; },
  mult(id) { return this.multAt(this.level(id)); },
  /** [in hand, at the back] — always two owned weapons when two are owned */
  eq() {
    const own = this.owned(); let e = Array.isArray(G.flags.eq) ? G.flags.eq.slice(0, 2) : [];
    e = e.filter((id, i) => own.indexOf(id) >= 0 && e.indexOf(id) === i);
    for (let i = 0; e.length < 2 && i < own.length; i++) if (e.indexOf(own[i]) < 0) e.push(own[i]);
    G.flags.eq = e; return e;
  },
  cur() {
    if (typeof Special !== 'undefined' && Special.kind() === 'miku') return 'microphone';
    const e = this.eq(); return e[(G.flags.slot | 0) % Math.max(1, e.length)] || 'katana';
  },
  other() {
    if (typeof Special !== 'undefined' && Special.kind()) return null;
    const e = this.eq(); return e.length > 1 ? e[((G.flags.slot | 0) + 1) % 2] : null;
  },
  swap() { if (this.eq().length < 2) return false; G.flags.slot = ((G.flags.slot | 0) + 1) % 2; this.hud(); save(); return true; },
  set(slot, id) {
    if (!this.has(id)) return;
    const e = this.eq(), j = e.indexOf(id);
    if (j >= 0 && j !== slot && e[slot]) e[j] = e[slot];      // already carried in the other hand: the two change places
    e[slot] = id; G.flags.eq = e.filter(Boolean); this.hud(); save();
  },
  grant(id, quiet) {
    if (!WEAPONS[id] || this.has(id)) return false;
    this.owned().push(id); this.eq();
    if (!quiet) { clearTimeout(this._t); this._t = setTimeout(() => { if (G.scene === 'world') { toast('✦', 'ui.wp.found', 'wp.' + id + '.name', 5200); Sound.open(); } }, 5600); }
    return true;
  },
  /** entering a zone hands over its weapon — and every earlier one, so an old save is never left unarmed */
  sync(zone) {
    const k = ZONE_ORDER.indexOf(zone); let fresh = null;
    // the body chosen on the roster carries its own blade from the first step (66-roster.js)
    const rb = (typeof Roster !== 'undefined') && Roster.cur();
    if (rb && rb.start && !G.flags.bodyEq) { G.flags.bodyEq = true; this.grant(rb.start, true); if (!G.flags.eq) G.flags.eq = [rb.start]; }
    if (G.flags.knight) { this.grant('crusader', true); if (!G.flags.knightEq) { G.flags.knightEq = true; this.grant('katana', true); G.flags.eq = ['crusader', 'katana']; G.flags.slot = 0; } }
    WEAPON_ORDER.forEach((id) => { if (ZONE_ORDER.indexOf(WEAPONS[id].zone) <= k && this.grant(id, true)) fresh = id; });
    if (fresh) { this.owned().splice(this.owned().indexOf(fresh), 1); this.grant(fresh); }      // announce only the newest
    this.eq(); this.hud();
  },

  /* ---- icons: cut once from the kit atlas ---- */
  _ic: {},
  icon(id) {
    if (this._ic[id]) return this._ic[id];
    if (!Art.kit) return '';
    const r = sprRect('wi_' + id, 0); if (!r) return '';
    const c = mk(r[2], r[3]); c.getContext('2d').drawImage(Art.kit.col, r[0], r[1], r[2], r[3], 0, 0, r[2], r[3]);
    return (this._ic[id] = c.toDataURL());
  },
  /** the small weapon badge in the fight HUD (and on the swap button) */
  hud() {
    const b = el('wpNow'); if (!b) return;
    const sk = typeof Special !== 'undefined' ? Special.kind() : '';
    if (sk === 'meiko') { b.innerHTML = ''; b.style.display = 'none'; return; }
    b.style.display = '';
    const id = this.cur(), o = this.other();
    if (sk === 'miku') {
      const ic = this.icon('microphone');
      b.innerHTML = (ic ? '<img alt="" src="' + ic + '">' : '') + '<span>' + tr('wp.microphone.name') + '</span>';
    } else {
      b.innerHTML = '<img alt="" src="' + this.icon(id) + '"><span>' + tr('wp.' + id + '.name') + (this.level(id) ? ' <b dir="ltr">+' + this.level(id) + '</b>' : '') + '</span>';
    }
    const bag = el('bagBtn'); if (bag) bag.classList.toggle('on', sk !== 'meiko' && (sk === 'miku' || this.owned().length > 0));
    const sw = document.querySelector('#touch .cmb [data-cb="swap"]');
    if (sw) sw.innerHTML = o ? '<img alt="" src="' + this.icon(o) + '">' : '';
  },
  syncUI() { this.hud(); },

  /* ---- the armoury (pause menu) ---- */
  open() {
    let a = el('armoury');
    if (!a) { a = document.createElement('div'); a.id = 'armoury'; a.className = 'ov'; a.setAttribute('data-noi18n', ''); el('stage').appendChild(a); }
    this.render(); a.classList.add('on'); Sound.open();
  },
  close() { const a = el('armoury'); if (a) a.classList.remove('on'); },
  isOpen() { const a = el('armoury'); return !!a && a.classList.contains('on'); },
  render() {
    const a = el('armoury'); if (!a) return;
    const e = this.eq(), labels = ['ui.stat.dmg', 'ui.stat.speed', 'ui.stat.reach', 'ui.stat.poise'];
    let h = '<div class="arm"><h2>' + tr('ui.armoury') + '</h2><p class="lead">' + tr('ui.armoury.lead') + '</p><div class="arm-grid">';
    if (typeof Special !== 'undefined' && Special.kind() === 'miku') {
      const mbars = [5, 4, 5, 4];
      h += '<div class="wcard eq" data-w="microphone"><img alt="" src="' + this.icon('microphone') + '"><div class="wtx"><b>' + tr('wp.microphone.name') + '</b><p>' + tr('wp.microphone.desc').replace(/\n/g, '<br>') + '</p><div class="bars">' +
        mbars.map((v, i) => '<span>' + tr(labels[i]) + '<i>' + '<u class="on"></u>'.repeat(v) + '<u></u>'.repeat(5 - v) + '</i></span>').join('') + '</div></div></div>';
    } else WEAPON_ORDER.forEach((id) => {
      const own = this.has(id), slot = e.indexOf(id), bars = weaponBars(id);
      h += '<div class="wcard' + (own ? '' : ' locked') + (slot >= 0 ? ' eq' : '') + '" data-w="' + id + '">' +
        '<img alt="" src="' + this.icon(id) + '"><div class="wtx"><b>' + tr('wp.' + id + '.name') + (this.level(id) ? ' <small>' + tr('ui.wp.level', trNum(this.level(id))) + '</small>' : '') + '</b>' +
        (own ? '<p>' + tr('wp.' + id + '.desc').replace(/\n/g, '<br>') + '</p><div class="bars">' +
          bars.map((v, i) => '<span>' + tr(labels[i]) + '<i>' + '<u class="on"></u>'.repeat(v) + '<u></u>'.repeat(5 - v) + '</i></span>').join('') + '</div>' +
          '<div class="slots"><button class="btn' + (slot === 0 ? ' on' : '') + '" data-slot="0">' + tr('ui.slot.main') + '</button>' +
          '<button class="btn' + (slot === 1 ? ' on' : '') + '" data-slot="1">' + tr('ui.slot.off') + '</button></div>'
          : '<p class="no">' + tr('ui.wp.locked') + '</p>') + '</div></div>';
    });
    h += '</div><button class="btn back" data-arm="close">' + tr('ui.pause_continue') + '</button></div>';
    a.innerHTML = h;
    a.querySelectorAll('[data-slot]').forEach((b) => { b.onclick = (ev) => { ev.stopPropagation(); const s = +b.dataset.slot; G.flags.slot = 0; this.set(s, b.closest('.wcard').dataset.w); Sound.rune(); this.render(); }; });
    a.querySelector('[data-arm="close"]').onclick = (ev) => { ev.stopPropagation(); this.close(); closePause(); };
  },
  /** adds the Armoury button and the calm-effects switch to the pause menu (once), and keeps their text current */
  pauseSync() {
    const menu = document.querySelector('#pause .menu'); if (!menu) return;
    if (!menu.querySelector('[data-act="armoury"]')) {
      const b = document.createElement('button'); b.className = 'btn'; b.dataset.act = 'armoury'; b.dataset.i18n = 'ui.armoury';
      b.onclick = (ev) => { ev.stopPropagation(); this.open(); };
      const c = document.createElement('button'); c.className = 'btn opt'; c.dataset.act = 'calm';
      c.onclick = (ev) => { ev.stopPropagation(); G.flags.calm = !Calm(); save(); this.pauseSync(); Sound.open(); };
      menu.insertBefore(c, menu.firstChild); menu.insertBefore(b, menu.firstChild);
    }
    menu.querySelector('[data-act="armoury"]').textContent = tr('ui.armoury');
    menu.querySelector('[data-act="calm"]').textContent = tr('ui.opt.calm') + ': ' + tr(Calm() ? 'ui.opt.on' : 'ui.opt.off');
  },

  /* ---- drawing: the weapon follows the fist (hand anchors are baked with the rig, tools/lib/rig.mjs) ---- */
  drawnOut() {
    const sk = typeof Special !== 'undefined' ? Special.kind() : '';
    const holdDur = sk === 'miku' ? 3.2 : 1.4;
    return G.scene === 'boss' || G.zone === 'dojo' || (typeof BOSS !== 'undefined' && BOSS.active) || Combat.act !== '' || G.time - (Combat.used == null ? -9 : Combat.used) < holdDur;
  },
  draw(g, fx, fy, behind, emi) {
    const sk = typeof Special !== 'undefined' ? Special.kind() : '';
    if (sk === 'meiko') return;
    if (sk !== 'miku' && !this.owned().length) return;
    if (!P.anim || !P.anim.clip || P.act === 'materialize') return;
    const id = this.cur(), w = WEAPONS[id]; if (!w) return;
    const out = this.drawnOut(), face = P.face;
    if (!out) {                                             // carried: across the back, drawn behind the body
      if (!behind || id === 'gauntlets') return;
      const fr = P.anim.clip.f[P.anim.i], bob = fr && fr[3] ? Math.round((fr[3][1] + 20) / 6) : 0;
      this.blit(g, id, fx - face * 3, fy - 25 + bob, w.back, face, emi);
      return;
    }
    if (behind) return;
    const fr = P.anim.clip.f[P.anim.i]; if (!fr || !fr[3]) return;
    const hx = fx + face * fr[3][0], hy = fy + fr[3][1], ang = fr[3][2] + (Combat.act === 'charge' ? -70 : 0);
    this.blit(g, id, hx, hy, ang, face, emi);
    if (id === 'daggers') this.blit(g, id, hx - face * 7, hy + 2, ang + 150, face, emi);
    if (id === 'gauntlets') this.blit(g, id, hx - face * 8, hy + 1, ang, face, emi);
  },
  /** angle in degrees for a figure facing right (0 forward, 90 down); mirrored for the other side */
  blit(g, id, x, y, deg, face, emi) {
    let a = face > 0 ? deg : 180 - deg; a = ((Math.round(a / 30) % 12) + 12) % 12;
    if (emi) sprE(g, 'w_' + id, Math.round(x) - 36, Math.round(y) - 36, a);
    else spr(g, 'w_' + id, Math.round(x) - 36, Math.round(y) - 36, a);
  }
};

/** calm effects: no strobing, a quarter of the shake. On by default on phones and with prefers-reduced-motion. */
function Calm() { return G.flags.calm != null ? !!G.flags.calm : REDUCED; }

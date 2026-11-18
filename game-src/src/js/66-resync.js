/* ==========================================================================
   RE-sync — the mender in the machine halls (owner request after the Round 9 §8 gate).

   • After the FIRST defeat by the Keeper the visitor does not return to the fight: they wake in the machine halls,
     beside RE-sync, who offers to rewrite their weapon for points. From then on he stays there, and the Attempt screen
     has a "Visit RE-sync" button (key R).
   • A rewrite raises the weapon's level (G.flags.up[id], 0..UP_MAX). Each level adds UP_GAIN to its damage
     (Arsenal.mult in 64-weapons.js; applied in Boss.take). Prices: UP_COST. The points leave the score for good.
   • The editor the visitor watches shows the weapon's real numbers (WEAPONS in 64-weapons.js) and types the new ones.
   The backpack button (weapons screen) is at the bottom of this file.
   ========================================================================== */
const Resync = {
  prop() { return ZONES.catacombs.props.find((p) => p.id === 'resync'); },
  cost(id) { const lv = Arsenal.level(id); return lv >= UP_MAX ? 0 : UP_COST[lv]; },

  /** from the Attempt screen: wake beside him */
  rescue() {
    const first = !G.flags.resync;
    G.flags.resync = true;
    el('attempt').classList.remove('on'); el('stage').classList.remove('void');
    Fight.end(); BOSS.cp = 0; BOSS.pose = 'idle'; BossMusic.stop();
    setDet((typeof Roster !== 'undefined' ? Roster.hp() : 5), true); G.scene = 'world'; G.fadeDir = 0; save();
    Art.need(ZONES.catacombs).then(() => fadeTo(() => {
      loadZone('catacombs', 'left');
      const p = this.prop();
      P.x = p.x - 44 - P.w / 2; P.y = World.groundNear(P.x + P.w / 2) - P.h; P.vx = P.vy = 0; P.face = 1; P.safeX = P.x; P.safeY = P.y; camSnap();
      P.act = 'materialize'; if (P.anim) animPlay(P.anim, 'materialize', true);
      clearTimeout(showZoneCard._t); el('zonecard').classList.remove('on'); el('stage').classList.remove('titlecard');      // no title card: he is already speaking
      let tries = 0;
      const speak = () => { if (G.zone !== 'catacombs' || ++tries > 40) return; if (G.scene !== 'world' || Dlg.on || G.fade > 0) { setTimeout(speak, 200); return; } this.talk(first); };
      setTimeout(speak, 1100);
    }));
  },
  talk(first) {
    if (G.flags.mercy) { this.farewell(); return; }
    G._near = { kind: 'npc', p: this.prop() };
    Dlg.open([{ who: 'who.resync', cls: 'npc', lines: first ? ['resync_wake.1', 'resync_wake.2', 'resync_wake.3', 'resync_wake.4', 'resync_wake.5'] : ['resync_again.1'] }], () => this.menu());
  },
  /* ---------------- after the Keeper is beaten: he goes back to the code and leaves a white flower ---------------- */
  farewell() {
    const p = this.prop(); G._near = { kind: 'npc', p };
    Dlg.open([{ who: 'who.resync', cls: 'npc', lines: ['resync_bye.1', 'resync_bye.2', 'resync_bye.3'] }], () => {
      G.scene = 'world'; this.leaving = G.time; Sound.blink(); showPrompt(null);
      setTimeout(() => { G.flags.resyncGone = true; this.leaving = 0; this.bloom = G.time; if (p.x != null && G.zone === 'catacombs') { World.addLight(p.x, p.gy - 12, 70, 'cold', true); burst(p.x, p.gy - 14, 'rgba(255,240,200,', 18, 80); } Sound.rune(); save(); }, 1500);
    });
  },
  /** draws him while he dissolves into code, and the flower afterwards; false = draw him as usual */
  drawProp(g, p, cx, cy, t) {
    const x = Math.round(p.x) - cx, gy = Math.round(p.gy) - cy;
    if (this.leaving) {
      const k = clamp((G.time - this.leaving) / 1.5, 0, 1);
      if (p.anim && (((t * 20) | 0) & 3) / 3 >= k) drawRig(g, p.anim, x, gy, P.x + P.w / 2 < p.x ? -1 : 1, lightSide);      // he flickers out
      g.fillStyle = '#7dffb0';
      for (let i = 0; i < 14; i++) { const hx = ((i * 37) % 19) - 9, sp = 20 + (i * 13) % 17, yy = (G.time - this.leaving) * sp + i * 5; if (yy > 46 * k + 6) continue; g.fillRect(x + hx, gy - 2 - Math.round(yy % 48), 1, 2 + (i & 1)); }      // code rising out of him
      this.flower(g, x, gy, t, k * .6);
      return true;
    }
    if (!G.flags.resyncGone) return false;
    this.flower(g, x, gy, t, clamp(.6 + (G.time - (this.bloom || -9)) * .5, .6, 1));
    return true;
  },
  /** the white flower, 22 px tall; `grow` 0..1 (stem first, the bloom last). `glow` = the pass that is drawn unlit, over the dark */
  flower(g, x, gy, t, grow, glow) {
    const sway = ((t * .8) | 0) & 1, hgt = Math.round(15 * Math.min(1, grow / .7)), bx = x + sway, by = gy - 19;
    if (!glow) {
      g.fillStyle = PIX.moss3; g.fillRect(x, gy - hgt, 1, hgt);
      if (hgt > 5) { g.fillStyle = PIX.moss1; g.fillRect(x - 3, gy - 5, 3, 1); g.fillRect(x - 2, gy - 6, 2, 1); }
      if (hgt > 9) { g.fillStyle = PIX.moss3; g.fillRect(x + 1, gy - 9, 3, 1); g.fillRect(x + 1, gy - 10, 2, 1); }
    }
    if (grow < .75) return;
    const open = grow >= 1;
    if (glow) {                                                                                   // a halo of single points of light: two rings, breathing
      const r = 9 + (((t * 1.2) | 0) & 1);
      g.fillStyle = PIX.rune4; for (let a = 0; a < 16; a++) { const an = a * Math.PI / 8 + .2; g.fillRect(Math.round(bx + Math.cos(an) * (r + 5)), Math.round(by + Math.sin(an) * (r + 5)), 1, 1); }
      g.fillStyle = PIX.bone4; for (let a = 0; a < 12; a++) { const an = a * Math.PI / 6; g.fillRect(Math.round(bx + Math.cos(an) * r), Math.round(by + Math.sin(an) * r), 1, 1); }
    }
    g.fillStyle = PIX.bone3; g.fillRect(bx - 4, by - 1, 9, 3); g.fillRect(bx - 1, by - 4, 3, 9); g.fillRect(bx - 3, by - 3, 7, 7);      // five petals, squared off
    g.fillStyle = PIX.bone4; g.fillRect(bx - 3, by - 1, 7, 3); g.fillRect(bx - 1, by - 3, 3, 7); g.fillRect(bx - 2, by - 2, 5, 5);
    if (!open) { g.fillStyle = PIX.bone3; g.fillRect(bx - 2, by - 2, 1, 1); g.fillRect(bx + 2, by - 2, 1, 1); g.fillRect(bx - 2, by + 2, 1, 1); g.fillRect(bx + 2, by + 2, 1, 1); }
    g.fillStyle = PIX.gold4; g.fillRect(bx - 1, by, 3, 1); g.fillRect(bx, by - 1, 1, 3);
    g.fillStyle = PIX.bone4;                                                                      // motes of light leaving it
    for (let i = 0; i < 5; i++) { const ph = (t * .45 + i * .2) % 1; g.fillRect(bx - 8 + ((i * 7) % 17), by - 6 - Math.round(ph * 18), 1, 1); }
  },
  /** the unlit pass (55-render.js): the bloom shines in the dark */
  drawE(g, cx, cy, t) {
    if (G.zone !== 'catacombs' || !(G.flags.resyncGone || this.leaving) || !G.flags.resync) return;
    const p = this.prop(); if (!p || p.x == null || p.x - cx < -40 || p.x - cx > VW + 40) return;
    const grow = this.leaving ? clamp((G.time - this.leaving) / 1.5, 0, 1) * .6 : clamp(.6 + (G.time - (this.bloom || -9)) * .5, .6, 1);
    this.flower(g, Math.round(p.x) - cx, Math.round(p.gy) - cy, t, grow, true);
  },
  say(lines, done) { Dlg.open([{ who: 'who.resync', cls: 'npc', lines }], done); },
  /** the offer: one line per weapon in hand that can still be rewritten, the way back to the Keeper, and "not now" */
  menu() {
    const labels = [], acts = [];
    Arsenal.eq().forEach((id) => {
      if (Arsenal.level(id) >= UP_MAX) return;
      labels.push(['resync.c.up', tr('wp.' + id + '.name'), trNum(this.cost(id))]); acts.push(() => this.buy(id));
    });
    if (G.flags.bossSeen && !G.flags.mercy) { labels.push('resync.c.back'); acts.push(() => this.send()); }
    labels.push('resync.c.no'); acts.push(() => { G.scene = 'world'; });
    const eq = Arsenal.eq(), maxed = eq.length && eq.every((id) => Arsenal.level(id) >= UP_MAX);
    Dlg.open([{ who: 'who.resync', cls: 'npc', lines: [maxed ? ['resync_max', tr('wp.' + eq[0] + '.name')] : 'resync_menu'], choices: labels, onChoose: (i) => acts[i]() }]);
  },
  buy(id) {
    const cost = this.cost(id);
    if (G.score < cost) { this.say([['resync_poor', trNum(cost), trNum(G.score)]], () => this.menu()); return; }
    this.editor(id, () => this.say([['resync_done', tr('wp.' + id + '.name')]], () => this.menu()));
  },
  send() {
    this.say(['resync_send'], () => { G.scene = 'world'; Sound.blink(); goZone('arena', 'left'); });
  },

  /* ---------------- the editor: he changes the weapon's numbers while the visitor watches ---------------- */
  /** the lines of the weapon's entry, as { a: text before the number, v: the number or null, b: text after } */
  source(id, lv) {
    const w = WEAPONS[id], k = Arsenal.multAt(lv), rows = [], n = (m) => Math.round(m.dmg * k);
    const move = (m) => '{ dmg: \u0001' + n(m) + '\u0002, poise: ' + m.poise + ', stam: ' + m.stam + ', reach: ' + m.reach + ' }';
    rows.push('const WEAPONS = {'); rows.push('  ' + id + ': {');
    rows.push('    power: \u0001' + k.toFixed(1) + '\u0002,');
    rows.push('    light: [');
    w.light.forEach((m, i) => rows.push('      ' + move(m) + (i < w.light.length - 1 ? ',' : '')));
    rows.push('    ],');
    if (w.heavy.dmg) rows.push('    heavy: ' + move(w.heavy) + ',');
    if (w.special.dmg) rows.push('    special: ' + move(w.special));
    rows.push('  },');
    return rows.map((r) => { const i = r.indexOf('\u0001'), j = r.indexOf('\u0002'); return i < 0 ? { a: r, v: null, b: '' } : { a: r.slice(0, i), v: r.slice(i + 1, j), b: r.slice(j + 1) }; });
  },
  editor(id, done) {
    const lv = Arsenal.level(id), cost = this.cost(id), before = this.source(id, lv), after = this.source(id, lv + 1), st = el('stage'), p = this.prop();
    let box = el('editor');
    if (!box) { box = document.createElement('div'); box.id = 'editor'; box.setAttribute('data-noi18n', ''); st.appendChild(box); }
    box.innerHTML = '<div class="ed"><div class="ed-bar" dir="ltr"><i></i><i></i><i></i><b>src/js/64-weapons.js</b><span>RE-sync</span></div><div class="ed-code" dir="ltr"></div><div class="ed-stat" dir="ltr"></div><div class="ed-cap"></div></div>';
    const code = box.querySelector('.ed-code'), stat = box.querySelector('.ed-stat');
    const cap = box.querySelector('.ed-cap'); cap.dir = RTL[LANG] ? 'rtl' : 'ltr'; cap.textContent = tr('ui.resync.editing');
    const spans = [];
    before.forEach((r, i) => {
      const row = document.createElement('div'); row.className = 'ln';
      const no = document.createElement('u'); no.textContent = String(18 + i).padStart(3, ' '); row.appendChild(no);
      row.appendChild(document.createTextNode(r.a));
      if (r.v !== null) { const s = document.createElement('em'); s.textContent = r.v; row.appendChild(s); spans.push([s, after[i].v, row]); }
      row.appendChild(document.createTextNode(r.b)); code.appendChild(row);
    });
    stat.textContent = '-- NORMAL --';
    box.className = 'on'; G.scene = 'editor'; this.editing = true; if (p) p.work = true; Sound.open();
    const reduced = REDUCED || Calm(), step = reduced ? 40 : 70;
    let t = 500;
    const at = (ms, f) => setTimeout(() => { if (this.editing) f(); }, ms);
    spans.forEach(([s, nv, row]) => {
      at(t, () => { code.querySelectorAll('.cur').forEach((n) => n.classList.remove('cur')); row.classList.add('cur'); s.classList.add('sel'); stat.textContent = '-- INSERT --'; }); t += step * 3;
      const old = s.textContent;
      for (let k = old.length - 1; k >= 0; k--) { at(t, () => { s.textContent = old.slice(0, k); Sound.key(); }); t += step; }
      for (let k = 1; k <= nv.length; k++) { at(t, () => { s.textContent = nv.slice(0, k); Sound.key(); }); t += step; }
      at(t, () => { s.classList.remove('sel'); s.classList.add('new'); }); t += step * 2;
    });
    at(t, () => { stat.textContent = ':w  —  "src/js/64-weapons.js" written'; code.querySelectorAll('.cur').forEach((n) => n.classList.remove('cur')); }); t += 600;
    at(t, () => {
      stat.textContent = '✓ hot reload · ' + id + ' power ' + Arsenal.multAt(lv).toFixed(1) + ' → ' + Arsenal.multAt(lv + 1).toFixed(1) + ' · −' + cost + ' points';
      if (!G.flags.up || typeof G.flags.up !== 'object') G.flags.up = {};
      G.flags.up[id] = lv + 1; addScore(-cost); save(); Arsenal.hud(); Sound.rune();
      if (!Calm()) G.flash = .35;
    }); t += 1500;
    at(t, () => { box.className = ''; this.editing = false; if (p) p.work = false; G.scene = 'world'; done(); });
  }
};

/* ---------------- the backpack button: the weapons are one press away, always on screen ---------------- */
function openBag() {
  if (Dlg.on) return;
  if (G.scene === 'pause') { if (Arsenal.isOpen()) { Arsenal.close(); closePause(); } else Arsenal.open(); return; }
  if (G.scene !== 'world' && G.scene !== 'boss') return;
  openPause(); if (G.scene === 'pause') Arsenal.open();
}
{
  const b = document.createElement('button'); b.id = 'bagBtn'; b.className = 'hbtn'; b.type = 'button'; b.setAttribute('data-i18n-title', 'ui.btn.bag');
  b.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" stroke-linecap="round"><path d="M9 6V4.5A1.5 1.5 0 0 1 10.5 3h3A1.5 1.5 0 0 1 15 4.5V6"/><path d="M6.5 6h11A2.5 2.5 0 0 1 20 8.5V19a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8.5A2.5 2.5 0 0 1 6.5 6z"/><path d="M8 14h8v4H8zM4 11h16"/></svg>';
  b.addEventListener('pointerdown', (e) => e.stopPropagation());
  b.addEventListener('click', (e) => { e.stopPropagation(); Sound.resume(); openBag(); b.blur(); });
  el('stage').appendChild(b);
  document.addEventListener('keydown', (e) => {
    const tag = (e.target && e.target.tagName) || ''; if (tag === 'INPUT' || tag === 'TEXTAREA' || e.repeat) return;
    if (e.code === 'KeyB') { e.preventDefault(); openBag(); }
    else if (e.code === 'KeyR' && G.scene === 'attempt' && G.flags.resync && G.time - (G.attemptT || 0) > .7) { e.preventDefault(); Resync.rescue(); }
  });
  // "Visit RE-sync" on the Attempt screen (after he has been met once)
  const v = document.createElement('button'); v.id = 'attRe'; v.className = 'btn'; v.type = 'button'; v.dataset.i18n = 'ui.visit_resync';
  v.addEventListener('pointerdown', (e) => { e.stopPropagation(); });
  v.addEventListener('click', (e) => { e.stopPropagation(); if (G.scene === 'attempt') Resync.rescue(); });
  el('attRet').parentNode.appendChild(v);
}

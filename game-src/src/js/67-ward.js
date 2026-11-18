/* ==========================================================================
   THE WARD (owner request, 16 Nov) — weapons work in every hall, but nobody there can be hurt.

   • In the world the visitor may swing, guard, dodge and swap exactly as in the fight (67-combat.js): it shows what a weapon does.
   • A blow that reaches an NPC is turned by a ward. The third such blow (Ward.MAX) kills the visitor on the spot, and the
     Keeper's line fills the screen: "In these halls, all are under my protection."  The count starts again after that.
   • Stage classes set here: `armed` (the thumb buttons of the fight are shown in the world), `near` (something to speak
     with: the ✦ button comes back), `swing` (the weapon badge and stamina show for three seconds after a swing).
   ========================================================================== */
const Ward = {
  MAX: 3, n: 0, fx: [], t0: 0, _k: -1,
  npcs() { const z = World.z; return z ? z.props.filter((p) => p.t === 'npc' && !(p.flag && !G.flags[p.flag]) && !(p.id === 'resync' && G.flags.resyncGone)) : []; },
  /** a blow passes through the box: is anyone standing in it? */
  test(x0, y0, x1, y1) {
    if (G.scene !== 'world') return false;
    const ps = this.npcs();
    for (let i = 0; i < ps.length; i++) { const p = ps[i]; if (p.x > x0 - 9 && p.x < x1 + 9 && p.gy > y0 && p.gy - 46 < y1) { this.struck(p); return true; } }
    return false;
  },
  struck(p) {
    if (G.time - (p._ward == null ? -9 : p._ward) < .3) return;
    p._ward = G.time; this.n++;
    this.fx.push({ x: p.x, y: p.gy - 22, t: 0 });
    Sound.parry(); Combat.stop = .06; G.shake = Math.max(G.shake, Calm() ? 1 : 4);
    burst(p.x, p.gy - 22, 'rgba(190,140,255,', 12, 110);
    P.vx = (P.x + P.w / 2 < p.x ? -1 : 1) * 170;                    // the blow is thrown back
    if (this.n >= this.MAX) this.smite(); else Combat.float(tr('ui.ward.warn'), 'gold');
  },
  /** the third blow: the visitor falls where they stand */
  smite() {
    this.n = 0; G.scene = 'smite'; Keys.left = Keys.right = false; P.vx = 0; Combat.reset();
    if (!Calm()) G.flash = .6; G.shake = Calm() ? 2 : 10; Sound.hit(); Sound.crash();
    burst(P.x + P.w / 2, P.y + 16, 'rgba(190,140,255,', 26, 150); P.visible = false;
    setDet(0, true); countDeath(); showPrompt(null);
    const d = this.dom();
    d.querySelector('.l1').textContent = tr('ward.line');
    d.querySelector('.ret').textContent = tr(Touch.on ? 'goblin.ui.tap_to_get_up' : 'goblin.ui.press_e_to_get_up');
    this.t0 = performance.now();
    setTimeout(() => { if (G.scene === 'smite') d.classList.add('on'); }, 500);
  },
  rise() {
    if (G.scene !== 'smite' || performance.now() - this.t0 < 1700) return;
    this.dom().classList.remove('on');
    P.x = P.safeX; P.y = P.safeY; P.vx = P.vy = 0; P.visible = true; setDet((typeof Roster !== 'undefined' ? Roster.hp() : 5), true);
    P.act = 'materialize'; if (P.anim) animPlay(P.anim, 'materialize', true);
    G.scene = 'world'; Sound.open(); save();
  },
  dom() {
    if (this._dom) return this._dom;
    const d = document.createElement('div'); d.id = 'smite'; d.className = 'ov'; d.setAttribute('data-noi18n', '');
    d.innerHTML = '<div class="center"><div class="l1"></div><div class="ret"></div></div>';
    el('stage').appendChild(d);
    d.addEventListener('pointerdown', (e) => { e.preventDefault(); Sound.resume(); this.rise(); });
    return this._dom = d;
  },
  tick(dt) {
    for (let i = this.fx.length - 1; i >= 0; i--) { this.fx[i].t += dt; if (this.fx[i].t > .45) this.fx.splice(i, 1); }
    if (G.flags.allyOn && !Ally.on) G.flags.allyOn = false;                // a reload in the middle of the fight: he is not left standing in the hall
    const world = G.scene === 'world', armed = world && !Dlg.on && Arsenal.owned().length > 0, near = world && !!G._near, swing = world && G.time - (Combat.used == null ? -9 : Combat.used) < 3;
    const k = (armed ? 1 : 0) | (near ? 2 : 0) | (swing ? 4 : 0);
    if (k !== this._k) { this._k = k; const c = el('stage').classList; c.toggle('armed', armed); c.toggle('near', near); c.toggle('swing', swing); if (swing) { Arsenal.hud(); FightUI.labels(); } }
    if (swing) FightUI.sync();
  },
  /** the ward: a ring of rune light that opens around the one who was struck */
  draw(g, cx, cy) {
    for (let i = 0; i < this.fx.length; i++) {
      const f = this.fx[i], r = 9 + f.t * 44, x = Math.round(f.x) - cx, y = Math.round(f.y) - cy;
      g.fillStyle = f.t < .12 ? PIX.rune5 : PIX.rune3;
      for (let a = 0; a < 40; a++) { if (f.t > .2 && (a & 1)) continue; const an = a * Math.PI / 20; g.fillRect(Math.round(x + Math.cos(an) * r), Math.round(y + Math.sin(an) * r * 1.25), 1, 1); }
      if (f.t < .2) { g.fillStyle = PIX.rune5; g.fillRect(x - 1, y - 7, 3, 14); g.fillRect(x - 5, y - 3, 11, 3); }      // a lock-bar: the ward's mark
    }
  }
};
document.addEventListener('keydown', (e) => { if (G.scene === 'smite' && (e.code === 'KeyE' || e.code === 'Enter' || e.code === 'Space')) { e.preventDefault(); Ward.rise(); } });

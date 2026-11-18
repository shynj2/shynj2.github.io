/* ==========================================================================
   RE-sync AT YOUR SIDE (owner request, 16 Nov) — the new mercy.

   After ALLY_AT defeats RE-sync steps into the Keeper's hall. He never strikes. He stands at the door with a small terminal
   open and, every few seconds, types one command for the visitor:
       HEAL +1        one Determination back                 POWER +35      blows land 35 % harder for POWER_FOR seconds
       SHIELD ON      the next blow that lands is taken away  STAMINA FULL   stamina refilled
   The price (68-boss.js): every defeat brings the Keeper back to full health.
   Numbers to tune are the constants below. He is the arena prop `ally` (49-zones.js), visible while G.flags.allyOn is set.
   ========================================================================== */
const ALLY_AT = 5, ALLY_EVERY = 3.6, POWER_UP = 1.35, POWER_FOR = 9;
const Ally = {
  on: false, cd: 0, cmd: null, log: [], power: 0, shield: false, beam: 0, n: 0,
  prop() { return ZONES.arena.props.find((p) => p.id === 'ally'); },
  /** called when a fight (or a retry) is set up */
  start() { this.on = !!G.flags.ally; G.flags.allyOn = this.on; this.lamp(this.on); this.cd = 2.2; this.cmd = null; this.power = 0; this.shield = false; this.beam = 0; this.n = 0; this.log = ['RESYNC ATTACHED', 'WATCHING RECRUITER']; },
  stop() { this.on = false; G.flags.allyOn = false; this.lamp(false); this.cmd = null; this.power = 0; this.shield = false; const p = this.prop(); if (p) p.work = false; },
  /** the green of his screen lights him where he stands */
  lamp(on) {
    const p = this.prop(); if (!p || p.x == null || G.zone !== 'arena') return;
    if (World.lights.indexOf(this.L) < 0) this.L = on ? World.addLight(p.x, p.gy - 30, 84, 'leaf', true) : null;
    if (this.L) this.L.on = on ? 1 : 0;
  },
  mult() { return this.on && this.power > 0 ? POWER_UP : 1; },
  /** a blow that would land on the visitor: his shield takes it, once */
  guard() {
    if (!this.on || !this.shield) return false;
    this.shield = false; Sound.parry(); Combat.inv = .5; burst(P.x + P.w / 2, P.y + 14, 'rgba(125,255,176,', 16, 120); this.say('SHIELD SPENT');
    return true;
  },
  say(s) { this.log.push(s); if (this.log.length > 2) this.log.shift(); },
  /** he arrives (the fifth defeat): a burst of green at the door, then he speaks */
  arrive(done) {
    const p = this.prop(); this.start();
    burst(p.x, p.gy - 24, 'rgba(125,255,176,', 26, 130); Sound.blink(); P.face = p.x < P.x ? -1 : 1;
    G._near = { kind: 'npc', p };
    Dlg.open([{ who: 'who.resync', cls: 'npc', lines: ['resync_ally.1', 'resync_ally.2', 'resync_ally.3'] }], done);
  },
  next() {
    const hurt = 5 - G.det, opts = [];
    if (hurt >= 2 || (hurt === 1 && this.n % 2 === 0)) opts.push('heal');
    if (!opts.length) { if (this.power <= 1) opts.push('power'); if (!this.shield) opts.push('shield'); if (Combat.stam < 45) opts.push('stam'); }
    if (!opts.length) opts.push(hurt ? 'heal' : 'power');
    const id = opts[this.n % opts.length]; this.n++;
    this.cmd = { id, t: 0, text: { heal: '> HEAL +1', power: '> POWER +35', shield: '> SHIELD ON', stam: '> STAMINA FULL' }[id] };
    const p = this.prop(); if (p) p.work = true;
  },
  exec(c) {
    const px = P.x + P.w / 2;
    if (c.id === 'heal') { if (G.det < 5) setDet(G.det + 1); }
    else if (c.id === 'power') this.power = POWER_FOR;
    else if (c.id === 'shield') this.shield = true;
    else Combat.stam = Combat.STAM;
    this.say(c.text.slice(2) + ' OK'); this.beam = .45; Sound.rune(); burst(px, P.y + 14, 'rgba(125,255,176,', 14, 90);
    this.cmd = null; this.cd = ALLY_EVERY * (c.id === 'heal' ? 1.15 : 1); const p = this.prop(); if (p) p.work = false;
  },
  update(dt) {
    if (!this.on || G.scene !== 'boss' || !BOSS.active || Dlg.on || BOSS.frozen || BOSS.state === 'dead') return;
    if (this.beam > 0) this.beam -= dt;
    if (this.power > 0) { this.power -= dt; if (((G.time * 8) | 0) !== (((G.time - dt) * 8) | 0)) burst(P.x + P.w / 2, P.y + P.h - 4, 'rgba(125,255,176,', 1, 30); }
    if (this.cmd) { const c = this.cmd, was = Math.floor(c.t * 20); c.t += dt; if (Math.floor(c.t * 20) !== was && c.t * 20 <= c.text.length) Sound.key(); if (c.t * 20 >= c.text.length + 7) this.exec(c); }
    else { this.cd -= dt; if (this.cd <= 0) this.next(); }
  },
  /** his terminal (a small window over his head), the line of light to the visitor, the shield */
  draw(g, cx, cy, t) {
    if (!this.on || !G.flags.allyOn) return;
    const p = this.prop(); if (!p || p.x == null) return;
    const w = 86, h = 31, x = Math.round(clamp(p.x - w / 2, 4 + cx, cx + VW - w - 4)) - cx, y = Math.round(p.gy - 52 - h) - cy;
    g.fillStyle = '#030806'; g.fillRect(x, y, w, h); g.fillStyle = '#2a7a50'; g.fillRect(x, y, w, 1); g.fillRect(x, y + h - 1, w, 1); g.fillRect(x, y, 1, h); g.fillRect(x + w - 1, y, 1, h);
    g.fillStyle = '#0d2a1c'; g.fillRect(x + 1, y + 1, w - 2, 6); g.fillStyle = '#39c27a'; g.fillRect(x + 3, y + 3, 2, 2); g.fillRect(x + 7, y + 3, 2, 2);
    g.drawImage(pixText('RE-SYNC', '#7dffb0'), x + 54, y);
    const rows = this.log.slice(-2).map((s) => [s, '#39c27a']);
    if (this.cmd) rows.push([this.cmd.text.slice(0, Math.floor(this.cmd.t * 20)) + (((t * 4) | 0) & 1 ? '_' : ''), '#d6ffe6']); else rows.push(['>' + (((t * 2) | 0) & 1 ? '_' : ''), '#d6ffe6']);
    rows.slice(-3).forEach((r, i) => g.drawImage(pixText(r[0].slice(0, 20), r[1]), x + 2, y + 7 + i * 7));
    g.fillStyle = '#2a7a50'; g.fillRect(Math.round(p.x) - cx, y + h, 1, 4);
    const px = Math.round(P.x + P.w / 2) - cx, py = Math.round(P.y + 14) - cy;
    if (this.beam > 0) { g.fillStyle = '#7dffb0'; const x0 = Math.round(p.x) - cx, y0 = Math.round(p.gy - 30) - cy, n = Math.max(1, Math.abs(px - x0) >> 2); for (let i = 0; i <= n; i++) if ((i + ((t * 30) | 0)) & 1) g.fillRect(Math.round(x0 + (px - x0) * i / n), Math.round(y0 + (py - y0) * i / n), 2, 1); }
    if (this.shield) { g.fillStyle = '#7dffb0'; for (let a = 0; a < 24; a++) { if ((a + ((t * 6) | 0)) % 3 === 0) continue; const an = a * Math.PI / 12; g.fillRect(Math.round(px + Math.cos(an) * 13), Math.round(py + 4 + Math.sin(an) * 22), 1, 1); } }
    if (this.power > 0) { g.fillStyle = '#d6ffe6'; g.fillRect(px - 1, py - 26 - (((t * 6) | 0) & 1), 3, 1); g.fillRect(px, py - 27 - (((t * 6) | 0) & 1), 1, 3); }      // a small plus over the head
  }
};

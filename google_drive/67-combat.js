/* ==========================================================================
   COMBAT — the Recruiter's side of the fight (Round 9 §8.1).
   Buttons:  attack · heavy (hold = the weapon's special) · dodge · guard (raised at the exact moment = a perfect guard) · swap
     keyboard  J · K · L (or Shift) · I · Q        E also attacks, as it did in the old fight
     gamepad   X · Y · B · LB/RB · d-pad up        A jumps, Start pauses
     touch     the five round buttons on the right (index of the DOM: #touch .cmb)
   The weapon numbers are in 64-weapons.js. The Keeper's side is 68-boss.js.
   ========================================================================== */
const Combat = {
  STAM: 100, stam: 100, stamWait: 0,
  act: '', mv: null, kind: '', t: 0, step: 0, chainT: 0, landed: 0, cued: false,
  inv: 0, stun: 0, guardDown: false, guardT: 0, heavyDown: false, heavyT: 0, buf: '', bufT: 0,
  dodgeDir: 1, stop: 0, mirror: 0, slow: 0, stanceT: 0,
  shots: [], arcs: [], nums: [],
  /* what the Keeper reads about the visitor (68-boss.js think(), 69-override.js) */
  seen: { atk: [], press: [], dodgeToward: 0, dodgeAway: 0, lastDodge: 0, guard: 0, still: 0, hurtAt: -99, jumps: 0 },

  /** the buttons work in the fight, and (since 16 Nov) in every hall once a weapon is carried: see 67-ward.js */
  on() {
    if (Dlg.on) return false;
    if (G.scene === 'boss') return BOSS.active && !BOSS.frozen;
    return G.scene === 'world' && Arsenal.owned().length > 0 && G.fadeDir === 0 && P.act !== 'materialize' && P.visible !== false;
  },
  weapon() { return WEAPONS[Arsenal.cur()]; },
  busy() { return this.act !== '' && this.act !== 'guard'; },
  reset() {
    this.stam = this.STAM; this.stamWait = 0; this.act = ''; this.mv = null; this.kind = ''; this.t = 0; this.step = 0; this.chainT = 0; this.landed = 0; this.cued = false; this.inv = 0; this.stun = 0; this.stop = 0; this.guardT = 0; this.heavyT = 0; this.bufT = 0; this.stanceT = 0;
    this.guardDown = this.heavyDown = false; this.buf = ''; this.mirror = 0; this.slow = 0;
    this.shots.length = this.arcs.length = this.nums.length = 0;
    const s = this.seen; s.atk.length = s.press.length = 0; s.dodgeToward = s.dodgeAway = s.guard = s.still = s.jumps = 0; s.hurtAt = -99; s.lastDodge = 0;
  },
  /** left/right from the keys; nothing while an action holds the feet (and mirrored while the terminal says so) */
  dir() {
    let d = (Keys.right ? 1 : 0) - (Keys.left ? 1 : 0);
    if (G.scene === 'boss') { if (this.mirror > 0) d = -d; if (BOSS.frozen) return 0; }
    else if (G.scene !== 'world') return d;
    if (this.stun > 0 || this.act === 'guard' || this.act === 'charge' || this.act === 'dodge' || (this.mv && this.t < this.mv.wind + this.mv.act)) return 0;
    return d;
  },

  /* ---------------- buttons ---------------- */
  press(b) {
    const now = G.time, s = this.seen;
    s.press.push(now); while (s.press.length && now - s.press[0] > 2) s.press.shift();
    if (!this.on() || this.stun > 0) return;
    this.used = G.time;
    if (b === 'guard') { this.guardDown = true; return; }
    if (b === 'swap') { if ((!this.busy() || this.act === 'charge') && Arsenal.swap()) { this.act = ''; this.heavyDown = false; this.step = 0; Sound.open(); this.float(tr('wp.' + Arsenal.cur() + '.name'), 'gold'); } return; }
    if (b === 'dodge') { this.dodge(); return; }
    if (b === 'heavy') {
      if (this.act === '' || this.inRecovery()) { this.endMove(); this.act = 'charge'; this.heavyDown = true; this.heavyT = 0; this.cued = false; }
      else { this.buf = 'heavy'; this.bufT = .22; }
      return;
    }
    if (b === 'attack') {
      if (this.act === '' || this.act === 'guard' || this.inRecovery()) this.light();
      else { this.buf = 'attack'; this.bufT = .28; }
    }
  },
  release(b) {
    if (b === 'guard') this.guardDown = false;
    if (b === 'heavy' && this.heavyDown) {
      this.heavyDown = false;
      if (this.act !== 'charge') return;
      const w = this.weapon(); this.act = '';
      this.begin(this.heavyT >= w.special.charge ? 'special' : 'heavy', this.heavyT >= w.special.charge ? w.special : w.heavy);
    }
  },
  inRecovery() { return !!this.mv && this.t >= this.mv.wind + this.mv.act; },
  light() {
    const L = this.weapon().light;
    if (this.kind !== 'light' || this.chainT <= 0 && !this.mv) this.step = 0;
    const mv = L[this.step % L.length];
    if (this.begin('light', mv)) this.step = (this.step + 1) % L.length;
  },
  begin(kind, mv) {
    if (this.stam < Math.min(mv.stam, 8)) { this.float(tr('ui.fight.tired'), 'ember'); this.act = ''; this.mv = null; return false; }
    this.stam = Math.max(0, this.stam - mv.stam); this.stamWait = .55;
    this.act = kind; this.kind = kind; this.mv = mv; this.t = 0; this.landed = 0; this.buf = '';
    const d = (Keys.right ? 1 : 0) - (Keys.left ? 1 : 0); if (d) P.face = this.mirror > 0 ? -d : d;
    else if (BOSS.active && !BOSS.hide && kind !== 'heavy' || !d && mv.grab) P.face = BOSS.x >= P.x + P.w / 2 ? 1 : -1;      // no direction held: turn to him
    this.seen.atk.push(G.time); while (this.seen.atk.length && G.time - this.seen.atk[0] > 2.5) this.seen.atk.shift();
    Sound.swing(kind !== 'light');
    return true;
  },
  endMove() { this.mv = null; if (this.act !== 'guard') this.act = ''; this.chainT = .42; },
  dodge() {
    if (this.act === 'dodge' || this.stam < 10) { if (this.stam < 10) this.float(tr('ui.fight.tired'), 'ember'); return; }
    this.stam = Math.max(0, this.stam - 22); this.stamWait = .5;
    let d = (Keys.right ? 1 : 0) - (Keys.left ? 1 : 0); if (this.mirror > 0) d = -d;
    this.dodgeDir = d || P.face; this.mv = null; this.heavyDown = false; this.act = 'dodge'; this.t = 0; this.inv = Math.max(this.inv, .30);
    const toward = (BOSS.x - (P.x + P.w / 2)) * this.dodgeDir > 0, s = this.seen;
    if (toward) s.dodgeToward++; else s.dodgeAway++; s.lastDodge = this.dodgeDir;
    Sound.swing(false); burst(P.x + P.w / 2, P.y + P.h - 2, 'rgba(190,140,255,', 5, 40);
  },

  /* ---------------- every frame ---------------- */
  update(dt) {
    const s = this.seen, pcx = P.x + P.w / 2;
    if (this.inv > 0) this.inv -= dt;
    if (this.chainT > 0) this.chainT -= dt;
    if (this.bufT > 0) this.bufT -= dt; else this.buf = '';
    if (this.mirror > 0) this.mirror -= dt;
    if (this.stanceT > 0) this.stanceT -= dt;
    if (this.slow > 0) { this.slow -= dt; if (this.slow <= 0) PHYS.grav = Combat.grav0 || PHYS.grav; }
    s.still = (Math.abs(P.vx) < 12 && P.onGround) ? s.still + dt : 0;
    if (this.stamWait > 0) this.stamWait -= dt; else this.stam = Math.min(this.STAM, this.stam + (this.act === 'guard' ? 16 : 38) * dt);
    this.fx(dt);
    if (!this.on()) { if (this.act !== '') { this.act = ''; this.mv = null; } this.guardDown = this.heavyDown = false; return; }

    if (this.stun > 0) { this.stun -= dt; this.act = 'stun'; this.mv = null; return; }
    if (this.act === 'stun') this.act = '';

    if (this.act === 'dodge') {
      this.t += dt; P.vx = this.dodgeDir * 340 * (1 - .5 * this.t / .34);
      if (this.t >= .34) { this.act = ''; P.vx *= .4; }
      return;
    }
    if (this.act === 'charge') {
      this.heavyT += dt; P.vx *= .7;
      if (!this.cued && this.heavyT >= this.weapon().special.charge) { this.cued = true; Sound.charge(); burst(pcx + P.face * 8, P.y + 8, 'rgba(255,220,180,', 8, 60); }
      if (this.heavyT > 2.2) this.release('heavy');
      return;
    }
    if (this.mv) {
      const m = this.mv; this.t += dt;
      Keys.jumpEdge = false;
      if (this.t < m.wind) P.vx = m.lunge ? P.face * m.lunge : P.vx * .6;
      else if (this.t < m.wind + m.act) {
        if (m.inv) this.inv = Math.max(this.inv, .06);
        P.vx = m.dash ? P.face * m.dash : m.back ? -P.face * m.back : P.vx * .5;
        const n = m.hits || 1, due = Math.min(n, 1 + Math.floor((this.t - m.wind) / m.act * n));
        while (this.landed < due) { this.landed++; this.strike(m); }
      } else {
        P.vx *= .6;
        if (this.buf === 'attack' && this.kind === 'light') { this.buf = ''; this.light(); }
        else if (this.t >= m.wind + m.act + m.rec) {
          this.endMove();
          if (this.buf === 'attack') { this.buf = ''; this.light(); }
          else if (this.buf === 'heavy') { this.buf = ''; this.press('heavy'); }
        }
      }
      return;
    }
    if (this.guardDown && P.onGround) {
      if (this.act !== 'guard') { this.act = 'guard'; this.guardT = 0; }
      this.guardT += dt; s.guard = Math.min(6, s.guard + dt); P.vx *= .5;
    } else {
      if (this.act === 'guard') this.act = '';
      s.guard = Math.max(0, s.guard - dt * .35);
    }
  },

  /* ---------------- a move lands ---------------- */
  strike(m) {
    const id = Arsenal.cur(), w = WEAPONS[id], face = P.face, pcx = P.x + P.w / 2, py = P.y;
    const isMiku = typeof Special !== 'undefined' && Special.kind() === 'miku';
    const info = { melee: !!m.reach, heavy: this.kind !== 'light', mv: m, wp: id };
    if (m.stance) { this.stanceT = m.act; return; }
    if (isMiku) {
      Sound.rune();
      if (m.sonicWave) {
        this.shots.push({ k: 'sonic', x: pcx + face * 18, y: py + 4, vx: face * 330, left: 340, dmg: m.dmg, poise: m.poise, pierce: true, info: { ...info, melee: false }, hitB: false, t: 0 });
      } else if (!m.glyph) {
        const nf = m.mikuNote != null ? m.mikuNote : ((this.step | 0) % 4);
        this.shots.push({ k: 'note', x: pcx + face * 16, y: py + 10, y0: py + 10, vx: face * 290, vy: 0, ph: 0, nf, left: 290, dmg: m.dmg, poise: m.poise, pierce: false, info: { ...info, melee: false }, hitB: false, t: 0 });
        if (m.mikuChord) {
          this.shots.push({ k: 'note', x: pcx + face * 14, y: py + 4,  y0: py + 4,  vx: face * 275, vy: -34, ph: 1.6, nf: 2, left: 260, dmg: Math.round(m.dmg * .65), poise: 8, pierce: false, info: { ...info, melee: false }, hitB: false, t: 0 });
          this.shots.push({ k: 'note', x: pcx + face * 14, y: py + 16, y0: py + 16, vx: face * 275, vy:  34, ph: 3.2, nf: 3, left: 260, dmg: Math.round(m.dmg * .65), poise: 8, pierce: false, info: { ...info, melee: false }, hitB: false, t: 0 });
        }
      }
    }
    if (m.bolt) this.shots.push({ k: 'bolt', x: pcx + face * 14, y: py + 10, vx: face * m.bolt.speed, left: m.bolt.range, dmg: m.dmg, poise: m.poise, pierce: !!m.bolt.pierce, info, hitB: false });
    if (m.cross) this.shots.push({ k: 'cross', x: pcx + face * 16, y: py - 6, vx: face * m.cross.speed, left: m.cross.range, dmg: m.dmg, poise: m.poise, pierce: true, info, hitB: false });
    if (m.glyph) { const far = BOSS.active && Math.abs(BOSS.x - pcx) < 260 && !BOSS.hide ? BOSS.x : pcx + face * 120; this.shots.push({ k: 'glyph', x: clamp(far, 30, World.W - 30), y: World.groundNear(far), t: 0, delay: m.glyph.delay, r: m.glyph.r, encore: !!m.glyph.encore, dmg: m.dmg, poise: m.poise, info }); }
    if (m.reach) {
      this.arcs.push({ x: pcx + face * 4, y: py + 14, face, t: 0, big: info.heavy, miku: isMiku, wp: id, dash: !!m.dash, hits: m.hits || 1 });
      if (info.heavy) burst(pcx + face * Math.min(40, m.reach * .75), py + 12, isMiku ? 'rgba(130,235,255,' : 'rgba(255,215,130,', 7, 72);
      const x0 = Math.min(pcx, pcx + face * m.reach), x1 = Math.max(pcx, pcx + face * m.reach);
      Dojo.hit(x0, py - 12, x1, py + P.h, m.dmg, m.poise, info);
      Ward.test(x0, py - 12, x1, py + P.h);                                   // in the halls: nobody can be hurt (67-ward.js)
      const hit = Boss.touch(x0, py - 12, x1, py + P.h);
      if (hit) {
        let dmg = m.dmg;
        if (m.grab) { if (!Boss.thrown(info)) dmg = 0; }
        if (dmg && Boss.take(dmg, m.poise, info)) { if (m.bleed) Boss.bleed(m.bleed); burst(BOSS.x - face * 10, py + 8, 'rgba(255,220,180,', info.heavy ? 12 : 6, 90); }
      } else if (m.grab) { /* a throw that finds nobody */ }
      Boss.strikeMinions(x0, py - 30, x1, py + P.h);
    }
    if (m.wave) this.shots.push({ k: 'wave', x: pcx + face * 26, y: World.groundNear(pcx), vx: face * m.wave.speed, left: m.wave.range, dmg: m.wave.dmg, poise: 14, pierce: false, info: { ...info, melee: false }, hitB: false });
    if (m.quake) {
      G.shake = Math.max(G.shake, Calm() ? 3 : 10); Sound.hit();
      [-1, 1].forEach((d) => this.shots.push({ k: 'wave', x: pcx + d * 20, y: World.groundNear(pcx), vx: d * 300, left: 220, dmg: 14, poise: 30, pierce: true, info: { ...info, melee: false }, hitB: false }));
    }
  },
  /** the Recruiter's own bolts, waves and glyphs; slash arcs; numbers that float off the Keeper */
  fx(dt) {
    for (let i = this.shots.length - 1; i >= 0; i--) {
      const o = this.shots[i];
      if (o.k === 'glyph') {
        o.t += dt;
        if (o.t >= o.delay && !o.done) {
          o.done = true;
          burst(o.x, o.y - 8, o.encore ? 'rgba(130,235,255,' : 'rgba(220,170,255,', 24, 150);
          Sound.rune(); G.shake = Math.max(G.shake, Calm() ? 2 : 5);
          Dojo.hit(o.x - o.r, o.y - 90, o.x + o.r, o.y, o.dmg, o.poise, o.info);
          Ward.test(o.x - o.r, o.y - 90, o.x + o.r, o.y);
          if (Boss.touch(o.x - o.r, o.y - 90, o.x + o.r, o.y)) Boss.take(o.dmg, o.poise, o.info);
          Boss.strikeMinions(o.x - o.r, o.y - 110, o.x + o.r, o.y);
        }
        if (o.t > o.delay + .28) this.shots.splice(i, 1);
        continue;
      }
      o.t = (o.t || 0) + dt;
      const dx = o.vx * dt; o.x += dx; o.left -= Math.abs(dx);
      if (o.k === 'note') {
        if (o.vy) o.y0 += o.vy * dt;
        o.y = (o.y0 != null ? o.y0 : o.y) + Math.sin(o.t * 15 + (o.ph || 0)) * 3;
      }
      const top = o.k === 'wave' ? o.y - 16 : o.k === 'cross' ? o.y - 4 : o.k === 'sonic' ? o.y - 14 : o.y - 7;
      const bot = o.k === 'wave' ? o.y : o.k === 'cross' ? o.y + 44 : o.k === 'sonic' ? o.y + 26 : o.y + 7;
      if (!o.dummyHit && Dojo.hit(o.x - 8, top, o.x + 8, bot, o.dmg, o.poise, o.info)) { o.dummyHit = true; if (!o.pierce) o.left = 0; }
      if (!o.warded && Ward.test(o.x - 8, top, o.x + 8, bot)) { o.warded = true; if (!o.pierce) o.left = 0; }
      if (!o.hitB && Boss.touch(o.x - 8, top, o.x + 8, bot)) { o.hitB = true; Boss.take(o.dmg, o.poise, o.info); if (!o.pierce) o.left = 0; }
      if (Boss.strikeMinions(o.x - 8, top - 20, o.x + 8, bot) && !o.pierce) o.left = 0;
      if (o.left <= 0 || o.x < 16 || o.x > World.W - 16) {
        burst(o.x, (top + bot) / 2, (o.k === 'note' || o.k === 'sonic') ? 'rgba(130,235,255,' : 'rgba(190,140,255,', 7, 65);
        this.shots.splice(i, 1);
      }
    }
    for (let i = this.arcs.length - 1; i >= 0; i--) { const a = this.arcs[i]; a.t += dt; if (a.t > (a.big ? .22 : .16)) this.arcs.splice(i, 1); }
    for (let i = this.nums.length - 1; i >= 0; i--) { const n = this.nums[i]; n.t += dt; n.y -= 26 * dt; if (n.t > .8) this.nums.splice(i, 1); }
  },
  number(x, y, v, col) {
    if (this.nums.length > 14) this.nums.shift();
    const key = v + '|' + col; let c = this._nc[key];
    if (!c) c = this._nc[key] = pixText(String(v), palHex(col), palHex('void1'));
    this.nums.push({ x: x + (Math.random() * 16 - 8), y, t: 0, c });
  },
  _nc: {},
  /** a short word over the Recruiter's head (current language, so it is a DOM label, not pixel text) */
  float(text, tone) {
    const f = el('fightSay'); if (!f) return;
    f.textContent = text; f.className = 'on ' + (tone || ''); clearTimeout(this._ft); this._ft = setTimeout(() => { f.className = ''; }, 900);
  },

  /* ---------------- being struck ---------------- */
  /** hz: { dmg, parry (a guard can stop it), unblock, x (where it came from), bolt } → 'hit' | 'parry' | 'block' | 'miss' */
  hurt(hz) {
    if (G.zone === 'dojo') return 'miss';
    if (!this.on() || P.hurt > 0 && this.inv > 0) return 'miss';
    if (this.inv > 0) return 'miss';
    const w = this.weapon(), pcx = P.x + P.w / 2, from = hz.from != null ? hz.from : hz.x == null ? BOSS.x : hz.x;
    const stance = this.stanceT > 0 && this.act === 'special';
    if ((this.act === 'guard' || stance) && !hz.unblock) {
      if (stance || this.guardT <= (w.parry || .16) * (BOSS.eased ? 1.5 : 1)) {            // raised at the exact moment
        Sound.parry(); this.stop = .09; this.inv = .35; this.stam = Math.min(this.STAM, this.stam + 25);
        this.float(tr('ui.fight.parry'), 'gold'); burst(pcx + P.face * 10, P.y + 10, 'rgba(255,240,200,', 14, 120);
        if (hz.bolt) hz.reflect = true;
        else if (Math.abs(BOSS.x - pcx) < 130 && !BOSS.hide) Boss.take(w.parryDmg || 6, w.parryDmg ? 60 : 34, { melee: false, parry: true, wp: Arsenal.cur() });
        if (hz.bolt && w.parryDmg) hz.reflectDmg = w.parryDmg;
        return 'parry';
      }
      const cost = 20 * (hz.dmg || 1) * (w.blockCost || 1);
      if (this.stam >= cost) {
        this.stam -= cost; this.stamWait = .7; Sound.block(); P.vx = (pcx < from ? -1 : 1) * 90; burst(pcx + P.face * 9, P.y + 12, 'rgba(190,140,255,', 6, 70);
        if (w.riposte && Math.abs(BOSS.x - pcx) < 70 && !BOSS.hide) { this.arcs.push({ x: pcx + P.face * 4, y: P.y + 14, face: P.face, t: 0, wp: Arsenal.cur(), big: false }); Boss.take(w.riposte, 10, { melee: false, wp: Arsenal.cur() }); }
        return 'block';
      }
      this.stam = 0; this.stun = .45;                                                         // the guard breaks
    }
    if (Ally.guard()) return 'block';                                                         // RE-sync's shield takes this one (68-ally.js)
    let dmg = hz.dmg || 1; if (BOSS.eased) dmg = 1;
    P.hurt = .45; this.inv = BOSS.eased ? 1.3 : .85; this.act = ''; this.mv = null; this.heavyDown = false;
    P.vx = (pcx < from ? -1 : 1) * 150; if (P.onGround) P.vy = -120;
    G.shake = Math.max(G.shake, Calm() ? 2 : 7); this.stop = .07; this.seen.hurtAt = G.time;
    Sound.hit(); setDet(G.det - dmg); burst(pcx, P.y + 16, 'rgba(255,90,120,', 14, 90);
    if (G.det <= 0) bossDeath();
    return 'hit';
  },

  /* ---------------- the body: which frame of which clip ---------------- */
  /** returns true when it has set the Recruiter's animation frame itself */
  pose(a) {
    let clip = '', k = 0;
    if (this.act === 'dodge') { clip = 'dodge'; k = this.t / .34; }
    else if (this.act === 'guard') clip = 'guard';
    else if (this.act === 'charge') { clip = this.weapon().special.clip === 'guard' ? 'guard' : 'heavy'; k = Math.min(.3, this.heavyT * .5); }
    else if (this.mv) { const m = this.mv, tot = m.wind + m.act + m.rec; clip = m.clip; k = this.t < m.wind ? .24 * this.t / m.wind : this.t < m.wind + m.act ? .3 + .35 * (this.t - m.wind) / m.act : .7 + .3 * (this.t - m.wind - m.act) / m.rec; if (m.hits) k = ((this.t / .12) % 1); void tot; }
    const c = clip && a.rig && a.rig.def.clips[clip]; if (!c) return false;
    if (a.name !== clip) { a.name = clip; a.clip = c; a.done = false; a.t = 0; }
    a.i = clip === 'guard' ? ((G.time * 4) | 0) % c.f.length : Math.max(0, Math.min(c.f.length - 1, Math.floor(k * c.f.length)));
    a.f = c.f[a.i][0];
    return true;
  },

  /* ---------------- drawing (over the lit picture, so blades and bolts glow) ---------------- */
  draw(g, cx, cy, t) {
    for (let i = 0; i < this.arcs.length; i++) {
      const a = this.arcs[i], rt = a.face > 0;
      if (a.miku && sprRect('fx_miku_slash', 0)) {
        const f = Math.min(2, (a.t / (a.big ? .072 : .055)) | 0);
        if (a.big && sprRect('fx_heavy_slash', 0)) spr(g, rt ? 'fx_heavy_slash' : 'fx_heavy_slash_l', (rt ? a.x - 4 : a.x - 58) - cx, a.y - 29 - cy, Math.min(3, (a.t / .055) | 0));
        spr(g, rt ? 'fx_miku_slash' : 'fx_miku_slash_l', (rt ? a.x - 2 : a.x - 46) - cx, a.y - 24 - cy, f);
      } else if (a.wp === 'katana' && (a.big || a.dash) && sprRect('fx_katana_dash', 0)) {
        const f = Math.min(2, (a.t / .07) | 0);
        spr(g, rt ? 'fx_katana_dash' : 'fx_katana_dash_l', (rt ? a.x - 8 : a.x - 60) - cx, a.y - 14 - cy, f);
      } else if (a.wp === 'daggers' && (a.big || a.hits > 1) && sprRect('fx_dagger_flurry', 0)) {
        const f = Math.min(2, (a.t / .055) | 0);
        spr(g, rt ? 'fx_dagger_flurry' : 'fx_dagger_flurry_l', (rt ? a.x - 2 : a.x - 44) - cx, a.y - 20 - cy, f);
      } else if (a.wp === 'gauntlets' && sprRect('fx_chi_palm', 0)) {
        const f = Math.min(2, (a.t / .06) | 0);
        if (a.big && sprRect('fx_heavy_slash', 0)) spr(g, rt ? 'fx_heavy_slash' : 'fx_heavy_slash_l', (rt ? a.x - 6 : a.x - 56) - cx, a.y - 28 - cy, Math.min(3, (a.t / .055) | 0));
        spr(g, rt ? 'fx_chi_palm' : 'fx_chi_palm_l', (rt ? a.x : a.x - 42) - cx, a.y - 20 - cy, f);
      } else if (a.big && sprRect('fx_heavy_slash', 0)) {
        const f = Math.min(3, (a.t / .055) | 0);
        spr(g, rt ? 'fx_heavy_slash' : 'fx_heavy_slash_l', (rt ? a.x - 4 : a.x - 58) - cx, a.y - 29 - cy, f);
      } else {
        const f = Math.min(2, (a.t / .055) | 0);
        spr(g, rt ? 'fx_slash' : 'fx_slash_l', (rt ? a.x - 2 : a.x - 44) - cx, a.y - 21 - cy, f);
      }
    }
    for (let i = 0; i < this.shots.length; i++) {
      const o = this.shots[i];
      if (o.k === 'note') {
        const x = Math.round(o.x - cx), y = Math.round(o.y - cy);
        if (sprRect('fx_note', 0)) {
          spr(g, 'fx_note', x - 8, y - 8, o.nf || 0);
          g.fillStyle = palHex('cold4');
          g.fillRect(x - Math.sign(o.vx) * 10, y + (((t * 18 + i) | 0) & 1 ? -1 : 1), 2, 1);
        } else {
          g.fillStyle = palHex('cold4'); g.fillRect(x, y - 9, 2, 9); g.fillRect(x - 3, y - 2, 4, 3);
        }
      } else if (o.k === 'sonic') {
        const x = Math.round(o.x - cx), y = Math.round(o.y - cy);
        if (sprRect('fx_sonic_wave', 0)) {
          spr(g, o.vx > 0 ? 'fx_sonic_wave' : 'fx_sonic_wave_l', (o.vx > 0 ? x - 18 : x - 10), y - 18, ((t * 14) | 0) % 3);
        }
      } else if (o.k === 'bolt') {
        if (o.pierce && sprRect('fx_comet', 0)) {
          spr(g, o.vx > 0 ? 'fx_comet' : 'fx_comet_l', (o.vx > 0 ? o.x - 22 : o.x - 8) - cx, o.y - 9 - cy, ((t * 16) | 0) % 4);
        } else {
          spr(g, 'fx_orb', o.x - 8 - cx, o.y - 8 - cy, ((t * 14) | 0) % 6);
          g.fillStyle = PIX.rune4; g.fillRect(Math.round(o.x - Math.sign(o.vx) * 12) - cx, Math.round(o.y) - cy, 5, 1);
        }
      } else if (o.k === 'cross') {
        spr(g, 'fx_cross', o.x - 17 - cx, o.y - 4 - cy, ((t * 12) | 0) % 4);
      } else if (o.k === 'wave') {
        if (sprRect('fx_quake_wave', 0)) {
          spr(g, o.vx > 0 ? 'fx_quake_wave' : 'fx_quake_wave_l', o.x - 15 - cx, o.y - 26 - cy, ((t * 18 + i) | 0) % 4);
        } else {
          g.fillStyle = PIX.gold4; for (let k = 0; k < 5; k++) g.fillRect(Math.round(o.x - Math.sign(o.vx) * k * 3) - cx, Math.round(o.y - 14 + k * 3) - cy, 3, 14 - k * 3);
        }
      } else if (o.k === 'glyph') {
        const r = o.r, on = o.t >= o.delay;
        if (sprRect('fx_glyph_ring', 0)) spr(g, 'fx_glyph_ring', o.x - 24 - cx, o.y - 9 - cy, ((t * 14) | 0) % 4);
        else {
          g.fillStyle = on ? PIX.rune5 : PIX.rune3;
          for (let x = -r; x <= r; x += 4) g.fillRect(Math.round(o.x + x) - cx, Math.round(o.y) - 2 - cy, 3, 2);
        }
        if (on) {
          const bf = Math.min(2, ((o.t - o.delay) / .09) | 0);
          if (sprRect('fx_glyph_beam', 0)) spr(g, 'fx_glyph_beam', o.x - 13 - cx, o.y - 86 - cy, bf);
          else g.fillRect(Math.round(o.x) - 2 - cx, Math.round(o.y) - 86 - cy, 4, 84);
          if (o.encore && sprRect('fx_note', 0)) {
            const lift = Math.round((o.t - o.delay) * 110);
            spr(g, 'fx_note', Math.round(o.x - 8 - cx), Math.round(o.y - 34 - lift - cy), 0);
            spr(g, 'fx_note', Math.round(o.x - 24 - cx), Math.round(o.y - 20 - lift * .7 - cy), 1);
            spr(g, 'fx_note', Math.round(o.x + 10 - cx), Math.round(o.y - 22 - lift * .8 - cy), 2);
          }
        }
      }
    }
    // Gauntlets Counter-Parry Stance aura
    if (this.stanceT > 0 && this.act === 'special') {
      const px = Math.round(P.x + P.w / 2 - cx), py = Math.round(P.y + P.h / 2 - cy);
      for (let k = 0; k < 6; k++) {
        const a = t * 7 + k * Math.PI / 3;
        g.fillStyle = (k & 1) ? PIX.gold4 : palHex('ember4');
        g.fillRect(Math.round(px + Math.cos(a) * 15) - 1, Math.round(py + Math.sin(a) * 18) - 1, 2, 2);
      }
    }
    // Heavy / Special Charge rising energy motes
    if (this.act === 'charge') {
      const px = Math.round(P.x + P.w / 2 - cx), py = Math.round(P.y + P.h - cy);
      const n = this.cued ? 6 : 3;
      for (let k = 0; k < n; k++) {
        const ph = (t * 3.4 + k / n) % 1;
        const mx = px + Math.round(Math.sin(t * 9 + k * 2.1) * 11);
        const my = py - 2 - Math.round(ph * 34);
        g.fillStyle = this.cued ? ((k & 1) ? PIX.gold4 : PIX.rune5) : PIX.rune3;
        g.fillRect(mx, my, this.cued ? 2 : 1, this.cued ? 2 : 1);
      }
    }
    for (let i = 0; i < this.nums.length; i++) { const n = this.nums[i]; if (n.t > .6 && ((t * 20) | 0) & 1) continue; g.drawImage(n.c, Math.round(n.x) - cx - (n.c.width >> 1), Math.round(n.y) - cy); }
  }
};

/* ---------------- the fight HUD: stamina, the weapon in hand, the thumb buttons ---------------- */
(function buildFightUI() {
  const f = el('fight');
  const t = el('timing'); if (t) t.remove();                                    // the timing needle is gone
  const kh = f.querySelector('.keyhint'); if (kh) kh.remove();
  const bar = document.createElement('div'); bar.className = 'cbar'; bar.setAttribute('data-noi18n', '');
  bar.innerHTML = '<div id="wpNow"></div><div class="stam" id="stamBar" role="img"><i id="stamFill"></i></div>';
  f.appendChild(bar);
  const say = document.createElement('div'); say.id = 'fightSay'; say.setAttribute('data-noi18n', ''); f.appendChild(say);
  const hint = document.createElement('div'); hint.id = 'fightHint'; hint.setAttribute('data-noi18n', ''); f.appendChild(hint);
  const keys = document.createElement('div'); keys.className = 'keyhint'; keys.id = 'fightKeys'; keys.setAttribute('data-noi18n', ''); f.appendChild(keys);

  // thumb buttons: one cluster, shown only during the fight (CSS: #stage.fighting)
  const ICON = {
    attack: '<path d="M4 20l3-1 11-11 1-4-4 1L4 17zM6 15l3 3"/>',
    heavy: '<path d="M5 20l8-8M10 5l9 9-3 3-9-9zM16 3l5 5"/>',
    dodge: '<path d="M3 12h13M11 6l6 6-6 6M20 5v14"/>',
    guard: '<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/>',
    swap: ''
  };
  const c = document.createElement('div'); c.className = 'cmb'; c.setAttribute('data-noi18n', '');
  ['guard', 'heavy', 'swap', 'dodge', 'attack'].forEach((k) => {
    const b = document.createElement('button'); b.dataset.cb = k; b.className = 'cb-' + k;
    b.innerHTML = ICON[k] ? '<svg viewBox="0 0 24 24" aria-hidden="true">' + ICON[k] + '</svg>' : '';
    const dn = (e) => { e.preventDefault(); e.stopPropagation(); Sound.resume(); b.classList.add('dn'); Combat.press(k); };
    const up = (e) => { e.preventDefault(); b.classList.remove('dn'); Combat.release(k); };
    b.addEventListener('pointerdown', dn); b.addEventListener('pointerup', up); b.addEventListener('pointercancel', up); b.addEventListener('pointerleave', up);
    c.appendChild(b);
  });
  el('touch').appendChild(c);
})();
const FightUI = {
  labels() {
    const n = { attack: 'ui.btn.attack', heavy: 'ui.btn.heavy', dodge: 'ui.btn.dodge', guard: 'ui.btn.guard', swap: 'ui.btn.swap' };
    document.querySelectorAll('#touch .cmb button').forEach((b) => { const s = tr(n[b.dataset.cb]); b.title = s; b.setAttribute('aria-label', s); });
    const k = el('fightKeys');
    if (k) k.innerHTML = [['J', 'attack'], ['K', 'heavy'], ['L', 'dodge'], ['I', 'guard'], ['Q', 'swap']].map(([key, id]) => '<span><kbd>' + key + '</kbd> ' + tr(n[id]) + '</span>').join('');
    const sb = el('stamBar'); if (sb) sb.setAttribute('aria-label', tr('ui.stamina'));
    Arsenal.hud();
  },
  sync() {
    const s = el('stamFill'); if (s) { s.style.transform = 'scaleX(' + clamp(Combat.stam / Combat.STAM, 0, 1) + ')'; s.parentNode.classList.toggle('low', Combat.stam < 22); }
  },
  hint(id) { const h = el('fightHint'); if (!h) return; if (!id) { h.className = ''; return; } h.textContent = tr('ui.hint.' + id); h.className = 'on h-' + id; }
};
document.addEventListener('langchange', () => FightUI.labels());

/* ---------------- keyboard and gamepad ---------------- */
const CB_KEYS = { KeyJ: 'attack', KeyK: 'heavy', KeyL: 'dodge', ShiftLeft: 'dodge', ShiftRight: 'dodge', KeyI: 'guard', KeyQ: 'swap' };
document.addEventListener('keydown', (e) => {
  const b = CB_KEYS[e.code]; if (!b || e.repeat) return;
  const tag = (e.target && e.target.tagName) || ''; if (tag === 'INPUT' || tag === 'TEXTAREA') return;
  if (G.scene === 'boss' || (G.scene === 'world' && Combat.on())) { e.preventDefault(); Combat.press(b); }
});
document.addEventListener('keyup', (e) => { const b = CB_KEYS[e.code]; if (b) Combat.release(b); });

const Pad = {
  prev: [], ax: 0,
  MAP: { 2: 'attack', 3: 'heavy', 1: 'dodge', 4: 'guard', 5: 'guard', 6: 'guard', 7: 'heavy', 12: 'swap' },
  poll() {
    if (!navigator.getGamepads) return;
    let p = null; const all = navigator.getGamepads();
    for (let i = 0; i < all.length; i++) if (all[i] && all[i].connected) { p = all[i]; break; }
    if (!p) { if (this.live) { this.live = false; Keys.left = Keys.right = false; } return; }
    this.live = true;
    const dn = (i) => !!(p.buttons[i] && p.buttons[i].pressed), was = this.prev;
    const x = Math.abs(p.axes[0] || 0) > .35 ? Math.sign(p.axes[0]) : dn(14) ? -1 : dn(15) ? 1 : 0;
    if (x !== this.ax) { Keys.left = x < 0; Keys.right = x > 0; this.ax = x; }
    for (let i = 0; i < 16; i++) {
      const d = dn(i), w = !!was[i]; if (d === w) continue; was[i] = d;
      if (i === 0) { if (d) { if (G.scene === 'boss' && !Dlg.on || G.scene === 'world' && !G._near) { Keys.jumpEdge = true; Keys.jump = true; } else action(); } else Keys.jump = false; continue; }
      if (i === 9 && d) { if (G.scene === 'pause') closePause(); else openPause(); continue; }
      const b = this.MAP[i]; if (!b) continue;
      if (G.scene === 'boss' && !Dlg.on || G.scene === 'world' && Combat.on() && !(i === 2 && G._near)) { if (d) Combat.press(b); else Combat.release(b); }
      else if (d && i === 2) action();
    }
  }
};

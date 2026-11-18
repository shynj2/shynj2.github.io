/* ==========================================================================
   THE KEEPER — the fight from his side (Round 9 §8.2, §8.3).

   Three phases by health (PHASE_AT), then the terminal phase (69-override.js).
   He is a small state machine:   idle → tele (the warning) → act (the blow) → rec (he is open) → idle
                                  stagger (his stance broke) · phase (he speaks, then the great attack)
   Every attack is one entry of BATK:
     ph     first phase it appears in          pose   his animation (art-src/rigs/shyn/clips.mjs)
     tele   seconds of warning                 act    seconds the attack lasts        rec   seconds he stands open afterwards
     kind   'parry' can be guarded · 'unblock' cannot (red mark) · 'area' move away · 'stance' do not strike
     hint   the word shown to a visitor who accepted the lighter fight (ui.hint.*)
     w(c)   how much he wants it right now. c is what he has read: distance, weapon, habits (Boss.read)
     fire   what happens when the warning ends
   Things that hurt are plain boxes in BOSS.haz (Fight.add): { k, x, y, w, h, warn, life, dmg, parry, unblock, vx, vy }.
   ========================================================================== */
const BOSS_HP = 840, PHASE_AT = [1, .72, .45, .22];      // phase i lasts from PHASE_AT[i] down to PHASE_AT[i + 1] of his health; below .28: the terminal
// (the offer at ten defeats is gone: RE-sync joins at ALLY_AT defeats instead, 68-ally.js)
const BOSS = {
  active: false, state: 'idle', phase: 0, x: 560, pose: 'idle', orbs: [], dead: false,
  hp: BOSS_HP, max: BOSS_HP, poise: 100, poiseMax: 100, poiseWait: 0, t: 0, wait: 1, atk: null, face: -1,
  hide: false, lift: 0, inv: false, flash: 0, repose: 0, mark: null, cue: null, dashV: 0, dashT: 0,
  haz: [], minions: [], sched: [], last: [], aggr: 1, bleedN: 0, bleedT: 0, bleedTick: 0,
  eased: false, frozen: false, ov: false, cp: 0, clock: 0, hits: 0, log: []
};

const BATK = {
  /* ground slashes */
  slash: { ph: 0, pose: 'slash', tele: .50, act: .20, rec: .70, kind: 'parry', hint: 'guard',
    w: (c) => (c.d < 100 ? 3 : 0),
    fire(b) { Fight.melee(b, 88, 1); } },
  combo: { ph: 1, pose: 'slash', tele: .42, act: .82, rec: .80, kind: 'parry', hint: 'guard',
    w: (c) => (c.d < 130 ? 2.4 : 0),
    fire(b) {
      Fight.melee(b, 88, 1);
      Fight.later(.38, () => { b.x = clamp(b.x + b.face * 44, 40, World.W - 40); b.repose = 1; Sound.warn(false); });
      Fight.later(.62, () => Fight.melee(b, 94, 1));
    } },
  /* rune projectiles: a low one is jumped, a high one is walked under */
  bolt: { ph: 0, pose: 'cast', tele: .55, act: .50, rec: .55, kind: 'parry', hint: 'jump',
    w: (c) => (c.d > 110 ? (c.d > 220 ? 3 : 2) * (c.ranged ? .5 : 1) : .3),
    fire(b) { const n = 1 + b.phase; for (let i = 0; i < n; i++) Fight.later(i * .30, () => Fight.bolt(b, i % 2 === 1)); } },
  /* area denial from above: aimed where the visitor will be */
  orbs: { ph: 0, pose: 'summon', tele: .50, act: 1.5, rec: .50, kind: 'area', hint: 'away',
    w: (c) => (c.d > 150 ? 1.6 : .8) * (c.still > 1.2 ? 2 : 1),
    fire(b) { const n = 3 + b.phase; for (let i = 0; i < n; i++) Fight.later(i * (.46 - b.phase * .06), () => Fight.orb(i % 2 === 1 && b.phase > 0)); } },
  /* hapkido: the throw. It cannot be guarded — a visitor who hides behind a guard meets it more often */
  grab: { ph: 0, pose: 'throw', tele: .65, act: .28, rec: .95, kind: 'unblock', hint: 'dodge',
    w: (c) => (c.d < 150 ? 1.3 : 0) * (1 + Math.min(2, c.guard)),
    fire(b) {
      b.dashV = b.face * 420; b.dashT = .26;
      Fight.add({ k: 'grab', follow: 1, w: 34, h: 60, warn: 0, life: .28, dmg: 1, unblock: true,
        onHit() { P.vx = b.face * 400; P.vy = -300; Combat.stun = .7; Sound.land(); } });
    } },
  /* teleport-strike: he steps out of the picture and returns behind the visitor (on the side they like to dodge to) */
  blink: { ph: 1, pose: 'cast', tele: .45, act: .78, rec: .80, kind: 'parry', hint: 'dodge',
    w: (c) => (c.d > 120 ? 1.6 : .6) * (c.ranged ? 2.2 : 1) * (c.away > c.tow + 1 ? 1.5 : 1),
    fire(b, c) {
      const side = c.lastDodge || -c.side, tx = clamp(c.pcx + side * 62, 44, World.W - 44);
      b.hide = true; b.mark = { x: tx }; Sound.blink(); burst(b.x, World.groundNear(b.x) - 50, 'rgba(190,140,255,', 18, 120);
      Fight.later(.38, () => { b.x = tx; b.hide = false; b.mark = null; b.face = P.x + P.w / 2 < b.x ? -1 : 1; b.pose = 'slash'; b.repose = 1; Sound.warn(false); });
      Fight.later(.70, () => Fight.melee(b, 88, 1));
    } },
  /* area denial on the floor: under the visitor and where they would step to */
  fire: { ph: 1, pose: 'summon', tele: .60, act: .30, rec: .50, kind: 'area', hint: 'away',
    w: (c) => 1.2 * (c.still > 1.2 ? 2 : 1) * (c.ranged ? 1.5 : 1),
    fire(b, c) {
      const gy = World.groundNear(c.pcx), at = [c.pcx, c.pcx + (c.lastDodge || c.side) * 112];
      if (b.phase > 1) at.push(c.pcx - (c.lastDodge || c.side) * 150);
      at.forEach((x) => Fight.add({ k: 'fire', x: clamp(x, 50, World.W - 50) - 34, y: gy - 22, w: 68, h: 22, warn: .85, life: 2.6, dmg: 1 }));
    } },
  /* iaido: the draw. A long stillness, a line across the floor, then he is on the other side */
  draw: { ph: 1, pose: 'draw', tele: .85, act: .25, rec: 1.0, kind: 'parry', hint: 'jump',
    w: (c) => (c.d > 90 ? 1.8 * (c.away > c.tow ? 1.4 : 1) : .4),
    warn(b, c, tele) {
      const gy = World.groundNear(b.x); b.drawTo = clamp(c.pcx + b.face * 130, 50, World.W - 50);
      Fight.add({ k: 'beam', x: Math.min(b.x, b.drawTo), y: gy - 22, w: Math.abs(b.drawTo - b.x), h: 20, warn: tele, life: .14, dmg: 2, parry: true });
    },
    fire(b) { burst(b.x, World.groundNear(b.x) - 40, 'rgba(255,240,200,', 14, 160); b.x = b.drawTo; b.face = -b.face; b.repose = 1; Sound.cut(true); G.shake = Math.max(G.shake, Calm() ? 2 : 6); } },
  /* the rune glitch: the hall is cut into bands and most of them are corrupted; the band beside the visitor stays clean */
  glitch: { ph: 2, pose: 'super', tele: .50, act: 1.5, rec: .70, kind: 'area', hint: 'away',
    w: () => 1.5,
    fire(b, c) {
      const n = 6, x0 = 16, bw = (World.W - 32) / n, mine = clamp(Math.floor((c.pcx - x0) / bw), 0, n - 1), gy = World.groundNear(c.pcx);
      const near = mine === 0 ? 1 : mine === n - 1 ? n - 2 : mine + (Math.random() < .5 ? -1 : 1);
      let far = (near + 3) % n; if (far === mine) far = (far + 1) % n;
      for (let i = 0; i < n; i++) if (i !== near && i !== far) Fight.add({ k: 'col', x: x0 + i * bw, y: gy - 220, w: bw, h: 220, warn: .95, life: .5, dmg: 1 });
      Sound.crush();
    } },
  /* hapkido again: he waits. Used when the visitor only hammers the attack button */
  counter: { ph: 0, pose: 'counter', tele: .25, act: 1.1, rec: .50, kind: 'stance', hint: 'wait',
    w: (c) => (c.spam >= 4 && c.d < 110 ? 5 : 0),
    fire() {} },
  /* summons: two sentinels that each loose a bolt; one blow removes them */
  summon: { ph: 1, pose: 'summon', tele: .60, act: .40, rec: .50, kind: 'area', hint: 'jump',
    w: (c) => (BOSS.minions.length ? 0 : c.d > 160 ? 1.5 : .7),
    fire(b, c) {
      const gy = World.groundNear(b.x);
      [-1, 1].forEach((s) => b.minions.push({ x: clamp(c.pcx + s * 150, 60, World.W - 60), y: gy - 70, t: 0, shots: b.phase > 1 ? 2 : 1 }));
      Sound.rune();
    } },
  /* ---- the additions of 18 Nov: three more ways into the same visitor ---- */
  /* the forge rain: a row of falling cinders, all but one line of floor (a wide safe pocket, not a corridor) */
  rain: { ph: 1, pose: 'cast', tele: .70, act: 1.4, rec: .60, kind: 'area', hint: 'away',
    w: (c) => (c.still > .9 ? 1.5 : .9) * (c.d > 120 ? 1.2 : .8),
    fire(b, c) {
      const n = 5 + b.phase, x0 = 18, bw = (World.W - 36) / n, mine = clamp(Math.floor((c.pcx - x0) / bw), 0, n - 1), gy = World.groundNear(c.pcx);
      const safe = mine === 0 ? 1 : mine === n - 1 ? n - 2 : mine + (Math.random() < .5 ? -1 : 1);
      for (let i = 0; i < n; i++) if (i !== mine && i !== safe) Fight.later(i * .1, () => Fight.add({ k: 'orb', x: x0 + i * bw + bw / 2, y: G.camY - 30, vy: 470, ground: gy, dmg: 1, warn: .55, life: 4 }));
      Sound.rune();
    } },
  /* the cross: his blade cuts both ways at once, so the side you dodge to is already covered */
  cross: { ph: 1, pose: 'slash', tele: .55, act: .55, rec: .85, kind: 'parry', hint: 'jump',
    w: (c) => (c.away > c.tow + 1 ? 1.8 : .7) * (c.d < 220 ? 1.2 : .6),
    fire(b) {
      Fight.melee(b, 96, 1);
      Fight.later(.22, () => { b.face = -b.face; b.repose = 1; Sound.warn(false); Fight.melee(b, 104, 1); });
      if (b.phase > 1) Fight.later(.46, () => { Fight.melee(b, 90, 1); Sound.cut(true); G.shake = Math.max(G.shake, Calm() ? 2 : 5); });
    } },
  /* the pen: he writes a name on the floor and the floor closes over it. Two sigils, 1.5 s apart */
  pen: { ph: 2, pose: 'draw', tele: .65, act: .30, rec: .80, kind: 'area', hint: 'away',
    w: (c) => (c.still > 1.1 ? 2 : 1.1),
    warn(b, c) {
      const gy = World.groundNear(c.pcx);
      b.penAt = [c.pcx, c.pcx + (c.lastDodge || c.side) * 90];
      b.penAt.forEach((x) => Fight.add({ k: 'pit', x: clamp(x, 50, World.W - 50) - 30, y: gy - 2, w: 60, h: 22, warn: 1.05, life: .9, dmg: 2, parry: false }));
    },
    fire(b) { Sound.crush(); G.shake = Math.max(G.shake, Calm() ? 2 : 6); } },
  /* the silent signal: he waits for the dodge, then cuts where it lands */
  wait: { ph: 2, pose: 'counter', tele: .30, act: .90, rec: .50, kind: 'stance', hint: 'wait',
    w: (c) => ((c.away > c.tow + 2 || c.spam >= 5) && c.d < 150 ? 2.6 : (c.d < 120 && c.still < .35 ? 1.2 : 0)),
    fire(b, c) {
      Fight.later(.34, () => { const tx = clamp(c.pcx + (c.lastDodge || c.side) * 70, 44, World.W - 44); b.x = tx - b.face * 60; b.dashV = b.face * 300; b.dashT = .2; Sound.blink(); });
      Fight.later(.52, () => Fight.melee(b, 100, 2));
      Fight.later(.90, () => Fight.melee(b, 96, 1));
    } },
  /* the great attack that opens a new phase (never picked by chance) */
  super: { ph: 9, pose: 'super', tele: 1.0, act: 2.4, rec: 1.3, kind: 'area', hint: 'jump',
    w: () => 0,
    fire(b) {
      const gy = World.groundNear(b.x);
      [-1, 1].forEach((s) => Fight.add({ k: 'wave', x: b.x + s * 24 - 7, y: gy - 14, w: 14, h: 14, vx: s * 230, warn: 0, life: 3.2, dmg: 1 }));
      G.shake = Math.max(G.shake, Calm() ? 3 : 10); Sound.crash();
      for (let i = 0; i < 4 + b.phase; i++) Fight.later(.5 + i * .34, () => Fight.orb(i % 2 === 1));
    } }
};

const Fight = {
  /** fromPhase: 0..2 an ordinary phase, 3 the terminal phase (a retry starts in the phase where the visitor fell) */
  setup(fromPhase) {
    const b = BOSS;
    b.eased = !!G.flags.eased; b.max = Math.round(BOSS_HP * (b.eased ? .75 : 1));
    b.cp = fromPhase | 0; b.phase = Math.min(2, b.cp); b.hp = Math.round(b.max * PHASE_AT[Math.min(3, b.cp)]);
    b.poiseMax = 100 + b.phase * 20; b.poise = b.poiseMax; b.state = 'idle'; b.t = 0; b.atk = null; b.dead = false; b.ov = false;
    b.poiseWait = 0; b.wait = 1; b.flash = 0; b.repose = 0; b.dashV = 0; b.dashT = 0; b.bleedT = 0; b.bleedTick = 0; b.pose = 'idle';
    b.haz.length = b.minions.length = b.sched.length = b.last.length = b.orbs.length = 0;
    if (typeof BossMusic !== 'undefined' && G.flags.sound !== false) BossMusic.start();   // the score follows his phase (22-boss-violin.js)
    b.hide = false; b.lift = 0; b.inv = false; b.mark = null; b.cue = null; b.bleedN = 0; b.aggr = 1; b.frozen = false; b.clock = 0; b.hits = 0;
    Combat.reset(); bossSync(); Ally.start();
    el('stage').classList.add('fighting'); FightUI.labels(); FightUI.hint(null);
  },
  end() {
    const b = BOSS;
    b.active = false; b.state = 'idle'; b.atk = null; b.frozen = false;
    b.haz.length = b.minions.length = b.sched.length = b.orbs.length = 0; b.hide = false; b.lift = 0; b.mark = null; b.cue = null;
    el('fight').classList.remove('on'); el('stage').classList.remove('fighting');
    if (typeof Override !== 'undefined') Override.off();
    FightUI.hint(null); Combat.reset(); Ally.stop();
    if (Combat.grav0) PHYS.grav = Combat.grav0;
  },
  add(h) { h.t = 0; h.hit = false; BOSS.haz.push(h); return h; },
  later(s, f) { BOSS.sched.push({ at: BOSS.clock + s, f }); },
  /** his sweep: a box in front of him for an instant */
  melee(b, reach, dmg) {
    const gy = World.groundNear(b.x);
    Fight.add({ k: 'slash', x: b.face > 0 ? b.x + 6 : b.x - 6 - reach, y: gy - 66, w: reach, h: 66, warn: 0, life: .14, dmg, parry: true, face: b.face });
    Sound.swing(true);
  },
  bolt(b, high, aim) {
    const gy = World.groundNear(b.x), y = gy - (high ? 56 : 20);
    const h = Fight.add({ k: 'bolt', x: b.x + b.face * 26 - 6, y, w: 12, h: 12, vx: b.face * (220 + b.phase * 20), vy: 0, warn: 0, life: 4, dmg: 1, parry: true, bolt: true, high });
    if (aim) { h.vx = aim[0]; h.vy = aim[1]; }
    Sound.orb(); return h;
  },
  /* An orb is aimed: it lands where the Recruiter will be when it arrives (their speed x the time of the fall).
     pair = true: it falls where they are now, or beside them if they stand, so stopping dead is answered too. */
  orb(pair, atX) {
    const me = P.x + P.w / 2, y0 = G.camY - 27, vy = 440, ground = World.groundNear(me), fall = Math.max(.2, (ground - 13 - y0) / vy);
    let tx = atX != null ? atX : me + P.vx * fall;
    if (pair && atX == null) tx = Math.abs(P.vx) > 30 ? me : me + (Math.random() < .5 ? -1 : 1) * 56;
    tx = clamp(tx, 24, World.W - 24);
    Fight.add({ k: 'orb', x: tx, y: y0, vy, ground, dmg: 1, warn: 0, life: 9 });
    Sound.orb();
  },

  /* ---------------- every frame ---------------- */
  update(dt) {
    const b = BOSS; if (!b.active) return;
    if (b.flash > 0) b.flash -= dt;
    FightUI.sync();
    if (Dlg.on || b.frozen) return;
    b.clock += dt; b.t += dt;
    for (let i = b.sched.length - 1; i >= 0; i--) if (b.sched[i].at <= b.clock) { const f = b.sched[i].f; b.sched.splice(i, 1); f(); if (!b.active) return; }
    Fight.hazards(dt); if (!b.active) return;
    Fight.sentinels(dt);
    // bleeding (Twin Daggers)
    if (b.bleedN > 0) { b.bleedT -= dt; b.bleedTick -= dt; if (b.bleedTick <= 0) { b.bleedTick = .5; Boss.take(.7 * b.bleedN, 0, { dot: true }); } if (b.bleedT <= 0) b.bleedN = 0; }
    if (b.poiseWait > 0) b.poiseWait -= dt; else if (b.state !== 'stagger') b.poise = Math.min(b.poiseMax, b.poise + 14 * dt);
    if (b.ov) { Override.update(dt); return; }
    Boss.think(dt);
  },
  hazards(dt) {
    const hz = BOSS.haz, px0 = P.x, py0 = P.y, px1 = P.x + P.w, py1 = P.y + P.h;
    for (let i = hz.length - 1; i >= 0; i--) {
      const h = hz[i]; h.t += dt;
      if (h.k === 'orb') {
        h.y += h.vy * dt;
        if (h.y >= h.ground - 13) {
          burst(h.x, h.ground - 6, 'rgba(190,140,255,', 16, 90); burst(h.x, h.ground - 4, 'rgba(255,220,180,', 8, 60);
          G.shake = Math.max(G.shake, Calm() ? 1 : 4); Sound.land();
          hz.splice(i, 1);
          if (Math.abs((P.x + P.w / 2) - h.x) < 23 && (P.y + P.h) > h.ground - 27) { Combat.hurt({ dmg: h.dmg, x: h.x, unblock: true }); if (!BOSS.active) return; }
        }
        continue;
      }
      const live = h.t >= h.warn;
      if (h.follow) { const gy = World.groundNear(BOSS.x); h.x = BOSS.face > 0 ? BOSS.x + 4 : BOSS.x - 4 - h.w; h.y = gy - h.h; }
      if (live || h.fly) { h.x += (h.vx || 0) * dt; h.y += (h.vy || 0) * dt; if (h.stopAt != null && (h.vx > 0 ? h.x >= h.stopAt : h.x <= h.stopAt)) { h.x = h.stopAt; h.vx = 0; } }
      if (h.reflect && !h.mine) { h.mine = true; h.vx = -h.vx * 1.4; h.vy = 0; h.hit = true; }
      if (h.mine) {
        if (Boss.touch(h.x, h.y, h.x + h.w, h.y + h.h)) { Boss.take(h.reflectDmg || 14, 30, { melee: false, parry: true, wp: Arsenal.cur() }); hz.splice(i, 1); continue; }
      } else if (live && !h.hit && h.x < px1 && h.x + h.w > px0 && h.y < py1 && h.y + h.h > py0 && !(h.k === 'pit' && !P.onGround)) {
        h.from = h.k === 'slash' || h.k === 'grab' ? BOSS.x : h.x + h.w / 2;
        const r = Combat.hurt(h);
        if (!BOSS.active) return;
        if (r !== 'miss') { h.hit = true; if (r === 'hit' && h.onHit) h.onHit(); if (h.bolt && !h.reflect) { hz.splice(i, 1); continue; } }
      }
      if (h.t >= h.warn + h.life || h.x > World.W + 40 || h.x + h.w < -40) hz.splice(i, 1);
    }
  },
  sentinels(dt) {
    const ms = BOSS.minions;
    for (let i = ms.length - 1; i >= 0; i--) {
      const m = ms[i]; m.t += dt;
      const due = m.t >= 1.25 + (m.fired | 0) * 1.0;
      if (due && (m.fired | 0) < m.shots) {
        m.fired = (m.fired | 0) + 1;
        const dx = P.x + P.w / 2 - m.x, dy = P.y + 16 - m.y, d = Math.hypot(dx, dy) || 1;
        Fight.add({ k: 'bolt', x: m.x - 6, y: m.y - 6, w: 12, h: 12, vx: dx / d * 210, vy: dy / d * 210, warn: 0, life: 3, dmg: 1, parry: true, bolt: true });
        Sound.orb();
      }
      if (m.t > 1.25 + m.shots * 1.0 + .4) { burst(m.x, m.y, 'rgba(190,140,255,', 8, 60); ms.splice(i, 1); }
    }
  },

  /* ---------------- drawing: after the light pass, so everything here glows ---------------- */
  draw(g, cx, cy, t) {
    const b = BOSS, term = typeof Override !== 'undefined' && Override.term;
    const cWarn = term ? '#ff5d7a' : PIX.ember3, cHot = term ? '#7dffb0' : PIX.rune5, cMid = term ? '#39c27a' : PIX.rune3, cGold = term ? '#d8ffe6' : PIX.gold4;
    const tick = (t * 12) | 0;
    for (let i = 0; i < b.haz.length; i++) {
      const h = b.haz[i], x = Math.round(h.x) - cx, y = Math.round(h.y) - cy, live = h.t >= h.warn;
      if (h.k === 'orb') {
        spr(g, 'fx_warn', h.x - 17 - cx, h.ground - 6 - cy, (t * 10) | 0);
        if (term && h.glyph) { g.fillStyle = cHot; g.fillRect(Math.round(h.x) - 1 - cx, Math.round(h.y) - 22 - cy, 3, 26); g.fillRect(Math.round(h.x) - 4 - cx, Math.round(h.y) - 20 - cy, 9, 2); g.fillStyle = cMid; g.fillRect(Math.round(h.x) - cx, Math.round(h.y) - 44 - cy, 1, 20); }
        else { spr(g, 'fx_orbtrail', h.x - 2 - cx, h.y - 24 - cy, tick); spr(g, 'fx_orb', h.x - 7 - cx, h.y - 7 - cy, (t * 14) | 0); }
      } else if (h.k === 'slash') {
        spr(g, h.face > 0 ? 'fx_bslash' : 'fx_bslash_l', (h.face > 0 ? b.x + 2 : b.x - 90) - cx, y + 66 - 96 + 10, Math.min(2, (h.t / .05) | 0));
      } else if (h.k === 'bolt') {
        spr(g, 'fx_orb', x - 1, y - 1, (t * 14) | 0); g.fillStyle = h.mine ? cGold : cMid; g.fillRect(x + 6 - Math.sign(h.vx) * 14, y + 6, 8, 1);
      } else if (h.k === 'fire') {
        if (!live) { if (tick & 1) { g.fillStyle = cWarn; for (let k = 0; k < h.w; k += 6) g.fillRect(x + k, y + h.h - 2, 4, 2); } }
        else { for (let k = 0; k < h.w; k += 4) { const fh = 6 + ((hash2(k, tick, 3) * (h.h - 4)) | 0); g.fillStyle = (k + tick) & 4 ? cHot : cMid; g.fillRect(x + k, y + h.h - fh, 3, fh); } }
      } else if (h.k === 'wave') {
        g.fillStyle = cHot; for (let k = 0; k < 4; k++) g.fillRect(x + (h.vx > 0 ? 10 - k * 3 : k * 3), y + k * 3 + ((tick + k) & 1), 4, h.h - k * 3);
      } else if (h.k === 'col' || h.k === 'wall') {
        if (!live && h.k === 'col') { if (tick % 3) { g.fillStyle = cWarn; g.fillRect(x, y + h.h - 3, Math.round(h.w), 3); for (let k = 8; k < h.h; k += 24) { g.fillRect(x + 1, y + k, 1, 10); g.fillRect(x + Math.round(h.w) - 2, y + k, 1, 10); } } }
        else Dither.fill(g, x, y, Math.round(h.w), h.h, h.k === 'wall' ? cMid : cHot, h.k === 'wall' ? .75 : (tick & 1 ? .55 : .4));
        if (h.k === 'wall') { g.fillStyle = cHot; g.fillRect(h.vx >= 0 && h.side < 0 ? x + Math.round(h.w) - 2 : x, y, 2, h.h); }
      } else if (h.k === 'beam') {
        if (!live) { g.fillStyle = h.t > h.warn - .25 ? cGold : cWarn; for (let k = (tick & 1) * 6; k < h.w; k += 12) g.fillRect(x + k, y + (h.h >> 1), 6, 1); }
        else { g.fillStyle = cGold; g.fillRect(x, y + (h.h >> 1) - 2, Math.round(h.w), 4); g.fillStyle = cHot; g.fillRect(x, y + (h.h >> 1) - 4, Math.round(h.w), 1); g.fillRect(x, y + (h.h >> 1) + 3, Math.round(h.w), 1); }
      } else if (h.k === 'pit') {
        g.fillStyle = live ? '#020104' : cWarn;
        if (live) g.fillRect(x, y + h.h - 2, Math.round(h.w), 12); else if (tick & 1) for (let k = 0; k < h.w; k += 8) g.fillRect(x + k, y + h.h - 2, 5, 2);
      } else if (h.k === 'popup') {
        g.fillStyle = live ? cWarn : '#12060c'; g.fillRect(x, y, Math.round(h.w), h.h);
        g.fillStyle = live ? '#12060c' : cWarn; g.fillRect(x + 1, y + 1, Math.round(h.w) - 2, 8); g.fillRect(x, y, Math.round(h.w), 1); g.fillRect(x, y + h.h - 1, Math.round(h.w), 1); g.fillRect(x, y, 1, h.h); g.fillRect(x + Math.round(h.w) - 1, y, 1, h.h);
        if (h.label) g.drawImage(h.label, x + 4, y + 2); if (h.label2 && (live || tick & 1)) g.drawImage(h.label2, x + 4, y + 14);
      } else if (h.k === 'grab') {
        g.fillStyle = cWarn; g.fillRect(h.x + (b.face > 0 ? h.w - 4 : 0) - cx, y + 14, 4, 4);
      }
    }
    for (let i = 0; i < b.minions.length; i++) {
      const m = b.minions[i], bob = Math.round(Math.sin(m.t * 5) * 2), x = Math.round(m.x) - cx, y = Math.round(m.y) - cy + bob, hot = m.t > .9 + (m.fired | 0) && (tick & 1);
      g.fillStyle = hot ? cGold : cHot; g.fillRect(x - 2, y - 6, 4, 12); g.fillRect(x - 6, y - 2, 12, 4);
      g.fillStyle = cMid; g.fillRect(x - 4, y - 4, 8, 8); g.fillStyle = hot ? cWarn : cHot; g.fillRect(x - 1, y - 1, 3, 3);
    }
    if (b.mark) spr(g, 'fx_warn', b.mark.x - 17 - cx, World.groundNear(b.mark.x) - 6 - cy, (t * 10) | 0);
    if (b.cue && !b.hide && (b.state === 'tele') && (tick & 1 || b.cue === 'stance')) {         // the mark over his head: red cannot be guarded, gold can, violet = move, white = wait
      const c = b.cue === 'unblock' ? cWarn : b.cue === 'parry' ? cGold : b.cue === 'stance' ? '#f2e9dc' : cHot, x = Math.round(b.x) - cx, y = World.groundNear(b.x) - 116 - cy - (b.lift | 0);
      g.fillStyle = c; g.fillRect(x - 1, y, 3, 7); g.fillRect(x - 1, y + 9, 3, 3);
    }
    Combat.draw(g, cx, cy, t);
  }
};

const Boss = {
  /** does this box touch him? */
  touch(x0, y0, x1, y1) {
    const b = BOSS; if (!b.active || b.hide) return false;
    const gy = World.groundNear(b.x) - (b.lift | 0);
    return x1 > b.x - 20 && x0 < b.x + 20 && y1 > gy - 96 && y0 < gy;
  },
  strikeMinions(x0, y0, x1, y1) {
    const ms = BOSS.minions; let n = 0;
    for (let i = ms.length - 1; i >= 0; i--) { const m = ms[i]; if (m.x + 8 > x0 && m.x - 8 < x1 && m.y + 8 > y0 && m.y - 8 < y1) { burst(m.x, m.y, 'rgba(255,220,180,', 12, 100); ms.splice(i, 1); n++; Sound.cut(false); } }
    return n;
  },
  bleed(n) { BOSS.bleedN = Math.min(5, BOSS.bleedN + n); BOSS.bleedT = 4; },
  /** the Hapkido Gauntlets' throw: only when he is staggered or recovering */
  thrown(info) {
    const b = BOSS;
    if (b.state !== 'rec' && b.state !== 'stagger' && !(b.ov && b.state === 'ovtype')) return true;      // otherwise it lands as a plain strike
    const gy = World.groundNear(b.x); burst(b.x, gy - 40, 'rgba(255,240,200,', 20, 160); G.shake = Math.max(G.shake, Calm() ? 2 : 6); Sound.land();
    info.thrown = true; return true;
  },
  /** damage to the Keeper. Returns false when nothing landed (hidden, speaking, or he was waiting for exactly this). */
  take(dmg, poise, info) {
    const b = BOSS; info = info || {};
    dmg *= Arsenal.mult(info.wp || Arsenal.cur()) * Ally.mult();          // RE-sync's rewrites (66-resync.js) and his POWER command (68-ally.js)
    if (!b.active || b.inv || b.hide || b.frozen || b.state === 'phase' || b.state === 'dead') return false;
    if (b.state === 'act' && b.atk && b.atk.kind === 'stance' && info.melee && !(info.mv && info.mv.breaker)) {      // he was waiting: the blow is turned and the visitor is thrown
      Sound.parry(); b.pose = 'throw'; b.repose = 1; Combat.inv = 0; Combat.hurt({ dmg: 1, unblock: true, x: b.x });
      Combat.stop = .08; P.vx = (P.x + P.w / 2 < b.x ? -1 : 1) * 380; P.vy = -280; Combat.stun = .6; Combat.act = ''; Combat.mv = null;
      if (b.active) { b.state = 'rec'; b.t = 0; b.atk = { ...b.atk, rec: .6 }; }
      return false;
    }
    let k = 1;
    if (b.state === 'rec') k = (WEAPONS[info.wp] && WEAPONS[info.wp].punish) || 1.25;
    else if (b.state === 'stagger') k = 1.4;
    if (info.thrown) k *= 2;
    if (b.ov) k *= .6;
    const d = dmg * k, floor = b.ov ? 0 : Math.ceil(b.max * PHASE_AT[b.phase + 1]);
    b.hp = Math.max(floor, b.hp - d); b.flash = .09; b.hits++;
    if (!info.dot) {
      Combat.stop = Math.max(Combat.stop, info.heavy ? .09 : .045); G.shake = Math.max(G.shake, (info.heavy ? 5 : 2) * (Calm() ? .25 : 1)); Sound.cut(!!info.heavy);
      b.poiseWait = 2;
    }
    Combat.number(b.x, World.groundNear(b.x) - 104 - (b.lift | 0), Math.max(1, Math.round(d)), info.dot ? 'ember3' : k > 1 ? 'gold4' : 'bone4');
    bossSync();
    if (b.hp <= floor) { Boss.threshold(); return true; }
    if (poise && b.state !== 'stagger' && !(b.state === 'tele' && b.atk && b.atk === BATK.super)) {
      b.poise -= poise;
      if (b.poise <= 0) Boss.stagger();
    }
    return true;
  },
  stagger() {
    const b = BOSS;
    b.poise = b.poiseMax; b.sched.length = 0; b.hide = false; b.mark = null; b.lift = 0; b.dashT = 0;
    for (let i = b.haz.length - 1; i >= 0; i--) if (b.haz[i].k === 'slash' || b.haz[i].k === 'grab' || (b.haz[i].k === 'beam' && b.haz[i].t < b.haz[i].warn)) b.haz.splice(i, 1);
    b.state = b.ov ? 'ovstun' : 'stagger'; b.t = 0; b.pose = 'stagger'; b.repose = 1; b.cue = null;
    Combat.float(tr('ui.fight.stagger'), 'gold'); Sound.land(); FightUI.hint(b.eased ? 'strike' : null);
    burst(b.x, World.groundNear(b.x) - 60, 'rgba(255,240,200,', 18, 140);
  },
  /** his health reached the end of the phase */
  threshold() {
    const b = BOSS;
    b.sched.length = 0; b.haz.length = 0; b.minions.length = 0; b.hide = false; b.mark = null; b.cue = null; b.lift = 0; FightUI.hint(null);
    if (b.ov) { Override.crash(); return; }
    if (b.phase >= 2) { b.cp = 3; Override.begin(false); return; }
    b.phase++; b.cp = b.phase; b.poiseMax = 100 + b.phase * 20; b.poise = b.poiseMax; b.state = 'phase'; b.t = 0; b.pose = 'hurt'; b.repose = 1; b.atk = null;
    G.flash = .6; G.shake = Math.max(G.shake, Calm() ? 3 : 9); Sound.rune(); bossSync();
    Combat.act = ''; Combat.mv = null;
    setTimeout(() => {
      if (!b.active || b.state !== 'phase') return;
      b.pose = 'idle';
      Dlg.open(DC['shyn_p' + (b.phase + 1)], () => {
        G.scene = 'boss';
        if (!b.active) return;
        b.x = clamp(World.W / 2, 60, World.W - 60); b.face = P.x + P.w / 2 < b.x ? -1 : 1; Sound.blink();
        Boss.begin(BATK.super, 'super');
      });
    }, 650);
  },

  /* ---------------- what he reads, and how he chooses ---------------- */
  read() {
    const pcx = P.x + P.w / 2, s = Combat.seen, id = Arsenal.cur();
    return { pcx, d: Math.abs(BOSS.x - pcx), side: pcx < BOSS.x ? -1 : 1, spam: s.atk.length, guard: s.guard, still: s.still, tow: s.dodgeToward, away: s.dodgeAway,
      lastDodge: s.lastDodge, wp: id, ranged: id === 'staff', php: G.det, mash: s.press.length / 2, hurtAgo: G.time - s.hurtAt, facing: P.face };
  },
  pick(c) {
    const b = BOSS; let sum = 0; const opts = [];
    for (const id in BATK) {
      const a = BATK[id]; if (a.ph > b.phase) continue;
      let w = a.w(c); if (w <= 0) continue;
      if (b.last[0] === id) w *= .2; else if (b.last[1] === id) w *= .55;      // never a fixed loop
      if (b.phase === 2 && (id === 'glitch' || id === 'pen' || id === 'wait')) w *= 1.25;
      if (c.php <= 2 && a.kind === 'unblock') w *= .6;                         // a visitor on their last breath is not hunted with the one thing they cannot guard
      opts.push([id, w]); sum += w;
    }
    if (!opts.length) return 'slash';
    let r = Math.random() * sum;
    for (const [id, w] of opts) { r -= w; if (r <= 0) return id; }
    return opts[0][0];
  },
  begin(a, id) {
    const b = BOSS, c = Boss.read(), k = b.eased ? 1.4 : 1;
    b.atk = a; b.atkId = id; b.state = 'tele'; b.t = 0; b.tele = a.tele * k; b.pose = a.pose; b.repose = 1; b.cue = a.kind;
    b.face = c.side; b.last.unshift(id); b.last.length = Math.min(2, b.last.length); b.ctx = c;
    if (a === BATK.super) b.lift = 0;
    if (a.warn) a.warn(b, c, b.tele);
    Sound.warn(a.kind === 'unblock'); FightUI.hint(b.eased ? a.hint : null);
    b.log.push(id); if (b.log.length > 40) b.log.shift();
  },
  think(dt) {
    const b = BOSS, pcx = P.x + P.w / 2;
    if (b.dashT > 0) { b.dashT -= dt; b.x = clamp(b.x + b.dashV * dt, 40, World.W - 40); }
    if (b.state === 'intro') { if (b.t > .8) { b.state = 'idle'; b.t = 0; b.wait = .7; } return; }
    if (b.state === 'idle') {
      b.pose = 'idle'; b.face = pcx < b.x ? -1 : 1;
      const d = Math.abs(pcx - b.x), sp = 44 + b.phase * 12;
      if (d > 190) b.x += b.face * sp * dt; else if (d < 46) b.x -= b.face * sp * .6 * dt;      // he closes a long distance, and gives a little ground when crowded
      b.x = clamp(b.x, 40, World.W - 40);
      if (b.t >= b.wait) { const id = Boss.pick(Boss.read()); Boss.begin(BATK[id], id); }
      return;
    }
    if (b.state === 'tele') {
      if (b.atk === BATK.super) b.lift = Math.min(18, b.lift + 40 * dt);
      if (b.t >= b.tele) { b.state = 'act'; b.t = 0; b.cue = null; b.atk.fire(b, Boss.read()); }
      return;
    }
    if (b.state === 'act') {
      if (b.t >= b.atk.act) { b.state = 'rec'; b.t = 0; if (!b.hide) b.pose = b.atk.pose === 'super' || b.atk.pose === 'summon' || b.atk.pose === 'cast' || b.atk.pose === 'counter' ? 'idle' : b.pose; FightUI.hint(b.eased ? 'strike' : null); }
      return;
    }
    if (b.state === 'rec') {
      if (b.lift > 0) b.lift = Math.max(0, b.lift - 60 * dt);
      if (b.t >= b.atk.rec * (b.eased ? 1.25 : 1)) Boss.rest();
      return;
    }
    if (b.state === 'stagger') { if (b.t >= 2.0) Boss.rest(); return; }
  },
  /** back to waiting: how long depends on the phase, on his mood (it drifts), and on how the visitor is doing */
  rest() {
    const b = BOSS, c = Boss.read();
    b.aggr = clamp(b.aggr + (Math.random() - .5) * .4, .75, 1.3);
    let w = [1.05, .8, .58][b.phase] / b.aggr + Math.random() * .3;
    if (b.eased) w *= 1.3;
    if (c.php <= 2) w *= 1.15;
    if (b.phase === 2 && Math.random() < .38) w = .12;                       // in the last phase he often follows one attack straight with another
    if (b.phase === 2 && b.hp / b.max < PHASE_AT[3]) w = Math.min(w, .5);    // the terminal phase has no breaths in it
    b.state = 'idle'; b.t = 0; b.wait = w; b.pose = 'idle'; b.lift = 0; FightUI.hint(null);
  }
};

function bossSync() {
  el('bossFill').style.transform = 'scaleX(' + clamp(BOSS.hp / BOSS.max, 0, 1) + ')';
  const pips = el('bossPips'); pips.innerHTML = '';
  for (let i = 0; i < 3; i++) {
    const s = document.createElement('i'); s.textContent = '◆';
    if (i < BOSS.phase || BOSS.ov) s.className = 'on';
    if (i === BOSS.phase && !BOSS.ov) s.style.color = '#e8ddff';
    pips.appendChild(s);
  }
}

function startBossScene() {
  if (Special.kind() === 'meiko') { Special.meeting(); return; }
  if ((G.flags.falls | 0) > 0 && G.attempt > 0) { G.scene = 'attempt'; bossResume(); return; }      // back from RE-sync: the fight goes on where it stood
  G.flags.bossSeen = true;
  for (const key of ['pz_forest', 'pz_cath_a', 'pz_cath_b', 'pz_machine', 'pz_repo']) G.flags[key] = true;
  save();
  BOSS.active = true; BOSS.x = ZONES.arena.bossX; BOSS.pose = 'idle';
  el('fight').classList.add('on');
  G.scene = 'boss';
  Fight.setup(0);
  Sound.ambience('arena', 1.1);
  BossMusic.start();
  let open = DC.shyn_first;
  if (typeof Roster !== 'undefined' && Roster.cur().id === 'shynj2' && !G.flags.selfMet) {   // the Architect, met in his own body
    G.flags.selfMet = true;
    open = [{ who: 'who.shyn_full', cls: 'shyn', lines: ['shyn_first.1', 'rc.self.1', 'rc.self.2', 'shyn_first.3', 'shyn_first.4'] }];
  }
  if (G.flags.knight && !G.flags.knightMet) {            // a knight is greeted by name, once (Round 9 §8.5)
    G.flags.knightMet = true; save();
    open = [{ who: 'who.shyn', cls: 'shyn', lines: [['knight_arena.1', G.name], 'knight_arena.2', 'knight_arena.3', 'knight_arena.4'] }];
  }
  Dlg.open(open, () => { G.scene = 'boss'; el('fight').classList.add('on'); BOSS.state = 'intro'; BOSS.t = 0; });
}

/** E / the old action button during the fight: an attack */
function bossStrike() { Combat.press('attack'); }
function hitBossPlayer(x) { Combat.hurt({ dmg: 1, x, unblock: true }); }

function bossDeath() {
  const inTerm = BOSS.ov;
  countDeath();
  Fight.end(); BOSS.cp = 0; BOSS.pose = 'idle';
  G.attempt++;
  G.flags.falls = (G.flags.falls || 0) + 1;                 // defeats since the fight was last settled: RE-sync steps in at ALLY_AT (68-ally.js)
  if (G.attempt > 1) unlock('persistent');
  const show = () => {
    const a = G.attempt, k = a <= 2 ? a : 2 + ((a - 3) % 3);          // 1, 2, then 2-3-4 in turn
    el('attNum').textContent = '#' + a;
    const set = (id, key) => { el(id).dataset.i18n = key; el(id).textContent = tr(key); };       // data-i18n: follows the language button
    set('attL1', 'ui.attempt.' + k + 'a'); set('attL2', 'ui.attempt.' + k + 'b');
    set('attRet', Touch.on ? 'ui.tap_to_return' : 'ui.press_e_to_return');
    const re = el('attRe'); if (re) { re.style.display = G.flags.resync ? '' : 'none'; re.textContent = tr('ui.visit_resync') + (Touch.on ? '' : '  ·  R'); }
    G.scene = 'attempt'; G.attemptT = G.time;
    el('attempt').classList.add('on');
    el('stage').classList.add('void');
    save();
  };
  if (inTerm) Override.panic(show); else show();
}

function bossResume() {
  if (G.scene !== 'attempt') return;
  if (!G.flags.resync) { Resync.rescue(); return; }       // the first defeat: the visitor wakes beside RE-sync instead (66-resync.js)
  el('attempt').classList.remove('on');
  el('stage').classList.remove('void');
  setDet(5, true);
  Fight.end(); BOSS.cp = 0;
  BOSS.active = true; BOSS.x = ZONES.arena.bossX; BOSS.pose = 'idle';
  G.scene = 'boss';
  el('fight').classList.add('on');
  Fight.setup(0);
  Sound.ambience('arena', 1.1);
  BossMusic.start();
  const go = () => {
    G.scene = 'boss'; if (!BOSS.active) return;
    Dlg.open(DC.shyn_p1, () => { G.scene = 'boss'; if (BOSS.active) { BOSS.state = 'intro'; BOSS.t = 0; } });
  };
  const falls = G.flags.falls || 0, say = (lines, done) => Dlg.open([{ who: 'who.shyn', cls: 'shyn', lines }], done);
  if (falls >= ALLY_AT && !G.flags.ally) {                 // the new mercy: at the fifth defeat RE-sync steps in beside the visitor (68-ally.js)
    G.flags.ally = true; save();
    Ally.arrive(() => say(['ui.you_returned', 'shyn_mercy.3.2'], go));
    return;
  }
  const ups = WEAPON_ORDER.reduce((n, id) => n + Arsenal.level(id), 0);
  if (ups > 0 && !G.flags.upSaid) { G.flags.upSaid = true; save(); say(['shyn_up.1', 'shyn_mercy.3.2'], go); return; }      // he sees whose hand rewrote the weapon
  say(['ui.you_returned', 'shyn_mercy.3.2'], go);
}

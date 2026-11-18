/* ==========================================================================
   68 · THE HOLLOWS — the things that live in the halls.

   Until now the world was empty and only the Keeper could be fought (both from
   the throne room on, after the whole pilgrimage). This file puts a population
   of enemies into the maps: they patrol, they see you, they charge, they swing,
   and they can be struck and killed. Six of them, all built on the rigs that
   already exist (art-src/rigs) so the bodies move with the same animation data
   as the Recruiter:

     warden   rust-warden      the dead maintenance frames of the Workshop   (first enemy a visitor meets)
     stalker  ink-stalker      a silhouette that walks: Forest, then the Repository
     mote     cinder-mote      a floating coal of the Forge fires
     brute    brass-brute      a gate-warder rebuilt in brass: slow, heavy, unblockable
     wisp     rune-wisp        a ball of leftover rune-light: hovers, casts bolts
     echo     code-echo        a copy of the Recruiter himself: does what you do, one beat late

   Every enemy is one entry of ETYPES. To tune one, change its numbers; to add a
   new kind, add an entry and place it in a zone (49-zones.js, `foes: [...]`) or
   in a wave (spawn()).

   Numbers that matter:
     hp     blows before it breaks         dmg   hearts it takes (the Recruiter has 5)
     reach  its swing, in px               spd   its walk, px/s
     cd     seconds between its swings     sight how near you are before it wakes
     kind   'parry' (a raised guard stops it) | 'unblock' (dodge only) | 'area'
   ========================================================================== */
const ETYPES = {
  warden: {
    rig: 'warden', name: 'foe.warden.name', hp: 34, dmg: 1, reach: 34, spd: 34, cd: 1.9, sight: 172, tell: .42, act: .16, rec: .62,
    kind: 'parry', poise: 9, drop: 26, shards: [1, 2], keep: 58,
    /* the swing, in his own words: a slow overhead cut */
    hits: [{ at: .05, reach: 38, dmg: 1 }]
  },
  stalker: {
    rig: 'stalker', name: 'foe.stalker.name', hp: 44, dmg: 1, reach: 32, spd: 62, cd: 1.35, sight: 210, tell: .30, act: .14, rec: .40,
    kind: 'parry', poise: 7, drop: 34, shards: [2, 3], keep: 64,
    hits: [{ at: .02, reach: 36, dmg: 1 }, { at: .28, reach: 36, dmg: 1 }]        // a two-cut flurry: step back or guard both
  },
  mote: {
    rig: 'stalker', ghost: true, scale: .8, glow: 'ember3', name: 'foe.mote.name', hp: 16, dmg: 1, reach: 0, spd: 48, cd: 1.6, sight: 260, tell: .48, act: .1, rec: .5,
    kind: 'unblock', poise: 3, drop: 16, shards: [1, 1], fly: 40, keep: 40,
    shot: { speed: 168, dmg: 1, gravity: 0, aim: true }                     // spits a cinder at wherever you are
  },
  brute: {
    rig: 'brute', name: 'foe.brute.name', hp: 120, dmg: 2, reach: 46, spd: 22, cd: 2.4, sight: 150, tell: .70, act: .22, rec: .9,
    kind: 'unblock', poise: 24, drop: 70, shards: [4, 6], keep: 74, heavy: 2,
    hits: [{ at: .08, reach: 50, dmg: 2, quake: true }]                      // a ground slam: it cannot be guarded, only left
  },
  wisp: {
    rig: 'stalker', ghost: true, scale: .95, glow: 'rune3', name: 'foe.wisp.name', hp: 22, dmg: 1, reach: 0, spd: 20, cd: 1.15, sight: 300, tell: .40, act: .1, rec: .45,
    kind: 'unblock', poise: 4, drop: 20, shards: [1, 2], fly: 54, keep: 50,
    shot: { speed: 190, dmg: 1, gravity: 0, aim: true }
  },
  echo: {
    rig: 'recruiter', mirror: true, name: 'foe.echo.name', hp: 60, dmg: 1, reach: 36, spd: 58, cd: 1.5, sight: 240, tell: .35, act: .16, rec: .5,
    kind: 'parry', poise: 12, drop: 46, shards: [3, 4], keep: 68,
    hits: [{ at: .04, reach: 40, dmg: 1 }]
  }
};

/* ---------------- what a zone is allowed to hold ---------------- */
const FOE_MAX = 3;                    // at once, around the visitor
const FOE_RESPAWN = 26;               // seconds before a fallen enemy returns while its hall is still on screen
const FOE_LURE = 520;                 // how far from the visitor an enemy may be before it is put to sleep
const FOE_VANISH = 1.25;              // seconds its body takes to burn away

const Enemy = {
  live: [],       // { id, kind, x, y, vy, face, hp, max, st, t, cd, hitT, hurt, dead, vanish, home, face0, anim, tell, lunge, seed }
  _id: 0,
  _pool: {},      // zone id -> built spawn list (rebuilt when the zone is entered)

  /* ---------------- the rig of a ghost: a body cut down and made of light ---------------- */
  ghost(kind, key) {
    if (this._pool[key]) return this._pool[key];
    const R = Art.rigs[ETYPES[kind].rig]; if (!R) return null;
    const n = R.def.fw, h = R.def.fh, c = mk(n, h), g = c.getContext('2d');
    g.drawImage(R.cv[0][0], 0, 0);                       // idle frame 0, right-facing
    const px = g.getImageData(0, 0, n, h), d = px.data;
    const col = { ember3: [232, 115, 74], rune3: [122, 82, 214], cold3: [79, 160, 200] }[ETYPES[kind].glow] || [122, 82, 214];
    for (let i = 0; i < d.length; i += 4) {
      if (d[i + 3] < 90) { d[i + 3] = 0; continue; }
      const a = d[i + 3] / 255;
      d[i] = Math.round((d[i] * .35 + col[0] * .65) * a); d[i + 1] = Math.round((d[i + 1] * .35 + col[1] * .65) * a); d[i + 2] = Math.round((d[i + 2] * .35 + col[2] * .65) * a);
      d[i + 3] = 190;
    }
    g.putImageData(px, 0, 0);
    return (this._pool[key] = c);
  },
  /** the mirror echo wears the Recruiter's own rig, lit violet */
  echoRig() {
    if (this._pool.echo) return this._pool.echo;
    const R = Art.rigs.recruiter; if (!R) return null;
    const c = mk(R.cv[0][0].width, R.cv[0][0].height), g = c.getContext('2d');
    g.drawImage(R.cv[0][0], 0, 0);
    const px = g.getImageData(0, 0, c.width, c.height), d = px.data;
    for (let i = 0; i < d.length; i += 4) { if (d[i + 3] < 40) { d[i + 3] = 0; continue; } d[i] = Math.min(255, d[i] * .55 + 90); d[i + 1] = Math.round(d[i + 1] * .5); d[i + 2] = Math.min(255, d[i + 2] * .6 + 70); d[i + 3] = 235; }
    g.putImageData(px, 0, 0);
    return (this._pool.echo = c);
  },

  /* ---------------- placing the population of a hall ---------------- */
  /** called by loadZone(); `foes` is the zone's list: [kind, tileColumn, opts] or { kind, x, y, keep } */
  enter(zoneId) {
    this.live.length = 0; this._z = zoneId;
    const z = ZONES[zoneId]; if (!z || !z.foes) return;
    this._spawn = [];
    z.foes.forEach((f, i) => {
      const kind = Array.isArray(f) ? f[0] : f.kind;
      if (!ETYPES[kind]) return;
      const col = Array.isArray(f) ? f[1] : f.at != null ? f.at : (f.x / TILE);
      const x = col * TILE + 8;
      this._spawn.push({ kind, x, lane: (Array.isArray(f) ? f[2] : f.opts) || {}, id: 'f' + i, at: x });
    });
    this._spawn.sort((a, b) => a.x - b.x);
    this._reap = FOE_RESPAWN;
    this.awake();
  },
  awake() {
    const n = Math.min(FOE_MAX, (this._spawn || []).length);
    for (let i = 0; i < n; i++) { const s = this._spawn[i]; if (!s.up) { s.up = true; this.add(s.kind, s.x, s, s.lane); } }
    // the nearest ones waken first: sort by distance to the visitor when the zone opens
    if (this.live.length) {
      const pc = P.x + P.w / 2;
      this.live.sort((a, b) => Math.abs(a.x - pc) - Math.abs(b.x - pc));
    }
  },
  add(kind, x, slot, lane) {
    const T = ETYPES[kind];
    const gy = World.groundNear(x);
    const e = {
      id: ++this._id, kind, slot, lane: lane || {}, x, y: T.fly ? gy - T.fly : gy, gy, vy: 0, face: -1, face0: -1,
      hp: T.hp, max: T.hp, st: 'sleep', t: 0, cd: .6 + Math.random() * .5, hitT: -9, hurt: 0, dead: false, vanish: 0,
      anim: Anim(T.rig), tell: 0, lunge: 0, seed: Math.random() * 10, age: 0, flash: 0, lungeT: 0, shotT: 0, rise: 0,
      fade: 1
    };
    if (kind !== 'echo' && kind !== 'mote' && kind !== 'wisp') animPlay(e.anim, 'idle');
    this.live.push(e); return e;
  },

  /* ---------------- per frame ---------------- */
  update(dt) {
    if (G.scene !== 'world' && G.scene !== 'boss') return;
    if (G.scene === 'boss' || G.zone !== this._z) { if (this.live.length) this.live.length = 0; return; }
    const z = World.z; if (!z) return;
    const pcx = P.x + P.w / 2, onScreen = (e) => Math.abs(e.x - G.camX - VW / 2) < VW * 1.1;
    // wake sleeping ones, put far ones to sleep, keep the population at FOE_MAX
    let liveN = 0;
    for (const e of this.live) if (!e.dead) liveN++;
    if (liveN < FOE_MAX && this._spawn && this._spawn.some((s) => !s.up)) {
      this._reap -= dt;
      if (this._reap <= 0) {
        this._reap = FOE_RESPAWN;
        const s = this._spawn.find((q) => !q.up && Math.abs(q.x - pcx) > 150 && Math.abs(q.x - pcx) < FOE_LURE);
        if (s) { s.up = true; const e = this.add(s.kind, s.x, s, s.lane); e.st = 'spawn'; e.rise = 0; }
      }
    }
    for (let i = this.live.length - 1; i >= 0; i--) {
      const e = this.live[i], T = ETYPES[e.kind];
      e.age += dt; if (e.flash > 0) e.flash -= dt;
      if (e.dead) {                                           // burning away
        e.vanish += dt;
        if (e.vanish > FOE_VANISH) { this.live.splice(i, 1); if (e.slot) e.slot.up = false; }
        continue;
      }
      if (e.st === 'sleep' || e.st === 'spawn') {
        const far = Math.abs(e.x - pcx);
        if (e.st === 'spawn') { e.rise = Math.min(1, e.rise + dt * 2.2); if (e.rise >= 1) e.st = 'sleep'; }
        animTick(e.anim, dt * .4);
        if (far < T.sight && Math.abs(G.camX + VW / 2 - e.x) < VW * .8) { e.st = 'wake'; e.t = 0; e.face = pcx < e.x ? -1 : 1; }
        continue;
      }
      if (Math.abs(e.x - pcx) > FOE_LURE + 200) { e.st = 'sleep'; continue; }
      this.think(e, dt, pcx, T);
      animTick(e.anim, dt);
      if (e.hurt > 0) e.hurt -= dt;
      if (e.lungeT > 0) { e.lungeT -= dt; e.x = clamp(e.x + e.lunge * dt, 24, World.W - 24); }
    }
    // keep the visitor's blows honest: the hit test lives in Combat.strike()/shots via Enemy.hit
    this._pcx = pcx;
  },

  think(e, dt, pcx, T) {
    e.t += dt;
    if (e.st === 'wake') {                                     // it has seen you: it rises, then comes
      e.rise = Math.min(1, e.rise + dt * 2.6);
      if (T.rig !== 'stalker' || e.kind === 'echo') animPlay(e.anim, 'hurt', false);
      if (e.t > .5) { e.st = 'chase'; e.t = 0; }
      return;
    }
    if (e.st === 'chase') {
      const dx = pcx - e.x, ad = Math.abs(dx);
      e.face = dx < 0 ? -1 : 1;
      if (T.fly) {                                            // ghosts: bob at a height, drift toward you
        const gy = World.groundNear(e.x + e.face * 10);
        e.gy = gy; e.y = gy - T.fly + Math.sin(e.age * 2.4 + e.seed) * 4;
      }
      const canStep = T.fly || this.stepOk(e, e.face);
      if (ad > (T.reach ? T.reach * .8 : 110) && canStep) e.x += e.face * T.spd * dt * (e.hurt > 0 ? .3 : 1);
      else if (!T.fly) e.x += e.face * T.spd * .35 * dt;
      if (!T.fly) e.gy = World.groundNear(e.x + e.face * 8);
      e.cd -= dt;
      // in a crowded hall only the nearest two may swing at once
      const swinging = this.live.filter((o) => o.st === 'wind' || o.st === 'act').length;
      if (e.cd <= 0 && ad < (T.reach ? T.reach + 20 : T.sight) && !(swinging >= 2 && e.st !== 'wind')) {
        e.st = 'wind'; e.t = 0; e.tell = T.tell;
        animPlay(e.anim, T.shot ? 'cast' : 'atk1', true);
        if (!Calm()) Sound.warn(T.kind === 'unblock');
      } else animPlay(e.anim, ad > 60 ? 'run' : 'idle');
      return;
    }
    if (e.st === 'wind') {
      if (T.shot && e.kind && (e.kind === 'wisp' || e.kind === 'mote')) e.y = World.groundNear(e.x) - T.fly + Math.sin(e.age * 2.4 + e.seed) * 4;
      if (e.t >= e.tell) {
        e.st = 'act'; e.t = 0;
        if (T.shot) this.shoot(e, T);
        else {
          e.lunge = e.face * (T.heavy ? 120 : 260); e.lungeT = T.heavy ? .24 : .13;
          animPlay(e.anim, T.heavy ? 'heavy' : 'atk2', true);
          Sound.swing(!!T.heavy);
          // the blow lands a moment later (the rig is already mid-swing)
          e.pending = (T.hits || [{ at: 0, reach: T.reach, dmg: T.dmg }]).map((h) => ({ ...h }));
        }
      }
      return;
    }
    if (e.st === 'act') {
      if (e.pending) for (let i = e.pending.length - 1; i >= 0; i--) {
        const h = e.pending[i];
        if (e.t >= h.at) { e.pending.splice(i, 1); this.swing(e, T, h); }
      }
      if (e.t >= T.act) { e.st = 'rec'; e.t = 0; animPlay(e.anim, 'idle'); }
      return;
    }
    if (e.st === 'rec') {
      if (e.t >= T.rec) { e.st = 'chase'; e.t = 0; e.cd = T.cd * (.75 + Math.random() * .5); }
      return;
    }
    if (e.st === 'stagger') {
      if (e.t >= 1.1) { e.st = 'chase'; e.t = 0; }
      return;
    }
  },
  /** may it step that way? (walls and pits stop it; it never leaves the floor it stands on) */
  stepOk(e, dir) {
    const nx = e.x + dir * 10;
    if (nx < 20 || nx > World.W - 20) return false;
    const gy = World.groundNear(nx);
    if (Math.abs(gy - e.gy) > 20) return false;
    const ty = Math.floor((gy - 6) / TILE), tx = Math.floor(nx / TILE);
    return !World.solid(tx, ty) && !World.solid(tx, Math.floor((gy - 30) / TILE));
  },
  shoot(e, T) {
    const pcx = P.x + P.w / 2, dx = pcx - e.x, dy = (P.y + 16) - (e.y - 10), d = Math.hypot(dx, dy) || 1;
    this.bolts = this.bolts || [];
    this.bolts.push({ x: e.x + e.face * 8, y: e.y - 12, vx: dx / d * T.shot.speed, vy: dy / d * T.shot.speed, t: 0, dmg: T.shot.dmg, life: 2.6, from: e.x });
    Sound.orb();
  },
  /** one hit of an enemy attack passes over the space in front of it */
  swing(e, T, h) {
    const x0 = e.face > 0 ? e.x + 2 : e.x - 2 - h.reach, x1 = x0 + h.reach;
    if (h.quake) { G.shake = Math.max(G.shake, Calm() ? 2 : 7); Sound.land(); burst(e.x + e.face * 20, e.gy - 4, 'rgba(255,190,120,', 14, 90); }
    const px0 = P.x, px1 = P.x + P.w, py0 = P.y, py1 = P.y + P.h;
    const hx0 = x0, hx1 = x1, hy0 = e.gy - 46, hy1 = e.gy;
    if (px1 > hx0 && px0 < hx1 && py1 > hy0 && py0 < hy1) {
      const r = Combat.hurt({ dmg: h.dmg || T.dmg, x: e.x, unblock: T.kind === 'unblock', foe: e });
      if (r === 'parry' || r === 'block') { e.st = 'stagger'; e.t = 0; e.pending = null; e.cd = Math.max(e.cd, .8); if (r === 'parry') this.damage(e, T, 8, { parry: true }); }
    }
  },
  /** the visitor's blow reaches one: returns true if it landed */
  hit(x0, y0, x1, y1, dmg, poise, info) {
    if (!this.live.length) return false;
    let any = false;
    for (const e of this.live) {
      if (e.dead || e.st === 'sleep' || e.st === 'spawn' && e.rise < .5) continue;
      const T = ETYPES[e.kind], top = (T.fly ? e.y - 30 : e.gy - 46), bot = (T.fly ? e.y + 12 : e.gy + 2), w = T.ghost ? 9 : 11;
      if (x1 > e.x - w && x0 < e.x + w && y1 > top && y0 < bot) {
        this.damage(e, T, dmg * (info && info.wp ? Arsenal.mult(info.wp) : 1), info);
        any = true;
      }
    }
    return any;
  },
  damage(e, T, dmg, info) {
    if (e.dead) return;
    if (e.st === 'sleep' || e.st === 'spawn') { e.st = 'wake'; e.t = 0; }
    const v = Math.max(1, Math.round(dmg));
    e.hp -= v; e.flash = .1; e.hurt = .28; e.hitT = G.time;
    Combat.number(e.x, (T.fly ? e.y : e.gy) - (T.ghost || T.fly ? 46 : 66), v, 'bone4');
    burst(e.x, (T.fly ? e.y : e.gy) - 18, 'rgba(255,110,140,', info && info.heavy ? 10 : 5, 70);
    Sound.cut(!!(info && info.heavy));
    if (e.st !== 'wind' && e.st !== 'act') { e.st = 'hurt'; e.t = 0; e.cd = Math.max(e.cd, .5); }
    if (e.hp <= 0) this.kill(e, T);
  },
  kill(e, T) {
    e.dead = true; e.vanish = 0; e.hp = 0;
    burst(e.x, (T.fly ? e.y : e.gy) - 16, 'rgba(190,140,255,', 18, 120);
    if (!Calm()) G.shake = Math.max(G.shake, T.heavy ? 5 : 3);
    Sound.hit(); Sound.cut(true);
    const n = (T.shards[0] + Math.random() * (T.shards[1] - T.shards[0] + 1)) | 0;
    G.shards = (G.shards || 0) + n;
    addScore(T.drop);
    Combat.float(tr('foe.fell') + '  +' + trNum(n), 'gold');
    if (T.drop) Combat.number(e.x, (T.fly ? e.y : e.gy) - 84, T.drop, 'gold4');
    if (typeof Roster !== 'undefined') Roster.onKill();
    save();
  },
  /** the same ward as the halls have for people: a friend cannot be cut (nobody here is one) */

  /* ---------------- bolts ---------------- */
  stepBolts(dt) {
    const bs = this.bolts; if (!bs || !bs.length) return;
    for (let i = bs.length - 1; i >= 0; i--) {
      const b = bs[i]; b.t += dt; b.x += b.vx * dt; b.y += b.vy * dt;
      const tx = Math.floor(b.x / TILE), ty = Math.floor(b.y / TILE);
      const dead = b.t > b.life || b.x < 8 || b.x > World.W - 8 || b.y > World.H || World.solid(tx, ty);
      if (!dead && b.x > P.x - 2 && b.x < P.x + P.w + 2 && b.y > P.y - 2 && b.y < P.y + P.h + 2) {
        Combat.hurt({ dmg: b.dmg, x: b.from, unblock: true });
        burst(b.x, b.y, 'rgba(255,140,120,', 8, 70); bs.splice(i, 1); continue;
      }
      if (dead) { burst(b.x, b.y, 'rgba(140,120,220,', 5, 50); bs.splice(i, 1); }
    }
  },

  /* ---------------- drawing ---------------- */
  draw(g, cx, cy, t, shadows) {
    if (!this.live.length) return;
    for (const e of this.live) {
      const T = ETYPES[e.kind];
      if (e.x - cx < -90 || e.x - cx > VW + 90) continue;
      const footY = T.fly ? e.y : e.gy;
      const a = Math.min(1, (e.dead ? 1 - e.vanish / FOE_VANISH : e.st === 'spawn' ? e.rise : 1)) * .95;
      if (a <= 0) continue;
      if (shadows && !T.fly) spr(g, 'fx_shadow', e.x - 5 - cx, e.gy - 2 - cy, 0);
      if (shadows) continue;                                    // the body itself is drawn in the emissive pass below
      // burn-away: rising embers, then nothing
      if (e.dead) {
        const k = e.vanish / FOE_VANISH;
        for (let i = 0; i < 5; i++) { g.fillStyle = i & 1 ? PIX.rune4 : PIX.ember4; g.fillRect(Math.round(e.x - cx + (hash2(i, (t * 8) | 0, 3) * 14 - 7)), Math.round(footY - cy - 40 * k - i * 7), 1, 2); }
        continue;
      }
      g.globalAlpha = a;
      if (e.kind === 'echo' || e.kind === 'mote' || e.kind === 'wisp') {
        const c = e.kind === 'echo' ? this.echoRig() : this.ghost(e.kind, e.kind);
        if (c) {
          const d = Art.rigs[T.rig].def, fr = e.anim.clip ? e.anim.clip.f[Math.min(e.anim.i, e.anim.clip.f.length - 1)][0] : 0;
          const col = fr % d.cols, row = (fr / d.cols) | 0, sc = T.scale || 1;
          g.save(); g.translate(Math.round(e.x) - cx, Math.round(footY) - cy);
          if (e.face > 0) g.scale(-1, 1);
          if (T.fly) g.translate(0, Math.sin(e.age * 2.4 + e.seed) * 2);
          g.drawImage(c, col * d.fw, row * d.fh, d.fw, d.fh, Math.round(-d.ox * sc), Math.round(-d.oy * sc), Math.round(d.fw * sc), Math.round(d.fh * sc));
          g.restore();
        }
      } else {
        const R = Art.rigs[T.rig];
        const lightSide = e.x >= (P.x + P.w / 2) ? -1 : 1;
        if (R) drawRig(g, e.anim, Math.round(e.x) - cx, Math.round(e.gy) - cy, e.face, lightSide, e.flash > 0 && ((t * 18) | 0) % 2 === 0);
      }
      g.globalAlpha = 1;
      // the tell: a red mark over the head just before a blow that cannot be guarded
      if (e.st === 'wind' && e.t > e.tell * .3) {
        const top = Math.round((T.fly ? e.y : e.gy) - (T.ghost || T.fly ? 46 : 62) + Math.sin(t * 22)) - cy, hx = Math.round(e.x) - cx;
        const c = T.kind === 'unblock' ? PIX.ember4 : PIX.bone3, n = Math.max(1, Math.round(4 * clamp(e.t / e.tell, 0, 1)));
        if (((t * 14) | 0) % 4 || e.t > e.tell * .75) for (let i = 0; i < n; i++) { g.fillStyle = c; g.fillRect(hx - n * 2 + i * 4, top, 3, 2); }
        g.fillStyle = T.kind === 'unblock' ? PIX.ember2 : PIX.bone1; g.fillRect(hx - 1, top + 4, 3, 1);
      }
      // a thin life bar, only while it is hurt and awake
      if (e.hp < e.max && e.st !== 'sleep' && e.st !== 'spawn') {
        const w = 22, x = Math.round(e.x) - cx - w / 2, y = Math.round((T.fly ? e.y - 44 : e.gy - (T.ghost ? 52 : 74))) - cy;
        g.fillStyle = 'rgba(6,4,10,.8)'; g.fillRect(x - 1, y - 1, w + 2, 4);
        g.fillStyle = PIX.ember2; g.fillRect(x, y, Math.round(w * clamp(e.hp / e.max, 0, 1)), 2);
      }
    }
    // their bolts glow
    if (this.bolts) for (const b of this.bolts) {
      const x = Math.round(b.x) - cx, y = Math.round(b.y) - cy;
      if (sprRect('fx_orb', 0)) spr(g, 'fx_orb', x - 7, y - 7, (t * 14) | 0);
      else { g.fillStyle = PIX.ember4; g.fillRect(x - 2, y - 2, 4, 4); }
      g.fillStyle = b.vx > 0 ? 'rgba(255,180,140,.7)' : 'rgba(255,180,140,.7)';
      g.fillRect(x - Math.sign(b.vx) * 8, y, 6, 1);
    }
  }
};


/* ==========================================================================
   67 · SPECIAL PILGRIMS: MIKU & MEIKO
   - "miku": detailed cyber-diva rig (art-src/rigs/miku), Harmonic Vox-Lance (w_microphone),
     3-step harmonic slash + musical note chords, Sonic Wave heavy, and Encore Starlight special.
   - "meiko": majestic seraphic 4-wing angel rig (art-src/rigs/meiko), dynamic golden world illumination,
     Bayer-dithered golden mandorla back-aura, sacred crown halo, drifting feather/starlight motes,
     proximity-driven natural multi-frame kneeling across all NPCs, and sacred Throne Room union with Shyn.
   ========================================================================== */
const Special = {
  _auraFrames: null,
  _haloFrames: null,
  _kneel: {},       // id -> { k: 0..1, dir: -1|0|1, lastT: number, anim: Anim|null, sparkT: number }
  _sparks: [],      // transient golden motes (foot-glide / NPC reverence / encore)

  norm(n) { return String(n == null ? '' : n).trim().toLowerCase(); },
  kind(n) {
    const s = this.norm(n === undefined ? (typeof G !== 'undefined' && G ? G.name : '') : n);
    return (s === 'miku' || s === 'hatsune miku') ? 'miku' : (s === 'meiko' || s === 'sakine meiko') ? 'meiko' : '';
  },

  sync() {
    const k = this.kind();
    if (typeof G !== 'undefined' && G && G.flags) G.flags.special = k;
    if (typeof Knight !== 'undefined') Knight.apply();
    if (typeof Arsenal !== 'undefined') Arsenal.syncUI();
  },

  /* Spawn a gentle pixel-art light mote */
  addSpark(x, y, vx, vy, life, col, cross) {
    if (typeof Calm === 'function' && Calm()) return;
    if (this._sparks.length > 48) this._sparks.shift();
    this._sparks.push({ x, y, vx, vy, t: 0, life, col, cross: !!cross });
  },

  stepMote() {
    if (this.kind() !== 'meiko') return false;
    const cx = P.x + P.w / 2;
    this.addSpark(cx - P.face * 5, P.y + P.h - 2, -P.face * 10, -14, .65, palHex('gold4'), true);
    return true;
  },

  /* ---------------- Pre-baked Bayer-dithered Sacred Mandorla & Sunburst Rays ---------------- */
  _ensureAura() {
    if (this._auraFrames || typeof ART === 'undefined') return this._auraFrames;
    const B4 = [[0, 8, 2, 10], [12, 4, 14, 6], [3, 11, 1, 9], [15, 7, 13, 5]];
    const c1 = palHex('gold1'), c2 = palHex('gold2'), c3 = palHex('gold3'), c4 = palHex('gold4'), c5 = palHex('bone4');
    const S = 128, H = S >> 1;
    this._auraFrames = [0, 1, 2, 3].map((ph) => {
      const cv = mk(S, S), g = cv.getContext('2d');
      const pulse = [0, 2, 3, 1][ph], rot = ph * (Math.PI / 32);
      const rx = 34 + pulse, ry = 42 + pulse;
      for (let y = 0; y < S; y++) {
        for (let x = 0; x < S; x++) {
          const dx = x - H, dy = y - (H + 2);
          const d = Math.hypot(dx / rx, dy / ry);
          if (d > 1.38) continue;
          const b = B4[y & 3][x & 3] / 16;
          // 8 gentle sacred sunburst rays behind the seraphic wings
          const ang = Math.atan2(dy, dx) + rot;
          const ray = Math.max(0, Math.cos(ang * 4)) * (d > 0.45 && d < 1.32 ? 0.24 : 0);
          const v = (1.18 - d) + ray;
          let col = null;
          if (v > 0.86) col = b < (v - 0.86) * 3.2 ? c5 : c4;
          else if (v > 0.62) col = b < (v - 0.62) * 4.0 ? c4 : c3;
          else if (v > 0.36) col = b < (v - 0.36) * 3.8 ? c3 : c2;
          else if (v > 0.14) col = b < (v - 0.14) * 4.2 ? c2 : (b < 0.18 ? c1 : null);
          else if (v > 0.02 && b < v * 4.5) col = c1;
          if (col) { g.fillStyle = col; g.fillRect(x, y, 1, 1); }
        }
      }
      return cv;
    });

    // Ornate pixel-art Sunburst Crown Halo (30 x 14) in 2 shimmer phases
    this._haloFrames = [0, 1].map((ph) => {
      const cv = mk(30, 14), g = cv.getContext('2d');
      const g2 = palHex('gold2'), g3 = palHex('gold3'), g4 = palHex('gold4'), b4 = palHex('bone4'), r5 = palHex('rune5');
      for (let y = 0; y < 14; y++) {
        for (let x = 0; x < 30; x++) {
          const dx = (x - 14.5) / 10.5, dy = (y - 6.5) / 3.4;
          const r = Math.hypot(dx, dy);
          if (r >= 0.72 && r <= 1.08) {
            g.fillStyle = r > 0.84 && r < 0.96 ? (y < 6 ? r5 : b4) : g4;
            g.fillRect(x, y, 1, 1);
          } else if (r >= 0.56 && r < 0.72 && ((x + y + ph) & 1) === 0) {
            g.fillStyle = g3; g.fillRect(x, y, 1, 1);
          }
        }
      }
      // Four sacred cardinal star-rays (north, south, west, east)
      g.fillStyle = r5;
      g.fillRect(14, 1 - ph, 2, 2); g.fillRect(14, 11 + (ph ? 0 : 0), 2, 1);
      g.fillRect(1 + ph, 6, 3, 2);  g.fillRect(26 - ph, 6, 3, 2);
      g.fillStyle = g4;
      g.fillRect(0 + ph, 6, 1, 2);  g.fillRect(29 - ph, 6, 1, 2);
      g.fillRect(14, 0, 2, 1);
      g.fillStyle = g2;
      g.fillRect(14, 6, 2, 2); // subtle inner cross-gleam
      if (!ph) { g.fillStyle = r5; g.fillRect(14, 6, 2, 1); }
      return cv;
    });
    return this._auraFrames;
  },

  /* Drawn on View.E BEFORE destination-out actor punch so the golden mandorla radiates FROM BEHIND Meiko! */
  backGlow(E, cx, cy, t) {
    if (!P.visible || this.kind() !== 'meiko') return;
    const frames = this._ensureAura();
    if (!frames) return;
    const calm = typeof Calm === 'function' && Calm();
    const ph = calm ? 0 : (((t * 3.2) | 0) & 3);
    const bob = calm ? 0 : Math.round(Math.sin(t * 2.6) * 1.5);
    const px = Math.round(P.x + P.w / 2 - cx), py = Math.round(P.y + P.h - 26 + bob - cy);
    E.save();
    E.globalAlpha = calm ? 0.34 : (0.44 + Math.sin(t * 2.6) * 0.06);
    E.drawImage(frames[ph], px - 64, py - 64);
    E.restore();
  },

  /* Drawn on View.E AFTER destination-out so the Crown Halo and floating starlight motes shine clearly */
  glow(E, cx, cy, t) {
    if (!P.visible) return;
    const k = this.kind();
    const calm = typeof Calm === 'function' && Calm();

    // Update & draw transient golden/cyan sparks
    for (let i = this._sparks.length - 1; i >= 0; i--) {
      const s = this._sparks[i];
      s.t += 1 / 60;
      s.x += s.vx / 60; s.y += s.vy / 60;
      if (s.t >= s.life) { this._sparks.splice(i, 1); continue; }
      const sx = Math.round(s.x - cx), sy = Math.round(s.y - cy);
      E.fillStyle = s.col;
      if (s.cross && s.t < s.life * 0.6) {
        E.fillRect(sx - 1, sy, 3, 1); E.fillRect(sx, sy - 1, 1, 3);
      } else {
        E.fillRect(sx, sy, 1, 1);
      }
    }

    if (k === 'miku') {
      // Subtle stage-starlight glints when Miku swings or sings!
      if (!calm && P.anim && /^(atk|heavy|special|idle_look)/.test(P.anim.name)) {
        const px = Math.round(P.x + P.w / 2 - cx), py = Math.round(P.y + P.h - 24 - cy);
        const c4 = palHex('cold4'), r5 = palHex('rune5');
        for (let i = 0; i < 4; i++) {
          const a = t * 4.2 + i * 1.57, rx = Math.round(px + Math.cos(a) * (16 + (i & 1) * 6)), ry = Math.round(py + Math.sin(a * 1.3) * 14 - 4);
          E.fillStyle = (i & 1) ? r5 : c4;
          E.fillRect(rx, ry, 1, 1);
          if (i === 0) { E.fillRect(rx - 1, ry, 3, 1); E.fillRect(rx, ry - 1, 1, 3); }
        }
      }
      return;
    }

    if (k !== 'meiko') return;
    this._ensureAura();
    const px = Math.round(P.x + P.w / 2 - cx), py = Math.round(P.y + P.h - cy);
    const airLift = !P.onGround ? -3 : 0;
    const bob = calm ? 0 : Math.round(Math.sin(t * 2.8) * 1.4);

    // 1. Sacred Sunburst Crown Halo floating above Meiko's tiara
    if (this._haloFrames) {
      const hph = calm ? 0 : (((t * 4) | 0) & 1);
      E.drawImage(this._haloFrames[hph], px - 15 + P.face, py - 61 + airLift + bob);
    }

    if (calm) return;

    // 2. Orbiting & rising celestial light motes + drifting luminous feather-sparks
    const g3 = palHex('gold3'), g4 = palHex('gold4'), b4 = palHex('bone4'), r5 = palHex('rune5');
    for (let i = 0; i < 12; i++) {
      const cyc = (t * (0.42 + (i % 3) * 0.11) + i * 0.31) % 1;
      const sway = Math.sin(t * 2.1 + i * 1.7) * (14 + (i % 4) * 5);
      const mx = Math.round(px + sway - P.vx * 0.04 * cyc);
      const my = Math.round(py - 6 - cyc * 52);
      if (i % 4 === 0 && cyc > 0.15 && cyc < 0.78) {
        // 4-point starlight cross-glint
        E.fillStyle = g4; E.fillRect(mx - 1, my, 3, 1); E.fillRect(mx, my - 1, 1, 3);
        E.fillStyle = r5; E.fillRect(mx, my, 1, 1);
      } else if (i % 5 === 1 && !P.onGround) {
        // Delicate drifting luminous feather-spark while flying!
        const fy = Math.round(py - 34 + cyc * 30);
        E.fillStyle = b4; E.fillRect(mx, fy, 2, 1);
        E.fillStyle = g3; E.fillRect(mx + 1, fy + 1, 2, 1);
      } else if (((i + ((t * 5) | 0)) % 3) !== 0) {
        E.fillStyle = (i & 1) ? g4 : b4;
        E.fillRect(mx, my, 1, 1);
      }
    }
  },

  /* ---------------- Proximity-Driven Natural Multi-Frame Kneeling ---------------- */
  kneelProgress(id, nx, ny, t) {
    if (this.kind() !== 'meiko') return { k: 0, dir: 0, near: false };
    let st = this._kneel[id];
    if (!st || st.zone !== G.zone) {
      st = this._kneel[id] = { zone: G.zone, k: 0, dir: 0, lastT: t, anim: null, sparked: false };
    }
    const first = st.lastT == null;
    const dt = first ? 0.016 : Math.min(0.08, Math.max(0, t - st.lastT));
    st.lastT = t;

    const pcx = P.x + P.w / 2, pcy = P.y + P.h;
    const dist = Math.hypot(pcx - nx, (pcy - ny) * 0.75);
    const talkingHere = Dlg.on && dist < 120;
    const want = talkingHere || dist < 170 ? 1 : dist > 205 ? 0 : (st.k > 0.5 ? 1 : 0);

    // If Meiko spawns right next to an NPC on zone entry, start them smoothly lowering
    if (first && dist < 165) st.k = Math.max(st.k, 0.30);

    if (dt > 0) {
      if (want > st.k) {
        const prev = st.k;
        st.k = Math.min(1, st.k + dt * 2.5);
        st.dir = 1;
        if (prev < 0.2 && st.k >= 0.2 && !st.sparked) {
          st.sparked = true;
          this.addSpark(nx - 4, ny - 34, -4, -18, .7, palHex('gold4'), true);
          this.addSpark(nx + 5, ny - 30,  5, -15, .6, palHex('rune5'), false);
        }
      } else if (want < st.k) {
        st.k = Math.max(0, st.k - dt * 2.1);
        st.dir = -1;
        if (st.k <= 0.05) st.sparked = false;
      } else {
        st.dir = 0;
      }
    }
    return { k: st.k, dir: st.dir, talking: talkingHere, flip: pcx < nx, st };
  },

  /* Advance rigged NPC clips (Librarian & RE-sync) with natural kneeling transitions */
  npcAnim(p, dt) {
    if (this.kind() !== 'meiko' || !p.anim) return false;
    const a = p.anim;
    if (!a.rig) a.rig = Art.rigs[a.rigName];
    if (!a.rig) return false;
    const clips = a.rig.def.clips;
    const kp = this.kneelProgress('rig:' + (p.id || p.look || p.x), p.x, p.gy, G.time);
    const speaking = Dlg.on && G._near && G._near.p === p;

    if (clips.kneel) {
      if (kp.k <= 0.01 && a.name !== 'kneel_up') return false;
      if (kp.dir < 0 || kp.k <= 0.01) {
        if (a.name !== 'kneel_up') animPlay(a, 'kneel_up');
        else if (a.done) { animPlay(a, 'idle'); return true; }
      } else if (a.name !== 'kneel_down' && a.name !== 'kneel' && a.name !== 'kneel_talk') {
        animPlay(a, 'kneel_down');
      } else if (a.name === 'kneel_down' && a.done) {
        animPlay(a, (speaking || kp.talking) ? 'kneel_talk' : 'kneel');
      } else if (a.name === 'kneel' || a.name === 'kneel_talk') {
        animPlay(a, (speaking || kp.talking) ? 'kneel_talk' : 'kneel');
      }
      animTick(a, dt);
      return true;
    }

    if (clips.rest_loop) {
      if (kp.k <= 0.01 && a.name !== 'rest_rise') return false;
      if (kp.dir < 0 || kp.k <= 0.01) {
        if (a.name !== 'rest_rise') animPlay(a, 'rest_rise');
        else if (a.done) { animPlay(a, p.work && clips.read ? 'read' : 'idle'); return true; }
      } else if (a.name !== 'rest_kneel' && a.name !== 'rest_loop') {
        animPlay(a, 'rest_kneel');
      } else if (a.name === 'rest_kneel' && a.done) {
        animPlay(a, 'rest_loop');
      }
      animTick(a, dt);
      return true;
    }
    return false;
  },

  /* Draw distinct animated world NPCs (wanderer, keeper, bot, shroud) + natural Meiko kneeling! */
  drawShade(g, p, idx, cx, cy, t, emi) {
    const ny = p.gy != null ? p.gy : p.y;
    const base = p.look === 'wanderer' && sprRect('npc_wanderer', 0) ? 'npc_wanderer'
      : p.look === 'keeper' && sprRect('npc_keeper', 0) ? 'npc_keeper'
      : p.look === 'bot' && sprRect('npc_bot', 0) ? 'npc_bot'
      : 'npc_shade';
    const knName = base + '_kneel';
    const sheet = emi ? Art.kit.emi : Art.kit.col;
    if (!sheet) return;

    const drawSpr = (sname, fi, flip) => {
      const r = sprRect(sname, fi) || sprRect(sname, 0);
      if (!r) return;
      const dx = Math.round(p.x - (r[2] >> 1) - cx), dy = Math.round(ny - r[3] - cy);
      if (!flip) {
        g.drawImage(sheet, r[0], r[1], r[2], r[3], dx, dy, r[2], r[3]);
      } else {
        g.save();
        g.translate(dx + r[2], dy);
        g.scale(-1, 1);
        g.drawImage(sheet, r[0], r[1], r[2], r[3], 0, 0, r[2], r[3]);
        g.restore();
      }
    };

    const faceLeft = (P.x + P.w / 2) < p.x;
    const idleFi = ((t * 2.4 + idx * 1.3) | 0) % Math.max(1, sprFrames(base));

    if (this.kind() !== 'meiko') {
      drawSpr(base, idleFi, faceLeft);
      return;
    }
    const kp = this.kneelProgress('npc:' + (p.id || idx), p.x, ny, t);
    if (kp.k <= 0.04 || !sprRect(knName, 0)) {
      drawSpr(base, idleFi, faceLeft);
      return;
    }
    let fi;
    if (kp.k < 0.36) fi = 0;
    else if (kp.k < 0.70) fi = 1;
    else if (kp.k < 0.96) fi = 2;
    else if (kp.talking) fi = 5;
    else fi = 3 + (((t * 1.6 + idx) | 0) & 1);
    drawSpr(knName, fi, kp.flip);
  },

  /* ---------------- Dialogue & Throne Room Meeting ---------------- */
  dialogue(d) {
    if (this.kind() !== 'meiko' || !Array.isArray(d) || !d.length) return d;
    const b = d[0] || {}, w = String(b.who || ''), id = String((b.lines && b.lines[0]) || '');
    if (b.choices || /^(note_|cv_|ach\.|zone\.|still\.|end\.|ui\.|meiko\.)/.test(id) || !w) return d;
    return [{ who: w, cls: b.cls || 'npc', lines: ['meiko.praise.1', 'meiko.praise.2'] }];
  },

  meeting() {
    G.flags.bossSeen = true; G.flags.meikoHappy = false; save();
    BOSS.active = true; BOSS.x = ZONES.arena.bossX - 24;
    BOSS.pose = 'kneel'; // Shyn kneels on one knee before Meiko in awe!
    BOSS.repose = 1; BOSS.face = -1;
    BOSS.lift = 0; BOSS.ov = false;
    P.x = BOSS.x - 56; P.face = 1; P.vx = 0; P.vy = 0;
    el('fight').classList.remove('on');
    G.scene = 'world'; G.meikoMeeting = true;
    Sound.ambience('arena', .9);
    Dlg.open([{ who: 'who.shyn', cls: 'shyn', lines: ['meiko.keeper.1', 'meiko.keeper.2', 'meiko.keeper.3'] }], () => {
      G.meikoMeeting = false; G.flags.meikoHappy = true;
      showEnding();
    });
  },

  /* Sync poses & draw Shyn's offered royal sleeve + sacred golden starlight bond during G.meikoMeeting */
  drawMeeting(g, cx, cy, gy, t, emi) {
    if (!G.meikoMeeting || !BOSS.active) return;
    // Line 0: Shyn kneels in awe; Line 1: Shyn kneels & offers his hand while Meiko reaches out; Line 2: Shyn rises!
    const li = Dlg.on ? Dlg.li : 2;
    if (li === 1) {
      const ax = Math.round(BOSS.x - 38 - cx), ay = Math.round(gy - 43 - cy);
      if (!emi) {
        if (sprRect('shyn_offer_arm', 0)) spr(g, 'shyn_offer_arm', ax, ay, 0);
      } else {
        // Sacred golden starlight bond glowing right where Meiko's and Shyn's fingers meet!
        const bx = ax + 2, by = ay + 5, p = ((t * 5) | 0) & 1;
        g.fillStyle = palHex('gold3'); g.fillRect(bx - 3, by - 1, 7, 3); g.fillRect(bx - 1, by - 3, 3, 7);
        g.fillStyle = palHex('gold4'); g.fillRect(bx - 2, by, 5, 1); g.fillRect(bx, by - 2, 1, 5);
        g.fillStyle = palHex('rune5'); g.fillRect(bx - (p ? 0 : 1), by, p ? 1 : 3, 1); g.fillRect(bx, by - (p ? 0 : 1), 1, p ? 1 : 3);
      }
    } else if (li >= 2 && emi) {
      // Line 2 ("Together, we will make a home full of light"): rising starlight blessing between them!
      const mx = Math.round(BOSS.x - 28 - cx), my = Math.round(gy - 44 - cy), p = ((t * 6) | 0) & 1;
      g.fillStyle = palHex('gold4'); g.fillRect(mx - 2, my, 5, 1); g.fillRect(mx, my - 2, 1, 5);
      g.fillStyle = palHex('rune5'); g.fillRect(mx, my, 1, 1);
      if (p) { g.fillStyle = palHex('gold3'); g.fillRect(mx - 8, my - 10, 2, 2); g.fillRect(mx + 7, my - 14, 2, 2); }
    }
  }
};

/* ---------------- Portraits for Miku & Meiko (cut 2x from their authored pixel-art rigs!) ---------------- */
{
  const prevPortrait = getPortrait;
  getPortrait = function (kind) {
    const sk = kind === 'player' && Special.kind();
    const R = sk && Art.rigs[sk];
    if (!R || !R.def.meta.portrait) return prevPortrait(kind);
    const key = 'rig:special:' + sk;
    if (!PORTR[key]) {
      const c = mk(46, 46), g = c.getContext('2d'), d = R.def, p = d.meta.portrait, f = d.clips.idle.f[0][0];
      g.imageSmoothingEnabled = false;
      g.fillStyle = palHex('void1'); g.fillRect(0, 0, 46, 46);
      const B4 = [[0, 8, 2, 10], [12, 4, 14, 6], [3, 11, 1, 9], [15, 7, 13, 5]];
      if (sk === 'meiko') {
        // Warm Bayer-dithered golden halo portrait backdrop
        for (let y = 0; y < 46; y++) for (let x = 0; x < 46; x++) {
          const r = Math.hypot(x - 23, y - 19), b = B4[y & 3][x & 3] / 16;
          if (r < 11) g.fillStyle = b < 0.45 ? palHex('gold3') : palHex('gold2');
          else if (r < 17) g.fillStyle = b < (17 - r) / 6 ? palHex('gold2') : palHex('gold1');
          else if (r < 23 && b < (23 - r) / 6) g.fillStyle = palHex('gold0');
          else continue;
          g.fillRect(x, y, 1, 1);
        }
        g.fillStyle = palHex('gold1'); g.fillRect(0, 36, 46, 10);
        g.fillStyle = palHex('gold3'); g.fillRect(0, 36, 46, 1);
      } else {
        // Crisp cyan cyber-stage spotlight backdrop for Miku
        for (let y = 0; y < 46; y++) for (let x = 0; x < 46; x++) {
          const r = Math.hypot(x - 23, y - 20), b = B4[y & 3][x & 3] / 16;
          if (r < 13) g.fillStyle = b < 0.4 ? palHex('cold2') : palHex('cold1');
          else if (r < 20 && b < (20 - r) / 7) g.fillStyle = palHex('cold0');
          else continue;
          g.fillRect(x, y, 1, 1);
        }
        g.fillStyle = palHex('cold0'); g.fillRect(0, 34, 46, 12);
        g.fillStyle = palHex('cold3'); g.fillRect(0, 34, 46, 1);
      }
      g.drawImage(R.cv[0][0], (f % d.cols) * d.fw + p[0], ((f / d.cols) | 0) * d.fh + p[1], p[2], p[3], 0, 0, p[2] * 2, p[3] * 2);
      if (sk === 'meiko') {
        // Subtle sacred halo shimmer arc at top of portrait
        g.fillStyle = palHex('gold4'); g.fillRect(15, 2, 16, 1); g.fillRect(13, 3, 3, 1); g.fillRect(30, 3, 3, 1);
        g.fillStyle = palHex('rune5'); g.fillRect(21, 1, 4, 1);
      }
      PORTR[key] = c;
    }
    return PORTR[key];
  };
}


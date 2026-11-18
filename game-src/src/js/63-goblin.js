/* ==========================================================================
   63 · THE BUDGET GOBLIN  (Chamber 499)

   An accountant behind his desk. He promises the one missing point, drops a
   shining coin, and the coin is a trap: the screen cracks, the Recruiter
   falls, every point is lost and he laughs in the dark.

   To edit
     · his words ............ DC.goblin_* in 10-content.js; the text is in STR (61-i18n.js): goblin_*, goblin.ui.*, goblin.final.*
     · where he sits ........ the `goblin` prop in 49-zones.js (x = centre of the desk)
     · how he looks ......... art-src/sets/goblin.mjs  (21 frames, the coin, the heaps, the furniture of the room)
     · the timing below ..... the T table (seconds after the coin is touched)
   ========================================================================== */
const Goblin = {
  T: { crack: .7, crack2: 1.25, dark: 2.5, laugh: 2.9, wake: 5.4 },   // seconds after the pickup
  coin: null,        // { x, y, vy, vx, rest } while the coin is in the world
  t: -1,             // time since the pickup, -1 = not running
  laughT: 0,         // he keeps laughing a while after you get up
  tossT: 0,
  cracks: null, crackCv: null, crackN: 0,
  _light: null, _dom: null, _plus: null,

  prop() { const ps = World.z && World.z.props; if (ps) for (let i = 0; i < ps.length; i++) if (ps[i].id === 'goblin') return ps[i]; return null; },

  /* ---------------- talking to him ---------------- */
  talk(p) {
    this.countStart = null;
    if (G.flags.coinTaken) { Dlg.open(DC.goblin_zero); return; }
    if (G.flags.coinOut) { Dlg.open(DC.goblin_wait); return; }
    const ask = {
      who: 'who.goblin', cls: 'npc',
      lines: ['goblin.ui.coin_waits', 'goblin.ui.shall_we_balance_the_books_recruiter'],
      choices: ['goblin.ui.ask_coin', 'goblin.ui.walk_away'],
      onChoose: (i) => {
        if (i === 1) { Dlg.open(DC.goblin_accept); return; }
        Dlg.open(DC.goblin_coin, () => this.toss(p));
      }
    };
    G.flags.goblinDone = true;
    save(); // preserve the visitor's actual score
    Dlg.open(DC.goblin_intro.concat([ask]));
  },

  count() { this.countStart = G.time; },
  shownScore() { return this.countStart == null ? G.score : Math.round(G.score * clamp((G.time - this.countStart) / 2, 0, 1)); },
  /* ---------------- the coin ---------------- */
  toss(p) {
    const pcx = P.x + P.w / 2, right = pcx > p.x + 54;
    const tx = right ? clamp(pcx + 48, p.x + 66, World.w - 60) : clamp(pcx - 48, 100, p.x - 62);
    const x0 = p.x + (right ? 24 : -24), y0 = p.gy - 52, air = .62;
    this.coin = { x: x0, y: y0, vx: (tx - x0) / air, vy: -210, rest: false, gy: p.gy - 11, hops: 0 };
    this.tossT = .5;
    G.flags.coinOut = true; save();
    Sound.coin();
  },
  rest(p) {                                           // the coin already lies on the floor (after a reload)
    const x = clamp(p.x - 110, 100, p.x - 62);
    this.coin = { x, y: p.gy - 11, vx: 0, vy: 0, rest: true, gy: p.gy - 11, hops: 9 };
  },
  light(on) {
    if (on && !this._light && this.coin) this._light = World.addLight(this.coin.x + 5, this.coin.y + 4, 40, 'gold', true);
    if (this._light) { this._light.on = on ? 1 : 0; if (on && this.coin) { this._light.x = this.coin.x + 5; this._light.y = this.coin.y + 4; } }
  },

  update(dt) {
    if (G.zone !== 'room499') { if (this.coin || this._light) { this.coin = null; this._light = null; } return; }
    const p = this.prop(); if (!p) return;
    if (this._light && World.lights.indexOf(this._light) < 0) this._light = null;      // the zone was rebuilt
    if (this.laughT > 0) { this.laughT -= dt; if (!REDUCED && ((G.time * 6) | 0) !== (((G.time - dt) * 6) | 0) && this.laughT > 2.4) Sound.talk('npc'); }
    if (this.tossT > 0) this.tossT -= dt;
    if (this.t >= 0) { this.scene(dt, p); return; }
    if (G.flags.coinOut && !G.flags.coinTaken && !this.coin) this.rest(p);
    const c = this.coin; if (!c) return;
    if (!c.rest) {
      c.vy += 900 * dt; c.x += c.vx * dt; c.y += c.vy * dt;
      if (c.y >= c.gy) {
        c.y = c.gy; c.hops++;
        if (c.hops >= 3 || Math.abs(c.vy) < 70) { c.rest = true; c.vx = c.vy = 0; }
        else { c.vy *= -.42; c.vx *= .35; Sound.coin(true); }
      }
    } else if (!REDUCED && hash2((G.time * 7) | 0, 3, 5) > .55 && ((G.time * 7) | 0) !== (((G.time - dt) * 7) | 0)) {
      fxPix(c.x + 2 + Math.random() * 7, c.y + 1 + Math.random() * 6, (Math.random() - .5) * 8, -14 - Math.random() * 12, .7, PIX.gold4, PIX.gold3, 1, 0, 0);   // it glitters
    }
    this.light(true);
    if (c.rest && G.scene === 'world' && !Dlg.on && G.fadeDir === 0 && Math.abs(P.x + P.w / 2 - (c.x + 5)) < 9 && P.y + P.h > c.gy - 8) this.take();
  },

  /* ---------------- the trap ---------------- */
  take() {
    const c = this.coin;
    this.t = 0; this._s = 0; this.crackN = 0; this.cracks = null; this.page = 0; this.pageT = 0;
    this.ox = Math.round(c.x + 5 - Math.round(G.camX)); this.oy = Math.round(c.y + 5 - Math.round(G.camY));      // where the coin is on screen: the cracks start there
    G.scene = 'coin'; P.vx = 0; P.vy = 0; Keys.left = Keys.right = false;
    G.flags.coinTaken = true; G.flags.goblinDone = true;
    G.score = 0;                                        // the points are gone the moment you touch it (a reload cannot save them)
    countDeath(); save();
    showPrompt(null);
    el('hudScore').textContent = '500 / 500';           // for one heartbeat the promise looks kept
    Sound.coin(); Sound.ach();
    this.light(true);
  },
  scene(dt, p) {
    const T = this.T, t0 = this.t; this.t += dt; const t = this.t, at = (s) => t0 < s && t >= s;
    const c = this.coin;
    if (c && t < T.crack) { c.y = c.gy - Math.min(26, t * 60); this.light(true); }
    if (at(T.crack)) {
      this.buildCracks(); Sound.crack(); if (!REDUCED) { G.shake = 5; G.flash = .5; }
      this.coin = null; this.light(false); this.laughT = 99;
      burst(this.ox + Math.round(G.camX), this.oy + Math.round(G.camY), 'rgba(255,214,130,', 14, 90);
    }
    if (at(T.crack2)) {
      Sound.crack(true); if (!REDUCED) G.shake = 7;
      setDet(0, true); P.hurt = 1.2; Music.stop();
    }
    if (t >= T.crack2 && t < T.dark) {                  // the ledger drains
      const k = clamp((t - T.crack2) / (T.dark - T.crack2 - .15), 0, 1), n = Math.round(500 * (1 - k) * (1 - k));
      const s = n + ' / 500'; if (el('hudScore').textContent !== s) { el('hudScore').textContent = s; if (n % 3 === 0) Sound.talk('player'); }
    }
    if (at(T.dark)) { P.visible = false; el('stage').classList.add('void'); this.dom().classList.add('on'); this.domText(); hudSync(); }
    if (at(T.laugh)) { Sound.laugh(); this.dom().classList.add('laugh'); }
    if (at(T.wake)) this.dom().classList.add('more');                                  // from here E / a tap turns the page
    if (t >= T.wake && this.page < this.PAGES && t - Math.max(this.pageT, T.wake) > this.hold()) this.turn();   // ...and the pages turn by themselves for a reader who waits
    if (this.page === this.PAGES && t - this.pageT > .9) this.dom().classList.add('ready');
    if (this.cracks) this.crackN = REDUCED ? this.cracks.length : Math.min(this.cracks.length, Math.floor(this.cracks.length * clamp((t - T.crack) / .28, 0, .5) + (t >= T.crack2 ? this.cracks.length * clamp((t - T.crack2) / .22, 0, .5) : 0)));
  },
  /* The dark screen has five pages: the loss, then the four paragraphs goblin.final.1 - 4 (the last one is the point of the joke). */
  PAGES: 4,
  hold() { return this.page === 0 ? 1.4 : 2.4 + tr('goblin.final.' + this.page).length * (LANG === 'ja' ? .09 : .045); },
  turn() {
    this.page++; this.pageT = this.t;
    const d = this.dom(); d.classList.remove('turn'); void d.offsetWidth; d.classList.add('turn');
    d.classList.toggle('more', this.page < this.PAGES);
    this.domText(); Sound.talk('npc');
  },
  /** E / tap on the dark screen: next page, and after the last page, get up */
  wake() {
    if (G.scene !== 'coin' || this.t < this.T.wake) return;
    if (this.page < this.PAGES) { if (this.t - Math.max(this.pageT, this.T.wake) > .35) this.turn(); return; }
    if (this.t - this.pageT < .9) return;
    const z = World.z, d = this.dom();
    d.classList.remove('on', 'laugh', 'ready', 'more', 'turn');
    el('stage').classList.remove('void');
    this.t = -1; this.cracks = null; this.crackN = 0; this.laughT = 4.2;
    P.x = z.startX - P.w / 2; P.vx = P.vy = 0; P.face = 1; P.hurt = 0; P.visible = true;
    P.act = 'materialize'; if (P.anim) animPlay(P.anim, 'materialize', true);
    setDet((typeof Roster !== 'undefined' ? Roster.hp() : 5), true);
    G.scene = 'world'; G.fade = 1; G.fadeDir = -1;
    Sound.ambience(z.mood, .85);
    hudSync(); save();
    setTimeout(() => unlock('goblin'), 1400);
  },

  /* ---------------- the dark screen (HTML, so the Persian is real text) ---------------- */
  dom() {
    if (this._dom) return this._dom;
    const d = document.createElement('div'); d.id = 'coinEnd'; d.className = 'ov';
    d.innerHTML = '<div class="center"><div class="hee" id="ceHee"></div><div class="num" dir="ltr">0 / 500</div><div class="l1" id="ceL1"></div><div class="l2" id="ceL2"></div><div class="nx">▼</div><div class="ret" id="ceRet"></div></div>';
    el('stage').appendChild(d);
    d.addEventListener('pointerdown', (e) => { e.preventDefault(); Sound.resume(); this.wake(); });
    return this._dom = d;
  },
  domText() {
    if (!this._dom) return;
    el('ceHee').textContent = tr('goblin.ui.hee_hee_hee');
    el('ceL1').textContent = tr(this.page ? 'goblin.final.' + this.page : 'goblin.ui.all_your_points_are_gone');
    el('ceL2').textContent = this.page ? '' : tr('goblin.ui.there_was_never_a_discount');
    el('ceRet').textContent = tr(Touch.on ? 'goblin.ui.tap_to_get_up' : 'goblin.ui.press_e_to_get_up');
  },

  /* ---------------- drawing ---------------- */
  /* Which of the frames (art-src/sets/goblin.mjs) is on screen.
     Idle = the quill loop (frames 0-7, he breathes with it) with small events mixed in at random times, so it never
     repeats mechanically: a blink, an ear twitch, a bead clicked on the abacus, a puff on the cigar, a glance at you. */
  idle: { blink: 1.6, ear: 3.4, tap: 5.2, look: 4.1, puff: 7.5, cur: '', left: 0, last: -1, dir: 0, n: 0 },
  frame(t) {
    if (typeof Special !== 'undefined' && Special.kind() === 'meiko') {
      const p = this.prop(), kp = Special.kneelProgress('goblin', p ? p.x : 320, p ? p.gy : 272, t);
      if (kp.k >= 0.70 && sprRect('npc_goblin', 24)) {
        if (Dlg.on && G.zone === 'room499') return Dlg.typing ? (22 + (((t * 7) | 0) % 3 === 0 ? 0 : 2)) : 24;
        return 22 + (((t * 1.8) | 0) & 1);
      }
      if (kp.k > 0.16 && sprRect('npc_goblin', 21)) return 21;
    }
    if (this.laughT > 0 || (this.t >= this.T.crack)) return 10 + (((t * 7) | 0) & 1);
    if (this.tossT > 0) return 9;
    if (Dlg.on && el('dlgWho').textContent && Dlg.cls === 'npc' && G.zone === 'room499') return Dlg.typing ? 8 + (((t * 8) | 0) & 1) : 8;
    const I = this.idle, dt = I.last < 0 ? 0 : Math.min(.1, Math.max(0, t - I.last)); I.last = t;
    const rnd = (a, b) => a + Math.random() * (b - a);
    if (I.cur) { I.left -= dt; if (I.left <= 0) I.cur = ''; }
    else for (const k of ['blink', 'ear', 'tap', 'look', 'puff']) {
      I[k] -= dt;
      if (I[k] <= 0 && !I.cur) {
        I.cur = k; I.n++;
        I.left = { blink: rnd(.1, .16), ear: rnd(.24, .4), tap: rnd(.7, 1.3), look: rnd(.8, 1.7), puff: rnd(.6, .9) }[k];
        I[k] = { blink: rnd(1.4, 4.6), ear: rnd(3, 8), tap: rnd(4, 9), look: rnd(3.5, 8), puff: rnd(6, 12) }[k];
        const p = this.prop(); I.dir = p && P.x + P.w / 2 < p.x ? 15 : 16;       // he glances to the side you stand on
      }
    }
    switch (I.cur) {
      case 'blink': return 12;
      case 'ear': return 13 + (((t * 9) | 0) & 1);
      case 'tap': return 17 + (((t * 6) | 0) & 1);
      case 'look': return I.dir;
      case 'puff': return I.left > .3 ? 20 : 19;
    }
    return [0, 1, 2, 3, 2, 1, 0, 7][((t * 4.5) | 0) % 8];
  },
  /* dust in the lamp light and a thread of cigar smoke: a few single pixels, no blending */
  motes(g, p, cx, cy, t) {
    for (let i = 0; i < 22; i++) {
      const lamp = i % 3, bx = [p.x - 96, p.x + 2, p.x + 118][lamp], by = [150, 120, 150][lamp];
      const x = bx + Math.sin(t * (.21 + i * .017) + i * 2.1) * (26 + (i % 5) * 6), y = by + ((i * 37 + t * (3 + (i % 4))) % 120);
      if (((i + ((t * 2.5) | 0)) % 4) === 0) continue;                                   // each mote winks
      g.fillStyle = i % 4 === 0 ? '#c9a45a' : '#8a6c3c'; g.fillRect(Math.round(x - cx), Math.round(y - cy), 1, 1);
    }
    if (this.laughT <= 0 && this.t < 0) {
      const bowed = this._f >= 21;
      const sx = bowed ? p.x - 9 : p.x + 18, sy = bowed ? p.gy - 34 : p.gy - 50;
      for (let k = 0; k < 5; k++) {
        const a = (t * .55 + k * .2) % 1, x = sx + Math.sin(a * 6 + k) * 2.4 + a * 5, y = sy - a * 26;
        if (((k + ((t * 5) | 0)) & 1) && a > .08) { g.fillStyle = a < .5 ? '#9a938c' : '#5e5964'; g.fillRect(Math.round(x - cx), Math.round(y - cy), 1, 1); }
      }
    }
  },
  draw(g, p, cx, cy, t) {
    this._f = this.frame(t);
    spr(g, 'npc_goblin', p.x - 50 - cx, p.gy - 78 - cy, this._f);
    const n = trNum(this.shownScore()), cacheKey = LANG + ':' + n;
    if (this._digitsN !== cacheKey) { this._digitsN = cacheKey; const make = LANG === 'fa' || LANG === 'ar' ? nameTag : pixText; this._deskDigits = make(n, '#231b19', null); this._signDigits = make(n, '#ffe4a0', '#38271b'); }
    const desk = this._deskDigits, deskScale = Math.min(1, 12 / desk.width, 7 / desk.height); g.drawImage(desk, p.x - cx - desk.width * deskScale / 2, p.gy - cy - 21, desk.width * deskScale, desk.height * deskScale);
    const sign = this._signDigits;
    g.save(); g.imageSmoothingEnabled = false; const scale = Math.min(2, 38 / sign.width); g.drawImage(sign, 370 - cx - sign.width * scale / 2, 57 - cy, sign.width * scale, sign.height * scale); g.restore();
    this.motes(g, p, cx, cy, t);
    const c = this.coin; if (c) spr(g, 'coin', c.x - cx, c.y - cy, c.rest && this.t < 0 ? ((t * 7) | 0) % 6 : ((t * 16) | 0) % 6);
  },
  drawE(E, cx, cy, t) {
    const p = G.zone === 'room499' && this.prop(); if (!p) return;
    sprE(E, 'npc_goblin', p.x - 50 - cx, p.gy - 78 - cy, this._f == null ? this.frame(t) : this._f);
    const c = this.coin; if (!c) return;
    sprE(E, 'coin', c.x - cx, c.y - cy, c.rest && this.t < 0 ? ((t * 7) | 0) % 6 : ((t * 16) | 0) % 6);
    if (((t * 4) | 0) % 3 === 0 || this.t >= 0) {       // a four-point glint
      const x = Math.round(c.x - cx) + 8, y = Math.round(c.y - cy) + 1, r = this.t >= 0 ? 4 : 2;
      E.fillStyle = PIX.gold4; E.fillRect(x - r, y, r * 2 + 1, 1); E.fillRect(x, y - r, 1, r * 2 + 1);
    }
    if (this.t >= 0 && this.t < this.T.crack) {
      if (!this._plus) this._plus = pixText('500', PIX.gold4, '#0b0714');
      E.drawImage(this._plus, Math.round(c.x - cx) + 5 - (this._plus.width >> 1), Math.round(c.y - cy) - 12);
    }
  },
  /** struck glass: straight rays from the coin, a few forks, broken rings of chords between the rays.
      Built once as a list of pixels [x, y, order, weight] in the order they open. */
  buildCracks() {
    const rnd = mulberry32(499), px = [], ox = this.ox, oy = this.oy, N = 13, rays = [];
    const seg = (x0, y0, x1, y1, d, w) => { const n = Math.max(1, Math.ceil(Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0)))); for (let i = 0; i <= n; i++) px.push([Math.round(x0 + (x1 - x0) * i / n), Math.round(y0 + (y1 - y0) * i / n), d + i, w]); return n; };
    const ray = (x, y, a, len, w, d, keep) => {
      let run = 0;
      while (len > 0 && x > -8 && x < VW + 8 && y > -8 && y < VH + 8) {
        const L = 16 + rnd() * 30, a2 = a + (rnd() - .5) * .34, nx = x + Math.cos(a2) * L, ny = y + Math.sin(a2) * L;
        seg(x, y, nx, ny, d, w); d += L; run += L; len -= L;
        if (keep) keep.push([run, nx, ny]);
        if (w < 2 && rnd() < .2) ray(nx, ny, a + (rnd() < .5 ? 1 : -1) * (.35 + rnd() * .45), len * .4, w + 1, d);
        x = nx; y = ny;
      }
    };
    for (let i = 0; i < N; i++) { const k = []; rays.push(k); ray(ox, oy, (i + .15 + rnd() * .7) / N * Math.PI * 2, 560, 0, 0, k); }
    const at = (k, r) => { for (let i = 0; i < k.length; i++) if (k[i][0] >= r) return k[i]; return null; };
    for (const r of [22, 52, 96, 150]) for (let i = 0; i < N; i++) {                  // rings: chords from one ray to the next, some missing
      if (rnd() < .28) continue;
      const A = at(rays[i], r * (.8 + rnd() * .4)), B = at(rays[(i + 1) % N], r * (.8 + rnd() * .4));
      if (A && B) seg(A[1], A[2], B[1], B[2], r * 1.6, 1);
    }
    for (let i = 0; i < 26; i++) { const a = rnd() * 6.283, r = 6 + rnd() * 16; px.push([Math.round(ox + Math.cos(a) * r), Math.round(oy + Math.sin(a) * r), r, 0]); }   // crushed glass at the centre
    px.sort((a, b) => a[2] - b[2]);
    this.cracks = px; this.crackN = 0; this._drawn = 0;
    if (!this.crackCv) this.crackCv = mk(VW, VH);
    this.crackCv.getContext('2d').clearRect(0, 0, VW, VH);
  },
  over(g) {
    if (this.t < 0 || !this.cracks) return;
    const k = this.crackCv.getContext('2d');
    for (; this._drawn < this.crackN; this._drawn++) {
      const q = this.cracks[this._drawn];
      k.fillStyle = PIX.void0; k.fillRect(q[0] + 1, q[1] + 1, 1, 1); if (q[3] === 0) k.fillRect(q[0] - 1, q[1], 1, 1);
      k.fillStyle = q[3] === 0 ? PIX.bone4 : q[3] === 1 ? PIX.bone2 : PIX.bone1; k.fillRect(q[0], q[1], 1, 1);
    }
    if (this.t >= this.T.crack2) Dither.fill(g, 0, 0, VW, VH, PIX.void0, clamp((this.t - this.T.crack2) / (this.T.dark - this.T.crack2), 0, 1));
    g.drawImage(this.crackCv, 0, 0);
  }
};

document.addEventListener('langchange', () => { if (G.scene === 'coin') Goblin.domText(); });

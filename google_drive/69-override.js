/* ==========================================================================
   REALITY OVERRIDE — the terminal phase (Round 9 §8.2b).

   When the Keeper's health falls to the last threshold the picture breaks and the hall becomes a terminal.
   From then on every attack is WRITTEN before it happens: the terminal types one or two lines of code and runs them.

   The code on the screen and the attack are the same data. A program is a list of ops, for example
       [{ op: 'gravity', g: 0.5, s: 3 }, { op: 'loop', dir: -1, n: 2 }]
   and every op has two halves in OV_OPS:
       text(o)  →  the line the terminal types          run(o)  →  the hazards that appear
   Both read the same object, so they cannot disagree (tools/verify.mjs checks each op: probe(o) reports what
   really appeared, and the numbers must be the numbers in the text).
   OV_ATK is the list of attacks; each make(c) builds a program from what the terminal has read about the visitor
   (c = Boss.read(): position, health, weapon, last dodge, standing still, button mashing, last hit).
   ========================================================================== */
const OV = { FLOOR_Y: 0, W: 704 };
const ovX = (x) => Math.round(clamp(x, 40, World.W - 40));
const OV_OPS = {
  spawn: {
    text: (o) => 'spawn(blade, x=[' + o.x.join(', ') + '])',
    run(o) { o.x.forEach((x, i) => Fight.later(i * .12, () => { Fight.orb(false, x); const h = BOSS.haz[BOSS.haz.length - 1]; h.glyph = 1; h.tag = 'spawn'; })); },
    probe: () => BOSS.haz.filter((h) => h.tag === 'spawn').map((h) => h.x)
  },
  rain: {
    text: (o) => 'for (rune of sky.columns(' + o.from + ', ' + o.to + ', ' + o.step + ')) if (rune.x != ' + o.skip + ') rune.fall()',
    run(o) { Fight.later(.45, () => { for (let x = o.from; x <= o.to; x += o.step) if (x !== o.skip) { Fight.orb(false, x); const h = BOSS.haz[BOSS.haz.length - 1]; h.glyph = 1; h.tag = 'rain'; } }); },
    probe(o) { const xs = BOSS.haz.filter((h) => h.tag === 'rain').map((h) => h.x); return [Math.min(...xs, o.skip), Math.max(...xs, o.skip), xs.length > 1 ? Math.min(...xs.slice(1).map((x, i) => Math.abs(x - xs[i])).filter((d) => d > 0)) : o.step, xs.indexOf(o.skip) < 0 ? o.skip : -1]; }
  },
  gravity: {
    text: (o) => 'gravity.set(' + o.g.toFixed(1) + ', ' + o.s.toFixed(1) + 's)',
    run(o) { if (!Combat.grav0) Combat.grav0 = PHYS.grav; PHYS.grav = Combat.grav0 * o.g; Combat.slow = o.s; },
    probe: () => [Math.round(PHYS.grav / Combat.grav0 * 10) / 10, Math.round(Combat.slow * 10) / 10]
  },
  mirror: {
    text: (o) => 'player.controls.mirror(' + o.s.toFixed(1) + 's)',
    run(o) { Combat.mirror = o.s; },
    probe: () => [Math.round(Combat.mirror * 10) / 10]
  },
  strike: {
    text: (o) => 'strike(at=player.x)  // ' + o.x,
    run(o) {
      const b = BOSS; b.hide = true; b.mark = { x: o.x }; Sound.blink();
      Fight.later(.55, () => { b.x = o.x; b.hide = false; b.mark = null; b.pose = 'slash'; b.repose = 1; Sound.warn(false); });
      Fight.later(.85, () => { const gy = World.groundNear(b.x); const h = Fight.add({ k: 'slash', x: b.x - 60, y: gy - 66, w: 120, h: 66, warn: 0, life: .14, dmg: 1, parry: true, face: b.face }); h.tag = 'strike'; Sound.swing(true); });
    },
    probe: () => [BOSS.mark ? BOSS.mark.x : BOSS.x]
  },
  walls: {
    text: (o) => 'walls.close_in(gap=' + o.gap + ', center=' + o.at + ')',
    run(o) {
      const gy = World.groundNear(o.at), a = o.at - o.gap / 2, c = o.at + o.gap / 2;
      Fight.add({ k: 'wall', side: -1, x: 16, y: gy - 220, w: a - 16, h: 220, warn: 1.5, life: .6, dmg: 1, tag: 'walls' });
      Fight.add({ k: 'wall', side: 1, x: c, y: gy - 220, w: World.W - 16 - c, h: 220, warn: 1.5, life: .6, dmg: 1, tag: 'walls' });
    },
    probe() { const w = BOSS.haz.filter((h) => h.tag === 'walls'); const a = w[0].x + w[0].w, c = w[1].x; return [c - a, (a + c) / 2]; }
  },
  del: {
    text: (o) => 'floor.delete(' + o.from + ', ' + o.to + ')',
    run(o) { const gy = World.groundNear(o.from); Fight.add({ k: 'pit', x: o.from, y: gy - 6, w: o.to - o.from, h: 8, warn: 1.0, life: 1.6, dmg: 1, unblock: true, tag: 'del' }); },
    probe() { const h = BOSS.haz.find((q) => q.tag === 'del'); return [h.x, h.x + h.w]; }
  },
  loop: {
    text: (o) => 'while (true) { wave(dir=' + o.dir + ') }  // break after ' + o.n,
    run(o) { for (let i = 0; i < o.n; i++) Fight.later(.5 + i * .9, () => { const gy = World.groundNear(100); Fight.add({ k: 'wave', x: o.dir > 0 ? 18 : World.W - 32, y: gy - 14, w: 14, h: 14, vx: o.dir * 240, warn: 0, life: 3.2, dmg: 1, tag: 'loop' }); Sound.orb(); }); },
    probe() { const w = BOSS.haz.filter((h) => h.tag === 'loop'); return [Math.sign(w[0].vx), w.length]; }
  },
  err: {
    text: (o) => 'throw new Error("recruiter not found", { x: ' + o.x + ' })',
    run(o) {
      const gy = World.groundNear(o.x);
      Fight.add({ k: 'popup', x: o.x - 60, y: gy - 58, w: 120, h: 58, warn: 1.0, life: .25, dmg: 1, tag: 'err',
        label: pixText('ERROR', '#ff5d7a', null), label2: pixText('NOT FOUND', '#ff5d7a', null) });
      Sound.warn(true);
    },
    probe() { const h = BOSS.haz.find((q) => q.tag === 'err'); return [h.x + h.w / 2]; }
  },
  lattice: {
    text: (o) => 'lattice(rows=[' + o.rows.join(', ') + '], cols=[' + o.cols.join(', ') + '])',
    run(o) {
      const gy = World.groundNear(100);
      o.rows.forEach((r) => Fight.add({ k: 'beam', x: 16, y: gy - r - 4, w: World.W - 32, h: 8, warn: 1.1, life: .2, dmg: 1, parry: true, tag: 'row', row: r }));
      o.cols.forEach((x) => Fight.add({ k: 'col', x: x - 20, y: gy - 220, w: 40, h: 220, warn: 1.1, life: .35, dmg: 1, tag: 'colx' }));
    },
    probe() { return BOSS.haz.filter((h) => h.tag === 'row').map((h) => h.row).concat(BOSS.haz.filter((h) => h.tag === 'colx').map((h) => h.x + 20)); }
  },
  sudo: {
    text: (o) => 'sudo rm -rf ./recruiter --at ' + o.x,
    run(o) {
      const gy = World.groundNear(o.x);
      Fight.add({ k: 'beam', x: 16, y: gy - 22, w: World.W - 32, h: 16, warn: 1.1, life: .2, dmg: 1, parry: true, tag: 'sudo' });
      Fight.later(1.5, () => { for (let x = 44; x <= World.W - 44; x += 56) if (Math.abs(x - o.x) > 40) { Fight.orb(false, x); BOSS.haz[BOSS.haz.length - 1].glyph = 1; } });
      Fight.later(2.9, () => OV_OPS.strike.run({ x: o.x }));
      G.shake = Math.max(G.shake, Calm() ? 3 : 9); Sound.crash();
    },
    probe: () => [BOSS.x]                              // where the last blow of the command lands
  }
};
/* the attacks: w(c) = how much the terminal wants it, why(c) = the line it logs, make(c) = the program */
const OV_ATK = [
  { id: 'blades', w: () => 1.5, why: (c) => 'player.x = ' + Math.round(c.pcx) + ' — bracketing',
    make(c) { const n = c.php <= 2 ? 3 : 5, xs = []; for (let i = 0; i < n; i++) xs.push(ovX(c.pcx + (i - (n - 1) / 2) * 60)); return [{ op: 'spawn', x: xs }]; } },
  { id: 'rain', w: (c) => (c.lastDodge ? 2 : 1.4), why: (c) => 'last dodge: ' + (c.lastDodge < 0 ? 'left' : c.lastDodge > 0 ? 'right' : 'none') + ' — leaving the other side open',
    make(c) { const step = 56, from = 44, to = from + Math.floor((World.W - 88) / step) * step; let k = Math.round((c.pcx - (c.lastDodge || c.side) * 70 - from) / step); k = clamp(k, 0, (to - from) / step); return [{ op: 'rain', from, to, step, skip: from + k * step }]; } },
  { id: 'heavy', w: () => 1, why: (c) => 'player.hp = ' + c.php + (c.php <= 2 ? ' … adapting' : ' — pinning'),
    make(c) { const n = c.php <= 2 ? 2 : 3, xs = []; for (let i = 0; i < n; i++) xs.push(ovX(c.pcx + (i - (n - 1) / 2) * 70)); return [{ op: 'gravity', g: 2.2, s: 2.5 }, { op: 'spawn', x: xs }]; } },
  { id: 'float', w: () => 1, why: (c) => 'facing: ' + (c.facing < 0 ? 'left' : 'right') + ' — from behind',
    make(c) { return [{ op: 'gravity', g: .5, s: 3 }, { op: 'loop', dir: c.facing, n: c.php <= 2 ? 2 : 3 }]; } },
  { id: 'strike', w: (c) => (c.still > 1.3 ? 3.5 : c.ranged ? 2.2 : 1), why: (c) => (c.still > 1.3 ? 'idle ' + c.still.toFixed(1) + 's — targeting' : 'weapon: ' + c.wp + ' — closing distance'),
    make(c) { return [{ op: 'strike', x: ovX(c.pcx) }]; } },
  { id: 'walls', w: (c) => (c.ranged ? 2.5 : 1), why: (c) => 'weapon: ' + c.wp + ' — countering',
    make(c) { return [{ op: 'walls', gap: c.php <= 2 ? 160 : 130, at: Math.round(clamp(c.pcx - c.side * 90, 140, World.W - 140)) }]; } },
  { id: 'delete', w: (c) => (c.still > 1.3 ? 2.5 : 1), why: (c) => 'idle ' + c.still.toFixed(1) + 's — the floor is a variable',
    make(c) { const a = ovX(c.pcx - 56); return [{ op: 'del', from: a, to: a + 112 }]; } },
  { id: 'loop', w: () => 1.2, why: (c) => 'facing: ' + (c.facing < 0 ? 'left' : 'right') + ' — flanking',
    make(c) { return [{ op: 'loop', dir: c.facing, n: c.php <= 2 ? 2 : 3 }]; } },
  { id: 'error', w: (c) => (c.mash > 3 ? 3 : 1), why: (c) => 'input rate ' + c.mash.toFixed(1) + '/s — throttling',
    make(c) { return [{ op: 'err', x: ovX(c.pcx) }]; } },
  { id: 'mirror', w: (c) => (c.mash > 3 ? 2.2 : .8), why: (c) => 'input rate ' + c.mash.toFixed(1) + '/s — remapping',
    make(c) { return [{ op: 'mirror', s: 2 }, { op: 'loop', dir: -c.facing, n: 1 }]; } },
  { id: 'lattice', w: () => 1.2, why: (c) => 'hit taken ' + (c.hurtAgo > 60 ? 'never' : c.hurtAgo.toFixed(1) + 's ago') + ' — weaving',
    make(c) { const cols = [ovX(c.pcx - 80), ovX(c.pcx + 80)]; if (c.php > 2) cols.push(ovX(c.pcx + (c.side) * 170)); return [{ op: 'lattice', rows: [Math.random() < .5 ? 12 : 52], cols }]; } },
  { id: 'sudo', w: () => 0, why: () => 'permission denied — escalating',
    make(c) { const from = 44, k = clamp(Math.round((c.pcx - c.side * 60 - from) / 56), 0, 11); return [{ op: 'sudo', x: from + k * 56 }]; } }
];
const OV_SNIPPETS = [
  '<section class="arena">', 'display: grid; gap: 1rem;', 'const keeper = new Rune("root");', 'rune ᚱ { bind: threshold }', '@media (max-width: 390px) {',
  'if (!recruiter.persists) return;', '<canvas id="veyrath">', 'transform: translate(-3px, 0);', 'requestAnimationFrame(loop);', 'rune ᚲ { cast: glitch(0.8) }',
  '</body>', 'for (const tile of world) tile.rewrite();', 'direction: rtl;', 'export default reality;'
];

const Override = {
  term: false, stage: '', t: 0, dur: 0, count: 0, last: '', prog: null, text: '', typed: 0, lines: 0, n: 0, sudo: false, ran: [], flashAt: [],
  SPOTS: [130, 352, 574],
  /** 1 = every effect, 0 = the light version (slow phone: the last 60 frames averaged more than 11 ms of work) */
  quality() {
    if (this.forceLow) return 0;
    if (typeof Perf === 'undefined' || Perf.n < 120) return 1;
    let s = 0; for (let i = 1; i <= 60; i++) s += Perf.buf[(Perf.i - i + 6000) % 600];
    return s / 60 > 11 ? 0 : 1;
  },

  /* ---------------- into the terminal ---------------- */
  begin(retry) {
    const b = BOSS;
    b.ov = true; b.frozen = true; b.state = 'ovintro'; b.pose = 'idle'; b.hide = false; b.cue = null; b.haz.length = 0; b.minions.length = 0; b.sched.length = 0;
    this.count++; this.n = 0; this.sudo = false; this.ran.length = 0; this.last = '';
    Combat.act = ''; Combat.mv = null; bossSync();
    const go = () => { G.scene = 'boss'; if (!b.active) return; this.shatter(retry ? 1.0 : 2.8); };
    if (retry) go();
    else Dlg.open([{ who: 'who.shyn', cls: 'shyn', lines: ['shyn_override.1', 'shyn_override.2', 'shyn_override.3'] }], go);
  },
  /** reality breaks: tears, sorted pixels, moved tiles, falling code, a rising sound. Calm mode: a slow fade instead. */
  shatter(dur) {
    this.stage = 'break'; this.t = 0; this.dur = dur; this.flashAt = Calm() ? [] : [dur * .35, dur * .6, dur * .85].filter((x, i, a) => !i || x - a[i - 1] >= .4);
    el('stage').classList.add('glitching'); if (Calm()) el('stage').classList.add('calm'); else el('stage').classList.remove('calm');
    Sound.riser(dur); Sound.crush();
    if (typeof Music !== 'undefined' && Music.glitch) Music.glitch(dur);
    this.codeFall(dur);
  },
  codeFall(dur) {
    let box = el('codefall');
    if (!box) { box = document.createElement('div'); box.id = 'codefall'; box.dir = 'ltr'; box.setAttribute('data-noi18n', ''); box.setAttribute('aria-hidden', 'true'); el('stage').appendChild(box); }
    box.innerHTML = ''; box.className = 'on';
    const n = this.quality() ? 12 : 6;
    for (let i = 0; i < n; i++) {
      const s = document.createElement('span'); s.textContent = OV_SNIPPETS[i % OV_SNIPPETS.length];
      s.style.left = (4 + (i * 37) % 80) + '%'; s.style.animationDelay = (i * dur / n * .7).toFixed(2) + 's'; s.style.animationDuration = (1.1 + (i % 4) * .25).toFixed(2) + 's';
      box.appendChild(s);
    }
  },
  enter() {
    const b = BOSS, st = el('stage');
    this.stage = 'term'; this.term = true; st.classList.remove('glitching'); st.classList.add('term');
    const cf = el('codefall'); if (cf) cf.className = '';
    let t = el('term');
    if (!t) { t = document.createElement('div'); t.id = 'term'; t.dir = 'ltr'; t.setAttribute('data-noi18n', ''); st.appendChild(t); }
    t.className = 'on'; t.innerHTML = '<div class="tlog" id="termLog"></div><div class="tcmd"><span class="tp" id="termPrompt"></span><span id="termCmd"></span><i class="cur"></i></div>';
    this.prompt();
    this.log('reality.override() — session opened', 'sys'); this.log('reading recruiter …', 'sys');
    b.frozen = false; b.poise = b.poiseMax; G.flash = Calm() ? 0 : .5;
    if (typeof Music !== 'undefined' && Music.terminal) Music.terminal(true);
    this.next();
  },
  /** shayan@veyrath:~$ — the name stays scribbled until the reveal */
  prompt() {
    const p = el('termPrompt'); if (!p) return;
    p.textContent = '';
    if (Redact.shown()) p.appendChild(document.createTextNode(Redact.name('en').toLowerCase()));
    else { const s = document.createElement('span'); s.className = 'redacted'; s.setAttribute('data-name', ''); s.setAttribute('aria-label', '▒▒▒▒▒'); s.textContent = STR.en['name.decoy'].toLowerCase(); p.appendChild(s); }
    p.appendChild(document.createTextNode('@veyrath:~$ '));
  },
  log(text, cls) {
    const L = el('termLog'); if (!L) return;
    const d = document.createElement('div'); d.textContent = (cls === 'run' || cls === 'err' || cls === 'last' ? '' : '> ') + text; if (cls) d.className = cls;
    L.appendChild(d); while (L.children.length > 6) L.removeChild(L.firstChild);
  },

  /* ---------------- one written attack after another ---------------- */
  choose(c) {
    const b = BOSS, left = b.hp / (b.max * PHASE_AT[3]);
    if (!this.sudo && left < .38) { this.sudo = true; return OV_ATK[OV_ATK.length - 1]; }      // the finisher of the phase, once
    let sum = 0; const opts = [];
    OV_ATK.forEach((a) => { let w = a.w(c); if (a.id === this.last) w *= .1; if (this.ran.indexOf(a.id) < 0) w *= 1.6; if (w > 0) { opts.push([a, w]); sum += w; } });
    let r = Math.random() * sum;
    for (const [a, w] of opts) { r -= w; if (r <= 0) return a; }
    return opts[0][0];
  },
  /** builds the next program and the exact text the terminal will type for it */
  compile(a, c) { const prog = a.make(c); return { id: a.id, prog, text: prog.map((o) => OV_OPS[o.op].text(o)).join('\n'), why: a.why(c) }; },
  next() {
    const b = BOSS, c = Boss.read();
    // he stands where the visitor can reach him while the line is being typed
    const spots = this.SPOTS.filter((x) => Math.abs(x - c.pcx) > 70).sort((p, q) => Math.abs(p - c.pcx) - Math.abs(q - c.pcx));
    const tx = spots[c.ranged || Math.random() < .7 ? 0 : Math.min(1, spots.length - 1)];
    if (Math.abs(tx - b.x) > 30) { burst(b.x, World.groundNear(b.x) - 50, 'rgba(190,140,255,', 12, 110); Sound.blink(); }
    b.x = tx; b.face = c.pcx < b.x ? -1 : 1; b.hide = false; b.pose = 'summon'; b.repose = 1; b.lift = 0;
    const a = this.choose(c), job = this.compile(a, c);
    this.prog = job.prog; this.text = job.text; this.id = job.id; this.last = job.id; this.ran.push(job.id); this.n++;
    this.typed = 0; this.lines = 0; this.why = [job.why, 'player.x = ' + Math.round(c.pcx) + ', player.hp = ' + c.php];
    b.state = 'ovtype'; b.t = 0; el('termCmd').textContent = ''; el('termCmd').className = '';
    FightUI.hint(b.eased ? 'strike' : null);
  },
  update(dt) {
    const b = BOSS;
    if (b.state === 'ovtype') {
      if (this.lines < 2 && b.t > .05 + this.lines * .32) { this.log(this.why[1 - this.lines], 'read'); this.lines++; }
      if (b.t > .7) {
        const want = Math.min(this.text.length, Math.floor((b.t - .7) * (b.eased ? 24 : 34)));
        if (want > this.typed) { this.typed = want; el('termCmd').textContent = this.text.slice(0, want); if (want % 2 === 0) Sound.key(); }
        if (this.typed >= this.text.length && b.t > .7 + this.text.length / (b.eased ? 24 : 34) + .12) { b.state = 'ovexec'; b.t = 0; el('termCmd').className = 'run'; Sound.charge(); }
      }
    } else if (b.state === 'ovexec') {
      if (b.t > (b.eased ? .5 : .3)) {
        this.text.split('\n').forEach((l) => this.log(l, 'run'));
        el('termCmd').textContent = ''; el('termCmd').className = '';
        this.prog.forEach((o) => OV_OPS[o.op].run(o));
        b.state = 'ovrun'; b.t = 0; if (!b.hide) { b.pose = 'super'; b.repose = 1; }
        FightUI.hint(null);
      }
    } else if (b.state === 'ovrun') {
      if (b.t > .9 && !b.haz.length && !b.sched.length || b.t > 5) { b.state = 'ovrec'; b.t = 0; b.pose = 'idle'; b.hide = false; b.mark = null; FightUI.hint(b.eased ? 'strike' : null); }
    } else if (b.state === 'ovrec') {
      if (b.t > (b.eased ? 1.2 : .8)) this.next();
    } else if (b.state === 'ovstun') {
      if (b.t > 1.8) this.next();
    }
  },

  /* ---------------- the end of it: crash, the world written back ---------------- */
  crash() {
    const b = BOSS;
    b.state = 'dead'; b.frozen = true; b.pose = 'hurt'; b.repose = 1; b.haz.length = 0; b.sched.length = 0; b.hide = false; b.mark = null; FightUI.hint(null);
    if (Combat.grav0) PHYS.grav = Combat.grav0; Combat.mirror = 0;
    Combat.stop = .5; G.shake = Math.max(G.shake, Calm() ? 3 : 10); Sound.crash();
    this.stage = 'crash'; this.t = 0;
    const c = el('termCmd'); if (c) { c.textContent = ''; c.className = ''; }
    const trace = ['Uncaught RangeError: recruiter exceeded expectations', '    at Keeper.judge (veyrath.js:499:10)', '    at Trial.run (root.rune:3:1)', '    at reality.override (<anonymous>)', '[process exited with code 1]'];
    trace.forEach((l, i) => setTimeout(() => { if (this.stage === 'crash') { this.log(l, 'err'); Sound.key(); } }, 500 + i * 170));
    setTimeout(() => {
      if (this.stage !== 'crash') return;
      const L = el('termLog'); if (L) { const d = document.createElement('div'); d.className = 'last'; d.dir = RTL[LANG] ? 'rtl' : 'ltr'; d.textContent = tr('ov.last'); L.appendChild(d); while (L.children.length > 7) L.removeChild(L.firstChild); }
    }, 1700);
    setTimeout(() => { if (this.stage === 'crash') { const t = el('term'); if (t) t.classList.add('collapse'); } }, 4300);
    setTimeout(() => { if (this.stage === 'crash') this.restore(); }, 4800);
  },
  restore() {
    const st = el('stage');
    this.term = false; this.stage = 'restore'; this.t = 0; this.dur = 1.9; this.flashAt = [];
    st.classList.remove('term'); st.classList.add('glitching', 'healing'); if (Calm()) st.classList.add('calm');
    const t = el('term'); if (t) t.className = '';
    if (typeof Music !== 'undefined' && Music.terminal) Music.terminal(false);
    let cap = el('restoreCap'); if (!cap) { cap = document.createElement('div'); cap.id = 'restoreCap'; cap.setAttribute('data-noi18n', ''); st.appendChild(cap); }
    cap.textContent = tr('ov.restore'); cap.className = 'on';
    BOSS.pose = 'kneel'; BOSS.repose = 1; Sound.rune();
  },
  healed() {
    const st = el('stage'); st.classList.remove('glitching', 'healing', 'calm');
    const cap = el('restoreCap'); if (cap) cap.className = '';
    this.stage = ''; this.restored = (this.restored | 0) + 1;
    mercyScene(false);                                    // the name is revealed there (Redact.reveal), then he speaks
  },
  /** the visitor fell inside the terminal */
  panic(done) {
    const st = el('stage'); this.off();
    let p = el('panic'); if (!p) { p = document.createElement('div'); p.id = 'panic'; p.setAttribute('data-noi18n', ''); st.appendChild(p); }
    p.innerHTML = '<div class="pk" dir="ltr">KERNEL PANIC</div><div class="pl"></div><div class="ps"></div><div class="pc" dir="ltr">0x000001F3 · recruiter.exe · attempt ' + G.attempt + '</div>';
    p.querySelector('.pl').textContent = tr('ov.panic'); p.querySelector('.ps').textContent = tr('ov.panic.sub');
    p.className = 'on'; st.classList.add('void'); G.scene = 'panic'; Sound.crash();
    setTimeout(() => { p.className = ''; done(); }, 2400);
  },
  off() {
    const st = el('stage'); st.classList.remove('term', 'glitching', 'healing', 'calm');
    this.term = false; this.stage = '';
    ['term', 'codefall', 'restoreCap'].forEach((id) => { const n = el(id); if (n) n.className = ''; });
    if (Combat.grav0) PHYS.grav = Combat.grav0; Combat.mirror = 0; Combat.slow = 0;
    if (typeof Music !== 'undefined' && Music.terminal) Music.terminal(false);
  },
  /** timing of the two transitions (called every frame from update() in 70-main.js) */
  tick(dt) {
    if (this.stage !== 'break' && this.stage !== 'restore') return;
    this.t += dt;
    if (this.t >= this.dur) { if (this.stage === 'break') this.enter(); else this.healed(); }
  },

  /* ---------------- the picture ---------------- */
  /** the hall as a terminal: phosphor floor with a ruler (the code names x positions), the two figures, the hazards */
  render(g, cx, cy, t) {
    const gy = World.groundNear(100) - cy, calm = Calm();
    g.fillStyle = '#030806'; g.fillRect(0, 0, VW, VH);
    g.fillStyle = '#06140e'; for (let y = gy % 16; y < VH; y += 16) g.fillRect(0, y, VW, 1);
    for (let x = -(cx % 16); x < VW; x += 16) g.fillRect(x, 0, 1, gy);
    g.fillStyle = '#0d2a1c'; g.fillRect(0, gy, VW, VH - gy);
    g.fillStyle = '#39c27a'; g.fillRect(0, gy, VW, 1);
    for (let x = 100; x < World.W; x += 100) {                                   // the ruler
      const sx = x - cx; if (sx < -20 || sx > VW + 20) continue;
      g.fillStyle = '#39c27a'; g.fillRect(sx, gy, 1, 5);
      const c = this._num[x] || (this._num[x] = pixText(String(x), '#39c27a', null)); g.drawImage(c, sx - (c.width >> 1), gy + 8);
    }
    g.fillStyle = '#16402b'; for (let x = 50; x < World.W; x += 100) g.fillRect(x - cx, gy, 1, 3);
    if (G.zone === 'arena' && !BOSS.hide) {
      const a = SHYN_ANIM, want = a.rig && a.rig.def.clips[BOSS.pose] ? BOSS.pose : 'idle';
      if (a.name !== want || BOSS.repose) { animPlay(a, want, true); BOSS.repose = 0; }
      animTick(a, Math.min(.05, Math.max(0, t - (a._t || t)))); a._t = t;
      drawRig(g, a, Math.round(BOSS.x) - cx, World.groundNear(BOSS.x) - cy - (BOSS.lift | 0), BOSS.face || -1, -1, BOSS.flash > 0);
    }
    drawActors(g, cx, cy, t, false);
    // phosphor: everything drawn so far keeps its light and dark but turns green (slow phones: a plain green multiply)
    if (this.quality()) { g.globalCompositeOperation = 'color'; g.fillStyle = '#2fd47c'; g.fillRect(0, 0, VW, VH); g.globalCompositeOperation = 'lighter'; g.globalAlpha = .25; g.drawImage(cv, 0, 0, VW, VH, 0, 0, VW, VH); g.globalAlpha = 1; }
    else { g.globalCompositeOperation = 'multiply'; g.fillStyle = '#9dffc4'; g.fillRect(0, 0, VW, VH); }
    g.globalCompositeOperation = 'source-over';
    drawFX(1, cx, cy); drawFX(0, cx, cy);
    Fight.draw(g, cx, cy, t);
    if (Combat.mirror > 0) { const x = Math.round(P.x + P.w / 2) - cx, y = Math.round(P.y) - cy - 14; g.fillStyle = '#ff5d7a'; g.fillRect(x - 7, y, 14, 1); g.fillRect(x - 7, y - 1, 2, 3); g.fillRect(x + 5, y - 1, 2, 3); g.fillRect(x - 5, y - 2, 1, 5); g.fillRect(x + 4, y - 2, 1, 5); }
    if (!calm) { g.fillStyle = 'rgba(0,0,0,.18)'; for (let y = ((t * 30) | 0) % 3; y < VH; y += 3) g.fillRect(0, y, VW, 1); }
    else { g.fillStyle = 'rgba(0,0,0,.12)'; for (let y = 0; y < VH; y += 3) g.fillRect(0, y, VW, 1); }
    if (P.visible && Tag.cv && !Dlg.on && P.anim && P.anim.rig) g.drawImage(Tag.cv, Math.round(P.x + P.w / 2) - cx - (Tag.cv.width >> 1), Math.round(P.y + P.h) - cy + P.anim.rig.def.meta.headTop - 10);
    if (G.flash > 0 && !calm) Dither.fill(g, 0, 0, VW, VH, '#9dffc4', G.flash * .5);
  },
  _num: {},
  /** the break itself, painted over the finished frame: k = 0..1 how broken */
  post(g, t) {
    if (this.stage !== 'break' && this.stage !== 'restore') return;
    const p = clamp(this.t / this.dur, 0, 1), k = this.stage === 'break' ? p : (1 - p) * .8;
    if (Calm()) { Dither.fill(g, 0, 0, VW, VH, this.stage === 'break' ? '#030806' : PIX.void0, this.stage === 'break' ? p * .9 : (1 - p) * .9); return; }      // calm: one slow fade, nothing strobes
    const q = this.quality(), seed = (t * 14) | 0, rnd = (i) => hash2(i, seed, 11);
    const tears = 2 + Math.round(k * (q ? 7 : 3));
    for (let i = 0; i < tears; i++) {                                              // scanline tears
      const y = (rnd(i) * VH) | 0, h = 3 + ((rnd(i + 20) * 16) | 0), dx = Math.round((rnd(i + 40) - .5) * 70 * k);
      g.drawImage(cv, 0, y, VW, h, dx, y, VW, h);
    }
    for (let i = 0; i < Math.round(k * (q ? 3 : 1)); i++) {                         // pixel sorting: one row smeared downwards
      const x = (rnd(i + 60) * (VW - 80)) | 0, y = (rnd(i + 70) * (VH - 60)) | 0, w = 30 + ((rnd(i + 80) * 90) | 0);
      g.drawImage(cv, x, y, w, 1, x, y, w, 10 + ((k * 50) | 0));
    }
    for (let i = 0; i < Math.round(k * (q ? 12 : 4)); i++) {                        // tiles copied to the wrong place
      const sx = ((rnd(i + 100) * (VW / 16)) | 0) * 16, sy = ((rnd(i + 120) * (VH / 16)) | 0) * 16, dx = ((rnd(i + 140) * (VW / 16)) | 0) * 16, dy = ((rnd(i + 160) * (VH / 16)) | 0) * 16;
      g.drawImage(cv, sx, sy, 16, 16, dx, dy, 16, 16);
    }
    if (q && k > .25) {                                                             // colour split: the picture, shifted, in two tints
      const T = this._tmp || (this._tmp = mk(VW, VH)), tg = T.getContext('2d'), off = 2 + Math.round(k * 4);
      tg.globalCompositeOperation = 'copy'; tg.drawImage(cv, 0, 0); tg.globalCompositeOperation = 'multiply'; tg.fillStyle = '#ff2040'; tg.fillRect(0, 0, VW, VH);
      g.globalCompositeOperation = 'lighter'; g.globalAlpha = .35; g.drawImage(T, -off, 0);
      tg.globalCompositeOperation = 'copy'; tg.drawImage(cv, 0, 0); tg.globalCompositeOperation = 'multiply'; tg.fillStyle = '#20ffd0'; tg.fillRect(0, 0, VW, VH);
      g.drawImage(T, off, 0); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
    }
    for (let i = 0; i < this.flashAt.length; i++) if (this.t >= this.flashAt[i] && this.t < this.flashAt[i] + .05) {      // at most three inverted frames, never closer than 0.4 s
      g.globalCompositeOperation = 'difference'; g.fillStyle = '#ffffff'; g.fillRect(0, 0, VW, VH); g.globalCompositeOperation = 'source-over';
    }
    G.shake = Math.max(G.shake, 5 * k);
    if (this.stage === 'break' && p > .8) Dither.fill(g, 0, 0, VW, VH, '#030806', (p - .8) * 5);
  }
};

/* ==========================================================================
   BOSS MUSIC — "The Root Code", an epic piece for solo violin and strings.
   Synthesised live like the rest of the score (no audio files): bowed sawtooth
   voices with vibrato, a violin-body filter and a hall reverb.

   It starts when the Architect first speaks, grows with every phase of the fight,
   and ends on one long chord when the fight is over (BossMusic.finale()).

     level 0  he is speaking / the Attempt screen : a lone violin over a held bass
     level 1  phase one   : + driving string ostinato
     level 2  phase two   : + violins an octave above, timpani
     level 3  phase three : + the melody doubled in octaves, bass in eighths

   To change the piece: BARS is the harmony (one entry per bar), TUNE_A / TUNE_B
   are the melody as [midi note, length in sixteenths]; every bar must add up to 16.
   ========================================================================== */
const BossMusic = (() => {
  const BPM = 138, S = 60 / BPM / 4;                                   // S = one sixteenth note, in seconds
  // b = bass note, o = the four notes the ostinato walks through (D minor: i · i · VI · VII · i · iv · V · V)
  const DM = { b: 38, o: [50, 53, 57, 62] }, BB = { b: 34, o: [50, 53, 58, 62] }, CC = { b: 36, o: [52, 55, 60, 64] },
        GM = { b: 31, o: [50, 55, 58, 62] }, AA = { b: 33, o: [49, 52, 57, 61] };
  const BARS = [DM, DM, BB, CC, DM, GM, AA, AA];
  const OST = [0, 2, 3, 2, 1, 2, 3, 2, 0, 2, 3, 2, 1, 2, 3, 2];
  const TUNE_A = [
    [69, 6], [74, 2], [77, 8],
    [76, 4], [77, 2], [76, 2], [74, 8],
    [74, 6], [77, 2], [82, 8],
    [81, 4], [79, 4], [76, 4], [79, 4],
    [81, 10], [77, 2], [79, 2], [81, 2],
    [82, 6], [81, 2], [79, 8],
    [81, 4], [79, 2], [77, 2], [76, 4], [73, 4],
    [76, 6], [73, 2], [76, 4], [81, 4]
  ];
  const TUNE_B = [
    [74, 2], [76, 2], [77, 2], [81, 2], [86, 8],
    [84, 2], [82, 2], [81, 2], [79, 2], [81, 8],
    [82, 6], [81, 2], [79, 2], [77, 2], [74, 4],
    [76, 2], [79, 2], [84, 6], [82, 2], [81, 2], [79, 2],
    [81, 2], [86, 6], [84, 2], [82, 2], [81, 4],
    [79, 2], [82, 6], [81, 2], [79, 2], [77, 4],
    [76, 2], [77, 2], [79, 2], [81, 2], [85, 8],
    [88, 4], [85, 4], [81, 2], [79, 2], [77, 2], [76, 2]
  ];
  const LEAD = [];                                                     // sixteenth index -> the note that starts there
  { let at = 0; for (const n of TUNE_A.concat(TUNE_B)) { LEAD[at] = n; at += n[1]; } }
  const hz = (m) => 440 * Math.pow(2, (m - 69) / 12);

  let N = null, live = null;                                           // N = the audio graph in use
  let on = false, ending = false, step = 0, nextT = 0, timer = 0, endTimer = 0;

  /* the instrument: every voice goes through a "violin body" (three resonances) and into a hall */
  function build(c, dest) {
    const n = { c };
    n.master = c.createGain(); n.master.gain.value = 0;
    const comp = c.createDynamicsCompressor(); comp.threshold.value = -14; comp.ratio.value = 3; comp.attack.value = .01; comp.release.value = .25;
    n.master.connect(comp); comp.connect(dest);
    const peak = (f, q, db) => { const b = c.createBiquadFilter(); b.type = 'peaking'; b.frequency.value = f; b.Q.value = q; b.gain.value = db; return b; };
    const pass = (type, f, q) => { const b = c.createBiquadFilter(); b.type = type; b.frequency.value = f; b.Q.value = q || .7; return b; };
    const chain = (...a) => { for (let i = 0; i < a.length - 1; i++) a[i].connect(a[i + 1]); return a[0]; };
    const len = Math.floor(c.sampleRate * 2.3), ir = c.createBuffer(2, len, c.sampleRate), r = mulberry32(4991);
    for (let ch = 0; ch < 2; ch++) { const d = ir.getChannelData(ch); for (let i = 0; i < len; i++) d[i] = (r() * 2 - 1) * Math.pow(1 - i / len, 2.8); }
    const hall = c.createConvolver(); hall.buffer = ir;
    const wet = c.createGain(); wet.gain.value = .3; hall.connect(wet); wet.connect(n.master);
    const mix = c.createGain(); mix.connect(n.master); mix.connect(hall);
    n.solo = chain(pass('highpass', 190), peak(285, 2.2, 4), peak(470, 2.4, 3), peak(2750, 1.3, 7), pass('lowpass', 6200), mix);
    n.sect = chain(pass('highpass', 110), peak(300, 1.8, 3), peak(2400, 1.2, 4), pass('lowpass', 3600), mix);
    n.low = chain(pass('lowpass', 780), mix);
    return n;
  }

  /* a bowed note: soft attack, a swell, vibrato that arrives late like a real left hand */
  function bow(bus, midi, t, dur, vol, o) {
    const c = N.c, f = hz(midi), g = c.createGain(), att = Math.min(o.att, dur * .4), rel = o.rel;
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(vol * .85, t + att);
    g.gain.linearRampToValueAtTime(vol, t + Math.max(att + .01, dur * .55));
    g.gain.setValueAtTime(vol, t + Math.max(att + .02, dur - .02));
    g.gain.linearRampToValueAtTime(0, t + dur + rel);
    g.connect(bus);
    const end = t + dur + rel + .03, dets = o.two ? [-7, 7] : [0];
    let lg = null;
    if (o.vib && dur > .3) {
      const lfo = c.createOscillator(); lg = c.createGain();
      lfo.frequency.value = 5.4 + (midi % 5) * .12;
      lg.gain.setValueAtTime(0, t + .12); lg.gain.linearRampToValueAtTime(f * .0065, t + Math.min(dur * .7, .5));
      lfo.connect(lg); lfo.start(t); lfo.stop(end);
    }
    for (const d of dets) {
      const osc = c.createOscillator(); osc.type = 'sawtooth'; osc.frequency.value = f; osc.detune.value = d;
      if (lg) lg.connect(osc.frequency);
      osc.connect(g); osc.start(t); osc.stop(end);
    }
  }
  const solo = (m, t, d, v) => bow(N.solo, m, t, d, v, { att: d > .3 ? .07 : .025, rel: .07, vib: true });
  const spicc = (m, t, v) => bow(N.sect, m, t, S * .62, v, { att: .006, rel: .045, two: true });       // short bounced bow
  function cello(m, t, d, v, slow) {
    bow(N.low, m + 12, t, d, v, { att: slow ? .6 : .03, rel: .12, two: true });
    const c = N.c, o = c.createOscillator(), g = c.createGain();                                       // the double bass underneath
    o.frequency.value = hz(m); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(v * 1.1, t + (slow ? .6 : .03)); g.gain.linearRampToValueAtTime(0, t + d + .12);
    o.connect(g); g.connect(N.master); o.start(t); o.stop(t + d + .2);
  }
  function timp(t, m, v) {
    const c = N.c, o = c.createOscillator(), g = c.createGain(), f = hz(m + 12);
    o.frequency.setValueAtTime(f * 1.6, t); o.frequency.exponentialRampToValueAtTime(f, t + .09);
    g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(.001, t + .7);
    o.connect(g); g.connect(N.master); g.connect(N.low); o.start(t); o.stop(t + .75);
  }

  /* everything that sounds on sixteenth number i */
  function sched(i, t, lv) {
    const s = i % 16, ch = BARS[Math.floor(i / 16) % 8];
    if (lv === 0) { if (s === 0) cello(ch.b, t, S * 16.4, .075, true); }
    else if (lv < 3) { if (s % 8 === 0) cello(ch.b, t, S * 7.4, .11); }
    else if (s % 2 === 0) cello(ch.b, t, S * 1.7, s % 8 === 0 ? .11 : .07);
    if (lv >= 1) {
      const m = ch.o[OST[s]], acc = s % 4 === 0;
      spicc(m, t, acc ? .085 : .052);
      if (lv >= 2) spicc(m + 12, t, acc ? .046 : .03);
    }
    if (lv >= 2 && s === 0) timp(t, ch.b, .3);
    if (lv >= 3 && (s === 8 || s === 14)) timp(t, ch.b, .2);
    const n = LEAD[lv === 0 ? i % 128 : i % 256];
    if (n) {
      solo(n[0], t, n[1] * S * .97, lv === 0 ? .11 : lv === 3 ? .16 : .14);
      if (lv >= 3) solo(n[0] - 12, t, n[1] * S * .97, .08);
    }
  }
  /* the last chord: D minor, held, dying away */
  function lastChord(t) {
    timp(t, 38, .34);
    cello(38, t, 4.6, .12);
    [50, 57, 62, 65, 69].forEach((m, k) => bow(N.sect, m, t + k * .012, 4.4, .05, { att: .05, rel: 1.6, two: true, vib: true }));
    bow(N.solo, 74, t, 4.8, .12, { att: .06, rel: 1.9, vib: true });
  }

  function level() {
    if (typeof BOSS === 'undefined' || !BOSS.active || G.scene !== 'boss' || Dlg.on) return 0;
    // 0 while he only speaks, then one layer per phase — and below the terminal threshold it is always the top layer
    return BOSS.hp / BOSS.max <= PHASE_AT[3] ? 3 : 1 + Math.min(2, BOSS.phase);
  }
  function tick() {
    const c = Sound.ctx; if (!on || !c || !Sound.out || c.state !== 'running') return;
    if (!live || live.c !== c) live = build(c, Sound.out);
    N = live;
    const quiet = G.scene === 'attempt' ? .22 : .62;
    N.master.gain.setTargetAtTime(Sound.muted ? 0 : quiet, c.currentTime, .5);
    if (ending) return;
    if (nextT < c.currentTime) nextT = c.currentTime + .08;
    const lv = level();
    while (nextT < c.currentTime + .4) { sched(step, nextT, lv); step++; nextT += S; }
  }

  return {
    get on() { return on; },
    /** the fight begins (safe to call again while it is already playing) */
    start() {
      if (on && !ending) return;
      clearTimeout(endTimer);
      on = true; ending = false; step = 0; nextT = 0;
      if (!timer) timer = setInterval(tick, 100);
      tick();
    },
    /** the fight is over: one last chord, then silence */
    finale() {
      if (!on || ending) return;
      ending = true;
      const c = Sound.ctx;
      if (live && c && c.state === 'running') { N = live; lastChord(Math.max(nextT, c.currentTime + .05)); }
      endTimer = setTimeout(() => { on = false; ending = false; if (live && Sound.ctx) live.master.gain.setTargetAtTime(0, Sound.ctx.currentTime, .3); }, 7000);
    },
    /** cut at once (leaving the game, forgetting the save) */
    stop() { clearTimeout(endTimer); on = false; ending = false; if (live && Sound.ctx) live.master.gain.setTargetAtTime(0, Sound.ctx.currentTime, .2); },
    /** tools only: render `plan` = [[seconds, level], …] followed by the last chord, without playing it. Returns the two channels. */
    async offline(plan) {
      const total = plan.reduce((a, p) => a + p[0], 0) + 7.5, rate = 44100;
      const c = new OfflineAudioContext(2, Math.ceil(total * rate), rate), keep = N;
      N = build(c, c.destination); N.master.gain.value = .62;
      let t = .05, i = 0;
      for (const [sec, lv] of plan) { const stop = t + sec; while (t < stop) { sched(i, t, lv); i++; t += S; } }
      lastChord(t);
      N = keep;
      const buf = await c.startRendering();
      return [buf.getChannelData(0), buf.getChannelData(1)];
    }
  };
})();

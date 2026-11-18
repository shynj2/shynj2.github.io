const Sound = (() => {
  let ctx = null, master = null, muted = false;
  let amb = null, windNode = null, noiseBuf = null;

  function init() {
    if (ctx) return;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = muted ? 0 : 0.55;
    master.connect(ctx.destination);
    // 2 s of pink-ish noise, reused for wind / steps / impacts
    const len = ctx.sampleRate * 2;
    noiseBuf = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = noiseBuf.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0;
    for (let i = 0; i < len; i++) {
      const w = Math.random() * 2 - 1;
      b0 = 0.99765 * b0 + w * 0.0990460;
      b1 = 0.96300 * b1 + w * 0.2965164;
      b2 = 0.57000 * b2 + w * 1.0526913;
      d[i] = (b0 + b1 + b2 + w * 0.1848) * 0.16;
    }
  }
  function resume() {
    init();
    if (ctx && ctx.state === 'suspended') ctx.resume();
  }
  function now() { return ctx ? ctx.currentTime : 0; }
  function noise(vol) {
    const s = ctx.createBufferSource();
    s.buffer = noiseBuf; s.loop = true;
    const g = ctx.createGain(); g.gain.value = vol || 1;
    s.connect(g); return { src: s, gain: g };
  }

  /* ---- one-shots ---- */
  function tone(f0, f1, dur, type, vol, when) {
    if (!ctx || muted) return;
    const t = now() + (when || 0);
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type || 'sine';
    o.frequency.setValueAtTime(f0, t);
    if (f1 && f1 !== f0) o.frequency.exponentialRampToValueAtTime(Math.max(1, f1), t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol || 0.16, t + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(master);
    o.start(t); o.stop(t + dur + 0.05);
  }
  function burst(dur, freq, q, vol, type) {
    if (!ctx || muted) return;
    const t = now();
    const n = noise(1);
    const f = ctx.createBiquadFilter();
    f.type = type || 'bandpass'; f.frequency.value = freq; f.Q.value = q || 1;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol || 0.2, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    n.src.connect(f); f.connect(g); g.connect(master);
    n.src.start(t); n.src.stop(t + dur + 0.05);
  }

  /* ---- ambience bed: a zone drone + wind ---- */
  const MOODS = {
    workshop: { f: 55,  f2: 82.4, cut: 320, vol: .085, wind: .5 },
    forest:   { f: 65.4, f2: 98,   cut: 520, vol: .07,  wind: .85 },
    cathedral:{ f: 49,  f2: 73.4,  cut: 420, vol: .09,  wind: .35 },
    catacombs:{ f: 41.2, f2: 61.7, cut: 260, vol: .1,   wind: .6 },
    repository:{f: 58.3, f2: 87.3, cut: 380, vol: .075, wind: .7 },
    arena:    { f: 36.7, f2: 55,   cut: 520, vol: .11,  wind: .3 },
    room499:  { f: 73.4, f2: 110,  cut: 700, vol: .06,  wind: .2 },
    title:    { f: 43.6, f2: 65.4, cut: 240, vol: .08,  wind: .4 }
  };
  function ambience(mood, level) {
    if (!ctx) return;
    const m = MOODS[mood] || MOODS.workshop;
    const t = now();
    if (amb) { // fade out the old bed
      const old = amb;
      old.g.gain.cancelScheduledValues(t);
      old.g.gain.setValueAtTime(old.g.gain.value, t);
      old.g.gain.exponentialRampToValueAtTime(0.0001, t + 1.4);
      setTimeout(() => { try { old.o1.stop(); old.o2.stop(); old.f.disconnect(); } catch (e) {} }, 1600);
      amb = null;
    }
    if (level === 0) return;
    const g = ctx.createGain(); g.gain.value = 0;
    g.gain.linearRampToValueAtTime(m.vol * (level == null ? 1 : level), t + 2.2);
    const f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = m.cut; f.Q.value = 0.6;
    const o1 = ctx.createOscillator(), o2 = ctx.createOscillator();
    o1.type = 'sawtooth'; o2.type = 'sine';
    o1.frequency.value = m.f; o2.frequency.value = m.f2;
    const o1g = ctx.createGain(); o1g.gain.value = 0.5;
    const lfo = ctx.createOscillator(), lg = ctx.createGain();
    lfo.frequency.value = 0.055; lg.gain.value = m.cut * 0.35;
    lfo.connect(lg); lg.connect(f.frequency);
    o1.connect(o1g); o1g.connect(f); o2.connect(f); f.connect(g); g.connect(master);
    o1.start(t); o2.start(t); lfo.start(t);
    amb = { o1, o2, g, f, lfo };
  }
  function wind(level) {
    if (!ctx) return;
    if (level <= 0) {
      if (windNode) { const w = windNode; windNode = null;
        w.g.gain.exponentialRampToValueAtTime(0.0001, now() + 1.2);
        setTimeout(() => { try { w.src.stop(); } catch (e) {} }, 1500); }
      return;
    }
    if (windNode) { windNode.g.gain.linearRampToValueAtTime(0.05 * level, now() + 1.5); return; }
    const n = noise(0);
    const f = ctx.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 420; f.Q.value = 0.7;
    const g = ctx.createGain(); g.gain.value = 0;
    g.gain.linearRampToValueAtTime(0.05 * level, now() + 2);
    const lfo = ctx.createOscillator(), lg = ctx.createGain();
    lfo.frequency.value = 0.07; lg.gain.value = 210;
    lfo.connect(lg); lg.connect(f.frequency);
    n.src.connect(f); f.connect(g); g.connect(master);
    n.src.start(); lfo.start();
    windNode = { src: n.src, g, f, lfo };
  }

  return {
    init, resume, ambience, wind,
    get ctx() { return ctx; }, get out() { return master; }, get muted() { return muted; },   // for 21-music.js
    boot() { resume(); tone(70, 40, 1.6, 'sine', .18); tone(320, 180, 1.1, 'triangle', .05, .05); burst(.6, 900, .8, .05); },
    step() { burst(.07, 380 + Math.random() * 120, 1.6, .07); },
    jump() { tone(280, 420, .16, 'triangle', .05); },
    land() { burst(.09, 220, 1.2, .1); },
    talk(cls) {
      const base = cls === 'shyn' ? 148 : cls === 'player' ? 190 : 118;
      tone(base + Math.random() * 26, base * .92, .055, cls === 'shyn' ? 'triangle' : 'square', .022);
    },
    rune() { tone(440, 880, .5, 'sine', .12); tone(660, 1320, .6, 'triangle', .05, .04); },
    open() { tone(300, 520, .22, 'sine', .06); burst(.18, 1400, 1.2, .04); },
    close() { tone(420, 260, .2, 'sine', .05); },
    hit() { tone(120, 55, .35, 'sawtooth', .16); burst(.2, 260, .9, .12); },
    ach() { [660, 880, 1320].forEach((f, i) => tone(f, f, .5, 'sine', .06, i * .09)); },
    win() { [392, 523, 659, 784].forEach((f, i) => tone(f, f, 1.2, 'sine', .07, i * .13)); },
    orb() { tone(220, 110, .3, 'square', .05); },
    /* ---- Chamber 499: the coin, the cracking screen, the goblin's laugh ---- */
    coin(soft) { tone(1568, 1568, .08, 'square', soft ? .012 : .025); tone(2093, 2093, soft ? .18 : .4, 'sine', soft ? .03 : .07, .05); if (!soft) tone(3136, 3136, .55, 'sine', .03, .05); },
    crack(big) {
      burst(.12, 3400, .8, big ? .3 : .2, 'highpass'); burst(big ? .5 : .3, 900, .7, big ? .22 : .14);
      tone(big ? 70 : 110, big ? 30 : 45, big ? .9 : .45, 'sawtooth', big ? .2 : .13);
      for (let i = 0; i < (big ? 9 : 5); i++) setTimeout(() => burst(.03, 3800 + Math.random() * 3000, 2.5, .12, 'highpass'), 40 + i * 45 + Math.random() * 40);   // the glass keeps ticking
    },
    laugh() {
      const hee = (f, at, len) => { tone(f, f * 1.28, .06, 'square', .05, at); tone(f * 1.28, f * .86, len || .09, 'square', .05, at + .06); tone(f * .5, f * .44, (len || .09) + .05, 'sawtooth', .035, at); };
      let at = 0;
      [[540, 5, .17, .95], [620, 6, .15, .955], [700, 9, .125, .93]].forEach(([f, n, gap, fall], k) => {
        for (let i = 0; i < n; i++) { hee(f, at, k === 2 && i === n - 1 ? .5 : 0); f *= fall; at += gap; }
        at += .32;
      });
    },
    distantBell() { tone(660, 654, 2.4, 'sine', .014); tone(1320, 1308, 1.7, 'sine', .005); },
    volley() { tone(140, 90, .7, 'sawtooth', .05); },
    /* ---- Round 9: the fight ---- */
    swing(heavy) { burst(heavy ? .16 : .09, heavy ? 700 : 1500, .7, heavy ? .1 : .06, 'bandpass'); },
    cut(heavy) { tone(heavy ? 150 : 240, heavy ? 60 : 110, heavy ? .22 : .1, 'square', heavy ? .09 : .05); burst(.06, 2600, 1.4, .07, 'highpass'); },
    parry() { tone(1760, 2640, .09, 'triangle', .09); tone(2640, 1320, .35, 'sine', .06, .05); burst(.05, 4200, 2, .1, 'highpass'); },
    block() { tone(300, 160, .12, 'square', .06); burst(.08, 900, 1.2, .08); },
    charge() { tone(520, 1040, .18, 'sine', .06); },
    warn(bad) { tone(bad ? 196 : 392, bad ? 185 : 415, .22, bad ? 'sawtooth' : 'triangle', bad ? .07 : .05); },
    blink() { tone(900, 200, .2, 'sine', .06); burst(.12, 2400, 1.6, .05, 'highpass'); },
    key() { tone(1100 + Math.random() * 500, 900, .025, 'square', .012); },
    riser(dur) { tone(60, 1400, dur, 'sawtooth', .07); tone(63, 1470, dur, 'square', .03); for (let i = 0; i < 14; i++) setTimeout(() => burst(.04, 500 + i * 380, 3, .07, 'bandpass'), i * dur * 60); },
    crush() { for (let i = 0; i < 9; i++) tone(90 + ((i * 97) % 5) * 60, 80, .06, 'square', .06, i * .07); burst(.5, 300, .6, .12); },
    crash() { tone(220, 28, 1.4, 'sawtooth', .16); burst(.9, 180, .5, .2); [880, 660, 440, 220].forEach((f, i) => tone(f, f * .5, .2, 'square', .05, i * .12)); },
    toggle() {
      init(); muted = !muted;
      if (master) master.gain.linearRampToValueAtTime(muted ? 0 : 0.55, now() + .25);
      return muted;
    },
    mute(val) { init(); muted = !!val; if (master) master.gain.value = muted ? 0 : .55; },
    isMuted() { return muted; }
  };
})();

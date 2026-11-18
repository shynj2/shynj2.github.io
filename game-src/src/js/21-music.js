/* ==========================================================================
   MUSIC (Round 9 §7) — the score, synthesised live. No audio files.

   Nine pieces, one per place, in a slow liturgical Spanish-gothic manner: nylon guitar, organ, a wordless choir,
   cello, bells, a processional drum. Each piece is a loop of eight bars, so it repeats without a seam.

   To change a piece, edit its entry in TRACKS:
     gain  loudness trim · bpm   tempo · bpb  beats in a bar · tr  transpose (semitones) · prog  the eight chords (names in CH)
     mel   the tune: per bar a list of [beat, note, length in beats] (note = MIDI number before `tr`; 69 = A4)
     bar(o, x)  what is played in one bar. o = the instruments (guitar, organ, choir, cello, bell, drum, pizz, tick, sq, hat),
                x = { t: start time, b: seconds per beat, i: bar 0..7, c: [bass, tone, tone, tone], lv: intensity, mel(fn) }
   Intensity (lv): 1 everywhere; in the Throne 0 = before/after the fight, 1-3 = the three phases, 4 = the terminal.
   Changing place cross-fades over about 1.5 s. Speech (dialogue, narration) lowers the music; volume and mute are remembered.
   ========================================================================== */
const Music = (() => {
  const mf = (m) => 440 * Math.pow(2, (m - 69) / 12);
  const CH = {   // [bass, three tones]
    Am: [45, 57, 60, 64], G: [43, 55, 59, 62], F: [41, 53, 57, 60], E: [40, 52, 56, 59], Dm: [38, 50, 53, 57], C: [36, 48, 52, 55],
    Bb: [34, 46, 50, 53], Em: [40, 52, 55, 59], B7: [35, 47, 51, 57]
  };

  /* ---------------- the instruments ---------------- */
  function orchestra(c, out) {
    const env = (g, t, a, peak, hold, r) => { g.gain.setValueAtTime(.0001, t); g.gain.linearRampToValueAtTime(peak, t + a); g.gain.setValueAtTime(peak, t + Math.max(a, hold)); g.gain.exponentialRampToValueAtTime(.0001, t + Math.max(a, hold) + r); };
    const osc = (type, f, t, end, det) => { const o = c.createOscillator(); o.type = type; o.frequency.value = f; if (det) o.detune.value = det; o.start(t); o.stop(end); return o; };
    const lp = (f, q) => { const n = c.createBiquadFilter(); n.type = 'lowpass'; n.frequency.value = f; if (q) n.Q.value = q; return n; };
    let nb = c._veyNoise;
    if (!nb) { nb = c._veyNoise = c.createBuffer(1, c.sampleRate, c.sampleRate); const d = nb.getChannelData(0), r = mulberry32(11); for (let i = 0; i < d.length; i++) d[i] = r() * 2 - 1; }
    const noise = (t, dur) => { const s = c.createBufferSource(); s.buffer = nb; s.loop = true; s.start(t, (t * 7.3) % .9); s.stop(t + dur); return s; };
    const vib = (o, t, end, depth) => { const l = osc('sine', 5.2, t, end), g = c.createGain(); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(depth, t + .6); l.connect(g); g.connect(o.detune); };
    /* the bowed strings of the Throne piece. Every bowed voice passes through a shared "body" (the wooden box: fixed resonances
       that do not move with the note, which is what makes a sawtooth read as a violin); built once, on the first bowed note. */
    let body = null;
    const bodies = () => {
      if (body) return body;
      const f = (type, fr, q, gain) => { const n = c.createBiquadFilter(); n.type = type; n.frequency.value = fr; if (q) n.Q.value = q; if (gain) n.gain.value = gain; return n; };
      const chain = (...ns) => { for (let i = 0; i < ns.length - 1; i++) ns[i].connect(ns[i + 1]); return ns[0]; };
      return body = {
        solo: chain(f('highpass', 190), f('peaking', 285, 2.2, 4), f('peaking', 470, 2.4, 3), f('peaking', 1100, 2, 2), f('peaking', 2750, 1.3, 7), f('lowpass', 6200), out),
        sect: chain(f('highpass', 110), f('peaking', 300, 1.8, 3), f('peaking', 2400, 1.2, 4), f('lowpass', 3800), out),
        low: chain(f('lowpass', 900), out)
      };
    };
    /** one bow stroke: a quick bite, a swell to the middle of the note, a short lift; the left hand's vibrato arrives late */
    const bow = (bus, m, t, dur, vol, att, rel, two, vibOn) => {
      const f = mf(m), g = c.createGain(), a = Math.min(att, dur * .4), end = t + dur + rel + .03;
      g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol * .8, t + a); g.gain.linearRampToValueAtTime(vol, t + Math.max(a + .01, dur * .55));
      g.gain.setValueAtTime(vol, t + Math.max(a + .02, dur - .02)); g.gain.linearRampToValueAtTime(0, t + dur + rel);
      g.connect(bus);
      let lg = null;
      if (vibOn && dur > .3) { const l = osc('sine', 5.4 + (m % 5) * .12, t, end); lg = c.createGain(); lg.gain.setValueAtTime(0, t + .1); lg.gain.linearRampToValueAtTime(f * .0068, t + Math.min(dur * .7, .45)); l.connect(lg); }
      (two ? [-7, 7] : [0]).forEach((d) => { const o = osc('sawtooth', f, t, end, d); if (lg) lg.connect(o.frequency); o.connect(g); });
    };
    return {
      /** the solo violin: one singing voice */
      violin(m, t, dur, vol) { bow(bodies().solo, m, t, dur, vol, dur > .3 ? .07 : .022, .07, false, true); },
      /** a short bounced stroke of the whole section (spiccato) */
      spicc(m, t, vol, len) { bow(bodies().sect, m, t, len || .1, vol, .006, .045, true, false); },
      /** the section holding a note (two desks, slightly apart) */
      strings(m, t, dur, vol, slow) { bow(bodies().sect, m, t, dur, vol, slow ? .5 : .09, .14, true, dur > .5); },
      /** cellos and basses: a bowed octave over a plain low tone */
      basso(m, t, dur, vol) {
        bow(bodies().low, m + 12, t, dur, vol, .03, .1, true, false);
        const o = osc('sine', mf(m), t, t + dur + .2), g = c.createGain(); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol * 1.1, t + .03); g.gain.linearRampToValueAtTime(0, t + dur + .12); o.connect(g); g.connect(out);
      },
      /** nylon string: a soft pluck that darkens as it rings */
      guitar(m, t, vol, ring) {
        const f = mf(m), dur = ring || 1.4, g = c.createGain(), fl = lp(3200, 1), a = osc('triangle', f, t, t + dur + .1), b = osc('sawtooth', f, t, t + dur + .1, 3), bg = c.createGain();
        bg.gain.value = .28; fl.frequency.setValueAtTime(Math.min(5200, f * 9), t); fl.frequency.exponentialRampToValueAtTime(Math.max(300, f * 1.6), t + .35);
        g.gain.setValueAtTime(.0001, t); g.gain.linearRampToValueAtTime(vol, t + .004); g.gain.exponentialRampToValueAtTime(.0001, t + dur);
        a.connect(fl); b.connect(bg); bg.connect(fl); fl.connect(g); g.connect(out);
      },
      /** a strummed chord (rasgueado): the strings one after another */
      strum(notes, t, vol, up) { const n = up ? notes.slice().reverse() : notes; n.forEach((m, i) => this.guitar(m, t + i * .022, vol * (i ? .8 : 1), 1.1)); },
      organ(m, t, dur, vol) {
        const f = mf(m), g = c.createGain(), end = t + dur + .7; env(g, t, .22, vol, dur, .6);
        [[1, 1], [2, .5], [3, .22], [4, .12]].forEach(([k, a], i) => { const o = osc('sine', f * k, t, end, i ? 2 : -2), og = c.createGain(); og.gain.value = a; o.connect(og); og.connect(g); });
        g.connect(out);
      },
      /** a wordless choir: two sawtooth voices through two "ah" formants */
      choir(m, t, dur, vol) {
        const f = mf(m), end = t + dur + 1.3, g = c.createGain(), mix = c.createGain(); env(g, t, .8, vol, dur, 1.2);
        [-7, 7].forEach((d) => { const o = osc('sawtooth', f, t, end, d); vib(o, t, end, 9); o.connect(mix); });
        [[780, 5, 1], [1180, 6, .6], [2700, 7, .16]].forEach(([fr, q, a]) => { const bp = c.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = fr; bp.Q.value = q; const bg = c.createGain(); bg.gain.value = a; mix.connect(bp); bp.connect(bg); bg.connect(g); });
        g.connect(out);
      },
      cello(m, t, dur, vol) {
        const f = mf(m), end = t + dur + .4, g = c.createGain(), fl = lp(Math.min(2400, f * 5), 1.5), o = osc('sawtooth', f, t, end), o2 = osc('triangle', f, t, end, -4);
        vib(o, t, end, 14); env(g, t, .14, vol, dur * .92, .3); o.connect(fl); o2.connect(fl); fl.connect(g); g.connect(out);
      },
      /** a tubular bell: partials that are not in tune with each other */
      bell(m, t, vol) {
        const f = mf(m);
        [[1, 1, 4.2], [2, .55, 3], [2.76, .4, 2.2], [5.4, .22, 1.2], [8.93, .1, .6]].forEach(([k, a, d]) => { const o = osc('sine', f * k, t, t + d + .1), g = c.createGain(); g.gain.setValueAtTime(.0001, t); g.gain.linearRampToValueAtTime(vol * a, t + .006); g.gain.exponentialRampToValueAtTime(.0001, t + d); o.connect(g); g.connect(out); });
      },
      /** the processional drum (bombo): a falling thud and a breath of skin noise */
      drum(t, vol, hi) {
        const o = c.createOscillator(), g = c.createGain(); o.frequency.setValueAtTime(hi ? 150 : 96, t); o.frequency.exponentialRampToValueAtTime(hi ? 70 : 42, t + .2);
        g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(.0001, t + (hi ? .22 : .42)); o.connect(g); g.connect(out); o.start(t); o.stop(t + .5);
        const n = noise(t, .06), ng = c.createGain(), nf = lp(900); ng.gain.setValueAtTime(vol * .5, t); ng.gain.exponentialRampToValueAtTime(.0001, t + .05); n.connect(nf); nf.connect(ng); ng.connect(out);
      },
      pizz(m, t, vol) { const f = mf(m), o = osc('triangle', f, t, t + .4), g = c.createGain(), fl = lp(f * 4); g.gain.setValueAtTime(.0001, t); g.gain.linearRampToValueAtTime(vol, t + .004); g.gain.exponentialRampToValueAtTime(.0001, t + .32); o.connect(fl); fl.connect(g); g.connect(out); },
      /** iron on iron, far away (the forge) */
      tick(t, vol) { [2093, 3136, 4699].forEach((f, i) => { const o = osc('sine', f, t, t + .3), g = c.createGain(); g.gain.setValueAtTime(vol / (i + 1), t); g.gain.exponentialRampToValueAtTime(.0001, t + .22 - i * .05); o.connect(g); g.connect(out); }); },
      /** the terminal's voice: a hard square note */
      sq(m, t, dur, vol) { const f = mf(m), o = osc('square', f, t, t + dur + .05), g = c.createGain(), fl = lp(2600); g.gain.setValueAtTime(vol, t); g.gain.setValueAtTime(vol, t + dur * .7); g.gain.exponentialRampToValueAtTime(.0001, t + dur); o.connect(fl); fl.connect(g); g.connect(out); },
      hat(t, vol) { const n = noise(t, .05), g = c.createGain(), hp = c.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 6000; g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(.0001, t + .04); n.connect(hp); hp.connect(g); g.connect(out); }
    };
  }

  /* ---------------- the nine pieces ---------------- */
  const arp = (o, x, order, div, vol, ring) => order.forEach((k, j) => o.guitar(k < 0 ? x.c[0] + 12 : x.c[k] + (k > 3 ? 12 : 0), x.t + j * x.b / div, vol * (j % div ? .8 : 1), ring));
  const TRACKS = {
    title: { name: 'Preludio del Umbral', gain: 1.25, bpm: 54, bpb: 4, tr: 0, prog: ['Am', 'G', 'F', 'E', 'Am', 'G', 'F', 'E'],
      mel: [[], [], [], [], [[0, 81, 2], [2, 84, 1], [3, 83, 1]], [[0, 83, 3], [3, 81, 1]], [[0, 84, 1.5], [1.5, 83, .5], [2, 81, 2]], [[0, 80, 1], [1, 81, .5], [1.5, 80, .5], [2, 76, 2]]],
      bar(o, x) {
        arp(o, x, [-1, 1, 2, 3, 2, 1, 3, 2], 2, .16, 1.8);
        o.organ(x.c[0], x.t, x.b * 4, .05);
        if (x.i % 4 === 0) o.bell(76 + x.tr, x.t, .07);
        x.mel((m, t, d) => o.guitar(m, t, .2, Math.max(1.2, d * x.b * 1.3)));
      } },
    workshop: { name: 'La Fragua Dormida', bpm: 60, bpb: 4, tr: -7, prog: ['Am', 'Am', 'F', 'E', 'Am', 'G', 'F', 'E'],
      mel: [[[0, 57, 3], [3, 59, 1]], [[0, 60, 2], [2, 57, 2]], [[0, 57, 2], [2, 60, 2]], [[0, 59, 1], [1, 56, 3]], [[0, 64, 3], [3, 62, 1]], [[0, 62, 2], [2, 59, 2]], [[0, 60, 2], [2, 57, 1], [3, 53, 1]], [[0, 52, 4]]],
      bar(o, x) {
        o.organ(x.c[0], x.t, x.b * 4, .07); o.organ(x.c[0] + 7, x.t, x.b * 4, .025);
        [0, 1, 2, 3].forEach((k) => o.guitar(x.c[[1, 2, 3, 2][k]], x.t + k * x.b, .12, 1.6));
        o.tick(x.t + x.b, .012); o.tick(x.t + x.b * 3, .009); if (x.i % 2) o.tick(x.t + x.b * 3.5, .006);
        x.mel((m, t, d) => o.cello(m + 12, t, d * x.b, .11));
      } },
    forest: { name: 'Bosque de Ceniza', gain: 1.6, bpm: 66, bpb: 3, tr: 0, prog: ['Em', 'C', 'G', 'B7', 'Em', 'C', 'Am', 'B7'],
      mel: [[[0, 71, 3]], [[0, 72, 2], [2, 71, 1]], [[0, 74, 2], [2, 71, 1]], [[0, 69, 1], [1, 66, 2]], [[0, 76, 3]], [[0, 76, 1], [1, 74, 1], [2, 72, 1]], [[0, 72, 2], [2, 69, 1]], [[0, 71, 3]]],
      bar(o, x) {
        arp(o, x, [-1, 1, 2, 3, 2, 1], 2, .13, 1.5);
        o.choir(x.c[1] + 12, x.t, x.b * 3, .035); o.choir(x.c[3] + 12, x.t, x.b * 3, .028);
        x.mel((m, t, d) => { const n = Math.round(d * 4); for (let k = 0; k < n; k++) o.guitar(m, t + k * x.b / 4, k ? .075 : .12, .5); });      // tremolo picking
      } },
    cathedral: { name: 'Nave Mayor', bpm: 48, bpb: 4, tr: 0, prog: ['Am', 'E', 'F', 'C', 'Dm', 'Am', 'E', 'E'],
      mel: [[[0, 76, 4]], [[0, 76, 3], [3, 74, 1]], [[0, 72, 4]], [[0, 72, 2], [2, 76, 2]], [[0, 77, 3], [3, 76, 1]], [[0, 76, 2], [2, 72, 2]], [[0, 71, 4]], [[0, 71, 2], [2, 68, 2]]],
      bar(o, x) {
        o.organ(x.c[0] - 12, x.t, x.b * 4, .09); o.organ(x.c[0], x.t, x.b * 4, .06);
        [1, 2, 3].forEach((k) => o.organ(x.c[k], x.t, x.b * 4, .04));
        o.choir(x.c[1], x.t, x.b * 4, .03); o.choir(x.c[2], x.t, x.b * 4, .026);
        if (x.i % 4 === 0) o.bell(64, x.t, .09);
        x.mel((m, t, d) => o.choir(m, t, d * x.b, .06));
      } },
    catacombs: { name: 'Las Máquinas Rezan', bpm: 72, bpb: 4, tr: 4, prog: ['Am', 'Am', 'Bb', 'Am', 'Am', 'Am', 'Bb', 'E'],
      mel: [[[0, 64, 4]], [[0, 65, 2], [2, 64, 2]], [[0, 62, 4]], [[0, 64, 4]], [[0, 69, 4]], [[0, 67, 2], [2, 65, 2]], [[0, 65, 2], [2, 62, 2]], [[0, 64, 2], [2, 68, 2]]],
      bar(o, x) {
        o.organ(x.c[0] - 12, x.t, x.b * 4, .08); o.organ(x.c[0] - 5, x.t, x.b * 4, .03);
        [1, 0, 1, 1, 0, 1, 0, 1].forEach((on, k) => { if (on) o.pizz(x.c[0] + (k === 3 || k === 7 ? 7 : 0), x.t + k * x.b / 2, k % 4 === 0 ? .14 : .08); });      // the machine counts
        [3, 6].forEach((k) => { if (x.h(k) < .55) o.bell(x.c[1 + ((x.h(k + 9) * 3) | 0)] + 24, x.t + k * x.b / 2, .02); });
        x.mel((m, t, d) => o.cello(m, t, d * x.b, .085));
      } },
    repository: { name: 'Archivo de Ramas', gain: 1.3, bpm: 63, bpb: 4, tr: 2, prog: ['Am', 'Dm', 'G', 'C', 'F', 'Dm', 'E', 'E'],
      mel: [[], [], [], [[3, 79, 1]], [], [], [], [[2, 76, 2]]],
      bar(o, x) {
        const fig = [x.c[1], x.c[2], x.c[3], x.c[2], x.c[1] + 12, x.c[3], x.c[2], x.c[3]];
        fig.forEach((m, k) => o.guitar(m + 12, x.t + k * x.b / 2, k % 2 ? .1 : .14, 1.3));                                  // first branch
        fig.forEach((m, k) => { const at = (k + 4) % 8; o.guitar(m, x.t + at * x.b / 2, .085, 1.3); });                      // second branch: the same figure, two beats behind, an octave lower
        o.cello(x.c[0] + 12, x.t, x.b * 1.8, .08); o.cello(x.c[0] + 19, x.t + x.b * 2, x.b * 1.8, .06);
        x.mel((m, t) => o.bell(m, t, .035));
      } },
    room499: { name: 'Vals del Contable', gain: 1.3, bpm: 92, bpb: 3, tr: -2, prog: ['Am', 'E', 'Am', 'E', 'Dm', 'Am', 'E', 'Am'],
      mel: [[[0, 64, 1], [1, 69, .5], [1.5, 68, .5], [2, 69, 1]], [[0, 71, 1], [1, 68, 1], [2, 64, 1]], [[0, 72, 1], [1, 71, .5], [1.5, 69, .5], [2, 64, 1]], [[0, 68, 2]],
        [[0, 65, 1], [1, 69, 1], [2, 74, 1]], [[0, 72, 1], [1, 69, 1], [2, 64, 1]], [[0, 65, .5], [.5, 64, .5], [1, 63, .5], [1.5, 64, .5], [2, 68, 1]], [[0, 69, 2]]],
      bar(o, x) {
        o.pizz(x.c[0], x.t, .16); o.pizz(x.c[1], x.t + x.b, .07); o.pizz(x.c[2], x.t + x.b, .07);
        o.pizz(x.c[2], x.t + x.b * 2.09, .07); o.pizz(x.c[3], x.t + x.b * 2.09, .07);                                       // the third beat limps
        x.mel((m, t, d) => o.cello(m - 12, t, d * x.b * .7, .1));                                                           // a bassoon-like voice, staccato
        if (x.i % 4 === 3) o.bell(96, x.t + x.b * 2.5, .012);                                                               // a coin, somewhere
      } },
    /* THE THRONE — a concerto movement for solo violin and strings, in D minor (written in A minor, moved down a fifth by `tr`).
       Sixteen bars: the theme (8), then its answer, which climbs (8). `tempo` gives the speed of each intensity:
         0  nobody is fighting (he speaks, the Attempt screen): the violin alone over one held chord
         1  first phase : the theme over walking low strings and timpani
         2  second phase: + the section's bounced eighths; the violins double the theme an octave below
         3  third phase : + sixteenths in the section (a storm), the solo in octaves, a choir behind
         4  the terminal, his last phase: the fastest. The whole section carries the theme in octaves while the solo violin
            crosses strings over it (bariolage: the tune against the open A string), timpani on every beat, bells. */
    arena: { name: 'Concierto del Guardián', gain: 1.05, bpm: 100, tempo: [76, 100, 108, 118, 128], bpb: 4, tr: -7,
      prog: ['Am', 'Am', 'F', 'E', 'Am', 'G', 'F', 'E', 'C', 'G', 'Dm', 'E', 'Am', 'F', 'E', 'E'],
      mel: [
        [[0, 69, 1.5], [1.5, 72, .5], [2, 76, 1.5], [3.5, 74, .5]], [[0, 72, 1], [1, 71, .5], [1.5, 69, .5], [2, 76, 2]],
        [[0, 77, 1.5], [1.5, 76, .5], [2, 74, 1], [3, 72, 1]], [[0, 71, 1.5], [1.5, 68, .5], [2, 71, 1], [3, 76, 1]],
        [[0, 81, 1.5], [1.5, 79, .5], [2, 76, 1], [3, 72, 1]], [[0, 74, 1.5], [1.5, 71, .5], [2, 74, 1], [3, 79, 1]],
        [[0, 77, 1], [1, 76, .5], [1.5, 74, .5], [2, 72, 1], [3, 69, 1]], [[0, 71, 1], [1, 68, 1], [2, 76, 2]],
        [[0, 79, 2], [2, 76, 1], [3, 72, 1]], [[0, 74, 2], [2, 71, 1], [3, 79, 1]],
        [[0, 77, 1.5], [1.5, 74, .5], [2, 81, 2]], [[0, 80, 1], [1, 76, 1], [2, 83, 2]],
        [[0, 84, 1.5], [1.5, 83, .5], [2, 81, 1], [3, 76, 1]], [[0, 77, 1], [1, 81, 1], [2, 84, 1], [3, 81, 1]],
        [[0, 83, 1], [1, 80, 1], [2, 76, 1], [3, 80, 1]], [[0, 83, .5], [.5, 80, .5], [1, 76, .5], [1.5, 71, .5], [2, 68, 2]]],
      bar(o, x) {
        const lv = x.lv, b = x.b, t = x.t, c = x.c, cadence = x.i % 8 === 7;
        if (lv === 0) {                                                                       // the violin alone
          o.strings(c[0] + 12, t, b * 4, .045, true); o.strings(c[0] + 19, t, b * 4, .028, true);
          x.mel((m, tt, d) => o.violin(m + 12, tt, d * b * .96, .12));
          return;
        }
        // cellos and basses walk in eighths; from the third phase they leap the octave
        for (let k = 0; k < 8; k++) o.basso(c[0] + (k % 4 === 3 ? 7 : 0) + (lv >= 3 && k % 2 ? 12 : 0), t + k * b / 2, b * .4, k % 4 === 0 ? .1 : .07);
        // timpani
        o.drum(t, .3); o.drum(t + b * 2, .22);
        if (lv >= 2) o.drum(t + b * 3.5, .14, true);
        if (lv >= 3) { o.drum(t + b * 1.5, .12, true); o.drum(t + b * 3, .18); }
        if (lv === 4) { o.drum(t + b, .2); if (cadence) for (let k = 0; k < 8; k++) o.drum(t + b * 3 + k * b / 8, .07 + k * .022, true); }      // a roll into the repeat
        // the section holds the harmony
        o.strings(c[1] + 12, t, b * 4, .04); o.strings(c[2] + 12, t, b * 4, .034); if (lv >= 2) o.strings(c[3] + 12, t, b * 4, .03);
        // the section's bounced bow: eighths, then sixteenths
        if (lv === 2) [1, 2, 3, 2, 1, 2, 3, 2].forEach((k, j) => o.spicc(c[k] + 12, t + j * b / 2, j % 2 ? .042 : .062, b * .28));
        if (lv >= 3) for (let k = 0; k < 16; k++) o.spicc(c[[1, 1, 2, 3][k % 4]] + 12 + (lv === 4 && k >= 8 ? 12 : 0), t + k * b / 4, k % 4 ? (lv === 4 ? .05 : .044) : (lv === 4 ? .085 : .072), b * .15);
        // the theme
        if (lv === 1) x.mel((m, tt, d) => o.violin(m + 12, tt, d * b * .95, .15));
        else if (lv === 2) x.mel((m, tt, d) => { o.violin(m + 12, tt, d * b * .95, .15); o.strings(m, tt, d * b * .9, .04); });
        else if (lv === 3) {
          x.mel((m, tt, d) => { o.violin(m + 12, tt, d * b * .95, .17); o.violin(m + 24, tt, d * b * .95, .075); });
          o.choir(c[1] + 12, t, b * 4, .03); o.choir(c[3] + 12, t, b * 4, .026);
        } else {
          const open = 76 + x.tr;                                                             // the open A string
          x.mel((m, tt, d) => {
            o.strings(m + 12, tt, d * b * .92, .1); o.strings(m + 24, tt, d * b * .92, .055);
            const n = Math.round(d * 4);
            for (let k = 0; k < n; k++) o.violin(k % 2 ? (m + 12 === open ? open - 5 : open) : m + 12, tt + k * b / 4, b * .21, k ? .13 : .18);
          });
          o.choir(c[1] + 12, t, b * 4, .04); o.choir(c[2] + 24, t, b * 4, .034);
          if (x.i % 4 === 0) o.bell(c[0] + 36, t, .05);
        }
      } },
    ending: { name: 'Lo Que Queda', gain: 1.2, bpm: 56, bpb: 4, tr: 0, prog: ['C', 'G', 'Am', 'F', 'C', 'G', 'F', 'C'],
      mel: [[[0, 76, 2], [2, 79, 2]], [[0, 74, 3], [3, 71, 1]], [[0, 72, 2], [2, 76, 2]], [[0, 77, 2], [2, 76, 1], [3, 74, 1]], [[0, 76, 2], [2, 79, 2]], [[0, 81, 2], [2, 79, 2]], [[0, 77, 2], [2, 81, 2]], [[0, 79, 1], [1, 76, 3]]],
      bar(o, x) {
        arp(o, x, [-1, 1, 2, 3, 2, 1, 3, 2], 2, .14, 1.9);
        o.choir(x.c[1] + 12, x.t, x.b * 4, .034); o.choir(x.c[2] + 12, x.t, x.b * 4, .028);
        o.organ(x.c[0], x.t, x.b * 4, .05);
        if (x.i === 0) o.bell(72, x.t, .07);
        x.mel((m, t, d) => o.guitar(m, t, .19, Math.max(1.4, d * x.b * 1.4)));
      } }
  };
  const ZONE_TRACK = { workshop: 'workshop', forest: 'forest', cathedral: 'cathedral', catacombs: 'catacombs', repository: 'repository', arena: 'arena', room499: 'room499', title: 'title', ending: 'ending' };

  /** one bar of a piece, written into the instruments `o` at time t; returns the bar's length in seconds */
  function playBar(T, o, n, t, lv, seed) {
    const b = 60 / ((T.tempo && T.tempo[lv]) || T.bpm), i = n % T.prog.length, c = CH[T.prog[i]].map((m) => m + T.tr);
    const x = { t, b, i, n, c, lv, tr: T.tr, h: (k) => hash2(n * 31 + k, seed, 5),
      mel(fn) { const row = T.mel[i] || []; for (let k = 0; k < row.length; k++) fn(row[k][1] + T.tr, t + row[k][0] * b, row[k][2]); } };
    T.bar(o, x);
    return b * T.bpb;
  }
  /** master → [dry + hall reverb] → destination. The hall is a noise burst that dies away over 2.8 s. */
  function hall(c, dest) {
    const master = c.createGain(), rev = c.createConvolver(), wet = c.createGain(), len = (c.sampleRate * 2.8) | 0, ir = c.createBuffer(2, len, c.sampleRate);
    for (let ch = 0; ch < 2; ch++) { const d = ir.getChannelData(ch), r = mulberry32(3 + ch * 17); let p = 0; for (let i = 0; i < len; i++) { const k = i / len; p = p * (.5 + k * .35) + (r() * 2 - 1) * (.5 - k * .35); d[i] = p * Math.pow(1 - k, 2.4); } }
    rev.buffer = ir; wet.gain.value = .55;
    master.connect(dest); master.connect(rev); rev.connect(wet); wet.connect(dest);
    return master;
  }

  /* ---------------- playing ---------------- */
  const KEY = 'veyrath-audio';
  let pref = { v: 1, m: false }; try { const s = JSON.parse(localStorage.getItem(KEY) || 'null'); if (s && typeof s.v === 'number') pref = { v: clamp(s.v, 0, 1), m: !!s.m }; } catch (e) {}
  const keep = () => { try { localStorage.setItem(KEY, JSON.stringify(pref)); } catch (e) {} };
  let master = null, players = [], cur = null, timer = null, fight = false, ducked = false, quiet = 1, hush = 0;
  function setup() {
    const c = Sound.ctx; if (!c || !Sound.out) return false;
    if (!master) { master = hall(c, Sound.out); master.gain.value = 0; }
    return true;
  }
  function level() {
    if (cur !== 'arena') return 1;
    if (!fight) return 0;
    if (typeof BOSS !== 'undefined' && BOSS.active) return (typeof Override !== 'undefined' && (Override.term || BOSS.ov)) ? 4 : Math.min(3, (BOSS.phase | 0) + 1);
    return 1;
  }
  function tick() {
    const c = Sound.ctx; if (!c || c.state !== 'running' || !setup()) return;
    const now = c.currentTime;
    const speech = ducked || (typeof Dlg !== 'undefined' && Dlg.on) || (typeof VO !== 'undefined' && VO.a && !VO.a.paused);
    master.gain.setTargetAtTime((Sound.muted ? 0 : 1) * pref.v * quiet * (speech ? .42 : 1) * (now < hush ? .25 : 1) * .9, now, .25);
    for (let k = players.length - 1; k >= 0; k--) {
      const p = players[k];
      if (p.dead) { if (now > p.dead) { try { p.bus.disconnect(); } catch (e) {} players.splice(k, 1); } continue; }
      if (p.nextT < now + .05) p.nextT = now + .08;
      while (p.nextT < now + .45) { p.nextT += playBar(TRACKS[p.id], p.o, p.n, p.nextT, level(), p.id.length); p.n++; }
    }
  }
  function start(id) {
    const c = Sound.ctx; if (!setup()) return;
    const bus = c.createGain(), now = c.currentTime; bus.gain.setValueAtTime(0, now); bus.gain.linearRampToValueAtTime(TRACKS[id].gain || 1, now + 1.5); bus.connect(master);      // gain: quiet pieces are lifted to sit with the others
    players.push({ id, bus, o: orchestra(c, bus), n: 0, nextT: 0, dead: 0 });
  }
  function fade(p, sec) { const c = Sound.ctx; if (!c || p.dead) return; const now = c.currentTime; p.bus.gain.cancelScheduledValues(now); p.bus.gain.setTargetAtTime(0, now, sec / 3); p.dead = now + sec + 3; }
  const api = {
    TRACKS, ZONE_TRACK,
    /** the piece for a place. level < .5 means "nearly silent" (the mercy scene) */
    play(mood, lv) {
      if (!timer) timer = setInterval(tick, 100);
      const id = ZONE_TRACK[mood] || null;
      quiet = lv != null && lv < .5 ? .35 : 1;
      if (id === cur) return;
      players.forEach((p) => fade(p, 1.5));
      cur = id; this.want = id;
      if (id) { if (Sound.ctx && Sound.ctx.state === 'running') start(id); else this.pending = id; }
    },
    stop() { this.play(null, 0); },
    now() { return cur; },
    /** the fight begins / ends (the Throne piece has five intensities) */
    fight(on, last) {
      fight = !!on;
      if (on) this.play('arena', 1);
      else if (last && master && Sound.ctx && cur === 'arena') { const c = Sound.ctx, o = orchestra(c, players.length ? players[players.length - 1].bus : master), t = c.currentTime + .1; [38, 50, 57, 62, 65].forEach((m, i) => o.strings(m, t + i * .012, 4.4, .05)); o.violin(74, t, 4.8, .12); o.bell(62, t, .06); }      // the last chord: the violin alone on top
    },
    fighting() { return fight; },
    duck(on) { ducked = !!on; },
    glitch(dur) { if (Sound.ctx) hush = Sound.ctx.currentTime + dur; },
    terminal() {},
    get vol() { return pref.v; },
    set vol(v) { pref.v = clamp(v, 0, 1); keep(); },
    get savedMute() { return pref.m; },
    saveMute(m) { pref.m = !!m; keep(); },
    list() { return Object.keys(TRACKS).map((k) => TRACKS[k].name); },
    /** tests: what is sounding now */
    debug() { return { cur, players: players.map((p) => [p.id, p.dead ? 1 : 0, +p.bus.gain.value.toFixed(3)]), master: master ? +master.gain.value.toFixed(3) : -1, level: level(), fight }; },
    /** adds "Music: 70 %" to the pause menu (once); a press steps 100 → 70 → 40 → 0 */
    pauseSync() {
      const menu = document.querySelector('#pause .menu'); if (!menu) return;
      let b = menu.querySelector('[data-act="musicvol"]');
      if (!b) { b = document.createElement('button'); b.className = 'btn opt'; b.dataset.act = 'musicvol'; b.onclick = (ev) => { ev.stopPropagation(); const steps = [1, .7, .4, 0], i = steps.findIndex((s) => Math.abs(s - pref.v) < .05); this.vol = steps[(i + 1) % steps.length]; this.pauseSync(); Sound.open(); }; menu.insertBefore(b, menu.querySelector('[data-act="credits"]') || menu.querySelector('[data-act="leave"]')); }
      b.textContent = tr('ui.opt.music') + ': ' + trNum(Math.round(pref.v * 100)) + '%';
    },
    /** tools and tests: render `sec` seconds of a piece without playing it. Returns one channel. */
    async offline(id, sec, lv) {
      const rate = 22050, c = new OfflineAudioContext(1, Math.ceil(sec * rate), rate), m = hall(c, c.destination), o = orchestra(c, m), T = TRACKS[id];
      m.gain.value = .9 * (T.gain || 1); let t = .05, n = 0; while (t < sec) { t += playBar(T, o, n, t, lv == null ? 1 : lv, id.length); n++; }
      return (await c.startRendering()).getChannelData(0);
    }
  };
  // a piece asked for before the first key press starts as soon as sound is allowed
  setInterval(() => { if (api.pending && Sound.ctx && Sound.ctx.state === 'running') { const id = api.pending; api.pending = null; if (id === cur && !players.some((p) => p.id === id && !p.dead)) start(id); } }, 300);
  return api;
})();

/* the fight's music is the Throne piece at its higher intensities; the old names are kept for the callers.
   (The name is only bound when 22-boss-violin.js is not in the build: that file brings the violin score and its own BossMusic.) */
globalThis.BossMusic = {                       // a bare fallback on the global object: 22-boss-violin.js declares its own
  get on() { return Music.fighting(); },       // `const BossMusic` when it is in the build, and that one wins everywhere.
  start() { Music.fight(true); },
  finale() { Music.fight(false, true); },
  stop() { Music.fight(false); }
};
/* the drone and wind stay underneath, quieter; every place that sets the ambience also sets the piece */
{ const amb0 = Sound.ambience; Sound.ambience = function (mood, level) { amb0(mood, (level == null ? 1 : level) * .4); Music.play(mood, level); }; }
/* mute is remembered: applied at the first key press or tap (sound may not start before that) */
{
  const res0 = Sound.resume, tog0 = Sound.toggle; let applied = false;
  const mark = (m) => { const b = el('mute'); if (b) { b.textContent = m ? '♪̸' : '♪'; b.style.opacity = m ? '.28' : '.42'; } };
  Sound.resume = function () { const r = res0.apply(Sound, arguments); if (!applied) { applied = true; if (Music.savedMute && !Sound.muted) { Sound.mute(true); mark(true); } } return r; };
  Sound.toggle = function () { const m = tog0.apply(Sound, arguments); applied = true; Music.saveMute(m); return m; };
}

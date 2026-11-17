/** Rime & Ember — original modal fantasy score. All stems share a sample-aligned, gapless 12-bar loop. */
const RATE = 24000;
const BEAT = 0.8;
const LOOP_FRAMES = Math.round(12 * 3 * BEAT * RATE);
const TAIL_FRAMES = Math.round(2.8 * RATE);
const HARMONY = [
  [38, 45, 53, 57, 62], [34, 46, 53, 57, 62], [43, 46, 50, 55, 62], [40, 45, 52, 57, 64],
  [41, 50, 53, 57, 65], [36, 43, 50, 55, 64], [34, 41, 50, 53, 65], [33, 45, 52, 55, 61],
  [43, 46, 53, 55, 62], [34, 46, 53, 57, 65], [33, 45, 52, 55, 61], [38, 45, 53, 57, 62],
];

// Times are relative to their bar; the answers and held notes leave air between phrases.
const THEME: [beat: number, note: number, length: number][] = [
  [0, 57, 1.32], [1.5, 62, 0.86], [2.5, 64, 0.44],
  [3, 65, 1.66], [4.83, 64, 0.57], [5.5, 62, 0.47],
  [6, 67, 2.06], [8.16, 65, 0.67], [9, 64, 1.42], [10.64, 57, 1.16],
  [12, 62, 1.12], [13.25, 65, 0.56], [14, 69, 0.73],
  [15, 67, 1.42], [16.56, 64, 1.23], [18, 65, 2.25], [20.45, 62, 0.44],
  [21, 61, 1.3], [22.5, 64, 0.66], [23.29, 65, 0.65],
  [24, 67, 1.47], [25.62, 70, 1.16], [27, 69, 1.68], [28.8, 65, 1.14],
  [30, 64, 0.86], [31, 61, 1.52], [33, 62, 2.76],
];

type Voice = 'viol' | 'bow' | 'lute' | 'choir';
const VOICES: Record<Voice, { harmonics: number[]; attack: number; release: number; vibrato: number; cutoff: number }> = {
  viol: { harmonics: [1, 0.50, 0.23, 0.21, 0.14, 0.072, 0.061, 0.028, 0.022], attack: 0.23, release: 0.63, vibrato: 9, cutoff: 1410 },
  bow: { harmonics: [1, 0.46, 0.35, 0.20, 0.16, 0.11, 0.056, 0.047, 0.038, 0.018], attack: 0.14, release: 0.53, vibrato: 14, cutoff: 2240 },
  lute: { harmonics: [1, 0.32, 0.48, 0.19, 0.16, 0.085, 0.10, 0.045, 0.061], attack: 0.008, release: 0.41, vibrato: 0, cutoff: 3200 },
  choir: { harmonics: [1, 0.21, 0.10, 0.31, 0.26, 0.098, 0.04, 0.021], attack: 0.37, release: 0.81, vibrato: 6, cutoff: 1730 },
};

const freq = (midi: number) => 440 * 2 ** ((midi - 69) / 12);
const sat = (v: number) => Math.max(0, Math.min(1, v));
const smooth = (x: number) => { const t = sat(x); return t * t * (3 - 2 * t); };

async function renderStem(stem: number, target: AudioContext) {
  const Offline = window.OfflineAudioContext || (window as Window & { webkitOfflineAudioContext?: typeof OfflineAudioContext }).webkitOfflineAudioContext;
  if (!Offline) throw new Error('Offline synthesis is unavailable');
  const ctx = new Offline(2, LOOP_FRAMES + TAIL_FRAMES, RATE);
  const dry = ctx.createGain();
  dry.connect(ctx.destination);
  for (const [time, amount, pan] of [[0.149, 0.19, -0.76], [0.227, 0.137, 0.72], [0.349, 0.091, -0.43], [0.563, 0.061, 0.45], [0.803, 0.039, 0.1]]) {
    const delay = ctx.createDelay(0.9);
    const gain = ctx.createGain();
    const lowpass = ctx.createBiquadFilter();
    const position = ctx.createStereoPanner();
    delay.delayTime.value = time;
    gain.gain.value = amount;
    lowpass.type = 'lowpass';
    lowpass.frequency.value = 1650 - time * 950;
    position.pan.value = pan;
    dry.connect(delay).connect(lowpass).connect(gain).connect(position).connect(ctx.destination);
  }

  const vibrato = ctx.createOscillator();
  vibrato.frequency.value = stem === 2 ? 4.7 : 4.2;
  vibrato.start(0);
  const waves = new Map<Voice, PeriodicWave>();
  const note = (voice: Voice, midi: number, beat: number, length: number, power: number, pan: number, detune = 0) => {
    const v = VOICES[voice];
    const t = beat * BEAT;
    const dur = length * BEAT;
    const releaseAt = t + dur;
    const end = releaseAt + v.release;
    const attack = Math.min(v.attack, dur * 0.41);
    const osc = ctx.createOscillator();
    let wave = waves.get(voice);
    if (!wave) {
      const im = Float32Array.from([0, ...v.harmonics]);
      wave = ctx.createPeriodicWave(new Float32Array(im.length), im);
      waves.set(voice, wave);
    }
    osc.setPeriodicWave(wave);
    osc.frequency.value = freq(midi);
    osc.detune.value = detune;
    if (v.vibrato > 0) {
      const wobble = ctx.createGain();
      wobble.gain.setValueAtTime(v.vibrato * 0.22, t);
      wobble.gain.setTargetAtTime(v.vibrato, t + attack, 0.21);
      vibrato.connect(wobble).connect(osc.detune);
    }
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = v.cutoff;
    filter.Q.value = 0.42;
    const env = ctx.createGain();
    env.gain.setValueAtTime(0, t);
    env.gain.linearRampToValueAtTime(power, t + attack);
    if (voice === 'lute') {
      filter.frequency.setValueAtTime(4400, t);
      filter.frequency.setTargetAtTime(830, t + attack, 0.1);
      env.gain.exponentialRampToValueAtTime(power * 0.16, releaseAt);
    } else env.gain.linearRampToValueAtTime(power * 0.79, releaseAt);
    env.gain.exponentialRampToValueAtTime(0.0001, end - 0.037);
    env.gain.linearRampToValueAtTime(0, end);
    const stereo = ctx.createStereoPanner();
    stereo.pan.value = pan;
    osc.connect(filter).connect(env).connect(stereo).connect(dry);
    osc.start(t);
    osc.stop(end);
  };

  const skin = ctx.createBuffer(1, Math.round(RATE * 0.27), RATE);
  const noise = skin.getChannelData(0);
  let seed = 247519;
  for (let i = 0; i < noise.length; i++) {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    noise[i] = seed / 2147483648 - 1;
  }
  const drum = (beat: number, power: number) => {
    const t = beat * BEAT;
    const o = ctx.createOscillator(), body = ctx.createGain();
    o.type = 'sine';
    o.frequency.setValueAtTime(91, t);
    o.frequency.exponentialRampToValueAtTime(47, t + 0.26);
    body.gain.setValueAtTime(0, t);
    body.gain.linearRampToValueAtTime(power, t + 0.019);
    body.gain.exponentialRampToValueAtTime(0.0001, t + 0.62);
    o.connect(body).connect(dry);
    o.start(t); o.stop(t + 0.66);
    const hit = ctx.createBufferSource(), snap = ctx.createGain(), skinFilter = ctx.createBiquadFilter();
    hit.buffer = skin;
    skinFilter.type = 'bandpass'; skinFilter.frequency.value = 421; skinFilter.Q.value = 0.73;
    snap.gain.setValueAtTime(0, t);
    snap.gain.linearRampToValueAtTime(power * 0.46, t + 0.011);
    snap.gain.exponentialRampToValueAtTime(0.0001, t + 0.25);
    hit.connect(skinFilter).connect(snap).connect(dry);
    hit.start(t);
  };

  for (let bar = 0; bar < HARMONY.length; bar++) {
    const [root, fifth, low, mid, high] = HARMONY[bar];
    const b = bar * 3;
    if (stem === 0) {
      note('viol', root, b, 2.76, 0.123, -0.19, -3);
      note('viol', fifth, b + 0.16, 2.71, 0.055, 0.23, 3);
      note('choir', low, b + 0.32, 2.54, 0.044, -0.38);
      note('lute', mid, b + 0.04, 0.7, 0.067, 0.24);
      if (bar % 2 === 0) note('lute', high, b + 1.83, 0.83, 0.046, -0.24);
      if (bar % 2 === 1) note('lute', low + 12, b + 2.04, 0.63, 0.037, 0.45);
    } else if (stem === 1) {
      const arpeggio = [fifth, low, mid, high, mid, low];
      for (let i = 0; i < arpeggio.length; i++) note('lute', arpeggio[i], b + i * 0.5 + (i % 2 ? 0.022 : 0), 0.5, i % 3 === 0 ? 0.080 : 0.052, i % 2 ? 0.33 : -0.31);
      note('viol', root + 12, b + 0.37, 2.15, 0.067, -0.49);
      if (bar % 2 === 0) drum(b + 0.04, 0.055);
    } else {
      note('viol', root - 5, b + 0.03, 2.69, 0.095, 0);
      note('choir', low + 12, b + 0.14, 2.72, 0.073, -0.55, -5);
      note('choir', high, b + 0.18, 2.72, 0.085, 0.56, 5);
      note('bow', mid + 12, b + 0.48, 2.31, 0.048, 0.38);
      drum(b, [0, 6, 8, 10, 11].includes(bar) ? 0.196 : 0.115);
      if (bar % 3 !== 0) drum(b + 1.96, 0.096);
    }
  }
  if (stem === 1) {
    for (const [b, midi, len] of THEME) note('bow', midi, b, len, 0.087, -0.04);
  }
  if (stem === 2) {
    for (const [b, midi, len] of THEME) {
      note('bow', midi + (midi >= 70 ? 0 : 12), b + 0.022, len, 0.089, -0.27, -4);
      note('bow', midi, b + 0.055, len, 0.056, 0.24, 5);
    }
  }

  const raw = await ctx.startRendering();
  const loop = target.createBuffer(2, LOOP_FRAMES, RATE);
  let peak = 0;
  for (let channel = 0; channel < 2; channel++) {
    const full = raw.getChannelData(channel), out = loop.getChannelData(channel);
    out.set(full.subarray(0, LOOP_FRAMES));
    // Wrap the release and room tails underneath the first notes, instead of cutting at the bar line.
    for (let i = 0; i < TAIL_FRAMES; i++) out[i] += full[LOOP_FRAMES + i];
    for (let i = 0; i < out.length; i++) peak = Math.max(peak, Math.abs(out[i]));
  }
  const level = (stem === 2 ? 0.63 : 0.54) / Math.max(0.05, peak);
  for (let ch = 0; ch < 2; ch++) {
    const out = loop.getChannelData(ch);
    for (let i = 0; i < out.length; i++) out[i] *= level;
  }
  return loop;
}

type Playback = { start: number; fade: GainNode; layers: GainNode[]; sources: (AudioBufferSourceNode | null)[] };

export class Soundtrack {
  private buffers: (AudioBuffer | null)[] = [null, null, null];
  private playback: Playback | null = null;
  private loading = false;
  private closing = false;
  private rebornNext = false;
  private gains = [0.43, 0.035, 0];
  private lastMix = [-1, -1, -1];

  constructor(private readonly audio: AudioContext, private readonly output: AudioNode) {}

  prepare() {
    if (this.loading || this.buffers.every(Boolean)) return;
    this.loading = true;
    void this.render().catch((error: unknown) => console.warn('Background score unavailable:', error)).finally(() => { this.loading = false; });
  }

  private async render() {
    // Play the quiet prologue as soon as it is ready. Join later stems at the same score position.
    for (let i = 0; i < this.buffers.length; i++) {
      if (this.buffers[i]) continue;
      this.buffers[i] = await renderStem(i, this.audio);
      if (this.closing) continue;
      if (this.playback) this.attach(this.playback, i);
      else this.play(this.rebornNext);
    }
  }

  update(chapter: number, hatch: number, charge: number) {
    const journey = smooth((chapter - 0.8) / 9.4);
    const wings = smooth((hatch - 0.27) / 0.68);
    this.gains[0] = 0.43 - journey * 0.15 - wings * 0.09;
    this.gains[1] = 0.035 + journey * 0.31 + wings * 0.067;
    this.gains[2] = wings * (0.57 + 0.14 * charge);
    if (this.playback && !this.closing) this.applyMix();
  }

  private applyMix() {
    const playback = this.playback;
    if (!playback) return;
    const t = this.audio.currentTime;
    for (let i = 0; i < this.gains.length; i++) {
      const target = this.gains[i];
      if (!playback.sources[i] || Math.abs(target - this.lastMix[i]) < 0.009) continue;
      playback.layers[i].gain.setTargetAtTime(target, t, i === 2 ? 0.51 : 0.67);
      this.lastMix[i] = target;
    }
  }

  private play(reborn: boolean) {
    if (!this.buffers[0]) { this.rebornNext = reborn; return; }
    const t = this.audio.currentTime + 0.045;
    const fade = this.audio.createGain();
    fade.gain.value = 0;
    fade.gain.setValueAtTime(0, t);
    if (reborn) fade.gain.linearRampToValueAtTime(0.16, t + 1.04);
    fade.gain.linearRampToValueAtTime(1, t + (reborn ? 3.05 : 1.55));
    fade.connect(this.output);
    const layers = this.buffers.map(() => {
      const gain = this.audio.createGain();
      gain.connect(fade);
      return gain;
    });
    this.playback = { start: t, fade, layers, sources: this.buffers.map(() => null) };
    this.rebornNext = false;
    for (let i = 0; i < this.buffers.length; i++) this.attach(this.playback, i, true);
  }

  private attach(playback: Playback, i: number, initial = false) {
    const buffer = this.buffers[i];
    if (!buffer || playback.sources[i]) return;
    const source = this.audio.createBufferSource();
    const layer = playback.layers[i];
    const t = initial ? playback.start : Math.max(playback.start, this.audio.currentTime + 0.035);
    const offset = (t - playback.start) % buffer.duration;
    const volume = this.gains[i];
    layer.gain.value = initial ? volume : 0;
    if (!initial) layer.gain.setTargetAtTime(volume, t, 0.17);
    source.buffer = buffer;
    source.loop = true;
    source.loopEnd = buffer.duration;
    source.connect(layer);
    source.start(t, offset);
    playback.sources[i] = source;
    this.lastMix[i] = volume;
  }

  melt() {
    this.closing = true;
    if (!this.playback) return;
    const t = this.audio.currentTime;
    const p = this.playback.fade.gain;
    if (typeof p.cancelAndHoldAtTime === 'function') p.cancelAndHoldAtTime(t);
    else { const value = p.value; p.cancelScheduledValues(t); p.setValueAtTime(value, t); }
    p.linearRampToValueAtTime(0, t + 1.19);
  }

  rebirth() {
    const old = this.playback;
    this.playback = null;
    this.closing = false;
    this.update(0, 0, 0);
    this.play(true);
    if (old) {
      for (const source of old.sources) {
        if (!source) continue;
        source.onended = () => { source.disconnect(); old.fade.disconnect(); };
        source.stop(this.audio.currentTime + 0.88);
      }
    }
  }
}

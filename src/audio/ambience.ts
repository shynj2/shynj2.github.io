/**
 * Fully procedural soundscape (no audio files):
 * icy wind + low drone at the start → fire roar & crackles as the realm heats up.
 */
class Ambience {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private wind: GainNode | null = null;
  private fire: GainNode | null = null;
  private fireFilter: BiquadFilterNode | null = null;
  private drone: GainNode | null = null;
  private droneFilter: BiquadFilterNode | null = null;
  private noise: AudioBuffer | null = null;
  private timer = 0;
  private heat = 0;
  private charge = 0;
  private last = 0;
  enabled = false;

  private build() {
    const AC: typeof AudioContext =
      window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new AC();
    this.ctx = ctx;

    const master = ctx.createGain();
    master.gain.value = 0;
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -16;
    comp.ratio.value = 3;
    master.connect(comp).connect(ctx.destination);
    this.master = master;

    // pink noise buffer
    const len = ctx.sampleRate * 4;
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = buf.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < len; i++) {
      const w = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + w * 0.0555179;
      b1 = 0.99332 * b1 + w * 0.0750759;
      b2 = 0.969 * b2 + w * 0.153852;
      b3 = 0.8665 * b3 + w * 0.3104856;
      b4 = 0.55 * b4 + w * 0.5329522;
      b5 = -0.7616 * b5 - w * 0.016898;
      d[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + w * 0.5362) * 0.11;
      b6 = w * 0.115926;
    }
    this.noise = buf;
    const loopNoise = () => {
      const s = ctx.createBufferSource();
      s.buffer = buf;
      s.loop = true;
      s.start(0, Math.random() * 3);
      return s;
    };

    // wind
    const w = loopNoise();
    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.value = 420;
    bp.Q.value = 0.9;
    const lfo = ctx.createOscillator();
    lfo.frequency.value = 0.06;
    const lfoAmt = ctx.createGain();
    lfoAmt.gain.value = 260;
    lfo.connect(lfoAmt).connect(bp.frequency);
    lfo.start();
    const gust = ctx.createGain();
    gust.gain.value = 0.7;
    const gLfo = ctx.createOscillator();
    gLfo.frequency.value = 0.13;
    const gAmt = ctx.createGain();
    gAmt.gain.value = 0.3;
    gLfo.connect(gAmt).connect(gust.gain);
    gLfo.start();
    const windGain = ctx.createGain();
    windGain.gain.value = 0.55;
    w.connect(bp).connect(gust).connect(windGain).connect(master);
    this.wind = windGain;

    // ominous drone
    const droneGain = ctx.createGain();
    droneGain.gain.value = 0.09;
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 320;
    lp.Q.value = 0.7;
    const voices: [number, OscillatorType, number][] = [
      [55, 'sawtooth', 0.22],
      [55.35, 'sawtooth', 0.22],
      [82.5, 'triangle', 0.16],
      [110.1, 'sine', 0.12],
    ];
    voices.forEach(([f, type, g]) => {
      const o = ctx.createOscillator();
      o.type = type;
      o.frequency.value = f;
      const og = ctx.createGain();
      og.gain.value = g;
      o.connect(og).connect(lp);
      o.start();
    });
    const dl = ctx.createOscillator();
    dl.frequency.value = 0.05;
    const dla = ctx.createGain();
    dla.gain.value = 110;
    dl.connect(dla).connect(lp.frequency);
    dl.start();
    lp.connect(droneGain).connect(master);
    this.drone = droneGain;
    this.droneFilter = lp;

    // fire roar
    const f = loopNoise();
    const flp = ctx.createBiquadFilter();
    flp.type = 'lowpass';
    flp.frequency.value = 600;
    const fireGain = ctx.createGain();
    fireGain.gain.value = 0;
    f.connect(flp).connect(fireGain).connect(master);
    this.fire = fireGain;
    this.fireFilter = flp;
  }

  private crackle() {
    const ctx = this.ctx;
    if (!ctx || !this.master || !this.noise || !this.enabled) return;
    const p = Math.pow(this.heat, 1.5) * 0.45 + this.charge * 0.55;
    if (Math.random() > p) return;
    const s = ctx.createBufferSource();
    s.buffer = this.noise;
    const hp = ctx.createBiquadFilter();
    hp.type = 'highpass';
    hp.frequency.value = 1800 + Math.random() * 3500;
    const g = ctx.createGain();
    const t = ctx.currentTime;
    const peak = (0.05 + Math.random() * 0.2) * (0.4 + this.heat);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(peak, t + 0.003);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.02 + Math.random() * 0.06);
    s.connect(hp).connect(g).connect(this.master);
    s.start(t, Math.random() * 3.5, 0.12);
  }

  start() {
    try {
      if (!this.ctx) this.build();
    } catch {
      return;
    }
    const ctx = this.ctx!;
    void ctx.resume();
    this.enabled = true;
    this.master!.gain.cancelScheduledValues(ctx.currentTime);
    this.master!.gain.setTargetAtTime(0.75, ctx.currentTime, 0.9);
    if (!this.timer) this.timer = window.setInterval(() => this.crackle(), 55);
    this.last = 0;
    this.update(this.heat, this.charge);
  }

  mute() {
    if (!this.ctx || !this.master) return;
    this.enabled = false;
    this.master.gain.cancelScheduledValues(this.ctx.currentTime);
    this.master.gain.setTargetAtTime(0, this.ctx.currentTime, 0.35);
  }

  update(heat: number, charge: number) {
    this.heat = heat;
    this.charge = charge;
    if (!this.ctx || !this.enabled || !this.wind || !this.fire || !this.fireFilter || !this.drone || !this.droneFilter) return;
    const now = performance.now();
    if (now - this.last < 110) return;
    this.last = now;
    const t = this.ctx.currentTime;
    this.wind.gain.setTargetAtTime(0.55 * (1 - heat * 0.75) + charge * 0.1, t, 0.5);
    this.fire.gain.setTargetAtTime(heat * 0.22 + charge * 0.55, t, 0.3);
    this.fireFilter.frequency.setTargetAtTime(480 + heat * 520 + charge * 1800, t, 0.3);
    this.drone.gain.setTargetAtTime(0.085 + heat * 0.07, t, 0.8);
    this.droneFilter.frequency.setTargetAtTime(300 + heat * 380, t, 0.8);
  }

  dracarys(power: number) {
    const ctx = this.ctx;
    if (!ctx || !this.master || !this.noise || !this.enabled) return;
    const t = ctx.currentTime;
    const s = ctx.createBufferSource();
    s.buffer = this.noise;
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.Q.value = 0.8;
    lp.frequency.setValueAtTime(300, t);
    lp.frequency.exponentialRampToValueAtTime(3200, t + 0.25);
    lp.frequency.exponentialRampToValueAtTime(200, t + 1.6);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(Math.max(0.001, 0.9 * power), t + 0.08);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 1.8);
    s.connect(lp).connect(g).connect(this.master);
    s.start(t, 0, 2);
    const o = ctx.createOscillator();
    o.type = 'sine';
    o.frequency.setValueAtTime(90, t);
    o.frequency.exponentialRampToValueAtTime(35, t + 0.9);
    const og = ctx.createGain();
    og.gain.setValueAtTime(0.0001, t);
    og.gain.exponentialRampToValueAtTime(Math.max(0.001, 0.6 * power), t + 0.03);
    og.gain.exponentialRampToValueAtTime(0.0001, t + 1.1);
    o.connect(og).connect(this.master);
    o.start(t);
    o.stop(t + 1.2);
  }

  flaps() {
    const ctx = this.ctx;
    if (!ctx || !this.master || !this.noise || !this.enabled) return;
    const t0 = ctx.currentTime;
    for (let i = 0; i < 7; i++) {
      const t = t0 + i * 0.16;
      const s = ctx.createBufferSource();
      s.buffer = this.noise;
      const bp = ctx.createBiquadFilter();
      bp.type = 'bandpass';
      bp.frequency.value = 500 + Math.random() * 200;
      bp.Q.value = 1.2;
      const g = ctx.createGain();
      const v = 0.5 * (1 - i / 8);
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(v, t + 0.04);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.14);
      s.connect(bp).connect(g).connect(this.master);
      s.start(t, Math.random() * 3, 0.2);
    }
  }
}

export const ambience = new Ambience();

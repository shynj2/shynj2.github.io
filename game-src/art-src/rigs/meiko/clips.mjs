// MEIKO — Seraphic Angel animation clips.
// Continuous sinusoidal four-wing flight (zero leg-pumping), serene open-winged glide, levitation run, and benediction poses.
const STAND = {
  hy: 0, hx: 0, lean: 0, head: 0, headY: 0,
  aF: [22, 58], aB: [-8, 28],
  lF: [1, -3, 0], lB: [-1, -3, 0],
  wingF: 0, wingB: -6, cherubF: 4, cherubB: -2,
  hairB: -2, gown: 0, sash: 0,
};

function P(o = {}) {
  const p = { ...STAND, ...o };
  const pose = {
    b: {
      hips:    { x: p.hx, y: p.hy },
      torso:   { r: p.lean },
      head:    { r: p.head, y: p.headY },
      armF:    { r: p.aF[0] },    foreF:   { r: p.aF[1] },
      armB:    { r: p.aB[0] },    foreB:   { r: p.aB[1] },
      wingF:   { r: p.wingF },    wingB:   { r: p.wingB },
      cherubF: { r: p.cherubF },  cherubB: { r: p.cherubB },
      hairB:   { r: p.hairB },    gown:    { r: p.gown },
      sash:    { r: p.sash },
    },
    ik: { legF: p.lF, legB: p.lB },
  };
  if (p.face) pose.swap = { head: p.face };
  for (const k of ['hold', 'ev', 'fx', 'z', 'hide', 'overlay', 'w']) if (p[k] != null) pose[k] = p[k];
  return pose;
}

const lerp = (a, b, t) => a + (b - a) * t;
function mix(A, B, t, extra = {}) {
  const a = { ...STAND, ...A }, b = { ...STAND, ...B }, o = {};
  for (const k of Object.keys(STAND)) o[k] = Array.isArray(a[k]) ? a[k].map((v, i) => lerp(v, b[k][i] == null ? v : b[k][i], t)) : lerp(a[k], b[k], t);
  return { ...o, ...extra };
}

const KNEEL = {
  hy: 8, hx: -1, lean: 6, head: 10,
  aF: [34, 72], aB: [24, 68],
  lF: [4, -3, 0], lB: [-6, -2, 65],
  wingF: 10, wingB: 4, cherubF: 12, cherubB: 6,
  gown: 5, face: 'headBlink',
};
const HURT = {
  hx: -1, hy: 1, lean: -10, head: -6,
  aF: [48, 42], aB: [-38, 30],
  wingF: -14, wingB: -20, cherubF: -8, cherubB: -12,
  face: 'headBlink',
};

// Continuous 8-frame seraphic flight loop: rhythmic four-wing wave with phase-lagged cherubim pinions
// and serenely poised trailing legs (no knee-tucking or jump pumping).
const FLY_FRAMES = Array.from({ length: 8 }, (_, i) => {
  const ph = (i / 8) * Math.PI * 2;
  const s = Math.sin(ph), c = Math.cos(ph);
  const cs = Math.sin(ph - 1.05), cc = Math.cos(ph - 1.05); // secondary cherub wings lag gracefully
  return P({
    hy: -3 + Math.round(0.8 * s),
    hx: 1,
    lean: 4 + Math.round(1.2 * s),
    head: -3 + Math.round(0.8 * c),
    wingF:   2 + Math.round(18 * c),
    wingB:  -4 + Math.round(18 * c),
    cherubF: 5 + Math.round(14 * cc),
    cherubB: -1 + Math.round(14 * cc),
    aF: [22 - Math.round(5 * c), 54 + Math.round(4 * s)],
    aB: [-12 + Math.round(5 * c), 34 + Math.round(3 * cs)],
    lF: [-1, -5, 16 + Math.round(1.5 * s)],
    lB: [-3, -5, 21 + Math.round(1.5 * s)],
    hairB: -12 + Math.round(3 * cs),
    gown:  -5 + Math.round(1.5 * c),
    sash:  -11 + Math.round(3 * cs),
    face: (i === 2 || i === 3 || i === 4) ? 'headSmile' : undefined,
  });
});

// Serene 6-frame open-winged celestial glide for floating descent
const GLIDE_FRAMES = Array.from({ length: 6 }, (_, i) => {
  const ph = (i / 6) * Math.PI * 2;
  const s = Math.sin(ph), c = Math.cos(ph);
  return P({
    hy: -3 + Math.round(0.7 * s),
    hx: 1,
    lean: 3,
    head: 1,
    wingF:  -12 + Math.round(4 * c),
    wingB:  -18 + Math.round(4 * c),
    cherubF: -5 + Math.round(4 * s),
    cherubB: -11 + Math.round(4 * s),
    aF: [18 + Math.round(2 * s), 44 + Math.round(3 * c)],
    aB: [-16 - Math.round(2 * s), 30],
    lF: [-1, -5, 15],
    lB: [-3, -5, 20],
    hairB: -16 + Math.round(2 * s),
    gown:  -5 + Math.round(c),
    sash:  -14 + Math.round(2 * c),
    face: (i === 1 || i === 2 || i === 3) ? 'headSmile' : undefined,
  });
});

export default {
  // Regal breathing idle with delayed 4-wing feather wave and gentle float
  idle: { fps: 6, loop: true, frames: [
    P({ hy:  0, wingF:  2, wingB:  -4, cherubF:  6, cherubB:  0, aF: [22, 58], aB: [-8, 28], hold: 2 }),
    P({ hy: -1, wingF: -3, wingB:  -9, cherubF:  3, cherubB: -3, aF: [24, 62], aB: [-6, 30], hairB: -4, sash: -2, hold: 2 }),
    P({ hy: -2, wingF: -8, wingB: -14, cherubF: -2, cherubB: -8, aF: [26, 65], aB: [-5, 32], hairB: -6, sash: -4, lF: [1, -4, 10], lB: [-1, -4, 12], hold: 2 }),
    P({ hy: -2, wingF: -6, wingB: -12, cherubF: -4, cherubB: -9, aF: [25, 64], aB: [-6, 31], hairB: -5, sash: -3, lF: [1, -4, 10], lB: [-1, -4, 12], face: 'headSmile', hold: 2 }),
    P({ hy: -1, wingF: -1, wingB:  -7, cherubF:  1, cherubB: -4, aF: [23, 60], aB: [-7, 29], face: 'headBlink', hold: 1 }),
    P({ hy:  0, wingF:  3, wingB:  -3, cherubF:  7, cherubB:  1, aF: [22, 58], aB: [-8, 28], hold: 2 }),
  ] },

  // Sacred prayer & radiant smile
  idle_look: { fps: 5, loop: false, frames: [
    P({ hy: -1, aF: [28, 68], aB: [18, 62], wingF: -4, wingB: -10, hold: 2 }),
    P({ hy: -2, head: 5, aF: [34, 78], aB: [26, 74], wingF: -12, wingB: -18, cherubF: -6, cherubB: -10, face: 'headBlink', hold: 3 }),
    P({ hy: -3, head: 6, aF: [36, 80], aB: [28, 76], wingF: -15, wingB: -21, cherubF: -8, cherubB: -12, lF: [1, -5, 14], lB: [-1, -5, 16], face: 'headBlink', hold: 3 }),
    P({ hy: -2, head: -3, aF: [28, 64], aB: [10, 48], wingF: -8, wingB: -14, face: 'headSmile', hold: 3 }),
    P({ hy: -1, head:  0, aF: [24, 60], aB: [-6, 30], wingF: -2, wingB: -8, face: 'headSmile', hold: 2 }),
    P({ hy:  0, hold: 2 }),
  ] },

  // Seraphic Levitation Glide along the ground
  run_start: { fps: 12, loop: false, frames: [
    P({ hy: -1, hx: 1, lean: 4, head: -2, wingF: -6, wingB: -12, gown: -4, sash: -8, aF: [26, 56], aB: [-14, 30] }),
    P({ hy: -3, hx: 2, lean: 7, head: -3, wingF:  4, wingB:  -2, gown: -6, sash: -12, hairB: -12, lF: [-1, -5, 16], lB: [-3, -5, 20], aF: [26, 52], aB: [-16, 28] }),
  ] },

  run: { fps: 10, loop: true, frames: Array.from({ length: 8 }, (_, i) => {
    const ph = (i / 8) * Math.PI * 2, s = Math.sin(ph), c = Math.cos(ph);
    return P({
      hy: -3 + Math.round(s),
      hx: 2,
      lean: 7 + Math.round(0.8 * s),
      head: -3,
      wingF:   3 + Math.round(9 * c),
      wingB:  -3 + Math.round(9 * c),
      cherubF: 7 + Math.round(7 * s),
      cherubB: 1 + Math.round(7 * s),
      hairB: -14 + Math.round(3 * s),
      gown:   -6 + Math.round(2 * c),
      sash:  -13 + Math.round(3 * s),
      aF: [24 - Math.round(5 * c), 54 + Math.round(3 * s)],
      aB: [-16 + Math.round(5 * c), 28],
      lF: [-1, -5, 17],
      lB: [-3, -5, 21],
      ev: (i === 2 || i === 6) ? 'step' : undefined,
      face: (i === 3 || i === 4) ? 'headSmile' : undefined,
    });
  }) },

  run_stop: { fps: 12, loop: false, frames: [
    P({ hy: -2, lean: -2, head: 1, wingF: -8, wingB: -14, gown: 4, sash: 6, hairB: 2, lF: [1, -4, 8], lB: [-1, -4, 10] }),
    P({ hy: -1, lean: -1, head: 1, wingF: -3, wingB:  -9, gown: 2, sash: 2 }),
    P({ hy:  0 }),
  ] },

  // Dedicated continuous Seraphic Flight & Glide clips (used by 70-main.js without mid-air clip thrashing)
  fly:       { fps: 11, loop: true, frames: FLY_FRAMES },
  glide:     { fps: 7,  loop: true, frames: GLIDE_FRAMES },
  jump_up:   { fps: 11, loop: true, frames: FLY_FRAMES },
  jump_apex: { fps: 7,  loop: true, frames: GLIDE_FRAMES.slice(0, 4) },
  fall:      { fps: 7,  loop: true, frames: GLIDE_FRAMES },

  // Feather-light landing
  land: { fps: 12, loop: false, frames: [
    P({ hy: 1, lean: 2, head: 2, wingF: 8, wingB: 2, cherubF: 10, cherubB: 4, aF: [25, 54], aB: [-10, 30] }),
    P({ hy: 0, lean: 1, head: 1, wingF: 3, wingB: -3, cherubF: 7, cherubB: 1, aF: [23, 56], aB: [-9, 29] }),
    P({ hy: 0 }),
  ] },

  land_hard: { fps: 12, loop: false, frames: [
    P({ hy: 2, lean: 4, head: 3, wingF: 12, wingB: 6, cherubF: 13, cherubB: 7, aF: [28, 50], aB: [-14, 32], face: 'headSmile' }),
    P({ hy: 1, lean: 2, head: 1, wingF:  6, wingB: 0, cherubF:  9, cherubB: 3, aF: [25, 55], aB: [-10, 30] }),
    P({ hy: 0 }),
  ] },

  read: { fps: 5, loop: true, frames: [
    P({ head: -5, face: 'headUp', wingF: -4, wingB: -10, aF: [26, 62], hold: 3 }),
    P({ hy: -1, head: -6, face: 'headUp', wingF: -8, wingB: -14, aF: [28, 64], hold: 2 }),
    P({ head: -5, face: 'headBlink', wingF: -4, wingB: -10, hold: 1 }),
    P({ head: -5, face: 'headUp', wingF: -4, wingB: -10, hold: 2 }),
  ] },

  // Serene benediction listen pose while mortals kneel and speak to her
  listen: { fps: 5, loop: true, frames: [
    P({ hy: -1, lean: 2, head: 4, aF: [30, 68], aB: [-6, 32], wingF: -4, wingB: -10, face: 'headSmile', hold: 3 }),
    P({ hy: -2, lean: 3, head: 5, aF: [32, 70], aB: [-4, 34], wingF: -8, wingB: -14, face: 'headSmile', hold: 2 }),
    P({ hy: -1, lean: 2, head: 4, aF: [30, 68], aB: [-6, 32], wingF: -5, wingB: -11, face: 'headBlink', hold: 1 }),
    P({ hy: -1, lean: 2, head: 4, aF: [30, 68], aB: [-6, 32], wingF: -4, wingB: -10, face: 'headSmile', hold: 2 }),
  ] },

  // Extending a radiant hand in blessing / taking Shyn's hand
  interact: { fps: 10, loop: false, frames: [
    P({ hy: -1, lean: 3, head: 2, aF: [48, 36], wingF: -6, wingB: -12, face: 'headSmile' }),
    P({ hy: -2, lean: 5, head: 3, aF: [76, 14], wingF: -12, wingB: -18, face: 'headSmile', hold: 3, ev: 'touch' }),
    P({ hy: -1, lean: 2, head: 1, aF: [38, 46], wingF: -4, wingB: -10, face: 'headSmile' }),
  ] },

  rest_kneel: { fps: 10, loop: false, frames: [
    ...[0, .2, .45, .7, .9, 1].map((t) => P(mix(STAND, KNEEL, t))),
    P({ ...KNEEL, hold: 3 }),
  ] },
  rest_loop: { fps: 4, loop: true, frames: [
    P({ ...KNEEL, hold: 2 }),
    P({ ...KNEEL, hy: 9, wingF: 6, wingB: 0, hold: 2 }),
    P({ ...KNEEL, hy: 9, wingF: 8, wingB: 2, hold: 2 }),
  ] },
  rest_rise: { fps: 10, loop: false, frames: [.85, .6, .35, .12, 0].map((t) => P(mix(STAND, KNEEL, t))) },

  hurt: { fps: 12, loop: false, frames: [
    P({ ...HURT, hold: 2 }),
    P({ ...HURT, lean: -5, head: -3, wingF: -8, wingB: -14 }),
    P({ hy: 0 }),
  ] },

  dissolve:    { fps: 12, loop: false, frames: Array.from({ length: 10 }, (_, i) => P({ hy: -i * 0.4, wingF: -12, wingB: -18, fx: { dissolve: (i + 1) / 10 } })) },
  materialize: { fps: 12, loop: false, frames: Array.from({ length: 10 }, (_, i) => P({ hy: -(9 - i) * 0.4, wingF: -12, wingB: -18, fx: { dissolve: 1 - (i + 1) / 10, seed: 23 } })) },

  atk1: { fps: 12, loop: false, frames: [
    P({ hy: -2, lean: -4, aF: [42, 68], wingF: -12, wingB: -18, hold: 2 }),
    P({ hy: -3, lean:  8, hx: 2, aF: [84, 10], wingF: 14, wingB: 8, face: 'headSmile', hold: 2 }),
    P({ hy: -2, lean:  4, aF: [48, 36], wingF:  4, wingB: -2, hold: 2 }),
  ] },
  atk2: { fps: 12, loop: false, frames: [
    P({ hy: -2, lean: 4, aF: [72, 16], wingF: 8, wingB: 2, hold: 2 }),
    P({ hy: -4, lean: -4, aF: [112, 18], wingF: -16, wingB: -22, face: 'headUp', hold: 2 }),
    P({ hy: -1, aF: [28, 52], hold: 2 }),
  ] },
  atk3: { fps: 12, loop: false, frames: [
    P({ hy: -3, lean: -6, aF: [36, 76], aB: [28, 72], wingF: -16, wingB: -22, face: 'headBlink', hold: 2 }),
    P({ hy: -4, lean:  8, hx: 3, aF: [88, 6], aB: [-28, 24], wingF: 20, wingB: 14, face: 'headSmile', hold: 3 }),
    P({ hy: -1, aF: [26, 56], hold: 2 }),
  ] },
  heavy: { fps: 12, loop: false, frames: [
    P({ hy: -4, lean: -6, head: -6, aF: [128, 16], aB: [116, 20], wingF: -20, wingB: -26, face: 'headUp', hold: 3 }),
    P({ hy: -2, lean: 10, head:  2, aF: [ 68, 10], aB: [-22, 28], wingF:  22, wingB:  16, face: 'headSmile', hold: 3 }),
    P({ hy:  0, hold: 2 }),
  ] },
  special: { fps: 12, loop: false, frames: [
    P({ hy: -4, head: -6, aF: [36, 78], aB: [28, 74], wingF: -18, wingB: -24, face: 'headBlink', hold: 3 }),
    P({ hy: -6, head: -8, aF: [118, 14], aB: [-42, 22], wingF: 22, wingB: 16, face: 'headUp', hold: 4 }),
    P({ hy: -2, hold: 2 }),
  ] },
  dodge: { fps: 14, loop: false, frames: [
    P({ hy: -3, hx: 3, lean: 12, wingF: 16, wingB: 10, gown: -10, sash: -16, hairB: -18, hold: 2 }),
    P({ hy: -4, hx: 5, lean: 14, wingF: 22, wingB: 16, gown: -12, sash: -20, hairB: -22, hold: 3 }),
    P({ hy: -1, lean: 4, hold: 2 }),
  ] },
  guard: { fps: 5, loop: true, frames: [
    P({ hy: -1, aF: [36, 78], aB: [28, 74], wingF: 14, wingB: 8, face: 'headBlink' }),
    P({ hy: -2, aF: [38, 80], aB: [30, 76], wingF: 16, wingB: 10, face: 'headBlink' }),
  ] },
  mercy_stand: { fps: 1, loop: true, frames: [
    P({ head: -6, face: 'headUp', wingF: -8, wingB: -14 }),
  ] },
};

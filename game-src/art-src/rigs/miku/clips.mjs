// MIKU — 27 animation clips with twin-tail secondary motion, pleated skirt flare, singing expressions, and Harmonic Vox-Lance choreography.
// Note: bones with `sign: -1` (armF, foreF, armB, foreB, tailF, tailB, tie, skirt) swing FORWARD on positive angles, BACKWARD on negative angles.
const STAND = {
  hy: 0, hx: 0, lean: 1, head: 0, headY: 0,
  aF: [14, 28], aB: [-10, 22],
  lF: [2, -3, 0], lB: [-2, -3, 0],
  tailF: -2, tailB: 2, tie: 0, skirt: 0, w: 20,
};

function P(o = {}) {
  const p = { ...STAND, ...o };
  const pose = {
    b: {
      hips:  { x: p.hx, y: p.hy },
      torso: { r: p.lean },
      head:  { r: p.head, y: p.headY },
      armF:  { r: p.aF[0] }, foreF: { r: p.aF[1] },
      armB:  { r: p.aB[0] }, foreB: { r: p.aB[1] },
      tailF: { r: p.tailF }, tailB: { r: p.tailB },
      tie:   { r: p.tie },   skirt: { r: p.skirt },
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

function foot(p) {
  p = ((p % 1) + 1) % 1;
  if (p < .5) { const s = p / .5; return [7 - 13 * s, s > .8 ? -4 : -3, s < .15 ? -18 : s > .75 ? 28 : 0]; }
  const s = (p - .5) / .5;
  return [-6 + 13 * s, -3 - 7 * Math.sin(Math.PI * s) * (1 - .35 * s) - 1, 45 * (1 - s) - 18 * s];
}

function runPose(i) {
  const ph = i / 10, c = Math.cos(Math.PI * 2 * ph), s2 = Math.sin(Math.PI * 4 * ph);
  return P({
    hy: 1.3 + 1.3 * Math.cos(Math.PI * 4 * ph - .9),
    lean: 13, head: -6,
    lF: foot(ph), lB: foot(ph + .5),
    aF: [-42 * c, 72 - 20 * c],
    aB: [ 42 * c, 72 + 20 * c],
    tailF: -22 + 6 * s2,
    tailB: -26 - 6 * s2,
    skirt: -8 + 3 * s2,
    w: 24 + Math.round(10 * c),
    ev: i === 0 || i === 5 ? 'step' : null,
  });
}

const KNEEL = { hy: 9, hx: -1, lean: 10, head: 11, aF: [36, 54], aB: [-10, 26], lF: [6, -3, 0], lB: [-9, -2, 75], tailF: 8, tailB: 6, skirt: 6 };
const HURT  = { hx: -1, hy: 1, lean: -15, head: -10, aF: [68, 34], aB: [-62, 24], lF: [3, -3, -10], lB: [-4, -3, 0], tailF: 18, tailB: 22, face: 'headWorry', w: -24 };

export default {
  idle: { fps: 6, loop: true, frames: [
    P({ hy: 0, lean: 1, head:  0, tailF: -2, tailB:  2, aF: [14, 28], aB: [-10, 22], hold: 2, w: 20 }),
    P({ hy: 1, lean: 2, head: -1, tailF: -5, tailB: -1, aF: [16, 30], aB: [-12, 24], hold: 2, w: 18 }),
    P({ hy: 1, lean: 1, head: -2, tailF: -4, tailB: -3, aF: [15, 29], aB: [-11, 23], hold: 2, w: 19 }),
    P({ hy: 0, lean: 0, head: -1, tailF: -1, tailB:  2, aF: [13, 27], aB:  [-9, 21], face: 'headBlink', hold: 1, w: 21 }),
    P({ hy: 0, lean: 1, head:  0, tailF:  0, tailB:  4, aF: [14, 28], aB: [-10, 22], hold: 2, w: 20 }),
  ] },

  // Idol headset-touch & soft melody hum
  idle_look: { fps: 6, loop: false, frames: [
    P({ hold: 1 }),
    P({ lean: -2, head: -4, aB: [58, 92], tailF: -6, tailB: -3, face: 'headSing', hold: 3, w: 18 }),
    P({ hy: -1, lean: -3, head: -6, aB: [62, 96], tailF: -9, tailB: -6, face: 'headSing', hold: 3, w: 15 }),
    P({ lean: -1, head: -2, aB: [36, 68], tailF: -4, tailB: -1, face: 'headBlink', hold: 2, w: 20 }),
    P({ lean:  2, head:  2, aF: [18, 32], tailF:  2, tailB:  4, face: 'headBack', hold: 2, w: 24 }),
    P({ hold: 2 }),
  ] },

  run_start: { fps: 14, loop: false, frames: [
    P({ hy: 3, hx: 1, lean: 10, head: -4, aF: [22, 50],  aB: [-22, 42], lF: [3, -3, 0], lB: [-3, -3, 0], tailF: -10, tailB: -12, w: 28 }),
    P({ hy: 2, hx: 2, lean: 14, head: -6, aF: [-22, 65], aB: [ 28, 48], lF: [0, -3, 12], lB: [4, -6, 10], tailF: -18, tailB: -22, w: 32 }),
    runPose(0),
  ] },

  run: { fps: 14, loop: true, frames: Array.from({ length: 10 }, (_, i) => runPose(i)) },

  run_stop: { fps: 12, loop: false, frames: [
    P({ hy: 2, hx: -1, lean: -6, head: 4, lF: [7, -3, -12], lB: [-3, -3, 10], aF: [38, 34], aB: [-24, 28], tailF: 12, tailB: 10, skirt: 8, ev: 'step', w: 16 }),
    P({ hy: 3, lean: -3, head: 2, lF: [4, -3, 0], lB: [-2, -3, 0], aF: [20, 28], aB: [-12, 22], tailF: 6, tailB: 5, skirt: 4, w: 18 }),
    P({ hy: 1 }),
  ] },

  jump_up: { fps: 12, loop: false, frames: [
    P({ hy: 4, lean: 12, head:  6, lF: [3, -3, 0], lB: [-2, -3, 0], aF: [-30, 42], aB: [-24, 38], tailF: -8, tailB: -10, w: 34 }),
    P({ hy: -2, lean: -6, head: -8, lF: [3, -8, 25], lB: [-3, -5, 35], aF: [52, 34], aB: [36, 30], tailF: -24, tailB: -28, skirt: -8, hold: 2, w: -24 }),
    P({ hy: -3, lean: -7, head: -9, lF: [4, -9, 28], lB: [-3, -6, 40], aF: [60, 28], aB: [42, 24], tailF: -28, tailB: -32, skirt: -10, hold: 2, w: -30 }),
  ] },

  jump_apex: { fps: 10, loop: false, frames: [
    P({ hy: -1, lean: -2, head: -3, lF: [4, -8, 12], lB: [-4, -7, 18], aF: [34, 26], aB: [26, 22], tailF: -32, tailB: -38, w: -8 }),
    P({ hy: -1, lean:  2, head:  2, lF: [3, -7,  8], lB: [-4, -8, 14], aF: [24, 22], aB: [18, 20], tailF: -44, tailB: -50, skirt: -6, w: 6 }),
  ] },

  fall: { fps: 10, loop: true, frames: [
    P({ lean: 5, head: 6, lF: [3, -6, 18], lB: [-4, -9, 24], aF: [36, 20], aB: [-42, 18], tailF: -56, tailB: -64, tie: -28, skirt: -10, w: -12 }),
    P({ lean: 6, head: 7, lF: [4, -7, 20], lB: [-3, -8, 22], aF: [42, 16], aB: [-36, 22], tailF: -66, tailB: -74, tie: -36, skirt: -12, w: -16 }),
    P({ lean: 5, head: 6, lF: [2, -6, 16], lB: [-4, -9, 26], aF: [32, 22], aB: [-44, 16], tailF: -60, tailB: -68, tie: -32, skirt: -11, w: -10 }),
  ] },

  land: { fps: 14, loop: false, frames: [
    P({ hy: 5, lean: 14, head: 8, lF: [4, -3, 0], lB: [-3, -3, 0], aF: [32, 42], aB: [-20, 32], tailF: 14, tailB: 16, skirt: 8, ev: 'land', w: 32 }),
    P({ hy: 4, lean: 10, head: 4, lF: [3, -3, 0], lB: [-3, -3, 0], aF: [22, 34], aB: [-14, 26], tailF: -12, tailB: -14, w: 26 }),
    P({ hy: 2, lean:  4, head: 1, tailF: -4, tailB: -2, w: 22 }),
    P({ hy: 0 }),
  ] },

  land_hard: { fps: 12, loop: false, frames: [
    P({ hy: 8, lean: 24, head: 12, lF: [6, -3, 0], lB: [-4, -3, 8], aF: [52, 24], aB: [-28, 36], tailF: 18, tailB: 20, skirt: 12, ev: 'land', w: 42 }),
    P({ hy: 9, lean: 26, head: 14, lF: [6, -3, 0], lB: [-4, -3, 10], aF: [58, 16], aB: [-32, 40], tailF: -16, tailB: -18, face: 'headBlink', hold: 2, w: 46 }),
    P({ hy: 6, lean: 18, head:  8, lF: [5, -3, 0], lB: [-3, -3,  4], aF: [36, 30], aB: [-18, 30], tailF: -10, tailB: -12, w: 34 }),
    P({ hy: 3, lean:  8, head:  3, tailF: -4, tailB: -2, w: 24 }),
    P({ hy: 0 }),
  ] },

  read: { fps: 5, loop: true, frames: [
    P({ head: -6, face: 'headUp', aF: [10, 26], tailF: -4, tailB: -3, hold: 3 }),
    P({ head: -7, face: 'headUp', hy: 1, aF: [12, 28], tailF: -5, tailB: -4, hold: 2 }),
    P({ head: -6, face: 'headBlink', aF: [10, 26], hold: 1 }),
    P({ head: -6, face: 'headUp', aF: [10, 26], hold: 2 }),
  ] },

  listen: { fps: 4, loop: true, frames: [
    P({ lean: 2, head: -2, aF: [12, 34], aB: [-12, 30], hold: 3 }),
    P({ lean: 3, head:  2, aF: [14, 36], aB: [-14, 32], hold: 1 }),
    P({ lean: 3, head:  3, face: 'headBlink', aF: [14, 36], hold: 1 }),
    P({ lean: 2, head:  0, aF: [12, 34], hold: 2 }),
  ] },

  interact: { fps: 12, loop: false, frames: [
    P({ lean: 4, aF: [36, 48], w: 12 }),
    P({ lean: 8, head: 2, aF: [76, 18], hold: 2, ev: 'touch', w: 0 }),
    P({ lean: 3, aF: [30, 36], w: 18 }),
  ] },

  rest_kneel: { fps: 10, loop: false, frames: [
    ...[0, .16, .36, .6, .82, .96, 1.04].map((t) => P(mix(STAND, KNEEL, t))),
    P({ ...KNEEL, hold: 3 }),
  ] },
  rest_loop: { fps: 4, loop: true, frames: [
    P({ ...KNEEL, hold: 2 }),
    P({ ...KNEEL, hy: 10, head: 13, aF: [36, 56], hold: 1 }),
    P({ ...KNEEL, hy: 10, head: 13, aF: [36, 56], face: 'headBlink', hold: 1 }),
    P({ ...KNEEL, hy: 10, head: 12, hold: 2 }),
  ] },
  rest_rise: { fps: 10, loop: false, frames: [.92, .7, .45, .2, .04, -.04].map((t) => P(mix(STAND, KNEEL, t))) },

  hurt: { fps: 12, loop: false, frames: [
    P({ ...HURT, hold: 2 }),
    P({ ...HURT, lean: -10, head: -6, aF: [46, 32], aB: [-42, 24], tailF: 10, tailB: 12, w: -10 }),
    P({ hy: 1, lean: -3, aF: [20, 26], aB: [-14, 20], face: 'headWorry', w: 16 }),
  ] },

  dissolve:    { fps: 12, loop: false, frames: Array.from({ length: 10 }, (_, i) => P({ ...HURT, lean: -8, fx: { dissolve: (i + 1) / 10 } })) },
  materialize: { fps: 12, loop: false, frames: Array.from({ length: 10 }, (_, i) => P({ hy: 2, lean: 4, aF: [12, 24], aB: [-8, 18], fx: { dissolve: 1 - (i + 1) / 10, seed: 17 } })) },

  // ---- BESPOKE HARMONIC VOX-LANCE COMBAT ----
  // Combo 1: Forehand harmonic arc
  atk1: { fps: 15, loop: false, frames: [
    P({ w: -118, lean: -9, hx: -1, head: -4, aF: [-122, 46], aB: [-26, 36], lF: [3, -3, 0], lB: [-5, -3, 0], tailF: 10, tailB: 12, hold: 2 }),
    P({ w:  -12, lean: 15, hx:  3, head:  4, aF: [  78, 10], aB: [-48, 34], lF: [7, -3, 0], lB: [-6, -3, 14], tailF: -24, tailB: -28, skirt: -8, hold: 2 }),
    P({ w:   32, lean: 18, hx:  4, head:  6, aF: [ 116,  6], aB: [-56, 28], lF: [8, -3, 0], lB: [-7, -3, 20], tailF: -28, tailB: -32, skirt: -10, hold: 2 }),
    P({ w:   20, lean:  7, hx:  1, aF: [42, 24], aB: [-18, 24], tailF: -8, tailB: -8, hold: 2 }),
  ] },

  // Combo 2: Rising concert backhand slash (singing!)
  atk2: { fps: 15, loop: false, frames: [
    P({ w:  52, lean: 15, hx: 2, head:  5, aF: [122, 10], aB: [-48, 30], lF: [7, -3, 0], lB: [-6, -3, 12], tailF: -16, tailB: -18, hold: 2 }),
    P({ w:   4, lean:  0, hx: 2, head: -2, aF: [ 36,  8], aB: [-26, 36], lF: [7, -3, 0], lB: [-6, -3,  6], tailF: -28, tailB: -34, face: 'headSing', hold: 2 }),
    P({ w: -68, lean: -9, hx: 1, head: -8, aF: [-66, 20], aB: [ 14, 42], lF: [6, -3, 0], lB: [-5, -3,  0], tailF: -38, tailB: -44, skirt: -8, face: 'headSing', hold: 2 }),
    P({ w:  18, lean:  2, aF: [16, 28], aB: [-10, 22], tailF: -4, tailB: -2, hold: 2 }),
  ] },

  // Combo 3: Crescendo lunge & tri-chord harmonic thrust!
  atk3: { fps: 14, loop: false, frames: [
    P({ w: -16, lean: -12, hx: -2, head: -6, aF: [-98, 78], aB: [ 32, 50], lF: [ 2, -3,  0], lB: [-6, -3,  0], tailF: -12, tailB: -14, hold: 2 }),
    P({ w:   0, lean:  24, hx:  5, hy: 2, head: 6, aF: [90, 2], aB: [-72, 20], lF: [11, -3, -8], lB: [-9, -3, 30], tailF: -32, tailB: -36, skirt: -12, face: 'headSing', hold: 3 }),
    P({ w:   4, lean:  20, hx:  4, hy: 2, head: 5, aF: [84, 6], aB: [-60, 24], lF: [10, -3,  0], lB: [-8, -3, 24], tailF: -26, tailB: -30, skirt:  -8, face: 'headSing', hold: 2 }),
    P({ w:  18, lean:   7, hx:  1, aF: [36, 22], aB: [-18, 24], tailF: -8, tailB: -8, hold: 2 }),
  ] },

  // Heavy Attack: High-jump Concert Bass-Drop Cleave!
  heavy: { fps: 12, loop: false, frames: [
    P({ w: -105, lean:  -8, hy:  1, head:  -8, aF: [132, 28], aB: [118, 34], lF: [4, -3, 0], lB: [-5, -3,  0], tailF: -14, tailB: -18, hold: 2 }),
    P({ w: -138, lean: -14, hy: -2, head: -10, aF: [146, 16], aB: [132, 20], lF: [4, -6, 18], lB: [-5, -5, 22], tailF: -36, tailB: -42, face: 'headSing', hold: 3 }),
    P({ w:   26, lean:  26, hy:  4, hx: 4, head: 10, aF: [52, 4], aB: [36, 10], lF: [9, -3, 0], lB: [-8, -3, 26], tailF: -32, tailB: -36, skirt: -10, face: 'headSing', hold: 3 }),
    P({ w:   54, lean:  28, hy:  5, hx: 4, head: 12, aF: [38, 6], aB: [24, 12], lF: [9, -3, 0], lB: [-8, -3, 30], tailF: -22, tailB: -26, hold: 2 }),
    P({ w:   22, lean:   8, hy:  1, aF: [26, 22], aB: [-8, 24], tailF: -4, tailB: -2, hold: 2 }),
  ] },

  // Charged Special: Skyward Stage-Idol Encore Chant!
  special: { fps: 12, loop: false, frames: [
    P({ w: -82, lean: -6, head:  -6, aF: [126, 18], aB: [-36, 48], lF: [3, -3, 0], lB: [-4, -3, 0], tailF: -28, tailB: -34, face: 'headSing', hold: 3 }),
    P({ w: -88, lean: -9, hy: -2, head: -10, aF: [136, 12], aB: [-48, 38], lF: [3, -6, 16], lB: [-4, -5, 18], tailF: -46, tailB: -54, skirt: -8, face: 'headSing', hold: 4 }),
    P({ w:  -6, lean: 14, hx:  2, head:   2, aF: [ 82,  6], aB: [-46, 30], lF: [8, -3, 0], lB: [-7, -3, 16], tailF: -22, tailB: -26, hold: 3 }),
    P({ w:  20, lean:  4, aF: [28, 24], aB: [-14, 22], hold: 2 }),
  ] },

  dodge: { fps: 14, loop: false, frames: [
    P({ w: 150, hy: 5, lean: 28, head: -6, aF: [-48, 48], aB: [-68, 44], lF: [ 9, -3, -12], lB: [ -9, -3, 40], tailF: -28, tailB: -32, skirt: -10, hold: 2 }),
    P({ w: 160, hy: 6, lean: 34, head: -9, aF: [-68, 38], aB: [-82, 38], lF: [11, -3, -16], lB: [-11, -4, 54], tailF: -34, tailB: -38, skirt: -12, hold: 3 }),
    P({ w:  30, hy: 3, lean: 16, head: -3, aF: [ 14, 34], aB: [-32, 34], lF: [ 7, -3,   0], lB: [ -7, -3, 20], tailF: -14, tailB: -16, hold: 2 }),
  ] },

  guard: { fps: 5, loop: true, frames: [
    P({ w: -78, hy: 2, lean: 6, head: -3, aF: [72, 82], aB: [42, 94], lF: [5, -3, 0], lB: [-6, -3, 10], tailF: -4, tailB: -2 }),
    P({ w: -78, hy: 3, lean: 7, head: -4, aF: [70, 84], aB: [40, 96], lF: [5, -3, 0], lB: [-6, -3, 10], tailF: -6, tailB: -4 }),
  ] },

  mercy_stand: { fps: 1, loop: true, frames: [
    P({ head: -7, face: 'headUp', aF: [2, 6], aB: [-2, 6], tailF: 0, tailB: 2 }),
  ] },
};

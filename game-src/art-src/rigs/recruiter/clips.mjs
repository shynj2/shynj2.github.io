// THE RECRUITER — clips. Every entry of `frames` is one drawn key pose (animation on 2s/3s:
// timing comes from `hold`, never from runtime tweening).  P({...}) builds a pose:
//   hy/hx   hips offset (px, +y = lower = squash)      lean  torso angle (+ forward)
//   head    head angle · headY head offset · face  head sprite swap
//   aF/aB   [upperArm, forearm] angles (+ = swings forward / elbow flexes)
//   lF/lB   IK foot targets [x, y, footAngle(+toe down)] relative to the ground point
//   tie/bag extra angles (they also get automatic secondary motion from the baker)
//   w       angle the weapon is held at in this frame (degrees, 0 = pointing forward, 90 = down, -90 = up)
const STAND = { hy: 0, hx: 0, lean: 0, head: 0, headY: 0, aF: [4, 10], aB: [-4, 10], lF: [2, -3, 0], lB: [-2, -3, 0], tie: 0, bag: 0 };
function P(o = {}) {
  const p = { ...STAND, ...o };
  const pose = {
    b: {
      hips: { x: p.hx, y: p.hy }, torso: { r: p.lean }, head: { r: p.head, y: p.headY },
      armF: { r: p.aF[0] }, foreF: { r: p.aF[1] }, armB: { r: p.aB[0] }, foreB: { r: p.aB[1] },
      tie: { r: p.tie }, bag: { r: p.bag }
    },
    ik: { legF: p.lF, legB: p.lB }
  };
  if (p.face) pose.swap = { head: p.face };
  for (const k of ['hold', 'ev', 'fx', 'z', 'hide', 'overlay', 'w']) if (p[k] != null) pose[k] = p[k];
  return pose;
}
const lerp = (a, b, t) => a + (b - a) * t;
/** blend two pose descriptions (used only at AUTHORING time to make in-betweens) */
function mix(A, B, t, extra = {}) {
  const a = { ...STAND, ...A }, b = { ...STAND, ...B }, o = {};
  for (const k of Object.keys(STAND)) o[k] = Array.isArray(a[k]) ? a[k].map((v, i) => lerp(v, b[k][i] == null ? v : b[k][i], t)) : lerp(a[k], b[k], t);
  return { ...o, ...extra };
}

/* ---------- run: 10 frames, two steps. Contact on 0 and 5. ---------- */
function foot(p) {
  p = ((p % 1) + 1) % 1;
  if (p < .5) { const s = p / .5; return [7 - 13 * s, s > .8 ? -4 : -3, s < .15 ? -18 : s > .75 ? 28 : 0]; }
  const s = (p - .5) / .5;
  return [-6 + 13 * s, -3 - 7 * Math.sin(Math.PI * s) * (1 - .35 * s) - 1, 45 * (1 - s) - 18 * s];
}
function runPose(i) {
  const ph = i / 10, c = Math.cos(Math.PI * 2 * ph);
  return P({
    hy: 1.4 + 1.3 * Math.cos(Math.PI * 4 * ph - .9), lean: 13, head: -7,
    lF: foot(ph), lB: foot(ph + .5),
    aF: [-42 * c, 75 - 22 * c], aB: [42 * c, 75 + 22 * c],
    ev: i === 0 || i === 5 ? 'step' : null
  });
}

const KNEEL = { hy: 9, hx: -1, lean: 10, head: 12, aF: [38, 55], aB: [-10, 25], lF: [6, -3, 0], lB: [-9, -2, 75] };
const HURT = { hx: -1, hy: 1, lean: -16, head: -12, aF: [70, 35], aB: [-65, 25], lF: [3, -3, -10], lB: [-4, -3, 0], face: 'headWorry' };
const FALL = { hy: -1, lean: 4, head: -6, aF: [115, 12], aB: [-105, 12], lF: [3, -6, 25], lB: [-3, -4, 35], tie: 115, bag: 25 };

export default {
  idle: { fps: 6, loop: true, frames: [
    P({ hold: 3 }),
    P({ hy: 1, headY: -1, aF: [3, 12], aB: [-3, 12] }),          // chest sinks, head lags one frame
    P({ hy: 1, aF: [2, 14], aB: [-2, 14], tie: -5, hold: 3 }),
    P({ headY: 1, aF: [3, 12], aB: [-3, 12] })                    // rise, head lags
  ] },
  idle_look: { fps: 6, loop: false, frames: [                    // slightly lost: over the shoulder, then up
    P({ face: 'headBlink' }),
    P({ lean: -2, face: 'headBack', hold: 4 }),
    P({ hy: 1, lean: -3, face: 'headBack', aF: [2, 14], hold: 2 }),
    P({ face: 'headBlink' }),
    P({ head: -8, face: 'headUp', aF: [6, 14], hold: 3 }),
    P({ hy: 1, head: -8, face: 'headUp', hold: 2 }),
    P({ face: 'headWorry', hold: 2 })
  ] },
  run_start: { fps: 14, loop: false, frames: [
    P({ hy: 2, lean: 6, aF: [-20, 40], aB: [20, 40], lF: [3, -3, 0], lB: [-3, -3, 10] }),      // anticipation: sink
    P({ hy: 1, lean: 16, head: -6, aF: [-40, 70], aB: [35, 60], lF: [5, -6, 20], lB: [-5, -4, 30] }),
    P({ hy: 1, lean: 14, head: -7, aF: [-30, 80], aB: [40, 70], lF: [7, -4, -10], lB: [-6, -4, 30] })
  ] },
  run: { fps: 14, loop: true, frames: Array.from({ length: 10 }, (_, i) => runPose(i)) },
  run_stop: { fps: 12, loop: false, frames: [                    // skid on the heel, weight thrown back
    P({ hy: 2, lean: -10, head: 4, aF: [55, 30], aB: [30, 30], lF: [8, -3, -22], lB: [-3, -3, 0], ev: 'skid' }),
    P({ hy: 3, lean: -6, head: 6, aF: [40, 30], aB: [10, 25], lF: [7, -3, -8], lB: [-3, -3, 0] }),
    P({ hy: 1, lean: 2, aF: [10, 16], aB: [-2, 14], lF: [4, -3, 0], lB: [-2, -3, 0] })
  ] },
  jump_up: { fps: 12, loop: false, frames: [
    P({ hy: -2, lean: 6, head: -8, aF: [95, 25], aB: [-40, 30], lF: [1, -2, 40], lB: [-3, -1, 45], hold: 1 }),   // full stretch
    P({ hy: -1, lean: 5, head: -6, aF: [80, 30], aB: [-30, 30], lF: [3, -4, 30], lB: [-3, -2, 40], hold: 2 }),
    P({ hy: 0, lean: 4, head: -4, aF: [70, 30], aB: [-40, 25], lF: [4, -6, 20], lB: [-2, -4, 35], hold: 2 })
  ] },
  jump_apex: { fps: 10, loop: false, frames: [
    P({ hy: 0, lean: 2, aF: [75, 20], aB: [-70, 15], lF: [5, -8, 10], lB: [-2, -6, 30], tie: 30, hold: 1 }),
    P({ hy: 0, lean: 2, aF: [90, 15], aB: [-85, 12], lF: [4, -7, 15], lB: [-3, -5, 32], tie: 70, bag: 15, hold: 1 })
  ] },
  fall: { fps: 10, loop: true, frames: [
    P({ ...FALL }),
    P({ ...FALL, aF: [122, 8], aB: [-98, 16], lF: [3, -5, 28], lB: [-4, -4, 30], tie: 125, bag: 32 }),
    P({ ...FALL, aF: [110, 16], aB: [-110, 8], lF: [2, -6, 22], lB: [-3, -3, 38], tie: 108, bag: 20 })
  ] },
  land: { fps: 14, loop: false, frames: [
    P({ hy: 5, lean: 20, head: 8, aF: [25, 35], aB: [-45, 30], lF: [4, -3, 0], lB: [-4, -3, 0], ev: 'land' }),   // squash
    P({ hy: 4, lean: 16, head: 6, aF: [15, 30], aB: [-25, 25], lF: [4, -3, 0], lB: [-4, -3, 0] }),
    P({ hy: 2, lean: 8, aF: [8, 20], aB: [-10, 18], lF: [3, -3, 0], lB: [-3, -3, 0] }),
    P({ hy: -1, lean: 0, aF: [4, 8], aB: [-4, 8] })                                                              // tiny overshoot
  ] },
  land_hard: { fps: 12, loop: false, frames: [
    P({ hy: 8, lean: 34, head: 14, aF: [45, 15], aB: [-50, 35], lF: [5, -3, 0], lB: [-6, -3, 10], ev: 'land' }),
    P({ hy: 9, lean: 38, head: 16, aF: [40, 10], aB: [-40, 30], lF: [5, -3, 0], lB: [-6, -3, 10], hold: 2 }),
    P({ hy: 7, lean: 28, head: 12, aF: [30, 25], aB: [-30, 30], lF: [5, -3, 0], lB: [-5, -3, 0] }),
    P({ hy: 4, lean: 16, head: 6, aF: [15, 25], aB: [-15, 22], lF: [4, -3, 0], lB: [-4, -3, 0] }),
    P({ hy: 1, lean: 6, aF: [8, 16], aB: [-6, 14], lF: [3, -3, 0], lB: [-3, -3, 0] }),
    P({})
  ] },
  read: { fps: 5, loop: true, frames: [                          // hand to chin, leaning in to the inscription
    P({ lean: 7, head: 4, aF: [38, 132], aB: [-8, 12], hold: 3 }),
    P({ hy: 1, lean: 8, head: 6, aF: [36, 134], aB: [-8, 14], hold: 2 }),
    P({ hy: 1, lean: 8, head: 6, aF: [36, 134], aB: [-8, 14], face: 'headBlink' }),
    P({ lean: 7, head: 2, aF: [38, 128], aB: [-8, 12], hold: 2 })
  ] },
  listen: { fps: 6, loop: true, frames: [                        // small nods
    P({ hold: 3 }),
    P({ head: 8, headY: 1 }),
    P({ head: 3 }),
    P({ hy: 1, hold: 2 }),
    P({ hy: 1, face: 'headBlink' })
  ] },
  interact: { fps: 12, loop: false, frames: [
    P({ lean: 4, aF: [35, 50] }),
    P({ lean: 9, head: 4, aF: [82, 10], hold: 2 }),
    P({ lean: 5, aF: [45, 35] })
  ] },
  rest_kneel: { fps: 10, loop: false, frames: [0, .06, .22, .48, .74, .95, 1.06, 1].map((t, i) => P(mix(STAND, KNEEL, t, { hold: i === 7 ? 3 : 1 }))) },
  rest_loop: { fps: 4, loop: true, frames: [
    P({ ...KNEEL, hold: 2 }),
    P({ ...KNEEL, hy: 10, head: 14, aF: [38, 57], hold: 1 }),
    P({ ...KNEEL, hy: 10, head: 14, aF: [38, 57], face: 'headBlink', hold: 1 }),
    P({ ...KNEEL, hy: 10, head: 13, hold: 2 })
  ] },
  rest_rise: { fps: 10, loop: false, frames: [.92, .7, .45, .2, .04, -.04].map((t) => P(mix(STAND, KNEEL, t))) },
  hurt: { fps: 12, loop: false, frames: [
    P({ ...HURT, hold: 2 }),
    P({ ...HURT, lean: -11, head: -8, aF: [50, 35], aB: [-45, 25] }),
    P({ hy: 1, lean: -4, aF: [20, 25], aB: [-15, 20], face: 'headWorry' })
  ] },
  dissolve: { fps: 12, loop: false, frames: Array.from({ length: 10 }, (_, i) => P({ ...HURT, lean: -8, fx: { dissolve: (i + 1) / 10 } })) },
  materialize: { fps: 12, loop: false, frames: Array.from({ length: 10 }, (_, i) => P({ hy: 2, lean: 4, aF: [10, 20], aB: [-8, 16], fx: { dissolve: 1 - (i + 1) / 10, seed: 11 } })) },
  /* ---- Round 9: combat (the weapon itself is drawn by the game, 64-combat.js; these are the body) ---- */
  atk1: { fps: 14, loop: false, frames: [                           // forehand cut
    P({ w: -120, lean: -8, head: -4, aF: [-125, 45], aB: [-25, 35], lF: [4, -3, 0], lB: [-5, -3, 0], hold: 2 }),
    P({ w: -20, lean: 14, hx: 2, head: 4, aF: [70, 12], aB: [-45, 35], lF: [7, -3, 0], lB: [-6, -3, 12], hold: 2 }),
    P({ w: 35, lean: 18, hx: 3, head: 6, aF: [118, 6], aB: [-55, 30], lF: [8, -3, 0], lB: [-7, -3, 18], hold: 2 }),
    P({ w: 20, lean: 8, hx: 1, aF: [48, 22], aB: [-20, 25], hold: 2 })
  ] },
  atk2: { fps: 14, loop: false, frames: [                           // backhand, rising
    P({ w: 50, lean: 16, hx: 2, head: 6, aF: [125, 10], aB: [-50, 30], lF: [7, -3, 0], lB: [-6, -3, 12], hold: 2 }),
    P({ w: 10, lean: 2, hx: 2, aF: [30, 8], aB: [-30, 35], lF: [7, -3, 0], lB: [-6, -3, 6], hold: 2 }),
    P({ w: -70, lean: -10, hx: 1, head: -8, aF: [-70, 20], aB: [10, 40], lF: [6, -3, 0], lB: [-5, -3, 0], hold: 2 }),
    P({ w: -40, lean: -2, aF: [-10, 25], aB: [0, 25], hold: 2 })
  ] },
  atk3: { fps: 14, loop: false, frames: [                           // the finisher: a long step and a thrust
    P({ w: -10, lean: -12, hx: -2, head: -6, aF: [-100, 80], aB: [30, 50], lF: [2, -3, 0], lB: [-6, -3, 0], hold: 3 }),
    P({ w: 0, lean: 24, hx: 5, hy: 2, head: 8, aF: [88, 2], aB: [-70, 20], lF: [11, -3, -8], lB: [-9, -3, 30], hold: 3 }),
    P({ w: 0, lean: 20, hx: 4, hy: 2, head: 6, aF: [84, 6], aB: [-60, 25], lF: [10, -3, 0], lB: [-8, -3, 24], hold: 2 }),
    P({ w: -20, lean: 8, hx: 1, aF: [40, 20], aB: [-20, 25], hold: 2 })
  ] },
  heavy: { fps: 12, loop: false, frames: [                          // both hands over the head, then down
    P({ w: -100, lean: -6, hy: 1, head: -8, aF: [150, 30], aB: [140, 35], lF: [4, -3, 0], lB: [-5, -3, 0], hold: 2 }),
    P({ w: -150, lean: -14, hy: 0, head: -14, aF: [178, 12], aB: [168, 16], lF: [5, -3, 0], lB: [-6, -3, 0], hold: 3 }),
    P({ w: 30, lean: 26, hy: 4, hx: 3, head: 12, aF: [50, 4], aB: [38, 8], lF: [9, -3, 0], lB: [-8, -3, 26], hold: 3 }),
    P({ w: 60, lean: 30, hy: 5, hx: 3, head: 14, aF: [36, 6], aB: [26, 10], lF: [9, -3, 0], lB: [-8, -3, 30], hold: 3 }),
    P({ w: 30, lean: 10, hy: 2, aF: [30, 20], aB: [10, 25], hold: 2 })
  ] },
  special: { fps: 12, loop: false, frames: [                        // the weapon held high, then thrown forward
    P({ w: -90, lean: -8, head: -10, aF: [172, 6], aB: [-30, 30], lF: [3, -3, 0], lB: [-4, -3, 0], hold: 4 }),
    P({ w: -10, lean: 16, hx: 2, head: 4, aF: [80, 4], aB: [-50, 30], lF: [8, -3, 0], lB: [-7, -3, 16], hold: 4 }),
    P({ w: -30, lean: 6, aF: [40, 20], aB: [-20, 25], hold: 2 })
  ] },
  dodge: { fps: 14, loop: false, frames: [                          // a low, fast step
    P({ w: 150, hy: 5, lean: 30, head: -6, aF: [-50, 50], aB: [-70, 45], lF: [9, -3, -12], lB: [-9, -3, 40], hold: 2 }),
    P({ w: 160, hy: 7, lean: 38, head: -10, aF: [-70, 40], aB: [-85, 40], lF: [11, -3, -16], lB: [-11, -4, 55], hold: 3 }),
    P({ w: 120, hy: 4, lean: 20, head: -4, aF: [-20, 40], aB: [-40, 40], lF: [7, -3, 0], lB: [-7, -3, 20], hold: 2 })
  ] },
  guard: { fps: 4, loop: true, frames: [                            // weapon across the body
    P({ w: -80, hy: 2, lean: 6, head: -4, aF: [72, 84], aB: [42, 96], lF: [5, -3, 0], lB: [-6, -3, 10] }),
    P({ w: -80, hy: 3, lean: 7, head: -4, aF: [70, 86], aB: [40, 98], lF: [5, -3, 0], lB: [-6, -3, 10] })
  ] },
  mercy_stand: { fps: 1, loop: true, frames: [P({ head: -7, face: 'headUp', aF: [0, 4], aB: [0, 4] })] }
};

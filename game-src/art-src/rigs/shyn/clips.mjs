// SHYN — clips. He is heavy and slow: long holds, small moves; the glyphs and the coat do the motion.
const TAU = Math.PI * 2;
function pose(i, n, o = {}) {
  const ph = i / n, br = Math.round(Math.sin(ph * TAU)), b = {}, z = {};
  const arm = o.arm == null ? 8 : o.arm;
  b.chest = { x: o.cx || 0, y: br + (o.cy || 0) };
  b.head = { y: 0, r: o.head || 0 };
  b.armF = { r: arm }; b.staff = { r: -arm + (o.tilt || 0) }; b.armB = { r: o.armB == null ? -5 : o.armB };
  for (let k = 0; k < 4; k++) {                       // code glyphs orbit the chest; near half in front, far half behind
    const a = (ph * (o.spin || 1) + k / 4) * TAU, rx = o.rx || 30;
    b['g' + (k + 1)] = { x: Math.round(Math.cos(a) * rx), y: Math.round((o.gy == null ? -62 : o.gy) + Math.sin(a) * 7 + (k % 2) * 12 - 6 + Math.sin((ph + k * .3) * TAU) * 2) };
    z['g' + (k + 1)] = Math.sin(a) > 0 ? 9 : 1;
  }
  return { b, z, hold: o.hold || 1, swap: { coat: o.kneel ? 'coatK' : (i % 6) < 3 ? 'coat' : 'coatB' } };
}
const idle = [], cast = [], hurt = [], kneel = [];
for (let i = 0; i < 12; i++) idle.push(pose(i, 12, { hold: 2 }));
// cast: the staff comes up and forward, the glyphs widen and race
for (let i = 0; i < 8; i++) cast.push(pose(i, 8, { arm: 62 + Math.round(Math.sin(i / 8 * TAU) * 6), tilt: 24, armB: -28, head: -6, rx: 40, spin: 2, gy: -74, hold: 2 }));
[[-3, -14, 1], [-6, -22, 2], [-4, -12, 2], [-1, -4, 3]].forEach(([cx, hd, hold], i) => hurt.push(pose(i, 4, { cx, head: hd, arm: 30, tilt: 14, armB: -20, hold, rx: 22 })));
// kneel (mercy): shoulders drop, head bows, both hands on the planted key
for (let i = 0; i < 6; i++) kneel.push(pose(i, 6, { kneel: 1, cy: 16, head: 18, arm: 72, armB: 40, hold: 4, rx: 22, gy: -44 }));
/* ---- Round 9: the fight. The game sets BOSS.pose to one of these names (64-combat.js). ---- */
const seq = (rows) => rows.map((o, i) => pose(i, rows.length, o));
const slash = seq([{ arm: 118, tilt: -10, armB: -20, head: -8, cx: -3, hold: 3 }, { arm: 60, tilt: 40, armB: -30, cx: 3, hold: 1 }, { arm: 12, tilt: 74, armB: -36, head: 8, cx: 7, hold: 3 }, { arm: 20, tilt: 40, cx: 3, hold: 2 }]);
const draw = seq([{ cy: 9, cx: -4, arm: -24, tilt: -48, armB: 30, head: 10, rx: 20, hold: 7 }, { cy: 6, cx: 8, arm: 96, tilt: 92, armB: -40, head: 4, rx: 44, spin: 3, hold: 3 }, { cy: 2, cx: 6, arm: 70, tilt: 60, armB: -30, hold: 3 }]);
const thrw = seq([{ cx: -3, armB: -40, arm: 20, head: -4, hold: 4 }, { cx: 9, cy: 3, armB: 84, arm: 30, head: 10, hold: 3 }, { cx: 4, cy: 6, armB: 130, arm: 40, head: 14, hold: 3 }, { cx: 1, armB: 20, hold: 2 }]);
const dash = seq([{ cx: 9, cy: 4, arm: 44, tilt: 30, armB: -50, head: 12, rx: 18, hold: 2 }, { cx: 11, cy: 5, arm: 50, tilt: 36, armB: -60, head: 14, rx: 16, hold: 2 }]);
const summon = []; for (let i = 0; i < 6; i++) summon.push(pose(i, 6, { arm: 150, tilt: 10, armB: 150, head: -12, rx: 46, spin: 3, gy: -80, hold: 2 }));
const superC = []; for (let i = 0; i < 8; i++) superC.push(pose(i, 8, { arm: 160 + (i % 2) * 6, tilt: 0, armB: 160, head: -16, rx: 54, spin: 4, gy: -88, cy: -2, hold: 1 }));
const counter = seq([{ arm: 74, tilt: -64, armB: 34, head: 2, cx: -2, rx: 24, hold: 3 }, { arm: 72, tilt: -62, armB: 32, head: 2, cx: -2, rx: 24, hold: 3 }]);
const stagger = []; for (let i = 0; i < 4; i++) stagger.push(pose(i, 4, { kneel: 1, cy: 11, cx: -3, head: 16, arm: 58, armB: 24, hold: 3, rx: 18, gy: -40 }));
export default {
  slash:   { fps: 12, loop: false, frames: slash },
  draw:    { fps: 12, loop: false, frames: draw },
  throw:   { fps: 12, loop: false, frames: thrw },
  dash:    { fps: 10, loop: true,  frames: dash },
  summon:  { fps: 10, loop: true,  frames: summon },
  super:   { fps: 14, loop: true,  frames: superC },
  counter: { fps: 6,  loop: true,  frames: counter },
  stagger: { fps: 8,  loop: true,  frames: stagger },
  idle:  { fps: 10, loop: true,  frames: idle },
  cast:  { fps: 10, loop: true,  frames: cast },
  hurt:  { fps: 10, loop: false, frames: hurt },
  kneel: { fps: 8,  loop: true,  frames: kneel }
};

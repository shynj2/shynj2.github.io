// THE LIBRARIAN — clips. The body barely moves (authority = stillness); the books do the acting.
// Each book rides an ellipse around the chest; when it is on the near half it is drawn in front
// of the body (pose.z), on the far half behind it and one step darker would be ideal (TODO_ART).
const N = 6, TAU = Math.PI * 2;
function pose(i, n, o = {}) {
  const ph = i / n, breath = Math.round(Math.sin(ph * TAU) * 1), b = {}, z = {};
  for (let k = 0; k < N; k++) {
    const a = (ph * (o.spin || 1) + k / N) * TAU, rx = (o.rx || 21) + (k % 2) * 3, ry = 5 + (k % 3);
    const lift = o.lift ? o.lift * Math.sin(Math.PI * Math.min(1, (o.t == null ? ph : o.t))) : 0;
    b['b' + (k + 1)] = { x: Math.round(Math.cos(a) * rx), y: Math.round(-44 + (k % 3) * 5 - 6 + Math.sin(a) * ry + Math.sin((ph + k * .37) * TAU) * 1.5 - lift) };
    z['b' + (k + 1)] = Math.sin(a) > 0 ? 9 : 1;
  }
  b.chest = { y: breath }; b.head = { y: breath, r: o.head || 0 };
  b.armF = { r: o.arm == null ? 6 : o.arm }; b.handF = { r: o.hand || 0 }; b.armB = { r: -4 };
  const p = { b, z, hold: o.hold || 1 };
  p.swap = { robe: (i % 6) < 3 ? 'robe' : 'robeB' };
  if (o.open) p.swap.handF = 'handOpen';
  return p;
}
const idle = [], gesture = [];
for (let i = 0; i < 12; i++) idle.push(pose(i, 12, { hold: 2 }));
// gesture: anticipation (arm dips), lift, hold with open hand while the books rise, settle
const G = [[-6, 0, 0, 1], [30, 0, .15, 1], [72, 1, .4, 1], [96, 1, .7, 2], [100, 1, 1, 3], [98, 1, 1, 3], [96, 1, .8, 2], [60, 1, .5, 1], [24, 0, .2, 1], [8, 0, 0, 2]];
G.forEach(([arm, open, t, hold], i) => gesture.push(pose(i, 10, { arm, open, hold, lift: 5, t: t * .5, head: open ? -6 : 0, spin: 1 })));
function kneelPose(i, n, o = {}) {
  const ph = i / n, breath = Math.round(Math.sin(ph * TAU) * 1), b = {}, z = {};
  const by = o.bookY == null ? -24 : o.bookY, rx = o.rx || 19;
  for (let k = 0; k < N; k++) {
    const a = (ph + k / N) * TAU;
    b['b' + (k + 1)] = { x: Math.round(Math.cos(a) * rx), y: Math.round(by + (k % 3) * 3 + Math.sin(a) * 4 + Math.sin((ph + k * .37) * TAU)) };
    z['b' + (k + 1)] = Math.sin(a) > 0 ? 9 : 1;
  }
  const drop = o.drop == null ? 14 : o.drop;
  b.chest = { x: o.cx || 1, y: drop + breath, r: o.lean == null ? 7 : o.lean };
  b.head  = { y: breath, r: o.head == null ? 15 : o.head };
  b.armF  = { r: o.arm == null ? 54 : o.arm };
  b.handF = { r: o.hand == null ? 24 : o.hand };
  b.armB  = { r: 10 };
  const swap = { robe: o.robe || 'robeK' };
  if (o.open) swap.handF = 'handOpen';
  return { b, z, swap, hold: o.hold || 2 };
}

export default {
  idle: { fps: 10, loop: true, frames: idle },
  gesture: { fps: 10, loop: false, frames: gesture },
  kneel_down: { fps: 10, loop: false, frames: [
    kneelPose(0, 8, { drop: 2,  lean: 3, head:  5, arm: 22, hand: 10, bookY: -42, robe: 'robe',  hold: 1 }),
    kneelPose(1, 8, { drop: 8,  lean: 5, head: 10, arm: 38, hand: 18, bookY: -33, robe: 'robeM', hold: 2 }),
    kneelPose(2, 8, { drop: 17, lean: 8, head: 14, arm: 50, hand: 22, bookY: -23, robe: 'robeK', hold: 2 }),
    kneelPose(3, 8, { drop: 19, lean: 7, head: 16, arm: 54, hand: 24, bookY: -21, robe: 'robeK', hold: 2 }),
  ] },
  kneel: { fps: 8, loop: true, frames: Array.from({ length: 8 }, (_, i) => kneelPose(i, 8, {
    drop: 19, lean: 7, head: i >= 3 && i <= 5 ? 17 : 15, arm: 54, hand: 24, bookY: -21, hold: 2
  })) },
  kneel_talk: { fps: 8, loop: true, frames: Array.from({ length: 6 }, (_, i) => kneelPose(i, 6, {
    drop: 19, lean: 5, head: i >= 2 && i <= 3 ? 2 : 4, arm: 74, hand: 18, bookY: -21, open: 1, hold: 2
  })) },
  kneel_up: { fps: 10, loop: false, frames: [
    kneelPose(4, 8, { drop: 17, lean: 6, head: 12, arm: 42, hand: 18, bookY: -23, robe: 'robeK', hold: 1 }),
    kneelPose(5, 8, { drop: 8,  lean: 4, head:  6, arm: 24, hand: 10, bookY: -33, robe: 'robeM', hold: 2 }),
    kneelPose(6, 8, { drop: 1,  lean: 1, head:  2, arm: 10, hand:  4, bookY: -42, robe: 'robe',  hold: 1 }),
  ] },
};

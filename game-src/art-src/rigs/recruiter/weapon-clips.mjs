// WEAPON CLIPS (Round 11) — every weapon has its own stance and its own blows.
//
// A clip named  <base>_<weapon>  replaces  <base>  while that weapon is in hand (67-combat.js looks it up):
//   ready_*   the stance while the weapon is out and the visitor stands still (the weapon's idle)
//   atk1_* atk2_* atk3_*   the light blows        heavy_*   the heavy blow        special_* / glyph_* / stance_*   the charged one
//   charge_*  held while the heavy button is down  guard_*   the block
// Blow clips are  [wind-up, strike, follow-through, recover]  (heavy: two wind-up frames): the game picks the frame from how far the blow is.
//
// Hands are placed by TARGET (the baker solves shoulder and elbow), in pixels from the ground point under the figure:
// +x forward, -y up; the hips are at y -18, the shoulders at -28, the top of the head at -42. An arm reaches 13 px.
//   T(sep)(gx, gy, w, body)   two-handed grip: the leading fist at [gx, gy], the weapon at angle w (0 forward, -90 up, 90 down;
//                             use steps of 30), the other fist `sep` px along the weapon (negative = toward the pommel).
//                             The build warns when a hand cannot reach its place on the handle.
//   D(f, b, w, w2, body)      one thing in each hand: fists at f and b, held at angles w and w2.
const DEG = Math.PI / 180;
export default function weaponClips(P, BASE) {
  const T = (sep) => (gx, gy, w, o = {}) => {
    const u = [Math.cos(w * DEG), Math.sin(w * DEG)];
    return P({ lF: [5, -3, 0], lB: [-6, -3, 8], ...o, w, two: 1, sep, hF: [gx, gy, 0, o.bF == null ? -1 : o.bF], hB: [gx + u[0] * sep, gy + u[1] * sep, 0, o.bB == null ? -1 : o.bB] });
  };
  const D = (f, b, w, w2, o = {}) => P({ lF: [5, -3, 0], lB: [-6, -3, 8], ...o, w, w2, hF: [f[0], f[1], 0, o.bF == null ? -1 : o.bF], hB: [b[0], b[1], 0, o.bB == null ? -1 : o.bB] });
  const loop = (fps, frames) => ({ fps, loop: true, frames }), once = (fps, frames) => ({ fps, loop: false, frames });
  const K = T(-4), C = T(-4), H = T(7), S = T(9);
  const WIDE = { lF: [7, -3, 0], lB: [-8, -3, 14] }, LUNGE = { lF: [11, -3, -8], lB: [-9, -3, 30] };

  /* Moving with a two-handed weapon: the legs and body of the plain clip, both hands on the handle ("port arms": the weapon
     carried across the chest, point up and forward). One set serves the katana, the long sword, the hammer and the staff:
     the rear fist sits 5 px toward the pommel, where every one of them has handle (art-src/sets/weapons.mjs). */
  const carried = {};
  for (const name of ['run_start', 'run', 'run_stop', 'jump_up', 'jump_apex', 'fall', 'land', 'land_hard']) {
    const c = BASE[name], u = [Math.cos(-60 * DEG), Math.sin(-60 * DEG)];
    carried[name + '_2h'] = { ...c, frames: c.frames.map((f) => {
      const hip = f.b.hips || {}, lean = (f.b.torso && f.b.torso.r) || 0;
      const gx = (hip.x || 0) + 6 + Math.round(10 * Math.sin(lean * DEG)), gy = (hip.y || 0) - 21 + (name === 'jump_up' ? -2 : 0);
      return { ...f, b: { ...f.b }, ik: { ...f.ik, armF: [gx, gy, 0, -1], armB: [gx + u[0] * -5, gy + u[1] * -5, 0, -1] }, w: -60, two: 1, sep: -5 };
    }) };
  }

  return {
    ...carried,
    /* ================= KATANA — iaido: the point toward the opponent's throat, short exact cuts ================= */
    ready_katana: loop(6, [
      K(8, -19, -30, { hy: 2, lean: 4, hold: 3 }), K(8, -19, -30, { hy: 3, lean: 4, headY: -1, hold: 2 }),
      K(8, -18, -30, { hy: 3, lean: 5, hold: 3 }), K(8, -19, -30, { hy: 2, lean: 5, headY: 1, hold: 2 })]),
    atk1_katana: once(14, [                                                        // kesa-giri: from above the head, down across
      K(0, -38, -120, { lean: -6, head: -6, hold: 2 }),
      K(10, -27, -30, { lean: 12, hx: 2, head: 4, ...WIDE, hold: 2 }),
      K(10, -17, 30, { lean: 18, hx: 3, hy: 2, head: 6, ...WIDE, hold: 2 }),
      K(8, -18, 0, { lean: 8, hy: 2, hold: 2 })]),
    atk2_katana: once(14, [                                                        // kiri-age: from the back hip, rising
      K(3, -15, 150, { lean: 14, hy: 3, head: 6, ...WIDE, hold: 2 }),
      K(11, -21, 0, { lean: 8, hx: 2, hy: 2, ...WIDE, hold: 2 }),
      K(8, -32, -60, { lean: -6, hx: 2, head: -8, ...WIDE, hold: 2 }),
      K(8, -22, -30, { lean: 2, hy: 1, hold: 2 })]),
    atk3_katana: once(14, [                                                        // tsuki: hands drawn to the hip, then one long thrust
      K(0, -19, 0, { lean: -8, hx: -2, head: -4, hold: 3 }),
      K(16, -22, 0, { lean: 22, hx: 5, hy: 2, head: 8, ...LUNGE, hold: 3 }),
      K(15, -22, 0, { lean: 20, hx: 4, hy: 2, head: 6, ...LUNGE, hold: 2 }),
      K(8, -19, -30, { lean: 8, hx: 1, hy: 2, hold: 2 })]),
    charge_katana: loop(5, [                                                       // iai: low, the blade back along the hip as if still sheathed
      K(-2, -15, 150, { hy: 6, lean: 22, head: -10, ...WIDE }), K(-2, -15, 150, { hy: 7, lean: 23, head: -10, ...WIDE })]),
    special_katana: once(14, [                                                     // the draw: one flat cut through everything in front
      K(-2, -15, 150, { hy: 6, lean: 22, head: -10, ...WIDE, hold: 2 }),
      K(13, -22, 0, { hy: 4, lean: 18, hx: 4, head: 4, ...LUNGE, hold: 2 }),
      K(7, -31, -120, { hy: 3, lean: 2, hx: 3, head: -6, ...WIDE, hold: 3 }),
      K(9, -19, 30, { hy: 3, lean: 8, hx: 1, ...WIDE, hold: 3 })]),
    guard_katana: loop(4, [K(7, -23, -90, { hy: 2, lean: 4, head: -4 }), K(7, -22, -90, { hy: 3, lean: 5, head: -4 })]),

    /* ================= CRUSADER SWORD — the long sword of a knight: carried high on the shoulder, wide heavy arcs ================= */
    ready_crusader: loop(5, [
      C(3, -26, -120, { hy: 1, lean: 2, ...WIDE, hold: 3 }), C(3, -26, -120, { hy: 2, lean: 2, headY: -1, ...WIDE, hold: 2 }),
      C(3, -25, -120, { hy: 2, lean: 3, ...WIDE, hold: 3 }), C(3, -26, -120, { hy: 1, lean: 3, headY: 1, ...WIDE, hold: 2 })]),
    atk1_crusader: once(14, [                                                      // the blow from above
      C(1, -35, -120, { lean: -8, head: -6, ...WIDE, hold: 2 }),
      C(11, -26, -30, { lean: 12, hx: 2, head: 4, ...WIDE, hold: 2 }),
      C(10, -15, 60, { lean: 20, hx: 3, hy: 3, head: 8, ...WIDE, hold: 2 }),
      C(7, -17, 30, { lean: 10, hy: 2, ...WIDE, hold: 2 })]),
    atk2_crusader: once(14, [                                                      // the level sweep, from behind the body
      C(-1, -22, 180, { lean: -4, hx: -1, head: -8, ...WIDE, hold: 2 }),
      C(12, -23, 0, { lean: 12, hx: 3, head: 4, ...WIDE, hold: 2 }),
      C(9, -27, -60, { lean: 4, hx: 3, head: -2, ...WIDE, hold: 2 }),
      C(5, -24, -90, { lean: 2, hy: 1, ...WIDE, hold: 2 })]),
    heavy_crusader: once(12, [                                                     // both hands straight up, then everything comes down
      C(1, -34, -90, { lean: -4, hy: 1, head: -8, ...WIDE, hold: 2 }),
      C(0, -37, -120, { lean: -12, head: -14, ...WIDE, hold: 3 }),
      C(11, -22, 0, { lean: 24, hy: 4, hx: 3, head: 12, ...LUNGE, hold: 3 }),
      C(9, -13, 60, { lean: 30, hy: 5, hx: 3, head: 14, ...LUNGE, hold: 3 }),
      C(7, -17, 30, { lean: 10, hy: 2, ...WIDE, hold: 2 })]),
    charge_crusader: loop(5, [                                                     // the sword upright before the face: a vow
      C(6, -24, -90, { hy: 1, lean: 0, head: 4, ...WIDE }), C(6, -25, -90, { hy: 1, lean: 0, head: 4, ...WIDE })]),
    special_crusader: once(12, [                                                   // the vow is thrown forward as a cross of light
      C(5, -31, -90, { lean: -6, head: -8, ...WIDE, hold: 4 }),
      C(12, -21, 30, { lean: 16, hx: 2, hy: 2, head: 4, ...LUNGE, hold: 4 }),
      C(8, -18, 0, { lean: 6, hy: 2, ...WIDE, hold: 2 })]),
    guard_crusader: loop(4, [C(5, -30, 60, { hy: 2, lean: 4, head: -4, ...WIDE }), C(5, -29, 60, { hy: 3, lean: 5, head: -4, ...WIDE })]),

    /* ================= GREAT HAMMER — carried across the body; every blow is the whole weight of the shoulders ================= */
    ready_hammer: loop(5, [                                                        // the head rests on the floor ahead; the visitor leans on the haft
      H(4, -20, 30, { hy: 2, lean: 8, ...WIDE, hold: 3 }), H(4, -20, 30, { hy: 3, lean: 9, headY: -1, ...WIDE, hold: 2 }),
      H(4, -19, 30, { hy: 3, lean: 9, ...WIDE, hold: 3 }), H(4, -20, 30, { hy: 2, lean: 8, headY: 1, ...WIDE, hold: 2 })]),
    atk1_hammer: once(12, [                                                        // the wide swing: from behind the shoulder, round and through
      H(-2, -24, -150, { lean: -10, hx: -1, head: -8, ...WIDE, hold: 3 }),
      H(5, -21, 0, { lean: 16, hx: 3, hy: 2, head: 6, ...WIDE, hold: 2 }),
      H(6, -17, 60, { lean: 24, hx: 3, hy: 4, head: 10, ...LUNGE, hold: 3 }),
      H(0, -17, -30, { lean: 10, hy: 3, ...WIDE, hold: 2 })]),
    heavy_hammer: once(12, [                                                       // up, further up, and into the floor
      H(-1, -26, -90, { lean: -4, hy: 1, head: -8, ...WIDE, hold: 2 }),
      H(-3, -30, -120, { lean: -12, head: -14, ...WIDE, hold: 3 }),
      H(6, -20, 30, { lean: 24, hy: 4, hx: 3, head: 10, ...LUNGE, hold: 2 }),
      H(5, -13, 60, { lean: 36, hy: 7, hx: 3, head: 16, ...LUNGE, hold: 4 }),
      H(0, -16, -30, { lean: 12, hy: 3, ...WIDE, hold: 2 })]),
    charge_hammer: loop(6, [                                                       // held straight up, shaking with the weight
      H(0, -30, -90, { lean: -6, hy: 1, head: -10, ...WIDE }), H(1, -30, -90, { lean: -6, hy: 2, head: -10, ...WIDE })]),
    guard_hammer: loop(4, [H(1, -26, 0, { hy: 2, lean: 2, head: -2, ...WIDE }), H(1, -25, 0, { hy: 3, lean: 3, head: -2, ...WIDE })]),

    /* ================= RUNE STAFF — upright like a walking staff; levelled to cast, struck on the floor for the glyph ================= */
    ready_staff: loop(5, [
      S(5, -19, -90, { lean: 2, hold: 3 }), S(5, -19, -90, { hy: 1, lean: 2, headY: -1, hold: 2 }),
      S(5, -18, -90, { hy: 1, lean: 3, hold: 3 }), S(5, -19, -90, { lean: 3, headY: 1, hold: 2 })]),
    special_staff: once(12, [                                                      // the cast: drawn back, then levelled like a spear
      S(1, -21, -60, { lean: -6, hx: -1, head: -6, hold: 4 }),
      S(4, -24, 0, { lean: 12, hx: 2, head: 4, ...WIDE, hold: 4 }),
      S(4, -21, -60, { lean: 4, hold: 2 })]),
    heavy_staff: once(12, [                                                        // a full turn of the staff before the bolt
      S(1, -22, -120, { lean: -8, hx: -1, head: -8, hold: 2 }),
      S(2, -27, -90, { lean: -10, head: -12, hold: 3 }),
      S(4, -24, 0, { lean: 16, hx: 3, hy: 2, head: 6, ...LUNGE, hold: 3 }),
      S(5, -24, 0, { lean: 14, hx: 3, hy: 2, head: 6, ...LUNGE, hold: 3 }),
      S(4, -21, -60, { lean: 4, hy: 1, hold: 2 })]),
    charge_staff: loop(6, [                                                        // held level over the head while the rune gathers
      S(-4, -36, 0, { lean: -2, head: -10 }), S(-4, -37, 0, { lean: -2, hy: 1, head: -10 })]),
    glyph_staff: once(12, [                                                        // the butt of the staff is driven into the floor
      S(5, -25, -90, { lean: -4, head: -8, hold: 3 }),
      S(6, -15, -90, { lean: 14, hy: 4, head: 10, ...WIDE, hold: 3 }),
      S(6, -15, -90, { lean: 12, hy: 4, head: 8, ...WIDE, hold: 2 }),
      S(5, -19, -90, { lean: 4, hy: 1, hold: 2 })]),
    guard_staff: loop(4, [S(2, -19, -60, { hy: 2, lean: 2, head: -2, ...WIDE }), S(2, -18, -60, { hy: 3, lean: 3, head: -2, ...WIDE })]),

    /* ================= TWIN DAGGERS — never still: low, on the toes, one blade forward and one reversed ================= */
    ready_daggers: loop(8, [
      D([9, -22], [3, -23], -30, 120, { hy: 3, lean: 10, ...WIDE, hold: 2 }), D([9, -21], [3, -22], -30, 120, { hy: 4, lean: 11, ...WIDE, hold: 2 }),
      D([10, -22], [2, -23], -30, 120, { hy: 3, lean: 10, lF: [8, -3, 0], lB: [-7, -3, 20], hold: 2 }), D([9, -23], [3, -24], -30, 120, { hy: 2, lean: 9, ...WIDE, hold: 2 })]),
    atk1_daggers: once(16, [                                                       // the front blade: a short cut
      D([0, -25], [5, -23], -120, 120, { lean: 2, hy: 3, ...WIDE, hold: 2 }),
      D([13, -24], [3, -22], 0, 120, { lean: 16, hx: 2, hy: 3, ...WIDE, hold: 2 }),
      D([11, -18], [3, -22], 60, 120, { lean: 18, hx: 2, hy: 4, ...WIDE, hold: 2 }),
      D([9, -21], [3, -23], -30, 120, { lean: 10, hy: 3, ...WIDE, hold: 2 })]),
    atk2_daggers: once(16, [                                                       // the back blade: a reversed stab over the top
      D([6, -22], [4, -32], -30, 150, { lean: 4, hy: 3, ...WIDE, hold: 2 }),
      D([3, -21], [15, -25], -30, 60, { lean: 20, hx: 3, hy: 3, ...WIDE, hold: 2 }),
      D([3, -21], [14, -21], -30, 90, { lean: 22, hx: 3, hy: 4, ...WIDE, hold: 2 }),
      D([8, -21], [5, -23], -30, 120, { lean: 12, hy: 3, ...WIDE, hold: 2 })]),
    atk3_daggers: once(16, [                                                       // both together, crossing
      D([1, -27], [3, -18], -120, 150, { lean: -2, hy: 3, ...WIDE, hold: 2 }),
      D([13, -22], [13, -25], 30, -30, { lean: 20, hx: 4, hy: 3, ...LUNGE, hold: 2 }),
      D([12, -18], [12, -29], 60, -60, { lean: 22, hx: 4, hy: 4, ...LUNGE, hold: 2 }),
      D([9, -21], [4, -23], -30, 120, { lean: 10, hy: 3, ...WIDE, hold: 2 })]),
    special_daggers: once(16, [                                                    // the flurry: front, back, front, back (the game steps through these per hit)
      D([2, -24], [5, -23], -60, 120, { lean: 8, hy: 4, ...WIDE, hold: 2 }),
      D([14, -24], [4, -22], 0, 120, { lean: 18, hx: 3, hy: 4, ...LUNGE, hold: 1 }),
      D([4, -22], [15, -23], -30, 30, { lean: 20, hx: 3, hy: 4, ...LUNGE, hold: 1 }),
      D([14, -20], [4, -22], 30, 120, { lean: 18, hx: 3, hy: 4, ...LUNGE, hold: 1 }),
      D([4, -22], [15, -26], -30, 0, { lean: 20, hx: 3, hy: 4, ...LUNGE, hold: 1 }),
      D([9, -21], [4, -23], -30, 120, { lean: 10, hy: 3, ...WIDE, hold: 2 })]),
    guard_daggers: loop(4, [D([8, -26], [9, -22], -60, -120, { hy: 3, lean: 6, head: -4, ...WIDE }), D([8, -25], [9, -21], -60, -120, { hy: 4, lean: 7, head: -4, ...WIDE })]),

    /* ================= HAPKIDO GAUNTLETS — open stance, straight lines, the opponent's weight used against him ================= */
    ready_gauntlets: loop(8, [
      D([10, -25], [5, -26], 0, -30, { hy: 2, lean: 6, ...WIDE, hold: 2 }), D([10, -24], [5, -25], 0, -30, { hy: 3, lean: 6, ...WIDE, hold: 2 }),
      D([9, -25], [6, -26], 0, -30, { hy: 2, lean: 7, lF: [8, -3, 0], lB: [-7, -3, 18], hold: 2 }), D([10, -26], [5, -27], 0, -30, { hy: 1, lean: 6, ...WIDE, hold: 2 })]),
    atk3_gauntlets: once(16, [                                                     // the straight punch with the leading hand
      D([3, -25], [6, -26], 0, -30, { lean: 0, hy: 2, ...WIDE, hold: 2 }),
      D([15, -26], [4, -25], 0, -30, { lean: 14, hx: 3, hy: 2, head: 4, ...LUNGE, hold: 2 }),
      D([14, -26], [4, -25], 0, -30, { lean: 12, hx: 3, hy: 2, head: 4, ...LUNGE, hold: 2 }),
      D([10, -25], [5, -26], 0, -30, { lean: 6, hy: 2, ...WIDE, hold: 2 })]),
    atk1_gauntlets: once(16, [                                                     // the cross: the rear hand, with the hip behind it
      D([8, -25], [1, -25], 0, 0, { lean: 2, hy: 2, ...WIDE, hold: 2 }),
      D([4, -26], [17, -25], -30, 0, { lean: 22, hx: 4, hy: 3, head: 6, ...LUNGE, hold: 2 }),
      D([4, -26], [16, -25], -30, 0, { lean: 20, hx: 4, hy: 3, head: 6, ...LUNGE, hold: 2 }),
      D([10, -25], [5, -26], 0, -30, { lean: 6, hy: 2, ...WIDE, hold: 2 })]),
    atk2_gauntlets: once(14, [                                                     // the throw: both hands low, then up and through
      D([8, -16], [6, -18], 30, 30, { lean: 24, hy: 6, head: 8, ...WIDE, hold: 2 }),
      D([14, -24], [11, -20], -30, -30, { lean: 14, hx: 3, hy: 3, ...LUNGE, hold: 2 }),
      D([10, -34], [6, -31], -90, -90, { lean: -8, hx: 2, head: -10, ...WIDE, hold: 3 }),
      D([10, -25], [5, -26], 0, -30, { lean: 4, hy: 2, ...WIDE, hold: 2 })]),
    stance_gauntlets: loop(6, [                                                    // waiting for the blow: weight back, both palms open toward it
      D([11, -27], [8, -21], -90, -90, { lean: -8, hx: -2, hy: 3, head: -4, lF: [8, -3, 0], lB: [-8, -3, 10] }),
      D([11, -26], [8, -20], -90, -90, { lean: -8, hx: -2, hy: 4, head: -4, lF: [8, -3, 0], lB: [-8, -3, 10] })]),
    guard_gauntlets: loop(4, [D([8, -28], [6, -24], -90, -90, { hy: 3, lean: 8, head: 4, ...WIDE }), D([8, -27], [6, -23], -90, -90, { hy: 4, lean: 9, head: 4, ...WIDE })])
  };
}

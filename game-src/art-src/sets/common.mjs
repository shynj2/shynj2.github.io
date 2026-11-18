// COMMON WORLD PROPS & DISTINCT WORLD NPCS — packed into every zone's atlas.
//   Distinct animated pixel-art NPCs + natural 6-frame Meiko-kneeling strips:
//     npc_wanderer / npc_wanderer_kneel  (The Wanderer — Workshop & Forest)
//     npc_keeper   / npc_keeper_kneel    (The Prompt Keeper — Machine Halls)
//     npc_bot      / npc_bot_kneel       (The Broken Automaton — Repository)
//     npc_shade    / npc_shade_kneel     (The Prototypes / Refactors — Repository)
//   Plus the Grand Sovereign Throne (throne_shade), Rune Bridges, Rune Pedestal Switches, Gates & Dojo props.
import { Img, c } from '../../tools/lib/pix.mjs';
import { sigil } from '../../tools/lib/kit.mjs';
import goblin from './goblin.mjs';
import weapons from './weapons.mjs';

export default function common() {
  const S = {};
  const K = c('void1'), V0 = c('void0'), V2 = c('void2');
  const s0 = c('stone0'), s1 = c('stone1'), s2 = c('stone2'), s3 = c('stone3'), s4 = c('stone4');
  const i0 = c('iron0'), i1 = c('iron1'), i2 = c('iron2'), i3 = c('iron3');
  const so0 = c('soot0'), so1 = c('soot1'), so2 = c('soot2'), so3 = c('soot3');
  const b1 = c('bone1'), b2 = c('bone2'), b3 = c('bone3'), b4 = c('bone4');
  const m0 = c('moss0'), m1 = c('moss1'), m2 = c('moss2'), m3 = c('moss3');
  const c0 = c('cold0'), c1 = c('cold1'), c2 = c('cold2'), c3 = c('cold3'), C3E = c('cold3', 'e'), C4E = c('cold4', 'e');
  const g0 = c('gold0'), g1 = c('gold1'), g2 = c('gold2'), G3 = c('gold3', 'e'), G4 = c('gold4', 'e');
  const e1 = c('ember1'), e2 = c('ember2'), E3 = c('ember3', 'e'), E4 = c('ember4', 'e');
  const r0 = c('rune0'), r1 = c('rune1'), R2 = c('rune2', 'e'), R3 = c('rune3', 'e'), R4 = c('rune4', 'e'), R5 = c('rune5', 'e');

  const KEEP = new Set([G3, G4, R3, R4, R5, E4, C3E, C4E]);
  const outline = (im) => {
    const add = [];
    for (let y = 0; y < im.h; y++) for (let x = 0; x < im.w; x++) {
      if (im.get(x, y)) continue;
      let nb = 0, em = false;
      for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) {
        const v = im.get(x + dx, y + dy);
        if (v) { nb++; if (KEEP.has(v)) em = true; }
      }
      if (nb && !em) add.push([x, y]);
    }
    for (const [x, y] of add) im.set(x, y, K);
    return im;
  };

  /* ---- 1. Contact shadow & glint ---- */
  { const t = new Img(12, 3); t.ellipse(5.5, 1, 5.5, 1, V0); S.fx_shadow = t; }
  S.fx_glint = [0, 1, 2, 3].map((f) => {
    const t = new Img(9, 9), r = [1, 3, 4, 2][f], v = f === 2 ? R5 : R4;
    t.line(4 - r, 4, 4 + r, 4, v); t.line(4, 4 - r, 4, 4 + r, v);
    if (f === 1 || f === 2) { t.set(4, 4, G4); t.set(3, 3, R3); t.set(5, 5, R3); }
    return t;
  });

  /* ---- 2. Rune Platforms (16x16 tiles): sleep -> wake (4f) -> solid (2f) ---- */
  {
    const sl = new Img(16, 16);
    for (let x = 1; x < 15; x += 2) { sl.set(x, 1, r1); sl.set(x + 1, 2, r0); }
    sl.set(7, 4, R2); sl.set(8, 4, R2); sl.set(4, 3, r1); sl.set(11, 3, r1);
    S.plat_sleep = sl;

    const stoneDeck = (glow, pulse) => {
      const t = new Img(16, 16);
      t.rect(0, 0, 16, 10, s1);
      t.rect(0, 0, 16, 2, s3); t.line(1, 0, 14, 0, s4);
      t.rect(0, 8, 16, 2, s0); t.line(2, 10, 13, 10, K);
      // Brick joints & beveled rune channel
      t.line(7, 2, 7, 8, s0); t.line(8, 2, 8, 8, s2);
      t.rect(1, 4, 14, 2, r0);
      for (let x = 2; x < 14; x += 3) { t.set(x, 4, glow); t.set(x + 1, 5, pulse); }
      t.set(3, 11, s0); t.set(12, 11, s0);
      return t;
    };
    S.plat_solid = [stoneDeck(R4, R3), stoneDeck(R5, R4)];
    S.plat_wake = [0, 1, 2, 3].map((f) => {
      const t = new Img(16, 16), w = (f + 1) * 2;
      t.rect(8 - w, 1, w * 2, 7 + (f >> 1), f < 2 ? r1 : s1);
      t.rect(8 - w, 0, w * 2, 2, f < 2 ? R4 : s3);
      for (let x = 8 - w; x < 8 + w; x += 2) t.set(x, 4, f < 2 ? R5 : R4);
      return t;
    });
  }

  /* ---- 3. Rune Pedestal Switch (24x38, 5 frames: asleep, pulse, waking, awake A, awake B) ---- */
  S.rune_switch = [0, 1, 2, 3, 4].map((f) => {
    const t = new Img(24, 38), on = f >= 3, mid = f === 2;
    // Stepped carved stone plinth
    t.rect(2, 34, 20, 4, s0); t.rect(2, 34, 20, 1, s2);
    t.rect(4, 30, 16, 4, s1); t.rect(4, 30, 16, 1, s3);
    // Fluted obelisk shaft with gilded collar
    t.poly([[6, 30], [7, 13], [17, 13], [18, 30]], s1);
    t.line(7, 14, 6, 29, s3); t.line(17, 14, 18, 29, s0);
    t.rect(6, 13, 12, 2, g1); t.line(6, 13, 17, 13, G3);
    // Levitating Rune Crystal above the obelisk!
    const bob = (f === 4 || f === 1) ? -1 : 0;
    const cy = 6 + bob;
    t.poly([[12, cy - 5], [17, cy], [12, cy + 5], [7, cy]], on ? R3 : mid ? R2 : r1);
    t.poly([[12, cy - 3], [15, cy], [12, cy + 3], [9, cy]], on ? R4 : mid ? R3 : (f === 1 ? R2 : r1));
    if (on || mid) { t.rect(11, cy - 1, 2, 2, R5); t.set(12, cy - 5, G4); }
    // Inscribed sigil on the shaft
    const gv = on ? (f === 4 ? R5 : R4) : mid ? R3 : f === 1 ? R2 : s0;
    sigil(t, ';', 10, 19, gv);
    if (on) { t.set(5, 8, G4); t.set(19, 7, R5); }
    return outline(t);
  });

  /* ---- 4. Ornate Zone Gate Archway (40x56, 4 frames) ---- */
  S.gate = [0, 1, 2, 3].map((f) => {
    const t = new Img(40, 56);
    // Twin carved stone pillars with capitals
    for (const px of [3, 31]) {
      t.rect(px, 16, 6, 40, s1); t.line(px, 16, px, 55, s3); t.line(px + 5, 16, px + 5, 55, s0);
      t.rect(px - 1, 14, 8, 3, g1); t.line(px - 1, 14, px + 6, 14, G3);
      t.rect(px - 1, 52, 8, 4, s2);
    }
    // Gothic pointed arch with keystone rune
    t.ring(20, 18, 12, 17, s2, Math.PI, Math.PI * 2);
    t.ring(20, 18, 15, 17, s3, Math.PI, Math.PI * 2);
    t.rect(18, 0, 4, 5, g2); t.set(19, 2, (f & 1) ? R5 : R4); t.set(20, 2, G4);
    // Shimmering portal veil inside the arch
    t.ellipse(20, 34, 11, 20, V0);
    t.rect(9, 34, 22, 22, V0);
    for (let y = 16; y < 54; y += 3) {
      const wave = Math.round(Math.sin(y * 0.25 + f * 1.57) * 4);
      t.set(20 + wave, y, (y + f) % 2 ? R3 : R2);
      if ((y + f * 2) % 9 === 0) t.set(20 - wave, y, G3);
    }
    return outline(t);
  });

  /* ---- 5. GRAND SOVEREIGN THRONE OF THE ROOT CODE (96x120) ---- */
  {
    const t = new Img(96, 120), cx = 48;
    // Three-step royal stone & gold dais
    t.rect(2, 112, 92, 8, s1); t.rect(2, 112, 92, 2, s3); t.line(4, 112, 91, 112, G3);
    t.rect(10, 105, 76, 7, s1); t.rect(10, 105, 76, 2, s3); t.line(12, 105, 83, 105, g2);
    t.rect(18, 99, 60, 6, s2); t.rect(18, 99, 60, 1, G3);
    // Royal crimson-violet carpet runner down the dais steps
    t.poly([[36, 99], [60, 99], [66, 119], [30, 119]], r1);
    t.line(36, 99, 30, 119, G3); t.line(60, 99, 66, 119, G3);
    // Towering Gothic Spire Backrest & Side Buttresses
    t.poly([[26, 99], [24, 34], [34, 14], [cx, 2], [62, 14], [72, 34], [70, 99]], i0);
    t.poly([[29, 99], [28, 36], [36, 18], [cx, 7], [60, 18], [68, 36], [67, 99]], V2);
    // Gilded gothic tracery ribs & flanking spires
    t.line(24, 34, cx, 2, g2); t.line(cx, 2, 72, 34, g1);
    t.line(25, 34, cx, 3, G3);
    for (const sx of [22, 74]) {
      t.rect(sx - 2, 28, 5, 71, i1); t.line(sx - 2, 28, sx - 2, 98, i3);
      t.poly([[sx - 3, 28], [sx, 14], [sx + 3, 28]], g2); t.line(sx, 14, sx, 28, G3);
      t.set(sx, 13, G4);
    }
    // Glowing Root-Key Rose Emblem carved into the upper spire
    t.ring(cx, 28, 9, 12, g2); t.ring(cx, 28, 10, 11, G3);
    t.poly([[cx, 21], [cx + 5, 28], [cx, 35], [cx - 5, 28]], R3);
    t.poly([[cx, 24], [cx + 3, 28], [cx, 32], [cx - 3, 28]], R4);
    t.rect(cx - 1, 27, 3, 3, R5);
    t.line(cx, 38, cx, 66, R3); t.set(cx, 44, R5); t.set(cx, 52, R4); t.set(cx, 60, R5);
    // Plush velvet throne cushion & horned armrests
    t.rect(31, 66, 34, 22, r0); t.rect(33, 68, 30, 18, r1);
    t.line(33, 68, 62, 68, R3);
    t.rect(20, 74, 12, 25, i1); t.rect(64, 74, 12, 25, i1);
    t.rect(18, 71, 15, 4, g2); t.line(18, 71, 32, 71, G3); t.set(20, 73, R4);
    t.rect(63, 71, 15, 4, g2); t.line(63, 71, 77, 71, G3); t.set(75, 73, R4);
    t.rect(28, 84, 40, 15, i0); t.rect(28, 84, 40, 2, G3);
    S.throne_shade = outline(t);
  }

  /* ==========================================================================
     DISTINCT ANIMATED WORLD NPCS + NATURAL 6-FRAME MEIKO-KNEELING STRIPS
     Authored facing RIGHT (+X), size 32x48 (feet at y=47).
     ========================================================================== */

  // A · THE WANDERER (npc_wanderer 4f, npc_wanderer_kneel 6f): wide traveler's hat, mossy cloak, pack & warm lantern staff
  const drawWandererPose = (f, kneelLv = 0, bowed = false) => {
    const t = new Img(32, 48);
    const drop = [0, 2, 5, 8][kneelLv]; // 0=stand, 1=step, 2=lowering, 3=on one knee
    const bob = kneelLv === 0 ? (f === 1 || f === 2 ? -1 : 0) : 0;
    const hy = 11 + drop + bob + (bowed ? 1 : 0);

    // Bedroll backpack behind shoulders
    t.rect(7, hy + 7, 6, 13, so1); t.rect(7, hy + 7, 6, 2, so3); t.line(9, hy + 7, 9, hy + 19, g1);

    // Boots & kneeling legs
    if (kneelLv < 2) {
      t.rect(12, 40, 4, 7, so1); t.rect(17, 40, 4, 7, so0);
      t.rect(12, 45, 5, 3, i0); t.rect(17, 45, 6, 3, i0); t.set(21, 46, i2);
    } else {
      // Back shin horizontal on ground + front knee bent forward!
      t.rect(6, 43, 10, 4, m0); t.rect(4, 42, 3, 6, i0);         // trailing foot & horizontal shin
      t.rect(16, 38, 5, 9, m1); t.rect(16, 45, 7, 3, i0);        // bent front leg & planted boot
    }

    // Layered forest-moss & ochre traveler's cloak
    const cloakBot = kneelLv >= 2 ? 43 : 41;
    t.poly([[10, hy + 6], [21, hy + 6], [23, cloakBot], [9, cloakBot]], m1);
    t.poly([[14, hy + 6], [21, hy + 6], [22, cloakBot], [14, cloakBot]], m2);
    t.line(15, hy + 7, 15, cloakBot - 1, so2);                   // cloak clasp seam
    t.rect(10, cloakBot - 1, 13, 2, g1);                         // gold-stitched hem
    t.rect(11, hy + 6, 10, 3, so2); t.set(16, hy + 7, G3);       // leather shoulder mantle & clasp

    // Face & scarf under wide-brimmed wizard/traveler hat
    t.rect(13, hy + 1, 6, 5, b2); t.rect(15, hy + 1, 4, 4, b3);
    t.set(17, hy + 3, bowed ? so1 : K);                          // eye (closed respectfully when bowed)
    t.rect(12, hy + 5, 8, 2, e2); t.set(18, hy + 5, E3);         // warm red scarf
    // Pointed wide-brimmed hat
    const brimY = hy + (bowed ? 1 : 0);
    t.poly([[10, brimY], [15, brimY - 8], [19, brimY - 9], [20, brimY]], so1);
    t.line(15, brimY - 8, 19, brimY, so2);
    t.rect(11, brimY - 2, 9, 1, G3);                             // hatband
    t.rect(7, brimY, 17, 2, so2); t.line(8, brimY, 23, brimY, so3);

    // Wooden lantern staff held in front hand + warm swinging lantern!
    const sx = 24;
    t.rect(sx, 14 + (kneelLv >= 2 ? 3 : 0), 2, 33 - (kneelLv >= 2 ? 3 : 0), so2);
    t.line(sx + 1, 14 + (kneelLv >= 2 ? 3 : 0), sx + 1, 46, so3);
    t.rect(sx - 1, 13 + (kneelLv >= 2 ? 3 : 0), 5, 2, so3);
    const lx = sx + 2 + (kneelLv === 0 && f === 2 ? 1 : 0), ly = 16 + (kneelLv >= 2 ? 3 : 0);
    t.rect(lx - 2, ly, 5, 7, g1); t.rect(lx - 1, ly + 1, 3, 5, G3);
    t.rect(lx, ly + 2, 2, 3, (f & 1) ? G4 : E4);                 // glowing lantern flame!
    t.rect(19, hy + 11, 6, 3, m2); t.rect(23, hy + 11, 2, 2, b3); // arm gripping staff
    return outline(t);
  };
  S.npc_wanderer = [0, 1, 2, 3].map((f) => drawWandererPose(f, 0, false));
  S.npc_wanderer_kneel = [
    drawWandererPose(0, 1, false),
    drawWandererPose(1, 2, false),
    drawWandererPose(2, 3, false),
    drawWandererPose(0, 3, true),
    drawWandererPose(1, 3, true),
    drawWandererPose(2, 3, false), // talking while kneeling: looks up warmly
  ];

  // B · THE PROMPT KEEPER (npc_keeper 4f, npc_keeper_kneel 6f): Machine Halls sage with floating twin rune-candles!
  const drawKeeperPose = (f, kneelLv = 0, bowed = false) => {
    const t = new Img(32, 48);
    const drop = [0, 2, 6, 9][kneelLv];
    const bob = kneelLv === 0 ? (f === 1 || f === 2 ? -1 : 0) : 0;
    const hy = 10 + drop + bob + (bowed ? 1 : 0);

    // Robed body & kneeling train
    if (kneelLv >= 2) {
      t.poly([[5, 43], [16, 38], [23, 46], [5, 47]], c0);        // pooled midnight-blue robe train
      t.line(5, 46, 22, 46, G3);
    }
    t.poly([[11, hy + 7], [21, hy + 7], [24, 46], [9, 46]], c1);
    t.poly([[15, hy + 7], [21, hy + 7], [23, 46], [15, 46]], c2);
    // Silver-cyan prompt stole & glowing rune thread
    t.line(16, hy + 8, 16, 44, C3E);
    for (let y = hy + 10; y < 44; y += 5) t.set(16, y, (y + f) % 2 ? C4E : R5);
    t.rect(10, 45, 14, 2, g2); t.line(11, 45, 22, 45, G3);
    t.rect(12, hy + 16, 9, 2, G3);

    // Deep midnight cowl with glowing cyan eyes & silver circlet
    t.poly([[11, hy + 7], [11, hy], [16, hy - 3], [21, hy], [21, hy + 7]], c1);
    t.line(16, hy - 3, 21, hy, c3);
    t.rect(14, hy + 1, 6, 5, V0);
    if (!bowed) { t.set(16, hy + 3, C4E); t.set(19, hy + 3, C4E); }
    else { t.line(16, hy + 4, 19, hy + 4, c3); }
    t.line(12, hy, 20, hy, G3);

    // Hands holding a sacred wax candle in front + TWO levitating rune-candles!
    t.rect(18, hy + 11, 5, 3, c2); t.rect(22, hy + 11, 2, 2, b3);
    t.rect(23, hy + 7, 2, 5, b4); t.set(23, hy + 5, G4); t.set(24, hy + 6, G3);
    for (const [cx, ph] of [[6, 0], [27, 2]]) {
      const cy = hy + 3 + (((f + ph) & 2) ? -1 : 1);
      t.rect(cx, cy, 2, 5, b3); t.set(cx, cy, b4);
      t.set(cx, cy - 2, C4E); t.set(cx + 1, cy - 1, R4);        // cyan-violet machine flame!
    }
    return outline(t);
  };
  S.npc_keeper = [0, 1, 2, 3].map((f) => drawKeeperPose(f, 0, false));
  S.npc_keeper_kneel = [
    drawKeeperPose(0, 1, false),
    drawKeeperPose(1, 2, false),
    drawKeeperPose(2, 3, false),
    drawKeeperPose(0, 3, true),
    drawKeeperPose(1, 3, true),
    drawKeeperPose(2, 3, false),
  ];

  // C · THE BROKEN AUTOMATON (npc_bot 4f, npc_bot_kneel 6f): Repository brass-and-iron clockwork bot with CRT visor!
  const drawBotPose = (f, kneelLv = 0, bowed = false) => {
    const t = new Img(32, 48);
    const drop = [0, 2, 5, 8][kneelLv];
    const bob = kneelLv === 0 ? (f & 1) : 0;
    const hy = 11 + drop + bob;

    // Piston legs (or one-knee servo bow!)
    if (kneelLv < 2) {
      t.rect(12, 37, 3, 9, i1); t.rect(18, 37, 3, 9, i2);
      t.set(13, 40, g2); t.set(19, 40, G3);
      t.rect(11, 45, 5, 3, i0); t.rect(17, 45, 6, 3, i1); t.line(18, 45, 22, 45, i3);
    } else {
      t.rect(6, 43, 9, 3, i1); t.rect(5, 42, 3, 5, i0);          // rear piston leg folded back
      t.rect(17, 39, 4, 7, i2); t.rect(17, 45, 6, 3, i1);        // front knee servo planted
      t.set(18, 40, G3);
    }

    // Riveted iron-and-brass chassis with clockwork heart gear
    t.rect(10, hy + 10, 13, 15, i1);
    t.rect(10, hy + 10, 13, 2, i3); t.rect(10, hy + 23, 13, 2, g1);
    t.rect(12, hy + 13, 9, 8, V0);
    // Spinning golden gear + violet core inside chest window
    t.ring(16, hy + 17, 2, 3.2, (f & 1) ? G3 : g2);
    t.set(16, hy + 17, (f & 1) ? R5 : R4);
    // Articulated claw arm + trailing copper wire
    t.rect(8, hy + 11, 2, 10, g1);
    t.line(22, hy + 12, 25, hy + 18 + (bowed ? 2 : 0), i2, 2);
    t.rect(24, hy + 19 + (bowed ? 2 : 0), 3, 3, G3);

    // Curved CRT Monitor Head + brass antenna!
    const tilt = bowed ? 1 : 0;
    t.line(15, hy - 4, 15, hy, i2); t.set(15, hy - 5, (f & 1) ? R5 : G4);
    t.rect(10, hy + tilt, 13, 9, i2);
    t.rect(10, hy + tilt, 13, 1, i3); t.rect(10, hy + 8 + tilt, 13, 1, g1);
    t.rect(12, hy + 2 + tilt, 9, 5, V0);
    if (bowed) {
      // Happy pixel-bow eyes (^ ^) on CRT screen!
      t.set(14, hy + 4 + tilt, R5); t.set(15, hy + 3 + tilt, R5);
      t.set(18, hy + 3 + tilt, R5); t.set(19, hy + 4 + tilt, R5);
    } else {
      t.rect(14, hy + 3, 2, 2, R5); t.rect(18, hy + 3, 2, 2, (f === 3) ? R3 : R5);
      t.line(15, hy + 6, 18, hy + 6, R3);
    }
    return outline(t);
  };
  S.npc_bot = [0, 1, 2, 3].map((f) => drawBotPose(f, 0, false));
  S.npc_bot_kneel = [
    drawBotPose(0, 1, false),
    drawBotPose(1, 2, false),
    drawBotPose(2, 3, false),
    drawBotPose(0, 3, true),
    drawBotPose(1, 3, true),
    drawBotPose(2, 3, false),
  ];

  // D · THE ARCHIVE SHROUDS — PROTOTYPE & REFACTOR (npc_shade 4f, npc_shade_kneel 6f)
  const drawShadePose = (f, kneelLv = 0, bowed = false) => {
    const t = new Img(30, 46);
    const drop = [0, 2, 5, 8][kneelLv];
    const bob = kneelLv === 0 ? (f === 1 || f === 2 ? -1 : 0) : 0;
    const hy = 9 + drop + bob + (bowed ? 1 : 0);

    if (kneelLv >= 2) {
      t.poly([[4, 41], [15, 36], [22, 44], [4, 45]], V2);
      t.line(5, 44, 21, 44, r1);
    }
    // Layered tattered archive shroud with stitched glowing rune-seams
    t.poly([[10, hy + 6], [20, hy + 6], [23, 44], [8, 44]], V2);
    t.poly([[14, hy + 6], [20, hy + 6], [22, 44], [14, 44]], s0);
    t.line(20, hy + 7, 22, 43, s1);
    for (let y = hy + 9; y < 42; y += 4) {
      t.set(15 + ((y >> 2) & 1), y, (y + f) % 3 === 0 ? R4 : R2);
    }
    // Tattered hem notches & floating parchment scrap
    t.set(11, 44, 0); t.set(17, 44, 0);
    const py = hy + 14 + ((f & 1) ? -1 : 1);
    t.rect(24, py, 3, 4, b2); t.set(25, py + 1, R3);

    // Sculpted pointed archive hood & luminous rune eyes
    t.poly([[10, hy + 6], [10, hy], [15, hy - 4], [20, hy], [20, hy + 6]], s0);
    t.line(15, hy - 4, 20, hy, s2);
    t.rect(13, hy + 1, 6, 5, V0);
    if (!bowed) {
      t.set(15, hy + 3, R4); t.set(18, hy + 3, R5);
    } else {
      t.set(15, hy + 4, R3); t.set(18, hy + 4, R3);
    }
    return outline(t);
  };
  S.npc_shade = [0, 1, 2, 3].map((f) => drawShadePose(f, 0, false));
  S.npc_shade_kneel = [
    drawShadePose(0, 1, false),
    drawShadePose(1, 2, false),
    drawShadePose(2, 3, false),
    drawShadePose(0, 3, true),
    drawShadePose(1, 3, true),
    drawShadePose(2, 3, false),
  ];

  /* ---- 6. DOJO PROPS: Ornate Katana/Polearm Rack & Armored Training Dummy ---- */
  {
    const r = new Img(42, 38);
    // Lacquered darkwood rack posts & stepped base
    r.rect(3, 34, 9, 4, so1); r.rect(3, 34, 9, 1, so3);
    r.rect(30, 34, 9, 4, so1); r.rect(30, 34, 9, 1, so3);
    r.rect(6, 4, 3, 31, so1); r.line(6, 4, 6, 34, so3); r.set(7, 3, G3);
    r.rect(33, 4, 3, 31, so1); r.line(33, 4, 33, 34, so3); r.set(34, 3, G3);
    r.rect(4, 9, 34, 2, so2); r.rect(4, 25, 34, 2, so2);
    // Three resting blades horizontally racked: Katana, Wakizashi, and Golden Spear!
    r.rect(8, 7, 6, 2, E3); r.rect(14, 6, 2, 4, G3); r.line(16, 7, 36, 6, b4); r.line(16, 8, 35, 7, i2);
    r.rect(9, 15, 5, 2, c2); r.rect(14, 14, 2, 4, g2); r.line(16, 15, 32, 15, b3); r.line(16, 16, 31, 16, i2);
    r.line(5, 23, 33, 23, so3); r.poly([[33, 21], [39, 23], [33, 25]], b4); r.set(32, 23, E3);
    S.dojo_rack = outline(r);

    const dummy = (tilt) => {
      const d = new Img(28, 50), s = tilt;
      d.rect(7, 46, 14, 4, so1); d.rect(7, 46, 14, 1, so3);
      d.rect(12, 28, 4, 19, so1); d.line(12, 28, 12, 46, so3);
      // Crossbar arms with bound striking pads
      d.rect(2 + s, 16, 24, 3, so2); d.line(2 + s, 16, 25 + s, 16, so3);
      d.rect(3 + s, 15, 4, 5, e2); d.rect(21 + s, 15, 4, 5, e2);
      // Woven straw torso armored with lacquered crimson chest-band & rune target
      d.rect(8 + s, 11, 12, 19, g1); d.line(8 + s, 11, 8 + s, 29, G3); d.line(19 + s, 11, 19 + s, 29, g0);
      for (let y = 13; y < 29; y += 3) d.line(8 + s, y, 19 + s, y, so2);
      d.rect(8 + s, 17, 12, 5, e1); d.line(8 + s, 17, 19 + s, 17, E3);
      d.ring(14 + s, 19, 1, 2.2, R4);
      // Straw head with headband
      d.ellipse(14 + s, 6, 4.5, 4.5, g2); d.ellipse(13 + s, 5, 3, 3, G3);
      d.rect(10 + s, 4, 9, 2, b4); d.set(19 + s, 5, E3); d.set(20 + s, 6, e2);
      return outline(d);
    };
    S.dojo_dummy = [dummy(0), dummy(2)];
  }

  // Workshop Challenge Notice-Board (`signboard`, 28x38) — Words appear via 53-sign.js!
  {
    const sb = new Img(28, 38);
    // Twin iron-shod cedar posts
    sb.rect(5, 22, 3, 16, g0); sb.line(5, 22, 5, 37, g2); sb.rect(4, 35, 5, 3, i1);
    sb.rect(20, 22, 3, 16, g0); sb.line(20, 22, 20, 37, g2); sb.rect(19, 35, 5, 3, i1);
    // Pitched shingle roof cap over the notice board
    sb.poly([[1, 6], [14, 1], [27, 6], [27, 9], [1, 9]], g1);
    sb.line(1, 6, 14, 1, g2); sb.line(14, 1, 26, 6, g2);
    // Framed cedar notice-board + pinned parchment scroll & glowing seal
    sb.rect(2, 8, 24, 16, g0); sb.rect(3, 9, 22, 14, g1);
    sb.rect(5, 10, 18, 12, b3); sb.rect(6, 11, 16, 9, b4);
    for (const y of [13, 15, 17]) sb.line(8, y, 19 - (y === 17 ? 3 : 0), y, K);
    sb.rect(19, 18, 2, 2, E3); // glowing crimson wax challenge seal!
    S.signboard = outline(sb);
  }

  // Puzzle Rune Bridge Tile (`plat_rune`, 3 frames: [asleep, lit0, lit1])
  S.plat_rune = [S.plat_sleep, S.plat_solid[0], S.plat_solid[1]];

  // Shyn's Outstretched Sovereign Arm (`shyn_offer_arm`, 14x8) when offering his hand to Meiko
  {
    const arm = new Img(14, 8);
    arm.rect(1, 2, 8, 4, r1); arm.line(1, 2, 8, 2, g2); // royal violet sleeve + gold cuff
    arm.rect(7, 2, 2, 4, G3);
    arm.rect(9, 3, 4, 3, b3); arm.line(9, 2, 12, 2, b4); // open gloved palm offered upward
    S.shyn_offer_arm = outline(arm);
  }

  Object.assign(S, goblin(), weapons());
  return S;
}

// HALLS OF THE MACHINE MIND — sets. The zone about prompt engineering and AI engineering:
// a thinking core, lattices of nodes on the walls, falling streams of glyphs, consoles that wait for a sentence.
// Stone, pipes, doors and gears come from the Workshop kit (the zone LUT turns them cold).
import { Img, c, hash2, text } from '../../../tools/lib/pix.mjs';
import { sigil } from '../../../tools/lib/kit.mjs';
import workshop from '../workshop/sets.mjs';

export default function sets() {
  const w = workshop(), S = {}, cuts = {};
  for (const k of ['door_frame', 'door_leaf', 'door_dark', 'note_tablet', 'note_stele', 'walltext', 'brazier', 'flame', 'hearth', 'runefire', 'statue_gear', 'statue_anvil',
    'pillar', 'pipe_h', 'pipe_v', 'gear_s', 'gear_m', 'gear_l', 'chain_long', 'chain_short', 'cagelamp', 'fg_pillar', 'fg_chain', 'crate', 'crate_s']) S[k] = w.sprites[k];
  const V0 = c('void0'), V1 = c('void1'), V2 = c('void2'), i0 = c('iron0'), i1 = c('iron1'), i2 = c('iron2'), i3 = c('iron3');
  const st0 = c('stone0'), st1 = c('stone1'), st2 = c('stone2'), st3 = c('stone3');
  const C1 = c('cold1', 'e'), C2 = c('cold2', 'e'), C3 = c('cold3', 'e'), C4 = c('cold4', 'e'), R2 = c('rune2', 'e'), R4 = c('rune4', 'e'), R5 = c('rune5', 'e');
  const c0 = c('cold0'), c1 = c('cold1');

  /* ---- THE CORE: the machine mind itself. Rings of nodes around an iris; signals run inward. 8 frames. ---- */
  S.core = Array.from({ length: 8 }, (_, f) => {
    const N = 152, t = new Img(N, N), m = N / 2;
    t.ellipse(m, m, 74, 74, i0); t.ellipse(m, m, 70, 70, V1); t.ring(m, m, 70, 74, i1); t.ring(m, m, 73, 74, i3, Math.PI * .9, Math.PI * 1.6);
    for (let k = 0; k < 24; k++) { const a = k * Math.PI / 12; t.rect(m + Math.cos(a) * 72 - 1, m + Math.sin(a) * 72 - 1, 2, 2, k % 3 ? i2 : i3); }
    const rings = [[60, 16], [44, 12], [28, 8]], pts = [];
    rings.forEach(([r, n], ri) => { for (let k = 0; k < n; k++) { const a = (k + (ri % 2) * .5) * Math.PI * 2 / n; pts.push([m + Math.cos(a) * r, m + Math.sin(a) * r, ri, k]); } });
    for (const p of pts) for (const q of pts) if (q[2] === p[2] + 1 && Math.hypot(p[0] - q[0], p[1] - q[1]) < 26) {            // edges between neighbouring rings
      t.line(p[0], p[1], q[0], q[1], c1);
      const ph = (f + p[3] * 3 + q[3]) % 8, u = ph / 8; if (ph < 6) t.set(p[0] + (q[0] - p[0]) * u, p[1] + (q[1] - p[1]) * u, C4);   // a signal travelling inward
    }
    for (const p of pts) { const on = (p[3] * 5 + p[2] * 3 + f) % 8 < 3; t.rect(p[0] - 1, p[1] - 1, 3, 3, on ? C3 : c1); t.set(p[0], p[1], on ? C4 : C2); }
    t.ring(m, m, 14, 17, i2); t.ellipse(m, m, 13, 13, V0); t.ring(m, m, 8, 11, R2); t.ring(m, m, 9, 10, R4);
    const a = f * Math.PI / 4; t.ellipse(m + Math.cos(a) * 2, m + Math.sin(a) * 2, 4, 4, R4); t.ellipse(m + Math.cos(a) * 2, m + Math.sin(a) * 2, 2, 2, R5);   // the iris wanders
    return t;
  });

  /* ---- wall lattice: a layer diagram, nodes firing in turn. 4 frames. ---- */
  S.lattice = Array.from({ length: 4 }, (_, f) => {
    const t = new Img(96, 64); t.rect(0, 0, 96, 64, V1); t.rect(0, 0, 96, 1, i1); t.rect(0, 63, 96, 1, V0); t.rect(0, 0, 1, 64, i1); t.rect(95, 0, 1, 64, V0);
    const cols = [3, 5, 5, 3, 1], P = cols.map((n, ci) => Array.from({ length: n }, (_, k) => [12 + ci * 18, 32 + (k - (n - 1) / 2) * 11]));
    for (let ci = 0; ci < 4; ci++) for (const p of P[ci]) for (const q of P[ci + 1]) t.line(p[0], p[1], q[0], q[1], (Math.round(p[1] + q[1]) + ci) % 3 ? c0 : c1);
    P.forEach((col, ci) => col.forEach((p, k) => { const on = (ci + f) % 4 === 0 || (k + ci * 2 + f) % 5 === 0; t.rect(p[0] - 1, p[1] - 1, 3, 3, on ? C3 : c1); if (on) t.set(p[0], p[1], C4); }));
    [[2, 2], [92, 2], [2, 60], [92, 60]].forEach(([x, y]) => { t.rect(x, y, 2, 2, i2); });
    return t;
  });

  /* ---- a stream of glyphs falling down a slot in the wall. 8 frames. ---- */
  S.stream = Array.from({ length: 8 }, (_, f) => {
    const t = new Img(9, 120); t.rect(0, 0, 9, 120, V0); t.rect(0, 0, 1, 120, i0); t.rect(8, 0, 1, 120, i0);
    const G = ['{', '}', ';', '<', '>', '/', '='];
    for (let k = 0; k < 14; k++) { const y = ((k * 9 + f * 3) % 126) - 6, head = (k + f) % 5 === 0; sigil(t, G[(k * 3 + ((f / 4) | 0)) % G.length], 2, y, head ? C4 : k % 2 ? C2 : C1); }
    t.rect(0, 0, 9, 2, i1); t.rect(0, 118, 9, 2, i1);
    return t;
  });

  /* ---- console: a lectern with a screen; the cursor blinks, a line types itself. 6 frames. ---- */
  S.console = Array.from({ length: 6 }, (_, f) => {
    const t = new Img(34, 40);
    t.rect(13, 22, 8, 16, st1); t.rect(13, 22, 2, 16, st2); t.rect(19, 22, 2, 16, st0); t.rect(8, 36, 18, 4, st1); t.rect(8, 36, 18, 1, st3);
    t.rect(1, 2, 32, 21, i0); t.rect(1, 2, 32, 1, i2); t.rect(1, 2, 1, 21, i2); t.rect(32, 2, 1, 21, V0); t.rect(3, 4, 28, 17, V0);
    t.set(5, 7, C3); t.set(6, 8, C3); t.set(5, 9, C3);                                                                           // the prompt mark
    t.rect(9, 8, Math.min(18, 3 + f * 3), 1, C2); if (f > 2) t.rect(5, 12, 6 + (f - 2) * 4, 1, C1); if (f > 3) t.rect(5, 15, 12, 1, C1);
    if (f % 2) t.rect(Math.min(27, 12 + f * 3), 7, 2, 3, C4);
    t.rect(4, 0, 2, 2, i1); t.rect(28, 0, 2, 2, i1);
    return t;
  });

  /* ---- THE PROMPT SLAB: the lesson of this zone, carved where the puzzle begins ---- */
  {
    const t = new Img(132, 76);
    t.rect(0, 0, 132, 76, st1); t.rect(0, 0, 132, 2, st3); t.rect(0, 0, 2, 76, st2); t.rect(130, 0, 2, 76, st0); t.rect(0, 74, 132, 2, V1); t.rect(4, 4, 124, 68, st0); t.rect(4, 4, 124, 1, V1); t.rect(4, 4, 1, 68, V1);
    const rows = [['1', 'ROLE', 'WHO IT MUST BE'], ['2', 'CONTEXT', 'WHAT IT MUST KNOW'], ['3', 'TASK', 'WHAT IT MUST DO']];
    const big = (str, x, y, v) => { const tmp = new Img(str.length * 4, 5); text(tmp, str, 0, 0, 1); for (let j = 0; j < 5; j++) for (let i = 0; i < tmp.w; i++) if (tmp.get(i, j)) t.rect(x + i * 2, y + j * 2, 2, 2, v); };
    rows.forEach(([n, a, b], i) => { const y = 9 + i * 21; big(n, 10, y, R4); big(a, 24, y, C4); text(t, b, 24, y + 12, C2); if (i < 2) t.rect(9, y + 19, 114, 1, V1); });
    S.prompt_slab = t;
  }

  /* ---- conduit with pulses of light. 6 frames. ---- */
  S.conduit = Array.from({ length: 6 }, (_, f) => { const t = new Img(96, 8); t.rect(0, 1, 96, 6, i0); t.rect(0, 1, 96, 1, i2); t.rect(0, 6, 96, 1, V0); t.rect(0, 3, 96, 2, V1); for (let x = 0; x < 96; x += 24) { t.rect(x, 0, 3, 8, i1); t.rect(x, 0, 1, 8, i3); } for (let k = 0; k < 4; k++) { const x = (k * 24 + f * 4) % 96; t.rect(x, 3, 3, 2, C3); t.set(x + 3, 3, C4); t.set(x + 3, 4, C4); } return t; });

  /* ---- cold lamp: a crystal held in an iron claw ---- */
  {
    const t = new Img(18, 44);
    t.rect(8, 16, 2, 26, i1); t.rect(8, 16, 1, 26, i3); t.rect(4, 41, 10, 3, i0); t.rect(4, 41, 10, 1, i2);
    t.poly([[9, 0], [14, 7], [9, 16], [4, 7]], C2); t.poly([[9, 2], [12, 7], [9, 13], [6, 7]], C3); t.line(9, 3, 7, 7, C4); t.set(9, 7, C4);
    t.set(3, 12, i2); t.set(4, 13, i2); t.set(5, 14, i1); t.set(14, 12, i1); t.set(13, 13, i1); t.set(12, 14, i0);
    S.lamp_blue = t;
  }

  /* ---- Machine Halls Monument: Neural Pressure Valve Statue (40x68) ---- */
  {
    const t = new Img(40, 68);
    // Basalt plinth
    t.rect(2, 62, 36, 6, st1); t.rect(2, 62, 36, 1, st3);
    t.rect(6, 48, 28, 14, st0); t.rect(6, 48, 28, 1, st2);
    sigil(t, '=', 18, 52, C3);
    // Twin vertical iron pressure pipes & central manifold chamber
    t.rect(10, 16, 5, 32, i1); t.line(11, 16, 11, 47, i3);
    t.rect(25, 16, 5, 32, i0); t.line(26, 16, 26, 47, i2);
    t.rect(13, 22, 14, 20, i1); t.rect(13, 22, 14, 2, i3);
    // Spoked Wheel Valve + Glowing Cyan Pressure Gauge!
    t.ring(20, 14, 8, 11, i2); t.ring(20, 14, 9, 10, i3);
    t.line(20, 4, 20, 24, i2); t.line(10, 14, 30, 14, i2);
    t.ellipse(20, 14, 4.5, 4.5, V0);
    t.ring(20, 14, 3, 4.2, C3);
    t.line(20, 14, 23, 11, C4); t.set(20, 14, R5);
    t.rect(17, 30, 6, 6, V0); t.rect(18, 31, 4, 4, C3); t.set(19, 32, C4);
    S.statue_valve = t.outline(V1);
  }

  S.fg_cable = (() => { const t = new Img(180, 70); for (let k = 0; k < 3; k++) for (let x = 0; x < 180; x++) { const y = 6 + k * 8 + Math.sin(x / 180 * Math.PI) * (34 + k * 6); t.rect(x, y, 1, 3, V0); } return t; })();
  return { sprites: S, cuts };
}

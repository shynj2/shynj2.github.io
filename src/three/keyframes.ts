type V3 = [number, number, number];

const NUM = [
  'scale',
  'heat',
  'frost',
  'rings',
  'pillars',
  'dragon',
  'ravens',
  'awake',
  'vortex',
  'orbs',
  'banners',
  'beacons',
  'petals',
  'neon',
  'mono',
  'pixel',
  'hatch',
] as const;
type NumKey = (typeof NUM)[number];

export type KF = { cam: V3; look: V3; egg: V3 } & Record<NumKey, number>;

const BASE: Record<NumKey, number> = {
  scale: 0.8,
  heat: 0,
  frost: 0,
  rings: 1,
  pillars: 0,
  dragon: 0,
  ravens: 0.3,
  awake: 0,
  vortex: 0,
  orbs: 0,
  banners: 0,
  beacons: 0,
  petals: 0,
  neon: 0,
  mono: 0,
  pixel: 0,
  hatch: 0,
};

const kf = (o: { cam: V3; look: V3; egg: V3 } & Partial<Record<NumKey, number>>): KF => ({ ...BASE, ...o });

/**
 * One keyframe per chapter. The story goes from ice to fire, and every chapter
 * makes the world do something of its own (see the comments).
 */
const DESKTOP: KF[] = [
  // 0 · prologue — the frozen egg, ice motes circling it
  kf({ cam: [0, 0.25, 6.4], look: [0, 0.12, 0], egg: [0, 0.3, 0], scale: 0.8, heat: 0.03, frost: 1, rings: 1, ravens: 0.15, vortex: 1 }),
  // 1 · chronicle — still winter
  kf({ cam: [-0.35, 0.45, 6.2], look: [0.55, 0.12, 0], egg: [1.85, 0.05, -0.5], scale: 0.78, heat: 0.18, frost: 0.8, rings: 0.8, ravens: 0.25, vortex: 1 }),
  // 2 · seven pillars of light rise around the egg
  kf({ cam: [0, 1.6, 8.2], look: [0, 0.3, 0], egg: [0, -0.78, -1.0], scale: 0.7, heat: 0.33, frost: 0.55, rings: 0.5, pillars: 1, vortex: 0.25 }),
  // 3 · houses — three spirits (web · seo · marketing) orbit the egg
  kf({ cam: [0.4, 0.4, 6.6], look: [-0.4, 0.08, 0], egg: [-2.1, 0.05, -1.0], scale: 0.72, heat: 0.5, frost: 0.3, rings: 0.65, orbs: 1 }),
  // 4 · campaigns — three banners unfurl behind the egg
  kf({ cam: [-0.4, 0.3, 6.4], look: [0.45, 0.06, 0], egg: [2.0, 0.0, -0.7], scale: 0.76, heat: 0.68, frost: 0.1, rings: 0.75, dragon: 0.1, ravens: 0.35, banners: 1 }),
  // 5 · strongholds — six beacon fires are lit on the horizon, the fire spirit uncoils
  kf({ cam: [0, 0.65, 8.8], look: [0, 0.15, 0], egg: [0, 0.15, -1.2], scale: 0.82, heat: 0.88, rings: 0.5, dragon: 1, ravens: 0.4, awake: 0.3, beacons: 1 }),
  // 6 · garden — ash turns into blossom
  kf({ cam: [0.2, 0.4, 8.6], look: [0, 0.3, 0], egg: [2.4, 1.35, -1.0], scale: 0.6, heat: 0.66, rings: 0.8, dragon: 1, ravens: 0.35, awake: 0.15, petals: 1 }),
  // 7 · cyberpunk — aurora and runes go neon
  kf({ cam: [-0.2, 0.4, 8.6], look: [0, 0.3, 0], egg: [-2.4, 1.35, -1.0], scale: 0.6, heat: 0.5, rings: 0.9, dragon: 1, awake: 0.15, neon: 1 }),
  // 8 · minimal — the world loses its colour
  kf({ cam: [0.2, 0.4, 8.6], look: [0, 0.3, 0], egg: [2.4, 1.35, -1.0], scale: 0.6, heat: 0.86, rings: 0.6, dragon: 1, ravens: 0.4, awake: 0.2, mono: 1 }),
  // 9 · the game — the world turns into pixels
  kf({ cam: [-0.2, 0.4, 8.6], look: [0, 0.3, 0], egg: [-2.4, 1.35, -1.0], scale: 0.6, heat: 0.94, rings: 0.9, dragon: 1, ravens: 0.6, awake: 0.5, pixel: 1 }),
  // 10 · rookery — the ravens gather
  kf({ cam: [0, 0.2, 7.0], look: [0, 0.32, 0], egg: [0, 0.4, 0], scale: 0.74, heat: 1.0, rings: 0.95, dragon: 1, ravens: 1, awake: 1 }),
  // 11 · rebirth — the shell breaks and the phoenix rises
  kf({ cam: [0, 0.45, 9.6], look: [0, 0.3, 0], egg: [0, -0.1, 0], scale: 1.0, heat: 1.0, rings: 0.26, dragon: 1, ravens: 0.5, awake: 1, hatch: 1 }),
];

const LAST = DESKTOP.length - 1;

/* Portrait screens: headlines sit at the top, so the egg rests lower — behind the frosted glass cards —
   and in the prologue it floats above the name. */
const MOBILE: KF[] = DESKTOP.map((k, i) => {
  const content = i > 0 && i < LAST - 1;
  const realm = i >= 6 && i <= 9; // realm copy is long: keep the egg low, behind the portal frames
  const eggY = realm ? -1.75 : content ? -0.45 : i === 0 ? 0.8 : i === LAST ? 0.1 : 0.25;
  return {
    ...k,
    cam: [k.cam[0] * 0.2, k.cam[1] + 0.25, k.cam[2] * 1.5 + 1.2],
    look: [0, k.look[1] + (content ? 0.5 : -0.1), 0],
    egg: [0, k.egg[1] + eggY, k.egg[2] * 0.5],
    scale: k.scale * (i === LAST ? 0.8 : 0.95),
  };
});

const out: KF = JSON.parse(JSON.stringify(DESKTOP[0]));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const lerp3 = (o: V3, a: V3, b: V3, t: number) => {
  o[0] = lerp(a[0], b[0], t);
  o[1] = lerp(a[1], b[1], t);
  o[2] = lerp(a[2], b[2], t);
};

/** Resting yaw of the relic per chapter — scrolling turns it, it does not merely slide. */
const YAW = [0.2, 0.72, 1.28, 1.9, 2.5, 3.15, 3.75, 4.4, 5.0, 5.55, 6.15, 6.7];

export function sampleYaw(c: number) {
  const last = YAW.length - 1;
  const cc = Math.min(Math.max(c, 0), last);
  const i = Math.min(Math.floor(cc), last - 1);
  let f = cc - i;
  f = f * f * f * (f * (f * 6 - 15) + 10);
  return YAW[i] + (YAW[i + 1] - YAW[i]) * f;
}

export function sampleKF(c: number, mobile: boolean, rtl: boolean): KF {
  const arr = mobile ? MOBILE : DESKTOP;
  const cc = Math.min(Math.max(c, 0), LAST);
  const i = Math.min(Math.floor(cc), LAST - 1);
  let f = cc - i;
  f = f * f * f * (f * (f * 6 - 15) + 10); // smootherstep — soft in, soft out
  const a = arr[i];
  const b = arr[i + 1];
  lerp3(out.cam, a.cam, b.cam, f);
  lerp3(out.look, a.look, b.look, f);
  lerp3(out.egg, a.egg, b.egg, f);
  for (const key of NUM) out[key] = lerp(a[key], b[key], f);
  if (rtl) {
    out.cam[0] *= -1;
    out.look[0] *= -1;
    out.egg[0] *= -1;
  }
  return out;
}

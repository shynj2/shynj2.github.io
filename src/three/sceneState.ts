import * as THREE from 'three';

/** Smoothed scene values written by the camera rig every frame and read by all 3D objects. */
export const S = {
  heat: 0.03,
  frost: 1,
  rings: 1,
  pillars: 0,
  dragon: 0,
  ravens: 0.15,
  awake: 0,
  // chapter events
  vortex: 1, // ice motes circling the frozen egg
  orbs: 0, // three house-spirits orbiting the egg
  banners: 0, // three banners unfurl
  beacons: 0, // six beacon fires on the horizon
  petals: 0, // snow turns into blossom
  neon: 0, // aurora + runes go neon
  mono: 0, // the world loses its colour
  pixel: 0, // the world turns into pixels
  hatch: 0, // the egg breaks and the phoenix rises
  flash: 0, // brief burst of light at the moment the shell breaks
  hover: 0,
  intro: 0,
  // the 4000° white-out that swallows the whole realm
  blind: 0,
  // cursor contact on the relic (world hit + how strongly the hand is on it)
  touchWorld: new THREE.Vector3(),
  touch: new THREE.Vector3(0, 1, 0),
  touchAmt: 0,
  stir: 0, // scroll energy — the realm turns and breathes with the wheel
  relicYaw: 0,
  yawKick: 0,
  relicShift: new THREE.Vector3(),
  egg: new THREE.Vector3(0, 0.28, 0),
  focusScale: 0.8,
  mouse: new THREE.Vector3(0, 0, 0),
  rayOrigin: new THREE.Vector3(0, 1.6, 13),
  rayDir: new THREE.Vector3(0, 0, -1),
  rayVel: new THREE.Vector3(0, 0, 0),
  rayActive: false,
  clickShock: 0,
  clickWave: 0,
  mobile: false,
};

export const damp = THREE.MathUtils.damp;
export const smooth = THREE.MathUtils.smoothstep;

import { useMemo, useRef } from 'react';
import { useSafeFrame } from './useSafeFrame';
import * as THREE from 'three';
import { S } from './sceneState';
import { ParticleSpringField } from './particlePhysics';
import { world } from '../store';

/**
 * A living halo that stays with the relic in every chapter and changes costume
 * as the story turns: ice crown, pillars of motes, house-orbits, war standards,
 * a fire coil, blossom disk, neon torus, a wireframe solid, pixel shards,
 * a murmuration, then an opening ring that yields to the phoenix.
 * The same cursor parts it; a click throws it open; it springs back into the chapter's shape.
 */
const vert = /* glsl */ `
attribute vec3 aHome;
attribute vec3 aDisp;
attribute float aSeed;
uniform float uTime;
uniform float uVis;
uniform float uSize;
uniform float uPR;
uniform float uHeat;
varying float vA;
varying float vSeed;
void main(){
  vec3 pos = aHome + aDisp;
  vec4 mv = modelViewMatrix * vec4(pos, 1.0);
  gl_Position = projectionMatrix * mv;
  float flick = 0.72 + 0.28 * sin(uTime * 5.5 + aSeed * 40.0);
  float depth = -mv.z;
  float outA = uVis * flick;
  gl_PointSize = outA > 0.01 ? (uSize * (0.65 + aSeed * 0.7) * flick * (1.0 + uHeat * 0.2) * uPR / max(depth, 0.1)) : 0.0;
  vA = outA;
  vSeed = aSeed;
}
`;

const frag = /* glsl */ `
uniform vec3 uColA;
uniform vec3 uColB;
uniform float uHeat;
varying float vA;
varying float vSeed;
void main(){
  vec2 c = gl_PointCoord - 0.5;
  float r2 = dot(c, c);
  if (r2 > 0.25) discard;
  float a = 1.0 - smoothstep(0.0, 0.5, sqrt(r2));
  a *= a;
  vec3 col = mix(uColA, uColB, vSeed);
  col = mix(col, vec3(1.0, 0.96, 0.88), clamp(uHeat * 0.28, 0.0, 0.45));
  gl_FragColor = vec4(col * (1.7 + uHeat * 0.6), a * vA);
}
`;

const TAU = Math.PI * 2;
const PHI = (1 + Math.sqrt(5)) / 2;
const ICO: [number, number, number][] = (
  [
    [-1, PHI, 0],
    [1, PHI, 0],
    [-1, -PHI, 0],
    [1, -PHI, 0],
    [0, -1, PHI],
    [0, 1, PHI],
    [0, -1, -PHI],
    [0, 1, -PHI],
    [PHI, 0, -1],
    [PHI, 0, 1],
    [-PHI, 0, -1],
    [-PHI, 0, 1],
  ] as [number, number, number][]
).map((v) => {
  const l = Math.hypot(v[0], v[1], v[2]);
  return [v[0] / l, v[1] / l, v[2] / l];
});

const PAL = [
  ['#e8f7ff', '#7ec8ff'],
  ['#d7e9ff', '#9eb6d0'],
  ['#ffe6b4', '#f0a24a'],
  ['#b9ecff', '#ffd27a'],
  ['#ffd7a0', '#ff7a32'],
  ['#ffb15a', '#ff2d3a'],
  ['#ffd0dc', '#ff6d86'],
  ['#7ef6ee', '#ff3d92'],
  ['#f6f6fb', '#b9b9c6'],
  ['#d7ccff', '#7a5cff'],
  ['#ffc56a', '#ff5a1a'],
  ['#fff1c9', '#ff8a3a'],
];

type V = { x: number; y: number; z: number };

function form(id: number, a: number, b: number, c: number, t: number, o: V) {
  const spin = t * (0.18 + S.stir * 0.5);
  let x = 0;
  let y = 0;
  let z = 0;
  if (id <= 1) {
    const ang = a * TAU + spin * (id === 0 ? 0.65 : 0.4);
    const spike = c > 0.62;
    const r = spike ? 1.22 + b * 0.28 : 1.5 + b * 0.6 + id * 0.28;
    x = Math.cos(ang) * r;
    z = Math.sin(ang) * r * (0.7 + id * 0.12);
    y = spike ? -0.4 + b * 2.6 : Math.sin(ang * 2 + c * 5) * (0.32 + id * 0.5);
  } else if (id === 2) {
    const col = (a * 7) | 0;
    const ang = (col + 0.5) / 7 * TAU;
    const rise = (b + t * (0.18 + S.stir * 0.25)) % 1;
    x = Math.cos(ang) * 2.5;
    z = Math.sin(ang) * 2.5;
    y = -1.2 + rise * 4.5;
  } else if (id === 3) {
    const band = (a * 3) | 0;
    const ang = b * TAU + t * (0.3 + band * 0.1);
    const r = 1.5 + band * 0.34;
    const tilt = 0.58 - band * 0.4;
    const pz = Math.sin(ang) * r;
    x = Math.cos(ang) * r;
    y = -pz * Math.sin(tilt);
    z = pz * Math.cos(tilt);
  } else if (id === 4) {
    const k = (a * 3) | 0;
    const ang = (k + 0.5) / 3 * TAU + spin * 0.25;
    const hang = b;
    const wave = Math.sin(t * 1.4 + hang * 3.2 + k) * 0.24 * hang;
    const r = 1.65 + hang * 0.4;
    x = Math.cos(ang) * r + wave * Math.cos(ang);
    z = Math.sin(ang) * r + wave * Math.sin(ang);
    y = 1.3 - hang * 2.75;
  } else if (id === 5) {
    const ang = a * TAU * 2.5 + t * 0.42;
    const r = 0.85 + a * 2.35;
    x = Math.cos(ang) * r;
    z = Math.sin(ang) * r;
    y = -0.55 + b * 2.15 + Math.sin(ang * 2 + t) * 0.16;
  } else if (id === 6) {
    const ang = a * TAU + spin * 0.5;
    const r = 0.2 + Math.sqrt(b) * 2.6;
    x = Math.cos(ang) * r;
    z = Math.sin(ang) * r * 0.68;
    y = 0.18 + Math.sin(t * 0.9 + c * 8) * 0.3 * (r / 2.6);
  } else if (id === 7) {
    const ang = a * TAU + t * 0.52;
    const pol = b * TAU;
    const R = 1.92;
    const rr = 0.44;
    x = (R + rr * Math.cos(pol)) * Math.cos(ang);
    z = (R + rr * Math.cos(pol)) * Math.sin(ang);
    y = rr * Math.sin(pol) * 1.65;
  } else if (id === 8) {
    const v = ICO[(a * 12) | 0];
    const s = 1.58 + (b - 0.5) * 0.2;
    const ang = spin * 0.32;
    const cs = Math.cos(ang);
    const sn = Math.sin(ang);
    const vx = v[0] * s;
    const vz = v[2] * s;
    x = vx * cs - vz * sn;
    z = vx * sn + vz * cs;
    y = v[1] * s;
  } else if (id === 9) {
    const ang = ((a * 8) | 0) / 8 * TAU + t * 0.34;
    const r = 1.3 + ((b * 3) | 0) * 0.5;
    x = Math.round((Math.cos(ang) * r) / 0.24) * 0.24;
    z = Math.round((Math.sin(ang) * r) / 0.24) * 0.24;
    y = ((c * 4) | 0) * 0.32 - 0.48;
  } else if (id === 10) {
    const ang = a * TAU + t * (0.38 + S.ravens * 0.15);
    const lat = (b - 0.5) * Math.PI;
    const r = 2.05 + Math.sin(t * 0.8 + c * 9) * 0.2;
    const cl = Math.cos(lat);
    x = Math.cos(ang) * cl * r;
    y = Math.sin(lat) * r * 0.68 + 0.28;
    z = Math.sin(ang) * cl * r;
  } else {
    const ang = a * TAU + spin * 0.35;
    const r = 2.05 + S.hatch * 1.7 + b * 0.35;
    x = Math.cos(ang) * r;
    z = Math.sin(ang) * r;
    y = 0.3 + S.hatch * 1.7 + c * 0.55;
  }
  o.x = x;
  o.y = y;
  o.z = z;
}

export function LivingHalo({ mobile }: { mobile: boolean }) {
  const points = useRef<THREE.Points>(null);
  const sim = useMemo(() => {
    const count = mobile ? 780 : 1680;
    const seeds = new Float32Array(count * 4);
    for (let i = 0; i < count; i++) {
      seeds[i * 4] = Math.random();
      seeds[i * 4 + 1] = Math.random();
      seeds[i * 4 + 2] = Math.random();
      seeds[i * 4 + 3] = Math.random();
    }
    const field = new ParticleSpringField(count, {
      screenRadius: 0.2,
      spring: 9.4,
      damping: 4.8,
      maxDisp: 3.2,
      clickPower: 1.05,
    });
    const g = new THREE.BufferGeometry();
    const homeAttr = new THREE.BufferAttribute(field.home, 3);
    homeAttr.setUsage(THREE.DynamicDrawUsage);
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(count * 3), 3));
    g.setAttribute('aHome', homeAttr);
    g.setAttribute('aDisp', field.attr);
    g.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 1));
    const m = new THREE.ShaderMaterial({
      vertexShader: vert,
      fragmentShader: frag,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uTime: { value: 0 },
        uVis: { value: 0 },
        uSize: { value: mobile ? 26 : 30 },
        uPR: { value: 1 },
        uHeat: { value: 0 },
        uColA: { value: new THREE.Color(PAL[0][0]) },
        uColB: { value: new THREE.Color(PAL[0][1]) },
      },
    });
    return {
      geo: g,
      mat: m,
      field,
      seeds,
      homeAttr,
      A: { x: 0, y: 0, z: 0 },
      B: { x: 0, y: 0, z: 0 },
      cA: new THREE.Color(),
      cB: new THREE.Color(),
    };
  }, [mobile]);

  useSafeFrame((state, delta) => {
    const vis = S.intro * (1 - THREE.MathUtils.smoothstep(S.hatch, 0.12, 0.7));
    const visible = vis > 0.02;
    if (points.current) points.current.visible = visible;
    if (!visible) {
      sim.field.reset();
      return;
    }
    const t = state.clock.elapsedTime;
    const u = sim.mat.uniforms;
    u.uTime.value = t;
    u.uVis.value = vis * (0.72 + S.touchAmt * 0.28);
    u.uPR.value = state.gl.getPixelRatio();
    u.uHeat.value = Math.min(1.2, world.charge + world.burst * 0.6 + S.heat * 0.25);

    const ch = Math.min(11, Math.max(0, world.chapter));
    const i0 = Math.floor(ch);
    const i1 = Math.min(11, i0 + 1);
    const f = ch - i0;
    const sf = f * f * (3 - 2 * f);
    const seeds = sim.seeds;
    const home = sim.field.home;
    const A = sim.A;
    const B = sim.B;
    const n = sim.field.count;
    for (let i = 0; i < n; i++) {
      const s = i * 4;
      const i3 = i * 3;
      form(i0, seeds[s], seeds[s + 1], seeds[s + 2], t, A);
      if (sf > 0.015 && i0 !== i1) {
        form(i1, seeds[s], seeds[s + 1], seeds[s + 2], t, B);
        home[i3] = A.x + (B.x - A.x) * sf;
        home[i3 + 1] = A.y + (B.y - A.y) * sf;
        home[i3 + 2] = A.z + (B.z - A.z) * sf;
      } else {
        home[i3] = A.x;
        home[i3 + 1] = A.y;
        home[i3 + 2] = A.z;
      }
    }
    sim.homeAttr.needsUpdate = true;

    const ca = PAL[i0];
    const cb = PAL[i1];
    sim.cA.set(ca[0]);
    sim.cB.set(cb[0]);
    (u.uColA.value as THREE.Color).copy(sim.cA).lerp(sim.cB, sf);
    sim.cA.set(ca[1]);
    sim.cB.set(cb[1]);
    (u.uColB.value as THREE.Color).copy(sim.cA).lerp(sim.cB, sf);

    if (sim.field.beginStep(0, 0.35, 0, 3.4, 'relic')) sim.field.step(delta);
  });

  return <points ref={points} geometry={sim.geo} material={sim.mat} frustumCulled={false} />;
}

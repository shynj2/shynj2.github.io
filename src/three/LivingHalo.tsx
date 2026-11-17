import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { world } from '../store';
import { useSafeFrame } from './useSafeFrame';
import { S, touchSweep } from './sceneState';
import { TOUCH_SWEEP } from './glsl';
import { ParticleSpringField } from './particlePhysics';

const TAU = Math.PI * 2;
const PHI = (1 + Math.sqrt(5)) / 2;
const ICO = [
  [-1, PHI, 0], [1, PHI, 0], [-1, -PHI, 0], [1, -PHI, 0],
  [0, -1, PHI], [0, 1, PHI], [0, -1, -PHI], [0, 1, -PHI],
  [PHI, 0, -1], [PHI, 0, 1], [-PHI, 0, -1], [-PHI, 0, 1],
].map(([x, y, z]) => {
  const l = Math.hypot(x, y, z);
  return [x / l, y / l, z / l];
});

const PAL = [
  ['#e8f7ff', '#7ec8ff'], ['#d7e9ff', '#9eb6d0'], ['#ffe6b4', '#f0a24a'],
  ['#b9ecff', '#ffd27a'], ['#ffd7a0', '#ff7a32'], ['#ffb15a', '#ff2d3a'],
  ['#ffd0dc', '#ff6d86'], ['#7ef6ee', '#ff3d92'], ['#f6f6fb', '#b9b9c6'],
  ['#d7ccff', '#7a5cff'], ['#ffc56a', '#ff5a1a'], ['#fff1c9', '#ff8a3a'],
].map(([a, b]) => [new THREE.Color(a), new THREE.Color(b)] as const);
const LAST = PAL.length - 1;

// Poses run on the GPU during normal scrolling. The CPU only evaluates these same homes while the field is disturbed.
const vert = /* glsl */ `
attribute vec4 aSeed;
attribute vec3 aDisp;
uniform float uTime;
uniform float uVis;
uniform float uSize;
uniform float uPR;
uniform float uHeat;
uniform float uHatch;
uniform float uRavens;
uniform vec4 uPose; // chapter A, chapter B, blend, accumulated spin
varying float vA;
varying float vSeed;
const float TAU = ${TAU.toFixed(8)};
const vec3 ICO[12] = vec3[12](${ICO.map((v) => `vec3(${v.map((n) => n.toFixed(7)).join(',')})`).join(',')});

vec3 pose(float id){
  float a = aSeed.x, b = aSeed.y, c = aSeed.z;
  float t = uTime, spin = uPose.w;
  if (id < 1.5) {
    float band = floor(c * 4.0);
    float ang = a * TAU + spin * (0.76 - id * 0.22) + band * 0.43;
    float r = 1.30 + band * 0.20 + (b - 0.5) * 0.28 + id * 0.16;
    float z = sin(ang) * r;
    float tilt = (mod(band, 2.0) < 1.0 ? 0.36 : -0.33) + id * 0.07;
    float y = 0.18 + z * tilt + sin(ang * 2.0 + band * 0.9) * 0.17 + (b - 0.5) * 0.27;
    return vec3(cos(ang) * r, y, z * 0.84);
  }
  if (id < 2.5) {
    float ang = (floor(a * 7.0) + 0.5) / 7.0 * TAU;
    float r = 2.5 + (c - 0.5) * 0.17;
    return vec3(cos(ang) * r, -1.2 + fract(b + t * 0.18 + spin * 0.15) * 4.5, sin(ang) * r);
  }
  if (id < 3.5) {
    float band = floor(a * 3.0);
    float ang = b * TAU + t * (0.3 + band * 0.1);
    float r = 1.5 + band * 0.34 + (c - 0.5) * 0.15;
    float tilt = 0.58 - band * 0.4;
    float pz = sin(ang) * r;
    return vec3(cos(ang) * r, -pz * sin(tilt), pz * cos(tilt));
  }
  if (id < 4.5) {
    float k = floor(a * 3.0);
    float ang = (k + 0.5) / 3.0 * TAU + spin * 0.25;
    float wave = sin(t * 1.4 + b * 3.2 + k) * 0.24 * b;
    float r = 1.65 + b * 0.4 + wave + (c - 0.5) * 0.16;
    return vec3(cos(ang) * r, 1.3 - b * 2.75, sin(ang) * r);
  }
  if (id < 5.5) {
    float ang = a * TAU * 2.5 + t * 0.42;
    float r = 0.9 + a * 2.22 + (b - 0.5) * 0.3;
    return vec3(cos(ang) * r, -0.58 + a * 2.02 + (c - 0.5) * 0.5 + sin(ang * 2.0 + t) * 0.18, sin(ang) * r);
  }
  if (id < 6.5) {
    float ang = a * TAU + spin * 0.5;
    float r = 0.2 + sqrt(b) * 2.6;
    return vec3(cos(ang) * r, 0.18 + sin(t * 0.9 + c * 8.0) * 0.3 * (r / 2.6), sin(ang) * r * 0.68);
  }
  if (id < 7.5) {
    float ang = a * TAU + t * 0.52;
    float pol = b * TAU;
    float r = 1.92 + 0.36 * cos(pol);
    return vec3(r * cos(ang), 0.66 * sin(pol), r * sin(ang));
  }
  if (id < 8.5) {
    vec3 q = ICO[min(11, int(a * 12.0))] * (1.58 + (b - 0.5) * 0.2);
    float ang = spin * 0.32;
    return vec3(q.x * cos(ang) - q.z * sin(ang), q.y, q.x * sin(ang) + q.z * cos(ang));
  }
  if (id < 9.5) {
    float ang = floor(a * 8.0) / 8.0 * TAU + t * 0.34;
    float r = 1.3 + floor(b * 3.0) * 0.5;
    return vec3(floor(cos(ang) * r / 0.24 + 0.5) * 0.24, floor(c * 4.0) * 0.32 - 0.48, floor(sin(ang) * r / 0.24 + 0.5) * 0.24);
  }
  if (id < 10.5) {
    float ang = a * TAU + t * (0.38 + uRavens * 0.15);
    float lat = (b - 0.5) * 3.14159265;
    float r = 2.05 + sin(t * 0.8 + c * 9.0) * 0.2;
    return vec3(cos(ang) * cos(lat) * r, sin(lat) * r * 0.68 + 0.28, sin(ang) * cos(lat) * r);
  }
  float ang = a * TAU + spin * 0.35;
  float r = 2.05 + uHatch * 1.7 + b * 0.35;
  return vec3(cos(ang) * r, 0.3 + uHatch * 1.7 + c * 0.55, sin(ang) * r);
}

${TOUCH_SWEEP}
void main(){
  vec3 p = pose(uPose.z > 0.999 ? uPose.y : uPose.x);
  if (uPose.z > 0.001 && uPose.z <= 0.999) p = mix(p, pose(uPose.y), uPose.z);
  vec4 mv = modelViewMatrix * vec4(p + aDisp, 1.0);
  gl_Position = swept(projectionMatrix * mv);
  float flick = 0.80 + 0.20 * sin(uTime * 4.2 + aSeed.w * 40.0);
  float depth = -mv.z;
  gl_PointSize = min(13.0 * uPR, uSize * (0.70 + aSeed.w * 0.55) * flick * (1.0 + uHeat * 0.16) * uPR / max(depth, 0.1));
  vA = uVis * flick * smoothstep(0.1, 1.15, depth);
  vSeed = aSeed.w;
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
  if (r2 > 0.25 || vA < 0.003) discard;
  float a = 1.0 - smoothstep(0.0, 0.5, sqrt(r2));
  vec3 col = mix(uColA, uColB, vSeed);
  col = mix(col, vec3(1.0, 0.96, 0.88), clamp(uHeat * 0.28, 0.0, 0.45));
  gl_FragColor = vec4(col * (1.76 + uHeat * 0.6), a * a * vA);
}
`;

type Point = { x: number; y: number; z: number };
const fract = (x: number) => x - Math.floor(x);

function form(id: number, a: number, b: number, c: number, t: number, spin: number, o: Point) {
  let angle: number, r: number;
  if (id <= 1) {
    const band = Math.floor(c * 4);
    angle = a * TAU + spin * (0.76 - id * 0.22) + band * 0.43;
    r = 1.30 + band * 0.20 + (b - 0.5) * 0.28 + id * 0.16;
    const z = Math.sin(angle) * r;
    o.x = Math.cos(angle) * r;
    o.y = 0.18 + z * ((band % 2 === 0 ? 0.36 : -0.33) + id * 0.07) + Math.sin(angle * 2 + band * 0.9) * 0.17 + (b - 0.5) * 0.27;
    o.z = z * 0.84;
  } else if (id === 2) {
    angle = (Math.floor(a * 7) + 0.5) / 7 * TAU;
    r = 2.5 + (c - 0.5) * 0.17;
    o.x = Math.cos(angle) * r;
    o.y = -1.2 + fract(b + t * 0.18 + spin * 0.15) * 4.5;
    o.z = Math.sin(angle) * r;
  } else if (id === 3) {
    const band = Math.floor(a * 3);
    angle = b * TAU + t * (0.3 + band * 0.1);
    r = 1.5 + band * 0.34 + (c - 0.5) * 0.15;
    const tilt = 0.58 - band * 0.4;
    const z = Math.sin(angle) * r;
    o.x = Math.cos(angle) * r;
    o.y = -z * Math.sin(tilt);
    o.z = z * Math.cos(tilt);
  } else if (id === 4) {
    const k = Math.floor(a * 3);
    angle = (k + 0.5) / 3 * TAU + spin * 0.25;
    r = 1.65 + b * 0.4 + Math.sin(t * 1.4 + b * 3.2 + k) * 0.24 * b + (c - 0.5) * 0.16;
    o.x = Math.cos(angle) * r;
    o.y = 1.3 - b * 2.75;
    o.z = Math.sin(angle) * r;
  } else if (id === 5) {
    angle = a * TAU * 2.5 + t * 0.42;
    r = 0.9 + a * 2.22 + (b - 0.5) * 0.3;
    o.x = Math.cos(angle) * r;
    o.y = -0.58 + a * 2.02 + (c - 0.5) * 0.5 + Math.sin(angle * 2 + t) * 0.18;
    o.z = Math.sin(angle) * r;
  } else if (id === 6) {
    angle = a * TAU + spin * 0.5;
    r = 0.2 + Math.sqrt(b) * 2.6;
    o.x = Math.cos(angle) * r;
    o.y = 0.18 + Math.sin(t * 0.9 + c * 8) * 0.3 * (r / 2.6);
    o.z = Math.sin(angle) * r * 0.68;
  } else if (id === 7) {
    angle = a * TAU + t * 0.52;
    const pol = b * TAU;
    r = 1.92 + 0.36 * Math.cos(pol);
    o.x = r * Math.cos(angle);
    o.y = 0.66 * Math.sin(pol);
    o.z = r * Math.sin(angle);
  } else if (id === 8) {
    const v = ICO[Math.min(11, Math.floor(a * 12))];
    const scale = 1.58 + (b - 0.5) * 0.2;
    angle = spin * 0.32;
    const cs = Math.cos(angle), sn = Math.sin(angle);
    o.x = (v[0] * cs - v[2] * sn) * scale;
    o.y = v[1] * scale;
    o.z = (v[0] * sn + v[2] * cs) * scale;
  } else if (id === 9) {
    angle = Math.floor(a * 8) / 8 * TAU + t * 0.34;
    r = 1.3 + Math.floor(b * 3) * 0.5;
    o.x = Math.round(Math.cos(angle) * r / 0.24) * 0.24;
    o.y = Math.floor(c * 4) * 0.32 - 0.48;
    o.z = Math.round(Math.sin(angle) * r / 0.24) * 0.24;
  } else if (id === 10) {
    angle = a * TAU + t * (0.38 + S.ravens * 0.15);
    const lat = (b - 0.5) * Math.PI;
    r = 2.05 + Math.sin(t * 0.8 + c * 9) * 0.2;
    const cl = Math.cos(lat);
    o.x = Math.cos(angle) * cl * r;
    o.y = Math.sin(lat) * r * 0.68 + 0.28;
    o.z = Math.sin(angle) * cl * r;
  } else {
    angle = a * TAU + spin * 0.35;
    r = 2.05 + S.hatch * 1.7 + b * 0.35;
    o.x = Math.cos(angle) * r;
    o.y = 0.3 + S.hatch * 1.7 + c * 0.55;
    o.z = Math.sin(angle) * r;
  }
}

export function LivingHalo({ mobile }: { mobile: boolean }) {
  const points = useRef<THREE.Points>(null);
  const spin = useRef(0);
  const sim = useMemo(() => {
    const count = mobile ? 1280 : 2460;
    const seeds = new Float32Array(count * 4);
    // Low-discrepancy samples keep nebulae, rings, and filaments evenly filled rather than clumped.
    for (let i = 0; i < count; i++) {
      seeds[i * 4] = (i + 0.5) / count;
      seeds[i * 4 + 1] = fract((i + 0.5) * 0.61803398875);
      seeds[i * 4 + 2] = fract((i + 0.5) * 0.75487766624);
      seeds[i * 4 + 3] = fract((i + 0.5) * 0.56984029099);
    }
    const field = new ParticleSpringField(count, { screenRadius: 0.213, spring: 12.4, damping: 5.7, maxDisp: 2.55 });
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(count * 3), 3));
    geo.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 4));
    geo.setAttribute('aDisp', field.attr);
    const mat = new THREE.ShaderMaterial({
      vertexShader: vert,
      fragmentShader: frag,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: { uSweep: touchSweep,
        uTime: { value: 0 }, uVis: { value: 0 }, uSize: { value: mobile ? 24 : 28 },
        uPR: { value: 1 }, uHeat: { value: 0 }, uHatch: { value: 0 }, uRavens: { value: 0 },
        uPose: { value: new THREE.Vector4() },
        uColA: { value: PAL[0][0].clone() }, uColB: { value: PAL[0][1].clone() },
      },
    });
    return { geo, mat, field, seeds, a: { x: 0, y: 0, z: 0 }, b: { x: 0, y: 0, z: 0 } };
  }, [mobile]);

  useSafeFrame((state, delta) => {
    const vis = S.intro * (1 - THREE.MathUtils.smoothstep(S.hatch, 0.12, 0.7));
    const visible = vis > 0.02;
    if (points.current) points.current.visible = visible;
    if (!visible) {
      sim.field.reset();
      return;
    }
    spin.current += Math.min(delta, 0.06) * (0.27 + S.stir * 0.47);
    const t = state.clock.elapsedTime;
    const ch = THREE.MathUtils.clamp(world.chapter, 0, LAST);
    const i0 = Math.floor(ch);
    const i1 = Math.min(LAST, i0 + 1);
    const f = ch - i0;
    const blend = f * f * (3 - 2 * f);
    const u = sim.mat.uniforms;
    u.uTime.value = t;
    u.uVis.value = vis * (0.73 + S.touchAmt * 0.27);
    u.uPR.value = state.gl.getPixelRatio();
    u.uHeat.value = Math.min(1.2, world.charge + world.burst * 0.6 + S.heat * 0.25);
    u.uHatch.value = S.hatch;
    u.uRavens.value = S.ravens;
    u.uPose.value.set(i0, i1, blend, spin.current);
    u.uColA.value.copy(PAL[i0][0]).lerp(PAL[i1][0], blend);
    u.uColB.value.copy(PAL[i0][1]).lerp(PAL[i1][1], blend);

    const { field, seeds, a, b } = sim;
    if (!field.beginStep(0, 0.35, 0, 3.4, 'relic')) return;
    if (!field.needsHome) { field.step(delta); return; }
    const morphing = blend > 0.001 && blend <= 0.999;
    const from = blend > 0.999 ? i1 : i0;
    for (let i = 0; i < field.count; i++) {
      const j = i * 4;
      const k = i * 3;
      form(from, seeds[j], seeds[j + 1], seeds[j + 2], t, spin.current, a);
      if (morphing) {
        form(i1, seeds[j], seeds[j + 1], seeds[j + 2], t, spin.current, b);
        field.home[k] = a.x + (b.x - a.x) * blend;
        field.home[k + 1] = a.y + (b.y - a.y) * blend;
        field.home[k + 2] = a.z + (b.z - a.z) * blend;
      } else {
        field.home[k] = a.x;
        field.home[k + 1] = a.y;
        field.home[k + 2] = a.z;
      }
    }
    field.step(delta);
  });

  return <points ref={points} name="Living halo" geometry={sim.geo} material={sim.mat} frustumCulled={false} />;
}

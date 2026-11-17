import { useMemo, useRef } from 'react';
import { useSafeFrame } from './useSafeFrame';
import * as THREE from 'three';
import { S } from './sceneState';
import { ParticleSpringField } from './particlePhysics';
import { world } from '../store';

/**
 * The phoenix that is born when the shell finally breaks.
 * Built from fire motes on the GPU: body, neck, head with crest, two feathered wings
 * and seven long tail feathers. `uHatch` (0 → 1) drives the whole birth and is fully
 * reversible. Hovering or clicking scatters the living fire motes away from the cursor,
 * and damped spring forces pull every mote back to reform its exact feather.
 * Pressing & holding heats the plumage white-hot while keeping wingbeat calm and steady.
 */
const vert = /* glsl */ `
attribute float aKind;   // 0 body · 1 neck · 2 head · 3 beak · 4 crest · 5 wing · 6 tail
attribute float aIdx;    // wing side (-1 / +1) or feather index
attribute vec2 aUV;
attribute vec3 aRnd;
attribute vec3 aDisp;
uniform float uTime;
uniform float uHatch;
uniform float uSize;
uniform float uPR;
uniform float uHeat;
varying float vA;
varying float vTone;
varying float vScatter;

float h1(float n){ return fract(sin(n * 91.345 + 1.7) * 43758.5453); }
vec2 rot(vec2 p, float a){ float c = cos(a); float s = sin(a); return vec2(p.x * c - p.y * s, p.x * s + p.y * c); }

void main(){
  float t = uTime;
  float h = uHatch;
  float eBody = smoothstep(0.38, 0.62, h);
  float eWing = smoothstep(0.55, 1.0, h);
  float eTail = smoothstep(0.5, 0.96, h);
  vec3 pos = vec3(0.0);
  float size = 1.0;
  float tone = 0.3;
  float alpha = 1.0;

  if (aKind < 0.5) {
    // body — a soft teardrop
    float u = aUV.x;
    float r = 0.27 * pow(sin(3.14159 * clamp(u * 0.9 + 0.07, 0.0, 1.0)), 0.8);
    float ang = aRnd.x * 6.28318;
    float rad = sqrt(aRnd.y) * r;
    pos = vec3(cos(ang) * rad, mix(-0.5, 0.56, u), sin(ang) * rad * 0.85);
    size = 1.3;
    tone = 0.1 + 0.25 * aRnd.y;
  } else if (aKind < 1.5) {
    // neck
    float u = aUV.x;
    float r = mix(0.13, 0.08, u) * sqrt(aRnd.y);
    float ang = aRnd.x * 6.28318;
    pos = vec3(0.1 * u * u + cos(ang) * r, 0.5 + 0.5 * u, sin(ang) * r);
    size = 1.1;
    tone = 0.14;
  } else if (aKind < 2.5) {
    // head (in profile)
    vec3 d = normalize(aRnd - 0.5);
    pos = vec3(0.12, 1.06, 0.0) + d * 0.115 * pow(aUV.x, 0.33);
    size = 1.0;
    tone = 0.04;
  } else if (aKind < 3.5) {
    // beak
    float u = aUV.x;
    vec3 d = normalize(aRnd - 0.5);
    pos = mix(vec3(0.2, 1.06, 0.0), vec3(0.43, 0.985, 0.0), u) + d * 0.045 * (1.0 - u);
    size = 0.7;
    tone = 0.0;
  } else if (aKind < 4.5) {
    // crest feathers sweeping back from the head
    float k = aIdx;
    float s = aUV.x;
    vec2 p = vec2(0.07, 1.15) + vec2(-(0.42 + 0.1 * k) * s, (0.3 + 0.08 * k) * s * (1.0 - 0.45 * s));
    p.y += sin(t * 1.6 + k * 1.3) * 0.035 * s;
    pos = vec3(p + (aRnd.xy - 0.5) * 0.022, (aRnd.z - 0.5) * 0.03);
    size = 0.75;
    tone = 0.25 + 0.6 * s;
  } else if (aKind < 5.5) {
    // wings — curved arm with fifteen feathers; steady calm wingbeat even while heating up
    float side = aIdx;
    float N = 15.0;
    float u = aUV.x;
    float v = aUV.y;
    float fi = floor(u * N);
    float fu = fract(u * N);
    float uc = (fi + 0.5) / N;
    float beat = sin(t * 1.5 - uc * 1.4);
    float a = mix(-1.9, 0.28 * beat + 0.14, eWing);
    float len = mix(0.38, 1.0, eWing);
    vec2 bone = vec2(2.25 * uc, 0.62 * sin(uc * 2.3)) * len;
    vec2 tang = normalize(vec2(2.25, 1.43 * cos(uc * 2.3)));
    vec2 fdir = normalize(vec2(0.22 + 0.75 * uc, -1.0));
    float L = (0.6 + 1.0 * pow(uc, 0.75)) * (1.0 - 0.35 * pow(uc, 6.0)) * (0.85 + 0.15 * h1(fi + side * 7.0)) * len;
    vec2 p = bone + tang * (fu - 0.5) * (2.25 / N) * (1.0 - 0.8 * v * v) * len + fdir * v * L;
    p = rot(p, a) + vec2(0.2, 0.38);
    pos = vec3(p.x * side, p.y, -0.3 * uc * uc + 0.12 * v - 0.25 * beat * uc * eWing);
    size = mix(1.15, 0.7, v);
    tone = 0.14 + 0.72 * v;
    alpha = 0.8;
  } else {
    // tail — seven long feathers with a glowing "eye" near the tip, streaming down and swaying
    float k = aIdx;
    float s = aUV.x;
    float ac = aUV.y * 2.0 - 1.0;
    float phi = (k - 3.0) / 3.0 * 0.55;
    float Lk = (2.75 - 0.28 * abs(k - 3.0)) * eTail;
    vec3 c = vec3(sin(phi) * s * Lk * 0.9, -0.42 - cos(phi) * s * Lk * 0.95, -0.4 * s);
    c.x += 0.24 * sin(s * 3.3 + k * 1.3 + t * 0.7) * s;
    c.z += 0.18 * sin(s * 2.6 + k + t * 0.5) * s;
    float eye = smoothstep(0.76, 0.9, s) * (1.0 - smoothstep(0.93, 1.0, s));
    float w = 0.025 + 0.045 * sin(3.14159 * s) + 0.1 * eye;
    pos = c + vec3(cos(phi), sin(phi), 0.0) * ac * w;
    size = mix(1.0, 0.6, s) + eye * 0.35;
    tone = mix(0.2 + 0.75 * s, 0.1, eye * (1.0 - abs(ac)));
    alpha = 0.85;
  }

  float dispLen = length(aDisp);
  float scatter = clamp(dispLen * 1.45, 0.0, 1.0);

  // living flame: every mote drifts upward and fades, staying bright while scattered so reformation reads crisply
  float life = fract(t * (0.25 + aRnd.x * 0.5) + aRnd.y * 7.0);
  float driftMask = 1.0 - scatter * 0.72;
  pos.y += life * 0.2 * (0.25 + tone) * driftMask;
  pos.x += sin(t * 2.0 + aRnd.z * 40.0) * 0.012;
  alpha *= mix(1.0 - life * 0.75, 0.78 + 0.22 * (1.0 - life), scatter * 0.85);

  // born inside the egg, then it rises above the broken shell
  vec3 seedPos = (aRnd - 0.5) * 0.7;
  pos = mix(seedPos, pos, eBody);
  pos.y += mix(-0.15, 1.05, smoothstep(0.42, 0.92, h)) + sin(t * 0.9) * 0.06 * eBody;

  // interactive cursor & click displacement — motes flee the cursor and spring back home
  pos += aDisp;

  vec4 mv = modelViewMatrix * vec4(pos, 1.0);
  gl_Position = projectionMatrix * mv;
  float flick = 0.75 + 0.25 * sin(t * 8.0 + aRnd.z * 60.0);
  float outA = alpha * smoothstep(0.36, 0.5, h) * flick;
  float sparkGrow = 1.0 + uHeat * 0.26 + scatter * 0.16;
  gl_PointSize = outA > 0.003 ? (uSize * size * flick * sparkGrow * uPR / max(-mv.z, 0.1)) : 0.0;
  vA = outA;
  vTone = tone;
  vScatter = scatter;
}
`;

const frag = /* glsl */ `
uniform float uHeat;
varying float vA;
varying float vTone;
varying float vScatter;
void main(){
  vec2 c = gl_PointCoord - 0.5;
  float r2 = dot(c, c);
  if (r2 > 0.25) discard;
  float s = 1.0 - smoothstep(0.0, 0.5, sqrt(r2));
  float a = s * s;
  // Heating shifts the entire plumage along a blackbody curve toward white-hot molten gold
  float hot = clamp(uHeat, 0.0, 1.4);
  float tone = max(0.0, vTone - hot * 0.28 - vScatter * 0.14);
  vec3 col = mix(vec3(1.0, 0.95, 0.75), vec3(1.0, 0.66, 0.2), smoothstep(0.0, 0.3, tone));
  col = mix(col, vec3(1.0, 0.3, 0.08), smoothstep(0.3, 0.65, tone));
  col = mix(col, vec3(0.85, 0.08, 0.2), smoothstep(0.65, 1.0, tone));
  col = mix(col, vec3(1.0, 0.96, 0.82), clamp(hot * 0.34 + vScatter * 0.18, 0.0, 0.65));
  float gain = 1.7 + hot * 1.1 + vScatter * 0.35;
  gl_FragColor = vec4(col * gain, a * vA * (0.8 + min(hot, 1.0) * 0.14));
}
`;

const ss = THREE.MathUtils.smoothstep;
const h1js = (n: number) => {
  const x = Math.sin(n * 91.345 + 1.7) * 43758.5453;
  return x - Math.floor(x);
};

export function Phoenix({ mobile }: { mobile: boolean }) {
  const points = useRef<THREE.Points>(null);

  const sim = useMemo(() => {
    const q = mobile ? 0.55 : 1;
    const parts: { kind: number; idx: number; n: number; uv: () => [number, number] }[] = [
      { kind: 0, idx: 0, n: 1300, uv: () => [Math.random(), 0] },
      { kind: 1, idx: 0, n: 420, uv: () => [Math.random(), 0] },
      { kind: 2, idx: 0, n: 380, uv: () => [Math.random(), 0] },
      { kind: 3, idx: 0, n: 90, uv: () => [Math.random(), 0] },
      ...[0, 1, 2, 3].map((k) => ({ kind: 4, idx: k, n: 90, uv: (): [number, number] => [Math.random(), 0] })),
      ...[-1, 1].map((s) => ({ kind: 5, idx: s, n: 3800, uv: (): [number, number] => [Math.random(), Math.pow(Math.random(), 1.05)] })),
      ...[0, 1, 2, 3, 4, 5, 6].map((k) => ({ kind: 6, idx: k, n: 560, uv: (): [number, number] => [Math.pow(Math.random(), 0.85), Math.random()] })),
    ];
    const total = parts.reduce((a, p) => a + Math.round(p.n * q), 0);

    const aKind = new Float32Array(total);
    const aIdx = new Float32Array(total);
    const aUV = new Float32Array(total * 2);
    const aRnd = new Float32Array(total * 3);

    // Precomputed zero-trig per-particle rest tables matching the GPU vertex shader
    const bX = new Float32Array(total);
    const bY = new Float32Array(total);
    const bZ = new Float32Array(total);
    const seedPos = new Float32Array(total * 3);

    let staticEnd = 0;
    let crestEnd = 0;
    let wingEnd = 0;

    // First pass: populate attributes and locate contiguous range boundaries
    let idx = 0;
    for (const p of parts) {
      const n = Math.round(p.n * q);
      for (let j = 0; j < n; j++, idx++) {
        aKind[idx] = p.kind;
        aIdx[idx] = p.idx;
        const [u, v] = p.uv();
        aUV[idx * 2] = u;
        aUV[idx * 2 + 1] = v;
        const rx = Math.random();
        const ry = Math.random();
        const rz = Math.random();
        aRnd[idx * 3] = rx;
        aRnd[idx * 3 + 1] = ry;
        aRnd[idx * 3 + 2] = rz;
        seedPos[idx * 3] = (rx - 0.5) * 0.7;
        seedPos[idx * 3 + 1] = (ry - 0.5) * 0.7;
        seedPos[idx * 3 + 2] = (rz - 0.5) * 0.7;
      }
      if (p.kind <= 3) staticEnd = idx;
      else if (p.kind === 4) crestEnd = idx;
      else if (p.kind === 5) wingEnd = idx;
    }

    const crestCount = crestEnd - staticEnd;
    const crestK = new Uint8Array(crestCount);
    const crestS = new Float32Array(crestCount);

    const wingCount = wingEnd - crestEnd;
    const wingFi = new Uint8Array(wingCount);
    const wingSide = new Int8Array(wingCount);

    const tailCount = total - wingEnd;
    const tScaleX = new Float32Array(tailCount);
    const tScaleY = new Float32Array(tailCount);
    const tOffX = new Float32Array(tailCount);
    const tOffY = new Float32Array(tailCount);
    const tSxSin = new Float32Array(tailCount);
    const tSxCos = new Float32Array(tailCount);
    const tSzSin = new Float32Array(tailCount);
    const tSzCos = new Float32Array(tailCount);

    // Precompute exact particle factors (zero sin/cos/pow inside the frame loop)
    for (let i = 0; i < total; i++) {
      const kind = aKind[i];
      const pIdx = aIdx[i];
      const u = aUV[i * 2];
      const v = aUV[i * 2 + 1];
      const rx = aRnd[i * 3];
      const ry = aRnd[i * 3 + 1];
      const rz = aRnd[i * 3 + 2];

      if (kind === 0) {
        const cu = Math.min(1, Math.max(0, u * 0.9 + 0.07));
        const r = 0.27 * Math.pow(Math.max(0, Math.sin(Math.PI * cu)), 0.8);
        const ang = rx * Math.PI * 2;
        const rad = Math.sqrt(ry) * r;
        bX[i] = Math.cos(ang) * rad;
        bY[i] = -0.5 + 1.06 * u;
        bZ[i] = Math.sin(ang) * rad * 0.85;
      } else if (kind === 1) {
        const r = (0.13 - 0.05 * u) * Math.sqrt(ry);
        const ang = rx * Math.PI * 2;
        bX[i] = 0.1 * u * u + Math.cos(ang) * r;
        bY[i] = 0.5 + 0.5 * u;
        bZ[i] = Math.sin(ang) * r;
      } else if (kind === 2) {
        let dx = rx - 0.5;
        let dy = ry - 0.5;
        let dz = rz - 0.5;
        const dl = Math.hypot(dx, dy, dz) || 1;
        const sc = (0.115 * Math.pow(u, 0.33)) / dl;
        dx *= sc;
        dy *= sc;
        dz *= sc;
        bX[i] = 0.12 + dx;
        bY[i] = 1.06 + dy;
        bZ[i] = dz;
      } else if (kind === 3) {
        let dx = rx - 0.5;
        let dy = ry - 0.5;
        let dz = rz - 0.5;
        const dl = Math.hypot(dx, dy, dz) || 1;
        const sc = (0.045 * (1 - u)) / dl;
        bX[i] = 0.2 + 0.23 * u + dx * sc;
        bY[i] = 1.06 - 0.075 * u + dy * sc;
        bZ[i] = dz * sc;
      } else if (kind === 4) {
        const ci = i - staticEnd;
        crestK[ci] = pIdx;
        crestS[ci] = u;
        bX[i] = 0.07 - (0.42 + 0.1 * pIdx) * u + (rx - 0.5) * 0.022;
        bY[i] = 1.15 + (0.3 + 0.08 * pIdx) * u * (1 - 0.45 * u) + (ry - 0.5) * 0.022;
        bZ[i] = (rz - 0.5) * 0.03;
      } else if (kind === 5) {
        const wi = i - crestEnd;
        const N = 15;
        const fi = Math.min(14, Math.floor(u * N));
        const fu = u * N - fi;
        const uc = (fi + 0.5) / N;
        wingFi[wi] = fi;
        wingSide[wi] = pIdx < 0 ? -1 : 1;

        const boneX = 2.25 * uc;
        const boneY = 0.62 * Math.sin(uc * 2.3);
        let tx = 2.25;
        let ty = 1.43 * Math.cos(uc * 2.3);
        const tl = Math.hypot(tx, ty);
        tx /= tl;
        ty /= tl;
        let fx = 0.22 + 0.75 * uc;
        let fy = -1;
        const fl = Math.hypot(fx, fy);
        fx /= fl;
        fy /= fl;
        const L0 = (0.6 + Math.pow(uc, 0.75)) * (1 - 0.35 * Math.pow(uc, 6)) * (0.85 + 0.15 * h1js(fi + pIdx * 7));
        const tw = (fu - 0.5) * (2.25 / N) * (1 - 0.8 * v * v);
        bX[i] = boneX + tx * tw + fx * v * L0;
        bY[i] = boneY + ty * tw + fy * v * L0;
        bZ[i] = -0.3 * uc * uc + 0.12 * v;
      } else {
        const ti = i - wingEnd;
        const k = pIdx;
        const s = u;
        const ac = v * 2 - 1;
        const phi = ((k - 3) / 3) * 0.55;
        const Lk0 = 2.75 - 0.28 * Math.abs(k - 3);
        const sinP = Math.sin(phi);
        const cosP = Math.cos(phi);
        const eye = ss(s, 0.76, 0.9) * (1 - ss(s, 0.93, 1.0));
        const w = 0.025 + 0.045 * Math.sin(Math.PI * s) + 0.1 * eye;
        tScaleX[ti] = sinP * s * Lk0 * 0.9;
        tScaleY[ti] = -cosP * s * Lk0 * 0.95;
        tOffX[ti] = cosP * ac * w;
        tOffY[ti] = -0.42 + sinP * ac * w;
        bZ[i] = -0.4 * s;
        const ax = s * 3.3 + k * 1.3;
        const az = s * 2.6 + k;
        tSxSin[ti] = 0.24 * s * Math.sin(ax);
        tSxCos[ti] = 0.24 * s * Math.cos(ax);
        tSzSin[ti] = 0.18 * s * Math.sin(az);
        tSzCos[ti] = 0.18 * s * Math.cos(az);
      }
    }

    const field = new ParticleSpringField(total, {
      screenRadius: 0.22,
      spring: 10.4,
      damping: 5.15,
      maxDisp: 3.6,
      clickPower: 1.05,
    });

    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(total * 3), 3));
    g.setAttribute('aKind', new THREE.BufferAttribute(aKind, 1));
    g.setAttribute('aIdx', new THREE.BufferAttribute(aIdx, 1));
    g.setAttribute('aUV', new THREE.BufferAttribute(aUV, 2));
    g.setAttribute('aRnd', new THREE.BufferAttribute(aRnd, 3));
    g.setAttribute('aDisp', field.attr);

    const m = new THREE.ShaderMaterial({
      vertexShader: vert,
      fragmentShader: frag,
      transparent: true,
      depthWrite: false,
      depthTest: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uTime: { value: 0 },
        uHatch: { value: 0 },
        uSize: { value: 62 },
        uPR: { value: 1 },
        uHeat: { value: 0 },
      },
    });

    // Small reusable per-frame feather LUTs (zero allocations in useFrame)
    const crestWave = new Float32Array(4);
    const wCos = new Float32Array(15);
    const wSin = new Float32Array(15);
    const wZOff = new Float32Array(15);

    const fillHome = (t: number, h: number) => {
      const eBody = ss(h, 0.38, 0.62);
      const eWing = ss(h, 0.55, 1.0);
      const eTail = ss(h, 0.5, 0.96);
      const riseY = -0.15 + 1.2 * ss(h, 0.42, 0.92) + Math.sin(t * 0.9) * 0.06 * eBody;
      const home = field.home;

      // Static parts: body, neck, head, beak
      for (let i = 0; i < staticEnd; i++) {
        const i3 = i * 3;
        const sx = seedPos[i3];
        const sy = seedPos[i3 + 1];
        const sz = seedPos[i3 + 2];
        home[i3] = sx + (bX[i] - sx) * eBody;
        home[i3 + 1] = sy + (bY[i] - sy) * eBody + riseY;
        home[i3 + 2] = sz + (bZ[i] - sz) * eBody;
      }

      // Crest (4 feathers)
      for (let k = 0; k < 4; k++) crestWave[k] = Math.sin(t * 1.6 + k * 1.3) * 0.035;
      for (let i = staticEnd; i < crestEnd; i++) {
        const i3 = i * 3;
        const ci = i - staticEnd;
        const py = bY[i] + crestWave[crestK[ci]] * crestS[ci];
        const sx = seedPos[i3];
        const sy = seedPos[i3 + 1];
        const sz = seedPos[i3 + 2];
        home[i3] = sx + (bX[i] - sx) * eBody;
        home[i3 + 1] = sy + (py - sy) * eBody + riseY;
        home[i3 + 2] = sz + (bZ[i] - sz) * eBody;
      }

      // Wings (15 feathers — steady normal beat speed)
      const wLen = 0.38 + 0.62 * eWing;
      for (let fi = 0; fi < 15; fi++) {
        const uc = (fi + 0.5) / 15;
        const beat = Math.sin(t * 1.5 - uc * 1.4);
        const a = -1.9 + (0.28 * beat + 2.04) * eWing;
        wCos[fi] = Math.cos(a) * wLen;
        wSin[fi] = Math.sin(a) * wLen;
        wZOff[fi] = -0.25 * beat * uc * eWing;
      }
      for (let i = crestEnd; i < wingEnd; i++) {
        const i3 = i * 3;
        const wi = i - crestEnd;
        const fi = wingFi[wi];
        const c = wCos[fi];
        const s = wSin[fi];
        const x0 = bX[i];
        const y0 = bY[i];
        const px = (x0 * c - y0 * s + 0.2) * wingSide[wi];
        const py = x0 * s + y0 * c + 0.38;
        const pz = bZ[i] + wZOff[fi];
        const sx = seedPos[i3];
        const sy = seedPos[i3 + 1];
        const sz = seedPos[i3 + 2];
        home[i3] = sx + (px - sx) * eBody;
        home[i3 + 1] = sy + (py - sy) * eBody + riseY;
        home[i3 + 2] = sz + (pz - sz) * eBody;
      }

      // Tail (7 long swaying feathers)
      const ct7 = Math.cos(t * 0.7);
      const st7 = Math.sin(t * 0.7);
      const ct5 = Math.cos(t * 0.5);
      const st5 = Math.sin(t * 0.5);
      for (let i = wingEnd; i < total; i++) {
        const i3 = i * 3;
        const ti = i - wingEnd;
        const px = tScaleX[ti] * eTail + tOffX[ti] + tSxSin[ti] * ct7 + tSxCos[ti] * st7;
        const py = tScaleY[ti] * eTail + tOffY[ti];
        const pz = bZ[i] + tSzSin[ti] * ct5 + tSzCos[ti] * st5;
        const sx = seedPos[i3];
        const sy = seedPos[i3 + 1];
        const sz = seedPos[i3 + 2];
        home[i3] = sx + (px - sx) * eBody;
        home[i3 + 1] = sy + (py - sy) * eBody + riseY;
        home[i3 + 2] = sz + (pz - sz) * eBody;
      }
    };

    return { geo: g, mat: m, field, fillHome };
  }, [mobile]);

  useSafeFrame((state, delta) => {
    const visible = S.hatch > 0.34;
    if (points.current) points.current.visible = visible;
    if (!visible) {
      sim.field.reset();
      return;
    }

    const t = state.clock.elapsedTime;
    const h = S.hatch;
    const u = sim.mat.uniforms;
    u.uTime.value = t;
    u.uHatch.value = h;
    u.uPR.value = state.gl.getPixelRatio();
    u.uHeat.value = Math.min(1.6, world.charge + world.burst * 0.85 + S.blind * 1.5);

    if (sim.field.beginStep(0, 0.55, -0.12, 3.85)) {
      sim.fillHome(t, h);
      sim.field.step(delta);
    }
  });

  return <points ref={points} geometry={sim.geo} material={sim.mat} frustumCulled={false} renderOrder={5} />;
}

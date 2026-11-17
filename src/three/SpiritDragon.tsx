import { useMemo, useRef } from 'react';
import { useSafeFrame } from './useSafeFrame';
import * as THREE from 'three';
import { S } from './sceneState';
import { ParticleSpringField } from './particlePhysics';
import { world } from '../store';

/**
 * The winged fire-spirit that orbits the egg.
 * Spine follows a smooth analytic orbit, body is a tapered tube of embers and two
 * wing membranes flap steadily. Pressing & holding heats the creature white-hot
 * without speeding up its orbit or wingbeat. Hovering or clicking parts and scatters
 * its fire particles, which then chase and spring back to rejoin the gliding form.
 */
const vert = /* glsl */ `
attribute float aT;
attribute float aAng;
attribute float aRad;
attribute float aSeed;
attribute float aWing;
attribute vec2 aWuv;
attribute vec3 aDisp;
uniform float uTime;
uniform float uVisible;
uniform float uSize;
uniform float uPR;
uniform float uHeat;
varying float vA;
varying float vT;
varying float vW;
varying float vScatter;

vec3 spine(float s){
  return vec3(3.1 * sin(s) + 0.45 * sin(2.3 * s + 1.3),
              0.7 * sin(1.6 * s + 0.4) + 0.28 * sin(2.9 * s) + 0.35,
              2.3 * cos(s) + 0.5 * cos(1.8 * s + 2.1));
}
float h1(float n){ return fract(sin(n * 91.345) * 43758.5453); }

void main(){
  // Steady, unhurried orbit & wingbeat — unaffected by hold-to-heat
  float head = uTime * 0.3;
  float len = 2.2;
  float isWing = abs(aWing);
  float tBody = mix(aT, 0.13, isWing);
  float s = head - tBody * len;
  vec3 P = spine(s);
  vec3 T = normalize(spine(s + 0.015) - P);
  vec3 Nn = normalize(cross(T, vec3(0.0, 1.0, 0.0)));
  vec3 B = normalize(cross(Nn, T));
  vec3 pos;
  float size;
  if (isWing < 0.5){
    float prof = smoothstep(0.0, 0.07, aT) * (1.0 - 0.9 * smoothstep(0.12, 1.0, aT));
    float r = 0.035 + 0.2 * prof + 0.05 * (1.0 - smoothstep(0.0, 0.03, aT));
    float ang = aAng + aT * 7.0 + uTime * 0.4;
    pos = P + (cos(ang) * Nn + sin(ang) * B) * r * (0.65 + 0.35 * aRad);
    pos += Nn * sin(aT * 11.0 - uTime * 2.2) * 0.14 * aT;
    vec3 jit = vec3(h1(aSeed * 13.1), h1(aSeed * 7.7), h1(aSeed * 3.3)) - 0.5;
    pos += jit * pow(aT, 2.5) * 1.1;
    size = mix(1.5, 0.45, aT);
  } else {
    float span = aWuv.x;
    float chord = aWuv.y;
    float flap = sin(uTime * 2.6 + 0.5);
    float lift = flap * (0.25 + 0.75 * span) * 0.85;
    vec3 outv = Nn * aWing;
    vec3 spanDir = normalize(outv * cos(lift) + B * sin(lift));
    float wl = 1.65;
    float c = (1.0 - pow(span, 1.6)) * 0.95 + 0.06;
    float scallop = 0.1 * abs(sin(span * 15.0));
    pos = P + spanDir * span * wl - T * (span * span * 0.55 + chord * (c - scallop * chord));
    size = 0.75;
  }

  // emerge from the egg: head first, then the body uncoils
  float em = smoothstep(tBody * 0.55, tBody * 0.55 + 0.45, uVisible);
  vec3 jit2 = (vec3(h1(aSeed * 3.7), h1(aSeed * 5.1), h1(aSeed * 9.9)) - 0.5) * 0.4;
  pos = mix(jit2, pos, em);

  // interactive repulsion & spring reformation offset
  float scatter = clamp(length(aDisp) * 1.4, 0.0, 1.0);
  pos += aDisp;

  vec4 mv = modelViewMatrix * vec4(pos, 1.0);
  gl_Position = projectionMatrix * mv;
  float flick = 0.7 + 0.3 * sin(uTime * 9.0 + aSeed * 60.0);
  float baseFade = mix(1.0 - aT * 0.7, 0.55, isWing);
  float outA = em * uVisible * mix(baseFade, max(baseFade, 0.8), scatter * 0.7);
  float grow = 1.0 + uHeat * 0.25 + scatter * 0.18;
  gl_PointSize = outA > 0.003 ? (uSize * size * flick * grow * uPR / max(-mv.z, 0.1)) : 0.0;
  vA = outA;
  vT = tBody;
  vW = isWing;
  vScatter = scatter;
}
`;

const frag = /* glsl */ `
uniform vec3 uHead;
uniform vec3 uBody;
uniform vec3 uTail;
uniform float uHeat;
varying float vA;
varying float vT;
varying float vW;
varying float vScatter;
void main(){
  vec2 c = gl_PointCoord - 0.5;
  float r2 = dot(c, c);
  if (r2 > 0.25) discard;
  float s = 1.0 - smoothstep(0.0, 0.5, sqrt(r2));
  float a = s * s;
  float hot = clamp(uHeat, 0.0, 1.4);
  float tShift = max(0.0, vT - hot * 0.28 - vScatter * 0.14);
  vec3 col = mix(uHead, uBody, smoothstep(0.0, 0.25, tShift));
  col = mix(col, uTail, smoothstep(0.4, 1.0, tShift));
  col = mix(col, mix(uBody * 0.8, uHead, clamp(hot * 0.45, 0.0, 0.65)), vW * 0.5);
  col = mix(col, vec3(1.0, 0.96, 0.82), clamp(hot * 0.36 + vScatter * 0.2, 0.0, 0.68));
  float gain = 2.4 + hot * 1.45 + vScatter * 0.45;
  gl_FragColor = vec4(col * gain, a * vA * (1.0 + min(hot, 1.0) * 0.15));
}
`;

const SPINE_N = 96;
const LIFT_N = 32;
const ss = THREE.MathUtils.smoothstep;
const h1js = (n: number) => {
  const x = Math.sin(n * 91.345) * 43758.5453;
  return x - Math.floor(x);
};

function evalSpine(s: number, out: Float32Array, off: number) {
  out[off] = 3.1 * Math.sin(s) + 0.45 * Math.sin(2.3 * s + 1.3);
  out[off + 1] = 0.7 * Math.sin(1.6 * s + 0.4) + 0.28 * Math.sin(2.9 * s) + 0.35;
  out[off + 2] = 2.3 * Math.cos(s) + 0.5 * Math.cos(1.8 * s + 2.1);
}

export function SpiritDragon({ mobile }: { mobile: boolean }) {
  const points = useRef<THREE.Points>(null);

  const sim = useMemo(() => {
    const BODY = mobile ? 2600 : 5200;
    const WING = mobile ? 900 : 1900;
    const total = BODY + WING * 2;

    const aT = new Float32Array(total);
    const aAng = new Float32Array(total);
    const aRad = new Float32Array(total);
    const aSeed = new Float32Array(total);
    const aWing = new Float32Array(total);
    const aWuv = new Float32Array(total * 2);

    // Precomputed per-particle zero-trig rest factors matching the GPU shader
    const bSpineIdx = new Uint8Array(BODY);
    const bC0 = new Float32Array(BODY);
    const bS0 = new Float32Array(BODY);
    const bSwS = new Float32Array(BODY);
    const bSwC = new Float32Array(BODY);
    const bJit = new Float32Array(BODY * 3);
    const emJit = new Float32Array(total * 3);

    for (let i = 0; i < BODY; i++) {
      const tVal = Math.pow(Math.random(), 1.35);
      const ang = Math.random() * Math.PI * 2;
      const rad = Math.random();
      const seed = Math.random();
      aT[i] = tVal;
      aAng[i] = ang;
      aRad[i] = rad;
      aSeed[i] = seed;
      aWing[i] = 0;

      bSpineIdx[i] = Math.min(SPINE_N - 1, Math.round(tVal * (SPINE_N - 1)));
      const prof = ss(tVal, 0, 0.07) * (1 - 0.9 * ss(tVal, 0.12, 1));
      const r = (0.035 + 0.2 * prof + 0.05 * (1 - ss(tVal, 0, 0.03))) * (0.65 + 0.35 * rad);
      const a0 = ang + tVal * 7;
      bC0[i] = Math.cos(a0) * r;
      bS0[i] = Math.sin(a0) * r;
      const swAmp = 0.14 * tVal;
      bSwS[i] = Math.sin(tVal * 11) * swAmp;
      bSwC[i] = Math.cos(tVal * 11) * swAmp;
      const jScale = Math.pow(tVal, 2.5) * 1.1;
      const i3 = i * 3;
      bJit[i3] = (h1js(seed * 13.1) - 0.5) * jScale;
      bJit[i3 + 1] = (h1js(seed * 7.7) - 0.5) * jScale;
      bJit[i3 + 2] = (h1js(seed * 3.3) - 0.5) * jScale;
      emJit[i3] = (h1js(seed * 3.7) - 0.5) * 0.4;
      emJit[i3 + 1] = (h1js(seed * 5.1) - 0.5) * 0.4;
      emJit[i3 + 2] = (h1js(seed * 9.9) - 0.5) * 0.4;
    }

    const wingTotal = WING * 2;
    const wLiftIdx = new Uint8Array(wingTotal);
    const wSide = new Int8Array(wingTotal);
    const wSpanLen = new Float32Array(wingTotal);
    const wBack = new Float32Array(wingTotal);

    let k = BODY;
    for (const side of [-1, 1]) {
      for (let j = 0; j < WING; j++, k++) {
        const span = Math.pow(Math.random(), 0.8);
        const chord = j < WING * 0.3 ? Math.random() * 0.08 : Math.random();
        const seed = Math.random();
        aWuv[k * 2] = span;
        aWuv[k * 2 + 1] = chord;
        aWing[k] = side;
        aT[k] = 0.13;
        aSeed[k] = seed;
        aRad[k] = Math.random();
        aAng[k] = 0;

        const wi = k - BODY;
        wLiftIdx[wi] = Math.min(LIFT_N - 1, Math.round(span * (LIFT_N - 1)));
        wSide[wi] = side;
        wSpanLen[wi] = span * 1.65;
        const c = (1 - Math.pow(span, 1.6)) * 0.95 + 0.06;
        const scallop = 0.1 * Math.abs(Math.sin(span * 15));
        wBack[wi] = span * span * 0.55 + chord * (c - scallop * chord);
        const k3 = k * 3;
        emJit[k3] = (h1js(seed * 3.7) - 0.5) * 0.4;
        emJit[k3 + 1] = (h1js(seed * 5.1) - 0.5) * 0.4;
        emJit[k3 + 2] = (h1js(seed * 9.9) - 0.5) * 0.4;
      }
    }

    const field = new ParticleSpringField(total, {
      screenRadius: 0.23,
      spring: 10.2,
      damping: 5.05,
      maxDisp: 3.6,
      clickPower: 1.08,
    });

    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(total * 3), 3));
    g.setAttribute('aT', new THREE.BufferAttribute(aT, 1));
    g.setAttribute('aAng', new THREE.BufferAttribute(aAng, 1));
    g.setAttribute('aRad', new THREE.BufferAttribute(aRad, 1));
    g.setAttribute('aSeed', new THREE.BufferAttribute(aSeed, 1));
    g.setAttribute('aWing', new THREE.BufferAttribute(aWing, 1));
    g.setAttribute('aWuv', new THREE.BufferAttribute(aWuv, 2));
    g.setAttribute('aDisp', field.attr);

    const m = new THREE.ShaderMaterial({
      vertexShader: vert,
      fragmentShader: frag,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uTime: { value: 0 },
        uVisible: { value: 0 },
        uSize: { value: 30 },
        uPR: { value: 1 },
        uHeat: { value: 0 },
        uHead: { value: new THREE.Color('#fff0c2') },
        uBody: { value: new THREE.Color('#ff7a26') },
        uTail: { value: new THREE.Color('#ff2a3d') },
      },
    });

    // Scratch buffers for spine Frenet frames (P, Nn, B = 9 floats per sample) and wing lift LUT
    const spineFrames = new Float32Array(SPINE_N * 9);
    const spineEm = new Float32Array(SPINE_N);
    const tmpP = new Float32Array(6);
    const liftCos = new Float32Array(LIFT_N);
    const liftSin = new Float32Array(LIFT_N);

    const fillHome = (t: number, vis: number) => {
      const head = t * 0.3;
      const len = 2.2;
      const home = field.home;

      // Build 96-entry spine frame table once
      for (let si = 0; si < SPINE_N; si++) {
        const u = si / (SPINE_N - 1);
        const s = head - u * len;
        evalSpine(s, tmpP, 0);
        evalSpine(s + 0.015, tmpP, 3);
        let tx = tmpP[3] - tmpP[0];
        let ty = tmpP[4] - tmpP[1];
        let tz = tmpP[5] - tmpP[2];
        const tl = Math.hypot(tx, ty, tz) || 1;
        tx /= tl;
        ty /= tl;
        tz /= tl;
        // Nn = normalize(cross(T, (0,1,0))) = normalize((-tz, 0, tx))
        let nx = -tz;
        let nz = tx;
        const nl = Math.hypot(nx, nz) || 1;
        nx /= nl;
        nz /= nl;
        // B = cross(Nn, T) (already unit length since Nn ⊥ T)
        const bx = -nz * ty;
        const by = nz * tx - nx * tz;
        const bz = nx * ty;
        const f9 = si * 9;
        spineFrames[f9] = tmpP[0];
        spineFrames[f9 + 1] = tmpP[1];
        spineFrames[f9 + 2] = tmpP[2];
        spineFrames[f9 + 3] = nx;
        spineFrames[f9 + 4] = 0;
        spineFrames[f9 + 5] = nz;
        spineFrames[f9 + 6] = bx;
        spineFrames[f9 + 7] = by;
        spineFrames[f9 + 8] = bz;
        spineEm[si] = ss(vis, u * 0.55, u * 0.55 + 0.45);
      }

      // Body particles
      const ct4 = Math.cos(t * 0.4);
      const st4 = Math.sin(t * 0.4);
      const ct22 = Math.cos(t * 2.2);
      const st22 = Math.sin(t * 2.2);

      for (let i = 0; i < BODY; i++) {
        const i3 = i * 3;
        const si = bSpineIdx[i];
        const f9 = si * 9;
        const em = spineEm[si];
        const c0 = bC0[i];
        const s0 = bS0[i];
        // cos(a0 + t*0.4), sin(a0 + t*0.4)
        const nAmp = c0 * ct4 - s0 * st4 + (bSwS[i] * ct22 - bSwC[i] * st22);
        const bAmp = s0 * ct4 + c0 * st4;
        const px = spineFrames[f9] + spineFrames[f9 + 3] * nAmp + spineFrames[f9 + 6] * bAmp + bJit[i3];
        const py = spineFrames[f9 + 1] + spineFrames[f9 + 7] * bAmp + bJit[i3 + 1];
        const pz = spineFrames[f9 + 2] + spineFrames[f9 + 5] * nAmp + spineFrames[f9 + 8] * bAmp + bJit[i3 + 2];
        const ex = emJit[i3];
        const ey = emJit[i3 + 1];
        const ez = emJit[i3 + 2];
        home[i3] = ex + (px - ex) * em;
        home[i3 + 1] = ey + (py - ey) * em;
        home[i3 + 2] = ez + (pz - ez) * em;
      }

      // Wing anchor frame at exact tBody = 0.13
      const ws = head - 0.13 * len;
      evalSpine(ws, tmpP, 0);
      evalSpine(ws + 0.015, tmpP, 3);
      let wtx = tmpP[3] - tmpP[0];
      let wty = tmpP[4] - tmpP[1];
      let wtz = tmpP[5] - tmpP[2];
      const wtl = Math.hypot(wtx, wty, wtz) || 1;
      wtx /= wtl;
      wty /= wtl;
      wtz /= wtl;
      let wnx = -wtz;
      let wnz = wtx;
      const wnl = Math.hypot(wnx, wnz) || 1;
      wnx /= wnl;
      wnz /= wnl;
      const wbx = -wnz * wty;
      const wby = wnz * wtx - wnx * wtz;
      const wbz = wnx * wty;
      const wpx = tmpP[0];
      const wpy = tmpP[1];
      const wpz = tmpP[2];
      const wEm = ss(vis, 0.13 * 0.55, 0.13 * 0.55 + 0.45);

      const flap = Math.sin(t * 2.6 + 0.5);
      for (let li = 0; li < LIFT_N; li++) {
        const span = li / (LIFT_N - 1);
        const lift = flap * (0.25 + 0.75 * span) * 0.85;
        liftCos[li] = Math.cos(lift);
        liftSin[li] = Math.sin(lift);
      }

      for (let i = BODY; i < total; i++) {
        const i3 = i * 3;
        const wi = i - BODY;
        const li = wLiftIdx[wi];
        const sideC = liftCos[li] * wSide[wi];
        const sl = liftSin[li];
        const spL = wSpanLen[wi];
        const bk = wBack[wi];
        // outv (Nn * side) and B are orthonormal, so outv*cos(lift) + B*sin(lift) is already unit length
        const px = wpx + (wnx * sideC + wbx * sl) * spL - wtx * bk;
        const py = wpy + wby * sl * spL - wty * bk;
        const pz = wpz + (wnz * sideC + wbz * sl) * spL - wtz * bk;
        const ex = emJit[i3];
        const ey = emJit[i3 + 1];
        const ez = emJit[i3 + 2];
        home[i3] = ex + (px - ex) * wEm;
        home[i3 + 1] = ey + (py - ey) * wEm;
        home[i3 + 2] = ez + (pz - ez) * wEm;
      }
    };

    return { geo: g, mat: m, field, fillHome };
  }, [mobile]);

  useSafeFrame((state, delta) => {
    // at the very end the fire spirit spirals back into the egg — and comes out as the phoenix
    const vis = S.dragon * (1 - ss(S.hatch, 0.05, 0.45));
    const visible = vis > 0.004;
    if (points.current) points.current.visible = visible;
    if (!visible) {
      sim.field.reset();
      return;
    }

    const t = state.clock.elapsedTime;
    const u = sim.mat.uniforms;
    u.uTime.value = t;
    u.uVisible.value = vis;
    u.uPR.value = state.gl.getPixelRatio();
    u.uHeat.value = Math.min(1.6, world.charge + world.burst * 0.85 + S.blind * 1.5);

    if (sim.field.beginStep(0, 0.35, 0, 5.2)) {
      sim.fillHome(t, vis);
      sim.field.step(delta);
    }
  });

  return <points ref={points} geometry={sim.geo} material={sim.mat} frustumCulled={false} />;
}

import { useMemo, useRef } from 'react';
import { useSafeFrame } from './useSafeFrame';
import * as THREE from 'three';
import { S } from './sceneState';
import { ParticleSpringField } from './particlePhysics';
import { world } from '../store';

const ADD = { transparent: true, depthWrite: false, blending: THREE.AdditiveBlending } as const;

/* ------------------------------------------------------------------ */
/* Prologue / Chronicle — ice motes slowly circling the frozen egg     */
/* ------------------------------------------------------------------ */
const vortexVert = /* glsl */ `
attribute vec4 aRnd;
attribute vec3 aDisp;
uniform float uTime;
uniform float uVis;
uniform float uPR;
varying float vA;
void main(){
  float r = 1.3 + aRnd.x * 1.6;
  float ang = aRnd.y * 6.28318 + uTime * (0.42 / (0.6 + aRnd.x));
  float y = (aRnd.z - 0.5) * 2.8 + sin(uTime * 0.4 + aRnd.w * 6.28318) * 0.22;
  vec3 p = vec3(cos(ang) * r, y, sin(ang) * r) * mix(0.4, 1.0, uVis) + aDisp;
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  gl_Position = projectionMatrix * mv;
  float s = 0.5 + 0.5 * sin(uTime * (1.6 + aRnd.w * 2.6) + aRnd.z * 40.0);
  float tw = s * s * s;
  gl_PointSize = 22.0 * (0.4 + aRnd.w) * uPR / max(-mv.z, 0.1);
  vA = uVis * (0.2 + 0.8 * tw);
}
`;
const softFrag = /* glsl */ `
uniform vec3 uCol;
uniform vec3 uWarm;
uniform float uCharge;
varying float vA;
void main(){
  vec2 c = gl_PointCoord - 0.5;
  float r2 = dot(c, c);
  if (r2 > 0.25) discard;
  float a = 1.0 - smoothstep(0.0, 0.5, sqrt(r2));
  a *= a;
  vec3 col = mix(uCol, uWarm, clamp(uCharge * 0.65, 0.0, 1.0));
  gl_FragColor = vec4(col * (1.6 + uCharge * 0.5), a * vA);
}
`;

export function FrostVortex({ count }: { count: number }) {
  const ref = useRef<THREE.Points>(null);
  const { geo, mat, rnd, field } = useMemo(() => {
    const r = new Float32Array(count * 4);
    for (let i = 0; i < r.length; i++) r[i] = Math.random();
    const f = new ParticleSpringField(count, { screenRadius: 0.2, spring: 9.2, damping: 4.9, maxDisp: 3.0 });
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(count * 3), 3));
    g.setAttribute('aRnd', new THREE.BufferAttribute(r, 4));
    g.setAttribute('aDisp', f.attr);
    const m = new THREE.ShaderMaterial({
      ...ADD,
      vertexShader: vortexVert,
      fragmentShader: softFrag,
      uniforms: {
        uTime: { value: 0 },
        uVis: { value: 0 },
        uPR: { value: 1 },
        uCharge: { value: 0 },
        uCol: { value: new THREE.Color('#cfefff') },
        uWarm: { value: new THREE.Color('#ffd39a') },
      },
    });
    return { geo: g, mat: m, rnd: r, field: f };
  }, [count]);
  useSafeFrame((state, delta) => {
    const visible = S.vortex > 0.01;
    if (ref.current) ref.current.visible = visible;
    if (!visible) {
      field.reset();
      return;
    }
    const t = state.clock.elapsedTime;
    const vis = S.vortex * S.intro;
    const u = mat.uniforms;
    u.uTime.value = t;
    u.uVis.value = vis;
    u.uPR.value = state.gl.getPixelRatio();
    u.uCharge.value = world.charge + world.burst * 0.5;
    if (field.beginStep(0, 0, 0, 3.2, 'relic')) {
      const sc = 0.4 + 0.6 * vis;
      const home = field.home;
      for (let i = 0; i < count; i++) {
        const i4 = i * 4;
        const rx = rnd[i4];
        const r = (1.3 + rx * 1.6) * sc;
        const ang = rnd[i4 + 1] * 6.28318 + t * (0.42 / (0.6 + rx));
        const y = ((rnd[i4 + 2] - 0.5) * 2.8 + Math.sin(t * 0.4 + rnd[i4 + 3] * 6.28318) * 0.22) * sc;
        const i3 = i * 3;
        home[i3] = Math.cos(ang) * r;
        home[i3 + 1] = y;
        home[i3 + 2] = Math.sin(ang) * r;
      }
      field.step(delta);
    }
  });
  return <points ref={ref} geometry={geo} material={mat} frustumCulled={false} />;
}

/* ------------------------------------------------------------------ */
/* Houses — three spirits (web · seo · marketing) orbit the egg        */
/* ------------------------------------------------------------------ */
const orbVert = /* glsl */ `
attribute float aOrb;
attribute float aLag;
attribute float aSeed;
attribute vec3 aDisp;
uniform float uTime;
uniform float uReveal;
uniform float uPR;
varying float vA;
varying float vOrb;
varying float vHead;
vec2 rot(vec2 p, float a){ float c = cos(a); float s = sin(a); return vec2(p.x * c - p.y * s, p.x * s + p.y * c); }
void main(){
  float i = aOrb;
  float ang = uTime * (0.6 + i * 0.14) + i * 2.094 - aLag * 1.7;
  float r = (1.7 + i * 0.28) * mix(0.15, 1.0, uReveal);
  vec3 p = vec3(cos(ang) * r, 0.0, sin(ang) * r);
  p.yz = rot(p.yz, 0.55 - i * 0.5);
  p.xy = rot(p.xy, -0.35 + i * 0.4);
  p += (vec3(fract(aSeed * 13.7), fract(aSeed * 71.3), fract(aSeed * 31.9)) - 0.5) * 0.09 * aLag;
  p += aDisp;
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  gl_Position = projectionMatrix * mv;
  float head = 1.0 - step(0.0001, aLag);
  float size = mix(52.0 * (1.0 - aLag * 0.85), 190.0, head);
  gl_PointSize = size * uPR / max(-mv.z, 0.1);
  float il = 1.0 - aLag;
  vA = uReveal * mix(il * il * 0.55, 1.0, head);
  vOrb = i;
  vHead = head;
}
`;
const orbFrag = /* glsl */ `
varying float vA;
varying float vOrb;
varying float vHead;
void main(){
  vec2 c = gl_PointCoord - 0.5;
  float d2 = dot(c, c);
  if (d2 > 0.25) discard;
  float a = exp(-d2 * 26.0) * 0.75 + exp(-d2 * 260.0) * vHead;
  a *= smoothstep(0.5, 0.35, sqrt(d2));
  vec3 col = vOrb < 0.5 ? vec3(0.45, 0.85, 1.0) : (vOrb < 1.5 ? vec3(1.0, 0.8, 0.4) : vec3(1.0, 0.36, 0.5));
  gl_FragColor = vec4(col * 1.8, a * vA);
}
`;

export function HouseOrbs() {
  const ref = useRef<THREE.Points>(null);
  const { geo, mat, aOrb, aLag, field } = useMemo(() => {
    const TRAIL = 70;
    const total = 3 * TRAIL;
    const orb = new Float32Array(total);
    const lag = new Float32Array(total);
    const aSeed = new Float32Array(total);
    for (let o = 0; o < 3; o++)
      for (let j = 0; j < TRAIL; j++) {
        const i = o * TRAIL + j;
        orb[i] = o;
        lag[i] = j / (TRAIL - 1);
        aSeed[i] = Math.random();
      }
    const f = new ParticleSpringField(total, { screenRadius: 0.2, spring: 10.0, damping: 5.0, maxDisp: 3.0 });
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(total * 3), 3));
    g.setAttribute('aOrb', new THREE.BufferAttribute(orb, 1));
    g.setAttribute('aLag', new THREE.BufferAttribute(lag, 1));
    g.setAttribute('aSeed', new THREE.BufferAttribute(aSeed, 1));
    g.setAttribute('aDisp', f.attr);
    const m = new THREE.ShaderMaterial({
      ...ADD,
      vertexShader: orbVert,
      fragmentShader: orbFrag,
      uniforms: { uTime: { value: 0 }, uReveal: { value: 0 }, uPR: { value: 1 } },
    });
    return { geo: g, mat: m, aOrb: orb, aLag: lag, field: f };
  }, []);
  useSafeFrame((state, delta) => {
    const vis = S.orbs > 0.01;
    if (ref.current) ref.current.visible = vis;
    if (!vis) {
      field.reset();
      return;
    }
    const t = state.clock.elapsedTime;
    const rev = S.orbs;
    const u = mat.uniforms;
    u.uTime.value = t;
    u.uReveal.value = rev;
    u.uPR.value = state.gl.getPixelRatio();
    if (field.beginStep(0, 0, 0, 2.5, 'relic')) {
      const sc = 0.15 + 0.85 * rev;
      const home = field.home;
      for (let idx = 0; idx < field.count; idx++) {
        const o = aOrb[idx];
        const ang = t * (0.6 + o * 0.14) + o * 2.094 - aLag[idx] * 1.7;
        const r = (1.7 + o * 0.28) * sc;
        let x = Math.cos(ang) * r;
        const z0 = Math.sin(ang) * r;
        const a1 = 0.55 - o * 0.5;
        let y = -z0 * Math.sin(a1);
        const z = z0 * Math.cos(a1);
        const a2 = -0.35 + o * 0.4;
        const c2 = Math.cos(a2);
        const s2 = Math.sin(a2);
        const nx = x * c2 - y * s2;
        y = x * s2 + y * c2;
        x = nx;
        const i3 = idx * 3;
        home[i3] = x;
        home[i3 + 1] = y;
        home[i3 + 2] = z;
      }
      field.step(delta);
    }
  });
  return <points ref={ref} geometry={geo} material={mat} frustumCulled={false} />;
}

/* ------------------------------------------------------------------ */
/* Campaigns — three banners unfurl and wave in the wind               */
/* ------------------------------------------------------------------ */
const bannerVert = /* glsl */ `
uniform float uTime;
uniform float uReveal;
uniform float uIndex;
uniform vec3 uCursor;
uniform float uPull;
varying vec2 vUv;
varying vec3 vW;
void main(){
  vUv = uv;
  vec3 p = position;
  float hang = 1.0 - uv.y;
  float r = clamp(uReveal * 2.4 - uIndex * 0.45, 0.0, 1.0);
  r = r * r * (3.0 - 2.0 * r);
  p.y *= r;
  float w = hang * hang;
  p.z += sin(p.x * 2.4 + uTime * 1.25 + uIndex * 2.0 + hang * 3.2) * 0.2 * w + sin(uTime * 0.6 + uIndex * 1.7) * 0.28 * hang;
  p.x += sin(uTime * 0.85 + hang * 2.6 + uIndex) * 0.1 * w;
  vec4 wp = modelMatrix * vec4(p, 1.0);
  vec2 d = wp.xz - uCursor.xz;
  float dist = length(d);
  float flee = (1.0 - smoothstep(0.4, 3.6, dist)) * uPull * hang;
  p.x += d.x / max(dist, 0.001) * flee * 0.85;
  p.z += d.y / max(dist, 0.001) * flee * 0.55;
  wp = modelMatrix * vec4(p, 1.0);
  vW = wp.xyz;
  gl_Position = projectionMatrix * viewMatrix * wp;
}
`;
const bannerFrag = /* glsl */ `
uniform float uReveal;
uniform float uIndex;
uniform float uHeat;
uniform vec3 uCloth;
uniform vec3 uGold;
varying vec2 vUv;
varying vec3 vW;
void main(){
  // swallow-tail cut at the bottom
  if (vUv.y < 0.13 * (1.0 - abs(vUv.x - 0.5) * 2.0)) discard;
  vec3 n = normalize(cross(dFdx(vW), dFdy(vW)));
  float fold = 0.45 + 0.55 * abs(n.z);
  float weave = 0.92 + 0.08 * sin(vUv.x * 160.0) * sin(vUv.y * 420.0);
  vec3 col = uCloth * fold * weave;
  // gold trim
  float bx = min(vUv.x, 1.0 - vUv.x);
  float trim = smoothstep(0.07, 0.055, bx) * smoothstep(0.03, 0.045, bx) + smoothstep(0.975, 0.985, vUv.y);
  // emblem: a ring with a flame-drop inside
  vec2 e = (vUv - vec2(0.5, 0.62)) * vec2(1.0, 3.4);
  float ring = smoothstep(0.03, 0.0, abs(length(e) - 0.29));
  vec2 dp = e - vec2(0.0, -0.04);
  float drop = smoothstep(0.02, 0.0, length(vec2(dp.x * (1.35 + dp.y * 3.2), dp.y)) - 0.13);
  float emblem = max(ring, drop);
  col += uGold * (trim * 0.7 + emblem * (1.2 + uHeat * 0.6));
  float r = clamp(uReveal * 2.4 - uIndex * 0.45, 0.0, 1.0);
  float edgeFade = smoothstep(0.0, 0.04, bx);
  gl_FragColor = vec4(col, 0.9 * r * edgeFade);
  #include <colorspace_fragment>
}
`;

const BANNERS: { x: number; z: number; cloth: string }[] = [
  { x: 1.5, z: -3.4, cloth: '#1d3d66' },
  { x: 3.15, z: -4.0, cloth: '#6e1a24' },
  { x: 4.8, z: -3.2, cloth: '#5f4a17' },
];

export function Banners() {
  const group = useRef<THREE.Group>(null);
  const geo = useMemo(() => {
    const g = new THREE.PlaneGeometry(1.05, 3.5, 18, 40);
    g.translate(0, -1.75, 0); // hang from the top edge
    return g;
  }, []);
  const mats = useMemo(
    () =>
      BANNERS.map(
        (b, i) =>
          new THREE.ShaderMaterial({
            vertexShader: bannerVert,
            fragmentShader: bannerFrag,
            transparent: true,
            depthWrite: false,
            side: THREE.DoubleSide,
            uniforms: {
              uTime: { value: 0 },
              uReveal: { value: 0 },
              uIndex: { value: i },
              uHeat: { value: 0 },
              uCursor: { value: new THREE.Vector3() },
              uPull: { value: 0 },
              uCloth: { value: new THREE.Color(b.cloth) },
              uGold: { value: new THREE.Color('#ffcf7a') },
            },
          })
      ),
    []
  );
  useSafeFrame((state) => {
    const vis = S.banners > 0.01;
    const g = group.current;
    if (g) {
      g.visible = vis;
      if (!vis) return;
      // mirror for right-to-left layouts; centre on narrow screens
      g.scale.x = world.rtl ? -1 : 1;
      g.position.x = S.mobile ? (world.rtl ? 3.15 : -3.15) : 0;
      g.position.y = S.mobile ? 4.4 : 3.0;
    } else if (!vis) return;
    const t = state.clock.elapsedTime;
    const h = Math.min(1, S.heat + world.charge * 0.4);
    for (let i = 0; i < mats.length; i++) {
      const u = mats[i].uniforms;
      u.uTime.value = t;
      u.uReveal.value = S.banners;
      u.uHeat.value = h;
      u.uCursor.value.copy(S.mouse);
      u.uPull.value = S.rayActive ? 1 : 0;
    }
  });
  return (
    <group ref={group}>
      {BANNERS.map((b, i) => (
        <mesh key={i} geometry={geo} material={mats[i]} position={[b.x, 0, b.z]} frustumCulled={false} />
      ))}
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* Strongholds — six beacon fires are lit along the horizon            */
/* ------------------------------------------------------------------ */
const beaconVert = /* glsl */ `
attribute float aIndex;
uniform float uTime;
uniform float uReveal;
uniform float uPR;
uniform float uPointer;
varying float vA;
void main(){
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  gl_Position = projectionMatrix * mv;
  float r = clamp(uReveal * 7.0 - aIndex, 0.0, 1.0);
  float fl = 0.72 + 0.28 * sin(uTime * 7.0 + aIndex * 3.1) * sin(uTime * 4.3 + aIndex);
  float side = clamp(position.x / 11.0, -1.0, 1.0);
  float near = 1.0 - smoothstep(0.08, 0.72, abs(side - uPointer));
  fl *= 0.8 + near * 0.75;
  gl_PointSize = (2500.0 + 500.0 * fl) * r * (1.0 + near * 0.5) * uPR / max(-mv.z, 0.1);
  vA = r * fl;
}
`;
const beaconFrag = /* glsl */ `
varying float vA;
void main(){
  vec2 c = gl_PointCoord - 0.5;
  // a soft flame: wide glow, bright core, stretched upward
  float d = length(vec2(c.x * 1.5, c.y + 0.06));
  float glow = exp(-d * d * 16.0) * 0.55 * smoothstep(0.5, 0.3, length(c));
  float core = exp(-pow(length(vec2(c.x * 3.0, (c.y + 0.02) * 1.4)), 2.0) * 70.0);
  vec3 col = vec3(1.0, 0.42, 0.1) * glow + vec3(1.0, 0.85, 0.55) * core;
  gl_FragColor = vec4(col * 1.7, (glow + core) * vA);
}
`;

export function Beacons() {
  const ref = useRef<THREE.Points>(null);
  const { geo, mat } = useMemo(() => {
    const xs = [-10.6, -6.4, -2.7, 2.7, 6.4, 10.6];
    const zs = [-15, -19, -22, -22, -19, -15];
    const ys = [-0.95, -0.6, -0.3, -0.3, -0.6, -0.95];
    // light them from the centre outwards
    const order = [4, 2, 0, 1, 3, 5];
    const pos = new Float32Array(18);
    const idx = new Float32Array(6);
    xs.forEach((x, i) => {
      pos[i * 3] = x;
      pos[i * 3 + 1] = ys[i];
      pos[i * 3 + 2] = zs[i];
      idx[i] = order[i];
    });
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    g.setAttribute('aIndex', new THREE.BufferAttribute(idx, 1));
    const m = new THREE.ShaderMaterial({
      ...ADD,
        vertexShader: beaconVert,
        fragmentShader: beaconFrag,
        // uPointer is read by the vertex shader and written every frame — it must exist here,
        // otherwise the assignment below throws and the whole render loop dies.
        uniforms: { uTime: { value: 0 }, uReveal: { value: 0 }, uPR: { value: 1 }, uPointer: { value: 0 } },
      });
    return { geo: g, mat: m };
  }, []);
  useSafeFrame((state) => {
    const vis = S.beacons > 0.01;
    if (ref.current) ref.current.visible = vis;
    if (!vis) return;
    const u = mat.uniforms;
    u.uTime.value = state.clock.elapsedTime;
    u.uReveal.value = S.beacons;
    u.uPR.value = state.gl.getPixelRatio();
    u.uPointer.value = S.rayActive ? world.pointer.x : 0;
  });
  return <points ref={ref} geometry={geo} material={mat} frustumCulled={false} />;
}

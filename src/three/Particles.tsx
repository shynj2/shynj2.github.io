import { useMemo, useRef } from 'react';
import { useSafeFrame } from './useSafeFrame';
import * as THREE from 'three';
import { S } from './sceneState';
import { world } from '../store';

function useBoxGeometry(count: number, box: [number, number, number]) {
  return useMemo(() => {
    const pos = new Float32Array(count * 3);
    const rnd = new Float32Array(count * 4);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * box[0];
      pos[i * 3 + 1] = (Math.random() - 0.5) * box[1];
      pos[i * 3 + 2] = (Math.random() - 0.5) * box[2];
      rnd[i * 4] = Math.random();
      rnd[i * 4 + 1] = Math.random();
      rnd[i * 4 + 2] = Math.random();
      rnd[i * 4 + 3] = Math.random();
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    g.setAttribute('aRnd', new THREE.BufferAttribute(rnd, 4));
    return g;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [count]);
}

/* ---------------- Snow (turns to ash as the realm burns) ---------------- */
const snowVert = /* glsl */ `
attribute vec4 aRnd;
uniform float uTime;
uniform float uSize;
uniform float uPR;
uniform float uOpacity;
uniform float uPetal;
uniform vec3 uMouse;
uniform vec3 uBox;
uniform float uStir;
varying float vA;
varying float vSpin;
void main(){
  vec3 p = position;
  float sp = 0.16 + aRnd.x * 0.3;
  p.y = mod(p.y - uTime * sp + uBox.y * 0.5, uBox.y) - uBox.y * 0.5;
  p.x = mod(p.x + uTime * 0.1 + uBox.x * 0.5, uBox.x) - uBox.x * 0.5;
  p.x += sin(uTime * (0.25 + aRnd.y * 0.4) + aRnd.z * 6.28318) * (0.45 + uStir * 0.9);
  p.z += cos(uTime * (0.2 + aRnd.w * 0.3) + aRnd.y * 6.28318) * 0.35;
  vec4 w = modelMatrix * vec4(p, 1.0);
  vec2 dm = w.xy - uMouse.xy;
  float md = length(dm);
  float push = (1.0 - smoothstep(0.0, 2.15, md)) * (1.0 - smoothstep(0.0, 3.5, abs(w.z - uMouse.z)));
  w.xy += normalize(dm + 1e-5) * push * 1.15;
  vec4 mv = viewMatrix * w;
  gl_Position = projectionMatrix * mv;
  float depth = -mv.z;
  float edgeFade = 1.0 - smoothstep(uBox.y * 0.38, uBox.y * 0.5, abs(p.y));
  float outA = uOpacity * edgeFade * smoothstep(0.6, 2.4, depth) * (0.35 + 0.65 * aRnd.z);
  gl_PointSize = outA > 0.003 ? (uSize * (0.35 + aRnd.y * 0.9) * (1.0 + uPetal * 1.5) * uPR / max(depth, 0.1)) : 0.0;
  vA = outA;
  vSpin = aRnd.w * 6.28318 + uTime * (0.4 + aRnd.x) * uPetal;
}
`;

const snowFrag = /* glsl */ `
uniform vec3 uColor;
uniform float uPetal;
varying float vA;
varying float vSpin;
void main(){
  vec2 c = gl_PointCoord - 0.5;
  float r2 = dot(c, c);
  if (r2 > 0.25) discard;
  float soft = 1.0 - smoothstep(0.0, 0.5, sqrt(r2));
  soft *= soft;
  float a = soft;
  if (uPetal > 0.002) {
    // blossom: each flake becomes a small tumbling petal
    float cs = cos(vSpin);
    float sn = sin(vSpin);
    vec2 q = vec2(c.x * cs - c.y * sn, c.x * sn + c.y * cs);
    q.y *= 1.0 + uPetal * 1.3;
    float petal = smoothstep(0.42, 0.28, length(q));
    a = mix(soft, petal * 0.85, uPetal);
  }
  gl_FragColor = vec4(uColor, a * vA);
}
`;

export function Snow({ count }: { count: number }) {
  const box: [number, number, number] = [26, 14, 22];
  const geo = useBoxGeometry(count, box);
  const ice = useMemo(() => new THREE.Color('#d2ecff'), []);
  const ash = useMemo(() => new THREE.Color('#a38b7c'), []);
  const blossom = useMemo(() => new THREE.Color('#ffb3c7'), []);
  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: snowVert,
        fragmentShader: snowFrag,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        uniforms: {
          uTime: { value: 0 },
          uSize: { value: 40 },
          uPR: { value: 1 },
          uOpacity: { value: 1 },
          uPetal: { value: 0 },
          uMouse: { value: new THREE.Vector3() },
          uBox: { value: new THREE.Vector3(...box) },
          uStir: { value: 0 },
          uColor: { value: new THREE.Color('#d2ecff') },
        },
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );
  useSafeFrame((state) => {
    const u = mat.uniforms;
    u.uTime.value = state.clock.elapsedTime;
    u.uPR.value = state.gl.getPixelRatio();
    const h = Math.min(1, S.heat);
    u.uOpacity.value = Math.max(0.95 - h * 0.5, S.petals * 0.9) * (0.35 + 0.65 * S.intro);
    u.uColor.value.copy(ice).lerp(ash, THREE.MathUtils.smoothstep(h, 0.25, 0.85)).lerp(blossom, S.petals);
    u.uPetal.value = S.petals;
    u.uStir.value = S.stir;
    u.uMouse.value.copy(S.mouse);
  });
  return <points geometry={geo} material={mat} position={[0, 1, -4]} frustumCulled={false} />;
}

/* ---------------- Embers (rise, swirl, burst on Dracarys) ---------------- */
const emberVert = /* glsl */ `
attribute vec4 aRnd;
uniform float uTime;
uniform float uSpin;
uniform float uSize;
uniform float uPR;
uniform float uOpacity;
uniform float uCharge;
uniform float uBurst;
uniform vec3 uCenter;
uniform vec3 uBox;
varying float vA;
varying float vT;
void main(){
  vec3 p = position;
  float sp = 0.25 + aRnd.x * 0.6;
  p.y = mod(p.y + uTime * sp + uBox.y * 0.5, uBox.y) - uBox.y * 0.5;
  vec2 rel = p.xz;
  float r = length(rel);
  float ang = uSpin * (0.05 + 0.25 / (1.0 + r));
  float cs = cos(ang);
  float sn = sin(ang);
  rel = mat2(cs, -sn, sn, cs) * rel;
  rel *= 1.0 - uCharge * 0.32 * (1.0 - smoothstep(1.0, 8.0, r));
  p.xz = rel;
  p.x += sin(uTime * 1.3 + aRnd.z * 20.0 + p.y) * 0.18;
  p.z += cos(uTime * 1.1 + aRnd.w * 20.0 + p.y) * 0.18;
  vec3 wp = (modelMatrix * vec4(p, 1.0)).xyz;
  vec3 dir = wp - uCenter;
  wp += normalize(dir + 1e-4) * uBurst * (1.2 + aRnd.x * 2.8);
  vec4 mv = viewMatrix * vec4(wp, 1.0);
  gl_Position = projectionMatrix * mv;
  float flick = 0.6 + 0.4 * sin(uTime * (6.0 + aRnd.w * 8.0) + aRnd.z * 30.0);
  float depth = -mv.z;
  float life = (p.y + uBox.y * 0.5) / uBox.y;
  float outA = uOpacity * smoothstep(0.0, 0.15, life) * (1.0 - smoothstep(0.6, 1.0, life)) * smoothstep(0.5, 2.0, depth) * flick;
  gl_PointSize = outA > 0.003 ? (uSize * (0.3 + aRnd.y * 0.9) * flick * (1.0 + uCharge * 0.22) * uPR / max(depth, 0.1)) : 0.0;
  vA = outA;
  vT = aRnd.z;
}
`;

const emberFrag = /* glsl */ `
uniform vec3 uA;
uniform vec3 uB;
uniform float uCharge;
varying float vA;
varying float vT;
void main(){
  vec2 c = gl_PointCoord - 0.5;
  float r2 = dot(c, c);
  if (r2 > 0.25) discard;
  float core = 1.0 - smoothstep(0.0, 0.5, sqrt(r2));
  core *= core;
  vec3 col = mix(uA, uB, min(1.0, vT + uCharge * 0.28)) * (2.2 + uCharge * 0.9);
  gl_FragColor = vec4(col, core * vA);
}
`;

export function Embers({ count }: { count: number }) {
  const points = useRef<THREE.Points>(null);
  const spin = useRef(0);
  const box: [number, number, number] = [18, 12, 16];
  const geo = useBoxGeometry(count, box);
  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: emberVert,
        fragmentShader: emberFrag,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        uniforms: {
          uTime: { value: 0 },
          uSpin: { value: 0 },
          uSize: { value: 34 },
          uPR: { value: 1 },
          uOpacity: { value: 0 },
          uCharge: { value: 0 },
          uBurst: { value: 0 },
          uCenter: { value: new THREE.Vector3() },
          uBox: { value: new THREE.Vector3(...box) },
          uA: { value: new THREE.Color('#ff3d0a') },
          uB: { value: new THREE.Color('#ffc160') },
        },
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );
  useSafeFrame((state, delta) => {
    const dt = Math.min(delta, 0.05);
    const op = (0.1 + Math.min(1, S.heat) * 0.9 + world.charge * 0.65 + world.burst * 0.55 + S.flash * 0.6) * S.intro;
    const vis = op > 0.005;
    if (points.current) points.current.visible = vis;
    if (!vis) return;
    spin.current += dt * (1 + world.charge * 0.6);
    const u = mat.uniforms;
    u.uTime.value = state.clock.elapsedTime;
    u.uSpin.value = spin.current;
    u.uPR.value = state.gl.getPixelRatio();
    u.uOpacity.value = op;
    u.uCharge.value = world.charge;
    u.uBurst.value = world.burst + S.flash * 0.9;
    u.uCenter.value.copy(S.egg);
  });
  return <points ref={points} geometry={geo} material={mat} position={[0, 0.5, -2]} frustumCulled={false} />;
}

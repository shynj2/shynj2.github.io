import { useMemo } from 'react';
import { useSafeFrame } from './useSafeFrame';
import * as THREE from 'three';
import { NOISE } from './glsl';
import { S } from './sceneState';
import { world } from '../store';

/* ------------------------------------------------------------------ */
/* Sky: night gradient, stars, aurora curtains (ice) → red comet (fire) */
/* ------------------------------------------------------------------ */
const skyVert = /* glsl */ `
varying vec3 vDir;
void main(){
  vDir = normalize(position);
  gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(position, 1.0);
}
`;

const skyFrag = /* glsl */ `
uniform float uTime;
uniform float uHeat;
uniform float uCometAz;
uniform float uReveal;
uniform float uNeon;
uniform float uDawn;
varying vec3 vDir;
${NOISE}
float h31(vec3 p){
  p = fract(p * 0.1031);
  p += dot(p, p.yzx + 33.33);
  return fract((p.x + p.y) * p.z);
}

void main(){
  vec3 d = normalize(vDir);
  float e = d.y;
  float heat = clamp(uHeat, 0.0, 1.0);

  vec3 zenith = mix(vec3(0.004, 0.008, 0.02), vec3(0.014, 0.004, 0.012), heat);
  vec3 horizon = mix(vec3(0.028, 0.055, 0.09), vec3(0.11, 0.03, 0.03), heat);
  vec3 col = mix(horizon, zenith, smoothstep(-0.05, 0.6, e));
  col = mix(col, vec3(0.008, 0.012, 0.02), (1.0 - smoothstep(-0.35, 0.0, e)));
  col += mix(vec3(0.05, 0.1, 0.16), vec3(0.22, 0.07, 0.04), heat) * exp(-abs(e) * 14.0) * 0.6;

  // stars — only above the horizon where visible
  if (e > 0.02) {
    vec3 sp = d * 220.0;
    vec3 id = floor(sp);
    float rnd = h31(id);
    if (rnd > 0.986) {
      vec3 f = fract(sp) - 0.5;
      vec3 off = vec3(h31(id + 1.0), h31(id + 2.0), h31(id + 3.0)) - 0.5;
      float star = (1.0 - smoothstep(0.0, 0.26, length(f - off * 0.5)));
      float tw = 0.55 + 0.45 * sin(uTime * (0.8 + rnd * 3.0) + rnd * 60.0);
      col += vec3(0.8, 0.9, 1.0) * star * tw * smoothstep(0.02, 0.25, e) * 1.3;
    }
  }

  // aurora borealis — skip expensive 3D simplex noise outside the visible aurora band
  if (e > -0.02 && e < 0.74) {
    vec3 aur = vec3(0.0);
    vec3 cLow = mix(vec3(0.1, 1.0, 0.72), vec3(1.0, 0.24, 0.1), heat);
    vec3 cHigh = mix(vec3(0.35, 0.3, 1.0), vec3(1.0, 0.1, 0.55), heat);
    // neon realm: cyan below, magenta above
    cLow = mix(cLow, vec3(0.08, 0.95, 0.9), uNeon);
    cHigh = mix(cHigh, vec3(1.0, 0.16, 0.55), uNeon);
    // rebirth: the curtains turn to gold
    cLow = mix(cLow, vec3(1.0, 0.7, 0.25), uDawn);
    cHigh = mix(cHigh, vec3(1.0, 0.4, 0.2), uDawn);

    #ifdef LIGHTWEIGHT
      const int curtains = 2;
    #else
      const int curtains = 3;
    #endif
    for (int i = 0; i < curtains; i++){
      float fi = float(i);
      #ifdef LIGHTWEIGHT
        float bend = sin(d.x * 3.7 + d.z * 2.7 + fi * 1.4 + uTime * 0.12) * 0.7;
      #else
        float bend = snoise(vec3(d.x * 1.4 + fi * 3.1, d.z * 1.4, uTime * 0.03 + fi));
      #endif
      float base = 0.09 + fi * 0.065 + 0.05 * bend;
      float above = e - base;
      float curtain = smoothstep(-0.015, 0.02, above) * exp(-max(above, 0.0) * (9.0 - fi * 2.0));
      if (curtain > 0.002) {
        #ifdef LIGHTWEIGHT
          float rays = (0.58 + 0.42 * sin(d.x * 18.0 + bend * 7.0 + fi + uTime * 0.21));
          rays *= (0.57 + 0.43 * sin(d.x * 5.5 - d.z * 3.0 + fi * 2.0));
        #else
          float rays = snoise(vec3(d.x * 9.0 + fi * 5.0, uTime * 0.12 + fi * 2.0, d.z * 9.0)) * 0.5 + 0.5;
          rays = rays * sqrt(rays) * (0.6 + 0.4 * snoise(vec3(d.x * 2.5, uTime * 0.05, d.z * 2.5 + fi)));
        #endif
        vec3 c = mix(cLow, cHigh, smoothstep(0.0, 0.12, above));
        aur += c * curtain * rays * (0.55 - fi * 0.12);
      }
    }
    col += aur * smoothstep(-0.02, 0.08, e) * (0.85 + uNeon * 0.7 + uDawn * 0.35);
  }

  // rebirth: a golden dawn breaks along the horizon
  if (uDawn > 0.001) {
    col += vec3(1.0, 0.5, 0.2) * exp(-abs(e) * 5.5) * uDawn * 0.26;
    col += vec3(1.0, 0.72, 0.42) * exp(-abs(e) * 20.0) * uDawn * 0.1;
  }

  // the red comet — appears when the dragon is about to hatch
  float cm = smoothstep(0.55, 0.95, heat);
  if (cm > 0.001 && e > 0.05){
    float az = atan(d.x, -d.z);
    vec2 rel = vec2(az, e) - vec2(uCometAz, 0.24);
    vec2 tdir = normalize(vec2(0.9, 0.34));
    float t = dot(rel, tdir);
    float perp = length(rel - tdir * t);
    float tail = step(0.0, t) * exp(-t * 3.0) * exp(-perp * perp / (0.00002 + t * t * 0.004));
    float headGlow = exp(-dot(rel, rel) / 0.00004);
    col += (vec3(1.0, 0.25, 0.12) * tail * 1.6 + vec3(1.0, 0.7, 0.5) * headGlow * 4.0) * cm;
  }

  col *= uReveal;
  gl_FragColor = vec4(col, 1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
`;

export function Sky({ mobile }: { mobile: boolean }) {
  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: skyVert,
        fragmentShader: skyFrag,
        defines: mobile ? { LIGHTWEIGHT: 1 } : {},
        side: THREE.BackSide,
        depthWrite: false,
        uniforms: {
          uTime: { value: 0 },
          uHeat: { value: 0 },
          uCometAz: { value: -0.42 },
          uReveal: { value: 0 },
          uNeon: { value: 0 },
          uDawn: { value: 0 },
        },
      }),
    [mobile]
  );
  useSafeFrame((state) => {
    const u = mat.uniforms;
    u.uTime.value = state.clock.elapsedTime;
    u.uHeat.value = Math.min(1, S.heat + world.charge * 0.28 + world.burst * 0.18);
    u.uNeon.value = S.neon;
    u.uDawn.value = THREE.MathUtils.smoothstep(S.hatch, 0.35, 1);
    u.uCometAz.value = S.mobile ? -0.16 : -0.42;
    u.uReveal.value = 0.25 + 0.75 * THREE.MathUtils.smoothstep(S.intro, 0.0, 0.8);
  });
  return (
    <mesh material={mat} renderOrder={-10} frustumCulled={false}>
      <sphereGeometry args={[80, 36, 20]} />
    </mesh>
  );
}

/* ------------------------------------------------------------------ */
/* Mist: drifting sea of fog, lit from above by the egg                */
/* ------------------------------------------------------------------ */
const mistVert = /* glsl */ `
varying vec3 vW;
void main(){
  vec4 w = modelMatrix * vec4(position, 1.0);
  vW = w.xyz;
  gl_Position = projectionMatrix * viewMatrix * w;
}
`;

const mistFrag = /* glsl */ `
uniform float uTime;
uniform float uHeat;
uniform float uOpacity;
uniform float uSeed;
uniform float uScale;
uniform vec3 uEgg;
varying vec3 vW;
#ifdef LIGHTWEIGHT
  uniform sampler2D uMist;
#else
  ${NOISE}
#endif
void main(){
  // Early-out before evaluating multi-octave 3D noise on fully faded distant/near mist
  float dist = length(vW.xz - cameraPosition.xz);
  float fade = (1.0 - smoothstep(9.0, 34.0, dist)) * smoothstep(0.8, 3.5, dist);
  if (fade * uOpacity < 0.003) {
    gl_FragColor = vec4(0.0);
    return;
  }

  vec2 p = vW.xz;
  float t = uTime;
  #ifdef LIGHTWEIGHT
    float n = (texture2D(uMist, p * vec2(0.044, 0.066) + vec2(t * 0.008, t * 0.003)).r - 0.5) * 1.36;
    float n2 = (texture2D(uMist, p.yx * 0.108 + vec2(0.32 - t * 0.013, 0.64)).r - 0.5) * 0.79;
  #else
    vec3 slow = vec3(p * 0.16 * uScale + vec2(t * 0.02, t * 0.012), t * 0.025 + uSeed);
    vec3 detail = vec3(p * 0.42 * uScale - vec2(t * 0.035, 0.0), t * 0.04 + uSeed * 2.0 + 4.0);
    float n = fbm(slow);
    float n2 = fbm3(detail);
  #endif
  float dens = smoothstep(-0.25, 0.65, n * 0.7 + n2 * 0.45);
  vec3 cold = vec3(0.13, 0.2, 0.3);
  vec3 warm = vec3(0.3, 0.11, 0.07);
  float heat = clamp(uHeat, 0.0, 1.0);
  vec3 col = mix(cold, warm, heat) * (0.35 + 0.65 * dens);
  vec2 de = (vW.xz - uEgg.xz) * (1.0 / 2.8);
  float g = exp(-dot(de, de));
  col += mix(vec3(0.2, 0.55, 0.95), vec3(1.0, 0.38, 0.1), heat) * g * (0.3 + 1.1 * heat) * dens;
  float a = dens * fade * uOpacity;
  gl_FragColor = vec4(col, a);
  #include <colorspace_fragment>
}
`;

function makeMistMap() {
  const size = 64;
  const image = new Uint8Array(size * size);
  const layers = [3, 7, 13, 25].map((n) => Float32Array.from({ length: n * n }, () => Math.random()));
  const freq = [3, 7, 13, 25];
  const ease = (x: number) => x * x * (3 - 2 * x);
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    let v = 0;
    for (let j = 0; j < layers.length; j++) {
      const n = freq[j], px = x * n / size, py = y * n / size;
      const i = Math.floor(px), k = Math.floor(py), u = ease(px - i), w = ease(py - k);
      const f = layers[j], i1 = (i + 1) % n, k1 = (k + 1) % n;
      const top = THREE.MathUtils.lerp(f[k * n + i], f[k * n + i1], u);
      const bottom = THREE.MathUtils.lerp(f[k1 * n + i], f[k1 * n + i1], u);
      v += THREE.MathUtils.lerp(top, bottom, w) * (0.56 / (1 << j));
    }
    image[y * size + x] = Math.round(v * 240);
  }
  const tex = new THREE.DataTexture(image, size, size, THREE.RedFormat);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.minFilter = tex.magFilter = THREE.LinearFilter;
  tex.needsUpdate = true;
  return tex;
}

function MistLayer({ y, opacity, seed, scale, mobile }: { y: number; opacity: number; seed: number; scale: number; mobile?: boolean }) {
  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: mistVert,
        fragmentShader: mistFrag,
        defines: mobile ? { LIGHTWEIGHT: 1 } : {},
        transparent: true,
        depthWrite: false,
        uniforms: {
          uTime: { value: 0 },
          uHeat: { value: 0 },
          uOpacity: { value: opacity },
          uSeed: { value: seed },
          uScale: { value: scale },
          uEgg: { value: new THREE.Vector3() },
          uMist: { value: mobile ? makeMistMap() : null },
        },
      }),
    [opacity, seed, scale, mobile]
  );
  useSafeFrame((state) => {
    const u = mat.uniforms;
    u.uTime.value = state.clock.elapsedTime;
    u.uHeat.value = Math.min(1, S.heat + world.charge * 0.45 + world.burst * 0.28);
    u.uEgg.value.copy(S.egg);
    u.uOpacity.value = opacity * (0.3 + 0.7 * THREE.MathUtils.smoothstep(S.intro, 0.0, 0.8));
  });
  return (
    <mesh material={mat} rotation-x={-Math.PI / 2} position={[0, y, -6]} frustumCulled={false}>
      <planeGeometry args={[90, 70, 1, 1]} />
    </mesh>
  );
}

export function Mist({ mobile }: { mobile: boolean }) {
  if (mobile) return <MistLayer y={-2.1} opacity={0.93} seed={0} scale={1} mobile />;
  return (
    <group>
      <MistLayer y={-2.25} opacity={0.85} seed={0} scale={1} />
      <MistLayer y={-1.75} opacity={0.45} seed={7.3} scale={1.6} />
    </group>
  );
}

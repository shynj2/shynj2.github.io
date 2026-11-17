import { useMemo, useRef } from 'react';
import { useSafeFrame } from './useSafeFrame';
import * as THREE from 'three';
import { BASIC_VERT } from './glsl';
import { S } from './sceneState';
import { world } from '../store';

const ringFrag = /* glsl */ `
uniform float uTime;
uniform float uOpacity;
uniform float uHeat;
uniform float uSeed;
uniform float uSlots;
uniform float uAspect;
uniform float uCharge;
uniform float uNeon;
uniform float uFocus;
uniform float uNear;
uniform vec3 uGold;
uniform vec3 uNeonCol;
uniform vec3 uFire;
varying vec2 vUv;
varying vec3 vNw;
varying vec3 vW;

float h11(float n){ return fract(sin(n * 127.1 + 3.7) * 43758.5453123); }
float seg(vec2 p, vec2 a, vec2 b){
  vec2 pa = p - a; vec2 ba = b - a;
  float t = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
  return length(pa - ba * t);
}
// procedural "elder futhark"-like rune: a stem with diagonal twigs
float rune(vec2 p, float id){
  float cx = uAspect * 0.5;
  float w = 0.3;
  float d = seg(p, vec2(cx, 0.08), vec2(cx, 0.92));
  float r1 = h11(id * 3.17 + 1.0);
  float r2 = h11(id * 5.71 + 2.0);
  float r3 = h11(id * 7.33 + 3.0);
  float r4 = h11(id * 9.13 + 4.0);
  if (r1 > 0.3){
    float y0 = 0.92 - r2 * 0.25;
    float sx = r1 > 0.65 ? 1.0 : -1.0;
    d = min(d, seg(p, vec2(cx, y0), vec2(cx + sx * w, y0 - 0.26)));
  }
  if (r3 > 0.4){
    float y0 = 0.56 - r4 * 0.2;
    float sx = r3 > 0.7 ? -1.0 : 1.0;
    d = min(d, seg(p, vec2(cx, y0), vec2(cx + sx * w, y0 - 0.26)));
  }
  if (r2 > 0.82){
    d = min(d, seg(p, vec2(cx, 0.92), vec2(cx - w, 0.64)));
    d = min(d, seg(p, vec2(cx, 0.92), vec2(cx + w, 0.64)));
  }
  if (r4 > 0.86) d = min(d, seg(p, vec2(cx - w, 0.64), vec2(cx + w, 0.36)));
  return d;
}

void main(){
  float x = vUv.x * uSlots;
  float slot = floor(x);
  float id = slot + uSeed * 97.0;
  float gy = (vUv.y - 0.18) / 0.64;
  vec2 p = vec2(fract(x) * uAspect, gy);
  float d;
  if (mod(slot, 9.0) < 0.5) d = length(p - vec2(uAspect * 0.5, 0.5)) - 0.05;
  else d = rune(p, id);
  float aa = fwidth(d) + 0.0001;
  float glyph = 1.0 - smoothstep(0.06 - aa, 0.06 + aa, d);
  glyph *= step(0.0, gy) * step(gy, 1.0);
  glyph *= step(0.16, h11(id * 1.37));

  float fy = fwidth(vUv.y) + 0.0001;
  float border = 1.0 - smoothstep(0.0, fy * 1.5, abs(vUv.y - 0.06) - fy * 0.5);
  border = max(border, 1.0 - smoothstep(0.0, fy * 1.5, abs(vUv.y - 0.94) - fy * 0.5));

  vec3 V = normalize(cameraPosition - vW);
  float fres = pow(1.0 - abs(dot(normalize(vNw), V)), 2.0);
  float sweep = pow(0.5 + 0.5 * sin(vUv.x * 6.28318 * 2.0 - uTime + uSeed * 4.0), 6.0);
  vec3 runeCol = mix(uNeonCol, uFire, clamp(uHeat + uCharge * 0.7, 0.0, 1.0));
  // neon realm: the rings alternate cyan / magenta
  runeCol = mix(runeCol, mix(vec3(0.08, 0.95, 0.9), vec3(1.0, 0.16, 0.55), step(1.5, uSeed) * step(uSeed, 2.5)), uNeon);
  float sector = 1.0 - smoothstep(0.0, 0.16, abs(fract(vUv.x - uFocus + 0.5) - 0.5));
  vec3 col = uGold * (0.05 + 0.18 * fres) + uGold * border * 0.9 + runeCol * glyph * (0.9 + 2.2 * sweep + uCharge * 1.5);
  col += runeCol * (glyph * 1.6 + border * 0.8) * sector * uNear;
  float a = (0.07 + 0.2 * fres + border * 0.75 + glyph * 0.95) * uOpacity;
  gl_FragColor = vec4(col, a);
}
`;

type RingDef = { r: number; h: number; tilt: [number, number, number]; speed: number; seed: number };

const RINGS: RingDef[] = [
  { r: 1.5, h: 0.13, tilt: [1.22, 0, 0.28], speed: 0.12, seed: 1 },
  { r: 1.74, h: 0.11, tilt: [0.32, 0, -1.08], speed: -0.085, seed: 2 },
  { r: 1.98, h: 0.095, tilt: [-0.55, 0.2, 0.62], speed: 0.06, seed: 3 },
];

export function Astrolabe() {
  const root = useRef<THREE.Group>(null);
  const spins = useRef<(THREE.Mesh | null)[]>([]);
  const sweepPhase = useRef(0);
  const items = useMemo(
    () =>
      RINGS.map((d) => {
        const glyphH = 0.64 * d.h;
        const circ = Math.PI * 2 * d.r;
        const slots = Math.round(circ / (glyphH * 1.8));
        const aspect = circ / slots / glyphH;
        const geo = new THREE.CylinderGeometry(d.r, d.r, d.h, 160, 1, true);
        const mat = new THREE.ShaderMaterial({
          vertexShader: BASIC_VERT,
          fragmentShader: ringFrag,
          transparent: true,
          depthWrite: false,
          side: THREE.DoubleSide,
          blending: THREE.AdditiveBlending,
          uniforms: {
            uTime: { value: 0 },
            uOpacity: { value: 1 },
            uHeat: { value: 0 },
            uSeed: { value: d.seed },
            uSlots: { value: slots },
            uAspect: { value: aspect },
            uCharge: { value: 0 },
            uGold: { value: new THREE.Color('#c99a52') },
            uNeon: { value: 0 },
            uNeonCol: { value: new THREE.Color('#45f0ff') },
            uFire: { value: new THREE.Color('#ff6a1a') },
            uFocus: { value: 0 },
            uNear: { value: 0 },
          },
        });
        return { def: d, geo, mat };
      }),
    []
  );

  useSafeFrame((_, delta) => {
    const dt = Math.min(delta, 0.05);
    const reveal = THREE.MathUtils.smoothstep(S.intro, 0.2, 0.95);
    const opacity = S.rings * reveal;
    const vis = opacity > 0.004;
    if (root.current) {
      root.current.visible = vis;
      if (!vis) return;
      root.current.rotation.y += dt * (0.025 + S.stir * 0.12);
      root.current.rotation.x = THREE.MathUtils.damp(root.current.rotation.x, -world.pointer.y * 0.1, 2.2, dt);
      root.current.rotation.z = THREE.MathUtils.damp(root.current.rotation.z, world.pointer.x * 0.06, 2.2, dt);
      // when the shell breaks the rings open up into a wide halo behind the phoenix
      root.current.scale.setScalar(1 + THREE.MathUtils.smoothstep(S.hatch, 0.3, 0.9) * 0.5 + S.touchAmt * 0.06);
    } else if (!vis) return;
    const charge = world.charge + S.flash;
    sweepPhase.current += dt * (0.6 + charge * 1.4 + S.stir * 1.1);
    const boost = 1 + world.charge * 1.6 + world.burst * 1.4 + S.flash * 4 + S.orbs * 0.8 + S.neon * 0.6 + S.stir * 1.8;
    const focusAng = Math.atan2(S.touch.x, S.touch.z);
    for (let i = 0; i < items.length; i++) {
      const it = items[i];
      const u = it.mat.uniforms;
      u.uTime.value = sweepPhase.current;
      u.uOpacity.value = opacity;
      u.uHeat.value = S.heat;
      u.uCharge.value = charge + world.burst * 0.5;
      u.uNeon.value = S.neon;
      const m = spins.current[i];
      if (m) m.rotation.y += dt * it.def.speed * boost;
      const yaw = m ? m.rotation.y : 0;
      u.uFocus.value = (focusAng - yaw) / (Math.PI * 2);
      u.uNear.value = S.touchAmt;
    }
  });

  return (
    <group ref={root}>
      {items.map((it, i) => (
        <group key={i} rotation={it.def.tilt}>
          <mesh
            ref={(m) => {
              spins.current[i] = m;
            }}
            geometry={it.geo}
            material={it.mat}
            frustumCulled={false}
          />
        </group>
      ))}
    </group>
  );
}

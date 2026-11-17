import { useMemo, useRef } from 'react';
import { useSafeFrame } from './useSafeFrame';
import * as THREE from 'three';
import { BASIC_VERT } from './glsl';
import { S } from './sceneState';

const N = 7;
const R = 2.75;

const beamFrag = /* glsl */ `
uniform float uTime;
uniform float uReveal;
uniform float uIndex;
uniform float uHeat;
uniform float uCursor;
uniform vec3 uColA;
uniform vec3 uColB;
varying vec2 vUv;
varying vec3 vNw;
varying vec3 vW;
void main(){
  vec3 V = normalize(cameraPosition - vW);
  float facing = abs(dot(normalize(vNw), V));
  float core = pow(facing, 2.6);
  float y = vUv.y;
  float vfade = smoothstep(0.0, 0.1, y) * (1.0 - smoothstep(0.3, 1.0, y));
  float shimmer = 0.75 + 0.25 * sin(y * 30.0 - uTime * 2.0 + uIndex * 1.7) * sin(y * 13.0 + uTime * 1.3);
  float r = clamp(uReveal * 8.0 - uIndex, 0.0, 1.0);
  r = r * r * (3.0 - 2.0 * r);
  float rr = r * 1.2;
  float grow = 1.0 - smoothstep(rr - 0.18, rr, y);
  vec3 col = mix(uColB, uColA, core) * (1.1 + (1.0 - y) * 1.6);
  col *= 1.0 + uCursor * 1.35;
  float a = core * vfade * shimmer * grow * step(0.001, r) * 0.55 * (1.0 + uCursor * 0.8);
  gl_FragColor = vec4(col, a);
}
`;

const flareVert = /* glsl */ `
attribute float aIndex;
uniform float uReveal;
uniform float uPR;
uniform float uTime;
varying float vA;
void main(){
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  gl_Position = projectionMatrix * mv;
  float r = clamp(uReveal * 8.0 - aIndex, 0.0, 1.0);
  vA = r * (0.8 + 0.2 * sin(uTime * 3.0 + aIndex));
  gl_PointSize = min(54.0 * uPR, 260.0 * uPR / max(-mv.z, 0.1));
}
`;

const flareFrag = /* glsl */ `
uniform vec3 uCol;
varying float vA;
void main(){
  vec2 c = gl_PointCoord - 0.5;
  float r2 = dot(c, c);
  if (r2 >= 0.25 || vA < 0.003) discard;
  float a = exp(-r2 * 40.0) + exp(-r2 * 400.0) * 0.8;
  gl_FragColor = vec4(uCol * 1.6, a * vA * (1.0 - smoothstep(0.14, 0.25, r2)));
}
`;

export function LightPillars() {
  const group = useRef<THREE.Group>(null);
  const geo = useMemo(() => {
    const g = new THREE.CylinderGeometry(0.16, 0.16, 7.5, 24, 1, true);
    g.translate(0, 3.75 - 2.4, 0);
    return g;
  }, []);
  const angles = useMemo(() => Array.from({ length: N }, (_, i) => Math.PI / 2 + Math.PI / N + (i * Math.PI * 2) / N), []);
  const mats = useMemo(
    () =>
      angles.map(
        (_, i) =>
          new THREE.ShaderMaterial({
            vertexShader: BASIC_VERT,
            fragmentShader: beamFrag,
            transparent: true,
            depthWrite: false,
            blending: THREE.AdditiveBlending,
            uniforms: {
              uTime: { value: 0 },
              uReveal: { value: 0 },
              uIndex: { value: i },
              uHeat: { value: 0 },
              uCursor: { value: 0 },
              uColA: { value: new THREE.Color('#fff2d6') },
              uColB: { value: new THREE.Color('#f0a640') },
            },
          })
      ),
    [angles]
  );
  const flare = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const pos = new Float32Array(N * 3);
    const idx = new Float32Array(N);
    angles.forEach((a, i) => {
      pos[i * 3] = Math.cos(a) * R;
      pos[i * 3 + 1] = -2.3;
      pos[i * 3 + 2] = Math.sin(a) * R;
      idx[i] = i;
    });
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    g.setAttribute('aIndex', new THREE.BufferAttribute(idx, 1));
    const m = new THREE.ShaderMaterial({
      vertexShader: flareVert,
      fragmentShader: flareFrag,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: { uReveal: { value: 0 }, uPR: { value: 1 }, uTime: { value: 0 }, uCol: { value: new THREE.Color('#ffb85a') } },
    });
    return { g, m };
  }, [angles]);

  useSafeFrame((state) => {
    const vis = S.pillars > 0.004;
    if (group.current) group.current.visible = vis;
    if (!vis) return;
    const t = state.clock.elapsedTime;
    const aim = Math.atan2(S.touch.z, S.touch.x);
    for (let i = 0; i < mats.length; i++) {
      const u = mats[i].uniforms;
      u.uTime.value = t;
      u.uReveal.value = S.pillars;
      u.uHeat.value = S.heat;
      let d = Math.abs(angles[i] - aim);
      d = Math.min(d, Math.PI * 2 - d);
      u.uCursor.value = S.touchAmt * (1 - THREE.MathUtils.smoothstep(0.25, 1.15, d));
    }
    flare.m.uniforms.uReveal.value = S.pillars;
    flare.m.uniforms.uTime.value = t;
    flare.m.uniforms.uPR.value = state.gl.getPixelRatio();
  });

  return (
    <group ref={group} visible={false}>
      {mats.map((m, i) => (
        <mesh
          key={i}
          geometry={geo}
          material={m}
          position={[Math.cos(angles[i]) * R, 0, Math.sin(angles[i]) * R]}
          frustumCulled={false}
        />
      ))}
      <points geometry={flare.g} material={flare.m} frustumCulled={false} />
    </group>
  );
}

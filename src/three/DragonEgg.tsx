import { Suspense, useMemo, useRef } from 'react';
import { useLoader } from '@react-three/fiber';
import iceSurfaceUrl from '../assets/ice-shell.webp?inline';
import { useSafeFrame } from './useSafeFrame';
import * as THREE from 'three';
import { NOISE, VORONOI } from './glsl';
import { S, damp, smooth } from './sceneState';
import { world } from '../store';

/** Same scale-cell lookup in the vertex and fragment shader, so every scale can break off as one shard. */
const CELLS = /* glsl */ `
vec3 cellSpace(vec3 s){
  #ifdef BAKED_SHELL
    return s * vec3(3.55, 2.65, 3.55) + 0.16 * sin(3.9 * s.yzx + 2.3 * s.zxy + vec3(0.7, 1.8, 3.1));
  #else
    vec3 q = s * vec3(2.9, 2.2, 2.9);
    q += 0.2 * vec3(snoise(s * 1.6), snoise(s * 1.6 + 11.3), snoise(s * 1.6 + 23.9));
    return q;
  #endif
}
`;

const eggVert = /* glsl */ `
uniform float uTime;
uniform float uCharge;
uniform float uBurst;
uniform float uCrack;
uniform float uShatter;
uniform vec3 uTouch;
uniform float uTouchAmt;
uniform float uRipple;
#ifdef BAKED_SHELL
  varying vec2 vShellUv;
#endif
varying vec3 vObj;
varying vec3 vWorld;
varying vec3 vNormalW;
varying float vShard;
${NOISE}
${VORONOI}
${CELLS}

// nearest scale centre (xyz, in cell space) + random id (w)
vec4 cellAt(vec3 x){
  vec3 p = floor(x);
  vec3 f = fract(x);
  float best = 8.0;
  vec3 bp = vec3(0.0);
  float id = 0.0;
  for (int k = -1; k <= 1; k++)
  for (int j = -1; j <= 1; j++)
  for (int i = -1; i <= 1; i++){
    vec3 b = vec3(float(i), float(j), float(k));
    vec3 o = hash33(p + b);
    vec3 r = b + o - f;
    float d = dot(r, r);
    if (d < best){ best = d; bp = p + b + o; id = o.x; }
  }
  return vec4(bp, id);
}

vec3 deform(vec3 s){
  vec3 p = s;
  // egg silhouette: narrower crown, fuller base
  p.xz *= 1.0 - 0.17 * p.y;
  p.y *= 1.3;
  #ifdef BAKED_SHELL
    float n = sin(s.x * 6.0 + s.y * 2.5) * sin(s.z * 5.0 - s.y * 3.5 + uTime * 0.36) * 0.53;
  #else
    float n = snoise(s * 1.5 + vec3(0.0, uTime * 0.11, 0.0));
  #endif
  float breathe = sin(uTime * 1.05) * 0.012;
  float tremble = uCharge * 0.012 * sin(uTime * 23.0 + s.y * 9.0) + uCrack * 0.012 * sin(uTime * 17.0 + s.y * 7.0);
  p += s * (n * 0.028 + breathe + tremble + uBurst * 0.05 + uCrack * 0.03);
  return p;
}

void main(){
  vec3 s = normalize(position);
  vec3 p0 = deform(s);
  #ifdef BAKED_SHELL
    // Analytic normal of the tapered ellipsoid. Fine relief is provided by the atlas.
    const float taper = 0.17;
    float w = 1.0 - taper * s.y;
    vec3 n = normalize(vec3(s.x / w, (s.y + taper * (1.0 - s.y * s.y) / w) / 1.3, s.z / w));
    vShellUv = uv;
  #else
    vec3 up = abs(s.y) > 0.99 ? vec3(1.0, 0.0, 0.0) : vec3(0.0, 1.0, 0.0);
    vec3 t = normalize(cross(up, s));
    vec3 b = normalize(cross(s, t));
    vec3 p1 = deform(normalize(s + t * 0.01));
    vec3 p2 = deform(normalize(s + b * 0.01));
    vec3 n = normalize(cross(p1 - p0, p2 - p0));
    if (dot(n, p0) < 0.0) n = -n;
  #endif

  // the shell swells under the hand, and a click sends a ring across the scales
  float td = distance(s, uTouch);
  float touch = uTouchAmt * (1.0 - smoothstep(0.1, 0.62, td));
  float rippleD = (td - uRipple * 1.5) * 7.5;
  float wave = exp(-rippleD * rippleD) * smoothstep(0.02, 0.1, uRipple) * (1.0 - smoothstep(0.25, 1.0, uRipple));
  p0 += n * (touch * 0.055 + wave * 0.09);

  // the shell breaks: every scale flies off as one piece (crown first), drifting up and around
  vShard = 0.0;
  if (uShatter > 0.0005){
    vec4 cell = cellAt(cellSpace(s));
    #ifdef BAKED_SHELL
      vec3 center = cell.xyz / vec3(3.55, 2.65, 3.55);
    #else
      vec3 center = cell.xyz / vec3(2.9, 2.2, 2.9);
    #endif
    vec3 dir = center / max(0.01, length(center));
    float delay = 0.22 * (0.5 - 0.5 * dir.y) + 0.18 * cell.w;
    float local = clamp((uShatter - delay) / 0.6, 0.0, 1.0);
    local = local * local * (3.0 - 2.0 * local);
    vec3 swirl = cross(vec3(0.0, 1.0, 0.0), dir);
    p0 += dir * local * (1.3 + cell.w * 2.4) + swirl * local * 0.9 + vec3(0.0, local * local * 0.9, 0.0);
    vShard = local;
  }

  vObj = s;
  vec4 wp = modelMatrix * vec4(p0, 1.0);
  vWorld = wp.xyz;
  vNormalW = normalize(mat3(modelMatrix) * n);
  gl_Position = projectionMatrix * viewMatrix * wp;
}
`;

const eggFrag = /* glsl */ `
uniform float uTime;
uniform float uHeat;
uniform float uFrost;
uniform float uCharge;
uniform float uBurst;
uniform float uAwake;
uniform float uCrack;
uniform float uNeon;
uniform float uReveal;
uniform vec3 uTouch;
uniform float uTouchAmt;
uniform float uRipple;
uniform vec3 uFireA;
uniform vec3 uFireB;
uniform vec3 uIce;
uniform vec3 uRim;
uniform vec3 uHolo;
uniform float uShatter;
#ifdef BAKED_SHELL
  uniform sampler2D uSurface;
  varying vec2 vShellUv;
#endif
varying vec3 vObj;
varying vec3 vWorld;
varying vec3 vNormalW;
varying float vShard;
#ifndef BAKED_SHELL
  ${NOISE}
  ${VORONOI}
  ${CELLS}
#endif

vec3 bump(vec3 pos, vec3 n, float h, float k){
  vec3 dx = dFdx(pos);
  vec3 dy = dFdy(pos);
  vec3 r1 = cross(dy, n);
  vec3 r2 = cross(n, dx);
  float det = dot(dx, r1);
  vec3 grad = sign(det) * (dFdx(h) * r1 + dFdy(h) * r2);
  vec3 blended = abs(det) * n - k * grad;
  float m = dot(blended, blended);
  return m > 1e-22 ? blended * inversesqrt(m) : n;
}

void main(){
  vec3 N = normalize(vNormalW);
  if (!gl_FrontFacing) N = -N;
  vec3 V = normalize(cameraPosition - vWorld);
  float heat = clamp(uHeat + uCharge * 0.75 + uBurst * 0.75, 0.0, 1.85);
  float heat01 = clamp(heat, 0.0, 1.0);

  // The packed shell carries the seam distance, scale relief and multi-octave frost.
  #ifdef BAKED_SHELL
    vec3 surface = texture2D(uSurface, vShellUv).rgb;
    float edge = surface.r * 0.8;
    float cell = clamp(surface.b * 1.62 - 0.27, 0.0, 1.0);
    float relief = surface.g * 1.2;
  #else
    vec3 vr = voronoi3(cellSpace(vObj));
    float edge = vr.y - vr.x;
    float cell = vr.z;
    float relief = vr.x;
  #endif
  float seamAA = max(0.003, fwidth(edge) * 0.6);
  float interior = smoothstep(0.015, 0.3, edge);
  float dome = 1.0 - smoothstep(0.0, 0.95, relief);
  float h = interior * (0.5 + 0.5 * dome);
  vec3 Nb = bump(vWorld, N, h, 0.034);

  // Keep the shader variant stable through hatching. Evaluate derivatives before discarding.
  if (!gl_FrontFacing && uShatter < 0.001) discard;
  if (vShard > 0.0005){
    if (edge < 0.17 * smoothstep(0.0, 0.08, vShard)) discard;
    #ifdef BAKED_SHELL
      float burn = clamp(surface.b * 1.25 - 0.12, 0.0, 1.0);
    #else
      float burn = snoise(vObj * 7.0 + 3.1) * 0.5 + 0.5;
    #endif
    if (burn < smoothstep(0.45, 1.0, vShard)) discard;
  }

  // lighting
  vec3 L1 = normalize(vec3(-0.55, 0.75, 0.55));
  vec3 L2 = normalize(vec3(0.85, 0.15, -0.5));
  float d1 = max(dot(Nb, L1), 0.0);
  float d2 = max(dot(Nb, L2), 0.0);
  vec3 H1 = normalize(L1 + V);
  float s1 = pow(max(dot(Nb, H1), 0.0), 60.0);
  float ndv = clamp(dot(Nb, V), 0.0, 1.0);
  float fres = pow(1.0 - ndv, 3.0);

  // obsidian with thin-film iridescence
  vec3 base = mix(vec3(0.016, 0.018, 0.026), vec3(0.055, 0.04, 0.045), cell);
  vec3 irid = 0.5 + 0.5 * cos(6.28318 * (vec3(0.0, 0.33, 0.67) + fres * 1.1 + cell * 0.25 + uTime * 0.015));
  vec3 col = base * (0.4 + 1.3 * d1);
  col += vec3(0.62, 0.76, 1.0) * s1 * (0.35 + 0.65 * h);
  col += irid * fres * 0.22;
  col += mix(uIce, uFireA, heat01) * d2 * 0.1 * h;

  // the hand melts frost and lights the scales it rests on
  float td = distance(vObj, uTouch);
  float touch = uTouchAmt * (1.0 - smoothstep(0.02, 0.55, td));
  float rippleD = (td - uRipple * 1.5) * 8.0;
  float wave = exp(-rippleD * rippleD) * smoothstep(0.02, 0.1, uRipple) * (1.0 - uRipple);

  // frost — skips 5× 3D simplex noise calls when the shell has thawed, and melts softly under held heat
  float effFrost = uFrost * (1.0 - uCharge * 0.38) * (1.0 - touch * 0.92);
  if (effFrost > 0.002) {
    #ifdef BAKED_SHELL
      float fr = surface.b;
      float glint = smoothstep(0.57, 0.78, fr) * (s1 + d2 * 0.28);
    #else
      float fr = fbm(vObj * 4.5) * 0.5 + 0.5;
      float glint = pow(max(snoise(vObj * 55.0 + V * 3.0), 0.0), 10.0);
    #endif
    float frost = effFrost * smoothstep(0.4, 0.73, fr + (1.0 - interior) * 0.22 + vObj.y * 0.07);
    vec3 frostCol = vec3(0.59, 0.77, 0.96) * (0.25 + 0.75 * d1) + vec3(0.85, 0.95, 1.0) * s1 * 0.5;
    col = mix(col, frostCol, frost * 0.53);
    col += vec3(0.85, 0.95, 1.0) * glint * frost * 3.0;
  }

  // molten seams between scales (hair-thin & soft while frozen, wide & molten when hot)
  float seamW = 0.03 + 0.085 * heat01 + 0.06 * uCrack;
  float seam = 1.0 - smoothstep(0.0, seamW + seamAA, edge);
  #ifdef BAKED_SHELL
    float flow = 0.5 + 0.28 * sin(vObj.y * 7.3 + vObj.z * 2.2 - uTime * 0.8 + surface.b * 4.0);
  #else
    float flow = snoise(vObj * 2.4 + vec3(0.0, -uTime * 0.35, uTime * 0.12)) * 0.5 + 0.5;
  #endif
  float pulse = 0.7 + 0.3 * sin(uTime * 2.1 + cell * 6.28318);
  vec3 fire = mix(uFireA, uFireB, flow * flow);
  float hot = smoothstep(0.05, 0.4, heat);
  col += fire * seam * hot * (0.45 + 0.9 * flow) * pulse * (1.3 + 2.4 * heat);
  col += uIce * seam * (1.0 - hot) * (0.12 + 0.22 * flow);
  col += mix(uIce, fire, heat01) * touch * (0.7 + seam * 1.6);
  col += vec3(1.0, 0.92, 0.72) * wave * (1.5 + heat01);

  // heat glowing through the shell
  float sss = pow(ndv, 1.6) * (1.0 - interior * 0.6);
  col += fire * sss * heat * heat * 0.4;

  // neon rim
  float facing = 1.0 - clamp(dot(N, V), 0.0, 1.0);
  float rim = facing * facing * facing * facing;
  vec3 rimCol = mix(uRim, mix(uFireA, uHolo, 0.3), smoothstep(0.35, 1.0, heat));
  col += rimCol * rim * (0.85 + uCharge * 1.6);

  // holographic scan line
  float band = fract(vObj.y * 0.45 + 0.5 - uTime * 0.07);
  float scan = smoothstep(0.0, 0.012, band) * (1.0 - smoothstep(0.012, 0.03, band));
  col += mix(uRim, uHolo, 0.5) * scan * (0.25 + rim * 1.5) * (0.9 + uNeon * 2.0);

  // neon realm: cyan / magenta bands race over the shell
  if (uNeon > 0.002) {
    float stripe = smoothstep(0.42, 0.5, abs(fract(vObj.y * 2.6 - uTime * 0.12) - 0.5));
    col += mix(uRim, uHolo, step(0.5, fract(vObj.y * 1.3 - uTime * 0.06))) * (rim * 1.4 + stripe * 0.16) * uNeon;
  }

  // awakening — white-hot veins; cracking — light bursts out of every seam
  col += vec3(1.0, 0.82, 0.55) * seam * uAwake * flow * 1.5;
  col += vec3(1.0, 0.9, 0.7) * seam * uCrack * (1.6 + 1.4 * pulse);
  col += fire * sss * uCrack * 0.6;

  // the inside of the shell and the flying shards glow like embers
  if (!gl_FrontFacing) col = mix(col, fire * 1.5, 0.8);
  col += fire * vShard * 1.4;

  col *= uReveal;
  gl_FragColor = vec4(col, 1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
`;

const haloVert = /* glsl */ `
varying vec2 vUv;
void main(){
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const haloFrag = /* glsl */ `
uniform float uHeat;
uniform float uCharge;
uniform float uReveal;
uniform float uTime;
uniform vec3 uIce;
uniform vec3 uFire;
varying vec2 vUv;
void main(){
  vec2 p = vUv - 0.5;
  float r2 = dot(p, p);
  if (r2 >= 0.25) discard;
  float r = sqrt(r2);
  float g = exp(-r2 * 22.0);
  float d = (r - 0.2 - 0.01 * sin(uTime)) * 28.0;
  float ring = exp(-d * d) * 0.25;
  vec3 col = mix(uIce, uFire, clamp(uHeat + uCharge * 0.72, 0.0, 1.0));
  float a = (g * (0.16 + 0.45 * uHeat + 0.65 * uCharge) + ring * uCharge) * uReveal * (1.0 - smoothstep(0.17, 0.25, r2));
  gl_FragColor = vec4(col, a);
}
`;

function Shell({ surface }: { surface?: THREE.Texture }) {
  const mesh = useRef<THREE.Mesh>(null);
  const halo = useRef<THREE.Mesh>(null);
  const geo = useMemo(() => new THREE.SphereGeometry(1, surface ? 100 : 128, surface ? 72 : 96), [surface]);
  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: eggVert,
        fragmentShader: eggFrag,
        defines: surface ? { BAKED_SHELL: 1 } : {},
        side: THREE.DoubleSide,
        uniforms: {
          uSurface: { value: surface ?? null },
          uTime: { value: 0 },
          uHeat: { value: 0 },
          uFrost: { value: 1 },
          uCharge: { value: 0 },
          uBurst: { value: 0 },
          uAwake: { value: 0 },
          uCrack: { value: 0 },
          uShatter: { value: 0 },
          uNeon: { value: 0 },
          uReveal: { value: 0 },
          uTouch: { value: new THREE.Vector3(0, 1, 0) },
          uTouchAmt: { value: 0 },
          uRipple: { value: 1 },
          uFireA: { value: new THREE.Color('#ff4a12') },
          uFireB: { value: new THREE.Color('#ffc46b') },
          uIce: { value: new THREE.Color('#5fd0ff') },
          uRim: { value: new THREE.Color('#45f0ff') },
          uHolo: { value: new THREE.Color('#ff2bd6') },
        },
      }),
    [surface]
  );
  const haloMat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: haloVert,
        fragmentShader: haloFrag,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        uniforms: {
          uHeat: { value: 0 },
          uCharge: { value: 0 },
          uReveal: { value: 0 },
          uTime: { value: 0 },
          uIce: { value: new THREE.Color('#3aa8ff') },
          uFire: { value: new THREE.Color('#ff5a1a') },
        },
      }),
    []
  );

  const ripple = useRef(1);
  const localTouch = useMemo(() => new THREE.Vector3(), []);

  useSafeFrame((state, delta) => {
    const dt = Math.min(delta, 0.05);
    const t = state.clock.elapsedTime;
    const u = mat.uniforms;
    const reveal = smooth(S.intro, 0.02, 0.7);
    const shatter = smooth(S.hatch, 0.36, 0.8);
    u.uTime.value = t;
    u.uHeat.value = S.heat + S.hover * 0.12 + S.blind * 1.2;
    u.uFrost.value = S.frost;
    u.uCharge.value = world.charge;
    u.uBurst.value = world.burst;
    u.uAwake.value = S.awake;
    u.uCrack.value = smooth(S.hatch, 0.02, 0.4) * (1 - shatter * 0.6);
    u.uShatter.value = shatter;
    u.uNeon.value = S.neon;
    u.uReveal.value = reveal;
    u.uTouchAmt.value = S.touchAmt;
    if (mesh.current && S.touchAmt > 0.04) {
      localTouch.copy(S.touchWorld);
      mesh.current.worldToLocal(localTouch);
      const len = localTouch.length() || 1;
      u.uTouch.value.set(localTouch.x / len, localTouch.y / len, localTouch.z / len);
    }
    if (S.clickShock > 0.45 && S.touchAmt > 0.4) ripple.current = 0;
    ripple.current = Math.min(1, ripple.current + dt * 0.72);
    u.uRipple.value = ripple.current;
    const h = haloMat.uniforms;
    h.uHeat.value = S.heat;
    h.uCharge.value = world.charge + world.burst + S.flash * 1.2 + smooth(S.hatch, 0.5, 1) * 0.2 + S.blind * 2.5;
    h.uReveal.value = reveal;
    h.uTime.value = t;
    if (mesh.current) {
      const m = mesh.current;
      m.visible = shatter < 0.998;
      m.rotation.y += dt * (0.08 + S.stir * 0.5 + world.charge * 0.28 + world.burst * 0.45 + S.orbs * 0.1 + S.flash * 0.5);
      const motion = world.reduced ? 0.3 : 1;
      const lean = 0.16 + S.touchAmt * 0.28;
      m.rotation.x = damp(m.rotation.x, -world.pointer.y * lean * motion, 2.4, dt);
      m.rotation.z = damp(m.rotation.z, world.pointer.x * lean * 0.62 * motion, 2.4, dt);
      const pulse = 1 + S.touchAmt * 0.05 + world.charge * 0.045 + Math.sin(t * 1.6) * S.touchAmt * 0.012;
      m.scale.setScalar(damp(m.scale.x, pulse, 3.2, dt));
      m.position.y = Math.sin(t * 0.6) * 0.05 + S.touchAmt * 0.04;
    }
    if (halo.current) halo.current.quaternion.copy(state.camera.quaternion);
  });

  return (
    <group>
      <mesh ref={halo} material={haloMat} renderOrder={-1}>
        <planeGeometry args={[6, 6]} />
      </mesh>
      <mesh ref={mesh} name="Dragon egg shell" geometry={geo} material={mat} frustumCulled={false} />
    </group>
  );
}

function MobileShell() {
  const surface = useLoader(THREE.TextureLoader, iceSurfaceUrl);
  useMemo(() => {
    surface.wrapS = THREE.RepeatWrapping;
    surface.anisotropy = 4;
    surface.needsUpdate = true;
  }, [surface]);
  return <Shell surface={surface} />;
}

export function DragonEgg({ mobile }: { mobile: boolean }) {
  return mobile ? <Suspense fallback={null}><MobileShell /></Suspense> : <Shell />;
}

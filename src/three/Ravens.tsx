import { useMemo, useRef } from 'react';
import { useSafeFrame } from './useSafeFrame';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { RAVEN_GLB as ravenUrl } from '../assets/ravenData';
import { S } from './sceneState';
import { world } from '../store';

type Bird = {
  mesh: THREE.Mesh;
  r: number;
  y: number;
  sp: number;
  ph: number;
  flap: number;
  off: number;
  p0: number;
  p1: number;
};

const FRAMES = 12;

function setFlap(mesh: THREE.Mesh, f: number, prev: { p0: number; p1: number }) {
  const inf = mesh.morphTargetInfluences;
  if (!inf || !inf.length) return;
  const n = Math.min(FRAMES, inf.length);
  const ff = ((f % n) + n) % n;
  const i0 = Math.floor(ff);
  const i1 = (i0 + 1) % n;
  const fr = ff - i0;
  if (prev.p0 >= 0) inf[prev.p0] = 0;
  if (prev.p1 >= 0) inf[prev.p1] = 0;
  inf[i0] = 1 - fr;
  inf[i1] = fr;
  prev.p0 = i0;
  prev.p1 = i1;
}

export function Ravens({ mobile }: { mobile: boolean }) {
  const { scene } = useGLTF(ravenUrl);
  const base = useMemo(() => {
    let m: THREE.Mesh | null = null;
    scene.traverse((o) => {
      if (!m && (o as THREE.Mesh).isMesh) m = o as THREE.Mesh;
    });
    return m as THREE.Mesh | null;
  }, [scene]);

  const mat = useMemo(() => new THREE.MeshBasicMaterial({ color: '#05060a', fog: true }), []);
  const msgPrev = useRef({ p0: -1, p1: -1 });

  const { birds, messenger } = useMemo(() => {
    if (!base) return { birds: [] as Bird[], messenger: null as THREE.Mesh | null };
    const make = () => {
      const m = base.clone();
      m.material = mat;
      m.frustumCulled = false;
      m.position.set(0, 0, 0);
      m.rotation.set(0, 0, 0);
      if (m.morphTargetInfluences) m.morphTargetInfluences.fill(0);
      return m;
    };
    const list: Bird[] = Array.from({ length: mobile ? 4 : 7 }, () => ({
      mesh: make(),
      r: 6.5 + Math.random() * 5,
      y: 2.3 + Math.random() * 2.2,
      sp: (0.09 + Math.random() * 0.07) * (Math.random() < 0.3 ? -1 : 1),
      ph: Math.random() * Math.PI * 2,
      flap: 0.75 + Math.random() * 0.5,
      off: Math.random() * FRAMES,
      p0: -1,
      p1: -1,
    }));
    list.forEach((b) => b.mesh.scale.setScalar(0.0052 + Math.random() * 0.0016));
    const msg = make();
    msg.scale.setScalar(0);
    msg.visible = false;
    return { birds: list, messenger: msg };
  }, [base, mat, mobile]);

  const tmp = useMemo(() => new THREE.Vector3(), []);
  const look = useMemo(() => new THREE.Vector3(), []);
  const p0 = useMemo(() => new THREE.Vector3(), []);
  const p1 = useMemo(() => new THREE.Vector3(), []);
  const p2 = useMemo(() => new THREE.Vector3(), []);

  useSafeFrame((state) => {
    const t = state.clock.elapsedTime;
    const close = S.ravens;
    for (let i = 0; i < birds.length; i++) {
      const b = birds[i];
      const ang = b.ph + t * b.sp;
      const r = THREE.MathUtils.lerp(b.r, b.r * 0.55, close);
      const y = THREE.MathUtils.lerp(b.y, b.y * 0.5 + 0.6, close) + Math.sin(t * 0.5 + b.ph) * 0.3;
      const cz = THREE.MathUtils.lerp(-4, -2.5, close);
      let x = Math.cos(ang) * r;
      let z = Math.sin(ang) * r * 0.7 + cz;
      let yy = y;
      if (S.rayActive) {
        const dx = x - S.mouse.x;
        const dy = yy - S.mouse.y;
        const dz = z - S.mouse.z;
        const d2 = dx * dx + dy * dy + dz * dz;
        if (d2 < 10) {
          const d = Math.sqrt(d2) || 0.001;
          const push = (1 - d / 3.16) * 1.7;
          x += (dx / d) * push;
          yy += (dy / d) * push * 0.55;
          z += (dz / d) * push;
        }
      }
      const sign = Math.sign(b.sp);
      const a2 = ang + 0.05 * sign;
      b.mesh.position.set(x, yy, z);
      b.mesh.lookAt(Math.cos(a2) * r, y, Math.sin(a2) * r * 0.7 + cz);
      b.mesh.rotateZ(-0.35 * sign);
      setFlap(b.mesh, t * 11 * b.flap * (1 + S.stir * 0.22) + b.off, b);
    }

    // the messenger raven: flies out of the rookery toward the viewer when a message is sent
    if (messenger) {
      const e = performance.now() / 1000 - world.ravenSent;
      if (e >= 0 && e < 4.5) {
        messenger.visible = true;
        const k = e / 4.5;
        const kk = k * k * (3 - 2 * k);
        p0.set(S.egg.x, S.egg.y + 0.4, S.egg.z);
        p1.set(S.egg.x + 2.6, S.egg.y + 1.6, S.egg.z + 3.4);
        p2.set(S.egg.x + 7.5, S.egg.y + 5.5, S.egg.z + 1.5);
        const a = (1 - kk) * (1 - kk);
        const bq = 2 * (1 - kk) * kk;
        const c = kk * kk;
        tmp.set(
          a * p0.x + bq * p1.x + c * p2.x,
          a * p0.y + bq * p1.y + c * p2.y,
          a * p0.z + bq * p1.z + c * p2.z
        );
        messenger.position.copy(tmp);
        const k2 = Math.min(1, kk + 0.02);
        const a2 = (1 - k2) * (1 - k2);
        const b2 = 2 * (1 - k2) * k2;
        const c2 = k2 * k2;
        look.set(
          a2 * p0.x + b2 * p1.x + c2 * p2.x,
          a2 * p0.y + b2 * p1.y + c2 * p2.y,
          a2 * p0.z + b2 * p1.z + c2 * p2.z
        );
        messenger.lookAt(look);
        messenger.scale.setScalar(0.0075 * Math.min(1, e * 3));
        setFlap(messenger, t * 16, msgPrev.current);
      } else if (messenger.visible) {
        messenger.visible = false;
        messenger.scale.setScalar(0);
      }
    }
  });

  return (
    <group>
      {birds.map((b, i) => (
        <primitive key={i} object={b.mesh} />
      ))}
      {messenger && <primitive object={messenger} />}
    </group>
  );
}

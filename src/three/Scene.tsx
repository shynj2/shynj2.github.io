import { Component, Suspense, useMemo, useRef, useState, type ReactNode } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { useSafeFrame } from './useSafeFrame';
import { PerformanceMonitor } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette, ChromaticAberration, ToneMapping, HueSaturation, Pixelation } from '@react-three/postprocessing';
import { ToneMappingMode } from 'postprocessing';
import * as THREE from 'three';
import { DragonEgg } from './DragonEgg';
import { Astrolabe } from './Astrolabe';
import { Sky, Mist } from './Atmosphere';
import { Snow, Embers } from './Particles';
import { LightPillars } from './LightPillars';
import { SpiritDragon } from './SpiritDragon';
import { Phoenix } from './Phoenix';
import { Banners, Beacons, FrostVortex, HouseOrbs } from './WorldEvents';
import { Ravens } from './Ravens';
import { LivingHalo } from './LivingHalo';
import { sampleKF, sampleYaw } from './keyframes';
import { resetScroll } from '../hooks/useSmoothScroll';
import { S, damp } from './sceneState';
import { useUI, world } from '../store';
import { ambience } from '../audio/ambience';

class Safe extends Component<{ children: ReactNode }, { err: boolean }> {
  state = { err: false };
  static getDerivedStateFromError() {
    return { err: true };
  }
  render() {
    return this.state.err ? null : this.props.children;
  }
}

/** Hermite ease used for the white-out curve. */
const smooth01 = (x: number) => {
  const t = Math.min(1, Math.max(0, x));
  return t * t * (3 - 2 * t);
};

function Rig({ focus, relic }: { focus: React.RefObject<THREE.Group | null>; relic: React.RefObject<THREE.Group | null> }) {
  const { camera, size } = useThree();
  const look = useRef(new THREE.Vector3(0, 0.6, 0));
  const ray = useMemo(() => new THREE.Raycaster(), []);
  const plane = useMemo(() => new THREE.Plane(new THREE.Vector3(0, 0, 1), 0), []);
  const ndc = useMemo(() => new THREE.Vector2(), []);
  const hit = useMemo(() => new THREE.Vector3(), []);
  const proj = useMemo(() => new THREE.Vector3(), []);
  const prevDir = useMemo(() => new THREE.Vector3(0, 0, -1), []);
  const wasActive = useRef(false);
  const introCam = useMemo(() => new THREE.Vector3(0, 1.6, 13), []);
  const lastHeat = useRef(-1);
  const born = useRef(false);
  // set for a single frame when the world has to reappear exactly on the frozen egg
  const snap = useRef(false);

  useSafeFrame((_, delta) => {
    const dt = Math.min(delta, 1 / 20);
    // the white-out runs on its own, looser clock so its one-second of light is always one second
    const wdt = Math.min(delta, 0.25);
    const aspect = size.width / size.height;
    const mobile = aspect < 0.8;
    S.mobile = mobile;
    const k = sampleKF(world.chapter, mobile, world.rtl);
    const entered = useUI.getState().entered;
    S.intro = damp(S.intro, entered ? 1 : 0, entered ? 0.75 : 5, dt);
    const intro = S.intro;

    // camera — slow, damped, never rolls (comfortable, no motion sickness)
    const motion = world.reduced ? 0.25 : 1;
    const px = mobile ? 0 : world.pointer.x * 0.3 * motion;
    const py = mobile ? 0 : world.pointer.y * 0.16 * motion;
    const tx = THREE.MathUtils.lerp(introCam.x, k.cam[0] + px, intro);
    const ty = THREE.MathUtils.lerp(introCam.y, k.cam[1] + py, intro);
    const tz = THREE.MathUtils.lerp(introCam.z, k.cam[2], intro);
    const lam = 2.2;
    camera.position.x = damp(camera.position.x, tx, lam, dt);
    camera.position.y = damp(camera.position.y, ty, lam, dt);
    camera.position.z = damp(camera.position.z, tz, lam, dt);
    look.current.x = damp(look.current.x, k.look[0], lam, dt);
    look.current.y = damp(look.current.y, k.look[1], lam, dt);
    look.current.z = damp(look.current.z, k.look[2], lam, dt);
    camera.lookAt(look.current);
    camera.updateMatrixWorld();

    const g = focus.current;
    if (g) {
      g.position.x = damp(g.position.x, k.egg[0], 1.9, dt);
      g.position.y = damp(g.position.y, k.egg[1], 1.9, dt);
      g.position.z = damp(g.position.z, k.egg[2], 1.9, dt);
      const sc = damp(g.scale.x, k.scale, 1.9, dt);
      g.scale.setScalar(sc);
      S.egg.copy(g.position);
      S.focusScale = sc;
    }

    // scrolling turns the relic; the cursor leans it, a flick of the wheel kicks the spin
    S.stir = damp(S.stir, Math.min(1, Math.abs(world.velocity) / 1500), 3.4, dt);
    S.yawKick = THREE.MathUtils.clamp(S.yawKick * Math.exp(-1.5 * dt) + world.velocity * dt * 0.00042, -0.6, 0.6);
    const relicG = relic.current;
    if (relicG) {
      const yaw = sampleYaw(world.chapter) + world.pointer.x * 0.2 * motion + S.yawKick;
      relicG.rotation.y = damp(relicG.rotation.y, yaw, 1.15, dt);
      relicG.rotation.x = damp(relicG.rotation.x, -world.pointer.y * 0.09 * motion, 2.2, dt);
      relicG.rotation.z = damp(relicG.rotation.z, world.pointer.x * 0.05 * motion, 2.2, dt);
      S.relicYaw = relicG.rotation.y;
      S.relicShift.copy(relicG.position);
      const lean = (0.28 + S.touchAmt * 0.85) * motion;
      relicG.position.x = damp(relicG.position.x, world.pointer.x * 0.18 * lean, 2.6, dt);
      relicG.position.y = damp(relicG.position.y, world.pointer.y * 0.08 * lean, 2.6, dt);
    }

    // the white light has just swallowed everything — land exactly on the frozen egg
    if (snap.current) {
      snap.current = false;
      camera.position.set(tx, ty, tz);
      look.current.set(k.look[0], k.look[1], k.look[2]);
      camera.lookAt(look.current);
      camera.updateMatrixWorld();
      const yaw0 = sampleYaw(0);
      if (relicG) {
        relicG.rotation.set(0, yaw0, 0);
        relicG.position.set(0, 0, 0);
      }
      S.relicYaw = yaw0;
      S.relicShift.set(0, 0, 0);
      const fg = focus.current;
      if (fg) {
        fg.position.set(k.egg[0], k.egg[1], k.egg[2]);
        fg.scale.setScalar(k.scale);
        S.egg.copy(fg.position);
        S.focusScale = k.scale;
      }
    }

    // hold-to-heat + click shockwave for interactive bird/phoenix particles.
    // The longer the hold, the closer the relic gets to white-hot — it climbs with world.temp.
    const chargeTarget = world.holding ? 0.32 + 0.68 * Math.min(1, world.temp / 4000) : 0;
    world.charge = damp(world.charge, chargeTarget, world.holding ? 1.05 : 3.2, dt);
    world.burst = Math.max(0, world.burst - dt * 0.85);
    S.clickShock = world.clickShock;
    world.clickShock = 0;
    world.clickWave = Math.max(0, world.clickWave - dt * 3.2);
    S.clickWave = world.clickWave;

    /* ---- the overcharge: hold until the phoenix reaches 4000° ----
       The realm swallows itself in white light for a second, the light fades,
       and the story starts again from the frozen egg. */
    const heatRate = 60 + 540 * Math.min(1, S.hatch + S.awake * 0.3);
    if (world.holding && !world.igniting) world.temp = Math.min(4000, world.temp + dt * heatRate);
    else if (!world.igniting) world.temp = Math.max(0, world.temp - dt * 1500);

    if (!world.igniting && world.temp >= 4000) {
      world.igniting = true;
      world.igniteT = 0;
      world.ignite = 0;
      world.resetDone = false;
      world.holding = false;
      world.burst = 1;
      ambience.dracarys(1);
      window.dispatchEvent(new CustomEvent('dracarys'));
    }

    if (world.igniting) {
      world.igniteT += wdt;
      const e = world.igniteT;
      // 0 → 0.95s the light rises · 0.95 → 1.95s it holds the screen white · then it slowly dies out
      world.ignite = e < 0.95 ? smooth01(e / 0.95) : e < 1.95 ? 1 : Math.max(0, 1 - smooth01((e - 1.95) / 2.7));
      if (!world.resetDone && e >= 0.95) {
        world.resetDone = true;
        snap.current = true;
        born.current = false;
        resetScroll();
        world.chapter = 0;
        world.scroll = 0;
        world.progress = 0;
        world.velocity = 0;
        world.charge = 0;
        world.burst = 0;
        world.temp = 0;
        world.clickShock = 0;
        world.clickWave = 0;
        S.hatch = 0;
        S.flash = 0;
        S.awake = 0;
        S.dragon = 0;
        S.heat = 0.03;
        S.frost = 1;
        S.rings = 1;
        S.pillars = 0;
        S.orbs = 0;
        S.banners = 0;
        S.beacons = 0;
        S.petals = 0;
        S.neon = 0;
        S.mono = 0;
        S.pixel = 0;
        S.vortex = 1;
        S.ravens = 0.15;
        S.touchAmt = 0;
        S.hover = 0;
        S.stir = 0;
        S.yawKick = 0;
        useUI.getState().setChapter(0);
      }
      if (e >= 4.75) {
        world.igniting = false;
        world.ignite = 0;
        world.temp = 0;
      }
    } else {
      world.ignite = damp(world.ignite, 0, 4, dt);
    }
    S.blind = world.ignite;

    // story values
    S.heat = damp(S.heat, k.heat, 1.5, dt);
    S.frost = damp(S.frost, k.frost, 1.5, dt);
    S.rings = damp(S.rings, k.rings, 2, dt);
    S.pillars = damp(S.pillars, k.pillars, 1.3, dt);
    S.dragon = damp(S.dragon, k.dragon, 0.8, dt);
    S.ravens = damp(S.ravens, k.ravens, 0.9, dt);
    S.awake = damp(S.awake, k.awake, 1.1, dt);

    // chapter events
    S.vortex = damp(S.vortex, k.vortex, 1.4, dt);
    S.orbs = damp(S.orbs, k.orbs, 1.3, dt);
    S.banners = damp(S.banners, k.banners, 1.1, dt);
    S.beacons = damp(S.beacons, k.beacons, 0.9, dt);
    S.petals = damp(S.petals, k.petals, 1.5, dt);
    S.neon = damp(S.neon, k.neon, 1.6, dt);
    S.mono = damp(S.mono, k.mono, 1.8, dt);
    S.pixel = damp(S.pixel, k.pixel, 1.8, dt);

    // the birth of the phoenix — follows the scroll, so it plays backwards on the way up
    S.hatch = damp(S.hatch, k.hatch, 1.5, dt);
    S.flash = Math.exp(-Math.pow((S.hatch - 0.47) / 0.1, 2));
    if (!born.current && S.hatch > 0.5) {
      born.current = true;
      ambience.dracarys(1);
    } else if (born.current && S.hatch < 0.3) {
      born.current = false;
    }

    // the egg notices the cursor
    proj.copy(S.egg).project(camera);
    const dx = (world.pointer.x - proj.x) * aspect;
    const dy = world.pointer.y - proj.y;
    const near = world.pointerActive ? 1 - THREE.MathUtils.smoothstep(Math.hypot(dx, dy), 0.12, 0.6) : 0;
    S.hover = damp(S.hover, mobile ? 0 : near, 3, dt);

    // exact 3D camera-to-cursor ray & smoothed angular sweep velocity for particle repulsion
    const active = entered && world.pointerActive;
    S.rayActive = active;
    if (active) {
      ndc.set(world.pointer.x, world.pointer.y);
      ray.setFromCamera(ndc, camera);
      S.rayOrigin.copy(ray.ray.origin);
      S.rayDir.copy(ray.ray.direction);
      if (wasActive.current && dt > 1e-4) {
        const invDt = 1 / dt;
        const vBlend = 1 - Math.exp(-16 * dt);
        S.rayVel.x += ((S.rayDir.x - prevDir.x) * invDt - S.rayVel.x) * vBlend;
        S.rayVel.y += ((S.rayDir.y - prevDir.y) * invDt - S.rayVel.y) * vBlend;
        S.rayVel.z += ((S.rayDir.z - prevDir.z) * invDt - S.rayVel.z) * vBlend;
      } else {
        S.rayVel.set(0, 0, 0);
      }
      prevDir.copy(S.rayDir);
      if (ray.ray.intersectPlane(plane, hit)) S.mouse.lerp(hit, 1 - Math.exp(-6 * dt));

      // how close the hand is to the relic — a hit on the shell, or a pass near the rings
      const ox = S.rayOrigin.x - S.egg.x;
      const oy = S.rayOrigin.y - S.egg.y;
      const oz = S.rayOrigin.z - S.egg.z;
      const rdx = S.rayDir.x;
      const rdy = S.rayDir.y;
      const rdz = S.rayDir.z;
      const b = ox * rdx + oy * rdy + oz * rdz;
      const rad = S.focusScale * 1.28;
      const disc = b * b - (ox * ox + oy * oy + oz * oz - rad * rad);
      let hx = 0;
      let hy = 0;
      let hz = 0;
      let amt = 0;
      if (disc > 0) {
        let tHit = -b - Math.sqrt(disc);
        if (tHit < 0) tHit = -b + Math.sqrt(disc);
        if (tHit > 0) {
          hx = ox + rdx * tHit;
          hy = oy + rdy * tHit;
          hz = oz + rdz * tHit;
          amt = 1;
        }
      }
      if (amt < 1) {
        const closest = Math.max(0.5, -b);
        hx = ox + rdx * closest;
        hy = oy + rdy * closest;
        hz = oz + rdz * closest;
        const dist = Math.hypot(hx, hy, hz);
        amt = 1 - THREE.MathUtils.smoothstep(S.focusScale * 1.15, S.focusScale * 3.6, dist);
      }
      if (amt > 0.02) {
        S.touchWorld.set(S.egg.x + hx, S.egg.y + hy, S.egg.z + hz);
        const yaw = S.relicYaw;
        const cy = Math.cos(yaw);
        const sy = Math.sin(yaw);
        const lx = hx * cy - hz * sy;
        const lz = hx * sy + hz * cy;
        const len = Math.hypot(lx, hy, lz) || 1;
        S.touch.set(lx / len, hy / len, lz / len);
      }
      S.touchAmt = damp(S.touchAmt, amt, amt > S.touchAmt ? 7 : 3.2, dt);
    } else {
      S.rayVel.multiplyScalar(Math.exp(-12 * dt));
      S.touchAmt = damp(S.touchAmt, 0, 3.2, dt);
    }
    wasActive.current = active;

    world.heat = S.heat + world.charge * 0.45 + world.burst * 0.25 + S.hatch * 0.25 + S.blind * 1.6;
    const cssHeat = Math.min(1, Math.max(0, S.heat + world.charge * 0.42 + world.burst * 0.2 + S.blind * 1.2));
    // Throttled threshold avoids redundant root CSS custom-property recalculations on desktop
    if (Math.abs(cssHeat - lastHeat.current) > 0.012) {
      lastHeat.current = cssHeat;
      document.documentElement.style.setProperty('--heat', cssHeat.toFixed(3));
    }
    ambience.update(Math.min(1, S.heat), Math.min(1, world.charge + S.flash * 0.6));
  }, -1);

  return null;
}

function Ready() {
  const setReady = useUI((s) => s.setReady);
  const frames = useRef(0);
  useSafeFrame(() => {
    if (frames.current > 10) return;
    frames.current++;
    if (frames.current === 10) setReady();
  });
  return null;
}

function Effects({ multisampling }: { multisampling: number }) {
  /* eslint-disable @typescript-eslint/no-explicit-any */
  const bloom = useRef<any>(null);
  const hue = useRef<any>(null);
  const pix = useRef<any>(null);
  /* eslint-enable @typescript-eslint/no-explicit-any */
  const caOffset = useMemo(() => new THREE.Vector2(0.0006, 0.0004), []);
  const lastPix = useRef(-1);
  const lastSat = useRef(-99);
  useSafeFrame((state) => {
    if (bloom.current)
      bloom.current.intensity =
        1.05 +
        world.charge * 0.85 +
        world.burst * 1.4 +
        S.awake * 0.25 +
        S.flash * 1.5 +
        S.clickWave * 0.4 +
        S.touchAmt * 0.12 +
        // the 4000° overcharge blows the whole realm out into white light
        world.temp * 0.00035 +
        S.blind * 7;
    // minimal realm: the whole world loses its colour
    if (hue.current) {
      const sat = -0.94 * S.mono;
      if (Math.abs(sat - lastSat.current) > 0.001) {
        lastSat.current = sat;
        hue.current.saturation = sat;
      }
    }
    // game realm: the whole world turns into pixels
    if (pix.current) {
      const g = S.pixel < 0.06 ? 0 : Math.round((1.5 + S.pixel * 2.5) * state.gl.getPixelRatio());
      if (g !== lastPix.current) {
        lastPix.current = g;
        pix.current.granularity = g;
      }
    }
  });
  return (
    <EffectComposer multisampling={multisampling}>
      <Bloom ref={bloom} mipmapBlur levels={6} intensity={1.05} luminanceThreshold={0.6} luminanceSmoothing={0.25} radius={0.75} />
      <Pixelation ref={pix} granularity={0} />
      <HueSaturation ref={hue} saturation={0} />
      <ChromaticAberration offset={caOffset} radialModulation modulationOffset={0.35} />
      <Vignette offset={0.22} darkness={0.78} />
      <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
    </EffectComposer>
  );
}

export function Scene() {
  const mobile = useMemo(
    () => typeof window !== 'undefined' && (window.matchMedia('(pointer: coarse)').matches || window.innerWidth < 768),
    []
  );
  // Cap DPR at 1.5 on HiDPI desktops and pair 2× MSAA only on low-DPI displays:
  // keeps visuals razor-sharp while cutting RGBA16F fillrate & MSAA resolve bandwidth by ~50%.
  const maxDpr = useMemo(() => (typeof window !== 'undefined' ? Math.min(window.devicePixelRatio || 1, 1.5) : 1), []);
  const multisampling = mobile || maxDpr > 1.3 ? 0 : 2;
  const [dpr, setDpr] = useState(maxDpr);
  const focus = useRef<THREE.Group>(null);
  const relic = useRef<THREE.Group>(null);

  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-0 h-[100lvh] w-full" aria-hidden>
      <Canvas
        flat
        dpr={dpr}
        gl={{ antialias: false, alpha: false, powerPreference: 'high-performance', stencil: false }}
        camera={{ fov: 38, near: 0.1, far: 160, position: [0, 1.6, 13] }}
      >
        <color attach="background" args={['#04060b']} />
        <fogExp2 attach="fog" args={['#070b14', 0.035]} />
        <PerformanceMonitor
          flipflops={3}
          onDecline={() => setDpr((d) => Math.max(0.85, +(d - 0.25).toFixed(2)))}
          onIncline={() => setDpr((d) => Math.min(maxDpr, +(d + 0.15).toFixed(2)))}
        />
        <Rig focus={focus} relic={relic} />
        <Sky />
        <Mist />
        <Beacons />
        <Banners />
        <group ref={focus} position={[0, 0.3, 0]} scale={0.8}>
          <group ref={relic}>
            <DragonEgg />
            <Astrolabe />
            <LightPillars />
            <FrostVortex count={mobile ? 220 : 420} />
            <HouseOrbs />
            <LivingHalo mobile={mobile} />
          </group>
          <SpiritDragon mobile={mobile} />
          <Phoenix mobile={mobile} />
        </group>
        <Snow count={mobile ? 1100 : 2400} />
        <Embers count={mobile ? 600 : 1400} />
        <Safe>
          <Suspense fallback={null}>
            <Ravens />
          </Suspense>
        </Safe>
        <Ready />
        <Effects multisampling={multisampling} />
      </Canvas>
    </div>
  );
}

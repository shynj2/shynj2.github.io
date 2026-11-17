import { Component, Suspense, useMemo, useRef, useState, type ReactNode, type RefObject } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { useSafeFrame } from './useSafeFrame';
import { EffectComposer, Bloom, Vignette, ChromaticAberration, ToneMapping, HueSaturation, Pixelation } from '@react-three/postprocessing';
import { KernelSize, ToneMappingMode, type BloomEffect, type HueSaturationEffect, type PixelationEffect } from 'postprocessing';
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
import { RelicInteraction } from './relicInteraction';
import { PhoenixCycle } from './phoenixCycle';
import { resetScroll, setRebirthScrollLocked } from '../hooks/useSmoothScroll';
import { S, damp, touchSweep } from './sceneState';
import { useUI, world } from '../store';
import { ambience } from '../audio/ambience';

class Safe extends Component<{ children: ReactNode }, { err: boolean }> {
  state = { err: false };
  static getDerivedStateFromError() { return { err: true }; }
  render() { return this.state.err ? null : this.props.children; }
}

type RigProps = {
  focus: RefObject<THREE.Group | null>;
  relic: RefObject<THREE.Group | null>;
};

function Rig({ focus, relic }: RigProps) {
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
  const lastHeatPaint = useRef(0);
  const born = useRef(false);
  const interaction = useMemo(() => new RelicInteraction(), []);
  const cycle = useMemo(() => new PhoenixCycle(), []);

  useSafeFrame((state, delta) => {
    if (size.width <= 0 || size.height <= 0) return;
    const now = performance.now();
    const milestone = cycle.advance(now);
    const restart = milestone === 'return-to-egg';
    if (milestone === 'ignite') {
      setRebirthScrollLocked(true);
      world.burst = 1;
      ambience.fadeFinale();
      ambience.dracarys(0.74);
    } else if (restart) {
      ambience.returnToIce();
      resetScroll();
      useUI.setState({ chapter: 0, menu: false });
      Object.assign(world, {
        chapter: 0, scroll: 0, progress: 0, velocity: 0,
        charge: 0, burst: 0, clickShock: 0, clickWave: 0,
        phoenixReady: false, phoenixCharge: 0, pointerActive: false,
        ravenSent: -100,
      });
      born.current = false;
      lastHeat.current = -1;
      S.mouse.set(0, 0, 0);
      S.touch.set(0, 1, 0);
      S.touchAmt = S.hover = S.yawKick = S.stir = touchSweep.value.w = 0;
      S.intro = 1;
    } else if (milestone === 'finish') {
      setRebirthScrollLocked(false);
    }

    const dt = Math.min(delta, 0.05);
    const aspect = size.width / size.height;
    const portrait = aspect < 0.8;
    S.mobile = portrait;
    const k = sampleKF(world.chapter, portrait, world.rtl);
    const entered = useUI.getState().entered;
    const active = entered && world.pointerActive && !world.igniting;
    const pointer = world.pointer;
    pointer.x = active ? (world.pointerPx.x / size.width) * 2 - 1 : 0;
    pointer.y = active ? 1 - (world.pointerPx.y / size.height) * 2 : 0;
    const swipe = active && world.touchDragging;
    const wake = touchSweep.value;
    if (swipe) { wake.x = pointer.x; wake.y = pointer.y; }
    wake.z = aspect;
    wake.w = damp(wake.w, swipe ? 1 : 0, swipe ? 28 : 6.8, dt);

    S.intro = damp(S.intro, entered ? 1 : 0, entered ? 0.75 : 5, dt);
    const motion = world.reduced ? 0.25 : 1;
    const px = portrait ? 0 : pointer.x * 0.3 * motion;
    const py = portrait ? 0 : pointer.y * 0.16 * motion;
    const tx = THREE.MathUtils.lerp(introCam.x, k.cam[0] + px, S.intro);
    const ty = THREE.MathUtils.lerp(introCam.y, k.cam[1] + py, S.intro);
    const tz = THREE.MathUtils.lerp(introCam.z, k.cam[2], S.intro);
    if (restart) {
      camera.position.set(tx, ty, tz);
      look.current.set(...k.look);
    } else {
      camera.position.x = damp(camera.position.x, tx, 2.2, dt);
      camera.position.y = damp(camera.position.y, ty, 2.2, dt);
      camera.position.z = damp(camera.position.z, tz, 2.2, dt);
      look.current.x = damp(look.current.x, k.look[0], 2.2, dt);
      look.current.y = damp(look.current.y, k.look[1], 2.2, dt);
      look.current.z = damp(look.current.z, k.look[2], 2.2, dt);
    }
    camera.lookAt(look.current);
    camera.updateMatrixWorld();

    const g = focus.current;
    if (g) {
      if (restart) g.position.set(...k.egg);
      else {
        g.position.x = damp(g.position.x, k.egg[0], 1.9, dt);
        g.position.y = damp(g.position.y, k.egg[1], 1.9, dt);
        g.position.z = damp(g.position.z, k.egg[2], 1.9, dt);
      }
      const sc = restart ? k.scale : damp(g.scale.x, k.scale, 1.9, dt);
      g.scale.setScalar(sc);
      S.egg.copy(g.position);
      S.focusScale = sc;
    }

    // The scroll and pointer lean the relic independently of the camera.
    S.stir = damp(S.stir, Math.min(1, Math.abs(world.velocity) / 1500), 3.4, dt);
    S.yawKick = THREE.MathUtils.clamp(S.yawKick * Math.exp(-1.5 * dt) + world.velocity * dt * 0.00042, -0.6, 0.6);
    const relicG = relic.current;
    if (relicG) {
      const yaw = sampleYaw(world.chapter) + pointer.x * 0.2 * motion + S.yawKick;
      if (restart) {
        relicG.rotation.set(0, yaw, 0);
        relicG.position.set(0, 0, 0);
      } else {
        relicG.rotation.y = damp(relicG.rotation.y, yaw, 1.15, dt);
        relicG.rotation.x = damp(relicG.rotation.x, -pointer.y * 0.09 * motion, 2.2, dt);
        relicG.rotation.z = damp(relicG.rotation.z, pointer.x * 0.05 * motion, 2.2, dt);
        const lean = (0.28 + S.touchAmt * 0.85) * motion;
        relicG.position.x = damp(relicG.position.x, pointer.x * 0.18 * lean, 2.6, dt);
        relicG.position.y = damp(relicG.position.y, pointer.y * 0.08 * lean, 2.6, dt);
      }
      if (active) {
        relicG.updateWorldMatrix(true, false);
        S.relicFromWorld.copy(relicG.matrixWorld).invert();
      }
    }

    // Ordinary warmth is available everywhere; the separate phoenix charge is not.
    const chargeTarget = world.holding ? 0.74 + world.phoenixCharge * 0.26 : 0;
    world.charge = damp(world.charge, chargeTarget, world.holding ? 1.7 : 3.2, Math.min(delta, 0.25));
    world.burst = Math.max(0, world.burst - dt * 0.85);
    S.clickShock = world.clickShock;
    world.clickShock = 0;
    world.clickWave = Math.max(0, world.clickWave - dt * 3.2);
    S.clickWave = world.clickWave;
    S.blind = world.resetDone ? 0 : world.ignite;

    if (restart) {
      const { cam: _cam, egg: _egg, look: _look, scale: _scale, ...chapterState } = k;
      Object.assign(S, chapterState);
    } else {
      S.heat = damp(S.heat, k.heat, 1.5, dt);
      S.frost = damp(S.frost, k.frost, 1.5, dt);
      S.rings = damp(S.rings, k.rings, 2, dt);
      S.pillars = damp(S.pillars, k.pillars, 1.3, dt);
      S.dragon = damp(S.dragon, k.dragon, 0.8, dt);
      S.ravens = damp(S.ravens, k.ravens, 0.9, dt);
      S.awake = damp(S.awake, k.awake, 1.1, dt);
      S.vortex = damp(S.vortex, k.vortex, 1.4, dt);
      S.orbs = damp(S.orbs, k.orbs, 1.3, dt);
      S.banners = damp(S.banners, k.banners, 1.1, dt);
      S.beacons = damp(S.beacons, k.beacons, 0.9, dt);
      S.petals = damp(S.petals, k.petals, 1.5, dt);
      S.neon = damp(S.neon, k.neon, 1.6, dt);
      S.mono = damp(S.mono, k.mono, 1.8, dt);
      S.pixel = damp(S.pixel, k.pixel, 1.8, dt);
      // The hatch is reversible when scrolling back up.
      S.hatch = damp(S.hatch, k.hatch, 1.5, dt);
    }
    S.flash = S.hatch > 0.01 ? Math.exp(-Math.pow((S.hatch - 0.47) / 0.1, 2)) : 0;
    if (!born.current && S.hatch > 0.5) {
      born.current = true;
      ambience.dracarys(1);
    } else if (born.current && S.hatch < 0.3) {
      born.current = false;
    }

    interaction.update(camera, size.width, size.height, state.clock.elapsedTime, entered && !world.igniting);

    proj.copy(S.egg).project(camera);
    const dx = (pointer.x - proj.x) * aspect;
    const dy = pointer.y - proj.y;
    const near = active ? 1 - THREE.MathUtils.smoothstep(Math.hypot(dx, dy), 0.12, 0.6) : 0;
    S.hover = damp(S.hover, world.touching ? near * 0.65 : near, 3, dt);
    S.rayActive = active;
    if (active) {
      ndc.set(pointer.x, pointer.y);
      ray.setFromCamera(ndc, camera);
      S.rayOrigin.copy(ray.ray.origin);
      S.rayDir.copy(ray.ray.direction);
      if (wasActive.current && dt > 1e-4) {
        const vBlend = 1 - Math.exp(-16 * dt);
        S.rayVel.x += ((S.rayDir.x - prevDir.x) / dt - S.rayVel.x) * vBlend;
        S.rayVel.y += ((S.rayDir.y - prevDir.y) / dt - S.rayVel.y) * vBlend;
        S.rayVel.z += ((S.rayDir.z - prevDir.z) / dt - S.rayVel.z) * vBlend;
      } else S.rayVel.set(0, 0, 0);
      prevDir.copy(S.rayDir);
      if (ray.ray.intersectPlane(plane, hit)) {
        if (!wasActive.current) S.mouse.copy(hit);
        else S.mouse.lerp(hit, 1 - Math.exp(-(world.touching ? 14 : 6) * dt));
      }

      // Find the shell contact, or the nearest point on the ray for a pass through its rings.
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
        amt = 1 - THREE.MathUtils.smoothstep(dist, S.focusScale * 1.12, S.focusScale * 3.6);
      }
      if (amt > 0.02) {
        S.touchWorld.set(S.egg.x + hx, S.egg.y + hy, S.egg.z + hz);
        S.touch.copy(S.touchWorld).applyMatrix4(S.relicFromWorld).normalize();
      }
      S.touchAmt = damp(S.touchAmt, amt, amt > S.touchAmt ? 7 : 3.2, dt);
    } else {
      S.rayVel.multiplyScalar(Math.exp(-12 * dt));
      S.touchAmt = damp(S.touchAmt, 0, 3.2, dt);
    }
    wasActive.current = active;

    world.heat = S.heat + world.charge * 0.45 + world.burst * 0.25 + S.hatch * 0.25;
    const cssHeat = Math.min(1, Math.max(0, S.heat + world.charge * 0.42 + world.burst * 0.2));
    const cssStep = world.mobile ? 0.022 : 0.012;
    if (Math.abs(cssHeat - lastHeat.current) > cssStep && (!world.mobile || restart || now - lastHeatPaint.current > 85)) {
      lastHeatPaint.current = now;
      lastHeat.current = cssHeat;
      document.documentElement.style.setProperty('--heat', cssHeat.toFixed(3));
    }
    ambience.update(Math.min(1, S.heat), Math.min(1, world.charge + S.flash * 0.6), world.chapter, S.hatch, world.phoenixCharge);
  }, -1);

  return null;
}

function Ready() {
  const setReady = useUI((s) => s.setReady);
  const stage = useRef({ frames: 0, warming: false, compiled: false });
  useSafeFrame(({ gl, camera, scene }) => {
    const status = stage.current;
    if (useUI.getState().ready) return;
    status.frames++;
    if (!status.warming && status.frames >= 3 && scene.getObjectByName('Dragon egg shell')) {
      status.warming = true;
      // Match the linear render target used by the composer so the warmed programs are reused.
      const previous = gl.getRenderTarget();
      const scratch = new THREE.WebGLRenderTarget(1, 1, { type: THREE.HalfFloatType });
      const done = () => { status.compiled = true; };
      try {
        gl.setRenderTarget(scratch);
        void gl.compileAsync(scene, camera).then(done, done);
      } catch {
        done();
      } finally {
        gl.setRenderTarget(previous);
        scratch.dispose();
      }
    }
    if ((status.compiled && status.frames >= 9) || status.frames > 120) setReady();
  });
  return null;
}

function Effects({ mobile }: { mobile: boolean }) {
  const bloom = useRef<BloomEffect>(null);
  const hue = useRef<HueSaturationEffect>(null);
  const pix = useRef<PixelationEffect>(null);
  const caOffset = useMemo(() => new THREE.Vector2(0.0006, 0.0004), []);
  const lastPix = useRef(-1);
  const lastSat = useRef(-99);
  useSafeFrame((state) => {
    if (bloom.current) {
      bloom.current.intensity = 1.05 + world.charge * 0.85 + world.burst * 1.4 + S.awake * 0.25 +
        S.flash * 1.5 + S.clickWave * 0.4 + S.touchAmt * 0.12 + world.phoenixCharge * 1.4 + S.blind * 7;
    }
    if (hue.current) {
      const sat = -0.94 * S.mono;
      if (Math.abs(sat - lastSat.current) > 0.001) {
        lastSat.current = sat;
        hue.current.saturation = sat;
      }
    }
    if (pix.current) {
      const g = S.pixel < 0.06 ? 0 : Math.round((1.5 + S.pixel * 2.5) * state.gl.getPixelRatio());
      if (g !== lastPix.current) {
        lastPix.current = g;
        pix.current.granularity = g;
      }
    }
  });
  return (
    <EffectComposer multisampling={0}>
      <Bloom ref={bloom} mipmapBlur={!mobile} levels={6} resolutionScale={0.27} kernelSize={KernelSize.SMALL} intensity={1.05} luminanceThreshold={0.64} luminanceSmoothing={0.27} radius={0.75} />
      {!mobile && <Pixelation ref={pix} granularity={0} />}
      <HueSaturation ref={hue} saturation={0} />
      {!mobile && <ChromaticAberration offset={caOffset} radialModulation modulationOffset={0.35} />}
      <Vignette offset={0.22} darkness={0.78} />
      <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
    </EffectComposer>
  );
}

export function Scene() {
  const [mobile] = useState(() => window.matchMedia('(any-pointer: coarse), (max-width: 767px)').matches);
  // Use a stable render buffer. Resizing it during scrolling can flash unpainted tiles.
  const [dpr] = useState(() => {
    const budget = mobile ? 690_000 : 3_400_000;
    const viewportPixels = Math.max(1, window.innerWidth * window.innerHeight);
    return Math.min(window.devicePixelRatio || 1, mobile ? 1.35 : 1.5, Math.sqrt(budget / viewportPixels));
  });
  const focus = useRef<THREE.Group>(null);
  const relic = useRef<THREE.Group>(null);

  return (
      <div className="scene-canvas pointer-events-none fixed inset-x-0 top-0 z-0 h-[100lvh] w-full" aria-hidden>
        <Canvas
          flat
          frameloop="always"
          resize={{ scroll: false, debounce: { resize: 110, scroll: 0 } }}
          dpr={dpr}
          gl={{ antialias: false, alpha: false, powerPreference: 'high-performance', stencil: false }}
          camera={{ fov: 38, near: 0.1, far: 160, position: [0, 1.6, 13] }}
        >
          <color attach="background" args={['#04060b']} />
          <fogExp2 attach="fog" args={['#070b14', 0.035]} />
          <Rig focus={focus} relic={relic} />
          <Sky mobile={mobile} />
          <Mist mobile={mobile} />
          <Beacons />
          <Banners />
          <group ref={focus} position={[0, 0.3, 0]} scale={0.8}>
            <group ref={relic}>
              <DragonEgg mobile={mobile} />
              <Astrolabe />
              <LightPillars />
              <FrostVortex count={mobile ? 340 : 610} />
              <HouseOrbs />
              <LivingHalo mobile={mobile} />
            </group>
            <SpiritDragon mobile={mobile} />
            <Phoenix mobile={mobile} />
          </group>
          <Snow count={mobile ? 1000 : 2500} />
          <Embers count={mobile ? 520 : 1450} />
          <Safe>
            <Suspense fallback={null}>
              <Ravens mobile={mobile} />
            </Suspense>
          </Safe>
          <Ready />
          <Effects mobile={mobile} />
        </Canvas>
      </div>
  );
}

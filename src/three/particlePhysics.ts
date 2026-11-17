import * as THREE from 'three';
import { S } from './sceneState';
import { world } from '../store';

// tan(38deg / 2) — matches the Scene camera FOV (38°)
const TAN_HALF_FOV = Math.tan((38 * Math.PI) / 360);

export type FieldConfig = {
  /** Repulsion circle radius as fraction of viewport half-height (default ~0.22). */
  screenRadius?: number;
  /** Spring stiffness pulling scattered motes back together (default 6.6). */
  spring?: number;
  /** Velocity damping rate for smooth fluid return (default 4.3). */
  damping?: number;
  /** Maximum displacement in local units (default 3.8). */
  maxDisp?: number;
  /** Click shockwave strength multiplier (default 1.0). */
  clickPower?: number;
};

/**
 * Zero-allocation 3D particle repulsion & spring-reformation solver.
 * - Hovering carves a crisp view-aligned circular pocket around the cursor,
 *   piling particles into a glowing rim and leaving a fluid ribbon wake on sweeps.
 * - Clicking sends a radial shockwave scattering nearby particles outward.
 * - Scattered particles continuously spring and stream back to their living,
 *   animated home positions on the bird / phoenix.
 * - Sleeps at 0.00ms CPU & 0 GPU uploads whenever undisturbed.
 */
export class ParticleSpringField {
  readonly count: number;
  readonly home: Float32Array;
  readonly disp: Float32Array;
  readonly attr: THREE.BufferAttribute;

  private readonly vel: Float32Array;
  // Packed per particle: [stiffMul, radMul, dirCos, dirSin]
  private readonly meta: Float32Array;
  private readonly screenRadius: number;
  private readonly spring: number;
  private readonly damping: number;
  private readonly maxDisp: number;
  private readonly clickPower: number;
  private sleeping = true;

  // Cached per-step local ray parameters (written in beginStep, read in step)
  private rox = 0;
  private roy = 0;
  private roz = 10;
  private rdx = 0;
  private rdy = 0;
  private rdz = -1;
  private ux = 1;
  private uy = 0;
  private uz = 0;
  private wx = 0;
  private wy = 1;
  private wz = 0;
  private svx = 0;
  private svy = 0;
  private svz = 0;
  private fovK = 0.075;
  private holdMul = 1;
  private shock = 0;
  private rayNear = false;

  get needsHome() { return this.rayNear; }

  constructor(count: number, cfg: FieldConfig = {}) {
    this.count = count;
    this.home = new Float32Array(count * 3);
    this.disp = new Float32Array(count * 3);
    this.vel = new Float32Array(count * 3);
    this.meta = new Float32Array(count * 4);
    this.screenRadius = cfg.screenRadius ?? 0.22;
    this.spring = cfg.spring ?? 10.2;
    this.damping = cfg.damping ?? 5.1;
    this.maxDisp = cfg.maxDisp ?? 3.6;
    this.clickPower = cfg.clickPower ?? 1.0;

    for (let i = 0; i < count; i++) {
      const m = i * 4;
      // Varied spring stiffness so particles weave back organically in flowing streams
      this.meta[m] = 0.7 + Math.random() * 0.62;
      // Subtle rim thickness jitter so the cursor boundary looks organic and alive
      this.meta[m + 1] = 0.91 + Math.random() * 0.18;
      const ang = Math.random() * Math.PI * 2;
      this.meta[m + 2] = Math.cos(ang);
      this.meta[m + 3] = Math.sin(ang);
    }

    this.attr = new THREE.BufferAttribute(this.disp, 3);
    this.attr.setUsage(THREE.DynamicDrawUsage);
  }

  /**
   * Checks whether the cursor ray intersects the creature's bounding sphere
   * or particles are still reforming. Returns `false` when completely idle
   * so callers can skip evaluating `home` positions altogether.
   */
  beginStep(cx: number, cy: number, cz: number, boundRadius: number, space: 'focus' | 'relic' = 'focus'): boolean {
    if (!S.rayActive || world.touchDragging) {
      this.rayNear = false;
      return !this.sleeping;
    }
    const invS = 1 / Math.max(S.focusScale, 0.05);
    let rox = (S.rayOrigin.x - S.egg.x) * invS;
    let roy = (S.rayOrigin.y - S.egg.y) * invS;
    let roz = (S.rayOrigin.z - S.egg.z) * invS;
    let rdx = S.rayDir.x;
    let rdy = S.rayDir.y;
    let rdz = S.rayDir.z;
    let velX = S.rayVel.x;
    let velY = S.rayVel.y;
    let velZ = S.rayVel.z;
    // Transform with the actual model matrix, including the relic's lean and offset.
    if (space === 'relic') {
      const e = S.relicFromWorld.elements;
      const { x, y, z } = S.rayOrigin;
      rox = e[0] * x + e[4] * y + e[8] * z + e[12];
      roy = e[1] * x + e[5] * y + e[9] * z + e[13];
      roz = e[2] * x + e[6] * y + e[10] * z + e[14];
      const dx = rdx, dy = rdy, dz = rdz;
      rdx = (e[0] * dx + e[4] * dy + e[8] * dz) * S.focusScale;
      rdy = (e[1] * dx + e[5] * dy + e[9] * dz) * S.focusScale;
      rdz = (e[2] * dx + e[6] * dy + e[10] * dz) * S.focusScale;
      const vx = velX, vy = velY, vz = velZ;
      velX = (e[0] * vx + e[4] * vy + e[8] * vz) * S.focusScale;
      velY = (e[1] * vx + e[5] * vy + e[9] * vz) * S.focusScale;
      velZ = (e[2] * vx + e[6] * vy + e[10] * vz) * S.focusScale;
    }

    const dcx = cx - rox;
    const dcy = cy - roy;
    const dcz = cz - roz;
    const centerAlong = Math.max(1.5, dcx * rdx + dcy * rdy + dcz * rdz);

    const motionScale = world.reduced ? 0.55 : 1;
    const fovK = TAN_HALF_FOV * this.screenRadius * motionScale * (world.touching ? 1.22 : 1);
    const holdMul = 1 + world.charge * 0.48 + S.clickWave * 0.32;
    const shock = S.clickShock * this.clickPower * motionScale;
    const maxAlong = centerAlong + boundRadius;
    const baseR = Math.min(2.4, Math.max(0.4, centerAlong * fovK));
    const maxR = Math.min(2.6, Math.max(0.4, maxAlong * fovK)) * Math.max(holdMul, shock > 0.01 ? 1.95 : holdMul);

    let rayNear = false;
    if (S.rayActive) {
      const px = dcx - rdx * centerAlong;
      const py = dcy - rdy * centerAlong;
      const pz = dcz - rdz * centerAlong;
      const reach = maxR * 1.12 + boundRadius;
      rayNear = px * px + py * py + pz * pz <= reach * reach;
    }

    if (this.sleeping && !rayNear) return false;

    this.rox = rox;
    this.roy = roy;
    this.roz = roz;
    this.rdx = rdx;
    this.rdy = rdy;
    this.rdz = rdz;
    this.fovK = fovK;
    this.holdMul = holdMul;
    this.shock = shock;
    this.rayNear = rayNear;

    // Build orthonormal basis (u, w) perpendicular to ray for zero-distance fallback & subtle swirl
    const refY = Math.abs(rdy) < 0.9 ? 1 : 0;
    const refX = refY === 0 ? 1 : 0;
    let ux = refY * rdz;
    let uy = -refX * rdz;
    let uz = refX * rdy - refY * rdx;
    const uLen = Math.hypot(ux, uy, uz) || 1;
    ux /= uLen;
    uy /= uLen;
    uz /= uLen;
    this.ux = ux;
    this.uy = uy;
    this.uz = uz;
    this.wx = rdy * uz - rdz * uy;
    this.wy = rdz * ux - rdx * uz;
    this.wz = rdx * uy - rdy * ux;

    // Cursor sweep velocity scaled to the creature's local depth, softly clamped
    const vScale = centerAlong;
    let svx = velX * vScale;
    let svy = velY * vScale;
    let svz = velZ * vScale;
    const svMag = Math.hypot(svx, svy, svz);
    const maxSweep = baseR * 18;
    if (svMag > maxSweep) {
      const k = maxSweep / svMag;
      svx *= k;
      svy *= k;
      svz *= k;
    }
    this.svx = svx;
    this.svy = svy;
    this.svz = svz;
    return true;
  }

  /** Integrates repulsion, click shockwave, and spring return across all particles. */
  step(rawDt: number): void {
    const dt = Math.min(Math.max(rawDt, 0.001), 0.033);
    const count = this.count;
    const home = this.home;
    const disp = this.disp;
    const vel = this.vel;
    const meta = this.meta;

    const rox = this.rox;
    const roy = this.roy;
    const roz = this.roz;
    const rdx = this.rdx;
    const rdy = this.rdy;
    const rdz = this.rdz;
    const ux = this.ux;
    const uy = this.uy;
    const uz = this.uz;
    const wx = this.wx;
    const wy = this.wy;
    const wz = this.wz;
    const svx = this.svx;
    const svy = this.svy;
    const svz = this.svz;

    const rayNear = this.rayNear;
    const fovK = this.fovK;
    const holdMul = this.holdMul;
    const shock = this.shock;
    const hasShock = shock > 0.01;
    const outerMul = (hasShock ? Math.max(holdMul, 1.95) : holdMul) * 1.1;

    const springBase = this.spring;
    const dampMul = Math.exp(-this.damping * dt);
    const maxD = this.maxDisp;
    const maxD2 = maxD * maxD;

    let awake = false;

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      const m = i * 4;
      let ox = disp[i3];
      let oy = disp[i3 + 1];
      let oz = disp[i3 + 2];
      let vx = vel[i3];
      let vy = vel[i3 + 1];
      let vz = vel[i3 + 2];

      const stiffMul = meta[m];
      const radMul = meta[m + 1];

      if (rayNear) {
        const px = home[i3] + ox;
        const py = home[i3 + 1] + oy;
        const pz = home[i3 + 2] + oz;

        const tpx = px - rox;
        const tpy = py - roy;
        const tpz = pz - roz;
        const along = tpx * rdx + tpy * rdy + tpz * rdz;

        if (along > 0.5) {
          // Exact screen-consistent radius at this particle's own camera depth
          const baseR = Math.min(2.4, Math.max(0.38, along * fovK));
          const outerMax = baseR * outerMul;
          const dx = tpx - rdx * along;
          const dy = tpy - rdy * along;
          const dz = tpz - rdz * along;
          const d2 = dx * dx + dy * dy + dz * dz;

          if (d2 < outerMax * outerMax) {
            const d = Math.sqrt(d2);
            let nx: number;
            let ny: number;
            let nz: number;
            const cAng = meta[m + 2];
            const sAng = meta[m + 3];
            if (d > 1e-4) {
              const invD = 1 / d;
              nx = dx * invD;
              ny = dy * invD;
              nz = dz * invD;
            } else {
              nx = ux * cAng + wx * sAng;
              ny = uy * cAng + wy * sAng;
              nz = uz * cAng + wz * sAng;
            }

            // 1. Hover & click-hold circular cavity repulsion
            const ri = baseR * holdMul * radMul;
            if (d < ri) {
              const f = 1 - d / ri;
              const f2 = f * f;
              // Crisp compressed ring at boundary + clean inner cavity matching reference interaction
              const push = ri * (36 * f + 108 * f2) * dt;
              const depthJit = cAng * push * 0.12;
              // Tangential curl (rayDir × n) adds subtle living fluid swirl along the rim
              const tx = rdy * nz - rdz * ny;
              const ty = rdz * nx - rdx * nz;
              const tz = rdx * ny - rdy * nx;
              const swirl = sAng * push * 0.11 * f;
              const carry = (0.28 * f + 0.3 * f2) * dt;

              vx += nx * push + tx * swirl + rdx * depthJit + svx * carry;
              vy += ny * push + ty * swirl + rdy * depthJit + svy * carry;
              vz += nz * push + tz * swirl + rdz * depthJit + svz * carry;

              // Instant soft core clearance so rapid cursor sweeps immediately carve a clean ribbon wake
              if (f > 0.28) {
                const nudge = (f - 0.28) * ri * (1 - Math.exp(-24 * dt)) * 0.72;
                ox += nx * nudge;
                oy += ny * nudge;
                oz += nz * nudge;
              }
            }

            // 2. Instant click radial shockwave — blasts open a wide glowing ring that springs back together
            if (hasShock) {
              const sr = baseR * 1.95 * radMul;
              if (d < sr) {
                const fc = 1 - d / sr;
                const kick = baseR * (6.5 * fc + 11.2 * fc * fc) * (0.82 + 0.36 * stiffMul) * shock;
                const zKick = cAng * kick * 0.18;
                vx += nx * kick + rdx * zKick;
                vy += ny * kick + rdy * zKick;
                vz += nz * kick + rdz * zKick;
              }
            }
          }
        }
      }

      // 3. Smooth damped spring return — every scattered particle pulls back toward its living home
      if (ox * ox + oy * oy + oz * oz + vx * vx + vy * vy + vz * vz > 1.5e-6) {
        const kDt = springBase * stiffMul * dt;
        vx = (vx - ox * kDt) * dampMul;
        vy = (vy - oy * kDt) * dampMul;
        vz = (vz - oz * kDt) * dampMul;

        ox += vx * dt;
        oy += vy * dt;
        oz += vz * dt;

        const o2 = ox * ox + oy * oy + oz * oz;
        if (o2 > maxD2) {
          const clampK = maxD / Math.sqrt(o2);
          ox *= clampK;
          oy *= clampK;
          oz *= clampK;
          vx *= 0.6;
          vy *= 0.6;
          vz *= 0.6;
        }

        if (o2 + vx * vx + vy * vy + vz * vz > 1.5e-6) {
          disp[i3] = ox;
          disp[i3 + 1] = oy;
          disp[i3 + 2] = oz;
          vel[i3] = vx;
          vel[i3 + 1] = vy;
          vel[i3 + 2] = vz;
          awake = true;
        } else {
          disp[i3] = 0;
          disp[i3 + 1] = 0;
          disp[i3 + 2] = 0;
          vel[i3] = 0;
          vel[i3 + 1] = 0;
          vel[i3 + 2] = 0;
        }
      }
    }

    if (awake || !this.sleeping) this.attr.needsUpdate = true;
    this.sleeping = !awake;
  }

  /** Smoothly resets all displacements when a creature fades out completely. */
  reset(): void {
    if (this.sleeping) return;
    this.disp.fill(0);
    this.vel.fill(0);
    this.attr.needsUpdate = true;
    this.sleeping = true;
  }
}

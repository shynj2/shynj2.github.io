import { isOnPhoenix, PHOENIX_CHAPTER, world } from '../store';

const CHARGE_MS = 6500;
const RISE_MS = 880;
const WHITE_MS = 1000;
const FADE_MS = 2250;
const ease = (x: number) => x * x * (3 - 2 * x);

type Milestone = 'ignite' | 'return-to-egg' | 'finish';

/** Only a gesture starting on the hatched bird can start this cycle, regardless of ordinary relic heat. */
export class PhoenixCycle {
  private lastTime = 0;
  private startedAt = 0;
  private fullWhiteAt: number | null = null;

  advance(now: number): Milestone | undefined {
    const previous = this.lastTime || now;
    this.lastTime = now;

    if (world.igniting) {
      if (this.fullWhiteAt === null) {
        const elapsed = now - this.startedAt;
        world.igniteT = elapsed / 1000;
        world.ignite = ease(Math.min(1, elapsed / RISE_MS));
        if (elapsed >= RISE_MS) {
          this.fullWhiteAt = now;
          world.resetDone = true;
          return 'return-to-egg';
        }
      } else {
        const elapsed = now - this.fullWhiteAt;
        world.igniteT = (RISE_MS + elapsed) / 1000;
        if (elapsed >= WHITE_MS + FADE_MS) {
          world.ignite = 0;
          world.igniting = false;
          world.igniteT = 0;
          return 'finish';
        }
        world.ignite = 1 - ease(Math.max(0, (elapsed - WHITE_MS) / FADE_MS));
      }
      return;
    }

    if (!world.phoenixReady || world.chapter < PHOENIX_CHAPTER) {
      world.phoenixCharge = 0;
      world.phoenixPress = false;
      return;
    }

    const aiming = world.holding && world.phoenixPress && world.pointerActive && isOnPhoenix(world.pointerPx.x, world.pointerPx.y);
    if (!aiming) {
      world.phoenixCharge = Math.max(0, world.phoenixCharge - (now - previous) / 2100);
      return;
    }

    const heldFor = Math.max(0, now - Math.max(previous, world.pressStartedAt));
    world.phoenixCharge = Math.min(1, world.phoenixCharge + heldFor / CHARGE_MS);
    if (world.phoenixCharge < 1) return;

    this.startedAt = now;
    this.fullWhiteAt = null;
    world.igniting = true;
    world.igniteT = 0;
    world.ignite = 0;
    world.resetDone = false;
    world.holding = false;
    world.phoenixPress = false;
    return 'ignite';
  }
}

import * as THREE from 'three';
import { PHOENIX_CHAPTER, type ScreenEllipse, world } from '../store';
import { S, smooth } from './sceneState';

/** Project contact zones for stationary holds, never to capture or block a swipe. */
export class RelicInteraction {
  private point = new THREE.Vector3();

  private project(camera: THREE.Camera, w: number, h: number, y: number, rx: number, ry: number, target: ScreenEllipse) {
    const p = this.point.copy(S.egg);
    p.y += y * S.focusScale;
    p.applyMatrix4(camera.matrixWorldInverse);
    const scale = (h * 0.5 * camera.projectionMatrix.elements[5] * S.focusScale) / Math.max(0.1, -p.z);
    p.applyMatrix4(camera.projectionMatrix);
    target.x = (p.x + 1) * w * 0.5;
    target.y = (1 - p.y) * h * 0.5;
    target.rx = rx * scale;
    target.ry = ry * scale;
  }

  update(camera: THREE.Camera, width: number, height: number, time: number, enabled: boolean) {
    const h = S.hatch;
    world.phoenixReady = enabled && world.chapter >= PHOENIX_CHAPTER && h >= 0.72;
    if (enabled && h <= 0.55) {
      this.project(camera, width, height, 0.14, 2.18, 1.8, world.relicTarget);
    } else world.relicTarget.rx = 0;
    if (!world.phoenixReady) return;

    const [plumage, tail] = world.phoenixTargets;
    const wings = smooth(h, 0.55, 1);
    const down = smooth(h, 0.5, 0.96);
    const rise = -0.15 + 1.2 * smooth(h, 0.42, 0.92) + Math.sin(time * 0.9) * 0.06;
    this.project(camera, width, height, rise + 0.49, 1.08 + wings * 1.85, 1.2, plumage);
    this.project(camera, width, height, rise - 0.55 - down * 0.92, 0.57 + down * 0.51, 0.5 + down * 1.02, tail);
    const margin = world.mobile ? 10 : 5;
    plumage.rx += margin;
    plumage.ry += margin;
    tail.rx += margin;
    tail.ry += margin;
  }
}

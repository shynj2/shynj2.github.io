import { useFrame, type RootState } from '@react-three/fiber';

let warned = 0;

/**
 * A `useFrame` that can never take the render loop down with it.
 *
 * three.js / R3F run every frame callback in one pass and then render the scene.
 * If a single callback throws (a missing uniform, a bad index, …) that pass is
 * aborted, the scene is never drawn and — because the error escapes the rAF
 * callback — the whole world freezes on its last frame forever.
 *
 * This wrapper isolates each object: the failing one skips a frame, everything
 * else keeps breathing and the canvas keeps painting.
 */
export function useSafeFrame(callback: (state: RootState, delta: number) => void, renderPriority = 0) {
  useFrame((state, delta) => {
    try {
      callback(state, delta);
    } catch (err) {
      if (warned < 4) {
        warned++;
        // eslint-disable-next-line no-console
        console.warn('[relic] a frame callback was skipped:', err);
      }
    }
  }, renderPriority);
}

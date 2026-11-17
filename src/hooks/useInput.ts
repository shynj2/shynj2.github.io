import { useEffect } from 'react';
import { useUI, world } from '../store';
import { ambience } from '../audio/ambience';

const INTERACTIVE = 'a,button,input,textarea,select,label,[data-nocharge]';

/** Pointer tracking + particle click shockwave + "press & hold anywhere to heat up". */
export function useInput() {
  useEffect(() => {
    world.reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    world.mobile = window.matchMedia('(pointer: coarse)').matches || window.innerWidth < 768;
    if (window.matchMedia('(pointer: fine)').matches) document.documentElement.classList.add('has-cursor');

    const updateCoords = (e: PointerEvent) => {
      world.pointerPx.x = e.clientX;
      world.pointerPx.y = e.clientY;
      world.pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
      world.pointer.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };

    const onMove = (e: PointerEvent) => {
      updateCoords(e);
      if (e.pointerType === 'mouse' || e.pointerType === 'pen' || e.buttons > 0 || world.holding) {
        world.pointerActive = true;
      }
    };

    const onDown = (e: PointerEvent) => {
      if (!useUI.getState().entered) return;
      if (e.button !== 0 && e.pointerType === 'mouse') return;
      updateCoords(e);
      world.pointerActive = true;
      const t = e.target as Element | null;
      if (t && t.closest && t.closest(INTERACTIVE)) return;
      world.holding = true;
      // Immediate radial scatter impulse for interactive bird/phoenix particles on click
      world.clickShock = 1;
      world.clickWave = 1;
    };

    const onUp = (e?: PointerEvent) => {
      if (world.holding && world.charge > 0.3) {
        const p = Math.min(1, world.charge + 0.2);
        world.burst = Math.max(world.burst, p);
        ambience.dracarys(p);
        window.dispatchEvent(new CustomEvent('dracarys'));
      }
      world.holding = false;
      if (e && e.pointerType && e.pointerType !== 'mouse') {
        world.pointerActive = false;
      }
    };

    const onLeave = () => {
      world.pointerActive = false;
      onUp();
    };

    const onBlur = () => {
      world.pointerActive = false;
      onUp();
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('pointerdown', onDown, { passive: true });
    window.addEventListener('pointerup', onUp, { passive: true });
    window.addEventListener('pointercancel', onUp, { passive: true });
    document.documentElement.addEventListener('mouseleave', onLeave, { passive: true });
    window.addEventListener('blur', onBlur);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onUp);
      document.documentElement.removeEventListener('mouseleave', onLeave);
      window.removeEventListener('blur', onBlur);
    };
  }, []);
}

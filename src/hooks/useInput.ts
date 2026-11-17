import { useEffect } from 'react';
import { isOnPhoenix, isOnRelic, PHOENIX_CHAPTER, useUI, world } from '../store';
import { ambience } from '../audio/ambience';

const EDITABLE = 'input, textarea, select, [contenteditable]:not([contenteditable="false"])';
const INTERACTIVE = `a, button, label, summary, [data-nocharge], ${EDITABLE}`;
const movedEnough = (dx: number, dy: number) => dx * dx + dy * dy >= 36;

/** Touch stays live during a scroll. A swipe always cancels heating; only a still press can overcharge. */
export function useInput() {
  useEffect(() => {
    const root = document.documentElement;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    const coarse = window.matchMedia('(any-pointer: coarse), (max-width: 767px)');
    const fine = window.matchMedia('(pointer: fine)');
    const updateDevice = () => {
      world.reduced = reduced.matches;
      world.mobile = coarse.matches;
      root.classList.toggle('has-cursor', fine.matches);
    };
    updateDevice();
    reduced.addEventListener('change', updateDevice);
    coarse.addEventListener('change', updateDevice);
    fine.addEventListener('change', updateDevice);

    let pressId: number | null = null;
    let touchId: number | null = null;
    let touchX = 0, touchY = 0, lastTouchMove = 0;
    const coords = (x: number, y: number) => {
      world.pointerPx.x = x;
      world.pointerPx.y = y;
    };
    const interactive = (target: EventTarget | null) => target instanceof Element && !!target.closest(INTERACTIVE);
    const press = (x: number, y: number) => {
      world.holding = true;
      world.pressStartedAt = performance.now();
      world.phoenixPress = isOnPhoenix(x, y);
      world.clickShock = 1;
      world.clickWave = 1;
    };
    const endHeat = (released: boolean) => {
      const warmed = released && world.holding && !world.igniting && performance.now() - world.pressStartedAt >= 480;
      world.holding = false;
      world.phoenixPress = false;
      world.pressStartedAt = 0;
      if (!warmed) return;
      const power = Math.min(1, Math.max(0.25, world.charge) + 0.2);
      world.burst = Math.max(world.burst, power);
      ambience.dracarys(power);
      if (world.chapter < PHOENIX_CHAPTER) window.dispatchEvent(new Event('relic-release'));
    };
    const cancel = () => {
      pressId = touchId = null;
      world.touching = world.touchDragging = world.touchFling = world.pointerActive = false;
      world.clickShock = 0;
      endHeat(false);
    };
    const canInteract = () => {
      const ui = useUI.getState();
      return ui.entered && !ui.menu && !world.igniting;
    };

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length !== 1 || !canInteract() || (window.visualViewport?.scale ?? 1) > 1.02) {
        cancel();
        return;
      }
      const t = e.touches[0];
      touchId = t.identifier;
      pressId = null;
      coords(touchX = t.clientX, touchY = t.clientY);
      lastTouchMove = 0;
      world.touchDragging = world.touchFling = false;
      world.touching = world.pointerActive = true;
      if (!interactive(e.target) && (isOnRelic(t.clientX, t.clientY) || isOnPhoenix(t.clientX, t.clientY))) press(t.clientX, t.clientY);
      else endHeat(false);
    };
    const onTouchMove = (e: TouchEvent) => {
      if (!canInteract() || e.touches.length !== 1 || touchId === null) return;
      const t = e.touches[0];
      if (t.identifier !== touchId) return;
      const oldY = world.pointerPx.y;
      coords(t.clientX, t.clientY);
      if (!world.touchDragging && movedEnough(t.clientX - touchX, t.clientY - touchY)) {
        world.touchDragging = true;
        world.clickShock = 0;
        endHeat(false);
      }
      if (world.touchDragging && Math.abs(t.clientY - oldY) >= 0.5) lastTouchMove = performance.now();
    };
    const onTouchEnd = (e: TouchEvent) => {
      if (touchId === null) return;
      for (let i = 0; i < e.changedTouches.length; i++) {
        if (e.changedTouches[i].identifier !== touchId) continue;
        world.touchFling = world.touchDragging && lastTouchMove > 0 && performance.now() - lastTouchMove < 120;
        touchId = null;
        world.touching = world.touchDragging = world.pointerActive = false;
        endHeat(true);
        break;
      }
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType === 'touch' || touchId !== null || (pressId !== null && e.pointerId !== pressId)) return;
      coords(e.clientX, e.clientY);
      world.pointerActive = canInteract();
    };
    const onDown = (e: PointerEvent) => {
      if (e.pointerType === 'touch' || touchId !== null || !canInteract() || pressId !== null || !e.isPrimary || e.button !== 0 || interactive(e.target)) return;
      coords(e.clientX, e.clientY);
      pressId = e.pointerId;
      world.pointerActive = true;
      press(e.clientX, e.clientY);
    };
    const onUp = (e: PointerEvent) => {
      if (e.pointerId !== pressId || e.pointerType === 'touch') return;
      pressId = null;
      coords(e.clientX, e.clientY);
      world.pointerActive = e.pointerType === 'mouse' && canInteract();
      endHeat(true);
    };
    const onCancel = (e: PointerEvent) => { if (e.pointerId === pressId) cancel(); };
    const onVisibility = () => { if (document.hidden) cancel(); };
    const onLeave = () => { if (!world.touching) cancel(); };
    const onContext = (e: MouseEvent) => {
      if (!(e.target instanceof Element && e.target.closest(`a, ${EDITABLE}`))) e.preventDefault();
    };
    const onDragStart = (e: DragEvent) => {
      if (!(e.target instanceof Element && e.target.closest(EDITABLE))) e.preventDefault();
    };

    // Capture first so Lenis receives the current gesture classification when it handles the same touch event.
    const capture = { capture: true, passive: true } as const;
    document.addEventListener('touchstart', onTouchStart, capture);
    document.addEventListener('touchmove', onTouchMove, capture);
    document.addEventListener('touchend', onTouchEnd, capture);
    document.addEventListener('touchcancel', cancel, capture);
    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('pointerdown', onDown, { passive: true });
    window.addEventListener('pointerup', onUp, { passive: true });
    window.addEventListener('pointercancel', onCancel, { passive: true });
    window.addEventListener('blur', cancel);
    root.addEventListener('mouseleave', onLeave, { passive: true });
    document.addEventListener('visibilitychange', onVisibility);
    document.addEventListener('contextmenu', onContext);
    document.addEventListener('dragstart', onDragStart);
    return () => {
      cancel();
      root.classList.remove('has-cursor');
      reduced.removeEventListener('change', updateDevice);
      coarse.removeEventListener('change', updateDevice);
      fine.removeEventListener('change', updateDevice);
      document.removeEventListener('touchstart', onTouchStart, true);
      document.removeEventListener('touchmove', onTouchMove, true);
      document.removeEventListener('touchend', onTouchEnd, true);
      document.removeEventListener('touchcancel', cancel, true);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onCancel);
      window.removeEventListener('blur', cancel);
      root.removeEventListener('mouseleave', onLeave);
      document.removeEventListener('visibilitychange', onVisibility);
      document.removeEventListener('contextmenu', onContext);
      document.removeEventListener('dragstart', onDragStart);
    };
  }, []);
}

import { useEffect } from 'react';
import { addEffect } from '@react-three/fiber';
import Lenis from 'lenis';
import { useUI, world } from '../store';

let lenis: Lenis | null = null;
const EDITING = 'input:focus, textarea:focus, select:focus, [contenteditable]:focus';

/** Process touch, inertia and chapter position before (not after) the WebGL frame. */
export function useSmoothScroll() {
  const entered = useUI((s) => s.entered);

  useEffect(() => {
    window.scrollTo(0, 0);
    let syncGesture = false;
    const l = new Lenis({
      lerp: 0.075,
      wheelMultiplier: 0.9,
      smoothWheel: true,
      syncTouch: true,
      syncTouchLerp: 0.12,
      touchInertiaExponent: 1.32,
      overscroll: false,
      virtualScroll: ({ event, deltaY }) => {
        if (!('touches' in event)) return true;
        if (event.type === 'touchstart') {
          syncGesture = event.touches.length === 1 &&
            (window.visualViewport?.scale ?? 1) < 1.02 &&
            !(event.target instanceof Element && event.target.closest(EDITING));
          return syncGesture;
        }
        if (event.touches.length > 1) syncGesture = false;
        if (!syncGesture) return false;
        if (world.igniting) {
          if (event.cancelable) event.preventDefault();
          return false;
        }
        if (event.type === 'touchend') {
          syncGesture = false;
          return world.touchFling;
        }
        if (!world.touchDragging) {
          // Prevent the compositor from taking over on small moves while a press is still a press.
          if (deltaY && event.cancelable) event.preventDefault();
          return false;
        }
        return true;
      },
    });
    lenis = l;
    if (!useUI.getState().entered) l.stop();

    let chapters: { id: number; start: number; end: number }[] = [];
    let measureQueued = true;
    let lastY = -1;
    let lastTime = 0;
    let limit = 0;
    const measure = (y: number) => {
      const viewport = window.innerHeight;
      chapters = Array.from(document.querySelectorAll<HTMLElement>('[data-chapter]'), (el) => {
        const bounds = el.getBoundingClientRect();
        const start = bounds.top + y;
        return { id: Number(el.dataset.chapter), start, end: Math.max(start, start + bounds.height - viewport) };
      });
      limit = l.limit;
      measureQueued = false;
    };
    const scheduleMeasure = () => { measureQueued = true; };
    const ro = new ResizeObserver(scheduleMeasure);
    ro.observe(document.body);
    window.addEventListener('resize', scheduleMeasure, { passive: true });

    const removeFrame = addEffect((time) => {
      l.raf(time);
      const y = Math.max(0, window.scrollY);
      const dt = lastTime ? Math.min(64, Math.max(4, time - lastTime)) : 16.7;
      lastTime = time;
      const speed = lastY < 0 ? 0 : Math.min(2300, Math.max(-2300, (y - lastY) * 1000 / dt));
      world.velocity += (speed - world.velocity) * (1 - Math.exp(-dt / 90));
      if (Math.abs(world.velocity) < 0.6) world.velocity = 0;
      if (!measureQueued && Math.abs(y - lastY) < 0.04) return;
      if (measureQueued) measure(y);
      lastY = y;
      world.scroll = y;
      world.progress = limit > 0 ? Math.min(1, y / limit) : 0;

      let chapter = 0;
      for (let i = chapters.length - 1; i >= 0; i--) {
        const here = chapters[i];
        if (y < here.start - 0.5) continue;
        const next = chapters[i + 1];
        const blend = next && y > here.end ? (y - here.end) / Math.max(1, next.start - here.end) : 0;
        chapter = here.id + Math.min(1, blend);
        break;
      }
      world.chapter = chapter;
      const rounded = Math.round(chapter);
      const ui = useUI.getState();
      if (ui.chapter !== rounded) ui.setChapter(rounded);
    });

    return () => {
      removeFrame();
      ro.disconnect();
      window.removeEventListener('resize', scheduleMeasure);
      l.destroy();
      if (lenis === l) lenis = null;
    };
  }, []);

  useEffect(() => {
    if (entered && !world.igniting) lenis?.start();
    else lenis?.stop();
  }, [entered]);
}

const ease = (t: number) => 1 - Math.pow(1 - t, 4);

export function scrollToId(id: string) {
  if (world.igniting) return;
  const el = document.getElementById(id);
  if (!el) return;
  if (lenis) lenis.scrollTo(el, { duration: 2.4, easing: ease });
  else el.scrollIntoView({ behavior: 'smooth' });
}

export function scrollToTop() {
  if (world.igniting) return;
  if (lenis) lenis.scrollTo(0, { duration: 2.6, easing: ease });
  else window.scrollTo({ top: 0, behavior: 'smooth' });
}

export function resetScroll() {
  if (lenis) lenis.scrollTo(0, { immediate: true, force: true });
  else window.scrollTo(0, 0);
}

export function setRebirthScrollLocked(locked: boolean) {
  if (locked) lenis?.stop();
  else if (useUI.getState().entered) lenis?.start();
}

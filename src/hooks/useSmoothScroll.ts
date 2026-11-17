import { useEffect } from 'react';
import Lenis from 'lenis';
import { useUI, world } from '../store';

let lenis: Lenis | null = null;

/** Lenis smooth scrolling + continuous "chapter" value (0..6) used by the 3D camera rig. */
export function useSmoothScroll() {
  const entered = useUI((s) => s.entered);

  useEffect(() => {
    window.scrollTo(0, 0);
    const l = new Lenis({ lerp: 0.075, wheelMultiplier: 0.9, touchMultiplier: 1.1, smoothWheel: true });
    lenis = l;
    if (!useUI.getState().entered) l.stop();

    let starts: number[] = [];
    let ends: number[] = [];
    const measure = () => {
      const els = Array.from(document.querySelectorAll<HTMLElement>('[data-chapter]'));
      const vh = window.innerHeight;
      starts = [];
      ends = [];
      els.forEach((el) => {
        const top = el.getBoundingClientRect().top + window.scrollY;
        starts.push(top);
        ends.push(Math.max(top, top + el.offsetHeight - vh));
      });
    };
    let measureQueued = false;
    let lastY = -1;
    const scheduleMeasure = () => {
      if (measureQueued) return;
      measureQueued = true;
      requestAnimationFrame(() => {
        measureQueued = false;
        measure();
        lastY = -1;
      });
    };
    measure();
    const ro = new ResizeObserver(scheduleMeasure);
    ro.observe(document.body);
    window.addEventListener('resize', scheduleMeasure, { passive: true });

    let raf = 0;
    let lastCh = -1;
    const tick = (time: number) => {
      l.raf(time);
      const y = l.scroll;
      world.velocity = l.velocity;
      if (Math.abs(y - lastY) > 0.04) {
        lastY = y;
        const n = starts.length;
        let c = 0;
        if (n) {
          if (y >= starts[n - 1]) c = n - 1;
          else {
            for (let i = 0; i < n; i++) {
              if (y >= starts[i] && y <= ends[i]) {
                c = i;
                break;
              }
              if (i < n - 1 && y > ends[i] && y < starts[i + 1]) {
                c = i + (y - ends[i]) / Math.max(1, starts[i + 1] - ends[i]);
                break;
              }
            }
          }
        }
        world.chapter = c;
        world.scroll = y;
        world.progress = l.limit > 0 ? Math.min(1, y / l.limit) : 0;
        const rc = Math.round(c);
        if (rc !== lastCh) {
          lastCh = rc;
          useUI.getState().setChapter(rc);
        }
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener('resize', scheduleMeasure);
      l.destroy();
      lenis = null;
    };
  }, []);

  useEffect(() => {
    if (!lenis) return;
    if (entered) lenis.start();
    else lenis.stop();
  }, [entered]);
}

export function scrollToId(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  if (lenis) lenis.scrollTo(el, { duration: 2.4, easing: (t: number) => 1 - Math.pow(1 - t, 4) });
  else el.scrollIntoView({ behavior: 'smooth' });
}

export function scrollToTop() {
  if (lenis) lenis.scrollTo(0, { duration: 3, easing: (t: number) => 1 - Math.pow(1 - t, 4) });
  else window.scrollTo({ top: 0, behavior: 'smooth' });
}

/** Jumps straight back to the prologue — used when the phoenix burns the world white. */
export function resetScroll() {
  try {
    if (lenis) lenis.scrollTo(0, { immediate: true, force: true });
  } catch {
    /* lenis may be mid-scroll */
  }
  window.scrollTo(0, 0);
}

import { useEffect, useRef } from 'react';
import { world } from '../store';

const R = 17;
const CIRC = 2 * Math.PI * R;

/** Soft ember cursor. The ring fills with fire while you hold to charge. */
export function Cursor() {
  const ring = useRef<HTMLDivElement>(null);
  const dot = useRef<HTMLDivElement>(null);
  const fill = useRef<SVGCircleElement>(null);

  useEffect(() => {
    if (!window.matchMedia('(pointer: fine)').matches) return;
    let rx = window.innerWidth / 2;
    let ry = window.innerHeight / 2;
    let hover = 0;
    let hv = 0;
    let raf = 0;
    let shown = false;
    let lastRx = -9999;
    let lastRy = -9999;
    let lastDx = -9999;
    let lastDy = -9999;
    let lastS = -1;
    let lastHv = -1;
    let lastCharge = -1;
    let hasGlow = false;

    const over = (e: PointerEvent) => {
      const t = e.target as Element | null;
      hover = t && t.closest && t.closest('a,button,[data-hover]') ? 1 : 0;
    };
    window.addEventListener('pointerover', over, { passive: true });

    const loop = () => {
      if (!document.hidden) {
        const x = world.pointerPx.x;
        const y = world.pointerPx.y;
        if (!shown && x > -100) {
          shown = true;
          rx = x;
          ry = y;
          if (ring.current) ring.current.style.opacity = '1';
          if (dot.current) dot.current.style.opacity = '1';
        }
        if (shown) {
          rx += (x - rx) * 0.16;
          ry += (y - ry) * 0.16;
          hv += (hover - hv) * 0.14;
          const charge = world.charge;
          const s = 1 + hv * 0.75 + charge * 0.45;

          if (
            ring.current &&
            (Math.abs(rx - lastRx) > 0.08 || Math.abs(ry - lastRy) > 0.08 || Math.abs(s - lastS) > 0.002)
          ) {
            lastRx = rx;
            lastRy = ry;
            lastS = s;
            ring.current.style.transform = `translate3d(${rx.toFixed(1)}px, ${ry.toFixed(1)}px, 0) translate(-50%, -50%) scale(${s.toFixed(3)})`;
          }

          if (dot.current && (x !== lastDx || y !== lastDy || Math.abs(hv - lastHv) > 0.003)) {
            lastDx = x;
            lastDy = y;
            lastHv = hv;
            dot.current.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%) scale(${(1 - hv * 0.6).toFixed(3)})`;
          }

          if (fill.current && Math.abs(charge - lastCharge) > 0.002) {
            lastCharge = charge;
            fill.current.style.strokeDashoffset = (CIRC * (1 - charge)).toFixed(2);
            const wantGlow = charge > 0.01;
            if (wantGlow !== hasGlow) {
              hasGlow = wantGlow;
              fill.current.style.filter = wantGlow ? 'drop-shadow(0 0 6px #ff6a1a)' : 'none';
            }
          }
        }
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('pointerover', over);
    };
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 z-[120] hidden [@media(pointer:fine)]:block" aria-hidden>
      <div ref={ring} className="absolute left-0 top-0 h-11 w-11 opacity-0 transition-opacity duration-500 will-change-transform">
        <svg viewBox="0 0 44 44" className="h-full w-full -rotate-90">
          <circle cx="22" cy="22" r={R} fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="1" />
          <circle
            ref={fill}
            cx="22"
            cy="22"
            r={R}
            fill="none"
            stroke="#ff7a30"
            strokeWidth="2"
            strokeLinecap="round"
            strokeDasharray={CIRC}
            strokeDashoffset={CIRC}
          />
        </svg>
      </div>
      <div
        ref={dot}
        className="absolute left-0 top-0 h-1.5 w-1.5 rounded-full bg-[var(--accent)] opacity-0 shadow-[0_0_12px_var(--accent)] transition-opacity duration-500 will-change-transform"
      />
    </div>
  );
}

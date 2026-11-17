import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useUI, world } from '../store';
import { TEXT } from '../content';
import { EASE } from './ui';

const MAX = 4000;

/**
 * The overcharge.
 *
 * Press and hold anywhere on the relic and its temperature climbs. Keep holding
 * while the phoenix is out and it reaches 4000 °C — then the whole realm is
 * swallowed by white light for a second, the light slowly dies away, and the
 * story begins again on the frozen egg.
 */
export function Overcharge() {
  const lang = useUI((s) => s.lang);
  const entered = useUI((s) => s.entered);
  const tx = TEXT[lang];
  // world is mutable and never re-renders React, so the epilogue gets its own state
  const [reborn, setReborn] = useState(0);

  const white = useRef<HTMLDivElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const value = useRef<HTMLSpanElement>(null);
  const bar = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    let raf = 0;
    let lastV = -1;
    let lastP = -1;
    let lastW = -1;
    let lastReborn = 0;
    let shown = false;
    const nf = new Intl.NumberFormat(lang === 'fa' ? 'fa-IR' : 'en');

    const loop = () => {
      if (!document.hidden) {
        const t = world.temp;
        const p = Math.min(1, t / MAX);

        // the readout only lives while the charge is actually building
        const want = entered && t > 45 && !world.igniting;
        if (want !== shown && panel.current) {
          shown = want;
          panel.current.style.opacity = want ? '1' : '0';
          panel.current.style.transform = `translateY(${want ? 0 : 14}px)`;
        }

        const v = Math.round(t);
        if (v !== lastV && value.current) {
          lastV = v;
          value.current.textContent = `${nf.format(v)}°`;
        }
        if (Math.abs(p - lastP) > 0.0015) {
          lastP = p;
          if (bar.current) bar.current.style.transform = `scaleX(${p.toFixed(4)})`;
          if (panel.current) panel.current.style.filter = `drop-shadow(0 0 ${(3 + 26 * p).toFixed(1)}px var(--accent))`;
        }

        // the white light itself
        if (Math.abs(world.ignite - lastW) > 0.0015 && white.current) {
          lastW = world.ignite;
          white.current.style.opacity = world.ignite.toFixed(3);
        }

        // the epilogue line, once the light has started to die
        const wantReborn = world.igniting && world.igniteT > 2.05 ? 1 : 0;
        if (wantReborn !== lastReborn) {
          lastReborn = wantReborn;
          setReborn(wantReborn);
        }
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [lang, entered]);

  return (
    <>
      {/* rising temperature readout */}
      <div
        ref={panel}
        aria-hidden
        style={{ opacity: 0, transform: 'translateY(14px)' }}
        className="pointer-events-none fixed inset-x-0 bottom-14 z-[60] flex flex-col items-center gap-2.5 transition-[opacity,transform] duration-500 ease-out md:bottom-20"
      >
        <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.3em] text-white/45">
          <span className="h-1 w-1 rounded-full bg-[var(--accent)] shadow-[0_0_10px_var(--accent)]" />
          {tx.heatLabel}
        </div>
        <span
          ref={value}
          dir="ltr"
          className="font-cinzel text-[clamp(1.9rem,5vw,3.1rem)] leading-none tabular-nums text-[var(--accent-2)]"
        />
        <span className="relative block h-px w-44 overflow-hidden bg-white/15" dir="ltr">
          <span ref={bar} className="absolute inset-0 origin-left bg-gradient-to-r from-[var(--accent)] to-[var(--accent-2)]" style={{ transform: 'scaleX(0)' }} />
        </span>
        <span className="font-mono text-[9.5px] uppercase tracking-[0.28em] text-white/30">{tx.heatHint}</span>
      </div>

      {/* the white-out */}
      <div
        ref={white}
        aria-hidden
        style={{ opacity: 0 }}
        className="pointer-events-none fixed inset-0 z-[130] bg-[#fffdf8]"
      >
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(120% 90% at 50% 46%, #ffffff 0%, #fffaf2 38%, rgba(255,236,205,0.96) 68%, rgba(255,214,170,0.86) 100%)',
          }}
        />
      </div>

      {/* reborn — the prophecy starts over */}
      <AnimatePresence>
        {reborn > 0 && (
          <motion.div
            key={reborn}
            initial={{ opacity: 0, y: 10, filter: 'blur(10px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, filter: 'blur(10px)' }}
            transition={{ duration: 1.4, ease: EASE }}
            className="pointer-events-none fixed inset-x-0 bottom-[16vh] z-[135] text-center"
          >
            <span className="font-deco text-[clamp(1.1rem,3vw,1.9rem)] tracking-[0.3em] text-[#ffb877]/90 drop-shadow-[0_0_26px_rgba(255,140,50,0.7)]">
              {tx.reborn}
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

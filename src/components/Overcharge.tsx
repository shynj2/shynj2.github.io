import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { phoenixTemperature, useUI, world } from '../store';
import { TEXT } from '../content';
import { EASE } from './ui';

/** Final chapter temperature and the white-out that reveals the reborn prologue. */
export function Overcharge() {
  const lang = useUI((s) => s.lang);
  const entered = useUI((s) => s.entered);
  const tx = TEXT[lang];
  // world is mutable and never re-renders React, so the epilogue gets its own state
  const [reborn, setReborn] = useState(0);

  const white = useRef<HTMLDivElement>(null);
  const hint = useRef<HTMLParagraphElement>(null);
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
        const p = world.phoenixCharge;
        const want = entered && ((world.phoenixReady && p > 0.008) || (world.igniting && !world.resetDone));
        const hideHint = !entered || !world.phoenixReady || want || world.igniting;
        if (hint.current && hint.current.hidden !== hideHint) hint.current.hidden = hideHint;
        if (want !== shown && panel.current) {
          shown = want;
          panel.current.style.opacity = want ? '1' : '0';
          panel.current.style.transform = `translateY(${want ? 0 : 14}px)`;
        }

        const v = phoenixTemperature();
        if (v !== lastV && value.current) {
          lastV = v;
          value.current.textContent = `${nf.format(v)}°C`;
        }
        if (Math.abs(p - lastP) > 0.0015) {
          lastP = p;
          if (bar.current) bar.current.style.transform = `scaleX(${p.toFixed(4)})`;
        }

        // the white light itself
        if (world.ignite !== lastW && white.current) {
          lastW = world.ignite;
          white.current.style.opacity = world.ignite.toFixed(3);
          const visible = world.ignite > 0.001 ? 'visible' : 'hidden';
          if (white.current.style.visibility !== visible) white.current.style.visibility = visible;
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
      <p
        ref={hint}
        hidden
        className="pointer-events-none fixed inset-x-6 bottom-[max(2rem,env(safe-area-inset-bottom))] z-[39] mx-auto w-fit rounded-full border border-white/10 bg-[#09070c]/75 px-4 py-2 text-center font-mono text-[10px] tracking-[0.16em] text-[#ffe1aa]/85 sm:text-[11px]"
      >
        {tx.heatHint}
      </p>
      {/* rising temperature readout */}
      <div
        ref={panel}
        data-phoenix-meter
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
      </div>

      {/* the white-out */}
      <div
        ref={white}
        data-rebirth-light
        aria-hidden
        style={{ opacity: 0, visibility: 'hidden' }}
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

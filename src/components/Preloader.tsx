import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useUI } from '../store';
import { TEXT, fmt } from '../content';
import { ambience } from '../audio/ambience';
import { EASE, RuneText } from './ui';

export function Preloader() {
  const entered = useUI((s) => s.entered);
  const enter = useUI((s) => s.enter);
  const lang = useUI((s) => s.lang);
  const tx = TEXT[lang];
  const [p, setP] = useState(0);

  useEffect(() => {
    let raf = 0;
    const t0 = performance.now();
    const loop = () => {
      const el = (performance.now() - t0) / 2600;
      const target = useUI.getState().ready ? 1 : 0.92;
      const eased = 1 - Math.pow(1 - Math.min(1, el), 2);
      setP((prev) => Math.max(prev, Math.min(target, eased)));
      if (!(useUI.getState().ready && el >= 1)) raf = requestAnimationFrame(loop);
      else setP(1);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  const done = p >= 1;

  const go = (sound: boolean) => {
    if (sound) ambience.start();
    enter(sound);
  };

  return (
    <AnimatePresence>
      {!entered && (
        <motion.div
          key="pre"
          className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden bg-[#04060b]"
          exit={{ opacity: 0, scale: 1.08, filter: 'blur(24px)' }}
          transition={{ duration: 1.8, ease: EASE }}
        >
          <div
            className="pointer-events-none absolute inset-0 opacity-70"
            style={{
              background:
                'radial-gradient(60% 50% at 50% 45%, rgba(69,240,255,0.07), transparent 70%), radial-gradient(40% 30% at 50% 100%, rgba(255,106,26,0.06), transparent 70%)',
            }}
          />
          <div className="relative flex flex-col items-center px-6 text-center">
            <div className="relative h-40 w-40">
              <svg viewBox="0 0 200 200" className="spin-slow absolute inset-0 h-full w-full text-[#8fdcff]/40" aria-hidden>
                <circle cx="100" cy="100" r="96" fill="none" stroke="currentColor" strokeWidth="0.6" strokeDasharray="2 6" />
                <circle cx="100" cy="100" r="86" fill="none" stroke="currentColor" strokeWidth="0.4" />
              </svg>
              <svg viewBox="0 0 200 200" className="absolute inset-0 h-full w-full text-[#bfeaff]" aria-hidden>
                <motion.path
                  d="M100 34c22 24 34 46 34 66a34 34 0 0 1-68 0c0-20 12-42 34-66z"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.2"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: Math.max(0.02, p) }}
                  transition={{ ease: 'linear', duration: 0.2 }}
                />
                <motion.path
                  d="M100 70c9 10 14 19 14 28a14 14 0 0 1-28 0c0-9 5-18 14-28z"
                  fill="#ff7a30"
                  initial={{ opacity: 0, scale: 0.6 }}
                  animate={{ opacity: done ? 1 : p * 0.5, scale: done ? 1 : 0.8 }}
                  style={{ transformOrigin: '100px 100px', filter: 'drop-shadow(0 0 12px #ff7a30)' }}
                  transition={{ duration: 1.2, ease: EASE }}
                />
              </svg>
            </div>

            <p className="mt-10 font-cinzel text-[13px] uppercase tracking-[0.45em] text-white/40">
              {lang === 'fa' ? 'آوای یخ و کد' : 'A Song of Ice & Code'}
            </p>
            <h1 className="mt-4 max-w-xl font-display text-[clamp(1.4rem,3.4vw,2.4rem)] leading-tight text-white/90">
              <RuneText text={tx.preQuote} auto />
            </h1>

            <div className="mt-10 flex w-64 items-center gap-4">
              <div className="relative h-px flex-1 overflow-hidden bg-white/10">
                <div
                  className="absolute inset-y-0 start-0 bg-gradient-to-r from-[#8fdcff] to-[#ff7a30]"
                  style={{ width: `${p * 100}%` }}
                />
              </div>
              <span className="w-12 text-end font-mono text-[11px] tabular-nums text-white/50">{fmt(Math.round(p * 100), lang)}%</span>
            </div>
            <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.35em] text-white/30">{tx.preSub}</p>

            <div className="mt-10 h-28">
              <AnimatePresence>
                {done && (
                  <motion.div
                    initial={{ opacity: 0, y: 18, filter: 'blur(10px)' }}
                    animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                    transition={{ duration: 1.1, ease: EASE }}
                    className="flex flex-col items-center gap-4"
                  >
                    <div className="flex flex-wrap items-center justify-center gap-3">
                      <button onClick={() => go(true)} className="btn btn-primary">
                        <span className="flex h-3 items-end gap-[2px]" aria-hidden>
                          {[0, 1, 2, 3].map((i) => (
                            <span key={i} className="eq-bar block w-[2px] rounded bg-current" style={{ height: 12, animationDelay: `${i * 0.15}s` }} />
                          ))}
                        </span>
                        {tx.enterSound}
                      </button>
                      <button onClick={() => go(false)} className="btn btn-ghost">
                        {tx.enterSilent}
                      </button>
                    </div>
                    <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/30">{tx.preHint}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

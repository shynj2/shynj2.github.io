import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { PHOENIX_MAX_TEMP, phoenixTemperature, useUI, world } from '../store';
import { CHAPTERS, TEXT } from '../content';
import { scrollToId, scrollToTop } from '../hooks/useSmoothScroll';
import { ambience } from '../audio/ambience';
import { SigilMark } from './Sigils';
import { EASE } from './ui';
import { cn } from '../utils/cn';

const NAV = CHAPTERS.map((c, i) => ({ c, i })).filter(({ c, i }) => i > 0 && !c.sub);
const LAST_ROMAN = CHAPTERS[CHAPTERS.length - 1].roman;

function SoundToggle() {
  const sound = useUI((s) => s.sound);
  const setSound = useUI((s) => s.setSound);
  const lang = useUI((s) => s.lang);
  const toggle = () => {
    const next = !sound;
    if (next) ambience.start();
    else ambience.mute();
    setSound(next);
  };
  return (
    <button
      onClick={toggle}
      className="group flex h-10 items-center gap-2 rounded-full border border-white/10 bg-black/25 px-3.5 backdrop-blur-md transition-colors hover:border-[var(--accent)]"
      aria-label={TEXT[lang].sound}
      aria-pressed={sound}
    >
      <span className="flex h-3.5 items-end gap-[2.5px]">
        {[0, 1, 2, 3].map((i) => (
          <span
            key={i}
            className={cn('block w-[2px] rounded-full bg-[var(--accent)]', sound && 'eq-bar')}
            style={{ height: sound ? 14 : 4 + (i % 2) * 3, animationDelay: `${i * 0.17}s` }}
          />
        ))}
      </span>
      <span className="hidden font-mono text-[10px] uppercase tracking-[0.25em] text-white/60 sm:inline">{TEXT[lang].sound}</span>
    </button>
  );
}

function LangToggle() {
  const lang = useUI((s) => s.lang);
  const setLang = useUI((s) => s.setLang);
  return (
    <button
      onClick={() => setLang(lang === 'fa' ? 'en' : 'fa')}
      className="grid h-10 min-w-10 place-items-center rounded-full border border-white/10 bg-black/25 px-3 font-mono text-[12px] text-white/75 backdrop-blur-md transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)]"
      aria-label="Language"
    >
      {TEXT[lang].langBtn}
    </button>
  );
}

function Corners() {
  const c = 'absolute h-5 w-5 border-white/20';
  return (
    <div className="pointer-events-none fixed inset-3 z-40 hidden md:block" aria-hidden>
      <span className={cn(c, 'left-0 top-0 border-l border-t')} />
      <span className={cn(c, 'right-0 top-0 border-r border-t')} />
      <span className={cn(c, 'bottom-0 left-0 border-b border-l')} />
      <span className={cn(c, 'bottom-0 right-0 border-b border-r')} />
    </div>
  );
}

export function Hud() {
  const lang = useUI((s) => s.lang);
  const chapter = useUI((s) => s.chapter);
  const menu = useUI((s) => s.menu);
  const setMenu = useUI((s) => s.setMenu);
  const entered = useUI((s) => s.entered);
  const tx = TEXT[lang];
  const tempRef = useRef<HTMLSpanElement>(null);
  const progRef = useRef<HTMLSpanElement>(null);
  const [flash, setFlash] = useState(0);

  useEffect(() => {
    let raf = 0;
    let lastTemp = -999999;
    let lastProg = -1;
    const nf = new Intl.NumberFormat(lang === 'fa' ? 'fa-IR' : 'en');
    const loop = () => {
      if (!document.hidden) {
        const h = Math.max(0, world.heat);
        const temp = world.phoenixReady || (world.igniting && !world.resetDone)
          ? phoenixTemperature()
          : Math.min(PHOENIX_MAX_TEMP - 1, Math.round(-38 + 1250 * Math.pow(h, 2.2)));
        if (temp !== lastTemp && tempRef.current) {
          lastTemp = temp;
          tempRef.current.textContent = `${temp > 0 ? '+' : temp < 0 ? '−' : ''}${nf.format(Math.abs(temp))}°C`;
        }
        const p = world.progress;
        if (Math.abs(p - lastProg) > 0.0004 && progRef.current) {
          lastProg = p;
          progRef.current.style.transform = `scaleX(${p.toFixed(4)})`;
        }
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [lang]);

  useEffect(() => {
    let next = 0;
    const on = () => setFlash(++next);
    window.addEventListener('relic-release', on);
    return () => window.removeEventListener('relic-release', on);
  }, []);

  const ch = CHAPTERS[chapter] ?? CHAPTERS[0];
  // sub-chapters (the four realms) light up their parent item in the top navigation
  let group = Math.min(chapter, CHAPTERS.length - 1);
  while (group > 0 && CHAPTERS[group].sub) group--;
  const go = (id: string) => {
    setMenu(false);
    if (id === 'home') scrollToTop();
    else scrollToId(id);
  };

  return (
    <>
      {/* soft cinematic fades so the HUD stays legible over scrolling content */}
      <div className="pointer-events-none fixed inset-x-0 top-0 z-30 h-28 bg-gradient-to-b from-[#04060b]/85 via-[#04060b]/40 to-transparent" aria-hidden />
      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-30 h-24 bg-gradient-to-t from-[#04060b]/90 via-[#04060b]/45 to-transparent" aria-hidden />
      <Corners />

      {/* top bar */}
      <motion.header
        initial={{ opacity: 0, y: -16 }}
        animate={entered ? { opacity: 1, y: 0 } : { opacity: 0, y: -16 }}
        transition={{ duration: 1.4, ease: EASE, delay: 0.8 }}
        className="pointer-events-none fixed inset-x-0 top-0 z-50 flex items-center justify-between gap-4 px-5 py-5 md:px-9"
      >
        <button onClick={() => go('home')} className="pointer-events-auto flex items-center gap-3 text-start">
          <SigilMark className="h-9 w-9 text-[var(--accent)] drop-shadow-[0_0_10px_var(--accent)]" />
          <span className="hidden sm:block">
            <span className="block font-display text-[13px] uppercase tracking-[0.24em] text-white/90">{tx.brandName}</span>
            <span className="mt-0.5 block font-mono text-[9.5px] uppercase tracking-[0.28em] text-white/40">{tx.brandSub}</span>
          </span>
        </button>

        <nav className="pointer-events-auto hidden items-center gap-0.5 rounded-full border border-white/10 bg-black/25 p-1 backdrop-blur-md xl:flex">
          {NAV.map(({ c, i }) => {
            const active = group === i;
            return (
              <button
                key={c.id}
                onClick={() => go(c.id)}
                className={cn(
                  'relative rounded-full px-3.5 py-2 text-[11.5px] tracking-wide transition-colors',
                  active ? 'text-[#05070c]' : 'text-white/60 hover:text-white'
                )}
              >
                {active && (
                  <motion.span
                    layoutId="navpill"
                    className="absolute inset-0 rounded-full bg-gradient-to-r from-[var(--accent-2)] to-[var(--accent)]"
                    transition={{ type: 'spring', stiffness: 120, damping: 20 }}
                  />
                )}
                <span className="relative flex items-center gap-1.5">
                  <span className="font-cinzel text-[10px] opacity-70">{c.roman}</span>
                  {c.nav[lang]}
                </span>
              </button>
            );
          })}
        </nav>

        <div className="pointer-events-auto flex items-center gap-2">
          <LangToggle />
          <SoundToggle />
          <button
            onClick={() => setMenu(!menu)}
            className="grid h-10 w-10 place-items-center rounded-full border border-white/10 bg-black/25 backdrop-blur-md xl:hidden"
            aria-label={tx.menu}
          >
            <span className="relative block h-3 w-4">
              <span className={cn('absolute left-0 h-px w-4 bg-white transition-all duration-500', menu ? 'top-1.5 rotate-45' : 'top-0')} />
              <span className={cn('absolute left-0 h-px w-4 bg-white transition-all duration-500', menu ? 'top-1.5 -rotate-45' : 'top-3')} />
            </span>
          </button>
        </div>
      </motion.header>

      {/* chapter rail */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: entered ? 1 : 0 }}
        transition={{ duration: 1.4, delay: 1.2 }}
        className="fixed end-4 top-1/2 z-40 hidden -translate-y-1/2 flex-col items-end gap-3.5 md:flex md:end-7"
      >
        {CHAPTERS.map((c, i) => {
          const active = chapter === i;
          return (
            <button key={c.id} onClick={() => go(c.id === 'realms' ? 'realm-garden' : c.id)} className="group flex items-center gap-3" aria-label={(c.rail ?? c.nav)[lang]}>
              <span
                className={cn(
                  'rounded-full bg-[#04060b]/65 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.2em] backdrop-blur-md transition-all duration-500',
                  active ? 'text-[var(--accent)] opacity-100' : 'translate-x-1 text-white/50 opacity-0 group-hover:translate-x-0 group-hover:opacity-100'
                )}
              >
                {(c.rail ?? c.nav)[lang]}
              </span>
              <span
                className={cn(
                  'block rounded-full transition-all duration-700',
                  active
                    ? 'h-2 w-2 bg-[var(--accent)] shadow-[0_0_14px_var(--accent)]'
                    : c.sub || c.rail
                      ? 'me-px h-1 w-1 bg-white/20 group-hover:bg-white/60'
                      : 'h-1.5 w-1.5 bg-white/25 group-hover:bg-white/60'
                )}
              />
            </button>
          );
        })}
      </motion.div>

      {/* bottom readouts */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: entered ? 1 : 0 }}
        transition={{ duration: 1.4, delay: 1.4 }}
        className="pointer-events-none fixed bottom-6 start-6 z-40 hidden font-mono text-[10px] uppercase tracking-[0.26em] text-white/45 md:block md:start-9"
      >
        <div className="flex items-center gap-2.5">
          <span className="relative flex h-1.5 w-1.5">
            <span className="ping-soft absolute inset-0 rounded-full bg-[var(--accent)]" />
            <span className="relative h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />
          </span>
          <AnimatePresence mode="wait">
            <motion.span
              key={ch.id + lang}
              initial={{ opacity: 0, y: 6, filter: 'blur(6px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -6, filter: 'blur(6px)' }}
              transition={{ duration: 0.6, ease: EASE }}
              className="text-white/70"
            >
              {ch.place[lang]}
            </motion.span>
          </AnimatePresence>
          <span className="text-white/25" dir="ltr">
            {ch.coord}
          </span>
        </div>
        <div className="mt-2 flex items-center gap-2">
          <span>{tx.temp}</span>
          <span ref={tempRef} dir="ltr" className="text-[var(--accent)] tabular-nums" />
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: entered ? 1 : 0 }}
        transition={{ duration: 1.4, delay: 1.4 }}
        className="pointer-events-none fixed bottom-6 end-6 z-40 hidden font-mono text-[10px] tracking-[0.25em] text-white/45 md:block md:end-9"
      >
        {/* the bar itself always runs left → right; only its corner follows the page direction */}
        <div className="flex items-center gap-3" dir="ltr">
          <span className="font-cinzel text-[12px] text-white/80">{ch.roman || '◆'}</span>
          <span className="relative block h-px w-20 overflow-hidden bg-white/15">
            <span ref={progRef} className="absolute inset-0 origin-left bg-[var(--accent)]" style={{ transform: 'scaleX(0)' }} />
          </span>
          <span className="font-cinzel text-[12px]">{LAST_ROMAN}</span>
        </div>
      </motion.div>

      {/* mobile menu */}
      <AnimatePresence>
        {menu && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: EASE }}
            className="fixed inset-0 z-[45] flex flex-col justify-center bg-[#04060b]/85 px-8 backdrop-blur-xl"
          >
            <ul className="space-y-2">
              {[{ c: CHAPTERS[0], i: 0 }, ...NAV].map(({ c, i }, k) => (
                <motion.li
                  key={c.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, ease: EASE, delay: 0.05 * k }}
                >
                  <button onClick={() => go(c.id)} className="flex w-full items-baseline gap-4 py-1.5 text-start">
                    <span className="w-8 font-cinzel text-sm text-[var(--accent)]">{c.roman || '◆'}</span>
                    <span className={cn('font-display text-[1.7rem]', group === i ? 'text-accent-grad' : 'text-white/85')}>{c.nav[lang]}</span>
                  </button>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>

      {/* The relic responds to a warm release. The finale has its own effect. */}
      <AnimatePresence>
        {flash > 0 && (
          <motion.div
            key={flash}
            initial={{ opacity: 0, scale: 0.92, filter: 'blur(14px)' }}
            animate={{ opacity: [0, 1, 1, 0], scale: [0.92, 1, 1.02, 1.08], filter: ['blur(14px)', 'blur(0px)', 'blur(0px)', 'blur(10px)'] }}
            transition={{ duration: 2.7, ease: EASE, times: [0, 0.15, 0.73, 1] }}
            onAnimationComplete={() => setFlash((current) => current === flash ? 0 : current)}
            className="pointer-events-none fixed inset-0 z-[55] grid place-items-center"
          >
            <span data-heat-release lang="en" dir="ltr" className="font-deco text-[clamp(2.6rem,9vw,8rem)] tracking-[0.18em] text-[#ffd9a0] drop-shadow-[0_0_40px_#ff6a1a]">
              shyn
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

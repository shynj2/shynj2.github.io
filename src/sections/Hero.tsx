import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useUI } from '../store';
import { TEXT } from '../content';
import { EASE, RuneText } from '../components/ui';
import { scrollToId } from '../hooks/useSmoothScroll';
import { cn } from '../utils/cn';

function RoleCycler({ roles }: { roles: string[] }) {
  const [i, setI] = useState(0);
  useEffect(() => {
    const id = window.setInterval(() => setI((v) => (v + 1) % roles.length), 3200);
    return () => window.clearInterval(id);
  }, [roles.length]);
  return (
    <span className="relative inline-flex min-w-[14ch] justify-center">
      <RuneText key={roles[i] + i} text={roles[i]} auto className="font-display text-[15px] tracking-[0.22em] text-accent-grad uppercase md:text-[17px]" />
    </span>
  );
}

function HoldIcon() {
  return (
    <span className="relative grid h-14 w-14 place-items-center rounded-full border border-white/15 bg-black/20 backdrop-blur-md">
      <span className="ping-soft absolute inset-0 rounded-full border border-[var(--accent)]" />
      <svg viewBox="0 0 24 24" className="h-6 w-6 text-[var(--accent)] drop-shadow-[0_0_8px_var(--accent)]" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M12 3c3 3.6 5 6.8 5 10a5 5 0 0 1-10 0c0-3.2 2-6.4 5-10z" />
        <path d="M12 10.5c1.3 1.6 2 2.9 2 4.2a2 2 0 0 1-4 0c0-1.3.7-2.6 2-4.2z" fill="currentColor" />
      </svg>
    </span>
  );
}

export function Hero() {
  const lang = useUI((s) => s.lang);
  const entered = useUI((s) => s.entered);
  const tx = TEXT[lang];
  const fa = lang === 'fa';
  const show = (delay: number) => ({
    initial: { opacity: 0, y: 14, filter: 'blur(10px)' },
    animate: entered ? { opacity: 1, y: 0, filter: 'blur(0px)' } : { opacity: 0, y: 14, filter: 'blur(10px)' },
    transition: { duration: 1.5, ease: EASE, delay },
  });

  return (
    <section id="home" data-chapter="0" className="relative h-[100svh] min-h-[640px] w-full overflow-hidden">
      <motion.div {...show(1.7)} className="absolute inset-x-0 top-[15vh] hidden justify-center md:flex">
        <span className="kicker">
          <span className="kicker-line" />
          {tx.heroKicker}
          <span className="kicker-line rotate-180" />
        </span>
      </motion.div>

      {/* left — the prophecy */}
      <motion.div {...show(2.0)} className="absolute start-[5vw] top-1/2 hidden w-[300px] -translate-y-1/2 lg:block">
        <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-white/40">◆ {tx.heroLabel}</p>
        <p className="mt-4 text-[15px] leading-7 text-white/72">{tx.heroP}</p>
        <div className="mt-7 flex flex-wrap gap-3">
          <button onClick={() => scrollToId('works')} className="btn btn-primary">
            {tx.ctaWorks}
          </button>
          <button onClick={() => scrollToId('contact')} className="btn btn-ghost">
            {tx.ctaRaven}
          </button>
        </div>
      </motion.div>

      {/* right — status */}
      <motion.div {...show(2.2)} className="absolute end-[5vw] top-1/2 hidden -translate-y-1/2 flex-col items-end gap-8 text-end lg:flex">
        <span className="chip !px-3.5 !py-1.5">
          <span className="relative flex h-2 w-2">
            <span className="ping-soft absolute inset-0 rounded-full bg-emerald-400" />
            <span className="relative h-2 w-2 rounded-full bg-emerald-400" />
          </span>
          {tx.openToWork}
        </span>
        <div className="flex items-center gap-4">
          <div>
            <p className="text-[13px] text-white/75">{tx.holdHint}</p>
            <p className="font-display text-[16px] text-accent-grad">{tx.holdHint2}</p>
          </div>
          <HoldIcon />
        </div>
        <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/35">{tx.heroMeta}</p>
      </motion.div>

      {/* the name */}
      <div className="absolute inset-x-0 bottom-[calc(5vh+64px)] flex flex-col items-center px-5 text-center md:bottom-[calc(5vh+84px)]">
        <motion.h1
          initial={{ opacity: 0, letterSpacing: fa ? '0em' : '0.45em', filter: 'blur(18px)' }}
          animate={
            entered
              ? { opacity: 1, letterSpacing: fa ? '0em' : '0.07em', filter: 'blur(0px)' }
              : { opacity: 0, letterSpacing: fa ? '0em' : '0.45em', filter: 'blur(18px)' }
          }
          transition={{ duration: 2.8, ease: EASE, delay: 0.6 }}
          className={cn(
            'font-display font-semibold uppercase leading-[0.95]',
            fa ? 'text-[clamp(3rem,13vw,5rem)] md:text-[clamp(3.4rem,7vw,7.6rem)]' : 'text-[clamp(2.6rem,11.5vw,4.6rem)] md:text-[clamp(3rem,6.1vw,7.3rem)]'
          )}
        >
          <span className="name-metal block md:inline">{tx.heroFirst}</span>
          <span className="hidden md:inline"> </span>
          <span className="name-metal block md:inline">{tx.heroLast}</span>
        </motion.h1>

        <motion.div {...show(1.4)} className="mt-5 flex items-center gap-4 md:mt-6">
          <span className="h-px w-10 bg-gradient-to-r from-transparent to-[var(--accent)] md:w-16" />
          <span className="h-1.5 w-1.5 rotate-45 bg-[var(--accent)] shadow-[0_0_12px_var(--accent)]" />
          <RoleCycler roles={tx.roles} />
          <span className="h-1.5 w-1.5 rotate-45 bg-[var(--accent)] shadow-[0_0_12px_var(--accent)]" />
          <span className="h-px w-10 bg-gradient-to-l from-transparent to-[var(--accent)] md:w-16" />
        </motion.div>

        <motion.div {...show(1.9)} className="mt-6 flex max-w-sm flex-col items-center gap-5 lg:hidden">
          <p className="text-[14px] leading-6 text-white/65">{tx.heroP}</p>
          <div className="flex flex-wrap justify-center gap-3">
            <button onClick={() => scrollToId('works')} className="btn btn-primary !h-11">
              {tx.ctaWorks}
            </button>
            <button onClick={() => scrollToId('contact')} className="btn btn-ghost !h-11">
              {tx.ctaRaven}
            </button>
          </div>
        </motion.div>
      </div>

      <motion.div {...show(2.6)} className="absolute inset-x-0 bottom-4 flex flex-col items-center gap-2.5">
        <span className="hidden font-mono text-[10px] uppercase tracking-[0.35em] text-white/40 sm:block">{tx.scrollHint}</span>
        <span className="relative block h-9 w-px overflow-hidden bg-white/10">
          <span className="scroll-drip absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-transparent to-[var(--accent)]" />
        </span>
      </motion.div>
    </section>
  );
}

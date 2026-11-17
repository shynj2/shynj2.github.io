import { useEffect, useLayoutEffect, useRef, type ReactNode, type PointerEvent as RPE } from 'react';
import { motion, useInView } from 'framer-motion';
import { cn } from '../utils/cn';
import { useUI, world } from '../store';
import { fmt } from '../content';

export const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

export function Reveal({
  children,
  delay = 0,
  y = 28,
  className,
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y, filter: 'blur(10px)' }}
      whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      viewport={{ once: true, margin: '0px 0px -10% 0px' }}
      transition={{ duration: 1.2, ease: EASE, delay }}
    >
      {children}
    </motion.div>
  );
}

export function Kicker({ children, num, className }: { children: ReactNode; num?: string; className?: string }) {
  return (
    <Reveal className={cn('kicker', className)}>
      <span className="kicker-line" />
      {num ? <span className="font-cinzel text-[12px] tracking-[0.2em]">{num}</span> : null}
      <span>{children}</span>
    </Reveal>
  );
}

/** Masked line-by-line title reveal. The in-view trigger lives on the (unclipped) heading. */
export function BigTitle({ lines, className, inline = false }: { lines: string[]; className?: string; inline?: boolean }) {
  return (
    <motion.h2
      className={cn('h-display mt-6', className)}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '0px 0px -6% 0px' }}
    >
      {lines.map((l, i) => (
        <span
          key={i + l}
          className={cn('overflow-hidden pb-[0.14em] -mb-[0.14em] align-bottom', inline ? 'inline-block me-[0.26em] last:me-0' : 'block')}
        >
          <motion.span
            className={cn('inline-block', i === lines.length - 1 ? 'text-accent-grad' : 'text-metal')}
            variants={{
              hidden: { y: '115%', opacity: 0 },
              show: { y: '0%', opacity: 1, transition: { duration: 1.3, ease: EASE, delay: 0.1 * i } },
            }}
          >
            {l}
          </motion.span>
        </span>
      ))}
    </motion.h2>
  );
}

export function SpotCard({
  children,
  className,
  tilt = false,
}: {
  children: ReactNode;
  className?: string;
  tilt?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const onMove = (e: RPE<HTMLDivElement>) => {
    if (e.pointerType === 'touch' || world.mobile) return;
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width;
    const y = (e.clientY - r.top) / r.height;
    el.style.setProperty('--mx', `${x * 100}%`);
    el.style.setProperty('--my', `${y * 100}%`);
    if (tilt) {
      el.style.setProperty('--rx', `${(0.5 - y) * 6}deg`);
      el.style.setProperty('--ry', `${(x - 0.5) * 8}deg`);
    }
  };
  const onLeave = () => {
    const el = ref.current;
    if (!el) return;
    el.style.setProperty('--rx', '0deg');
    el.style.setProperty('--ry', '0deg');
  };
  return (
    <div ref={ref} onPointerMove={onMove} onPointerLeave={onLeave} className={cn('card', tilt && 'card-tilt', className)}>
      {children}
    </div>
  );
}

const RUNES = 'ᚠᚢᚦᚨᚱᚲᚷᚹᚺᚾᛁᛃᛇᛈᛉᛊᛏᛒᛖᛗᛚᛜᛞᛟ';
const isRtlText = (s: string) => /[\u0590-\u08FF]/.test(s);
const esc = (c: string) => (c === '<' ? '&lt;' : c === '>' ? '&gt;' : c === '&' ? '&amp;' : c);

/** Text that decodes from Elder Futhark runes into Latin letters (fades in for Persian). */
export function RuneText({
  text,
  className,
  delay = 0,
  auto = false,
}: {
  text: string;
  className?: string;
  delay?: number;
  auto?: boolean;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '0px 0px -8% 0px' });
  const entered = useUI((s) => s.entered);
  const go = auto || (inView && entered);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!go) {
      el.textContent = text;
      el.style.opacity = '0';
    }
  }, [go, text]);

  useEffect(() => {
    const el = ref.current;
    if (!el || !go) return;
    el.style.opacity = '1';
    if (isRtlText(text) || world.reduced) {
      el.textContent = text;
      el.animate([{ opacity: 0, filter: 'blur(8px)' }, { opacity: 1, filter: 'blur(0px)' }], {
        duration: 900,
        delay,
        easing: 'cubic-bezier(.22,1,.36,1)',
        fill: 'both',
      });
      return;
    }
    let raf = 0;
    const N = text.length;
    const dur = Math.min(1500, 350 + N * 38);
    const start = performance.now() + delay;
    const render = (t: number) => {
      let html = '';
      for (let i = 0; i < N; i++) {
        const c = text[i];
        if (c === ' ') {
          html += ' ';
          continue;
        }
        const at = i / N;
        if (t > at + 0.18) html += esc(c);
        else if (t > at - 0.12) html += `<span class="rune">${RUNES[(Math.random() * RUNES.length) | 0]}</span>`;
        else html += `<span style="opacity:0">${esc(c)}</span>`;
      }
      el.innerHTML = html;
    };
    render(0);
    const loop = (now: number) => {
      const t = (now - start) / dur;
      if (t >= 0) render(t);
      if (t < 1.25) raf = requestAnimationFrame(loop);
      else el.textContent = text;
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [go, text, delay]);

  return <span ref={ref} className={className} aria-label={text} />;
}

export function Counter({ value, suffix = '' }: { value: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const lang = useUI((s) => s.lang);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!inView) {
      el.textContent = fmt(0, lang) + suffix;
      return;
    }
    let raf = 0;
    const t0 = performance.now();
    const loop = (now: number) => {
      const t = Math.min(1, (now - t0) / 1800);
      const e = 1 - Math.pow(1 - t, 3);
      el.textContent = fmt(Math.round(value * e), lang) + suffix;
      if (t < 1) raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [inView, value, suffix, lang]);
  return <span ref={ref} />;
}

export function Ornament({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-center gap-3', className)} aria-hidden>
      <span className="h-px w-14 bg-gradient-to-r from-transparent to-[var(--accent)] opacity-70" />
      <span className="h-1.5 w-1.5 rotate-45 bg-[var(--accent)] shadow-[0_0_12px_var(--accent)]" />
      <span className="h-px w-14 bg-gradient-to-l from-transparent to-[var(--accent)] opacity-70" />
    </div>
  );
}

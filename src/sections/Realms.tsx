import { type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { useUI } from '../store';
import { REALMS, REALM_BASE, TEXT, type RealmId } from '../content';
import { BigTitle, EASE, Kicker, Reveal } from '../components/ui';
import { scrollToId } from '../hooks/useSmoothScroll';
import { cn } from '../utils/cn';
import { cyberImg, gameImg, gardenImg, minimalImg } from '../assets/realmImages';

const Container = ({ children, className }: { children: ReactNode; className?: string }) => (
  <div className={cn('mx-auto w-full max-w-[1320px] px-6 md:px-14', className)}>{children}</div>
);

const GRID = 'relative grid items-center gap-12 lg:grid-cols-12 lg:gap-16';
// overflow-x: clip keeps decorations (e.g. the spinning sigil) from widening the page, without clipping vertically
const PANEL = 'realm relative flex min-h-[108vh] items-center py-[14vh] [overflow-x:clip]';

/* ---------------------------- shared building blocks ---------------------------- */

/** Line-by-line title. `mask` clips each line (crisp reveal); without it the lines fade in so glows are not cut off. */
function Lines({
  lines,
  className,
  lineClass,
  mask = true,
}: {
  lines: string[];
  className?: string;
  lineClass?: (i: number) => string;
  mask?: boolean;
}) {
  return (
    <motion.h3 className={className} initial="hidden" whileInView="show" viewport={{ once: true, margin: '0px 0px -6% 0px' }}>
      {lines.map((l, i) => (
        <span key={l + i} className={cn('block', mask && 'overflow-hidden pb-[0.16em] -mb-[0.16em]')}>
          <motion.span
            className={cn('inline-block', lineClass?.(i))}
            variants={
              mask
                ? { hidden: { y: '115%', opacity: 0 }, show: { y: '0%', opacity: 1, transition: { duration: 1.3, ease: EASE, delay: 0.1 * i } } }
                : {
                    hidden: { y: 18, opacity: 0, filter: 'blur(12px)' },
                    show: { y: 0, opacity: 1, filter: 'blur(0px)', transition: { duration: 1.4, ease: EASE, delay: 0.12 * i } },
                  }
            }
          >
            {l}
          </motion.span>
        </span>
      ))}
    </motion.h3>
  );
}

function Copy({
  id,
  title,
  quote,
  chipClass,
  btnClass,
  after,
}: {
  id: RealmId;
  title: ReactNode;
  quote: ReactNode;
  chipClass?: string;
  btnClass: string;
  after?: ReactNode;
}) {
  const lang = useUI((s) => s.lang);
  const r = REALMS[id];
  return (
    <div className="relative">
      <Kicker>{r.kicker[lang]}</Kicker>
      {title}
      <Reveal delay={0.15} className="mt-7">
        {quote}
      </Reveal>
      <Reveal delay={0.22}>
        <p className="mt-6 max-w-[520px] text-[15px] leading-8 text-white/75">{r.body[lang]}</p>
      </Reveal>
      <Reveal delay={0.3}>
        <ul className="mt-6 flex flex-wrap gap-2">
          {r.chips[lang].map((c) => (
            <li key={c} className={cn('chip', chipClass)}>
              {c}
            </li>
          ))}
        </ul>
      </Reveal>
      <Reveal delay={0.36} className="mt-8 flex flex-wrap items-center gap-4">
        <a href={REALM_BASE + r.path} target="_blank" rel="noreferrer noopener" className={cn('btn', btnClass)}>
          {r.cta[lang]}
          <span aria-hidden>↗</span>
        </a>
        {after}
      </Reveal>
    </div>
  );
}

function Shot({ src, alt, className, pixel }: { src: string; alt: string; className?: string; pixel?: boolean }) {
  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      draggable={false}
      style={pixel ? { imageRendering: 'pixelated' } : undefined}
      className={cn('h-full w-full object-cover transition-transform duration-[1600ms] ease-out group-hover:scale-[1.035]', className)}
    />
  );
}

/* =============================== I · The garden =============================== */
function ToriiPortal() {
  const lang = useUI((s) => s.lang);
  const r = REALMS.garden;
  return (
    <a
      href={REALM_BASE + r.path}
      target="_blank"
      rel="noreferrer noopener"
      aria-label={r.cta[lang]}
      className="group relative mx-auto block w-full max-w-[680px]"
      style={{ aspectRatio: '700 / 500' }}
    >
      {/* the garden, seen through the gate */}
      <div className="absolute bottom-[4%] left-[15.5%] right-[15.5%] top-[29%] overflow-hidden rounded-[14px] bg-[#e6dfcc] shadow-[0_30px_80px_-30px_rgba(0,0,0,0.9)] ring-1 ring-[#f6ead2]/40">
        <Shot src={gardenImg} alt={r.short[lang]} />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0f1b2d]/35 via-transparent to-transparent" />
      </div>
      {/* posts */}
      <span className="torii-red absolute bottom-0 left-[9%] top-[12%] w-[3.6%] rounded-[6px]" />
      <span className="torii-red absolute bottom-0 right-[9%] top-[12%] w-[3.6%] rounded-[6px]" />
      <span className="absolute bottom-0 left-[8%] h-[5%] w-[5.6%] rounded-[4px] bg-[#15101a]" />
      <span className="absolute bottom-0 right-[8%] h-[5%] w-[5.6%] rounded-[4px] bg-[#15101a]" />
      {/* tie beam + name plaque */}
      <span className="torii-red absolute left-[3.5%] right-[3.5%] top-[20.5%] h-[3.6%] rounded-[5px]" />
      <span className="font-zen absolute left-1/2 top-[11.5%] grid h-[11%] w-[8%] -translate-x-1/2 place-items-center rounded-[4px] bg-[#15101a] text-[clamp(11px,1.5vw,19px)] text-[#f0c86a] ring-1 ring-[#f0c86a]/50">
        門
      </span>
      {/* curved top beam */}
      <svg viewBox="0 0 700 80" className="absolute inset-x-0 top-0 w-full overflow-visible" aria-hidden>
        <path d="M0 6 Q350 40 700 6 L695 24 Q350 56 5 24 Z" fill="#17111b" />
        <path d="M12 27 Q350 58 688 27 L682 46 Q350 75 18 46 Z" fill="url(#toriiRed)" />
        <defs>
          <linearGradient id="toriiRed" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="#ea5444" />
            <stop offset="1" stopColor="#b52e25" />
          </linearGradient>
        </defs>
      </svg>
    </a>
  );
}

function Garden() {
  const lang = useUI((s) => s.lang);
  const r = REALMS.garden;
  return (
    <div id="realm-garden" className={cn(PANEL, 'realm-garden')}>
      <Container className={GRID}>
        <div className="lg:col-span-5">
          <Copy
            id="garden"
            btnClass="btn-primary"
            title={
              <>
                <Lines
                  lines={r.title[lang]}
                  className="h-display mt-6 !text-[clamp(2.1rem,3.6vw,3.6rem)]"
                  lineClass={(i) => (i === r.title[lang].length - 1 ? 'text-accent-grad' : 'text-metal')}
                />
                <Reveal delay={0.1} className="mt-5 flex items-center gap-3.5">
                  <span className="garden-seal font-zen">シャ</span>
                  <span className="font-zen text-[13px] text-white/55" style={{ letterSpacing: '0.42em' }} dir="ltr">
                    シャヤン・ミルハニ
                  </span>
                </Reveal>
              </>
            }
            quote={<p className="border-s-2 border-[var(--accent)] ps-4 font-display text-[17px] italic leading-7 text-white/85">“{r.quote[lang]}”</p>}
          />
        </div>
        <Reveal delay={0.1} className="lg:col-span-7">
          <ToriiPortal />
        </Reveal>
      </Container>
    </div>
  );
}

/* =============================== II · Cyberpunk =============================== */
function Mandala({ className }: { className?: string }) {
  return (
    <svg viewBox="-100 -100 200 200" className={className} fill="none" aria-hidden>
      <circle r="96" stroke="#ffc857" strokeWidth="1.1" />
      {Array.from({ length: 24 }).map((_, i) => {
        const a = (i / 24) * Math.PI * 2;
        return <circle key={i} cx={Math.cos(a) * 86} cy={Math.sin(a) * 86} r="2.1" fill="#ffc857" />;
      })}
      <circle r="74" stroke="#19f3e6" strokeWidth="1" />
      {Array.from({ length: 12 }).map((_, i) => (
        <ellipse
          key={i}
          cx="0"
          cy="-46"
          rx="12"
          ry="26"
          transform={`rotate(${i * 30})`}
          stroke={i % 2 ? '#ff2e88' : '#19f3e6'}
          fill={i % 2 ? 'rgba(255,46,136,0.16)' : 'rgba(25,243,230,0.14)'}
          strokeWidth="1.2"
        />
      ))}
      <circle r="18" stroke="#ffc857" strokeWidth="1.2" fill="#0a0612" />
      <path d="M0 -9c4 4.6 6 8 6 11a6 6 0 0 1-12 0c0-3 2-6.4 6-11z" fill="#ff2e88" />
    </svg>
  );
}

function Cyber() {
  const lang = useUI((s) => s.lang);
  const r = REALMS.cyber;
  const roles = TEXT[lang].roles.join(' · ');
  return (
    <section id="realm-cyber" data-chapter="7" className={cn(PANEL, 'realm-cyber')}>
      <Container className={GRID}>
        <div className="relative lg:order-2 lg:col-span-5">
          <Mandala className="spin-slow pointer-events-none absolute -top-24 end-[-40px] h-[260px] w-[260px] opacity-25" />
          <Copy
            id="cyber"
            btnClass="btn-cyber"
            chipClass="chip-cyber"
            title={
              <>
                <Lines mask={false} lines={r.title[lang]} className="cyber-title mt-6" />
                <Reveal delay={0.1}>
                  <p className="cyber-mono mt-5 text-[13.5px] text-[#19f3e6]">
                    <span className="text-[#ff2e88]">&gt;</span> {roles}
                    <span className="cyber-cursor" aria-hidden />
                  </p>
                </Reveal>
              </>
            }
            quote={<p className="font-display text-[15.5px] italic leading-7 text-[#ffc857]">“{r.quote[lang]}”</p>}
          />
        </div>
        <Reveal delay={0.1} className="lg:order-1 lg:col-span-7">
          <a href={REALM_BASE + r.path} target="_blank" rel="noreferrer noopener" aria-label={r.cta[lang]} className="cyber-frame-wrap group mx-auto max-w-[700px]">
            <div className="cyber-frame">
              <div className="cyber-frame-in">
                <div className="cyber-mono flex items-center justify-between gap-4 px-5 py-2.5 text-[11px] text-[#9a8fc0]" dir="ltr">
                  <span className="flex items-center gap-2">
                    <i className="block h-1.5 w-1.5 bg-[#19f3e6] shadow-[0_0_8px_#19f3e6]" />
                    <i className="block h-1.5 w-1.5 bg-[#ff2e88] shadow-[0_0_8px_#ff2e88]" />
                    <i className="block h-1.5 w-1.5 bg-[#ffc857] shadow-[0_0_8px_#ffc857]" />
                    <span className="ms-2">// the other side of me</span>
                  </span>
                  <span>cyber.html</span>
                </div>
                <div className="relative aspect-[16/10] overflow-hidden">
                  <Shot src={cyberImg} alt={r.short[lang]} className="object-top" />
                  <div className="scanlines pointer-events-none absolute inset-0 opacity-25" />
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0a0612]/55 via-transparent to-transparent" />
                </div>
              </div>
            </div>
          </a>
        </Reveal>
      </Container>
    </section>
  );
}

/* =============================== III · Minimal =============================== */
function Minimal() {
  const lang = useUI((s) => s.lang);
  const r = REALMS.minimal;
  return (
    <section id="realm-minimal" data-chapter="8" className={cn(PANEL, 'realm-min')}>
      <Container className={GRID}>
        <div className="lg:col-span-5">
          <Copy
            id="minimal"
            btnClass="btn-min"
            chipClass="chip-min"
            title={<Lines lines={r.title[lang]} className="min-title mt-6" lineClass={(i) => (i === 1 ? 'min-outline' : '')} />}
            quote={
              <p className="flex items-center gap-4 font-sans text-[18px] font-bold text-white">
                <span className="h-px w-12 flex-none bg-white" />
                {r.quote[lang]}
              </p>
            }
          />
        </div>
        <Reveal delay={0.1} className="lg:col-span-7">
          <a
            href={REALM_BASE + r.path}
            target="_blank"
            rel="noreferrer noopener"
            aria-label={r.cta[lang]}
            className="group mx-auto block max-w-[700px] rounded-[30px] border border-white/20 bg-[#0a0a0e]/70 p-2.5 transition-[border-color,transform] duration-700 ease-out hover:-translate-y-1 hover:border-white/50"
          >
            <div className="relative aspect-[16/10] overflow-hidden rounded-[22px] bg-[#0a0a0e]">
              <Shot src={minimalImg} alt={r.short[lang]} className="object-top grayscale transition-[transform,filter] group-hover:grayscale-0" />
            </div>
            <div className="flex items-center justify-between gap-4 px-3.5 pb-2 pt-3.5 font-sans text-[12px] text-white/55">
              <span dir="ltr">shynj2.github.io/shyn</span>
              <span className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-white" />
                Portfolio · 2026
              </span>
            </div>
          </a>
        </Reveal>
      </Container>
    </section>
  );
}

/* =============================== IV · The game =============================== */
function Game() {
  const lang = useUI((s) => s.lang);
  const r = REALMS.game;
  const stud = 'vey-stud';
  return (
    <section id="realm-game" data-chapter="9" className={cn(PANEL, 'realm-game')}>
      <Container className={GRID}>
        <div className="lg:order-2 lg:col-span-5">
          <Copy
            id="game"
            btnClass="btn-vey"
            chipClass="chip-vey"
            title={
              <Reveal delay={0.05} className="mt-7">
                <h3 className="vey-title">{r.title[lang][0]}</h3>
                <p className="vey-sub mt-3">{r.title[lang][1]}</p>
              </Reveal>
            }
            quote={<p className="vey-dialog">{r.quote[lang]}</p>}
            after={
              <span className="font-pixel text-[10px] text-[#b9a8ff]/80" dir="ltr">
                SCORE 000 / 500
              </span>
            }
          />
        </div>
        <Reveal delay={0.1} className="lg:order-1 lg:col-span-7">
          <a href={REALM_BASE + r.path} target="_blank" rel="noreferrer noopener" aria-label={r.cta[lang]} className="vey-frame group mx-auto max-w-[720px]">
            <span className={cn(stud, '-left-1 -top-1')} />
            <span className={cn(stud, '-right-1 -top-1')} />
            <span className={cn(stud, '-bottom-1 -left-1')} />
            <span className={cn(stud, '-bottom-1 -right-1')} />
            <div className="font-pixel flex items-center justify-between gap-4 px-4 py-2.5 text-[10px] text-[#b9a8ff]" dir="ltr">
              <span>SEEKER OF TALENT</span>
              <span className="text-[#8f84b8]">
                SCORE <span className="text-[#f1ebff]">10 / 500</span>
              </span>
            </div>
            <div className="relative aspect-[12/5] overflow-hidden bg-black">
              <Shot src={gameImg} alt={r.short[lang]} pixel />
              <span className="absolute inset-0 grid place-items-center bg-[#040208]/25 transition-colors duration-700 group-hover:bg-transparent">
                <span className="vey-play font-pixel" dir="ltr">
                  ▶ PLAY
                </span>
              </span>
            </div>
            <div className="font-pixel flex items-center justify-center gap-3 py-2.5 text-[9px] text-[#8f84b8]" dir="ltr" aria-hidden>
              <span>EN</span>
              <span className="text-[#8f6dff]">◆</span>
              <span>FA</span>
              <span className="text-[#8f6dff]">◆</span>
              <span>AR</span>
              <span className="text-[#8f6dff]">◆</span>
              <span>RU</span>
              <span className="text-[#8f6dff]">◆</span>
              <span>JA</span>
            </div>
          </a>
        </Reveal>
      </Container>
    </section>
  );
}

/* =============================== Chapter VI =============================== */
const ORDER: { id: RealmId; target: string; num: string }[] = [
  { id: 'garden', target: 'realm-garden', num: 'I' },
  { id: 'cyber', target: 'realm-cyber', num: 'II' },
  { id: 'minimal', target: 'realm-minimal', num: 'III' },
  { id: 'game', target: 'realm-game', num: 'IV' },
];

export function Realms() {
  const lang = useUI((s) => s.lang);
  const tx = TEXT[lang];
  return (
    <>
      <section id="realms" data-chapter="6" className="relative">
        <Container className="pb-[4vh] pt-[18vh]">
          <div className="max-w-[720px]">
            <Kicker num="VI">{tx.realmsKicker}</Kicker>
            <BigTitle lines={tx.realmsTitle} />
            <Reveal delay={0.2}>
              <p className="mt-6 max-w-[560px] text-[15px] leading-7 text-white/60">{tx.realmsSub}</p>
            </Reveal>
            <Reveal delay={0.3}>
              <div className="mt-8 flex flex-wrap gap-2.5">
                {ORDER.map((o) => (
                  <button
                    key={o.id}
                    onClick={() => scrollToId(o.target)}
                    className="group flex items-center gap-2.5 rounded-full border border-white/10 bg-black/30 px-4 py-2.5 text-[12.5px] text-white/70 backdrop-blur-md transition-colors duration-500 hover:border-[var(--accent)] hover:text-white"
                  >
                    <span className="font-cinzel text-[11px] text-[var(--accent)]">{o.num}</span>
                    {REALMS[o.id].short[lang]}
                  </button>
                ))}
              </div>
            </Reveal>
          </div>
        </Container>
        <Garden />
      </section>
      <Cyber />
      <Minimal />
      <Game />
    </>
  );
}

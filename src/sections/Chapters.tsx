import { useMemo, useState, type FormEvent, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useUI, world } from '../store';
import {
  CONTACT,
  HOUSES,
  JOBS,
  LANGUAGES,
  PILLARS,
  ROMAN,
  SKILLS,
  STATS,
  TEXT,
  WORKS,
  duration,
  fmt,
  monthsBetween,
} from '../content';
import { BigTitle, Counter, EASE, Kicker, Reveal, SpotCard } from '../components/ui';
import { HouseSigil, SkillIcon } from '../components/Sigils';
import { scrollToTop } from '../hooks/useSmoothScroll';
import { ambience } from '../audio/ambience';
import { cn } from '../utils/cn';

const Container = ({ children, className }: { children: ReactNode; className?: string }) => (
  <div className={cn('mx-auto w-full max-w-[1320px] px-6 md:px-14', className)}>{children}</div>
);

/* ============================== I · Chronicle ============================== */
export function Chronicle() {
  const lang = useUI((s) => s.lang);
  const tx = TEXT[lang];
  return (
    <section id="about" data-chapter="1" className="relative flex min-h-screen items-center py-[16vh]">
      <Container>
        <div className="max-w-[620px]">
          <Kicker num="I">{tx.aboutKicker}</Kicker>
          <BigTitle lines={tx.aboutTitle} />
          <Reveal delay={0.15} className="mt-10">
            <div className="glass relative overflow-hidden p-7 md:p-8">
              <span className="pointer-events-none absolute -top-6 start-5 font-deco text-[110px] leading-none text-[var(--accent)] opacity-15" aria-hidden>
                “
              </span>
              <p className="relative text-[15px] leading-8 text-white/75 md:text-[16px]">{tx.about}</p>
            </div>
          </Reveal>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {STATS.map((s, i) => (
              <Reveal key={i} delay={0.2 + i * 0.1}>
                <SpotCard className="h-full p-5">
                  <div className="text-metal font-display text-[38px] leading-none">
                    <Counter value={s.value} suffix={s.suffix} />
                  </div>
                  <div className="mt-2.5 text-[11.5px] leading-snug text-white/50">{tx.stats[i]}</div>
                </SpotCard>
              </Reveal>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}

/* ============================== II · Pillars ============================== */
export function Pillars() {
  const lang = useUI((s) => s.lang);
  const tx = TEXT[lang];
  return (
    <section id="pillars" data-chapter="2" className="relative flex min-h-[150vh] flex-col py-[12vh]">
      <Container className="text-center">
        <Kicker num="II" className="justify-center">
          {tx.pillarsKicker}
        </Kicker>
        <BigTitle lines={tx.pillarsTitle} />
        <Reveal delay={0.2}>
          <p className="mx-auto mt-6 max-w-xl text-[15px] leading-7 text-white/60">{tx.pillarsSub}</p>
        </Reveal>
      </Container>
      <div className="min-h-[34vh] flex-1" />
      <Container className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-7">
        {PILLARS.map((p, i) => (
          <Reveal key={i} delay={i * 0.08} className="h-full">
            <SpotCard className="h-full p-5 text-center lg:min-h-[230px]">
              <div className="font-cinzel text-[22px] text-[#e2c182] drop-shadow-[0_0_14px_rgba(255,190,90,0.45)]">{ROMAN[i]}</div>
              <div className="mx-auto my-3.5 h-px w-10 bg-gradient-to-r from-transparent via-[#d9b56f] to-transparent" />
              <h3 className="font-display text-[17px] text-white">{p.name[lang]}</h3>
              <p className="mt-2.5 text-[12.5px] leading-relaxed text-white/55">{p.line[lang]}</p>
            </SpotCard>
          </Reveal>
        ))}
      </Container>
    </section>
  );
}

/* ============================== III · Houses ============================== */
function MasteryRing({ value, label }: { value: number; label: string }) {
  const lang = useUI((s) => s.lang);
  const r = 26;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative grid h-[72px] w-[72px] place-items-center">
      <svg viewBox="0 0 64 64" className="absolute inset-0 h-full w-full -rotate-90" aria-hidden>
        <circle cx="32" cy="32" r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="2" />
        <motion.circle
          cx="32"
          cy="32"
          r={r}
          fill="none"
          stroke="var(--accent)"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          whileInView={{ strokeDashoffset: c * (1 - value / 100) }}
          viewport={{ once: true }}
          transition={{ duration: 2, ease: EASE, delay: 0.3 }}
          style={{ filter: 'drop-shadow(0 0 6px var(--accent))' }}
        />
      </svg>
      <div className="text-center leading-none">
        <div className="font-display text-[20px] text-white">{fmt(value, lang)}</div>
        <div className="mt-1 font-mono text-[8px] uppercase tracking-[0.2em] text-white/40">{label}</div>
      </div>
    </div>
  );
}

function HouseCard({ house }: { house: (typeof HOUSES)[number] }) {
  const lang = useUI((s) => s.lang);
  const tx = TEXT[lang];
  const skills = SKILLS.filter((s) => s.house === house.id);
  const avg = Math.round(skills.reduce((a, s) => a + s.value, 0) / skills.length);
  return (
    <SpotCard tilt className="h-full overflow-hidden">
      <div className="relative px-7 pb-7 pt-7">
        <div className="flex items-start justify-between gap-4">
          <div
            className="grid h-[96px] w-[76px] place-items-center pb-3 text-[var(--accent)]"
            style={{
              clipPath: 'polygon(0 0, 100% 0, 100% 80%, 50% 100%, 0 80%)',
              background: 'linear-gradient(180deg, color-mix(in oklab, var(--accent) 24%, transparent), color-mix(in oklab, var(--accent) 3%, transparent))',
              borderRadius: '14px 14px 0 0',
            }}
          >
            <HouseSigil kind={house.sigil} className="h-11 w-11 drop-shadow-[0_0_10px_var(--accent)]" />
          </div>
          <MasteryRing value={avg} label={tx.mastery} />
        </div>
        <p className="mt-6 font-mono text-[10px] uppercase tracking-[0.3em] text-white/40">{tx.house}</p>
        <h3 className="text-metal mt-1 font-display text-[30px] leading-tight">{house.name[lang]}</h3>
        <p className={cn('mt-1.5 font-display text-[14px] text-accent-grad', lang === 'en' && 'italic')}>“{house.words[lang]}”</p>
      </div>
      <div className="mx-7 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />
      <ul className="space-y-5 px-7 py-7">
        {skills.map((s) => (
          <li key={s.name.en}>
            <div className="flex items-center gap-3">
              <SkillIcon slug={s.icon} className="grid h-8 w-8 flex-none place-items-center rounded-xl border border-white/10 bg-white/[0.03]" />
              <span className="text-[13.5px] text-white/90">{s.name[lang]}</span>
              <span className="ms-auto font-mono text-[10px] uppercase tracking-[0.16em] text-white/40">{s.level === 'a' ? tx.advanced : tx.proficient}</span>
              <span className="w-11 text-end font-mono text-[12px] tabular-nums text-white/85">{fmt(s.value, lang)}%</span>
            </div>
            <div className="relative mt-2.5 h-[3px] overflow-hidden rounded-full bg-white/[0.07]">
              <motion.div
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: s.value / 100 }}
                viewport={{ once: true }}
                transition={{ duration: 1.8, ease: EASE, delay: 0.25 }}
                className="absolute inset-0 rounded-full"
                style={{
                  transformOrigin: lang === 'fa' ? 'right' : 'left',
                  background: `linear-gradient(${lang === 'fa' ? '270deg' : '90deg'}, #8fdcff, var(--accent))`,
                  boxShadow: '0 0 12px var(--accent)',
                }}
              />
            </div>
          </li>
        ))}
      </ul>
    </SpotCard>
  );
}

export function Houses() {
  const lang = useUI((s) => s.lang);
  const tx = TEXT[lang];
  return (
    <section id="skills" data-chapter="3" className="relative min-h-screen py-[16vh]">
      <Container>
        <div className="md:ms-auto md:max-w-[560px]">
          <Kicker num="III">{tx.housesKicker}</Kicker>
          <BigTitle lines={tx.housesTitle} />
          <Reveal delay={0.2}>
            <p className="mt-6 text-[15px] leading-7 text-white/60">{tx.housesSub}</p>
          </Reveal>
        </div>
        <div className="mt-14 grid gap-5 lg:grid-cols-3">
          {HOUSES.map((h, i) => (
            <Reveal key={h.id} delay={i * 0.12} className="h-full">
              <HouseCard house={h} />
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}

/* ============================== IV · Campaigns ============================== */
function ActivityCard() {
  const lang = useUI((s) => s.lang);
  const tx = TEXT[lang];
  const { d, area, peak, max, labels } = useMemo(() => {
    const series: number[] = [];
    let y = 2022;
    let m = 2;
    while (y < 2025 || (y === 2025 && m <= 5)) {
      const v = JOBS.reduce((acc, j) => {
        const after = y > j.start[0] || (y === j.start[0] && m >= j.start[1]);
        const before = y < j.end[0] || (y === j.end[0] && m <= j.end[1]);
        return acc + (after && before ? j.roles.en.length : 0);
      }, 0);
      series.push(v);
      m++;
      if (m > 12) {
        m = 1;
        y++;
      }
    }
    const W = 320;
    const H = 120;
    const P = 10;
    const mx = Math.max(...series);
    const pts = series.map((v, i) => [P + (i / (series.length - 1)) * (W - 2 * P), H - P - (v / mx) * (H - 2 * P - 14)]);
    let path = `M${pts[0][0].toFixed(1)},${pts[0][1].toFixed(1)}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i - 1] || pts[i];
      const p1 = pts[i];
      const p2 = pts[i + 1];
      const p3 = pts[i + 2] || p2;
      const c1x = p1[0] + (p2[0] - p0[0]) / 6;
      const c1y = p1[1] + (p2[1] - p0[1]) / 6;
      const c2x = p2[0] - (p3[0] - p1[0]) / 6;
      const c2y = p2[1] - (p3[1] - p1[1]) / 6;
      path += ` C${c1x.toFixed(1)},${c1y.toFixed(1)} ${c2x.toFixed(1)},${c2y.toFixed(1)} ${p2[0].toFixed(1)},${p2[1].toFixed(1)}`;
    }
    const last = pts[pts.length - 1];
    const ar = `${path} L${last[0].toFixed(1)},${H} L${pts[0][0].toFixed(1)},${H} Z`;
    const pi = series.indexOf(mx);
    const xs = (idx: number) => P + (idx / (series.length - 1)) * (W - 2 * P);
    return {
      d: path,
      area: ar,
      peak: pts[pi],
      max: mx,
      labels: [
        { x: xs(0), t: '2022' },
        { x: xs(11), t: '2023' },
        { x: xs(23), t: '2024' },
        { x: xs(35), t: '2025' },
      ],
    };
  }, []);

  return (
    <SpotCard className="h-full p-6">
      <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/40">{tx.activitySub}</p>
      <h4 className="mt-1 font-display text-[18px] text-white">{tx.activity}</h4>
      <div className="mt-4" dir="ltr">
        <svg viewBox="0 0 320 136" className="w-full overflow-visible" aria-hidden>
          <defs>
            <linearGradient id="actFill" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.35" />
              <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
            </linearGradient>
          </defs>
          <motion.path d={area} fill="url(#actFill)" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 1.6, delay: 0.8 }} />
          <motion.path
            d={d}
            fill="none"
            stroke="var(--accent)"
            strokeWidth="2"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            whileInView={{ pathLength: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 2.2, ease: EASE }}
            style={{ filter: 'drop-shadow(0 0 6px var(--accent))' }}
          />
          <circle cx={peak[0]} cy={peak[1]} r="4" fill="#04060b" stroke="var(--accent)" strokeWidth="2" />
          <text x={peak[0] + 8} y={peak[1] - 6} fill="rgba(255,255,255,0.75)" fontSize="10" fontFamily="JetBrains Mono, monospace">
            {fmt(max, lang)} {tx.peak}
          </text>
          {labels.map((l) => (
            <text key={l.t} x={l.x} y={134} fill="rgba(255,255,255,0.35)" fontSize="9" fontFamily="JetBrains Mono, monospace">
              {l.t}
            </text>
          ))}
        </svg>
      </div>
    </SpotCard>
  );
}

function TonguesCard() {
  const lang = useUI((s) => s.lang);
  const tx = TEXT[lang];
  return (
    <SpotCard className="h-full p-6">
      <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/40">{tx.tonguesSub}</p>
      <h4 className="mt-1 font-display text-[18px] text-white">{tx.tongues}</h4>
      <ul className="mt-5 space-y-4">
        {LANGUAGES.map((l) => (
          <li key={l.name.en}>
            <div className="flex items-baseline justify-between text-[13px]">
              <span className="text-white/85">{l.name[lang]}</span>
              <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-white/40">{l.level[lang]}</span>
            </div>
            <div className="mt-2 flex gap-1">
              {Array.from({ length: 10 }).map((_, k) => (
                <motion.span
                  key={k}
                  initial={{ opacity: 0.15 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 + k * 0.06 }}
                  className={cn('h-1 flex-1 rounded-full', k < Math.round(l.value / 10) ? 'bg-[var(--accent)] shadow-[0_0_8px_var(--accent)]' : 'bg-white/10')}
                />
              ))}
            </div>
          </li>
        ))}
      </ul>
    </SpotCard>
  );
}

export function Campaigns() {
  const lang = useUI((s) => s.lang);
  const tx = TEXT[lang];
  return (
    <section id="resume" data-chapter="4" className="relative min-h-screen py-[16vh]">
      <Container>
        <div className="max-w-[700px]">
          <Kicker num="IV">{tx.campKicker}</Kicker>
          <BigTitle lines={tx.campTitle} />
          <Reveal delay={0.2}>
            <p className="mt-6 text-[15px] leading-7 text-white/60">{tx.campSub}</p>
          </Reveal>
          <ol className="relative mt-12 space-y-5">
            <span className="absolute bottom-8 start-[19px] top-8 w-px bg-gradient-to-b from-[var(--accent)] via-white/15 to-transparent" aria-hidden />
            {JOBS.map((j, i) => (
              <li key={j.company.en} className="relative ps-14">
                <span className="absolute start-0 top-7 grid h-10 w-10 place-items-center rounded-full border border-white/15 bg-[#070a12] font-cinzel text-[12px] text-[var(--accent)] shadow-[0_0_24px_-6px_var(--accent)]">
                  {ROMAN[i]}
                </span>
                <Reveal delay={i * 0.12}>
                  <SpotCard className="p-6 md:p-7">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-white/50">{j.dates[lang]}</span>
                      <span className="chip !border-white/15 !text-[var(--accent)]">{duration(monthsBetween(j.start, j.end), lang)}</span>
                    </div>
                    <h3 className="mt-3 font-display text-[22px] leading-snug text-white md:text-[25px]">{j.company[lang]}</h3>
                    <ul className="mt-4 flex flex-wrap gap-2">
                      {j.roles[lang].map((r) => (
                        <li key={r} className="chip">
                          {r}
                        </li>
                      ))}
                    </ul>
                  </SpotCard>
                </Reveal>
              </li>
            ))}
          </ol>
          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <Reveal className="h-full">
              <TonguesCard />
            </Reveal>
            <Reveal delay={0.12} className="h-full">
              <ActivityCard />
            </Reveal>
          </div>
        </div>
      </Container>
    </section>
  );
}

/* ============================== V · Strongholds ============================== */
function WorkCard({ w, i }: { w: (typeof WORKS)[number]; i: number }) {
  const lang = useUI((s) => s.lang);
  const tx = TEXT[lang];
  const [imgOk, setImgOk] = useState(true);
  const shot = `https://s.wordpress.com/mshots/v1/${encodeURIComponent('https://' + w.domain)}?w=800&h=500`;
  return (
    <a href={`https://${w.domain}`} target="_blank" rel="noreferrer noopener" className="group block h-full">
      <SpotCard tilt className="h-full overflow-hidden p-2">
        <div className="relative aspect-[16/10] overflow-hidden rounded-[20px] bg-[#0a0e17]">
          <div
            className="absolute inset-0"
            style={{ background: `radial-gradient(120% 90% at 20% 10%, ${w.accent}44, transparent 60%), radial-gradient(80% 80% at 90% 100%, ${w.accent}22, transparent 60%)` }}
          />
          <span className="absolute inset-0 grid place-items-center font-cinzel text-[110px] leading-none text-white/[0.06]">{w.domain[0].toUpperCase()}</span>
          {imgOk && (
            <img
              src={shot}
              alt={w.domain}
              loading="lazy"
              referrerPolicy="no-referrer"
              onError={() => setImgOk(false)}
              onLoad={(e) => {
                // mShots returns a small placeholder while the screenshot is being generated
                const im = e.currentTarget;
                if (im.naturalWidth < 600) setImgOk(false);
                else im.style.opacity = '';
              }}
              style={{ opacity: 0 }}
              className="absolute inset-0 h-full w-full object-cover object-top opacity-55 mix-blend-luminosity transition-all duration-[1200ms] ease-out group-hover:scale-[1.04] group-hover:opacity-90 group-hover:mix-blend-normal"
            />
          )}
          <div className="scanlines pointer-events-none absolute inset-0 opacity-40" />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#070a12] via-[#070a12]/10 to-transparent" />
          <span className="chip absolute start-3 top-3 !bg-black/45 backdrop-blur-md">
            <span className="font-cinzel text-[var(--accent)]">{ROMAN[i]}</span>
            {tx.stronghold}
          </span>
          <span className="absolute end-3 top-3 grid h-9 w-9 place-items-center rounded-full border border-white/15 bg-black/45 text-white/80 backdrop-blur-md transition-all duration-500 group-hover:rotate-45 group-hover:border-[var(--accent)] group-hover:text-[var(--accent)]">
            ↗
          </span>
        </div>
        <div className="px-4 pb-4 pt-4">
          <div className="flex items-center gap-2.5">
            <img src={`https://www.google.com/s2/favicons?domain=${w.domain}&sz=64`} alt="" className="h-5 w-5 rounded" loading="lazy" />
            <span className="font-mono text-[14px] text-white" dir="ltr">
              {w.domain}
            </span>
          </div>
          <p className="mt-2.5 text-[13px] leading-6 text-white/60">{w.desc[lang]}</p>
          <div className="mt-4 flex flex-wrap gap-1.5">
            {w.tags[lang].split(' · ').map((t) => (
              <span key={t} className="chip">
                {t}
              </span>
            ))}
          </div>
          <p className="mt-3 font-mono text-[10.5px] uppercase tracking-[0.14em] text-white/35">{w.role[lang]}</p>
        </div>
      </SpotCard>
    </a>
  );
}

export function Strongholds() {
  const lang = useUI((s) => s.lang);
  const tx = TEXT[lang];
  const [filter, setFilter] = useState<'all' | 'store' | 'corp'>('all');
  const list = WORKS.map((w, i) => ({ w, i })).filter(({ w }) => filter === 'all' || w.cat === filter);
  return (
    <section id="works" data-chapter="5" className="relative min-h-screen py-[16vh]">
      <Container>
        <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <div className="max-w-[600px]">
            <Kicker num="V">{tx.worksKicker}</Kicker>
            <BigTitle lines={tx.worksTitle} />
            <Reveal delay={0.2}>
              <p className="mt-6 text-[15px] leading-7 text-white/60">{tx.worksSub}</p>
            </Reveal>
          </div>
          <Reveal delay={0.25}>
            <div className="inline-flex flex-wrap rounded-full border border-white/10 bg-black/30 p-1 backdrop-blur-md">
              {(['all', 'store', 'corp'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={cn('relative rounded-full px-4 py-2 text-[12px] transition-colors', filter === f ? 'text-[#05070c]' : 'text-white/60 hover:text-white')}
                >
                  {filter === f && (
                    <motion.span
                      layoutId="workpill"
                      className="absolute inset-0 rounded-full bg-gradient-to-r from-[var(--accent-2)] to-[var(--accent)]"
                      transition={{ type: 'spring', stiffness: 140, damping: 20 }}
                    />
                  )}
                  <span className="relative">{tx.filters[f]}</span>
                </button>
              ))}
            </div>
          </Reveal>
        </div>
        <motion.div layout className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {list.map(({ w, i }) => (
              <motion.div
                key={w.domain}
                layout
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.7, ease: EASE }}
                className="h-full"
              >
                <Reveal delay={(i % 3) * 0.1} className="h-full">
                  <WorkCard w={w} i={i} />
                </Reveal>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </Container>
    </section>
  );
}

/* ============================== VI · Rookery ============================== */
const IconMail = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <rect x="3" y="5" width="18" height="14" rx="3" />
    <path d="M4 7l8 6 8-6" />
  </svg>
);
const IconSend = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M21 3L10 14" />
    <path d="M21 3l-7 18-4-7-7-4 18-7z" />
  </svg>
);
const IconPhone = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z" />
  </svg>
);
const IconRaven = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden>
    <path d="M2 13c3-1 5-3 7-6 1 2 2 3 4 3l3-3c1 0 2 .5 3 1.5L22 7l-2 2c0 4-3 8-8 9l1 3h-2l-1-3c-3 0-5-1-7-3l3-1c-2-.5-3-1-4-1z" />
  </svg>
);

export function Rookery() {
  const lang = useUI((s) => s.lang);
  const tx = TEXT[lang];
  const [name, setName] = useState('');
  const [msg, setMsg] = useState('');
  const [sent, setSent] = useState(false);

  const send = (e: FormEvent) => {
    e.preventDefault();
    world.ravenSent = performance.now() / 1000;
    ambience.flaps();
    setSent(true);
    const subject = `${tx.ravenSubject} ${name.trim() || '—'}`;
    const href = `mailto:${CONTACT.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(msg)}`;
    window.setTimeout(() => {
      window.location.href = href;
    }, 1200);
    window.setTimeout(() => setSent(false), 4500);
  };

  const links = [
    { label: tx.email, value: CONTACT.email, href: `mailto:${CONTACT.email}`, icon: <IconMail /> },
    { label: tx.telegram, value: CONTACT.telegram, href: CONTACT.telegramUrl, icon: <IconSend /> },
    { label: tx.phone, value: CONTACT.phone, href: CONTACT.phoneUrl, icon: <IconPhone /> },
  ];

  return (
    <section id="contact" data-chapter="10" className="relative flex min-h-[100svh] flex-col pb-8 pt-[12vh]">
      <Container className="text-center">
        <Kicker num="VII" className="justify-center">
          {tx.contactKicker}
        </Kicker>
        <BigTitle lines={tx.contactTitle} inline className="!mt-4 !text-[clamp(2.6rem,5.6vw,5.8rem)]" />
      </Container>

      <div className="min-h-[38vh] flex-1" />

      <div className="mx-auto w-full max-w-[1120px] px-6 md:px-12">
        <div className="grid gap-3 md:grid-cols-3">
          {links.map((c, i) => (
            <Reveal key={c.label} delay={i * 0.1}>
              <a href={c.href} target={c.href.startsWith('http') ? '_blank' : undefined} rel="noreferrer noopener" className="group block">
                <SpotCard className="flex items-center gap-4 p-5">
                  <span className="grid h-11 w-11 flex-none place-items-center rounded-2xl border border-white/10 bg-white/[0.03] text-[var(--accent)]">{c.icon}</span>
                  <span className="min-w-0 text-start">
                    <span className="block font-mono text-[10px] uppercase tracking-[0.25em] text-white/40">{c.label}</span>
                    <span className="mt-1 block truncate text-[15px] text-white/90" dir="ltr">
                      {c.value}
                    </span>
                  </span>
                  <span className="ms-auto text-white/40 transition-all duration-500 group-hover:translate-x-1 group-hover:text-[var(--accent)] rtl:rotate-180 rtl:group-hover:-translate-x-1">
                    →
                  </span>
                </SpotCard>
              </a>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.2}>
          <form onSubmit={send} className="glass mt-3 flex flex-col gap-2 p-2 md:flex-row md:items-center">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={tx.formName}
              className="input-line h-12 rounded-2xl px-4 md:w-[28%] md:rounded-none md:border-e md:border-white/10"
              aria-label={tx.formName}
            />
            <input
              value={msg}
              onChange={(e) => setMsg(e.target.value)}
              placeholder={tx.formMsg}
              required
              className="input-line h-12 flex-1 px-4"
              aria-label={tx.formMsg}
            />
            <button type="submit" className="btn btn-primary !h-12 shrink-0">
              <IconRaven />
              <AnimatePresence mode="wait">
                <motion.span
                  key={sent ? 's' : 'n'}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.35 }}
                >
                  {sent ? tx.formSent : tx.formSend}
                </motion.span>
              </AnimatePresence>
            </button>
          </form>
        </Reveal>

        <Reveal delay={0.25}>
          <p className="mt-6 text-center text-[14px] leading-7 text-white/55">{tx.contactSub}</p>
        </Reveal>

        <footer className="mt-8 flex flex-col items-center justify-between gap-4 border-t border-white/[0.07] pt-6 text-center md:flex-row md:text-start">
          <span className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-white/35">{tx.footer}</span>
          <span className="font-display text-[12.5px] tracking-[0.12em] text-white/50">{tx.valar}</span>
          <button onClick={scrollToTop} className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-white/35 transition-colors hover:text-[var(--accent)]">
            {tx.backTop} ↑
          </button>
        </footer>
      </div>
    </section>
  );
}

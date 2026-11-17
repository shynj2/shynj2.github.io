import { useState } from 'react';

type P = { className?: string };

export function SigilMark({ className }: P) {
  return (
    <svg viewBox="0 0 64 64" className={className} fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden>
      <circle cx="32" cy="32" r="29.5" opacity="0.45" />
      <circle cx="32" cy="32" r="24.5" strokeDasharray="1.2 3.6" opacity="0.8" />
      <path d="M32 11.5c7.4 8.3 11.4 15.5 11.4 22.4a11.4 11.4 0 0 1-22.8 0c0-6.9 4-14.1 11.4-22.4z" />
      <path
        d="M32 23.5c3.6 4.2 5.6 7.8 5.6 11.2a5.6 5.6 0 0 1-11.2 0c0-3.4 2-7 5.6-11.2z"
        fill="currentColor"
        stroke="none"
        opacity="0.9"
      />
    </svg>
  );
}

export function SigilTower({ className }: P) {
  return (
    <svg viewBox="0 0 64 64" className={className} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M20 52V27h24v25" />
      <path d="M17.5 27h29" />
      <path d="M20 27v-7h5v4h4.5v-4h5v4H39v-4h5v7" />
      <path d="M12 52h40" />
      <path d="M28 37.5l-4 3.5 4 3.5M36 37.5l4 3.5-4 3.5" />
      <path d="M33.2 36l-2.4 10" />
      <path d="M32 20V10l7 3-7 3" opacity="0.8" />
    </svg>
  );
}

export function SigilEye({ className }: P) {
  return (
    <svg viewBox="0 0 64 64" className={className} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M8 33c6.2-9 14.2-13.6 24-13.6S49.8 24 56 33c-6.2 9-14.2 13.6-24 13.6S14.2 42 8 33z" />
      <circle cx="32" cy="33" r="7.5" />
      <circle cx="32" cy="33" r="2.6" fill="currentColor" stroke="none" />
      <path d="M32 9v6M19 12.5l3.2 5M45 12.5l-3.2 5" />
      <path d="M22 54l10-5 10 5" opacity="0.7" />
    </svg>
  );
}

export function SigilDragon({ className }: P) {
  return (
    <svg viewBox="0 0 64 64" className={className} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M32 14c5.2 6.2 8.2 11.6 8.2 17a8.2 8.2 0 0 1-16.4 0c0-5.4 3-10.8 8.2-17z" />
      <path d="M32 24.5c2.3 2.8 3.6 5.2 3.6 7.6a3.6 3.6 0 0 1-7.2 0c0-2.4 1.3-4.8 3.6-7.6z" fill="currentColor" stroke="none" />
      <path d="M24.5 33C18 29.5 12.5 23.5 8.5 15.5c4 2.2 8 2.4 11.2 1.4-1 3.2 0 6.2 2 8.2 1-2 3-3.2 5-3.2" />
      <path d="M39.5 33c6.5-3.5 12-9.5 16-17.5-4 2.2-8 2.4-11.2 1.4 1 3.2 0 6.2-2 8.2-1-2-3-3.2-5-3.2" />
      <path d="M27 45l5 8 5-8" />
    </svg>
  );
}

export function HouseSigil({ kind, className }: { kind: 'tower' | 'eye' | 'dragon'; className?: string }) {
  if (kind === 'tower') return <SigilTower className={className} />;
  if (kind === 'eye') return <SigilEye className={className} />;
  return <SigilDragon className={className} />;
}

/** Brand icon from Simple Icons, with a rune fallback. */
export function SkillIcon({ slug, className }: { slug: string; className?: string }) {
  const [failed, setFailed] = useState(!slug);
  if (failed) {
    return (
      <span className={className} aria-hidden>
        <span className="grid h-full w-full place-items-center font-cinzel text-[15px] text-[var(--accent)]">ᛟ</span>
      </span>
    );
  }
  return (
    <span className={className} aria-hidden>
      <img
        src={`https://cdn.simpleicons.org/${slug}/d6ecff`}
        alt=""
        width={18}
        height={18}
        loading="lazy"
        className="h-[18px] w-[18px] opacity-80"
        onError={() => setFailed(true)}
      />
    </span>
  );
}

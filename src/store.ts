import { create } from 'zustand';

export type Lang = 'en' | 'fa';

const initialLang = (): Lang => {
  try {
    const s = localStorage.getItem('soic_lang');
    if (s === 'fa' || s === 'en') return s;
  } catch {
    /* ignore */
  }
  return typeof navigator !== 'undefined' && /^fa/i.test(navigator.language) ? 'fa' : 'en';
};

type UIState = {
  lang: Lang;
  setLang: (l: Lang) => void;
  ready: boolean;
  setReady: () => void;
  entered: boolean;
  enter: (sound: boolean) => void;
  sound: boolean;
  setSound: (v: boolean) => void;
  chapter: number;
  setChapter: (n: number) => void;
  menu: boolean;
  setMenu: (v: boolean) => void;
};

export const useUI = create<UIState>((set) => ({
  lang: initialLang(),
  setLang: (lang) => {
    try {
      localStorage.setItem('soic_lang', lang);
    } catch {
      /* ignore */
    }
    set({ lang });
  },
  ready: false,
  setReady: () => set({ ready: true }),
  entered: false,
  enter: (sound) => set({ entered: true, sound }),
  sound: false,
  setSound: (sound) => set({ sound }),
  chapter: 0,
  setChapter: (chapter) => set({ chapter }),
  menu: false,
  setMenu: (menu) => set({ menu }),
}));

export const PHOENIX_CHAPTER = 11;
export const PHOENIX_MAX_TEMP = 4000;
const PHOENIX_IDLE_TEMP = 1480;

export type ScreenEllipse = { x: number; y: number; rx: number; ry: number };
const ellipse = (): ScreenEllipse => ({ x: 0, y: 0, rx: 0, ry: 0 });

/** Mutable per-frame state shared between DOM and WebGL (never triggers React renders). */
export const world = {
  chapter: 0,
  progress: 0,
  scroll: 0,
  velocity: 0,
  pointer: { x: 0, y: 0 },
  pointerPx: { x: -200, y: -200 },
  pointerActive: false,
  touching: false,
  touchDragging: false,
  touchFling: false,
  clickShock: 0,
  clickWave: 0,
  holding: false,
  pressStartedAt: 0,
  charge: 0,
  burst: 0,
  heat: 0,
  rtl: false,
  mobile: false,
  reduced: false,
  ravenSent: -100,
  relicTarget: ellipse(),
  phoenixReady: false,
  phoenixPress: false,
  phoenixTargets: [ellipse(), ellipse()],
  /** Only the hatched phoenix can build up this extra charge (0–1). */
  phoenixCharge: 0,
  /** True while the 4000° white-out is playing. */
  igniting: false,
  /** Seconds since the white-out began. */
  igniteT: 0,
  /** 0 → 1 how completely the white light fills the screen. */
  ignite: 0,
  /** The world has already been wound back to the frozen egg. */
  resetDone: false,
};

function insideEllipse({ x: cx, y: cy, rx, ry }: ScreenEllipse, x: number, y: number) {
  if (rx <= 0 || ry <= 0) return false;
  const nx = (x - cx) / rx;
  const ny = (y - cy) / ry;
  return nx * nx + ny * ny <= 1;
}

export function isOnRelic(x: number, y: number) {
  return insideEllipse(world.relicTarget, x, y);
}

export function isOnPhoenix(x: number, y: number) {
  if (!world.phoenixReady || world.chapter < PHOENIX_CHAPTER || world.igniting) return false;
  return insideEllipse(world.phoenixTargets[0], x, y) || insideEllipse(world.phoenixTargets[1], x, y);
}

export function phoenixTemperature() {
  const risen = Math.floor((PHOENIX_MAX_TEMP - PHOENIX_IDLE_TEMP) * world.phoenixCharge);
  return PHOENIX_IDLE_TEMP + risen;
}

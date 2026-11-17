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

/** Mutable per-frame state shared between DOM and WebGL (never triggers React renders). */
export const world = {
  chapter: 0,
  progress: 0,
  scroll: 0,
  velocity: 0,
  pointer: { x: 0, y: 0 },
  pointerPx: { x: -200, y: -200 },
  pointerActive: false,
  clickShock: 0,
  clickWave: 0,
  holding: false,
  charge: 0,
  burst: 0,
  heat: 0,
  rtl: false,
  mobile: false,
  reduced: false,
  ravenSent: -100,
  /** Press & hold overcharge, in °C. Reaches 4000 and the world starts over. */
  temp: 0,
  /** True while the 4000° white-out is playing. */
  igniting: false,
  /** Seconds since the white-out began. */
  igniteT: 0,
  /** 0 → 1 how completely the white light fills the screen. */
  ignite: 0,
  /** The world has already been wound back to the frozen egg. */
  resetDone: false,
};

import { useEffect, useRef } from 'react';
import { Scene } from './three/Scene';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Hero } from './sections/Hero';
import { Campaigns, Chronicle, Houses, Pillars, Rookery, Strongholds } from './sections/Chapters';
import { Realms } from './sections/Realms';
import { Hud } from './components/Hud';
import { Cursor } from './components/Cursor';
import { Overcharge } from './components/Overcharge';
import { Preloader } from './components/Preloader';
import { useSmoothScroll } from './hooks/useSmoothScroll';
import { useInput } from './hooks/useInput';
import { useUI, world } from './store';
import { TEXT } from './content';
import { ambience } from './audio/ambience';

export default function App() {
  const lang = useUI((s) => s.lang);
  const sound = useUI((s) => s.sound);
  const grainRef = useRef<HTMLDivElement>(null);

  useSmoothScroll();
  useInput();

  // Pre-bake a single seamless monochrome grain tile once onto GPU bitmap cache
  // (avoids expensive full-screen live SVG feTurbulence filter evaluation on desktop)
  useEffect(() => {
    const el = grainRef.current;
    if (!el) return;
    const c = document.createElement('canvas');
    const S = 160;
    c.width = S;
    c.height = S;
    const ctx = c.getContext('2d');
    if (!ctx) return;
    const img = ctx.createImageData(S, S);
    const d = img.data;
    for (let i = 0; i < d.length; i += 4) {
      const v = (Math.random() * 255) | 0;
      d[i] = v;
      d[i + 1] = v;
      d[i + 2] = v;
      d[i + 3] = 255;
    }
    ctx.putImageData(img, 0, 0);
    el.style.backgroundImage = `url(${c.toDataURL('image/png')})`;
  }, []);

  useEffect(() => {
    const html = document.documentElement;
    html.lang = lang;
    html.dir = lang === 'fa' ? 'rtl' : 'ltr';
    world.rtl = lang === 'fa';
    document.title = TEXT[lang].title;
  }, [lang]);

  useEffect(() => {
    if (sound) ambience.start();
    else ambience.mute();
  }, [sound]);

  useEffect(() => {
    const onVis = () => {
      if (document.hidden) ambience.mute();
      else if (useUI.getState().sound) ambience.start();
    };
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, []);

  return (
    <>
      <ErrorBoundary fallback={<div className="fixed inset-0 z-0" style={{ background: '#04060b' }} />}>
        <Scene />
      </ErrorBoundary>
      <div ref={grainRef} className="grain" aria-hidden />
      <main className="relative z-10">
        <Hero />
        <Chronicle />
        <Pillars />
        <Houses />
        <Campaigns />
        <Strongholds />
        <Realms />
        <Rookery />
        {/* an empty stretch of sky: here the shell finally breaks and the phoenix rises (see three/Phoenix.tsx) */}
        <section id="rebirth" data-chapter="11" className="relative h-[140vh]" aria-hidden />
        
      </main>
      <Hud />
      <Overcharge />
      <Cursor />
      <Preloader />
    </>
  );
}

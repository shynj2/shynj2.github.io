/* ==========================================================================
   THE RUNE ARCHITECT — Veyrath · "Veyrath Reborn" runtime
   Logical resolution 640x360 (width shrinks on portrait phones), integer scaling,
   16 px tiles, every pixel from the master palette. Art comes from the atlases
   baked by tools/build.mjs (constant ART). No per-frame gradients, no blur.
   ========================================================================== */
const el = (id) => document.getElementById(id);
const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
const lerp = (a, b, t) => a + (b - a) * t;
const TAU = Math.PI * 2;
function mulberry32(a) {
  return function () {
    a |= 0; a = a + 0x6D2B79F5 | 0;
    let t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}
/** stable 0..1 hash of two integers (tile variants, flicker) */
function hash2(x, y, s) {
  let h = Math.imul(x | 0, 374761393) + Math.imul(y | 0, 668265263) + Math.imul(s | 0, 2246822519);
  h = Math.imul(h ^ h >>> 13, 1274126177);
  return ((h ^ h >>> 16) >>> 0) / 4294967296;
}
function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
function mk(w, h) { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; }
const REDUCED = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);

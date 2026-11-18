/* ==========================================================================
   ASSETS — atlases travel as 8-bit index PNGs (grey value = palette index).
   They are decoded on demand (per zone) and coloured through a LUT:
     environment: index 1..63 = master colour, +128 = emissive (drawn again after the darkness)
     characters:  index = colour ROLE, +64 / +128 = right / left silhouette edge (rim light)
   ========================================================================== */
const PALRGB = ART.pal;
const palHex = (name) => { const c = PALRGB[ART.names[name]]; return 'rgb(' + c[0] + ',' + c[1] + ',' + c[2] + ')'; };
const rgba32 = (c) => (255 << 24 | c[2] << 16 | c[1] << 8 | c[0]) >>> 0;

const Art = {
  buf: {},            // decoded index buffers  key -> {w,h,d}
  kit: null,          // current environment atlas {key, lut, s (rects), e (emissive flags), col, emi}
  px: {},             // parallax canvases of the current zone
  rigs: {},           // name -> {def, cv:[[right/litRight, right/litLeft],[left/litRight, left/litLeft]]}
  _pending: {},

  decode(key, src) {
    if (this.buf[key]) return Promise.resolve(this.buf[key]);
    if (this._pending[key]) return this._pending[key];
    return (this._pending[key] = new Promise((res, rej) => {
      const im = new Image();
      im.onload = () => {
        const c = mk(src.w, src.h), g = c.getContext('2d', { willReadFrequently: true });
        g.drawImage(im, 0, 0);
        const px = g.getImageData(0, 0, src.w, src.h).data, d = new Uint8Array(src.w * src.h);
        for (let i = 0; i < d.length; i++) d[i] = px[i * 4 + 3] > 127 ? px[i * 4] : 0;
        res(this.buf[key] = { w: src.w, h: src.h, d });
      };
      im.onerror = rej;
      im.src = 'data:image/png;base64,' + src.png;
    }));
  },
  /** make sure everything a zone needs is decoded (lazy, once) */
  need(z) {
    const jobs = [this.decode('atlas:' + z.atlas, ART.atlases[z.atlas])];
    const px = ART.parallax[z.atlas] || {};
    for (const k in px) jobs.push(this.decode('px:' + z.atlas + ':' + k, px[k]));
    for (const k in ART.rigs) jobs.push(this.decode('rig:' + k, ART.rigs[k]));
    return Promise.all(jobs);
  },
  /** index buffer -> canvas through a 256-entry Uint32 colour table (0 = transparent) */
  tint(b, lut) {
    const c = mk(b.w, b.h), g = c.getContext('2d'), id = g.createImageData(b.w, b.h), o = new Uint32Array(id.data.buffer), d = b.d;
    for (let i = 0; i < d.length; i++) o[i] = lut[d[i]];
    g.putImageData(id, 0, 0);
    return c;
  },
  /** colour tables for environment art under a zone LUT (optionally chained with a second one, e.g. 'mercy') */
  envLuts(lutName, over) {
    const zl = ART.luts[lutName] || ART.luts.identity, ol = over ? ART.luts[over] : null;
    const col = new Uint32Array(256), emi = new Uint32Array(256);
    for (let i = 1; i < 256; i++) {
      let m = i & 63; if (!m || m >= PALRGB.length) continue;
      m = zl[m]; if (ol) m = ol[m];
      col[i] = rgba32(PALRGB[m]);
      if (i & 128) emi[i] = col[i];
    }
    return { col, emi };
  },
  useZone(z, over) {
    const key = z.atlas + '|' + z.lut + '|' + (over || '');
    if (this.kit && this.kit.key === key) return;
    const src = ART.atlases[z.atlas], b = this.buf['atlas:' + z.atlas], L = this.envLuts(z.lut, over);
    this.kit = { key, s: src.s, e: src.e, col: this.tint(b, L.col), emi: this.tint(b, L.emi), css: PALRGB.map((_, i) => { const v = L.col[i]; return 'rgb(' + (v & 255) + ',' + (v >> 8 & 255) + ',' + (v >> 16 & 255) + ')'; }) };
    this.px = {};
    const px = ART.parallax[z.atlas] || {};
    // far planes sink toward the dark: each layer may be pushed n steps down its colour ramps (parallax[].dark)
    for (const k in px) {
      const cfg = (z.parallax || []).find((p) => p.img === k), n = cfg ? cfg.dark | 0 : 0, t = new Uint32Array(256);
      for (let i = 1; i < 64 && i < PALRGB.length; i++) { let m = i; for (let j = 0; j < n; j++) m = ART.down[m]; t[i] = t[i | 128] = L.col[m]; }
      this.px[k] = this.tint(this.buf['px:' + z.atlas + ':' + k], t);
    }
    for (const k in ART.rigs) this.rig(k);
  },
  /** character atlases: 2 facings x 2 rim sides, built once */
  /** a palette colour as seen through the current zone LUT, as a css string */
  zc(name) { return this.kit.css[ART.names[name]]; },
  rig(name) {
    if (this.rigs[name]) return this.rigs[name];
    const def = ART.rigs[name], b = this.buf['rig:' + name];
    const flip = { w: b.w, h: b.h, d: new Uint8Array(b.d.length) };
    for (let y = 0; y < b.h; y++) for (let x = 0; x < b.w; x++) {
      const cx = (x / def.fw) | 0, lx = x - cx * def.fw, v = b.d[y * b.w + x];
      flip.d[y * b.w + cx * def.fw + (def.fw - 1 - lx)] = v ? (v & 63) | (v & 64 ? 128 : 0) | (v & 128 ? 64 : 0) : 0;
    }
    const back = ART.names[def.meta.backRim || 'rune1'];
    const lut = (side) => {                       // side: +1 key light on the right, -1 on the left
      const t = new Uint32Array(256);
      for (let i = 1; i < 256; i++) {
        const r = i & 63; if (!r || r >= def.roles.length) continue;
        let m = def.roles[r];
        const lit = side > 0 ? i & 64 : i & 128, bk = side > 0 ? i & 128 : i & 64;
        if (lit && !def.ol[r]) m = ART.up[m];
        if (bk && def.ol[r]) m = back;
        t[i] = rgba32(PALRGB[m]);
      }
      return t;
    };
    const R = lut(1), L = lut(-1), white = new Uint32Array(256).fill(rgba32(PALRGB[ART.names.rune5])); white[0] = 0;
    return (this.rigs[name] = { def, cv: [[this.tint(b, R), this.tint(b, L)], [this.tint(flip, R), this.tint(flip, L)]], flash: [this.tint(b, white), this.tint(flip, white)] });
  }
};

/* ---------------- sprite drawing (all coordinates are rounded: no sub-pixel art) ---------------- */
function sprRect(name, frame) { const r = Art.kit.s[name]; if (!r) return null; return typeof r[0] === 'number' ? r : r[(frame | 0) % r.length]; }
function sprFrames(name) { const r = Art.kit.s[name]; return !r ? 0 : typeof r[0] === 'number' ? 1 : r.length; }
function spr(g, name, x, y, frame) { const r = sprRect(name, frame); if (r) g.drawImage(Art.kit.col, r[0], r[1], r[2], r[3], Math.round(x), Math.round(y), r[2], r[3]); }
function sprE(g, name, x, y, frame) { const r = sprRect(name, frame); if (r) g.drawImage(Art.kit.emi, r[0], r[1], r[2], r[3], Math.round(x), Math.round(y), r[2], r[3]); }

/* ---------------- character animation ---------------- */
function Anim(rigName) { return { rigName, rig: null, name: '', clip: null, i: 0, t: 0, f: 0, done: false }; }
/* a body whose rig has no locomotion (Shyn: idle, cast, slash, dash — no run, no jump) borrows the nearest pose it owns,
   so the Architect still moves like a walker instead of freezing mid-stride */
const CLIP_FALLBACK = {
  run: ['idle', 'read'], run_start: ['idle', 'read'], run_stop: ['idle', 'read'], idle_look: ['idle', 'read'],
  jump_up: ['idle', 'cast'], jump_apex: ['idle', 'cast'], fall: ['idle', 'cast'], land: ['idle', 'read'], land_hard: ['idle', 'hurt'],
  materialize: ['idle', 'cast'], hurt: ['stagger', 'idle', 'cast']
};
const ONE_SHOT = { materialize: 1, hurt: 1, land: 1, land_hard: 1, run_start: 1, run_stop: 1 };   // these must end
/* Shyn's own sheet has no locomotion at all; the Recruiter wears the same skeleton, so his legs stand in.
   Only the pose is borrowed — the parts, the palette and the coat stay Shyn's (the clips are bone rotations). */
const BORROW_RIG = { shyn: 'recruiter' };
function clipFor(def, name, rigName) {
  if (def.clips[name]) return def.clips[name];
  const donor = BORROW_RIG[rigName] && Art.rigs[BORROW_RIG[rigName]];
  if (donor && donor.def.clips[name] && !ONE_SHOT[name]) return donor.def.clips[name];
  const fb = CLIP_FALLBACK[name]; if (!fb) return null;
  for (const k of fb) {
    const c = def.clips[k]; if (!c) continue;
    if (!ONE_SHOT[name] || !c.loop) return c;
    // a borrowed looping clip stands in for a one-shot: it is copied as a single play-through so the act can end
    if (!c._once) { c._once = { f: c.f, fps: c.fps, loop: false }; }
    return c._once;
  }
  // still nothing: a one-shot made of the first pose, so the moment passes instead of freezing the player
  if (ONE_SHOT[name] && def.clips.idle) {
    if (!def._still) def._still = { f: [[def.clips.idle.f[0][0], .18]], fps: 1, loop: false };
    return def._still;
  }
  return null;
}
function animPlay(a, name, restart) {
  if (!a.rig) a.rig = Art.rigs[a.rigName];
  if (!a.rig || (a.name === name && !restart)) return;
  const c = clipFor(a.rig.def, name, a.rigName); if (!c) return;
  a.name = name; a.clip = c; a.i = 0; a.t = 0; a.done = false; a.f = c.f[0][0];
}
/** advance; returns the event name fired on a newly shown frame ('step', 'land', ...) or 0 */
function animTick(a, dt) {
  const c = a.clip; if (!c || a.done) return 0;
  let ev = 0;
  a.t += dt * c.fps;
  while (a.t >= c.f[a.i][1]) {
    a.t -= c.f[a.i][1];
    if (a.i + 1 >= c.f.length) { if (c.loop) a.i = 0; else { a.done = true; a.t = 0; break; } } else a.i++;
    if (c.f[a.i][2]) ev = c.f[a.i][2];
  }
  a.f = c.f[a.i][0];
  return ev;
}
/** draw a rig frame with its feet at (x,y). face: 1 right, -1 left. lightSide: 1 right, -1 left. */
function drawRig(g, a, x, y, face, lightSide, flash) {
  const R = a.rig; if (!R) return;
  const d = R.def, fi = face < 0 ? 1 : 0;
  const f = a.f, col = f % d.cols, row = (f / d.cols) | 0;      // the mirrored sheet flips every cell in place
  const src = flash ? R.flash[fi] : R.cv[fi][lightSide < 0 ? 1 : 0];
  const ox = fi ? d.fw - 1 - d.ox : d.ox;
  g.drawImage(src, col * d.fw, row * d.fh, d.fw, d.fh, Math.round(x) - ox, Math.round(y) - d.oy, d.fw, d.fh);
}

/* ---------------- tiny pixel font (name tag) ---------------- */
function pixText(str, colour, outline) {
  str = String(str).toUpperCase();
  const w = str.length * 4 + 1, c = mk(w + 1, 7), g = c.getContext('2d');
  const put = (ox, oy, col) => {
    g.fillStyle = col;
    for (let i = 0; i < str.length; i++) {
      const gl = ART.font[str[i]] || ART.font['?'];
      for (let j = 0; j < 15; j++) if (gl[j] === '1') g.fillRect(1 + i * 4 + (j % 3) + ox, 1 + ((j / 3) | 0) + oy, 1, 1);
    }
  };
  if (outline) for (const [ox, oy] of [[-1, 0], [1, 0], [0, -1], [0, 1], [1, 1], [-1, 1], [-1, -1], [1, -1]]) put(ox, oy, outline);
  put(0, 0, colour);
  return c;
}
/* a name the pixel font cannot write (Persian, Arabic, Cyrillic, Japanese…) is drawn with the page's own fonts, then
   hardened to whole pixels and outlined. (Until Round 9 such a name showed as "????".) */
function nameTag(str, colour, outline) {
  str = String(str);
  if (![...str.toUpperCase()].some((ch) => !ART.font[ch])) return pixText(str, colour, outline);
  const H = 13, m = mk(4, 4).getContext('2d'), font = '10px VeyFa, VeyAr, VeyRu, VeyJa, sans-serif';
  m.font = font;
  const w = Math.min(120, Math.ceil(m.measureText(str).width) + 4), a = mk(w, H), ag = a.getContext('2d');
  ag.font = font; ag.textBaseline = 'middle'; ag.textAlign = 'center'; ag.fillStyle = '#fff';
  ag.fillText(str, w / 2, H / 2 + 1, w - 2);
  const src = ag.getImageData(0, 0, w, H).data, on = (x, y) => x >= 0 && y >= 0 && x < w && y < H && src[(y * w + x) * 4 + 3] > 96;
  const c = mk(w, H), g = c.getContext('2d');
  g.fillStyle = outline; for (let y = 0; y < H; y++) for (let x = 0; x < w; x++) if (!on(x, y) && (on(x - 1, y) || on(x + 1, y) || on(x, y - 1) || on(x, y + 1))) g.fillRect(x, y, 1, 1);
  g.fillStyle = colour; for (let y = 0; y < H; y++) for (let x = 0; x < w; x++) if (on(x, y)) g.fillRect(x, y, 1, 1);
  return c;
}
const Tag = { cv: null, name: '', set(n) { if (n === this.name && this.cv) return; this.name = n; this.cv = nameTag(n, palHex('bone3'), palHex('void1')); if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { if (this.name === n) this.cv = nameTag(n, palHex('bone3'), palHex('void1')); }); } };

/* ---------------- ordered dither (fades, flashes, fog) : no alpha gradients ---------------- */
const B4 = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
const Dither = {
  cache: {},
  pat(colour, level) {                           // level 0..16
    const key = colour + level; let p = this.cache[key];
    if (!p) {
      const c = mk(4, 4), g = c.getContext('2d'); g.fillStyle = colour;
      for (let i = 0; i < 16; i++) if (B4[i] < level) g.fillRect(i & 3, i >> 2, 1, 1);
      p = this.cache[key] = ctx.createPattern(c, 'repeat');
    }
    return p;
  },
  fill(g, x, y, w, h, colour, amount) {
    const lv = Math.round(clamp(amount, 0, 1) * 16); if (lv <= 0) return;
    if (lv >= 16) g.fillStyle = colour; else g.fillStyle = this.pat(colour, lv);
    g.fillRect(x, y, w, h);
  }
};

/* ==========================================================================
   WORLD — tile map (collision + autotiling), static art baked into 512 px
   chunks, decor, lights. A zone is described in 50-zones.js; its solid shape
   lives in art-src/maps/<zone>.txt (one character per 16 px tile).
   ========================================================================== */
const T_AIR = 0, T_SOLID = 1, T_PLAT = 2, T_PLAT_OPEN = 3, T_WALL = 4, T_WALL_DARK = 5;
const CHUNK = 512;

/* What a decor sprite brings with it. Offsets are pixels from the sprite's top-left corner.
   add = extra animated sprites, light = [dx, dy, radius, colour], ember = spark emitter. */
const KIT = {
  brazier:   { add: [['flame', 4, -21, 10]], light: [12, -10, 124, 'fire'], ember: [12, -12] },   // the flame stands on the coals at the rim, not inside the bowl
  cagelamp:  { light: [6, 9, 84, 'fire'] },
  forge:     { add: [['forge_fire', 44, 138, 10]], light: [72, 150, 210, 'forge'], ember: [72, 150], light2: [72, 60, 120, 'ember'] },
  hearth:    { add: [['runefire', 13, -22, 9]], light: [22, -6, 110, 'rune'] },
  window:    { light: [24, 80, 130, 'ember'] },
  lamp_lantern: { light: [18, 14, 120, 'gold'] },
  lamp_gold:    { light: [12, 8, 126, 'gold'], ember: [12, 6] },
  lamp_violet:  { light: [10, 13, 118, 'rune'] },
  lamp_blue:    { light: [9, 8, 104, 'cold'] },
  dojo_lantern: { light: [9, 16, 108, 'gold'] },
  dojo_shoji:   { light: [22, 30, 96, 'warm'] },
  core:         { light: [76, 76, 200, 'cold'] },
  console:      { light: [17, 12, 50, 'cold'] },
  prompt_slab:  { light: [66, 38, 130, 'rune'] },
  note_stele:  { },
  note_tablet: { }
};
const LIGHT_COL = {
  fire:  [255, 196, 140], forge: [255, 170, 110], ember: [200, 96, 70], rune: [170, 132, 255],
  leaf: [150, 225, 170], dim:   [120, 100, 170], gold: [255, 214, 130], cold: [130, 200, 235], warm: [170, 120, 104]
};

const World = {
  z: null, m: null, W: 0, H: 0,
  chunks: null, cw: 0, ch: 0,
  stat: [], dyn: [], front: [], fg: [], lights: [], emitters: [],
  maps: {},

  parse(id) {
    if (this.maps[id]) return this.maps[id];
    const rows = ART.maps[id].split('\n'), h = rows.length, w = rows.reduce((a, r) => Math.max(a, r.length), 0);
    const t = new Uint8Array(w * h), code = { '#': T_SOLID, '=': T_PLAT, '-': T_PLAT_OPEN, '.': T_WALL, ',': T_WALL_DARK };
    const grp = new Uint8Array(w * h), bg = new Uint8Array(w * h), ph = [];
    for (let y = 0; y < h; y++) for (let x = 0; x < rows[y].length; x++) {
      const ch = rows[y][x];
      if (ch >= '1' && ch <= '9') {                       // sleeping rune platform (see 46-puzzle.js); behind it: whatever is to its left
        const left = x ? t[y * w + x - 1] : 0;
        t[y * w + x] = T_PHASE; grp[y * w + x] = +ch; ph.push({ tx: x, ty: y, g: +ch });
        bg[y * w + x] = left === T_PHASE ? bg[y * w + x - 1] : (left === T_WALL || left === T_WALL_DARK) ? left : left === T_PLAT ? T_WALL : T_AIR;
      } else t[y * w + x] = code[ch] || 0;
    }
    return (this.maps[id] = { w, h, t, grp, bg, ph });
  },
  /** tile code at a tile coordinate; outside the map: walls at the sides and top, void below */
  at(tx, ty) { const m = this.m; if (tx < 0 || tx >= m.w || ty < 0) return T_SOLID; if (ty >= m.h) return T_AIR;
    const c = m.t[ty * m.w + tx];
    if (c !== T_PHASE) return c;
    return this.baking ? m.bg[ty * m.w + tx] : Puzzle.awake(m.grp[ty * m.w + tx]) ? T_PLAT_OPEN : m.bg[ty * m.w + tx];
  },
  solid(tx, ty) { return this.at(tx, ty) === T_SOLID; },
  /** top (px) of the first floor at or below pixel y in the column of pixel x; platforms count unless solidOnly */
  floorBelow(x, y, solidOnly) {
    const tx = Math.floor(x / TILE);
    for (let ty = Math.max(0, Math.floor(y / TILE)); ty < this.m.h; ty++) {
      const c = this.at(tx, ty), up = this.at(tx, ty - 1);
      if ((c === T_SOLID || (!solidOnly && (c === T_PLAT || c === T_PLAT_OPEN))) && up !== T_SOLID) return ty * TILE;
    }
    return null;
  },
  /** legacy-style lookup for zones whose props only carry an x: the main floor near x */
  groundNear(x) {
    for (let d = 0; d < 320; d += 8) for (const s of d ? [-1, 1] : [1]) {
      const y = this.floorBelow(x + s * d, 3 * TILE, true);
      if (y != null) return y;
    }
    return (this.m.h - 5) * TILE;
  },

  load(z, over) {
    this.z = z; this.m = this.parse(z.map);
    this.W = z.w = this.m.w * TILE; this.H = z.h = this.m.h * TILE;
    Art.useZone(z, over);
    const amb = z.ambient || [60, 50, 70]; z.ambCss = 'rgb(' + amb[0] + ',' + amb[1] + ',' + amb[2] + ')';
    this.cw = Math.ceil(this.W / CHUNK); this.ch = Math.ceil(this.H / CHUNK);
    this.chunks = new Array(this.cw * this.ch).fill(null);
    this.stat = []; this.dyn = []; this.front = []; this.fg = []; this.lights = []; this.emitters = []; this.cuts = [];
    (z.decor || []).forEach((d) => this.addDecor(d));
    (z.lights || []).forEach((l) => this.addLight(l.at ? l.at[0] * TILE + 8 : l.x, l.at ? l.at[1] * TILE + 8 : l.y, l.r, l.c, l.steady));
    // gameplay props: resolve feet position once (p.x centre, p.gy feet, p.py interaction height)
    (z.props || []).forEach((p) => {
      if (p.at) { p.x = p.at[0] * TILE + 8; p.gy = p.at[1] * TILE; } else p.gy = this.groundNear(p.x);
      p.py = (p.t === 'note' && p.dy > 0) ? p.gy - p.dy : p.gy;
      this.addProp(p);
    });
    if (z.scatter) this.scatter(z);
    this.dyn.sort((a, b) => a.z - b.z);
  },
  /** undergrowth: every patch of open ground may grow one thing from z.scatter ([sprite, chance, layer]), picked by a seeded hash */
  scatter(z) {
    const m = this.m, taken = new Set(); (z.props || []).forEach((p) => { const c = Math.floor(p.x / TILE); taken.add(c); taken.add(c - 1); taken.add(c + 1); });
    for (let ty = 1; ty < m.h; ty++) for (let tx = 2; tx < m.w - 2; tx++) {
      const c = m.t[ty * m.w + tx], up = m.t[(ty - 1) * m.w + tx];
      if (c === T_SOLID && up !== T_SOLID) {
        if (taken.has(tx)) continue;
        let h = hash2(tx, ty, 41), acc = 0;
        for (const [s, p, layer] of z.scatter) { acc += p; if (h < acc) { this.addDecor({ s, at: [tx, ty], layer: layer || 'mid', dx: ((hash2(tx, ty, 5) * 9) | 0) - 4, dy: 1 }); break; } }
      } else if (z.vines && c === T_PLAT_OPEN && hash2(tx, ty, 43) < z.vines) this.addDecor({ s: 'vine', hang: [tx, ty], dy: 6, anim: 0, frame: (hash2(tx, ty, 44) * 3) | 0 });
    }
  },

  /** decor entry -> sprite instances. at:[col,row] = stands on the top of that tile (bottom-centre);
      hang:[col,row] = hangs from the top of that tile (top-centre); px:[x,y] = top-left in pixels. */
  addDecor(d) {
    const r = sprRect(d.s, 0); if (!r) { console.warn('decor: unknown sprite', d.s); return null; }
    let x, y;
    if (d.at) { x = d.at[0] * TILE + 8 - (r[2] >> 1); y = d.at[1] * TILE - r[3]; }
    else if (d.hang) { x = d.hang[0] * TILE + 8 - (r[2] >> 1); y = d.hang[1] * TILE; }
    else { x = d.px[0]; y = d.px[1]; }
    x += d.dx || 0; y += d.dy || 0;
    const layer = d.cut ? 'cut' : d.layer || 'mid', n = sprFrames(d.s);
    const it = { s: d.s, x, y, w: r[2], h: r[3], layer, fps: d.anim == null ? (n > 1 ? 8 : 0) : d.anim, n, ph: d.phase || (hash2(x, y, 3) * n) | 0, e: Art.kit.e[d.s] ? 1 : 0, f: d.f || 1.25, fy: d.fy, z: layer === 'back' ? 0 : 1, frame: d.frame || 0, rev: d.rev ? -1 : 1 };
    if (layer === 'cut') this.cuts.push(it);
    else if (layer === 'fg') this.fg.push(it);
    else if (layer === 'front') this.front.push(it);
    else if (it.fps > 0 && n > 1) this.dyn.push(it);
    else this.stat.push(it);
    const k = d.bare ? null : KIT[d.s];
    if (k) {
      (k.add || []).forEach((a) => this.addDecor({ s: a[0], px: [x + a[1], y + a[2]], anim: a[3], layer: layer === 'back' ? 'back' : 'mid' }));
      if (k.light) this.addLight(x + k.light[0], y + k.light[1], k.light[2], k.light[3]);
      if (k.light2) this.addLight(x + k.light2[0], y + k.light2[1], k.light2[2], k.light2[3], true);
      if (k.ember) this.emitters.push({ x: x + k.ember[0], y: y + k.ember[1], t: hash2(x, y, 9) });
    }
    return it;
  },
  addLight(x, y, r, c, steady) { const L = { x, y, r, c: c || 'fire', steady: !!steady, on: 1 }; this.lights.push(L); return L; },

  /** the frozen gameplay props get their art here (ids, dialogue and doors are untouched) */
  addProp(p) {
    const col = Math.floor(p.x / TILE), row = p.gy / TILE;
    if (p.t === 'note') {
      p.spr = p.spr || (p.dy > 0 ? 'note_tablet' : 'note_stele');
      const r = sprRect(p.spr, 0);
      p.sx = p.x - (r[2] >> 1); p.sy = p.py - r[3] - (p.dy > 0 ? 6 : 0);
      p.light = this.addLight(p.x, p.sy + (r[3] >> 1), 46, 'rune', true);
    } else if (p.t === 'door' || p.t === 'gate') {
      this.addDecor({ s: 'door_dark', at: [col, row], layer: 'back' });
      this.addDecor({ s: 'door_frame', at: [col, row], layer: 'back' });
      p.leaf = { x: p.x - 32, y: p.gy - 94 };
      this.addLight(p.x, p.gy - 50, 60, p.t === 'gate' ? 'rune' : 'dim', true);
    } else if (p.t === 'npc') {
      const rig = ART.rigs[p.look] ? p.look : null;
      p.anim = rig ? Anim(rig) : null;
      if (p.anim) animPlay(p.anim, 'idle');
      if (p.look === 'resync' && G.flags[p.flag]) this.addLight(p.x, p.gy - (G.flags.resyncGone ? 12 : 26), G.flags.resyncGone ? 70 : 80, G.flags.resyncGone ? 'cold' : 'leaf', true);      // his screen's green; later the flower's white
    } else if (p.t === 'switch') p.light = this.addLight(p.x, p.gy - 16, 64, 'gold', true);
    else if (p.t === 'lamp') this.addDecor({ s: sprRect('lamp_' + p.kind, 0) ? 'lamp_' + p.kind : 'brazier', at: [col, row] });          // pending zones (legacy prop types)
    else if (p.t === 'fire') this.addDecor({ s: 'hearth', at: [col, row] });
    else if (p.t === 'statue') this.addDecor({ s: sprRect('statue_' + p.kind, 0) ? 'statue_' + p.kind : 'statue_gear', at: [col, row], layer: 'back' });
    else if (p.t === 'throne') this.addDecor({ s: 'throne_shade', at: [col, row], layer: 'back' });
  },

  /* ---------------- static art: baked once per 512 px chunk, on first sight ---------------- */
  chunk(cx, cy) {
    const i = cy * this.cw + cx; let c = this.chunks[i];
    if (!c) { this.baking = true; c = this.chunks[i] = this.bake(cx, cy); this.baking = false; }
    return c;
  },
  bake(cx, cy) {
    const col = mk(CHUNK, CHUNK), g = col.getContext('2d'), emi = mk(CHUNK, CHUNK), ge = emi.getContext('2d');
    const ox = cx * CHUNK, oy = cy * CHUNK, tx0 = ox / TILE, ty0 = oy / TILE, n = CHUNK / TILE, A = Art.kit;
    let hasE = false;
    const blit = (name, frame, x, y) => {                    // draws into both layers; opaque art hides glow behind it
      const r = sprRect(name, frame); if (!r) return;
      g.drawImage(A.col, r[0], r[1], r[2], r[3], x - ox, y - oy, r[2], r[3]);
      ge.globalCompositeOperation = 'destination-out'; ge.drawImage(A.col, r[0], r[1], r[2], r[3], x - ox, y - oy, r[2], r[3]);
      ge.globalCompositeOperation = 'source-over';
      if (A.e[name]) { ge.drawImage(A.emi, r[0], r[1], r[2], r[3], x - ox, y - oy, r[2], r[3]); hasE = true; }
    };
    const piece = (name, tx, ty) => {                        // 16x16 piece of a 64x64 macro texture, picked by position
      const r = A.s[name]; g.drawImage(A.col, r[0] + (tx & 3) * TILE, r[1] + (ty & 3) * TILE, TILE, TILE, tx * TILE - ox, ty * TILE - oy, TILE, TILE);
    };
    const inChunk = (it) => it.x < ox + CHUNK && it.x + it.w > ox && it.y < oy + CHUNK && it.y + it.h > oy;
    const isWall = (c) => c === T_WALL || c === T_WALL_DARK || c === T_PLAT;
    // 1 · back wall
    for (let j = -1; j <= n; j++) for (let i = -1; i <= n; i++) {
      const tx = tx0 + i, ty = ty0 + j, c = this.at(tx, ty);
      if (!isWall(c)) continue;
      piece(c === T_WALL_DARK ? 'wall_dark' : 'wall', tx, ty);
      const h = hash2(tx, ty, 11);
      if (c !== T_WALL_DARK) {
        if (h < .05) blit('deco_crack', (h * 997) | 0, tx * TILE, ty * TILE);
        else if (h < .075 && isWall(this.at(tx, ty + 1))) blit('deco_stain', (h * 613) | 0, tx * TILE, ty * TILE);
        else if (h > .994) blit('deco_plate', 0, tx * TILE, ty * TILE);
        else if (h > .982) blit('deco_sigil', (h * 7919) | 0, tx * TILE, ty * TILE);
      }
    }
    // wall head and wall ends: a lit coping where the masonry stops against open air
    for (let j = -1; j <= n; j++) for (let i = -1; i <= n; i++) {
      const tx = tx0 + i, ty = ty0 + j, c = this.at(tx, ty);
      if (c !== T_WALL && c !== T_PLAT) continue;
      const x = tx * TILE - ox, y = ty * TILE - oy, open = (t) => t === T_AIR || t === T_PLAT_OPEN;
      if (open(this.at(tx, ty - 1))) { g.fillStyle = A.css[ART.names.soot3]; g.fillRect(x, y, TILE, 2); g.fillStyle = A.css[ART.names.soot4]; if (hash2(tx, ty, 4) > .5) g.fillRect(x + 3, y, 7, 1); g.fillStyle = A.css[ART.names.void2]; g.fillRect(x, y + 2, TILE, 1); g.fillRect(x + ((hash2(tx, ty, 6) * 14) | 0), y, 1, 2); }
      if (open(this.at(tx - 1, ty))) { g.fillStyle = A.css[ART.names.soot3]; g.fillRect(x, y, 2, TILE); g.fillStyle = A.css[ART.names.void2]; g.fillRect(x + 2, y, 1, TILE); }
      if (open(this.at(tx + 1, ty))) { g.fillStyle = A.css[ART.names.soot2]; g.fillRect(x + TILE - 2, y, 2, TILE); g.fillStyle = A.css[ART.names.void2]; g.fillRect(x + TILE - 3, y, 1, TILE); }
    }
    // 2 · openings cut through the wall (arches onto the far hall), then back props
    g.globalCompositeOperation = 'destination-out';
    for (const it of this.cuts) if (inChunk(it)) { const r = sprRect(it.s, 0); g.drawImage(A.col, r[0], r[1], r[2], r[3], it.x - ox, it.y - oy, r[2], r[3]); }
    g.globalCompositeOperation = 'source-over';
    for (const it of this.stat) if (it.layer === 'back' && inChunk(it)) blit(it.s, it.frame, it.x, it.y);
    // 3 · solids, autotiled: interior texture by position + edge overlays from the neighbours
    for (let j = -1; j <= n; j++) for (let i = -1; i <= n; i++) {
      const tx = tx0 + i, ty = ty0 + j, c = this.at(tx, ty), x = tx * TILE, y = ty * TILE;
      if (c === T_SOLID) {
        const U = this.solid(tx, ty - 1), D = this.solid(tx, ty + 1) || ty + 1 >= this.m.h, Lf = this.solid(tx - 1, ty), Rt = this.solid(tx + 1, ty);
        const deep = U && D && Lf && Rt && this.solid(tx, ty - 2) && (this.solid(tx, ty + 2) || ty + 2 >= this.m.h) && this.solid(tx - 2, ty) && this.solid(tx + 2, ty) && this.solid(tx - 1, ty - 1) && this.solid(tx + 1, ty - 1);
        piece(deep ? 'sol_deep' : 'sol_in', tx, ty);
        const h = hash2(tx, ty, 5);
        if (!D) blit('sol_bot', (h * 2) | 0, x, y);
        if (!Lf) blit('sol_l', (h * 4) & 1, x, y);
        if (!Rt) blit('sol_r', (h * 8) & 1, x, y);
        if (!U) blit('sol_top', (h * 5) | 0, x, y);
      } else if (c === T_PLAT || c === T_PLAT_OPEN) {
        const pl = (t) => t === T_PLAT || t === T_PLAT_OPEN, l = pl(this.at(tx - 1, ty)) || this.solid(tx - 1, ty), r = pl(this.at(tx + 1, ty)) || this.solid(tx + 1, ty);
        blit(!l ? 'plat_l' : !r ? 'plat_r' : 'plat_m', (hash2(tx, ty, 2) * 2) | 0, x, y);
      }
    }
    // 4 · props in front of the masonry
    for (const it of this.stat) if (it.layer !== 'back' && inChunk(it)) blit(it.s, it.frame, it.x, it.y);
    return { col, emi: hasE ? emi : null };
  }
};

/* ---------------- lights: banded, dithered discs, pre-baked once per radius+colour ---------------- */
const Lights = {
  cache: {},
  sprite(r, cname) {
    const key = r + cname; let c = this.cache[key];
    if (c) return c;
    const col = LIGHT_COL[cname] || LIGHT_COL.fire, S = r * 2;
    c = mk(S, S); const g = c.getContext('2d'), id = g.createImageData(S, S), o = id.data, BANDS = 6;
    for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) {
      const dx = x + .5 - r, dy = (y + .5 - r) * 1.12, d = Math.sqrt(dx * dx + dy * dy) / r;
      if (d >= 1) continue;
      const q = (1 - d) * BANDS, b = (B4[(y & 3) * 4 + (x & 3)] + .5) / 16;
      const lv = Math.min(BANDS, Math.floor(q + (b - .5) * .4 + .5)), k = Math.pow(lv / BANDS, 1.25), i = (y * S + x) * 4;
      o[i] = col[0] * k; o[i + 1] = col[1] * k; o[i + 2] = col[2] * k; o[i + 3] = 255;
    }
    g.putImageData(id, 0, 0);
    return (this.cache[key] = c);
  }
};

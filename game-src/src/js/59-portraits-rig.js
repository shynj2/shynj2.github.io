/* ==========================================================================
   PORTRAITS FROM RIGS & SPRITES — cuts every rigged character's head from idle frame 0,
   scales 2x into a richly framed pixel-art 46x46 canvas with Bayer-dithered thematic backdrop.
   ========================================================================== */
{
  const BASE = getPortrait;
  const frameRigPortrait = (drawContent, bgTop, bgBot, borderCol, cornerCol) => {
    const c = mk(46, 46), g = c.getContext('2d');
    g.imageSmoothingEnabled = false;
    for (let y = 0; y < 23; y++) for (let x = 0; x < 23; x++) {
      const u = y / 22, d = PORTR_B4[(y & 3) * 4 + (x & 3)] / 16;
      g.fillStyle = palHex(u > d ? bgBot : bgTop);
      g.fillRect(x * 2, y * 2, 2, 2);
    }
    drawContent(g);
    g.fillStyle = palHex('void0');
    g.fillRect(0, 0, 46, 2); g.fillRect(0, 44, 46, 2); g.fillRect(0, 0, 2, 46); g.fillRect(44, 0, 2, 46);
    g.fillStyle = palHex(borderCol);
    g.fillRect(2, 2, 42, 1); g.fillRect(2, 43, 42, 1); g.fillRect(2, 2, 1, 42); g.fillRect(43, 2, 1, 42);
    g.fillStyle = palHex(cornerCol);
    for (const [cx, cy] of [[2, 2], [42, 2], [2, 42], [42, 42]]) g.fillRect(cx, cy, 2, 2);
    return c;
  };

  const cut = (name, bgTop, bgBot, borderCol, cornerCol, accentFn) => {
    const r = Art.rigs[name]; if (!r || !r.def || !r.def.meta || !r.def.meta.portrait) return null;
    const d = r.def, f = d.clips.idle.f[0][0], p = d.meta.portrait;
    return frameRigPortrait((g) => {
      if (accentFn) accentFn(g);
      g.drawImage(r.cv[0][0], (f % d.cols) * d.fw + p[0], ((f / d.cols) | 0) * d.fh + p[1], p[2], p[3], 0, 0, 46, 46);
    }, bgTop, bgBot, borderCol, cornerCol);
  };

  const cutGoblin = () => {
    // Find any decoded atlas buffer carrying npc_goblin and tint its 23x23 crop with identity LUT so his green skin stays vivid!
    let ak = null;
    for (const k of ['workshop', 'forest', 'catacombs']) {
      if (Art.buf['atlas:' + k] && ART.atlases[k] && ART.atlases[k].s.npc_goblin) { ak = k; break; }
    }
    if (!ak) return null;
    const buf = Art.buf['atlas:' + ak], r = ART.atlases[ak].s.npc_goblin[8];
    const lut = Art.envLuts('identity').col;
    const crop = mk(23, 23), cg = crop.getContext('2d'), id = cg.createImageData(23, 23), o = new Uint32Array(id.data.buffer);
    const sx = r[0] + 38, sy = r[1] + 8;
    for (let y = 0; y < 23; y++) for (let x = 0; x < 23; x++) {
      o[y * 23 + x] = lut[buf.d[(sy + y) * buf.w + (sx + x)]];
    }
    cg.putImageData(id, 0, 0);
    return frameRigPortrait((g) => {
      g.drawImage(crop, 0, 0, 23, 23, 0, 0, 46, 46);
    }, 'soot1', 'void1', 'gold2', 'gold4');
  };

  getPortrait = function (key) {
    if (!key) return null;
    if (key === 'player') {
      const k = 'rig:recruiter';
      if (!PORTR[k]) PORTR[k] = cut('recruiter', 'cold0', 'void2', 'stone3', 'gold3');
      if (PORTR[k]) return PORTR[k];
    }
    if (key === 'librarian' || key === 'shyn' || key === 'resync') {
      const k = 'rig:' + key;
      if (!PORTR[k]) {
        if (key === 'shyn') PORTR[k] = cut('shyn', 'rune1', 'void1', 'gold2', 'rune4', (g) => {
          g.fillStyle = palHex('rune4'); g.fillRect(8, 10, 2, 2); g.fillRect(36, 8, 2, 2);
        });
        else if (key === 'resync') PORTR[k] = cut('resync', 'cold0', 'void1', 'cold2', 'moss3');
        else PORTR[k] = cut('librarian', 'stone1', 'void2', 'gold1', 'rune4');
      }
      if (PORTR[k]) return PORTR[k];
    }
    if (key === 'goblin') {
      const k = 'spr:goblin';
      if (!PORTR[k]) PORTR[k] = cutGoblin();
      if (PORTR[k]) return PORTR[k];
    }
    return BASE(key);
  };
}

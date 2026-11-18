/* ==========================================================================
   PUZZLES — sleeping rune platforms and the switches that wake them.

   In a map file the digits 1-9 are "sleeping" one-way platforms: air until their group wakes.
   A zone says which flag wakes which group:
       puzzle: { 1: 'pz_forest', 2: '!pz_repo' }       // '!' = awake while the flag is NOT set
   and places switches among its props:
       { t: 'switch', at: [col, row], id: 'pz_forest', label: 'ui.wake_the_rune' }      press once (label = id of the prompt text in STR)
       { t: 'switch', ..., id: 'pz_repo', toggle: true, tag: 'BRANCH' }                  flips each press
       { t: 'switch', ..., id: 'pz_m_role', of: 'pz_machine', step: 0, total: 3, tag: 'ROLE' }
                                   pressed in order 0,1,2 they set the flag 'pz_machine'; a wrong one resets the row
   Flags live in G.flags, so they are saved with the game.
   ========================================================================== */
const T_PHASE = 6;
const Puzzle = {
  hintT: 0,
  awake(g) {
    const pz = World.z && World.z.puzzle, f = pz && pz[g];
    if (!f) return false;
    if (G.flags.bossSeen && (f === 'pz_repo' || f === '!pz_repo')) return true;
    return f[0] === '!' ? !G.flags[f.slice(1)] : !!G.flags[f];
  },
  lit(p) {
    if (p.of) return !!G.flags[p.of] || (G.flags[p.of + '_n'] | 0) > p.step;
    return !!G.flags[p.id];
  },
  /** true while this zone still has something asleep that a switch could wake */
  unsolved() { return (ZONES[G.zone].props || []).some((p) => p.t === 'switch' && !p.toggle && !Puzzle.lit(p)); },
  press(p) {
    const cx = p.x, cy = p.gy - 18;
    if (p.toggle) {
      G.flags[p.id] = !G.flags[p.id];
      Sound.rune(); G.shake = Math.max(G.shake, 3); burst(cx, cy, 'rgba(190,150,255,', 14, 70);
      toast('⎇', G.flags[p.id] ? 'ui.branch_switched' : 'ui.back_on_the_first_branch', 'ui.branch_sub', 4200);
    } else if (p.of) {
      if (G.flags[p.of]) return;
      const n = G.flags[p.of + '_n'] | 0;
      if (p.step < n) return;
      if (p.step === n) {
        G.flags[p.of + '_n'] = n + 1;
        Sound.open(); burst(cx, cy, 'rgba(150,220,255,', 12, 60);
        if (n + 1 >= p.total) { G.flags[p.of] = true; Sound.rune(); G.shake = Math.max(G.shake, 4); toast('✦', 'ui.the_machine_understood', 'ui.the_bridge_wakes', 5200); }
      } else {
        G.flags[p.of + '_n'] = 0;
        Sound.hit(); G.shake = Math.max(G.shake, 3); P.hurt = .2;
        toast('✕', 'ui.the_machine_misunderstood', 'ui.order_matters', 5200);
      }
    } else {
      if (G.flags[p.id]) return;
      G.flags[p.id] = true;
      Sound.rune(); G.shake = Math.max(G.shake, 4); burst(cx, cy, 'rgba(190,150,255,', 18, 80);
      toast('✦', 'ui.a_rune_wakes', p.woke || 'ui.woke.default', 5200);
    }
    save();
  },
  /** called when the player falls into the void */
  fell() {
    if (G.time - this.hintT < 9 || !this.unsolved()) return;
    this.hintT = G.time;
    toast('◇', 'ui.the_way_is_asleep', ZONES[G.zone].puzzleHint || 'ui.hint.default', 5200);
  },
  /** sleeping / woken platforms and the switches, drawn every frame (they change, so they are not baked) */
  draw(g, cx, cy, t, emissive) {
    const ph = World.m.ph;
    for (let i = 0; i < ph.length; i++) {
      const c = ph[i], x = c.tx * TILE - cx, y = c.ty * TILE - cy;
      if (x < -16 || x > VW || y < -16 || y > VH) continue;
      const on = this.awake(c.g);
      if (emissive) { if (on) sprE(g, 'plat_rune', x, y, 1 + ((c.tx + ((t * 3) | 0)) % 2)); else if (((t * 2 + c.tx * .5) | 0) % 4 === 0) sprE(g, 'plat_rune', x, y, 0); }
      else spr(g, 'plat_rune', x, y, on ? 1 + ((c.tx + ((t * 3) | 0)) % 2) : 0);
    }
    const ps = World.z.props;
    for (let i = 0; i < ps.length; i++) {
      const p = ps[i]; if (p.t !== 'switch' || p.x - cx < -40 || p.x - cx > VW + 40) continue;
      const lit = this.lit(p), f = lit ? 1 : ((t * 2) | 0) % 2 ? 0 : 2;
      (emissive ? sprE : spr)(g, 'rune_switch', p.x - 8 - cx, p.gy - 28 - cy, f);
      if (p.tag && !emissive) { if (!p._tag) p._tag = pixText(p.tag, '#cdbcff', '#0b0714'); g.drawImage(p._tag, Math.round(p.x - cx - (p._tag.width >> 1)), p.gy - 40 - cy); }
      if (p.light) p.light.c = lit ? 'rune' : 'warm';
    }
  }
};

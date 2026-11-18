'use strict';
/* =====================================================================
   THE PRACTICE HALL AND ITS STRAW DUMMY (Round 11)

   A quiet room to the left of the workshop (zone `dojo` in 49-zones.js). The dummy takes every blow of every weapon,
   shows what the blow was worth, and never falls. It is not a person: the Ward (67-ward.js) has nothing to say here.

   Two ways in: the door at the left end of the workshop, or "Practice Hall" in the backpack from any hall. When the
   backpack brought the visitor here, the hall's door leads back to the exact spot they left (G.flags.dojoFrom).
   Easy to tune: the three numbers below.
   ===================================================================== */
const DUMMY_W = 13;          // half the width that can be struck (px)
const DUMMY_H = 46;          // height that can be struck (px)
const DUMMY_TALLY = 2.5;     // seconds without a blow before the running total starts again

const Dummy = {
  rock: 9, dir: 1, total: 0, hits: 0, last: 0, idle: 9, best: 0,
  prop() { const z = World.z; return z && z.id === 'dojo' ? z.props.find((p) => p.t === 'dummy') : null; },
  /** a blow that crosses the dummy lands on it; true when it did */
  test(x0, y0, x1, y1, dmg, info) {
    const p = this.prop(); if (!p || !dmg) return false;
    if (x1 < p.x - DUMMY_W || x0 > p.x + DUMMY_W || y1 < p.gy - DUMMY_H || y0 > p.gy) return false;
    const v = Math.max(1, Math.round(dmg * Arsenal.mult((info && info.wp) || Arsenal.cur())));
    if (this.idle > DUMMY_TALLY) { this.total = 0; this.hits = 0; }
    this.total += v; this.hits++; this.last = v; this.idle = 0; this.best = Math.max(this.best, this.total);
    this.rock = 0; this.dir = P.x + P.w / 2 < p.x ? 1 : -1; this.heavy = !!(info && info.heavy);
    Combat.number(p.x, p.gy - 58, v, this.heavy ? 'gold4' : 'bone4');
    burst(p.x - this.dir * 6, p.gy - 26, 'rgba(226,200,140,', this.heavy ? 12 : 6, 80);        // straw
    Sound.hit(); if (!Calm()) G.shake = Math.max(G.shake, this.heavy ? 4 : 2);
    return true;
  },
  update(dt) { this.rock += dt; this.idle += dt; },
  draw(g, cx, cy, t, shadows) {
    const p = this.prop(); if (!p) return;
    const r = this.rock, f = r < .07 ? (this.heavy ? 2 : 1) : r < .16 ? 2 : r < .26 ? 1 : r < .38 ? 3 : 0;
    if (shadows) spr(g, 'fx_shadow', p.x - 5 - cx, p.gy - 2 - cy, 0);
    spr(g, this.dir > 0 ? 'dummy' : 'dummy_l', p.x - 20 - cx, p.gy - 51 - cy, f);
  },
  /** the tally over its head: the sum of this flurry and the number of blows (drawn over the lit picture) */
  drawTally(g, cx, cy) {
    const p = this.prop(); if (!p || !this.hits || this.idle > DUMMY_TALLY + 1.5) return;
    if (this.idle > DUMMY_TALLY && ((this.idle * 8) | 0) & 1) return;
    const a = pixText(String(this.total), palHex('gold4'), palHex('void1')), b = pixText('x' + this.hits, palHex('bone3'), palHex('void1'));
    g.drawImage(a, Math.round(p.x) - cx - (a.width >> 1), p.gy - 100 - cy); g.drawImage(b, Math.round(p.x) - cx - (b.width >> 1), p.gy - 92 - cy);
  },

  /* ---- coming and going ---- */
  canGo() { return G.zone !== 'dojo' && !(typeof BOSS !== 'undefined' && BOSS.active) && G.pauseFrom !== 'boss'; },
  /** from the backpack: remember the place, go to the hall */
  go() {
    if (!this.canGo()) return;
    G.flags.dojoFrom = { z: G.zone, x: Math.round(P.safeX != null && !P.onGround ? P.safeX : P.x), y: Math.round(P.safeX != null && !P.onGround ? P.safeY : P.y) };
    goZone('dojo', 'right');
  },
  /** the hall's door: back to the remembered place (false = no place remembered, the door leads to the workshop) */
  leave() {
    const f = G.flags.dojoFrom; if (!f || !ZONES[f.z]) return false;
    Sound.open();
    Art.need(ZONES[f.z]).then(() => fadeTo(() => {
      delete G.flags.dojoFrom;
      loadZone(f.z, 'left'); P.x = f.x; P.y = f.y; P.safeX = P.x; P.safeY = P.y; camSnap(); save();
    }));
    return true;
  },
  enter(id) {
    if (id !== 'dojo') return;
    this.total = this.hits = 0; this.idle = 9; this.rock = 9;
    if (!G.flags.dojoSeen) { G.flags.dojoSeen = true; save(); setTimeout(() => { if (G.zone === 'dojo') toast('◈', 'zone.dojo.name', 'dojo.hint', 7000); }, 2600); }
  }
};

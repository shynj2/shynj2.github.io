/* Quiet, invulnerable targets: no enemy AI, rewards or death state. */
const Dojo = {
  targets: [{ x: 245, kind: 'post', hits: 0, last: -99 }, { x: 383, kind: 'guard', hits: 0, last: -99, poise: 45 }, { x: 535, kind: 'moving', hits: 0, last: -99 }],
  update(dt) {
    if (G.zone !== 'dojo') return;
    Combat.stam = Math.min(Combat.STAM, Combat.stam + dt * 35);
    if (G.time > (this.nextBell || 0)) { Sound.distantBell(); this.nextBell = G.time + 18; }
  },
  hit(x0, y0, x1, y1, damage, poise, info) {
    if (G.zone !== 'dojo' || !damage) return false;
    const gy = 19 * TILE; let found = false;
    for (const d of this.targets) {
      const x = d.kind === 'moving' ? d.x + Math.round(18 * Math.sin(G.time * 1.35)) : d.x;
      if (x1 < x - 11 || x0 > x + 11 || y1 < gy - 50 || y0 > gy) continue;
      let val = Math.max(1, Math.round(damage * Arsenal.mult(info && info.wp || Arsenal.cur())));
      const guarding = d.kind === 'guard' && Math.sin(G.time * 1.3) > 0 && (d.breakUntil || 0) < G.time;
      if (guarding) {
        val = Math.max(1, Math.round(val * .25));
        d.poise = (d.poise || 45) - (poise || 0);
        if (d.poise <= 0) { d.breakUntil = G.time + 2; d.poise = 45; }
      }
      d.hits = G.time - d.last < 2.5 ? d.hits + 1 : 1; d.last = G.time;
      Combat.number(x, gy - 56, val, guarding ? 'stone4' : 'gold4');
      burst(x, gy - 30, 'rgba(226,200,140,', 7, 60); Sound.hit(); found = true;
    }
    return found;
  },
  draw(g, cx, cy, t) {
    if (G.zone !== 'dojo') return;
    const rect = (col, x, y, w, h) => { g.fillStyle = palHex(col); g.fillRect(Math.round(x - cx), Math.round(y - cy), w, h); };
    // Pixel-art woven tatami mat runner with crimson-and-gold brocade edging along the dojo floor
    const fy = 19 * TILE;
    rect('void1', 94, fy - 8, 514, 8);
    rect('moss1', 96, fy - 7, 510, 6);
    rect('moss2', 96, fy - 7, 510, 1);
    rect('ember1', 96, fy - 2, 510, 1);
    for (let sx = 96; sx <= 606; sx += 51) {
      rect('ember1', sx - 1, fy - 7, 3, 6);
      rect('gold2', sx, fy - 6, 1, 4);
    }
    // Pixel-art Makiwara / Straw Training Dummies (`dojo_dummy` x2 frames + beveled Pavise Guard Shield)
    for (const d of this.targets) {
      const x = Math.round(d.kind === 'moving' ? d.x + 18 * Math.sin(t * 1.35) : d.x);
      const recoiling = (t - d.last) >= 0 && (t - d.last) < 0.16;
      if (sprRect('dojo_dummy', 0)) {
        spr(g, 'dojo_dummy', x - 14 - cx, fy - 50 - cy, recoiling ? 1 : 0);
      }
      if (d.kind === 'guard' && Math.sin(t * 1.3) > 0 && (d.breakUntil || 0) < t) {
        rect('void1', x - 18, fy - 42, 13, 28);
        rect('iron1', x - 17, fy - 41, 11, 26);
        rect('iron2', x - 17, fy - 41, 4, 26);
        rect('gold2', x - 17, fy - 41, 11, 2);
        rect('gold2', x - 17, fy - 17, 11, 2);
        rect('gold3', x - 13, fy - 30, 3, 4);
      }
    }
  },
  drawCounter(g, cx, cy) {
    if (G.zone !== 'dojo') return;
    for (const d of this.targets) if (G.time - d.last < 2.5) {
      const x = d.kind === 'moving' ? d.x + Math.round(18 * Math.sin(G.time * 1.35)) : d.x;
      const im = pixText('x' + d.hits, palHex('gold4'), palHex('void1'));
      g.drawImage(im, x - cx - (im.width >> 1), 19 * TILE - cy - 68);
    }
  }
};

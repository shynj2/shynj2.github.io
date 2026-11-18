/* ==========================================================================
   NOTICE BOARDS — a sign whose words appear above it by themselves while it is on screen.
   Nothing to press, no points, not one of the inscriptions.

   To change the words: edit the line 'ui.sign' in STR (61-i18n.js), in each language.
   To move a sign: change `at` here and the 'signboard' decor entry of that zone (50-zones.js).
   ========================================================================== */
const SIGNS = [
  { zone: 'workshop', at: [10, 35],
    text: 'ui.sign' }
];
const Sign = {
  node: null, cur: null,
  update() {
    const s = SIGNS.find((q) => q.zone === G.zone);
    if (!this.node) {
      const n = this.node = document.createElement('div'); n.id = 'signTip';
      n.innerHTML = '<span></span>';
      el('stage').appendChild(n);
    }
    const n = this.node;
    const sx = s ? s.at[0] * TILE + 8 - G.camX : -1, sy = s ? s.at[1] * TILE - 52 - G.camY : 0;
    const show = !!s && G.scene === 'world' && !Dlg.on && G.fade < .2 && sx > 30 && sx < VW - 30 && sy > 40;
    if (show && this.cur !== s) { this.cur = s; n.firstChild.textContent = tr(s.text); }
    n.classList.toggle('on', show);
    if (!show) return;
    // where the picture sits inside the stage (it is centred or pinned to the top, depending on the layout)
    const cb = cv.getBoundingClientRect(), sb = el('stage').getBoundingClientRect(), k = cb.width / VW, x0 = cb.left - sb.left, y0 = cb.top - sb.top;
    const half = n.offsetWidth / 2, x = clamp(x0 + sx * k, x0 + half + 6, x0 + cb.width - half - 6);
    n.style.left = Math.round(x) + 'px';
    n.style.top = Math.round(y0 + sy * k) + 'px';
    n.style.setProperty('--tail', Math.round(x0 + sx * k - x) + 'px');
  }
};

document.addEventListener('langchange', () => { if (Sign.cur && Sign.node) Sign.node.firstChild.textContent = tr(Sign.cur.text); });

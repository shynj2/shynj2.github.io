/* ==========================================================================
   DEATHS and the one hidden achievement.
   A death is a fall into the void or a defeat at the Throne. On death number
   Secret.at the hidden title is written across the screen, once. Before that it
   is listed nowhere: not in the Achievements page, not in the tally, and its
   name is stored as shifted character codes so it cannot be found by searching
   the file. After that it appears as one extra row on the Achievements page.
   ========================================================================== */
const Secret = {
  at: 30,
  w: (a) => String.fromCharCode.apply(null, a.map((c) => c - 7)),
  en: [82, 86, 90, 82, 79, 86, 83],
  fa: [1712, 1596, 1589, 1611],
  n() { return trNum(this.at); },
  title() { return this.w(LANG === 'fa' ? this.fa : this.en); },
  show() {
    const d = document.createElement('div'); d.id = 'secret'; d.setAttribute('data-noi18n', '');
    d.innerHTML = '<b></b><i></i>';
    d.firstChild.textContent = this.title();
    d.lastChild.textContent = tr('ach.secret.caption', this.n());
    el('stage').appendChild(d);
    Sound.ach();
    requestAnimationFrame(() => requestAnimationFrame(() => d.classList.add('on')));
    setTimeout(() => d.classList.remove('on'), 6500);
    setTimeout(() => d.remove(), 7400);
  },
  /* the extra row on the Achievements page, only once it is earned */
  row(body) {
    if (!G.flags.s30) return;
    const r = document.createElement('div'); r.className = 'artifact'; r.setAttribute('data-noi18n', '');
    r.innerHTML = '<b></b><span></span>';
    r.firstChild.textContent = '☠ ' + this.title();
    r.lastChild.textContent = tr('ach.secret.row', this.n());
    const h3 = body.querySelector('h3'); body.insertBefore(r, h3);
  }
};
function countDeath() {
  G.flags.deaths_n = (G.flags.deaths_n || 0) + 1;
  if (G.flags.deaths_n >= Secret.at && !G.flags.s30) { G.flags.s30 = true; Secret.show(); }
  save();
}

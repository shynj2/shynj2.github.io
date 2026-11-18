/* ==========================================================================
   CREDITS (Round 9 §0) — every outside asset: name, author, licence. Pause menu → Credits.
   Keep this list the same as art-src/CREDITS.md. Names and licences are not translated.
   ========================================================================== */
const CREDITS = [
  { name: 'Vazirmatn', by: 'Saber Rastikerdar', lic: 'SIL OFL 1.1', url: 'github.com/google/fonts · ofl/vazirmatn' },
  { name: 'Amiri', by: 'Khaled Hosny', lic: 'SIL OFL 1.1', url: 'github.com/google/fonts · ofl/amiri' },
  { name: 'PT Serif', by: 'ParaType', lic: 'SIL OFL 1.1', url: 'github.com/google/fonts · ofl/ptserif' },
  { name: 'Shippori Mincho', by: 'FONTDASU', lic: 'SIL OFL 1.1', url: 'github.com/google/fonts · ofl/shipporimincho' },
  { name: 'VT323', by: 'Peter Hull', lic: 'SIL OFL 1.1', url: 'github.com/google/fonts · ofl/vt323' }
];
const Credits = {
  open() {
    let c = el('credits');
    if (!c) { c = document.createElement('div'); c.id = 'credits'; c.className = 'ov'; c.setAttribute('data-noi18n', ''); el('stage').appendChild(c); c.addEventListener('click', (e) => { if (e.target.closest('[data-cr="close"]')) { e.stopPropagation(); this.close(); } }); }
    const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
    c.innerHTML = '<div class="arm"><h2>' + esc(tr('ui.credits')) + '</h2><h3>' + esc(tr('ui.credits.fonts')) + '</h3><ul>' +
      CREDITS.map((x) => '<li dir="ltr"><b>' + esc(x.name) + '</b> — ' + esc(x.by) + ' · ' + esc(x.lic) + '<small>' + esc(x.url) + '</small></li>').join('') +
      '</ul><h3>' + esc(tr('ui.credits.music')) + '</h3><p>' + esc(tr('ui.credits.music.line')) + '</p><p class="tracks" dir="ltr">' + Music.list().map(esc).join(' · ') + '</p><h3>' + esc(tr('ui.credits.voice')) + '</h3><p>' + esc(tr('ui.credits.voice.line')) + '</p><p class="rest">' + esc(tr('ui.credits.rest')).replace(/\n/g, '<br>') + '</p>' +
      '<button class="btn back" data-cr="close">' + esc(tr('ui.close')) + '</button></div>';
    c.classList.add('on'); Sound.open();
  },
  close() { const c = el('credits'); if (c) c.classList.remove('on'); },
  isOpen() { const c = el('credits'); return !!c && c.classList.contains('on'); },
  /** adds the button to the pause menu (once) and keeps its text in the current language */
  pauseSync() {
    const menu = document.querySelector('#pause .menu'); if (!menu) return;
    let b = menu.querySelector('[data-act="credits"]');
    if (!b) { b = document.createElement('button'); b.className = 'btn opt'; b.dataset.act = 'credits'; b.onclick = (ev) => { ev.stopPropagation(); this.open(); }; menu.insertBefore(b, menu.querySelector('[data-act="leave"]')); }
    b.textContent = tr('ui.credits');
  }
};

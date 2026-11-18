/* ==========================================================================
   THE NAME — the ceremony that burns the scribble off (Round 9 §4).
   Redact (61-i18n.js) keeps the name off the page until G.flags.named is set; this file sets it.
     Redact.reveal(done)   plays once, at the moment the Keeper falls (or yields), then redraws every text.
   ========================================================================== */
Redact.busy = false;
Redact.reveal = function (done) {
  if (this.shown() || this.busy) { if (done) done(); return; }
  const st = el('stage');
  let n = el('nameReveal');
  if (!n) { n = document.createElement('div'); n.id = 'nameReveal'; n.setAttribute('data-noi18n', ''); st.appendChild(n); }
  n.innerHTML = '<div class="nr-c"></div><div class="nr-n"><span class="redacted" data-name></span><span class="clean"></span></div><div class="nr-s"></div>';
  n.querySelector('.nr-c').textContent = tr('reveal.caption');
  n.querySelector('.redacted').textContent = tr('name.decoy');
  n.className = 'on'; st.classList.add('void');
  this.busy = true;
  const back = G.scene; G.scene = 'reveal';
  let closed = false, canClose = false;
  const close = () => {
    if (closed || !canClose) return; closed = true;
    n.className = ''; st.classList.remove('void'); this.busy = false;
    removeEventListener('keydown', key, true); n.removeEventListener('pointerdown', close);
    if (G.scene === 'reveal') G.scene = back;
    if (done) done();
  };
  const key = (e) => { if (canClose && ['e', 'E', 'Enter', ' ', 'Escape'].includes(e.key)) { e.preventDefault(); e.stopPropagation(); close(); } };
  addEventListener('keydown', key, true); n.addEventListener('pointerdown', close);
  Sound.rune();
  setTimeout(() => {
    G.flags.named = true; save();
    n.querySelector('.clean').textContent = this.name(LANG);
    n.querySelector('.nr-s').textContent = tr('reveal.sub');
    n.classList.add('burn');
    if (!matchMedia('(prefers-reduced-motion: reduce)').matches) for (let i = 0; i < 14; i++) {
      const e = document.createElement('i'); e.className = 'em';
      e.style.left = (30 + Math.random() * 40) + '%'; e.style.top = (46 + Math.random() * 8) + '%'; e.style.animationDelay = (Math.random() * 1.6) + 's';
      n.appendChild(e);
    }
    Sound.open();
    this.refresh();                                   // from here on the name is clean everywhere, in pages already read as well
  }, 1500);
  setTimeout(() => { canClose = true; }, 4200);
  setTimeout(() => { canClose = true; close(); }, 7600);
};

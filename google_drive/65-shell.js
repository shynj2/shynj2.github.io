/* ==========================================================================
   SHELL — narrator voice, the first screen (language + tap), fullscreen, language button
   ========================================================================== */
const VO = {
  a: null, t: 0, t2: 0,
  langs: ['en', 'fa', 'ar', 'ru', 'ja'],   // languages that hear the narrator. She reads the English text in all of them;
                                   // the other languages show their own sentence, typed in step with her voice.
  rate: 1,                         // 1 = as recorded
  has(i) { return typeof VO_SRC !== 'undefined' && !!VO_SRC[i] && !Sound.muted; },
  /* how far the sentence being read has come, 0…1; -1 when nothing is playing (muted, blocked, or no recording) */
  progress() { const a = this.a; return a && a.duration && isFinite(a.duration) && !a.paused ? a.currentTime / a.duration : (a && a.ended ? 1 : -1); },
  play(i, done, fallback) {
    this.stop();
    let fired = false; const fin = () => { if (!fired) { fired = true; done(); } };
    const src = (typeof VO_SRC !== 'undefined') && VO_SRC[i];
    if (!src || Sound.muted) { this.t = setTimeout(fin, fallback); return; }
    const a = this.a = new Audio(src);
    a.preservesPitch = false; a.mozPreservesPitch = false; a.webkitPreservesPitch = false;
    a.playbackRate = this.rate; a.volume = 1;
    if (typeof Music !== 'undefined' && Music.duck) Music.duck(true);
    a.onended = fin; a.onerror = () => { this.t = setTimeout(fin, fallback); };
    const p = a.play(); if (p && p.catch) p.catch(() => { this.t = setTimeout(fin, fallback); });
    this.t2 = setTimeout(fin, 15000);
  },
  stop() { clearTimeout(this.t); clearTimeout(this.t2); if (this.a) { this.a.onended = null; this.a.pause(); this.a = null; } }
};

function goFullscreen() {
  const d = document.documentElement, f = d.requestFullscreen || d.webkitRequestFullscreen;
  if (!f || document.fullscreenElement || document.webkitFullscreenElement) return;
  try {
    const p = f.call(d, { navigationUI: 'hide' });
    if (p && p.then) p.then(() => { try { screen.orientation.lock('landscape').catch(() => {}); } catch (e) {} }).catch(() => {});
  } catch (e) {}
}
/* back to the main résumé (the address is CONTACT.resume in 10-content.js) */
function leaveToResume() {
  try { save(); } catch (e) {}
  try { (window.top || window).location.href = CONTACT.resume; } catch (e) { window.open(CONTACT.resume, '_blank'); }
}
function toggleFullscreen() {
  if (document.fullscreenElement || document.webkitFullscreenElement) (document.exitFullscreen || document.webkitExitFullscreen).call(document);
  else goFullscreen();
}

/* the first screen: pick a language; the tap also unlocks sound and, on phones, goes fullscreen */
const Gate = {
  done: false, node: null,
  show(cb) {
    if (this.node) return;
    const g = this.node = document.createElement('div'); g.id = 'gate'; g.setAttribute('data-noi18n', '');
    g.innerHTML = '<div class="g-t" data-i18n="ui.title"></div><div class="g-s" data-i18n="ui.tagline"></div>' +
      '<div class="g-b">' + LANGS.map((l) => '<button class="btn pri f-' + l + '" data-l="' + l + '" lang="' + l + '" type="button">' + LANG_NAME[l] + '</button>').join('') + '</div>' +
      '<div class="g-n" data-i18n="gate.sound"></div>' +
      '<a class="g-r" href="' + CONTACT.resume + '" target="_top">↩ <span data-i18n="ui.back_to_resume"></span></a>';
    I18N.apply(g);
    el('intro').appendChild(g);
    g.addEventListener('click', (e) => {
      const b = e.target.closest('button'); if (!b) return;
      setLang(b.dataset.l); Sound.resume(); Sound.ambience('title', .6);
      if (Touch.on) goFullscreen();
      this.hide(); cb();
    });
  },
  hide() { this.done = true; if (this.node) { this.node.remove(); this.node = null; } }
};

/* two small round buttons above the sound button, and the salary line under the score */
{
  const mk1 = (id, txt, title, fn) => { const b = document.createElement('button'); b.id = id; b.className = 'hbtn'; b.type = 'button'; b.setAttribute('data-i18n-title', title); b.title = tr(title); b.textContent = txt; b.addEventListener('click', (e) => { e.preventDefault(); fn(); b.blur(); }); el('mute').parentNode.insertBefore(b, el('mute')); return b; };
  mk1('fsBtn', '', 'ui.fullscreen', toggleFullscreen).innerHTML = '<svg viewBox="0 0 12 12" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M1 4V1h3M8 1h3v3M11 8v3H8M4 11H1V8"/></svg>';
  /* the language button shows the current language; a press opens the five choices  EN · فا · ع · РУ · 日  beside it */
  const lm = document.createElement('div'); lm.id = 'langMenu';
  lm.innerHTML = LANGS.map((l) => '<button type="button" class="f-' + l + '" data-l="' + l + '" lang="' + l + '" title="' + LANG_NAME[l] + '">' + LANG_LABEL[l] + '</button>').join('');
  const lb = mk1('langBtn', LANG_LABEL[LANG], 'ui.language', () => {
    const open = !lm.classList.contains('on'); lm.classList.toggle('on', open);
    if (!open) return;
    const b = lb.getBoundingClientRect(), s = el('stage').getBoundingClientRect(), w = lm.offsetWidth, h = lm.offsetHeight;
    let x = b.left - s.left - w - 6, y = b.top - s.top + (b.height - h) / 2;
    if (x < 6) { x = Math.max(6, Math.min(b.right - s.left - w, s.width - w - 6)); y = b.bottom - s.top + 6; }     // no room beside the button: open under it
    lm.style.left = Math.round(x) + 'px'; lm.style.top = Math.round(y) + 'px';
  });
  el('stage').appendChild(lm);
  lm.addEventListener('click', (e) => { const b = e.target.closest('button'); if (!b) return; e.preventDefault(); lm.classList.remove('on'); setLang(b.dataset.l); b.blur(); });
  document.addEventListener('pointerdown', (e) => { if (!e.target.closest('#langMenu,#langBtn')) lm.classList.remove('on'); });
  const langMark = () => { lb.textContent = LANG_LABEL[LANG]; lb.className = 'hbtn f-' + LANG; [...lm.children].forEach((n) => n.classList.toggle('on', n.dataset.l === LANG)); };
  document.addEventListener('langchange', langMark); langMark();
  /* back to the main résumé: a round button under the menu button (asks first, a thumb can slip), and a line in the pause menu */
  const cv = mk1('cvBtn', 'CV', 'ui.back_to_resume', () => {
    if (confirm(tr('ui.leave_ask'))) leaveToResume();
  });
  el('menuBtn').parentNode.insertBefore(cv, el('menuBtn').nextSibling);
  const pr = document.createElement('a'); pr.className = 'btn'; pr.dataset.act = 'resume'; pr.href = CONTACT.resume; pr.target = '_top'; pr.dataset.i18n = 'ui.back_to_resume'; pr.textContent = tr('ui.back_to_resume');
  pr.addEventListener('click', () => { try { save(); } catch (e) {} });
  const lv = document.querySelector('#pause .btn[data-act="leave"]'); lv.parentNode.insertBefore(pr, lv);
  el('hudScore').setAttribute('dir', 'ltr');
  const sc = el('hudScore').parentNode, cut = document.createElement('div');
  cut.className = 'cut'; cut.innerHTML = '<b id="hudCutN" dir="ltr">−0</b> <span data-i18n="ui.hud_salary"></span>'; I18N.apply(cut);
  sc.parentNode.insertBefore(cut, sc.nextSibling);
}

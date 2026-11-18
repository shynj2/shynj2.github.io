// Checks the text of the game (STR in src/js/61-i18n.js).
//     node tools/strings.mjs          all five languages
//     node tools/strings.mjs ja       one language
// Reports: ids the game uses that have no text, lines missing in a language, {0} placeholders that differ,
// characters the embedded font of a language does not have (then run: python3 tools/fonts.py),
// and text that is still written directly in the code instead of STR. Exit code 1 when something is missing.
import fs from 'node:fs';
const R = (...p) => new URL('../' + p.join('/'), import.meta.url);
const read = (...p) => fs.readFileSync(R(...p), 'utf8');
const i18n = read('src/js', '61-i18n.js');
const STR = new Function(i18n.slice(i18n.indexOf('/* STR:BEGIN */'), i18n.indexOf('/* STR:END */')) + '; return STR;')();
const LANGS = Object.keys(STR), want = (process.argv[2] || '').startsWith('--') ? undefined : process.argv[2];
if (want && !STR[want]) { console.error('unknown language "' + want + '". Known: ' + LANGS.join(', ')); process.exit(2); }
const content = read('src/js', '10-content.js');
const DC = new Function(content.slice(content.indexOf('const DC = {'), content.indexOf('\n};', content.indexOf('const DC = {')) + 3) + '; return DC;')();

/* ---- ids the game uses ---- */
const used = new Map(), use = (id, where) => { if (!used.has(id)) used.set(id, where); };
const dlgLines = new Set();
for (const k in DC) for (const b of DC[k]) { if (b.who) use(b.who, 'DC.' + k); for (const l of b.lines) if (l) { use(l, 'DC.' + k); dlgLines.add(l); } }
const heads = new Set(Object.keys(STR.en).map((k) => k.split('.')[0]));
const files = fs.readdirSync(R('src/js')).filter((f) => f.endsWith('.js')).map((f) => ['src/js/' + f, f === '61-i18n.js' ? i18n.slice(i18n.indexOf('/* STR:END */')) : read('src/js', f)]).concat([['src/legacy-dom.html', read('src', 'legacy-dom.html')]]);
for (const [name, src] of files) for (const m of src.matchAll(/['"`]([a-z][\w]*(?:\.[\w]+)+)['"`]/g)) if (heads.has(m[1].split('.')[0]) && !/\.(js|mjs|html|css|png|mp3|txt|json|woff2)$/.test(m[1])) use(m[1], name);
for (const p of ['goblin.final.1', 'goblin.final.2', 'goblin.final.3', 'goblin.final.4', 'codex.level.advanced', 'codex.level.proficient', 'codex.level.basic']) use(p, 'built in code');

let bad = 0; const say = (s) => console.log(s);
const noText = [...used].filter(([id]) => STR.en[id] == null);
say(`ids in STR.en: ${Object.keys(STR.en).length}   ids the game uses: ${used.size}`);
if (noText.length) { bad += noText.length; say(`\nUSED BUT NOT IN STR (${noText.length}):`); noText.forEach(([id, w]) => say(`  ${id}    (${w})`)); }

/* ---- each language against English ---- */
let cover = {}; try { cover = JSON.parse(read('art-src/fonts', 'coverage.json')); } catch (e) {}
const FONT = { fa: ['VeyFa'], ar: ['VeyAr'], ru: ['VeyRu', 'VeyRuI'], ja: ['VeyJa'] };
const SYMBOL = /[\s✦→←◆☠▼♪·↩\u200e\u200f]/;                      // drawn by the device's own symbol font in every language
const ph = (s) => (s.match(/\{\d\}/g) || []).sort().join('');
for (const l of LANGS) {
  if (want && l !== want) continue;
  const miss = Object.keys(STR.en).filter((id) => STR[l][id] == null || STR[l][id] === '');
  const extra = Object.keys(STR[l]).filter((id) => STR.en[id] == null);
  const phBad = Object.keys(STR.en).filter((id) => STR[l][id] && ph(STR[l][id]) !== ph(STR.en[id]));
  const chars = new Set(Object.values(STR[l]).join(''));
  const noGlyph = (FONT[l] || []).map((f) => [f, [...chars].filter((c) => !SYMBOL.test(c) && cover[f] && !cover[f].includes(c.codePointAt(0)))]).filter((x) => x[1].length);
  const wide = l === 'ja' ? 21 : 38, long = [...dlgLines].filter((id) => (STR[l][id] || '').split('\n').some((v) => [...v].length > wide));
  bad += miss.length + extra.length + phBad.length + noGlyph.length;
  say(`\n[${l}]  ${Object.keys(STR[l]).length} lines · missing ${miss.length} · not in English ${extra.length} · placeholder differs ${phBad.length} · characters without a glyph ${noGlyph.reduce((a, x) => a + x[1].length, 0)}`);
  miss.forEach((id) => say(`  missing: ${id}    en: ${JSON.stringify(STR.en[id]).slice(0, 70)}`));
  extra.forEach((id) => say(`  not in English: ${id}`));
  phBad.forEach((id) => say(`  placeholder differs: ${id}`));
  noGlyph.forEach(([f, c]) => say(`  font ${f} has no glyph for: ${c.join(' ')}    -> python3 tools/fonts.py`));
  if (long.length) say(`  note: ${long.length} dialogue line(s) are wider than ${wide} characters and will wrap by themselves: ${long.slice(0, 6).join(', ')}${long.length > 6 ? ', …' : ''}`);
}

/* ---- text still written in the code ---- */
const hard = [];
for (const [name, src] of files) {
  if (!name.endsWith('.js') || name.endsWith('61-i18n.js') || name.endsWith('69-override.js') || name.endsWith('68-ally.js')) continue;      // 69: what the terminal prints is code, the same in every language (its spoken lines are in STR)
  src.split('\n').forEach((line, n) => {
    if (/^\s*(\/\/|\/?\*)/.test(line) || /SKILL\('/.test(line)) return;           // comments; tool names stay as they are
    const code = line.replace(/\/\/.*$/, '');
    for (const m of code.matchAll(/'((?:[^'\\]|\\.)*)'/g)) {
      const t = m[1].replace(/<[^>]*>?/g, ' ').replace(/^[^<]*>/, ' ').trim();
      if (!/[A-Za-z]{3,} [A-Za-z]{2,}|[\u0600-\u06ff\u0400-\u04ff\u3040-\u30ff]{2,}/.test(t)) continue;      // not a phrase
      if (/[=;{}()\[\]#]|^[a-z0-9 ,.:_-]+$/.test(t) || /^(VEYRATH|The Rune Architect|REQUEST AN AUDIENCE.*|.*sent from Veyrath.*)$/.test(t)) continue;   // code, class lists, the title, the message sent to Telegram
      hard.push(`  ${name}:${n + 1}  ${t.slice(0, 80)}`);
    }
  });
}
if (hard.length) { say(`\nPOSSIBLY WRITTEN IN THE CODE (${hard.length}) — move to STR if a player reads it:`); hard.forEach((h) => say(h)); }

/* ---- right-to-left lint (Round 9 §5): the common bidi, ZWNJ and punctuation mistakes in Persian and Arabic ---- */
const ZW = '\u200c';
const RTL_RULES = [
  ['fa', /[\u064e\u064f\u0650]/, 'short-vowel mark (kasra / fatha / damma): the house rule is to leave them out'],
  ['fa', /[\u064a\u0643\u0649]/, 'Arabic ي / ك / ى in Persian text (use ی / ک)'],
  ['ar', /[\u06cc\u06a9\u06af\u067e\u0686\u0698]/, 'Persian letter in Arabic text'],
  ['fa', /(^|[\s«(])ن?می [\u0600-\u06ff]/, '"می" / "نمی" split from its verb by a space (needs ZWNJ: می‌سازد)'],
  ['fa', /[\u0600-\u06ff] (ها|های|هایی|هایم|هایت|هایش|ترین|تری)(?=$|[\s.،؛؟!»)…])/, 'plural or comparative suffix split by a space (needs ZWNJ: سایت‌ها)'],
  ['fa', /ه ی(?=$|[\s.،؛؟!»)])/, '"ه ی" for ezafe (write هٔ)'],
  ['*', new RegExp('(^|\\s)' + ZW + '|' + ZW + '($|[\\s.،؛؟!»):…])|' + ZW + ZW), 'ZWNJ at the edge of a word, or doubled'],
  ['*', new RegExp('[اآدذرزژوةى]' + ZW), 'ZWNJ after a letter that never joins forward (useless, a typing slip)'],
  ['*', /[\u0600-\u06ff][^A-Za-z<>{}]*[?;](?![^<]*>)/, 'Latin ? or ; after Persian/Arabic text (use ؟ ؛)'],
  ['*', /[\u0600-\u06ff],|,\s*[\u0600-\u06ff]/, 'Latin comma in Persian/Arabic text (use ،)'],
  ['*', /"|''/, 'straight double quote (use « »)'],
  ['*', / [،؛؟!.:](?=$|\s)/, 'space before punctuation'],
  ['*', /[،؛](?=[\u0600-\u06ffA-Za-z{])/, 'no space after ، or ؛'],
  ['*', /[—–-]\s*$|[—–-]\s*\n|^\s*[—–]|\n\s*[—–]\s/, 'dash dangling at the end or start of a line (it lands on the wrong side for the reader)'],
  ['fa', /[0-9](?![^<]*>)/, null],                                  // handled below: ASCII digits outside Latin runs
  ['ar', /[0-9](?![^<]*>)/, null],
  ['*', /[\u2066-\u2069\u202a-\u202e\u200e\u200f]/, 'explicit direction mark typed into STR (tr() adds the isolates itself)']
];
const LATIN_RUN = /[A-Za-z@+#][A-Za-z0-9@._:\/+#&'’%-]*(?:[ ][A-Za-z0-9#&][A-Za-z0-9@._:\/+#&'’%-]*)*/g;
const DIGIT_OK = /^(note_repo|note_catacomb_3\.1|codex\.experience\.date|name\.decoy)/;   // 404, TODO…, version tags, dates in the record keep their form
if (process.argv.includes('--selftest')) {                         // the lint must catch each of these planted mistakes
  const plant = [['fa', 'او سایت می سازد.'], ['fa', 'سایت ها را ساخت.'], ['fa', 'کارگاهِ کهن'], ['fa', 'خانه ی ما'], ['fa', 'علي آمد'], ['ar', 'این جدار'], ['fa', 'چرا آمدی?'],
    ['fa', 'یک, دو'], ['fa', 'او گفت "نه"'], ['fa', 'آمد ، رفت'], ['fa', 'آمد،رفت'], ['fa', 'با HTML و CSS می‌سازد —'], ['fa', 'سال 2023 بود'], ['ar', 'في عام 2023'], ['fa', 'می\u200c سازد'], ['fa', 'را\u200cه']];
  const miss = plant.filter(([l, v]) => !RTL_RULES.some(([who, re, msg]) => (who === '*' || who === l) && (msg === null ? /[0-9]/.test(v.replace(LATIN_RUN, '')) : re.test(v))));
  if (miss.length) { console.log('selftest: NOT caught: ' + miss.map((m) => m[1]).join(' | ')); process.exit(1); }
  console.log('selftest: all ' + plant.length + ' planted mistakes caught'); process.exit(0);
}
const rtlBad = [];
for (const l of LANGS.filter((x) => (x === 'fa' || x === 'ar') && (!want || want === x))) for (const id in STR[l]) {
  const v = STR[l][id];
  for (const [who, re, msg] of RTL_RULES) {
    if (who !== '*' && who !== l) continue;
    if (msg === null) { if (!DIGIT_OK.test(id) && /[0-9]/.test(v.replace(/<[^>]+>|\{\w\}/g, '').replace(LATIN_RUN, '').replace(/\b(404|4\d\d)\b/g, ''))) rtlBad.push(`  ${l}  ${id}: Latin digit in running text (use ${l === 'fa' ? '۰–۹ Persian' : '٠–٩ Arabic-Indic'} digits)  «${v.slice(0, 60)}»`); continue; }
    if (re.test(v)) rtlBad.push(`  ${l}  ${id}: ${msg}  «${v.replace(/\n/g, '⏎').slice(0, 70)}»`);
  }
}
if (rtlBad.length) { bad += rtlBad.length; say(`\nRIGHT-TO-LEFT LINT (${rtlBad.length}):`); rtlBad.forEach((x) => say(x)); }
else say('right-to-left lint: clean (fa, ar)');
if (process.argv.includes('--json')) fs.writeFileSync(R('review', 'rtl-lint.json'), JSON.stringify({ problems: rtlBad }, null, 1));
const unused = Object.keys(STR.en).filter((id) => !used.has(id));
if (unused.length) say(`\nnot used by the game (${unused.length}, harmless): ${unused.join(', ')}`);
say(bad ? `\n${bad} problem(s).` : `\nNothing missing${want ? ' in ' + want : ' in ' + LANGS.join(', ')}.`);
process.exit(bad ? 1 : 0);

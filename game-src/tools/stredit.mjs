// node tools/stredit.mjs art-src/text/r9/01-x.mjs [...]
// Applies a patch to STR in src/js/61-i18n.js IN PLACE (one line per id, hand-editable afterwards)
// and logs every changed string to art-src/text/audit.json (-> tools/audit.mjs writes AUDIT.md).
// Patch file:  export default { why: 'default reason', set: { 'id': ['en','fa','ar','ru','ja'] | {t:[...], why:'...'} }, del: ['id'] }
import fs from 'fs';
import path from 'path';
import { pathToFileURL } from 'url';
const F = new URL('../src/js/61-i18n.js', import.meta.url), AUD = new URL('../art-src/text/audit.json', import.meta.url);
const LANGS = ['en', 'fa', 'ar', 'ru', 'ja'];
let src = fs.readFileSync(F, 'utf8');
const a = src.indexOf('/* STR:BEGIN */'), b = src.indexOf('/* STR:END */');
let lines = src.slice(a, b).split('\n');
const audit = fs.existsSync(AUD) ? JSON.parse(fs.readFileSync(AUD, 'utf8')) : [];
const blockOf = (lang) => { const s = lines.findIndex((l) => l === '  ' + lang + ': {'); let e = s + 1; while (!/^  \},?$/.test(lines[e])) e++; return [s, e]; };
let changed = 0, added = 0, removed = 0;
for (const file of process.argv.slice(2)) {
  const p = (await import(pathToFileURL(path.resolve(file)).href)).default;
  for (const [id, v] of Object.entries(p.set || {})) {
    const t = Array.isArray(v) ? v : v.t, why = (v && v.why) || p.why || '';
    if (!t || t.length !== 5 || t.some((x) => x !== null && (typeof x !== 'string' || !x.length))) throw new Error('need five strings (null = keep) for ' + id + ' in ' + file);
    LANGS.forEach((lang, i) => {
      const [s, e] = blockOf(lang);
      if (t[i] === null) return;
      const row = '    ' + JSON.stringify(id) + ': ' + JSON.stringify(t[i]) + ',';
      let at = -1;
      for (let k = s + 1; k < e; k++) if (lines[k].startsWith('    ' + JSON.stringify(id) + ': ')) { at = k; break; }
      if (at >= 0) {
        const old = JSON.parse(lines[at].replace(/^\s*"[^"]+": /, '').replace(/,\s*$/, ''));
        if (old !== t[i]) { lines[at] = row.replace(/,$/, lines[at].trimEnd().endsWith(',') ? ',' : ''); audit.push({ id, lang, old, new: t[i], why, file: path.basename(file) }); changed++; }
      } else {
        if (!lines.slice(s, e).some((l) => l.includes('---- ROUND 9 ----'))) { if (!lines[e - 1].trimEnd().endsWith(',')) lines[e - 1] += ','; lines.splice(e, 0, '    /* ---- ROUND 9 ---- */'); }
        const [, e2] = blockOf(lang);
        if (!lines[e2 - 1].trimEnd().endsWith(',') && !lines[e2 - 1].includes('/*')) lines[e2 - 1] += ',';
        lines.splice(e2, 0, row); added++;
      }
    });
  }
  for (const id of p.del || []) LANGS.forEach((lang) => {
    const [s, e] = blockOf(lang);
    for (let k = s + 1; k < e; k++) if (lines[k].startsWith('    ' + JSON.stringify(id) + ': ')) {
      audit.push({ id, lang, old: JSON.parse(lines[k].replace(/^\s*"[^"]+": /, '').replace(/,\s*$/, '')), new: null, why: p.why || 'unused', file: path.basename(file) });
      lines.splice(k, 1); removed++; break;
    }
  });
}
src = src.slice(0, a) + lines.join('\n') + src.slice(b);
new Function(src.slice(src.indexOf('/* STR:BEGIN */'), src.indexOf('/* STR:END */')) + ';return STR')();   // must still parse
fs.writeFileSync(F, src); fs.writeFileSync(AUD, JSON.stringify(audit, null, 1));
console.log(`STR: ${changed} changed, ${added} added, ${removed} removed`);

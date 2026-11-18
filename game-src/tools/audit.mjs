// Writes art-src/text/AUDIT.md from art-src/text/audit.json (every string changed in Round 9: id, language, old, new, why).
//   node tools/audit.mjs
import fs from 'node:fs';
const R = (p) => new URL('../' + p, import.meta.url);
const A = JSON.parse(fs.readFileSync(R('art-src/text/audit.json'), 'utf8'));
const esc = (s) => String(s == null ? '' : s).replace(/\|/g, '\\|').replace(/\n/g, ' ⏎ ');
const LN = { en: 'English', fa: 'Persian', ar: 'Arabic', ru: 'Russian', ja: 'Japanese' };
const byFile = {}; for (const e of A) (byFile[e.file || 'other'] = byFile[e.file || 'other'] || []).push(e);
const count = {}; for (const e of A) count[e.lang] = (count[e.lang] || 0) + 1;
let md = '# Text audit — Round 9\n\n';
md += 'Every string that was CHANGED in Round 9, with the reason. New strings (weapons, the fight, RE-sync, the pictures, the score, credits) are not listed: they have no "old" text; they are in `art-src/text/r9/*.mjs`.\n\n';
md += '**What was read, honestly.** English and Persian: the opening, the Keeper\'s records, the notice board, the goblin, the fight and every line touched in this round were read in the running game. ';
md += 'Arabic, Russian and Japanese were corrected where a rule applied to all languages (the title, the name, the 500 / 500,000 line, bidi isolation, punctuation), but they were **not** read line by line in context, and no native speaker has checked them.\n\n';
md += 'Changed strings: ' + A.length + ' (' + Object.keys(LN).map((l) => LN[l] + ' ' + (count[l] || 0)).join(', ') + ').\n\n';
for (const f of Object.keys(byFile)) {
  md += '## ' + f + ' — ' + byFile[f].length + ' changes\n\n| id | lang | old | new | why |\n|---|---|---|---|---|\n';
  for (const e of byFile[f]) md += '| `' + esc(e.id) + '` | ' + e.lang + ' | ' + esc(e.old) + ' | ' + esc(e.new) + ' | ' + esc(e.why) + ' |\n';
  md += '\n';
}
fs.writeFileSync(R('art-src/text/AUDIT.md'), md);
console.log('AUDIT.md: ' + A.length + ' changes in ' + Object.keys(byFile).length + ' groups');

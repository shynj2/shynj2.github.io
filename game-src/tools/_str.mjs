// helper: load STR in node
import fs from 'fs';
const s=fs.readFileSync(new URL('../src/js/61-i18n.js',import.meta.url),'utf8');
const a=s.indexOf('/* STR:BEGIN */'),b=s.indexOf('/* STR:END */');
export const STR=new Function(s.slice(a,b)+';return STR')();

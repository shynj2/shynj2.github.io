import {STR} from './_str.mjs';
const ids=process.argv.slice(2);
for(const k of Object.keys(STR.en)) if(ids.some(p=>p.endsWith('*')?k.startsWith(p.slice(0,-1)):k===p)) {console.log('## '+k);for(const l of ['en','fa','ar','ru','ja']) console.log('  '+l+': '+JSON.stringify(STR[l][k]).slice(1,-1));}

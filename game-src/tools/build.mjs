// BUILD — bakes everything under /art-src into indexed atlases, inlines them (base64) together with
// the game code into ONE html file:  dist/rune-architect.html  (+ a copy at ./rune-architect.html).
//   node tools/build.mjs            build
//   node tools/build.mjs --sheets   also write contact sheets into /review
// Nothing here needs editing to change art: edit /art-src, drop a PNG into /art-src/overrides, rebuild.
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { ROOT, PAL, MASTER, MASTER_RGB, NAME, RAMP_OF, IDX, EMI, zoneLut, FONT3, Img } from './lib/pix.mjs';
import { encodeIndex, encodeRGBA, decode } from './lib/png.mjs';
import { pack, assetSheet } from './lib/atlas.mjs';
import { bakeRig } from './lib/rig.mjs';
import { clipSheet } from './lib/sheet.mjs';

const SHEETS = process.argv.includes('--sheets');
const R = (...p) => path.join(ROOT, ...p);
const imp = async (file) => (await import(pathToFileURL(R(file)).href + '?t=' + Date.now()));
const exists = (f) => fs.existsSync(R(f));
const b64 = (buf) => Buffer.from(buf).toString('base64');
const report = { atlases: {}, rigs: {}, overrides: [] };

/* ---------- overrides: art-src/overrides/<sprite>.png or <sprite>_<frame>.png replaces a baked sprite ---------- */
function nearestMaster(r, g, b) {
  let best = 1, bd = 1e9;
  for (let i = 1; i < MASTER_RGB.length; i++) { const c = MASTER_RGB[i], d = (c[0] - r) ** 2 + (c[1] - g) ** 2 + (c[2] - b) ** 2; if (d < bd) { bd = d; best = i; } }
  return best;
}
function applyOverrides(sprites) {
  const dir = R('art-src/overrides'); if (!fs.existsSync(dir)) return;
  for (const f of fs.readdirSync(dir)) {
    if (!f.endsWith('.png')) continue;
    const base = f.slice(0, -4); let name = base, frame = -1;
    if (!sprites[name]) { const m = base.match(/^(.*)_(\d+)$/); if (m && Array.isArray(sprites[m[1]])) { name = m[1]; frame = +m[2]; } else continue; }
    const p = decode(fs.readFileSync(path.join(dir, f))), im = new Img(p.w, p.h);
    for (let i = 0; i < p.w * p.h; i++) if (p.rgba[i * 4 + 3] >= 128) im.d[i] = nearestMaster(p.rgba[i * 4], p.rgba[i * 4 + 1], p.rgba[i * 4 + 2]);   // quantize, hard alpha
    if (frame >= 0) sprites[name][frame] = im; else sprites[name] = im;
    report.overrides.push(f);
  }
}
const hasEmi = (im) => { for (let i = 0; i < im.d.length; i++) if (im.d[i] & EMI) return 1; return 0; };

/* ---------- environment atlases (one per authored zone kit) ---------- */
const ART = { pal: MASTER_RGB, names: NAME, up: [], down: [], luts: {}, atlases: {}, parallax: {}, rigs: {}, maps: {}, font: FONT3 };
const stepIdx = (i, d) => { const [ramp, s] = RAMP_OF[i]; const n = PAL.ramps[ramp].length; return NAME[ramp + Math.max(0, Math.min(n - 1, s + d))]; };
for (let i = 0; i < MASTER.length; i++) { ART.up[i] = i ? stepIdx(i, 1) : 0; ART.down[i] = i ? stepIdx(i, -1) : 0; }
for (const k of Object.keys(PAL.luts)) ART.luts[k] = zoneLut(k);
ART.ramps = Object.fromEntries(Object.entries(PAL.ramps).map(([k, v]) => [k, v.map((_, i) => NAME[k + i])]));

const fxMod = exists('art-src/fx/fx.mjs') ? (await imp('art-src/fx/fx.mjs')).default() : {};
const common = exists('art-src/sets/common.mjs') ? (await imp('art-src/sets/common.mjs')).default() : {};
const ui = exists('art-src/ui/ui.mjs') ? (await imp('art-src/ui/ui.mjs')).default() : {};
for (const zone of fs.readdirSync(R('art-src/tiles'))) {
  const sprites = { ...(await imp(`art-src/tiles/${zone}/tileset.mjs`)).default() };
  if (exists(`art-src/sets/${zone}/sets.mjs`)) {
    const s = (await imp(`art-src/sets/${zone}/sets.mjs`)).default();
    Object.assign(sprites, s.sprites);
    for (const [k, v] of Object.entries(s.cuts || {})) sprites['cut_' + k] = v;
  }
  Object.assign(sprites, fxMod, common, ui);
  applyOverrides(sprites);
  const a = pack(sprites, 1024), png = encodeIndex(a.img.w, a.img.h, a.img.d);
  const emi = {}; for (const [k, v] of Object.entries(sprites)) if ((Array.isArray(v) ? v : [v]).some(hasEmi)) emi[k] = 1;
  ART.atlases[zone] = { w: a.img.w, h: a.img.h, png: b64(png), s: a.rects, e: emi };
  report.atlases[zone] = { w: a.img.w, h: a.img.h, bytes: png.length, sprites: Object.keys(sprites).length };
  fs.mkdirSync(R('dist'), { recursive: true }); fs.writeFileSync(R('dist', `atlas_${zone}.png`), png);
  if (SHEETS) assetSheet(sprites, R('review', `${zone}_assets.png`), { scale: 2, width: 900 });
  if (exists(`art-src/parallax/${zone}/parallax.mjs`)) {
    const layers = (await imp(`art-src/parallax/${zone}/parallax.mjs`)).default();
    applyOverrides(layers);
    ART.parallax[zone] = {};
    for (const [k, im] of Object.entries(layers)) {
      const p = encodeIndex(im.w, im.h, im.d);
      ART.parallax[zone][k] = { w: im.w, h: im.h, png: b64(p) };
      report.atlases[zone + '/' + k] = { w: im.w, h: im.h, bytes: p.length };
      fs.writeFileSync(R('dist', `px_${zone}_${k}.png`), p);
    }
  }
}

/* ---------- rigs -> frame grids (role index + rim flags) ---------- */
for (const name of fs.readdirSync(R('art-src/rigs'))) {
  if (!exists(`art-src/rigs/${name}/rig.json`)) continue;
  const b = await bakeRig(name), cols = Math.min(16, b.frames.length), rows = Math.ceil(b.frames.length / cols);
  const sheet = new Img(cols * b.frameW, rows * b.frameH);
  b.frames.forEach((f, i) => sheet.blit(f, (i % cols) * b.frameW, ((i / cols) | 0) * b.frameH));
  const png = encodeIndex(sheet.w, sheet.h, sheet.d), clips = {};
  for (const [k, c] of Object.entries(b.clips)) clips[k] = { fps: c.fps, loop: c.loop ? 1 : 0, f: c.frames.map((fr) => fr.h ? [fr.f, fr.hold, fr.ev || 0, fr.h] : [fr.f, fr.hold, fr.ev || 0]) };
  ART.rigs[name] = { w: sheet.w, h: sheet.h, png: b64(png), fw: b.frameW, fh: b.frameH, ox: b.origin[0], oy: b.origin[1], cols, n: b.frames.length, clips, roles: b.roles, ol: b.isOutline.map((v) => v ? 1 : 0), meta: b.meta };
  report.rigs[name] = { frames: b.frames.length, clips: Object.keys(clips).length, bytes: png.length };
  fs.writeFileSync(R('dist', `rig_${name}.png`), png);
  if (SHEETS) clipSheet(b, R('review', `${name}_sheet.png`), { scale: 3 });
}

/* ---------- maps ---------- */
for (const f of fs.readdirSync(R('art-src/maps'))) if (f.endsWith('.txt')) ART.maps[f.slice(0, -4)] = fs.readFileSync(R('art-src/maps', f), 'utf8').replace(/\r/g, '').split('\n').filter((l) => l.length && !l.startsWith('# ')).join('\n');

/* ---------- assemble the single file ---------- */
const uiVars = Object.entries(ui).map(([k, im]) => { const px = new Uint8Array(im.w * im.h * 4); for (let i = 0; i < im.d.length; i++) { const v = im.d[i] & IDX; if (v) { px[i * 4] = MASTER_RGB[v][0]; px[i * 4 + 1] = MASTER_RGB[v][1]; px[i * 4 + 2] = MASTER_RGB[v][2]; px[i * 4 + 3] = 255; } } return `--${k.replace(/_/g, '-')}:url(data:image/png;base64,${b64(encodeRGBA(im.w, im.h, px))})`; }).join(';');
/* the embedded fonts (subsets made by tools/fonts.py; all SIL Open Font License, see art-src/fonts/OFL-*.txt) */
const FONTS = [['VeyFa', 'VeyFa', 'normal'], ['VeyAr', 'VeyAr', 'normal'], ['VeyRu', 'VeyRu', 'normal'], ['VeyRu', 'VeyRuI', 'italic'], ['VeyJa', 'VeyJa', 'normal'], ['VeyMono', 'VeyMono', 'normal']];
const fontCss = FONTS.map(([fam, file, style]) => `@font-face{font-family:${fam};font-style:${style};font-weight:100 900;font-display:swap;src:url(data:font/woff2;base64,${b64(fs.readFileSync(R('art-src/fonts', file + '.woff2')))}) format('woff2')}`).join('\n');
const css = fontCss + '\n' + fs.readFileSync(R('src/legacy-style.css'), 'utf8') + '\n:root{' + uiVars + '}\n' + fs.readFileSync(R('src/style.css'), 'utf8');
const dom = fs.readFileSync(R('src/legacy-dom.html'), 'utf8').replace('<canvas id="cv" width="480" height="270">', '<canvas id="cv" width="640" height="360">');
const jsFiles = fs.readdirSync(R('src/js')).filter((f) => /^\d\d-.*\.js$/.test(f)).sort();
const js = jsFiles.map((f) => `/* ===== ${f} ===== */\n` + fs.readFileSync(R('src/js', f), 'utf8')).join('\n');
const legacy = b64(fs.readFileSync(R('legacy/rune-architect.legacy.html')));
const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no,viewport-fit=cover">
<meta name="theme-color" content="#040208">
<title>Veyrath — The Keeper of the Root Code</title>
<script id="legacy-src" type="text/plain">${legacy}</script>
<script>
/* ?legacy=1 runs the previous build (procedural renderer) untouched, until the final milestone removes it. */
if (/[?&]legacy=1\\b/.test(location.search)) {
  window.__LEGACY__ = true; document.documentElement.style.visibility = 'hidden';
  document.addEventListener('DOMContentLoaded', function () {
    var bin = atob(document.getElementById('legacy-src').textContent), u8 = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; i++) u8[i] = bin.charCodeAt(i);
    location.replace(URL.createObjectURL(new Blob([u8], { type: 'text/html' })));
  });
}
</script>
<style>
${css}
</style>
</head>
<body>
${dom}
<script>
const ART = ${JSON.stringify(ART)};
${js}
</script>
</body>
</html>
`;
fs.writeFileSync(R('dist/rune-architect.html'), html);
fs.writeFileSync(R('rune-architect.html'), html);
report.html = { bytes: html.length, js: js.length, css: css.length, files: jsFiles };
fs.writeFileSync(R('dist/build-report.json'), JSON.stringify(report, null, 1));
console.log('built rune-architect.html', (html.length / 1024).toFixed(1) + ' KB', '| atlases', JSON.stringify(report.atlases), '| rigs', JSON.stringify(report.rigs), report.overrides.length ? '| overrides ' + report.overrides.join(',') : '');

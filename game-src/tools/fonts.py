#!/usr/bin/env python3
"""Builds the embedded font subsets in art-src/fonts/ (build.mjs inlines them as @font-face).

   Run again only when the Japanese text gains a kanji that was not used before
   (`node tools/strings.mjs` says so). Arabic, Persian and Cyrillic subsets hold their whole
   alphabet, so edits in those languages never need this tool.

       pip install fonttools brotli
       python3 tools/fonts.py            # downloads the open-licence originals to /tmp, writes the subsets

   All fonts are SIL Open Font License 1.1; the licence texts sit next to the subsets."""
import json, os, re, subprocess, sys, urllib.request
from fontTools.ttLib import TTFont
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, 'art-src', 'fonts'); TMP = '/tmp/fonts'
RAW = 'https://raw.githubusercontent.com/google/fonts/main/ofl/'
ASCII = ''.join(chr(c) for c in range(0x20, 0x7F)) + '’‘“”«»–—…·•×°'
FONTS = {   # css family: (file on google/fonts, languages whose text it must cover, extra characters, licence file)
    'VeyFa':  ('vazirmatn/Vazirmatn%5Bwght%5D.ttf', ['fa'], ''.join(chr(c) for c in range(0x600, 0x700)) + '\u200c\u200d', 'vazirmatn'),
    'VeyAr':  ('amiri/Amiri-Regular.ttf', ['ar'], ''.join(chr(c) for c in range(0x600, 0x700)) + '\u200c\u200d', 'amiri'),
    'VeyRu':  ('ptserif/PT_Serif-Web-Regular.ttf', ['ru'], ''.join(chr(c) for c in range(0x400, 0x460)) + '№', 'ptserif'),
    'VeyRuI': ('ptserif/PT_Serif-Web-Italic.ttf', ['ru'], ''.join(chr(c) for c in range(0x400, 0x460)) + '№', 'ptserif'),
    'VeyJa':  (sys.argv[sys.argv.index('--ja') + 1] if '--ja' in sys.argv else 'shipporimincho/ShipporiMincho-Medium.ttf', ['ja'],
               ''.join(chr(c) for c in list(range(0x3000, 0x3100)) + list(range(0xFF01, 0xFF5F))) + '―—', 'shipporimincho'),
    'VeyMono': ('vt323/VT323-Regular.ttf', [], '█▓▒░▌▐■□▲▼◆→←↑↓✓✗│─┌┐└┘├┤', 'vt323'),     # the terminal of the last phase (Round 9): Latin only
}
src = open(os.path.join(ROOT, 'src', 'js', '61-i18n.js'), encoding='utf-8').read()
def chars_of(lang):
    m = re.search(r'\n  ' + lang + r': \{\n(.*?)\n  \}', src, re.S)
    return set(m.group(1)) if m else set()
os.makedirs(TMP, exist_ok=True); cover = {}
for fam, (path, langs, extra, lic) in FONTS.items():
    f = os.path.join(TMP, path.replace('/', '_').replace('%5B', '[').replace('%5D', ']'))
    if not os.path.exists(f): urllib.request.urlretrieve(RAW + path, f)
    l = os.path.join(OUT, 'OFL-' + lic + '.txt')
    if not os.path.exists(l): urllib.request.urlretrieve(RAW + path.split('/')[0] + '/OFL.txt', l)
    want = set(ASCII + extra)
    for g in langs: want |= chars_of(g)
    if fam == 'VeyJa': want |= set(open(os.path.join(ROOT, 'tools', 'fonts-ja-extra.txt'), encoding='utf-8').read()) if os.path.exists(os.path.join(ROOT, 'tools', 'fonts-ja-extra.txt')) else set()
    want -= set('\n\r\t')
    srcf = f
    if '[wght]' in f:                                   # variable font: keep one weight
        from fontTools.varLib import instancer
        srcf = f.replace('[wght]', '-400'); tt = TTFont(f); instancer.instantiateVariableFont(tt, {'wght': 400}, inplace=True); tt.save(srcf)
    out = os.path.join(OUT, fam + '.woff2')
    uni = ','.join('U+%04X' % ord(c) for c in sorted(want))
    subprocess.check_call(['pyftsubset', srcf, '--output-file=' + out, '--flavor=woff2', '--unicodes=' + uni, '--layout-features=*', '--no-hinting', '--desubroutinize', '--name-IDs=1,2', '--notdef-outline'])
    cm = TTFont(out).getBestCmap(); cover[fam] = sorted(cm.keys())
    miss = [c for g in langs for c in sorted(chars_of(g)) if ord(c) not in cm and c not in '\n✦→←◆☠']
    print(f'{fam:7} {os.path.getsize(out):7} bytes  {len(cm):4} glyphs  ' + ('missing: ' + ''.join(miss) if miss else 'covers ' + '+'.join(langs)))
json.dump(cover, open(os.path.join(OUT, 'coverage.json'), 'w'))

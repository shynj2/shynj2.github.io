#!/usr/bin/env python3
"""One-off importer: art-src/text/GAME_TEXT_REWRITE.md  ->  art-src/text/parsed.json
   (sections 1-6: intro, speakers, zones, dialogue, goblin). Tables of sections 7-9 are read by rows."""
import re, json, sys
SRC = 'art-src/text/GAME_TEXT_REWRITE.md'
L = open(SRC, encoding='utf-8').read().split('\n')
LG = ['en', 'fa', 'ar', 'ru', 'ja']
S = {}            # id -> {lang: text}
ENT = {}          # dialogue entry -> [ {who, cls, lines:[id]} ]
warn = []
def put(i, lang, t):
    t = t.strip().replace('\\n', '\n')
    S.setdefault(i, {})[lang] = t
def inline(rest):
    """'en: A   fa: B   ar: C ...' or 'en: A | fa: B | ...' -> dict (may hold only en)"""
    rest = rest.strip()
    m = list(re.finditer(r'(?:^|\s{2,}|\s\|\s)(en|fa|ar|ru|ja):\s', rest))
    if not m: return {}
    out = {}
    for k, x in enumerate(m):
        end = m[k + 1].start() if k + 1 < len(m) else len(rest)
        out[x.group(1)] = rest[x.end():end].strip().rstrip('|').strip()
    return out
sec = 0; cur = None; blocks = None; blk = None; pend = None; zone = None
def startblock(who, cls):
    global blk
    blk = {'who': who, 'cls': cls, 'lines': []}; blocks.append(blk)
i = 0
while i < len(L):
    l = L[i]; i += 1
    m = re.match(r'^## (\d+)\. ', l)
    if m: sec = int(m.group(1)); cur = None; continue
    if sec in (1, 3, 4, 5, 6):
        h = re.match(r'^## ([\w.]+(?: / [\w.]+)*)\s*(.*)$', l)
        if h and not re.match(r'^## \d', l):
            ident, rest = h.group(1), h.group(2)
            pend = None; zone = None; cur = None; blocks = None
            if ident.startswith('zone.'): zone = ident; continue
            if ident.startswith('ui.') or ident == 'cv.go_further' or ident.startswith('intro.'):
                d = inline(rest)
                for k, v in d.items(): put(ident, k, v)
                pend = ident; continue
            if ident in ('goblin.ui', 'goblin.final'): cur = ident; continue
            if ' / ' in ident: continue                       # note_repo_2/3/4: handled by hand
            cur = ident; blocks = ENT.setdefault(ident, [])
            cls = re.search(r'CLS:\s*(\w+)', rest); who = re.search(r'WHO:\s*([\w.]+)', rest)
            rec = re.search(r'\(Record (\w+)', rest)
            cur_cls = cls.group(1) if cls else ('architect' if rec else 'npc')
            if rec: startblock('who.record.' + rec.group(1), 'architect')
            elif who: startblock('who.' + who.group(1), cur_cls)
            continue
        if zone:
            z = re.match(r'^([\w.]+)\s+(en:.*)$', l)
            if z:
                pend = zone + '.' + z.group(1)
                for k, v in inline(z.group(2)).items(): put(pend, k, v)
                continue
        t = re.match(r'^\s*(fa|ar|ru|ja):\s?(.*)$', l)
        if t and pend:
            d = inline(t.group(1) + ': ' + t.group(2))
            for k, v in d.items(): put(pend, k, v)
            continue
        if re.match(r'^(en):\s', l) and pend and pend.startswith('intro.'): put(pend, 'en', l[3:]); continue
        if cur == 'goblin.ui' and l.count('|') == 4:
            c = [x.strip() for x in l.split('|')]
            sid = 'goblin.ui.' + re.sub(r'[^a-z0-9]+', '_', c[0].lower()).strip('_')
            for k, v in zip(LG, c): put(sid, k, v)
            continue
        if cur == 'goblin.final':
            p = re.match(r'^P(\d) (en: .*)$', l)
            if p:
                pend = 'goblin.final.' + p.group(1)
                for k, v in inline(p.group(2)).items(): put(pend, k, v)
            continue
        if cur and blocks is not None:
            b = re.match(r'^#(\d) (?:WHO (\w+)|(silence))(.*)$', l)
            if b:
                if b.group(3): blocks.append({'cls': 'silence', 'lines': []}); blk = None; continue
                who = b.group(2); startblock('who.' + who, 'player' if who == 'you' else 'shyn')
                l = b.group(4).strip()
                if not l: continue
            x = re.match(r'^L(\d+)(?:-L(\d+))?\s+(.*)$', l)
            if x and blk is not None:
                a, bnd, rest = int(x.group(1)), x.group(2), x.group(3)
                multi = len(blocks) > 1 or cur in ('shyn_yield', 'shyn_mercy')
                def lid(n): return f'{cur}.{len(blocks)}.{n}' if multi else f'{cur}.{n}'
                if rest.startswith('= '):
                    blk['lines'].append(rest[2:].strip()); continue
                d = inline(re.sub(r'\s{2,}\((?:all languages|tool names|the same word).*$', '', rest))
                if not d: warn.append(f'{i}: {l[:80]}'); d = {}
                for n in range(a, int(bnd or a) + 1):
                    blk['lines'].append(lid(n))
                    for k, v in d.items(): put(lid(n), k, v)
                pend = lid(int(bnd or a)) if not bnd else None
                continue
# ---- the irregular lines of the file, by hand ----
def same(i, t): S[i] = {g: t for g in LG}
S['note_workshop_3.1'] = {'en': 'Version 0.1', 'fa': 'نسخهٔ ۰٫۱', 'ar': 'الإصدار ٠٫١', 'ru': 'Версия 0.1', 'ja': 'バージョン0.1'}
S['bot_repo.1'] = {'en': 'Version 0.9', 'fa': 'نسخهٔ ۰٫۹', 'ar': 'الإصدار ٠٫٩', 'ru': 'Версия 0.9', 'ja': 'バージョン0.9'}
same('note_catacomb_3.1', '404'); same('cv_cathedral.2', S['cv_cathedral.2']['en'])
same('refactor_repo.4', '...')
ENT['shyn_mercy'][0]['lines'] = ['shyn_yield.1.1']; S.pop('shyn_mercy.1.1', None)
for n, t in ((2, 'TODO'), (3, 'FIXME'), (4, 'WIP')):
    same(f'note_repo_{n}.1', t); ENT[f'note_repo_{n}'] = [{'who': 'who.blueprint', 'cls': 'npc', 'lines': [f'note_repo_{n}.1']}]

# ---- sections 2, 7, 8, 9: tables. ROW[first cell] = the five language cells ----
ROW = {}; ROWS = []
sec = 0
for n, l in enumerate(L):
    m = re.match(r'^## (\d+)\. ', l)
    if m: sec = int(m.group(1))
    if sec in (2, 7, 8, 9) and l.startswith('|') and not l.startswith('|---'):
        c = [x.strip().replace('\\n', '\n') for x in l.strip().strip('|').split('|')]
        if c[0] in ('en', 'slug', 'id', 'en (old key)') : continue
        ROWS.append((sec, n + 1, c))
last = None
for sec, n, c in ROWS:
    if sec == 2:
        if c[0].startswith('record.'):
            for k, (r, fa, ar) in enumerate((('I', 'یک', '١'), ('II', 'دو', '٢'), ('III', 'سه', '٣'), ('IV', 'چهار', '٤'), ('V', 'پنج', '٥'), ('VI', 'شش', '٦'))):
                S['who.record.' + r] = {'en': "The Architect's Record · " + r, 'fa': 'کارنامهٔ معمار · ' + fa, 'ar': 'سجلّ المعمار · ' + ar, 'ru': 'Свиток Зодчего · ' + r, 'ja': '建築家の記録 · ' + r}
        else: S['who.' + c[0]] = dict(zip(LG, c[1:6]))
    elif sec == 8:
        if c[0]: last = c[0]
        S[f'ach.{last}.{c[1]}'] = dict(zip(LG, c[2:7]))
    else:
        cells = c[1:6] if len(c) == 6 else c[0:5]
        if len(cells) < 5: warn.append(f'row {n}: {c[0][:40]}'); continue
        ROW[c[0]] = cells
def slug(t): return re.sub(r'[^a-z0-9]+', '_', t.lower()).strip('_')
def row(i, key, part=None, sep=' / '):
    c = ROW.pop(key) if part is None or part == 'last' else ROW[key]
    if part == 'last': part = -1
    S[i] = {g: (v if part is None else [x.strip() for x in v.split(sep)][part]) for g, v in zip(LG, c)}

exec(open('tools/text-map.py', encoding='utf-8').read())
json.dump({'S': S, 'ENT': ENT, 'OLD': OLD, 'NEW': NEW}, open('art-src/text/parsed.json', 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
miss = [(k, [g for g in LG if not v.get(g)]) for k, v in S.items() if any(not v.get(g) for g in LG)]
print(len(S), 'strings,', len(ENT), 'entries'); print('WARN', warn); print('MISSING', miss)
print('ROWS LEFT', len(ROW)); [print('  ', repr(k)[:90]) for k in ROW]

# =====================================================================================
#  WRITE:  DC (ids only) into src/js/10-content.js,  STR into src/js/61-i18n.js
# =====================================================================================
def js(s): return json.dumps(s, ensure_ascii=False)
GROUPS = [('Forgotten Forge', ['librarian_workshop', 'note_workshop_1', 'note_workshop_2', 'note_workshop_3', 'note_workshop_4']),
          ('Forest of Thorns', ['wanderer_forest', 'note_forest_1', 'note_forest_2', 'note_forest_3']),
          ('Cathedral of Design', ['librarian_cathedral', 'note_cathedral_1', 'note_cathedral_2', 'note_cathedral_3']),
          ('Halls of the Machine Mind', ['candlekeeper', 'note_catacomb_1', 'note_catacomb_2', 'note_catacomb_3']),
          ('Ossuary of Lost Creations', ['bot_repo', 'proto_repo', 'refactor_repo', 'note_repo_1', 'note_repo_2', 'note_repo_3', 'note_repo_4', 'note_repo_5']),
          ('The Final Gate, the Throne, the Sealed Door', ['gate_arena', 'note_arena_1', 'sealed_contact']),
          ('Shyn', ['shyn_first', 'shyn_p1', 'shyn_p2', 'shyn_p3', 'shyn_yield', 'shyn_mercy', 'shyn_after']),
          ("The Architect's Record (one page per zone)", ['cv_workshop', 'cv_forest', 'cv_cathedral', 'cv_catacombs', 'cv_repository', 'cv_arena']),
          ('The Budget Goblin, Chamber 499', ['goblin_intro', 'goblin_coin', 'goblin_wait', 'goblin_zero', 'goblin_accept', 'goblin_after'])]
assert sorted(sum((g[1] for g in GROUPS), [])) == sorted(ENT), set(ENT) ^ set(sum((g[1] for g in GROUPS), []))
out = ['const DC = {']
for title, keys in GROUPS:
    out.append(f'\n  /* ---------------- {title} ---------------- */')
    for k in keys:
        out.append(f'  {k}: [')
        for b in ENT[k]:
            if b['cls'] == 'silence': out.append("    { cls: 'silence', lines: [''] },")
            else: out.append(f"    {{ who: '{b['who']}', cls: '{b['cls']}', lines: [" + ', '.join(f"'{x}'" for x in b['lines']) + '] },')
        out[-1] = out[-1].rstrip(','); out.append('  ],')
out[-1] = '  ]'; out.append('};')
import os
p = os.path.join('src', 'js', '10-content.js')
c = open(p, encoding='utf-8').read()
a, b = c.index('const DC = {'), c.index('\n};', c.index('const DC = {')) + 3
c = c[:a] + '\n'.join(out) + c[b:]
open(p, 'w', encoding='utf-8').write(c)

# every id the dialogue uses must exist
for k, v in ENT.items():
    for blk_ in v:
        for i_ in blk_['lines'] + ([blk_['who']] if 'who' in blk_ else []): assert i_ in S, (k, i_)

ORDER = [('OPENING', ('intro.', 'gate.')), ('SPEAKERS', ('who.',)), ('ZONES', ('zone.',)),
         ('DIALOGUE, INSCRIPTIONS, NOTES', tuple(k + '.' for g in GROUPS[:6] for k in g[1])), ('SHYN', tuple(k + '.' for k in GROUPS[6][1])),
         ("THE ARCHITECT'S RECORD", ('cv',)), ('THE BUDGET GOBLIN', ('goblin',)), ('UI, PROMPTS, PUZZLE, MENU', ('ui.', 'end.')),
         ('ACHIEVEMENTS', ('ach.',)), ('CODEX', ('codex.', 'works.'))]
seen = set(); lines = ['const STR = {']
for g in LG:
    lines.append(f'  {g}: {{')
    for title, pre in ORDER:
        ks = [k for k in S if k.startswith(pre) and (g, k) not in seen]
        if any(q.endswith('_1.') or q.startswith(('shyn_', 'librarian_')) for q in pre) or pre == ('cv',):
            def nat(k): e = max((q for q in pre if k.startswith(q)), key=len); return (pre.index(e) if len(pre) > 1 else k.split('.')[0] != 'cv', [int(x) if x.isdigit() else 0 for x in k[len(e):].split('.')]) if pre != ('cv',) else (k.startswith('cv.'), 0, k) 
            if pre != ('cv',): ks.sort(key=nat)
        if not ks: continue
        lines.append(f'    /* ---- {title} ---- */')
        for k in ks: seen.add((g, k)); lines.append(f'    {js(k)}: {js(S[k][g])},')
    rest = [k for k in S if (g, k) not in seen]; assert not rest, rest
    lines[-1] = lines[-1].rstrip(','); lines.append('  },')
lines[-1] = '  }'; lines.append('};')
p = os.path.join('src', 'js', '61-i18n.js'); c = open(p, encoding='utf-8').read()
a, b = c.index('/* STR:BEGIN */'), c.index('/* STR:END */')
open(p, 'w', encoding='utf-8').write(c[:a] + '/* STR:BEGIN */\n' + '\n'.join(lines) + '\n' + c[b:])
print('wrote DC and STR:', len(S), 'ids x', len(LG), 'languages; new strings:', len(NEW))

# Executed by tools/text-import.py. Gives every table row of the rewrite file an id, and adds the strings the file does not have.
OLD = {}                      # old English literal in the code -> id (used once, to migrate the call sites)
NICE = {'Back to the main résumé': 'ui.back_to_resume', 'Close ✦ Esc': 'ui.close', 'Veyrath · The Rune Architect': 'ui.signature', 'Arrows move · ✦ acts': 'ui.keys_touch', 'A / D move · E acts': 'ui.keys_desktop', 'Pause menu holds the Codex': 'ui.keys_touch_sub', 'Esc opens the Codex': 'ui.keys_desktop_sub', 'Across the ravine, a bridge of leaves remembers its shape.': 'ui.woke.forest', 'A stair of light climbs beside you.': 'ui.woke.cathedral_a', 'Below, the broken floor is whole again.': 'ui.woke.cathedral_b', 'Sleeping stone remembers its shape.': 'ui.woke.default', 'A rune sleeps in the crown of the great tree.': 'ui.hint.forest', 'One rune wakes a stair. The stair leads to the second.': 'ui.hint.cathedral', 'Three runes. Speak them in order: role, context, task.': 'ui.hint.machine', 'The lever on the island switches the branch.': 'ui.hint.repository', 'Find the rune that wakes it.': 'ui.hint.default', 'Chamber 499 — and the Codex will hear you.': 'ui.sealed_door_open_sub', 'The Sealed Door Is Open': 'ui.sealed_door_open', 'Toman off his first salary · at 500 points': 'ui.hud_salary', "Read the Pilgrim's Tablet": 'ui.read_the_pilgrims_tablet', "Read the acolyte's note": 'ui.read_the_acolytes_note', "Read the Architect's record": 'ui.read_the_architects_record', 'One path sleeps. The other wakes.': 'ui.branch_sub', 'The bridge wakes.': 'ui.the_bridge_wakes', 'Order matters. Begin again.': 'ui.order_matters'}
def ui(key, i=None, old=None):
    i = i or NICE.get(key) or 'ui.' + slug(key)[:44].strip('_'); row(i, key); OLD[old or key] = i; return i

# ---- 7.1 prompts, 7.2 puzzle lines: one row, one id ----
for k in list(ROW):
    if k.startswith(('Read', 'Open the secret', 'Wake the rune', 'Switch the branch', 'Speak the rune', 'Speak with the Architect', 'Challenge the', 'Shatter', 'Rune shattered', 'The rune holds')) or k in ('move', 'Attempt'): ui(k)
for k in ('A rune wakes', 'Sleeping stone remembers its shape.', 'Across the ravine, a bridge of leaves remembers its shape.', 'A stair of light climbs beside you.', 'Below, the broken floor is whole again.',
          'The way is asleep', 'Find the rune that wakes it.', 'A rune sleeps in the crown of the great tree.', 'One rune wakes a stair. The stair leads to the second.', 'Three runes. Speak them in order: role, context, task.',
          'The lever on the island switches the branch.', 'The machine understood', 'The bridge wakes.', 'The machine misunderstood', 'Order matters. Begin again.', 'Branch switched', 'Back on the first branch', 'One path sleeps. The other wakes.'): ui(k)
row('zone.forest.obj', 'A rune sleeps / The way is asleep (zone.forest objective)')

# ---- 7.3 HUD, throne, death, menu ----
for k in ('Score', 'Toman off his first salary · at 500 points', 'You returned.', 'Back to the main résumé', 'Codex', 'Close ✦ Esc', 'Veyrath is still', 'Achievements', 'Leave Veyrath', 'Esc — return',
          'Veyrath · The Rune Architect', 'The Sealed Door Is Open', 'Chamber 499 — and the Codex will hear you.', 'Arrows move · ✦ acts', 'A / D move · E acts', 'Pause menu holds the Codex', 'Esc opens the Codex', 'The Salary Ledger'): ui(k)
ui('Seeker Of Talent', 'ui.seeker_of_talent'); ui('Continue Journey', 'ui.pause_continue'); ui('Rotate for the full view', 'ui.rotate')
ui('Play, and earn his discount: reach 500 points and 500,000 Toman comes off his first salary. Below 500, nothing.', 'ui.ledger_promise')
ui('If you want Shyn, the Rune Architect, on your team, you must first defeat him at his own challenge.', 'ui.sign')
k = "Curiosity brought you here.\nLet's see if it brings you back."
row('ui.attempt.1a', k, 0, '\n'); row('ui.attempt.1b', k, 'last', '\n'); OLD['Curiosity brought you here.'] = 'ui.attempt.1a'; OLD["Let's see if it brings you back."] = 'ui.attempt.1b'
k = 'Most stop here.\nThat is why they never learn.'
row('ui.attempt.2a', k, 0, '\n'); row('ui.attempt.2b', k, 'last', '\n'); OLD['Most stop here.'] = 'ui.attempt.2a'; OLD['That is why they never learn.'] = 'ui.attempt.2b'
k = 'Press E to return / Tap to return'
row('ui.press_e_to_return', k, 0); row('ui.tap_to_return', k, 'last'); OLD['Press E to return'] = 'ui.press_e_to_return'; OLD['Tap to return'] = 'ui.tap_to_return'
k = 'Codex tabs: The Architect / Skills / Projects / Experience / Contact'
for n, t in enumerate(('architect', 'skills', 'projects', 'experience')): row('codex.tab.' + t, k, n)
row('codex.tab.contact', k, 'last')
ROW.pop('He is intensely punctual.\nThe bells of this hall keep his hour.')          # this line is not used anywhere in the game

# ---- 9. Codex pages ----
A = {}; cur = None                                                                   # 9.1 is a block per language
for l in L[1084:1122]:
    m = re.match(r'^(en|fa|ar|ru|ja): (.*)$', l)
    if m:
        cur = m.group(1); p = [x.strip() for x in m.group(2).split(' | ')]
        A[cur] = [re.sub(r'^(h2|lead|quote) ', '', x) for x in p]
    elif cur and re.match(r'^\s+(h3|p)\s+', l): A[cur].append(re.sub(r'^\s+(h3|p)\s+', '', l).strip())
for n, i in enumerate(('h2', 'lead', 'quote', 'who_h', 'who_p', 'pillars_h', 'pillars_p', 'why_h', 'why_p')): S['codex.architect.' + i] = {g: A[g][n] for g in LG}
row('codex.skills.h2', 'Disciplines'); row('codex.skills.lead', 'Every skill in this world is a tool he trusts.')
for n, t in enumerate(('advanced', 'proficient')): row('codex.level.' + t, 'advanced / proficient / basic', n)
row('codex.level.basic', 'advanced / proficient / basic', 'last')
for i, k in (('structures', 'Master of Adaptive Structures'), ('discovery', 'Keeper of Discovery'), ('market', 'Herald of the Market'), ('forge', 'Forge Master of Modular Systems'), ('machine', 'Interpreter of Machine Minds'), ('tongues', 'Tongues')): row('codex.skills.' + i, k)
row('codex.skills.theme', 'Theme design / Plugin development', 0); row('codex.skills.plugin', 'Theme design / Plugin development', 'last')
row('codex.skills.prompt', 'Prompt engineering / AI engineering', 0); row('codex.skills.ai', 'Prompt engineering / AI engineering', 'last')
k = 'English / Russian — basic / Japanese — basic'
c = ROW.pop(k); c[4] = c[4].replace('）/', '） /')                                   # the Japanese cell has no space before one slash
for n, i in enumerate(('english', 'russian', 'japanese')): S['codex.skills.' + i] = {g: [x.strip() for x in v.split(' / ')][n] for g, v in zip(LG, c)}
row('codex.projects.h2', 'Recovered Artifacts'); row('codex.projects.lead', 'Six websites, still standing. Each name is a door.'); row('codex.projects.note_h', 'Field note'); row('codex.projects.note_p', 'Each artifact was built to be used — not to be admired.')
for i, k in (('sport', 'Sportswear store'), ('group', 'Digital marketing group'), ('tools', 'Tool store'), ('design_seo', 'Web design · SEO'), ('design', 'Web design'), ('design_admin', 'Web design · Site admin')): row('works.' + i, k)
row('codex.experience.h2', 'The Long Build')
for i, k in (('date1', 'Sep 2023 – May 2025'), ('date2', 'Feb 2022 – Oct 2023'), ('date3', 'Mar 2022 – Oct 2023'), ('role1', 'Head of Digital Marketing · Content Specialist · Web Designer'), ('role2', 'Head of Web Design · SEO Consultant'), ('role3', 'SEO Consultant · Website Admin'),
             ('method_h', 'Method'), ('method_p', 'Prototype → break → rebuild → ship. Repeat until finished.'), ('seek_h', 'What he is looking for'), ('seek_p', 'A team that measures persistence, not only skill — because skills can be taught.')): row('codex.experience.' + i, k)
ROW.pop('The Architect completed fewer projects than he imagined.<br>But more than he remembers.')   # = note_repo_5.1 + note_repo_5.2
row('codex.contact.h2', 'Request An Audience'); row('codex.contact.quote', 'You have crossed the world.<br>You have earned the right to speak.')
k = 'Telegram / Email / Phone / Full résumé'
for n, i in enumerate(('telegram', 'email', 'phone')): row('codex.contact.' + i, k, n)
row('codex.contact.resume', k, 'last')
for i, k in (('or', 'Or leave your message here'), ('who', 'Who seeks the Architect?'), ('who_ph', 'Your name'), ('company', 'Company / Guild'), ('company_ph', 'Where you build'), ('msg', 'Message'), ('msg_ph', 'What should be built?'), ('send', 'Summon ✦'),
             ('locked_lead', 'This page has not been earned yet.'), ('locked_quote', 'The Architect does not read letters from strangers.<br>He reads the ones who reached the Throne.'), ('road', 'The only road'),
             ('locked_p', 'There is no form below. There is no shortcut. That is not a bug: <em>the only way to reach him is to stand before him.</em>')): row('codex.contact.' + i, k)
for n, k in enumerate(('Step 1 — Cross the Forge, the Forest, the Cathedral, the Machine Halls.', 'Step 2 — Walk the Ossuary of Lost Creations. All of it.', 'Step 3 — Enter the Throne. Prove that you are serious.', 'Step 4 — Then, and only then, this page opens.'), 1):
    c = ROW.pop(k); sp = [re.split(r'\s*(?:—|──)\s*', v, 1) for v in c]; S[f'codex.contact.step{n}'] = {g: v[0] for g, v in zip(LG, sp)}; S[f'codex.contact.step{n}_p'] = {g: v[1] for g, v in zip(LG, sp)}

# ---- corrections to the file (listed in REPORT.md) ----
# 1. Persian company names: the owner's standing rule is «مبلمان فرست» and «آیدبکس» in Persian, never Latin letters.
S['cv_repository.1']['fa'] = S['cv_repository.1']['fa'].replace('Farset Mobalan Group', 'مبلمان فرست')
S['cv_repository.2']['fa'] = S['cv_repository.2']['fa'].replace('Aidbax Digital Marketing Group', 'گروهِ دیجیتال مارکتینگِ آیدبکس')
S['cv_repository.3']['fa'] = S['cv_repository.3']['fa'].replace('Pooyan Sport', 'پویان اسپرت')
# 2. One Persian line of the file starts with the Arabic word «لا»; written in Persian instead.
S['codex.contact.locked_p']['fa'] = S['codex.contact.locked_p']['fa'].replace('لا فرمی در کار است. و راه‌میانبری نیست.', 'هیچ فرمی در کار نیست. و راه‌میانبری نیست.')

# 3. Japanese: the file draws its long dash with a box-drawing line (U+2500), which serif fonts do not carry; the horizontal bar (U+2015) is the standard character.
for k in S: S[k]['ja'] = S[k]['ja'].replace('─', '―')

# ---- NEW STRINGS: used by the game, absent from the file. Written in the same voice. ----
def new(i, en, fa, ar, ru, ja): S[i] = dict(zip(LG, (en, fa, ar, ru, ja))); NEW.append(i)
NEW = []
new('ui.speak_with', 'Speak with {0}', 'گفت‌وگو با {0}', 'تحدّث إلى: {0}', 'Говорить: {0}', '{0}と話す')
new('ui.enter', 'Enter {0}', 'ورود به {0}', 'ادخل: {0}', 'Войти: {0}', '{0}へ入る')
new('zone.chamber.obj.coin', S['goblin.ui.one_coin_one_point_it_is_yours']['en'], *[S['goblin.ui.one_coin_one_point_it_is_yours'][g] for g in LG[1:]]); NEW.pop()
new('zone.chamber.obj.zero', 'The ledger reads zero.', 'دفتر صفر را نشان می‌دهد.', 'الدفتر يقرأ صفرًا.', 'В книге — ноль.', '帳簿は零を示している。')
new('intro.remembers', 'The forge remembers you, {0}.', 'کارگاه تو را به یاد دارد، {0}.', 'المِسبَك يذكرك يا {0}.', 'Кузня помнит тебя, {0}.', '鍛冶場は汝を覚えている、{0}。')
new('gate.sound', 'Best with sound', 'با صدا، تجربه‌ای دیگر است', 'الأفضل مع الصوت', 'Лучше со звуком', '音を出してどうぞ')
new('ach.page.lead', 'Proof that you walked here.', 'گواهِ آنکه اینجا گام زدی.', 'برهانُ أنك مررتَ من هنا.', 'Свидетельство того, что ты здесь прошёл.', '汝がここを歩いた証。')
new('ach.page.undiscovered', 'Undiscovered', 'هنوز نایافته', 'لم يُكتشف بعد', 'Не открыто', '未発見')
new('ach.page.tally_h', 'The tally', 'شمار', 'الحصيلة', 'Счёт', '集計')
new('ach.page.tally', '{0} of {1} recovered · Score {2} · Attempts {3} · Inscriptions {4} / {5}', '{0} از {1} بازیافته · امتیاز {2} · تلاش {3} · کتیبه {4} / {5}', 'استُعيد {0} من {1} · النقاط {2} · المحاولات {3} · النقوش {4} / {5}', 'Найдено {0} из {1} · Счёт {2} · Попыток {3} · Надписей {4} / {5}', '{1}のうち{0}を回収 · スコア {2} · 挑戦 {3} · 銘 {4} / {5}')
new('ach.page.memory_h', 'The memory', 'حافظه', 'الذاكرة', 'Память', '記憶')
new('ach.page.memory', 'Veyrath remembers this browser only.', 'وِیرَث تنها همین مرورگر را به یاد دارد.', 'فيرَث لا تذكر إلا هذا المتصفّح.', 'Вейрат помнит только этот браузер.', 'ヴェイラスが覚えているのは、このブラウザだけ。')
new('ach.page.forget', 'Forget me', 'فراموشم کن', 'انسَني', 'Забудь меня', '我を忘れよ')
new('ach.page.forget_ask', 'Erase the memory of Veyrath?', 'حافظهٔ وِیرَث پاک شود؟', 'أتُمحى ذاكرة فيرَث؟', 'Стереть память Вейрата?', 'ヴェイラスの記憶を消しますか？')
new('ach.secret.caption', 'Hidden achievement · {0} deaths', 'دستاورد پنهان · {0} بار مردن', 'إنجازٌ خفيّ · {0} مرّة موت', 'Скрытое достижение · {0} смертей', '隠し実績 · 死亡{0}回'); NEW.pop()
new('ach.secret.row', '{0} deaths. Still here.', '{0} بار مردی. هنوز اینجایی.', '{0} مرّة موت. وما زلتَ هنا.', 'Смертей: {0}. Ты всё ещё здесь.', '死亡{0}回。それでも、まだここにいる。')
new('codex.experience.co1', 'Farset Mobalan Group', 'مبلمان فرست', 'Farset Mobalan Group', 'Farset Mobalan Group', 'Farset Mobalan Group'); NEW.pop()
new('codex.experience.co2', 'Aidbax Digital Marketing Group', 'گروهِ دیجیتال مارکتینگِ آیدبکس', 'Aidbax Digital Marketing Group', 'Aidbax Digital Marketing Group', 'Aidbax Digital Marketing Group'); NEW.pop()
new('codex.experience.co3', 'Pooyan Sport', 'پویان اسپرت', 'Pooyan Sport', 'Pooyan Sport', 'Pooyan Sport'); NEW.pop()
new('codex.keys.chapter', 'chapter', 'فصل', 'الفصل', 'глава', '章')
new('codex.keys.scroll', 'scroll', 'پیمایش', 'تمرير', 'прокрутка', 'スクロール')
new('codex.skills.dm', 'Digital Marketing', 'دیجیتال مارکتینگ', 'التسويق الرقمي', 'Цифровой маркетинг', 'デジタルマーケティング')
new('codex.sent.stranger', 'A stranger', 'ناشناسی', 'غريب', 'Незнакомец', '名もなき者')
new('codex.sent.title', 'Summoned.', 'فراخوانده شد.', 'تمّ الاستدعاء.', 'Призван.', '召喚された。')
new('codex.sent.answer', '{0} — the Architect will answer.', '{0} — معمار پاسخ خواهد داد.', '{0} — سيجيب المعمار.', '{0} — Зодчий ответит.', '{0}――建築家は応えるだろう。')
new('codex.sent.copied', 'Your message was copied to the clipboard. Paste it in Telegram.', 'پیامت رونوشت شد. آن را در تلگرام بچسبان.', 'نُسخت رسالتك. ألصقها في تيليغرام.', 'Послание скопировано. Вставь его в Telegram.', '言葉は写し取られた。Telegramに貼り付けよ。')
new('codex.sent.opened', 'Telegram opened in a new tab. Send your message there.', 'تلگرام در زبانه‌ای تازه گشوده شد. پیامت را همان‌جا بفرست.', 'فُتح تيليغرام في تبويبٍ جديد. أرسل رسالتك هناك.', 'Telegram открыт в новой вкладке. Отправь послание там.', 'Telegramを新しいタブで開いた。そこで言葉を送れ。')
new('codex.sent.open', 'Open Telegram ✦', 'گشودنِ تلگرام ✦', 'افتح تيليغرام ✦', 'Открыть Telegram ✦', 'Telegramを開く ✦')
new('end.1', 'The purpose was never to defeat me.', 'مقصود هرگز شکست دادنِ من نبود.', 'لم تكن الغاية يومًا أن تهزمني.', 'Цель никогда не была в том, чтобы одолеть меня.', '我を倒すことが、目的ではなかった。')
new('end.2', 'It was to understand what I build.', 'مقصود، فهمیدنِ آن چیزی بود که می‌سازم.', 'بل أن تفهم ما أبنيه.', 'Она была в том, чтобы понять, что я строю.', '我が築くものを、理解することだった。')
new('end.return', 'Return to Veyrath', 'بازگشت به وِیرَث', 'عُد إلى فيرَث', 'Вернуться в Вейрат', 'ヴェイラスへ戻る')
new('ui.leave_ask', 'Leave the game and open the main résumé? Your progress is saved.', 'از بازی خارج می‌شوی و رزومهٔ اصلی باز می‌شود. پیشرفتت ذخیره شده است.', 'ستغادر اللعبة وتُفتح السيرة الذاتية الرئيسية. تقدّمك محفوظ.', 'Выйти из игры и открыть основное резюме? Прогресс сохранён.', 'ゲームを離れ、履歴書の本編を開きますか？ 進行は保存されています。')
new('ui.fullscreen', 'Fullscreen', 'تمام‌صفحه', 'ملء الشاشة', 'Во весь экран', '全画面')
new('ui.sound', 'Sound (M)', 'صدا (M)', 'الصوت (M)', 'Звук (M)', '音 (M)')
new('ui.menu', 'Menu (Esc)', 'منو (Esc)', 'القائمة (Esc)', 'Меню (Esc)', 'メニュー (Esc)')
new('ui.language', 'Language', 'زبان', 'اللغة', 'Язык', '言語')
new('ui.shatter', 'shatter', 'شکستن', 'حطِّم', 'разбить', '砕く')

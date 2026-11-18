# Rune Architect / Veyrath — Full Text Rewrite (EN · FA · AR · RU · JA)

> یادداشت برای شایان: این فایل را کامل به ایجنت برنامه‌نویستان بده. همهٔ متن‌های بازی با لحن «بلسفمس» بازنویسی شده (تاریک، مذهبی‌-گوتیک، توبه و گناه و معجزه). فقط گابلین آخر بازی طنز است. زبان‌ها: انگلیسی، فارسی، عربی، روسی، ژاپنی. هر متن مشخص کرده کجای بازی است.

---

## 0. INSTRUCTIONS FOR THE CODING AGENT (read first)

**Goal.** Replace every player-facing string with the text in this file and add 3 new languages (Arabic `ar`, Russian `ru`, Japanese `ja`) next to the existing English `en` and Persian `fa`. Do NOT change gameplay, maps, collisions, scoring, save format or the contact data.

**How text is stored today (so you know what to touch):**
- `src/js/10-content.js` → `const DC = { id: [ { who, cls, lines:[...] } ] }` is the English dialogue. Also `CODEX` (résumé pages), `ACHIEVEMENTS`, `WORKS`, `CONTACT_FORM`/`CONTACT_LINKS` labels.
- `src/js/61-i18n.js` → `const FA = { 'English line': 'خط فارسی' }` (the **English text is the key**), `CODEX_FA`, `LANG`, `tr()`, `I18N`, `setLang()`.
- Zone names/sub/objective/props labels → `src/js/49-zones.js`, `50-zones.js`, `52-zone-extras.js`, `53-sign.js`; goblin scene → `63-goblin.js`; HUD/menus/intro → `65-shell.js`, `70-main.js`, `60-game.js`, `62-secret.js`, `src/legacy-dom.html`.
- Intro narration audio: `art-src/audio/intro_N.mp3` + `05-vo.js` (see §0.6).

**Because English is the key, changing English breaks Persian lookups.** Do this properly:
1. **Migrate to ID-keyed strings.** Create `src/js/61-i18n.js` as `const STR = { en:{...}, fa:{...}, ar:{...}, ru:{...}, ja:{...} }` keyed by the IDs used in this file (e.g. `librarian_workshop.1`, `ui.begin`, `zone.workshop.name`). `tr(id)` returns `STR[lang][id]`, falls back to `en`.
2. Dialogue entries keep their DC id (`shyn_first`, `goblin_intro`…). Line N of an entry = `id.N`. Speaker = `id.who` (or `who.<slug>` where shared, see §2).
3. Run `node tools/strings.mjs` after the migration; it must list **zero** missing strings for all 5 languages. Extend it to take a `lang` argument.
4. Keep `\n` inside a line as a **hard line break** (it is shown as `\n` in this file). Do not re-wrap lines. Keep every line ≤ ~38 chars per visual line for the dialogue box; if a language overflows, wrap with `\n` at a natural pause, never mid-word.

**0.1 Languages & layout**
- `fa` and `ar` are **RTL**: set `dir="rtl"` on the game root and dialogue box (the Persian path already does; reuse it for `ar`). Numbers/handles/URLs/emails/phone stay LTR (`dir="ltr"`, already done via `data-noi18n`).
- Fonts: Arabic → Noto Naskh Arabic / Amiri; Persian → current font; Russian → a Cyrillic-capable pixel/serif font (the current display font may lack Cyrillic — test); Japanese → Noto Serif JP / DotGothic16. Embed or inline subset; **no external requests** (the build must stay one self-contained HTML).
- Language button: cycle/choose `EN · فا · ع · РУ · 日`. Save the choice in the existing save object.
- Japanese: no spaces; the typewriter effect must reveal per character. Arabic: do NOT reveal per character with letter-spacing/joining broken — reveal per grapheme/word so letters stay joined.

**0.2 Do NOT translate / do NOT change**
`Shayan Mirkhani`, `Shyn` (fa شایان, ar شايان, ru Шайн, ja シャイン), `Veyrath` (fa وِیرَث, ar فيرَث, ru Вейрат, ja ヴェイラス), `ROOTKEY`, `WordPress`, `Elementor`, `HTML`, `CSS`, `SEO`, `Schema`, `Google Ads`, `Google Search Console`, `Moz`, `Screaming Frog`, company names, website addresses, `TODO / FIXME / WIP / 404 / Version 0.1`, contact info, `CONTACT` object, years, "500 points / 500,000 Toman" numbers. Résumé **facts** must never change — only the voice.

**0.3 Tone guide (Blasphemous)**
Gothic, penitent, liturgical, grim and beautiful: guilt, penance, miracles, thorns, relics, censers, ossuaries, altars, vows, absolution. Short heavy sentences. Never jokey — **except the Budget Goblin (§6), who is the only comic voice** (dry, petty, accountant-with-a-halo). The Recruiter is addressed as a penitent pilgrim. Keep every message understandable to a recruiter on first read: atmosphere on top, meaning intact. Where English was literal, meaning may be bent slightly for the mood — the *point* of each line is preserved.

**0.4 Glossary (use consistently in all 5 languages)**
| EN | FA | AR | RU | JA |
|---|---|---|---|---|
| Recruiter | جوینده / ای جوینده | الباحث | Искатель | 求める者 |
| Penitent (pilgrim) | زائرِ توبه‌کار | التائب | Кающийся | 悔悟者 |
| Architect | معمار | المعمار | Зодчий | 建築家 |
| Rune | رون | الرونية | Руна | ルーン |
| Throne | سریر | العرش | Трон | 玉座 |
| Codex | کدکس | المخطوط | Кодекс | 写本 |
| Persistence / Resolve | پایداری / عزم | الثبات / العزم | Стойкость / Воля | 不屈 / 決意 |
| Mercy | رحمت | الرحمة | Милость | 慈悲 |

**0.5 Entry format used below**
```
## <id>
WHERE: <where/when it appears> | CLS: <npc|architect|shyn|player|silence>
WHO:   en | fa | ar | ru | ja            (speaker name)
L1  en: ...        (L1, L2… = the lines/pages in order; "\n" = line break)
    fa: ...
    ar: ...
    ru: ...
    ja: ...
```
Entries with several speakers have `WHO#1`, `WHO#2`… and `L#1.1` style numbering — each block is a separate `{who, lines}` object in order. `cls:'silence'` entries are an empty beat — keep them, no text.

**0.6 Intro narration audio (important).** The 7 intro lines are *spoken* by pre-rendered MP3s (`art-src/audio/intro_N.mp3`, built by `tools/vo.mjs`, embedded in `05-vo.js`). If you change the English intro, **those audio files no longer match.** Options: (a) regenerate English audio from the new text with the same TTS pipeline; (b) for new languages ship **no** narration (text only) and play the English audio only when `lang==='en'`; (c) mute narration for non-en. Pick (b) and tell Shayan. The audio is not translated — only the text.

**0.7 Acceptance checklist.** All 5 languages selectable and persisted · RTL correct in fa/ar · no tofu glyphs in any language · every dialogue/UI/zone/achievement/codex/goblin string comes from `STR` · English fallback works · `tools/strings.mjs` reports nothing missing · résumé facts & contact data unchanged · the achievement at 30 deaths (`62-secret.js`) shows its title in the current language (see §8).

---

## 1. OPENING / TITLE SCREEN  (`65-shell.js`, `70-main.js`; intro lines = 7 pages, one at a time)

```
## intro.1   WHERE: first screen, line 1 of 7 (narrator voice in en only)
en: In a land where knowledge was made a privilege...
fa: در سرزمینی که دانایی، امتیازِ برگزیدگان شد...
ar: في أرضٍ صارت فيها المعرفة امتيازًا...
ru: В краю, где знание стало привилегией...
ja: 知が特権と成り果てた地にて……

## intro.2   WHERE: line 2
en: One architect knelt to no one.
fa: معماری بود که برابرِ هیچ‌کس زانو نزد.
ar: معماريٌّ واحد أبى أن يركع.
ru: Один зодчий не преклонил колен.
ja: ひとりの建築家だけが、膝を折らなかった。

## intro.3   WHERE: line 3
en: They entombed knowledge beneath ruins.
fa: دانایی را در گورِ ویرانه‌ها نهادند.
ar: دفنوا المعرفة تحت الأنقاض.
ru: Знание погребли под руинами.
ja: 知は廃墟の下に葬られた。

## intro.4   WHERE: line 4
en: They chained power to bloodlines.
fa: و قدرت را به زنجیرِ تبار بستند.
ar: وقيّدوا السلطة بسلاسل الأنساب.
ru: Власть заковали в цепи родовой крови.
ja: 力は血統の鎖に繋がれた。

## intro.5   WHERE: line 5
en: Yet one builder kept searching in the dark.
fa: اما سازنده‌ای در تاریکی از جُستن باز نایستاد.
ar: غير أن بنّاءً ظلّ يبحث في العتمة.
ru: Но один строитель продолжал искать во тьме.
ja: だが一人の造り手は、闇の中で探し続けた。

## intro.6   WHERE: line 6
en: His name was lost to ash.
fa: نامش در خاکستر گم شد.
ar: ضاع اسمه في الرماد.
ru: Имя его стало пеплом.
ja: その名は灰となった。

## intro.7   WHERE: line 7
en: His work endures.
fa: کارش ماند.
ar: وبقي عمله.
ru: Но дело его живёт.
ja: されど、その仕事は遺る。

## intro.return   WHERE: shown when a save exists (old key "You came back.")
en: You have returned, penitent.
fa: بازگشتی، ای توبه‌کار.
ar: عدتَ أيها التائب.
ru: Ты вернулся, кающийся.
ja: 戻ったか、悔悟者よ。

## intro.name_prompt   WHERE: name input label (old "Enter your name, Recruiter.")
en: Speak your name, Recruiter.
fa: نامت را بر زبان آر، ای جوینده.
ar: انطق باسمك أيها الباحث.
ru: Назови своё имя, Искатель.
ja: 名を告げよ、求める者。

## ui.begin            en: Begin             | fa: آغاز            | ar: ابدأ            | ru: Начать            | ja: 始める
## ui.continue         en: Resume the pilgrimage | fa: ادامهٔ زیارت | ar: تابع المسير | ru: Продолжить паломничество | ja: 巡礼を続ける
## ui.begin_anew       en: Begin anew        | fa: آغازی دوباره   | ar: ابدأ من جديد    | ru: Начать заново     | ja: 最初から
```

---

## 2. SPEAKER NAMES  (`who` field; shared across entries — define once as `who.<slug>`)

| slug | en | fa | ar | ru | ja |
|---|---|---|---|---|---|
| librarian | The Blind Librarian | کتابدارِ نابینا | أمين المكتبة الأعمى | Слепой Библиотекарь | 盲目の司書 |
| wall | Litany on the Wall | وردِ دیوار | ترتيلة الجدار | Литания на стене | 壁の連祷 |
| scratched | Scratched in the Stone | خراشیده بر سنگ | محفورٌ في الحجر | Выцарапано на камне | 石に刻まれた爪痕 |
| hidden | Hidden Scratches | خراش‌های نهان | خدوشٌ خفية | Тайные царапины | 隠された引っかき傷 |
| pilgrim_tablet | The Pilgrim's Tablet | لوحِ زائر | لوح الحاج | Скрижаль паломника | 巡礼者の石板 |
| wanderer | Wanderer of the Canopy | آوارهٔ سایه‌سار | هائمُ الظلال | Скиталец полога | 樹冠の放浪者 |
| bark | Words in the Bark | نوشتهٔ پوستِ درخت | كلماتٌ في اللحاء | Слова на коре | 樹皮の言葉 |
| overgrown | Moss-Choked Sign | نشانِ خزه‌گرفته | لافتةٌ خنقها الطحلب | Заросший знак | 苔に埋もれた標 |
| root | Carved Root | ریشهٔ تراشیده | جذرٌ منحوت | Резной корень | 刻まれた根 |
| great_tablet | The Great Tablet | لوحِ بزرگ | اللوح العظيم | Великая скрижаль | 大石板 |
| fresco | Fresco Fragment | پاره‌ای از دیوارنگاره | شظيةُ جدارية | Обломок фрески | 壁画の断片 |
| acolyte | The Acolyte's Note | یادداشتِ شاگرد | رسالة المساعد | Записка послушника | 侍者の覚え書き |
| prompt_keeper | The Keeper of Questions | نگهبانِ پرسش‌ها | حارسُ الأسئلة | Хранитель Вопросов | 問いの守り手 |
| glyph | Glyph on the Conduit | نقشِ روی مجرا | رمزٌ على القناة | Знак на проводе | 導管の刻印 |
| engine_wall | The Engine Wall | دیوارِ موتور | جدار المحرّك | Стена двигателя | 機関の壁 |
| secret_panel | Secret Panel | دریچهٔ نهان | لوحةٌ سرّية | Тайная панель | 隠し板 |
| bot | The Forgotten Automaton | رباتِ ازیادرفته | الآليّ المنسيّ | Забытый автомат | 忘れられた自動人形 |
| prototype | Sleeping Prototype | نمونهٔ خفته | النموذج النائم | Спящий прототип | 眠れる試作体 |
| refactor | The Endless Refactor | بازنویسیِ بی‌پایان | إعادة الصياغة التي لا تنتهي | Бесконечный рефакторинг | 終わりなき改稿 |
| chalk | Chalk on Stone | گچ بر سنگ | طباشير على حجر | Мел на камне | 石の白墨 |
| blueprint | Blueprint Fragment | پاره‌ای از نقشه | شظيةُ مخطّط | Клочок чертежа | 設計図の断片 |
| archive_wall | The Archive Wall | دیوارِ بایگانی | جدار الأرشيف | Стена архива | 記録の壁 |
| final_gate | The Final Gate | دروازهٔ واپسین | البوابة الأخيرة | Последние врата | 最後の門 |
| throne_insc | Throne Inscription | کتیبهٔ سریر | نقش العرش | Надпись на троне | 玉座の銘 |
| sealed_door | The Sealed Door | درِ مُهرشده | الباب المختوم | Запечатанная дверь | 封印の扉 |
| shyn_full | Shyn, the Rune Architect | شایان، معمارِ رون | شايان، معمار الرونات | Шайн, Зодчий Рун | ルーンの建築家、シャイン |
| shyn | Shyn | شایان | شايان | Шайн | シャイン |
| you | You | تو | أنت | Ты | あなた |
| goblin | The Budget Goblin | گابلینِ بودجه | عفريت الميزانية | Гоблин Бюджета | 予算ゴブリン |
| record.I … record.VI | The Architect's Record · I … VI | کارنامهٔ معمار · یک … شش | سجلّ المعمار · ١ … ٦ | Свиток Зодчего · I … VI | 建築家の記録 · I … VI |

---

## 3. ZONES  (`49-zones.js`, `50-zones.js`; shown on the zone-title card and HUD)

```
## zone.workshop      WHERE: zone 1 title card, HUD name, sub-line, objective
name  en: The Forgotten Forge | fa: کارگاهِ فراموش‌شده | ar: المِسبَك المنسيّ | ru: Забытая Кузня | ja: 忘れられた鍛冶場
short en: Forgotten Forge     | fa: کارگاه | ar: المِسبَك | ru: Кузня | ja: 鍛冶場
sub   en: Where the Architect was hammered into being, among tools and ash
      fa: جایی که معمار میانِ ابزار و خاکستر، شکل گرفت
      ar: حيث طُرق المعمار على السندان بين الأدوات والرماد
      ru: Здесь Зодчего выковали среди инструментов и пепла
      ja: 道具と灰のあいだで、建築家が鍛え上げられた場所
obj   en: Only the Throne grants an audience with the Architect.
      fa: تنها سریر، دیدار با معمار را روا می‌دارد.
      ar: وحده العرش يمنح مقابلة المعمار.
      ru: Лишь Трон дарует встречу с Зодчим.
      ja: 建築家に謁見できるのは、玉座のみ。

## zone.forest
name  en: Forest of Thorns · Frontend | fa: جنگلِ خارها · فرانت‌اند | ar: غابة الأشواك · الواجهة | ru: Лес Терний · Frontend | ja: 荊の森・フロントエンド
short en: Forest | fa: جنگل | ar: الغابة | ru: Лес | ja: 森
sub   en: Where structure grew thorns, and became nature
      fa: جایی که ساختار، خار رویاند و طبیعت شد
      ar: حيث أنبتت البنية أشواكها وصارت طبيعة
      ru: Здесь структура обросла шипами и стала природой
      ja: 構造が棘を生やし、自然となった場所

## zone.cathedral
name  en: Cathedral of Design | fa: کلیسای جامعِ طراحی | ar: كاتدرائية التصميم | ru: Собор Дизайна | ja: 意匠の大聖堂
short en: Cathedral | fa: کلیسا | ar: الكاتدرائية | ru: Собор | ja: 大聖堂
sub   en: Beauty without purpose is only ornament upon a tomb
      fa: زیبایی بی‌غایت، جز زیورِ سنگ‌گور نیست
      ar: جمالٌ بلا غاية ليس إلا زينةً على قبر
      ru: Красота без цели — лишь украшение на гробнице
      ja: 目的なき美は、墓に飾る装いにすぎない

## zone.machine   (internal id 'catacombs')
name  en: Halls of the Machine Mind | fa: تالارهای ذهنِ ماشین | ar: أروقة عقل الآلة | ru: Залы Машинного Разума | ja: 機械の精神の回廊
short en: Machine Halls | fa: تالارها | ar: الأروقة | ru: Залы | ja: 回廊
sub   en: Where a sentence becomes a commandment
      fa: جایی که یک جمله، فرمان می‌شود
      ar: حيث تصير الجملة وصيّة
      ru: Здесь фраза становится заповедью
      ja: 一文が戒律となる場所

## zone.repository
name  en: Ossuary of Lost Creations | fa: استودانِ آفریده‌های گم‌شده | ar: عظامية المخلوقات الضائعة | ru: Оссуарий Утраченных Творений | ja: 失われた創造の納骨堂
short en: Ossuary | fa: استودان | ar: العظامية | ru: Оссуарий | ja: 納骨堂
sub   en: The charnel house of unfinished ambition
      fa: گورخانهٔ جاه‌طلبی‌های ناتمام
      ar: مقبرةُ الطموحات التي لم تكتمل
      ru: Усыпальница незавершённых замыслов
      ja: 果たされなかった野心の墓所
obj   en: Beyond the archive waits the Throne.
      fa: آن‌سوی بایگانی، سریر انتظار می‌کشد.
      ar: وراء الأرشيف ينتظر العرش.
      ru: За архивом ждёт Трон.
      ja: 記録の彼方に、玉座が待つ。

## zone.throne
name  en: Throne of the Rune Architect | fa: سریرِ معمارِ رون | ar: عرش معمار الرونات | ru: Трон Зодчего Рун | ja: ルーンの建築家の玉座
short en: Throne | fa: سریر | ar: العرش | ru: Трон | ja: 玉座
sub   en: Ancient craft and sorcery, wed in one flesh
      fa: صنعتِ کهن و جادو، پیوسته در یک تن
      ar: صنعةٌ قديمة وسحر، متّحدان في جسدٍ واحد
      ru: Древнее ремесло и чародейство, слитые воедино
      ja: 古き技と魔術が、ひとつの肉に結ばれた
obj.fight en: He answers no letters. Break the rune, then choose mercy.
      fa: او به نامه پاسخ نمی‌دهد. رون را بشکن، آنگاه رحمت را برگزین.
      ar: لا يردّ على الرسائل. حطّم الرونية، ثم اخترِ الرحمة.
      ru: Он не отвечает на письма. Разбей руну — и выбери милость.
      ja: 彼は手紙に答えない。ルーンを砕き、そして慈悲を選べ。
obj.after en: The throne is quiet. The sealed door stands open — east.
      fa: سریر خاموش است. درِ مُهرشده گشوده است — به سوی خاور.
      ar: العرش صامت. والباب المختوم مفتوح — نحو الشرق.
      ru: Трон безмолвен. Запечатанная дверь отворена — на восток.
      ja: 玉座は静まり返っている。封印の扉が開いた──東へ。
boss.name en: Shyn — Keeper of the Root Code | fa: شایان — نگهبانِ کُدِ ریشه | ar: شايان — حارس الشفرة الجذرية | ru: Шайн — Хранитель Корневого Кода | ja: シャイン──根源コードの守護者

## zone.chamber
name  en: Chamber 499 | fa: تالار ۴۹۹ | ar: الحجرة ٤٩٩ | ru: Палата 499 | ja: 第四九九の間
sub   en: The Ledger Chamber · Salary Negotiation | fa: تالارِ دفتر حساب · چانه‌زنیِ حقوق | ar: حجرة الدفتر · مفاوضة الراتب | ru: Палата Бухгалтерской Книги · Торг о жалованье | ja: 帳簿の間・給与交渉
obj   en: The numbers must balance. | fa: ارقام باید تراز شوند. | ar: لا بدّ أن تتوازن الأرقام. | ru: Цифры должны сойтись. | ja: 数字は釣り合わねばならぬ。
```

---

## 4. NPC DIALOGUE, WALL INSCRIPTIONS & NOTES  (`DC` in `10-content.js`; each block = one `{who, cls, lines}`)
Interaction prompt strings ("Read the wall", "Press E…") are in §7.

### 4.1 Forgotten Forge
```
## librarian_workshop   WHERE: Forge, the Librarian NPC near the entrance | CLS: npc | WHO: librarian
L1 en: Welcome, penitent, to the Forgotten Forge.
   fa: خوش آمدی، ای توبه‌کار، به کارگاهِ فراموش‌شده.
   ar: مرحبًا بك أيها التائب في المِسبَك المنسيّ.
   ru: Добро пожаловать, кающийся, в Забытую Кузню.
   ja: ようこそ、悔悟者よ。忘れられた鍛冶場へ。
L2 en: Many kneel to those who rule.\nFew remember those who build.
   fa: بسیارند که برابرِ فرمانروایان زانو می‌زنند.\nاندکند که سازندگان را به یاد دارند.
   ar: كثيرون يركعون للحاكمين.\nوقليلون يذكرون البنّائين.
   ru: Многие преклоняются перед владыками.\nНемногие помнят созидателей.
   ja: 多くは支配者にひざまずく。\n造る者を覚えている者は少ない。
L3 en: The Architect was not born in a palace.\nHe rose from the anvil, through ash.
   fa: معمار در کاخ زاده نشد.\nاز سندان برخاست، از میانِ خاکستر.
   ar: لم يُولد المعمار في قصر.\nبل نهض من السندان، عبر الرماد.
   ru: Зодчий родился не во дворце.\nОн поднялся от наковальни, сквозь пепел.
   ja: 建築家は宮殿に生まれなかった。\n金床から、灰を越えて立ち上がった。

## note_workshop_1   WHERE: Forge, wall inscription 1 | CLS: npc | WHO: wall
L1 en: Every masterpiece is born\nas a broken offering.
   fa: هر شاهکار\nقربانیِ شکسته‌ای آغاز می‌شود.
   ar: كل تحفةٍ تبدأ\nقربانًا مكسورًا.
   ru: Всякий шедевр рождается\nсломанным подношением.
   ja: あらゆる傑作は\n砕けた供物として生まれる。
L2 en: BUILD.  FAIL.  REBUILD.
   fa: بساز.  بشکن.  از نو بساز.
   ar: ابنِ.  اخفق.  أعد البناء.
   ru: СТРОЙ.  ПАДАЙ.  СТРОЙ СНОВА.
   ja: 築け。  砕けよ。  また築け。

## note_workshop_2   WHERE: Forge, scratched stone | CLS: npc | WHO: scratched
L1 en: BUILD.\nFAIL.\nREBUILD.
   fa: بساز.\nبشکن.\nاز نو بساز.
   ar: ابنِ.\nاخفق.\nأعد البناء.
   ru: СТРОЙ.\nПАДАЙ.\nСТРОЙ СНОВА.
   ja: 築け。\n砕けよ。\nまた築け。

## note_workshop_3   WHERE: Forge, hidden scratches | CLS: npc | WHO: hidden
L1 en: Version 0.1          (all languages: keep "Version 0.1" / fa: نسخهٔ ۰٫۱ / ar: الإصدار ٠٫١ / ru: Версия 0.1 / ja: バージョン0.1)
L2 en: Still breathing.
   fa: هنوز نفس می‌کشد.
   ar: ما زال يتنفس.
   ru: Ещё дышит.
   ja: まだ息をしている。

## note_workshop_4   WHERE: Forge, the Pilgrim's Tablet | CLS: architect | WHO: pilgrim_tablet
L1 en: To speak with the Architect,\nyou must reach his Throne.
   fa: برای سخن گفتن با معمار،\nباید به سریرش برسی.
   ar: لتكلّم المعمار\nعليك أن تبلغ عرشه.
   ru: Чтобы говорить с Зодчим,\nты должен дойти до его Трона.
   ja: 建築家と語らうなら、\n玉座にたどり着かねばならぬ。
L2 en: Three gates will bar your way.\nThe last of them is he.
   fa: سه دروازه راهت را خواهند بست.\nواپسینشان خودِ اوست.
   ar: ثلاث بوابات ستسدّ دربك.\nوآخرها هو نفسه.
   ru: Трое врат преградят тебе путь.\nПоследние из них — он сам.
   ja: 三つの門が汝の道を阻む。\n最後の門は、彼自身。
L3 en: He answers no letters.\nHe answers those who do not turn back.
   fa: او به نامه پاسخ نمی‌دهد.\nپاسخ‌گوی آنان است که پس نمی‌نشینند.
   ar: لا يردّ على الرسائل.\nيردّ على من لا يعود أدراجه.
   ru: Он не отвечает на письма.\nОн отвечает тем, кто не повернул назад.
   ja: 彼は手紙に答えぬ。\n引き返さぬ者にのみ、答える。
```

### 4.2 Forest of Thorns
```
## wanderer_forest   WHERE: Forest, the Wanderer NPC | CLS: npc | WHO: wanderer
L1 en: Beware, pilgrim.
   fa: هشدار، ای زائر.
   ar: احذر أيها الحاج.
   ru: Берегись, паломник.
   ja: 用心せよ、巡礼者。
L2 en: Here the layouts twist and thorn themselves\nwhen no eye is upon them.
   fa: اینجا چیدمان‌ها خود را می‌پیچند و خار می‌شوند،\nآن‌گاه که هیچ چشمی بر آن‌ها نیست.
   ar: هنا تلتوي التخطيطات وتتشوّك\nإذا غاب عنها كلّ ناظر.
   ru: Здесь макеты сами скручиваются и обрастают шипами,\nкогда на них никто не смотрит.
   ja: ここでは配置が、誰も見ていぬ間に\nねじれ、棘を生やす。
L3 en: You are looking for the Throne.\nEveryone is. Almost none arrive.
   fa: تو سریر را می‌جویی.\nهمه می‌جویند. تقریباً هیچ‌کس نمی‌رسد.
   ar: أنت تطلب العرش.\nوكلّهم يطلبونه. ولا يكاد أحد يبلغه.
   ru: Ты ищешь Трон.\nИщут все. Доходят почти никто.
   ja: 汝は玉座を求めている。\n誰もがそうだ。辿り着く者は、ほぼいない。

## note_forest_1   WHERE: Forest, bark | CLS: npc | WHO: bark
L1 en: Nothing here is truly responsive.\nOnly willing to bend.
   fa: هیچ‌چیز به‌راستی واکنش‌گرا نیست.\nتنها خم می‌شود.
   ar: لا شيء مستجيبٌ حقًّا.\nثمّة فقط ما يقبل الانحناء.
   ru: Ничто не бывает по-настоящему отзывчивым.\nЕсть лишь умеющее гнуться.
   ja: 真に応答するものなど無い。\n撓むことを知る者がいるだけだ。

## note_forest_2   WHERE: Forest, overgrown sign | CLS: npc | WHO: overgrown
L1 en: Overflow devours all.
   fa: سرریز، همه‌چیز را می‌بلعد.
   ar: الفيضُ يلتهم كلّ شيء.
   ru: Переполнение пожирает всё.
   ja: あふれは、すべてを喰らう。

## note_forest_3   WHERE: Forest, carved root | CLS: npc | WHO: root
L1 en: The finest interface is one that vanishes.
   fa: زیباترین رابط، رابطی است که ناپدید شود.
   ar: أجمل واجهة هي التي تختفي.
   ru: Прекрасный интерфейс — тот, что исчезает.
   ja: 最も美しい画面とは、消え去る画面。
```

### 4.3 Cathedral of Design
```
## librarian_cathedral   WHERE: Cathedral, the Librarian | CLS: npc | WHO: librarian
L1 en: Many worship beauty.\nFew grasp clarity.
   fa: بسیارند که زیبایی را می‌پرستند.\nاندکند که روشنی را می‌فهمند.
   ar: كثيرون يعبدون الجمال.\nوقليلون يفقهون الوضوح.
   ru: Многие поклоняются красоте.\nМало кто постигает ясность.
   ja: 多くは美を崇める。\n明晰を解する者は少ない。
L2 en: The Architect learned that users\nhave no use for brilliance.
   fa: معمار آموخت که کاربران\nنیازی به درخشش ندارند.
   ar: تعلّم المعمار أنّ المستخدمين\nلا يعبؤون بالبهرجة.
   ru: Зодчий усвоил: пользователям\nдо блеска нет дела.
   ja: 建築家は知った。使う者は\n輝きなど気にかけぬと。
L3 en: They care only to arrive unharmed.
   fa: تنها می‌خواهند بی‌گزند برسند.
   ar: همّهم أن يصلوا سالمين.
   ru: Им важно лишь дойти невредимыми.
   ja: 彼らが望むのは、無事に辿り着くことだけ。

## note_cathedral_1   WHERE: Cathedral, the Great Tablet | CLS: architect | WHO: great_tablet
L1 en: If they cannot understand it...
   fa: اگر نتوانند آن را دریابند...
   ar: إن عجزوا عن فهمه...
   ru: Если они не могут это понять...
   ja: もし理解できぬのなら……
L2 en: No beauty can redeem it.
   fa: هیچ زیبایی‌ای رستگارش نمی‌کند.
   ar: فلا جمالَ يفتديه.
   ru: …никакая красота его не искупит.
   ja: どれほど美しくとも、救われはしない。

## note_cathedral_2   WHERE: Cathedral, fresco fragment | CLS: npc | WHO: fresco
L1 en: Symmetry is a solace.\nClarity is a discipline.
   fa: تقارن، تسلی است.\nروشنی، ریاضت است.
   ar: التناظر عزاء.\nوالوضوح رياضة.
   ru: Симметрия — утешение.\nЯсность — дисциплина.
   ja: 対称は慰め。\n明晰は修行。

## note_cathedral_3   WHERE: Cathedral, acolyte's note | CLS: npc | WHO: acolyte
L1 en: Beyond the Machine Halls lies the Ossuary.
   fa: آن‌سوی تالارهای ماشین، استودان است.
   ar: وراء أروقة الآلة تقع العظامية.
   ru: За Машинными Залами лежит Оссуарий.
   ja: 機械の回廊の先に、納骨堂がある。
L2 en: Beyond the Ossuary — him.
   fa: آن‌سوی استودان — خودِ او.
   ar: وراء العظامية — هو.
   ru: За Оссуарием — он.
   ja: 納骨堂の先には──彼が。
```

### 4.4 Halls of the Machine Mind  (the three-rune puzzle: ROLE → CONTEXT → TASK)
```
## candlekeeper   WHERE: Machine Halls, the Keeper of Questions NPC | CLS: npc | WHO: prompt_keeper
L1 en: A machine answers exactly\nwhat it was asked.
   fa: ماشین دقیقاً همان را پاسخ می‌دهد\nکه از او پرسیده‌اند.
   ar: الآلة تجيب بالضبط\nعمّا سُئلت.
   ru: Машина отвечает ровно на то,\nо чём её спросили.
   ja: 機械は、問われたことにだけ\n正確に答える。
L2 en: So he learned to ask as one prays — exactly.
   fa: پس آموخت چون نیایش پرسد — دقیق.
   ar: فتعلّم أن يسأل كمن يصلّي — بدقّة.
   ru: И он научился спрашивать, как молятся, — точно.
   ja: ゆえに彼は、祈るように、正確に問うことを学んだ。
L3 en: I keep the questions.\nHe keeps the answers honest.
   fa: من پرسش‌ها را نگه می‌دارم.\nاو پاسخ‌ها را درست‌کردار نگه می‌دارد.
   ar: أنا أحفظ الأسئلة.\nوهو يُبقي الأجوبة صادقة.
   ru: Я храню вопросы.\nОн хранит честность ответов.
   ja: 私は問いを守る。\n彼は答えを偽らせぬ。
L4 en: Three runes wake the bridge ahead.\nSpeak them as he would.
   fa: سه رون پلِ پیش‌رو را بیدار می‌کنند.\nآن‌ها را چنان بگو که او می‌گفت.
   ar: ثلاث رونيّات توقظ الجسر أمامك.\nانطقها كما كان سينطقها.
   ru: Три руны пробудят мост впереди.\nПроизнеси их так, как произнёс бы он.
   ja: 三つのルーンが先の橋を目覚めさせる。\n彼が唱えるように、唱えよ。
L5 en: First — who it must be.\nThen — what it must know.\nLast — what it must do.
   fa: نخست — که باید باشد.\nسپس — چه باید بداند.\nواپسین — چه باید کند.
   ar: أولًا — من يجب أن يكون.\nثم — ما يجب أن يعلم.\nوأخيرًا — ما يجب أن يفعل.
   ru: Сперва — кем ему быть.\nЗатем — что ему знать.\nНаконец — что ему делать.
   ja: まず──何者であるか。\n次に──何を知るか。\n最後に──何を為すか。

## note_catacomb_1   WHERE: Machine Halls, glyph | CLS: npc | WHO: glyph
L1 en: A prompt is not a prayer.\nIt is a blueprint.
   fa: پرامپت دعا نیست.\nنقشه است.
   ar: الموجِّه ليس دعاءً.\nإنه مخطّط.
   ru: Промпт — не молитва.\nЭто чертёж.
   ja: プロンプトは祈りではない。\n設計図だ。

## note_catacomb_2   WHERE: Machine Halls, engine wall | CLS: npc | WHO: engine_wall
L1 en: The model prophesies.\nThe engineer decides.
   fa: مدل پیشگویی می‌کند.\nمهندس حکم می‌دهد.
   ar: النموذج يتنبّأ.\nوالمهندس يحكم.
   ru: Модель предрекает.\nИнженер решает.
   ja: モデルは予言する。\n技師が決する。

## note_catacomb_3   WHERE: Machine Halls, secret panel | CLS: npc | WHO: secret_panel
L1 en: 404        (all languages: 404)
L2 en: The Architect does not sleep.
   fa: معمار نمی‌خوابد.
   ar: المعمار لا ينام.
   ru: Зодчий не спит.
   ja: 建築家は眠らぬ。
```

### 4.5 Ossuary of Lost Creations
```
## bot_repo   WHERE: Ossuary, the Forgotten Automaton | CLS: npc | WHO: bot
L1 Version 0.9   (as workshop_3: fa نسخهٔ ۰٫۹ / ar الإصدار ٠٫٩ / ru Версия 0.9 / ja バージョン0.9)
L2 en: I was almost enough.
   fa: تقریباً کافی بودم.
   ar: كدتُ أكون كافيًا.
   ru: Мне почти хватило.
   ja: あと少しで、足りたのに。

## proto_repo   WHERE: Ossuary, Sleeping Prototype | CLS: npc | WHO: prototype
L1 en: One more revision.      fa: یک بازنگریِ دیگر.     ar: مراجعةٌ أخرى.     ru: Ещё одна правка.        ja: もう一度、見直しを。
L2 en: One more improvement.   fa: یک بهبودِ دیگر.        ar: تحسينٌ آخر.        ru: Ещё одно улучшение.     ja: もう一度、改良を。
L3 en: One more...             fa: یکی دیگر...           ar: وأيضًا...          ru: Ещё одно...            ja: もう一つ……

## refactor_repo   WHERE: Ossuary, Endless Refactor | CLS: npc | WHO: refactor
L1-L3 en: Better.  fa: بهتر.  ar: أفضل.  ru: Лучше.  ja: もっと良く。   (the same word three times)
L4    "..." in all languages

## note_repo_1   WHERE: Ossuary, chalk | CLS: npc | WHO: chalk
L1 en: Perfection is costly.\nCompletion is beyond price.
   fa: کمال گران است.\nپایان‌یافتن بی‌بهاست.
   ar: الكمال باهظ.\nوالإتمام لا يُقدَّر بثمن.
   ru: Совершенство дорого.\nЗавершённость бесценна.
   ja: 完璧は高くつく。\n完成は値千金。

## note_repo_2 / note_repo_3 / note_repo_4   WHO: blueprint   L1: TODO / FIXME / WIP (identical in all languages, do not translate)

## note_repo_5   WHERE: Ossuary, the Archive Wall | CLS: architect | WHO: archive_wall
L1 en: The Architect completed fewer projects\nthan he imagined.
   fa: معمار کمتر از آنچه می‌پنداشت\nپروژه به پایان برد.
   ar: أتمّ المعمار مشاريعَ\nأقلّ مما تخيّل.
   ru: Зодчий завершил меньше замыслов,\nчем воображал.
   ja: 建築家が完成させたものは、\n思い描いたより少ない。
L2 en: But more than he remembers.
   fa: اما بیش از آنچه به یاد دارد.
   ar: لكن أكثر مما يتذكّر.
   ru: Но больше, чем помнит.
   ja: だが、覚えているより多い。
```

### 4.6 The Final Gate & the Sealed Door
```
## gate_arena   WHERE: before the Throne room | CLS: npc | WHO: final_gate
L1 en: Beyond this gate stands\nThe Rune Architect.
   fa: آن‌سوی این دروازه\nمعمارِ رون ایستاده است.
   ar: خلف هذه البوابة يقف\nمعمار الرونات.
   ru: За этими вратами стоит\nЗодчий Рун.
   ja: この門の向こうに立つのは、\nルーンの建築家。
L2 en: Turn back.\nOr keep going.\n\nBoth require courage.
   fa: بازگرد.\nیا پیش برو.\n\nهر دو شجاعت می‌خواهد.
   ar: ارجع.\nأو واصل.\n\nكلاهما يتطلّب شجاعة.
   ru: Вернись.\nИли иди дальше.\n\nИ то и другое требует мужества.
   ja: 引き返せ。\nあるいは進め。\n\nどちらにも勇気が要る。

## note_arena_1   WHERE: Throne room, inscription | CLS: architect | WHO: throne_insc
L1 en: Only the unyielding are granted speech.
   fa: تنها پایدار را اجازهٔ سخن است.
   ar: لا يُؤذَن بالكلام إلا للثابتين.
   ru: Говорить дозволено лишь стойким.
   ja: 語ることを許されるのは、不屈の者のみ。
L2 en: He is not a gatekeeper of knowledge.\nHe is a gatekeeper of resolve.
   fa: او نگهبانِ دانایی نیست.\nنگهبانِ عزم است.
   ar: ليس حارسًا للمعرفة.\nإنه حارسٌ للعزم.
   ru: Он страж не знания,\nа воли.
   ja: 彼は知の番人ではない。\n決意の番人だ。

## sealed_contact   WHERE: the sealed door east of the Throne (before the fight is won) | CLS: npc | WHO: sealed_door
L1 en: The Root Code holds this door shut.
   fa: کُدِ ریشه این در را بسته نگه می‌دارد.
   ar: الشفرة الجذرية تُبقي هذا الباب موصدًا.
   ru: Корневой Код держит эту дверь запертой.
   ja: 根源コードが、この扉を閉ざしている。
L2 en: No letter passes. No message arrives.
   fa: نامه‌ای نمی‌گذرد. پیامی نمی‌رسد.
   ar: لا تعبر رسالة. ولا يصل نداء.
   ru: Ни письмо не пройдёт, ни весть.
   ja: 手紙は通らぬ。便りも届かぬ。
L3 en: The Architect may be reached\nonly by one who has broken him —\nand then chose mercy.
   fa: تنها کسی به معمار می‌رسد\nکه او را شکسته —\nو آنگاه رحمت برگزیده.
   ar: لا يبلغ المعمارَ\nإلا من كسره —\nثم اختار الرحمة.
   ru: До Зодчего дойдёт лишь тот,\nкто мог сокрушить его —\nи выбрал милость.
   ja: 建築家に届くのは、\n彼を打ち砕き得たのに\n慈悲を選んだ者のみ。
```

---

## 5. SHYN, THE BOSS, AND THE ARCHITECT'S RECORD (résumé pages shown in each zone)  (`10-content.js`, `60-game.js`)
Résumé **facts are unchanged**; only the voice is. Shared line used at the end of cv_workshop…cv_repository:
```
## cv.go_further   en: If you wish to speak with him —\ngo further.
   fa: اگر می‌خواهی با او سخن بگویی —\nپیش‌تر برو.
   ar: إن أردتَ محادثته —\nفتقدّم أكثر.
   ru: Если хочешь говорить с ним —\nступай дальше.
   ja: 彼と語りたいなら——\nさらに進め。
```

### 5.1 Shyn (boss encounter, throne room)
```
## shyn_first   WHERE: Throne, opening speech before the fight | CLS: shyn | WHO: shyn_full
L1 en: Welcome, Recruiter.
   fa: خوش آمدی، ای جوینده.
   ar: أهلًا بك أيها الباحث.
   ru: Добро пожаловать, Искатель.
   ja: よく来た、求める者よ。
L2 en: You have walked through my failures.\nMy visions.\nMy unfinished worlds.
   fa: از میانِ شکست‌هایم گذشتی.\nاز رؤیاهایم.\nاز جهان‌های ناتمامم.
   ar: مررتَ بين إخفاقاتي.\nورؤاي.\nوعوالمي التي لم تكتمل.
   ru: Ты прошёл сквозь мои неудачи.\nМои видения.\nМои недостроенные миры.
   ja: 汝は我が失敗を歩み抜けた。\n我が幻を。\n未完の世界を。
L3 en: You wish to speak with me.\nThen prove that you are in earnest.
   fa: می‌خواهی با من سخن بگویی.\nپس ثابت کن که جدی‌ای.
   ar: تريد محادثتي.\nفأثبت أنك جادّ.
   ru: Ты хочешь говорить со мной.\nТогда докажи, что настроен всерьёз.
   ja: 我と語りたいか。\nならば、本気であると示せ。
L4 en: Tell me.\nWas the pilgrimage worth your time?
   fa: بگو.\nآیا این زیارت ارزشِ وقتت را داشت؟
   ar: قل لي.\nهل كان هذا المسير يستحقّ وقتك؟
   ru: Скажи.\nСтоило ли это паломничество твоего времени?
   ja: 答えよ。\nこの巡礼は、時を費やす価値があったか。

## shyn_p1   WHERE: boss phase 1 | CLS: shyn | WHO: shyn
L1 en: Everything begins with a prototype.
   fa: همه‌چیز با یک نمونهٔ اولیه آغاز می‌شود.
   ar: كل شيء يبدأ بنموذج أوّلي.
   ru: Всё начинается с прототипа.
   ja: すべては試作から始まる。
L2 en: Nothing survives first contact\nwith reality.
   fa: هیچ‌چیز از نخستین برخورد با واقعیت\nجان به در نمی‌برد.
   ar: لا شيء ينجو من أول مواجهة\nمع الواقع.
   ru: Ничто не переживает первой встречи\nс реальностью.
   ja: 最初に現実と触れて\n生き延びるものはない。
L3 en: Let us see what survives today.
   fa: ببینیم امروز چه برجا می‌ماند.
   ar: لنرَ ما الذي سينجو اليوم.
   ru: Посмотрим, что выживет сегодня.
   ja: 今日、何が生き残るか見せてもらおう。

## shyn_p2   WHERE: boss phase 2 | CLS: shyn | WHO: shyn
L1 en: Not good enough.        fa: کافی نیست.        ar: لا يكفي.        ru: Недостаточно.        ja: 足りぬ。
L2 en: Let us refine it.       fa: آن را صیقل دهیم.   ar: لنصقله.          ru: Отшлифуем.           ja: 磨き直そう。
L3 en: Again.   Better.        fa: دوباره.   بهتر.    ar: مرّة أخرى.   أفضل.   ru: Снова.   Лучше.   ja: もう一度。   もっと良く。
L4 en: Why isn't it finished?  fa: چرا هنوز تمام نشده؟   ar: لماذا لم يكتمل بعد؟   ru: Почему оно ещё не завершено?   ja: なぜまだ終わらぬ。

## shyn_p3   WHERE: boss phase 3 | CLS: shyn | WHO: shyn
L1 en: Every system has a foundation.   fa: هر نظام بنیادی دارد.   ar: لكل نظامٍ أساس.   ru: У каждой системы есть основание.   ja: あらゆる体系に礎がある。
L2 en: Every foundation has a key.      fa: هر بنیاد کلیدی دارد.   ar: ولكل أساسٍ مفتاح.   ru: У каждого основания есть ключ.   ja: あらゆる礎に鍵がある。
L3 en: Every key has a keeper.          fa: هر کلید نگهبانی دارد.   ar: ولكل مفتاحٍ حارس.   ru: У каждого ключа есть хранитель.   ja: あらゆる鍵に守り手がいる。
L4 en: And I am the keeper.             fa: و من نگهبانم.   ar: وأنا الحارس.   ru: И хранитель — я.   ja: そして我が、その守り手だ。

## shyn_yield   WHERE: after losing twice (the "yield" ending) | CLS: shyn
#1 WHO shyn   L1 en: Enough.   fa: بس است.   ar: كفى.   ru: Довольно.   ja: もうよい。
#2 silence (empty beat, keep)
#3 WHO shyn
L1 en: You fell. Twice.   fa: افتادی. دو بار.   ar: سقطتَ. مرّتين.   ru: Ты пал. Дважды.   ja: 汝は倒れた。二度。
L2 en: And twice you stood up\nin front of the same wall.
   fa: و دو بار برخاستی\nروبه‌روی همان دیوار.
   ar: ومرّتين نهضتَ\nأمام الجدار ذاته.
   ru: И дважды поднялся\nперед той же стеной.
   ja: そして二度、\n同じ壁の前に立った。
L3 en: I end this now.\nNot because you lost.
   fa: این را پایان می‌دهم.\nنه از آن‌که باختی.
   ar: أنهي هذا الآن.\nلا لأنك خسرت.
   ru: Я прекращаю это.\nНе потому, что ты проиграл.
   ja: ここで終わらせる。\n汝が敗れたからではない。
L4 en: Because you came back.
   fa: از آن‌که بازگشتی.
   ar: بل لأنك عدت.
   ru: А потому, что ты вернулся.
   ja: 汝が戻ってきたからだ。
#4 WHO shyn
L1 en: You have proven your worth.   fa: شایستگی‌ات را ثابت کردی.   ar: أثبتَّ جدارتك.   ru: Ты доказал свою ценность.   ja: 汝は、その価値を示した。
L2 en: You may seek an audience now.   fa: اکنون می‌توانی به دیدارم بیایی.   ar: يحقّ لك الآن أن تطلب لقائي.   ru: Теперь ты можешь просить у меня встречи.   ja: 今こそ、我に謁見を求めるがよい。

## shyn_mercy   WHERE: after winning (choose mercy) | CLS: shyn / player
#1 WHO shyn   L1 Enough. (as above)
#2 silence
#3 WHO shyn
L1 en: You came back.   fa: بازگشتی.   ar: لقد عدت.   ru: Ты вернулся.   ja: 汝は戻った。
L2 en: Again.           fa: دوباره.   ar: مرّة أخرى.   ru: Снова.   ja: 再び。
L3 en: And again.       fa: و باز.     ar: ومرّةً أخرى.   ru: И снова.   ja: そして、また。
L4 en: That was all I needed.   fa: همین کافی بود.   ar: هذا كلّ ما احتجته.   ru: Мне нужно было только это.   ja: それだけで、よかった。
#4 WHO you (cls player)
L1 en: Needed for what?   fa: برای چه؟   ar: احتجتَه لأي غاية؟   ru: Нужно — для чего?   ja: 何のために?
#5 WHO shyn
L1 en: To understand who you are.   fa: تا بدانم که هستی.   ar: لأفهم من تكون.   ru: Чтобы понять, кто ты.   ja: 汝が何者かを知るためだ。
L2 en: Any machine can measure skill.\nAny test can measure knowledge.
   fa: هر ماشینی مهارت را می‌سنجد.\nهر آزمونی دانش را می‌سنجد.
   ar: أيّ آلة تقيس المهارة.\nوأيّ اختبار يقيس المعرفة.
   ru: Любая машина измерит умение.\nЛюбой экзамен измерит знание.
   ja: どんな機械も技を測れる。\nどんな試験も知識を測れる。
L3 en: Few things measure persistence.   fa: اندک چیزی پایداری را می‌سنجد.   ar: قلّما يقيس شيءٌ الثبات.   ru: Стойкость измеряет мало что.   ja: 不屈を測れるものは、ほとんどない。
L4 en: Skills can be taught.\nPersistence cannot.
   fa: مهارت آموختنی است.\nپایداری نه.
   ar: المهارة تُعلَّم.\nأما الثبات فلا.
   ru: Умению можно научить.\nСтойкости — нельзя.
   ja: 技は教えられる。\n不屈は、教えられぬ。
#6 WHO shyn
L1 en: The door east of this throne is open now.   fa: درِ خاورِ این سریر اکنون گشوده است.   ar: الباب شرق هذا العرش مفتوحٌ الآن.   ru: Дверь к востоку от этого трона отворена.   ja: この玉座の東の扉は、いま開かれた。
L2 en: You wished to speak with me.\nGo and do it properly.
   fa: می‌خواستی با من سخن بگویی.\nبرو و درست انجامش بده.
   ar: أردتَ محادثتي.\nفاذهب وافعل ذلك كما يجب.
   ru: Ты хотел говорить со мной.\nИди и сделай это как подобает.
   ja: 我と語りたかったのだろう。\nならば行き、相応しく果たせ。

## shyn_after   WHERE: returning to Shyn after the ending | CLS: shyn | WHO: shyn
L1 en: You earned this, Recruiter.   fa: این را به دست آوردی، ای جوینده.   ar: لقد استحققتَ هذا أيها الباحث.   ru: Ты заслужил это, Искатель.   ja: これは汝が勝ち取ったものだ、求める者よ。
L2 en: These are the only roads that reach me.   fa: تنها راه‌هایی که به من می‌رسند، اینهاست.   ar: هذه هي الطرق الوحيدة المؤدّية إليّ.   ru: Лишь эти дороги ведут ко мне.   ja: 我に通じる道は、これだけだ。
```

### 5.2 The Architect's Record (one page per zone; WHO = record.I … record.VI; CLS: architect)
```
## cv_workshop   (Record I)
L1 en: Shayan Mirkhani.\nWeb designer. SEO specialist.\nDigital marketer.
   fa: شایان میرخانی.\nطراح وب. متخصص سئو.\nمارکتر دیجیتال.
   ar: شايان ميرخاني.\nمصمّم ويب. أخصائي SEO.\nمسوّق رقمي.
   ru: Шаян Мирхани.\nВеб-дизайнер. SEO-специалист.\nДиджитал-маркетолог.
   ja: シャヤン・ミルハニ。\nウェブデザイナー。SEOスペシャリスト。\nデジタルマーケター。
L2 en: He forges WordPress and Elementor sites\nin clean HTML and CSS —
   fa: او سایت‌های وردپرس و المنتور را\nبا HTML و CSS پاک می‌سازد —
   ar: يبني مواقع WordPress وElementor\nبـ HTML وCSS نظيفين —
   ru: Он куёт сайты на WordPress и Elementor\nна чистых HTML и CSS —
   ja: 彼はWordPressとElementorのサイトを、\n清らかなHTMLとCSSで鍛え上げ——
L3 en: then makes them flourish with SEO,\nGoogle Ads and content.
   fa: سپس با سئو، گوگل ادز و محتوا\nرشدشان می‌دهد.
   ar: ثم ينمّيها بالـ SEO\nوGoogle Ads والمحتوى.
   ru: затем растит их через SEO,\nGoogle Ads и контент.
   ja: そしてSEO、Google Ads、\nコンテンツで育てる。
L4 = cv.go_further

## cv_forest   (Record II)
L1 en: Elementor. WordPress. HTML and CSS.\nAll three, forged to an advanced edge.
   fa: المنتور. وردپرس. HTML و CSS.\nهر سه، تا لبهٔ استادی آبدیده.
   ar: Elementor. WordPress. HTML وCSS.\nثلاثتها مصقولة حتى حدٍّ متقدّم.
   ru: Elementor. WordPress. HTML и CSS.\nВсе три — закалены до продвинутого уровня.
   ja: Elementor、WordPress、HTMLとCSS。\n三つとも、上級の刃へと鍛えられている。
L2 en: And Schema, woven beneath the page\nwhere only machines can read it.
   fa: و اسکیما، تنیده در زیرِ صفحه\nجایی که تنها ماشین‌ها می‌خوانندش.
   ar: وSchema، منسوجةً تحت الصفحة\nحيث لا تقرؤها إلا الآلات.
   ru: И Schema, вплетённая под страницу,\nгде её читают лишь машины.
   ja: そしてSchema。ページの下に織り込まれ、\n機械だけが読み解く。
L3 en: He designs themes\nand writes the plugins they need.
   fa: او قالب می‌سازد\nو افزونه‌هایی را که لازم دارند می‌نویسد.
   ar: يصمّم القوالب\nويكتب الإضافات التي تحتاجها.
   ru: Он проектирует темы\nи пишет нужные им плагины.
   ja: 彼はテーマを設計し、\n必要なプラグインを書く。
L4 en: Structure first.\nOrnament after.
   fa: نخست ساختار.\nسپس زیور.
   ar: البنية أولًا.\nثم الزينة.
   ru: Сначала структура.\nПотом украшения.
   ja: まず構造。\n装飾は、その後。
L5 = cv.go_further

## cv_cathedral   (Record III)
L1 en: To be found is a craft of its own.
   fa: یافته شدن، خود هنری جداست.
   ar: أن يُعثر عليك حِرفةٌ قائمةٌ بذاتها.
   ru: Быть найденным — отдельное ремесло.
   ja: 見つけられることも、ひとつの技だ。
L2 en: SEO. Google Search Console.\nMoz. Screaming Frog. Google Ads.   (tool names stay Latin in fa/ar/ru/ja; fa may write سئو / گوگل ادز)
L3 en: He has led web design teams\nand digital marketing teams alike.
   fa: او هم تیم‌های طراحی وب را رهبری کرده\nو هم تیم‌های دیجیتال مارکتینگ را.
   ar: قاد فرق تصميم الويب\nوفرق التسويق الرقمي على السواء.
   ru: Он возглавлял и команды веб-дизайна,\nи команды цифрового маркетинга.
   ja: 彼はウェブデザインのチームも、\nデジタルマーケティングのチームも率いた。
L4 = cv.go_further

## cv_catacombs   (Record IV)
L1 en: He speaks to machine minds\nin their own grammar.
   fa: او با ذهن‌های ماشینی\nبه دستورِ خودشان سخن می‌گوید.
   ar: يخاطب عقول الآلات\nبنحوها الخاص.
   ru: Он говорит с машинными разумами\nна их собственной грамматике.
   ja: 彼は機械の精神と、\nその文法で語り合う。
L2 en: Prompt engineering.\nAI engineering.
   fa: مهندسی پرامپت.\nمهندسی هوش مصنوعی.
   ar: هندسة الموجِّهات.\nهندسة الذكاء الاصطناعي.
   ru: Промпт-инжиниринг.\nИнженерия ИИ.
   ja: プロンプトエンジニアリング。\nAIエンジニアリング。
L3 en: Clear intent. Strict structure.\nTested until it holds.
   fa: نیتِ روشن. ساختارِ سخت.\nآزموده تا برجا بماند.
   ar: نيّةٌ واضحة. بنيةٌ صارمة.\nيُختبر حتى يثبت.
   ru: Ясный замысел. Строгая структура.\nИспытано, пока не выдержит.
   ja: 明確な意図。厳格な構造。\n耐えるまで試し抜く。
L4 = cv.go_further

## cv_repository   (Record V)   (company names and years stay as-is; Latin names in every language; digits may be localised in fa/ar)
L1 en: Farset Mobalan Group. 2023 – 2025.\nHead of Digital Marketing.\nContent Specialist. Web Designer.
   fa: Farset Mobalan Group. ۲۰۲۳ – ۲۰۲۵.\nسرپرست دیجیتال مارکتینگ.\nمتخصص محتوا. طراح وب.
   ar: Farset Mobalan Group. ٢٠٢٣ – ٢٠٢٥.\nرئيس التسويق الرقمي.\nأخصائي محتوى. مصمّم ويب.
   ru: Farset Mobalan Group. 2023 – 2025.\nРуководитель цифрового маркетинга.\nКонтент-специалист. Веб-дизайнер.
   ja: Farset Mobalan Group。2023 – 2025。\nデジタルマーケティング責任者。\nコンテンツ担当。ウェブデザイナー。
L2 en: Aidbax Digital Marketing Group. 2022 – 2023.\nHead of Web Design. SEO Consultant.
   fa: Aidbax Digital Marketing Group. ۲۰۲۲ – ۲۰۲۳.\nسرپرست طراحی وب. مشاور سئو.
   ar: Aidbax Digital Marketing Group. ٢٠٢٢ – ٢٠٢٣.\nرئيس تصميم الويب. مستشار SEO.
   ru: Aidbax Digital Marketing Group. 2022 – 2023.\nРуководитель веб-дизайна. SEO-консультант.
   ja: Aidbax Digital Marketing Group。2022 – 2023。\nウェブデザイン責任者。SEOコンサルタント。
L3 en: Pooyan Sport. 2022 – 2023.\nSEO Consultant. Website Admin.
   fa: Pooyan Sport. ۲۰۲۲ – ۲۰۲۳.\nمشاور سئو. مدیر وب‌سایت.
   ar: Pooyan Sport. ٢٠٢٢ – ٢٠٢٣.\nمستشار SEO. مدير الموقع.
   ru: Pooyan Sport. 2022 – 2023.\nSEO-консультант. Администратор сайта.
   ja: Pooyan Sport。2022 – 2023。\nSEOコンサルタント。サイト管理者。
L4 en: Six websites still stand.\nTheir names wait in the Codex.
   fa: شش وب‌سایت هنوز برپایند.\nنام‌هایشان در کدکس چشم‌به‌راه است.
   ar: ستة مواقع ما زالت قائمة.\nوأسماؤها تنتظر في المخطوط.
   ru: Шесть сайтов всё ещё стоят.\nИх имена ждут в Кодексе.
   ja: 六つのサイトは今も立っている。\nその名は写本に眠る。
L5 = cv.go_further

## cv_arena   (Record VI — last page, NO "go further")
L1 en: He speaks English.\nA little Russian. A little Japanese.
   fa: او انگلیسی می‌داند.\nکمی روسی. کمی ژاپنی.
   ar: يتحدّث الإنجليزية.\nوقليلًا من الروسية. وقليلًا من اليابانية.
   ru: Он говорит по-английски.\nНемного по-русски. Немного по-японски.
   ja: 彼は英語を話す。\nロシア語と日本語は、少し。
L2 en: He works by seven pillars.
   fa: او بر هفت ستون کار می‌کند.
   ar: يعمل على سبعة أعمدة.
   ru: Он живёт по семи столпам.
   ja: 彼は七つの柱に従って働く。
L3 en: Honesty. Honor. Loyalty.\nPunctuality. Courage.\nHard work. A firm moral code.
   fa: صداقت. شرف. وفاداری.\nوقت‌شناسی. شجاعت.\nسخت‌کوشی. اصولِ اخلاقیِ استوار.
   ar: الصدق. الشرف. الوفاء.\nالالتزام بالمواعيد. الشجاعة.\nالاجتهاد. ميثاقٌ أخلاقي راسخ.
   ru: Честность. Честь. Верность.\nПунктуальность. Отвага.\nТрудолюбие. Твёрдый нравственный закон.
   ja: 誠実。名誉。忠義。\n時間厳守。勇気。\n勤勉。揺るがぬ道徳律。
L4 en: You have now read everything he is.
   fa: اکنون هرچه او هست را خوانده‌ای.
   ar: لقد قرأتَ الآن كلَّ ما هو عليه.
   ru: Теперь ты прочёл всё, что он есть.
   ja: これで、彼のすべてを読み終えた。
L5 en: To speak with him,\nprove that you are serious.
   fa: برای سخن گفتن با او،\nثابت کن که جدی‌ای.
   ar: لتحدّثه،\nأثبت أنك جادّ.
   ru: Чтобы говорить с ним,\nдокажи, что настроен всерьёз.
   ja: 彼と語らうために、\n本気であると示せ。
```

---

## 6. THE BUDGET GOBLIN — Chamber 499  (`DC.goblin_*` in `10-content.js`; scene logic in `63-goblin.js`)
**This is the ONLY comic voice in the game.** Keep the Blasphemous liturgical vocabulary (sins, blessings, amen, saints, tithes, consecrated) but use it for petty-accountant humour. Keep the numbers: 500 points · 500,000 Toman · ledger closes at 499. The dry joke must survive translation — adapt the joke, not the words.
```
## goblin_intro   WHERE: entering Chamber 499, the Goblin greets you | CLS: npc | WHO: goblin
L1 en: Ah, the Recruiter. Wipe your feet.\nThese coins are consecrated.
   fa: آه، جوینده. پایت را پاک کن.\nاین سکه‌ها تبرک‌شده‌اند.
   ar: آه، الباحث. امسح قدميك.\nهذه العملات مباركة.
   ru: А, Искатель. Ноги вытри.\nЭти монеты освящены.
   ja: おお、求める者か。足を拭きなさい。\nこの硬貨は聖別済みだ。
L2 en: One moment.\nI am counting my sins.\nMost of them are decimals.
   fa: یک لحظه.\nدارم گناهانم را می‌شمارم.\nبیشترشان اعشاری‌اند.
   ar: لحظة.\nأعدّ خطاياي.\nمعظمها كسور عشرية.
   ru: Минуточку.\nСчитаю свои грехи.\nВ основном — десятичные дроби.
   ja: 少々お待ちを。\n己の罪を数えております。\nほとんどが小数でして。
L3 en: You came for the discount. Of course you did.\n500 points — and 500,000 Toman\noff the Architect's first salary.
   fa: برای تخفیف آمده‌ای. معلوم است.\n۵۰۰ امتیاز — و ۵۰۰٬۰۰۰ تومان\nاز اولین حقوقِ معمار کم می‌شود.
   ar: جئتَ من أجل الخصم. بالطبع.\n٥٠٠ نقطة — وخمسمئة ألف تومان\nتُحسم من أول راتب للمعمار.
   ru: Ты пришёл за скидкой. Конечно.\n500 очков — и 500 000 томанов\nс первого жалованья Зодчего.
   ja: 割引目当てですな。当然です。\n500ポイントで、建築家の初任給から\n50万トマンが引かれます。
L4 en: Below 500 the discount is zero.\nNot one Toman. I checked twice,\nonce with a priest present.
   fa: زیر ۵۰۰ تخفیف صفر است.\nیک تومان هم نه. دو بار چک کردم،\nیک بار با حضورِ کشیش.
   ar: دون ٥٠٠ الخصم صفر.\nولا تومانًا واحدًا. راجعتُ مرّتين،\nإحداهما بحضور كاهن.
   ru: Ниже 500 скидка равна нулю.\nНи одного томана. Проверил дважды,\nодин раз — при священнике.
   ja: 500未満なら割引はゼロ。\n1トマンたりとも出ません。二度確認しました、\n一度は司祭の立ち会いで。
L5 en: I have counted your ledger.\nIt closes at 499.\n...Amen, I suppose.
   fa: دفترت را شمردم.\nروی ۴۹۹ بسته می‌شود.\n...آمین، فکر کنم.
   ar: عددتُ دفترك.\nيُغلق عند ٤٩٩.\n...آمين، على ما أظن.
   ru: Я пересчитал твою книгу.\nОна закрывается на 499.\n…Аминь, наверное.
   ja: お前の帳簿を数えました。\n499で締まります。\n……アーメン、でしょうか。

## goblin_coin   WHERE: the Goblin offers the "last point" (a coin appears) | CLS: npc | WHO: goblin
L1 en: ...One point.
   fa: ...یک امتیاز.
   ar: ...نقطة واحدة.
   ru: …Одно очко.
   ja: ……あと1ポイント。
L2 en: For you? Of course.\nThis is a generous quarter.\nI am practically a saint.
   fa: برای تو؟ البته.\nاین سه‌ماه، فصلِ سخاوت است.\nعملاً قدیسم.
   ar: من أجلك؟ بالطبع.\nهذا ربعٌ سخيّ.\nأنا قدّيس تقريبًا.
   ru: Для тебя? Конечно.\nУ меня щедрый квартал.\nЯ практически святой.
   ja: お前のためなら、もちろん。\n今期は気前がよいのです。\nほぼ聖人ですな。
L3 en: Here. Freshly minted, blessed on Tuesday.\nPick it up. It is yours.\n(Do not read the fine print.)
   fa: بفرما. تازه ضرب‌شده، سه‌شنبه تبرک شد.\nبرش دار. مالِ توست.\n(ریزنوشته‌ها را نخوان.)
   ar: تفضّل. مسكوكة حديثًا، ومباركة يوم الثلاثاء.\nخذها. هي لك.\n(لا تقرأ الحروف الصغيرة.)
   ru: Вот. Свежеотчеканена, освящена во вторник.\nБери. Она твоя.\n(Мелкий шрифт не читай.)
   ja: どうぞ。出来たて、火曜に祝福済み。\n拾いなさい。お前のものです。\n(小さな字は読まぬように。)

## goblin_wait   WHERE: the player hesitates / does not pick up the coin | CLS: npc | WHO: goblin
L1 en: It is right there.
   fa: همان‌جاست.
   ar: إنها هناك تمامًا.
   ru: Вот же она.
   ja: そこにあるでしょう。
L2 en: Go on. Take it.\nIt is only one point.\nWhat could it cost you?
   fa: بردار، دیگر.\nفقط یک امتیاز است.\nچه هزینه‌ای می‌تواند داشته باشد؟
   ar: هيّا، خذها.\nإنها نقطة واحدة فقط.\nما الذي قد تكلّفك إياه؟
   ru: Давай, бери.\nЭто всего одно очко.\nИ чего это тебе стоит?
   ja: さあ、取りなさい。\nたった1ポイントです。\nなにを失うというのです?

## goblin_zero   WHERE: the player took the coin → all points vanish (the trap) | CLS: npc | WHO: goblin
L1 en: Hee hee hee.
   fa: هی هی هی.
   ar: هِه هِه هِه.
   ru: Хи-хи-хи.
   ja: ひっひっひ。
L2 en: The ledger reads zero.\nBudget approved. Praise be.
   fa: دفتر صفر را نشان می‌دهد.\nبودجه تصویب شد. شکر.
   ar: الدفتر يُظهر صفرًا.\nأُقرّت الميزانية. الحمد للميزانية.
   ru: В книге — ноль.\nБюджет утверждён. Слава бюджету.
   ja: 帳簿は、ゼロ。\n予算は承認されました。予算に栄光あれ。
L3 en: Nobody buys the Architect\nat a discount.\nNot even in hell. I asked.
   fa: هیچ‌کس معمار را\nبا تخفیف نمی‌خرد.\nحتی در جهنم. پرسیدم.
   ar: لا أحد يشتري المعمار\nبخصم.\nولا حتى في الجحيم. سألتُ.
   ru: Зодчего не покупают\nсо скидкой.\nДаже в аду. Я спрашивал.
   ja: 建築家は割引では買えません。\n地獄ですら。聞いてきました。

## goblin_accept   WHERE: the player walks away keeping 499 | CLS: npc | WHO: goblin
L1 en: Wise.
   fa: عاقلانه.
   ar: حكيم.
   ru: Мудро.
   ja: 賢明。
L2 en: 499, then.\nAnd 499 buys nothing.\nBut it looks so respectable on paper.
   fa: پس ۴۹۹.\nو ۴۹۹ چیزی نمی‌خرد.\nاما روی کاغذ چقدر محترم می‌نماید.
   ar: إذن ٤٩٩.\nو٤٩٩ لا تشتري شيئًا.\nلكنها تبدو محترمة جدًّا على الورق.
   ru: Что ж, 499.\nА 499 не покупает ничего.\nЗато на бумаге выглядит солидно.
   ja: では、499で。\n499では何も買えません。\nですが、帳簿の上では立派に見えます。
L3 en: Come back\nwhen you want the last one.\nPrices rise at dawn.
   fa: برگرد\nوقتی آخرین را خواستی.\nقیمت‌ها سحر بالا می‌روند.
   ar: عُد\nحين تريد الأخيرة.\nالأسعار ترتفع عند الفجر.
   ru: Возвращайся,\nкогда захочешь последнее.\nЦены растут на рассвете.
   ja: 最後の1つが欲しくなったら\nまたおいでなさい。\n値段は夜明けに上がります。

## goblin_after   WHERE: talking to the Goblin after the chamber is resolved | CLS: npc | WHO: goblin
L1 en: The numbers are... balanced.
   fa: ارقام... تراز شدند.
   ar: الأرقام... متوازنة.
   ru: Цифры... сошлись.
   ja: 数字は……釣り合いました。
L2 en: The Architect is in the Codex.\nBehind you. Always behind you.\nLike an invoice.
   fa: معمار در کدکس است.\nپشتِ سرت. همیشه پشتِ سرت.\nمثل یک صورت‌حساب.
   ar: المعمار في المخطوط.\nخلفك. دائمًا خلفك.\nمثل فاتورة.
   ru: Зодчий — в Кодексе.\nЗа твоей спиной. Всегда за спиной.\nКак счёт к оплате.
   ja: 建築家は写本の中におります。\nお前の背後に。常に背後に。\n請求書のように。
```

### 6.1 Goblin scene UI & the final "trap" screen  (`63-goblin.js`, dark-screen styles at the end of `style.css`)
```
## goblin.ui   (en | fa | ar | ru | ja)
One point remains.            | یک امتیاز باقی است.             | بقيت نقطة واحدة.              | Остаётся одно очко.            | 残るはあと1ポイント。
Shall we balance the books, Recruiter? | دفترها را تراز کنیم، ای جوینده؟ | هل نوازن الدفاتر أيها الباحث؟ | Сведём книги, Искатель?         | 帳簿を合わせましょうか、求める者よ。
Ask for the last point        | آخرین امتیاز را بخواه           | اطلب النقطة الأخيرة           | Попросить последнее очко       | 最後の1ポイントを乞う
Walk away with 499            | با ۴۹۹ برو                      | انصرف بـ٤٩٩                   | Уйти с 499                     | 499のまま立ち去る
Hee hee hee!                  | هی هی هی!                       | هِه هِه هِه!                  | Хи-хи-хи!                      | ひっひっひ!
All your points are gone.     | همهٔ امتیازهایت رفت.            | ذهبت كلّ نقاطك.               | Все твои очки исчезли.         | ポイントはすべて消えた。
There was never a discount.   | هرگز تخفیفی در کار نبود.        | لم يكن هناك خصمٌ قطّ.         | Скидки никогда не было.        | 割引など、最初から無かった。
One coin. One point. It is yours. | یک سکه. یک امتیاز. مالِ توست.  | عملة واحدة. نقطة واحدة. هي لك. | Одна монета. Одно очко. Твоя.   | 硬貨一枚。1ポイント。お前のものだ。
Press E to get up             | برای برخاستن E را بزن            | اضغط E للنهوض                 | Нажми E, чтобы встать           | Eで立ち上がる
Tap to get up                 | برای برخاستن لمس کن              | المس للنهوض                   | Коснись, чтобы встать           | タップして立ち上がる

## goblin.final   WHERE: dark screen after the trap — 4 paragraphs shown in order. THE PAYOFF JOKE: it must make the recruiter smile AND nudge them to hire Shyn.
P1 en: Nice try, penitent.
   fa: تلاشِ خوبی بود، ای توبه‌کار.
   ar: محاولة جيدة أيها التائب.
   ru: Хорошая попытка, кающийся.
   ja: 惜しかったな、悔悟者よ。
P2 en: The Rune Architect sealed this loophole\nthree versions ago.
   fa: معمارِ رون این روزنه را\nسه نسخه پیش مُهر کرد.
   ar: ختم معمار الرونات هذه الثغرة\nقبل ثلاثة إصدارات.
   ru: Зодчий Рун запечатал эту лазейку\nтри версии назад.
   ja: ルーンの建築家は、この抜け穴を\n三つ前の版で塞いである。
P3 en: The ledger closes at 499.\nIt always closes at 499.\nNot even Heaven can balance it.
   fa: دفتر روی ۴۹۹ بسته می‌شود.\nهمیشه روی ۴۹۹ بسته می‌شود.\nحتی بهشت هم نمی‌تواند تراز کند.
   ar: الدفتر يُغلق عند ٤٩٩.\nدائمًا عند ٤٩٩.\nحتى السماء لا تستطيع موازنته.
   ru: Книга закрывается на 499.\nВсегда на 499.\nДаже Небеса не сведут баланс.
   ja: 帳簿は499で締まる。\nいつも499で締まる。\n天ですら釣り合わせられぬ。
P4 en: Perhaps keeping the talented developer\ncosts less than replacing him.
   fa: شاید نگه داشتنِ توسعه‌دهندهٔ مستعد\nارزان‌تر از جایگزین کردنش باشد.
   ar: ربما كان إبقاء المطوّر الموهوب\nأرخص من استبداله.
   ru: Быть может, удержать талантливого разработчика\nдешевле, чем заменить его.
   ja: 才ある開発者を引き留めるほうが、\n替えるより安くつくやもしれぬ。
```

---

## 7. UI, PROMPTS, PUZZLE & MENU STRINGS  (`en | fa | ar | ru | ja`; one row = one string key `ui.*`)

### 7.1 Interaction prompts (shown above objects)
| en | fa | ar | ru | ja |
|---|---|---|---|---|
| Read | بخوان | اقرأ | Прочесть | 読む |
| Read the inscription | کتیبه را بخوان | اقرأ النقش | Прочесть надпись | 銘を読む |
| Read the wall | دیوار را بخوان | اقرأ الجدار | Прочесть стену | 壁を読む |
| Read the scratches | خراش‌ها را بخوان | اقرأ الخدوش | Прочесть царапины | 引っかき傷を読む |
| Read the Pilgrim's Tablet | لوحِ زائر را بخوان | اقرأ لوح الحاج | Прочесть скрижаль паломника | 巡礼者の石板を読む |
| Read the bark | پوست درخت را بخوان | اقرأ اللحاء | Прочесть кору | 樹皮を読む |
| Read the sign | نشان را بخوان | اقرأ اللافتة | Прочесть знак | 標を読む |
| Read the carved root | ریشهٔ تراشیده را بخوان | اقرأ الجذر المنحوت | Прочесть резной корень | 刻まれた根を読む |
| Read the Great Tablet | لوحِ بزرگ را بخوان | اقرأ اللوح العظيم | Прочесть Великую скрижаль | 大石板を読む |
| Read the fresco | دیوارنگاره را بخوان | اقرأ الجدارية | Прочесть фреску | 壁画を読む |
| Read the acolyte's note | یادداشتِ شاگرد را بخوان | اقرأ رسالة المساعد | Прочесть записку послушника | 侍者の覚え書きを読む |
| Read the etching | حکاکی را بخوان | اقرأ النقش المحفور | Прочесть гравировку | 刻み文字を読む |
| Read the furnace wall | دیوارِ کوره را بخوان | اقرأ جدار الأتون | Прочесть стену горна | 炉の壁を読む |
| Open the secret panel | دریچهٔ نهان را بگشا | افتح اللوحة السرّية | Открыть тайную панель | 隠し板を開く |
| Read the chalk | نوشتهٔ گچی را بخوان | اقرأ الطباشير | Прочесть мел | 白墨を読む |
| Read the fragment | پاره را بخوان | اقرأ الشظية | Прочесть обломок | 断片を読む |
| Read the Archive Wall | دیوارِ بایگانی را بخوان | اقرأ جدار الأرشيف | Прочесть стену архива | 記録の壁を読む |
| Read the throne | سریر را بخوان | اقرأ العرش | Прочесть трон | 玉座を読む |
| Read the ledger | دفتر را بخوان | اقرأ الدفتر | Прочесть книгу учёта | 帳簿を読む |
| Read the Architect's record | کارنامهٔ معمار را بخوان | اقرأ سجلّ المعمار | Прочесть свиток Зодчего | 建築家の記録を読む |
| Read the glyph | نقش را بخوان | اقرأ الرمز | Прочесть знак | 刻印を読む |
| Read the engine wall | دیوارِ موتور را بخوان | اقرأ جدار المحرّك | Прочесть стену двигателя | 機関の壁を読む |
| Wake the rune | رون را بیدار کن | أيقظ الرونية | Пробудить руну | ルーンを目覚めさせる |
| Switch the branch | شاخه را بگردان | بدّل الفرع | Переключить ветвь | 枝を切り替える |
| Speak the rune: ROLE | رون را بگو: نقش | انطق الرونية: الدور | Произнести руну: РОЛЬ | ルーンを唱える：役割 |
| Speak the rune: CONTEXT | رون را بگو: بافتار | انطق الرونية: السياق | Произнести руну: КОНТЕКСТ | ルーンを唱える：文脈 |
| Speak the rune: TASK | رون را بگو: وظیفه | انطق الرونية: المهمّة | Произнести руну: ЗАДАЧА | ルーンを唱える：任務 |
| Speak with the Architect | با معمار سخن بگو | حدّث المعمار | Говорить с Зодчим | 建築家と語る |
| Challenge the Rune Architect | معمارِ رون را به نبرد بخوان | تحدَّ معمار الرونات | Бросить вызов Зодчему Рун | ルーンの建築家に挑む |
| Shatter the rune | رون را بشکن | حطّم الرونية | Разбить руну | ルーンを砕く |
| Shatter the prototype | نمونه را بشکن | حطّم النموذج | Разбить прототип | 試作体を砕く |
| Shatter the revision | بازنگری را بشکن | حطّم المراجعة | Разбить правку | 改訂を砕く |
| Shatter the root rune | رونِ ریشه را بشکن | حطّم رونية الجذر | Разбить корневую руну | 根源のルーンを砕く |
| Rune shattered | رون شکست | تحطّمت الرونية | Руна разбита | ルーンは砕けた |
| The rune holds | رون پایدار ماند | الرونية صامدة | Руна держится | ルーンは耐えている |
| move | حرکت | تحرّك | движение | 移動 |
| Attempt | تلاش | محاولة | Попытка | 挑戦 |

### 7.2 Puzzle & hint lines (Forest / Machine Halls)
| en (old key) | new en | fa | ar | ru | ja |
|---|---|---|---|---|---|
| A rune wakes | A rune wakes | رونی بیدار می‌شود | تستيقظ رونية | Руна пробуждается | ルーンが目覚める |
| Sleeping stone remembers its shape. | The sleeping stone remembers its shape. | سنگِ خفته شکلش را به یاد می‌آورد. | الحجر النائم يتذكّر هيئته. | Спящий камень помнит свой облик. | 眠れる石は、己の形を思い出す。 |
| Across the ravine, a bridge of leaves remembers its shape. | Across the ravine, a bridge of leaves remembers its shape. | آن‌سوی دره، پُلی از برگ شکلش را به یاد می‌آورد. | عبر الوادي، جسرٌ من الأوراق يتذكّر هيئته. | Через ущелье мост из листьев вспоминает свой облик. | 谷の向こうで、葉の橋が己の形を思い出す。 |
| A stair of light climbs beside you. | A stair of light climbs beside you. | پلکانی از نور در کنارت بالا می‌رود. | سلّمٌ من نور يصعد بجانبك. | Рядом с тобой поднимается лестница света. | 光の階段が、傍らに伸びてゆく。 |
| Below, the broken floor is whole again. | Below, the broken floor is made whole. | در زیر، کفِ شکسته دوباره یکپارچه شد. | وفي الأسفل، التأم الأرضُ المكسور. | Внизу разбитый пол вновь цел. | 下では、砕けた床が元に戻った。 |
| The way is asleep | The way is asleep | راه به خواب رفته است | الطريق نائم | Путь спит | 道は眠っている |
| Find the rune that wakes it. | Find the rune that wakes it. | رونی را بیاب که بیدارش کند. | ابحث عن الرونية التي توقظه. | Найди руну, что пробудит его. | それを目覚めさせるルーンを探せ。 |
| A rune sleeps in the crown of the great tree. | A rune sleeps in the crown of the great tree. | رونی در تاجِ درخت بزرگ خفته است. | رونيةٌ نائمة في تاج الشجرة العظيمة. | Руна спит в кроне великого дерева. | 大樹の梢に、ルーンが眠る。 |
| One rune wakes a stair. The stair leads to the second. | One rune wakes a stair. The stair leads to the next. | یک رون پلکانی را بیدار می‌کند. پلکان به رونِ دوم می‌رسد. | رونيةٌ توقظ سلّمًا. والسلّم يقود إلى التالية. | Одна руна будит лестницу. Лестница ведёт к следующей. | ひとつのルーンが階段を呼ぶ。階段は次へと続く。 |
| Three runes. Speak them in order: role, context, task. | Three runes. Speak them in order: role, context, task. | سه رون. به ترتیب بگو: نقش، بافتار، وظیفه. | ثلاث رونيّات. انطقها بالترتيب: الدور، السياق، المهمّة. | Три руны. Произноси по порядку: роль, контекст, задача. | 三つのルーン。順に唱えよ──役割、文脈、任務。 |
| The lever on the island switches the branch. | The lever on the island switches the branch. | اهرمِ روی جزیره، شاخه را می‌گرداند. | الرافعة على الجزيرة تبدّل الفرع. | Рычаг на острове переключает ветвь. | 島のレバーが枝を切り替える。 |
| The machine understood | The machine understood | ماشین فهمید | فهمت الآلة | Машина поняла | 機械は理解した |
| The bridge wakes. | The bridge wakes. | پل بیدار می‌شود. | يستيقظ الجسر. | Мост пробуждается. | 橋が目覚める。 |
| The machine misunderstood | The machine misunderstood | ماشین نفهمید | أساءت الآلة الفهم | Машина не поняла | 機械は誤解した |
| Order matters. Begin again. | Order matters. Begin again. | ترتیب مهم است. از نو آغاز کن. | الترتيب مهمّ. ابدأ من جديد. | Порядок важен. Начни снова. | 順序が肝要だ。やり直せ。 |
| Branch switched | Branch switched | شاخه گردانده شد | تبدّل الفرع | Ветвь переключена | 枝は切り替わった |
| Back on the first branch | Back on the first branch | بازگشت به شاخهٔ نخست | عدنا إلى الفرع الأول | Снова на первой ветви | 最初の枝に戻った |
| One path sleeps. The other wakes. | One path sleeps. The other wakes. | یک راه می‌خوابد. دیگری بیدار می‌شود. | طريقٌ ينام. وآخر يستيقظ. | Один путь спит. Другой пробуждается. | 一方の道は眠り、もう一方が目覚める。 |
| A rune sleeps / The way is asleep (zone.forest objective) | The bough waits. | شاخه منتظر است. | الغصن ينتظر. | Ветвь ждёт. | 枝は待っている。 |

### 7.3 HUD, throne, death & menu
| en (old key) | new en | fa | ar | ru | ja |
|---|---|---|---|---|---|
| Seeker Of Talent | Seeker of Talent | جویندهٔ استعداد | باحثٌ عن الموهبة | Ищущий таланты | 才を求める者 |
| Score | Score | امتیاز | النقاط | Очки | スコア |
| Toman off his first salary · at 500 points | Toman off his first salary · at 500 points | تومان از اولین حقوقش · با ۵۰۰ امتیاز | تومان من أول راتب له · عند ٥٠٠ نقطة | томанов с его первого жалованья · при 500 очках | トマンが初任給から引かれる · 500ポイントで |
| Curiosity brought you here.\nLet's see if it brings you back. | Curiosity brought you here.\nLet us see if it brings you back. | کنجکاوی تو را تا اینجا کشاند.\nببینیم آن‌قدر هست که دوباره بازگردی. | قادك الفضول إلى هنا.\nلنرَ إن كان يعيدك. | Любопытство привело тебя сюда.\nПосмотрим, вернёт ли оно тебя. | 好奇心が汝をここへ導いた。\nそれが汝を連れ戻すか、見せてもらおう。 |
| Most stop here.\nThat is why they never learn. | Most stop here.\nThat is why they never learn. | بیشتر کسان اینجا می‌ایستند.\nو از همین‌روست که هرگز نمی‌آموزند. | معظمهم يتوقّفون هنا.\nولهذا لا يتعلّمون أبدًا. | Большинство останавливается здесь.\nПоэтому они ничему не учатся. | 多くはここで止まる。\nゆえに、何も学ばぬのだ。 |
| If you want Shyn, the Rune Architect, on your team, you must first defeat him at his own challenge. | If you would have Shyn, the Rune Architect, on your team, you must first overcome him at his own trial. | اگر شایان، معمارِ رون، را در تیمت می‌خواهی، نخست باید او را در آزمونِ خودش پشت سر بگذاری. | إن أردتَ شايان، معمار الرونات، في فريقك، فعليك أولًا أن تغلبه في محنته هو. | Если хочешь видеть Шайна, Зодчего Рун, в своей команде, сперва одолей его в его собственном испытании. | ルーンの建築家シャインを仲間に迎えたくば、まず彼自身の試練で打ち勝て。 |
| Press E to return / Tap to return | Press E to return / Tap to return | برای بازگشت E را بزن / لمس کن | اضغط E للعودة / المس للعودة | Нажми E, чтобы вернуться / Коснись | Eで戻る / タップして戻る |
| He is intensely punctual.\nThe bells of this hall keep his hour. | He is relentlessly punctual.\nThe bells of this hall keep his hour. | او سخت وقت‌شناس است.\nناقوس‌های این تالار ساعتِ او را می‌نوازند. | هو شديد الالتزام بالمواعيد.\nوأجراس هذا الرواق تدقّ ساعته. | Он беспощадно пунктуален.\nКолокола этого зала бьют его часы. | 彼は容赦なく時を守る。\nこの広間の鐘は、彼の刻を打つ。 |
| You returned. | You returned. | بازگشتی. | عدتَ. | Ты вернулся. | 戻ったか。 |
| Back to the main résumé | Back to the main résumé | بازگشت به رزومهٔ اصلی | العودة إلى السيرة الذاتية الرئيسية | Назад к основному резюме | メインの履歴書へ戻る |
| Codex | Codex | کدکس | المخطوط | Кодекс | 写本 |
| Close ✦ Esc | Close ✦ Esc | بستن ✦ Esc | إغلاق ✦ Esc | Закрыть ✦ Esc | 閉じる ✦ Esc |
| Veyrath is still | Veyrath is still | وِیرَث ایستاده است | فيرَث ساكنة | Вейрат замер | ヴェイラスは静止している |
| Achievements | Achievements | دستاوردها | الإنجازات | Достижения | 実績 |
| Continue Journey | Resume the Pilgrimage | ادامهٔ زیارت | تابع المسير | Продолжить паломничество | 巡礼を続ける |
| Leave Veyrath | Leave Veyrath | ترکِ وِیرَث | غادر فيرَث | Покинуть Вейрат | ヴェイラスを去る |
| Esc — return | Esc — return | Esc — بازگشت | Esc — عودة | Esc — назад | Esc — 戻る |
| Veyrath · The Rune Architect | Veyrath · The Rune Architect | وِیرَث · معمارِ رون | فيرَث · معمار الرونات | Вейрат · Зодчий Рун | ヴェイラス・ルーンの建築家 |
| Rotate for the full view | Turn your device for the full view | برای دیدنِ کامل، دستگاه را بچرخان | أدِر جهازك للعرض الكامل | Поверни устройство для полного вида | 全体を見るには端末を回転 |
| Codex tabs: The Architect / Skills / Projects / Experience / Contact | The Architect / Disciplines / Artifacts / The Long Build / Contact | معمار / مهارت‌ها / پروژه‌ها / تجربه / تماس | المعمار / المهارات / المشاريع / الخبرة / التواصل | Зодчий / Навыки / Проекты / Опыт / Связь | 建築家 / 技 / 作品 / 経歴 / 連絡 |
| The Sealed Door Is Open | The Sealed Door Is Open | درِ مُهرشده گشوده شد | انفتح الباب المختوم | Запечатанная дверь отворена | 封印の扉が開いた |
| Chamber 499 — and the Codex will hear you. | Chamber 499 — and the Codex will hear you. | تالار ۴۹۹ — و کدکس تو را خواهد شنید. | الحجرة ٤٩٩ — والمخطوط سيسمعك. | Палата 499 — и Кодекс услышит тебя. | 第四九九の間──そして写本が汝の声を聞く。 |
| Arrows move · ✦ acts | Arrows move · ✦ acts | پیکان‌ها حرکت · ✦ کنش | الأسهم للحركة · ✦ للفعل | Стрелки — движение · ✦ — действие | 矢印で移動 · ✦ で行動 |
| A / D move · E acts | A / D move · E acts | A / D حرکت · E کنش | A / D للحركة · E للفعل | A / D — движение · E — действие | A / D で移動 · E で行動 |
| Pause menu holds the Codex | The pause menu keeps the Codex | منوی توقف، کدکس را نگه می‌دارد | قائمة الإيقاف تحفظ المخطوط | Меню паузы хранит Кодекс | 一時停止メニューに写本がある |
| Esc opens the Codex | Esc opens the Codex | Esc کدکس را می‌گشاید | Esc يفتح المخطوط | Esc открывает Кодекс | Esc で写本を開く |
| The Salary Ledger | The Salary Ledger | دفترِ حقوق | دفتر الراتب | Книга жалованья | 給与の帳簿 |
| Play, and earn his discount: reach 500 points and 500,000 Toman comes off his first salary. Below 500, nothing. | Play, and earn his discount: reach 500 points and 500,000 Toman is struck from his first salary. Below 500, nothing. The Goblin keeps the books. | بازی کن و تخفیفش را به دست آور: به ۵۰۰ امتیاز برس تا ۵۰۰٬۰۰۰ تومان از اولین حقوقش کم شود. کمتر از ۵۰۰، هیچ. دفتردارش گابلین است. | العب واكسب خصمه: بلوغ ٥٠٠ نقطة يحسم ٥٠٠٬٠٠٠ تومان من أول راتب له. أقلّ من ٥٠٠، لا شيء. والعفريت يمسك الدفاتر. | Играй и заслужи скидку: набери 500 очков — и 500 000 томанов вычтут из его первого жалованья. Меньше 500 — ничего. Книги ведёт Гоблин. | 遊んで割引を勝ち取れ。500ポイントで、初任給から50万トマンが引かれる。500未満なら、何もない。帳簿はゴブリンが握っている。 |

---

## 8. ACHIEVEMENTS  (`ACHIEVEMENTS` in `10-content.js`; icons unchanged)
| id | field | en | fa | ar | ru | ja |
|---|---|---|---|---|---|---|
| seeker | title | Seeker | جوینده | الباحث | Искатель | 求道者 |
| | sub | You entered Veyrath. | به وِیرَث گام نهادی. | دخلتَ فيرَث. | Ты вошёл в Вейрат. | 汝はヴェイラスに足を踏み入れた。 |
| reader | title | Wall Reader | دیوارخوان | قارئ الجدران | Чтец Стен | 壁を読む者 |
| | sub | Five litanies deciphered. | پنج وِرد را گشودی. | فككتَ خمس ترتيلات. | Расшифровано пять литаний. | 五つの連祷を読み解いた。 |
| whispers | title | Keeper of Whispers | نگهبانِ نجواها | حارس الهمسات | Хранитель Шёпотов | 囁きの守り手 |
| | sub | Every inscription in the world. | همهٔ کتیبه‌های این جهان. | كلّ نقشٍ في هذا العالم. | Каждая надпись этого мира. | この世界のすべての銘。 |
| persistent | title | Persistent Recruiter | جویندهٔ پایدار | الباحث الثابت | Стойкий Искатель | 不屈の求める者 |
| | sub | You returned after failure. | پس از شکست بازگشتی. | عدتَ بعد الإخفاق. | Ты вернулся после поражения. | 敗れても、汝は戻った。 |
| purpose | title | The Purpose | مقصود | الغاية | Замысел | 真意 |
| | sub | You understood the mercy. | رحمت را دریافتی. | فهمتَ الرحمة. | Ты постиг милость. | 汝は慈悲を理解した。 |
| goblin | title | Fooled by the Budget Goblin | فریب‌خوردهٔ گابلینِ بودجه | خُدع من عفريت الميزانية | Одурачен Гоблином Бюджета | 予算ゴブリンに騙された者 |
| | sub | Chamber 499 will remember you. | تالارِ ۴۹۹ تو را به یاد خواهد داشت. | ستذكرك الحجرة ٤٩٩. | Палата 499 тебя запомнит. | 第四九九の間は、汝を忘れぬ。 |
| codex | title | Architect Codex | کُدکسِ معمار | مخطوط المعمار | Кодекс Зодчего | 建築家の写本 |
| | sub | The résumé became a relic. | رزومه، یادگاری کهن شد. | صارت السيرة الذاتية أثرًا مقدّسًا. | Резюме стало реликвией. | 履歴書は聖遺物となった。 |
| audience | title | Request An Audience | درخواستِ دیدار | طلب مقابلة | Просьба об аудиенции | 謁見を請う |
| | sub | The Architect has your message. | پیامت به دستِ معمار رسید. | وصلت رسالتك إلى المعمار. | Зодчий получил твоё послание. | 建築家は汝の言葉を受け取った。 |

**Hidden achievement at 30 deaths (`62-secret.js`).** Do NOT translate, rewrite or print its title anywhere in the new text files, and do not add it to `STR`. Keep the existing shifted-character-code mechanism exactly as is. For `ar`, `ru`, `ja` reuse the `en` title via the same mechanism (add no new codes). Only the small caption is translated:
`caption` (`Hidden achievement · N deaths`): fa: دستاورد پنهان · N بار مردن | ar: إنجازٌ خفيّ · N مرّة موت | ru: Скрытое достижение · N смертей | ja: 隠し実績 · 死亡N回   (N = 30; Persian/Arabic digits localised in fa/ar).

---

## 9. THE CODEX — résumé pages  (`CODEX` in `10-content.js`, `CODEX_FA` in `61-i18n.js`)
**Keep the HTML structure exactly** (`<h2>`, `<p class="lead">`, `<div class="quote">`, `<h3>`, `<ul>`, `<div class="kv"><i>…</i><div>…</div>`). Only text changes. All facts, names, dates, URLs are unchanged. `¶` = paragraph break, `|` = separate element. Because pages are long, build them from `STR` ids `codex.<page>.<n>` per element.

### 9.1 Tab: The Architect  (`codex.architect.*`)
```
en: h2 The Rune Architect | lead Shayan Mirkhani — Web Designer · SEO Specialist · Digital Marketer | quote Punctual. Principled. Precise.
    h3 Who stands behind the runes
    p  A web designer who has led web design and digital marketing teams. He forges WordPress and Elementor sites in clean HTML and CSS, then makes them flourish with SEO, Google Ads and content. He designs themes, writes plugins, and practises prompt and AI engineering.
    h3 Seven pillars
    p  Honesty · Honor · Loyalty · Punctuality · Courage · Hard work · A firm moral code.
    h3 Why a game?
    p  Because a résumé begs to be judged. A world begs to be explored. Veyrath exists so that the first thing you do is <em>walk through</em> the work, not scan it.
fa: h2 معمارِ رون | lead شایان میرخانی — طراح وب · متخصص سئو · مارکتر دیجیتال | quote وقت‌شناس. اصولمند. دقیق.
    h3 چه کسی پشتِ رون‌هاست
    p  طراح وبی که تیم‌های طراحی وب و دیجیتال مارکتینگ را رهبری کرده است. او سایت‌های وردپرس و المنتور را با HTML و CSS پاک می‌سازد، سپس با سئو، گوگل ادز و محتوا شکوفایشان می‌کند. قالب طراحی می‌کند، افزونه می‌نویسد و مهندسی پرامپت و هوش مصنوعی می‌ورزد.
    h3 هفت ستون
    p  صداقت · شرف · وفاداری · وقت‌شناسی · شجاعت · سخت‌کوشی · اصولِ اخلاقیِ استوار.
    h3 چرا یک بازی؟
    p  چون رزومه می‌خواهد داوری شود و جهان می‌خواهد کاویده شود. وِیرَث ساخته شد تا نخستین کارت این باشد که از میانِ کار <em>بگذری</em>، نه اینکه تندتند بخوانیش.
ar: h2 معمار الرونات | lead شايان ميرخاني — مصمّم ويب · أخصائي SEO · مسوّق رقمي | quote دقيق في مواعيده. ثابت على مبادئه. محكم الصنعة.
    h3 من يقف خلف الرونات
    p  مصمّم ويب قاد فرق تصميم الويب والتسويق الرقمي. يبني مواقع WordPress وElementor بـ HTML وCSS نظيفين، ثم يُنميها بالـ SEO وGoogle Ads والمحتوى. يصمّم القوالب ويكتب الإضافات ويمارس هندسة الموجِّهات والذكاء الاصطناعي.
    h3 سبعة أعمدة
    p  الصدق · الشرف · الوفاء · الالتزام بالمواعيد · الشجاعة · الاجتهاد · ميثاقٌ أخلاقي راسخ.
    h3 لماذا لعبة؟
    p  لأن السيرة الذاتية تطلب أن تُحاكَم، والعالم يطلب أن يُستكشف. وُجدت فيرَث لتكون أول ما تفعله هو أن <em>تعبر</em> العمل لا أن تمرّ عليه مرورًا.
ru: h2 Зодчий Рун | lead Шаян Мирхани — веб-дизайнер · SEO-специалист · диджитал-маркетолог | quote Пунктуален. Принципиален. Точен.
    h3 Кто стоит за рунами
    p  Веб-дизайнер, возглавлявший команды веб-дизайна и цифрового маркетинга. Он куёт сайты на WordPress и Elementor на чистых HTML и CSS, а затем растит их через SEO, Google Ads и контент. Проектирует темы, пишет плагины, занимается промпт-инжинирингом и инженерией ИИ.
    h3 Семь столпов
    p  Честность · Честь · Верность · Пунктуальность · Отвага · Трудолюбие · Твёрдый нравственный закон.
    h3 Почему игра?
    p  Потому что резюме просит оценки, а мир просит исследования. Вейрат создан затем, чтобы первым делом ты <em>прошёл сквозь</em> работу, а не пробежал по ней глазами.
ja: h2 ルーンの建築家 | lead シャヤン・ミルハニ — ウェブデザイナー · SEOスペシャリスト · デジタルマーケター | quote 時間に厳しく。信条に忠実に。正確に。
    h3 ルーンの背後にいる者
    p  ウェブデザインとデジタルマーケティングのチームを率いてきたウェブデザイナー。WordPressとElementorのサイトを清らかなHTMLとCSSで鍛え上げ、SEO、Google Ads、コンテンツで育てる。テーマを設計し、プラグインを書き、プロンプトエンジニアリングとAIエンジニアリングを実践する。
    h3 七つの柱
    p  誠実 · 名誉 · 忠義 · 時間厳守 · 勇気 · 勤勉 · 揺るがぬ道徳律。
    h3 なぜゲームなのか
    p  履歴書は審判されることを望み、世界は探索されることを望む。ヴェイラスは、まず仕事の中を<em>歩き抜ける</em>ために在る。流し読みするためではなく。
```

### 9.2 Tab: Skills → "Disciplines"  (`codex.skills.*`)
Tool names stay Latin in all languages. Level words: advanced / proficient / basic.
| en | fa | ar | ru | ja |
|---|---|---|---|---|
| Disciplines | مهارت‌ها | الصنائع | Ремёсла | 技芸 |
| Every skill in this world is a tool he trusts. | هر مهارتِ این جهان، ابزاری است که به آن اعتماد دارد. | كلّ مهارةٍ في هذا العالم أداةٌ يثق بها. | Каждое умение этого мира — инструмент, которому он доверяет. | この世界のあらゆる技は、彼が信を置く道具だ。 |
| advanced / proficient / basic | پیشرفته / مسلط / مقدماتی | متقدّم / متمكّن / أساسي | продвинутый / уверенный / базовый | 上級 / 熟達 / 初級 |
| Master of Adaptive Structures | استادِ ساختارهای انعطاف‌پذیر | سيّد البنى المرنة | Мастер Гибких Структур | 可変構造の達人 |
| Keeper of Discovery | نگهبانِ یافته‌شدن | حارس الاكتشاف | Хранитель Обнаружения | 発見の守り手 |
| Herald of the Market | منادیِ بازار | منادي السوق | Глашатай Рынка | 市場の伝令 |
| Forge Master of Modular Systems | استادِ کورهٔ سیستم‌های ماژولار | سيّد مسبك الأنظمة المعيارية | Мастер Кузни Модульных Систем | モジュール系の鍛冶長 |
| Interpreter of Machine Minds | مفسّرِ ذهن‌های ماشینی | مترجم عقول الآلات | Толкователь Машинных Разумов | 機械の精神の通訳者 |
| Tongues | زبان‌ها | الألسن | Языки | 言語 |
| Theme design / Plugin development | طراحی قالب / توسعهٔ افزونه | تصميم القوالب / تطوير الإضافات | Дизайн тем / Разработка плагинов | テーマ設計 / プラグイン開発 |
| Prompt engineering / AI engineering | مهندسی پرامپت / مهندسی هوش مصنوعی | هندسة الموجِّهات / هندسة الذكاء الاصطناعي | Промпт-инжиниринг / Инженерия ИИ | プロンプトエンジニアリング / AIエンジニアリング |
| English / Russian — basic / Japanese — basic | انگلیسی / روسی — مقدماتی / ژاپنی — مقدماتی | الإنجليزية / الروسية — أساسي / اليابانية — أساسي | Английский / Русский — базовый / Японский — базовый | 英語 / ロシア語（初級）/ 日本語（初級） |

### 9.3 Tab: Projects → "Recovered Artifacts"  (`codex.projects.*`, `WORKS` array)
| en | fa | ar | ru | ja |
|---|---|---|---|---|
| Recovered Artifacts | یادگارهای بازیافته | الآثار المستعادة | Найденные Реликвии | 回収された遺物 |
| Six websites, still standing. Each name is a door. | شش وب‌سایت، هنوز برپا. هر نام، دری است. | ستة مواقع ما زالت قائمة. كلّ اسمٍ بابٌ. | Шесть сайтов всё ещё стоят. Каждое имя — дверь. | 六つのサイトは今も立つ。その名はそれぞれ、扉。 |
| Field note | یادداشتِ میدانی | ملاحظة ميدانية | Заметка с поля | 現地の覚え書き |
| Each artifact was built to be used — not to be admired. | هر یادگار برای کاربرد ساخته شد، نه برای تحسین. | بُني كلُّ أثرٍ ليُستعمل، لا ليُعجَب به. | Каждая реликвия создана, чтобы служить, а не чтобы ею любовались. | どの遺物も、使われるために造られた。賞賛されるためではない。 |
| Sportswear store | فروشگاه پوشاک ورزشی | متجر ملابس رياضية | Магазин спортивной одежды | スポーツウェア店 |
| Digital marketing group | گروه دیجیتال مارکتینگ | مجموعة تسويق رقمي | Группа цифрового маркетинга | デジタルマーケティング集団 |
| Tool store | فروشگاه ابزار | متجر أدوات | Магазин инструментов | 工具店 |
| Web design · SEO | طراحی وب · سئو | تصميم ويب · SEO | Веб-дизайн · SEO | ウェブデザイン · SEO |
| Web design | طراحی وب | تصميم ويب | Веб-дизайн | ウェブデザイン |
| Web design · Site admin | طراحی وب · مدیریت سایت | تصميم ويب · إدارة الموقع | Веб-дизайн · Администрирование | ウェブデザイン · サイト管理 |

### 9.4 Tab: Experience → "The Long Build"  (`codex.experience.*`)
| en | fa | ar | ru | ja |
|---|---|---|---|---|
| The Long Build | ساختنِ دراز | البناء الطويل | Долгое Строительство | 長き造営 |
| Sep 2023 – May 2025 | سپتامبر ۲۰۲۳ – مهٔ ۲۰۲۵ | سبتمبر ٢٠٢٣ – مايو ٢٠٢٥ | сент. 2023 – май 2025 | 2023年9月 – 2025年5月 |
| Feb 2022 – Oct 2023 | فوریهٔ ۲۰۲۲ – اکتبر ۲۰۲۳ | فبراير ٢٠٢٢ – أكتوبر ٢٠٢٣ | февр. 2022 – окт. 2023 | 2022年2月 – 2023年10月 |
| Mar 2022 – Oct 2023 | مارس ۲۰۲۲ – اکتبر ۲۰۲۳ | مارس ٢٠٢٢ – أكتوبر ٢٠٢٣ | март 2022 – окт. 2023 | 2022年3月 – 2023年10月 |
| Head of Digital Marketing · Content Specialist · Web Designer | سرپرست دیجیتال مارکتینگ · متخصص محتوا · طراح وب | رئيس التسويق الرقمي · أخصائي محتوى · مصمّم ويب | Руководитель цифрового маркетинга · Контент-специалист · Веб-дизайнер | デジタルマーケティング責任者 · コンテンツ担当 · ウェブデザイナー |
| Head of Web Design · SEO Consultant | سرپرست طراحی وب · مشاور سئو | رئيس تصميم الويب · مستشار SEO | Руководитель веб-дизайна · SEO-консультант | ウェブデザイン責任者 · SEOコンサルタント |
| SEO Consultant · Website Admin | مشاور سئو · مدیر وب‌سایت | مستشار SEO · مدير الموقع | SEO-консультант · Администратор сайта | SEOコンサルタント · サイト管理者 |
| Method | روش | المنهج | Метод | 方法 |
| Prototype → break → rebuild → ship. Repeat until finished. | نمونه ← شکستن ← بازسازی ← انتشار. تکرار تا پایان. | نموذج ← كسر ← إعادة بناء ← إطلاق. كرّر حتى الإتمام. | Прототип → слом → перестройка → релиз. Повторять до завершения. | 試作 → 破壊 → 再建 → 公開。終わるまで繰り返す。 |
| The Architect completed fewer projects than he imagined.<br>But more than he remembers. | (same as note_repo_5 in §4.5) | | | |
| What he is looking for | آنچه می‌جوید | ما الذي يبحث عنه | Чего он ищет | 彼が求めるもの |
| A team that measures persistence, not only skill — because skills can be taught. | تیمی که پایداری را بسنجد، نه فقط مهارت را — چون مهارت آموختنی است. | فريقٌ يقيس الثبات لا المهارة وحدها — لأن المهارة تُعلَّم. | Команда, измеряющая стойкость, а не только умение, — ведь умению можно научить. | 技だけでなく不屈を測る仲間──技は教えられるのだから。 |

### 9.5 Tab: Contact → "Request An Audience"  (`codex.contact.*`; unlocked after the Throne)
| en | fa | ar | ru | ja |
|---|---|---|---|---|
| Request An Audience | درخواستِ دیدار | طلب مقابلة | Просьба об аудиенции | 謁見を請う |
| You have crossed the world.<br>You have earned the right to speak. | از جهان گذشتی.<br>حقِّ سخن گفتن را به دست آوردی. | عبرتَ العالم.<br>واستحققتَ حقّ الكلام. | Ты пересёк мир.<br>Ты заслужил право говорить. | 汝は世界を渡りきった。<br>語る資格を勝ち取った。 |
| Telegram / Email / Phone / Full résumé | تلگرام / ایمیل / تلفن / رزومهٔ کامل | تيليغرام / البريد / الهاتف / السيرة الكاملة | Telegram / Почта / Телефон / Полное резюме | Telegram / メール / 電話 / 履歴書の全文 |
| Or leave your message here | یا پیامت را اینجا بگذار | أو اترك رسالتك هنا | Или оставь послание здесь | あるいは、ここに言葉を遺せ |
| Who seeks the Architect? | چه کسی معمار را می‌جوید؟ | من يطلب المعمار؟ | Кто ищет Зодчего? | 建築家を求めるのは誰か |
| Your name | نامت | اسمك | Твоё имя | 汝の名 |
| Company / Guild | شرکت / انجمن | الشركة / النقابة | Компания / Гильдия | 会社 / ギルド |
| Where you build | جایی که می‌سازی | حيث تبني | Где ты строишь | 汝が造る場所 |
| Message | پیام | الرسالة | Послание | 言葉 |
| What should be built? | چه باید ساخته شود؟ | ما الذي ينبغي بناؤه؟ | Что должно быть построено? | 何を築くべきか |
| Summon ✦ | فراخوان ✦ | استدعِ ✦ | Призвать ✦ | 召喚 ✦ |

**Locked version (`lockedRender`)**
| en | fa | ar | ru | ja |
|---|---|---|---|---|
| This page has not been earned yet. | این صفحه هنوز به دست نیامده است. | لم تُستحقّ هذه الصفحة بعد. | Эта страница ещё не заслужена. | この頁は、まだ勝ち取られていない。 |
| The Architect does not read letters from strangers.<br>He reads the ones who reached the Throne. | معمار نامهٔ ناشناسان را نمی‌خواند.<br>نامهٔ آنان را می‌خواند که به سریر رسیدند. | لا يقرأ المعمار رسائل الغرباء.<br>يقرأ رسائل من بلغوا العرش. | Зодчий не читает писем чужаков.<br>Он читает письма тех, кто дошёл до Трона. | 建築家は見知らぬ者の手紙を読まぬ。<br>玉座に至った者のものだけを読む。 |
| The only road | تنها راه | الطريق الوحيد | Единственный путь | 唯一の道 |
| Step 1 — Cross the Forge, the Forest, the Cathedral, the Machine Halls. | گام ۱ — از کارگاه، جنگل، کلیسا و تالارهای ماشین بگذر. | الخطوة ١ — اعبر المِسبَك والغابة والكاتدرائية وأروقة الآلة. | Шаг 1 — Пройди Кузню, Лес, Собор и Машинные Залы. | 第一歩──鍛冶場、森、大聖堂、機械の回廊を越えよ。 |
| Step 2 — Walk the Ossuary of Lost Creations. All of it. | گام ۲ — استودانِ آفریده‌های گم‌شده را بپیما. همهٔ آن را. | الخطوة ٢ — سِر في عظامية المخلوقات الضائعة. كلَّها. | Шаг 2 — Пройди Оссуарий Утраченных Творений. Весь. | 第二歩──失われた創造の納骨堂を歩き尽くせ。 |
| Step 3 — Enter the Throne. Prove that you are serious. | گام ۳ — به سریر درآی. ثابت کن که جدی‌ای. | الخطوة ٣ — ادخل العرش. أثبت أنك جادّ. | Шаг 3 — Войди в Тронный зал. Докажи, что настроен всерьёз. | 第三歩──玉座に入れ。本気であると示せ。 |
| Step 4 — Then, and only then, this page opens. | گام ۴ — آنگاه، و تنها آنگاه، این صفحه گشوده می‌شود. | الخطوة ٤ — حينها فقط تنفتح هذه الصفحة. | Шаг 4 — Тогда, и только тогда, эта страница откроется. | 第四歩──そのときにのみ、この頁は開く。 |
| There is no form below. There is no shortcut. That is not a bug: <em>the only way to reach him is to stand before him.</em> | لا فرمی در کار است. و راه‌میانبری نیست. این باگ نیست: <em>تنها راهِ رسیدن به او، ایستادن در برابر اوست.</em> | لا نموذج أدناه. ولا طريق مختصر. وهذا ليس خللًا: <em>الطريق الوحيد إليه هو أن تقف أمامه.</em> | Формы ниже нет. Короткого пути нет. Это не баг: <em>единственный путь к нему — встать перед ним.</em> | 下に書式はない。近道もない。これは不具合ではない。<em>彼に届く唯一の道は、彼の前に立つことだ。</em> |

---

## 10. FINAL NOTES TO THE AGENT
1. **Strings missing from this file** (anything you find hard-coded that isn't here): do not invent text. Add an `en` placeholder, translate it faithfully in Blasphemous tone, and list it in `REPORT.md` under "New strings".
2. **Persian numerals**: keep using Persian digits in `fa` and Arabic-Indic digits in `ar`, Latin digits in `en/ru/ja`. Never inside URLs, handles, phone numbers, emails, version tags.
3. **Persian typography**: keep ZWNJ (نیم‌فاصله) exactly as written in this file.
4. **Do not** touch art, audio synthesis, music, collisions, maps, save schema or `CONTACT`. After the work run the existing `verify.mjs`/`walk.mjs`/`reach.mjs` checks and add screenshots of one dialogue + the goblin trap screen in each of the 5 languages.
5. **Report back to Shayan** in `REPORT.md`: what was migrated, how the language switch works, narration audio behaviour (§0.6), fonts added and total file-size change.

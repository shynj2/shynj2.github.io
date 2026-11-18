# Text audit — Round 9

Every string that was CHANGED in Round 9, with the reason. New strings (weapons, the fight, RE-sync, the pictures, the score, credits) are not listed: they have no "old" text; they are in `art-src/text/r9/*.mjs`.

**What was read, honestly.** English and Persian: the opening, the Keeper's records, the notice board, the goblin, the fight and every line touched in this round were read in the running game. Arabic, Russian and Japanese were corrected where a rule applied to all languages (the title, the name, the 500 / 500,000 line, bidi isolation, punctuation), but they were **not** read line by line in context, and no native speaker has checked them.

Changed strings: 454 (English 68, Persian 180, Arabic 70, Russian 68, Japanese 68).

## 01-name-title.mjs — 204 changes

| id | lang | old | new | why |
|---|---|---|---|---|
| `who.shyn_full` | en | Shyn, the Rune Architect | {N}, Keeper of the Root Code | "Architect" removed (§4); the name is first name only, redacted until the boss falls |
| `who.shyn_full` | fa | شایان، معمارِ رون | {N}، نگهبان کد ریشه | "Architect" removed (§4); the name is first name only, redacted until the boss falls |
| `who.shyn_full` | ar | شايان، معمار الرونات | {N}، حارس الشفرة الجذرية | "Architect" removed (§4); the name is first name only, redacted until the boss falls |
| `who.shyn_full` | ru | Шайн, Зодчий Рун | {N}, Хранитель Корневого Кода | "Architect" removed (§4); the name is first name only, redacted until the boss falls |
| `who.shyn_full` | ja | ルーンの建築家、シャイン | 根源コードの守護者、{N} | "Architect" removed (§4); the name is first name only, redacted until the boss falls |
| `who.shyn` | en | Shyn | {N} | "Architect" removed (§4); the name is first name only, redacted until the boss falls |
| `who.shyn` | fa | شایان | {N} | "Architect" removed (§4); the name is first name only, redacted until the boss falls |
| `who.shyn` | ar | شايان | {N} | "Architect" removed (§4); the name is first name only, redacted until the boss falls |
| `who.shyn` | ru | Шайн | {N} | "Architect" removed (§4); the name is first name only, redacted until the boss falls |
| `who.shyn` | ja | シャイン | {N} | "Architect" removed (§4); the name is first name only, redacted until the boss falls |
| `who.record.I` | en | The Architect's Record · I | The Keeper's Record · I | "Architect" removed (§4); the name is first name only, redacted until the boss falls |
| `who.record.I` | fa | کارنامهٔ معمار · یک | کارنامهٔ نگهبان · یک | "Architect" removed (§4); the name is first name only, redacted until the boss falls |
| `who.record.I` | ar | سجلّ المعمار · ١ | سجلّ الحارس · ١ | "Architect" removed (§4); the name is first name only, redacted until the boss falls |
| `who.record.I` | ru | Свиток Зодчего · I | Свиток Хранителя · I | "Architect" removed (§4); the name is first name only, redacted until the boss falls |
| `who.record.I` | ja | 建築家の記録 · I | 守り手の記録 · I | "Architect" removed (§4); the name is first name only, redacted until the boss falls |
| `who.record.II` | en | The Architect's Record · II | The Keeper's Record · II | "Architect" removed (§4); the name is first name only, redacted until the boss falls |
| `who.record.II` | fa | کارنامهٔ معمار · دو | کارنامهٔ نگهبان · دو | "Architect" removed (§4); the name is first name only, redacted until the boss falls |
| `who.record.II` | ar | سجلّ المعمار · ٢ | سجلّ الحارس · ٢ | "Architect" removed (§4); the name is first name only, redacted until the boss falls |
| `who.record.II` | ru | Свиток Зодчего · II | Свиток Хранителя · II | "Architect" removed (§4); the name is first name only, redacted until the boss falls |
| `who.record.II` | ja | 建築家の記録 · II | 守り手の記録 · II | "Architect" removed (§4); the name is first name only, redacted until the boss falls |
| `who.record.III` | en | The Architect's Record · III | The Keeper's Record · III | "Architect" removed (§4); the name is first name only, redacted until the boss falls |
| `who.record.III` | fa | کارنامهٔ معمار · سه | کارنامهٔ نگهبان · سه | "Architect" removed (§4); the name is first name only, redacted until the boss falls |
| `who.record.III` | ar | سجلّ المعمار · ٣ | سجلّ الحارس · ٣ | "Architect" removed (§4); the name is first name only, redacted until the boss falls |
| `who.record.III` | ru | Свиток Зодчего · III | Свиток Хранителя · III | "Architect" removed (§4); the name is first name only, redacted until the boss falls |
| `who.record.III` | ja | 建築家の記録 · III | 守り手の記録 · III | "Architect" removed (§4); the name is first name only, redacted until the boss falls |
| `who.record.IV` | en | The Architect's Record · IV | The Keeper's Record · IV | "Architect" removed (§4); the name is first name only, redacted until the boss falls |
| `who.record.IV` | fa | کارنامهٔ معمار · چهار | کارنامهٔ نگهبان · چهار | "Architect" removed (§4); the name is first name only, redacted until the boss falls |
| `who.record.IV` | ar | سجلّ المعمار · ٤ | سجلّ الحارس · ٤ | "Architect" removed (§4); the name is first name only, redacted until the boss falls |
| `who.record.IV` | ru | Свиток Зодчего · IV | Свиток Хранителя · IV | "Architect" removed (§4); the name is first name only, redacted until the boss falls |
| `who.record.IV` | ja | 建築家の記録 · IV | 守り手の記録 · IV | "Architect" removed (§4); the name is first name only, redacted until the boss falls |
| `who.record.V` | en | The Architect's Record · V | The Keeper's Record · V | "Architect" removed (§4); the name is first name only, redacted until the boss falls |
| `who.record.V` | fa | کارنامهٔ معمار · پنج | کارنامهٔ نگهبان · پنج | "Architect" removed (§4); the name is first name only, redacted until the boss falls |
| `who.record.V` | ar | سجلّ المعمار · ٥ | سجلّ الحارس · ٥ | "Architect" removed (§4); the name is first name only, redacted until the boss falls |
| `who.record.V` | ru | Свиток Зодчего · V | Свиток Хранителя · V | "Architect" removed (§4); the name is first name only, redacted until the boss falls |
| `who.record.V` | ja | 建築家の記録 · V | 守り手の記録 · V | "Architect" removed (§4); the name is first name only, redacted until the boss falls |
| `who.record.VI` | en | The Architect's Record · VI | The Keeper's Record · VI | "Architect" removed (§4); the name is first name only, redacted until the boss falls |
| `who.record.VI` | fa | کارنامهٔ معمار · شش | کارنامهٔ نگهبان · شش | "Architect" removed (§4); the name is first name only, redacted until the boss falls |
| `who.record.VI` | ar | سجلّ المعمار · ٦ | سجلّ الحارس · ٦ | "Architect" removed (§4); the name is first name only, redacted until the boss falls |
| `who.record.VI` | ru | Свиток Зодчего · VI | Свиток Хранителя · VI | "Architect" removed (§4); the name is first name only, redacted until the boss falls |
| `who.record.VI` | ja | 建築家の記録 · VI | 守り手の記録 · VI | "Architect" removed (§4); the name is first name only, redacted until the boss falls |
| `zone.workshop.sub` | en | Where the Architect was hammered into being, among tools and ash | Where a builder was hammered into being, among tools and ash | "Architect" removed (§4); the name is first name only, redacted until the boss falls |
| `zone.workshop.sub` | fa | جایی که معمار میانِ ابزار و خاکستر، شکل گرفت | جایی که سازنده‌ای در میان ابزار و خاکستر چکش خورد و شکل گرفت | "Architect" removed (§4); the name is first name only, redacted until the boss falls |
| `zone.workshop.sub` | ar | حيث طُرق المعمار على السندان بين الأدوات والرماد | حيث طُرق بنّاءٌ حتى صار، بين الأدوات والرماد | "Architect" removed (§4); the name is first name only, redacted until the boss falls |
| `zone.workshop.sub` | ru | Здесь Зодчего выковали среди инструментов и пепла | Где мастера выковали среди инструментов и пепла | "Architect" removed (§4); the name is first name only, redacted until the boss falls |
| `zone.workshop.sub` | ja | 道具と灰のあいだで、建築家が鍛え上げられた場所 | 道具と灰のあいだで、ひとりの作り手が鍛えられた場所 | "Architect" removed (§4); the name is first name only, redacted until the boss falls |
| `zone.workshop.obj` | en | Only the Throne grants an audience with the Architect. | Only the Throne grants an audience with the Keeper. | "Architect" removed (§4); the name is first name only, redacted until the boss falls |
| `zone.workshop.obj` | fa | تنها سریر، دیدار با معمار را روا می‌دارد. | تنها سریر است که به دیدار نگهبان راه می‌دهد. | "Architect" removed (§4); the name is first name only, redacted until the boss falls |
| `zone.workshop.obj` | ar | وحده العرش يمنح مقابلة المعمار. | العرش وحده يمنح لقاء الحارس. | "Architect" removed (§4); the name is first name only, redacted until the boss falls |
| `zone.workshop.obj` | ru | Лишь Трон дарует встречу с Зодчим. | Лишь Трон дарует встречу с Хранителем. | "Architect" removed (§4); the name is first name only, redacted until the boss falls |
| `zone.workshop.obj` | ja | 建築家に謁見できるのは、玉座のみ。 | 守り手への謁見を許すのは、玉座のみ。 | "Architect" removed (§4); the name is first name only, redacted until the boss falls |
| `zone.throne.name` | en | Throne of the Rune Architect | Throne of the Root Code | "Architect" removed (§4); the name is first name only, redacted until the boss falls |
| `zone.throne.name` | fa | سریرِ معمارِ رون | سریر کد ریشه | "Architect" removed (§4); the name is first name only, redacted until the boss falls |
| `zone.throne.name` | ar | عرش معمار الرونات | عرش الشفرة الجذرية | "Architect" removed (§4); the name is first name only, redacted until the boss falls |
| `zone.throne.name` | ru | Трон Зодчего Рун | Трон Корневого Кода | "Architect" removed (§4); the name is first name only, redacted until the boss falls |
| `zone.throne.name` | ja | ルーンの建築家の玉座 | 根源コードの玉座 | "Architect" removed (§4); the name is first name only, redacted until the boss falls |
| `zone.throne.boss.name` | en | Shyn — Keeper of the Root Code | {N} — Keeper of the Root Code | "Architect" removed (§4); the name is first name only, redacted until the boss falls |
| `zone.throne.boss.name` | fa | شایان — نگهبانِ کُدِ ریشه | {N} — نگهبان کد ریشه | "Architect" removed (§4); the name is first name only, redacted until the boss falls |
| `zone.throne.boss.name` | ar | شايان — حارس الشفرة الجذرية | {N} — حارس الشفرة الجذرية | "Architect" removed (§4); the name is first name only, redacted until the boss falls |
| `zone.throne.boss.name` | ru | Шайн — Хранитель Корневого Кода | {N} — Хранитель Корневого Кода | "Architect" removed (§4); the name is first name only, redacted until the boss falls |
| `zone.throne.boss.name` | ja | シャイン――根源コードの守護者 | {N}――根源コードの守護者 | "Architect" removed (§4); the name is first name only, redacted until the boss falls |
| `librarian_workshop.3` | en | The Architect was not born in a palace. ⏎ He rose from the anvil, through ash. | {N} was not born in a palace. ⏎ He rose from the anvil, through ash. | "Architect" removed (§4); the name is first name only, redacted until the boss falls |
| `librarian_workshop.3` | fa | معمار در کاخ زاده نشد. ⏎ از سندان برخاست، از میانِ خاکستر. | {N} در کاخ زاده نشد. ⏎ از سندان برخاست، از میان خاکستر. | "Architect" removed (§4); the name is first name only, redacted until the boss falls |
| `librarian_workshop.3` | ar | لم يُولد المعمار في قصر. ⏎ بل نهض من السندان، عبر الرماد. | لم يولد {N} في قصر. ⏎ بل نهض من السندان، عبر الرماد. | "Architect" removed (§4); the name is first name only, redacted until the boss falls |
| `librarian_workshop.3` | ru | Зодчий родился не во дворце. ⏎ Он поднялся от наковальни, сквозь пепел. | {N} не родился во дворце. ⏎ Он поднялся от наковальни, сквозь пепел. | "Architect" removed (§4); the name is first name only, redacted until the boss falls |
| `librarian_workshop.3` | ja | 建築家は宮殿に生まれなかった。 ⏎ 金床から、灰を越えて立ち上がった。 | {N}は宮殿に生まれたのではない。 ⏎ 金床から、灰をくぐって立ち上がった。 | "Architect" removed (§4); the name is first name only, redacted until the boss falls |
| `note_workshop_4.1` | en | To speak with the Architect, ⏎ you must reach his Throne. | To speak with the Keeper, ⏎ you must reach his Throne. | "Architect" removed (§4); the name is first name only, redacted until the boss falls |
| `note_workshop_4.1` | fa | برای سخن گفتن با معمار، ⏎ باید به سریرش برسی. | برای سخن گفتن با نگهبان، ⏎ باید به سریرش برسی. | "Architect" removed (§4); the name is first name only, redacted until the boss falls |
| `note_workshop_4.1` | ar | لتكلّم المعمار ⏎ عليك أن تبلغ عرشه. | لتكلّم الحارس، ⏎ عليك أن تبلغ عرشه. | "Architect" removed (§4); the name is first name only, redacted until the boss falls |
| `note_workshop_4.1` | ru | Чтобы говорить с Зодчим, ⏎ ты должен дойти до его Трона. | Чтобы говорить с Хранителем, ⏎ ты должен дойти до его Трона. | "Architect" removed (§4); the name is first name only, redacted until the boss falls |
| `note_workshop_4.1` | ja | 建築家と語らうなら、 ⏎ 玉座にたどり着かねばならぬ。 | 守り手と語らうには、 ⏎ その玉座に辿り着かねばならぬ。 | "Architect" removed (§4); the name is first name only, redacted until the boss falls |
| `note_workshop_4.2` | en | Three gates will bar your way. ⏎ The last of them is he. | Four ways lie asleep before you. ⏎ The last gate is he. | said "three gates", but four sleeping ways (forest, cathedral, machine halls, ossuary) lie before the Throne |
| `note_workshop_4.2` | fa | سه دروازه راهت را خواهند بست. ⏎ واپسینشان خودِ اوست. | چهار راه پیش رویت خفته‌اند. ⏎ واپسین دروازه خود اوست. | said "three gates", but four sleeping ways (forest, cathedral, machine halls, ossuary) lie before the Throne |
| `note_workshop_4.2` | ar | ثلاث بوابات ستسدّ دربك. ⏎ وآخرها هو نفسه. | أربعة دروبٍ نائمةٌ أمامك. ⏎ والبوابة الأخيرة هو نفسه. | said "three gates", but four sleeping ways (forest, cathedral, machine halls, ossuary) lie before the Throne |
| `note_workshop_4.2` | ru | Трое врат преградят тебе путь. ⏎ Последние из них — он сам. | Четыре пути спят перед тобой. ⏎ Последние врата — он сам. | said "three gates", but four sleeping ways (forest, cathedral, machine halls, ossuary) lie before the Throne |
| `note_workshop_4.2` | ja | 三つの門が汝の道を阻む。 ⏎ 最後の門は、彼自身。 | 四つの道が、汝の前に眠っている。 ⏎ 最後の門は、彼そのものだ。 | said "three gates", but four sleeping ways (forest, cathedral, machine halls, ossuary) lie before the Throne |
| `librarian_cathedral.2` | en | The Architect learned that users ⏎ have no use for brilliance. | {N} learned that users ⏎ have no use for brilliance. | "Architect" removed (§4); the name is first name only, redacted until the boss falls |
| `librarian_cathedral.2` | fa | معمار آموخت که کاربران ⏎ نیازی به درخشش ندارند. | {N} آموخت که کاربران ⏎ نیازی به درخشش ندارند. | "Architect" removed (§4); the name is first name only, redacted until the boss falls |
| `librarian_cathedral.2` | ar | تعلّم المعمار أنّ المستخدمين ⏎ لا يعبؤون بالبهرجة. | تعلّم {N} أنّ المستخدمين ⏎ لا حاجة لهم بالبراعة. | "Architect" removed (§4); the name is first name only, redacted until the boss falls |
| `librarian_cathedral.2` | ru | Зодчий усвоил: пользователям ⏎ до блеска нет дела. | {N} понял: пользователям ⏎ не нужен блеск. | "Architect" removed (§4); the name is first name only, redacted until the boss falls |
| `librarian_cathedral.2` | ja | 建築家は知った。使う者は ⏎ 輝きなど気にかけぬと。 | {N}は学んだ。使う者たちに ⏎ 才気など要らぬのだと。 | "Architect" removed (§4); the name is first name only, redacted until the boss falls |
| `note_catacomb_3.2` | en | The Architect does not sleep. | Sleep: not found. | "The Architect does not sleep" under a 404 made no joke; now the 404 itself is the joke |
| `note_catacomb_3.2` | fa | معمار نمی‌خوابد. | خواب: یافت نشد. | "The Architect does not sleep" under a 404 made no joke; now the 404 itself is the joke |
| `note_catacomb_3.2` | ar | المعمار لا ينام. | النوم: غير موجود. | "The Architect does not sleep" under a 404 made no joke; now the 404 itself is the joke |
| `note_catacomb_3.2` | ru | Зодчий не спит. | Сон: не найден. | "The Architect does not sleep" under a 404 made no joke; now the 404 itself is the joke |
| `note_catacomb_3.2` | ja | 建築家は眠らぬ。 | 眠り：見つかりません。 | "The Architect does not sleep" under a 404 made no joke; now the 404 itself is the joke |
| `note_repo_5.1` | en | The Architect completed fewer projects ⏎ than he imagined. | He finished fewer works ⏎ than he imagined. | "Architect" removed (§4); the name is first name only, redacted until the boss falls |
| `note_repo_5.1` | fa | معمار کمتر از آنچه می‌پنداشت ⏎ پروژه به پایان برد. | او کمتر از آنچه می‌پنداشت ⏎ کار به پایان برد. | "Architect" removed (§4); the name is first name only, redacted until the boss falls |
| `note_repo_5.1` | ar | أتمّ المعمار مشاريعَ ⏎ أقلّ مما تخيّل. | أتمّ من الأعمال ⏎ أقلّ ممّا تخيّل. | "Architect" removed (§4); the name is first name only, redacted until the boss falls |
| `note_repo_5.1` | ru | Зодчий завершил меньше замыслов, ⏎ чем воображал. | Он завершил меньше работ, ⏎ чем воображал. | "Architect" removed (§4); the name is first name only, redacted until the boss falls |
| `note_repo_5.1` | ja | 建築家が完成させたものは、 ⏎ 思い描いたより少ない。 | 彼が完成させたものは、 ⏎ 思い描いたより少ない。 | "Architect" removed (§4); the name is first name only, redacted until the boss falls |
| `gate_arena.1` | en | Beyond this gate stands ⏎ The Rune Architect. | Beyond this gate stands ⏎ the Keeper of the Root Code. | "Architect" removed (§4); the name is first name only, redacted until the boss falls |
| `gate_arena.1` | fa | آن‌سوی این دروازه ⏎ معمارِ رون ایستاده است. | آن‌سوی این دروازه ⏎ نگهبان کد ریشه ایستاده است. | "Architect" removed (§4); the name is first name only, redacted until the boss falls |
| `gate_arena.1` | ar | خلف هذه البوابة يقف ⏎ معمار الرونات. | خلف هذه البوابة يقف ⏎ حارس الشفرة الجذرية. | "Architect" removed (§4); the name is first name only, redacted until the boss falls |
| `gate_arena.1` | ru | За этими вратами стоит ⏎ Зодчий Рун. | За этими вратами стоит ⏎ Хранитель Корневого Кода. | "Architect" removed (§4); the name is first name only, redacted until the boss falls |
| `gate_arena.1` | ja | この門の向こうに立つのは、 ⏎ ルーンの建築家。 | この門の向こうに立つは、 ⏎ 根源コードの守護者。 | "Architect" removed (§4); the name is first name only, redacted until the boss falls |
| `sealed_contact.3` | en | The Architect may be reached ⏎ only by one who has broken him — ⏎ and then chose mercy. | {N} may be reached only by one ⏎ who has stood before him ⏎ to the very end. | promised "break him, then choose mercy": the fight no longer works that way, and the dash dangled at the line end in Persian and Arabic |
| `sealed_contact.3` | fa | تنها کسی به معمار می‌رسد ⏎ که او را شکسته — ⏎ و آنگاه رحمت برگزیده. | تنها کسی به {N} می‌رسد ⏎ که تا واپسین دم ⏎ روبه‌رویش ایستاده باشد. | promised "break him, then choose mercy": the fight no longer works that way, and the dash dangled at the line end in Persian and Arabic |
| `sealed_contact.3` | ar | لا يبلغ المعمارَ ⏎ إلا من كسره — ⏎ ثم اختار الرحمة. | لا يبلغ {N} إلا من ⏎ وقف أمامه ⏎ حتى النهاية. | promised "break him, then choose mercy": the fight no longer works that way, and the dash dangled at the line end in Persian and Arabic |
| `sealed_contact.3` | ru | До Зодчего дойдёт лишь тот, ⏎ кто мог сокрушить его — ⏎ и выбрал милость. | До него дойдёт лишь тот, ⏎ кто выстоял перед ним ⏎ до самого конца. | promised "break him, then choose mercy": the fight no longer works that way, and the dash dangled at the line end in Persian and Arabic |
| `sealed_contact.3` | ja | 建築家に届くのは、 ⏎ 彼を打ち砕き得たのに ⏎ 慈悲を選んだ者のみ。 | {N}に届くのは、 ⏎ 最後まで彼の前に ⏎ 立ち続けた者だけだ。 | promised "break him, then choose mercy": the fight no longer works that way, and the dash dangled at the line end in Persian and Arabic |
| `cv_workshop.1` | en | Shayan Mirkhani. ⏎ Web designer. SEO specialist. ⏎ Digital marketer. | {N}. ⏎ Web designer. SEO specialist. ⏎ Digital marketer. | first name only (§4) |
| `cv_workshop.1` | fa | شایان میرخانی. ⏎ طراح وب. متخصص سئو. ⏎ مارکتر دیجیتال. | {N}. ⏎ طراح وب. متخصص سئو. ⏎ مارکتر دیجیتال. | first name only (§4) |
| `cv_workshop.1` | ar | شايان ميرخاني. ⏎ مصمّم ويب. أخصائي SEO. ⏎ مسوّق رقمي. | {N}. ⏎ مصمّم ويب. أخصائي SEO. ⏎ مسوّق رقمي. | first name only (§4) |
| `cv_workshop.1` | ru | Шаян Мирхани. ⏎ Веб-дизайнер. SEO-специалист. ⏎ Диджитал-маркетолог. | {N}. ⏎ Веб-дизайнер. SEO-специалист. ⏎ Диджитал-маркетолог. | first name only (§4) |
| `cv_workshop.1` | ja | シャヤン・ミルハニ。 ⏎ ウェブデザイナー。SEOスペシャリスト。 ⏎ デジタルマーケター。 | {N}。 ⏎ ウェブデザイナー。SEOスペシャリスト。 ⏎ デジタルマーケター。 | first name only (§4) |
| `cv_workshop.2` | fa | او سایت‌های وردپرس و المنتور را ⏎ با HTML و CSS پاک می‌سازد — | او سایت‌های وردپرس و المنتور را ⏎ با HTML و CSS پاکیزه می‌سازد، | a dash left hanging at the end of a right-to-left line (owner's screenshot); "پاک می‌سازد" also read as "wipes clean" |
| `cv_workshop.2` | ar | يبني مواقع WordPress وElementor ⏎ بـ HTML وCSS نظيفين — | يبني مواقع WordPress وElementor ⏎ بـ HTML وCSS نظيفين، | a dash left hanging at the end of a right-to-left line (owner's screenshot); "پاک می‌سازد" also read as "wipes clean" |
| `cv.go_further` | fa | اگر می‌خواهی با او سخن بگویی — ⏎ پیش‌تر برو. | اگر می‌خواهی با او سخن بگویی، ⏎ پیش‌تر برو. | dash left hanging at the end of a right-to-left line |
| `cv.go_further` | ar | إن أردتَ محادثته — ⏎ فتقدّم أكثر. | إن أردتَ محادثته، ⏎ فتقدّم أكثر. | dash left hanging at the end of a right-to-left line |
| `codex.architect.lead` | en | Shayan Mirkhani — Web Designer · SEO Specialist · Digital Marketer | {N} — Web Designer · SEO Specialist · Digital Marketer | first name only (§4) |
| `codex.architect.lead` | fa | شایان میرخانی — طراح وب · متخصص سئو · مارکتر دیجیتال | {N} — طراح وب · متخصص سئو · مارکتر دیجیتال | first name only (§4) |
| `codex.architect.lead` | ar | شايان ميرخاني — مصمّم ويب · أخصائي SEO · مسوّق رقمي | {N} — مصمّم ويب · أخصائي SEO · مسوّق رقمي | first name only (§4) |
| `codex.architect.lead` | ru | Шаян Мирхани — веб-дизайнер · SEO-специалист · диджитал-маркетолог | {N} — веб-дизайнер · SEO-специалист · диджитал-маркетолог | first name only (§4) |
| `codex.architect.lead` | ja | シャヤン・ミルハニ — ウェブデザイナー · SEOスペシャリスト · デジタルマーケター | {N} — ウェブデザイナー · SEOスペシャリスト · デジタルマーケター | first name only (§4) |
| `goblin_intro.3` | en | You came for the discount. Of course you did. ⏎ 500 points — and 500,000 Toman ⏎ off the Architect's first salary. | You came for the discount. Of course. ⏎ Reach 500 points, and 500,000 Toman ⏎ comes off {N}'s first salary. | the owner's example: what is discounted, and for what, was unclear; "Architect" removed |
| `goblin_intro.3` | fa | برای تخفیف آمده‌ای. معلوم است. ⏎ ۵۰۰ امتیاز — و ۵۰۰٬۰۰۰ تومان ⏎ از اولین حقوقِ معمار کم می‌شود. | برای تخفیف آمده‌ای. معلوم است. ⏎ به ۵۰۰ امتیاز برسی، ۵۰۰٬۰۰۰ تومان ⏎ از اولین حقوق {N} کم می‌شود. | the owner's example: what is discounted, and for what, was unclear; "Architect" removed |
| `goblin_intro.3` | ar | جئتَ من أجل الخصم. بالطبع. ⏎ ٥٠٠ نقطة — وخمسمئة ألف تومان ⏎ تُحسم من أول راتب للمعمار. | جئتَ من أجل الخصم. بالطبع. ⏎ ابلغ ٥٠٠ نقطة، فيُحسم ٥٠٠٬٠٠٠ تومان ⏎ من أول راتبٍ يتقاضاه {N}. | the owner's example: what is discounted, and for what, was unclear; "Architect" removed |
| `goblin_intro.3` | ru | Ты пришёл за скидкой. Конечно. ⏎ 500 очков — и 500 000 томанов ⏎ с первого жалованья Зодчего. | Ты пришёл за скидкой. Конечно. ⏎ Наберёшь 500 очков — и из первого жалованья, ⏎ что получит {N}, вычтут 500 000 томанов. | the owner's example: what is discounted, and for what, was unclear; "Architect" removed |
| `goblin_intro.3` | ja | 割引目当てですな。当然です。 ⏎ 500ポイントで、建築家の初任給から ⏎ 50万トマンが引かれます。 | 割引目当てですな。当然です。 ⏎ 500ポイントに届けば、{N}の初任給から ⏎ 50万トマンが引かれます。 | the owner's example: what is discounted, and for what, was unclear; "Architect" removed |
| `goblin_zero.3` | en | Nobody buys the Architect ⏎ at a discount. ⏎ Not even in hell. I asked. | Nobody buys {N} ⏎ at a discount. ⏎ Not even in hell. I asked. | "Architect" removed (§4); the name is first name only, redacted until the boss falls |
| `goblin_zero.3` | fa | هیچ‌کس معمار را ⏎ با تخفیف نمی‌خرد. ⏎ حتی در جهنم. پرسیدم. | هیچ‌کس {N} را ⏎ با تخفیف نمی‌خرد. ⏎ حتی در جهنم. پرسیدم. | "Architect" removed (§4); the name is first name only, redacted until the boss falls |
| `goblin_zero.3` | ar | لا أحد يشتري المعمار ⏎ بخصم. ⏎ ولا حتى في الجحيم. سألتُ. | لا أحد يشتري {N} ⏎ بخصم. ⏎ ولا حتى في الجحيم. سألتُ. | "Architect" removed (§4); the name is first name only, redacted until the boss falls |
| `goblin_zero.3` | ru | Зодчего не покупают ⏎ со скидкой. ⏎ Даже в аду. Я спрашивал. | {N} не продаётся ⏎ со скидкой. ⏎ Даже в аду. Я спрашивал. | "Architect" removed (§4); the name is first name only, redacted until the boss falls |
| `goblin_zero.3` | ja | 建築家は割引では買えません。 ⏎ 地獄ですら。聞いてきました。 | {N}を割引で ⏎ 買える者はおりません。 ⏎ 地獄でさえ。確認済みです。 | "Architect" removed (§4); the name is first name only, redacted until the boss falls |
| `goblin_after.2` | en | The Architect is in the Codex. ⏎ Behind you. Always behind you. ⏎ Like an invoice. | {N} is in the Codex. ⏎ Behind you. Always behind you. ⏎ Like an invoice. | "Architect" removed (§4); the name is first name only, redacted until the boss falls |
| `goblin_after.2` | fa | معمار در کدکس است. ⏎ پشتِ سرت. همیشه پشتِ سرت. ⏎ مثل یک صورت‌حساب. | {N} در کدکس است. ⏎ پشت سرت. همیشه پشت سرت. ⏎ مثل یک صورت‌حساب. | "Architect" removed (§4); the name is first name only, redacted until the boss falls |
| `goblin_after.2` | ar | المعمار في المخطوط. ⏎ خلفك. دائمًا خلفك. ⏎ مثل فاتورة. | {N} في المخطوط. ⏎ خلفك. دائمًا خلفك. ⏎ مثل فاتورة. | "Architect" removed (§4); the name is first name only, redacted until the boss falls |
| `goblin_after.2` | ru | Зодчий — в Кодексе. ⏎ За твоей спиной. Всегда за спиной. ⏎ Как счёт к оплате. | {N} — в Кодексе. ⏎ За спиной. Всегда за спиной. ⏎ Как счёт к оплате. | "Architect" removed (§4); the name is first name only, redacted until the boss falls |
| `goblin_after.2` | ja | 建築家は写本の中におります。 ⏎ お前の背後に。常に背後に。 ⏎ 請求書のように。 | {N}は写本の中に。 ⏎ 背後に。いつも背後に。 ⏎ 請求書のように。 | "Architect" removed (§4); the name is first name only, redacted until the boss falls |
| `goblin.final.2` | en | The Rune Architect sealed this loophole ⏎ three versions ago. | {N} sealed this loophole ⏎ three versions ago. | "Architect" removed (§4); the name is first name only, redacted until the boss falls |
| `goblin.final.2` | fa | معمارِ رون این روزنه را ⏎ سه نسخه پیش مُهر کرد. | {N} این روزنه را ⏎ سه نسخه پیش مهر کرد. | "Architect" removed (§4); the name is first name only, redacted until the boss falls |
| `goblin.final.2` | ar | ختم معمار الرونات هذه الثغرة ⏎ قبل ثلاثة إصدارات. | {N} سدّ هذه الثغرة ⏎ قبل ثلاثة إصدارات. | "Architect" removed (§4); the name is first name only, redacted until the boss falls |
| `goblin.final.2` | ru | Зодчий Рун запечатал эту лазейку ⏎ три версии назад. | {N} закрыл эту лазейку ⏎ три версии назад. | "Architect" removed (§4); the name is first name only, redacted until the boss falls |
| `goblin.final.2` | ja | ルーンの建築家は、この抜け穴を ⏎ 三つ前の版で塞いである。 | {N}はこの抜け穴を ⏎ 三つ前の版で塞ぎました。 | "Architect" removed (§4); the name is first name only, redacted until the boss falls |
| `ui.read_the_architects_record` | en | Read the Architect's record | Read the Keeper's record | "Architect" removed (§4); the name is first name only, redacted until the boss falls |
| `ui.read_the_architects_record` | fa | کارنامهٔ معمار را بخوان | کارنامهٔ نگهبان را بخوان | "Architect" removed (§4); the name is first name only, redacted until the boss falls |
| `ui.read_the_architects_record` | ar | اقرأ سجلّ المعمار | اقرأ سجلّ الحارس | "Architect" removed (§4); the name is first name only, redacted until the boss falls |
| `ui.read_the_architects_record` | ru | Прочесть свиток Зодчего | Прочесть свиток Хранителя | "Architect" removed (§4); the name is first name only, redacted until the boss falls |
| `ui.read_the_architects_record` | ja | 建築家の記録を読む | 守り手の記録を読む | "Architect" removed (§4); the name is first name only, redacted until the boss falls |
| `ui.speak_with_the_architect` | en | Speak with the Architect | Speak with {N} | "Architect" removed (§4); the name is first name only, redacted until the boss falls |
| `ui.speak_with_the_architect` | fa | با معمار سخن بگو | با {N} سخن بگو | "Architect" removed (§4); the name is first name only, redacted until the boss falls |
| `ui.speak_with_the_architect` | ar | حدّث المعمار | تحدّث إلى {N} | "Architect" removed (§4); the name is first name only, redacted until the boss falls |
| `ui.speak_with_the_architect` | ru | Говорить с Зодчим | Говорить с Хранителем | "Architect" removed (§4); the name is first name only, redacted until the boss falls |
| `ui.speak_with_the_architect` | ja | 建築家と語る | {N}と話す | "Architect" removed (§4); the name is first name only, redacted until the boss falls |
| `ui.challenge_the_rune_architect` | en | Challenge the Rune Architect | Challenge the Keeper | "Architect" removed (§4); the name is first name only, redacted until the boss falls |
| `ui.challenge_the_rune_architect` | fa | معمارِ رون را به نبرد بخوان | نگهبان را به نبرد بخوان | "Architect" removed (§4); the name is first name only, redacted until the boss falls |
| `ui.challenge_the_rune_architect` | ar | تحدَّ معمار الرونات | تحدَّ الحارس | "Architect" removed (§4); the name is first name only, redacted until the boss falls |
| `ui.challenge_the_rune_architect` | ru | Бросить вызов Зодчему Рун | Бросить вызов Хранителю | "Architect" removed (§4); the name is first name only, redacted until the boss falls |
| `ui.challenge_the_rune_architect` | ja | ルーンの建築家に挑む | 守り手に挑む | "Architect" removed (§4); the name is first name only, redacted until the boss falls |
| `ui.signature` | en | Veyrath · The Rune Architect | Veyrath · The Keeper of the Root Code | "Architect" removed (§4); the name is first name only, redacted until the boss falls |
| `ui.signature` | fa | وِیرَث · معمارِ رون | ویراث · نگهبان کد ریشه | "Architect" removed (§4); the name is first name only, redacted until the boss falls |
| `ui.signature` | ar | فيرَث · معمار الرونات | فيراث · حارس الشفرة الجذرية | "Architect" removed (§4); the name is first name only, redacted until the boss falls |
| `ui.signature` | ru | Вейрат · Зодчий Рун | Вейрат · Хранитель Корневого Кода | "Architect" removed (§4); the name is first name only, redacted until the boss falls |
| `ui.signature` | ja | ヴェイラス・ルーンの建築家 | ヴェイラス・根源コードの守護者 | "Architect" removed (§4); the name is first name only, redacted until the boss falls |
| `ui.sign` | en | If you would have Shyn, the Rune Architect, on your team, you must first overcome him at his own trial. | If you would have {N} on your team, you must first overcome him at his own trial. | "Architect" removed (§4); the name is first name only, redacted until the boss falls |
| `ui.sign` | fa | اگر شایان، معمارِ رون، را در تیمت می‌خواهی، نخست باید او را در آزمونِ خودش پشت سر بگذاری. | اگر {N} را در تیمت می‌خواهی، نخست باید او را در آزمون خودش شکست دهی. | "Architect" removed (§4); the name is first name only, redacted until the boss falls |
| `ui.sign` | ar | إن أردتَ شايان، معمار الرونات، في فريقك، فعليك أولًا أن تغلبه في محنته هو. | إن أردتَ {N} في فريقك، فعليك أولًا أن تغلبه في محنته هو. | "Architect" removed (§4); the name is first name only, redacted until the boss falls |
| `ui.sign` | ru | Если хочешь видеть Шайна, Зодчего Рун, в своей команде, сперва одолей его в его собственном испытании. | Хочешь, чтобы {N} был в твоей команде? Сперва одолей его в его собственном испытании. | "Architect" removed (§4); the name is first name only, redacted until the boss falls |
| `ui.sign` | ja | ルーンの建築家シャインを仲間に迎えたくば、まず彼自身の試練で打ち勝て。 | {N}を仲間に迎えたくば、まず彼自身の試練で打ち勝て。 | "Architect" removed (§4); the name is first name only, redacted until the boss falls |
| `ach.codex.title` | en | Architect Codex | The Keeper's Codex | "Architect" removed (§4); the name is first name only, redacted until the boss falls |
| `ach.codex.title` | fa | کُدکسِ معمار | کدکس نگهبان | "Architect" removed (§4); the name is first name only, redacted until the boss falls |
| `ach.codex.title` | ar | مخطوط المعمار | مخطوط الحارس | "Architect" removed (§4); the name is first name only, redacted until the boss falls |
| `ach.codex.title` | ru | Кодекс Зодчего | Кодекс Хранителя | "Architect" removed (§4); the name is first name only, redacted until the boss falls |
| `ach.codex.title` | ja | 建築家の写本 | 守り手の写本 | "Architect" removed (§4); the name is first name only, redacted until the boss falls |
| `ach.audience.sub` | en | The Architect has your message. | {N} has your message. | "Architect" removed (§4); the name is first name only, redacted until the boss falls |
| `ach.audience.sub` | fa | پیامت به دستِ معمار رسید. | پیامت به {N} رسید. | "Architect" removed (§4); the name is first name only, redacted until the boss falls |
| `ach.audience.sub` | ar | وصلت رسالتك إلى المعمار. | رسالتك عند {N}. | "Architect" removed (§4); the name is first name only, redacted until the boss falls |
| `ach.audience.sub` | ru | Зодчий получил твоё послание. | {N} получил твоё послание. | "Architect" removed (§4); the name is first name only, redacted until the boss falls |
| `ach.audience.sub` | ja | 建築家は汝の言葉を受け取った。 | 伝言は{N}に届いた。 | "Architect" removed (§4); the name is first name only, redacted until the boss falls |
| `codex.tab.architect` | en | The Architect | The Keeper | "Architect" removed (§4); the name is first name only, redacted until the boss falls |
| `codex.tab.architect` | fa | معمار | نگهبان | "Architect" removed (§4); the name is first name only, redacted until the boss falls |
| `codex.tab.architect` | ar | المعمار | الحارس | "Architect" removed (§4); the name is first name only, redacted until the boss falls |
| `codex.tab.architect` | ru | Зодчий | Хранитель | "Architect" removed (§4); the name is first name only, redacted until the boss falls |
| `codex.tab.architect` | ja | 建築家 | 守り手 | "Architect" removed (§4); the name is first name only, redacted until the boss falls |
| `codex.architect.h2` | en | The Rune Architect | The Keeper of the Root Code | "Architect" removed (§4); the name is first name only, redacted until the boss falls |
| `codex.architect.h2` | fa | معمارِ رون | نگهبان کد ریشه | "Architect" removed (§4); the name is first name only, redacted until the boss falls |
| `codex.architect.h2` | ar | معمار الرونات | حارس الشفرة الجذرية | "Architect" removed (§4); the name is first name only, redacted until the boss falls |
| `codex.architect.h2` | ru | Зодчий Рун | Хранитель Корневого Кода | "Architect" removed (§4); the name is first name only, redacted until the boss falls |
| `codex.architect.h2` | ja | ルーンの建築家 | 根源コードの守護者 | "Architect" removed (§4); the name is first name only, redacted until the boss falls |
| `codex.contact.who` | en | Who seeks the Architect? | Who seeks him? | "Architect" removed (§4); the name is first name only, redacted until the boss falls |
| `codex.contact.who` | fa | چه کسی معمار را می‌جوید؟ | چه کسی او را می‌جوید؟ | "Architect" removed (§4); the name is first name only, redacted until the boss falls |
| `codex.contact.who` | ar | من يطلب المعمار؟ | من يطلبه؟ | "Architect" removed (§4); the name is first name only, redacted until the boss falls |
| `codex.contact.who` | ru | Кто ищет Зодчего? | Кто ищет его? | "Architect" removed (§4); the name is first name only, redacted until the boss falls |
| `codex.contact.who` | ja | 建築家を求めるのは誰か | 彼を求めるのは誰か？ | "Architect" removed (§4); the name is first name only, redacted until the boss falls |
| `codex.contact.locked_quote` | en | The Architect does not read letters from strangers.<br>He reads the ones who reached the Throne. | He does not read letters from strangers.<br>He reads the ones who reached the Throne. | "Architect" removed (§4); the name is first name only, redacted until the boss falls |
| `codex.contact.locked_quote` | fa | معمار نامهٔ ناشناسان را نمی‌خواند.<br>نامهٔ آنان را می‌خواند که به سریر رسیدند. | او نامهٔ بیگانگان را نمی‌خواند.<br>نامهٔ آنان را می‌خواند که به سریر رسیده‌اند. | "Architect" removed (§4); the name is first name only, redacted until the boss falls |
| `codex.contact.locked_quote` | ar | لا يقرأ المعمار رسائل الغرباء.<br>يقرأ رسائل من بلغوا العرش. | هو لا يقرأ رسائل الغرباء.<br>يقرأ رسائل من بلغوا العرش. | "Architect" removed (§4); the name is first name only, redacted until the boss falls |
| `codex.contact.locked_quote` | ru | Зодчий не читает писем чужаков.<br>Он читает письма тех, кто дошёл до Трона. | Он не читает писем от чужих.<br>Он читает тех, кто дошёл до Трона. | "Architect" removed (§4); the name is first name only, redacted until the boss falls |
| `codex.contact.locked_quote` | ja | 建築家は見知らぬ者の手紙を読まぬ。<br>玉座に至った者のものだけを読む。 | 彼は見知らぬ者の手紙を読まない。<br>玉座に辿り着いた者の手紙だけを読む。 | "Architect" removed (§4); the name is first name only, redacted until the boss falls |
| `codex.sent.answer` | en | {0} — the Architect will answer. | {0} — {N} will answer. | "Architect" removed (§4); the name is first name only, redacted until the boss falls |
| `codex.sent.answer` | fa | {0} — معمار پاسخ خواهد داد. | {0} — {N} پاسخ خواهد داد. | "Architect" removed (§4); the name is first name only, redacted until the boss falls |
| `codex.sent.answer` | ar | {0} — سيجيب المعمار. | {0} — سيجيبك {N}. | "Architect" removed (§4); the name is first name only, redacted until the boss falls |
| `codex.sent.answer` | ru | {0} — Зодчий ответит. | {0} — {N} ответит. | "Architect" removed (§4); the name is first name only, redacted until the boss falls |
| `codex.sent.answer` | ja | {0}――建築家は応えるだろう。 | {0}――{N}が答えるだろう。 | "Architect" removed (§4); the name is first name only, redacted until the boss falls |
| `candlekeeper.2` | en | So he learned to ask as one prays — exactly. | So he learned to ask ⏎ the way one draws a plan: exactly. | contradiction: here he "asks as one prays", while the wall two steps on says "A prompt is not a prayer. It is a blueprint." |
| `candlekeeper.2` | fa | پس آموخت چون نیایش پرسد — دقیق. | پس آموخت چنان بپرسد ⏎ که نقشه می‌کشند: دقیق. | contradiction: here he "asks as one prays", while the wall two steps on says "A prompt is not a prayer. It is a blueprint." |
| `candlekeeper.2` | ar | فتعلّم أن يسأل كمن يصلّي — بدقّة. | فتعلّم أن يسأل ⏎ كما تُرسم المخطّطات: بدقّة. | contradiction: here he "asks as one prays", while the wall two steps on says "A prompt is not a prayer. It is a blueprint." |
| `candlekeeper.2` | ru | И он научился спрашивать, как молятся, — точно. | И он научился спрашивать так, ⏎ как чертят план, — точно. | contradiction: here he "asks as one prays", while the wall two steps on says "A prompt is not a prayer. It is a blueprint." |
| `candlekeeper.2` | ja | ゆえに彼は、祈るように、正確に問うことを学んだ。 | ゆえに彼は学んだ。図面を引くように、 ⏎ 正確に問うことを。 | contradiction: here he "asks as one prays", while the wall two steps on says "A prompt is not a prayer. It is a blueprint." |
| `ui.ledger_promise` | en | Play, and earn his discount: reach 500 points and 500,000 Toman is struck from his first salary. Below 500, nothing. The Goblin keeps the books. | Every wall you read earns points. Reach 500 and 500,000 Toman is struck from his first salary. Below 500, nothing. The Goblin keeps the books. | never said what earns points |
| `ui.ledger_promise` | fa | بازی کن و تخفیفش را به دست آور: به ۵۰۰ امتیاز برس تا ۵۰۰٬۰۰۰ تومان از اولین حقوقش کم شود. کمتر از ۵۰۰، هیچ. دفتردارش گابلین است. | هر نوشته‌ای که بخوانی امتیاز دارد. به ۵۰۰ امتیاز برس تا ۵۰۰٬۰۰۰ تومان از اولین حقوقش کم شود. کمتر از ۵۰۰، هیچ. دفتردارش گابلین است. | never said what earns points |
| `ui.ledger_promise` | ar | العب واكسب خصمه: بلوغ ٥٠٠ نقطة يحسم ٥٠٠٬٠٠٠ تومان من أول راتب له. أقلّ من ٥٠٠، لا شيء. والعفريت يمسك الدفاتر. | كلّ نقشٍ تقرؤه يُكسبك نقاطًا. ابلغ ٥٠٠ نقطة يُحسم ٥٠٠٬٠٠٠ تومان من أول راتب له. أقلّ من ٥٠٠، لا شيء. والعفريت يمسك الدفاتر. | never said what earns points |
| `ui.ledger_promise` | ru | Играй и заслужи скидку: набери 500 очков — и 500 000 томанов вычтут из его первого жалованья. Меньше 500 — ничего. Книги ведёт Гоблин. | Каждая прочитанная надпись приносит очки. Набери 500 — и 500 000 томанов вычтут из его первого жалованья. Меньше 500 — ничего. Книги ведёт Гоблин. | never said what earns points |
| `ui.ledger_promise` | ja | 遊んで割引を勝ち取れ。500ポイントで、初任給から50万トマンが引かれる。500未満なら、何もない。帳簿はゴブリンが握っている。 | 読んだ碑文はすべて点になる。500ポイントで、初任給から50万トマンが引かれる。500未満なら、何もない。帳簿はゴブリンが握っている。 | never said what earns points |

## 02-intro.mjs — 35 changes

| id | lang | old | new | why |
|---|---|---|---|---|
| `intro.1` | en | In a land where knowledge was made a privilege... | In a land where knowledge was made a privilege, the doors of every library were chained, and the keys were given to the few. | longer opening, told as one story (§2, §3); "architect" removed (§4) |
| `intro.1` | fa | در سرزمینی که دانایی، امتیازِ برگزیدگان شد... | در سرزمینی که دانش را امتیاز کرده بودند، بر در هر کتابخانه زنجیر زدند و کلیدها را به اندک‌شماری سپردند. | longer opening, told as one story (§2, §3); "architect" removed (§4) |
| `intro.1` | ar | في أرضٍ صارت فيها المعرفة امتيازًا... | في أرضٍ جُعلت فيها المعرفة امتيازًا، قُيّدت أبواب المكتبات بالسلاسل، وسُلّمت المفاتيح إلى القلّة. | longer opening, told as one story (§2, §3); "architect" removed (§4) |
| `intro.1` | ru | В краю, где знание стало привилегией... | В краю, где знание сделали привилегией, двери библиотек заковали в цепи, а ключи раздали немногим. | longer opening, told as one story (§2, §3); "architect" removed (§4) |
| `intro.1` | ja | 知が特権と成り果てた地にて…… | 知が特権とされた地で、あらゆる書庫の扉は鎖で閉ざされ、鍵はわずかな者だけに渡された。 | longer opening, told as one story (§2, §3); "architect" removed (§4) |
| `intro.2` | en | One architect knelt to no one. | They buried what they knew beneath ruins, and bound power to bloodlines, so that no one born outside the walls would ever learn to build. | longer opening, told as one story (§2, §3); "architect" removed (§4) |
| `intro.2` | fa | معماری بود که برابرِ هیچ‌کس زانو نزد. | آنچه می‌دانستند زیر ویرانه‌ها دفن کردند و قدرت را به تبار بستند، تا هیچ‌کس که بیرون دیوارها زاده شده، ساختن نیاموزد. | longer opening, told as one story (§2, §3); "architect" removed (§4) |
| `intro.2` | ar | معماريٌّ واحد أبى أن يركع. | دفنوا ما عرفوه تحت الأطلال، وربطوا السلطة بالأنساب، كي لا يتعلّم البناءَ أحدٌ وُلد خارج الأسوار. | longer opening, told as one story (§2, §3); "architect" removed (§4) |
| `intro.2` | ru | Один зодчий не преклонил колен. | Они погребли своё знание под руинами и привязали власть к родословным, чтобы никто, рождённый за стенами, не научился строить. | longer opening, told as one story (§2, §3); "architect" removed (§4) |
| `intro.2` | ja | ひとりの建築家だけが、膝を折らなかった。 | 彼らは知るすべてを廃墟の下に埋め、力を血筋に縛りつけた。壁の外に生まれた者が、築く術を学ばぬように。 | longer opening, told as one story (§2, §3); "architect" removed (§4) |
| `intro.3` | en | They entombed knowledge beneath ruins. | But far from any palace, a boy sat before a small glowing screen, and taught himself the first of the runes. | longer opening, told as one story (§2, §3); "architect" removed (§4) |
| `intro.3` | fa | دانایی را در گورِ ویرانه‌ها نهادند. | اما دور از هر کاخی، پسری برابر صفحه‌ای کوچک و روشن نشست و نخستین رون‌ها را به خود آموخت. | longer opening, told as one story (§2, §3); "architect" removed (§4) |
| `intro.3` | ar | دفنوا المعرفة تحت الأنقاض. | لكنْ بعيدًا عن كلّ قصر، جلس صبيٌّ أمام شاشةٍ صغيرةٍ مضيئة، وعلّم نفسه أولى الرونات. | longer opening, told as one story (§2, §3); "architect" removed (§4) |
| `intro.3` | ru | Знание погребли под руинами. | Но вдали от дворцов мальчик сел перед маленьким светящимся экраном и сам выучил первые руны. | longer opening, told as one story (§2, §3); "architect" removed (§4) |
| `intro.3` | ja | 知は廃墟の下に葬られた。 | だが、どの宮殿からも遠い場所で、ひとりの少年が小さく光る画面の前に座り、最初のルーンを独りで学んだ。 | longer opening, told as one story (§2, §3); "architect" removed (§4) |
| `intro.4` | en | They chained power to bloodlines. | By night he learned the grammar of machines. By day he learned the patience of the blade, and of the open hand. | longer opening, told as one story (§2, §3); "architect" removed (§4) |
| `intro.4` | fa | و قدرت را به زنجیرِ تبار بستند. | شب‌ها دستور زبان ماشین‌ها را آموخت. روزها شکیبایی تیغ را، و شکیبایی دست گشوده را. | longer opening, told as one story (§2, §3); "architect" removed (§4) |
| `intro.4` | ar | وقيّدوا السلطة بسلاسل الأنساب. | في الليل تعلّم نحوَ الآلات. وفي النهار تعلّم صبرَ النصل، وصبرَ اليد المفتوحة. | longer opening, told as one story (§2, §3); "architect" removed (§4) |
| `intro.4` | ru | Власть заковали в цепи родовой крови. | Ночами он постигал грамматику машин. Днями — терпение клинка и терпение открытой ладони. | longer opening, told as one story (§2, §3); "architect" removed (§4) |
| `intro.4` | ja | 力は血統の鎖に繋がれた。 | 夜には機械の文法を学び、昼には刃の忍耐と、開いた手の忍耐を学んだ。 | longer opening, told as one story (§2, §3); "architect" removed (§4) |
| `intro.5` | en | Yet one builder kept searching in the dark. | He built for strangers. He failed in front of them. And each time, he gathered the pieces, and built again. | longer opening, told as one story (§2, §3); "architect" removed (§4) |
| `intro.5` | fa | اما سازنده‌ای در تاریکی از جُستن باز نایستاد. | برای بیگانگان ساخت. پیش چشمشان شکست خورد. و هر بار تکه‌ها را گرد آورد و از نو ساخت. | longer opening, told as one story (§2, §3); "architect" removed (§4) |
| `intro.5` | ar | غير أن بنّاءً ظلّ يبحث في العتمة. | بنى للغرباء. وأخفق أمام أعينهم. وفي كلّ مرّةٍ جمع القطع، وبنى من جديد. | longer opening, told as one story (§2, §3); "architect" removed (§4) |
| `intro.5` | ru | Но один строитель продолжал искать во тьме. | Он строил для чужих. Он терпел неудачи у них на глазах. И каждый раз собирал обломки и строил заново. | longer opening, told as one story (§2, §3); "architect" removed (§4) |
| `intro.5` | ja | だが一人の造り手は、闇の中で探し続けた。 | 彼は見知らぬ者のために築き、その目の前でしくじり、そのたびに欠片を拾い集めて、また築いた。 | longer opening, told as one story (§2, §3); "architect" removed (§4) |
| `intro.6` | en | His name was lost to ash. | When the machines began to speak, he did not fear them. He learned to ask them exactly, and to build with what they answered. | longer opening, told as one story (§2, §3); "architect" removed (§4) |
| `intro.6` | fa | نامش در خاکستر گم شد. | وقتی ماشین‌ها زبان گشودند، از آن‌ها نترسید. آموخت که دقیق بپرسد، و با پاسخشان بسازد. | longer opening, told as one story (§2, §3); "architect" removed (§4) |
| `intro.6` | ar | ضاع اسمه في الرماد. | ولمّا بدأت الآلات تتكلّم، لم يخفها. تعلّم أن يسألها بدقّة، وأن يبني بما تجيب. | longer opening, told as one story (§2, §3); "architect" removed (§4) |
| `intro.6` | ru | Имя его стало пеплом. | Когда машины заговорили, он не испугался. Он научился спрашивать их точно и строить из их ответов. | longer opening, told as one story (§2, §3); "architect" removed (§4) |
| `intro.6` | ja | その名は灰となった。 | 機械が語りはじめたとき、彼は恐れなかった。正確に問うことを学び、その答えで築くことを学んだ。 | longer opening, told as one story (§2, §3); "architect" removed (§4) |
| `intro.7` | en | His work endures. | They struck his name from every record. It is still there, beneath the ink, for the one who earns the right to read it. | longer opening, told as one story (§2, §3); "architect" removed (§4) |
| `intro.7` | fa | کارش ماند. | نامش را از هر دفتری خط زدند. اما هنوز همان‌جاست، زیر جوهر، برای آن‌که حق خواندنش را به دست آورد. | longer opening, told as one story (§2, §3); "architect" removed (§4) |
| `intro.7` | ar | وبقي عمله. | شطبوا اسمه من كلّ سجلّ. لكنّه ما زال هناك، تحت الحبر، لمن ينال حقّ قراءته. | longer opening, told as one story (§2, §3); "architect" removed (§4) |
| `intro.7` | ru | Но дело его живёт. | Его имя вычеркнули из всех записей. Но оно всё ещё там, под чернилами, — для того, кто заслужит право его прочесть. | longer opening, told as one story (§2, §3); "architect" removed (§4) |
| `intro.7` | ja | されど、その仕事は遺る。 | 彼の名はあらゆる記録から消された。だが名は今もそこにある。墨の下に――読む資格を得た者のために。 | longer opening, told as one story (§2, §3); "architect" removed (§4) |

## kasra — 95 changes

| id | lang | old | new | why |
|---|---|---|---|---|
| `who.librarian` | fa | کتابدارِ نابینا | کتابدار نابینا | §5 one rule for ezafe: the short-vowel marks are not written (they also read as dots at small sizes) |
| `who.wall` | fa | وردِ دیوار | ورد دیوار | §5 one rule for ezafe: the short-vowel marks are not written (they also read as dots at small sizes) |
| `who.pilgrim_tablet` | fa | لوحِ زائر | لوح زائر | §5 one rule for ezafe: the short-vowel marks are not written (they also read as dots at small sizes) |
| `who.bark` | fa | نوشتهٔ پوستِ درخت | نوشتهٔ پوست درخت | §5 one rule for ezafe: the short-vowel marks are not written (they also read as dots at small sizes) |
| `who.overgrown` | fa | نشانِ خزه‌گرفته | نشان خزه‌گرفته | §5 one rule for ezafe: the short-vowel marks are not written (they also read as dots at small sizes) |
| `who.great_tablet` | fa | لوحِ بزرگ | لوح بزرگ | §5 one rule for ezafe: the short-vowel marks are not written (they also read as dots at small sizes) |
| `who.acolyte` | fa | یادداشتِ شاگرد | یادداشت شاگرد | §5 one rule for ezafe: the short-vowel marks are not written (they also read as dots at small sizes) |
| `who.prompt_keeper` | fa | نگهبانِ پرسش‌ها | نگهبان پرسش‌ها | §5 one rule for ezafe: the short-vowel marks are not written (they also read as dots at small sizes) |
| `who.glyph` | fa | نقشِ روی مجرا | نقش روی مجرا | §5 one rule for ezafe: the short-vowel marks are not written (they also read as dots at small sizes) |
| `who.engine_wall` | fa | دیوارِ موتور | دیوار موتور | §5 one rule for ezafe: the short-vowel marks are not written (they also read as dots at small sizes) |
| `who.bot` | fa | رباتِ ازیادرفته | ربات ازیادرفته | §5 one rule for ezafe: the short-vowel marks are not written (they also read as dots at small sizes) |
| `who.refactor` | fa | بازنویسیِ بی‌پایان | بازنویسی بی‌پایان | §5 one rule for ezafe: the short-vowel marks are not written (they also read as dots at small sizes) |
| `who.archive_wall` | fa | دیوارِ بایگانی | دیوار بایگانی | §5 one rule for ezafe: the short-vowel marks are not written (they also read as dots at small sizes) |
| `who.sealed_door` | fa | درِ مُهرشده | در مهرشده | §5 one rule for ezafe: the short-vowel marks are not written (they also read as dots at small sizes) |
| `who.goblin` | fa | گابلینِ بودجه | گابلین بودجه | §5 one rule for ezafe: the short-vowel marks are not written (they also read as dots at small sizes) |
| `zone.workshop.name` | fa | کارگاهِ فراموش‌شده | کارگاه فراموش‌شده | §5 one rule for ezafe: the short-vowel marks are not written (they also read as dots at small sizes) |
| `zone.forest.name` | fa | جنگلِ خارها · فرانت‌اند | جنگل خارها · فرانت‌اند | §5 one rule for ezafe: the short-vowel marks are not written (they also read as dots at small sizes) |
| `zone.cathedral.name` | fa | کلیسای جامعِ طراحی | کلیسای جامع طراحی | §5 one rule for ezafe: the short-vowel marks are not written (they also read as dots at small sizes) |
| `zone.cathedral.sub` | fa | زیبایی بی‌غایت، جز زیورِ سنگ‌گور نیست | زیبایی بی‌غایت، جز زیور سنگ‌گور نیست | §5 one rule for ezafe: the short-vowel marks are not written (they also read as dots at small sizes) |
| `zone.machine.name` | fa | تالارهای ذهنِ ماشین | تالارهای ذهن ماشین | §5 one rule for ezafe: the short-vowel marks are not written (they also read as dots at small sizes) |
| `zone.repository.name` | fa | استودانِ آفریده‌های گم‌شده | استودان آفریده‌های گم‌شده | §5 one rule for ezafe: the short-vowel marks are not written (they also read as dots at small sizes) |
| `zone.throne.sub` | fa | صنعتِ کهن و جادو، پیوسته در یک تن | صنعت کهن و جادو، پیوسته در یک تن | §5 one rule for ezafe: the short-vowel marks are not written (they also read as dots at small sizes) |
| `zone.throne.obj.after` | fa | سریر خاموش است. درِ مُهرشده گشوده است — به سوی خاور. | سریر خاموش است. در مهرشده گشوده است — به سوی خاور. | §5 one rule for ezafe: the short-vowel marks are not written (they also read as dots at small sizes) |
| `zone.chamber.sub` | fa | تالارِ دفتر حساب · چانه‌زنیِ حقوق | تالار دفتر حساب · چانه‌زنی حقوق | §5 one rule for ezafe: the short-vowel marks are not written (they also read as dots at small sizes) |
| `zone.chamber.obj.coin` | fa | یک سکه. یک امتیاز. مالِ توست. | یک سکه. یک امتیاز. مال توست. | §5 one rule for ezafe: the short-vowel marks are not written (they also read as dots at small sizes) |
| `librarian_workshop.1` | fa | خوش آمدی، ای توبه‌کار، به کارگاهِ فراموش‌شده. | خوش آمدی، ای توبه‌کار، به کارگاه فراموش‌شده. | §5 one rule for ezafe: the short-vowel marks are not written (they also read as dots at small sizes) |
| `librarian_workshop.2` | fa | بسیارند که برابرِ فرمانروایان زانو می‌زنند. ⏎ اندکند که سازندگان را به یاد دارند. | بسیارند که برابر فرمانروایان زانو می‌زنند. ⏎ اندکند که سازندگان را به یاد دارند. | §5 one rule for ezafe: the short-vowel marks are not written (they also read as dots at small sizes) |
| `note_workshop_1.1` | fa | هر شاهکار ⏎ قربانیِ شکسته‌ای آغاز می‌شود. | هر شاهکار ⏎ قربانی شکسته‌ای آغاز می‌شود. | §5 one rule for ezafe: the short-vowel marks are not written (they also read as dots at small sizes) |
| `note_cathedral_3.2` | fa | آن‌سوی استودان — خودِ او. | آن‌سوی استودان — خود او. | §5 one rule for ezafe: the short-vowel marks are not written (they also read as dots at small sizes) |
| `candlekeeper.4` | fa | سه رون پلِ پیش‌رو را بیدار می‌کنند. ⏎ آن‌ها را چنان بگو که او می‌گفت. | سه رون پل پیش‌رو را بیدار می‌کنند. ⏎ آن‌ها را چنان بگو که او می‌گفت. | §5 one rule for ezafe: the short-vowel marks are not written (they also read as dots at small sizes) |
| `proto_repo.1` | fa | یک بازنگریِ دیگر. | یک بازنگری دیگر. | §5 one rule for ezafe: the short-vowel marks are not written (they also read as dots at small sizes) |
| `proto_repo.2` | fa | یک بهبودِ دیگر. | یک بهبود دیگر. | §5 one rule for ezafe: the short-vowel marks are not written (they also read as dots at small sizes) |
| `note_arena_1.2` | fa | او نگهبانِ دانایی نیست. ⏎ نگهبانِ عزم است. | او نگهبان دانایی نیست. ⏎ نگهبان عزم است. | §5 one rule for ezafe: the short-vowel marks are not written (they also read as dots at small sizes) |
| `sealed_contact.1` | fa | کُدِ ریشه این در را بسته نگه می‌دارد. | کد ریشه این در را بسته نگه می‌دارد. | §5 one rule for ezafe: the short-vowel marks are not written (they also read as dots at small sizes) |
| `shyn_first.2` | fa | از میانِ شکست‌هایم گذشتی. ⏎ از رؤیاهایم. ⏎ از جهان‌های ناتمامم. | از میان شکست‌هایم گذشتی. ⏎ از رؤیاهایم. ⏎ از جهان‌های ناتمامم. | §5 one rule for ezafe: the short-vowel marks are not written (they also read as dots at small sizes) |
| `shyn_first.4` | fa | بگو. ⏎ آیا این زیارت ارزشِ وقتت را داشت؟ | بگو. ⏎ آیا این زیارت ارزش وقتت را داشت؟ | §5 one rule for ezafe: the short-vowel marks are not written (they also read as dots at small sizes) |
| `shyn_mercy.6.1` | fa | درِ خاورِ این سریر اکنون گشوده است. | در خاور این سریر اکنون گشوده است. | §5 one rule for ezafe: the short-vowel marks are not written (they also read as dots at small sizes) |
| `cv_forest.2` | fa | و اسکیما، تنیده در زیرِ صفحه ⏎ جایی که تنها ماشین‌ها می‌خوانندش. | و اسکیما، تنیده در زیر صفحه ⏎ جایی که تنها ماشین‌ها می‌خوانندش. | §5 one rule for ezafe: the short-vowel marks are not written (they also read as dots at small sizes) |
| `cv_catacombs.1` | fa | او با ذهن‌های ماشینی ⏎ به دستورِ خودشان سخن می‌گوید. | او با ذهن‌های ماشینی ⏎ به دستور خودشان سخن می‌گوید. | §5 one rule for ezafe: the short-vowel marks are not written (they also read as dots at small sizes) |
| `cv_catacombs.3` | fa | نیتِ روشن. ساختارِ سخت. ⏎ آزموده تا برجا بماند. | نیت روشن. ساختار سخت. ⏎ آزموده تا برجا بماند. | §5 one rule for ezafe: the short-vowel marks are not written (they also read as dots at small sizes) |
| `cv_repository.2` | fa | گروهِ دیجیتال مارکتینگِ آیدبکس. ۲۰۲۲ – ۲۰۲۳. ⏎ سرپرست طراحی وب. مشاور سئو. | گروه دیجیتال مارکتینگ آیدبکس. ۲۰۲۲ – ۲۰۲۳. ⏎ سرپرست طراحی وب. مشاور سئو. | §5 one rule for ezafe: the short-vowel marks are not written (they also read as dots at small sizes) |
| `cv_arena.3` | fa | صداقت. شرف. وفاداری. ⏎ وقت‌شناسی. شجاعت. ⏎ سخت‌کوشی. اصولِ اخلاقیِ استوار. | صداقت. شرف. وفاداری. ⏎ وقت‌شناسی. شجاعت. ⏎ سخت‌کوشی. اصول اخلاقی استوار. | §5 one rule for ezafe: the short-vowel marks are not written (they also read as dots at small sizes) |
| `goblin_intro.4` | fa | زیر ۵۰۰ تخفیف صفر است. ⏎ یک تومان هم نه. دو بار چک کردم، ⏎ یک بار با حضورِ کشیش. | زیر ۵۰۰ تخفیف صفر است. ⏎ یک تومان هم نه. دو بار چک کردم، ⏎ یک بار با حضور کشیش. | §5 one rule for ezafe: the short-vowel marks are not written (they also read as dots at small sizes) |
| `goblin_coin.2` | fa | برای تو؟ البته. ⏎ این سه‌ماه، فصلِ سخاوت است. ⏎ عملاً قدیسم. | برای تو؟ البته. ⏎ این سه‌ماه، فصل سخاوت است. ⏎ عملاً قدیسم. | §5 one rule for ezafe: the short-vowel marks are not written (they also read as dots at small sizes) |
| `goblin_coin.3` | fa | بفرما. تازه ضرب‌شده، سه‌شنبه تبرک شد. ⏎ برش دار. مالِ توست. ⏎ (ریزنوشته‌ها را نخوان.) | بفرما. تازه ضرب‌شده، سه‌شنبه تبرک شد. ⏎ برش دار. مال توست. ⏎ (ریزنوشته‌ها را نخوان.) | §5 one rule for ezafe: the short-vowel marks are not written (they also read as dots at small sizes) |
| `goblin.ui.one_coin_one_point_it_is_yours` | fa | یک سکه. یک امتیاز. مالِ توست. | یک سکه. یک امتیاز. مال توست. | §5 one rule for ezafe: the short-vowel marks are not written (they also read as dots at small sizes) |
| `goblin.final.1` | fa | تلاشِ خوبی بود، ای توبه‌کار. | تلاش خوبی بود، ای توبه‌کار. | §5 one rule for ezafe: the short-vowel marks are not written (they also read as dots at small sizes) |
| `goblin.final.4` | fa | شاید نگه داشتنِ توسعه‌دهندهٔ مستعد ⏎ ارزان‌تر از جایگزین کردنش باشد. | شاید نگه داشتن توسعه‌دهندهٔ مستعد ⏎ ارزان‌تر از جایگزین کردنش باشد. | §5 one rule for ezafe: the short-vowel marks are not written (they also read as dots at small sizes) |
| `ui.read_the_pilgrims_tablet` | fa | لوحِ زائر را بخوان | لوح زائر را بخوان | §5 one rule for ezafe: the short-vowel marks are not written (they also read as dots at small sizes) |
| `ui.read_the_great_tablet` | fa | لوحِ بزرگ را بخوان | لوح بزرگ را بخوان | §5 one rule for ezafe: the short-vowel marks are not written (they also read as dots at small sizes) |
| `ui.read_the_acolytes_note` | fa | یادداشتِ شاگرد را بخوان | یادداشت شاگرد را بخوان | §5 one rule for ezafe: the short-vowel marks are not written (they also read as dots at small sizes) |
| `ui.read_the_furnace_wall` | fa | دیوارِ کوره را بخوان | دیوار کوره را بخوان | §5 one rule for ezafe: the short-vowel marks are not written (they also read as dots at small sizes) |
| `ui.read_the_archive_wall` | fa | دیوارِ بایگانی را بخوان | دیوار بایگانی را بخوان | §5 one rule for ezafe: the short-vowel marks are not written (they also read as dots at small sizes) |
| `ui.read_the_engine_wall` | fa | دیوارِ موتور را بخوان | دیوار موتور را بخوان | §5 one rule for ezafe: the short-vowel marks are not written (they also read as dots at small sizes) |
| `ui.shatter_the_root_rune` | fa | رونِ ریشه را بشکن | رون ریشه را بشکن | §5 one rule for ezafe: the short-vowel marks are not written (they also read as dots at small sizes) |
| `ui.woke.default` | fa | سنگِ خفته شکلش را به یاد می‌آورد. | سنگ خفته شکلش را به یاد می‌آورد. | §5 one rule for ezafe: the short-vowel marks are not written (they also read as dots at small sizes) |
| `ui.woke.forest` | fa | آن‌سوی دره، پُلی از برگ شکلش را به یاد می‌آورد. | آن‌سوی دره، پلی از برگ شکلش را به یاد می‌آورد. | §5 one rule for ezafe: the short-vowel marks are not written (they also read as dots at small sizes) |
| `ui.woke.cathedral_b` | fa | در زیر، کفِ شکسته دوباره یکپارچه شد. | در زیر، کف شکسته دوباره یکپارچه شد. | §5 one rule for ezafe: the short-vowel marks are not written (they also read as dots at small sizes) |
| `ui.hint.forest` | fa | رونی در تاجِ درخت بزرگ خفته است. | رونی در تاج درخت بزرگ خفته است. | §5 one rule for ezafe: the short-vowel marks are not written (they also read as dots at small sizes) |
| `ui.hint.cathedral` | fa | یک رون پلکانی را بیدار می‌کند. پلکان به رونِ دوم می‌رسد. | یک رون پلکانی را بیدار می‌کند. پلکان به رون دوم می‌رسد. | §5 one rule for ezafe: the short-vowel marks are not written (they also read as dots at small sizes) |
| `ui.hint.repository` | fa | اهرمِ روی جزیره، شاخه را می‌گرداند. | اهرم روی جزیره، شاخه را می‌گرداند. | §5 one rule for ezafe: the short-vowel marks are not written (they also read as dots at small sizes) |
| `ui.veyrath_is_still` | fa | وِیرَث ایستاده است | ویرث ایستاده است | §5 one rule for ezafe: the short-vowel marks are not written (they also read as dots at small sizes) |
| `ui.leave_veyrath` | fa | ترکِ وِیرَث | ترک ویرث | §5 one rule for ezafe: the short-vowel marks are not written (they also read as dots at small sizes) |
| `ui.sealed_door_open` | fa | درِ مُهرشده گشوده شد | در مهرشده گشوده شد | §5 one rule for ezafe: the short-vowel marks are not written (they also read as dots at small sizes) |
| `ui.the_salary_ledger` | fa | دفترِ حقوق | دفتر حقوق | §5 one rule for ezafe: the short-vowel marks are not written (they also read as dots at small sizes) |
| `ui.rotate` | fa | برای دیدنِ کامل، دستگاه را بچرخان | برای دیدن کامل، دستگاه را بچرخان | §5 one rule for ezafe: the short-vowel marks are not written (they also read as dots at small sizes) |
| `end.1` | fa | مقصود هرگز شکست دادنِ من نبود. | مقصود هرگز شکست دادن من نبود. | §5 one rule for ezafe: the short-vowel marks are not written (they also read as dots at small sizes) |
| `end.2` | fa | مقصود، فهمیدنِ آن چیزی بود که می‌سازم. | مقصود، فهمیدن آن چیزی بود که می‌سازم. | §5 one rule for ezafe: the short-vowel marks are not written (they also read as dots at small sizes) |
| `end.return` | fa | بازگشت به وِیرَث | بازگشت به ویرث | §5 one rule for ezafe: the short-vowel marks are not written (they also read as dots at small sizes) |
| `ach.seeker.sub` | fa | به وِیرَث گام نهادی. | به ویرث گام نهادی. | §5 one rule for ezafe: the short-vowel marks are not written (they also read as dots at small sizes) |
| `ach.reader.sub` | fa | پنج وِرد را گشودی. | پنج ورد را گشودی. | §5 one rule for ezafe: the short-vowel marks are not written (they also read as dots at small sizes) |
| `ach.whispers.title` | fa | نگهبانِ نجواها | نگهبان نجواها | §5 one rule for ezafe: the short-vowel marks are not written (they also read as dots at small sizes) |
| `ach.goblin.title` | fa | فریب‌خوردهٔ گابلینِ بودجه | فریب‌خوردهٔ گابلین بودجه | §5 one rule for ezafe: the short-vowel marks are not written (they also read as dots at small sizes) |
| `ach.goblin.sub` | fa | تالارِ ۴۹۹ تو را به یاد خواهد داشت. | تالار ۴۹۹ تو را به یاد خواهد داشت. | §5 one rule for ezafe: the short-vowel marks are not written (they also read as dots at small sizes) |
| `ach.audience.title` | fa | درخواستِ دیدار | درخواست دیدار | §5 one rule for ezafe: the short-vowel marks are not written (they also read as dots at small sizes) |
| `ach.page.lead` | fa | گواهِ آنکه اینجا گام زدی. | گواه آنکه اینجا گام زدی. | §5 one rule for ezafe: the short-vowel marks are not written (they also read as dots at small sizes) |
| `ach.page.memory` | fa | وِیرَث تنها همین مرورگر را به یاد دارد. | ویرث تنها همین مرورگر را به یاد دارد. | §5 one rule for ezafe: the short-vowel marks are not written (they also read as dots at small sizes) |
| `ach.page.forget_ask` | fa | حافظهٔ وِیرَث پاک شود؟ | حافظهٔ ویرث پاک شود؟ | §5 one rule for ezafe: the short-vowel marks are not written (they also read as dots at small sizes) |
| `codex.architect.who_h` | fa | چه کسی پشتِ رون‌هاست | چه کسی پشت رون‌هاست | §5 one rule for ezafe: the short-vowel marks are not written (they also read as dots at small sizes) |
| `codex.architect.pillars_p` | fa | صداقت · شرف · وفاداری · وقت‌شناسی · شجاعت · سخت‌کوشی · اصولِ اخلاقیِ استوار. | صداقت · شرف · وفاداری · وقت‌شناسی · شجاعت · سخت‌کوشی · اصول اخلاقی استوار. | §5 one rule for ezafe: the short-vowel marks are not written (they also read as dots at small sizes) |
| `codex.architect.why_p` | fa | چون رزومه می‌خواهد داوری شود و جهان می‌خواهد کاویده شود. وِیرَث ساخته شد تا نخستین کارت این باشد که از میانِ کار <em>بگذری</em>، نه اینکه تندتند بخوانیش. | چون رزومه می‌خواهد داوری شود و جهان می‌خواهد کاویده شود. ویرث ساخته شد تا نخستین کارت این باشد که از میان کار <em>بگذری</em>، نه اینکه تندتند بخوانیش. | §5 one rule for ezafe: the short-vowel marks are not written (they also read as dots at small sizes) |
| `codex.skills.lead` | fa | هر مهارتِ این جهان، ابزاری است که به آن اعتماد دارد. | هر مهارت این جهان، ابزاری است که به آن اعتماد دارد. | §5 one rule for ezafe: the short-vowel marks are not written (they also read as dots at small sizes) |
| `codex.skills.structures` | fa | استادِ ساختارهای انعطاف‌پذیر | استاد ساختارهای انعطاف‌پذیر | §5 one rule for ezafe: the short-vowel marks are not written (they also read as dots at small sizes) |
| `codex.skills.discovery` | fa | نگهبانِ یافته‌شدن | نگهبان یافته‌شدن | §5 one rule for ezafe: the short-vowel marks are not written (they also read as dots at small sizes) |
| `codex.skills.market` | fa | منادیِ بازار | منادی بازار | §5 one rule for ezafe: the short-vowel marks are not written (they also read as dots at small sizes) |
| `codex.skills.forge` | fa | استادِ کورهٔ سیستم‌های ماژولار | استاد کورهٔ سیستم‌های ماژولار | §5 one rule for ezafe: the short-vowel marks are not written (they also read as dots at small sizes) |
| `codex.skills.machine` | fa | مفسّرِ ذهن‌های ماشینی | مفسّر ذهن‌های ماشینی | §5 one rule for ezafe: the short-vowel marks are not written (they also read as dots at small sizes) |
| `codex.projects.note_h` | fa | یادداشتِ میدانی | یادداشت میدانی | §5 one rule for ezafe: the short-vowel marks are not written (they also read as dots at small sizes) |
| `codex.experience.h2` | fa | ساختنِ دراز | ساختن دراز | §5 one rule for ezafe: the short-vowel marks are not written (they also read as dots at small sizes) |
| `codex.contact.h2` | fa | درخواستِ دیدار | درخواست دیدار | §5 one rule for ezafe: the short-vowel marks are not written (they also read as dots at small sizes) |
| `codex.contact.quote` | fa | از جهان گذشتی.<br>حقِّ سخن گفتن را به دست آوردی. | از جهان گذشتی.<br>حقّ سخن گفتن را به دست آوردی. | §5 one rule for ezafe: the short-vowel marks are not written (they also read as dots at small sizes) |
| `codex.contact.locked_p` | fa | هیچ فرمی در کار نیست. و راه‌میانبری نیست. این باگ نیست: <em>تنها راهِ رسیدن به او، ایستادن در برابر اوست.</em> | هیچ فرمی در کار نیست. و راه‌میانبری نیست. این باگ نیست: <em>تنها راه رسیدن به او، ایستادن در برابر اوست.</em> | §5 one rule for ezafe: the short-vowel marks are not written (they also read as dots at small sizes) |
| `codex.contact.step2_p` | fa | استودانِ آفریده‌های گم‌شده را بپیما. همهٔ آن را. | استودان آفریده‌های گم‌شده را بپیما. همهٔ آن را. | §5 one rule for ezafe: the short-vowel marks are not written (they also read as dots at small sizes) |
| `codex.experience.co2` | fa | گروهِ دیجیتال مارکتینگِ آیدبکس | گروه دیجیتال مارکتینگ آیدبکس | §5 one rule for ezafe: the short-vowel marks are not written (they also read as dots at small sizes) |
| `codex.sent.open` | fa | گشودنِ تلگرام ✦ | گشودن تلگرام ✦ | §5 one rule for ezafe: the short-vowel marks are not written (they also read as dots at small sizes) |

## 04-combat.mjs — 50 changes

| id | lang | old | new | why |
|---|---|---|---|---|
| `zone.throne.obj.fight` | en | He answers no letters. Break the rune, then choose mercy. | He answers no letters. Stand before him, weapon in hand. | the rune-and-needle fight is gone; mercy is no longer the stated goal |
| `zone.throne.obj.fight` | fa | او به نامه پاسخ نمی‌دهد. رون را بشکن، آنگاه رحمت را برگزین. | او به نامه پاسخ نمی‌دهد. با سلاحی در دست روبه‌رویش بایست. | the rune-and-needle fight is gone; mercy is no longer the stated goal |
| `zone.throne.obj.fight` | ar | لا يردّ على الرسائل. حطّم الرونية، ثم اخترِ الرحمة. | لا يردّ على الرسائل. قف أمامه والسلاح في يدك. | the rune-and-needle fight is gone; mercy is no longer the stated goal |
| `zone.throne.obj.fight` | ru | Он не отвечает на письма. Разбей руну — и выбери милость. | На письма он не отвечает. Встань перед ним с оружием в руке. | the rune-and-needle fight is gone; mercy is no longer the stated goal |
| `zone.throne.obj.fight` | ja | 彼は手紙に答えない。ルーンを砕き、そして慈悲を選べ。 | 彼は手紙に答えない。武器を手に、その前に立て。 | the rune-and-needle fight is gone; mercy is no longer the stated goal |
| `shyn_yield.3.1` | en | You fell. Twice. | You fell. Ten times. | mercy now comes after ten defeats, not two |
| `shyn_yield.3.1` | fa | افتادی. دو بار. | افتادی. ده بار. | mercy now comes after ten defeats, not two |
| `shyn_yield.3.1` | ar | سقطتَ. مرّتين. | سقطتَ. عشر مرات. | mercy now comes after ten defeats, not two |
| `shyn_yield.3.1` | ru | Ты пал. Дважды. | Ты пал. Десять раз. | mercy now comes after ten defeats, not two |
| `shyn_yield.3.1` | ja | 汝は倒れた。二度。 | 倒れたな。十度。 | mercy now comes after ten defeats, not two |
| `shyn_yield.3.2` | en | And twice you stood up ⏎ in front of the same wall. | And ten times you stood up ⏎ in front of the same wall. | mercy now comes after ten defeats, not two |
| `shyn_yield.3.2` | fa | و دو بار برخاستی ⏎ روبه‌روی همان دیوار. | و ده بار برخاستی ⏎ روبه‌روی همان دیوار. | mercy now comes after ten defeats, not two |
| `shyn_yield.3.2` | ar | ومرّتين نهضتَ ⏎ أمام الجدار ذاته. | وعشر مرات نهضتَ ⏎ أمام الجدار نفسه. | mercy now comes after ten defeats, not two |
| `shyn_yield.3.2` | ru | И дважды поднялся ⏎ перед той же стеной. | И десять раз поднялся ⏎ перед той же стеной. | mercy now comes after ten defeats, not two |
| `shyn_yield.3.2` | ja | そして二度、 ⏎ 同じ壁の前に立った。 | そして十度、立ち上がった ⏎ 同じ壁の前に。 | mercy now comes after ten defeats, not two |
| `ui.shatter_the_rune` | en | Shatter the rune |  | Round 9 §8: weapon combat replaces the timing needle; mercy comes after ten defeats; knights. |
| `ui.shatter_the_rune` | fa | رون را بشکن |  | Round 9 §8: weapon combat replaces the timing needle; mercy comes after ten defeats; knights. |
| `ui.shatter_the_rune` | ar | حطّم الرونية |  | Round 9 §8: weapon combat replaces the timing needle; mercy comes after ten defeats; knights. |
| `ui.shatter_the_rune` | ru | Разбить руну |  | Round 9 §8: weapon combat replaces the timing needle; mercy comes after ten defeats; knights. |
| `ui.shatter_the_rune` | ja | ルーンを砕く |  | Round 9 §8: weapon combat replaces the timing needle; mercy comes after ten defeats; knights. |
| `ui.shatter_the_prototype` | en | Shatter the prototype |  | Round 9 §8: weapon combat replaces the timing needle; mercy comes after ten defeats; knights. |
| `ui.shatter_the_prototype` | fa | نمونه را بشکن |  | Round 9 §8: weapon combat replaces the timing needle; mercy comes after ten defeats; knights. |
| `ui.shatter_the_prototype` | ar | حطّم النموذج |  | Round 9 §8: weapon combat replaces the timing needle; mercy comes after ten defeats; knights. |
| `ui.shatter_the_prototype` | ru | Разбить прототип |  | Round 9 §8: weapon combat replaces the timing needle; mercy comes after ten defeats; knights. |
| `ui.shatter_the_prototype` | ja | 試作体を砕く |  | Round 9 §8: weapon combat replaces the timing needle; mercy comes after ten defeats; knights. |
| `ui.shatter_the_revision` | en | Shatter the revision |  | Round 9 §8: weapon combat replaces the timing needle; mercy comes after ten defeats; knights. |
| `ui.shatter_the_revision` | fa | بازنگری را بشکن |  | Round 9 §8: weapon combat replaces the timing needle; mercy comes after ten defeats; knights. |
| `ui.shatter_the_revision` | ar | حطّم المراجعة |  | Round 9 §8: weapon combat replaces the timing needle; mercy comes after ten defeats; knights. |
| `ui.shatter_the_revision` | ru | Разбить правку |  | Round 9 §8: weapon combat replaces the timing needle; mercy comes after ten defeats; knights. |
| `ui.shatter_the_revision` | ja | 改訂を砕く |  | Round 9 §8: weapon combat replaces the timing needle; mercy comes after ten defeats; knights. |
| `ui.shatter_the_root_rune` | en | Shatter the root rune |  | Round 9 §8: weapon combat replaces the timing needle; mercy comes after ten defeats; knights. |
| `ui.shatter_the_root_rune` | fa | رون ریشه را بشکن |  | Round 9 §8: weapon combat replaces the timing needle; mercy comes after ten defeats; knights. |
| `ui.shatter_the_root_rune` | ar | حطّم رونية الجذر |  | Round 9 §8: weapon combat replaces the timing needle; mercy comes after ten defeats; knights. |
| `ui.shatter_the_root_rune` | ru | Разбить корневую руну |  | Round 9 §8: weapon combat replaces the timing needle; mercy comes after ten defeats; knights. |
| `ui.shatter_the_root_rune` | ja | 根源のルーンを砕く |  | Round 9 §8: weapon combat replaces the timing needle; mercy comes after ten defeats; knights. |
| `ui.rune_shattered` | en | Rune shattered |  | Round 9 §8: weapon combat replaces the timing needle; mercy comes after ten defeats; knights. |
| `ui.rune_shattered` | fa | رون شکست |  | Round 9 §8: weapon combat replaces the timing needle; mercy comes after ten defeats; knights. |
| `ui.rune_shattered` | ar | تحطّمت الرونية |  | Round 9 §8: weapon combat replaces the timing needle; mercy comes after ten defeats; knights. |
| `ui.rune_shattered` | ru | Руна разбита |  | Round 9 §8: weapon combat replaces the timing needle; mercy comes after ten defeats; knights. |
| `ui.rune_shattered` | ja | ルーンは砕けた |  | Round 9 §8: weapon combat replaces the timing needle; mercy comes after ten defeats; knights. |
| `ui.the_rune_holds` | en | The rune holds |  | Round 9 §8: weapon combat replaces the timing needle; mercy comes after ten defeats; knights. |
| `ui.the_rune_holds` | fa | رون پایدار ماند |  | Round 9 §8: weapon combat replaces the timing needle; mercy comes after ten defeats; knights. |
| `ui.the_rune_holds` | ar | الرونية صامدة |  | Round 9 §8: weapon combat replaces the timing needle; mercy comes after ten defeats; knights. |
| `ui.the_rune_holds` | ru | Руна держится |  | Round 9 §8: weapon combat replaces the timing needle; mercy comes after ten defeats; knights. |
| `ui.the_rune_holds` | ja | ルーンは耐えている |  | Round 9 §8: weapon combat replaces the timing needle; mercy comes after ten defeats; knights. |
| `ui.shatter` | en | shatter |  | Round 9 §8: weapon combat replaces the timing needle; mercy comes after ten defeats; knights. |
| `ui.shatter` | fa | شکستن |  | Round 9 §8: weapon combat replaces the timing needle; mercy comes after ten defeats; knights. |
| `ui.shatter` | ar | حطِّم |  | Round 9 §8: weapon combat replaces the timing needle; mercy comes after ten defeats; knights. |
| `ui.shatter` | ru | разбить |  | Round 9 §8: weapon combat replaces the timing needle; mercy comes after ten defeats; knights. |
| `ui.shatter` | ja | 砕く |  | Round 9 §8: weapon combat replaces the timing needle; mercy comes after ten defeats; knights. |

## 05-credits.mjs — 5 changes

| id | lang | old | new | why |
|---|---|---|---|---|
| `ui.credits.rest` | en | Everything else — pictures, sound, music and code — ⏎ was made for Veyrath. Nothing is loaded from the network. | Everything else — pictures, sound, music and code — ⏎ was made for Veyrath. ⏎ Nothing is loaded from the network. | Round 9 §0: a Credits screen in the pause menu (every outside asset, with author and licence). |
| `ui.credits.rest` | fa | هر چیز دیگر — تصویر، صدا، موسیقی و کد — ⏎ برای ویراث ساخته شده است. چیزی از شبکه بار نمی‌شود. | هر چیز دیگر، از تصویر و صدا تا موسیقی و کد، ⏎ برای ویراث ساخته شده است. ⏎ چیزی از شبکه بار نمی‌شود. | Round 9 §0: a Credits screen in the pause menu (every outside asset, with author and licence). |
| `ui.credits.rest` | ar | كل ما عدا ذلك — الصور والصوت والموسيقى والشفرة — ⏎ صُنع من أجل فيراث. لا شيء يُحمَّل من الشبكة. | كل ما عدا ذلك، من الصور والصوت إلى الموسيقى والشفرة، ⏎ صُنع من أجل فيراث. ⏎ لا شيء يُحمَّل من الشبكة. | Round 9 §0: a Credits screen in the pause menu (every outside asset, with author and licence). |
| `ui.credits.rest` | ru | Всё остальное — рисунки, звук, музыка и код — ⏎ создано для Вейрата. Из сети ничего не загружается. | Всё остальное — рисунки, звук, музыка и код — ⏎ создано для Вейрата. ⏎ Из сети ничего не загружается. | Round 9 §0: a Credits screen in the pause menu (every outside asset, with author and licence). |
| `ui.credits.rest` | ja | それ以外のすべて ― 絵、音、音楽、コード ― は ⏎ ヴェイラスのために作られた。ネットワークからは何も読み込まない。 | 絵、音、音楽、コード。そのほかはすべて ⏎ ヴェイラスのために作られた。 ⏎ ネットワークからは何も読み込まない。 | Round 9 §0: a Credits screen in the pause menu (every outside asset, with author and licence). |

## 06-resync.mjs — 17 changes

| id | lang | old | new | why |
|---|---|---|---|---|
| `ui.armoury` | en | Armoury | Backpack | Owner request (after the Round 9 §8 gate): RE-sync, the mender in the machine halls who rewrites a weapon for points after the first defeat; the weapon screen becomes the Backpack with its own button. |
| `ui.armoury` | fa | زرادخانه | کوله‌پشتی | Owner request (after the Round 9 §8 gate): RE-sync, the mender in the machine halls who rewrites a weapon for points after the first defeat; the weapon screen becomes the Backpack with its own button. |
| `ui.armoury` | ar | مستودع السلاح | حقيبة الظهر | Owner request (after the Round 9 §8 gate): RE-sync, the mender in the machine halls who rewrites a weapon for points after the first defeat; the weapon screen becomes the Backpack with its own button. |
| `ui.armoury` | ru | Оружейная | Рюкзак | Owner request (after the Round 9 §8 gate): RE-sync, the mender in the machine halls who rewrites a weapon for points after the first defeat; the weapon screen becomes the Backpack with its own button. |
| `ui.armoury` | ja | 武器庫 | バックパック | Owner request (after the Round 9 §8 gate): RE-sync, the mender in the machine halls who rewrites a weapon for points after the first defeat; the weapon screen becomes the Backpack with its own button. |
| `cv_workshop.2` | fa | او سایت‌های وردپرس و المنتور را ⏎ با HTML و CSS پاکیزه می‌سازد، | او سایت‌های وردپرس و المنتور را ⏎ با HTML و CSS تمیز و اصولی می‌سازد، | Owner: «پاکیزه» is not the right word for code; «تمیز و اصولی» is what developers say. |
| `cv_workshop.3` | fa | سپس با سئو، گوگل ادز و محتوا ⏎ رشدشان می‌دهد. | و سپس با سئو، گوگل ادز و محتوا ⏎ آن‌ها را به بار می‌نشاند. | Persian: «رشدشان می‌دهد» was flat; «به بار می‌نشاند» carries "flourish". |
| `cv_forest.1` | fa | المنتور. وردپرس. HTML و CSS. ⏎ هر سه، تا لبهٔ استادی آبدیده. | المنتور. وردپرس. HTML و CSS. ⏎ در هر سه، کارکشته و چیره‌دست. | Persian: «تا لبهٔ استادی آبدیده» was a word-for-word image that does not read in Persian. |
| `cv_forest.2` | fa | و اسکیما، تنیده در زیر صفحه ⏎ جایی که تنها ماشین‌ها می‌خوانندش. | و اسکیما، تنیده در زیر صفحه؛ ⏎ آنجا که تنها ماشین‌ها می‌خوانند. | Persian: smoother second line. |
| `cv_forest.3` | fa | او قالب می‌سازد ⏎ و افزونه‌هایی را که لازم دارند می‌نویسد. | او قالب طراحی می‌کند ⏎ و افزونه‌های موردنیازش را خودش می‌نویسد. | Persian: natural word order. |
| `cv_cathedral.1` | fa | یافته شدن، خود هنری جداست. | دیده‌شدن، خود هنری جداگانه است. | Persian: «یافته شدن» is not how being found by search is said; «دیده‌شدن» is. |
| `cv_catacombs.1` | fa | او با ذهن‌های ماشینی ⏎ به دستور خودشان سخن می‌گوید. | او با ذهن‌های ماشینی ⏎ به زبان خودشان سخن می‌گوید. | Persian: «به دستور خودشان» reads as "by their order"; «به زبان خودشان» is the meaning. |
| `cv_catacombs.3` | fa | نیت روشن. ساختار سخت. ⏎ آزموده تا برجا بماند. | هدف روشن. ساختار دقیق. ⏎ آن‌قدر آزموده که پابرجا بماند. | Persian: clearer. |
| `cv_repository.4` | fa | شش وب‌سایت هنوز برپایند. ⏎ نام‌هایشان در کدکس چشم‌به‌راه است. | شش وب‌سایت هنوز پابرجاست. ⏎ نام‌هایشان در کدکس آمده است. | Persian: clearer. |
| `cv_arena.2` | fa | او بر هفت ستون کار می‌کند. | کار او بر هفت ستون استوار است. | Persian: «بر هفت ستون کار می‌کند» was literal. |
| `cv_arena.4` | fa | اکنون هرچه او هست را خوانده‌ای. | اکنون هرچه دربارهٔ او بود، خوانده‌ای. | Persian: natural phrasing. |
| `cv_arena.5` | fa | برای سخن گفتن با او، ⏎ ثابت کن که جدی‌ای. | برای سخن گفتن با او، ⏎ ثابت کن که جدی هستی. | Persian: «جدی‌ای» is awkward in writing. |

## 06-resync (script) — 2 changes

| id | lang | old | new | why |
|---|---|---|---|---|
| `(7 Persian lines)` | fa | ویرث | ویراث | One spelling for the world's name in Persian: the title screen writes «ویراث»; seven older lines still wrote «ویرث». |
| `codex.architect.who_p` | fa | … با HTML و CSS پاک می‌سازد، … شکوفایشان می‌کند | … با HTML و CSS تمیز و اصولی می‌سازد، … به بار می‌نشاند | Same correction as cv_workshop.2–3 (owner: the word for clean code). |

## 07-music.mjs — 1 changes

| id | lang | old | new | why |
|---|---|---|---|---|
| `ui.credits.music.line` | fa | نُه قطعه که برای ویراث نوشته شده ⏎ و خود بازی آن‌ها را زنده می‌نوازد. بدون هیچ ضبطی. | ۹ قطعه که برای ویراث نوشته شده ⏎ و خود بازی آن‌ها را زنده می‌نوازد. بدون هیچ ضبطی. | Round 9 §7: the new score (volume control in the pause menu, the pieces named on the Credits screen). |

## 09-ally.mjs — 45 changes

| id | lang | old | new | why |
|---|---|---|---|---|
| `shyn_offer.1` | en | Ten times you have fallen on this floor. |  | Owner request (16 Nov): attacks work in every hall but NPCs are under the Keeper's protection; RE-sync joins the fight after five defeats (replaces the offer at ten); his farewell after the win; the Keeper's line when a rewritten weapon comes back. |
| `shyn_offer.1` | fa | ده بار بر این کف افتاده‌ای. |  | Owner request (16 Nov): attacks work in every hall but NPCs are under the Keeper's protection; RE-sync joins the fight after five defeats (replaces the offer at ten); his farewell after the win; the Keeper's line when a rewritten weapon comes back. |
| `shyn_offer.1` | ar | عشر مرات سقطتَ على هذه الأرض. |  | Owner request (16 Nov): attacks work in every hall but NPCs are under the Keeper's protection; RE-sync joins the fight after five defeats (replaces the offer at ten); his farewell after the win; the Keeper's line when a rewritten weapon comes back. |
| `shyn_offer.1` | ru | Десять раз ты падал на этот пол. |  | Owner request (16 Nov): attacks work in every hall but NPCs are under the Keeper's protection; RE-sync joins the fight after five defeats (replaces the offer at ten); his farewell after the win; the Keeper's line when a rewritten weapon comes back. |
| `shyn_offer.1` | ja | この床に、おまえは十度倒れた。 |  | Owner request (16 Nov): attacks work in every hall but NPCs are under the Keeper's protection; RE-sync joins the fight after five defeats (replaces the offer at ten); his farewell after the win; the Keeper's line when a rewritten weapon comes back. |
| `shyn_offer.2` | en | I do not count them to shame you. ⏎ I count them because you came back. |  | Owner request (16 Nov): attacks work in every hall but NPCs are under the Keeper's protection; RE-sync joins the fight after five defeats (replaces the offer at ten); his farewell after the win; the Keeper's line when a rewritten weapon comes back. |
| `shyn_offer.2` | fa | نمی‌شمارم تا شرمسارت کنم. ⏎ می‌شمارم چون بازگشتی. |  | Owner request (16 Nov): attacks work in every hall but NPCs are under the Keeper's protection; RE-sync joins the fight after five defeats (replaces the offer at ten); his farewell after the win; the Keeper's line when a rewritten weapon comes back. |
| `shyn_offer.2` | ar | لا أعدّها لأُخجلك. ⏎ أعدّها لأنك عدتَ. |  | Owner request (16 Nov): attacks work in every hall but NPCs are under the Keeper's protection; RE-sync joins the fight after five defeats (replaces the offer at ten); his farewell after the win; the Keeper's line when a rewritten weapon comes back. |
| `shyn_offer.2` | ru | Я считаю не затем, чтобы стыдить. ⏎ Я считаю, потому что ты вернулся. |  | Owner request (16 Nov): attacks work in every hall but NPCs are under the Keeper's protection; RE-sync joins the fight after five defeats (replaces the offer at ten); his farewell after the win; the Keeper's line when a rewritten weapon comes back. |
| `shyn_offer.2` | ja | 恥じ入らせるために数えるのではない。 ⏎ 戻ってきたから、数えている。 |  | Owner request (16 Nov): attacks work in every hall but NPCs are under the Keeper's protection; RE-sync joins the fight after five defeats (replaces the offer at ten); his farewell after the win; the Keeper's line when a rewritten weapon comes back. |
| `shyn_offer.3` | en | So choose. I can strike softer ⏎ and show each blow sooner. |  | Owner request (16 Nov): attacks work in every hall but NPCs are under the Keeper's protection; RE-sync joins the fight after five defeats (replaces the offer at ten); his farewell after the win; the Keeper's line when a rewritten weapon comes back. |
| `shyn_offer.3` | fa | پس برگزین. می‌توانم نرم‌تر بزنم ⏎ و هر ضربه را زودتر نشان دهم. |  | Owner request (16 Nov): attacks work in every hall but NPCs are under the Keeper's protection; RE-sync joins the fight after five defeats (replaces the offer at ten); his farewell after the win; the Keeper's line when a rewritten weapon comes back. |
| `shyn_offer.3` | ar | فاختر. أستطيع أن أضرب ألين ⏎ وأن أُريك كل ضربة أبكر. |  | Owner request (16 Nov): attacks work in every hall but NPCs are under the Keeper's protection; RE-sync joins the fight after five defeats (replaces the offer at ten); his farewell after the win; the Keeper's line when a rewritten weapon comes back. |
| `shyn_offer.3` | ru | Так выбирай. Я могу бить мягче ⏎ и показывать каждый удар раньше. |  | Owner request (16 Nov): attacks work in every hall but NPCs are under the Keeper's protection; RE-sync joins the fight after five defeats (replaces the offer at ten); his farewell after the win; the Keeper's line when a rewritten weapon comes back. |
| `shyn_offer.3` | ja | ならば選べ。わたしは手を緩め、 ⏎ 一撃ごとに早く示すこともできる。 |  | Owner request (16 Nov): attacks work in every hall but NPCs are under the Keeper's protection; RE-sync joins the fight after five defeats (replaces the offer at ten); his farewell after the win; the Keeper's line when a rewritten weapon comes back. |
| `shyn_offer.4` | en | Or we lay the weapons down, and speak. ⏎ Or nothing changes. |  | Owner request (16 Nov): attacks work in every hall but NPCs are under the Keeper's protection; RE-sync joins the fight after five defeats (replaces the offer at ten); his farewell after the win; the Keeper's line when a rewritten weapon comes back. |
| `shyn_offer.4` | fa | یا سلاح‌ها را زمین می‌گذاریم و سخن می‌گوییم. ⏎ یا هیچ‌چیز دگرگون نمی‌شود. |  | Owner request (16 Nov): attacks work in every hall but NPCs are under the Keeper's protection; RE-sync joins the fight after five defeats (replaces the offer at ten); his farewell after the win; the Keeper's line when a rewritten weapon comes back. |
| `shyn_offer.4` | ar | أو نضع السلاح ونتكلّم. ⏎ أو لا يتغيّر شيء. |  | Owner request (16 Nov): attacks work in every hall but NPCs are under the Keeper's protection; RE-sync joins the fight after five defeats (replaces the offer at ten); his farewell after the win; the Keeper's line when a rewritten weapon comes back. |
| `shyn_offer.4` | ru | Или мы сложим оружие и поговорим. ⏎ Или ничего не изменится. |  | Owner request (16 Nov): attacks work in every hall but NPCs are under the Keeper's protection; RE-sync joins the fight after five defeats (replaces the offer at ten); his farewell after the win; the Keeper's line when a rewritten weapon comes back. |
| `shyn_offer.4` | ja | あるいは武器を置き、語り合う。 ⏎ あるいは、何も変えない。 |  | Owner request (16 Nov): attacks work in every hall but NPCs are under the Keeper's protection; RE-sync joins the fight after five defeats (replaces the offer at ten); his farewell after the win; the Keeper's line when a rewritten weapon comes back. |
| `shyn_offer.ease` | en | Then watch. I will show you ⏎ where each blow falls. |  | Owner request (16 Nov): attacks work in every hall but NPCs are under the Keeper's protection; RE-sync joins the fight after five defeats (replaces the offer at ten); his farewell after the win; the Keeper's line when a rewritten weapon comes back. |
| `shyn_offer.ease` | fa | پس بنگر. نشانت می‌دهم ⏎ هر ضربه کجا فرود می‌آید. |  | Owner request (16 Nov): attacks work in every hall but NPCs are under the Keeper's protection; RE-sync joins the fight after five defeats (replaces the offer at ten); his farewell after the win; the Keeper's line when a rewritten weapon comes back. |
| `shyn_offer.ease` | ar | فانظر إذن. سأُريك ⏎ أين تقع كل ضربة. |  | Owner request (16 Nov): attacks work in every hall but NPCs are under the Keeper's protection; RE-sync joins the fight after five defeats (replaces the offer at ten); his farewell after the win; the Keeper's line when a rewritten weapon comes back. |
| `shyn_offer.ease` | ru | Тогда смотри. Я покажу, ⏎ куда ляжет каждый удар. |  | Owner request (16 Nov): attacks work in every hall but NPCs are under the Keeper's protection; RE-sync joins the fight after five defeats (replaces the offer at ten); his farewell after the win; the Keeper's line when a rewritten weapon comes back. |
| `shyn_offer.ease` | ja | ならば見ていろ。一撃ごとに、 ⏎ どこへ落ちるかを示そう。 |  | Owner request (16 Nov): attacks work in every hall but NPCs are under the Keeper's protection; RE-sync joins the fight after five defeats (replaces the offer at ten); his farewell after the win; the Keeper's line when a rewritten weapon comes back. |
| `shyn_offer.fight` | en | Good. ⏎ Then stand up. |  | Owner request (16 Nov): attacks work in every hall but NPCs are under the Keeper's protection; RE-sync joins the fight after five defeats (replaces the offer at ten); his farewell after the win; the Keeper's line when a rewritten weapon comes back. |
| `shyn_offer.fight` | fa | خوب است. ⏎ پس برخیز. |  | Owner request (16 Nov): attacks work in every hall but NPCs are under the Keeper's protection; RE-sync joins the fight after five defeats (replaces the offer at ten); his farewell after the win; the Keeper's line when a rewritten weapon comes back. |
| `shyn_offer.fight` | ar | حسنٌ. ⏎ فانهض إذن. |  | Owner request (16 Nov): attacks work in every hall but NPCs are under the Keeper's protection; RE-sync joins the fight after five defeats (replaces the offer at ten); his farewell after the win; the Keeper's line when a rewritten weapon comes back. |
| `shyn_offer.fight` | ru | Хорошо. ⏎ Тогда вставай. |  | Owner request (16 Nov): attacks work in every hall but NPCs are under the Keeper's protection; RE-sync joins the fight after five defeats (replaces the offer at ten); his farewell after the win; the Keeper's line when a rewritten weapon comes back. |
| `shyn_offer.fight` | ja | よい。 ⏎ ならば立て。 |  | Owner request (16 Nov): attacks work in every hall but NPCs are under the Keeper's protection; RE-sync joins the fight after five defeats (replaces the offer at ten); his farewell after the win; the Keeper's line when a rewritten weapon comes back. |
| `offer.c.ease` | en | Strike softer, show me sooner |  | Owner request (16 Nov): attacks work in every hall but NPCs are under the Keeper's protection; RE-sync joins the fight after five defeats (replaces the offer at ten); his farewell after the win; the Keeper's line when a rewritten weapon comes back. |
| `offer.c.ease` | fa | نرم‌تر بزن، زودتر نشانم بده |  | Owner request (16 Nov): attacks work in every hall but NPCs are under the Keeper's protection; RE-sync joins the fight after five defeats (replaces the offer at ten); his farewell after the win; the Keeper's line when a rewritten weapon comes back. |
| `offer.c.ease` | ar | اضرب ألين، وأرني أبكر |  | Owner request (16 Nov): attacks work in every hall but NPCs are under the Keeper's protection; RE-sync joins the fight after five defeats (replaces the offer at ten); his farewell after the win; the Keeper's line when a rewritten weapon comes back. |
| `offer.c.ease` | ru | Бей мягче, показывай раньше |  | Owner request (16 Nov): attacks work in every hall but NPCs are under the Keeper's protection; RE-sync joins the fight after five defeats (replaces the offer at ten); his farewell after the win; the Keeper's line when a rewritten weapon comes back. |
| `offer.c.ease` | ja | 手を緩め、早く示してくれ |  | Owner request (16 Nov): attacks work in every hall but NPCs are under the Keeper's protection; RE-sync joins the fight after five defeats (replaces the offer at ten); his farewell after the win; the Keeper's line when a rewritten weapon comes back. |
| `offer.c.yield` | en | Lay the weapons down |  | Owner request (16 Nov): attacks work in every hall but NPCs are under the Keeper's protection; RE-sync joins the fight after five defeats (replaces the offer at ten); his farewell after the win; the Keeper's line when a rewritten weapon comes back. |
| `offer.c.yield` | fa | سلاح‌ها را زمین بگذاریم |  | Owner request (16 Nov): attacks work in every hall but NPCs are under the Keeper's protection; RE-sync joins the fight after five defeats (replaces the offer at ten); his farewell after the win; the Keeper's line when a rewritten weapon comes back. |
| `offer.c.yield` | ar | لنضع السلاح |  | Owner request (16 Nov): attacks work in every hall but NPCs are under the Keeper's protection; RE-sync joins the fight after five defeats (replaces the offer at ten); his farewell after the win; the Keeper's line when a rewritten weapon comes back. |
| `offer.c.yield` | ru | Сложим оружие |  | Owner request (16 Nov): attacks work in every hall but NPCs are under the Keeper's protection; RE-sync joins the fight after five defeats (replaces the offer at ten); his farewell after the win; the Keeper's line when a rewritten weapon comes back. |
| `offer.c.yield` | ja | 武器を置こう |  | Owner request (16 Nov): attacks work in every hall but NPCs are under the Keeper's protection; RE-sync joins the fight after five defeats (replaces the offer at ten); his farewell after the win; the Keeper's line when a rewritten weapon comes back. |
| `offer.c.fight` | en | Change nothing |  | Owner request (16 Nov): attacks work in every hall but NPCs are under the Keeper's protection; RE-sync joins the fight after five defeats (replaces the offer at ten); his farewell after the win; the Keeper's line when a rewritten weapon comes back. |
| `offer.c.fight` | fa | هیچ‌چیز را دگرگون نکن |  | Owner request (16 Nov): attacks work in every hall but NPCs are under the Keeper's protection; RE-sync joins the fight after five defeats (replaces the offer at ten); his farewell after the win; the Keeper's line when a rewritten weapon comes back. |
| `offer.c.fight` | ar | لا تغيّر شيئًا |  | Owner request (16 Nov): attacks work in every hall but NPCs are under the Keeper's protection; RE-sync joins the fight after five defeats (replaces the offer at ten); his farewell after the win; the Keeper's line when a rewritten weapon comes back. |
| `offer.c.fight` | ru | Ничего не меняй |  | Owner request (16 Nov): attacks work in every hall but NPCs are under the Keeper's protection; RE-sync joins the fight after five defeats (replaces the offer at ten); his farewell after the win; the Keeper's line when a rewritten weapon comes back. |
| `offer.c.fight` | ja | 何も変えるな |  | Owner request (16 Nov): attacks work in every hall but NPCs are under the Keeper's protection; RE-sync joins the fight after five defeats (replaces the offer at ten); his farewell after the win; the Keeper's line when a rewritten weapon comes back. |


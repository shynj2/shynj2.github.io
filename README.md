# Cyber Sanctum — پورتفولیوی شایان میرخانی

سایت استاتیک (بدون وردپرس و PHP) با دو زبان فارسی/انگلیسی. / Static portfolio, EN/FA with RTL.

## انتشار روی GitHub Pages
1. یک repository جدید بسازید و **همهٔ فایل‌های این پوشه** را در ریشهٔ آن آپلود کنید (`index.html` باید در ریشه باشد).
2. در GitHub: **Settings → Pages → Build and deployment → Source: Deploy from a branch**
3. Branch را `main` و پوشه را `/ (root)` انتخاب و Save کنید.
4. بعد از حدود یک دقیقه سایت در `https://USERNAME.github.io/REPO/` آنلاین می‌شود.

## ویرایش متن‌ها
تمام متن‌ها (انگلیسی و فارسی) در `assets/js/translations.js` هستند. متن را آنجا عوض کنید؛
همان متن انگلیسی را در `index.html` هم عوض کنید (به‌عنوان متن پیش‌فرض).

## ساختار
- `index.html` — صفحه
- `style.css` — ظاهر (شامل حالت راست‌چین)
- `assets/js/translations.js` — ترجمه‌ها
- `assets/js/i18n.js` — دکمهٔ تغییر زبان + انیمیشن ترجمه
- `assets/js/fx.js` — افکت‌ها (گلیچ، شکستن گل، صفحهٔ مخفی)
- `assets/js/secret-data.js` — دادهٔ رمزنگاری‌شدهٔ صفحهٔ مخفی (دست نخورده)

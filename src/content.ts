import type { Lang } from './store';

export type Bi = { en: string; fa: string };

export const CHAPTERS: { id: string; roman: string; nav: Bi; place: Bi; coord: string; sub?: boolean; rail?: Bi }[] = [
  { id: 'home', roman: '', nav: { en: 'Prologue', fa: 'آغاز' }, place: { en: 'Beyond the Wall', fa: 'آن‌سوی دیوار' }, coord: '71°18′N' },
  { id: 'about', roman: 'I', nav: { en: 'Chronicle', fa: 'درباره' }, place: { en: 'Winterfell', fa: 'وینترفل' }, coord: '60°07′N' },
  { id: 'pillars', roman: 'II', nav: { en: 'Pillars', fa: 'هفت پایه' }, place: { en: 'The Great Sept', fa: 'سپتِ بزرگ' }, coord: '48°41′N' },
  { id: 'skills', roman: 'III', nav: { en: 'Houses', fa: 'مهارت‌ها' }, place: { en: 'The Red Keep', fa: 'دژ سرخ' }, coord: '42°24′N' },
  { id: 'resume', roman: 'IV', nav: { en: 'Campaigns', fa: 'رزومه' }, place: { en: 'The Kingsroad', fa: 'جادهٔ شاه' }, coord: '39°52′N' },
  { id: 'works', roman: 'V', nav: { en: 'Strongholds', fa: 'نمونه‌کارها' }, place: { en: 'Dragonstone', fa: 'دراگون‌استون' }, coord: '33°12′N' },
  { id: 'realms', roman: 'VI', nav: { en: 'Realms', fa: 'قلمروها' }, rail: { en: 'Garden', fa: 'باغ ژاپنی' }, place: { en: 'Yi Ti · The Far East', fa: 'یی‌تی · شرق دور' }, coord: '24°02′N' },
  { id: 'realm-cyber', roman: 'VI', sub: true, nav: { en: 'Cyberpunk', fa: 'سایبرپانک' }, place: { en: 'Neon Valyria', fa: 'والریای نئونی' }, coord: '21°47′N' },
  { id: 'realm-minimal', roman: 'VI', sub: true, nav: { en: 'Minimal', fa: 'مینیمال' }, place: { en: 'House of Black & White', fa: 'خانهٔ سیاه و سفید' }, coord: '36°10′N' },
  { id: 'realm-game', roman: 'VI', sub: true, nav: { en: 'The Game', fa: 'بازی' }, place: { en: 'Veyrath', fa: 'ویراث' }, coord: '00°00′' },
  { id: 'contact', roman: 'VII', nav: { en: 'Raven', fa: 'تماس' }, place: { en: 'The Rookery', fa: 'لانهٔ کلاغ‌ها' }, coord: '29°36′N' },
  // the empty stretch below everything: the egg finally breaks and the phoenix rises
  { id: 'rebirth', roman: 'VII', sub: true, nav: { en: 'Phoenix', fa: 'ققنوس' }, place: { en: 'From the Ashes', fa: 'برخاسته از خاکستر' }, coord: '∞' },
];

const EN = {
  title: 'Shayan Mirkhani — A Song of Ice & Code',
  brandName: 'Shayan Mirkhani',
  brandSub: 'House Mirkhani · Est. 2022',
  openToWork: 'Open to work',
  // preloader
  preQuote: 'The night is dark and full of terrors',
  preSub: 'Forging the realm',
  enterSound: 'Enter with sound',
  enterSilent: 'Enter in silence',
  preHint: 'Best experienced with headphones',
  // hud
  temp: 'Temp',
  sound: 'Sound',
  menu: 'Menu',
  close: 'Close',
  langBtn: 'فا',
  // overcharge
  phoenixTitle: 'The Phoenix',
  heatLabel: 'Phoenix temperature',
  heatHint: 'Hold the phoenix to reach 4,000°C',
  reborn: 'What is dead may never die',
  // hero
  heroKicker: 'Portfolio · MMXXVI — A Song of Ice & Code',
  heroFirst: 'Shayan',
  heroLast: 'Mirkhani',
  roles: ['Web Designer', 'SEO Specialist', 'Digital Marketer'],
  heroLabel: 'The Prophecy',
  heroP: 'I build WordPress and Elementor sites with clean HTML and CSS, then grow them with SEO, Google Ads and content.',
  ctaWorks: 'View works',
  ctaRaven: 'Send a raven',
  scrollHint: 'Scroll — the relic turns',
  holdHint: 'Hover the relic, or hold',
  holdHint2: 'it answers your hand',
  touchHint: 'Swipe anywhere · The relic follows your touch',
  heroMeta: '7 pillars · 10 sworn swords · 6 strongholds',
  // about
  aboutKicker: 'Chapter I — The Chronicle',
  aboutTitle: ['Punctual,', 'principled,', 'precise.'],
  about:
    "I'm a web designer, SEO specialist and digital marketer who has led web design and digital marketing teams. I build WordPress and Elementor sites with clean HTML and CSS, then grow them with SEO, Google Ads and content. I'm intensely punctual, and I work by seven principles: honesty, honor, loyalty, punctuality, courage, hard work and a firm moral code.",
  stats: ['Years in the field', 'Workplaces', 'Websites in portfolio', 'Languages'],
  // pillars
  pillarsKicker: 'Chapter II — The Seven Pillars',
  pillarsTitle: ['Seven pillars.', 'One oath.'],
  pillarsSub: 'The code I live and work by — older than any framework, stronger than any deadline.',
  // houses
  housesKicker: 'Chapter III — The Great Houses',
  housesTitle: ['Tools', 'I trust.'],
  housesSub: 'Three great houses. Ten sworn swords. Every one of them battle-tested on real projects.',
  house: 'House',
  advanced: 'Advanced',
  proficient: 'Proficient',
  mastery: 'Mastery',
  // campaigns
  campKicker: 'Chapter IV — The Campaigns',
  campTitle: ['Where', "I've served."],
  campSub: 'Three banners carried across the realm — often at the same time.',
  yr: 'yr',
  mo: 'mo',
  tongues: 'Tongues spoken',
  tonguesSub: 'Languages',
  activity: 'Career activity',
  activitySub: 'Roles held at the same time, month by month',
  peak: 'roles at peak',
  // works
  worksKicker: 'Chapter V — Forged in Fire',
  worksTitle: ['Selected', 'websites.'],
  worksSub: 'Six strongholds raised, defended and ranked.',
  filters: { all: 'All', store: 'Online stores', corp: 'Business & services' },
  stronghold: 'Stronghold',
  visit: 'Visit website',
  // realms
  realmsKicker: 'Chapter VI — Beyond the Narrow Sea',
  realmsTitle: ['Four realms', 'beyond the sea.'],
  realmsSub: 'This résumé is only one of the worlds I have built. Four more lie across the water — the same story, told in four different tongues.',
  // contact
  contactKicker: 'Epilogue — The Rookery',
  contactTitle: ['Send', 'a raven.'],
  contactSub: 'Ravens are slow. Telegram is faster. Either way — I answer.',
  email: 'Email',
  telegram: 'Telegram',
  phone: 'Phone',
  formName: 'Your name',
  formMsg: 'Your message…',
  formSend: 'Send the raven',
  formSent: 'Your raven has taken flight',
  ravenSubject: 'A raven from',
  valar: 'Valar Dohaeris — all men must serve.',
  footer: '© 2026 Shayan Mirkhani',
  backTop: 'Return to the Wall',
};

export type Dict = typeof EN;

const FA: Dict = {
  title: 'شایان میرخانی — آوای یخ و کد',
  brandName: 'شایان میرخانی',
  brandSub: 'خاندان میرخانی · از ۱۴۰۰',
  openToWork: 'آمادهٔ همکاری',
  preQuote: 'شب تاریک است و پر از وحشت',
  preSub: 'در حال ساختن قلمرو',
  enterSound: 'ورود با صدا',
  enterSilent: 'ورود بی‌صدا',
  preHint: 'با هدفون تجربهٔ بهتری دارد',
  temp: 'دما',
  sound: 'صدا',
  menu: 'منو',
  close: 'بستن',
  langBtn: 'EN',
  // overcharge
  phoenixTitle: 'ققنوس',
  heatLabel: 'دمای ققنوس',
  heatHint: 'روی ققنوس نگه دار تا به ۴۰۰۰ درجه برسد',
  reborn: 'آن‌چه مردنی است نمی‌میرد',
  heroKicker: 'نمونه‌کار و رزومه · ۲۰۲۶ — آوای یخ و کد',
  heroFirst: 'شایان',
  heroLast: 'میرخانی',
  roles: ['طراح وب', 'متخصص سئو', 'دیجیتال مارکتر'],
  heroLabel: 'پیشگویی',
  heroP: 'سایت‌های وردپرس و المنتور را با HTML و CSS تمیز می‌سازم و با سئو، گوگل ادز و تولید محتوا رشدشان می‌دهم.',
  ctaWorks: 'دیدن نمونه‌کارها',
  ctaRaven: 'فرستادن کلاغ',
  scrollHint: 'اسکرول کن تا اثر بچرخد',
  holdHint: 'موس را روی اثر ببر، یا نگه دار',
  holdHint2: 'اثر جواب دستت را می‌دهد',
  touchHint: 'هر جای صفحه بکش؛ ذرات به لمست واکنش نشان می‌دهند',
  heroMeta: '۷ پایه · ۱۰ شمشیر سوگندخورده · ۶ دژ',
  aboutKicker: 'فصل یکم — وقایع‌نامه',
  aboutTitle: ['وقت‌شناس،', 'اصولی،', 'دقیق.'],
  about:
    'من طراح وب، متخصص سئو و دیجیتال مارکتر هستم و مدیریت تیم‌های طراحی سایت و دیجیتال مارکتینگ را بر عهده داشته‌ام. سایت‌های وردپرس و المنتور را با HTML و CSS تمیز می‌سازم و با سئو، گوگل ادز و تولید محتوا رشدشان می‌دهم. به‌شدت وقت‌شناسم و بر پایه هفت اصل کار می‌کنم: صداقت، شرافت، وفاداری، وقت‌شناسی، شجاعت، سخت‌کوشی و چهارچوب اخلاقی.',
  stats: ['سال سابقه', 'محل کار', 'سایت در نمونه‌کارها', 'زبان'],
  pillarsKicker: 'فصل دوم — هفت پایه',
  pillarsTitle: ['هفت پایه.', 'یک سوگند.'],
  pillarsSub: 'اصولی که با آن زندگی و کار می‌کنم — قدیمی‌تر از هر فریم‌ورکی، محکم‌تر از هر ددلاینی.',
  housesKicker: 'فصل سوم — خاندان‌های بزرگ',
  housesTitle: ['ابزارهایی', 'که بهشان تکیه دارم'],
  housesSub: 'سه خاندان بزرگ، ده شمشیر سوگندخورده؛ همه در پروژه‌های واقعی آزموده شده‌اند.',
  house: 'خاندان',
  advanced: 'پیشرفته',
  proficient: 'مسلط',
  mastery: 'تسلط',
  campKicker: 'فصل چهارم — لشکرکشی‌ها',
  campTitle: ['جاهایی', 'که خدمت کرده‌ام'],
  campSub: 'سه پرچم که در سراسر قلمرو حمل کرده‌ام — اغلب هم‌زمان.',
  yr: 'سال',
  mo: 'ماه',
  tongues: 'زبان‌هایی که می‌دانم',
  tonguesSub: 'زبان‌ها',
  activity: 'روند فعالیت شغلی',
  activitySub: 'تعداد نقش‌های هم‌زمان در هر ماه',
  peak: 'نقش در اوج',
  worksKicker: 'فصل پنجم — آبدیده در آتش',
  worksTitle: ['سایت‌های', 'منتخب'],
  worksSub: 'شش دژ که ساخته‌ام، از آن‌ها دفاع کرده‌ام و به صدر رسانده‌ام.',
  filters: { all: 'همه', store: 'سایت‌های فروشگاهی', corp: 'شرکتی و خدماتی' },
  stronghold: 'دژ',
  visit: 'مشاهده سایت',
  realmsKicker: 'فصل ششم — آن‌سوی دریای باریک',
  realmsTitle: ['چهار قلمرو', 'آن‌سوی دریا.'],
  realmsSub: 'این رزومه فقط یکی از دنیاهایی است که ساخته‌ام. چهار دنیای دیگر آن‌سوی آب‌اند؛ همان داستان، به چهار زبان متفاوت.',
  contactKicker: 'پایان‌پرده — لانهٔ کلاغ‌ها',
  contactTitle: ['یک کلاغ', 'بفرست.'],
  contactSub: 'کلاغ‌ها کندند، تلگرام سریع‌تر است. در هر صورت جواب می‌دهم.',
  email: 'ایمیل',
  telegram: 'تلگرام',
  phone: 'تلفن',
  formName: 'نام شما',
  formMsg: 'پیام شما…',
  formSend: 'فرستادن کلاغ',
  formSent: 'کلاغ شما پرواز کرد',
  ravenSubject: 'کلاغی از طرف',
  valar: 'والار دوهاریس — همهٔ انسان‌ها باید خدمت کنند.',
  footer: '© ۲۰۲۶ شایان میرخانی',
  backTop: 'بازگشت به دیوار',
};

export const TEXT: Record<Lang, Dict> = { en: EN, fa: FA };

export const STATS = [
  { value: 4, suffix: '+' },
  { value: 3, suffix: '' },
  { value: 6, suffix: '' },
  { value: 3, suffix: '' },
];

export const PILLARS: { name: Bi; line: Bi }[] = [
  { name: { en: 'Honesty', fa: 'صداقت' }, line: { en: 'No hidden fees, no dark patterns. Only the truth — even when it is cold.', fa: 'بدون هزینهٔ پنهان و بدون ترفند. فقط حقیقت، حتی اگر سرد باشد.' } },
  { name: { en: 'Honor', fa: 'شرافت' }, line: { en: 'My name is on every launch, and I guard it like a sword.', fa: 'نام من پای هر پروژه است و مثل شمشیر از آن محافظت می‌کنم.' } },
  { name: { en: 'Loyalty', fa: 'وفاداری' }, line: { en: 'Your brand becomes my house. I fight for it.', fa: 'برند شما خاندان من می‌شود و برایش می‌جنگم.' } },
  { name: { en: 'Punctuality', fa: 'وقت‌شناسی' }, line: { en: 'Deadlines are sacred. Winter waits for no one.', fa: 'ددلاین مقدس است. زمستان منتظر هیچ‌کس نمی‌ماند.' } },
  { name: { en: 'Courage', fa: 'شجاعت' }, line: { en: 'Bold design, bold strategy — no fear of the dark.', fa: 'طراحی جسورانه، استراتژی جسورانه؛ بی‌هراس از تاریکی.' } },
  { name: { en: 'Hard work', fa: 'سخت‌کوشی' }, line: { en: 'Forged daily — in fire, and in code.', fa: 'هر روز آبدیده می‌شوم؛ در آتش و در کد.' } },
  { name: { en: 'Moral code', fa: 'چهارچوب اخلاقی' }, line: { en: 'Some lines I never cross — in search, or in life.', fa: 'از بعضی خط‌ها هرگز عبور نمی‌کنم؛ نه در سئو، نه در زندگی.' } },
];

export type HouseId = 'web' | 'seo' | 'mkt';

export const HOUSES: { id: HouseId; sigil: 'tower' | 'eye' | 'dragon'; name: Bi; words: Bi }[] = [
  { id: 'web', sigil: 'tower', name: { en: 'Web', fa: 'وب' }, words: { en: 'The Code Remembers', fa: 'کد فراموش نمی‌کند' } },
  { id: 'seo', sigil: 'eye', name: { en: 'SEO', fa: 'سئو' }, words: { en: 'Ours Is the First Page', fa: 'صفحهٔ اول از آنِ ماست' } },
  { id: 'mkt', sigil: 'dragon', name: { en: 'Marketing', fa: 'بازاریابی' }, words: { en: 'Hear Us Roar', fa: 'غرش ما را بشنوید' } },
];

export const SKILLS: { icon: string; name: Bi; level: 'a' | 'p'; value: number; house: HouseId }[] = [
  { icon: 'elementor', name: { en: 'Elementor', fa: 'المنتور' }, level: 'a', value: 85, house: 'web' },
  { icon: 'wordpress', name: { en: 'WordPress', fa: 'وردپرس' }, level: 'a', value: 88, house: 'web' },
  { icon: 'html5', name: { en: 'HTML / CSS', fa: 'HTML / CSS' }, level: 'a', value: 80, house: 'web' },
  { icon: 'schemadotorg', name: { en: 'Schema', fa: 'اسکیما' }, level: 'p', value: 78, house: 'web' },
  { icon: '', name: { en: 'SEO', fa: 'سئو' }, level: 'a', value: 90, house: 'seo' },
  { icon: 'googlesearchconsole', name: { en: 'Google Search Console', fa: 'گوگل سرچ کنسول' }, level: 'a', value: 85, house: 'seo' },
  { icon: 'moz', name: { en: 'Moz Keyword Tools', fa: 'ابزارهای کلمات کلیدی Moz' }, level: 'p', value: 70, house: 'seo' },
  { icon: 'screamingfrog', name: { en: 'Screaming Frog', fa: 'اسکریمینگ فراگ' }, level: 'p', value: 76, house: 'seo' },
  { icon: '', name: { en: 'Digital Marketing', fa: 'دیجیتال مارکتینگ' }, level: 'a', value: 82, house: 'mkt' },
  { icon: 'googleads', name: { en: 'Google Ads', fa: 'گوگل ادز' }, level: 'p', value: 75, house: 'mkt' },
];

export const JOBS: { company: Bi; dates: Bi; start: [number, number]; end: [number, number]; roles: { en: string[]; fa: string[] } }[] = [
  {
    company: { en: 'firstt Mobalan Group', fa: 'مجموعه مبلمان فرست' },
    dates: { en: 'Sep 2023 – May 2025', fa: 'شهریور ۱۴۰۲ – اردیبهشت ۱۴۰۴' },
    start: [2023, 9],
    end: [2025, 5],
    roles: { en: ['Head of Digital Marketing', 'Content Specialist', 'Web Designer'], fa: ['مدیر بخش دیجیتال مارکتینگ', 'کارشناس تولید محتوا', 'طراح سایت'] },
  },
  {
    company: { en: 'Pooyan Sport — Sportswear Store', fa: 'فروشگاه لباس ورزشی پویان اسپورت' },
    dates: { en: 'Mar 2022 – Oct 2023', fa: 'اسفند ۱۴۰۰ – مهر ۱۴۰۲' },
    start: [2022, 3],
    end: [2023, 10],
    roles: { en: ['SEO Consultant', 'Website Admin'], fa: ['مشاور سئو', 'ادمین سایت'] },
  },
  {
    company: { en: 'Aidbax Digital Marketing Group', fa: 'مجموعه دیجیتال مارکتینگ آیدبکس' },
    dates: { en: 'Feb 2022 – Oct 2023', fa: 'بهمن ۱۴۰۰ – مهر ۱۴۰۲' },
    start: [2022, 2],
    end: [2023, 10],
    roles: { en: ['Head of Web Design', 'SEO Consultant'], fa: ['مدیر بخش طراحی سایت', 'مشاور سئو'] },
  },
];

export const LANGUAGES: { name: Bi; level: Bi; value: number }[] = [
  { name: { en: 'English', fa: 'انگلیسی' }, level: { en: 'Professional', fa: 'حرفه‌ای' }, value: 85 },
  { name: { en: 'Russian', fa: 'روسی' }, level: { en: 'Basic', fa: 'مقدماتی' }, value: 30 },
  { name: { en: 'Japanese', fa: 'ژاپنی' }, level: { en: 'Basic', fa: 'مقدماتی' }, value: 25 },
];

const P4 = {
  desc: { en: 'Website design and administration.', fa: 'طراحی و ادمینی سایت.' },
  tags: { en: 'Web Design · Site Admin', fa: 'طراحی سایت · ادمینی سایت' },
  role: { en: 'Web Designer · Site Admin', fa: 'طراح سایت · ادمین سایت' },
};

export const WORKS: { domain: string; cat: 'store' | 'corp'; accent: string; desc: Bi; tags: Bi; role: Bi }[] = [
  {
    domain: 'pooyansport.com',
    cat: 'store',
    accent: '#FF7A59',
    desc: { en: 'Website for a sportswear store: design and search optimization.', fa: 'سایت یک فروشگاه پوشاک ورزشی: طراحی و بهینه‌سازی برای موتورهای جستجو.' },
    tags: { en: 'Web Design · SEO', fa: 'طراحی سایت · سئو' },
    role: { en: 'SEO Consultant · Website Admin', fa: 'مشاور سئو · ادمین سایت' },
  },
  {
    domain: 'aidbax.ir',
    cat: 'corp',
    accent: '#B79CFF',
    desc: { en: 'Website and search presence for a digital marketing group.', fa: 'سایت و حضور در نتایج جستجو برای یک مجموعه دیجیتال مارکتینگ.' },
    tags: { en: 'Digital Marketing · Web Design · SEO', fa: 'دیجیتال مارکتینگ · طراحی سایت · سئو' },
    role: { en: 'Head of Web Design · SEO Consultant', fa: 'مدیر بخش طراحی سایت · مشاور سئو' },
  },
  {
    domain: 'newabzar.com',
    cat: 'store',
    accent: '#38BDF8',
    desc: { en: 'Website design project.', fa: 'پروژه طراحی سایت.' },
    tags: { en: 'Web Design', fa: 'طراحی سایت' },
    role: { en: 'Web Designer', fa: 'طراح سایت' },
  },
  { domain: 'abzaramini.com', cat: 'store', accent: '#6FCF97', ...P4 },
  { domain: 'bestabzar1.ir', cat: 'store', accent: '#F5C542', ...P4 },
  { domain: 'takabzarplus.ir', cat: 'store', accent: '#FF8FA3', ...P4 },
];

/* ---------- The other pages of the site ("realms beyond the sea") ---------- */
export const REALM_BASE = 'https://shynj2.github.io/shyn/';
export type RealmId = 'garden' | 'cyber' | 'minimal' | 'game';

export const REALMS: Record<
  RealmId,
  { path: string; short: Bi; kicker: Bi; title: { en: string[]; fa: string[] }; quote: Bi; body: Bi; chips: { en: string[]; fa: string[] }; cta: Bi }
> = {
  garden: {
    path: 'japan.html',
    short: { en: 'Japanese garden', fa: 'باغ ژاپنی' },
    kicker: { en: 'Realm I — Yi Ti · The Far East', fa: 'قلمرو یکم — یی‌تی · شرق دور' },
    title: { en: ['The Garden of', 'Seven Gates'], fa: ['باغِ', 'هفت دروازه'] },
    quote: { en: 'Scroll slowly; walk through the gates.', fa: 'آهسته پایین برو؛ از زیر دروازه‌ها می‌گذری.' },
    body: {
      en: 'My résumé as a 3D Japanese garden. Seven gates rise along a stone path — pass beneath each one and a scroll unrolls with another part of the story. Ink, paper, cranes and a little dawn light.',
      fa: 'رزومهٔ من به شکل یک باغ ژاپنی سه‌بعدی. هفت دروازه در امتداد یک مسیر سنگی قد می‌کشند؛ از زیر هرکدام که بگذری، طوماری باز می‌شود و بخش دیگری از داستان را می‌گوید. مرکب، کاغذ، دُرناها و کمی نور سپیده‌دم.',
    },
    chips: { en: ['3D garden', 'Seven gates', 'Ink & paper', 'Best with sound'], fa: ['باغ سه‌بعدی', 'هفت دروازه', 'مرکب و کاغذ', 'با صدا بهتر است'] },
    cta: { en: 'Walk through the gates', fa: 'عبور از دروازه‌ها' },
  },
  cyber: {
    path: 'cyber.html',
    short: { en: 'Cyberpunk', fa: 'سایبرپانک' },
    kicker: { en: 'Realm II — Neon Valyria', fa: 'قلمرو دوم — والریای نئونی' },
    title: { en: ['The Other', 'Side of Me'], fa: ['روی دیگرِ', 'من'] },
    quote: { en: 'I swore to build my life on seven pillars.', fa: 'سوگند خورده‌ام زندگی‌ام را بر هفت پایه بنا کنم.' },
    body: {
      en: 'The same résumé, rewired in neon. Magenta and cyan light, a glowing sigil, mono type — and a motion switch for those who like the night a little calmer.',
      fa: 'همان رزومه، این بار با سیم‌کشی نئونی. نور سرخابی و فیروزه‌ای، یک نشان درخشان، حروف مونو — و کلیدی برای خاموش کردن حرکت‌ها، برای کسانی که شبِ آرام‌تری می‌خواهند.',
    },
    chips: { en: ['Neon interface', 'Motion switch', 'A4 résumé', 'FA / EN'], fa: ['رابط نئونی', 'کلید حرکت', 'رزومه A4', 'فارسی / انگلیسی'] },
    cta: { en: 'Cross to the other side', fa: 'رفتن به روی دیگر' },
  },
  minimal: {
    path: '',
    short: { en: 'Minimal', fa: 'مینیمال' },
    kicker: { en: 'Realm III — Black & White', fa: 'قلمرو سوم — سیاه و سفید' },
    title: { en: ['Nothing', 'extra.'], fa: ['هیچ چیزِ', 'اضافه.'] },
    quote: { en: 'Punctual, principled, precise.', fa: 'وقت‌شناس، اصولی، دقیق.' },
    body: {
      en: 'Where everything began. Black, white and a quiet grid — the plain-spoken résumé, with skill rings, a career chart and a one-page A4 PDF ready for print.',
      fa: 'جایی که همه‌چیز شروع شد. سیاه، سفید و یک شبکهٔ آرام؛ رزومه‌ای بی‌تکلف با حلقه‌های مهارت، نمودار مسیر شغلی و یک PDF تک‌صفحه‌ای A4 آمادهٔ چاپ.',
    },
    chips: { en: ['A4 PDF résumé', 'Career chart', 'Skill rings', 'FA / EN'], fa: ['رزومه PDF در A4', 'نمودار مسیر شغلی', 'حلقه‌های مهارت', 'فارسی / انگلیسی'] },
    cta: { en: 'Open the minimal page', fa: 'دیدن صفحهٔ مینیمال' },
  },
  game: {
    path: 'game/',
    short: { en: 'The game', fa: 'بازی' },
    kicker: { en: 'Realm IV — Veyrath', fa: 'قلمرو چهارم — ویراث' },
    title: { en: ['Veyrath', 'The Keeper of the Root Code'], fa: ['Veyrath', 'نگهبانِ کدِ ریشه'] },
    quote: { en: 'Speak your name, Recruiter.', fa: 'نامت را بگو، ای استخدام‌کننده.' },
    body: {
      en: 'A pixel-art platformer where you play the Recruiter. Walk the halls of Veyrath, read the walls to earn points, meet the Budget Goblin and stand before the Keeper at the Throne of the Root Code. Reach 500 points and 500,000 Toman is struck from Shayan’s first salary.',
      fa: 'یک بازی پلتفرمر پیکسلی که در آن خودت «استخدام‌کننده» هستی. در تالارهای ویراث قدم بزن، دیوارنوشته‌ها را بخوان تا امتیاز بگیری، با «گابلینِ بودجه» روبه‌رو شو و پای «تختِ کدِ ریشه» در برابر نگهبان بایست. به ۵۰۰ امتیاز برسی، ۵۰۰ هزار تومان از اولین حقوق شایان کم می‌شود.',
    },
    chips: { en: ['Pixel-art platformer', '5 languages', 'Codex & achievements', 'Boss fight'], fa: ['پلتفرمر پیکسلی', '۵ زبان', 'کدکس و دستاوردها', 'نبرد پایانی'] },
    cta: { en: 'Begin the trial', fa: 'شروع آزمون' },
  },
};

export const CONTACT = {
  email: 'shynj2@gmail.com',
  telegram: '@shynj2',
  telegramUrl: 'https://t.me/shynj2',
  phone: '0922 951 3128',
  phoneUrl: 'tel:+989229513128',
};

export const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII'];

export const fmt = (n: number, lang: Lang) => new Intl.NumberFormat(lang === 'fa' ? 'fa-IR' : 'en').format(n);

export const monthsBetween = (a: [number, number], b: [number, number]) => (b[0] - a[0]) * 12 + (b[1] - a[1]) + 1;

export const duration = (months: number, lang: Lang) => {
  const t = TEXT[lang];
  const y = Math.floor(months / 12);
  const m = months % 12;
  const parts: string[] = [];
  if (y) parts.push(`${fmt(y, lang)} ${t.yr}`);
  if (m) parts.push(`${fmt(m, lang)} ${t.mo}`);
  return parts.join(lang === 'fa' ? ' و ' : ' ');
};

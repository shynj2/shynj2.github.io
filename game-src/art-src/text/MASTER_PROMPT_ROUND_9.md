# MASTER PROMPT — Veyrath (Rune Architect) · Round 9

You are continuing work on **Veyrath**, a dark-fantasy metroidvania résumé game in the spirit of *Blasphemous* (gothic pixel art, dither, candle-lit palettes, solemn tone). It ships as a single HTML file built from `veyrath/` (`src/js/*`, `art-src/*`, `tools/build.mjs`). The player is a recruiter; the final boss is the author himself (**Shyn**). Beating or understanding him unlocks contact details.

Round 9 is a polish-and-depth round. Do **all** of it. Work in the order below, run the verify/walk/reach tools after each section, and finish with a `REPORT.md` for Round 9 in the same style as the previous rounds.

---

## 0. Ground rules

1. Read first: `REPORT.md`, `art-bible.md`, `art-src/text/GAME_TEXT_REWRITE.md`, `tools/verify.mjs`. Keep every existing check green (currently 68/68, walk 10/10, reach ok). Add new checks for every new system.
2. Text lives in `STR = { en, fa, ar, ru, ja }` (`src/js/61-i18n.js`). **Edit `STR` directly.** Do not re-run `tools/text-import.py`. Every new string needs all five languages; `node tools/strings.mjs` must report nothing missing.
3. Keep: save format (no schema break; add fields only inside `flags`), scoring, contact data, résumé facts, mobile-first controls (portrait, landscape, desktop), embedded-fonts approach, no runtime network calls.
4. **Assets from online sources are allowed** (music, sprites, art, fonts, SFX) — at build time only. Use only CC0 / CC-BY / OFL / public-domain material. Record every external asset (name, author, URL, licence) in `art-src/CREDITS.md` and show a Credits screen in the pause menu. If a source cannot be reached, generate it procedurally rather than leaving a gap. Never ship placeholders such as `????` or `TODO_ART`.
5. Keep the final file size reasonable: compress audio (mono Opus/MP3 at low bitrate for music loops, voice at ~48 kbps), lazy-decode, and report the final size. Warn me if it exceeds ~6 MB.
6. Don't invent résumé facts. For anything about what I build or can do, use the existing content bible (`prompt-game-resume.txt`, `10-content.js`, `STR`). Facts I'm adding this round are in §9.

---

## 1. Text logic & consistency audit (do this first)

I still find lines that don't make sense in context. Do a full pass over every player-facing string in all five languages, reading each in the situation where it appears (zone, speaker, trigger, what the player just did).

- Fix contradictions, wrong speaker, wrong tense, jokes that don't land, repeated lines, lines that reference things not yet seen/unlocked.
- Example of what I mean: the goblin line *"500 points — 500,000 Toman off the Architect's first salary"* — the exchange rate, what "points" are, and what is being discounted must be clear and consistent (and "Architect" is being removed, see §4).
- Fix the screenshots' issues: the placeholder bubble `????` above the player; a stray dash `—` at the end of the Persian line "او سایت‌های وردپرس و المنتور را با HTML و CSS پاک می‌سازد —" (bidi/placement); the transliteration of the title/name in `ویژث · معمار رون` (must be consistent everywhere and correct).
- Produce `art-src/text/AUDIT.md`: a table of every changed string id, the old text, the new text, and why.

## 2. Intro narration — the English voice-over plays in every language

- Currently only English plays the intro voice-over. Change it so the **same English narration plays regardless of the selected language** (`VO.langs` = all five). For fa/ar/ru/ja show that language's own translation as timed subtitles under/over the English audio, synced per sentence to the audio (store per-sentence start/end times). The typewriter must follow the audio, not run ahead of it.
- **New voice:** a woman — calm, composed, quietly mysterious, like a storyteller by firelight. Measured but flowing: **no long dead pauses**, short natural breaths only. Re-record the whole narration with a high-quality neural TTS available to you (offline preferred: e.g. Piper / Kokoro / Coqui; or an online TTS you may use at build time if the licence allows shipping the output). Pick the voice by listening to samples; add light reverb/warmth in post if it helps. Pack with `tools/vo.mjs`.
- Narration is **longer** (see §3): every segment should feel like one continuous told story.

## 3. Longer dialogues + full-screen "life-stage" illustrations

- Rewrite the intro and the main story dialogues (shyn, librarian, recruiter, goblin, ending) to be **noticeably longer and richer** — more atmosphere, more of the story of how he became who he is — while staying coherent and not repeating itself. Keep each box readable on mobile (split long dialogue into more boxes, don't shrink the font).
- **Every few dialogue boxes (every ~3–4), show a full-screen illustration** of **me at a different stage of my life**, painted in the game's visual language (Blasphemous mood: dark, dithered pixel art, candle/ember light, limited palette from `art-src/palette.json`). Suggested sequence: a child with a first computer → a teenager learning to code at night → a young man in a dojo (iaido/hapkido practice, see §9) → a freelancer building sites for clients → a builder working with AI → the figure at the threshold of the final chamber. Each has a short caption. Fade in/out, slow parallax or ember particles so they don't feel static, skippable, and reusable in the Codex as a "Memories" gallery once seen.
- I will not supply photos. Make them as original pixel/dither illustrations (generate procedurally or via a tool you have; keep a consistent likeness: the same silhouette as the in-game Shyn sprite — dark navy suit/coat, satchel).

## 4. Remove the word "Architect" — use my real name, censored until the boss is beaten

- Remove "Architect" / «معمار» / «معمار رون» / «Rune Architect» (as a title for me) from **all** player-facing text in all languages (HUD, codex, achievements, goblin, notice board, ending, intro, page title). Replace with my name or a neutral wording that still makes sense. (The game title may stay **Veyrath**; decide the tagline and tell me what you chose.)
- **My name is shown everywhere, but visually scribbled-out / redacted**, as if censored (heavy ink strike-through scribble overlay, redaction bar, or jittery scratched-out glyphs — pick one coherent style and use it everywhere: dialogue, HUD, codex, goblin lines, signs, title screen). Implement it as a reusable component (e.g. `<span class="redacted" data-name>`) so the name is never present as clean readable text in the DOM before the reveal (render the real name only after reveal; before that, use scrambled/decoy characters that match the length visually).
- **Reveal rule:** the clean name appears **only after the boss fight is won** (flag in `flags`). Reveal with a short ceremonial animation (the scribble burns/peels away) at the moment of victory, then the name is clean everywhere, including in already-seen codex entries and the ending.
- During the boss fight and arena, the player (the recruiter) sees *me* — the boss — and my name is still scribbled until I fall. Make that moment feel earned.
- **The name to show is "Shayan"** (Latin) / **«شایان»** (Persian; transliterate sensibly for ar/ru/ja: شايان / Шаян / シャヤン). First name only — never the surname in the game text. Replace the boss label and every place that said "Shyn" / "Architect" as a person's name with it. **"Shyn" stays only as my online handle** where it is already contact data (handle, URLs, e-mail) and is not redacted. Use one spelling per language everywhere.

## 5. Correct Persian (and Arabic) rendering of names and mixed text

- Names, Latin words, numbers and punctuation inside RTL text must render correctly. Use `dir`/`unicode-bidi: isolate` (or `<bdi>`) around names, brand names (HTML, CSS, WordPress, Elementor), numbers, e-mail, handle, and trailing punctuation so dashes, parentheses and "·" separators never jump to the wrong side.
- Use ZWNJ (`‍‌`) correctly in Persian compounds ("می‌سازد", "سایت‌ها"), consistent ezafe handling (decide whether to show the kasra mark ِ or not and apply it consistently — currently some labels show it and others don't), and proper Persian digits/quotes where appropriate.
- The typewriter already reveals whole words for fa/ar; make sure redacted names, weapon names (§8) and speaker labels also shape correctly, with no broken joins.
- Add a test (`tools/strings.mjs` or `verify.mjs`) that scans RTL strings for the common bidi/ZWNJ mistakes and fails on them.

## 6. Budget Goblin — avatar, idle animation, room

- **Avatar/portrait is broken.** Redo the goblin portrait (the dialogue frame icon) so it is clean, readable and on-style (green skin, round glasses, pointy ears, cigar/pipe — keep character), drawn at the portrait resolution used by the other speakers.
- **Idle animation** for the goblin sprite in his room: breathing, blinking, ear twitch, counting coins / tapping the abacus-calculator, occasional glance at the player. 6–10 frames, looping with randomized small variations so it isn't mechanical.
- **Make the room prettier:** richer shelving with props (ledgers, jars, scales, coin stacks, a hanging lantern, a "499" sign gag stays), warmer layered lighting, better floor/wall tiles, floating dust motes in the torch light, subtle torch flicker, depth layers. Keep the "Chamber 499" joke and the exit arch.
- **Remove the platform at the far end of the room** (the right-hand ledge/platform and anything that only existed to reach it). Update the map (`art-src/maps/room499.txt`), collisions, camera bounds and `reach.mjs` so the room still validates.

## 7. Music — a new score, one track per map

- Replace the current score. Target a sound that sits next to *Blasphemous*: slow, liturgical, Spanish-gothic — solo guitar (flamenco/classical, minor phrygian colours), church organ, choir pads, bowed strings, low drones, sparse percussion, tolling bells. No cheerful chiptune.
- **Every map has its own track** that fits its mood, all in the same family so the game still sounds like one world: forest (open, mournful, wind and sparse guitar), workshop (mechanical, slow organ + clockwork percussion), catacombs (dark drone, whispers, distant choir), repository/library (hushed strings, harpsichord-like motifs), cathedral (full organ + choir, grand), Goblin's room 499 (warm, tavern-like but gothic: muted guitar, plucked bass, a hint of comic sneakiness), arena/boss (see §8: multi-phase, builds with the fight), plus a title/intro theme and an ending theme.
- Sources: you may use CC0/CC-BY music from online libraries (e.g. OpenGameArt, Free Music Archive, Incompetech, Pixabay-licensed-for-redistribution where it allows embedding — verify each licence) or compose procedurally in `21-music.js` / `22-boss-violin.js`. Prefer real recorded instruments over synth if licences allow. Loop seamlessly; crossfade between maps (1–2 s); duck under dialogue and the narration; persist volume/mute settings.
- Update `tools/music-preview.mjs` to render a preview of every track for my review and list the tracks + credits in the report.

## 8. Weapons + a stronger, smarter boss (replaces the timed-button fight)

### 8.1 Weapon system
Replace the "press the button at the right time" boss mechanic with a real action-combat system. Add **6 weapons** (the five below plus the mandatory Crusader Sword; more if time allows), each with its own **stats** (damage, speed, reach, stamina cost, poise damage), **playstyle**, **attack set** (light chain, heavy, special, air attack, dodge-attack) and **animations** (wind-up, strike, recovery, hit-spark, trail), selectable by the player (pause/loadout menu, plus a quick-swap button on mobile) and usable against the boss. Suggested set, themed on my background:

| Weapon | Style |
|---|---|
| **Katana (iaido)** | fast draw-cut (nukitsuke), perfect-timing counter-draw, low stamina, medium damage; 3-hit chain ending in a sheath-flourish that crits |
| **Rune Staff** | mid-range, projectile rune bolts, slow, charge-up AoE glyph on the ground |
| **Great Hammer** | slow, huge poise damage, ground shockwave, can stagger the boss |
| **Twin Daggers** | very fast, short reach, bleed stacking, back-step and flurry |
| **Hapkido Gauntlets** | unarmed/joint-lock style: parry-redirect, throw, short combos; rewards perfect parries with big damage (nod to my hapkido) |
| **Crusader Sword (شمشیر صلیبی) — MANDATORY** | a heavy cruciform longsword with a cross-guard; balanced, honest knight's weapon: steady 3-hit slash chain, overhead cleave, a shield-less "guard stance" that blocks and counters, a holy-light special (cross-shaped wave). Must be in the final build, must be obtainable before the final fight, and must look unmistakably like a crusader sword (cross hilt, long straight blade) in the icon, the sprite animations and the loadout menu |

Requirements: each weapon feels distinct; hit-stop, screen shake (reduced by an accessibility toggle), damage numbers or boss health-bar feedback; stamina/poise are readable on small screens; touch buttons for attack/heavy/dodge/parry/swap sized for thumbs in portrait and landscape; keyboard + gamepad mappings. Provide weapon icons (pixel art), names and descriptions in all five languages (see §5 for rendering). Weapons may be found/unlocked through the map (hook into existing chests/rooms) or granted progressively — your call, but at least two must be available before the final fight so the choice matters. Balance in `tools/` with a simple simulation and report DPS/time-to-kill per weapon.

### 8.2 Boss (me) — stronger and smarter
- Rebuild the boss fight as a multi-phase fight (≥3 phases) with **many more attacks**: ground slashes, rune projectiles, summons, teleport-strike, area denial, a grab, phase-transition super-attack, and 2–3 signature attacks tied to my themes (blade draw, code/rune glitches, hapkido throws). Every attack has a clear telegraph (anim + sound + visual cue) and a counter-play window.
- **Smarter AI:** a state machine that reads the player's position/distance, current weapon, recent actions (spam detection: punishes repeated attacks, adapts to dodge habits), health thresholds, and varies patterns so it isn't a fixed loop. Include aggression/patience variation. It must still be fair and beatable on mobile.
- Boss visuals/sprites: new animation set for the added attacks using the existing rig in `art-src/rigs/shyn`. Boss music per §7 shifts per phase.

### 8.2b Final phase — "Reality Override" (terminal phase)

When the boss reaches his last health threshold (final phase, after the ordinary phases), trigger this set piece. It is the climax of the game: make it unforgettable.

1. **The line.** The fight freezes. In his own voice (voiced-style text box, all five languages; keep it in character and short): that is enough — I have shown you enough mercy; it is time to show you what I am made of. (Write the exact wording yourself; strong, cold, not cheesy.)
2. **Reality breaks.** The whole screen tears apart: RGB-split glitch, scanline tears, screen-shake, pixel-sorting, tile corruption, the HUD and dialogue frame fragmenting, falling/shattering code glyphs (real-looking snippets of HTML/CSS/JS/rune-script, not lorem ipsum), brief inverted frames, audio bit-crush and a rising riser. The world looks like it is being edited live. Respect an accessibility toggle ("reduce flashing/shake") that replaces strobing with calm fades — default to safe intensity on mobile, and never exceed 3 flashes per second.
3. **The arena becomes a terminal.** The pixel world is replaced by a dark terminal view (monospace font embedded, green/violet phosphor matching the palette, CRT curvature/scanline optional): a prompt like `shayan@veyrath:~$`, a scrolling log, a command line that types by itself. The player character and the boss remain as sprites inside this terminal space (or ASCII/pixel overlays) so combat still plays on the same arena logic.
4. **Every boss attack is "written" as code.** Before each attack, the terminal visibly types a short command/function (e.g. `spawn(blade, target=player.x)`, `gravity.invert(2.0)`, `for (rune of sky) rune.fall()`, `walls.close_in()`), the lines highlight, then **execute** and the attack manifests in the world. The code must be real, short, readable, and **actually drive the attack**: build these attacks as small data-driven scripts (an attack DSL / table in the game code) where the displayed text is generated from the same data that spawns the projectiles/hazards, so the shown code and the effect never disagree. Write ≥10 distinct code attacks (e.g. variable gravity, mirrored controls for 2 s only if telegraphed and fair, falling rune rain, blade lattice, teleport-strike via `player.position`, a "delete" beam that erases floor tiles, `while(true)` loop that repeats a pattern, a fake "error" popup you must dodge, a `sudo` super-attack that is the phase's finisher).
5. **It reacts to the real player.** The code reads the live player state and the generated attack depends on it: position, facing, current weapon, health, last dodge direction, how long they have been standing still, button-mashing, recent damage taken. The log shows it reading these values (`> player.hp = 37 … adapting`). Mix in a few "sees you" lines (`> weapon: katana — countering`). Keep it fair: every generated attack still has a telegraph and a window.
6. **Epic music.** A dedicated final-phase track: the most epic piece in the game — massive choir, pounding organ and percussion, a driving gothic-metal/orchestral build with electronic glitch elements, layered on the boss theme (the same family, a climax rather than a new genre). Transition with the glitch riser; the track reacts (extra layer or intensity) as boss health drops. Seamless loop until the end.
7. **Defeat → restoration.** On the final blow: freeze-frame, the code `crash`es (error text, stack trace, one last line from the boss), the terminal collapses, then reality **rewinds to normal**: glitches reverse and heal, HUD reassembles, the pixel world and normal palette return, the music resolves to a quiet motif — and then the name reveal ceremony of §4 plays (Shayan becomes clean). If the player is defeated during this phase, a short "kernel panic"-style death screen, then a normal respawn; the mercy counter (§8.3) still counts it.
8. Performance: must hold ~60 fps on a mid-range phone; use canvas/shader-free CSS or lightweight canvas effects, pool particles, cap glitch layers, and provide a low-quality fallback. Add tests that the phase triggers once, the displayed code matches the spawned attack data, the accessibility mode works, and the world is fully restored after victory.

### 8.3 Mercy rule
- Old rule: mercy after **2** defeats. **New rule: after 10 defeats**, offer mercy. Mercy options: reduce boss damage/health, show extra telegraph hints, or let the player skip into the "understanding" ending path (keep whichever path the design bible has, and be clear in dialogue what mercy means). Count defeats in `flags` (no schema break); reset appropriately after a win. Keep the offer non-patronizing and in-world (a line in the boss's own voice).
- Keep both ending paths (beating me vs understanding me) working with the name reveal (§4).

## 8.5 Secret: the Knights of the Lord (special names)

When the visitor types one of these names on the name-entry screen, the game silently switches to a special "knight" route:

- Names: **`sir.matw`**, **`vahid`**, **`resync`**. Match case-insensitively, trimmed, ignoring surrounding spaces; accept `sir.matw` also as `sir matw` / `sir_matw`. Keep the list in one array in the code so I can add names later. Do not reveal the list anywhere in the UI or text (it is an Easter egg); save the flag (`flags.knight = true`, no schema break) and keep it across reloads.
- **The player automatically becomes a knight:** new player sprite set (armor, helm or open-face helm, cape, a crusader-sword idle/run/attack/hurt set matching the pixel style), knight portrait in dialogues, and the **Crusader Sword equipped by default** (and unlocked from the start). Make the knight look clearly different from the normal recruiter in all zones and in the life-stage/ending screens where the player appears.
- **A special dialogue** right after the name is entered (and optionally echoed once in the first zone): a herald-like line telling them that **the Lord is waiting for you** («ارباب منتظر شماست»). Write it in all five languages, in a formal, slightly ominous tone, with the visitor's name shown correctly (see §5; Latin names inside RTL text must be bidi-isolated). Short and memorable.
- **Arena entrance for knights:** when they enter the arena, the boss (me) **welcomes them by name** and says that it's time to defeat them **one last time** («وقتشه برای بار آخر شکستت بدم»). Write it as a unique boss entrance dialogue (all five languages) that replaces the normal arena opening only for knights; the fight itself then plays normally (including phases, §8.2b and mercy §8.3). Tone: warm-cold, an old rival greeting someone he has beaten before — not insulting.
- Add tests: each of the three names triggers the route (and variants of case/spacing); a random name doesn't; the knight flag persists; the knight dialogue and arena welcome appear exactly once; the normal route is unchanged.

## 9. Facts about me to use in the résumé content (do not invent beyond these)

- I hold **1st dan in iaido** and **2nd dan in hapkido**. Use this in the life-stage illustrations (§3), the katana and gauntlet weapons (§8), the boss's moves, the codex and the ending. Phrase it modestly and accurately (ranks as stated; no claims about titles, tournaments or instructor status).
- I build things with AI and can build: complete websites (including converting WordPress/Elementor sites to clean HTML/CSS), mobile apps, games, themes/plugins, interactive and animated front-ends, multilingual RTL/LTR interfaces, and creative experiments. Pull concrete examples from the existing content bible; don't add clients, numbers or technologies that aren't there.

## 10. Deliverables & verification

1. Updated source in `veyrath/` and rebuilt single-file HTML (`rune-architect.html` or the current output name).
2. New/updated checks in `tools/verify.mjs` for: voice plays in all languages and subtitles sync; no "Architect/معمار" strings remain; name never in DOM as plain text before reveal and appears after win; weapon select/attack/animation for each weapon; boss phases and mercy at exactly 10 defeats; goblin idle animation running and platform removed; every map has a distinct music track; RTL string lint passes.
3. Screenshots for review in `review/r9/`: each life-stage illustration, redacted-name examples (before/after reveal), the goblin room + portrait, each weapon mid-attack, each boss phase, in portrait 390×844, landscape 844×390 and desktop 1280×720.
4. `REPORT.md` (Round 9): what changed, what I should listen to/look at, file size, credits, anything you chose differently from this brief and why, and anything you could not finish — be explicit, no silent omissions.

Priorities if you run out of budget (in this order): §1 → §4 → §5 → §2 → §6 → §8 → §3 → §7. Do not leave the game in a broken state at any checkpoint.

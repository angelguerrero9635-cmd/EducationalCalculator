# Brand pictures: the One Dollar University logo, icons and illustrations

Paste everything below the line into the pictures chat.

---

You are working in the EducationalCalculator repository on your pictures branch
(`claude/edu-calc-assets-questions-379toc`). First merge `claude/ios-education-wireframe-313z7z`
into it.

## What changed

The app and website are now **One Dollar University**, with the slogan **"Education For Everyone"**
(`src/config/site.ts`). The logo is a **$U** mark shown in the middle of the phone header.
`src/components/Logo.tsx` is a placeholder today (a "$U" in system text on an indigo box).
Prices are $1 a month for Kindergarten to Grade 12 and $1 a month for each college course.

The lesson chat is redesigning everything outside the lessons from
`docs/plans/site-upgrade.md`. Read these parts of it before you start:

- section 2, "Design direction" (the palette tokens, including the new `gold`, and "Brand across
  the app");
- section 5, "Images needed": the table B1–B24 is your job list, with each item's sizes,
  formats, light and dark variants and what it shows.

The illustration style is `assets/images/STYLE.md`, limited to the brand set: indigo `#4F46E5`,
lavender `#EEF0FF`, gold `#F5B82E`, ink, paper and light grey, plus one tone colour per drawing.
Draw objects, not people, and put no words inside the drawings.

## Order of work

1. **The mark first (B1), as a choice for the owner.** Draw three different concepts of the $U
   mark. For example:
   - the $'s vertical stroke forms the U's left stem;
   - the $ sits inside the U;
   - a geometric monogram.

   Show each concept at 16, 29, 64 and 256 px, light and dark, on one contact sheet
   (`assets/brand/concepts.png`). Write a one-line rationale for each, then **stop and ask the
   owner to pick one**. Everything after this builds on the chosen mark.

2. **Round 1, the identity (B1–B8):**
   - the chosen mark with its mono version;
   - the wordmark, with the text outlined as paths so it needs no font;
   - the horizontal and stacked lockups, the stacked one with the slogan;
   - the app icon, including the iOS dark and tinted variants and the Android adaptive layers;
   - the favicon set;
   - the touch and PWA icons;
   - the splash, light and dark.

   Then redraw `src/components/Logo.tsx` from the chosen mark's SVG paths (plan item D1: props
   `size` and `variant: 'mark' | 'lockup' | 'stacked'`, colours from palette tokens only). Every
   header updates by itself.

3. **Round 2, link previews (B9–B11):** the three Open Graph images, 1200 × 630 PNG, under
   300 KB each.
4. **Round 3, illustrations (B12–B22 and B24):** each one as a react-native-svg component in
   `src/components/art/<Name>.tsx`, one file each, with colours from `usePalette()` so one
   drawing serves light and dark (plan item D5). Keep the source SVG beside the PNG renders in
   `assets/brand/art/`.
5. **B23 (App Store screenshot frames): leave it for last.** It needs the finished screens; the
   lesson chat will tell you when they are ready.

## Where the files go

- **Mark, wordmark and lockup SVGs and their PNG renders:** `assets/brand/`.
- **App icon and splash PNGs:** `assets/brand/` too. The lesson chat points `app.json` at them
  (plan item D2).
- **Web icons:**
  - `public/favicon.svg`, with an internal `prefers-color-scheme` style;
  - `public/favicon.ico`, holding 16, 32 and 48 px PNGs;
  - `public/apple-touch-icon.png`;
  - `public/icon-192.png`, `icon-512.png` and `icon-maskable-512.png`.
- **Open Graph images:** `public/og/default.png`, `k12.png` and `college.png`.
- **A status list in `assets/brand/README.md`:** each B id, its files and its status (drawn or
  placed).

## Hard rules

- **Original work only.** Look at references online if you like, but never copy, trace or embed
  another logo, icon or image. Don't make it look like a real university's crest, a currency
  note or a coin design. Don't use another brand's colours as its signature.
- **Image files are allowed for brand assets only**, unlike lesson pictures. The App Store and
  browsers need PNG, ICO and SVG files. Render them from your own SVGs with the container's
  Chromium through Playwright (`NODE_PATH=$(npm root -g)`, Chromium at
  `/opt/pw-browsers/chromium`), as `scripts/render-illustrations.mjs` does. You may write the
  ICO container with a small script. **Don't add dependencies** without asking.
- **In-app components use palette tokens, never hex.** `src/components/__tests__/colors.test.ts`
  fails on a hex or rgb literal in a component. Use the plan's token names (`accent`,
  `accentSoft`, `gold`, `onGold`, `text`, `card`…). If a token you need isn't in `src/theme.ts`
  yet, add it there in both light and dark with the plan's values; the lesson chat is adding the
  same tokens, so keep their names.
- **Exported files have no metadata** naming people or tools, and no links outside the file.
- **Legibility:**
  - the mark must read at 16 px (the favicon) and 29 px (the smallest iOS icon);
  - the app icon has no transparency and no rounded corners, because iOS masks it;
  - nothing important sits outside the central 80 % of the maskable icon.

## Checks (essentials only)

- `npx tsc --noEmit -p .` and eslint on the files you changed.
- `npx jest src/components` (this includes the colours test).
- Screenshots at 390 and 1440 px of Home and a lesson page with your new `Logo` (build the site
  with `pnpm build:web`, then use the shot script in `scripts/`).
- Before a push, `node scripts/ci-test.mjs` (the cheap suites). No heavy runs.
- Don't edit the screens (`src/app/**`), `app.json`, `+html.tsx` or `PageMeta`. The lesson chat
  places your files.

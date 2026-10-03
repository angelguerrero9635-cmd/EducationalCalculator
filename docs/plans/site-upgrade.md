# Site and app upgrade: shell, brand, desktop web and payments

Plan for everything outside the lesson modules (2026-10-02). The module content, pictures and
calculators (`src/components/module/**`, `src/data/modules/**`) are out of scope, except the
chrome around a lesson: header, title block, breadcrumbs, what sits above and below
`ModuleSections`.

Evidence: screenshots of the current `dist/` build in `.review/site/` (390, 1024 and 1440 px,
light and dark; script `.review/site/shoot.mjs`, `shoot2.mjs`). File names below are relative to
`.review/site/`.

Sizes: **S** under half a day, **M** one to two days, **L** three days or more.

---

## 1. Findings

Overall: the app is clean and consistent, but it reads as a well-made prototype. Five things
make it look amateur next to Khan Academy, Duolingo, Brilliant, Desmos or Apple's own apps:

1. **No brand.** The logo is an indigo rounded box with "$U" in bold system text; the app icon,
   splash and favicon are Expo's default placeholder (`assets/icon.png` is the blue "A" on a
   construction grid). An App Store reviewer sees a template.
2. **The phone layout is stretched to desktop.** At 1024 and 1440 px everything runs edge to
   edge: one hero 1400 px wide, an input row whose label and box sit 1,300 px apart, a tab bar
   with four items spread across the screen, and stacked pages that lose all navigation but a
   back link.
3. **Pages without a title.** Grade, division and Higher Ed pages have no heading; their name
   is a 12 px grey caption under the logo.
4. **Default web details.** The browser's black focus rectangle, underlined "Skip" and "Not now"
   links, no Open Graph image, no `theme-color`, no canonical link, no apple-touch-icon.
5. **Unfinished plans page.** A disabled Continue button, prices written inside list-row titles,
   a stray hairline, no list of what you get, and "Purchases are not open yet".

### Shell (header, tabs, menu)

| #   | What                                                                                                                                                                                                    | Screenshot                               |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------- |
| F1  | Two different headers: tab pages use React Navigation's header (no left item, logo floats), stacked pages use `NavBar` (back link, logo with a 12 px caption). They differ in height, border and title. | `home-390.png`, `grade-390.png`          |
| F2  | The back label is truncated to the page's own title ("‹ Add and subt…") and the chevron is a text glyph "‹" (30 px font) that sits off the baseline.                                                    | `skill-390.png`                          |
| F3  | Header actions repeat the tab bar (Home and Search are both tabs) on tab pages; the menu duplicates Browse.                                                                                             | `home-390.png`, `browse-1440.png`        |
| F4  | Tab bar: 11 px labels, 60 px tall on web, and at 1024+ px the four items spread across the whole width with the icon beside the label.                                                                  | `home-1440.png`, `focus-1024.png`        |
| F5  | Stacked pages (grade, skill, course) have no tab bar and no global nav at any width; at 1440 the only way around is the back link or the hamburger.                                                     | `skill-1440.png`, `division-1440.png`    |
| F6  | Side menu: three indent levels of plain text, no icons or separators, headings in 12 px grey; the open group's highlight is a faint grey band. A long scroll with no search.                            | `menu-390.png`, `menu-1440.png`          |
| F7  | Keyboard focus is the browser's default black ring with square corners on rounded cards, and the search field shows a black rectangle inside the pill.                                                  | `focus-1024.png`, `search-typed-390.png` |

### Screens

| #   | Screen        | What                                                                                                                                                                                                                | Screenshot                                                     |
| --- | ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| F8  | Home          | The hero is a 2019-style purple diagonal gradient with an uppercase kicker that repeats the name already in the header. "Education For Everyone" wraps after "For" at 390 px.                                       | `home-390.png`, `home-390-dark.png`                            |
| F9  | Home          | A first-time visitor sees two empty cards stacked ("No courses picked yet", "Nothing viewed yet"): half the first screen is empty states. Nothing shows what the product is (a lesson, a picture).                  | `home-390.png`                                                 |
| F10 | Home 1440     | Hero, search field and empty cards span 1,408 px; the empty-state text is 13 px centered in a 1,400 px card.                                                                                                        | `home-1440.png`                                                |
| F11 | Browse        | Good grid, but at 1440 the eight-column grid leaves a ragged last row and a dead right half for College. Section header "School · Kindergarten to Grade 12" mixes a label and a range.                              | `browse-1440.png`                                              |
| F12 | Grade         | No page title; tiles align the title to the bottom (`justifyContent: 'space-between'`), so one-line titles float halfway down and rows look uneven.                                                                 | `grade-390.png`, `course-390.png`                              |
| F13 | Strand        | Each skill is a box of white rows inside a grey box: a card in a card, with the "Use this for …" quotes in 13 px grey. Dense and hard to scan.                                                                      | `strand-390.png`                                               |
| F14 | Division, HE  | No title, no description, five small tiles top-left of an empty 1440 page.                                                                                                                                          | `division-1440.png`, `he-1440.png`                             |
| F15 | Course        | "Division: Science" plus a lone "Chemistry" chip; prerequisite chips and topic tiles use three different card shapes on one screen.                                                                                 | `course-390.png`                                               |
| F16 | Topic         | Four grey "Coming soon" slabs fill the page: unfinished content shown as the main event.                                                                                                                            | `topic-1024.png`                                               |
| F17 | Skill chrome  | Title block is plain: 22 px title, two grey lines "Grade 5 · Math" and "Strand: Fractions". No breadcrumb, no lesson-type marker, nothing above the first picture. At 1440 the module spans 1,408 px.               | `skill-390.png`, `skill-1440.png`, `skill-1440-dark.png`       |
| F18 | Search        | When a typed problem matches lessons but no words match, an empty white card is drawn under the results. Overlines in 11 px uppercase indigo run to three lines.                                                    | `search-typed-390.png`                                         |
| F19 | Settings      | Reads like a developer page: a "Version" row, a "[Disclaimer placeholder]" note, word-statistics credits in body text, "Clear recently viewed" styled as a navigation row.                                          | `settings-390.png`, `settings-390-dark.png`                    |
| F20 | Onboarding    | No welcome, no brand, no picture: the first screen of the app is a 48-chip form under an underlined "Skip". At 1440 the chips run in one 1,400 px line and Continue is 1,408 px wide.                               | `onboarding-390.png`, `onboarding-1440.png`                    |
| F21 | Plans         | Logo and slogan repeated in the header and the body; prices inside row titles; a hairline that doesn't line up with the cards; disabled primary button; no restore, terms or privacy links (all required by Apple). | `plans-390.png`, `plans-1440.png`                              |
| F22 | Not found     | One bold line and a pale button at the top of a blank page. An unknown skill URL (`/skill/m.5.volume`) shows "Skill not found" with the raw id and throws React hydration error #418.                               | `notfound-390.png`, `skill` probe in `.review/site/probe2.mjs` |
| F23 | Gallery index | A developer list (`kind` names as subtitles); fine to keep, but it is linked from nowhere and is in the sitemap exclusion only by path.                                                                             | `gallery-390.png`                                              |

### Web platform and assets

- F24. `<head>`: title, description, `og:title`, `og:description`, `og:site_name` only. Missing
  `og:image`, `og:url`, `og:type`, `twitter:card`, `<link rel="canonical">`, `theme-color`
  (light and dark), `apple-touch-icon`, a web manifest, and an SVG favicon. `favicon.ico` is
  built from a 48 px placeholder PNG.
- F25. `SITE_URL` is `educational-calculator.vercel.app` and is duplicated in
  `scripts/postexport.mjs`; `app.json` still has slug `educational-calculator`, scheme
  `educationalcalculator`, no `ios.bundleIdentifier`, no splash config, an Android adaptive icon
  on `#E6E6E6`.
- F26. No `src/app/+html.tsx`: no place for global CSS (focus ring, media queries, font face,
  `prefers-reduced-motion`).

### Quality

- F27. Contrast passes for body text (`textMuted` `#636A7A` on `#F5F6FA` is 5.2:1), but 11 px
  tab labels and 11 px overlines are below a comfortable reading size; disabled Continue is
  white on `#B3AEF2` (2.0:1).
- F28. Tap targets: header icons are 40 × 44 (under 44 pt wide); "Edit" on Home is a text link.
- F29. Motion: none beyond opacity on press (0.5 opacity looks like a flicker) and a fade for the
  menu; no reduced-motion handling because nothing moves yet.
- F30. Loading: none needed for local data; the gap is the web hydration moment (dark-mode users
  see a light page flash, since pre-rendered pages are light).

---

## 2. Design direction

### Principles

- **Calm shell, lively lessons.** The pictures in lessons carry the colour and play. The shell
  is quiet, typographic and confident, so it suits a kindergartner's parent and an engineering
  student alike. No mascots, no confetti, no cartoon type.
- **One component per job.** One header, one card, one list row, one page container. Every
  screen is built from them.
- **The brand is the dollar and the U.** Indigo stays the brand colour (it is already in every
  picture as `chartHighlight`); a warm gold joins it as the "dollar" accent, used sparingly.

### Palette

Keep the indigo; refine the neutrals; add gold and status colours. Only the shell tokens below
change. The chart and material tokens in `src/theme.ts` stay as they are (lesson pictures are
out of scope). Contrast ratios are against `background`.

| Token          | Light     | Dark      | Use                                                     |
| -------------- | --------- | --------- | ------------------------------------------------------- |
| `background`   | `#F7F7FB` | `#0B0C10` | Page                                                    |
| `surface`      | `#EEEFF5` | `#1A1C23` | Inputs, segmented tracks, pressed rows                  |
| `card`         | `#FFFFFF` | `#14161C` | Cards, sheets, sidebar                                  |
| `cardRaised`   | `#FFFFFF` | `#1C1F27` | Menus, popovers, the plans card                         |
| `border`       | `#E3E5EE` | `#262A34` | Hairlines, card outlines                                |
| `borderStrong` | `#C9CDD9` | `#3A3F4C` | Inputs, focusable outlines                              |
| `text`         | `#12131A` | `#ECEEF4` | Body and headings (17:1 / 16:1)                         |
| `textMuted`    | `#5B6172` | `#A0A6B5` | Secondary text (6.0:1 / 7.6:1)                          |
| `accent`       | `#4F46E5` | `#8B83FF` | Primary buttons, links, selection (unchanged)           |
| `accentHover`  | `#4338CA` | `#A39DFF` | Hover (web) and pressed                                 |
| `accentSoft`   | `#EEF0FF` | `#22214A` | Selected rows, soft buttons, the hero panel             |
| `onAccent`     | `#FFFFFF` | `#0B0C10` | Text on accent                                          |
| `gold`         | `#F5B82E` | `#E9B949` | The "$" in the mark, plan badges, the K–12 plan ribbon  |
| `onGold`       | `#1F1600` | `#1F1600` | Text on gold (never gold text on white: 1.9:1)          |
| `success`      | `#15803D` | `#4ADE80` | Purchase confirmed, "Active" badge                      |
| `warning`      | `#B45309` | `#FBBF24` | Pending (Ask to Buy), renewal problem                   |
| `danger`       | `#B91C1C` | `#F87171` | Errors                                                  |
| `focus`        | `#4F46E5` | `#A39DFF` | 2 px focus ring, 2 px offset                            |
| `disabledBg`   | `#E3E5EE` | `#262A34` | Disabled buttons (with `textMuted`, not a faded accent) |

Remove `heroFrom`, `heroTo` and `onHero` once Home no longer uses the gradient. The seven
`tones` stay (they colour grade and subject badges).

### Type

- **Font.** iOS: keep the system font (SF Pro); it is what Apple's apps use and costs nothing.
  Web: self-host **Inter** (SIL OFL) as one variable WOFF2, Latin subset (about 70 KB), from
  `public/fonts/`, preloaded in `+html.tsx` with `font-display: swap`. No network font service;
  no new dependency (the file is committed). Do not bundle a font in the iOS app: the gain over
  SF is nil and it adds about 300 KB and `expo-font`. Chart text keeps `font.webSystem` (Inter is
  wider; changing chart text would move lesson labels).
- Split the token: `font.ui` (Inter on web, system on iOS) for the shell; `font.family` stays
  for charts and modules.
- **Scale** (size / line height, weight). Replace the five sizes with named steps:

| Token      | Phone   | Wide (≥ 1024 web) | Weight | Use                                                            |
| ---------- | ------- | ----------------- | ------ | -------------------------------------------------------------- |
| `display`  | 34 / 40 | 44 / 50           | 800    | Home and onboarding headline                                   |
| `title1`   | 28 / 34 | 32 / 38           | 700    | Page titles (grade, course, skill)                             |
| `title2`   | 22 / 28 | 24 / 30           | 700    | Section headers                                                |
| `title3`   | 18 / 24 | 18 / 24           | 600    | Card titles                                                    |
| `body`     | 16 / 24 | 16 / 24           | 400    | Body                                                           |
| `callout`  | 15 / 21 | 15 / 21           | 400    | Row subtitles, notes                                           |
| `footnote` | 13 / 18 | 13 / 18           | 500    | Meta lines, tab labels (min 12)                                |
| `overline` | 12 / 16 | 12 / 16           | 600    | Small labels, sentence case, +0.2 letter spacing (no all caps) |

Headings use −0.4 letter spacing at `display` and `title1`. Keep `font.caption/body/title/
headline/display` as aliases until every shell file is moved, then delete them.

### Spacing, radius, elevation

- Spacing stays on the 4-point scale; add `space.xxxl = 48` and `space.huge = 64` for desktop
  section gaps. Page gutter: 16 phone, 24 tablet, 32 wide.
- Radius: `sm 8` (chips' inner parts, inputs), `md 12` (buttons, list rows), `lg 16` (cards,
  down from 18), `xl 24` (hero, sheets), `pill`.
- Elevation, three levels, in `src/theme.ts` as `elevation(level)`:
  - `e1` cards: light `0 1px 2px rgba(16,24,40,.05)` plus a 1 px `border`; dark: border only.
  - `e2` hover and raised: light `0 4px 16px rgba(16,24,40,.08)`; dark `cardRaised` and border.
  - `e3` menus and sheets: light `0 12px 32px rgba(16,24,40,.16)`; dark `0 12px 32px rgba(0,0,0,.5)`.
- Cards in cards are not allowed: a group of rows is one card with inset dividers.

### Iconography

Keep the in-house line icons (`src/components/Icon.tsx`, 24 grid). Standardise stroke at 1.75,
round caps, `filled` for the active tab. Add: `chevronLeft`, `arrowRight`, `lock`, `checkCircle`,
`restore`, `mail`, `shield`, `doc`, `info`, `external`, `sun`, `moon`, `ruler`, `sparkle`,
`grid`, `college`. No icon library.

### Motion

- Durations: 120 ms (press), 200 ms (fade, colour), 280 ms (menu, sheet). Easing
  `cubic-bezier(0.2, 0, 0, 1)` in, `cubic-bezier(0.3, 0, 1, 1)` out. Tokens `motion.*` in theme.
- Press: cards scale to 0.98 and darken 4 %, instead of 50 % opacity. Rows: `surface` background.
- Side menu slides from the right (280 ms); tab change has no animation; stack pushes use the
  native transition on iOS and none on web.
- Purchase success: one 400 ms check-circle draw; nothing else celebrates.
- Reduced motion: read `AccessibilityInfo.isReduceMotionEnabled()` (native) and
  `prefers-reduced-motion` (web CSS); then every transition is an instant cross-fade. Built
  with React Native's `Animated`; no Reanimated.

### Brand across the app

- Header centre (phone): the $U mark, 28 px; on stacked pages the page name is not under it
  (the page has its own title, F3).
- Sidebar top (wide web): the horizontal lockup (mark + "One Dollar University").
- Home: the slogan as the headline, the mark nowhere else on the screen.
- Onboarding welcome, splash and plans page: the stacked lockup with the slogan.
- Web footer: the wordmark, the slogan, and the legal links.
- Gold appears only in the mark's "$", the plan ribbon and the "Active" plan badge.

---

## 3. Screen-by-screen changes

New shared parts go in `src/components/` (the shell parts in `src/components/shell/`). Each
phase ships on its own.

### Phase A: foundations (no visible redesign yet)

| #   | Item                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | Files                                                       | Size |
| --- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------- | ---- |
| A1  | New tokens (palette above, `type`, `elevation`, `motion`, `layout` breakpoints `compact < 600`, `medium 600–1023`, `wide ≥ 1024`, `xl ≥ 1440`), aliases for old names.                                                                                                                                                                                                                                                                                                                 | `src/theme.ts`                                              | M    |
| A2  | `+html.tsx`: `lang="en"`, `theme-color` light `#F7F7FB` and dark `#0B0C10` with `media`, Inter preload and `@font-face`, global CSS: `:focus-visible` ring (2 px `focus`, 2 px offset, radius inherit), `outline: none` on the search input with the ring on its pill, the `data-shell` media rules (A4), `prefers-reduced-motion`, `color-scheme: light dark`. A tiny inline script that sets `data-theme` from the saved appearance before paint (removes the dark-mode flash, F30). | `src/app/+html.tsx` (new), `public/fonts/Inter.var.woff2`   | M    |
| A3  | `PageMeta` v2: `og:image` (per section, B9–B11), `og:url`, `og:type`, `twitter:card=summary_large_image`, `canonical`, `robots noindex` option (onboarding, paywall, gallery). `SITE_URL` read from `src/config/site.ts` in `postexport.mjs` (one source).                                                                                                                                                                                                                             | `src/components/PageMeta.tsx`, `scripts/postexport.mjs`     | S    |
| A4  | `useLayout()` hook: native uses `useWindowDimensions`; web returns `compact` until hydrated and lets CSS do the rest. Responsive show/hide on web through `dataSet={{ shell: 'wide' }}` / `'narrow'` and media rules in `+html.tsx`, so pre-rendered pages are right before hydration (no hydration mismatch).                                                                                                                                                                         | `src/theme/layout.ts` (new)                                 | S    |
| A5  | `Page` container: centres content with `maxWidth` by kind: `grid` 1120, `read` 760 (lessons, settings, legal), `narrow` 560 (onboarding, plans). Every screen's `ScrollView` wraps its content in it.                                                                                                                                                                                                                                                                                  | `src/components/Page.tsx` (new), every screen               | M    |
| A6  | Component pass on tokens: `Button` (heights 48/40, `disabledBg`, hover on web, press scale), `Card` (e1, press scale, hover e2), `ListRow` (one card with inset dividers; no card-in-card), `Chip` (40 px min height, 44 px hit), `SegmentedControl`, `SectionHeader` (`title2`, optional action on the right: replaces Home's "Edit" link), `EmptyState` (illustration slot, `title3`, centred max 360 px).                                                                           | `src/components/*.tsx`                                      | M    |
| A7  | Icons added (section 2), stroke 1.75; the text "‹" chevron replaced by `chevronLeft`.                                                                                                                                                                                                                                                                                                                                                                                                  | `src/components/Icon.tsx`                                   | S    |
| A8  | Fix unknown ids: `skill/[id]`, `course/[id]`, `grade/[grade]` render the shared not-found screen (no raw id) and set `noindex`; fixes hydration #418 on `/skill/<unknown>`.                                                                                                                                                                                                                                                                                                            | `src/app/skill/[id].tsx`, `course/[id]/*`, `+not-found.tsx` | S    |

### Phase B: the shell

| #   | Item                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        | Files                                                                             | Size |
| --- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- | ---- |
| S1  | **One header** for tabs and stack. `NavBar` becomes the header of the tab navigator too (`header: (p) => <NavBar {...p} />`). Phone: left = back (icon + parent name, max 14 characters, never the page's own title) or nothing on a tab root; centre = mark; right = Search (hidden on Search) and Menu. Drop the Home button from the header (the tab bar has it; on stacked pages the back chain and the mark lead home). Mark taps go to Home. 56 px tall, hairline border only after scrolling (web: always).                                                          | `NavBar.tsx`, `HeaderActions.tsx`, `(tabs)/_layout.tsx`, `_layout.tsx`            | M    |
| S2  | **Desktop shell (wide ≥ 1024, web and iPad landscape).** `AppFrame` wraps the root `Stack`: a fixed **sidebar** (248 px, `card` background, right hairline) with the lockup, nav (Home, Browse, Search, Settings, Plans), "My courses" (the picked levels, up to 8, then "Edit"), and at the bottom Privacy, Terms, Support; and a **top bar** (64 px) over the content with breadcrumbs left and a 360 px search field right (Enter opens `/search?q=`). The tab bar and the phone header hide (CSS `data-shell`). Content scrolls in its own column; `Page` widths apply. | `src/components/shell/AppFrame.tsx`, `Sidebar.tsx`, `TopBar.tsx` (new)            | L    |
| S3  | **Tablet (medium).** Keep the bottom tabs; header as phone; content in `Page` (gutter 24). Tab bar labels below icons, 12 px, 64 px bar, max 560 px of items centred.                                                                                                                                                                                                                                                                                                                                                                                                       | `(tabs)/_layout.tsx` (custom `tabBar` wrapper with `dataSet`)                     | S    |
| S4  | **Breadcrumbs** from `parentOf()` chained: "Browse › Grade 5 › Fractions › Add and subtract…". Wide: in the top bar. Phone: a one-line `footnote` row above the page title on skill, topic, course, strand pages (horizontally scrollable, last item not a link).                                                                                                                                                                                                                                                                                                           | `src/components/shell/Breadcrumbs.tsx` (new), `src/data/selectors.ts` (`trailOf`) | M    |
| S5  | **Side menu** (phone and tablet): a filter field at the top ("Find a lesson"), groups as rows with a tone badge (the grade's), lessons one indent level with a 2 px left rule for the open group, current page in `accentSoft` with `accent` text, slide-in from the right, `e3`, scrim `scrim`. Escape and scrim close it; focus moves into the panel and back to the menu button on close (web). On wide screens the menu button is hidden (the sidebar replaces it).                                                                                                     | `SideMenu.tsx`                                                                    | M    |
| S6  | **Footer** (web, all widths, below every page's content): wordmark, slogan, links (Plans, Privacy, Terms, Children's privacy, Support), "© 2026 One Dollar University". Not on iOS (Settings carries those links).                                                                                                                                                                                                                                                                                                                                                          | `src/components/shell/Footer.tsx` (new)                                           | S    |
| S7  | Tab bar polish (phone): 12 px `footnote` labels, 2 px indicator above the active icon in `accent`, `card` background with top hairline, 49 pt plus safe area on iOS.                                                                                                                                                                                                                                                                                                                                                                                                        | `(tabs)/_layout.tsx`                                                              | S    |

### Phase C: screens

Order inside the phase: Home, onboarding, plans (UI only), grade/division/course titles, skill
chrome, search, settings, the rest.

| #   | Screen                      | Changes                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       | Components                                                | Size |
| --- | --------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------- | ---- |
| C1  | Home                        | Hero becomes a flat `accentSoft` panel (no gradient, no uppercase kicker): `display` slogan, one `body` line ("318 skills and 103 courses, from Kindergarten to university."), the search field, and illustration B12 on the right (wide) or above the text, 120 px tall (phone). Then **Continue** (the last viewed lesson as a large card, only when there is one), **My courses** (tiles, action "Edit" in the section header), **Explore** (two large cards: "Kindergarten to Grade 12" and "College", each with B13/B14 art) shown when no courses are picked, instead of the two empty cards. **Recently viewed** shows only when not empty. Wide: hero 1120 wide with text column 560. | `index.tsx`, `Tile`, `Card`, `SectionHeader`              | M    |
| C2  | Onboarding                  | Two steps. Step 1 welcome: stacked lockup, B15 illustration, `display` "Education For Everyone", one line "Lessons with pictures you can move, from Kindergarten to university.", primary "Get started", secondary "Skip for now" (a button, not an underlined link). Step 2 picker: "What are you studying?" with two segments ("School" grades as a 4-column grid of square chips K–12; "College" fields as chips with division headers in sentence case), sticky footer with Continue (count) and "Skip". `narrow` page width; at wide the footer button is 360 px, right-aligned.                                                                                                         | `onboarding.tsx`, `LevelPicker.tsx`                       | M    |
| C3  | Plans (UI shell)            | See section 4 for the purchase states. Layout: title "Plans" (not the slogan), a short line "One dollar a month. No ads, ever."; two plan cards side by side (wide) or stacked: **K–12** (gold ribbon "Every grade", price from the store, 3 bullet lines with `checkCircle`: every K–12 math and science lesson; pictures you can move; worked steps) and **College course** (price per course, "Pick courses" opens a course picker sheet). Under the cards: Restore purchases, the subscription disclosure (section 4), links to Terms and Privacy. Remove the hairline and "Not now"; the modal's Close stays.                                                                            | `paywall.tsx`, `PlanCard.tsx` (new)                       | M    |
| C4  | Grade, strand               | Grade: a title block (`title1` "Grade 5", `callout` "12 math and 10 science skills"), the Math/Science segment under it. Tiles: title at the top under the badge (no space-between), fixed height 132, badge 40. Strand: one card per skill with the skill title as `title3` and its lessons as inset rows (no card in a card); "Use this for …" moves to a second line in `callout` with the quote in regular weight.                                                                                                                                                                                                                                                                        | `grade/[grade]/*`, `Tile`, `SkillBox`                     | M    |
| C5  | Browse, HE, division, field | Browse: two sections "School" and "College" with `callout` subtitles ("Kindergarten to Grade 12"); grade tiles grouped into bands (K–2, 3–5, 6–8, 9–12) with a band label, so the wide grid never leaves a ragged row of one. HE, division and field pages get a title block (`title1` and a one-line description from `divisionLabel`/field data) and `grid` width.                                                                                                                                                                                                                                                                                                                          | `browse.tsx`, `he/**`, `DetailParts.tsx`                  | M    |
| C6  | Course, topic (chrome)      | Title block: overline "College · Chemistry" (a link), `title1` course name, `callout` topic count. Prerequisites become a compact list card ("Before this course"). Topic: breadcrumbs, title, and the topic's sections; unfinished sections show one compact "In preparation" row each (not four 110 px slabs).                                                                                                                                                                                                                                                                                                                                                                              | `course/[id]/*`, `DetailParts.tsx`, `PlaceholderCard.tsx` | M    |
| C7  | Skill (chrome)              | Above the module: breadcrumbs (S4), `title1` title, a meta row of two chips ("Grade 5 · Math", "Fractions"), and for a problem type a small "Problem type" overline plus its `use` line in `callout`. Module in a `read` (760) column on wide screens; pictures keep `chart.maxWidth`. Below the module: "Review first" (the Refresh chips) and "More problem types" as a list card, then the footer. Locked: `LockedState` v2 (B22 art, price, "See plans").                                                                                                                                                                                                                                 | `skill/[id].tsx`, `lessons/[id].tsx`, `DetailParts.tsx`   | M    |
| C8  | Search                      | Field: 52 px pill, `borderStrong` outline that becomes the focus ring, a clear button on web; `?q=` param read and written (deep links, the top bar). Filters as a segmented control. Results grouped by kind with counts; overline in sentence case, one line, ellipsised. Start state: B18 art, "Search 318 skills, 103 courses and 600 topics", and five example chips ("area of a rectangle", "photosynthesis", "Ohm's law"…). No empty card when only problem matches exist (F18).                                                                                                                                                                                                       | `search.tsx`, `ListRow`                                   | M    |
| C9  | Settings                    | Groups: **Your learning** (What you study; Units with the note shortened), **Appearance**, **Plan** (current plan and renewal date, Manage subscription, Restore purchases), **Privacy** ("No ads, no tracking, no accounts" row that opens the Privacy page), **Help** (Support, Terms, Privacy, Children's privacy), **About** (version and the CC BY credit in a footnote). "Clear recently viewed" becomes a destructive-text button with a confirm. Delete the placeholder disclaimer (its text moves to Terms).                                                                                                                                                                         | `settings.tsx`, `Group`, `ListRow`                        | M    |
| C10 | Levels                      | Same picker as onboarding step 2; title "What you study"; saves on tap with a small "Saved" toast.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            | `levels.tsx`, `LevelPicker.tsx`                           | S    |
| C11 | Not found                   | Centred `narrow` page: B21 illustration, `title1` "We couldn't find that page", body "It may have moved. Try Search, or start from Browse.", two buttons (Search, Browse), plus the header and footer.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        | `+not-found.tsx`, `EmptyState`                            | S    |
| C12 | Gallery index               | Keep as an internal page: title block, `read` width, `noindex`; no link from the shell.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       | `gallery/index.tsx`                                       | S    |
| C13 | Legal and support pages     | New routes `/legal/privacy`, `/legal/terms`, `/legal/children`, `/legal/subscriptions`, `/support`: `read` width, text from `src/data/legal.ts` (data, not UI), effective date, table of contents on wide screens.                                                                                                                                                                                                                                                                                                                                                                                                                                                                            | `src/app/legal/[page].tsx`, `src/app/support.tsx` (new)   | M    |

### Phase D: brand assets in place

| #   | Item                                                                                                                                                                                                                                                                                                                                                                      | Files                            | Size        |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------- | ----------- |
| D1  | `Logo` draws B1 (mark) from SVG paths with palette tokens; `Lockup` draws B3; `Wordmark` B2. Props `size`, `variant: 'mark'                                                                                                                                                                                                                                               | 'lockup'                         | 'stacked'`. | `src/components/Logo.tsx` | S   |
| D2  | `app.json`: `ios.bundleIdentifier` (owner decision, e.g. `com.onedollaruniversity.app`), `scheme` `onedollaru`, `icon` B4 (with iOS 18 `dark` and `tinted` variants), splash via the `expo-splash-screen` plugin (B7, backgrounds `#F7F7FB` / `#0B0C10`), `ios.privacyManifests` (UserDefaults reason `CA92.1` for AsyncStorage), `ITSAppUsesNonExemptEncryption: false`. | `app.json`, `assets/`            | S           |
| D3  | Web icons: `public/favicon.svg` (B5, with a dark-mode media query), `favicon.ico` 16/32/48, `apple-touch-icon.png` 180, `manifest.webmanifest` with 192/512 and maskable 512 (B6), linked in `+html.tsx`.                                                                                                                                                                 | `public/`, `+html.tsx`           | S           |
| D4  | Open Graph images B9–B11 in `public/og/`, chosen by `PageMeta` from the route (default, K–12, College).                                                                                                                                                                                                                                                                   | `public/og/`, `PageMeta.tsx`     | S           |
| D5  | Illustrations B12–B22 as React components in `src/components/art/` (react-native-svg, palette tokens only, one file each), so one drawing serves light and dark.                                                                                                                                                                                                          | `src/components/art/*.tsx` (new) | M           |
| D6  | App Store listing assets (B23): screenshots at 6.9" (1320 × 2868) and 13" iPad (2064 × 2752), taken from the app with captions.                                                                                                                                                                                                                                           | outside the repo or `store/`     | M           |

### Phase E to G: payments (section 4)

E entitlements and gating (no dependencies), F iPhone, G web. Legal pages (C13) must ship
before F or G.

### Accessibility, applied in every phase

- Every pressable: `accessibilityRole`, a label when the text doesn't say it, `hitSlop` to
  44 × 44 pt. Header icon buttons become 44 × 44.
- Page titles are `accessibilityRole="header"` with `aria-level` 1 on web; section headers 2.
- Contrast: body 4.5:1 minimum, large text and icons 3:1; disabled buttons use `disabledBg` and
  `textMuted` and are announced as disabled.
- Dynamic Type (iOS): no fixed heights on text containers (tiles use `minHeight`); test at the
  largest accessibility size.
- Focus: visible ring everywhere on web; the side menu and sheets trap and return focus; a
  "Skip to content" link first in the web page.
- Screen readers: tiles read "Grade 5, 12 math and 10 science skills, link"; the plan card
  reads the price and the period; status changes (purchase pending, active) are announced
  with `AccessibilityInfo.announceForAccessibility` / an `aria-live` region.

### Checks for every phase

`pnpm check:fast`, the shell tests in `src/components/__tests__/`, `pnpm build:web &&
pnpm verify:ssr`, and a re-shoot of `.review/site/shoot.mjs` at 390, 1024 and 1440 in light
and dark, compared with this plan's findings. Add a check to `verify-ssr` that every page has
one `h1`, a canonical link and an `og:image`.

---

## 4. Payments on iPhone and web

### 4.1 Entitlement model (both platforms)

```ts
// src/config/entitlements.ts
export type Product = { kind: 'k12' } | { kind: 'course'; courseId: string };
export interface Entitlements {
  k12: boolean; // every K–12 grade and subject
  courses: ReadonlySet<string>; // college course ids, e.g. 'he.chemistry.gen-chem-1'
  source: 'none' | 'appstore' | 'web';
  expiresAt?: number; // ms; the latest expiry over all items
  pending?: boolean; // Ask to Buy waiting for a parent
}
```

- **What a node needs** (`src/config/access.ts`): `productFor(nodeId)` maps K–12 skill and
  problem-type ids (`m.<g>.*`, `s.<g>.*`), grades and strands to `k12`; a course id, its topics
  (`<course>#<i>`) and their problem types (`#<i>~<slug>`) to `course:<courseId>`. Free content
  (owner decision D-1) is a list in `src/config/pricing.ts` checked first.
- `isLocked(nodeId, ent)` becomes pure; a hook `useLocked(nodeId)` reads the entitlement store.
  Screens keep calling it as today, so the paywall wiring (`LockedState`, `/paywall`) stays.
- **Store**: `src/state/entitlements.ts`, same pattern as `prefsStore` (AsyncStorage cache, so
  the app opens unlocked offline). Platform sources fill it: `src/purchases/index.ios.ts`
  (StoreKit) and `src/purchases/index.web.ts` (licence token). The cache is trusted only until
  `expiresAt` plus a 3-day grace period.
- **Pre-rendered pages**: the server can't know the visitor's plan. Pages render the lesson
  preview (title, first picture and inputs) for everyone, then gate after hydration
  (owner decision D-2 sets how much is shown). A locked page shows the preview faded under a
  `LockedState` card, never a blank page.

### 4.2 iPhone: StoreKit subscriptions

**Library options**

| Library                               | What it is                                                                                                                                       | Data and network                                                                                                                                                                                                                                     | Fit                                                                                  |
| ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| **`expo-iap`** (recommended)          | Expo module over StoreKit 2 (OpenIAP spec), config plugin, hooks (`useIAP`), `getAvailablePurchases`, `restorePurchases`, `currentEntitlements`. | Talks only to Apple. StoreKit 2 verifies transactions on the device (signed JWS), so no server is needed. No data leaves the device to us or a third party. Privacy label can stay "Data Not Collected".                                             | Fits the no-accounts rule exactly. Needs a development build (not Expo Go).          |
| `react-native-iap`                    | The older community library (same maintainers' ecosystem, Nitro modules in recent versions).                                                     | Same as above.                                                                                                                                                                                                                                       | Works; `expo-iap` is its Expo-first sibling, simpler to configure in SDK 57.         |
| `react-native-purchases` (RevenueCat) | Hosted subscription backend with SDK, paywalls, charts, web billing.                                                                             | Every launch calls RevenueCat's servers with an app user id (anonymous by default), device and purchase data; it is a data processor; the privacy label must declare purchase history and identifiers; a third-party SDK in an app used by children. | Strongest cross-platform story, but it breaks the "no third party" promise. Not now. |

Pin the `expo-iap` version whose peer range includes Expo SDK 57 at install time.

**Products.** Apple ids allow letters, digits, `.` and `_` (no hyphen), so course ids map
`-` → `_`.

- _K–12_: subscription group "K–12", one product `odu.k12.monthly`, price point $0.99.
- _College_, three options (owner decision D-3):
  - **A. One subscription per course.** One group per course, product
    `odu.course.he_chemistry_gen_chem_1.monthly`. True to "$1 per course". 103 groups now and a
    new product for every new course (each reviewed with an app version); the subscription
    management screen lists every course separately. Fine for a student with one or two.
  - **B. Course-count tiers in one group (recommended).** Group "College": `odu.college.1` …
    `odu.college.5` at $0.99, $1.99, $2.99, $3.99, $4.99, plus `odu.college.all` (owner sets the
    price). The student picks which courses fill the slots in the app; picks are saved on the
    device and may change once per billing period. Upgrades and downgrades are native and
    prorated by Apple; the product list never grows with the catalogue. Restore on a new
    device restores the slot count and asks the student to pick again (no server).
  - **C. One "All college" subscription** (and optionally one "Everything" plan). Simplest, but
    changes the owner's pricing.
- Family Sharing: turn it on for every product (one parent, several children). It can't be
  turned off later. Shared transactions arrive with `ownershipType = familyShared`.

**Flows**

1. Plans page loads products (`fetchProducts`), shows `displayPrice` from StoreKit (localised;
   never the hardcoded `$1`).
2. Buy → `requestPurchase`. Results: _purchased_ (verify, update store, finish the transaction,
   success screen), _pending_ (Ask to Buy: show "Waiting for a parent to approve. You can keep
   using the free lessons.", listen to `Transaction.updates`), _cancelled_ (no message),
   _failed_ (plain error and Retry).
3. On every launch and on foreground: read `currentEntitlements` (covers renewals, family
   sharing, refunds and revocations, and Ask to Buy approvals).
4. **Restore purchases** button on the plans page and in Settings → `restorePurchases()`
   (`AppStore.sync`), then re-read entitlements; say "Nothing to restore" when empty.
5. **Manage**: Settings → "Manage subscription" opens Apple's sheet (`showManageSubscriptions`
   / `itms-apps://apps.apple.com/account/subscriptions`).
6. Testing: a StoreKit configuration file in the Xcode project for local tests, then sandbox
   testers, then TestFlight.

**App Review rules to meet**

- **3.1.1**: digital content unlocked in the app must be sold through In-App Purchase. The iOS
  app shows no web price, no "buy on the website" button and no link to the web checkout
  (US-storefront link-out rights exist after the 2025 court ruling, but they add review risk
  for little gain at $0.99; revisit later). A restore mechanism is required: the Restore button.
- **3.1.2** (auto-renewable): the subscription must give ongoing value (the whole catalogue,
  updated); the purchase screen must state the title, length, price per period and what is
  included, and carry working links to the Privacy Policy and Terms of Use; the same links go
  in the App Store Connect metadata (Privacy Policy URL; Terms as the EULA field or the
  description).
- **3.1.3(b)** multiplatform: content bought on the web may be used in the app only if the same
  items are also sold by IAP in the app (relevant to 4.4).
- **5.1.1(v)**: an app that creates accounts must offer account deletion; another reason for
  no accounts.
- **1.3 / Kids Category**: recommend _not_ entering the Kids Category (the audience runs to
  university); rate 4+. If the owner chooses the Kids Category, every purchase and external
  link needs a parental gate and no third-party SDKs are allowed.
- **5.1.4 / COPPA**: the K–5 content is directed at children, so the app is "mixed audience":
  it collects no personal information from anyone, and the purchase is made by the Apple
  Account holder (a parent, or a child under Ask to Buy, which Apple routes to the parent).

### 4.3 Web: checkout without accounts

**Payment provider options** (owner decision D-4)

| Option                                      | How                                                                                                                   | Fees on a $1 charge (US cards)                                         | Taxes                                                                        |
| ------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| **Stripe Checkout** (recommended)           | Our function creates a Checkout Session in `subscription` mode with one line item per product; Stripe hosts the page. | 2.9 % + $0.30 card, + 0.7 % Billing, + 0.5 % Stripe Tax ≈ $0.34 (34 %) | You are the seller; Stripe Tax computes and collects; you register and file. |
| Stripe Payment Links                        | No-code links per product; `client_reference_id` in the URL.                                                          | Same                                                                   | Same                                                                         |
| Paddle / Lemon Squeezy (merchant of record) | They sell to the customer and pay you; hosted checkout and portal.                                                    | 5 % + $0.50 ≈ $0.55 (55 %)                                             | They register, collect and remit worldwide.                                  |

At $1 the fixed fee dominates. Ways to soften it (owner decision D-5): bill every item in
**one** subscription (one charge for K–12 plus courses), and offer **yearly** billing ($12 a year
per item: Stripe fees ≈ $0.79, 7 %).

**Checking a purchase on a static site** (owner decision D-6)

| Option                                                          | How it works                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 | What we hold                                                                                               | Privacy cost                                                                                                            |
| --------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| **1. Signed licence token on the device** (recommended, with 2) | After Checkout, the success page calls `/api/licence?session_id=…`; the function verifies the session with Stripe, creates a random 128-bit licence id `lid` (stored in the Stripe subscription's metadata), and returns a token signed with ECDSA P-256 (`{lid, k12, courses, exp}`; `exp` = period end + 3 days). The site verifies it offline with the public key in `src/config/licence.ts` (Web Crypto, no library), keeps it in `localStorage`, and refreshes it near `exp` with `/api/licence?lid=…`. | Nothing: Stripe is the database (customer email, card, subscription, `lid` metadata). No database of ours. | Lowest. The payer's email is held by Stripe only (needed for receipts). Losing the device loses access until restore.   |
| **2. Restore code**                                             | The success page shows the licence as a code `ODU-7K2F-9QXM-4D1P` with Copy and "Save as file"; any browser can enter it in Settings → "Use a restore code". It is the `lid`, a bearer secret.                                                                                                                                                                                                                                                                                                               | Same as 1                                                                                                  | None extra. Risk: a shared code works for anyone (acceptable at $1; refresh can cap devices later).                     |
| 3. Restore by email                                             | "Email me my code": the function finds the Stripe customer by email and sends the code with a transactional email service.                                                                                                                                                                                                                                                                                                                                                                                   | Same, plus an email vendor (processor) that sees the address                                               | Low; one more processor in the privacy policy; needs an email vendor account (not a code dependency).                   |
| 4. Minimal account                                              | Email magic-link login; entitlements tied to the account.                                                                                                                                                                                                                                                                                                                                                                                                                                                    | A user table (emails), sessions                                                                            | Highest: a database of emails, account deletion duty, COPPA exposure if children sign up, breach risk. Not recommended. |

Cancel and change: Settings → "Manage subscription" calls `/api/portal?lid=…`, which opens the
**Stripe Customer Portal** (cancel, change card, invoices). No portal login of our own.

**Server pieces** (Vercel functions next to the static `dist/`; the `api/` folder at the repo
root is deployed as functions while `outputDirectory` stays `dist`):

| Function                | Does                                                                                                                                                                                                                 |
| ----------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `api/checkout.ts`       | POST `{items:['k12','course:he.chemistry.gen-chem-1'], interval}` → Checkout Session URL (`success_url=/plans/done?session_id={CHECKOUT_SESSION_ID}`), with `consent_collection.terms_of_service` and automatic tax. |
| `api/licence.ts`        | GET by `session_id` (first claim) or `lid` (refresh, restore) → signed token, or 404 / 410 when cancelled or unpaid.                                                                                                 |
| `api/portal.ts`         | GET by `lid` → Customer Portal URL.                                                                                                                                                                                  |
| `api/stripe-webhook.ts` | Optional: none needed for the stateless design (refresh asks Stripe live). Add only for alerts (failed renewals).                                                                                                    |

Calls to Stripe use `fetch` against the REST API and Node's `crypto` for signing (no `stripe`
SDK). Secrets in Vercel env: `STRIPE_SECRET_KEY`, `LICENCE_PRIVATE_KEY`. Rate-limit the
functions with Vercel's firewall rules. New route pages: `/plans/done` (success, code) and the
web branch of `/paywall`.

**Children on the web.** The Buy button opens a short "For a parent or guardian" sheet: what
is charged, monthly renewal, how to cancel, then Continue to Stripe. Stripe needs a card, so the
payer is an adult; we never ask a child for anything.

### 4.4 One purchase on both platforms?

Options (owner decision D-7):

1. **Separate (recommended for launch).** iPhone buys through Apple, web through Stripe. No
   network calls from the iOS app beyond Apple.
2. **Web → iPhone.** The iOS app accepts a restore code (Settings), calls `/api/licence`, and
   unlocks. Allowed under 3.1.3(b) because the same products are sold by IAP in the app. Adds one
   network call from the iOS app to our domain, and the app must not mention web prices.
3. **iPhone → web.** The app shows a code; the server checks the StoreKit transaction (the
   signed JWS chain to Apple's root certificate; the App Store Server API with a key for
   renewal status) and issues a web token. Most work; only worth it if many families use both.

### 4.5 Prices, commission, taxes, refunds

- **Prices.** Apple's US price points end in .99: K–12 $0.99, each course $0.99 (option B tiers
  above). Web: $1.00 or $0.99 (owner decision D-8; recommend $0.99 everywhere so the plans
  page and App Store agree). `src/config/pricing.ts` keeps the web prices and the copy; the iOS
  plans page shows StoreKit's `displayPrice`.
- **Commission.** Apple Small Business Program: 15 % (enrol before launch); proceeds on $0.99
  ≈ $0.84 before tax. Web: see 4.3 (34 % on a lone $1 charge with Stripe).
- **Taxes.** Apple calculates, collects and remits in most storefronts, including US states and
  the EU. Web with Stripe: the owner is the seller. US sales tax on digital goods depends on
  the state; some states set nexus at 200 transactions a year, which $1 sales reach fast. EU
  and UK VAT apply from the first sale for a non-EU seller. Options (decision D-4): launch web
  sales in the US only with Stripe Tax, or use a merchant of record for worldwide sales.
- **Refunds.** iPhone: Apple decides; the app sees the revocation through `currentEntitlements`
  and locks again. Web: policy "a full refund on request within 14 days of a charge" (owner
  decision D-9); done in the Stripe Dashboard, which cancels the subscription; the token
  expires at its `exp` (at most one period plus 3 days). EU withdrawal-right waiver: the
  checkout consent text says access starts at once.

### 4.6 Legal and policy pages

All in `src/data/legal.ts` (data), rendered by C13, linked from Settings, the plans page, the
web footer and App Store Connect. Have a lawyer review before launch.

| Page                                 | Must say                                                                                                                                                                                                                                                         |
| ------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Privacy policy `/legal/privacy`      | What is stored on the device (picks, appearance, recents, the licence); that we collect nothing; the processors: Apple (iPhone purchases), Stripe (web purchases: email, card), Vercel (hosting logs: IP addresses, kept per Vercel's policy); contact; changes. |
| Terms of use `/legal/terms`          | Licence to use, subscriptions and renewal, cancellation, refunds, the independent-study-aid disclaimer now in Settings, no warranty, governing law (owner).                                                                                                      |
| Children's privacy `/legal/children` | COPPA notice: the service is used by children; no personal information is collected from children; purchases are made by a parent or guardian through Apple or Stripe; how a parent contacts us.                                                                 |
| Subscriptions `/legal/subscriptions` | The disclosure below, per platform, and how to cancel on each.                                                                                                                                                                                                   |
| Support `/support`                   | An email address (owner: D-10), what to include, response time; restore help; refund route per platform. Required as the App Store Support URL.                                                                                                                  |

Disclosure under the iPhone plan cards (original wording):

> Your subscription is charged to your Apple Account when you confirm the purchase. It renews
> each month at the same price unless you turn off auto-renew at least 24 hours before the end
> of the current period; renewal is charged within the 24 hours before the period ends. Manage
> or cancel it any time in your Apple Account settings. [Terms of Use] · [Privacy Policy]

Web version: "…charged to your card today and every month until you cancel. Cancel any time in
Settings → Manage subscription; access lasts to the end of the paid month."

### 4.7 The "no network calls" rule

Replace "no accounts, analytics, tracking or network calls" in `CLAUDE.md` and the Settings
note with:

> No accounts, analytics, advertising or tracking. The app and website make network requests
> for one purpose only: buying, restoring and checking a subscription. On iPhone that is
> Apple's App Store through StoreKit; on the website it is the site's own `/api` purchase
> functions and Stripe's checkout and billing pages, opened by the person paying. These requests
> carry only what a purchase needs (product ids, a licence id, Stripe's session id) and never a
> name, lesson activity, search text or anything typed into a lesson. Lessons, search and
> pictures work with no connection. No third-party code that collects data.

Settings note (user-facing): "We don't collect anything about you. The only connections the
app makes are to the App Store (on iPhone) or our payment page (on the web) when you buy or
restore a plan."

### 4.8 Payment phases

| #   | Item                                                                                                                                                                                          | Size |
| --- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---- |
| E1  | `Entitlements` type, `productFor`, pure `isLocked`, `useLocked`, entitlement store with cache, free list; unit tests for every node kind (skill, problem type, grade, strand, course, topic). | M    |
| E2  | Preview-then-gate on skill and topic pages; `LockedState` v2; a dev toggle in the gallery to simulate plans.                                                                                  | M    |
| E3  | Plans page states: loading, products, pending, active (with renewal date and Manage), error; course picker sheet (option B).                                                                  | M    |
| E4  | Legal pages (C13) and the support page; rule text change (4.7).                                                                                                                               | M    |
| F1  | App Store Connect: agreements, banking, tax forms, Small Business Program, subscription groups and products, Family Sharing on, review screenshots of the plans page.                         | M    |
| F2  | `expo-iap` + development build (EAS); `src/purchases/index.ios.ts`; StoreKit config file; purchase, pending, restore, manage, launch refresh.                                                 | L    |
| F3  | Sandbox and TestFlight test matrix: buy, cancel, Ask to Buy approve and decline, family member, refund (revocation), restore on a second device, offline launch.                              | M    |
| G1  | Stripe account, products and prices (monthly and yearly), Stripe Tax, Customer Portal settings; Vercel env secrets and key pair.                                                              | S    |
| G2  | `api/checkout.ts`, `api/licence.ts`, `api/portal.ts`; `src/purchases/index.web.ts` (token verify, refresh, restore code); `/plans/done`.                                                      | L    |
| G3  | Web test matrix with Stripe test clocks: renew, fail and recover, cancel, refund, restore code on a second browser, expired token offline.                                                    | M    |

---

## 5. Images needed

For the chat that draws. All original. In-app art is SVG converted to React components that
read palette tokens (one drawing, both themes); the "dark" column says how it must look in dark
mode. Style for every illustration: the project style in `assets/images/STYLE.md` (ink outline
`#1f2937` at 6 px on an 800 scale, flat fills, at most one highlight and one shade per part),
restricted to the brand set: indigo `#4F46E5`, lavender `#EEF0FF`, gold `#F5B82E`, ink, paper,
light grey, plus one tone colour per drawing. Objects, not people; no text inside drawings.

| #   | What                        | Used in                                                             | Sizes and formats                                                                                                                                                                               | Light / dark                                                                                                                   | What it shows                                                                                                                                                                     |
| --- | --------------------------- | ------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| B1  | **$U mark**                 | Phone header, sidebar, splash, icons                                | SVG, square artboard 64 × 64, legible at 16 px; mono version                                                                                                                                    | Light: indigo tile, white U, gold $. Dark: `#8B83FF` tile, `#0B0C10` U, gold $. Mono: one colour for favicons and tinted icons | A "U" with a dollar sign: the $'s vertical stroke can form the U's left stem or sit inside the U. Geometric, rounded terminals, no outline. Not a coin, not a mortarboard cliché. |
| B2  | **Wordmark**                | Sidebar lockup, footer, onboarding                                  | SVG, outlined text (no font dependency), height 24 at 1×                                                                                                                                        | `text` colour in each theme                                                                                                    | "One Dollar University" in a geometric sans (Inter-like proportions, weight 700, slight negative tracking)                                                                        |
| B3  | **Lockups**                 | Horizontal: sidebar, footer, OG. Stacked: onboarding, splash, plans | SVG; horizontal mark + wordmark (ratio about 6:1); stacked mark above wordmark above slogan "Education For Everyone"                                                                            | Both themes, as B1 and B2                                                                                                      | Clear-space rule: the U's width on every side                                                                                                                                     |
| B4  | **App icon**                | iOS (and Android if it ships)                                       | 1024 × 1024 PNG, no transparency, no rounded corners (iOS masks it); iOS 18 dark and tinted variants (1024, transparent background for dark/tinted); Android adaptive fg/bg 432 × 432 safe zone | Light: indigo-to-deeper-indigo subtle field, white mark. Dark: near-black field, indigo mark. Tinted: greyscale mark           | B1 large and centred, nothing else. Must read at 29 px.                                                                                                                           |
| B5  | **Favicon**                 | Browser tabs                                                        | `favicon.svg` (with an internal `prefers-color-scheme` style), `favicon.ico` containing 16, 32 and 48 PNGs                                                                                      | SVG switches tile colour by scheme                                                                                             | B1 simplified for 16 px (thicker strokes, no gold detail at 16)                                                                                                                   |
| B6  | **Touch and PWA icons**     | iOS home-screen bookmark, web manifest                              | `apple-touch-icon.png` 180 × 180 (opaque); `icon-192.png`, `icon-512.png`; `icon-maskable-512.png` (mark inside the central 80 %)                                                               | Light only (opaque)                                                                                                            | As B4                                                                                                                                                                             |
| B7  | **Splash**                  | iOS launch (expo-splash-screen)                                     | PNG mark 1024 × 1024 with transparent background, shown at 200 pt wide; plus a dark version                                                                                                     | On `#F7F7FB` (light) and `#0B0C10` (dark)                                                                                      | B1 only (the stacked lockup is too small to read on a splash)                                                                                                                     |
| B8  | **Store marketing icon**    | App Store product page, press                                       | Same file as B4                                                                                                                                                                                 | —                                                                                                                              | —                                                                                                                                                                                 |
| B9  | **OG image, default**       | Link previews of Home, Browse, Search, Plans, legal                 | 1200 × 630 PNG (under 300 KB), safe area 1080 × 566                                                                                                                                             | Light only                                                                                                                     | Horizontal lockup left, slogan below, and on the right a small collage of three flat lesson objects (a fraction bar, a beaker, a graph line) on lavender                          |
| B10 | **OG image, K–12**          | Grade, strand, skill pages                                          | 1200 × 630 PNG                                                                                                                                                                                  | Light only                                                                                                                     | As B9 with "Kindergarten to Grade 12" and K–12 objects (counters, ruler, fraction bar)                                                                                            |
| B11 | **OG image, College**       | HE, division, field, course, topic pages                            | 1200 × 630 PNG                                                                                                                                                                                  | Light only                                                                                                                     | As B9 with "College courses" and university objects (a circuit, a molecule, an integral curve)                                                                                    |
| B12 | **Home hero**               | Home, beside the slogan                                             | SVG, 480 × 320 artboard; drawn to crop to 360 × 120 on phones                                                                                                                                   | Token-driven; dark: fills on `accentSoft` dark, outlines `#ECEEF4`                                                             | A desk of learning objects rising from simple to advanced, left to right: counting blocks, a fraction bar, a protractor, a beaker, a graph with a curve                           |
| B13 | **Explore: K–12 card**      | Home (no courses picked), Browse header                             | SVG 320 × 200                                                                                                                                                                                   | Token-driven                                                                                                                   | A stack of school things: pencil, ruler, ten-frame, small plant                                                                                                                   |
| B14 | **Explore: College card**   | Home, Browse header                                                 | SVG 320 × 200                                                                                                                                                                                   | Token-driven                                                                                                                   | Flask, circuit board corner, a gear, a graph                                                                                                                                      |
| B15 | **Onboarding welcome**      | Onboarding step 1                                                   | SVG 600 × 400                                                                                                                                                                                   | Token-driven                                                                                                                   | An open book from which a few lesson pictures lift off (a number line, a beaker, a triangle): "pictures you can move"                                                             |
| B16 | **Empty: no courses**       | Home "My courses" (when other sections exist), Levels               | SVG 240 × 160                                                                                                                                                                                   | Token-driven                                                                                                                   | An empty bookshelf with one book leaning                                                                                                                                          |
| B17 | **Empty: no results**       | Search, nothing found                                               | SVG 240 × 160                                                                                                                                                                                   | Token-driven                                                                                                                   | A magnifier over a blank card                                                                                                                                                     |
| B18 | **Search start**            | Search, before typing                                               | SVG 240 × 160                                                                                                                                                                                   | Token-driven                                                                                                                   | A magnifier over a worksheet with a highlighted line                                                                                                                              |
| B19 | **Plans header**            | Plans page                                                          | SVG 360 × 160                                                                                                                                                                                   | Token-driven; gold stays gold                                                                                                  | A single gold dollar coin standing beside a stack of three books                                                                                                                  |
| B20 | **Purchase success**        | Plans (active), `/plans/done`                                       | SVG 160 × 160, plus the check stroke as a separate path for the draw animation                                                                                                                  | Token-driven; `success` check                                                                                                  | The coin from B19 with a check mark badge                                                                                                                                         |
| B21 | **Not found**               | `+not-found`, unknown ids                                           | SVG 320 × 200                                                                                                                                                                                   | Token-driven                                                                                                                   | A number line that ends in a gap, with a small signpost                                                                                                                           |
| B22 | **Locked lesson**           | `LockedState`                                                       | SVG 160 × 120                                                                                                                                                                                   | Token-driven                                                                                                                   | A lesson card with a soft padlock badge (gold)                                                                                                                                    |
| B23 | **Store screenshot frames** | App Store listing                                                   | 1320 × 2868 (6.9" iPhone) and 2064 × 2752 (13" iPad), PNG; 6 to 8 frames                                                                                                                        | Light (one dark frame allowed)                                                                                                 | A caption band (lockup colour) above a real app screenshot: Home, a K–5 picture lesson, a worked-step lesson, a college topic, Search by problem, Plans                           |
| B24 | **Error / offline**         | Plans and checkout when a purchase call fails                       | SVG 240 × 160                                                                                                                                                                                   | Token-driven                                                                                                                   | A plug unplugged from a socket                                                                                                                                                    |

---

## 6. Summary

### Phases

| Phase | What                                                                                                                | Size          | Depends on               |
| ----- | ------------------------------------------------------------------------------------------------------------------- | ------------- | ------------------------ |
| A     | Foundations: tokens, `+html.tsx`, meta, `Page`, component pass, icons, not-found fix                                | about 6 days  | —                        |
| B     | Shell: one header, desktop sidebar and top bar, breadcrumbs, menu, footer, tabs                                     | about 7 days  | A                        |
| C     | Screens: Home, onboarding, plans UI, grade/browse/HE, course/topic/skill chrome, search, settings, not found, legal | about 10 days | A, B (C13 needs only A)  |
| D     | Brand assets in place (logo, icons, splash, OG, illustrations, store art)                                           | about 4 days  | Images B1–B24, A         |
| E     | Entitlements, preview-then-gate, plans states, legal                                                                | about 5 days  | A, C3; decisions D-1–D-3 |
| F     | iPhone In-App Purchase                                                                                              | about 6 days  | E, D2, Apple account     |
| G     | Web checkout and licence                                                                                            | about 6 days  | E, Stripe account        |

A to D can ship before any payment work; E can ship with everything still unlocked (an empty
product map); F and G ship independently.

### Dependencies to approve

| Dependency                   | Why                                                                                       | Phase |
| ---------------------------- | ----------------------------------------------------------------------------------------- | ----- |
| `expo-iap`                   | StoreKit 2 purchases, restore, entitlements                                               | F     |
| `expo-splash-screen`         | Configured splash with light and dark images (part of the Expo SDK, installed separately) | D     |
| `expo-dev-client` (dev only) | Development builds to test purchases on device                                            | F     |

Not added: `expo-font` (no bundled font in the app), the `stripe` SDK (REST via `fetch`), any
JWT or crypto library (Web Crypto and Node `crypto`), any icon library, Reanimated, RevenueCat.
Services (accounts, not code): Apple Developer Program, Stripe (or a merchant of record), a
custom domain, optionally a transactional email service (only with D-6 option 3). Committed
asset: Inter variable WOFF2 (SIL OFL) in `public/fonts/`.

### Owner decisions needed

| #    | Decision                                                                                                           | Recommendation                                                                                                   |
| ---- | ------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------- |
| D-1  | What stays free (none; the first skill of each strand; every main lesson; one topic per course)                    | The main lesson of every K–12 skill and the first topic of each course free; problem types and later topics paid |
| D-2  | What a locked pre-rendered page shows (nothing; preview; everything with a soft gate)                              | Title, first picture and inputs, then the lock card                                                              |
| D-3  | College products on iPhone: A per-course groups, B course-count tiers, C one "All college"                         | B                                                                                                                |
| D-4  | Web provider: Stripe (you file taxes) or a merchant of record (Paddle, Lemon Squeezy); US-only launch or worldwide | Stripe with Stripe Tax, US only at launch                                                                        |
| D-5  | Web billing: monthly only, or monthly and yearly; one subscription for all items                                   | Both intervals, one subscription                                                                                 |
| D-6  | Web restore: token only, plus restore code, plus email, or accounts                                                | Token plus restore code; email later if support asks                                                             |
| D-7  | One purchase across iPhone and web                                                                                 | Separate at launch; web → iPhone by code later                                                                   |
| D-8  | Web price $1.00 or $0.99                                                                                           | $0.99, same as the App Store                                                                                     |
| D-9  | Web refund policy                                                                                                  | Full refund on request within 14 days of a charge                                                                |
| D-10 | Domain, support email, bundle id, legal entity name and governing law                                              | A custom domain before payments (Stripe and Apple both need a site and support URL)                              |
| D-11 | Kids Category on the App Store                                                                                     | No; age rating 4+                                                                                                |
| D-12 | Web font: Inter self-hosted, or the system stack                                                                   | Inter on web, system font on iOS                                                                                 |

## 7. Owner decisions (2026-10-03)

These replace the recommendations for D-1 to D-5 and D-8 above; section 4 follows them.

- **Getting in (D-1):** $1 once: the App Store price of the iPhone app (a paid app), or a
  one-time sign-up fee on the web (added to the first Stripe checkout). Nothing is free after
  that without a plan.
- **Plans (D-1, D-3, D-5):** all monthly, one subscription at a time.

  | Plan     | Price                       | Holds                                   |
  | -------- | --------------------------- | --------------------------------------- |
  | Basic    | $1 a month                  | Every K–12 lesson and 1 college course  |
  | Advanced | $5 a month                  | Every K–12 lesson and 7 college courses |
  | Premium  | $10 a month, or $100 a year | Every lesson and every college course   |

  Basic and Advanced: the chosen courses can be changed after one billing cycle. (Advanced is
  taken to include K–12 as Basic does; confirm with the owner if that changes.)

- **iPhone (D-3):** one subscription group with four products (Basic, Advanced, Premium monthly,
  Premium yearly) in a paid app. The chosen courses are kept on the device with the date they
  were chosen; a change is allowed once the current period has renewed.
- **Web restore (D-6):** the recommendation (a signed licence on the device plus a restore code).
- **Web price (D-8):** $1.00, not $0.99.
- The prices live in `src/config/pricing.ts`; the plans page reads them.

Still open: D-4 (Stripe or a merchant of record; US only at launch), D-7 (one purchase on both
platforms), D-9 (web refunds), D-10 (domain, support email, bundle id, legal entity), D-11
(Kids Category), D-12 (web font).

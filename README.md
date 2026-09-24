# Educational Calculator (wireframe)

A study app covering every course in one place. One codebase ships as an **iOS app** (Expo) and a
**website** (Expo web, hosted on Vercel):

- **K–12:** Math and Science for each grade, Kindergarten through Grade 12.
- **Higher Ed:** Math, Science and Engineering → fields → college courses.

This phase is a **wireframe only**. It covers navigation, layout and data wiring, in grayscale with
the system font and light/dark mode. Later phases add the formula/calculator engine, step-by-step
solutions and a subscription with a 7-day free trial.

**Privacy:** users are often minors. The app has no accounts, analytics, tracking SDKs or network
calls. Selections and recently viewed items are stored on the device only (AsyncStorage).

## Setup

Requirements: Node 22+ and pnpm 10 (`corepack enable` picks up the pinned version).

```sh
pnpm install
```

| Command             | What it does                                                     |
| ------------------- | ---------------------------------------------------------------- |
| `pnpm start`        | Expo dev server (Expo SDK 57); press `w` to open the web version |
| `pnpm web`          | Dev server opened straight in the browser                        |
| `pnpm build:web`    | Static website build into `dist/` (what Vercel deploys)          |
| `pnpm verify:ssr`   | Check the build: sample pages contain their content without JS   |
| `pnpm test`         | Jest unit tests (ts-jest)                                        |
| `pnpm typecheck`    | `tsc --noEmit` (strict)                                          |
| `pnpm lint`         | ESLint (`eslint-config-expo`)                                    |
| `pnpm format:check` | Prettier check (`pnpm format` to fix)                            |

CI (`.github/workflows/ci.yml`) runs typecheck, lint, format check, tests, the web build and
`verify:ssr` on every push and pull request.

## Running on iOS (Expo Go)

1. Install [Expo Go](https://expo.dev/go) from the App Store on an iPhone.
2. Run `pnpm start` on a computer. The phone and computer need to be on the same Wi-Fi, or use
   `pnpm start --tunnel`.
3. Scan the QR code with the iPhone camera.

The app uses no custom native code, so Expo Go runs it as-is. Expo Go on the App Store supports one
Expo SDK at a time; this project targets SDK 57.

## Deploying the website (Vercel)

`vercel.json` has everything Vercel needs: the pnpm install command, the build command, the
`dist` output folder, clean URLs and rewrites for ids with dots.

The website is **pre-rendered**: `expo export -p web` with `"output": "static"` writes one HTML
file per page (every grade, skill, course, course topic and Higher Ed division and field, from
`taxonomy.ts` via each route's `generateStaticParams`). Each page's HTML already contains its
title, description and lesson text, so search engines, link previews and tools that don't run
JavaScript can read it; the app then takes over in the browser. After the export,
`scripts/postexport.mjs` writes `sitemap.xml` (every pre-rendered page), a `404.html`, and removes
Expo's route templates. `public/robots.txt` allows all crawlers and points to the sitemap.

- `/skill/m.K.make-10` is served from `dist/skill/m.K.make-10.html` (`cleanUrls`, plus rewrites so
  ids with dots are never read as file extensions). Unknown pages get the 404 page.
- `pnpm verify:ssr` serves `dist/` the same way and checks sample pages (in CI too).
  `pnpm verify:ssr --serve` serves the build at http://localhost:8765 to try it in a browser.
- Pages render with default settings; saved choices (onboarding, recents, appearance) load in the
  browser right after, and first-time visitors are then sent to onboarding.

1. On [vercel.com](https://vercel.com), choose **Add New → Project** and import this GitHub repo.
   Leave the framework preset as **Other**; `vercel.json` supplies the settings.
2. Deploy. Every pushed branch gets its own preview URL, and the production branch gets the main
   URL.

Notes for the web version:

- Navigation and controls look like a web page, not native iOS. Use Expo Go to judge iOS look and
  feel.
- Selections and Recently viewed are stored in that browser (localStorage) and never leave it.
- Deployments are public by default. Turn on Vercel **Deployment Protection** to limit access, and
  leave Vercel Web Analytics off to keep the no-tracking promise.

## Folder structure

```
src/
  app/                        Expo Router routes (file-based)
    _layout.tsx               Root stack; gates first launch on onboarding
    onboarding.tsx            "What are you studying?" (first launch only, skippable)
    (tabs)/                   Home · Browse · Search · Settings
    grade/[grade].tsx         Math | Science segmented control, skills grouped by strand
    he/index.tsx              Higher Ed divisions
    he/[division]/index.tsx   Fields (or courses directly for single-field Math)
    he/[division]/[field].tsx Course list
    skill/[id].tsx            Skill detail: Refresh links + placeholder cards
    course/[id]/index.tsx     Course detail: field chips, prerequisites, topics
    course/[id]/topic/[index].tsx  Placeholder topic screen
    levels.tsx                Edit onboarding selections (from Settings)
    paywall.tsx               Placeholder paywall (modal)
  data/
    modules/                  Module content (assumptions, formulas, representation) by taxonomy id
    taxonomy.ts               SINGLE SOURCE OF TRUTH for all course content (do not edit casually)
    selectors.ts              Pure derived views: strand grouping, search, routes, labels
    __tests__/                validateTaxonomy() + selector tests
  components/                 ListRow, SectionHeader, Chip, PlaceholderCard, RefreshLinkRow,
                              EmptyState, Button, SegmentedControl, LevelPicker, CourseList…
  state/                      AsyncStorage-backed hooks: useSelectedLevels, useRecents
  engine/                     Formula solver, units and conversions, formatting (pure, tested)
  components/module/          Module UI: formula inputs + linked table/chart/diagram (reps/)
  config/access.ts            isLocked(nodeId) stub (always false; no purchase logic yet)
  theme.ts                    The entire look: palettes, font, type scale, spacing, chart styling
docs/MODULE_GUIDE.md          Content standards and the review process for modules
docs/MODULE_PLAN.md           Sections for writing the remaining modules, with status
.claude/agents/module-reviewer.md  Independent AI reviewer for module content
TAXONOMY_ISSUES.md            Data problems found (taxonomy.ts is never patched directly)
vercel.json                   Website build and hosting settings
```

### Rules the code follows

- **UI code never hardcodes course content.** Every grade, skill, course, field and topic comes
  from `taxonomy.ts` exports (`GRADES`, `SKILLS`, `COURSES`, `HE_FIELDS`, `skillsFor`,
  `coursesFor`, `refreshLinks`, `gradeLabel`, `getNode`), directly or through `selectors.ts`.
- **Each K–12 skill lives only in the grade where it's first taught.** Later grades link back with
  "Refresh: Grade X" rows built from `refreshLinks()`.
- **Math has a single Higher Ed field,** so Browse skips the field level and goes straight to
  courses. This is derived (`skipsFieldLevel`), not special-cased.
- **Routes are keyed by taxonomy id:** `/skill/[id]`, `/course/[id]`, `/grade/[grade]`,
  `/he/[division]`, `/he/[division]/[field]`.

## How to add a course (or skill)

1. Edit `src/data/taxonomy.ts`:
   - **College course:** add a `math(...)`, `chem(...)`/`phys(...)`/… or `eng(...)` entry to
     `COURSES` with its prerequisites (skill or course ids) and topics. Cross-list shared
     engineering courses through the `fields` array instead of duplicating them.
   - **K–12 skill:** add a row to the grade where it is **first** taught in `MATH` or `SCIENCE`.
     Prereqs must point to an earlier grade.
   - **New field:** add it to `HE_FIELDS[division]`.
2. Run the tests:

   ```sh
   pnpm test
   ```

   `validateTaxonomy()` must report zero errors and zero warnings: no duplicate ids, no repeated
   skill titles, every prereq exists and comes from an earlier grade, no prereq cycles, no empty
   fields. The selector tests also check that everything stays reachable through Browse.

3. That's it. Browse, Search, Home cards, onboarding choices and Refresh links pick up the change
   automatically.

## Modules: assumptions, formulas and a linked visual

Each skill and course topic ("module") has four sections, in this order (after Refresh):

1. **Table, chart or diagram:** shows the lesson's values. Dragging a handle or tapping a row or
   square sets variables exactly like typing, so the formulas and the visual always match.
2. **Formulas** ("Number sentences" in K–2): a live calculator. Enter any variable and every
   value the formulas can determine fills in. You may need several inputs before everything is
   known. The newest entry wins: if it contradicts an older one, the older one is recalculated,
   or cleared with a note if it can't fit.
3. **Assumptions:** bullet points stating what the formulas take for granted.
4. **Step-by-step:** a live walkthrough of how the current values were found from the entered
   ones. It lists what was given and what to find, then for each calculated value shows the
   formula used, how it was rearranged (in words), the rearranged form, the numbers
   substituted, and the result. It ends with a check that plugs every value back into every
   formula.

**Units:** each module with units has a Units menu, plus a unit dropdown on every value:

- **Metric** or **US customary** sets the system. Each value can then use any unit in it: mm,
  cm, m or km; in, ft, yd or mi; g, kg or t; and so on. Middle-school science is metric-only,
  following NGSS.
- **Mixed** allows metric and US units together.
- In whole-number lessons (Grade 3 area), lengths and the area change together (m → m²), so a
  lesson never mixes feet with inches.

The calculator converts everything, including inputs, charts, axes and tables. If the formulas
hold directly in the chosen units (4 in × 3 in = 12 in²), the step-by-step works in them.
Otherwise it converts to the formula's units first and converts the answers back, showing each
factor (1 kg = 2.20462 lb). A default unit system can be set in Settings. Units and exact
conversion factors live in `src/engine/units.ts`.

Content lives in `src/data/modules/` (`k12.ts`, `college.ts`), keyed by skill id or course topic
key (`<courseId>#<topicIndex>`). `taxonomy.ts` stays the source of truth for titles and structure.
14 pilot modules are written. Every other module shows placeholders until its content is added.

### How to add a module

1. Add a `ModuleDef` to `k12.ts` or `college.ts`:
   - **Variables:** give each one a symbol, name, unit, `min`/`max`, a drag `step`, and
     `integer` if it must be a whole number.
   - **Relations:** give each equation a `residual` (left side − right side) and, where
     possible, a `solve` rearrangement for each variable. The solver falls back to numeric
     root-finding within `[min, max]`.
   - **Steps:** for each relation and each variable it can be solved for, the rearranged
     expression and a plain-language explanation (`steps`).
   - **Example:** a consistent worked `example`, plus the variables it opens with
     (`startWith`).
   - **Representation:** choose one of `numberLine`, `bars`, `rectangle`, `grid100`, `circle`,
     `rightTriangle`, `plot`, `table` or `force`.
2. Follow the standards and the review process in `docs/MODULE_GUIDE.md`: automated tests plus
   an independent review by the `module-reviewer` agent. Run `pnpm test`. For every module, the
   tests check that:
   - it matches a taxonomy skill or topic;
   - the example satisfies every relation and range;
   - every rearrangement agrees with its relation and has a step explanation;
   - solving from any combination of inputs reproduces the example.

## Restyling

The whole look lives in `src/theme.ts`. Components hardcode no colors, fonts or sizes:

- **Palettes:** light and dark app colors, plus separate chart colors (`chartInk`, `chartFill`,
  `chartHighlight`, …) so diagrams can be styled independently of the rest of the app.
- **Font:** `font.family` applies to all app text (through `src/components/Text.tsx`), chart text
  and navigation headers. Leave it `undefined` for the system font. Load custom fonts with
  expo-font first.
- **Type scale, spacing, corner radius:** `font`, `space` and `radius`.
- **Charts:** label sizes, line widths, dash patterns, and drag-handle size and touch area
  (`chart`).

## What's stubbed

- **Module content:** 14 pilot modules are written, including step-by-step walkthroughs. Other
  skills and topics show placeholder cards for all four sections.
- **Paywall:** layout only. Continue is disabled, Restore Purchases does nothing, and prices are
  placeholders.
- **`isLocked()`:** always returns `false`. Detail screens already route locked content to the
  paywall, so enabling access control only touches `src/config/access.ts`.
- **About:** the non-affiliation disclaimer is placeholder copy.

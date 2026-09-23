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
| `pnpm test`         | Jest unit tests (ts-jest)                                        |
| `pnpm typecheck`    | `tsc --noEmit` (strict)                                          |
| `pnpm lint`         | ESLint (`eslint-config-expo`)                                    |
| `pnpm format:check` | Prettier check (`pnpm format` to fix)                            |

CI (`.github/workflows/ci.yml`) runs typecheck, lint, format check, tests and the web build on every
push and pull request.

## Running on iOS (Expo Go)

1. Install [Expo Go](https://expo.dev/go) from the App Store on an iPhone.
2. Run `pnpm start` on a computer. The phone and computer need to be on the same Wi-Fi, or use
   `pnpm start --tunnel`.
3. Scan the QR code with the iPhone camera.

The app uses no custom native code, so Expo Go runs it as-is. Expo Go on the App Store supports one
Expo SDK at a time; this project targets SDK 57.

## Deploying the website (Vercel)

`vercel.json` has everything Vercel needs: the pnpm install command, the build command
(`expo export --platform web`), the `dist` output folder, and a rewrite that sends every path to
`index.html` so deep links like `/skill/m.8.slope` load the app.

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
  engine/                     Formula solver (pure, unit-tested) and number formatting
  components/module/          Module UI: formula inputs + linked table/chart/diagram (reps/)
  config/access.ts            isLocked(nodeId) stub (always false; no purchase logic yet)
  theme.ts                    Grayscale light/dark palette
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

Each skill and course topic ("module") can have three sections:

1. **Assumptions:** bullet points stating what the formulas take for granted.
2. **Formulas:** a live calculator. Enter any variable and every value the formulas can
   determine fills in. You may need several inputs before everything is known. The newest entry
   wins: if it contradicts an older one, the older one is recalculated, or cleared with a note if
   it can't fit.
3. **Table, chart or diagram:** shows the same values. Dragging a handle or tapping a row or
   square sets variables exactly like typing, so the formulas and the visual always match.

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
   - **Example:** a consistent worked `example`, plus the variables it opens with
     (`startWith`).
   - **Representation:** choose one of `numberLine`, `bars`, `rectangle`, `grid100`, `circle`,
     `rightTriangle`, `plot`, `table` or `force`.
2. Run `pnpm test`. For every module, the tests check that:
   - it matches a taxonomy skill or topic;
   - the example satisfies every relation and range;
   - every rearrangement agrees with its relation;
   - solving from any combination of inputs reproduces the example.

## What's stubbed

- **Module content:** 14 pilot modules are written. Other skills and topics show placeholder cards
  for Assumptions, Formulas and the visual.
- **Step-by-step example:** a grey placeholder card on every skill and topic screen.
- **Paywall:** layout only. Continue is disabled, Restore Purchases does nothing, and prices are
  placeholders.
- **`isLocked()`:** always returns `false`. Detail screens already route locked content to the
  paywall, so enabling access control only touches `src/config/access.ts`.
- **About:** the non-affiliation disclaimer is placeholder copy.

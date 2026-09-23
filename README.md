# Educational Calculator (wireframe)

An iOS study app covering every course in one place:

- **K–12:** Math and Science for each grade, Kindergarten through Grade 12.
- **Higher Ed:** Math, Science and Engineering → fields → college courses.

This phase is a **wireframe only**. It covers navigation, layout and data wiring, in grayscale with
the system font and light/dark mode. Later phases add the formula/calculator engine, step-by-step
solutions and a subscription with a 7-day free trial.

**Privacy:** users are often minors. The app has no accounts, analytics, tracking SDKs or network
calls. Selections and recently viewed items are stored on the device only (AsyncStorage).

## Setup

Requirements: Node 22+, pnpm 10 (`corepack enable` picks up the pinned version), and
[Expo Go](https://expo.dev/go) on an iPhone.

```sh
pnpm install
pnpm start          # scan the QR code with the iPhone camera to open in Expo Go
```

| Command             | What it does                          |
| ------------------- | ------------------------------------- |
| `pnpm start`        | Expo dev server (Expo SDK 57)         |
| `pnpm test`         | Jest unit tests (ts-jest)             |
| `pnpm typecheck`    | `tsc --noEmit` (strict)               |
| `pnpm lint`         | ESLint (`eslint-config-expo`)         |
| `pnpm format:check` | Prettier check (`pnpm format` to fix) |

CI (`.github/workflows/ci.yml`) runs typecheck, lint, format check and tests on every push and pull
request.

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
    taxonomy.ts               SINGLE SOURCE OF TRUTH for all course content (do not edit casually)
    selectors.ts              Pure derived views: strand grouping, search, routes, labels
    __tests__/                validateTaxonomy() + selector tests
  components/                 ListRow, SectionHeader, Chip, PlaceholderCard, RefreshLinkRow,
                              EmptyState, Button, SegmentedControl, LevelPicker, CourseList…
  state/                      AsyncStorage-backed hooks: useSelectedLevels, useRecents
  config/access.ts            isLocked(nodeId) stub (always false; no purchase logic yet)
  theme.ts                    Grayscale light/dark palette
TAXONOMY_ISSUES.md            Data problems found (taxonomy.ts is never patched directly)
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

## What's stubbed

- **Formula, Calculator and Step-by-step example:** grey placeholder cards on skill and topic
  screens.
- **Paywall:** layout only. Continue is disabled, Restore Purchases does nothing, and prices are
  placeholders.
- **`isLocked()`:** always returns `false`. Detail screens already route locked content to the
  paywall, so enabling access control only touches `src/config/access.ts`.
- **About:** the non-affiliation disclaimer is placeholder copy.

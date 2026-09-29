# Working in this repository

A study app (Expo SDK 57, Expo Router, TypeScript strict) that ships as an iOS app and a
static website. Users are often minors: no accounts, analytics, tracking or network calls.
Course content is data, never hardcoded in UI code. `src/data/taxonomy.ts` is the source of
truth for grades, skills and courses (log changes in `TAXONOMY_ISSUES.md`).

## Where things are

| Path                                         | What                                                                                                                                                                                                     |
| -------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/data/modules/math/<grade>.ts`           | Calculator modules for a math grade (`k`, `1`, `2`, …), main page then its problem types                                                                                                                 |
| `src/data/modules/science/<grade>.ts`        | The same for science                                                                                                                                                                                     |
| `src/data/modules/layouts/`                  | Sort, sequence, explore and observe pages (data only)                                                                                                                                                    |
| `src/data/modules/helpers.ts`, `work.ts`     | Shared relations and step text; worked arithmetic lines                                                                                                                                                  |
| `src/data/modules/written.ts`, `simplify.ts` | Written work by grade (column sums, partial products, long division) and the one-stage-per-line simplifying                                                                                              |
| `src/data/modules/shared/`                   | Helpers two grade files share (add-sub, compare)                                                                                                                                                         |
| `src/data/modules/pilots.ts`                 | Pilot modules for grades not built yet; move each to its grade file                                                                                                                                      |
| `src/data/modules/gallery.ts`, `/gallery`    | Demo modules for picture kinds no lesson uses yet                                                                                                                                                        |
| `src/data/modules/pictureRequests.ts`        | Every picture requested, the pages it is for and its status (requested, drawn, placed)                                                                                                                   |
| `src/data/modules/harness/`                  | The sampling harness: `evaluate.ts` (PHRASES the step text uses), `pictures.ts` (checks per picture kind), `search.ts`                                                                                   |
| `src/components/module/reps/`                | One component per picture kind; register new kinds in `reps/index.tsx`, `meta.ts`, `modules.test.ts`, `harness/pictures.ts`                                                                              |
| `src/components/module/sliderPolicy.ts`      | Which picture kinds show sliders (a module can set `sliders`)                                                                                                                                            |
| `src/engine/`                                | Solver, calculator state, units, formatting                                                                                                                                                              |
| `src/data/match.ts`, `matchCorpus.json`      | Search's problem matcher: a typed problem → the page that solves it, on the device; the word weights come from `scripts/build-match-corpus.mjs` (CC BY practice problems only; rerun after adding pages) |
| `docs/MODULE_GUIDE.md`                       | Content standards and the review process (short; read first)                                                                                                                                             |
| `docs/PICTURES.md`, `docs/LAYOUTS.md`        | The picture catalog with each kind's options and the art direction; the layout kinds and every explore, observe and card figure (open when choosing one)                                                 |
| `docs/MODULE_PLAN.md`                        | Sections and what is built                                                                                                                                                                               |
| `docs/ENGINE_LOG.md`, `REVIEW_LOG.md`        | What each review taught the engine and the reviewers                                                                                                                                                     |
| `research/questions/`                        | Released K–8 test and practice questions by skill (NAEP, Illustrative Mathematics); reference only, never shipped or copied                                                                              |
| `research/textbooks/`                        | What K–8 textbooks teach, by grade (`grades/<grade>.md`) and by skill (`CROSSWALK.md`), with practice problems; check a lesson's coverage, order, numbers and wording against them; never copy           |
| `.claude/agents/`                            | `lesson-reviewer` and `page-reviewer`                                                                                                                                                                    |

## Commands

| Command                                                                     | Use                                                                                                         |
| --------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| `pnpm new-module m.5.skill[~slug] ["Title"]`                                | Scaffold a module in the right grade file                                                                   |
| `MODULE_IDS=m.5. pnpm test src/data/modules`                                | Module, standards and sampling tests for a prefix (`SAMPLES=100 SEQUENCES=15 UNIT_CASES=10` for a deep run) |
| `pnpm check`                                                                | Typecheck, lint, format check, all tests                                                                    |
| `pnpm review -- --prefix m.5. --stage lesson [--changed]`                   | Lesson evidence (dump, deep harness, questions): no build, no browser                                       |
| `pnpm review -- --prefix m.5. --stage page [--changed]`                     | Page evidence: builds only the pages in scope when `dist/` is stale, screenshots, drags, sheets             |
| `node scripts/ci-test.mjs`                                                  | Before a push: every cheap suite, the heavy ones for the grades changed                                     |
| `node scripts/plan-brief.mjs --grade 8 --subject m`                         | The brief a direction plan starts from (`.review/plans/m.8/brief.md`)                                       |
| `node scripts/promote-demo.mjs g.demo-id m.8.skill~slug ["Title"]`          | Copy a gallery demo into its grade file as a page                                                           |
| `node scripts/review-questions.mjs --prefix m.5.`                           | The released questions for a section's skills into `.review/questions.md`                                   |
| `NODE_PATH=$(npm root -g) pnpm shots -- <ids> --widths 390 --out .review/x` | Screenshots with layout checks                                                                              |
| `NODE_PATH=$(npm root -g) pnpm sliders -- [ids]`                            | Tap and drag every slider; report in `.review/sliders.md`                                                   |
| `pnpm docs:sliders`                                                         | Regenerate `docs/SLIDERS.md`                                                                                |
| `pnpm verify:ssr`                                                           | After a build: pages are pre-rendered with content                                                          |

The Playwright used by the scripts is the container's global one (`NODE_PATH=$(npm root -g)`),
not a dependency. Chromium is at `/opt/pw-browsers/chromium`.

## Building a grade

1. One module at a time: `pnpm new-module`, fill it in, run the module tests for its id.
2. Word rules by grade are enforced by `standards.test.ts` (no letters standing for numbers
   before Grade 6: K–5 name values in words and Grades 3–5 read rules in words, "Length ×
   width = area"; K–2: no "=" outside a number sentence; Grades 3–5: sentences of at most 22
   words).
3. A new phrase in step text is taught to the harness in `harness/evaluate.ts` (PHRASES); a new
   picture kind gets a check in `harness/pictures.ts`.
4. Problem types carry their `use` line ("Use this for …") in the module itself.
5. When the grade is done: `pnpm check`, build, then the review (`docs/MODULE_GUIDE.md`,
   "Review process"): evidence, the two reviewers, fix every finding, improve the engine and
   the reviewers, log it, push.

## Conventions

- Commit after each unit of work with a clear message; push to the working branch; no pull
  requests unless asked.
- Don't add dependencies without asking.
- Never edit `taxonomy.ts` casually; it is kept byte-for-byte and Prettier ignores it.
- Licensed material is never used; lesson text is original.

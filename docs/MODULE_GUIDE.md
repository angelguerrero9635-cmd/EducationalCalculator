# Module content guide

Each problem type is its own module and page (`<skill id>~<slug>`, listed under its skill);
there are no switchers between modules.

Every skill and course topic ("module") has four sections, shown in this order: a
**table, chart or diagram**, **Formulas** (live calculator; "Number sentences" in K–2),
**Assumptions**, and a **Step-by-step** walkthrough. Under them, **Refresh** (the lessons to
review first) sits right above the related lessons. Content lives in
`src/data/modules/`. This guide is the standard every module is written and reviewed against.

## Standards

### 1. Accurate

- Formulas, rearrangements, units and constants are correct. Check every number in the worked
  example by hand.
- Variable ranges (`min`/`max`) are realistic for the lesson and never exclude a normal answer.
  For example, if the legs can be 12, the hypotenuse must be allowed past 12.
- Assumptions are true, and they are the conditions the formula actually needs.
- Vocabulary and notation match what students see in class at that level (Common Core for K–12
  math, NGSS for K–12 science, standard textbooks for college).

### 2. Most helpful for the student

- Assumptions say when the formula applies and what could trip the student up, not trivia.
- The worked example uses realistic, easy-to-check numbers.
- Step explanations say _why_ the rearrangement works in one sentence ("Divide both sides by
  the width"), not just what to type.
- Include the relations students actually use together, so any sensible set of inputs solves the
  rest. Don't add formulas that aren't part of the lesson.
- Order `startWith` so the value students most often solve for comes first. When a student types
  a new value, the oldest input is the one recalculated. For example, typing f(x) should move x,
  not the function's constants.

### 3. Simple and concise

- 2–4 assumptions, one line each where possible (about 20 words or fewer).
- Reading level fits the grade. Kindergarten through Grade 2 uses short, concrete words.
- Variable names are 1–3 words. Symbols are the ones the lesson uses.
- Nothing is explained twice across sections.

### 4. The best representation, not just one that works

Pick the picture a teacher would draw on the board for _this_ lesson. It should make the key idea
visible, and every value it shows must be a module variable, so moving it updates the formulas.
Label every value in the picture with the same letter or symbol the formulas use (`B = 11`, or a
name with its symbol, "Bigger amount (B)"), so students can match the picture to the formulas.
Use `rep.label(id)` and `rep.tag(id)` in picture components.

Letters standing for numbers start in Grade 6 (6.EE.2). Kindergarten through Grade 5 pages
show no letters anywhere (inputs, pictures, formulas, steps): values are named in words
("Bigger amount: 11"), and Grades 3–5 read each rule in words under its number sentence
("Length × width = area") and write equations with the name ("Area = 4 × 3"). In K–2, "="
appears only inside number sentences such as 8 + 5 = 13. The shared helpers do this for you: there `rep.label(id)` gives just the
value, `rep.tag(id)` just the name, and `rep.named(id)` a standalone "Name: value"; write any
other picture text with `rep.early` in mind.

| Lesson idea                                | Representation                                                   |
| ------------------------------------------ | ---------------------------------------------------------------- |
| Counting, adding/subtracting small numbers | Counters or number line (jumps)                                  |
| Place value                                | Base-ten blocks (hundreds, tens, ones)                           |
| Comparing quantities, data categories      | Bar chart / picture graph                                        |
| Fractions                                  | Fraction bar or partitioned shape                                |
| Percent                                    | 10 × 10 grid                                                     |
| Area / perimeter / volume                  | The shape with unit squares or cubes                             |
| Angles, circles, triangles                 | The geometric figure with labeled parts                          |
| Time                                       | Clock face                                                       |
| Measurement / length                       | Ruler or scale                                                   |
| Money                                      | Coins and bills                                                  |
| Functions and rates                        | Graph with the point, slope or area that matters                 |
| Growth over steps                          | Table of values (and/or graph)                                   |
| Forces, motion                             | Free-body or motion diagram                                      |
| Circuits                                   | Circuit diagram or I–V graph                                     |
| Processes with no formula                  | Labeled diagram or table, with a counting model if one is honest |

The kinds built so far, what each shows and the options each takes, and the art direction are
listed in `docs/PICTURES.md` (open it when choosing or proposing a picture; every kind has a
page at `/gallery`). If no kind fits, add a new one in `src/components/module/reps/` rather than
forcing an existing one: its spec in `types.ts`, a case in `reps/index.tsx`, a name in
`meta.ts`, its variables in `modules.test.ts`, a check in `harness/pictures.ts`, and a lesson
that uses it, or a gallery demo until one exists.

**Sliders.** Not every picture needs them. A slider row appears only for kinds where sweeping a
value teaches something the input boxes can't and the picture has no handle or tap of its own
(`src/components/module/sliderPolicy.ts`: fraction bars, the fraction and whole-number area
models, partitions, rectilinear shapes, the pie chart and unit cubes). Everything else has the input boxes and the picture's own touch controls. A module
can set `sliders: true | false` to override its kind; `docs/SLIDERS.md` lists every page.

**Equation inputs.** When the problem is one number sentence or equation, the boxes go in the
equation itself (`equation: '{p}x + {q} = {r}'`), written exactly as the lesson writes it. Keep
rows for measurements whose unit can change, pages about a picture, two directions or several
steps, and named story roles. The rules, the syntax and every page's choice:
`docs/EQUATION_INPUTS.md`.

## Written work in the step-by-step

The walkthrough shows the work a student at that grade writes, the way a teacher sets it out:

- **K–2**: number sentences and counting lines ("Count on from 3: 4, 5, 6, 7"); from Grade 2,
  a column sum or difference with the carries and regrouped digits marked, beside the jumps
  the number line shows.
- **Grades 3–5**: the number sentence, then the rule in words ("Length × width = area"), then
  the work on paper with the value named in words ("Area = 4 × 3"): column addition
  and subtraction, partial products and the long-division bracket (Grade 4 on). Running totals
  ("300 + 70 = 370") are left out when the columns show them; lines with words ("Tens: 40 + 30
  = 70") stay as the thinking behind the columns.
- **Grade 6 on and college**: the rule in letters, the rearrangement, the numbers put in, then
  one line per stage of simplifying in the order of operations (`c = √(3² + 4²)`,
  `c = √(9 + 16)`, `c = √25`), and the answer with its unit.

The grids and chains come from the engine (`src/data/modules/written.ts`, `simplify.ts`), so a
module only writes its `expr`, `how` and any `work` lines of its own. `autoWritten` picks a grid
for a plain arithmetic line by grade and by whether a student would do it in their head (no grid
for 30 + 20, 40 × 6 or 360 ÷ 4); a step can name its own grid (`written: (v) => longDivision(v.n,
v.d)`) or refuse one (`written: false`, as on the change-making pages, where counting up coins
is the lesson). The simplifying chain appears only where a step has no work lines or grid and
its expression has two or more operations. The dump prints each grid boxed under its step, and
the harness checks the equation a grid says against the step's answer.

## Units

- Give each variable its formula unit (`unit`) from the registry in `src/engine/units.ts`, e.g.
  `cm`, `g/cm³`, `m/s²`. Labels that aren't convertible (`%`, `per 1,000`, `years`) stay fixed.
- Students pick Metric or US customary for the module and any unit within that system for each
  value (m, km, ft, mi, …), or Mixed to use both systems together. The calculator converts. If the formulas hold directly in the chosen units, the steps
  are worked in them; otherwise the step-by-step converts to the formula's units first and
  converts the answers back.
- Ranges on physical quantities are physical limits and don't change with the unit.
- Whole-number lesson values (`integer: true`, e.g. Grade 3 side lengths) keep their number when
  the unit changes (4 cm → 4 in). In those modules, length, area and volume units change together
  (m → m²), and Mixed isn't offered.

## Module layouts

A lesson whose idea is a quantity relationship is a calculator (values, relations, a picture, a
walkthrough). When the numbers are incidental to what the lesson teaches, it is a layout page:
a **sort** (cards into groups), a **sequence** (stages in order), an **explore** (a figure with
scenes) or an **observe** (a quantity recorded over time). A skill id or problem-type id is one
or the other, never both. The catalog of layouts and of every explore, observe and card figure
is `docs/LAYOUTS.md`; open it when writing or proposing a layout page.

## Topics without a natural formula

Use the simplest honest quantity model (counts, totals, rates, percentages) so the calculator
still teaches something true. If no quantity model is honest, say so in review and show only
the assumptions and a table or diagram.

## Planning a grade

1. `node scripts/plan-brief.mjs --grade 8 --subject m` writes `.review/plans/m.8/brief.md`: the
   skill rows, the pictures already drawn for them with their exact fields, the textbook units
   per skill, the released questions and the plan format.
2. Launch one `lesson-reviewer` agent with: "Write the direction plan for math grade 8. Read
   `.review/plans/m.8/brief.md` and follow its plan format; write `.review/plans/m.8/plan.md`."
   The brief replaces the guide, the taxonomy, the gallery files and the crosswalk; the compact
   format (40–60 lines a skill) finishes in one pass. One agent per grade and subject.
3. Build from the plan: `node scripts/promote-demo.mjs g.<demo> <page id> ["Title"]` copies a
   drawn picture's demo into the grade file as the page's start; `pnpm new-module` scaffolds a
   page with no demo. Test each page by its id as you go.

## Review process (required for every new or changed module)

1. **Tests while building:** `MODULE_IDS=<prefix> pnpm test src/data/modules` after each page
   (the module, standards, layouts and sampling suites for that page). Before a push,
   `node scripts/ci-test.mjs` runs the cheap suites only; the heavy ones (modules, sampling)
   run once a day on the nightly CI run, and what it finds is fixed the next day. No broader or
   deep runs while building or fixing; only the review evidence samples deeply. What the tests enforce (reading level and notation by grade,
   formatting, value counts, every rearrangement and walkthrough, every step line the harness
   can read, layout data, the picture tracker) is listed in each test file's header; a new
   phrase in step text is taught to `PHRASES` in `harness/evaluate.ts`, a new picture kind gets
   a check in `harness/pictures.ts`.
2. **Lesson evidence, then the lesson reviewer:** as soon as the tests pass,
   `node scripts/review-evidence.mjs --prefix <ids or prefixes> --stage lesson [--changed]`
   writes `.review/dump.txt` (definitions and walkthroughs), `.review/harness.txt` (deep
   sampling) and `.review/questions.md`, with no build or browser. `--changed` keeps only the
   pages whose definition changed since the last run. Then `lesson-reviewer`
   (`.claude/agents/lesson-reviewer.md`) reads them: accuracy, layout fit, split or merge, step
   clarity, language, exam and curriculum coverage. Fix its findings first: they change text
   the page reviewer would otherwise look at twice.
3. **Page evidence, then the page reviewer:**
   `node scripts/review-evidence.mjs --prefix <ids> --stage page [--changed]` builds the web
   export for the pages in scope only when `dist/` is stale (10 s, not minutes), takes the
   screenshots with the layout checks (text-only sorts and sequences skipped), the scenes and
   drags for picture kinds not dragged before, and the contact sheets, and writes
   `.review/evidence.md`. Then `page-reviewer` (`.claude/agents/page-reviewer.md`) reads them
   and runs one browser session: classroom use, tutoring, layout, art, interaction. It fixes
   small layout issues itself. `--edges` on either stage is an edge-case review (fewer samples,
   most at the boundaries; the dump walks every opening value at each end).
4. **Fix or answer every finding.** Record findings you intentionally don't act on, with the
   reason, in the commit message.
5. **Improve the engine.** Turn each finding the engine or its tests could have prevented into
   a shared helper, a test, a harness check or a picture feature before the next section, and
   log it in `docs/ENGINE_LOG.md`.
6. **Improve the reviewers.** Take out of the reviewers' instructions what is now automated,
   add what they missed or over-reported, add missing evidence to `review-evidence.mjs`, and
   log it with the review's token cost in `docs/REVIEW_LOG.md`.
7. **Slider check** when a section adds sliders: `NODE_PATH=$(npm root -g) pnpm sliders -- [ids]`
   after a build taps and drags every slider and reports in `.review/sliders.md`.

The full web build (`pnpm build:web` with no `PRERENDER_PREFIX`) and `pnpm verify:ssr` stay for
CI and releases; a review build renders only its pages, so don't deploy `dist/` from one.

The reviewers use `scripts/review-shots.mjs` and the Playwright installed in the dev container
(`NODE_PATH=$(npm root -g)`), not a project dependency.

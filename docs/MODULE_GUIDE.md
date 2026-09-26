# Module content guide

Each problem type is its own module and page (`<skill id>~<slug>`, listed under its skill);
there are no switchers between modules.

Every skill and course topic ("module") has four sections, shown in this order after Refresh: a
**table, chart or diagram**, **Formulas** (live calculator; "Number sentences" in K–2),
**Assumptions**, and a **Step-by-step** walkthrough. Content lives in
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

Kindergarten through Grade 2 pages show no letters anywhere (inputs, pictures, formulas, steps):
values are named in words ("Bigger amount: 11"), and "=" appears only inside number sentences
such as 8 + 5 = 13. The shared helpers do this for you: there `rep.label(id)` gives just the
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

Kinds built ahead of the sections that need them (see them at `/gallery`, one page per kind,
with a demo module each in `src/data/modules/gallery.ts`; the gallery is not in the taxonomy,
search or the sitemap, but the module tests and the harness run over it):

| Kind               | Shows                                                                 | For                                 |
| ------------------ | --------------------------------------------------------------------- | ----------------------------------- |
| `doubleNumberLine` | two lined-up number lines, a mark joining a reading on each           | conversions, ratios, rates, percent |
| `coordinatePlane`  | a point to drag; a second point with the line and a rise/run triangle | Grade 5 points, Grade 6–8 slope     |
| `boxPlot`          | the five-number summary on a number line, each mark draggable         | Grade 6 statistics                  |
| `pieChart`         | wedges by percent (or counts of a total)                              | percent, data in science            |
| `fractionArea`     | a square cut in columns and rows, the overlap of two fractions        | Grade 5 fraction × fraction         |
| `unitCubes`        | a box of unit cubes drawn in layers                                   | Grade 5 volume                      |
| `placeValueChart`  | digits in labelled columns, the point between ones and tenths         | Grade 5 decimals and powers of ten  |
| `factorTree`       | a number split down to circled primes                                 | Grade 4 primes, Grade 6 GCF and LCM |
| `protractor`       | both scales, an arm to drag                                           | Grade 4 measuring angles            |
| `wave`             | crests and troughs with wavelength (and amplitude) marked             | Grade 4 and 8 waves, physics        |
| `punnettSquare`    | two parents' alleles and the four offspring boxes                     | Grade 7 heredity, biology           |

If no existing representation fits, add a new kind in `src/components/module/reps/` rather than
forcing an existing one. A new kind gets: its spec in `types.ts`, a case in `reps/index.tsx`,
a name in `meta.ts`, its variables in `modules.test.ts`, a check in `harness/pictures.ts`,
and a lesson that uses it, or a gallery module until one exists.

**Sliders.** Not every picture needs them. A slider row appears only for kinds where sweeping a
value teaches something the input boxes can't and the picture has no handle or tap of its own
(`src/components/module/sliderPolicy.ts`: fraction bars, the fraction and whole-number area
models, partitions, rectilinear shapes, the pie chart and unit cubes). Everything else has the input boxes and the picture's own touch controls. A module
can set `sliders: true | false` to override its kind; `docs/SLIDERS.md` lists every page.

## Written work in the step-by-step

The walkthrough shows the work a student at that grade writes, the way a teacher sets it out:

- **K–2**: number sentences and counting lines ("Count on from 3: 4, 5, 6, 7"); from Grade 2,
  a column sum or difference with the carries and regrouped digits marked, beside the jumps
  the number line shows.
- **Grades 3–5**: the number sentence, then the rule, then the work on paper: column addition
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

Every module today uses the **calculator** layout: values, relations, a picture, a
walkthrough. That fits a lesson whose idea is a quantity relationship. When the numbers are
incidental to what the lesson teaches, forcing them into a calculator gives a page that is true
but beside the point. The lesson reviewer's check L names the better layout from this catalog;
the engine builds a layout when a section needs it (log it in `ENGINE_LOG.md`).

| Layout     | Teaches                                                                                    | Page                                                                                    | Status     |
| ---------- | ------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------- | ---------- |
| calculator | a relationship between quantities                                                          | picture, numbers, formulas, walkthrough                                                 | built      |
| sort       | putting things into groups by a property (materials, shapes, changes you can undo)         | cards tapped into labelled groups, a count per group, one sentence about the property   | built      |
| sequence   | stages in order and how long each takes (life cycles, a day, a story problem's steps)      | stages tapped into order, each with its span, the spans added under the strip           | built      |
| compare    | two things side by side and what differs (two habitats, two beaks, two shadows)            | the calculator's compare pictures (rows, bars, rulers, thermometers) with a result line | calculator |
| observe    | a quantity recorded over time (plant height by week, temperature by hour, a weather chart) | a bar per column tapped to a height, the table, the pattern in a sentence               | built      |
| explore    | an idea with no honest quantity (what light does through a mirror, why shadows form)       | a figure (parts, position, clock, dots, magnets, flashes) with scenes to switch         | built      |

A layout page is data in `src/data/modules/layouts/` (`math.ts`, `science.ts`; types in
`types.ts`): a sort lists its bins and cards, a sequence its stages and spans, an exploration
its figure and scenes, an observation its columns and pattern sentence. The components in
`src/components/module/layouts/` draw any of them; never put a lesson's words in a component.
A skill id or problem-type id is either a calculator module or a layout page, never both
(`getPage`). `layouts.test.ts` checks the page belongs to a skill, fits together (every card
has a group, every scene fits the figure) and reads at the grade level. A review proposal
names the layout and gives its data; a new figure kind is engine work (log it).

## Topics without a natural formula

Use the simplest honest quantity model (counts, totals, rates, percentages) so the calculator
still teaches something true. If no quantity model is honest, say so in review and show only
the assumptions and a table or diagram.

## Review process (required for every new or changed module)

1. **Automated checks:** `pnpm test`. Every value must connect to the others through the
   formulas; a separate group of values means two lessons (split it) unless the module lists it
   in `standalone` with a reason. These check that each module matches the taxonomy, that the
   example satisfies every formula and range, that every rearrangement agrees with its formula and
   has an explanation, that every input combination reproduces the example, and that the
   walkthrough balances. Two tests carry the reviewers' own expectations, so a section meets
   them before the review starts:
   - `standards.test.ts` reads everything a student sees (assumptions, names, number
     sentences, the walkthrough from the example, titles and `use` lines) and enforces the
     reading level for the grade, notation the grade has met (no letters or "=" outside a
     number sentence in K–2, no × and ÷ or fractions before Grade 3, no negatives before
     Grade 6), no shorthand ("incl.", "e.g.") or jargon, formatting (true minus, curly
     quotes, no "1 tens", thousands separators), sentence punctuation and how many values a
     grade can hold.
   - `sampling.test.ts` runs random inputs, edit sequences and unit choices through the solver
     and the step builder, evaluates every step and check line, and fails on any line it can't
     read or that two steps share: when you write a new phrase or picture kind, teach the
     harness (`PHRASES` in `harness/evaluate.ts`, the picture checks in `harness/pictures.ts`)
     as part of the module.
   - Values that a lesson names (`allowed: [5, 10, 100]`) and working values nobody types
     (`derived: true`) are declared on the variable; the solver, sliders, harness and dump
     respect both.
   - `layouts.test.ts` covers the sort, sequence, explore and observe pages.
2. **Evidence, gathered once with no model involved:**
   `pnpm build:web && node scripts/review-evidence.mjs --prefix <ids or prefixes>`. It writes
   `.review/dump.txt` (every module's definition and the walkthroughs a student reads, from the
   opening values, from each other value as the unknown and at two range edges; layout pages'
   text), `.review/harness.txt`, `.review/shots/` (screenshots with the layout checks:
   sideways scroll, overlaps, K–2 letters, one-screen fit, cut-short slider text, small tap
   targets), `.review/sheets/` (one page per picture kind, 9 per sheet) and
   `.review/evidence.md` (the index, each page's picture kind and controls, and everything the
   scripts flagged).
3. **Two reviewers, in parallel, each reading only its own evidence:**
   - `lesson-reviewer` (`.claude/agents/lesson-reviewer.md`) reads the dump and the harness
     report: accuracy, **layout fit** (is a calculator how this lesson is taught? if not, which
     layout from the catalog above), split or merge, step clarity, language, plain language,
     exam and curriculum coverage. It fixes harness gaps and text formatting itself.
   - `page-reviewer` (`.claude/agents/page-reviewer.md`) reads the screenshots and runs one
     browser session: classroom use, tutoring, layout, formatting and the picture's
     interaction. It fixes small layout and formatting issues itself.
     Each keeps resumable notes in `.review/` and ends its report with an **Engine** section and
     a **Reviewer** section.
4. **Fix or answer every finding.** Record findings you intentionally don't act on, with the
   reason, in the pull request or commit message.
5. **Improve the engine.** Turn each finding the engine or its tests could have prevented into
   a shared helper, a test, a harness check or a picture feature before the next section, and
   log it in `docs/ENGINE_LOG.md`.
6. **Improve the reviewers.** Take out of the reviewers' instructions what is now automated,
   add what they missed or over-reported, add missing evidence to `review-evidence.mjs`, and
   log it with the review's token cost in `docs/REVIEW_LOG.md`.
7. **Visual check:** open each module and confirm the representation reads well at phone width,
   in light and dark mode.
8. **Slider check:** `NODE_PATH=$(npm root -g) node scripts/test-sliders.mjs [--prefix m.4.]`
   after `pnpm build:web` taps and drags every slider on every module page and fails on one
   that doesn't move, goes blank, leaves its range, disagrees with its input box, or throws.
   The report is `.review/sliders.md`.

The reviewers use `scripts/review-shots.mjs` and the Playwright installed in the dev container
(`NODE_PATH=$(npm root -g)`), not a project dependency.

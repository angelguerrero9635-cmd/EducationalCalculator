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

If no existing representation fits, add a new kind in `src/components/module/reps/` rather than
forcing an existing one.

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
   walkthrough balances.
2. **AI review:** run the `section-reviewer` agent (`.claude/agents/section-reviewer.md`) on the
   new or changed modules. It gathers the evidence once (a walkthrough dump, the sampling
   harness, screenshots and one browser session) and checks every module from eleven points of
   view:
   - **A. Accuracy:** re-derives the math, units, ranges and assumptions, and the four
     standards above (accurate, helpful, concise, the best picture).
   - **B. Sampled inputs:** runs and extends `src/data/modules/__tests__/sampling.test.ts`
     (`MODULE_IDS=m.2. SAMPLING_REPORT=1 pnpm test sampling`): random inputs, edit orders and
     unit choices through the real solver and step builder, and whether the values fit the
     lesson.
   - **C. Split or merge:** one idea, one model and one picture per module.
   - **D. Step-by-step clarity:** no leaps, hidden conversions or answers before the work.
   - **E. Language:** reading level, concreteness, consistent terms and notation for the grade,
     including titles and fixed UI text.
   - **F. Exam coverage:** common test question types, unknowns in every position, a diagram
     that matches a real item, and pictures that are interactive both ways.
   - **G. Textbook coverage:** every section of widely used curricula has a page.
   - **H. Classroom use** and **I. Tutoring:** a short lesson plan and a one-on-one session,
     and everything that would stall either.
   - **J. Layout and formatting:** spacing, overlaps, tap targets, dark mode and number, unit
     and punctuation formatting.
   - **K. Words or formula:** where plain words teach better than a formula at the grade (a
     rule said as a sentence, no letters or symbols the grade hasn't met), and where the number
     sentence is the better choice.

   It fixes small layout, formatting and harness issues itself and reports the rest in one
   report grouped by skill.

3. **Fix or answer every finding.** Record findings you intentionally don't act on, with the
   reason, in the pull request or commit message.
4. **Visual check:** open each module and confirm the representation reads well at phone width, in
   light and dark mode.

The reviewer keeps running notes in `.review/section-reviewer.md` (git-ignored), so a review
that is interrupted can continue. It uses `scripts/review-shots.mjs` and the Playwright installed
in the dev container (`NODE_PATH=$(npm root -g)`), not a project dependency.

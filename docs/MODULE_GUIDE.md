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
2. **Independent AI review:** run the `module-reviewer` agent (`.claude/agents/module-reviewer.md`)
   on the new or changed modules. It rechecks the math independently and reviews every module
   against the four standards above.
3. **Exam coverage:** run the `exam-coverage-reviewer` agent
   (`.claude/agents/exam-coverage-reviewer.md`). It collects the common test question types for
   each skill or topic and checks the module can solve every one (unknowns in every position,
   the quantities and ranges tests use), recommends diagrams borrowed from test items, and
   proposes new modules when a common question type needs a different model.
4. **Variable sampling:** run the `variable-sampling-reviewer` agent
   (`.claude/agents/variable-sampling-reviewer.md`). It samples random inputs, edit orders and
   unit choices through the real solver and step builder, and checks the math, ranges, step text
   and that the variables and formulas fit the lesson. Its harness is kept as
   `src/data/modules/__tests__/sampling.test.ts` (`MODULE_IDS=m.2. pnpm test sampling`).
5. **Split check:** run the `module-split-reviewer` agent
   (`.claude/agents/module-split-reviewer.md`). It flags modules teaching two ideas, with too
   many variables for the grade, or with a picture that shows only part of the formulas, and
   proposes splits into `<skill>~<slug>` modules (or merges).
6. **Language check:** run the `module-language-reviewer` agent
   (`.claude/agents/module-language-reviewer.md`). It checks reading level, concreteness,
   cognitive load, consistent terms and notation readiness for the grade, and gives exact
   rewrites.
7. **Step clarity:** run the `step-clarity-reviewer` agent
   (`.claude/agents/step-clarity-reviewer.md`). It reads the real step-by-step walkthroughs as a
   student would and flags steps that jump to the answer (words standing for arithmetic, hidden
   conversions, collapsed operations), proposing `work` lines that show the arithmetic.
8. **Teacher:** run the `teacher-lesson-plan-reviewer` agent. It plans a short lesson around
   each module and reports what helps or gets in the way in a classroom.
9. **Tutor:** run the `tutor-walkthrough-reviewer` agent. It scripts a one-on-one session showing
   a student how to use each module and flags anything hard to understand for either of them.
10. **Textbook coverage:** run the `textbook-coverage-reviewer` agent. It maps the sections of
    widely used textbooks for the grade or course to modules and lists sections with no module.
11. **Fix or answer every finding.** Record findings you intentionally don't act on, with the
    reason, in the pull request or commit message.
12. **Visual check:** open each module and confirm the representation reads well at phone width, in
    light and dark mode.

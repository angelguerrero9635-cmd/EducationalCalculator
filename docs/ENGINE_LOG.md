# Engine log

After every section review, the findings that the engine (solver, step builder, shared
helpers, pictures, tests, harness) could have prevented are turned into engine work before the
next section is written, so each section starts from a better engine than the last. One entry
per review; each line names the finding and what the engine now does about it.

## K–3 math and science (Sections 1, 2 and 6, second review)

Four reviewers (lesson and page, math and science) on 173 pages. What the engine now does:

- Lessons whose idea is a sort, a sequence, an idea with no honest quantity, or a quantity over
  time were forced into a calculator (22 pages named across both subjects). → Four layouts
  built: `sort`, `sequence`, `explore`, `observe` (`src/data/modules/layouts/`, components in
  `src/components/module/layouts/`), all content in data; a page is either a calculator module
  or a layout page (`getPage`). `layouts.test.ts` checks each one belongs to a skill, fits
  together and reads at the grade level; the dump prints layout pages for the lesson reviewer.
- Ranges admitted values the lesson forbids (count by 7s, 7¢ coins, thirds on the halves page,
  1 or 3 right angles) and the harness solved from working values nobody types (the ones with
  the ten, an estimate's parts, a prism's faces). → `VariableDef.allowed` (the solver rejects
  the rest, sliders snap to the nearest, the harness samples them and tests a value between)
  and `VariableDef.derived` (a read-only box; the harness, the dump and the combination test
  never start from it).
- Known facts within 10 × 10 were broken apart (8 × 3 = 5 × 3 + 3 × 3); division past ten
  counts listed fifteen terms. → `timesWork` counts by for times ≤ 10; `divideWork` uses the
  fact past ten counts.
- The count-on helper silently started from the second addend. → `addStrategy` says it
  ("Start with the bigger number, 9." within 20; "Start with the bigger number: 57 + 43." to
  100).
- Compare lines skipped the places that tie; K compare pages gave the difference before
  saying which is more. → `compareLine` names ties first ("Hundreds: 3 = 3. Tens: 4 < 7, so
  347 < 374"); `difference()` takes `compareWords` and says "7 is more than 4" before counting
  on; K–2 drops the bare subtraction line when a compare line leads.
- The same line appeared in two steps (the expanded form for tens and ones; pairing lines on
  even/odd), and a bare "35 + 20" preceded "35 + 20 = 55". → `buildSteps` shows a line once
  per walkthrough and drops a bare line the first work line repeats, a K–2 three-term line,
  and (Grades 3–5 too) a wordy line the work lines replace; the harness fails a line shown in
  two steps.
- Comparison notes said the obvious ("the warmest month is warmer"). → `apart()` drops its
  parenthetical when a name contains the comparing word's stem, and takes a replacement.
- `moreThan` was called with the wrong grade mode; three Grade 2 pages counted by ones. →
  Still by hand (a flag), now with a custom difference line; still open: derive the mode from
  the module id.
- A false assumption said the numbers shrink in inches (whole-number lengths keep their
  number); K names used letters ("Pencil A"). → `standards.test.ts` fails an assumption that
  mentions the units menu and a K–2 name with a lone capital letter.
- A hundred chart's marks could run past the chart. → `modules.test.ts` requires every mark's
  range to fit the chart. Bars and rulers grow to fit and stay as they are.
- Base-ten pictures drew the number's digits, not the typed tens and ones, on regroup pages.
  → `baseTen.places` draws the counts, each full ten of cubes boxed.
- A refused number vanished from its box; thermometers had a slider row that repeated the
  tube; ten-frame legends repeated the slider names; picture-graph icons were 32 px; a K hop
  said "−2"; captions joined with "·" ran on; five sliders wrapped. → All fixed in the page
  components (commit "science lesson fixes and page fixes").
- Reviewers judged one-screen fit, slider truncation and tap targets by hand. →
  `review-shots.mjs` measures the span from the picture header to the first input row (flag
  over 844 px at 390 wide), flags slider text cut short and picture tap targets under 36 px,
  and prints each page's controls; `review-evidence.mjs` adds a per-page picture-kind and
  controls index and contact sheets (one page per picture kind, 9 per sheet). The dump prints
  every other value as the unknown and two boundary samples per module.

Findings recorded but not acted on, with the reason: keeping the example's other values faded
when the first box is typed (the example leaves by design, and the science page reviewer found
that clear); `m.K.count-100` starting only on a ten (tapping any chart number and counting on
by tens is in the K curricula we map); capping the Grade 1 compare difference at 20 (the
count-up shows the tens jump); one relation for elapsed time setting hour and minutes
together (the two-relation model keeps every unknown solvable); a table picture for
arithmetic patterns and a second rectangle on the same-perimeter page (picture work for the
next section); merging money change/more-needed, the four two-step pages and the two compare
pages (each keeps a distinct use line); sharing the fractions helper with the quarter-inch
page.

## Science K–3 (Section 6, first review)

- Two comparison helpers wrote "The today is warmer" and "the long-beaked birds is more": names
  were pasted into a sentence template with no grammar check. → The comparison helpers now live
  in `helpers.ts` with the sentence shapes in one place; the standards test's sentence checks
  run over their output. Still open: a check that a name used as a sentence subject is
  singular.
- Grade 1 equal groups were explained with skip counting and sharing (Grade 2 methods). → The
  `groupsOf` helper has a K–1 mode that adds one group at a time; sections choose the mode.
- The check line skipped plural agreement ("1 pushes of 1 spaces"). → Check lines go through
  `agree()` like every other line.
- Comparison pages drew the two amounts but not the difference. → Pictures that don't draw a
  value list it in `pictureLabels`; the harness flags a value neither drawn nor labeled.
- Table headers showed bare letters in Grade 3. → `ValueTable` headers use the grade's label
  form.
- Thermometers: a "?" reading started at 1 °F; the 32 °F freezing mark was missing. → Sliders
  start beside the other reading; thermometers take `marks`.
- The main lesson was sometimes a side quantity, with the standard's investigation as a
  problem type. → No engine change; a lesson-reviewer check ("L. Layout fit") now asks whether
  the calculator layout is how the lesson is taught, with a catalog to propose from.
- Reviewer time went to writing dump and browser scripts. → `scripts/review-evidence.mjs` and
  `dump.review.test.ts` produce the evidence with no model involved.
- The science files each carried their own copies of sum, groups, comparison and times
  helpers. → Moved to `src/data/modules/helpers.ts`, shared by every section from here on.

# Engine log

After every section review, the findings that the engine (solver, step builder, shared
helpers, pictures, tests, harness) could have prevented are turned into engine work before the
next section is written, so each section starts from a better engine than the last. One entry
per review; each line names the finding and what the engine now does about it.

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

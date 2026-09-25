# Review log

After the fixes from a section review are done, the reviewers themselves are improved: checks
that are now automated come out of their instructions, findings they missed or over-reported
become new lines in their checklists, and the evidence they lacked is added to the evidence
script. One entry per review, with the token cost, so the next review is cheaper and sharper.

## Science K–3 (Section 6): one section-reviewer, 44 modules

- Cost: about 209k tokens, 67 tool calls, 19 minutes, after a container restart lost the first
  run (it resumed from its notes).
- Where the tokens went: writing its own dump test and browser script, reading the whole dump
  twice, and opening screenshots for pages the scripts had not flagged.
- Missed: nothing found afterwards. Over-reported: nothing.
- Right calls the checks didn't ask for: that a lesson's quantity was invented (vibrations per
  second), that a main lesson was a side quantity, that lakes and rivers aren't landforms.
- Changes made:
  - Split into `lesson-reviewer` (text: dump and harness only) and `page-reviewer`
    (screenshots and one browser session only), run in parallel, so neither reads the other's
    evidence. Screenshots were the largest input and now reach one reviewer.
  - `scripts/review-evidence.mjs` gathers the dump, harness report, screenshots and an index
    with no model involved; the reviewers start from `.review/evidence.md`.
  - The dump is a permanent test (`dump.review.test.ts`) that prints the walkthroughs exactly
    as the page shows them, from the opening values and from each other value as the unknown.
  - Removed from the reviewers: reading level, notation by grade, formatting, evaluable steps
    (enforced by `standards.test.ts` and the harness).
  - Added to `lesson-reviewer`: "L. Layout fit" with the layout catalog in `MODULE_GUIDE.md`;
    "is the model the one a teacher would use for this standard?" under A; an **Engine** and a
    **Reviewer** section in every report, so the two logs are filled from the report.
  - Both reviewers keep resumable notes in `.review/` and have token budgets in their text.

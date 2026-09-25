# Review log

After the fixes from a section review are done, the reviewers themselves are improved: checks
that are now automated come out of their instructions, findings they missed or over-reported
become new lines in their checklists, and the evidence they lacked is added to the evidence
script. One entry per review, with the token cost, so the next review is cheaper and sharper.

## K–3 math and science: two lesson-reviewers and two page-reviewers, 173 pages

- Cost: lesson-reviewer science 98k tokens (22 tool calls, 9 min); page-reviewer science 96k
  (39 calls, 11 min); page-reviewer math 116k (43 calls, 13 min); lesson-reviewer math 201k
  (39 calls, 15 min). About 511k tokens for 173 pages, 3k per page, against 209k for 44 pages
  (4.8k per page) in the first science review, with more found per page.
- Where the tokens went: the math lesson review read 118 dumps one skill at a time (the
  largest run); the page reviews built contact sheets and browser scripts of their own.
- Missed: nothing found afterwards. Over-reported: layout proposals on pages whose calculator
  is honest (habitats, life cycles, the weekly rain chart), by their own account; fixed-number
  assumptions flagged eight times where one rule covers them.
- Right calls the checks didn't ask for: the false units-menu assumption; ranges that admit
  impossible inputs; working values the harness solved from; the regroup picture drawing
  digits; the duplicate slider row under thermometers.
- Changes made:
  - Both lesson reviewers now review layout pages too (the dump prints them), and a `[layout]`
    proposal names one of the four built layouts with its data (bins and cards, stages, scenes,
    columns), not just a catalog name.
  - `lesson-reviewer` may fix a plainly false or stale sentence in an assumption with an exact
    replacement (the instruction gap it reported), not only formatting.
  - `page-reviewer` no longer gets the harness report or builds contact sheets and control
    lists: `evidence.md` carries the per-page picture kind and controls, `sheets/` the contact
    sheets, and the scripts flag one-screen fit, cut-short slider text and small tap targets.
    Its browser notes: use `[data-testid^=pic-]` (RN-web Pressables have no button role) and
    `scrollIntoViewIfNeeded` before mouse events below the fold.
  - The dump shows every other value as the unknown and two boundary samples per module, so
    subtraction directions and edge behaviour are read, not inferred.
  - Removed from the reviewers: K–2 letter names, units-menu claims, repeated lines, chart
    marks past the chart (now tests).

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

# Review log

After the fixes from a section review are done, the reviewers themselves are improved: checks
that are now automated come out of their instructions, findings they missed or over-reported
become new lines in their checklists, and the evidence they lacked is added to the evidence
script. One entry per review, with the token cost, so the next review is cheaper and sharper.

## Owner request: better-quality images for every diagram type

- Before and after contact sheets were made for 70 picture kinds, in light and dark mode (one
  page per kind, the picture only).
- Two contrast problems came up and were fixed:
  - silver coins' numbers in dark mode (`coinInk` and `pennyInk` tokens);
  - the second tape color under light text (a darker `chartSecond` in dark mode).
- The page-reviewer gets check **R. Art (graphic designer)**, which points to "Art direction"
  in `MODULE_GUIDE.md`. It covers:
  - objects drawn as grey boxes;
  - shading on abstract diagrams;
  - text contrast on colored fills in dark mode;
  - handles lost on a fill;
  - colors that carry meanings the text never states;
  - hardcoded colors and gradient ids.

## Grade 6 math and science: two lesson-reviewers and two page-reviewers, 92 pages

- Cost: math lesson 219k tokens (57 calls, 11 min), science lesson 144k (32 calls, 8 min),
  math page 91k (58 calls, 9 min), science page 134k (111 calls, 14 min). About 588k for 92
  pages, 6k per page. The lesson reviewers had planned these pages first, so they checked the
  build against their own plans.
- Found and fixed: letters the plan did not allow (the coefficient and constant on the
  expressions pages; a page can now name the one letter it teaches); dividing fractions never
  wrote the division or checked by multiplying back; a two-quantities point that left its line;
  metric-only science pages still offering US units; rock types sorted by texture; a layer
  older than Earth; cards that named their own group; three figures that did not show their
  scene (cold front, continents, uplift).
- Reviewers: check Q (count or amount) was added mid-review after the owner's line-plot
  finding; both lesson reviewers ran it. The page reviewers asked for drag results and every
  explore scene in the evidence: the science page reviewer shot all 47 scenes itself, and the
  two-quantities error showed only in a browser drag. → Next: `review-evidence.mjs` should
  shoot every explore scene and drag every handle, printing the values after.
- Evidence gaps the lesson reviewers named: no walkthrough where a starting value is the
  unknown (find the whole, find the base); they read those from code.
- Left for later, now done: decimal multiplication set out by the standard algorithm with the
  points placed (2.35 × 1.4 → 3.290); the speed page in km or miles (the double number line
  spaces its lines from the two readings); net edges and face products (5 × 3 = 15); histogram
  bars that touch, with a count scale; the density column stacked in a jar from the bottom up;
  the graduated cylinder's levels dragged; each lit organ named on the body; weather-map front
  symbols and rain under a low; rain, droplets and a muted river in the water cycle; flow
  arrows in the mantle, "seen from above" and "continent" labels on the plates; every buried
  rock melting and rising in the rock cycle; a climate clue on Pangaea; and the smaller wording
  suggestions of both lesson reviewers.
- Evidence: `scripts/review-interact.mjs` (run by `review-evidence.mjs`) saves every scene of
  every exploration and drags every handle, writing the values before and after to
  `drags.md`.

## Owner finding: a count read as an amount (line plots, Grades 2–5)

- Missed by every review: the Grade 5 line plot of beakers labelled each count "At 1/8 L: 2"
  (it reads as 2 liters, not 2 beakers) and gave the total as "19" eighths of a liter where the
  question asks how many liters. The Grade 2, 3 and 4 line plots named their counts the same way
  ("One inch longer", "At 2 1/4 in") and Grade 4 reported its total and spread as bare eighths.
- Fixed: counts name what they count ("Beakers with 1/8 L", "Ribbons at 2 1/4 in", "Objects 1
  inch longer"); the Grade 5 total is in liters ("19/8 = 2 and 3/8 liters"); the Grade 4 total
  and spread read "32 eighths of an inch (4 inches)".
- Reviewers: a new check Q in both reviewers (what each value counts or measures; read the "we
  know" line, each answer and the picture labels as sentences). Automated: `standards.test.ts`
  fails a whole-number count named after a measurement ("At 1/8 L", "One inch longer").
- Sweep of every K–8 module's values (names, units, whole or not): no other count named like a
  measure or answer in pieces where a measure is asked.

## Science Grades 4–5: one lesson-reviewer and one page-reviewer, 39 pages

- Cost: lesson-reviewer 136k tokens (39 tool calls, 7 min); page-reviewer 95k (60 calls,
  11 min). About 231k tokens for 39 pages, 6k per page. The reviewer had planned these pages
  first (66k), so the review checked the build against its own plan.
- Missed: nothing found afterwards. Over-reported: an apple-sized newton note and an optional
  summer-time noon line (both small).
- Right calls the checks didn't ask for: `apart` on directional differences (found at the
  range edges); a fizz and a salt range past what chemistry allows; a sequence with two right
  orders; a card that fits three bins; a sort whose `why` lines give the answer; a Grade 5
  standard (5-ESS3-1) with no skill. Page side: dark-mode colour order on the Earth figure,
  particles on a line, a letter inside an SVG on a Grade 5 page.
- Changes made:
  - Six pages the reviewer asked for, and `s.5.protect-resources` in the taxonomy with a sort.
  - `page-reviewer`: shoot every explore scene in light and dark; a figure with day and night
    halves keeps night darker in both modes.
  - `lesson-reviewer`: check a build against its plan field by field; a directional difference
    uses `minus`; a sequence must have one right order and a card one right bin.
- Not done, recorded: a food-web figure for removing one species; a plan-versus-build report
  in the evidence; one grouped line for the harness's range-limit notes.

## Grade 5 math: one lesson-reviewer and one page-reviewer, 18 pages

- Cost: both reviewers were cut off by the session's rate limit before writing their
  reports (about 30 minutes each); their resumable notes in `.review/` carried every
  finding, and the fixes were applied from the notes. The notes format (done list, findings
  by skill, fixed list, remaining) is what saved the review: keep it.
- Missed: nothing found afterwards. Over-reported: the slider sweep flagged a slider the
  other values hold to one value; the page now shows it held.
- Right calls the checks didn't ask for: "bracket" for "parentheses" (the US word);
  numerator and denominator by Grade 5; the least common denominator instead of the
  product; skip-count lines below the grade; a decimal grid leaving a place blank; the
  place-value chart wrapping past five columns; point labels sitting on a rising line;
  a rhombus card drawn as a turned square; a table showing 1.0286 for a hundredths value.
- Changes made:
  - Pages the lesson reviewer asked for: add inside then divide, subtract decimals,
    multiply two decimals, a fraction of a whole number, triangles by their angles.
  - Engine lines in `docs/ENGINE_LOG.md`; the harness reads the least common multiple and
    "4 tenths × 3 tenths"; a check that a decimal grid writes every place.
  - `lesson-reviewer`: the grade's vocabulary (parentheses, numerator, denominator from
    Grade 5) and facts a grade knows (no skip-count lines from Grade 5) are checks.
  - `page-reviewer`: a held slider (dimmed, one value) is not a finding.
- Not done, recorded: a superscript rendering for exponents (10^2 shows the caret);
  typing a value that conflicts with two others blanks a derived box with no message;
  sort-card figures are small on a projector; the ~divide decimal page can show a
  non-terminating share to four decimals.

## Grade 4 math: one lesson-reviewer and one page-reviewer, 13 pages

- Cost: lesson-reviewer 74k tokens (15 tool calls, 8 min); page-reviewer 125k (66 calls,
  14 min). About 199k tokens for 13 pages, 15k per page: the page review built its own
  browser scripts and measured spans by hand after finding the scripts' anchor bug.
- Missed: nothing found afterwards. Over-reported: the seven one-screen flags were the
  scripts' fault, not the pages' (the page reviewer found and fixed the cause).
- Right calls the checks didn't ask for: values a picture sets that leave other typed boxes
  "?"; a prime that can't be typed; the reflex angle; captions that count a "?" value.
- Changes made:
  - `evidence.md` now carries where each page's height goes (picture → sliders → first
    input), and the shots script fails loudly when its header anchor is missing.
  - `page-reviewer`: Enter + 400 ms before reading a typed value; one non-example screenshot
    for each picture kind new in the section; grid cells are not tap-target flags.
  - `lesson-reviewer`: a range or fixed-number remark repeated across modules is one finding.
  - Pages the lesson reviewer asked for were built as problem types (12) and a sort page;
    both reviewers' engine lines are in `docs/ENGINE_LOG.md`.

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

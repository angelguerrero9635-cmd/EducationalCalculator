# Review log

After the fixes from a section review are done, the reviewers themselves are improved: checks
that are now automated come out of their instructions, findings they missed or over-reported
become new lines in their checklists, and the evidence they lacked is added to the evidence
script. One entry per review, with the token cost, so the next review is cheaper and sharper.

## Textbook coverage pass: units and lessons the programs teach that had no page

- Setup: two lists from `research/textbooks/toc/`: units whose skills map to nothing in the
  taxonomy, and, per skill, the lesson titles (most common first) against our pages' titles
  and use lines; no reviewer run. Most "unmapped" lessons only lacked a lesson-level tag and
  sit under a mapped unit, so the unit list is the real signal.
- Found: two whole units (Grade 5 unit conversion; Grade 4 multi-digit addition and
  subtraction), eight lessons most programs teach with no page, three open standards the
  textbooks confirm, and five Grade 6 science units with no skill in Grades 6–8.
- Not gaps: problems the solver already covers from the same page (the whole from a part and
  its percent, a missing side from the volume, a missing angle, start- and change-unknown
  word problems); those got a note in the page's assumptions or use line instead.
- Changes made: 6 skills and 27 pages (`TAXONOMY_ISSUES.md`, "Textbook coverage pass"). The
  harness learned "N rounded to the Ns" and "N rounded to the ones", and its affine check now
  probes off the integers, so a rounding relation isn't mistaken for a linear one (it had
  "solved" a rounded whole to 341.8).

## Textbook-language pass: every K–6 skill and page title against the textbooks

- Setup: one sheet per skill from `research/textbooks/toc/`: the skill's current title, each of
  its pages' title and use line, then the unit titles and lesson titles the eleven programs
  file under that skill (deduplicated, most common first); no reviewer run.
- Skill titles (the main page's title, from `taxonomy.ts`) moved to the unit name most programs
  share when one exists ("Compare numbers to 10", "Fluently add and subtract within 100",
  "Understand and use percent", "Statistical measures and displays"); science skills took the
  Amplify, FOSS and Inspire unit names where one fits ("Pushes and pulls", "Inheritance and
  traits", "Vision and light"). A title that names the standard more exactly than any unit
  stayed ("Add and subtract within 20", "Tell time to the hour and half hour").
- Page titles moved to the lesson title that teaches the page's problem type ("Solve compare
  problems", "Make 10 to subtract" stayed "Take from ten" since that is the page's strategy,
  "Two-step problems: add, then subtract", "Interpret remainders", "Multiplication as scaling",
  "Mixed measures"); science pages kept theirs, since the science programs publish units only.
- Rules that bit: a skill title may not repeat one first taught in an earlier grade
  (`validateTaxonomy`), so Grade 3 is "Compare fractions and find equivalent fractions" and
  Grade 4 "Fraction equivalence and comparison"; titles built by shared helpers
  (`shared/compare.ts`, the Grade 2 `twoStep`) are set there, not on the page.
- Changes made: 75 skill titles and 169 page titles; `meta.test.ts` and `verify-ssr.mjs` read
  the Kindergarten make-10 title; `research/questions/COVERAGE.md` and `research/textbooks/`
  regenerated from the taxonomy.

## Diagram redo review: three page-reviewers, 52 picture kinds

- Setup: every picture kind or explore figure the pictures chat has never redrawn (its branch's
  changed files against ours). Kinds no page uses and kinds it only extended were left out. For
  each kind, `.review/redo/brief-*.md` lists its source file, one or two screenshots at 390 px
  and every page that uses it: 61 screenshots, three reviewers of about 17 kinds each, about
  45k tokens each. The reports are in `.review/redo/report-*.md`.
- Found: all 52 need a redraw. 20 are urgent: flat clip-art where the standard asks for real
  materials (coins, balloon, body systems, fronts, plates, continents, vibration, cube trains,
  flashlight), or pictures that misstate the lesson. Examples: one hop of 30 on a "subtract
  tens" page; "above" drawn touching the box; colours that mean the wrong thing on the water pie.
  Explore figures are the weakest group: none of the `figures6.tsx` figures uses the paint
  helpers.
- Shared fixes: size a canvas from the values shown, not `spec.max`; keep explore scenes off
  the screen edge; one stroke and type scale for flat diagrams, with labels at `chart.value`,
  never below 12 px.
- Changes made: tracker entries Q01–Q52 (most urgent first) for the pictures chat, in
  `docs/RENDERINGS_ROUND_4.md`.
- Missed: seriesCircuit and waterfall were reviewed from source. The one-off screenshot script
  used for this review opened every id at `/skill/…`, and college topics live at
  `/course/<course>/topic/<n>`. `pnpm shots` already routes them; use it next time.

## K–6 diagram review: three lesson-reviewers (K–2, 3–4, 5–6)

- Setup: `.review/diagrams/pages-*.md`, one entry per page with:
  - its kind, title and use line;
  - its values and relations;
  - its picture spec and inputs;
  - its cards or stages, with or without a figure.

  Pages whose picture was just changed were marked to skip. About 100k tokens a reviewer.
  Reports are in `.review/diagrams/report-*.md`.

- Found:
  - 64 sort and sequence pages whose cards need pictures (real objects, organisms, events);
  - 37 picture changes;
  - 44 pages that should take their inputs where the sentence is written.
- Changes made:
  - 11 picture changes used kinds that already exist and were made here.
  - The other 90 are tracker entries D01–D101 for the pictures chat, in
    `docs/RENDERINGS_ROUND_3.md`.
  - 43 equation inputs were applied. The powers-of-ten one waits: the input can't show a fixed
    base of 10.

## Picture words on fraction division: focused lesson-reviewer pass

- Setup: the user's phone screenshot, the picture's code and the page; one lesson-reviewer,
  about 36k tokens, report only. All suggestions applied (engine log).
- Neither reviewer caught it before: the lesson-reviewer reads the dump (no captions) and the
  page-reviewer checked captions for wrapping only.
- Changes made: `lesson-reviewer` check E reads each picture label and caption against the
  use line's question (every fraction says what it is, the question's word for the whole, the
  one-part step shown); `page-reviewer` reads captions as the student would.

## Typeset formulas: focused lesson-reviewer pass

- Setup: `.review/latex/formulas.md` (every page's formula lines by kind, plain and as
  `toLatex` would draw them); one lesson-reviewer, about 50k tokens, report only.
- Found 7 converter faults and the band rules for each kind of line; all applied (engine log).
  It also found two content faults typesetting made stand out (4 0/6, the regrouping line) and
  a real bug in the plain text (3 × 4 written 34), fixed.
- Changes made: check T now covers the Formulas section and its three differences.

## Question-language pass: every K–6 title and use line against the released questions

- Setup: one table per grade (page id, title and use line, then up to 12 released question
  stems for the skill), made from the module list and `research/questions/`; no reviewer run.
- Most use lines already quoted a problem; the generic ones ("Use this to compare two
  numbers") became the question's own words ("Which number is greater, 54 or 36?").
- A use line must promise only what the page solves: one draft quoted 3³ + 4(8 − 5) ÷ 6 for a
  page that only takes a + b × cⁿ, and was rewritten.
- Changes made: `lesson-reviewer` check F now reads each use line against the skill's
  released questions and asks for the question's own words where the page solves it.

## K–6 edge-case review: five groups, a lesson-reviewer and a page-reviewer each, 12 reports

- Setup: `review-evidence.mjs --edges` (25 samples, 5 sequences, every opening value at each
  end and all at once); released questions filed by the lesson that teaches them, science
  matched by lesson (`alsoSkills`), in `questions.md` per group.
- Found what random samples didn't: circular steps at rejected edges, ranges below released
  items (13 × 12,000; 444 m perimeters; 20 °F day-to-day swings), compare pages with no
  direction, pictures that kept drawing a cleared value, labels off the canvas at ±20.
- Evidence gaps the reviewers named, now fixed: the edge blocks hid the rejection reason (the
  edited value is now last); the values line lacked `allowed` and `multipleOf`.
- Over-reported: "forced by a range limit" harness minors (hundreds of lines, one engine
  limit), and picture-scale findings on pages whose pictures grow to fit.
- About 130 released questions were re-filed from the reports' `[data]` lines; the question
  mapper should weigh an item's grade (many Grade 4 NAEP items sat under K–2 skills).
- Not built, listed for the owner: new pages the questions call for (mixed numbers, unit
  conversion with rates, compare rational numbers, inequality solutions, bills and coins,
  3-digit number lines, eggs or born alive, camouflage, weather tools), a plot-a-point main
  page for Grade 5 coordinates, and data sizes 3..10 on center and spread.

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

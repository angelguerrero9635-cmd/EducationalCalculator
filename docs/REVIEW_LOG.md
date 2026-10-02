# Review log

## The review runs in two stages

The lesson reviewer needs no build or browser, so its evidence (`--stage lesson`) is gathered
as soon as the tests pass and its fixes land before the page reviewer looks at the pages
(`--stage page`). `--changed` limits both to pages whose dump section changed. The reviewer
prompts read the guide's Standards only and open the picture or layout catalog on demand. The
planners start from `scripts/plan-brief.mjs` output, not from the guide and the gallery files.

After the fixes from a section review are done, the reviewers themselves are improved: checks
that are now automated come out of their instructions, findings they missed or over-reported
become new lines in their checklists, and the evidence they lacked is added to the evidence
script. One entry per review, with the token cost, so the next review is cheaper and sharper.

## Grades 11–12 new pages: one lesson-reviewer and one page-reviewer, 32 pages

- Found (lesson): ranges that were absurd or excluded normal answers (a stream 100 km deep,
  seafloor only to 12 Myr, K–Ar rejecting its own top R); values with no rearrangement (the
  carts' masses, the crate's weight); limits refused only by a range ("Greatest kinetic energy
  would have to be −1.68 eV") instead of a sentence; ratios that did not say which over which;
  decimals where exact forms belong (4√26, √2); `p^4` beside `0.5⁴`; a use line promising
  f⁻¹(x).
- Found (pages): x^(2/3) drawn from 0 only under "Domain: all real numbers"; carets in
  captions; an axis number cut off by a fixed margin; a handle showing a wavelength not typed;
  faded bars drawn from the example's p while p was "?"; a volcano cut by the board's edge;
  strobe dots that overlapped; two orbit labels touching.
- Fixed: all of the above in the page data and the pictures (limits with messages, the
  rearrangements, exact values, the window for odd roots, `leftFor` sizing a plot's margin from
  its numbers, binomial bars waiting for n and p, a least gap between strobe dots, the stripe
  map hatched past its 12 Myr record).
- Not fixed: the motion-diagram sort still puts its groups under six cards, so a phone scrolls
  between card and group; the sort layout has no side-by-side or sticky-groups option.
- Evidence gaps the reviewers named: the dump has no "find each value" walkthrough for the
  `startWith` values (the momentum masses had none and nobody saw it); `drags.md` makes one
  40 px drag, where a drag to each end would have caught the runaway values; and no screenshot
  shows a page with one box "?", where a picture drawing the example's numbers would show.
- Evidence added (`review-interact.mjs`): `drags.md` drags each handle toward each end too (7
  growing steps to 240 px) and flags a runaway (the value per px over 8 times its earlier
  rate), a handle that unmounts or leaves the picture, a value out of its box's range (boxes
  carry `data-min`/`data-max`), a page error, an "impossible" sentence after release, and a
  picture that changes when the dragged value is typed back; `unknowns.md` makes each first
  edit and flags the example's value of a "?" box in the picture's text, on every page with a
  picture. On a build from before the fixes it caught the graph runaway, the vanishing
  vertex, the satellite inside Earth and the first-law labels; at the fixes it still flags the
  photoelectric "?" case (open), the orbit and relativity captions, `(x − 3)/?` on the
  restricted inverse, and a FunctionGraph handle hidden mid-drag when it nears another (the
  34 px rule).
- First full run of the new checks, and the fixes: the end-drags caught a graph vertex hidden
  under the traced point or the secant's Q mid-drag (the dragged handle now always shows), a
  steep slope triangle with no whole run on the grid (it now centers) and a force tip dragged
  off the picture (now clamped). The ? check caught the example's numbers behind a "?" on the
  orbit, light clock, inverse, spring track, cliff, both Doppler pages, humidity and complex
  roots, then on about 60 more of the 137 Grade 11 pages with a picture: nearly every physics
  picture worked its caption with the example's numbers. `formulaOnly`/`worked` (hskKit) now
  cut a worked line to its formula while a box it uses is "?", and the labels read "?". The
  check reads "40%", "4i" and "2π" ticks as ticks. What it still flags is not a leak: fixed
  labels that match an example number (hydrogen's lines, the 68–95–99.7 brackets, the unit
  circle's π/4, levels "n = 2", fringe orders "m = 2", "2V" and "V/2", the boat's fixed 90°).

## Grades 9–12 pages: two page reviews, placements, and the testing change

- **Setup.**
  - Second lesson review of the 21 added skills (two reviewers), then four picture placers for
    H89–H110 (about 110 pages, 30 new pages, two merged away), then the first page review of
    Grades 9–12: 696 pages, four page reviewers, report-only, about 90k–100k tokens each.
  - Three fixers after it (shared components, math pages, science pages), then a second page
    review (two reviewers) to verify, and two more fixers.
- **Found.**
  - First page review: 50 errors, 58 improvements. Drags that cleared or changed typed numbers
    on every grade; raw `v_y` and `^t` in steps and captions; labels on axis numbers and on each
    other; blank algebra-tile mats; a mitotic-index page pre-rendered as "Skill not found".
  - Second page review: most fixes held (31 of 51 math, 27 of 44 science fixed outright), but the
    new drag rule left handles on worked-out values dead, and on two pages each drag move froze
    the tab for 15–30 s (about 800 solver calls per move).
- **What went wrong.**
  - Every scene screenshot was the header's home icon: the script took the first svg on the
    page. Two reviewers walked the explore pages in a browser instead.
  - Dark-mode and 1024 px shots covered only the first three pages of a run, all Grade 9.
  - The drag report listed only before → after values, so a drag that cleared a typed number read
    like any other drag; reviewers found them by reading the numbers.
  - One page fixer and the shared fixer both drew the ice lattice and the observe table's name
    column; the merge kept one of each.
  - A page-evidence run of both subjects hit the 2-hour background limit; run one subject at a
    time.
- **Reviewer and evidence improvements.**
  - Scene shots capture the largest svg (the picture); a shot under 100 px is an error.
  - `drags.md` marks **ERROR** for a drag that leaves "?", changes a typed value other than the
    one it drives, does nothing, or overlaps another handle, and for a handle with no test id.
    False positives seen and being taught to the script: a handle on a worked-out box moving the
    one typed value behind it, snapped turns, and a haloed label against its own backing text.
  - The second review ran with `--interact all --wide 40 --dark 60`, which caught what the first
    missed.
  - Fixer briefs now split shared files between parallel fixers explicitly.
- **Testing.** The heavy suites moved to the nightly CI run; a push runs the cheap suites
  (`ci-test.mjs`), and fixers test only the page ids they change. The page review is where
  pictures and drags get checked, in a browser.

## Grades 9–12 lessons: eight lesson reviewers, eight fixers

- **Setup.**
  - `review-evidence.mjs --stage lesson --out .review/hs-<section>` per section.
  - One lesson reviewer per section, report-only, all eight in parallel, about 170k–290k tokens
    each (about 1.8M in all).
  - One fixer per section in its own worktree, plus a builder per grade for the 21 new skills.
- **Found** (about 110 errors):
  - near-singular working lines (earthquake speeds, refrigerators, lenses);
  - impossible values (rocks older than the universe, 100,000 km on Earth);
  - pages that dropped their own range edges;
  - steps that showed the quadratic formula as factoring, or i²⁷ through cos 270°;
  - wrong science (a sinking plate that "melts", a charged can, a start codon read as missense);
  - two sort cards copied from a released question.
- **What went wrong.**
  - Eight parallel jobs, each running jest, ran the container out of memory. It restarted and
    stopped every agent.
  - The fixers' committed work survived in their worktrees, and they resumed there.
  - From then on: at most four agents, jest with one worker, and a commit per unit of work.
- **Reviewer and evidence improvements.**
  - The dump prints each rule's messages; the m.9 reviewer had to infer them from code.
  - The lesson reviewer's brief now lists the engine changes, so fixed patterns aren't
    re-reported.
  - Its instructions add: check that a grade file's own fraction helper matches the value
    format, and flag walkthroughs that use a number that was never typed.

## Grades 7–8: one lesson-reviewer and one page-reviewer, math and science

- Setup: `pnpm review` for `m.7.`, `m.8.`, `s.7.`, `s.8.`; the lesson reviewer about 397k
  tokens, the page reviewer about 156k.
- Found (lesson): ranges that stopped normal answers (balance ±100, exponents with any base,
  1,000 in a sample, map scales in miles and km); missing work lines (means, MAD, two-step
  equations, inequalities with the sign flipped); a triangular prism checked with the
  Pythagorean rule; a tree diagram that only did coins.
- Found (page): drags that cleared typed numbers to "?" on nine Grade 8 pages; a stacked
  quotient 531 px wide; no "/" key in fraction boxes on an iPhone; the orbit's "55.5556" with no
  unit and "Earth" at any mass; rates without units; labels on arrows and axis numbers; the
  moon in the planet row; salt drawn 5 + 5 + 5 + 1.
- All fixed; see the engine log's Grades 7–8 review entry.
- Reviewer and evidence improvements: the page reviewer treats a `→ ?` in `drags.md` as an
  error (a typed value cleared); `review-shots.mjs` flags any block wider than the screen, not
  only the document (the steps scroll inside their own view); the lesson reviewer checks each
  "Solves" row against the page's ranges, since several released items sat just past a range.

## Textbook-gap pages: one lesson-reviewer and one page-reviewer, 27 pages

- Setup: `pnpm review` into `.review/new/` for the 27 pages; the two reviewers in parallel,
  about 150k tokens each. A third page-reviewer on the 61 redrawn-picture pages
  (`.review/pics2/`) was cut off by the session's rate limit after fixing two pictures
  (the rectangle's area pill on a thin shape; the light figure's "clear block" label) and is
  still to run.
- Found (lesson): 10 errors. Grade 8 math on a Grade 6 page (the prism's third side by
  √(b² + h²): now typed, checked to close a right triangle); a compare tape whose bracket
  labelled the 60° gap as the 50 °C mix (now thermometers); "Glass window" as a conductor (two
  defensible bins); 1.6 cups as a count (now whole shares with a leftover); a title promising
  differences on a sums page (now three pages: sums, differences, products); values named by
  their unit ("Minutes", "Liters saved") that print wrong after a unit change; a money page
  whose words described a column grid it didn't draw; a paper clip as the 1 cm benchmark.
- Found (page): handles that erase typed numbers on the estimate pages (derived parts),
  two handles under each other on the light page (example widened), the net printing the
  example's length for a "?" value, a drag turning 2.5 feet into 2.8183 (the compare page now
  works in quarters so the smaller unit is whole), a sort hint repeating a whole problem
  (capped at 60 characters), two parts of one variable on the chromosome tape (now egg and
  sperm).
- Not taken: three unrelated engine asks stay open in `ENGINE_LOG.md` (a `static` tape, a
  `mark` on a compare tape, `autoWritten` skipping round-number grids).
- Reviewer: the sort pages had no sheet slot and no dark or wide shot; the `-- edge` dump
  covers only the first opening value. Both go to `review-evidence.mjs` next.

## Owner finding: no decimal point on the keyboard (website on an iPhone)

- Every input asked for the `numeric` keyboard on the web, which iPhone Safari shows as a pad
  with no point and no minus sign, so 3.48 could not be typed on a decimals page.
- Fix: the keyboard now follows the value (`keyboardFor` in `InputsSection.tsx`): the decimal
  pad for a value that takes decimals, the full keyboard for one that can be negative, the
  number pad for whole numbers. iOS's own app keeps numbers-and-punctuation (both keys);
  Android's numeric pad has both already.
- Reviewer: the page-reviewer's browser is desktop Chrome, which never shows a soft keyboard,
  so this could only be found on a phone. Added to its checklist as a rule to read from the
  code: a value that allows decimals or negatives must not ask for a bare numeric keyboard.

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

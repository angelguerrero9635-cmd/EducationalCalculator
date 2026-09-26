# Engine log

After every section review, the findings that the engine (solver, step builder, shared
helpers, pictures, tests, harness) could have prevented are turned into engine work before the
next section is written, so each section starts from a better engine than the last. One entry
per review; each line names the finding and what the engine now does about it.

## Word rules read as sentences (Grades 3–5)

- A fraction in a word rule read "First numerator/First denominator", and names kept their
  capitals mid-rule. → `wordRule` (in `grade.ts`) reads a fraction of names with "over" and
  lowercases every name after the first: "First numerator over first denominator is at most
  1", "Length × width = area". The formula box, the walkthrough and `standards.test.ts` all
  use it.

## Science Grades 4–5 build (Section 6, from the reviewer's plan)

- The lesson reviewer planned all 16 skills before the build (`.review/science-4-5-plan.md`):
  page kind, honest quantities, picture, problem types, exam coverage, engine needs.
- Three ideas had no figure: the path of light to the eye, particles too small to see, and
  down as toward Earth's center (with day and night). → Explore figures `lightPath`,
  `particles` and `earth`, their scene fields, and fit checks in `layouts.test.ts`.
- Word units that must not convert (liters on the water-share page, seconds on a stopwatch
  page) are fixed labels; the units test lists them.
- Observe columns can be times with a.m. and p.m.: the label check allows that period.
- Skip counts draw whole steps only, so a decimal pull per washer uses a table instead.

## No letters before Grade 6 (after the Grade 5 review)

- Grades 3–5 showed letters as labels ("Rows (r): 3"), rules in letters under the number
  sentence ("l × w = A") and lines like "A = 4 × 3", though variables are introduced in Grade
  6 (6.EE.2). → K–5 name every value in words: the formula box reads the rule in words
  ("Length × width = area", `namedVariables`), the walkthrough writes "Area = 4 × 3" and
  "Area = 12 cm²", the input rows drop the symbol column, pictures use `rep.words` for
  names and captions, and `standards.test.ts` fails a letter standing for a number in any
  grade below 6 (a unit's abbreviation after its name, "grams (g)", is allowed).

## Grade 5 (Section 2, first review)

- Step text used skip-count lines ("Count by 4s, 8 times") for facts a Grade 5 student
  knows. → Grade 5 modules give no work lines for a fact; the substituted line is the work.
- The decimal grid left a place blank ("0 . _ 5" for 0.05). → Every empty place after the
  point is a 0; the harness checks it.
- A number taken from itself got a column grid (1,978 − 1,978). → No grid when the two are equal.
- The common denominator was the product of the denominators (144 parts for twelfths and
  twelfths). → The least common multiple, with the multiples counted in a work line; the
  harness reads "smallest common multiple of 4 and 6".
- A product of fractions was left unsimplified (6/12). → A note gives the simplest form.
- A whole-number volume lesson's base area was named "cubes in one layer" with a square unit.
  → "Base area".
- Pictures (page reviewer): the place-value chart wrapped past five columns (tight cells);
  point labels sat on a rising line (label on the free side); fraction bars past 24 parts
  merged into a band (unlined parts, one outline); tables show values to the variable's step.
- A slider the other values hold to one value looked movable. → Dimmed and marked disabled;
  the sweep accepts it.
- Open: exponents show a caret (10^2) everywhere; no superscript rendering yet.

## Grade 5 build (Section 2, while writing)

- The written-work grids stopped at Grade 4's layouts. → `columnMultiply(a, b, true)` sets
  out one row per digit of the second factor (the standard algorithm) and `autoWritten` uses
  it from Grade 5; `decimalColumns` lines up the points for decimal sums and differences.
- Fraction bars could only caption a comparison. → `caption` on the picture, for a sum or a
  sharing ("{p}/{m} + {q}/{m} = {s}/{m}").
- A whole-number volume lesson offered liters for its cubic centimeters, and mm, km, yd and
  mi had no cubic unit. → Cubic units for every length in the registry; `unitChoices` with
  the module's variables offers only squares and cubes of lengths for a length lesson's
  areas and volumes.
- The unit-cubes caption counted the clipped drawing, not the box. → It counts the real box.
- "zeros in 1,000" is a phrase the harness reads (the exponent).

## Written work (before Grade 5)

- The steps read as prose lines ("6 × 100 = 600, so 100 groups fit: 743 − 600 = 143") where a
  student writes columns and a bracket, and Grade 6+ jumped from the substituted line to the
  answer (`c = √(3² + 4²)`, then `c = 5 cm`). → `written.ts`: column addition and subtraction
  with carries and regrouping marks, partial products with the fact beside each row, the
  long-division bracket with each product taken away and the next digit brought down;
  `autoWritten` picks one by grade for a plain arithmetic line, a step can name or refuse one.
  `simplify.ts`: one line per stage of the order of operations under a substituted formula
  (brackets, roots and exponents first). `WrittenWork.tsx` draws a grid; the dump boxes it;
  the harness checks the equation each grid says and its answer. Grades 3–5 drop running
  totals a column sum already shows.
- The long-division page's partial-quotient chunks were the only "written" layout, and were
  data in the module. → The page names the bracket (`written: longDivision`), and its work lines
  read the quotient's places and the remainder.

## Repository layout (before Grade 5)

- Module data was in ten files named by section and review round (`math-k2-extra.ts`,
  `math-3-more.ts` …), and a problem type's "use" line lived in a separate map. → One file
  per subject and grade (`math/4.ts`, `science/2.ts`), the skill's main page followed by its
  problem types, `use` on the module, K–2 helpers in `helpers.ts`, the few helpers two grade
  files share in `shared/`, pilots for unbuilt grades in `pilots.ts`. `pnpm new-module`
  scaffolds a module in the right file; `CLAUDE.md` maps the repository and the commands.
- The sampling harness was one 1,800-line test. → Its three libraries (`harness/evaluate.ts`
  for the phrases step text uses, `harness/pictures.ts` for the check per picture kind,
  `harness/search.ts` for the brute-force search) are the files a module writer touches.
- Every picture registered sliders, so pages with their own handles or taps carried a second
  set of controls. → `sliderPolicy.ts`: sliders only for kinds where sweeping teaches and the
  picture has no touch control of its own; `sliders` on a module overrides; `pnpm docs:sliders`
  writes `docs/SLIDERS.md`.

## Picture kinds built ahead (before Grade 5 and Sections 3–8)

Eleven diagram kinds written before the lessons that need them, each with its spec, harness
check and test coverage: double number line, coordinate plane (point, second point, line and
rise/run), box plot, pie chart, fraction × fraction area, unit cubes in layers, place-value
chart, factor tree, protractor, wave, Punnett square. Three are on Grade 4 pages now (factor
tree, double number line, protractor); the rest live in a picture gallery (`/gallery`, one
demo module per kind in `gallery.ts`) that the module tests, the harness, the shots script
and the slider test all cover, so a kind is reviewed before its first lesson. Lessons from
building them: a kind whose variables don't connect through a formula (a wave's amplitude
beside speed = frequency × wavelength) makes the demo two lessons, so the amplitude is
optional on the picture; a phrase in the harness ("prime factors of") must come before a
shorter phrase it contains ("factors of"); a product with a zero factor (a Punnett parent
with no dominant allele) is determined but not solvable pairwise, so parents take `allowed`
values.

## Slider sweep (all sections)

`scripts/test-sliders.mjs` drove all 235 sliders on the 110 module pages that have them
(tap the top, tap the bottom, drag to the middle, three taps down the track; read the value
under the slider and the input box). What it found and what the engine now does:

- A slider tap whose value didn't fit with the values it holds still (start 10 with 30 to
  take away; a start of 1,000 with four jumps of 10; a product no top and bottom can make)
  was rejected by the solver, and the rejection dropped the slider's own old value: the box
  went blank with a message far below the picture. Seven pages, both directions. →
  `Calculator.set` treats a picture update as one move: if the newest value is rejected, or
  a value it holds still would be cleared, nothing changes and the reason shows under the
  box. With `slide` (every slider), the value walks back toward where it was one step at a
  time and stops at the last value that fits, so a slider goes as far as the other values
  allow instead of sticking. The harness's model (`setValues`, newest wins, an invalid
  typed value drops the old one) is unchanged: typing keeps its text in the box.
- A slider's track ran over the variable's whole range, so a finger at the top of "Start"
  (20 to add, 100 the most in all) got 95 and watched the knob spring back: the value it
  showed was not the value it kept. → Each slider's track covers only the values that fit
  with the others held still (`Calculator.fits`, probed by halving from the current value
  toward each end, on the variable's own steps), so the knob stays under the finger.
- On a phone a slider moved one step and then snapped back to (or near) its old value: the
  page's scroll lock turned `scrollEnabled` off on the first move, and changing a scroll
  container mid-gesture cancels the touch on iOS. → The lock is gone. On the web the track
  and the handles carry `touch-action: none`, and on native they hold the responder and
  refuse to give it up, which is all that is needed to keep the page still.
- On the web a slider let go snapped back to (or near) its old value: after a touch that
  has moved, the browser's emulated mouse events on lift reach the responder system as a
  fresh press. → On the web, sliders and drag handles use pointer events with pointer
  capture (`pointerDrag.ts`); the responder props stay for native. The track's top is
  measured once at the press, so a page shift mid-drag can't move the value.
- A page whose whole is fixed (a full turn of 360°) had two part sliders that could never
  move: each pinned the other, so the whole always changed. → `angles.sliders` names the
  values that get sliders instead (parts of the turn, parts in the angle); the rays are not
  dragged there.
- Sliders' `accessibilityValue` never reached the DOM on web. → `aria-valuemin/max/now/text`
  are written too (screen readers and the sweep read them).
- Sweep lesson: a slider's range is the variable's, not what the other values allow; a check
  that a slider reaches its range's ends is wrong, a check that it moves and stops is right.

## Grade 4 (Section 2, first review)

One lesson-reviewer and one page-reviewer on 13 pages. What the engine now does:

- A relation of the form `h = 10t + u` with pairwise solves could not fill the tenths and the
  extra hundredths from the hundredths alone (the grid sets `h`), and `a = t + o` left the
  tens and ones blank from the factor alone. The harness's "determined but left unknown"
  check stayed quiet because only the digit ranges (0–9), not the formulas, pin the parts
  down. → Relations that solve the place part from the number alone (`t = tenths in h`,
  `t = tens of a`, `placePart()` in math-4-more.ts). Rule for writers: a value read off a
  number's digits gets its own relation from that number.
- Typing a prime above 12 was rejected ("No whole numbers fit"): the factor pair 1 × 13 was
  out of range. → Factors range to 100; the array draws at most `max` dots and its caption
  says "(the first 20 shown)"; the harness no longer flags a factor past the drawing.
- A product of two typed factors where the zero top (0 × any bottom) made the new top 0
  whatever the bottom: the search saw a determined value the solver could not reach. → Tops
  start at 1 on the equivalence page; a factor that can be 0 in a product needs its own
  thought before the range is written.
- The fraction line drew one run of jumps for a sum or a product, so 3/8 + 6/8 and 4 × 2/3
  looked like 9/8 and 8/3 typed in. → `fractionLine.parts` (addends: alternate shade, one
  label per run, the point drags the last addend) and `fractionLine.copies` (the runs
  alternate every copy).
- Only the first angle had a handle; the whole-angle label sat on the middle ray when the two
  parts were equal; a reflex whole went off the canvas. → A second handle on the outer ray
  moves the second angle; the label steps off the bisector; the vertex moves to the middle
  past 180°.
- Canvases sized for a square extent left blank bands under a wide rectangle and under the
  hundred grid. → Canvas heights come from the drawn figure (Rectangle, Grid100).
- Sort cards were words only, a memory test for the shape or the line pair. → `card.figure`
  on sort cards (`lines`, `letter`, `polygon` (open or closed), `circle`, `heart`), drawn by
  `SortLayout`.
- The rounded number and the two neighbours were typed, so a typed 853,520 sat beside a place
  of 100,000. → They are `derived` on the rounding page; the picture's `to` can be a variable.
- The Grade 3–5 value cap (8) counted read-only boxes, so a four-box area model (11 values,
  3 typed) failed the standard. → The cap counts values the student holds (not `derived`).
- Harness: check lines ending in ", so …" and "n ÷ d = q remainder r" now balance; phrases for
  full tenths, "the tens in", "N with the places under P made 0"; the shots script fails loudly
  when its section-header anchor is missing (it had measured from the page top for a whole
  section) and reports where each page's height goes.
- `Sliders`: a 120 px track when there are at most four (four 88 px sliders wrap on a phone, so widths stay);
  `Tape` labels at `chart.label`; `AreaModel` boxes get at least 36% of the width.

## Grade 4 build (Section 2, while writing)

- A remainder must be smaller than the divisor, but a relation with nothing to solve was
  root-found numerically (picked any divisor above the remainder). → `Relation.constraint`:
  a check-only rule the solver never works a value out of, only rejects with once every
  variable in it is known; `narrow` and the search skip it.
- A product could be found in one jump before its part products, so the area-model
  walkthrough started at the answer. → The lesson's `n = a × b` relation solves only the
  factors (`n: () => undefined`); the product comes from the parts.
- The harness retyped a derived value ("same" edits) and read new phrases. → Derived values
  are left out of retype edits; phrases for factor counts, whole groups, leftovers and
  "q remainder r".

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

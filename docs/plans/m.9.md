# Direction plan: math grade 9 (Algebra 1, 17 skills)

Written from `brief.md`, `questions.md`, `docs/MODULE_GUIDE.md` ("Standards"), `docs/EQUATION_INPUTS.md`
(Grades 9–12 table), `docs/LAYOUTS.md` and the IM Algebra 1 and Big Ideas unit lists in
`research/textbooks/grades/9.md`. Every example is original and was worked by hand; the regression,
projectile, interest and standard-deviation numbers were rechecked with a script.

## Decisions

- **Letters and notation.** Grade 9 writes standard notation: x, y, f(x), aₙ with subscripts, x², √, ∛,
  b^(p/q) stacked, ± in the quadratic formula, interval words ("−3 < x ≤ 3") rather than interval
  brackets (the brackets are Algebra 2 in most of the programs). A page holds at most 10 values and a
  sentence at most 35 words (standards.test.ts). Steps write the rule in letters, the rearrangement,
  the numbers put in, then one line per simplifying stage.
- **Equation inputs.** Every page whose problem is one equation takes the template from the Grades 9–12
  table in `docs/EQUATION_INPUTS.md`, written exactly as below. Statistics pages, the two-way tables,
  the regression pages and the story pages with named roles and units stay rows.
- **One departure from the table.** `m.9.inequality-systems` is planned as `y > {m1}x + {b1}` over
  `y ≤ {m2}x + {b2}` with fixed signs, not the standard-form template with `{s:sign}` boxes: the
  `lineSystem` shade is a literal per page, so a tapped sign could not move the shading (need 2). The
  standard-form sign-box page follows when need 2 is built.
- **Layouts (4 sort pages).** `m.9.solving-equations~how-many-solutions`, `m.9.regression~correlation`,
  `m.9.radicals~rational-or-irrational`, `m.9.exponential-functions~linear-or-exponential`. In each the
  property is the lesson and the number is beside the point. Everything else is a calculator.
- **Pilot `m.9.exponential-functions`: MOVE with changes.** It moves to `src/data/modules/math/9.ts`,
  but not as is:
  - Its `t` solve takes logarithms (`ln(y ÷ a) ÷ ln(1 + r ÷ 100)`), which is Algebra 2. Grade 9 reads
    the first period past a target from the table. Drop the `t` solve.
  - `r` runs −100 to 100, so r = −100 gives a factor of 0 and y = 0 at once. Its `display` writes
    `(1 + r ÷ 100)` where the class writes `(1 + r)`.
  - It has no `equation`, and its only picture is a table.
  - It becomes `~percent-growth` (the `{A} = {P}(1 + {r})^{t}` template, H82). Its sweep table goes to
    `~decay`. The main page becomes `y = {a}({b})^x` on `functionGraph` (see skill 10).
  - `r` is typed as a percent with `unit: '%'`. The step writes the decimal once ("1.5% = 0.015").
    Allowed r is 0.1–50 on the growth page, and 0.1–99 on the decay page (`1 − r`).
- **Refresh overlap.** Grade 8 already has slope-intercept from two points, standard-form intercepts,
  substitution systems, integer exponent rules and two-way association (`m.8.*`). Grade 9 pages don't
  repeat them; each page's Refresh names the Grade 8 page.
- **Mis-filed questions** are listed under their right skill below and in "Not in the taxonomy".

### 1. m.9.solving-equations — Solving linear equations and literal equations

- **Standard:** A-REI.1, A-REI.3, A-CED.4.
- **Textbooks:** OpenStax Algebra & Trig 9.2; Elementary Algebra 9.2; Intermediate Algebra 11.2; Big Ideas 9.1, 9.5; enVision 9.1, 11.1; Reveal 9.2, 11.2.
- **Tests ask:**

  | Question                                                                           | Page                  | Mark                                                                                        |
  | ---------------------------------------------------------------------------------- | --------------------- | ------------------------------------------------------------------------------------------- |
  | NAEP-2024-12M2-#2 (filed under inequality-systems: which has exactly one solution) | ~how-many-solutions   | Solves                                                                                      |
  | Common: variable on both sides                                                     | main                  | Solves                                                                                      |
  | Common: distribute first, then both sides                                          | ~distribute           | Solves                                                                                      |
  | Common: solve a formula for one letter                                             | ~literal              | Solves (perimeter); Partly for other formulas                                               |
  | Common: fraction or decimal coefficients                                           | main (decimals typed) | Partly: the tiles need whole numbers; Refresh m.8.multi-step-equations~fraction-coefficient |
  | Common: name the property used in each step                                        | main steps (`how`)    | Partly                                                                                      |

- **Main — BUILD `m.9.solving-equations`:**
  - Picture: `algebraTiles` mode 'equation', from `g.m9-solving-equations-tiles`. A negative start uses
    `g.m9-solving-equations-negative-tiles`.
  - Equation `{a}x + {b} = {c}x + {d}`.
  - Values: a, c integers −10..10 with a ≠ c; b, d integers −10..10 (each tile edge holds −10 to 10);
    x is solved (it may be a fraction, and the tiles label it).
  - Relation x = (d − b)/(a − c).
  - Assumptions:
    - Doing the same thing to both sides keeps the equation true.
    - Collect the x terms on the side with the larger coefficient, so the x term stays positive.
    - When a = c, there is no solution (b ≠ d) or every number is a solution (b = d); see ~how-many-solutions.
  - Example: 5x + 3 = 2x + 12 → 3x + 3 = 12 → 3x = 9 → x = 3. Check: 18 = 18.
  - `startWith: ['d', 'a', 'b', 'c']`, so typing x moves the constant d.
- **~distribute — BUILD:**
  - Picture: `algebraTiles` 'equation', with the left mat showing the distributed tiles (derived
    x = p·a, unit = p·b).
  - Equation `{p}({a}x + {b}) = {c}x + {d}`. Values: p 1..5; a, b, c, d −10..10, with |p·a| ≤ 10 and
    |p·b| ≤ 10 so the tiles fit; x solved.
  - Example: 3(2x − 4) = 4x + 2 → 6x − 12 = 4x + 2 → 2x = 14 → x = 7. Check: 30 = 30.
  - Use line: "Use this for “3(2x − 4) = 4x + 2”."
- **~literal — BUILD:**
  - Rows, because the lengths have units. Values: perimeter P (cm), length l (cm), width w (cm).
    Relation P = 2l + 2w.
  - Steps for w: w = (P − 2l)/2, with the letters first and then the numbers. Assumption: "Solve for
    the letter first; put numbers in last."
  - Picture: `coordinatePlane` `rect` (a rectangle from its sides, drawn), labelled l and w.
  - Example: P = 30 cm, l = 9 cm → w = (30 − 18)/2 = 6 cm. `startWith: ['l', 'P']`.
  - Use line: "Use this for “Solve P = 2l + 2w for w”."
- **~how-many-solutions — BUILD (sort):**
  - Bins: "Exactly one solution", "No solution", "Every number is a solution".
  - Cards: `5x − 2 = 3x + 8` (one: x = 5), `6x + 4 = 2x` (one: x = −1), `4x + 1 = 4x + 6` (none),
    `3x = 3x + 0.5` (none), `2(x + 3) = 2x + 6` (every), `7 − x = −x + 7` (every), `2n + 1 = 9` (one),
    `2n + 1 = 2n` (none).
  - Sentence: "Collect the x terms. If they cancel, the numbers left decide: a false statement has
    no solution, a true one every number."
- **Verdict:** 4 pages (3 calculators, 1 sort); the one released item is Solved, and the common types
  are Solved or Partly.

### 2. m.9.linear-inequalities — Solving linear and compound inequalities

- **Standard:** A-CED.1, A-CED.3, A-REI.3, A-REI.12 (one inequality in two variables).
- **Textbooks:** OpenStax A&T 9.2; Elementary 9.2–9.4; Intermediate 11.2–11.3; Big Ideas 9.2, 9.5, 11.5; enVision 9.1, 9.4, 11.1; Reveal 9.6, 11.1, 11.2, 11.7.
- **Tests ask:** (none filed here; these are mis-filed under inequality-systems)

  | Question                                            | Page                  | Mark                                                          |
  | --------------------------------------------------- | --------------------- | ------------------------------------------------------------- |
  | NAEP-1990-12M7-#7 (least whole number with 2x > 11) | ~whole-number-answers | Solves                                                        |
  | NAEP-2013-12M99-#1 (x > −3 AND x < 5 vs OR)         | ~compound, ~or        | Solves (the 'or' rays meet: every number)                     |
  | MCAS-2026-G10M-#3 (0 ≤ x − 10 ≤ 20)                 | ~compound             | Partly: bounds reach 30, past the fixed −10..10 line (need 1) |
  | Common: both sides, dividing by a negative          | main                  | Solves                                                        |
  | Common: graph y < mx + b                            | ~two-variables        | Solves                                                        |

- **Main — BUILD `m.9.linear-inequalities`:**
  - Picture: `integerLine` with `inequality: { sign, test }`.
  - Equation `{a}x + {b} {s:sign} {c}x + {d}` (H84, as in `g.m9-linear-inequalities-both-sides`).
  - Values:
    - a, b, c, d integers −10..10, with a ≠ c;
    - s, the sign box (`allowed: [1, 2, 3, 4]`);
    - k, the bound (`derived`); `s2`, the sign after solving (`derived`, flipped when a − c < 0);
    - t, a test number.
  - Line from −20 to 20, since |k| ≤ 20.
  - Relations: k = (d − b)/(a − c); `s2` = s, flipped when a − c < 0.
  - Assumptions:
    - Dividing or multiplying both sides by a negative number reverses the sign.
    - < and > leave the bound out (an open circle); ≤ and ≥ put it in (a closed circle).
    - A test number from the shaded side makes the first inequality true.
  - Example: 3x − 4 > 5x + 6 → −2x > 10 → x < −5. Test t = −6: −22 > −24, true. At −5 both sides are
    −19, so −5 is left out.
  - `startWith: ['d', 'a', 'b', 'c', 's', 't']`.
- **~compound — BUILD:**
  - Picture: `integerLine` compound 'and', from `g.m9-linear-inequalities-and`.
  - Equation `{l} {s:sign} {a}x + {b} {t:sign} {r}`. Values: l, r −50..50; a −10..10, a ≠ 0; b −50..50;
    the two sign boxes; the lower and upper bounds L, U (`derived`); a test value.
  - Relations: L = (l − b)/a and U = (r − b)/a. A negative a swaps the bounds and flips the closed pair.
  - Example: −5 < 3x + 4 ≤ 13 → −9 < 3x ≤ 9 → −3 < x ≤ 3.
- **~or — BUILD:**
  - Picture: `integerLine` compound 'or', from `g.m9-linear-inequalities-or` (rays that meet:
    `g.m9-linear-inequalities-or-all`).
  - Equation `{a}x + {b} {s:sign} {c} or {d}x + {e} {t:sign} {f}`.
  - Example: 2x + 3 < −1 or 3x − 2 ≥ 7 → x < −2 or x ≥ 3.
- **~two-variables — BUILD:**
  - Picture: `linearFunction` with `shade`, from `g.m9-linear-inequalities-half-plane`.
  - Equation `y {s:sign} {m}x + {b}`. The shade follows the sign (need 2); until then the page uses
    two fixed-sign pages, ≥ first.
  - Values: m, b, and a test point (tx, ty).
  - Example: y ≥ 2x − 3, test (1, 0): 0 ≥ −1, true, so (1, 0) is in the shaded half-plane.
- **~whole-number-answers — BUILD:**
  - Rows with named roles: fixed cost F ($), cost per item p ($), budget B ($), the sign box, the
    bound n (`derived`), and the greatest or least whole number (`derived`).
  - Relation n = (B − F)/p, then round down for ≤ and up for ≥.
  - Picture: `integerLine` inequality with the whole numbers dotted.
  - Example: $12 to join plus $4 a visit, at most $50 → 12 + 4v ≤ 50 → v ≤ 9.5 → at most 9 visits
    (48 ≤ 50; 10 visits cost 52).
- **Verdict:** 5 pages; 2 of the 3 mis-filed items are Solved, and MCAS #3 waits on need 1.

### 3. m.9.absolute-value — Absolute value equations and inequalities

- **Standard:** A-CED.1, A-REI.3 (extended to absolute value, as the programs teach it).
- **Textbooks:** Eureka HS 9.3; IM 9.4; OpenStax A&T 9.2, 9.3; Intermediate 11.2–11.3; Precalc 12.1; Big Ideas 9.1–9.3, 11.1; enVision 9.1, 9.5, 11.1; HMH 9.3, 11.1; Reveal 9.2, 9.4, 9.6, 11.2.
- **Tests ask:**

  | Question                                     | Page                                      | Mark                                |
  | -------------------------------------------- | ----------------------------------------- | ----------------------------------- |
  | NAEP-2005-12M3-#15 (graph of \|2x − 5\| ≥ 3) | ~inequality                               | Solves: x ≤ 1 or x ≥ 4, both closed |
  | NAEP-1992-12M15-#8 (graph of y = \|f(x)\|)   | m.9.piecewise-functions~absolute-function | No: needs \|f(x)\| drawn (need 6)   |
  | Common: \|ax + b\| = c, two solutions        | main                                      | Solves                              |
  | Common: c < 0 (no solution) or c = 0 (one)   | main                                      | Solves                              |
  | Common: tolerance ("within 4 g of 500 g")    | ~tolerance                                | Solves once need 1 lands            |

- **Main — BUILD `m.9.absolute-value`:**
  - Picture: `integerLine` compound with a center and radius. It needs the `join: 'equal'` variant:
    two closed dots at c ± d, nothing between them (need 3). Until then, use the 'and' picture with
    the two bounds only.
  - Equation `|{a}x + {b}| = {c}`. Values: a −10..10, a ≠ 0; b −20..20; c −20..20; center h = −b/a and
    distance d = c/|a| (both `derived`); x1, x2 solved.
  - Relations: x1 = (c − b)/a, x2 = (−c − b)/a.
  - Assumptions:
    - |u| = c means u is c from 0: u = c or u = −c.
    - A negative c has no solution, and c = 0 has one.
    - Check each answer in the first equation.
  - Example: |2x − 3| = 7 → 2x − 3 = 7 or 2x − 3 = −7 → x = 5 or x = −2. Center 1.5, distance 3.5.
  - `startWith: ['c', 'a', 'b']`.
- **~inequality — BUILD:**
  - Picture: `integerLine` compound with center and radius, from `g.m9-absolute-value-within` (< and ≤,
    'and') and `g.m9-absolute-value-beyond` (> and ≥, 'or').
  - Equation `|{a}x + {b}| {s:sign} {c}`.
  - Example: |2x + 1| ≤ 7 → −7 ≤ 2x + 1 ≤ 7 → −4 ≤ x ≤ 3. Center −0.5, distance 3.5.
- **~tolerance — BUILD:**
  - Rows, because of the units: target T (g), allowed difference d (g), measured w (g); the lowest and
    highest allowed weights (`derived`).
  - Relation |w − T| ≤ d, with T − d and T + d worked.
  - Picture: `integerLine` compound with center T and radius d. It needs its window around T (need 1).
  - Example: 350 g within 6 g → 344 ≤ w ≤ 356. A 343 g box is out: |343 − 350| = 7 > 6.
- **Verdict:** 3 pages; 1 of 2 released items Solved; the |f(x)| graph goes to piecewise, waiting on need 6.

### 4. m.9.function-notation — Function notation, domain and range, key features

- **Standard:** F-IF.1, F-IF.2, F-IF.4, F-IF.5, F-IF.6.
- **Textbooks:** IM 9.4; OpenStax A&T 9.3; Intermediate 11.3; Precalc 12.1; Big Ideas 9.3; enVision 9.3, 11.1, 11.5; Larson 12.1; Reveal 9.3, 11.1, 11.6.
- **Tests ask:** (no released questions; common types)

  | Question                                                                             | Page            | Mark                                          |
  | ------------------------------------------------------------------------------------ | --------------- | --------------------------------------------- |
  | Evaluate f(4) for a linear f                                                         | main            | Solves                                        |
  | Solve f(x) = 13                                                                      | main            | Solves                                        |
  | Evaluate a quadratic f(−2) (also NAEP-1992-12M7-#9, filed under quadratic-functions) | ~evaluate       | Solves                                        |
  | Domain and range from a graph or a story                                             | ~domain-range   | Solves for a line segment; Partly for curves  |
  | MCAS-2026-G10M-#42 (domain from a story, filed under linear-modeling)                | ~domain-range   | Partly: the answer is a story domain in words |
  | Average rate of change on an interval                                                | ~rate-of-change | Solves                                        |

- **Main — BUILD `m.9.function-notation`:**
  - Picture: `functionGraph` linear with `at: { x, y }`, from `g.m9-function-notation-linear`.
  - Equation `f({x}) = {y}`, with the rule f(x) = mx + b shown above it. Values: m −10..10, b −20..20,
    x −20..20, y solved.
  - Relation y = mx + b.
  - Assumptions:
    - f(x) is the output for input x, not f times x.
    - f(4) = 10 means the point (4, 10) is on the graph.
  - Example: f(x) = 3x − 2, f(4) = 10; f(x) = 13 → 3x = 15 → x = 5.
  - `startWith: ['x', 'm', 'b']`, so typing y moves x.
- **~evaluate — BUILD:**
  - Picture: `functionGraph` quadratic standard with `at`.
  - Values: a, b, c, x (decimals allowed, as NAEP asks f(3.5)); y solved only (`derived`: two inputs
    can give one output).
  - Example: f(x) = 2x² − 3x + 1, f(−2) = 2(4) + 6 + 1 = 15.
- **~domain-range — BUILD:**
  - Picture: `functionGraph` piecewise with one piece `{ f: linear, from, to, ends: '[]' }` and marks
    ['domain', 'range'].
  - Values: m, b, the domain ends x1 < x2, and f(x1), f(x2), the least and greatest outputs (all
    `derived`).
  - Example: f(x) = −2x + 5 for −1 ≤ x ≤ 4 → f(−1) = 7, f(4) = −3 → range −3 ≤ y ≤ 7.
- **~rate-of-change — BUILD:**
  - Picture: `functionGraph` quadratic with `secant { x, h, slope }`.
  - Values: a, b, c, the interval ends x1, x2, and the average rate (`derived`).
  - Relation (f(x2) − f(x1))/(x2 − x1).
  - Example: f(x) = x² − 4x + 1 on 1 ≤ x ≤ 4: f(1) = −2, f(4) = 1 → 3 ÷ 3 = 1.
- **Verdict:** 4 pages; no released items, and 5 of 6 common types Solved.

### 5. m.9.linear-modeling — Writing linear functions: slope-intercept, point-slope, standard form

- **Standard:** A-CED.2, F-BF.1a, F-LE.2, F-LE.5, S-ID.7, G-GPE.5 (parallel and perpendicular, taught in Algebra 1).
- **Textbooks:** Eureka HS 9.1, 9.3, 9.5; IM 9.2, 9.3; OpenStax A&T 9.2, 9.4; Elementary 9.2–9.5; Intermediate 11.2–11.4; Precalc 12.2; Statistics 12.12; Big Ideas 9.3, 9.4, 11.1; enVision 9.2, 9.3, 11.1; HMH 9.2, 9.9; Larson 12.1; Reveal 9.4, 9.5, 11.1.
- **Tests ask:**

  | Question                                                         | Page                               | Mark                              |
  | ---------------------------------------------------------------- | ---------------------------------- | --------------------------------- |
  | NAEP-2005-12M12-#17 (increase over 2 years from C = 2.50y + 13)  | ~context                           | Solves (change = m × Δx)          |
  | NAEP-2024-12M9-#2 (height from a linear model, decimals)         | ~context                           | Solves                            |
  | MCAS-2026-G10M-#18 (T = 65 + 5h: meaning, value)                 | ~context                           | Solves                            |
  | MCAS-2026-G10M-#35 (C(x) = 1700 + 2.50x: fixed part, total)      | ~context                           | Solves                            |
  | MCAS-2026-G10M-#14 (rental over 100 miles)                       | m.9.piecewise-functions~context    | Solves                            |
  | MCAS-2026-G10M-#42 (domain of a story)                           | m.9.function-notation~domain-range | Partly (mis-filed)                |
  | NAEP-2024-12M11-#10 (compare a with c and b with d on two lines) | m.8.systems-linear picture         | Partly                            |
  | NAEP-2009-12M2-#9 (two runners: intercepts, slopes, crossing)    | m.8.systems-linear~context         | Partly (clock-time axis)          |
  | NAEP-1992-12M12-#9 (tax plan, two rates)                         | ~context                           | Partly (piecewise with two rates) |
  | NAEP-1992-12M15-#11 (path on a grid with a change of slope)      | —                                  | No                                |

- **Main — BUILD `m.9.linear-modeling`:**
  - Picture: `functionGraph` linear with `at: { x: 'x1', y: 'y1' }` and marks ['intercept'], from
    `g.m9-function-notation-linear`.
  - Equation `y − {y1} = {m}(x − {x1})`, with the slope-intercept line y = mx + b as a worked-out row.
  - Values: x1, y1 −20..20; m −10..10; b (solved).
  - Relation b = y1 − m·x1.
  - Assumptions:
    - Point-slope form needs one point and the slope.
    - Distribute and add y1 to reach y = mx + b.
    - A negative x1 reads x + 3, not x − (−3).
  - Example: slope 3 through (2, 5): y − 5 = 3(x − 2) → y = 3x − 6 + 5 → y = 3x − 1.
  - `startWith: ['m', 'x1', 'y1']`.
  - Needs: `x − {x1}` with a negative x1 must draw "x + 3" (check the equation input; else need 10).
- **~parallel-perpendicular — BUILD:**
  - Picture: `lineSystem` with the given line and the new one (`fixed`).
  - Values: the given m1 and b1, the point (x1, y1), a choice box parallel or perpendicular
    (`allowed: [1, 2]`), m2 and b2 (`derived`).
  - Relations: m2 = m1, or m2 = −1/m1 (m1 ≠ 0); b2 = y1 − m2·x1.
  - Example: perpendicular to y = 2x + 1 through (4, 3): m = −1/2, b = 3 + 2 = 5 → y = −½x + 5.
- **~context — BUILD:**
  - Rows with named roles: starting amount b ($), rate m ($ per class), count x (classes), total C ($),
    and a change in count Δx with its change in total ΔC.
  - Relations C = b + m·x and ΔC = m·Δx.
  - Picture: `functionGraph` linear with `at`, with axes named with units.
  - Assumption: "x is a whole number of classes, 0 or more: the domain of the story."
  - Example: $25 to join plus $12.50 a class: C(8) = 25 + 100 = $125. Three more classes add
    3 × 12.50 = $37.50. C = 150 → x = 10.
- **Verdict:** 3 pages; 4 of 10 released items Solved here, 1 Solved on the piecewise page, 4 Partly, 1 No.

### 6. m.9.regression — Scatter plots, correlation, residuals, lines of best fit

- **Standard:** S-ID.6a, S-ID.6b, S-ID.6c, S-ID.8, S-ID.9.
- **Textbooks:** Eureka HS 9.2; IM 9.3, 11.5; OpenStax A&T 9.4, 11.6; Precalc 12.2, 12.4; Statistics 12.12; Big Ideas 9.4; enVision 9.3; HMH 9.3, 9.6; Larson–Farber 12.9; Larson Precalc 12.13; Reveal 9.5.
- **Tests ask:**

  | Question                                            | Page                | Mark                                                            |
  | --------------------------------------------------- | ------------------- | --------------------------------------------------------------- |
  | NAEP-2009-12M2-#3 (which equation fits the scatter) | main                | Partly: the page fits a line to its own data, not a chosen list |
  | NAEP-2009-12M2-#4 (prediction from the scatter)     | ~correlation        | Solves                                                          |
  | NAEP-2009-12M7-#9 (R negative, S positive)          | ~correlation (sort) | Solves                                                          |
  | NAEP-2013-12M99-#7 (read a point's y)               | main (`at`)         | Solves                                                          |
  | Common: residual of one point                       | main                | Solves                                                          |
  | Common: r's sign and strength                       | ~correlation-r      | Solves                                                          |

- **Main — BUILD `m.9.regression`:**
  - Picture: `scatter` with `residuals: 'plot'` and `residualOf`, from `g.m9-regression-residuals`.
  - Data (fixed, original): Practice hours against Points scored: (1, 52), (2, 58), (3, 61), (4, 68),
    (5, 70), (6, 77), (7, 80), (8, 86).
  - Values: slope m, intercept b, input x, prediction ŷ, the point number k (`allowed` 1–8), the
    residual e (`derived`).
  - Relations ŷ = mx + b and e = y_k − (m·x_k + b).
  - Assumptions:
    - Residual = actual − predicted; a point above the line has a positive residual.
    - A good line leaves residuals scattered about 0 with no pattern.
    - Predict only inside the data's x values.
  - Example: ŷ = 5x + 47. Point 3 (3, 61): ŷ = 62, e = −1. At x = 4.5, ŷ = 69.5.
  - `startWith: ['x', 'm', 'b', 'k']`.
- **~correlation-r — BUILD:**
  - Picture: `scatter` with `r: true` and `leastSquares: 'fit'`, from `g.m9-regression-least-squares`.
    The weak case is `g.m9-regression-weak`.
  - Data (original): outside temperature (°F) against hot drinks sold: (40, 60), (45, 52), (50, 57),
    (55, 46), (60, 50), (65, 41), (70, 45), (75, 36).
  - Least squares: ŷ ≈ −0.59x + 82.19, r ≈ −0.90, a strong negative correlation. Checked: x̄ = 57.5,
    ȳ = 48.375.
  - Values: slope and intercept (the rounded numbers), r, x, ŷ.
  - Example: at 62 °F, ŷ ≈ −0.59(62) + 82.19 ≈ 45.7, about 46 drinks.
- **~correlation — BUILD (sort):**
  - Bins: "Positive correlation", "Negative correlation", "No correlation".
  - Cards: `scatter` card figures rise, fall and scatter; "r = 0.91", "r = −0.78", "r = 0.04"; "Height
    and arm span" (positive); "Age of a bike and its resale price" (negative); "Shoe size and quiz
    score" (none).
  - Sentence: "The sign of r says which way the points go; how close r is to 1 or −1 says how tight
    they are."
- **Verdict:** 3 pages; 3 of 4 released items Solved, 1 Partly.

### 7. m.9.inequality-systems — Systems by elimination, and systems of linear inequalities

- **Standard:** A-REI.5, A-REI.6, A-REI.12, A-CED.3.
- **Textbooks:** Eureka HS 9.1, 10.4; IM 9.2; OpenStax A&T 9.2, 12.11; Elementary 9.2–9.5; Intermediate 11.2–11.4, 11.9; Precalc 12.9; Big Ideas 9.2, 9.5; enVision 9.1, 9.4; HMH 9.1, 9.4; Larson 12.7; Reveal 9.6, 9.7, 11.2.
- **Tests ask:**

  | Question                                                                                        | Page                      | Mark                                      |
  | ----------------------------------------------------------------------------------------------- | ------------------------- | ----------------------------------------- |
  | NAEP-2024-12M11-#11 (−1 ≤ x ≤ 1 and −2 ≤ y ≤ 2 shaded)                                          | main                      | No: upright boundaries not drawn (need 4) |
  | NAEP-2005-12M3-#15, NAEP-1990-12M7-#7, NAEP-2013-12M99-#1, NAEP-2024-12M2-#2, MCAS-2026-G10M-#3 | mis-filed; see skills 1–3 | —                                         |
  | Common: solve by elimination                                                                    | ~elimination              | Solves                                    |
  | Common: is a point a solution of the system                                                     | main (test point)         | Solves                                    |
  | Common: a budget and count story with two inequalities                                          | ~modeling                 | Solves                                    |

- **Main — BUILD `m.9.inequality-systems`:**
  - Picture: `lineSystem` with two shaded lines, a crossing and a test point, from
    `g.m9-inequality-systems-shade`. Parallel lines use `g.m9-inequality-systems-parallel`.
  - Equation, two lines with fixed signs: `y > {m1}x + {b1}` over `y ≤ {m2}x + {b2}`.
  - Values: m1, m2 −10..10; b1, b2 −10..10; the crossing x, y (`derived`); the test point tx, ty.
  - Relation: the crossing, x = (b2 − b1)/(m1 − m2).
  - Assumptions:
    - A dashed line (< or >) is not included; a solid one (≤ or ≥) is.
    - The solutions are where the two shadings overlap.
    - Test a point by putting it into both inequalities.
  - Example: y > x − 2 and y ≤ −2x + 4 cross at (2, 0). Test (0, 0): 0 > −2 and 0 ≤ 4, so it is in both.
  - `startWith: ['tx', 'ty', 'm1', 'b1', 'm2', 'b2']`.
- **~elimination — BUILD:**
  - Picture: `lineSystem` with `sum` and `fixed`, from `g.m9-inequality-systems-elimination`.
  - Equation `{a}x + {b}y = {c}` over `{d}x + {e}y = {f}` (the system template).
  - Values: a–f integers −12..12; the multipliers k1, k2 (`derived`, from the least common multiple of
    |b| and |e|); x, y solved. That is 10 values.
  - Example: 3x + 2y = 16 and 5x − 4y = 12. Multiply the first by 2: 6x + 4y = 32. Add: 11x = 44 →
    x = 4; 2y = 16 − 12 → y = 2. Check: 20 − 8 = 12. The sum line x = 4 is upright.
- **~modeling — BUILD:**
  - Rows with roles: price A ($), price B ($), budget ($), ticket limit, the test point (a, s), and
    the crossing (`derived`).
  - Picture: `lineSystem` with `quadrants: 1`, both lines shaded ≤.
  - Relations: 10a + 6s ≤ 144 and a + s ≤ 20, drawn as s ≤ −(5/3)a + 24 and s ≤ −a + 20.
  - Example: adult $10, student $6, $144 and at most 20 tickets. The lines cross at (6, 14):
    60 + 84 = 144. The test point (5, 12) is inside: 17 ≤ 20 and 122 ≤ 144.
- **Verdict:** 3 pages; the one item filed correctly waits on need 4; 5 items are re-filed.

### 8. m.9.piecewise-functions — Piecewise, step and absolute value functions

- **Standard:** F-IF.7b, F-BF.3, F-IF.2.
- **Textbooks:** Big Ideas 9.4; enVision 9.5, 11.1; Reveal 9.4.
- **Tests ask:**

  | Question                                                                                  | Page               | Mark        |
  | ----------------------------------------------------------------------------------------- | ------------------ | ----------- |
  | MCAS-2026-G10M-#14 (rental: fee, then a rate past 100 miles; filed under linear-modeling) | ~context           | Solves      |
  | NAEP-1992-12M15-#8 (y = \|f(x)\|, filed under absolute-value)                             | ~absolute-function | No (need 6) |
  | Common: evaluate a piecewise f at a break                                                 | main               | Solves      |
  | Common: a step (per started hour) cost                                                    | ~step              | Solves      |
  | Common: vertex and zeros of a\|x − h\| + k                                                | ~absolute-function | Solves      |

- **Main — BUILD `m.9.piecewise-functions`:**
  - Picture: `functionGraph` piecewise, from `g.m9-piecewise-functions-pieces`: two pieces, open end at
    p on the left piece and closed on the right.
  - Values: the break p, m1, b1, m2, b2, x, y. That is 7 values.
  - Relation: y = m1x + b1 when x < p, else m2x + b2.
  - Assumptions:
    - Use the piece whose condition x meets.
    - At the break, the closed dot is the value.
    - The pieces need not meet.
  - Example: f(x) = x + 2 for x < 1, −2x + 7 for x ≥ 1. f(1) = 5 (not 3); f(3) = 1; f(−2) = 0.
  - `startWith: ['x', 'p', 'm1', 'b1', 'm2', 'b2']`.
- **~context — BUILD:**
  - Rows: plan fee F ($), included amount L (GB), extra rate r ($ per GB), use u (GB), cost C ($).
  - Relation C = F + r·max(0, u − L). Solve u from C when C > F.
  - Picture: `functionGraph` piecewise with a flat piece to L and a rising piece after it.
  - Example: $30 for up to 5 GB, $8 per GB over: C(8) = 30 + 8 × 3 = $54; C(4) = $30; C = $70 → u = 10 GB.
- **~step — BUILD:**
  - Picture: `functionGraph` piecewise step, from `g.m9-piecewise-functions-step`.
  - Values: the rate per started hour ($), hours h, charged hours (`derived`, rounded up), cost.
  - Example: $4 per started hour, 2.5 h → 3 hours charged → $12.
- **~absolute-function — BUILD:**
  - Picture: `functionGraph` absolute with marks vertex and zeros, from `g.m9-absolute-value-vertex`.
  - Equation `y = {a}|x − {h}| + {k}`. Values: a −5..5, a ≠ 0; h, k −10..10; the zeros (`derived`);
    x, y.
  - Example: y = −2|x − 1| + 6. Vertex (1, 6), opening down. Zeros: |x − 1| = 3 → x = −2, 4. f(0) = 4.
- **Verdict:** 4 pages; the mis-filed MCAS item is Solved, and the |f(x)| NAEP item waits on need 6.

### 9. m.9.radicals — Exponent properties, rational exponents, simplifying radicals

- **Standard:** N-RN.1, N-RN.2, N-RN.3, A-SSE.2.
- **Textbooks:** Eureka HS 10.2, 11.1, 11.3; IM 9.7, 11.3; OpenStax A&T 9.1, 9.2, 11.5; Elementary 9.9; Intermediate 11.8; Precalc 12.3; Big Ideas 9.6, 9.9, 9.10, 11.5; enVision 9.6, 9.10, 11.5; HMH 9.1, 11.3; Reveal 9.8, 11.6.
- **Tests ask:**

  | Question                                                       | Page                                         | Mark                                                                                   |
  | -------------------------------------------------------------- | -------------------------------------------- | -------------------------------------------------------------------------------------- |
  | NAEP-2013-12M99-#9 (16^(3/2))                                  | ~rational-exponent                           | Solves (= 64)                                                                          |
  | NAEP-2024-12M4-#1 ((√2 + √3)²)                                 | ~multiply                                    | Partly: the page multiplies two radicals; the square of a sum needs the cross term 2√6 |
  | MCAS-2026-G10M-#32 (4x⁸/x², x²/x⁻²)                            | ~monomials                                   | Solves                                                                                 |
  | MCAS-2026-G10M-#13 (which are irrational; rational + rational) | ~rational-or-irrational                      | Solves                                                                                 |
  | NAEP-1990-12M9-#16 (integers between √15 and √63)              | m.8.roots-irrationals (`rootSquare` between) | Partly                                                                                 |
  | NAEP-1992-12M12-#7 (√8·N = 3⁵)                                 | —                                            | No: a one-step equation with a radical coefficient                                     |

- **Main — BUILD `m.9.radicals`:**
  - Picture: `factorTree` with `root: { index: 2, outside: 'k', inside: 'r' }`, from
    `g.m9-radicals-simplify`. A perfect square uses `g.m9-radicals-perfect-square`.
  - Equation `√{n} = {k}√{r}` (H83).
  - Values: n integers 2..1000; k and r (`derived`, with r having no square factor but 1).
  - Relation n = k²·r, with k = √(largest perfect square factor of n).
  - Assumptions:
    - √(ab) = √a · √b for a, b ≥ 0.
    - Each pair of equal prime factors comes out as one.
    - The radical is simplest when no square factor but 1 is left inside.
  - Example: √180 = √(36 × 5) = 6√5, since 180 = 2 × 2 × 3 × 3 × 5.
  - `startWith: ['n']`.
- **~cube-root — BUILD:**
  - Picture: `factorTree` root index 3, from `g.m9-radicals-cube-root`.
  - Equation `∛{n} = {k}∛{r}`.
  - Example: ∛54 = ∛(27 × 2) = 3∛2.
- **~rational-exponent — BUILD:**
  - Equation `{b}^{{p}/{q}} = {v}` (H81). Values: b 1..1000; p −6..6; q `allowed: [2, 3, 4]`; v solved.
  - Relation v = (q-th root of b)^p.
  - Picture: `table` (Q46) sweeping p over rows 1–4, with output b^(p/q), params [b, q].
  - Example: 27^(2/3) = (∛27)² = 3² = 9.
- **~monomials — BUILD:**
  - Equation `{a}x^{m} ÷ {b}x^{n} = {c}x^{k}`. Values: a, b −50..50, b ≠ 0; m, n −10..10; c and k
    (`derived`).
  - Relations c = a/b, k = m − n.
  - Picture: `table` of x = 1, 2, 3 with both sides (interim; need 8).
  - Example: 12x⁷ ÷ 3x² = 4x⁵.
- **~multiply — BUILD:**
  - Picture: `factorTree` root on the product, from `g.m9-radicals-simplify`.
  - Equation `√{a} × √{b} = √{p} = {k}√{r}`.
  - Example: √6 × √15 = √90 = √(9 × 10) = 3√10.
- **~rational-or-irrational — BUILD (sort):**
  - Bins: "Rational", "Irrational".
  - Cards: √49, √12, −7/4, 0.3̅, 5√2, 3 + √5, √8 × √2 (= 4), √12 ÷ √3 (= 2), π ÷ 2.
  - Sentence: "A sum or product of two rational numbers is rational; a rational number (not 0) times an
    irrational one is irrational."
- **Verdict:** 6 pages; 3 of 6 released items Solved, 2 Partly, 1 No.

### 10. m.9.exponential-functions — Exponential functions: growth and decay

- **Standard:** F-LE.1, F-LE.2, F-LE.3, F-LE.5, F-IF.8b, A-SSE.3c.
- **Textbooks:** Eureka HS 9.3, 9.5, 11.3; IM 9.5, 11.4; OpenStax A&T 11.6; Intermediate 11.10; Precalc 12.4; Big Ideas 9.6, 11.6; enVision 9.6, 11.6; HMH 9.5, 9.6, 9.9, 11.4; Larson 12.3; Reveal 9.8, 9.9, 11.7.
- **Tests ask:**

  | Question                                                                             | Page                   | Mark                                |
  | ------------------------------------------------------------------------------------ | ---------------------- | ----------------------------------- |
  | NAEP-2005-12M12-#14 (initial value of 500(2^t))                                      | main                   | Solves                              |
  | NAEP-2024-12M9-#10 (6, 12, 24 → 6(2ⁿ))                                               | main                   | Solves                              |
  | NAEP-1990-12M9-#15 (1% a month for 6 months)                                         | ~percent-growth        | Solves ($1,061.52)                  |
  | MCAS-2026-G10M-#40 (500(1.015)^t)                                                    | ~percent-growth        | Solves                              |
  | NAEP-2009-12M7-#3 (P = 50,000(1 + r)^t: start; the rate from a doubling in 11 years) | ~percent-growth        | Solves (r ≈ 6.5%, by the t-th root) |
  | NAEP-2005-12M12-#12 (first year a car is worth under half)                           | ~decay (table)         | Solves                              |
  | NAEP-1992-12M5-#15 (doubling every 28 minutes)                                       | ~doubling              | Solves                              |
  | NAEP-2024-12M9-#13 and MCAS-2026-G10M-#28 (which model fits)                         | ~linear-or-exponential | Solves                              |
  | NAEP-1992-12M7-#6 (8¹² = 16^x; filed to m.11.exp-log-equations)                      | —                      | No (Grade 11)                       |

- **Main — MOVE with changes `m.9.exponential-functions`** (from `pilots.ts`; see Decisions):
  - Picture: `functionGraph` exponential with `at` and marks ['intercept', 'asymptotes'], from
    `g.m9-exponential-functions-growth`. Decay uses `g.m9-exponential-functions-decay`.
  - Equation `y = {a}({b})^x` (H82).
  - Values: a 0.01..1,000,000; b 0.01..10; x −10..30; y.
  - Relation y = a·bˣ. Solve y, a, and b (b = (y/a)^(1/x), x ≠ 0). x is not solved from y: that needs
    logarithms.
  - Assumptions:
    - a is the value at x = 0, the y-intercept.
    - b > 1 grows and 0 < b < 1 decays.
    - Each step of 1 in x multiplies y by b.
  - Example: y = 500(2)^x, x = 3 → 500 × 8 = 4,000.
  - `startWith: ['x', 'a', 'b']`.
- **~percent-growth — BUILD (the pilot's relation):**
  - Picture: `functionGraph` exponential, from `g.m9-exponential-functions-compound`.
  - Equation `{A} = {P}(1 + {r})^{t}` (H82), with r typed as a percent (0.1–50) and the step writing
    the decimal.
  - Values: P, r, t (0..100 periods), A. Solve A, P and r.
  - Example: $800 at 3% a year for 4 years: 800(1.03)⁴ = 800 × 1.12550881 ≈ $900.41.
- **~decay — BUILD:**
  - Picture: the pilot's `table` (Q46): sweep t over rows 0–10, output A.
  - Equation `{A} = {P}(1 − {r})^{t}`, with r from 0.1% to 99%.
  - Example: an $18,000 car loses 15% a year. After 3 years: 18,000(0.85)³ = $11,054.25. The table
    shows year 5 ($7,986.70) as the first year under $9,000; year 4 is still $9,396.11.
- **~doubling — BUILD:**
  - Equation `{N} = {N0}(2)^{{t}/{T}}` (H81 and H82).
  - Picture: `table` with rows (v) => [0, 1, 2, 3, 4, 5] × T.
  - Example: 400 cells doubling every 3 hours; after 12 hours, 400 × 2⁴ = 6,400.
- **~linear-or-exponential — BUILD (sort):**
  - Bins: "Linear: adds the same amount each step", "Exponential: multiplies by the same factor each
    step".
  - Cards: "Saves $15 each week", "Doubles every 20 minutes", "Loses 8% of its value each year", "Grows
    3 cm each month", "y: 5, 15, 45, 135", "y: 5, 15, 25, 35", "y = 4 + 3x", "y = 4(3)^x", "Each person
    passes a note to 4 new people".
  - Sentence: "Over equal steps a linear function adds the same amount; an exponential one multiplies
    by the same factor."
- **Verdict:** 5 pages (the pilot moved and split); 9 of 10 items Solved, and the one No is Grade 11.

### 11. m.9.sequences — Arithmetic and geometric sequences

- **Standard:** F-IF.3, F-BF.1a, F-BF.2, F-LE.2.
- **Textbooks:** Eureka HS 9.3; IM 11.1; OpenStax A&T 12.13; Intermediate 11.12; Precalc 12.11; Big Ideas 9.4, 9.6, 11.11; enVision 9.3, 9.6; HMH 9.3, 9.6, 11.6; Larson 12.9; Reveal 9.4, 9.9.
- **Tests ask:**

  | Question                                            | Page                        | Mark                                                   |
  | --------------------------------------------------- | --------------------------- | ------------------------------------------------------ |
  | NAEP-1990-12M7-#16 (3, 5, 7, 9 dots → 100th figure) | main                        | Partly: n = 100 is past `termsChart` count 30 (need 5) |
  | NAEP-2005-12M12-#5 (twice the previous plus 1)      | ~recursive                  | Solves                                                 |
  | NAEP-2005-12M3-#17 (3, 5, 9, 17, 33)                | ~recursive (aₙ = 2aₙ₋₁ − 1) | Solves                                                 |
  | NAEP-1992-12M12-#2 (+9, −2 alternating)             | —                           | No (a pattern with two steps)                          |
  | NAEP-2009-12M7-#8 (half the sum of the two before)  | —                           | No (a two-term recursion)                              |
  | NAEP-1990-12M9-#20 (aₙ₊₁ = √aₙ + 1)                 | —                           | No                                                     |
  | NAEP-1996-12M13-#9 (tile figures, the 20th)         | main                        | Partly: depends on the figure growth                   |

- **Main — BUILD `m.9.sequences`:**
  - Picture: `termsChart` arithmetic with points, from `g.m9-sequences-arithmetic`.
  - Equation `aₙ = {a1} + ({n} − 1){d}`. Values: a1 −100..100; d −50..50; n 1..1000 (the chart draws
    the first 30); aₙ.
  - Relation aₙ = a₁ + (n − 1)d. Solve aₙ, a₁, d and n (n must come out a whole number).
  - Assumptions:
    - Each term adds the same difference d.
    - n counts terms from 1.
    - An arithmetic sequence is a linear function of n.
  - Example: 7, 11, 15, … → a₂₀ = 7 + 19 × 4 = 83.
  - `startWith: ['n', 'a1', 'd']`.
- **~geometric — BUILD:**
  - Picture: `termsChart` geometric, from `g.m9-sequences-geometric`.
  - Equation `aₙ = {a1} × {r}^{{n} − 1} = {an}` (H81).
  - Example: 3, 6, 12, … → a₈ = 3 × 2⁷ = 384.
- **~recursive — BUILD:**
  - Values: a₁, multiplier k, added c, n (1–10), aₙ.
  - Relation aₙ = k·aₙ₋₁ + c, with the steps listing each term.
  - Picture: `table` (Q46) over n = 1–8 (interim; need 11).
  - Example: a₁ = 2, each term 3 times the one before minus 1: 2, 5, 14, 41 → a₄ = 41.
- **Verdict:** 3 pages; 2 of 7 Solved, 2 Partly, 3 No (beyond the Algebra 1 sequence forms).

### 12. m.9.polynomial-operations — Adding, subtracting and multiplying polynomials

- **Standard:** A-APR.1, A-SSE.1.
- **Textbooks:** Eureka HS 9.1; IM 9.6; OpenStax A&T 9.1; Elementary 9.6; Intermediate 11.5; Big Ideas 9.7; enVision 9.7; HMH 9.7; Reveal 9.10.
- **Tests ask:**

  | Question                                             | Page                   | Mark                             |
  | ---------------------------------------------------- | ---------------------- | -------------------------------- |
  | MCAS-2026-G10M-#19 ((2x − 5)(3x + 1))                | main                   | Solves: 6x² − 13x − 5            |
  | NAEP-2005-12M12-#11 (area picture of (x + 2)(x + 4)) | main (tiles rectangle) | Solves                           |
  | NAEP-2009-12M2-#5 ((a + b)(x + y) not equivalent)    | —                      | Partly: the tiles use one letter |
  | NAEP-1992-12M14-#10 ((10n + 5)² = 100n(n + 1) + 25)  | ~square                | Partly (a proof)                 |
  | Common: subtract two trinomials                      | ~add-subtract          | Solves                           |

- **Main — BUILD `m.9.polynomial-operations`:**
  - Picture: `algebraTiles` 'rectangle' with `given: 'factors'`, from
    `g.m9-polynomial-operations-multiply`.
  - Equation `({a}x + {b})({c}x + {d}) = {p}x² + {q}x + {r}`.
  - Values: a, b, c, d −10..10 (the tile edges); p, q, r (`derived`).
  - Relations p = ac, q = ad + bc, r = bd.
  - Assumptions:
    - Every term of one factor multiplies every term of the other.
    - Combine the two x terms.
    - A negative times a negative is positive.
  - Example: (2x + 3)(x − 4) = 2x² − 8x + 3x − 12 = 2x² − 5x − 12.
  - `startWith: ['a', 'b', 'c', 'd']`.
- **~add-subtract — BUILD:**
  - Picture: `algebraTiles` 'collect', from `g.m9-polynomial-operations-add`. Subtracting uses
    `g.m9-polynomial-operations-zero-pairs` (add the opposite).
  - Equation `({a}x² + {b}x + {c}) {o:op} ({d}x² + {e}x + {f}) = {p}x² + {q}x + {r}` (10 values).
  - Example: (3x² − 2x + 5) − (x² + 4x − 1) = 2x² − 6x + 6.
- **~square — BUILD:**
  - Picture: `algebraTiles` rectangle with equal factors.
  - Equation `({a}x + {b})² = {p}x² + {q}x + {r}`.
  - Example: (3x − 2)² = 9x² − 12x + 4 (not 9x² + 4).
- **~box — BUILD after need 7:** a binomial times a trinomial in an area box.
  - Example: (x + 2)(x² − 3x + 4) = x³ − x² − 2x + 8.
- **Verdict:** 4 pages (1 waits); 2 of 4 released Solved, 2 Partly.

### 13. m.9.factoring — Factoring: GCF, trinomials, special products

- **Standard:** A-SSE.2, A-SSE.3a.
- **Textbooks:** Eureka HS 9.4; IM 9.6, 9.7; OpenStax A&T 9.1, 9.2; Elementary 9.7; Intermediate 11.6; Big Ideas 9.7; enVision 9.7, 9.9; HMH 9.8; Reveal 9.10, 9.11.
- **Tests ask:**

  | Question                                              | Page                                  | Mark                               |
  | ----------------------------------------------------- | ------------------------------------- | ---------------------------------- |
  | MCAS-2026-G10M-#10 (x² − x − 12)                      | main                                  | Solves: (x + 3)(x − 4)             |
  | MCAS-2026-G10M-#8 (which form shows the x-intercepts) | m.9.quadratic-functions~factored-form | Solves (re-file)                   |
  | NAEP-2005-12M4-#16 (x² + 7x + 6 ≥ 0)                  | m.9.quadratic-formula~inequality      | Solves once need 2 lands (re-file) |
  | NAEP-2005-12M12-#11 (area of (x + 2)(x + 4))          | m.9.polynomial-operations             | Solves                             |
  | Common: a ≠ 1 trinomial                               | ~leading-coefficient                  | Solves                             |
  | Common: GCF; difference of squares                    | ~gcf, ~special                        | Solves                             |

- **Main — BUILD `m.9.factoring`:**
  - Picture: `algebraTiles` rectangle with `given: 'product'`, from `g.m9-factoring-trinomial`.
    Negative constants use `g.m9-factoring-negative`.
  - Equation `x² + {b}x + {c} = (x + {p})(x + {q})`.
  - Values: b −20..20, c −100..100; p and q (`derived`, integers −10..10, and only when b² − 4c is a
    perfect square; otherwise the page says "does not factor over the integers").
  - Relations p + q = b, pq = c.
  - Assumptions:
    - Find two numbers whose product is c and whose sum is b.
    - Check by multiplying back.
    - Not every trinomial factors over the integers.
  - Example: x² + 2x − 15 = (x + 5)(x − 3), since 5 × (−3) = −15 and 5 + (−3) = 2.
  - `startWith: ['b', 'c']`.
- **~leading-coefficient — BUILD:**
  - Picture: `algebraTiles` rectangle, product given.
  - Equation `{a}x² + {b}x + {c} = ({p}x + {q})({r}x + {s})`.
  - Steps use the ac method: ac = 6; 6 and 1 sum to 7; 2x² + 6x + x + 3 = 2x(x + 3) + 1(x + 3).
  - Example: 2x² + 7x + 3 = (2x + 1)(x + 3).
- **~gcf — BUILD:**
  - Picture: `algebraTiles` rectangle with factors (g·x + 0)(p·x + q).
  - Equation `{a}x² + {b}x = {g}x({p}x + {q})`.
  - Example: 6x² + 15x = 3x(2x + 5).
- **~special — BUILD:**
  - Picture: `algebraTiles` rectangle; the cancelling x tiles are struck.
  - Equation `{a}x² − {c} = ({p}x + {q})({p}x − {q})`, where a and c are perfect squares.
  - Example: 9x² − 25 = (3x + 5)(3x − 5).
- **Verdict:** 4 pages; the 1 item filed correctly is Solved, and 3 items re-filed are Solved elsewhere.

### 14. m.9.quadratic-functions — Graphing quadratics: vertex, axis of symmetry, zeros

- **Standard:** F-IF.4, F-IF.7a, F-IF.8a, A-APR.3, A-SSE.3b.
- **Textbooks:** Eureka HS 9.4, 9.5; IM 9.6, 9.7, 11.5; OpenStax A&T 9.3, 11.5; Elementary 9.7, 9.10; Intermediate 11.9; Precalc 12.1, 12.3; Big Ideas 9.8, 9.9, 11.2; enVision 9.8, 9.9, 11.2; HMH 9.8, 9.9, 11.1; Larson 12.2; Reveal 9.11, 11.3.
- **Tests ask:**

  | Question                                                   | Page                             | Mark                                         |
  | ---------------------------------------------------------- | -------------------------------- | -------------------------------------------- |
  | MCAS-2026-G10M-#21 (vertex of −(x − 2)² − 5)               | main                             | Solves                                       |
  | NAEP-2024-12M2-#10 (vertex (−3, 6), y-intercept 2 → graph) | main                             | Solves: typing the intercept solves a = −4/9 |
  | MCAS-2026-G10M-#38 (range from a graph)                    | main (marks range)               | Solves                                       |
  | NAEP-2024-12M11-#1 (y-intercept of x² − 2x − 3)            | ~standard-form                   | Solves                                       |
  | NAEP-1992-12M7-#9 (f(3.5), decimals)                       | ~standard-form (`at`)            | Solves                                       |
  | MCAS-2026-G10M-#8 (which form shows the zeros)             | ~factored-form                   | Solves                                       |
  | NAEP-2005-12M4-#16 (x² + 7x + 6 ≥ 0)                       | m.9.quadratic-formula~inequality | Solves after need 2                          |

- **Main — BUILD `m.9.quadratic-functions`:**
  - Picture: `functionGraph` quadratic vertex form with marks ['vertex', 'zeros', 'intercept', 'range']
    and `at`, from `g.m9-quadratic-functions-vertex`.
  - Equation `y = {a}(x − {h})² + {k}`.
  - Values: a −10..10, a ≠ 0; h, k −20..20; the y-intercept c (`derived`, or typed to solve a); the
    zeros x1, x2 (`derived`, when −k/a ≥ 0); x, y. That is 8 values.
  - Relations c = a·h² + k and y = a(x − h)² + k.
  - Assumptions:
    - The vertex is (h, k) and the axis of symmetry is x = h.
    - a > 0 opens up, with a least value k; a < 0 opens down.
    - The zeros are where y = 0.
  - Example: y = 2(x − 1)² − 8. Vertex (1, −8), axis x = 1. Zeros: (x − 1)² = 4 → x = −1, 3.
    y-intercept 2 − 8 = −6.
  - `startWith: ['x', 'a', 'h', 'k']`.
- **~standard-form — BUILD:**
  - Picture: `functionGraph` quadratic standard, from `g.m9-quadratic-functions-standard`.
  - Equation `y = {a}x² + {b}x + {c}`.
  - Relations h = −b/(2a), k = f(h).
  - Example: y = x² − 6x + 5. h = 3, k = 9 − 18 + 5 = −4, zeros 1 and 5, y-intercept 5.
- **~factored-form — BUILD:**
  - Picture: `functionGraph` quadratic factored, from `g.m9-quadratic-formula-factored`.
  - Equation `y = {a}(x − {p})(x − {q})`.
  - Example: y = −2(x − 1)(x − 5). Zeros 1 and 5, axis x = 3, vertex y = −2(2)(−2) = 8, y-intercept
    −2(−1)(−5) = −10.
- **~projectile — BUILD:**
  - Rows, because of the units: g, launch speed v, start height h₀, time t, height h.
  - Picture: `functionGraph` from `g.m9-quadratic-functions-projectile`, with axes Time (s) and Height (m).
  - Relation h = −½gt² + vt + h₀; the step converts to m and s first.
  - Example: h = −4.9t² + 19.6t + 2 (m). The top is at t = 19.6 ÷ 9.8 = 2 s, h = 21.6 m. It lands at
    t = (19.6 + √423.36)/9.8 ≈ 4.10 s.
- **Verdict:** 4 pages; 6 of 7 items Solved here, and the 7th is Solved on quadratic-formula after need 2.

### 15. m.9.quadratic-formula — Solving quadratics: square roots, completing the square, the formula

- **Standard:** A-REI.4a, A-REI.4b, A-SSE.3a, A-SSE.3b.
- **Textbooks:** Eureka HS 9.4; IM 9.7; OpenStax A&T 9.2; Elementary 9.10; Intermediate 11.9; Big Ideas 9.9, 11.3; enVision 9.9, 11.2; HMH 9.8, 11.1; Reveal 9.11, 11.3.
- **Tests ask:**

  | Question                                          | Page             | Mark                                                                |
  | ------------------------------------------------- | ---------------- | ------------------------------------------------------------------- |
  | NAEP-1990-12M7-#21 (roots of 2x² + 5x + 1 = 0)    | main             | Solves, if the answer is written (−5 ± √17)/4 before ≈ −0.22, −2.28 |
  | NAEP-2005-12M4-#16 (x² + 7x + 6 ≥ 0)              | ~inequality      | Solves after need 2                                                 |
  | Common: solve by square roots                     | ~square-roots    | Solves                                                              |
  | Common: complete the square                       | ~complete-square | Solves                                                              |
  | Common: number of solutions from the discriminant | main             | Solves                                                              |

- **Main — BUILD `m.9.quadratic-formula`:**
  - Picture: `functionGraph` quadratic standard, marks zeros, from `g.m9-quadratic-formula-zeros`.
  - Equation `{a}x² + {b}x + {c} = 0`, with the two roots as rows.
  - Values: a −20..20, a ≠ 0; b, c −100..100; the discriminant D, x1 and x2 (`derived`).
  - Relations D = b² − 4ac and x = (−b ± √D)/(2a).
  - Assumptions:
    - First write the equation = 0.
    - D > 0 gives two roots, D = 0 one, and D < 0 no real roots.
    - Leave √D exact when D is not a perfect square.
  - Example: 2x² − 3x − 5 = 0. D = 9 + 40 = 49; x = (3 ± 7)/4 → x = 2.5 or x = −1.
  - `startWith: ['a', 'b', 'c']`.
- **~square-roots — BUILD:**
  - Picture: `functionGraph` vertex form with zeros.
  - Equation `(x + {p})² = {q}`.
  - Example: (x − 3)² = 25 → x − 3 = ±5 → x = 8 or x = −2.
- **~complete-square — BUILD:**
  - Picture: `algebraTiles` 'square', from `g.m9-quadratic-formula-complete-square` (the negative case:
    `g.m9-quadratic-formula-square-negative`).
  - Equation `x² + {b}x + {c} = 0`. b is even, −10..10, so each edge holds its tiles.
  - Example: x² + 6x − 7 = 0 → x² + 6x + 9 = 16 → (x + 3)² = 16 → x = 1 or x = −7.
- **~inequality — BUILD:**
  - Picture: `functionGraph` with `shade`, from `g.m9-quadratic-formula-inequality`.
  - Equation `x² + {b}x + {c} {s:sign} 0`. Until need 2, two fixed-sign pages.
  - Example: x² − 2x − 8 < 0 → (x − 4)(x + 2) < 0 → −2 < x < 4.
- **Verdict:** 4 pages; the released item is Solved, and the re-filed NAEP inequality after need 2.

### 16. m.9.data-displays — One-variable statistics: histograms, box plots, SD, outliers

- **Standard:** S-ID.1, S-ID.2, S-ID.3.
- **Textbooks:** Eureka HS 9.2; IM 9.1; OpenStax Statistics 12.2, 12.4, 12.10, 12.12; Big Ideas 9.11, 11.9; enVision 9.11, 11.11; HMH 9.10; Larson–Farber 12.2, 12.6; Reveal 9.12.
- **Tests ask:** (no released questions; common types)

  | Question                                          | Page                | Mark            |
  | ------------------------------------------------- | ------------------- | --------------- |
  | Shape of a histogram, and mean against median     | main                | Solves          |
  | 1.5 × IQR outliers                                | ~outliers           | Solves          |
  | Standard deviation of a small data set            | ~standard-deviation | Solves          |
  | Compare two groups' box plots (center and spread) | ~compare            | Partly (need 9) |
  | Effect of an outlier on mean and median           | ~outliers caption   | Partly          |

- **Main — BUILD `m.9.data-displays`:**
  - Rows. Picture: `histogram` with `counts`, from `g.m9-data-displays-frequency`, with mean: true and
    shape: true. The bimodal case is `g.m9-data-displays-bimodal`.
  - Values: six bin counts f1–f6 (0..50), n and the estimated mean (`derived`). That is 8 values.
  - Relations n = Σf and mean ≈ Σ(midpoint × f)/n. Bins start at 0 with width 10; axis "Minutes of
    reading".
  - Assumptions:
    - A histogram groups values into equal bins; the left end is in and the right end out.
    - From counts the mean is an estimate from midpoints.
    - A long right tail pulls the mean above the median.
  - Example: counts 2, 5, 8, 6, 3, 1 → n = 25. Mean ≈ (10 + 75 + 200 + 210 + 135 + 55)/25 =
    685/25 = 27.4 min. The shape is skewed right.
  - `startWith: ['f1', 'f2', 'f3', 'f4', 'f5', 'f6']`.
- **~outliers — BUILD:**
  - Picture: `boxPlot` with `fences`, from the five-number summary (no data list; the 11-point data list
    needs need 9), from `g.m9-data-displays-outliers`.
  - Values: min, Q1, median, Q3, max; IQR, and the lower and upper fences (`derived`). That is 8 values.
  - Example: 12, 20, 24, 28, 45. IQR = 8; fences 20 − 12 = 8 and 28 + 12 = 40, so 45 is an outlier.
- **~standard-deviation — BUILD:**
  - Picture: `dotPlot` with `sd: { id: 'sd', kind: 'population' }` and `mean`, from
    `g.m9-data-displays-sd`.
  - Values: 8 data values, the mean and the SD (`derived`). That is 10 values.
  - Example: 1, 3, 3, 5, 5, 7, 7, 9. Mean 5; squared deviations total 48; σ = √(48/8) = √6 ≈ 2.45.
    6 of the 8 values are within one SD (2.55 to 7.45).
- **~compare — BUILD after need 9:**
  - Picture: `boxPlot` with `second` and `labels`, from `g.m9-data-displays-compare`.
  - Values: two five-number summaries (10) plus the two IQRs and the difference of the medians.
- **Verdict:** 4 pages (1 waits); common types Solved, with 2 Partly.

### 17. m.9.two-way-tables — Two-way frequency tables and relative frequency

- **Standard:** S-ID.5.
- **Textbooks:** OpenStax Statistics 12.1; Big Ideas 9.11, 10.13, 11.8; enVision 9.11; Reveal 10.12.
- **Tests ask:** (no released questions; common types)

  | Question                                                       | Page         | Mark                      |
  | -------------------------------------------------------------- | ------------ | ------------------------- |
  | Joint relative frequency of a cell                             | main         | Solves                    |
  | Marginal relative frequency                                    | ~marginal    | Solves                    |
  | Conditional relative frequency by row; is there an association | ~conditional | Solves                    |
  | Fill in a missing cell from the totals                         | main         | Solves (a total is typed) |

- **Main — BUILD `m.9.two-way-tables`:**
  - Rows. Picture: `table` `twoWay`, from `g.m9-two-way-tables-joint`: rows Grade 9 and Grade 10;
    columns Plays an instrument, Does not; cells a, b, c, d; lit cell (0, 0); of: 'total'.
  - Values: a, b, c, d (0..500), the grand total n and the joint relative frequency p (`derived`).
  - Relations n = a + b + c + d and p = a/n.
  - Assumptions:
    - A relative frequency is a count divided by a total.
    - A joint frequency divides by the grand total.
    - Row and column totals are the margins.
  - Example: 18, 22 / 12, 28 → n = 80; p = 18/80 = 0.225.
  - `startWith: ['a', 'b', 'c', 'd']`.
- **~marginal — BUILD:**
  - Picture: `table` `twoWay` from `g.m9-two-way-tables-marginal`, with a column lit.
  - Example: plays an instrument, 30/80 = 0.375.
- **~conditional — BUILD:**
  - Picture: `table` `twoWay` with lit row, of: 'row' and bar: 'rows'.
  - Example: of Grade 9, 18/40 = 0.45 play; of Grade 10, 12/40 = 0.30. The rows differ, so grade and
    playing are associated.
  - Refresh m.8.scatter-plots~two-way-table.
- **Verdict:** 3 pages; all common types Solved.

## Engine and picture needs

1. **`integerLine` window from its values.** The line fits its bounds or center (min and max now
   literal): 10 ≤ x ≤ 30, 344–356 g. It also needs ticks every 5 or 10 past ±10. Waiting:
   m.9.linear-inequalities (main at ±20, ~compound), m.9.absolute-value~tolerance.
2. **A sign box that drives the picture.** `lineSystem`/`linearFunction` `shade`, `functionGraph`
   `shade` and `integerLine` `compound.closed` take a value id holding the sign code (1–4), flipping
   with the page's sign rule. Waiting: m.9.linear-inequalities~two-variables, the standard-form
   m.9.inequality-systems page (the EQUATION_INPUTS template), m.9.quadratic-formula~inequality.
3. **`integerLine` compound `join: 'equal'`.** Two closed dots at c ± d with the distance bracketed and
   nothing shaded. Waiting: m.9.absolute-value main.
4. **`lineSystem` upright boundary x ≥ k** (a line given as x = k). Waiting: the NAEP box region
   (NAEP-2024-12M11-#11) on m.9.inequality-systems.
5. **`termsChart` past 30 terms.** The first terms, a break, then the nth term drawn. Waiting:
   m.9.sequences main for n = 100.
6. **`functionGraph` `abs: true`.** Draws |f(x)| with the parts below the axis reflected, the original
   dashed. Waiting: m.9.piecewise-functions~absolute-function (NAEP-1992-12M15-#8).
7. **An area box (generic rectangle)** for polynomial × polynomial past the tiles (x³, more than 10 a
   side). Waiting: m.9.polynomial-operations~box.
8. **A monomial picture:** xᵐ written as m factors, n of them struck in a quotient (and negative
   exponents as factors under the bar). Waiting: m.9.radicals~monomials (table interim).
9. **The 10-value cap and data lists.** Let a page's data list (from the picture's `data`) count as one
   value in standards.test.ts, or allow 12 for statistics pages. Waiting: m.9.data-displays~compare,
   and ~outliers from its data.
10. **Signed boxes in templates:** `x − {x1}` and `x − {h}` with a negative value must draw "x + 3".
    Check the equation input and the step text. Waiting: m.9.linear-modeling, m.9.quadratic-functions,
    m.9.piecewise-functions~absolute-function.
11. **A recursive sequence chart:** `termsChart` type 'recursive' { first, times, plus }, each term drawn
    from the one before. Waiting: m.9.sequences~recursive (table interim).
12. **Harness phrases:** "±" lines ("x = (3 ± 7)/4 → 2.5 or −1"), "largest perfect square factor"
    (taught), "rounded down to a whole number" and "rounded up", and "x − (−3) = x + 3". Waiting:
    quadratic-formula, linear-inequalities~whole-number-answers, piecewise~step.

## Not in the taxonomy

- Mis-filed questions (`[data] research/questions`):
  - NAEP-2005-12M3-#15 → m.9.absolute-value.
  - NAEP-1990-12M7-#7, NAEP-2013-12M99-#1 and MCAS-2026-G10M-#3 → m.9.linear-inequalities.
  - NAEP-2024-12M2-#2 → m.9.solving-equations.
  - MCAS-2026-G10M-#42 → m.9.function-notation (domain).
  - MCAS-2026-G10M-#14 → m.9.piecewise-functions.
  - MCAS-2026-G10M-#8 → m.9.quadratic-functions.
  - NAEP-2005-12M4-#16 → m.9.quadratic-formula (a quadratic inequality).
  - NAEP-1992-12M15-#8 → m.9.piecewise-functions (graph of |f(x)|).
- Average rate of change (F-IF.6) has no skill; planned under m.9.function-notation.
- Parallel and perpendicular lines (G-GPE.5) are taught in Algebra 1 (Big Ideas, Reveal) and have no
  Grade 9 skill; planned under m.9.linear-modeling.
- Rational and irrational sums and products (N-RN.3) are not in the m.9.radicals title; add them.
- Solving quadratics by factoring (the zero product property) is not in the m.9.quadratic-formula
  title; it is planned there and on ~factored-form.
- Quadratic inequalities are not an Algebra 1 standard, but NAEP asks one; planned as
  m.9.quadratic-formula~inequality.
- Inverse functions are taught in IM Algebra 1 Unit 4 but sit in m.11.inverse-functions; a link from
  m.9.function-notation's related lessons is enough.

## Priority

1. MOVE the pilot and build the rest of m.9.exponential-functions: the most released questions (10);
   all its pictures are drawn.
2. m.9.quadratic-functions, m.9.factoring, m.9.polynomial-operations and m.9.quadratic-formula: 16
   released questions between them; tiles and graphs drawn.
3. m.9.linear-modeling, m.9.solving-equations and m.9.function-notation: the core of Algebra 1 and the
   most textbook practice.
4. m.9.linear-inequalities, m.9.absolute-value and m.9.inequality-systems, with engine needs 1–3 first.
5. m.9.radicals and m.9.sequences.
6. m.9.regression, m.9.data-displays and m.9.two-way-tables.
7. m.9.piecewise-functions (7 practice problems, thinnest coverage).

Total: 66 pages: 17 main pages and 49 problem types, 4 of them sorts. Of the 66, 64 can be built now;
~box and ~compare wait on needs 7 and 9. The standard-form sign-box systems page (need 2) is not counted.

## Added skills

Skills added to the taxonomy after Grade 9 was built (TAXONOMY_ISSUES.md, "Grades 9–12 topics
without a skill"). Same format as above; every example is original and worked by hand.

### 18. m.9.units-precision — Units, accuracy and precision in measurement and modeling

- **Standard:** N-Q.1 (units to guide a solution, units in formulas), N-Q.2 (define the quantities of a
  model), N-Q.3 (a level of accuracy that fits the limits of measurement).
- **Textbooks:** Big Ideas 9.1 (1.3 Modeling Quantities, 1.4 Accuracy with Measurements); Reveal 9.1
  (1-6 Descriptive Modeling and Accuracy); Into Math 1.3 (Precision and Accuracy in Calculations).
  The common problems: a rate converted by unit analysis (mi/h to ft/s), square units (ft² to yd²,
  then a cost), a formula whose units disagree (a rate per hour, a time in minutes), the least and
  greatest possible value of a measurement to the nearest unit, significant digits in a product, and
  choosing the unit or accuracy a situation needs. `m.6.unit-rates` is the Refresh; the metric chain,
  the ruler's estimated digit and percent error are Chemistry's (`s.10.measurement`), linked, not repeated.
- **Tests ask:** no released questions are filed for the skill (`research/questions/COVERAGE.md`: 0).

  | Question                                          | Page                 | Mark   |
  | ------------------------------------------------- | -------------------- | ------ |
  | Common: convert a speed, mi/h to ft/s             | main                 | Solves |
  | Common: square units and a cost per square yard   | ~area-units          | Solves |
  | Common: a formula whose units disagree            | ~formula-units       | Solves |
  | Common: least and greatest possible area          | ~bounds              | Solves |
  | Common: a product to the right significant digits | ~significant-figures | Solves |
  | Common: which unit or accuracy fits               | ~level-of-accuracy   | Solves |

- **Main — BUILD `m.9.units-precision` (Converting a rate with unit analysis):**
  - Picture: `unitChain` mode 'chain', unit 'mi' per 'h', factors 5280 ft/1 mi and 1 h/3600 s, from
    `g.s10-measurement-rate` (US units instead of meters).
  - Values: v, speed in mi/h (0.1–500, units pinned); u, speed in ft/s. `unitSystems: ['us']`.
  - Relation u = v × 5280/3600, solved both ways.
  - Assumptions:
    - 1 mi = 5280 ft and 1 h = 3600 s exactly, so each factor equals 1.
    - Put the unit to cancel on the other side of the fraction bar.
    - The units left after cancelling are the answer's unit: a check the setup is right.
  - Example: 45 mi/h × 5280 ft/1 mi × 1 h/3600 s = 237,600/3600 = 66 ft/s.
  - `startWith: ['v']`. Use line: "Use this for “A car goes 45 miles per hour. How many feet per
    second is that?”"
- **~area-units — BUILD (square units and a cost):**
  - Picture: `unitChain` chain, start F in ft², one factor 1 yd²/9 ft².
  - Values: length l and width w (ft), area F (ft²), area Y (yd²), price p ($ per yd²), cost C ($).
  - Relations F = l × w, Y = F ÷ 9, C = p × Y.
  - Assumptions: 1 yd = 3 ft, so 1 yd² = 3 ft × 3 ft = 9 ft² (square the length factor); the price is per
    square yard, so change the area to square yards before multiplying.
  - Example: 12 ft × 15 ft = 180 ft²; 180 ÷ 9 = 20 yd²; 20 × $30 = $600.
  - `startWith: ['l', 'w', 'p']`. Use line: "Use this for “Carpet costs $30 a square yard. What does
    it cost for a 12 ft by 15 ft room?”"
- **~formula-units — BUILD (units in d = rt):**
  - Picture: `doubleNumberLine`, top hours h, bottom miles d, per r.
  - Values: rate r (mi/h), time t (min), time h (hours, worked out, as a fraction), distance d (mi).
  - Relations h = t ÷ 60, d = r × h.
  - Assumptions: the rate is per hour, so the time goes in hours; divide minutes by 60.
  - Example: 12 mi/h for 40 min: h = 40/60 = 2/3 h; d = 12 × 2/3 = 8 mi.
  - `startWith: ['r', 't']`. Use line: "Use this for “A cyclist rides at 12 miles per hour for 40
    minutes. How far?”"
- **~bounds — BUILD (precision: least and greatest possible area):**
  - Picture: `rectangle` l by w, the area A inside. The inner and outer rectangles (l ∓ e by w ∓ e)
    would show the bounds: a shared picture need; interim, the plain rectangle.
  - Values: length l, width w (cm), precision u (the nearest cm, 0.1 cm …), greatest possible error
    e = u ÷ 2, area A, least area A_min, greatest area A_max.
  - Relations e = u ÷ 2; A = l × w; A_min = (l − e)(w − e); A_max = (l + e)(w + e). Limits: each side
    is a whole number of u (read to the nearest u) and more than e.
  - Assumptions: a length to the nearest u is off by at most half of u; the true sides lie between
    l − e and l + e, so the area lies between the two products.
  - Example: 8 cm by 5 cm, to the nearest 1 cm: e = 0.5 cm; A = 40 cm²; A_min = 7.5 × 4.5 = 33.75 cm²;
    A_max = 8.5 × 5.5 = 46.75 cm².
  - `startWith: ['u', 'l', 'w']`.
- **~significant-figures — BUILD (a product to the fewest significant figures):**
  - Picture: `rectangle` l by w, the rounded area R inside.
  - Values: l, w (m); n₁, n₂, their significant figures (typed, 1–6); n, the fewer; P, the product as
    calculated; R, P rounded to n significant figures.
  - Relations P = l × w; n = the smaller of n₁ and n₂; R = P rounded to n significant figures. Limit:
    a measurement needs at least the figures it shows (4.25 can't have 2).
  - Assumptions: a product is no more precise than its least precise factor; count the significant
    figures in each measurement, then round the answer to the fewer.
  - Example: 4.25 m (3) × 3.1 m (2) = 13.175 m²; n = 2; R = 13 m².
  - `startWith: ['l', 'w', 'n1', 'n2']`.
- **~level-of-accuracy — BUILD (sort):**
  - Bins: "To the nearest millimeter", "To the nearest meter", "To the nearest kilometer".
  - Cards (9): a bolt for an engine, a phone's thickness, a tile cut to fit (millimeter); a
    swimming pool's length, a room's length for carpet, a soccer field (meter); the drive between
    two cities, a flight's distance, a river's length (kilometer).
  - Sentence: "Measure only as precisely as the use needs: a part that must fit needs millimeters,
    a trip needs kilometers."
- **Verdict:** 6 pages (5 calculators, 1 sort); every common textbook type Solved. Graph scale and
  origin (N-Q.1) are left to the graphing pages.

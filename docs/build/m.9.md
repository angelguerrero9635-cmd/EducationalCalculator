# Build notes: math Grade 9 (Algebra 1)

Built from `.review/plans/m.9/plan.md` in its Priority order. Pages are in
`src/data/modules/math/9.ts` (one array per skill, exported in taxonomy order), sorts in
`src/data/modules/layouts/math9.ts`, step phrases in `src/data/modules/harness/phrasesM9.ts`.
`MODULE_IDS=m.9. pnpm test src/data/modules`: 3,308 passed, 2 skipped (deep run clean); `src/data/__tests__`:
50 passed.

## Built

71 pages, all registered (67 from the plan and 4 from the lesson review, below).

| Skill                     | Pages | Calculators                                                                       | Sorts                   |
| ------------------------- | ----- | --------------------------------------------------------------------------------- | ----------------------- |
| m.9.solving-equations     | 5     | main, ~distribute, ~literal, ~literal-line                                        | ~how-many-solutions     |
| m.9.linear-inequalities   | 6     | main, ~compound, ~or, ~two-variables, ~two-variables-below, ~whole-number-answers | —                       |
| m.9.absolute-value        | 3     | main, ~inequality, ~inequality-beyond                                             | —                       |
| m.9.function-notation     | 4     | main, ~evaluate, ~domain-range, ~rate-of-change                                   | —                       |
| m.9.linear-modeling       | 3     | main, ~parallel-perpendicular, ~context                                           | —                       |
| m.9.regression            | 3     | main, ~correlation-r                                                              | ~correlation            |
| m.9.inequality-systems    | 3     | main, ~elimination, ~modeling                                                     | —                       |
| m.9.piecewise-functions   | 4     | main, ~context, ~step, ~absolute-function                                         | —                       |
| m.9.radicals              | 6     | main, ~cube-root, ~rational-exponent, ~monomials, ~multiply                       | ~rational-or-irrational |
| m.9.exponential-functions | 6     | main, ~percent-growth, ~decay, ~same-base, ~doubling                              | ~linear-or-exponential  |
| m.9.sequences             | 3     | main, ~geometric, ~recursive                                                      | —                       |
| m.9.polynomial-operations | 3     | main, ~add-subtract, ~square                                                      | —                       |
| m.9.factoring             | 4     | main, ~leading-coefficient, ~gcf, ~special                                        | —                       |
| m.9.quadratic-functions   | 5     | main, ~standard-form, ~factored-form, ~projectile                                 | ~compare-models         |
| m.9.quadratic-formula     | 5     | main, ~square-roots, ~complete-square, ~inequality, ~inequality-outside           | —                       |
| m.9.data-displays         | 5     | main, ~outliers, ~standard-deviation, ~compare, ~five-number-summary              | —                       |
| m.9.two-way-tables        | 3     | main, ~marginal, ~conditional                                                     | —                       |

Interims built as the plan allows: two fixed-sign pages each for the half-plane
(`~two-variables` ≥, `~two-variables-below` <), the absolute-value inequality (`~inequality` ≤,
`~inequality-beyond` ≥) and the quadratic inequality (`~inequality` <, `~inequality-outside` ≥)
(need 2); fixed signs on `~compound` (l < ax + b ≤ r) and `~or`; tables for `~monomials`
(need 8) and `~recursive` (need 11); the arithmetic main page's n capped at 30 (need 5).

## Waiting

- **m.9.polynomial-operations~box** — need 7 (an area box for a binomial × trinomial, x³ and
  more than 10 tiles a side).
- **m.9.absolute-value~tolerance** — need 1 (an `integerLine` window from its values: 344–356 g
  can't show on a fixed −20 to 20 line).
- **The standard-form sign-box systems page** (`{a}x + {b}y {s:sign} {c}` over two lines) — need
  2 (a sign box that drives `lineSystem` shading). Not counted in the plan either.

## Changed from the plan

- **Percent pages write the percent sign.** The plan's `{A} = {P}(1 + {r})^{t}` with r typed as a
  percent would read "(1 + 3)"; the templates are `{A} = {P}(1 + {r}%)^{t}` and
  `{A} = {P}(1 − {r}%)^{t}`. The pages carry the growth (decay) factor g = 1 ± r ÷ 100 as a
  worked-out value, so the step writes the decimal once ("3% = 0.03") and the graph has its base.
- **Money ranges.** ~percent-growth: P up to $1,000,000, A under $1,000,000,000; ~decay: P and A
  up to $1,000,000 (at least $0.01), t up to 50. Dollar answers past a billion draw in scientific
  notation, which the harness misreads (shared need below).
- **Exponential main:** a `b ≠ 1` check (the graph's base can't be 1). **~doubling** works out
  the number of doublings k = t ÷ T, so the power reads N₀ × 2ᵏ.
- **Tile examples within 10.** The tiles hold −10 to 10 of each kind, and the plan's own examples
  broke that: the main solving-equations example is 5x + 1 = 2x + 10 (x = 3; check 16 = 16), not
  5x + 3 = 2x + 12; ~distribute is 2(3x − 4) = 4x + 2 (x = 5; check 22 = 22), not 3(2x − 4),
  whose −12 would not fit. The use line follows.
- **~literal** draws the `rectangle` picture (length, width, perimeter around) instead of
  `coordinatePlane` `rect`, which needs four corner coordinates the page doesn't have.
- **~parallel-perpendicular:** the given line's intercept b₁ is `standalone` (it only places the
  line; the new slope uses m₁ alone); the choice is a 1/2 value, the point is the graph's `test`
  point.
- **~two-variables** pages test the point with the line's height at x₀ (a worked-out value) and
  a 1/0 truth value; `linearFunction` has no test point, so they are labels under the picture.
- **~compound and ~or** keep a > 0 (the literal `closed` pair can't flip for a negative a) and
  the line at −20 to 20; each has a test number with its truth value.
- **Absolute value main** draws the two solutions as two dots (`value` and `second`, no
  compound) rather than the plan's "and" stretch, which would shade numbers that are not
  solutions. The center and distance are labels.
- **Quadratic-formula main:** x₁ and x₂ are the roots with −√D and +√D (not smaller/larger), so
  the formula line matches the value for a negative a; when D isn't a perfect square a work line
  writes the exact root, x = (−b ± √D) ÷ 2a.
- **Quadratic-functions main** example adds x = 4, y = 10 (the plan names no traced point).
  **~standard-form** traces x = 6, y = 5; **~projectile** keeps metric units only (the graph's
  axes are meters and seconds) and adds the top (t = v ÷ g, h₀ + v² ÷ 2g) and a = −g ÷ 2 as
  worked-out values; its example traces t = 1, h = 16.7 m.
- **Factoring ~leading-coefficient** works the ac method as values: m and n (ac split), p = GCF of
  a and m, then r, s and q; a is 1 to 10. **~special** adds z, the middle terms that cancel, so the
  two square roots are one lesson. **~gcf** keeps g positive (−6x² + 15x = 3x(−2x + 5)).
- **~add-subtract** shows the second polynomial "as added" (d′, e′, f′: its opposite when
  subtracting) as the tiles' second group, so one `collect` picture serves the op box.
- **Regression main:** no point-number value k; `residualOf` takes a fixed point, so the page
  labels point 3's residual (the plan's example). **~correlation-r** is in °F (US units only).
- **~data-displays~compare is built.** Worked-out values don't count toward the 10-value cap, so
  two five-number summaries (10 typed) fit; need 9 isn't needed for it.
- **~two-way-tables~conditional** adds g = p₁ − p₂, the gap between the rows (the association),
  which links the two rows into one lesson.
- **~step** has a 4-hour window: the staircase's steps are worked-out values (C₁ … C₄).
- **~rational-exponent, ~monomials** add worked-out values for the steps (the qth root w; the
  check value y at x = 1, 2, 3).
- **Inequality systems main** tests the point by its heights above the two lines (d₁, d₂), as the
  demo does.

## Shared needs found while building

- **Harness: a dollar answer in scientific notation** ("A = $6.0972 × 10⁹") is read as its leading
  number (`resultNumber`), so the step check fails. Would let the money pages keep wider ranges.
- **Simplifying chain and negatives** (`simplify.ts`): "−(−6) ÷ (2 × 1)" simplifies to
  "−−6 ÷ 2", and "(−6) × 3" loses its bracket ("1 × 9 + −6 × 3"). Seen on every page with −b
  (standard form, the quadratic formula, square roots). A bracket kept round a negative would fix
  both.
- **The engine's `affineOf` probes 6 fixed points**, so a truth test that is false at all of them
  (h − 0) reads as a straight-line rule forcing h = 0. The m.9 tests use a curved residual
  ((h − t)(1 + h²)); a check in `affineOf` for step-shaped residuals would spare every builder
  this. The same applies to a piecewise sign rule (o = 2 ? −d : d), written here as d × (3 − 2o).
- **`functionGraph` with unit choices:** the graph reads shown numbers, so a page whose values
  can change units draws the wrong curve; ~projectile is kept to metric with `units` pinned.
- **`scatter` `residualOf.point` as a value id**, so a page can pick the point (the plan's k).
- **`linearFunction` test point** (as `lineSystem.test`), for the half-plane pages.
- **Needs 1, 2, 3, 5, 6, 7, 8, 11** as the plan lists them. Need 10 (signed boxes) is done in the
  groundwork; need 12's phrases are in `phrasesM9.ts` (smaller/larger of, rounded up/down to a
  whole number, least common multiple of negatives); "largest perfect square factor" and "±" were
  already read.

## Lesson review fixes

From `.review/hs-m.9/lesson-report.md` (16 errors, 31 improvements, 4 new pages). E1, E14, E15
and the ~special symbol were done by the lead first; E8–E11 by the engine.

- **Fixed:** E1 (the corner outside the first quadrant is a rule message; m₁ in fractions), E2,
  E3 (a pair past the tiles' 10 is said as the factorization), E4, E6, E7, E12, E13, E16, and
  30 of the 31 improvements.
- **E5 not done:** a rule message refuses the newest input, so "every number is a solution"
  can't be a message on a = c, b = d (it would refuse typing b = d); the page shows no x and no
  reason there. Shared need below.
- **~outliers range:** `boxPlot` widens its axis past `range` to fit the values, so the 0–50
  axis needs no change.
- **Symbols:** no value symbol is an expression: f(x), f(x₁), f(x₂), f(p) are y, y₁, y₂, y_p
  (the function notation is in the names), the class A/B summaries on ~compare are Q₁_A, IQR_B.
- **New pages:** ~literal-line (ax + by = c for y), ~same-base (4⁶ = 8ˣ → 2¹² = 2³ˣ → x = 4,
  whole exponent e = sa, so no fractional power is written; the table's qˣ is picture-only;
  phrases in `phrasesM9.ts`), ~five-number-summary (box plot from up to 12 values),
  ~compare-models (sort: linear, quadratic or exponential by differences and ratios).
- **Waiting (from the report's coverage table):** m.9.function-notation~transform
  (f(x) + k, f(x − h), a·f(x) on `functionGraph`: needs two curves on one graph) and
  m.9.radicals~quotient (√a ÷ √b and rationalizing, no picture of it yet); nonlinear systems
  (need `lineSystem` with a parabola).

### Shared needs from the review

- A rule message that informs without refusing the input (E5: a = c and b = d on
  m.9.solving-equations, ~distribute: "every number is a solution").
- The dump could print rule messages and mark `note:` lines (reviewer, E7).
- Two-way tables: a page that fills the table from totals needs typed totals in `twoWayTable`.
- The fixed-sign interims (~compound, ~or, half-planes, the inequalities) still wait on need 2.

## Added skills

Built from `docs/plans/m.9.md` "Added skills". `MODULE_IDS=m.9.units-precision`: module,
standards, layouts and sampling suites pass (deep run `SAMPLES=100 SEQUENCES=15 UNIT_CASES=10`
clean); `src/data/__tests__` and `units.test.ts` pass.

### Built

| Skill               | Pages | Calculators                                                                     | Sorts              |
| ------------------- | ----- | ------------------------------------------------------------------------------- | ------------------ |
| m.9.units-precision | 6     | main (mi/h to ft/s), ~area-units, ~formula-units, ~bounds, ~significant-figures | ~level-of-accuracy |

Interims: ~bounds and ~significant-figures draw the plain `rectangle` (shared needs below).

### Waiting

None.

### Changed from the plan

- **Main and ~area-units are US only** (`unitSystems: ['us']`, lesson review): v in mph, u in
  ft/s, l and w in ft, the areas in ft² and yd², so every answer carries its unit. The main
  page's u and v steps write the chain with units ("u = 45 mi/h × 5280 ft/1 mi × 1 h/3600 s").
- **~formula-units is in km/h and km** (18 km/h for 40 min = 12 km), with mph and mi on the unit
  menu: the default system is metric, and the lesson (minutes to hours before d = rt) holds in
  either. t stays in minutes and h in hours (pinned).
- **~area-units price up to $100 a square yard** (cost under $3,000,000): dollar answers past
  $10,000,000 are drawn in scientific notation and the check line then reads them wrong.
- **~bounds and ~significant-figures are metric only** (`unitSystems: ['metric']`), so the
  precision u (0.1, 0.5, 1 or 10 cm) and the typed counts keep their meaning. ~bounds refuses a
  side that is not a multiple of u; ~significant-figures refuses a count too small for the
  number (4.25 with 2 figures).

### Shared needs found while building

- **Picture: `rectangle` bounds** — the measured rectangle with the least (l − e by w − e) and
  greatest (l + e by w + e) rectangles dashed inside and outside it, the band between shaded;
  driven by l, w, e, A_min, A_max. Page: m.9.units-precision~bounds.
- **Engine: significant figures of a typed value** — keep the figures a student types (3.10, 250.)
  so n₁ and n₂ are read, not typed, and show a worked-out value to n figures from a value id
  (`sigFigs: 'n'`), so 13.0 shows its zero. Page: m.9.units-precision~significant-figures.
- **Engine: a new value that makes an older input impossible** clears the older one; ~bounds now
  gives the reason ("8 cm is not a reading to the nearest 10 cm …") through the rule's message,
  but keeping both readings and rejecting the new u needs the engine.

### Lesson-review fixes (`.review/new-math/lesson-report.md`)

- Units on every value of main and ~area-units (the engine's US-only pages); the unit chain in
  the u and v work lines.
- ~significant-figures rounds with the engine's `significant` (4.35 → 4.4) and notes the answer
  with its n figures ("→ written with 2 significant figures: 3.0 m²", "1.6 × 10³ m²").
- ~bounds: `allowed` adds 5 cm; the side checks say why a side is refused; P_min and P_max added
  (the Big Ideas perimeter item), 8 values.

### Second lesson-review fixes (`.review/new-math-2/lesson-report.md`)

- Main: the unit chain is the line the numbers go into ("u = 45 mi/h × 5280 ft/1 mi × 1 h/3600
  s"), so the bare "u = 45 × 5280/3600" is gone; the same for v.
- `~formula-units`: the time in hours is t_h ("t_h = 2/3 h"), not h beside the unit h.
- `~significant-figures`: the "written with n significant figures" note shows only when the box
  hides the figures (3.0, 1.6 × 10³), not when it repeats the answer (13).
- `~bounds`: assumption 2 names the area and the perimeter.
- Not done (engine, the lead's): the harness still enumerates units outside `units` (v and u, t
  and h are already pinned to one unit each).

### Pictures placed (H89–H110)

| Page                                               | Entry        | What changed                                                                                                                   | Stand-in gone                                               |
| -------------------------------------------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------- |
| m.9.linear-inequalities                            | H89          | `integerLine` `ticks: 5` (±20 by 5s)                                                                                           | —                                                           |
| m.9.linear-inequalities~compound                   | H89, H90     | sign boxes s and t drive the circles (`closed: ['s', 't']`, < or ≤); `fit`, `ticks: 5`; l, b, r to ±1000; the test number is n | the fixed l < ax + b ≤ r                                    |
| m.9.linear-inequalities~two-variables              | H90, H105(6) | one page for all four signs (`shade: { sign: 's' }`), the test point drawn (`test`)                                            | ~two-variables-below (merged in); tx, ty labels             |
| m.9.absolute-value                                 | H91          | `compound: { join: 'equal', center: 'h', radius: 'd' }`                                                                        | the h and d labels under the picture                        |
| m.9.absolute-value~tolerance (new)                 | H89          | \|w − T\| ≤ d on a fitted line in grams (350 g within 6 g; a 343 g box is out)                                                 | — (was waiting)                                             |
| m.9.inequality-systems~standard-form (new)         | H90          | `{a}x + {b}y {s:sign} {c}` twice; `shade: { sign, flip }` on both lines, `fixed`                                               | — (was waiting)                                             |
| m.9.inequality-systems~box (new)                   | H92          | a ≤ x ≤ b and c ≤ y ≤ d with `upright` boundaries (NAEP-2024-12M11-#11)                                                        | — (was waiting)                                             |
| m.9.inequality-systems~nonlinear (new)             | H106(5)      | a line and a parabola (`square` on a line), the crossings in `solutions`                                                       | — (was waiting)                                             |
| m.9.quadratic-formula~inequality                   | H90          | x² + bx + c {s:sign} 0, `functionGraph` `inequality: { sign: 's' }`, a test number                                             | ~inequality-outside (merged in); the fixed shading          |
| m.9.sequences                                      | H93          | `far: true`, n to 1000 (a₁₀₀ = 403)                                                                                            | the picture-only nc, tl and their rules                     |
| m.9.sequences~recursive                            | H93          | `termsChart` `type: 'recursive'`                                                                                               | the table                                                   |
| m.9.piecewise-functions~absolute-of-function (new) | H94          | y = \|ax² + bx + c\| with `abs: true` (NAEP-1992-12M15-#8)                                                                     | — (~absolute-function keeps a\|x − h\| + k)                 |
| m.9.polynomial-operations~box (new)                | H95          | `algebraTiles` `mode: 'box'`, (x + 2)(x² − 3x + 4)                                                                             | — (was waiting)                                             |
| m.9.radicals~monomials                             | H95          | `algebraTiles` `mode: 'monomial'`                                                                                              | the table (x and y stay: they join c and k into one lesson) |
| m.9.regression                                     | H105(1)      | k (1–8) picks the point; e = y_k − (m x_k + b); `residualOf.point: 'k'`                                                        | the fixed point 3                                           |
| m.9.quadratic-functions~projectile                 | H106(1)      | `unitsOf: { x: 't', y: 'H' }`, axes "Time t" and "Height h"                                                                    | the pinned units and `unitSystems: ['metric']`              |
| m.9.function-notation~transform (new)              | H106(2)      | g(x) = a·f(x − h) + k beside f(x) = x² (`transform`), (p, f(p)) carried to its image                                           | — (was waiting)                                             |
| m.9.units-precision~bounds                         | H106(11)     | `rectangle` `bounds: { error: 'e', least: 'lo', greatest: 'hi' }`                                                              | the plain rectangle                                         |

Gallery demos built from these pages that no longer pass (the lead's to retire):
`g.m9-linear-inequalities-compound-fit` (its example lacks the new s, t and n) and
`g.m9-regression-point-k` (it adds k a second time).

### Page-review fixes (`.review/hs-page-m/page-report-m9-10.md`)

- ~significant-figures: the rectangle is `fixed` (new `rectangle` option): the corner drag no
  longer clears the typed significant-figure counts.
- ~formula-units: the time in hours is `tₕ`, not `t_h`, in the input row, steps and caption.
- inequality-systems~modeling: `extent: 25`, so the region fills the chart (was 0–50).
- quadratic-functions~standard-form: a snaps to 0.1, so the stretch handle moves it.
- Left for the shared fixer (component only): the AlgebraTiles mats, `SUPS` letters and the
  "$900.41" money label (~percent-growth), the test-point tag over the corner label
  (inequality-systems, ~modeling's line labels too), the outlier under the max handle.

### Second page-review fixes (`.review/hs-page2-m/page-report2-math.md`)

- Each handle on a worked-out value names the typed value it drives (`drives`):
  linear-inequalities k → d; ~compound L → l, U → r; ~or L → c, U → f;
  ~whole-number-answers n → B; absolute-value, ~inequality, ~inequality-beyond h → b, d → c.
  These handles were dead and froze the page (see ENGINE_LOG, "drag rule").

### Leftovers (`.review/hs-page2-m/page-report2-math.md`)

- exponential-functions~percent-growth: the start handle sat on the y-axis's "800". A y-axis
  number now gives way to a handle drawn on it (`FunctionGraph`); the point's own chip says
  (0, 800).
- radicals~rational-exponent: the use line raises its exponents, "Evaluate 27²ᐟ³" or "16³ᐟ²",
  not 27^(2/3).
- linear-inequalities~two-variables: "run 2" sat on the test point's "(1, 0)" at 1024 px. The
  slope triangle (`LinearFunction`) now moves on until its run and rise labels clear the test
  point's label, and keeps its corner off the test point.

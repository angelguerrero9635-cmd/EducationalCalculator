# Build notes: math Grade 9 (Algebra 1)

Built from `.review/plans/m.9/plan.md` in its Priority order. Pages are in
`src/data/modules/math/9.ts` (one array per skill, exported in taxonomy order), sorts in
`src/data/modules/layouts/math9.ts`, step phrases in `src/data/modules/harness/phrasesM9.ts`.
`MODULE_IDS=m.9. pnpm test src/data/modules`: 3,072 passed, 2 skipped; `src/data/__tests__`:
50 passed.

## Built

67 pages written, 66 of them registered (the main exponential page waits on the move, below).

| Skill                     | Pages | Calculators                                                                       | Sorts                   |
| ------------------------- | ----- | --------------------------------------------------------------------------------- | ----------------------- |
| m.9.solving-equations     | 4     | main, ~distribute, ~literal                                                       | ~how-many-solutions     |
| m.9.linear-inequalities   | 6     | main, ~compound, ~or, ~two-variables, ~two-variables-below, ~whole-number-answers | —                       |
| m.9.absolute-value        | 3     | main, ~inequality, ~inequality-beyond                                             | —                       |
| m.9.function-notation     | 4     | main, ~evaluate, ~domain-range, ~rate-of-change                                   | —                       |
| m.9.linear-modeling       | 3     | main, ~parallel-perpendicular, ~context                                           | —                       |
| m.9.regression            | 3     | main, ~correlation-r                                                              | ~correlation            |
| m.9.inequality-systems    | 3     | main, ~elimination, ~modeling                                                     | —                       |
| m.9.piecewise-functions   | 4     | main, ~context, ~step, ~absolute-function                                         | —                       |
| m.9.radicals              | 6     | main, ~cube-root, ~rational-exponent, ~monomials, ~multiply                       | ~rational-or-irrational |
| m.9.exponential-functions | 5     | main (`EXPONENTIAL_MAIN`), ~percent-growth, ~decay, ~doubling                     | ~linear-or-exponential  |
| m.9.sequences             | 3     | main, ~geometric, ~recursive                                                      | —                       |
| m.9.polynomial-operations | 3     | main, ~add-subtract, ~square                                                      | —                       |
| m.9.factoring             | 4     | main, ~leading-coefficient, ~gcf, ~special                                        | —                       |
| m.9.quadratic-functions   | 4     | main, ~standard-form, ~factored-form, ~projectile                                 | —                       |
| m.9.quadratic-formula     | 5     | main, ~square-roots, ~complete-square, ~inequality, ~inequality-outside           | —                       |
| m.9.data-displays         | 4     | main, ~outliers, ~standard-deviation, ~compare                                    | —                       |
| m.9.two-way-tables        | 3     | main, ~marginal, ~conditional                                                     | —                       |

Interims built as the plan allows: two fixed-sign pages each for the half-plane
(`~two-variables` ≥, `~two-variables-below` <), the absolute-value inequality (`~inequality` ≤,
`~inequality-beyond` ≥) and the quadratic inequality (`~inequality` <, `~inequality-outside` ≥)
(need 2); fixed signs on `~compound` (l < ax + b ≤ r) and `~or`; tables for `~monomials`
(need 8) and `~recursive` (need 11); the arithmetic main page's n capped at 30 (need 5).

## Waiting

- **Pilot move + galleryR4d repoint (lead does at merge).** The main page
  `m.9.exponential-functions` (y = a(b)ˣ on `functionGraph`, the plan's move with changes) is
  written and tested as `EXPONENTIAL_MAIN` in `math/9.ts` (tested under a temporary id), but it is
  not in `MATH_9_MODULES`, and `pilots.ts` still holds the pilot: `galleryR4d.ts` builds the demo
  `g.r4d-table-growth` from the pilot by id, so removing it stops every suite from loading, and
  the permission system refused this builder's edit to that shared file. At merge: in
  `galleryR4d.ts` import `MATH_9_MODULES` from `./math/9`, add it to `PAGES`, and point the demo
  at `m.9.exponential-functions~decay` (the pilot's sweep table lives there now; its example
  passes); then empty `PILOT_MODULES` and put `EXPONENTIAL_MAIN` first in the `EXPONENTIAL` array.
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

- **galleryR4d.ts** reads the Grade 9 pilot by id (see Waiting).
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

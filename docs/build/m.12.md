# Build notes: Grade 12 math (m.12)

Built from `.review/plans/m.12/plan.md` in its Priority order. Pages are in
`src/data/modules/math/12.ts`, layout pages in `src/data/modules/layouts/math12.ts`, step-text
phrases in `src/data/modules/harness/phrasesM12.ts`.

## Built

- `m.12.hypothesis-testing` (8): main (one-proportion, two-sided), `~mean` (left-tailed z),
  `~t-test` (one mean, σ unknown), `~paired` (matched pairs t), `~two-proportion` (pooled z),
  `~two-sample` (t), `~hypotheses` (sort: which Hₐ), `~errors` (sort).
- `m.12.confidence-intervals` (5): main (mean, σ known), `~t-interval`, `~proportion`,
  `~sample-size`, `~capture`.
- `m.12.sampling-distributions` (3): main (x̄), `~proportion` (p̂), `~counts` (binomial).
- `m.12.chi-square` (3): main (goodness of fit, 3 categories), `~five-categories` (the counts
  and shares each a group, E7), `~independence` (2 × 3 table).
- `m.12.conics` (5): main (ellipse), `~parabola`, `~hyperbola`, `~identify` (sort), `~cone`
  (explore).
- `m.12.matrices` (6): main (row reduction, right sides typed), `~multiply`, `~determinant`
  (3 × 3), `~inverse`, `~inverse-system` (X = A⁻¹B), `~cramer`.
- `m.12.inverse-trig` (4): main (sin⁻¹), `~arccos`, `~arctan` (rise over run), `~compose`.
- `m.12.trig-formulas-equations` (6): main (sin(A + B)), `~difference` (cos(A − B)),
  `~double-angle`, `~half-angle`, `~sine-equation`, `~tangent-equation`.
- `m.12.vectors` (5): main (components, length and direction), `~add`, `~scalar`, `~dot`,
  `~resultant`.
- `m.12.polar` (6): main (polar point), `~complex-form`, `~product`, `~de-moivre`, `~rose`,
  `~limacon`.
- `m.12.parametric` (3): main (a line), `~ellipse`, `~projectile`.
- `m.12.limits-intro` (4): main (a hole), `~one-sided`, `~derivative`, `~infinity`.

## Waiting

Every page the plan marks BUILD is built (50, one per plan line; the interims are under
"Changed from the plan"). These pages wait on an engine or picture need and are not built:

- `m.12.trig-formulas-equations~quadratic` (2 sin²x − sin x − 1 = 0) — need 7 (`unitCircle`
  solutions for two values of sin x).
- `m.12.polar~roots` (the cube roots of 8i) — need 8 (`complexPlane` `roots: n`).
- `m.12.sampling-distributions~clt` (sample means from a skewed population) — need 9 (a CLT
  simulation histogram).
- `m.12.vectors~cross` (3-D vectors and the cross product) — need 10 (3-D axes).

Built with an interim, to change when the need lands:

- P11 (a t curve on `normalCurve`): `~t-interval`, `~t-test` and `~two-sample` draw the normal
  sampling curve with the interval or the sample's mark only (no shaded areas, since the
  picture's areas and p-values are normal ones); t⋆, tcdf and the p-value are in the steps.

- Need 2 (tail from a typed Hₐ): `m.12.hypothesis-testing` is two-sided and `~mean`
  left-tailed.
- Need 3 (E7, groups): done for chi-square (`~five-categories`, 5 counts and 4 shares as two
  groups: 200 lunch choices against 30%, 25%, 20%, 15%, 10%: X² = 4.32, df 4, P ≈ 0.36).
  `m.12.matrices` still keeps its coefficients fixed: its `rowReduce` picture takes fixed row
  operations (`RowOp` numbers), so typed coefficients would draw the wrong eliminations. It
  needs row operations worked out from the values (a picture need) before the boxes go in.
- Need 4 (E8): done; `~inverse` is now `[[{a}, {b}; {c}, {d}]]^{−1} = [[{e}, {f}; {g}, {h}]]`.
- Need 5 (determinant picture): `~determinant` shows a table of D against k; `~cramer` draws
  its two lines crossing at the solution (`lineSystem`, slopes and intercepts hidden).
- Need 6 (two arcs on `unitCircle`): the sum and difference pages draw A ± B only.
- Need 8 (powers on `complexPlane`): `~de-moivre` draws zⁿ only.
- Need 11 (rational by coefficients): `~infinity` works out its zero z and pole v.
- Need 12 (direction from components): done in the grade file (`direction`), no phrase needed.

## Changed from the plan

- **Tails are fixed per page (need 2 interim).** The main page is two-sided and `~mean` is
  left-tailed, as the plan's pictures say; a typed Hₐ waits on engine need 2.
- **p̂, SE derived.** On the test pages the sample proportion and the standard errors are worked
  out, never typed, so a typed z can't disagree with the sample.
- **C is a decimal (0.9, 0.95, 0.99), not a percent.** `normalCurve` reads a confidence level
  from 0 to 1 (its check rejects 95), so the confidence pages type C as 0.95.
- **SE added on the interval pages.** The curve under an interval is the sampling curve, so it
  needs the standard error as its spread: the main page has SE = σ ÷ √n and E = z⋆ × SE (9
  values); `~proportion` has SE = √(p̂(1 − p̂) ÷ n); `~sample-size` shows the SE the rounded-up
  n gives (the interval's level is left off that picture, since rounding n up makes its middle
  area a little more than C).
- **`~capture` draws 100 intervals; N is not a value.** `normalCurve` takes the number of
  intervals as a fixed number, not a variable, so N (20, 50, 100) would not move the picture:
  the page fixes 100 and K = 100 × C. The sample size n is standalone (it sets the widths only).
- **Chi-square contexts.** The goodness-of-fit page counts red, pink and white flowers against
  a 1 : 2 : 1 ratio; the independence table is grade (11, 12) by how students get to school
  (walk, bus, car). The expected counts are shown in the steps' work lines, not as values (the
  10-value limit).
- **Conic centers are standalone.** On the ellipse and hyperbola pages h and k only place the
  curve (c, e and the slope come from a and b), so they are marked `standalone`.
- **Row reduction as the reduced rows.** The main matrices page's three relations are the rows
  after the plan's row operations (x + y + z = d₁, y − 2z = d₃ − d₁, −7z = d₂ − 5d₁ + 3d₃), so
  the steps read as back-substitution: z, then y, then x. The coefficients stay fixed (need 3).
- **Interim pictures for the determinant and Cramer pages (need 5).** A page must have a
  picture, and "none drawn" is not a kind: `~determinant` shows a table of D as the last entry k
  changes (D moves by ae − bd each step), and `~cramer` draws the two lines crossing at (x, y).
  Both can switch to the determinant picture when need 5 lands.
- **`~inverse` keeps rows (need 4 interim)**; its picture multiplies A by A⁻¹ to show I.
- **Inverse-trig graphs read in degrees.** `functionGraph` draws sin⁻¹ and tan⁻¹ in radians, so
  the main page and `~arctan` stretch them by a = 180/π and label the axis "A (°)": the traced
  point is the degree value the page types. The radian value t is worked out beside it.
- **`~compose` works y = √(1 − x²) directly** (the plan's "shown as"); A = sin⁻¹(x) is the
  angle the unit circle draws.
- **Sum and difference pages draw the one angle A ± B (need 6 interim).** The unit circle marks
  C = A + B (or A − B) with its sine (cosine); the four special values and their products are
  work lines under the formula step. A and B as two arcs wait on need 6.
- **S and K are worked out.** On the sum and difference pages sin(A + B) and cos(A − B) are
  derived: a typed value has many A and B.
- **Checks written as sin(x₁°) = k.** On the equation pages the check says the solution's sine
  (tangent) is k, since sin⁻¹(k) alone is not x₁ once 360° or 180° is added.
- **Direction from components without a new phrase (need 12, done in the grade file).** The
  direction relation puts tan⁻¹(y ÷ x) into the arrow's quadrant (`direction` at the top of
  `math/12.ts`), and its step reads `180 + tan⁻¹(4 ÷ (−3))` or `360 + tan⁻¹(…)`, which the
  harness already evaluates; no phrase was needed. Its check line is tan φ = y ÷ x.
- **`~de-moivre` draws the answer only (need 8 interim).** The complex plane shows zⁿ by its
  modulus R and argument nθ; z, z², …, zⁿ in turn wait on need 8.
- **`~product` draws w by its parts.** `complexPlane` takes w as re and im, so w's parts c and
  d are worked out from r₂ and θ₂ (derived), as the plan says.
- **The polar point's θ relation knows the sign of r.** A negative r turns the direction half a
  turn, so typing x and y back gives the θ that goes with the r shown.
- **The eliminated equation is a note after the answer.** On the parametric line page the
  slope step ends "→ y − 3 = −0.5(x − 1)"; on `~ellipse` the y step ends with
  ((x − h) ÷ a)² + ((y − k) ÷ b)² = 1 in numbers.
- **`~projectile` launches from h = 1 m, not 0.** The module tests refuse a 0 example for a
  value with a unit (it would pass any unit check), so the example is 20 m/s at 30° from 1 m:
  at t = 1 s, x ≈ 17.32 m and y = 1 + 10 − 4.9 = 6.1 m; it lands at
  T = (10 + √119.6) ÷ 9.8 ≈ 2.14 s. From the ground (h = 0) T = 20 ÷ 9.8 ≈ 2.04 s, as planned.
- **`~infinity` keeps z and v (need 11 interim).** The rational graph is drawn from its zero,
  pole and stretch L, so z = −q ÷ p and v = −s ÷ r are worked out; the page adds limits that p
  and r are not 0 and that the zero is not the pole.
- **The table of values is work lines.** The main limits page lists f(x) at x = a − 0.1,
  a − 0.01 and a + 0.01 under the limit's step (2.9, 2.99, 3.01 in the example).
- **`~one-sided` says whether f is continuous** in a note after J (0: continuous; else no
  limit).

- **The t pages (need 1, E10).** `~t-interval` (x̄ = 52, s = 8, n = 10, 95%: df = 9,
  t⋆ ≈ 2.262, E ≈ 5.72) and `~t-test` (μ₀ = 500 g, s = 8 g, n = 16, x̄ = 496 g: SE = 2,
  t = −2, df = 15, P ≈ 0.064, fail to reject at 0.05, unlike the z page) are new. `~two-sample`
  is now a t-test with df = the smaller n − 1 (the by-hand choice); its example gives t ≈ 2.12,
  df = 35, P ≈ 0.041. The step text writes invT(0.975, 9) and tcdf(|t|, df), taught to the
  harness in `phrasesM12.ts`. t, df, SE and P are worked out, never typed.

## Shared needs found while building

- **An `allowed` list of decimals needs `min`, `max` and `multipleOf`.** The solver's
  whole-number search (`wholeSolutions` in `src/engine/solve.ts`) builds its bounds from
  `min`/`max` on a grid of `multipleOf` (default 1): with an allowed list of 0.9, 0.95, 0.99 and
  no grid, the bounds are empty or NaN and every consistent input is reported as a conflict. The
  confidence pages set `min`, `max` and `multipleOf: 0.01`; the search could read the grid from
  the allowed list instead (every page with a decimal `allowed` list).
- **A picture for pages with no fitting kind.** `representation` is required, so a page whose
  plan says "no picture yet" needs a stand-in (`~determinant`, `~cramer`); a `none` kind, or
  the equation alone, would let such a page show its equation without a placeholder picture.
- **`normalCurve` `intervals.count` from a variable** (20, 50 or 100 typed), so the capture page
  can take N as the plan planned (`m.12.confidence-intervals~capture`).
- **`matrixGrid` `rowReduce` with row operations from the values** (or worked out by the
  picture), so the main matrices page can type its coefficients (`m.12.matrices`).
- **`functionGraph` inverse trig in degrees** (a `degrees` option for arcsin, arccos, arctan),
  so a page need not stretch the curve by 180/π to read its angle in degrees
  (`m.12.inverse-trig`, `~arctan`).

## Lesson review (`.review/hs-m.12/lesson-report.md`)

All 14 errors and 22 improvements are fixed in the pages; the notes below are the ones done
another way or left for shared work.

- **Decisions (1).** Every test and chi-square p-value step ends with the decision
  ("→ 0.03767 < α = 0.05: reject H₀"); the chi-square pages take α (standalone), and their
  pictures shade it.
- **Plain symbols (2, 4, 5, 6 and the new standards rule).** d, C, k, s, c, S, K replace
  "x̄₁ − x̄₂", "A + B", "sin x", "sin A" and the rest; also |u + v| → |s| (the sum s = u + v),
  f(x) → y, f′(x) → f′, 4p → q ("the number before (y − k), which is 4p"). "u · v" stays (no
  operator the rule lists).
- **Exact values (3).** The sum and difference pages take the multiples of 30° and 45° only and
  work sin 45° = √2/2 … √6/4 + √2/4 = (√6 + √2)/4 ≈ 0.9659.
- **Limits with reasons (8–10, harness).** `~projectile` t ≤ T and y ≥ 0; `~proportion` 10
  successes and 10 failures; `~parabola` q ≠ 0; the interval pages L < U with x̄, L and U on one
  range (±1,000,000); every earlier limit now says why.
- **Deep run**: `~independence` now needs every expected count to be at least 5 (a 0.015
  expected count made the rounded terms disagree); `~arctan` takes a run of at least 0.1 m.
- **`~vectors~resultant`**: forces 0.1 N to 10,000 N, so the direction no longer rounds to 0°.
- **Checks through the function (17)**: sin(30°) = 0.5 on the four inverse pages.
- **`~polar~product` (18)** hides w's parts (figure-only) and answers zw as p + qi.
- **`~de-moivre` (19)**: R = (a² + b²)^(n ÷ 2), no rounded r: (1² + 1²)⁴, 2⁴ = 16.
- **Conics (20, 21)**: foci and vertices as points, asymptotes as equations (y = ±(4/3)x).
- **`~cramer` (24)**: Dₓ and Dᵧ as work lines, and the picture is now the two lines
  (`lineSystem`).
- **`~inverse` (25)**: entries as fractions (3/5, −7/10), and `A⁻¹ = (1/10)[[6, −7], [−2, 4]]`
  after D.
- **`~counts` (33)** states "up to 40 trials" in its use line rather than a larger n (the
  histogram's limit).
- **Radians (15, 36)**: `pi: 'fraction'` on every radian value; the equation pages add t₁ and t₂
  (π/6, 5π/6) and say "one solution" when k = ±1.
- **New pages**: `~half-angle` (cos A = 7/25 → sin(A/2) = 0.6, cos(A/2) = 0.8),
  `~inverse-system` (3x + 2y = 7, 5x + 4y = 13 → (1, 2)), `~paired` (d̄ = 2.5, s = 3.2, n = 12:
  t ≈ 2.71, P ≈ 0.020), `~two-proportion` (84 of 150 against 66 of 150: z ≈ 2.08, P ≈ 0.038),
  `~hypotheses` (sort: eight claims into Hₐ: μ <, >, ≠ μ₀). The numbers are original.

### Shared needs from the review

- Engine 6: typed values that push a derived value past its range are kept silently
  (`m.12.confidence-intervals`: U = −1,000,000 with SE = 95,096 forces x̄ below its range).
- Harness (the lead's change d): a superscript exponent before ° (`tan(8 × 10⁻⁶°)`,
  `m.12.inverse-trig~arctan`).
- Engine 5: a symbolic power line prints a caret, "R = (a² + b²)^4" (`m.12.polar~de-moivre`).
- Engine (a): 4/3 shows as 1 1/3 in Grades 9–12 (`m.12.conics~hyperbola` s).
- Harness: `affineOf` reads a pass/fail limit as a constant when all 16 probes fail it, and then
  calls every input infeasible; `~two-proportion` got past it by naming its limits with k₁ and
  k₂ (the ids seed the probes). A pass/fail relation should never be read as affine.
- The matcher corpus (`scripts/build-match-corpus.mjs`) to rerun for the five new pages.

## Added skills (plan sections 13–20)

Built from `docs/plans/m.12.md`, "Added skills". No gallery demo existed for any of them, so
every page starts from the nearest picture already drawn.

### Built

- `m.12.vectors-3d` (3): main (u · v and the angle), `~cross`, `~triple`.
- `m.12.matrix-transformations` (5): main (rotation matrix), `~image` (any 2 × 2 matrix, and
  undoing it), `~area` (|D| as the area factor), `~compose` (two turns), `~identify` (sort).
- `m.12.polar-conics` (4): main (e and d from r = k ÷ (m − n cos θ)), `~ellipse`,
  `~parabola`, `~rotation` (the angle that removes the xy term; B² − 4AC).
- `m.12.partial-fractions` (3): main (cover-up, two linear factors), `~repeated`,
  `~quadratic`.
- `m.12.induction` (5): main (1 + 2 + … + n), `~odd`, `~powers`, `~squares`, `~steps`
  (sequence).
- `m.12.area-under-curve` (3): main (right rectangles under y = cx²), `~line`, `~sequence`.
- `m.12.regression-inference` (4): main (t for the slope), `~interval`, `~correlation`,
  `~standard-error`.
- `m.12.anova` (4): main (the ANOVA table), `~groups` (three equal groups from means and SDs),
  `~two-variances`, `~which-test` (sort).

### Waiting

None: every planned page is built, some with an interim picture (below).

### Changed from the plan

- **ANOVA main types the df.** The page takes SSB, df₁, SSW and df₂ (the ANOVA table's
  columns) instead of k and N, so the p-value step reads Fcdf(5, ∞, 2, 12) with plain numbers;
  the assumption says df₁ = k − 1 and df₂ = N − k. `~groups` adds the grand mean and df₂ as
  values for the same reason (10 values; the means and the SDs are two groups).
- **Worked out, not typed:** MSB, MSW and F on the ANOVA main page, and the margin and ends on
  the slope interval. With them typable the module test's input combinations left two unknowns
  in one relation and the solver searched for minutes.
- **Regression n is 3 to 1,000** (df to 998), as on the t pages: the brute-force search walks
  every whole n with a t evaluation each.
- **Induction n is 1 to 30** on the three chart pages (the terms chart draws at most 30 terms);
  `~powers` keeps n to 20 (10²⁰ is the largest sum). `~squares` (a table) goes to 1,000.
- **Deep run:** `m.12.polar-conics~parabola` takes θ from 10° to 350° with x and y worked out
  (near 0° the point runs off to 10⁹ and the curve check loses its precision);
  `~standard-error` takes s ≥ 0.001 and sₓ ≤ 10,000 so SE_b stays in range.
- **The F distribution** is `fTail` in `math/12.ts` (an incomplete beta, a copy of statMath's
  private one), exported for the Fcdf phrase in `phrasesM12.ts`.
- **Partial fractions need an x term on top (a ≠ 0)** on the two graph pages: the rational
  graph is drawn from the top's zero. A number alone on top waits on a picture need (below).

### Shared needs found while building

- **3-D axes (`vectorDiagram` in space, plan need 10):** u, v and u × v as arrows on x, y, z
  axes, the parallelogram shaded; the box of `~triple`. Values: the components, u × v, A, V.
  Pages: `m.12.vectors-3d` (now `matrixGrid` row times column), `~cross`, `~triple` (now tables).
- **`polarGrid` curve 'conic':** r = ed ÷ (1 − e cos θ) (and + and sin forms), the focus at the
  pole, the directrix dashed; driven by e, d and the point's θ. Pages: `m.12.polar-conics` (now
  the point alone).
- **`conicGraph` turned by θ:** a conic with an xy term, the x′ and y′ axes at θ. Driven by A,
  B, C (or a, b and θ). Page: `m.12.polar-conics~rotation` (now `unitCircle` with θ).
- **`functionGraph` rational by coefficients** (plan need 11, widened): the top as
  coefficients, so a number alone on top (4 ÷ ((x − 1)(x + 3))) and a quadratic top with
  complex zeros can be drawn. Pages: `m.12.partial-fractions` and `~repeated` (a ≠ 0 limit),
  `~quadratic` (now a table).
- **`functionGraph` rectangles (a Riemann sum):** n right-endpoint rectangles from 0 to b
  under the curve, their sum S in the caption. Driven by n and b. Pages:
  `m.12.area-under-curve`, `~line` (now the shaded area only).
- **`termsChart` squares:** terms n² (or any power), for `m.12.induction~squares` (now a table).
- **`normalCurve` `f: { df1, df2 }`:** the F curve, the right tail past F shaded as the p-value,
  the critical value for α marked. Pages: `m.12.anova`, `~two-variances` (now tables of P by F),
  `~groups` (now `bars` of the three means; side-by-side dot plots of three groups would be the
  second picture).
- **A t curve (plan need 1's P11):** `m.12.regression-inference` and `~standard-error` draw the
  normal null curve of b with b marked; `~correlation` marks t on the standard normal curve.
- **statMath: export `betaI` (or an `fCdf`)** so the grade file need not copy it.
- Engine 5 again: `~powers` prints S = (r^n − 1) ÷ (r − 1) with carets.
- The matcher corpus to rerun for the 31 new pages.

### Lesson-review fixes (`.review/new-math/lesson-report.md`)

- `m.12.vectors-3d~cross`: the triangle's area A_T = |u × v| ÷ 2 (the components are grouped,
  so the page has 5 values); the use line and an assumption say u and v are the sides from one
  vertex (u = Q − P, v = R − P).
- New page `m.12.vectors-3d~distance` (distance and midpoint in space; P(1, 2, 3), Q(3, 5, 9):
  d = 7, M(2, 3.5, 6)); a table of d as Q's z moves until the 3-D axes picture.
- `m.12.matrix-transformations~compose`: c = cos γ and s = sin γ as values, x″ = cx − sy and
  y″ = sx + cy (the lines read "x″ = 0 × 4 − 1 × 2"), and the s step notes the single matrix
  R(γ). `~area`: p and q named "x/y of the far corner" (hidden, picture only). `~identify`: the
  two-bin card [[−1, 0], [0, −1]] replaced by [[0.6, −0.8], [0.8, 0.6]]; a dilation has k > 0;
  the reflection bin's reason says (0, 1) lands clockwise from (1, 0).
- `m.12.polar-conics` main: n is named "Number taken away before cos θ (−1 for + cos θ)" (the
  equation boxes already print the minus); the d step notes the directrix (x = −d or x = d).
  `~ellipse`: c = a × e (no near-equal subtraction), and the top k = ed is typed
  (`startWith: ['e', 'k']`, 8 values). `~parabola`: the x and y formulas are named with θ; the
  p step notes the directrix x = −d. `~rotation`: Δ < 0 says "an ellipse" (B ≠ 0 rules out a
  circle); the angle rule and the B ≠ 0 limit are shared with the new page below.
- New page `m.12.polar-conics~sine` (r = k ÷ (m − n sin θ), directrix y = ∓d; r = 4 ÷ (1 +
  sin θ): e = 1, d = 4, r = 2 at 90°), `polarGrid` point until the conic curve (H106).
- New page `m.12.polar-conics~rotated-equation` (A′ = A cos²θ + B sin θ cos θ + C sin²θ,
  C′ = A sin²θ − B sin θ cos θ + C cos²θ; 4x² + 2xy + 2y² = 1: θ = 22.5°, A′ = 3 + √2 ≈ 4.4142,
  C′ = 3 − √2 ≈ 1.5858; the report's 2 ± √2 was a slip, A′ + C′ = A + C = 6), `unitCircle`
  interim. The sin/cos choice on the main page became this separate page: a choice box is not
  an input kind.

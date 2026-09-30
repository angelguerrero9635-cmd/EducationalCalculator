# Build notes: Grade 12 math (m.12)

Built from `.review/plans/m.12/plan.md` in its Priority order. Pages are in
`src/data/modules/math/12.ts`, layout pages in `src/data/modules/layouts/math12.ts`, step-text
phrases in `src/data/modules/harness/phrasesM12.ts`.

## Built

- `m.12.hypothesis-testing` (5): main (one-proportion, two-sided), `~mean` (left-tailed z),
  `~t-test` (one mean, σ unknown), `~two-sample` (t), `~errors` (sort).
- `m.12.confidence-intervals` (5): main (mean, σ known), `~t-interval`, `~proportion`,
  `~sample-size`, `~capture`.
- `m.12.sampling-distributions` (3): main (x̄), `~proportion` (p̂), `~counts` (binomial).
- `m.12.chi-square` (2): main (goodness of fit, 3 categories), `~independence` (2 × 3 table).
- `m.12.conics` (5): main (ellipse), `~parabola`, `~hyperbola`, `~identify` (sort), `~cone`
  (explore).
- `m.12.matrices` (5): main (row reduction, right sides typed), `~multiply`, `~determinant`
  (3 × 3), `~inverse`, `~cramer`.
- `m.12.inverse-trig` (4): main (sin⁻¹), `~arccos`, `~arctan` (rise over run), `~compose`.
- `m.12.trig-formulas-equations` (5): main (sin(A + B)), `~difference` (cos(A − B)),
  `~double-angle`, `~sine-equation`, `~tangent-equation`.
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
- Need 3 (more than 10 values): `m.12.matrices` keeps its coefficients fixed (right sides
  typed); goodness of fit has 3 categories.
- Need 4 (`[[…]]^{−1}`): `m.12.matrices~inverse` keeps rows.
- Need 5 (determinant picture): `~determinant` shows a table of D against k; `~cramer` plots
  the solution point.
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
  changes (D moves by ae − bd each step), and `~cramer` plots the solution (x, y) where the two
  lines cross. Both switch to the determinant picture when need 5 lands.
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
- **`functionGraph` inverse trig in degrees** (a `degrees` option for arcsin, arccos, arctan),
  so a page need not stretch the curve by 180/π to read its angle in degrees
  (`m.12.inverse-trig`, `~arctan`).

# Build notes: math grade 11 (Algebra 2)

Built from `.review/plans/m.11/plan.md`, in its Priority order. 48 of the plan's 65 pages are
built (40 calculators in `src/data/modules/math/11.ts`, 8 layout pages in
`src/data/modules/layouts/math11.ts`); 17 wait on engine or picture needs.

## Built

| Skill                     | Pages | Which                                                          |
| ------------------------- | ----- | -------------------------------------------------------------- |
| normal-distribution       | 6     | main, ~between, ~outside, ~empirical, ~percentile, ~margin     |
| probability-distributions | 2     | main, ~expected-value                                          |
| binomial-theorem          | 3     | main, ~expand, ~pascal-rule                                    |
| logarithms                | 4     | main, ~change-of-base, ~common-log, ~properties (sort)         |
| exp-log-equations         | 4     | main, ~same-base (interim picture), ~continuous, ~log-equation |
| series                    | 4     | main, ~arithmetic, ~sigma (rows, interim), ~infinite           |
| study-design              | 4     | main (explore), ~sampling-methods, ~study-type, ~bias (sorts)  |
| function-transformations  | 3     | main, ~point, ~name-the-move (sort)                            |
| complex-numbers           | 3     | main, ~add-subtract, ~quadratic                                |
| inverse-functions         | 3     | main, ~operations, ~inverse                                    |
| radical-functions         | 3     | main, ~extraneous, ~graph                                      |
| rational-functions        | 4     | main, ~add-subtract, ~solve, ~variation                        |
| polynomial-functions      | 2     | main, ~end-behavior (sort)                                     |
| polynomial-equations      | 2     | ~complex-pair, ~quadratic-form                                 |
| pythagorean-identities    | 1     | ~simplify (sort)                                               |

Phrases added to `harness/phrasesM11.ts`: "share within k standard deviations" (the
68–95–99.7 rule) and C(n − 1, k − 1), C(n − 1, k) (Pascal's rule). Common logs are written
`log₁₀ 20`, which the HF phrase already reads.

## Waiting

| Page                                     | Need | Why                                                           |
| ---------------------------------------- | ---- | ------------------------------------------------------------- |
| m.11.trig-graphs (main)                  | 1    | Values as multiples of π and radian step text                 |
| m.11.trig-graphs~from-features           | 1    | The period typed as a multiple of π                           |
| m.11.trig-graphs~tangent                 | 1    | Period and asymptotes as multiples of π                       |
| m.11.trig-graphs~model                   | 1    | Radian step text (cos(π/2))                                   |
| m.11.unit-circle (main)                  | 1    | k as a multiple of π, exact sin and cos in the steps          |
| m.11.unit-circle~convert                 | 2    | gcd in a relation, with a step phrase                         |
| m.11.unit-circle~coterminal              | 2    | floor (d − 360⌊d/360⌋) and the quadrant in relations          |
| m.11.unit-circle~point-on-side           | 6    | unitCircle `through: { x, y }` for a point off the circle     |
| m.11.pythagorean-identities (main)       | 2    | The quadrant's sign in a relation                             |
| m.11.pythagorean-identities~tangent      | 2    | The quadrant's sign in a relation                             |
| m.11.complex-numbers~powers-of-i         | 2    | n mod 4 in a relation, with a step phrase                     |
| m.11.complex-numbers~divide              | 11   | Exact fractions for derived complex parts (11/5 − 2/5 i)      |
| m.11.polynomial-functions~divide         | 3    | The synthetic division grid in `written.ts`                   |
| m.11.polynomial-equations (main)         | 3    | The synthetic division grid in `written.ts`                   |
| m.11.function-transformations~horizontal | 4    | functionGraph horizontal factor b (y = f(b(x − h)))           |
| m.11.inverse-functions~restrict-domain   | 5    | functionGraph `xMin` as a value, the inverse of the kept half |
| m.11.probability-distributions~at-least  | 7    | A binomcdf relation and histogram `lit` as a range            |

Need 9 (limits with a reason) is met by the existing mechanism: a `constraint: true` relation
with a `message` (the `limit` helper at the top of `11.ts`) rejects values across several
values (b ≠ 1, r ≠ 1, |r| < 1, b² − 4ac < 0, x ≥ h, u ≥ 0) with a sentence a student can read,
and the harness samples them. Need 8 (Σ) and need 10 (termsChart second term) have their
planned interims built.

## Changed from the plan

- **normal-distribution main:** the equation writes each box's unit,
  `{z} = {{x:unit} − {m:unit}}/{s:unit}`, since heights are in cm.
- **normal-distribution~outside:** the example is μ = 500 g, σ = 2 g, d = 3 g: the plan's
  μ = 0 g fails the "no zero example with a unit" test. Same z = 1.5, P = 0.1336; of 500
  packages about 67. The cutoffs L = μ − d and U = μ + d are values, so the curve can shade
  outside them (9 values).
- **normal-distribution~empirical:** the shade has no `area`: the rule's 95% is rounded and the
  curve's area is 0.9545, which the picture check would flag. `k` has `min`/`max` beside its
  `allowed` list (without them the solver's whole-number search has no bounds and rejects).
- **normal-distribution~margin:** the interval has no `level`: E = 2 SE covers 95.45%, and the
  picture check wants the level to equal the drawn area. SE is its own value (the curve's
  spread); the assumption says "about 95%".
- **probability-distributions~expected-value:** p₄ = 1 − (p₁ + p₂ + p₃) is worked out instead of
  a Σp = 1 limit, so typing one probability never rejects the others (the demo's approach).
- **binomial-theorem main:** the picture's `expand` is (A + B)ⁿ, with A = ax and B = b said in
  an assumption: `expand` writes letters, and a and b are the page's numbers. The equation is
  `({a}x + {b})^{n}` alone; k, C and T are rows. n starts at 1 (at n = 0 the harness found T
  wrong with k clearing).
- **binomial-theorem~pascal-rule:** n runs 2 to 12 with the limit k ≤ n − 1.
- **logarithms~common-log:** N runs from 0.001 (n from −3): the solver's absolute tolerance
  (1e-6) could not tell 1e-12 from 5.5e-12. The residual of N = a × 10ⁿ is in logs.
- **exp-log-equations~log-equation:** the inside u = ax + c = bʸ is a value (6 values), and the
  picture plots log_b(u) against the line y, crossing at u. functionGraph can't draw
  log_b(ax + c) for a negative a.
- **series~infinite:** n and Sₙ are values too (the partial sums closing in on S are the
  picture), and S is worked out, not typed: solving r from S near 1 gave check lines that
  rounding made unequal.
- **series main and ~infinite:** r is a decimal (a fraction base printed 9/10² without
  brackets).
- **study-design~sampling-methods:** no icons: a sort's bins take no figure, and an icon on each
  card would give the answer away.
- **Sorts:** each plan "Sentence" is the first assumption.
- **function-transformations main:** "f(x) = |x|" is said in the first assumption (a main page
  has no use line).
- **complex-numbers~add-subtract:** the picture adds z and ±w, with C = ±c and D = ±d as values
  (9 values): complexPlane's `op` is fixed, not a value.
- **complex-numbers~quadratic:** q = √(−D) ÷ (2a) is written √(−1 × D) ÷ (2 × a); with a
  negative a, q is negative (the same conjugate pair).
- **inverse-functions main:** limits p ≠ 0 and m ≠ 0 (a flat g or a linear f).
- **radical-functions main:** the picture is the demo's `plot` of y = √(ax + b) with the point
  (x, c), and the relation is ax + b = c² (solvable for x, c and b). A root graph whose start
  is on the x-axis trips the harness (see shared needs).
- **radical-functions~extraneous:** the picture is the squared equation's parabola,
  x² + (2b − 1)x + (b² − a), with both candidates as its zeros, not the root and the line (same
  harness bug). Values: a, b, B, C, x₁, x₂, and the check at x₂ (L and R); the step for R says
  whether x₂ is extraneous. x₁, the larger candidate, always works.
- **rational-functions main:** a limit x ≠ c (the hole) instead of ", x ≠ c" in the rule.
- **rational-functions~add-subtract:** the denominators are x − p and x − q (so p and q are the
  poles the picture draws); the zero Z = −B ÷ A is the tenth value. The plan's example is
  a = 3, p = 1, c = 2, q = −4.
- **rational-functions~solve:** no single "kept" value: x₁ and x₂ are the candidates, and each
  step says whether it makes a denominator 0 (extraneous) or is a solution.
- **rational-functions~variation:** x₁ and y₁ up to 60, so k stays under 3,600 (the picture
  check wants y = 0 approached by x = 10⁷).
- **polynomial-functions main:** the multiplicity m is fixed at 2 (r₁ is a double zero): the
  picture's `times` is a number, not a value. Moving r₂ onto r₁ makes a triple zero. Values:
  a, r₁, r₂, r₃, x, y.
- **polynomial-equations~quadratic-form:** the limit u₂ ≥ 0 is written as b ≤ 0 and c ≥ 0.
- **Work lines** on binomial T, ~expand's cⱼ, the series aₙ, the complex quadratic's p, the
  inverse's n, the rational add-subtract B, S and Z, and the quadratic-form u's, to dodge the
  two simplifying bugs below.

## Shared needs found while building

1. **Simplifying drops a negative base's bracket** (`simplify.ts`): `(−3)^(5 − 3)` becomes
   `−3^2`. Pages: m.11.binomial-theorem, ~expand, m.11.series (worked around with work lines).
2. **Simplifying prints −(−4) as −−4** (`simplify.ts`). Pages: complex ~quadratic, inverse
   ~inverse, rational ~add-subtract, polynomial-equations ~quadratic-form (worked around).
3. **The zero check at a root's start** (`harness/picturesFunctionGraph.ts`, `featureIssues`):
   the derivative at a square root's endpoint is NaN, so a root graph starting on the x-axis
   (k = 0) always fails "zero at h gives 0". Pages: radical main and ~extraneous (worked
   around with other pictures); any Grade 9–12 root page with k = 0.
4. **functionGraph `times` as a value id** for polynomial zeros, so the multiplicity can be
   typed. Page: m.11.polynomial-functions main.
5. **complexPlane `op` from a value** (1 = sum, 2 = difference), for pages with a sign box.
   Page: m.11.complex-numbers~add-subtract (worked around with ±w).
6. **Sort bins with a figure** (the sampling icons on the bins). Page:
   m.11.study-design~sampling-methods.
7. **The solver's absolute tolerance** (`closeTo`, 1e-6): tiny values (10⁻¹²) all look equal.
   Page: m.11.logarithms~common-log (range narrowed).
8. **Values with `allowed` need `min` and `max`** too, or the whole-number search has NaN
   bounds and rejects every entry: worth a module test or a default from the list.

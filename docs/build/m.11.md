# Build notes: math grade 11 (Algebra 2)

Built from `.review/plans/m.11/plan.md`, in its Priority order. 61 of the plan's 65 pages are
built (53 calculators in `src/data/modules/math/11.ts`, 8 layout pages in
`src/data/modules/layouts/math11.ts`); 4 wait on picture needs. The second round (after the
merge of E2–E4 and E6, `docs/HS_NEEDS.md`) built the 13 pages that waited on needs 1, 2, 3
and 11.

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
| complex-numbers           | 5     | main, ~add-subtract, ~quadratic, ~powers-of-i, ~divide         |
| inverse-functions         | 3     | main, ~operations, ~inverse                                    |
| radical-functions         | 3     | main, ~extraneous, ~graph                                      |
| rational-functions        | 4     | main, ~add-subtract, ~solve, ~variation                        |
| polynomial-functions      | 3     | main, ~divide, ~end-behavior (sort)                            |
| polynomial-equations      | 3     | main, ~complex-pair, ~quadratic-form                           |
| unit-circle               | 3     | main, ~convert, ~coterminal                                    |
| trig-graphs               | 4     | main, ~from-features, ~tangent, ~model                         |
| pythagorean-identities    | 3     | main, ~tangent, ~simplify (sort)                               |

Phrases added to `harness/phrasesM11.ts`: "share within k standard deviations" (the
68–95–99.7 rule) and C(n − 1, k − 1), C(n − 1, k) (Pascal's rule). Common logs are written
`log₁₀ 20`, which the HF phrase already reads; gcd, mod and ⌊ ⌋ come from E3.

## Waiting

| Page                                     | Need | Why                                                                |
| ---------------------------------------- | ---- | ------------------------------------------------------------------ |
| m.11.unit-circle~point-on-side           | 6    | unitCircle `through: { x, y }` for a point off the circle (P10)    |
| m.11.function-transformations~horizontal | 4    | functionGraph horizontal factor b (y = f(b(x − h))) (P6)           |
| m.11.inverse-functions~restrict-domain   | 5    | functionGraph `xMin` as a value, the inverse of the kept half (P6) |
| m.11.probability-distributions~at-least  | 7    | A binomcdf relation and histogram `lit` as a range (P11)           |
| m.11.radical-functions~rational-exponent | —    | functionGraph has no power family y = a·x^(p/q) (lesson review)    |

Need 9 (limits with a reason) is met by a `constraint: true` relation with a `message` (the
`limit` helper at the top of `11.ts`). Needs 8 (Σ) and 10 (termsChart second term) have their
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

### Second round (needs 1, 2, 3, 11)

- **Worked-out π values** (the periods P, the asymptote V, the wheel's B) use `pi: true`
  (0.25π, 2π, or a decimal) instead of `pi: 'fraction'`: the sampling test reads an answer
  "π/3" as π (see shared needs). Typed angles (θ, h, x, the typed period) use `pi: 'fraction'`.
- **unit-circle main:** θ is typed in radians (`pi: 'fraction'`, measure 'radians'), with
  degrees, cos, sin and tan worked out; a limit rejects θ where cos θ = 0 (tan has no value).
  The values are decimals (−0.866), not √3/2.
- **unit-circle~convert:** d, p and q are all typable (225° → 5π/4, and 7π/6 → 210°): g = gcd(d,
  180), p = d ÷ g, q = 180 ÷ g; a p/q not in lowest terms (or q not a factor of 180) is
  rejected with that reason. The picture is the unit circle at d with radian labels.
- **unit-circle~coterminal:** angles on an axis are rejected (no quadrant); the reference angle
  is |c − 180⌊Q ÷ 2⌋|, its step picking the quadrant's form (180 − c, c − 180, …).
- **trig-graphs~from-features:** x and y (a point on the curve) are values too, so A, P and k
  connect through a formula (the module test requires it); the period is typed with brackets,
  2π ÷ (π/2).
- **trig-graphs~tangent:** a limit rejects x on an asymptote.
- **trig-graphs~model:** the picture is A cos(B(t − H)) + k with H = T ÷ 2 (the top), which is
  k − A cos(Bt); functionGraph can't take −A. Heights and minutes are in the names, not units.
- **pythagorean-identities main and ~tangent:** the quadrant's sign is written (−1)^⌊Q ÷ 2⌋ in
  the rule and θ is 180⌊Q ÷ 2⌋ ± sin⁻¹ (or + tan⁻¹); the steps show the quadrant's own form. The
  sign of s (or tan θ) must fit the quadrant (0 allowed), and |sin θ| < 1.
- **complex-numbers~powers-of-i:** r = n mod 4, the turn θ = 90r°, and p, q as cos θ, sin θ
  (the quarter turns); the picture is the unit point at θ. Fractions show up to /200 on ~divide.
- **polynomial-functions~divide:** a to d and r are whole numbers (the grid's work is checked);
  the grid is drawn only while P(r) ≥ 0 (see shared needs).
- **polynomial-equations main:** the remainder R is a value (10 values), with the limit R = 0
  ("r is not a root … try another ±p/q") and the grid under its step.

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
9. **Answers written as a fraction of π** (`resultNumber` in `sampling.test.ts`): "π/3" reads as
   π, so a worked-out value can't use `pi: 'fraction'`. Pages: trig-graphs main, ~tangent,
   ~model (periods shown as 0.25π or decimals meanwhile).
10. **Written work ending in a negative number** (`sampling.test.ts`, the `plain` pattern
    `= (\d+…)`): a synthetic division with P(r) < 0 is flagged wrong though it is right. Page:
    polynomial-functions~divide (the grid is hidden when P(r) < 0).
11. **Simplifying − −** (need 2 above) also hits a product with a negative factor after a minus,
    (4 × 1 − −10 × 2); complex ~divide works around it with work lines.

## Lesson review (`.review/hs-m.11/lesson-report.md`)

All 18 errors and 45 improvements are fixed in the pages, except those below. Every value symbol
that was an expression is now a plain letter (B₁, B₂, s, t, …).

New pages from the review's coverage gaps (65 pages now):

- **m.11.exp-log-equations~two-logs:** log_b(x) + log_b(x + c) = y → x(x + c) = bʸ, then the
  quadratic formula; x₂ is always rejected (x and x + c are both negative there). The picture is
  the quadratic's two zeros, not a log graph (functionGraph can't draw a sum of logs). Example
  log₃ x + log₃(x − 8) = 2 → x = 9.
- **m.11.polynomial-equations~sum-of-cubes:** A = a³, B = b³ typable either way (∛ brackets its
  argument so the harness reads a negative one), the second factor a²x² − abx + b² and the real
  zero −b ÷ a.
- **m.11.polynomial-functions~long-division:** a cubic ÷ x² + px + q; quotient Ax + B and
  remainder Cx + D, the check line written out.
- **m.11.rational-functions~multiply-divide:** (x − a)/(x − b) × ((x − c)/(x − d))ᵗ with t = ±1;
  the step's right side is what is left after cancelling, its how writes the product, the
  cancelled factor and the x left out. m, n and h (the flipped fraction and the divisor's own
  left-out x) are hidden picture values, so the graph shows the holes.

Changed from the report or not done:

- **Pythagorean ~tangent, mixed numbers, "p(X = k)":** left to the lead's engine
  changes (improper fractions, exact-only fractions, capitals kept in names); `fraction` stays on
  c and s of pythagorean ~tangent.
- **rational ~variation:** x₁ and y₁ still stop at 60 until the harness asymptote check scales.
- **polynomial-equations ~quadratic-form (negative u) and main (a quotient with complex roots):**
  still rejected; Partly, as the report says.
- **complex ~quadratic:** q has `fraction`; the radical form (√31/4) needs exact radicals.
- **unit-circle main:** decimals stay until exact values at multiples of π/6 and π/4 exist.
- **Question re-filing** ([data] NAEP-2005-12M3-#7): the lead's.

The deep run (`SAMPLES=100 SEQUENCES=15 UNIT_CASES=10`) found three more lesson problems, now
fixed: normal main accepted σ = 0 in km (a limit σ > 0), ~log-equation drew bʸ ≈ 10⁻¹³ (a limit
bʸ ≥ 0.000001), and ~divide wrote NaN work lines before a was known. What it still reports is
the engine's (below): ~between, ~outside and ~percentile tolerance cases, quadratic-form's
stale roots, series' mixed number r = −4 1/2 in a log step, and probability-distributions
leaving p unknown after E = 0 clears the older p.

## Shared needs from the lesson review

12. **Exact trig values** at multiples of π/6 and π/4 (−√3/2). Page: m.11.unit-circle.
13. **Exact radicals in answers** (√31/4). Page: m.11.complex-numbers~quadratic.
14. **Complex roots in polynomial answers** (x⁴ − 5x² − 36 = 0 → ±3, ±2i; x³ − 1 = 0). Pages:
    m.11.polynomial-equations~quadratic-form and main.
15. **The rational asymptote check scaling with x** (so x₁, y₁ can reach 1,000). Page:
    m.11.rational-functions~variation.
16. **functionGraph power family** y = a·x^(p/q). Page: m.11.radical-functions~rational-exponent.
17. **A log-sum graph** (log_b x + log_b(x + c)) for m.11.exp-log-equations~two-logs (drawn as
    the quadratic's zeros meanwhile).
18. **The solver re-solving after a newer entry clears an older one** (p = E ÷ n left unknown
    once E = 0 clears p). Page: m.11.probability-distributions.

### Pictures placed (H89–H110)

| Page                                 | Entry           | What changed                                                                                                                    | Stand-in that went                                                   |
| ------------------------------------ | --------------- | ------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| `m.11.exp-log-equations~same-base`   | H93             | termsChart `lit: 'p'`, `litTerm: 'B1'`, `powers: true`: g^p lit beside g^q, terms as powers                                     | B₁ under the picture (`pictureLabels`)                               |
| `m.11.exp-log-equations~two-logs`    | H106 (4)        | functionGraph `logSum` with y = y, the crossing at x₁ and x₂ rejected; a limit u ≥ 0.000001 (the curve can't be drawn below it) | the quadratic's zeros (factored parabola); b and y under the picture |
| `m.11.polynomial-functions`          | H105 (2)        | new value n (multiplicity of r₁, 1–4), y = a(x − r₁)ⁿ(x − r₂)(x − r₃); `times: 'n'`; assumptions for any n                      | the fixed double zero                                                |
| `m.11.complex-numbers~add-subtract`  | H105 (3)        | complexPlane `opFrom: 'sg'` with w = c + di (the picture draws −w for a difference); C and D stay as values                     | w drawn as (C, D) with `op: 'sum'`                                   |
| `m.11.study-design~sampling-methods` | H104, H105 (16) | the five sampling icons on the bins and an `intro` sentence                                                                     | none (no figures before)                                             |

Not placed (the page is not built yet; each plan entry says BUILD, waiting on this picture, and
its gallery demo is a full page `promote-demo.mjs` can copy): `m.11.function-transformations~horizontal`
(H94, `g.m11-function-transformations-horizontal`), `m.11.inverse-functions~restrict-domain`
(H94, `g.m11-inverse-functions-restrict-domain`), `m.11.unit-circle~point-on-side` (H98,
`g.m11-unit-circle-point-on-side`), `m.11.probability-distributions~at-least` (H99,
`g.m11-probability-distributions-at-least`), `m.11.radical-functions~rational-exponent` (H106,
`g.m11-radical-functions-rational-exponent`).

### Page-review fixes (`.review/hs-page-m/page-report-m11-12.md`)

- complex-numbers~add-subtract: + or − is a choice box in the equation row,
  "(4 − 2i) {s:op} (−1 + 5i)", s stored 1 (+) or 2 (−); C and D are c and d times 1 or −1.
- complex-numbers~quadratic, ~powers-of-i: `fixed`, no handle on the worked-out point.
- normal-distribution~outside: `keep: ['m', 's', 'N']`, so a cutoff's drag moves d and the
  other cutoff follows (the two cutoffs were both held, so a drag did nothing).
- function-transformations~point: `keep: ['p', 'a', 'h', 'k']`, so the key point's drag sets h
  and k and keeps the typed p (the moved point X was held, which cleared p).
- exp-log-equations~two-logs: the caption no longer prints the unnamed "u = 9".
- Left for the shared fixer (component only): the same-base caption ("lit"), the two-logs
  legend's double space, the w tag over the −5i tick.

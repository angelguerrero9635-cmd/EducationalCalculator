# Direction plan: math grade 11 (Algebra 2)

17 skills, 65 pages (57 calculators, 8 layout pages). Every example below was worked by hand;
none comes from `research/`.

## Decisions

- **Letters and notation.** Standard Algebra 2 notation throughout: f(x), f⁻¹(x), f(g(x)), i,
  a + bi, log_b(x), ln x, e, π radians, Σ, C(n, k), E(X), μ, σ, z, Φ(z), invNorm(p), p̂. The
  rule comes first in letters, then the numbers put in, then one line per stage of simplifying.
  Sentences are at most 35 words, and a page has at most 10 values. Fractions and radicals are
  typeset (stacked). Angles on unit-circle and trig-graph pages are in radians and written as
  multiples of π (5π/6, not 2.618). Degrees are used only where the page is about converting.
- **Equation inputs.** Pages whose problem is one equation use the Grades 9–12 template from
  `docs/EQUATION_INPUTS.md` (given in each bullet). Pages about a graph, a distribution or
  several relations keep rows.
- **Layouts (8 pages).** `m.11.study-design` is an explore page (`studyDesign`) and its three
  problem types are sorts. The rule-recognition lessons are also sorts, because a calculator
  would only check numbers where the lesson is about form:
  `m.11.function-transformations~name-the-move`, `m.11.polynomial-functions~end-behavior`,
  `m.11.logarithms~properties`, `m.11.pythagorean-identities~simplify`. All other pages are
  calculators.
- **Pilots.** None: `pilots.ts` and `gallery.ts` have no `m.11` page. Build each page from its
  demo with `promote-demo.mjs` into a new `src/data/modules/math/11.ts`.
- **Limits.** Where a value would make the rule false (b = 1 for a log base, r = 1 for a series,
  D ≥ 0 on a complex-roots page), the page rejects the value with a reason a student can read.
  A limit is never written as a relation (Engine need 9).
- **Ranges** come from the released items: counts to 1,500 (normal), n to 40 (binomial), powers
  to 8¹² (exp-log). Otherwise, integers use −20..20 and coefficients use −10..10.

### 1. m.11.function-transformations — Parent functions and transformations

- **Standard:** F-BF.3, F-IF.7.
- **Textbooks:** im-hs 11.5; openstax-precalculus 12.1; big-ideas-hs 11.1, 11.2, 11.6; envision-aga 11.1; larson-precalculus 12.1; reveal-hs 11.1.
- **Tests ask:** no released items; common types:

| Question | Page | Mark |
| --- | --- | --- |
| (common) Describe y = −2|x + 3| − 1 from its parent | main | Solves |
| (common) Write the equation after "shift right 4, reflect, up 2" | main | Solves |
| (common) Where does (2, 4) on y = f(x) go on y = 3f(x − 1) + 2? | ~point | Solves |
| (common) Which change is f(x − 3) versus f(x) − 3? | ~name-the-move | Solves |
| (common) Graph y = f(2x), y = f(−x) | ~horizontal | Partly (waits on need 4) |

- **Main — BUILD `m.11.function-transformations`:** picture `functionGraph` (demo
  `g.m11-function-transformations-parent`), family absolute {a, h, k}, `parent: true` (|x| dashed),
  `at: { x: 'x', y: 'y' }`, marks ['vertex']. Equation `y = {a}f(x − {h}) + {k}` with "f(x) = |x|"
  on the use line. Values: a vertical factor (`allowed` [−4, −3, −2, −1, −0.5, 0.5, 1, 2, 3, 4]),
  h (−10..10), k (−10..10), x (−20..20), y (derived). Relation: y = a|x − h| + k. Assumptions:
  "h moves the graph right when h is positive, because x − h = 0 at x = h."; "k moves it up;
  a stretches it by a factor of |a| and flips it over the x-axis when a is negative."; "The
  parent's vertex (0, 0) lands at (h, k)." Example: a = 2, h = 3, k = −1, x = 5 → y = 2|5 − 3| − 1 = 3;
  the vertex is at (3, −1). startWith ['a', 'h', 'k', 'x'].
- **~point — BUILD:** "Use this for: where does a point of the parent go?" Parent f(x) = 2ˣ
  (`functionGraph` exponential {a, b: 2, h, k}, `parent: true`, at {x: 'X', y: 'Y'}, marks
  ['asymptotes']; demo `g.m9-exponential-functions-growth`). Values: p (−2..4), q = 2ᵖ (derived),
  a (`allowed` as main), h, k, X (derived), Y (derived). Relations: X = p + h, Y = a·q + k.
  Assumptions: "Horizontal moves change x only; vertical moves change y only."; "The asymptote
  y = 0 moves to y = k." Example: p = 2, q = 4, a = −3, h = −1, k = 5 → X = 1, Y = −12 + 5 = −7;
  check −3·2^(1+1) + 5 = −7. startWith ['p', 'a', 'h', 'k'].
- **~horizontal — BUILD (waits on need 4):** y = f(b(x − h)) with parent |x| or √x; b in
  `allowed` [−3, −2, −1, −0.5, 0.5, 2, 3]. Relation: X = p/b + h for the image of parent point p.
  Example: √x, point (4, 2), y = √(2x) → X = 2, Y = 2 (horizontal compression by 1/2); b = −1
  gives (−4, 2), a reflection across the y-axis.
- **~name-the-move — BUILD (sort):** bins "Vertical shift", "Horizontal shift", "Reflection",
  "Stretch or compression". Cards (text, one right bin each): y = f(x) + 4 (V); y = f(x) − 2 (V);
  y = f(x + 5) (H); y = f(x − 1) (H); y = −f(x) (R); y = f(−x) (R); y = 3f(x) (S);
  y = ½f(x) (S); y = f(x/2) (S). Sentence: "A change inside the brackets acts on x, sideways
  and opposite to its sign; a change outside acts on y, the way it reads."
- **Verdict:** 4 pages; the common types are covered once need 4 lands.

### 2. m.11.complex-numbers — Complex numbers and quadratic equations with complex solutions

- **Standard:** N-CN.1, N-CN.2, N-CN.3 (+, conjugate division), N-CN.7.
- **Textbooks:** eureka-hs 11.1, 12.1, 12.3; im-hs 11.3; openstax-algebra-trig 9.2, 11.5, 12.10; openstax-intermediate-algebra 11.8; openstax-precalculus 12.3, 12.8; big-ideas-hs 11.3; envision-aga 11.2; hmh-into-hs 11.1, 11.2; larson-precalculus 12.2; reveal-hs 11.3.
- **Tests ask:** no released items; common types:

| Question | Page | Mark |
| --- | --- | --- |
| (common) Multiply (3 − 2i)(4 + i) | main | Solves |
| (common) Add or subtract two complex numbers | ~add-subtract | Solves |
| (common) Simplify i⁴³ | ~powers-of-i | Solves (need 2) |
| (common) Divide (2 + i)/(1 − 3i) | ~divide | Solves (need 11) |
| (common) Solve x² + 6x + 13 = 0 | ~quadratic | Solves |

- **Main — BUILD `m.11.complex-numbers`:** multiply. Picture `complexPlane` op 'product'
  (demo `g.m11-complex-numbers-product`), z {re: a, im: b}, w {re: c, im: d}, result {re: p, im: q}.
  Equation `({a} + {b}i)({c} + {d}i) = {p} + {q}i`. Values a, b, c, d (integers −10..10), p, q
  (derived). Relations: p = ac − bd, q = ad + bc. Assumptions: "i² = −1, so the i·i term moves
  to the real part with its sign changed."; "Multiply every term by every term, as with two
  binomials."; "On the plane the lengths multiply and the angles add." Example: (2 + 3i)(1 − 4i)
  = 2 − 8i + 3i − 12i² = 14 − 5i. startWith ['a', 'b', 'c', 'd'].
- **~add-subtract — BUILD:** equation `({a} + {b}i) {o:op} ({c} + {d}i) = {p} + {q}i`; picture
  `complexPlane` op 'sum' or 'difference' by o (demo `g.m11-complex-numbers-sum`). Values a, b, c,
  d, o (1 = +, 2 = −), p, q. Relations: p = a + (3 − 2o)c, q = b + (3 − 2o)d. Example:
  (4 − 2i) − (−1 + 5i) = 5 − 7i. "Combine real parts with real parts, imaginary with imaginary."
- **~powers-of-i — BUILD (need 2):** values n (0..100), r = n mod 4 (derived), p, q (derived).
  Picture `complexPlane` z {modulus: 1, argument: 'A'} with A = 90r (derived, degrees), each
  power of i being a quarter turn. Example: i²⁷: 27 = 4·6 + 3, so i²⁷ = i³ = −i.
- **~divide — BUILD (need 11):** equation `{{a} + {b}i}/{{c} + {d}i} = {p} + {q}i`; picture
  `complexPlane` z {re: c, im: d}, `conjugate: true`, modulus 'm'. Values a, b, c, d, m (derived
  |c + di|), p, q (derived). Relations: p = (ac + bd)/(c² + d²), q = (bc − ad)/(c² + d²); limit c, d
  not both 0. Example: (3 + 4i)/(1 + 2i): numerator (3 + 4i)(1 − 2i) = 11 − 2i, denominator
  1² + 2² = 5 → 11/5 − 2/5 i; check (11/5 − 2/5 i)(1 + 2i) = 3 + 4i.
- **~quadratic — BUILD:** equation `{a}x² + {b}x + {c} = 0`; picture `complexPlane` z {re: p, im: q},
  `conjugate: true` (the two roots are conjugates). Values a (nonzero), b, c (−20..20), D (derived),
  p, q (derived). Relations: D = b² − 4ac; p = −b/(2a); q = √(−D)/(2a); limit D < 0 ("real
  roots: use the quadratic formula page"). Example: x² − 4x + 13 = 0: D = 16 − 52 = −36,
  x = (4 ± 6i)/2 = 2 ± 3i; check (2 + 3i)² − 4(2 + 3i) + 13 = 0.
- **Verdict:** 5 pages; all common types covered (plotting and modulus are shown on every picture).

### 3. m.11.polynomial-functions — Graphs, end behavior, division and the remainder theorem

- **Standard:** A-APR.2, A-APR.3, A-APR.6, F-IF.7c.
- **Textbooks:** eureka-hs 11.1; im-hs 11.2; openstax-algebra-trig 11.5; openstax-elementary-algebra 9.6; openstax-intermediate-algebra 11.5, 11.6; openstax-precalculus 12.3; big-ideas-hs 11.4; envision-aga 11.3; hmh-into-hs 11.2; larson-precalculus 12.2; reveal-hs 11.4, 11.5.
- **Tests ask:** no released items; common types:

| Question | Page | Mark |
| --- | --- | --- |
| (common) Zeros, multiplicity and sketch of y = (x + 2)²(x − 1)(x − 3) | main | Solves |
| (common) End behavior of −3x⁵ + … | ~end-behavior | Solves |
| (common) Divide 2x³ − 3x² + x − 5 by x − 2 | ~divide | Solves (need 3 for the grid) |
| (common) Find P(−1) by the remainder theorem; is x + 1 a factor? | ~divide | Solves |
| (common) Long division by a quadratic divisor | none | No (Priority 14) |

- **Main — BUILD `m.11.polynomial-functions`:** picture `functionGraph` polynomial {a, zeros:
  [{x: r1, times: m}, {x: r2}, {x: r3}]} (demo `g.m11-polynomial-functions-zeros`), marks ['zeros',
  'intercept'], at {x, y}. Values: a (`allowed` [−3, −2, −1, 1, 2, 3]), r1, r2, r3 (−6..6), m
  (`allowed` [1, 2, 3]), n (degree, derived), x (−10..10), y (derived). Relations: n = m + 2;
  y = a(x − r1)^m (x − r2)(x − r3). Assumptions: "An odd multiplicity crosses the x-axis, and an
  even one touches and turns."; "The leading term axⁿ decides the ends."; "A degree-n polynomial
  has at most n − 1 turns." Example: a = 1, r1 = −2 (m = 2), r2 = 1, r3 = 3 → n = 4, both ends up,
  touches at −2, crosses at 1 and 3; at x = 0: y = (2)²(−1)(−3) = 12. startWith ['a', 'r1', 'm', 'r2', 'r3', 'x'].
- **~divide — BUILD:** "Divide by x − r; the remainder is P(r)." Equation `P({r}) = {R}`
  beside the rows; picture `functionGraph` polynomial coefficients [a, b, c, d], at {x: r, y: R}
  (demo `g.m11-polynomial-equations-remainder`). Values a, b, c, d (−10..10), r (−10..10), q2, q1,
  q0, R (derived) = 9. Relations: q2 = a, q1 = b + r·q2, q0 = c + r·q1, R = d + r·q0 (synthetic
  division, the grid of need 3). Assumptions: "R = 0 exactly when x − r is a factor (factor
  theorem)." Example: (2x³ − 3x² + x − 5) ÷ (x − 2): 2, −3 + 4 = 1, 1 + 2 = 3, −5 + 6 = 1 →
  quotient 2x² + x + 3, remainder 1; P(2) = 16 − 12 + 2 − 5 = 1.
- **~end-behavior — BUILD (sort):** bins "Up on both ends", "Down on both ends", "Down left, up
  right", "Up left, down right". Cards: y = x⁴ − 5x² + 4 (UU); y = 2x⁴ + x³ (UU); y = −2x⁶ + x
  (DD); y = −x² + 7 (DD); y = x³ − 4x (DU); y = 0.5x⁵ + 2x⁴ (DU); y = −x³ + 2x² (UD); y = 4 − x⁵
  (UD). Sentence: "Only the leading term decides the ends: an even degree sends both ends the same
  way, an odd degree opposite ways, and a negative sign flips both."
- **Verdict:** 3 pages; 4 of 5 common types (long division by a quadratic waits).

### 4. m.11.polynomial-equations — Rational roots and the fundamental theorem of algebra

- **Standard:** A-APR.2, A-APR.3, N-CN.9 (+), A-SSE.2.
- **Textbooks:** openstax-algebra-trig 11.5; openstax-intermediate-algebra 11.6; openstax-precalculus 12.3; big-ideas-hs 11.4; envision-aga 11.3; larson-precalculus 12.2; reveal-hs 11.5.
- **Tests ask:** no released items; common types:

| Question | Page | Mark |
| --- | --- | --- |
| (common) List the possible rational roots of 2x³ − … + 6 | main (steps) | Solves |
| (common) Given one root, find the others | main | Solves |
| (common) Write the least-degree polynomial with zeros 1 and 2 + 3i | ~complex-pair | Solves |
| (common) How many roots does a degree-5 polynomial have? | ~complex-pair (assumption) | Partly |
| (common) Solve x⁴ − 13x² + 36 = 0 | ~quadratic-form | Solves |
| (common) Factor a sum of cubes | none | No (Priority 15) |

- **Main — BUILD `m.11.polynomial-equations`:** picture `functionGraph` polynomial coefficients
  [a, b, c, d] with `shows: { zeros: ['r', 'x2', 'x3'] }`, marks ['zeros'] (demo
  `g.m11-polynomial-equations-remainder`). Equation `{a}x³ + {b}x² + {c}x + {d} = 0`. Values a, b,
  c, d (−20..20), r (the tested root), q1, q0 (derived), x2, x3 (derived) = 9. Relations: q1 = b + r·a,
  q0 = c + r·q1; x2, x3 = (−q1 ± √(q1² − 4a·q0))/(2a). Limits: d + r·q0 = 0 ("r is not a root:
  the remainder is not 0; try another ±p/q"), and q1² − 4a·q0 ≥ 0 ("the other roots are complex:
  see ~complex-pair"). Assumptions: "Any rational root is ± (a factor of d)/(a factor of a)."; "A
  zero remainder means x − r is a factor."; "The quotient is a quadratic, which the formula
  finishes." Example: 2x³ − 3x² − 11x + 6 = 0; candidates ±1, ±2, ±3, ±6, ±1/2, ±3/2; r = 3 gives
  2, 3, −2, remainder 0; 2x² + 3x − 2 = 0 → x = (−3 ± 5)/4 → 1/2, −2. startWith ['a', 'b', 'c', 'd', 'r'].
- **~complex-pair — BUILD:** "Write the polynomial with zeros r and p ± qi." Picture
  `complexPlane` z {re: p, im: q}, `conjugate: true` (demo `g.m11-complex-numbers-plot`). Values
  r, p, q (−10..10), s = p² + q², b, c, d (derived). Relations: b = −2p − r, c = s + 2pr, d = −r·s,
  for P(x) = x³ + bx² + cx + d. Assumptions: "A degree-n polynomial has exactly n roots, counting
  complex roots and repeats (fundamental theorem)."; "Real coefficients bring complex roots in
  conjugate pairs." Example: r = 1, p = 2, q = 3: s = 13, P(x) = (x − 1)(x² − 4x + 13) = x³ − 5x²
  + 17x − 13; P(1) = 0.
- **~quadratic-form — BUILD:** equation `x⁴ + {b}x² + {c} = 0`; picture `functionGraph` polynomial
  coefficients [1, 0, b, 0, c], marks ['zeros']. Values b, c, u1, u2 (derived), x1, x2 (derived: the
  positive square roots). Relations: u = x²; u1, u2 = (−b ± √(b² − 4c))/2; x1 = √u1, x2 = √u2;
  limits b² − 4c ≥ 0 and u1, u2 ≥ 0. Example: x⁴ − 13x² + 36 = 0 → (u − 4)(u − 9) = 0 →
  x = ±2, ±3; check 3⁴ − 13·9 + 36 = 0.
- **Verdict:** 3 pages; 4 of 6 types Solve, the theorem count is Partly, sum of cubes waits.

### 5. m.11.binomial-theorem — The binomial theorem and Pascal's triangle

- **Standard:** A-APR.5 (+).
- **Textbooks:** eureka-hs 12.3, 12.5; openstax-algebra-trig 12.13; openstax-intermediate-algebra 11.12; openstax-precalculus 12.11; openstax-statistics 12.4; big-ideas-hs 10.13, 11.8; envision-aga 10.12, 11.12; larson-farber 12.3; larson-precalculus 12.9; reveal-hs 10.12, 11.4.
- **Tests ask:**

| Question | Page | Mark |
| --- | --- | --- |
| NAEP-1990-12M9-#7 (arrangements of 5) | m.10.probability-rules (permutations) | No here: misfiled |
| NAEP-1996-12M13-#6 (list seatings) | m.10.probability-rules | No here: misfiled |
| NAEP-2005-12M4-#18 (color patterns up to turning) | none | No: misfiled, symmetry counting |
| (common) Coefficient of x³ in (2x − 3)⁵ | main | Solves |
| (common) Expand (x + 2)⁴ | ~expand | Solves |
| (common) Fill row 6 of Pascal's triangle | ~pascal-rule | Solves |

- **Main — BUILD `m.11.binomial-theorem`:** term of (ax + b)ⁿ. Picture `pascalTriangle` n, k lit,
  expand {a, b} (demo `g.m11-binomial-theorem-pascal`). Equation `({a}x + {b})^{n}` with the term
  row `C({n}, {k})`. Values a (−5..5), b (−10..10), n (0..12), k (0..n), C (derived), T (derived
  coefficient of xᵏ). Relations: C = n!/(k!(n − k)!); T = C·aᵏ·bⁿ⁻ᵏ. Assumptions: "Row n of Pascal's
  triangle gives the coefficients."; "The powers of the two terms add up to n in every term."; "A
  negative b makes every other term negative." Example: (2x − 3)⁵, x³: C(5, 3) = 10, 2³ = 8,
  (−3)² = 9 → T = 720, the term 720x³. startWith ['a', 'b', 'n', 'k'].
- **~expand — BUILD:** (ax + b)ⁿ for n ≤ 6: values a, b, n (`allowed` 0..6), c6..c0 (derived) = 10.
  Relation cⱼ = C(n, j)·aʲ·bⁿ⁻ʲ (zero for j > n). Picture `pascalTriangle` expand {a, b} (n ≤ 8).
  Example: (x + 2)⁴ = x⁴ + 8x³ + 24x² + 32x + 16 (row 1, 4, 6, 4, 1 times 2⁰, 2¹, 2², 2³, 2⁴).
- **~pascal-rule — BUILD:** picture `pascalTriangle` n, k (demo `g.m11-binomial-theorem-row-12`).
  Values n (1..12), k (1..n − 1), L = C(n − 1, k − 1), R = C(n − 1, k) (derived), E (derived).
  Relation: E = L + R. Example: row 6, entry 2: C(5, 1) + C(5, 2) = 5 + 10 = 15.
- **Verdict:** 3 pages; common types all Solve; the 3 released items belong to m.10.probability-rules.

### 6. m.11.inverse-functions — Function operations, composition and inverses

- **Standard:** F-BF.1b, F-BF.1c (+), F-BF.4a, F-BF.4b (+), F-BF.4c (+).
- **Textbooks:** eureka-hs 11.3, 12.3; im-hs 9.4, 11.5; openstax-algebra-trig 9.3, 11.5, 11.8; openstax-intermediate-algebra 11.8, 11.10; openstax-precalculus 12.1, 12.3, 12.6; big-ideas-hs 9.10, 11.5; envision-aga 9.10, 11.5; hmh-into-hs 9.2, 11.2, 11.3; larson-precalculus 12.1; reveal-hs 9.5, 11.6.
- **Tests ask:**

| Question | Page | Mark |
| --- | --- | --- |
| NAEP-2005-12M3-#16 (f(g(x)) for a quadratic f and linear g) | main | Solves |
| (common) (f + g)(3), (f·g)(3) | ~operations | Solves |
| (common) Find f⁻¹ for f(x) = 3x − 6; check f(f⁻¹(x)) = x | ~inverse | Solves |
| (common) Inverse of a quadratic on x ≥ h | ~restrict-domain | Solves (need 5 for the picture) |

- **Main — BUILD `m.11.inverse-functions`:** f(g(x)) with f(x) = px² + qx + r, g(x) = mx + c.
  Picture `functionGraph` quadratic standard {a: A, b: B, c: C}, at {x, y} (demo
  `g.m9-quadratic-functions-standard`). Values p, q, r, m, c (−10..10), A, B, C (derived), x, y (derived)
  = 10. Relations: A = p·m², B = 2p·m·c + q·m, C = p·c² + q·c + r; y = Ax² + Bx + C.
  Assumptions: "f(g(x)) puts g(x) wherever f has x."; "Work inside out: g first, then f."; "f(g(x))
  and g(f(x)) are usually different." Example: f(x) = x² − 3x, g(x) = 2x + 1 → (2x + 1)² − 3(2x + 1)
  = 4x² − 2x − 2; at x = 1: g(1) = 3, f(3) = 0 = 4 − 2 − 2. startWith ['p', 'q', 'r', 'm', 'c', 'x'].
- **~operations — BUILD:** f(x) = ax + b, g(x) = cx + d at a number. Picture `functionGraph` linear
  f with `other` linear g, at {x}. Values a, b, c, d, x, F, G, S, Dif, P (derived) = 10. Relations:
  F = ax + b, G = cx + d, S = F + G, Dif = F − G, P = F·G. Example: f(x) = 2x − 1, g(x) = x + 4,
  x = 3: F = 5, G = 7, (f + g)(3) = 12, (f − g)(3) = −2, (f·g)(3) = 35.
- **~inverse — BUILD:** f(x) = ax + b. Picture `functionGraph` linear {m: a, b}, `inverse: true`
  (y = x dashed), at {x, y} (demo `g.m11-inverse-functions-exp-log` for the mirror). Values a
  (nonzero), b, m = 1/a, n = −b/a (derived), x, y (derived). Relations: y = ax + b;
  f⁻¹(x) = mx + n. Assumptions: "Swap x and y, then solve for y."; "(x, y) on f is (y, x) on f⁻¹,
  a reflection over y = x." Example: f(x) = 3x − 6 → f⁻¹(x) = (x + 6)/3 = x/3 + 2; f(4) = 6 and
  f⁻¹(6) = 4.
- **~restrict-domain — BUILD (need 5):** f(x) = a(x − h)² + k on x ≥ h; picture `functionGraph`
  quadratic vertex, `inverse: true`, xMin h. Values a (nonzero), h, k, x (≥ h), y (derived).
  Relation: f⁻¹(y) = h + √((y − k)/a); limit (y − k)/a ≥ 0. Example: f(x) = 2(x − 1)² + 3: f(3) = 11;
  f⁻¹(11) = 1 + √(8/2) = 3.
- **Verdict:** 4 pages; the released item and all common types Solve.

### 7. m.11.radical-functions — Radical functions and equations

- **Standard:** A-REI.2, F-IF.7b.
- **Textbooks:** openstax-algebra-trig 11.5; openstax-intermediate-algebra 11.8; big-ideas-hs 11.5; envision-aga 11.5; hmh-into-hs 11.3; reveal-hs 11.6.
- **Tests ask:** no released items; common types:

| Question | Page | Mark |
| --- | --- | --- |
| (common) Solve √(2x + 5) = 7 | main | Solves |
| (common) Solve √(x + 7) = x + 1 and reject the extraneous root | ~extraneous | Solves |
| (common) Domain and range of y = 2√(x + 3) + 1 | ~graph | Solves |
| (common) Solve x^(3/2) = 27 | none | No (m.9.radicals covers rational exponents) |

- **Main — BUILD `m.11.radical-functions`:** equation `√({a}x + {b}) = {c}` (demo
  `g.m11-radical-functions-equation`); picture `functionGraph` root index 2 with `other` linear
  {m: 0, b: c}, crossing {x, y: c}. Values a (nonzero −10..10), b (−50..50), c (0..20), x (derived).
  Relation x = (c² − b)/a; limit c ≥ 0 ("a square root is never negative, so no x works").
  Assumptions: "Square both sides to undo the root."; "Check the answer in the first equation."
  Example: √(3x + 4) = 5 → 3x + 4 = 25 → x = 7; √25 = 5. startWith ['a', 'b', 'c'].
- **~extraneous — BUILD:** equation `√(x + {a}) = x + {b}`; picture `functionGraph` root {h: −a},
  `other` linear {m: 1, b}, crossing {x}. Values a, b, x1, x2 (derived candidates), x (the root
  kept). Relations: x² + (2b − 1)x + (b² − a) = 0; keep a candidate only if x + b ≥ 0. Example:
  √(x + 7) = x + 1 → x² + x − 6 = 0 → x = 2 or −3; x = −3 gives √4 = 2 but −3 + 1 = −2,
  so it is extraneous; x = 2.
- **~graph — BUILD:** y = a√(x − h) + k; picture `functionGraph` root index 2 (demo
  `g.m11-radical-functions-sqrt`), marks ['domain', 'range'], `parent: true`. Values a (nonzero), h,
  k, x (≥ h), y (derived). Example: a = 2, h = −3, k = 1, x = 6 → y = 2√9 + 1 = 7; domain x ≥ −3,
  range y ≥ 1. The use line points to the cube-root demo `g.m11-radical-functions-cube` as a
  later variant.
- **Verdict:** 3 pages; 3 of 4 common types.

### 8. m.11.logarithms — Logarithms and log properties

- **Standard:** F-LE.4, F-BF.5 (+), F-IF.7e.
- **Textbooks:** eureka-hs 11.3; im-hs 11.4; openstax-algebra-trig 11.6; openstax-intermediate-algebra 11.10; openstax-precalculus 12.4; big-ideas-hs 11.6; envision-aga 11.6; hmh-into-hs 11.4; larson-precalculus 12.3; reveal-hs 11.8.
- **Tests ask:** no released items; common types:

| Question | Page | Mark |
| --- | --- | --- |
| (common) Evaluate log₂ 32; write 3⁴ = 81 in log form | main | Solves |
| (common) Estimate log₃ 20 by change of base | ~change-of-base | Solves |
| (common) Expand or condense a log expression | ~properties | Solves |
| (common) log 3,000 without a calculator table | ~common-log | Solves |

- **Main — BUILD `m.11.logarithms`:** equation `log_{b}({x}) = {y}` beside `{b}^{y} = {x}` (demo
  `g.m11-logarithms-log-form`); picture `functionGraph` log {b}, at {x, y} (demo
  `g.m11-logarithms-log`). Values b (0.1..20, limit b ≠ 1), x (> 0), y (−10..10). Relation x = bʸ.
  Assumptions: "A log is an exponent: log_b(x) is the power of b that makes x."; "Only positive x
  has a log."; "The base b is positive and not 1." Example: log₂(32) = 5 because 2⁵ = 32.
  startWith ['b', 'x'].
- **~change-of-base — BUILD:** picture `functionGraph` log {b}, at {x, y}. Values b, x, L1 = log x,
  L2 = log b (derived), y (derived). Relation y = L1/L2. Example: log₃ 20 = log 20/log 3 =
  1.3010/0.4771 ≈ 2.727; check 3^2.727 ≈ 20.
- **~properties — BUILD (sort):** bins "Product rule", "Quotient rule", "Power rule", "Not a log
  rule". Cards: log₂(8x) = 3 + log₂ x (P); log(ab) = log a + log b (P); log₅(25/y) = 2 − log₅ y (Q);
  ln(x/3) = ln x − ln 3 (Q); log(x³) = 3 log x (Pow); log₂ √x = ½ log₂ x (Pow); log(x + y) =
  log x + log y (Not); (log x)² = 2 log x (Not); log x/log y = log x − log y (Not). Sentence: "A log
  turns multiplying into adding, dividing into subtracting and a power into multiplying; a sum
  inside a log does not split."
- **~common-log — BUILD:** picture `powerScale` (demo `g.m11-logarithms-ruler`, and
  `g.m11-logarithms-small` for negatives), log derived, `fixed: true`. Values N, a, n, L (derived).
  Relations: N = a × 10ⁿ, L = n + log a. Example: 3,000 = 3 × 10³ → log 3,000 = 3 + 0.4771 = 3.4771.
- **Verdict:** 4 pages; all common types.

### 9. m.11.exp-log-equations — Exponential and logarithmic equations, e and continuous growth

- **Standard:** F-LE.4, A-SSE.3c, A-CED.1, F-IF.8b.
- **Textbooks:** eureka-hs 11.3; im-hs 11.4; openstax-algebra-trig 11.6; openstax-intermediate-algebra 11.10; openstax-precalculus 12.4; big-ideas-hs 11.6; envision-aga 11.6; hmh-into-hs 11.4; larson-precalculus 12.3; reveal-hs 11.7, 11.8.
- **Tests ask:**

| Question | Page | Mark |
| --- | --- | --- |
| NAEP-1992-12M7-#6 (two powers with a common base, solve for x) | ~same-base | Solves (base 2, p = 3, q = 4, m = 12) |
| (common) Solve 5 × 2ˣ = 60 | main | Solves |
| (common) Years to reach $3,000 at 5% compounded continuously | ~continuous | Solves |
| (common) Solve log₃(2x − 1) = 4 | ~log-equation | Solves |

- **Main — BUILD `m.11.exp-log-equations`:** equation `{a} × {b}^x = {c}`; picture `functionGraph`
  exponential {a, b} with `other` linear {m: 0, b: c}, crossing {x, y: c} (demo
  `g.m11-exp-log-equations-crossing`). Values a (nonzero), b (limit b > 0, b ≠ 1), c, x (derived).
  Relation x = log(c/a)/log b; limit c/a > 0 ("bˣ is always positive"). Assumptions: "Divide by a
  first, then take the log of both sides."; "Any base works for the logs, if both sides use the
  same one." Example: 5 × 2ˣ = 60 → 2ˣ = 12 → x = log 12/log 2 = 1.0792/0.3010 ≈ 3.585.
  startWith ['a', 'b', 'c'].
- **~same-base — BUILD:** equation `({g}^{p})^{m} = ({g}^{q})^{x}` (H82). Values g (2..10), p, q
  (1..6), m (1..20), B1 = gᵖ, B2 = g^q (derived), x (derived). Relation x = m·p/q. Picture interim
  `termsChart` geometric {first: g, step: g, count: q, term: 'B2'} (the powers of g); need 10.
  Example: 4⁶ = 8ˣ → (2²)⁶ = (2³)ˣ → 12 = 3x → x = 4; 4⁶ = 8⁴ = 4,096.
- **~continuous — BUILD:** equation `{A} = {P}e^{{r}{t}}` (demo `g.m11-exp-log-equations-continuous`
  for both picture and equation). Values P ($, 1..1,000,000), r (rate per year, 0..1), t (years,
  0..100), A (derived). Relation A = P·e^(rt); solving t = ln(A/P)/r. Assumptions: "e ≈ 2.71828 is
  what compounding more and more often approaches." Example: P = $2,000, r = 0.05, t = 10 → A =
  2,000·e^0.5 ≈ $3,297.44; reaching $3,000 takes ln 1.5/0.05 ≈ 8.11 years.
- **~log-equation — BUILD:** equation `log_{b}({a}x + {c}) = {y}`; picture `functionGraph` log with
  `other` linear {m: 0, b: y}, crossing. Values b, a (nonzero), c, y, x (derived). Relation x =
  (bʸ − c)/a. Example: log₃(2x − 1) = 4 → 2x − 1 = 81 → x = 41.
- **Verdict:** 4 pages; the released item and all common types Solve.

### 10. m.11.rational-functions — Rational expressions, equations and functions

- **Standard:** A-APR.6, A-APR.7 (+), A-REI.2, F-IF.7d (+), A-CED.2 (variation).
- **Textbooks:** eureka-hs 11.1, 12.3; im-hs 11.2; openstax-algebra-trig 9.1, 9.2, 11.5, 12.11; openstax-elementary-algebra 9.8; openstax-intermediate-algebra 11.7; openstax-precalculus 12.3, 12.9; big-ideas-hs 11.7; envision-aga 11.4; hmh-into-hs 11.5; larson-precalculus 12.2; reveal-hs 11.9.
- **Tests ask:**

| Question | Page | Mark |
| --- | --- | --- |
| NAEP-2009-12M2-#11 (difference of two fractions with linear denominators) | ~add-subtract | Solves (a = 1, p = 2, o = −, c = 2, q = 1) |
| (common) Asymptotes, zero and hole of a rational function | main | Solves |
| (common) Solve a rational equation, reject the extraneous root | ~solve | Solves |
| (common) y varies inversely with x | ~variation | Solves |
| (common) Multiply or divide rational expressions | none | No (Priority 13) |

- **Main — BUILD `m.11.rational-functions`:** y = a(x − z)(x − c)/((x − p)(x − c)). Picture
  `functionGraph` rational {a, zeros: [z, c], poles: [p, c]} (demo `g.m11-rational-functions-hole`),
  marks ['zeros', 'asymptotes'], at {x, y}. Values a (nonzero), z, p, c (−10..10), H (hole's y,
  derived), x, y (derived) = 7. Relations: y = a(x − z)/(x − p) (x ≠ c); H = a(c − z)/(c − p); limits
  z ≠ p, c ≠ p. Assumptions: "A factor that cancels leaves a hole, not an asymptote."; "A factor
  left in the denominator gives a vertical asymptote."; "Equal degrees top and bottom: the
  horizontal asymptote is y = a." Example: a = 1, z = 1, p = 3, c = −2 → hole (−2, 3/5), VA x = 3,
  HA y = 1, zero x = 1; at x = 5, y = 4/2 = 2. startWith ['a', 'z', 'p', 'c', 'x'].
- **~add-subtract — BUILD:** equation `{a}/{x + {p}} {o:op} {c}/{x + {q}} = {{A}x + {B}}/{x² + {S}x + {P}}`;
  picture `functionGraph` rational {a: A, zeros: [Z], poles: [−p, −q]}. Values a, p, c, q, o, A, B,
  S, P (derived) = 9 (Z = −B/A inside the picture spec as derived value makes 10). Relations:
  A = a + (3 − 2o)c, B = aq + (3 − 2o)cp, S = p + q, P = pq; limit p ≠ q. Example: 3/(x − 1) +
  2/(x + 4) = (3(x + 4) + 2(x − 1))/((x − 1)(x + 4)) = (5x + 10)/(x² + 3x − 4).
- **~solve — BUILD:** equation `x/{x − {p}} = {a}/{x − {p}} + {b}/x`; picture `functionGraph`
  rational {zeros: [x1, x2], poles: [0, p]} (left side minus right side): the extraneous root
  shows as a hole. Values p, a, b, x1, x2 (derived candidates), x (derived kept root). Relations:
  x² − (a + b)x + bp = 0; reject a candidate equal to 0 or p. Example: p = 2, a = 2, b = 3:
  x² − 5x + 6 = 0 → x = 2 or 3; x = 2 makes a denominator 0 (extraneous); x = 3: 3/1 = 2/1 + 3/3.
- **~variation — BUILD:** y = k/x; picture `functionGraph` rational {a: k, poles: [0]}, at (demo
  `g.m11-rational-functions-shift`). Values x1, y1, k (derived), x2, y2 (derived). Relations k = x1·y1,
  y2 = k/x2. Example: 6 workers take 10 days → k = 60; 4 workers take 60/4 = 15 days.
- **Verdict:** 4 pages; the released item and 3 of 4 common types.

### 11. m.11.series — Series and sigma notation

- **Standard:** A-SSE.4, F-BF.2.
- **Textbooks:** eureka-hs 11.3; im-hs 11.1, 11.2; openstax-algebra-trig 12.13; openstax-intermediate-algebra 11.12; openstax-precalculus 12.11; big-ideas-hs 11.11; envision-aga 11.1, 11.6; hmh-into-hs 11.6; larson-precalculus 12.9; reveal-hs 11.7.
- **Tests ask:**

| Question | Page | Mark |
| --- | --- | --- |
| NAEP-2013-12M99-#10 (induction proof of a geometric sum) | main, ~infinite | Partly: the pages check Sₙ = 1 − (1/2)ⁿ numerically; proof by induction is not in the taxonomy |
| (common) Sum of the first 10 terms of 5, 9, 13, … | ~arithmetic | Solves |
| (common) Evaluate Σ from k = 1 to 8 of (3k − 1) | ~sigma | Solves (rows now; need 8 for Σ) |
| (common) Sum of a finite geometric series | main | Solves |
| (common) Sum of 12 + 3 + 3/4 + … | ~infinite | Solves |

- **Main — BUILD `m.11.series`:** finite geometric. Picture `termsChart` geometric {first: a1,
  step: r, count: n, sums: true, sum: 'S', term: 'an'} (demo `g.m11-series-geometric-infinite`
  without limit). Equation `{S} = {a1} × {1 − {r}^{n}}/{1 − {r}}`. Values a1 (−100..100), r
  (−5..5, limit r ≠ 1), n (1..30), an, S (derived). Relations an = a1·rⁿ⁻¹; S = a1(1 − rⁿ)/(1 − r).
  Assumptions: "Each term is the one before times r."; "Multiply S by r and subtract: all but
  two terms cancel."; "For r = 1, S is just n × a1." Example: a1 = 3, r = 2, n = 6 → a6 = 96,
  S = 3(1 − 64)/(1 − 2) = 189 = 3 + 6 + 12 + 24 + 48 + 96. startWith ['a1', 'r', 'n'].
- **~arithmetic — BUILD:** picture `termsChart` arithmetic, sums (demo `g.m11-series-arithmetic-sum`).
  Values a1, d, n, an, S (derived). Relations an = a1 + (n − 1)d, S = n(a1 + an)/2. Example: a1 = 5,
  d = 4, n = 10 → a10 = 41, S = 10 × 46/2 = 230.
- **~sigma — BUILD (need 8 for the Σ template):** Σₖ₌₁ⁿ (ck + e). Picture `termsChart` arithmetic
  {first: a1, step: c, count: n, sums: true}. Values c, e, n, a1, an, S (derived). Relations a1 = c + e,
  an = cn + e, S = n(a1 + an)/2. Example: Σₖ₌₁⁸ (3k − 1): a1 = 2, a8 = 23, S = 8 × 25/2 = 100.
- **~infinite — BUILD:** picture `termsChart` geometric, sums, `limit: 'S'` (demos
  `g.m11-series-geometric-infinite`, `g.m11-series-alternating`). Values a1, r (limit |r| < 1, with
  the reason "the sums grow without end"), S (derived). Relation S = a1/(1 − r). Example: a1 = 12,
  r = 1/4 → S = 12/(3/4) = 16.
- **Verdict:** 4 pages; all common types, the released proof Partly.

### 12. m.11.unit-circle — The unit circle and radian measure

- **Standard:** F-TF.1, F-TF.2, F-TF.3 (+).
- **Textbooks:** eureka-hs 11.2, 12.4; im-hs 11.6; openstax-algebra-trig 11.7, 11.8; openstax-precalculus 12.5, 12.6; big-ideas-hs 11.10; envision-aga 11.7; hmh-into-hs 11.7; larson-precalculus 12.4; reveal-hs 11.11.
- **Tests ask:** no released items; common types:

| Question | Page | Mark |
| --- | --- | --- |
| (common) Exact sin and cos of 5π/6 | main | Solves |
| (common) Convert 225° to radians, 7π/6 to degrees | ~convert | Solves (need 2 for gcd) |
| (common) Coterminal and reference angle of −495° | ~coterminal | Solves (need 2) |
| (common) sin θ when (−3, 4) is on the terminal side | ~point-on-side | Solves (need 6 for the picture) |

- **Main — BUILD `m.11.unit-circle`:** picture `unitCircle` measure 'pi', angle k, cos x, sin y, tan
  t (demo `g.m11-unit-circle-radians`). Values k (θ ÷ π, −4..4 in twelfths and sixths), d (degrees,
  derived), x, y, t (derived). Relations d = 180k; x = cos θ, y = sin θ, t = y/x (limit x ≠ 0 for t).
  Assumptions: "The point at angle θ is (cos θ, sin θ), because the radius is 1."; "The reference
  angle and the quadrant give the value and its sign."; "One turn is 2π radians, 360°." Example:
  θ = 5π/6 = 150°: reference π/6, quadrant II → (−√3/2, 1/2), tan = −√3/3 ≈ −0.577. startWith ['k'].
- **~convert — BUILD (need 2):** equation `{d}° = {p}/{q}π`; picture `circle` extent 1, views
  ['radian', 'sector'], sector {angle: d, unit: 'degrees'} (demo `g.m11-unit-circle-radian`).
  Values d (−720..720), g = gcd(d, 180), p, q (derived). Relations p = d/g, q = 180/g. Assumptions:
  "One radian is the angle whose arc equals the radius."; "180° = π radians." Example: 225° =
  225/180 π = 5π/4; 7π/6 = 7 × 30° = 210°.
- **~coterminal — BUILD (need 2):** picture `unitCircle` angle d, degrees (demos
  `g.m11-unit-circle-negative`, `g.m11-unit-circle-past-a-turn`). Values d (−1,080..1,080), c =
  d − 360⌊d/360⌋, Q (quadrant), R (reference angle), all derived. Example: −495° + 2 × 360° = 225°,
  quadrant III, reference 45°, cos = sin = −√2/2.
- **~point-on-side — BUILD (need 6):** values x, y (−20..20, not both 0), r, s, c, t (derived).
  Relations r = √(x² + y²), s = y/r, c = x/r, t = y/x. Example: (−3, 4): r = 5, sin θ = 4/5,
  cos θ = −3/5, tan θ = −4/3.
- **Verdict:** 4 pages; all common types once need 2 lands.

### 13. m.11.trig-graphs — Graphs of sine, cosine and tangent

- **Standard:** F-IF.7e, F-TF.5, F-BF.3.
- **Textbooks:** eureka-hs 11.2; im-hs 11.6; openstax-algebra-trig 11.8; openstax-precalculus 12.6, 12.7; big-ideas-hs 11.10; envision-aga 11.7; hmh-into-hs 11.7; larson-precalculus 12.4; reveal-hs 11.11.
- **Tests ask:**

| Question | Page | Mark |
| --- | --- | --- |
| NAEP-2005-12M4-#17 (x-coordinate of a marked peak of sin x) | main | Partly: the trace gives y from x and marks the extrema; x in multiples of π waits on need 1 |
| NAEP-2009-12M2-#13 (function with a given amplitude and period) | ~from-features | Solves (A = 2, P = 2π/3 → b = 3) |
| (common) Amplitude, period, midline, phase shift of a sinusoid | main | Solves |
| (common) Period and asymptotes of y = 2tan(x/2) | ~tangent | Solves |
| (common) Model a Ferris wheel's height | ~model | Solves |

- **Main — BUILD `m.11.trig-graphs`:** y = a sin(b(x − h)) + k. Picture `functionGraph` sin {a, b,
  h, k}, marks ['amplitude', 'period', 'midline', 'extrema'], at {x, y}, shows {amplitude: 'A',
  period: 'P'} (demo `g.m11-trig-graphs-sine`). Values a (nonzero, −10..10), b (0.25..6), h, k,
  A, P (derived), x, y (derived) = 8. Relations A = |a|, P = 2π/b, y = a sin(b(x − h)) + k.
  Assumptions: "The midline is y = k; the graph rises and falls A above and below it."; "b fits b
  cycles into every 2π."; "h slides the start of the cycle to x = h." Example: y = 3 sin(2(x − π/4))
  + 1: A = 3, P = π, midline y = 1; at x = π/2, y = 3 sin(π/2) + 1 = 4 (a maximum). startWith
  ['a', 'b', 'h', 'k', 'x'].
- **~from-features — BUILD:** picture `functionGraph` cos {a: A, b, k} (demo
  `g.m11-trig-graphs-cosine`), marks as main. Values A (0..20), P (period, a multiple of π), k, b
  (derived). Relation b = 2π/P. Example: amplitude 4, period π/2, midline y = −1 → b = 4, y =
  4 cos(4x) − 1.
- **~tangent — BUILD:** picture `functionGraph` tan {a, b} (demo `g.m11-trig-graphs-tangent`), marks
  ['asymptotes', 'period']. Values a, b, P = π/b, V = π/(2b) (first asymptote right of 0), x, y.
  Example: y = 2 tan(x/2): P = 2π, asymptotes x = π + 2nπ; at x = π/2, y = 2 tan(π/4) = 2.
- **~model — BUILD:** h(t) = k − A cos(2πt/T). Picture `functionGraph` cos {a: −A, b: B, k}, axes
  {x: 'Time (min)', y: 'Height (m)'}. Values top, bottom (m), T (min), A, k, B (derived), t, h (derived)
  = 8. Relations A = (top − bottom)/2, k = (top + bottom)/2, B = 2π/T. Example: top 42 m, bottom
  2 m, one turn in 8 min → A = 20, k = 22; h(2) = 22 − 20 cos(π/2) = 22 m; h(4) = 42 m.
- **Verdict:** 4 pages; 1 released item Solves, 1 is Partly until need 1; the common types Solve.

### 14. m.11.pythagorean-identities — Pythagorean trigonometric identities

- **Standard:** F-TF.8.
- **Textbooks:** eureka-hs 11.2; im-hs 11.6; openstax-algebra-trig 11.7, 12.9; openstax-precalculus 12.5, 12.7; big-ideas-hs 11.10; envision-aga 11.8; hmh-into-hs 11.7; larson-precalculus 12.5; reveal-hs 11.12.
- **Tests ask:**

| Question | Page | Mark |
| --- | --- | --- |
| NAEP-1996-12M10-#8 (sin² + cos² of the same angle 3x) | ~simplify (card), main | Solves |
| (common) sin θ = 3/5 in quadrant II: find cos θ, tan θ | main | Solves (need 2 for the sign) |
| (common) tan θ = −12/5 in quadrant IV: find sec θ, cos θ | ~tangent | Solves |
| (common) Simplify (1 − cos θ)(1 + cos θ) | ~simplify | Solves |

- **Main — BUILD `m.11.pythagorean-identities`:** equation `({s})^2 + ({c})^2 = 1` (demo
  `g.m11-pythagorean-identities`, picture `unitCircle` angle θ, cos c, sin s). Values s (−1..1),
  Q (`allowed` [1, 2, 3, 4]), c, t, θ (derived, degrees). Relations c = σ√(1 − s²) with σ = +1 in
  quadrants I and IV and −1 in II and III (need 2); t = s/c. Limit: the sign of s matches Q ("sine
  is positive in quadrants I and II"). Assumptions: "The point (cos θ, sin θ) is on the circle
  x² + y² = 1."; "The square root gives the size; the quadrant gives the sign."; "It holds for
  every angle, 3x as well as θ." Example: s = 3/5, Q = 2 → c = −√(1 − 9/25) = −4/5, t = −3/4,
  θ ≈ 143.13°. startWith ['s', 'Q'].
- **~tangent — BUILD:** 1 + tan²θ = sec²θ. Picture `unitCircle` with tan. Values t, Q, S (sec), c,
  s (derived). Relations S = σ√(1 + t²), c = 1/S, s = t·c. Example: t = −12/5, Q = 4 → S = √(169/25) =
  13/5, c = 5/13, s = −12/13.
- **~simplify — BUILD (sort):** bins "1", "sin²θ", "cos²θ", "sec²θ". Cards: sin²(5x) + cos²(5x)
  (1); sec²θ − tan²θ (1); cos²θ(1 + tan²θ) (1); 1 − cos²θ (sin²); (1 − cos θ)(1 + cos θ) (sin²);
  tan²θ cos²θ (sin²); 1 − sin²θ (cos²); (1 + sin θ)(1 − sin θ) (cos²); 1 + tan²θ (sec²); 1/cos²θ
  (sec²). Sentence: "Each card is x² + y² = 1 on the unit circle, rearranged or divided through
  by cos²θ."
- **Verdict:** 3 pages; the released item and all common types.

### 15. m.11.probability-distributions — Binomial distributions and expected value

- **Standard:** S-MD.1 (+), S-MD.2 (+), S-MD.3 (+), S-MD.4 (+), S-MD.5 (+), S-MD.6 (+).
- **Textbooks:** eureka-hs 12.5; openstax-statistics 12.4, 12.5; big-ideas-hs 10.13, 11.8; envision-aga 10.12, 11.12; hmh-into-hs 11.9; larson-farber 12.4.
- **Tests ask:**

| Question | Page | Mark |
| --- | --- | --- |
| NAEP-2005-12M3-#7 (which spinner matches 1,000 spins) | ~expected-value | Partly: compares shares to probabilities, no observed-versus-expected table |
| NAEP-2005-12M4-#4 (expected no-shows among scheduled riders) | main (E = np) | Solves (n = 13, p = 0.4) |
| NAEP-2005-12M4-#5 (which day is closest to the expected no-shows) | main | Partly: gives E = 5.2; comparing a table of days is done by the student |
| (common) P(exactly k successes) | main | Solves |
| (common) Expected value of a game | ~expected-value | Solves |
| (common) P(at least k) | ~at-least | Solves (need 7) |

- **Main — BUILD `m.11.probability-distributions`:** picture `histogram` binomial {n, p, mean: 'E',
  sd: 'S'}, lit k, axis 'Successes (k)' (demo `g.m11-probability-distributions-binomial`). Values n
  (1..40), p (0..1), k (0..n), C, P, E, S (derived) = 7. Relations C = C(n, k), P = C·pᵏ(1 − p)ⁿ⁻ᵏ,
  E = np, S = √(np(1 − p)). Assumptions: "n trials, each a success or not."; "The same chance p every
  time, and the trials are independent."; "E is the long-run average count, not a promise." Example:
  n = 10, p = 0.3, k = 2: C = 45, P = 45 × 0.09 × 0.7⁸ ≈ 0.2335; E = 3, S = √2.1 ≈ 1.449.
  startWith ['n', 'p', 'k'].
- **~expected-value — BUILD:** picture `histogram` probability {values: [x1..x4], probs: [p1..p4],
  mean: 'E'} (demo `g.m11-probability-distributions-expected`). Values x1..x4, p1..p4, E (derived) = 9;
  limit p1 + … + p4 = 1 (the bars fade with the reason). Relation E = Σ xᵢpᵢ. Example (spinner game
  points): −2 at 0.5, 0 at 0.3, 5 at 0.15, 20 at 0.05 → E = −1 + 0 + 0.75 + 1 = 0.75 point per spin.
- **~at-least — BUILD (need 7):** values n, p, k, P (derived) = P(X ≥ k). Picture `histogram` binomial
  lighting k..n. Example: n = 5, p = 0.5, P(X ≥ 4) = (5 + 1)/32 = 0.1875.
- **Verdict:** 3 pages; 1 released item Solves, 2 Partly; the common types Solve.

### 16. m.11.study-design — Sampling methods and study design

- **Standard:** S-IC.1, S-IC.3, S-IC.6.
- **Textbooks:** openstax-statistics 12.1, 12.4; big-ideas-hs 11.9; envision-aga 11.11; larson-farber 12.1; reveal-hs 11.10.
- **Tests ask:** no released items; common types:

| Question | Page | Mark |
| --- | --- | --- |
| (common) Survey, observational study or experiment? | ~study-type | Solves |
| (common) Which sampling method is this? | ~sampling-methods | Solves |
| (common) Can this study show cause and effect? | main | Solves |
| (common) Name the bias in a survey | ~bias | Solves |

- **Main — BUILD `m.11.study-design` (explore):** figure `studyDesign` (demo `g.m11-study-design`).
  Scenes: (1) "Survey": {design: 'survey', method: 'simple random', lit: 'sample'}, "12 of the 48
  people are picked at random and asked a question; their answers estimate the whole group's."
  (2) "Observational study": {design: 'observational', lit: 'population'}, "Researchers record
  who already sleeps 8 hours and compare grades; nobody is assigned, so a link does not show a
  cause." (3) "Experiment": {design: 'experiment', groups: ['New schedule', 'Usual schedule'], lit:
  'groups'}, "Chance assigns each volunteer to a group, so the groups differ only in the treatment,
  and a difference in results can be caused by it." (4) "Control and placebo": {design:
  'experiment', groups: ['Vitamin', 'Placebo'], lit: 'groups'}, "The placebo group takes a look-alike
  pill, so believing in the pill cannot explain a difference."
- **~sampling-methods — BUILD (sort):** bins with icons "Simple random", "Stratified", "Cluster",
  "Systematic", "Convenience" ({kind: 'icon', icon: 'simple random sample'} and the other four; demo
  `g.m11-study-design-sampling`). Cards: "Draw 50 student ID numbers at random" (SR); "Number every
  apartment and let a random generator pick 20" (SR); "Pick 20 students at random from each grade"
  (St); "Split the team into starters and bench and pick at random from each" (St); "Choose 5
  homerooms at random and ask everyone in them" (Cl); "Pick 3 city blocks at random and visit every
  home" (Cl); "Take every 10th name after a random start" (Sy); "Test every 4th battery off the line"
  (Sy); "Ask the first 30 people through the door" (Co); "Ask the friends at your lunch table" (Co).
  Sentence: "Random picks give every member a known chance; strata make sure every group is in,
  clusters save travel, and convenience is easy but usually biased."
- **~study-type — BUILD (sort):** bins "Survey", "Observational study", "Experiment". Cards: "Ask 200
  randomly chosen voters which park plan they prefer" (Su); "Ask a random sample of students how many
  hours they study" (Su); "Mail a recycling questionnaire to randomly chosen homes" (Su); "Compare
  resting heart rates of people who already run with those who don't" (O); "Read hospital records of
  patients who chose surgery or medicine" (O); "Follow teens for 5 years, recording screen time and
  grades" (O); "Randomly assign plants to fertilizer or none and measure height" (E); "Flip a coin to
  give each class a new warm-up or the usual one" (E); "Randomly assign volunteers to a sleep app or
  no app and compare sleep" (E). Sentence: "Only an experiment assigns the treatment, so only an
  experiment can show cause and effect."
- **~bias — BUILD (sort):** bins "Undercoverage", "Nonresponse", "Voluntary response", "Response
  bias". Cards: "A phone survey that calls only landlines" (U); "A school survey that leaves out
  students who are absent that week" (U); "Half the chosen homes never return the form" (N); "Most
  people picked for a long interview hang up" (N); "A website asks readers to vote in a poll" (V);
  "A radio show asks listeners to call in their opinion" (V); "Asking 'Don't you agree the park is
  unsafe?'" (R); "Asking students in front of their teacher whether they cheat" (R). Sentence: "Bias
  comes from who is reached, who answers, who chooses to answer, and how the question is asked."
- **Verdict:** 4 layout pages; all common types.

### 17. m.11.normal-distribution — Normal distributions, z-scores and margin of error

- **Standard:** S-ID.4, S-IC.4, S-IC.1.
- **Textbooks:** eureka-hs 11.4; im-hs 9.1, 11.7; openstax-statistics 12.2, 12.6, 12.7, 12.8; big-ideas-hs 11.9; envision-aga 11.11; hmh-into-hs 11.9; larson-farber 12.2, 12.5, 12.6; larson-precalculus 12.13; reveal-hs 11.10.
- **Tests ask:**

| Question | Page | Mark |
| --- | --- | --- |
| NAEP-2005-12M12-#16 (expected count of clocks beyond 1 minute, sample of 1,500) | ~outside | Solves (d = 1, σ = 0.5, N = 1,500 → 0.0455 × 1,500 ≈ 68) |
| (common) z-score and percent below a value | main | Solves |
| (common) Percent between two values | ~between | Solves |
| (common) 68–95–99.7 rule | ~empirical | Solves |
| (common) Score at the 90th percentile | ~percentile | Solves |
| (common) Margin of error of a sample proportion | ~margin | Solves |

- **Main — BUILD `m.11.normal-distribution`:** equation `{z} = {{x} − {m}}/{s}` (demo
  `g.m11-normal-distribution-z`); picture `normalCurve` {mean: m, sd: s, shade: {to: x, area: 'P'},
  mark: {x, z}} (demo `g.m11-normal-distribution-left`). Values m, s (> 0), x (with a unit), z, P
  (derived). Relations z = (x − μ)/σ, P = Φ(z). Assumptions: "The data are roughly bell-shaped and
  symmetric."; "z counts standard deviations from the mean."; "The area left of x is the share
  below x." Example: μ = 170 cm, σ = 8 cm, x = 182 cm → z = 1.5, P = Φ(1.5) ≈ 0.9332.
  startWith ['m', 's', 'x'].
- **~between — BUILD:** picture `normalCurve` shade {from: a, to: b, area: 'P'} (demo
  `g.m11-normal-distribution-between`). Values m, s, a, b, za, zb, P (derived), N (1..10,000), E
  (derived) = 9. Relations P = Φ(zb) − Φ(za), E = N·P. Example: μ = 50, σ = 5, between 45 and 60:
  z = −1 and 2, P = 0.9772 − 0.1587 = 0.8185; of 400, about 327.
- **~outside — BUILD:** picture `normalCurve` shade {from: lo, to: hi, outside: true, area: 'P'}
  (demo `g.m11-normal-distribution-tail`). Values m, s, d (distance from the mean), z = d/s, P =
  2(1 − Φ(z)), N (1..100,000), E = N·P (derived). Example: μ = 0 g, σ = 2 g, more than 3 g off: z = 1.5,
  P = 2(1 − 0.9332) = 0.1336; of 500 packages, about 67.
- **~empirical — BUILD:** picture `normalCurve` bands (demo `g.m11-normal-distribution-bands`). Values
  m, s, k (`allowed` [1, 2, 3]), lo, hi (derived), pct (derived: 68, 95, 99.7). Example: μ = 100,
  σ = 15, k = 2 → 70 to 130 holds about 95%.
- **~percentile — BUILD:** picture `normalCurve` shade {to: x, area: 'P'}. Values m, s, P (0.001..0.999),
  z = invNorm(P), x = μ + zσ (derived). Example: μ = 500, σ = 100, 90th percentile → z ≈ 1.2816,
  x ≈ 628.
- **~margin — BUILD:** picture `normalCurve` interval {center: 'ph', margin: 'E', level: 95}, sample
  {n} (demo `g.m12-confidence-intervals-mean`). Rows, not an equation: E = 2√(p̂(1 − p̂)/n). Values
  ph (0..1), n (10..10,000), E, lo, hi (derived). Example: p̂ = 0.60, n = 400 → √(0.24/400) ≈ 0.0245,
  E ≈ 0.049: 55.1% to 64.9%. Assumption: "The sample is random, and about 2 standard errors cover
  95% of samples."
- **Verdict:** 6 pages; the released item and all common types Solve.

## Engine and picture needs

1. **Radians in step text and π-multiple values.** A value shown as kπ (5π/2), and the harness
   reading sin(π/2), cos(3π/4) in radians beside the degree phrases it has now. Waiting:
   m.11.trig-graphs (main, ~from-features, ~tangent, ~model), m.11.unit-circle main (step text).
   NAEP-2005-12M4-#17 needs it.
2. **floor, mod and gcd in relations, with step phrases.** Waiting: m.11.complex-numbers~powers-of-i,
   m.11.unit-circle~convert, ~coterminal, and the quadrant sign in m.11.pythagorean-identities (main,
   ~tangent).
3. **Synthetic division grid in `written.ts`.** The coefficient row, the multiply-and-add row and
   the remainder boxed, from Grade 11. Waiting: m.11.polynomial-functions~divide,
   m.11.polynomial-equations main.
4. **functionGraph horizontal factor b** on absolute, root, exponential and log families
   (y = f(b(x − h))). Waiting: m.11.function-transformations~horizontal.
5. **functionGraph `xMin` as a value id** (restricted domain that follows h), with the inverse
   drawn only for the kept half. Waiting: m.11.inverse-functions~restrict-domain.
6. **unitCircle point off the circle.** `through: { x, y }` draws (x, y), r and the angle, and the
   unit point is the same point scaled by 1/r. Waiting: m.11.unit-circle~point-on-side.
7. **Binomial cumulative.** A `binomcdf` relation and step phrase ("P(X ≥ 4) = P(4) + P(5)"),
   and histogram `lit` as a range {from, to}. Waiting: m.11.probability-distributions~at-least.
8. **Σ with limits** in the equationInput templates and `toLatex` (`Σ_{k=1}^{{n}} ({c}k + {e})`).
   Waiting: m.11.series~sigma (rows until then).
9. **Page limits with student reasons, checked by the harness at edges:** D < 0, P(r) = 0,
   c ≥ 0 under a root, b ≠ 1, r ≠ 1, |r| < 1, Σp = 1, sign of s matching the quadrant. Confirm
   the existing mechanism covers relations between values, not only single ranges. Waiting: complex
   ~quadratic, polynomial-equations main, radical main, logarithms main, series main and
   ~infinite, pythagorean main.
10. **termsChart: light a second term** (B1 beside B2), or a small "powers of g" strip. Waiting:
    m.11.exp-log-equations~same-base (interim termsChart).
11. **Exact fraction display for derived complex parts** (11/5 − 2/5 i), not 2.2 − 0.4i. Waiting:
    m.11.complex-numbers~divide.
12. **Harness phrases** for i² = −1 lines, "keep" or "reject" for extraneous roots, and
    log_b(x) with a subscript base beside log₁₀. Waiting: complex pages, radical ~extraneous,
    rational ~solve, logarithms and exp-log pages.

## Not in the taxonomy

- Proof by mathematical induction (NAEP-2013-12M99-#10): no skill at any grade; closest is
  m.11.series. Propose `m.12.induction` or a note on m.11.series.
- Simulation-based inference for a difference of means (IM Algebra 2 unit 7, S-IC.5): belongs
  with m.12.hypothesis-testing. Confirm that skill covers randomization tests.
- Counting patterns up to rotation (NAEP-2005-12M4-#18): symmetry counting, beyond m.10.probability-rules.
- Question data: `[data] research/questions: NAEP-1990-12M9-#7 → m.10.probability-rules`;
  `NAEP-1996-12M13-#6 → m.10.probability-rules`; `NAEP-2005-12M4-#18 → m.10.probability-rules`
  (none is about the binomial theorem).
- Linear programming and 3-variable systems (reveal-hs Algebra 2 unit 2) have no m.11 skill; they
  map to m.9.inequality-systems and m.12.matrices.
- Polynomial identities (sum and difference of cubes, A-APR.4) have no skill; they fit under
  m.11.polynomial-equations (Priority 15).

## Curriculum coverage (units covered only Partly)

| Unit | Covered by | Gap → proposed page |
| --- | --- | --- |
| reveal-hs 11.9 "Multiplying and dividing rational expressions" | ~add-subtract only | `m.11.rational-functions~multiply-divide` |
| reveal-hs 11.4 "Dividing polynomials" (long division) | ~divide by x − r only | `m.11.polynomial-functions~long-division` (quadratic divisor) |
| reveal-hs 11.5 "Proving polynomial identities" | none | `m.11.polynomial-equations~sum-of-cubes` |
| reveal-hs 11.6 "nth roots and rational exponents" | m.9.radicals | `m.11.radical-functions~rational-exponent` (needs a power family in functionGraph) |
| openstax-precalculus 12.3 slant asymptotes | none | later: demo `g.m11-rational-functions-slant` as `~slant` |

## Priority

1. Calculators with drawn pictures and no needs: normal-distribution (6), probability-distributions
   main and ~expected-value, binomial-theorem (3), logarithms (main, ~change-of-base, ~common-log),
   exp-log-equations (main, ~continuous, ~log-equation), series (main, ~arithmetic, ~infinite).
2. Layout pages: study-design (4), the four sorts.
3. complex-numbers (main, ~add-subtract, ~quadratic), inverse-functions (main, ~operations, ~inverse),
   radical-functions (3), rational-functions (4), function-transformations (main, ~point).
4. Need 3 (synthetic division) → polynomial-functions~divide, polynomial-equations main; then
   polynomial-functions main, ~complex-pair, ~quadratic-form.
5. Need 1 (radians) → trig-graphs (4) and the unit-circle main. Need 2 (floor, mod, gcd) →
   ~convert, ~coterminal, ~powers-of-i, pythagorean-identities main and ~tangent.
6. Needs 4–8, 10, 11 → the waiting pages. Then the curriculum-gap pages (13 multiply-divide,
   14 long-division, 15 sum-of-cubes).

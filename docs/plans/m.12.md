# Direction plan: math grade 12 (12 skills, 50 pages)

Examples are original and worked by hand; nothing is taken from `research/`. Released questions
exist for two skills only (3 items), so each skill also lists the common precalculus and AP-style
items (written here in our own words) and whether its pages solve them.

## Decisions

- **Letters and notation:** standard Grade 9–12 notation (letters, subscripts, ⟨a, b⟩, |v|,
  θ, sin⁻¹, Σ, x̄, p̂, H₀, Hₐ, α, χ²). Sentences are at most 35 words; a page holds at most 10
  values. Trig step text is in degrees (the harness reads sin, cos, tan and their inverses in
  degrees); pages that need radians use the picture's `show: 'radians'` and a derived radian
  value. Statistics step text uses Φ(z), invNorm(p) and χ²cdf(X, ∞, df) (harness/phrasesHsb.ts).
- **Equation inputs:** the templates from `docs/EQUATION_INPUTS.md` (Grades 9–12) where a page
  is one equation; statistics pages, graph pages and pages with several steps stay rows, as that
  file says. The confidence-interval page is the one statistics page with a template.
- **z, not t (for now):** the mean pages use σ known or large samples with the normal curve. The
  t distribution is engine need 1; the t pages are added when it lands.
- **Layout pages (3):** `m.12.conics~identify` (sort), `m.12.conics~cone` (explore,
  `doubleCone`), `m.12.hypothesis-testing~errors` (sort). Everything else is a calculator: each
  lesson is a quantity relationship.
- **Pilots:** none exist for m.12 (no `m.12.` page in `pilots.ts` or any grade file); every page
  is BUILD in a new `src/data/modules/math/12.ts`. Pages with a demo start from it with
  `node scripts/promote-demo.mjs`.
- **Refresh:** each main page's refresh is the brief's prerequisite. The two released circle
  items are solved by `m.10.circle-equations` (the conics refresh), not a new Grade 12 page.

### 1. m.12.inverse-trig — Inverse trigonometric functions

- **Standard:** F-TF.6 (+), F-TF.7 (+); AP Precalculus 3.9.
- **Textbooks:** OpenStax Algebra and Trigonometry unit 8 (Grade 11 list, 8.3), OpenStax
  Precalculus unit 6 (6.3), Larson Precalculus unit 4 (4.7), Reveal 11.11; Eureka Precalculus
  module 4 topic C (lessons 11–14, modeling with inverse trig).
- **Tests ask:** no released questions. Common items:

  | Item (our words)                            | Page                                       | Mark   |
  | ------------------------------------------- | ------------------------------------------ | ------ |
  | Exact value of sin⁻¹(√2/2)                  | main                                       | Solves |
  | Why sin⁻¹(1.5) has no value                 | main (rejected: "x is between −1 and 1")   | Solves |
  | cos⁻¹(−1/2) in degrees and radians          | ~arccos                                    | Solves |
  | Angle of a ramp that rises 1 m in 8 m       | ~arctan                                    | Solves |
  | Exact value of cos(sin⁻¹(3/5))              | ~compose                                   | Solves |
  | Solve sin θ = 0.4 for every θ in [0°, 360°) | m.12.trig-formulas-equations~sine-equation | Solves |

- **Main — BUILD `m.12.inverse-trig`:** picture `functionGraph` arcsin (demo
  `g.m12-inverse-trig-arcsin`: family 'arcsin', `at: { x: 'x', y: 'A' }`, marks
  ['domain', 'range']). Values: x (the sine, −1 to 1), A (angle, °, −90 to 90), t (the same angle
  in radians, derived). Relations: A = sin⁻¹(x); t = A × π/180. Equation `sin⁻¹({x}) = {A}°`.
  Assumptions: sin⁻¹ gives the one angle from −90° to 90° whose sine is x; the sine is only
  one-to-one there, so the range is restricted; x must be from −1 to 1; sin⁻¹(x) is not
  1/sin(x). Example: sin⁻¹(1/2) = 30° = π/6 ≈ 0.5236. startWith: x, then A.
- **~arccos — BUILD:** picture `unitCircle` (demo `g.m12-inverse-trig-arccos`,
  `solutions: { fn: 'cos', value: 'x', angles: ['A'], principal: true }`: the range 0° to 180°
  shaded). Values x (−1 to 1), A (0 to 180 °), t derived. Relations A = cos⁻¹(x), t = A × π/180.
  Equation `cos⁻¹({x}) = {A}°`. Example: cos⁻¹(−1/2) = 120° = 2π/3. Use: "Find cos⁻¹(−1/2) in
  degrees and radians."
- **~arctan — BUILD:** picture `functionGraph` arctan (demo `g.m12-inverse-trig-arctan`,
  asymptotes y = ±90 marked). Values rise (m), run (m), x (the ratio rise ÷ run, derived), A
  (−90 to 90 °, open ends). Relations x = rise ÷ run; A = tan⁻¹(x). Example: rise 5 m, run 2 m:
  x = 2.5, A = tan⁻¹(2.5) ≈ 68.2°. Use: "A ramp rises 5 m over 2 m of ground. What angle does it
  make?" Assumption: the angle of a slope is tan⁻¹ of rise over run.
- **~compose — BUILD:** picture `unitCircle` (`angle: 'A'`, `sin: 'x'`, `cos: 'y'`). Values x
  (the sine, −1 to 1), A (derived angle), y (cos A). Relations A = sin⁻¹(x); y = cos(A);
  shown as y = √(1 − x²), positive because A is from −90° to 90°. Equation
  `cos(sin⁻¹({x})) = {y}`. Example: x = 3/5: A ≈ 36.87°, y = √(1 − 9/25) = √(16/25) = 4/5.
- **Verdict:** 4 pages; the common items Solve (the equation item is on the next skill).

### 2. m.12.trig-formulas-equations — Sum, difference and double-angle formulas; trigonometric equations

- **Standard:** F-TF.9 (+), F-TF.7 (+); AP Precalculus 3.10–3.11.
- **Textbooks:** Eureka Precalculus 4.A (addition and subtraction formulas), OpenStax Algebra and
  Trigonometry unit 9, OpenStax Precalculus unit 7 (7.2, 7.3, 7.5), Big Ideas Algebra 2 11.10,
  enVision A2 11.8, Larson unit 5 (5.3–5.5), Reveal 11.11–11.12.
- **Tests ask:** no released questions. Common items:

  | Item (our words)                                      | Page              | Mark                         |
  | ----------------------------------------------------- | ----------------- | ---------------------------- |
  | Exact value of sin 75°                                | main              | Solves                       |
  | Exact value of cos 15°                                | ~difference       | Solves                       |
  | sin A = 3/5, A in Quadrant II: find sin 2A and cos 2A | ~double-angle     | Solves                       |
  | Solve 2 sin x + 3 = 4 on [0°, 360°)                   | ~sine-equation    | Solves                       |
  | Solve 3 tan x + 1 = 4 on [0°, 360°)                   | ~tangent-equation | Solves                       |
  | Solve 2 sin²x − sin x − 1 = 0 on [0°, 360°)           | none              | No (engine need 7)           |
  | Verify an identity                                    | none              | No (proof; not a calculator) |

- **Main — BUILD `m.12.trig-formulas-equations`:** picture `unitCircle` (`angle: 'C'`,
  `sin: 'S'`; engine need 6 draws A and B as two arcs). Values A (0 to 360 °), B (0 to 360 °),
  C (A + B, derived), S (sin C). Relations C = A + B; S = sin A cos B + cos A sin B. Equation
  `sin({A}° + {B}°) = {S}`. Steps: the formula, the four special values, the products, the sum.
  Assumptions: sin(A + B) is not sin A + sin B; pick A and B with known exact values; the same
  formula with minus signs gives sin(A − B). Example: sin(45° + 30°) = (√2/2)(√3/2) +
  (√2/2)(1/2) = (√6 + √2)/4 ≈ 0.9659. startWith: A, B.
- **~difference — BUILD:** same picture. Values A, B, C (A − B, derived), K (cos C). Relation
  K = cos A cos B + sin A sin B. Equation `cos({A}° − {B}°) = {K}`. Example: cos(45° − 30°) =
  (√2/2)(√3/2) + (√2/2)(1/2) = (√6 + √2)/4 ≈ 0.9659.
- **~double-angle — BUILD:** picture `unitCircle` (`angle: 'A'`, `sin: 's'`, `cos: 'c'`). Values
  s (sin A, −1 to 1), q (quadrant, `allowed: [1, 2, 3, 4]`), c (cos A, derived), A (derived),
  S2 (sin 2A), C2 (cos 2A). Relations c = ±√(1 − s²) with the sign of the quadrant; S2 = 2sc;
  C2 = c² − s². Limit: s ≥ 0 in quadrants 1–2, s ≤ 0 in 3–4 (a page limit, not a relation).
  Example: s = 3/5, q = 2: c = −4/5, S2 = 2(3/5)(−4/5) = −24/25, C2 = 16/25 − 9/25 = 7/25;
  A ≈ 143.13°.
- **~sine-equation — BUILD:** picture `unitCircle` (demo `g.m12-trig-formulas-equations-sine`,
  `solutions: { fn: 'sin', value: 'k', angles: ['x1', 'x2'] }`, `fixed: true`). Values a (not 0),
  b, c, k (derived, −1 to 1), x1, x2 (0 to 360 °). Relations k = (c − b) ÷ a; x1 = sin⁻¹(k),
  plus 360° when negative; x2 = 180° − sin⁻¹(k). Equation `{a} sin x + {b} = {c}`, solutions as
  rows. Example: 2 sin x + 3 = 4: sin x = 1/2, x = 30° or 150°. Second check: k = −1/2 gives
  210° and 330°.
- **~tangent-equation — BUILD:** demo `g.m12-trig-formulas-equations-tangent`. Values a, b, c,
  k (derived), x1, x2. Relations k = (c − b) ÷ a; x1 = tan⁻¹(k) (plus 180° when negative);
  x2 = x1 + 180°. Equation `{a} tan x + {b} = {c}`. Example: 3 tan x + 1 = 4: tan x = 1,
  x = 45° or 225°.
- **Verdict:** 5 pages; 5 of 7 common items Solve; the quadratic-in-sine item waits on engine
  need 7.

### 3. m.12.vectors — Vectors: components, magnitude and dot product

- **Standard:** N-VM.1, N-VM.2, N-VM.3, N-VM.4a–c, N-VM.5; dot product from AP Precalculus 4.8.
- **Textbooks:** Eureka Precalculus 2.D (vectors in the plane), OpenStax Algebra and Trigonometry
  unit 10, OpenStax Precalculus 8.8, enVision A2 11.10, Larson 6.3–6.4 and unit 11 (3-D vectors).
- **Tests ask:** no released questions. Common items:

  | Item (our words)                                               | Page       | Mark                                |
  | -------------------------------------------------------------- | ---------- | ----------------------------------- |
  | Components of a 10-unit vector at 30°                          | main       | Solves                              |
  | Magnitude and direction of ⟨−3, 4⟩                             | main       | Solves                              |
  | u + v, and its length                                          | ~add       | Solves                              |
  | −2u, and a unit vector along u                                 | ~scalar    | Solves                              |
  | Angle between ⟨2, 1⟩ and ⟨1, 3⟩; are two vectors perpendicular | ~dot       | Solves                              |
  | Resultant of two forces                                        | ~resultant | Solves                              |
  | Cross product of two 3-D vectors                               | none       | No (engine need 10; Larson unit 11) |

- **Main — BUILD `m.12.vectors`:** picture `vectorDiagram` (demo
  `g.m12-vectors-magnitude-direction`, `components: true`). Values m (|v|, 0 to 1000), θ
  (direction, 0 to 360 °), vx, vy (−1000 to 1000). Relations vx = m cos θ; vy = m sin θ;
  m = √(vx² + vy²); θ from tan θ = vy/vx and the arrow's quadrant (engine need 12). Assumptions:
  direction is measured counterclockwise from the positive x-axis; a vector has length and
  direction but no fixed place; tan⁻¹ alone gives the wrong quadrant for vx < 0. Example: m = 10,
  θ = 30°: vx = 5√3 ≈ 8.66, vy = 5. Reverse: ⟨−3, 4⟩: m = 5, θ = 180° − 53.13° = 126.87°.
  startWith: m, θ.
- **~add — BUILD:** picture `vectorDiagram` (demo `g.m12-vectors-tip-to-tail`, result
  { name: 'u + v', x: 'sx', y: 'sy', magnitude: 'r' }). Values ux, uy, vx, vy, sx, sy, r.
  Relations sx = ux + vx; sy = uy + vy; r = √(sx² + sy²). Equation
  `⟨{ux}, {uy}⟩ + ⟨{vx}, {vy}⟩ = ⟨{sx}, {sy}⟩`. Example: ⟨3, 1⟩ + ⟨1, 2⟩ = ⟨4, 3⟩, r = 5.
- **~scalar — BUILD:** demo `g.m12-vectors-scalar`. Values k, ux, uy, x, y, m (|u|, derived),
  M (|ku|). Relations x = k·ux; y = k·uy; M = |k|·m. Equation `{k}⟨{ux}, {uy}⟩ = ⟨{x}, {y}⟩`.
  Example: −2⟨3, 4⟩ = ⟨−6, −8⟩, M = 2 × 5 = 10. Assumption: k = 1/|u| gives the unit vector
  (⟨3, 4⟩ → ⟨0.6, 0.8⟩); a negative k reverses the direction.
- **~dot — BUILD:** demo `g.m12-vectors-angle` (`angle: { value: 'θ', dot: 'p' }`). Values a,
  b, c, d, p, m1, m2 (derived), θ (0 to 180 °). Relations p = ac + bd; cos θ = p ÷ (m1·m2).
  Equation `⟨{a}, {b}⟩ · ⟨{c}, {d}⟩ = {p}`. Example: ⟨2, 1⟩ · ⟨1, 3⟩ = 5; m1 = √5, m2 = √10;
  cos θ = 5/√50 = √2/2, θ = 45°. Assumption: p = 0 means perpendicular (⟨3, 4⟩ · ⟨4, −3⟩ = 0).
- **~resultant — BUILD:** demo `g.m12-vectors-parallelogram` (forces by magnitude and direction,
  `unit: 'N'`). Values f1, f2 (N), a (angle of F₂, °), fx, fy, F (N), φ (°). Relations
  fx = f1 + f2 cos a; fy = f2 sin a; F = √(fx² + fy²); tan φ = fy ÷ fx. Example: 30 N at 0°
  and 40 N at 60°: fx = 50, fy = 20√3 ≈ 34.64, F = √3700 ≈ 60.83 N, φ ≈ 34.72°.
- **Verdict:** 5 pages; 6 of 7 common items Solve; 3-D and the cross product are not built.

### 4. m.12.polar — Polar coordinates and polar form of complex numbers

- **Standard:** N-CN.4 (+), N-CN.5 (+), N-CN.6 (+); polar coordinates and curves from AP
  Precalculus 3.12–3.15.
- **Textbooks:** Eureka Precalculus 1.B–C (complex numbers and trigonometry), OpenStax Algebra
  and Trigonometry units 10 and 12, OpenStax Precalculus 8.3–8.5 and 10.5, enVision A2 11.8,
  Larson 6.5–6.6 and 10.7–10.8.
- **Tests ask:** no released questions. Common items:

  | Item (our words)                              | Page          | Mark               |
  | --------------------------------------------- | ------------- | ------------------ |
  | Rectangular form of the polar point (4, 150°) | main          | Solves             |
  | Polar form of (−1, 1)                         | main          | Solves             |
  | Write 2(cos 60° + i sin 60°) as a + bi        | ~complex-form | Solves             |
  | Product of two complex numbers in polar form  | ~product      | Solves             |
  | (1 + i)⁸ by De Moivre's theorem               | ~de-moivre    | Solves             |
  | Number of petals of r = 4 cos 2θ              | ~rose         | Solves             |
  | Cube roots of 8i                              | none          | No (engine need 8) |

- **Main — BUILD `m.12.polar`:** picture `polarGrid` (demo `g.m12-polar-point`, point
  { r: 'r', theta: 'θ', x: 'x', y: 'y' }). Values r (−20 to 20), θ (−360 to 720 °), x, y.
  Relations x = r cos θ; y = r sin θ; r² = x² + y²; θ from the quadrant (engine need 12).
  Assumptions: a point has many polar names (add 360°, or negate r and add 180°); a negative r
  lands on the opposite ray; θ is measured from the positive x-axis. Example: (4, 150°) →
  x = −2√3 ≈ −3.46, y = 2. Reverse: (−1, 1) → r = √2, θ = 135°. startWith: r, θ.
- **~complex-form — BUILD:** picture `complexPlane` (demo `g.m12-polar-complex-form`, z by
  modulus and argument, `polar: true`). Values r, t (°), a, b. Relations a = r cos t;
  b = r sin t; r = √(a² + b²). Equation `{r}(cos {t}° + i sin {t}°) = {a} + {b}i`. Example:
  2(cos 60° + i sin 60°) = 1 + √3 i ≈ 1 + 1.73i.
- **~product — BUILD:** picture `complexPlane` (z { modulus: 'r1', argument: 't1' }, w { re: 'c',
  im: 'd' }, op 'product'; the op as in `g.m11-complex-numbers-product`). Values r1, t1, r2, t2,
  c, d (w's parts, derived), r, t. Relations r = r1·r2; t = t1 + t2; c = r2 cos t2; d = r2 sin
  t2. Example: 2(cos 30° + i sin 30°) × 3(cos 60° + i sin 60°) = 6(cos 90° + i sin 90°) = 6i.
  Assumption: multiply the moduli, add the arguments.
- **~de-moivre — BUILD:** picture `complexPlane` (z { modulus: 'R', argument: 'T' }, the answer;
  engine need 8 draws z, z², …, zⁿ). Values a, b, n (1 to 12, integer), r, t (derived), R, T,
  p, q. Relations R = rⁿ; T = n·t; p = R cos T; q = R sin T. Equation
  `({a} + {b}i)^{n} = {p} + {q}i`. Example: (1 + i)⁸: r = √2, t = 45°, R = 16, T = 360°, so 16.
- **~rose — BUILD:** picture `polarGrid` (demo `g.m12-polar-rose`, curve { shape: 'rose',
  a: 'a', n: 'n' }, point { r: 'r', theta: 'θ' }). Values a, n (1 to 8, integer), θ, r, P
  (petals, derived). Relations r = a cos(nθ); P = n for odd n, 2n for even n. Example:
  r = 4 cos 2θ at θ = 30°: r = 4 cos 60° = 2; P = 4.
- **~limacon — BUILD:** picture `polarGrid` (demo `g.m12-polar-cardioid`; `g.m12-polar-limacon`
  when b ≠ a). Values a, b, θ, r. Relation r = a + b cos θ. Example: a = b = 2, θ = 60°: r = 3
  (a cardioid). Assumption: a = b is a cardioid, a < b has an inner loop, a > b a dimple or oval.
- **Verdict:** 6 pages; 6 of 7 common items Solve; complex roots wait on engine need 8.

### 5. m.12.parametric — Parametric equations

- **Standard:** no CCSS code (precalculus); AP Precalculus 4.1–4.7.
- **Textbooks:** OpenStax Algebra and Trigonometry unit 10, OpenStax Precalculus 8.6–8.7, Larson
  10.6.
- **Tests ask:** no released questions. Common items:

  | Item (our words)                                           | Page                        | Mark   |
  | ---------------------------------------------------------- | --------------------------- | ------ |
  | Point at t = 2 on x = 1 + 2t, y = 3 − t                    | main                        | Solves |
  | Eliminate the parameter (a line)                           | main                        | Solves |
  | Eliminate the parameter (x = h + a cos t, y = k + b sin t) | ~ellipse                    | Solves |
  | A ball's position after 1 s, and when it lands             | ~projectile                 | Solves |
  | Direction of motion as t increases                         | main (the picture's arrows) | Solves |

- **Main — BUILD `m.12.parametric`:** picture `polarGrid` parametric line (demo
  `g.m12-parametric-line`, range [−5, 5]). Values x0, y0, a, b, t, x, y, m (slope, derived).
  Relations x = x0 + a·t; y = y0 + b·t; m = b ÷ a (a ≠ 0). Steps end with the eliminated line
  y − y0 = m(x − x0). Assumptions: t is the input, x and y both outputs; the arrows show the
  direction t runs; solving one equation for t and substituting removes it. Example: x = 1 + 2t,
  y = 3 − t, t = 2: (5, 1); m = −1/2; y = −x/2 + 3.5 (check: −2.5 + 3.5 = 1). startWith: t.
- **~ellipse — BUILD:** picture `polarGrid` (demo `g.m12-parametric-ellipse`). Values h, k,
  a, b, t (°), x, y. Relations x = h + a cos t; y = k + b sin t; eliminated
  ((x − h)/a)² + ((y − k)/b)² = 1 in the steps. Example: h = 1, k = −2, a = 3, b = 2, t = 60°:
  x = 2.5, y = −2 + √3 ≈ −0.27.
- **~projectile — BUILD:** picture `projectile` (demo `g.m12-parametric-launch`, `parametric:
true`, at 't', x 'X', y 'Y', time 'T'). Values v (m/s), θ (°), h (m), t (s), X, Y (m), T (s).
  Relations X = v cos θ · t; Y = h + v sin θ · t − 4.9t²; T from Y = 0 (the positive root).
  Example: v = 20 m/s, θ = 30°, h = 0, t = 1 s: X ≈ 17.32 m, Y = 10 − 4.9 = 5.1 m; T = 20/9.8
  ≈ 2.04 s. Assumption: no air resistance; g = 9.8 m/s².
- **Verdict:** 3 pages; all 5 common items Solve.

### 6. m.12.matrices — Systems in three variables, matrices and determinants

- **Standard:** N-VM.6–N-VM.12 (+), A-REI.8 (+), A-REI.9 (+); AP Precalculus 4.10–4.12.
- **Textbooks:** Eureka Precalculus modules 1.C and 2 (matrices as transformations, systems),
  OpenStax Algebra and Trigonometry unit 11, OpenStax Intermediate Algebra unit 4 (Grade 11 list),
  OpenStax Precalculus 9.2 and 9.5–9.8, Big Ideas 11.12, enVision A2 11.10, Larson unit 8.
- **Tests ask:** no released questions. Common items:

  | Item (our words)                                   | Page         | Mark                                            |
  | -------------------------------------------------- | ------------ | ----------------------------------------------- |
  | Solve a 3-variable system by row reduction         | main         | Partly (coefficients fixed until engine need 3) |
  | Multiply a 2 × 2 matrix by a vector                | ~multiply    | Solves                                          |
  | 3 × 3 determinant                                  | ~determinant | Solves                                          |
  | Inverse of a 2 × 2 matrix                          | ~inverse     | Solves                                          |
  | Solve a 2 × 2 system by Cramer's rule              | ~cramer      | Solves                                          |
  | Add or scale matrices; multiply two 2 × 2 matrices | none         | Partly (engine need 3: 12 values)               |
  | A matrix as a rotation or reflection               | none         | No (see Not in the taxonomy)                    |

- **Main — BUILD `m.12.matrices`:** picture `matrixGrid` rowReduce (demo
  `g.m12-matrices-row-reduce`) with the system
  `[[1, 1, 1, 'd1'], [2, −1, 1, 'd2'], [1, 2, −1, 'd3']]`, the steps
  `{ add: 2, from: 1, times: −2 }, { add: 3, from: 1, times: −1 }, { swap: [2, 3] }, { add: 3, from: 2, times: 3 }, { scale: 3, by: −1/7 }`
  and the solution `['x', 'y', 'z']`. Values d1, d2, d3, x, y, z. Relations: the three equations.
  Assumptions: each row operation keeps the same solutions; the goal is zeros under the diagonal,
  then back-substitution; a row 0 = nonzero means no solution. Example: x + y + z = 6,
  2x − y + z = 3, x + 2y − z = 2 → after the steps −7z = −21, z = 3, y = −4 + 2(3) = 2,
  x = 6 − 2 − 3 = 1. startWith: d1, d2, d3. When engine need 3 lands, the coefficients become
  boxes: `[[{a}, {b}, {c} | {p}; …]]`.
- **~multiply — BUILD:** picture `matrixGrid` multiply (demo `g.m12-matrices-multiply`, b a 2 × 1
  column); equation from `g.m12-matrices-times-vector`: `[[{a}, {b}; {c}, {d}]] [[{x}; {y}]] = [[{p}; {q}]]`. Values a, b, c, d, x, y, p, q. Relations p = ax + by; q = cx + dy. Example:
  `[[2, 1], [3, 4]] [[5], [−1]]` = `[[9], [11]]`. Assumption: row times column; the columns of A
  must match the rows of the vector.
- **~determinant — BUILD:** equation (demo `g.m12-matrices-determinant`, 3 × 3):
  `||{a}, {b}, {c}; {d}, {e}, {f}; {g}, {h}, {k}|| = {D}` (10 values). Picture: none drawn;
  engine need 5. Relation D = a(ek − fh) − b(dk − fg) + c(dh − eg). Example: `[[2, 0, 1], [1, 3, 2], [1, 1, 4]]`: 2(12 − 2) − 0 + 1(1 − 3) = 20 − 2 = 18. Assumption: D = 0 means no
  inverse and no single solution.
- **~inverse — BUILD:** picture `matrixGrid` multiply (a = A, b = A⁻¹'s derived entries: the
  product shows I). Values a, b, c, d, D, e, f, g, h (A⁻¹). Relations D = ad − bc; e = d/D,
  f = −b/D, g = −c/D, h = a/D. Rows until engine need 4 (`[[…]]^{−1}`). Example: A = `[[4, 7], [2, 6]]`: D = 10, A⁻¹ = `[[0.6, −0.7], [−0.2, 0.4]]` (check row 1 × column 1: 2.4 − 1.4 = 1).
- **~cramer — BUILD:** equation `{a}x + {b}y = {p}\n{c}x + {d}y = {q}`. Picture `matrixGrid`
  none fits (engine need 5 draws D, Dx, Dy side by side); until then the equation only. Values
  a, b, c, d, p, q, D, x, y. Relations D = ad − bc; x = (pd − bq)/D; y = (aq − pc)/D. Example:
  2x + 3y = 13, x − y = −1: D = −5, Dx = −10, Dy = −15, x = 2, y = 3 (check 4 + 9 = 13).
- **Verdict:** 5 pages; 4 of 7 Solve, 2 Partly on the value limit, transformations not built.

### 7. m.12.conics — Conic sections: parabolas, ellipses and hyperbolas

- **Standard:** G-GPE.2, G-GPE.3 (+); G-GPE.1 (refresh).
- **Textbooks:** Eureka Algebra 2 / Precalculus (11.1, 12.3), IM Geometry (10.6), OpenStax
  Algebra and Trigonometry units 11–12, OpenStax Intermediate Algebra 11, OpenStax Precalculus
  10.1–10.3, Big Ideas 10.10 and 11.2, enVision 10.9 and 11.9, Larson 10.2–10.4, Reveal 10.10.
- **Tests ask:**

  | Question                                                                     | Page                            | Mark                                                                                          |
  | ---------------------------------------------------------------------------- | ------------------------------- | --------------------------------------------------------------------------------------------- |
  | NAEP-1992-12M7-#10 (a horizontal line meets a circle centered at the origin) | m.10.circle-equations (refresh) | Partly: the page gives one x for a y; both ±x need its point on the curve for the second root |
  | MCAS-2026-G10M-#5 (center and radius from (x + h)² + (y − k)² = r²)          | m.10.circle-equations (refresh) | Solves                                                                                        |
  | (our words) Foci of an ellipse from its equation                             | main                            | Solves                                                                                        |
  | (our words) Focus and directrix of (x − 2)² = 8(y + 1)                       | ~parabola                       | Solves                                                                                        |
  | (our words) Asymptotes of a hyperbola                                        | ~hyperbola                      | Solves                                                                                        |
  | (our words) Which conic is 4x² − 9y² = 36                                    | ~identify                       | Solves                                                                                        |
  | (our words) Standard form by completing the square                           | none                            | Partly (m.9 completing the square; no conic page)                                             |

- **Main — BUILD `m.12.conics`:** picture `conicGraph` ellipse (demo `g.m12-conics-ellipse`,
  h 'h', k 'k', c 'c'); equation (same demo) `{(x − {h})²}/{a}^2 + {(y − {k})²}/{b}^2 = 1`.
  Values h, k, a, b (0.5 to 20), c (derived), e (eccentricity, derived). Relations
  c = √|a² − b²|; e = c ÷ max(a, b). Assumptions: a goes with x, so a > b is a wide ellipse and
  a < b a tall one; foci lie on the long axis, c from the center; every point's distances to
  the foci add to the long axis. Example: (x − 1)²/25 + (y + 2)²/9 = 1: c = 4, foci (−3, −2) and
  (5, −2), vertices (−4, −2) and (6, −2), e = 0.8. startWith: h, k, a, b.
- **~parabola — BUILD:** picture `conicGraph` parabola (demo `g.m12-conics-parabola`; `…-left`
  for horizontal). Values h, k, q (the 4p in the equation), p (derived), F (focus y), L
  (directrix y), x, y (a point). Relations p = q ÷ 4; F = k + p; L = k − p; (x − h)² = q(y − k).
  Equation `(x − {h})² = {q}(y − {k})`. Example: (x − 2)² = 8(y + 1): p = 2, vertex (2, −1),
  focus (2, 1), directrix y = −3; point (6, 1) is 4 from both.
- **~hyperbola — BUILD:** picture `conicGraph` hyperbola (demo `g.m12-conics-hyperbola`;
  `…-vertical`). Values h, k, a, b, c (derived), s (asymptote slope b ÷ a, derived). Relations
  c = √(a² + b²); s = b ÷ a. Equation `{(x − {h})²}/{a}^2 − {(y − {k})²}/{b}^2 = 1`. Example:
  a = 3, b = 4, center (0, 0): c = 5, foci (±5, 0), asymptotes y = ±(4/3)x.
- **~identify — BUILD (sort):** bins Circle, Ellipse, Parabola, Hyperbola; sentence "Compare
  the x² and y² terms: same coefficient, same sign, opposite signs, or only one squared." Cards
  (one right bin each): x² + y² = 16 (Circle); x² + y² − 6x = 0 (Circle); 4x² + 9y² = 36
  (Ellipse); (x − 1)² + 4(y + 2)² = 16 (Ellipse); y = 2x² − 3 (Parabola); y² = 8x (Parabola);
  x² − y² = 9 (Hyperbola); 9y² − 4x² = 36 (Hyperbola).
- **~cone — BUILD (explore):** figure `doubleCone` (demo `g.m12-conics-cone`). Scenes: Circle
  (plane square to the axis), Ellipse (tilted, cuts one cone all the way round), Parabola (tilted
  as steeply as the cone's side), Hyperbola (steeper, cuts both cones), each one sentence.
- **Verdict:** 5 pages; both released items go to the m.10 refresh (1 Solves, 1 Partly); 4 of 5
  common items Solve.

### 8. m.12.limits-intro — Limits, continuity and an introduction to derivatives

- **Standard:** no CCSS code; AP Calculus AB 1.2–1.16 and 2.1–2.2.
- **Textbooks:** OpenStax Precalculus unit 12 (12.1–12.4), Larson unit 12 (12.1–12.4; 12.5 the
  area problem is not covered).
- **Tests ask:** no released questions. Common items:

  | Item (our words)                                                 | Page                            | Mark                                      |
  | ---------------------------------------------------------------- | ------------------------------- | ----------------------------------------- |
  | lim (x² − 9)/(x − 3) as x → 3                                    | main                            | Solves                                    |
  | Left and right limits of a piecewise function; continuous or not | ~one-sided                      | Solves                                    |
  | Slope of a secant, then the derivative of x² at 3                | ~derivative                     | Solves                                    |
  | lim (2x + 1)/(x − 3) as x → ∞                                    | ~infinity                       | Solves                                    |
  | A table of values approaching a limit                            | main (steps list x = 2.9, 2.99) | Solves                                    |
  | Area under a curve by rectangles                                 | none                            | No (Larson 12.5; see Not in the taxonomy) |

- **Main — BUILD `m.12.limits-intro`:** picture `functionGraph` rational with a hole (demo
  `g.m12-limits-intro-hole`: zeros ['a', 'b'], poles ['a'], `limit: { x: 'a' }`, at { x: 'x',
  y: 'y' }). Values a (−10 to 10), b (−10 to 10, not a), L (derived), x, y. Relations
  f(x) = (x − a)(x − b)/(x − a); L = a − b; y = x − b for x ≠ a. Assumptions: the limit is the
  value f(x) approaches, not f(a); f(a) is undefined here (a hole) but the limit exists;
  cancelling the common factor is allowed because x ≠ a. Example: (x² − 9)/(x − 3) as x → 3:
  a = 3, b = −3, L = 6; x = 2.9 gives 5.9, x = 2.99 gives 5.99. startWith: a, b.
- **~one-sided — BUILD:** picture `functionGraph` piecewise (demo `g.m12-limits-intro-jump`, two
  linear pieces, ends '[)' at c). Values m1, b1, m2, b2, c, L1 (left), L2 (right), J (L2 − L1,
  derived). Relations L1 = m1·c + b1; L2 = m2·c + b2 (= f(c)). Assumption: the limit exists only
  when L1 = L2; continuous when that value is f(c). Example: y = x + 1 left of 2, y = 2x − 3 from
  2: L1 = 3, L2 = 1, J = −2: no limit at 2, not continuous.
- **~derivative — BUILD:** picture `functionGraph` quadratic with secant (demo
  `g.m12-limits-intro-secant`, `secant: { x: 'x', h: 'h', slope: 'm' }`). Values a, b, c, x, h
  (not 0), m, d. Relations m = (f(x + h) − f(x)) ÷ h = 2ax + b + ah; d = 2ax + b. Example:
  f(x) = x², x = 3, h = 0.1: m = (9.61 − 9) ÷ 0.1 = 6.1; d = 6.
- **~infinity — BUILD:** picture `functionGraph` rational (zeros ['z'], poles ['v'], a 'L',
  shows { ha: 'L' }). Values p, q, r, s, z, v (derived), L, x, y. Relations z = −q/p; v = −s/r;
  L = p ÷ r; y = (px + q)/(rx + s). Example: (2x + 1)/(x − 3): L = 2; x = 1000 gives 2001/997
  ≈ 2.007. Engine need 11 removes z and v.
- **Verdict:** 4 pages; 5 of 6 common items Solve.

### 9. m.12.sampling-distributions — Sampling distributions and the central limit theorem

- **Standard:** S-IC.1, S-IC.4; AP Statistics unit 5.
- **Textbooks:** OpenStax Statistics unit 7 (7.1–7.3), Larson–Farber 5.4–5.5.
- **Tests ask:** no released questions. Common items:

  | Item (our words)                                           | Page          | Mark                   |
  | ---------------------------------------------------------- | ------------- | ---------------------- |
  | Mean and standard error of x̄ for n = 25                    | main          | Solves                 |
  | P(x̄ < a value)                                             | main          | Solves                 |
  | P(p̂ > a value) and the large-counts check                  | ~proportion   | Solves                 |
  | Mean and spread of a binomial count; is it close to normal | ~counts       | Solves                 |
  | Why larger samples give narrower distributions             | main (drag n) | Solves                 |
  | CLT from a skewed population                               | none          | Partly (engine need 9) |

- **Main — BUILD `m.12.sampling-distributions`:** picture `normalCurve` (demo
  `g.m12-sampling-distributions-mean`: mean 'μ', sd 'σ', sample { n: 'n', se: 'E' }, shade
  { to: 'x', area: 'P' }, axis "Height (cm)"). Values μ (cm), σ (cm), n (2 to 1000), E (σ/√n),
  x (cm), z, P. Relations E = σ ÷ √n; z = (x − μ) ÷ E; P = Φ(z). Assumptions: the mean of x̄ is
  μ; x̄ is normal when the population is normal or n ≥ 30; samples are random and under 10% of
  the population. Example: μ = 170 cm, σ = 10 cm, n = 25: E = 2 cm; x = 173: z = 1.5,
  P = 0.9332. startWith: μ, σ, n, x.
- **~proportion — BUILD:** picture `normalCurve` (mean 'p', sd 'E', shade { from: 'x', area:
  'P' }). Values p, n, E, x, z, P. Relations E = √(p(1 − p)/n); z = (x − p) ÷ E; P = 1 − Φ(z).
  Assumption: np ≥ 10 and n(1 − p) ≥ 10. Example: p = 0.4, n = 150: E = √0.0016 = 0.04;
  P(p̂ > 0.46): z = 1.5, P = 0.0668 (np = 60, n(1 − p) = 90).
- **~counts — BUILD:** picture `histogram` binomial (demo `g.m12-sampling-distributions-binomial-40`,
  binomial { n: 'n', p: 'p', mean: 'M', sd: 'S' }). Values n (1 to 40), p, M, S. Relations
  M = np; S = √(np(1 − p)). Example: n = 40, p = 0.25: M = 10, S = √7.5 ≈ 2.74; np = 10 and
  n(1 − p) = 30, so close to normal.
- **Verdict:** 3 pages; 5 of 6 common items Solve.

### 10. m.12.confidence-intervals — Confidence intervals for a mean and a proportion

- **Standard:** S-IC.4; AP Statistics 6.2–6.3 and 7.2.
- **Textbooks:** OpenStax Statistics unit 8 (8.1–8.3), Larson–Farber 6.1–6.3 (6.4, the interval
  for a variance, is not covered).
- **Tests ask:** no released questions. Common items:

  | Item (our words)                              | Page         | Mark               |
  | --------------------------------------------- | ------------ | ------------------ |
  | 95% interval for a mean, σ known              | main         | Solves             |
  | 95% interval for a proportion from 240 of 400 | ~proportion  | Solves             |
  | Sample size for a 3-point margin              | ~sample-size | Solves             |
  | What "95% confident" means                    | ~capture     | Solves             |
  | Interval for a mean, σ unknown (t)            | none         | No (engine need 1) |

- **Main — BUILD `m.12.confidence-intervals`:** picture `normalCurve` interval (demo
  `g.m12-confidence-intervals-mean`, interval { center: 'x', margin: 'E', level: 'C' }); equation
  (demo `g.m12-confidence-intervals-margin`) `{x} ± {z} × {s}/√{n}`. Values x (x̄), C (%,
  `allowed: [90, 95, 99]`), z (z*, derived), s (σ), n, E, lo, hi. Relations z = invNorm(1 −
  (1 − C/100)/2); E = z·s ÷ √n; lo = x − E; hi = x + E. Assumptions: random sample; σ known (else
  t, a later page); x̄ normal (population normal or n ≥ 30); the interval is about μ, not about
  single values. Example: x̄ = 52, σ = 8, n = 64, 95%: z* = 1.96, E = 1.96, (50.04, 53.96).
  startWith: x, s, n, C.
- **~proportion — BUILD:** picture `normalCurve` interval (center 'p', margin 'E'). Values k
  (successes), n, p (p̂, derived), C (allowed), z (derived), E, lo, hi. Relations p = k ÷ n;
  E = z·√(p(1 − p)/n). Example: 240 of 400: p̂ = 0.6, E = 1.96 × √0.0006 ≈ 0.048, (0.552,
  0.648). Assumption: at least 10 successes and 10 failures.
- **~sample-size — BUILD:** picture `normalCurve` interval (center 'p', margin 'E'). Values C,
  z (derived), p (use 0.5 when unknown), E, n (`derived` rounding up). Relation
  n = ⌈z²·p(1 − p)/E²⌉. Example: E = 0.03, 95%, p = 0.5: 0.9604/0.0009 ≈ 1067.1 → 1068.
- **~capture — BUILD:** picture `normalCurve` intervals (demo `g.m12-confidence-intervals-capture`,
  intervals { count: 'N', n: 'n', level: 'C' }; `…-capture-20` for 20). Values C (allowed), N
  (`allowed: [20, 50, 100]`), n, K (expected captures, derived). Relation K = N × C/100.
  Assumption: the level is how often the method captures μ over many samples; any one interval
  either does or doesn't. Example: 100 intervals at 95%: about 95 capture μ (seed 152 shows 94).
- **Verdict:** 4 pages; 4 of 5 common items Solve; the t interval waits on engine need 1.

### 11. m.12.hypothesis-testing — Hypothesis tests for one and two samples

- **Standard:** S-IC.5, S-IC.6 (S-IC.2 refresh); AP Statistics 6.4–6.11 and 7.4–7.9.
- **Textbooks:** Eureka Algebra 2 (11.4), IM Algebra 2 (11.7), OpenStax Statistics units 9–10
  (and 11, 13), Big Ideas 11.9, enVision 11.11, HMH 11.9, Larson–Farber units 7–8.
- **Tests ask:**

  | Question                                                                       | Page                                          | Mark                                                                                                    |
  | ------------------------------------------------------------------------------ | --------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
  | NAEP-2024-12M2-#11 (a randomized two-group experiment; which conclusions hold) | ~two-sample, with m.11.study-design (refresh) | Partly: the page tests the difference; the "cause, from random assignment" statements are the refresh's |
  | (our words) One-proportion z test from 60 of 100                               | main                                          | Solves                                                                                                  |
  | (our words) One-mean z test, left-tailed                                       | ~mean                                         | Solves                                                                                                  |
  | (our words) Name a Type I and a Type II error in context                       | ~errors                                       | Solves                                                                                                  |
  | (our words) Two-sample test for a difference of means                          | ~two-sample                                   | Solves (z; t waits on engine need 1)                                                                    |
  | (our words) Right-tailed alternative typed by the student                      | none                                          | Partly (engine need 2)                                                                                  |

- **Main — BUILD `m.12.hypothesis-testing`:** picture `normalCurve` test (demo
  `g.m12-hypothesis-testing-two`, test { stat: 'z', alpha: 'α', tail: 'two', p: 'P' }). Values
  p0, n, k (successes), p (p̂, derived), E (standard error), z, P, α (`allowed: [0.01, 0.05,
0.1]`). Relations p = k ÷ n; E = √(p0(1 − p0)/n); z = (p − p0) ÷ E; P = 2(1 − Φ(|z|)).
  Assumptions: H₀: p = p0, Hₐ: p ≠ p0; np0 ≥ 10 and n(1 − p0) ≥ 10; reject H₀ when P < α;
  "fail to reject" never proves H₀. Example: p0 = 0.5, 60 of 100: p̂ = 0.6, E = 0.05, z = 2,
  P = 2(1 − 0.9772) = 0.0455 < 0.05: reject H₀. startWith: p0, n, k, α.
- **~mean — BUILD:** picture `normalCurve` test (demo `g.m12-hypothesis-testing-left`, tail
  'left'). Values μ0 (g), σ (g), n, x (x̄, g), E, z, P, α. Relations E = σ ÷ √n; z = (x − μ0) ÷ E;
  P = Φ(z). Example: μ0 = 500 g, σ = 12 g, n = 36, x̄ = 496 g: E = 2 g, z = −2, P = 0.0228 <
  0.05: reject H₀; the mean is less than 500 g.
- **~two-sample — BUILD:** picture `normalCurve` test (tail 'two'). Values x1, s1, n1, x2, s2,
  n2, E, z, P, α (10). Relations E = √(s1²/n1 + s2²/n2); z = (x1 − x2) ÷ E; P = 2(1 − Φ(|z|)).
  Assumptions: two random samples or two groups assigned at random; 30 or more in each, so z is
  close to t; random assignment lets a significant difference show cause. Example: 52 cm (s 6,
  n 36) against 49 cm (s 6, n 36): E = √2 ≈ 1.414, z ≈ 2.12, P ≈ 0.034 < 0.05.
- **~errors — BUILD (sort):** bins Type I error, Type II error, Correct decision; sentence "A
  Type I error rejects a true H₀; a Type II error keeps a false one." Cards: Reject H₀ when H₀
  is true (I); Fail to reject H₀ when H₀ is false (II); Reject H₀ when H₀ is false (Correct);
  Fail to reject H₀ when H₀ is true (Correct); H₀: the coin is fair. A fair coin is called
  unfair (I); H₀: the medicine does nothing. A medicine that works is judged useless (II);
  H₀: the batch is fine. A fine batch is thrown out (I); H₀: the batch is fine. A bad batch is
  thrown out (Correct).
- **Verdict:** 4 pages; the NAEP item Partly (with the refresh), 4 of 5 common items Solve.

### 12. m.12.chi-square — Chi-square tests for goodness of fit and independence

- **Standard:** no CCSS code (S-CP.4 refresh for two-way tables); AP Statistics unit 8.
- **Textbooks:** OpenStax Statistics unit 11 (11.1–11.5), Larson–Farber 10.1–10.2.
- **Tests ask:** no released questions. Common items:

  | Item (our words)                           | Page                                                    | Mark                                   |
  | ------------------------------------------ | ------------------------------------------------------- | -------------------------------------- |
  | Does a 1 : 2 : 1 ratio fit the counts?     | main                                                    | Solves                                 |
  | Expected counts from row and column totals | ~independence                                           | Solves                                 |
  | χ², df and P for a 2 × 3 table             | ~independence                                           | Solves                                 |
  | Test of homogeneity                        | ~independence (same arithmetic; the assumption says so) | Solves                                 |
  | Goodness of fit with 5 or more categories  | none                                                    | Partly (10-value limit; engine need 3) |

- **Main — BUILD `m.12.chi-square`:** picture `normalCurve` chiSquare (demo
  `g.m12-chi-square-gof`, chiSquare { df: 2, stat: 'X', p: 'P' }). Values O1, O2, O3 (counts),
  p1, p2 (expected proportions), p3 (1 − p1 − p2, derived), n (derived), X, P. Relations
  n = O1 + O2 + O3; Eᵢ = n·pᵢ (in the steps); X = Σ(O − E)²/E; P = χ²cdf(X, ∞, 2). Assumptions:
  counts, not percents; every expected count at least 5; df = categories − 1; a large X (small
  P) means the counts don't fit. Example: 22, 54, 24 against 1 : 2 : 1 (0.25, 0.5, 0.25):
  E = 25, 50, 25; X = 0.36 + 0.32 + 0.04 = 0.72; P = e^(−0.36) ≈ 0.698: the ratio fits.
  startWith: O1, O2, O3, p1, p2.
- **~independence — BUILD:** picture `table` twoWay (demo `g.m12-chi-square-independence`, 2 × 3
  cells `[['a', 'b', 'e'], ['c', 'd', 'f']]`, expected 'independence', chiSquare 'X'). Values a, b,
  e, c, d, f, X, P. Relations E = row total × column total ÷ grand total (steps); X = Σ(O − E)²/E;
  df = (2 − 1)(3 − 1) = 2; P = χ²cdf(X, ∞, 2). Example: `[[20, 30, 50], [30, 20, 50]]`: expected
  25, 25, 50 in each row; X = 1 + 1 + 0 + 1 + 1 + 0 = 4; P = e^(−2) ≈ 0.135: not significant at
  0.05.
- **Verdict:** 2 pages; 4 of 5 common items Solve.

## Engine and picture needs

1. **t distribution:** `normalCurve` `t: { df }` (a t curve over the dashed normal), invT and
   tcdf phrases in the harness. Waits: new pages `m.12.confidence-intervals~t-interval`,
   `m.12.hypothesis-testing~t-test`; `~two-sample` then switches to t.
2. **Tail from a value:** `normalCurve` `test.tail` from a variable, typed with a sign box in
   Hₐ (`p {s:sign} {p0}`, ≠ < >). Waits: `m.12.hypothesis-testing`, `~mean`.
3. **Matrix pages over 10 values:** count a matrix as one value (or allow 16 on `matrixGrid` and
   `[[…]]` pages). Waits: `m.12.matrices` (typed coefficients), a 2 × 2 × 2 × 2 multiply,
   matrix addition, `m.12.chi-square` with more categories.
4. **`[[…]]^{−1}` in templates** (an exponent on a matrix bracket). Waits: `m.12.matrices~inverse`.
5. **Determinant picture:** `matrixGrid` mode 'determinant' (the cofactor expansion lit; D, Dx,
   Dy side by side for Cramer) or the parallelogram the columns span with area |D|. Waits:
   `m.12.matrices~determinant`, `~cramer`.
6. **`unitCircle` two angles:** A and B drawn as arcs in turn, with A + B or A − B. Waits:
   `m.12.trig-formulas-equations`, `~difference`.
7. **`unitCircle` solutions for two values** (sin x = −1/2 or 1). Waits: a later
   `m.12.trig-formulas-equations~quadratic`.
8. **`complexPlane` powers and roots:** `power: n` (z, z², …, zⁿ) and `roots: n` (the n roots on
   a circle). Waits: `m.12.polar~de-moivre`, a later `~roots`.
9. **CLT simulation:** `histogram` of sample means drawn from a skewed population, n and the
   number of samples as values. Waits: `m.12.sampling-distributions` (a second picture or a
   `~clt` page).
10. **3-D vectors and the cross product** (a 3-D axes figure). Waits: a later `m.12.vectors~cross`
    (Larson unit 11).
11. **`functionGraph` rational by coefficients** ((px + q)/(rx + s)). Waits:
    `m.12.limits-intro~infinity` (drops z and v).
12. **Direction from components** (an atan2 relation helper, if `helpers.ts` lacks one; the
    harness phrase "θ = 180° − tan⁻¹(…)"). Waits: `m.12.vectors`, `m.12.polar`.

## Not in the taxonomy

- Linear transformations as matrices (rotations, reflections, composition; Eureka Precalculus
  modules 1–2, AP Precalculus 4.12–4.14): fits `m.12.matrices` or a new skill.
- Vectors in space and the cross product (Larson unit 11).
- Rotation of axes and polar equations of conics (OpenStax Precalculus 10.4–10.5, Larson 10.5,
  10.9).
- The area problem (Larson 12.5), limits of sequences (Larson 12.4).
- Inference for regression, one-way ANOVA and the F distribution, the test of a single variance
  (OpenStax Statistics 11.6, 12.4, 13; Larson–Farber 6.4, 10.3–10.4).
- Partial fractions (OpenStax Precalculus 9.4, Larson 7.4), if no earlier grade holds it.

## Priority

1. Statistics first (the only released items and the largest practice sets): hypothesis-testing
   (4), confidence-intervals (4), sampling-distributions (3), chi-square (2).
2. Conics (5, both released items via the refresh) and matrices (5, 161 practice problems).
3. Trig: inverse-trig (4), trig-formulas-equations (5).
4. Vectors (5), polar (6), parametric (3), limits-intro (4).
5. Engine needs 1 and 2 (t and the typed tail), then 3 (matrix values), then 6 and 8.

## Added skills

Eight skills added to the taxonomy after Grade 12 was built (TAXONOMY_ISSUES.md, "Grades 9–12
topics without a skill"). None has a released question in `research/questions/` (COVERAGE.md
lists 0 for each), so each lists the common textbook items in our own words. No gallery demo
exists for any of them: the pictures are the nearest kinds already drawn, and the missing ones
are listed under "Shared needs" in `docs/build/m.12.md`. Examples are original and worked by
hand. Build order: the precalculus skills in taxonomy order, then the two statistics skills.

### 13. m.12.vectors-3d — Vectors in three dimensions: dot and cross products

- **Standard:** N-VM.4 (+), N-VM.5 (+) carried into space; no CCSS code for the cross product.
- **Textbooks:** Larson Precalculus unit 11 (11.1 the 3-D system, 11.2 vectors in space, 11.3
  the cross product); Eureka Precalculus module 2 B and D (points and vectors in space).
- **Tests ask:** no released questions. Common items:

  | Item (our words)                                  | Page    | Mark                          |
  | ------------------------------------------------- | ------- | ----------------------------- |
  | u · v and the angle between two 3-D vectors       | main    | Solves                        |
  | Are two 3-D vectors perpendicular?                | main    | Solves (u · v = 0)            |
  | u × v, a vector perpendicular to both             | ~cross  | Solves                        |
  | Area of the parallelogram (triangle) u and v span | ~cross  | Solves (the triangle: half)   |
  | Volume of the box (parallelepiped) u, v, w span   | ~triple | Solves                        |
  | Lines and planes in space                         | none    | No (Larson 11.4; not planned) |

- **Main — BUILD `m.12.vectors-3d`:** picture `matrixGrid` multiply (u as a row times v as a
  column, the one entry u · v lit; 3-D axes are need 10). Values a, b, c (u, one group), d, e,
  f (v, one group), p (u · v), m1 (|u|), m2 (|v|), θ (0 to 180 °); the last four derived.
  Relations p = ad + be + cf; m1 = √(a² + b² + c²); m2 = √(d² + e² + f²);
  θ = cos⁻¹(p ÷ (m1·m2)). Assumptions: multiply matching components and add;
  cos θ = u · v ÷ (|u||v|); u · v = 0 means perpendicular. Example: ⟨1, 2, 2⟩ · ⟨4, 0, 3⟩ =
  4 + 0 + 6 = 10; |u| = 3, |v| = 5; cos θ = 10/15 = 2/3, θ ≈ 48.19°. startWith: a–f.
- **~cross — BUILD:** picture `table` (|u × v| as v's last component f changes: 0 when v is
  parallel to u) until need 10. Values a–f (two groups), x, y, z (u × v, one group), A
  (|u × v|). Relations x = bf − ce; y = cd − af; z = ae − bd; A = √(x² + y² + z²).
  Assumptions: u × v is perpendicular to both (its dot product with each is 0); |u × v| is the
  parallelogram's area, half of it the triangle's; v × u = −(u × v). Example: ⟨1, 2, 3⟩ ×
  ⟨2, 0, 1⟩ = ⟨2 − 0, 6 − 1, 0 − 4⟩ = ⟨2, 5, −4⟩; A = √45 ≈ 6.708. Use: “Find u × v for
  u = ⟨1, 2, 3⟩ and v = ⟨2, 0, 1⟩, and the area of the parallelogram they span.”
- **~triple — BUILD:** picture `table` (the volume as w's last component changes), as on
  `m.12.matrices~determinant`. Values u, v, w (three groups of 3), T (u · (v × w)), V (|T|).
  Relations T = the 3 × 3 determinant with rows u, v, w (first-row expansion); V = |T|.
  Example: u = ⟨1, 2, 0⟩, v = ⟨0, 1, 3⟩, w = ⟨2, 0, 1⟩: T = 1(1 − 0) − 2(0 − 6) + 0(0 − 2) =
  13, V = 13. Assumption: T = 0 means the three vectors lie in one plane.
- **Verdict:** 3 pages; 5 of 6 common items Solve.

### 14. m.12.matrix-transformations — Matrices as transformations of the plane

- **Standard:** N-VM.12 (+) (2 × 2 matrices as transformations, |det| as the area factor);
  AP Precalculus 4.12–4.14.
- **Textbooks:** Eureka Precalculus module 1 C (lessons 21–30: matrix notation, rotations,
  reversing a transformation) and module 2 B (linear transformations as matrices,
  composition). No other unit maps to the skill (CROSSWALK.md).
- **Tests ask:** no released questions. Common items:

  | Item (our words)                                      | Page      | Mark   |
  | ----------------------------------------------------- | --------- | ------ |
  | Image of (3, 1) after a 90° rotation about the origin | main      | Solves |
  | Image of a point under `[[2, 1], [1, 1]]`; undo it    | ~image    | Solves |
  | How a matrix changes a figure's area                  | ~area     | Solves |
  | Rotate by 30°, then by 60°: one matrix for both       | ~compose  | Solves |
  | Which transformation does `[[0, 1], [1, 0]]` do?      | ~identify | Solves |

- **Main — BUILD `m.12.matrix-transformations`:** picture `transformation` (move 'rotate'
  about the origin: the segment from A = (x, y) to O, its image A′ = (X, Y)). Values θ (−360
  to 360 °), x, y, c (cos θ, derived), s (sin θ, derived), X, Y. Relations c = cos θ;
  s = sin θ; X = cx − sy; Y = sx + cy (and back: x = cX + sY, y = −sX + cY). Assumptions: the
  rotation matrix is `[[cos θ, −sin θ], [sin θ, cos θ]]`; its columns are where (1, 0) and
  (0, 1) land; a positive θ turns counterclockwise. Example: θ = 90°: c = 0, s = 1,
  (3, 1) → (0 − 1, 3 + 0) = (−1, 3). startWith: θ, x, y.
- **~image — BUILD:** picture `matrixGrid` multiply (A times the column (x, y)). Values a, b,
  c, d (one group), x, y, X, Y, D (ad − bc, derived). Relations X = ax + by; Y = cx + dy;
  D = ad − bc; typed X and Y undo the move: x = (dX − bY) ÷ D, y = (aY − cX) ÷ D (limit
  D ≠ 0: the matrix flattens the plane onto a line, so it can't be undone). Example:
  `[[2, 1], [1, 1]]` times (3, −1) is (5, 2); D = 1. startWith: x, y, a, b, c, d.
- **~area — BUILD:** picture `coordinatePlane` polygon: the unit square's image, the
  parallelogram (0, 0), (a, c), (a + b, c + d), (b, d) (the two sums hidden), its corner
  (a, c) the point dragged. Values a, b, c, d (one group), D, S (area before), T (area after).
  Relations D = ad − bc; T = (the size of D) × S. Example: `[[3, 1], [1, 2]]`: D = 5; a
  figure of area 4 becomes 20. Assumption: a negative D also flips the figure over.
- **~compose — BUILD:** picture `transformation` rotate α then rotate β (`then`), A″ = (X, Y).
  Values α, β, γ (α + β, derived), x, y, X, Y. Relations γ = α + β; X = x cos γ − y sin γ;
  Y = x sin γ + y cos γ. Example: α = 30°, β = 60°: γ = 90°; (4, 2) → (−2, 4). Assumption:
  the matrix of “α then β” is R(β)R(α) = R(α + β); for other moves the order matters.
- **~identify — BUILD (sort):** eight matrices into rotation, reflection, dilation:
  `[[0, −1], [1, 0]]`, `[[−1, 0], [0, −1]]`, `[[0, 1], [−1, 0]]`; `[[1, 0], [0, −1]]`,
  `[[−1, 0], [0, 1]]`, `[[0, 1], [1, 0]]`; `[[2, 0], [0, 2]]`, `[[0.5, 0], [0, 0.5]]`.
- **Verdict:** 5 pages; the common items Solve.

### 15. m.12.polar-conics — Polar equations of conics and rotation of axes

- **Standard:** no CCSS code; G-GPE.3 (+) carried on.
- **Textbooks:** Larson Precalculus 10.5 (rotation of conics) and 10.9 (polar equations of
  conics); OpenStax Precalculus 10.4–10.5; OpenStax Algebra and Trigonometry 12.4–12.5.
- **Tests ask:** no released questions. Common items:

  | Item (our words)                                         | Page      | Mark                  |
  | -------------------------------------------------------- | --------- | --------------------- |
  | Identify r = 6 ÷ (2 − cos θ): e and the conic            | main      | Solves                |
  | Vertices, center and axes of a polar ellipse             | ~ellipse  | Solves                |
  | Vertex and directrix of r = 4 ÷ (1 − cos θ)              | ~parabola | Solves                |
  | The angle that removes the xy term; classify by B² − 4AC | ~rotation | Solves                |
  | Rewrite the equation in x′ and y′                        | none      | No (symbolic algebra) |

- **Main — BUILD `m.12.polar-conics`:** picture `polarGrid` point (r, θ) (the conic itself is
  a picture need). Values k, m (both positive), n (not 0) in r = k ÷ (m − n cos θ), e (|n| ÷ m,
  derived), d (k ÷ |n|, derived), θ, r. Relations e = |n| ÷ m; d = k ÷ |n|;
  r = k ÷ (m − n cos θ). The e step ends with the conic (e < 1 an ellipse, e = 1 a parabola,
  e > 1 a hyperbola). Assumptions: divide top and bottom by m to reach r = ed ÷ (1 − e cos θ);
  the focus is at the pole; the directrix is x = −d (x = d when the sign is +). Example:
  r = 6 ÷ (2 − cos θ): e = 1/2, an ellipse; d = 6; at θ = 60°, r = 6 ÷ 1.5 = 4.
  startWith: k, m, n, θ.
- **~ellipse — BUILD:** picture `conicGraph` ellipse, center (c, 0), so one focus is the pole.
  Values e (0 to 1), d, R (r at 0°), S (r at 180°), a, c, b. Relations R = ed ÷ (1 − e);
  S = ed ÷ (1 + e); a = (R + S) ÷ 2; c = (R − S) ÷ 2; b = √(RS). Example: e = 1/2, d = 6:
  R = 6, S = 2, a = 4, c = 2, b = √12 ≈ 3.464; vertices (6, 0) and (−2, 0), center (2, 0).
- **~parabola — BUILD:** picture `conicGraph` parabola opening right, vertex (−p, 0) (hidden),
  the point at θ on it. Values d, p (d ÷ 2), θ, r, x, y. Relations p = d ÷ 2;
  r = d ÷ (1 − cos θ) (θ not 0°); x = r cos θ; y = r sin θ. Example: d = 4: p = 2, vertex
  (−2, 0), directrix x = −4; θ = 90°: r = 4, the point (0, 4) (check: 4² = 8(0 + 2)).
- **~rotation — BUILD:** picture `unitCircle` (the angle θ from the x-axis to the x′-axis; a
  turned conic is a picture need). Values A, B (not 0), C, D (B² − 4AC), θ (0 to 90 °).
  Relations D = B² − 4AC (its note names the conic); 2θ = tan⁻¹(B ÷ (A − C)), plus 180° when
  negative (90° when A = C). Example: 4x² + 2xy + 2y² = 1: D = 4 − 32 = −28, an ellipse;
  2θ = tan⁻¹(2 ÷ 2) = 45°, θ = 22.5°.
- **Verdict:** 4 pages; 4 of 5 common items Solve.

### 16. m.12.partial-fractions — Partial fraction decomposition

- **Standard:** A-APR.7 (+) carried on; no CCSS code.
- **Textbooks:** OpenStax Precalculus 9.4, OpenStax Algebra and Trigonometry 11.4, Larson
  Precalculus 7.4.
- **Tests ask:** no released questions. Common items:

  | Item (our words)                                 | Page       | Mark                          |
  | ------------------------------------------------ | ---------- | ----------------------------- |
  | (5x + 1) ÷ ((x − 1)(x + 2)) as two fractions     | main       | Solves                        |
  | A repeated factor: (3x − 1) ÷ (x − 2)²           | ~repeated  | Solves                        |
  | A quadratic factor: … ÷ ((x − 1)(x² + 1))        | ~quadratic | Solves                        |
  | A number alone on top: 4 ÷ ((x − 1)(x + 3))      | none yet   | No (picture need; a ≠ 0 here) |
  | Top's degree at least the bottom's: divide first | none       | No (m.11 polynomial division) |

- **Main — BUILD `m.12.partial-fractions`:** picture `functionGraph` rational (the top's zero
  z hidden; the poles p and q, whose asymptotes are the two denominators). Values a (not 0),
  b, p, q (p ≠ q), A, B. Relations (cover-up) A = (ap + b) ÷ (p − q); B = (aq + b) ÷ (q − p).
  Assumptions: one fraction per linear factor; cover up (x − p) and put x = p to find A; check
  by adding the fractions back. Example: a = 5, b = 1, p = 1, q = −2: A = 6 ÷ 3 = 2,
  B = −9 ÷ (−3) = 3; 2(x + 2) + 3(x − 1) = 5x + 1. startWith: a, b, p, q.
- **~repeated — BUILD:** picture `functionGraph` rational (poles p, p). Values a (not 0), b, p,
  A, B. Relations A = a; B = ap + b (from ax + b = A(x − p) + B). Example: (3x − 1) ÷
  (x − 2)²: A = 3, B = 6 − 1 = 5.
- **~quadratic — BUILD:** picture `table` of f(x) at five x (the top's zeros can be complex,
  so no graph by zeros). Values a, b, c (top), p, k (x² + k, k > 0), A, B, C, x, y. Relations
  A = (ap² + bp + c) ÷ (p² + k); B = a − A; C = b + Bp; y = f(x). Example: (3x² − 2x + 3) ÷
  ((x − 1)(x² + 1)): A = 4 ÷ 2 = 2, B = 1, C = −1; check c = Ak − Cp = 2 + 1 = 3.
- **Verdict:** 3 pages; 3 of 5 common items Solve.

### 17. m.12.induction — Mathematical induction

- **Standard:** no CCSS code.
- **Textbooks:** Larson Precalculus 9.4 (mathematical induction, sums of powers).
- **Tests ask:** no released questions. Common items:

  | Item (our words)                          | Page     | Mark                         |
  | ----------------------------------------- | -------- | ---------------------------- |
  | Prove 1 + 2 + … + n = n(n + 1)/2          | main     | Partly (the step in numbers) |
  | Prove 1 + 3 + … + (2n − 1) = n²           | ~odd     | Partly                       |
  | Prove 1 + r + … + rⁿ⁻¹ = (rⁿ − 1)/(r − 1) | ~powers  | Partly                       |
  | The sum of the first n squares            | ~squares | Partly                       |
  | The parts of an induction proof, in order | ~steps   | Solves (sequence)            |

- **Main — BUILD `m.12.induction`:** picture `termsChart` arithmetic 1, 1 with the partial
  sums (up to 30 terms). Values n (1 to 30), S (n(n + 1)/2), a (the next term, n + 1), T
  (S + a), F ((n + 1)(n + 2)/2); T and F are worked out and agree: the inductive step in
  numbers. Assumptions: base case n = 1; if the formula holds at k, adding the next term k + 1
  gives (k + 1)(k + 2)/2; a table of cases is not a proof. Example: n = 4: S = 10, a = 5,
  T = 15, F = 5 × 6 ÷ 2 = 15. startWith: n.
- **~odd — BUILD:** `termsChart` arithmetic 1, 2. S = n², a = 2n + 1, T = S + a, F = (n + 1)².
  Example n = 5: 25 + 11 = 36 = 6².
- **~powers — BUILD:** `termsChart` geometric 1, r. Values r (2 to 10), n, S = (rⁿ − 1)/(r − 1),
  a = rⁿ, T, F. Example r = 2, n = 5: S = 31, a = 32, T = 63 = 2⁶ − 1.
- **~squares — BUILD:** `table` of S by n (no chart of squares). S = n(n + 1)(2n + 1)/6,
  a = (n + 1)², T, F. Example n = 3: S = 14, a = 16, T = 30, F = 4 × 5 × 9 ÷ 6 = 30.
- **~steps — BUILD (sequence):** base case, hypothesis, inductive step, conclusion.
- **Verdict:** 5 pages; a proof is written work, so the calculators check the step in numbers
  (Partly) and the sequence page orders the proof.

### 18. m.12.area-under-curve — Limits of sequences and the area under a curve

- **Standard:** no CCSS code; AP Precalculus previews it.
- **Textbooks:** Larson Precalculus 12.4 (limits at infinity, limits of sequences) and 12.5
  (the area problem).
- **Tests ask:** no released questions. Common items:

  | Item (our words)                                            | Page      | Mark   |
  | ----------------------------------------------------------- | --------- | ------ |
  | Area under y = x² from 0 to 3 with n rectangles, then n → ∞ | main      | Solves |
  | Area under a line with rectangles; check with a trapezoid   | ~line     | Solves |
  | The limit of aₙ = (3n + 1) ÷ (2n − 1)                       | ~sequence | Solves |

- **Main — BUILD `m.12.area-under-curve`:** picture `functionGraph` quadratic y = cx², the area
  from 0 to b shaded (the rectangles are a picture need). Values c (> 0), b (> 0), n (1 to
  1,000), w (b ÷ n), S (the right-endpoint sum), A (the exact area). Relations w = b ÷ n;
  S = c·w³·n(n + 1)(2n + 1) ÷ 6 (from Σi² = n(n + 1)(2n + 1)/6); A = cb³ ÷ 3. Example c = 1,
  b = 3, n = 6: w = 0.5, S = 0.125 × 6 × 7 × 13 ÷ 6 = 11.375, A = 9. startWith: c, b, n.
- **~line — BUILD:** `functionGraph` linear y = mx + k shaded from 0 to b. Values m, k, b, n,
  w, S, A. S = m·w²·n(n + 1) ÷ 2 + kb; A = mb² ÷ 2 + kb; a limit keeps y ≥ 0 on [0, b].
  Example m = 2, k = 1, b = 4, n = 8: w = 0.5, S = 18 + 4 = 22, A = 16 + 4 = 20 (a trapezoid
  with heights 1 and 9).
- **~sequence — BUILD:** `table` of aₙ at n = 1, 10, 100, 1,000, 10,000. Values p, q, r, s, n,
  a, L. Relations a = (pn + q) ÷ (rn + s); L = p ÷ r. Example (3n + 1) ÷ (2n − 1):
  a₁₀ = 31/19 ≈ 1.632, L = 1.5.
- **Verdict:** 3 pages; the common items Solve.

### 19. m.12.regression-inference — Inference for the slope of a regression line

- **Standard:** S-ID.8 carried on; AP Statistics unit 9. No textbook unit maps to it in
  CROSSWALK.md; OpenStax Statistics 12.4 (testing the correlation) and Larson–Farber 9.3 are the
  nearest.
- **Tests ask:** no released questions. Common items (AP style, from computer output):

  | Item (our words)                        | Page            | Mark   |
  | --------------------------------------- | --------------- | ------ |
  | Test H₀: β = 0 from b and SE_b          | main            | Solves |
  | A 95% confidence interval for the slope | ~interval       | Solves |
  | Is r = 0.6 with n = 18 significant?     | ~correlation    | Solves |
  | SE_b from s, sₓ and n                   | ~standard-error | Solves |

- **Main — BUILD `m.12.regression-inference`:** picture `normalCurve` (the null curve of b,
  mean 0 and spread SE_b, b marked; a t curve is need 1's interim, as on the t pages). Values b,
  E (SE_b), n, df (n − 2), t, P, α. Relations df = n − 2; t = b ÷ SE_b;
  P = 2(1 − tcdf(|t|, df)), the decision after it. Example b = 0.8, SE_b = 0.25, n = 20:
  t = 3.2, df = 18, P ≈ 0.0050: reject H₀ at 0.05. startWith: b, E, n, α.
- **~interval — BUILD:** `normalCurve` with the interval b ± E. Values b, SE_b, n, C, df, t⋆,
  E, L, U. Example: 95%, df 18: t⋆ ≈ 2.101, E ≈ 0.525, (0.275, 1.325).
- **~correlation — BUILD:** `normalCurve` (standard, t marked). Values r, n, df, t, P, α.
  t = r√(n − 2) ÷ √(1 − r²). Example r = 0.6, n = 18: t = 0.6 × 4 ÷ 0.8 = 3, df = 16,
  P ≈ 0.0085.
- **~standard-error — BUILD:** `normalCurve` as on the main page. Values s, sₓ, n, E, b, t, df,
  P, α. SE_b = s ÷ (sₓ√(n − 1)). Example s = 2, sₓ = 1.5, n = 10: SE_b = 2 ÷ 4.5 ≈ 0.4444;
  b = 1.2: t = 2.7, df = 8, P ≈ 0.027.
- **Verdict:** 4 pages; the common items Solve.

### 20. m.12.anova — Analysis of variance (ANOVA) and the F distribution

- **Standard:** no CCSS code (college statistics; AP Statistics does not test it).
- **Textbooks:** OpenStax Statistics unit 13 (13.1–13.4), Larson–Farber 10.3–10.4.
- **Tests ask:** no released questions. Common items:

  | Item (our words)                                    | Page           | Mark   |
  | --------------------------------------------------- | -------------- | ------ |
  | F and P from an ANOVA table (SS between and within) | main           | Solves |
  | Do three groups' means differ? (n, means, SDs)      | ~groups        | Solves |
  | A test of two variances                             | ~two-variances | Solves |
  | Which test fits the question?                       | ~which-test    | Solves |

- **Main — BUILD `m.12.anova`:** picture `table` of P by F at the page's df (the F curve is a
  picture need). Values k (groups), N (total), B (SS between), W (SS within), M₁ (MS between),
  M₂ (MS within), F, P, α. Relations M₁ = B ÷ (k − 1); M₂ = W ÷ (N − k); F = M₁ ÷ M₂;
  P = Fcdf(F, ∞, k − 1, N − k) (a phrase in `phrasesM12.ts`). Example k = 3, N = 15, B = 60,
  W = 72: M₁ = 30, M₂ = 6, F = 5; with df 2 and 12, P = (1 + 2F/12)⁻⁶ = (6/11)⁶ ≈ 0.0263:
  reject H₀ at 0.05. startWith: k, N, B, W, α.
- **~groups — BUILD:** picture `bars` (the three group means). Values n (each group), x̄₁–x̄₃
  (a group), s₁–s₃ (a group), M₁, M₂, F, P, α. Grand mean in the work; M₁ = nΣ(x̄ᵢ − x̄)² ÷ 2,
  M₂ = (s₁² + s₂² + s₃²) ÷ 3. Example n = 5, means 10, 14, 12, SDs 2, 3, 2: M₁ = 5 × 8 ÷ 2 =
  20, M₂ = 17/3, F ≈ 3.529, df 2 and 12, P ≈ 0.062: fail to reject at 0.05.
- **~two-variances — BUILD:** `table` of P by F. Values s₁, s₂, n₁, n₂, F (s₁² ÷ s₂², the
  larger on top), P (two-sided), α. Example s₁ = 6, s₂ = 4, n₁ = n₂ = 16: F = 2.25, df 15 and 15.
- **~which-test — BUILD (sort):** questions into one-way ANOVA, two-sample t, chi-square test
  of independence, t-test for the slope.
- **Verdict:** 4 pages; the common items Solve.

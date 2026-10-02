# Direction plan: higher education, Mathematics (5 courses, 26 topics)

Written from the brief, `src/data/taxonomy.ts` (`COURSES`, Math), `docs/MODULE_GUIDE.md`
("Standards"), `docs/LAYOUTS.md`, `docs/PICTURES.md` and the `types*.ts` picture specs,
`docs/EQUATION_INPUTS.md`, the pilot `he.math.calc-1#1` in `src/data/modules/college.ts` and the
model plans `docs/plans/s.11.md` and `docs/plans/m.12.md`. No college questions or textbooks are
in `research/` yet, so each topic lists the common textbook and exam question types in our own
words (part 4 plans the research that will check them). Textbook section numbers are from
memory of the open books named in part 4; the research chat confirms them. Every example below
is original and was worked by hand; nothing is copied from a textbook or problem set.

## Decisions

- **Ids.** A topic page is `<courseId>#<i>` (0-based, taxonomy order); a problem type is
  `<courseId>#<i>~<slug>`. Courses: `he.math.calc-1` (C1), `calc-2` (C2), `calc-3` (C3),
  `diff-eq` (DE), `linear-algebra` (LA). Pages go in `src/data/modules/college.ts`, split to
  `college/math.ts` when the file passes about 2,000 lines. Topic problem types do not exist in
  the app yet (`problemTypes()` takes a skill only): engine need **E1** gates all 93
  problem-type pages and is not repeated as a ⏳ on each.
- **Word rules.** The Grades 9–12 rules hold unchanged: sentences ≤ 35 words, ≤ 10 held values
  (derived values free; a matrix, a point or a vector typed as one group counts once, as
  `standards.test.ts` already does for matrix cells), the name first on every value ("Lower
  limit (a)"), 2–4 assumptions. Every page below fits. The test's `valueLimit` returns
  `undefined` for a course today, so E3 maps `he.` ids to the Grade 12 limits.
- **Notation.** The notation of OpenStax Calculus (Vols 1–3), Lebl's _Notes on Diffy Qs_ and
    Austin's _Understanding Linear Algebra_: f′(x) and dy/dx, f_x and ∂f/∂x, ∇f, D_u f, ∫ from a
    to b, Σ, ⟨a, b, c⟩ for vectors, [[a, b], [c, d]] for matrices, λ, rank, Nul A, Col A, det A,
    Aᵀ, A⁻¹, x̂, y″ + by′ + cy = 0, L{f} = F(s), u(t − c). Unicode sub- and superscripts (x₀, aₙ,
    eˣ). Angles: calculus and ODE pages work in radians (the harness default); vector angles and
    the polar and parametric pictures read degrees, as m.12 does, with the radian value derived
    where a derivative needs it.
- **Constants.** e and π only, in the relations. Applied pages: g = 9.8 m/s², water
  ρ = 1000 kg/m³ (ρg = 9800 N/m³), named in an assumption.
- **Units.** Pure pages are unitless. Applied pages (related rates, optimization, work,
  cooling, mixing, the damped spring) use SI from the registry (cm, m, cm³, m³, s, min, h, km/h,
  m/s, N, J, kg, °C, kg/m³). Missing units are fixed labels until **E10** adds them: N/m, N·s/m,
  m³/min, L/min, kg/L, 1/min (rate constants), °C/min.
- **How calculus is shown (the main decision).** The solver is numeric and has no symbolic
  algebra, so every calculator commits to a **family** whose derivative, antiderivative or
  solution is a closed form in its parameters (c·xⁿ, a cubic by its coefficients, x(x² + c)ⁿ,
  x·e^(kx), 1/((x − p)(x − q)), y′ + ky = c, a 2 × 2 matrix). The walkthrough writes the rule in
  letters, then the rule with the parameters put in as a **form line** ("V′(x) = 12x² − 240x +
  900"), then the numbers at the point, one stage a line, then the answer. The harness checks a
  form line by evaluating both sides at sample x (**E5**) and an integral line ("∫ from 1 to 3
  of (x² + 1) dx = 32/3") by quadrature (**E4**). The `how` names the rule (power rule, chain
  rule, by parts with u = x, dv = e^(kx) dx). A typed f(x) of the student's own is engine need
  **E13**: until then, "differentiate any function" items are Partly.
- **Answers that are words.** Converges or diverges, the damping regime, one/none/infinitely
  many solutions, saddle/node/spiral: a relation with cases (**E6**) gives a derived code value
  with named choices, and the step's `how` names the case.
- **Calculator or layout.** All 26 topic mains are calculators (each topic has a quantity
  model). 13 problem types are layouts: 10 sorts (`C1#0~end-behavior`, `C1#0~discontinuities`,
  `C2#0~which-method`, `C2#3~converge-diverge`, `C3#0~quadrics`, `C3#4~which-theorem`,
  `DE#0~classify`, `DE#3~phase-types`, `LA#0~forms`, `LA#1~subspace`) and 3 sequences
  (`C1#2~steps`, `C1#4~steps`, `DE#2~steps`). Sort cards are text in Unicode math, one right bin
  each; sequences have one right order. Layout pages need college layout data (**E2**).
  "No page": proofs (ε–δ proofs in general, the MVT proof, uniqueness theorems, the
  Cauchy–Schwarz inequality) stay in assumptions and `how` lines.
- **Equation inputs.** Rows for most pages (several steps, a picture, two directions). Templates:
  LA pages with a matrix use `[[…]]` today (H86); `DE#1~characteristic` uses
  `{a}y″ + {b}y′ + {c}y = 0` today; the integral pages (`C1#3`, `C1#4`, `C2#0`) take
  `∫_{a}^{b} ({p}x² + {q}x + {r}) dx = {I}` once **E11** draws ∫ with boxed limits (rows until
  then).
- **Overlap with m.12.** College pages do not rebuild Grade 12 pages; each lists its Refresh:
  `m.12.limits-intro` (limits by factoring, the secant), `m.12.area-under-curve` (Riemann sums),
  `m.12.partial-fractions`, `m.12.parametric`, `m.12.polar`, `m.11.series` (geometric series),
  `m.12.vectors-3d` (dot, cross, triple product, distance), `m.12.matrices` (3 × 3 systems,
  determinant, 2 × 2 inverse, Cramer), `m.12.matrix-transformations`.
- **Pilot.** `he.math.calc-1#1` (power and constant-multiple rules, `plot` with `tangentSlope`)
  stays as built: x (−3–3), c (−5–5), n (0–5 whole), f(x), f′(x); example c = 1, n = 2,
  x = 1.5 → f = 2.25, f′ = 3. When HE-math-P1 lands, move its picture to `functionGraph`
  `family: 'power'` with `tangent`, so every derivative page looks alike.
- **Ranges.** Parameter ranges are what textbooks use (coefficients −50–50, limits −100–100,
  degrees 0–8, N ≤ 1000 terms); a case the family can't take (a pole inside [a, b], n = −1 in
  the power rule for integrals, v = 0 in a quotient) is rejected with its reason.
- **Page count:** 26 main + 93 problem types = **119 pages**: 106 calculators (1 pilot kept),
  13 layouts; **42** marked ⏳ (a picture request in part 3; most name an interim picture).

`HE-math-Pn` is a picture request in part 3; `En` an engine need in part 4. "Interim" names the
existing picture a page ships with until its request is drawn.

## Course 1. he.math.calc-1 — Calculus I

Prerequisites: `m.12.limits-intro`, `m.11.unit-circle`, `m.11.exp-log-equations`. Textbooks:
OpenStax Calculus Vol. 1 (CV1) chapters 2–5, Active Calculus 1–4, CLP-1; AP Calculus AB is the
bridge level (Units 1–6, 8).

### C1#0 he.math.calc-1#0 — Limits and continuity

- **Textbooks:** CV1 2.2–2.5 (limits, limit laws, continuity, the precise definition), 4.6
  (limits at infinity); Active Calculus 1.2, 1.7; AP AB Unit 1.
- **Main — BUILD: a quotient at x = a, 0/0 or k/0.** f(x) = (x² + bx + c) ÷ (x − a). Values:
  point a (−10–10), b (−50–50), c (−50–50), top at a N (derived = a² + ab + c), limit L
  (derived), test point x, f(x). Relations: N = a² + ab + c; when N = 0, x² + bx + c =
  (x − a)(x + a + b) so L = 2a + b; when N ≠ 0 the one-sided limits are ±∞ (sign of N over the
  sign of x − a, E6). Assumptions: the limit is what f(x) approaches, not f(a); 0/0 means factor
  and cancel (allowed since x ≠ a); k/0 with k ≠ 0 means a vertical asymptote. Example:
  (x² + x − 6) ÷ (x − 2): N = 4 + 2 − 6 = 0 → (x − 2)(x + 3), L = 5; x = 1.9 gives 4.9,
  x = 2.01 gives 5.01. With c = −2: N = 4, so −∞ from the left, +∞ from the right.
  startWith a, b, c. Picture: `functionGraph` `family: 'rational', top: [1, 'b', 'c'],
poles: ['a']`, `limit: { x: 'a' }`, `at: { x, y }` (confirm the by-top family draws a hole
  when a zero meets the pole). Refresh `m.12.limits-intro`. Use line: "Use this for 'Find the
  limit of (x² + x − 6)/(x − 2) as x → 2.'"
- **~continuity — BUILD:** make a piecewise function continuous. f = mx + k for x < c,
  x² + d for x ≥ c. Values c, m, d, k (the one solved), left limit, f(c). Relation:
  mc + k = c² + d. Example: c = 2, m = 3, d = 1 → f(2) = 5, k = 5 − 6 = −1. Picture:
  `functionGraph` piecewise (linear '[)', quadratic) with the ends at c. Use line: "Use this for
  'Find k so that f(x) = 3x + k (x < 2), x² + 1 (x ≥ 2) is continuous.'"
- **~ivt — BUILD:** the intermediate value theorem and one bisection step for f = x³ + px + q.
  Values p, q, a, b, f(a), f(b), midpoint m, f(m) (derived). Example: x³ + x − 1 on [0, 1]:
  f(0) = −1, f(1) = 1, a root between; m = 0.5, f = −0.375, so the root is in [0.5, 1]. Picture:
  `functionGraph` polynomial `coefficients: [1, 0, 'p', 'q']`, marks zeros.
- **~special-trig — BUILD:** lim sin(kx) ÷ (mx) as x → 0 = k/m. Values k, m, L, x (test),
  ratio. Assumptions: x in radians; sin θ/θ → 1 (squeeze: cos θ ≤ sin θ/θ ≤ 1). Example k = 3,
  m = 2: L = 1.5; x = 0.1 → 1.4776, x = 0.01 → 1.49978. Picture: `table` sweeping x (0.1, 0.01,
  0.001, −0.01) for the ratio.
- **~epsilon-delta — BUILD (⏳ HE-math-P1 band):** for f = mx + b, δ = ε ÷ |m|. Values m, b, a,
  L (derived), ε, δ. Example: lim (3x − 1) at 2 = 5; ε = 0.06 → δ = 0.02. Picture: `functionGraph`
  linear with the ε band on y and the δ band on x.
- **~end-behavior — BUILD (sort):** bins "Limit 0", "Ratio of leading coefficients", "No finite
  limit". Sentence: "Compare the highest powers on top and bottom." Cards: (3x + 1)/(x² − 4);
  7/(x + 1); (x² + 1)/x⁵ (Limit 0); (5x² − x)/(2x² + 7); (6 − x)/(3x + 9); (4x³ − x)/(8x³ + 1)
  (Ratio); (x³ + 1)/(4x − 2); 2x⁴/(x³ + x) (No finite limit).
- **~discontinuities — BUILD (sort):** bins Removable, Jump, Infinite, Continuous. Cards:
  (x² − 4)/(x − 2) at 2; sin x / x at 0 (Removable); x + 1 for x < 1, 3 for x ≥ 1, at 1; the
  floor function at 1 (Jump); 1/(x − 3) at 3; tan x at π/2 (Infinite); |x| at 0; x² at 5
  (Continuous).
- **Answers:** limit by factoring — main Solves; one-sided limits at a pole — main Solves;
  continuity with a parameter — ~continuity Solves (Partly when k sits in both pieces); IVT
  existence — ~ivt Solves; sin(kx)/x — ~special-trig Solves; limits at infinity — ~end-behavior
  Solves (signs only); limit from a graph — Partly (no graph-reading page); ε–δ for a line —
  ~epsilon-delta Solves, for x² — No.
- **Verdict:** 7 pages (2 sorts, 1 ⏳).

### C1#1 he.math.calc-1#1 — Derivatives and differentiation rules

- **Textbooks:** CV1 3.1–3.9 (definition, rules, trig, chain, implicit, exp and log), 4.2
  (linear approximation), 4.8 (L'Hôpital); Active Calculus 1.3–2.8; AP AB Units 2–4.
- **Main — KEEP (pilot):** see Decisions. Use line: "Use this for 'Find the slope of
  y = 3x⁴ at x = −1.'"
- **~product-quotient — BUILD (⏳ HE-math-P18 grow):** the table item. Values at x = a: u, u′,
  v, v′ (each −1000–1000), product slope P′, quotient slope Q′ (derived). Relations:
  P′ = u′v + uv′; Q′ = (u′v − uv′) ÷ v² (v ≠ 0). Example: u(2) = 3, u′(2) = −1, v(2) = 4,
  v′(2) = 5 → P′ = −4 + 15 = 11, Q′ = (−4 − 15) ÷ 16 = −1.1875. Picture: a u-by-v rectangle
  growing by u′dt and v′dt strips (u, v > 0; a note otherwise). Use line: "Use this for 'f(2) = 3,
  f′(2) = −1, g(2) = 4, g′(2) = 5. Find (fg)′(2) and (f/g)′(2).'"
- **~chain — BUILD:** f(x) = (ax + b)ⁿ. Values a, b, n (1–8 whole), x, inner u, f, f′.
  Relations: u = ax + b; f = uⁿ; f′ = n·uⁿ⁻¹·a. Example: a = 2, b = 1, n = 3, x = 1 → u = 3,
  f = 27, f′ = 3 × 9 × 2 = 54. Picture: `functionGraph` polynomial by zeros (a: aⁿ derived,
  `zeros: [{ x: 'z', times: 'n' }]`, z = −b/a derived), `at`; P1 tangent later.
- **~trig — BUILD:** f = A sin(bx). Values A, b, x (rad), f, f′ = Ab cos(bx). Example: A = 2,
  b = 3, x = π/6 → f = 2, f′ = 6 cos(π/2) = 0 (the top). Picture: `functionGraph` sin a, b, at.
- **~exp — BUILD:** f = A·e^(kx); d/dx ln x = 1/x in an assumption. Values A, k, x, f,
  f′ = k·f. Example: A = 5, k = −0.2, x = 3 → f = 5e^(−0.6) = 2.744, f′ = −0.549. Picture:
  `functionGraph` exponential a, r.
- **~implicit — BUILD:** x² + y² = r² at (x₀, y₀). Values x₀, y₀, r (derived), slope m =
  −x₀ ÷ y₀ (y₀ ≠ 0), tangent intercept. Example: (3, 4) → r = 5, m = −0.75, tangent
  y = −0.75x + 6.25. Picture: `conicGraph` circle with `point` (P18 tangent later).
- **~linear-approx — BUILD (⏳ P1 tangent):** L(x) = f(a) + f′(a)(x − a) for f = √x. Values a,
  x, f(a), f′(a), L, true value, error. Example: a = 4, x = 4.1 → L = 2 + 0.1/4 = 2.025, √4.1 =
  2.02485, error 0.00015. Picture: `functionGraph` root with the tangent at a.
- **~lhopital — BUILD:** lim (e^(kx) − 1) ÷ (mx) as x → 0 = k/m (both 0, ratio of derivatives).
  Values k, m, L, x, ratio. Example: k = 2, m = 3 → 0.667; x = 0.01 → 0.6734. Picture: `table`
  sweeping x.
- **Answers:** power, product, quotient rules — pilot, ~product-quotient Solve; derivative from
  a table of values (AP FR staple) — ~product-quotient Solves, chain from a table — Partly
  (propose g(a), g′(a), f′(g(a)) values on ~chain); chain on a power — ~chain Solves; trig and
  exp derivatives — ~trig, ~exp Solve; implicit slope on a circle — ~implicit Solves, on another
  curve — No (E13); tangent line equation — ~implicit, ~linear-approx Solve; linearization —
  Solves; L'Hôpital on 0/0 — ~lhopital Solves for its family; derivative of an inverse function —
  No (propose `~inverse` after E13).
- **Verdict:** 8 pages (1 kept, 7 new; 2 ⏳).

### C1#2 he.math.calc-1#2 — Related rates and optimization

- **Textbooks:** CV1 4.1 (related rates), 4.3–4.5 (extrema, MVT, shape), 4.7 (optimization);
  Active Calculus 3.1–3.5; AP AB Units 4–5.
- **Main — BUILD: the open box.** Squares x cut from the corners of an s-by-s sheet. Values:
  sheet side s (1–500 cm), cut x (0 < x < s/2), volume V (cm³), slope V′(x) (cm³ per cm), best
  cut x* and largest volume V* (derived). Relations: V = x(s − 2x)²; V′ = (s − 2x)(s − 6x);
  x* = s/6; V* = 2s³/27. Assumptions: the sides fold up to height x; V′ = 0 at x = s/2 (no box)
  and x = s/6 (the largest); check the ends give V = 0. Example: s = 30 cm → V′ = 12x² − 240x +
  900, x* = 5 cm, V* = 5 × 20² = 2000 cm³ (x = 4 gives 1936). startWith s, x. Picture:
  `functionGraph` polynomial (a: 4, `zeros: [{ x: 0 }, { x: 'h', times: 2 }]`, h = s/2
  derived), marks extrema, `at: { x: 'x', y: 'V' }`. Use line: "Use this for 'Squares are cut
  from the corners of a 30 cm square sheet to make an open box. What cut gives the largest
  volume?'"
- **~fence — BUILD:** a field along a river, fence P on three sides. Values P (1–10⁴ m), side x,
  y = P − 2x, area A, best x* = P/4, A* = P²/8. Example: P = 400 m → x = 100, y = 200,
  A = 20,000 m². Picture: `functionGraph` quadratic factored (a: −2, p: 0, q: 'h'), vertex.
- **~extrema — BUILD:** f = x³ + bx² + cx + d. Values b, c, d, critical x₁, x₂, f(x₁), f(x₂),
  inflection xᵢ (derived). Relations: 3x² + 2bx + c = 0; second-derivative test f″ = 6x + 2b;
  xᵢ = −b/3. Example: x³ − 3x² − 9x + 5 → f′ = 3(x − 3)(x + 1); x = −1 max f = 10 (f″ = −12),
  x = 3 min f = −22 (f″ = 12), inflection at 1, f(1) = −6. Picture: `functionGraph` polynomial
  coefficients [1, 'b', 'c', 'd'], marks extrema.
- **~ladder — BUILD:** a ladder of length L slides. Values L, x (foot), y (top, derived),
  dx/dt, dy/dt = −x·(dx/dt) ÷ y. Example: L = 5 m, x = 3 m, dx/dt = 0.5 m/s → y = 4 m,
  dy/dt = −0.375 m/s. Picture: `rightTriangle` (a x, b y, c L); P16 rate arrows later.
- **~two-cars — BUILD:** two cars on perpendicular roads. Values x, y, D, x′, y′, D′ =
  (x·x′ + y·y′) ÷ D. Example: 30 km and 40 km out at 60 and 80 km/h → D = 50 km,
  D′ = (1800 + 3200) ÷ 50 = 100 km/h. Picture: `rightTriangle`.
- **~cone-tank — BUILD (⏳ P16 fill):** water into an upside-down cone. Values R, H, depth h,
  inflow dV/dt (m³/min), surface radius r = Rh/H, dh/dt = (dV/dt) ÷ (πr²). Example: R = 2 m,
  H = 4 m, 0.5 m³/min, h = 2 m → r = 1 m, dh/dt = 0.159 m/min. Picture: `curvedSolid` cone
  filled to h.
- **~steps — BUILD (sequence):** stages "Draw it and name the quantities", "Write the quantity
  to make largest or smallest", "Use the constraint to leave one variable", "Differentiate and
  set the derivative to 0", "Check the ends or the second derivative", "Answer with units".
- **Answers:** open box, fence, cheapest can — main, ~fence Solve, can — No (propose `~can`,
  r = ∛(V/2π)); local and absolute extrema of a cubic — ~extrema Solves (absolute on [a, b] —
  Partly, add the ends); ladder, two cars, cone tank — Solve; shadow of a walker — Partly (same
  similar-triangle model as ~cone-tank); MVT value c — No (not in the taxonomy; see below).
- **Verdict:** 7 pages (1 sequence, 1 ⏳).

### C1#3 he.math.calc-1#3 — Definite integrals and the Fundamental Theorem

- **Textbooks:** CV1 5.1–5.4 (Riemann sums, the definite integral, FTC, net change), 6.1 (area
  between curves); Active Calculus 4.1–4.4; AP AB Units 6, 8.
- **Main — BUILD: ∫ from a to b of (px² + qx + r) dx.** Values p, q, r (−50–50), limits a, b
  (−100–100), F(a), F(b), integral I (derived). Relations: F(x) = px³/3 + qx²/2 + rx;
  I = F(b) − F(a). Assumptions: F′ = f (FTC part 2); area below the axis counts negative; a > b
  flips the sign. Example: ∫ from 1 to 3 of (x² + 1) dx: F(3) = 9 + 3 = 12, F(1) = 4/3,
  I = 32/3 = 10.667. startWith p, q, r, a, b. Picture: `functionGraph` quadratic standard,
  `shade: { from: 'a', to: 'b' }` (P2 signed later). Use line: "Use this for 'Evaluate the
  integral of x² + 1 from 1 to 3.'"
- **~riemann — BUILD:** right sum of f = x² against the exact value. Values a, b, n (1–100),
  Δx, sum Sₙ, exact I, error. Example: [0, 2], n = 4 → Δx = 0.5, (0.25 + 1 + 2.25 + 4) × 0.5 =
  3.75; I = 8/3; error 1.083. Picture: `functionGraph` `riemann: { n, from, to, side: 'right',
sum }`. Refresh `m.12.area-under-curve`.
- **~accumulation — BUILD:** F(x) = ∫ from a to x of (mt + c) dt; F′(x) = mx + c (FTC part 1).
  Values m, c, a, x, F, F′. Example: m = 2, c = 1, a = 0, x = 3 → F = 9 + 3 = 12, F′ = 7.
  Picture: `functionGraph` linear shaded a to x (P5 area-function panel later).
- **~average-value — BUILD:** f_avg = I ÷ (b − a) and the c where f(c) = f_avg, for f = px².
  Example: x² on [0, 3] → I = 9, f_avg = 3, c = √3 = 1.732. Picture: `functionGraph` quadratic,
  `other` linear (m 0, b f_avg), `crossing`.
- **~motion — BUILD:** v = v₀ + at; displacement ∫v dt and distance ∫|v| dt, split at the turn.
  Example: v = −4 + 2t on [0, 5] → displacement 25 − 20 = 5 m; turn at t = 2; −4 then +9, so
  distance 13 m. Picture: `motionGraph` `kinematics: { view: 'velocity' }` (+ and − areas).
- **~area-between — BUILD:** line y = mx + c above y = x². Values m, c, crossings x₁, x₂, area
  A = (x₂ − x₁)³/6. Example: m = 1, c = 2 → x = −1, 2; A = ∫ from −1 to 2 of (x + 2 − x²) dx =
  27/6 = 4.5. Picture: `functionGraph` quadratic with `other` linear, `crossing` (P2 between
  later).
- **Answers:** evaluate a definite integral of a polynomial — main Solves; of other functions —
  Partly (E13); Riemann sums from a formula — ~riemann Solves, from a table — No (propose
  `~table-sum`); FTC part 1 — ~accumulation Solves for linear f, for F(x) = ∫ sin t dt — Partly;
  average value — Solves; displacement vs distance (AP FR staple) — ~motion Solves; area between
  a line and a parabola — Solves, two parabolas — Partly.
- **Verdict:** 6 pages.

### C1#4 he.math.calc-1#4 — u-substitution

- **Textbooks:** CV1 5.5–5.7 (substitution, exp and log integrals, inverse trig integrals);
  Active Calculus 5.3; AP AB Unit 6.
- **Main — BUILD (⏳ HE-math-P3 expr): ∫ from a to b of x(x² + c)ⁿ dx.** Values c (−10–10),
  n (0–6 whole), a, b, u(a), u(b), I. Relations: u = x² + c, du = 2x dx;
  I = [u^(n+1) ÷ (2(n + 1))] from u(a) to u(b). Assumptions: u is the inside and du is there (up
  to a constant); change the limits with u, or substitute back. Example: ∫ from 0 to 1 of
  x(x² + 1)³ dx: u from 1 to 2, I = ½ × (16 − 1) ÷ 4 = 15/8 = 1.875. startWith c, n, a, b.
  Picture: the integrand shaded over [a, b] (P3). Use line: "Use this for 'Evaluate ∫ from 0 to 1
  of x(x² + 1)³ dx.'"
- **~linear-inner — BUILD:** ∫ from a to b of (mx + c)ⁿ dx = [(mx + c)^(n+1) ÷ (m(n + 1))].
  Example: ∫ from 0 to 1 of (2x + 1)³ dx = (81 − 1) ÷ 8 = 10. Picture: `functionGraph` polynomial
  by zeros (a: mⁿ, zeros [{ x: −c/m, times: n }]), shade.
- **~log — BUILD:** the n = −1 case: ∫ from a to b of m ÷ (mx + c) dx = ln|mb + c| − ln|ma + c|.
  Example: ∫ from 1 to 3 of 2 ÷ (2x + 1) dx = ln 7 − ln 3 = 0.847. Picture: `functionGraph`
  rational (zeros [], poles [−c/m]), shade; rejects a pole inside [a, b].
- **~steps — BUILD (sequence):** "Pick u, the inside part", "Write du = u′ dx", "Rewrite the
  integral and its limits in u", "Integrate in u", "Evaluate between the new limits".
- **Answers:** definite and indefinite with a polynomial inside — main, ~linear-inner Solve
  (indefinite: the form line is the answer); ∫ sin x cos x, ∫ x e^(x²) — Partly (E13; one page
  per family is too many); ∫ m/(mx + c) — ~log Solves; inverse-trig results (∫ 1/(1 + x²)) — No.
- **Verdict:** 4 pages (1 sequence, 1 ⏳).

## Course 2. he.math.calc-2 — Calculus II

Prerequisite: `he.math.calc-1`. Textbooks: OpenStax Calculus Vol. 2 (CV2) chapters 2–3 and 5–7,
Active Calculus 5–8, CLP-2; AP Calculus BC (Units 6–10) is the bridge level.

### C2#0 he.math.calc-2#0 — Integration by parts, partial fractions, trig substitution

- **Textbooks:** CV2 3.1–3.5; Active Calculus 5.4–5.5; AP BC 6.11–6.12.
- **Main — BUILD (⏳ P3): ∫ from a to b of x·e^(kx) dx by parts.** Values k (−5–5, not 0), a,
  b, I. Relations: u = x, dv = e^(kx) dx; I = [e^(kx)(x/k − 1/k²)] from a to b. Assumptions:
  ∫u dv = uv − ∫v du; pick u to get simpler when differentiated (LIATE as a rule of thumb).
  Example: k = 1 on [0, 1] → [eˣ(x − 1)] = 0 − (−1) = 1; k = 2 → 2.097. startWith k, a, b.
  Use line: "Use this for 'Evaluate ∫ from 0 to 1 of x eˣ dx.'"
- **~parts-trig — BUILD (⏳ P3):** ∫ from 0 to b of x sin(kx) dx = [−x cos(kx)/k + sin(kx)/k²].
  Example: k = 1, b = π → π.
- **~partial-fractions — BUILD:** ∫ from a to b of 1 ÷ ((x − p)(x − q)) dx. Values p, q, A =
  1/(p − q), B = −A, a, b, I. Example: p = 1, q = −2 on [2, 3] → A = 1/3, B = −1/3;
  I = (1/3) ln(8/5) = 0.157. Picture: `functionGraph` rational (poles ['p', 'q']), shade; rejects
  a pole in [a, b]. Refresh `m.12.partial-fractions`.
- **~trig-sub — BUILD:** ∫ from 0 to b of √(r² − x²) dx with x = r sin θ = (b/2)√(r² − b²) +
  (r²/2) sin⁻¹(b/r): a triangle plus a sector. Values r, b (0–r), θ_b (derived), triangle,
  sector, I. Example: r = 2, b = 1 → 0.866 + 2 × π/6 = 1.913. Picture: `conicGraph` circle
  (P18 `under` shades the triangle and sector later).
- **~which-method — BUILD (sort):** bins By parts, Partial fractions, Trig substitution,
  u-substitution. Sentence: "Look for a product, a factored bottom, a √(a² ± x²) or an inside
  with its derivative." Cards: ∫ x eˣ dx; ∫ x² ln x dx; ∫ (2x + 1)/((x − 1)(x + 3)) dx;
  ∫ 1/(x(x + 4)) dx; ∫ √(4 − x²) dx; ∫ x²/√(9 − x²) dx; ∫ x(x² + 3)⁵ dx; ∫ sec²x tan x dx.
- **Answers:** by parts with x·eˣ, x sin x — Solve; ln x, eˣ sin x (twice) — No (E13);
  partial fractions with distinct linear factors — Solves, repeated or quadratic — Partly
  (`m.12.partial-fractions~repeated` does the algebra); trig sub with √(a² − x²) — Solves,
  √(x² + a²) — No; choosing the method — ~which-method Solves; trig integrals ∫ sinᵐ cosⁿ — No.
- **Verdict:** 5 pages (1 sort, 2 ⏳).

### C2#1 he.math.calc-2#1 — Improper integrals

- **Textbooks:** CV2 3.7; Active Calculus 6.5; AP BC 6.13.
- **Main — BUILD: ∫ from 1 to ∞ of 1/xᵖ dx.** Values p (0.1–5), cut-off b (1–10⁶), integral to
  b I_b, limit I (derived when p > 1; E6 "diverges" otherwise). Relations: I_b = (b^(1−p) − 1) ÷
  (1 − p) (ln b when p = 1); I = 1/(p − 1). Assumptions: an improper integral is the limit of
  ordinary ones; it converges only if that limit is a finite number. Example: p = 2, b = 10 →
  0.9, limit 1; p = 1 → ln 10 = 2.303 and growing. startWith p, b. Picture: `functionGraph`
  power (a 1, p −2p, q 2), shade 1 to b. Use line: "Use this for 'Does ∫ from 1 to ∞ of 1/x²
  dx converge? To what?'"
- **~near-zero — BUILD:** ∫ from 0 to 1 of 1/xᵖ dx converges when p < 1 to 1/(1 − p). Values
  p, ε, I_ε, I. Example: p = 0.5, ε = 0.01 → 1.8, limit 2.
- **~exponential — BUILD:** ∫ from 0 to ∞ of e^(−kx) dx = 1/k. Example: k = 0.5, b = 10 →
  1.987, limit 2. Picture: `functionGraph` exponential r −k, shade.
- **~comparison — BUILD:** ∫ from 1 to ∞ of 1/(x² + c²) dx = (1/c)(π/2 − tan⁻¹(1/c)) ≤ 1.
  Example: c = 1 → π/4 = 0.785 ≤ 1. Picture: `functionGraph` rational by top (top [1],
  quadratics [{ j: 0, k: c² }]) with `other` power 1/x², shade.
- **Answers:** p-integrals at ∞ and at 0 — Solve; e^(−kx) — Solves; comparison verdict —
  ~comparison Solves for its family, in general — Partly; ∫ 1/x from 0 to 1 diverges — ~near-zero
  Solves; a pole inside [a, b] (∫ from −1 to 1 of 1/x²) — Partly (the page rejects; propose a
  split version later).
- **Verdict:** 4 pages.

### C2#2 he.math.calc-2#2 — Volume, arc length and work

- **Textbooks:** CV1 6.2–6.5 (slicing, shells, arc length, physical applications); Active
  Calculus 6.2–6.4; AP AB/BC Unit 8.
- **Main — BUILD (⏳ HE-math-P6): disks for y = c·xᵐ about the x-axis on [0, b].** Values c
  (0.1–10), m (0.5–3), b, volume V = πc²b^(2m+1) ÷ (2m + 1). Assumptions: a slice at x is a disk
  of radius f(x); V = ∫ π f(x)² dx; m = 1 is a cone (V = πr²h/3). Example: y = √x, b = 4 →
  π × 16/2 = 8π = 25.13. startWith c, m, b. Interim: `functionGraph` power, shade. Use line:
  "Use this for 'The region under y = √x from 0 to 4 is turned about the x-axis. Find the
  volume.'"
- **~washer — BUILD (⏳ P6):** between y = kx and y = x² about the x-axis: V = 2πk⁵/15. Example:
  k = 1 → 0.419; k = 2 → 13.40.
- **~shells — BUILD (⏳ P6):** y = x(c − x) about the y-axis: V = ∫ 2πx f(x) dx = πc⁴/6.
  Example: c = 2 → 8.378.
- **~arc-length — BUILD:** y = c·x^(3/2) on [0, b]: L = (8/(27c²))[(1 + 9c²b/4)^(3/2) − 1].
  Example: c = 2/3, b = 3 → (2/3)(8 − 1) = 14/3 = 4.667. Picture: `functionGraph` power
  (a 'c', p 3, q 2).
- **~spring-work — BUILD:** W = ∫ kx dx = ½k(x₂² − x₁²). Values k (N/m), x₁, x₂, W (J).
  Example: k = 200 N/m, 0.1 m to 0.3 m → 8 J. Picture: `functionGraph` linear F = kx, shaded
  x₁ to x₂.
- **~pump-work — BUILD:** pump a full cylinder of radius r, height H, out over its top plus h.
  Values r, H, h, ρ (1000 kg/m³; 900 for oil), W = ρgπr²(H²/2 + hH). Example: r = 1 m,
  H = 2 m, h = 0 → 9800π × 2 = 61,575 J. Interim: `curvedSolid` cylinder (P16 slab later).
- **Answers:** disk and washer about an axis — Solve for their families; about another line —
  No (P6 axis option); shells — Solves; cross-sections of known shape — No (propose
  `~cross-sections`); arc length — Solves for its family; spring and pumping work — Solve; cone
  tank pumping, hydrostatic force, centroids — No (see Not in the taxonomy).
- **Verdict:** 6 pages (3 ⏳).

### C2#3 he.math.calc-2#3 — Sequences, series and convergence tests

- **Textbooks:** CV2 5.1–5.6; Active Calculus 8.1–8.3; AP BC Unit 10.
- **Main — BUILD: a p-series and the integral test's bounds.** Values p (0.5–5), terms N
  (1–1000), partial sum S_N, lower and upper bounds (derived). Relations: S_N = Σ from n = 1 to
  N of (1/nᵖ); S_N + 1/((p − 1)(N + 1)^(p−1)) ≤ S ≤ S_N + 1/((p − 1)N^(p−1)) when p > 1.
  Assumptions: terms positive and decreasing, so the integral test applies; p ≤ 1 diverges.
  Example: p = 2, N = 10 → S₁₀ = 1.5498; 1.6407 ≤ S ≤ 1.6498 (the sum is π²/6 = 1.6449).
  startWith p, N. Picture: `termsChart` type 'power' (first 1, step −p, count N, `sums`). Use
  line: "Use this for 'Estimate Σ 1/n² with 10 terms. How far off can it be?'"
- **~ratio — BUILD (⏳ HE-math-P17):** Σ n·rⁿ. Values r, N, a_N, a_(N+1), their ratio, limit
  L = |r|, sum S = r/(1 − r)² when |r| < 1. Example: r = 0.5, N = 5 → a₅ = 0.15625,
  a₆ = 0.09375, ratio 0.6; L = 0.5 < 1, S = 2.
- **~alternating — BUILD (⏳ P17):** Σ (−1)^(n+1)/nᵖ: error ≤ the next term. Example: p = 1,
  N = 9 → S₉ = 0.7456, bound 0.1; the sum ln 2 = 0.6931 is 0.0525 away.
- **~converge-diverge — BUILD (sort):** bins Converges, Diverges. Sentence: "Name the test that
  decides it." Cards: Σ 1/n²; Σ (2/3)ⁿ; Σ (−1)ⁿ/n; Σ 3ⁿ/n!; Σ 1/(n² + 1) (Converges);
  Σ 1/√n; Σ n/(n + 1); Σ n!/2ⁿ (Diverges).
- **Answers:** p-series and geometric verdicts — main, `m.11.series~infinite` Solve; integral
  test bound — Solves; ratio test — ~ratio Solves for n·rⁿ, others in the sort; alternating error
  bound (AP BC staple) — ~alternating Solves; comparison and limit comparison — ~converge-diverge
  Partly (the verdict, not the work); limit of a sequence — `m.12.limits-intro~infinity` (Refresh).
- **Verdict:** 4 pages (1 sort, 2 ⏳).

### C2#4 he.math.calc-2#4 — Taylor and power series

- **Textbooks:** CV2 6.1–6.4; Active Calculus 8.4–8.6; AP BC 10.11–10.15.
- **Main — BUILD (⏳ HE-math-P4): eˣ by its Maclaurin polynomial.** Values x (−5–5), degree n
  (0–12), Pₙ(x), eˣ, error, Lagrange bound (derived). Relations: Pₙ = Σ from k = 0 to n of
  (xᵏ/k!); bound = M|x|^(n+1)/(n + 1)!, M = e^max(x, 0). Example: x = 0.5, n = 3 → P = 1.645833,
  e^0.5 = 1.648721, error 0.002888 ≤ bound 0.004294. startWith x, n. Use line: "Use this for
  'Estimate e^0.5 with a third-degree Taylor polynomial and bound the error.'"
- **~sin-cos — BUILD (⏳ P4):** sin x or cos x (a named choice). Example: sin 1 with degree 5 →
  1 − 1/6 + 1/120 = 0.841667; error 0.000196 ≤ 1/7! = 0.000198.
- **~from-derivatives — BUILD (⏳ P4):** P₃ from f(a), f′(a), f″(a), f‴(a). Example: a = 1,
  values 2, −1, 4, 6, x = 1.2 → 2 − 0.2 + 0.08 + 0.008 = 1.888.
- **~radius — BUILD:** Σ (x − c)ⁿ ÷ (bⁿnᵖ): R = b by the ratio test; the ends by p (E6).
  Example: c = 2, b = 3, p = 1 → [−1, 5): alternating harmonic at −1, harmonic at 5. Picture:
  `integerLine` `compound` with each end closed or open.
- **~integrate-series — BUILD (⏳ P3, P4):** ∫ from 0 to b of e^(−x²) dx term by term. Example:
  b = 1, 5 terms → 1 − 1/3 + 1/10 − 1/42 + 1/216 = 0.74749; next term 1/1320 = 0.00076 bounds
  the error (true 0.74682).
- **Answers:** Maclaurin polynomial and error bound — main, ~sin-cos Solve; Taylor polynomial from
  given derivatives (AP FR staple) — ~from-derivatives Solves; interval of convergence — ~radius
  Solves for its family; series by substitution or integration — ~integrate-series Solves for
  e^(−x²); ln(1 + x) and 1/(1 − x) series — Partly (add to the ~sin-cos choice list).
- **Verdict:** 5 pages (4 ⏳).

### C2#5 he.math.calc-2#5 — Parametric and polar calculus

- **Textbooks:** CV2 7.1–7.4; AP BC Unit 9.
- **Main — BUILD: slope on x = a cos t, y = b sin t.** Values a, b (0.1–50), t (degrees),
  x, y, dx/dt, dy/dt (per radian), slope dy/dx (derived). Relations: dy/dx = (dy/dt) ÷ (dx/dt) =
  −(b/a) cot t. Assumptions: t in degrees on the picture, radians in the derivatives; vertical
  tangent where dx/dt = 0. Example: a = 3, b = 2, t = 45° → (2.121, 1.414), slope −0.667.
  startWith a, b, t. Picture: `polarGrid` `parametric` ellipse (h 0, k 0, a, b, t). Refresh
  `m.12.parametric`. Use line: "Use this for 'x = 3 cos t, y = 2 sin t. Find dy/dx at
  t = π/4.'"
- **~cycloid-arc — BUILD (⏳ HE-math-P15):** x = r(t − sin t), y = r(1 − cos t): length from 0
  to T = 4r(1 − cos(T/2)). Example: r = 1, T = 2π → 8.
- **~polar-area — BUILD:** r = a + b cos θ (a ≥ |b|): A = π(a² + b²/2). Example: a = b = 2 →
  6π = 18.85. Picture: `polarGrid` `curve` cardioid (P15 shading later).
- **~polar-slope — BUILD:** dy/dx = (r′ sin θ + r cos θ) ÷ (r′ cos θ − r sin θ), r′ = −b sin θ.
  Example: a = b = 1, θ = 90° → r = 1, r′ = −1, slope (−1) ÷ (−1) = 1. Picture: `polarGrid`
  `curve` cardioid with `point`.
- **Answers:** parametric slope and tangent — main Solves; speed and arc length — ~cycloid-arc
  Solves for its family; polar area — Solves (a petal of a rose — Partly, propose a rose
  choice); area between two polar curves — No; polar slope — Solves; vector-valued motion (AP BC
  Unit 9) — C3#0~helix.
- **Verdict:** 4 pages (1 ⏳).

## Course 3. he.math.calc-3 — Calculus III (Multivariable)

Prerequisites: `he.math.calc-2`, `m.12.vectors`. Textbooks: OpenStax Calculus Vol. 3 (CV3)
chapters 2–6, CLP-3 and CLP-4, Active Calculus Multivariable, MIT OCW 18.02.

### C3#0 he.math.calc-3#0 — Vectors and 3D geometry

- **Textbooks:** CV3 2.1–2.7, 3.1–3.4. Refresh `m.12.vectors-3d` (dot, cross, triple, distance).
- **Main — BUILD (⏳ HE-math-P8 plane): a plane by a point and a normal, and a point's
  distance.** Values: normal n = ⟨a, b, c⟩, point P₀, point Q (three groups), constant d,
  distance D (derived). Relations: d = ax₀ + by₀ + cz₀; D = |ax_Q + by_Q + cz_Q − d| ÷ |n|.
  Assumptions: every vector from P₀ in the plane is square to n; D is measured along n.
  Example: n = ⟨2, −1, 2⟩, P₀ = (1, 0, 3) → 2x − y + 2z = 8; Q = (3, 1, 4) → |6 − 1 + 8 − 8| ÷ 3
  = 5/3. startWith n, P₀, Q. Interim: `vectorDiagram` `space` with `points`. Use line: "Use this
  for 'Find the plane through (1, 0, 3) with normal ⟨2, −1, 2⟩, and the distance from (3, 1, 4).'"
- **~line — BUILD (⏳ P8):** r(t) = P₀ + tv and where it meets a plane. Example: P₀ = (1, 2, −1),
  v = ⟨2, 0, 3⟩, plane x + y + z = 10 → 2 + 5t = 10, t = 1.6, (4.2, 2, 3.8).
- **~helix — BUILD (⏳ P8):** r(t) = ⟨a cos t, a sin t, ct⟩: speed √(a² + c²), length over T,
  curvature a/(a² + c²). Example: a = 3, c = 4 → speed 5, one turn 10π = 31.42, κ = 0.12.
- **~quadrics — BUILD (sort):** bins Ellipsoid, Elliptic paraboloid, Hyperbolic paraboloid,
  Cone, Hyperboloid of one sheet, Hyperboloid of two sheets. Sentence: "Count the squared terms
  and their signs; a variable to the first power means a paraboloid." Cards: x² + y²/4 + z²/9 =
  1; 4x² + y² + 4z² = 16; z = x² + y²; x = y² + z²; z = y² − x²; z² = x² + y²;
  x² + y² − z² = 1; z² − x² − y² = 1.
- **Answers:** plane through a point, distance to a plane — main Solves; plane through three
  points — Partly (n from the cross product on `m.12.vectors-3d~cross`); line–plane meeting —
  ~line Solves; angle between planes — No (propose a value); quadric names — ~quadrics Solves;
  velocity, speed, arc length, curvature of a curve — ~helix Solves for the helix; cylindrical
  and spherical coordinates — No (propose `~coordinates`).
- **Verdict:** 4 pages (1 sort, 3 ⏳).

### C3#1 he.math.calc-3#1 — Partial derivatives and gradients

- **Textbooks:** CV3 4.3–4.8; MIT 18.02 part II.
- **Main — BUILD (⏳ HE-math-P7): f = ax² + bxy + cy² + dx + ey at (x₀, y₀).** Values
  coefficients a–e (a group), x₀, y₀, f, f_x, f_y, |∇f| (derived). Relations: f_x = 2ax + by +
  d; f_y = bx + 2cy + e; |∇f| = √(f_x² + f_y²); tangent plane z = f + f_x(x − x₀) + f_y(y − y₀).
  Assumptions: f_x holds y fixed; ∇f points uphill fastest and is square to the level curve.
  Example: f = x² + xy + 2y² at (1, 2) → f = 11, f_x = 4, f_y = 9, |∇f| = √97 = 9.849.
  startWith the coefficients, x₀, y₀. Use line: "Use this for 'f(x, y) = x² + xy + 2y². Find the
  gradient and the tangent plane at (1, 2).'"
- **~directional — BUILD:** D_u f = ∇f · u, u = ⟨p, q⟩ ÷ |⟨p, q⟩|. Values f_x, f_y, p, q, u,
  D_u f, the largest rate |∇f|. Example: ∇f = ⟨4, 9⟩, toward ⟨3, 4⟩ → 2.4 + 7.2 = 9.6 ≤ 9.849.
  Picture: `vectorDiagram` two vectors with `angle: { value, dot }`.
- **~chain — BUILD (⏳ HE-math-P19):** dz/dt = f_x·x′ + f_y·y′. Example: f_x = 4, f_y = 9,
  x′ = 2, y′ = −1 → 8 − 9 = −1. Picture: a chain-rule tree.
- **~extrema — BUILD (⏳ P7):** critical point of the quadratic and D = 4ac − b². Example:
  x² + xy + y² − 3x → 2x + y = 3, x + 2y = 0 → (2, −1); D = 3 > 0, a > 0: minimum f = −3.
- **~lagrange — BUILD:** largest xy with px + qy = k: x = k/2p, y = k/2q, λ = k/(2pq). Example:
  2x + 4y = 400 → x = 100, y = 50, xy = 5000, λ = 25. Picture: `functionGraph` rational (a 'M',
  poles [0]) with `other` linear (the constraint), `crossing` (the level curve touching it).
- **Answers:** partials, gradient, tangent plane — main Solves for quadratics, for eˣʸ or
  sin(xy) — No (E13); directional derivative and steepest direction — Solves; chain rule from
  given partials — ~chain Solves; classify critical points — ~extrema Solves; Lagrange with a
  linear constraint — Solves, on a circle — No (propose a second family); linear approximation
  — main (the tangent plane) Solves.
- **Verdict:** 5 pages (3 ⏳).

### C3#2 he.math.calc-3#2 — Multiple integrals

- **Textbooks:** CV3 5.1–5.7.
- **Main — BUILD (⏳ P7 region): ∬ over [a, b] × [c, d] of (pxy + q) dA as an iterated
  integral.** Values p, q, a, b, c, d, inner result, I, average (derived). Relations:
  I = p(b² − a²)(d² − c²)/4 + q(b − a)(d − c); average = I ÷ area. Assumptions: Fubini — either
  order gives I; the inner integral holds x fixed. Example: ∫ from 0 to 2 ∫ from 0 to 3 of
  (xy + 1) dy dx → inner 4.5x + 3, I = 9 + 6 = 15, average 2.5. startWith p, q, a, b, c, d.
  Interim: `table` sweeping the box count. Use line: "Use this for 'Evaluate ∫ from 0 to 2
  ∫ from 0 to 3 of (xy + 1) dy dx.'"
- **~region — BUILD:** ∬ x dA between y = x² and y = kx = k⁴/12. Example: k = 1 → 1/12; k = 2 →
  4/3. Picture: `functionGraph` quadratic with `other` linear, `crossing` (P2 strip later).
- **~polar — BUILD (⏳ P15 region):** ∬ (x² + y²) dA over r₁ ≤ r ≤ r₂, α ≤ θ ≤ β =
  (β − α)(r₂⁴ − r₁⁴)/4 (dA = r dr dθ). Example: 1 ≤ r ≤ 2, full turn → 7.5π = 23.56.
- **~mass — BUILD:** a box L × W × H with density rising from 0 at the bottom to ρ_top:
  m = ρ_top·LWH/2, z̄ = 2H/3. Example: 2 × 3 × 4 m, 600 kg/m³ → 7200 kg, z̄ = 2.667 m.
  Picture: `vectorDiagram` `space` with `w` (the box of three edges).
- **Answers:** iterated integral over a rectangle — main Solves; over a type I region — ~region
  Solves for its family; reversing the order — Partly (the steps show both); polar area and
  integrals — ~polar Solves; mass and center of mass — ~mass Solves; triple integrals in
  cylindrical or spherical coordinates — No (propose `~sphere`, V = 4πR³/3 with ρ²sin φ);
  Jacobian change of variables — No.
- **Verdict:** 4 pages (2 ⏳).

### C3#3 he.math.calc-3#3 — Line and surface integrals

- **Textbooks:** CV3 6.1–6.3, 6.6.
- **Main — BUILD (⏳ HE-math-P9): work of F = ⟨αx + βy, γx + δy⟩ along a segment A to B.**
  Values field coefficients (a group), A, B (groups), midpoint M, W (derived). Relations:
  W = ∫ from 0 to 1 of F(r(t)) · (B − A) dt = F(M) · (B − A) (F is linear). Assumptions: r(t) =
  A + t(B − A); reversing the path flips the sign. Example: F = ⟨−y, x⟩ from (1, 0) to (0, 1) →
  F(M) = ⟨−0.5, 0.5⟩, B − A = ⟨−1, 1⟩, W = 1. startWith the field, A, B. Use line: "Use this for
  'Find the work done by F = ⟨−y, x⟩ along the segment from (1, 0) to (0, 1).'"
- **~conservative — BUILD (⏳ P9):** F = ∇φ, φ = ax² + bxy + cy²: W = φ(B) − φ(A) on any path;
  test P_y = Q_x. Example: φ = x² + 3xy from (0, 0) to (1, 2) → 7.
- **~flux — BUILD (⏳ P8):** F = k⟨x, y, z⟩ out of a sphere of radius R: F·n = kR, Φ = 4πkR³.
  Example: k = 1, R = 2 → 32π = 100.5.
- **~wire-mass — BUILD:** ∫ f ds along a segment for f = αx + βy + γ = length × f(midpoint).
  Example: (0, 0) to (3, 4), f = x + y → 5 × 3.5 = 17.5. Picture: `coordinatePlane` `segment`.
- **Answers:** work along a segment — main Solves, along a parabola or circle — Partly (Green's
  page does the circle); path independence and potential — ~conservative Solves; flux through a
  sphere — Solves, through a graph surface — No; mass of a wire — Solves; surface area of a graph
  — No (propose `~surface-area` for a plane patch).
- **Verdict:** 4 pages (3 ⏳).

### C3#4 he.math.calc-3#4 — Green's, Stokes' and Divergence theorems

- **Textbooks:** CV3 6.4–6.5, 6.7–6.8.
- **Main — BUILD (⏳ P9): Green's theorem for F = ⟨−y², x²⟩ on [0, a] × [0, b].** Values a, b,
  the four side integrals, circulation, double integral (derived). Relations: ∮ F · dr =
  ∬ (Q_x − P_y) dA = ∬ (2x + 2y) dA = ab(a + b). Assumptions: counterclockwise boundary; Q_x − P_y
  is the circulation per unit area. Example: a = 2, b = 1 → sides 0, 4, 2, 0, total 6 =
  2 × 1 × 3. startWith a, b. Use line: "Use this for 'Use Green's theorem to find the
  circulation of ⟨−y², x²⟩ around the rectangle 0 ≤ x ≤ 2, 0 ≤ y ≤ 1.'"
- **~divergence — BUILD:** F = ⟨x², y², z²⟩ out of a box a × b × c: ∭ (2x + 2y + 2z) dV =
  abc(a + b + c). Example: unit cube → 3 (each pair of faces gives 1). Picture: `vectorDiagram`
  `space` with `w` (the box).
- **~stokes — BUILD (⏳ P8):** F = k⟨−y, x, 0⟩ around a circle of radius R: curl F = ⟨0, 0, 2k⟩,
  so the flux of the curl is 2kπR² for any surface with that edge. Example: k = 1, R = 3 → 18π.
- **~which-theorem — BUILD (sort):** bins Fundamental theorem for line integrals, Green's,
  Stokes', Divergence. Cards: work of ∇φ from A to B; circulation of ∇φ round any loop
  (Fundamental); circulation round a closed curve in the plane; area inside a plane curve from
  a line integral (Green's); circulation round a loop in space as a flux of the curl;
  circulation round the rim of a hemisphere (Stokes'); flux out of a closed surface; flux out of
  a sphere from ∭ div F (Divergence).
- **Answers:** Green's on a rectangle — Solves, on a disk — Partly (the ~stokes circle in the
  plane); area by a line integral — No (propose `~area`, A = ½∮(x dy − y dx) for an ellipse);
  divergence theorem on a box — Solves; Stokes' with a circle — Solves; which theorem — Solves.
- **Verdict:** 4 pages (1 sort, 2 ⏳).

## Course 4. he.math.diff-eq — Differential Equations

Prerequisite: `he.math.calc-2`. Textbooks: Lebl, _Notes on Diffy Qs_ (LDQ); Trench, _Elementary
Differential Equations_; CV2 chapter 4 and CV3 chapter 7; MIT OCW 18.03.

### DE#0 he.math.diff-eq#0 — First-order ODEs

- **Textbooks:** LDQ 1.1–1.8 (slope fields, separable, linear, autonomous, Euler, exact); CV2
  4.1–4.5; AP BC Unit 7.
- **Main — BUILD: Newton's law of cooling, dT/dt = −k(T − Tₐ).** Values: room temperature Tₐ
  (−50–300 °C), start T₀, rate constant k (0.0001–10 per min), time t (0–10⁴ min), temperature
  T. Relations: T = Tₐ + (T₀ − Tₐ)e^(−kt); k = −ln((T − Tₐ) ÷ (T₀ − Tₐ)) ÷ t. Assumptions: the
  room stays at Tₐ; separable: ∫dT/(T − Tₐ) = −∫k dt; T approaches Tₐ and never crosses it.
  Example: Tₐ = 20 °C, T₀ = 90 °C, k = 0.1/min, t = 10 min → 20 + 70e^(−1) = 45.75 °C.
  startWith Tₐ, T₀, k, t. Picture: `functionGraph` exponential (a: T₀ − Tₐ, r: −k, k: Tₐ
  derived), `at`. Use line: "Use this for 'Coffee at 90 °C cools in a 20 °C room with k = 0.1 per
  minute. What is its temperature after 10 minutes?'"
- **~logistic — BUILD:** dP/dt = rP(1 − P/K). Values K, P₀, r, t, P. Relation:
  P = K ÷ (1 + Ae^(−rt)), A = (K − P₀)/P₀. Example: K = 1000, P₀ = 100, r = 0.5, t = 4 → A = 9,
  P = 450.9. Picture: `functionGraph` `logistic` (K, start, r).
- **~euler — BUILD (⏳ P9 slope):** y′ = ax + by + c, h, n steps (≤ 10) against the exact
  solution. Example: y′ = x + y, y(0) = 1, h = 0.1 → 1.1, then 1.22; exact 2e^0.2 − 1.2 = 1.2428.
- **~mixing — BUILD:** A′ = r·c_in − (r/V)A. Values V (L), r (L/min), c_in (kg/L), A₀, t, A =
  V·c_in + (A₀ − V·c_in)e^(−rt/V). Example: 100 L, 5 L/min, 0.2 kg/L, A₀ = 0, t = 20 →
  20(1 − e^(−1)) = 12.64 kg. Picture: `functionGraph` exponential approach.
- **~linear — BUILD (⏳ P3):** y′ + ky = mx + b by an integrating factor: y = (m/k)x + (b/k −
  m/k²) + Ce^(−kx). Example: y′ + 2y = 4x, y(0) = 1 → y = 2x − 1 + 2e^(−2x); y(1) = 1.271.
- **~classify — BUILD (sort):** bins Separable only, Linear only, Separable and linear, Neither.
  Cards: y′ = xy²; y′ = eˣ⁺ʸ (Separable only); y′ + 2y = eˣ; y′ = x + y (Linear only);
  y′ = y sin x; y′ = 3y (both); y′ = x² + y²; y′ = y² + x (Neither).
- **Answers:** cooling and growth with data (find k) — main Solves; logistic — Solves; Euler's
  method (AP BC) — ~euler Solves; mixing tank — Solves; linear by integrating factor — ~linear
  Solves for its family; separable in general (y′ = x/y) — Partly (E13); slope field matching —
  No (propose a sort of fields once P9 has a card figure); exact equations — No.
- **Verdict:** 6 pages (1 sort, 2 ⏳).

### DE#1 he.math.diff-eq#1 — Second-order linear ODEs

- **Textbooks:** LDQ 2.1–2.6; CV3 7.1–7.3.
- **Main — BUILD (⏳ HE-math-P10): a mass on a spring with damping, my″ + cy′ + ky = 0.**
  Values m (kg), c (N·s/m), k (N/m), y₀ (m), v₀ (m/s), discriminant c² − 4mk, regime (E6),
  roots or α ± βi (E7), t, y(t) (derived). Relations: mr² + cr + k = 0; underdamped:
  y = e^(αt)(C₁ cos βt + C₂ sin βt), α = −c/2m, β = √(4mk − c²)/2m, C₁ = y₀,
  C₂ = (v₀ − αy₀)/β; the other two regimes by their forms. Assumptions: linear spring and
  damper; c² < 4mk oscillates, = 4mk is critical, > 4mk creeps back. Example: m = 1, c = 2,
  k = 10, y₀ = 1, v₀ = 0 → r = −1 ± 3i, y = e^(−t)(cos 3t + ⅓ sin 3t), y(1) = −0.347 m.
  startWith m, c, k, y₀, v₀. Use line: "Use this for 'A 1 kg mass on a 10 N/m spring with
  damping 2 N·s/m is pulled 1 m and let go. Where is it after 1 s?'"
- **~characteristic — BUILD:** ay″ + by′ + cy = 0 → roots and the general solution's form.
  Equation `{a}y″ + {b}y′ + {c}y = 0`. Example: y″ − 5y′ + 6y = 0 → r = 2, 3,
  y = C₁e^(2t) + C₂e^(3t). Picture: `functionGraph` quadratic standard in r with zeros.
- **~resonance — BUILD:** y″ + by′ + cy = A cos ωt: steady amplitude A ÷ √((c − ω²)² + (bω)²).
  Example: b = 0.5, c = 4, A = 1 → ω = 2 gives 1, ω = 1 gives 0.329. Picture: `table` sweeping ω
  with `graph: { best: 'max' }`.
- **Answers:** characteristic equation in all three cases — ~characteristic Solves; IVP with a
  damped spring — main Solves; undetermined coefficients with polynomial forcing — No (propose
  `~polynomial-forcing`, y_p = (m/c)t + n/c − bm/c²); resonance and amplitude — Solves; RLC
  circuit — main (same equation; the engineering pages own it); variation of parameters — No.
- **Verdict:** 3 pages (1 ⏳).

### DE#2 he.math.diff-eq#2 — Laplace transforms

- **Textbooks:** LDQ 6.1–6.4.
- **Main — BUILD (⏳ P3): y′ + ky = A·u(t − τ), y(0) = y₀ by transforms.** Values k, A, τ, y₀,
  t, y. Relations: Y = y₀/(s + k) + Ae^(−τs) ÷ (s(s + k)); y = y₀e^(−kt) +
  (A/k)(1 − e^(−k(t−τ)))u(t − τ). Assumptions: L{y′} = sY − y₀; e^(−τs) shifts by τ; u is 0
  before τ. Example: k = 0.5, A = 2, τ = 2, y₀ = 1, t = 4 → e^(−2) + 4(1 − e^(−1)) = 2.664.
  startWith k, A, τ, y₀, t. Use line: "Use this for 'Solve y′ + 0.5y = 2u(t − 2), y(0) = 1, by
  the Laplace transform.'"
- **~transform — BUILD:** L{c·tⁿe^(at)} = c·n! ÷ (s − a)^(n+1) (s > a). Example: 3t²e^(2t) →
  6/(s − 2)³; at s = 4, 0.75. Picture: `table` sweeping s.
- **~inverse — BUILD (⏳ P3):** Y = (ps + q) ÷ ((s − r₁)(s − r₂)) → Ae^(r₁t) + Be^(r₂t),
  A = (pr₁ + q)/(r₁ − r₂). Example: (s + 3)/((s + 1)(s + 2)) → 2e^(−t) − e^(−2t); y(1) = 0.600.
- **~steps — BUILD (sequence):** "Take the transform of both sides", "Put in the initial
  values", "Solve for Y(s)", "Split Y(s) into partial fractions", "Read each term's inverse from
  the table".
- **Answers:** transform from the table — Solves; inverse by partial fractions — Solves for
  distinct real poles, complex poles — No; IVP with a step input — main Solves; second-order IVP
  by Laplace — Partly (~inverse with the main's equation of DE#1); convolution, delta — No.
- **Verdict:** 4 pages (1 sequence, 2 ⏳).

### DE#3 he.math.diff-eq#3 — Systems of ODEs

- **Textbooks:** LDQ 3.1–3.9, 8.1–8.2.
- **Main — BUILD (⏳ P9 phase): x′ = Ax for a 2 × 2 A.** Values A (a group), trace T, det D,
    T² − 4D, λ₁, λ₂ (or α ± βi), eigenvectors, type (E6). Assumptions: the type comes from T and
    D (saddle D < 0; node or spiral by T² − 4D; stable when T < 0); straight-line solutions run
    along eigenvectors. Example: A = [[1, 2], [2, 1]] → T = 2, D = −3: saddle, λ = 3 along ⟨1, 1⟩,
    −1 along ⟨1, −1⟩. startWith A. Use line: "Use this for 'Classify the equilibrium of
    x′ = x + 2y, y′ = 2x + y.'"
- **~solution — BUILD (⏳ P9):** x(t) = c₁e^(λ₁t)v₁ + c₂e^(λ₂t)v₂ from x(0). Example: x(0) =
  ⟨3, 1⟩ → c₁ = 2, c₂ = 1; at t = 0.5, (9.570, 8.357).
- **~phase-types — BUILD (sort):** bins Saddle, Stable node, Unstable node, Stable spiral,
    Unstable spiral, Center. Cards: [[1, 2], [2, 1]]; [[0, 1], [1, 0]] (Saddle); [[−2, 0], [0, −3]];
    [[−3, 1], [0, −1]] (Stable node); [[1, 0], [0, 2]] (Unstable node); [[−1, −2], [2, −1]]
    (Stable spiral); [[1, −1], [1, 1]] (Unstable spiral); [[0, 1], [−4, 0]] (Center).
- **~predator-prey — BUILD (⏳ P9):** x′ = αx − βxy, y′ = −γy + δxy: equilibrium (γ/δ, α/β),
  small-cycle period 2π/√(αγ). Example: α = 1, β = 0.5, γ = 0.75, δ = 0.25 → (3, 2), 7.26.
- **Answers:** eigenvalue method with real eigenvalues — main, ~solution Solve; complex
    eigenvalues (spiral solution) — Partly (the type, not x(t)); classify equilibria — Solves;
    second-order equation as a system — Partly (A = [[0, 1], [−k/m, −c/m]] typed on main);
    linearize a nonlinear system — ~predator-prey Solves for Lotka–Volterra.
- **Verdict:** 4 pages (1 sort, 3 ⏳).

### DE#4 he.math.diff-eq#4 — Series solutions

- **Textbooks:** LDQ 7.1–7.3; CV3 7.4.
- **Main — BUILD (⏳ P4): y″ + ω²y = 0 by a power series.** Values ω, a₀ = y(0), a₁ = y′(0),
  degree N (2–20), x, S_N, exact y, error (derived). Relations: a_(n+2) = −ω²aₙ ÷ ((n + 2)(n + 1));
  exact a₀ cos ωx + (a₁/ω) sin ωx. Assumptions: y = Σ aₙxⁿ; matching powers gives the recurrence;
  the even terms build cos, the odd sin. Example: ω = 1, a₀ = 1, a₁ = 0, N = 6, x = 1 →
  1 − 1/2 + 1/24 − 1/720 = 0.540278, cos 1 = 0.540302. startWith ω, a₀, a₁, N, x. Use line:
  "Use this for 'Find the series solution of y″ + y = 0 with y(0) = 1, y′(0) = 0.'"
- **~airy — BUILD (⏳ P3, P4):** y″ = xy: a₂ = 0, a_(n+2) = a_(n−1) ÷ ((n + 2)(n + 1)). Example:
  a₀ = 1, a₁ = 0 → 1 + x³/6 + x⁶/180; at x = 1, 1.1722.
- **Answers:** recurrence and first terms — Solve for both families; radius from singular
  points — No (propose a value on main: R = distance to the nearest singular point);
  Frobenius at a regular singular point — No (not common in a first course; leave out).
- **Verdict:** 2 pages (2 ⏳).

## Course 5. he.math.linear-algebra — Linear Algebra

Prerequisite: `m.12.matrices`. Textbooks: Austin, _Understanding Linear Algebra_ (ULA); Hefferon,
_Linear Algebra_; Beezer, _A First Course in Linear Algebra_; MIT OCW 18.06.

### LA#0 he.math.linear-algebra#0 — Row reduction

- **Textbooks:** ULA 1.1–1.4; Hefferon One.I–III; 18.06 lectures 1–8.
- **Main — BUILD: one, none or infinitely many solutions of a 3 × 3 system.** Values: the
  augmented matrix (a 3 × 4 group), rank A, rank [A | b], free variables, a particular solution
  and a direction (derived). Relations: row reduction to reduced echelon form; consistent when
  rank A = rank [A | b]; free variables = 3 − rank A (E6 names the case). Assumptions: row
  operations keep the solutions; a row 0 = nonzero means none; each free variable adds a
  direction. Example: x + y + z = 6, 2x + 3y + z = 11, 3x + 4y + 2z = 17 → rank 2 = 2, one free
  variable: (x, y, z) = (7, −1, 0) + z(−2, 1, 1); with 18 for 17 → no solution. startWith the
  matrix. Picture: `matrixGrid` `rowReduce`, `steps: 'reduced'`; equation `[[…]]` with the bar.
  Refresh `m.12.matrices`. Use line: "Use this for 'Solve x + y + z = 6, 2x + 3y + z = 11,
  3x + 4y + 2z = 17. Is there one solution, none or infinitely many?'"
- **~inverse — BUILD (⏳ HE-math-P11):** [A | I] → [I | A⁻¹] for 3 × 3. Example: A = [[2, 1, 0],
    [1, 1, 0], [0, 0, 3]] → A⁻¹ = [[1, −1, 0], [−1, 2, 0], [0, 0, 1/3]].
- **~lu — BUILD:** A = LU, L holding the multipliers. Example: [[2, 1, 1], [4, 3, 3], [8, 7, 9]] →
    multipliers 2, 4, 3; U = [[2, 1, 1], [0, 1, 1], [0, 0, 2]]. Picture: `matrixGrid` `multiply`
    (L × U = A).
- **~forms — BUILD (sort):** bins Reduced echelon form, Echelon form only, Not echelon form.
    Cards: [[1, 0, 3], [0, 1, −2]]; [[1, 0, 0], [0, 0, 1], [0, 0, 0]]; [[1, 7, 0, 2], [0, 0, 1, 5]]
    (Reduced); [[1, 2, 5], [0, 1, 4]]; [[2, 4, 1], [0, 3, 6], [0, 0, 5]]; [[1, 0, 4], [0, 2, 0]]
    (Echelon only); [[0, 1, 2], [1, 0, 3]]; [[1, 3, 0], [0, 0, 0], [0, 0, 1]] (Not).
- **Answers:** solve by row reduction, parametric solution — main Solves; consistency with a
  parameter k — Partly (type k in a cell and read the case); inverse by Gauss–Jordan — ~inverse
  Solves; LU — Solves; echelon forms — Solves; network or chemical-balance applications — Partly
  (same main page with the student's matrix).
- **Verdict:** 4 pages (1 sort, 1 ⏳).

### LA#1 he.math.linear-algebra#1 — Vector spaces and subspaces

- **Textbooks:** ULA 2.2–2.4, 3.2, 3.5; Hefferon Two.
- **Main — BUILD: rank, nullity and a basis of Nul A for a 3 × 4 matrix.** Values A (a group),
    rank r, dim Col A, dim Nul A = 4 − r, null basis (derived). Relations: reduced echelon form;
    r = number of pivots; rank + nullity = number of columns. Assumptions: the pivot columns of A
    are a basis of Col A; each free variable gives one null vector. Example: [[1, 2, 0, 1],
    [2, 4, 1, 4], [3, 6, 1, 5]] → [[1, 2, 0, 1], [0, 0, 1, 2], [0, 0, 0, 0]]: r = 2, nullity 2,
    basis ⟨−2, 1, 0, 0⟩, ⟨−1, 0, −2, 1⟩. startWith A. Picture: `matrixGrid` `rowReduce`
  `steps: 'reduced'`. Use line: "Use this for 'Find a basis for the null space and the rank of
    A.'"
- **~independence — BUILD:** three vectors in ℝ³: independent when det ≠ 0. Example: ⟨1, 0, 1⟩,
  ⟨2, 1, 0⟩, ⟨0, 1, 1⟩ → det 3; with ⟨3, 1, 1⟩ = v₁ + v₂ → 0. Picture: `vectorDiagram` `space`
  with `w`, `triple`, `volume` (a flat box means dependent).
- **~coordinates — BUILD:** c₁b₁ + c₂b₂ = x in ℝ². Example: b₁ = ⟨1, 1⟩, b₂ = ⟨1, −1⟩,
  x = ⟨5, 1⟩ → (3, 2). Picture: `vectorDiagram` `sum: 'parallelogram'`.
- **~subspace — BUILD (sort):** bins Subspace, Not a subspace. Sentence: "A subspace holds 0 and
  is closed under adding and scaling." Cards: y = 2x; x + y + z = 0; z = 0 in ℝ³; the null space
  of a matrix (Subspace); y = 2x + 1; xy ≥ 0; x² + y² ≤ 1; x a whole number (Not).
- **Answers:** basis and dimension of Nul A and Col A — main Solves; is a vector in the span —
  Partly (main with b typed as a fourth column); independence — Solves in ℝ³, four vectors — No;
  coordinates in a basis — Solves in ℝ²; subspace tests — Solves; polynomial and matrix spaces
  — No (no quantity model; the sort's sentence covers the test).
- **Verdict:** 4 pages (1 sort).

### LA#2 he.math.linear-algebra#2 — Determinants

- **Textbooks:** ULA 3.4; Hefferon Four; 18.06 lectures 18–20.
- **Main — BUILD: det A by row reduction.** Values A (3 × 3 group), swaps s, scale factors,
    pivots, det (derived). Relations: det = (−1)ˢ × (product of the pivots) ÷ (product of the
    scale factors). Assumptions: a swap flips the sign; adding a multiple of a row keeps det; a
    triangular matrix's det is its diagonal's product. Example: [[0, 2, 1], [1, 1, 1], [2, 0, 3]] →
    swap rows 1 and 2, R₃ − 2R₁, R₃ + R₂ → pivots 1, 2, 2; det = −4 (cofactors: −2 − 2 = −4).
    startWith A. Picture: `matrixGrid` `rowReduce` (P11 tally later). Refresh
  `m.12.matrices~determinant`. Use line: "Use this for 'Find det A by row reduction.'"
- **~volume — BUILD:** |det [u v w]| is the volume of the box. Example: ⟨2, 0, 0⟩, ⟨1, 3, 0⟩,
  ⟨0, 1, 4⟩ → 24. Picture: `vectorDiagram` `space` with `w`, `volume`.
- **~properties — BUILD:** det(kA) = kⁿ det A, det(AB) = det A det B, det A⁻¹ = 1/det A,
  det Aᵀ = det A. Example: n = 3, det A = 4, det B = −2, k = 2 → 32, −8, 0.25, 4. Picture:
  `table` sweeping k.
- **Answers:** 3 × 3 determinant — main Solves; 4 × 4 — No (P11 on 4 × 4 later); properties —
  Solves; volume and area scale — Solves (`m.12.matrix-transformations~area` for 2 × 2); Cramer's
  rule — `m.12.matrices~cramer` (Refresh); det = 0 iff not invertible — main's assumption.
- **Verdict:** 3 pages.

### LA#3 he.math.linear-algebra#3 — Eigenvalues and eigenvectors

- **Textbooks:** ULA 4.1–4.5; Hefferon Five; 18.06 lectures 21–24.
- **Main — BUILD: a 2 × 2 matrix's eigenvalues and eigenvectors.** Values A (group), trace,
    det, discriminant, λ₁, λ₂, v₁, v₂ (derived). Relations: λ² − (tr A)λ + det A = 0;
    (A − λI)v = 0. Assumptions: Av = λv means A only stretches v; real eigenvalues need a
    discriminant ≥ 0 (complex: ~complex). Example: [[4, 1], [2, 3]] → λ² − 7λ + 10 = 0, λ = 5 with
    ⟨1, 1⟩, λ = 2 with ⟨1, −2⟩. startWith A. Picture: `vectorDiagram` v₁ with `scalar: { k: λ₁ }`
    (Av = λv drawn; P12 later). Use line: "Use this for 'Find the eigenvalues and eigenvectors of
    [[4, 1], [2, 3]].'"
- **~three-by-three — BUILD:** an eigenvector for a given λ from Nul(A − λI). Example:
    [[2, 0, 0], [1, 3, 0], [0, 1, 1]], λ = 3 → ⟨0, 2, 1⟩ (A⟨0, 2, 1⟩ = ⟨0, 6, 3⟩). Picture:
  `matrixGrid` `rowReduce` of A − λI.
- **~powers — BUILD:** Aᵏx by the eigenvectors. Example: A above, x = ⟨1, 0⟩ = ⅔v₁ + ⅓v₂ →
  A³x = ⅔ × 125⟨1, 1⟩ + ⅓ × 8⟨1, −2⟩ = ⟨86, 78⟩. Picture: `vectorDiagram` `sum: 'parallelogram'`.
- **~markov — BUILD:** the steady state of a 2-state chain: (q/(p + q), p/(p + q)). Example:
  p = 0.1, q = 0.3 → (0.75, 0.25). Picture: `matrixGrid` `multiply` (P × steady = steady).
- **~complex — BUILD:** [[a, −b], [b, a]] → λ = a ± bi, a turn by θ with a stretch r. Example:
    a = b = 1 → r = √2, θ = 45°. Picture: `complexPlane` `conjugate`, `modulus`, `argument`.
- **Answers:** 2 × 2 eigenpairs — main Solves; 3 × 3 with a known λ — Solves, the cubic —
  Partly (triangular matrices only); diagonalize and powers — ~powers Solves; Markov steady
  state — Solves for 2 states; complex eigenvalues — Solves.
- **Verdict:** 5 pages.

### LA#4 he.math.linear-algebra#4 — Orthogonality and least squares

- **Textbooks:** ULA 6.1–6.5; Hefferon Three.VI; 18.06 lectures 14–17.
- **Main — BUILD (⏳ HE-math-P13): the least-squares line by the normal equations.** Values: the
    data (3–8 points, a group), AᵀA, Aᵀb, slope m, intercept b, error ‖b − Ax̂‖² (derived).
    Relations: AᵀA x̂ = Aᵀb with A's rows (xᵢ, 1). Assumptions: x̂ makes Ax̂ the projection of b
    onto Col A; the residual is square to every column. Example: (0, 1), (1, 2), (2, 2), (3, 4) →
    AᵀA = [[14, 6], [6, 4]], Aᵀb = ⟨18, 9⟩, m = 0.9, b = 0.9, error 0.70. startWith the data.
    Interim: `matrixGrid` `multiply` (AᵀA). Use line: "Use this for 'Find the least-squares line
    through (0, 1), (1, 2), (2, 2), (3, 4).'"
- **~projection — BUILD:** proj_v u = (u·v ÷ v·v)v and the part square to v. Example:
  u = ⟨3, 1⟩, v = ⟨1, 1⟩ → ⟨2, 2⟩ and ⟨1, −1⟩. Picture: `vectorDiagram` with `angle` (P14 later).
- **~gram-schmidt — BUILD:** u₂ = v₂ − proj_(u₁) v₂ in ℝ³. Example: ⟨1, 1, 0⟩, ⟨1, 0, 1⟩ →
  ⟨½, −½, 1⟩ (dot 0); lengths √2 and 1.225. Picture: `vectorDiagram` `space` (u₁, v₂, u₂ as w).
- **Answers:** least-squares line — main Solves; least squares for a quadratic fit — No
  (needs a 3-column A; propose a choice); projection onto a line — Solves, onto a plane — No;
  Gram–Schmidt for two vectors — Solves; orthogonal complement — Partly (LA#1 main on Aᵀ); QR —
  No.
- **Verdict:** 3 pages (1 ⏳).

## Pictures for the pictures chat

1. **HE-math-P1 — `functionGraph` `tangent` and `band`.** Pages: C1#1 ~linear-approx (⏳),
   ~chain, ~trig, ~exp, the pilot; C1#0 ~epsilon-delta (⏳). Draws: `tangent: { x, slope, y? }`
   the tangent line through (x, f(x)), its slope triangle; `band: { x, y, dx, dy }` a horizontal
   band y ± ε and the vertical band x ± δ, the curve inside both. Check: slope equals a central
   difference of the drawn f at x (relative 10⁻⁶); f(x ± δ) stays within y ± ε.
2. **HE-math-P2 — `functionGraph` regions.** Pages: C1#3 main (`signed`), ~area-between,
   C3#2 ~region. Draws: `shade: 'between'` (f and `other` from the crossings or from/to),
   `strip: { at, dir: 'x' | 'y' }` one representative slice, `signed` (above and below the axis
   in two fills, labelled + and −). Check: the shaded area equals the page's area value by
   quadrature.
3. **HE-math-P3 — `functionGraph` `family: 'expr'`.** Pages (⏳): C1#4 main, C2#0 main,
   ~parts-trig, C2#4 ~integrate-series, DE#0 ~linear, DE#2 main, ~inverse, DE#4 ~airy. Draws any
   expression from a whitelisted grammar (+ − × ÷ ^, exp, ln, sin, cos, tan, sqrt, abs,
   step u(x − c)) over parameter ids, e.g. `'x * exp(k * x)'`. Check: every name is a page value
   or x; the curve passes through `at`; no evaluation outside the grammar (no `eval`).
4. **HE-math-P4 — `functionGraph` `series` overlay.** Pages (⏳): C2#4 main, ~sin-cos,
   ~from-derivatives, ~integrate-series, DE#4 main, ~airy. Draws: a dashed polynomial from
   `coefficients` (ids) or from `derivatives` at a `center`, over the true f; the gap at x
   bracketed with the error. Check: the drawn polynomial equals Σ cₖ(x − a)ᵏ; the bracket equals
   the page's error value.
5. **HE-math-P5 — `functionGraph` `accumulation`.** Page: C1#3 ~accumulation. Draws a second
   panel under the graph: F(x) = ∫ from a to x of f, its point traced, the slope at x equal to
   f(x). Check: F at x by quadrature equals the page's value.
6. **HE-math-P6 — new kind `solidOfRevolution`.** Pages (⏳): C2#2 main, ~washer, ~shells. Draws
   the region under f (and over g) on [a, b] turned about the x-axis or y-axis (later a line
   y = k): a see-through solid, one slice lit (disk, washer or shell) with its radii and
   thickness labelled, V in the caption. Fields: f, g? (`FunctionFamily`), from, to, axis,
   method, at (slice x), volume (id). Check: volume equals the numerical integral for the
   method; the slice radius equals f(at).
7. **HE-math-P7 — new kind `surfacePlot`.** Pages (⏳): C3#1 main, ~extrema, C3#2 main; later
   ~directional, ~lagrange. Draws z = f(x, y) for a plane or the quadratic ax² + bxy + cy² +
   dx + ey + f on the `vectorDiagram` `space` camera (turn handle). Options: `point` with its x-
   and y-traces and their slopes f_x, f_y; `tangentPlane`; `contour` mode (level curves, ∇f at
   the point, a direction u, a constraint line); `critical` (min, max or saddle marked); `region:
{ a, b, c, d, boxes }` (prisms under the surface, their sum). Check: f_x, f_y equal the
   analytic partials; the prism sum equals the page's value; ∇f is square to the level curve.
8. **HE-math-P8 — `vectorDiagram` `space` objects.** Pages (⏳): C3#0 main, ~line, ~helix,
   C3#3 ~flux, C3#4 ~stokes. Adds: `plane: { normal, point }` (a patch through the point, Q
   dropped to it along n), `line: { point, direction, t }`, `curve: { helix: { a, c }, t }` with
   its velocity arrow, `sphere: { r, normals }` and `circle: { r, z }` with its direction arrows
   and a capping surface. Check: the plane passes through the point; the line point at t and
   the foot of the drop equal the page's values.
9. **HE-math-P9 — new kind `fieldPlot`.** Pages (⏳): DE#0 ~euler, DE#3 main, ~solution,
   ~predator-prey, C3#3 main, ~conservative, C3#4 main. Modes: `slope` (y′ = ax + by + c or a
   logistic, short segments on a grid, the solution through (x₀, y₀), Euler's polyline for h, n);
   `vector` (F = ⟨P, Q⟩ with linear or quadratic coefficient ids, a path — segment, circle or
   rectangle boundary — with its direction and a work tally per side); `phase` (x′ = Ax, the
   eigenvector lines dashed, 6 trajectories, the type named; a Lotka–Volterra option with its
   equilibrium). Check: Euler points equal the page's values; each side's integral equals the
   page's value; eigenvalues equal the page's λ.
10. **HE-math-P10 — `oscillator` `damping` and `forcing`.** Page (⏳): DE#1 main; later
    ~resonance. The swing mode takes c (N·s/m): the x–t trace becomes e^(αt)(C₁ cos βt + C₂ sin
    βt), the over- or critically damped forms, with the envelope dashed; `forcing: { A, ω }`
    draws the steady response. Check: y(t) at the marked time equals the page's value.
11. **HE-math-P11 — `matrixGrid` wide rows and a determinant tally.** Pages: LA#0 ~inverse (⏳),
    LA#2 main. `rowReduce` accepts 3 × 6 and 4 × 8 ([A | I]); `tally: true` keeps the running
    sign and scale beside each step and the pivot product at the end. Check: the right block
    times A is I; the tally equals the page's det.
12. **HE-math-P12 — `transformation`

     `move: 'matrix'`

     with `eigen`

    .** Pages: LA#3 main, LA#2
        ~volume (2-D). The unit square and unit circle under [[a, b], [c, d]] (the circle to an
        ellipse), the eigenvector lines kept, each stretched by λ. Check: Av = λv on the drawn lines;
        the area ratio equals |det|.
13. **HE-math-P13 — `scatter` points from a value group.** Page (⏳): LA#4 main. `pointsFrom:
'<group>'` with the `leastSquares: 'fit'` and `residuals` options. Check: as today's `fit`.
14. **HE-math-P14 — `vectorDiagram` `project`.** Pages: LA#4 ~projection, ~gram-schmidt (2-D and
    `space`). The projection along v, the perpendicular part dashed with a right-angle mark.
    Check: the perpendicular's dot with v is 0; the projection equals the page's values.
15. **HE-math-P15 — `polarGrid` additions.** Pages: C2#5 ~cycloid-arc (⏳), ~polar-area,
    ~polar-slope, C3#2 ~polar (⏳). `area: { from, to }` shades the swept region of a curve;
    `region: { r1, r2, from, to }` an annular sector; `tangent` at the point; parametric
    `family: 'cycloid'` (r) and `radians` on t. Check: the shaded area equals ½∫r² dθ; the
    tangent's slope equals the page's dy/dx.
16. **HE-math-P16 — related-rates and work options.** Pages: C1#2 ~cone-tank (⏳), ~ladder,
    ~two-cars, C2#2 ~pump-work. `rightTriangle` `rates: { a?, b?, c? }` (arrows on the sides with
    their rates); `curvedSolid` cone `fill: h` (water to depth h, surface radius r) and cylinder
    `slab: y` (a thin layer lifted to the top, its lift distance). Check: r = Rh/H; the rates
    satisfy the page's relation.
17. **HE-math-P17 — `termsChart` series.** Pages: C2#3 ~ratio (⏳), ~alternating (⏳), main.
    `type: 'nr'` (n·rⁿ) and `'factorial'` (cⁿ/n!); `alternate: true` (signs alternate, partial
    sums zig-zag about the sum); `bounds: { low, high }` a band the sum must lie in. Check: terms
    and sums equal the rule; the band contains the page's limit when known.
18. **HE-math-P18 — product rule and circle options.** Pages: C1#1 ~product-quotient (⏳),
    ~implicit, C2#0 ~trig-sub. `rectangle` `grow: { du, dv }` (a u × v rectangle with the strips
    u′·Δt by v and u by v′·Δt); `conicGraph` circle `under: { to }` (the region under the arc
    split into the triangle and the sector) and `tangent` at `point`. Check: strip areas add to
    the product's change to first order; triangle + sector equals the page's integral.
19. **HE-math-P19 — `treeDiagram` `chain`.** Page (⏳): C3#1 ~chain. z at the top, x and y under
    it, t under each; each branch labelled with its partial (∂z/∂x, dx/dt), each path's product
    and their sum. Check: the sum equals the page's dz/dt.

## Research to do

### Textbooks (reference only; never copied into lessons)

| Text                                                                  | URL                                                                 | Licence                                                                                                                                   | Courses / topics             | Extract                                                                                                                          |
| --------------------------------------------------------------------- | ------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| OpenStax Calculus Vols 1–3                                            | <https://openstax.org/details/books/calculus-volume-1> (and -2, -3) | CC BY-NC-SA 4.0, plus OpenStax's statement that the books may not be ingested by LLMs without permission (`research/textbooks/README.md`) | C1, C2, C3, DE#0, DE#1, DE#4 | chapter and section lists, worked-example types, number sizes; the owner decides (as on 2026-09-29) whether only titles are kept |
| Active Calculus (Boelkins et al.) and Active Calculus Multivariable   | <https://activecalculus.org>                                        | CC BY-SA 4.0                                                                                                                              | C1, C2, C3                   | section lists, activity types, the order of topics                                                                               |
| APEX Calculus (Hartman et al.)                                        | <https://www.apexcalculus.com>                                      | CC BY-NC 4.0                                                                                                                              | C1–C3                        | section lists, exercise types                                                                                                    |
| CLP-1 to CLP-4 (UBC) and their problem books                          | <https://personal.math.ubc.ca/~CLP/>                                | CC BY-NC-SA 4.0                                                                                                                           | C1–C3                        | section lists, problem types and ranges                                                                                          |
| MIT OCW 18.01, 18.02, 18.03, 18.06                                    | <https://ocw.mit.edu>                                               | CC BY-NC-SA 4.0                                                                                                                           | all five                     | syllabi and lecture order, problem-set and exam types                                                                            |
| Lebl, _Notes on Diffy Qs_                                             | <https://www.jirka.org/diffyqs/>                                    | CC BY-SA 4.0 or CC BY-NC-SA 4.0 (dual)                                                                                                    | DE                           | section list, example types (cooling, mixing, springs, Laplace table)                                                            |
| Trench, _Elementary Differential Equations_                           | LibreTexts (Mathematics → Differential Equations)                   | CC BY-NC-SA 3.0 (confirm)                                                                                                                 | DE                           | section list, exercise types                                                                                                     |
| Austin, _Understanding Linear Algebra_                                | <https://understandinglinearalgebra.org>                            | CC BY 4.0                                                                                                                                 | LA                           | section list, activity types                                                                                                     |
| Hefferon, _Linear Algebra_                                            | <https://hefferon.net/linearalgebra/>                               | GFDL or CC BY-SA 3.0 US                                                                                                                   | LA                           | chapter list, exercise types                                                                                                     |
| Beezer, _A First Course in Linear Algebra_                            | <http://linear.ups.edu>                                             | GFDL (confirm)                                                                                                                            | LA                           | chapter list                                                                                                                     |
| Strang, _Introduction to Linear Algebra_; Lay; Stewart; Boyce–DiPrima | publishers' pages                                                   | all rights reserved                                                                                                                       | all                          | chapter titles only (as the K–12 "titles" programs)                                                                              |

Record per text, as `research/textbooks/toc/math/<text>.json`: course, topic index, section
title, the worked-example types in our own words and their number ranges, notation used.

### Questions (reference only)

| Source                                                 | URL                                  | Licence / terms                                            | Record                                                                          | Target                  |
| ------------------------------------------------------ | ------------------------------------ | ---------------------------------------------------------- | ------------------------------------------------------------------------------- | ----------------------- |
| AP Calculus AB and BC free-response, released years    | <https://apcentral.collegeboard.org> | © College Board; classroom copying only, no redistribution | course, topic, question type and the sizes of its numbers in our words; no text | 40 C1, 40 C2            |
| MIT OCW 18.01/18.02/18.03/18.06 problem sets and exams | <https://ocw.mit.edu>                | CC BY-NC-SA 4.0                                            | as above, with the item id                                                      | 30 per course           |
| Active Calculus and CLP exercises                      | as above                             | CC BY-SA 4.0; CC BY-NC-SA 4.0                              | as above                                                                        | 30 C1–C3                |
| OpenStax end-of-section exercises                      | as above                             | CC BY-NC-SA 4.0 + LLM statement                            | only if the owner allows; types only                                            | —                       |
| Lebl and Austin exercises                              | as above                             | as above                                                   | as above                                                                        | 40 DE, 40 LA            |
| GRE Mathematics Subject Test practice book             | <https://www.ets.org/gre>            | © ETS                                                      | topic and type only                                                             | 20 across courses       |
| NCEES FE (mathematics section) sample questions        | <https://ncees.org>                  | © NCEES                                                    | topic and type only                                                             | 10 across C1–C3, DE, LA |

Targets: Calculus I 120, Calculus II 120, Calculus III 100, Differential Equations 80, Linear
Algebra 100 (as in `research/questions/math/`, one JSON line per item: course, topic index,
type, answer kind, picture, source, licence). robots.txt was not checked for this plan; the
research chat checks each host and keeps one request a second, as `SOURCES.md` describes.

### Engine needs

1. **E1 — Topic problem types.** `problemTypes()`, `moduleOwner`, the topic route, search and
   the matcher corpus take `<course>#<i>~slug`. Waits: all 93 problem-type pages.
2. **E2 — College layouts.** `layouts/college.ts`, `getLayout` for `#` ids, `layouts.test.ts`
   reading level for courses. Waits: the 13 layout pages.
3. **E3 — College standards.** `valueLimit` and sentence limits for `he.` ids (Grade 12 values);
   a point or vector typed as one group. Waits: every page's tests.
4. **E4 — Integral lines.** "∫ from a to b of (…) dx" typeset ∫ₐᵇ (like Σ), "[F(x)] from a to b"
   and "F(b) − F(a)"; the harness checks them by Simpson's rule. Waits: C1#3, C1#4, C2#0–#2,
   C3#2–#4, DE#2.
5. **E5 — Form lines and derivative notation.** A line with the free variable ("V′(x) = 12x² −
   240x + 900") checked at sample points; f′(2), dy/dx, ∂f/∂x, D_u f, lim as h → 0 typeset.
   Waits: every C1–C3 and DE page.
6. **E6 — Cases.** A relation whose formula depends on a case, a derived code value with named
   choices (converges/diverges, the damping regime, one/none/many, the equilibrium type), the
   case named in `how`. Waits: C1#0 main, C2#1 main, C2#3, C2#4 ~radius, DE#1 main, DE#3 main,
   LA#0 main.
7. **E7 — Complex pairs.** A value pair α ± βi from one relation and the phrase "r = −1 ± 3i".
   Waits: DE#1 main, ~characteristic, DE#3 main, LA#3 ~complex.
8. **E8 — Partial sums and recurrences.** `partialSum(term, N)` up to N = 1000, a recurrence
   table (aₙ from a₀, a₁), n! in the harness. Waits: C2#3, C2#4, DE#4.
9. **E9 — Vectors and matrices in steps.** ⟨a, b, c⟩ arithmetic (dot, cross, scale, sums),
   matrix products and A − λI lines evaluated by the harness, 3 × 4 groups and 4-vectors. Waits:
   C3, DE#3, LA.
10. **E10 — Units.** N/m, N·s/m, m³/min, L/min, kg/L, 1/min, °C/min. Waits: C1#2 rates, C2#2
    work, DE#0 main and ~mixing, DE#1 main.
11. **E11 — Integral templates.** `∫_{a}^{b} (…) dx = {I}` with boxed limits in equation inputs
    (Must for the template). Waits: C1#3 main, C1#4 main, C2#0 main (rows until then).
12. **E12 — Angle units.** Calculus pages in radians, the polar and parametric pictures in
    degrees with a derived radian value; "rad" as a label. Waits: C1#1 ~trig, C2#5, DE#1.
13. **E13 — Typed functions (later).** A small parser for a student's f(x) with symbolic
    derivative and antiderivative (polynomials, exp, ln, sin, cos, products, compositions).
    Lifts the "Partly (E13)" marks; not needed for any page above.

## Not in the taxonomy

- Calculus I: the mean value theorem and curve sketching (CV1 4.4–4.5; ~extrema covers part),
  linear approximation and L'Hôpital (CV1 4.2, 4.8; placed under C1#1), Newton's method (4.9),
  antiderivatives as a topic (4.10).
- Calculus II: moments and centroids, hydrostatic force (CV1 6.5–6.6), numerical integration
  (CV2 3.6: trapezoid, Simpson), exponential growth as a DE (CV1 6.8; DE#0 owns it).
- Calculus III: vector-valued functions, arc length and curvature (CV3 3; placed as
  C3#0~helix), cylindrical and spherical coordinates (2.7, 5.5), change of variables (5.7).
- Differential Equations: Fourier series and PDEs (LDQ 4–5), exact equations, existence and
  uniqueness.
- Linear Algebra: linear transformations, kernel and range, change of basis, symmetric matrices
  and quadratic forms, the SVD (ULA 7).

## Priority

1. E1, E2, E3, E5 (no page ships without them), then the calculators with existing pictures:
   C1#0 main, ~continuity, ~ivt; C1#2 main, ~fence, ~extrema, ~ladder, ~two-cars; C1#3 all six;
   DE#0 main, ~logistic, ~mixing; LA#0 main, LA#1 main, LA#2, LA#3.
2. The 13 layouts (E2).
3. E4 and E6, then C2#1, C2#3 main, C2#0 ~partial-fractions, ~trig-sub, C3#1 ~directional,
   ~lagrange.
4. Pictures P3 and P9 (15 pages wait on them), then P7, P6, P4, P8.

## Summary

- **Pages:** 119 (26 main + 93 problem types): **106 calculators** (1 pilot kept, 105 new) and
  **13 layouts** (10 sorts, 3 sequences); **42 ⏳** waiting on a picture (most ship with an
  interim). By course: Calculus I 32 (4 layouts, 5 ⏳), Calculus II 28 (2, 12), Calculus III 21
  (2, 13), Differential Equations 19 (3, 10), Linear Algebra 19 (2, 2).
- **Picture requests:** 19 (HE-math-P1 to P19): 3 new kinds (`solidOfRevolution`,
  `surfacePlot`, `fieldPlot`) and 16 options on existing kinds (`functionGraph` ×5,
  `vectorDiagram` ×2, `polarGrid`, `matrixGrid`, `transformation`, `scatter`, `termsChart`,
  `oscillator`, `rightTriangle`/`curvedSolid`, `rectangle`/`conicGraph`, `treeDiagram`).
- **Engine needs:** 13 (E1–E13); E1 topic problem types, E2 college layouts, E3 college
  standards and E5 form lines gate everything; E13 typed functions is later.
- **Research targets:** 11 texts (7 open: Active Calculus, APEX, CLP, MIT OCW, Lebl, Austin,
  Hefferon; plus OpenStax by the owner's decision and titles-only commercial texts); 520
  questions (C1 120, C2 120, C3 100, DE 80, LA 100) from AP Calculus FRQs (types only), MIT OCW,
  the open books' exercises, GRE Math and NCEES FE samples (types only).

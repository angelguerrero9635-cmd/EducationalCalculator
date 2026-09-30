# Direction plan: math grade 10 (Geometry, with probability)

18 skills, 105 pages (88 calculators, 17 layouts). Every example below was worked by hand;
none is taken from `research/`. Demo ids are the brief's; "promote" means
`node scripts/promote-demo.mjs <demo> <page id>`, then rework as written here.

## Decisions

- **Letters and notation.** Standard geometry notation throughout: points A, B, C; a length
  written AB (no overbar in text); △ABC, ∠A, ≅, ~, ∥, ⊥; an angle's measure written m∠A in
  Formulas and steps ("m∠1 = m∠5") and as 65° on picture chips. Coordinates (x, y), slope m.
  Trig in degrees: steps write sin(35°) and tan⁻¹(0.0833); exact radicals first, then ≈ to
  2 decimals (lengths) or 0.01° (angles). Probabilities as decimals with the fraction first
  where it is simple (3/8 = 0.375). Sentences ≤ 35 words, ≤ 10 values a page.
- **Equation inputs** (Grades 9–12 table in `docs/EQUATION_INPUTS.md`) only where the page's
  problem is one equation: special right triangles, trig ratios, law of sines, circle equations,
  P(n, r) and C(n, r), P(A | B), and the "set two expressions equal" pages. Picture and proof
  pages keep rows.
- **Layouts.** Proofs and constructions are taught as ordered steps, so they are **sequence**
  pages (no spans; each stage is "statement (reason)"). A sequence must have one right order:
  lines that could swap are merged into one stage (checked below). Classifying (criteria,
  quadrilateral names, cross-section shapes, which center, which motion) is a **sort**.
  No explore page: every drawn figure here is a calculator picture, and none is an explore
  figure yet (see Engine need 5).
- **No pilot pages** exist for m.10 (`pilots.ts` has none); every page is BUILD, most from a
  demo. `src/data/modules/math/10.ts` is new.
- **Demo relations beyond the standard.** Several demos reach the answer with a formula the
  course doesn't teach at that point (the isosceles proof's BD = s sin(A/2); Heron's formula in
  the incenter, circumcenter and orthocenter demos; the rhombus from its angle by cosine).
  Those numbers only place the drawing: they become figure-only values (Engine need 1) or the
  page is reworked to the textbook relation, as each skill says.
- **Order of pages** follows the textbooks: basics and constructions, proof, parallel lines,
  rigid motions, congruence, triangle relationships, quadrilaterals, similarity, right
  triangles and trig, laws of sines and cosines, coordinate geometry, circles, arc and sector,
  solids, probability.

### 1. m.10.constructions — Geometry basics: points, lines, segments, angles and constructions

- **Standard:** G-CO.1, G-CO.12, G-CO.13.
- **Textbooks:** eureka-hs 10.1; im-hs 10.1 (Constructions and Rigid Transformations, lessons
  1–9); big-ideas-hs 10.1 (Basics of Geometry), 10.6 (bisectors); envision-aga 10.1; reveal-hs 10.1.
- **Tests ask:**

  | Question                                                                | Page                        | Mark                          |
  | ----------------------------------------------------------------------- | --------------------------- | ----------------------------- |
  | NAEP-1992-12M15-#4 (what the angle-bisector construction guarantees)    | ~angle-bisector-facts       | Solves                        |
  | NAEP-1996-12M10-#10 (locate a circle's center)                          | ~find-center                | Solves                        |
  | NAEP-1996-12M13-#2 (parallelogram with perpendicular diagonals)         | m.10.quadrilaterals~name-it | Solves                        |
  | NAEP-1996-12M13-#8 (perpendicular through P, angle between lines)       | ~angle-addition (90° − x)   | Partly (a protractor drawing) |
  | NAEP-2005-12M3-#4 (8, 8 and 40°: another angle)                         | m.10.proofs~isosceles       | Solves                        |
  | MCAS-2026-G10M-#16 (second step of a perpendicular bisector)            | ~bisector-steps             | Solves                        |
  | Common: segment addition with an unknown; midpoint with 3x + 1 = 5x − 7 | main, ~midpoint             | Solves                        |

- **Main — BUILD `m.10.constructions`** "Segment addition": picture `markedFigure` with
  `points: { A: [0, 0], B: ['ab', 0], C: ['ac', 0] }`, parts segment AC, labels AB, BC, AC.
  Values: `ab` AB (cm, 0.1–1000), `bc` BC (cm, 0.1–1000), `ac` AC (cm, 0.2–2000).
  Relation AB + BC = AC. Assumptions: B is on segment AC, between A and C; lengths add only
  along one line; a point off the line gives AB + BC > AC. Example AB = 4.5 cm, BC = 7 cm,
  AC = 11.5 cm. `startWith: ['ab', 'bc']`.
- **~midpoint — BUILD** "Midpoint with an unknown": `equation: '{p}x + {q} = {r}x + {s}'`
  (AM and MC), then AM and AC derived. Values p, r (1–20, integer), q, s (−50–50, integer), x
  derived, `am` AM derived, `ac` AC derived; relations px + q = rx + s, AM = px + q,
  AC = 2 × AM, constraint AM > 0 ("A length can't be 0 or less"). Picture `markedFigure`, A, M,
  C on a line with one tick on each half. Example AM = 3x + 1, MC = 5x − 7: 8 = 2x, x = 4,
  AM = 13, AC = 26. `startWith: ['p', 'q', 'r', 's']`.
- **~angle-addition — BUILD** "Angle addition": `equation: '{a}° + {b}° = {c}°'`; values a
  m∠AOB, b m∠BOC (0.1–359.9), c m∠AOC (0.2–360). Picture `markedFigure` with rays OA, OB, OC
  and arcs. Assumption: ray OB is inside ∠AOC; a bisector makes a = b. Example 38° + 47° = 85°.
- **~perpendicular-bisector — BUILD (promote `g.m10-constructions-perpendicular-bisector`)**:
  values AB, compass r, AM = AB ÷ 2 (derived), MP = √(r² − AM²) (derived); constraint r > AM
  ("The compass must open more than half of AB, or the arcs miss each other"). Example AB = 6 cm,
  r = 4 cm, AM = 3 cm, MP = √7 ≈ 2.65 cm.
- **~bisector-steps — BUILD (sequence)** "Construct a perpendicular bisector": stages
  1 "Open the compass to more than half of AB." 2 "Draw an arc from A across the segment."
  3 "Keep the same opening and draw an arc from B." 4 "Mark where the two arcs cross, above and
  below." 5 "Draw the line through the two crossings." Card figure `lines` until Engine need 5.
- **~angle-bisector-steps — BUILD (sequence)** "Bisect an angle": 1 "Draw an arc from O that
  crosses both sides, at A and B." 2 "From A, draw an arc inside the angle." 3 "With the same
  opening, draw an arc from B that crosses it at P." 4 "Draw ray OP." (One order: 3 needs 2's
  opening.)
- **~angle-bisector-facts — BUILD (sort)** bins "Always true", "Not always true"; cards
  "OA = OB", "AP = BP", "m∠AOP = m∠BOP", "△AOP ≅ △BOP" (always); "AB = BP", "OB = BP",
  "OP = AB", "∠AOB is a right angle" (not always).
- **~find-center — BUILD (sequence)** "Find the center of a circle": 1 "Draw two chords that
  aren't parallel." 2 "Construct the perpendicular bisector of each chord." 3 "Mark where the
  two bisectors cross: the center." 4 "Check: the center is the same distance from every point
  on the circle."
- **Verdict:** 8 pages (4 calculators, 3 sequences, 1 sort); 6 of 7 items Solve, 1 Partly.

### 2. m.10.proofs — Reasoning and proof: conditional statements and two-column proofs

- **Standard:** G-CO.9, G-CO.10 (and MP3); conditional statements as in the textbooks.
- **Textbooks:** eureka-hs 10.1; im-hs 10.1 (Evidence and Proof), 10.2; big-ideas-hs 10.2
  (Reasoning and Proofs), 10.3, 10.6, 10.7; envision-aga 10.1, 10.2, 10.5, 10.6; hmh-into-hs
  10.1, 10.2, 10.5, 10.6; reveal-hs 10.3, 10.6, 10.7.
- **Tests ask:**

  | Question                                                             | Page                                   | Mark                                                              |
  | -------------------------------------------------------------------- | -------------------------------------- | ----------------------------------------------------------------- |
  | NAEP-2009-12M7-#7 (right triangles, midpoint, prove sides congruent) | m.10.congruence~cpctc-proof            | Partly (same shape, vertical angles + midpoint, but ASA, not SAS) |
  | NAEP-2009-12M2-#12 (justify a parallelogram from coordinates)        | m.10.coordinate-geometry~parallelogram | Solves                                                            |
  | MCAS-2026-G10M-#22 (exterior angle, find ∠L)                         | ~exterior-angle                        | Solves                                                            |
  | Common: converse, inverse, contrapositive true or false              | ~conditional                           | Solves                                                            |
  | Common: give the reason for each line solving an equation            | ~algebraic-proof                       | Solves                                                            |
  | Common: base angles of an isosceles triangle                         | ~isosceles                             | Solves                                                            |

- **Main — BUILD `m.10.proofs` (sequence)** "Vertical angles are congruent": question "Put the
  proof in order." Stages: 1 "Lines ℓ and m cross, making ∠1, ∠2 and ∠3 in a row (Given)."
  2 "m∠1 + m∠2 = 180° and m∠2 + m∠3 = 180° (Linear pairs are supplementary)." 3 "m∠1 + m∠2 =
  m∠2 + m∠3 (Substitution)." 4 "m∠1 = m∠3 (Subtraction Property of Equality)." 5 "∠1 ≅ ∠3
  (Definition of congruent angles)." The two linear pairs share stage 2 so the order is unique.
- **~conditional — BUILD (sort)** "Conditional, converse, inverse, contrapositive": bins
  "Always true", "Has a counterexample". Cards from two conditionals: "If two angles are
  vertical, then they are congruent." (true); its converse "If two angles are congruent, then
  they are vertical." (counterexample); inverse (counterexample); contrapositive "If two angles
  are not congruent, then they are not vertical." (true); "If a figure is a square, then it has
  four right angles." (true); converse "… four right angles, then it is a square." (a
  rectangle); inverse (counterexample); contrapositive (true). Sentence: "A statement and its
  contrapositive are true together; so are the converse and the inverse."
- **~algebraic-proof — BUILD (sequence)** "Reasons in an algebraic proof": 1 "2(x − 3) = 14
  (Given)." 2 "2x − 6 = 14 (Distributive Property)." 3 "2x = 20 (Addition Property of
  Equality)." 4 "x = 10 (Division Property of Equality)."
- **~isosceles — BUILD (promote `g.m10-proofs-isosceles`)** "Base angles of an isosceles
  triangle": values `A` vertex angle (°, 0.1–179.8), `B` base angle (derived), legs s (cm,
  0.1–1000), proof step k (1–5, standalone). Relation m∠B = (180° − m∠A) ÷ 2. The demo's
  BD = s sin(A/2), AD = s cos(A/2) and BC = 2BD place the drawing only: make them figure-only
  (Engine need 1) so no sine appears before the trig lesson. Assumptions: AB = AC is given; the
  bisector AD splits the triangle into two congruent triangles by SAS; so ∠B ≅ ∠C.
  Example A = 40°, B = C = 70°. `startWith: ['A', 's', 'k']`.
- **~exterior-angle — BUILD** "Triangle angle sum and exterior angle": picture `markedFigure`
  points with side BC extended to D, arcs at A, B and ∠ACD. Values a m∠A, b m∠B, c m∠ACB,
  d m∠ACD (all °, 0.1–179.9). Relations m∠A + m∠B + m∠ACB = 180°, m∠ACD = m∠A + m∠B.
  Example 52° + 71° = 123°, m∠ACB = 57°. `startWith: ['a', 'b']` (solving for a from d and b is
  the test's direction; the oldest input recalculates).
- **Verdict:** 5 pages (2 calculators, 2 sequences, 1 sort); 5 of 6 Solve, 1 Partly.

### 3. m.10.parallel-lines — Parallel and perpendicular lines: transversals and proofs

- **Standard:** G-CO.9, G-GPE.5.
- **Textbooks:** big-ideas-hs 10.3 (Parallel and Perpendicular Lines, 3.1–3.5); envision-aga
  10.2; hmh-into-hs 10.2; reveal-hs 10.3.
- **Tests ask:** no released questions; common types:

  | Question                                                       | Page                                | Mark   |
  | -------------------------------------------------------------- | ----------------------------------- | ------ |
  | ∠1 given, find a corresponding angle                           | main                                | Solves |
  | Alternate interior, same-side interior pairs                   | ~alternate-interior, ~same-side     | Solves |
  | Angles as expressions, find x                                  | ~algebra                            | Solves |
  | Are the lines parallel? (converse)                             | ~converse                           | Solves |
  | Line through a point parallel or perpendicular to a given line | ~parallel-line, ~perpendicular-line | Solves |
  | Prove the triangle angle sum                                   | ~triangle-sum-proof                 | Solves |

- **Main — BUILD (promote `g.m10-parallel-lines-corresponding`)** "Corresponding angles":
  `transversal: { angle: 'x', highlight: [1, 5] }`; values x m∠1, y m∠5 (°, 0.1–179.9, y
  derived). Relation m∠5 = m∠1. Assumptions: ℓ ∥ m is given; corresponding angles sit in the
  same position at each crossing. Example m∠1 = 62°, m∠5 = 62°.
- **~alternate-interior — BUILD (promote `g.m10-parallel-lines-alternate-interior`)**: values
  a m∠1, x m∠3 = 180° − a, y m∠6 = x. Example m∠1 = 118°, m∠3 = m∠6 = 62°.
- **~same-side — BUILD (promote `g.m10-parallel-lines-same-side`)**: the demo's pair sums to
  180°. Example 73° and 107°.
- **~converse — BUILD (promote `g.m10-parallel-lines-converse`)**: values a m∠1, b m∠5,
  d = b − a (°, −178–178, derived). The picture tilts line 2 when d ≠ 0. Example 81° and 79°,
  d = −2°: not parallel. Assumption: equal corresponding angles are the test.
- **~algebra — BUILD** "Angle expressions": `equation: '({p}x + {q})° = ({r}x + {s})°'`
  (corresponding or alternate interior); values p, r (1–20), q, s (−100–100), x derived,
  `t` angle derived (0.1–179.9, constraint). Picture `transversal: { angle: 't', highlight:
[3, 6] }`. Example 4x + 12 = 2x + 50, x = 19, angle 88°.
- **~parallel-line — BUILD** "A parallel line through a point": `equation: 'y = {m}x + {b}'`
  for the answer; values m slope (−20–20), b1 given intercept, point x0, y0 (−20–20), b2 =
  y0 − m × x0 (derived). Picture `lineSystem` (Engine need 10 for arrows). Example parallel to
  y = 3x − 4 through (2, 7): b = 7 − 6 = 1, y = 3x + 1.
- **~perpendicular-line — BUILD**: values m1, m2 = −1 ÷ m1 (derived; m1 ≠ 0, "A horizontal
  line's perpendicular is vertical: x = x₀"), x0, y0, b2 = y0 − m2 × x0. Example perpendicular
  to y = 2x + 1 through (4, 3): m = −1/2, b = 3 + 2 = 5, y = −1/2x + 5.
- **~triangle-sum-proof — BUILD (sequence)** "Why a triangle's angles add to 180°": 1 "Draw
  line ℓ through B parallel to AC (Parallel Postulate)." 2 "∠1 ≅ ∠A and ∠3 ≅ ∠C (Alternate
  interior angles)." 3 "m∠A + m∠B + m∠C = m∠1 + m∠B + m∠3 = 180° (Substitution; ∠1, ∠B and ∠3
  make a straight angle)." Merged so stage 3 must follow 2.
- **Verdict:** 8 pages (7 calculators, 1 sequence); all common types Solve.

### 4. m.10.rigid-motions — Rigid motions, compositions and symmetry

- **Standard:** G-CO.2, G-CO.3, G-CO.4, G-CO.5, G-CO.6.
- **Textbooks:** im-hs 10.1 (lessons 10–18); big-ideas-hs 10.4 (Transformations); envision-aga
  10.3; hmh-into-hs 10.3; reveal-hs 10.2, 10.4.
- **Tests ask:** no released questions of its own; common types, plus one filed elsewhere:

  | Question                                                              | Page          | Mark                                                                              |
  | --------------------------------------------------------------------- | ------------- | --------------------------------------------------------------------------------- |
  | MCAS-2026-G10M-#41 (rotations that carry a parallelogram onto itself) | ~symmetry     | Partly (rectangle figure; needs a parallelogram about its center, Engine need 14) |
  | Reflect, then rotate: where does A end up?                            | main          | Solves                                                                            |
  | Translate then reflect (glide reflection)                             | ~glide        | Solves                                                                            |
  | Rotate about a point other than the origin                            | ~rotate-point | Solves                                                                            |
  | Reflect across y = x or y = −x                                        | ~reflect-line | Solves                                                                            |
  | Which rule is a rigid motion?                                         | ~which-motion | Solves                                                                            |

- **Main — BUILD (promote `g.m10-rigid-motions-compose`)** "Composing two rigid motions":
  `transformation` with `then: { move: 'rotate', angle: 90 }`, `image2`. Values ax, ay (−7–7),
  px, py (A′, derived), qx, qy (A″, derived). Relations A′ = (−x, y), A″ = (−y′, x′).
  Assumptions: each move keeps lengths and angles, so the image is congruent; order matters:
  swapping the moves can land elsewhere. Example A(2, 5) → A′(−2, 5) → A″(−5, −2).
- **~glide — BUILD (promote `g.m10-rigid-motions-glide`)**: translate right h, then reflect in
  the x-axis. Example A(1, 2), h = 6: A′(7, 2), A″(7, −2).
- **~rotate-point — BUILD (promote `g.m10-rigid-motions-rotate-point`)**: 90° counterclockwise
  about C(a, b): x′ = a − (y − b), y′ = b + (x − a). Example A(6, 2) about (1, 1): (0, 6).
- **~reflect-line — BUILD (promote `g.m10-rigid-motions-reflect-diagonal`)**: mirror y = x or
  y = −x (a sign switch); (x, y) → (y, x) or (−y, −x). Example A(4, 1) across y = −x: (−1, −4).
- **~symmetry — BUILD (promote `g.m10-rigid-motions-symmetry-rectangle`)**: values width w,
  height h (1–9), turn t (°, 0–360, `allowed: [90, 180, 270, 360]`), lines of symmetry and order
  derived. Example 6 by 4 rectangle: 180° and 360° carry it onto itself, 2 lines. Assumption:
  a square (w = h) adds 90° turns and the diagonals (`g.m10-rigid-motions-symmetry-square`
  logic in one relation).
- **~which-motion — BUILD (sort)** bins "Translation", "Reflection", "Rotation", "Not rigid";
  cards "(x, y) → (x + 4, y − 1)", "(x, y) → (x − 2, y)" (translation); "(x, y) → (x, −y)",
  "(x, y) → (y, x)" (reflection); "(x, y) → (−y, x)", "(x, y) → (−x, −y)" (rotation);
  "(x, y) → (2x, 2y)", "(x, y) → (x, 3y)" (not rigid). Sentence: "A rigid motion keeps every
  length and every angle."
- **Verdict:** 6 pages (5 calculators, 1 sort); 5 of 6 Solve, 1 Partly.

### 5. m.10.congruence — Congruent triangles: SSS, SAS, ASA, AAS and HL

- **Standard:** G-CO.7, G-CO.8, G-SRT.5.
- **Textbooks:** eureka-hs 10.1; im-hs 10.1, 10.2 (Congruence); big-ideas-hs 10.4, 10.5
  (Congruent Triangles); envision-aga 10.3, 10.4; hmh-into-hs 10.4; reveal-hs 10.4, 10.5.
- **Tests ask:**

  | Question                                                        | Page                        | Mark                                                                  |
  | --------------------------------------------------------------- | --------------------------- | --------------------------------------------------------------------- |
  | NAEP-2009-12M7-#7 (two-column proof with CPCTC)                 | ~cpctc-proof                | Partly (the page proves by SAS; the item needs ASA with right angles) |
  | MCAS-2026-G10M-#15 (which parts must be congruent from △… ≅ △…) | ~correspondence             | Solves                                                                |
  | MCAS-2026-G10M-#41 (rotation onto itself)                       | m.10.rigid-motions~symmetry | Partly                                                                |
  | Common: name the criterion from marked parts                    | main                        | Solves                                                                |
  | Common: congruent parts as expressions, find x                  | ~corresponding-parts        | Solves                                                                |

- **Main — BUILD `m.10.congruence` (sort)** "Which criterion?": bins "SSS", "SAS", "ASA", "AAS",
  "HL", "Not enough". Cards (△ABC and △DEF): "AB = DE, BC = EF, CA = FD" (SSS); "AB = DE,
  m∠B = m∠E, BC = EF" (SAS); "m∠A = m∠D, AB = DE, m∠B = m∠E" (ASA); "m∠A = m∠D, m∠B = m∠E,
  BC = EF" (AAS); "Right angles at C and F, AB = DE, AC = DF" (HL); "AB = DE, BC = EF,
  m∠A = m∠D" (Not enough: SSA); "All three angles equal" (Not enough). Card figures: marked
  triangles (Engine need 6); text until then. The ambiguous SSA pair is drawn on
  m.10.law-sines-cosines~ambiguous-case.
- **~corresponding-parts — BUILD** "Congruent parts with an unknown": `equation: '{p}x + {q} =
{r}x + {s}'`; values p, r (1–20), q, s (−100–100), x derived, L = AB (derived; constraint
  4 < L < 28 so it closes with the fixed BC = 16, AC = 12). Picture `triangleSolver` from demo
  `g.m10-congruence-sss` with `parts: { c: 'L', a: 16, b: 12 }`, `congruence: {}`. Example
  △ABC ≅ △DEF, AB = 3x + 2, DE = x + 14: 2x = 12, x = 6, AB = DE = 20.
- **~correspondence — BUILD (sort)** "△ABC ≅ △KLM: must it be true?": bins "Must be true",
  "Not always"; cards "∠B ≅ ∠L", "AC ≅ KM", "AB ≅ KL", "∠C ≅ ∠M" (must); "BC ≅ KL", "∠A ≅ ∠M",
  "AB ≅ LM", "∠B ≅ ∠K" (not always). Sentence: "The order of the letters pairs the parts."
- **~cpctc-proof — BUILD (sequence)** "Prove two segments congruent": given M is the midpoint
  of PQ and of RS; prove PR ≅ QS. 1 "PM ≅ QM and RM ≅ SM (M is the midpoint of both: given)."
  2 "∠PMR ≅ ∠QMS (Vertical angles)." 3 "△PMR ≅ △QMS (SAS)." 4 "PR ≅ QS (Corresponding parts of
  congruent triangles)." Stage 1 carries the given so 1–2 can't swap.
- Not built: SSS/SAS/ASA/AAS/HL demos (`g.m10-congruence-*`) as their own calculators: the
  numbers are incidental, and computing the rest needs the law of cosines (taught later).
  Their figures serve the sort cards once Engine need 6 lands.
- **Verdict:** 4 pages (1 calculator, 2 sorts, 1 sequence); 3 of 5 Solve, 2 Partly.

### 6. m.10.triangle-relationships — Relationships within triangles

- **Standard:** G-CO.10, G-C.3, G-CO.12.
- **Textbooks:** big-ideas-hs 10.6 (Relationships Within Triangles); envision-aga 10.5;
  hmh-into-hs 10.5; reveal-hs 10.1, 10.6.
- **Tests ask:** none released for this skill; one filed under similarity, then common types:

  | Question                                          | Page                     | Mark                                       |
  | ------------------------------------------------- | ------------------------ | ------------------------------------------ |
  | NAEP-2024-12M11-#14 (midsegment from a perimeter) | main                     | Partly (the side comes from 7x = 84 first) |
  | Midsegment length and x                           | main                     | Solves                                     |
  | Centroid splits a median 2 : 1                    | ~centroid                | Solves                                     |
  | Incenter distance, circumcenter radius            | ~incenter, ~circumcenter | Solves (right triangles) / Partly (others) |
  | Third side's range                                | ~inequality              | Solves                                     |
  | Which center?                                     | ~which-center            | Solves                                     |

- **Main — BUILD (promote `g.m10-triangle-relationships-midsegment`)** "The midsegment":
  values a BC, b CA, c AB (cm, 0.1–1000, closing constraint), m DE = a ÷ 2 (derived).
  Relation DE = BC ÷ 2 and DE ∥ BC. Example BC = 14, DE = 7. Assumption: D and E are midpoints
  of AB and AC.
- **~centroid — BUILD (promote `g.m10-triangle-relationships-centroid`)**: values median AD,
  AG = 2/3 AD, GD = 1/3 AD. Example AD = 12, AG = 8, GD = 4.
- **~incenter — BUILD (rework `g.m10-triangle-relationships-incenter`)** "Incircle of a right
  triangle": legs a, b, hypotenuse c = √(a² + b²) (derived), r = (a + b − c) ÷ 2 (derived).
  Why: the tangent lengths from each corner are equal and the right-angle corner's are r. Drop
  the demo's Heron formula (not in the course). Example 9, 12, 15: r = 3.
- **~circumcenter — BUILD (rework `g.m10-triangle-relationships-circumcenter`)**: right
  triangle; R = c ÷ 2, the circumcenter at the hypotenuse's midpoint. Example 5, 12, 13:
  R = 6.5. Assumption: for other triangles the center is where the perpendicular bisectors
  meet (drawn), found by construction, not by a formula here.
- **~inequality — BUILD** "Triangle inequality": values a, b (0.1–1000), low = |a − b|,
  high = a + b (derived); picture `triangleSolver` with the third side at the midpoint of the
  range. Example 7 and 11: 4 < c < 18. Assumption: the longest side is across from the
  largest angle.
- **~which-center — BUILD (sort)** bins "Centroid", "Incenter", "Circumcenter", "Orthocenter";
  cards "Medians meet", "Cuts each median 2 : 1 from the corner", "Balance point"; "Angle
  bisectors meet", "Same distance from all three sides", "Center of the circle inside touching
  each side"; "Perpendicular bisectors meet", "Same distance from all three corners", "Center of
  the circle through the corners"; "Altitudes meet". The orthocenter demo isn't a page (its
  altitude needs Heron).
- **Verdict:** 6 pages (5 calculators, 1 sort); common types Solve, 1 item Partly.

### 7. m.10.quadrilaterals — Quadrilaterals and other polygons

- **Standard:** G-CO.11, G-SRT.5; polygon angle sums extend 8.G.5 (no HS code).
- **Textbooks:** big-ideas-hs 10.5, 10.7 (Quadrilaterals and Other Polygons), 10.10;
  envision-aga 10.6, 10.9; reveal-hs 10.7.
- **Tests ask:** none released for this skill; filed elsewhere and common types:

  | Question                                                              | Page           | Mark                                    |
  | --------------------------------------------------------------------- | -------------- | --------------------------------------- |
  | MCAS-2026-G10M-#36 (inscribed pentagon, two equal angles)             | main           | Partly (sum 540°, then (540 − 330) ÷ 2) |
  | NAEP-1996-12M13-#2 (parallelogram with perpendicular diagonals)       | ~name-it       | Solves                                  |
  | Interior sum, each angle of a regular n-gon, n from an exterior angle | main           | Solves                                  |
  | Consecutive angles of a parallelogram                                 | ~parallelogram | Solves                                  |
  | Rhombus side from its diagonals                                       | ~rhombus       | Solves                                  |
  | Trapezoid midsegment                                                  | ~trapezoid     | Solves                                  |

- **Main — BUILD `m.10.quadrilaterals`** "Polygon angle sums": values n sides (3–30, integer),
  S interior sum (°, derived), e each interior angle of a regular polygon (derived), x each
  exterior (derived). Relations S = (n − 2) × 180°, e = S ÷ n, x = 360° ÷ n. Picture: a regular
  n-gon cut into n − 2 triangles from one corner (Engine need 4). Assumptions: the exterior
  angles of any convex polygon add to 360°; e and x only for regular polygons. Example n = 9:
  S = 1260°, e = 140°, x = 40°. `startWith: ['n']` (x typed gives n).
- **~parallelogram — BUILD (promote `g.m10-quadrilaterals-parallelogram`)**: m∠B = 180° − m∠A,
  m∠C = m∠A; w, h place the figure only (figure-only, Engine need 1). Example 58°, 122°.
- **~rectangle — BUILD (promote `g.m10-quadrilaterals-rectangle`)**: diagonal d = √(w² + h²);
  the diagonals are equal and bisect each other. Example 12 by 5: d = 13.
- **~rhombus — BUILD (rework `g.m10-quadrilaterals-rhombus`)**: values diagonals p, q, side
  s = √((p/2)² + (q/2)²), area pq ÷ 2. Drop the cosine route. Example 12 and 16: s = 10,
  area 96.
- **~trapezoid — BUILD (promote `g.m10-quadrilaterals-trapezoid`)**: midsegment
  m = (b₁ + b₂) ÷ 2, area m × h. Example bases 9 and 15, h = 5: m = 12, area 60.
- **~kite — BUILD (promote `g.m10-quadrilaterals-kite`)**: diagonals cross at right angles;
  the cross diagonal is bisected. Example halves 6, parts 8 and 4.5: sides √(36 + 64) = 10 and
  √(36 + 20.25) = 7.5.
- **~name-it — BUILD (sort)** "Name it exactly": bins "Parallelogram", "Rectangle", "Rhombus",
  "Square", "Trapezoid", "Kite"; cards "Both pairs of opposite sides parallel"; "A
  parallelogram with a right angle", "A parallelogram with equal diagonals"; "A parallelogram
  with perpendicular diagonals", "A parallelogram whose diagonals bisect its angles"; "A
  rectangle with two equal adjacent sides", "A rhombus with a right angle"; "Exactly one pair of
  parallel sides"; "Two pairs of equal adjacent sides, not all four equal". Card figure
  `polygon` with `marks`.
- **Verdict:** 7 pages (6 calculators, 1 sort); common types Solve, 1 item Partly.

### 8. m.10.similarity — Similarity: dilations and similar triangles

- **Standard:** G-SRT.1, G-SRT.2, G-SRT.3, G-SRT.4, G-SRT.5; G-C.1.
- **Textbooks:** eureka-hs 10.2; im-hs 10.3 (Similarity), 10.5 (scaling); openstax elementary
  algebra 9.8; big-ideas-hs 10.4, 10.8 (Similarity), 10.9; envision-aga 10.7; hmh-into-hs 10.3,
  10.6; reveal-hs 10.8, 10.9.
- **Tests ask:**

  | Question                                                   | Page                        | Mark                                                            |
  | ---------------------------------------------------------- | --------------------------- | --------------------------------------------------------------- |
  | NAEP-1992-12M14-#9 (similar triangles, find x)             | main                        | Solves                                                          |
  | NAEP-1996-12M12-#1 (DE ∥ BC, find DE)                      | ~splitter-base              | Solves                                                          |
  | NAEP-2005-12M12-#1 (which pairs must be similar)           | ~similar-or-not             | Solves                                                          |
  | NAEP-2005-12M12-#3 (enlargement keeps proportions?)        | ~scale-area                 | Partly (compare two factors by hand)                            |
  | NAEP-2024-12M11-#14 (midsegment)                           | m.10.triangle-relationships | Partly                                                          |
  | NAEP-1992-12M5-#16 (altitude in a right triangle with 60°) | ~right-altitude             | Partly; Solves with m.10.special-right-triangles~30-60-90 twice |
  | MCAS-2026-G10M-#7 (circle dilated by 2: circumference)     | ~scale-area                 | Solves                                                          |
  | MCAS-2026-G10M-#30 (two angles congruent)                  | ~similar-or-not             | Solves                                                          |
  | MCAS-2026-G10M-#33 (which is true: KM ∥ JN)                | ~side-splitter              | Partly (the converse is an assumption, not a check)             |

- **Main — BUILD (promote the `triangleSolver` similar demo `g.m10-similarity-scale`)**
  "Similar triangles": values a, b, c (0.1–1000, closing), k scale factor (0.01–100), d, e, f
  (derived). Relations d = ka, e = kb, f = kc; the angles are equal. Example 5, 6, 8 at k = 1.5:
  7.5, 9, 12. `startWith: ['a', 'b', 'c', 'k']`; typing d and a gives k.
- **~dilation — BUILD (promote `g.m10-similarity-dilation-enlarge`; shrink, inside and quarter
  are the same page at other values)**: `scaleCopy` with `center`; k (0.25–4), w, h, W = kw,
  H = kh; `dilationFits` constraint. Example 8 by 6, k = 0.5: 4 by 3, each image point halfway
  to O.
- **~side-splitter — BUILD (promote `g.m10-similarity-side-splitter`)**: AD ÷ DB = AE ÷ EC.
  Example AD = 6, DB = 4, AE = 9: EC = 6.
- **~splitter-base — BUILD (promote `g.m10-similarity-side-splitter-base`)**: k = AD ÷ AB,
  DE = k × BC. Example AD = 3, AB = 12, BC = 20: k = 0.25, DE = 5.
- **~scale-area — BUILD** "Scale factor, perimeter and area": `scaleCopy` with `area: ['A',
'A2']`; values w, h, k, P, P2 = kP, A, A2 = k²A. Example 3 by 4, k = 2.5: P 14 → 35, A 12 → 75. Assumption: every length (a circumference too) scales by k, every area by k².
- **~right-altitude — BUILD** "Altitude to the hypotenuse": `markedFigure` points with the
  right angle and the foot D; values p = AD, q = DB, h = √(pq), c = p + q, legs √(pc), √(qc).
  Example p = 4, q = 9: h = 6, c = 13, legs √52 ≈ 7.21 and √117 ≈ 10.82.
- **~similar-or-not — BUILD (sort)** bins "Similar by AA", "Similar by SSS", "Similar by SAS",
  "Not always similar"; cards "m∠A = m∠D and m∠B = m∠E", "Two equilateral triangles"; "Sides 3,
  4, 6 and 4.5, 6, 9"; "AB/DE = AC/DF = 2 and m∠A = m∠D"; "Two isosceles triangles", "Two right
  triangles", "Sides 4, 6, 8 and 6, 9, 13", "AB/DE = BC/EF and m∠A = m∠D".
- **Verdict:** 7 pages (6 calculators, 1 sort); 5 of 9 Solve, 4 Partly.

### 9. m.10.special-right-triangles — The Pythagorean converse and special right triangles

- **Standard:** G-SRT.4, G-SRT.6, G-SRT.8; 8.G.6 (the converse).
- **Textbooks:** eureka-hs 10.2; im-hs 10.4 (lessons 2–3); openstax algebra-trig 11.7;
  openstax precalculus 12.5; big-ideas-hs 10.9 (9.1–9.2); hmh-into-hs 10.7; reveal-hs 10.9.
- **Tests ask:**

  | Question                                         | Page                                 | Mark                                         |
  | ------------------------------------------------ | ------------------------------------ | -------------------------------------------- |
  | NAEP-1992-12M5-#16 (60°, AC = 12, find BD)       | ~30-60-90                            | Solves in two passes (AB = 6, then BD = 3√3) |
  | NAEP-2005-12M4-#13 (which could NOT be 30-60-90) | ~30-60-90                            | Partly (the page doesn't test a given pair)  |
  | NAEP-2009-12M2-#2 (short leg 8 at 60°, find h)   | ~30-60-90                            | Solves                                       |
  | MCAS-2026-G10M-#20 (sin B = √3/2)                | ~30-60-90 + m.10.right-triangle-trig | Partly                                       |
  | Common: right, acute or obtuse from three sides  | main                                 | Solves                                       |

- **Main — BUILD `m.10.special-right-triangles`** "Right, acute or obtuse?":
  `equation: '{a}^2 + {b}^2 {r:relation} {c}^2'` (the relation worked out, as on
  `m.6.integers~compare`); values a, b, c (0.1–1000, c the longest, closing constraint "The two
  shorter sides must add to more than the longest"), r derived. Picture `triangleSolver`
  `parts: { a, b, c }`. Assumption: = right, < obtuse, > acute. Example 8, 15, 17: 64 + 225 =
  289, right.
- **~45-45-90 — BUILD (promote `g.m10-special-right-triangles-45`)**: `equation: '{c} = {s}√2'`;
  `special: '45-45-90'`. Example leg 7: 7√2 ≈ 9.90; hypotenuse 10 gives leg 5√2 ≈ 7.07.
- **~30-60-90 — BUILD (promote `g.m10-special-right-triangles-30`)**: values s short leg, l =
  s√3, h = 2s (all 0.01–1000); equation `{l} = {s}√3`, h in a row. Example s = 5: l = 5√3 ≈
  8.66, h = 10. Assumption: the short leg is across from 30°.
- **Verdict:** 3 pages; 3 of 5 Solve, 2 Partly.

### 10. m.10.right-triangle-trig — Sine, cosine and tangent

- **Standard:** G-SRT.6, G-SRT.7, G-SRT.8.
- **Textbooks:** eureka-hs 10.2; im-hs 10.4 (Right Triangle Trigonometry); openstax
  algebra-trig 11.7; precalculus 12.5; big-ideas-hs 10.9 (9.4–9.6), 11.10; envision-aga 10.8;
  hmh-into-hs 10.7; larson precalculus 12.4; reveal-hs 10.9.
- **Tests ask:**

  | Question                                             | Page               | Mark                                          |
  | ---------------------------------------------------- | ------------------ | --------------------------------------------- |
  | NAEP-1992-12M12-#8 (angle in a pyramid, tan = 15/12) | ~find-angle        | Partly (the right triangle is inside a solid) |
  | NAEP-1992-12M15-#10 (cos A from legs 3 and 4)        | main               | Solves                                        |
  | NAEP-2005-12M12-#15 (50 ft, 40°: height)             | ~elevation (eye 0) | Solves                                        |
  | NAEP-2009-12M7-#11 (200 ft, 21°)                     | ~elevation         | Solves                                        |
  | MCAS-2026-G10M-#20 (sin B = √3/2)                    | main at 30°–60°    | Solves                                        |
  | MCAS-2026-G10M-#39 (sail height; sin x = h/34)       | ~find-side         | Solves                                        |
  | Common: sin A = cos(90° − A)                         | ~complement        | Solves                                        |

- **Main — BUILD (promote `g.m10-right-triangle-trig-sohcahtoa`)** "Sine, cosine and tangent":
  `trig: { angle: 'A' }`, C = 90. Values a opposite, b adjacent, c hypotenuse (0.01–10000),
  A (°, 0.01–89.99), sin, cos, tan (derived). Relations sin A = a/c, cos A = b/c,
  tan A = a/b, a² + b² = c². Example 5, 12, 13: sin A = 5/13 ≈ 0.3846, cos A = 12/13 ≈ 0.9231,
  tan A = 5/12 ≈ 0.4167, A ≈ 22.62°. `startWith: ['a', 'b']`.
- **~find-side — BUILD (promote `g.m10-right-triangle-trig-ladder`)**: `equation:
'sin({A}°) = {o}/{h}'`, the adjacent side in a row with cos. Example ladder 25 ft at 38°:
  25 sin(38°) ≈ 15.39 ft up, 25 cos(38°) ≈ 19.70 ft out.
- **~find-angle — BUILD (promote `g.m10-right-triangle-trig-ramp`)**: `equation:
'tan({A}°) = {o}/{a}'` solved for A with tan⁻¹. Example rise 2 ft, run 24 ft:
  A = tan⁻¹(0.0833) ≈ 4.76°.
- **~elevation — BUILD (promote `g.m10-right-triangle-trig-elevation`)**: `scene: { kind:
'sight', eye: 'e' }`; values distance d (0.1–10000 ft), angle A, eye height e (0–10 ft),
  height H = d tan A + e. Example d = 120 ft, A = 28°, e = 5 ft: 63.81 + 5 = 68.81 ft.
  Distances reach 10000 ft so the 200 ft item fits.
- **~complement — BUILD** "Sine and cosine of complementary angles": values A, B = 90° − A,
  sin A, cos B; picture `triangleSolver` `trig: { angle: 'A' }`. Example A = 28°:
  sin(28°) = cos(62°) ≈ 0.4695.
- **Verdict:** 5 pages; 6 of 7 Solve, 1 Partly.

### 11. m.10.law-sines-cosines — The law of sines and the law of cosines

- **Standard:** G-SRT.9, G-SRT.10, G-SRT.11 (+).
- **Textbooks:** eureka-hs 10.2, 12.4; openstax algebra-trig 12.10; precalculus 12.8;
  big-ideas-hs 10.9 (9.7); envision-aga 10.8, 11.8; hmh-into-hs 10.7; larson precalculus 12.6;
  reveal-hs 10.9.
- **Tests ask:** no released questions; common types:

  | Question                                                 | Page            | Mark   |
  | -------------------------------------------------------- | --------------- | ------ |
  | Two angles and a side (AAS, ASA)                         | main            | Solves |
  | Two sides and the included angle                         | ~sas            | Solves |
  | Three sides, find an angle                               | ~sss            | Solves |
  | Two sides and a non-included angle: 0, 1 or 2 triangles  | ~ambiguous-case | Solves |
  | Area from two sides and the included angle               | ~area           | Solves |
  | NAEP-2005-12M3-#4 (8, 8, 40°), filed under constructions | ~sas            | Solves |

- **Main — BUILD (promote `g.m10-law-sines-cosines-sines`)** "The law of sines":
  `equation: '{a}/{sin({A}°)} = {b}/{sin({B}°)}'`; values A, B, C (°), a, b, c; relations
  `sines`, `angleSum`, `triangleCloses`. Example A = 35°, B = 80°, a = 9: C = 65°,
  b = 9 sin(80°)/sin(35°) ≈ 15.45, c ≈ 14.22.
- **~sas — BUILD (promote `g.m10-law-sines-cosines-sas`)**: a² = b² + c² − 2bc cos A. Example
  b = 7, c = 10, A = 50°: a² = 149 − 140 cos(50°) ≈ 59.01, a ≈ 7.68.
- **~sss — BUILD (promote `g.m10-law-sines-cosines-sss`)**: cos C = (a² + b² − c²)/(2ab).
  Example 5, 7, 9: cos C = −7/70 = −0.1, C ≈ 95.74°.
- **~ambiguous-case — BUILD (promote `g.m10-law-sines-cosines-ssa`)**: both triangles drawn.
  Example A = 30°, a = 6, b = 10: sin B = 5/6, B ≈ 56.44° or 123.56°, C ≈ 93.56° or 26.44°.
  Assumption: a ≥ b gives one triangle; a < b sin A gives none.
- **~area — BUILD** "Area from two sides and an angle": values a, b, C, area K = ½ab sin C;
  picture `triangleSolver` SAS. Example 8, 11, 40°: K = 44 sin(40°) ≈ 28.28.
- **Verdict:** 5 pages; all common types Solve.

### 12. m.10.coordinate-geometry — Distance, midpoint, partitioning and coordinate proofs

- **Standard:** G-GPE.4, G-GPE.5, G-GPE.6, G-GPE.7.
- **Textbooks:** eureka-hs 10.4, 10.5; im-hs 10.6 (Coordinate Geometry); openstax intermediate
  algebra 11.11; big-ideas-hs 10.1 (1.3–1.4), 10.3, 10.5 (5.8), 10.10; envision-aga 10.1, 10.2,
  10.9; hmh-into-hs 10.1, 10.2, 10.8; reveal-hs 10.1, 10.3, 10.5, 10.10.
- **Tests ask:**

  | Question                                                | Page                        | Mark                              |
  | ------------------------------------------------------- | --------------------------- | --------------------------------- |
  | NAEP-1992-12M7-#7 (distance, (2, 10) and (−4, 2))       | main                        | Solves                            |
  | NAEP-2024-12M4-#16 (midpoint of (−6, −11) and (14, −3)) | ~midpoint                   | Solves once coordinates reach ±20 |
  | NAEP-2009-12M2-#12 (justify a parallelogram)            | ~parallelogram              | Solves                            |
  | MCAS-2026-G10M-#23 (C twice as far from A as from B)    | ~partition                  | Solves                            |
  | NAEP-1992-12M7-#10 (line y = 4 meets x² + y² = 25)      | m.10.circle-equations~point | Partly                            |
  | Common: perimeter and area of a polygon on the grid     | ~perimeter                  | Solves                            |

- **Main — BUILD (promote `g.m10-coordinate-geometry-distance`)** "Distance between two
  points": values x1, y1, x2, y2 (−20–20, step 0.5), d = √((x₂ − x₁)² + (y₂ − y₁)²). Picture
  `coordinatePlane` segment and legs. Example A(−3, 2), B(5, 8): √(64 + 36) = 10.
- **~midpoint — BUILD (promote `g.m10-coordinate-geometry-midpoint`)**: widen every coordinate
  to −20–20 (the demo's −10–10 misses NAEP's 14 and −11) and the extent with it (Engine need
  11). Solving for x2, y2 gives the other endpoint. Example (−4, 3) and (8, −5): M(2, −1).
- **~partition — BUILD (promote `g.m10-coordinate-geometry-partition`)**: ratio m : n
  (1–10 each). Example A(−2, 1), B(10, 7), 1 : 2: P = (−2 + 1/3 × 12, 1 + 1/3 × 6) = (2, 3).
- **~parallelogram — BUILD (promote `g.m10-coordinate-geometry-parallelogram`)**: `polygon`,
  `slopes: true`; opposite sides with equal slopes. Example A(−3, −1), B(−1, 3), C(5, 4),
  D(3, 0): AB and DC slope 2, BC and AD slope 1/6.
- **~right-triangle — BUILD (promote `g.m10-coordinate-geometry-right-triangle`)**: slopes whose
  product is −1, or a vertical side meeting a horizontal one. Example A(−1, 1), B(1, 5),
  C(5, 3): AB slope 2, BC slope −1/2, product −1: right angle at B.
- **~perimeter — BUILD** "Perimeter and area on the grid": `polygon` of 3 corners; sides by
  the distance formula, area ½ × base × height when a side is level. Example A(0, 0), B(6, 0),
  C(3, 4): sides 6, 5, 5, perimeter 16, area 12.
- **Verdict:** 6 pages; 5 of 6 Solve, 1 Partly.

### 13. m.10.circle-theorems — Arcs, chords, tangents and inscribed angles

- **Standard:** G-C.2, G-C.3, G-C.4 (+).
- **Textbooks:** eureka-hs 10.5; im-hs 10.7 (Circles, lessons 1–7); big-ideas-hs 10.10
  (Circles, 10.1–10.6); envision-aga 10.10; hmh-into-hs 10.8; reveal-hs 10.10.
- **Tests ask:**

  | Question                                                                       | Page                           | Mark                                        |
  | ------------------------------------------------------------------------------ | ------------------------------ | ------------------------------------------- |
  | NAEP-2009-12M7-#4 (inscribed right angle: BD is a diameter)                    | ~semicircle                    | Partly (the converse is in the assumptions) |
  | NAEP-1996-12M10-#10 (find the center)                                          | m.10.constructions~find-center | Solves                                      |
  | MCAS-2026-G10M-#36 (inscribed pentagon)                                        | m.10.quadrilaterals main       | Partly                                      |
  | Common: inscribed from central angle; tangent ⟂ radius; chord, secant products | main and types                 | Solves                                      |
  | Common: opposite angles of an inscribed quadrilateral                          | ~cyclic-quadrilateral          | Solves (after Engine need 7)                |

- **Main — BUILD (promote `g.m10-circle-theorems-inscribed`)** "Inscribed angles": values
  central angle (°, 0.1–359.9), inscribed = central ÷ 2. Example arc 130°: inscribed 65°.
  Assumption: every inscribed angle on the same arc is equal.
- **~semicircle — BUILD (promote `g.m10-circle-theorems-semicircle`)**: m∠PAB + m∠PBA = 90°.
  Example 34° and 56°. Assumption: an inscribed right angle stands on a diameter.
- **~tangent — BUILD (promote `g.m10-circle-theorems-tangent`)**: d² = r² + t². Example r = 8,
  t = 15: d = 17.
- **~chords — BUILD (promote `g.m10-circle-theorems-chords`)**: AE × EB = CE × ED. Example
  6 × 4 = 3 × 8.
- **~secants — BUILD (promote `g.m10-circle-theorems-secants`)**: PA × PB = PC × PD. Example
  3 × 10 = 5 × 6.
- **~secant-tangent — BUILD (promote `g.m10-circle-theorems-secant-tangent`)**: PT² = PA × PB.
  Example PA = 4, PB = 16: PT = 8.
- **~cyclic-quadrilateral — BUILD (waits on Engine need 7)**: m∠A + m∠C = 180°, m∠B + m∠D =
  180°. Example m∠A = 84°: m∠C = 96°.
- **~chord-angle — BUILD (waits on Engine need 7)** "Angles from arcs": inside the circle
  (arc₁ + arc₂) ÷ 2, outside (far − near) ÷ 2, with a sign switch for which. Example inside:
  70° and 110° give 90°; outside: 140° and 50° give 45°.
- **Verdict:** 8 pages (2 wait on the picture); common types Solve, 2 items Partly.

### 14. m.10.circle-equations — Equations of circles

- **Standard:** G-GPE.1, G-GPE.4.
- **Textbooks:** reveal-hs 10.10; also big-ideas-hs 10.10 (10.7 Circles in the Coordinate
  Plane) and im-hs 10.6 (lessons 4–6), which the crosswalk files elsewhere.
- **Tests ask:** none filed here; two belong here:

  | Question                                                                                  | Page          | Mark                                                   |
  | ----------------------------------------------------------------------------------------- | ------------- | ------------------------------------------------------ |
  | MCAS-2026-G10M-#5 (center and radius of (x + 4)² + (y − 2)² = 9), filed under m.12.conics | main          | Solves (after Engine need 2)                           |
  | NAEP-1992-12M7-#10 (circle r = 5 meets y = 4)                                             | ~point        | Partly (one root; the mirror point in the assumptions) |
  | Common: write the equation from center and radius                                         | main          | Solves                                                 |
  | Common: complete the square to find center and radius                                     | ~general-form | Solves                                                 |

- **Main — BUILD (promote `g.m10-circle-equations-center`; `-origin` is the same page at
  h = k = 0)**: `equation: '(x − {h})² + (y − {k})² = {r}^2'`; values h, k (−20–20), r
  (0.1–100). Picture `conicGraph` circle. Example center (3, −2), r = 5: (x − 3)² + (y + 2)² = 25
  (needs a negative k written "+ 2": Engine need 2).
- **~general-form — BUILD** "From x² + y² + Dx + Ey + F = 0": values D, E, F (−100–100), h =
  −D ÷ 2, k = −E ÷ 2, r = √(h² + k² − F) (constraint r² > 0: "This equation has no circle").
  Example x² + y² − 6x + 4y − 12 = 0: h = 3, k = −2, r² = 9 + 4 + 12 = 25, r = 5.
- **~point — BUILD** "A point on the circle": `point: { x: 'x', y: 'y' }`; relation (x − h)² +
  (y − k)² = r². Example center (1, 2), r = 5, y = 5: (x − 1)² = 16, x = 5 (and x = −3).
- **Verdict:** 3 pages; 3 of 4 Solve, 1 Partly.

### 15. m.10.arc-sector — Arc length, sector area and radian measure

- **Standard:** G-C.5, F-TF.1.
- **Textbooks:** eureka-hs 10.5; im-hs 10.7 (lessons 8–13); openstax algebra-trig 11.7;
  precalculus 12.5; big-ideas-hs 10.11 (Circumference and Area); envision-aga 10.10;
  hmh-into-hs 10.8; reveal-hs 10.10, 10.11.
- **Tests ask:**

  | Question                                                       | Page                      | Mark                                                   |
  | -------------------------------------------------------------- | ------------------------- | ------------------------------------------------------ |
  | NAEP-1990-12M9-#14 (three semicircles on a triangle of side 1) | main (180°, r = 0.5)      | Partly (× 3 by hand)                                   |
  | NAEP-1996-12M13-#7 (an arc of 235°)                            | main (major arcs to 360°) | Partly (a protractor drawing)                          |
  | MCAS-2026-G10M-#25 (90° turn sweeps 3π cm: radius)             | main solved for r         | Solves (typing 3π needs Engine need 3; 9.42 works now) |
  | Common: sector area in degrees                                 | main                      | Solves                                                 |
  | Common: s = rθ, degrees to radians                             | ~radians                  | Solves                                                 |

- **Main — BUILD (promote `g.m10-arc-sector-degrees`; `-major` is the same page past 180°)**:
  `circle` with `sector: { angle: 't', arc: 's', area: 'A' }`; values r (0.01–1000), θ (°,
  0.1–360), s = θ/360 × 2πr, A = θ/360 × πr². Example r = 6 cm, θ = 150°: s = 5π ≈ 15.71 cm,
  A = 15π ≈ 47.12 cm². `startWith: ['r', 't']`.
- **~radians — BUILD (promote `g.m10-arc-sector-radians`)**: `views: ['radian', 'sector']`;
  values r, θ (rad, 0.01–6.28), s = rθ, A = r²θ ÷ 2, θ° = θ × 180/π (derived). Example r = 4,
  θ = 2.5: s = 10, A = 20, θ ≈ 143.24°.
- **Verdict:** 2 pages; 3 of 5 Solve, 2 Partly.

### 16. m.10.volume-derivations — Surface area, volume, cross sections and Cavalieri

- **Standard:** G-GMD.1, G-GMD.3, G-GMD.4, G-MG.1.
- **Textbooks:** eureka-hs 10.3, 12.3; im-hs 10.5 (Solid Geometry); big-ideas-hs 10.12
  (Surface Area and Volume); envision-aga 10.11; hmh-into-hs 10.9; reveal-hs 10.11.
- **Tests ask:**

  | Question                                                | Page                           | Mark                                                    |
  | ------------------------------------------------------- | ------------------------------ | ------------------------------------------------------- |
  | NAEP-1990-12M9-#11 (plane through a prism: pentagon)    | ~cross-section-shapes          | Partly (a pentagon card; the item's figure isn't drawn) |
  | NAEP-1992-12M15-#9 (three cylinders, order the volumes) | main                           | Partly (three runs)                                     |
  | NAEP-2005-12M12-#18 (sphere r = 2: surface area)        | ~sphere                        | Solves                                                  |
  | NAEP-2005-12M4-#12 (folds into a square pyramid)        | ~pyramid (`net` squarePyramid) | Partly                                                  |
  | NAEP-2013-12M99-#2, #3, #4 (folded card angles)         | none                           | No (a 3D fold; Engine need 15)                          |
  | MCAS-2026-G10M-#7 (circle dilated: circumference)       | m.10.similarity~scale-area     | Solves                                                  |
  | MCAS-2026-G10M-#27 (can's volume, cone scoops)          | main + ~cone                   | Partly (two pages)                                      |

- **Main — BUILD (promote `g.m10-volume-derivations-cavalieri`)** "Cylinder volume and
  Cavalieri's principle": values r, h (0.01–1000 cm), V = πr²h. Example r = 3 cm, h = 8 cm:
  V = 72π ≈ 226.19 cm³. Assumption: equal cross-sections at every height mean equal volume,
  so a leaning stack keeps V.
- **~cylinder-surface — BUILD (promote `g.m10-volume-derivations-cylinder-net`)**: S = 2πr² +
  2πrh. Example r = 4, h = 7: 32π + 56π = 88π ≈ 276.46 cm².
- **~cone — BUILD (promote `g.m10-volume-derivations-cone-upright` shape with volume)**:
  V = ⅓πr²h. Example r = 3, h = 4: 12π ≈ 37.70 cm³.
- **~cone-surface — BUILD (promote `g.m10-volume-derivations-cone-net`)**: ℓ = √(r² + h²),
  S = πr² + πrℓ. Example r = 3, h = 4: ℓ = 5, S = 24π ≈ 75.40 cm².
- **~pyramid — BUILD** "Pyramid volume": `crossSection` solid pyramid with a level cut; values
  base side b, height h, V = ⅓b²h. Example b = 6, h = 10: V = 120 cm³.
- **~sphere — BUILD (promote `g.m10-volume-derivations-sphere-surface`)**: S = 4πr², V = 4/3πr³.
  Example r = 5: S = 100π ≈ 314.16 cm², V = 500π/3 ≈ 523.60 cm³ (r = 3 avoided: S and V
  print the same number).
- **~cross-section — BUILD (promote `g.m10-volume-derivations-cone-section`)**: a level cut at
  height z has radius r(h − z)/h. Example r = 6, h = 9, z = 3: radius 4, area 16π ≈ 50.27 cm².
- **~cross-section-shapes — BUILD (sort)** bins "Circle", "Ellipse", "Triangle", "Square",
  "Rectangle", "Pentagon"; cards "Cylinder cut level", "Sphere cut by any plane"; "Cone cut on a
  slant, missing the base", "Cylinder cut on a slant, missing both bases"; "Cone cut straight
  down through its tip", "Cube cut through the three corners next to one corner"; "Cube cut
  level", "Square pyramid cut level"; "Cylinder cut straight down through its axis", "Cube cut
  straight down through two opposite edges"; "Cube cut by a plane crossing five of its faces".
  Each card has one right bin. Card figure: Engine need 12.
- **~solids-of-revolution — BUILD (sort)** bins "Cylinder", "Cone", "Sphere"; cards "A
  rectangle turned about one side", "A square turned about a side", "A right triangle turned
  about a leg", "An isosceles triangle turned about its line of symmetry", "A semicircle turned
  about its diameter", "A circle turned about a diameter".
- **Verdict:** 9 pages (7 calculators, 2 sorts); 2 of 9 Solve, 6 Partly, 1 No.

### 17. m.10.probability-rules — Sample spaces, addition rule, permutations, combinations

- **Standard:** S-CP.1, S-CP.7, S-CP.9 (+); S-MD.6, S-MD.7 (+).
- **Textbooks:** openstax algebra-trig 12.13; precalculus 12.11; statistics 12.3; big-ideas-hs
  10.13 (13.1, 13.5, 13.6), 11.8; envision-aga 10.12, 11.12; larson-farber 12.3; larson
  precalculus 12.1, 12.9; reveal-hs 10.12.
- **Tests ask:** none filed here; two belong here, then common types:

  | Question                                    | Page                         | Mark                           |
  | ------------------------------------------- | ---------------------------- | ------------------------------ |
  | NAEP-1990-12M9-#17 (three coins, two heads) | ~sample-space                | Solves                         |
  | NAEP-2024-12M4-#18 (gym Venn from counts)   | ~neither                     | Partly (counts, Engine need 8) |
  | P(A or B) with overlap                      | main                         | Solves                         |
  | Mutually exclusive; complement              | ~exclusive, ~complement      | Solves                         |
  | Arrangements and committees                 | ~permutations, ~combinations | Solves                         |
  | Probability by counting                     | ~counting-probability        | Solves                         |

- **Main — BUILD (promote `g.m10-probability-rules-union`)** "The addition rule": `venn` with
  `shade: 'or'`; values P(A), P(B), P(A and B) (0–1), P(A or B) derived. Relation P(A or B) =
  P(A) + P(B) − P(A and B). Example 0.45 + 0.30 − 0.12 = 0.63.
- **~exclusive — BUILD (promote `g.m10-probability-rules-exclusive`)**: P(A and B) = 0.
  Example 0.25 + 0.40 = 0.65.
- **~complement — BUILD (promote `g.m10-probability-rules-complement`)**: P(not A) = 1 − P(A).
  Example 0.35 → 0.65.
- **~neither — BUILD (promote `g.m10-probability-rules-neither`)**: 1 − P(A or B). Example
  1 − 0.63 = 0.37.
- **~sample-space — BUILD** "Listing equally likely outcomes": `treeDiagram` equally-likely,
  three stages of 2; values outcomes (derived 8), favourable f, P = f ÷ 8. Example exactly two
  heads: HHT, HTH, THH, 3/8 = 0.375.
- **~permutations — BUILD (promote `g.m10-probability-rules-permutations`)**:
  `equation: 'P({n}, {r}) = {c}'`. Example P(8, 3) = 8 × 7 × 6 = 336.
- **~combinations — BUILD (promote `g.m10-probability-rules-combinations`)**:
  `equation: 'C({n}, {r}) = {c}'`. Example C(8, 3) = 336 ÷ 6 = 56.
- **~counting-probability — BUILD** "Probability with combinations": values a group size,
  b other group, r chosen, P = C(a, r) ÷ C(a + b, r). Picture `pascalTriangle` slots (Engine
  need 16 for the fraction of two). Example 3 chosen from 5 girls and 4 boys, all girls:
  10/84 = 5/42 ≈ 0.119.
- **Verdict:** 8 pages; all common types Solve; 1 item Partly.

### 18. m.10.conditional-probability — Conditional probability and independence

- **Standard:** S-CP.2, S-CP.3, S-CP.4, S-CP.5, S-CP.6, S-CP.8 (+).
- **Textbooks:** eureka-hs 9.2, 11.4, 12.5; im-hs 9.3, 10.8 (Conditional Probability);
  openstax 12.13, 12.11, statistics 12.3; big-ideas-hs 9.11, 10.13 (13.2–13.4), 11.8;
  envision-aga 9.11, 10.12, 11.12; hmh-into-hs 9.10, 10.10, 11.8; larson-farber 12.3;
  reveal-hs 10.12.
- **Tests ask:**

  | Question                                              | Page                                | Mark                                 |
  | ----------------------------------------------------- | ----------------------------------- | ------------------------------------ |
  | NAEP-1990-12M9-#17 (three coins)                      | m.10.probability-rules~sample-space | Solves                               |
  | NAEP-2005-12M12-#2 (puppies: P(male given brown))     | main                                | Solves                               |
  | NAEP-2005-12M12-#9 (0.9 twice)                        | ~independent                        | Solves                               |
  | NAEP-2009-12M7-#12 (three on-time chances)            | ~independent                        | Partly (three stages, Engine need 9) |
  | NAEP-2024-12M4-#18 (gym Venn, counts)                 | m.10.probability-rules~neither      | Partly                               |
  | NAEP-2024-12M9-#18 (allergy test)                     | ~tree                               | Solves                               |
  | MCAS-2026-G10M-#9 (lunch table: fraction of a column) | main                                | Solves (cells to 1000)               |
  | MCAS-2026-G10M-#29 (independent, P(A or B))           | ~independent                        | Solves                               |
  | MCAS-2026-G10M-#34 (beverage Venn, counts)            | ~venn                               | Partly (counts)                      |

- **Main — BUILD (promote `g.m10-conditional-probability-table`)** "Conditional probability
  from a two-way table": `equation: 'P(A | B) = {ab}/{b}'`; `table` `twoWay` 2 × 3 with
  `lit`, `of: 'col'`, `bar: 'cols'`; six cells (0–1000, integer). Example Late 12, 4, 9; On time
  48, 36, 51 (Bus 60, Walk 40, Car 60, total 160): P(Late | Bus) = 12/60 = 0.2, and
  P(Bus | Late) = 12/25 = 0.48 shows the order matters.
- **~tree — BUILD (promote `g.m10-conditional-probability-tree`)**: P(A and B) = P(A) ×
  P(B | A); P(B) over both paths; P(A | B). Example P(Rain) = 0.3, P(Late | Rain) = 0.4,
  P(Late | Dry) = 0.1: 0.12 + 0.07 = 0.19; P(Rain | Late) = 0.12/0.19 ≈ 0.632.
- **~independent — BUILD (promote `g.m10-conditional-probability-independent`)**: the same
  P(B | A) on both branches; P(A and B) = P(A) × P(B), P(A or B) derived. Example 0.6 and 0.3:
  0.18 and 0.72.
- **~dependent — BUILD (promote `g.m10-probability-rules-without-replacement`)**: the second
  branch changes. Example 5 red and 3 blue, two reds: 5/8 × 4/7 = 5/14 ≈ 0.357.
- **~venn — BUILD (promote `g.m10-conditional-probability-venn`)**: P(B | A) = P(A and B) ÷
  P(A). Example 0.5, 0.4, 0.15: P(B | A) = 0.3, not 0.4, so A and B are dependent.
- **Verdict:** 5 pages; 6 of 9 Solve (with the rules page), 3 Partly.

## Engine and picture needs

1. **Figure-only values**: numbers that place a drawing (BD = s sin(A/2), a parallelogram's
   w and h) without a Formulas row or a step. Waits: proofs~isosceles,
   quadrilaterals~parallelogram, congruence~corresponding-parts (fixed sides), incenter demo.
2. **Signed constants in templates**: `(x − {h})²` with h = −4 must print (x + 4)², and
   `+ {s}` with s < 0 print − 7 (EQUATION_INPUTS says m.6.expressions-variables still can't).
   Waits: circle-equations main and ~general-form; constructions~midpoint,
   parallel-lines~algebra, congruence~corresponding-parts.
3. **π-multiple entry** (`{s}π`, type 3π, show 3π): arc-sector main and ~radians, volume pages.
4. **Regular polygon picture** (n = 3–30, triangles from one corner, one exterior angle marked):
   quadrilaterals main.
5. **Construction figure** (compass arcs drawn stage by stage, as a sequence card figure or an
   explore figure; `markedFigure` as an explore figure would do): constructions ~bisector-steps,
   ~angle-bisector-steps, ~find-center; proofs main, ~triangle-sum-proof, congruence~cpctc-proof
   (lit parts per stage).
6. **Marked-triangle card figure** (ticks, arcs, right-angle marks on two triangles): congruence
   main, similarity~similar-or-not.
7. **circleTheorems `cyclic` and `arcAngle`** (inscribed quadrilateral; an angle inside or
   outside from two arcs): circle-theorems ~cyclic-quadrilateral, ~chord-angle.
8. **Venn with counts** (whole numbers, total outside): probability-rules~neither, conditional~venn
   (NAEP-2024-12M4-#18, MCAS-2026-G10M-#34).
9. **Chance tree with three stages**: conditional~independent (NAEP-2009-12M7-#12).
10. **lineSystem marks**: parallel arrows and a right-angle square where lines are
    perpendicular; the given point: parallel-lines ~parallel-line, ~perpendicular-line.
11. **coordinatePlane extent from values** (reach ±20): coordinate-geometry pages.
12. **Cross-section card figure** (a solid with its cutting plane and the section): volume
    ~cross-section-shapes.
13. **Harness PHRASES**: "m∠1", "sin(38°)" with the degree sign, "tan⁻¹(0.0833)", "P(8, 3)",
    "C(8, 3)", "P(A | B)"; confirm each reads before building.
14. **transformation symmetry about a center off the origin** for a parallelogram (order 2 at
    its center): rigid-motions~symmetry for MCAS-2026-G10M-#41.
15. **Folded-card 3D figure** (a card folded along a line, angle between halves): none waits;
    logs NAEP-2013-12M99 #2–#4 as No.
16. **pascalTriangle fraction of two counts** (C(a, r) over C(a + b, r)): probability
    ~counting-probability.

## Not in the taxonomy

- Density and modeling with solids (G-MG.2; IM Solid Geometry lessons 17–18) has no skill.
- Solids of revolution sit under m.10.volume-derivations (planned there as a sort).
- Geometric mean in right triangles (big-ideas 9.3, IM 3.13–3.15) sits under m.10.similarity.
- Triangle area ½ab sin C (G-SRT.9) sits under m.10.law-sines-cosines.
- Equations of parallel and perpendicular lines (G-GPE.5) sit under m.10.parallel-lines.
- Binomial distribution (big-ideas 13.7) and focus of a parabola (10.8) belong to m.11/m.12.
- `[data] research/questions`: MCAS-2026-G10M-#5 → m.10.circle-equations (filed m.12.conics);
  MCAS-2026-G10M-#7 → m.10.similarity (filed m.10.volume-derivations); NAEP-1992-12M7-#10 →
  m.10.circle-equations; NAEP-1990-12M9-#17 → m.10.probability-rules; NAEP-2024-12M4-#18 →
  m.10.probability-rules; NAEP-2005-12M3-#4 → m.10.proofs (isosceles) or law-sines-cosines.
- m.10.circle-equations: the crosswalk lists only reveal-hs; big-ideas 10.7 and IM 6.4–6.6
  teach it too.

## Priority

1. Engine needs 2 (signed constants), 1 (figure-only values) and 13 (harness phrases): several
   skills' pages can't be written honestly without them.
2. Promote-and-adjust pages with released questions: right-triangle-trig (5), similarity (7),
   conditional-probability (5), coordinate-geometry (6), special-right-triangles (3),
   arc-sector (2), volume-derivations (9).
3. Circles and algebra-in-geometry: circle-theorems (6 now, 2 after need 7), circle-equations,
   law-sines-cosines, probability-rules.
4. Geometry foundations with layouts: constructions, proofs, parallel-lines, rigid-motions,
   congruence, triangle-relationships, quadrilaterals (need 4 for the main page).
5. Pictures 5, 6, 7, 8, 9, 12 in that order (5 and 6 serve the most pages).

## Added skills

### 19. m.10.modeling-density — Modeling with geometry: density, design and optimization

- **Standard:** G-MG.1, G-MG.2, G-MG.3.
- **Textbooks:** reveal-hs 10.11 (lesson 11-9, Density); im-hs 10.5 (Solid Geometry, lessons
  17 "Volume and Density" and 18 "Volume and Graphing"); big-ideas-hs 10.11.4 (Modeling with
  Area: population density), 10.12.6 (Modeling with Surface Area and Volume). The crosswalk
  lists only reveal-hs 10.11; IM and Big Ideas teach it too.
- **Tests ask:** `research/questions/` files no question under this skill (COVERAGE.md: 0), and
  no grade 9–12 file has a density or design item. Common textbook problems instead:

  | Question                                                     | Page        | Mark   |
  | ------------------------------------------------------------ | ----------- | ------ |
  | Common: a solid's mass and size, find the density (material) | main        | Solves |
  | Common: a ball of a known material, find its mass            | ~sphere     | Solves |
  | Common: people in a region modeled as a circle, per km²      | ~population | Solves |
  | Common: a can of fixed volume, the radius with least metal   | ~can-design | Solves |
  | Common: a fixed length of fence, the pen with the most area  | ~fence      | Solves |

- **Main — MOVE (from `m.10.volume-derivations~density`)** "Density": `curvedSolid` cylinder
  { radius r, height h, volume V }, m and ρ labeled under it. Values r, h (0.01–1000 cm),
  V (cm³, plain decimal: a π volume's check misreads under mm³), m (g, kg), ρ (g/cm³, kg/m³).
  Relations V = πr²h, ρ = m ÷ V. Example r = 2 cm, h = 5 cm, m = 170 g: V = 20π ≈ 62.83 cm³,
  ρ = 170 ÷ 62.83 ≈ 2.71 g/cm³ (about aluminum). `startWith: ['r', 'h', 'm']`.
- **~sphere — BUILD** "Mass of a ball from its density": `curvedSolid` sphere { radius r,
  volume V }, ρ and m labeled. V = 4πr³ ÷ 3, ρ = m ÷ V. Example r = 1.5 cm, ρ = 7.8 g/cm³:
  V = 4.5π ≈ 14.14 cm³, m = 7.8 × 14.14 ≈ 110.27 g. `use`: “A steel ball has radius 1.5 cm …
  Find its mass.” `startWith: ['r', 'rho']`.
- **~population — BUILD** "Population density": `circle` { radius r, area A }, N and D labeled.
  Values r (0.01–10,000 km), A (km²), N (people), D (people per km², a fixed label: the
  formula works in km² whatever unit A is shown in). A = πr², D = N ÷ A. Example r = 3 km,
  N = 45,000: A = 9π ≈ 28.27 km², D ≈ 1,591.55 people per km². `startWith: ['r', 'N']`.
- **~can-design — BUILD** "Designing a can with the least material": `table` sweeping r with V
  held, output S (seven radii in 1–2–5 steps around the best one, ∛(V ÷ 2π)). Values V, r, h,
  S (cm only, so the table's rows are in the unit shown). V = πr²h, S = 2πr² + 2πrh. Example
  V = 500 cm³, r = 4 cm: h = 500 ÷ 16π ≈ 9.95 cm, S = 32π + 250 ≈ 350.53 cm²; the table's
  r = 1 … 7 gives 1,006.3, 525.1, 389.9, 350.5, 357.1, 392.9, 450.7 (least near r = 4.3, where
  h = 2r). `startWith: ['V', 'r']`.
- **~fence — BUILD** "The most area for a fixed perimeter": `rectangle` { length x, width y,
  around P, inside A }. P = 2x + 2y, A = xy; limits x, y < P ÷ 2 with a message. Example
  P = 40 m, x = 12 m: y = 8 m, A = 96 m² (the 10 by 10 square holds 100 m²).
  `startWith: ['P', 'x']`.
- **Picture needs:** a surface-area-against-radius graph for ~can-design (the table stands in);
  an irregular region on a map grid for ~population (the circle stands in).
- **Verdict:** 5 calculators; all 5 common problems Solve.

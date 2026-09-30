/**
 * Pictures requested for Grades 9–12 (ids H..), from the high-school textbook research
 * (research/textbooks/grades/9.md–12.md) and the skills in taxonomy.ts. Spread into
 * PICTURE_REQUESTS; the picture chat's brief is docs/RENDERINGS_HS.md, which gives each one's
 * full spec. `pages` are the planned skills (their main pages until the lesson chat names the
 * problem types).
 */
import type { PictureRequest } from './pictureRequests';

const ask = (
  id: string,
  kind: string,
  what: string,
  pages: string[],
  notes?: string,
): PictureRequest => ({
  id,
  what,
  kind,
  pages,
  status: 'requested',
  gallery: [],
  ...(notes ? { notes } : {}),
});

export const HS_PICTURE_REQUESTS: PictureRequest[] = [
  // ── A. Shared math pictures (new kinds, most pages first) ──
  {
    ...ask(
      'H01',
      'functionGraph',
      'Graph of y = f(x) for each function family, with its features marked',
      [
        'm.9.function-notation',
        'm.9.piecewise-functions',
        'm.9.absolute-value',
        'm.9.exponential-functions',
        'm.9.quadratic-functions',
        'm.9.quadratic-formula',
        'm.11.function-transformations',
        'm.11.polynomial-functions',
        'm.11.polynomial-equations',
        'm.11.inverse-functions',
        'm.11.radical-functions',
        'm.11.logarithms',
        'm.11.exp-log-equations',
        'm.11.rational-functions',
        'm.11.trig-graphs',
        'm.12.inverse-trig',
        'm.12.limits-intro',
        's.9.population-ecology',
      ],
    ),
    status: 'drawn',
    gallery: [
      'g.m9-function-notation-linear',
      'g.m9-absolute-value-vertex',
      'g.m9-quadratic-functions-vertex',
      'g.m9-quadratic-functions-standard',
      'g.m9-quadratic-formula-zeros',
      'g.m9-quadratic-formula-factored',
      'g.m9-quadratic-functions-projectile',
      'g.m9-exponential-functions-growth',
      'g.m9-exponential-functions-decay',
      'g.m11-exp-log-equations-continuous',
      'g.m11-logarithms-log',
      'g.m11-radical-functions-sqrt',
      'g.m11-radical-functions-cube',
      'g.m11-function-transformations-parent',
      'g.m11-polynomial-functions-zeros',
      'g.m11-polynomial-equations-remainder',
      'g.m11-rational-functions-hole',
      'g.m11-rational-functions-slant',
      'g.m11-rational-functions-shift',
      'g.m9-piecewise-functions-pieces',
      'g.m9-piecewise-functions-step',
      'g.s9-population-ecology-logistic',
      'g.m11-trig-graphs-sine',
      'g.m11-trig-graphs-cosine',
      'g.m11-trig-graphs-tangent',
      'g.m12-inverse-trig-arcsin',
      'g.m12-inverse-trig-arctan',
      'g.m11-inverse-functions-exp-log',
      'g.m11-exp-log-equations-crossing',
      'g.m9-quadratic-formula-inequality',
      'g.m12-limits-intro-hole',
      'g.m12-limits-intro-jump',
      'g.m12-limits-intro-secant',
    ],
    notes:
      "Families: linear, absolute value, piecewise (pieces with open or closed ends), quadratic, exponential, logistic, logarithmic, square and cube root, polynomial, rational (asymptotes, holes), sine, cosine, tangent, inverse trig. Marks: zeros, y-intercept, vertex and axis, extrema, asymptotes, domain and range on the axes, a traced point with a handle, a second curve (the parent dashed, or f and its inverse with y = x), a shaded region, a limit approached from both sides, a secant turning into a tangent. DRAWN. Spec (typesFunctionGraph.ts): the family and its fields, each a number or a variable id: { family: 'linear', m, b }; { family: 'absolute', a?, h?, k? }; { family: 'quadratic', form: 'standard', a, b, c } | { form: 'vertex', a?, h, k } | { form: 'factored', a?, p, q }; { family: 'exponential', a?, b, h?, k? } or with r for base e; { family: 'logistic', K, start, r }; { family: 'log', a?, b? (ln when left out), h?, k? }; { family: 'root', index: 2 | 3, a?, h?, k? }; { family: 'polynomial', coefficients: [...] } or { a?, zeros: [{ x, times? }] }; { family: 'rational', a?, zeros: [...], poles: [...], k? } (a zero equal to a pole is a hole); { family: 'piecewise', pieces: [{ f, from?, to?, ends?: '[)' }] }; { family: 'sin' | 'cos' | 'tan', a?, b?, h?, k? }; { family: 'arcsin' | 'arccos' | 'arctan', a?, k? }. Options: at { x, y? } (traced point, dragged along the curve), marks ['zeros', 'intercept', 'vertex', 'extrema', 'asymptotes', 'domain', 'range', 'midline', 'amplitude', 'period'], shows { vertex: { x, y }, zeros: [...], intercept, va, ha, period, amplitude } (module values the harness checks against the graph), parent, inverse, other (a second family) with crossing { x, y? }, shade 'above' | 'below' | { from, to }, limit { x }, secant { x, h, slope? }, name, input, axes { x, y } (names with units), window { x?, y? }, xMin, keep, fixed. Asymptotes, holes and piece ends are always drawn; labels are exact (fractions, surds, multiples of pi) and decimals appear only after ≈ in the caption. Example (m.9.quadratic-functions): representation: { kind: 'functionGraph', family: 'quadratic', form: 'vertex', a: 'a', h: 'h', k: 'k', at: { x: 'x', y: 'y' }, marks: ['vertex', 'zeros', 'intercept'] }. Relation displays: write × between a number and a bracket, and ÷ after a bracketed numerator (the harness reads (…)/n as a fraction).",
  },
  {
    ...ask(
      'H02',
      'normalCurve',
      'Normal curve with shaded areas, z and x axes, the 68–95–99.7 bands, tails, intervals',
      [
        'm.11.normal-distribution',
        'm.12.sampling-distributions',
        'm.12.confidence-intervals',
        'm.12.hypothesis-testing',
        'm.12.chi-square',
      ],
    ),
    status: 'drawn',
    gallery: [
      'g.m11-normal-distribution-left',
      'g.m11-normal-distribution-between',
      'g.m11-normal-distribution-bands',
      'g.m11-normal-distribution-tail',
      'g.m12-sampling-distributions-mean',
      'g.m12-confidence-intervals-mean',
      'g.m12-confidence-intervals-capture',
      'g.m12-confidence-intervals-capture-20',
      'g.m12-hypothesis-testing-two',
      'g.m12-hypothesis-testing-left',
      'g.m12-chi-square-gof',
      'g.m12-chi-square-independence',
    ],
    notes:
      'Also a chi-square curve by degrees of freedom, a sampling distribution narrower than the population, and a stack of confidence intervals around the true value showing how many capture it. Drawn (group HB). Fields (numbers or variable ids, shown units): mean, sd, axis ("Height (cm)"); shade { from?, to?, outside?, area? } (a missing end is a tail; the area written to 4 decimals and checked against the CDF to 1e-4); mark { x, z? }; bands: true; sample { n, se? } (σ/√n over the dashed population curve); interval { center, margin, level? }; intervals { count 20–100, n, level, seed? } (seed 152: 94 of 100 at 95%); test { stat (a z), alpha, tail: left, right or two, p? }; chiSquare { df 1–10, stat?, alpha?, p? }; keep; fixed. Handles drag the shaded ends, the mark and the statistics. Example: { kind: "normalCurve", mean: "m", sd: "s", axis: "Height (cm)", shade: { to: "x", area: "P" }, mark: { x: "x", z: "z" } } with z = (x − μ) ÷ σ and P = Φ(z). Step text Φ(z), invNorm(p), χ²cdf(X, ∞, df) and C(n, k) is taught to the harness (harness/phrasesHsb.ts); relation builders to copy are in galleryHsb.ts.',
  },
  {
    ...ask(
      'H03',
      'histogram',
      'Histogram with bins from the data, and probability bars with the expected value',
      ['m.9.data-displays', 'm.11.probability-distributions', 'm.12.sampling-distributions'],
    ),
    status: 'drawn',
    gallery: [
      'g.m9-data-displays-histogram',
      'g.m9-data-displays-frequency',
      'g.m9-data-displays-bimodal',
      'g.m11-probability-distributions-expected',
      'g.m11-probability-distributions-binomial',
      'g.m12-sampling-distributions-binomial-40',
    ],
    notes:
      'Shape words (symmetric, skewed left or right, uniform, bimodal) in the caption; mean and median marked; binomial bars from n and p. Drawn (group HB). Fields: data (numbers or ids) or counts (ids per bin); start, width, end (bins left end in, right end out); relative; mean and median (true to work them out, or a variable id; from counts the mean is estimated from the midpoints); shape (true names it: symmetric, skewed left or right, uniform, bimodal; or a word); axis; lit (a 1-based bin, or a value k); probability { values, probs, mean? } (E(X) marked, a list not adding to 1 draws faded with the reason); binomial { n 1–40, p, mean?, sd? }; keep; fixed. Count and probability bars drag by their tops (derived ones don\'t). The harness recounts the data into the bins and checks the heights sum to the count, or to 1. Example: { kind: "histogram", counts: ["f1", "f2", "f3", "f4", "f5", "f6"], start: 0, width: 5, lit: 3, mean: true, shape: true, axis: "Wait (min)" }; binomial: { kind: "histogram", binomial: { n: "n", p: "p", mean: "E", sd: "S" }, lit: "k", axis: "Successes (k)" }.',
  },
  {
    ...ask(
      'H04',
      'triangleSolver',
      'Any triangle to scale from three given parts, sides and angles labelled',
      [
        'm.10.congruence',
        'm.10.special-right-triangles',
        'm.10.right-triangle-trig',
        'm.10.law-sines-cosines',
        'm.10.similarity',
      ],
      'SSS, SAS, ASA, AAS, HL and the ambiguous SSA case (two triangles); the given parts marked; opposite, adjacent and hypotenuse named from angle θ; 45-45-90 and 30-60-90 with side ratios in radicals; a second, similar triangle at a scale factor. ' +
        'Drawn (spec in typesHsc.ts): `{ kind: "triangleSolver", parts: { a: "a", b: "b", c: "c", A: "A", B: "B", C: "C" } }` draws the triangle to scale from the three parts typed (the given ones in the highlight, the worked-out ones in ink; no triangle: faded with the reason). SSA with two solutions draws both (the second dashed, B′). A part may be a fixed number (C: 90). ' +
        'Options: `congruence: {}` (the copy D, E, F below with ticks and arcs; the criterion comes from the given parts, or `criterion`; SSA draws the two triangles SSA allows), `similar: { scale: "k", sides: { a: "d", b: "e", c: "f" } }`, `trig: { angle: "A" }` (right angle at C; opposite, adjacent, hypotenuse named; sin, cos, tan worked), `special: "45-45-90" | "30-60-90"` (sides as radicals, 5√2), `scene: { kind: "ramp" | "ladder" | "sight", eye?: "e" }`, `given`, `keep`, `fixed` (the default drag moves the vertex at the end of a given base side). ' +
        'Demos: the laws of sines and cosines in galleryHsc.ts (relations `cosines`, `sines`, `angleSum`, `triangleCloses`) are ready to promote. Step text uses sin(40), cos⁻¹(…), taught to harness/evaluate.ts.',
    ),
    status: 'drawn',
    gallery: [
      'g.m10-law-sines-cosines-sas',
      'g.m10-law-sines-cosines-ssa',
      'g.m10-law-sines-cosines-sss',
      'g.m10-law-sines-cosines-asa',
      'g.m10-congruence-sss',
      'g.m10-congruence-sas',
      'g.m10-congruence-asa',
      'g.m10-congruence-aas',
      'g.m10-congruence-hl',
      'g.m10-congruence-ssa',
      'g.m10-similarity-scale',
      'g.m10-right-triangle-trig-sohcahtoa',
      'g.m10-right-triangle-trig-ladder',
      'g.m10-right-triangle-trig-ramp',
      'g.m10-right-triangle-trig-elevation',
      'g.m10-special-right-triangles-45',
      'g.m10-special-right-triangles-30',
    ],
  },
  {
    ...ask(
      'H05',
      'markedFigure',
      'Geometry figure with congruence ticks, arcs, right-angle and parallel marks, from a point list',
      [
        'm.10.constructions',
        'm.10.proofs',
        'm.10.parallel-lines',
        'm.10.triangle-relationships',
        'm.10.quadrilaterals',
      ],
      'Parallel lines cut by a transversal with the eight angles; triangle centers (centroid, incenter, circumcenter, orthocenter) with medians, bisectors and altitudes; midsegments; quadrilateral families with diagonals; a proof figure whose given and proved parts light up by step. ' +
        'Drawn (spec in typesHsc.ts; every mark is placed from the drawn figure and the harness checks each claim and each labelled length or angle). Presets: `transversal: { angle: "x", second?: "y", highlight: [3, 6], labels: { 1: "a", 3: "x" } }` (angles 1–8, 1 top left at the upper crossing; `second` = angle 5 tilts line 2 when it differs, the parallel arrows only when equal; the caption names the pair, e.g. alternate interior; the transversal drags angle 1); ' +
        '`triangle: { sides: ["a", "b", "c"], lines: "median" | "bisector" | "perpendicular" | "altitude" | "midsegment", center: true, labels: { AG: "g" } }` (midpoints or feet D on BC, E on CA, F on AB; centers G, I, O, H with the in- or circumcircle; I’s touch point T on BC; midsegment DE ∥ BC); ' +
        '`quadrilateral: { family, width, height?, angle?, top?, diagonals: true, labels: { AC: "d", DAB: "A" } }` (parallelogram, rectangle, rhombus, square, trapezoid (isosceles marks when its base angles are equal), kite); or `points: { A: [0, 0], B: ["ab", 0] }` with `parts` (segment, ray, line, ticks, arcs, right, parallel, circle, label with `inCaption`). ' +
        '`proof: { step: "k", steps: [{ given: ["AB"], proved: ["△ABD"], text }] }` lights the step’s given parts yellow and the proved parts blue (refs: segment AB, angle ABC, triangle △ABD). A figure the values can’t make draws faded with the reason.',
    ),
    status: 'drawn',
    gallery: [
      'g.m10-parallel-lines-corresponding',
      'g.m10-parallel-lines-alternate-interior',
      'g.m10-parallel-lines-same-side',
      'g.m10-parallel-lines-converse',
      'g.m10-triangle-relationships-centroid',
      'g.m10-triangle-relationships-incenter',
      'g.m10-triangle-relationships-circumcenter',
      'g.m10-triangle-relationships-orthocenter',
      'g.m10-triangle-relationships-midsegment',
      'g.m10-quadrilaterals-parallelogram',
      'g.m10-quadrilaterals-rectangle',
      'g.m10-quadrilaterals-rhombus',
      'g.m10-quadrilaterals-square',
      'g.m10-quadrilaterals-trapezoid',
      'g.m10-quadrilaterals-kite',
      'g.m10-constructions-perpendicular-bisector',
      'g.m10-proofs-isosceles',
    ],
  },
  {
    ...ask(
      'H06',
      'unitCircle',
      'Unit circle with an angle, its point (cos θ, sin θ), reference triangle and special angles',
      [
        'm.10.arc-sector',
        'm.11.unit-circle',
        'm.11.trig-graphs',
        'm.11.pythagorean-identities',
        'm.12.inverse-trig',
        'm.12.trig-formulas-equations',
      ],
    ),
    status: 'drawn',
    gallery: [
      'g.m11-unit-circle-degrees',
      'g.m11-unit-circle-radians',
      'g.m11-unit-circle-negative',
      'g.m11-unit-circle-past-a-turn',
      'g.m11-trig-graphs-sine',
      'g.m11-trig-graphs-cosine',
      'g.m11-pythagorean-identities',
      'g.m10-arc-sector-radians',
      'g.m12-trig-formulas-equations-sine',
      'g.m12-trig-formulas-equations-tangent',
      'g.m12-inverse-trig-arccos',
    ],
    notes:
      "Degrees and radians; drag the angle; the sine and cosine as segments; optional linked sine graph unrolled beside it; every solution of a trig equation on one turn marked. Drawn: kind unitCircle (typesHsd.ts). Fields: angle (θ variable); measure 'degrees' (default), 'radians' or 'pi' (a variable holding k for kπ, with fraction: 12); show 'degrees' or 'radians' (labels); cos, sin, tan (variables checked against the point); graph 'sin' or 'cos' (the graph unrolled beside the circle); solutions { fn, value, angles, principal } (every solution on one turn, or the inverse function’s answer with its range shaded); arc (arc length = θ in radians); keep; fixed. The point drags θ round the circle, past one turn too. Exact special values (√3/2) in the chip and caption, decimals after ≈. Step text writes cos(θ) with θ in degrees (\"x = cos(150)\"): the harness reads sin, cos, tan, arcsin, arccos and arctan in degrees. Examples: { kind: 'unitCircle', angle: 't', cos: 'x', sin: 'y' }; { kind: 'unitCircle', angle: 'k', measure: 'pi', cos: 'x', sin: 'y', graph: 'cos' }; { kind: 'unitCircle', angle: 'a', fixed: true, solutions: { fn: 'sin', value: 'c', angles: ['a', 'b'] } }.",
  },
  {
    ...ask(
      'H07',
      'algebraTiles',
      'Algebra tiles: x², x and unit tiles, positive and negative, arranged as a rectangle',
      [
        'm.9.solving-equations',
        'm.9.polynomial-operations',
        'm.9.factoring',
        'm.9.quadratic-formula',
      ],
    ),
    status: 'drawn',
    gallery: [
      'g.m9-polynomial-operations-add',
      'g.m9-polynomial-operations-multiply',
      'g.m9-polynomial-operations-zero-pairs',
      'g.m9-polynomial-operations-edge',
      'g.m9-factoring-trinomial',
      'g.m9-factoring-negative',
      'g.m9-quadratic-formula-complete-square',
      'g.m9-quadratic-formula-square-negative',
      'g.m9-solving-equations-tiles',
      'g.m9-solving-equations-negative-tiles',
    ],
    notes:
      "Multiply two binomials as a rectangle, factor a trinomial by arranging its tiles, complete the square (the missing corner), zero pairs cancel. Drawn: kind algebraTiles (typesHsd.ts), no handles (counts are typed). mode 'collect' { tiles, plus, sum } (TileCounts { x2, x, unit }; zero pairs struck); 'rectangle' { factors: { p, q, r, s } for (px + q)(rx + s), product, given: 'factors' or 'product' } (multiply, or factor a trinomial by arranging its tiles; cancelling x tiles struck); 'square' { b, c, k, missing } (complete the square: the (b/2)² corner dashed, c’s tiles beside); 'equation' { left: { x, unit }, right: { x, unit }, solution } (tiles on two mats). Each edge holds −10 to 10 tiles; the harness checks the tiles add up to the named polynomial. Examples: { kind: 'algebraTiles', mode: 'rectangle', factors: { p: 'p', q: 'q', r: 'r', s: 's' }, product: { x2: 'A', x: 'B', unit: 'C' } }; { kind: 'algebraTiles', mode: 'square', b: 'b', c: 'c', k: 'k', missing: 'm' }.",
  },
  {
    ...ask(
      'H08',
      'vectorDiagram',
      'Vectors as arrows on a grid: components, sums, scalar multiples, the angle between',
      ['m.12.vectors', 's.11.kinematics-2d', 's.11.dynamics-vectors'],
    ),
    status: 'drawn',
    gallery: [
      'g.m12-vectors-tip-to-tail',
      'g.m12-vectors-parallelogram',
      'g.m12-vectors-scalar',
      'g.m12-vectors-angle',
      'g.m12-vectors-magnitude-direction',
      'g.s11-kinematics-2d-boat',
      'g.s11-dynamics-vectors-forces',
    ],
    notes:
      "Tip to tail and parallelogram sums, magnitude and direction, dot product sign from the angle; drag a tip. Drawn: kind vectorDiagram (typesHsd.ts). Fields: vectors (one or two VectorOf { name, x, y } by components or { name, magnitude, direction } with the direction in degrees from the positive x-axis; each a number or variable); sum 'tipToTail' or 'parallelogram' with result { name, x, y, magnitude, direction } (checked); scalar { k, x, y } (k times the first vector, checked); angle { value, dot } (the angle between and the dot product, checked; the caption gives the sign: acute, right or obtuse); components (dashed legs with their lengths); unit ('m/s', 'N') and axes names for physics; keep; fixed. Drag a tip: components follow, or the magnitude and direction (only the magnitude when the direction is a fixed number). Examples: { kind: 'vectorDiagram', vectors: [{ name: 'u', x: 'ux', y: 'uy' }, { name: 'v', x: 'vx', y: 'vy' }], sum: 'tipToTail', result: { name: 'u + v', x: 'sx', y: 'sy', magnitude: 'r' } }; { kind: 'vectorDiagram', vectors: [{ name: 'F₁', magnitude: 'f1', direction: 0 }, { name: 'F₂', magnitude: 'f2', direction: 'a' }], sum: 'parallelogram', result: { name: 'F', x: 'fx', y: 'fy', magnitude: 'f' }, unit: 'N', axes: { x: 'east', y: 'north' } }.",
  },
  {
    ...ask(
      'H09',
      'complexPlane',
      'Complex plane: a + bi as a point and arrow, conjugate, sum, modulus and argument',
      ['m.11.complex-numbers', 'm.12.polar'],
    ),
    status: 'drawn',
    gallery: [
      'g.m11-complex-numbers-plot',
      'g.m11-complex-numbers-negative',
      'g.m11-complex-numbers-sum',
      'g.m11-complex-numbers-product',
      'g.m12-polar-complex-form',
    ],
    notes:
      "Drawn: kind complexPlane (typesHsd.ts). Fields: z { re, im } or { modulus, argument } (degrees); conjugate (z̄ reflected across the real axis); w { re, im } with op 'sum' (the parallelogram), 'difference' (z plus −w) or 'product' (moduli multiply, arguments add, arcs marked); result { re, im } (checked); modulus and argument (variables, checked; |z| on the arrow, θ as an arc); polar (writes z = r(cos θ + i sin θ)); keep; fixed. Axes Re and Im, the imaginary axis numbered i, 2i, …; drag z. Examples: { kind: 'complexPlane', z: { re: 'a', im: 'b' }, conjugate: true, modulus: 'm' }; { kind: 'complexPlane', z: { re: 'a', im: 'b' }, w: { re: 'c', im: 'd' }, op: 'product', result: { re: 'e', im: 'f' } }; { kind: 'complexPlane', z: { modulus: 'r', argument: 't' }, polar: true }.",
  },
  {
    ...ask(
      'H10',
      'polarGrid',
      'Polar grid with a point (r, θ) and polar curves (circle, rose, cardioid, spiral)',
      ['m.12.polar', 'm.12.parametric'],
    ),
    status: 'drawn',
    gallery: [
      'g.m12-polar-point',
      'g.m12-polar-rose',
      'g.m12-polar-cardioid',
      'g.m12-polar-limacon',
      'g.m12-polar-circle',
      'g.m12-polar-spiral',
      'g.m12-parametric-projectile',
      'g.m12-parametric-line',
      'g.m12-parametric-ellipse',
    ],
    notes:
      "Parametric mode: a path traced as t grows, with direction arrows and the point at t. Drawn: kind polarGrid (typesHsd.ts). Polar mode: rings at nice radii and rays every 30°, labelled in degrees or (show: 'radians') π/6, …; point { r, theta, x, y } (θ in degrees; a negative r lands on the opposite ray; x and y checked as r cos θ and r sin θ); curve { shape: 'circle' (r = a, or r = a cos θ with fn), 'rose' (a, n; n or 2n petals), 'cardioid' (a, b: r = a + b cos θ, a limaçon when b ≠ a), 'spiral' (r = aθ, θ in radians, turns) } with the point on it (r checked). Parametric mode: parametric { family: 'line' (x0, y0, a, b), 'ellipse' (h, k, a, b; t in degrees), 'projectile' (v, angle, y0; g = 9.8), t, range: [t₀, t₁], x, y } traces the path solid up to t and dashed after, with arrows the way t runs (x and y checked). Drag the point: θ (and r with no curve), or along the path to set t. Examples: { kind: 'polarGrid', curve: { shape: 'rose', a: 'a', n: 'n' }, point: { r: 'r', theta: 't' } }; { kind: 'polarGrid', parametric: { family: 'line', x0: 'p', y0: 'q', a: 'a', b: 'b', t: 't', range: [-2, 4], x: 'x', y: 'y' } }.",
  },
  {
    ...ask(
      'H11',
      'conicGraph',
      'Circle, parabola, ellipse and hyperbola from their equations, with center, foci, directrix, asymptotes',
      ['m.10.circle-equations', 'm.12.conics'],
    ),
    status: 'drawn',
    gallery: [
      'g.m10-circle-equations-center',
      'g.m10-circle-equations-origin',
      'g.m12-conics-parabola',
      'g.m12-conics-parabola-left',
      'g.m12-conics-ellipse',
      'g.m12-conics-ellipse-tall',
      'g.m12-conics-hyperbola',
      'g.m12-conics-hyperbola-vertical',
      'g.m12-conics-cone',
    ],
    notes:
      "Drag the center and the radius or axes; cross sections of a double cone as the explore figure for the same page. Drawn: kind conicGraph (typesHsd.ts), plus the explore figure doubleCone (layouts/types.ts; a scene's cone: 'circle', 'ellipse', 'parabola' or 'hyperbola' tilts the plane and draws the curve in 3D). Fields: conic 'circle' { r }, 'parabola' { p, axis: 'vertical' (default) or 'horizontal' } with focus and dashed directrix, 'ellipse' { a, b } with its axes and foci, 'hyperbola' { a, b, axis: 'horizontal' (default) or 'vertical' } with the a-by-b box, dashed asymptotes and foci; h and k (center or vertex, default 0); c (the focal distance, checked: p, √|a² − b²|, √(a² + b²)); point { x, y } (checked on the curve); keep; fixed. The equation in standard form sits on the grid; c is exact when c² is whole (2√3 ≈ 3.46). Drag the center or vertex, and the radius, the axes’ ends or the focus. Examples: { kind: 'conicGraph', conic: 'circle', h: 'h', k: 'k', r: 'r', point: { x: 'x', y: 'y' } }; { kind: 'conicGraph', conic: 'hyperbola', a: 'a', b: 'b', c: 'c', axis: 'vertical' }; layout { kind: 'explore', figure: { kind: 'doubleCone' }, scenes: [{ label: 'Ellipse', cone: 'ellipse', lines: [...] }] }.",
  },
  {
    ...ask(
      'H12',
      'circleTheorems',
      'Circle with central and inscribed angles, chords, tangents and secants, points draggable on the circle',
      ['m.10.circle-theorems'],
      'Inscribed angle half the central angle; angle in a semicircle; tangent perpendicular to the radius; intersecting chords, secant–secant and secant–tangent products. ' +
        'Drawn (spec in typesHsc.ts): `{ kind: "circleTheorems", theorem, … }` with theorem `inscribed` (`central`, `inscribed`: the arc heavy, P dragged along the far arc with the angle unchanged, B dragged to change the arc; arcs past 180° work), `semicircle` (`angle` at A, `other` at B; P dragged), `tangent` (`radius`, `tangent`, `distance`; P dragged along the tangent), `chords` (`segments: [AE, EB, CE, ED]`), `secants` (`segments: [PA, PB, PC, PD]`, outside parts and whole secants), `secantTangent` (`segments: [PT, PA, PB]`); `fixed` drops the handles. ' +
        'Lengths are drawn to scale (the circle chosen to fit); values that break the theorem, or a “?” length, draw faded with the reason. The harness checks the points are on the circle, each drawn length is its value and the angle relations hold on the drawing.',
    ),
    status: 'drawn',
    gallery: [
      'g.m10-circle-theorems-inscribed',
      'g.m10-circle-theorems-inscribed-major',
      'g.m10-circle-theorems-semicircle',
      'g.m10-circle-theorems-tangent',
      'g.m10-circle-theorems-chords',
      'g.m10-circle-theorems-secants',
      'g.m10-circle-theorems-secant-tangent',
    ],
  },
  {
    ...ask(
      'H13',
      'pascalTriangle',
      "Pascal's triangle with row n and entry k lit, and the counting slots n × (n − 1) × …",
      ['m.10.probability-rules', 'm.11.binomial-theorem'],
    ),
    status: 'drawn',
    gallery: [
      'g.m11-binomial-theorem-pascal',
      'g.m11-binomial-theorem-row-12',
      'g.m10-probability-rules-permutations',
      'g.m10-probability-rules-combinations',
    ],
    notes:
      'Slots for permutations and combinations (choose, then divide by the orders); the binomial expansion coefficients from row n. Drawn (group HB). Fields: n (row, 0–12), k? (entry lit, its two parents marked with Pascal\'s rule in the caption), rows? (rows drawn, default the larger of n and 6), triangle? (false: the slots alone, for n past 12), slots { r, choose?, result? } (n × (n − 1) × … boxes for r places, then ÷ r! for a combination), expand { a, b } ((a + b)ⁿ with row n\'s coefficients in the caption, n ≤ 8). No handles: n, k and r have sliders. The harness checks every entry is C(row, col) and the slots\' product (÷ r!) against the result. Examples: { kind: "pascalTriangle", n: "n", k: "k", expand: { a: "a", b: "b" } }; { kind: "pascalTriangle", n: "n", k: "r", slots: { r: "r", choose: true, result: "C" } }; permutations: { kind: "pascalTriangle", n: "n", triangle: false, slots: { r: "r", result: "P" } }.',
  },
  {
    ...ask(
      'H14',
      'matrixGrid',
      'Matrices in brackets: a row times a column lit for multiplication, row operations, a 3 × 3 system',
      ['m.12.matrices'],
    ),
    status: 'drawn',
    gallery: [
      'g.m12-matrices-multiply',
      'g.m12-matrices-multiply-2x3',
      'g.m12-matrices-4x4-vector',
      'g.m12-matrices-row-reduce',
    ],
    notes:
      "Drawn: kind matrixGrid (typesHsd.ts), matrices up to 4 × 4 in square brackets, entries exact (fractions like −1/7). mode 'multiply' { a, b (rows of numbers or variables), product (C’s variables, checked), entry ([row, column] lit first) }: the row of A and the column of B lit, the entry of AB lit and its sum of products written under; tap any entry of AB to light its row and column. mode 'rowReduce' { system (the augmented rows, right-hand sides last), steps (RowOp: { swap: [i, j] }, { scale: i, by: k }, { add: i, from: j, times: k }, rows from 1), solution (variables, checked against every matrix) }: each matrix under the last, the operation (R₂ − 2R₁ → R₂) beside the arrow and the rows it changed lit. Examples: { kind: 'matrixGrid', mode: 'multiply', a: [['a11', 'a12'], ['a21', 'a22']], b: [['b11', 'b12'], ['b21', 'b22']], product: [['c11', 'c12'], ['c21', 'c22']] }; { kind: 'matrixGrid', mode: 'rowReduce', system: [[1, 1, 1, 'd1'], [2, -1, 1, 'd2'], [1, 2, -1, 'd3']], steps: [{ add: 2, from: 1, times: -2 }, { swap: [2, 3] }, { scale: 3, by: -1 / 7 }], solution: ['x', 'y', 'z'] }.",
  },
  {
    ...ask(
      'H15',
      'termsChart',
      'Terms of a sequence as bars or points, with the running sum approaching its limit',
      ['m.9.sequences', 'm.11.series'],
    ),
    status: 'drawn',
    gallery: [
      'g.m9-sequences-arithmetic',
      'g.m9-sequences-geometric',
      'g.m11-series-arithmetic-sum',
      'g.m11-series-geometric-infinite',
      'g.m11-series-alternating',
    ],
    notes:
      'Drawn (group HB). Fields: type ("arithmetic" | "geometric"), first (a₁), step (d or r), count (n, 1–30), as? ("bars", the default, or "points"), sums? (the partial sums Sₙ as a stepped line), limit? (true, or the id of S: an infinite geometric series\' sum a₁ ÷ (1 − r) dashed, when |r| < 1; otherwise faded with the reason), term? (the id of aₙ), sum? (the id of Sₙ). No handles: the values have sliders. The harness checks every term and partial sum against the rule, the typed aₙ, Sₙ and S, and the gap |S − Sₙ| = |a₁rⁿ ÷ (1 − r)|. Examples: { kind: "termsChart", type: "arithmetic", first: "a", step: "d", count: "n", as: "points", term: "an" }; { kind: "termsChart", type: "geometric", first: "a", step: "r", count: "n", sums: true, limit: "S", sum: "Sn" }.',
  },

  // ── B. Changes to existing math pictures ──
  {
    ...ask(
      'H16',
      'lineSystem',
      'Shaded half-planes: dashed or solid boundaries and the overlap of two inequalities',
      ['m.9.inequality-systems', 'm.9.linear-inequalities'],
    ),
    status: 'drawn',
    gallery: [
      'g.m9-inequality-systems-shade',
      'g.m9-inequality-systems-parallel',
      'g.m9-linear-inequalities-half-plane',
      'g.m9-inequality-systems-elimination',
    ],
    notes:
      "Also elimination: the two equations and their sum drawn as three lines through one point. DRAWN. Spec (typesGraphs.ts), all optional, no change to Grade 8 pages: each line of lineSystem takes shade '<' | '≤' | '>' | '≥' (y (sign) mx + b; its half-plane shaded in the line's color, above for > and ≥; dashed boundary for < and >, solid for ≤ and ≥; with two shaded lines the overlap is labelled 'both true', and parallel lines shading apart say 'No solution'); test { x, y } (a point tested in both, each check worked in the caption); sum { x, y, c, label? } (elimination: the coefficients of the sum a·x + b·y = c after multiplying, drawn as a third line through the crossing, upright when y cancels; the harness checks it is a sum of the two equations); fixed (no handles, for lines worked out from standard-form coefficients). linearFunction takes shade too, for one inequality. Example (m.9.inequality-systems): representation: { kind: 'lineSystem', lines: [{ slope: 'm1', intercept: 'b1', shade: '>' }, { slope: 'm2', intercept: 'b2', shade: '≤' }], solution: { x: 'x', y: 'y' }, test: { x: 'tx', y: 'ty' }, extent: 10 }; elimination: { kind: 'lineSystem', lines: [{ slope: 'm1', intercept: 'i1' }, { slope: 'm2', intercept: 'i2' }], solution: { x: 'x', y: 'y' }, sum: { x: 'p', y: 'q', c: 'r' }, fixed: true }; one inequality (m.9.linear-inequalities): { kind: 'linearFunction', slope: 'm', intercept: 'b', shade: '<', keep: ['B'] }. Signs are fixed per page (a page for Ax + By < C with B < 0 passes the flipped sign). Boundaries are y = mx + b only: an upright boundary x ≥ k is not drawn yet.",
  },
  {
    ...ask(
      'H17',
      'integerLine',
      'Compound inequalities (and, or) and absolute value as a distance on the number line',
      ['m.9.linear-inequalities', 'm.9.absolute-value'],
    ),
    status: 'drawn',
    gallery: [
      'g.m9-linear-inequalities-and',
      'g.m9-linear-inequalities-or',
      'g.m9-linear-inequalities-or-all',
      'g.m9-absolute-value-within',
      'g.m9-absolute-value-beyond',
    ],
    notes:
      "DRAWN. Spec (types.ts, integerLine), optional; other integerLine pages unchanged: compound { join: 'and' | 'or', closed?: [lower, upper] (default both open), center?, radius?, letter?, test? } with value (the lower bound) and second (the upper bound). 'and' draws the stretch between the bounds (both parts true; bounds past each other say no solution); 'or' draws two rays outward (either part; rays that meet or pass take in every number). With center and radius it is |x − c| < d ('and') or > d ('or'): the center a diamond, the distance d bracketed to each bound, c − d and c + d worked in the caption; the harness checks value = c − d and second = c + d. test is a number marked true or false, each part worked in the caption. Handles: the two bounds, or the center and the upper bound (the radius), and the test number. Example (m.9.linear-inequalities, −3 ≤ 2x + 1 < 7): representation: { kind: 'integerLine', value: 'L', second: 'U', min: -5, max: 5, compound: { join: 'and', closed: [true, false], test: 't' } }; (m.9.absolute-value, |x − 1| ≤ 3): { kind: 'integerLine', value: 'L', second: 'U', min: -5, max: 5, compound: { join: 'and', closed: [true, true], center: 'c', radius: 'd', test: 't' } }. The demos solve ax + b with a > 0; a page dividing by a negative passes the flipped closed pair.",
  },
  {
    ...ask(
      'H18',
      'scatter',
      'Residual segments, a residual plot below, the correlation r and the least-squares line',
      ['m.9.regression'],
    ),
    status: 'drawn',
    gallery: ['g.m9-regression-residuals', 'g.m9-regression-least-squares', 'g.m9-regression-weak'],
    notes:
      "DRAWN. Spec (types.ts, scatter), optional; Grade 8 scatter pages unchanged: residuals 'segments' | 'plot' (each residual, actual − predicted, as a segment to the line; 'plot' adds a residual plot under the chart, residuals over x about 0, and the caption counts positive and negative residuals and gives the sum of their squares); r: true (worked out from the points, ≈ to two places, with its strength in words) or a value id (checked against the points to 0.005); leastSquares 'beside' (the least-squares line dashed beside the dragged line, with its sum of squares, the least any line gives) or 'fit' (slope and intercept are the least-squares line, checked to the cent, no handles; slope and intercept may now be numbers, the calculator's rounded values); residualOf { point, residual? } (one point's residual labelled and worked, its value checked). Example (m.9.regression): representation: { kind: 'scatter', x: { label: 'Hours studied', min: 0, max: 9 }, y: { label: 'Quiz score', min: 40, max: 100 }, points: [...], slope: 'm', intercept: 'b', at: { x: 'x', y: 'y' }, residuals: 'plot', residualOf: { point: 3, residual: 'e' } }; given line: { ..., slope: -0.65, intercept: 47.87, r: true, residuals: 'segments', leastSquares: 'fit' }.",
  },
  {
    ...ask(
      'H19',
      'boxPlot',
      'Outliers past 1.5 × IQR fences, and two box plots on one scale; a dot plot with mean ± 1 SD',
      ['m.9.data-displays'],
    ),
    status: 'drawn',
    gallery: [
      'g.m9-data-displays-outliers',
      'g.m9-data-displays-compare',
      'g.m9-data-displays-sd',
      'g.m9-data-displays-sd-sample',
    ],
    notes:
      "The mean and standard deviation band belong on dotPlot. DRAWN. Spec (types.ts), optional; Grade 6–7 boxPlot and dotPlot pages unchanged. boxPlot: fences { lower?, upper? } (the 1.5 × IQR fences dashed with their values; lower/upper name the module's fence values, checked; with data the quartiles are checked as the medians of the halves, the median left out, values past a fence are open outlier dots and the whiskers stop at the last values inside; without data a least or greatest value past a fence is marked); second { min, q1, median, q3, max } with labels [a, b] (a second box plot under the first on the same scale, the medians and IQRs compared in the caption; every mark drags). New harness phrases 'first quartile of …' and 'third quartile of …'. dotPlot: sd { id, kind?: 'population' | 'sample' } with mean (the mean as a line and a shaded band from mean − SD to mean + SD, the values inside counted; the SD is checked against the data, σ over n or s over n − 1). Examples (m.9.data-displays): { kind: 'boxPlot', min: 'a', q1: 'b', median: 'c', q3: 'd', max: 'e', range: [0, 50], data: [...11 ids], fences: { lower: 'L', upper: 'U' } }; { kind: 'boxPlot', min: 'a1', …, range: [40, 100], second: { min: 'a2', q1: 'b2', median: 'c2', q3: 'd2', max: 'e2' }, labels: ['Class A', 'Class B'] }; { kind: 'dotPlot', data: [...8 ids], min: 0, max: 12, mean: 'm', sd: { id: 'sd', kind: 'population' } }.",
  },
  {
    ...ask(
      'H20',
      'table',
      'Two-way table with totals and a lit cell, row or column, its relative frequency, and a segmented bar',
      ['m.9.two-way-tables', 'm.10.conditional-probability', 'm.12.chi-square'],
    ),
    status: 'drawn',
    gallery: [
      'g.m9-two-way-tables-joint',
      'g.m9-two-way-tables-marginal',
      'g.m10-conditional-probability-table',
      'g.m12-chi-square-independence',
      'g.m12-chi-square-goodness',
    ],
    notes:
      "Chi-square: observed and expected counts side by side. DRAWN. Spec (typesHse.ts TwoWaySpec): table takes twoWay instead of sweep/output (a union member, so the sweep tables are unchanged): { rows: [names], cols: [names], cells: [[id or number, …], …], totals? (default true; a one-row table has no totals row), lit? { row?, col? } (a cell, a whole row or a whole column), of? 'total' | 'row' | 'col' (joint or marginal out of the grand total, or conditional out of the lit row or column; the whole is outlined and the caption writes P(A | B) = part/whole), frequency? (the value, checked to 0.005), bar? 'rows' | 'cols' (a segmented 100% bar per row or column with a key), expected? 'independence' | [[ids]] (each cell's expected count in brackets under the observed one; given counts must add to the observed total), chiSquare? (the statistic's value, checked; the caption works the first term and the degrees of freedom) }. Example (m.10.conditional-probability): representation: { kind: 'table', twoWay: { rows: ['Late', 'On time'], cols: ['Bus', 'Walk', 'Car'], cells: [['a', 'b', 'g'], ['d', 'e', 'h']], lit: { row: 0, col: 0 }, of: 'col', frequency: 'p', bar: 'cols' } }; (m.12.chi-square): { kind: 'table', twoWay: { rows: [...], cols: [...], cells: [['a', 'b'], ['c', 'd']], expected: 'independence', chiSquare: 'X' } }.",
  },
  {
    ...ask(
      'H21',
      'treeDiagram',
      'Branches with their own probabilities (not all 1/n), P(B | A) on the second stage',
      ['m.10.conditional-probability', 'm.10.probability-rules'],
    ),
    status: 'drawn',
    gallery: [
      'g.m10-conditional-probability-tree',
      'g.m10-probability-rules-without-replacement',
      'g.m10-conditional-probability-independent',
    ],
    notes:
      "DRAWN. Spec (typesHse.ts TreeChances): treeDiagram takes chances instead of first/second counts (a union member; the equally-likely trees are unchanged): { first: [ids or numbers], second: [[…] per first outcome], names: [[first outcomes], [second outcomes]] (2 to 4 a stage), stages?, path? [i, j], chance?, totalOf?, total? }. A stage's list may leave out its last chance, drawn as the complement 1 − the others. Each first branch reads P(A) = p, the lit path's second branch P(B | A) = p in full (the others keep to numbers so the branches stay visible), and each leaf its product (0.3 × 0.4 = 0.12, 3/8 × 2/7 = 3/28). The caption checks every node adds to 1, works P(A and B) = P(A) × P(B | A), P(B) over every path (totalOf), then P(A | B) (fraction ≈ decimal), and says when the stages are independent (the same P(B | A) on every first branch). The harness checks the sums, the path product and the total. Example (m.10.conditional-probability): representation: { kind: 'treeDiagram', chances: { first: ['r'], second: [['a'], ['b']], names: [['Rain', 'Dry'], ['Late', 'On time']], stages: ['Weather', 'Arrival'], path: [0, 0], chance: 'j', totalOf: 0, total: 't' } }.",
  },
  {
    ...ask(
      'H22',
      'venn',
      'Venn diagram with probabilities: A and B, A or B, mutually exclusive, the complement shaded',
      ['m.10.probability-rules', 'm.10.conditional-probability'],
    ),
    status: 'drawn',
    gallery: [
      'g.m10-probability-rules-union',
      'g.m10-probability-rules-exclusive',
      'g.m10-probability-rules-complement',
      'g.m10-conditional-probability-venn',
      'g.m10-probability-rules-neither',
    ],
    notes:
      "DRAWN. Spec (typesHse.ts VennChances): venn takes chances instead of first/second/list (a union member; the GCF Venn is unchanged): { a, b, both (ids or numbers: P(A), P(B), P(A and B)), names? [A, B], shade? 'and' | 'or' | 'notA' | 'aOnly' | 'neither', exclusive?, result? }. The sample space is a rectangle (1), each region labelled with its own probability (A only, both, B only, neither), the shaded region in the soft accent; mutually exclusive events (exclusive, or P(A and B) = 0) draw apart. Probabilities print as decimals or simple fractions (1/6). The caption works the addition rule, the complement, A only, neither, and with 'and' also P(B | A) = P(A ∩ B) ÷ P(A). The harness checks P(A and B) ≤ P(A), P(B), P(A or B) ≤ 1, exclusive means 0, and result equals the shaded region; demo pages carry the same constraints as relations. Example (m.10.probability-rules): representation: { kind: 'venn', chances: { a: 'a', b: 'b', both: 'ab', names: ['Band', 'Sport'], shade: 'or', result: 's' } }; exclusive: { kind: 'venn', chances: { a: 'a', b: 'b', both: 0, names: [...], shade: 'or', exclusive: true, result: 's' } }.",
  },
  {
    ...ask(
      'H23',
      'transformation',
      'Compositions of two moves with the middle image, any reflection line, rotation about any point, symmetry',
      ['m.10.rigid-motions', 'm.10.congruence'],
    ),
    status: 'drawn',
    gallery: [
      'g.m10-rigid-motions-compose',
      'g.m10-rigid-motions-glide',
      'g.m10-rigid-motions-rotate-point',
      'g.m10-rigid-motions-reflect-diagonal',
      'g.m10-rigid-motions-symmetry-rectangle',
      'g.m10-rigid-motions-symmetry-square',
      'g.m10-rigid-motions-symmetry-isosceles',
    ],
    notes:
      'Drawn (group HF). New optional fields on transformation (typesGraphs.ts, types in typesHsf.ts): then (a second move, the same shapes as the first: { move: "translate", right, up } | { move: "reflect", mirror } | { move: "rotate", angle, center? } | { move: "dilate", factor, center? }), drawn from A′, which turns dashed and grey as the middle image, to A″ in the highlight, each move with its own guides; image2 { x, y } (A″ as values, checked against both moves); symmetry: true (the lines of symmetry dashed and clipped to the grid, and with turns the center, a turn arrow and "order n"; the caption counts both; a turn or flip that lands on the figure labels the image corners further out). Reflection in y = x, y = −x, x = k, y = k and rotation about any center (center: [a, b]) already existed. The first move keeps its handle; the second move has none (its values are typed). Example: { kind: "transformation", figure: [["ax", "ay"], [5, 4], [5, 6]], move: "reflect", mirror: "y-axis", image: { x: "px", y: "py" }, then: { move: "rotate", angle: 90 }, image2: { x: "qx", y: "qy" }, extent: 7 }. Symmetry: { kind: "transformation", figure: [[1, 1], ["r", 1], ["r", "r"], [1, "r"]], move: "rotate", angle: "t", center: ["c", "c"], symmetry: true, quadrants: 1, extent: 6 }. Keep figures off the axes in quadrant 1, where corner labels meet the axis numbers.',
  },
  {
    ...ask(
      'H24',
      'scaleCopy',
      'Dilation from any center with rays, scale factors under 1, the side-splitter (parallel line in a triangle)',
      ['m.10.similarity'],
    ),
    status: 'drawn',
    gallery: [
      'g.m10-similarity-dilation-shrink',
      'g.m10-similarity-dilation-enlarge',
      'g.m10-similarity-dilation-inside',
      'g.m10-similarity-dilation-quarter',
      'g.m10-similarity-side-splitter',
      'g.m10-similarity-side-splitter-base',
    ],
    notes:
      'Drawn (group HF). New optional fields on scaleCopy (types.ts; SideSplitter in typesHsf.ts; drawn by ScaleCopyHsf.tsx): center: [x, y] (numbers or values, in squares from the original\'s bottom left corner, inside, outside or on it) draws the dilation on one grid: the center O, a dashed ray from O through each corner out to the farther of the corner and its image, the corners lettered A, B, … and A′, B′, …, the factor on the ray with the most room; factors under 1 (down to 0.25) shrink toward O; drag the image\'s farthest corner along its ray. copyWidth, copyHeight and area work as before. The module needs a grid constraint (the figure, image and center within 30 squares; see dilationFits in galleryHsf.ts). Example: { kind: "scaleCopy", factor: "k", width: "w", height: "h", copyWidth: "W", copyHeight: "H", shape: "triangle", center: [10, 8] }. splitter: { parts?: [AD, DB, AE, EC], base?: [DE, BC] } (value ids) draws the side-splitter instead: triangle ABC with DE ∥ BC (parallel arrows on both), the small triangle ADE shaded; with it width and height are the sides AB and AC and factor is k = AD ÷ AB (0 < k < 1); pieces not passed are worked out from k. With base the triangle is to scale from its three sides (the module needs a constraint that they close); without it the angle at A is 50°, which the problem doesn\'t fix. Drag D along AB. The caption works AD ÷ DB = AE ÷ EC, k = AD ÷ AB and DE = k × BC. Example: { kind: "scaleCopy", factor: "k", width: "ab", height: "ac", splitter: { parts: ["ad", "db", "ae", "ec"] } } with AB = AD + DB, AC = AE + EC, k = AD ÷ AB and AE = k × AC.',
  },
  {
    ...ask(
      'H25',
      'coordinatePlane',
      'Segment with midpoint and a point that partitions it in a ratio; distance as a right triangle; side slopes',
      ['m.10.coordinate-geometry'],
    ),
    status: 'drawn',
    gallery: [
      'g.m10-coordinate-geometry-midpoint',
      'g.m10-coordinate-geometry-partition',
      'g.m10-coordinate-geometry-distance',
      'g.m10-coordinate-geometry-parallelogram',
      'g.m10-coordinate-geometry-rectangle',
      'g.m10-coordinate-geometry-right-triangle',
    ],
    notes:
      'Drawn (group HF). New optional fields on coordinatePlane (types.ts; PlaneGeometry in typesHsf.ts; drawn by CoordinatePlaneHsf.tsx, math in planeGeo.ts). With second (and usually segment: true): midpoint { x, y } (M\'s coordinates as values, checked) draws M as a diamond with one tick on each equal half and the caption works M = ((x₁ + x₂) ÷ 2, (y₁ + y₂) ÷ 2); partition { ratio: [m, n], x?, y? } (numbers or values) cuts AB into m + n equal ticked pieces, draws A to P heavy and P, and works P = (x₁ + m/(m + n) × (x₂ − x₁), …). The two points are then labelled A(…) and B(…). Distance as a right triangle already existed (segment, legs, distance) and combines with midpoint. polygon: [[x, y], …] (3 to 6 corners, numbers or values; x, y is usually its first corner, the one dragged) draws the figure with its corners named A(…), B(…), …; slopes: true labels each side m = 1/2 (undefined for a vertical side) on a chip, arrows on parallel sides (one pair one arrow, the next two) and a square at each right angle; the caption lists the slopes, the parallel pairs and the right angles (with the product −1). Example: { kind: "coordinatePlane", x: "x1", y: "y1", second: { x: "x2", y: "y2" }, segment: true, partition: { ratio: ["m", "n"], x: "px", y: "py" }, extent: 8, quadrants: 4 }; slopes: { kind: "coordinatePlane", x: "ax", y: "ay", polygon: [["ax", "ay"], ["bx", "by"], ["cx", "cy"], ["dx", "dy"]], slopes: true, extent: 6, quadrants: 4 }. A slope relation should fail (residual 1) when the run is 0, as sideSlope in galleryHsf.ts does.',
  },
  {
    ...ask(
      'H26',
      'circle',
      'Sector shaded by a central angle in degrees or radians, arc length, radius-length arcs around the circle',
      ['m.10.arc-sector', 'm.11.unit-circle'],
    ),
    status: 'drawn',
    gallery: [
      'g.m10-arc-sector-degrees',
      'g.m10-arc-sector-radians',
      'g.m10-arc-sector-major',
      'g.m11-unit-circle-radian',
    ],
    notes:
      'Drawn (group HF). New optional field on circle (types.ts; CircleSector in typesHsf.ts; drawn by CircleSector.tsx): sector { angle, unit?: "degrees" (default) | "radians", arc?, area? } (angle a number or value id; arc and area values, checked against s = rθ and A = r²θ ÷ 2). It adds two views: "sector" (the default view when sector is set) shades the sector counterclockwise from the radius pointing right, draws the arc heavy with s on a chip (exact with π when it is a multiple: s = 2π cm), marks the angle (60° or 3π/4), and has handles on the radius\'s end and the arc\'s end; the caption works the angle\'s share of the turn, the radian measure, s and A exactly with π, then ≈. "radian" wraps six radius-long arcs around the circle, numbered, alternating colors, with the 0.28 left over and 1 rad marked at the center; with a sector, its angle is shaded and counted in radius-lengths. Pass views: ["radian", "sector"] for both with buttons. Keep extent small (1) so the circle fills the picture. Example: { kind: "circle", radius: "r", extent: 1, sector: { angle: "t", unit: "degrees", arc: "s", area: "A" } } with s = θ ÷ 360 × 2πr and A = θ ÷ 360 × πr²; a radian angle variable\'s max is 6.28 (below 2π).',
  },
  {
    ...ask(
      'H27',
      'curvedSolid',
      'Pyramids, cones and spheres with surface area nets (the cone as a sector), and Cavalieri stacks',
      ['m.10.volume-derivations'],
      'crossSection: a plane through a cube, cylinder or cone, the section drawn beside it.',
    ),
    status: 'drawn',
    gallery: [
      'g.m10-volume-derivations-cylinder-net',
      'g.m10-volume-derivations-cone-net',
      'g.m10-volume-derivations-sphere-surface',
      'g.m10-volume-derivations-cavalieri',
      'g.m10-volume-derivations-cone-section',
      'g.m10-volume-derivations-cylinder-section',
      'g.m10-volume-derivations-cone-upright',
    ],
    notes:
      'crossSection: a plane through a cube, cylinder or cone, the section drawn beside it. Drawn (group HF). curvedSolid gets net: true (Net and Solid buttons, the net first; drawn by CurvedSolidHsf.tsx): a cylinder\'s rectangle 2πr by h between its two circles, a cone\'s sector of radius ℓ with its angle 360 × r ÷ ℓ and its base circle, a sphere\'s four great circles (it has no flat net); slant (ℓ, a cone\'s, checked against √(r² + h²)) and surface (checked against the faces) are value ids; the caption works S exactly with π. cavalieri: true (a cylinder) draws two stacks of 12 copper coins of radius r and height h, one leaning, and states Cavalieri\'s principle with V = πr²h. crossSection gets solid: "cylinder" | "cone" (length is the radius; drawn by CrossSectionRound.tsx, math in roundSection.ts): cut "base" (level at at up the height: a circle, the same as the base or shrinking to the tip) or "side" (upright, at from the axis: a cylinder\'s rectangle 2√(r² − d²) by h, a cone\'s triangle through the axis or a curved hyperbolic region off it); the cut is shaded on the clear solid and drawn flat beside it to the same scale with its area; drag the plane. A cube is the existing solid: "box" with equal sides. Pyramids were not added to curvedSolid: the square pyramid\'s net is the existing net kind (solid: "squarePyramid") and its cuts are crossSection\'s pyramid. Examples: { kind: "curvedSolid", shape: "cone", radius: "r", height: "h", slant: "l", surface: "S", net: true, extent: 5 }; { kind: "curvedSolid", shape: "cylinder", radius: "r", height: "h", volume: "V", cavalieri: true, extent: 6 } (with sliders: true); { kind: "crossSection", solid: "cone", length: "r", height: "h", cut: "base", at: "z", area: "A" } with a constraint that the plane is on the solid (at ≤ h, or at ≤ r for a side cut; see onTheSolid in galleryHsf.ts).',
  },
  {
    ...ask(
      'H28',
      'factorTree',
      'Pairs of equal factors circled, coming out of the root: √72 = 6√2',
      ['m.9.radicals'],
    ),
    status: 'drawn',
    gallery: ['g.m9-radicals-simplify', 'g.m9-radicals-cube-root', 'g.m9-radicals-perfect-square'],
    notes:
      'Drawn (group HF). New optional field on factorTree (types.ts; drawn by FactorTreeHsf.tsx, math in rootSplit.ts): root { index?: 2 | 3, outside?, inside? } (value ids). Under the tree\'s foot row of primes each pair of equal primes (each three for index 3) is ringed and arrowed down to the one it brings out; the leftover primes are arrowed into the radical; the line reads 2 × 3 × √2 = 6√2 (∛ for a cube root; a perfect power ends whole, = 24). The caption writes √72 = √(2 × 2 × 2 × 3 × 3), the pairs coming out, and the result, or says the root is already simplest. The harness checks outside^index × inside = value and that inside has no group left. Step text "largest perfect square factor of N" (and cube) is taught to the harness (harness/phrasesHsf.ts). Make a and b derived (worked out, not typed) with a constraint that b has no square factor but 1 (see rootDemo in galleryHsf.ts). Example: { kind: "factorTree", value: "n", root: { index: 2, outside: "a", inside: "b" } } with a = √(largest perfect square factor of n) and n = a² × b.',
  },
  {
    ...ask(
      'H29',
      'powerScale',
      'A log mode: the exponent read off the ruler, log₁₀ 470,000 ≈ 5.67',
      ['m.11.logarithms'],
    ),
    status: 'drawn',
    gallery: ['g.m11-logarithms-ruler', 'g.m11-logarithms-small'],
    notes:
      'Drawn (group HF). New optional field on powerScale (types.ts; drawn by PowerScaleHsf.tsx): log (a value id, log₁₀ of the number, checked to 5e-4). Under the 1–10 ruler a log₁₀ scale from 0 to 1 (a slide rule\'s L scale) reads the mantissa\'s log: the point drops to 0.67 for 4.7. The caption works log₁₀ 470,000 = 5 + log₁₀ 4.7 ≈ 5 + 0.672 = 5.6721, negative exponents with a true minus (−3 + 0.477). Make the log derived and pass fixed: true (the log is worked out, not dragged). Step text "log₁₀({N})" is taught to the harness (harness/phrasesHsf.ts). Example: { kind: "powerScale", number: "N", mantissa: "a", exponent: "n", log: "L", fixed: true } with N = a × 10ⁿ, n = exponent of the power of ten at or below N and L = log₁₀(N).',
  },

  // ── C. Statistics and study design figures ──
  {
    ...ask(
      'H30',
      'studyDesign',
      'Explore figure: population to sample to randomly assigned groups; survey, observational study, experiment',
      ['m.11.study-design'],
    ),
    status: 'drawn',
    gallery: ['g.m11-study-design', 'g.m11-study-design-sampling'],
    notes:
      'Card figures for the sampling methods: simple random, stratified, cluster, systematic, convenience. Drawn (group HB). Explore figure { kind: "studyDesign" }; each scene sets study: { design: "survey" | "observational" | "experiment", method?: "simple random" | "stratified" | "cluster" | "systematic" | "convenience" (default simple random), sample?: 6–24 (default 12), groups?: [two names] (default Treatment and Control, or Group A and B), lit?: "population" | "sample" | "groups" }. The population is 48 people; the picks come from a fixed seed (studyMath.ts) and the harness checks each method (every band in a stratified sample, whole blocks in a cluster sample, equal gaps in a systematic one, the two groups splitting the sample). The five sampling methods are card icons for sort cards: { kind: "icon", icon: "stratified sample" } (also "simple random sample", "cluster sample", "systematic sample", "convenience sample"), 36 dots with the 9 picked. Example scene: { label: "Experiment", lines: [...], study: { design: "experiment", groups: ["New drug", "Placebo"], lit: "groups" } }.',
  },

  // ── D. Biology ──
  {
    ...ask(
      'H31',
      'macromolecules',
      'Explore figure: monomers joining into polymers (sugars to starch, amino acids to a protein, nucleotides, fats)',
      ['s.9.biomolecules'],
    ),
    status: 'drawn',
    gallery: ['g.s9-biomolecules-polymers'],
    notes:
      'Drawn (group HG, layouts/macroFigure.tsx). Explore figure { kind: "macromolecules" }; each scene sets macro: { kind: "carbohydrate" | "protein" | "nucleicAcid" | "lipid", count?: 2–4 monomers (default 3; a lipid is always glycerol + 3 fatty acids), split?: true for hydrolysis (the polymer on top, water added) }. Monomers sit on separate cards with the groups that join lit (OH and H, carboxyl and amine, the 3′ OH and the next phosphate); the polymer shows its new bonds lit and named (glycosidic, peptide, sugar–phosphate, 3 ester bonds); the water molecules are drawn and counted (n − 1, or 3 for a fat). Names follow the count: 2 glucose make maltose, 2 amino acids a dipeptide. The protein chain is shown folding. The harness checks the count and that a line counting water says the figure’s number. Example scene: { label: "Proteins", lines: ["Amino acids join end to end by peptide bonds."], macro: { kind: "protein", count: 4 } }.',
  },
  {
    ...ask(
      'H32',
      'membrane',
      'Membrane with particles on each side, counts from the values, arrows high to low; cells in hypotonic, isotonic and hypertonic water',
      ['s.9.membrane-transport'],
    ),
    status: 'drawn',
    gallery: [
      'g.s9-membrane-transport-diffusion',
      'g.s9-membrane-transport-facilitated',
      'g.s9-membrane-transport-osmosis',
      'g.s9-membrane-transport-pump',
      'g.s9-membrane-transport-equilibrium',
      'g.s9-membrane-transport-steep',
      'g.s9-membrane-transport-tonicity',
    ],
    notes:
      'Drawn (group HG, reps/Membrane.tsx). Calculator picture { kind: "membrane", outside, inside (counts 0–40, numbers or variable ids), transport: "diffusion" | "facilitated" | "osmosis" | "active", particle?: "O₂" (the name in the counts), moved?: 0–12 crossing now (lit on the arrow), atp?: the ATP spent at a pump ("2 ATP → 2 ADP + 2 P"), gradient?: a variable holding outside − inside (checked) }. A phospholipid bilayer, the outside above and the cytoplasm below, the particles on each side counted exactly; the arrow runs high to low (diffusion; through a channel protein when facilitated), water through an aquaporin toward more solute (osmosis; the caption names the outside hypotonic or hypertonic), or a pump low to high (active). Equal counts draw a two-way arrow (no net movement). Counts are typed: no handles or sliders. The harness checks the counts, the gradient, the arrow’s direction and that no more are moved than the side has. Example: representation: { kind: "membrane", outside: "o", inside: "i", transport: "diffusion", particle: "O₂", gradient: "d" } with d = o − i. Card icons for sorts: { kind: "icon", icon: "red blood cell in hypotonic water" } (also isotonic, hypertonic, and "plant cell in hypotonic water" and the other two).',
  },
  {
    ...ask(
      'H33',
      'organelleEnergy',
      'Explore figure: chloroplast and mitochondrion, glucose, oxygen, carbon dioxide, water and ATP cycling between them',
      ['s.9.cellular-energy'],
    ),
    status: 'drawn',
    gallery: ['g.s9-cellular-energy-organelles'],
    notes:
      'Drawn (group HG, layouts/organelleFigure.tsx). Explore figure { kind: "organelleEnergy" }; each scene sets energy: { process?: "cycle" (default) | "photosynthesis" | "respiration" | "lightReactions" | "calvinCycle" | "glycolysis" | "krebsCycle" | "electronTransport", lit?: "light" | "CO₂" | "H₂O" | "glucose" | "O₂" | "ATP" }. A chloroplast (double membrane, grana, stroma) and a mitochondrion (cristae, matrix) in the cytoplasm; glucose and O₂ flow to the mitochondrion over the top, CO₂ and H₂O back underneath, light in from the sun and ATP out to the cell’s work. A process lights its part (thylakoids, stroma, matrix, inner membrane, cytoplasm), its arrows and its equation under the drawing (6CO₂ + 6H₂O + light → C₆H₁₂O₆ + 6O₂; glycolysis 2 ATP, Krebs 2 ATP, electron transport most ATP; no single total is printed, since textbooks give 30 to 38). The harness checks that a ringed substance flows in the lit process. Example scene: { label: "Calvin cycle", lines: ["In the stroma, ATP and NADPH power the building of glucose from CO₂."], energy: { process: "calvinCycle", lit: "CO₂" } }.',
  },
  {
    ...ask(
      'H34',
      'cellDivision',
      'Sequence stage figures: the cell cycle, mitosis phases and meiosis I and II with chromosomes by parent color, crossing over',
      ['s.9.mitosis-meiosis'],
    ),
    status: 'drawn',
    gallery: [
      'g.s9-mitosis-meiosis-mitosis',
      'g.s9-mitosis-meiosis-meiosis',
      'g.s9-mitosis-meiosis-six',
    ],
    notes:
      'Chromosome count driven by 2n; gametes with n. Drawn (group HG, layouts/divisionCard.tsx, chromosomes from divisionMath.ts). A card figure for sequence stages and sort cards: { kind: "cellDivision", stage: "interphase" | "prophase" | "metaphase" | "anaphase" | "telophase" | "cytokinesis" | "prophase I" | "metaphase I" | "anaphase I" | "telophase I" | "prophase II" | "metaphase II" | "anaphase II" | "telophase II", diploid?: 2 | 4 | 6 (2n, default 4) }. Maternal chromosomes red, paternal blue, pair sizes long to short; duplicated chromosomes are two sister chromatids at a centromere; the spindle runs from centrosomes at the poles; prophase I pairs the homologs with a crossed-over tip, metaphase I lines the pairs up, anaphase I separates homologs (sisters stay joined), anaphase II separates sisters, telophase II ends in four cells of n, all different. The harness checks 2n, the chromosomes and chromatids in every cell for the stage (2n after mitosis, n of one per pair after meiosis I), the four gametes differing, and that a sequence lists the stages in order. Example stage: { label: "Metaphase I", figure: { kind: "cellDivision", stage: "metaphase I", diploid: 4 } }.',
  },
  {
    ...ask(
      'H35',
      'punnettSquare',
      'Dihybrid 4 × 4 square, incomplete dominance and codominance colors, sex-linked alleles on X',
      ['s.9.inheritance-patterns'],
    ),
    status: 'drawn',
    gallery: [
      'g.s9-inheritance-patterns-dihybrid',
      'g.s9-inheritance-patterns-dihybrid-pure',
      'g.s9-inheritance-patterns-incomplete',
      'g.s9-inheritance-patterns-codominant',
      'g.s9-inheritance-patterns-x-linked',
      'g.s9-inheritance-patterns-x-pedigree',
    ],
    notes:
      'Pedigree: sex-linked carriers (half-shaded). Drawn (group HG, reps/PunnettHs.tsx, boxes from punnettMath.ts). An optional field on punnettSquare; without it the Grade 7 square is unchanged. first/second stay the parents’ counts of dominant alleles. inheritance: { pattern: "dihybrid", firstB, secondB (the second gene’s counts), letterB: "Y", names?: [both dominant, first only, second only, neither] } draws the parents’ four gametes each way and 16 boxes colored by phenotype with a counted key (9:3:3:1); dominant = boxes of 16 with both dominant traits, recessive? = neither. { pattern: "incomplete" | "codominant", alleles?: ["R", "W"] (drawn Cᴿ, Cᵂ with letter "C"), names?: ["red", "pink", "white"], middle?: the heterozygote boxes } colors red, pink (a blend) or red patches on white (roan); dominant = first-allele homozygotes, recessive? = second-allele homozygotes. { pattern: "xLinked", carriers?: id } takes first = mother (0–2 Xᴬ), second = father (0–1): Xᴬ/Xᵃ and Y across the top, each box a daughter or son, the affected filled, carrier daughters half-shaded; dominant = boxes without the trait, recessive? = with it. The harness recounts each from the parents (product rule, sons from the mother). Example: { kind: "punnettSquare", first: "m", second: "f", dominant: "t", recessive: "r", letter: "B", inheritance: { pattern: "xLinked", carriers: "k" } }. Pedigrees needed no change: X-linked genotypes are written "XᴮXᵇ", "XᵇY" with carriers half-filled (family.carriers); the harness now checks every pedigree’s genotypes against its symbols and parents (no male carriers of X-linked alleles, a son’s X from his mother).',
  },
  {
    ...ask(
      'H36',
      'dnaStrand',
      'DNA ladder from a base sequence, its complement, the mRNA, codons and the amino acids',
      ['s.9.dna-protein-synthesis', 's.9.biotechnology'],
    ),
    status: 'drawn',
    gallery: [
      'g.s9-dna-protein-synthesis-chargaff',
      'g.s9-dna-protein-synthesis-codons',
      'g.s9-biotechnology-substitution',
      'g.s9-biotechnology-nonsense',
      'g.s9-biotechnology-insertion',
      'g.s9-biotechnology-deletion',
    ],
    notes:
      'A mutation (substitution, insertion, deletion) lit in the sequence and its effect on the protein. Drawn (group HG, reps/DnaStrand.tsx, the standard codon table and rules in dnaMath.ts). Calculator picture { kind: "dnaStrand", sequence: the template strand, up to 12 of A T G C, drawn 3′ to 5′ ("TACCGGTTCATT"), length?: bases drawn (number or variable), show?: ["mrna", "protein"] (default both), mutation?: { type: "substitution" | "insertion" | "deletion", at: base number (number or variable), base?: the new base (a substitution defaults to the transition A↔G, C↔T; an insertion to A) }, codons?: a variable holding the complete codons (checked); or percentA: a variable and pairs?: 10 for Chargaff’s rule (a ladder of whole pairs, A = T, G = C; a percent that isn’t whole bases draws faded) }. The ladder shows both backbones, 2 hydrogen bonds per A–T rung and 3 per G–C; the mRNA (U for T) with codons bracketed; amino acid chips from the codon table, Stop in outline. With a mutation the changed base is ringed (a caret where a base was deleted), the protein is shown before and after with changed amino acids lit, and the caption names silent, missense, nonsense or frameshift. The harness checks the codon table (64 codons, 6 for Leu, Ser, Arg, 3 stops, AUG = Met), the transcription, the codon count, the mutation position and length, and Chargaff’s counts. Step text may say “the codon holding base {p}” (⌈p ÷ 3⌉, phrasesHsg.ts). Example: representation: { kind: "dnaStrand", sequence: "TACCGGTTCATT", mutation: { type: "substitution", at: "p" } }.',
  },
  ask(
    'H37',
    'gel',
    'Gel electrophoresis: bands placed by fragment size, a ladder lane; PCR copies doubling each cycle',
    ['s.9.biotechnology'],
  ),
  ask(
    'H38',
    'alleleFrequencies',
    'Hardy–Weinberg: p and q as beads in a population, genotype bars p², 2pq, q²',
    ['s.9.evolution-evidence'],
    'Card figures: homologous limbs (arm, wing, flipper, leg) with matching bones colored.',
  ),
  ask(
    'H39',
    'cladogram',
    'Cladogram with shared traits on the branches; domain and kingdom card icons',
    ['s.9.classification', 's.9.evolution-evidence'],
  ),
  ask(
    'H40',
    'energyPyramid',
    'Pyramids of energy, biomass and numbers; succession stages; the nitrogen cycle as an explore figure',
    ['s.9.ecosystem-dynamics'],
  ),
  ask(
    'H41',
    'feedbackLoop',
    'Explore figure: stimulus, sensor, control center, effector, response; body temperature and blood sugar',
    ['s.9.homeostasis', 's.12.climate-systems'],
    'The climate page uses the same loop for the ice-albedo and water-vapor feedbacks.',
  ),
  ask(
    'H42',
    'immuneResponse',
    'Pathogen card icons (virus, bacterium, fungus, parasite); the immune response in stages; antibody levels after a first and second exposure',
    ['s.9.immune-disease'],
  ),

  // ── E. Chemistry ──
  ask(
    'H43',
    'unitChain',
    'Conversion factors in a chain with units crossed out; a ruler read to the estimated digit; accuracy and precision targets',
    ['s.10.measurement'],
  ),
  ask(
    'H44',
    'atomModel',
    'Bohr model from protons, neutrons and electrons: isotopes and ions change the picture',
    ['s.10.atomic-structure', 's.10.electrons-in-atoms', 's.10.nuclear-chemistry'],
  ),
  ask(
    'H45',
    'orbitalDiagram',
    'Orbital boxes filled in Aufbau order with up and down arrows, the energy ladder, and emission lines from jumps',
    ['s.10.electrons-in-atoms', 's.11.modern-physics'],
  ),
  ask(
    'H46',
    'periodicTable',
    'A trend as shading across the table (radius, ionization energy, electronegativity) with arrows',
    ['s.10.periodic-trends'],
  ),
  ask(
    'H47',
    'lewisStructure',
    'Electron-dot structures, electron transfer in ionic bonds, the sea of electrons; hydrocarbons from n carbons',
    ['s.10.bonding', 's.10.organic'],
  ),
  ask(
    'H48',
    'vsepr',
    'Ball-and-stick shapes with bond angles and dipole arrows; hydrogen bonds between water molecules',
    ['s.10.molecular-shape'],
  ),
  ask(
    'H49',
    'reaction',
    'Coefficients set the molecule counts and an atom tally; leftover reactant lit (limiting reactant); reaction-type card figures',
    ['s.10.reaction-types', 's.10.stoichiometry'],
  ),
  ask(
    'H50',
    'moleMap',
    'Grams ↔ moles ↔ particles ↔ liters of gas, each arrow with its factor, the current value lit',
    ['s.10.mole', 's.10.stoichiometry'],
  ),
  ask(
    'H51',
    'gasPiston',
    'Cylinder with a piston, particles moving by temperature, a pressure gauge and a volume scale',
    ['s.10.gas-laws'],
  ),
  ask(
    'H52',
    'beaker',
    'Solute particles per volume, dilution as two beakers (M₁V₁ = M₂V₂); a solubility curve',
    ['s.10.molarity'],
  ),
  ask(
    'H53',
    'energyProfile',
    'Reaction energy diagram: reactant and product levels, ΔH, activation energy, the catalyst path dashed',
    ['s.10.thermochemistry', 's.10.rates-equilibrium'],
    'Also a coffee-cup calorimeter (q = mcΔT) for thermochemistry and thermodynamics.',
  ),
  ask(
    'H54',
    'equilibriumChart',
    'Concentrations against time leveling off, and the shift after a change (Le Châtelier)',
    ['s.10.rates-equilibrium'],
  ),
  ask(
    'H55',
    'phScale',
    'pH scale 0–14 in indicator colors with the value marked and [H⁺] as a power of ten; a titration curve',
    ['s.10.acids-bases'],
  ),
  ask(
    'H56',
    'electrochemicalCell',
    'Explore figure: galvanic cell with two electrodes, a salt bridge and electrons flowing through the wire',
    ['s.10.redox'],
  ),
  ask(
    'H57',
    'decayChart',
    'Half-life: a grid of atoms decaying, what is left after n half-lives, the decay curve; nuclear equations',
    ['s.10.nuclear-chemistry', 's.12.radiometric-dating'],
  ),

  // ── F. Physics ──
  {
    ...ask(
      'H58',
      'motionGraph',
      'Area under velocity–time shaded as displacement, the tangent slope, a strobe motion diagram',
      ['s.11.kinematics-1d'],
    ),
    status: 'drawn',
    gallery: [
      'g.s11-kinematics-1d-velocity',
      'g.s11-kinematics-1d-turn',
      'g.s11-kinematics-1d-braking',
      'g.s11-kinematics-1d-tangent',
    ],
    notes:
      'Drawn (group HK, reps/MotionGraphHs.tsx) as an option on the Grade 8 speed graph, so every current motionGraph page is unchanged. Calculator picture { kind: "motionGraph", graph: "speed", time, acceleration, speed (the velocity v at the end), start (v₀, number or variable), distance? (the displacement Δx), kinematics: { view: "velocity" | "position", at?: t₁ (the tangent’s time, position view), slope?: v₁ (the tangent’s slope), position?: x₀ (default 0), strobe?: false, fixed?: true } }. Velocities are signed. Velocity view: the v–t line, the area to the axis shaded + above and − below, each part labelled; where the line crosses the axis the object turns round (an open dot) and the caption gives the displacement and the distance travelled. Position view: x = x₀ + v₀t + ½at², the tangent at t₁ with a rise/run triangle, its slope = v₀ + at₁; drag the tangent point. Above either: a strobe motion diagram, the position every Δt (1, 2 or 5 × 10ⁿ s) with a velocity arrow on each dot, the way back on a second row. Drawn in SI (m, s, m/s) whatever units the boxes show. The harness checks slope = v₀ + at₁ and Δx = (v₀ + v)/2 × t with signed velocities. Example: representation: { kind: "motionGraph", graph: "speed", time: "t", acceleration: "a", speed: "v", start: "u", distance: "d", kinematics: { view: "velocity" } }.',
  },
  {
    ...ask(
      'H59',
      'projectile',
      'Trajectory from launch speed, angle and height, velocity components along it, maximum height and range',
      ['s.11.kinematics-2d', 'm.12.parametric'],
    ),
    status: 'drawn',
    gallery: [
      'g.s11-kinematics-2d-level',
      'g.s11-kinematics-2d-cliff',
      'g.s11-kinematics-2d-steep',
      'g.m12-parametric-launch',
    ],
    notes:
      'Drawn (group HK, reps/Projectile.tsx, the physics in hskMath.ts). Calculator picture { kind: "projectile", speed: v₀, angle: θ in degrees (0 to 90 on the demos, −90 to 90 allowed), height?: launch height (number or variable, default 0), g?: 9.8, vx?, vy?, time?: flight time T, range?: R, peak?: H (checked when named), at?: a time t (the ball drawn there, its position labelled; the path continues dashed past the landing), x?, y?: the position at t, parametric?: true (captions x(t) and y(t) for m.12.parametric), fixed?: true }. Drawn to scale, one unit the same both ways, on soil with a grass edge and a rock cliff under a raised launch: the path, the ball at launch, at the top and on landing (or at t) with its velocity (ink) and components vₓ (green, steady) and v_y (orange, changing), H dashed, R along the ground, the angle arc. Drag the tip of the launch velocity to change the angle. Drawn in SI whatever units the boxes show. The harness checks vₓ, v_y, T, R, H and x(t), y(t) against the launch values. Example: representation: { kind: "projectile", speed: "v", angle: "q", height: "h", vx: "x", vy: "y", time: "T", range: "R", peak: "H" }; parametric: { kind: "projectile", speed: "v", angle: "q", height: "h", at: "t", x: "X", y: "Y", parametric: true }.',
  },
  {
    ...ask(
      'H60',
      'freeBody',
      'Free-body diagram with scaled force arrows (weight, normal, friction, tension, applied); an incline with components',
      ['s.11.dynamics-vectors', 's.11.circular-gravitation'],
    ),
    status: 'drawn',
    gallery: [
      'g.s11-dynamics-vectors-push',
      'g.s11-dynamics-vectors-rope',
      'g.s11-dynamics-vectors-incline',
      'g.s11-dynamics-vectors-steep',
      'g.s11-dynamics-vectors-elevator',
    ],
    notes:
      'Drawn (group HK, reps/FreeBody.tsx, the forces in hskMath.ts freeBodyOf). Calculator picture { kind: "freeBody", support: "floor" | "incline" | "hanging", mass, g?: 9.8, incline?: θ (degrees, incline), weight?, normal?, friction?: μF_N (kinetic, or the most static friction holds), mu?: μ (for the caption), applied?: F and appliedAngle? (degrees above level; up the slope on an incline), tension?: T and tensionAngle? (a rope drawn on the floor), along?: W sin θ, net?, acceleration?, moving?: "right" | "left" | "up" | "down" (already sliding: kinetic friction full size against the motion, net counted + that way; without it the block starts at rest and friction is capped as static friction, the caption saying it stays put), fixed?: true }. A wooden block on a floor, on a ramp drawn at θ, or hanging from a beam; every force an arrow from its center on one scale in N (weight, normal, friction, tension, applied, each its own color and labelled W, F_N, f or f_s, T, F with its value); on an incline the weight’s components W sin θ and W cos θ dashed with θ marked between W and W cos θ; the net force as a separate arrow beside the block (F_net = 0 when balanced). Drag the applied force’s or the rope’s tip along its line. Captions work weight, normal force, friction, net force and a = F_net/m in words (Weight, Normal force, Net force) since plain text has no subscripts. The harness checks W = mg, F_N, W sin θ, F_net (signed along the motion when moving) and a. Example: representation: { kind: "freeBody", support: "incline", moving: "down", mass: "m", incline: "q", weight: "W", along: "P", normal: "N", friction: "f", mu: "k", net: "n", acceleration: "a" }. For the circular-gravitation page, "hanging" draws a mass on a string at the bottom of its swing (tension up, weight down, the net force toward the center).',
  },
  {
    ...ask(
      'H61',
      'circularMotion',
      'Object on a circle with velocity tangent and acceleration toward the center; two masses and the pull between them',
      ['s.11.circular-gravitation'],
    ),
    status: 'drawn',
    gallery: [
      'g.s11-circular-gravitation-string',
      'g.s11-circular-gravitation-car',
      'g.s11-circular-gravitation-gravity',
      'g.s12-solar-system-kepler',
      'g.s12-solar-system-comet',
    ],
    notes:
      'Orbit: Kepler ellipse with foci and equal-area sectors for the solar system page. Drawn (group HK, reps/CircularMotion.tsx; Kepler\'s equation and swept areas in hskMath.ts). Kepler\'s ellipse is drawn as a mode of circularMotion rather than as an option on the Grade 8 orbit picture: orbit requires distance and pull variables a Kepler page doesn\'t have, and the orbit page stays as it is. Calculator picture { kind: "circularMotion", mode: "string" | "car" | "gravity" | "kepler", fixed?: true, and per mode: string and car: radius, speed, mass?, acceleration? (v²/r), force? (mv²/r), period? (2πr/v); gravity: masses: [m₁, m₂], distance, force? (Gm₁m₂/r², G = 6.674 × 10⁻¹¹); kepler: semiMajor (AU), eccentricity (0 to 0.95), perihelion?, aphelion?, period? (years, T² = a³) }; every field a number or variable. String: a ball on a string seen from above, the velocity tangent (drag its tip for the speed), the centripetal acceleration toward the center, the dashed straight path it would take if let go. Car: a car on a curved road, friction toward the center. Gravity: two lit spheres sized by the cube root of their masses, equal and opposite pull arrows (drag the second mass: the arrows follow the inverse square), r bracketed, not to scale. Kepler: the ellipse with the sun at one focus, the empty focus, perihelion and aphelion, and two sectors each swept in 1/8 of the period (positions from Kepler\'s equation) with equal areas. The harness checks v²/r, mv²/r, 2πr/v, Gm₁m₂/r², a(1 ± e), T² = a³ and that both sectors are 1/8 of the ellipse\'s area. Example: representation: { kind: "circularMotion", mode: "string", radius: "r", speed: "v", mass: "m", acceleration: "a", force: "F", period: "T" }; { kind: "circularMotion", mode: "kepler", semiMajor: "a", eccentricity: "e", perihelion: "q", aphelion: "Q", period: "T" } (for s.12.solar-system).',
  },
  {
    ...ask(
      'H62',
      'collision',
      'Carts on a track before and after, momentum arrows, sticking together or bouncing',
      ['s.11.momentum'],
    ),
    status: 'drawn',
    gallery: [
      'g.s11-momentum-stick',
      'g.s11-momentum-head-on',
      'g.s11-momentum-elastic',
      'g.s11-momentum-explode',
    ],
    notes:
      'Drawn (group HK, reps/Collision.tsx; the velocities after in hskMath.ts collisionOf). Calculator picture { kind: "collision", type: "stick" | "elastic" | "explode", masses: [m₁, m₂], before: [v₁, v₂] (signed, + to the right; "explode" takes one shared velocity), after?: [v₁′, v₂′] (stick: [v′]; explode: [v₁′ (given), v₂′]), momentum?: total p, energy?: [KE before, KE after], fixed?: true }. Two rows, Before and After: painted carts with wheels on a metal track, their masses on them, each cart’s momentum p = mv as an arrow on one scale (arrows kept inside the canvas), velocities under the carts, and the total momentum tip to tail in each row (the same before and after). Stick: the carts coupled after, one arrow and v′. Explode: coupled before, pushed apart after. Drag the first cart’s momentum arrow to change v₁. The caption works the momentum before and after and the kinetic energy (lost, kept, or given by the spring). The harness checks v′ from the momentum, the elastic formulas, the total momentum, the kinetic energies and that an elastic collision keeps kinetic energy. Example: representation: { kind: "collision", type: "stick", masses: ["m", "n"], before: ["v", "w"], after: ["u"], momentum: "p" }.',
  },
  {
    ...ask(
      'H63',
      'simpleMachine',
      'Lever, pulley system and inclined plane with effort, load and mechanical advantage from the values',
      ['s.11.work-energy-power'],
    ),
    status: 'drawn',
    gallery: [
      'g.s11-work-energy-power-lever',
      'g.s11-work-energy-power-pulley',
      'g.s11-work-energy-power-fixed-pulley',
      'g.s11-work-energy-power-ramp',
      'g.s11-work-energy-power-spring',
    ],
    notes:
      'energyTrack: a friction-heat bar and a spring. Drawn (group HK, reps/SimpleMachine.tsx and, for the energyTrack option, reps/EnergySpring.tsx; the mechanical advantage in hskMath.ts machineOf). Calculator picture { kind: "simpleMachine", machine: "lever" | "pulley" | "incline", load (N), effort?, advantage? (ideal MA), effortArm? and loadArm? (lever, m), strands? (pulley, whole 1 to 6; 1 is a single fixed pulley), length? and height? (incline, m), efficiency? (percent, default 100: effort = load ÷ (MA × efficiency)), effortDistance?, loadDistance? (checked: effort distance = MA × load distance), fixed?: true }. Lever: a wooden plank on a metal fulcrum drawn to scale from the two arms, the load crate and its weight, the effort arrow, both arms bracketed; drag the fulcrum (the arms trade, their sum kept). Pulley: a block and tackle with every supporting strand drawn and numbered, the sheave blocks in metal, the free end pulled down as the effort. Incline: a wooden ramp to scale, the crate pushed along the slope, its weight, the length and height labelled; a ramp shorter than its height draws faded with the reason. Load and effort share one scale in N. energyTrack option: spring: { k (N/m), compression (m), stored?: ½kx², friction? (N), rough? (m), heat?: fd, fixed? } on an energyTrack spec (its height, potential, kinetic, mass): a steel spring against a wall launches a block across a gritty rough patch and up a smooth ramp; bars Start (the spring’s ½kx²) and Now (heat + potential + kinetic, the same total), a key with each value, the highest point it can reach dashed; drag the block along the ramp. The harness checks the MA, the effort, the distances, ½kx², fd and the kinetic energy left. Example: representation: { kind: "simpleMachine", machine: "lever", load: "W", effortArm: "e", loadArm: "l", advantage: "A", effort: "F" }; { kind: "energyTrack", track: "coaster", height: "h", potential: "U", kinetic: "K", mass: "m", spring: { k: "k", compression: "x", stored: "E", friction: "f", rough: "d", heat: "Q" } }.',
  },
  {
    ...ask(
      'H64',
      'heatEngine',
      'Hot reservoir, engine, work out and heat to the cold reservoir, with the efficiency',
      ['s.11.thermodynamics'],
    ),
    status: 'drawn',
    gallery: [
      'g.s11-thermodynamics-engine',
      'g.s11-thermodynamics-carnot',
      'g.s11-thermodynamics-refrigerator',
    ],
    notes:
      'Drawn (group HK, reps/HeatEngine.tsx; flows in hskMath.ts heatEngineOf). Calculator picture { kind: "heatEngine", mode?: "engine" | "refrigerator" (default engine), work: W, hotHeat: Q_H (given for an engine, else worked out), coldHeat: Q_L (given for a refrigerator, else worked out), hot?: T_H and cold?: T_L (K), efficiency?: percent (engine) or the COP (refrigerator), carnot?: the Carnot limit (percent, or the Carnot COP) }. The hot reservoir (red) over the engine (a metal cylinder and piston) over the cold reservoir (blue); the energy flows as bands as wide as their size, Q_H = W + Q_L, arrowheads showing the way heat moves (reversed for a refrigerator, work in); a bar of the efficiency (or COP) with the Carnot limit marked. Work more than the heat in, a cold reservoir hotter than the hot one, or an efficiency past the Carnot limit draws faded, the caption naming the law it breaks. Captions write Qₕ, Qₗ, Tₕ, Tₗ (H for hot, L for low). The harness checks Q_L or Q_H, the efficiency or COP and the Carnot limit. Example: representation: { kind: "heatEngine", hotHeat: "Q", work: "W", coldHeat: "C", efficiency: "e", hot: "H", cold: "L", carnot: "c" }.',
  },
  {
    ...ask(
      'H65',
      'wave',
      'Standing waves on a string and in pipes (harmonic n, nodes and antinodes); Doppler wavefronts from a moving source',
      ['s.11.sound-waves'],
    ),
    status: 'drawn',
    gallery: [
      'g.s11-sound-waves-string',
      'g.s11-sound-waves-open-pipe',
      'g.s11-sound-waves-closed-pipe',
      'g.s11-sound-waves-doppler',
      'g.s11-sound-waves-sonic-boom',
    ],
    notes:
      'Drawn (group HK) as two options on the Grade 8 wave, so every current wave page is unchanged: reps/WaveStanding.tsx and reps/WaveDoppler.tsx, the physics in hskMath.ts (standingOf, dopplerOf). The wave spec keeps its required wavelength and extent (pass extent: 1). Standing: { kind: "wave", wavelength: λ, frequency?: f, extent: 1, standing: { medium: "string" | "open" | "closed", harmonic: n, length: L, speed?: v } } — a string between two metal posts, or a glass pipe (a metal cap on a closed end); the envelope at both extremes (solid and dashed), every node (N, dot on the axis) and antinode (A) marked and counted from the harmonic, half a wavelength bracketed, L and n below; λ = 2L/n (string, open pipe) or 4L/n (closed pipe, odd n only; an even n draws faded with the reason), f = v/λ. Pipes show the air’s displacement: antinodes at open ends, a node at a closed end. Doppler: { kind: "wave", wavelength: λ at rest, frequency: f, extent: 1, doppler: { sourceSpeed: vₛ, waveSpeed: v, frequency: f, ahead?: f′ ahead, behind?: f′ behind } } — six wavefronts, one per period, each a circle centered where the source was when it left (its centers dotted), bunched ahead and spread behind with λ bracketed on each side, the source a lit ball with its velocity; at or past the wave speed the fronts pile into a shock cone (half-angle arcsin(v/vₛ)) drawn in red. The harness checks λ, f = v/λ, odd closed-pipe harmonics and f v/(v ∓ vₛ). Example: representation: { kind: "wave", wavelength: "l", frequency: "f", extent: 1, standing: { medium: "closed", harmonic: "n", length: "L", speed: "v" } }.',
  },
  {
    ...ask(
      'H66',
      'rayDiagram',
      'Lenses and mirrors with principal rays, object and image from 1/f = 1/d₀ + 1/dᵢ; refraction with the normal and angles',
      ['s.11.optics', 's.12.starlight-spectra'],
    ),
    status: 'drawn',
    gallery: [
      'g.s11-optics-lens-real',
      'g.s11-optics-magnifier',
      'g.s11-optics-diverging',
      'g.s11-optics-concave',
      'g.s11-optics-convex',
      'g.s11-optics-refraction',
      'g.s11-optics-total-internal',
      'g.s11-optics-double-slit',
      'g.s12-starlight-spectra-refractor',
      'g.s12-starlight-spectra-reflector',
    ],
    notes:
      'Total internal reflection past the critical angle; double-slit fringes; telescopes for the Earth and space page. Drawn (group HK, reps/RayLens.tsx and reps/RayOptics.tsx; thin lens, Snell and fringe math in hskMath.ts). Calculator picture { kind: "rayDiagram", fixed?: true, and one mode }: lens or mirror: { mode: "lens" | "mirror", shape: "converging" | "diverging" | "concave" | "convex", focal: f (a length; the page may pass it signed, − for diverging or convex: the shape sets the sign), objectDistance: dₒ, objectHeight?: hₒ, imageDistance?: dᵢ, imageHeight?: hᵢ, magnification?: m } — a glass lens (biconvex or biconcave) or a silvered mirror on the axis, F, F′, 2F (C for a mirror) marked, the object arrow, the three principal rays in three colors (parallel then through F, through the center or vertex, through F then parallel), each continued to where it meets the others: a real image (solid, the rays meet) or a virtual one (dashed back-extensions), from 1/f = 1/dₒ + 1/dᵢ; the two drawing scales are affine so the rays meet at the image exactly; an object at F sends parallel rays and no image; drag the object. Refraction: { mode: "refraction", n1, n2, angle: θ₁ (degrees from the normal), refracted?: θ₂, critical?: θc, media?: [top, bottom names] } — two media shaded by their index, the normal dashed, the ray bent by n₁ sin θ₁ = n₂ sin θ₂ with its faint reflection, angle arcs, the critical angle dashed red; past it, total internal reflection (the reflection full strength, no ray out); drag the incoming ray. Double slit: { mode: "doubleSlit", wavelength (nm), spacing (mm), screen (m), fringe?: Δy (mm) } — light in its color (grey outside 380–750 nm) through two slits onto a screen, cos² brightness, bright fringes m = −2 … 2 labelled, Δy = λL/d bracketed, the paths to m = 1 dashed; not to scale across. Telescope: { mode: "telescope", design: "refracting" | "reflecting", objective: fₒ, eyepiece: fₑ, magnification?: M, length? (fₒ + fₑ) } — refracting: objective and eyepiece lenses fₒ + fₑ apart, starlight focused in the shared focal plane and sent out parallel at a larger angle; reflecting (Newtonian): a parabolic mirror and a 45° flat turning the focus up to the eyepiece; M = fₒ/fₑ. Step text must write a divisor before a sine (n₁/n₂ × sin θ₁): the harness reads sin(55)/2.7 as sin(55/2.7). The harness checks dᵢ, m, hᵢ, the sign of f against the shape, θ₂, θc, Δy and M. Example: representation: { kind: "rayDiagram", mode: "lens", shape: "converging", focal: "f", objectDistance: "o", objectHeight: "h", imageDistance: "i", magnification: "m", imageHeight: "k" }.',
  },
  {
    ...ask(
      'H67',
      'charges',
      'Point charges with field lines and the Coulomb force arrows scaled by q₁, q₂ and r',
      ['s.11.electrostatics'],
    ),
    status: 'drawn',
    gallery: [
      'g.s11-electrostatics-attract',
      'g.s11-electrostatics-repel',
      'g.s11-electrostatics-unequal',
      'g.s11-electrostatics-field',
    ],
    notes:
      'Drawn (group HK, reps/Charges.tsx; the field lines traced with fieldLines.ts, Coulomb math in hskMath.ts). Calculator picture { kind: "charges", charges: [q₁, q₂?] (μC, signed, numbers or variables), distance: r (m), force?: F (N; a page may count it signed, − for attraction: compared by size), field?: E (N/C, one charge), fixed?: true }. Lit charge balls, red + and blue −, each labelled with its value; field lines traced step by step through the field of the charges (out of +, into −, as many from each charge as its share of the biggest, at least 2), an arrow on each; for two charges the Coulomb forces F = k|q₁q₂|/r² as equal and opposite arrows on one scale (apart for like, together for unlike charges); drag the second charge for r and the arrows follow the inverse square; for one charge, the field E = k|q|/r² at a point r away, pointing away from + and toward −. r is bracketed; the spacing on screen is fixed (the lines’ shape doesn’t depend on r). The harness checks F and E. Example: representation: { kind: "charges", charges: ["a", "b"], distance: "r", force: "F" }; { kind: "charges", charges: ["a"], distance: "r", field: "E" }.',
  },
  ask('H68', 'circuit', 'Mixed series-parallel circuits, meter readings at each resistor, power', [
    's.11.circuits',
  ]),
  ask(
    'H69',
    'induction',
    'Magnet moving through a coil with a meter; force on a current in a field (right-hand rule); a transformer by turns',
    ['s.11.electromagnetism'],
  ),
  ask(
    'H70',
    'spectrum',
    'Emission and absorption lines of H, He, Na; the lines shifted red; photon energy from frequency',
    ['s.11.modern-physics', 's.12.starlight-spectra', 's.12.cosmology'],
  ),

  // ── G. Earth and space ──
  ask(
    'H71',
    'mineralIcons',
    'Card icons of minerals in their materials (quartz, feldspar, mica, calcite, halite, pyrite, hematite) and the Mohs scale',
    ['s.12.minerals-rocks'],
  ),
  ask(
    'H72',
    'earthLayers',
    'Cross-section of Earth with P and S wave paths and the shadow zone; a seismogram; locating an epicenter from three stations',
    ['s.12.earth-interior'],
  ),
  ask(
    'H73',
    'landforms',
    'Explore figures: volcano types, folds and faults, a U- and a V-shaped valley, a meandering river, an aquifer and water table, dunes',
    ['s.12.volcanoes-mountains', 's.12.surface-processes'],
  ),
  ask(
    'H74',
    'rockLayers',
    'Absolute ages on layers, an igneous intrusion cutting across, index fossils',
    ['s.12.radiometric-dating'],
  ),
  ask(
    'H75',
    'oceanProfile',
    'Ocean floor profile (shelf, slope, ridge, trench); surface currents and gyres on a map; the deep conveyor; tides from the moon and sun',
    ['s.12.ocean-atmosphere'],
  ),
  ask(
    'H76',
    'atmosphereLayers',
    'Layers of the atmosphere with the temperature profile; a pressure map with highs, lows and wind arrows turned by Coriolis',
    ['s.12.atmosphere-weather'],
  ),
  ask(
    'H77',
    'greenhouse',
    'Explore figure: sunlight in, infrared out and back; climate zones by latitude',
    ['s.12.climate-systems'],
  ),
  ask(
    'H78',
    'energySources',
    'Card icons for energy sources (solar panel, wind turbine, dam, coal, oil rig, nuclear plant) and a resource bar or pie',
    ['s.12.resource-management'],
  ),
  ask(
    'H79',
    'hrDiagram',
    'H–R diagram (temperature against luminosity, log scales) with the main sequence, giants and white dwarfs; star life-cycle stages',
    ['s.12.stellar-evolution'],
  ),
  ask(
    'H80',
    'expandingUniverse',
    'Explore figure: galaxies spreading apart as space stretches; Hubble plot of speed against distance; galaxy type card figures',
    ['s.12.cosmology', 's.12.solar-system'],
    'Solar system page: nebula to planets as sequence stages.',
  ),
  // ── H. Equation inputs (docs/RENDERINGS_HS_EQUATIONS.md, docs/EQUATION_INPUTS.md) ──
  {
    ...ask(
      'H81',
      'equationInput',
      'Expression slots: a fraction part or an exponent mixing boxes, text and signs',
      [
        'm.10.law-sines-cosines',
        'm.11.normal-distribution',
        'm.12.conics',
        's.10.measurement',
        'm.9.sequences',
        'm.11.exp-log-equations',
      ],
    ),
    status: 'drawn',
    gallery: [
      'g.m10-law-sines-cosines-sines',
      'g.m11-normal-distribution-z',
      'g.m9-sequences-geometric',
      'g.m11-exp-log-equations-continuous',
      'g.s10-measurement-factor',
      'g.s10-mole-factor',
      'g.m12-conics-ellipse',
    ],
    notes:
      'Template syntax: a group in braces (anything but a lone {id}) is an expression slot, as a fraction’s top or bottom or an exponent: `{z} = {{x} − {m}}/{s}`, `{a}/{sin({A}°)} = {b}/{sin({B}°)}`, `{a} km × {1000 m}/{1 km} = {b} m`, `{m} g × {1 mol}/{{M} g} = {n} mol`, `aₙ = {a1} × {r}^{{n} − 1} = {an}`, `{A} = {P}e^{{r}{t}}`, `{({x} − {h})²}/{a}^2 + {({y} − {k})²}/{b}^2 = 1`. A bare word after ^ stays text (`{b}^x`, `e^rt`); a letter or number before ^ is a base (`e^`, `10^`). The exponent binds before the bar. The step harness now reads sin/cos/tan of degrees and e^.',
  },
  {
    ...ask('H82', 'equationInput', 'An exponent on a bracket: (1 + {r})^{t}, ({b}^{m})^{n}', [
      'm.9.exponential-functions',
      'm.11.binomial-theorem',
      'm.11.pythagorean-identities',
    ]),
    status: 'drawn',
    gallery: [
      'g.m9-exponential-functions-compound',
      'g.m11-complex-numbers-square',
      'g.m11-pythagorean-identities',
      'g.s10-nuclear-chemistry-half-life',
      'g.m8-exponent-rules-power-of-power',
    ],
    notes:
      'Also lets m.8.exponent-rules~power-of-power take its equation: `({b}^{m})^{n} = {b}^{k} = {P}`. Template syntax: a bracketed group followed by ^ is the base, its brackets drawn, written against the box before it: `{A} = {P}(1 + {r})^{t}`, `({a} + {b}i)^2 = {p} + {q}i`, `({s})^2 + ({c})^2 = 1`, `y = {a}({b})^x`, `{N} = {N0}(1/2)^{{t}/{T}}` (brackets as tall as a fraction inside). Brackets with no ^ after them stay text.',
  },
  {
    ...ask('H83', 'equationInput', 'Radicals with a bar over the box or group, and cube roots', [
      'm.9.radicals',
      'm.11.radical-functions',
      'm.10.special-right-triangles',
      'm.12.confidence-intervals',
    ]),
    status: 'drawn',
    gallery: [
      'g.m9-radicals-simplify',
      'g.m11-radical-functions-equation',
      'g.m12-confidence-intervals-margin',
      'g.m10-special-right-triangles-45',
      'g.m9-radicals-cube-root',
    ],
    notes:
      'Template syntax: √ (∛ for a cube root, ∜ a fourth) before a box, a number, a group in braces or a bracketed group puts the bar over it, the brackets not drawn: `√{n} = {k}√{r}`, `√({a}x + {b}) = {c}`, `{c} = {s}√2`, `∛{n} = {k}`; a radical can be a fraction’s top or bottom: `{E} = {z} × {s}/√{n}`. Written against a box it touches it ({k}√{r}). The step harness reads “largest square factor of 72”.',
  },
  {
    ...ask(
      'H84',
      'equationInput',
      'A sign or operator choice box (<, ≤, >, ≥; + or −) tied to a coded value',
      ['m.9.linear-inequalities', 'm.9.inequality-systems', 'm.7.two-step-equations~inequality'],
    ),
    status: 'drawn',
    gallery: [
      'g.m7-two-step-equations-inequality',
      'g.m9-linear-inequalities-both-sides',
      'g.m7-rational-operations-add-subtract',
      'g.m6-integers-compare',
    ],
    notes:
      'Template syntax: `{s:sign}` cycles <, ≤, >, ≥ (value 1–4, as the inequality pages store it); `{s:relation}` adds = as 5; `{o:op}` cycles + and − (1, 2). A tap sets the value (calc.set); a worked-out sign is dashed and can’t be tapped; a line may break before it. m.7.two-step-equations~inequality: `{p}x + {q} {s:sign} {r}`; both sides: `{a}x + {b} {s:sign} {c}x + {d}`; `{a} {o:op} {b} = {r}`; a worked-out comparison `{a} {c:relation} {b}`; scientific-notation add and subtract: `({a} × 10^{n}) {o:op} ({c} × 10^{n}) = {p} × 10^{n}`. The Grade 7 page’s work lines print “undefined” for the sign while it is not chosen (its demo waits for the sign).',
  },
  {
    ...ask(
      'H85',
      'equationInput',
      'Subscript boxes (log base, aₙ) and stacked mass and atomic numbers on the left',
      ['m.11.logarithms', 's.10.nuclear-chemistry'],
    ),
    status: 'drawn',
    gallery: [
      'g.m11-logarithms-log-form',
      'g.m9-sequences-arithmetic',
      'g.s10-nuclear-chemistry-alpha',
      'g.s10-nuclear-chemistry-beta',
    ],
    notes:
      'Template syntax: letters (or a box) then _ and a slot is a subscript, small and lowered: `log_{b}({x}) = {y}`, `a_{n} = {a1} + (n − 1){d} = {an}` (a_n with a bare letter stays text). A ^ with nothing before it starts scripts stacked on the left of the symbol after them, mass number over atomic number: `^{A}_{Z}X → ^{A2}_{Z2}Y + ^{4}_{2}He`, beta `^{0}_{−1}e`. A brace holding only digits ({4}) is a fixed number, not a box.',
  },
  {
    ...ask('H86', 'equationInput', 'A matrix grid of boxes, augmented bar and determinant bars', [
      'm.12.matrices',
    ]),
    status: 'drawn',
    gallery: [
      'g.m12-matrices-determinant',
      'g.m12-matrices-times-vector',
      'g.m12-matrices-augmented',
    ],
    notes:
      'Template syntax: `[[…]]` is a matrix in brackets, `||…||` a determinant between bars; rows are split by `;` and cells by `,`, each cell a box, a number or a small expression; a `|` at the same place in every row draws the augmented bar. Columns are as wide as their widest cell; brackets and bars grow with the rows. 2 × 2 to 3 × 4: `||{a}, {b}; {c}, {d}|| = {D}`, `[[{a}, {b}; {c}, {d}]] [[{x}; {y}]] = [[{p}; {q}]]`, `[[{a}, {b}, {c} | {p}; {d}, {e}, {f} | {q}; {g}, {h}, {k} | {r}]]` with `x = {x}, y = {y}, z = {z}` on a second line. More than 6 boxes draws compact cells (32 px, tap target still 44).',
  },
  {
    ...ask('H87', 'equationInput', 'A unit label after a box that follows the unit menu', [
      's.11.circuits',
      'm.3.area~missing-side',
    ]),
    status: 'drawn',
    gallery: ['g.s11-circuits-ohm', 'g.m3-area-missing-side-units'],
    notes:
      'Template syntax: `{a:unit}` draws the box with the unit the calculator shows for that value written after it (calc.units.display, else the variable’s unit), so it changes with the Units menu: `{V:unit} = {I:unit} × {R:unit}` (12 V = 3 A × 4 Ω); m.3.area~missing-side: `{l:unit} × {w:unit} = {A:unit}` (6 cm × 4 cm = 24 cm², 6 in × 4 in = 24 in² after Units → US). A box has no per-value unit menu of its own: a page whose values each pick a unit (mm or m) keeps its rows.',
  },
  {
    ...ask(
      'H88',
      'equationInput',
      'Hide zero parts of mixed numbers, blank chemical coefficient 1, stacked worked-out fractions',
      ['s.10.reaction-types', 'm.5.divide-unit-fractions~fraction-as-division'],
    ),
    status: 'drawn',
    gallery: [
      'g.m5-divide-unit-fractions-fraction-as-division',
      'g.m5-divide-unit-fractions-fraction-as-division-whole',
      'g.s10-reaction-types-coefficient-one',
      'g.m6-divide-fractions-stacked-answer',
    ],
    notes:
      'No new syntax for two of the three: a worked-out whole of 0 hides its box (3/4, not 0 3/4) and a worked-out top of 0 hides the fraction when its bottom is fixed, worked out or typed elsewhere in the equation (2, not 2 0/4): m.5.divide-unit-fractions~fraction-as-division takes `{w} ÷ {n} = {W} {R}/{n}`; and a worked-out fraction in a box (8 7/24) is drawn stacked, like the fixed fractions beside it (on every page: m.4.add-fractions-like~mixed-add now shows 4, not 4 0/6, and m.5.add-fractions-unlike~mixed-numbers a stacked 8 7/24). A coefficient of 1 left blank when worked out is opt-in: `{a:coef} CH₄ + {b:coef} O₂ → {c:coef} CO₂ + {d:coef} H₂O`.',
  },
];

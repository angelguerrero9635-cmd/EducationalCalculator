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
  ask(
    'H16',
    'lineSystem',
    'Shaded half-planes: dashed or solid boundaries and the overlap of two inequalities',
    ['m.9.inequality-systems', 'm.9.linear-inequalities'],
    'Also elimination: the two equations and their sum drawn as three lines through one point.',
  ),
  ask(
    'H17',
    'integerLine',
    'Compound inequalities (and, or) and absolute value as a distance on the number line',
    ['m.9.linear-inequalities', 'm.9.absolute-value'],
  ),
  ask(
    'H18',
    'scatter',
    'Residual segments, a residual plot below, the correlation r and the least-squares line',
    ['m.9.regression'],
  ),
  ask(
    'H19',
    'boxPlot',
    'Outliers past 1.5 × IQR fences, and two box plots on one scale; a dot plot with mean ± 1 SD',
    ['m.9.data-displays'],
    'The mean and standard deviation band belong on dotPlot.',
  ),
  ask(
    'H20',
    'table',
    'Two-way table with totals and a lit cell, row or column, its relative frequency, and a segmented bar',
    ['m.9.two-way-tables', 'm.10.conditional-probability', 'm.12.chi-square'],
    'Chi-square: observed and expected counts side by side.',
  ),
  ask(
    'H21',
    'treeDiagram',
    'Branches with their own probabilities (not all 1/n), P(B | A) on the second stage',
    ['m.10.conditional-probability', 'm.10.probability-rules'],
  ),
  ask(
    'H22',
    'venn',
    'Venn diagram with probabilities: A and B, A or B, mutually exclusive, the complement shaded',
    ['m.10.probability-rules', 'm.10.conditional-probability'],
  ),
  ask(
    'H23',
    'transformation',
    'Compositions of two moves with the middle image, any reflection line, rotation about any point, symmetry',
    ['m.10.rigid-motions', 'm.10.congruence'],
  ),
  ask(
    'H24',
    'scaleCopy',
    'Dilation from any center with rays, scale factors under 1, the side-splitter (parallel line in a triangle)',
    ['m.10.similarity'],
  ),
  ask(
    'H25',
    'coordinatePlane',
    'Segment with midpoint and a point that partitions it in a ratio; distance as a right triangle; side slopes',
    ['m.10.coordinate-geometry'],
  ),
  ask(
    'H26',
    'circle',
    'Sector shaded by a central angle in degrees or radians, arc length, radius-length arcs around the circle',
    ['m.10.arc-sector', 'm.11.unit-circle'],
  ),
  ask(
    'H27',
    'curvedSolid',
    'Pyramids, cones and spheres with surface area nets (the cone as a sector), and Cavalieri stacks',
    ['m.10.volume-derivations'],
    'crossSection: a plane through a cube, cylinder or cone, the section drawn beside it.',
  ),
  ask('H28', 'factorTree', 'Pairs of equal factors circled, coming out of the root: √72 = 6√2', [
    'm.9.radicals',
  ]),
  ask('H29', 'powerScale', 'A log mode: the exponent read off the ruler, log₁₀ 470,000 ≈ 5.67', [
    'm.11.logarithms',
  ]),

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
  ask(
    'H31',
    'macromolecules',
    'Explore figure: monomers joining into polymers (sugars to starch, amino acids to a protein, nucleotides, fats)',
    ['s.9.biomolecules'],
  ),
  ask(
    'H32',
    'membrane',
    'Membrane with particles on each side, counts from the values, arrows high to low; cells in hypotonic, isotonic and hypertonic water',
    ['s.9.membrane-transport'],
  ),
  ask(
    'H33',
    'organelleEnergy',
    'Explore figure: chloroplast and mitochondrion, glucose, oxygen, carbon dioxide, water and ATP cycling between them',
    ['s.9.cellular-energy'],
  ),
  ask(
    'H34',
    'cellDivision',
    'Sequence stage figures: the cell cycle, mitosis phases and meiosis I and II with chromosomes by parent color, crossing over',
    ['s.9.mitosis-meiosis'],
    'Chromosome count driven by 2n; gametes with n.',
  ),
  ask(
    'H35',
    'punnettSquare',
    'Dihybrid 4 × 4 square, incomplete dominance and codominance colors, sex-linked alleles on X',
    ['s.9.inheritance-patterns'],
    'Pedigree: sex-linked carriers (half-shaded).',
  ),
  ask(
    'H36',
    'dnaStrand',
    'DNA ladder from a base sequence, its complement, the mRNA, codons and the amino acids',
    ['s.9.dna-protein-synthesis', 's.9.biotechnology'],
    'A mutation (substitution, insertion, deletion) lit in the sequence and its effect on the protein.',
  ),
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
  {
    ...ask(
      'H43',
      'unitChain',
      'Conversion factors in a chain with units crossed out; a ruler read to the estimated digit; accuracy and precision targets',
      ['s.10.measurement'],
    ),
    status: 'drawn',
    gallery: [
      'g.s10-measurement-chain',
      'g.s10-measurement-rate',
      'g.s10-measurement-chain-long',
      'g.s10-measurement-ruler',
      'g.s10-measurement-ruler-coarse',
      'g.s10-measurement-accurate-precise',
      'g.s10-measurement-precise-not-accurate',
      'g.s10-measurement-neither',
    ],
    notes:
      "Drawn (group HI): kind unitChain (typesHsi.ts, reps/UnitChain.tsx), three modes. mode 'chain' { start, unit, per? (a rate's bottom unit), factors: { top, topUnit, bottom, bottomUnit }[] (1–4, numbers or variables), result }: the given quantity times each factor as a stacked fraction, = the result lit; a unit on a top and an equal one on a bottom are struck through, and the unit left is the answer's (checked: result = start × tops ÷ bottoms). mode 'ruler' { start? (default 0), end, length? (end − start, checked), division (smallest mark: 1, 0.1 …), unit, span? (ruler length) }: a wooden ruler, a metal rod from start to end, and a close-up of the rod's end between two marks with the tenths imagined; the caption gives the certain digits, the estimated digit and the length's significant figures (readings must have one digit past the marks). mode 'target' { trials (2–6), accepted, unit?, mean?, error? (percent error, checked), ring? (percent per ring, default 1) }: each trial a dot, right of the bullseye when high, left when low, spread up and down by its distance from the mean; accurate when the mean is inside the first ring, precise when the spread is within one ring. Give the page `unitSystems: ['metric']` (the units are drawn as written). Examples: { kind: 'unitChain', mode: 'chain', start: 'd', unit: 'km', factors: [{ top: 1000, topUnit: 'm', bottom: 1, bottomUnit: 'km' }, { top: 100, topUnit: 'cm', bottom: 1, bottomUnit: 'm' }], result: 'c' }; { kind: 'unitChain', mode: 'ruler', start: 's', end: 'e', length: 'L', division: 0.1, unit: 'cm', span: 10 }; { kind: 'unitChain', mode: 'target', trials: ['a', 'b', 'c'], accepted: 't', unit: 'm/s²', mean: 'm', error: 'e' }.",
  },
  {
    ...ask(
      'H44',
      'atomModel',
      'Bohr model from protons, neutrons and electrons: isotopes and ions change the picture',
      ['s.10.atomic-structure', 's.10.electrons-in-atoms', 's.10.nuclear-chemistry'],
    ),
    status: 'drawn',
    gallery: [
      'g.s10-atomic-structure-carbon',
      'g.s10-atomic-structure-isotope',
      'g.s10-atomic-structure-cation',
      'g.s10-atomic-structure-anion',
      'g.s10-electrons-in-atoms-valence',
      'g.s10-nuclear-chemistry-iodine',
    ],
    notes:
      "Drawn (group HI): kind atomModel (typesHsi.ts, reps/AtomModel.tsx; electron shells from reps/electrons.ts). Fields: protons (Z, 1–54), neutrons? (0–90), electrons? (default = protons, 0–54), mass? (A = Z + N, checked), charge? (Z − e, checked), valence? (the outer shell's electrons, checked; the outer shell and its electrons lit). Every proton (red) and neutron (grey) is drawn in the nucleus, mixed evenly; the electrons sit on shells filled from the ground-state configuration (iron 2, 8, 14, 2; iodine 2, 8, 18, 18, 7), a positive ion losing from the outer shell first. The nuclide symbol (³⁵₁₇Cl with its charge) is at the top left and a key counts each particle. An isotope changes only the neutrons; an ion only the electrons. No handles: give the page `sliders: true`. The step phrase \"valence electrons of Z = {p}\" is taught to the harness (phrasesHsi.ts). Examples: { kind: 'atomModel', protons: 'p', neutrons: 'n', electrons: 'e', mass: 'A', charge: 'q' } with A = Z + N and q = Z − e; valence: { kind: 'atomModel', protons: 'p', neutrons: 'n', mass: 'A', valence: 'v' }.",
  },
  {
    ...ask(
      'H45',
      'orbitalDiagram',
      'Orbital boxes filled in Aufbau order with up and down arrows, the energy ladder, and emission lines from jumps',
      ['s.10.electrons-in-atoms', 's.11.modern-physics'],
    ),
    status: 'drawn',
    gallery: [
      'g.s10-electrons-in-atoms-oxygen',
      'g.s10-electrons-in-atoms-iron',
      'g.s10-electrons-in-atoms-chromium',
      'g.s10-electrons-in-atoms-xenon',
      'g.s10-electrons-in-atoms-ion',
      'g.s10-electrons-in-atoms-balmer',
      'g.s11-modern-physics-lyman',
      'g.s11-modern-physics-paschen',
    ],
    notes:
      "Drawn (group HI): kind orbitalDiagram (typesHsi.ts, reps/OrbitalDiagram.tsx; configurations from reps/electrons.ts). mode 'boxes' { element? (atomic number, names the atom), electrons? (default = element; fewer for a positive ion, which loses its highest shell first: Fe³⁺ is [Ar] 3d⁵), unpaired? (checked) }: every subshell up to the highest filled one as boxes at its energy (4s below 3d, columns by shell), up arrows in each box before any pair (Hund), pairs up and down (Pauli), single arrows lit; the configuration above (1s² 2s² 2p⁴), noble-gas shorthand in the caption, and the neutral exceptions through xenon (Cr, Cu, Nb, Mo, Ru, Rh, Pd, Ag) drawn as they are and named. Through 54 electrons. mode 'ladder' { upper, lower, energy? (eV, checked), wavelength? (nm, 1240 ÷ E, checked), levels? (default 6, up to 8) }: hydrogen's levels to scale (Eₙ = −13.6/n² eV), the drop as an arrow, the photon as a wave in its color, and the line on a 380–750 nm spectrum (an arrow to ultraviolet or infrared off it); the series named. Step phrases \"unpaired electrons of Z = {p}\" and \"… with {e} electrons\" are taught to the harness. No handles: give the page `sliders: true`. Examples: { kind: 'orbitalDiagram', mode: 'boxes', element: 'p', unpaired: 'u' }; an ion: { kind: 'orbitalDiagram', mode: 'boxes', element: 'p', electrons: 'e', unpaired: 'u' }; { kind: 'orbitalDiagram', mode: 'ladder', upper: 'u', lower: 'l', energy: 'E', wavelength: 'w' } with E = 13.6 × (1/l² − 1/u²) and λ = 1240/E.",
  },
  {
    ...ask(
      'H46',
      'periodicTable',
      'A trend as shading across the table (radius, ionization energy, electronegativity) with arrows',
      ['s.10.periodic-trends'],
    ),
    status: 'drawn',
    gallery: [
      'g.s10-periodic-trends-radius',
      'g.s10-periodic-trends-ionization',
      'g.s10-periodic-trends-electronegativity',
      'g.s10-periodic-trends-extremes',
    ],
    notes:
      "Drawn (group HI): an optional `trend` on the existing periodicTable (typesChem.ts; drawn by reps/PeriodicTrend.tsx, data in reps/chemTrends.ts). Pages without `trend` draw exactly as before. trend { property: 'radius' | 'ionization' | 'electronegativity', value? (the element's value, checked), compare? (a second atomic number, ringed in yellow), compareValue? (checked) }: every element shaded by its value (the stronger the shade, the larger; dashed where there is no value), a key from the smallest to the largest, an arrow across the top (\"decreases across a period\" for radius, \"increases\" for the other two) and one down the side (\"increases/decreases down a group\"); the page's `element` is outlined with its name and value on a card in the gap, and every cell can be tapped to choose it. Data: covalent radii (pm, Pyykkö), first ionization energies (kJ/mol), Pauling electronegativities (none for He, Ne, Ar). Step phrases \"atomic radius of Z = {p}\", \"ionization energy of Z = {p}\" and \"electronegativity of Z = {p}\" are taught to the harness; give the atomic-number variables `allowed` values that have data (the demos do). Example: { kind: 'periodicTable', element: 'p', trend: { property: 'radius', value: 'r', compare: 'c', compareValue: 's' } } with r = atomic radius of Z = p.",
  },
  {
    ...ask(
      'H47',
      'lewisStructure',
      'Electron-dot structures, electron transfer in ionic bonds, the sea of electrons; hydrocarbons from n carbons',
      ['s.10.bonding', 's.10.organic'],
    ),
    status: 'drawn',
    gallery: [
      'g.s10-bonding-water',
      'g.s10-bonding-ammonia',
      'g.s10-bonding-double',
      'g.s10-bonding-triple-dots',
      'g.s10-bonding-polyatomic-ion',
      'g.s10-bonding-ionic-sodium-chloride',
      'g.s10-bonding-ionic-magnesium-chloride',
      'g.s10-bonding-ionic-aluminum-oxide',
      'g.s10-bonding-metallic',
      'g.s10-bonding-metallic-aluminum',
      'g.s10-organic-alkane',
      'g.s10-organic-alkene',
      'g.s10-organic-alkyne',
      'g.s10-organic-octane',
    ],
    notes:
      "Drawn (group HI): kind lewisStructure (typesHsi.ts, reps/LewisStructure.tsx, data in reps/lewis.ts), four modes. 'molecule' { atoms? ({ H: 'h', O: 'o' }: the structure is looked up from the counts), charge?, formula? (fixed instead, \"H2O\", \"NH4+\"), valence?, bonding? (shared pairs), lone? (lone pairs), dots? (shared pairs as dots) }: symbols with shared pairs as lit lines and lone pairs as dots, an ion in brackets with its charge; drawn: H₂, H₂O, CO₂, NH₃, CH₄, O₂, N₂, F₂, Cl₂, HF, HCl, CH₂O, HCN, NH₄⁺, H₃O⁺, OH⁻, CN⁻ (other counts name these in the caption); every atom's octet (hydrogen's 2) and the valence total are checked. 'ionic' { metal (groups 1, 2, Al), nonmetal (F, Cl, Br, I, O, S, N, P), metals?, nonmetals? (ion counts), transferred? }: the atoms with their valence dots, arrows carrying each metal electron to a nonmetal, then the ions in brackets with charges, the gained electrons lit, and the formula; counts whose charges don't balance (or past 6 ions) draw the formula unit faded with the reason. 'metallic' { element, atoms (1–24), electrons? }: metal ions (Na⁺, Al³⁺ …) with every freed electron scattered among them. 'hydrocarbon' { carbons (1–8), bond? ('single' | 'double' | 'triple', between the first two carbons), hydrogens? }: the structural formula with every H, named (propane, 1-butene, ethyne). No handles: give the page `sliders: true`. Examples: { kind: 'lewisStructure', mode: 'molecule', atoms: { H: 'h', O: 'o' }, valence: 'V' } with V = h + 6 × o; { kind: 'lewisStructure', mode: 'ionic', metal: 'Mg', nonmetal: 'Cl', metals: 'a', nonmetals: 'b', transferred: 't' }; { kind: 'lewisStructure', mode: 'metallic', element: 'Na', atoms: 'n', electrons: 'e' }; { kind: 'lewisStructure', mode: 'hydrocarbon', carbons: 'n', bond: 'double', hydrogens: 'h' }.",
  },
  {
    ...ask(
      'H48',
      'vsepr',
      'Ball-and-stick shapes with bond angles and dipole arrows; hydrogen bonds between water molecules',
      ['s.10.molecular-shape'],
    ),
    status: 'drawn',
    gallery: [
      'g.s10-molecular-shape-water',
      'g.s10-molecular-shape-ammonia',
      'g.s10-molecular-shape-methane',
      'g.s10-molecular-shape-trigonal-planar',
      'g.s10-molecular-shape-linear',
      'g.s10-molecular-shape-bent-three-domains',
      'g.s10-molecular-shape-hydrogen-bonds',
      'g.s10-molecular-shape-hydrogen-bonds-four',
    ],
    notes:
      "Drawn (group HI): kind vsepr (typesHsi.ts, reps/Vsepr.tsx, geometry in reps/vseprGeo.ts). mode 'shape' (default) { bonded (2–4), lone (0–2; 2 to 4 domains in all), angle? (checked), polar? }: a ball-and-stick example molecule for the shape (linear CO₂ 180°, trigonal planar BF₃ 120°, bent SO₂ 119°, tetrahedral CH₄ 109.5°, trigonal pyramidal NH₃ 107°, bent H₂O 104.5°), lone pairs as lobes with their two dots, the angle as a true 3-D arc between two bonds, four-domain shapes turned a little so no atom hides another; with polar, crossed bond-dipole arrows toward the more electronegative atom and the net dipole beside the molecule (none when the dipoles cancel; the caption says polar or nonpolar). mode 'hbonds' { molecules (2–5), bonds? (checked, molecules − 1) }: water molecules around a middle one, dotted hydrogen bonds from an H to an O's lone pair (two accepted, two donated), δ− and δ+ on the middle molecule. The step phrase \"bond angle with {b} bonded atoms and {l} lone pairs\" is taught to the harness. No handles: give the page `sliders: true`. Examples: { kind: 'vsepr', bonded: 'b', lone: 'l', angle: 'a', polar: true } with d = b + l; { kind: 'vsepr', mode: 'hbonds', molecules: 'n', bonds: 'k' }.",
  },
  {
    ...ask(
      'H49',
      'reaction',
      'Coefficients set the molecule counts and an atom tally; leftover reactant lit (limiting reactant); reaction-type card figures',
      ['s.10.reaction-types', 's.10.stoichiometry'],
    ),
    status: 'drawn',
    gallery: [
      'g.s10-stoichiometry-limiting-water',
      'g.s10-stoichiometry-limiting-ammonia',
      'g.s10-stoichiometry-limiting-methane',
      'g.s10-reaction-types-sort',
    ],
    notes:
      "Drawn (group HI): an optional `limiting` on the existing reaction (typesChem.ts; drawn by reps/ReactionLimiting.tsx, math in reps/limiting.ts). Pages without it draw exactly as before (molecules from the coefficients, the atom tally on each side). limiting { amounts (particles of each reactant at the start, in the reactants' order, 0–12), runs? (whole runs, checked), made? (per product, checked), left? (per reactant, checked) }: the balanced equation, then Before: every particle on hand, the reactant that runs out first tagged \"limiting\"; After n runs: every product particle made and the leftover reactant particles ringed in yellow. An unbalanced equation draws faded with the reason. The step phrase \"smaller of {a} ÷ p and {b} ÷ q, rounded down\" is taught to the harness. Reaction-type card icons (layouts/icons/hi.ts): 'synthesis reaction', 'decomposition reaction', 'single replacement reaction', 'double replacement reaction', 'combustion reaction' (colored atom balls, reactants above an arrow, products below; combustion over a flame), sorted in the demo g.s10-reaction-types-sort as { label, bin, figure: { kind: 'icon', icon: 'synthesis reaction' } }. Example: { kind: 'reaction', reactants: [{ formula: 'H2', count: 2 }, { formula: 'O2', count: 1 }], products: [{ formula: 'H2O', count: 2 }], limiting: { amounts: ['a', 'b'], runs: 'r', made: ['m1'], left: ['x', 'y'] } } with m1 = 2 × r, x = a − 2 × r, y = b − r.",
  },
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
  ask(
    'H58',
    'motionGraph',
    'Area under velocity–time shaded as displacement, the tangent slope, a strobe motion diagram',
    ['s.11.kinematics-1d'],
  ),
  ask(
    'H59',
    'projectile',
    'Trajectory from launch speed, angle and height, velocity components along it, maximum height and range',
    ['s.11.kinematics-2d', 'm.12.parametric'],
  ),
  ask(
    'H60',
    'freeBody',
    'Free-body diagram with scaled force arrows (weight, normal, friction, tension, applied); an incline with components',
    ['s.11.dynamics-vectors', 's.11.circular-gravitation'],
  ),
  ask(
    'H61',
    'circularMotion',
    'Object on a circle with velocity tangent and acceleration toward the center; two masses and the pull between them',
    ['s.11.circular-gravitation'],
    'Orbit: Kepler ellipse with foci and equal-area sectors for the solar system page.',
  ),
  ask(
    'H62',
    'collision',
    'Carts on a track before and after, momentum arrows, sticking together or bouncing',
    ['s.11.momentum'],
  ),
  ask(
    'H63',
    'simpleMachine',
    'Lever, pulley system and inclined plane with effort, load and mechanical advantage from the values',
    ['s.11.work-energy-power'],
    'energyTrack: a friction-heat bar and a spring.',
  ),
  ask(
    'H64',
    'heatEngine',
    'Hot reservoir, engine, work out and heat to the cold reservoir, with the efficiency',
    ['s.11.thermodynamics'],
  ),
  ask(
    'H65',
    'wave',
    'Standing waves on a string and in pipes (harmonic n, nodes and antinodes); Doppler wavefronts from a moving source',
    ['s.11.sound-waves'],
  ),
  ask(
    'H66',
    'rayDiagram',
    'Lenses and mirrors with principal rays, object and image from 1/f = 1/d₀ + 1/dᵢ; refraction with the normal and angles',
    ['s.11.optics', 's.12.starlight-spectra'],
    'Total internal reflection past the critical angle; double-slit fringes; telescopes for the Earth and space page.',
  ),
  ask(
    'H67',
    'charges',
    'Point charges with field lines and the Coulomb force arrows scaled by q₁, q₂ and r',
    ['s.11.electrostatics'],
  ),
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

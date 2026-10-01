/**
 * Pictures requested for Grades 9–12 (ids H..), from the high-school textbook research
 * (research/textbooks/grades/9.md–12.md) and the skills in taxonomy.ts. Spread into
 * PICTURE_REQUESTS; the picture chat's brief is docs/RENDERINGS_HS.md, which gives each one's
 * full spec. `pages` are the planned skills (their main pages until the lesson chat names the
 * problem types).
 */
import type { PictureRequest } from './pictureRequests';

/**
 * `pages` is the page list, or, for a request whose parts go on different pages (and kinds), each
 * page with the text that shows its part is there (`uses`).
 */
const ask = (
  id: string,
  kind: string,
  what: string,
  pages: string[] | Record<string, string>,
  notes?: string,
): PictureRequest => ({
  id,
  what,
  kind,
  ...(Array.isArray(pages) ? { pages } : { pages: Object.keys(pages), uses: pages }),
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
  {
    ...ask(
      'H37',
      'gel',
      'Gel electrophoresis: bands placed by fragment size, a ladder lane; PCR copies doubling each cycle',
      ['s.9.biotechnology'],
    ),
    status: 'drawn',
    gallery: [
      'g.s9-biotechnology-gel',
      'g.s9-biotechnology-gel-map',
      'g.s9-biotechnology-gel-small',
      'g.s9-biotechnology-pcr',
      'g.s9-biotechnology-pcr-cycles',
    ],
    notes:
      'Drawn (group HH). Gel: { kind: "gel", lanes: [{ label, bands: [size ids or numbers in bp] }] (1–6 lanes, 1–6 bands), ladder?: sizes in bp from largest (default 10,000 … 100 bp) or false, ladderLabel?, keep?: ids pinned during a drag, fixed?: no handles }. The slab is painted (clear agarose on a tray, wells at the black − end, red + end); every band sits at a distance on a log scale of its size (checked in the harness: each × 10 the same step, smaller always farther); a typed band drags up or down. Example: { kind: "gel", lanes: [{ label: "Uncut", bands: ["L"] }, { label: "Cut", bands: ["a", "b"] }], keep: ["L"] } with L = a + b. PCR: { kind: "gel", pcr: { cycles: "n", start?: "n0", copies?: "N" } }: the three steps (95, 55, 72 °C), then each cycle’s double strands drawn while they fit (32), original strands dark and new ones in the highlight, and N = N₀ × 2ⁿ (checked).',
  },
  {
    ...ask(
      'H38',
      'alleleFrequencies',
      'Hardy–Weinberg: p and q as beads in a population, genotype bars p², 2pq, q²',
      ['s.9.evolution-evidence'],
    ),
    status: 'drawn',
    gallery: [
      'g.s9-evolution-evidence-hardy-weinberg',
      'g.s9-evolution-evidence-rare-allele',
      'g.s9-evolution-evidence-allele-counts',
      'g.s9-evolution-evidence-limbs',
    ],
    notes:
      'Card figures: homologous limbs (arm, wing, flipper, leg) with matching bones colored. Drawn (group HH). { kind: "alleleFrequencies", p: id or number, q?: id (checked p + q = 1), genotypes?: [p² id, 2pq id, q² id] (each may be null; checked against the bars), alleles?: ["A", "a"], keep?: ids pinned while p is dragged, fixed?: no handle }. A tray of 100 glass beads (50 people × 2 alleles), round(100p) of them the dominant allele (the caption says "About" when 100p is not whole); a p scale with a handle; the bars p², 2pq, q² on 0–1 (Aa half each color). Example: { kind: "alleleFrequencies", p: "p", q: "q", genotypes: ["P2", "H", "q2"] }. Card icons for sort cards: { kind: "icon", icon: "human arm bones" } (also "bat wing bones", "whale flipper bones", "cat leg bones", and "insect wing" for an analogous structure): upper arm, forearm bones, wrist and hand bones each in its own color (limbUpper, limbForearm, limbWrist, limbHand), inside the skin, membrane, flipper or fur.',
  },
  {
    ...ask(
      'H39',
      'cladogram',
      'Cladogram with shared traits on the branches; domain and kingdom card icons',
      ['s.9.classification', 's.9.evolution-evidence'],
    ),
    status: 'drawn',
    gallery: [
      'g.s9-classification-cladogram',
      'g.s9-evolution-evidence-cladogram',
      'g.s9-classification-domains',
    ],
    notes:
      'Drawn (group HH) as an explore figure, since a cladogram has no honest quantity. Figure { kind: "cladogram", tree, traits }: tree is nested lists of taxon names (any shape, 3 to 10 taxa, e.g. ["Lancelet", ["Lamprey", ["Shark", ["Frog", ["Lizard", "Mouse"]]]]]); traits: [{ name, taxa }] where the taxa must be one clade (checked in the harness), each drawn as a numbered bar on the branch into that clade and keyed under the tree. Each scene sets clade: { lit?: a trait name (its bar and every branch of the clade that inherits it lit), ring?: taxa ringed (to ask whether a group is a clade) }. Example scene: { label: "Jaws", lines: [...], clade: { lit: "Jaws" } }. Card icons for sort cards: { kind: "icon", icon: "domain Bacteria" } (also "domain Archaea", "domain Eukarya", "kingdom Protista", "kingdom Fungi", "kingdom Plantae", "kingdom Animalia").',
  },
  {
    ...ask(
      'H40',
      'energyPyramid',
      'Pyramids of energy, biomass and numbers; succession stages; the nitrogen cycle as an explore figure',
      ['s.9.ecosystem-dynamics'],
    ),
    status: 'drawn',
    gallery: [
      'g.s9-ecosystem-dynamics-biomass',
      'g.s9-ecosystem-dynamics-numbers',
      'g.s9-ecosystem-dynamics-ocean',
      'g.s9-ecosystem-dynamics-succession',
      'g.s9-ecosystem-dynamics-nitrogen',
    ],
    notes:
      'Drawn (group HH). energyPyramid takes an optional measure: "energy" (default, unchanged) | "biomass" | "numbers". Biomass and numbers draw no share passed up unless percent is set (the harness then skips the 10% check), so a pyramid of numbers or an ocean biomass pyramid can stand upside down, to scale. Example: { kind: "energyPyramid", measure: "numbers", levels: ["N1", "N2", "N3"], names: ["oak tree", "caterpillars", "songbirds"] }; { kind: "energyPyramid", measure: "biomass", levels: ["B1", "B2", "B3"], percent: "p", names: [...] }. Succession: sequence stages with card icons { kind: "icon", icon: "bare rock" } ("lichens on rock", "mosses and thin soil", "grasses and flowers", "shrubs", "young trees", "mature forest"). Nitrogen cycle: explore figure { kind: "nitrogenCycle" }, each scene nitrogen: { process?: "fixation" | "lightning" | "nitrification" | "assimilation" | "eating" | "ammonification" | "denitrification" } (none: the whole cycle, unnamed arrows); example scene { label: "Fixation", lines: [...], nitrogen: { process: "fixation" } }.',
  },
  {
    ...ask(
      'H41',
      'feedbackLoop',
      'Explore figure: stimulus, sensor, control center, effector, response; body temperature and blood sugar',
      ['s.9.homeostasis', 's.12.climate-systems'],
    ),
    status: 'drawn',
    gallery: ['g.s9-homeostasis-feedback', 'g.s12-climate-systems-feedback'],
    notes:
      'The climate page uses the same loop for the ice-albedo and water-vapor feedbacks. Drawn (group HH). Explore figure { kind: "feedbackLoop" }; every word is the scene’s: loop: { steps: [{ role?: "Stimulus", text }] (3 to 6 boxes, each text at most 90 characters), sign: "negative" | "positive" (the arrow back from the response marked − or +), lit?: step index, back?: label on the arrow back ("negative feedback") }. Climate loops leave out the roles. Example scene: { label: "Too hot", lines: [...], loop: { sign: "negative", back: "negative feedback", lit: 2, steps: [{ role: "Stimulus", text: "Body temperature rises above its set point." }, …] } }.',
  },
  {
    ...ask(
      'H42',
      'immuneResponse',
      'Pathogen card icons (virus, bacterium, fungus, parasite); the immune response in stages; antibody levels after a first and second exposure',
      ['s.9.immune-disease'],
    ),
    status: 'drawn',
    gallery: [
      'g.s9-immune-disease-antibodies',
      'g.s9-immune-disease-booster',
      'g.s9-immune-disease-stages',
      'g.s9-immune-disease-pathogens',
    ],
    notes:
      'Drawn (group HH) in three parts. Antibody plot (calculator): { kind: "immuneResponse", first: peak id, second: peak id, firstDays?: id or number (default 12), secondDays?: (default 6), secondAt?: day of the 2nd exposure (default 40), axis?: "Antibody level" }; each response rises to its peak on its day and falls (the second more slowly), the curve drawn is the higher of the two, peaks dotted with their levels; the harness checks the curve passes through both peaks and never above the higher. Example: { kind: "immuneResponse", first: "P1", second: "P2", firstDays: "d1", secondDays: "d2", secondAt: 40 }. Stages (explore figure, named immuneStages so it doesn’t clash with the picture kind): { kind: "immuneStages" }, each scene immune: { stage?: "antigen" | "helperT" | "bCells" | "antibodies" | "killerT" | "memory" } (none: the whole response). Pathogen card icons: { kind: "icon", icon: "virus" } (also "bacterium", "fungus", "parasite").',
  },

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
  {
    ...ask(
      'H50',
      'moleMap',
      'Grams ↔ moles ↔ particles ↔ liters of gas, each arrow with its factor, the current value lit',
      ['s.10.mole', 's.10.stoichiometry'],
    ),
    status: 'drawn',
    gallery: [
      'g.s10-mole-map-grams',
      'g.s10-mole-map-gas',
      'g.s10-mole-map-all',
      'g.s10-mole-map-large',
      'g.s10-stoichiometry-grams-to-grams',
    ],
    notes:
      "Drawn (group HI): kind moleMap (typesHsi.ts, reps/MoleMap.tsx, constants and molar masses in reps/moles.ts). Fields: moles, mass?, molarMass? (or formula, whose molar mass is worked out to 2 decimals: H₂O 18.02), particles? (× 6.022 × 10²³), volume? (gas at STP, × 22.4 L), formula?, second? { formula?, ratio: [coefficient of the first, of the second], moles, mass?, molarMass? } for stoichiometry. Moles sit in the middle with mass above, particles below and the gas volume (or the second substance, joined by the mole-ratio arrow) beside it; each arrow carries its factor both ways (÷ 18.02 g/mol, × 18.02 g/mol); the value the student typed is filled, values worked from it are outlined, unknowns dashed, and arrows between known values lit. Every value is checked against moles. Give the page `unitSystems: ['metric']` (grams and liters are drawn as written) and particles `scientific: true` with a minimum near 6 × 10¹⁹. Examples: { kind: 'moleMap', formula: 'O2', moles: 'n', mass: 'm', particles: 'N', volume: 'V' } with m = 32 × n, N = 6.022 × 10²³ × n, V = 22.4 × n; { kind: 'moleMap', formula: 'H2', moles: 'n', mass: 'm', second: { formula: 'H2O', ratio: [2, 2], moles: 'p', mass: 'q' } }.",
  },
  {
    ...ask(
      'H51',
      'gasPiston',
      'Cylinder with a piston, particles moving by temperature, a pressure gauge and a volume scale',
      ['s.10.gas-laws'],
    ),
    status: 'drawn',
    gallery: [
      'g.s10-gas-laws-boyle',
      'g.s10-gas-laws-charles',
      'g.s10-gas-laws-gay-lussac',
      'g.s10-gas-laws-combined',
      'g.s10-gas-laws-ideal',
      'g.s10-gas-laws-ideal-hot',
    ],
    notes:
      "Drawn: kind gasPiston (typesHsj.ts). A glass cylinder and a metal piston whose height is the volume on the scale up the glass, a gauge on a pipe for the pressure, a thermometer in kelvins, and the gas as particles with speed trails ∝ √T (the caption compares the speeds). Fields: law ('boyle' | 'charles' | 'gayLussac' | 'combined' | 'ideal'); the gas now as pressure, volume, temperature (numbers or variables); before { pressure?, volume?, temperature? } for a two-state law, drawn beside it (a held value is left out of both and named “T₁ held”; 'gayLussac' pins the piston); moles (ideal: one particle per 0.1, 0.2, 0.5 … mol, key in the caption; two-state pages draw the same 20); R (default 0.0821, checked); keep; fixed. Drag the piston of the gas now: its volume changes and the law's other value moves. Examples: { kind: 'gasPiston', law: 'boyle', before: { pressure: 'P1', volume: 'V1' }, pressure: 'P2', volume: 'V2', keep: ['P1', 'V1'] }; { kind: 'gasPiston', law: 'ideal', pressure: 'P', volume: 'V', temperature: 'T', moles: 'n', keep: ['n', 'T'] }.",
  },
  {
    ...ask(
      'H52',
      'beaker',
      'Solute particles per volume, dilution as two beakers (M₁V₁ = M₂V₂); a solubility curve',
      ['s.10.molarity'],
    ),
    status: 'drawn',
    gallery: [
      'g.s10-molarity-moles-volume',
      'g.s10-molarity-from-grams',
      'g.s10-molarity-concentrated',
      'g.s10-molarity-dilution',
      'g.s10-molarity-solubility',
      'g.s10-molarity-solubility-excess',
    ],
    notes:
      "Drawn: beaker takes solution (typesHsj.ts BeakerSolution); pages without it draw exactly as before. mode 'molarity' { moles, volume (L or mL), molarity? (checked as n ÷ V), solute? }: a glass beaker filled to the volume on its printed scale, the solute as dots spread through the liquid (one dot per 0.01, 0.02, 0.05 … mol, the key in the caption). mode 'dilution' { stock: { molarity, volume }, diluted: { molarity, volume }, water? (checked as V₂ − V₁), solute? }: the stock beside the diluted solution, the beakers sized to their capacities, the same dots in both and the tint paler as it is weaker. mode 'solubility' { salt ('KNO3' | 'NaNO3' | 'NaCl' | 'KCl' | 'NH4Cl' | 'KClO3'), temperature (°C), amount? (g per 100 g of water), solubility? (checked against the curve), others? }: the curve from the standard tables (read in straight lines between every 10 °C), others faint, the point and its verdict (unsaturated, saturated, or how much settles out). Step text can say “solubility of KNO₃ at {T} °C” (harness phrase in phrasesHsj.ts). Examples: { kind: 'beaker', solution: { mode: 'molarity', moles: 'n', volume: 'V', molarity: 'M', solute: 'NaCl' } }; { kind: 'beaker', solution: { mode: 'dilution', stock: { molarity: 'M1', volume: 'V1' }, diluted: { molarity: 'M2', volume: 'V2' }, water: 'w', solute: 'CuSO₄' } }; { kind: 'beaker', solution: { mode: 'solubility', salt: 'KNO3', temperature: 'T', amount: 'm', solubility: 's', others: ['NaCl', 'KCl'] } }.",
  },
  {
    ...ask(
      'H53',
      'energyProfile',
      'Reaction energy diagram: reactant and product levels, ΔH, activation energy, the catalyst path dashed',
      ['s.10.thermochemistry', 's.10.rates-equilibrium'],
      'Also a coffee-cup calorimeter (q = mcΔT) for thermochemistry and thermodynamics.',
    ),
    status: 'drawn',
    gallery: [
      'g.s10-thermochemistry-exothermic',
      'g.s10-thermochemistry-endothermic',
      'g.s10-rates-equilibrium-catalyst',
      'g.s10-rates-equilibrium-reverse',
      'g.s10-thermochemistry-calorimeter',
      'g.s10-thermochemistry-cold-pack',
      'g.s11-thermodynamics-specific-heat',
    ],
    notes:
      "Drawn: kind energyProfile (typesHsj.ts). The profile (no mode) { reactants, products, activation (numbers or variables, kJ from the variable's unit), deltaH? (checked as products − reactants), reverse? (the reverse barrier, checked as Eₐ − ΔH), catalyst? (Eₐ with a catalyst: a lower dashed hump between the same levels), names? { reactants, products } ('2H₂O₂'), keep?, fixed? }: flat levels, a smooth hump to the peak at r + Eₐ, arrows for Eₐ, ΔH (red when negative) and the reverse barrier; a peak under the products draws faded with the reason; drag the peak to change Eₐ. mode 'calorimeter' { mass, heat (J/(g·°C)), start, end, change? (ΔT, checked), q? (checked as mcΔT), metal? { name, mass, start, heat? (checked against the heat the water took in) } }: two nested foam cups with a lid and stirrer, the water, a thermometer read from T₁ (dashed) to T₂ with the ΔT arrow, and a metal block when a hot metal is dropped in (physics' specific heat). Examples: { kind: 'energyProfile', reactants: 'Hr', products: 'Hp', activation: 'Ea', deltaH: 'dH', catalyst: 'Ec', names: { reactants: '2H₂O₂', products: '2H₂O + O₂' }, keep: ['Hr', 'Hp'] }; { kind: 'energyProfile', mode: 'calorimeter', mass: 'm', heat: 'c', start: 'T1', end: 'T2', change: 'dT', q: 'q' }. Also for s.11.thermodynamics (g.s11-thermodynamics-specific-heat).",
  },
  {
    ...ask(
      'H54',
      'equilibriumChart',
      'Concentrations against time leveling off, and the shift after a change (Le Châtelier)',
      ['s.10.rates-equilibrium'],
    ),
    status: 'drawn',
    gallery: [
      'g.s10-rates-equilibrium-ice',
      'g.s10-rates-equilibrium-nearly-complete',
      'g.s10-rates-equilibrium-add',
      'g.s10-rates-equilibrium-volume',
      'g.s10-rates-equilibrium-heat',
    ],
    notes:
      "Drawn: kind equilibriumChart (typesHsj.ts). Concentration (mol/L) against time: each substance's line moves by the reaction's extent (reactants down, products up, by their coefficients, so the stoichiometry holds at every moment) to the level where Q = K, solved by bisection, and levels off; named at its right end with its level. Fields: species [{ formula ('N₂O₄'), coef, side ('reactant' | 'product'), start (number or variable), eq? (the first equilibrium's level, checked) }]; K? (left out when the page starts at equilibrium: read from the start values); stress? { add?: { species (index), amount (negative removes) }, scale? (every concentration times it: 2 when the volume is halved), K? (the new K after a temperature change), Q? (the quotient just after, checked), label ('Add H₂') }: a dashed line halfway, the jump and the move to the new equilibrium; the caption compares Q with K and says which way it shifts. Examples: { kind: 'equilibriumChart', species: [{ formula: 'N₂O₄', coef: 1, side: 'reactant', start: 'A0', eq: 'A' }, { formula: 'NO₂', coef: 2, side: 'product', start: 0, eq: 'B' }], K: 'K' }; { kind: 'equilibriumChart', species: [{ formula: 'H₂', coef: 1, side: 'reactant', start: 'h' }, { formula: 'I₂', coef: 1, side: 'reactant', start: 'i' }, { formula: 'HI', coef: 2, side: 'product', start: 'p' }], K: 'K', stress: { add: { species: 0, amount: 'a' }, Q: 'Q', label: 'Add H₂' } }. The line's shape between the levels is a plain approach (no rate law); the levels are exact.",
  },
  {
    ...ask(
      'H55',
      'phScale',
      'pH scale 0–14 in indicator colors with the value marked and [H⁺] as a power of ten; a titration curve',
      ['s.10.acids-bases'],
    ),
    status: 'drawn',
    gallery: [
      'g.s10-acids-bases-ph',
      'g.s10-acids-bases-hydrogen',
      'g.s10-acids-bases-base',
      'g.s10-acids-bases-titration',
      'g.s10-acids-bases-weak-titration',
    ],
    notes:
      "Drawn: kind phScale (typesHsj.ts). The scale (no mode) { pH, hydrogen? ([H⁺], checked as 10^−pH), hydroxide? ([OH⁻], checked), pOH? (checked as 14 − pH), examples? (lemon juice, coffee, pure water, baking soda, ammonia marked above), keep?, fixed? }: fifteen cells 0–14 in universal-indicator colors (red through green at 7 to violet), the pH marked through the bar with a pointer (drag it), [H⁺] as 10⁰ … 10⁻¹⁴ under every other number, acidic, neutral and basic named. mode 'titration' { acid: { concentration, volume, Ka? (left out: strong), name? }, base: { concentration, name? }, added, equivalence? (checked as the acid's concentration × volume ÷ the base's concentration; the demo's symbols are C₁, V₁ for the acid and C₂, V₂, Vₑ for the base, since there is no subscript b), keep?, fixed? }: the pH against the base added from the exact charge balance of a monoprotic acid and a strong base (no buffer shortcuts), the indicator's colors up the pH axis, the equivalence point (pH 7 for a strong acid, above 7 for a weak one), the half-way point (pH = pKₐ for a weak acid) and the point at `added`, dragged along the curve. Examples: { kind: 'phScale', pH: 'p', hydrogen: 'h', examples: true }; { kind: 'phScale', mode: 'titration', acid: { concentration: 'Ca', volume: 'Va', Ka: 'Ka', name: 'acetic acid' }, base: { concentration: 'Cb', name: 'NaOH' }, added: 'Vb', equivalence: 'Ve', keep: ['Ca', 'Va', 'Cb', 'Ka'] }. Step text for [H⁺] from pH reads 1/(10^pH), so no negative number is substituted.",
  },
  {
    ...ask(
      'H56',
      'electrochemicalCell',
      'Explore figure: galvanic cell with two electrodes, a salt bridge and electrons flowing through the wire',
      ['s.10.redox'],
    ),
    status: 'drawn',
    gallery: ['g.s10-redox-galvanic-cell'],
    notes:
      "Drawn: explore figure { kind: 'electrochemicalCell' } (layouts/galvanicFigure.tsx; scene type GalvanicScene in typesHsj.ts). Two metal electrodes, each in a glass beaker of its own ion's solution (Cu²⁺ blue, Ni²⁺ and Fe²⁺ green, the others clear), a copper wire through a voltmeter or a bulb, and a KNO₃ salt bridge. From the standard reduction potentials (Mg, Al, Zn, Fe, Ni, Pb, Cu, Ag) the figure works out the anode (the lower E°), sends electrons along the wire from it to the cathode, drifts NO₃⁻ toward the anode and K⁺ toward the cathode in the bridge, writes both half-reactions under the beakers (oxidation, reduction) and reads E° = E°cathode − E°anode on the meter; the anode is eaten away at its foot and the cathode wears a coat of its metal. Scene field: galvanic { metals: [left, right], meter? ('voltmeter' | 'bulb'), lit? ('electrons' | 'anode' | 'cathode' | 'bridge' | 'meter') }. Example: figure { kind: 'electrochemicalCell' }, scenes [{ label: 'Electrons', galvanic: { metals: ['Zn', 'Cu'], lit: 'electrons' }, lines: ['…'] }, { label: 'Copper as anode', galvanic: { metals: ['Ag', 'Cu'], lit: 'anode' }, lines: ['…'] }]. Harness (layoutFiguresHsj.ts): two different known metals, the anode the lower E°, the voltage positive and E°cathode − E°anode.",
  },
  {
    ...ask(
      'H57',
      'decayChart',
      'Half-life: a grid of atoms decaying, what is left after n half-lives, the decay curve; nuclear equations',
      ['s.10.nuclear-chemistry', 's.12.radiometric-dating'],
    ),
    status: 'drawn',
    gallery: [
      'g.s10-nuclear-chemistry-decay-grid',
      'g.s12-radiometric-dating-carbon',
      'g.s12-radiometric-dating-uranium',
      'g.s10-nuclear-chemistry-equation-alpha',
      'g.s10-nuclear-chemistry-equation-beta',
      'g.s10-nuclear-chemistry-fission',
    ],
    notes:
      "Drawn: kind decayChart (typesHsj.ts). The decay (no mode) { halfLife, time, start (numbers or variables; the time unit from the variable: days, years), left? (checked as start × (1/2)^(t ÷ T)), halves? (checked as t ÷ T), parent? ('C-14'), daughter? ('N-14'), keep?, fixed? }: a 10 × 10 grid of parent atoms where 100 × (1/2)^(t ÷ T) (rounded) are left and the rest have turned to the daughter, which ones from a fixed random order; a key with both counts; and the decay curve of the amount left with every half-life dashed to both axes (x ticks at multiples of T, big times as 4.47 × 10⁹) and the point at `time`, dragged along the curve. mode 'equation' { left: Nuclide[], right: Nuclide[] }, a Nuclide { mass, atomic, symbol? (from the atomic number when left out, so the daughter's symbol follows the student's Z), count? } or { particle: 'alpha' | 'beta' | 'positron' | 'neutron' | 'gamma', count? }: each mass number over its atomic number beside the symbol, and both sums under the equation (checked to balance). Radiometric dating reuses the decay mode with start 100 and left as a percent. Examples: { kind: 'decayChart', halfLife: 'T', time: 't', start: 'N0', left: 'N', halves: 'n', parent: 'I-131', daughter: 'Xe-131', keep: ['T', 'N0'] }; { kind: 'decayChart', halfLife: 'T', time: 't', start: 100, left: 'p', halves: 'n', parent: 'C-14', daughter: 'N-14' }; { kind: 'decayChart', mode: 'equation', left: [{ mass: 'A', atomic: 'Z' }], right: [{ mass: 'A2', atomic: 'Z2' }, { particle: 'alpha' }] }. Step text writes the power as 0.5^(n) so a tiny n in scientific notation stays one exponent.",
  },

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
  {
    ...ask(
      'H68',
      'circuit',
      'Mixed series-parallel circuits, meter readings at each resistor, power',
      ['s.11.circuits'],
    ),
    status: 'drawn',
    gallery: [
      'g.s11-circuits-series-parallel',
      'g.s11-circuits-parallel-series',
      'g.s11-circuits-equal-resistors',
    ],
    notes:
      'Drawn (group HK, reps/CircuitMixed.tsx; the readings in hskMath.ts mixedOf) as an option on the Grade 8 circuit, so every current circuit page is unchanged. Calculator picture { kind: "circuit", wiring: "series" (ignored), voltage: V, bulbs: [], current: I (the ammeter, the total current), mixed: { layout: "seriesParallel" (R₁ in series with R₂ ∥ R₃) | "parallelSeries" ((R₁ + R₂) ∥ R₃), resistors: [R₁, R₂, R₃] (Ω, numbers or variables), equivalent?: R_total, power?: total P, voltages?, currents?, powers?: [for R₁, R₂, R₃] (checked when named) } }. A battery cell, an ammeter on the top wire reading the total current, copper wire with the junctions dotted, three ceramic resistors each labelled R₁ … with its reading: the voltage across it, the current through it and its power, and R_total at the corner. The caption works R_total, I = V/R_total and P = VI. The harness checks R_total, I, P and each resistor’s V, I and P (a value shown in mA or kΩ allowed). Example: representation: { kind: "circuit", wiring: "series", voltage: "V", bulbs: [], current: "I", mixed: { layout: "seriesParallel", resistors: ["a", "b", "c"], equivalent: "R", power: "P" } }.',
  },
  {
    ...ask(
      'H69',
      'induction',
      'Magnet moving through a coil with a meter; force on a current in a field (right-hand rule); a transformer by turns',
      ['s.11.electromagnetism'],
    ),
    status: 'drawn',
    gallery: [
      'g.s11-electromagnetism-coil',
      'g.s11-electromagnetism-coil-out',
      'g.s11-electromagnetism-force',
      'g.s11-electromagnetism-force-angle',
      'g.s11-electromagnetism-transformer',
      'g.s11-electromagnetism-step-up',
    ],
    notes:
      'Drawn (group HK, reps/Induction.tsx). Calculator picture { kind: "induction", fixed?: true, and one mode }: coil: { mode: "coil", turns: N, flux: ΔΦ (Wb), time: Δt (s), emf?: NΔΦ/Δt, direction?: "in" | "out" } — a painted bar magnet (S blue, N red) pushed in or pulled out, its field lines traced, a copper coil with one loop per turn (up to 20, the count labelled), leads to a center-zero galvanometer whose needle swings by the emf, right going in and left coming out (Lenz’s law); force: { mode: "force", field: B (T), current: I (A), length: L (m), angle?: θ (degrees; given, B runs along the paper and the wire is drawn at θ to it, the force into or out of the page ⊗/⊙), force?: F, currentDir?: "right" | "left", fieldDir?: "in" | "out" (× or • marks) } — a copper wire with its current arrow, the force arrow on one scale, direction from F = IL × B (right-hand rule in the caption); transformer: { mode: "transformer", primary: Nₚ, secondary: Nₛ, voltage: Vₚ, output?: Vₛ, current?: Iₚ, outputCurrent?: Iₛ } — a laminated iron core, both windings with one loop per turn (up to 20, counts labelled), an AC source and a lamp, step-up or step-down named; Vₛ = Vₚ Nₛ/Nₚ and Iₛ = Iₚ Nₚ/Nₛ (power kept). Step text must put a sine first inside a bracket ({F}/(sin({q}) × {I} × {L})): the harness can’t read N/(N × N × sin(N)). The harness checks the emf, BIL sin θ, Vₛ and Iₛ. Example: representation: { kind: "induction", mode: "transformer", primary: "p", secondary: "s", voltage: "V", output: "W", current: "I", outputCurrent: "J" }.',
  },
  {
    ...ask(
      'H70',
      'spectrum',
      'Emission and absorption lines of H, He, Na; the lines shifted red; photon energy from frequency',
      ['s.11.modern-physics', 's.12.starlight-spectra', 's.12.cosmology'],
    ),
    status: 'drawn',
    gallery: [
      'g.s11-modern-physics-hydrogen',
      'g.s11-modern-physics-helium',
      'g.s11-modern-physics-photon',
      'g.s12-starlight-spectra-absorption',
      'g.s12-cosmology-redshift',
      'g.s12-cosmology-blueshift',
    ],
    notes:
      'Drawn (group HK, reps/SpectrumLines.tsx; the line list and photon math in hskMath.ts) as two options on the Grade 8 spectrum, so every current spectrum page is unchanged. The line wavelengths are the standard measured values in air: H 656.3 (Hα), 486.1, 434.0, 410.2 nm; He 587.6, 447.1, 471.3, 492.2, 501.6, 667.8, 706.5 nm; Na 589.0 and 589.6 (the D doublet), 568.8, 615.4 nm. Lines: { kind: "spectrum", wavelength: λ (with meters: 1e-9 for nm), lines: { element: "H" | "He" | "Na", mode: "emission" | "absorption", redshift?: z (number or variable), line?: the reference line’s index (default the first: Hα, He 587.6, Na D₂), rest?: its lab wavelength, velocity?: v ≈ cz in km/s } } — the visible spectrum 380–750 nm as bright lines in their colors on black (emission) or dark lines across the rainbow (absorption), Hα–Hδ and D named, ticks every 100 nm; without a redshift the page’s λ may be any of the element’s lines (give the variable `allowed` the list) and is marked under the strip; with z, a second strip at λ(1 + z), each line joined to its lab line, lines past 750 nm noted; λ is then the observed reference line. Photon: { kind: "spectrum", wavelength: λ, meters: 1e-9, photon: { frequency: f, hertz?: Hz per unit (1e12 for THz), energy?: E in J, electronVolts?: E in eV } } — the wave in its color with more cycles for a higher frequency, its place on the visible strip (UV, IR, radio or X-ray named past it), λ = c/f and E = hf in J and eV in the caption. The harness checks the observed λ₀(1 + z), cz, that an unshifted λ is one of the element’s lines, and λ = c/f, hf and eV. Example: representation: { kind: "spectrum", wavelength: "l", meters: 1e-9, lines: { element: "H", mode: "absorption", redshift: "z", velocity: "v" } }.',
  },

  // ── G. Earth and space ──
  {
    ...ask(
      'H71',
      'mineralIcons',
      'Card icons of minerals in their materials (quartz, feldspar, mica, calcite, halite, pyrite, hematite) and the Mohs scale',
      ['s.12.minerals-rocks'],
    ),
    status: 'drawn',
    gallery: [
      'g.s12-minerals-rocks-luster',
      'g.s12-minerals-rocks-cleavage',
      'g.s12-minerals-rocks-mohs',
    ],
    notes:
      'Drawn (group HL) as card icons and an explore figure. Card icons, each in its habit and luster: { kind: "icon", icon: "quartz" } (also "feldspar", "mica", "calcite", "halite", "pyrite", "hematite"); hematite shows its red-brown streak on a white plate, calcite doubles a line seen through it. Mohs scale (explore figure): { kind: "mohsScale" }, each scene mohs: { lit?: rank 1–10, between?: [low, high] (an unknown’s range, shaded; the tools sit at fingernail 2.5, copper coin 3.5, glass 5.5, steel file 6.5), absolute?: true (bars to absolute hardness, talc 1 … diamond 1500) }. Example scene: { label: "An unknown mineral", lines: [...], mohs: { between: [5.5, 6.5], lit: 6 } }. The harness checks lit is a rank and the range lies in 1–10.',
  },
  {
    ...ask(
      'H72',
      'earthLayers',
      'Cross-section of Earth with P and S wave paths and the shadow zone; a seismogram; locating an epicenter from three stations',
      ['s.12.earth-interior'],
    ),
    status: 'drawn',
    gallery: [
      'g.s12-earth-interior-shadow-zone',
      'g.s12-earth-interior-shadow-direct',
      'g.s12-earth-interior-shadow-core',
      'g.s12-earth-interior-shadow-edge',
      'g.s12-earth-interior-seismogram',
      'g.s12-earth-interior-seismogram-near',
      'g.s12-earth-interior-epicenter',
    ],
    notes:
      'Drawn (group HL) as one calculator kind in three modes. Cross-section: { kind: "earthLayers", mode: "section", distance?: id or number (the station’s angle from the focus, 0°–180°), fixed? }: layers to scale (crust, mantle, liquid outer core from 2,890 km, solid inner core from 5,150 km), P paths on the left curving to 104° and through the core to 140°–180°, S paths on the right stopping at the outer core, the shadow zones as bands; the station is drawn on both halves, filled where that wave arrives, and dragged round the surface. Example: { kind: "earthLayers", mode: "section", distance: "D" } with s = Δ × π × 6371 ÷ 180. Seismogram: { kind: "earthLayers", mode: "seismogram", km: id, vp?: id or number (default 6 km/s), vs?: (default 3.5), lag?: id }: the trace with P at d ÷ vₚ, S at d ÷ vₛ, surface waves after, the S − P lag bracketed; give the page a constraint vₛ < vₚ. Example: { kind: "earthLayers", mode: "seismogram", km: "d", vp: "vp", vs: "vs", lag: "L" }. Epicenter: { kind: "earthLayers", mode: "epicenter", stations: [{ name, x, y (km), r: distance id } ×3] }: circles on a km grid, the epicenter starred where all three meet; circles that miss draw faded with the reason. Example: stations [{ name: "1", x: 0, y: 0, r: "d1" }, { name: "2", x: 168, y: 210, r: "d2" }, { name: "3", x: 336, y: 0, r: "d3" }] with d = k × L, k = 8.4 km per second of lag. The harness checks the rays (the 104° ray grazes the core, none dips into it), the lag against the trace, and that stations aren’t in a line.',
  },
  {
    ...ask(
      'H73',
      'landforms',
      'Explore figures: volcano types, folds and faults, a U- and a V-shaped valley, a meandering river, an aquifer and water table, dunes',
      ['s.12.volcanoes-mountains', 's.12.surface-processes'],
    ),
    status: 'drawn',
    gallery: [
      'g.s12-volcanoes-mountains-volcanoes',
      'g.s12-volcanoes-mountains-deformation',
      'g.s12-surface-processes-landforms',
    ],
    notes:
      'Drawn (group HL) as one explore figure: { kind: "landforms" }, each scene landform: { kind } with kind one of "shield", "composite", "cinderCone" (volcanoes in cross-section: a broad basalt dome with thin flows; a steep concave cone of lava and ash layers with its vent, side vent and ash cloud; a small cone of cinders at 33°, lava from its base), "folds" (anticline and syncline, squeezed), "normalFault", "reverseFault" (layered blocks on a fault dipping left, the hanging wall dropped or pushed up, stress arrows and half arrows), "strikeSlip" (seen from above, a stream and a fence offset), "vValley", "uValley" (the glacier’s former ice dashed), "meander" (seen from above: cut banks, point bars, an oxbow lake), "aquifer" (unsaturated zone, water table, saturated sand and gravel on clay, a well and a lake) or "dunes" (gentle windward side, 33° slip face, sand bouncing). The part names are drawn; the scene’s lines explain. Example scene: { label: "Normal fault", lines: [...], landform: { kind: "normalFault" } }.',
  },
  {
    ...ask(
      'H74',
      'rockLayers',
      'Absolute ages on layers, an igneous intrusion cutting across, index fossils',
      ['s.12.radiometric-dating'],
    ),
    status: 'drawn',
    gallery: [
      'g.s12-radiometric-dating-half-life',
      'g.s12-radiometric-dating-young',
      'g.s12-radiometric-dating-bracket',
    ],
    notes:
      'Drawn (group HL) as an optional `dating` field on rockLayers (the Grade 3 fossils page is unchanged; a spec with `dating` draws the dated cliff instead): { kind: "rockLayers", dating: { layers: [{ rock: "sandstone" | "shale" | "limestone" | "siltstone" | "conglomerate" | "ash" | "lava", age?: id or number (million years), fossil?: "trilobite" | "ammonite" | "fern" }] (top to bottom, 3 to 8), intrusion?: { through: index of the highest layer the dike cuts, age? }, bracket?: index of the layer whose age is bracketed by the nearest ages above and below (a dike that cuts it makes it older than the dike; one that stops below makes it younger), sample?: { parent: percent id, layer: index (−1 for the dike), parentName, daughterName, halfLives?: id } } }; the sample is 100 atoms, parent and daughter counted from the rounded percent. Example: layers [{ rock: "sandstone", fossil: "ammonite" }, { rock: "shale" }, { rock: "ash", age: "t" }, { rock: "limestone", fossil: "trilobite" }, { rock: "siltstone" }], sample { parent: "P", layer: 2, parentName: "potassium-40", daughterName: "argon-40", halfLives: "n" } with P = 100 × (1/2)^n and t = n × T. The harness checks superposition (dated ages rise downward), cross-cutting (the dike is younger than what it cuts and older than what it doesn’t reach), a non-empty bracket and P against the half-lives; pages keep the ages in order with constraint rules.',
  },
  {
    ...ask(
      'H75',
      'oceanProfile',
      'Ocean floor profile (shelf, slope, ridge, trench); surface currents and gyres on a map; the deep conveyor; tides from the moon and sun',
      ['s.12.ocean-atmosphere'],
    ),
    status: 'drawn',
    gallery: [
      'g.s12-ocean-atmosphere-sonar',
      'g.s12-ocean-atmosphere-sonar-ridge',
      'g.s12-ocean-atmosphere-sonar-trench',
      'g.s12-ocean-atmosphere-tides',
      'g.s12-ocean-atmosphere-tides-neap',
      'g.s12-ocean-atmosphere-tides-full',
      'g.s12-ocean-atmosphere-currents',
    ],
    notes:
      'Drawn (group HL) as a calculator kind in two modes and an explore figure. Seafloor: { kind: "oceanProfile", mode: "profile", depth?: id (m), over?: "shelf" | "slope" | "rise" | "plain" | "ridge" | "trench" }: a profile from a continent to an island arc with typical depths (shelf to 200 m, abyssal plain 4,500–5,000 m, ridge crest 2,500 m with its rift, trench to 10,900 m) on a stretched depth axis; a sonar ship sits where the floor is that deep (within `over`) and pings down to it; with no such place it says so. Example: { kind: "oceanProfile", mode: "profile", depth: "d", over: "plain" } with d = v × t ÷ 2. Tides: { kind: "oceanProfile", mode: "tides", angle: id (the Moon’s angle from the Sun, 0°–180°), range?: id, fixed? }: Earth from above the North Pole with its two bulges from the Moon’s and Sun’s pulls (the Sun’s 0.46 of the Moon’s), spring or neap named, the Moon dragged round its orbit. Example: { kind: "oceanProfile", mode: "tides", angle: "A", range: "R" } with R = m × √(1 + 0.46² + 2 × 0.46 × cos(2θ)). Currents (explore figure): { kind: "oceanCurrents" }, each scene currents: { view: "gyres" | "conveyor" } on a world map with the Pacific in the middle: the five gyres (warm on each basin’s west side, cold on the east) and the Antarctic Circumpolar Current, or the conveyor’s warm surface and cold deep flows with where it sinks and rises. The harness checks the ship sits over its depth and the bulge points nearer the Moon than the Sun.',
  },
  {
    ...ask(
      'H76',
      'atmosphereLayers',
      'Layers of the atmosphere with the temperature profile; a pressure map with highs, lows and wind arrows turned by Coriolis',
      ['s.12.atmosphere-weather'],
    ),
    status: 'drawn',
    gallery: [
      'g.s12-atmosphere-weather-layers',
      'g.s12-atmosphere-weather-tropopause',
      'g.s12-atmosphere-weather-hot-day',
      'g.s12-atmosphere-weather-pressure',
      'g.s12-atmosphere-weather-pressure-south',
      'g.s12-atmosphere-weather-pressure-weak',
    ],
    notes:
      'Drawn (group HL) as a calculator kind in two modes. Layers: { kind: "atmosphereLayers", mode: "profile", altitude?: id (km), temperature?: id (°C), ground?: id or number (°C, default 15) }: temperature against altitude to 120 km (standard atmosphere, the troposphere cooling 6.5 °C per km from the ground’s temperature to 11 km), the troposphere, stratosphere with its ozone layer, mesosphere and thermosphere as bands, a point at the altitude dragged up and down. Example: { kind: "atmosphereLayers", mode: "profile", altitude: "h", temperature: "T", ground: "T0" } with T = T₀ − 6.5 × h (h up to 11 km). Pressure map: { kind: "atmosphereLayers", mode: "pressure", high: id, low: id (hPa), distance?: id (km, a scale bar between the centres), hemisphere?: "north" | "south" }: H and L with their pressures, isobars every 4 hPa (doubled until at most 16 fit), surface winds from high to low turned by the Coriolis effect (right in the north, left in the south) and 30° back toward the low by friction. Example: { kind: "atmosphereLayers", mode: "pressure", high: "H", low: "Lw", distance: "D" } with ΔP = H − L and G = ΔP ÷ D × 100. The harness checks the point sits on the line, the centres are the typed pressures, and the winds turn and cross the isobars the right way round the high and the low in each hemisphere.',
  },
  {
    ...ask(
      'H77',
      'greenhouse',
      'Explore figure: sunlight in, infrared out and back; climate zones by latitude',
      ['s.12.climate-systems'],
    ),
    status: 'drawn',
    gallery: ['g.s12-climate-systems-greenhouse', 'g.s12-climate-systems-zones'],
    notes:
      'Drawn (group HL) as an explore figure: { kind: "greenhouse" }, each scene greenhouse: { view: "energy", co2?: "none" | "preindustrial" | "today" } (sunlight in, some bounced off a cloud; infrared out from the ground as four wavy rays, 0, 2 or 3 of them absorbed by CO₂ molecules and sent back down; 0, 4 or 6 molecules; a thermometer at the mean surface temperature, −18, 14 or 15.2 °C) or { view: "zones", lit?: "tropical" | "temperate" | "polar" } (Earth at an equinox lit from the left, zones bounded at 23.5° and 66.5°, the night half shaded, one beam of sunlight on the equator and the same beam at 50° N spread over 1 ÷ cos 50° ≈ 1.6 times the area). Example scenes: { label: "Today", lines: [...], greenhouse: { view: "energy", co2: "today" } }, { label: "Polar", lines: [...], greenhouse: { view: "zones", lit: "polar" } }. The climate page’s feedback loops use the existing feedbackLoop figure (H41). The harness checks a zone is lit only on the zones view and CO₂ is set only on the energy view.',
  },
  {
    ...ask(
      'H78',
      'energySources',
      'Card icons for energy sources (solar panel, wind turbine, dam, coal, oil rig, nuclear plant) and a resource bar or pie',
      ['s.12.resource-management'],
    ),
    status: 'drawn',
    gallery: [
      'g.s12-resource-management-renewable',
      'g.s12-resource-management-mix',
      'g.s12-resource-management-world',
    ],
    notes:
      'Drawn (group HL) as card icons plus existing charts. Round 3 already draws a wind turbine, a dam, lumps of coal, an oil pump, a gas stove flame and a nuclear power plant (r3f), so this adds the two missing: { kind: "icon", icon: "solar panel" } (blue cells on a tilted stand) and "oil rig" (an offshore platform and derrick). The energy mix uses the existing bars (an icon under each bar) or pieChart (colors that mean something): { kind: "bars", bars: [{ var: "g", icon: "gas stove flame" }, { var: "n", icon: "nuclear power plant" }, { var: "k", icon: "lumps of coal" }, { var: "w", icon: "wind turbine" }, { var: "h", icon: "dam" }, { var: "s", icon: "solar panel" }], min: 0, max: 50, total: "T", scale: 10 } (US electricity, about 2023: 43, 19, 16, 10, 6, 4 and 2 other); { kind: "pieChart", parts: ["F", "n", "r"], total: "T", colors: ["rubber", "purple", "landGrass"] } (the world’s energy: fossil 81, nuclear 4, renewable 15; keep part names short, the pie’s labels sit on the wedges). Sort: renewable or nonrenewable with the seven icons.',
  },
  {
    ...ask(
      'H79',
      'hrDiagram',
      'H–R diagram (temperature against luminosity, log scales) with the main sequence, giants and white dwarfs; star life-cycle stages',
      ['s.12.stellar-evolution'],
    ),
    status: 'drawn',
    gallery: [
      'g.s12-stellar-evolution-hr',
      'g.s12-stellar-evolution-giant',
      'g.s12-stellar-evolution-supergiant',
      'g.s12-stellar-evolution-white-dwarf',
      'g.s12-stellar-evolution-sunlike',
      'g.s12-stellar-evolution-massive',
      'g.s12-stellar-evolution-remnants',
    ],
    notes:
      'Drawn (group HL) as a calculator kind and card icons. H–R diagram: { kind: "hrDiagram", temperature: id (K), luminosity: id (L☉), radius?: id (R☉), name?: "Sirius A", fixed? }: temperature 40,000–2,500 K (hot on the left) against luminosity 10⁻⁴–10⁶ L☉, both log; the main sequence (from the spectral-type tables), giants, supergiants and white dwarfs as regions, dashed lines of 0.01, 1 and 100 R☉, the Sun, and the star in its temperature’s color, named by the region it falls in (the caption gives its radius); drag the star to change T and L. Example: { kind: "hrDiagram", temperature: "T", luminosity: "L", radius: "R", name: "Sirius A" } with L = R² × (T ÷ 5772)⁴ (demos: Sirius A, Aldebaran, Betelgeuse, Sirius B). Life-cycle card icons, each on night sky: "stellar nebula", "protostar", "Sun-like star", "massive star", "red giant", "red supergiant", "planetary nebula", "white dwarf", "supernova", "neutron star", "black hole"; sequences nebula → protostar → Sun-like star → red giant → planetary nebula → white dwarf, and → massive star → red supergiant → supernova → neutron star (or black hole). The harness checks the star is in the window and L = R²(T ÷ 5772)⁴.',
  },
  {
    ...ask(
      'H80',
      'expandingUniverse',
      'Explore figure: galaxies spreading apart as space stretches; Hubble plot of speed against distance; galaxy type card figures',
      ['s.12.cosmology', 's.12.solar-system'],
    ),
    status: 'drawn',
    gallery: [
      'g.s12-cosmology-stretch',
      'g.s12-cosmology-stretch-far',
      'g.s12-cosmology-hubble',
      'g.s12-cosmology-hubble-far',
      'g.s12-cosmology-galaxies',
      'g.s12-solar-system-formation',
    ],
    notes:
      'Solar system page: nebula to planets as sequence stages. Drawn (group HL) as a calculator kind with two modes, where the spec asked for an explore figure: the stretch and the Hubble plot are both driven by values (a stretch factor; H₀ and a distance), so a page can type them and drag. Stretch: { kind: "expandingUniverse", mode: "stretch", scale: id (1–4), distance?: id, after?: id }: the same patch of galaxies before and after space stretches, our galaxy ringed in the middle, each galaxy’s old place a faint dot with an arrow to its new one (the far ones move farther), a marked neighbor with its distance before and after. Example: { kind: "expandingUniverse", mode: "stretch", scale: "a", distance: "d", after: "D" } with D = a × d. Hubble plot: { kind: "expandingUniverse", mode: "hubble", distance: id (Mpc), speed: id (km/s), constant?: id or number (default 70) }: speed against distance with the line v = H₀d and its slope, a scatter of other galaxies about it, the page’s galaxy dragged along the distance axis. Example: { kind: "expandingUniverse", mode: "hubble", distance: "d", speed: "v", constant: "H" } with v = H₀ × d. Card icons (night sky): "spiral galaxy", "barred spiral galaxy", "elliptical galaxy", "irregular galaxy"; the solar system page’s sequence stages "solar nebula", "spinning disk", "protosun", "planetesimals", "young planets". The harness checks D = a × d, v = H₀ × d, and the stretch within 1–4.',
  },
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
  // ── Round 2 (H89–H103): what the eight direction plans still need (docs/HS_NEEDS.md P1–P15;
  // brief docs/RENDERINGS_HS_ROUND_2.md) ──
  {
    ...ask(
      'H89',
      'integerLine',
      'A number line window that fits its values (10 ≤ x ≤ 30; 344–356 g), ticks by 5 or 10',
      ['m.9.linear-inequalities', 'm.9.absolute-value'],
    ),
    status: 'placed',
    gallery: ['g.m9-linear-inequalities-ticks', 'g.m9-absolute-value-tolerance'],
    notes:
      'P1 (docs/plans/m.9.md need 1). Two options on `integerLine`, off unless set, for every mode (a point, an inequality, a compound): `fit: true` spans the line over its own values (the bounds, the center, the test number) with a quarter of their spread each side and at least 10 across, rounded out to its ticks, instead of 0 and min–max (min and max are then unused): 344 ≤ w ≤ 356 draws 340 to 360 by 2 (335 to 360 by 5 with a 343 g test), 10 < x ≤ 18 draws 5 to 20; `ticks: 5` (or 10) fixes the tick step (at most 40 ticks, else the usual step): the main page at ±20 by 5s. m.9.linear-inequalities: `ticks: 5` (no other change); ~compound: `fit: true, ticks: 5` lets l and r go past ±50 (the demo keeps the page’s ranges); m.9.absolute-value~tolerance: rows T, d, w (g), L = T − d and U = T + d worked out, k = |w − T| and the truth value; picture { kind: "integerLine", value: "L", second: "U", min: 0, max: 10, unit: "g", fit: true, compound: { join: "and", closed: [true, true], center: "T", radius: "d", letter: "w", test: "w" } } (example 350 g within 6 g, a 343 g box is out).',
  },
  {
    ...ask(
      'H90',
      'functionGraph',
      'A sign box drives the picture: shading on lineSystem, linearFunction and functionGraph; closed or open ends on integerLine; the tail of normalCurve',
      {
        'm.9.linear-inequalities~compound': '"closed":["s","t"]',
        'm.9.linear-inequalities~two-variables': '"shade":{"sign":"s"}',
        'm.9.inequality-systems~standard-form': '"flip":"b"',
        'm.9.quadratic-formula~inequality': '"inequality":{"sign":"s"}',
        'm.12.hypothesis-testing': '"tail":{"sign":"h"}',
        'm.12.hypothesis-testing~mean': '"tail":{"sign":"h"}',
      },
    ),
    status: 'placed',
    gallery: [
      'g.m9-linear-inequalities-two-variables-sign',
      'g.m9-inequality-systems-standard-form',
      'g.m9-quadratic-formula-inequality-sign',
      'g.m9-linear-inequalities-compound-sign',
      'g.m12-hypothesis-testing-sign',
    ],
    notes:
      "P2 (docs/plans/m.9.md need 2, m.12.md need 2). A sign box drives a picture through `{ sign: 's', flip?: 'b' }`: `sign` is the value holding the code as `{s:sign}` stores it (1 <, 2 ≤, 3 >, 4 ≥), and `flip` (optional) reverses it while that value is negative, so the page needs no worked-out sign of its own. Until a sign is chosen nothing is shaded and the caption says so. Fields: `linearFunction` `shade: { sign: 's' }` (m.9.linear-inequalities~two-variables with `equation: 'y {s:sign} {m}x + {b}'`: one page for all four signs); `lineSystem` `lines[i].shade: { sign, flip }` (the standard-form systems page: `{a}x + {b}y {s:sign} {c}` over two lines, slopes −a ÷ b and intercepts c ÷ b as worked-out values, `shade: { sign: 's', flip: 'b' }` and `{ sign: 't', flip: 'e' }`, `fixed: true`); `functionGraph` `inequality: { sign: 's' }` draws f(x) (sign) 0: the region between the curve and the x-axis where it holds shaded, the solutions as a band on the axis with open (<, >) or closed (≤, ≥) circles at the zeros, and the caption \"f(x) < 0 where the curve is below the x-axis: −2 < x < 4\" (m.9.quadratic-formula~inequality and ~inequality-outside become one page, `x² + {b}x + {c} {s:sign} 0`); `integerLine` `compound.closed: ['s', 't']` (value ids; 2 or 4 closed, 1 or 3 open) for `{l} {s:sign} {a}x + {b} {t:sign} {r}` on ~compound (the demo keeps s and t to < and ≤ with `allowed: [1, 2]`); `normalCurve` `test.tail: { sign: 's' }`: 1 or 2 left, 3 or 4 right, 6 ≠ both tails, the caption naming Hₐ's side (m.12.hypothesis-testing and ~mean as one page, the p-value relation choosing Φ(z), 1 − Φ(z) or 2 × (1 − Φ(|z|)) by s). The sign box has no ≠ yet (`{s:sign}` cycles < ≤ > ≥; `{s:relation}` adds = as 5), so the demo types Hₐ's code (1, 3 or 6) in its row; a box offering ≠ (coded 6) is an equation-input need for the lesson chat. Example: { kind: 'lineSystem', lines: [{ slope: 'm1', intercept: 'b1', shade: { sign: 's', flip: 'b' } }, { slope: 'm2', intercept: 'b2', shade: { sign: 't', flip: 'e' } }], test: { x: 'tx', y: 'ty' }, extent: 10, fixed: true }.",
  },
  {
    ...ask(
      'H91',
      'integerLine',
      'Two dots at c ± d with the distance bracketed and nothing shaded (join: equal)',
      ['m.9.absolute-value'],
    ),
    status: 'placed',
    gallery: ['g.m9-absolute-value-equal', 'g.m9-absolute-value-equal-one'],
    notes:
      'P3 (docs/plans/m.9.md need 3). `compound: { join: "equal", center, radius, letter?, test? }` draws |x − c| = d: closed dots at c − d and c + d (`value` and `second`, in either order, so x₁ and x₂ can stay as the page solves them for a negative a), the center marked, d bracketed to each dot, nothing shaded between; d = 0 draws one dot at c ("x = c"), a negative d none and the caption says no number is a negative distance away. `center` and `radius` are required (the harness checks {value, second} = {c − d, c + d}); `fit` and `ticks` (H89) work here too. m.9.absolute-value main: { kind: "integerLine", value: "x1", second: "x2", min: -20, max: 20, compound: { join: "equal", center: "h", radius: "d" } } with its h and d as they are (the labels under the picture can go).',
  },
  {
    ...ask(
      'H92',
      'lineSystem',
      'Upright boundaries (x ≥ k); parallel arrows and right-angle marks; the given point',
      {
        'm.9.inequality-systems~box': '"upright"',
        'm.10.parallel-lines~parallel-line': '"given"',
        'm.10.parallel-lines~perpendicular-line': '"given"',
      },
    ),
    status: 'placed',
    gallery: [
      'g.m9-inequality-systems-box',
      'g.m10-parallel-lines-parallel-line-marks',
      'g.m10-parallel-lines-perpendicular-line-marks',
    ],
    notes:
      'P4 (docs/plans/m.9.md need 4, m.10.md need 10). Three options on `lineSystem`, off unless set. `upright: [{ x, shade?, label? }]`: upright lines x = k (a number or a value id) in their own colour (theme `lineUpright`), or boundaries x (sign) k with `shade` (a sign, or a sign box as in H90), dashed when strict; with any upright line only the overlap of every boundary is shaded (four half-planes on top of each other would muddy it), the caption says where all of them overlap and tests the point against each in one line. The box a ≤ x ≤ b, c ≤ y ≤ d (NAEP-2024-12M11-#11 on m.9.inequality-systems): { kind: "lineSystem", lines: [{ slope: 0, intercept: "c", shade: "≥" }, { slope: 0, intercept: "d", shade: "≤" }], upright: [{ x: "a", shade: "≥" }, { x: "b", shade: "≤" }], test: { x: "tx", y: "ty" }, extent: 10, fixed: true }. `marks: true`: one arrow on each line when the slopes are equal, a right-angle square at the crossing when they multiply to −1 (in the quarter away from the crossing’s label), with a caption line (“The arrows mark them parallel: both slopes are 3”, “The square marks a right angle: 2 × (−1/2) = −1”). `given: { x, y }`: the point the second line goes through, filled and labelled, and “(2, 7) is on Parallel: 3 × 2 + 1 = 7” (the harness checks it is on that line). m.10.parallel-lines~parallel-line and ~perpendicular-line: add `marks: true, given: { x: "x0", y: "y0" }` to their pictures (no other change).',
  },
  {
    ...ask(
      'H93',
      'termsChart',
      'Past 30 terms (the first terms, a break, the nth); a recursive type; a second lit term',
      {
        'm.9.sequences': '"far":true',
        'm.9.sequences~recursive': '"type":"recursive"',
        'm.11.exp-log-equations~same-base': '"litTerm"',
      },
    ),
    status: 'placed',
    gallery: [
      'g.m9-sequences-far',
      'g.m9-sequences-recursive-chart',
      'g.m11-exp-log-equations-same-base-lit',
    ],
    notes:
      'P5 (docs/plans/m.9.md needs 5 and 11, m.11.md need 10). Three options on `termsChart`, off unless set. `far: true`: `count` may run to 10,000; past 30 the chart draws the first six terms, a break on the axis ("…"), then the nth term lit, and the caption says where it skips; at 30 or fewer it draws every term as before (partial sums are drawn only without a break). m.9.sequences main: add `far: true` and let n run 1–1000 (example 7, 11, 15, … → a₁₀₀ = 403): { kind: "termsChart", type: "arithmetic", first: "a1", step: "d", count: "n", as: "points", term: "an", far: true }. `type: "recursive"` with `step` the multiplier k and `plus` the added c (default 0): aₙ = k × aₙ₋₁ + c, each term worked out from the one before, an arrow from each term to the next (up to 12 terms), the caption "a₄ = 3 × 14 − 1 = 41"; m.9.sequences~recursive: { kind: "termsChart", type: "recursive", first: "a1", step: "k", plus: "c", count: "n", term: "an" } in place of the table. `lit` (a term number, value id or number) lights a second term in the second colour with its label, the chart running on to it when it is past `count` (up to 30); `litTerm` names the value it equals (checked); `powers: true` (geometric with r = a₁) writes the terms as powers, "2² = 4", the axis "exponent n". m.11.exp-log-equations~same-base: { kind: "termsChart", type: "geometric", first: "g", step: "g", count: "q", term: "B2", lit: "p", litTerm: "B1", powers: true }.',
  },
  {
    ...ask(
      'H94',
      'functionGraph',
      '|f(x)| reflected; a horizontal factor b; xMin from a value; rational by coefficients',
      {
        'm.9.piecewise-functions~absolute-of-function': '"abs":true',
        'm.11.function-transformations~horizontal': '"horizontal"',
        'm.11.inverse-functions~restrict-domain': '"restrict"',
        'm.12.limits-intro~infinity': '"family":"rational"',
      },
    ),
    status: 'placed',
    gallery: ['g.m9-piecewise-functions-abs', 'g.m12-limits-intro-infinity-coefficients'],
    notes:
      'P6 (docs/plans/m.9.md need 6, m.11.md needs 4 and 5, m.12.md need 11). Four options on `functionGraph`, off unless set; the picture and the harness reshape the same curve (functionGraphHs2g.ts). `abs: true` draws |f(x)| for any family: the parts below the x-axis reflected up, the curve before it dashed, the formula in bars, no handles (sliders); a traced point reads |f(x)|. m.9.piecewise-functions~absolute-function (the |f(x)| item): { kind: "functionGraph", family: "quadratic", form: "standard", a: "a", b: "b", c: "c", abs: true, at: { x: "x", y: "y" }, marks: ["zeros"] } with y = |f(x)|. `horizontal: "b"` on the absolute, root, exponential and log families draws y = a·f(b(x − h)) + k, written "√(2x)", "|2(x − 3)|", "√(−(x − 2))"; the graph squeezed toward x = h (stretched for |b| < 1), flipped across it for b < 0; `parent: true` keeps f(x) dashed; handles at x = h stay, the stretch handle moves to h + 1/b. m.11.function-transformations~horizontal: { kind: "functionGraph", family: "root", index: 2, h: "h", horizontal: "b", parent: true, input: "x", at: { x: "X", y: "Y" } } (X = h + p ÷ b, Y = √p). `restrict: { from?, to? }` (numbers or value ids) keeps the domain x ≥ from (x ≤ to): the rest dashed, closed end dots, and with `inverse` only the kept part is reflected; a vertex-form parabola kept on x ≥ h writes f⁻¹(x) = h + √((x − k)/a). `xMin` keeps its meaning (the window’s left edge). m.11.inverse-functions~restrict-domain: { kind: "functionGraph", family: "quadratic", form: "vertex", a: "a", h: "h", k: "k", restrict: { from: "h" }, inverse: true, at: { x: "x", y: "y" } }. Rational by coefficients: `family: "rational", p, q, r, s` draws (px + q) ÷ (rx + s) written as typed, its asymptotes x = −s ÷ r and y = p ÷ r (no handles). m.12.limits-intro~infinity: { kind: "functionGraph", family: "rational", p: "p", q: "q", r: "r", s: "s", shows: { ha: "L" } }, so z and v can go.' +
      ' Parts by page (`uses`): ~absolute-of-function and limits-intro~infinity are placed. Waiting on pages not built yet (each in `pages` with its mark, so the test checks it once built; the demos hold the specs): m.11.function-transformations~horizontal (`horizontal`) and m.11.inverse-functions~restrict-domain (`restrict`).',
  },
  {
    ...ask(
      'H95',
      'algebraTiles',
      'An area box for polynomial products past the tiles; a monomial picture with factors struck',
      {
        'm.9.polynomial-operations~box': '"mode":"box"',
        'm.9.radicals~monomials': '"mode":"monomial"',
      },
    ),
    status: 'placed',
    gallery: [
      'g.m9-polynomial-operations-box',
      'g.m9-radicals-monomials-factors',
      'g.m9-radicals-monomials-negative',
    ],
    notes:
      'P7 (docs/plans/m.9.md needs 7 and 8). Two new `algebraTiles` modes; the other modes are unchanged. `mode: "box"`: the area box (a generic rectangle, not to scale) with `side` (the left factor’s coefficients, highest power first, 1–3 terms) down the left and `top` (1–4 terms) across the top, each cell the row term times the column term, each diagonal of like terms in its own tint (theme `areaBoxBand1`–`6`) and collected in a key under the box ("−3x² + 2x² = −x²"); `product` names the product’s coefficients, highest first (checked). m.9.polynomial-operations~box: { kind: "algebraTiles", mode: "box", side: ["a", "b"], top: ["c", "d", "e"], product: ["p", "q", "r", "t"] } for ({a}x + {b})({c}x² + {d}x + {e}) = {p}x³ + {q}x² + {r}x + {t} (9 values; example (x + 2)(x² − 3x + 4) = x³ − x² − 2x + 8). `mode: "monomial"`: a·xᵐ ÷ b·xⁿ written as a · x · x · … over b · x · …, the pairs that cancel struck, a negative exponent’s factors moved across the bar (in orange, the caption says why), the answer c·xᵏ under it ("= 4x⁵", "= (3/2)x⁵", "= 2/x³ = 2x⁻³"); `c` and `k` are checked (c = a ÷ b, k = m − n). m.9.radicals~monomials: { kind: "algebraTiles", mode: "monomial", a: "a", m: "m", b: "b", n: "n", c: "c", k: "k" } in place of the table (the check value x and y can go).',
  },
  {
    ...ask(
      'H96',
      'markedFigure',
      'Geometry: a regular polygon; compass-arc construction stages; marked-triangle cards; cross-section cards; circleTheorems cyclic and arcAngle; coordinatePlane to ±20; symmetry about a center',
      {
        'm.10.quadrilaterals': '"regular"',
        'm.10.constructions~bisector-steps': '"kind":"construction"',
        'm.10.constructions~angle-bisector-steps': '"kind":"construction"',
        'm.10.constructions~find-center': '"kind":"construction"',
        'm.10.proofs': '"kind":"construction"',
        'm.10.parallel-lines~triangle-sum-proof': '"kind":"construction"',
        'm.10.congruence~cpctc-proof': '"kind":"construction"',
        'm.10.congruence': '"markedTriangles"',
        'm.10.similarity~similar-or-not': '"markedTriangles"',
        'm.10.circle-theorems~cyclic-quadrilateral': '"theorem":"cyclic"',
        'm.10.circle-theorems~chord-angle': '"theorem":"arcAngle"',
        'm.10.coordinate-geometry': '"fit":true',
        'm.10.coordinate-geometry~midpoint': '"fit":true',
        'm.10.coordinate-geometry~parallelogram': '"fit":true',
        'm.10.coordinate-geometry~partition': '"fit":true',
        'm.10.coordinate-geometry~perimeter': '"fit":true',
        'm.10.coordinate-geometry~right-triangle': '"fit":true',
        'm.10.rigid-motions~symmetry': '"symmetry":true',
        'm.10.volume-derivations~cross-section-shapes': '"solidCut"',
      },
    ),
    status: 'placed',
    gallery: [
      'g.m10-quadrilaterals-polygon-sums',
      'g.m10-quadrilaterals-polygon-sums-30',
      'g.m10-circle-theorems-cyclic-quadrilateral',
      'g.m10-circle-theorems-cyclic-narrow',
      'g.m10-circle-theorems-chord-angle',
      'g.m10-circle-theorems-chord-angle-outside',
      'g.m10-coordinate-geometry-fit',
      'g.m10-coordinate-geometry-fit-small',
      'g.m10-coordinate-geometry-fit-20',
      'g.m10-rigid-motions-symmetry-parallelogram',
      'g.m10-congruence-marked',
      'g.m10-similarity-marked',
      'g.m10-constructions-bisector-steps',
      'g.m10-constructions-angle-bisector-steps',
      'g.m10-constructions-find-center',
      'g.m10-proofs-vertical-angles',
      'g.m10-parallel-lines-triangle-sum-proof',
      'g.m10-congruence-cpctc-proof',
      'g.m10-volume-derivations-cross-sections',
    ],
    notes: [
      'P8: docs/plans/m.10.md needs 4–7, 11, 12, 14. Group H2B; types in typesHs2b.ts, checks in harness/picturesHs2b.ts.',
      'Need 4 (m.10.quadrilaterals main): markedFigure `regular` { sides, triangles?, exterior?, labels?: { sum?, interior?, exterior? } } (RegularPolygon.tsx): a regular n-gon (3–30) with side AB flat at the bottom, the diagonals from A cutting it into n − 2 shaded triangles (numbered up to 12 sides), AB run on past B and the exterior angle at B marked; the interior and exterior values sit under AB with leaders; the caption works the sum, each angle and each exterior angle. Example: { kind: "markedFigure", regular: { sides: "n", triangles: true, exterior: true, labels: { sum: "S", interior: "e", exterior: "x" } } }.',
      'Need 7 (circle-theorems ~cyclic-quadrilateral, ~chord-angle): circleTheorems theorem "cyclic" with cyclic { A?, B?, C?, D? } (value ids or numbers; A and B place the quadrilateral, B chosen for the widest figure when no value gives it; C and D checked: opposite angles add to 180°), ∠A\'s arc BCD blue and ∠C\'s arc DAB yellow; and theorem "arcAngle" with arcAngle { arcs: [p, q], angle?, where } where `where` is the + − box\'s code (`{o:op}`: 1 +, 2 −): 1 draws chords AB and CD crossing at E with ∠AEC = (arc AC + arc BD) ÷ 2, 2 draws secants from P with ∠P = (far arc BD − near arc AC) ÷ 2 (arcs are [far, near]). Examples: { kind: "circleTheorems", theorem: "cyclic", cyclic: { A: "a", C: "c" } }; { kind: "circleTheorems", theorem: "arcAngle", arcAngle: { arcs: ["p", "q"], angle: "x", where: "o" } } with equation "{x}° = ({p}° {o:op} {q}°) ÷ 2" and the relation written with (3 − 2 × {o}) as the sign (see the demo: a sign read as ±1 makes the solver take the relation for a straight-line sum).',
      'Need 11 (coordinate-geometry pages): coordinatePlane `fit: true` sizes the plane to the points drawn (both points, a polygon, a rectangle): the smallest of 5, 10 and 20, up to `extent`, that holds them with a unit to spare; past `extent` it grows as before. The pages keep `extent: 20` and add `fit: true`. Example: { kind: "coordinatePlane", x: "x1", y: "y1", second: { x: "x2", y: "y2" }, segment: true, legs: true, distance: "d", extent: 20, fit: true, quadrants: 4 } (the main page\'s example draws to ±10).',
      'Need 14 (rigid-motions~symmetry, MCAS-2026-G10M-#41): no new field. transformation `symmetry: true` already finds the lines and the turn order about the corners\' average, so a parallelogram drawn from values turns about its own center off the origin: order 2, no line of symmetry. The demo slides the top 2 across: figure [[1, 1], ["r", 1], ["p", "u"], [3, "u"]] with p = r + 2 a worked-out value, center ["a", "b"] at the diagonals\' crossing, move "rotate", angle "t", symmetry: true, extent 10, quadrants 1; w 2–6 and h 1–7 keep it on the grid.',
      'Need 6 (congruence main, similarity~similar-or-not): card figure markedTriangles { triangles: [[a, b, c], [a, b, c]] (each by its sides BC, CA, AB, drawn to one scale), mirror?, ticks?: { a?, b?, c? } (counts), arcs?: { A?, B?, C? }, right?: ["C"], lengths?: true | ["b", "c"], names? }, 144 × 76. Marks mean what they say on both triangles (the harness checks equal ticks are equal sides, equal arcs equal angles, right marks 90°), so SSA and AAA cards draw two different triangles that share the marked parts. Example (SAS): { kind: "markedTriangles", triangles: [[6, 5, 4], [6, 5, 4]], mirror: true, ticks: { c: 1, a: 2 }, arcs: { B: 1 } }; the demos build the SSA pair from A = 40°, AB = 5, BC = 4 with the law of cosines.',
      'Need 5 (constructions ~bisector-steps, ~angle-bisector-steps, ~find-center; proofs main, parallel-lines~triangle-sum-proof, congruence~cpctc-proof): card figure construction { points: { A: [x, y], … } (one-letter names in a 0–100 box, y down), parts, lit?: part ids, named?: letters shown }, 104 × 104, for each sequence stage. Parts: { segment | ray | line: "AB", dashed? }, { circle: "O", through: "K" }, { compass: "A", from: "P", to: "Q" } (an arc about A from P to Q, run on 8°), { compass: "A", through: "P", span? }, { dot: "P" }, { fill: "PMR" }, { ticks: "PM", count }, { arcs: "ABC", count }, { right: "ABC" }, { text: "1", at: "AXB" | "C" }; each may carry an id, and `lit` draws those in the highlight. The harness checks compass arcs reach both ends, ticks and arcs with one count are equal, right marks are 90°, and lit ids exist. Each stage shows the construction so far with its new step lit; the demos build the points in code (arc crossings from the compass opening). Example stage: { kind: "construction", points: { A: [20, 55], B: [80, 55], P: [50, 28.5], Q: [50, 81.5] }, parts: [{ segment: "AB" }, { compass: "A", from: "P", to: "Q", id: "arcA" }], lit: ["arcA"], named: ["A", "B"] }.',
      'Need 12 (volume-derivations~cross-section-shapes): card figure solidCut { solid: "cube" | "pyramid" | "cylinder" | "cone" | "sphere", cut: "level" | "axis" | "slant" | "edges" | "corners" | "pentagon" (the last three on a cube only) }, 96 × 84: the solid in outline (hidden edges dashed), its cutting plane and the section shaded, worked out from the solid and the plane. The harness checks a slanted cut of a cylinder or cone misses the bases and, on a sort whose bins are triangle, square, rectangle or pentagon, that a flat-faced solid\'s section has that many sides. The page\'s eleven cards map one to one: e.g. { label: "Cube cut through the three corners next to one corner", bin: "triangle", figure: { kind: "solidCut", solid: "cube", cut: "corners" } }; "Sphere cut by any plane" uses cut "slant".',
      'Placed (parts by page in `uses`). Need 14 needed no new field: ~symmetry turns about its own center (H106 (10) `about: "center"`); the MCAS parallelogram would be a page of its own.',
    ].join(' '),
  },
  {
    ...ask(
      'H97',
      'venn',
      'Probability: a Venn with counts; a three-stage tree; pascalTriangle as a fraction of two counts',
      {
        'm.10.probability-rules~neither': '"counts"',
        'm.10.probability-rules~counting-probability': '"fraction"',
        'm.10.conditional-probability~venn': '"counts"',
        'm.10.conditional-probability~independent': '"third"',
      },
    ),
    status: 'placed',
    gallery: [
      'g.m10-probability-rules-neither-counts',
      'g.m10-conditional-probability-venn-counts',
      'g.m10-conditional-probability-three-stages',
      'g.m10-probability-rules-counting-fraction',
    ],
    notes:
      'P9 (docs/plans/m.10.md needs 8, 9 and 16). Three options, off unless set. `venn` `chances.counts: { total, count? }`: a, b and both are whole counts out of `total` ("All: 40" in the corner); each region shows its count, neither = total − (a + b − both) outside the circles; `count` is the shaded region’s count and `result` its chance, count ÷ total (both checked); the caption works the union and, shaded "and", P(B | A) = both ÷ a. m.10.probability-rules~neither with counts: { kind: "venn", chances: { a: "a", b: "b", both: "ab", names: ["Soccer", "Basketball"], shade: "neither", result: "P", counts: { total: "N", count: "s" } } }; m.10.conditional-probability~venn the same with shade "and" and `counts: { total: "N" }`. `treeDiagram` `chances.third: [[[c], [c]], [[c], [c]]]` adds a third stage (third[i][j] after first i and second j, the last chance left out is 1 − the others; 2 or 3 outcomes, up to 12 leaves), `thirdNames`, `thirdStage`, and `path3` with `path` lights a leaf; `chance` is then the product of the three (checked); each leaf shows its path’s product. m.10.conditional-probability~independent for three stages: { kind: "treeDiagram", chances: { first: ["a"], second: [["b"], ["b"]], third: [[["c"], ["c"]], [["c"], ["c"]]], names: [["On time", "Late"], ["On time", "Late"]], thirdNames: ["On time", "Late"], path: [0, 0], path3: 0, chance: "j" } }. `pascalTriangle` `fraction: { n, k, count?, chance? }`: C(n, k) of the fraction lit in its own colour over the triangle’s lit C(n, k), drawn as a fraction under it (C(5, 3) = 10 over C(9, 3) = 84 = 5/42 ≈ 0.119); `count` and `chance` checked. m.10.probability-rules~counting-probability: { kind: "pascalTriangle", n: "n", k: "r", fraction: { n: "a", k: "r", count: "f", chance: "P" } } in place of the slots.' +
      ' Placed (parts by page in `uses`); the fraction went on ~counting-probability through H113 (`b` and `r`, so it counts "exactly k of r").',
  },
  {
    ...ask(
      'H98',
      'unitCircle',
      'A point off the circle; two angles (A ± B); the solutions of two values',
      {
        'm.11.unit-circle~point-on-side': '"through"',
        'm.12.trig-formulas-equations': '"pair"',
        'm.12.trig-formulas-equations~difference': '"op":"difference"',
        'm.12.trig-formulas-equations~quadratic': '"also"',
      },
    ),
    status: 'placed',
    gallery: [
      'g.m12-trig-formulas-equations-pair',
      'g.m12-trig-formulas-equations-difference-pair',
    ],
    notes:
      'P10 (docs/plans/m.11.md need 6, m.12.md needs 6 and 7). Three options on `unitCircle`, off unless set (UnitCircleHs2g.tsx draws them; no handle). `through: { x, y, r? }`: the point (x, y) off the circle, the dashed circle of radius r through it, the legs x and y in the cosine and sine colours, r along the ray, θ’s arc, and the unit circle with its point (x ÷ r, y ÷ r) where the ray crosses it; `cos`, `sin`, `tan` are x ÷ r, y ÷ r, y ÷ x and `r` √(x² + y²) (checked); `angle` is not read (0), or θ’s id (checked against the point). m.11.unit-circle~point-on-side: { kind: "unitCircle", angle: 0, through: { x: "x", y: "y", r: "r" }, sin: "s", cos: "c", tan: "t", fixed: true } (example (−3, 4): r = 5, sin θ = 4/5). `pair: { a, b, op? }` (op "sum", the default, or "difference"): A’s arc from the x-axis, then B’s from A on (back for a difference) to A ± B, which is `angle` (checked); the key names A and B in their colours (theme `unitCircleAngleA`, `unitCircleAngleB`) and the caption works the formula with exact values at multiples of 15° ((√6 + √2)/4). m.12.trig-formulas-equations: add `pair: { a: "A", b: "B" }` to its picture; ~difference: `pair: { a: "A", b: "B", op: "difference" }`. `solutions.also`: a second value, both lines drawn and every angle marked in its value’s colour, the caption listing them and the count (sin x = −1/2 or 1: 210°, 330° and 90°, three solutions); `angles` may hold them all. m.12.trig-formulas-equations~quadratic: { kind: "unitCircle", angle: 0, fixed: true, solutions: { fn: "sin", value: "s1", also: "s2" } } with s₁ and s₂ the roots of a·s² + b·s + c = 0.' +
      ' Parts by page (`uses`): `pair` is placed on m.12.trig-formulas-equations and ~difference. Waiting on pages not built yet (each in `pages` with its mark, so the test checks it once built; the demos hold the specs): m.11.unit-circle~point-on-side (`through`) and m.12.trig-formulas-equations~quadratic (`solutions.also`).',
  },
  {
    ...ask(
      'H99',
      'normalCurve',
      'Statistics and complex numbers: a t curve over the normal; histogram lit range; a CLT simulation; complexPlane powers and roots; a determinant picture',
      {
        'm.11.probability-distributions~at-least': '"range"',
        'm.12.polar~de-moivre': '"power"',
        'm.12.polar~roots': '"roots"',
        'm.12.sampling-distributions~clt': '"clt"',
        'm.12.confidence-intervals~t-interval': '"t":{"df"',
        'm.12.hypothesis-testing~t-test': '"t":{"df"',
        'm.12.hypothesis-testing~paired': '"t":{"df"',
        'm.12.hypothesis-testing~two-sample': '"t":{"df"',
        'm.12.matrices~determinant': '"mode":"determinant"',
        'm.12.matrices~cramer': '"cramer"',
      },
    ),
    status: 'placed',
    gallery: [
      'g.m12-polar-de-moivre-powers',
      'g.m12-hypothesis-testing-t-curve',
      'g.m12-confidence-intervals-t-curve',
      'g.m12-matrices-determinant-expansion',
      'g.m12-matrices-cramer-determinants',
      'g.m12-matrices-determinant-two',
    ],
    notes:
      'P11 (docs/plans/m.11.md need 7, m.12.md needs 1, 5, 8, 9). Drawn part by part. (1) `complexPlane` `power` and `roots` (ComplexPowers.tsx, no handle), off unless set: `power: n` (1–12) marks z, z², …, zⁿ joined in turn by a dashed path, arg z’s arc, z and zⁿ labelled, and the caption "each power turns θ more and stretches by |z|: z⁸ = (√2)⁸(cos 360° + i sin 360°) = 16"; `roots: n` (2–12) marks the n roots on the dashed circle of radius |z|^(1/n), a regular polygon, the first root’s argument arc, z as an arrow; `result` is zⁿ or the first root (checked). m.12.polar~de-moivre: { kind: "complexPlane", z: { re: "a", im: "b" }, power: "n", result: { re: "p", im: "q" } }; m.12.polar~roots: { kind: "complexPlane", z: { re: "a", im: "b" }, roots: "n", result: { re: "p", im: "q" }, fixed: true } (the cube roots of 8i: 2 at 30°, 150°, 270°). (2) `histogram` `range: { from?, to?, total? }`, off unless set: the probability bars from k = from to to (a side left out runs to the end; bins by number for counts) lit, the caption "P(X ≥ 4) = P(4) + P(5) = 0.1563 + 0.0313 = 0.1875", `total` the sum (checked); `lit` still lights one bar. m.11.probability-distributions~at-least: { kind: "histogram", binomial: { n: "n", p: "p" }, range: { from: "k", total: "P" }, axis: "Successes (k)" } (the demo’s step writes the terms, 5 × 0.5^4 × (1 − 0.5)^1 + 1 × 0.5^5 × (1 − 0.5)^0, until the binomcdf phrase lands). (3) `histogram` `clt: { mean, n, samples, se?, seed? }` (CltHistogram.tsx, in place of data), off unless set: the population on top (wait times skewed right, exponential with σ = μ), and on the same axis the means of `samples` seeded random samples of size n as a histogram with the normal curve of mean μ and spread σ/√n over them, μ dashed; the caption gives σ/√n and the simulated means’ own mean and spread; `se` is checked, and the harness checks every mean is counted and that they average near μ. m.12.sampling-distributions~clt: values μ, n (1–100), m samples (10–2000), E = σ/√n and N = n × m; { kind: "histogram", clt: { mean: "mu", n: "n", samples: "m", se: "E" } }. (4) `normalCurve` `t: { df }`, off unless set: the t density with df degrees of freedom (solid) over the normal with the same center and scale (dashed), the standardized axis labelled t; shading, `interval`, and a test’s rejection region (invT) and p-value (tcdf) then use t, so the areas are the t ones; the caption says how the curves differ and gives t⋆ for 95%; a sign-box tail (H90) works as before. Not with `sample`, `intervals` or `chiSquare`. m.12.hypothesis-testing~t-test: { kind: "normalCurve", mean: "m", sd: "E", axis: "Sample mean x̄ (g) if H₀ is true", t: { df: "df" }, test: { stat: "t", alpha: "a", tail: "two", p: "P" }, fixed: true }; m.12.confidence-intervals~t-interval: { kind: "normalCurve", mean: "x", sd: "SE", axis: "Sample mean x̄", t: { df: "df" }, interval: { center: "x", margin: "E", level: "C" }, fixed: true }; ~two-sample the same with its df. (5) `matrixGrid` `mode: "determinant"` (MatrixDeterminant.tsx; the other modes unchanged): `matrix` 2 × 2 or 3 × 3 and `value` (D, checked). A 2 × 2 draws its two diagonals, D = ad − bc worked under it; a 3 × 3 is expanded along the first row, one small copy per entry with its row and column struck and the entry lit, "+ 2 × (3 × 4 − 2 × 1) = + 2 × 10" beside it, the sum under them; `cramer: { rhs, values?, solution? }` draws D, Dx, Dy (Dz) side by side, the replaced column lit in each, "x = Dx ÷ D = −10 ÷ (−5) = 2" (Dᵢ and the unknowns checked). I drew the cofactor expansion rather than the parallelogram of the columns: it is what the page’s steps do. m.12.matrices~determinant: { kind: "matrixGrid", mode: "determinant", matrix: [["a", "b", "c"], ["d", "e", "f"], ["g", "h", "k"]], value: "D" } in place of the table; m.12.matrices~cramer: { kind: "matrixGrid", mode: "determinant", matrix: [["a", "b"], ["c", "d"]], value: "D", cramer: { rhs: ["p", "q"], solution: ["x", "y"] } } in place of the plane (or beside it as a second picture).' +
      ' Parts by page (`uses`): placed (1) on m.12.polar~de-moivre, (4) on m.12.hypothesis-testing~t-test, ~paired, ~two-sample and m.12.confidence-intervals~t-interval, (5) on m.12.matrices~determinant and ~cramer. Waiting on pages not built yet (each in `pages` with its mark, so the test checks it once built; the demos hold the specs): m.12.polar~roots (1), m.11.probability-distributions~at-least (2) and m.12.sampling-distributions~clt (3).',
  },
  {
    ...ask(
      'H100',
      'macromolecules',
      'Biology: macromolecules and cellDivision driven by values; dnaStrand long genes; replication and gene-expression figures; observe with two rows; transport icons; a dichotomous key; bars with flows; reaction with glucose',
      {
        's.9.biomolecules~dehydration': '"kind":"macromolecules"',
        's.9.dna-protein-synthesis': '"gene":{"bases"',
        's.9.dna-protein-synthesis~replication': '"kind":"replication"',
        's.9.mitosis-meiosis~chromosome-count': '"kind":"cellDivision"',
        's.9.population-ecology~rates': '"flows"',
        's.9.population-ecology~competition': '"second"',
        's.9.biotechnology~gene-expression': '"geneExpression"',
        's.9.membrane-transport~transport-types': '"channel protein"',
        's.9.classification~key': '"dichotomousKey"',
        's.9.cellular-energy~equation': '"many":true',
      },
    ),
    status: 'placed',
    gallery: [
      'g.s9-biomolecules-dehydration',
      'g.s9-biomolecules-dehydration-long',
      'g.s9-mitosis-meiosis-chromosome-count',
      'g.s9-mitosis-meiosis-chromosome-count-human',
      'g.s9-dna-protein-synthesis-long-gene',
      'g.s9-dna-protein-synthesis-short-gene',
      'g.s9-cellular-energy-equation',
      'g.s9-population-ecology-rates-flows',
      'g.s9-population-ecology-rates-shrinking',
      'g.s9-population-ecology-competition',
      'g.s9-dna-protein-synthesis-replication',
      'g.s9-biotechnology-gene-expression',
      'g.s9-classification-key',
      'g.s9-membrane-transport-transport-types',
    ],
    notes: [
      'P12 (docs/plans/s.9.md needs 1–6, 8–10, 12; need 7 is harness phrases, need 11 is built).',
      'Need 1, `macromolecules` as a calculator picture (`typesHs2e.ts`): { kind: "macromolecules", macro: "carbohydrate" | "protein" | "nucleicAcid", count: "n", bonds?: "b", water?: "w", split?: true } draws the H31 figure from the value: 2–4 monomers drawn; past 4 the first two and the last with "…" between, the titles and "299 H₂O given off" carrying the count (three water molecules and "…"). The harness checks n whole and at least 2, and bonds = water = n − 1. s.9.biomolecules~dehydration: { kind: "macromolecules", macro: "carbohydrate", count: "n", bonds: "b", water: "w" } with the plan’s n, b, w, m, M.',
      'Need 3, `cellDivision` as a calculator picture: { kind: "cellDivision", diploid: "D", haploid?: "n", chromatids?: "X", zygote?: "Z", combinations?: "C" } draws a body cell of 2n (duplicated, as at metaphase: 2 × 2n chromatids), a gamete after meiosis (n, pairs assorted), and an egg (maternal red) and a sperm (paternal blue) joining into a zygote (n + n); up to 2n = 8 every chromosome, past 8 one pair and "× 23 pairs". The harness checks 2n even, n = 2n ÷ 2, X = 2 × 2n, Z = 2n and C = 2ⁿ. s.9.mitosis-meiosis~chromosome-count: the plan’s D, n, X, Z, C with that spec (2–100, multipleOf 2; the human 46 draws one pair).',
      'Need 2, `dnaStrand` long genes: `gene: { bases: "b", stop?: "ATT" | "ATC" | "ACT" }` (typesHs2e.ts; off unless set) draws a coding sequence of b bases (a multiple of 3, 6 or more): up to 15 all of them (the sequence’s first b − 3, then the stop), past 15 the first 12, “…” in every row, and the stop codon, with the mRNA, codons and protein (Met … Stop) under them; the caption reads b ÷ 3 codons and b ÷ 3 − 1 amino acids. The harness checks b, codons = b ÷ 3, the start AUG and a stop only at the end. s.9.dna-protein-synthesis main: { kind: "dnaStrand", sequence: "TACCGGTTCGGA", gene: { bases: "b" }, codons: "c" } (a 12-base start with no stop in it; the page’s GENE ends in one), range 6–3,000, the protein row back on.',
      'Need 9, `reaction` with glucose: `many: true` (off unless set; ignored with `limiting`) draws up to 18 molecules a formula (the harness allows 18 instead of 8), reactants in a row above and products below, each term a block about twice as wide as tall, labelled with its coefficient; C₆H₁₂O₆ is drawn as its 24-atom ring (reps/glucose.ts, checked: 6 C, 12 H, 6 O, C 4 bonds, O 2, H 1, all joined); the atoms counted per element in groups of five, = when they match. s.9.cellular-energy~equation: the plan’s spec with `many: true`, g 1–3: { kind: "reaction", reactants: [{ formula: "CO2", count: "c" }, { formula: "H2O", count: "w" }], products: [{ formula: "C6H12O6", count: "g" }, { formula: "O2", count: "o" }], atoms: { C: ["C1", "C2"], H: ["H1", "H2"], O: ["O1", "O2"] }, many: true }.',
      'Need 8, `bars` with flows: `flows: { out: ["D", "E"] }` (off unless set) reads the first bar as the start, the last as the end and each bar between as a flow, drawn as a step from the running total: green up with "+90" (in) or red down with "−40" (out, the ids in `out`), dashed on to the next step; the scale starts near the smallest total (the start and end bars cut with a break, the axis naming where it starts) so a flow a tenth of N still reads; the caption writes N₁ = N + B − D + I − E with the numbers. The harness checks the flows are not negative and the steps reach the end bar. s.9.population-ecology~rates: add `flows: { out: ["D", "E"] }` to its bars (no other change).',
      'Need 4, observe with two rows: `second: { rowLabel, initial }` on an observe page (off unless set) counts a second quantity in the same columns and unit: its bars beside the first’s (chartSecond), each tapped on its own, a row of its own in the table (the unit heads it), a key naming both rows, and `pattern(first, second)` reading both (layouts.test checks the second row’s length, range and step). s.9.population-ecology~competition: { kind: "observe", columns: ["Day 0", …, "Day 20"], rowLabel: "Species A", unit: "per mL", max: 200, step: 10, initial: [...], second: { rowLabel: "Species B", initial: [...] }, pattern: (a, b) => … } as the demo.',
      'Need 6, the replication figure: card figure `{ kind: "replication", stage: "unzip" | "pair" | "join" | "copies" }` (112 × 76, for sequence stages): the helix opened at a fork by helicase; free nucleotides pairing A–T and G–C with each old strand; DNA polymerase joining the new strand; two helices each one old strand (dark) and one new (lit). The harness checks the cards come in that order. s.9.dna-protein-synthesis~replication: add each stage’s figure as in the demo (the four stages as they are).',
      'Need 5, the gene-expression explore figure: `figure: { kind: "geneExpression" }`, scene field `gene: { control: "repressor" | "activator", signal?: boolean, lit?: "promoter" | "switch" | "gene" | "polymerase" | "protein" | "signal" | "mRNA" }`: DNA with the promoter, the switch (an operator, or an activator site) and the gene; RNA polymerase; the repressor sits on the operator and blocks it unless its signal (an inducer, lactose) pulls it off; the activator binds only with its signal; when on, mRNA peels off the polymerase reading the gene and the title says so. The harness checks every scene sets `gene` and a line saying “the gene is on/off” matches the figure. s.9.biotechnology~gene-expression: the demo’s five scenes (repressor on, lactose arrives, the promoter, no activator, activator bound).',
      'Need 12, the dichotomous key: explore figure `{ kind: "dichotomousKey", steps: [{ question, yes, no }] }` (an answer is the next question’s index or a name), drawn as a tree down the page, each question’s Yes and No indented under it, long questions wrapped; scene field `key: { specimen?, step? }` traces a name’s path from the first question (answers lit, the name filled) or rings one question. The harness checks the key is a tree (each question reached once), questions end in “?”, names differ and a scene’s specimen is in the key. s.9.classification~key: the demo’s six animals (backbone, hair, true tissues, segments, stinging tentacles) and its scenes, or the page’s own organisms.',
      'Need 10, transport card icons (layouts/icons/h2e.tsx): `simple diffusion`, `channel protein`, `carrier protein`, `aquaporin`, `protein pump`, `vesicle transport`, each a patch of bilayer (outside above) and how its particles cross. s.9.membrane-transport~transport-types: the icons on its five bins (H104 bin figures): simple diffusion, channel protein (facilitated), aquaporin (osmosis), protein pump (active), vesicle transport (bulk); the cards stay text, so the icons never give a card’s answer away.',
    ].join(' '),
  },
  {
    ...ask(
      'H101',
      'reaction',
      'Chemistry: reaction formulas from values (C_xH_y); limiting reactant from grams; an enthalpy ladder; effusion; isotope abundance; an oxidation-number tally; molecule and organic cards; hydration; atomic-model icons; mass defect',
      {
        's.10.reaction-types~combustion': '"C{x}H{y}"',
        's.10.reaction-types~synthesis': '"ions":true',
        's.10.reaction-types~replacement': '"ions":true',
        's.10.stoichiometry~limiting-grams': '"limiting"',
        's.10.thermochemistry~formation': '"mode":"ladder"',
        's.10.thermochemistry~hess': '"flipped":true',
        's.10.gas-laws~effusion': '"mode":"effusion"',
        's.10.atomic-structure~average-mass': '"mode":"isotopes"',
        's.10.atomic-structure~models': '"Bohr atom model"',
        's.10.redox~oxidation-numbers': '"mode":"oxidation"',
        's.10.molecular-shape~polarity': '"CCl4"',
        's.10.molecular-shape~imf': '"kind":"molecule"',
        's.10.molecular-shape~water': '"hydration"',
        's.10.organic~functional-groups': '"kind":"condensed"',
        's.10.organic~isomers': '"branches"',
        's.10.nuclear-chemistry~mass-defect': '"mode":"massDefect"',
      },
    ),
    status: 'placed',
    gallery: [
      'g.s10-reaction-types-combustion-general',
      'g.s10-reaction-types-replacement-ions',
      'g.s10-reaction-types-synthesis-ions',
      'g.s10-stoichiometry-limiting-grams',
      'g.s10-thermochemistry-formation',
      'g.s10-thermochemistry-hess',
      'g.s10-gas-laws-effusion',
      'g.s10-atomic-structure-average-mass',
      'g.s10-redox-oxidation-numbers',
      'g.s10-redox-oxidation-numbers-ion',
      'g.s10-nuclear-chemistry-mass-defect',
      'g.s10-molecular-shape-water-salt',
      'g.s10-molecular-shape-polarity-cards',
      'g.s10-organic-functional-groups-cards',
      'g.s10-atomic-structure-models-icons',
      'g.s10-organic-isomer-methyl',
      'g.s10-organic-isomer-dimethyl',
    ],
    notes:
      "P13 (docs/plans/s.10.md needs 1, 4–10, 13, 14), drawn part by part (types in typesHs2d.ts, checks in harness/picturesHs2d.ts, demos in galleryHs2d.ts). Every option is off unless a page sets it. Need 1, reaction formulas from values: a term's formula may name variables in braces, 'C{x}H{y}': the subscripts are the page's values, the fuel is drawn as a flat carbon chain (double or triple bonds when y < 2x + 2) and tallied from them, faded as CₓHᵧ while a value is '?'; a term's `molar` (a variable) prints its molar mass under the label and is checked against the formula; `most` (8–32) raises the molecules a term draws, the columns growing taller; `ions: true` draws an ionic compound (ZnCl₂, Al₂O₃, NaCl) as touching ions with no sticks. Example: { kind: 'reaction', reactants: [{ formula: 'C{x}H{y}', count: 'a', molar: 'M' }, { formula: 'O2', count: 'b' }], products: [{ formula: 'CO2', count: 'c' }, { formula: 'H2O', count: 'd' }], atoms: { O: ['o', 'o'] }, most: 25 } (~combustion general: x 1–8, y even ≤ 2x + 2, a = 1 if y is a multiple of 4 else 2, step phrase '1 if {y} is a multiple of 4, else 2' in phrasesHs2d.ts); ~replacement and ~synthesis add `ions: true`. Need 4, the limiting reactant from grams: `limiting` on moleMap { reactants: [{ formula, coef, mass, molarMass?, moles?, yields? } × 2], coef (the product's) }; the map's own formula, moles (the smaller yield) and mass are the product's. Two columns, grams → ÷ M → moles → × ratio → product moles; the smaller is lit and carried × M to the product's grams, the other dashed 'more than enough'; every value checked. Example: { kind: 'moleMap', formula: 'NH3', moles: 'n', mass: 'm', limiting: { coef: 2, reactants: [{ formula: 'N2', coef: 1, mass: 'm1', moles: 'n1', yields: 'y1' }, { formula: 'H2', coef: 3, mass: 'm2', moles: 'n2', yields: 'y2' }] } } (molar masses from the table to 2 decimals: 28.01 g N₂, 5.05 g H₂ → 28.38 g NH₃). Need 5, the enthalpy ladder: energyProfile mode 'ladder' { levels: [{ name, value? }] (2–5, a level's value given or following from the steps), steps: [{ from, to, value?, label?, flipped? }] (1–4), total?: the same, unit? (kJ) }: levels to scale on an H axis, step arrows with ΔH chips, a flipped step keeping a faded dashed arrow the other way ('sign flipped'), the total lit; each step checked as its levels' difference. Examples: formation { mode: 'ladder', levels: [{ name: 'Elements', value: 0 }, { name: 'CH₄ + 2 O₂', value: 'Hr' }, { name: 'CO₂ + 2 H₂O', value: 'Hp' }], steps: [{ from: 0, to: 1, value: 'Hr', label: 'Reactants' }, { from: 0, to: 2, value: 'Hp', label: 'Products' }], total: { from: 1, to: 2, value: 'dH' } }; Hess { levels: [{ name: 'C + O₂', value: 0 }, { name: 'CO + ½O₂' }, { name: 'CO₂' }], steps: [{ from: 0, to: 1, value: 'd1' }, { from: 1, to: 2, value: 'd2', flipped: true }], total: { from: 0, to: 2, value: 'dH' } }. 5b (heatingCurve q labels) is not needed: the build notes say ~heating-curve already draws against heat. Needs 6, 7, 8 and 14 are a new kind, chemDiagram (ChemDiagram.tsx and its mode files), by mode. 'effusion' { gases: [{ formula, molarMass } × 2], ratio? (checked as √(M₂ ÷ M₁)) }: two gases mixed in a glass box with a pinhole, each molecule trailing a line as long as its speed (∝ 1/√M), the escaped ones outside in the ratio of the rates, and rate bars. Example { kind: 'chemDiagram', mode: 'effusion', gases: [{ formula: 'H2', molarMass: 'M1' }, { formula: 'O2', molarMass: 'M2' }], ratio: 'r' }. 'isotopes' { element, masses: [m₁, m₂] (u), percents: [f₁] or [f₁, f₂] (f₂ checked as 100 − f₁), average? (checked), names? (default ¹⁰B, ¹¹B) }: 100 atoms, f₁ of them (rounded, said in the caption) the first isotope, with a key; a beam from one mass to the other with each percent as a weight, balanced on a pivot at the average. Example { kind: 'chemDiagram', mode: 'isotopes', element: 'B', masses: ['m1', 'm2'], percents: ['f1', 'f2'], average: 'A' }. 'oxidation' { formula (may take subscripts from values, 'H{h}SO{o}', an element with 0 left out), numbers: { element: number or variable }, charge? (default 0) }: every atom in a row with its oxidation number on a tag (the unknown one lit '?'), a bracket per element with its sum, and the sums added to the charge (checked). Examples { kind: 'chemDiagram', mode: 'oxidation', formula: 'H{h}SO{o}', numbers: { H: 1, S: 'x', O: -2 }, charge: 'q' } (the plan's x + h(+1) + o(−2) = q) and { formula: 'MnO4', numbers: { Mn: 'x', O: -2 }, charge: 'q' }. 'massDefect' { before: [{ name, mass }], after: [{ name, mass }], defect? (checked as before − after), energy? (MeV, checked as Δm × 931.5) }: two bars on a broken axis starting just under the lower one, so 0.0046 u of 238 shows, the gap bracketed with Δm and E; a page should keep the mass after below the mass before (the demo's constraint). Example { kind: 'chemDiagram', mode: 'massDefect', before: [{ name: 'U-238', mass: 'mb' }], after: [{ name: 'Th-234', mass: 'm1' }, { name: 'He-4', mass: 'm2' }], defect: 'dm', energy: 'E' }. Need 10, hydration: a `molecules` explore scene's `hydration: { ions, waters?, crystal? }` (hydrationFigure.tsx): each ion ('Na+', 'Cl-', 'Mg2+'; 1 or 2) big with its charge, ringed by 4–8 (default 6) waters turned by charge (O toward a cation, an H toward an anion), δ− and δ+ marked; `crystal` adds the salt's lattice with its corner ions pulled off. Example scene for ~water scene 3: { label: 'Salt in water', molecules: { items: [{ formula: 'NaCl' }], hydration: { ions: ['Na+', 'Cl-'], crystal: true } }, lines: [...] }. Need 9, cards: the `molecule` card figure now draws BF₃, CCl₄, CHCl₃ and CH₂O (layouts in reps/chemLayoutsHs2d.ts, looked up after chem.ts's own; no page drew these formulas before), so ~polarity and ~imf can give those cards { kind: 'molecule', formula: 'CCl4' }; a new card figure `condensed` { kind: 'condensed', formula, group } draws a condensed formula written with dashes ('CH3-C(=O)-O-CH2-CH3', the carbonyl's O above on a double bond) with its functional group lit (alcohol, acid, ester, amine, ketone, aldehyde, ether, halide; checked that the formula has it), for ~functional-groups: { label: 'Ethyl acetate, CH₃COOCH₂CH₃', bin: 'ester', figure: { kind: 'condensed', formula: 'CH3-C(=O)-O-CH2-CH3', group: 'ester' } }. 9b, branched hydrocarbons: lewisStructure hydrocarbon `branches` (main-chain positions of methyl groups, a second on one carbon drawn above; alkanes only; `carbons` is the main chain, `hydrogens` checked as 2 × (carbons + methyls) + 2), named with the lowest positions. Example { kind: 'lewisStructure', mode: 'hydrocarbon', carbons: 'n', hydrogens: 'h', branches: [2, 2] } (2,2-dimethylpropane beside pentane). Need 13, atomic model card icons (icons/h2d.tsx): 'Dalton atom model', 'Thomson atom model', 'Rutherford atom model', 'Bohr atom model', 'quantum atom model', for ~models: figure: { kind: 'icon', icon: 'Bohr atom model' } on each stage.",
  },
  {
    ...ask(
      'H102',
      'collision',
      'Physics: collision general; impulse; circularMotion satellite; vertical strobe and strobe cards; freeBody displacement; power; gasPiston energy; heatingCurve span from values; charges plates; photoelectric; a light clock',
      {
        's.11.momentum~one-after': '"type":"general"',
        's.11.momentum~impulse': '"kind":"impulse"',
        's.11.circular-gravitation~orbit': '"mode":"satellite"',
        's.11.kinematics-1d~free-fall': '"strobe":"vertical"',
        's.11.kinematics-1d~motion-diagrams': '"kind":"strobe"',
        's.11.work-energy-power~work': '"displacement"',
        's.11.work-energy-power~power': '"kind":"powerLift"',
        's.11.thermodynamics~first-law': '"energy":{"heat"',
        's.11.electrostatics~plates': '"mode":"plates"',
        's.11.electrostatics~two-charges': '"point"',
        's.11.modern-physics~photoelectric': '"kind":"photoelectric"',
        's.11.modern-physics~relativity': '"kind":"lightClock"',
      },
      'P14: docs/plans/s.11.md needs 1–12.',
    ),
    status: 'placed',
    gallery: [],
    notes: [
      'P14: docs/plans/s.11.md needs 1–12, drawn part by part.',
      "1 (~one-after): collision type 'general' with after [v₁′, v₂′] (v₁′ given, v₂′ from the momentum) and lost (the KE lost); each cart's KE is labelled. { kind: 'collision', type: 'general', masses: ['m', 'n'], before: ['v', 'w'], after: ['a', 'b'], lost: 'X' }.",
      "2 (~impulse): new kind impulse, p₀, p and Δp arrows over the force–time rectangle of area Δp; compare (s) dashes the same Δp over a longer time. { kind: 'impulse', mass: 'm', before: 'u', after: 'v', time: 't', change: 'P', force: 'F', compare: 0.2 }.",
      "3 (~orbit): circularMotion mode 'satellite' with central (M, kg), radius, speed, period, acceleration; body (a planet name or 'sun') and bodyRadius (m) draw the central body to scale. { kind: 'circularMotion', mode: 'satellite', central: 'M', radius: 'r', speed: 'v', period: 'T', body: 'earth', bodyRadius: 6.371e6 }; T needs units: ['s'].",
      "4 (~free-fall): motionGraph kinematics strobe: 'vertical' stands the strobe in a column left of the graph, + up (the slope chip moves to the empty bottom left). { kind: 'motionGraph', graph: 'speed', time: 't', acceleration: 'a', speed: 'v', start: 0, kinematics: { view: 'velocity', strobe: 'vertical' } }.",
      "5 (~motion-diagrams): card figure strobe, dots one second apart with the gaps (m) to scale, the first open, dir and ramp. { kind: 'strobe', gaps: [1, 3, 5, 7] }, { kind: 'strobe', gaps: [2, 4, 6, 8], dir: 'left' }, { kind: 'strobe', gaps: [7, 5, 3, 1.5], ramp: true }; the demo sort has the plan's six cards.",
      "6 (~work): freeBody floor option displacement (d, m) bracketed under the floor with the pull's F cos θ dashed; work names W = Fd cos θ (of the applied force, or the tension). { kind: 'freeBody', support: 'floor', mass: 'm', weight: 'G', normal: 'N', applied: 'F', appliedAngle: 'q', displacement: 'd', work: 'W' }; freeBody needs a mass, so the page adds m, F_g and F_N (7 values).",
      "7 (~power): new kind powerLift, a crate hauled up h on a rope in t, a stopwatch, and W = mgh as a bar of one-second pieces of P joules. { kind: 'powerLift', mass: 'm', height: 'h', time: 't', work: 'W', power: 'P' }; t with units: ['s'].",
      "8 (~first-law): gasPiston energy { heat, work, change } draws the first law instead of a gas law: Q in or out and W by or on the gas as bands, the piston up or down, and a Q, −W, ΔU waterfall. { kind: 'gasPiston', law: 'ideal', energy: { heat: 'Q', work: 'W', change: 'U' } } (no gas state).",
      '9 (~latent-heat): no change: heatingCurve spans already take variables (s.11.thermodynamics~latent-heat draws its melt, warm and boil spans from Q ÷ P).',
      "10 (~plates): charges mode 'plates' { kind: 'charges', mode: 'plates', voltage: 'V', gap: 'd', field: 'E', charge: 'q', force: 'F' } (q in C, F signed, E and F need scientific; F with units: ['N']). 10b (MCAS #11): two charges with point (x m from q₁) draw E₁, E₂ dashed and E there; field is signed + toward q₂. { kind: 'charges', charges: ['a', 'b'], distance: 'r', point: 'x', field: 'E' }.",
      "11 (~photoelectric): new kind photoelectric (λ in nm, φ in eV, hc = 1240 eV·nm): rays in the light's color (grey dashed outside the visible), electrons with arrows as long as their speed, none below the threshold, an E = φ + Kₘₐₓ bar and a λ strip with λ₀; drag λ. { kind: 'photoelectric', wavelength: 'l', workFunction: 'p', energy: 'E', kinetic: 'K', threshold: 'z' }.",
      "12 (~relativity): new kind lightClock: the clock at rest and moving at β, the half-tick triangle cΔt₀/2, vΔt/2, cΔt/2, γ and Δt, and a rod L₀ and L₀/γ; drag the slant for β. { kind: 'lightClock', speed: 'b', gamma: 'g', proper: 's', dilated: 't', length: 'L', contracted: 'm' }. β up to 0.99 (γ 7.09): past that the step check can't recompute γ from a 4-decimal β.",
      'Parts by page (`uses`): every part is placed, each on the page it names; part 9 needed no change. Part 10b (MCAS-2026-HSPHY-#11) is a page, s.11.electrostatics~two-charges (E₁, E₂ and E = E₁ + E₂ at a point between the charges), not only a demo. The demos (free-fall vertical, the point field) are retired: their pages draw them.',
    ].join(' '),
  },
  {
    ...ask(
      'H103',
      'earthLayers',
      'Earth and space: two seismograms by magnitude; magnetic stripes; a stream cross-section; a rising parcel; energy balance as a calculator; a reserve drawn down; spectra side by side; the rockLayers K-40 fix; mass on the H–R diagram; a carbonCycle volcano',
      {
        's.12.earth-interior~magnitude': '"mode":"magnitude"',
        's.12.earth-interior~spreading-rate': '"mode":"stripes"',
        's.12.surface-processes~discharge': '"kind":"streamChannel"',
        's.12.atmosphere-weather~cloud-base': '"mode":"parcel"',
        's.12.climate-systems': '"particles":true',
        's.12.radiometric-dating~potassium': '"second"',
        's.12.climate-systems~energy-balance': '"mode":"balance"',
        's.12.resource-management~reserves': '"kind":"reserve"',
        's.12.starlight-spectra~lines': '"kind":"spectra"',
        's.12.stellar-evolution~lifetime': '"mass":"M"',
        's.12.climate-systems~carbon-cycle': '"volcano":true',
      },
    ),
    status: 'placed',
    gallery: [
      'g.s12-earth-interior-magnitude-half',
      'g.s12-earth-interior-magnitude-far',
      'g.s12-earth-interior-spreading-fast',
      'g.s12-earth-interior-spreading-young',
      'g.s12-surface-processes-discharge-creek',
      'g.s12-surface-processes-discharge-river',
      'g.s12-atmosphere-weather-cloud-base-humid',
      'g.s12-atmosphere-weather-cloud-base-dry',
      'g.s12-climate-systems-energy-balance-ice',
      'g.s12-climate-systems-energy-balance-mars',
      'g.s12-resource-management-reserves-field',
      'g.s12-resource-management-reserves-long',
      'g.s12-stellar-evolution-lifetime-dwarf',
      'g.s12-stellar-evolution-lifetime-massive',
    ],
    notes: [
      'P15: docs/plans/s.12.md needs 2–11, drawn part by part (group H2F, demos in galleryHs2f.ts, checks in harness/picturesHs2f.ts).',
      "Need 2 (s.12.earth-interior~magnitude): `earthLayers` mode `magnitude`, { kind: 'earthLayers', mode: 'magnitude', m1: 'M1', m2: 'M2', amplitude?: 'A', energy?: 'E', fixed? }: the two seismograms to one amplitude scale (a trace too small to see says so), then a bar to each magnitude on a whole-number magnitude scale with the gap bracketed as 10^ΔM = A × the shaking; the caption works ΔM, A = 10^ΔM and E = 10^(1.5 ΔM). Drag either bar's end. The harness checks both magnitudes are 0–10 and A and E against 10^ΔM and 10^(1.5 ΔM). Relations: ΔM = M₂ − M₁, A = 10^ΔM, E = 10^(1.5 × ΔM) (demo g.s12-earth-interior-magnitude, M₁ = 4, M₂ = 6 → A = 100, E = 1,000).",
      "Need 3 (s.12.earth-interior~spreading-rate): `oceanProfile` mode `stripes`, { kind: 'oceanProfile', mode: 'stripes', distance: 'x', age: 't', rate?: 'v', full?: 'w' }: the ridge from above with its rift, the seafloor striped normal (dark) and reversed (light) from the polarity time scale (GTS2012 chrons to 12 Ma), mirrored both sides; ages along the top, km along the bottom at the half rate v = x ÷ t (the page's v when given), the rock at x km with its bracket and its twin across the ridge, the plates' arrows labeled v mm/yr, and the caption working v and w = 2v. The harness checks 0 < t ≤ 12, v = x ÷ t and w = 2v. Example: x = 100 km, t = 4 million years → v = 25 mm/yr, w = 50 mm/yr (demo g.s12-earth-interior-spreading-rate; t must stay within 0.1–12 million years).",
      "Need 4 (s.12.surface-processes~discharge): a new kind `streamChannel`, { kind: 'streamChannel', width: 'w', depth: 'd', speed: 'v', area?: 'A', discharge?: 'Q' }: the channel cut into its soil banks, in perspective and to one scale, the water's front face w × d and, shaded, the slab of water v m long that passes in one second (too thin to see on a very wide river, and the key then says so), the flow arrow labeled v, brackets for w and d, and the caption working A = w × d and Q = A × v. The harness checks w, d, v > 0, A = w × d and Q = A × v. Example: w = 12 m, d = 1.5 m, v = 0.8 m/s → A = 18 m², Q = 14.4 m³/s (demo g.s12-surface-processes-discharge).",
      "Need 5 (s.12.atmosphere-weather~cloud-base): `atmosphereLayers` mode `parcel`, { kind: 'atmosphereLayers', mode: 'parcel', temperature: 'T', dewPoint: 'Td', base?: 'h' }: temperature (across) against altitude (up), the parcel's temperature falling 10 °C per km and its dew point 2 °C per km (dashed) to where they meet at h = (T − T_d) ÷ 8 km, then together at about 6 °C per km (saturated); the cloud base dashed across the chart and a scene beside it on the same altitude scale, the parcel rising as bubbles to a cumulus cloud whose flat base is at h. The caption works h and the temperature there. The harness checks T_d ≤ T and h = (T − T_d) ÷ 8; the page needs a constraint T_d ≤ T. Example: T = 24 °C, T_d = 12 °C → h = 1.5 km, 9 °C at the base (demo g.s12-atmosphere-weather-cloud-base).",
      "Need 6 (s.12.climate-systems~energy-balance): the greenhouse figure's energy view as a calculator picture, `atmosphereLayers` mode `balance`, { kind: 'atmosphereLayers', mode: 'balance', albedo: 'a', sunlight?: 'S' (default 1,361), absorbed?: 'F', temperature?: 'T' }: space, the air and the ground as in the figure, the sunlight in (S ÷ 4, the full band) splitting into the part reflected (α of it, turned back up) and the part absorbed (F = S(1 − α) ÷ 4, into the ground), the infrared out from the ground as wide as F, each band numbered in W/m², and a thermometer at Tₑ = (F ÷ σ)^(1/4) in K and °C. The harness checks 0 ≤ α ≤ 1, F = S(1 − α) ÷ 4 and σTₑ⁴ = F. Example: S = 1,361 W/m², α = 0.3 → F = 238 W/m², Tₑ = 255 K (−18 °C) (demo g.s12-climate-systems-energy-balance).",
      "Need 7 (s.12.resource-management~reserves): a new kind `reserve` (flat, like a tape), { kind: 'reserve', reserve: 'Q', rate: 'r', years?: 'y' }: a bar as long as the reserve, bracketed and named, cut into slices of r (one a year, the cuts drawn while they stay 3 px apart), the first year's slice lit and labeled r, a years-from-now axis, and the end marked \"empty after y = Q ÷ r years\" (a last slice that is part of a year shows as one). The caption works Q ÷ r. The harness checks Q, r > 0 and y = Q ÷ r. Example: Q = 400 billion barrels, r = 12.5 billion barrels a year → y = 32 years (demo g.s12-resource-management-reserves).",
      "Need 8 (s.12.starlight-spectra~lines, NAEP-2009-12S9-#18): a new explore figure `spectra` (layouts/spectraFigure.tsx), figure { kind: 'spectra' } with a scene's `spectra: { star: ('H' | 'He' | 'Na')[], lit?: 'H' | 'He' | 'Na' }`: the star's absorption spectrum (dark lines on its rainbow, the listed elements' lines from the same table as `spectrum` `lines`) over the lab emission strips of hydrogen, helium and sodium on one wavelength scale; `lit` outlines one lab strip, fades the others and joins each of its lines up to the star, solid and ringed where the star has a line within 1 nm, dashed where it has none, with \"every line matches\" or \"0 of 7 lines match: not in the star\". Example scenes: { star: ['H', 'Na'] }, then lit 'H' (matches), 'He' (none: its 587.6 nm line sits 1.4 nm from sodium's D line, the scene's lines say so), 'Na' (matches) (demo g.s12-starlight-spectra-lines). The same need's `greenhouse` option `particles: true` on the energy view (climate's \"Ash and smoke\" scene): ash and smoke particles high in the air, one ray of sunlight turned back to space by them, named in space past the escaping infrared, and the thermometer 0.5 °C cooler (15.2 → 14.7 °C today); not with co2 'none' (the layout check says so). Example: greenhouse: { view: 'energy', co2: 'today', particles: true } (demo g.s12-climate-systems-particles). The layout checks are in harness/layoutFiguresHs2f.ts.",
      "Need 9 (s.12.radiometric-dating~bracket): the built page already uses U-235 → Pb-207, as the plan chose, so no page change there. The K-40 fix is an option for any page or demo that dates by potassium: `rockLayers` `dating.sample.second: { name, share }`, a parent that decays two ways, `share` percent of the decayed atoms drawn as the second daughter in a third color and the rest as `daughterName`, each row of the key with its share of decays and the caption splitting the count. Example: sample { parent: 'P', layer: 2, parentName: 'potassium-40', daughterName: 'argon-40', halfLives: 'n', second: { name: 'calcium-40', share: 89.3 } }: after 1 half-life, 50 potassium-40, 5 argon-40 and 45 calcium-40 (demo g.s12-radiometric-dating-potassium). Round 1's two K-40 demos (g.s12-radiometric-dating-half-life and -young in galleryHsl.ts) now pass it and their assumption says 89.3% becomes calcium-40 and 10.7% argon-40. A sample without `second` draws exactly as before. The harness checks 0 < share < 100.",
      "Need 10 (s.12.stellar-evolution~lifetime): `hrDiagram` with `mass` (a spec without temperature, told apart by its `mass` field), { kind: 'hrDiagram', mass: 'M', luminosity?: 'L', lifetime?: 't', name? }: the same H–R diagram, the star at L = M^3.5 (the page's L when given) where the drawn main sequence reaches that luminosity, in its color, with 3, 10 and 30 M☉ marked along the band (a mark within 0.8 decades of the star is left out) and the caption giving L, the temperature there and the lifetime t = 10¹⁰ ÷ M^2.5 years. Masses 0.08–50 M☉ stay on the diagram. The harness checks the mass range, L = M^3.5 and t = 10¹⁰ ÷ M^2.5. Step text: write t = 10¹⁰ ÷ M^2.5, not × M^(−2.5) (the harness reads a negative power as a negative count). Example: M = 2 → L = 11.3 L☉, about 7,960 K, t = 1.77 × 10⁹ years (demo g.s12-stellar-evolution-lifetime).",
      "Need 11 (optional; NAEP-2009-12S9-#9, NAEP-2019-12S7-#13): `carbonCycle` takes a figure option `volcano: true` (a volcanic island at the ocean's right edge rising from the seafloor over a magma chamber, lava at its crater, and a `volcanoes` arrow up the right edge to the air; the ocean's \"dissolving\" label moves 12 px in to clear it) and CarbonProcess gains 'volcano' to light that arrow. Without the option the figure draws exactly as before (the K–8 carbon-cycle pages are pixel-identical). A scene lighting 'volcano' on a figure without it fails the layout check. Example: figure { kind: 'carbonCycle', volcano: true }, scene carbon: { process: 'volcano' } (demo g.s12-climate-systems-carbon-volcano).",
      "Parts by page (`uses`): every part is placed, each on the page it names. Need 8's `particles` is on s.12.climate-systems (\"Ash and smoke\"); need 9's `second` is on s.12.radiometric-dating~potassium (a K–Ar age from the argon per potassium atom, P = 100 ÷ (1 + R ÷ 0.107)); need 11's `volcano` is on s.12.climate-systems~carbon-cycle (the fast and slow carbon cycles). The demos those pages equal (potassium, particles, carbon volcano) are retired; the rest show built pages with other values.",
    ].join(' '),
  },
  {
    ...ask(
      'H104',
      'sort',
      'Sorts: header text and bin icons (blood types, body systems, pathogens, domains, sampling methods); sort bins with figures; percentBar with a second mark',
      {
        's.9.inheritance-patterns~blood-types': '"blood type A"',
        's.9.homeostasis~systems': '"nervous system"',
        's.9.immune-disease~pathogens': '"intro"',
        's.9.immune-disease~herd-immunity': '"second":"H"',
        's.9.classification~domains': '"intro"',
        'm.11.study-design~sampling-methods': '"stratified sample"',
      },
    ),
    status: 'placed',
    gallery: [
      'g.s9-inheritance-patterns-blood-types',
      'g.s9-homeostasis-systems',
      'g.s9-immune-disease-pathogens-bins',
      'g.s9-classification-domains-bins',
      'g.m11-study-design-sampling-bins',
      'g.s9-immune-disease-herd-immunity',
      'g.s9-immune-disease-herd-immunity-measles',
    ],
    notes: [
      'P16: docs/build/s.9.md and m.11.md, "Shared needs".',
      'Part 1, header text and bin icons (layouts/types.ts, off unless set): a sort’s `intro` is a sentence above the cards; a bin’s `figure` is any card figure, drawn beside its name (kept whole beside a long name). New icons (layouts/icons/h2e.tsx): `blood type A`, `blood type B`, `blood type AB`, `blood type O` (a red cell with A wedges, B knobs, both, none); `nervous system`, `endocrine system`, `heart and blood vessels`, `respiratory system`, `excretory system`, `digestive system`. Pathogen and domain icons (hh) and sampling icons (hb) are reused. The harness wants every bin or none with a figure and no card wearing another bin’s icon; layouts.test reads `intro` at the grade level. Pages: s.9.inheritance-patterns~blood-types intro "Three alleles: Iᴬ and Iᴮ are codominant, and i is recessive to both." with bins { …, figure: { kind: "icon", icon: "blood type A" } }; s.9.homeostasis~systems intro "The nervous and endocrine systems coordinate the rest." and the six system icons; s.9.immune-disease~pathogens intro "Antibiotics work on bacteria only: they do nothing to viruses." with the virus, bacterium, fungus and parasite icons on the bins (the "A virus" icon cards can go); s.9.classification~domains intro "Viruses are not cells, so they are not placed in any domain." with the domain icons on the bins (the card icons can go); m.11.study-design~sampling-methods the five sampling icons on the bins and the plan’s sentence as intro.',
      'Part 2, sort bins with figures: the same `figure` on a bin takes any card figure, not only icons (a cellDivision card, a molecule), drawn beside the name at its own size.',
      'Part 3, `percentBar` with a second mark: `second: "H"` (a value id holding a percent; off unless set) draws that percent on the same bar as a band along its bottom in chartSecond, a dashed line through the bar and its label ("H = 80%") above the percent scale; the caption adds "The line marks H = 80%." The bar runs on past 100% for it as for the main percent; the harness checks it is not negative and fits the bar. s.9.immune-disease~herd-immunity: { kind: "percentBar", percent: "C", part: "V", whole: "P", second: "H" }.',
    ].join(' '),
  },
  {
    ...ask(
      'H105',
      'functionGraph',
      'Options the builders needed to replace stand-ins: value ids for fixed options, a "none" picture, matrixGrid rowReduce from values, reaction past 8 molecules, spectrum from a lab line value, and the rest of HS_NEEDS P17',
      {
        'm.9.regression': '"point":"k"',
        'm.9.linear-inequalities~two-variables': '"test"',
        'm.10.rigid-motions~reflect-line': '"slope":"s"',
        'm.10.probability-rules~sample-space': '"namesBySize"',
        'm.10.constructions~angle-addition': '"from":"O"',
        'm.10.proofs~exterior-angle': '"meets"',
        'm.10.quadrilaterals~rhombus': '"across"',
        'm.11.polynomial-functions': '"times":"n"',
        'm.11.complex-numbers~add-subtract': '"opFrom"',
        'm.12.matrices': '"steps":"echelon"',
        'm.12.confidence-intervals~capture': '"count":"N"',
        'm.12.inverse-trig': '"degrees":true',
        'm.12.inverse-trig~arctan': '"degrees":true',
        's.10.reaction-types~synthesis': '"most"',
        's.11.kinematics-1d~free-fall': '"acceleration":-9.8',
        's.11.kinematics-2d~cliff': '"angle":0',
        's.11.momentum~explode': '"spring":"E"',
        's.12.starlight-spectra~doppler': '"line":"rest"',
      },
    ),
    status: 'placed',
    gallery: [
      'g.m11-complex-numbers-sign-box',
      'g.s11-kinematics-1d-free-fall-number',
      'g.s11-kinematics-2d-cliff-level',
      'g.m9-linear-inequalities-test-point',
      'g.m12-inverse-trig-degrees',
      'g.m12-inverse-trig-arctan-degrees',
      'g.m12-matrices-row-reduce-typed',
      'g.m12-matrices-echelon-auto',
      'g.m10-probability-rules-names-by-size',
      'g.m10-constructions-angle-addition-rays',
      'g.m10-proofs-exterior-angle-rays',
      'g.m10-quadrilaterals-rhombus-across',
      'g.s11-momentum-explode-spring',
      'g.m12-matrices-determinant-none',
    ],
    notes:
      'P17: docs/HS_NEEDS.md lists each option; docs/build/<plan>.md says which page uses a stand-in until it lands. Drawn part by part, each off unless a page sets it. (1) `scatter` `residualOf.point` may be a value id holding the point number k, counted from 1 (a number stays the 0-based index): that point’s residual is lit and worked in the caption, "Point 3 (3, 61): predicted 62, residual 61 − 62 = −1"; "?" lights none; the harness checks k is a whole number naming a point and the residual. m.9.regression: add k (`allowed` 1–8) and e = y_k − (m·x_k + b); { kind: "scatter", …, residualOf: { point: "k", residual: "e" } }. (2) `functionGraph` polynomial by zeros: a zero’s `times` may be a value id (a whole number 1 to 9, checked), so the multiplicity is typed; the formula shows (x + 2)ⁿ’s power, "^?" while it is "?". The curve is now the product itself (the expanded coefficients lost a repeated zero’s sign), and a turn on the x-axis is taken at the zero. m.11.polynomial-functions: add n (`allowed` 1–4) and y = a(x − r₁)ⁿ(x − r₂)(x − r₃); zeros: [{ x: "r1", times: "n" }, { x: "r2" }, { x: "r3" }]. (3) `complexPlane` `opFrom`: a value holding the sign box’s code, 1 sum, 2 difference (3 product), or a ±1 sign value (−1 difference, as `~add-subtract` stores `sg`), in place of `op`; while "?" w is drawn with no result; the harness checks the code and the result by it. m.11.complex-numbers~add-subtract: { kind: "complexPlane", z: { re: "a", im: "b" }, w: { re: "c", im: "d" }, opFrom: "sg", result: { re: "p", im: "q" } } (C and D, ±c and ±d, can stay as values or go). (4) `transformation` reflect `slope`: a value holding 1 or −1 picks the mirror y = x or y = −x (the spec’s `mirror` stands while it is "?"); checked to be ±1. m.10.rigid-motions~reflect-line: add s (`allowed` [−1, 1]) and x′ = s·y, y′ = s·x; { kind: "transformation", figure: [["ax", "ay"], [4, 4], [2, 4]], move: "reflect", mirror: "y = −x", slope: "s", image: { x: "px", y: "py" }, extent: 6 }. (5) Numbers for fixed values: `motionGraph` speed graph `acceleration` may be a number (free fall’s −9.8, in the speed’s unit per time unit), drawn by the Grades 9–12 v–t graph (MotionGraphHs, `kinematics` defaulting to the velocity view) with "a = −9.8 m/s²" and no value; `projectile` `angle` may be a number (0 for a level launch): no handle. s.11.kinematics-1d~free-fall: drop the fixed a and write v = −9.8t; { kind: "motionGraph", graph: "speed", time: "t", acceleration: −9.8, speed: "v", start: 0, kinematics: { view: "velocity" } }. s.11.kinematics-2d~cliff: drop θ and its fixed rule; { kind: "projectile", speed: "v", angle: 0, height: "h", time: "T", range: "R" }. (6) `linearFunction` `test: { x, y }` (as `lineSystem.test`): the point solid when it satisfies the shaded inequality, hollow when not, and the caption works it, "Test (1, 0): 2 × 1 − 3 = −1, and 0 ≥ −1 is true · It is a solution"; checked to have a `shade`. m.9.linear-inequalities~two-variables (and ~two-variables-below): add test: { x: "tx", y: "ty" } (yl and h stay picture labels). (7) `normalCurve` `intervals.count` may be a value (20 to 100, whole; none drawn while "?"). m.12.confidence-intervals~capture: add N (`allowed` [20, 50, 100]) and K = N × C; intervals: { count: "N", n: "n", level: "C" }. (8) `functionGraph` arcsin, arccos, arctan `degrees: true`: the angle axis in degrees (±90°, 0–180°), the range and traced point in degrees, no π labels. m.12.inverse-trig: { kind: "functionGraph", family: "arcsin", degrees: true, at: { x: "x", y: "A" }, marks: ["domain", "range"], axes: { x: "x", y: "A (°)" } } in place of a: 180/π; ~arctan the same with family "arctan". (9) `matrixGrid` rowReduce `steps: "echelon" | "reduced"` works the row operations out from the values, as a lesson does column by column (a zero pivot swapped with a row below, a 1 below swapped up; "echelon" clears under each pivot and scales pivots to 1 last, "reduced" scales first and clears above and below); a row of zeros is read out, 0 = 0 (infinitely many) or 0 = k (none); the harness checks the pivots are 1 with zeros under (and beside, reduced) and the solution in every matrix. On m.12.matrices’ system "echelon" gives exactly the page’s five operations, so the coefficients can become values (within the 10-value limit: a 2 × 2 system with all six entries typed, or the 3 × 3 with a few). m.12.matrices: steps: "echelon" in place of the list; a typed 2 × 2: { kind: "matrixGrid", mode: "rowReduce", system: [["a", "b", "p"], ["c", "d", "q"]], steps: "reduced", solution: ["x", "y"] }. (10) `treeDiagram` `namesBySize: { 2: ["H", "T"], 3: ["R", "G", "B"], 4: ["1", "2", "3", "4"] }`: the names for any stage of that many outcomes (before `names` and the defaults); checked to be as many as the size and all different. m.10.probability-rules~sample-space: add it (the assumption can then say H and T). (11) `markedFigure` points on rays: a point may be { from: "O", angle: "a", length? } (on the ray from O at a degrees, counterclockwise from the right; length default 4) or { from: "B", angle: "b", meets: { from: "C", angle: "d" } } (where two rays meet: a triangle from its angles); placed after the coordinate points; "?" or rays that never meet draw faded with the reason; angle labels are checked as before. m.10.constructions~angle-addition: points: { O: [0, 0], A: { from: "O", angle: 0 }, B: { from: "O", angle: "a" }, C: { from: "O", angle: "c" } }, rays OA, OB, OC, labels AOB a, BOC b (c up to 180°). m.10.proofs~exterior-angle: points: { B: [0, 0], C: [9, 0], D: [12, 0], A: { from: "B", angle: "b", meets: { from: "C", angle: "d" } } }, segments AB, BC, CA, CD dashed, labels BAC a, ABC b, ACB c, ACD d. (12) `markedFigure` `quadrilateral: { family: "rhombus", across: [p, q] }`: the rhombus from its diagonals AC (level) and BD (in place of width and angle); with `diagonals` the halves and the right angle at O. m.10.quadrilaterals~rhombus: { kind: "markedFigure", quadrilateral: { family: "rhombus", across: ["p", "q"], diagonals: true, labels: { AB: "s", AO: "hp", BO: "hq" } } } (p, q, K under the picture). (13) `collision` explode `spring`: the value of the spring’s energy (kinetic energy after − before), named between the carts in the before row and in the caption; checked. s.11.momentum~explode: spring: "E" (E then leaves pictureLabels). (14) `spectrum` `lines.line: "rest"`: the reference line is the element’s line nearest the `rest` value, so a page can take any Balmer line; the rest value is checked to be that line. s.12.starlight-spectra~doppler: add λ₀ r (`allowed` 410.2, 434.0, 486.1, 656.3) and z = (λ − λ₀) ÷ λ₀; lines: { element: "H", mode: "absorption", redshift: "z", velocity: "v", rest: "r", line: "rest" }. (15) Already covered by group H2D (H101 part 1), no second option: `reaction` `most` (8 to 32 molecules a term) and `ions: true` (ZnCl₂, Al₂O₃ as ions); and H2E’s `many` (up to 18 a formula). s.10 balancing pages: most: 16 (or as needed), ions: true for the ionic ones. (16) Already covered by group H2E (H104): sort bins take `figure` (a card figure, usually an icon), and the sampling icons exist (group HB: "simple random sample", "stratified sample", "cluster sample", "systematic sample", "convenience sample"). m.11.study-design~sampling-methods: bins[i].figure: { kind: "icon", icon: "stratified sample" } and so on. (17) A `none` kind: { kind: "none" } draws nothing and the module page leaves out the picture section (header and sliders), so an equation-only page opens on its values; the lesson summary names no picture. m.12.matrices~determinant (until it takes H99’s determinant picture) or any page whose plan says "no picture": representation: { kind: "none" }, no pictureLabels.' +
      ' Placed (parts by page in `uses`); (15) and (16) went on through H101 and H104. (17) `none` is on no page yet (no plan says "no picture"); m.12.matrices keeps its fixed system (typed coefficients are lesson work).',
  },

  {
    ...ask(
      'H106',
      'functionGraph',
      'Math options for the reviewed and added pages: functionGraph in base units (unit menus back on), two curves on one graph, the power family a·x^(p/q), a log-sum curve; lineSystem with a parabola; polygon apothem; one-event venn; a table with its graph and best point; a population region; symmetry about a center; rectangle measurement bounds; 3-D axes with u, v, u × v; polarGrid conic curves; a rotated conicGraph; functionGraph Riemann rectangles and rational by coefficients; termsChart squares; an F curve on normalCurve',
      {
        'm.9.quadratic-functions~projectile': '"unitsOf"',
        'm.9.function-notation~transform': '"transform"',
        'm.9.inequality-systems~nonlinear': '"square"',
        'm.9.units-precision~bounds': '"bounds"',
        'm.10.quadrilaterals~regular-area': '"apothem"',
        'm.10.probability-rules~complement': '"one":true',
        'm.10.rigid-motions~symmetry': '"about":"center"',
        'm.10.modeling-density~can-design': '"best":"min"',
        'm.10.modeling-density~fence': '"best":"max"',
        'm.10.modeling-density~population': '"population"',
        'm.11.radical-functions~rational-exponent': '"family":"power"',
        'm.11.exp-log-equations~two-logs': '"family":"logSum"',
        'm.12.vectors-3d': '"space"',
        'm.12.vectors-3d~cross': '"space"',
        'm.12.vectors-3d~triple': '"space"',
        'm.12.vectors-3d~distance': '"space"',
        'm.12.polar-conics': '"shape":"conic"',
        'm.12.polar-conics~sine': '"shape":"conic"',
        'm.12.polar-conics~rotation': '"conic":"turned"',
        'm.12.polar-conics~rotated-equation': '"conic":"turned"',
        'm.12.partial-fractions': '"top"',
        'm.12.partial-fractions~repeated': '"top"',
        'm.12.partial-fractions~quadratic': '"quadratics"',
        'm.12.area-under-curve': '"riemann"',
        'm.12.area-under-curve~line': '"riemann"',
        'm.12.induction~squares': '"type":"power"',
        'm.12.anova': '"f":{',
        'm.12.anova~groups': '"f":{',
        'm.12.anova~two-variances': '"tailsFrom"',
      },
      'P18: docs/HS_NEEDS.md; the build notes docs/build/m.9.md–m.12.md and s.11.md ("Shared needs") say what each page shows and which values drive it.',
    ),
    status: 'placed',
    gallery: [
      'g.m9-quadratic-functions-projectile-units',
      'g.s11-oscillations-units',
      'g.s11-oscillations-hooke-units',
      'g.m9-function-notation-transform-square',
      'g.m9-function-notation-transform-root',
      'g.m11-exp-log-equations-two-logs-curve',
      'g.m11-exp-log-equations-two-logs-curve-plus',
      'g.m9-inequality-systems-nonlinear',
      'g.m9-inequality-systems-nonlinear-shaded',
      'g.m10-quadrilaterals-regular-area-apothem',
      'g.m10-quadrilaterals-regular-area-apothem-12',
      'g.m10-probability-rules-complement-one-event',
      'g.m10-modeling-density-can-design-graph',
      'g.m10-modeling-density-fence-graph',
      'g.m10-modeling-density-population-map',
      'g.m10-modeling-density-population-map-small',
      'g.m10-rigid-motions-symmetry-center',
      'g.m10-rigid-motions-symmetry-center-quarter',
      'g.m9-units-precision-bounds-band',
      'g.m9-units-precision-bounds-fine',
      'g.m12-vectors-3d-angle',
      'g.m12-vectors-3d-cross-axes',
      'g.m12-vectors-3d-triple-box',
      'g.m12-vectors-3d-distance-axes',
      'g.m12-polar-conics-ellipse-curve',
      'g.m12-polar-conics-hyperbola-curve',
      'g.m12-polar-conics-sine-parabola-curve',
      'g.m12-polar-conics-rotation-turned',
      'g.m12-polar-conics-rotation-turned-hyperbola',
      'g.m12-polar-conics-rotated-equation-turned',
      'g.m12-area-under-curve-rectangles',
      'g.m12-area-under-curve-rectangles-many',
      'g.m12-area-under-curve-line-rectangles',
      'g.m12-partial-fractions-quadratic-graph',
      'g.m12-partial-fractions-number-top-graph',
      'g.m12-partial-fractions-repeated-top-graph',
      'g.m12-induction-squares-chart',
      'g.m12-induction-squares-chart-far',
      'g.m12-anova-f-curve',
      'g.m12-anova-groups-f-curve',
    ],
    notes:
      'P18: docs/HS_NEEDS.md; the build notes docs/build/m.9.md–m.12.md and s.11.md ("Shared needs") say what each page shows and which values drive it. Drawn part by part (round 3, group B); every option is off unless a page sets it. (1) `functionGraph` `unitsOf: { x, y }`, the model for the Units rule: the ids of the values whose shown units the axes take. Every family parameter is read once in the formula\'s units (where the relations hold) and the curve converted to the shown units, Y = f(fₓ·X) ÷ f_y, written back as the same family (h(t) = −4.9t² + 19.6t + 2 in m becomes −16.08t² + 64.3t + 6.56 in ft); ticks, formula, marks and the traced point are in the shown units and each axis name gets its unit ("Time t" → "Time t (s)"). Drags convert back by the same factor; the harness checks the traced point and marks in formula units and the drawn curve against the converted one. The pages can then drop their pinned units (`units: […]`, `unitSystems: [\'metric\']`). m.9.quadratic-functions~projectile: axes: { x: "Time t", y: "Height h" }, unitsOf: { x: "t", y: "H" }. s.11.oscillations: axes: { x: "Time t", y: "Position x" }, unitsOf: { x: "T", y: "A" }; ~hooke: axes: { x: "Stretch x", y: "Force F" }, unitsOf: { x: "x", y: "F" }. (2) Two curves on one graph, `transform: { a?, h?, k?, name?, from?, image? }`: the family is f and g(x) = a·f(x − h) + k is drawn beside it in the second colour, its legend "g(x) = 2f(x − 3) + 1 = 2(x − 3)² + 1"; an arrow carries f\'s point at `from` (default its vertex or start) to its image, both labelled; `image` values checked; no crossings marked. (`other` still draws any second function with the crossings.) m.9.function-notation~transform: { kind: "functionGraph", family: "quadratic", form: "vertex", h: 0, k: 0, transform: { a: "a", h: "h", k: "k", from: "p", image: { x: "X", y: "Y" } } } (or family "root", "absolute", "exponential", "log"). (3) The power family, `family: "power"`, a·(x − h)^(p/q) + k with whole p ≠ 0 and q 1 to 12 (checked), p/q in lowest terms: an odd q takes the real root of a negative x, an even q starts at x = h, a negative p has the asymptotes x = h and y = k. m.11.radical-functions~rational-exponent: { kind: "functionGraph", family: "power", a: "a", p: "p", q: "q", at: { x: "x", y: "y" }, marks: ["vertex", "asymptotes", "domain"] }. (4) The log sum, `family: "logSum"`, log_b(x) + log_b(x + c) (natural logs without b), from x > max(0, −c) with its asymptote there; with `reject` a candidate outside the domain is crossed out on the x-axis, "x = −1 rejected" (checked outside the domain). m.11.exp-log-equations~two-logs: { kind: "functionGraph", family: "logSum", b: "b", c: "c", other: { family: "linear", m: 0, b: "y" }, crossing: { x: "x1", y: "y" }, reject: "x2", marks: ["asymptotes"] }. (5) `lineSystem` with a parabola: a `lines` entry with `square` (its x² coefficient) is y = ax² + mx + b, drawn as a curve with its vertex; the crossings from (a₁ − a₂)x² + (m₁ − m₂)x + (b₁ − b₂) = 0 (none, one or two) ringed and labelled, the equation set equal in the caption; `shade` and `test` work as for lines; `solutions` lists the worked-out crossings (checked on both, left to right). m.9.inequality-systems (nonlinear): { kind: "lineSystem", lines: [{ square: "a", slope: "p", intercept: "q", shade?: "≥" }, { slope: "m", intercept: "k", shade?: "<" }], solutions: [{ x: "x1", y: "y1" }, { x: "x2", y: "y2" }], extent: 10 }. (6) `polygon` with `apothem` (and `sides`, `side`): the regular polygon on a flat side, the n triangles from the center, the bottom one tinted, the apothem square to that side and labelled; `angle` marks θ = 180° ÷ n at the center; `area` with `around` works K = ½ × a × P in the caption; checked in formula units (a = s ÷ (2 tan θ)). The perimeter check is now relative, so `around` can go under it. m.10.quadrilaterals~regular-area: { kind: "polygon", sides: "n", side: "s", apothem: "a", angle: "t", around: "P", area: "K" }. (7) One-event `venn`: `chances.one: true` draws circle A alone in the rectangle, P(A) inside and P(not A) outside (`shade: "notA"` lights it); pass b: 0 and both: 0 (checked). m.10.probability-rules~complement: drop b and ab; { kind: "venn", chances: { a: "a", b: 0, both: 0, names: ["Rain", "Wind"], shade: "notA", result: "s", one: true } }. (8) `table` with its graph: `graph: { best: "min" | "max" }` draws under the table the output against the swept value, worked out by the module\'s relations with the parameters held (the curve, the rows as dots, the current row lit) and the least or greatest point ringed and labelled; `rowsFrom: "shown"` hands the `rows` function the values in the menu\'s units, so its 1-2-5 steps are round in the unit shown and the unit menu can stay. m.10.modeling-density~can-design: { kind: "table", sweep: "r", output: "S", params: ["V"], rows: canRows, graph: { best: "min" }, rowsFrom: "shown" } (its `units` pins can go); ~fence the same with sweep "x", output "A", params ["P"], best "max". (9) Population density: `circle` `population: { people, density? }`: a town\'s irregular outline (exactly the circle\'s area) on a grid of the radius\'s unit, the people as dots (one dot for a round number, said under the map), the model circle of radius r dashed over it, and the caption A = πr², D = N ÷ A (checked in formula units). m.10.modeling-density~population: { kind: "circle", radius: "r", area: "A", extent: 4, population: { people: "N", density: "D" } } (N and D can leave pictureLabels). (10) Symmetry about a center: `transformation` `about: "center"` turns (or dilates) about the corners\' average, the center `symmetry` uses, so the page needs no center values; the center is labelled and each corner joined through it to its partner straight across (point symmetry), halves ticked, the caption saying whether every corner has one. Round 2\'s `symmetry: true` already turned about the figure\'s center with the page\'s a, b; with this the hidden a, b and their rules go. m.10.rigid-motions~symmetry: drop a and b; { kind: "transformation", figure: [[1, 1], ["r", 1], ["r", "u"], [1, "u"]], move: "rotate", angle: "t", about: "center", symmetry: true, extent: 10, quadrants: 1 }. (11) `rectangle` `bounds: { error, least?, greatest? }`: the measured rectangle with (l − e) by (w − e) dashed inside and (l + e) by (w + e) dashed outside, to scale about one center, the band between shaded; when the band is under 8 px a close-up of the corner shows the three edges e apart; the areas checked. m.9.units-precision~bounds: { kind: "rectangle", length: "l", width: "w", inside: "A", extent: 10, bounds: { error: "e", least: "lo", greatest: "hi" } }. (12) 3-D axes: `vectorDiagram` `space` (vectors take a `z`; x, y, z axes seen from above, a turn handle spins the view about z, tips dropped dashed to the floor): `dot`, `angle` (the arc between u and v), `cross` { x, y, z } (u × v square to the shaded parallelogram), `area`, `triangle`, `w` (a third vector: the slanted box) with `triple` and `volume`, and `points: true` (P and Q, the segment, its Δx, Δy, Δz legs, `distance`, `mid`); all checked. m.12.vectors-3d: { kind: "vectorDiagram", vectors: [{ name: "u", x: "a", y: "b", z: "c" }, { name: "v", x: "d", y: "e", z: "f" }], space: { dot: "p", angle: "t" } }; ~cross: space: { cross: { x: "x", y: "y", z: "z" }, area: "A", triangle: "Tri" }; ~triple: space: { w: { name: "w", x: "g", y: "h", z: "k" }, triple: "T", volume: "Vol" }; ~distance: vectors P (p, q, r) and Q (s, t, u), space: { points: true, distance: "d", mid: { x: "mx", y: "my", z: "mz" } }. (13) `polarGrid` `curve: { shape: "conic", k, m?, n, fn?, e?, d? }`: r = k ÷ (m − n cos θ) as the page types it (fn "sin" for ~sine), the focus at the pole, the directrix dashed (x = −k ÷ n), the vertices, and with `point` PF and PD drawn and PF ÷ PD = e worked; the point drags along the curve (θ only); e and d checked. m.12.polar-conics: { kind: "polarGrid", curve: { shape: "conic", k: "k", m: "m", n: "n", e: "e", d: "d" }, point: { r: "r", theta: "t" } } (drop `fixed`); ~sine the same with fn: "sin". (14) `conicGraph` `conic: "turned"`, `A, B, C, F?` (F defaults to −1, the page\u2019s = 1): Ax² + Bxy + Cy² = 1 with the x′, y′ axes at θ (tan 2θ = B ÷ (A − C)), the angle marked, the equation A′x′² + C′y′² = 1 and the ellipse\u2019s half-axes, the hyperbola\u2019s asymptotes or two parallel lines; `angle`, `turned: { A, C }` and `discriminant` checked. ~rotation: { kind: "conicGraph", conic: "turned", A: "A", B: "B", C: "C", angle: "t", discriminant: "D" }; ~rotated-equation: the same with turned: { A: "P", C: "Q" } (no discriminant value there). (15) `functionGraph` `riemann: { n, to, from?, side?, sum? }`: n equal rectangles from `from` (0) to `to`, read at the right edge (or "left", "middle"), the point each height is read at, one stepped outline past 60; the caption gives n, the width and S; `sum` checked; the window holds every rectangle. m.12.area-under-curve: add riemann: { n: "n", to: "b", sum: "S" } to its graph (the exact-area shade stays); ~line the same. (16) Rational by coefficients: H94\u2019s (px + q) ÷ (rx + s) is linear over linear, so ~quadratic needed more: `family: "rational", top: [..] (coefficients, highest first, up to x²), poles: [..], quadratics?: [{ j, k }]` draws the top over (x − p)… (x² + jx + k)…, so a number alone on top and complex zeros on top or below are drawn (asymptotes, holes, zeros as before; no handles). ~quadratic: { kind: "functionGraph", family: "rational", top: ["a", "b", "c"], poles: ["p"], quadratics: [{ j: "j", k: "k" }], at: { x: "x", y: "y" }, marks: ["asymptotes"] }. The main page and ~repeated can use top: ["a", "b"], poles: ["p", "q"] (or ["p", "p"]) and drop the hidden z and L. (17) `termsChart` `type: "power"`: aₙ = first × nᵖ with p = `step` (the squares for 2), terms labelled n², the sum of squares (or cubes) worked by formula; with `far` past 30 terms. m.12.induction~squares: { kind: "termsChart", type: "power", first: 1, step: 2, count: "n", as: "bars", sums: true, sum: "S", far: true }. (18) `normalCurve` `f: { df1, df2, stat?, alpha?, p?, tails? }`: the F curve in place of the normal one, the p-value past F shaded and labelled (`tails: "two"` doubles the smaller tail and shades both), the critical value(s) for α dashed with the rejection region tinted, the decision in the caption; p checked; statMath now exports betaI and lnGamma (fCurve.ts), so the grade file\u2019s copy can go. m.12.anova: { kind: "normalCurve", f: { df1: "d1", df2: "d2", stat: "F", alpha: "a", p: "P" } }; ~groups: df1: 2, df2: "d2"; ~two-variances: tails: "two".' +
      ' Parts by page (`uses`): every part is placed but (3); (1) is on ~projectile only (H107\'s oscillator replaced the s.11 graphs), (18)\'s ~two-variances through H112 (`tailsFrom`). Waiting on pages not built yet (each in `pages` with its mark, so the test checks it once built; the demos hold the specs): m.11.radical-functions~rational-exponent (`family: "power"`).',
  },
  {
    ...ask(
      'H107',
      'torque',
      'Physics for the added skills: torque on a wrench, a rotor (hoop, disk, ball), an oscillator (spring and x–t trace), a pendulum by length, a capacitor, the lever as a seesaw, equipotentials round a charge, a charge accelerated between plates, induction on a moving charge',
      {
        's.11.rotation': '"kind":"torque"',
        's.11.rotation~seesaw': '"seesaw"',
        's.11.rotation~angular-speed': '"kind":"rotor"',
        's.11.rotation~angular-acceleration': '"kind":"rotor"',
        's.11.rotation~rotational-inertia': '"kind":"rotor"',
        's.11.oscillations': '"kind":"oscillator"',
        's.11.oscillations~hooke': '"mode":"hang"',
        's.11.oscillations~pendulum': '"kind":"pendulum"',
        's.11.electric-potential': '"equipotentials"',
        's.11.electric-potential~voltage-energy': '"launch"',
        's.11.electric-potential~capacitor': '"kind":"capacitor"',
        's.11.electric-potential~parallel-plate': '"dielectric"',
        's.11.electromagnetism~moving-charge': '"mode":"charge"',
        's.11.electromagnetism~charge-circle': '"radius"',
      },
      'P19: docs/build/s.11.md, "Added skills" and "Shared needs (pictures)".',
    ),
    status: 'placed',
    gallery: [
      'g.s-11-rotation-wrench',
      'g.s-11-rotation-door',
      'g.s-11-rotation-seesaw',
      'g.s-11-rotation-seesaw-far',
      'g.s-11-rotation-angular-acceleration',
      'g.s-11-rotation-angular-acceleration-reverse',
      'g.s-11-rotation-angular-speed',
      'g.s-11-oscillations-spring',
      'g.s-11-oscillations-spring-stiff',
      'g.s-11-oscillations-hooke-hang',
      'g.s-11-oscillations-pendulum',
      'g.s-11-oscillations-pendulum-moon',
      'g.s-11-electric-potential-capacitor',
      'g.s-11-electric-potential-parallel-plate',
      'g.s-11-electric-potential-dielectric',
      'g.s-11-electric-potential-equipotentials',
      'g.s-11-electric-potential-unlike',
      'g.s-11-electric-potential-launch',
      'g.s-11-electric-potential-launch-proton',
    ],
    notes: [
      'P19: docs/build/s.11.md, "Added skills" and "Shared needs (pictures)", drawn part by part (types in typesHs3a.ts, drawings in reps/Torque.tsx, Seesaw.tsx, Rotor.tsx, Oscillator.tsx, Pendulum.tsx, Capacitor.tsx, ChargesPotential.tsx, PlatesLaunch.tsx, MovingCharge.tsx with hs3aKit.tsx and hs3aMath.ts, checks in harness/picturesHs3a.ts, demos in galleryHs3a.ts). Every picture reads its values in the formula\'s units (rep.val, the harness through siOf) and labels them in the unit shown, so the pages keep their unit menus. Every option is off unless a page sets it.',
      "1 (s.11.rotation): new kind torque, a wrench on its nut (or body: 'door', a door from above on its hinge), the arm r bracketed, F at θ to the arm, its parts along (dashed grey) and across (F⊥, dashed), and τ as a curved arrow round the pivot, its sweep ∝ sin θ; drag F's tip for θ. { kind: 'torque', arm: 'r', force: 'F', angle: 'a', across: 'p', torque: 't' } (checked: F⊥ = F sin θ, τ = rF sin θ, θ from 0° to 180°); the page's pictureLabels can go.",
      "2 (~seesaw): simpleMachine lever option seesaw: { torque?, pivot? }: a plank on its pivot, the weights F₁ (load, at loadArm d₁) and F₂ (effort, at effortArm d₂) as crates sized by weight at their distances to scale, their pushes down and the pivot's Fₚ up on one scale, F₁d₁ and F₂d₂ as opposite curved arrows. { kind: 'simpleMachine', machine: 'lever', load: 'W', loadArm: 'l', effortArm: 'e', effort: 'F', seesaw: { torque: 't', pivot: 'P' } } (checked: τ = F₁d₁ = F₂d₂, Fₚ = F₁ + F₂); pictureLabels can go.",
      "3 (~rotational-inertia, ~angular-acceleration, ~angular-speed): new kind rotor, a hoop, solid disk or solid ball by shape c (1, 0.5, 0.4; a spoked wheel with no shape), r, ω as a curved arrow as long as its size (ω₀ dashed inside), τ at the rim, the values beside it. ~rotational-inertia: { kind: 'rotor', shape: 'c', mass: 'm', radius: 'r', inertia: 'I', torque: 't', acceleration: 'a', compare: true } (compare: the three shapes with their I and α for the same m, r, τ, the chosen one ringed; checked I = cmr², τ = Iα). ~angular-acceleration: { kind: 'rotor', start: 'u', acceleration: 'a', time: 't', speed: 'w', angle: 'd', turns: 'n' } (an ω–t line whose area is Δθ, and n as turn dials, whole turns full and the last a slice, up to 20 then counted in bigger steps; checked ω = ω₀ + αt, Δθ = ω₀t + ½αt², n = Δθ/2π). ~angular-speed: { kind: 'rotor', radius: 'r', rpm: 'N', speed: 'w', period: 'T', rim: 'v' } (checked ω = 2πN/60, T = 2π/ω, v = rω). pictureLabels can go.",
      "4 (s.11.oscillations, ~hooke): new kind oscillator. Default mode: a block on a spring on a frictionless floor, the rest line and ±A, the block at position x (default A/2) and a faded one through the middle with v_max, beside the x–t trace over two periods (T bracketed, the moment dotted), and one bar split into ½kx² and ½mv² adding to E. { kind: 'oscillator', mass: 'm', spring: 'k', amplitude: 'A', period: 'T', frequency: 'f', angular: 'w', top: 'v', energy: 'E' } (checked T = 2π√(m/k), f, ω, v_max = Aω, E = ½kA²); the main page's period can take its unit menu back. mode 'hang': a spring hung from a beam, its unstretched end dashed, stretched x to the scale of the F–x line beside it, kx up and mg down, the triangle U. { kind: 'oscillator', mode: 'hang', mass: 'm', stretch: 'x', spring: 'k', force: 'F', energy: 'U' } (g 9.8 default; checked F = mg, k = mg/x, U = ½kx²); ~hooke's F and x can take their unit menus back.",
      "5 (~pendulum): new kind pendulum (not an energyTrack option: that one needs height, PE and KE the page doesn't have): a bob on a string of length L to the scale of a meter rule beside it, swinging swing° (default 10, at most 20) each way along a dashed arc, g named (Earth, the Moon, Mars, Jupiter), T as a bar on a strip of seconds; drag the bob for L. { kind: 'pendulum', length: 'L', gravity: 'g', period: 'T', frequency: 'f' } (checked T = 2π√(L/g), f = 1/T); pictureLabels can go.",
      "6 (~capacitor, ~parallel-plate): new kind capacitor: plates on a battery, +Q on the + side and −Q on the other, the even field, a glassy slab with its faces charged the other way when κ > 1, and the Q–V line whose triangle is U = ½CV². C counts in `farads` F (1e-6 for μF, 1e-12 for pF; Q in the same prefix), the gap in `meters` m (1e-3 for mm). ~capacitor: { kind: 'capacitor', capacitance: 'C', voltage: 'V', charge: 'Q', energy: 'U', farads: 1e-6 }; ~parallel-plate: { kind: 'capacitor', dielectric: 'k', area: 'A', gap: 'd', meters: 1e-3, capacitance: 'C', voltage: 'V', charge: 'Q', farads: 1e-12 } (checked Q = CV, U = ½CV², C = κε₀A/d with ε₀ = 8.85 × 10⁻¹² as the page writes it). pictureLabels can go.",
      "7 (s.11.electric-potential): charges option equipotentials: { potential?, test?, energy? } with one charge: dashed circles at r/2, r and 2r labelled 2V, V and V/2 (V = kq/r, q in μC), field lines out of + or into −, and q₀ on the circle at r with U = q₀V; drag q₀ for r. { kind: 'charges', charges: ['a'], distance: 'r', equipotentials: { potential: 'V', test: 't', energy: 'U' } } (checked V = kq/r, U = q₀V); pictureLabels can go.",
      "8 (~voltage-energy): charges mode 'plates' option launch: { charge (e), mass (kg), energy? (eV), speed? (m/s) }, and the plates' gap may now be left out: an electron let go at the − plate (a proton or + ion at the + plate), strobed at equal times ∝ t² with its velocity growing, K = qΔV in eV and joules, and its speed on a bar up to a tenth of light's. { kind: 'charges', mode: 'plates', voltage: 'V', launch: { charge: 'q', mass: 'm', energy: 'K', speed: 'v' } } (checked K = qΔV, v = √(2K/m)); pictureLabels can go.",
      "9 (s.11.electromagnetism~moving-charge, a page not built yet; the build note's shared need): induction mode 'charge': { field, charge, coulombs? (C per unit: 1e-6 for μC, 1.602e-19 for e), speed, angle?, force?, mass?, radius?, fieldDir? }. With no angle B is × into the page (or • out), F = |q|vB in the page from F = qv × B, and with a mass the path is a dashed circle of r = mv/(|q|B) with its turning sense; with an angle B runs along the page, v at θ, F into or out of the page. Examples { kind: 'induction', mode: 'charge', charge: 'a', coulombs: 1e-6, speed: 'v', field: 'B', angle: 't', force: 'F' } and { kind: 'induction', mode: 'charge', charge: 'n', coulombs: 1.602e-19, speed: 'v', field: 'B', mass: 'm', force: 'F', radius: 'r' } (checked F = |q|vB sin θ, r = mv/(|q|B)); the page's rules are in the two demos.",
      'Parts by page (`uses`): every part is placed; part 9 is on s.11.electromagnetism~moving-charge (the angle) and s.11.electromagnetism~charge-circle (the mass and the circle, r = mv/(|q|B)), whose demo is retired.',
    ].join(' '),
  },
  {
    ...ask(
      'H108',
      'reaction',
      'Chemistry: reaction formulas from values (CxHy) and ionic compounds from their charges; a phase diagram; a concentration–time curve; a galvanic cell as a calculator picture; colored gases in gasPiston',
      {
        's.10.reaction-types~combustion': '"C{x}H{y}"',
        's.10.bonding~ionic': '"charges":{"metal"',
        's.10.phase-colligative': '"mode":"phase"',
        's.10.rates-equilibrium~average-rate': '"mode":"rate"',
        's.10.redox~cell-voltage': '"mode":"cell"',
        's.10.gas-laws~partial-pressure': '"mixture"',
      },
    ),
    status: 'placed',
    gallery: [
      'g.s10-reaction-types-combustion-general',
      'g.s10-bonding-ionic-charges',
      'g.s10-phase-colligative-diagram',
      'g.s10-rates-equilibrium-average-rate-curve',
      'g.s10-redox-cell-voltage-cell',
      'g.s10-gas-laws-partial-pressure-mixture',
    ],
    notes:
      'P20: docs/build/s.10.md, "Shared needs (lesson review)" 2, 3 and 5; drawn part by part (types in typesHs3e.ts, checks in harness/picturesHs3e.ts, demos in galleryHs3e.ts built from the pages themselves), each off unless a page sets it. (1) Already covered by group H2D (H101 part 1), no second option: a `reaction` term’s formula may be "C{x}H{y}" (the fuel drawn as a carbon chain from the values, double bonds when y < 2x + 2, atoms tallied, faded CₓHᵧ while "?") and `most` (8 to 32) lets a term draw up to 32 molecules (x = 8 alkane: 25 O₂). ~combustion and ~combustion-alkene: { kind: "reaction", reactants: [{ formula: "C{x}H{y}", count: "a" }, { formula: "O2", count: "b" }], products: [{ formula: "CO2", count: "c" }, { formula: "H2O", count: "d" }], most: 25 } (demo g.s10-reaction-types-combustion-general; `molar` and `atoms` are optional). (2) `lewisStructure` ionic `charges: { metal, nonmetal, metals?, nonmetals? }`: the metal ion’s charge and the size of the nonmetal ion’s charge (whole, 1–3) pick the elements, Na⁺ Mg²⁺ Al³⁺ and Cl⁻ O²⁻ N³⁻ by default (`metals`/`nonmetals` list others by charge, checked against their valence); the transfer arrows, ions and formula follow (Al³⁺ with O²⁻: 2 × 3 = 3 × 2 = 6 electrons, Al₂O₃), the caption names the ions; while a charge is "?" the spec’s metal and nonmetal draw faded. The harness checks each charge and the counts against the picked pair. ~ionic: { kind: "lewisStructure", mode: "ionic", metal: "Mg", nonmetal: "Cl", metals: "a", nonmetals: "b", transferred: "t", charges: { metal: "cp", nonmetal: "cn" } } (the "picture draws magnesium chloride" assumption can go). Parts 3–5 are new modes of the `chemDiagram` kind (ChemDiagramHs3e.tsx and a file each), in the pages’ own units (°C, s, mol/L, V; none has a unit menu). (3) mode "phase" { freezing?, boiling?, drop?, rise? }: water’s phase diagram (pressure not to scale): solid, liquid and gas regions, the triple point, the 1 atm line; the solution’s melting line and boiling curve dashed, crossing 1 atm at its freezing and boiling points (°C), ice’s own line kept; the temperature axis broken round 0 °C and 100 °C, each part to its own scale so a 0.5 °C shift shows; ΔTf and ΔTb bracketed and checked (0 − Tf, Tb − 100). s.10.phase-colligative: { kind: "chemDiagram", mode: "phase", freezing: "Tf", boiling: "Tb", drop: "dTf", rise: "dTb" } (the hidden T0 and its rule can go). (4) mode "rate" { times: [t₁, t₂], concentrations: [[A]₁, [A]₂], span?, change?, rate?, species? }: [A] against t through both readings (a first-order curve for its shape, said in the caption), the secant a little past each, the Δt and Δ[A] triangle and the rate chip; checked (Δt, Δ[A], −Δ[A]/Δt; [A]₂ ≤ [A]₁ and t₂ > t₁, else a faded stand-in). ~average-rate: { kind: "chemDiagram", mode: "rate", times: ["t1", "t2"], concentrations: ["A1", "A2"], span: "dt", change: "dA", rate: "r" } (the hidden m and b0 can go). (5) mode "cell" { cathode, anode, voltage? } (V): the galvanic cell figure (layouts/galvanicFigure.tsx, now taking a `reading`) of the metals whose table potentials those are, anode on the left, its meter reading E°cell, and an E° scale (−3 to +1 V, every table metal ticked) with the two lit and the gap bracketed; a potential not in the table or a cathode below the anode draws zinc–copper faded. ~cell-voltage: { kind: "chemDiagram", mode: "cell", cathode: "Ec", anode: "Ea", voltage: "E" }. (6) `gasPiston` `mixture: { gases: [{ formula, pressure }] (2–4), total?, fraction? }` (GasMixture.tsx; `energy` untouched): the cylinder with 24 particles shared by partial pressure (largest remainder, "rounded" said), each gas in its own color (theme gasMixA–D) and drawn as its molecule (He one ball, O₂ and N₂ two), and a bar of the partial pressures stacked to the total on a pressure scale; total and the first gas’s mole fraction checked. ~partial-pressure: { kind: "gasPiston", law: "ideal", mixture: { gases: [{ formula: "He", pressure: "P1" }, { formula: "O2", pressure: "P2" }, { formula: "N2", pressure: "P3" }], total: "P", fraction: "x" } }.',
  },
  {
    ...ask(
      'H109',
      'gel',
      'Biology: gel as an explore figure, cellDivision as a calculator picture, a neuron and reflex arc, a flower with its parts and embryo-stage icons, biome icons or a map, observe pages with two rows or negative values, dnaMath start-lost and stop-lost effects',
      {
        's.9.biotechnology': '"kind":"dnaStrand"',
        's.9.biotechnology~frameshift': '"kind":"dnaStrand"',
        's.9.biotechnology~fingerprint': '"kind":"gel"',
        's.9.mitosis-meiosis~mitotic-index': '"stages"',
        's.9.nervous-system': '"kind":"reflexArc"',
        's.9.nervous-system~impulse-speed': '"kind":"neuron"',
        's.9.nervous-system~membrane-potential': '"min":-90',
        's.9.plant-biology~flower': '"drawing":"flower"',
        's.9.plant-biology~life-cycle': '"kind":"flowerCycle"',
        's.9.reproduction-development': '"icon":"zygote"',
        's.9.reproduction-development~hormones': '"second"',
        's.9.biomes~land': '"icon":"tundra"',
        's.9.biomes~rainfall': '"second"',
      },
    ),
    status: 'placed',
    gallery: [
      'g.s9-biotechnology-start-stop',
      'g.s9-biotechnology-frameshift-start',
      'g.s9-biotechnology-fingerprint',
      'g.s9-mitosis-meiosis-mitotic-index-stages',
      'g.s9-nervous-system-reflex-arc',
      'g.s9-nervous-system-reflex-cards',
      'g.s9-nervous-system-impulse-speed-neuron',
      'g.s9-nervous-system-impulse-speed-bare',
      'g.s9-plant-biology-flower',
      'g.s9-plant-biology-life-cycle-cards',
      'g.s9-reproduction-development-embryo',
      'g.s9-biomes-land-icons',
      'g.s9-nervous-system-action-potential-trace',
      'g.s9-reproduction-development-hormones',
      'g.s9-biomes-rainfall-climograph',
    ],
    notes:
      'P21: docs/build/s.9.md, "Shared needs"; drawn part by part (group H3D, demos in galleryHs3d.ts). (1) `dnaMath.effectOf` start-lost and stop-lost (dnaStrand, no new field): when the template’s mRNA starts AUG, a substitution in codon 1 is start-lost (AUG is Met’s only codon): the After row reads “No protein: the start codon is gone” and the caption “Start lost: the start codon AUG becomes AUA, so the ribosome can’t start here and no protein is made”; a substitution turning the stop into a sense codon is stop-lost: the After row gains that amino acid, lit, and the caption reads “Stop lost: the stop codon UAA becomes CAA (Gln), so the ribosome reads on past the gene’s end and the protein comes out too long”. An insertion inside the start codon (before base 2 or 3) or a deletion breaking AUG is start-lost; an insertion before base 1 leaves AUG whole, one base later (read from there: the protein is the same); an insertion or deletion past the stop codon changes nothing; every other insertion or deletion stays a frameshift. The harness (picturesHs3d.ts) works the expected effect out from the codons. No page changes today (p is 4–9 and 4–12). s.9.biotechnology: p may run 1–12 (the assumption “this page changes the codons between them” goes; k 1–4); ~frameshift: p 1–12 (k 1–4; at p = 1 the insertion is ahead of the start and the protein is the same, so s is 0 there, or keep p from 2). Demos g.s9-biotechnology-start-stop (p 1–12, example p = 10, stop lost) and g.s9-biotechnology-frameshift-start (p 1–12, example p = 2, start lost). (2) `gel` as an explore figure (layouts/gelFigure.tsx): figure { kind: "gel", lanes: [{ label, bands: [bp, …] }] (up to 8 lanes, 1–6 bands each, 50–20,000 bp), ladder?: [bp, …] | false }, on one log scale for every scene; scene field gel: { lanes?: [names] (at most 6 shown), lit?: [names] (ringed), compare?: name (its bands dashed across the gel, matching bands of the other lanes lit, the caption counting “Suspect 2 matches Evidence in all 4 bands”), parents?: [mother, father] (with compare = the child: each child band red from the mother or blue from the father, a band from neither ringed, dashed, and the caption “… 2 match neither, so Man B is ruled out as the biological father”) }. The harness checks names, counts, sizes, bands far enough apart, shown lanes, and that a line saying “ruled out” agrees with the bands. s.9.biotechnology~fingerprint (page C, not built): the demo g.s9-biotechnology-fingerprint as the page (its eight lanes and five scenes), or the page’s own samples. (3) `cellDivision` as a calculator picture is already drawn (H100, `typesHs2e.ts`: { kind: "cellDivision", diploid: "D", haploid?, chromatids?, zygote?, combinations? }, demos g.s9-mitosis-meiosis-chromosome-count and -human); s.9.mitosis-meiosis~chromosome-count takes it as H100’s notes say, no second option. New for ~mitotic-index: `pieChart` `stages: ["interphase", "prophase", "metaphase", "anaphase", "telophase"]` (one per part; off unless set) draws that stage’s cellDivision card small beside each part’s name (above the plate in the biggest wedge); the harness checks one stage per part and that each part’s name names its stage (“Cells in prophase”). s.9.mitosis-meiosis~mitotic-index: add stages as in g.s9-mitosis-meiosis-mitotic-index-stages (no other change). (4) Neuron and reflex arc. Explore figure { kind: "reflexArc" } (layouts/reflexArcFigure.tsx): a hand on a hot pan, the arm with its biceps, the spinal cord in section (gray-matter butterfly, the dorsal-root ganglion with the sensory cell body, the ventral root), the sensory neuron, an interneuron, the myelinated motor neuron and the tract to the brain; scene field reflex: { lit?: "receptor" | "sensory" | "interneuron" | "motor" | "effector" | "brain", impulse?: true } (arrows as far as the lit part). Card figure { kind: "reflexArc", lit } (112 × 76): the same arc small, one part lit, no arrows (the cards can’t be ordered by counting them); the harness checks the cards come in the impulse’s order. s.9.nervous-system: add figure: { kind: "reflexArc", lit: "receptor" | "sensory" | "interneuron" | "motor" | "effector" | "brain" } to its six stages, in that order (g.s9-nervous-system-reflex-cards); an explore page could use g.s9-nervous-system-reflex-arc. New calculator kind `neuron` (reps/Neuron.tsx): { kind: "neuron", length: "d" (m), speed: "v" (m/s), time?: "t" (ms), myelin?: boolean } draws a neuron (dendrites, cell body, axon, terminals on a muscle fiber), myelinated with the impulse hopping node to node at 3 m/s or more (bare, a creeping wave, below), and under the axon a distance scale 0 to d and a time scale 0 to t at the same quarter marks; the caption works 1,000 × d ÷ v = t ms; the harness checks d and v positive and t = 1,000d ÷ v. s.9.nervous-system~impulse-speed: representation { kind: "neuron", length: "d", speed: "v", time: "t" } in place of the doubleNumberLine (k and its hidden rule can go; pictureLabels no longer needs v). (5) Flower and embryo. `parts` figure `drawing: "flower"` (layouts/partsFlower.tsx): a flower cut in half with petal, sepal, anther, filament, stigma, style, ovary and ovule (part names in any capitals; tap to light), e.g. { kind: "parts", drawing: "flower", parts: [{ name: "Anther", job: "Makes pollen…" }, …] } (g.s9-plant-biology-flower); s.9.plant-biology could add it as a page, or its Flower scene could point to it. Card figure { kind: "flowerCycle", stage: "pollination" | "pollen tube" | "fertilization" | "seed and fruit" | "dispersal" | "germination" | "seedling" } (112 × 76, the stage’s part lit; checked to come in that order): s.9.plant-biology~life-cycle adds one to each of its seven stages, in that order (g.s9-plant-biology-life-cycle-cards). Card icons zygote, morula, blastula, gastrula (h3d.tsx): s.9.reproduction-development adds { kind: "icon", icon: "zygote" } to fertilization, morula to cleavage, blastula and gastrula to theirs (g.s9-reproduction-development-embryo); the gastrula’s layers are blue ectoderm, red mesoderm and yellow endoderm, so ~germ-layers could name them in its bins. (6) Biome icons (a map was not needed): tropical rainforest, desert, grassland, temperate deciduous forest, taiga, tundra; s.9.biomes~land: bins[i].figure: { kind: "icon", icon: "<the bin’s biome>" } (g.s9-biomes-land-icons, the H104 bin figures). The cards stay text, so the icons never give a card away. (7) Observe with two rows or values below 0. Two rows in one unit were drawn (H100 `second: { rowLabel, initial }`): s.9.reproduction-development~menstrual-cycle can add an observe page of hormone levels by day as g.s9-reproduction-development-hormones (estrogen and progesterone, 0–100 of each one’s peak, no new field). New, off unless set: observe `min` (e.g. −90): bars grow up or down from a 0 line and read with a true minus (g.s9-nervous-system-action-potential-trace: { kind: "observe", columns: ["0 ms", …, "6 ms"], rowLabel: "Membrane potential", unit: "mV", min: −90, max: 40, step: 5, initial: [−70, −55, 30, −40, −80, −75, −70], pattern } for s.9.nervous-system~action-potential beside its sequence); and `second: { rowLabel, initial, unit?, max?, min?, step? }` on a scale of its own: with its own unit each row gets its own chart (named with its unit) over the shared column labels, and the table and key name each row’s unit (g.s9-biomes-rainfall-climograph: s.9.biomes~rainfall adds second: { rowLabel: "Temperature", unit: "°C", min: −30, max: 40, step: 1, initial: [−5, −3, 3, 10, 16, 21, 24, 23, 18, 11, 4, −2] } and a pattern reading both). layouts.test now checks each row on its own range.' +
      " Placed (parts by page in `uses`): (4)'s action-potential trace went on ~membrane-potential, (5)'s flower on ~flower and (7)'s hormones on ~hormones (new pages beside ~action-potential, the plant-biology main page and ~menstrual-cycle, which the request first named; s.9.biomes main took nothing, the icons went on ~land); the optional reflex-arc explore page was not added.",
  },
  {
    ...ask(
      'H110',
      'geologicClock',
      'Earth and space: Earth history on a 24-hour clock, a fossil coral section, a transit and its light curve, the habitable zone, Kepler with a star mass and e to 0.97, earthLayers as an explore figure, parallax',
      {
        's.12.earth-history': '"kind":"geologicClock"',
        's.12.earth-history~day-length': '"kind":"coralSection"',
        's.12.exoplanets': '"kind":"transit"',
        's.12.exoplanets~orbit': '"starMass"',
        's.12.exoplanets~habitable-zone': '"kind":"habitableZone"',
        's.12.earth-interior~wave-arrivals': '"earthSection"',
        's.12.solar-system': '"mode":"kepler"',
        's.12.starlight-spectra~parallax': '"kind":"parallax"',
      },
    ),
    status: 'placed',
    gallery: [
      'g.s12-earth-history-clock',
      'g.s12-earth-history-clock-late',
      'g.s12-earth-history-day-length-coral',
      'g.s12-earth-history-day-length-coral-few',
      'g.s12-exoplanets-transit',
      'g.s12-exoplanets-transit-earth',
      'g.s12-exoplanets-habitable-zone',
      'g.s12-exoplanets-habitable-zone-bright',
      'g.s12-exoplanets-orbit-star-mass',
      'g.s12-solar-system-halley',
      'g.s12-earth-interior-shadow-zone-explore',
      'g.s12-starlight-spectra-parallax-near',
    ],
    notes: [
      'P22: docs/build/s.12.md, "Added skills" and "Shared needs", drawn part by part (group H3C: specs in typesHs3c.ts, pictures in reps/Hs3cPicture.tsx, the shared science in reps/spaceHs3c.ts, checks in harness/picturesHs3c.ts and layoutFiguresHs3c.ts, demos in galleryHs3c.ts). Every option is off unless a page sets it; the units are the pages\' fixed labels (million years, hours, R☉, R⊕, L☉, AU, ″), read in formula units.',
      "(1) s.12.earth-history: a new kind `geologicClock`, { kind: 'geologicClock', ago: 'A', time: 't', minutes: 'm', share: 'p', events: [{ age: 4600, name: 'Earth forms' }, { age: 3500, name: 'First life' }, { age: 2300, name: 'Oxygen in the air' }, { age: 540, name: 'Animals with shells' }, { age: 66, name: 'Dinosaurs die out' }, { age: 0.3, name: 'Our species' }], span?: 4600, fixed? }: a flat 24-hour dial, midnight at the top, the hand at t = 24 − A ÷ 4,600 × 24 with the last m minutes shaded, the events numbered round the rim with a key, and the last hour (23:00–24:00, a thick arc on the dial) stretched out below so the dinosaurs (23:39) and our species (23:59:56) can be told apart; the clock time reads h:mm, or h:mm:ss in the last ten minutes. Drag the hand for t. The harness checks t, m and p against A. The page drops its table and pictureLabels (demos g.s12-earth-history-clock, -late).",
      "(2) s.12.earth-history~day-length: a new kind `coralSection`, { kind: 'coralSection', lines: 'n', bands: 'b', days: 'N', day: 'D', yearHours?: 8766 }: a horn coral on its side, painted in fossil colours, its wall ridged with the n daily lines (every 2nd, 5th, 10th … when they would be closer than 2.5 px, and it says so) across b yearly bands (grooves, alternate bands shaded, each year labeled); a band of a worked-out count that is not whole is drawn as a part band. Below, the day then, D = 8,766 ÷ N hours, as a bar beside today's 24 hours on one hour scale. The harness checks N = n ÷ b and D = 8,766 ÷ N. The page drops its table and pictureLabels (demos g.s12-earth-history-day-length-coral, -few).",
      "(3) s.12.exoplanets: a new kind `transit`, { kind: 'transit', star: 'R', planet: 'r', depth: 'd' }: the star's limb-darkened disk on the night sky and the planet's black disk crossing its middle, to one scale (r ÷ (109 × R) of its width; a planet under 1.5 px is ringed and the label says it is a dot), and under it, on the same horizontal scale, the light curve dipping as the disks overlap (the covered area worked out exactly, no limb darkening), 100% and 100 − δ % labeled and δ bracketed; the dip is drawn a fixed height, as δ may be a millionth of a percent. The harness checks r < 109 × R and δ = 100 × (r ÷ (109 × R))². The page drops its table (demos g.s12-exoplanets-transit, -earth).",
      "(4) s.12.exoplanets~habitable-zone: a new kind `habitableZone` (the page\'s view needs no orbit mechanics, so not a circularMotion option), { kind: 'habitableZone', luminosity: 'L', inner: 'd1', outer: 'd2', orbit: 'a', temperature: 'T', fixed? }: the system from above, the star at the left drawn bigger and bluer for a brighter star (not to scale, it says so), the zone from d₁ to d₂ shaded green between a too-hot inside and a too-cold outside, the planet on its dashed orbit at a with a and T above it, and an AU axis to the same scale; drag the planet for a. The harness checks d₁ = 0.95√L, d₂ = 1.37√L and T = 278 × L^(1/4) ÷ √a. The page drops its table and pictureLabels (demos g.s12-exoplanets-habitable-zone, -bright).",
      "(5) s.12.exoplanets~orbit and s.12.solar-system: `circularMotion` mode `kepler` takes `starMass` (M☉) and eccentricity up to 0.97. With starMass the labels say star, closest and farthest (a circle of radius a when e is 0 or not given) and the caption works a³ = M × T², T = √(a³ ÷ M) years, with the days; the harness checks the period against it. ~orbit: { kind: 'circularMotion', mode: 'kepler', semiMajor: 'a', starMass: 'M', period: 'T' } in place of its table, no pictureLabels (demo g.s12-exoplanets-orbit-star-mass). s.12.solar-system: e's max can rise to 0.97 with no picture change (the sun is drawn smaller past e = 0.9 so the perihelion shows); demo g.s12-solar-system-halley uses a = 17.83 AU, e = 0.967 (17.8 would show Q as 35.0, which the copy editor refuses).",
      "(6) s.12.earth-interior~shadow-zone: `earthLayers` as an explore figure, figure { kind: 'earthLayers' } with a scene's `earthSection: { distance }` (degrees): the calculator's section (EarthLayers.tsx now draws it through an exported SectionDrawing), a station on both halves, filled where that wave arrives. The layout check keeps a scene's lines from saying S waves arrive past 104°. Example scenes 60°, 104°, 120°, 150° (demo g.s12-earth-interior-shadow-zone-explore). The calculator page can stay as it is; the explore is a new ~shadow-zone page or replaces it.",
      "(7) s.12.starlight-spectra~parallax (not built yet): a new kind `parallax`, { kind: 'parallax', angle: 'p', parsecs?: 'd', lightYears?: 'D' } (p in arcseconds, 0.001–1): the Sun with Earth in January and July 1 AU either side, a near star above, the sight lines past it to the far stars and where it is seen against them each half year, the Sun–Earth–star triangle shaded and p marked at the star, d on the Sun–star line; not to scale (it says so), but the star climbs toward the far stars as d grows, so the angle narrows. The caption works d = 1 ÷ p and 3.26 × d. The harness checks 0 < p ≤ 1, d = 1 ÷ p and D = 3.26 × d. The demos g.s12-starlight-spectra-parallax (p = 0.1″) and -near (Proxima, 0.768″) are the page: variables p (″), d (pc), D (light-years), rules d = 1 ÷ p and D = 3.26 × d.",
      'Parts by page (`uses`): parts 1–6 are placed ((6) as the new explore ~wave-arrivals). Waiting on pages not built yet (each in `pages` with its mark, so the test checks it once built; the demos hold the specs): s.12.starlight-spectra~parallax (part 7).',
    ].join(' '),
  },
  // ── Round 4 (H111–H114): docs/HS_NEEDS.md P23–P26 ──
  {
    ...ask(
      'H111',
      'rotor',
      'The hollow ball (c = 2/3) named and drawn, and in the compare row beside the hoop, solid disk and solid ball',
      ['s.11.rotation~rotational-inertia'],
    ),
    status: 'placed',
    gallery: [],
    notes:
      "P23. c = ⅔ is now drawn and named a hollow ball (a thin shell cut open), not a solid disk, wherever a rotor's shape is ⅔. New option `hollow: true` adds it to the compare row: four shapes, each column's name and c on two lines. Pages without `hollow` keep their three. The harness checks that with `hollow` the shape is one of the four named factors (1, ⅔, ½, 0.4). Spec: { kind: 'rotor', shape: 'c', mass: 'm', radius: 'r', inertia: 'I', torque: 't', acceleration: 'a', compare: true, hollow: true }.",
  },
  {
    ...ask(
      'H112',
      'normalCurve',
      'The F curve shades one tail or two as the page’s Hₐ value says, so it agrees with P for both choices',
      ['m.12.anova~two-variances'],
    ),
    status: 'placed',
    gallery: [],
    notes:
      "P24. New `f.tailsFrom`: a value holding Hₐ in place of the fixed `tails`. 1 (or a sign box's 3 >, 4 ≥) is the right tail; 0 (or 6 ≠) is both tails, twice the smaller. While it is \"?\", the curve draws with no tail shaded and the caption asks for Hₐ. The harness checks the code (0, 1, 3, 4 or 6) and P against the tails it picks. Spec for the page (h: 0 ≠, 1 >): { kind: 'normalCurve', f: { df1: 'd1', df2: 'd2', stat: 'F', alpha: 'a', p: 'P', tailsFrom: 'h' } }.",
  },
  {
    ...ask(
      'H113',
      'pascalTriangle',
      'A counting fraction for “exactly k of r”: C(a, k) × C(b, r − k) ÷ C(a + b, r), groups up to 60',
      ['m.10.probability-rules~counting-probability'],
    ),
    status: 'placed',
    gallery: [],
    notes:
      "P25. `fraction` takes `b` and `r`: the top becomes C(n, k) × C(b, r − k) (k from the first group of n, the rest from the second group of b), over the triangle's C(n, k) as before. Without `b` and `r` it draws C(n, k) as H97 did. With `triangle: false` no rows are drawn, so groups run to 60. The harness checks that the two groups make everyone, that r is the bottom's k, and the count and chance. Spec for the page: { kind: 'pascalTriangle', n: 'n', k: 'r', triangle: false, slots: { r: 'r', choose: true, result: 't' }, fraction: { n: 'a', k: 'k', b: 'b', r: 'r', count: 'f', chance: 'P' } }. Placed: the page keeps b ≥ 1 (two groups; b = 0 left P = 1 unknown), adds rules for k = 0 (f = C(b, r)) and k = r (f = C(a, r)) so f is found before the group that gives no one is typed, and the slots put the product, and the ÷ r! line's groups, on lines of their own when they pass the width.",
  },
  {
    ...ask(
      'H114',
      'sort',
      'Germ-layer bins colored as the gastrula card draws them (ectoderm, mesoderm, endoderm)',
      ['s.9.reproduction-development~germ-layers'],
    ),
    status: 'placed',
    gallery: [],
    notes:
      "P26. A sort bin can set `color`, a theme color name: a stripe down the bin's side and a swatch before its name. The gastrula icon's colors: ectoderm 'bioAmino', mesoderm 'organDeep', endoderm 'bioSugar'. The harness checks every bin or none has a color, and no two share one. For the page, add to each bin: { id: 'ecto', color: 'bioAmino' }, { id: 'meso', color: 'organDeep' }, { id: 'endo', color: 'bioSugar' }.",
  },
];

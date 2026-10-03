/**
 * College pictures, round 3, group C (docs/RENDERINGS_HE.md). Spread into
 * HE_PICTURE_REQUESTS in pictureRequestsHe.ts.
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

const M = 'he.math.';

export const HE3C_REQUESTS: PictureRequest[] = [
  {
    ...ask(
      'HC53',
      'polarGrid',
      'Polar grid options for calculus: the area a curve sweeps shaded from the pole (A = ½∫ r² dθ), an annular sector r₁ ≤ r ≤ r₂, the tangent at the point with its slope, and the cycloid traced with its rolling circle, t in radians and the arc length',
      [
        `${M}calc-2#5~cycloid-arc`,
        `${M}calc-2#5~polar-area`,
        `${M}calc-2#5~polar-slope`,
        `${M}calc-3#2~polar`,
      ],
      [
        'From M-P15. Options on polarGrid (typesHe3c.ts, drawn by reps/PolarHe3c.tsx, sums in reps/polarHe3cMath.ts); each is off unless a page sets it, θ in degrees as the curve’s.',
        "Fields: area: { from, to, value? } (with a curve: the region swept from θ = from to to, shaded from the pole with its edge rays dashed, A = ½∫ r² dθ worked by Simpson's rule in the caption); region: { r1, r2, from, to, area? } (an annular sector, its arcs drawn, the full ring when to − from = 360°; the caption gives dA = r dr dθ and ½(β − α)(r₂² − r₁²)); tangent: true | { slope? } (with curve and point: the tangent line through the point across the grid, the caption working r′ and dy/dx = (r′ sin θ + r cos θ) ÷ (r′ cos θ − r sin θ), 'undefined (vertical)' where dx/dθ = 0); parametric family 'cycloid' (r: x = r(t − sin t), y = r(1 − cos t), t in radians, drawn on the x-axis with the rolling circle dashed at t and its spoke to the point), radians: true (t labelled 2π, 3π/2 …), length: id (the traced length from range[0] to t, summed, in the caption). A '?' end, radius or θ draws nothing for that option.",
        "Examples. ~polar-area: { kind: 'polarGrid', curve: { shape: 'cardioid', a: 'a', b: 'b' }, area: { from: 0, to: 360, value: 'A' } }. A rose petal: curve rose, area: { from: 'al', to: 'be', value: 'A' } with α = −90° ÷ n, β = 90° ÷ n. ~polar-slope: { kind: 'polarGrid', curve: { shape: 'cardioid', a: 'a', b: 'b' }, point: { r: 'r', theta: 't' }, tangent: { slope: 'm' } }. calc-3#2~polar: { kind: 'polarGrid', region: { r1: 'r1', r2: 'r2', from: 0, to: 'be', area: 'A' } } (or from: 'al' for a part turn). ~cycloid-arc: { kind: 'polarGrid', parametric: { family: 'cycloid', r: 'r', t: 'T', range: [0, 2π], x: 'x', y: 'y', radians: true, length: 'L' } }.",
        'The harness (harness/picturesHe3c.ts) checks the swept area against ½∫ r² dθ, the region’s area against ½(β − α)(r₂² − r₁²) with 0 ≤ r₁ ≤ r₂, the tangent slope against the curve’s dy/dx (no slope where it is vertical), and the traced length against the summed path.',
      ].join(' '),
    ),
    status: 'drawn',
    gallery: [
      'g.he-polarGrid-area',
      'g.he-polarGrid-petal',
      'g.he-polarGrid-tangent',
      'g.he-polarGrid-region',
      'g.he-polarGrid-sector',
      'g.he-polarGrid-cycloid',
      'g.he-polarGrid-cycloid-part',
    ],
  },
  {
    ...ask(
      'HC54',
      'rightTriangle',
      'Related rates and pumping work: a right triangle with each side’s rate as an arrow at its moving end (a ladder against a wall, two cars on crossing roads), a cone tank on its apex filling to depth h, and a full cylinder with a thin slab lifted to the outlet',
      {
        [`${M}calc-1#2~ladder`]: '"ladder"',
        [`${M}calc-1#2~two-cars`]: '"roads"',
        [`${M}calc-1#2~cone-tank`]: '"fill"',
        [`${M}calc-2#2~pump-work`]: '"slab"',
      },
      [
        'From M-P16. Options on rightTriangle and curvedSolid (typesHe3c.ts; drawn by reps/RightTriangleRatesHe3c.tsx and reps/TankHe3c.tsx, sums in reps/ratesHe3cMath.ts); each is off unless a page sets it.',
        "rightTriangle fields: rates: { a?, b?, c? } (ids; the triangle drawn large to scale with no side squares, the right angle at the bottom right, b along the ground to the left, a up; each rate an arrow at the side's moving end, its length scaled to the biggest rate and its direction the rate's sign, c's rate a double arrow along the hypotenuse; the caption works a·a′ + b·b′ = c·c′, a side with no rate fixed at 0), scene?: 'ladder' (TriangleScene's wooden ladder and brick wall) | 'roads' (two roads, a car at each end, D dashed), keep?, fixed?. Drag the foot (b), holding c on a ladder and a otherwise.",
        "curvedSolid fields: fill: { depth, r?, inflow?, rise? } (shape 'cone': the glass cone on its apex, water to depth h with surface radius r = R·h ÷ H, the inflow poured in and the rise arrow; drag the surface when depth is typed); slab: { y, above?, lift?, density?, g?, work? } (shape 'cylinder': full of water, a slab at y outlined, a pipe up to h over the rim, the lift arrow H + h − y; the caption works W = ρgπr²(H²/2 + hH) with the page's density and g; drag the slab). A '?' depth, slab height or rate draws nothing for it.",
        "Examples. ~ladder: { kind: 'rightTriangle', a: 'y', b: 'x', c: 'L', extent: 5, rates: { a: 'dy', b: 'dx' }, scene: 'ladder', keep: ['dx'] }. ~two-cars: { kind: 'rightTriangle', a: 'y', b: 'x', c: 'D', extent: 40, rates: { a: 'vy', b: 'vx', c: 'vD' }, scene: 'roads' }. ~cone-tank: { kind: 'curvedSolid', shape: 'cone', radius: 'R', height: 'H', extent: 4, fill: { depth: 'h', r: 'r', inflow: 'q', rise: 'dh' } } (add the page limit h ≤ H). ~pump-work: { kind: 'curvedSolid', shape: 'cylinder', radius: 'r', height: 'H', extent: 3, slab: { y: 'y', above: 'h', lift: 'lift', density: 'rho', g: 9.8, work: 'W' } } (the page gains y and the lift d; the plan's h = 0 example needs h > 0 to show the outlet, or above: 0).",
        'The harness (harness/picturesHe3c.ts, formula units) checks a·a′ + b·b′ = c·c′; r = R·h ÷ H, dh/dt = (dV/dt) ÷ (πr²) and 0 ≤ h ≤ H; the lift H + h − y with 0 ≤ y ≤ H; and the work.',
      ].join(' '),
    ),
    status: 'drawn',
    gallery: [
      'g.he-rightTriangle-ladder',
      'g.he-rightTriangle-ladder-low',
      'g.he-rightTriangle-cars',
      'g.he-curvedSolid-cone-tank',
      'g.he-curvedSolid-cone-shallow',
      'g.he-curvedSolid-pump',
      'g.he-curvedSolid-pump-oil',
    ],
  },
  {
    ...ask(
      'HC66',
      'termsChart',
      'Series on the terms chart: the n·rⁿ and cⁿ ÷ n! rules, alternating signs with the partial sums zig-zagging about the sum, the next term and the ratio for the ratio test, a band the sum must lie in, and the sum itself worked out',
      [`${M}calc-2#3`, `${M}calc-2#3~ratio`, `${M}calc-2#3~alternating`],
      [
        'From M-P17. Options on termsChart (typesHe3c.ts; the rules and sums in reps/termsSeriesHe3c.ts, drawn through reps/SeriesBandHe3c.tsx with a line or two in TermsChart.tsx and termsModel.ts); each is off unless a page sets it, and with any of them the terms are named aₙ and the caption is the series one.',
        "Fields: type: 'nr' (aₙ = first × n·rⁿ, r = step) | 'factorial' (aₙ = first × cⁿ ÷ n!, c = step); alternate: true (aₙ × (−1)ⁿ⁺¹ on 'power', 'nr' or 'factorial'; a geometric series takes a negative ratio instead); bounds: { low, high } (a band shaded across the chart, dashed edges, at least 3 px tall; the caption says whether the sum lies in it); next: id (the chart runs to n + 1, aₙ₊₁ in the second colour; checked as aₙ₊₁, or |aₙ₊₁| when the signs alternate, the error bound); ratio: id (aₙ₊₁ ÷ aₙ, checked; the caption gives the ratio's limit, |r| for n·rⁿ and 0 for cⁿ ÷ n!); limit: true | id (the series' sum dashed: r ÷ (1 ∓ r)², eᶜ − 1 or 1 − e⁻ᶜ, ζ(p) and η(p) summed to 10⁻⁹; an id is checked against it; 'This series has no sum' when it diverges). A p-series is type 'power' with step −p (a hidden value: the page's p negated).",
        "Examples. calc-2#3 main: { kind: 'termsChart', type: 'power', first: 1, step: 'mp', count: 'N', as: 'bars', sums: true, sum: 'S', bounds: { low: 'lo', high: 'hi' }, limit: true } with hidden mp = −p. ~ratio: { kind: 'termsChart', type: 'nr', first: 1, step: 'r', count: 'N', sums: true, term: 'aN', next: 'aN1', ratio: 'q', limit: 'S' }. ~alternating: { kind: 'termsChart', type: 'power', first: 1, step: 'mp', count: 'N', sums: true, sum: 'S', alternate: true, next: 'b', bounds: { low: 'lo', high: 'hi' }, limit: true }. Step text: write the sums Σ from n = 1 to N of (1/n)^p and Σ from n = 1 to N of (−1)^(n+1)/n^p (other forms of a power inside Σ don't typeset); n! is taught to the harness (phrasesHe3c.ts).",
        'The harness checks every term and partial sum by the rule (picturesHsb.ts with the HC66 rules), aₙ₊₁ and the ratio, the sum against a limit id, the band in order and containing the sum (picturesHe3c.ts).',
      ].join(' '),
    ),
    status: 'drawn',
    gallery: [
      'g.he-termsChart-pseries',
      'g.he-termsChart-pseries-slow',
      'g.he-termsChart-ratio',
      'g.he-termsChart-factorial',
      'g.he-termsChart-alternating',
    ],
  },
  {
    ...ask(
      'HC67',
      'rectangle',
      'The product rule as a growing rectangle (strips u′Δt × v and u × v′Δt, the corner second order), and on a circle the area under the arc split into a triangle and a sector (trig substitution) and the tangent at a point',
      {
        [`${M}calc-1#1~product-quotient`]: '"grow"',
        [`${M}calc-1#1~implicit`]: '"tangent"',
        [`${M}calc-2#0~trig-sub`]: '"under"',
      },
      [
        'From M-P18. Options on rectangle and the conicGraph circle (typesHe3c.ts; drawn by reps/RectangleGrowHe3c.tsx and reps/ConicCircleHe3c.tsx, sums in reps/growCircleHe3cMath.ts); each is off unless a page sets it.',
        "rectangle fields: grow: { du, dv, dt?, product?, quotient? } with length u (across) and width v (up): the u × v rectangle to scale with uv inside, a strip u′Δt wide by v on the right and one u by v′Δt on top (outside and filled when the side grows, inside, dashed and hatched when it shrinks), the corner u′v′Δt² grey when both grow; Δt is the page's or one that makes the wider strip a quarter of the shorter side; the caption gives the strips' areas, the corner as second order, (uv)′ = u′v + uv′ worked and with quotient (u/v)′ = (u′v − uv′) ÷ v². Drawn for u, v > 0 (a note otherwise). Pass fixed: true (no corner handle).",
        'conicGraph circle fields: under: { to, triangle?, sector?, integral?, angle? } (b = to across from the center: the triangle (center, foot, arc point) amber with its value beside it, the sector between the vertical radius and the radius to the arc point violet with its value outside the arc, θ = sin⁻¹(b ÷ r) marked; the caption works θ, ½·b·√(r² − b²), ½r²θ and their sum); tangent: true | { slope?, intercept? } (with point: the tangent line across the window, the radius to the point dashed, a right-angle mark; the caption gives −(x₀ − h) ÷ (y₀ − k) and y = mx + c, or x = x₀ when vertical). With either, the 45° radius is left out.',
        "Examples. ~product-quotient: { kind: 'rectangle', length: 'u', width: 'v', extent: 4, grow: { du: 'du', dv: 'dv', product: 'P', quotient: 'Q' }, fixed: true }. ~trig-sub: { kind: 'conicGraph', conic: 'circle', h: 0, k: 0, r: 'r', under: { to: 'b', triangle: 'T', sector: 'S', integral: 'I', angle: 't' }, fixed: true } (add the page limit b ≤ r; the plan's page can add T, S and θ or pass under: { to: 'b', integral: 'I' }). ~implicit: { kind: 'conicGraph', conic: 'circle', h: 0, k: 0, r: 'r', point: { x: 'x0', y: 'y0' }, tangent: { slope: 'm', intercept: 'c' }, fixed: true }.",
        'The harness (harness/picturesHe3c.ts) checks (uv)′ and (u/v)′, a page Δt short enough that the corner is small; the triangle, sector, θ and triangle + sector with 0 ≤ b ≤ r; the tangent slope and intercept.',
      ].join(' '),
    ),
    status: 'drawn',
    gallery: [
      'g.he-rectangle-grow',
      'g.he-rectangle-grow-both',
      'g.he-conicGraph-under',
      'g.he-conicGraph-under-quarter',
      'g.he-conicGraph-tangent',
      'g.he-conicGraph-tangent-steep',
    ],
  },
];

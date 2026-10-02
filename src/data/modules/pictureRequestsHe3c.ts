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
];

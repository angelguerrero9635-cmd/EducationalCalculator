/**
 * College pictures, round 2, group G (docs/RENDERINGS_HE.md). Spread into
 * HE_PICTURE_REQUESTS in pictureRequestsHe.ts.
 */
import type { PictureRequest } from './pictureRequests';

/** A request with its pages, as `pictureRequestsHs.ts` writes them. */
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

export const HE2G_REQUESTS: PictureRequest[] = [
  {
    ...ask(
      'HC21',
      'fieldPlot',
      'fieldPlot (new kind): slope fields with Euler, vector fields with work along a path, phase portraits, competition isoclines',
      [
        'he.math.diff-eq#0~euler',
        'he.math.diff-eq#3',
        'he.math.diff-eq#3~solution',
        'he.math.diff-eq#3~predator-prey',
        'he.math.calc-3#3',
        'he.math.calc-3#3~conservative',
        'he.math.calc-3#4',
        'he.biology.ecology#1~competition',
      ],
      [
        'From M-P9, B-P16 (phasePlane). Fields (FieldPlotSpec, typesHe2g.ts); expressions in x and y use the HC10 grammar, every other name a value id.',
        "mode 'slope' { dy, start: { x, y }, euler?: { h, n, last?, exact? } } — segments on a grid, the RK4 solution through (x₀, y₀), Euler's polyline (eulerSteps in fieldPlotMath.ts, for HC45 too); last and exact checked. Example (diff-eq#0~euler): { kind: 'fieldPlot', mode: 'slope', dy: 'a*x + b*y + c', start: { x: 'x0', y: 'y0' }, euler: { h: 'h', n: 'n', last: 'yn', exact: 'ye' } }.",
        "mode 'vector' { P, Q, path: { shape: 'segment', from, to } | { shape: 'rectangle', x0?, y0?, width, height } | { shape: 'circle', r, cx?, cy? }, sides?, work? } — arrows by |F|, the path with its direction, each side's ∫F·dr labelled (rectangle counterclockwise from its corner). Examples: calc-3#3 { P: 'al*x + be*y', Q: 'ga*x + de*y', path: { shape: 'segment', from: ['ax', 'ay'], to: ['bx', 'by'] }, work: 'W' }; calc-3#4 { P: '-y^2', Q: 'x^2', path: { shape: 'rectangle', width: 'a', height: 'b' }, sides: ['s1', 's2', 's3', 's4'], work: 'C' }; ~conservative passes P and Q as φ's gradient.",
        "mode 'phase' { matrix: [a, b, c, d], eigen?: { l1, l2 }, start?, time?, point?: { x, y } } — the direction field, eigenvector lines dashed, six trajectories, the type named; x(0) to x(t) traced (start drags). Or { lotka: { alpha, beta, gamma, delta }, equilibrium?: { x, y } } — closed orbits round (γ ÷ δ, α ÷ β).",
        "mode 'isoclines' { competition: { K1, K2, alpha, beta }, equilibrium?: { x, y } } — both zero-growth lines with intercepts K₁, K₁ ÷ α, K₂ ÷ β, K₂; the crossing ringed only when both N* > 0 (else the caption names the winner); flow arrows.",
      ].join(' '),
    ),
    status: 'drawn',
    gallery: [
      'g.he-fieldPlot-slope',
      'g.he-fieldPlot-slope-logistic',
      'g.he-fieldPlot-vector',
      'g.he-fieldPlot-green',
      'g.he-fieldPlot-conservative',
      'g.he-fieldPlot-phase',
      'g.he-fieldPlot-spiral',
      'g.he-fieldPlot-solution',
      'g.he-fieldPlot-predator-prey',
      'g.he-fieldPlot-isoclines',
      'g.he-fieldPlot-isoclines-winner',
    ],
  },
];

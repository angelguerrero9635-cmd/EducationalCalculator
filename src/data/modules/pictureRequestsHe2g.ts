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
  {
    ...ask(
      'HC37',
      'functionGraph',
      'functionGraph tangent (slope triangle, linear approximation) and band (ε–δ)',
      [
        'he.math.calc-1#1',
        'he.math.calc-1#1~linear-approx',
        'he.math.calc-1#1~chain',
        'he.math.calc-1#1~trig',
        'he.math.calc-1#1~exp',
        'he.math.calc-1#0~epsilon-delta',
      ],
      [
        'From M-P1. Fields (FunctionGraphHe2g, typesHe2g.ts), on any family:',
        "tangent: { x, slope?, y?, at?, value? } — the tangent through (x, f(x)) with its slope triangle (one grid step across, m × that up); slope and y are the page's f′(x) and f(x), checked against a central difference (10⁻⁶); with at, L(at) on the tangent (value = the page's L, checked). Example (calc-1#1, the pilot moved to the power family): { family: 'power', a: 'c', p: 'n', at: { x: 'x', y: 'f' }, tangent: { x: 'x', slope: 'fp', y: 'f' } }; ~linear-approx: { family: 'root', index: 2, tangent: { x: 'a', slope: 'fpa', y: 'fa', at: 'X', value: 'L' } }.",
        "band: { x, y, dx, dy } — y ± ε across and x ± δ up, shaded, the curve's run inside δ drawn heavier; the window zooms to 3 bands each way (unless the page sets window); checked: f(x ± δ) within y ± ε. Example (~epsilon-delta): { family: 'linear', m: 'm', b: 'b', band: { x: 'a', y: 'L', dx: 'delta', dy: 'eps' }, fixed: true }. HC45's Newton tangents can reuse tangentOf (functionGraphHe2g.ts).",
      ].join(' '),
    ),
    status: 'drawn',
    gallery: [
      'g.he-functionGraph-tangent',
      'g.he-functionGraph-tangent-linear-approx',
      'g.he-functionGraph-band',
      'g.he-functionGraph-band-shallow',
    ],
  },
  {
    ...ask(
      'HC38',
      'functionGraph',
      'functionGraph series overlay: a Taylor polynomial dashed over f, the gap at x bracketed',
      [
        'he.math.calc-2#4',
        'he.math.calc-2#4~sin-cos',
        'he.math.calc-2#4~from-derivatives',
        'he.math.calc-2#4~integrate-series',
        'he.math.diff-eq#4',
        'he.math.diff-eq#4~airy',
      ],
      [
        'From M-P4. Fields (FunctionGraphHe2g, typesHe2g.ts):',
        "series: { center?, coefficients? | derivatives? | of?, degree? | terms?, x?, value?, error?, integral?: { from, to, value? } } — Σ cₖ(x − a)ᵏ dashed over the family; coefficients c₀ first, derivatives f(a), f′(a), … (÷ k!), or of: 'exp' | 'sin' | 'cos' | 'expNegSq' | 'ln1p' | 'geometric' | 'ode' (Maclaurin, cut to degree or to its first `terms` nonzero terms); at x the gap bracketed with the error; integral shades ∫P (term by term). Checked: P(x), |f − P| and ∫P equal the page's. Example (calc-2#4): { family: 'exponential', r: 1, series: { of: 'exp', degree: 'n', x: 'x', value: 'P', error: 'err' } }; ~integrate-series: { family: 'expr', expr: 'exp(-x^2)', series: { of: 'expNegSq', terms: 'm', integral: { from: 0, to: 'b', value: 'I' } } }.",
        "New families: linearOde { a0, a1, omega?, c? } — y″ = (cx − ω²)y solved numerically (RK4), with series of: 'ode' using its recurrence (diff-eq#4: omega: 'w'; ~airy: c: 1); taylor { center, derivatives | coefficients } — the polynomial alone when no f is known (~from-derivatives: { family: 'taylor', center: 'a', derivatives: ['f0', 'f1', 'f2', 'f3'], at: { x: 'x', y: 'P' } }).",
        'The ~sin-cos page’s sin-or-cos choice needs a spec per choice; the demo draws sin.',
      ].join(' '),
    ),
    status: 'drawn',
    gallery: [
      'g.he-functionGraph-series',
      'g.he-functionGraph-series-far',
      'g.he-functionGraph-series-sin',
      'g.he-functionGraph-series-derivatives',
      'g.he-functionGraph-series-ode',
      'g.he-functionGraph-series-airy',
      'g.he-functionGraph-series-integrate',
    ],
  },
];

/**
 * College pictures, round 3, group B (docs/RENDERINGS_HE.md). Spread into
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

export const HE3B_REQUESTS: PictureRequest[] = [
  {
    ...ask(
      'HC46',
      'surfacePlot',
      'surfacePlot (new kind): z = f(x, y) on the space camera with traces and slopes, the tangent plane, the critical point, prisms over a box; or level curves with ∇f, a direction and a constraint',
      [
        'he.math.calc-3#1',
        'he.math.calc-3#1~extrema',
        'he.math.calc-3#2',
        'he.math.calc-3#1~directional',
        'he.math.calc-3#1~lagrange',
      ],
      [
        'From M-P7. Fields (SurfacePlotSpec, typesHe3b.ts): f, an expression in x and y in the HC10 grammar (other names value ids); partials are the expression’s exact derivatives. Optional: name, x and y (the window), view (surface or contour), point { x, y, z?, fx?, fy?, grad?, traces? }, tangentPlane, critical { x?, y?, z?, D? }, region { a, b, c, d, boxes?, sum?, value? }, direction { x, y, rate? }, constraint { p, q, k }, keep, fixed. Every named value is checked.',
        "calc-3#1: { kind: 'surfacePlot', f: 'qa*x^2 + qb*x*y + qc*y^2 + qd*x + qe*y', point: { x: 'x0', y: 'y0', z: 'z0', fx: 'fx', fy: 'fy', grad: 'g' }, tangentPlane: true }.",
        "~extrema: { kind: 'surfacePlot', f: (the same), critical: { x: 'xc', y: 'yc', z: 'zc', D: 'D' } } (min, max or saddle by D).",
        "calc-3#2: { kind: 'surfacePlot', f: 'p*x*y + q', region: { a: 'ra', b: 'rb', c: 'rc', d: 'rd', boxes: 'n', sum: 'S', value: 'I' } } (prisms below the floor in the minus colour).",
        "~directional: view 'contour' with point and direction { x: 'up', y: 'uq', rate: 'Du' }. ~lagrange: { f: 'x*y', view: 'contour', x: [0, 'xi'], y: [0, 'yi'], point: { x: 'lx', y: 'ly', z: 'M' }, constraint: { p: 'lp', q: 'lq', k: 'lk' }, fixed: true }.",
      ].join(' '),
    ),
    status: 'drawn',
    gallery: [
      'g.he-surfacePlot-point',
      'g.he-surfacePlot-extrema',
      'g.he-surfacePlot-saddle',
      'g.he-surfacePlot-region',
      'g.he-surfacePlot-region-signed',
      'g.he-surfacePlot-directional',
      'g.he-surfacePlot-lagrange',
    ],
  },
];

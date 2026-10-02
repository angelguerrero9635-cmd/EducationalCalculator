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
  {
    ...ask(
      'HC47',
      'vectorDiagram',
      'vectorDiagram space objects: a plane by a point and a normal with a point dropped to it, a line meeting a plane, a helix with its velocity, a sphere with normals and flux, a circle with its direction and a cap',
      [
        'he.math.calc-3#0',
        'he.math.calc-3#0~line',
        'he.math.calc-3#0~helix',
        'he.math.calc-3#3~flux',
        'he.math.calc-3#4~stokes',
      ],
      [
        'From M-P8. Fields (SpaceObjectsHe3b in typesHe3b.ts, inside `space`); with any object set, each vector in `vectors` is drawn from the object’s anchor (plane or line point, helix point r(t), sphere top, circle center). Same camera and turn handle as H106 space; no page that exists changes.',
        "calc-3#0: { kind: 'vectorDiagram', vectors: [{ name: 'n', x: 'na', y: 'nb', z: 'nc' }], space: { plane: { point: ['px', 'py', 'pz'], q: ['qx', 'qy', 'qz'], d: 'd', distance: 'D', foot: { x: 'fx', y: 'fy', z: 'fz' } } } }.",
        "~line: vectors [v], space: { line: { point: ['px', 'py', 'pz'], t: 't', at: { x: 'rx', y: 'ry', z: 'rz' }, meets: { normal: ['ma', 'mb', 'mc'], d: 'md' } } }.",
        "~helix: vectors [velocity { x: 'vx', y: 'vy', z: 'vz' }], space: { curve: { helix: { a: 'ha', c: 'hc' }, t: 't', T: 'T', speed: 'sp', length: 'L', curvature: 'k' } } (t in radians).",
        "~flux: vectors [{ name: 'F', x: 0, y: 0, z: 'Fn' }], space: { sphere: { r: 'R', k: 'fk', normals: true, fn: 'Fn', flux: 'Phi' } }. ~stokes: vectors [{ name: 'curl F', x: 0, y: 0, z: 'cz' }], space: { circle: { r: 'R', z?, k: 'sk', cap: 'disk' | 'dome' | 'both', circulation: 'C' } }.",
      ].join(' '),
    ),
    status: 'drawn',
    gallery: [
      'g.he-vectorDiagram-plane',
      'g.he-vectorDiagram-plane-upright',
      'g.he-vectorDiagram-line',
      'g.he-vectorDiagram-helix',
      'g.he-vectorDiagram-helix-tight',
      'g.he-vectorDiagram-flux',
      'g.he-vectorDiagram-stokes',
    ],
  },
  {
    ...ask(
      'HC65',
      'solidOfRevolution',
      'solidOfRevolution (new kind): a region turned about the x-axis (disks, washers) or the y-axis (shells), see-through, one slice lit with its radii, V checked',
      ['he.math.calc-2#2', 'he.math.calc-2#2~washer', 'he.math.calc-2#2~shells'],
      [
        'From M-P6. Fields (SolidOfRevolutionSpec, typesHe3b.ts): f and g? (expressions in x, the HC10 grammar), from, to, axis (x or y), method (disk, washer, shell), at? (the slice’s x, dragged), volume?, radius?, inner?, height? (checked). Disks and washers turn about x, shells about y (a line y = k later); another pairing, a washer whose inner curve passes the outer, or a shell at x < 0 draws faded with the reason.',
        "calc-2#2: { kind: 'solidOfRevolution', f: 'c*x^m', from: 0, to: 'b', axis: 'x', method: 'disk', at: 'xs', volume: 'V', radius: 'r' }.",
        "~washer: { f: 'k*x', g: 'x^2', from: 0, to: 'k', axis: 'x', method: 'washer', at: 'xs', volume: 'V', radius: 'R', inner: 'r' }.",
        "~shells: { f: 'x*(c - x)', from: 0, to: 'c', axis: 'y', method: 'shell', at: 'xs', volume: 'V', height: 'h' }.",
      ].join(' '),
    ),
    status: 'drawn',
    gallery: [
      'g.he-solidOfRevolution-disk',
      'g.he-solidOfRevolution-cone',
      'g.he-solidOfRevolution-washer',
      'g.he-solidOfRevolution-washer-thin',
      'g.he-solidOfRevolution-shells',
    ],
  },
];

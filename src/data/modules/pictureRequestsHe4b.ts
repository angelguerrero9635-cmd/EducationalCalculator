/**
 * College pictures, round 4, group B (docs/RENDERINGS_HE.md). Spread into
 * HE_PICTURE_REQUESTS in pictureRequestsHe.ts.
 */
import type { PictureRequest } from './pictureRequests';

const M = 'he.math.';
const P = 'he.physics.';
const E = 'he.engineering.';

export const HE4B_REQUESTS: PictureRequest[] = [
  {
    id: 'HC96',
    kind: 'vectorDiagram',
    what: 'The projection of u onto v along v’s dashed line, the part square to v dashed with a right-angle mark; in space, Gram–Schmidt’s u₂ from the origin',
    pages: [`${M}linear-algebra#4~projection`, `${M}linear-algebra#4~gram-schmidt`],
    status: 'drawn',
    gallery: [
      'g.he-vector-diagram-project',
      'g.he-vector-diagram-project-obtuse',
      'g.he-vector-diagram-project-gram-schmidt',
      'g.he-vector-diagram-project-gram-schmidt-near',
    ],
    notes: [
      'From M-P14 (HE-math-P14). Option `project` on `vectorDiagram` (ProjectOf in typesHe4b.ts, drawn by VectorProject.tsx through VectorHe4b.tsx, checked by he4bIssues in harness/picturesHe4b.ts: the perpendicular part’s dot with v is 0, and the named values equal the projection). Off unless a page sets it.',
      'Fields: vectors: [u, v] (u is projected onto v; components or size and direction); project: { proj?: { x?, y?, z? }, perp?: { x?, y?, z? }, k? (u·v ÷ v·v), dot? (u·v), projName? (default “projᵥ u”), perpName? (default “u − projᵥ u”; “u₂” for Gram–Schmidt) }; with space: {} and z on each vector it draws on x, y, z axes and draws the perpendicular part from the origin too. Drag u’s tip in the plane (set fixed in space).',
      "Example (~projection): { kind: 'vectorDiagram', vectors: [{ name: 'u', x: 'ux', y: 'uy' }, { name: 'v', x: 'vx', y: 'vy' }], project: { dot: 'dot', k: 'k', proj: { x: 'px', y: 'py' }, perp: { x: 'qx', y: 'qy' } } }.",
      "Example (~gram-schmidt): { kind: 'vectorDiagram', vectors: [{ name: 'v₂', x: 'ax', y: 'ay', z: 'az' }, { name: 'u₁', x: 'bx', y: 'by', z: 'bz' }], space: {}, project: { k: 'k', perp: { x: 'qx', y: 'qy', z: 'qz' }, perpName: 'u₂' }, fixed: true }.",
    ].join(' '),
  },
  {
    id: 'HC100',
    kind: 'vectorDiagram',
    what: 'Point masses as balls sized by mass on a light rod over a ruler, the balance point x_cm marked by a fulcrum under it; on a plane, the center of mass marked ⊕',
    pages: [`${P}university-1#3~center-of-mass`],
    status: 'drawn',
    gallery: [
      'g.he-vector-diagram-masses',
      'g.he-vector-diagram-masses-lopsided',
      'g.he-vector-diagram-masses-plane',
    ],
    notes: [
      'From P-P4 (HE-physics-P4). Options `masses` and `centerOfMass` on `vectorDiagram` (MassOf in typesHe4b.ts, drawn by VectorMasses.tsx through VectorHe4b.tsx, checked by he4bIssues in harness/picturesHe4b.ts: the marked point = Σmx ÷ Σm and lies between the outer masses). Off unless a page sets them.',
      "Fields: masses: [{ m, x, y?, name? }] (kg and m; any y draws the plane); centerOfMass?: { x?, y?, total? } (the page's x_cm, y_cm and M, checked); vectors: [{ name: 'x_cm' }] names the balance point (its sizes are not used). Drag a mass along the ruler (or over the plane); `keep` pins values while dragging.",
      "Example (university-1#3~center-of-mass): { kind: 'vectorDiagram', vectors: [{ name: 'x_cm' }], masses: [{ m: 'm1', x: 'x1' }, { m: 'm2', x: 'x2' }, { m: 'm3', x: 'x3' }], centerOfMass: { x: 'xcm', total: 'M' } }. The plan's example puts a mass at 0 m, which the module tests refuse for a value with a unit; the demo moves the three masses to 0.5, 1.5 and 2.5 m (x_cm = 1.8 m).",
    ].join(' '),
  },
  {
    id: 'HC171',
    kind: 'vectorDiagram',
    what: 'Up to four forces from one point, each angle from the horizontal marked, and under them the force polygon tip to tail: closed in equilibrium, else the resultant R from the first tail to the last tip',
    pages: [`${E}statics#0`, `${E}statics#0~components`],
    status: 'drawn',
    gallery: [
      'g.he-vector-diagram-forces',
      'g.he-vector-diagram-forces-shallow',
      'g.he-vector-diagram-forces-components',
      'g.he-vector-diagram-forces-four',
    ],
    notes: [
      'From ME-P26 (HE-mechanical-P26). Option `forces` on `vectorDiagram` (ForcesOf in typesHe4b.ts, drawn by VectorForces.tsx through VectorHe4b.tsx, checked by he4bIssues in harness/picturesHe4b.ts: the polygon closes when the page says equilibrium; otherwise vectors[0]’s named values equal the sum). Off unless a page sets it.',
      "Fields: forces: { list: [{ name, magnitude, direction? (° from +x) | level? (° from the horizontal) with left?, down? }] (2 to 4), equilibrium? }; unit (default N); vectors: [R] where R's x, y, magnitude, direction name the page's resultant (checked; name only, e.g. { name: 'ΣF' }, in equilibrium). Drawn fixed (no drag).",
      "Example (statics#0): { kind: 'vectorDiagram', vectors: [{ name: 'ΣF' }], unit: 'N', forces: { list: [{ name: 'T₁', magnitude: 'T1', level: 't1', left: true }, { name: 'T₂', magnitude: 'T2', level: 't2' }, { name: 'W', magnitude: 'W', direction: 270 }], equilibrium: true }, fixed: true } (the demo adds θ₁ + θ₂ as a worked value so the step reads sin(θ₁ + θ₂)).",
      "Example (statics#0~components): { kind: 'vectorDiagram', vectors: [{ name: 'R', x: 'Rx', y: 'Ry', magnitude: 'R', direction: 'beta' }], unit: 'N', forces: { list: [{ name: 'F₁', magnitude: 'F1', direction: 'a1' }, { name: 'F₂', magnitude: 'F2', direction: 'a2' }, { name: 'F₃', magnitude: 'F3', direction: 'a3' }] }, fixed: true }. The plan's α₁ = 0° is refused by the module tests (a zero with a unit), so the demo uses 15°.",
    ].join(' '),
  },
];

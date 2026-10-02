/**
 * College pictures, round 4, group C (docs/RENDERINGS_HE.md). Spread into
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

const P = 'he.physics.';

export const HE4C_REQUESTS: PictureRequest[] = [
  {
    ...ask(
      'HC99',
      'motionGraph',
      'Position as a cubic in time: x–t, v–t and a–t stacked on one time axis, the point at t on each, the tangent on x–t of slope v, the turnarounds (v = 0) ringed',
      { [`${P}university-1#0~calculus`]: 'polynomial' },
      [
        'From P-P1. New option on motionGraph (typesHe4c.ts MotionGraphHe4cSpec, reps/MotionPolynomial.tsx, sums in reps/he4cMath.ts); the other motion graphs are unchanged.',
        "Fields: { kind: 'motionGraph', polynomial: { c0 (m), c1 (m/s), c2 (m/s²), c3 (m/s³), at (t, s), position? (x), velocity? (v), acceleration? (a) }, fixed? }. Each is a variable id or a fixed number; the axis units follow c₀'s and t's units.",
        "Example (~calculus): { kind: 'motionGraph', polynomial: { c0: 'c0', c1: 'c1', c2: 'c2', c3: 'c3', at: 't', position: 'x', velocity: 'v', acceleration: 'a' } }.",
        'The window runs from t = 0 past t and the last turnaround (one more than 4t away is left out); each graph has its own range. The caption works x, v = dx/dt and a = dv/dt at t term by term and names the turnaround times. Drag the point on x–t for t. A "?" coefficient draws no curves; a "?" t draws no point or tangent.',
        'The demos add c₀ = 4 m to the plan’s x = 2t³ − 9t² + 12t (a 0 with a unit fails the module tests); the turnarounds stay at 1 s and 2 s.',
        'Harness (harness/picturesHe4c.ts): x, v and a at t by the power rule; each ringed turnaround has v = 0 within 10⁻⁶ and v changes sign there.',
      ].join(' '),
    ),
    status: 'drawn',
    gallery: ['g.he-motionGraph-polynomial', 'g.he-motionGraph-polynomial-long'],
  },
];

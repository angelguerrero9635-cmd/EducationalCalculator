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
      { [`${P}university-1#0~calculus`]: '"polynomial"' },
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
  {
    ...ask(
      'HC101',
      'impulse',
      'A force pulse on the F–t graph (rectangle, triangle or half a sine): its area J shaded and written, the rectangle of the same area dashed at the average force, Δt bracketed, and the ball it sends off at Δv',
      { [`${P}university-1#3~impulse-curve`]: '"shape"' },
      [
        'From P-P5. New option on impulse (typesHe4c.ts ImpulseShapeSpec, reps/ImpulseShape.tsx, sums in reps/he4cMath.ts); the momentum-arrow impulse picture is unchanged.',
        "Fields: { kind: 'impulse', shape: 'rectangle' | 'triangle' | 'halfSine', peak (F_max, N), time (Δt, s), impulse? (J, N·s), average? (F_avg, N), mass? (m, kg), change? (Δv, m/s), fixed? }.",
        "Example (~impulse-curve, the plan's triangle): { kind: 'impulse', shape: 'triangle', peak: 'F', time: 'dt', impulse: 'J', average: 'Favg', mass: 'm', change: 'dv' }. The page's relation follows the shape: J = F_max Δt, ½F_max Δt or (2 ÷ π)F_max Δt.",
        'The pulse is drawn to scale on F and t (F_max two-thirds up, Δt two-thirds across); the caption works J, the average force J ÷ Δt and Δv = J ÷ m. Drag the peak for F_max and the pulse’s end for Δt. A "?" peak or time draws no pulse.',
        'Harness (harness/picturesHe4c.ts): the drawn pulse’s area by quadrature = J (0.1%); F_avg·Δt = J; Δv = J ÷ m.',
      ].join(' '),
    ),
    status: 'drawn',
    gallery: [
      'g.he-impulse-triangle',
      'g.he-impulse-rectangle',
      'g.he-impulse-half-sine',
      'g.he-impulse-half-sine-golf',
    ],
  },
  {
    ...ask(
      'HC103',
      'pendulum',
      'A physical pendulum: a uniform wooden rod swinging on a steel pin, its center of mass marked and d bracketed, and the simple pendulum of the same period (length I ÷ (md)) dashed from the same pin',
      { [`${P}university-1#5~physical-pendulum`]: '"rod"' },
      [
        'From P-P9. New option on pendulum (typesHe4c.ts PendulumRodSpec, reps/PendulumRod.tsx, sums in reps/he4cMath.ts); the simple pendulum is unchanged.',
        "Fields: { kind: 'pendulum', rod: { length (L, m), pivot? (p, m below the top end; 0 or left out pins it at the end) }, mass (m, kg), g (m/s², the page's: 9.8 on physics pages), inertia? (I about the pin, kg·m²), distance? (d, m), period? (T, s), equivalent? (I ÷ (md), m), fixed? }.",
        "Example (~physical-pendulum, the plan's 1.0 m rod pinned at its end): { kind: 'pendulum', rod: { length: 'L', pivot: 0 }, mass: 'm', g: 9.8, inertia: 'I', distance: 'd', period: 'T', equivalent: 'Leq' }. A page with only m, I, d and T can pass its own I: the rod's length still sets the drawing (pass length as a fixed number).",
        'Drawn to scale (pin, rod, d and I ÷ (md) on one scale), swung 12° for the drawing only; the caption works d, I = mL² ÷ 12 + md² (when the page’s I is the uniform rod’s), T = 2π√(I ÷ (mgd)) and the equivalent length. A pin at the center of mass (d = 0) draws the rod faded and still, with the reason. Drag the center of mass for p (or the rod’s end for L when the pin is fixed).',
        'Harness (harness/picturesHe4c.ts): d = L ÷ 2 − p with the pin on the upper half; I = mL² ÷ 12 + md²; T = 2π√(I ÷ (mgd)); the equivalent length I ÷ (md).',
      ].join(' '),
    ),
    status: 'drawn',
    gallery: ['g.he-pendulum-rod', 'g.he-pendulum-rod-offset', 'g.he-pendulum-rod-near-center'],
  },
];

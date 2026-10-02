/**
 * College pictures, round 2, group H (docs/RENDERINGS_HE.md). Spread into
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

const E = 'he.engineering.';

export const HE2H_REQUESTS: PictureRequest[] = [
  {
    ...ask(
      'HC24',
      'wing',
      'An airfoil section tilted by α against the wind (lift ⟂ the wind), or a wing’s planform with its tip vortices and downwash',
      [
        `${E}aerodynamics#0`,
        `${E}aerodynamics#0~pressure-coefficient`,
        `${E}aerodynamics#0~circulation`,
        `${E}aerodynamics#0~naca`,
        `${E}aerodynamics#1`,
        `${E}aerodynamics#2`,
        `${E}aerodynamics#2~lift-slope`,
        `${E}aerodynamics#2~aspect-ratio`,
      ],
      [
        'From ACC-P1. A new kind (typesHe2h.ts, reps/Wing.tsx, the sums in reps/aeroMath.ts: NACA four-digit camber and thickness, the thin-airfoil zero-lift angle, lifting-line induced drag).',
        "Fields: { kind: 'wing', mode?: 'section' | 'planform', alpha? (°), alphaL0? (°; without digits the camber drawn is the one that gives it), digits?: { d1, d2, d34 }, chord?, camber?, camberAt?, thickness?, cl?, cd?, forces?: { lift, drag }, pressure?: { cp, speed?, at? (x ÷ c, 0.3), surface?: 'upper' | 'lower' }, circulation?: { gamma, lift? }, speed? (V∞), span?, rootChord?, tipChord?, area?, aspectRatio?, taper?, CL?, e?, CDi?, alphaI? (°), more?: [ids labelled under it] }.",
        "Example (aerodynamics#0): { kind: 'wing', alpha: 'alpha', alphaL0: 'aL0', cl: 'cl' }. Example (aerodynamics#1): { kind: 'wing', speed: 'V', cl: 'CL', cd: 'CD', forces: { lift: 'L', drag: 'D' }, more: ['rho', 'S', 'q', 'LD'] }. Example (aerodynamics#2~aspect-ratio): { kind: 'wing', mode: 'planform', span: 'b', rootChord: 'cr', tipChord: 'ct', taper: 'lam', area: 'S', aspectRatio: 'AR' }.",
        'Section: the wind is horizontal from the left, the section turns by α about its quarter chord, lift is drawn vertical (⟂ the wind, never the chord), drag along the wind to scale against L, the zero-lift line dashed through the trailing edge. Planform: to scale from b and the chords (or rectangular from AR alone), S and AR on the skin, tip vortices trailing, and the view from behind with downwash arrows ∝ α_i. A "?" draws no label and no arrow.',
        'The harness (harness/picturesHe2h.ts) checks lift ⟂ the wind, the camber peak at d₂ × 10% of the chord and d₁% high, camber, place and thickness against the chord, L ÷ D = c_l ÷ c_d, C_p = 1 − (V ÷ V∞)², the loop turning with the lift, the drawn AR = b² ÷ S within 2%, S, λ, C_Di and α_i. Demos: the 8 pages plus a symmetric section at −8° and a glider of AR 30 (the edges).',
      ].join(' '),
    ),
    status: 'drawn',
    gallery: [
      'g.he-wing-section',
      'g.he-wing-symmetric',
      'g.he-wing-pressure',
      'g.he-wing-circulation',
      'g.he-wing-naca',
      'g.he-wing-forces',
      'g.he-wing-planform',
      'g.he-wing-glider',
      'g.he-wing-lift-slope',
      'g.he-wing-tapered',
    ],
  },
];

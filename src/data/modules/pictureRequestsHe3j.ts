/**
 * College pictures, round 3, group J (docs/RENDERINGS_HE.md). Spread into
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

export const HE3J_REQUESTS: PictureRequest[] = [
  {
    ...ask(
      'HC60',
      'roadCurve',
      'Road geometry: the road from above with a car, the reaction strip and the braking strip to a box on the road, to one scale; a circular curve between tangents (PC, PI, PT, R, Δ, T, L, E) to scale, with the banked road in section for e and f; a crest vertical curve and the sight line of length S at its worst place, clearing or just touching the crest',
      [
        `${E}transportation#1`,
        `${E}transportation#1~horizontal-curve`,
        `${E}transportation#1~curve-elements`,
        `${E}transportation#1~crest-curve`,
      ],
      [
        'From ACC-P22. A new kind (typesHe3j.ts RoadCurveSpec, reps/RoadCurve.tsx, the sums in reps/he3jMath.ts).',
        "Fields: { kind: 'roadCurve', mode: 'stopping' | 'plan' | 'profile', speed? (km/h), reaction?, decel?, grade? (decimal, + uphill), g? (9.81, from the page), reactionDistance?, brakingDistance?, ssd?, radius?, delta? (°), length?, tangent?, external?, e?, f?, g1?, g2? (%), A?, curveLength?, sight?, eye? (1.08 m), object? (0.60 m), keep? }. A field is a variable id or a number. Drags: the stopping point (sets V) and the PT along the curve (sets Δ) when the page types them.",
        "Example (main): { kind: 'roadCurve', mode: 'stopping', speed: 'V', reaction: 't', decel: 'a', grade: 'G', g: 9.81, reactionDistance: 'dr', brakingDistance: 'db', ssd: 'SSD', keep: ['t', 'a', 'G'] }. ~horizontal-curve: { mode: 'plan', speed: 'V', e: 'e', f: 'f', radius: 'R' } (the arc drawn over 50° to show R). ~curve-elements: { mode: 'plan', radius: 'R', delta: 'D', length: 'L', tangent: 'T', external: 'E' }. ~crest-curve: { mode: 'profile', g1: 'g1', g2: 'g2', A: 'A', sight: 'S', curveLength: 'L', eye: 1.08, object: 0.6 }.",
        'The harness (harness/picturesHe3j.ts) checks 0.278Vt, V² ÷ (254(a ÷ g + G)) and their sum; T = R tan(Δ ÷ 2), L = RΔπ ÷ 180, E; R_min = V² ÷ (127(e + f)); A = |G₁ − G₂|, and the sight line at its worst place along the drawn curve (found numerically) touches the road exactly when L meets the formula (AS² ÷ 658 or 2S − 658 ÷ A, the constant 200(√h₁ + √h₂)² from the eye and object heights), clears it when L is longer and is blocked when shorter. Profile heights are exaggerated by a round factor, printed on the picture. Demos are metric only (the 0.278, 254 and 127 constants are for km/h and m).',
      ].join(' '),
    ),
    status: 'drawn',
    gallery: [
      'g.he-roadCurve-stopping',
      'g.he-roadCurve-stopping-downhill',
      'g.he-roadCurve-radius',
      'g.he-roadCurve-elements',
      'g.he-roadCurve-elements-sharp',
      'g.he-roadCurve-crest',
      'g.he-roadCurve-crest-short',
    ],
  },
  {
    ...ask(
      'HC88',
      'streamChannel',
      'Open-channel flow in a lined rectangular channel: the section to scale with the wetted perimeter lit beside a side view with S, n, V and Fr (sub- or supercritical); the E–y curve with its least E at y_c, the depth and its alternate depth; a hydraulic jump with y₁, the roller, y₂ and the energy line falling by h_L',
      [
        `${E}hydraulics-hydrology#0`,
        `${E}hydraulics-hydrology#0~critical-depth`,
        `${E}hydraulics-hydrology#0~jump`,
      ],
      [
        'From ACC-P19. An option on the Grade 12 `streamChannel`: a spec with `mode` draws the college picture (typesHe3j.ts StreamChannelHeSpec, reps/StreamChannelHe.tsx, the sums in reps/he3jMath.ts); a spec without `mode` keeps the slab picture unchanged.',
        "Fields: { kind: 'streamChannel', mode: 'manning' | 'specificEnergy' | 'jump', width?, depth?, n?, slope?, area?, radius?, discharge?, speed?, froude?, manningK? (1 SI, 1.49 US), g? (9.81, from the page), q?, yc?, Emin?, energy?, y1?, V1?, Fr1?, y2?, hL?, keep? }. A field is a variable id or a number. Drags: the depth (manning: the water surface; specificEnergy: the point on the curve) when the page types it.",
        "Example (main): { kind: 'streamChannel', mode: 'manning', width: 'b', depth: 'y', n: 'n', slope: 'S', area: 'A', radius: 'R', discharge: 'Q', speed: 'V', froude: 'Fr', g: 9.81, keep: ['b', 'n', 'S'] }. ~critical-depth: { mode: 'specificEnergy', discharge: 'Q', width: 'b', q: 'q', yc: 'yc', Emin: 'Emin', depth: 'y', energy: 'E', g: 9.81 }. ~jump: { mode: 'jump', y1: 'y1', V1: 'V1', Fr1: 'Fr1', y2: 'y2', hL: 'hL', g: 9.81 }.",
        'The harness (harness/picturesHe3j.ts) checks A = by, R = A ÷ (b + 2y), Manning’s Q, V = Q ÷ A and Fr = V ÷ √(gy); q = Q ÷ b, y_c = (q² ÷ g)^(1/3), E_min = 1.5y_c, E least at y_c, E at y and its alternate depth equal; Fr₁, y₂ = (y₁ ÷ 2)(√(1 + 8Fr₁²) − 1) > y₁ when Fr₁ > 1, and h_L. A jump with Fr₁ ≤ 1 draws faded with the reason. The side view steepens the slope and the jump’s length is shortened; the captions say so.',
      ].join(' '),
    ),
    status: 'drawn',
    gallery: [
      'g.he-streamChannel-manning',
      'g.he-streamChannel-manning-steep',
      'g.he-streamChannel-specificEnergy',
      'g.he-streamChannel-specificEnergy-shallow',
      'g.he-streamChannel-jump',
      'g.he-streamChannel-jump-weak',
    ],
  },
];

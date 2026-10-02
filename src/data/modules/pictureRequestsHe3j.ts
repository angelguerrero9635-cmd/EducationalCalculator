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

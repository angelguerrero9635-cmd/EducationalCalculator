/**
 * College pictures, round 4, group K (docs/RENDERINGS_HE.md). Spread into
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

export const HE4K_REQUESTS: PictureRequest[] = [
  {
    ...ask(
      'HC160',
      'dialyzer',
      'A hollow-fiber dialyzer: blood in at C_in and out at C_out through the fibers, dialysate the other way through the shell, and the blood flow as a band with its cleared share K',
      [`${E}biotransport#2`],
      [
        'From B-P29. New kind (typesHe4k.ts DialyzerSpec, reps/Dialyzer.tsx, reps/he4kMath.ts).',
        "Fields: { kind: 'dialyzer', qb (Q_b, mL/min), cin, cout (C_in, C_out, mg/dL), k? (the page's K, mL/min, checked), qd? (dialysate flow, a label), t? (min), v? (L), ktv?, urr? (% or a share) }.",
        'Painted: the shell (plastic, a sheen) full of dialysate with chevrons pointing left, five fibers carrying blood left to right, urea dots along each fiber crowding where C is high (C falls from C_in to C_out exponentially along the fiber; the dots are spaced by ∫C dx), the blood and dialysate ports with arrows. Under it the band of Q_b with the cleared share (C_in − C_out) ÷ C_in shaded and K written above it. The caption works K = Q_b(C_in − C_out) ÷ C_in, then Kt/V = Kt ÷ 1000V and URR = 1 − e^(−Kt/V) when t and V are given. A "?" C or Q_b draws no dots, label or band; C_out > C_in draws faded with the reason. No handles.',
        "Example: { kind: 'dialyzer', qb: 'qb', cin: 'cin', cout: 'cout', k: 'k', t: 't', v: 'v', ktv: 'ktv', urr: 'urr' } (300 mL/min, 100 → 40 mg/dL → K = 180 mL/min; 240 min, 40 L → Kt/V = 1.08, URR = 66%).",
        'Harness (harness/picturesHe4k.ts): K = Q_b − Q_b·C_out ÷ C_in; C_out ≤ C_in; the dots along a fiber match a midpoint sum of C ÷ C_in; Kt/V and URR as written.',
      ].join(' '),
    ),
    status: 'drawn',
    gallery: ['g.he-dialyzer-clearance', 'g.he-dialyzer-high-flow'],
  },
];

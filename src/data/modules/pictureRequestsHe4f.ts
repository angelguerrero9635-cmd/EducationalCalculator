/**
 * College pictures, round 4, group F (docs/RENDERINGS_HE.md). Spread into
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

const E = 'he.earth-science.';

export const HE4F_REQUESTS: PictureRequest[] = [
  {
    ...ask(
      'HC116',
      'ternary',
      'A triangle plot of three amounts with a 10% grid and the corners named; the IUGS QAP fields (numbered and keyed) or the feldspar fields (plagioclase along the Ab–An edge, alkali feldspars along Ab–Or), the point’s field lit and named',
      [`${E}physical-geology#0`, `${E}mineralogy#1~plagioclase`],
      [
        'From EG-P1. New kind (typesHe4f.ts TernarySpec, reps/Ternary.tsx; fields and their polygons in reps/he4fMath.ts).',
        "Fields: { kind: 'ternary', a (top corner), b (bottom left), c (bottom right) (amounts in one unit, normalized by their sum), labels: [top, left, right], fields?: 'qap' | 'feldspar', share? (the page's c ÷ (b + c) in %, dashed from the top corner), normalized? ([a′, b′, c′] the page's percents) }.",
        'QAP: Q at the top, A left, P right; rows at Q′ 5, 20, 60, 90%, P ÷ (A + P) lines at 10, 35, 65, 90%; fields 1a–10 numbered in the triangle and keyed under it. Feldspar: Or at the top, Ab left, An right; plagioclase (Or ≤ 10%) named albite … anorthite at An 10, 30, 50, 70, 90% under the base; alkali feldspars (An ≤ 10%) anorthoclase to Or 37%, then sanidine and orthoclase; the miscibility gap between (straight boundaries, a teaching simplification). A "?" amount or a zero sum plots nothing. No handles. Later also sand–silt–clay (a third `fields` value).',
        "Example (physical-geology#0): { kind: 'ternary', a: 'Q', b: 'A', c: 'P', labels: ['Q', 'A', 'P'], fields: 'qap', share: 'share', normalized: ['qn', 'an', 'pn'] } (Q 25, A 30, P 20 → 33.3, 40.0, 26.7%; share 40% → field 3b, monzogranite). Example (mineralogy#1~plagioclase): { kind: 'ternary', a: 0, b: 'na', c: 'ca', labels: ['Or', 'Ab', 'An'], fields: 'feldspar', share: 'an' } (Ca 0.6 → An₆₀, labradorite).",
        'Harness (harness/picturesHe4f.ts): the point’s distance from each side is that amount ÷ the sum (0.5%), the page’s normalized values and share agree; the field the caption names (by the rules) contains the point (by its drawn polygon).',
      ].join(' '),
    ),
    status: 'drawn',
    gallery: [
      'g.he-ternary-qap',
      'g.he-ternary-qap-diorite',
      'g.he-ternary-feldspar',
      'g.he-ternary-feldspar-albite',
    ],
  },
];

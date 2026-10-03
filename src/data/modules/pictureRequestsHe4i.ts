/**
 * College pictures, round 4, group I (docs/RENDERINGS_HE.md). Spread into
 * HE_PICTURE_REQUESTS in pictureRequestsHe.ts.
 */
import type { PictureRequest } from './pictureRequests';

const ask = (
  id: string,
  kind: string,
  what: string,
  pages: string[],
  notes?: string,
): PictureRequest => ({
  id,
  what,
  kind,
  pages,
  status: 'requested',
  gallery: [],
  ...(notes ? { notes } : {}),
});

const B = 'he.biology.';

export const HE4I_REQUESTS: PictureRequest[] = [
  {
    ...ask(
      'HC141',
      'curvedSolid',
      'Why cells are small: the cell as a lit sphere of radius r with A = 4πr², V = 4/3 πr³ and A ÷ V = 3 ÷ r under it, and a cell r × k beside it at the same scale with its own three lines',
      [`${B}principles-1#1`],
      [
        'From B-P1. New option on curvedSolid (typesHe4i.ts CurvedSolidHe4i, reps/CellRatioHe4i.tsx); without `ratio` the glass solids are unchanged.',
        "Fields: { kind: 'curvedSolid', shape: 'sphere', radius, extent, ratio: { area?, volume?, ratio?, compare? (a factor or a value, default 2; false draws one cell) } }.",
        'The cells are painted (a lit ball and its membrane), r marked and written over each; under each A, V and A ÷ V to 3 figures (the page’s values for the first cell, worked out for the second). Drag the first cell’s rim to change r; the scale holds while dragging. A "?" r draws no cell; a "?" A, V or ratio leaves its line out.',
        "Example: { kind: 'curvedSolid', shape: 'sphere', radius: 'r', extent: 10, ratio: { area: 'A', volume: 'V', ratio: 'q', compare: 2 } }, with r in μm, A in μm², V in μm³ and A ÷ V in per μm.",
        'Harness (harness/picturesHe4i.ts): a sphere; A = 4πr², V = 4/3 πr³, A ÷ V = 3 ÷ r to 3 significant figures; the factor is positive.',
      ].join(' '),
    ),
    status: 'drawn',
    gallery: ['g.he-curvedSolid-ratio', 'g.he-curvedSolid-ratio-bacterium'],
  },
];

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
  {
    ...ask(
      'HC142',
      'cellDivision',
      'Chromosomes, chromatids and DNA by stage: four cells (G₁, after S, after meiosis I, a gamete) with their chromosomes, and under them each stage’s chromosomes, chromatids and DNA in c (2c, 4c, 2c, 1c)',
      [`${B}principles-1#3`],
      [
        'From B-P3. New option on the cellDivision calculator picture (typesHe4i.ts CellDivisionHe4i, reps/DivisionContentHe4i.tsx); without `content` the body cell, gamete and zygote picture is unchanged.',
        "Fields: { kind: 'cellDivision', diploid, haploid?, chromatids?, combinations?, content: { chromatids? (after S, 2 × 2n), dna? (G₁ content in c, a value or a number; default 2), gamete? (the gamete's c) } }.",
        'Every chromosome is drawn up to 2n = 6 (maternal red, paternal blue; duplicated after S and after meiosis I); past that one pair, or one chromosome, and “× n”. The caption works each stage and, with `combinations`, 2ⁿ. A "?" 2n draws empty cells and a blank table; a "?" dna leaves the DNA row blank.',
        "Example: { kind: 'cellDivision', diploid: 'D', haploid: 'n', chromatids: 'X', combinations: 'C', content: { chromatids: 'X', dna: 'c1', gamete: 'c4' } }, with the page's G₁ content c1 = 2 and DNA after S c2 = c1 × X ÷ 2n.",
        'Harness (harness/picturesHe4i.ts): chromatids = 2 × chromosomes after S and after meiosis I (to metaphase II), 1 × in G₁ and the gamete; the page’s chromatids after S = 2 × 2n; c doubles in S and halves at each meiotic division (gamete = G₁ ÷ 2).',
      ].join(' '),
    ),
    status: 'drawn',
    gallery: ['g.he-cellDivision-content', 'g.he-cellDivision-content-four'],
  },
];

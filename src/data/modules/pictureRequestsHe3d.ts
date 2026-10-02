/**
 * College pictures, round 3, group D (docs/RENDERINGS_HE.md). Spread into
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

const EP = 'he.engineering.engineering-programming';
const CODE = '"kind":"code"';

export const HE3D_REQUESTS: PictureRequest[] = [
  {
    ...ask(
      'HC48',
      'codeTrace',
      'A code trace (explore) and code cards: MATLAB and Python side by side, the line running lit, the variables table by scene',
      {
        [`${EP}#0~trace`]: '"codeTrace"',
        [`${EP}#0~syntax`]: CODE,
        [`${EP}#1~elementwise`]: CODE,
        [`${EP}#2~which-axes`]: CODE,
        [`${EP}#3~error-types`]: CODE,
      },
      [
        'From ME-P24. Drawn by layouts/codeTraceFigure.tsx (types in typesHe3d.ts); the explore case in ExploreLayout.tsx and the card in he3dCards.tsx.',
        'Explore figure: { kind: "codeTrace", matlab?: string[], python?: string[], vars: string[] }; scene field trace: { line?: the MATLAB line (1-based), pyLine?: the Python line (default line), rows: the variables table so far, one row per pass with a value per var (the last row lit), test?: { text: "32 <= 20", holds: false } }. Code keeps straight quotes and spaces; side by side when the longest line fits half the width, else stacked.',
        'Card figure: { kind: "code", code: "A(end)" } (lines split at \\n, up to 4 lines of 24 characters) on a sort card or sequence stage. The card label stays under it (unique, checked for curly quotes), so a neutral "Snippet A" keeps the sort fair.',
        'Harness (picturesHe3d.ts, from layoutFigures.ts): the lit lines exist and are not blank, each row has a value per variable, a numeric test agrees with holds, no curly quotes in code, card sizes.',
        'Example (~trace): the doubling loop of g.he-code-trace-while, scenes Start, Pass 1–5, End. ~syntax: the plan’s ten cards as in g.he-code-card-syntax. ~elementwise, ~which-axes (a code line per card where the card is code) and ~error-types put their snippets on cards the same way.',
      ].join(' '),
    ),
    status: 'drawn',
    gallery: ['g.he-code-trace-while', 'g.he-code-trace-for', 'g.he-code-card-syntax'],
  },
];

/**
 * College pictures, round 4, group N (docs/RENDERINGS_HE.md). Spread into
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

export const HE4N_REQUESTS: PictureRequest[] = [
  {
    ...ask(
      'HC184',
      'karnaugh',
      'A 2-, 3- or 4-variable K-map in Gray order beside its truth table, the 1s and don’t-cares in the cells, each group ringed in its own outline style (wrapping open at the edges) with its product term listed; as an explore figure, the map per scene or a truth table with a column per sub-expression and two lit columns compared row by row',
      [`${E}digital-logic#1`, `${E}discrete-math#0~truth-table`],
      [
        'From EC-P19. New calculator kind and explore figure `karnaugh` (typesHe4n.ts; reps/Karnaugh.tsx, reps/karnaughMath.ts, layouts/karnaughFigure.tsx).',
        "Explore fields: figure { kind: 'karnaugh', mode?: 'map' | 'table' }; scene `kmap`: { names (the variables, first the most significant), minterms?, dontCares?, groups? (each a list of minterms; left out, the minimal sum of products is drawn), columns? (table: expressions with ¬ ∧ ∨ → ↔ ⊕, ′ and juxtaposition), lit? (table: up to two column indices; two are compared and each row that differs is marked ≠) }.",
        "Example (digital-logic#1 scene): { label: 'Two pairs', lines: [...], kmap: { names: ['A', 'B', 'C'], minterms: [0, 2, 5, 7], groups: [[0, 2], [5, 7]] } } writes f = Σm(0, 2, 5, 7) = A′C′ + AC. Example (discrete-math#0~truth-table): figure { kind: 'karnaugh', mode: 'table' }, kmap: { names: ['p', 'q'], columns: ['¬p', '¬q', 'p → q', '¬q → ¬p'], lit: [2, 3] }.",
        "Calculator fields: { kind: 'karnaugh', n (inputs, 2–4), names?, minterms?, dontCares? (fixed; ringed in the minimal SOP), lit? (a minterm value lit in map and table with its product term), rows? (2ⁿ), functions? (2^(2ⁿ)) } — for digital-logic#1~mux-decoder: { kind: 'karnaugh', n: 'n', minterms: [0, 2, 5, 7], rows: 'rows', functions: 'functions' }. A function that needs more inputs than n is left out with the reason in the caption.",
        'Harness (harness/picturesHe4n.ts): every scene group is a power-of-two block (wrapping allowed) of 1s and don’t-cares with at least one 1, at most 4 groups; the written SOP read back as a truth table equals the scene’s function off the don’t-cares; table columns parse over the scene’s variables; rows = 2ⁿ and functions = 2^(2ⁿ).',
      ].join(' '),
    ),
    status: 'drawn',
    gallery: [
      'g.he-karnaugh-three',
      'g.he-karnaugh-four',
      'g.he-karnaugh-map',
      'g.he-karnaugh-truth-table',
    ],
  },
];

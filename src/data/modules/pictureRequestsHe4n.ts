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
  {
    ...ask(
      'HC185',
      'explore figure stateDiagram',
      'A state diagram in a fixed layout: bubbles with Moore outputs (S3/1) or Mealy arrow labels (1/0), self-loops, an entry arrow at the start state; a scene’s input replayed, the state reached lit and the last arrow heavy, and an input tape with the state and output after each bit',
      [`${E}digital-logic#3`],
      [
        'From EC-P21. New explore figure `stateDiagram` (typesHe4n.ts StateDiagramFigure; layouts/stateDiagramFigure.tsx; the replay in reps/he4nMath.ts).',
        "Fields: figure { kind: 'stateDiagram', machine: 'moore' | 'mealy', inputs: ['0', '1'], start, states: [{ name, output? (Moore), x, y (a unit box), loop? (self-loop angle in degrees, default 270 = up) }], arrows: [{ from, to, input, output? (Mealy), bend? (two opposite arrows bend apart by themselves) }], tape? (the whole input) }; scene `fsm`: { input (the bits read so far), state? (checked) }.",
        "Example (digital-logic#3): the Moore 101 detector with S0 (0, 0.5, loop 180), S1 (0.5, 0, loop 270), S2 (0.5, 1), S3/1 (1, 0.5), tape '110101', scenes { fsm: { input: '', state: 'S0' } } … { fsm: { input: '110101', state: 'S3' } }; a diamond keeps the arrows from crossing.",
        'Layout test (harness/picturesHe4n.ts): every state has exactly one arrow per input value; arrows name states and inputs; Moore states have outputs and Mealy arrows have outputs; each scene’s input is the start of the tape and replays to the state it names.',
      ].join(' '),
    ),
    status: 'drawn',
    gallery: ['g.he-stateDiagram-moore', 'g.he-stateDiagram-mealy'],
  },
  {
    ...ask(
      'HC186',
      'pipelineDiagram',
      'A pipeline grid: instructions down the side, clock cycles across, each cell its stage (IF, ID, EX, MEM, WB) in its own fill; up to 8 rows, then “…” and the last instruction after a gap so its last cell sits at cycle k + n − 1, bracketed; stall bubbles and forwarding arrows when given',
      [`${E}computer-architecture#2`],
      [
        'From EC-P23. New kind `pipelineDiagram` (typesHe4n.ts PipelineSpec; reps/PipelineDiagram.tsx; rows in reps/he4nMath.ts).',
        "Fields: { kind: 'pipelineDiagram', k, n, ts?, t1?, cycles?, time?, speedup? (said in the caption), stages? (names; default IF ID EX MEM WB for k = 5, S1 … Sk otherwise), names? (instruction labels), stalls?: [{ instr, before? (default 'EX'), count }], forward?: [{ from, to, out? (default 'EX'), in? (default 'EX') }] }. Narrow cells write one-letter codes with a key (F D X M W), narrower still none.",
        "Example (computer-architecture#2 main): { kind: 'pipelineDiagram', k: 'k', n: 'n', ts: 'ts', t1: 't1', cycles: 'cycles', time: 'time', speedup: 'speedup' } with 5, 100, 200 ps, 800 ps → 104 cycles, 20.8 ns, 3.85. A stall page (~hazard-cpi) can pass stalls: [{ instr: 2, before: 'EX', count: 's' }] and forward: [{ from: 1, to: 2, out: 'MEM', in: 'EX' }].",
        'Harness (harness/picturesHe4n.ts): the last cell sits at cycle k + n − 1 plus the stalls (k + n − 1 with none); cycles equals it; speedup = n·t₁ ÷ (cycles·t_s); stalls name stages; forwarding goes to a later instruction.',
      ].join(' '),
    ),
    status: 'drawn',
    gallery: [
      'g.he-pipelineDiagram-hundred',
      'g.he-pipelineDiagram-deep',
      'g.he-pipelineDiagram-stall',
    ],
  },
  {
    ...ask(
      'HC187',
      'explore figure dataStructure (and calculator dataStructure)',
      'Data structures replayed from a scene’s operations: a stack with its top, a queue with front and rear, a circular buffer as a ring of numbered slots, a linked list of nodes and arrows, a sorted array with binary search’s low, mid and high; the last added lit, the last removed outside with “out”; and for searching, binary search’s halvings as bars beside linear search',
      [`${E}data-structures#0`, `${E}data-structures#2`],
      [
        'From EC-P25. New explore figure `dataStructure` (typesHe4n.ts DataStructureFigure; layouts/dataStructureFigure.tsx; the replay in reps/he4nMath.ts) and, for the calculator page #2, a calculator kind `dataStructure` (SearchSpec; reps/SearchRanges.tsx).',
        "Explore fields: figure { kind: 'dataStructure' }; scene `ds`: { structure: 'stack' | 'queue' | 'ring' | 'list' | 'array', start?, ops? ('push 3', 'pop', 'enqueue 5', 'dequeue', 'insert head 4', 'insert tail 4', 'delete head'), slots? and front? (ring), holds? and out? (checked), values?, target?, step? (array: the comparison shown) }.",
        "Example (data-structures#0): { label: 'Pop', ds: { structure: 'stack', ops: ['push 3', 'push 5', 'push 2', 'pop'], holds: [3, 5], out: 2 } }; the ring: { structure: 'ring', slots: 8, front: 6, start: [4, 8], ops: ['enqueue 1'], holds: [4, 8, 1] }. Calculator (data-structures#2 main): { kind: 'dataStructure', n: 'n', binary: 'binary', linear: 'linear', average: 'average' } with 1000 → 10, 1000, 500.5.",
        'Harness (harness/picturesHe4n.ts): each scene’s operations replayed give the contents it names and the value that came out, every operation fits its structure and never takes from an empty one, the ring has 3–12 slots, the array is sorted with the step a real comparison; the calculator’s bars number ⌊log₂n⌋ + 1 and equal binary, linear = n, average = (n + 1)/2.',
      ].join(' '),
    ),
    status: 'drawn',
    gallery: [
      'g.he-dataStructure-lists',
      'g.he-dataStructure-binary-search',
      'g.he-dataStructure-search',
      'g.he-dataStructure-search-billion',
    ],
  },
  {
    ...ask(
      'HC188',
      'venn',
      'Three sets: three circles, each named with its size and outlined in its own colour and dash, the count in each of the 7 regions worked out from the 7 values, and the union bracketed; with a total, the universe’s box and “neither”',
      [`${E}discrete-math#1`],
      [
        "From EC-P27. New option `three` on `venn` (typesHe4n.ts VennThree; reps/VennThree.tsx; regions in reps/he4nMath.ts): a new member { kind: 'venn', three } of the Representation union, so existing venn pages are unchanged.",
        "Fields: { kind: 'venn', three: { a, b, c, ab, ac, bc, abc, union?, total?, names? ([A, B, C] names, e.g. ['Art', 'Band', 'Drama']) } }. A region whose values include a “?” stays blank; a region below 0 fades the drawing and the caption says why.",
        "Example (discrete-math#1 main): { kind: 'venn', three: { a: 'a', b: 'b', c: 'c', ab: 'ab', ac: 'ac', bc: 'bc', abc: 'abc', union: 'union', names: ['Art', 'Band', 'Drama'] } } with 40, 35, 30, 15, 10, 12, 5 → regions 20, 13, 13, 10, 5, 7, 5 and the union 73. The page should carry the limit “every region is 0 or more” (the demo’s regionLimit).",
        'Harness (harness/picturesHe4n.ts vennThreeIssues): the 7 regions add to the union and to the page’s union value whenever every region is 0 or more (the page limit keeps them so; counts it refuses are drawn faded with the reason).',
      ].join(' '),
    ),
    status: 'drawn',
    gallery: ['g.he-venn-three', 'g.he-venn-three-nested'],
  },
];

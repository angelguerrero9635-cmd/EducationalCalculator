/**
 * College gallery demos, round 4, group N (docs/RENDERINGS_HE.md). Each stands in for the
 * college page that waits, built from the plan's worked example. Spread into gallery.ts.
 *
 * HC184: `karnaugh`, the calculator picture (he.engineering.digital-logic#1~mux-decoder's rows
 * and functions, with a 3- and a 4-variable function) and the explore figure
 * (digital-logic#1, discrete-math#0~truth-table).
 *
 * HC185: the `stateDiagram` explore figure (digital-logic#3): the Moore 101 detector traced on
 * 110101, and at the edge the Mealy detector, one state fewer.
 */
import type { Relation, Values, VariableDef } from '@/engine/types';

import type { LayoutDef } from './layouts';
import type { ModuleDef, Representation, StepText } from './types';
import type { StateDiagramFigure } from './typesHe4n';

type Solver = (v: Values) => number | number[] | undefined;
type Rule = { relation: Relation; steps: Record<string, StepText> };

/** A value with its unit (one unit: the formula is written in it). */
const num = (
  id: string,
  symbol: string,
  name: string,
  unit: string | undefined,
  min: number,
  max: number,
  more: Partial<VariableDef> = {},
): VariableDef => ({
  id,
  symbol,
  name,
  ...(unit ? { unit, units: [unit] } : {}),
  min,
  max,
  ...more,
});

/** A value worked out, never typed. */
const out = (
  id: string,
  symbol: string,
  name: string,
  unit?: string,
  more: Partial<VariableDef> = {},
) => num(id, symbol, name, unit, -1e18, 1e18, { derived: true, ...more });

/** A finite number, or nothing. */
const fin = (x: number) => (Number.isFinite(x) ? x : undefined);

/** A relation with its steps: each variable's solver, expression and explanation. */
function rule(
  id: string,
  display: string,
  vars: string[],
  residual: (v: Values) => number,
  parts: Record<string, [Solver, StepText['expr'], StepText['how']]>,
): Rule {
  const solve: Record<string, Solver> = {};
  const steps: Record<string, StepText> = {};
  for (const [v, [fn, expr, how]] of Object.entries(parts)) {
    solve[v] = fn;
    steps[v] = { expr, how };
  }
  for (const v of vars) if (!(v in solve)) solve[v] = () => undefined;
  return { relation: { id, display, vars, residual, solve }, steps };
}

/** A value worked out from others, never solved backwards. */
const derive = (
  id: string,
  x: string,
  inputs: string[],
  display: string,
  f: (v: Values) => number | undefined,
  expr: StepText['expr'],
  how: StepText['how'],
): Rule =>
  rule(id, display, [x, ...inputs], (v) => v[x]! - (f(v) ?? NaN), {
    [x]: [(v) => fin(f(v) ?? NaN), expr, how],
  });

/** A demo from its rules. */
function page(
  d: Omit<ModuleDef, 'relations' | 'steps' | 'representation' | 'startWith'> & {
    rules: Rule[];
    representation: Representation;
    startWith?: string[];
  },
): ModuleDef {
  const { rules, ...rest } = d;
  return {
    ...rest,
    unitSystems: ['metric'],
    startWith: d.startWith ?? d.variables.filter((v) => !v.derived).map((v) => v.id),
    relations: rules.map((r) => r.relation),
    steps: Object.fromEntries(rules.map((r) => [r.relation.id, r.steps])),
  };
}

/** Values worked out from the typed ones of an example, in order. */
function example(typed: Values, ...work: [string, (v: Values) => number][]): Values {
  const v: Values = { ...typed };
  for (const [id, f] of work) v[id] = f(v);
  return v;
}

// ─── HC184: K-maps (digital-logic#1~mux-decoder; the map and truth-table explores) ───

const rowsRule = derive(
  'rows',
  'rows',
  ['n'],
  '{rows} = 2^{n}',
  (v) => 2 ** v.n!,
  '2^{n}',
  'Each input is 0 or 1, so n inputs make 2ⁿ rows: one K-map cell per row.',
);
const functionsRule = derive(
  'functions',
  'functions',
  ['rows'],
  '{functions} = 2^{rows}',
  (v) => 2 ** v.rows!,
  '2^{rows}',
  'A function picks 0 or 1 for every row, so there are 2 to the number of rows.',
);

const kmapPage = (
  id: string,
  title: string,
  use: string,
  n: number,
  minterms: number[],
  dontCares?: number[],
) =>
  page({
    id,
    title,
    use,
    assumptions: [
      'The map lists the rows in Gray order (00, 01, 11, 10), so neighbouring cells differ in one input.',
      'Each ringed block of 1, 2, 4 or 8 cells is one product term; the map wraps at its edges.',
      'The function drawn is the example; the counts follow the number of inputs you type.',
    ],
    variables: [
      num('n', 'n', 'Inputs', undefined, 2, 4, { integer: true, step: 1 }),
      out('rows', 'rows', 'Truth-table rows', undefined, { integer: true }),
      out('functions', 'N_f', 'Possible functions', undefined, { integer: true }),
    ],
    rules: [rowsRule, functionsRule],
    example: example({ n }, ['rows', (v) => 2 ** v.n!], ['functions', (v) => 2 ** v.rows!]),
    startWith: ['n'],
    representation: {
      kind: 'karnaugh',
      n: 'n',
      minterms,
      ...(dontCares ? { dontCares } : {}),
      rows: 'rows',
      functions: 'functions',
    },
  });

const KMAP_THREE = kmapPage(
  'g.he-karnaugh-three',
  'Rows, cells and functions of a truth table',
  'Use this for “A truth table has 3 inputs. How many rows, and how many different functions?”',
  3,
  [0, 2, 5, 7],
);

/** The edge of the map's range: four inputs, 16 cells, the four corners one block. */
const KMAP_FOUR = kmapPage(
  'g.he-karnaugh-four',
  'A four-input K-map',
  'Use this for “How many functions of 4 inputs are there, and how many cells has their K-map?”',
  4,
  [0, 2, 8, 10],
);

const kmapExplore: LayoutDef = {
  kind: 'explore',
  id: 'g.he-karnaugh-map',
  title: 'Simplify with a K-map',
  use: 'Use this for “Simplify f(A, B, C) = Σm(0, 2, 5, 7) with a K-map.”',
  assumptions: [
    'Group the 1s in blocks of 1, 2, 4 or 8, as large as you can; each block is one product term.',
    'A don’t-care (X) may join a block if it makes the block larger, and is left out otherwise.',
    'The truth table beside the map numbers each row; the map’s cell holds the same number.',
  ],
  figure: { kind: 'karnaugh' },
  scenes: [
    {
      label: 'Two pairs',
      lines: [
        'Cells 0 and 2 are neighbours across the map’s edge, and so are 5 and 7: two pairs give f = A′C′ + AC.',
      ],
      kmap: {
        names: ['A', 'B', 'C'],
        minterms: [0, 2, 5, 7],
        groups: [
          [0, 2],
          [5, 7],
        ],
      },
    },
    {
      label: 'A block of four',
      lines: ['The four 1s fill both rows of the C columns: one block of four, f = C.'],
      kmap: { names: ['A', 'B', 'C'], minterms: [1, 3, 5, 7], groups: [[1, 3, 5, 7]] },
    },
    {
      label: 'Corners wrap',
      lines: [
        'The map wraps top to bottom and side to side, so the four corners are one block: f = B′D′.',
      ],
      kmap: {
        names: ['A', 'B', 'C', 'D'],
        minterms: [0, 2, 8, 10],
        groups: [[0, 2, 8, 10]],
      },
    },
    {
      label: 'Don’t-cares',
      lines: [
        'Rows 5 and 7 never happen, so they may be 1: with them, 1 and 3 make a block of four, f = C.',
      ],
      kmap: {
        names: ['A', 'B', 'C'],
        minterms: [1, 3],
        dontCares: [5, 7],
        groups: [[1, 3, 5, 7]],
      },
    },
    {
      label: 'No pair',
      lines: ['Cells 1 and 2 are not neighbours, so each is its own term: f = A′B + AB′.'],
      kmap: { names: ['A', 'B'], minterms: [1, 2], groups: [[1], [2]] },
    },
  ],
};

const truthExplore: LayoutDef = {
  kind: 'explore',
  id: 'g.he-karnaugh-truth-table',
  title: 'Build a truth table',
  use: 'Use this for “Is ¬q → ¬p equivalent to p → q? Build the truth table.”',
  assumptions: [
    'Each row is one choice of true (T) or false (F) for p and q; two variables make 4 rows.',
    'Two statements are equivalent when their columns agree in every row.',
  ],
  figure: { kind: 'karnaugh', mode: 'table' },
  scenes: [
    {
      label: 'p → q',
      lines: ['p → q is false only when p is true and q is false: the second row.'],
      kmap: { names: ['p', 'q'], columns: ['¬p', 'p → q'], lit: [1] },
    },
    {
      label: 'Contrapositive',
      lines: ['¬q → ¬p is false in exactly the same row, so the columns match: equivalent.'],
      kmap: { names: ['p', 'q'], columns: ['¬p', '¬q', 'p → q', '¬q → ¬p'], lit: [2, 3] },
    },
    {
      label: 'Converse',
      lines: ['The converse q → p is false in a different row, so it is not equivalent.'],
      kmap: { names: ['p', 'q'], columns: ['p → q', 'q → p'], lit: [0, 1] },
    },
    {
      label: 'p ↔ q',
      lines: ['p ↔ q holds when both directions hold: true exactly when p and q match.'],
      kmap: { names: ['p', 'q'], columns: ['p → q', 'q → p', 'p ↔ q'], lit: [2] },
    },
    {
      label: 'De Morgan',
      lines: ['¬(p ∧ q) and ¬p ∨ ¬q agree in every row: “not both” is “not one or not the other.”'],
      kmap: { names: ['p', 'q'], columns: ['p ∧ q', '¬(p ∧ q)', '¬p ∨ ¬q'], lit: [1, 2] },
    },
  ],
};

// ─── HC185: state machines (digital-logic#3) ─────────────────────────────────

const MOORE_101: StateDiagramFigure = {
  kind: 'stateDiagram',
  machine: 'moore',
  inputs: ['0', '1'],
  start: 'S0',
  tape: '110101',
  states: [
    { name: 'S0', output: '0', x: 0, y: 0.5, loop: 180 },
    { name: 'S1', output: '0', x: 0.5, y: 0, loop: 270 },
    { name: 'S2', output: '0', x: 0.5, y: 1 },
    { name: 'S3', output: '1', x: 1, y: 0.5 },
  ],
  arrows: [
    { from: 'S0', to: 'S1', input: '1' },
    { from: 'S0', to: 'S0', input: '0' },
    { from: 'S1', to: 'S1', input: '1' },
    { from: 'S1', to: 'S2', input: '0' },
    { from: 'S2', to: 'S3', input: '1' },
    { from: 'S2', to: 'S0', input: '0' },
    { from: 'S3', to: 'S1', input: '1' },
    { from: 'S3', to: 'S2', input: '0' },
  ],
};

const MOORE_TRACE: [string, string, string][] = [
  ['Start', 'S0', 'The machine starts in S0, having seen nothing of 101 yet; its output is 0.'],
  ['Bit 1: 1', 'S1', 'A 1 could begin 101, so the machine moves to S1, which remembers “1”.'],
  ['Bit 2: 1', 'S1', 'Another 1 still only begins 101, so the machine stays in S1.'],
  ['Bit 3: 0', 'S2', 'After 1 then 0 the machine is in S2, which remembers “10”.'],
  ['Bit 4: 1', 'S3', 'The 1 completes 101: S3 outputs 1, the first detection.'],
  ['Bit 5: 0', 'S2', 'The last 1 and this 0 make “10” again, so the machine goes to S2.'],
  ['Bit 6: 1', 'S3', 'Overlapping 101 is found again: back in S3, the output is 1.'],
];

const stateMoore: LayoutDef = {
  kind: 'explore',
  id: 'g.he-stateDiagram-moore',
  title: 'Trace a state diagram',
  use: 'Use this for “Trace the 101 detector on the input 110101.”',
  assumptions: [
    'Each state remembers just enough of the input to decide what comes next.',
    'A Moore machine writes its output in the state: S3/1 means S3 outputs 1.',
    'Overlapping: the last 1 of one 101 may start the next.',
  ],
  figure: MOORE_101,
  scenes: MOORE_TRACE.map(([label, state, line], k) => ({
    label,
    lines: [line],
    fsm: { input: '110101'.slice(0, k), state },
  })),
};

const stateMealy: LayoutDef = {
  kind: 'explore',
  id: 'g.he-stateDiagram-mealy',
  title: 'A Mealy machine for 101',
  use: 'Use this for “Draw the Mealy 101 detector and trace it on 10101.”',
  assumptions: [
    'A Mealy machine writes its output on the arrow: 1/1 reads input 1, output 1.',
    'The output can change as soon as the input does, so 101 needs only three states.',
  ],
  figure: {
    kind: 'stateDiagram',
    machine: 'mealy',
    inputs: ['0', '1'],
    start: 'S0',
    tape: '10101',
    states: [
      { name: 'S0', x: 0, y: 0.8, loop: 180 },
      { name: 'S1', x: 0.5, y: 0, loop: 270 },
      { name: 'S2', x: 1, y: 0.8 },
    ],
    arrows: [
      { from: 'S0', to: 'S0', input: '0', output: '0' },
      { from: 'S0', to: 'S1', input: '1', output: '0' },
      { from: 'S1', to: 'S1', input: '1', output: '0' },
      { from: 'S1', to: 'S2', input: '0', output: '0' },
      { from: 'S2', to: 'S1', input: '1', output: '1' },
      { from: 'S2', to: 'S0', input: '0', output: '0' },
    ],
  },
  scenes: [
    {
      label: 'Start',
      lines: ['The machine starts in S0 with nothing seen.'],
      fsm: { input: '', state: 'S0' },
    },
    {
      label: 'Read 1',
      lines: ['A 1 begins 101: on to S1, output 0.'],
      fsm: { input: '1', state: 'S1' },
    },
    {
      label: 'Read 10',
      lines: ['The 0 makes “10”: on to S2, output 0.'],
      fsm: { input: '10', state: 'S2' },
    },
    {
      label: 'Read 101',
      lines: ['The arrow S2 to S1 on 1 outputs 1 while it is taken: 101 is found.'],
      fsm: { input: '101', state: 'S1' },
    },
    {
      label: 'Read 10101',
      lines: ['The overlap finds 101 again on the fifth bit, with one state fewer than Moore.'],
      fsm: { input: '10101', state: 'S1' },
    },
  ],
};

export const HE4N_GALLERY_MODULES: ModuleDef[] = [KMAP_THREE, KMAP_FOUR];

export const HE4N_GALLERY_LAYOUTS: LayoutDef[] = [
  kmapExplore,
  truthExplore,
  stateMoore,
  stateMealy,
];

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

// ─── HC186: pipelines (computer-architecture#2) ───────────────────────────────

const cyclesRule = derive(
  'cycles',
  'cycles',
  ['k', 'n'],
  '{cycles} = {k} + {n} − 1',
  (v) => v.k! + v.n! - 1,
  '{k} + {n} − 1',
  'The first instruction takes k cycles to finish; each later one finishes one cycle after it.',
);
const timeRule = derive(
  'time',
  'time',
  ['cycles', 'ts'],
  '{time} = {cycles} × {ts} ÷ 1000',
  (v) => (v.cycles! * v.ts!) / 1000,
  '{cycles} × {ts} ÷ 1000',
  'Every cycle lasts one stage time; 1000 ps make 1 ns.',
);
const speedupRule = derive(
  'speedup',
  'speedup',
  ['n', 't1', 'time'],
  '{speedup} = {n} × {t1} ÷ ({time} × 1000)',
  (v) => (v.n! * v.t1!) / (v.time! * 1000),
  '{n} × {t1} ÷ ({time} × 1000)',
  'Without the pipeline each instruction takes the whole single-cycle period t₁.',
);

const pipelineVars = (): VariableDef[] => [
  num('k', 'k', 'Stages', undefined, 2, 20, { integer: true, step: 1 }),
  num('n', 'n', 'Instructions', undefined, 1, 1e9, { integer: true, step: 1 }),
  num('ts', 't_s', 'Stage time', 'ps', 1, 1e6, { step: 10 }),
  num('t1', 't₁', 'Single-cycle period', 'ps', 1, 1e7, { step: 10 }),
  out('cycles', 'cycles', 'Clock cycles', undefined, { integer: true }),
  out('time', 't', 'Pipelined time', 'ns'),
  out('speedup', 'S', 'Speedup'),
];

const pipelinePage = (id: string, title: string, use: string, typed: Values) =>
  page({
    id,
    title,
    use,
    assumptions: [
      'No stalls: a new instruction enters every cycle.',
      'Every stage takes t_s, the slowest stage plus its register delay.',
      'Speedup compares with a single-cycle machine whose period is t₁.',
    ],
    variables: pipelineVars(),
    rules: [cyclesRule, timeRule, speedupRule],
    example: example(
      typed,
      ['cycles', (v) => v.k! + v.n! - 1],
      ['time', (v) => (v.cycles! * v.ts!) / 1000],
      ['speedup', (v) => (v.n! * v.t1!) / (v.time! * 1000)],
    ),
    startWith: ['k', 'n', 'ts', 't1'],
    representation: {
      kind: 'pipelineDiagram',
      k: 'k',
      n: 'n',
      ts: 'ts',
      t1: 't1',
      cycles: 'cycles',
      time: 'time',
      speedup: 'speedup',
    },
  });

const PIPELINE = pipelinePage(
  'g.he-pipelineDiagram-hundred',
  'Time and speedup of a pipeline',
  'Use this for “How long do 100 instructions take on a 5-stage pipeline with 200 ps stages?”',
  { k: 5, n: 100, ts: 200, t1: 800 },
);

/** The edge: a deep pipeline of 12 short stages, its cells too narrow for names. */
const PIPELINE_DEEP = pipelinePage(
  'g.he-pipelineDiagram-deep',
  'A deep pipeline',
  'Use this for “A 12-stage pipeline with 80 ps stages runs 20 instructions. How many cycles?”',
  { k: 12, n: 20, ts: 80, t1: 800 },
);

const PIPELINE_STALL = page({
  id: 'g.he-pipelineDiagram-stall',
  title: 'A load-use stall with forwarding',
  use: 'Use this for “lw x1 is followed by add x3, x1, x4. How many cycles do three instructions take with one stall?”',
  assumptions: [
    'A load’s data is ready only after MEM, so the next instruction’s EX waits one cycle (a bubble).',
    'Forwarding passes a result from the end of EX or MEM straight into a later EX.',
    'Each stall cycle delays every instruction behind it by one cycle.',
  ],
  variables: [
    num('k', 'k', 'Stages', undefined, 2, 20, { integer: true, step: 1 }),
    num('n', 'n', 'Instructions', undefined, 1, 1e9, { integer: true, step: 1 }),
    num('s', 's', 'Stall cycles', undefined, 0, 1000, { integer: true, step: 1 }),
    num('ts', 't_s', 'Stage time', 'ps', 1, 1e6, { step: 10 }),
    out('cycles', 'cycles', 'Clock cycles', undefined, { integer: true }),
    out('time', 't', 'Pipelined time', 'ns'),
  ],
  rules: [
    derive(
      'cycles',
      'cycles',
      ['k', 'n', 's'],
      '{cycles} = {k} + {n} − 1 + {s}',
      (v) => v.k! + v.n! - 1 + v.s!,
      '{k} + {n} − 1 + {s}',
      'Without stalls the last instruction ends at k + n − 1; each bubble adds a cycle.',
    ),
    timeRule,
  ],
  example: example(
    { k: 5, n: 3, s: 1, ts: 200 },
    ['cycles', (v) => v.k! + v.n! - 1 + v.s!],
    ['time', (v) => (v.cycles! * v.ts!) / 1000],
  ),
  startWith: ['k', 'n', 's', 'ts'],
  representation: {
    kind: 'pipelineDiagram',
    k: 'k',
    n: 'n',
    ts: 'ts',
    cycles: 'cycles',
    time: 'time',
    names: ['lw x1, 0(x2)', 'add x3, x1, x4', 'sub x5, x3, x6'],
    stalls: [{ instr: 2, before: 'EX', count: 's' }],
    forward: [
      { from: 1, to: 2, out: 'MEM', in: 'EX' },
      { from: 2, to: 3, out: 'EX', in: 'EX' },
    ],
  },
});

// ─── HC187: data structures (data-structures#0 and #2) ───────────────────────

const structuresExplore: LayoutDef = {
  kind: 'explore',
  id: 'g.he-dataStructure-lists',
  title: 'Stacks, queues and lists',
  use: 'Use this for “After push 3, push 5, push 2, pop, what is on top?”',
  assumptions: [
    'A stack takes from the end it added to; a queue from the other end.',
    'Each push, pop, enqueue or dequeue is constant time: nothing else moves.',
    'A circular queue reuses its slots: after the last slot comes slot 0.',
  ],
  figure: { kind: 'dataStructure' },
  scenes: [
    {
      label: 'Push 3, 5, 2',
      lines: ['Each push goes on top: 2, pushed last, is on top.'],
      ds: { structure: 'stack', ops: ['push 3', 'push 5', 'push 2'], holds: [3, 5, 2] },
    },
    {
      label: 'Pop',
      lines: ['A pop takes the top: 2 comes out, last in, first out, and 5 is on top.'],
      ds: {
        structure: 'stack',
        ops: ['push 3', 'push 5', 'push 2', 'pop'],
        holds: [3, 5],
        out: 2,
      },
    },
    {
      label: 'Dequeue',
      lines: ['Enqueue 3, 5, 2, then dequeue: 3 comes out of the front, first in, first out.'],
      ds: {
        structure: 'queue',
        ops: ['enqueue 3', 'enqueue 5', 'enqueue 2', 'dequeue'],
        holds: [5, 2],
        out: 3,
      },
    },
    {
      label: 'Circular queue',
      lines: ['With the front at slot 6 of 8, the next item after slot 7 wraps to slot 0.'],
      ds: {
        structure: 'ring',
        slots: 8,
        front: 6,
        start: [4, 8],
        ops: ['enqueue 1'],
        holds: [4, 8, 1],
      },
    },
    {
      label: 'Insert at head',
      lines: ['Inserting 4 at the head changes one pointer; no node shifts.'],
      ds: { structure: 'list', start: [7, 2, 9], ops: ['insert head 4'], holds: [4, 7, 2, 9] },
    },
  ],
};

const SORTED = [3, 8, 12, 17, 23, 31, 38, 44, 52, 60, 71];

const searchExplore: LayoutDef = {
  kind: 'explore',
  id: 'g.he-dataStructure-binary-search',
  title: 'Binary search step by step',
  use: 'Use this for “Search the sorted list 3, 8, 12, … 71 for 44. Which items are compared?”',
  assumptions: [
    'The list is sorted; mid is the middle of low and high, rounded down.',
    'Each comparison halves what is left, so 11 items need at most 4 comparisons.',
  ],
  figure: { kind: 'dataStructure' },
  scenes: [
    {
      label: 'Compare 31',
      lines: ['The middle of 0 to 10 is index 5, holding 31: 44 is larger, so low moves to 6.'],
      ds: { structure: 'array', values: SORTED, target: 44, step: 1 },
    },
    {
      label: 'Compare 52',
      lines: ['The middle of 6 to 10 is index 8, holding 52: 44 is smaller, so high moves to 7.'],
      ds: { structure: 'array', values: SORTED, target: 44, step: 2 },
    },
    {
      label: 'Compare 38',
      lines: ['The middle of 6 and 7 is index 6, holding 38: 44 is larger, so low moves to 7.'],
      ds: { structure: 'array', values: SORTED, target: 44, step: 3 },
    },
    {
      label: 'Found',
      lines: ['Low, mid and high meet at index 7: 44 is found on the fourth comparison.'],
      ds: { structure: 'array', values: SORTED, target: 44, step: 4 },
    },
  ],
};

const searchPage = (id: string, title: string, use: string, n: number) =>
  page({
    id,
    title,
    use,
    assumptions: [
      'The list is sorted, and each comparison is one step.',
      'Binary search halves what is left each time; linear search checks items in order.',
      'Linear search’s average assumes the item is there, equally likely anywhere.',
    ],
    variables: [
      num('n', 'n', 'Items', undefined, 1, 1e12, { integer: true, step: 1 }),
      out('binary', 'C_b', 'Binary search, worst case', undefined, { integer: true }),
      out('linear', 'C_l', 'Linear search, worst case', undefined, { integer: true }),
      out('average', 'C̄_l', 'Linear search, average'),
    ],
    rules: [
      derive(
        'binary',
        'binary',
        ['n'],
        '{binary} = ⌊log₂ {n}⌋ + 1',
        (v) => Math.floor(Math.log2(v.n!) + 1e-9) + 1,
        '⌊log₂ {n}⌋ + 1',
        'Each comparison halves the range; one more is needed for the last item left.',
      ),
      derive(
        'linear',
        'linear',
        ['n'],
        '{linear} = {n}',
        (v) => v.n!,
        '{n}',
        'In the worst case linear search checks every item.',
      ),
      derive(
        'average',
        'average',
        ['n'],
        '{average} = ({n} + 1) ÷ 2',
        (v) => (v.n! + 1) / 2,
        '({n} + 1) ÷ 2',
        'On average the item is halfway along: (1 + 2 + … + n) ÷ n.',
      ),
    ],
    example: example(
      { n },
      ['binary', (v) => Math.floor(Math.log2(v.n!) + 1e-9) + 1],
      ['linear', (v) => v.n!],
      ['average', (v) => (v.n! + 1) / 2],
    ),
    startWith: ['n'],
    representation: {
      kind: 'dataStructure',
      n: 'n',
      binary: 'binary',
      linear: 'linear',
      average: 'average',
    },
  });

const SEARCH = searchPage(
  'g.he-dataStructure-search',
  'Binary or linear search?',
  'Use this for “At most how many comparisons does binary search make in a sorted list of 1000?”',
  1000,
);

/** The edge: a billion items, 30 halvings (the bars past 11 give way to “…”). */
const SEARCH_BILLION = searchPage(
  'g.he-dataStructure-search-billion',
  'Searching a billion items',
  'Use this for “How many comparisons does binary search need for 10⁹ sorted items?”',
  1e9,
);

export const HE4N_GALLERY_MODULES: ModuleDef[] = [
  KMAP_THREE,
  KMAP_FOUR,
  PIPELINE,
  PIPELINE_DEEP,
  PIPELINE_STALL,
  SEARCH,
  SEARCH_BILLION,
];

export const HE4N_GALLERY_LAYOUTS: LayoutDef[] = [
  kmapExplore,
  truthExplore,
  stateMoore,
  stateMealy,
  structuresExplore,
  searchExplore,
];

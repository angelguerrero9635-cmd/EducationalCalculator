/**
 * Gallery demos for the Grade 8 pictures (roots, exponent rules, scientific notation, slope,
 * equations with the unknown on both sides). Spread into GALLERY_MODULES in gallery.ts; kept
 * apart so that file's other demos merge easily.
 */
import type { Relation, Values } from '@/engine/types';

import { div, whole } from './helpers';
import type { ModuleDef, StepText } from './types';

/** `id = a − b`, solvable for each of the three. */
const minus = (
  id: string,
  a: string,
  b: string,
  display: string,
  how: [string, string, string],
): { relation: Relation; steps: Record<string, StepText> } => ({
  relation: {
    id: `${id} = ${a} − ${b}`,
    display,
    vars: [id, a, b],
    residual: (v: Values) => v[id]! - (v[a]! - v[b]!),
    solve: {
      [id]: (v: Values) => v[a]! - v[b]!,
      [a]: (v: Values) => v[id]! + v[b]!,
      [b]: (v: Values) => v[a]! - v[id]!,
    },
  },
  steps: {
    [id]: { expr: `{${a}} − {${b}}`, how: how[0] },
    [a]: { expr: `{${b}} + {${id}}`, how: how[1] },
    [b]: { expr: `{${a}} − {${id}}`, how: how[2] },
  },
});

const rise = minus('R', 'y2', 'y1', '{R} = {y2} − {y1}', [
  'The rise is how far up the second point is from the first.',
  'Start at the first y and go up the rise.',
  'Start at the second y and go back down the rise.',
]);
const run = minus('r', 'x2', 'x1', '{r} = {x2} − {x1}', [
  'The run is how far across the second point is from the first.',
  'Start at the first x and go across the run.',
  'Start at the second x and go back across the run.',
]);

/** One exponent rule: the answer's exponent k from m and n, for base b. */
const exponentRule = (
  rule: 'product' | 'quotient' | 'power',
  id: string,
  title: string,
  assumptions: string[],
  example: Values,
): ModuleDef => {
  const rules = {
    product: {
      display: '{k} = {m} + {n}',
      op: (v: Values) => v.m! + v.n!,
      solve: {
        k: (v: Values) => v.m! + v.n!,
        m: (v: Values) => v.k! - v.n!,
        n: (v: Values) => v.k! - v.m!,
      },
      steps: {
        k: { expr: '{m} + {n}', how: 'Multiplying powers of the same base adds the exponents.' },
        m: { expr: '{k} − {n}', how: 'Take the second exponent from the answer’s.' },
        n: { expr: '{k} − {m}', how: 'Take the first exponent from the answer’s.' },
      },
    },
    quotient: {
      display: '{k} = {m} − {n}',
      op: (v: Values) => v.m! - v.n!,
      solve: {
        k: (v: Values) => v.m! - v.n!,
        m: (v: Values) => v.k! + v.n!,
        n: (v: Values) => v.m! - v.k!,
      },
      steps: {
        k: { expr: '{m} − {n}', how: 'Dividing powers of the same base subtracts the exponents.' },
        m: { expr: '{k} + {n}', how: 'Add the bottom exponent back to the answer’s.' },
        n: { expr: '{m} − {k}', how: 'The top exponent take away the answer’s.' },
      },
    },
    power: {
      display: '{k} = {m} × {n}',
      op: (v: Values) => v.m! * v.n!,
      solve: {
        k: (v: Values) => v.m! * v.n!,
        m: (v: Values) => div(v.k!, v.n!),
        n: (v: Values) => div(v.k!, v.m!),
      },
      steps: {
        k: { expr: '{m} × {n}', how: 'A power of a power multiplies the exponents.' },
        m: { expr: '{k} ÷ {n}', how: 'Divide the answer’s exponent by the outside one.' },
        n: { expr: '{k} ÷ {m}', how: 'Divide the answer’s exponent by the inside one.' },
      },
    },
  };
  const { display, op, solve, steps } = rules[rule];
  return {
    id,
    title,
    assumptions,
    variables: [
      whole('b', 'b', 'Base', 1, 10),
      whole('m', 'm', rule === 'power' ? 'Inside exponent' : 'First exponent', 0, 12),
      whole('n', 'n', rule === 'power' ? 'Outside exponent' : 'Second exponent', 0, 12),
      whole('k', 'k', 'Exponent of the answer', rule === 'quotient' ? -12 : 0, 24),
    ],
    relations: [
      { id: display, display, vars: ['k', 'm', 'n'], residual: (v) => v.k! - op(v), solve },
    ],
    steps: { [display]: steps },
    // The base is drawn and named in the caption; the exponents follow the rule for any base.
    standalone: { vars: ['b'], why: 'The rule for the exponents is the same for every base.' },
    example,
    startWith: ['b', 'm', 'n'],
    representation: { kind: 'factorRows', base: 'b', first: 'm', second: 'n', result: 'k', rule },
  };
};

export const G8A_GALLERY_MODULES: ModuleDef[] = [
  exponentRule(
    'product',
    'g.exponent-product',
    'Multiplying powers',
    [
      'A power is its base used as a factor again and again: 2³ = 2 × 2 × 2.',
      'Multiplying two powers of one base puts their factors in one row.',
    ],
    { b: 2, m: 3, n: 4, k: 7 },
  ),
  exponentRule(
    'quotient',
    'g.exponent-quotient',
    'Dividing powers',
    [
      'Each factor on top cancels one on the bottom: 2 ÷ 2 = 1.',
      'When the bottom has more factors, the answer has a negative exponent.',
    ],
    { b: 2, m: 6, n: 2, k: 4 },
  ),
  exponentRule(
    'power',
    'g.exponent-power',
    'A power of a power',
    [
      '(2³)⁴ is 2³ used as a factor 4 times.',
      'Each copy has 3 factors of 2, so there are 3 × 4 of them.',
    ],
    { b: 2, m: 3, n: 4, k: 12 },
  ),
  {
    id: 'g.root-square',
    title: 'Square roots as sides',
    assumptions: [
      'A square with area A has side √A, because side × side = area.',
      'If A is not a perfect square, √A is irrational: it lies between two whole numbers.',
    ],
    variables: [
      { id: 'A', symbol: 'A', name: 'Area of the square', min: 0, max: 144, step: 1 },
      { id: 's', symbol: 's', name: 'Side of the square', min: 0, max: 12, step: 0.01 },
    ],
    relations: [
      {
        id: 's = √A',
        display: '{s} = √{A}',
        vars: ['s', 'A'],
        residual: (v: Values) => v.s! * v.s! - v.A!,
        solve: {
          s: (v: Values) => (v.A! >= 0 ? Math.sqrt(v.A!) : undefined),
          A: (v: Values) => v.s! * v.s!,
        },
      },
    ],
    steps: {
      's = √A': {
        s: { expr: '√{A}', how: 'The side is the number that, times itself, makes the area.' },
        A: { expr: '{s}²', how: 'The area is the side times itself.' },
      },
    },
    example: { A: 10, s: Math.sqrt(10) },
    startWith: ['A'],
    representation: {
      kind: 'rootSquare',
      area: 'A',
      side: 's',
      marks: [
        { at: Math.SQRT2, label: '√2' },
        { at: Math.PI, label: 'π' },
      ],
    },
  },
  {
    id: 'g.slope-triangle',
    title: 'Slope: rise over run',
    assumptions: [
      'The slope of a line is the rise divided by the run between any two of its points.',
      'A line that goes down to the right has a negative rise, so its slope is negative.',
    ],
    variables: [
      whole('x1', 'x₁', 'First x', -6, 6),
      whole('y1', 'y₁', 'First y', -6, 6),
      whole('x2', 'x₂', 'Second x', -6, 6),
      whole('y2', 'y₂', 'Second y', -6, 6),
      { ...whole('R', 'rise', 'Rise', -12, 12), derived: true },
      { ...whole('r', 'run', 'Run', -12, 12), derived: true },
      { id: 'm', symbol: 'm', name: 'Slope', min: -12, max: 12, step: 0.01 },
    ],
    relations: [
      rise.relation,
      run.relation,
      // A run of 0 is a line straight up and down: it has no slope.
      {
        id: 'run ≠ 0',
        constraint: true,
        display: '{r} ≠ 0',
        vars: ['r'],
        residual: (v: Values) => (v.r === 0 ? 1 : 0),
        solve: {},
      },
      {
        id: 'm = rise ÷ run',
        display: '{m} = {R} ÷ {r}',
        vars: ['m', 'R', 'r'],
        residual: (v: Values) => v.m! * v.r! - v.R!,
        solve: {
          m: (v: Values) => div(v.R!, v.r!),
          R: (v: Values) => v.m! * v.r!,
          r: (v: Values) => div(v.R!, v.m!),
        },
      },
    ],
    steps: {
      [rise.relation.id]: rise.steps,
      [run.relation.id]: run.steps,
      'run ≠ 0': {},
      'm = rise ÷ run': {
        m: { expr: '{R} ÷ {r}', how: 'Divide the rise by the run.' },
        R: { expr: '{m} × {r}', how: 'The rise is the slope times the run.' },
        r: { expr: '{R} ÷ {m}', how: 'The run is the rise divided by the slope.' },
      },
    },
    example: { x1: -2, y1: -1, x2: 4, y2: 2, R: 3, r: 6, m: 0.5 },
    startWith: ['x1', 'y1', 'x2', 'y2'],
    representation: {
      kind: 'coordinatePlane',
      x: 'x1',
      y: 'y1',
      second: { x: 'x2', y: 'y2' },
      slope: 'm',
      rise: 'R',
      run: 'r',
      extent: 6,
      quadrants: 4,
    },
  },
];

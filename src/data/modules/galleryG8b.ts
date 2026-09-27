/**
 * Gallery demos for the Grade 8 graphs: a line y = mx + b with its slope triangle, a system
 * of two lines, an input-output machine, a mapping diagram with the vertical-line test, and
 * a figure with its image after a translation, reflection, rotation or dilation. Spread into
 * GALLERY_MODULES in gallery.ts; kept apart so that file's other demos merge easily.
 */
import type { Values } from '@/engine/types';

import { div, whole } from './helpers';
import type { ModuleDef } from './types';

/** A signed value on a grid: −10 to 10 in steps of `step`. */
const signed = (id: string, symbol: string, name: string, step = 1, lim = 10) => ({
  id,
  symbol,
  name,
  min: -lim,
  max: lim,
  step,
  ...(step === 1 ? { integer: true } : {}),
});

export const G8B_GALLERY_MODULES: ModuleDef[] = [
  {
    id: 'g.function-machine',
    title: 'Function machine',
    assumptions: [
      'A function gives exactly one output for each input.',
      'The machine divides the input by d, then adds a.',
      'Tap an input in the table to put it through the machine.',
    ],
    variables: [
      signed('x', 'x', 'Input', 1, 100),
      { ...signed('d', 'd', 'Divide by', 1, 12), min: 1 },
      signed('a', 'a', 'Add', 1, 20),
      signed('y', 'y', 'Output', 0.01, 200),
    ],
    relations: [
      {
        id: 'y = x ÷ d + a',
        display: '{y} = {x} ÷ {d} + {a}',
        vars: ['y', 'x', 'd', 'a'],
        residual: (v: Values) => v.y! * v.d! - (v.x! + v.a! * v.d!),
        solve: {
          y: (v: Values) => div(v.x!, v.d!)! + v.a!,
          x: (v: Values) => (v.y! - v.a!) * v.d!,
          a: (v: Values) => v.y! - div(v.x!, v.d!)!,
          d: (v: Values) => div(v.x!, v.y! - v.a!),
        },
      },
    ],
    steps: {
      'y = x ÷ d + a': {
        y: { expr: '{x} ÷ {d} + {a}', how: 'Divide the input by d, then add a.' },
        x: {
          expr: '({y} − {a}) × {d}',
          how: 'Undo the steps in reverse: subtract a, then multiply.',
        },
        a: { expr: '{y} − {x} ÷ {d}', how: 'The output less what the division gave.' },
        d: { expr: '{x} ÷ ({y} − {a})', how: 'The input divided by what the division must give.' },
      },
    },
    example: { x: 6, d: 2, a: 5, y: 8 },
    startWith: ['x', 'd', 'a'],
    representation: {
      kind: 'functionMachine',
      input: 'x',
      output: 'y',
      rule: [
        { op: '÷', by: 'd' },
        { op: '+', by: 'a' },
      ],
      table: [0, 2, 4, 6, 8, 10],
    },
  },
  {
    id: 'g.linear-function',
    title: 'Linear function',
    assumptions: [
      'The line y = mx + b crosses the y-axis at (0, b).',
      'The slope m is the rise for every 1 across: rise ÷ run.',
      'Drag the intercept, the top of the slope triangle, or the point.',
    ],
    variables: [
      signed('m', 'm', 'Slope', 0.5),
      signed('b', 'b', 'Intercept'),
      signed('x', 'x', 'Input'),
      { ...signed('y', 'y', 'Output', 0.5, 200) },
    ],
    relations: [
      {
        id: 'y = mx + b',
        display: '{y} = {m} × {x} + {b}',
        vars: ['y', 'm', 'x', 'b'],
        residual: (v: Values) => v.y! - (v.m! * v.x! + v.b!),
        solve: {
          y: (v: Values) => v.m! * v.x! + v.b!,
          b: (v: Values) => v.y! - v.m! * v.x!,
          m: (v: Values) => div(v.y! - v.b!, v.x!),
          x: (v: Values) => div(v.y! - v.b!, v.m!),
        },
      },
    ],
    steps: {
      'y = mx + b': {
        y: { expr: '{m} × {x} + {b}', how: 'Multiply the slope by x, then add the intercept.' },
        b: { expr: '{y} − {m} × {x}', how: 'Take the slope times x away from y.' },
        m: { expr: '({y} − {b}) ÷ {x}', how: 'The rise from the intercept, divided by x.' },
        x: { expr: '({y} − {b}) ÷ {m}', how: 'Take away the intercept, then divide by the slope.' },
      },
    },
    example: { m: 2, b: -3, x: 4, y: 5 },
    startWith: ['x', 'm', 'b'],
    representation: {
      kind: 'linearFunction',
      slope: 'm',
      intercept: 'b',
      point: { x: 'x', y: 'y' },
      extent: 10,
    },
  },
  {
    id: 'g.linear-function-context',
    title: 'Linear function in a context',
    assumptions: [
      'A bike rental costs a fee to start plus the same amount for every hour.',
      'The fee is where the line starts; the hourly cost is its slope.',
    ],
    variables: [
      { ...whole('r', 'r', 'Cost per hour', 0, 20), unit: '$' },
      { ...whole('f', 'f', 'Starting fee', 0, 50), unit: '$' },
      whole('h', 'h', 'Hours', 0, 10),
      { id: 'c', symbol: 'C', name: 'Total cost', unit: '$', min: 0, max: 300, step: 1 },
    ],
    relations: [
      {
        id: 'C = rh + f',
        display: '{c} = {r} × {h} + {f}',
        vars: ['c', 'r', 'h', 'f'],
        residual: (v: Values) => v.c! - (v.r! * v.h! + v.f!),
        solve: {
          c: (v: Values) => v.r! * v.h! + v.f!,
          f: (v: Values) => v.c! - v.r! * v.h!,
          r: (v: Values) => div(v.c! - v.f!, v.h!),
          h: (v: Values) => div(v.c! - v.f!, v.r!),
        },
      },
    ],
    steps: {
      'C = rh + f': {
        c: { expr: '{r} × {h} + {f}', how: 'The cost of the hours, plus the starting fee.' },
        f: { expr: '{c} − {r} × {h}', how: 'Take the cost of the hours from the total.' },
        r: { expr: '({c} − {f}) ÷ {h}', how: 'Take away the fee, then share it over the hours.' },
        h: { expr: '({c} − {f}) ÷ {r}', how: 'Take away the fee, then divide by the hourly cost.' },
      },
    },
    example: { r: 5, f: 10, h: 6, c: 40 },
    startWith: ['h', 'r', 'f'],
    representation: {
      kind: 'linearFunction',
      slope: 'r',
      intercept: 'f',
      point: { x: 'h', y: 'c' },
      extent: { x: 10, y: 80 },
      quadrants: 1,
      axes: { x: 'Hours', y: 'Cost ($)' },
    },
  },
  {
    id: 'g.line-system',
    title: 'System of two lines',
    assumptions: [
      'The solution is the point on both lines: where they cross.',
      'Lines with the same slope and different intercepts are parallel: no solution.',
      'Drag each intercept on the y-axis, or a point on a line to turn it.',
    ],
    variables: [
      signed('m1', 'm₁', 'First slope', 0.5),
      signed('b1', 'b₁', 'First intercept'),
      signed('m2', 'm₂', 'Second slope', 0.5),
      signed('b2', 'b₂', 'Second intercept'),
      { ...signed('x', 'x', 'Solution x', 0.01, 1000), derived: true },
      { ...signed('y', 'y', 'Solution y', 0.01, 10000), derived: true },
    ],
    relations: [
      {
        id: 'x = (b₂ − b₁) ÷ (m₁ − m₂)',
        display: '{x} = ({b2} − {b1}) ÷ ({m1} − {m2})',
        vars: ['x', 'b2', 'b1', 'm1', 'm2'],
        residual: (v: Values) => v.x! * (v.m1! - v.m2!) - (v.b2! - v.b1!),
        solve: {
          x: (v: Values) => div(v.b2! - v.b1!, v.m1! - v.m2!),
          b2: () => undefined,
          b1: () => undefined,
          m1: () => undefined,
          m2: () => undefined,
        },
      },
      {
        id: 'y = m₁x + b₁',
        display: '{y} = {m1} × {x} + {b1}',
        vars: ['y', 'm1', 'x', 'b1'],
        residual: (v: Values) => v.y! - (v.m1! * v.x! + v.b1!),
        solve: {
          y: (v: Values) => v.m1! * v.x! + v.b1!,
          m1: () => undefined,
          x: () => undefined,
          b1: () => undefined,
        },
      },
    ],
    steps: {
      'x = (b₂ − b₁) ÷ (m₁ − m₂)': {
        x: {
          expr: '({b2} − {b1}) ÷ ({m1} − {m2})',
          how: 'Set the two right sides equal, gather x on one side, then divide.',
        },
      },
      'y = m₁x + b₁': {
        y: { expr: '{m1} × {x} + {b1}', how: 'Put x into the first equation.' },
      },
    },
    example: { m1: 2, b1: -1, m2: -1, b2: 5, x: 2, y: 3 },
    startWith: ['m1', 'b1', 'm2', 'b2'],
    representation: {
      kind: 'lineSystem',
      lines: [
        { slope: 'm1', intercept: 'b1' },
        { slope: 'm2', intercept: 'b2' },
      ],
      solution: { x: 'x', y: 'y' },
      extent: 10,
    },
  },
  {
    id: 'g.line-system-context',
    title: 'System in a context',
    assumptions: [
      'Each gym charges a joining fee plus the same amount every month.',
      'Where the lines cross, both gyms cost the same.',
    ],
    variables: [
      { ...whole('a', 'a', 'Gym A per month', 0, 60), unit: '$' },
      { ...whole('f', 'f', 'Gym A fee', 0, 300), unit: '$' },
      { ...whole('b', 'b', 'Gym B per month', 0, 60), unit: '$' },
      { ...whole('g', 'g', 'Gym B fee', 0, 300), unit: '$' },
      { ...signed('n', 'n', 'Months', 0.01, 1000), derived: true },
      { ...signed('c', 'C', 'Same cost', 0.01, 100000), unit: '$', derived: true },
    ],
    relations: [
      {
        id: 'n = (g − f) ÷ (a − b)',
        display: '{n} = ({g} − {f}) ÷ ({a} − {b})',
        vars: ['n', 'g', 'f', 'a', 'b'],
        residual: (v: Values) => v.n! * (v.a! - v.b!) - (v.g! - v.f!),
        solve: {
          n: (v: Values) => div(v.g! - v.f!, v.a! - v.b!),
          g: () => undefined,
          f: () => undefined,
          a: () => undefined,
          b: () => undefined,
        },
      },
      {
        id: 'C = an + f',
        display: '{c} = {a} × {n} + {f}',
        vars: ['c', 'a', 'n', 'f'],
        residual: (v: Values) => v.c! - (v.a! * v.n! + v.f!),
        solve: {
          c: (v: Values) => v.a! * v.n! + v.f!,
          a: () => undefined,
          n: () => undefined,
          f: () => undefined,
        },
      },
    ],
    steps: {
      'n = (g − f) ÷ (a − b)': {
        n: {
          expr: '({g} − {f}) ÷ ({a} − {b})',
          how: 'The difference in fees, shared over the difference each month.',
        },
      },
      'C = an + f': {
        c: { expr: '{a} × {n} + {f}', how: 'Gym A’s cost after that many months.' },
      },
    },
    example: { a: 20, f: 150, b: 35, g: 60, n: 6, c: 270 },
    startWith: ['a', 'f', 'b', 'g'],
    representation: {
      kind: 'lineSystem',
      lines: [
        { slope: 'a', intercept: 'f', label: 'Gym A' },
        { slope: 'b', intercept: 'g', label: 'Gym B' },
      ],
      solution: { x: 'n', y: 'c' },
      extent: { x: 12, y: 500 },
      quadrants: 1,
      axes: { x: 'Months', y: 'Cost ($)' },
    },
  },
];

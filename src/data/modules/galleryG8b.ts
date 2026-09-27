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

/** Four outputs typed; each input is its output squared (so 2 and −2 share the input 4). */
const SQUARES = [1, 2, 3, 4] as const;

/** A: its x and y (the rest of the figure is fixed); A′: where the move takes it. */
const CORNER_A = [
  signed('ax', 'x', 'A across'),
  signed('ay', 'y', 'A up'),
  { ...signed('px', 'x′', 'A′ across', 0.01, 100) },
  { ...signed('py', 'y′', 'A′ up', 0.01, 100) },
];

export const G8B_GALLERY_MODULES: ModuleDef[] = [
  {
    id: 'g.translation',
    title: 'Translation',
    assumptions: [
      'A translation slides every point the same distance the same way.',
      'h is the slide right (left when negative), k the slide up (down when negative).',
      'Drag A′ to change the slide.',
    ],
    standalone: {
      vars: ['ay', 'k', 'py'],
      why: 'The slide up is worked out on its own, apart from the slide across.',
    },
    variables: [...CORNER_A, signed('h', 'h', 'Right'), signed('k', 'k', 'Up')],
    relations: [
      {
        id: 'x′ = x + h',
        display: '{px} = {ax} + {h}',
        vars: ['px', 'ax', 'h'],
        residual: (v: Values) => v.px! - v.ax! - v.h!,
        solve: {
          px: (v: Values) => v.ax! + v.h!,
          ax: (v: Values) => v.px! - v.h!,
          h: (v: Values) => v.px! - v.ax!,
        },
      },
      {
        id: 'y′ = y + k',
        display: '{py} = {ay} + {k}',
        vars: ['py', 'ay', 'k'],
        residual: (v: Values) => v.py! - v.ay! - v.k!,
        solve: {
          py: (v: Values) => v.ay! + v.k!,
          ay: (v: Values) => v.py! - v.k!,
          k: (v: Values) => v.py! - v.ay!,
        },
      },
    ],
    steps: {
      'x′ = x + h': {
        px: { expr: '{ax} + {h}', how: 'Slide A across by h.' },
        ax: { expr: '{px} − {h}', how: 'Slide A′ back by h.' },
        h: { expr: '{px} − {ax}', how: 'How far across A moved.' },
      },
      'y′ = y + k': {
        py: { expr: '{ay} + {k}', how: 'Slide A up by k.' },
        ay: { expr: '{py} − {k}', how: 'Slide A′ back down by k.' },
        k: { expr: '{py} − {ay}', how: 'How far up A moved.' },
      },
    },
    example: { ax: -6, ay: 2, h: 7, k: -4, px: 1, py: -2 },
    startWith: ['ax', 'ay', 'h', 'k'],
    representation: {
      kind: 'transformation',
      figure: [
        ['ax', 'ay'],
        [-2, 2],
        [-5, 5],
      ],
      image: { x: 'px', y: 'py' },
      move: 'translate',
      right: 'h',
      up: 'k',
    },
  },
  {
    id: 'g.reflection',
    title: 'Reflection',
    assumptions: [
      'A reflection flips the figure over the mirror line x = a.',
      'Each corner and its image are the same distance from the line.',
      'Drag the mirror line.',
    ],
    standalone: {
      vars: ['ay', 'py'],
      why: 'A flip across an up-and-down line keeps each height as it was.',
    },
    variables: [...CORNER_A, signed('a', 'a', 'Mirror line')],
    relations: [
      {
        id: 'x′ = 2a − x',
        display: '{px} = 2 × {a} − {ax}',
        vars: ['px', 'a', 'ax'],
        residual: (v: Values) => v.px! - (2 * v.a! - v.ax!),
        solve: {
          px: (v: Values) => 2 * v.a! - v.ax!,
          ax: (v: Values) => 2 * v.a! - v.px!,
          a: (v: Values) => (v.px! + v.ax!) / 2,
        },
      },
      {
        id: 'y′ = y',
        display: '{py} = {ay}',
        vars: ['py', 'ay'],
        residual: (v: Values) => v.py! - v.ay!,
        solve: { py: (v: Values) => v.ay!, ay: (v: Values) => v.py! },
      },
    ],
    steps: {
      'x′ = 2a − x': {
        px: { expr: '2 × {a} − {ax}', how: 'As far past the line as A is before it.' },
        ax: { expr: '2 × {a} − {px}', how: 'As far before the line as A′ is past it.' },
        a: { expr: '({px} + {ax}) ÷ 2', how: 'The line is halfway between A and A′.' },
      },
      'y′ = y': {
        py: { expr: '{ay}', how: 'A flip across an up-and-down line keeps the height.' },
        ay: { expr: '{py}', how: 'A flip across an up-and-down line keeps the height.' },
      },
    },
    example: { ax: -5, ay: 1, a: 1, px: 7, py: 1 },
    startWith: ['ax', 'ay', 'a'],
    representation: {
      kind: 'transformation',
      figure: [
        ['ax', 'ay'],
        [-2, 1],
        [-5, 5],
      ],
      image: { x: 'px', y: 'py' },
      move: 'reflect',
      mirror: { x: 'a' },
    },
  },
  {
    id: 'g.rotation',
    title: 'Rotation',
    assumptions: [
      'A rotation turns the figure about the center (0, 0).',
      'A positive angle turns counterclockwise, a negative one clockwise.',
      'Drag A′ around the center.',
    ],
    variables: [
      {
        id: 'r',
        symbol: 'r',
        name: 'Angle',
        unit: '°',
        min: -270,
        max: 270,
        allowed: [-270, -180, -90, 0, 90, 180, 270],
      },
      { ...signed('t', 't', 'Quarter turns', 1, 3), derived: true },
    ],
    pictureLabels: ['t'],
    relations: [
      {
        id: 't = r ÷ 90',
        display: '{t} = {r} ÷ 90',
        vars: ['t', 'r'],
        residual: (v: Values) => v.t! * 90 - v.r!,
        solve: { t: (v: Values) => v.r! / 90, r: () => undefined },
      },
    ],
    steps: {
      't = r ÷ 90': {
        t: { expr: '{r} ÷ 90', how: 'A quarter turn is 90°.' },
      },
    },
    example: { r: 90, t: 1 },
    startWith: ['r'],
    representation: {
      kind: 'transformation',
      figure: [
        [3, 1],
        [8, 1],
        [3, 5],
      ],
      move: 'rotate',
      angle: 'r',
    },
  },
  {
    id: 'g.dilation',
    title: 'Dilation',
    assumptions: [
      'A dilation from (0, 0) multiplies every coordinate by the scale factor k.',
      'A factor above 1 enlarges the figure; between 0 and 1 it shrinks it.',
      'Drag A′ along its ray.',
    ],
    variables: [
      ...CORNER_A,
      { id: 'k', symbol: 'k', name: 'Scale factor', min: 0.25, max: 4, step: 0.25 },
    ],
    relations: [
      {
        id: 'x′ = kx',
        display: '{px} = {k} × {ax}',
        vars: ['px', 'k', 'ax'],
        residual: (v: Values) => v.px! - v.k! * v.ax!,
        solve: {
          px: (v: Values) => v.k! * v.ax!,
          ax: (v: Values) => div(v.px!, v.k!),
          k: (v: Values) => div(v.px!, v.ax!),
        },
      },
      {
        id: 'y′ = ky',
        display: '{py} = {k} × {ay}',
        vars: ['py', 'k', 'ay'],
        residual: (v: Values) => v.py! - v.k! * v.ay!,
        solve: {
          py: (v: Values) => v.k! * v.ay!,
          ay: (v: Values) => div(v.py!, v.k!),
          k: (v: Values) => div(v.py!, v.ay!),
        },
      },
    ],
    steps: {
      'x′ = kx': {
        px: { expr: '{k} × {ax}', how: 'Multiply the across by the scale factor.' },
        ax: { expr: '{px} ÷ {k}', how: 'Divide the image’s across by the scale factor.' },
        k: { expr: '{px} ÷ {ax}', how: 'How many times as far across A′ is.' },
      },
      'y′ = ky': {
        py: { expr: '{k} × {ay}', how: 'Multiply the up by the scale factor.' },
        ay: { expr: '{py} ÷ {k}', how: 'Divide the image’s up by the scale factor.' },
        k: { expr: '{py} ÷ {ay}', how: 'How many times as far up A′ is.' },
      },
    },
    example: { ax: 1, ay: 1, k: 3, px: 3, py: 3 },
    startWith: ['ax', 'ay', 'k'],
    representation: {
      kind: 'transformation',
      figure: [
        ['ax', 'ay'],
        [3, 1],
        [1, 2],
      ],
      image: { x: 'px', y: 'py' },
      move: 'dilate',
      factor: 'k',
    },
  },
  {
    id: 'g.mapping',
    title: 'Mapping diagram',
    assumptions: [
      'Each pair is an input and an output. Each input is its output times itself.',
      'A function gives each input exactly one output.',
      'On the graph, no vertical line crosses a function twice.',
    ],
    standalone: {
      vars: ['y2', 'x2', 'y3', 'x3', 'y4', 'x4'],
      why: 'Each pair stands alone; the picture tests whether the pairs make a function.',
    },
    variables: SQUARES.flatMap((i) => [
      signed(`y${i}`, `y${'₁₂₃₄'[i - 1]}`, `Output ${i}`),
      { ...signed(`x${i}`, `x${'₁₂₃₄'[i - 1]}`, `Input ${i}`, 1, 100), derived: true },
    ]),
    relations: SQUARES.map((i) => ({
      id: `x${i} = y${i} × y${i}`,
      display: `{x${i}} = {y${i}} × {y${i}}`,
      vars: [`x${i}`, `y${i}`],
      residual: (v: Values) => v[`x${i}`]! - v[`y${i}`]! * v[`y${i}`]!,
      solve: {
        [`x${i}`]: (v: Values) => v[`y${i}`]! * v[`y${i}`]!,
        [`y${i}`]: () => undefined,
      },
    })),
    steps: Object.fromEntries(
      SQUARES.map((i) => [
        `x${i} = y${i} × y${i}`,
        {
          [`x${i}`]: { expr: `{y${i}} × {y${i}}`, how: 'The input is the output times itself.' },
        },
      ]),
    ),
    example: { y1: 2, x1: 4, y2: -2, x2: 4, y3: 3, x3: 9, y4: 1, x4: 1 },
    startWith: ['y1', 'y2', 'y3', 'y4'],
    representation: {
      kind: 'mapping',
      pairs: SQUARES.map((i) => ({ x: `x${i}`, y: `y${i}` })),
    },
  },
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

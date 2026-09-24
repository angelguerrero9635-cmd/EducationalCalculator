/**
 * Section 1 extra modules: common test question types that need a different model or picture
 * from a skill's main module (found by the exam-coverage review). Ids are `<skill id>~<slug>`.
 */
import type { ModuleDef } from './types';
import { difference, div, whole } from './math-k2';

const cmpNumbers = difference('d', 'a', 'b', {
  diff: 'Subtract the smaller number from the bigger one.',
  first: 'Add the difference to b if a is bigger; take it away if a is smaller.',
  second: 'Take the difference from a if a is bigger; add it if a is smaller.',
});

/** Compare two numbers with >, < or = using base-ten blocks. */
const compareNumbers = (id: string, max: number, steps: number[], example: [number, number]) => ({
  id: `${id}~compare`,
  title: 'Compare numbers',
  assumptions: [
    max > 99
      ? 'Compare the hundreds first. If they are the same, compare the tens, then the ones.'
      : 'Compare the tens first. If they are the same, compare the ones.',
    '> means “is greater than”, < means “is less than”. The open side faces the bigger number.',
  ],
  variables: [
    whole('a', 'a', 'First number', 0, max),
    whole('b', 'b', 'Second number', 0, max),
    whole('d', 'd', 'How far apart', 0, max),
  ],
  relations: [cmpNumbers.relation],
  steps: cmpNumbers.steps,
  example: { a: example[0], b: example[1], d: Math.abs(example[0] - example[1]) },
  startWith: ['a', 'b'],
  representation: {
    kind: 'baseTen' as const,
    groups: ['a', 'b'],
    compare: true,
    controls: [
      { var: 'a', steps },
      { var: 'b', steps },
    ],
  },
});

export const MATH_K2_EXTRA_MODULES: ModuleDef[] = [
  // Grade 1: compare word problems (1.OA.1, the hardest problem type in CCSS Table 1).
  {
    id: 'm.1.add-sub-20~compare',
    title: 'Compare problems',
    assumptions: [
      'Compare problems ask how many more or fewer, or give the difference and one amount.',
      '“Lucy has 2 more than Julie” means Lucy has the bigger amount: Julie’s amount + 2.',
      '“How many more” and “how many fewer” are the same difference.',
    ],
    variables: [
      whole('B', 'B', 'Bigger amount', 0, 20),
      whole('S', 'S', 'Smaller amount', 0, 20),
      whole('d', 'd', 'How many more (or fewer)', 0, 20),
    ],
    relations: [
      {
        id: 'd = B − S',
        display: '{d} = {B} − {S}',
        vars: ['d', 'B', 'S'],
        residual: (v) => v.d! - (v.B! - v.S!),
        solve: { d: (v) => v.B! - v.S!, B: (v) => v.S! + v.d!, S: (v) => v.B! - v.d! },
      },
    ],
    steps: {
      'd = B − S': {
        d: {
          expr: '{B} − {S}',
          how: 'Line up the two bars. The extra part of the longer bar is the difference.',
        },
        B: {
          expr: '{S} + {d}',
          how: 'The bigger amount is the smaller amount plus the extra.',
        },
        S: {
          expr: '{B} − {d}',
          how: 'The smaller amount is the bigger amount without the extra.',
        },
      },
    },
    example: { B: 11, S: 7, d: 4 },
    startWith: ['B', 'S'],
    representation: { kind: 'tape', compare: ['B', 'S'], difference: 'd' },
  },

  compareNumbers('m.1.tens-ones', 99, [1, 10], [45, 54]),

  // Grade 2: word problems with a tape diagram, one and two steps (2.OA.1), and adding up to
  // four numbers (2.NBT.6).
  {
    id: 'm.2.add-sub-100-fluency~tape',
    title: 'Word problems',
    assumptions: [
      'Draw a bar for each part. Together they make the whole.',
      'Whole unknown: add the parts. Part unknown: take the known part away from the whole.',
      'The numbers are within 100.',
    ],
    variables: [
      whole('a', 'a', 'First part', 0, 100),
      whole('b', 'b', 'Second part', 0, 100),
      whole('c', 'c', 'Whole', 0, 100),
    ],
    relations: [
      {
        id: 'a + b = c',
        display: '{a} + {b} = {c}',
        vars: ['a', 'b', 'c'],
        residual: (v) => v.a! + v.b! - v.c!,
        solve: { c: (v) => v.a! + v.b!, a: (v) => v.c! - v.b!, b: (v) => v.c! - v.a! },
      },
    ],
    steps: {
      'a + b = c': {
        c: { expr: '{a} + {b}', how: 'The whole is both parts together: add.' },
        a: { expr: '{c} − {b}', how: 'Take the known part away from the whole.' },
        b: { expr: '{c} − {a}', how: 'Take the known part away from the whole.' },
      },
    },
    example: { a: 38, b: 25, c: 63 },
    startWith: ['a', 'b'],
    representation: { kind: 'tape', parts: ['a', 'b'], total: 'c' },
  },

  {
    id: 'm.2.add-sub-100-fluency~two-step',
    title: 'Two-step problems',
    assumptions: [
      'Some are added, then some are taken away (or the other way around).',
      'Do one step at a time: first add, then subtract.',
      'Every amount stays within 100.',
    ],
    variables: [
      whole('s', 's', 'Start', 0, 100),
      whole('a', 'a', 'Added', 0, 100),
      whole('t', 't', 'Taken away', 0, 100),
      whole('e', 'e', 'End', 0, 100),
    ],
    relations: [
      {
        id: 'e = s + a − t',
        display: '{e} = {s} + {a} − {t}',
        vars: ['e', 's', 'a', 't'],
        residual: (v) => v.e! - (v.s! + v.a! - v.t!),
        solve: {
          e: (v) => v.s! + v.a! - v.t!,
          s: (v) => v.e! - v.a! + v.t!,
          a: (v) => v.e! - v.s! + v.t!,
          t: (v) => v.s! + v.a! - v.e!,
        },
      },
    ],
    steps: {
      'e = s + a − t': {
        e: { expr: '{s} + {a} − {t}', how: 'Step 1: add to the start. Step 2: take away.' },
        s: {
          expr: '{e} + {t} − {a}',
          how: 'Work backwards: put back what was taken away, then remove what was added.',
        },
        a: {
          expr: '{e} + {t} − {s}',
          how: 'Put back what was taken away, then find how much more than the start that is.',
        },
        t: {
          expr: '{s} + {a} − {e}',
          how: 'Add first. The amount taken away is how far that is above the end.',
        },
      },
    },
    example: { s: 25, a: 18, t: 9, e: 34 },
    startWith: ['s', 'a', 't'],
    representation: {
      kind: 'waterfall',
      items: [
        { var: 's', sign: 1, editable: true },
        { var: 'a', sign: 1, editable: true },
        { var: 't', sign: -1, editable: true },
      ],
      total: 'e',
    },
  },

  {
    id: 'm.2.add-sub-100-fluency~four-numbers',
    title: 'Add up to four numbers',
    assumptions: [
      'Add the tens, then add the ones, then put them together.',
      'Look for pairs that make a ten first: 23 + 17 → 3 + 7 = 10.',
    ],
    variables: [
      whole('a', 'a', 'First', 0, 99),
      whole('b', 'b', 'Second', 0, 99),
      whole('c', 'c', 'Third', 0, 99),
      whole('e', 'e', 'Fourth', 0, 99),
      whole('n', 'n', 'Sum', 0, 396),
    ],
    relations: [
      {
        id: 'n = a + b + c + e',
        display: '{n} = {a} + {b} + {c} + {e}',
        vars: ['n', 'a', 'b', 'c', 'e'],
        residual: (v) => v.n! - v.a! - v.b! - v.c! - v.e!,
        solve: {
          n: (v) => v.a! + v.b! + v.c! + v.e!,
          a: (v) => v.n! - v.b! - v.c! - v.e!,
          b: (v) => v.n! - v.a! - v.c! - v.e!,
          c: (v) => v.n! - v.a! - v.b! - v.e!,
          e: (v) => v.n! - v.a! - v.b! - v.c!,
        },
      },
    ],
    steps: {
      'n = a + b + c + e': {
        n: {
          expr: '{a} + {b} + {c} + {e}',
          how: 'Add all the tens, then all the ones. Trade 10 ones for a ten.',
        },
        a: { expr: '{n} − {b} − {c} − {e}', how: 'Take the other numbers away from the sum.' },
        b: { expr: '{n} − {a} − {c} − {e}', how: 'Take the other numbers away from the sum.' },
        c: { expr: '{n} − {a} − {b} − {e}', how: 'Take the other numbers away from the sum.' },
        e: { expr: '{n} − {a} − {b} − {c}', how: 'Take the other numbers away from the sum.' },
      },
    },
    example: { a: 23, b: 15, c: 32, e: 17, n: 87 },
    startWith: ['a', 'b', 'c', 'e'],
    representation: {
      kind: 'baseTen',
      groups: ['a', 'b', 'c', 'e'],
      total: 'n',
      controls: [],
    },
  },

  compareNumbers('m.2.place-value-1000', 999, [1, 10, 100], [347, 374]),

  // Grade 2: line plot of measurements (2.MD.9).
  {
    id: 'm.2.graphs-line-plots~line-plot',
    title: 'Line plot',
    assumptions: [
      'Measure each object to the nearest whole inch.',
      'Put one X above the number line at each length.',
      'Count the X’s to answer questions: how many in all, how many longer than 5 inches.',
    ],
    variables: [
      whole('x4', 'x₄', '4-inch objects', 0, 10),
      whole('x5', 'x₅', '5-inch objects', 0, 10),
      whole('x6', 'x₆', '6-inch objects', 0, 10),
      whole('x7', 'x₇', '7-inch objects', 0, 10),
      whole('N', 'N', 'Objects measured', 0, 40),
      whole('L', 'L', 'Longer than 5 inches', 0, 20),
    ],
    relations: [
      {
        id: 'N = all X’s',
        display: '{N} = {x4} + {x5} + {x6} + {x7}',
        vars: ['N', 'x4', 'x5', 'x6', 'x7'],
        residual: (v) => v.N! - v.x4! - v.x5! - v.x6! - v.x7!,
        solve: {
          N: (v) => v.x4! + v.x5! + v.x6! + v.x7!,
          x4: (v) => v.N! - v.x5! - v.x6! - v.x7!,
          x5: (v) => v.N! - v.x4! - v.x6! - v.x7!,
          x6: (v) => v.N! - v.x4! - v.x5! - v.x7!,
          x7: (v) => v.N! - v.x4! - v.x5! - v.x6!,
        },
      },
      {
        id: 'L = X’s above 6 and 7',
        display: '{L} = {x6} + {x7}',
        vars: ['L', 'x6', 'x7'],
        residual: (v) => v.L! - v.x6! - v.x7!,
        solve: { L: (v) => v.x6! + v.x7!, x6: (v) => v.L! - v.x7!, x7: (v) => v.L! - v.x6! },
      },
    ],
    steps: {
      'N = all X’s': {
        N: { expr: '{x4} + {x5} + {x6} + {x7}', how: 'Count every X on the line plot.' },
        x4: { expr: '{N} − {x5} − {x6} − {x7}', how: 'Take the other columns away from all.' },
        x5: { expr: '{N} − {x4} − {x6} − {x7}', how: 'Take the other columns away from all.' },
        x6: { expr: '{N} − {x4} − {x5} − {x7}', how: 'Take the other columns away from all.' },
        x7: { expr: '{N} − {x4} − {x5} − {x6}', how: 'Take the other columns away from all.' },
      },
      'L = X’s above 6 and 7': {
        L: { expr: '{x6} + {x7}', how: 'Longer than 5 inches means 6 or 7 inches: add them.' },
        x6: { expr: '{L} − {x7}', how: 'Take the 7-inch objects away from those longer than 5.' },
        x7: { expr: '{L} − {x6}', how: 'Take the 6-inch objects away from those longer than 5.' },
      },
    },
    example: { x4: 2, x5: 5, x6: 3, x7: 1, N: 11, L: 4 },
    startWith: ['x4', 'x5', 'x6', 'x7'],
    representation: {
      kind: 'linePlot',
      unit: 'in',
      points: [
        { var: 'x4', at: 4 },
        { var: 'x5', at: 5 },
        { var: 'x6', at: 6 },
        { var: 'x7', at: 7 },
      ],
    },
  },

  // Grade 2: polygons by sides and angles (2.G.1), and rows and columns of squares (2.G.2).
  {
    id: 'm.2.thirds-polygons~polygons',
    title: 'Polygons',
    assumptions: [
      'A polygon is a closed flat shape with straight sides.',
      'It has as many angles as sides: triangle 3, quadrilateral 4, pentagon 5, hexagon 6.',
      'Name a shape by counting its sides or its angles, not by its size or how it is turned.',
    ],
    variables: [whole('s', 's', 'Sides', 3, 6), whole('a', 'a', 'Angles', 3, 6)],
    relations: [
      {
        id: 'angles = sides',
        display: '{a} angles = {s} sides',
        vars: ['a', 's'],
        residual: (v) => v.a! - v.s!,
        solve: { a: (v) => v.s!, s: (v) => v.a! },
      },
    ],
    steps: {
      'angles = sides': {
        a: {
          expr: '{s}',
          how: 'Each angle is where two sides meet, so there are as many angles as sides.',
        },
        s: {
          expr: '{a}',
          how: 'Between each angle and the next is one side, so there are as many sides as angles.',
        },
      },
    },
    example: { s: 5, a: 5 },
    startWith: ['s'],
    representation: { kind: 'polygon', sides: 's' },
  },

  {
    id: 'm.2.thirds-polygons~rows-columns',
    title: 'Rows and columns of squares',
    assumptions: [
      'Cut a rectangle into rows and columns of same-size squares, with no gaps or overlaps.',
      'Count the squares: add the number in a row once for each row.',
    ],
    variables: [
      whole('r', 'r', 'Rows', 1, 6),
      whole('c', 'c', 'Columns', 1, 6),
      whole('n', 'n', 'Squares', 1, 36),
    ],
    relations: [
      {
        id: 'n = r rows of c',
        display: '{n} = {r} rows of {c}',
        vars: ['n', 'r', 'c'],
        residual: (v) => v.n! - v.r! * v.c!,
        solve: { n: (v) => v.r! * v.c!, r: (v) => div(v.n!, v.c!), c: (v) => div(v.n!, v.r!) },
      },
    ],
    steps: {
      'n = r rows of c': {
        n: { expr: '{r} rows of {c}', how: 'Add the squares in one row once for each row.' },
        r: {
          expr: '{n} ÷ {c}',
          how: 'Make rows of c squares until all n are used. Count the rows.',
        },
        c: { expr: '{n} ÷ {r}', how: 'Share the n squares equally into r rows. Count one row.' },
      },
    },
    example: { r: 2, c: 3, n: 6 },
    startWith: ['r', 'c'],
    representation: {
      kind: 'array',
      rows: 'r',
      columns: 'c',
      total: 'n',
      max: 6,
      cell: 'square',
    },
  },
];

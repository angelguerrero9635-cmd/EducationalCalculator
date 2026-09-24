/**
 * Section 1 extra modules: common test question types that need a different model or picture
 * from a skill's main module (found by the exam-coverage review). Ids are `<skill id>~<slug>`.
 */
import type { ModuleDef, StepText } from './types';
import type { Values } from '@/engine/types';

import {
  addWork,
  cmpBars,
  cmpShapes,
  countUpWork,
  difference,
  div,
  subtractWork,
  whole,
} from './math-k2';
import {
  addAll,
  addStrategy,
  countList,
  dealLines,
  countUp,
  missingPart,
  repeated,
  subtractStrategy,
  sumSteps,
} from './work';

/** Cents written as dollars and cents, e.g. "$1.35". */
const dollars = (cents: number) =>
  `$${Math.floor(cents / 100)}.${String(Math.round(cents % 100)).padStart(2, '0')}`;

/** Compare word problems (how many more or fewer), with a tape diagram, up to `max`. */
function compareProblem(id: string, max: number, example: [number, number]) {
  return {
    id,
    title: 'Compare problems',
    assumptions: [
      'Compare problems ask: how many more? How many fewer?',
      '“Maya has 2 more than Kofi” means Maya has the bigger amount: Kofi’s amount + 2.',
      '“More” in the question doesn’t always mean add. First find who has more.',
      '“How many more” and “how many fewer” have the same answer.',
    ],
    variables: [
      whole('B', 'B', 'Bigger amount', 0, max),
      whole('S', 'S', 'Smaller amount', 0, max),
      whole('d', 'd', 'How many more (or fewer)', 0, max),
    ],
    relations: [
      {
        id: 'd = B − S',
        display: '{d} = {B} − {S}',
        vars: ['d', 'B', 'S'],
        residual: (v: Values) => v.d! - (v.B! - v.S!),
        solve: {
          d: (v: Values) => v.B! - v.S!,
          B: (v: Values) => v.S! + v.d!,
          S: (v: Values) => v.B! - v.d!,
        },
      },
    ],
    steps: {
      'd = B − S': {
        d: {
          expr: '{B} − {S}',
          how: 'Line up the two bars. Count up from the smaller amount to the bigger one.',
          work: (v: Values) => countUp(v.S!, v.B!),
        },
        B: {
          expr: '{S} + {d}',
          how: 'The bigger amount is the smaller amount plus the extra.',
          work: (v: Values) => addStrategy(v.S!, v.d!),
        },
        S: {
          expr: '{B} − {d}',
          how: 'The smaller amount is the bigger amount without the extra.',
          work: (v: Values) => subtractStrategy(v.B!, v.d!),
        },
      },
    },
    example: { B: example[0], S: example[1], d: example[0] - example[1] },
    startWith: ['B', 'S'],
    representation: {
      kind: 'tape' as const,
      compare: ['B', 'S'] as [string, string],
      difference: 'd',
    },
  };
}

/** Difference of two numbers; Grade 1 counts up (1.NBT.6 doesn't subtract two-digit numbers). */
const cmpNumbers = (grade1: boolean) =>
  difference('d', 'a', 'b', {
    diff: 'Count up from the smaller number to the greater one.',
    first: [
      'The first number is greater. Add the difference to the second number.',
      'The first number is less. Take the difference away from the second number.',
    ],
    second: [
      'The first number is greater. Take the difference away from the first number.',
      'The first number is less. Add the difference to the first number.',
    ],
    countUp: true,
    compare: true,
  });

/** Compare two numbers with >, < or = using base-ten blocks. */
const compareNumbers = (id: string, max: number, steps: number[], example: [number, number]) => ({
  id: `${id}~compare`,
  pictureLabels: ['d'],
  title: 'Compare numbers',
  assumptions: [
    max > 99
      ? 'Compare the hundreds first. If they are the same, compare the tens, then the ones.'
      : 'Compare the tens first. If they are the same, compare the ones.',
    '> means “is greater than”, < means “is less than”. The open side faces the greater number.',
  ],
  variables: [
    whole('a', 'a', 'First number', 0, max),
    whole('b', 'b', 'Second number', 0, max),
    whole('d', 'd', 'Difference', 0, max),
  ],
  relations: [cmpNumbers(max <= 99).relation],
  steps: cmpNumbers(max <= 99).steps,
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
  compareProblem('m.1.add-sub-20~compare', 20, [11, 7]),

  compareNumbers('m.1.tens-ones', 99, [1, 10], [45, 54]),

  // Grade 2: word problems with a tape diagram, one and two steps (2.OA.1), and adding up to
  // four numbers (2.NBT.6).
  {
    id: 'm.2.add-sub-100-fluency~tape',
    title: 'Word problems',
    assumptions: [
      'Draw one bar for the whole and cut it into the two parts.',
      'To find the whole, add the parts. To find a part, take the other part away.',
      'Example: 72 stickers, 45 are stars. How many are not stars? 72 − 45 = 27.',
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
        c: { work: addWork, expr: '{a} + {b}', how: 'The whole is both parts together: add.' },
        a: {
          work: subtractWork,
          expr: '{c} − {b}',
          how: 'Take the known part away from the whole.',
        },
        b: {
          work: countUpWork,
          expr: '{c} − {a}',
          how: 'Count up from the known part to the whole.',
        },
      },
    },
    example: { a: 45, b: 27, c: 72 },
    startWith: ['c', 'a'],
    representation: { kind: 'tape', parts: ['a', 'b'], total: 'c' },
  },

  {
    id: 'm.2.add-sub-100-fluency~four-numbers',
    title: 'Add four numbers',
    assumptions: [
      'Add all the tens. Then all the ones. Look for ones that make a ten.',
      'In 23 + 17, the 3 and the 7 make a ten.',
    ],
    variables: [
      whole('a', 'a', 'First', 0, 99),
      whole('b', 'b', 'Second', 0, 99),
      whole('c', 'c', 'Third', 0, 99),
      whole('e', 'e', 'Fourth', 0, 99),
      whole('n', 'n', 'Total', 0, 396),
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
          work: (v) => {
            const xs = [v.a!, v.b!, v.c!, v.e!];
            const tens = xs.map((x) => x - (x % 10));
            const ones = xs.map((x) => x % 10);
            const T = tens.reduce((p, q) => p + q, 0);
            const O = ones.reduce((p, q) => p + q, 0);
            return [
              ...addAll(tens).map((l) => `Tens: ${l}`),
              ...addAll(ones).map((l) => `Ones: ${l}`),
              ...(addStrategy(T, O).length ? addStrategy(T, O) : [`${T} + ${O} = ${T + O}`]),
            ];
          },
          expr: '{a} + {b} + {c} + {e}',
          how: 'Add all the tens, then all the ones. Trade 10 ones for a ten.',
        },
        a: {
          work: (v) => [
            ...sumSteps([v.b!, v.c!, v.e!]),
            ...missingPart(v.n!, [v.b!, v.c!, v.e!]).slice(-1),
            ...subtractStrategy(v.n!, v.b! + v.c! + v.e!),
          ],
          expr: '{n} − {b} − {c} − {e}',
          how: 'Take the other numbers away from the total.',
        },
        b: {
          work: (v) => [
            ...sumSteps([v.a!, v.c!, v.e!]),
            ...missingPart(v.n!, [v.a!, v.c!, v.e!]).slice(-1),
            ...subtractStrategy(v.n!, v.a! + v.c! + v.e!),
          ],
          expr: '{n} − {a} − {c} − {e}',
          how: 'Take the other numbers away from the total.',
        },
        c: {
          work: (v) => [
            ...sumSteps([v.a!, v.b!, v.e!]),
            ...missingPart(v.n!, [v.a!, v.b!, v.e!]).slice(-1),
            ...subtractStrategy(v.n!, v.a! + v.b! + v.e!),
          ],
          expr: '{n} − {a} − {b} − {e}',
          how: 'Take the other numbers away from the total.',
        },
        e: {
          work: (v) => [
            ...sumSteps([v.a!, v.b!, v.c!]),
            ...missingPart(v.n!, [v.a!, v.b!, v.c!]).slice(-1),
            ...subtractStrategy(v.n!, v.a! + v.b! + v.c!),
          ],
          expr: '{n} − {a} − {b} − {c}',
          how: 'Take the other numbers away from the total.',
        },
      },
    },
    example: { a: 23, b: 15, c: 32, e: 17, n: 87 },
    startWith: ['a', 'b', 'c', 'e'],
    representation: {
      kind: 'baseTen',
      groups: ['a', 'b', 'c', 'e'],
      total: 'n',
      controls: [
        { var: 'a', steps: [1, 10] },
        { var: 'b', steps: [1, 10] },
        { var: 'c', steps: [1, 10] },
        { var: 'e', steps: [1, 10] },
      ],
    },
  },

  compareNumbers('m.2.place-value-1000', 999, [1, 10, 100], [347, 374]),

  // Grade 2: line plot of measurements (2.MD.9).
  {
    id: 'm.2.graphs-line-plots~line-plot',
    title: 'Line plot',
    assumptions: [
      'Measure each object to the nearest whole inch.',
      'Put one X above the number line for each object, at its length.',
      'Count the X’s to find how many objects in all.',
    ],
    variables: [
      whole('x4', 'A', '4 inches long', 0, 10),
      whole('x5', 'B', '5 inches long', 0, 10),
      whole('x6', 'C', '6 inches long', 0, 10),
      whole('x7', 'D', '7 inches long', 0, 10),
      whole('N', 'N', 'Objects measured', 0, 40),
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
    ],
    steps: {
      'N = all X’s': {
        N: {
          expr: '{x4} + {x5} + {x6} + {x7}',
          how: 'Count every X on the line plot.',
          work: (v) => sumSteps([v.x4!, v.x5!, v.x6!, v.x7!]),
        },
        x4: {
          work: (v) => missingPart(v.N!, [v.x5!, v.x6!, v.x7!]),
          expr: '{N} − {x5} − {x6} − {x7}',
          how: 'Take the X’s at the other lengths away from the total.',
        },
        x5: {
          work: (v) => missingPart(v.N!, [v.x4!, v.x6!, v.x7!]),
          expr: '{N} − {x4} − {x6} − {x7}',
          how: 'Take the X’s at the other lengths away from the total.',
        },
        x6: {
          work: (v) => missingPart(v.N!, [v.x4!, v.x5!, v.x7!]),
          expr: '{N} − {x4} − {x5} − {x7}',
          how: 'Take the X’s at the other lengths away from the total.',
        },
        x7: {
          work: (v) => missingPart(v.N!, [v.x4!, v.x5!, v.x6!]),
          expr: '{N} − {x4} − {x5} − {x6}',
          how: 'Take the X’s at the other lengths away from the total.',
        },
      },
    },
    example: { x4: 2, x5: 5, x6: 3, x7: 1, N: 11 },
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
    pictureLabels: ['N'],
  },

  // Grade 2: polygons by sides and angles (2.G.1), and rows and columns of squares (2.G.2).
  {
    id: 'm.2.thirds-polygons~polygons',
    title: 'Polygons',
    assumptions: [
      'A polygon is a closed flat shape with straight sides.',
      'It has as many angles as sides: triangle 3, quadrilateral 4, pentagon 5, hexagon 6.',
      'Count the sides or angles to name a shape. A bigger or turned shape keeps its name.',
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
          how: 'Each angle is where two sides meet. There is one angle for each side.',
        },
        s: {
          expr: '{a}',
          how: 'There is one side between two angles. There is one side for each angle.',
        },
      },
    },
    example: { s: 5, a: 5 },
    startWith: ['s'],
    representation: { kind: 'polygon', sides: 's', words: 'angle', corners: 'a' },
  },

  {
    id: 'm.2.thirds-polygons~rows-columns',
    title: 'Rows and columns of squares',
    assumptions: [
      'Cut a rectangle into rows and columns of same-size squares. Leave no gaps.',
      'Count the squares: add the number in a row once for each row.',
    ],
    variables: [
      whole('r', 'r', 'Rows', 1, 6),
      whole('c', 'c', 'In each row', 1, 6),
      whole('n', 'n', 'Squares', 1, 36),
    ],
    relations: [
      {
        id: 'n = r rows of c',
        check: (v) => repeated(v.c!, v.r!),
        display: '{n} = {r} rows of {c}',
        vars: ['n', 'r', 'c'],
        residual: (v) => v.n! - v.r! * v.c!,
        solve: { n: (v) => v.r! * v.c!, r: (v) => div(v.n!, v.c!), c: (v) => div(v.n!, v.r!) },
      },
    ],
    steps: {
      'n = r rows of c': {
        n: {
          work: (v) => [repeated(v.c!, v.r!)],
          expr: '{r} rows of {c}',
          how: 'Add the number in one row, once for each row.',
        },
        r: {
          work: (v) => [`Count by ${v.c}s to ${v.n}: ${countList(0, v.c!, v.r!)} → ${v.r} rows`],
          expr: 'rows of {c} in {n}',
          how: 'Make rows until you use all the squares. Count the rows.',
        },
        c: {
          work: (v) => dealLines(v.r!, v.c!, 'row'),
          expr: '{n} shared into {r} rows',
          how: 'Deal 1 square to each row. Keep going until the squares are gone. Count one row.',
        },
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

  // Split from m.2.place-value-1000: expanded form (2.NBT.3).
  {
    id: 'm.2.place-value-1000~expanded',
    title: 'Expanded form',
    assumptions: [
      'Expanded form adds the value of each digit: 347 = 300 + 40 + 7.',
      'The hundreds part is 100, 200, 300 and so on. The tens part is 10, 20, 30 and so on.',
      'A 0 digit adds nothing: 305 = 300 + 0 + 5.',
    ],
    variables: [
      { ...whole('H', 'H', 'Hundreds part', 0, 900), multipleOf: 100, step: 100 },
      { ...whole('T', 'T', 'Tens part', 0, 90), multipleOf: 10, step: 10 },
      whole('O', 'O', 'Ones part', 0, 9),
      whole('n', 'n', 'Number', 0, 999),
    ],
    relations: [
      {
        id: 'n = H + T + O',
        display: '{n} = {H} + {T} + {O}',
        vars: ['n', 'H', 'T', 'O'],
        residual: (v) => v.n! - v.H! - v.T! - v.O!,
        solve: {
          n: (v) => v.H! + v.T! + v.O!,
          H: (v) => v.n! - v.T! - v.O!,
          T: (v) => v.n! - v.H! - v.O!,
          O: (v) => v.n! - v.H! - v.T!,
        },
      },
      {
        id: 'H = hundreds in n',
        display: '{H} = hundreds part of {n}',
        vars: ['H', 'n'],
        residual: (v) => v.H! - 100 * Math.floor(v.n! / 100),
        solve: { H: (v) => 100 * Math.floor(v.n! / 100), n: () => undefined },
      },
      {
        id: 'T = tens in n',
        display: '{T} = tens part of {n}',
        vars: ['T', 'n'],
        residual: (v) => v.T! - 10 * (Math.floor(v.n! / 10) % 10),
        solve: { T: (v) => 10 * (Math.floor(v.n! / 10) % 10), n: () => undefined },
      },
    ],
    steps: {
      'n = H + T + O': {
        n: {
          work: (v) => sumSteps([v.H!, v.T!, v.O!]),
          expr: '{H} + {T} + {O}',
          how: 'Add the parts: hundreds, then tens, then ones.',
        },
        H: {
          work: (v) => [`${v.n} − ${v.T} = ${v.n! - v.T!}`, `${v.n! - v.T!} − ${v.O} = ${v.H}`],
          expr: '{n} − {T} − {O}',
          how: 'Take the tens and ones away. The rest is hundreds.',
        },
        T: {
          work: (v) => [`${v.n} − ${v.H} = ${v.n! - v.H!}`, `${v.n! - v.H!} − ${v.O} = ${v.T}`],
          expr: '{n} − {H} − {O}',
          how: 'Take the hundreds and ones away. The rest is tens.',
        },
        O: {
          work: (v) => [`${v.n} − ${v.H} = ${v.n! - v.H!}`, `${v.n! - v.H!} − ${v.T} = ${v.O}`],
          expr: '{n} − {H} − {T}',
          how: 'Take the hundreds and tens away. The rest is ones.',
        },
      },
      'H = hundreds in n': {
        H: {
          work: (v) => [
            `${v.n}: hundreds digit ${Math.floor(v.n! / 100)} → ${Math.floor(v.n! / 100)} hundreds = ${v.H}`,
          ],
          expr: 'hundreds part of {n}',
          how: 'The hundreds digit tells how many hundreds.',
        },
      },
      'T = tens in n': {
        T: {
          work: (v) => [
            `${v.n}: tens digit ${Math.floor(v.n! / 10) % 10} → ${Math.floor(v.n! / 10) % 10} tens = ${v.T}`,
          ],
          expr: 'tens part of {n}',
          how: 'The tens digit tells how many tens.',
        },
      },
    },
    example: { H: 300, T: 40, O: 7, n: 347 },
    startWith: ['H', 'T', 'O'],
    representation: {
      kind: 'baseTen',
      words: 'n',
      groups: ['H', 'T', 'O'],
      total: 'n',
      controls: [
        { var: 'H', steps: [100] },
        { var: 'T', steps: [10] },
        { var: 'O', steps: [1] },
      ],
    },
  },

  // Split from m.2.standard-length: adding lengths on a number line (2.MD.5, 2.MD.6).
  {
    id: 'm.2.standard-length~number-line',
    title: 'Lengths on a number line',
    assumptions: [
      'Put two lengths end to end. Add them to find the total length.',
      'On a number line, start at 0. Jump the first length. Then jump the second.',
      'Use the same unit for both lengths.',
    ],
    variables: [
      { ...whole('a', 'a', 'First length', 0, 100), unit: 'cm' },
      { ...whole('b', 'b', 'Second length', 0, 100), unit: 'cm' },
      { ...whole('s', 's', 'Total length', 0, 100), unit: 'cm' },
    ],
    relations: [
      {
        id: 's = a + b',
        display: '{s} = {a} + {b}',
        vars: ['s', 'a', 'b'],
        residual: (v) => v.s! - v.a! - v.b!,
        solve: { s: (v) => v.a! + v.b!, a: (v) => v.s! - v.b!, b: (v) => v.s! - v.a! },
      },
    ],
    steps: {
      's = a + b': {
        s: {
          expr: '{a} + {b}',
          how: 'Start at the first length. Jump the second length. Read where you land.',
          work: (v) => addStrategy(v.a!, v.b!),
        },
        a: {
          expr: '{s} − {b}',
          how: 'Take the second length away from the total.',
          work: (v) => subtractStrategy(v.s!, v.b!),
        },
        b: {
          expr: '{s} − {a}',
          how: 'Count on from the first length to the total.',
          work: (v) => countUp(v.a!, v.s!),
        },
      },
    },
    example: { a: 35, b: 20, s: 55 },
    startWith: ['a', 'b'],
    representation: {
      kind: 'numberLine',
      start: 'a',
      jump: 'b',
      end: 's',
      min: 0,
      max: 100,
      tick: 10,
      jumps: 'tens',
    },
  },

  // Split from m.2.money: making change (2.MD.8).
  {
    id: 'm.2.money~change',
    title: 'Money left after buying',
    assumptions: [
      'Money you have = price + money left.',
      'To find what is left, take the price away. Count up from the price to check.',
      'Type $1.25 or 125¢. Both mean the same amount.',
    ],
    variables: [
      { ...whole('T', 'T', 'Money you have', 0, 1000), unit: '¢' },
      { ...whole('P', 'P', 'Price', 0, 1000), unit: '¢' },
      { ...whole('L', 'L', 'Money left', 0, 1000), unit: '¢' },
    ],
    relations: [
      {
        id: 'T = P + L',
        display: '{T} = {P} + {L}',
        vars: ['T', 'P', 'L'],
        residual: (v) => v.T! - v.P! - v.L!,
        solve: { T: (v) => v.P! + v.L!, P: (v) => v.T! - v.L!, L: (v) => v.T! - v.P! },
      },
    ],
    steps: {
      'T = P + L': {
        L: {
          work: (v) => countUp(v.P!, v.T!, '¢'),
          expr: '{T} − {P}',
          how: 'Count up from the price to the money you have.',
          note: (v) => `(${dollars(v.L!)})`,
        },
        P: {
          work: (v) => subtractStrategy(v.T!, v.L!, '¢'),
          expr: '{T} − {L}',
          how: 'Take the money left away from the money you have.',
          note: (v) => `(${dollars(v.P!)})`,
        },
        T: {
          work: (v) => addStrategy(v.P!, v.L!, '¢'),
          expr: '{P} + {L}',
          how: 'Add the price and the money left.',
          note: (v) => `(${dollars(v.T!)})`,
        },
      },
    },
    example: { T: 100, P: 65, L: 35 },
    startWith: ['T', 'P'],
    representation: { kind: 'tape', parts: ['P', 'L'], total: 'T' },
  },

  // ─── Added from the Section 1 reviews (exam, textbook, teacher and tutor) ─────────────────

  // Grade 2 compare word problems within 100 (2.OA.1).
  compareProblem('m.2.add-sub-100-fluency~compare', 100, [52, 37]),

  // Grade 1: how many more in a picture graph (1.MD.4).
  {
    id: 'm.1.data-3-categories~compare',
    title: 'How many more?',
    assumptions: [
      'Each picture stands for one object.',
      'Line up the two columns. Count the extra pictures in the taller one.',
    ],
    variables: [
      whole('c', 'c', 'Circles', 0, 10),
      whole('s', 's', 'Squares', 0, 10),
      whole('d', 'd', 'How many more', 0, 10),
    ],
    relations: [cmpShapes.relation],
    steps: { ...cmpShapes.steps },
    example: { c: 6, s: 3, d: 3 },
    startWith: ['c', 's'],
    representation: {
      kind: 'pictureGraph',
      columns: [
        { var: 'c', icon: 'circle' },
        { var: 's', icon: 'square' },
      ],
      max: 10,
    },
    pictureLabels: ['d'],
  },

  // Grade 2: how many more in a bar graph (2.MD.10).
  {
    id: 'm.2.graphs-line-plots~compare',
    pictureLabels: ['d'],
    title: 'How many more? (bar graph)',
    assumptions: [
      'Read each bar’s number on the scale, starting at 0.',
      'To compare, count up from the shorter bar to the taller bar.',
    ],
    variables: [
      whole('a', 'a', 'Soccer', 0, 20),
      whole('b', 'b', 'Basketball', 0, 20),
      whole('d', 'd', 'How many more', 0, 20),
    ],
    relations: [cmpBars.relation],
    steps: { ...cmpBars.steps },
    example: { a: 8, b: 5, d: 3 },
    startWith: ['a', 'b'],
    representation: {
      kind: 'bars',
      bars: [
        { var: 'a', editable: true },
        { var: 'b', editable: true },
      ],
      min: 0,
      max: 10,
      scale: 1,
    },
  },

  // Kindergarten: heavier and lighter on a pan balance (K.MD.2).
  ((): ModuleDef => {
    const cmp = difference('d', 'a', 'b', {
      diff: 'Put the objects on the balance. Count the extra cubes on the lower side.',
      countOn: true,
      display: '{d} = how much heavier: {a} or {b}',
      first: [
        'Object A is heavier. Add the extra cubes to object B.',
        'Object A is lighter. Take the extra cubes away from object B.',
      ],
      second: [
        'Object A is heavier. Take the extra cubes away from object A.',
        'Object A is lighter. Add the extra cubes to object A.',
      ],
    });
    return {
      id: 'm.K.measurable-attributes~weight',
      title: 'Heavier and lighter',
      assumptions: [
        'Put one object on each side of the balance.',
        'The heavier side goes down.',
        'If the balance is level, they weigh the same.',
      ],
      variables: [
        { ...whole('a', 'a', 'Object A', 0, 10), unit: 'cubes' },
        { ...whole('b', 'b', 'Object B', 0, 10), unit: 'cubes' },
        { ...whole('d', 'd', 'How much heavier', 0, 10), unit: 'cubes' },
      ],
      relations: [cmp.relation],
      steps: { ...cmp.steps },
      example: { a: 7, b: 4, d: 3 },
      startWith: ['a', 'b'],
      representation: { kind: 'balance' as const, left: ['a'], right: ['b'] },
      pictureLabels: ['d'],
    };
  })(),

  // Grade 1: is the number sentence true or false? (1.OA.7).
  (() => {
    const L = (v: Values) => v.a! + v.b!;
    const R = (v: Values) => v.c! + v.d!;
    const leftMore = (v: Values) => L(v) >= R(v);
    const sides = (v: Values) => [
      `Left: ${v.a} + ${v.b} = ${L(v)}`,
      `Right: ${v.c} + ${v.d} = ${R(v)}`,
    ];
    // A missing number on one side: the other side's total, plus or minus the difference.
    const missing = (x: 'a' | 'b' | 'c' | 'd'): StepText => {
      const left = x === 'a' || x === 'b';
      const partner = { a: 'b', b: 'a', c: 'd', d: 'c' }[x];
      const other = left ? '({c} + {d})' : '({a} + {b})';
      // Which way: the side with x is the bigger one when the left is bigger and x is on the left.
      const bigger = (v: Values) => leftMore(v) === left;
      return {
        expr: (v) => `${other} ${bigger(v) ? '+' : '−'} {D} − {${partner}}`,
        how: (v) =>
          `Add the ${left ? 'right' : 'left'} side. ${bigger(v) ? 'Add' : 'Take away'} the difference. Then take away the other number on this side.`,
        work: (v) => {
          const o = left ? R(v) : L(v);
          const side = bigger(v) ? o + v.D! : o - v.D!;
          return [
            left ? `Right: ${v.c} + ${v.d} = ${o}` : `Left: ${v.a} + ${v.b} = ${o}`,
            `${o} ${bigger(v) ? '+' : '−'} ${v.D} = ${side}`,
            `${side} − ${v[partner]} = ${v[x]}`,
          ];
        },
      };
    };
    const mod: ModuleDef = {
      id: 'm.1.equal-sign~true-false',
      title: 'True or false?',
      assumptions: [
        'A number sentence is true when both sides are the same amount.',
        'Add each side. Then compare: 6 + 1 = 5 + 2 is true, because 7 and 7 are the same.',
        'If the sides are not the same, the sentence is false. The balance tips.',
      ],
      variables: [
        whole('a', 'a', 'First on left', 0, 10),
        whole('b', 'b', 'Second on left', 0, 10),
        whole('c', 'c', 'First on right', 0, 10),
        whole('d', 'd', 'Second on right', 0, 10),
        whole('D', 'g', 'How far apart the sides are', 0, 20),
      ],
      relations: [
        {
          id: 'D = difference of the sides',
          display: '{D} = difference of ({a} + {b}) and ({c} + {d})',
          vars: ['D', 'a', 'b', 'c', 'd'],
          residual: (v: Values) => v.D! - Math.abs(L(v) - R(v)),
          check: (v: Values) =>
            `${Math.max(L(v), R(v))} − ${Math.min(L(v), R(v))} = ${Math.abs(L(v) - R(v))}`,
          solve: {
            D: (v: Values) => Math.abs(L(v) - R(v)),
            a: (v: Values) => [R(v) - v.b! + v.D!, R(v) - v.b! - v.D!],
            b: (v: Values) => [R(v) - v.a! + v.D!, R(v) - v.a! - v.D!],
            c: (v: Values) => [L(v) - v.d! + v.D!, L(v) - v.d! - v.D!],
            d: (v: Values) => [L(v) - v.c! + v.D!, L(v) - v.c! - v.D!],
          },
        },
      ],
      steps: {
        'D = difference of the sides': {
          D: {
            expr: (v) => (leftMore(v) ? '({a} + {b}) − ({c} + {d})' : '({c} + {d}) − ({a} + {b})'),
            how: 'Add each side. Take the smaller side away from the bigger side. 0 means true.',
            work: (v) => [
              ...sides(v),
              `${Math.max(L(v), R(v))} − ${Math.min(L(v), R(v))} = ${v.D}`,
            ],
            note: (v: Values) =>
              v.D === 0 ? `(true: ${L(v)} = ${R(v)})` : `(false: ${L(v)} ≠ ${R(v)})`,
          },
          a: missing('a'),
          b: missing('b'),
          c: missing('c'),
          d: missing('d'),
        },
      },
      example: { a: 6, b: 1, c: 5, d: 2, D: 0 },
      startWith: ['a', 'b', 'c', 'd'],
      representation: { kind: 'balance' as const, left: ['a', 'b'], right: ['c', 'd'] },
      pictureLabels: ['D'],
    };
    return mod;
  })(),

  // Grade 2: the same number with extra tens or ones, e.g. 3 hundreds 14 tens 5 ones (2.NBT.1).
  {
    id: 'm.2.place-value-1000~regroup',
    title: 'Trade tens and ones',
    assumptions: [
      '10 ones make 1 ten. 10 tens make 1 hundred.',
      'A number can have more than 9 tens or ones: 3 hundreds, 14 tens, 5 ones is 445.',
    ],
    variables: [
      whole('n', 'n', 'Number', 0, 999),
      whole('h', 'h', 'Hundreds', 0, 9),
      whole('t', 't', 'Tens', 0, 30),
      whole('o', 'o', 'Ones', 0, 30),
    ],
    relations: [
      {
        id: 'n = h hundreds + t tens + o ones',
        check: (v: Values) => `${100 * v.h!} + ${10 * v.t!} + ${v.o} = ${v.n}`,
        display: '{n} = {h} hundreds + {t} tens + {o} ones',
        vars: ['n', 'h', 't', 'o'],
        residual: (v: Values) => v.n! - 100 * v.h! - 10 * v.t! - v.o!,
        solve: {
          n: (v: Values) => 100 * v.h! + 10 * v.t! + v.o!,
          h: (v: Values) => (v.n! - 10 * v.t! - v.o!) / 100,
          t: (v: Values) => (v.n! - 100 * v.h! - v.o!) / 10,
          o: (v: Values) => v.n! - 100 * v.h! - 10 * v.t!,
        },
      },
    ],
    steps: {
      'n = h hundreds + t tens + o ones': {
        n: {
          work: (v: Values) => [
            `${v.h} hundreds = ${100 * v.h!}`,
            `${v.t} tens = ${10 * v.t!}`,
            `${100 * v.h!} + ${10 * v.t!} = ${100 * v.h! + 10 * v.t!}`,
            `${100 * v.h! + 10 * v.t!} + ${v.o} = ${v.n}`,
          ],
          expr: '{h} hundreds + {t} tens + {o} ones',
          how: 'Find the value of the hundreds and the tens. Then add them with the ones.',
        },
        h: {
          work: (v: Values) => [
            `${v.t} tens = ${10 * v.t!}`,
            `${v.n} − ${10 * v.t!} = ${v.n! - 10 * v.t!}`,
            `${v.n! - 10 * v.t!} − ${v.o} = ${100 * v.h!}`,
            `${100 * v.h!} is ${v.h} hundreds`,
          ],
          expr: 'hundreds in ({n} − {t} tens − {o} ones)',
          how: 'Take away the tens and ones. Count the hundreds left.',
        },
        t: {
          work: (v: Values) => [
            `${v.h} hundreds = ${100 * v.h!}`,
            `${v.n} − ${100 * v.h!} = ${v.n! - 100 * v.h!}`,
            `${v.n! - 100 * v.h!} − ${v.o} = ${10 * v.t!}`,
            `${10 * v.t!} is ${v.t} tens`,
          ],
          expr: 'tens in ({n} − {h} hundreds − {o} ones)',
          how: 'Take away the hundreds and ones. Count the tens left.',
        },
        o: {
          work: (v: Values) => [
            `${v.h} hundreds = ${100 * v.h!}, ${v.t} tens = ${10 * v.t!}`,
            `${v.n} − ${100 * v.h!} = ${v.n! - 100 * v.h!}`,
            `${v.n! - 100 * v.h!} − ${10 * v.t!} = ${v.o}`,
          ],
          expr: '{n} − {h} hundreds − {t} tens',
          how: 'Take away the hundreds and tens. The rest are ones.',
        },
      },
    },
    example: { n: 445, h: 3, t: 14, o: 5 },
    startWith: ['h', 't', 'o'],
    representation: {
      kind: 'baseTen',
      words: 'n',
      groups: ['n'],
      controls: [
        { var: 'h', steps: [1] },
        { var: 't', steps: [1] },
        { var: 'o', steps: [1] },
      ],
    },
  },

  // Grade 1: subtract tens from tens, 10–90 (1.NBT.6).
  {
    id: 'm.1.add-within-100~subtract-tens',
    title: 'Subtract tens',
    assumptions: [
      'Both numbers are tens: 10, 20, 30, … 90.',
      'Take away tens from tens: 7 tens − 3 tens = 4 tens, so 70 − 30 = 40.',
    ],
    variables: [
      { ...whole('a', 'a', 'Start', 10, 90), multipleOf: 10, step: 10 },
      { ...whole('b', 'b', 'Take away', 0, 90), multipleOf: 10, step: 10 },
      { ...whole('c', 'c', 'Left', 0, 90), multipleOf: 10, step: 10 },
    ],
    relations: [
      {
        id: 'a − b = c',
        display: '{a} − {b} = {c}',
        vars: ['a', 'b', 'c'],
        residual: (v: Values) => v.a! - v.b! - v.c!,
        solve: {
          c: (v: Values) => v.a! - v.b!,
          a: (v: Values) => v.c! + v.b!,
          b: (v: Values) => v.a! - v.c!,
        },
      },
    ],
    steps: {
      'a − b = c': {
        c: {
          work: (v: Values) => [
            `${v.a! / 10} tens − ${v.b! / 10} tens = ${v.c! / 10} tens`,
            ...(v.b! > 0 ? [`Count back by tens: ${countList(v.a!, -10, v.b! / 10)}`] : []),
          ],
          expr: '{a} − {b}',
          how: 'Count back by tens: one jump for each ten you take away.',
        },
        a: {
          work: (v: Values) => [`${v.c! / 10} tens + ${v.b! / 10} tens = ${v.a! / 10} tens`],
          expr: '{c} + {b}',
          how: 'Put back what was taken away: add the tens.',
        },
        b: {
          work: (v: Values) => [
            ...(v.c! < v.a!
              ? [`Count up by tens: ${countList(v.c!, 10, (v.a! - v.c!) / 10)}`]
              : []),
            `${v.a! / 10} tens − ${v.c! / 10} tens = ${v.b! / 10} tens`,
          ],
          expr: '{a} − {c}',
          how: 'Count up by tens from what is left to the start.',
        },
      },
    },
    example: { a: 70, b: 30, c: 40 },
    startWith: ['a', 'b'],
    representation: {
      kind: 'hops',
      start: 'a',
      hops: [{ var: 'b', sign: -1 }],
      end: 'c',
      min: 0,
      max: 100,
      tick: 10,
    },
  },

  // Grade 2: 10 more, 10 less, 100 more, 100 less (2.NBT.8).
  {
    id: 'm.2.add-sub-1000~ten-hundred-more',
    title: '10 or 100 more or less',
    assumptions: [
      '10 more or 10 less changes the tens digit by 1.',
      '100 more or 100 less changes the hundreds digit by 1.',
      'Example: 10 more than 356 is 366. 100 less than 356 is 256.',
    ],
    variables: [
      whole('n', 'n', 'Number', 100, 900),
      whole('t', 't', '10 more', 110, 910),
      whole('u', 'u', '10 less', 90, 890),
      whole('H', 'H', '100 more', 200, 1000),
      whole('U', 'U', '100 less', 0, 800),
    ],
    relations: (
      [
        ['t', 10, 'the tens digit goes up by 1'],
        ['u', -10, 'the tens digit goes down by 1'],
        ['H', 100, 'the hundreds digit goes up by 1'],
        ['U', -100, 'the hundreds digit goes down by 1'],
      ] as const
    ).map(([x, k]) => ({
      id: `${x} = n ${k > 0 ? '+' : '−'} ${Math.abs(k)}`,
      display: `{${x}} = {n} ${k > 0 ? '+' : '−'} ${Math.abs(k)}`,
      vars: [x, 'n'],
      residual: (v: Values) => v[x]! - v.n! - k,
      solve: { [x]: (v: Values) => v.n! + k, n: (v: Values) => v[x]! - k },
    })),
    steps: Object.fromEntries(
      (
        [
          ['t', 10, 'tens', 1],
          ['u', -10, 'tens', -1],
          ['H', 100, 'hundreds', 1],
          ['U', -100, 'hundreds', -1],
        ] as const
      ).map(([x, k, place, dir]) => {
        const op = k > 0 ? '+' : '−';
        const inv = k > 0 ? '−' : '+';
        const digit = (n: number) =>
          place === 'tens' ? Math.floor(n / 10) % 10 : Math.floor(n / 100);
        return [
          `${x} = n ${op} ${Math.abs(k)}`,
          {
            [x]: {
              expr: `{n} ${op} ${Math.abs(k)}`,
              how: (v: Values) =>
                Math.floor(v[x]! / (place === 'tens' ? 100 : 1000)) ===
                Math.floor(v.n! / (place === 'tens' ? 100 : 1000))
                  ? `Change the ${place} digit by 1: ${dir > 0 ? 'up' : 'down'}. The other digits stay the same.`
                  : `Change the ${place} digit by 1: ${dir > 0 ? 'up' : 'down'}. It goes past ${dir > 0 ? 9 : 0}, so the hundreds change too.`,
              work: (v: Values) => [
                `${place === 'tens' ? 'Tens' : 'Hundreds'} digit: ${digit(v.n!)} → ${digit(v[x]!)}`,
                `${v.n} ${op} ${Math.abs(k)} = ${v[x]}`,
              ],
            },
            n: {
              expr: `{${x}} ${inv} ${Math.abs(k)}`,
              how: `Go back: change the ${place} digit by 1 the other way.`,
              work: (v: Values) => [
                `${place === 'tens' ? 'Tens' : 'Hundreds'} digit: ${digit(v[x]!)} → ${digit(v.n!)}`,
              ],
            },
          },
        ];
      }),
    ),
    example: { n: 356, t: 366, u: 346, H: 456, U: 256 },
    startWith: ['n'],
    representation: {
      kind: 'baseTen',
      groups: ['n'],
      controls: [{ var: 'n', steps: [10, 100] }],
    },
    pictureLabels: ['U', 'u', 't', 'H'],
  },
];

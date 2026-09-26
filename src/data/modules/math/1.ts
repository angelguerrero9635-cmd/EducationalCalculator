/**
 * Grade 1 math: every calculator module for the grade, the skill's main page first
 * and its problem types (`<skill id>~<slug>`) after it. Shared relation helpers live in
 * `../helpers.ts`; worked-line helpers in `../work.ts`. Rules: docs/MODULE_GUIDE.md.
 */
import type { Values } from '@/engine/types';
import { cmpShapes, fractionNote, whole } from '../helpers';
import { addSub } from '../shared/add-sub';
import { compareNumbers, compareProblem } from '../shared/compare';
import type { ModuleDef, StepText } from '../types';
import {
  addAll,
  addStrategy,
  countList,
  missingPart,
  repeated,
  subtractStrategy,
  sumSteps,
} from '../work';

/** Tens and ones of n (n = t tens + o ones), for counting and place value. */
function tensOnes(maxTens: number) {
  return {
    relations: [
      {
        id: 'n = t tens + o ones',
        display: '{n} = {t} tens + {o} ones',
        vars: ['n', 't', 'o'],
        residual: (v: Record<string, number>) => v.n! - 10 * v.t! - v.o!,
        solve: {
          n: (v: Record<string, number>) => 10 * v.t! + v.o!,
          t: (v: Record<string, number>) => (v.n! - v.o!) / 10,
          o: (v: Record<string, number>) => v.n! - 10 * v.t!,
        },
      },
      {
        id: 't = tens in n',
        display: '{n} has {t} full tens',
        vars: ['t', 'n'],
        residual: (v: Record<string, number>) => v.t! - Math.floor(v.n! / 10),
        // The tens alone don't say which number: n stays unknown (no numeric guess).
        solve: { t: (v: Record<string, number>) => Math.floor(v.n! / 10), n: () => undefined },
      },
      {
        id: 'o = ones left in n',
        display: '{n} has {o} ones left over',
        vars: ['o', 'n'],
        residual: (v: Record<string, number>) => v.o! - (v.n! % 10),
        solve: { o: (v: Record<string, number>) => v.n! % 10, n: () => undefined },
      },
    ],
    steps: {
      'n = t tens + o ones': {
        n: {
          expr: '{t} tens + {o} ones',
          how: 'Count the rods by tens, then count on the small cubes.',
          work: (v: Values) => [`${v.t} tens = ${10 * v.t!}`, `${10 * v.t!} + ${v.o} = ${v.n}`],
        },
        t: {
          expr: 'tens in ({n} − {o})',
          how: 'Take away the extra ones. The rest are groups of ten.',
          work: (v: Values) => [
            `${v.n} − ${v.o} = ${v.n! - v.o!}`,
            `${v.n! - v.o!} is ${v.t} tens`,
          ],
        },
        o: {
          expr: '{n} − {t} tens',
          how: 'Take away the full tens. The ones are left.',
          work: (v: Values) => [`${v.t} tens = ${10 * v.t!}`, `${v.n} − ${10 * v.t!} = ${v.o}`],
        },
      },
      't = tens in n': {
        t: {
          expr: 'full tens in {n}',
          how: 'Count the rods. Each rod is a ten.',
          work: (v: Values) => [
            `${v.n} = ${v.n! - (v.n! % 10)} + ${v.n! % 10}`,
            `${v.n! - (v.n! % 10)} is ${Math.floor(v.n! / 10)} tens`,
          ],
        },
      },
      'o = ones left in n': {
        o: {
          expr: 'ones left in {n}',
          how: 'Count what is left after the full tens.',
          work: (v: Values) => [
            `${v.n} = ${v.n! - (v.n! % 10)} + ${v.n! % 10}`,
            `${v.n! % 10} ones are left`,
          ],
        },
      },
    } as Record<string, Record<string, StepText>>,
    variables: [whole('t', 't', 'Tens', 0, maxTens), whole('o', 'o', 'Ones', 0, 9)],
  };
}
const g1tens = tensOnes(9);
/** Adds three numbers in the order (or grouping) a relation shows: first pair, then the third. */
function sumInOrder(id: string, v: Values): string[] {
  const [x, y, z] =
    id === 'a + (b + c) = s'
      ? [v.b!, v.c!, v.a!]
      : id === 'c + b + a = s'
        ? [v.c!, v.b!, v.a!]
        : [v.a!, v.b!, v.c!];
  // Two numbers that make a ten go first, whichever they are: "5 + 5 = 10, then 10 + 3 = 13".
  const ten = [
    [x, y, z],
    [x, z, y],
    [y, z, x],
  ].find(([p, q]) => p! + q! === 10 && p! > 0 && q! > 0);
  if (ten && x + y !== 10) {
    const [p, q, r] = ten as [number, number, number];
    return [`Make a ten first: ${p} + ${q} = 10`, `10 + ${r} = ${p + q + r}`];
  }
  return id === 'a + (b + c) = s'
    ? [`${x} + ${y} = ${x + y}`, `${z} + ${x + y} = ${x + y + z}`]
    : [`${x} + ${y} = ${x + y}`, `${x + y} + ${z} = ${x + y + z}`];
}

export const MATH_1_MODULES: ModuleDef[] = [
  // ─── Grade 1 ───────────────────────────────────────────────────────────────
  {
    id: 'm.1.add-sub-20',
    assumptions: [
      'All numbers are 0 to 20.',
      'Make a ten: 8 + 5 = 8 + 2 + 3 = 10 + 3.',
      'Subtraction undoes addition: if 8 + 5 = 13, then 13 − 5 = 8.',
    ],
    variables: [
      whole('a', 'a', 'First number', 0, 20),
      whole('b', 'b', 'Second number', 0, 20),
      whole('c', 'c', 'Total', 0, 20),
    ],
    ...addSub({
      c: 'Make a ten first, then add the rest.',
      a: 'Take the second number away from the total.',
      b: 'Count on from the first number up to the total.',
    }),
    example: { a: 8, b: 5, c: 13 },
    startWith: ['a', 'b'],
    representation: { kind: 'tenFrame', first: 'a', second: 'b', total: 'c', frames: 2 },
  },
  // Grade 1: compare word problems (1.OA.1, the hardest problem type in CCSS Table 1).
  compareProblem(
    'm.1.add-sub-20~compare',
    20,
    [11, 7],
    'Use this for “how many more?” and “how many fewer?” word problems.',
  ),
  // Take from ten: 14 − 8 = (10 − 8) + 4 (1.OA.6, Eureka Grade 1 Module 2).
  {
    id: 'm.1.add-sub-20~take-from-ten',
    title: 'Take from ten',
    use: 'Use this for 14 − 8 by taking 8 from the 10.',
    assumptions: [
      'Split the teen number into 10 and some ones: 14 is 10 and 4.',
      'Take the number away from the 10. Then add the ones back.',
    ],
    variables: [
      whole('c', 'c', 'Start (11–19)', 11, 19),
      whole('b', 'b', 'Take away', 2, 9),
      whole('o', 'o', 'Extra ones', 1, 9),
      whole('r', 'r', 'Left from the 10', 1, 8),
      whole('a', 'a', 'Answer', 2, 17),
    ],
    relations: [
      {
        id: 'o = c − 10',
        display: '{c} = 10 + {o}',
        vars: ['o', 'c'],
        residual: (v) => v.o! - v.c! + 10,
        solve: { o: (v) => v.c! - 10, c: (v) => v.o! + 10 },
      },
      {
        id: 'r = 10 − b',
        display: '10 − {b} = {r}',
        vars: ['r', 'b'],
        residual: (v) => v.r! - 10 + v.b!,
        solve: { r: (v) => 10 - v.b!, b: (v) => 10 - v.r! },
      },
      {
        id: 'a = r + o',
        display: '{r} + {o} = {a}',
        vars: ['a', 'r', 'o'],
        residual: (v) => v.a! - v.r! - v.o!,
        solve: { a: (v) => v.r! + v.o!, r: (v) => v.a! - v.o!, o: (v) => v.a! - v.r! },
      },
    ],
    steps: {
      'o = c − 10': {
        o: { expr: '{c} − 10', how: 'Split the teen number: the 10 and the ones.' },
        c: { expr: '10 + {o}', how: 'Put the 10 and the ones together.' },
      },
      'r = 10 − b': {
        r: { expr: '10 − {b}', how: 'Take the number away from the 10.' },
        b: { expr: '10 − {r}', how: 'The 10 minus what is left is what was taken.' },
      },
      'a = r + o': {
        a: {
          expr: '{r} + {o}',
          how: 'Add what is left from the 10 and the ones.',
          work: (v: Values) => addStrategy(v.r!, v.o!),
        },
        r: { expr: '{a} − {o}', how: 'Take the ones away from the answer.' },
        o: { expr: '{a} − {r}', how: 'Take what is left from the 10 away from the answer.' },
      },
    },
    example: { c: 14, b: 8, o: 4, r: 2, a: 6 },
    startWith: ['c', 'b'],
    representation: { kind: 'tenFrame', first: 'a', second: 'b', total: 'c', frames: 2 },
    pictureLabels: ['o', 'r'],
  },
  {
    id: 'm.1.addition-properties',
    assumptions: [
      'Changing the order doesn’t change the total: 3 + 5 = 5 + 3.',
      'Add any two first. The total is the same: 3 + 5 + 2 = 3 + 7.',
      'Pick two that are easy to add, like a ten.',
    ],
    variables: [
      whole('a', 'a', 'First number', 0, 10),
      whole('b', 'b', 'Second number', 0, 10),
      whole('c', 'c', 'Third number', 0, 10),
      whole('s', 's', 'Total', 0, 20),
    ],
    relations: (
      [
        ['(a + b) + c = s', 'Add the first two first: {a} + {b} + {c} = {s}'],
        ['a + (b + c) = s', 'Add the last two first: {a} + {b} + {c} = {s}'],
        ['c + b + a = s', 'Change the order: {c} + {b} + {a} = {s}'],
      ] as const
    ).map(([id, display]) => ({
      id,
      display,
      vars: ['a', 'b', 'c', 's'],
      residual: (v: Record<string, number>) => v.a! + v.b! + v.c! - v.s!,
      solve: {
        s: (v: Record<string, number>) => v.a! + v.b! + v.c!,
        a: (v: Record<string, number>) => v.s! - v.b! - v.c!,
        b: (v: Record<string, number>) => v.s! - v.a! - v.c!,
        c: (v: Record<string, number>) => v.s! - v.a! - v.b!,
      },
    })),
    steps: Object.fromEntries(
      [
        ['(a + b) + c = s', '({a} + {b}) + {c}', 'Add the first two. Then add the third.'],
        [
          'a + (b + c) = s',
          '{a} + ({b} + {c})',
          'Add the last two first. Then add the first. The total is the same.',
        ],
        ['c + b + a = s', '{c} + {b} + {a}', 'Add in the opposite order. The total is the same.'],
      ].map(([id, expr, how]) => [
        id!,
        {
          s: { expr: expr!, how: how!, work: (v: Values) => sumInOrder(id!, v) },
          a: {
            expr: '{s} − {b} − {c}',
            how: 'Take the other two numbers away from the total.',
            work: (v: Values) => [
              `${v.s} − ${v.b} = ${v.s! - v.b!}`,
              `${v.s! - v.b!} − ${v.c} = ${v.a}`,
            ],
          },
          b: {
            expr: '{s} − {a} − {c}',
            how: 'Take the other two numbers away from the total.',
            work: (v: Values) => [
              `${v.s} − ${v.a} = ${v.s! - v.a!}`,
              `${v.s! - v.a!} − ${v.c} = ${v.b}`,
            ],
          },
          c: {
            expr: '{s} − {a} − {b}',
            how: 'Take the other two numbers away from the total.',
            work: (v: Values) => [
              `${v.s} − ${v.a} = ${v.s! - v.a!}`,
              `${v.s! - v.a!} − ${v.b} = ${v.c}`,
            ],
          },
        },
      ]),
    ),
    example: { a: 3, b: 5, c: 2, s: 10 },
    startWith: ['a', 'b', 'c'],
    representation: {
      kind: 'cubeTrains',
      rows: [
        [['a', 'b'], 'c'],
        ['a', ['b', 'c']],
        ['c', 'b', 'a'],
      ],
      total: 's',
    },
  },
  {
    id: 'm.1.equal-sign',
    assumptions: [
      'The equal sign means both sides are the same amount. It does not mean “the answer comes next”.',
      'To find a missing number, make both sides the same: 8 + 2 = 5 + ?',
      'Subtraction works the same way: 8 = 10 − 2 is true, because 10 − 2 is 8.',
    ],
    variables: [
      whole('a', 'a', 'First on left', 0, 10),
      whole('b', 'b', 'Second on left', 0, 10),
      whole('c', 'c', 'First on right', 0, 10),
      whole('d', 'd', 'Second on right', 0, 10),
    ],
    relations: [
      {
        id: 'a + b = c + d',
        display: '{a} + {b} = {c} + {d}',
        vars: ['a', 'b', 'c', 'd'],
        residual: (v) => v.a! + v.b! - v.c! - v.d!,
        solve: {
          a: (v) => v.c! + v.d! - v.b!,
          b: (v) => v.c! + v.d! - v.a!,
          c: (v) => v.a! + v.b! - v.d!,
          d: (v) => v.a! + v.b! - v.c!,
        },
      },
    ],
    steps: {
      'a + b = c + d': {
        d: {
          work: (v) => [
            `Left side: ${v.a} + ${v.b} = ${v.a! + v.b!}`,
            ...addStrategy(v.a!, v.b!),
            v.d! === 0
              ? `${v.c} + 0 = ${v.a! + v.b!}`
              : v.d! <= 5
                ? `${v.c} + ? = ${v.a! + v.b!}: count on ${countList(v.c!, 1, v.d!)} → ${v.d}`
                : `${v.a! + v.b!} − ${v.c} = ${v.d}`,
            ...(v.d! > 5 ? subtractStrategy(v.a! + v.b!, v.c!) : []),
          ],
          expr: '{a} + {b} − {c}',
          how: 'Add the left side. Then count on from the right’s first number to that total.',
        },
        c: {
          work: (v) => [
            `Left side: ${v.a} + ${v.b} = ${v.a! + v.b!}`,
            ...addStrategy(v.a!, v.b!),
            `${v.a! + v.b!} − ${v.d} = ${v.c}`,
            ...subtractStrategy(v.a! + v.b!, v.d!),
          ],
          expr: '{a} + {b} − {d}',
          how: 'Add the left side. Take away the second number on the right.',
        },
        b: {
          work: (v) => [
            `Right side: ${v.c} + ${v.d} = ${v.c! + v.d!}`,
            ...addStrategy(v.c!, v.d!),
            `${v.c! + v.d!} − ${v.a} = ${v.b}`,
            ...subtractStrategy(v.c! + v.d!, v.a!),
          ],
          expr: '{c} + {d} − {a}',
          how: 'Add the right side. Take away the first number on the left.',
        },
        a: {
          work: (v) => [
            `Right side: ${v.c} + ${v.d} = ${v.c! + v.d!}`,
            ...addStrategy(v.c!, v.d!),
            `${v.c! + v.d!} − ${v.b} = ${v.a}`,
            ...subtractStrategy(v.c! + v.d!, v.b!),
          ],
          expr: '{c} + {d} − {b}',
          how: 'Add the right side. Take away the second number on the left.',
        },
      },
    },
    example: { a: 8, b: 2, c: 5, d: 5 },
    startWith: ['a', 'b', 'c'],
    representation: { kind: 'balance', left: ['a', 'b'], right: ['c', 'd'] },
  },
  // ─── Added from the third review (exam coverage) ────────────────────────────

  // True or false with take-away: 7 − 1 = 4 + 2 (1.OA.7).
  (() => {
    const L = (v: Values) => v.a! - v.b!;
    const R = (v: Values) => v.c! + v.d!;
    const leftMore = (v: Values) => L(v) >= R(v);
    const mod: ModuleDef = {
      id: 'm.1.equal-sign~take-away',
      title: 'True or false with take away',
      use: 'Use this for “Is 7 − 1 = 4 + 2 true or false?”',
      assumptions: [
        'A number sentence is true when both sides are the same amount.',
        'Work out each side first: 7 − 1 = 6 and 4 + 2 = 6, so 7 − 1 = 4 + 2 is true.',
        'A side can be one number: 8 = 10 − 2 is true. Type 0 for the empty box.',
      ],
      variables: [
        whole('a', 'a', 'Start on left', 0, 20),
        whole('b', 'b', 'Taken away on left', 0, 10),
        whole('c', 'c', 'First on right', 0, 10),
        whole('d', 'd', 'Second on right', 0, 10),
        whole('D', 'g', 'How far apart the sides are', 0, 20),
      ],
      relations: [
        {
          id: 'D = difference of the sides',
          display: 'Is {a} − {b} = {c} + {d}? The sides are {D} apart.',
          vars: ['D', 'a', 'b', 'c', 'd'],
          // The left side can't be below 0 (no negative numbers before Grade 6).
          residual: (v: Values) => (v.a! < v.b! ? v.b! - v.a! + 1 : v.D! - Math.abs(L(v) - R(v))),
          check: (v: Values) =>
            `${Math.max(L(v), R(v))} − ${Math.min(L(v), R(v))} = ${Math.abs(L(v) - R(v))}`,
          solve: {
            D: (v: Values) => (v.a! < v.b! ? undefined : Math.abs(L(v) - R(v))),
            // Only answers that keep the left side at 0 or more (a − b can't go below 0).
            a: (v: Values) => [R(v) + v.b! + v.D!, R(v) + v.b! - v.D!].filter((x) => x >= v.b!),
            b: (v: Values) =>
              [v.a! - R(v) - v.D!, v.a! - R(v) + v.D!].filter((x) => x >= 0 && x <= v.a!),
            c: (v: Values) => (v.a! < v.b! ? undefined : [L(v) - v.d! + v.D!, L(v) - v.d! - v.D!]),
            d: (v: Values) => (v.a! < v.b! ? undefined : [L(v) - v.c! + v.D!, L(v) - v.c! - v.D!]),
          },
        },
      ],
      steps: {
        'D = difference of the sides': {
          D: {
            expr: (v) => (leftMore(v) ? '({a} − {b}) − ({c} + {d})' : '({c} + {d}) − ({a} − {b})'),
            how: 'Work out each side. Take the smaller side away from the bigger side. 0 means true.',
            work: (v) => [
              `Left: ${v.a} − ${v.b} = ${L(v)}`,
              ...subtractStrategy(v.a!, v.b!),
              `Right: ${v.c} + ${v.d} = ${R(v)}`,
              ...addStrategy(v.c!, v.d!),
              `${Math.max(L(v), R(v))} − ${Math.min(L(v), R(v))} = ${v.D}`,
            ],
            note: (v: Values) =>
              v.D === 0 ? `(true: ${L(v)} = ${R(v)})` : `(false: ${L(v)} ≠ ${R(v)})`,
          },
          a: {
            expr: (v) => (leftMore(v) ? '({c} + {d}) + {D} + {b}' : '({c} + {d}) − {D} + {b}'),
            how: 'Find the left side from the right side and the difference. Then put back what was taken away.',
            work: (v) => [
              `Right: ${v.c} + ${v.d} = ${R(v)}`,
              `Left side: ${L(v)}`,
              `${L(v)} + ${v.b} = ${v.a}`,
            ],
          },
          b: {
            expr: (v) => (leftMore(v) ? '{a} − (({c} + {d}) + {D})' : '{a} − (({c} + {d}) − {D})'),
            how: 'Find the left side from the right side and the difference. Take it away from the start.',
            work: (v) => [
              `Right: ${v.c} + ${v.d} = ${R(v)}`,
              `Left side: ${L(v)}`,
              `${v.a} − ${L(v)} = ${v.b}`,
            ],
          },
          c: {
            expr: (v) => (leftMore(v) ? '({a} − {b}) − {D} − {d}' : '({a} − {b}) + {D} − {d}'),
            how: 'Find the right side from the left side and the difference. Take away the other number.',
            work: (v) => [
              `Left: ${v.a} − ${v.b} = ${L(v)}`,
              `Right side: ${R(v)}`,
              `${R(v)} − ${v.d} = ${v.c}`,
            ],
          },
          d: {
            expr: (v) => (leftMore(v) ? '({a} − {b}) − {D} − {c}' : '({a} − {b}) + {D} − {c}'),
            how: 'Find the right side from the left side and the difference. Take away the other number.',
            work: (v) => [
              `Left: ${v.a} − ${v.b} = ${L(v)}`,
              `Right side: ${R(v)}`,
              `${R(v)} − ${v.c} = ${v.d}`,
            ],
          },
        },
      },
      example: { a: 7, b: 1, c: 4, d: 2, D: 0 },
      startWith: ['a', 'b', 'c', 'd'],
      representation: { kind: 'balance', left: ['a'], takeAway: 'b', right: ['c', 'd'] },
      pictureLabels: ['D'],
    };
    return mod;
  })(),
  {
    id: 'm.1.count-120',
    assumptions: [
      'After 100, keep counting the same way: 101, 102, … 120.',
      'One more is the next number. Ten more is one row down.',
    ],
    variables: [
      whole('n', 'n', 'Number', 1, 110),
      whole('p', 'p', 'One more', 2, 111),
      whole('q', 'q', 'Ten more', 11, 120),
    ],
    relations: [
      {
        id: 'p = n + 1',
        display: '{n} + 1 = {p}',
        vars: ['p', 'n'],
        residual: (v) => v.p! - v.n! - 1,
        solve: { p: (v) => v.n! + 1, n: (v) => v.p! - 1 },
      },
      {
        id: 'q = n + 10',
        display: '{n} + 10 = {q}',
        vars: ['q', 'n'],
        residual: (v) => v.q! - v.n! - 10,
        solve: { q: (v) => v.n! + 10, n: (v) => v.q! - 10 },
      },
    ],
    steps: {
      'p = n + 1': {
        p: { expr: '{n} + 1', how: 'One more: the next number on the chart.' },
        n: { expr: '{p} − 1', how: 'One less: the number just before.' },
      },
      'q = n + 10': {
        q: {
          expr: '{n} + 10',
          how: 'Ten more: the number just below on the chart. The tens digit goes up by 1.',
          work: (v) =>
            v.n! % 100 < 90
              ? [
                  `Tens: ${Math.floor((v.n! % 100) / 10)} → ${Math.floor((v.n! % 100) / 10) + 1}, ones stay ${v.n! % 10}`,
                ]
              : [],
        },
        n: { expr: '{q} − 10', how: 'Ten less: the number just above on the chart.' },
      },
    },
    example: { n: 67, p: 68, q: 77 },
    startWith: ['n'],
    representation: { kind: 'hundredChart', value: 'n', max: 120, marks: ['p', 'q'] },
  },
  // One less and ten less on the 120 chart (1.NBT.1, 1.NBT.5).
  {
    id: 'm.1.count-120~less',
    title: 'One less, ten less',
    use: 'Use this for one less and ten less on the 120 chart.',
    assumptions: [
      'One less is the number just before.',
      'Ten less is one row up on the chart. The ones digit stays the same.',
    ],
    variables: [
      whole('n', 'n', 'Number', 11, 120),
      whole('u', 'u', 'One less', 10, 119),
      whole('v', 'v', 'Ten less', 1, 110),
    ],
    relations: [
      {
        id: 'u = n − 1',
        display: '{n} − 1 = {u}',
        vars: ['u', 'n'],
        residual: (v) => v.u! - v.n! + 1,
        solve: { u: (v) => v.n! - 1, n: (v) => v.u! + 1 },
      },
      {
        id: 'v = n − 10',
        display: '{n} − 10 = {v}',
        vars: ['v', 'n'],
        residual: (v) => v.v! - v.n! + 10,
        solve: { v: (v) => v.n! - 10, n: (v) => v.v! + 10 },
      },
    ],
    steps: {
      'u = n − 1': {
        u: { expr: '{n} − 1', how: 'Say the number just before. It is the box before.' },
        n: { expr: '{u} + 1', how: 'Say the next number. It is the next box.' },
      },
      'v = n − 10': {
        v: {
          expr: '{n} − 10',
          how: 'Go one row up on the chart. The tens digit goes down by 1.',
          work: (v: Values) => [
            `Tens: ${Math.floor(v.n! / 10)} → ${Math.floor(v.v! / 10)}, ones stay ${v.n! % 10}`,
          ],
        },
        n: { expr: '{v} + 10', how: 'Go one row down on the chart.' },
      },
    },
    example: { n: 57, u: 56, v: 47 },
    startWith: ['n'],
    representation: { kind: 'hundredChart', value: 'n', max: 120, marks: ['u', 'v'] },
  },
  {
    id: 'm.1.tens-ones',
    assumptions: [
      'A ten is a group of 10 ones.',
      'The first digit tells the tens. The last digit tells the ones.',
      'Trade 10 ones for 1 ten. Type the tens and the ones to find the number.',
    ],
    variables: [whole('n', 'n', 'Number', 0, 99), ...g1tens.variables],
    relations: g1tens.relations,
    steps: g1tens.steps,
    example: { n: 45, t: 4, o: 5 },
    startWith: ['n'],
    representation: {
      kind: 'baseTen',
      words: 'n',
      groups: ['n'],
      controls: [
        { var: 't', steps: [1] },
        { var: 'o', steps: [1] },
      ],
    },
  },
  // Tens and ones with more than 9 ones: 2 tens 17 ones = 37 (1.NBT.2).
  {
    id: 'm.1.tens-ones~regroup',
    title: 'Trade ones for tens',
    use: 'Use this for “2 tens and 17 ones is ___.”',
    assumptions: [
      '10 ones make 1 ten.',
      'A number can have more than 9 ones: 2 tens and 17 ones is 37.',
      'Trade 10 ones for 1 ten to write the number.',
    ],
    variables: [
      whole('n', 'n', 'Number', 0, 120),
      whole('t', 't', 'Tens', 0, 9),
      whole('o', 'o', 'Ones', 0, 30),
    ],
    relations: [
      {
        id: 'n = t tens + o ones',
        check: (v: Values) => `${10 * v.t!} + ${v.o} = ${v.n}`,
        display: '{n} = {t} tens + {o} ones',
        vars: ['n', 't', 'o'],
        residual: (v) => v.n! - 10 * v.t! - v.o!,
        solve: {
          n: (v) => 10 * v.t! + v.o!,
          t: (v) => (v.n! - v.o!) / 10,
          o: (v) => v.n! - 10 * v.t!,
        },
      },
    ],
    steps: {
      'n = t tens + o ones': {
        n: {
          expr: '{t} tens + {o} ones',
          how: 'Count the tens by 10s. Then count on the ones.',
          work: (v: Values) => [
            `${v.t} tens = ${10 * v.t!}`,
            ...(v.o! >= 10
              ? [`${v.o} ones = ${Math.floor(v.o! / 10)} tens and ${v.o! % 10} ones`]
              : []),
            ...(addStrategy(10 * v.t!, v.o!).length
              ? addStrategy(10 * v.t!, v.o!)
              : [`${10 * v.t!} + ${v.o} = ${v.n}`]),
          ],
        },
        t: {
          expr: 'tens in ({n} − {o})',
          how: 'Take away the ones. The rest are groups of ten.',
          work: (v: Values) => [
            `${v.n} − ${v.o} = ${v.n! - v.o!}`,
            `${v.n! - v.o!} is ${v.t} tens`,
          ],
        },
        o: {
          expr: '{n} − {t} tens',
          how: 'Take away the tens. The ones are left.',
          work: (v: Values) => [`${v.t} tens = ${10 * v.t!}`, `${v.n} − ${10 * v.t!} = ${v.o}`],
        },
      },
    },
    example: { n: 37, t: 2, o: 17 },
    startWith: ['t', 'o'],
    representation: {
      kind: 'baseTen',
      words: 'n',
      groups: ['n'],
      places: { tens: 't', ones: 'o' },
      controls: [
        { var: 't', steps: [1] },
        { var: 'o', steps: [1] },
      ],
    },
  },
  {
    id: 'm.1.add-within-100',
    assumptions: [
      'Add a small number like 7, or tens like 20, to a number like 36.',
      'Add tens with tens and ones with ones.',
      'The total is 100 or less. Two 2-digit numbers, like 36 + 47, are Grade 2.',
    ],
    variables: [
      whole('a', 'a', 'First number', 0, 100),
      // Grade 1 adds a one-digit number or a multiple of ten (1.NBT.4).
      {
        ...whole('b', 'b', 'One-digit number or tens', 0, 90),
        allowed: [...Array.from({ length: 10 }, (_, i) => i), 10, 20, 30, 40, 50, 60, 70, 80, 90],
      },
      whole('c', 'c', 'Total', 0, 100),
    ],
    ...addSub({
      c: 'Add the rods, then the small cubes. Trade 10 small cubes for a rod.',
      a: 'Take the second number away from the total.',
      b: 'Count up to the total: tens first, then ones.',
    }),
    example: { a: 36, b: 7, c: 43 },
    startWith: ['a', 'b'],
    representation: {
      kind: 'baseTen',
      groups: ['a', 'b'],
      total: 'c',
      controls: [
        { var: 'a', steps: [1, 10] },
        { var: 'b', steps: [1, 10] },
      ],
    },
  },
  // Grade 1: subtract tens from tens, 10–90 (1.NBT.6).
  {
    id: 'm.1.add-within-100~subtract-tens',
    title: 'Subtract tens',
    use: 'Use this for 70 − 30 and other tens take away tens.',
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
  {
    id: 'm.1.measure-nonstandard',
    assumptions: [
      'Lay the units end to end, with no gaps and no overlaps.',
      'Use units that are all the same size.',
      'A paper clip is as long as 2 cubes. Bigger units: you need fewer of them.',
    ],
    variables: [
      whole('p', 'p', 'Length in clips', 1, 12),
      { ...whole('c', 'c', 'Length in cubes', 2, 24), multipleOf: 2, step: 2 },
    ],
    relations: [
      {
        id: 'c = p clips of 2 cubes',
        check: (v) => repeated(2, v.p!),
        display: '{p} clips, 2 cubes each: {c} cubes',
        vars: ['c', 'p'],
        residual: (v) => v.c! - 2 * v.p!,
        solve: { c: (v) => 2 * v.p!, p: (v) => v.c! / 2 },
      },
    ],
    steps: {
      'c = p clips of 2 cubes': {
        c: {
          work: (v) => [`Count by 2s: ${countList(0, 2, v.p!)} → ${v.c} cubes`],
          expr: '{p} clips of 2 cubes',
          how: 'Count the cubes by 2s, one clip at a time.',
        },
        p: {
          work: (v) => [`Count by 2s to ${v.c}: ${countList(0, 2, v.p!)} → ${v.p} clips`],
          expr: 'groups of 2 in {c}',
          how: 'Put the cubes in groups of 2, one group for each clip. Count the groups.',
        },
      },
    },
    example: { p: 4, c: 8 },
    startWith: ['p'],
    representation: { kind: 'unitTiles', count: 'p', size: 2, total: 'c' },
  },
  {
    id: 'm.1.data-3-categories',
    assumptions: [
      'Each picture stands for one object.',
      'Each column is one kind of shape (a category).',
      'Add all three columns to get the total.',
    ],
    variables: [
      whole('c', 'c', 'Circles', 0, 10),
      whole('s', 's', 'Squares', 0, 10),
      whole('t', 't', 'Triangles', 0, 10),
      whole('n', 'n', 'Total', 0, 30),
    ],
    relations: [
      {
        id: 'n = c + s + t',
        display: '{c} + {s} + {t} = {n}',
        vars: ['n', 'c', 's', 't'],
        residual: (v) => v.n! - v.c! - v.s! - v.t!,
        solve: {
          n: (v) => v.c! + v.s! + v.t!,
          c: (v) => v.n! - v.s! - v.t!,
          s: (v) => v.n! - v.c! - v.t!,
          t: (v) => v.n! - v.c! - v.s!,
        },
      },
    ],
    steps: {
      'n = c + s + t': {
        n: {
          work: (v) => sumSteps([v.c!, v.s!, v.t!]),
          expr: '{c} + {s} + {t}',
          how: 'Add the three columns.',
        },
        c: {
          work: (v) => missingPart(v.n!, [v.s!, v.t!]),
          expr: '{n} − {s} − {t}',
          how: 'Take the other two shapes away from the total.',
        },
        s: {
          work: (v) => missingPart(v.n!, [v.c!, v.t!]),
          expr: '{n} − {c} − {t}',
          how: 'Take the other two shapes away from the total.',
        },
        t: {
          work: (v) => missingPart(v.n!, [v.c!, v.s!]),
          expr: '{n} − {c} − {s}',
          how: 'Take the other two shapes away from the total.',
        },
      },
    },
    example: { c: 6, s: 3, t: 4, n: 13 },
    startWith: ['c', 's', 't'],
    representation: {
      kind: 'pictureGraph',
      columns: [
        { var: 'c', icon: 'circle' },
        { var: 's', icon: 'square' },
        { var: 't', icon: 'triangle' },
      ],
      max: 10,
      total: 'n',
    },
  },
  // Grade 1: how many more in a picture graph (1.MD.4).
  {
    id: 'm.1.data-3-categories~compare',
    title: 'How many more?',
    use: 'Use this for “how many more?” in a picture graph.',
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
  // Tally charts: count marks in groups of 5 (1.MD.4).
  {
    id: 'm.1.data-3-categories~tally',
    title: 'Tally chart',
    use: 'Use this to read and add up a tally chart.',
    assumptions: [
      'Each mark stands for one vote.',
      'The fifth mark crosses the other four, so you can count by 5s.',
      'Add every row to get the total.',
    ],
    variables: [
      whole('a', 'a', 'Apples', 0, 10),
      whole('b', 'b', 'Bananas', 0, 10),
      whole('g', 'g', 'Grapes', 0, 10),
      whole('n', 'n', 'Total', 0, 30),
    ],
    relations: [
      {
        id: 'n = a + b + g',
        display: '{n} = {a} + {b} + {g}',
        vars: ['n', 'a', 'b', 'g'],
        residual: (v) => v.n! - v.a! - v.b! - v.g!,
        solve: {
          n: (v) => v.a! + v.b! + v.g!,
          a: (v) => v.n! - v.b! - v.g!,
          b: (v) => v.n! - v.a! - v.g!,
          g: (v) => v.n! - v.a! - v.b!,
        },
      },
    ],
    steps: {
      'n = a + b + g': {
        n: {
          expr: '{a} + {b} + {g}',
          how: 'Count the marks in each row. Add the rows.',
          work: (v: Values) => addAll([v.a!, v.b!, v.g!]),
        },
        a: {
          expr: '{n} − {b} − {g}',
          how: 'Add the other rows. Take them away from the total.',
          work: (v: Values) => [...addAll([v.b!, v.g!]), `${v.n} − ${v.b! + v.g!} = ${v.a}`],
        },
        b: {
          expr: '{n} − {a} − {g}',
          how: 'Add the other rows. Take them away from the total.',
          work: (v: Values) => [...addAll([v.a!, v.g!]), `${v.n} − ${v.a! + v.g!} = ${v.b}`],
        },
        g: {
          expr: '{n} − {a} − {b}',
          how: 'Add the other rows. Take them away from the total.',
          work: (v: Values) => [...addAll([v.a!, v.b!]), `${v.n} − ${v.a! + v.b!} = ${v.g}`],
        },
      },
    },
    example: { a: 7, b: 4, g: 6, n: 17 },
    startWith: ['a', 'b', 'g'],
    representation: { kind: 'tally', rows: ['a', 'b', 'g'], total: 'n' },
  },
  {
    id: 'm.1.halves-fourths',
    pictureLabels: ['u'],
    assumptions: [
      'The parts must be equal: the same size.',
      '2 equal parts are halves. 4 equal parts are fourths (quarters).',
      'More parts means smaller parts. A fourth is smaller than a half.',
    ],
    variables: [
      { ...whole('p', 'p', 'Equal parts (2 or 4)', 2, 4), allowed: [2, 4], step: 2 },
      whole('k', 'k', 'Shaded parts', 0, 4),
      whole('u', 'u', 'Not shaded', 0, 4),
    ],
    relations: [
      {
        id: 'u = p − k',
        display: '{k} of {p} equal parts shaded, {u} not shaded',
        vars: ['u', 'p', 'k'],
        residual: (v) => v.u! - (v.p! - v.k!),
        solve: { u: (v) => v.p! - v.k!, p: (v) => v.k! + v.u!, k: (v) => v.p! - v.u! },
      },
    ],
    steps: {
      'u = p − k': {
        u: {
          expr: '{p} − {k}',
          how: 'Take the shaded parts away from all the parts.',
          note: (v) => fractionNote(v.k!, v.p!),
        },
        p: { expr: '{k} + {u}', how: 'Add the shaded and not shaded parts.' },
        k: {
          expr: '{p} − {u}',
          how: 'Take the not shaded parts away from all the parts.',
          note: (v) => fractionNote(v.k!, v.p!),
        },
      },
    },
    example: { p: 4, k: 1, u: 3 },
    startWith: ['p', 'k'],
    representation: { kind: 'partition', parts: 'p', shaded: 'k', shape: 'circle', step: 2 },
  },
  compareNumbers(
    'm.1.tens-ones',
    99,
    [1, 10],
    [45, 54],
    'Use this to compare two numbers with >, < or =.',
  ),
  // Flat or solid: faces of spheres, cones, cylinders and cubes (K.G.3, K.G.4).
  {
    id: 'm.1.shape-attributes',
    assumptions: [
      'Sides and corners decide a shape’s name. A triangle has 3 of each.',
      'Color, size and which way it is turned don’t change the name.',
      'A shape must be closed: its sides join up with no gaps.',
    ],
    variables: [whole('s', 's', 'Sides', 3, 8), whole('v', 'c', 'Corners', 3, 8)],
    relations: [
      {
        id: 'corners = sides',
        display: '{s} sides and {v} corners',
        vars: ['v', 's'],
        residual: (x) => x.v! - x.s!,
        solve: { v: (x) => x.s!, s: (x) => x.v! },
      },
    ],
    steps: {
      'corners = sides': {
        v: {
          expr: '{s}',
          how: 'Each side ends at a corner. Count the corners: there is one for each side.',
        },
        s: {
          expr: '{v}',
          how: 'There is one side between two corners. Count the sides: one for each corner.',
        },
      },
    },
    example: { s: 5, v: 5 },
    startWith: ['s'],
    representation: { kind: 'polygon', sides: 's', corners: 'v', irregular: 'toggle' },
  },
];

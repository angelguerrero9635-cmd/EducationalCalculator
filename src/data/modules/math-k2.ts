/**
 * Section 1: Math, Kindergarten – Grade 2 (Common Core). Keyed by taxonomy skill id.
 * Written and reviewed against docs/MODULE_GUIDE.md. Two K modules (m.K.add-sub-10,
 * m.K.classify-count) are pilots in k12.ts.
 */
import type { VariableDef } from '@/engine/types';

import type { ModuleDef, StepText } from './types';

const div = (a: number, b: number) => (b === 0 ? undefined : a / b);

/** A whole-number variable (counts, digits…). */
const whole = (
  id: string,
  symbol: string,
  name: string,
  min: number,
  max: number,
): VariableDef => ({
  id,
  symbol,
  name,
  min,
  max,
  step: 1,
  integer: true,
});

/** a + b = c and c − b = a, with Grade-level step text. */
function addSub(how: { c: string; a: string; b: string }) {
  const relations = [
    {
      id: 'a + b = c',
      display: '{a} + {b} = {c}',
      vars: ['a', 'b', 'c'],
      residual: (v: Record<string, number>) => v.a! + v.b! - v.c!,
      solve: {
        c: (v: Record<string, number>) => v.a! + v.b!,
        a: (v: Record<string, number>) => v.c! - v.b!,
        b: (v: Record<string, number>) => v.c! - v.a!,
      },
    },
    {
      id: 'c − b = a',
      display: '{c} − {b} = {a}',
      vars: ['a', 'b', 'c'],
      residual: (v: Record<string, number>) => v.c! - v.b! - v.a!,
      solve: {
        a: (v: Record<string, number>) => v.c! - v.b!,
        c: (v: Record<string, number>) => v.a! + v.b!,
        b: (v: Record<string, number>) => v.c! - v.a!,
      },
    },
  ];
  const steps: Record<string, Record<string, StepText>> = {
    'a + b = c': {
      c: { expr: '{a} + {b}', how: how.c },
      a: { expr: '{c} − {b}', how: how.a },
      b: { expr: '{c} − {a}', how: how.b },
    },
    'c − b = a': {
      a: { expr: '{c} − {b}', how: how.a },
      c: { expr: '{a} + {b}', how: 'Put back what was taken away: add.' },
      b: { expr: '{c} − {a}', how: how.b },
    },
  };
  return { relations, steps };
}

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
        display: '{t} = full tens in {n}',
        vars: ['t', 'n'],
        residual: (v: Record<string, number>) => v.t! - Math.floor(v.n! / 10),
        // The tens alone don't say which number: n stays unknown (no numeric guess).
        solve: { t: (v: Record<string, number>) => Math.floor(v.n! / 10), n: () => undefined },
      },
      {
        id: 'o = ones left in n',
        display: '{o} = ones left in {n}',
        vars: ['o', 'n'],
        residual: (v: Record<string, number>) => v.o! - (v.n! % 10),
        solve: { o: (v: Record<string, number>) => v.n! % 10, n: () => undefined },
      },
    ],
    steps: {
      'n = t tens + o ones': {
        n: {
          expr: '{t} tens + {o} ones',
          how: 'Count the tens by tens (10, 20, 30, …), then count on the ones.',
        },
        t: {
          expr: '({n} − {o}) ÷ 10',
          how: 'Take away the extra ones; the rest is groups of ten.',
        },
        o: { expr: '{n} − {t} tens', how: 'Take away the full tens; what is left are the ones.' },
      },
      't = tens in n': {
        t: {
          expr: 'full tens in {n}',
          how: 'Count how many full tens there are (full rows of the chart).',
        },
      },
      'o = ones left in n': {
        o: { expr: 'ones left in {n}', how: 'Count what is left after the full tens.' },
      },
    } as Record<string, Record<string, StepText>>,
    variables: [whole('t', 't', 'Tens', 0, maxTens), whole('o', 'o', 'Ones', 0, 9)],
  };
}

const k100 = tensOnes(10);
const g1count = tensOnes(12);
const g1tens = tensOnes(9);

export const MATH_K2_MODULES: ModuleDef[] = [
  // ─── Kindergarten ──────────────────────────────────────────────────────────
  {
    id: 'm.K.count-100',
    assumptions: [
      'Counting by ones adds 1 each time. Counting by tens adds 10: 10, 20, 30, … 100.',
      'Each row of the chart is one ten.',
      '37 means 3 tens and 7 ones.',
    ],
    variables: [whole('n', 'n', 'Number', 0, 100), ...k100.variables],
    relations: k100.relations,
    steps: k100.steps,
    example: { n: 37, t: 3, o: 7 },
    startWith: ['n'],
    representation: { kind: 'hundredChart', value: 'n', max: 100 },
  },

  {
    id: 'm.K.count-objects',
    assumptions: [
      'Touch and count each object once.',
      'The last number you say tells how many.',
      'Each next number is one more.',
    ],
    variables: [whole('n', 'n', 'Objects', 0, 19), whole('m', 'm', 'One more', 1, 20)],
    relations: [
      {
        id: 'm = n + 1',
        display: '{m} = {n} + 1',
        vars: ['m', 'n'],
        residual: (v) => v.m! - v.n! - 1,
        solve: { m: (v) => v.n! + 1, n: (v) => v.m! - 1 },
      },
    ],
    steps: {
      'm = n + 1': {
        m: { expr: '{n} + 1', how: 'Add one more object: say the next number.' },
        n: { expr: '{m} − 1', how: 'One less: say the number just before.' },
      },
    },
    example: { n: 7, m: 8 },
    startWith: ['n'],
    representation: { kind: 'tenFrame', first: 'n', second: 1, total: 'm', frames: 2 },
  },

  {
    id: 'm.K.compare-10',
    assumptions: [
      'Line up the two groups one-to-one.',
      'The group with objects left over has more.',
      'If none are left over, the groups are equal.',
    ],
    variables: [
      whole('a', 'a', 'First group', 0, 10),
      whole('b', 'b', 'Second group', 0, 10),
      whole('d', 'd', 'How many more', -10, 10),
    ],
    relations: [
      {
        id: 'd = a − b',
        display: '{d} = {a} − {b}',
        vars: ['d', 'a', 'b'],
        residual: (v) => v.d! - (v.a! - v.b!),
        solve: { d: (v) => v.a! - v.b!, a: (v) => v.d! + v.b!, b: (v) => v.a! - v.d! },
      },
    ],
    steps: {
      'd = a − b': {
        d: {
          expr: '{a} − {b}',
          how: 'Match each object in the second group with one in the first. Count the ones left over.',
        },
        a: { expr: '{b} + {d}', how: 'The first group is the second group plus the extras.' },
        b: { expr: '{a} − {d}', how: 'Take the extras away from the first group.' },
      },
    },
    example: { a: 7, b: 4, d: 3 },
    startWith: ['a', 'b'],
    representation: {
      kind: 'compareRows',
      a: 'a',
      b: 'b',
      difference: 'd',
      icon: 'dot',
      words: ['more', 'fewer'],
    },
  },

  {
    id: 'm.K.make-10',
    assumptions: ['A ten-frame has 10 boxes.', 'Counters plus empty boxes always make 10.'],
    variables: [whole('a', 'a', 'Counters', 0, 10), whole('b', 'b', 'More to make 10', 0, 10)],
    relations: [
      {
        id: 'a + b = 10',
        display: '{a} + {b} = 10',
        vars: ['a', 'b'],
        residual: (v) => v.a! + v.b! - 10,
        solve: { a: (v) => 10 - v.b!, b: (v) => 10 - v.a! },
      },
    ],
    steps: {
      'a + b = 10': {
        b: { expr: '10 − {a}', how: 'Count the empty boxes in the ten-frame.' },
        a: { expr: '10 − {b}', how: 'Count the boxes that have counters.' },
      },
    },
    example: { a: 6, b: 4 },
    startWith: ['a'],
    representation: { kind: 'tenFrame', first: 'a', second: 'b', total: 10 },
  },

  {
    id: 'm.K.teens-place-value',
    assumptions: [
      'A ten is 10 ones grouped together.',
      'The numbers 11 to 19 are one ten and some more ones.',
      '10 is 1 ten and 0 ones.',
    ],
    variables: [whole('n', 'n', 'Teen number', 10, 19), whole('o', 'o', 'Extra ones', 0, 9)],
    relations: [
      {
        id: 'n = 10 + o',
        display: '{n} = 10 + {o}',
        vars: ['n', 'o'],
        residual: (v) => v.n! - 10 - v.o!,
        solve: { n: (v) => 10 + v.o!, o: (v) => v.n! - 10 },
      },
    ],
    steps: {
      'n = 10 + o': {
        n: { expr: '10 + {o}', how: 'Start at 10 and count on the extra ones.' },
        o: { expr: '{n} − 10', how: 'Take away the ten. The rest are the extra ones.' },
      },
    },
    example: { n: 14, o: 4 },
    startWith: ['n'],
    representation: { kind: 'baseTen', groups: ['n'], controls: [{ var: 'n', steps: [1] }] },
  },

  {
    id: 'm.K.measurable-attributes',
    assumptions: [
      'Line up both ends at the same starting place.',
      'The one that sticks out farther is longer. Count the extra cubes to see how much.',
      'Heavier and lighter are compared the same way, on a balance.',
    ],
    variables: [
      { ...whole('a', 'a', 'Pencil A', 0, 12), unit: 'cubes' },
      { ...whole('b', 'b', 'Pencil B', 0, 12), unit: 'cubes' },
      { ...whole('d', 'd', 'How much longer', -12, 12), unit: 'cubes' },
    ],
    relations: [
      {
        id: 'd = a − b',
        display: '{d} = {a} − {b}',
        vars: ['d', 'a', 'b'],
        residual: (v) => v.d! - (v.a! - v.b!),
        solve: { d: (v) => v.a! - v.b!, a: (v) => v.d! + v.b!, b: (v) => v.a! - v.d! },
      },
    ],
    steps: {
      'd = a − b': {
        d: {
          expr: '{a} − {b}',
          how: 'Line the pencils up. Count the cubes that stick out past pencil B.',
        },
        a: { expr: '{b} + {d}', how: 'Pencil A is pencil B plus the extra cubes.' },
        b: { expr: '{a} − {d}', how: 'Take the extra cubes away from pencil A.' },
      },
    },
    example: { a: 9, b: 6, d: 3 },
    startWith: ['a', 'b'],
    representation: {
      kind: 'compareRows',
      a: 'a',
      b: 'b',
      difference: 'd',
      icon: 'cube',
      words: ['longer', 'shorter'],
    },
  },

  {
    id: 'm.K.shapes-2d-3d',
    assumptions: [
      'Flat (2D) shapes like triangles and squares have straight sides and corners.',
      'Solid (3D) shapes like cubes, cones, cylinders and spheres are not flat.',
      'A shape keeps its name when it is turned or made bigger.',
    ],
    variables: [whole('s', 's', 'Sides', 3, 8), whole('v', 'v', 'Corners', 3, 8)],
    relations: [
      {
        id: 'corners = sides',
        display: '{v} corners = {s} sides',
        vars: ['v', 's'],
        residual: (x) => x.v! - x.s!,
        solve: { v: (x) => x.s!, s: (x) => x.v! },
      },
    ],
    steps: {
      'corners = sides': {
        v: {
          expr: '{s}',
          how: 'Every side ends at a corner where it meets the next side, so there are as many corners as sides.',
        },
        s: {
          expr: '{v}',
          how: 'Between each corner and the next is one side, so there are as many sides as corners.',
        },
      },
    },
    example: { s: 4, v: 4 },
    startWith: ['s'],
    representation: { kind: 'polygon', sides: 's' },
  },

  // ─── Grade 1 ───────────────────────────────────────────────────────────────
  {
    id: 'm.1.add-sub-20',
    assumptions: [
      'Whole numbers up to 20.',
      'Make a ten: 8 + 5 = 8 + 2 + 3 = 10 + 3.',
      'Subtraction undoes addition: if 8 + 5 = 13, then 13 − 5 = 8.',
    ],
    variables: [
      whole('a', 'a', 'First number', 0, 20),
      whole('b', 'b', 'Second number', 0, 20),
      whole('c', 'c', 'Total', 0, 20),
    ],
    ...addSub({
      c: 'Add. Tip: fill the first ten-frame to make 10, then add what is left.',
      a: 'Take the second number away from the total.',
      b: 'Count on from the first number up to the total.',
    }),
    example: { a: 8, b: 5, c: 13 },
    startWith: ['a', 'b'],
    representation: { kind: 'tenFrame', first: 'a', second: 'b', total: 'c', frames: 2 },
  },

  {
    id: 'm.1.addition-properties',
    assumptions: [
      'Changing the order doesn’t change the sum: 3 + 5 = 5 + 3.',
      'Changing the grouping doesn’t change the sum: (3 + 5) + 2 = 3 + (5 + 2).',
      'So add in the easiest order, like making a ten first.',
    ],
    variables: [
      whole('a', 'a', 'First number', 0, 10),
      whole('b', 'b', 'Second number', 0, 10),
      whole('c', 'c', 'Third number', 0, 10),
      whole('s', 's', 'Sum', 0, 30),
    ],
    relations: (
      [
        ['(a + b) + c = s', '({a} + {b}) + {c} = {s}'],
        ['a + (b + c) = s', '{a} + ({b} + {c}) = {s}'],
        ['c + b + a = s', '{c} + {b} + {a} = {s}'],
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
        ['(a + b) + c = s', '({a} + {b}) + {c}', 'Add the first two, then add the third.'],
        [
          'a + (b + c) = s',
          '{a} + ({b} + {c})',
          'Add the last two first, then add the first. The sum is the same.',
        ],
        ['c + b + a = s', '{c} + {b} + {a}', 'Add in the opposite order. The sum is the same.'],
      ].map(([id, expr, how]) => [
        id!,
        {
          s: { expr: expr!, how: how! },
          a: { expr: '{s} − {b} − {c}', how: 'Take the other two numbers away from the sum.' },
          b: { expr: '{s} − {a} − {c}', how: 'Take the other two numbers away from the sum.' },
          c: { expr: '{s} − {a} − {b}', how: 'Take the other two numbers away from the sum.' },
        },
      ]),
    ),
    example: { a: 3, b: 5, c: 2, s: 10 },
    startWith: ['a', 'b', 'c'],
    representation: {
      kind: 'cubeTrains',
      rows: [
        ['a', 'b', 'c'],
        ['c', 'b', 'a'],
      ],
      total: 's',
    },
  },

  {
    id: 'm.1.equal-sign',
    assumptions: [
      'The equal sign means both sides are the same amount, not “the answer comes next”.',
      'To find a missing number, make both sides the same: 8 + 2 = 5 + ?',
    ],
    variables: [
      whole('a', 'a', 'Left first', 0, 10),
      whole('b', 'b', 'Left second', 0, 10),
      whole('c', 'c', 'Right first', 0, 10),
      whole('d', 'd', 'Right second', 0, 10),
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
          expr: '{a} + {b} − {c}',
          how: 'Find the left side’s total, then count on from c up to it.',
        },
        c: {
          expr: '{a} + {b} − {d}',
          how: 'Find the left side’s total, then take d away from it.',
        },
        b: {
          expr: '{c} + {d} − {a}',
          how: 'Find the right side’s total, then take a away from it.',
        },
        a: {
          expr: '{c} + {d} − {b}',
          how: 'Find the right side’s total, then take b away from it.',
        },
      },
    },
    example: { a: 8, b: 2, c: 5, d: 5 },
    startWith: ['a', 'b', 'c'],
    representation: { kind: 'balance', left: ['a', 'b'], right: ['c', 'd'] },
  },

  {
    id: 'm.1.count-120',
    assumptions: [
      'After 100 the same pattern continues: 101, 102, … 110, 111, … 120.',
      'One more changes the ones; ten more changes the tens.',
      'Each row of the chart is one ten.',
    ],
    variables: [
      whole('n', 'n', 'Number', 0, 120),
      ...g1count.variables,
      whole('p', 'p', 'One more', 1, 121),
      whole('q', 'q', 'Ten more', 10, 130),
    ],
    relations: [
      ...g1count.relations,
      {
        id: 'p = n + 1',
        display: '{p} = {n} + 1',
        vars: ['p', 'n'],
        residual: (v) => v.p! - v.n! - 1,
        solve: { p: (v) => v.n! + 1, n: (v) => v.p! - 1 },
      },
      {
        id: 'q = n + 10',
        display: '{q} = {n} + 10',
        vars: ['q', 'n'],
        residual: (v) => v.q! - v.n! - 10,
        solve: { q: (v) => v.n! + 10, n: (v) => v.q! - 10 },
      },
    ],
    steps: {
      ...g1count.steps,
      'p = n + 1': {
        p: { expr: '{n} + 1', how: 'One more: the next number on the chart.' },
        n: { expr: '{p} − 1', how: 'One less: the number just before.' },
      },
      'q = n + 10': {
        q: {
          expr: '{n} + 10',
          how: 'Ten more: the number just below on the chart (the tens digit goes up by 1).',
        },
        n: { expr: '{q} − 10', how: 'Ten less: the number just above on the chart.' },
      },
    },
    example: { n: 67, t: 6, o: 7, p: 68, q: 77 },
    startWith: ['n'],
    representation: { kind: 'hundredChart', value: 'n', max: 120, marks: ['p', 'q'] },
  },

  {
    id: 'm.1.tens-ones',
    assumptions: [
      'A ten is a group of 10 ones.',
      'In a two-digit number, the left digit is tens and the right digit is ones.',
      '10 ones can be traded for 1 ten.',
    ],
    variables: [whole('n', 'n', 'Number', 0, 99), ...g1tens.variables],
    relations: g1tens.relations,
    steps: g1tens.steps,
    example: { n: 45, t: 4, o: 5 },
    startWith: ['n'],
    representation: {
      kind: 'baseTen',
      groups: ['n'],
      controls: [
        { var: 't', steps: [1] },
        { var: 'o', steps: [1] },
      ],
    },
  },

  {
    id: 'm.1.add-within-100',
    assumptions: [
      'Add tens with tens and ones with ones.',
      'If there are 10 or more ones, trade 10 ones for a new ten.',
      'The total is at most 100.',
    ],
    variables: [
      whole('a', 'a', 'First number', 0, 100),
      whole('b', 'b', 'Second number', 0, 100),
      whole('c', 'c', 'Total', 0, 100),
    ],
    ...addSub({
      c: 'Add the tens, then the ones. If the ones make 10 or more, trade 10 ones for a ten.',
      a: 'Take the second number away from the total.',
      b: 'Count up from the first number to the total: tens first, then ones.',
    }),
    example: { a: 36, b: 27, c: 63 },
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

  {
    id: 'm.1.measure-nonstandard',
    assumptions: [
      'Lay the units end to end, with no gaps and no overlaps.',
      'Use units that are all the same size.',
      'Bigger units: you need fewer of them to measure the same object.',
    ],
    variables: [
      whole('p', 'p', 'Paper clips', 0, 12),
      whole('r', 'r', 'Cubes per clip', 1, 4),
      whole('c', 'c', 'Cubes', 0, 48),
    ],
    relations: [
      {
        id: 'c = p clips of r cubes',
        display: '{c} cubes = {p} clips of {r} cubes',
        vars: ['c', 'p', 'r'],
        residual: (v) => v.c! - v.p! * v.r!,
        solve: { c: (v) => v.p! * v.r!, p: (v) => div(v.c!, v.r!), r: (v) => div(v.c!, v.p!) },
      },
    ],
    steps: {
      'c = p clips of r cubes': {
        c: {
          expr: '{p} clips of {r} cubes',
          how: 'Count the cubes under the clips: r cubes for each clip.',
        },
        p: {
          expr: '{c} ÷ {r}',
          how: 'Put the cubes in groups the length of one clip. Count the groups.',
        },
        r: { expr: '{c} ÷ {p}', how: 'Share the cubes equally, one group under each clip.' },
      },
    },
    example: { p: 4, r: 2, c: 8 },
    startWith: ['p', 'r'],
    representation: { kind: 'unitTiles', count: 'p', size: 'r', total: 'c' },
  },

  {
    id: 'm.1.time-half-hour',
    assumptions: [
      'The short hand shows the hour. The long hand shows the minutes.',
      'At “o’clock” the long hand points to 12. At “half past” it points to 6.',
      'An hour is 60 minutes, so half an hour is 30 minutes.',
    ],
    variables: [
      whole('h', 'h', 'Hour', 1, 12),
      { ...whole('m', 'm', 'Minutes past', 0, 30), step: 30 },
      { ...whole('u', 'u', 'Minutes to next hour', 30, 60), step: 30 },
    ],
    relations: [
      {
        id: 'u = 60 − m',
        display: '{u} = 60 − {m}',
        vars: ['u', 'm'],
        residual: (v) => v.u! - (60 - v.m!),
        solve: { u: (v) => 60 - v.m!, m: (v) => 60 - v.u! },
      },
    ],
    steps: {
      'u = 60 − m': {
        u: {
          expr: '60 − {m}',
          how: 'An hour is 60 minutes. Take away the minutes that have passed.',
        },
        m: { expr: '60 − {u}', how: 'An hour is 60 minutes. Take away the minutes still to go.' },
      },
    },
    example: { h: 3, m: 30, u: 30 },
    startWith: ['h', 'm'],
    representation: { kind: 'clock', hour: 'h', minute: 'm', minuteStep: 30 },
  },

  {
    id: 'm.1.data-3-categories',
    assumptions: [
      'Each picture stands for one object.',
      'Subtract to compare: how many more or fewer.',
      'Add every category to get the total.',
    ],
    variables: [
      whole('c', 'c', 'Circles', 0, 10),
      whole('s', 's', 'Squares', 0, 10),
      whole('t', 't', 'Triangles', 0, 10),
      whole('n', 'n', 'Total', 0, 30),
      whole('d', 'd', 'More circles than squares', -10, 10),
    ],
    relations: [
      {
        id: 'n = c + s + t',
        display: '{n} = {c} + {s} + {t}',
        vars: ['n', 'c', 's', 't'],
        residual: (v) => v.n! - v.c! - v.s! - v.t!,
        solve: {
          n: (v) => v.c! + v.s! + v.t!,
          c: (v) => v.n! - v.s! - v.t!,
          s: (v) => v.n! - v.c! - v.t!,
          t: (v) => v.n! - v.c! - v.s!,
        },
      },
      {
        id: 'd = c − s',
        display: '{d} = {c} − {s}',
        vars: ['d', 'c', 's'],
        residual: (v) => v.d! - (v.c! - v.s!),
        solve: { d: (v) => v.c! - v.s!, c: (v) => v.d! + v.s!, s: (v) => v.c! - v.d! },
      },
    ],
    steps: {
      'n = c + s + t': {
        n: { expr: '{c} + {s} + {t}', how: 'Add the three categories.' },
        c: { expr: '{n} − {s} − {t}', how: 'Take the other categories away from the total.' },
        s: { expr: '{n} − {c} − {t}', how: 'Take the other categories away from the total.' },
        t: { expr: '{n} − {c} − {s}', how: 'Take the other categories away from the total.' },
      },
      'd = c − s': {
        d: { expr: '{c} − {s}', how: 'Line up the circles and squares. Count the extra circles.' },
        c: { expr: '{s} + {d}', how: 'Circles are the squares plus the extras.' },
        s: { expr: '{c} − {d}', how: 'Take the extras away from the circles.' },
      },
    },
    example: { c: 6, s: 3, t: 4, n: 13, d: 3 },
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

  {
    id: 'm.1.halves-fourths',
    assumptions: [
      'The parts must be equal: the same size.',
      '2 equal parts are halves. 4 equal parts are fourths (quarters).',
      'More equal parts means each part is smaller.',
    ],
    variables: [
      whole('p', 'p', 'Equal parts', 1, 4),
      whole('k', 'k', 'Shaded parts', 0, 4),
      whole('u', 'u', 'Not shaded', 0, 4),
    ],
    relations: [
      {
        id: 'u = p − k',
        display: '{u} = {p} − {k}',
        vars: ['u', 'p', 'k'],
        residual: (v) => v.u! - (v.p! - v.k!),
        solve: { u: (v) => v.p! - v.k!, p: (v) => v.k! + v.u!, k: (v) => v.p! - v.u! },
      },
    ],
    steps: {
      'u = p − k': {
        u: { expr: '{p} − {k}', how: 'Take the shaded parts away from all the parts.' },
        p: { expr: '{k} + {u}', how: 'Add the shaded and unshaded parts.' },
        k: { expr: '{p} − {u}', how: 'Take the unshaded parts away from all the parts.' },
      },
    },
    example: { p: 4, k: 1, u: 3 },
    startWith: ['p', 'k'],
    representation: { kind: 'partition', parts: 'p', shaded: 'k', shape: 'circle' },
  },

  // ─── Grade 2 ───────────────────────────────────────────────────────────────
  {
    id: 'm.2.add-sub-100-fluency',
    assumptions: [
      'Whole numbers up to 100.',
      'Jump by tens, then by ones: 38 + 25 = 38 + 20 + 5.',
      'Subtraction undoes addition.',
    ],
    variables: [
      whole('a', 'a', 'First number', 0, 100),
      whole('b', 'b', 'Second number', 0, 100),
      whole('c', 'c', 'Total', 0, 100),
    ],
    ...addSub({
      c: 'On the number line, jump by tens, then by ones.',
      a: 'Take the second number away from the total.',
      b: 'Count up from the first number to the total: jump by tens, then ones.',
    }),
    example: { a: 38, b: 25, c: 63 },
    startWith: ['a', 'b'],
    representation: {
      kind: 'numberLine',
      start: 'a',
      jump: 'b',
      end: 'c',
      min: 0,
      max: 100,
      tick: 10,
    },
  },

  {
    id: 'm.2.place-value-1000',
    assumptions: [
      '10 ones make 1 ten; 10 tens make 1 hundred.',
      'A digit’s place tells its value: in 347, the 3 means 300.',
      'A 0 holds an empty place: 305 has no tens.',
    ],
    variables: [
      whole('n', 'n', 'Number', 0, 999),
      whole('h', 'h', 'Hundreds', 0, 9),
      whole('t', 't', 'Tens', 0, 9),
      whole('o', 'o', 'Ones', 0, 9),
    ],
    relations: [
      {
        id: 'n = h hundreds + t tens + o ones',
        display: '{n} = {h} hundreds + {t} tens + {o} ones',
        vars: ['n', 'h', 't', 'o'],
        residual: (v) => v.n! - 100 * v.h! - 10 * v.t! - v.o!,
        solve: {
          n: (v) => 100 * v.h! + 10 * v.t! + v.o!,
          h: (v) => (v.n! - 10 * v.t! - v.o!) / 100,
          t: (v) => (v.n! - 100 * v.h! - v.o!) / 10,
          o: (v) => v.n! - 100 * v.h! - 10 * v.t!,
        },
      },
      {
        id: 'h = hundreds digit',
        display: '{h} = hundreds digit of {n}',
        vars: ['h', 'n'],
        residual: (v) => v.h! - Math.floor(v.n! / 100),
        solve: { h: (v) => Math.floor(v.n! / 100), n: () => undefined },
      },
      {
        id: 't = tens digit',
        display: '{t} = tens digit of {n}',
        vars: ['t', 'n'],
        residual: (v) => v.t! - (Math.floor(v.n! / 10) % 10),
        solve: { t: (v) => Math.floor(v.n! / 10) % 10, n: () => undefined },
      },
      {
        id: 'o = ones digit',
        display: '{o} = ones digit of {n}',
        vars: ['o', 'n'],
        residual: (v) => v.o! - (v.n! % 10),
        solve: { o: (v) => v.n! % 10, n: () => undefined },
      },
    ],
    steps: {
      'n = h hundreds + t tens + o ones': {
        n: {
          expr: '{h} hundreds + {t} tens + {o} ones',
          how: 'Count by hundreds, then by tens, then by ones.',
        },
        h: {
          expr: '({n} − {t} tens − {o} ones) ÷ 100',
          how: 'Take away the tens and ones; count the hundreds left.',
        },
        t: {
          expr: '({n} − {h} hundreds − {o} ones) ÷ 10',
          how: 'Take away the hundreds and ones; count the tens left.',
        },
        o: {
          expr: '{n} − {h} hundreds − {t} tens',
          how: 'Take away the hundreds and tens; the rest are ones.',
        },
      },
      'h = hundreds digit': {
        h: { expr: 'hundreds digit of {n}', how: 'Read the left digit of the three-digit number.' },
      },
      't = tens digit': { t: { expr: 'tens digit of {n}', how: 'Read the middle digit.' } },
      'o = ones digit': { o: { expr: 'ones digit of {n}', how: 'Read the right digit.' } },
    },
    example: { n: 347, h: 3, t: 4, o: 7 },
    startWith: ['n'],
    representation: {
      kind: 'baseTen',
      groups: ['n'],
      controls: [
        { var: 'h', steps: [1] },
        { var: 't', steps: [1] },
        { var: 'o', steps: [1] },
      ],
    },
  },

  {
    id: 'm.2.add-sub-1000',
    assumptions: [
      'Add hundreds, tens and ones separately.',
      'Trade 10 ones for a ten, and 10 tens for a hundred, when needed.',
      'Subtraction undoes addition.',
    ],
    variables: [
      whole('a', 'a', 'First number', 0, 1000),
      whole('b', 'b', 'Second number', 0, 1000),
      whole('c', 'c', 'Total', 0, 1000),
    ],
    ...addSub({
      c: 'Add hundreds, tens and ones. Trade 10 of a place for 1 of the next place when you can.',
      a: 'Take the second number away from the total.',
      b: 'Count up from the first number to the total by hundreds, tens and ones.',
    }),
    example: { a: 256, b: 178, c: 434 },
    startWith: ['a', 'b'],
    representation: {
      kind: 'baseTen',
      groups: ['a', 'b'],
      total: 'c',
      controls: [
        { var: 'a', steps: [1, 10, 100] },
        { var: 'b', steps: [1, 10, 100] },
      ],
    },
  },

  {
    id: 'm.2.skip-count',
    assumptions: [
      'Skip counting adds the same number each time, starting from 0.',
      'By 5s: 5, 10, 15, …   By 10s: 10, 20, 30, …   By 100s: 100, 200, 300, …',
    ],
    variables: [
      whole('s', 's', 'Count by', 1, 100),
      whole('k', 'k', 'Number of skips', 0, 20),
      whole('n', 'n', 'Number reached', 0, 2000),
    ],
    relations: [
      {
        id: 'n = k skips of s',
        display: '{n} = {k} skips of {s}',
        vars: ['n', 'k', 's'],
        residual: (v) => v.n! - v.k! * v.s!,
        solve: { n: (v) => v.k! * v.s!, k: (v) => div(v.n!, v.s!), s: (v) => div(v.n!, v.k!) },
      },
    ],
    steps: {
      'n = k skips of s': {
        n: { expr: '{k} skips of {s}', how: 'Start at 0 and add s once for each skip.' },
        k: { expr: '{n} ÷ {s}', how: 'Count the skips of s it takes to reach n.' },
        s: { expr: '{n} ÷ {k}', how: 'Find the number that reaches n in k equal skips.' },
      },
    },
    example: { s: 5, k: 4, n: 20 },
    startWith: ['k', 's'],
    representation: { kind: 'skipCount', step: 's', count: 'k', total: 'n' },
  },

  {
    id: 'm.2.even-odd',
    assumptions: [
      'Put the objects into pairs (groups of 2).',
      'Even: none left over. Odd: one left over.',
      'An even number is a double: 8 = 4 + 4.',
    ],
    variables: [
      whole('n', 'n', 'Objects', 0, 20),
      whole('p', 'p', 'Pairs', 0, 10),
      whole('r', 'r', 'Left over', 0, 1),
    ],
    relations: [
      {
        id: 'n = p + p + r',
        display: '{n} = {p} + {p} + {r}',
        vars: ['n', 'p', 'r'],
        residual: (v) => v.n! - 2 * v.p! - v.r!,
        solve: {
          n: (v) => 2 * v.p! + v.r!,
          p: (v) => (v.n! - v.r!) / 2,
          r: (v) => v.n! - 2 * v.p!,
        },
      },
      {
        id: 'p = pairs in n',
        display: '{p} = pairs in {n}',
        vars: ['p', 'n'],
        residual: (v) => v.p! - Math.floor(v.n! / 2),
        solve: { p: (v) => Math.floor(v.n! / 2), n: () => undefined },
      },
      {
        id: 'r = left over',
        display: '{r} = left over from {n}',
        vars: ['r', 'n'],
        residual: (v) => v.r! - (v.n! % 2),
        solve: { r: (v) => v.n! % 2, n: () => undefined },
      },
    ],
    steps: {
      'n = p + p + r': {
        n: {
          expr: '{p} + {p} + {r}',
          how: 'Double the pairs, then add the one left over (if any).',
        },
        p: {
          expr: '({n} − {r}) ÷ 2',
          how: 'Take away the one left over, then split the rest into two equal rows.',
        },
        r: { expr: '{n} − {p} − {p}', how: 'Take away both rows of the pairs; see what is left.' },
      },
      'p = pairs in n': {
        p: { expr: 'pairs in {n}', how: 'Match objects two at a time and count the pairs.' },
      },
      'r = left over': {
        r: {
          expr: 'left over from {n}',
          how: 'After pairing, is one object left without a partner?',
        },
      },
    },
    example: { n: 7, p: 3, r: 1 },
    startWith: ['n'],
    representation: { kind: 'pairs', value: 'n', max: 20 },
  },

  {
    id: 'm.2.arrays',
    assumptions: [
      'An array has equal rows and equal columns.',
      'Add the same number once for each row: 3 rows of 4 is 4 + 4 + 4.',
      'Up to 5 rows and 5 columns.',
    ],
    variables: [
      whole('r', 'r', 'Rows', 1, 5),
      whole('c', 'c', 'In each row', 1, 5),
      whole('n', 'n', 'Total', 1, 25),
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
        n: { expr: '{r} rows of {c}', how: 'Add c once for each row (repeated addition).' },
        r: { expr: '{n} ÷ {c}', how: 'Make rows of c until you use all n. Count the rows.' },
        c: { expr: '{n} ÷ {r}', how: 'Share n equally into r rows. Count one row.' },
      },
    },
    example: { r: 3, c: 4, n: 12 },
    startWith: ['r', 'c'],
    representation: { kind: 'array', rows: 'r', columns: 'c', total: 'n', max: 5 },
  },

  {
    id: 'm.2.standard-length',
    assumptions: [
      'Line up the end of the object with the ruler’s 0.',
      'Use the same unit for both lengths: inches, feet, centimeters or meters.',
      'Longer units give smaller numbers: 1 foot is 12 inches; 1 meter is 100 centimeters.',
    ],
    variables: [
      { ...whole('a', 'a', 'Ribbon A', 0, 100), unit: 'cm' },
      { ...whole('b', 'b', 'Ribbon B', 0, 100), unit: 'cm' },
      { ...whole('d', 'd', 'How much longer', -100, 100), unit: 'cm' },
    ],
    relations: [
      {
        id: 'd = a − b',
        display: '{d} = {a} − {b}',
        vars: ['d', 'a', 'b'],
        residual: (v) => v.d! - (v.a! - v.b!),
        solve: { d: (v) => v.a! - v.b!, a: (v) => v.d! + v.b!, b: (v) => v.a! - v.d! },
      },
    ],
    steps: {
      'd = a − b': {
        d: { expr: '{a} − {b}', how: 'Subtract the shorter length from the longer one.' },
        a: { expr: '{b} + {d}', how: 'Ribbon A is ribbon B plus the difference.' },
        b: { expr: '{a} − {d}', how: 'Take the difference away from ribbon A.' },
      },
    },
    example: { a: 12, b: 8, d: 4 },
    startWith: ['a', 'b'],
    representation: { kind: 'ruler', lengths: ['a', 'b'], difference: 'd', extent: 15 },
  },

  {
    id: 'm.2.money',
    assumptions: [
      'Quarter = 25¢, dime = 10¢, nickel = 5¢, penny = 1¢.',
      '100¢ = $1.00.',
      'Count the biggest coins first.',
    ],
    variables: [
      whole('q', 'q', 'Quarters', 0, 10),
      whole('dm', 'd', 'Dimes', 0, 10),
      whole('nk', 'n', 'Nickels', 0, 10),
      whole('pn', 'p', 'Pennies', 0, 10),
      { ...whole('T', 'T', 'Total', 0, 1000), unit: '¢' },
    ],
    relations: [
      {
        id: 'T = 25q + 10d + 5n + p',
        display: '{T} = 25 × {q} + 10 × {dm} + 5 × {nk} + {pn}',
        vars: ['T', 'q', 'dm', 'nk', 'pn'],
        residual: (v) => v.T! - (25 * v.q! + 10 * v.dm! + 5 * v.nk! + v.pn!),
        solve: {
          T: (v) => 25 * v.q! + 10 * v.dm! + 5 * v.nk! + v.pn!,
          q: (v) => (v.T! - 10 * v.dm! - 5 * v.nk! - v.pn!) / 25,
          dm: (v) => (v.T! - 25 * v.q! - 5 * v.nk! - v.pn!) / 10,
          nk: (v) => (v.T! - 25 * v.q! - 10 * v.dm! - v.pn!) / 5,
          pn: (v) => v.T! - 25 * v.q! - 10 * v.dm! - 5 * v.nk!,
        },
      },
    ],
    steps: {
      'T = 25q + 10d + 5n + p': {
        T: {
          expr: '25 × {q} + 10 × {dm} + 5 × {nk} + {pn}',
          how: 'Count on by 25s for quarters, 10s for dimes, 5s for nickels, then 1s for pennies.',
        },
        q: {
          expr: '({T} − 10 × {dm} − 5 × {nk} − {pn}) ÷ 25',
          how: 'Take away the other coins’ value. Count the 25s in what is left.',
        },
        dm: {
          expr: '({T} − 25 × {q} − 5 × {nk} − {pn}) ÷ 10',
          how: 'Take away the other coins’ value. Count the 10s in what is left.',
        },
        nk: {
          expr: '({T} − 25 × {q} − 10 × {dm} − {pn}) ÷ 5',
          how: 'Take away the other coins’ value. Count the 5s in what is left.',
        },
        pn: {
          expr: '{T} − 25 × {q} − 10 × {dm} − 5 × {nk}',
          how: 'Take away the other coins’ value. The rest is pennies.',
        },
      },
    },
    example: { q: 2, dm: 1, nk: 1, pn: 3, T: 68 },
    startWith: ['q', 'dm', 'nk', 'pn'],
    representation: {
      kind: 'coins',
      coins: [
        { var: 'q', cents: 25, name: 'Quarters' },
        { var: 'dm', cents: 10, name: 'Dimes' },
        { var: 'nk', cents: 5, name: 'Nickels' },
        { var: 'pn', cents: 1, name: 'Pennies' },
      ],
      total: 'T',
    },
  },

  {
    id: 'm.2.time-5-min',
    assumptions: [
      'The long hand moves 5 minutes from one number to the next: count by 5s.',
      'The short hand points at the hour, or just past it.',
      'a.m. is from midnight to noon; p.m. is from noon to midnight.',
    ],
    variables: [
      whole('h', 'h', 'Hour', 1, 12),
      { ...whole('m', 'm', 'Minutes past', 0, 55), step: 5 },
      whole('k', 'k', 'Long hand points at', 0, 11),
    ],
    relations: [
      {
        id: 'm = 5 × k',
        display: '{m} = 5 × {k}',
        vars: ['m', 'k'],
        residual: (v) => v.m! - 5 * v.k!,
        solve: { m: (v) => 5 * v.k!, k: (v) => v.m! / 5 },
      },
    ],
    steps: {
      'm = 5 × k': {
        m: { expr: '5 × {k}', how: 'Count by 5s from 12 to the number the long hand points at.' },
        k: {
          expr: '{m} ÷ 5',
          how: 'Count by 5s until you reach the minutes; that many numbers past 12.',
        },
      },
    },
    example: { h: 4, m: 25, k: 5 },
    startWith: ['h', 'm'],
    representation: { kind: 'clock', hour: 'h', minute: 'm', minuteStep: 5 },
  },

  {
    id: 'm.2.graphs-line-plots',
    assumptions: [
      'Each bar’s height is the count for that category. Read the scale starting at 0.',
      'Add to find totals; subtract to compare categories.',
    ],
    variables: [
      whole('a', 'a', 'Soccer', 0, 20),
      whole('b', 'b', 'Basketball', 0, 20),
      whole('c', 'c', 'Baseball', 0, 20),
      whole('e', 'e', 'Tennis', 0, 20),
      whole('n', 'n', 'Total', 0, 80),
      whole('d', 'd', 'More soccer than basketball', -20, 20),
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
      {
        id: 'd = a − b',
        display: '{d} = {a} − {b}',
        vars: ['d', 'a', 'b'],
        residual: (v) => v.d! - (v.a! - v.b!),
        solve: { d: (v) => v.a! - v.b!, a: (v) => v.d! + v.b!, b: (v) => v.a! - v.d! },
      },
    ],
    steps: {
      'n = a + b + c + e': {
        n: { expr: '{a} + {b} + {c} + {e}', how: 'Add the heights of all four bars.' },
        a: { expr: '{n} − {b} − {c} − {e}', how: 'Take the other bars away from the total.' },
        b: { expr: '{n} − {a} − {c} − {e}', how: 'Take the other bars away from the total.' },
        c: { expr: '{n} − {a} − {b} − {e}', how: 'Take the other bars away from the total.' },
        e: { expr: '{n} − {a} − {b} − {c}', how: 'Take the other bars away from the total.' },
      },
      'd = a − b': {
        d: { expr: '{a} − {b}', how: 'Subtract the shorter bar from the taller bar.' },
        a: { expr: '{b} + {d}', how: 'Soccer is basketball plus the difference.' },
        b: { expr: '{a} − {d}', how: 'Take the difference away from soccer.' },
      },
    },
    example: { a: 8, b: 5, c: 3, e: 6, n: 22, d: 3 },
    startWith: ['a', 'b', 'c', 'e'],
    representation: {
      kind: 'bars',
      bars: [
        { var: 'a', editable: true },
        { var: 'b', editable: true },
        { var: 'c', editable: true },
        { var: 'e', editable: true },
      ],
      min: 0,
      max: 10,
      total: 'n',
    },
  },

  {
    id: 'm.2.thirds-polygons',
    assumptions: [
      'Equal parts are the same size. 3 equal parts are thirds.',
      'Three thirds make one whole.',
      'Shapes are named by their sides and angles: triangle 3, quadrilateral 4, pentagon 5, hexagon 6.',
    ],
    variables: [
      whole('p', 'p', 'Equal parts', 1, 4),
      whole('k', 'k', 'Shaded parts', 0, 4),
      whole('u', 'u', 'Not shaded', 0, 4),
    ],
    relations: [
      {
        id: 'u = p − k',
        display: '{u} = {p} − {k}',
        vars: ['u', 'p', 'k'],
        residual: (v) => v.u! - (v.p! - v.k!),
        solve: { u: (v) => v.p! - v.k!, p: (v) => v.k! + v.u!, k: (v) => v.p! - v.u! },
      },
    ],
    steps: {
      'u = p − k': {
        u: { expr: '{p} − {k}', how: 'Take the shaded parts away from all the parts.' },
        p: { expr: '{k} + {u}', how: 'Add the shaded and unshaded parts.' },
        k: { expr: '{p} − {u}', how: 'Take the unshaded parts away from all the parts.' },
      },
    },
    example: { p: 3, k: 1, u: 2 },
    startWith: ['p', 'k'],
    representation: { kind: 'partition', parts: 'p', shaded: 'k', shape: 'rectangle' },
  },
];

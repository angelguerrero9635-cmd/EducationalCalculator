/**
 * Kindergarten math: every calculator module for the grade, the skill's main page first
 * and its problem types (`<skill id>~<slug>`) after it. Shared relation helpers live in
 * `../helpers.ts`; worked-line helpers in `../work.ts`. Rules: docs/MODULE_GUIDE.md.
 */
import type { Values } from '@/engine/types';
import { difference, whole } from '../helpers';
import type { ModuleDef } from '../types';
import { countList } from '../work';

const cmpK10 = difference('d', 'a', 'b', {
  countOn: true,
  compareWords: ['more', 'fewer'],
  display: 'Match {a} and {b}: {d} left over',
  diff: 'Match the counters in pairs. Count the solid ones left over.',
  first: [
    'The first row has more. Add the extra to the second row.',
    'The first row has fewer. Take the extra away from the second row.',
  ],
  second: [
    'The first row has more. Take the extra away from the first row.',
    'The first row has fewer. Add the extra to the first row.',
  ],
});
const cmpPencils = difference('d', 'a', 'b', {
  countOn: true,
  compareWords: ['longer', 'shorter'],
  display: 'Line up {a} and {b}: {d} cubes stick out',
  diff: 'Line up the pencils at one end. Count the cubes that stick out.',
  first: [
    'The first pencil is longer. Add the extra cubes to the second pencil.',
    'The first pencil is shorter. Take the extra cubes away from the second pencil.',
  ],
  second: [
    'The first pencil is longer. Take the extra cubes away from the first pencil.',
    'The first pencil is shorter. Add the extra cubes to the first pencil.',
  ],
});
/** "1 rhombus", "2 rhombuses". */
const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;
/** "Start at 4. Count on 3: 5, 6, 7 → 7" (K–1 counting on from one part to the whole). */
const startAt = (from: number, by: number) =>
  by > 0 ? [`Start at ${from}. Count on ${by}: ${countList(from, 1, by)} → ${from + by}`] : [];
/** "Count on from 4: 5, 6, 7 → 3" (how many to count on from one amount to another). */
const countOn = (from: number, to: number) =>
  to > from ? [`Count on from ${from}: ${countList(from, 1, to - from)} → ${to - from}`] : [];
/** "1 trapezoid covers 3 triangles", "2 rhombuses cover 4 triangles" (blocks already placed). */
const blockLines = (z: number, r: number) => [
  ...(z > 0
    ? [`${plural(z, 'trapezoid', 'trapezoids')} ${z === 1 ? 'covers' : 'cover'} ${3 * z} triangles`]
    : []),
  ...(r > 0
    ? [`${plural(r, 'rhombus', 'rhombuses')} ${r === 1 ? 'covers' : 'cover'} ${2 * r} triangles`]
    : []),
];
const capacity = difference('d', 'a', 'b', {
  diff: 'Match the cups one to one. Count the extra cups.',
  countOn: true,
  display: 'Match {a} and {b} cups: {d} extra cups',
  first: [
    'The first jar holds more. Add the extra cups to the second jar.',
    'The first jar holds less. Take the extra cups away from the second jar.',
  ],
  second: [
    'The first jar holds more. Take the extra cups away from the first jar.',
    'The first jar holds less. Add the extra cups to the first jar.',
  ],
});

export const MATH_K_MODULES: ModuleDef[] = [
  {
    id: 'm.K.add-sub-10',
    assumptions: [
      'Put the two groups together. Count them all.',
      'Adding puts two groups together.',
      'Take some away. Count how many are left.',
    ],
    variables: [
      whole('a', 'a', 'First group', 0, 10),
      whole('b', 'b', 'Second group', 0, 10),
      whole('c', 'c', 'In all', 0, 10),
    ],
    relations: [
      {
        id: 'a + b = c',
        display: '{a} + {b} = {c}',
        vars: ['a', 'b', 'c'],
        residual: (v) => v.a! + v.b! - v.c!,
        solve: { c: (v) => v.a! + v.b!, a: (v) => v.c! - v.b!, b: (v) => v.c! - v.a! },
      },
      {
        id: 'c − b = a',
        display: '{c} − {b} = {a}',
        vars: ['a', 'b', 'c'],
        residual: (v) => v.c! - v.b! - v.a!,
        solve: { a: (v) => v.c! - v.b!, c: (v) => v.a! + v.b!, b: (v) => v.c! - v.a! },
      },
    ],
    steps: {
      'a + b = c': {
        c: {
          expr: '{a} + {b}',
          how: 'Start at the first group. Count on the second group.',
          work: (v) => (v.b! > 0 ? [`Count on from ${v.a}: ${countList(v.a!, 1, v.b!)}`] : []),
        },
        a: {
          expr: '{c} − {b}',
          how: 'Take the second group away from all of them.',
          work: (v) =>
            v.b! > 0
              ? [`Count back ${v.b} from ${v.c}: ${countList(v.c!, -1, v.b!)} → ${v.a}`]
              : [],
        },
        b: {
          expr: '{c} − {a}',
          how: 'Count on from the first group up to all of them.',
          work: (v) =>
            v.c! > v.a!
              ? [`Count on from ${v.a}: ${countList(v.a!, 1, v.c! - v.a!)} → ${v.b}`]
              : [],
        },
      },
      'c − b = a': {
        a: { expr: '{c} − {b}', how: 'Take the second group away. Count what is left.' },
        c: { expr: '{a} + {b}', how: 'Put the second group back.' },
        b: { expr: '{c} − {a}', how: 'Take what is left away from all of them.' },
      },
    },
    example: { a: 3, b: 4, c: 7 },
    startWith: ['a', 'b'],
    representation: { kind: 'tenFrame', first: 'a', second: 'b', total: 'c' },
  },
  // ─── Kindergarten ──────────────────────────────────────────────────────────
  // Number partners: break a number up to 10 into two parts (K.OA.3).
  {
    id: 'm.K.add-sub-10~number-bond',
    title: 'Number partners',
    use: 'Use this for “7 is 4 and ___” and other ways to split a number.',
    assumptions: [
      'The whole is in the top circle. The two parts are below.',
      'The two parts together make the whole.',
      'A whole can be split into two parts in more than one way.',
    ],
    variables: [
      whole('w', 'w', 'Whole', 0, 10),
      whole('a', 'a', 'First part', 0, 10),
      whole('b', 'b', 'Second part', 0, 10),
    ],
    relations: [
      {
        id: 'a + b = w',
        display: '{w} = {a} + {b}',
        vars: ['a', 'b', 'w'],
        residual: (v) => v.a! + v.b! - v.w!,
        solve: { w: (v) => v.a! + v.b!, a: (v) => v.w! - v.b!, b: (v) => v.w! - v.a! },
      },
    ],
    steps: {
      'a + b = w': {
        w: {
          expr: '{a} + {b}',
          how: 'Start at the first part. Count on the second part.',
          work: (v: Values) => startAt(v.a!, v.b!),
        },
        a: {
          expr: '{w} − {b}',
          how: 'Count on from the second part up to the whole.',
          work: (v: Values) => countOn(v.b!, v.w!),
        },
        b: {
          expr: '{w} − {a}',
          how: 'Count on from the first part up to the whole.',
          work: (v: Values) => countOn(v.a!, v.w!),
        },
      },
    },
    example: { w: 7, a: 4, b: 3 },
    startWith: ['w', 'a'],
    representation: { kind: 'numberBond', whole: 'w', parts: ['a', 'b'] },
  },
  // Kindergarten take-away stories: start, take away, left (K.OA.2).
  {
    id: 'm.K.add-sub-10~take-away',
    title: 'Take away',
    use: 'Use this for “7 birds, 3 fly away. How many are left?”',
    assumptions: [
      'Start with some. Take some away. Count how many are left.',
      'Fewer are left than you started with. Take away 0: the same are left.',
    ],
    variables: [
      whole('s', 's', 'Start', 0, 10),
      whole('t', 't', 'Take away', 0, 10),
      whole('l', 'l', 'Left', 0, 10),
    ],
    relations: [
      {
        id: 'l = s − t',
        display: '{s} − {t} = {l}',
        vars: ['l', 's', 't'],
        residual: (v) => v.l! - v.s! + v.t!,
        solve: { l: (v) => v.s! - v.t!, s: (v) => v.l! + v.t!, t: (v) => v.s! - v.l! },
      },
    ],
    steps: {
      'l = s − t': {
        l: {
          expr: '{s} − {t}',
          how: 'Cross out the ones taken away. Count the ones left.',
          work: (v: Values) =>
            v.t! > 0
              ? [`Count back ${v.t} from ${v.s}: ${countList(v.s!, -1, v.t!)} → ${v.l}`]
              : [],
        },
        s: {
          expr: '{l} + {t}',
          how: 'Put back the ones taken away. Count them all.',
          work: (v: Values) => startAt(v.l!, v.t!),
        },
        t: {
          expr: '{s} − {l}',
          how: 'Count on from the ones left up to the start.',
          work: (v: Values) => countOn(v.l!, v.s!),
        },
      },
    },
    example: { s: 7, t: 3, l: 4 },
    startWith: ['s', 't'],
    representation: { kind: 'tenFrame', first: 'l', second: 't', total: 's' },
  },
  // ─── Kindergarten ──────────────────────────────────────────────────────────
  {
    id: 'm.K.count-100',
    assumptions: [
      'Count on: say the next number each time.',
      'After 49 comes 50: a new row starts.',
      'Stop at 100.',
    ],
    variables: [
      whole('s', 's', 'Start number', 1, 99),
      whole('c', 'c', 'Count on', 1, 10),
      whole('e', 'e', 'End number', 2, 100),
    ],
    relations: [
      {
        id: 'e = s + c',
        display: 'Start at {s}. Count on {c}: {e}',
        vars: ['e', 's', 'c'],
        residual: (v) => v.e! - v.s! - v.c!,
        solve: { e: (v) => v.s! + v.c!, s: (v) => v.e! - v.c!, c: (v) => v.e! - v.s! },
      },
    ],
    steps: {
      'e = s + c': {
        e: {
          expr: '{s} + {c}',
          how: 'Start at the start number. Say the next number for each one you count on.',
          work: (v) => [`Count on from ${v.s}: ${countList(v.s!, 1, v.c!)} → ${v.e}`],
        },
        s: {
          expr: '{e} − {c}',
          how: 'Start at the end number. Count back.',
          work: (v) => [`Count back from ${v.e}: ${countList(v.e!, -1, v.c!)} → ${v.s}`],
        },
        c: {
          expr: '{e} − {s}',
          how: 'Count on from the start number to the end number.',
          work: (v) => countOn(v.s!, v.e!),
        },
      },
    },
    example: { s: 47, c: 3, e: 50 },
    startWith: ['s', 'c'],
    representation: { kind: 'hundredChart', value: 's', max: 100, marks: ['e'] },
  },
  {
    id: 'm.K.count-100~tens',
    title: 'Count by tens',
    use: 'Use this to count by tens to 100.',
    assumptions: ['Count by tens: 10, 20, 30 …', 'Each jump is 10 more.'],
    variables: [whole('t', 't', 'Tens', 1, 10), whole('n', 'n', 'Number reached', 10, 100)],
    relations: [
      {
        id: 'n = t tens',
        display: 'Count by tens {t} times: {n}',
        vars: ['n', 't'],
        residual: (v) => v.n! - 10 * v.t!,
        solve: { n: (v) => 10 * v.t!, t: (v) => v.n! / 10 },
      },
    ],
    steps: {
      'n = t tens': {
        n: {
          expr: '{t} tens',
          how: 'Say the tens, one for each jump.',
          work: (v) => [`Count by tens: ${countList(0, 10, v.t!)} → ${v.n}`],
        },
        t: {
          expr: 'jumps to {n}',
          how: 'Count by tens to the number. Count the jumps.',
          work: (v) => [`Count by tens: ${countList(0, 10, v.t!)} → ${v.t} jumps`],
        },
      },
    },
    example: { t: 4, n: 40 },
    startWith: ['t'],
    representation: { kind: 'skipCount', step: 10, count: 't', total: 'n' },
  },
  {
    id: 'm.K.count-objects',
    assumptions: [
      'Touch and count each object once.',
      'The last number you say tells how many.',
      'Moving the dots doesn’t change how many there are.',
    ],
    variables: [whole('n', 'n', 'Dots', 0, 19), whole('m', 'm', 'After one more', 1, 20)],
    relations: [
      {
        id: 'm = n + 1',
        display: '1 more than {n} is {m}',
        vars: ['m', 'n'],
        residual: (v) => v.m! - v.n! - 1,
        solve: { m: (v) => v.n! + 1, n: (v) => v.m! - 1 },
      },
    ],
    steps: {
      'm = n + 1': {
        m: {
          expr: '{n} + 1',
          how: 'Count the dots. Add one more and say the next number.',
          work: (v: Values) =>
            v.n! > 0 ? [`Count: ${countList(0, 1, v.n!)} → ${v.n}`, `One more: ${v.m}`] : [],
        },
        n: { expr: '{m} − 1', how: 'Take one away. Say the number just before.' },
      },
    },
    example: { n: 7, m: 8 },
    startWith: ['n'],
    representation: { kind: 'dotSet', count: 'n' },
    pictureLabels: ['m'],
  },
  // ─── Added from the third review (textbook coverage) ─────────────────────────

  // 5 and some more: numbers 5–10 on a five-group (K.CC.5, Eureka K Module 1).
  {
    id: 'm.K.count-objects~five-group',
    title: '5 and some more',
    use: 'Use this to see 6 to 10 as 5 and some more.',
    assumptions: [
      'The top row of the ten-frame holds 5.',
      'Numbers from 6 to 10 are 5 and some more.',
    ],
    variables: [whole('n', 'n', 'Number (5–10)', 5, 10), whole('e', 'e', 'More than 5', 0, 5)],
    relations: [
      {
        id: 'n = 5 + e',
        display: '{n} = 5 + {e}',
        vars: ['n', 'e'],
        residual: (v) => v.n! - 5 - v.e!,
        solve: { n: (v) => 5 + v.e!, e: (v) => v.n! - 5 },
      },
    ],
    steps: {
      'n = 5 + e': {
        n: {
          expr: '5 + {e}',
          how: 'Start at 5. Count on the ones in the bottom row.',
          work: (v: Values) => startAt(5, v.e!),
        },
        e: {
          expr: '{n} − 5',
          how: 'Count the counters in the bottom row.',
          work: (v: Values) => countOn(5, v.n!),
        },
      },
    },
    example: { n: 8, e: 3 },
    startWith: ['n'],
    representation: { kind: 'tenFrame', first: 5, second: 'e', total: 'n' },
  },
  {
    id: 'm.K.compare-10',
    assumptions: [
      'Match each counter with one in the other row.',
      'The row with counters left over has more.',
      'If none are left over, the groups are equal.',
    ],
    variables: [
      whole('a', 'a', 'First row', 0, 10),
      whole('b', 'b', 'Second row', 0, 10),
      whole('d', 'd', 'Left over', 0, 10),
    ],
    relations: [cmpK10.relation],
    steps: {
      ...cmpK10.steps,
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
  // Two numerals 1–10 (K.CC.7): the greater one comes later when we count.
  ((): ModuleDef => {
    const cmp = difference('d', 'a', 'b', {
      countOn: true,
      compareWords: ['greater', 'less'],
      display: '{a} and {b}: {d} apart',
      diff: 'Say the numbers in counting order. The one that comes later is greater.',
      first: [
        'The first number is greater. Count on from the second number.',
        'The first number is less. Count back from the second number.',
      ],
      second: [
        'The first number is greater. Count back from the first number.',
        'The first number is less. Count on from the first number.',
      ],
    });
    return {
      id: 'm.K.compare-10~numerals',
      title: 'Which number is greater?',
      use: 'Use this to tell which number is greater, like 6 or 9.',
      assumptions: ['When we count, a greater number comes later.', 'Match counters to check.'],
      variables: [
        whole('a', 'a', 'First number', 1, 10),
        whole('b', 'b', 'Second number', 1, 10),
        whole('d', 'd', 'Apart', 0, 9),
      ],
      relations: [cmp.relation],
      steps: { ...cmp.steps },
      example: { a: 6, b: 9, d: 3 },
      startWith: ['a', 'b'],
      pictureLabels: ['d'],
      representation: {
        kind: 'compareRows',
        a: 'a',
        b: 'b',
        difference: 'd',
        icon: 'dot',
        words: ['more', 'fewer'],
      },
    };
  })(),
  {
    id: 'm.K.make-10',
    assumptions: ['A ten-frame has 10 boxes.', 'The counters and the empty boxes make 10.'],
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
        b: {
          expr: '10 − {a}',
          how: 'Count the open counters. They fill the empty boxes.',
          work: (v) =>
            v.b! > 0 ? [`Count on from ${v.a}: ${countList(v.a!, 1, v.b!)} → ${v.b}`] : [],
        },
        a: { expr: '10 − {b}', how: 'Count the solid counters.' },
      },
    },
    example: { a: 6, b: 4 },
    startWith: ['a'],
    representation: { kind: 'tenFrame', first: 'a', second: 'b', total: 10 },
  },
  {
    id: 'm.K.teens-place-value',
    assumptions: [
      'The first ten-frame is full: 10 ones.',
      'The numbers 11 to 19 are 10 ones and some more ones.',
      'Count the second frame to find the more ones.',
    ],
    variables: [whole('n', 'n', 'Number (10–19)', 10, 19), whole('o', 'o', 'More ones', 0, 9)],
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
        n: {
          expr: '10 + {o}',
          how: 'Start at 10 and count on the more ones.',
          work: (v: Values) => startAt(10, v.o!),
        },
        o: {
          expr: '{n} − 10',
          how: 'The first frame is 10 ones. Count the ones in the second frame.',
          work: (v: Values) => [`${v.n} is 10 ones and ${v.o} more ones`],
        },
      },
    },
    example: { n: 14, o: 4 },
    startWith: ['n'],
    representation: { kind: 'tenFrame', first: 10, second: 'o', total: 'n', frames: 2 },
  },
  {
    id: 'm.K.measurable-attributes',
    assumptions: [
      'Line up one end of each at the same place.',
      'The one that sticks out is longer.',
      'Count the cubes that stick out. That is how much longer.',
    ],
    variables: [
      { ...whole('a', 'a', 'First pencil', 0, 12), unit: 'cubes' },
      { ...whole('b', 'b', 'Second pencil', 0, 12), unit: 'cubes' },
      { ...whole('d', 'd', 'Cubes that stick out', 0, 12), unit: 'cubes' },
    ],
    relations: [cmpPencils.relation],
    steps: {
      ...cmpPencils.steps,
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
      object: 'pencil',
    },
  },
  // Capacity: which container holds more (K.MD.2).
  {
    id: 'm.K.measurable-attributes~capacity',
    title: 'Which holds more?',
    use: 'Use this for “Which jar holds more cups?”',
    assumptions: [
      'Fill each jar with cups of water. Use the same cup each time.',
      'The jar that takes more cups holds more.',
      'Same number of cups? Then they hold the same.',
    ],
    variables: [
      { ...whole('a', 'a', 'First jar', 0, 10), unit: 'cups' },
      { ...whole('b', 'b', 'Second jar', 0, 10), unit: 'cups' },
      { ...whole('d', 'd', 'How many more cups', 0, 10), unit: 'cups' },
    ],
    relations: [capacity.relation],
    steps: { ...capacity.steps },
    example: { a: 7, b: 4, d: 3 },
    startWith: ['a', 'b'],
    representation: {
      kind: 'compareRows',
      a: 'a',
      b: 'b',
      difference: 'd',
      icon: 'cup',
      words: ['more', 'less'],
    },
  },
  {
    id: 'm.K.compose-shapes',
    assumptions: [
      'A hexagon is made of 6 triangles.',
      'A trapezoid covers 3 triangles. A rhombus covers 2 triangles.',
      'Cover the whole hexagon, with no gaps. Blocks don’t go on top of each other.',
    ],
    variables: [
      whole('z', 'z', 'Trapezoids', 0, 2),
      whole('r', 'r', 'Rhombuses', 0, 3),
      whole('t', 't', 'Triangles', 0, 6),
    ],
    relations: [
      {
        id: 'hexagon = 3z + 2r + t',
        display: '{z} trapezoids + {r} rhombuses + {t} triangles = 1 hexagon',
        vars: ['z', 'r', 't'],
        residual: (v) => 3 * v.z! + 2 * v.r! + v.t! - 6,
        check: (v) => `${3 * v.z!} + ${2 * v.r!} + ${v.t} = 6 triangles`,
        solve: {
          t: (v) => 6 - 3 * v.z! - 2 * v.r!,
          r: (v) => (6 - 3 * v.z! - v.t!) / 2,
          z: (v) => (6 - 2 * v.r! - v.t!) / 3,
        },
      },
    ],
    steps: {
      'hexagon = 3z + 2r + t': {
        t: {
          expr: (v: Values) => `6 − ${3 * v.z!} − ${2 * v.r!}`,
          how: 'Count the empty triangle spaces. Put a triangle in each one.',
          work: (v: Values) => [
            ...blockLines(v.z!, v.r!),
            `Covered: ${3 * v.z!} + ${2 * v.r!} = ${3 * v.z! + 2 * v.r!} triangles`,
            `Empty: 6 − ${3 * v.z! + 2 * v.r!} = ${v.t}`,
          ],
        },
        r: {
          expr: (v: Values) => `rhombuses in (6 − ${3 * v.z!} − ${v.t})`,
          how: 'Each rhombus covers 2 triangle spaces. Count by 2s.',
          work: (v: Values) => [
            ...blockLines(v.z!, 0),
            `Covered: ${3 * v.z!} + ${v.t} = ${3 * v.z! + v.t!} triangles`,
            `Empty: 6 − ${3 * v.z! + v.t!} = ${2 * v.r!}`,
            ...(v.r! > 0
              ? [`Count by 2s: ${countList(0, 2, v.r!)} → ${plural(v.r!, 'rhombus', 'rhombuses')}`]
              : []),
          ],
        },
        z: {
          expr: (v: Values) => `trapezoids in (6 − ${2 * v.r!} − ${v.t})`,
          how: 'Each trapezoid covers 3 triangle spaces. That is half the hexagon.',
          work: (v: Values) => [
            ...blockLines(0, v.r!),
            `Covered: ${2 * v.r!} + ${v.t} = ${2 * v.r! + v.t!} triangles`,
            `Empty: 6 − ${2 * v.r! + v.t!} = ${3 * v.z!}`,
            ...(v.z! > 0
              ? [
                  `Count by 3s: ${countList(0, 3, v.z!)} → ${plural(v.z!, 'trapezoid', 'trapezoids')}`,
                ]
              : []),
          ],
        },
      },
    },
    example: { z: 1, r: 1, t: 1 },
    startWith: ['z', 'r'],
    representation: { kind: 'patternBlocks', trapezoids: 'z', rhombuses: 'r', triangles: 't' },
  },
];

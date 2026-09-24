/**
 * Section 1 modules added from the second review round: the deferred problem types and the
 * two new Kindergarten skills (position words, composing shapes).
 */
import type { Values } from '@/engine/types';

import { difference, whole } from './math-k2';
import type { ModuleDef } from './types';
import {
  addAll,
  addStrategy,
  countList,
  countUp,
  dealLines,
  repeated,
  subtractStrategy,
  sumSteps,
} from './work';

/** "1 rhombus", "2 rhombuses". */
const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

/** "Start at 4. Count on 3: 5, 6, 7 → 7" (K–1 counting on from one part to the whole). */
const startAt = (from: number, by: number) =>
  by > 0 ? [`Start at ${from}. Count on ${by}: ${countList(from, 1, by)} → ${from + by}`] : [];

/** "Count on from 4: 5, 6, 7 → 3" (how many to count on from one amount to another). */
const countOn = (from: number, to: number) =>
  to > from ? [`Count on from ${from}: ${countList(from, 1, to - from)} → ${to - from}`] : [];

/** "1 trapezoid: 3 → 3 triangles", "2 rhombuses: 2, 4 → 4 triangles" (blocks already placed). */
const blockLines = (z: number, r: number) => [
  ...(z > 0
    ? [`${plural(z, 'trapezoid', 'trapezoids')}: ${countList(0, 3, z)} → ${3 * z} triangles`]
    : []),
  ...(r > 0
    ? [`${plural(r, 'rhombus', 'rhombuses')}: ${countList(0, 2, r)} → ${2 * r} triangles`]
    : []),
];

/** "$10 bills: 10, 20 → $20" and "$5 bills: 5 → $5" for the bills there are. */
const billLines = (t: number, f: number) => [
  ...(t > 0 ? [`$10 bills: ${countList(0, 10, t)} → $${10 * t}`] : []),
  ...(f > 0 ? [`$5 bills: ${countList(0, 5, f)} → $${5 * f}`] : []),
];

const capacity = difference('d', 'a', 'b', {
  diff: 'Match the cups one to one. Count the extra cups.',
  countOn: true,
  display: '{d} = how many more cups: {a} or {b}',
  first: [
    'Jar A holds more. Add the extra cups to jar B.',
    'Jar A holds less. Take the extra cups away from jar B.',
  ],
  second: [
    'Jar A holds more. Take the extra cups away from jar A.',
    'Jar A holds less. Add the extra cups to jar A.',
  ],
});

const equalParts = difference('D', 'x', 'y', {
  diff: 'Take the smaller part away from the bigger part. 0 means the parts are equal.',
  first: [
    'The first part is bigger. Add the difference to the second part.',
    'The first part is smaller. Take the difference away from the second part.',
  ],
  second: [
    'The first part is bigger. Take the difference away from the first part.',
    'The first part is smaller. Add the difference to the first part.',
  ],
});

/** Cents written as dollars and cents, e.g. "$1.35". */
const dollars = (cents: number) =>
  `$${Math.floor(cents / 100)}.${String(Math.round(cents % 100)).padStart(2, '0')}`;

/**
 * A two-step word problem with a middle amount m: m = s ± a, then e = m ± b. `first` and
 * `then` say whether each step adds (1) or takes away (-1). Every amount stays within 100.
 */
function twoStep(
  slug: string,
  title: string,
  first: 1 | -1,
  then: 1 | -1,
  example: Values,
): ModuleDef {
  const word = (sign: 1 | -1) => (sign > 0 ? 'Added' : 'Taken away');
  const op = (sign: 1 | -1) => (sign > 0 ? '+' : '−');
  const inv = (sign: 1 | -1) => (sign > 0 ? '−' : '+');
  /** "x ± y = z" plus its strategy lines. */
  const line = (x: number, sign: number, y: number) => {
    const z = x + sign * y;
    const strategy = sign > 0 ? addStrategy(x, y) : subtractStrategy(x, y);
    // The strategy lines end at the answer; with none, one line says it.
    return strategy.length ? strategy : [`${x} ${sign > 0 ? '+' : '−'} ${y} = ${z}`];
  };
  /** One step as a relation: out = inp ± by. */
  const stepRel = (out: string, inp: string, by: string, sign: 1 | -1) => ({
    id: `${out} = ${inp} ${op(sign)} ${by}`,
    display: `{${out}} = {${inp}} ${op(sign)} {${by}}`,
    vars: [out, inp, by],
    residual: (v: Values) => v[out]! - v[inp]! - sign * v[by]!,
    solve: {
      [out]: (v: Values) => v[inp]! + sign * v[by]!,
      [inp]: (v: Values) => v[out]! - sign * v[by]!,
      [by]: (v: Values) => sign * (v[out]! - v[inp]!),
    },
  });
  const stepText = (out: string, inp: string, by: string, sign: 1 | -1, when: string) => ({
    [out]: {
      expr: `{${inp}} ${op(sign)} {${by}}`,
      how: `${when}: ${sign > 0 ? 'add to' : 'take away from'} the ${inp === 's' ? 'start' : 'middle amount'}.`,
      work: (v: Values) => line(v[inp]!, sign, v[by]!),
    },
    [inp]: {
      expr: `{${out}} ${inv(sign)} {${by}}`,
      how: `Work backwards: ${sign > 0 ? 'take away what was added' : 'put back what was taken away'}.`,
      work: (v: Values) => line(v[out]!, -sign, v[by]!),
    },
    [by]: {
      expr: sign > 0 ? `{${out}} − {${inp}}` : `{${inp}} − {${out}}`,
      how: 'Count up from the smaller amount to the bigger one.',
      work: (v: Values) => countUp(Math.min(v[inp]!, v[out]!), Math.max(v[inp]!, v[out]!)),
    },
  });
  const r1 = stepRel('m', 's', 'a', first);
  const r2 = stepRel('e', 'm', 'b', then);
  return {
    id: `m.2.add-sub-100-fluency~${slug}`,
    title,
    assumptions: [
      `First some are ${first > 0 ? 'added' : 'taken away'}. Then some are ${then > 0 ? 'added' : 'taken away'}.`,
      'Do one step at a time. Find the middle amount first.',
      'Every amount stays within 100.',
    ],
    variables: [
      whole('s', 's', 'Start', 0, 100),
      whole('a', 'a', `${word(first)} first`, 0, 100),
      whole('m', 'm', 'After the first step', 0, 100),
      whole('b', 'b', `${word(then)} next`, 0, 100),
      whole('e', 'e', 'End', 0, 100),
    ],
    relations: [r1, r2],
    steps: {
      [r1.id]: stepText('m', 's', 'a', first, 'First'),
      [r2.id]: stepText('e', 'm', 'b', then, 'Then'),
    },
    example,
    startWith: ['s', 'a', 'b'],
    representation: {
      kind: 'hops',
      start: 's',
      hops: [
        { var: 'a', sign: first },
        { var: 'b', sign: then },
      ],
      end: 'e',
      min: 0,
      max: 100,
      tick: 10,
    },
    pictureLabels: ['m'],
  };
}

export const MATH_K2_MORE_MODULES: ModuleDef[] = [
  // ─── Kindergarten ──────────────────────────────────────────────────────────
  // Number partners: break a number up to 10 into two parts (K.OA.3).
  {
    id: 'm.K.add-sub-10~number-bond',
    title: 'Number partners',
    assumptions: [
      'The whole is in the top circle. The two parts are below.',
      'The two parts together make the whole.',
      '7 is 4 and 3. 7 is also 5 and 2.',
    ],
    variables: [
      whole('w', 'w', 'Whole', 0, 10),
      whole('a', 'a', 'First part', 0, 10),
      whole('b', 'b', 'Second part', 0, 10),
    ],
    relations: [
      {
        id: 'a + b = w',
        display: '{a} + {b} = {w}',
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

  // Capacity: which container holds more (K.MD.2).
  {
    id: 'm.K.measurable-attributes~capacity',
    title: 'Which holds more?',
    assumptions: [
      'Fill each jar with cups of water. Use the same cup each time.',
      'The jar that takes more cups holds more.',
      'Same number of cups? Then they hold the same.',
    ],
    variables: [
      { ...whole('a', 'a', 'Jar A', 0, 10), unit: 'cups' },
      { ...whole('b', 'b', 'Jar B', 0, 10), unit: 'cups' },
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

  // Position words in a line (K.G.1).
  {
    id: 'm.K.position-words',
    assumptions: [
      'The front of the line is on the left.',
      'In front of: closer to the front. Behind: closer to the back.',
      'Next to: right beside, with no one in between.',
    ],
    variables: [
      whole('n', 'n', 'Children in line', 1, 10),
      whole('p', 'p', 'Place in line', 1, 10),
      whole('f', 'f', 'Children in front', 0, 9),
      whole('b', 'b', 'Children behind', 0, 9),
    ],
    relations: [
      {
        id: 'f = p − 1',
        display: '{f} = {p} − 1',
        vars: ['f', 'p'],
        residual: (v) => v.f! - v.p! + 1,
        solve: { f: (v) => v.p! - 1, p: (v) => v.f! + 1 },
      },
      {
        id: 'n = f + 1 + b',
        display: '{n} = {f} + 1 + {b}',
        vars: ['n', 'f', 'b'],
        residual: (v) => v.n! - v.f! - 1 - v.b!,
        solve: {
          n: (v) => v.f! + 1 + v.b!,
          f: (v) => v.n! - 1 - v.b!,
          b: (v) => v.n! - 1 - v.f!,
        },
      },
    ],
    steps: {
      'f = p − 1': {
        f: {
          expr: '{p} − 1',
          how: 'Count the children in front of the picked child.',
          work: (v: Values) => (v.f! > 0 ? [`Count: ${countList(0, 1, v.f!)} → ${v.f}`] : []),
        },
        p: { expr: '{f} + 1', how: 'Count the children in front. The picked child is next.' },
      },
      'n = f + 1 + b': {
        n: {
          expr: '{f} + 1 + {b}',
          how: 'Count every child in the line.',
          work: (v: Values) => [`Count all: ${countList(0, 1, v.n!)} → ${v.n}`],
        },
        b: {
          expr: '{n} − 1 − {f}',
          how: 'Count the children behind the picked child.',
          work: (v: Values) => (v.b! > 0 ? [`Count: ${countList(0, 1, v.b!)} → ${v.b}`] : []),
        },
        f: {
          expr: '{n} − 1 − {b}',
          how: 'Count the children in front of the picked child.',
          work: (v: Values) => [
            `Take away the picked child: ${v.n} − 1 = ${v.n! - 1}`,
            `Take away the children behind: ${v.n! - 1} − ${v.b} = ${v.f}`,
          ],
        },
      },
    },
    example: { n: 7, p: 3, f: 2, b: 4 },
    startWith: ['n', 'p'],
    representation: { kind: 'lineUp', count: 'n', position: 'p', before: 'f', after: 'b' },
  },

  // Put shapes together: fill a hexagon with pattern blocks (K.G.6, 1.G.2).
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

  // ─── Grade 1 ───────────────────────────────────────────────────────────────
  // Order three lengths; compare two by using a third (1.MD.1).
  (() => {
    const ab = difference('x', 'a', 'b', {
      diff: 'Line up A and B. Count the cubes that stick out past the shorter one.',
      countOn: true,
      first: ['A is longer. Add the extra to B.', 'A is shorter. Take the extra away from B.'],
      second: ['A is longer. Take the extra away from A.', 'A is shorter. Add the extra to A.'],
    });
    const bc = difference('y', 'b', 'c', {
      diff: 'Line up B and C. Count the cubes that stick out past the shorter one.',
      countOn: true,
      first: ['B is longer. Add the extra to C.', 'B is shorter. Take the extra away from C.'],
      second: ['B is longer. Take the extra away from B.', 'B is shorter. Add the extra to B.'],
    });
    const mod: ModuleDef = {
      id: 'm.1.measure-nonstandard~order',
      title: 'Order three lengths',
      assumptions: [
        'Line up the ribbons at one end. The one that sticks out farthest is the longest.',
        'If A is longer than B, and B is longer than C, then A is longer than C.',
        'Type the lengths in any order. The picture puts them longest to shortest.',
      ],
      variables: [
        { ...whole('a', 'a', 'Ribbon A', 1, 15), unit: 'cubes' },
        { ...whole('b', 'b', 'Ribbon B', 1, 15), unit: 'cubes' },
        { ...whole('c', 'c', 'Ribbon C', 1, 15), unit: 'cubes' },
        { ...whole('x', 'x', 'Difference of A and B', 0, 14), unit: 'cubes' },
        { ...whole('y', 'y', 'Difference of B and C', 0, 14), unit: 'cubes' },
      ],
      relations: [ab.relation, bc.relation],
      steps: { ...ab.steps, ...bc.steps },
      example: { a: 9, b: 6, c: 4, x: 3, y: 2 },
      startWith: ['a', 'b', 'c'],
      representation: { kind: 'ruler', lengths: ['a', 'b', 'c'], extent: 15 },
      pictureLabels: ['x', 'y'],
    };
    return mod;
  })(),

  // Is it cut into halves? Equal and unequal parts (1.G.3).
  (() => {
    const mod: ModuleDef = {
      id: 'm.1.halves-fourths~equal-parts',
      title: 'Are the parts equal?',
      assumptions: [
        'Halves are 2 equal parts. Both parts are the same size.',
        'If one part is bigger, the parts are not halves.',
        'The strip is cut into 2 parts. The numbers show each part’s size.',
      ],
      variables: [
        whole('n', 'n', 'Whole strip', 2, 12),
        whole('x', 'x', 'First part', 0, 12),
        whole('y', 'y', 'Second part', 0, 12),
        whole('D', 'D', 'Difference', 0, 12),
      ],
      relations: [
        {
          id: 'x + y = n',
          display: '{x} + {y} = {n}',
          vars: ['x', 'y', 'n'],
          residual: (v) => v.x! + v.y! - v.n!,
          solve: { n: (v) => v.x! + v.y!, x: (v) => v.n! - v.y!, y: (v) => v.n! - v.x! },
        },
        equalParts.relation,
      ],
      steps: {
        'x + y = n': {
          n: { expr: '{x} + {y}', how: 'Put the two parts together.' },
          x: {
            expr: '{n} − {y}',
            how: 'Count up from the second part to the whole.',
            work: (v: Values) => countOn(v.y!, v.n!),
          },
          y: {
            expr: '{n} − {x}',
            how: 'Count up from the first part to the whole.',
            work: (v: Values) => countOn(v.x!, v.n!),
          },
        },
        [equalParts.relation.id]: {
          ...equalParts.steps[equalParts.relation.id],
          D: {
            ...equalParts.steps[equalParts.relation.id]!.D!,
            note: (v: Values) =>
              v.D === 0 ? '(equal parts: halves)' : '(not equal: these are not halves)',
          },
        },
      },
      example: { n: 8, x: 4, y: 4, D: 0 },
      startWith: ['n', 'x'],
      representation: { kind: 'tape', parts: ['x', 'y'], total: 'n' },
      pictureLabels: ['D'],
    };
    return mod;
  })(),

  // ─── Grade 2 ───────────────────────────────────────────────────────────────
  // Compare, then put together: a two-step problem (2.OA.1).
  {
    id: 'm.2.add-sub-100-fluency~compare-combine',
    title: 'Compare, then add',
    assumptions: [
      '“Ben has 3 more than Ana” means Ben has Ana’s amount + 3.',
      'Then add both amounts to find the total.',
      'Every amount stays within 100.',
    ],
    variables: [
      whole('a', 'a', 'How many Ana has', 0, 50),
      whole('d', 'd', 'How many more Ben has', 0, 50),
      whole('b', 'b', 'How many Ben has', 0, 100),
      whole('t', 't', 'Total', 0, 100),
    ],
    relations: [
      {
        id: 'b = a + d',
        display: '{b} = {a} + {d}',
        vars: ['b', 'a', 'd'],
        residual: (v) => v.b! - v.a! - v.d!,
        solve: { b: (v) => v.a! + v.d!, a: (v) => v.b! - v.d!, d: (v) => v.b! - v.a! },
      },
      {
        id: 't = a + b',
        display: '{t} = {a} + {b}',
        vars: ['t', 'a', 'b'],
        residual: (v) => v.t! - v.a! - v.b!,
        solve: { t: (v) => v.a! + v.b!, a: (v) => v.t! - v.b!, b: (v) => v.t! - v.a! },
      },
    ],
    steps: {
      'b = a + d': {
        b: {
          expr: '{a} + {d}',
          how: 'First: Ben has Ana’s amount and the extra.',
          work: (v: Values) => addStrategy(v.a!, v.d!),
        },
        a: {
          expr: '{b} − {d}',
          how: 'Ana has Ben’s amount without the extra.',
          work: (v: Values) => subtractStrategy(v.b!, v.d!),
        },
        d: {
          expr: '{b} − {a}',
          how: 'Count up from Ana’s amount to Ben’s.',
          work: (v: Values) => countOn(v.a!, v.b!),
        },
      },
      't = a + b': {
        t: {
          expr: '{a} + {b}',
          how: 'Then: add both amounts.',
          work: (v: Values) => addStrategy(v.a!, v.b!),
        },
        a: {
          expr: '{t} − {b}',
          how: 'Take Ben’s amount away from the total.',
          work: (v: Values) => subtractStrategy(v.t!, v.b!),
        },
        b: {
          expr: '{t} − {a}',
          how: 'Take Ana’s amount away from the total.',
          work: (v: Values) => subtractStrategy(v.t!, v.a!),
        },
      },
    },
    example: { a: 25, d: 8, b: 33, t: 58 },
    startWith: ['a', 'd'],
    representation: {
      kind: 'tape',
      compare: ['b', 'a'],
      difference: 'd',
      caption: 'Ben has {d} more than Ana. Total: {t}.',
    },
  },

  // Equal groups: circles with the same number in each (2.OA.4, before arrays).
  {
    id: 'm.2.arrays~equal-groups',
    title: 'Equal groups',
    assumptions: [
      'Every group has the same number of dots.',
      'Add the number in one group, once for each group: 3 groups of 4 is 4 + 4 + 4.',
      'Up to 5 groups of 5.',
    ],
    variables: [
      whole('g', 'g', 'Groups', 1, 5),
      whole('k', 'k', 'In each group', 1, 5),
      whole('n', 'n', 'Total', 1, 25),
    ],
    relations: [
      {
        id: 'n = g groups of k',
        check: (v) => repeated(v.k!, v.g!),
        display: '{n} = {g} groups of {k}',
        vars: ['n', 'g', 'k'],
        residual: (v) => v.n! - v.g! * v.k!,
        solve: { n: (v) => v.g! * v.k!, g: (v) => v.n! / v.k!, k: (v) => v.n! / v.g! },
      },
    ],
    steps: {
      'n = g groups of k': {
        n: {
          work: (v: Values) => [
            `Count by ${v.k}s: ${countList(0, v.k!, v.g!)}`,
            repeated(v.k!, v.g!),
          ],
          expr: '{g} groups of {k}',
          how: 'Skip count by the number in one group, once for each group.',
        },
        g: {
          work: (v: Values) => [
            `Count by ${v.k}s to ${v.n}: ${countList(0, v.k!, v.g!)} → ${v.g} groups`,
          ],
          expr: 'groups of {k} in {n}',
          how: 'Make groups of the same size until you use them all. Count the groups.',
        },
        k: {
          work: (v: Values) => dealLines(v.g!, v.k!, 'group'),
          expr: '{n} shared into {g} groups',
          how: 'Deal 1 dot to each group. Keep going until the dots are gone. Count one group.',
        },
      },
    },
    example: { g: 3, k: 4, n: 12 },
    startWith: ['g', 'k'],
    representation: { kind: 'equalGroups', groups: 'g', each: 'k', total: 'n' },
  },

  // Measure when the object doesn't start at 0: a broken ruler (2.MD.1, 2.MD.4).
  {
    id: 'm.2.standard-length~broken-ruler',
    title: 'Broken ruler',
    assumptions: [
      'The object doesn’t start at 0. It starts at another mark.',
      'Length = end mark − start mark.',
      'Count the spaces between marks, not the marks.',
    ],
    variables: [
      { ...whole('s', 's', 'Start mark', 0, 10), unit: 'cm' },
      { ...whole('L', 'L', 'Length', 1, 15), unit: 'cm' },
      { ...whole('e', 'e', 'End mark', 1, 25), unit: 'cm' },
    ],
    relations: [
      {
        id: 'e = s + L',
        display: '{e} = {s} + {L}',
        vars: ['e', 's', 'L'],
        residual: (v) => v.e! - v.s! - v.L!,
        solve: { e: (v) => v.s! + v.L!, s: (v) => v.e! - v.L!, L: (v) => v.e! - v.s! },
      },
    ],
    steps: {
      'e = s + L': {
        L: {
          expr: '{e} − {s}',
          how: 'Count the spaces from the start mark to the end mark.',
          work: (v: Values) => [`Count the spaces: ${countList(v.s!, 1, v.L!)} → ${v.L}`],
        },
        e: {
          expr: '{s} + {L}',
          how: 'Start at the start mark. Count on the length.',
          work: (v: Values) => addStrategy(v.s!, v.L!),
        },
        s: {
          expr: '{e} − {L}',
          how: 'Start at the end mark. Count back the length.',
          work: (v: Values) => subtractStrategy(v.e!, v.L!),
        },
      },
    },
    example: { s: 3, L: 7, e: 10 },
    startWith: ['s', 'e'],
    representation: { kind: 'ruler', lengths: ['L'], from: 's', to: 'e', extent: 15 },
  },

  // Measure the same object in feet and in inches (2.MD.2).
  {
    id: 'm.2.standard-length~two-units',
    title: 'Feet and inches',
    assumptions: [
      '1 foot is 12 inches.',
      'Feet are bigger, so you need fewer of them: 3 feet is 36 inches.',
      'Use whole feet.',
    ],
    variables: [
      { ...whole('f', 'f', 'Length in feet', 1, 5), unit: 'feet' },
      { ...whole('n', 'n', 'Length in inches', 12, 60), multipleOf: 12, step: 12, unit: 'inches' },
    ],
    relations: [
      {
        id: 'n = f feet of 12 inches',
        check: (v) => repeated(12, v.f!),
        display: '{n} inches = {f} feet of 12 inches',
        vars: ['n', 'f'],
        residual: (v) => v.n! - 12 * v.f!,
        solve: { n: (v) => 12 * v.f!, f: (v) => v.n! / 12 },
      },
    ],
    steps: {
      'n = f feet of 12 inches': {
        n: {
          work: (v: Values) => [`Count by 12s: ${countList(0, 12, v.f!)} → ${v.n} inches`],
          expr: '{f} feet of 12 inches',
          how: 'Each foot is 12 inches. Count by 12s, once for each foot.',
        },
        f: {
          work: (v: Values) => [`Count by 12s to ${v.n}: ${countList(0, 12, v.f!)} → ${v.f} feet`],
          expr: 'twelves in {n}',
          how: 'Count by 12s up to the inches. Count how many 12s.',
        },
      },
    },
    example: { f: 3, n: 36 },
    startWith: ['f'],
    representation: {
      kind: 'unitTiles',
      count: 'f',
      size: 12,
      total: 'n',
      names: { small: ['inch', 'inches'], big: ['foot', 'feet'] },
    },
  },

  // Bills: $10, $5 and $1 (2.MD.8).
  {
    id: 'm.2.money~bills',
    title: 'Count bills',
    assumptions: [
      'Count the bills worth the most first: $10s, then $5s, then $1s.',
      'A $10 bill is worth 10 dollars. A $5 bill is worth 5 dollars.',
    ],
    variables: [
      whole('t', 't', '$10 bills', 0, 5),
      whole('f', 'f', '$5 bills', 0, 5),
      whole('o', 'o', '$1 bills', 0, 9),
      { ...whole('D', 'T', 'Total', 0, 84), unit: '$' },
    ],
    relations: [
      {
        id: 'D = 10t + 5f + o',
        check: (v) => `${10 * v.t!} + ${5 * v.f!} + ${v.o} = ${v.D}`,
        display: '{D} = $10 bills ({t}) + $5 bills ({f}) + $1 bills ({o})',
        vars: ['D', 't', 'f', 'o'],
        residual: (v) => v.D! - 10 * v.t! - 5 * v.f! - v.o!,
        solve: {
          D: (v) => 10 * v.t! + 5 * v.f! + v.o!,
          t: (v) => (v.D! - 5 * v.f! - v.o!) / 10,
          f: (v) => (v.D! - 10 * v.t! - v.o!) / 5,
          o: (v) => v.D! - 10 * v.t! - 5 * v.f!,
        },
      },
    ],
    steps: {
      'D = 10t + 5f + o': {
        D: {
          expr: '$10 bills ({t}) + $5 bills ({f}) + $1 bills ({o})',
          how: 'Count the $10s by 10s. Count on the $5s by 5s, then the $1s by 1s.',
          work: (v: Values) => [
            ...billLines(v.t!, v.f!),
            ...addAll([10 * v.t!, 5 * v.f!, v.o!]).map((l) => l.replace(/(\d+)/g, '$$$1')),
          ],
        },
        t: {
          expr: '$10 bills in ({D} − $5 bills ({f}) − $1 bills ({o}))',
          how: 'Take away the $5s and $1s. Count the 10s in what is left.',
          work: (v: Values) => [
            ...billLines(0, v.f!),
            `$${v.D} − $${5 * v.f!} = $${v.D! - 5 * v.f!}`,
            `$${v.D! - 5 * v.f!} − $${v.o} = $${10 * v.t!}`,
            ...(v.t! > 0
              ? [`Count by 10s: ${countList(0, 10, v.t!)} → ${plural(v.t!, 'bill', 'bills')}`]
              : []),
          ],
        },
        f: {
          expr: '$5 bills in ({D} − $10 bills ({t}) − $1 bills ({o}))',
          how: 'Take away the $10s and $1s. Count the 5s in what is left.',
          work: (v: Values) => [
            ...billLines(v.t!, 0),
            `$${v.D} − $${10 * v.t!} = $${v.D! - 10 * v.t!}`,
            `$${v.D! - 10 * v.t!} − $${v.o} = $${5 * v.f!}`,
            ...(v.f! > 0
              ? [`Count by 5s: ${countList(0, 5, v.f!)} → ${plural(v.f!, 'bill', 'bills')}`]
              : []),
          ],
        },
        o: {
          expr: '{D} − $10 bills ({t}) − $5 bills ({f})',
          how: 'Take away the $10s and $5s. The rest is $1 bills.',
          work: (v: Values) => [
            ...billLines(v.t!, v.f!),
            `$${v.D} − $${10 * v.t!} = $${v.D! - 10 * v.t!}`,
            `$${v.D! - 10 * v.t!} − $${5 * v.f!} = $${v.o}`,
          ],
        },
      },
    },
    example: { t: 2, f: 1, o: 3, D: 28 },
    clearTo: { t: 0, f: 0, o: 0 },
    startWith: ['t', 'f', 'o'],
    representation: {
      kind: 'coins',
      coins: [
        { var: 't', cents: 1000, name: '$10 bills' },
        { var: 'f', cents: 500, name: '$5 bills' },
        { var: 'o', cents: 100, name: '$1 bills' },
      ],
      total: 'D',
      dollars: true,
    },
  },

  // Picture graph with four categories (2.MD.10).
  {
    id: 'm.2.graphs-line-plots~picture-graph',
    title: 'Picture graph',
    assumptions: [
      'Each picture stands for 1.',
      'Count the pictures in each column. Add all the columns for the total.',
    ],
    variables: [
      whole('a', 'a', 'Circles', 0, 10),
      whole('b', 'b', 'Squares', 0, 10),
      whole('c', 'c', 'Triangles', 0, 10),
      whole('e', 'e', 'Stars', 0, 10),
      whole('n', 'n', 'Total', 0, 40),
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
      'n = a + b + c + e': Object.fromEntries(
        (['n', 'a', 'b', 'c', 'e'] as const).map((x) => {
          const others = ['a', 'b', 'c', 'e'].filter((y) => y !== x);
          if (x === 'n') {
            return [
              'n',
              {
                expr: '{a} + {b} + {c} + {e}',
                how: 'Add the columns. Look for two that make a ten.',
                work: (v: Values) => addAll([v.a!, v.b!, v.c!, v.e!]),
              },
            ];
          }
          return [
            x,
            {
              expr: `{n} − ${others.map((y) => `{${y}}`).join(' − ')}`,
              how: 'Add the other columns. Take them away from the total.',
              work: (v: Values) => {
                const sum = others.reduce((p, y) => p + v[y]!, 0);
                const back = subtractStrategy(v.n!, sum);
                return [
                  ...addAll(others.map((y) => v[y]!)),
                  ...(back.length ? back : [`${v.n} − ${sum} = ${v[x]}`]),
                ];
              },
            },
          ];
        }),
      ),
    },
    example: { a: 6, b: 4, c: 3, e: 5, n: 18 },
    startWith: ['a', 'b', 'c', 'e'],
    representation: {
      kind: 'pictureGraph',
      columns: [
        { var: 'a', icon: 'circle' },
        { var: 'b', icon: 'square' },
        { var: 'c', icon: 'triangle' },
        { var: 'e', icon: 'star' },
      ],
      max: 10,
      total: 'n',
    },
  },

  // Faces, edges and corners of cubes and other prisms (2.G.1).
  {
    id: 'm.2.thirds-polygons~solids',
    title: 'Faces, edges and corners',
    assumptions: [
      'A face is a flat surface. An edge is where two faces meet. A corner is where edges meet.',
      'A cube has 6 square faces, 12 edges and 8 corners.',
      'A prism has a top and a bottom that match. Flat faces join them.',
    ],
    variables: [
      whole('s', 's', 'Sides of the top', 3, 6),
      whole('F', 'F', 'Faces', 5, 8),
      whole('E', 'E', 'Edges', 9, 18),
      whole('V', 'C', 'Corners', 6, 12),
    ],
    relations: [
      {
        id: 'F = s + 2',
        display: '{F} = {s} + 2',
        vars: ['F', 's'],
        residual: (v) => v.F! - v.s! - 2,
        solve: { F: (v) => v.s! + 2, s: (v) => v.F! - 2 },
      },
      {
        id: 'V = s + s',
        display: '{V} = {s} + {s}',
        vars: ['V', 's'],
        residual: (v) => v.V! - 2 * v.s!,
        solve: { V: (v) => 2 * v.s!, s: (v) => v.V! / 2 },
      },
      {
        id: 'E = s + s + s',
        display: '{E} = {s} + {s} + {s}',
        vars: ['E', 's'],
        residual: (v) => v.E! - 3 * v.s!,
        solve: { E: (v) => 3 * v.s!, s: (v) => v.E! / 3 },
      },
    ],
    steps: {
      'F = s + 2': {
        F: {
          expr: '{s} + 2',
          how: 'Count one face for each side of the top. Add the top and bottom.',
        },
        s: { expr: '{F} − 2', how: 'Take away the top and bottom faces.' },
      },
      'V = s + s': {
        V: { expr: '{s} + {s}', how: 'Count the corners on top and the corners on the bottom.' },
        s: {
          expr: 'half of {V}',
          how: 'Half the corners are on top.',
          work: (v: Values) => [`${v.s} + ${v.s} = ${v.V}, so half of ${v.V} is ${v.s}`],
        },
      },
      'E = s + s + s': {
        E: {
          expr: '{s} + {s} + {s}',
          how: 'Count the edges on the top, on the bottom, and going up.',
          work: (v: Values) => sumSteps([v.s!, v.s!, v.s!]),
        },
        s: {
          expr: 'a third of {E}',
          how: 'The edges come in 3 equal sets: top, bottom and going up.',
          work: (v: Values) => [
            `Count by 3s to ${v.E}: ${countList(0, 3, v.s!)} → ${v.s} in each set`,
          ],
        },
      },
    },
    example: { s: 4, F: 6, E: 12, V: 8 },
    startWith: ['s'],
    representation: { kind: 'prism', sides: 's', faces: 'F', edges: 'E', corners: 'V' },
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
        whole('D', 'D', 'Difference', 0, 20),
      ],
      relations: [
        {
          id: 'D = difference of the sides',
          display: '{D} = difference of ({a} − {b}) and ({c} + {d})',
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

  // One less and ten less on the 120 chart (1.NBT.1, 1.NBT.5).
  {
    id: 'm.1.count-120~less',
    title: 'One less, ten less',
    assumptions: [
      'One less is the number just before.',
      'Ten less is one row up on the chart. The ones digit stays the same.',
    ],
    variables: [
      whole('n', 'n', 'Number', 10, 120),
      whole('u', 'u', 'One less', 9, 119),
      whole('v', 'v', 'Ten less', 0, 110),
    ],
    relations: [
      {
        id: 'u = n − 1',
        display: '{u} = {n} − 1',
        vars: ['u', 'n'],
        residual: (v) => v.u! - v.n! + 1,
        solve: { u: (v) => v.n! - 1, n: (v) => v.u! + 1 },
      },
      {
        id: 'v = n − 10',
        display: '{v} = {n} − 10',
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

  // Tens and ones with more than 9 ones: 2 tens 17 ones = 37 (1.NBT.2).
  {
    id: 'm.1.tens-ones~regroup',
    title: 'Trade ones for tens',
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
              ? [`${v.o} ones = ${Math.floor(v.o! / 10)} ten and ${v.o! % 10} ones`]
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
      groups: ['n'],
      controls: [
        { var: 't', steps: [1] },
        { var: 'o', steps: [1] },
      ],
    },
  },

  // How much more money is needed (2.MD.8).
  {
    id: 'm.2.money~more-needed',
    title: 'How much more money?',
    assumptions: [
      'Price = money you have + money you still need.',
      'Count up from the money you have to the price.',
      'Type money in cents: $1.25 is 125¢.',
    ],
    variables: [
      { ...whole('P', 'P', 'Price', 0, 1000), unit: '¢' },
      { ...whole('H', 'H', 'Money you have', 0, 1000), unit: '¢' },
      { ...whole('M', 'M', 'Still needed', 0, 1000), unit: '¢' },
    ],
    relations: [
      {
        id: 'P = H + M',
        display: '{P} = {H} + {M}',
        vars: ['P', 'H', 'M'],
        residual: (v) => v.P! - v.H! - v.M!,
        solve: { P: (v) => v.H! + v.M!, H: (v) => v.P! - v.M!, M: (v) => v.P! - v.H! },
      },
    ],
    steps: {
      'P = H + M': {
        M: {
          expr: '{P} − {H}',
          how: 'Count up from the money you have to the price.',
          work: (v: Values) => countUp(v.H!, v.P!, '¢'),
          note: (v: Values) => `(${dollars(v.M!)})`,
        },
        H: {
          expr: '{P} − {M}',
          how: 'Take the money you still need away from the price.',
          work: (v: Values) => subtractStrategy(v.P!, v.M!, '¢'),
          note: (v: Values) => `(${dollars(v.H!)})`,
        },
        P: {
          expr: '{H} + {M}',
          how: 'Add the money you have and the money you still need.',
          work: (v: Values) => addStrategy(v.H!, v.M!, '¢'),
          note: (v: Values) => `(${dollars(v.P!)})`,
        },
      },
    },
    example: { H: 65, M: 35, P: 100 },
    startWith: ['P', 'H'],
    representation: { kind: 'tape', parts: ['H', 'M'], total: 'P' },
  },

  twoStep('take-add', 'Take away, then add', -1, 1, { s: 50, a: 15, m: 35, b: 20, e: 55 }),
  twoStep('take-take', 'Take away twice', -1, -1, { s: 60, a: 18, m: 42, b: 25, e: 17 }),
  twoStep('add-add', 'Add twice', 1, 1, { s: 24, a: 18, m: 42, b: 35, e: 77 }),

  // Kindergarten take-away stories: start, take away, left (K.OA.2).
  {
    id: 'm.K.add-sub-10~take-away',
    title: 'Take away',
    assumptions: [
      'Start with some. Take some away. Count how many are left.',
      'Fewer are left than you started with.',
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
];

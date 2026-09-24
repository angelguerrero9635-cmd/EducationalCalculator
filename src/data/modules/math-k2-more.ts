/**
 * Section 1 modules added from the second review round: the deferred problem types and the
 * two new Kindergarten skills (position words, composing shapes).
 */
import type { Values } from '@/engine/types';

import { difference, whole } from './math-k2';
import type { ModuleDef } from './types';
import { addStrategy, countList, countUp, repeated, subtractStrategy } from './work';

/** "Count on from 4: 5, 6, 7 → 3" (K–1 counting on from one part to the whole). */
const countOn = (from: number, to: number) =>
  to > from ? [`Count on from ${from}: ${countList(from, 1, to - from)} → ${to - from}`] : [];

const capacity = difference('d', 'a', 'b', {
  diff: 'Match the cups one to one. Count the extra cups.',
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
          how: 'Put the two parts together. Count them all.',
          work: (v: Values) => countOn(v.a!, v.w!),
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
      'If they take the same number of cups, they hold the same.',
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
      whole('f', 'f', 'In front', 0, 9),
      whole('b', 'b', 'Behind', 0, 9),
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
          how: 'Count the children in front of the dark child.',
          work: (v: Values) => (v.f! > 0 ? [`Count: ${countList(0, 1, v.f!)} → ${v.f}`] : []),
        },
        p: { expr: '{f} + 1', how: 'Count the children in front. The dark child is next.' },
      },
      'n = f + 1 + b': {
        n: {
          expr: '{f} + 1 + {b}',
          how: 'Count the children in front, the dark child, and the children behind.',
          work: (v: Values) => [`Count all: ${countList(0, 1, v.n!)} → ${v.n}`],
        },
        b: {
          expr: '{n} − 1 − {f}',
          how: 'Count the children behind the dark child.',
          work: (v: Values) =>
            v.b! > 0 ? [`Count: ${countList(v.f! + 1, 1, v.b!)} → ${v.b}`] : [],
        },
        f: {
          expr: '{n} − 1 − {b}',
          how: 'Count the children in front of the dark child.',
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
      'Fill the hexagon with no gaps and no overlaps.',
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
          expr: '6 − {z} trapezoids − {r} rhombuses',
          how: 'Count the empty triangle spaces. Put a triangle in each one.',
          work: (v: Values) => [
            `Covered: ${3 * v.z!} + ${2 * v.r!} = ${3 * v.z! + 2 * v.r!} triangles`,
            `Empty: 6 − ${3 * v.z! + 2 * v.r!} = ${v.t}`,
          ],
        },
        r: {
          expr: 'rhombuses in (6 − {z} trapezoids − {t} triangles)',
          how: 'Each rhombus fills 2 triangle spaces. Count by 2s.',
          work: (v: Values) => [
            `Covered: ${3 * v.z!} + ${v.t} = ${3 * v.z! + v.t!} triangles`,
            `Empty: 6 − ${3 * v.z! + v.t!} = ${2 * v.r!}`,
            ...(v.r! > 0 ? [`Count by 2s: ${countList(0, 2, v.r!)} → ${v.r} rhombuses`] : []),
          ],
        },
        z: {
          expr: 'trapezoids in (6 − {r} rhombuses − {t} triangles)',
          how: 'Each trapezoid fills 3 triangle spaces (half the hexagon).',
          work: (v: Values) => [
            `Covered: ${2 * v.r!} + ${v.t} = ${2 * v.r! + v.t!} triangles`,
            `Empty: 6 − ${2 * v.r! + v.t!} = ${3 * v.z!}`,
            ...(v.z! > 0 ? [`Count by 3s: ${countList(0, 3, v.z!)} → ${v.z} trapezoids`] : []),
          ],
        },
      },
    },
    example: { z: 1, r: 1, t: 1 },
    startWith: ['z', 'r'],
    representation: { kind: 'patternBlocks', trapezoids: 'z', rhombuses: 'r', triangles: 't' },
  },

  // Shapes that are stretched or tipped keep their name (K.G.2, 1.G.1).
  {
    id: 'm.K.shapes-2d-3d~any-shape',
    title: 'Shapes that look different',
    assumptions: [
      'A shape can be long, thin or tipped over. It keeps its name.',
      'Count the sides to name it: 3 sides is a triangle, 4 sides is a quadrilateral.',
      'Each side ends at a corner.',
    ],
    variables: [whole('s', 's', 'Sides', 3, 6), whole('v', 'c', 'Corners', 3, 6)],
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
          how: 'Put a finger on each corner and count. There is one corner for each side.',
        },
        s: {
          expr: '{v}',
          how: 'Trace each side and count. There is one side for each corner.',
        },
      },
    },
    example: { s: 4, v: 4 },
    startWith: ['s'],
    representation: { kind: 'polygon', sides: 's', corners: 'v', irregular: true },
  },

  // ─── Grade 1 ───────────────────────────────────────────────────────────────
  // Order three lengths; compare two by using a third (1.MD.1).
  {
    id: 'm.1.measure-nonstandard~order',
    title: 'Order three lengths',
    assumptions: [
      'Line up the ribbons at one end, longest to shortest: red, blue, green.',
      'If red is longer than blue, and blue is longer than green, red is longer than green.',
      'Red is longer than green by both extras together.',
    ],
    variables: [
      { ...whole('a', 'a', 'Red', 1, 15), unit: 'cubes' },
      { ...whole('b', 'b', 'Blue', 1, 15), unit: 'cubes' },
      { ...whole('c', 'c', 'Green', 1, 15), unit: 'cubes' },
      { ...whole('x', 'x', 'Red longer than blue', 0, 14), unit: 'cubes' },
      { ...whole('y', 'y', 'Blue longer than green', 0, 14), unit: 'cubes' },
      { ...whole('z', 'z', 'Red longer than green', 0, 14), unit: 'cubes' },
    ],
    relations: [
      {
        id: 'x = a − b',
        display: '{x} = {a} − {b}',
        vars: ['x', 'a', 'b'],
        residual: (v) => v.x! - v.a! + v.b!,
        solve: { x: (v) => v.a! - v.b!, a: (v) => v.b! + v.x!, b: (v) => v.a! - v.x! },
      },
      {
        id: 'y = b − c',
        display: '{y} = {b} − {c}',
        vars: ['y', 'b', 'c'],
        residual: (v) => v.y! - v.b! + v.c!,
        solve: { y: (v) => v.b! - v.c!, b: (v) => v.c! + v.y!, c: (v) => v.b! - v.y! },
      },
      {
        id: 'z = x + y',
        display: '{z} = {x} + {y}',
        vars: ['z', 'x', 'y'],
        residual: (v) => v.z! - v.x! - v.y!,
        solve: { z: (v) => v.x! + v.y!, x: (v) => v.z! - v.y!, y: (v) => v.z! - v.x! },
      },
    ],
    steps: {
      'x = a − b': {
        x: {
          expr: '{a} − {b}',
          how: 'Count the red cubes that stick out past blue.',
          work: (v: Values) => countOn(v.b!, v.a!),
        },
        a: { expr: '{b} + {x}', how: 'Red is blue plus the extra.' },
        b: { expr: '{a} − {x}', how: 'Blue is red without the extra.' },
      },
      'y = b − c': {
        y: {
          expr: '{b} − {c}',
          how: 'Count the blue cubes that stick out past green.',
          work: (v: Values) => countOn(v.c!, v.b!),
        },
        b: { expr: '{c} + {y}', how: 'Blue is green plus the extra.' },
        c: { expr: '{b} − {y}', how: 'Green is blue without the extra.' },
      },
      'z = x + y': {
        z: {
          expr: '{x} + {y}',
          how: 'Red sticks out past blue, and blue sticks out past green. Add both extras.',
        },
        x: { expr: '{z} − {y}', how: 'Take the blue extra away from the red extra.' },
        y: { expr: '{z} − {x}', how: 'Take the red-past-blue extra away.' },
      },
    },
    example: { a: 9, b: 6, c: 4, x: 3, y: 2, z: 5 },
    startWith: ['a', 'b', 'c'],
    representation: { kind: 'ruler', lengths: ['a', 'b', 'c'], extent: 15 },
  },

  // Compare, then put together (1.OA.1, 2.OA.1).
  {
    id: 'm.1.add-sub-20~compare-combine',
    title: 'Compare, then add',
    assumptions: [
      '“Ben has 3 more than Ana” means Ben has Ana’s amount + 3.',
      'Then add both amounts to find how many in all.',
      'All numbers are 0 to 20.',
    ],
    variables: [
      whole('a', 'a', 'Ana', 0, 10),
      whole('d', 'd', 'How many more Ben has', 0, 10),
      whole('b', 'b', 'Ben', 0, 20),
      whole('t', 't', 'In all', 0, 20),
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
    example: { a: 5, d: 3, b: 8, t: 13 },
    startWith: ['a', 'd'],
    representation: { kind: 'tape', compare: ['b', 'a'], difference: 'd' },
  },

  // Is it cut into halves? Equal and unequal parts (1.G.3).
  (() => {
    const mod: ModuleDef = {
      id: 'm.1.halves-fourths~equal-parts',
      title: 'Are the parts equal?',
      assumptions: [
        'Halves are 2 equal parts: both parts are the same size.',
        'If one part is bigger, the parts are not halves.',
        'The strip is cut into 2 parts. The squares show each part’s size.',
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
            how: 'Take the second part away from the whole.',
            work: (v: Values) => countUp(v.y!, v.n!),
          },
          y: {
            expr: '{n} − {x}',
            how: 'Take the first part away from the whole.',
            work: (v: Values) => countUp(v.x!, v.n!),
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
    };
    return mod;
  })(),

  // ─── Grade 2 ───────────────────────────────────────────────────────────────
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
      whole('n', 'n', 'In all', 1, 25),
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
          how: 'Make groups of the same size until all are used. Count the groups.',
        },
        k: {
          work: (v: Values) => [`Try ${v.k} in each group: ${repeated(v.k!, v.g!)} ✓`],
          expr: '{n} shared into {g} groups',
          how: 'Deal 1 dot to each group, again and again, until all are used. Count one group.',
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
      'The object doesn’t start at 0. Count the spaces from one end to the other.',
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
      'A bigger unit: you need fewer of them. 3 feet is 36 inches.',
      'Use whole feet.',
    ],
    variables: [
      whole('f', 'f', 'Feet', 1, 5),
      { ...whole('n', 'n', 'Inches', 12, 60), multipleOf: 12, step: 12 },
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
      'Count $10 bills by 10s and $5 bills by 5s. Count on $1 bills by 1s.',
    ],
    variables: [
      whole('t', 't', '$10 bills', 0, 5),
      whole('f', 'f', '$5 bills', 0, 5),
      whole('o', 'o', '$1 bills', 0, 9),
      { ...whole('D', 'D', 'Total', 0, 84), unit: '$' },
    ],
    relations: [
      {
        id: 'D = 10t + 5f + o',
        check: (v) => `${10 * v.t!} + ${5 * v.f!} + ${v.o} = ${v.D}`,
        display: '{D} = {t} tens + {f} fives + {o} ones',
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
          expr: '{t} tens + {f} fives + {o} ones',
          how: 'Count the $10s by 10s. Count on the $5s by 5s, then the $1s by 1s.',
          work: (v: Values) => [
            ...(v.t! > 0 ? [`$10 bills: ${countList(0, 10, v.t!)} → $${10 * v.t!}`] : []),
            ...(v.f! > 0 ? [`$5 bills: ${countList(0, 5, v.f!)} → $${5 * v.f!}`] : []),
            `$${10 * v.t!} + $${5 * v.f!} + $${v.o} = $${v.D}`,
          ],
        },
        t: {
          expr: 'tens in ({D} − {f} fives − {o} ones)',
          how: 'Take away the $5s and $1s. Count the 10s in what is left.',
          work: (v: Values) => [
            `$${v.D} − $${5 * v.f!} − $${v.o} = $${10 * v.t!}`,
            ...(v.t! > 0 ? [`Count by 10s: ${countList(0, 10, v.t!)} → ${v.t} bills`] : []),
          ],
        },
        f: {
          expr: 'fives in ({D} − {t} tens − {o} ones)',
          how: 'Take away the $10s and $1s. Count the 5s in what is left.',
          work: (v: Values) => [
            `$${v.D} − $${10 * v.t!} − $${v.o} = $${5 * v.f!}`,
            ...(v.f! > 0 ? [`Count by 5s: ${countList(0, 5, v.f!)} → ${v.f} bills`] : []),
          ],
        },
        o: {
          expr: '{D} − {t} tens − {f} fives',
          how: 'Take away the $10s and $5s. The rest is $1 bills.',
          work: (v: Values) => [`$${v.D} − $${10 * v.t!} − $${5 * v.f!} = $${v.o}`],
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
                work: (v: Values) => {
                  const xs = [v.a!, v.b!, v.c!, v.e!];
                  return xs.slice(1).map((_, i) => {
                    const acc = xs.slice(0, i + 1).reduce((p, q) => p + q, 0);
                    return `${acc} + ${xs[i + 1]} = ${acc + xs[i + 1]!}`;
                  });
                },
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
                return [
                  `${others.map((y) => v[y]).join(' + ')} = ${sum}`,
                  `${v.n} − ${sum} = ${v[x]}`,
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
      'A face is a flat side. An edge is where two faces meet. A corner is where edges meet.',
      'A cube has 6 square faces, 12 edges and 8 corners.',
      'A prism has a top and a bottom that match, with straight sides between them.',
    ],
    variables: [
      whole('s', 's', 'Sides of the top', 3, 6),
      whole('F', 'F', 'Faces', 5, 8),
      whole('E', 'E', 'Edges', 9, 18),
      whole('V', 'V', 'Corners', 6, 12),
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
        F: { expr: '{s} + 2', how: 'One face for each side of the top, plus the top and bottom.' },
        s: { expr: '{F} − 2', how: 'Take away the top and bottom faces.' },
      },
      'V = s + s': {
        V: { expr: '{s} + {s}', how: 'Count the corners on top and the corners on the bottom.' },
        s: { expr: 'half of {V}', how: 'Half the corners are on top.' },
      },
      'E = s + s + s': {
        E: {
          expr: '{s} + {s} + {s}',
          how: 'Count the edges around the top, around the bottom, and going up the sides.',
        },
        s: { expr: 'a third of {E}', how: 'The edges come in 3 equal sets: top, bottom, sides.' },
      },
    },
    example: { s: 4, F: 6, E: 12, V: 8 },
    startWith: ['s'],
    representation: { kind: 'prism', sides: 's', faces: 'F', edges: 'E', corners: 'V' },
  },
];

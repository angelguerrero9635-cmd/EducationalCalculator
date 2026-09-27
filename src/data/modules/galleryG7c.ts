/**
 * Gallery demos for the Grade 7 geometry and chance pictures: angle pairs (vertical,
 * supplementary, complementary). Spread into GALLERY_MODULES in gallery.ts; kept apart so that
 * file's other demos merge easily.
 */
import type { Values } from '@/engine/types';

import { diceCount } from '@/components/module/reps/dice';

import { whole } from './helpers';
import type { ModuleDef } from './types';

/** A length in centimeters. */
const cm = (id: string, name: string) => ({
  id,
  symbol: id,
  name,
  unit: 'cm',
  min: 0.1,
  max: 100,
  step: 0.1,
});

/** A worked-out area or volume in cm² or cm³. */
const worked = (id: string, name: string, unit: 'cm²' | 'cm³') => ({
  id,
  symbol: id,
  name,
  unit,
  min: 0,
  max: 1000000,
  derived: true,
});

/** x = f(v), worked out only (its inputs are not solved back from it). */
function derive(
  id: string,
  x: string,
  inputs: string[],
  display: string,
  f: (v: Values) => number,
) {
  return {
    id,
    display,
    vars: [x, ...inputs],
    residual: (v: Values) => v[x]! - f(v),
    solve: {
      [x]: f,
      ...Object.fromEntries(inputs.map((i) => [i, () => undefined])),
    },
  };
}

/** A value no bigger than another (a sample inside its population). */
const atMost = (small: string, big: string) => ({
  id: `${small} ≤ ${big}`,
  constraint: true as const,
  display: `{${small}} is at most {${big}}`,
  vars: [small, big],
  residual: (v: Values) => (v[small]! <= v[big]! ? 0 : 1),
  solve: {},
});

/** The plane stays on the solid: `at` from 0 to the height. */
const onSolid = (at: string, reach: string) => ({
  id: `${at} ≤ ${reach}`,
  constraint: true as const,
  display: `{${at}} is at most {${reach}}`,
  vars: [at, reach],
  residual: (v: Values) => (v[at]! <= v[reach]! ? 0 : 1),
  solve: {},
});

/** An angle in whole degrees. */
const degrees = (id: string, name: string, max = 180) => ({
  ...whole(id, id, name, 0, max),
  unit: '°',
});

/** a + b = whole (90 or 180): each part is the whole less the other. */
function pair(whole: 90 | 180, what: string) {
  const id = `a + b = ${whole}`;
  return {
    relation: {
      id,
      display: `{a} + {b} = ${whole}`,
      vars: ['a', 'b'],
      residual: (v: Values) => v.a! + v.b! - whole,
      solve: {
        a: (v: Values) => whole - v.b!,
        b: (v: Values) => whole - v.a!,
      },
    },
    steps: {
      [id]: {
        a: { expr: `${whole} − {b}`, how: `${what} Take the other angle away from ${whole}°.` },
        b: { expr: `${whole} − {a}`, how: `${what} Take the other angle away from ${whole}°.` },
      },
    },
  };
}

const straight = pair(180, 'The two angles make a straight line.');
const right = pair(90, 'The two angles make a right angle.');

export const G7C_GALLERY_MODULES: ModuleDef[] = [
  (() => {
    /** The pairs of two dice with a sum of s, as a list ("1 + 6, 2 + 5, …"). */
    const pairs = (s: number) =>
      [1, 2, 3, 4, 5, 6].filter((a) => s - a >= 1 && s - a <= 6).map((a) => `${a} + ${s - a}`);
    return {
      id: 'g.two-dice',
      title: 'Two dice',
      assumptions: [
        'Each die is fair: every face is as likely as any other.',
        'The 36 pairs of faces are equally likely.',
      ],
      variables: [
        whole('s', 's', 'Sum', 2, 12),
        { ...whole('k', 'k', 'Pairs with that sum', 0, 36), derived: true },
        { id: 'P', symbol: 'P', name: 'Chance of that sum', min: 0, max: 1, derived: true },
      ],
      relations: [
        {
          ...derive('k = pairs with sum s', 'k', ['s'], 'pairs with a sum of {s}: {k}', (v) =>
            diceCount('sum', '=', v.s!),
          ),
          // The pairs counted in the grid (listed in the step's work).
          check: (v: Values) => `${pairs(v.s!).length} = ${v.k}`,
        },
        derive('P = k ÷ 36', 'P', ['k'], '{k} ÷ 36 = {P}', (v) => v.k! / 36),
      ],
      steps: {
        'k = pairs with sum s': {
          k: {
            expr: (v: Values) => `${pairs(v.s!).length}`,
            how: 'Count the cells of the grid that show the sum.',
            work: (v: Values) => [pairs(v.s!).join(', ')],
            written: false,
          },
        },
        'P = k ÷ 36': {
          P: {
            expr: '{k} ÷ 36',
            how: 'The pairs with the sum out of all 36 equally likely pairs.',
          },
        },
      },
      example: { s: 7, k: 6, P: 1 / 6 },
      startWith: ['s'],
      representation: { kind: 'diceGrid', target: 's', count: 'k', chance: 'P' },
    } satisfies ModuleDef;
  })(),
  {
    id: 'g.spinner',
    title: 'A spinner',
    assumptions: [
      'The spinner is cut into equal sectors.',
      'The arrow is as likely to stop in any sector as any other.',
    ],
    variables: [
      whole('r', 'r', 'Red sectors', 0, 12),
      whole('b', 'b', 'Blue sectors', 0, 12),
      whole('y', 'y', 'Yellow sectors', 0, 12),
      whole('n', 'n', 'Sectors in all', 1, 24),
      { id: 'P', symbol: 'P', name: 'Chance of red', min: 0, max: 1, derived: true },
    ],
    relations: [
      {
        id: 'n = r + b + y',
        display: '{r} + {b} + {y} = {n}',
        vars: ['n', 'r', 'b', 'y'],
        residual: (v: Values) => v.n! - v.r! - v.b! - v.y!,
        solve: {
          n: (v: Values) => v.r! + v.b! + v.y!,
          r: (v: Values) => v.n! - v.b! - v.y!,
          b: (v: Values) => v.n! - v.r! - v.y!,
          y: (v: Values) => v.n! - v.r! - v.b!,
        },
      },
      derive('P = r ÷ n', 'P', ['r', 'n'], '{r} ÷ {n} = {P}', (v) => v.r! / v.n!),
    ],
    steps: {
      'n = r + b + y': {
        n: { expr: '{r} + {b} + {y}', how: 'Add the sectors of every color.' },
        r: { expr: '{n} − {b} − {y}', how: 'Take the blue and yellow sectors from all of them.' },
        b: { expr: '{n} − {r} − {y}', how: 'Take the red and yellow sectors from all of them.' },
        y: { expr: '{n} − {r} − {b}', how: 'Take the red and blue sectors from all of them.' },
      },
      'P = r ÷ n': {
        P: { expr: '{r} ÷ {n}', how: 'The red sectors out of all the equal sectors.' },
      },
    },
    example: { r: 3, b: 4, y: 1, n: 8, P: 0.375 },
    startWith: ['r', 'b', 'y'],
    representation: {
      kind: 'spinner',
      parts: ['r', 'b', 'y'],
      colors: ['red', 'blue', 'yellow'],
      chance: 'P',
      total: 'n',
    },
  },
  (() => {
    // Two samples of eight: minutes read last night in two classes.
    const A = ['a1', 'a2', 'a3', 'a4', 'a5', 'a6', 'a7', 'a8'];
    const B = ['b1', 'b2', 'b3', 'b4', 'b5', 'b6', 'b7', 'b8'];
    const mean = (ids: string[]) => (v: Values) =>
      ids.reduce((t, id) => t + v[id]!, 0) / ids.length;
    const sum = (ids: string[]) => ids.map((id) => `{${id}}`).join(' + ');
    const worked = (id: string, name: string) => ({
      id,
      symbol: id,
      name,
      min: 0,
      max: 60,
      derived: true,
    });
    return {
      id: 'g.two-samples',
      title: 'Two samples compared',
      assumptions: [
        'Each class is a random sample of its grade. Times are in minutes.',
        'The mean is the balance point of a dot plot.',
      ],
      variables: [
        ...A.map((id, i) => ({
          ...whole(id, id, `Class A, student ${i + 1}`, 0, 60),
        })),
        ...B.map((id, i) => ({
          ...whole(id, id, `Class B, student ${i + 1}`, 0, 60),
        })),
        worked('P', 'Mean of class A'),
        worked('Q', 'Mean of class B'),
        worked('d', 'Difference of the means'),
      ],
      relations: [
        derive('P = mean of A', 'P', A, `(${sum(A)}) ÷ 8 = {P}`, mean(A)),
        derive('Q = mean of B', 'Q', B, `(${sum(B)}) ÷ 8 = {Q}`, mean(B)),
        {
          ...derive('d = |Q − P|', 'd', ['P', 'Q'], 'the gap from {P} to {Q} = {d}', (v) =>
            Math.abs(v.Q! - v.P!),
          ),
          // The bigger mean less the smaller, as a number sentence the check can read.
          check: (v: Values) => `${Math.max(v.P!, v.Q!)} − ${Math.min(v.P!, v.Q!)} = ${v.d}`,
        },
      ],
      steps: {
        'P = mean of A': {
          P: {
            expr: `(${sum(A)}) ÷ 8`,
            how: 'Add the eight times in class A and share them out evenly.',
          },
        },
        'Q = mean of B': {
          Q: {
            expr: `(${sum(B)}) ÷ 8`,
            how: 'Add the eight times in class B and share them out evenly.',
          },
        },
        'd = |Q − P|': {
          d: {
            expr: (v: Values) => (v.Q! >= v.P! ? '{Q} − {P}' : '{P} − {Q}'),
            how: 'Take the smaller mean from the bigger one.',
          },
        },
      },
      example: {
        a1: 10,
        a2: 15,
        a3: 15,
        a4: 20,
        a5: 20,
        a6: 20,
        a7: 25,
        a8: 35,
        b1: 20,
        b2: 25,
        b3: 30,
        b4: 30,
        b5: 30,
        b6: 35,
        b7: 40,
        b8: 46,
        P: 20,
        Q: 32,
        d: 12,
      },
      startWith: [...A, ...B],
      representation: {
        kind: 'dotPlot',
        data: A,
        min: 0,
        max: 50,
        mean: 'P',
        second: { data: B, mean: 'Q' },
        labels: ['Class A', 'Class B'],
        difference: 'd',
      },
    } satisfies ModuleDef;
  })(),
  {
    id: 'g.random-sample',
    title: 'A random sample',
    assumptions: [
      'Every student is as likely as any other to be picked.',
      'The sample shows about the same share as the whole school.',
    ],
    variables: [
      whole('N', 'N', 'Students in the school', 1, 400),
      whole('n', 'n', 'Students in the sample', 1, 400),
      whole('k', 'k', 'Sample who walk to school', 0, 400),
      whole('T', 'T', 'Whole school who walk', 0, 400),
      {
        id: 'E',
        symbol: 'E',
        name: 'Estimate for the school',
        min: 0,
        max: 400,
        derived: true,
      },
    ],
    relations: [
      atMost('n', 'N'),
      atMost('k', 'n'),
      atMost('T', 'N'),
      atMost('k', 'T'),
      {
        // The sample's others (who don't walk) come from the school's others.
        id: 'n − k ≤ N − T',
        constraint: true,
        display: '{n} − {k} is at most {N} − {T}',
        vars: ['n', 'k', 'N', 'T'],
        residual: (v: Values) => (v.n! - v.k! <= v.N! - v.T! ? 0 : 1),
        solve: {},
      },
      derive(
        'E = k ÷ n × N',
        'E',
        ['k', 'n', 'N'],
        '{k} ÷ {n} × {N} = {E}',
        (v) => (v.k! / v.n!) * v.N!,
      ),
    ],
    steps: {
      'n ≤ N': {},
      'k ≤ n': {},
      'T ≤ N': {},
      'k ≤ T': {},
      'n − k ≤ N − T': {},
      'E = k ÷ n × N': {
        E: {
          expr: '{k} ÷ {n} × {N}',
          how: 'The share who walk in the sample, times everyone in the school.',
        },
      },
    },
    example: { N: 200, n: 20, k: 6, T: 64, E: 60 },
    startWith: ['N', 'n', 'k', 'T'],
    standalone: {
      vars: ['T'],
      why: 'The whole school is what the sample estimates; the picture colors it so a new sample can be drawn.',
    },
    representation: {
      kind: 'sample',
      population: 'N',
      size: 'n',
      found: 'k',
      trait: 'T',
      estimate: 'E',
      labels: ['walk', 'do not'],
    },
  },
  {
    id: 'g.prism-cross-section',
    title: 'Cross-section of a prism',
    assumptions: [
      'The plane cuts parallel to the base.',
      'A prism has the same cross-section all the way up.',
    ],
    variables: [
      cm('l', 'Length'),
      cm('w', 'Width'),
      cm('h', 'Height'),
      cm('a', 'Cut height'),
      worked('B', 'Base area', 'cm²'),
      worked('V', 'Volume', 'cm³'),
    ],
    relations: [
      onSolid('a', 'h'),
      derive('B = l × w', 'B', ['l', 'w'], '{l} × {w} = {B}', (v) => v.l! * v.w!),
      derive('V = B × h', 'V', ['B', 'h'], '{B} × {h} = {V}', (v) => v.B! * v.h!),
    ],
    steps: {
      'a ≤ h': {},
      'B = l × w': {
        B: { expr: '{l} × {w}', how: 'The cut is the base: a rectangle, length times width.' },
      },
      'V = B × h': {
        V: { expr: '{B} × {h}', how: 'Stack the base area up the height: base area times height.' },
      },
    },
    example: { l: 6, w: 4, h: 5, a: 2, B: 24, V: 120 },
    startWith: ['l', 'w', 'h', 'a'],
    standalone: {
      vars: ['a'],
      why: 'Where the plane cuts does not change the cut: a prism is the same all the way up.',
    },
    representation: {
      kind: 'crossSection',
      solid: 'box',
      length: 'l',
      width: 'w',
      height: 'h',
      at: 'a',
      area: 'B',
      volume: 'V',
    },
  },
  {
    id: 'g.triangular-prism-volume',
    title: 'Volume of a triangular prism',
    assumptions: [
      'The prism stands on a right triangle.',
      'The height is straight up from the base.',
    ],
    variables: [
      cm('l', 'First leg'),
      cm('w', 'Second leg'),
      cm('h', 'Height'),
      cm('a', 'Cut distance'),
      worked('B', 'Base area', 'cm²'),
      worked('V', 'Volume', 'cm³'),
    ],
    relations: [
      onSolid('a', 'h'),
      derive('B = lw/2', 'B', ['l', 'w'], '{l} × {w} ÷ 2 = {B}', (v) => (v.l! * v.w!) / 2),
      derive('V = B × h', 'V', ['B', 'h'], '{B} × {h} = {V}', (v) => v.B! * v.h!),
    ],
    steps: {
      'a ≤ h': {},
      'B = lw/2': {
        B: { expr: '{l} × {w} ÷ 2', how: 'The base is a right triangle: half of leg times leg.' },
      },
      'V = B × h': {
        V: { expr: '{B} × {h}', how: 'Stack the base area up the height: base area times height.' },
      },
    },
    example: { l: 6, w: 4, h: 10, a: 7, B: 12, V: 120 },
    startWith: ['l', 'w', 'h', 'a'],
    standalone: {
      vars: ['a'],
      why: 'Where the plane cuts does not change the cut: a prism is the same all the way up.',
    },
    representation: {
      kind: 'crossSection',
      solid: 'triangularPrism',
      length: 'l',
      width: 'w',
      height: 'h',
      at: 'a',
      area: 'B',
      volume: 'V',
    },
  },
  {
    id: 'g.pyramid-slice',
    title: 'Slicing a pyramid',
    assumptions: ['The pyramid has a square base.', 'The plane cuts parallel to the base.'],
    variables: [
      cm('s', 'Base side'),
      cm('h', 'Height'),
      cm('a', 'Cut height'),
      { ...cm('t', 'Side of the cut'), derived: true, min: 0 },
      worked('A', 'Area of the cut', 'cm²'),
    ],
    relations: [
      onSolid('a', 'h'),
      derive(
        't = s(h − a)/h',
        't',
        ['s', 'h', 'a'],
        '{s} × ({h} − {a}) ÷ {h} = {t}',
        (v) => (v.s! * (v.h! - v.a!)) / v.h!,
      ),
      derive('A = t × t', 'A', ['t'], '{t} × {t} = {A}', (v) => v.t! * v.t!),
    ],
    steps: {
      'a ≤ h': {},
      't = s(h − a)/h': {
        t: {
          expr: '{s} × ({h} − {a}) ÷ {h}',
          how: 'The cut shrinks evenly to the top: the base side times the part of the height left above it.',
        },
      },
      'A = t × t': { A: { expr: '{t} × {t}', how: 'The cut is a square: side times side.' } },
    },
    example: { s: 6, h: 6, a: 3, t: 3, A: 9 },
    startWith: ['s', 'h', 'a'],
    representation: {
      kind: 'crossSection',
      solid: 'pyramid',
      length: 's',
      height: 'h',
      at: 'a',
      area: 'A',
    },
  },
  {
    id: 'g.pyramid-upright-slice',
    title: 'Slicing a pyramid upright',
    assumptions: [
      'The plane stands straight up, parallel to the front.',
      'Through the apex the cut is a triangle.',
    ],
    variables: [
      cm('s', 'Base side'),
      cm('h', 'Height'),
      cm('a', 'Cut depth'),
      worked('V', 'Volume', 'cm³'),
    ],
    relations: [
      onSolid('a', 's'),
      derive(
        'V = s²h/3',
        'V',
        ['s', 'h'],
        '{s} × {s} × {h} ÷ 3 = {V}',
        (v) => (v.s! * v.s! * v.h!) / 3,
      ),
    ],
    steps: {
      'a ≤ s': {},
      'V = s²h/3': {
        V: {
          expr: '{s} × {s} × {h} ÷ 3',
          how: 'A pyramid holds a third of the prism on the same base.',
        },
      },
    },
    example: { s: 6, h: 5, a: 2, V: 60 },
    startWith: ['s', 'h', 'a'],
    standalone: { vars: ['a'], why: 'Where the plane cuts changes the cut, not the pyramid.' },
    representation: {
      kind: 'crossSection',
      solid: 'pyramid',
      length: 's',
      height: 'h',
      cut: 'side',
      at: 'a',
      volume: 'V',
    },
  },
  {
    id: 'g.triangular-prism-net',
    title: 'Net of a triangular prism',
    assumptions: [
      'The two ends are the same right triangle.',
      'Each rectangle is one side of the triangle by the length.',
    ],
    variables: [
      cm('b', 'Triangle base'),
      cm('h', 'Triangle height'),
      cm('s', 'Slanted side'),
      cm('L', 'Length'),
      {
        id: 'S',
        symbol: 'S',
        name: 'Surface area',
        unit: 'cm²',
        min: 0,
        max: 100000,
        derived: true,
      },
    ],
    relations: [
      {
        // The third side closes the right triangle (to within 1%).
        id: 'the sides make a right triangle',
        constraint: true,
        display: '{b}, {h} and {s} make a right triangle',
        vars: ['b', 'h', 's'],
        residual: (v: Values) => (Math.abs(Math.hypot(v.b!, v.h!) - v.s!) <= 0.01 * v.s! ? 0 : 1),
        solve: {},
      },
      {
        id: 'S = bh + L(b + h + s)',
        display: '{b} × {h} + {L} × ({b} + {h} + {s}) = {S}',
        vars: ['S', 'b', 'h', 's', 'L'],
        residual: (v: Values) => v.S! - (v.b! * v.h! + v.L! * (v.b! + v.h! + v.s!)),
        solve: {
          S: (v: Values) => v.b! * v.h! + v.L! * (v.b! + v.h! + v.s!),
          b: () => undefined,
          h: () => undefined,
          s: () => undefined,
          L: () => undefined,
        },
      },
    ],
    steps: {
      'the sides make a right triangle': {},
      'S = bh + L(b + h + s)': {
        S: {
          expr: '{b} × {h} + {L} × ({b} + {h} + {s})',
          how: 'Two triangles make b × h. The rectangles are the length times the distance around the triangle.',
          written: false,
        },
      },
    },
    example: { b: 6, h: 8, s: 10, L: 12, S: 336 },
    startWith: ['b', 'h', 's', 'L'],
    representation: {
      kind: 'net',
      solid: 'triangularPrism',
      width: 'b',
      height: 'h',
      slant: 's',
      length: 'L',
      total: 'S',
    },
  },
  {
    id: 'g.vertical-angles',
    title: 'Vertical angles',
    assumptions: [
      'Two straight lines cross at one point.',
      'Angles next to each other on a line add to 180°.',
    ],
    variables: [
      degrees('a', 'Angle a'),
      degrees('b', 'Angle beside it'),
      degrees('c', 'Angle across from a'),
    ],
    relations: [
      straight.relation,
      {
        id: 'c = a',
        display: '{c} = {a}',
        vars: ['c', 'a'],
        residual: (v: Values) => v.c! - v.a!,
        solve: { c: (v: Values) => v.a!, a: (v: Values) => v.c! },
      },
    ],
    steps: {
      ...straight.steps,
      'c = a': {
        c: { expr: '{a}', how: 'Vertical angles are across from each other, so they are equal.' },
        a: { expr: '{c}', how: 'Vertical angles are across from each other, so they are equal.' },
      },
    },
    example: { a: 50, b: 130, c: 50 },
    startWith: ['a'],
    representation: { kind: 'angles', parts: ['a', 'b'], whole: 180, cross: { first: 'c' } },
  },
  {
    id: 'g.supplementary-angles',
    title: 'Supplementary angles',
    assumptions: ['The two angles share a ray.', 'Their outer rays make a straight line.'],
    variables: [degrees('a', 'First angle'), degrees('b', 'Second angle')],
    relations: [straight.relation],
    steps: straight.steps,
    example: { a: 115, b: 65 },
    startWith: ['a'],
    representation: { kind: 'angles', parts: ['a', 'b'], whole: 180 },
  },
  {
    id: 'g.complementary-angles',
    title: 'Complementary angles',
    assumptions: ['The two angles share a ray.', 'Together they make a right angle.'],
    variables: [degrees('a', 'First angle', 90), degrees('b', 'Second angle', 90)],
    relations: [right.relation],
    steps: right.steps,
    example: { a: 35, b: 55 },
    startWith: ['a'],
    representation: { kind: 'angles', parts: ['a', 'b'], whole: 90 },
  },
];

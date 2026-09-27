/**
 * Gallery demos for the Grade 7 geometry and chance pictures: angle pairs (vertical,
 * supplementary, complementary). Spread into GALLERY_MODULES in gallery.ts; kept apart so that
 * file's other demos merge easily.
 */
import type { Values } from '@/engine/types';

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

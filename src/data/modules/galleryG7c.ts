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

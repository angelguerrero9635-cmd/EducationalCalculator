/**
 * Gallery demos for the Grade 8 pictures of the Pythagorean theorem, curved solids and
 * scatter plots: squares on the sides of a right triangle, a distance on the grid with its
 * right triangle, a glass cylinder, cone and sphere with water, and a scatter plot with a line
 * of fit. Spread into GALLERY_MODULES in gallery.ts; kept apart so that file merges easily.
 */
import type { Values } from '@/engine/types';

import { whole } from './helpers';
import type { ModuleDef } from './types';

/** The legs' squares add to the hypotenuse's square. */
const pythagoras = {
  id: 'a² + b² = c²',
  display: '{a}² + {b}² = {c}²',
  vars: ['a', 'b', 'c'],
  residual: (v: Values) => v.a! ** 2 + v.b! ** 2 - v.c! ** 2,
  solve: {
    c: (v: Values) => Math.sqrt(v.a! ** 2 + v.b! ** 2),
    a: (v: Values) => Math.sqrt(v.c! ** 2 - v.b! ** 2),
    b: (v: Values) => Math.sqrt(v.c! ** 2 - v.a! ** 2),
  },
};

/** A radius, a height and a volume in centimeters, for the curved solids. */
const R = { id: 'r', symbol: 'r', name: 'Radius', unit: 'cm', min: 0.5, max: 20, step: 0.5 };
const H = { id: 'h', symbol: 'h', name: 'Height', unit: 'cm', min: 0.5, max: 40, step: 0.5 };
const V = { id: 'V', symbol: 'V', name: 'Volume', unit: 'cm³', min: 0, max: 60000 };

/** V = k × π × r² × h (k is 1 for a cylinder, 1/3 for a cone), with its steps. */
function roundVolume(k: 1 | 3, id: string) {
  const third = k === 3 ? '1/3 × ' : '';
  return {
    relation: {
      id,
      display: `{V} = ${third}π × {r}² × {h}`,
      vars: ['V', 'r', 'h'],
      residual: (v: Values) => v.V! - (Math.PI * v.r! ** 2 * v.h!) / k,
      solve: {
        V: (v: Values) => (Math.PI * v.r! ** 2 * v.h!) / k,
        h: (v: Values) => (v.r! > 0 ? (k * v.V!) / (Math.PI * v.r! ** 2) : undefined),
        r: (v: Values) => (v.h! > 0 ? Math.sqrt((k * v.V!) / (Math.PI * v.h!)) : undefined),
      },
    },
    steps: {
      V: {
        expr: `${third}π × {r}² × {h}`,
        how: `The base is a circle of area π × r². ${k === 3 ? 'A cone holds a third of the cylinder on that base.' : 'Stack it h high.'}`,
      },
      h: {
        expr: k === 3 ? '3 × {V} ÷ (π × {r}²)' : '{V} ÷ (π × {r}²)',
        how: `${k === 3 ? 'Multiply by 3, then divide' : 'Divide'} by the base area π × r².`,
      },
      r: {
        expr: k === 3 ? '√(3 × {V} ÷ (π × {h}))' : '√({V} ÷ (π × {h}))',
        how: `${k === 3 ? 'Multiply by 3, divide' : 'Divide'} by π × h, then take the square root.`,
      },
    },
  };
}
const cylinder = roundVolume(1, 'V = πr²h');
const cone = roundVolume(3, 'V = ⅓πr²h');

export const G8C_GALLERY_MODULES: ModuleDef[] = [
  {
    id: 'g.squares-on-sides',
    title: 'Squares on the sides',
    assumptions: [
      'The triangle has a right angle between the legs a and b.',
      'The square on each side has that side’s length squared for its area.',
      'The two smaller squares together cover the same area as the biggest one.',
    ],
    variables: [
      { id: 'a', symbol: 'a', name: 'Leg a', unit: 'cm', min: 0, max: 12, step: 1 },
      { id: 'b', symbol: 'b', name: 'Leg b', unit: 'cm', min: 0, max: 12, step: 1 },
      { id: 'c', symbol: 'c', name: 'Hypotenuse', unit: 'cm', min: 0, max: 17 },
    ],
    relations: [pythagoras],
    steps: {
      'a² + b² = c²': {
        c: { expr: '√({a}² + {b}²)', how: 'Add the squares on the legs, then take the root.' },
        a: { expr: '√({c}² − {b}²)', how: 'Take the square on b from the biggest square.' },
        b: { expr: '√({c}² − {a}²)', how: 'Take the square on a from the biggest square.' },
      },
    },
    example: { a: 3, b: 4, c: 5 },
    startWith: ['a', 'b'],
    unitSystems: ['metric'],
    representation: { kind: 'rightTriangle', a: 'a', b: 'b', c: 'c', extent: 5, grid: true },
  },
  {
    id: 'g.grid-distance',
    title: 'Distance on the grid',
    assumptions: [
      'The distance between two points is the hypotenuse of a right triangle.',
      'Its legs go straight across and straight up, along the grid lines.',
      'Count each leg on the grid, or subtract the coordinates.',
    ],
    variables: [
      whole('x1', 'x₁', 'First x', -10, 10),
      whole('y1', 'y₁', 'First y', -10, 10),
      whole('x2', 'x₂', 'Second x', -10, 10),
      whole('y2', 'y₂', 'Second y', -10, 10),
      { id: 'd', symbol: 'd', name: 'Distance', min: 0, max: 29, derived: true },
    ],
    relations: [
      {
        id: 'd² = (x₂ − x₁)² + (y₂ − y₁)²',
        display: '{d}² = ({x2} − {x1})² + ({y2} − {y1})²',
        vars: ['d', 'x1', 'y1', 'x2', 'y2'],
        residual: (v: Values) => v.d! ** 2 - (v.x2! - v.x1!) ** 2 - (v.y2! - v.y1!) ** 2,
        solve: {
          d: (v: Values) => Math.sqrt((v.x2! - v.x1!) ** 2 + (v.y2! - v.y1!) ** 2),
          x1: () => undefined,
          y1: () => undefined,
          x2: () => undefined,
          y2: () => undefined,
        },
      },
    ],
    steps: {
      'd² = (x₂ − x₁)² + (y₂ − y₁)²': {
        d: {
          expr: '√(({x2} − {x1})² + ({y2} − {y1})²)',
          how: 'The legs are the change in x and the change in y. Square, add, take the root.',
        },
      },
    },
    example: { x1: -4, y1: -2, x2: 4, y2: 4, d: 10 },
    startWith: ['x1', 'y1', 'x2', 'y2'],
    representation: {
      kind: 'coordinatePlane',
      x: 'x1',
      y: 'y1',
      second: { x: 'x2', y: 'y2' },
      segment: true,
      distance: 'd',
      legs: true,
      extent: 6,
      quadrants: 4,
    },
  },
  {
    id: 'g.cylinder-volume',
    title: 'Volume of a cylinder',
    assumptions: [
      'The cylinder’s base is a circle of radius r; its height is h.',
      'Its volume is the base area π × r² stacked h high.',
    ],
    variables: [R, H, V],
    relations: [cylinder.relation],
    steps: { 'V = πr²h': cylinder.steps },
    example: { r: 3, h: 10, V: Math.PI * 90 },
    startWith: ['r', 'h'],
    unitSystems: ['metric'],
    representation: {
      kind: 'curvedSolid',
      shape: 'cylinder',
      radius: 'r',
      height: 'h',
      volume: 'V',
      extent: 10,
    },
  },
  {
    id: 'g.cone-in-cylinder',
    title: 'A cone fills a third',
    assumptions: [
      'The cone and the cylinder have the same radius r and height h.',
      'Three cones of water fill the cylinder, so a cone holds 1/3 of it.',
    ],
    variables: [R, H, V],
    relations: [cone.relation],
    steps: { 'V = ⅓πr²h': cone.steps },
    example: { r: 3, h: 10, V: Math.PI * 30 },
    startWith: ['r', 'h'],
    unitSystems: ['metric'],
    representation: {
      kind: 'curvedSolid',
      shape: 'cone',
      radius: 'r',
      height: 'h',
      volume: 'V',
      compare: true,
      extent: 10,
    },
  },
  {
    id: 'g.sphere-in-cylinder',
    title: 'A sphere fills two thirds',
    assumptions: [
      'The sphere just fits in a cylinder: the same radius r, and 2r tall.',
      'Its water fills 2/3 of that cylinder, so V = 2/3 × π × r² × 2r = 4/3 × π × r³.',
    ],
    variables: [R, V],
    relations: [
      {
        id: 'V = 4/3 πr³',
        display: '{V} = 4/3 × π × {r}³',
        vars: ['V', 'r'],
        residual: (v: Values) => v.V! - (4 / 3) * Math.PI * v.r! ** 3,
        solve: {
          V: (v: Values) => (4 / 3) * Math.PI * v.r! ** 3,
          r: (v: Values) => Math.cbrt((3 * v.V!) / (4 * Math.PI)),
        },
      },
    ],
    steps: {
      'V = 4/3 πr³': {
        V: { expr: '4/3 × π × {r}³', how: 'Cube the radius, then multiply by 4/3 and by π.' },
        r: {
          expr: '∛(3 × {V} ÷ (4 × π))',
          how: 'Multiply by 3, divide by 4 × π, then take the cube root.',
        },
      },
    },
    example: { r: 3, V: Math.PI * 36 },
    startWith: ['r'],
    unitSystems: ['metric'],
    representation: {
      kind: 'curvedSolid',
      shape: 'sphere',
      radius: 'r',
      volume: 'V',
      compare: true,
      extent: 6,
    },
  },
  {
    id: 'g.scatter-fit',
    title: 'Scatter plot and line of fit',
    assumptions: [
      'Each dot is one player: hours of practice a week and points scored in a game.',
      'A line of fit follows the trend, with about as many dots above it as below.',
      'Drag either end of the line; read a prediction from the line.',
    ],
    variables: [
      { id: 'm', symbol: 'm', name: 'Slope', min: -20, max: 20, step: 0.1 },
      { id: 'b', symbol: 'b', name: 'Intercept', min: -30, max: 30, step: 0.1 },
      { id: 'x', symbol: 'x', name: 'Hours of practice', min: 0, max: 10, step: 0.5 },
      { id: 'y', symbol: 'y', name: 'Predicted points', min: -250, max: 250 },
    ],
    relations: [
      {
        id: 'y = mx + b',
        display: '{y} = {m} × {x} + {b}',
        vars: ['y', 'm', 'x', 'b'],
        residual: (v: Values) => v.y! - (v.m! * v.x! + v.b!),
        solve: {
          y: (v: Values) => v.m! * v.x! + v.b!,
          b: (v: Values) => v.y! - v.m! * v.x!,
          m: (v: Values) => (v.x! === 0 ? undefined : (v.y! - v.b!) / v.x!),
          x: (v: Values) => (v.m! === 0 ? undefined : (v.y! - v.b!) / v.m!),
        },
      },
    ],
    steps: {
      'y = mx + b': {
        y: { expr: '{m} × {x} + {b}', how: 'Read the line: slope times the input, plus b.' },
        b: { expr: '{y} − {m} × {x}', how: 'Subtract m × x from both sides.' },
        m: { expr: '({y} − {b}) ÷ {x}', how: 'Subtract b from both sides, then divide by x.' },
        x: { expr: '({y} − {b}) ÷ {m}', how: 'Subtract b from both sides, then divide by m.' },
      },
    },
    example: { m: 2.5, b: 2, x: 4, y: 12 },
    startWith: ['m', 'b', 'x'],
    representation: {
      kind: 'scatter',
      x: { label: 'Practice (hours a week)', min: 0, max: 10, step: 2 },
      y: { label: 'Points in a game', min: 0, max: 30, step: 5 },
      points: [
        [1, 5],
        [1.5, 5],
        [2, 8],
        [2, 5],
        [2.5, 9],
        [3, 7],
        [6, 18],
        [6.5, 17],
        [7, 17],
        [7.5, 22],
        [8, 21],
        [8.5, 24],
        [9, 22],
        [1, 26],
      ],
      slope: 'm',
      intercept: 'b',
      clusters: [
        { label: 'New players', points: [0, 1, 2, 3, 4, 5] },
        { label: 'Team players', points: [6, 7, 8, 9, 10, 11, 12] },
      ],
      outlier: 13,
      at: { x: 'x', y: 'y' },
    },
  },
];

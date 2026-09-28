/**
 * Grade 8 math: every calculator module for the grade, the skill's main page first
 * and its problem types (`<skill id>~<slug>`) after it. Shared relation helpers live in
 * `../helpers.ts`; worked-line helpers in `../work.ts`. Rules: docs/MODULE_GUIDE.md.
 */
import { div } from '../helpers';
import type { ModuleDef } from '../types';

export const MATH_8_MODULES: ModuleDef[] = [
  {
    id: 'm.8.pythagorean',
    assumptions: [
      'The triangle has one right angle (90°).',
      'a and b are the legs, which form the right angle; c is the hypotenuse, the longest side.',
      'Distance between two points: the horizontal and vertical differences are the legs a and b.',
      'All three sides use the same unit.',
    ],
    variables: [
      { id: 'a', symbol: 'a', name: 'Leg a', unit: 'cm', min: 0, max: 100, step: 0.5 },
      { id: 'b', symbol: 'b', name: 'Leg b', unit: 'cm', min: 0, max: 100, step: 0.5 },
      { id: 'c', symbol: 'c', name: 'Hypotenuse', unit: 'cm', min: 0, max: 142 },
    ],
    relations: [
      {
        id: 'a² + b² = c²',
        display: '{a}² + {b}² = {c}²',
        vars: ['a', 'b', 'c'],
        residual: (v) => v.a! ** 2 + v.b! ** 2 - v.c! ** 2,
        // √ of a negative is NaN on purpose: the solver reports it as a conflict
        // (a hypotenuse shorter than a leg) instead of silently leaving the leg blank.
        solve: {
          c: (v) => Math.sqrt(v.a! ** 2 + v.b! ** 2),
          a: (v) => Math.sqrt(v.c! ** 2 - v.b! ** 2),
          b: (v) => Math.sqrt(v.c! ** 2 - v.a! ** 2),
        },
      },
    ],
    steps: {
      'a² + b² = c²': {
        c: { expr: '√({a}² + {b}²)', how: 'Square each leg, add them, then take the square root.' },
        a: {
          expr: '√({c}² − {b}²)',
          how: 'Subtract b² from both sides, then take the square root.',
        },
        b: {
          expr: '√({c}² − {a}²)',
          how: 'Subtract a² from both sides, then take the square root.',
        },
      },
    },
    example: { a: 3, b: 4, c: 5 },
    startWith: ['a', 'b'],
    representation: { kind: 'rightTriangle', a: 'a', b: 'b', c: 'c', extent: 5 },
  },
  {
    id: 'm.8.linear-functions',
    assumptions: [
      'The graph is a straight line, so y changes at a constant rate.',
      'm is the slope: how much y changes when x increases by 1 (rise over run).',
      'b is the y-intercept: the value of y when x = 0.',
    ],
    variables: [
      { id: 'x', symbol: 'x', name: 'Input x', min: -10, max: 10, step: 0.5 },
      { id: 'y', symbol: 'y', name: 'Output y', min: -110, max: 110 },
      { id: 'm', symbol: 'm', name: 'Slope', min: -10, max: 10, step: 0.5 },
      { id: 'b', symbol: 'b', name: 'y-intercept', min: -10, max: 10, step: 0.5 },
    ],
    relations: [
      {
        id: 'y = mx + b',
        display: '{y} = {m} × {x} + {b}',
        vars: ['y', 'm', 'x', 'b'],
        residual: (v) => v.y! - (v.m! * v.x! + v.b!),
        solve: {
          y: (v) => v.m! * v.x! + v.b!,
          b: (v) => v.y! - v.m! * v.x!,
          m: (v) => div(v.y! - v.b!, v.x!),
          x: (v) => div(v.y! - v.b!, v.m!),
        },
      },
    ],
    steps: {
      'y = mx + b': {
        y: {
          expr: '{m} × {x} + {b}',
          how: 'Start at b, then add the slope once for every step of x.',
        },
        b: { expr: '{y} − {m} × {x}', how: 'Subtract m·x from both sides.' },
        m: { expr: '({y} − {b}) ÷ {x}', how: 'Subtract b from both sides, then divide by x.' },
        x: {
          expr: '({y} − {b}) ÷ {m}',
          how: 'Subtract b from both sides, then divide by the slope.',
        },
      },
    },
    example: { m: 2, b: 1, x: 3, y: 7 },
    startWith: ['x', 'm', 'b'],
    representation: {
      kind: 'plot',
      x: { var: 'x', min: -10, max: 10 },
      y: { var: 'y', min: -20, max: 20 },
      params: ['m', 'b'],
      slopeTriangle: 'm',
      intercept: 'b',
    },
  },
];

/**
 * Grade 7 math: every calculator module for the grade, the skill's main page first
 * and its problem types (`<skill id>~<slug>`) after it. Shared relation helpers live in
 * `../helpers.ts`; worked-line helpers in `../work.ts`. Rules: docs/MODULE_GUIDE.md.
 */
import type { ModuleDef } from '../types';

export const MATH_7_MODULES: ModuleDef[] = [
  {
    id: 'm.7.circles',
    assumptions: [
      'Every point on the circle is the same distance (the radius) from the center.',
      'π ≈ 3.14159 is the ratio of any circle’s circumference to its diameter.',
      'All lengths use the same unit; area is in square units.',
    ],
    variables: [
      { id: 'r', symbol: 'r', name: 'Radius', unit: 'cm', min: 0, max: 1000, step: 0.5 },
      { id: 'd', symbol: 'd', name: 'Diameter', unit: 'cm', min: 0, max: 2000 },
      { id: 'C', symbol: 'C', name: 'Circumference', unit: 'cm', min: 0, max: 6300 },
      { id: 'A', symbol: 'A', name: 'Area', unit: 'cm²', min: 0, max: 3200000 },
    ],
    relations: [
      {
        id: 'd = 2r',
        display: '{d} = 2 × {r}',
        vars: ['d', 'r'],
        residual: (v) => v.d! - 2 * v.r!,
        solve: { d: (v) => 2 * v.r!, r: (v) => v.d! / 2 },
      },
      {
        id: 'C = πd',
        display: '{C} = π × {d}',
        vars: ['C', 'd'],
        residual: (v) => v.C! - Math.PI * v.d!,
        solve: { C: (v) => Math.PI * v.d!, d: (v) => v.C! / Math.PI },
      },
      {
        id: 'C = 2πr',
        display: '{C} = 2 × π × {r}',
        vars: ['C', 'r'],
        residual: (v) => v.C! - 2 * Math.PI * v.r!,
        solve: { C: (v) => 2 * Math.PI * v.r!, r: (v) => v.C! / (2 * Math.PI) },
      },
      {
        id: 'A = πr²',
        display: '{A} = π × {r}²',
        vars: ['A', 'r'],
        residual: (v) => v.A! - Math.PI * v.r! ** 2,
        solve: { A: (v) => Math.PI * v.r! ** 2, r: (v) => Math.sqrt(v.A! / Math.PI) },
      },
    ],
    steps: {
      'd = 2r': {
        d: { expr: '2 × {r}', how: 'A diameter is two radii end to end through the center.' },
        r: { expr: '{d} ÷ 2', how: 'The radius is half the diameter.' },
      },
      'C = πd': {
        C: { expr: 'π × {d}', how: 'Circumference is π times the diameter.' },
        d: { expr: '{C} ÷ π', how: 'Divide both sides by π.' },
      },
      'C = 2πr': {
        C: {
          expr: '2 × π × {r}',
          how: 'The diameter is 2r, and circumference is π times the diameter.',
        },
        r: { expr: '{C} ÷ (2 × π)', how: 'Divide both sides by 2π.' },
      },
      'A = πr²': {
        A: { expr: 'π × {r}²', how: 'Square the radius, then multiply by π.' },
        r: {
          expr: '√({A} ÷ π)',
          how: 'Divide both sides by π, then take the square root (a radius is never negative).',
        },
      },
    },
    example: { r: 3, d: 6, C: 6 * Math.PI, A: 9 * Math.PI },
    startWith: ['r'],
    representation: {
      kind: 'circle',
      radius: 'r',
      extent: 5,
      diameter: 'd',
      circumference: 'C',
      area: 'A',
    },
  },
];

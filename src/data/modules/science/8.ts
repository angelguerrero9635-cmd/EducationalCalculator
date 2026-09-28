/**
 * Grade 8 science: every calculator module for the grade, the skill's main page first
 * and its problem types (`<skill id>~<slug>`) after it. Shared relation helpers live in
 * `../helpers.ts`; worked-line helpers in `../work.ts`. Rules: docs/MODULE_GUIDE.md.
 */
import { div } from '../helpers';
import type { ModuleDef } from '../types';

export const SCIENCE_8_MODULES: ModuleDef[] = [
  {
    id: 's.8.newtons-laws',
    assumptions: [
      'F is the net force: all the forces on the object added together.',
      '1st law: no net force means no acceleration (a = 0). 3rd law: forces come in equal, opposite pairs.',
      'The mass stays the same, and the force and acceleration point the same way.',
      '1 N = 1 kg × 1 m/s².',
    ],
    variables: [
      { id: 'F', symbol: 'F', name: 'Net force', unit: 'N', min: 0, max: 100000, step: 1 },
      { id: 'm', symbol: 'm', name: 'Mass', unit: 'kg', min: 0.5, max: 5000, step: 0.5 },
      { id: 'a', symbol: 'a', name: 'Acceleration', unit: 'm/s²', min: 0, max: 1000, step: 0.5 },
    ],
    relations: [
      {
        id: 'F = m × a',
        display: '{F} = {m} × {a}',
        vars: ['F', 'm', 'a'],
        residual: (v) => v.F! - v.m! * v.a!,
        solve: {
          F: (v) => v.m! * v.a!,
          m: (v) => div(v.F!, v.a!),
          a: (v) => div(v.F!, v.m!),
        },
      },
    ],
    steps: {
      'F = m × a': {
        F: {
          expr: '{m} × {a}',
          how: 'A bigger mass or a bigger acceleration needs more force: multiply them.',
        },
        m: { expr: '{F} ÷ {a}', how: 'Divide both sides by the acceleration.' },
        a: {
          expr: '{F} ÷ {m}',
          how: 'Divide both sides by the mass: the same force speeds up a heavier object less.',
        },
      },
    },
    example: { m: 10, a: 2, F: 20 },
    startWith: ['a', 'm'],
    // Middle-school science (NGSS) works in SI; US units stay reachable through Mixed.
    unitSystems: ['metric'],
    representation: {
      kind: 'force',
      force: 'F',
      mass: 'm',
      acceleration: 'a',
      forceExtent: 50,
      accelerationExtent: 5,
    },
  },
];

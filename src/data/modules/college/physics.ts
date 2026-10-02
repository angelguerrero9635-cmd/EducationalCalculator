/**
 * College Physics: the calculator modules of every course whose home field is
 * `physics`, keyed by course topic (`<courseId>#<i>`, its problem types `<courseId>#<i>~<slug>`
 * after it), in taxonomy order. Course and topic titles come from taxonomy.ts. Layout pages are
 * in `../layouts/collegePhysics.ts`. Rules: docs/MODULE_GUIDE.md.
 */
import { div } from '../helpers';
import type { ModuleDef } from '../types';

import { plusMinus, rootOf } from './shared';

export const COLLEGE_PHYSICS_MODULES: ModuleDef[] = [
  {
    // University Physics I: Mechanics → Kinematics
    id: 'he.physics.university-1#0',
    assumptions: [
      'Acceleration is constant, and the clock starts (t = 0) when the velocity is v₀.',
      'Motion is along a straight line. Pick a positive direction; signs follow it.',
      'Free fall: a = −9.8 m/s² (−32.2 ft/s²) if up is positive.',
      'd is displacement (change in position), not total distance traveled.',
    ],
    variables: [
      {
        id: 'v0',
        symbol: 'v₀',
        name: 'Initial velocity',
        unit: 'm/s',
        min: -1000,
        max: 1000,
        step: 0.5,
      },
      { id: 'v', symbol: 'v', name: 'Final velocity', unit: 'm/s', min: -15000, max: 15000 },
      { id: 'a', symbol: 'a', name: 'Acceleration', unit: 'm/s²', min: -100, max: 100, step: 0.1 },
      { id: 't', symbol: 't', name: 'Time', unit: 's', min: 0, max: 120, step: 0.1 },
      { id: 'd', symbol: 'd', name: 'Displacement', unit: 'm', min: -1000000, max: 1000000 },
    ],
    relations: [
      {
        id: 'v = v₀ + at',
        display: '{v} = {v0} + {a} × {t}',
        vars: ['v', 'v0', 'a', 't'],
        residual: (x) => x.v! - x.v0! - x.a! * x.t!,
        solve: {
          v: (x) => x.v0! + x.a! * x.t!,
          v0: (x) => x.v! - x.a! * x.t!,
          a: (x) => div(x.v! - x.v0!, x.t!),
          t: (x) => div(x.v! - x.v0!, x.a!),
        },
      },
      {
        id: 'd = v₀t + ½at²',
        display: '{d} = {v0} × {t} + ½ × {a} × {t}²',
        vars: ['d', 'v0', 'a', 't'],
        residual: (x) => x.d! - x.v0! * x.t! - 0.5 * x.a! * x.t! ** 2,
        solve: {
          d: (x) => x.v0! * x.t! + 0.5 * x.a! * x.t! ** 2,
          v0: (x) => div(x.d! - 0.5 * x.a! * x.t! ** 2, x.t!),
          a: (x) => (x.t === 0 ? undefined : (2 * (x.d! - x.v0! * x.t!)) / x.t! ** 2),
          t: (x) => {
            // ½a·t² + v₀·t − d = 0
            if (x.a === 0) return x.v0 === 0 ? undefined : [x.d! / x.v0!];
            const disc = x.v0! ** 2 + 2 * x.a! * x.d!;
            const s = rootOf(disc, x.v0! ** 2 + Math.abs(2 * x.a! * x.d!));
            if (Number.isNaN(s)) return [];
            return [(-x.v0! + s) / x.a!, (-x.v0! - s) / x.a!];
          },
        },
      },
      {
        id: 'v² = v₀² + 2ad',
        display: '{v}² = {v0}² + 2 × {a} × {d}',
        vars: ['v', 'v0', 'a', 'd'],
        residual: (x) => x.v! ** 2 - x.v0! ** 2 - 2 * x.a! * x.d!,
        solve: {
          v: (x) =>
            plusMinus(rootOf(x.v0! ** 2 + 2 * x.a! * x.d!, x.v0! ** 2 + Math.abs(2 * x.a! * x.d!))),
          v0: (x) =>
            plusMinus(rootOf(x.v! ** 2 - 2 * x.a! * x.d!, x.v! ** 2 + Math.abs(2 * x.a! * x.d!))),
          a: (x) => div(x.v! ** 2 - x.v0! ** 2, 2 * x.d!),
          d: (x) => div(x.v! ** 2 - x.v0! ** 2, 2 * x.a!),
        },
      },
      {
        id: 'd = ½(v₀ + v)t',
        display: '{d} = ½ × ({v0} + {v}) × {t}',
        vars: ['d', 'v0', 'v', 't'],
        residual: (x) => x.d! - 0.5 * (x.v0! + x.v!) * x.t!,
        solve: {
          d: (x) => 0.5 * (x.v0! + x.v!) * x.t!,
          v0: (x) => (x.t === 0 ? undefined : (2 * x.d!) / x.t! - x.v!),
          v: (x) => (x.t === 0 ? undefined : (2 * x.d!) / x.t! - x.v0!),
          t: (x) => div(2 * x.d!, x.v0! + x.v!),
        },
      },
    ],
    steps: {
      'v = v₀ + at': {
        v: {
          expr: '{v0} + {a} × {t}',
          how: 'Velocity changes by a every second, so add a·t to the starting velocity.',
        },
        v0: { expr: '{v} − {a} × {t}', how: 'Subtract a·t from both sides.' },
        a: {
          expr: '({v} − {v0}) ÷ {t}',
          how: 'Acceleration is the change in velocity divided by the time.',
        },
        t: {
          expr: '({v} − {v0}) ÷ {a}',
          how: 'Divide the change in velocity by the acceleration.',
        },
      },
      'd = v₀t + ½at²': {
        d: {
          expr: '{v0} × {t} + ½ × {a} × {t}²',
          how: 'Add the distance covered at the starting velocity to the extra distance from accelerating.',
        },
        v0: {
          expr: '({d} − ½ × {a} × {t}²) ÷ {t}',
          how: 'Subtract ½at² from both sides, then divide by t.',
        },
        a: {
          expr: '2 × ({d} − {v0} × {t}) ÷ {t}²',
          how: 'Subtract v₀t, multiply by 2, then divide by t².',
        },
        t: {
          expr: '(−{v0} ± √({v0}² + 2 × {a} × {d})) ÷ {a}',
          how: 'Rewrite as ½a·t² + v₀·t − d = 0 and use the quadratic formula. Time can’t be negative, so keep the root that is 0 or more.',
        },
      },
      'v² = v₀² + 2ad': {
        v: {
          expr: '±√({v0}² + 2 × {a} × {d})',
          how: 'Add 2ad to v₀², then take the square root. Both + and − solve the equation: the sign is the direction of motion, so keep the one that matches how the object is moving.',
        },
        v0: {
          expr: '±√({v}² − 2 × {a} × {d})',
          how: 'Subtract 2ad from v², then take the square root. Both + and − solve the equation: the sign is the direction of motion, so keep the one that matches how the object was moving at the start.',
        },
        a: {
          expr: '({v}² − {v0}²) ÷ (2 × {d})',
          how: 'Subtract v₀² from both sides, then divide by 2d.',
        },
        d: {
          expr: '({v}² − {v0}²) ÷ (2 × {a})',
          how: 'Subtract v₀² from both sides, then divide by 2a.',
        },
      },
      'd = ½(v₀ + v)t': {
        d: {
          expr: '½ × ({v0} + {v}) × {t}',
          how: 'With constant acceleration, the average velocity is halfway between v₀ and v. Multiply it by the time.',
        },
        v0: {
          expr: '2 × {d} ÷ {t} − {v}',
          how: 'Multiply both sides by 2, divide by t, then subtract v.',
        },
        v: {
          expr: '2 × {d} ÷ {t} − {v0}',
          how: 'Multiply both sides by 2, divide by t, then subtract v₀.',
        },
        t: {
          expr: '2 × {d} ÷ ({v0} + {v})',
          how: 'Divide the displacement by the average velocity, ½(v₀ + v).',
        },
      },
    },
    example: { v0: 5, a: 2, t: 4, v: 13, d: 36 },
    startWith: ['t', 'v0', 'a'],
    representation: {
      kind: 'plot',
      x: { var: 't', min: 0, max: 10 },
      y: { var: 'v', min: -10, max: 30 },
      params: ['v0', 'a'],
      shadeToPoint: true,
      autoRange: true,
    },
  },
];

/**
 * College Physics: the calculator modules of every course whose home field is
 * `physics`, keyed by course topic (`<courseId>#<i>`, its problem types `<courseId>#<i>~<slug>`
 * after it), in taxonomy order. Course and topic titles come from taxonomy.ts. Layout pages are
 * in `../layouts/collegePhysics.ts`. Rules: docs/MODULE_GUIDE.md.
 */
import type { Values } from '@/engine/types';

import { div } from '../helpers';
import type { ModuleDef } from '../types';

import { polyDerivative, polyForm } from './forms';
import { atLeastZero, plusMinus, rel, rels, rootOf, signed, V, withStep } from './shared';

/** x(t)'s coefficients, highest power first: [c₃, c₂, c₁, c₀]. */
const cubic = (v: Values) => [v.c3!, v.c2!, v.c1!, v.c0!];

/** A value with one fixed unit (no menu: the coefficients' units go together). */
const fixed = (unit: string, min: number, max: number, step: number, derived = false) => ({
  unit,
  units: [unit],
  min,
  max,
  step,
  ...(derived ? { derived } : {}),
});

export const COLLEGE_PHYSICS_MODULES: ModuleDef[] = [
  {
    // University Physics I: Mechanics → Kinematics
    id: 'he.physics.university-1#0',
    use: 'Use this for “A car at 5 m/s speeds up at 2 m/s² for 4 s. How fast is it going, and how far has it gone?”',
    assumptions: [
      'Acceleration is constant, and the clock starts (t = 0) when the velocity is v₀.',
      'Motion is along a straight line. Pick a positive direction; signs follow it.',
      'Free fall: a = −9.81 m/s² (−32.2 ft/s²) if up is positive.',
      'Δx is displacement (change in position), the shaded area under the v–t line, not total distance traveled.',
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
      { id: 'd', symbol: 'Δx', name: 'Displacement', unit: 'm', min: -1000000, max: 1000000 },
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
          t: (x) => atLeastZero(div(x.v! - x.v0!, x.a!)),
        },
      },
      {
        id: 'Δx = v₀t + ½at²',
        display: '{d} = {v0} × {t} + ½ × {a} × {t}²',
        vars: ['d', 'v0', 'a', 't'],
        residual: (x) => x.d! - x.v0! * x.t! - 0.5 * x.a! * x.t! ** 2,
        solve: {
          d: (x) => x.v0! * x.t! + 0.5 * x.a! * x.t! ** 2,
          v0: (x) => div(x.d! - 0.5 * x.a! * x.t! ** 2, x.t!),
          a: (x) => (x.t === 0 ? undefined : (2 * (x.d! - x.v0! * x.t!)) / x.t! ** 2),
          t: (x) => {
            // ½a·t² + v₀·t − Δx = 0
            if (x.a === 0) return x.v0 === 0 ? undefined : [atLeastZero(x.d! / x.v0!)!];
            const disc = x.v0! ** 2 + 2 * x.a! * x.d!;
            const s = rootOf(disc, x.v0! ** 2 + Math.abs(2 * x.a! * x.d!));
            if (Number.isNaN(s)) return [];
            return [(-x.v0! + s) / x.a!, (-x.v0! - s) / x.a!].map((r) => atLeastZero(r)!);
          },
        },
      },
      {
        id: 'v² = v₀² + 2aΔx',
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
        id: 'Δx = ½(v₀ + v)t',
        display: '{d} = ½ × ({v0} + {v}) × {t}',
        vars: ['d', 'v0', 'v', 't'],
        residual: (x) => x.d! - 0.5 * (x.v0! + x.v!) * x.t!,
        solve: {
          d: (x) => 0.5 * (x.v0! + x.v!) * x.t!,
          v0: (x) => (x.t === 0 ? undefined : (2 * x.d!) / x.t! - x.v!),
          v: (x) => (x.t === 0 ? undefined : (2 * x.d!) / x.t! - x.v0!),
          t: (x) => atLeastZero(div(2 * x.d!, x.v0! + x.v!)),
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
      'Δx = v₀t + ½at²': {
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
          how: 'Rewrite as ½a·t² + v₀·t − Δx = 0 and use the quadratic formula. Time can’t be negative, so keep the root that is 0 or more.',
        },
      },
      'v² = v₀² + 2aΔx': {
        v: {
          expr: '±√({v0}² + 2 × {a} × {d})',
          how: 'Add 2aΔx to v₀², then take the square root. Both + and − solve the equation: the sign is the direction of motion, so keep the one that matches how the object is moving.',
        },
        v0: {
          expr: '±√({v}² − 2 × {a} × {d})',
          how: 'Subtract 2aΔx from v², then take the square root. Both + and − solve the equation: the sign is the direction of motion, so keep the one that matches how the object was moving at the start.',
        },
        a: {
          expr: '({v}² − {v0}²) ÷ (2 × {d})',
          how: 'Subtract v₀² from both sides, then divide by 2Δx.',
        },
        d: {
          expr: '({v}² − {v0}²) ÷ (2 × {a})',
          how: 'Subtract v₀² from both sides, then divide by 2a.',
        },
      },
      'Δx = ½(v₀ + v)t': {
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
    // The s.11 v–t graph: the area between the line and the axis is the displacement Δx.
    representation: {
      kind: 'motionGraph',
      graph: 'speed',
      time: 't',
      acceleration: 'a',
      speed: 'v',
      start: 'v0',
      distance: 'd',
      kinematics: { view: 'velocity' },
    },
  },
  {
    // University Physics I → Kinematics: x(t) a cubic; v and a by the power rule.
    id: 'he.physics.university-1#0~calculus',
    title: 'Velocity and acceleration from x(t)',
    use: 'Use this for “x = 2t³ − 9t² + 12t + 4 (m, s). Find the velocity and acceleration at t = 3 s.”',
    assumptions: [
      'The position is given as x(t) = c₀ + c₁t + c₂t² + c₃t³, x in meters and t in seconds.',
      'Power rule: the derivative of tⁿ is ntⁿ⁻¹, so v = dx/dt and a = dv/dt term by term.',
      'Where v = 0 and changes sign, the object turns round.',
    ],
    variables: [
      V('c3', 'c₃', 'Coefficient of t³', fixed('m/s³', -50, 50, 0.01)),
      V('c2', 'c₂', 'Coefficient of t²', fixed('m/s²', -100, 100, 0.01)),
      V('c1', 'c₁', 'Coefficient of t', fixed('m/s', -1000, 1000, 0.1)),
      V('c0', 'c₀', 'Starting position', fixed('m', -10000, 10000, 0.1)),
      V('t', 't', 'Time', fixed('s', 0, 100, 0.01)),
      V('x', 'x', 'Position', fixed('m', -1e8, 1e8, 0.01, true)),
      V('v', 'v', 'Velocity', fixed('m/s', -1e7, 1e7, 0.01, true)),
      V('a', 'a', 'Acceleration', fixed('m/s²', -1e5, 1e5, 0.01, true)),
    ],
    ...rels(
      withStep(
        rel(
          'x = c₀ + c₁t + c₂t² + c₃t³',
          '{x} = {c0} + {c1} × {t} + {c2} × {t}² + {c3} × {t}³',
          ['x', 'c0', 'c1', 'c2', 'c3', 't'],
          (v) => v.x! - (v.c0! + v.c1! * v.t! + v.c2! * v.t! ** 2 + v.c3! * v.t! ** 3),
          {
            x: [
              (v) => v.c0! + v.c1! * v.t! + v.c2! * v.t! ** 2 + v.c3! * v.t! ** 3,
              (v) =>
                `${signed(v.c0!)} + ${signed(v.c1!)} × ${signed(v.t!)} + ${signed(v.c2!)} × ${signed(v.t!)}² + ${signed(v.c3!)} × ${signed(v.t!)}³`,
              'Put the time into x(t), one term at a time, and add.',
            ],
            c0: [
              (v) => v.x! - v.c1! * v.t! - v.c2! * v.t! ** 2 - v.c3! * v.t! ** 3,
              '{x} − {c1} × {t} − {c2} × {t}² − {c3} × {t}³',
              'Take the other three terms away from the position.',
            ],
          },
        ),
        'x',
        { work: (v) => [`x(t) = ${polyForm(cubic(v), 't')}`] },
      ),
      withStep(
        rel(
          'v = c₁ + 2c₂t + 3c₃t²',
          '{v} = {c1} + 2 × {c2} × {t} + 3 × {c3} × {t}²',
          ['v', 'c1', 'c2', 'c3', 't'],
          (v) => v.v! - (v.c1! + 2 * v.c2! * v.t! + 3 * v.c3! * v.t! ** 2),
          {
            v: [
              (v) => v.c1! + 2 * v.c2! * v.t! + 3 * v.c3! * v.t! ** 2,
              (v) =>
                `${signed(v.c1!)} + 2 × ${signed(v.c2!)} × ${signed(v.t!)} + 3 × ${signed(v.c3!)} × ${signed(v.t!)}²`,
              'v = dx/dt: by the power rule each cₙtⁿ gives ncₙtⁿ⁻¹, and c₀ drops out. Put t in.',
            ],
            c1: [
              (v) => v.v! - 2 * v.c2! * v.t! - 3 * v.c3! * v.t! ** 2,
              '{v} − 2 × {c2} × {t} − 3 × {c3} × {t}²',
              'Take the t and t² terms of v away from the velocity.',
            ],
          },
        ),
        'v',
        {
          // "d/dt (…) = …" keeps a constant derivative from reading as an equation in v.
          work: (v) => [
            `d/dt (${polyForm(cubic(v), 't')}) = ${polyForm(polyDerivative(cubic(v)), 't')}`,
          ],
        },
      ),
      withStep(
        rel(
          'a = 2c₂ + 6c₃t',
          '{a} = 2 × {c2} + 6 × {c3} × {t}',
          ['a', 'c2', 'c3', 't'],
          (v) => v.a! - (2 * v.c2! + 6 * v.c3! * v.t!),
          {
            a: [
              (v) => 2 * v.c2! + 6 * v.c3! * v.t!,
              (v) => `2 × ${signed(v.c2!)} + 6 × ${signed(v.c3!)} × ${signed(v.t!)}`,
              'a = dv/dt: the power rule again, on v = c₁ + 2c₂t + 3c₃t². Put t in.',
            ],
            c2: [
              (v) => (v.a! - 6 * v.c3! * v.t!) / 2,
              '({a} − 6 × {c3} × {t}) ÷ 2',
              'Take 6c₃t away from a, then halve it.',
            ],
            t: [
              (v) => div(v.a! - 2 * v.c2!, 6 * v.c3!),
              '({a} − 2 × {c2}) ÷ (6 × {c3})',
              'Take 2c₂ away from a, then divide by 6c₃.',
            ],
          },
        ),
        'a',
        {
          work: (v) => {
            const dv = polyDerivative(cubic(v));
            return [`d/dt (${polyForm(dv, 't')}) = ${polyForm(polyDerivative(dv), 't')}`];
          },
        },
      ),
    ),
    // The plan's x = 2t³ − 9t² + 12t with c₀ = 4 m (a 0 with a unit fails the module tests):
    // x(3) = 4 + 36 − 81 + 54 = 13 m, v = 12 − 54 + 54 = 12 m/s, a = −18 + 36 = 18 m/s².
    example: { c3: 2, c2: -9, c1: 12, c0: 4, t: 3, x: 13, v: 12, a: 18 },
    startWith: ['c3', 'c2', 'c1', 'c0', 't'],
    representation: {
      kind: 'motionGraph',
      polynomial: {
        c0: 'c0',
        c1: 'c1',
        c2: 'c2',
        c3: 'c3',
        at: 't',
        position: 'x',
        velocity: 'v',
        acceleration: 'a',
      },
    },
  },
];

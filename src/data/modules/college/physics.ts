/**
 * College Physics: the calculator modules of every course whose home field is
 * `physics`, keyed by course topic (`<courseId>#<i>`, its problem types `<courseId>#<i>~<slug>`
 * after it), in taxonomy order. Course and topic titles come from taxonomy.ts. Layout pages are
 * in `../layouts/collegePhysics.ts`. Rules: docs/MODULE_GUIDE.md.
 */
import { asinD, atan2D, atanD, cosD, sinD, tanD } from '@/engine/angles';
import { formatNumber } from '@/engine/format';
import type { Values } from '@/engine/types';

import { div } from '../helpers';
import type { ModuleDef } from '../types';

import { polyDerivative, polyForm, termsForm } from './forms';
import {
  atLeastZero,
  derive,
  exact,
  plusMinus,
  rel,
  rels,
  rootOf,
  rule,
  signed,
  V,
  withStep,
} from './shared';

/** g on every college page (HE_NEEDS, Decisions 1). */
const G = 9.81;

/** cos θ in degrees, exactly 0 straight up or down (cos 90° is 6 × 10⁻¹⁷ in floating point). */
const levelCos = (q: number) => (Math.abs(Math.abs(q) - 90) < 1e-12 ? 0 : cosD(q));

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

/** x raised to a whole power 1–5, as a line prints it: "4³" (no power when it is 1). */
const powerOf = (x: number, k: number) => `${formatNumber(x)}${k === 1 ? '' : '¹²³⁴⁵'[k - 1]}`;

/** The work of F = cxⁿ from x₁ to x₂: c(x₂ⁿ⁺¹ − x₁ⁿ⁺¹) ÷ (n + 1). */
const powerWork = (v: Values) => (v.c! * (v.x2! ** (v.n! + 1) - v.x1! ** (v.n! + 1))) / (v.n! + 1);

/** "6x²", "6x", "6" (n = 0): the force cxⁿ with the page's numbers. */
const powerForce = (c: number, n: number) => polyForm([c, ...Array<number>(n).fill(0)]);

/** U(x) = ax³ − bx²'s coefficients, highest power first: [a, −b, 0, 0]. */
const potential = (v: Values) => [v.a!, -v.b!, 0, 0];

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
  {
    // University Physics I → Kinematics: a projectile's position and velocity at a time t.
    id: 'he.physics.university-1#0~projectile-at-t',
    title: 'A projectile’s position and velocity at a time',
    use: 'Use this for “A ball is thrown from 2 m up at 20 m/s, 60° above level. Where is it 2.5 s later, and how fast and which way is it moving?”',
    unitSystems: ['metric'],
    assumptions: [
      'No air resistance, and g = 9.81 m/s² downward; x is across from the launch point, y is height above level ground.',
      'Across nothing pushes, so vₓ = v₀ cos θ stays the same; v_y starts at v₀ sin θ and drops by 9.81 m/s every second.',
      'The angle θ is measured from level, + above and − below; φ is the direction of the velocity, measured the same way.',
    ],
    variables: [
      V('v0', 'v₀', 'Launch speed', { unit: 'm/s', min: 0, max: 500, step: 0.1 }),
      V('q', 'θ', 'Launch angle', { unit: '°', min: -90, max: 90, step: 0.1 }),
      V('h', 'h', 'Launch height', { unit: 'm', min: 0, max: 1000, step: 0.1 }),
      V('t', 't', 'Time after launch', { unit: 's', min: 0, max: 200, step: 0.01 }),
      V('x', 'x', 'Distance across at t', { unit: 'm', min: 0, max: 1e5, step: 0.01 }),
      V('y', 'y', 'Height at t', { unit: 'm', min: 0, max: 2e4, step: 0.01 }),
      V('vx', 'vₓ', 'Horizontal velocity', { unit: 'm/s', min: 0, max: 500, derived: true }),
      V('vy', 'v_y', 'Vertical velocity at t', {
        unit: 'm/s',
        min: -3000,
        max: 500,
        derived: true,
      }),
      V('v', 'v', 'Speed at t', { unit: 'm/s', min: 0, max: 3000, derived: true }),
      V('phi', 'φ', 'Direction at t', { unit: '°', min: -90, max: 90, derived: true }),
    ],
    ...rels(
      rule(
        'y ≥ 0',
        'The ball is still in the air: {y} is 0 or more',
        ['y'],
        (v) => v.y! >= -1e-9,
        'The ball has landed by then (y would be below the ground): pick an earlier time t.',
      ),
      derive(
        'vₓ = v₀ cos θ',
        '{vx} = {v0} × cos({q}°)',
        'vx',
        ['v0', 'q'],
        (v) => v.v0! * levelCos(v.q!),
        '{v0} × cos({q}°)',
        'The across part of the launch velocity. Nothing pushes across, so it stays the same all flight.',
      ),
      rule(
        'x = 0 when vₓ = 0',
        'Straight up or down, the ball never moves across: {x} = 0 when {vx} = 0',
        ['x', 'vx'],
        (v) => v.vx! !== 0 || Math.abs(v.x!) < 1e-9,
        'Thrown straight up or down (vₓ = 0), the ball never moves across, so x stays 0.',
      ),
      derive(
        'v_y = v₀ sin θ − gt',
        '{vy} = {v0} × sin({q}°) − 9.81 × {t}',
        'vy',
        ['v0', 'q', 't'],
        (v) => v.v0! * sinD(v.q!) - G * v.t!,
        '{v0} × sin({q}°) − 9.81 × {t}',
        'The up part of the launch velocity, less the 9.81 m/s gravity takes off it every second.',
      ),
      rel('x = vₓt', '{x} = {vx} × {t}', ['x', 'vx', 't'], (v) => v.x! - v.vx! * v.t!, {
        x: [
          (v) => v.vx! * v.t!,
          '{vx} × {t}',
          'Across, the ball moves at a steady vₓ, so the distance is vₓ times the time.',
        ],
        t: [
          (v) => atLeastZero(div(v.x!, v.vx!)),
          '{x} ÷ {vx}',
          'Divide the distance across by the steady speed across.',
        ],
      }),
      rel(
        'y = h + v₀ sin θ · t − ½gt²',
        '{y} = {h} + {v0} × sin({q}°) × {t} − ½ × 9.81 × {t}²',
        ['y', 'h', 'v0', 'q', 't'],
        (v) => v.y! - v.h! - v.v0! * sinD(v.q!) * v.t! + (G / 2) * v.t! ** 2,
        {
          y: [
            (v) => exact(v.h! + v.v0! * sinD(v.q!) * v.t! - (G / 2) * v.t! ** 2),
            '{h} + {v0} × sin({q}°) × {t} − ½ × 9.81 × {t}²',
            'Start at h, rise at v₀ sin θ, and fall ½gt² below that.',
          ],
          h: [
            (v) => exact(v.y! - v.v0! * sinD(v.q!) * v.t! + (G / 2) * v.t! ** 2),
            '{y} − {v0} × sin({q}°) × {t} + ½ × 9.81 × {t}²',
            'Undo the rise and the fall to get back to the launch height.',
          ],
        },
      ),
      derive(
        'v = √(vₓ² + v_y²)',
        '{v} = √({vx}² + {vy}²)',
        'v',
        ['vx', 'vy'],
        (v) => Math.hypot(v.vx!, v.vy!),
        '√({vx}² + {vy}²)',
        'The two parts are at right angles, so the speed is their Pythagorean sum.',
      ),
      derive(
        'φ = tan⁻¹(v_y ÷ vₓ)',
        '{phi} = tan⁻¹({vy} ÷ {vx})',
        'phi',
        ['vx', 'vy'],
        (v) => (v.vx! > 1e-9 ? atan2D(v.vy!, v.vx!) : undefined),
        'tan⁻¹({vy} ÷ {vx})',
        'The angle whose tangent is v_y over vₓ: + means still rising, − means falling.',
      ),
    ),
    // 20 m/s at 60° from h = 2 m, t = 2.5 s: vₓ = 10 m/s, x = 25 m,
    // y = 2 + 43.30 − 30.66 = 14.65 m, v_y = 17.32 − 24.53 = −7.205 m/s, v = 12.32 m/s at −35.77°
    // (falling; it lands at T = 3.643 s, R = 36.43 m).
    example: (() => {
      const [v0, q, h, t] = [20, 60, 2, 2.5];
      const vx = v0 * cosD(q);
      const vy = v0 * sinD(q) - G * t;
      return {
        v0,
        q,
        h,
        t,
        vx,
        vy,
        x: vx * t,
        y: h + v0 * sinD(q) * t - (G / 2) * t * t,
        v: Math.hypot(vx, vy),
        phi: atan2D(vy, vx)!,
      };
    })(),
    startWith: ['v0', 'q', 'h', 't'],
    representation: {
      kind: 'projectile',
      speed: 'v0',
      angle: 'q',
      height: 'h',
      g: G,
      at: 't',
      x: 'x',
      y: 'y',
      vx: 'vx',
      parametric: true,
    },
  },
  {
    // University Physics I → Newton's laws: a block on a table pulled by a hanging block.
    id: 'he.physics.university-1#1',
    use: 'Use this for “A 4 kg block on a table (μₖ = 0.25) is pulled by a 2 kg block hanging over a pulley at the edge. Find the acceleration and the string’s tension.”',
    unitSystems: ['metric'],
    assumptions: [
      'A light string over a light, frictionless pulley, so the tension T is the same on both sides; g = 9.81 m/s².',
      'The string doesn’t stretch, so both blocks move together with one acceleration a.',
      'The table block is already sliding, so kinetic friction μₖm₁g holds it back.',
      'If m₂ ≤ μₖm₁, friction is enough to hold the blocks: once at rest, nothing slides.',
    ],
    variables: [
      V('m1', 'm₁', 'Mass on the table', { unit: 'kg', min: 0.01, max: 1000, step: 0.1 }),
      V('m2', 'm₂', 'Hanging mass', { unit: 'kg', min: 0.01, max: 1000, step: 0.1 }),
      V('mu', 'μₖ', 'Kinetic friction coefficient', { min: 0, max: 1.5, step: 0.01 }),
      V('a', 'a', 'Acceleration', { unit: 'm/s²', min: -100, max: G, derived: true }),
      V('T', 'T', 'Tension', { unit: 'N', min: 0, max: 1e5, derived: true }),
    ],
    ...rels(
      rel(
        'a = (m₂ − μₖm₁)g ÷ (m₁ + m₂)',
        '{a} = ({m2} − {mu} × {m1}) × 9.81 ÷ ({m1} + {m2})',
        ['a', 'm1', 'm2', 'mu'],
        (v) => v.a! * (v.m1! + v.m2!) - (v.m2! - v.mu! * v.m1!) * G,
        {
          a: [
            (v) => exact(((v.m2! - v.mu! * v.m1!) * G) / (v.m1! + v.m2!)),
            '({m2} − {mu} × {m1}) × 9.81 ÷ ({m1} + {m2})',
            'Add m₂g − T = m₂a and T − μₖm₁g = m₁a: T cancels. The hanging weight less the friction moves both masses.',
          ],
          mu: [
            (v) => div(v.m2! * G - v.a! * (v.m1! + v.m2!), v.m1! * G),
            '({m2} × 9.81 − {a} × ({m1} + {m2})) ÷ ({m1} × 9.81)',
            'The friction μₖm₁g is the hanging weight less the force that accelerates both blocks. Divide it by m₁g.',
          ],
          m2: [
            (v) => div(v.m1! * (v.a! + v.mu! * G), G - v.a!),
            '{m1} × ({a} + {mu} × 9.81) ÷ (9.81 − {a})',
            'Gather the m₂ terms of a(m₁ + m₂) = (m₂ − μₖm₁)g on one side, then divide by g − a.',
          ],
          m1: [
            (v) => div(v.m2! * (G - v.a!), v.a! + v.mu! * G),
            '{m2} × (9.81 − {a}) ÷ ({a} + {mu} × 9.81)',
            'Gather the m₁ terms of a(m₁ + m₂) = (m₂ − μₖm₁)g on one side, then divide by a + μₖg.',
          ],
        },
      ),
      rule(
        'a ≥ 0',
        'The blocks slide: {a} is 0 or more',
        ['a'],
        (v) => v.a! >= -1e-9,
        'The hanging weight m₂g is less than the friction μₖm₁g, so the blocks can’t speed up: once at rest, nothing slides.',
      ),
      rel(
        'T = m₂(g − a)',
        '{T} = {m2} × (9.81 − {a})',
        ['T', 'm2', 'a'],
        (v) => v.T! - v.m2! * (G - v.a!),
        {
          T: [
            (v) => exact(v.m2! * (G - v.a!)),
            '{m2} × (9.81 − {a})',
            'Newton’s second law on the hanging block: m₂g − T = m₂a, so T is m₂g less m₂a.',
          ],
          a: [
            (v) => div(v.m2! * G - v.T!, v.m2!),
            '9.81 − {T} ÷ {m2}',
            'Undo T = m₂(g − a): divide T by m₂ and take it from g.',
          ],
        },
      ),
    ),
    // m₁ = 4 kg, m₂ = 2 kg, μₖ = 0.25: a = (2 − 1) × 9.81 ÷ 6 = 1.635 m/s²,
    // T = 2 × (9.81 − 1.635) = 16.35 N (on m₁: 16.35 − 0.25 × 4 × 9.81 = 6.54 = 4 × 1.635).
    example: { m1: 4, m2: 2, mu: 0.25, a: 1.635, T: 16.35 },
    startWith: ['m1', 'm2', 'mu'],
    representation: {
      kind: 'freeBody',
      g: G,
      pulley: { layout: 'table', m1: 'm1', m2: 'm2', mu: 'mu', a: 'a', T: 'T' },
    },
  },
  {
    // University Physics I → Newton's laws: an Atwood machine, both blocks hanging.
    id: 'he.physics.university-1#1~atwood',
    title: 'An Atwood machine: two hanging blocks',
    use: 'Use this for “Blocks of 3 kg and 5 kg hang from the two ends of a string over a pulley. Find their acceleration and the string’s tension.”',
    unitSystems: ['metric'],
    assumptions: [
      'A light string over a light, frictionless pulley, so the tension T is the same on both sides; g = 9.81 m/s².',
      'The string doesn’t stretch, so the blocks move together: as m₂ goes down by some distance, m₁ goes up by the same.',
      'a > 0 means the heavier m₂ goes down; with equal masses a = 0 and the blocks stay as they are.',
    ],
    variables: [
      V('m1', 'm₁', 'Left mass', { unit: 'kg', min: 0.01, max: 1000, step: 0.1 }),
      V('m2', 'm₂', 'Right mass', { unit: 'kg', min: 0.01, max: 1000, step: 0.1 }),
      V('a', 'a', 'Acceleration (m₂ down)', {
        unit: 'm/s²',
        min: -G,
        max: G,
        derived: true,
      }),
      V('T', 'T', 'Tension', { unit: 'N', min: 0, max: 1e5, derived: true }),
    ],
    ...rels(
      rel(
        'a = (m₂ − m₁)g ÷ (m₁ + m₂)',
        '{a} = ({m2} − {m1}) × 9.81 ÷ ({m1} + {m2})',
        ['a', 'm1', 'm2'],
        (v) => v.a! * (v.m1! + v.m2!) - (v.m2! - v.m1!) * G,
        {
          a: [
            (v) => exact(((v.m2! - v.m1!) * G) / (v.m1! + v.m2!)),
            '({m2} − {m1}) × 9.81 ÷ ({m1} + {m2})',
            'Add m₂g − T = m₂a and T − m₁g = m₁a: T cancels. The difference in weight moves both masses.',
          ],
          m2: [
            (v) => div(v.m1! * (G + v.a!), G - v.a!),
            '{m1} × (9.81 + {a}) ÷ (9.81 − {a})',
            'Gather the m₂ terms of a(m₁ + m₂) = (m₂ − m₁)g on one side, then divide by g − a.',
          ],
          m1: [
            (v) => div(v.m2! * (G - v.a!), G + v.a!),
            '{m2} × (9.81 − {a}) ÷ (9.81 + {a})',
            'Gather the m₁ terms of a(m₁ + m₂) = (m₂ − m₁)g on one side, then divide by g + a.',
          ],
        },
      ),
      rel(
        'T = 2m₁m₂g ÷ (m₁ + m₂)',
        '{T} = 2 × {m1} × {m2} × 9.81 ÷ ({m1} + {m2})',
        ['T', 'm1', 'm2'],
        (v) => v.T! * (v.m1! + v.m2!) - 2 * v.m1! * v.m2! * G,
        {
          T: [
            (v) => exact((2 * v.m1! * v.m2! * G) / (v.m1! + v.m2!)),
            '2 × {m1} × {m2} × 9.81 ÷ ({m1} + {m2})',
            'Put a into T − m₁g = m₁a: T = m₁(g + a), which simplifies to 2m₁m₂g over m₁ + m₂.',
          ],
          m1: [
            (v) => div(v.T! * v.m2!, 2 * v.m2! * G - v.T!),
            '{T} × {m2} ÷ (2 × {m2} × 9.81 − {T})',
            'Gather the m₁ terms of T(m₁ + m₂) = 2m₁m₂g on one side, then divide by 2m₂g − T.',
          ],
          m2: [
            (v) => div(v.T! * v.m1!, 2 * v.m1! * G - v.T!),
            '{T} × {m1} ÷ (2 × {m1} × 9.81 − {T})',
            'Gather the m₂ terms of T(m₁ + m₂) = 2m₁m₂g on one side, then divide by 2m₁g − T.',
          ],
        },
      ),
    ),
    // m₁ = 3 kg, m₂ = 5 kg: a = 2 × 9.81 ÷ 8 = 2.4525 m/s², T = 2 × 3 × 5 × 9.81 ÷ 8 = 36.79 N
    // (on m₁: 36.79 − 29.43 = 7.358 = 3 × 2.4525; on m₂: 49.05 − 36.79 = 12.26 = 5 × 2.4525).
    example: { m1: 3, m2: 5, a: 2.4525, T: 36.7875 },
    startWith: ['m1', 'm2'],
    representation: {
      kind: 'freeBody',
      g: G,
      pulley: { layout: 'atwood', m1: 'm1', m2: 'm2', a: 'a', T: 'T' },
    },
  },
  {
    // University Physics I → Newton's laws: falling from rest against linear drag bv.
    id: 'he.physics.university-1#1~drag',
    title: 'Falling against linear drag: terminal speed',
    use: 'Use this for “A 2 kg ball is dropped from rest, and the air pushes back with 4 kg/s times its speed. Find its terminal speed and how fast it falls after 1 s.”',
    unitSystems: ['metric'],
    assumptions: [
      'Drag is bv, in proportion to the speed (slow, small objects); g = 9.81 m/s².',
      'The object starts from rest at t = 0 and falls straight down.',
      'The terminal speed v_T is where drag equals weight: bv_T = mg, so it stops speeding up.',
      'τ = m ÷ b; after 5τ the speed is within 1% of v_T.',
    ],
    variables: [
      V('m', 'm', 'Mass', { unit: 'kg', min: 0.001, max: 1000, step: 0.001 }),
      V('b', 'b', 'Drag constant', { unit: 'kg/s', min: 0.001, max: 1000, step: 0.001 }),
      V('vT', 'v_T', 'Terminal speed', { unit: 'm/s', min: 0, max: 1e7 }),
      V('tau', 'τ', 'Time constant', { unit: 's', min: 0, max: 1e6 }),
      V('t', 't', 'Time after release', { unit: 's', min: 0, max: 1e6, step: 0.01 }),
      V('v', 'v', 'Speed at t', { unit: 'm/s', min: 0, max: 1e7 }),
    ],
    ...rels(
      rel(
        'v_T = mg ÷ b',
        '{vT} = {m} × 9.81 ÷ {b}',
        ['vT', 'm', 'b'],
        (v) => v.vT! * v.b! - v.m! * G,
        {
          vT: [
            (v) => div(v.m! * G, v.b!),
            '{m} × 9.81 ÷ {b}',
            'At terminal speed drag balances weight, bv_T = mg, so divide the weight by b.',
          ],
          m: [
            (v) => (v.vT! * v.b!) / G,
            '{vT} × {b} ÷ 9.81',
            'The drag at terminal speed, bv_T, equals the weight mg: divide it by g.',
          ],
          b: [
            (v) => div(v.m! * G, v.vT!),
            '{m} × 9.81 ÷ {vT}',
            'The drag at terminal speed equals the weight mg: divide the weight by v_T.',
          ],
        },
      ),
      rel('τ = m ÷ b', '{tau} = {m} ÷ {b}', ['tau', 'm', 'b'], (v) => v.tau! * v.b! - v.m!, {
        tau: [
          (v) => div(v.m!, v.b!),
          '{m} ÷ {b}',
          'Newton’s second law, m dv/dt = mg − bv, changes the speed on the time scale m ÷ b.',
        ],
        m: [(v) => v.tau! * v.b!, '{tau} × {b}', 'Multiply the time constant by b.'],
        b: [(v) => div(v.m!, v.tau!), '{m} ÷ {tau}', 'Divide the mass by the time constant.'],
      }),
      rel(
        'v = v_T(1 − e^(−t/τ))',
        '{v} = {vT} × (1 − e^(−{t} ÷ {tau}))',
        ['v', 'vT', 't', 'tau'],
        (v) => v.v! - v.vT! * (1 - Math.exp(-v.t! / v.tau!)),
        {
          v: [
            (v) => (v.tau! > 0 ? exact(v.vT! * (1 - Math.exp(-v.t! / v.tau!))) : undefined),
            '{vT} × (1 − e^(−{t} ÷ {tau}))',
            'Solving m dv/dt = mg − bv from rest gives v = v_T(1 − e^(−t/τ)): the share of v_T reached so far.',
          ],
          vT: [
            (v) => div(v.v!, 1 - Math.exp(-v.t! / v.tau!)),
            '{v} ÷ (1 − e^(−{t} ÷ {tau}))',
            'Divide the speed by the share of the terminal speed reached so far.',
          ],
          t: [
            (v) => (v.v! < v.vT! ? -v.tau! * Math.log(1 - v.v! / v.vT!) : undefined),
            '−{tau} × ln(1 − {v} ÷ {vT})',
            'Undo the exponential with ln: t = −τ ln(1 − v ÷ v_T).',
          ],
        },
      ),
      rule(
        'v < v_T',
        'The speed stays below the terminal speed: {v} is less than {vT}',
        ['v', 'vT'],
        (v) => v.v! < v.vT! * (1 + 1e-9) || v.vT === 0,
        'From rest the speed only creeps up toward v_T; it never reaches or passes it.',
      ),
    ),
    // m = 2 kg, b = 4 kg/s: v_T = 2 × 9.81 ÷ 4 = 4.905 m/s, τ = 2 ÷ 4 = 0.5 s;
    // t = 1 s = 2τ: v = 4.905 × (1 − e⁻²) = 4.905 × 0.8647 = 4.241 m/s.
    example: (() => {
      const [m, b, t] = [2, 4, 1];
      const vT = (m * G) / b;
      const tau = m / b;
      return { m, b, t, vT, tau, v: vT * (1 - Math.exp(-t / tau)) };
    })(),
    startWith: ['m', 'b', 't'],
    // v(t) climbing to v_T (dashed), τ to 5τ marked, the 63.2% point ringed, the point at t.
    representation: {
      kind: 'functionGraph',
      family: 'response',
      transient: { initial: 0, final: 'vT', tau: 'tau', time: 't', value: 'v' },
    },
  },
  {
    // University Physics I → Newton's laws: the speed a frictionless banked curve is made for.
    id: 'he.physics.university-1#1~banked',
    title: 'A banked curve with no friction: the design speed',
    use: 'Use this for “A curve of radius 80 m is banked at 12°. At what speed can a 1500 kg car take it with no friction, and how hard does the road push on it?”',
    unitSystems: ['metric'],
    assumptions: [
      'No friction: only the normal force N and the weight mg act on the car; g = 9.81 m/s².',
      'The car goes round a level circle of radius r at a steady speed, so the net force points level, toward the center.',
      'Up and down: N cos θ = mg. Toward the center: N sin θ = mv² ÷ r.',
    ],
    variables: [
      V('r', 'r', 'Radius of the curve', { unit: 'm', min: 1, max: 1e4, step: 1 }),
      V('theta', 'θ', 'Bank angle', { unit: '°', min: 0, max: 80, step: 0.5 }),
      V('m', 'm', 'Mass of the car', { unit: 'kg', min: 0.1, max: 1e5, step: 10 }),
      V('v', 'v', 'Design speed', { unit: 'm/s', min: 0, max: 1000, derived: true }),
      V('N', 'N', 'Normal force', { unit: 'N', min: 0, max: 1e7, derived: true }),
    ],
    ...rels(
      rel(
        'tan θ = v² ÷ (rg)',
        'tan({theta}) = {v}² ÷ ({r} × 9.81)',
        ['v', 'r', 'theta'],
        (v) => v.v! ** 2 - v.r! * G * tanD(v.theta!),
        {
          v: [
            (v) => exact(Math.sqrt(v.r! * G * tanD(v.theta!))),
            '√({r} × 9.81 × tan({theta}))',
            'Divide N sin θ = mv² ÷ r by N cos θ = mg: N and the mass cancel, leaving tan θ = v² ÷ (rg).',
          ],
          r: [
            (v) => div(v.v! ** 2, G * tanD(v.theta!)),
            '{v}² ÷ (9.81 × tan({theta}))',
            'Undo tan θ = v² ÷ (rg) for r: divide v² by g tan θ.',
          ],
          theta: [
            (v) => atanD(v.v! ** 2 / (v.r! * G)),
            'tan⁻¹({v}² ÷ ({r} × 9.81))',
            'Undo tan θ = v² ÷ (rg) for the angle with tan⁻¹.',
          ],
        },
      ),
      rel(
        'N = mg ÷ cos θ',
        '{N} = {m} × 9.81 ÷ cos({theta})',
        ['N', 'm', 'theta'],
        (v) => v.N! * cosD(v.theta!) - v.m! * G,
        {
          N: [
            (v) => exact((v.m! * G) / cosD(v.theta!)),
            '{m} × 9.81 ÷ cos({theta})',
            'Up and down: the upward part of N, N cos θ, holds the weight mg.',
          ],
          m: [
            (v) => (v.N! * cosD(v.theta!)) / G,
            '{N} × cos({theta}) ÷ 9.81',
            'Undo N = mg ÷ cos θ for m: N cos θ is the weight, so divide it by g.',
          ],
        },
      ),
    ),
    // r = 50 m, θ = 15°, m = 1200 kg: v = √(50 × 9.81 × 0.26795) = √131.43 = 11.46 m/s;
    // N = 1200 × 9.81 ÷ 0.96593 = 12187 N (check: N sin θ = 3154 N = 1200 × 11.46² ÷ 50).
    example: (() => {
      const [r, theta, m] = [50, 15, 1200];
      return {
        r,
        theta,
        m,
        v: exact(Math.sqrt(r * G * tanD(theta))),
        N: exact((m * G) / cosD(theta)),
      };
    })(),
    startWith: ['r', 'theta', 'm'],
    // The car on the bank in section: N and mg on one scale, N's parts dashed, the net force
    // level toward the center.
    representation: {
      kind: 'freeBody',
      g: G,
      banked: { angle: 'theta', radius: 'r', speed: 'v', mass: 'm', normal: 'N' },
    },
  },
  {
    // University Physics I → Work and energy: the work a spring does between two stretches,
    // and the speed it gives a block.
    id: 'he.physics.university-1#2',
    use: 'Use this for “A spring (k = 60 N/m) on a smooth track is stretched 2 m and let go, pulling a 1.5 kg cart from rest. How much work has it done, and how fast is the cart, when the stretch is down to 0.5 m?”',
    unitSystems: ['metric'],
    assumptions: [
      'The spring obeys Hooke’s law, F = −kx, where x is the stretch from its natural length (+ stretched, − squeezed).',
      'The work by the spring from x₁ to x₂ is the area under the line kx between them: W = ∫ from x₂ to x₁ of kx dx.',
      'The track is smooth and the spring is light, so the spring’s work is the only work done on the cart.',
      'v₁ and v₂ are the cart’s speeds at x₁ and x₂.',
    ],
    // One unit for x and W: the picture's area is ∫kx dx in m and J.
    variables: [
      V('k', 'k', 'Spring constant', { unit: 'N/m', min: 0.1, max: 1e6, step: 1 }),
      V('x1', 'x₁', 'Start stretch', { unit: 'm', units: ['m'], min: -5, max: 5, step: 0.01 }),
      V('x2', 'x₂', 'End stretch', { unit: 'm', units: ['m'], min: -5, max: 5, step: 0.01 }),
      V('W', 'W', 'Work by the spring', {
        unit: 'J',
        units: ['J'],
        min: -1.25e7,
        max: 1.25e7,
        derived: true,
      }),
      V('m', 'm', 'Mass of the cart', { unit: 'kg', min: 0.001, max: 1e4, step: 0.01 }),
      V('v1', 'v₁', 'Start speed', { unit: 'm/s', min: 0, max: 1e5, step: 0.1 }),
      V('v2', 'v₂', 'End speed', { unit: 'm/s', min: 0, max: 1e5 }),
    ],
    ...rels(
      withStep(
        rel(
          'W = ½k(x₁² − x₂²)',
          '{W} = ½ × {k} × ({x1}² − {x2}²)',
          ['W', 'k', 'x1', 'x2'],
          (v) => v.W! - 0.5 * v.k! * (v.x1! ** 2 - v.x2! ** 2),
          {
            W: [
              (v) => exact(0.5 * v.k! * (v.x1! ** 2 - v.x2! ** 2)),
              '½ × {k} × ({x1}² − {x2}²)',
              'The spring pulls with −kx, so its work from x₁ to x₂ is the integral of kx from x₂ to x₁: ½kx² at x₁ less ½kx² at x₂.',
            ],
          },
        ),
        'W',
        {
          // The area under kx from x₂ to x₁, by the power rule (checked by quadrature).
          work: (v) => [
            `∫ from ${formatNumber(v.x2!)} to ${formatNumber(v.x1!)} of ${termsForm([[v.k!, 'x']])} dx = [${termsForm([[v.k! / 2, 'x²']])}] from ${formatNumber(v.x2!)} to ${formatNumber(v.x1!)}`,
          ],
        },
      ),
      rel(
        '½mv₂² = ½mv₁² + W',
        '½ × {m} × {v2}² = ½ × {m} × {v1}² + {W}',
        ['v2', 'v1', 'm', 'W'],
        (v) => 0.5 * v.m! * v.v2! ** 2 - 0.5 * v.m! * v.v1! ** 2 - v.W!,
        {
          v2: [
            (v) => rootOf(v.v1! ** 2 + (2 * v.W!) / v.m!, v.v1! ** 2),
            '√({v1}² + 2 × {W} ÷ {m})',
            'Work–energy theorem: the kinetic energy at x₂ is the kinetic energy at x₁ plus the spring’s work. Solve ½mv₂² for v₂.',
          ],
          v1: [
            (v) => rootOf(v.v2! ** 2 - (2 * v.W!) / v.m!, v.v2! ** 2),
            '√({v2}² − 2 × {W} ÷ {m})',
            'Take the spring’s work back off the kinetic energy at x₂, then solve ½mv₁² for v₁.',
          ],
          m: [
            (v) => div(2 * v.W!, v.v2! ** 2 - v.v1! ** 2),
            '2 × {W} ÷ ({v2}² − {v1}²)',
            'Undo W = ½m(v₂² − v₁²) for m: double the work, then divide by the change in v².',
          ],
        },
        {
          message: (v) =>
            v.v1 !== undefined &&
            v.W !== undefined &&
            v.m !== undefined &&
            v.v1 ** 2 + (2 * v.W) / v.m < -1e-9
              ? 'The spring takes more energy than the cart has: it stops and turns back before it reaches x₂.'
              : undefined,
        },
      ),
    ),
    // k = 40 N/m, x₁ = 3 m, x₂ = 1 m: W = ½ × 40 × (9 − 1) = 160 J;
    // m = 2 kg at v₁ = 3 m/s: v₂ = √(9 + 2 × 160 ÷ 2) = √169 = 13 m/s
    // (energy check: 9 + 180 = 169 + 20 = 189 J). Meters, not centimeters: the graph's x-axis
    // spans at least 5, so a band a few centimeters wide would be a sliver.
    example: { k: 40, x1: 3, x2: 1, W: 160, m: 2, v1: 3, v2: 13 },
    startWith: ['k', 'x1', 'x2', 'm', 'v1'],
    // The line kx with the band from x₂ to x₁ shaded: its area is the spring's work.
    representation: {
      kind: 'functionGraph',
      family: 'linear',
      m: 'k',
      b: 0,
      name: 'F',
      area: { from: 'x2', to: 'x1', value: 'W' },
      axes: { x: 'Stretch x (m)', y: 'Force kx (N)' },
    },
  },
  {
    // University Physics I → Work and energy: the work of a force that grows as a power of x,
    // the area under F = cxⁿ by the power rule.
    id: 'he.physics.university-1#2~power-law-force',
    title: 'Work by a force F = cxⁿ',
    use: 'Use this for “A force F = 0.5x³ N pushes a cart along a track from x = 2 m to x = 4 m. How much work does it do?”',
    unitSystems: ['metric'],
    assumptions: [
      'The force acts along x and depends only on where the object is: F = cxⁿ, with c in N/mⁿ so that F is in newtons.',
      'The work from x₁ to x₂ is the area under F between them: W = ∫ from x₁ to x₂ of cxⁿ dx.',
      'x is at least 0, so xⁿ is defined for every power n from 0 to 4; n = 0 is a constant force.',
    ],
    variables: [
      V('c', 'c', 'Force constant', { min: -1000, max: 1000, step: 0.1 }),
      V('n', 'n', 'Power of x', { min: 0, max: 4, step: 1, integer: true }),
      V('x1', 'x₁', 'Start position', fixed('m', 0, 100, 0.01)),
      V('x2', 'x₂', 'End position', fixed('m', 0, 100, 0.01)),
      V('W', 'W', 'Work by the force', fixed('J', -2e12, 2e12, 0.01, true)),
    ],
    ...rels(
      withStep(
        rel(
          'W = c(x₂ⁿ⁺¹ − x₁ⁿ⁺¹) ÷ (n + 1)',
          '{W} = {c} × ({x2}^({n} + 1) − {x1}^({n} + 1)) ÷ ({n} + 1)',
          ['W', 'c', 'n', 'x1', 'x2'],
          (v) => v.W! - powerWork(v),
          {
            W: [
              (v) => exact(powerWork(v)),
              (v) =>
                `${signed(v.c!)} × (${powerOf(v.x2!, v.n! + 1)} − ${powerOf(v.x1!, v.n! + 1)}) ÷ ${v.n! + 1}`,
              'Power rule: an antiderivative of cxⁿ is cxⁿ⁺¹ ÷ (n + 1). Take its value at x₂ less its value at x₁.',
            ],
            c: [
              (v) => div((v.n! + 1) * v.W!, v.x2! ** (v.n! + 1) - v.x1! ** (v.n! + 1)),
              (v) =>
                `${v.n! + 1} × ${signed(v.W!)} ÷ (${powerOf(v.x2!, v.n! + 1)} − ${powerOf(v.x1!, v.n! + 1)})`,
              'Undo the work formula for c: multiply the work by n + 1, then divide by x₂ⁿ⁺¹ − x₁ⁿ⁺¹.',
            ],
            x2: [
              (v) => {
                const k = v.n! + 1;
                const top = (k * v.W!) / v.c! + v.x1! ** k;
                if (!Number.isFinite(top)) return undefined;
                return top < 0 ? NaN : exact(top ** (1 / k));
              },
              (v) =>
                v.n === 0
                  ? `${signed(v.W!)} ÷ ${signed(v.c!)} + ${formatNumber(v.x1!)}`
                  : `(${v.n! + 1} × ${signed(v.W!)} ÷ ${signed(v.c!)} + ${powerOf(v.x1!, v.n! + 1)})^(1 ÷ ${v.n! + 1})`,
              'Multiply the work by n + 1 and divide by c to get x₂ⁿ⁺¹ − x₁ⁿ⁺¹. Add x₁ⁿ⁺¹, then take the (n + 1)-th root.',
            ],
          },
          {
            message: (v) =>
              v.n !== undefined &&
              v.W !== undefined &&
              v.c !== undefined &&
              v.x1 !== undefined &&
              v.c !== 0 &&
              ((v.n + 1) * v.W) / v.c + v.x1 ** (v.n + 1) < 0
                ? 'No end position works: the force would have to take back more work than it does between 0 and x₁.'
                : undefined,
          },
        ),
        'W',
        {
          // The area under cxⁿ from x₁ to x₂, by the power rule (checked by quadrature).
          work: (v) => {
            if (v.c === 0) return []; // no force, no area
            const [a, b] = [formatNumber(v.x1!), formatNumber(v.x2!)];
            const k = v.n! + 1;
            const anti = k === 1 ? powerForce(v.c!, 1) : `${powerForce(v.c!, k)} ÷ ${k}`;
            return [
              `∫ from ${a} to ${b} of ${powerForce(v.c!, v.n!)} dx = [${anti}] from ${a} to ${b}`,
            ];
          },
        },
      ),
    ),
    // F = 6x² N from 1 m to 4 m: W = 6 × (4³ − 1³) ÷ 3 = 6 × 63 ÷ 3 = 126 J. Meters from 1 to
    // 4: the graph's x-axis spans at least 5, so the band fills most of it.
    example: { c: 6, n: 2, x1: 1, x2: 4, W: 126 },
    startWith: ['c', 'n', 'x1', 'x2'],
    // The curve cxⁿ with the band from x₁ to x₂ shaded: its area is the work.
    representation: {
      kind: 'functionGraph',
      family: 'power',
      a: 'c',
      exponent: 'n',
      name: 'F',
      area: { from: 'x1', to: 'x2', value: 'W' },
      xMin: 0,
      axes: { x: 'Position x (m)', y: 'Force F (N)' },
    },
  },
  {
    // University Physics I → Work and energy: the force from a potential energy curve
    // U(x) = ax³ − bx², and its stable equilibrium.
    id: 'he.physics.university-1#2~potential-curve',
    title: 'Force and equilibrium from U(x) = ax³ − bx²',
    use: 'Use this for “A particle has potential energy U(x) = 2x³ − 6x² (U in J, x in m). Find the force on it at x = 0.5 m, and where it can rest in stable equilibrium.”',
    unitSystems: ['metric'],
    assumptions: [
      'The force is conservative, with potential energy U(x) = ax³ − bx²: a in J/m³ and b in J/m², both positive.',
      'The force is the downhill slope of U: F = −dU/dx, so F > 0 pushes toward +x.',
      'Equilibrium is where F = 0. It is stable at a minimum of U (U″ > 0) and unstable at a maximum.',
      'U″ = 6ax − 2b, so the minimum at x_s = 2b ÷ (3a) is stable (U″ = 2b) and x = 0 is unstable (U″ = −2b).',
    ],
    variables: [
      V('a', 'a', 'Cubic coefficient', { min: 0.001, max: 1000, step: 0.01 }),
      V('b', 'b', 'Square coefficient', { min: 0.001, max: 1000, step: 0.01 }),
      V('x', 'x', 'Position', fixed('m', -100, 100, 0.01)),
      V('U', 'U', 'Potential energy', fixed('J', -1e10, 1e10, 0.01, true)),
      V('F', 'F', 'Force', fixed('N', -1e10, 1e10, 0.01, true)),
      V('xs', 'x_s', 'Stable position', fixed('m', 0, 1e6, 0.01, true)),
      V('Us', 'U_s', 'Energy at the stable position', fixed('J', -1e15, 0, 0.01, true)),
    ],
    ...rels(
      withStep(
        rel(
          'U = ax³ − bx²',
          '{U} = {a} × {x}³ − {b} × {x}²',
          ['U', 'a', 'b', 'x'],
          (v) => v.U! - (v.a! * v.x! ** 3 - v.b! * v.x! ** 2),
          {
            U: [
              (v) => exact(v.a! * v.x! ** 3 - v.b! * v.x! ** 2),
              (v) =>
                `${formatNumber(v.a!)} × ${signed(v.x!)}³ − ${formatNumber(v.b!)} × ${signed(v.x!)}²`,
              'Put the position into U(x), one term at a time.',
            ],
            a: [
              (v) => div(v.U! + v.b! * v.x! ** 2, v.x! ** 3),
              '({U} + {b} × {x}²) ÷ {x}³',
              'Add bx² to U, then divide by x³.',
            ],
            b: [
              (v) => div(v.a! * v.x! ** 3 - v.U!, v.x! ** 2),
              '({a} × {x}³ − {U}) ÷ {x}²',
              'Take U away from ax³, then divide by x².',
            ],
          },
        ),
        'U',
        { work: (v) => [`U(x) = ${polyForm(potential(v))}`] },
      ),
      withStep(
        rel(
          'F = −3ax² + 2bx',
          '{F} = −3 × {a} × {x}² + 2 × {b} × {x}',
          ['F', 'a', 'b', 'x'],
          (v) => v.F! - (-3 * v.a! * v.x! ** 2 + 2 * v.b! * v.x!),
          {
            F: [
              (v) => exact(-3 * v.a! * v.x! ** 2 + 2 * v.b! * v.x!),
              (v) =>
                `−3 × ${formatNumber(v.a!)} × ${signed(v.x!)}² + 2 × ${formatNumber(v.b!)} × ${signed(v.x!)}`,
              'F = −dU/dx. By the power rule dU/dx = 3ax² − 2bx; change its sign and put x in.',
            ],
            a: [
              (v) => div(2 * v.b! * v.x! - v.F!, 3 * v.x! ** 2),
              '(2 × {b} × {x} − {F}) ÷ (3 × {x}²)',
              'Take F away from 2bx, then divide by 3x².',
            ],
            b: [
              (v) => div(v.F! + 3 * v.a! * v.x! ** 2, 2 * v.x!),
              '({F} + 3 × {a} × {x}²) ÷ (2 × {x})',
              'Add 3ax² to F, then divide by 2x.',
            ],
          },
        ),
        'F',
        {
          // dU/dx by the power rule (checked by a finite difference); F is its negative.
          work: (v) => [
            `d/dx (${polyForm(potential(v))}) = ${polyForm(polyDerivative(potential(v)))}`,
          ],
        },
      ),
      withStep(
        rel(
          'x_s = 2b ÷ (3a)',
          '{xs} = 2 × {b} ÷ (3 × {a})',
          ['xs', 'a', 'b'],
          (v) => v.xs! - (2 * v.b!) / (3 * v.a!),
          {
            xs: [
              (v) => exact(div(2 * v.b!, 3 * v.a!) ?? NaN),
              '2 × {b} ÷ (3 × {a})',
              'F = 0 where 3ax² − 2bx = x(3ax − 2b) = 0: at x = 0 and at x = 2b ÷ (3a). U″ = 2b > 0 at the second, a minimum.',
            ],
            b: [
              (v) => (3 * v.a! * v.xs!) / 2,
              '3 × {a} × {xs} ÷ 2',
              'Multiply x_s by 3a, then halve it.',
            ],
            a: [
              (v) => div(2 * v.b!, 3 * v.xs!),
              '2 × {b} ÷ (3 × {xs})',
              'Double b, then divide by 3x_s.',
            ],
          },
        ),
        'xs',
        {
          work: (v) => {
            const d1 = polyDerivative(potential(v));
            return [`U′(x) = ${polyForm(d1)}`, `U″(x) = ${polyForm(polyDerivative(d1))}`];
          },
        },
      ),
      derive(
        'U_s = ax_s³ − bx_s²',
        '{Us} = {a} × {xs}³ − {b} × {xs}²',
        'Us',
        ['a', 'b', 'xs'],
        (v) => v.a! * v.xs! ** 3 - v.b! * v.xs! ** 2,
        (v) =>
          `${formatNumber(v.a!)} × ${formatNumber(v.xs!)}³ − ${formatNumber(v.b!)} × ${formatNumber(v.xs!)}²`,
        'Put the stable position into U(x): the bottom of the well.',
      ),
    ),
    // U = x³ − 3x² at x = 1 m: U = 1 − 3 = −2 J, F = −3 + 6 = +3 N (toward the well);
    // x_s = 2 × 3 ÷ 3 = 2 m, U_s = 8 − 12 = −4 J.
    example: { a: 1, b: 3, x: 1, U: -2, F: 3, xs: 2, Us: -4 },
    startWith: ['a', 'b', 'x'],
    // The cubic U(x) with the point at x and its tangent (slope dU/dx = −F); the maximum at 0
    // and the minimum at x_s ringed.
    representation: {
      kind: 'functionGraph',
      family: 'expr',
      expr: 'a*x^3 - b*x^2',
      name: 'U',
      at: { x: 'x', y: 'U' },
      tangent: { x: 'x', y: 'U' },
      marks: ['extrema'],
      axes: { x: 'Position x (m)', y: 'Potential energy U (J)' },
    },
  },
  {
    // University Physics I → Work and energy: a sled down a rough slope; the height it drops
    // gives energy, friction turns some of it into heat.
    id: 'he.physics.university-1#2~friction-energy',
    title: 'Energy down a rough slope: heat and the end speed',
    use: 'Use this for “A 40 kg sled starts down a 50 m slope at 20° moving at 3 m/s, with μₖ = 0.08. How much heat does friction make, and how fast is the sled at the bottom?”',
    unitSystems: ['metric'],
    assumptions: [
      'The slope is straight, and the sled slides the whole length d without leaving it; g = 9.81 m/s².',
      'Kinetic friction μₖN acts all the way down, where the normal force is N = mg cos θ.',
      'Friction’s work turns into heat Q = fd; no other force does work (no push, no air drag).',
      'Energy: ½mv² = ½mv₀² + mgh − Q, where h = d sin θ is the height the sled drops.',
    ],
    variables: [
      V('m', 'm', 'Mass of the sled', { unit: 'kg', min: 0.01, max: 1e4, step: 0.1 }),
      V('d', 'd', 'Slope length', { unit: 'm', min: 0, max: 1e4, step: 0.1 }),
      V('theta', 'θ', 'Slope angle', { unit: '°', min: 0, max: 89, step: 0.5 }),
      V('mu', 'μₖ', 'Kinetic friction coefficient', { min: 0, max: 1.5, step: 0.01 }),
      V('v0', 'v₀', 'Start speed', { unit: 'm/s', min: 0, max: 1000, step: 0.1 }),
      V('h', 'h', 'Height drop', { unit: 'm', min: 0, max: 1e4, derived: true }),
      V('f', 'f', 'Friction force', { unit: 'N', min: 0, max: 2e5, derived: true }),
      V('Q', 'Q', 'Heat from friction', { unit: 'J', min: 0, max: 2e9, derived: true }),
      V('v', 'v', 'End speed', { unit: 'm/s', min: 0, max: 1e4, derived: true }),
    ],
    ...rels(
      rel(
        'h = d sin θ',
        '{h} = {d} × sin({theta})',
        ['h', 'd', 'theta'],
        (v) => v.h! - v.d! * sinD(v.theta!),
        {
          h: [
            (v) => exact(v.d! * sinD(v.theta!)),
            '{d} × sin({theta})',
            'The slope is the long side of a right triangle; the drop is the side opposite θ.',
          ],
          d: [
            (v) => div(v.h!, sinD(v.theta!)),
            '{h} ÷ sin({theta})',
            'Undo h = d sin θ for the length: divide the drop by sin θ.',
          ],
          theta: [
            (v) => {
              const r = div(v.h!, v.d!);
              return r === undefined ? undefined : (asinD(r) ?? NaN);
            },
            'sin⁻¹({h} ÷ {d})',
            'The sine of the slope angle is the drop over the length.',
          ],
        },
      ),
      rel(
        'f = μₖmg cos θ',
        '{f} = {mu} × {m} × 9.81 × cos({theta})',
        ['f', 'mu', 'm', 'theta'],
        (v) => v.f! - v.mu! * v.m! * G * cosD(v.theta!),
        {
          f: [
            (v) => exact(v.mu! * v.m! * G * cosD(v.theta!)),
            '{mu} × {m} × 9.81 × cos({theta})',
            'Into the slope the forces balance, so N = mg cos θ. Kinetic friction is μₖ times N.',
          ],
          mu: [
            (v) => div(v.f!, v.m! * G * cosD(v.theta!)),
            '{f} ÷ ({m} × 9.81 × cos({theta}))',
            'Friction over the normal force mg cos θ gives the coefficient.',
          ],
          m: [
            (v) => div(v.f!, v.mu! * G * cosD(v.theta!)),
            '{f} ÷ ({mu} × 9.81 × cos({theta}))',
            'Undo f = μₖmg cos θ for the mass: divide f by μₖg cos θ.',
          ],
        },
      ),
      rel('Q = fd', '{Q} = {f} × {d}', ['Q', 'f', 'd'], (v) => v.Q! - v.f! * v.d!, {
        Q: [
          (v) => exact(v.f! * v.d!),
          '{f} × {d}',
          'Friction pushes against the motion the whole length d, so its work, −fd, becomes heat fd.',
        ],
        f: [(v) => div(v.Q!, v.d!), '{Q} ÷ {d}', 'Divide the heat by the length of the slope.'],
        d: [(v) => div(v.Q!, v.f!), '{Q} ÷ {f}', 'Divide the heat by the friction force.'],
      }),
      rel(
        '½mv² = ½mv₀² + mgh − Q',
        '½ × {m} × {v}² = ½ × {m} × {v0}² + {m} × 9.81 × {h} − {Q}',
        ['v', 'v0', 'm', 'h', 'Q'],
        (v) => 0.5 * v.m! * v.v! ** 2 - 0.5 * v.m! * v.v0! ** 2 - v.m! * G * v.h! + v.Q!,
        {
          v: [
            (v) =>
              exact(
                rootOf(v.v0! ** 2 + 2 * G * v.h! - (2 * v.Q!) / v.m!, v.v0! ** 2 + 2 * G * v.h!),
              ),
            '√({v0}² + 2 × 9.81 × {h} − 2 × {Q} ÷ {m})',
            'The kinetic energy at the bottom is the start’s, plus mgh from the drop, less the heat. Solve ½mv² for v.',
          ],
          v0: [
            (v) => rootOf(v.v! ** 2 - 2 * G * v.h! + (2 * v.Q!) / v.m!, v.v! ** 2 + 2 * G * v.h!),
            '√({v}² − 2 × 9.81 × {h} + 2 × {Q} ÷ {m})',
            'Take the drop’s mgh off the kinetic energy at the bottom and give back the heat, then solve ½mv₀² for v₀.',
          ],
          Q: [
            (v) => exact(0.5 * v.m! * v.v0! ** 2 + v.m! * G * v.h! - 0.5 * v.m! * v.v! ** 2),
            '½ × {m} × {v0}² + {m} × 9.81 × {h} − ½ × {m} × {v}²',
            'The heat is the energy the sled had, ½mv₀² + mgh, less the kinetic energy it ends with.',
          ],
          h: [
            (v) => div(0.5 * v.v! ** 2 - 0.5 * v.v0! ** 2 + v.Q! / v.m!, G),
            '(½ × {v}² − ½ × {v0}² + {Q} ÷ {m}) ÷ 9.81',
            'Divide the energy balance by m, gather the gh term, then divide by g.',
          ],
        },
        {
          message: (v) =>
            v.v0 !== undefined &&
            v.h !== undefined &&
            v.Q !== undefined &&
            v.m !== undefined &&
            v.v0 ** 2 + 2 * G * v.h - (2 * v.Q) / v.m < -1e-9
              ? 'Friction takes more energy than the sled has: it stops on the slope before the bottom.'
              : undefined,
        },
      ),
    ),
    // m = 5 kg at v₀ = 2 m/s, d = 20 m at 30°, μₖ = 0.1: h = 20 × 0.5 = 10 m;
    // f = 0.1 × 5 × 9.81 × 0.86603 = 4.2479 N, Q = 4.2479 × 20 = 84.957 J;
    // v = √(4 + 2 × 9.81 × 10 − 2 × 84.957 ÷ 5) = √(200.2 − 33.983) = √166.22 = 12.893 m/s
    // (energy check: 10 J + 490.5 J = 415.54 J kinetic + 84.957 J heat).
    example: (() => {
      const [m, d, theta, mu, v0] = [5, 20, 30, 0.1, 2];
      const h = exact(d * sinD(theta));
      const f = exact(mu * m * G * cosD(theta));
      const Q = exact(f * d);
      return {
        m,
        d,
        theta,
        mu,
        v0,
        h,
        f,
        Q,
        v: exact(Math.sqrt(v0 ** 2 + 2 * G * h - (2 * Q) / m)),
      };
    })(),
    startWith: ['m', 'd', 'theta', 'mu', 'v0'],
    // The sled on the slope, sliding down: its weight, the normal force and kinetic friction
    // μₖN up the slope, to scale (friction's f times d is the heat).
    representation: {
      kind: 'freeBody',
      support: 'incline',
      moving: 'down',
      g: G,
      mass: 'm',
      incline: 'theta',
      mu: 'mu',
      friction: 'f',
    },
  },
];

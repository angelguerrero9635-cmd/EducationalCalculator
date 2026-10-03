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

/** A mass worked out from a total: none when the others already use it all up. */
const positive = (x: number) => (x > 0 ? x : undefined);

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
  {
    // University Physics I → Momentum: two cars meet at a crossing and stick; momentum is kept
    // east and north separately, and the wreck moves off along the total momentum.
    id: 'he.physics.university-1#3',
    use: 'Use this for “A 1200 kg car going east at 25 m/s hits a 1800 kg van going north at 10 m/s, and they lock together. How fast and in what direction do they slide?”',
    unitSystems: ['metric'],
    assumptions: [
      'No outside force acts during the crash (road friction is small over that short time), so momentum is kept east and north separately.',
      'Object 1 moves east and object 2 moves north before the crash; afterward they stick and move as one mass m₁ + m₂.',
      'Kinetic energy is not kept: the energy lost goes into bending, heat and sound.',
      'The direction θ is measured from east toward north.',
    ],
    variables: [
      V('m1', 'm₁', 'Mass of object 1', { unit: 'kg', min: 0.001, max: 1e5, step: 1 }),
      V('v1', 'v₁', 'Speed of object 1 (east)', { unit: 'm/s', min: 0, max: 500, step: 0.1 }),
      V('m2', 'm₂', 'Mass of object 2', { unit: 'kg', min: 0.001, max: 1e5, step: 1 }),
      V('v2', 'v₂', 'Speed of object 2 (north)', { unit: 'm/s', min: 0, max: 500, step: 0.1 }),
      V('px', 'pₓ', 'Momentum east', { unit: 'kg·m/s', min: 0, max: 5e7, derived: true }),
      V('py', 'p_y', 'Momentum north', { unit: 'kg·m/s', min: 0, max: 5e7, derived: true }),
      V('p', 'p', 'Total momentum', { unit: 'kg·m/s', min: 0, max: 7.1e7, derived: true }),
      V('v', 'v', 'Speed after the crash', { unit: 'm/s', min: 0, max: 500, derived: true }),
      V('theta', 'θ', 'Direction north of east', { unit: '°', min: 0, max: 90, derived: true }),
      V('K', 'K_lost', 'Kinetic energy lost', { unit: 'J', min: 0, max: 2.5e10, derived: true }),
    ],
    ...rels(
      rel('pₓ = m₁v₁', '{px} = {m1} × {v1}', ['px', 'm1', 'v1'], (v) => v.px! - v.m1! * v.v1!, {
        px: [
          (v) => exact(v.m1! * v.v1!),
          '{m1} × {v1}',
          'Only object 1 moves east, so all the momentum east is its own, mass times speed.',
        ],
        m1: [
          (v) => div(v.px!, v.v1!),
          '{px} ÷ {v1}',
          'Divide the momentum east by the speed east.',
        ],
        v1: [(v) => div(v.px!, v.m1!), '{px} ÷ {m1}', 'Divide the momentum east by the mass.'],
      }),
      rel('p_y = m₂v₂', '{py} = {m2} × {v2}', ['py', 'm2', 'v2'], (v) => v.py! - v.m2! * v.v2!, {
        py: [
          (v) => exact(v.m2! * v.v2!),
          '{m2} × {v2}',
          'Only object 2 moves north, so all the momentum north is its own, mass times speed.',
        ],
        m2: [
          (v) => div(v.py!, v.v2!),
          '{py} ÷ {v2}',
          'Divide the momentum north by the speed north.',
        ],
        v2: [(v) => div(v.py!, v.m2!), '{py} ÷ {m2}', 'Divide the momentum north by the mass.'],
      }),
      rel(
        'p = √(pₓ² + p_y²)',
        '{p} = √({px}² + {py}²)',
        ['p', 'px', 'py'],
        (v) => v.p! - Math.hypot(v.px!, v.py!),
        {
          p: [
            (v) => exact(Math.hypot(v.px!, v.py!)),
            '√({px}² + {py}²)',
            'The east and north momenta are at right angles, so the total is the hypotenuse of their right triangle.',
          ],
          px: [
            (v) => rootOf(v.p! ** 2 - v.py! ** 2, v.p! ** 2),
            '√({p}² − {py}²)',
            'The momentum east is the other leg of the right triangle: take p_y² from p².',
          ],
          py: [
            (v) => rootOf(v.p! ** 2 - v.px! ** 2, v.p! ** 2),
            '√({p}² − {px}²)',
            'The momentum north is the other leg of the right triangle: take pₓ² from p².',
          ],
        },
      ),
      rel(
        'tan θ = p_y ÷ pₓ',
        'tan({theta}) = {py} ÷ {px}',
        ['theta', 'px', 'py'],
        (v) => v.py! * cosD(v.theta!) - v.px! * sinD(v.theta!),
        {
          theta: [
            (v) => (v.px! === 0 && v.py! === 0 ? undefined : atan2D(v.py!, v.px!)),
            (v) => (v.px === 0 ? '90' : 'tan⁻¹({py} ÷ {px})'),
            (v) =>
              v.px === 0
                ? 'With no momentum east, the total momentum and the wreck point straight north.'
                : 'The wreck moves along the total momentum; its angle from east has tangent north over east.',
          ],
          py: [
            (v) => exact(v.px! * tanD(v.theta!)),
            '{px} × tan({theta})',
            'Undo tan θ = p_y ÷ pₓ: multiply the momentum east by tan θ.',
          ],
        },
      ),
      rel(
        'v = p ÷ (m₁ + m₂)',
        '{v} = {p} ÷ ({m1} + {m2})',
        ['v', 'p', 'm1', 'm2'],
        (v) => v.v! * (v.m1! + v.m2!) - v.p!,
        {
          v: [
            (v) => div(v.p!, v.m1! + v.m2!),
            '{p} ÷ ({m1} + {m2})',
            'After the crash the two move as one mass m₁ + m₂ carrying the same total momentum.',
          ],
          p: [
            (v) => exact(v.v! * (v.m1! + v.m2!)),
            '{v} × ({m1} + {m2})',
            'The joined mass times its speed is the total momentum.',
          ],
        },
      ),
      derive(
        'K_lost = m₁m₂(v₁² + v₂²) ÷ (2(m₁ + m₂))',
        '{K} = {m1} × {m2} × ({v1}² + {v2}²) ÷ (2 × ({m1} + {m2}))',
        'K',
        ['m1', 'v1', 'm2', 'v2'],
        (v) => (v.m1! * v.m2! * (v.v1! ** 2 + v.v2! ** 2)) / (2 * (v.m1! + v.m2!)),
        '{m1} × {m2} × ({v1}² + {v2}²) ÷ (2 × ({m1} + {m2}))',
        'Kinetic energy before, ½m₁v₁² + ½m₂v₂², less after, p² ÷ 2(m₁ + m₂), simplifies to this: the energy of their speed toward each other.',
      ),
    ),
    // m₁ = 1500 kg at 20 m/s east, m₂ = 2500 kg at 15 m/s north: pₓ = 30,000 kg·m/s,
    // p_y = 37,500 kg·m/s, p = √(9 × 10⁸ + 1.40625 × 10⁹) = 48,023 kg·m/s;
    // v = 48,023 ÷ 4000 = 12.006 m/s at tan⁻¹(1.25) = 51.34° north of east;
    // K before 300,000 + 281,250 = 581,250 J, after p² ÷ 2M = 288,281 J, lost 292,969 J
    // (= 1500 × 2500 × 625 ÷ 8000).
    example: (() => {
      const [m1, v1, m2, v2] = [1500, 20, 2500, 15];
      const px = m1 * v1;
      const py = m2 * v2;
      const p = exact(Math.hypot(px, py));
      const v = exact(p / (m1 + m2));
      return {
        m1,
        v1,
        m2,
        v2,
        px,
        py,
        p,
        v,
        theta: exact(atan2D(py, px)!),
        K: exact((m1 * m2 * (v1 ** 2 + v2 ** 2)) / (2 * (m1 + m2))),
      };
    })(),
    startWith: ['m1', 'v1', 'm2', 'v2'],
    // p₁ east and p₂ north, tip to tail, close on the total momentum p: the wreck's direction.
    representation: {
      kind: 'vectorDiagram',
      vectors: [
        { name: 'p₁', magnitude: 'px', direction: 0 },
        { name: 'p₂', magnitude: 'py', direction: 90 },
      ],
      sum: 'tipToTail',
      result: { name: 'p', x: 'px', y: 'py', magnitude: 'p', direction: 'theta' },
      unit: 'kg·m/s',
      axes: { x: 'east', y: 'north' },
    },
  },
  {
    // University Physics I → Momentum: a 1D elastic collision with both objects moving, worked
    // in the center-of-mass frame, where each velocity simply reverses.
    id: 'he.physics.university-1#3~elastic',
    title: 'An elastic collision in 1D, both moving',
    use: 'Use this for “A 0.5 kg puck sliding east at 3 m/s catches a 1.5 kg puck sliding east at 1 m/s, and they bounce apart elastically. What are their velocities after?”',
    unitSystems: ['metric'],
    assumptions: [
      'The collision is head-on along one line and elastic: total momentum and total kinetic energy are both kept.',
      '+ points from object 1 toward object 2; a velocity the other way is negative. No outside force acts during the short contact.',
      'The center of mass moves at v_cm = p ÷ (m₁ + m₂) throughout. Seen riding along with it, each object’s velocity just reverses, so v′ = 2v_cm − v.',
    ],
    variables: [
      V('m1', 'm₁', 'Mass of object 1', { unit: 'kg', min: 0.001, max: 1e5, step: 0.1 }),
      V('v1', 'v₁', 'Velocity of object 1 before', { unit: 'm/s', min: -500, max: 500, step: 0.1 }),
      V('m2', 'm₂', 'Mass of object 2', { unit: 'kg', min: 0.001, max: 1e5, step: 0.1 }),
      V('v2', 'v₂', 'Velocity of object 2 before', { unit: 'm/s', min: -500, max: 500, step: 0.1 }),
      V('p', 'p', 'Total momentum', { unit: 'kg·m/s', min: -1e8, max: 1e8, derived: true }),
      V('vcm', 'v_cm', 'Velocity of the center of mass', {
        unit: 'm/s',
        min: -500,
        max: 500,
        derived: true,
      }),
      V('v1p', 'v₁′', 'Velocity of object 1 after', {
        unit: 'm/s',
        min: -1500,
        max: 1500,
        derived: true,
      }),
      V('v2p', 'v₂′', 'Velocity of object 2 after', {
        unit: 'm/s',
        min: -1500,
        max: 1500,
        derived: true,
      }),
      V('K', 'K', 'Kinetic energy before', { unit: 'J', min: 0, max: 2.5e10, derived: true }),
      V('Kp', 'K′', 'Kinetic energy after', { unit: 'J', min: 0, max: 2.5e10, derived: true }),
    ],
    ...rels(
      rule(
        'v₁ > v₂',
        'Object 1 catches object 2: {v1} is more than {v2}',
        ['v1', 'v2'],
        (v) => v.v1! > v.v2!,
        'Object 1 is behind object 2, so it must move faster toward +, or the two never meet.',
      ),
      rel(
        'p = m₁v₁ + m₂v₂',
        '{p} = {m1} × {v1} + {m2} × {v2}',
        ['p', 'm1', 'v1', 'm2', 'v2'],
        (v) => v.p! - v.m1! * v.v1! - v.m2! * v.v2!,
        {
          p: [
            (v) => exact(v.m1! * v.v1! + v.m2! * v.v2!),
            '{m1} × {v1} + {m2} × {v2}',
            'Each object’s momentum is its mass times its velocity, sign included; the total is their sum.',
          ],
          v1: [
            (v) => div(v.p! - v.m2! * v.v2!, v.m1!),
            '({p} − {m2} × {v2}) ÷ {m1}',
            'Take object 2’s momentum from the total, then divide by object 1’s mass.',
          ],
          v2: [
            (v) => div(v.p! - v.m1! * v.v1!, v.m2!),
            '({p} − {m1} × {v1}) ÷ {m2}',
            'Take object 1’s momentum from the total, then divide by object 2’s mass.',
          ],
          m1: [
            (v) => div(v.p! - v.m2! * v.v2!, v.v1!),
            '({p} − {m2} × {v2}) ÷ {v1}',
            'Object 1’s momentum is the total less object 2’s; divide it by object 1’s velocity.',
          ],
          m2: [
            (v) => div(v.p! - v.m1! * v.v1!, v.v2!),
            '({p} − {m1} × {v1}) ÷ {v2}',
            'Object 2’s momentum is the total less object 1’s; divide it by object 2’s velocity.',
          ],
        },
      ),
      rel(
        'v_cm = p ÷ (m₁ + m₂)',
        '{vcm} = {p} ÷ ({m1} + {m2})',
        ['vcm', 'p', 'm1', 'm2'],
        (v) => v.vcm! * (v.m1! + v.m2!) - v.p!,
        {
          vcm: [
            (v) => div(v.p!, v.m1! + v.m2!),
            '{p} ÷ ({m1} + {m2})',
            'The center of mass carries the total momentum as if all the mass were there, so divide p by m₁ + m₂.',
          ],
          p: [
            (v) => exact(v.vcm! * (v.m1! + v.m2!)),
            '{vcm} × ({m1} + {m2})',
            'The total mass times the center of mass’s velocity is the total momentum.',
          ],
        },
      ),
      rel(
        'v₁′ = 2v_cm − v₁',
        '{v1p} = 2 × {vcm} − {v1}',
        ['v1p', 'vcm', 'v1'],
        (v) => v.v1p! - 2 * v.vcm! + v.v1!,
        {
          v1p: [
            (v) => exact(2 * v.vcm! - v.v1!),
            '2 × {vcm} − {v1}',
            'Relative to the center of mass, object 1 moves at v₁ − v_cm before and the reverse after. Add v_cm back: v₁′ = 2v_cm − v₁.',
          ],
          vcm: [
            (v) => exact((v.v1! + v.v1p!) / 2),
            '({v1} + {v1p}) ÷ 2',
            'The velocity reverses about v_cm, so v_cm is halfway between object 1’s velocities before and after.',
          ],
          v1: [
            (v) => exact(2 * v.vcm! - v.v1p!),
            '2 × {vcm} − {v1p}',
            'Reversing about v_cm works both ways: v₁ = 2v_cm − v₁′.',
          ],
        },
      ),
      rel(
        'v₂′ = 2v_cm − v₂',
        '{v2p} = 2 × {vcm} − {v2}',
        ['v2p', 'vcm', 'v2'],
        (v) => v.v2p! - 2 * v.vcm! + v.v2!,
        {
          v2p: [
            (v) => exact(2 * v.vcm! - v.v2!),
            '2 × {vcm} − {v2}',
            'Object 2’s velocity reverses about v_cm the same way. Written out, this is ((m₂ − m₁)v₂ + 2m₁v₁) ÷ (m₁ + m₂).',
          ],
          vcm: [
            (v) => exact((v.v2! + v.v2p!) / 2),
            '({v2} + {v2p}) ÷ 2',
            'The velocity reverses about v_cm, so v_cm is halfway between object 2’s velocities before and after.',
          ],
          v2: [
            (v) => exact(2 * v.vcm! - v.v2p!),
            '2 × {vcm} − {v2p}',
            'Reversing about v_cm works both ways: v₂ = 2v_cm − v₂′.',
          ],
        },
      ),
      derive(
        'K = ½m₁v₁² + ½m₂v₂²',
        '{K} = ½ × {m1} × {v1}² + ½ × {m2} × {v2}²',
        'K',
        ['m1', 'v1', 'm2', 'v2'],
        (v) => 0.5 * v.m1! * v.v1! ** 2 + 0.5 * v.m2! * v.v2! ** 2,
        '½ × {m1} × {v1}² + ½ × {m2} × {v2}²',
        'Add the two objects’ kinetic energies before the collision.',
      ),
      derive(
        'K′ = ½m₁v₁′² + ½m₂v₂′²',
        '{Kp} = ½ × {m1} × {v1p}² + ½ × {m2} × {v2p}²',
        'Kp',
        ['m1', 'v1p', 'm2', 'v2p'],
        (v) => 0.5 * v.m1! * v.v1p! ** 2 + 0.5 * v.m2! * v.v2p! ** 2,
        '½ × {m1} × {v1p}² + ½ × {m2} × {v2p}²',
        'Add the kinetic energies after. In an elastic collision K′ equals K: the check that the velocities are right.',
      ),
    ),
    // m₁ = 2 kg at 6 m/s meets m₂ = 4 kg coming back at 1.5 m/s: p = 12 − 6 = 6 kg·m/s,
    // v_cm = 6 ÷ 6 = 1 m/s; v₁′ = 2 × 1 − 6 = −4 m/s (it bounces back), v₂′ = 2 × 1 + 1.5 =
    // 3.5 m/s; K = 36 + 4.5 = 40.5 J, K′ = ½ × 2 × 16 + ½ × 4 × 12.25 = 16 + 24.5 = 40.5 J.
    example: { m1: 2, v1: 6, m2: 4, v2: -1.5, p: 6, vcm: 1, v1p: -4, v2p: 3.5, K: 40.5, Kp: 40.5 },
    startWith: ['m1', 'v1', 'm2', 'v2'],
    // The two carts before and after, p = mv arrows tip to tail (the same total), and the
    // kinetic energy before and after (equal: elastic).
    representation: {
      kind: 'collision',
      type: 'elastic',
      masses: ['m1', 'm2'],
      before: ['v1', 'v2'],
      after: ['v1p', 'v2p'],
      momentum: 'p',
      energy: ['K', 'Kp'],
    },
  },
  {
    // University Physics I → Momentum: up to three point masses on a line and the point where
    // the line balances, the mass-weighted average of their places.
    id: 'he.physics.university-1#3~center-of-mass',
    title: 'Center of mass of masses on a line',
    use: 'Use this for “A light 1.2 m rod holds 0.4 kg at 0.1 m, 0.6 kg at 0.5 m and 1 kg at 1.1 m. Where is its center of mass?”',
    unitSystems: ['metric'],
    assumptions: [
      'Point masses: each mass sits at one place on the line, and the rod joining them weighs nothing.',
      'Places are measured from one origin, + to the right; a place left of the origin is negative.',
      'The center of mass is the mass-weighted average place, so Σm(x − x_cm) = 0: the rod balances on a pivot there.',
    ],
    variables: [
      V('m1', 'm₁', 'Mass 1', { unit: 'kg', min: 0.001, max: 1e5, step: 0.1 }),
      V('x1', 'x₁', 'Place of mass 1', { unit: 'm', min: -1e4, max: 1e4, step: 0.1 }),
      V('m2', 'm₂', 'Mass 2', { unit: 'kg', min: 0.001, max: 1e5, step: 0.1 }),
      V('x2', 'x₂', 'Place of mass 2', { unit: 'm', min: -1e4, max: 1e4, step: 0.1 }),
      V('m3', 'm₃', 'Mass 3', { unit: 'kg', min: 0.001, max: 1e5, step: 0.1 }),
      V('x3', 'x₃', 'Place of mass 3', { unit: 'm', min: -1e4, max: 1e4, step: 0.1 }),
      V('M', 'M', 'Total mass', { unit: 'kg', min: 0.003, max: 3e5, derived: true }),
      V('xcm', 'x_cm', 'Center of mass', { unit: 'm', min: -1e4, max: 1e4, derived: true }),
    ],
    ...rels(
      rel(
        'M = m₁ + m₂ + m₃',
        '{M} = {m1} + {m2} + {m3}',
        ['M', 'm1', 'm2', 'm3'],
        (v) => v.M! - v.m1! - v.m2! - v.m3!,
        {
          M: [(v) => exact(v.m1! + v.m2! + v.m3!), '{m1} + {m2} + {m3}', 'Add the three masses.'],
          m1: [
            (v) => positive(exact(v.M! - v.m2! - v.m3!)),
            '{M} − {m2} − {m3}',
            'Mass 1 is what the total leaves after the other two.',
          ],
          m2: [
            (v) => positive(exact(v.M! - v.m1! - v.m3!)),
            '{M} − {m1} − {m3}',
            'Mass 2 is what the total leaves after the other two.',
          ],
          m3: [
            (v) => positive(exact(v.M! - v.m1! - v.m2!)),
            '{M} − {m1} − {m2}',
            'Mass 3 is what the total leaves after the other two.',
          ],
        },
      ),
      rel(
        'x_cm = (m₁x₁ + m₂x₂ + m₃x₃) ÷ M',
        '{xcm} = ({m1} × {x1} + {m2} × {x2} + {m3} × {x3}) ÷ {M}',
        ['xcm', 'm1', 'x1', 'm2', 'x2', 'm3', 'x3', 'M'],
        (v) => v.xcm! * v.M! - v.m1! * v.x1! - v.m2! * v.x2! - v.m3! * v.x3!,
        {
          xcm: [
            (v) => div(v.m1! * v.x1! + v.m2! * v.x2! + v.m3! * v.x3!, v.M!),
            '({m1} × {x1} + {m2} × {x2} + {m3} × {x3}) ÷ {M}',
            'Weight each place by its mass, add the three, and divide by the total mass.',
          ],
          x1: [
            (v) => div(v.xcm! * v.M! - v.m2! * v.x2! - v.m3! * v.x3!, v.m1!),
            '({xcm} × {M} − {m2} × {x2} − {m3} × {x3}) ÷ {m1}',
            'M times x_cm is the sum of mass times place. Take the other two masses’ share away, then divide by mass 1.',
          ],
          x2: [
            (v) => div(v.xcm! * v.M! - v.m1! * v.x1! - v.m3! * v.x3!, v.m2!),
            '({xcm} × {M} − {m1} × {x1} − {m3} × {x3}) ÷ {m2}',
            'M times x_cm is the sum of mass times place. Take the other two masses’ share away, then divide by mass 2.',
          ],
          x3: [
            (v) => div(v.xcm! * v.M! - v.m1! * v.x1! - v.m2! * v.x2!, v.m3!),
            '({xcm} × {M} − {m1} × {x1} − {m2} × {x2}) ÷ {m3}',
            'M times x_cm is the sum of mass times place. Take the other two masses’ share away, then divide by mass 3.',
          ],
        },
      ),
    ),
    // The plan's 2 kg at 0, 3 kg at 1 m, 5 kg at 2 m, moved 0.5 m right (a place with a unit
    // can't be 0 in an example): M = 10 kg; Σmx = 2 × 0.5 + 3 × 1.5 + 5 × 2.5 = 1 + 4.5 + 12.5
    // = 18 kg·m; x_cm = 18 ÷ 10 = 1.8 m (the plan's 1.3 m plus 0.5 m).
    example: { m1: 2, x1: 0.5, m2: 3, x2: 1.5, m3: 5, x3: 2.5, M: 10, xcm: 1.8 },
    startWith: ['m1', 'x1', 'm2', 'x2', 'm3', 'x3'],
    // Balls sized by mass on a light rod over a ruler, a pivot under x_cm.
    representation: {
      kind: 'vectorDiagram',
      vectors: [{ name: 'x_cm' }],
      masses: [
        { m: 'm1', x: 'x1' },
        { m: 'm2', x: 'x2' },
        { m: 'm3', x: 'x3' },
      ],
      centerOfMass: { x: 'xcm', total: 'M' },
    },
  },
  {
    // University Physics I → Momentum: a force that rises to a peak and falls back in a
    // straight line. J = ∫F dt is the triangle's area, half its base times its height.
    id: 'he.physics.university-1#3~impulse-curve',
    title: 'Impulse from a triangular force pulse',
    use: 'Use this for “A kick pushes a 0.43 kg ball at rest with a force that rises evenly to 2,400 N and falls back to 0 over 8 ms. What is the impulse, and how fast does the ball leave?”',
    unitSystems: ['metric'],
    assumptions: [
      'The impulse is the area under the force–time graph, J = ∫F dt. Here the force rises in a straight line to its peak and falls back to 0, so the area is a triangle.',
      'The average force is the steady force that gives the same impulse over the same contact time.',
      'Only this force acts along the motion during the contact, so the impulse is the change in momentum, J = mΔv.',
    ],
    variables: [
      V('F', 'F_max', 'Peak force', { unit: 'N', min: 0.01, max: 1e7, step: 1 }),
      V('dt', 'Δt', 'Contact time', { unit: 's', min: 0.00001, max: 100, step: 0.001 }),
      V('J', 'J', 'Impulse', { unit: 'N·s', min: 1e-6, max: 1e8, derived: true }),
      V('Favg', 'F_avg', 'Average force', { unit: 'N', min: 0.005, max: 1e7, derived: true }),
      V('m', 'm', 'Mass', { unit: 'kg', min: 0.001, max: 1e5, step: 0.01 }),
      V('dv', 'Δv', 'Change in speed', { unit: 'm/s', min: 1e-6, max: 1e5, derived: true }),
    ],
    ...rels(
      rel(
        'J = ½F_max Δt',
        '{J} = ½ × {F} × {dt}',
        ['J', 'F', 'dt'],
        (v) => v.J! - 0.5 * v.F! * v.dt!,
        {
          J: [
            (v) => exact(0.5 * v.F! * v.dt!),
            '½ × {F} × {dt}',
            'J = ∫F dt is the area under the pulse: a triangle, half its base Δt times its height F_max.',
          ],
          F: [
            (v) => div(2 * v.J!, v.dt!),
            '2 × {J} ÷ {dt}',
            'Double the area, then divide by the base, the contact time.',
          ],
          dt: [
            (v) => div(2 * v.J!, v.F!),
            '2 × {J} ÷ {F}',
            'Double the area, then divide by the height, the peak force.',
          ],
        },
      ),
      rel(
        'F_avg = J ÷ Δt',
        '{Favg} = {J} ÷ {dt}',
        ['Favg', 'J', 'dt'],
        (v) => v.Favg! * v.dt! - v.J!,
        {
          Favg: [
            (v) => div(v.J!, v.dt!),
            '{J} ÷ {dt}',
            'Spread the impulse evenly over the contact time. For a triangle this is half the peak.',
          ],
          J: [
            (v) => exact(v.Favg! * v.dt!),
            '{Favg} × {dt}',
            'A steady average force over the same time gives a rectangle of the same area.',
          ],
          dt: [
            (v) => div(v.J!, v.Favg!),
            '{J} ÷ {Favg}',
            'Divide the impulse by the average force.',
          ],
        },
      ),
      rel('Δv = J ÷ m', '{dv} = {J} ÷ {m}', ['dv', 'J', 'm'], (v) => v.dv! * v.m! - v.J!, {
        dv: [
          (v) => div(v.J!, v.m!),
          '{J} ÷ {m}',
          'The impulse is the change in momentum, J = mΔv: divide it by the mass.',
        ],
        J: [
          (v) => exact(v.m! * v.dv!),
          '{m} × {dv}',
          'The change in momentum is the mass times the change in speed.',
        ],
        m: [
          (v) => div(v.J!, v.dv!),
          '{J} ÷ {dv}',
          'Divide the change in momentum by the change in speed.',
        ],
      }),
    ),
    // The plan's pulse: 1200 N peak over 0.010 s → J = ½ × 1200 × 0.01 = 6 N·s;
    // F_avg = 6 ÷ 0.01 = 600 N (half the peak); a 0.15 kg ball from rest: Δv = 6 ÷ 0.15 = 40 m/s.
    example: { F: 1200, dt: 0.01, J: 6, Favg: 600, m: 0.15, dv: 40 },
    startWith: ['F', 'dt', 'm'],
    // The triangle on the F–t graph, its area shaded as J, the rectangle of the same area dashed
    // at F_avg, and the ball sent off at Δv.
    representation: {
      kind: 'impulse',
      shape: 'triangle',
      peak: 'F',
      time: 'dt',
      impulse: 'J',
      average: 'Favg',
      mass: 'm',
      change: 'dv',
    },
  },
  {
    // University Physics I → Momentum: the rocket equation. Each bit of exhaust thrown back
    // pushes the rocket forward; adding those pushes as the mass falls gives a log.
    id: 'he.physics.university-1#3~rocket',
    title: 'The rocket equation',
    use: 'Use this for “A 12,000 kg rocket burns fuel until it weighs 4,000 kg, its exhaust leaving at 3,000 m/s. How much speed does it gain?”',
    unitSystems: ['metric'],
    assumptions: [
      'No gravity or air drag acts during the burn (a rocket in deep space), so the momentum of the rocket and its exhaust together is kept.',
      'The exhaust leaves at a steady speed u measured from the rocket, straight backward.',
      'Throwing back a small mass dm gives m dv = u dm; adding these up as the mass falls from m₀ to m_f gives Δv = u ln(m₀ ÷ m_f).',
    ],
    variables: [
      V('u', 'u', 'Exhaust speed', { unit: 'm/s', min: 10, max: 5000, step: 10 }),
      V('m0', 'm₀', 'Start mass, with fuel', fixed('kg', 0.001, 1e7, 1)),
      V('mf', 'm_f', 'End mass, fuel burned', fixed('kg', 0.001, 1e7, 1)),
      V('R', 'R', 'Mass ratio m₀ ÷ m_f', { min: 1, max: 1e10, derived: true }),
      V('dv', 'Δv', 'Change in speed', { unit: 'm/s', min: 0, max: 1.2e5, derived: true }),
    ],
    ...rels(
      rule(
        'm_f < m₀',
        'The end mass {mf} is less than the start mass {m0}',
        ['mf', 'm0'],
        (v) => v.mf! < v.m0!,
        'The rocket gets lighter as it burns fuel, so its end mass must be less than its start mass.',
      ),
      rel('R = m₀ ÷ m_f', '{R} = {m0} ÷ {mf}', ['R', 'm0', 'mf'], (v) => v.R! * v.mf! - v.m0!, {
        R: [
          (v) => div(v.m0!, v.mf!),
          '{m0} ÷ {mf}',
          'The mass ratio is the start mass over the end mass: how many times lighter the rocket gets.',
        ],
        m0: [
          (v) => exact(v.R! * v.mf!),
          '{R} × {mf}',
          'The start mass is the mass ratio times the end mass.',
        ],
        mf: [(v) => div(v.m0!, v.R!), '{m0} ÷ {R}', 'Divide the start mass by the mass ratio.'],
      }),
      rel(
        'Δv = u ln R',
        '{dv} = {u} × ln({R})',
        ['dv', 'u', 'R'],
        (v) => v.dv! - v.u! * Math.log(v.R!),
        {
          dv: [
            (v) => (v.R! > 0 ? exact(v.u! * Math.log(v.R!)) : undefined),
            '{u} × ln({R})',
            'The speed gained is the exhaust speed times the natural log of the mass ratio.',
          ],
          u: [
            (v) => (v.R! > 1 ? v.dv! / Math.log(v.R!) : undefined),
            '{dv} ÷ ln({R})',
            'Divide the speed gained by the natural log of the mass ratio.',
          ],
          R: [
            (v) => exact(Math.exp(v.dv! / v.u!)),
            'e^({dv} ÷ {u})',
            'Undo the log: divide the speed gained by the exhaust speed, then raise e to that power.',
          ],
        },
      ),
    ),
    // The plan's rocket: u = 2500 m/s, 5000 kg down to 2000 kg → R = 2.5,
    // Δv = 2500 × ln 2.5 = 2500 × 0.9163 = 2290.7 m/s.
    example: { u: 2500, m0: 5000, mf: 2000, R: 2.5, dv: exact(2500 * Math.log(2.5)) },
    startWith: ['u', 'm0', 'mf'],
    // Δv = u ln(m₀ ÷ m) against the mass m left, from m₀ (nothing burned, Δv = 0) down to 0,
    // the rocket's point at m_f: the log of the mass ratio, steeper as the tank runs dry.
    // (Against R itself the window's padding pulls the left edge below R = 1, where ln R < 0.)
    representation: {
      kind: 'functionGraph',
      family: 'expr',
      expr: 'u*ln(m0/x)',
      name: 'Δv',
      input: 'm',
      at: { x: 'mf', y: 'dv' },
      window: { x: [0, 'm0'] },
      axes: { x: 'Mass left m (kg)', y: 'Change in speed Δv (m/s)' },
    },
  },
  {
    // University Physics I → Rotation and torque: a round body rolls from rest down a drop h
    // without slipping; the energy mgh is shared between moving along and spinning.
    id: 'he.physics.university-1#4',
    use: 'Use this for “A 3 kg disk of radius 0.2 m rolls from rest down a ramp that drops 2 m. How fast is it moving at the bottom, and how fast does it spin?”',
    unitSystems: ['metric'],
    assumptions: [
      'It rolls without slipping, so v = rω, and static friction at the contact point does no work; g = 9.81 m/s².',
      'I = cmr² with the shape factor c: hoop 1, hollow ball ⅔ (type 0.6667), disk ½, solid ball 0.4.',
      'It starts from rest, so mgh = ½mv² + ½Iω² = ½(1 + c)mv²: the mass and the radius cancel from v.',
    ],
    variables: [
      V('c', 'c', 'Shape factor (I = cmr²)', { min: 0.4, max: 1, step: 0.01 }),
      V('m', 'm', 'Mass', { unit: 'kg', min: 0.001, max: 1e4, step: 0.1 }),
      V('r', 'r', 'Radius', { unit: 'm', min: 0.001, max: 100, step: 0.01 }),
      V('h', 'h', 'Drop', { unit: 'm', min: 0.01, max: 1000, step: 0.1 }),
      V('v', 'v', 'Speed at the bottom', { unit: 'm/s', min: 0, max: 200, derived: true }),
      V('w', 'ω', 'Spin at the bottom', { unit: 'rad/s', min: 0, max: 2e5, derived: true }),
      V('Kt', 'K_t', 'Kinetic energy of moving along', {
        unit: 'J',
        min: 0,
        max: 1e8,
        derived: true,
      }),
      V('Kr', 'K_r', 'Kinetic energy of spinning', { unit: 'J', min: 0, max: 1e8, derived: true }),
    ],
    ...rels(
      rel(
        'v = √(2gh ÷ (1 + c))',
        '{v} = √(2 × 9.81 × {h} ÷ (1 + {c}))',
        ['v', 'h', 'c'],
        (v) => v.v! ** 2 * (1 + v.c!) - 2 * G * v.h!,
        {
          v: [
            (v) => exact(Math.sqrt((2 * G * v.h!) / (1 + v.c!))),
            '√(2 × 9.81 × {h} ÷ (1 + {c}))',
            'The drop’s energy mgh becomes ½(1 + c)mv². The mass cancels; solve for v.',
          ],
          h: [
            (v) => exact((v.v! ** 2 * (1 + v.c!)) / (2 * G)),
            '{v}² × (1 + {c}) ÷ (2 × 9.81)',
            'Undo the energy balance gh = ½(1 + c)v²: multiply v² by 1 + c and divide by 2g.',
          ],
          c: [
            (v) => (v.v! > 0 ? exact((2 * G * v.h!) / v.v! ** 2 - 1) : undefined),
            '2 × 9.81 × {h} ÷ {v}² − 1',
            'Undo gh = ½(1 + c)v²: 2gh ÷ v² is 1 + c, so take away 1.',
          ],
        },
      ),
      rel('ω = v ÷ r', '{w} = {v} ÷ {r}', ['w', 'v', 'r'], (v) => v.w! * v.r! - v.v!, {
        w: [
          (v) => div(v.v!, v.r!),
          '{v} ÷ {r}',
          'Rolling without slipping, the rim turns as fast as the body moves: v = rω.',
        ],
        v: [(v) => exact(v.w! * v.r!), '{w} × {r}', 'Rolling without slipping: v = rω.'],
        r: [(v) => div(v.v!, v.w!), '{v} ÷ {w}', 'Undo v = rω: divide the speed by the spin.'],
      }),
      rel(
        'K_t = ½mv²',
        '{Kt} = 0.5 × {m} × {v}²',
        ['Kt', 'm', 'v'],
        (v) => v.Kt! - 0.5 * v.m! * v.v! ** 2,
        {
          Kt: [
            (v) => exact(0.5 * v.m! * v.v! ** 2),
            '0.5 × {m} × {v}²',
            'The energy of moving along is half the mass times the speed squared.',
          ],
          m: [
            (v) => div(2 * v.Kt!, v.v! ** 2),
            '2 × {Kt} ÷ {v}²',
            'Undo K_t = ½mv²: double the energy and divide by v².',
          ],
        },
      ),
      rel('K_r = cK_t', '{Kr} = {c} × {Kt}', ['Kr', 'c', 'Kt'], (v) => v.Kr! - v.c! * v.Kt!, {
        Kr: [
          (v) => exact(v.c! * v.Kt!),
          '{c} × {Kt}',
          'The spin energy ½Iω² is ½(cmr²)(v ÷ r)² = c × ½mv²: c times the energy of moving along.',
        ],
        Kt: [
          (v) => div(v.Kr!, v.c!),
          '{Kr} ÷ {c}',
          'Undo K_r = cK_t: divide the spin energy by c.',
        ],
        c: [
          (v) => div(v.Kr!, v.Kt!),
          '{Kr} ÷ {Kt}',
          'The shape factor is the spin energy over the energy of moving along.',
        ],
      }),
    ),
    // The plan's solid ball: c = 0.4, 2 kg, r = 0.1 m, h = 1.5 m →
    // v² = 2 × 9.81 × 1.5 ÷ 1.4 = 21.021, v = 4.585 m/s, ω = 45.85 rad/s,
    // K_t = 0.5 × 2 × 21.021 = 21.02 J, K_r = 0.4 × 21.02 = 8.409 J; sum 29.43 J = mgh.
    example: (() => {
      const [c, m, r, h] = [0.4, 2, 0.1, 1.5];
      const v = exact(Math.sqrt((2 * G * h) / (1 + c)));
      const Kt = exact(0.5 * m * v ** 2);
      return { c, m, r, h, v, w: exact(v / r), Kt, Kr: exact(c * Kt) };
    })(),
    startWith: ['c', 'm', 'r', 'h'],
    // The body faded at the top, solid at the bottom with v and ω; K_t and K_r stacked to mgh,
    // and the race of the four shapes down the same drop.
    representation: {
      kind: 'rotor',
      shape: 'c',
      mass: 'm',
      radius: 'r',
      rolling: {
        height: 'h',
        g: G,
        speed: 'v',
        spin: 'w',
        kt: 'Kt',
        kr: 'Kr',
        shapes: [1, 2 / 3, 0.5, 0.4],
      },
      fixed: true,
    },
  },
  {
    // University Physics I → Rotation and torque: a uniform rod turned about an axis parallel
    // to the one through its center, a distance d from it.
    id: 'he.physics.university-1#4~parallel-axis',
    title: 'The parallel-axis theorem for a rod',
    use: 'Use this for “A 2 kg rod 1.5 m long turns about an axis 0.5 m from its center. Find its moment of inertia about that axis.”',
    unitSystems: ['metric'],
    assumptions: [
      'The rod is thin and uniform, so about its center I_cm = ML² ÷ 12.',
      'The new axis is parallel to the one through the center, a distance d from it: I = I_cm + Md².',
      'd = L ÷ 2 puts the axis at one end, where I = ML² ÷ 3; the axis may also lie past the rod.',
    ],
    variables: [
      V('M', 'M', 'Rod mass', { unit: 'kg', min: 0.001, max: 1e4, step: 0.1 }),
      V('L', 'L', 'Rod length', { unit: 'm', min: 0.001, max: 100, step: 0.01 }),
      V('d', 'd', 'Distance between the axes', { unit: 'm', min: 0, max: 100, step: 0.01 }),
      V('Icm', 'I_cm', 'Moment of inertia about the center', fixed('kg·m²', 0, 1e8, 0.001, true)),
      V('I', 'I', 'Moment of inertia about the new axis', fixed('kg·m²', 0, 1e8, 0.001, true)),
    ],
    ...rels(
      rel(
        'I_cm = ML² ÷ 12',
        '{Icm} = {M} × {L}² ÷ 12',
        ['Icm', 'M', 'L'],
        (v) => 12 * v.Icm! - v.M! * v.L! ** 2,
        {
          Icm: [
            (v) => exact((v.M! * v.L! ** 2) / 12),
            '{M} × {L}² ÷ 12',
            'A uniform rod about its center: the mass times the length squared, over 12.',
          ],
          M: [
            (v) => div(12 * v.Icm!, v.L! ** 2),
            '12 × {Icm} ÷ {L}²',
            'Undo I_cm = ML² ÷ 12: multiply by 12 and divide by L².',
          ],
          L: [
            (v) => (v.M! > 0 ? exact(Math.sqrt((12 * v.Icm!) / v.M!)) : undefined),
            '√(12 × {Icm} ÷ {M})',
            'Undo I_cm = ML² ÷ 12: multiply by 12, divide by M and take the square root.',
          ],
        },
      ),
      rel(
        'I = I_cm + Md²',
        '{I} = {Icm} + {M} × {d}²',
        ['I', 'Icm', 'M', 'd'],
        (v) => v.I! - v.Icm! - v.M! * v.d! ** 2,
        {
          I: [
            (v) => exact(v.Icm! + v.M! * v.d! ** 2),
            '{Icm} + {M} × {d}²',
            'The parallel-axis theorem: add the mass times the shift squared to the center’s I.',
          ],
          Icm: [
            (v) => positive(exact(v.I! - v.M! * v.d! ** 2)),
            '{I} − {M} × {d}²',
            'Undo I = I_cm + Md²: take Md² off the new I.',
          ],
          d: [
            (v) =>
              v.M! > 0 && v.I! >= v.Icm! ? exact(Math.sqrt((v.I! - v.Icm!) / v.M!)) : undefined,
            '√(({I} − {Icm}) ÷ {M})',
            'Undo I = I_cm + Md²: what the shift adds, divided by M, then the square root.',
          ],
        },
      ),
    ),
    // The plan's rod turned about its end: 1.2 kg, 0.9 m, d = 0.45 m →
    // I_cm = 1.2 × 0.81 ÷ 12 = 0.081, I = 0.081 + 1.2 × 0.2025 = 0.081 + 0.243 = 0.324 kg·m²
    // (= ML² ÷ 3, four times I_cm).
    example: { M: 1.2, L: 0.9, d: 0.45, Icm: exact(0.081), I: exact(0.324) },
    startWith: ['M', 'L', 'd'],
    // The rod to scale with its center axis dashed and the turning axis lit d away; under it
    // the bar I = I_cm + Md², the two parts in proportion.
    representation: {
      kind: 'rotor',
      mass: 'M',
      rod: { length: 'L', d: 'd', icm: 'Icm', inertia: 'I' },
      fixed: true,
    },
  },
  {
    // University Physics I → Rotation and torque: a block hangs from a rope wound round a
    // uniform disk pulley on a fixed, frictionless axle; the rope turns the pulley as it falls.
    id: 'he.physics.university-1#4~pulley-inertia',
    title: 'A block falling from a pulley with mass',
    use: 'Use this for “A 3 kg bucket hangs from a rope wound round a 5 kg solid disk pulley of radius 0.2 m. Find the bucket’s acceleration, the rope’s tension and the pulley’s angular acceleration.”',
    unitSystems: ['metric'],
    assumptions: [
      'The pulley is a uniform solid disk on a frictionless axle, so I = ½Mr²; g = 9.81 m/s².',
      'The rope is light and doesn’t slip or stretch, so the rim moves with the block: a = rα.',
      'The block obeys mg − T = ma and the pulley Tr = Iα; together they give a = mg ÷ (m + I ÷ r²).',
    ],
    variables: [
      V('m', 'm', 'Block mass', { unit: 'kg', min: 0.001, max: 1e4, step: 0.1 }),
      V('M', 'M', 'Pulley mass', { unit: 'kg', min: 0.001, max: 1e4, step: 0.1 }),
      V('r', 'r', 'Pulley radius', { unit: 'm', min: 0.001, max: 100, step: 0.01 }),
      V('I', 'I', 'Pulley’s moment of inertia', fixed('kg·m²', 0, 1e9, 0.001, true)),
      V('a', 'a', 'Block’s acceleration (down)', {
        unit: 'm/s²',
        min: 0,
        max: G,
        derived: true,
      }),
      V('al', 'α', 'Pulley’s angular acceleration', fixed('rad/s²', 0, 1e5, 0.01, true)),
      V('tau', 'τ', 'Torque on the pulley', fixed('N·m', 0, 1e8, 0.001, true)),
      V('T', 'T', 'Rope tension', { unit: 'N', min: 0, max: 1e6, derived: true }),
    ],
    ...rels(
      rel(
        'I = ½Mr²',
        '{I} = 0.5 × {M} × {r}²',
        ['I', 'M', 'r'],
        (v) => 2 * v.I! - v.M! * v.r! ** 2,
        {
          I: [
            (v) => exact(0.5 * v.M! * v.r! ** 2),
            '0.5 × {M} × {r}²',
            'A uniform solid disk about its axle: half the mass times the radius squared.',
          ],
          M: [
            (v) => div(2 * v.I!, v.r! ** 2),
            '2 × {I} ÷ {r}²',
            'Undo I = ½Mr²: double I and divide by r².',
          ],
        },
      ),
      rel(
        'a = mg ÷ (m + I ÷ r²)',
        '{a} = ({m} × 9.81) ÷ ({m} + {I} ÷ {r}²)',
        ['a', 'm', 'I', 'r'],
        (v) => v.a! * (v.m! * v.r! ** 2 + v.I!) - v.m! * G * v.r! ** 2,
        {
          a: [
            (v) => exact((v.m! * G) / (v.m! + v.I! / v.r! ** 2)),
            '({m} × 9.81) ÷ ({m} + {I} ÷ {r}²)',
            'Put T = Iα ÷ r = Ia ÷ r² into mg − T = ma: the pulley adds I ÷ r² to the mass that the weight speeds up.',
          ],
          m: [
            (v) =>
              v.a! < G ? positive(exact((v.a! * v.I!) / ((G - v.a!) * v.r! ** 2))) : undefined,
            '{a} × {I} ÷ ((9.81 − {a}) × {r}²)',
            'Gather the m terms of ma + Ia ÷ r² = mg: m(g − a) = Ia ÷ r², then divide by g − a.',
          ],
          I: [
            (v) => (v.a! > 0 ? positive(exact((v.m! * v.r! ** 2 * (G - v.a!)) / v.a!)) : undefined),
            '{m} × {r}² × (9.81 − {a}) ÷ {a}',
            'Undo the block’s law: Ia ÷ r² = m(g − a), so multiply by r² and divide by a.',
          ],
        },
      ),
      rel('α = a ÷ r', '{al} = {a} ÷ {r}', ['al', 'a', 'r'], (v) => v.al! * v.r! - v.a!, {
        al: [
          (v) => div(v.a!, v.r!),
          '{a} ÷ {r}',
          'The rope doesn’t slip, so the rim speeds up as fast as the block: a = rα.',
        ],
        a: [(v) => exact(v.al! * v.r!), '{al} × {r}', 'The rope doesn’t slip: a = rα.'],
        r: [(v) => div(v.a!, v.al!), '{a} ÷ {al}', 'Undo a = rα: divide a by α.'],
      }),
      rel('τ = Iα', '{tau} = {I} × {al}', ['tau', 'I', 'al'], (v) => v.tau! - v.I! * v.al!, {
        tau: [
          (v) => exact(v.I! * v.al!),
          '{I} × {al}',
          'Newton’s second law for turning: the torque is I times α.',
        ],
        I: [(v) => div(v.tau!, v.al!), '{tau} ÷ {al}', 'Undo τ = Iα: divide τ by α.'],
        al: [(v) => div(v.tau!, v.I!), '{tau} ÷ {I}', 'Undo τ = Iα: divide τ by I.'],
      }),
      rel('τ = Tr', '{tau} = {T} × {r}', ['tau', 'T', 'r'], (v) => v.tau! - v.T! * v.r!, {
        T: [
          (v) => div(v.tau!, v.r!),
          '{tau} ÷ {r}',
          'Only the rope turns the pulley, pulling at the rim: τ = Tr, so divide τ by r.',
        ],
        tau: [
          (v) => exact(v.T! * v.r!),
          '{T} × {r}',
          'The rope pulls at the rim, a lever arm r from the axle: τ = Tr.',
        ],
      }),
    ),
    // The plan's 2 kg block on a 4 kg, 0.1 m disk: I = 0.5 × 4 × 0.01 = 0.02 kg·m²,
    // a = 2 × 9.81 ÷ (2 + 0.02 ÷ 0.01) = 19.62 ÷ 4 = 4.905 m/s², α = 4.905 ÷ 0.1 = 49.05 rad/s²,
    // τ = 0.02 × 49.05 = 0.981 N·m, T = 0.981 ÷ 0.1 = 9.81 N (check: 19.62 − 9.81 = 2 × 4.905).
    example: { m: 2, M: 4, r: 0.1, I: 0.02, a: 4.905, al: 49.05, tau: 0.981, T: 9.81 },
    startWith: ['m', 'M', 'r'],
    // The disk pulley with its I, the rope's torque τ = Tr as a curved arrow at the rim and
    // α = τ ÷ I. No `mass`: the rotor labels it m, which here is the block's.
    representation: {
      kind: 'rotor',
      shape: 0.5,
      radius: 'r',
      inertia: 'I',
      torque: 'tau',
      acceleration: 'al',
    },
  },
  {
    // University Physics I → Rotation and torque: a spinning body changes its moment of
    // inertia with no outside torque, so L = Iω is kept while the kinetic energy changes.
    id: 'he.physics.university-1#4~angular-momentum',
    title: 'A spinning skater pulls in her arms',
    use: 'Use this for “A skater spinning at 3 rad/s with her arms out (I = 5 kg·m²) pulls them in to I = 2 kg·m². Find her new spin and the work her arms do.”',
    unitSystems: ['metric'],
    assumptions: [
      'No outside torque acts about the spin axis (the ice’s friction is left out), so the angular momentum L = Iω is kept.',
      'Pulling the arms in moves mass closer to the axis: I falls, and ω rises by the same factor.',
      'The kinetic energy ½Iω² is not kept: the arms do work W = K₂ − K₁ pulling in, and W is negative letting them out.',
    ],
    variables: [
      V('I1', 'I₁', 'Moment of inertia before', fixed('kg·m²', 0.001, 1e6, 0.1)),
      V('w1', 'ω₁', 'Spin before', fixed('rad/s', 0.001, 1e4, 0.1)),
      V('I2', 'I₂', 'Moment of inertia after', fixed('kg·m²', 0.001, 1e6, 0.1)),
      V('L', 'L', 'Angular momentum', fixed('kg·m²/s', 0, 1e10, 0.1, true)),
      V('w2', 'ω₂', 'Spin after', fixed('rad/s', 0, 1e7, 0.1, true)),
      V('K1', 'K₁', 'Kinetic energy before', { unit: 'J', min: 0, max: 1e12, derived: true }),
      V('K2', 'K₂', 'Kinetic energy after', { unit: 'J', min: 0, max: 1e12, derived: true }),
      V('W', 'W', 'Work done by the arms', { unit: 'J', min: -1e12, max: 1e12, derived: true }),
    ],
    ...rels(
      rel('L = I₁ω₁', '{L} = {I1} × {w1}', ['L', 'I1', 'w1'], (v) => v.L! - v.I1! * v.w1!, {
        L: [
          (v) => exact(v.I1! * v.w1!),
          '{I1} × {w1}',
          'The angular momentum is the moment of inertia times the spin.',
        ],
        I1: [(v) => div(v.L!, v.w1!), '{L} ÷ {w1}', 'Undo L = I₁ω₁: divide L by ω₁.'],
        w1: [(v) => div(v.L!, v.I1!), '{L} ÷ {I1}', 'Undo L = I₁ω₁: divide L by I₁.'],
      }),
      rel('L = I₂ω₂', '{L} = {I2} × {w2}', ['L', 'I2', 'w2'], (v) => v.L! - v.I2! * v.w2!, {
        w2: [
          (v) => div(v.L!, v.I2!),
          '{L} ÷ {I2}',
          'No outside torque, so L is the same after: the new spin is L divided by the new I.',
        ],
        I2: [(v) => div(v.L!, v.w2!), '{L} ÷ {w2}', 'Undo L = I₂ω₂: divide L by ω₂.'],
        L: [
          (v) => exact(v.I2! * v.w2!),
          '{I2} × {w2}',
          'The angular momentum after is I₂ times ω₂, the same as before.',
        ],
      }),
      rel(
        'K₁ = ½I₁ω₁²',
        '{K1} = 0.5 × {I1} × {w1}²',
        ['K1', 'I1', 'w1'],
        (v) => v.K1! - 0.5 * v.I1! * v.w1! ** 2,
        {
          K1: [
            (v) => exact(0.5 * v.I1! * v.w1! ** 2),
            '0.5 × {I1} × {w1}²',
            'The energy of spinning is half the moment of inertia times the spin squared.',
          ],
          I1: [
            (v) => div(2 * v.K1!, v.w1! ** 2),
            '2 × {K1} ÷ {w1}²',
            'Undo K₁ = ½I₁ω₁²: double the energy and divide by ω₁².',
          ],
          w1: [
            (v) => (v.I1! > 0 ? exact(Math.sqrt((2 * v.K1!) / v.I1!)) : undefined),
            '√(2 × {K1} ÷ {I1})',
            'Undo K₁ = ½I₁ω₁²: double the energy, divide by I₁ and take the square root.',
          ],
        },
      ),
      rel(
        'K₂ = ½I₂ω₂²',
        '{K2} = 0.5 × {I2} × {w2}²',
        ['K2', 'I2', 'w2'],
        (v) => v.K2! - 0.5 * v.I2! * v.w2! ** 2,
        {
          K2: [
            (v) => exact(0.5 * v.I2! * v.w2! ** 2),
            '0.5 × {I2} × {w2}²',
            'The energy of spinning after: half of I₂ times ω₂ squared.',
          ],
          I2: [
            (v) => div(2 * v.K2!, v.w2! ** 2),
            '2 × {K2} ÷ {w2}²',
            'Undo K₂ = ½I₂ω₂²: double the energy and divide by ω₂².',
          ],
          w2: [
            (v) => (v.I2! > 0 ? exact(Math.sqrt((2 * v.K2!) / v.I2!)) : undefined),
            '√(2 × {K2} ÷ {I2})',
            'Undo K₂ = ½I₂ω₂²: double the energy, divide by I₂ and take the square root.',
          ],
        },
      ),
      rel('W = K₂ − K₁', '{W} = {K2} − {K1}', ['W', 'K2', 'K1'], (v) => v.W! - v.K2! + v.K1!, {
        W: [
          (v) => exact(v.K2! - v.K1!),
          '{K2} − {K1}',
          'The work-energy theorem: the arms’ work is the change in kinetic energy.',
        ],
        K2: [
          (v) => exact(v.K1! + v.W!),
          '{K1} + {W}',
          'The energy after is the energy before plus the work the arms do.',
        ],
        K1: [
          (v) => exact(v.K2! - v.W!),
          '{K2} − {W}',
          'The energy before is the energy after less the work the arms do.',
        ],
      }),
    ),
    // The plan's skater: 4 kg·m² at 2 rad/s pulls in to 1.6 kg·m² → L = 4 × 2 = 8 kg·m²/s,
    // ω₂ = 8 ÷ 1.6 = 5 rad/s, K₁ = 0.5 × 4 × 4 = 8 J, K₂ = 0.5 × 1.6 × 25 = 20 J,
    // W = 20 − 8 = 12 J done by the arms.
    example: { I1: 4, w1: 2, I2: 1.6, L: 8, w2: 5, K1: 8, K2: 20, W: 12 },
    startWith: ['I1', 'w1', 'I2'],
    // The spins that keep L the same, ω = L ÷ I: the dashed level ω₁ meets the curve at the
    // start (I₁, ω₁) and the skater slides along it to (I₂, ω₂) as she pulls in.
    representation: {
      kind: 'functionGraph',
      family: 'expr',
      expr: 'L/x',
      from: 0,
      name: 'ω',
      input: 'I',
      at: { x: 'I2', y: 'w2' },
      other: { family: 'linear', m: 0, b: 'w1', name: 'ω₁' },
      crossing: { x: 'I1', y: 'w1' },
      xMin: 0,
      axes: { x: 'Moment of inertia I (kg·m²)', y: 'Spin ω (rad/s)' },
    },
  },
  {
    // University Physics I → Rotation and torque: static equilibrium of a uniform ladder on a
    // rough floor against a smooth wall; forces balance and torques about the foot cancel.
    id: 'he.physics.university-1#4~ladder',
    title: 'A ladder against a smooth wall: will it slip?',
    use: 'Use this for “A 300 N ladder leans on a smooth wall at 65° to the floor. How hard does the wall push, and how rough must the floor be to hold it?”',
    unitSystems: ['metric'],
    assumptions: [
      'The ladder is uniform, so its weight W acts at its middle.',
      'The wall is smooth: it only pushes level, N_w. The rough floor pushes up, N_f, and its friction f points toward the wall.',
      'At rest the forces balance both ways, and the torques about the foot cancel, so N_f and f drop out of that balance.',
      'The ladder holds while μₛN_f ≥ f, so the least μₛ is f ÷ N_f; the ladder’s length cancels.',
    ],
    variables: [
      V('W', 'W', 'Weight of the ladder', { unit: 'N', min: 1, max: 1e5, step: 1 }),
      V('theta', 'θ', 'Angle with the floor', { unit: '°', min: 1, max: 89, step: 1 }),
      V('Nw', 'N_w', 'Push of the wall', { unit: 'N', min: 0, max: 1e7, derived: true }),
      V('Nf', 'N_f', 'Push of the floor', { unit: 'N', min: 1, max: 1e5, derived: true }),
      V('f', 'f', 'Friction at the foot', { unit: 'N', min: 0, max: 1e7, derived: true }),
      V('mu', 'μₛ', 'Least static friction coefficient', { min: 0, max: 100, derived: true }),
    ],
    ...rels(
      rel('N_f = W', '{Nf} = {W}', ['Nf', 'W'], (v) => v.Nf! - v.W!, {
        Nf: [
          (v) => v.W!,
          '{W}',
          'Up and down: the smooth wall pushes only level, so the floor alone holds the weight.',
        ],
        W: [(v) => v.Nf!, '{Nf}', 'Up and down: the weight equals the floor’s push.'],
      }),
      rel(
        'N_w = W ÷ (2 tan θ)',
        '{Nw} = {W} ÷ (2 × tan({theta}))',
        ['Nw', 'W', 'theta'],
        (v) => 2 * v.Nw! * tanD(v.theta!) - v.W!,
        {
          Nw: [
            (v) => exact(v.W! / (2 * tanD(v.theta!))),
            '{W} ÷ (2 × tan({theta}))',
            'Torques about the foot: N_w × L sin θ = W × ½L cos θ, and the length L cancels.',
          ],
          W: [
            (v) => exact(2 * v.Nw! * tanD(v.theta!)),
            '2 × {Nw} × tan({theta})',
            'Undo N_w = W ÷ (2 tan θ) for W: multiply N_w by 2 tan θ.',
          ],
          theta: [
            (v) => (v.Nw! > 0 ? atanD(v.W! / (2 * v.Nw!)) : undefined),
            'tan⁻¹({W} ÷ (2 × {Nw}))',
            'Undo N_w = W ÷ (2 tan θ) for the angle with tan⁻¹.',
          ],
        },
      ),
      rel('f = N_w', '{f} = {Nw}', ['f', 'Nw'], (v) => v.f! - v.Nw!, {
        f: [
          (v) => v.Nw!,
          '{Nw}',
          'Level forces: the friction at the foot balances the wall’s push.',
        ],
        Nw: [(v) => v.f!, '{f}', 'Level forces: the wall’s push equals the friction.'],
      }),
      rel('μₛ = f ÷ N_f', '{mu} = {f} ÷ {Nf}', ['mu', 'f', 'Nf'], (v) => v.mu! * v.Nf! - v.f!, {
        mu: [
          (v) => div(v.f!, v.Nf!),
          '{f} ÷ {Nf}',
          'The floor holds while μₛN_f ≥ f, so the least μₛ is f divided by N_f.',
        ],
        f: [(v) => exact(v.mu! * v.Nf!), '{mu} × {Nf}', 'Friction at its limit is μₛN_f.'],
        Nf: [(v) => div(v.f!, v.mu!), '{f} ÷ {mu}', 'Undo μₛ = f ÷ N_f: divide f by μₛ.'],
      }),
    ),
    // The plan's ladder: W = 200 N at θ = 60°: N_f = 200 N, N_w = 200 ÷ (2 × 1.7321) = 57.74 N,
    // f = 57.74 N, μₛ = 57.74 ÷ 200 = 0.2887 (= 1 ÷ (2 tan 60°)).
    example: (() => {
      const [W, theta] = [200, 60];
      const Nw = exact(W / (2 * tanD(theta)));
      return { W, theta, Nw, Nf: W, f: Nw, mu: Nw / W };
    })(),
    startWith: ['W', 'theta'],
    // The ladder on the wall and floor to scale, every force on one scale, the lever arms about
    // the foot dashed; dragging the top sets θ.
    representation: {
      kind: 'freeBody',
      ladder: { angle: 'theta', weight: 'W', wall: 'Nw', floor: 'Nf', friction: 'f', mu: 'mu' },
    },
  },
  {
    // University Physics I → Oscillations: a block on a spring started at x₀ with velocity v₀;
    // the start fixes the amplitude and the phase of x = A cos(ωt + φ).
    id: 'he.physics.university-1#5',
    use: 'Use this for “A 2 kg block on an 80 N/m spring starts 0.1 m from its rest position, moving at −0.6 m/s. Find its amplitude, phase and position 1 s later.”',
    unitSystems: ['metric'],
    assumptions: [
      'No friction: x = A cos(ωt + φ) solves mẍ = −kx with ω = √(k/m).',
      'At t = 0, x₀ = A cos φ and v₀ = −Aω sin φ; squaring and adding gives A, and their signs pick φ’s quarter.',
      'The phase φ is in radians, from −π to π, and so is the angle ωt + φ.',
    ],
    variables: [
      V('m', 'm', 'Mass', { unit: 'kg', min: 0.001, max: 1000, step: 0.1 }),
      V('k', 'k', 'Spring constant', { unit: 'N/m', min: 0.1, max: 1e6, step: 1 }),
      V('w', 'ω', 'Angular frequency', fixed('rad/s', 0.0001, 1e5, 0.1, true)),
      V('x0', 'x₀', 'Start position', { unit: 'm', min: -10, max: 10, step: 0.01 }),
      V('v0', 'v₀', 'Start velocity', { unit: 'm/s', min: -100, max: 100, step: 0.1 }),
      V('A', 'A', 'Amplitude', { unit: 'm', min: 0, max: 1e6, derived: true }),
      V('phi', 'φ', 'Phase', fixed('rad', -Math.PI, Math.PI, 0.001, true)),
      V('t', 't', 'Time', { unit: 's', min: 0, max: 600, step: 0.1 }),
      V('x', 'x', 'Position at t', { unit: 'm', min: -1e6, max: 1e6, derived: true }),
    ],
    ...rels(
      rel('ω = √(k ÷ m)', '{w} = √({k} ÷ {m})', ['w', 'k', 'm'], (v) => v.w! ** 2 * v.m! - v.k!, {
        w: [
          (v) => exact(Math.sqrt(v.k! / v.m!)),
          '√({k} ÷ {m})',
          'The natural angular frequency: the square root of k over m.',
        ],
        k: [(v) => exact(v.w! ** 2 * v.m!), '{w}² × {m}', 'Undo ω = √(k ÷ m): square ω, times m.'],
        m: [(v) => div(v.k!, v.w! ** 2), '{k} ÷ {w}²', 'Undo ω = √(k ÷ m): divide k by ω².'],
      }),
      rel(
        'A = √(x₀² + (v₀ ÷ ω)²)',
        '{A} = √({x0}² + ({v0} ÷ {w})²)',
        ['A', 'x0', 'v0', 'w'],
        (v) => v.A! ** 2 - v.x0! ** 2 - (v.v0! / v.w!) ** 2,
        {
          A: [
            (v) => exact(Math.hypot(v.x0!, v.v0! / v.w!)),
            '√({x0}² + ({v0} ÷ {w})²)',
            'x₀ = A cos φ and v₀ ÷ ω = −A sin φ, so x₀² + (v₀ ÷ ω)² = A²(cos²φ + sin²φ) = A².',
          ],
        },
      ),
      rel(
        'φ = atan2(−v₀ ÷ ω, x₀)',
        '{phi} = atan2(−{v0} ÷ {w}, {x0})',
        ['phi', 'v0', 'w', 'x0'],
        (v) => {
          const d = v.phi! - Math.atan2(-v.v0! / v.w!, v.x0!);
          return Math.atan2(Math.sin(d), Math.cos(d));
        },
        {
          phi: [
            (v) => (v.x0 === 0 && v.v0 === 0 ? undefined : Math.atan2(-v.v0! / v.w!, v.x0!)),
            'atan2(−{v0} ÷ {w}, {x0})',
            'cos φ has x₀’s sign and sin φ has −v₀’s sign: atan2 finds the angle in that quarter.',
          ],
        },
      ),
      rel(
        'x = A cos(ωt + φ)',
        '{x} = {A} × cos({w} × {t} + {phi})',
        ['x', 'A', 'w', 't', 'phi'],
        (v) => v.x! - v.A! * Math.cos(v.w! * v.t! + v.phi!),
        {
          x: [
            (v) => exact(v.A! * Math.cos(v.w! * v.t! + v.phi!)),
            '{A} × cos({w} × {t} + {phi})',
            'The position at time t, the angle ωt + φ in radians.',
          ],
        },
      ),
    ),
    // The plan's block: m = 0.5 kg, k = 50 N/m → ω = √100 = 10 rad/s; x₀ = 0.03 m,
    // v₀ = 0.4 m/s → A = √(0.0009 + 0.0016) = 0.05 m, φ = atan2(−0.04, 0.03) = −0.9273 rad;
    // at t = 0.2 s, x = 0.05 × cos(2 − 0.9273) = 0.05 × cos(1.0727) = 0.02390 m.
    example: (() => {
      const [m, k, x0, v0, t] = [0.5, 50, 0.03, 0.4, 0.2];
      const w = Math.sqrt(k / m);
      const A = exact(Math.hypot(x0, v0 / w));
      const phi = Math.atan2(-v0 / w, x0);
      return { m, k, w, x0, v0, A, phi, t, x: exact(A * Math.cos(w * t + phi)) };
    })(),
    startWith: ['m', 'k', 'x0', 'v0', 't'],
    // The x–t trace from x₀ with the start slope v₀ dashed, ±A marked, the first crest's shift
    // −φ ÷ ω bracketed and the moment t with x.
    representation: {
      kind: 'oscillator',
      mass: 'm',
      spring: 'k',
      amplitude: 'A',
      phase: { x0: 'x0', v0: 'v0', amplitude: 'A', omega: 'w', phase: 'phi', t: 't', x: 'x' },
    },
  },
  {
    // University Physics I → Oscillations: a light dashpot on the spring; the swing rings a
    // little slower than √(k/m) while its amplitude fades as A₀e^(−bt/2m).
    id: 'he.physics.university-1#5~damped',
    title: 'A damped oscillator: its frequency, Q and fading amplitude',
    use: 'Use this for “A 2 kg block on a 200 N/m spring has damping b = 1 kg/s and starts with a 0.1 m amplitude. Find ω′, Q and the amplitude after 4 s.”',
    unitSystems: ['metric'],
    assumptions: [
      'A drag force −bv acts on the block, so mẍ = −kx − bẋ, solved by x = A₀e^(−bt/2m) cos(ω′t) when the damping is light.',
      'Underdamped only: b < 2√(mk). At b = 2√(mk) the block is critically damped and returns without swinging, so ω′ has no value.',
      'Q = mω₀ ÷ b with ω₀ = √(k/m), which is √(mk) ÷ b; Q above 0.5 means it swings.',
    ],
    variables: [
      V('m', 'm', 'Mass', { unit: 'kg', min: 0.001, max: 1000, step: 0.1 }),
      V('k', 'k', 'Spring constant', { unit: 'N/m', min: 0.1, max: 1e6, step: 1 }),
      V('b', 'b', 'Damping constant', fixed('kg/s', 0.001, 1e4, 0.01)),
      V('wp', 'ω′', 'Damped angular frequency', fixed('rad/s', 0.0001, 1e5, 0.1, true)),
      V('Q', 'Q', 'Quality factor', { min: 0.5, max: 1e7, derived: true }),
      V('A0', 'A₀', 'Start amplitude', { unit: 'm', min: 0.001, max: 10, step: 0.01 }),
      V('t', 't', 'Time', { unit: 's', min: 0, max: 600, step: 0.1 }),
      V('A', 'A', 'Amplitude at t', { unit: 'm', min: 0, max: 10, derived: true }),
    ],
    ...rels(
      rel(
        'ω′ = √(k ÷ m − (b ÷ 2m)²)',
        '{wp} = √({k} ÷ {m} − ({b} ÷ (2 × {m}))²)',
        ['wp', 'k', 'm', 'b'],
        (v) => v.wp! ** 2 * v.m! - v.k! + v.b! ** 2 / (4 * v.m!),
        {
          wp: [
            (v) => {
              const s = v.k! / v.m! - (v.b! / (2 * v.m!)) ** 2;
              return s > 0 ? exact(Math.sqrt(s)) : undefined;
            },
            '√({k} ÷ {m} − ({b} ÷ (2 × {m}))²)',
            'Damping slows the swing a little below ω₀ = √(k/m); there is no swing once b ÷ 2m reaches ω₀.',
          ],
          k: [
            (v) => exact(v.m! * (v.wp! ** 2 + (v.b! / (2 * v.m!)) ** 2)),
            '{m} × ({wp}² + ({b} ÷ (2 × {m}))²)',
            'Undo ω′ = √(k ÷ m − (b ÷ 2m)²) for k: square ω′, add (b ÷ 2m)², times m.',
          ],
        },
      ),
      rel(
        'Q = √(mk) ÷ b',
        '{Q} = √({m} × {k}) ÷ {b}',
        ['Q', 'm', 'k', 'b'],
        (v) => v.Q! * v.b! - Math.sqrt(v.m! * v.k!),
        {
          Q: [
            (v) => div(Math.sqrt(v.m! * v.k!), v.b!),
            '√({m} × {k}) ÷ {b}',
            'Q = mω₀ ÷ b, and mω₀ = m√(k/m) = √(mk): a high Q rings for many cycles.',
          ],
          b: [
            (v) => div(Math.sqrt(v.m! * v.k!), v.Q!),
            '√({m} × {k}) ÷ {Q}',
            'Undo Q = √(mk) ÷ b for b: divide √(mk) by Q.',
          ],
        },
      ),
      rel(
        'A = A₀e^(−bt ÷ 2m)',
        '{A} = {A0} × e^(−{b} × {t} ÷ (2 × {m}))',
        ['A', 'A0', 'b', 't', 'm'],
        (v) => v.A! - v.A0! * Math.exp((-v.b! * v.t!) / (2 * v.m!)),
        {
          A: [
            (v) => exact(v.A0! * Math.exp((-v.b! * v.t!) / (2 * v.m!))),
            '{A0} × e^(−{b} × {t} ÷ (2 × {m}))',
            'The envelope of the swing: the amplitude falls by a factor e every 2m ÷ b seconds.',
          ],
          A0: [
            (v) => exact(v.A! * Math.exp((v.b! * v.t!) / (2 * v.m!))),
            '{A} × e^({b} × {t} ÷ (2 × {m}))',
            'Undo the decay: multiply A by e^(bt ÷ 2m).',
          ],
          b: [
            (v) =>
              v.t! > 0 && v.A! > 0 && v.A! < v.A0!
                ? (2 * v.m! * Math.log(v.A0! / v.A!)) / v.t!
                : undefined,
            '2 × {m} × ln({A0} ÷ {A}) ÷ {t}',
            'Take ln of A₀ ÷ A = e^(bt ÷ 2m), then solve for b.',
          ],
          t: [
            (v) =>
              v.A! > 0 && v.A! <= v.A0! ? (2 * v.m! * Math.log(v.A0! / v.A!)) / v.b! : undefined,
            '2 × {m} × ln({A0} ÷ {A}) ÷ {b}',
            'Take ln of A₀ ÷ A = e^(bt ÷ 2m), then solve for t.',
          ],
        },
      ),
    ),
    // The plan's block: m = 0.5 kg, k = 50 N/m, b = 0.4 kg/s: k ÷ m = 100, b ÷ 2m = 0.4, so
    // ω′ = √(100 − 0.16) = √99.84 = 9.992 rad/s; Q = √25 ÷ 0.4 = 12.5; A₀ = 0.05 m, t = 5 s:
    // A = 0.05 × e^(−0.4 × 5 ÷ 1) = 0.05 × e⁻² = 0.006767 m.
    example: (() => {
      const [m, k, b, A0, t] = [0.5, 50, 0.4, 0.05, 5];
      const wp = exact(Math.sqrt(k / m - (b / (2 * m)) ** 2));
      const Q = Math.sqrt(m * k) / b;
      return { m, k, b, wp, Q, A0, t, A: exact(A0 * Math.exp((-b * t) / (2 * m))) };
    })(),
    startWith: ['m', 'k', 'b', 'A0', 't'],
    // The block with its spring and dashpot (b), the x–t trace from A₀ inside the dashed fading
    // envelope ±A₀e^(−bt/2m), ω′ written, and the moment t on the trace.
    representation: {
      kind: 'oscillator',
      mass: 'm',
      spring: 'k',
      amplitude: 'A0',
      damping: { c: 'b', letter: 'b', x0: 'A0', damped: 'wp', t: 't' },
    },
  },
];

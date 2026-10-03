/**
 * College Physics: the calculator modules of every course whose home field is
 * `physics`, keyed by course topic (`<courseId>#<i>`, its problem types `<courseId>#<i>~<slug>`
 * after it), in taxonomy order. Course and topic titles come from taxonomy.ts. Layout pages are
 * in `../layouts/collegePhysics.ts`. Rules: docs/MODULE_GUIDE.md.
 */
import { atan2D, cosD, sinD } from '@/engine/angles';
import type { Values } from '@/engine/types';

import { div } from '../helpers';
import type { ModuleDef } from '../types';

import { polyDerivative, polyForm } from './forms';
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
];

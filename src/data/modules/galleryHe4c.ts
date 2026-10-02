/**
 * College gallery demos, round 4, group C (docs/RENDERINGS_HE.md). Each stands in for the
 * college page that waits, built from the plan's worked example. Spread into gallery.ts.
 *
 * HC99 `motionGraph` `polynomial`: university-1#0~calculus (docs/plans/he.physics.md, P1).
 */
import type { Relation } from '@/engine/types';

import type { LayoutDef } from './layouts';
import type { ModuleDef, StepText } from './types';

/** A relation and its step text, built together. */
interface Rule {
  relation: Relation;
  steps: Record<string, StepText>;
}

const rules = (...rs: Rule[]) => ({
  relations: rs.map((r) => r.relation),
  steps: Object.fromEntries(rs.map((r) => [r.relation.id, r.steps])),
});

const div = (a: number, b: number) => (b === 0 || !Number.isFinite(b) ? undefined : a / b);
const st = (expr: string, how: string): StepText => ({ expr, how });

/** A demo module: college pages show 4 figures. */
const demo = (m: Omit<ModuleDef, 'workedFigures'> & { workedFigures?: number }): ModuleDef => ({
  workedFigures: 4,
  ...m,
});

const quantity = (
  id: string,
  symbol: string,
  name: string,
  unit: string | undefined,
  min: number,
  max: number,
  step: number,
  more: Partial<ModuleDef['variables'][number]> = {},
): ModuleDef['variables'][number] => ({
  id,
  symbol,
  name,
  ...(unit ? { unit, units: [unit] } : {}),
  min,
  max,
  step,
  ...more,
});

// ── HC99: position as a cubic in time (university-1#0~calculus) ──

const polynomialDemo = (
  id: string,
  title: string,
  use: string,
  [c3, c2, c1, c0, t]: [number, number, number, number, number],
) =>
  demo({
    id,
    title,
    use,
    assumptions: [
      'The position x(t) is given as a polynomial in time.',
      'The derivative of tⁿ is ntⁿ⁻¹ (the power rule): v = dx/dt and a = dv/dt.',
      'v = 0 where the motion turns round.',
    ],
    variables: [
      quantity('c3', 'c₃', 'Coefficient of t³', 'm/s³', -50, 50, 0.01),
      quantity('c2', 'c₂', 'Coefficient of t²', 'm/s²', -100, 100, 0.01),
      quantity('c1', 'c₁', 'Coefficient of t', 'm/s', -1000, 1000, 0.1),
      quantity('c0', 'c₀', 'Starting position', 'm', -10000, 10000, 0.1),
      quantity('t', 't', 'Time', 's', 0, 100, 0.01),
      quantity('x', 'x', 'Position', 'm', -1e8, 1e8, 0.01, { derived: true }),
      quantity('v', 'v', 'Velocity', 'm/s', -1e7, 1e7, 0.01, { derived: true }),
      quantity('a', 'a', 'Acceleration', 'm/s²', -1e5, 1e5, 0.01, { derived: true }),
    ],
    ...rules(
      {
        relation: {
          id: 'x = c₀ + c₁t + c₂t² + c₃t³',
          display: '{x} = {c0} + {c1} × {t} + {c2} × {t}² + {c3} × {t}³',
          vars: ['x', 'c0', 'c1', 'c2', 'c3', 't'],
          residual: (v) => v.x! - (v.c0! + v.c1! * v.t! + v.c2! * v.t! ** 2 + v.c3! * v.t! ** 3),
          solve: {
            x: (v) => v.c0! + v.c1! * v.t! + v.c2! * v.t! ** 2 + v.c3! * v.t! ** 3,
            c0: (v) => v.x! - v.c1! * v.t! - v.c2! * v.t! ** 2 - v.c3! * v.t! ** 3,
            c1: (v) => div(v.x! - v.c0! - v.c2! * v.t! ** 2 - v.c3! * v.t! ** 3, v.t!),
            c2: (v) => div(v.x! - v.c0! - v.c1! * v.t! - v.c3! * v.t! ** 3, v.t! ** 2),
            c3: (v) => div(v.x! - v.c0! - v.c1! * v.t! - v.c2! * v.t! ** 2, v.t! ** 3),
          },
        },
        steps: {
          x: st(
            '{c0} + {c1} × {t} + {c2} × {t}² + {c3} × {t}³',
            'Put the time into x(t), one term at a time, and add.',
          ),
          c0: st(
            '{x} − {c1} × {t} − {c2} × {t}² − {c3} × {t}³',
            'Take the other three terms away from the position.',
          ),
          c1: st(
            '({x} − {c0} − {c2} × {t}² − {c3} × {t}³) ÷ {t}',
            'Take the other terms away from x, then divide by t.',
          ),
          c2: st(
            '({x} − {c0} − {c1} × {t} − {c3} × {t}³) ÷ {t}²',
            'Take the other terms away from x, then divide by t².',
          ),
          c3: st(
            '({x} − {c0} − {c1} × {t} − {c2} × {t}²) ÷ {t}³',
            'Take the other terms away from x, then divide by t³.',
          ),
        },
      },
      {
        relation: {
          id: 'v = c₁ + 2c₂t + 3c₃t²',
          display: '{v} = {c1} + 2 × {c2} × {t} + 3 × {c3} × {t}²',
          vars: ['v', 'c1', 'c2', 'c3', 't'],
          residual: (v) => v.v! - (v.c1! + 2 * v.c2! * v.t! + 3 * v.c3! * v.t! ** 2),
          solve: {
            v: (v) => v.c1! + 2 * v.c2! * v.t! + 3 * v.c3! * v.t! ** 2,
            c1: (v) => v.v! - 2 * v.c2! * v.t! - 3 * v.c3! * v.t! ** 2,
            c2: (v) => div(v.v! - v.c1! - 3 * v.c3! * v.t! ** 2, 2 * v.t!),
            c3: (v) => div(v.v! - v.c1! - 2 * v.c2! * v.t!, 3 * v.t! ** 2),
          },
        },
        steps: {
          v: st(
            '{c1} + 2 × {c2} × {t} + 3 × {c3} × {t}²',
            'v = dx/dt: by the power rule each cₙtⁿ gives ncₙtⁿ⁻¹ and c₀ drops out. Put t in.',
          ),
          c1: st(
            '{v} − 2 × {c2} × {t} − 3 × {c3} × {t}²',
            'Take the t and t² terms of v away from the velocity.',
          ),
          c2: st(
            '({v} − {c1} − 3 × {c3} × {t}²) ÷ (2 × {t})',
            'Take the other terms away from v, then divide by 2t.',
          ),
          c3: st(
            '({v} − {c1} − 2 × {c2} × {t}) ÷ (3 × {t}²)',
            'Take the other terms away from v, then divide by 3t².',
          ),
        },
      },
      {
        relation: {
          id: 'a = 2c₂ + 6c₃t',
          display: '{a} = 2 × {c2} + 6 × {c3} × {t}',
          vars: ['a', 'c2', 'c3', 't'],
          residual: (v) => v.a! - (2 * v.c2! + 6 * v.c3! * v.t!),
          solve: {
            a: (v) => 2 * v.c2! + 6 * v.c3! * v.t!,
            c2: (v) => (v.a! - 6 * v.c3! * v.t!) / 2,
            c3: (v) => div(v.a! - 2 * v.c2!, 6 * v.t!),
            t: (v) => div(v.a! - 2 * v.c2!, 6 * v.c3!),
          },
        },
        steps: {
          a: st(
            '2 × {c2} + 6 × {c3} × {t}',
            'a = dv/dt: the power rule again, on v = c₁ + 2c₂t + 3c₃t². Put t in.',
          ),
          c2: st('({a} − 6 × {c3} × {t}) ÷ 2', 'Take 6c₃t away from a, then halve it.'),
          c3: st('({a} − 2 × {c2}) ÷ (6 × {t})', 'Take 2c₂ away from a, then divide by 6t.'),
          t: st('({a} − 2 × {c2}) ÷ (6 × {c3})', 'Take 2c₂ away from a, then divide by 6c₃.'),
        },
      },
    ),
    example: {
      c3,
      c2,
      c1,
      c0,
      t,
      x: c0 + c1 * t + c2 * t ** 2 + c3 * t ** 3,
      v: c1 + 2 * c2 * t + 3 * c3 * t ** 2,
      a: 2 * c2 + 6 * c3 * t,
    },
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
  });

const polynomial = polynomialDemo(
  'g.he-motionGraph-polynomial',
  'Position as a cubic: velocity and acceleration by the power rule',
  'Use this for x = 2t³ − 9t² + 12t + 4 (x in m, t in s): the velocity and acceleration at t = 3 s, and when it turns round.',
  [2, -9, 12, 4, 3],
);

const polynomialLong = polynomialDemo(
  'g.he-motionGraph-polynomial-long',
  'A long trip on a cubic: two turnarounds, then away fast',
  'Use this for a drone at x = 0.25t³ − 12t² + 150t − 500 (m, s): where it is and how fast it moves at t = 40 s.',
  [0.25, -12, 150, -500, 40],
);

// ── HC101: a force pulse's area is the impulse (university-1#3~impulse-curve) ──

const SHAPES = {
  rectangle: {
    k: 1,
    id: 'J = F_max Δt',
    display: '{J} = {F} × {dt}',
    J: st('{F} × {dt}', 'J = ∫F dt: under a steady force the area is a rectangle, height × width.'),
    F: st('{J} ÷ {dt}', 'Divide the area by its width, the contact time.'),
    dt: st('{J} ÷ {F}', 'Divide the area by its height, the force.'),
  },
  triangle: {
    k: 0.5,
    id: 'J = ½F_max Δt',
    display: '{J} = ½ × {F} × {dt}',
    J: st('½ × {F} × {dt}', 'J = ∫F dt: the area of a triangle is half its base times its height.'),
    F: st('2 × {J} ÷ {dt}', 'Double the area, then divide by the base Δt.'),
    dt: st('2 × {J} ÷ {F}', 'Double the area, then divide by the peak force.'),
  },
  halfSine: {
    k: 2 / Math.PI,
    id: 'J = (2 ÷ π)F_max Δt',
    display: '{J} = 2 ÷ π × {F} × {dt}',
    J: st(
      '2 ÷ π × {F} × {dt}',
      'J = ∫F_max sin(πt ÷ Δt) dt from 0 to Δt = (2 ÷ π)F_max Δt: put the values in.',
    ),
    F: st('π × {J} ÷ (2 × {dt})', 'Undo the 2 ÷ π, then divide by Δt.'),
    dt: st('π × {J} ÷ (2 × {F})', 'Undo the 2 ÷ π, then divide by the peak force.'),
  },
} as const;

const impulseDemo = (
  id: string,
  title: string,
  use: string,
  shape: keyof typeof SHAPES,
  [F, dt, m]: [number, number, number],
) => {
  const s = SHAPES[shape];
  const J = s.k * F * dt;
  return demo({
    id,
    title,
    use,
    assumptions: [
      'The impulse is the area under the force–time graph, J = ∫F dt.',
      'The average force is the steady force giving the same impulse in the same time.',
      'Only this force acts along the motion, and the object starts from rest.',
    ],
    variables: [
      quantity('F', 'F_max', 'Peak force', 'N', 0.01, 1e7, 1),
      quantity('dt', 'Δt', 'Contact time', 's', 0.00001, 100, 0.0001),
      quantity('J', 'J', 'Impulse', 'N·s', 1e-6, 1e8, 0.001),
      quantity('Favg', 'F_avg', 'Average force', 'N', 0.001, 1e7, 0.1),
      quantity('m', 'm', 'Mass', 'kg', 0.001, 1e5, 0.001),
      quantity('dv', 'Δv', 'Change in speed', 'm/s', 1e-6, 1e5, 0.01),
    ],
    ...rules(
      {
        relation: {
          id: s.id,
          display: s.display,
          vars: ['J', 'F', 'dt'],
          residual: (v) => v.J! - s.k * v.F! * v.dt!,
          solve: {
            J: (v) => s.k * v.F! * v.dt!,
            F: (v) => div(v.J!, s.k * v.dt!),
            dt: (v) => div(v.J!, s.k * v.F!),
          },
        },
        steps: { J: s.J, F: s.F, dt: s.dt },
      },
      {
        relation: {
          id: 'F_avg = J ÷ Δt',
          display: '{Favg} = {J} ÷ {dt}',
          vars: ['Favg', 'J', 'dt'],
          residual: (v) => v.Favg! * v.dt! - v.J!,
          solve: {
            Favg: (v) => div(v.J!, v.dt!),
            J: (v) => v.Favg! * v.dt!,
            dt: (v) => div(v.J!, v.Favg!),
          },
        },
        steps: {
          Favg: st('{J} ÷ {dt}', 'Spread the impulse evenly over the contact time.'),
          J: st('{Favg} × {dt}', 'The average force times the time gives the same area.'),
          dt: st('{J} ÷ {Favg}', 'Divide the impulse by the average force.'),
        },
      },
      {
        relation: {
          id: 'Δv = J ÷ m',
          display: '{dv} = {J} ÷ {m}',
          vars: ['dv', 'J', 'm'],
          residual: (v) => v.dv! * v.m! - v.J!,
          solve: {
            dv: (v) => div(v.J!, v.m!),
            J: (v) => v.dv! * v.m!,
            m: (v) => div(v.J!, v.dv!),
          },
        },
        steps: {
          dv: st(
            '{J} ÷ {m}',
            'The impulse is the change in momentum, J = mΔv: divide by the mass.',
          ),
          J: st('{m} × {dv}', 'The change in momentum is mass times change in speed.'),
          m: st('{J} ÷ {dv}', 'Divide the change in momentum by the change in speed.'),
        },
      },
    ),
    example: { F, dt, J, Favg: J / dt, m, dv: J / m },
    startWith: ['F', 'dt', 'm'],
    representation: {
      kind: 'impulse',
      shape,
      peak: 'F',
      time: 'dt',
      impulse: 'J',
      average: 'Favg',
      mass: 'm',
      change: 'dv',
    },
  });
};

const impulseTriangle = impulseDemo(
  'g.he-impulse-triangle',
  'A triangular force pulse: its area is the impulse',
  'Use this for a force that rises to 1200 N and falls back over 0.010 s on a 0.15 kg ball at rest: the impulse, the average force and the ball’s speed.',
  'triangle',
  [1200, 0.01, 0.15],
);

const impulseRectangle = impulseDemo(
  'g.he-impulse-rectangle',
  'A steady push: the impulse is force × time',
  'Use this for a steady 50 N push for 0.4 s on a 2 kg cart at rest: the impulse and the cart’s speed.',
  'rectangle',
  [50, 0.4, 2],
);

const impulseSine = impulseDemo(
  'g.he-impulse-half-sine',
  'A bat on a ball: a half-sine force pulse',
  'Use this for a bat’s force rising to 9000 N and back as half a sine over 1.2 ms on a 0.145 kg ball: the impulse, the average force and the change in speed.',
  'halfSine',
  [9000, 0.0012, 0.145],
);

const impulseGolf = impulseDemo(
  'g.he-impulse-half-sine-golf',
  'A club on a golf ball: a big force for half a millisecond',
  'Use this for a club pushing a 45.9 g golf ball with a half-sine force peaking at 12,000 N over 0.5 ms: how fast the ball leaves.',
  'halfSine',
  [12000, 0.0005, 0.0459],
);

// ── HC103: a rod as a physical pendulum (university-1#5~physical-pendulum) ──

const G_PHYS = 9.8;
const TWO_PI = 2 * Math.PI;

const rodDemo = (
  id: string,
  title: string,
  use: string,
  [m, L, p]: [number, number, number | undefined],
) => {
  const d = L / 2 - (p ?? 0);
  const I = m * ((L * L) / 12 + d * d);
  const T = TWO_PI * Math.sqrt(I / (m * G_PHYS * d));
  const pin: Rule =
    p === undefined
      ? {
          relation: {
            id: 'd = L ÷ 2',
            display: '{d} = {L} ÷ 2',
            vars: ['d', 'L'],
            residual: (v) => v.d! - v.L! / 2,
            solve: { d: (v) => v.L! / 2, L: (v) => 2 * v.d! },
          },
          steps: {
            d: st(
              '{L} ÷ 2',
              'A uniform rod’s center of mass is at its middle, L ÷ 2 below the end.',
            ),
            L: st('2 × {d}', 'The pin is at the end, so the rod is twice d long.'),
          },
        }
      : {
          relation: {
            id: 'd = L ÷ 2 − p',
            display: '{d} = {L} ÷ 2 − {p}',
            vars: ['d', 'L', 'p'],
            residual: (v) => v.d! - (v.L! / 2 - v.p!),
            solve: {
              d: (v) => v.L! / 2 - v.p!,
              L: (v) => 2 * (v.d! + v.p!),
              p: (v) => v.L! / 2 - v.d!,
            },
          },
          steps: {
            d: st(
              '{L} ÷ 2 − {p}',
              'The center of mass is at the middle; the pin is p below the end.',
            ),
            L: st('2 × ({d} + {p})', 'From the end to the middle is p + d: double it.'),
            p: st('{L} ÷ 2 − {d}', 'Take d away from half the rod.'),
          },
        };
  return demo({
    id,
    title,
    use,
    assumptions: [
      'A uniform rod swinging through small angles about a fixed pin, no friction.',
      'I about the pin by parallel axes: I = mL² ÷ 12 + md², with g = 9.80 m/s².',
      'A simple pendulum of length I ÷ (md) keeps the same time.',
    ],
    variables: [
      quantity('m', 'm', 'Mass of the rod', 'kg', 0.001, 1000, 0.001),
      quantity('L', 'L', 'Length of the rod', 'm', 0.01, 100, 0.01),
      ...(p === undefined
        ? []
        : [quantity('p', 'p', 'Pin below the top end', 'm', 0.001, 50, 0.01)]),
      quantity('d', 'd', 'Pin to center of mass', 'm', 0.0001, 50, 0.0001),
      quantity('I', 'I', 'Moment of inertia about the pin', 'kg·m²', 1e-9, 1e7, 0.0001),
      quantity('T', 'T', 'Period', 's', 0.001, 1000, 0.001),
      quantity('Leq', 'L_eq', 'Equivalent simple length', 'm', 0.0001, 1e5, 0.0001, {
        derived: true,
      }),
    ],
    ...rules(
      pin,
      {
        relation: {
          id: 'I = mL² ÷ 12 + md²',
          display: '{I} = {m} × {L}² ÷ 12 + {m} × {d}²',
          vars: ['I', 'm', 'L', 'd'],
          residual: (v) => v.I! - v.m! * (v.L! ** 2 / 12 + v.d! ** 2),
          solve: {
            I: (v) => v.m! * (v.L! ** 2 / 12 + v.d! ** 2),
            m: (v) => div(v.I!, v.L! ** 2 / 12 + v.d! ** 2),
            L: (v) => {
              const x = 12 * (v.I! / v.m! - v.d! ** 2);
              return x < 0 ? undefined : Math.sqrt(x);
            },
            d: (v) => {
              const x = v.I! / v.m! - v.L! ** 2 / 12;
              return x < 0 ? undefined : Math.sqrt(x);
            },
          },
        },
        steps: {
          I: st(
            '{m} × {L}² ÷ 12 + {m} × {d}²',
            'Parallel axes: I about the middle, mL² ÷ 12, plus md² for the pin d away.',
          ),
          m: st('{I} ÷ ({L}² ÷ 12 + {d}²)', 'Both terms have m: divide I by what multiplies it.'),
          L: st('√(12 × ({I} ÷ {m} − {d}²))', 'Take md² away, then undo the ÷ 12 and the square.'),
          d: st(
            '√({I} ÷ {m} − {L}² ÷ 12)',
            'Take mL² ÷ 12 away, divide by m, take the square root.',
          ),
        },
      },
      {
        relation: {
          id: 'T = 2π√(I ÷ (mgd))',
          display: '{T} = 2π × √({I} ÷ ({m} × 9.8 × {d}))',
          vars: ['T', 'I', 'm', 'd'],
          residual: (v) => v.T! - TWO_PI * Math.sqrt(v.I! / (v.m! * G_PHYS * v.d!)),
          solve: {
            T: (v) => {
              const x = v.I! / (v.m! * G_PHYS * v.d!);
              return x > 0 ? TWO_PI * Math.sqrt(x) : undefined;
            },
            I: (v) => v.m! * G_PHYS * v.d! * (v.T! / TWO_PI) ** 2,
            m: (v) => div(v.I!, G_PHYS * v.d! * (v.T! / TWO_PI) ** 2),
            d: (v) => div(v.I!, v.m! * G_PHYS * (v.T! / TWO_PI) ** 2),
          },
        },
        steps: {
          T: st(
            '2π × √({I} ÷ ({m} × 9.8 × {d}))',
            'Gravity’s torque mgd sin θ ≈ mgdθ pulls it back, so ω² = mgd ÷ I and T = 2π ÷ ω.',
          ),
          I: st('{m} × 9.8 × {d} × ({T} ÷ 2π)²', 'Divide T by 2π, square it, then times mgd.'),
          m: st(
            '{I} ÷ (9.8 × {d} × ({T} ÷ 2π)²)',
            'Divide T by 2π and square it, then solve for m.',
          ),
          d: st(
            '{I} ÷ ({m} × 9.8 × ({T} ÷ 2π)²)',
            'Divide T by 2π and square it, then solve for d.',
          ),
        },
      },
      {
        relation: {
          id: 'L_eq = I ÷ (md)',
          display: '{Leq} = {I} ÷ ({m} × {d})',
          vars: ['Leq', 'I', 'm', 'd'],
          residual: (v) => v.Leq! * v.m! * v.d! - v.I!,
          solve: {
            Leq: (v) => div(v.I!, v.m! * v.d!),
            I: (v) => v.Leq! * v.m! * v.d!,
            m: (v) => div(v.I!, v.Leq! * v.d!),
            d: (v) => div(v.I!, v.Leq! * v.m!),
          },
        },
        steps: {
          Leq: st(
            '{I} ÷ ({m} × {d})',
            'A simple pendulum has T = 2π√(L ÷ g): set L = I ÷ (md) to match.',
          ),
          I: st('{Leq} × {m} × {d}', 'Multiply the equivalent length by md.'),
          m: st('{I} ÷ ({Leq} × {d})', 'Divide I by the equivalent length times d.'),
          d: st('{I} ÷ ({Leq} × {m})', 'Divide I by the equivalent length times m.'),
        },
      },
    ),
    example: { m, L, ...(p === undefined ? {} : { p }), d, I, T, Leq: I / (m * d) },
    startWith: p === undefined ? ['m', 'L'] : ['m', 'L', 'p'],
    representation: {
      kind: 'pendulum',
      rod: { length: 'L', pivot: p === undefined ? 0 : 'p' },
      mass: 'm',
      g: G_PHYS,
      inertia: 'I',
      distance: 'd',
      period: 'T',
      equivalent: 'Leq',
    },
  });
};

const rodEnd = rodDemo(
  'g.he-pendulum-rod',
  'A rod swinging from its end: a physical pendulum',
  'Use this for a 0.4 kg, 1 m rod pivoted at its end: its period, and the length of the simple pendulum that keeps time with it.',
  [0.4, 1, undefined],
);

const rodOffset = rodDemo(
  'g.he-pendulum-rod-offset',
  'A meter stick pinned at its 20 cm mark',
  'Use this for a 0.15 kg meter stick swinging on a nail through its 20 cm mark: the period and where the pin is from the center of mass.',
  [0.15, 1, 0.2],
);

const rodNearCenter = rodDemo(
  'g.he-pendulum-rod-near-center',
  'Pinned 5 cm from the middle: a slow swing',
  'Use this for a meter stick pinned 45 cm from its end: why the period grows as the pin nears the center of mass.',
  [0.15, 1, 0.45],
);

export const HE4C_GALLERY_MODULES: ModuleDef[] = [
  rodEnd,
  rodOffset,
  rodNearCenter,
  polynomial,
  polynomialLong,
  impulseTriangle,
  impulseRectangle,
  impulseSine,
  impulseGolf,
];

export const HE4C_GALLERY_LAYOUTS: LayoutDef[] = [];

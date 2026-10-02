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

// ── HC104: spacetime diagrams (university-3#2~lorentz, ~velocity-addition) ──

const lorentzDemo = (
  id: string,
  title: string,
  use: string,
  [b, x, ct]: [number, number, number],
) => {
  const g = 1 / Math.sqrt(1 - b * b);
  return demo({
    id,
    title,
    use,
    assumptions: [
      'S′ moves at v = βc along +x; the two frames’ origins meet at t = 0.',
      'x and ct are both lengths: ct is how far light goes in the time t.',
      'The interval s² = (ct)² − x² is the same in every frame.',
    ],
    variables: [
      quantity('b', 'β', 'Speed of S′ (v ÷ c)', undefined, -0.9999, 0.9999, 0.0001),
      quantity('g', 'γ', 'Lorentz factor', undefined, 1, 100, 0.0001, { derived: true }),
      quantity('x', 'x', 'Event’s position in S', 'm', -1e9, 1e9, 1),
      quantity('ct', 'ct', 'Event’s time in S, as ct', 'm', -1e9, 1e9, 1),
      quantity('xp', 'x′', 'Event’s position in S′', 'm', -1e11, 1e11, 0.01),
      quantity('ctp', 'ct′', 'Event’s time in S′, as ct′', 'm', -1e11, 1e11, 0.01),
      quantity('s2', 's²', 'Interval', 'm²', -1e19, 1e19, 1),
    ],
    ...rules(
      {
        relation: {
          id: 'γ = 1 ÷ √(1 − β²)',
          display: '{g} = 1 ÷ √(1 − {b}²)',
          vars: ['g', 'b'],
          residual: (v) => v.g! * Math.sqrt(Math.max(0, 1 - v.b! ** 2)) - 1,
          solve: {
            g: (v) => (Math.abs(v.b!) >= 1 ? undefined : 1 / Math.sqrt(1 - v.b! ** 2)),
            b: (v) => (v.g! < 1 ? undefined : Math.sqrt(1 - 1 / v.g! ** 2)),
          },
        },
        steps: {
          g: st(
            '1 ÷ √(1 − {b}²)',
            'Square β, take it from 1, take the square root and turn it over.',
          ),
          b: st('√(1 − 1 ÷ {g}²)', 'Undo each step of γ: 1 − 1 ÷ γ² is β².'),
        },
      },
      {
        relation: {
          id: 'x′ = γ(x − βct)',
          display: '{xp} = {g} × ({x} − {b} × {ct})',
          vars: ['xp', 'g', 'x', 'b', 'ct'],
          residual: (v) => v.xp! - v.g! * (v.x! - v.b! * v.ct!),
          solve: {
            xp: (v) => v.g! * (v.x! - v.b! * v.ct!),
            x: (v) => v.xp! / v.g! + v.b! * v.ct!,
            ct: (v) => div(v.x! - v.xp! / v.g!, v.b!),
          },
        },
        steps: {
          xp: st(
            '{g} × ({x} − {b} × {ct})',
            'The Lorentz transformation: take βct from x, then times γ.',
          ),
          x: st('{xp} ÷ {g} + {b} × {ct}', 'Divide x′ by γ, then add βct back.'),
          ct: st('({x} − {xp} ÷ {g}) ÷ {b}', 'Take x′ ÷ γ from x, then divide by β.'),
        },
      },
      {
        relation: {
          id: 'ct′ = γ(ct − βx)',
          display: '{ctp} = {g} × ({ct} − {b} × {x})',
          vars: ['ctp', 'g', 'ct', 'b', 'x'],
          residual: (v) => v.ctp! - v.g! * (v.ct! - v.b! * v.x!),
          solve: {
            ctp: (v) => v.g! * (v.ct! - v.b! * v.x!),
            ct: (v) => v.ctp! / v.g! + v.b! * v.x!,
            x: (v) => div(v.ct! - v.ctp! / v.g!, v.b!),
          },
        },
        steps: {
          ctp: st(
            '{g} × ({ct} − {b} × {x})',
            'Time transforms the same way with x and ct swapped.',
          ),
          ct: st('{ctp} ÷ {g} + {b} × {x}', 'Divide ct′ by γ, then add βx back.'),
          x: st('({ct} − {ctp} ÷ {g}) ÷ {b}', 'Take ct′ ÷ γ from ct, then divide by β.'),
        },
      },
      {
        relation: {
          id: 's² = (ct)² − x²',
          display: '{s2} = {ct}² − {x}²',
          vars: ['s2', 'ct', 'x'],
          residual: (v) => v.s2! - (v.ct! ** 2 - v.x! ** 2),
          solve: {
            s2: (v) => v.ct! ** 2 - v.x! ** 2,
            ct: (v) => (v.s2! + v.x! ** 2 < 0 ? undefined : Math.sqrt(v.s2! + v.x! ** 2)),
            x: (v) => (v.ct! ** 2 - v.s2! < 0 ? undefined : Math.sqrt(v.ct! ** 2 - v.s2!)),
          },
        },
        steps: {
          s2: st('{ct}² − {x}²', 'Square each coordinate and take x² from (ct)².'),
          ct: st(
            '√({s2} + {x}²)',
            'Add x² back and take the square root (the event after the origin).',
          ),
          x: st(
            '√({ct}² − {s2})',
            'Take s² from (ct)² and take the square root (x ahead of the origin).',
          ),
        },
      },
    ),
    example: {
      b,
      g,
      x,
      ct,
      xp: g * (x - b * ct),
      ctp: g * (ct - b * x),
      s2: ct * ct - x * x,
    },
    startWith: ['b', 'x', 'ct'],
    representation: {
      kind: 'spacetime',
      mode: 'lorentz',
      speed: 'b',
      x: 'x',
      ct: 'ct',
      gamma: 'g',
      xPrime: 'xp',
      ctPrime: 'ctp',
      interval: 's2',
    },
  });
};

const lorentz = lorentzDemo(
  'g.he-spacetime-lorentz',
  'An event in two frames: the Lorentz transformation',
  'Use this for an event at x = 900 m, ct = 600 m seen from a frame moving at 0.6c: its x′ and ct′, and the interval in both.',
  [0.6, 900, 600],
);

const lorentzFast = lorentzDemo(
  'g.he-spacetime-lorentz-fast',
  'A frame at 0.8c: the axes close on the light line',
  'Use this for a timelike event (x = 300 m, ct = 900 m) seen from a frame at 0.8c, where it lands behind the moving origin.',
  [0.8, 300, 900],
);

const additionDemo = (id: string, title: string, use: string, [vv, up]: [number, number]) =>
  demo({
    id,
    title,
    use,
    assumptions: [
      'S′ moves at v along +x in S; the object moves at u′ along +x in S′.',
      'Speeds are in units of c, so c itself is 1.',
      'Nothing with mass reaches c: u stays below 1 whatever v and u′ are.',
    ],
    variables: [
      quantity('v', 'v', 'Speed of S′ in S', 'c', -0.9999, 0.9999, 0.0001),
      quantity('up', 'u′', 'Object’s speed in S′', 'c', -0.9999, 0.9999, 0.0001),
      quantity('u', 'u', 'Object’s speed in S', 'c', -0.9999999, 0.9999999, 0.0001),
    ],
    ...rules({
      relation: {
        id: 'u = (v + u′) ÷ (1 + vu′)',
        display: '{u} = ({v} + {up}) ÷ (1 + {v} × {up})',
        vars: ['u', 'v', 'up'],
        residual: (x) => x.u! * (1 + x.v! * x.up!) - (x.v! + x.up!),
        solve: {
          u: (x) => div(x.v! + x.up!, 1 + x.v! * x.up!),
          v: (x) => div(x.u! - x.up!, 1 - x.u! * x.up!),
          up: (x) => div(x.u! - x.v!, 1 - x.u! * x.v!),
        },
      },
      steps: {
        u: st(
          '({v} + {up}) ÷ (1 + {v} × {up})',
          'Add the speeds, then divide by 1 + vu′ (in c), which keeps the sum below c.',
        ),
        v: st('({u} − {up}) ÷ (1 − {u} × {up})', 'The same law run backwards, with u′ taken away.'),
        up: st('({u} − {v}) ÷ (1 − {u} × {v})', 'The same law run backwards, with v taken away.'),
      },
    }),
    example: { v: vv, up, u: (vv + up) / (1 + vv * up) },
    startWith: ['v', 'up'],
    representation: {
      kind: 'spacetime',
      mode: 'addition',
      speed: 'v',
      other: 'up',
      result: 'u',
    },
  });

const addition = additionDemo(
  'g.he-spacetime-addition',
  'Adding 0.6c to 0.6c: still slower than light',
  'Use this for a probe fired forward at 0.6c from a ship moving at 0.6c: how fast it goes as seen from Earth.',
  [0.6, 0.6],
);

const additionNearC = additionDemo(
  'g.he-spacetime-addition-near-c',
  'Adding 0.9c to 0.9c: the world line hugs the light line',
  'Use this for two speeds near c added: why 0.9c on 0.9c gives 0.9945c, not 1.8c.',
  [0.9, 0.9],
);

// ── HC105: Compton scattering (university-3#3) ──

const COMPTON = 2.426;
const HC = 1240;
const DEG_C = Math.PI / 180;

const comptonDemo = (id: string, title: string, use: string, [lam, th]: [number, number]) => {
  const dl = COMPTON * (1 - Math.cos(th * DEG_C));
  const lamp = lam + dl;
  return demo({
    id,
    title,
    use,
    assumptions: [
      'The electron starts free and at rest; energy and momentum are both kept.',
      'h ÷ (mₑc) = 2.426 pm and hc = 1240 keV·pm.',
      'The shift Δλ depends only on the angle, not on λ.',
    ],
    variables: [
      quantity('lam', 'λ', 'Incoming wavelength', 'pm', 1, 1000, 0.01),
      quantity('th', 'θ', 'Scattering angle', '°', 0, 180, 0.1),
      quantity('dl', 'Δλ', 'Wavelength shift', 'pm', 0, 4.852, 0.0001),
      quantity('lamp', 'λ′', 'Scattered wavelength', 'pm', 1, 1005, 0.01),
      quantity('E', 'E', 'Incoming photon energy', 'keV', 1, 1240, 0.001),
      quantity('Ep', 'E′', 'Scattered photon energy', 'keV', 1, 1240, 0.001),
      quantity('K', 'K', 'Electron’s kinetic energy', 'keV', 0, 1240, 0.001),
    ],
    ...rules(
      {
        relation: {
          id: 'Δλ = (h ÷ mₑc)(1 − cos θ)',
          display: '{dl} = 2.426 × (1 − cos({th}°))',
          vars: ['dl', 'th'],
          residual: (v) => v.dl! - COMPTON * (1 - Math.cos(v.th! * DEG_C)),
          solve: {
            dl: (v) => COMPTON * (1 - Math.cos(v.th! * DEG_C)),
            th: (v) => {
              const x = 1 - v.dl! / COMPTON;
              return Math.acos(Math.max(-1, Math.min(1, x))) / DEG_C;
            },
          },
        },
        steps: {
          dl: st('2.426 × (1 − cos({th}°))', 'The Compton shift: h ÷ (mₑc) times 1 − cos θ.'),
          th: st(
            'cos⁻¹(1 − {dl} ÷ 2.426)',
            'Divide the shift by 2.426 pm, take it from 1, then take cos⁻¹.',
          ),
        },
      },
      {
        relation: {
          id: 'λ′ = λ + Δλ',
          display: '{lamp} = {lam} + {dl}',
          vars: ['lamp', 'lam', 'dl'],
          residual: (v) => v.lamp! - v.lam! - v.dl!,
          solve: {
            lamp: (v) => v.lam! + v.dl!,
            lam: (v) => v.lamp! - v.dl!,
            dl: (v) => v.lamp! - v.lam!,
          },
        },
        steps: {
          lamp: st('{lam} + {dl}', 'The scattered photon’s wave is longer by the shift.'),
          lam: st('{lamp} − {dl}', 'Take the shift off the scattered wavelength.'),
          dl: st('{lamp} − {lam}', 'The shift is how much longer λ′ is than λ.'),
        },
      },
      {
        relation: {
          id: 'E = hc ÷ λ',
          display: '{E} = 1240 ÷ {lam}',
          vars: ['E', 'lam'],
          residual: (v) => v.E! * v.lam! - HC,
          solve: { E: (v) => div(HC, v.lam!), lam: (v) => div(HC, v.E!) },
        },
        steps: {
          E: st('1240 ÷ {lam}', 'A photon’s energy is hc ÷ λ, with hc = 1240 keV·pm.'),
          lam: st('1240 ÷ {E}', 'Divide hc by the energy.'),
        },
      },
      {
        relation: {
          id: 'E′ = hc ÷ λ′',
          display: '{Ep} = 1240 ÷ {lamp}',
          vars: ['Ep', 'lamp'],
          residual: (v) => v.Ep! * v.lamp! - HC,
          solve: { Ep: (v) => div(HC, v.lamp!), lamp: (v) => div(HC, v.Ep!) },
        },
        steps: {
          Ep: st('1240 ÷ {lamp}', 'The same for the scattered photon, with its longer λ′.'),
          lamp: st('1240 ÷ {Ep}', 'Divide hc by the scattered energy.'),
        },
      },
      {
        relation: {
          id: 'K = E − E′',
          display: '{K} = {E} − {Ep}',
          vars: ['K', 'E', 'Ep'],
          residual: (v) => v.K! - (v.E! - v.Ep!),
          solve: {
            K: (v) => v.E! - v.Ep!,
            E: (v) => v.K! + v.Ep!,
            Ep: (v) => v.E! - v.K!,
          },
        },
        steps: {
          K: st('{E} − {Ep}', 'Energy is kept: what the photon lost, the electron carries off.'),
          E: st('{K} + {Ep}', 'Add the electron’s share back to the scattered photon’s.'),
          Ep: st('{E} − {K}', 'Take the electron’s share from the incoming energy.'),
        },
      },
    ),
    example: { lam, th, dl, lamp, E: HC / lam, Ep: HC / lamp, K: HC / lam - HC / lamp },
    startWith: ['lam', 'th'],
    representation: {
      kind: 'photoelectric',
      mode: 'compton',
      wavelength: 'lam',
      angle: 'th',
      shift: 'dl',
      scattered: 'lamp',
      energy: 'E',
      scatteredEnergy: 'Ep',
      kinetic: 'K',
      compton: COMPTON,
      hc: HC,
    },
  });
};

const compton = comptonDemo(
  'g.he-photoelectric-compton',
  'Compton scattering: an X-ray photon bounces off an electron',
  'Use this for 71 pm X-rays scattered through 90°: the shift, the new wavelength and the energy the electron takes.',
  [71, 90],
);

const comptonBack = comptonDemo(
  'g.he-photoelectric-compton-backscatter',
  'A gamma ray bounced straight back: the largest shift',
  'Use this for a 5 pm gamma ray scattered back through 180°: the wavelength doubles and the electron takes half the energy.',
  [5, 180],
);

// ── HC118: an infinite slope, soil and ice (physical-geology#3, ~glacier) ──

const D = Math.PI / 180;

const soilSlabDemo = (
  id: string,
  title: string,
  use: string,
  [th, z, c, phi, gam]: [number, number, number, number, number],
) => {
  const sig = gam * z * Math.cos(th * D) ** 2;
  const tau = gam * z * Math.sin(th * D) * Math.cos(th * D);
  const sv = c + sig * Math.tan(phi * D);
  return demo({
    id,
    title,
    use,
    assumptions: [
      'The slab is long next to its depth, so its ends don’t matter (an infinite slope).',
      'The soil is dry: water in it would cut σ and the strength.',
      'FS below 1 means the slab slides.',
    ],
    variables: [
      quantity('th', 'θ', 'Slope angle', '°', 1, 70, 0.1),
      quantity('z', 'z', 'Depth to the slip surface', 'm', 0.1, 50, 0.01),
      quantity('c', 'c', 'Cohesion', 'kPa', 0, 100, 0.1),
      quantity('phi', 'φ', 'Friction angle', '°', 10, 50, 0.1),
      quantity('gam', 'γ', 'Unit weight', 'kN/m³', 10, 25, 0.1),
      quantity('sig', 'σ', 'Normal stress', 'kPa', 0.001, 1250, 0.01),
      quantity('tau', 'τ', 'Driving shear stress', 'kPa', 0.001, 625, 0.01),
      quantity('s', 's', 'Shear strength', 'kPa', 0.001, 1600, 0.01),
      quantity('FS', 'FS', 'Factor of safety', undefined, 0, 1000, 0.001),
    ],
    ...rules(
      {
        relation: {
          id: 'σ = γz cos²θ',
          display: '{sig} = {gam} × {z} × cos({th}°)²',
          vars: ['sig', 'gam', 'z', 'th'],
          residual: (v) => v.sig! - v.gam! * v.z! * Math.cos(v.th! * D) ** 2,
          solve: {
            sig: (v) => v.gam! * v.z! * Math.cos(v.th! * D) ** 2,
            gam: (v) => div(v.sig!, v.z! * Math.cos(v.th! * D) ** 2),
            z: (v) => div(v.sig!, v.gam! * Math.cos(v.th! * D) ** 2),
            th: (v) => {
              const x = v.sig! / (v.gam! * v.z!);
              return x < 0 || x > 1 ? undefined : Math.acos(Math.sqrt(x)) / D;
            },
          },
        },
        steps: {
          sig: st(
            '{gam} × {z} × cos({th}°)²',
            'The column’s weight γz, spread over a base tilted by θ, pressing square onto it.',
          ),
          gam: st('{sig} ÷ ({z} × cos({th}°)²)', 'Divide σ by z cos²θ.'),
          z: st('{sig} ÷ ({gam} × cos({th}°)²)', 'Divide σ by γ cos²θ.'),
          th: st('cos⁻¹(√({sig} ÷ ({gam} × {z})))', 'σ ÷ γz is cos²θ: take the root, then cos⁻¹.'),
        },
      },
      {
        relation: {
          id: 'τ = γz sin θ cos θ',
          display: '{tau} = {gam} × {z} × sin({th}°) × cos({th}°)',
          vars: ['tau', 'gam', 'z', 'th'],
          residual: (v) => v.tau! - v.gam! * v.z! * Math.sin(v.th! * D) * Math.cos(v.th! * D),
          solve: {
            tau: (v) => v.gam! * v.z! * Math.sin(v.th! * D) * Math.cos(v.th! * D),
            gam: (v) => div(v.tau!, v.z! * Math.sin(v.th! * D) * Math.cos(v.th! * D)),
            z: (v) => div(v.tau!, v.gam! * Math.sin(v.th! * D) * Math.cos(v.th! * D)),
          },
        },
        steps: {
          tau: st(
            '{gam} × {z} × sin({th}°) × cos({th}°)',
            'The weight’s part along the slope, on the same tilted base.',
          ),
          gam: st('{tau} ÷ ({z} × sin({th}°) × cos({th}°))', 'Divide τ by z sin θ cos θ.'),
          z: st('{tau} ÷ ({gam} × sin({th}°) × cos({th}°))', 'Divide τ by γ sin θ cos θ.'),
        },
      },
      {
        relation: {
          id: 's = c + σ tan φ',
          display: '{s} = {c} + {sig} × tan({phi}°)',
          vars: ['s', 'c', 'sig', 'phi'],
          residual: (v) => v.s! - (v.c! + v.sig! * Math.tan(v.phi! * D)),
          solve: {
            s: (v) => v.c! + v.sig! * Math.tan(v.phi! * D),
            c: (v) => v.s! - v.sig! * Math.tan(v.phi! * D),
            sig: (v) => div(v.s! - v.c!, Math.tan(v.phi! * D)),
            phi: (v) => {
              const x = div(v.s! - v.c!, v.sig!);
              return x === undefined || x < 0 ? undefined : Math.atan(x) / D;
            },
          },
        },
        steps: {
          s: st(
            '{c} + {sig} × tan({phi}°)',
            'Mohr–Coulomb: cohesion plus friction on the normal stress.',
          ),
          c: st('{s} − {sig} × tan({phi}°)', 'Take the friction part from the strength.'),
          sig: st('({s} − {c}) ÷ tan({phi}°)', 'Take c from s, then divide by tan φ.'),
          phi: st('tan⁻¹(({s} − {c}) ÷ {sig})', 'The friction part over σ is tan φ.'),
        },
      },
      {
        relation: {
          id: 'FS = s ÷ τ',
          display: '{FS} = {s} ÷ {tau}',
          vars: ['FS', 's', 'tau'],
          residual: (v) => v.FS! * v.tau! - v.s!,
          solve: {
            FS: (v) => div(v.s!, v.tau!),
            s: (v) => v.FS! * v.tau!,
            tau: (v) => div(v.s!, v.FS!),
          },
        },
        steps: {
          FS: st('{s} ÷ {tau}', 'How many times the strength covers the driving stress.'),
          s: st('{FS} × {tau}', 'Multiply the driving stress by FS.'),
          tau: st('{s} ÷ {FS}', 'Divide the strength by FS.'),
        },
      },
    ),
    example: { th, z, c, phi, gam, sig, tau, s: sv, FS: sv / tau },
    startWith: ['th', 'z', 'c', 'phi', 'gam'],
    representation: {
      kind: 'freeBody',
      slab: {
        material: 'soil',
        thickness: 'z',
        angle: 'th',
        unitWeight: 'gam',
        cohesion: 'c',
        friction: 'phi',
        normal: 'sig',
        shear: 'tau',
        strength: 's',
        safety: 'FS',
      },
    },
  });
};

const slabSoil = soilSlabDemo(
  'g.he-freeBody-slab-soil',
  'A soil slope: the factor of safety of a slab',
  'Use this for a 30° slope with a slip surface 2 m down (c = 5 kPa, φ = 35°, γ = 20 kN/m³): the stresses on it and its factor of safety.',
  [30, 2, 5, 35, 20],
);

const slabSoilSlides = soilSlabDemo(
  'g.he-freeBody-slab-soil-slides',
  'A steeper, deeper slab: FS below 1, so it slides',
  'Use this for a 40° slope with a slip surface 3 m down in weak soil (c = 2 kPa, φ = 30°, γ = 19 kN/m³): does it slide?',
  [40, 3, 2, 30, 19],
);

const G_EARTH = 9.81;

const slabIce = demo({
  id: 'g.he-freeBody-slab-ice',
  title: 'A glacier on its bed: the basal shear stress',
  use: 'Use this for ice 300 m thick on a 3° surface slope: the shear stress at its bed, or the thickness that gives 100 kPa.',
  assumptions: [
    'The slope is the ice surface’s, not the bed’s; the ice is long next to its thickness.',
    'g = 9.81 m/s²; ice flows when the basal shear nears about 100 kPa.',
  ],
  variables: [
    quantity('rho', 'ρ', 'Ice density', 'kg/m³', 800, 1000, 1),
    quantity('H', 'H', 'Ice thickness', 'm', 1, 4000, 1),
    quantity('al', 'α', 'Surface slope', '°', 0.1, 30, 0.1),
    quantity('tb', 'τ_b', 'Basal shear stress', 'kPa', 0.001, 20000, 0.01),
  ],
  ...rules({
    relation: {
      id: 'τ_b = ρgH sin α',
      display: '{tb} = {rho} × 9.81 × {H} × sin({al}°) ÷ 1000',
      vars: ['tb', 'rho', 'H', 'al'],
      residual: (v) => v.tb! - (v.rho! * G_EARTH * v.H! * Math.sin(v.al! * D)) / 1000,
      solve: {
        tb: (v) => (v.rho! * G_EARTH * v.H! * Math.sin(v.al! * D)) / 1000,
        rho: (v) => div(1000 * v.tb!, G_EARTH * v.H! * Math.sin(v.al! * D)),
        H: (v) => div(1000 * v.tb!, v.rho! * G_EARTH * Math.sin(v.al! * D)),
        al: (v) => {
          const x = (1000 * v.tb!) / (v.rho! * G_EARTH * v.H!);
          return x > 1 ? undefined : Math.asin(x) / D;
        },
      },
    },
    steps: {
      tb: st(
        '{rho} × 9.81 × {H} × sin({al}°) ÷ 1000',
        'The ice column’s weight ρgH, its part along the slope, in kPa.',
      ),
      rho: st('1000 × {tb} ÷ (9.81 × {H} × sin({al}°))', 'Divide the shear (in Pa) by gH sin α.'),
      H: st('1000 × {tb} ÷ ({rho} × 9.81 × sin({al}°))', 'Divide the shear (in Pa) by ρg sin α.'),
      al: st('sin⁻¹(1000 × {tb} ÷ ({rho} × 9.81 × {H}))', 'The shear over ρgH is sin α.'),
    },
  }),
  example: {
    rho: 917,
    H: 300,
    al: 3,
    tb: (917 * G_EARTH * 300 * Math.sin(3 * D)) / 1000,
  },
  startWith: ['rho', 'H', 'al'],
  representation: {
    kind: 'freeBody',
    slab: {
      material: 'ice',
      thickness: 'H',
      angle: 'al',
      density: 'rho',
      g: G_EARTH,
      shear: 'tb',
    },
  },
});

export const HE4C_GALLERY_MODULES: ModuleDef[] = [
  polynomial,
  polynomialLong,
  impulseTriangle,
  impulseRectangle,
  impulseSine,
  impulseGolf,
  rodEnd,
  rodOffset,
  rodNearCenter,
  lorentz,
  lorentzFast,
  addition,
  additionNearC,
  compton,
  comptonBack,
  slabSoil,
  slabSoilSlides,
  slabIce,
];

export const HE4C_GALLERY_LAYOUTS: LayoutDef[] = [];

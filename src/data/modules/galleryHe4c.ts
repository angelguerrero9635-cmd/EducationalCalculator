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

export const HE4C_GALLERY_MODULES: ModuleDef[] = [
  polynomial,
  polynomialLong,
  impulseTriangle,
  impulseRectangle,
  impulseSine,
  impulseGolf,
];

export const HE4C_GALLERY_LAYOUTS: LayoutDef[] = [];

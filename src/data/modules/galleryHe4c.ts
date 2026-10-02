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

export const HE4C_GALLERY_MODULES: ModuleDef[] = [polynomial, polynomialLong];

export const HE4C_GALLERY_LAYOUTS: LayoutDef[] = [];

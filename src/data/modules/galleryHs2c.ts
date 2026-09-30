/**
 * Grades 9–12 round 2 gallery demos (group H2C: physics (H102); see pictureRequestsHs.ts and
 * docs/HS_NEEDS.md). Each demo shows one option or part in a page stand-in. Spread into
 * gallery.ts.
 */
import type { Relation, Values, VariableDef } from '@/engine/types';

import type { LayoutDef } from './layouts';
import type { ModuleDef, StepText } from './types';

// ─── Helpers (the Grade 11 file's, kept here so a demo promotes as it is) ────

/** A relation and its step text, built together so a demo lists both from one place. */
interface Rule {
  relation: Relation;
  steps: Record<string, StepText>;
}

/** Gathers rules into a module's `relations` and `steps`. */
const rules = (...rs: Rule[]) => ({
  relations: rs.map((r) => r.relation),
  steps: Object.fromEntries(rs.map((r) => [r.relation.id, r.steps])),
});

type Solve = (v: Values) => number | number[] | undefined;

/**
 * A rule from its display, its residual and, per variable, how to solve for it with the step
 * text: `[solve, expr, how]`. A variable given `undefined` is solved numerically, with no step;
 * one given `null` is never worked out from this rule.
 */
const rule = (
  id: string,
  display: string,
  residual: (v: Values) => number,
  parts: Record<string, [Solve, string, string] | undefined | null>,
): Rule => ({
  relation: {
    id,
    display,
    vars: [
      ...new Set([...Object.keys(parts), ...[...display.matchAll(/\{(\w+)\}/g)].map((x) => x[1]!)]),
    ],
    residual,
    solve: Object.fromEntries(
      Object.entries(parts).flatMap(([k, p]) =>
        p ? [[k, p[0]]] : p === null ? [[k, () => undefined]] : [],
      ),
    ) as Relation['solve'],
  },
  steps: Object.fromEntries(
    Object.entries(parts).flatMap(([k, p]) => (p ? [[k, { expr: p[1], how: p[2] }]] : [])),
  ),
});

/** A measured value with its unit and range. */
const q = (
  id: string,
  symbol: string,
  name: string,
  unit: string | undefined,
  min: number,
  max: number,
  step = 0.1,
  extra: Partial<VariableDef> = {},
): VariableDef => ({ id, symbol, name, ...(unit ? { unit } : {}), min, max, step, ...extra });

/** Division that gives undefined for a zero divisor (the solver then skips it). */
const div = (a: number, b: number) => (Math.abs(b) < 1e-12 ? undefined : a / b);

// ─── H102.1 collision `general`: both velocities after, each cart's energy ───

const oneAfter: ModuleDef = (() => {
  const [m, n, v, w, a] = [0.6, 0.4, 0.5, -0.25, 0.1];
  const b = (m * v + n * w - m * a) / n;
  const X = 0.5 * m * v * v + 0.5 * n * w * w - 0.5 * m * a * a - 0.5 * n * b * b;
  return {
    id: 'g.s11-momentum-one-after',
    title: 'One velocity after, the other from momentum',
    use: 'Use this for “A 0.6 kg cart at 0.5 m/s hits a 0.4 kg cart at rest and slows to 0.2 m/s. How fast does the other cart move, and how much kinetic energy is lost?”',
    unitSystems: ['metric'],
    assumptions: [
      'No outside push along the track, so the total momentum is the same before and after.',
      '+ is to the right: a cart moving left has a negative velocity.',
      'Kinetic energy is not always kept: what is lost turns to heat and sound.',
    ],
    variables: [
      q('m', 'm₁', 'Mass of cart 1', 'kg', 0.01, 1e5, 0.01),
      q('n', 'm₂', 'Mass of cart 2', 'kg', 0.01, 1e5, 0.01),
      q('v', 'v₁', 'Velocity of cart 1 before', 'm/s', -100, 100, 0.01),
      q('w', 'v₂', 'Velocity of cart 2 before', 'm/s', -100, 100, 0.01),
      q('a', 'v₁′', 'Velocity of cart 1 after', 'm/s', -300, 300, 0.01),
      q('b', 'v₂′', 'Velocity of cart 2 after', 'm/s', -300, 300, 0.0001),
      q('X', 'ΔKE', 'Kinetic energy lost', 'J', 0, 1e10, 0.0001),
    ],
    ...rules(
      rule(
        'm₁v₁ + m₂v₂ = m₁v₁′ + m₂v₂′',
        '{m} × {v} + {n} × {w} = {m} × {a} + {n} × {b}',
        (x) => x.m! * x.v! + x.n! * x.w! - x.m! * x.a! - x.n! * x.b!,
        {
          b: [
            (x) => div(x.m! * x.v! + x.n! * x.w! - x.m! * x.a!, x.n!),
            '({m} × {v} + {n} × {w} − {m} × {a})/{n}',
            'The momentum before, less cart 1’s after, is cart 2’s after; divide by m₂.',
          ],
          a: [
            (x) => div(x.m! * x.v! + x.n! * x.w! - x.n! * x.b!, x.m!),
            '({m} × {v} + {n} × {w} − {n} × {b})/{m}',
            'The momentum before, less cart 2’s after, is cart 1’s after; divide by m₁.',
          ],
          v: [
            (x) => div(x.m! * x.a! + x.n! * x.b! - x.n! * x.w!, x.m!),
            '({m} × {a} + {n} × {b} − {n} × {w})/{m}',
            'The momentum after, less cart 2’s before, is cart 1’s before; divide by m₁.',
          ],
          w: [
            (x) => div(x.m! * x.a! + x.n! * x.b! - x.m! * x.v!, x.n!),
            '({m} × {a} + {n} × {b} − {m} × {v})/{n}',
            'The momentum after, less cart 1’s before, is cart 2’s before; divide by m₂.',
          ],
        },
      ),
      rule(
        'ΔKE = KE before − KE after',
        '{X} = ½ × {m} × {v}² + ½ × {n} × {w}² − ½ × {m} × {a}² − ½ × {n} × {b}²',
        (x) =>
          x.X! -
          (0.5 * x.m! * x.v! ** 2 +
            0.5 * x.n! * x.w! ** 2 -
            0.5 * x.m! * x.a! ** 2 -
            0.5 * x.n! * x.b! ** 2),
        {
          X: [
            (x) =>
              0.5 * x.m! * x.v! ** 2 +
              0.5 * x.n! * x.w! ** 2 -
              0.5 * x.m! * x.a! ** 2 -
              0.5 * x.n! * x.b! ** 2,
            '½ × {m} × {v}² + ½ × {n} × {w}² − ½ × {m} × {a}² − ½ × {n} × {b}²',
            'Each cart’s ½mv² before, less each cart’s ½mv² after.',
          ],
          m: null,
          n: null,
          v: null,
          w: null,
          a: null,
          b: null,
        },
      ),
    ),
    example: { m, n, v, w, a, b, X },
    startWith: ['m', 'v', 'n', 'w', 'a'],
    representation: {
      kind: 'collision',
      type: 'general',
      masses: ['m', 'n'],
      before: ['v', 'w'],
      after: ['a', 'b'],
      lost: 'X',
    },
  };
})();

export const HS2C_GALLERY_MODULES: ModuleDef[] = [oneAfter];

export const HS2C_GALLERY_LAYOUTS: LayoutDef[] = [];

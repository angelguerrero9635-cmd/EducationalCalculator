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

// ─── H102.2 impulse: the force–time rectangle, and a slower stop ─────────────

const impulse: ModuleDef = (() => {
  const [m, u, v, t] = [0.2, 25, -15, 0.05];
  const P = m * (v - u);
  return {
    id: 'g.s11-momentum-impulse',
    title: 'Impulse: force × time = change in momentum',
    use: 'Use this for “A 0.2 kg ball at 25 m/s is stopped by a glove in 0.05 s. What average force acts on it? Why does pulling the glove back help?”',
    unitSystems: ['metric'],
    assumptions: [
      '+ is the way the object first moves; a force against it is negative.',
      'F is the average force over the time Δt.',
      'The dashed rectangle is the same change in momentum spread over 0.2 s.',
    ],
    variables: [
      q('m', 'm', 'Mass', 'kg', 0.001, 1e5, 0.001),
      q('u', 'v₀', 'Velocity before', 'm/s', -300, 300, 0.1),
      q('v', 'v', 'Velocity after', 'm/s', -300, 300, 0.1),
      q('P', 'Δp', 'Change in momentum', 'kg·m/s', -1e7, 1e7, 0.001),
      q('t', 'Δt', 'Time of the push', 's', 0.0001, 100, 0.001),
      q('F', 'F', 'Average force', 'N', -1e9, 1e9, 0.01),
    ],
    ...rules(
      rule('Δp = m(v − v₀)', '{P} = {m} × ({v} − {u})', (x) => x.P! - x.m! * (x.v! - x.u!), {
        P: [
          (x) => x.m! * (x.v! - x.u!),
          '{m} × ({v} − {u})',
          'The momentum after less the momentum before.',
        ],
        m: [
          (x) => div(x.P!, x.v! - x.u!),
          '{P}/({v} − {u})',
          'Divide Δp by the change in velocity.',
        ],
        v: [
          (x) => div(x.P! + x.m! * x.u!, x.m!),
          '{u} + {P}/{m}',
          'Add Δp/m to the velocity before.',
        ],
        u: [
          (x) => div(x.m! * x.v! - x.P!, x.m!),
          '{v} − {P}/{m}',
          'Take Δp/m from the velocity after.',
        ],
      }),
      rule('F = Δp/Δt', '{F} = {P}/{t}', (x) => x.F! * x.t! - x.P!, {
        F: [(x) => div(x.P!, x.t!), '{P}/{t}', 'The change in momentum per second.'],
        P: [(x) => x.F! * x.t!, '{F} × {t}', 'The impulse: force × time.'],
        t: [(x) => div(x.P!, x.F!), '{P}/{F}', 'How long the force must push for this Δp.'],
      }),
    ),
    example: { m, u, v, P, t, F: P / t },
    startWith: ['m', 'u', 'v', 't'],
    representation: {
      kind: 'impulse',
      mass: 'm',
      before: 'u',
      after: 'v',
      time: 't',
      change: 'P',
      force: 'F',
      compare: 0.2,
    },
  };
})();

// ─── H102.3 circularMotion `satellite`: v = √(GM/r), T = 2πr/v ──────────────

const GRAV = 6.674e-11;

const orbit: ModuleDef = (() => {
  const [M, r] = [5.97e24, 7.0e6];
  const v = Math.sqrt((GRAV * M) / r);
  return {
    id: 'g.s11-circular-gravitation-orbit',
    title: 'A satellite in orbit',
    use: 'Use this for “A satellite circles Earth (5.97 × 10²⁴ kg) 7.0 × 10⁶ m from its center. How fast does it go, and how long is one orbit?”',
    unitSystems: ['metric'],
    assumptions: [
      'The orbit is a circle, and gravity is the only force: it supplies the centripetal force.',
      'GMm/r² = mv²/r, so v = √(GM/r), with G = 6.674 × 10⁻¹¹ N·m²/kg²; the satellite’s mass cancels.',
      'r is measured from the center of the planet, not from its surface.',
    ],
    variables: [
      q('M', 'M', 'Central mass', 'kg', 1e10, 1e32, 1, { scientific: true }),
      q('r', 'r', 'Orbit radius', 'm', 1, 1e13, 1, { scientific: true }),
      q('v', 'v', 'Orbital speed', 'm/s', 1e-3, 1e7, 0.1),
      q('T', 'T', 'Period', 's', 1, 1e11, 1, { scientific: true, units: ['s'] }),
    ],
    ...rules(
      rule(
        'v = √(GM/r)',
        '{v} = √(6.674 × 10⁻¹¹ × {M}/{r})',
        (x) => (x.v! * x.v! * x.r!) / (GRAV * x.M!) - 1,
        {
          v: [
            (x) => Math.sqrt(Math.max(0, div(GRAV * x.M!, x.r!) ?? 0)),
            '√(6.674 × 10⁻¹¹ × {M}/{r})',
            'G times the central mass, over r, then the square root.',
          ],
          r: [
            (x) => div(GRAV * x.M!, x.v! * x.v!),
            '6.674 × 10⁻¹¹ × {M}/({v}²)',
            'Square both sides: r = GM/v².',
          ],
          M: [
            (x) => div(x.v! * x.v! * x.r!, GRAV),
            '{v}² × {r}/(6.674 × 10⁻¹¹)',
            'Square both sides: M = v²r/G.',
          ],
        },
      ),
      rule('T = 2πr/v', '{T} = 2π × {r}/{v}', (x) => (x.T! * x.v!) / (2 * Math.PI * x.r!) - 1, {
        T: [
          (x) => div(2 * Math.PI * x.r!, x.v!),
          '2π × {r}/{v}',
          'Once round the circle, 2πr, at speed v.',
        ],
        v: [
          (x) => div(2 * Math.PI * x.r!, x.T!),
          '2π × {r}/{T}',
          'Once round the circle in one period.',
        ],
        r: [
          (x) => (x.v! * x.T!) / (2 * Math.PI),
          '{v} × {T}/(2π)',
          'The distance in one period is 2πr.',
        ],
      }),
    ),
    example: { M, r, v, T: (2 * Math.PI * r) / v },
    startWith: ['M', 'r'],
    representation: {
      kind: 'circularMotion',
      mode: 'satellite',
      central: 'M',
      radius: 'r',
      speed: 'v',
      period: 'T',
      body: 'earth',
      bodyRadius: 6.371e6,
    },
  };
})();

export const HS2C_GALLERY_MODULES: ModuleDef[] = [oneAfter, impulse, orbit];

export const HS2C_GALLERY_LAYOUTS: LayoutDef[] = [];

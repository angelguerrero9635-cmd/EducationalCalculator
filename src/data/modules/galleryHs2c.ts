/**
 * Grades 9–12 round 2 gallery demos (group H2C: physics (H102); see pictureRequestsHs.ts and
 * docs/HS_NEEDS.md). Each demo shows one option or part in a page stand-in. Spread into
 * gallery.ts.
 */
import type { Relation, Values, VariableDef } from '@/engine/types';

import { atLeast } from './helpers';
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

// ─── H102.4 motionGraph `strobe: 'vertical'`: a dropped stone ────────────────

const G_EARTH = 9.8;

const freeFall: ModuleDef = (() => {
  const t = 3;
  return {
    id: 'g.s11-kinematics-1d-free-fall-vertical',
    title: 'Free fall, the strobe stood up',
    use: 'Use this for “A stone falls from rest for 3 s. How far does it fall, and how fast is it going?”',
    unitSystems: ['metric'],
    assumptions: [
      'Dropped from rest, so it starts at v₀ = 0.',
      'Air resistance is ignored: every object falls with a = −9.8 m/s², whatever its mass.',
      'Up is +, so the velocity is negative on the way down; the drop d is how far it fell.',
    ],
    variables: [
      q('a', 'a', 'Acceleration of gravity', 'm/s²', -50, 50, 0.1, { derived: true }),
      q('t', 't', 'Time', 's', 0.01, 30, 0.01),
      q('v', 'v', 'Velocity (− is down)', 'm/s', -300, 0, 0.01, { derived: true }),
      q('d', 'd', 'Drop', 'm', 0, 5000, 0.01),
    ],
    ...rules(
      rule('a = −9.8', '{a} = −9.8', (x) => x.a! + G_EARTH, {
        a: [
          (x) => -G_EARTH + 0 * (x.a ?? 0),
          '−9.8',
          'Near Earth’s surface gravity speeds a falling object up by 9.8 m/s each second, downward.',
        ],
      }),
      rule('v = at', '{v} = {a} × {t}', (x) => x.v! - x.a! * x.t!, {
        v: [
          (x) => x.a! * x.t!,
          '{a} × {t}',
          'From rest, the velocity is the acceleration times the time.',
        ],
      }),
      rule('d = ½gt²', '{d} = ½ × 9.8 × {t}²', (x) => x.d! - 0.5 * G_EARTH * x.t! * x.t!, {
        d: [
          (x) => 0.5 * G_EARTH * x.t! * x.t!,
          '½ × 9.8 × {t}²',
          'From rest the drop is ½gt²: it grows with the square of the time.',
        ],
        t: [
          (x) => (x.d! >= 0 ? Math.sqrt((2 * x.d!) / G_EARTH) : undefined),
          '√(2 × {d}/9.8)',
          'Undo ½gt²: double the drop, divide by g, take the square root.',
        ],
      }),
    ),
    example: { a: -G_EARTH, t, v: -G_EARTH * t, d: 0.5 * G_EARTH * t * t },
    startWith: ['t'],
    representation: {
      kind: 'motionGraph',
      graph: 'speed',
      time: 't',
      acceleration: 'a',
      speed: 'v',
      start: 0,
      kinematics: { view: 'velocity', strobe: 'vertical' },
    },
    pictureLabels: ['d'],
  };
})();

// ─── H102.10b charges: the field at a point between two charges ─────────────

const K_E = 8.99e9;

const pointField: ModuleDef = (() => {
  const [a, b, r, x] = [3, -1, 0.4, 0.1];
  const E = (K_E * a * 1e-6) / (x * x) - (K_E * b * 1e-6) / ((r - x) * (r - x));
  return {
    id: 'g.s11-electrostatics-point-field',
    title: 'The field at a point between two charges',
    use: 'Use this for “+3 μC and −1 μC are 0.4 m apart. What is the field 0.1 m from the +3 μC charge, on the line between them?”',
    unitSystems: ['metric'],
    assumptions: [
      'The point is on the line between the charges, x from q₁; + is toward q₂.',
      'Each charge’s field points away from it if +, toward it if −, and the two fields add.',
      'E = kq₁/x² − kq₂/(r − x)², with k = 8.99 × 10⁹ N·m²/C² and the charges in μC × 10⁻⁶.',
    ],
    variables: [
      q('a', 'q₁', 'First charge', 'μC', -1000, 1000, 0.01),
      q('b', 'q₂', 'Second charge', 'μC', -1000, 1000, 0.01),
      q('r', 'r', 'Distance between the charges', 'm', 0.001, 100, 0.001),
      q('x', 'x', 'Distance of the point from q₁', 'm', 0.0001, 100, 0.0001),
      q('E', 'E', 'Field at the point (+ toward q₂)', 'N/C', -1e15, 1e15, 0.01, {
        scientific: true,
      }),
    ],
    ...rules(
      { relation: atLeast('r', 'x'), steps: {} },
      rule(
        'E = kq₁/x² − kq₂/(r − x)²',
        '{E} = 8.99 × 10⁹ × {a} × 10⁻⁶/{x}² − 8.99 × 10⁹ × {b} × 10⁻⁶/({r} − {x})²',
        (v) =>
          v.E! -
          ((K_E * v.a! * 1e-6) / (v.x! * v.x!) -
            (K_E * v.b! * 1e-6) / ((v.r! - v.x!) * (v.r! - v.x!))),
        {
          E: [
            (v) =>
              v.x! > 0 && v.r! > v.x!
                ? (K_E * v.a! * 1e-6) / (v.x! * v.x!) -
                  (K_E * v.b! * 1e-6) / ((v.r! - v.x!) * (v.r! - v.x!))
                : undefined,
            '8.99 × 10⁹ × {a} × 10⁻⁶/({x}²) − 8.99 × 10⁹ × {b} × 10⁻⁶/(({r} − {x})²)',
            'For + charges, q₁’s part points toward q₂ and q₂’s points back toward q₁: subtract it.',
          ],
          a: null,
          b: null,
          r: null,
          x: null,
        },
      ),
    ),
    example: { a, b, r, x, E },
    startWith: ['a', 'b', 'r', 'x'],
    representation: {
      kind: 'charges',
      charges: ['a', 'b'],
      distance: 'r',
      point: 'x',
      field: 'E',
    },
  };
})();

export const HS2C_GALLERY_MODULES: ModuleDef[] = [freeFall, pointField];

export const HS2C_GALLERY_LAYOUTS: LayoutDef[] = [];

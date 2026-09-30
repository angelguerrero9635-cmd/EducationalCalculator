/**
 * Grades 9–12 round 2 gallery demos (group H2B: geometry (H96); see pictureRequestsHs.ts and
 * docs/HS_NEEDS.md). Each demo shows one option or part in a page stand-in. Spread into
 * gallery.ts.
 */
import type { Relation, Values, VariableDef } from '@/engine/types';

import type { LayoutDef } from './layouts';
import type { ModuleDef, Representation, StepText } from './types';

type Solve = (v: Values) => number | undefined;
interface Rule {
  relation: Relation;
  steps: Record<string, StepText>;
}

/** A value with a range. */
const V = (
  id: string,
  symbol: string,
  name: string,
  min: number,
  max: number,
  extra: Partial<VariableDef> = {},
): VariableDef => ({ id, symbol, name, min, max, ...extra });
/** An angle in degrees. */
const deg = (id: string, symbol: string, name: string, min = 0.1, max = 179.9) =>
  V(id, symbol, name, min, max, { unit: '°' });

/** One relation with its step text: for each value it is solved for, [solve, expr, how]. */
function rule(
  id: string,
  display: string,
  solve: Record<string, [Solve, string, string]>,
  residual: (v: Values) => number,
): Rule {
  const vars = [...display.matchAll(/\{(\w+)\}/g)].map((m) => m[1]!);
  return {
    relation: {
      id,
      display,
      vars: [...new Set(vars)],
      residual,
      solve: Object.fromEntries(Object.entries(solve).map(([k, [fn]]) => [k, fn])),
    },
    steps: Object.fromEntries(
      Object.entries(solve).map(([k, [, expr, how]]) => [k, { expr, how }]),
    ),
  };
}

/** A page stand-in from its rules. */
function demo(d: {
  id: string;
  title: string;
  use: string;
  assumptions: string[];
  variables: VariableDef[];
  rules: Rule[];
  example: Values;
  startWith: string[];
  representation: Representation;
}): ModuleDef {
  return {
    id: d.id,
    title: d.title,
    use: d.use,
    assumptions: d.assumptions,
    variables: d.variables,
    relations: d.rules.map((r) => r.relation),
    steps: Object.fromEntries(d.rules.map((r) => [r.relation.id, r.steps])),
    example: d.example,
    startWith: d.startWith,
    representation: d.representation,
  };
}

// ─── Part 1: a regular polygon (m.10.quadrilaterals main) ─────────────────────

const polygonSums = (id: string, title: string, use: string, n: number, start: string[]) =>
  demo({
    id,
    title,
    use,
    assumptions: [
      'The diagonals from one corner cut a convex polygon with n sides into n − 2 triangles.',
      'Each triangle’s angles add to 180°, so the interior angles add to (n − 2) × 180°.',
      'A regular polygon’s angles are equal: each is the sum ÷ n. Its exterior angles add to 360°, so each is 360° ÷ n.',
    ],
    variables: [
      V('n', 'n', 'Number of sides', 3, 30, { step: 1, integer: true }),
      V('S', 'S', 'Sum of the interior angles', 180, 5040, { unit: '°', step: 1 }),
      deg('e', 'e', 'Each interior angle', 60, 168),
      deg('x', 'x', 'Each exterior angle', 12, 120),
    ],
    rules: [
      rule(
        'S = (n − 2) × 180',
        '{S} = ({n} − 2) × 180',
        {
          S: [
            (v) => (v.n! - 2) * 180,
            '({n} − 2) × 180',
            'The n − 2 triangles from one corner each add 180°.',
          ],
          n: [(v) => v.S! / 180 + 2, '{S} ÷ 180 + 2', 'Count the triangles, then add 2.'],
        },
        (v) => v.S! - (v.n! - 2) * 180,
      ),
      rule(
        'e = S/n',
        '{e} = {S} ÷ {n}',
        {
          e: [(v) => v.S! / v.n!, '{S} ÷ {n}', 'The n equal angles share the sum.'],
          S: [(v) => v.e! * v.n!, '{e} × {n}', 'n equal angles make the sum.'],
          n: [(v) => v.S! / v.e!, '{S} ÷ {e}', 'How many equal angles make the sum.'],
        },
        (v) => v.e! * v.n! - v.S!,
      ),
      rule(
        'x = 360/n',
        '{x} = 360 ÷ {n}',
        {
          x: [(v) => 360 / v.n!, '360 ÷ {n}', 'The n equal exterior angles add to 360°.'],
          n: [(v) => 360 / v.x!, '360 ÷ {x}', 'How many equal exterior angles make 360°.'],
        },
        (v) => v.x! * v.n! - 360,
      ),
    ],
    example: { n, S: (n - 2) * 180, e: ((n - 2) * 180) / n, x: 360 / n },
    startWith: start,
    representation: {
      kind: 'markedFigure',
      regular: {
        sides: 'n',
        triangles: true,
        exterior: true,
        labels: { sum: 'S', interior: 'e', exterior: 'x' },
      },
    },
  });

const REGULAR: ModuleDef[] = [
  polygonSums(
    'g.m10-quadrilaterals-polygon-sums',
    'Polygon angle sums',
    'Use this for “Find the sum of the interior angles of a 9-gon, and each angle if it is regular.”',
    9,
    ['n'],
  ),
  polygonSums(
    'g.m10-quadrilaterals-polygon-sums-30',
    'Sides from an exterior angle',
    'Use this for “Each exterior angle of a regular polygon is 12°. How many sides has it?”',
    30,
    ['x'],
  ),
];

export const HS2B_GALLERY_MODULES: ModuleDef[] = [...REGULAR];

export const HS2B_GALLERY_LAYOUTS: LayoutDef[] = [];

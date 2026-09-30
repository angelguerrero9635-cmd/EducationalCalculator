/**
 * Grades 9–12 round 2 gallery demos (group H2H: the builders' options (H105); see pictureRequestsHs.ts and
 * docs/HS_NEEDS.md). Each demo shows one option or part in a page stand-in. Spread into
 * gallery.ts.
 */
import type { Relation, Values, VariableDef } from '@/engine/types';

import type { LayoutDef } from './layouts';
import { MATH_10_MODULES } from './math/10';
import { MATH_11_MODULES } from './math/11';
import { MATH_12_MODULES } from './math/12';
import { MATH_9_MODULES } from './math/9';
import { SCIENCE_10_MODULES } from './science/10';
import { SCIENCE_11_MODULES } from './science/11';
import { SCIENCE_12_MODULES } from './science/12';
import type { ModuleDef, Representation, StepText } from './types';

type Solver = (v: Values) => number | number[] | undefined;
type Rule = { relation: Relation; steps: Record<string, StepText> };

/** Rounded to 12 significant figures, so 0.1 + 0.2 is 0.3 when a value is worked out. */
const exact = (x: number) => Number(x.toPrecision(12));

/** A relation with its steps, each variable's solver, expression and explanation. */
function rule(
  id: string,
  display: string,
  vars: string[],
  residual: (v: Values) => number,
  parts: Record<string, [Solver, StepText['expr'], StepText['how'], Partial<StepText>?]>,
  more: Partial<Relation> = {},
): Rule {
  const solve: Record<string, Solver> = {};
  const steps: Record<string, StepText> = {};
  for (const [v, [fn, expr, how, extra]] of Object.entries(parts)) {
    solve[v] = fn;
    if (fn.length > 0) steps[v] = { expr, how, ...extra };
  }
  for (const v of vars) if (!(v in solve)) solve[v] = () => undefined;
  return { relation: { id, display, vars, residual, solve, ...more }, steps };
}

/** A value worked out from others, never solved backwards. */
function derive(
  id: string,
  x: string,
  inputs: string[],
  display: string,
  f: (v: Values) => number | undefined,
  expr: StepText['expr'],
  how: StepText['how'],
  more: Partial<StepText> = {},
  rel: Partial<Relation> = {},
): Rule {
  return rule(
    id,
    display,
    [x, ...inputs],
    (v) => v[x]! - (f(v) ?? NaN),
    { [x]: [(v: Values) => f(v), expr, how, more] },
    rel,
  );
}

const PAGES = [
  ...MATH_9_MODULES,
  ...MATH_10_MODULES,
  ...MATH_11_MODULES,
  ...MATH_12_MODULES,
  ...SCIENCE_10_MODULES,
  ...SCIENCE_11_MODULES,
  ...SCIENCE_12_MODULES,
];

const pageOf = (id: string) => {
  const found = PAGES.find((m) => m.id === id);
  if (!found) throw new Error(`galleryHs2h: no page ${id}`);
  return found;
};

/**
 * A demo from the page that waits: its variables, rules, steps and example, with the picture
 * the page will pass. `vars` changes variables; `add` appends new ones; `drop` removes
 * relations (by id) that `rules` replace.
 */
function fromPage(
  pageId: string,
  id: string,
  title: string,
  representation: Representation,
  more: Partial<ModuleDef> & {
    vars?: Record<string, Partial<VariableDef>>;
    add?: VariableDef[];
    drop?: string[];
    rules?: Rule[];
  } = {},
): ModuleDef {
  const found = pageOf(pageId);
  const { vars, add, drop, rules, ...rest } = more;
  const kept = found.relations.filter((r) => !(drop ?? []).includes(r.id));
  const steps = Object.fromEntries(
    Object.entries(found.steps).filter(([k]) => !(drop ?? []).includes(k)),
  );
  return {
    ...found,
    id,
    title,
    representation,
    variables: [
      ...found.variables.map((v) => (vars?.[v.id] ? { ...v, ...vars[v.id] } : v)),
      ...(add ?? []),
    ],
    relations: [...kept, ...(rules ?? []).map((r) => r.relation)],
    steps: { ...steps, ...Object.fromEntries((rules ?? []).map((r) => [r.relation.id, r.steps])) },
    ...rest,
  };
}

// ── H105 (1): scatter, the residual of point k ──

const regression = pageOf('m.9.regression');
const PRACTICE = (regression.representation as Extract<Representation, { kind: 'scatter' }>).points;
/** Point k's coordinates (k counted from 1). */
const pointK = (v: Values) => PRACTICE[Math.round(v.k!) - 1];

const residualK = fromPage(
  'm.9.regression',
  'g.m9-regression-point-k',
  'Residual of the point you pick',
  {
    ...(regression.representation as Extract<Representation, { kind: 'scatter' }>),
    residualOf: { point: 'k', residual: 'e' },
  },
  {
    vars: { e: { name: 'Residual of point k' } },
    add: [
      {
        id: 'k',
        symbol: 'k',
        name: 'Point number',
        min: 1,
        max: PRACTICE.length,
        integer: true,
        allowed: PRACTICE.map((_, i) => i + 1),
      },
    ],
    drop: ['e = 61 − (3m + b)'],
    rules: [
      derive(
        'e = y_k − (m x_k + b)',
        'e',
        ['k', 'm', 'b'],
        '{e} = y_k − ({m} × x_k + {b}) for point {k}',
        (v) => {
          const p = pointK(v);
          return p ? exact(p[1] - (v.m! * p[0] + v.b!)) : undefined;
        },
        (v) => {
          const p = pointK(v);
          return p ? `${p[1]} − ({m} × ${p[0]} + {b})` : '?';
        },
        (v) => {
          const p = pointK(v);
          return p
            ? `Point ${v.k} is (${p[0]}, ${p[1]}): its actual points minus the line’s prediction at x = ${p[0]}.`
            : 'Pick a point from 1 to 8.';
        },
        {},
        {
          check: (v) => {
            const p = pointK(v)!;
            return `${v.e} = ${p[1]} − (${v.m} × ${p[0]} + ${v.b})`;
          },
        },
      ),
    ],
    example: { m: 5, b: 47, x: 4.5, y: 69.5, k: 3, e: -1 },
    startWith: ['x', 'm', 'b', 'k'],
    use: 'Use this for “Find the residual of point 5 for the line ŷ = 5x + 47.”',
  },
);

export const HS2H_GALLERY_MODULES: ModuleDef[] = [residualK];

export const HS2H_GALLERY_LAYOUTS: LayoutDef[] = [];

/**
 * College gallery demos, round 4, group I (docs/RENDERINGS_HE.md). Each stands in for the
 * college page that waits, built from the plan's worked example. Spread into gallery.ts.
 * HC141: `curvedSolid` `ratio` (he.biology.principles-1#1).
 */
import type { Relation, Values, VariableDef } from '@/engine/types';

import type { LayoutDef } from './layouts';
import type { ModuleDef, Representation, StepText } from './types';

type Solver = (v: Values) => number | number[] | undefined;
type Rule = { relation: Relation; steps: Record<string, StepText> };

/** A value with its unit (one unit: the formula is written in it). */
const num = (
  id: string,
  symbol: string,
  name: string,
  unit: string | undefined,
  min: number,
  max: number,
  more: Partial<VariableDef> = {},
): VariableDef => ({
  id,
  symbol,
  name,
  ...(unit ? { unit, units: [unit] } : {}),
  min,
  max,
  ...more,
});

/** A value worked out, never typed. */
const out = (
  id: string,
  symbol: string,
  name: string,
  unit?: string,
  more: Partial<VariableDef> = {},
) => num(id, symbol, name, unit, -1e15, 1e15, { derived: true, ...more });

/** A finite number, or nothing. */
const fin = (x: number) => (Number.isFinite(x) ? x : undefined);

/** A relation with its steps: each variable's solver, expression and explanation. */
function rule(
  id: string,
  display: string,
  vars: string[],
  residual: (v: Values) => number,
  parts: Record<string, [Solver, StepText['expr'], StepText['how']]>,
): Rule {
  const solve: Record<string, Solver> = {};
  const steps: Record<string, StepText> = {};
  for (const [v, [fn, expr, how]] of Object.entries(parts)) {
    solve[v] = fn;
    steps[v] = { expr, how };
  }
  for (const v of vars) if (!(v in solve)) solve[v] = () => undefined;
  return { relation: { id, display, vars, residual, solve }, steps };
}

/** A demo from its rules. */
function page(
  d: Omit<ModuleDef, 'relations' | 'steps' | 'representation' | 'startWith'> & {
    rules: Rule[];
    representation: Representation;
    startWith?: string[];
  },
): ModuleDef {
  const { rules, ...rest } = d;
  return {
    ...rest,
    unitSystems: ['metric'],
    startWith: d.startWith ?? d.variables.filter((v) => !v.derived).map((v) => v.id),
    relations: rules.map((r) => r.relation),
    steps: Object.fromEntries(rules.map((r) => [r.relation.id, r.steps])),
  };
}

/** Values worked out from the typed ones of an example, in order. */
function example(typed: Values, ...work: [string, (v: Values) => number][]): Values {
  const v: Values = { ...typed };
  for (const [id, f] of work) v[id] = f(v);
  return v;
}

// ─── HC141: why cells are small (principles-1#1) ───────────────────────────────

const areaOf = (v: Values) => 4 * Math.PI * v.r! ** 2;
const volumeOf = (v: Values) => (4 / 3) * Math.PI * v.r! ** 3;
const ratioOf = (v: Values) => 3 / v.r!;

const cellRules = (): Rule[] => [
  rule('area', '{A} = 4π × {r}²', ['A', 'r'], (v) => v.A! - areaOf(v), {
    A: [areaOf, '4 × π × {r}^2', 'A sphere’s surface is 4π times the square of its radius.'],
    r: [
      (v) => fin(Math.sqrt(v.A! / (4 * Math.PI))),
      '√({A} ÷ (4 × π))',
      'Divide the area by 4π and take the square root.',
    ],
  }),
  rule('volume', '{V} = 4/3 × π × {r}³', ['V', 'r'], (v) => v.V! - volumeOf(v), {
    V: [volumeOf, '4 ÷ 3 × π × {r}^3', 'A sphere’s volume is 4/3 π times the cube of its radius.'],
  }),
  rule('ratio', '{q} = 3 ÷ {r}', ['q', 'r'], (v) => v.q! - ratioOf(v), {
    q: [ratioOf, '3 ÷ {r}', '4πr² ÷ (4/3 πr³) cancels to 3 ÷ r: the ratio falls as r grows.'],
    r: [(v) => fin(3 / v.q!), '3 ÷ {q}', 'Turn A ÷ V = 3 ÷ r round: r = 3 ÷ (A ÷ V).'],
  }),
];

const cellPage = (
  id: string,
  title: string,
  use: string,
  r: number,
  compare: number,
  max: number,
) =>
  page({
    id,
    title,
    use,
    assumptions: [
      'The cell is a sphere of radius r.',
      'Nutrients come in through the surface, but every μm³ inside uses them, so a bigger cell feeds each μm³ through less membrane.',
      `The second cell is ${compare} times as wide, drawn at the same scale.`,
    ],
    variables: [
      num('r', 'r', 'Radius', 'μm', 0.1, max, { step: 0.1 }),
      out('A', 'A', 'Surface area', 'μm²'),
      out('V', 'V', 'Volume', 'μm³'),
      out('q', 'A ÷ V', 'Surface area to volume', 'per μm'),
    ],
    rules: cellRules(),
    example: example({ r }, ['A', areaOf], ['V', volumeOf], ['q', ratioOf]),
    startWith: ['r'],
    representation: {
      kind: 'curvedSolid',
      shape: 'sphere',
      radius: 'r',
      extent: 2 * r,
      ratio: { area: 'A', volume: 'V', ratio: 'q', compare },
    },
  });

const CELL_RATIO = cellPage(
  'g.he-curvedSolid-ratio',
  'Why cells are small: surface area to volume',
  'Use this for “A cell has a radius of 5 μm. What is its surface area to volume ratio, and what happens when it doubles in width?”',
  5,
  2,
  1000,
);

/** A bacterium beside a cell ten times as wide: the edge of the range, r = 0.5 μm. */
const CELL_RATIO_SMALL = cellPage(
  'g.he-curvedSolid-ratio-bacterium',
  'A bacterium’s surface area to volume',
  'Use this for “A bacterium is a sphere 0.5 μm in radius. How does its A ÷ V compare with a cell ten times as wide?”',
  0.5,
  10,
  1000,
);

export const HE4I_GALLERY_MODULES: ModuleDef[] = [CELL_RATIO, CELL_RATIO_SMALL];

export const HE4I_GALLERY_LAYOUTS: LayoutDef[] = [];

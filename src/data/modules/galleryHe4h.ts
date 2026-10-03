/**
 * College gallery demos, round 4, group H (docs/RENDERINGS_HE.md). Each stands in for the
 * college page that waits, built from the plan's worked example. Spread into gallery.ts.
 * HC129: `catchment` (he.earth-science.hydrology#1).
 */
import type { Values, VariableDef } from '@/engine/types';

import type { LayoutDef } from './layouts';
import type { ModuleDef, Representation, StepText } from './types';

type Solver = (v: Values) => number | number[] | undefined;
type Part = [Solver, StepText['expr'], StepText['how']];
type Rule = { relation: ModuleDef['relations'][number]; steps: Record<string, StepText> };

/** A value with its unit. */
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

/** A finite number, or nothing. */
const fin = (x: number) => (Number.isFinite(x) ? x : undefined);

/**
 * A relation with its steps: the residual, and for each variable its rearrangement, the step's
 * expression and its explanation. A variable left out is found by the root finder.
 */
function rule(
  id: string,
  display: string,
  vars: string[],
  residual: (v: Values) => number,
  parts: Record<string, Part>,
): Rule {
  const solve: Record<string, Solver> = {};
  const steps: Record<string, StepText> = {};
  for (const [v, [fn, expr, how]] of Object.entries(parts)) {
    solve[v] = (x) => {
      const r = fn(x);
      return typeof r === 'number' ? fin(r) : r;
    };
    steps[v] = { expr, how };
  }
  return { relation: { id, display, vars, residual, solve }, steps };
}

/** A demo from its rules. */
function page(
  d: Omit<ModuleDef, 'relations' | 'steps' | 'representation' | 'startWith'> & {
    rules: Rule[];
    representation: Representation;
    startWith: string[];
  },
): ModuleDef {
  const { rules, ...rest } = d;
  return {
    ...rest,
    unitSystems: ['metric'],
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

// ─── HC129: the rational method (hydrology#1) ──────────────────────────────────

const RATIONAL = rule(
  'rational',
  '{Q} = {C} × {i} × {A} ÷ 3.6',
  ['Q', 'C', 'i', 'A'],
  (v) => v.Q! - (v.C! * v.i! * v.A!) / 3.6,
  {
    Q: [
      (v) => (v.C! * v.i! * v.A!) / 3.6,
      '{C} × {i} × {A} ÷ 3.6',
      'The share C of the rain that runs off, times the rain rate and the area; ÷ 3.6 turns mm/h × km² into m³/s.',
    ],
    C: [
      (v) => (3.6 * v.Q!) / (v.i! * v.A!),
      '3.6 × {Q} ÷ ({i} × {A})',
      'The runoff coefficient is the peak flow over the flow if all the rain ran off.',
    ],
    i: [
      (v) => (3.6 * v.Q!) / (v.C! * v.A!),
      '3.6 × {Q} ÷ ({C} × {A})',
      'The rain rate that makes this peak from this basin.',
    ],
    A: [
      (v) => (3.6 * v.Q!) / (v.C! * v.i!),
      '3.6 × {Q} ÷ ({C} × {i})',
      'The basin area that makes this peak at this rain rate.',
    ],
  },
);

const catchmentPage = (id: string, title: string, use: string, typed: Values) =>
  page({
    id,
    title,
    use,
    assumptions: [
      'A small basin, under about 10 km²: the rational method is for small areas.',
      'The rain lasts at least as long as water takes to cross the basin, so the whole basin sends water at once.',
      'C is the share that runs off: pavement near 0.9, lawns near 0.2, woods near 0.15.',
    ],
    variables: [
      num('C', 'C', 'Runoff coefficient', undefined, 0.05, 0.95, { step: 0.05 }),
      num('i', 'i', 'Rainfall intensity', 'mm/h', 1, 300, { step: 1 }),
      num('A', 'A', 'Basin area', 'km²', 0.01, 10, { step: 0.1 }),
      num('Q', 'Qₚ', 'Peak discharge', 'm³/s', 0, 1000, { derived: true }),
    ],
    rules: [RATIONAL],
    example: example(typed, ['Q', (v) => (v.C! * v.i! * v.A!) / 3.6]),
    startWith: ['C', 'i', 'A'],
    representation: { kind: 'catchment', coefficient: 'C', intensity: 'i', area: 'A', peak: 'Q' },
  });

const CATCHMENT = catchmentPage(
  'g.he-catchment-rational',
  'Peak runoff by the rational method',
  'Use this for “A 2 km² basin with C = 0.6 gets 50 mm/h of rain. What is the peak discharge?”',
  { C: 0.6, i: 50, A: 2 },
);

/** A paved lot: nearly all the rain runs off a tiny area. */
const CATCHMENT_PAVED = catchmentPage(
  'g.he-catchment-paved',
  'Runoff from a paved lot',
  'Use this for “A 0.05 km² parking lot (C = 0.9) gets a 120 mm/h storm. What peak must the drain carry?”',
  { C: 0.9, i: 120, A: 0.05 },
);

/** Woods at the method's upper limit of area: most rain soaks in. */
const CATCHMENT_WOODS = catchmentPage(
  'g.he-catchment-woods',
  'Runoff from a wooded basin',
  'Use this for “A 10 km² wooded basin (C = 0.15) gets 25 mm/h of rain. What is the peak flow?”',
  { C: 0.15, i: 25, A: 10 },
);

export const HE4H_GALLERY_MODULES: ModuleDef[] = [CATCHMENT, CATCHMENT_PAVED, CATCHMENT_WOODS];

export const HE4H_GALLERY_LAYOUTS: LayoutDef[] = [];

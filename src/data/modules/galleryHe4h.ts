/**
 * College gallery demos, round 4, group H (docs/RENDERINGS_HE.md). Each stands in for the
 * college page that waits, built from the plan's worked example. Spread into gallery.ts.
 * HC129: `catchment` (he.earth-science.hydrology#1).
 * HC133: `contourMap` (he.geography.physical-geography#2).
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

// ─── HC133: slope from a contour map (physical-geography#2) ────────────────────

const DEG = Math.PI / 180;

const CONTOUR_RULES = [
  rule('rise', '{rise} = {n} × {CI}', ['rise', 'n', 'CI'], (v) => v.rise! - v.n! * v.CI!, {
    rise: [(v) => v.n! * v.CI!, '{n} × {CI}', 'Each interval crossed climbs one contour interval.'],
    n: [(v) => v.rise! / v.CI!, '{rise} ÷ {CI}', 'The rise counted in contour intervals.'],
    CI: [(v) => v.rise! / v.n!, '{rise} ÷ {n}', 'The rise shared over the intervals crossed.'],
  }),
  rule(
    'ground',
    '{ground} = {map} × {denom} ÷ 100',
    ['ground', 'map', 'denom'],
    (v) => v.ground! - (v.map! * v.denom!) / 100,
    {
      ground: [
        (v) => (v.map! * v.denom!) / 100,
        '{map} × {denom} ÷ 100',
        'Each map centimetre stands for the scale’s denominator in centimetres; ÷ 100 gives metres.',
      ],
      map: [
        (v) => (100 * v.ground!) / v.denom!,
        '100 × {ground} ÷ {denom}',
        'The ground distance shrunk by the scale, in centimetres.',
      ],
      denom: [
        (v) => (100 * v.ground!) / v.map!,
        '100 × {ground} ÷ {map}',
        'How many times the ground distance is the map distance.',
      ],
    },
  ),
  rule(
    'gradient',
    '{gradient} = 100 × {rise} ÷ {ground}',
    ['gradient', 'rise', 'ground'],
    (v) => v.gradient! - (100 * v.rise!) / v.ground!,
    {
      gradient: [
        (v) => (100 * v.rise!) / v.ground!,
        '100 × {rise} ÷ {ground}',
        'Rise over run, as a percent.',
      ],
      rise: [
        (v) => (v.gradient! * v.ground!) / 100,
        '{gradient} × {ground} ÷ 100',
        'The percent of the run that the ground climbs.',
      ],
      ground: [
        (v) => (100 * v.rise!) / v.gradient!,
        '100 × {rise} ÷ {gradient}',
        'The run that climbs this rise at this gradient.',
      ],
    },
  ),
  rule(
    'angle',
    '{angle} = tan⁻¹({rise} ÷ {ground})',
    ['angle', 'rise', 'ground'],
    (v) => Math.tan(v.angle! * DEG) - v.rise! / v.ground!,
    {
      angle: [
        (v) => Math.atan(v.rise! / v.ground!) / DEG,
        'tan⁻¹({rise} ÷ {ground})',
        'The slope angle is the angle whose tangent is rise over run.',
      ],
    },
  ),
];

const contourPage = (id: string, title: string, use: string, typed: Values) =>
  page({
    id,
    title,
    use,
    assumptions: [
      'The ground slopes evenly between the two points, so one gradient fits the whole line.',
      'Contours close together mean steep ground; far apart, gentle ground.',
      'The map distance is measured along the straight line from A to B.',
    ],
    variables: [
      num('CI', 'CI', 'Contour interval', 'm', 1, 500, { step: 1 }),
      num('n', 'n', 'Intervals crossed', undefined, 0, 100, { integer: true, step: 1 }),
      num('rise', 'Δh', 'Rise', 'm', 0, 50000, { derived: true }),
      num('map', 'dₘₐₚ', 'Map distance', 'cm', 0.1, 100, { step: 0.1 }),
      num('denom', 'S', 'Scale denominator', undefined, 1000, 10000000, {
        integer: true,
        step: 1000,
      }),
      num('ground', 'd', 'Ground distance', 'm', 1, 1e7, { derived: true }),
      num('gradient', 'G', 'Gradient', '%', 0, 1000, { derived: true }),
      num('angle', 'θ', 'Slope angle', '°', 0, 89.9, { derived: true }),
    ],
    rules: CONTOUR_RULES,
    example: example(
      typed,
      ['rise', (v) => v.n! * v.CI!],
      ['ground', (v) => (v.map! * v.denom!) / 100],
      ['gradient', (v) => (100 * v.rise!) / v.ground!],
      ['angle', (v) => Math.atan(v.rise! / v.ground!) / DEG],
    ),
    startWith: ['CI', 'n', 'map', 'denom'],
    representation: {
      kind: 'contourMap',
      interval: 'CI',
      crossed: 'n',
      mapDistance: 'map',
      scale: 'denom',
      rise: 'rise',
      ground: 'ground',
      gradient: 'gradient',
      angle: 'angle',
    },
  });

const CONTOUR = contourPage(
  'g.he-contourMap-profile',
  'Slope along a line on a contour map',
  'Use this for “A to B crosses 5 intervals of 20 m and measures 5 cm on a 1:50,000 map. What is the gradient?”',
  { CI: 20, n: 5, map: 5, denom: 50000 },
);

/** A steep face: many contours crowded into a short line on a large-scale map. */
const CONTOUR_STEEP = contourPage(
  'g.he-contourMap-steep',
  'A steep slope on a large-scale map',
  'Use this for “A line 2 cm long on a 1:25,000 map crosses 25 contours 10 m apart. How steep is it?”',
  { CI: 10, n: 25, map: 2, denom: 25000 },
);

export const HE4H_GALLERY_MODULES: ModuleDef[] = [
  CATCHMENT,
  CATCHMENT_PAVED,
  CATCHMENT_WOODS,
  CONTOUR,
  CONTOUR_STEEP,
];

export const HE4H_GALLERY_LAYOUTS: LayoutDef[] = [];

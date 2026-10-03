/**
 * College gallery demos, round 4, group H (docs/RENDERINGS_HE.md). Each stands in for the
 * college page that waits, built from the plan's worked example. Spread into gallery.ts.
 * HC129: `catchment` (he.earth-science.hydrology#1).
 * HC133: `contourMap` (he.geography.physical-geography#2).
 * HC134: `rasterGrid` `extent` (he.geography.gis#0) and `window` (he.geography.gis#2).
 * HC135: `sample` `pattern` (he.geography.gis#3).
 * HC150: `sample` `herd` (he.biology.microbiology#3).
 * HC138: `spectralCurve` (he.geography.remote-sensing#1~ndvi, #3).
 * HC137: `sensorGeometry` (he.geography.remote-sensing#0).
 * HC136: `populationPyramid` (he.geography.human-geography#0~dependency).
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

// ─── HC134: raster size (gis#0) ────────────────────────────────────────────────

const RASTER_RULES = [
  rule(
    'cols',
    '{cols} = 1000 × {W} ÷ {c}',
    ['cols', 'W', 'c'],
    (v) => v.cols! - (1000 * v.W!) / v.c!,
    {
      cols: [
        (v) => (1000 * v.W!) / v.c!,
        '1000 × {W} ÷ {c}',
        'The width in metres, cut into cells c wide.',
      ],
      W: [
        (v) => (v.cols! * v.c!) / 1000,
        '{cols} × {c} ÷ 1000',
        'The columns times the cell size, in km.',
      ],
      c: [
        (v) => (1000 * v.W!) / v.cols!,
        '1000 × {W} ÷ {cols}',
        'The width in metres shared over the columns.',
      ],
    },
  ),
  rule(
    'rows',
    '{rows} = 1000 × {H} ÷ {c}',
    ['rows', 'H', 'c'],
    (v) => v.rows! - (1000 * v.H!) / v.c!,
    {
      rows: [
        (v) => (1000 * v.H!) / v.c!,
        '1000 × {H} ÷ {c}',
        'The height in metres, cut into cells c tall.',
      ],
      H: [
        (v) => (v.rows! * v.c!) / 1000,
        '{rows} × {c} ÷ 1000',
        'The rows times the cell size, in km.',
      ],
    },
  ),
  rule(
    'cells',
    '{cells} = {cols} × {rows}',
    ['cells', 'cols', 'rows'],
    (v) => v.cells! - v.cols! * v.rows!,
    {
      cells: [(v) => v.cols! * v.rows!, '{cols} × {rows}', 'A cell for every column in every row.'],
    },
  ),
  rule(
    'size',
    '{size} = {cells} × {bytes} ÷ 1000000',
    ['size', 'cells', 'bytes'],
    (v) => v.size! - (v.cells! * v.bytes!) / 1e6,
    {
      size: [
        (v) => (v.cells! * v.bytes!) / 1e6,
        '{cells} × {bytes} ÷ 1000000',
        'Each cell takes the bytes of one value; a megabyte is a million bytes.',
      ],
    },
  ),
];

const rasterPage = (id: string, title: string, use: string, typed: Values) =>
  page({
    id,
    title,
    use,
    assumptions: [
      'No compression and one band: every cell stores one value.',
      'The cell size is the same across and down (square cells).',
      'Halving the cell size makes four times the cells, and four times the file.',
    ],
    variables: [
      num('W', 'W', 'Extent width', 'km', 0.01, 20000, { step: 0.01 }),
      num('H', 'H', 'Extent height', 'km', 0.01, 20000, { step: 0.01 }),
      num('c', 'c', 'Cell size', 'm', 0.1, 100000, { step: 0.1 }),
      num('cols', 'n_c', 'Columns', undefined, 1, 1e9, { derived: true, integer: true }),
      num('rows', 'n_r', 'Rows', undefined, 1, 1e9, { derived: true, integer: true }),
      num('cells', 'N', 'Cells', undefined, 1, 1e18, { derived: true, integer: true }),
      num('bytes', 'B', 'Bytes per cell', undefined, 1, 8, { allowed: [1, 2, 4, 8] }),
      num('size', 'S', 'File size', 'MB', 0, 1e12, { derived: true }),
    ],
    rules: RASTER_RULES,
    example: example(
      typed,
      ['cols', (v) => (1000 * v.W!) / v.c!],
      ['rows', (v) => (1000 * v.H!) / v.c!],
      ['cells', (v) => v.cols! * v.rows!],
      ['size', (v) => (v.cells! * v.bytes!) / 1e6],
    ),
    startWith: ['W', 'H', 'c', 'bytes'],
    representation: {
      kind: 'rasterGrid',
      mode: 'extent',
      width: 'W',
      height: 'H',
      cell: 'c',
      bytes: 'bytes',
      columns: 'cols',
      rows: 'rows',
      cells: 'cells',
      size: 'size',
    },
  });

const RASTER = rasterPage(
  'g.he-rasterGrid-extent',
  'Rows, columns and file size of a raster',
  'Use this for “A 30 km × 30 km scene at 30 m cells, 2 bytes a cell: how many cells, and how big is the file?”',
  { W: 30, H: 30, c: 30, bytes: 2 },
);

/** The plan's second case: a third of the cell size, nine times the cells. */
const RASTER_FINE = rasterPage(
  'g.he-rasterGrid-fine',
  'A finer raster of the same scene',
  'Use this for “The same 30 km scene at 10 m cells: how many cells now, and how big is the file?”',
  { W: 30, H: 30, c: 10, bytes: 2 },
);

/** A small site at coarse cells: every cell drawn. */
const RASTER_SITE = rasterPage(
  'g.he-rasterGrid-cells',
  'A small raster cell by cell',
  'Use this for “A 0.6 km × 0.4 km site at 20 m cells, 1 byte a cell: how many rows and columns?”',
  { W: 0.6, H: 0.4, c: 20, bytes: 1 },
);

// ─── HC134: slope and aspect from a 3 × 3 window (gis#2) ───────────────────────

const RAD = Math.PI / 180;
const bearingDown = (ex: number, ny: number) => {
  if (Math.hypot(ex, ny) < 1e-12) return undefined;
  const b = Math.atan2(-ex, -ny) / RAD;
  return b < 0 ? b + 360 : b;
};

const WINDOW_RULES = [
  rule(
    'ex',
    '{ex} = ({zE} − {zW}) ÷ (2 × {c})',
    ['ex', 'zE', 'zW', 'c'],
    (v) => v.ex! - (v.zE! - v.zW!) / (2 * v.c!),
    {
      ex: [
        (v) => (v.zE! - v.zW!) / (2 * v.c!),
        '({zE} − {zW}) ÷ (2 × {c})',
        'East minus west, over the two cells between them.',
      ],
      zE: [
        (v) => v.zW! + 2 * v.c! * v.ex!,
        '{zW} + 2 × {c} × {ex}',
        'West plus the climb over two cells.',
      ],
      zW: [
        (v) => v.zE! - 2 * v.c! * v.ex!,
        '{zE} − 2 × {c} × {ex}',
        'East less the climb over two cells.',
      ],
      c: [
        (v) => (v.zE! - v.zW!) / (2 * v.ex!),
        '({zE} − {zW}) ÷ (2 × {ex})',
        'Half the run that climbs east minus west.',
      ],
    },
  ),
  rule(
    'ny',
    '{ny} = ({zN} − {zS}) ÷ (2 × {c})',
    ['ny', 'zN', 'zS', 'c'],
    (v) => v.ny! - (v.zN! - v.zS!) / (2 * v.c!),
    {
      ny: [
        (v) => (v.zN! - v.zS!) / (2 * v.c!),
        '({zN} − {zS}) ÷ (2 × {c})',
        'North minus south, over the two cells between them.',
      ],
      zN: [
        (v) => v.zS! + 2 * v.c! * v.ny!,
        '{zS} + 2 × {c} × {ny}',
        'South plus the climb over two cells.',
      ],
      zS: [
        (v) => v.zN! - 2 * v.c! * v.ny!,
        '{zN} − 2 × {c} × {ny}',
        'North less the climb over two cells.',
      ],
    },
  ),
  rule(
    'pct',
    '{pct} = 100 × √({ex}² + {ny}²)',
    ['pct', 'ex', 'ny'],
    (v) => v.pct! - 100 * Math.hypot(v.ex!, v.ny!),
    {
      pct: [
        (v) => 100 * Math.hypot(v.ex!, v.ny!),
        '100 × √({ex}² + {ny}²)',
        'The steepest climb per metre, the two gradients added as a vector, as a percent.',
      ],
    },
  ),
  rule(
    'slope',
    '{slope} = tan⁻¹(√({ex}² + {ny}²))',
    ['slope', 'ex', 'ny'],
    (v) => Math.tan(v.slope! * RAD) - Math.hypot(v.ex!, v.ny!),
    {
      slope: [
        (v) => Math.atan(Math.hypot(v.ex!, v.ny!)) / RAD,
        'tan⁻¹(√({ex}² + {ny}²))',
        'The angle whose tangent is the steepest climb per metre.',
      ],
    },
  ),
  rule(
    'aspect',
    '{aspect} = the bearing downhill for east {ex} and north {ny}',
    ['aspect', 'ex', 'ny'],
    (v) => {
      const b = bearingDown(v.ex!, v.ny!);
      return b === undefined ? NaN : ((v.aspect! - b + 540) % 360) - 180;
    },
    {
      aspect: [
        (v) => bearingDown(v.ex!, v.ny!) ?? NaN,
        'the bearing downhill for east {ex} and north {ny}',
        'The way the ground falls: against both gradients, as a bearing clockwise from north.',
      ],
    },
  ),
];

const windowPage = (id: string, title: string, use: string, typed: Values) => {
  const page_ = page({
    id,
    title,
    use,
    assumptions: [
      'The centre cell’s own height does not enter: its four neighbours set the slope.',
      'The ground is a plane across the window.',
      'Aspect is the way the slope faces (downhill), clockwise from north.',
    ],
    variables: [
      num('c', 'c', 'Cell size', 'm', 0.1, 10000, { step: 0.1 }),
      num('zE', 'z_E', 'Elevation east', 'm', -500, 9000, { step: 1 }),
      num('zW', 'z_W', 'Elevation west', 'm', -500, 9000, { step: 1 }),
      num('zN', 'z_N', 'Elevation north', 'm', -500, 9000, { step: 1 }),
      num('zS', 'z_S', 'Elevation south', 'm', -500, 9000, { step: 1 }),
      num('ex', '∂z/∂x', 'East gradient', undefined, -100, 100, { derived: true }),
      num('ny', '∂z/∂y', 'North gradient', undefined, -100, 100, { derived: true }),
      num('slope', 'θ', 'Slope', '°', 0, 90, { derived: true }),
      num('pct', 's', 'Slope (percent)', '%', 0, 1e6, { derived: true }),
      num('aspect', 'α', 'Aspect', '°', 0, 360, { derived: true }),
    ],
    rules: WINDOW_RULES,
    example: example(
      typed,
      ['ex', (v) => (v.zE! - v.zW!) / (2 * v.c!)],
      ['ny', (v) => (v.zN! - v.zS!) / (2 * v.c!)],
      ['slope', (v) => Math.atan(Math.hypot(v.ex!, v.ny!)) / RAD],
      ['pct', (v) => 100 * Math.hypot(v.ex!, v.ny!)],
      ['aspect', (v) => bearingDown(v.ex!, v.ny!)!],
    ),
    startWith: ['c', 'zE', 'zW', 'zN', 'zS'],
    representation: {
      kind: 'rasterGrid',
      mode: 'window',
      cell: 'c',
      east: 'zE',
      west: 'zW',
      north: 'zN',
      south: 'zS',
      dzdx: 'ex',
      dzdy: 'ny',
      slope: 'slope',
      percent: 'pct',
      aspect: 'aspect',
    },
  });
  return page_;
};

const WINDOW = windowPage(
  'g.he-rasterGrid-window',
  'Slope and aspect of a DEM cell',
  'Use this for “10 m cells; east 112, west 100, north 106, south 98 m. What are the slope and aspect?”',
  { c: 10, zE: 112, zW: 100, zN: 106, zS: 98 },
);

/** Gentle ground on 30 m cells falling to the east-northeast. */
const WINDOW_GENTLE = windowPage(
  'g.he-rasterGrid-window-gentle',
  'A gentle slope on a coarse DEM',
  'Use this for “30 m cells; east 250, west 254, north 249, south 251 m. Which way does the cell face?”',
  { c: 30, zE: 250, zW: 254, zN: 249, zS: 251 },
);

// ─── HC135: nearest-neighbour analysis (gis#3) ─────────────────────────────────

const NN_RULES = [
  rule(
    'exp',
    '{exp} = 0.5 ÷ √({n} ÷ {A})',
    ['exp', 'n', 'A'],
    (v) => v.exp! - 0.5 / Math.sqrt(v.n! / v.A!),
    {
      exp: [
        (v) => 0.5 / Math.sqrt(v.n! / v.A!),
        '0.5 ÷ √({n} ÷ {A})',
        'Random points at this density sit, on average, half the square root of the area per point apart.',
      ],
      A: [
        (v) => v.n! * (2 * v.exp!) ** 2,
        '{n} × (2 × {exp})²',
        'The area that spreads n points to this expected distance.',
      ],
    },
  ),
  rule('R', '{R} = {d} ÷ {exp}', ['R', 'd', 'exp'], (v) => v.R! - v.d! / v.exp!, {
    R: [(v) => v.d! / v.exp!, '{d} ÷ {exp}', 'The observed mean distance over the random one.'],
    d: [(v) => v.R! * v.exp!, '{R} × {exp}', 'The index times the random mean distance.'],
  }),
  rule(
    'SE',
    '{SE} = 0.26136 ÷ √({n}² ÷ {A})',
    ['SE', 'n', 'A'],
    (v) => v.SE! - 0.26136 / Math.sqrt(v.n! ** 2 / v.A!),
    {
      SE: [
        (v) => 0.26136 / Math.sqrt(v.n! ** 2 / v.A!),
        '0.26136 ÷ √({n}² ÷ {A})',
        'The spread of the mean distance among random patterns of n points.',
      ],
    },
  ),
  rule(
    'z',
    '{z} = ({d} − {exp}) ÷ {SE}',
    ['z', 'd', 'exp', 'SE'],
    (v) => v.z! - (v.d! - v.exp!) / v.SE!,
    {
      z: [
        (v) => (v.d! - v.exp!) / v.SE!,
        '({d} − {exp}) ÷ {SE}',
        'How many standard errors the observed distance is from random; past ±1.96 is significant at 5%.',
      ],
    },
  ),
];

const nnPage = (id: string, title: string, use: string, typed: Values) =>
  page({
    id,
    title,
    use,
    assumptions: [
      'R near 1 is random; toward 0, clustered; up to 2.15, dispersed (a perfect lattice).',
      'Edge effects are ignored: points near the border have fewer neighbours.',
      'The drawn points are one pattern with this R, seeded; the page’s points are its own.',
    ],
    variables: [
      num('n', 'n', 'Points', undefined, 2, 10000, { integer: true, step: 1 }),
      num('A', 'A', 'Study area', 'km²', 0.01, 1000000, { step: 1 }),
      num('d', 'd̄', 'Observed mean distance', 'km', 0.0001, 10000, { step: 0.01 }),
      num('exp', 'd̄ₑ', 'Expected mean distance', 'km', 0, 1e6, { derived: true }),
      num('R', 'R', 'Nearest-neighbour index', undefined, 0, 1e6, { derived: true }),
      num('SE', 'SE', 'Standard error', 'km', 0, 1e6, { derived: true }),
      num('z', 'z', 'z-score', undefined, -1e6, 1e6, { derived: true }),
    ],
    rules: NN_RULES,
    example: example(
      typed,
      ['exp', (v) => 0.5 / Math.sqrt(v.n! / v.A!)],
      ['R', (v) => v.d! / v.exp!],
      ['SE', (v) => 0.26136 / Math.sqrt(v.n! ** 2 / v.A!)],
      ['z', (v) => (v.d! - v.exp!) / v.SE!],
    ),
    startWith: ['n', 'A', 'd'],
    representation: {
      kind: 'sample',
      pattern: { n: 'n', index: 'R', area: 'A', observed: 'd', expected: 'exp', se: 'SE', z: 'z' },
    },
  });

const PATTERN = nnPage(
  'g.he-sample-pattern',
  'Nearest-neighbour index of a point pattern',
  'Use this for “50 points in 100 km² have a mean nearest-neighbour distance of 0.9 km. Clustered, random or dispersed?”',
  { n: 50, A: 100, d: 0.9 },
);

const PATTERN_CLUSTERED = nnPage(
  'g.he-sample-pattern-clustered',
  'A clustered point pattern',
  'Use this for “120 wells in 400 km² average 0.55 km to the nearest well. Are they clustered?”',
  { n: 120, A: 400, d: 0.55 },
);

/** More points than are drawn: 300 shown in the same pattern. */
const PATTERN_MANY = nnPage(
  'g.he-sample-pattern-many',
  'Nearest neighbours of a thousand points',
  'Use this for “1,000 trees in 50 km² average 0.08 km apart. What is R, and is it significant?”',
  { n: 1000, A: 50, d: 0.08 },
);

// ─── HC150: herd immunity (microbiology#3) ────────────────────────────────────

const HERD_RULES = [
  rule('pc', '{pc} = 100 × (1 − 1 ÷ {R0})', ['pc', 'R0'], (v) => v.pc! - 100 * (1 - 1 / v.R0!), {
    pc: [
      (v) => 100 * (1 - 1 / v.R0!),
      '100 × (1 − 1 ÷ {R0})',
      'With this share immune, each case meets on average one person it can infect: R₀(1 − p) = 1.',
    ],
    R0: [(v) => 1 / (1 - v.pc! / 100), '1 ÷ (1 − {pc} ÷ 100)', 'The R₀ whose threshold this is.'],
  }),
  rule('Vc', '{Vc} = 100 × {pc} ÷ {E}', ['Vc', 'pc', 'E'], (v) => v.Vc! - (100 * v.pc!) / v.E!, {
    Vc: [
      (v) => (100 * v.pc!) / v.E!,
      '100 × {pc} ÷ {E}',
      'A vaccine that protects only E% of those given it must reach more people than the threshold.',
    ],
    E: [
      (v) => (100 * v.pc!) / v.Vc!,
      '100 × {pc} ÷ {Vc}',
      'The effectiveness this coverage needs.',
    ],
  }),
];

const herdPage = (id: string, title: string, use: string, typed: Values) =>
  page({
    id,
    title,
    use,
    assumptions: [
      'People mix at random, and immunity (from vaccine or past infection) blocks infection fully.',
      'R₀ counts the people one case would infect in a population with no immunity.',
      'Coverage above 100% means vaccination alone cannot reach the threshold.',
    ],
    variables: [
      num('R0', 'R₀', 'Basic reproduction number', undefined, 1, 20, { step: 0.1 }),
      num('pc', 'p_c', 'Herd immunity threshold', '%', 0, 100, { derived: true }),
      num('E', 'E', 'Vaccine effectiveness', '%', 1, 100, { step: 1 }),
      num('Vc', 'V_c', 'Coverage needed', '%', 0, 10000, { derived: true }),
    ],
    rules: HERD_RULES,
    example: example(
      typed,
      ['pc', (v) => 100 * (1 - 1 / v.R0!)],
      ['Vc', (v) => (100 * v.pc!) / v.E!],
    ),
    startWith: ['R0', 'E'],
    representation: { kind: 'sample', herd: { r0: 'R0', immune: 'pc', threshold: 'pc' } },
  });

const HERD = herdPage(
  'g.he-sample-herd',
  'Herd immunity threshold and vaccine coverage',
  'Use this for “Measles has R₀ = 12 and the vaccine is 95% effective. What coverage stops it spreading?”',
  { R0: 12, E: 95 },
);

const HERD_LOW = herdPage(
  'g.he-sample-herd-low',
  'Herd immunity for a slow-spreading disease',
  'Use this for “A flu strain has R₀ = 1.5 and a 60% effective vaccine. What share must be vaccinated?”',
  { R0: 1.5, E: 60 },
);

const HERD_HIGH = herdPage(
  'g.he-sample-herd-high',
  'Herd immunity at R₀ = 20',
  'Use this for “R₀ = 20 and the vaccine is 97% effective. Can vaccination alone reach the threshold?”',
  { R0: 20, E: 97 },
);

// ─── HC136: dependency ratio (human-geography#0~dependency) ───────────────────

const PYRAMID_RULES = [
  rule(
    'youth',
    '{youth} = 100 × {Y} ÷ {Wk}',
    ['youth', 'Y', 'Wk'],
    (v) => v.youth! - (100 * v.Y!) / v.Wk!,
    {
      youth: [
        (v) => (100 * v.Y!) / v.Wk!,
        '100 × {Y} ÷ {Wk}',
        'Children under 15 for every 100 people aged 15 to 64.',
      ],
      Y: [
        (v) => (v.youth! * v.Wk!) / 100,
        '{youth} × {Wk} ÷ 100',
        'The youth ratio’s share of the working ages.',
      ],
    },
  ),
  rule(
    'oldr',
    '{oldr} = 100 × {O} ÷ {Wk}',
    ['oldr', 'O', 'Wk'],
    (v) => v.oldr! - (100 * v.O!) / v.Wk!,
    {
      oldr: [
        (v) => (100 * v.O!) / v.Wk!,
        '100 × {O} ÷ {Wk}',
        'People 65 and over for every 100 people aged 15 to 64.',
      ],
      O: [
        (v) => (v.oldr! * v.Wk!) / 100,
        '{oldr} × {Wk} ÷ 100',
        'The old-age ratio’s share of the working ages.',
      ],
    },
  ),
  rule(
    'ratio',
    '{ratio} = {youth} + {oldr}',
    ['ratio', 'youth', 'oldr'],
    (v) => v.ratio! - v.youth! - v.oldr!,
    {
      ratio: [
        (v) => v.youth! + v.oldr!,
        '{youth} + {oldr}',
        'All dependents, young and old, per 100 of working age.',
      ],
      youth: [(v) => v.ratio! - v.oldr!, '{ratio} − {oldr}', 'The dependents who are not old.'],
      oldr: [(v) => v.ratio! - v.youth!, '{ratio} − {youth}', 'The dependents who are not young.'],
    },
  ),
];

const pyramidPage = (
  id: string,
  title: string,
  use: string,
  typed: Values,
  shape?: 'expansive' | 'stationary' | 'constrictive',
) =>
  page({
    id,
    title,
    use,
    assumptions: [
      'Dependents are under 15 and 65 or over; 15 to 64 is the working age, whether or not people work.',
      'The ratio counts heads, not earnings: it says how many each worker supports on average.',
      'The bars inside each age group are drawn to the shape; only the three group totals are data.',
    ],
    variables: [
      num('Y', 'P₀₋₁₄', 'People aged 0–14', undefined, 0, 2e9, { step: 1000, integer: true }),
      num('Wk', 'P₁₅₋₆₄', 'People aged 15–64', undefined, 1, 5e9, { step: 1000, integer: true }),
      num('O', 'P₆₅₊', 'People aged 65 and over', undefined, 0, 2e9, { step: 1000, integer: true }),
      num('youth', 'YDR', 'Youth dependency ratio', undefined, 0, 1e6, { derived: true }),
      num('oldr', 'ODR', 'Old-age dependency ratio', undefined, 0, 1e6, { derived: true }),
      num('ratio', 'DR', 'Total dependency ratio', undefined, 0, 1e6, { derived: true }),
    ],
    rules: PYRAMID_RULES,
    example: example(
      typed,
      ['youth', (v) => (100 * v.Y!) / v.Wk!],
      ['oldr', (v) => (100 * v.O!) / v.Wk!],
      ['ratio', (v) => v.youth! + v.oldr!],
    ),
    startWith: ['Y', 'Wk', 'O'],
    representation: {
      kind: 'populationPyramid',
      young: 'Y',
      working: 'Wk',
      old: 'O',
      ...(shape ? { shape } : {}),
      youth: 'youth',
      oldAge: 'oldr',
      ratio: 'ratio',
    },
  });

const PYRAMID = pyramidPage(
  'g.he-populationPyramid-dependency',
  'Dependency ratio from age groups',
  'Use this for “A country has 2.4 million under 15, 6 million aged 15–64 and 1.2 million 65 and over. What is its dependency ratio?”',
  { Y: 2400000, Wk: 6000000, O: 1200000 },
);

const PYRAMID_AGING = pyramidPage(
  'g.he-populationPyramid-aging',
  'An aging population',
  'Use this for “1.5 million children, 7.4 million aged 15–64 and 3.6 million over 65: how heavy is the old-age burden?”',
  { Y: 1500000, Wk: 7400000, O: 3600000 },
  'constrictive',
);

const PYRAMID_YOUNG = pyramidPage(
  'g.he-populationPyramid-young',
  'A young, fast-growing population',
  'Use this for “4.5 million under 15, 5.2 million aged 15–64 and 0.3 million over 65. What is the youth dependency ratio?”',
  { Y: 4500000, Wk: 5200000, O: 300000 },
  'expansive',
);

// ─── HC137: sensor geometry (remote-sensing#0) ─────────────────────────────────

const SENSOR_RULES = [
  rule(
    'pixel',
    '{pixel} = {H} × {ifov} ÷ 1000',
    ['pixel', 'H', 'ifov'],
    (v) => v.pixel! - (v.H! * v.ifov!) / 1000,
    {
      pixel: [
        (v) => (v.H! * v.ifov!) / 1000,
        '{H} × {ifov} ÷ 1000',
        'A small angle times the distance is the length it spans: H in m (× 1,000) times IFOV in radians (× 10⁻⁶).',
      ],
      H: [
        (v) => (1000 * v.pixel!) / v.ifov!,
        '1000 × {pixel} ÷ {ifov}',
        'The height at which this IFOV spans this pixel.',
      ],
      ifov: [
        (v) => (1000 * v.pixel!) / v.H!,
        '1000 × {pixel} ÷ {H}',
        'The angle one pixel spans from this height.',
      ],
    },
  ),
  rule(
    'swath',
    '{swath} = 2 × {H} × tan({fov} ÷ 2)',
    ['swath', 'H', 'fov'],
    (v) => v.swath! - 2 * v.H! * Math.tan((v.fov! * Math.PI) / 360),
    {
      swath: [
        (v) => 2 * v.H! * Math.tan((v.fov! * Math.PI) / 360),
        '2 × {H} × tan({fov} ÷ 2)',
        'Each half of the fan reaches H tan(FOV ÷ 2) to the side of the point straight below.',
      ],
      H: [
        (v) => v.swath! / (2 * Math.tan((v.fov! * Math.PI) / 360)),
        '{swath} ÷ (2 × tan({fov} ÷ 2))',
        'The height that spreads this fan over this swath.',
      ],
    },
  ),
];

const sensorPage = (id: string, title: string, use: string, typed: Values) =>
  page({
    id,
    title,
    use,
    assumptions: [
      'The sensor looks straight down over flat ground.',
      'Pixels at the swath’s edges are larger than the one straight below.',
      'The IFOV is small, so the pixel is H × IFOV (the angle in radians).',
    ],
    variables: [
      num('H', 'H', 'Altitude', 'km', 100, 40000, { step: 1 }),
      num('ifov', 'IFOV', 'Instantaneous field of view', 'μrad', 1, 10000, { step: 0.1 }),
      num('pixel', 'p', 'Ground pixel', 'm', 0, 1e6, { derived: true }),
      num('fov', 'FOV', 'Field of view', '°', 0.1, 120, { step: 0.1 }),
      num('swath', 'S', 'Swath width', 'km', 0, 1e6, { derived: true }),
    ],
    rules: SENSOR_RULES,
    example: example(
      typed,
      ['pixel', (v) => (v.H! * v.ifov!) / 1000],
      ['swath', (v) => 2 * v.H! * Math.tan((v.fov! * Math.PI) / 360)],
    ),
    startWith: ['H', 'ifov', 'fov'],
    representation: {
      kind: 'sensorGeometry',
      altitude: 'H',
      ifov: 'ifov',
      fov: 'fov',
      pixel: 'pixel',
      swath: 'swath',
    },
  });

const SENSOR = sensorPage(
  'g.he-sensorGeometry-landsat',
  'Ground pixel and swath of a satellite sensor',
  'Use this for “A sensor at 705 km has an IFOV of 42.5 μrad and a 15° field of view. What are the pixel size and swath?”',
  { H: 705, ifov: 42.5, fov: 15 },
);

/** A wide-field sensor near the top of the FOV range: the fan is wider than it is tall. */
const SENSOR_WIDE = sensorPage(
  'g.he-sensorGeometry-wide',
  'A wide-swath sensor',
  'Use this for “A weather sensor at 820 km sees 110° across with a 1,300 μrad IFOV. How wide is its swath?”',
  { H: 820, ifov: 1300, fov: 110 },
);

// ─── HC138: NDVI and NBR (remote-sensing#1~ndvi, #3) ──────────────────────────

const nd = (a: number, b: number) => (a - b) / (a + b);

const NDVI_RULE = rule(
  'ndvi',
  '{ndvi} = ({nir} − {red}) ÷ ({nir} + {red})',
  ['ndvi', 'nir', 'red'],
  (v) => v.ndvi! - nd(v.nir!, v.red!),
  {
    ndvi: [
      (v) => nd(v.nir!, v.red!),
      '({nir} − {red}) ÷ ({nir} + {red})',
      'Leaves reflect near infrared and absorb red: the wider the gap, the greener the pixel.',
    ],
    nir: [
      (v) => (v.red! * (1 + v.ndvi!)) / (1 - v.ndvi!),
      '{red} × (1 + {ndvi}) ÷ (1 − {ndvi})',
      'The NIR reflectance that makes this NDVI with this red.',
    ],
    red: [
      (v) => (v.nir! * (1 - v.ndvi!)) / (1 + v.ndvi!),
      '{nir} × (1 − {ndvi}) ÷ (1 + {ndvi})',
      'The red reflectance that makes this NDVI with this NIR.',
    ],
  },
);

const ndviPage = (id: string, title: string, use: string, typed: Values) =>
  page({
    id,
    title,
    use,
    assumptions: [
      'Healthy leaves reflect near infrared strongly and absorb red light for photosynthesis.',
      'Water and bare soil give NDVI near or below 0.2.',
      'The reflectances are surface reflectances from 0 to 1.',
    ],
    variables: [
      num('red', 'ρ_red', 'Red reflectance', undefined, 0, 1, { step: 0.01 }),
      num('nir', 'ρ_NIR', 'Near-infrared reflectance', undefined, 0, 1, { step: 0.01 }),
      num('ndvi', 'NDVI', 'NDVI', undefined, -1, 1, { derived: true }),
    ],
    rules: [NDVI_RULE],
    example: example(typed, ['ndvi', (v) => nd(v.nir!, v.red!)]),
    startWith: ['red', 'nir'],
    representation: { kind: 'spectralCurve', red: 'red', nir: 'nir', index: 'ndvi' },
  });

const NDVI = ndviPage(
  'g.he-spectralCurve-ndvi',
  'NDVI of a pixel',
  'Use this for “A pixel reflects 0.08 in red and 0.45 in near infrared. What is its NDVI?”',
  { red: 0.08, nir: 0.45 },
);

const NDVI_SOIL = ndviPage(
  'g.he-spectralCurve-ndvi-soil',
  'NDVI of a sparsely vegetated pixel',
  'Use this for “A field reflects 0.2 in red and 0.28 in near infrared. Is it mostly bare soil?”',
  { red: 0.2, nir: 0.28 },
);

const nbrRule = (id: string, nirId: string, swirId: string, when: string) =>
  rule(
    id,
    `{${id}} = ({${nirId}} − {${swirId}}) ÷ ({${nirId}} + {${swirId}})`,
    [id, nirId, swirId],
    (v) => v[id]! - nd(v[nirId]!, v[swirId]!),
    {
      [id]: [
        (v) => nd(v[nirId]!, v[swirId]!),
        `({${nirId}} − {${swirId}}) ÷ ({${nirId}} + {${swirId}})`,
        `The normalized burn ratio ${when}: high for healthy plants, low or negative for char.`,
      ],
    },
  );

const NBR = page({
  id: 'g.he-spectralCurve-burn',
  title: 'Burn severity from NBR',
  use: 'Use this for “Before a fire a pixel had NIR 0.4 and SWIR 0.15; after, 0.2 and 0.25. What is dNBR?”',
  assumptions: [
    'Burning drops near-infrared and raises shortwave-infrared reflectance.',
    'Severity classes are thresholds on dNBR: above 0.66 high, 0.44 to 0.66 moderate-high.',
    'Both images are corrected to surface reflectance on the same dates of the year.',
  ],
  variables: [
    num('nir1', 'NIR₁', 'NIR before', undefined, 0, 1, { step: 0.01 }),
    num('swir1', 'SWIR₁', 'SWIR before', undefined, 0, 1, { step: 0.01 }),
    num('nir2', 'NIR₂', 'NIR after', undefined, 0, 1, { step: 0.01 }),
    num('swir2', 'SWIR₂', 'SWIR after', undefined, 0, 1, { step: 0.01 }),
    num('nbr1', 'NBR₁', 'NBR before', undefined, -1, 1, { derived: true }),
    num('nbr2', 'NBR₂', 'NBR after', undefined, -1, 1, { derived: true }),
    num('dnbr', 'dNBR', 'Change in NBR', undefined, -2, 2, { derived: true }),
  ],
  rules: [
    nbrRule('nbr1', 'nir1', 'swir1', 'before the fire'),
    nbrRule('nbr2', 'nir2', 'swir2', 'after the fire'),
    rule(
      'dnbr',
      '{dnbr} = {nbr1} − {nbr2}',
      ['dnbr', 'nbr1', 'nbr2'],
      (v) => v.dnbr! - v.nbr1! + v.nbr2!,
      {
        dnbr: [
          (v) => v.nbr1! - v.nbr2!,
          '{nbr1} − {nbr2}',
          'How far the burn ratio fell: the larger, the more severe.',
        ],
      },
    ),
  ],
  example: example(
    { nir1: 0.4, swir1: 0.15, nir2: 0.2, swir2: 0.25 },
    ['nbr1', (v) => nd(v.nir1!, v.swir1!)],
    ['nbr2', (v) => nd(v.nir2!, v.swir2!)],
    ['dnbr', (v) => v.nbr1! - v.nbr2!],
  ),
  startWith: ['nir1', 'swir1', 'nir2', 'swir2'],
  representation: {
    kind: 'spectralCurve',
    nir: 'nir1',
    swir: 'swir1',
    index: 'nbr1',
    after: { nir: 'nir2', swir: 'swir2', index: 'nbr2' },
    change: 'dnbr',
  },
});

export const HE4H_GALLERY_MODULES: ModuleDef[] = [
  NDVI,
  NDVI_SOIL,
  NBR,

  SENSOR,
  SENSOR_WIDE,

  PYRAMID,
  PYRAMID_AGING,
  PYRAMID_YOUNG,

  PATTERN,
  PATTERN_CLUSTERED,
  PATTERN_MANY,
  HERD,
  HERD_LOW,
  HERD_HIGH,
  RASTER,
  RASTER_FINE,
  RASTER_SITE,
  WINDOW,
  WINDOW_GENTLE,
  CATCHMENT,
  CATCHMENT_PAVED,
  CATCHMENT_WOODS,
  CONTOUR,
  CONTOUR_STEEP,
];

export const HE4H_GALLERY_LAYOUTS: LayoutDef[] = [];

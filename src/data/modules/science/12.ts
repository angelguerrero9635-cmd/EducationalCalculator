/**
 * Grade 12 science: every calculator module for the grade, the skill's main page first
 * and its problem types (`<skill id>~<slug>`) after it. Shared relation helpers live in
 * `../helpers.ts`; worked-line helpers in `../work.ts`. Rules: docs/MODULE_GUIDE.md; the
 * direction plan and build notes: docs/BUILD_HS.md.
 * The layout pages (explore, sort, sequence, observe) are in `../layouts/science12.ts`.
 */
import { formatNumber as fmt, scientific } from '@/engine/format';
import type { Relation, Values, VariableDef } from '@/engine/types';

import { div } from '../helpers';
import type { ModuleDef, StepText } from '../types';

/** A relation and its step text, built together. */
type Rel = { relation: Relation; steps: Record<string, StepText> };

/** A value with its unit and range. */
const V = (
  id: string,
  symbol: string,
  name: string,
  extra: Partial<VariableDef> = {},
): VariableDef => ({ id, symbol, name, ...extra });

/** Gathers relations into a module's `relations` and `steps`. */
const rels = (...rs: Rel[]) => ({
  relations: rs.map((r) => r.relation),
  steps: Object.fromEntries(rs.map((r) => [r.relation.id, r.steps])),
});

type Solve = (v: Values) => number | number[] | undefined;

/**
 * A relation from its id, display and residual, and per variable how to solve for it with
 * the step text: `[solve, expr, how]`.
 */
const rule = (
  id: string,
  display: string,
  residual: (v: Values) => number,
  parts: Record<string, [Solve, string, string]>,
): Rel => ({
  relation: {
    id,
    display,
    vars: [
      ...new Set([...Object.keys(parts), ...[...display.matchAll(/\{(\w+)\}/g)].map((x) => x[1]!)]),
    ],
    residual,
    solve: Object.fromEntries(Object.entries(parts).map(([k, p]) => [k, p[0]])),
  },
  steps: Object.fromEntries(Object.entries(parts).map(([k, p]) => [k, { expr: p[1], how: p[2] }])),
});

/** a = b × c, each way round. `how`: for a, for b, for c. */
const product = (a: string, b: string, c: string, id: string, how: [string, string, string]) =>
  rule(id, `{${a}} = {${b}} × {${c}}`, (v) => v[a]! - v[b]! * v[c]!, {
    [a]: [(v) => v[b]! * v[c]!, `{${b}} × {${c}}`, how[0]],
    [b]: [(v) => div(v[a]!, v[c]!), `{${a}} ÷ {${c}}`, how[1]],
    [c]: [(v) => div(v[a]!, v[b]!), `{${a}} ÷ {${b}}`, how[2]],
  });

/** a = b ÷ c, each way round. */
const quotient = (a: string, b: string, c: string, id: string, how: [string, string, string]) =>
  rule(id, `{${a}} = {${b}} ÷ {${c}}`, (v) => v[a]! * v[c]! - v[b]!, {
    [a]: [(v) => div(v[b]!, v[c]!), `{${b}} ÷ {${c}}`, how[0]],
    [b]: [(v) => v[a]! * v[c]!, `{${a}} × {${c}}`, how[1]],
    [c]: [(v) => div(v[b]!, v[a]!), `{${b}} ÷ {${a}}`, how[2]],
  });

/** a = b − c, each way round. */
const difference = (a: string, b: string, c: string, id: string, how: [string, string, string]) =>
  rule(id, `{${a}} = {${b}} − {${c}}`, (v) => v[a]! - (v[b]! - v[c]!), {
    [a]: [(v) => v[b]! - v[c]!, `{${b}} − {${c}}`, how[0]],
    [b]: [(v) => v[a]! + v[c]!, `{${a}} + {${c}}`, how[1]],
    [c]: [(v) => v[b]! - v[a]!, `{${b}} − {${a}}`, how[2]],
  });

/** a < b, checked only; `why` is the reason a conflict is refused. */
const below = (a: string, b: string, id: string, display: string, why?: string): Rel => ({
  relation: {
    id,
    constraint: true,
    display,
    vars: [a, b],
    residual: (v: Values) => (v[a]! < v[b]! ? 0 : 1),
    solve: {},
    ...(why ? { message: () => why } : {}),
  },
  steps: {},
});

// ── Minerals and rocks (the main page is an explore, in ../layouts/science12.ts) ──

const mineralDensity: ModuleDef = {
  id: 's.12.minerals-rocks~density',
  title: 'A mineral’s density by water displacement',
  use: 'Use this for “A 26.5 g mineral raises the water from 50 mL to 60 mL. What is its density, and which mineral could it be?”',
  unitSystems: ['metric'],
  assumptions: [
    '1 mL of water displaced = 1 cm³ of mineral.',
    'The sample sinks and has no air pockets.',
    'Density is a clue, not proof: compare it with hardness and streak too.',
  ],
  variables: [
    V('m', 'm', 'Mass', { unit: 'g', min: 0.1, max: 500, step: 0.1 }),
    V('a', 'V₁', 'Water before', { unit: 'mL', min: 0, max: 90, step: 0.1 }),
    V('b', 'V₂', 'Water after', { unit: 'mL', min: 1, max: 100, step: 0.1 }),
    V('V', 'V', 'Volume', { unit: 'cm³', min: 0.1, max: 100, step: 0.1 }),
    V('rho', 'ρ', 'Density', { unit: 'g/cm³', min: 1, max: 25, step: 0.01 }),
  ],
  ...rels(
    below('a', 'b', 'V₁ < V₂', 'the water before {a} is below the water after {b}'),
    difference('V', 'b', 'a', 'V = V₂ − V₁', [
      'The water rises by the mineral’s volume: 1 mL is 1 cm³.',
      'The level after is the level before plus the mineral’s volume.',
      'The level before is the level after less the mineral’s volume.',
    ]),
    quotient('rho', 'm', 'V', 'ρ = m ÷ V', [
      'Share the mass over the cubic centimeters of the mineral.',
      'Each cubic centimeter holds the density’s mass: multiply.',
      'How many of the density’s mass fit in the mass.',
    ]),
  ),
  example: { m: 26.5, a: 50, b: 60, V: 10, rho: 2.65 },
  startWith: ['m', 'a', 'b'],
  pictureLabels: ['m', 'rho'],
  representation: { kind: 'gradCylinder', before: 'a', after: 'b', volume: 'V', max: 100 },
};

// ── Earthquakes, seismic waves and Earth's interior ──

/**
 * S waves are at most 0.7 times as fast as P waves: in rock vₚ ÷ vₛ is at least √2 (the crust
 * 6 ÷ 3.5, the mantle 13.7 ÷ 7.3). It also keeps 1 ÷ vₛ − 1 ÷ vₚ away from 0.
 */
const sSlower: Rel = {
  relation: {
    id: 'vₛ ≤ 0.7 × vₚ',
    constraint: true,
    display: '{vs} is at most 0.7 × {vp}',
    vars: ['vs', 'vp'],
    residual: (v: Values) => (v.vs! <= 0.7 * v.vp! + 1e-9 ? 0 : 1),
    solve: {},
    message: () => 'In rock, S waves travel at most about 0.7 times as fast as P waves.',
  },
  steps: {},
};

/** The S − P lag at distance d: d ÷ vₛ − d ÷ vₚ. */
const lagOf = (d: number, vp: number, vs: number) => d / vs - d / vp;

const earthInterior: ModuleDef = {
  id: 's.12.earth-interior',
  unitSystems: ['metric'],
  assumptions: [
    'S waves are slower than P waves, so the lag between them grows with distance.',
    'Average speeds of 6 and 3.5 km/s are for the crust; real travel-time curves bend because deeper rock is faster.',
    'One station gives a distance, not a direction.',
  ],
  variables: [
    V('d', 'd', 'Distance to the focus', { unit: 'km', min: 0.2, max: 12700, step: 1 }),
    V('vp', 'vₚ', 'P-wave speed', { unit: 'km/s', units: ['km/s'], min: 4, max: 14, step: 0.1 }),
    V('vs', 'vₛ', 'S-wave speed', { unit: 'km/s', units: ['km/s'], min: 2, max: 8, step: 0.1 }),
    V('tp', 'tₚ', 'P arrival', { unit: 's', min: 0.01, max: 3200, step: 0.1, derived: true }),
    V('ts', 'tₛ', 'S arrival', { unit: 's', min: 0.01, max: 6400, step: 0.1, derived: true }),
    V('L', 'L', 'S − P lag', { unit: 's', min: 0.1, max: 1500, step: 0.1 }),
  ],
  ...rels(
    sSlower,
    quotient('tp', 'd', 'vp', 'tₚ = d ÷ vₚ', [
      'Travel time is the distance over the P wave’s speed.',
      'Distance is the speed times the travel time.',
      'Speed is the distance over the travel time.',
    ]),
    quotient('ts', 'd', 'vs', 'tₛ = d ÷ vₛ', [
      'Travel time is the distance over the S wave’s speed.',
      'Distance is the speed times the travel time.',
      'Speed is the distance over the travel time.',
    ]),
    rule(
      'L = d ÷ vₛ − d ÷ vₚ',
      '{L} = {d} ÷ {vs} − {d} ÷ {vp}',
      (v) => v.L! - lagOf(v.d!, v.vp!, v.vs!),
      {
        L: [
          (v) => lagOf(v.d!, v.vp!, v.vs!),
          '{d} ÷ {vs} − {d} ÷ {vp}',
          'The lag is the S travel time minus the P travel time.',
        ],
        d: [
          (v) => div(v.L!, 1 / v.vs! - 1 / v.vp!),
          '{L} ÷ (1 ÷ {vs} − 1 ÷ {vp})',
          'Each km adds 1 ÷ vₛ − 1 ÷ vₚ seconds of lag: divide the lag by that.',
        ],
        vs: [
          (v) => div(1, v.L! / v.d! + 1 / v.vp!),
          '1 ÷ ({L} ÷ {d} + 1 ÷ {vp})',
          'Each km takes the S wave the P wave’s time plus the lag per km.',
        ],
        vp: [
          (v) => div(1, 1 / v.vs! - v.L! / v.d!),
          '1 ÷ (1 ÷ {vs} − {L} ÷ {d})',
          'Each km takes the P wave the S wave’s time less the lag per km.',
        ],
      },
    ),
  ),
  example: { d: 840, vp: 6, vs: 3.5, tp: 140, ts: 240, L: 100 },
  startWith: ['L', 'vp', 'vs'],
  representation: {
    kind: 'earthLayers',
    mode: 'seismogram',
    km: 'd',
    vp: 'vp',
    vs: 'vs',
    lag: 'L',
  },
};

/** Kilometres of distance for each second of S − P lag: 1 ÷ (1/3.5 − 1/6). */
const KM_PER_LAG = 8.4;

/** d = k × L for one station. */
const stationRel = (d: string, L: string, n: string) =>
  product(d, 'k', L, `d${n} = k × L${n}`, [
    'Each second of lag puts the station k km farther from the quake.',
    'The km per second of lag: the distance over the lag.',
    'How many seconds of lag cover the distance.',
  ]);

/** k = 1 ÷ (1/vₛ − 1/vₚ): the km each second of S − P lag stands for. */
const lagRate = rule(
  'k = 1 ÷ (1/vₛ − 1/vₚ)',
  '{k} = 1 ÷ (1 ÷ {vs} − 1 ÷ {vp})',
  (v) => v.k! * (1 / v.vs! - 1 / v.vp!) - 1,
  {
    k: [
      (v) => div(1, 1 / v.vs! - 1 / v.vp!),
      '1 ÷ (1 ÷ {vs} − 1 ÷ {vp})',
      'Each km adds 1 ÷ vₛ − 1 ÷ vₚ seconds of lag; flip it to get km per second of lag.',
    ],
    vs: [
      (v) => div(1, 1 / v.k! + 1 / v.vp!),
      '1 ÷ (1 ÷ {k} + 1 ÷ {vp})',
      'Each km takes the S wave the P wave’s time plus the lag per km.',
    ],
    vp: [
      (v) => div(1, 1 / v.vs! - 1 / v.k!),
      '1 ÷ (1 ÷ {vs} − 1 ÷ {k})',
      'Each km takes the P wave the S wave’s time less the lag per km.',
    ],
  },
);

const epicenter: ModuleDef = {
  id: 's.12.earth-interior~epicenter',
  title: 'Locating an epicenter from three stations',
  use: 'Use this for “Why are three seismic stations needed to find an epicenter?” and for the distances from each lag.',
  unitSystems: ['metric'],
  assumptions: [
    'Each distance is a circle round its station.',
    'Two circles meet at two points; the third picks one.',
    'The stations must not lie in one line.',
    'With the crust’s speeds of 6 and 3.5 km/s, each second of lag is 8.4 km.',
  ],
  variables: [
    V('t1', 'L₁', 'Lag at station 1', { unit: 's', min: 0.1, max: 120, step: 0.1 }),
    V('t2', 'L₂', 'Lag at station 2', { unit: 's', min: 0.1, max: 120, step: 0.1 }),
    V('t3', 'L₃', 'Lag at station 3', { unit: 's', min: 0.1, max: 120, step: 0.1 }),
    V('vp', 'vₚ', 'P-wave speed', { unit: 'km/s', units: ['km/s'], min: 4, max: 14, step: 0.1 }),
    V('vs', 'vₛ', 'S-wave speed', { unit: 'km/s', units: ['km/s'], min: 2, max: 8, step: 0.1 }),
    V('k', 'k', 'Km of distance per second of lag', {
      unit: 'km/s',
      units: ['km/s'],
      min: 2,
      max: 35,
      step: 0.1,
      derived: true,
    }),
    V('d1', 'd₁', 'Distance from station 1', { unit: 'km', min: 0.1, max: 4000, step: 1 }),
    V('d2', 'd₂', 'Distance from station 2', { unit: 'km', min: 0.1, max: 4000, step: 1 }),
    V('d3', 'd₃', 'Distance from station 3', { unit: 'km', min: 0.1, max: 4000, step: 1 }),
  ],
  ...rels(
    sSlower,
    lagRate,
    stationRel('d1', 't1', '₁'),
    stationRel('d2', 't2', '₂'),
    stationRel('d3', 't3', '₃'),
  ),
  example: { t1: 25, t2: 10, t3: 25, vp: 6, vs: 3.5, k: KM_PER_LAG, d1: 210, d2: 84, d3: 210 },
  startWith: ['t1', 't2', 't3', 'vp', 'vs'],
  representation: {
    kind: 'earthLayers',
    mode: 'epicenter',
    stations: [
      { name: '1', x: 0, y: 0, r: 'd1' },
      { name: '2', x: 168, y: 210, r: 'd2' },
      { name: '3', x: 336, y: 0, r: 'd3' },
    ],
  },
};

/** Kilometres along Earth's surface per degree from the epicenter: 2 × π × 6,371 ÷ 360. */
const KM_PER_DEG = (2 * Math.PI * 6371) / 360;

const shadowZone: ModuleDef = {
  id: 's.12.earth-interior~shadow-zone',
  title: 'The shadow zones: which waves reach a station',
  use: 'Use this for “Why do no S waves arrive more than 104° from an earthquake?”',
  unitSystems: ['metric'],
  assumptions: [
    'P waves arrive directly out to 104°, then not again until 140°.',
    'S waves stop at 104° because they cannot cross the liquid outer core.',
    'The outer core starts 2,890 km down.',
  ],
  variables: [
    V('D', 'Δ', 'Angle from the epicenter', { unit: '°', min: 1, max: 180, step: 1 }),
    V('s', 's', 'Distance along the surface', {
      unit: 'km',
      min: 100,
      max: 20100,
      step: 1,
      sigFigs: 4,
    }),
  ],
  ...rels(
    rule(
      's = Δ ÷ 360 × 2 × π × 6,371',
      '{s} = {D} ÷ 360 × 2 × π × 6,371',
      (v) => v.s! - v.D! * KM_PER_DEG,
      {
        s: [
          (v) => v.D! * KM_PER_DEG,
          '{D} ÷ 360 × 2 × π × 6,371',
          'The angle’s share of 360°, times Earth’s circumference, 2 × π × 6,371 km.',
        ],
        D: [
          (v) => v.s! / KM_PER_DEG,
          '{s} ÷ (2 × π × 6,371) × 360',
          'The distance’s share of the circumference, times 360°.',
        ],
      },
    ),
  ),
  example: { D: 120, s: 120 * KM_PER_DEG },
  startWith: ['D'],
  representation: { kind: 'earthLayers', mode: 'section', distance: 'D' },
};

/** A magnitude, 0–10. */
const mag = (id: string, symbol: string, name: string) =>
  V(id, symbol, name, { min: 0, max: 10, step: 0.1 });

const magnitude: ModuleDef = {
  id: 's.12.earth-interior~magnitude',
  title: 'Comparing earthquakes by magnitude',
  use: 'Use this for “A magnitude 6 quake and a magnitude 4 quake: how much more shaking, and how much more energy?”',
  unitSystems: ['metric'],
  assumptions: [
    'Magnitude is read from the largest swing of a seismogram, corrected for the station’s distance.',
    'Each step of 1 in magnitude is 10 times the ground motion and about 32 times the energy.',
    'Both quakes are measured on the same magnitude scale.',
  ],
  variables: [
    mag('M1', 'M₁', 'Magnitude of the first quake'),
    mag('M2', 'M₂', 'Magnitude of the second quake'),
    V('d', 'ΔM', 'Difference in magnitude', { min: -10, max: 10, step: 0.1, derived: true }),
    V('A', 'A', 'Shaking, second quake ÷ first', {
      min: 1e-10,
      max: 1e10,
      step: 0.01,
      derived: true,
    }),
    V('E', 'E', 'Energy, second quake ÷ first', {
      min: 1e-15,
      max: 1e15,
      step: 0.01,
      derived: true,
    }),
  ],
  ...rels(
    difference('d', 'M2', 'M1', 'ΔM = M₂ − M₁', [
      'How many steps of magnitude apart the two quakes are.',
      'The second quake is ΔM steps above the first.',
      'The first quake is ΔM steps below the second.',
    ]),
    rule('A = 10^ΔM', '{A} = 10^{d}', (v) => Math.log10(v.A!) - v.d!, {
      A: [(v) => 10 ** v.d!, '10^{d}', 'Each step of magnitude is 10 times the ground motion.'],
      d: [
        (v) => (v.A! > 0 ? Math.log10(v.A!) : undefined),
        'log_10({A})',
        'How many factors of 10 make the amplitude ratio.',
      ],
    }),
    rule('E = 10^(1.5 ΔM)', '{E} = 10^(1.5 × {d})', (v) => Math.log10(v.E!) - 1.5 * v.d!, {
      E: [
        (v) => 10 ** (1.5 * v.d!),
        '10^(1.5 × {d})',
        'Each step of magnitude is about 32 times the energy: 10^1.5.',
      ],
      d: [
        (v) => (v.E! > 0 ? Math.log10(v.E!) / 1.5 : undefined),
        'log_10({E}) ÷ 1.5',
        'The energy ratio’s factors of 10, over 1.5 per step.',
      ],
    }),
  ),
  example: { M1: 4, M2: 6, d: 2, A: 100, E: 1000 },
  startWith: ['M1', 'M2'],
  representation: {
    kind: 'earthLayers',
    mode: 'magnitude',
    m1: 'M1',
    m2: 'M2',
    amplitude: 'A',
    energy: 'E',
  },
};

const spreading: ModuleDef = {
  id: 's.12.earth-interior~spreading-rate',
  title: 'Seafloor spreading from magnetic stripes',
  use: 'Use this for “Rock 100 km from the ridge is 4 million years old. How fast is the seafloor spreading?”',
  unitSystems: ['metric'],
  assumptions: [
    'New seafloor forms at the ridge and moves away on both sides at the same rate.',
    'Cooling rock records the direction of Earth’s magnetic field, which has flipped many times, so the seafloor is striped the same on both sides.',
    'A kilometer per million years is a millimeter per year.',
  ],
  variables: [
    V('x', 'x', 'Distance from the ridge', { unit: 'km', min: 1, max: 5000, step: 1 }),
    V('t', 't', 'Age of the rock', { unit: 'million years', min: 0.01, max: 200, step: 0.01 }),
    V('v', 'v', 'Spreading rate, one side', {
      unit: 'mm/yr',
      min: 0.005,
      max: 500000,
      step: 0.001,
      derived: true,
    }),
    V('w', 'w', 'Full spreading rate', {
      unit: 'mm/yr',
      min: 0.01,
      max: 1000000,
      step: 0.1,
      derived: true,
    }),
  ],
  ...rels(
    quotient('v', 'x', 't', 'v = x ÷ t', [
      'The rock moved x kilometers in t million years; a kilometer per million years is a millimeter per year.',
      'Distance is the rate times the time.',
      'Time is the distance over the rate.',
    ]),
    rule('w = 2v', '{w} = 2 × {v}', (v) => v.w! - 2 * v.v!, {
      w: [(v) => 2 * v.v!, '2 × {v}', 'The plates move apart on both sides, each at v.'],
      v: [(v) => v.w! / 2, '{w} ÷ 2', 'Each side moves at half the full rate.'],
    }),
  ),
  example: { x: 100, t: 4, v: 25, w: 50 },
  startWith: ['x', 't'],
  representation: {
    kind: 'oceanProfile',
    mode: 'stripes',
    distance: 'x',
    age: 't',
    rate: 'v',
    full: 'w',
  },
};

// ── Earth's history: the early Earth, its atmosphere and the history of life ──

/** Rounded ages (million years ago) of the events round the one-day clock. */
const EARTH_EVENTS: [number, string][] = [
  [4600, 'Earth forms'],
  [3500, 'First life'],
  [2300, 'Oxygen in the air'],
  [540, 'Animals with shells'],
  [66, 'Dinosaurs die out'],
  [0.3, 'Our species'],
];

/** Hours after midnight (0–24) as a clock reads them: "11:39 p.m.", "12:00 noon". */
const clockText = (t: number) => {
  const all = Math.round(t * 60) % 1440;
  const [h, m] = [Math.floor(all / 60), all % 60];
  const mm = String(m).padStart(2, '0');
  if (all === 0) return '12:00 midnight';
  if (all === 720) return '12:00 noon';
  return `${h % 12 === 0 ? 12 : h % 12}:${mm} ${h < 12 ? 'a.m.' : 'p.m.'}`;
};

const earthDay: ModuleDef = {
  id: 's.12.earth-history',
  unitSystems: ['metric'],
  assumptions: [
    'Earth formed about 4,600 million years ago: midnight at the start of the day.',
    'Today is the next midnight, so each hour stands for about 192 million years.',
    'Event ages are rounded; new finds move them.',
  ],
  variables: [
    V('A', 'A', 'How long ago', { unit: 'million years', min: 0, max: 4600, step: 0.1 }),
    V('p', 'p', 'Share of Earth’s history since then', {
      unit: '%',
      min: 0,
      max: 100,
      step: 0.0001,
      derived: true,
    }),
    V('m', 'm', 'Minutes before midnight', { unit: 'minutes', min: 0, max: 1440, step: 0.01 }),
    V('t', 't', 'Clock time', { unit: 'hours', min: 0, max: 24, step: 0.0001 }),
  ],
  ...rels(
    rule('p = A ÷ 4,600 × 100', '{p} = {A} ÷ 4,600 × 100', (v) => v.p! - (v.A! / 4600) * 100, {
      p: [
        (v) => (v.A! / 4600) * 100,
        '{A} ÷ 4,600 × 100',
        'The event’s age as a share of Earth’s whole 4,600 million years.',
      ],
      A: [
        (v) => (v.p! / 100) * 4600,
        '{p} ÷ 100 × 4,600',
        'Take that share of Earth’s 4,600 million years.',
      ],
    }),
    rule('m = p ÷ 100 × 1,440', '{m} = {p} ÷ 100 × 1,440', (v) => v.m! - (v.p! / 100) * 1440, {
      m: [
        (v) => (v.p! / 100) * 1440,
        '{p} ÷ 100 × 1,440',
        'The same share of the day’s 1,440 minutes comes before midnight.',
      ],
      p: [
        (v) => (v.m! / 1440) * 100,
        '{m} ÷ 1,440 × 100',
        'The minutes left as a share of the day’s 1,440 minutes.',
      ],
    }),
    ((r: Rel): Rel => ({
      ...r,
      steps: {
        ...r.steps,
        t: {
          ...r.steps.t!,
          // Under a minute the clock reads midnight; the seconds keep the point of the lesson.
          note: (v) => {
            if (!(v.m! > 0 && v.m! < 1)) return `(${clockText(v.t!)})`;
            const s = Math.max(1, Math.round(v.m! * 60));
            return `(about ${s} second${s === 1 ? '' : 's'} before midnight)`;
          },
        },
      },
    }))(
      rule('t = 24 − m ÷ 60', '{t} = 24 − {m} ÷ 60', (v) => v.t! - (24 - v.m! / 60), {
        t: [
          (v) => 24 - v.m! / 60,
          '24 − {m} ÷ 60',
          'Turn the minutes into hours and count back from midnight, hour 24.',
        ],
        m: [
          (v) => (24 - v.t!) * 60,
          '(24 − {t}) × 60',
          'The hours left until midnight, in minutes.',
        ],
      }),
    ),
  ),
  example: { A: 2300, p: 50, m: 720, t: 12 },
  startWith: ['A'],
  representation: {
    kind: 'geologicClock',
    ago: 'A',
    time: 't',
    minutes: 'm',
    share: 'p',
    events: EARTH_EVENTS.map(([age, name]) => ({ age, name })),
  },
};

/** Hours in a year: 365.25 days of 24 hours. The year's length has not changed. */
const YEAR_H = 8766;

const coralDays: ModuleDef = {
  id: 's.12.earth-history~day-length',
  title: 'Day length from fossil coral',
  use: 'Use this for “A fossil coral shows 1,200 daily growth lines across 3 yearly bands. How long was a day then?”',
  unitSystems: ['metric'],
  assumptions: [
    'A coral adds one thin growth line a day and one band a year.',
    'The year’s length in hours has not changed; the Moon’s tides slow Earth’s spin.',
    'So long ago a year had more days, and each day was shorter.',
  ],
  variables: [
    V('n', 'n', 'Daily growth lines counted', { min: 360, max: 4500, step: 1 }),
    V('b', 'b', 'Yearly bands they cross', { min: 1, max: 10, step: 1 }),
    V('N', 'N', 'Days in a year', { unit: 'days', min: 360, max: 450, step: 0.01 }),
    V('D', 'D', 'Length of a day', { unit: 'hours', min: 19, max: 24.5, step: 0.001 }),
  ],
  ...rels(
    // Says why when the count gives a year outside N's range, instead of a silent clear.
    ((r: Rel): Rel => ({
      ...r,
      relation: {
        ...r.relation,
        message: (v: Values) =>
          v.n !== undefined && v.b! > 0 && (v.n / v.b! < 360 - 1e-9 || v.n / v.b! > 450 + 1e-9)
            ? 'That many lines across those bands gives a year shorter than 360 or longer than 450 days.'
            : undefined,
      },
    }))(
      quotient('N', 'n', 'b', 'N = n ÷ b', [
        'Share the daily lines among the yearly bands: the days in one year.',
        'Each band holds a year of N lines: multiply.',
        'How many years of N lines fit in the count.',
      ]),
    ),
    rule('D = 8,766 ÷ N', '{D} = 8,766 ÷ {N}', (v) => v.D! * v.N! - YEAR_H, {
      D: [
        (v) => div(YEAR_H, v.N!),
        '8,766 ÷ {N}',
        'A year is 8,766 hours; share them among its days.',
      ],
      N: [(v) => div(YEAR_H, v.D!), '8,766 ÷ {D}', 'How many days of D hours fit in 8,766 hours.'],
    }),
  ),
  example: { n: 1200, b: 3, N: 400, D: YEAR_H / 400 },
  startWith: ['n', 'b'],
  representation: { kind: 'coralSection', lines: 'n', bands: 'b', days: 'N', day: 'D' },
};

// ── Weathering, erosion and deposition (the main page is an explore) ──

/** A stream's size or flow, 0.01–100,000 in its unit. */
/** A stream measurement: from a trickle to the Amazon (about 2 × 10⁵ m³/s). */
const flow = (
  id: string,
  symbol: string,
  name: string,
  unit: string,
  min: number,
  max: number,
  derived = false,
) => V(id, symbol, name, { unit, min, max, step: min < 0.01 ? min : 0.01, derived });

const discharge: ModuleDef = {
  id: 's.12.surface-processes~discharge',
  title: 'A stream’s discharge',
  use: 'Use this for “A stream is 12 m wide and 1.5 m deep and flows at 0.8 m/s. What is its discharge?”',
  unitSystems: ['metric'],
  assumptions: [
    'Discharge is the volume of water that flows past a point each second.',
    'The channel is taken as a rectangle, and the speed is the average across it.',
    'A stream carries more sediment, and erodes faster, when its discharge rises in a flood.',
  ],
  variables: [
    flow('w', 'w', 'Width of the water', 'm', 0.1, 50000),
    flow('d', 'd', 'Depth of the water', 'm', 0.01, 100),
    flow('v', 'v', 'Flow speed', 'm/s', 0.01, 10),
    flow('A', 'A', 'Cross-section area', 'm²', 0.001, 5000000, true),
    flow('Q', 'Q', 'Discharge', 'm³/s', 0.00001, 1000000, true),
  ],
  ...rels(
    product('A', 'w', 'd', 'A = w × d', [
      'The cross-section is a rectangle, width by depth.',
      'Width: the area over the depth.',
      'Depth: the area over the width.',
    ]),
    product('Q', 'A', 'v', 'Q = A × v', [
      'Each second a slab of water v meters long and A square meters across passes.',
      'The area: the discharge over the speed.',
      'The speed: the discharge over the area.',
    ]),
  ),
  example: { w: 12, d: 1.5, v: 0.8, A: 18, Q: 14.4 },
  startWith: ['w', 'd', 'v'],
  representation: {
    kind: 'streamChannel',
    width: 'w',
    depth: 'd',
    speed: 'v',
    area: 'A',
    discharge: 'Q',
  },
};

// ── Geologic time and radiometric dating ──

/** n = t ÷ T: the half-lives in an age. */
const halves = quotient('n', 't', 'T', 'n = t ÷ T', [
  'Count how many half-lives fit in the age.',
  'Each half-life takes T: multiply.',
  'Share the age among the half-lives.',
]);

/** p = 100 × 0.5ⁿ: the percent of the parent left after n half-lives. */
const leftAfter = (p: string, parent: string) =>
  rule(
    `${p === 'P' ? 'P' : 'p'} = 100 × 0.5^n`,
    `{${p}} = 100 × 0.5^({n})`,
    (v) => v[p]! - 100 * 0.5 ** v.n!,
    {
      [p]: [
        (v) => 100 * 0.5 ** v.n!,
        '100 × 0.5^({n})',
        `Each half-life halves the ${parent} left: halve 100% n times.`,
      ],
      n: [
        (v) => (v[p]! > 0 ? Math.log(100 / v[p]!) / Math.log(2) : undefined),
        `ln(100/{${p}})/ln(2)`,
        `Count the halvings: n is the power of 2 that equals 100 ÷ ${p === 'P' ? 'P' : 'p'}.`,
      ],
    },
  );

const carbonDating: ModuleDef = {
  id: 's.12.radiometric-dating',
  assumptions: [
    'Living things keep the same C-14 level as the air; decay starts when they die.',
    'After about 50,000 years too little is left to measure.',
    'Only for once-living material: wood, bone, shell or cloth.',
  ],
  variables: [
    V('T', 'T', 'Half-life of C-14', { unit: 'years', min: 5000, max: 6000, step: 1 }),
    V('t', 't', 'Age', { unit: 'years', min: 0, max: 60000, step: 1 }),
    V('n', 'n', 'Half-lives passed', { min: 0, max: 12, step: 0.0001, derived: true }),
    V('p', 'p', 'C-14 left', { unit: '%', min: 0.1, max: 100, step: 0.001 }),
    V('q', 'q', 'C-14 decayed', { unit: '%', min: 0, max: 99.99, step: 0.01, derived: true }),
  ],
  ...rels(
    halves,
    leftAfter('p', 'C-14'),
    rule('q = 100 − p', '{q} = 100 − {p}', (v) => v.q! - (100 - v.p!), {
      q: [(v) => 100 - v.p!, '100 − {p}', 'What is not left has decayed to N-14.'],
      p: [(v) => 100 - v.q!, '100 − {q}', 'What has not decayed is still C-14.'],
    }),
  ),
  example: { T: 5730, t: 17190, n: 3, p: 12.5, q: 87.5 },
  startWith: ['p', 'T'],
  representation: {
    kind: 'decayChart',
    halfLife: 'T',
    time: 't',
    start: 100,
    left: 'p',
    halves: 'n',
    parent: 'C-14',
    daughter: 'N-14',
    keep: ['T'],
  },
};

/** t = n × T for a fixed half-life, written as the lesson writes it. */
const fixedAge = (T: number, text: string) =>
  rule(`t = n × ${text}`, `{t} = {n} × ${text}`, (v) => (v.t! - v.n! * T) / T, {
    n: [(v) => v.t! / T, `{t} ÷ (${text})`, 'Half-lives passed: the age over the half-life.'],
    t: [(v) => v.n! * T, `{n} × ${text}`, 'The age is the half-lives passed times the half-life.'],
  });

const U238 = 4.47e9;

const uranium: ModuleDef = {
  id: 's.12.radiometric-dating~uranium',
  title: 'Dating the oldest rocks with uranium-238',
  use: 'Use this for “A meteorite has as much lead-206 as uranium-238. How old is it?”',
  assumptions: [
    'U-238 decays to lead-206 with a half-life of 4.47 × 10⁹ years.',
    'The rock started with no lead-206 and lost none.',
    'Most surface rocks were melted or weathered since Earth formed. Meteorites were not, so they date the solar system.',
    'Nothing in the solar system is older than about 4.57 × 10⁹ years, so R is at most about 1.',
  ],
  variables: [
    V('R', 'R', 'Lead-206 atoms per U-238 atom', { min: 0.0016, max: 1.04, step: 0.0001 }),
    V('p', 'p', 'U-238 left', { unit: '%', min: 48.5, max: 99.9, step: 0.01, derived: true }),
    V('n', 'n', 'Half-lives passed', { min: 0.002, max: 1.04, step: 0.0001, derived: true }),
    V('t', 't', 'Age', { unit: 'years', min: 1e7, max: 4.6e9, step: 1000 }),
  ],
  ...rels(
    rule('p = 100 ÷ (1 + R)', '{p} = 100 ÷ (1 + {R})', (v) => v.p! * (1 + v.R!) - 100, {
      p: [
        (v) => 100 / (1 + v.R!),
        '100 ÷ (1 + {R})',
        'Each lead atom was once a uranium atom: the uranium’s share of 1 + R atoms.',
      ],
      R: [
        (v) => div(100, v.p!)! - 1,
        '100 ÷ {p} − 1',
        'The atoms at the start per atom left, less the one left.',
      ],
    }),
    leftAfter('p', 'U-238'),
    fixedAge(U238, '4.47 × 10⁹'),
  ),
  example: { R: 1, p: 50, n: 1, t: U238 },
  startWith: ['R'],
  drives: { t: 'R' },
  representation: {
    kind: 'decayChart',
    halfLife: U238,
    time: 't',
    start: 100,
    left: 'p',
    halves: 'n',
    parent: 'U-238',
    daughter: 'Pb-206',
  },
};

const U235_MA = 704;
const myr = (id: string, symbol: string, name: string, extra: Partial<VariableDef> = {}) =>
  V(id, symbol, name, { unit: 'million years', min: 0, max: 704, step: 0.1, ...extra });

const bracket: ModuleDef = {
  id: 's.12.radiometric-dating~bracket',
  title: 'Bracketing a fossil layer between ash beds',
  use: 'Use this for “Which ash beds date a fossil layer, and how old can the fossils be?”',
  assumptions: [
    'Ash layers can be dated; sandstone and shale cannot.',
    'A layer between two dated ash beds is younger than the one below and older than the one above.',
    'The same index fossil marks rock of the same age anywhere.',
    'Uranium-235 decays to lead-207 with a half-life of 704 million years.',
  ],
  variables: [
    V('P', 'P', 'U-235 left in the lower ash', { unit: '%', min: 50, max: 99, step: 0.01 }),
    V('n', 'n', 'Half-lives passed', { min: 0, max: 1, step: 0.0001, derived: true }),
    myr('t', 't', 'Age of the lower ash'),
    myr('u', 'u', 'Age of the upper ash', { max: 700 }),
    myr('w', 'w', 'Width of the age bracket', { derived: true }),
  ],
  ...rels(
    leftAfter('P', 'U-235'),
    fixedAge(U235_MA, '704'),
    below(
      'u',
      't',
      'u < t',
      'the upper ash {u} is younger than the lower ash {t}',
      'The upper ash lies on top, so it must be younger than the lower ash.',
    ),
    difference('w', 't', 'u', 'w = t − u', [
      'The shale lies between the ash beds, so it is from u to t million years old; the bracket is their difference.',
      'The lower ash is the bracket’s width older than the upper ash.',
      'The upper ash is the bracket’s width younger than the lower ash.',
    ]),
  ),
  example: { P: 100 * 0.5 ** 0.1, n: 0.1, t: 70.4, u: 66, w: 4.4 },
  startWith: ['P', 'u'],
  representation: {
    kind: 'rockLayers',
    dating: {
      layers: [
        { rock: 'sandstone', fossil: 'ammonite' },
        { rock: 'ash', age: 'u' },
        { rock: 'shale', fossil: 'ammonite' },
        { rock: 'ash', age: 't' },
        { rock: 'limestone' },
      ],
      bracket: 2,
      sample: {
        parent: 'P',
        layer: 3,
        parentName: 'uranium-235',
        daughterName: 'lead-207',
        halfLives: 'n',
      },
    },
  },
};

/** Years in the universe's age: no date can be older. */
const UNIVERSE = 1.38e10;

const halfLife: ModuleDef = {
  id: 's.12.radiometric-dating~half-life',
  title: 'Any isotope: age from the daughter-to-parent ratio',
  use: 'Use this for “A rock holds 3 daughter atoms for every parent atom, and the half-life is 1.25 × 10⁹ years. How old is it?”',
  assumptions: [
    'Each daughter atom was once a parent atom, and the rock started with no daughter atoms.',
    'No atoms got in or out since the rock formed.',
    'The universe is about 1.38 × 10¹⁰ years old, so no age can be greater.',
  ],
  variables: [
    V('T', 'T', 'Half-life', { unit: 'years', min: 1, max: 1e11, step: 1 }),
    V('R', 'R', 'Daughter atoms per parent atom', { min: 0, max: 1000, step: 0.001 }),
    V('p', 'p', 'Parent left', { unit: '%', min: 0.0999, max: 100, step: 0.01, derived: true }),
    V('n', 'n', 'Half-lives passed', { min: 0, max: 10, step: 0.0001, derived: true }),
    V('t', 't', 'Age', { unit: 'years', min: 0, max: 1e12, step: 1 }),
  ],
  ...rels(
    rule('p = 100 ÷ (1 + R)', '{p} = 100 ÷ (1 + {R})', (v) => v.p! * (1 + v.R!) - 100, {
      p: [
        (v) => 100 / (1 + v.R!),
        '100 ÷ (1 + {R})',
        'Each daughter atom was once a parent atom: the parent’s share of 1 + R atoms.',
      ],
      R: [
        (v) => div(100, v.p!)! - 1,
        '100 ÷ {p} − 1',
        'The atoms at the start per atom left, less the one left.',
      ],
    }),
    leftAfter('p', 'parent'),
    halves,
    {
      relation: {
        id: 't ≤ 1.38 × 10¹⁰',
        constraint: true,
        display: '{t} is at most 1.38 × 10¹⁰ years',
        vars: ['t'],
        residual: (v: Values) => (v.t! <= UNIVERSE * (1 + 1e-9) ? 0 : 1),
        solve: {},
        message: () => 'No rock is older than the universe, about 1.38 × 10¹⁰ years.',
      },
      steps: {},
    },
  ),
  example: { T: 1.25e9, R: 3, p: 25, n: 2, t: 2.5e9 },
  startWith: ['R', 'T'],
  representation: {
    kind: 'decayChart',
    halfLife: 'T',
    time: 't',
    start: 100,
    left: 'p',
    halves: 'n',
    parent: 'Parent',
    daughter: 'Daughter',
    keep: ['T'],
  },
};

/** Potassium-40's half-life (million years) and the share of its decays that make argon-40. */
const K40_MA = 1250;
const ARGON_SHARE = 0.107;

const potassium: ModuleDef = {
  id: 's.12.radiometric-dating~potassium',
  title: 'Dating volcanic ash with potassium-argon',
  use: 'Use this for “Volcanic ash holds 0.01 argon-40 atom for every potassium-40 atom. How old is the ash?”',
  assumptions: [
    'Potassium-40 has a half-life of 1,250 million years: 10.7% of its decays make argon-40 and 89.3% make calcium-40.',
    'Argon is a gas that escapes molten rock but is trapped once the ash cools, so the clock starts at the eruption.',
    'Only the argon is counted: rock is already full of calcium-40, so the new calcium cannot be told apart.',
    'Nothing on Earth is older than about 4,570 million years, so R is at most about 1.24.',
  ],
  variables: [
    V('R', 'R', 'Argon-40 atoms per potassium-40 atom', { min: 0.0001, max: 1.24, step: 0.0001 }),
    V('P', 'P', 'Potassium-40 left', {
      unit: '%',
      min: 7.9,
      max: 99.999,
      step: 0.001,
      derived: true,
    }),
    V('n', 'n', 'Half-lives passed', { min: 0, max: 3.66, step: 0.0001, derived: true }),
    V('t', 't', 'Age of the ash', { unit: 'million years', min: 0, max: 4570, step: 0.1 }),
  ],
  ...rels(
    rule(
      'P = 100 ÷ (1 + R ÷ 0.107)',
      '{P} = 100 ÷ (1 + {R} ÷ 0.107)',
      (v) => v.P! * (1 + v.R! / ARGON_SHARE) - 100,
      {
        P: [
          (v) => 100 / (1 + v.R! / ARGON_SHARE),
          '100 ÷ (1 + {R} ÷ 0.107)',
          'Each argon atom stands for 1 ÷ 0.107 decayed potassium atoms, so R ÷ 0.107 atoms decayed for each one left.',
        ],
        R: [
          (v) => (v.P! > 0 ? ARGON_SHARE * (100 / v.P! - 1) : undefined),
          '0.107 × (100 ÷ {P} − 1)',
          'The atoms decayed for each one left, of which 10.7% became argon.',
        ],
      },
    ),
    leftAfter('P', 'potassium-40'),
    fixedAge(K40_MA, '1250'),
  ),
  example: (() => {
    const R = 0.01;
    const P = 100 / (1 + R / ARGON_SHARE);
    const n = Math.log2(100 / P);
    return { R, P, n, t: n * K40_MA };
  })(),
  startWith: ['R'],
  representation: {
    kind: 'rockLayers',
    dating: {
      layers: [
        { rock: 'sandstone', fossil: 'fern' },
        { rock: 'shale' },
        { rock: 'ash', age: 't' },
        { rock: 'limestone', fossil: 'trilobite' },
      ],
      sample: {
        parent: 'P',
        layer: 2,
        parentName: 'potassium-40',
        daughterName: 'argon-40',
        halfLives: 'n',
        second: { name: 'calcium-40', share: 89.3 },
      },
    },
  },
};

const crossAge = (id: string, symbol: string, name: string, extra: Partial<VariableDef> = {}) =>
  V(id, symbol, name, { unit: 'million years', min: 0, max: 4600, step: 0.1, ...extra });

const crossCutting: ModuleDef = {
  id: 's.12.radiometric-dating~cross-cutting',
  title: 'A dike cutting the layers: cross-cutting',
  use: 'Use this for “A 105-million-year-old dike cuts the sandstone but not the shale above it. How old can the shale’s fossils be?”',
  assumptions: [
    'Cross-cutting: a dike is younger than every layer it cuts, and older than the layers it does not reach.',
    'Superposition: a layer is younger than the layers under it and older than those on top.',
    'The dike and the ash beds cooled from magma, so they can be dated; the shale cannot, so its age is bracketed.',
  ],
  variables: [
    crossAge('a', 'a', 'Age of the upper ash bed'),
    crossAge('i', 'i', 'Age of the dike'),
    crossAge('b', 'b', 'Age of the lower ash bed'),
    crossAge('w', 'w', 'Width of the shale’s bracket', { derived: true }),
    crossAge('d', 'd', 'Narrowed by the dike', { derived: true }),
  ],
  ...rels(
    below(
      'a',
      'i',
      'a < i',
      'the upper ash {a} is younger than the dike {i}',
      'The dike stops below the upper ash bed, so the ash bed formed after it: a must be less than i.',
    ),
    below(
      'i',
      'b',
      'i < b',
      'the dike {i} is younger than the lower ash bed {b}',
      'The dike cuts the lower ash bed, so it is younger: i must be less than b.',
    ),
    below(
      'a',
      'b',
      'a < b',
      'the upper ash {a} is younger than the lower ash {b}',
      'The upper ash bed lies on top, so it must be younger than the lower one.',
    ),
    difference('w', 'i', 'a', 'w = i − a', [
      'The shale lies above the dike’s top, so it is younger than the dike and older than the upper ash: from a to i.',
      'The dike is the bracket’s width older than the upper ash bed.',
      'The upper ash bed is the bracket’s width younger than the dike.',
    ]),
    difference('d', 'b', 'i', 'd = b − i', [
      'Without the dike the shale could be as old as the lower ash bed; the dike takes b − i off the bracket.',
      'The lower ash bed is d older than the dike.',
      'The dike is d younger than the lower ash bed.',
    ]),
  ),
  example: { a: 92, i: 105, b: 120, w: 13, d: 15 },
  startWith: ['a', 'i', 'b'],
  representation: {
    kind: 'rockLayers',
    dating: {
      layers: [
        { rock: 'limestone' },
        { rock: 'ash', age: 'a' },
        { rock: 'shale', fossil: 'ammonite' },
        { rock: 'sandstone' },
        { rock: 'ash', age: 'b' },
        { rock: 'siltstone' },
      ],
      intrusion: { through: 3, age: 'i' },
      bracket: 2,
    },
  },
};

// ── The ocean: seafloor, currents and ocean–atmosphere interaction ──

const sonar: ModuleDef = {
  id: 's.12.ocean-atmosphere',
  unitSystems: ['metric'],
  assumptions: [
    'The ping goes down and back, so halve the path.',
    'Sound travels about 1,500 m/s in seawater.',
    'The shelf is under 200 m deep and trenches reach almost 11,000 m.',
  ],
  variables: [
    V('t', 't', 'Echo time, down and back', { unit: 's', min: 0.01, max: 14, step: 0.01 }),
    V('v', 'v', 'Speed of sound in seawater', { unit: 'm/s', min: 1450, max: 1550, step: 1 }),
    V('d', 'd', 'Depth', { unit: 'm', min: 1, max: 11000, step: 1 }),
  ],
  ...rels(
    rule('d = v × t ÷ 2', '{d} = {v} × {t} ÷ 2', (v) => v.d! - (v.v! * v.t!) / 2, {
      d: [
        (v) => (v.v! * v.t!) / 2,
        '{v} × {t} ÷ 2',
        'Speed times time is the path down and back; the depth is half of it.',
      ],
      t: [
        (v) => div(2 * v.d!, v.v!),
        '2 × {d} ÷ {v}',
        'The sound goes down and back: twice the depth, over its speed.',
      ],
      v: [(v) => div(2 * v.d!, v.t!), '2 × {d} ÷ {t}', 'Twice the depth, over the echo’s time.'],
    }),
  ),
  example: { t: 6, v: 1500, d: 4500 },
  startWith: ['t', 'v'],
  representation: { kind: 'oceanProfile', mode: 'profile', depth: 'd', over: 'plain' },
};

/** The tidal range over the Moon's alone, with the Sun's bulges 0.46 as high at angle θ. */
const tideRoot = (deg: number) =>
  Math.sqrt(1 + 0.46 ** 2 + 2 * 0.46 * Math.cos((2 * deg * Math.PI) / 180));

const tides: ModuleDef = {
  id: 's.12.ocean-atmosphere~tides',
  title: 'Spring and neap tides',
  use: 'Use this for “Is the tide a spring or a neap tide at the first-quarter Moon, and how big is the range?”',
  unitSystems: ['metric'],
  assumptions: [
    'The Sun’s tidal pull is 0.46 of the Moon’s.',
    'In line (new or full Moon): spring tides; at right angles (quarter Moon): neap tides.',
    'Coastlines make real ranges differ.',
  ],
  variables: [
    V('A', 'θ', 'Moon’s angle from the Sun', { unit: '°', min: 0, max: 180, step: 1 }),
    V('m', 'm', 'Range from the Moon alone', { unit: 'm', min: 0.1, max: 10, step: 0.01 }),
    V('R', 'R', 'Tidal range', { unit: 'm', min: 0.01, max: 20, step: 0.01, derived: true }),
  ],
  ...rels(
    rule(
      'R = m × √(1 + 0.46² + 2 × 0.46 × cos 2θ)',
      '{R} = {m} × √(1 + 0.46² + 2 × 0.46 × cos(2 × {A}))',
      (v) => v.R! - v.m! * tideRoot(v.A!),
      {
        R: [
          (v) => v.m! * tideRoot(v.A!),
          '{m} × √(1 + 0.46² + 2 × 0.46 × cos(2 × {A}))',
          'Add the Moon’s and the Sun’s bulges at the angle between them.',
        ],
        m: [
          (v) => div(v.R!, tideRoot(v.A!)),
          '{R} ÷ √(1 + 0.46² + 2 × 0.46 × cos(2 × {A}))',
          'Undo the Sun’s share: divide the range by the same factor.',
        ],
        A: [
          (v) => {
            const k = ((v.R! / v.m!) ** 2 - 1 - 0.46 ** 2) / (2 * 0.46);
            if (!(k >= -1 - 1e-9 && k <= 1 + 1e-9)) return undefined;
            const a = (Math.acos(Math.max(-1, Math.min(1, k))) * 180) / Math.PI / 2;
            return [a, 180 - a];
          },
          'cos⁻¹((({R} ÷ {m})² − 1 − 0.46²) ÷ (2 × 0.46)) ÷ 2',
          'Solve the range rule for cos 2θ, then take the inverse cosine and halve it.',
        ],
      },
    ),
  ),
  example: { A: 90, m: 2, R: 2 * tideRoot(90) },
  startWith: ['A', 'm'],
  representation: { kind: 'oceanProfile', mode: 'tides', angle: 'A', range: 'R' },
};

// ── The atmosphere: structure, air pressure, wind and severe weather ──

const lapse: ModuleDef = {
  id: 's.12.atmosphere-weather',
  unitSystems: ['metric'],
  assumptions: [
    'Air is 78 % nitrogen and 21 % oxygen.',
    'The troposphere cools about 6.5 °C per km up to about 11 km.',
    'Above that, ozone in the stratosphere absorbs the Sun’s UV and warms the air.',
  ],
  variables: [
    V('T0', 'T₀', 'Temperature at the ground', { unit: '°C', min: -40, max: 50, step: 0.1 }),
    V('h', 'h', 'Altitude', { unit: 'km', min: 0, max: 11, step: 0.1 }),
    V('T', 'T', 'Temperature at h', { unit: '°C', min: -112, max: 50, step: 0.1 }),
  ],
  ...rels(
    rule('T = T₀ − 6.5 × h', '{T} = {T0} − 6.5 × {h}', (v) => v.T! - (v.T0! - 6.5 * v.h!), {
      T: [(v) => v.T0! - 6.5 * v.h!, '{T0} − 6.5 × {h}', 'Take off 6.5 °C for each km of height.'],
      T0: [(v) => v.T! + 6.5 * v.h!, '{T} + 6.5 × {h}', 'Add back the 6.5 °C lost for each km.'],
      h: [
        (v) => (v.T0! - v.T!) / 6.5,
        '({T0} − {T}) ÷ 6.5',
        'How many 6.5 °C drops make the difference.',
      ],
    }),
  ),
  example: { T0: 20, h: 8, T: -32 },
  startWith: ['T0', 'h'],
  representation: {
    kind: 'atmosphereLayers',
    mode: 'profile',
    altitude: 'h',
    temperature: 'T',
    ground: 'T0',
  },
};

const pressureMap: ModuleDef = {
  id: 's.12.atmosphere-weather~pressure',
  title: 'Highs, lows and the pressure gradient',
  use: 'Use this for “Where on the map is the wind strongest, and which way does it blow round the low?”',
  unitSystems: ['metric'],
  assumptions: [
    'Wind blows from high to low, faster where isobars are closer.',
    'The Coriolis effect turns it right in the Northern Hemisphere, so it circles a low counterclockwise.',
    'Friction near the ground turns it partway back toward the low.',
  ],
  variables: [
    V('H', 'H', 'Pressure at the high', { unit: 'hPa', min: 1000, max: 1050, step: 1 }),
    V('Lw', 'L', 'Pressure at the low', { unit: 'hPa', min: 900, max: 1020, step: 1 }),
    V('dP', 'ΔP', 'Pressure difference', {
      unit: 'hPa',
      min: 0.1,
      max: 150,
      step: 1,
      derived: true,
    }),
    V('D', 'D', 'Distance between the centers', { unit: 'km', min: 100, max: 3000, step: 10 }),
    V('G', 'G', 'Pressure gradient', {
      unit: 'hPa per 100 km',
      min: 0.001,
      max: 150,
      step: 0.01,
      derived: true,
    }),
  ],
  ...rels(
    below('Lw', 'H', 'L < H', 'the low {Lw} is below the high {H}'),
    difference('dP', 'H', 'Lw', 'ΔP = H − L', [
      'How much higher the pressure is at the high.',
      'The high is the difference above the low.',
      'The low is the difference below the high.',
    ]),
    rule('G = ΔP ÷ D × 100', '{G} = {dP} ÷ {D} × 100', (v) => v.G! * v.D! - v.dP! * 100, {
      G: [
        (v) => div(v.dP! * 100, v.D!),
        '{dP} ÷ {D} × 100',
        'The pressure change per km, times 100 km.',
      ],
      dP: [
        (v) => (v.G! * v.D!) / 100,
        '{G} × {D} ÷ 100',
        'The change per 100 km, times the hundreds of km.',
      ],
      D: [
        (v) => div(v.dP! * 100, v.G!),
        '{dP} ÷ {G} × 100',
        'How many 100 km steps the difference takes.',
      ],
    }),
  ),
  example: { H: 1024, Lw: 996, dP: 28, D: 700, G: 4 },
  startWith: ['H', 'Lw', 'D'],
  representation: {
    kind: 'atmosphereLayers',
    mode: 'pressure',
    high: 'H',
    low: 'Lw',
    distance: 'D',
  },
};

const humidity: ModuleDef = {
  id: 's.12.atmosphere-weather~humidity',
  title: 'Relative humidity',
  use: 'Use this for “Air holds 6 g of water vapor per kg and could hold 15 g. What is its relative humidity?”',
  unitSystems: ['metric'],
  assumptions: [
    'Warm air can hold more water vapor than cold air.',
    'Cooling the air raises RH without adding water.',
    'At 100 % the air is at its dew point.',
  ],
  variables: [
    V('w', 'w', 'Water vapor', { unit: 'g/kg', min: 0, max: 40, step: 0.1 }),
    V('ws', 'wₛ', 'Capacity at this temperature', { unit: 'g/kg', min: 0.1, max: 40, step: 0.1 }),
    V('RH', 'RH', 'Relative humidity', { unit: '%', min: 0, max: 100, step: 0.1 }),
  ],
  ...rels(
    rule('RH = w ÷ wₛ × 100', '{RH} = {w} ÷ {ws} × 100', (v) => v.RH! * v.ws! - v.w! * 100, {
      RH: [
        (v) => div(v.w! * 100, v.ws!),
        '{w} ÷ {ws} × 100',
        'The vapor the air holds as a percent of what it could hold.',
      ],
      w: [(v) => (v.RH! * v.ws!) / 100, '{RH} ÷ 100 × {ws}', 'That percent of the capacity.'],
      ws: [
        (v) => div(v.w! * 100, v.RH!),
        '{w} ÷ {RH} × 100',
        'The vapor is RH percent of the capacity: divide back.',
      ],
    }),
  ),
  example: { w: 6, ws: 15, RH: 40 },
  startWith: ['w', 'ws'],
  representation: { kind: 'percentBar', percent: 'RH', part: 'w', whole: 'ws', ticks: 10 },
};

const cloudBase: ModuleDef = {
  id: 's.12.atmosphere-weather~cloud-base',
  title: 'The height of a cloud’s base',
  use: 'Use this for “The air is 24 °C with a dew point of 12 °C. How high is the cloud base?”',
  unitSystems: ['metric'],
  assumptions: [
    'Rising air expands and cools about 10 °C per km until it is saturated.',
    'Its dew point falls only about 2 °C per km, so the two close 8 °C per km.',
    'Where they meet, water vapor condenses: the flat base of a cumulus cloud.',
  ],
  variables: [
    V('T', 'T', 'Temperature at the ground', { unit: '°C', min: -40, max: 50, step: 0.1 }),
    V('Td', 'T_d', 'Dew point at the ground', { unit: '°C', min: -60, max: 50, step: 0.1 }),
    V('h', 'h', 'Height of the cloud base', {
      unit: 'km',
      min: 0,
      max: 15,
      step: 0.001,
      derived: true,
    }),
  ],
  ...rels(
    {
      relation: {
        id: 'T_d ≤ T',
        constraint: true,
        display: 'the dew point {Td} is at most the temperature {T}',
        vars: ['Td', 'T'],
        residual: (v: Values) => (v.Td! <= v.T! ? 0 : 1),
        solve: {},
        message: () => 'The dew point can’t be above the air’s temperature.',
      },
      steps: {},
    },
    rule('h = (T − T_d) ÷ 8', '{h} = ({T} − {Td}) ÷ 8', (v) => 8 * v.h! - (v.T! - v.Td!), {
      h: [
        (v) => (v.T! - v.Td!) / 8,
        '({T} − {Td}) ÷ 8',
        'The gap closes 10 − 2 = 8 °C for each km the parcel rises.',
      ],
      T: [(v) => v.Td! + 8 * v.h!, '{Td} + 8 × {h}', 'The dew point plus 8 °C for each km.'],
      Td: [(v) => v.T! - 8 * v.h!, '{T} − 8 × {h}', 'The temperature less 8 °C for each km.'],
    }),
  ),
  example: { T: 24, Td: 12, h: 1.5 },
  startWith: ['T', 'Td'],
  representation: {
    kind: 'atmosphereLayers',
    mode: 'parcel',
    temperature: 'T',
    dewPoint: 'Td',
    base: 'h',
  },
};

// ── Climate systems, feedbacks and climate change (the main page is an explore) ──

/** The Stefan–Boltzmann constant, W/m² per K⁴. */
const SIGMA = 5.67e-8;

const energyBalance: ModuleDef = {
  id: 's.12.climate-systems~energy-balance',
  title: 'Earth’s energy balance',
  use: 'Use this for “If Earth reflects 30% of sunlight and has no greenhouse gases, how warm is it?”',
  unitSystems: ['metric'],
  assumptions: [
    'Sunlight falls on Earth’s disk but spreads over the whole globe, 4 times the disk’s area, so each square meter gets S ÷ 4 on average.',
    'The albedo α is the share reflected by clouds, ice and land; the rest is absorbed.',
    'In balance the ground sends out as infrared what it absorbs: σTₑ⁴ = F, with σ = 5.67 × 10⁻⁸ W/m² per K⁴.',
  ],
  variables: [
    V('S', 'S', 'Sunlight at the top of the atmosphere', {
      unit: 'W/m²',
      min: 1,
      max: 3000,
      step: 1,
    }),
    V('a', 'α', 'Albedo', { min: 0, max: 0.99, step: 0.01 }),
    V('F', 'F', 'Sunlight absorbed', {
      unit: 'W/m²',
      min: 0,
      max: 750,
      step: 0.1,
      derived: true,
    }),
    V('T', 'Tₑ', 'Balance temperature', { unit: 'K', min: 0, max: 400, step: 0.1, derived: true }),
  ],
  ...rels(
    rule('F = S(1 − α) ÷ 4', '{F} = {S} × (1 − {a}) ÷ 4', (v) => 4 * v.F! - v.S! * (1 - v.a!), {
      F: [
        (v) => (v.S! * (1 - v.a!)) / 4,
        '{S} × (1 − {a}) ÷ 4',
        'The share not reflected, spread over 4 times the disk’s area.',
      ],
      S: [
        (v) => div(4 * v.F!, 1 - v.a!),
        '4 × {F} ÷ (1 − {a})',
        'The sunlight that leaves F absorbed after reflection.',
      ],
      a: [
        (v) => (v.S! > 0 ? 1 - (4 * v.F!) / v.S! : undefined),
        '1 − 4 × {F} ÷ {S}',
        'The share of the sunlight not absorbed.',
      ],
    }),
    ((r: Rel): Rel => ({
      ...r,
      steps: {
        ...r.steps,
        T: { ...r.steps.T!, work: (v) => [`Tₑ = ∜(${scientific(v.F! / SIGMA, 3)})`] },
      },
    }))(
      rule(
        'Tₑ = ∜(F ÷ σ)',
        '{T} = ∜({F} ÷ (5.67 × 10⁻⁸))',
        (v) => v.T! - (Math.max(0, v.F!) / SIGMA) ** 0.25,
        {
          T: [
            (v) => (v.F! >= 0 ? (v.F! / SIGMA) ** 0.25 : undefined),
            '∜({F} ÷ (5.67 × 10⁻⁸))',
            'The temperature whose infrared, σTₑ⁴, carries away F.',
          ],
          F: [(v) => SIGMA * v.T! ** 4, '5.67 × 10⁻⁸ × {T}^4', 'A surface at Tₑ sends out σTₑ⁴.'],
        },
      ),
    ),
  ),
  example: {
    S: 1361,
    a: 0.3,
    F: (1361 * 0.7) / 4,
    T: ((1361 * 0.7) / 4 / SIGMA) ** 0.25,
  },
  startWith: ['S', 'a'],
  representation: {
    kind: 'atmosphereLayers',
    mode: 'balance',
    sunlight: 'S',
    albedo: 'a',
    absorbed: 'F',
    temperature: 'T',
  },
};

// ── Human impacts and resource management (the main page is a sort) ──

const pct = (id: string, symbol: string, name: string, derived = false) =>
  V(id, symbol, name, { unit: '%', min: 0, max: 100, step: 1, integer: true, derived });

/** t = the parts added, each way round. */
const sumRel = (t: string, parts: string[], id: string, what: string): Rel => {
  const rest = (p: string) => parts.filter((x) => x !== p);
  return rule(
    id,
    `{${t}} = ${parts.map((p) => `{${p}}`).join(' + ')}`,
    (v) => v[t]! - parts.reduce((s, p) => s + v[p]!, 0),
    Object.fromEntries([
      [
        t,
        [
          (v: Values) => parts.reduce((s, p) => s + v[p]!, 0),
          parts.map((p) => `{${p}}`).join(' + '),
          `Add up the ${what} shares.`,
        ],
      ],
      ...parts.map((p) => [
        p,
        [
          (v: Values) => v[t]! - rest(p).reduce((s, q) => s + v[q]!, 0),
          `{${t}} − ${rest(p)
            .map((q) => `{${q}}`)
            .join(' − ')}`,
          `Take the other ${what} shares from the total.`,
        ],
      ]),
    ]),
  );
};

const energyMix: ModuleDef = {
  id: 's.12.resource-management~energy-mix',
  title: 'Where electricity comes from',
  use: 'Use this for “What share of US electricity comes from fossil fuels, and what share is renewable?”',
  assumptions: [
    'Shares of US electricity in about 2023, rounded.',
    'Oil makes almost no electricity; it fuels transport.',
    'Biomass and geothermal are in other.',
  ],
  variables: [
    pct('g', 'g', 'Natural gas'),
    pct('n', 'n', 'Nuclear'),
    pct('k', 'k', 'Coal'),
    pct('w', 'w', 'Wind'),
    pct('h', 'h', 'Hydroelectric'),
    pct('s', 's', 'Solar'),
    pct('o', 'o', 'Other sources', true),
    pct('F', 'F', 'Fossil fuels', true),
    pct('R', 'R', 'Renewable: wind, water and sun', true),
  ],
  ...rels(
    sumRel('F', ['g', 'k'], 'F = g + k', 'fossil'),
    sumRel('R', ['w', 'h', 's'], 'R = w + h + s', 'renewable'),
    rule(
      'o = 100 − F − n − R',
      '{o} = 100 − {F} − {n} − {R}',
      (v) => v.o! - (100 - v.F! - v.n! - v.R!),
      {
        o: [
          (v) => 100 - v.F! - v.n! - v.R!,
          '100 − {F} − {n} − {R}',
          'Whatever is not fossil, nuclear or wind, water and sun is other.',
        ],
        F: [
          (v) => 100 - v.o! - v.n! - v.R!,
          '100 − {o} − {n} − {R}',
          'Take the other sources from 100 %.',
        ],
        n: [
          (v) => 100 - v.o! - v.F! - v.R!,
          '100 − {o} − {F} − {R}',
          'Take the other sources from 100 %.',
        ],
        R: [
          (v) => 100 - v.o! - v.F! - v.n!,
          '100 − {o} − {F} − {n}',
          'Take the other sources from 100 %.',
        ],
      },
    ),
  ),
  example: { g: 43, n: 19, k: 16, w: 10, h: 6, s: 4, o: 2, F: 59, R: 20 },
  startWith: ['g', 'n', 'k', 'w', 'h', 's'],
  pictureLabels: ['F', 'R'],
  representation: {
    kind: 'bars',
    bars: [
      { var: 'g', icon: 'gas stove flame' },
      { var: 'n', icon: 'nuclear power plant' },
      { var: 'k', icon: 'lumps of coal' },
      { var: 'w', icon: 'wind turbine' },
      { var: 'h', icon: 'dam' },
      { var: 's', icon: 'solar panel' },
      { var: 'o' },
    ],
    min: 0,
    max: 50,
    scale: 10,
  },
};

const reserves: ModuleDef = {
  id: 's.12.resource-management~reserves',
  title: 'How long a reserve lasts',
  use: 'Use this for “400 billion barrels of oil are used at 12.5 billion a year. How many years will they last?”',
  unitSystems: ['metric'],
  assumptions: [
    'The yearly use stays the same, and no new reserves are found.',
    'Reserves are the amount that can be recovered at today’s prices with today’s technology.',
    'Nonrenewable resources form over millions of years, far slower than they are used.',
  ],
  variables: [
    V('Q', 'Q', 'Reserve', { unit: 'billion barrels', min: 0.01, max: 100000, step: 0.01 }),
    V('r', 'r', 'Use each year', {
      unit: 'billion barrels a year',
      min: 0.01,
      max: 1000,
      step: 0.01,
    }),
    V('y', 'y', 'Years it lasts', {
      unit: 'years',
      min: 0,
      max: 10000000,
      step: 0.01,
      derived: true,
    }),
  ],
  ...rels(
    quotient('y', 'Q', 'r', 'y = Q ÷ r', [
      'How many years of use the reserve holds.',
      'The reserve: the use each year times the years.',
      'The use each year: the reserve over the years.',
    ]),
  ),
  example: { Q: 400, r: 12.5, y: 32 },
  startWith: ['Q', 'r'],
  representation: { kind: 'reserve', reserve: 'Q', rate: 'r', years: 'y' },
};

/** T = ln(1 + kQ ÷ r) ÷ k, with its stages written out: ln of one number, then ÷ k. */
const lastsFor = rule(
  'T = ln(1 + kQ ÷ r) ÷ k',
  '{T} = ln(1 + {k} × {Q} ÷ {r}) ÷ {k}',
  (v) => v.T! - Math.log(1 + (v.k! * v.Q!) / v.r!) / v.k!,
  {
    T: [
      (v) => (v.k! > 0 && v.r! > 0 ? Math.log(1 + (v.k! * v.Q!) / v.r!) / v.k! : undefined),
      'ln(1 + {k} × {Q} ÷ {r}) ÷ {k}',
      'The growing use adds up to Q when eᵏᵀ = 1 + kQ ÷ r; take ln of both sides and divide by k.',
    ],
  },
);
const sig = (x: number) => fmt(Number(x.toPrecision(6)));
const expirationTime: Rel = {
  ...lastsFor,
  steps: {
    T: {
      ...lastsFor.steps.T!,
      work: (v) => {
        if (v.k === undefined || v.Q === undefined || v.r === undefined || !(v.r > 0)) return [];
        const part = (v.k * v.Q) / v.r;
        const inside = 1 + part;
        return [
          // A tiny kQ ÷ r keeps its figures: ln(1 + 1.3333 × 10⁻⁵), never ln(1) (which is 0).
          part < 0.001
            ? `T = ln(1 + ${sig(part)}) ÷ ${fmt(v.k)}`
            : `T = ln(${sig(inside)}) ÷ ${fmt(v.k)}`,
          `T = ${sig(Math.log(inside))} ÷ ${fmt(v.k)}`,
        ];
      },
    },
  },
};

const growingUse: ModuleDef = {
  id: 's.12.resource-management~growing-use',
  title: 'How long a reserve lasts when use grows',
  use: 'Use this for “600 billion barrels are used at 15 billion a year, and use grows 2% a year. How many years will they last?”',
  unitSystems: ['metric'],
  assumptions: [
    'Use grows steadily (continuously) by g% a year: after t years it is r × eᵏᵗ, with k = g ÷ 100.',
    'The yearly use adds up to Q = r × (eᵏᵀ − 1) ÷ k after T years; solving for T gives the formula.',
    'No new reserves are found; y = Q ÷ r is how long it would last if use stayed at r.',
  ],
  variables: [
    V('Q', 'Q', 'Reserve', { unit: 'billion barrels', min: 0.01, max: 100000, step: 0.01 }),
    V('r', 'r', 'Use this year', {
      unit: 'billion barrels a year',
      min: 0.01,
      max: 1000,
      step: 0.01,
    }),
    V('g', 'g', 'Growth in use each year', { unit: '%', min: 0.1, max: 20, step: 0.1 }),
    V('k', 'k', 'Growth rate as a decimal', {
      min: 0.001,
      max: 0.2,
      step: 0.0001,
      derived: true,
    }),
    V('T', 'T', 'Years it lasts as use grows', {
      unit: 'years',
      min: 0,
      max: 10000000,
      step: 0.01,
      derived: true,
    }),
    V('y', 'y', 'Years it lasts at this year’s use', {
      unit: 'years',
      min: 0,
      max: 10000000,
      step: 0.01,
      derived: true,
    }),
  ],
  ...rels(
    rule('k = g ÷ 100', '{k} = {g} ÷ 100', (v) => v.k! - v.g! / 100, {
      k: [(v) => v.g! / 100, '{g} ÷ 100', 'A percent is a number of hundredths.'],
    }),
    expirationTime,
    quotient('y', 'Q', 'r', 'y = Q ÷ r', [
      'For comparison: how many years the reserve lasts if use stays at r.',
      'The reserve: the use each year times the years.',
      'The use each year: the reserve over the years.',
    ]),
  ),
  example: { Q: 600, r: 15, g: 2, k: 0.02, T: Math.log(1.8) / 0.02, y: 40 },
  startWith: ['Q', 'r', 'g'],
  representation: { kind: 'reserve', reserve: 'Q', rate: 'r', years: 'y' },
};

// ── The solar system: formation, planets and small bodies ──

const kepler: ModuleDef = {
  id: 's.12.solar-system',
  assumptions: [
    'First law: each planet moves on an ellipse with the Sun at one focus.',
    'Second law: the line to the Sun sweeps equal areas in equal times, so the planet is fastest at perihelion.',
    'Third law: T² = a³, with T in years and a in AU.',
    'T² = a³ holds only for bodies orbiting the Sun.',
    '1 AU = 150 million km, Earth’s distance from the Sun.',
  ],
  variables: [
    V('a', 'a', 'Semi-major axis', { unit: 'AU', min: 0.1, max: 100, step: 0.01 }),
    // To 0.97: Halley's Comet (e = 0.967) fits.
    V('e', 'e', 'Eccentricity', { min: 0, max: 0.97, step: 0.001 }),
    V('q', 'q', 'Perihelion distance', { unit: 'AU', min: 0, max: 200, step: 0.01, sigFigs: 3 }),
    V('Q', 'Q', 'Aphelion distance', { unit: 'AU', min: 0, max: 200, step: 0.01, sigFigs: 3 }),
    V('T', 'T', 'Period', { unit: 'years', min: 0.03, max: 1000, step: 0.01 }),
  ],
  ...rels(
    rule('q = a(1 − e)', '{q} = {a} × (1 − {e})', (v) => v.q! - v.a! * (1 - v.e!), {
      q: [
        (v) => v.a! * (1 - v.e!),
        '{a} × (1 − {e})',
        'Closest: a less the Sun’s offset from the center, ae.',
      ],
      a: [
        (v) => div(v.q!, 1 - v.e!),
        '{q} ÷ (1 − {e})',
        'Divide the perihelion distance by 1 − e.',
      ],
      e: [(v) => div(v.a! - v.q!, v.a!), '({a} − {q}) ÷ {a}', 'The offset a − q, over a.'],
    }),
    rule('Q = a(1 + e)', '{Q} = {a} × (1 + {e})', (v) => v.Q! - v.a! * (1 + v.e!), {
      Q: [(v) => v.a! * (1 + v.e!), '{a} × (1 + {e})', 'Farthest: a plus the offset ae.'],
      a: [(v) => div(v.Q!, 1 + v.e!), '{Q} ÷ (1 + {e})', 'Divide the aphelion distance by 1 + e.'],
      e: [(v) => div(v.Q! - v.a!, v.a!), '({Q} − {a}) ÷ {a}', 'The offset Q − a, over a.'],
    }),
    rule('T² = a³', '{T}² = {a}³', (v) => v.T! * v.T! - v.a! ** 3, {
      T: [(v) => Math.pow(v.a!, 1.5), '√({a}³)', 'Kepler’s third law: T is the square root of a³.'],
      a: [(v) => Math.cbrt(v.T! * v.T!), '∛({T}²)', 'a is the cube root of T².'],
    }),
  ),
  example: { a: 1.52, e: 0.093, q: 1.52 * 0.907, Q: 1.52 * 1.093, T: Math.pow(1.52, 1.5) },
  startWith: ['a', 'e'],
  representation: {
    kind: 'circularMotion',
    mode: 'kepler',
    semiMajor: 'a',
    eccentricity: 'e',
    perihelion: 'q',
    aphelion: 'Q',
    period: 'T',
  },
};

// ── Light, spectra and telescopes: how we study stars ──

/** Wien's constant in nm·K. */
const WIEN = 2.898e6;

const wien: ModuleDef = {
  id: 's.12.starlight-spectra',
  unitSystems: ['metric'],
  assumptions: [
    'Hotter stars peak at shorter wavelengths, so they look bluer.',
    'A star glows at every wavelength; λ is only the brightest one.',
    'c = 3.00 × 10⁸ m/s.',
    'f is the frequency of the peak wavelength; graphed by frequency, the peak falls elsewhere.',
  ],
  variables: [
    V('T', 'T', 'Surface temperature', { unit: 'K', min: 2500, max: 40000, step: 10 }),
    V('l', 'λ', 'Peak wavelength', { unit: 'nm', min: 70, max: 1200, step: 0.1 }),
    V('f', 'f', 'Frequency of the peak wavelength', {
      unit: 'Hz',
      min: 2.5e14,
      max: 4.3e15,
      step: 1e10,
      scientific: true,
    }),
  ],
  ...rels(
    rule('λ = 2.898 × 10⁶ ÷ T', '{l} = 2.898 × 10⁶ ÷ {T}', (v) => v.l! * v.T! - WIEN, {
      l: [
        (v) => div(WIEN, v.T!),
        '2.898 × 10⁶ ÷ {T}',
        'Wien’s law: the peak wavelength in nm is 2.898 × 10⁶ over the temperature in K.',
      ],
      T: [
        (v) => div(WIEN, v.l!),
        '2.898 × 10⁶ ÷ {l}',
        'The same law turned round for the temperature.',
      ],
    }),
    rule('f = c ÷ λ', '{f} = 3.00 × 10⁸ ÷ ({l} × 10⁻⁹)', (v) => v.f! - 3e17 / v.l!, {
      f: [
        (v) => div(3e17, v.l!),
        '3.00 × 10⁸ ÷ ({l} × 10⁻⁹)',
        'Light’s speed over the wavelength in meters: a nanometer is 10⁻⁹ m.',
      ],
      l: [
        (v) => div(3e17, v.f!),
        '3.00 × 10⁸ ÷ {f} ÷ 10⁻⁹',
        'Light’s speed over the frequency gives meters; divide by 10⁻⁹ for nm.',
      ],
    }),
  ),
  example: { T: 5772, l: WIEN / 5772, f: 3e17 / (WIEN / 5772) },
  startWith: ['T'],
  representation: { kind: 'spectrum', wavelength: 'l', meters: 1e-9, frequency: 'f', speed: 3e8 },
};

/** Hydrogen's red line in the lab, nm. */
const H_ALPHA = 656.3;

/** z = (λ − 656.3) ÷ 656.3. */
const redshiftRel = rule(
  'z = (λ − 656.3) ÷ 656.3',
  '{z} = ({l} − 656.3) ÷ 656.3',
  (v) => v.z! - (v.l! - H_ALPHA) / H_ALPHA,
  {
    z: [
      (v) => (v.l! - H_ALPHA) / H_ALPHA,
      '({l} − 656.3) ÷ 656.3',
      'The shift as a fraction of the lab wavelength.',
    ],
    l: [(v) => H_ALPHA * (1 + v.z!), '656.3 × (1 + {z})', 'Stretch the lab wavelength by 1 + z.'],
  },
);

/** z = (λ − λ₀) ÷ λ₀, the lab line λ₀ a value (any Balmer line). */
const restShiftRel = rule(
  'z = (λ − λ₀) ÷ λ₀',
  '{z} = ({l} − {r}) ÷ {r}',
  (v) => v.z! * v.r! - (v.l! - v.r!),
  {
    z: [
      (v) => Number(((v.l! - v.r!) / v.r!).toPrecision(12)),
      '({l} − {r}) ÷ {r}',
      'The shift as a fraction of the lab wavelength.',
    ],
    l: [
      (v) => Number((v.r! * (1 + v.z!)).toPrecision(12)),
      '{r} × (1 + {z})',
      'The lab wavelength stretched by 1 + z.',
    ],
  },
);

/** v = c × z, c in km/s. */
const czRel = rule('v = c × z', '{v} = 300,000 × {z}', (v) => v.v! - 300000 * v.z!, {
  v: [(v) => 300000 * v.z!, '300,000 × {z}', 'Multiply the shift by light’s speed, 300,000 km/s.'],
  z: [(v) => v.v! / 300000, '{v} ÷ 300,000', 'Divide the speed by light’s speed.'],
});

const doppler: ModuleDef = {
  id: 's.12.starlight-spectra~doppler',
  title: 'A star’s Doppler shift',
  use: 'Use this for “A star’s Hα line is seen at 656.5 nm. How fast is it moving, and which way?”',
  unitSystems: ['metric'],
  assumptions: [
    'Moving away stretches the lines red (+v); moving toward shifts them blue (−v).',
    'Only motion along our line of sight shows.',
    'Pick the hydrogen line you measured: its lab wavelength is λ₀, and the other lines shift the same way.',
  ],
  variables: [
    V('r', 'λ₀', 'Lab wavelength (Hα 656.3, Hβ 486.1, Hγ 434, Hδ 410.2)', {
      unit: 'nm',
      min: 410.2,
      max: 656.3,
      multipleOf: 0.1,
      allowed: [410.2, 434.0, 486.1, 656.3],
    }),
    V('l', 'λ', 'Observed wavelength', { unit: 'nm', min: 400, max: 665, step: 0.01 }),
    V('z', 'z', 'Shift', { min: -0.012, max: 0.012, step: 0.000001, sigFigs: 5 }),
    V('v', 'v', 'Line-of-sight speed', {
      unit: 'km/s',
      units: ['km/s'],
      min: -3600,
      max: 3600,
      step: 0.1,
      sigFigs: 4,
    }),
  ],
  ...rels(restShiftRel, czRel),
  example: {
    r: H_ALPHA,
    l: 656.5,
    z: (656.5 - H_ALPHA) / H_ALPHA,
    v: (300000 * (656.5 - H_ALPHA)) / H_ALPHA,
  },
  startWith: ['r', 'l'],
  representation: {
    kind: 'spectrum',
    wavelength: 'l',
    meters: 1e-9,
    lines: {
      element: 'H',
      mode: 'absorption',
      redshift: 'z',
      velocity: 'v',
      rest: 'r',
      line: 'rest',
    },
  },
};

const telescope: ModuleDef = {
  id: 's.12.starlight-spectra~telescope',
  title: 'A telescope’s magnification and light-gathering',
  use: 'Use this for “A telescope has a 900 mm objective and a 25 mm eyepiece. What is its magnification?”',
  unitSystems: ['metric'],
  assumptions: [
    'Aperture, not magnification, sets how faint a star you can see.',
    'Mirrors can be made far larger than lenses.',
    'The eye’s pupil opens to about 7 mm in the dark.',
  ],
  standalone: {
    vars: ['D', 'G'],
    why: 'The aperture sets how much light is gathered; it does not change the magnification or the tube.',
  },
  variables: [
    V('o', 'fₒ', 'Objective focal length', { unit: 'mm', min: 100, max: 5000, step: 1 }),
    V('e', 'fₑ', 'Eyepiece focal length', { unit: 'mm', min: 3, max: 60, step: 0.1 }),
    V('M', 'M', 'Magnification', { min: 1, max: 2000, step: 0.1, derived: true }),
    V('L', 'L', 'Tube length', { unit: 'mm', min: 103, max: 5060, step: 1, derived: true }),
    V('D', 'D', 'Aperture', { unit: 'mm', min: 10, max: 1000, step: 1 }),
    V('G', 'G', 'Times more light than the eye', {
      min: 2,
      max: 20500,
      step: 1,
      sigFigs: 3,
      derived: true,
    }),
  ],
  ...rels(
    quotient('M', 'o', 'e', 'M = fₒ ÷ fₑ', [
      'The objective’s focal length over the eyepiece’s.',
      'The magnification times the eyepiece’s focal length.',
      'The objective’s focal length over the magnification.',
    ]),
    rule('L = fₒ + fₑ', '{L} = {o} + {e}', (v) => v.L! - v.o! - v.e!, {
      L: [
        (v) => v.o! + v.e!,
        '{o} + {e}',
        'The two focal points meet, so the lenses sit fₒ + fₑ apart.',
      ],
      o: [(v) => v.L! - v.e!, '{L} − {e}', 'The tube less the eyepiece’s focal length.'],
      e: [(v) => v.L! - v.o!, '{L} − {o}', 'The tube less the objective’s focal length.'],
    }),
    rule('G = (D ÷ 7)²', '{G} = ({D} ÷ 7)²', (v) => v.G! - (v.D! / 7) ** 2, {
      G: [
        (v) => (v.D! / 7) ** 2,
        '({D} ÷ 7)²',
        'Light gathered goes with the area, so square the ratio of widths.',
      ],
      D: [
        (v) => (v.G! >= 0 ? 7 * Math.sqrt(v.G!) : undefined),
        '7 × √({G})',
        'Undo the square, then scale up from the 7 mm pupil.',
      ],
    }),
  ),
  example: { o: 900, e: 25, M: 36, L: 925, D: 100, G: (100 / 7) ** 2 },
  startWith: ['o', 'e', 'D'],
  representation: {
    kind: 'rayDiagram',
    mode: 'telescope',
    design: 'refracting',
    objective: 'o',
    eyepiece: 'e',
    magnification: 'M',
    length: 'L',
  },
};

const parallax: ModuleDef = {
  id: 's.12.starlight-spectra~parallax',
  title: 'Distance from parallax',
  use: 'Use this for “A star’s parallax is 0.1″. How far away is it, in parsecs and light-years?”',
  unitSystems: ['metric'],
  assumptions: [
    'Earth is on opposite sides of the Sun six months apart, 2 AU apart.',
    'p is half the near star’s shift against the far stars: the angle 1 AU makes at the star.',
    '1 parsec = 3.26 light-years.',
  ],
  variables: [
    V('p', 'p', 'Parallax angle', { unit: '″', min: 0.001, max: 1, step: 0.001 }),
    V('d', 'd', 'Distance in parsecs', { unit: 'pc', min: 1, max: 1000, step: 0.01 }),
    V('D', 'D', 'Distance in light-years', {
      unit: 'light-years',
      min: 3.26,
      max: 3260,
      step: 0.01,
    }),
  ],
  ...rels(
    rule('d = 1 ÷ p', '{d} = 1 ÷ {p}', (v) => v.d! * v.p! - 1, {
      d: [
        (v) => div(1, v.p!),
        '1 ÷ {p}',
        'A parsec is the distance at which 1 AU looks 1″ wide: the smaller the angle, the farther the star.',
      ],
      p: [(v) => div(1, v.d!), '1 ÷ {d}', 'The angle shrinks as the star is farther: 1 over d.'],
    }),
    rule('D = 3.26 × d', '{D} = 3.26 × {d}', (v) => v.D! - 3.26 * v.d!, {
      D: [(v) => 3.26 * v.d!, '3.26 × {d}', 'Light takes 3.26 years to cross a parsec.'],
      d: [(v) => v.D! / 3.26, '{D} ÷ 3.26', 'Each parsec is 3.26 light-years: divide.'],
    }),
  ),
  example: { p: 0.1, d: 10, D: 32.6 },
  startWith: ['p'],
  representation: { kind: 'parallax', angle: 'p', parsecs: 'd', lightYears: 'D' },
};

// ── The sun and stellar evolution ──

/** The Sun's surface temperature, K. */
const SUN_K = 5772;
const lum = (r: number, t: number) => r * r * (t / SUN_K) ** 4;

const hr: ModuleDef = {
  id: 's.12.stellar-evolution',
  unitSystems: ['metric'],
  assumptions: [
    'A bigger or hotter star gives off more light.',
    'Main-sequence stars fuse hydrogen in their cores; mass sets where they sit.',
    'Giants are cool but huge; white dwarfs are hot but tiny.',
  ],
  variables: [
    V('T', 'T', 'Surface temperature', { unit: 'K', min: 2500, max: 40000, step: 10 }),
    V('R', 'R', 'Radius', { unit: 'R☉', min: 0.005, max: 1500, step: 0.001 }),
    V('L', 'L', 'Luminosity', { unit: 'L☉', min: 0.0001, max: 1000000, step: 0.0001 }),
  ],
  ...rels(
    rule('L = R² × (T ÷ 5,772)⁴', '{L} = {R}² × ({T} ÷ 5,772)⁴', (v) => v.L! - lum(v.R!, v.T!), {
      L: [
        (v) => lum(v.R!, v.T!),
        '{R}² × ({T} ÷ 5,772)⁴',
        'Surface area grows as R²; each square meter shines as T⁴, compared with the Sun.',
      ],
      R: [
        (v) => (v.L! > 0 ? Math.sqrt(v.L!) * (SUN_K / v.T!) ** 2 : undefined),
        '√({L}) × (5,772 ÷ {T})²',
        'Undo the fourth power of the temperature, then the square of the radius.',
      ],
      T: [
        (v) => (v.L! > 0 && v.R! > 0 ? SUN_K * (v.L! / v.R! ** 2) ** 0.25 : undefined),
        '5,772 × ∜({L} ÷ {R}²)',
        'The light for each unit of surface, then its fourth root.',
      ],
    }),
  ),
  example: { T: 9940, R: 1.71, L: lum(1.71, 9940) },
  startWith: ['T', 'R'],
  representation: {
    kind: 'hrDiagram',
    temperature: 'T',
    luminosity: 'L',
    radius: 'R',
    name: 'Sirius A',
  },
};

/** Light's speed squared, m²/s². */
const C2 = 9e16;

const fusion: ModuleDef = {
  id: 's.12.stellar-evolution~fusion',
  title: 'How much mass the Sun turns into light',
  use: 'Use this for “The Sun gives off 3.828 × 10²⁶ W. How much mass does it turn into energy each second?”',
  unitSystems: ['metric'],
  assumptions: [
    '0.7 % of the hydrogen’s mass becomes energy (E = mc²).',
    'The Sun shines by this chain in its core: 4 ¹H → ⁴He + 2 e⁺ + 2 neutrinos.',
    'c = 3.00 × 10⁸ m/s, so c² = 9.00 × 10¹⁶ m²/s².',
  ],
  variables: [
    V('L', 'L', 'Luminosity', { unit: 'W', min: 1e20, max: 1e32, step: 1e18, scientific: true }),
    V('m', 'm', 'Mass turned to energy each second', {
      unit: 'kg/s',
      min: 1e3,
      max: 1e16,
      step: 1,
      scientific: true,
    }),
    V('H', 'H', 'Hydrogen fused each second', {
      unit: 'kg/s',
      min: 1e5,
      max: 1e19,
      step: 1,
      scientific: true,
    }),
  ],
  ...rels(
    rule('m = L ÷ c²', '{m} = {L} ÷ (9.00 × 10¹⁶)', (v) => v.m! - v.L! / C2, {
      m: [
        (v) => v.L! / C2,
        '{L} ÷ (9.00 × 10¹⁶)',
        'E = mc²: each second’s energy over c² is the mass it came from.',
      ],
      L: [(v) => v.m! * C2, '{m} × 9.00 × 10¹⁶', 'Each kilogram gives c² joules.'],
    }),
    rule('H = m ÷ 0.007', '{H} = {m} ÷ 0.007', (v) => v.H! - v.m! / 0.007, {
      H: [(v) => v.m! / 0.007, '{m} ÷ 0.007', 'The mass lost is only 0.7 % of the hydrogen fused.'],
      m: [(v) => v.H! * 0.007, '{H} × 0.007', '0.7 % of the hydrogen’s mass becomes energy.'],
    }),
  ),
  example: { L: 3.828e26, m: 3.828e26 / C2, H: 3.828e26 / C2 / 0.007 },
  startWith: ['L'],
  pictureLabels: ['L', 'm', 'H'],
  representation: {
    kind: 'decayChart',
    mode: 'equation',
    left: [{ mass: 1, atomic: 1, count: 4 }],
    right: [
      { mass: 4, atomic: 2 },
      { particle: 'positron', count: 2 },
    ],
  },
};

const lifetime: ModuleDef = {
  id: 's.12.stellar-evolution~lifetime',
  title: 'A star’s mass sets its life',
  use: 'Use this for “A star has twice the Sun’s mass. How bright is it, and how long will it last?”',
  unitSystems: ['metric'],
  assumptions: [
    'On the main sequence a star’s luminosity grows about as its mass to the power 3.5.',
    'Its life there is its fuel (its mass) over the rate it burns it (its luminosity): the Sun’s 10¹⁰ years ÷ M^2.5.',
    'Masses and luminosities are in Suns.',
    'Stars under about 0.8 M☉ outlive the universe so far.',
  ],
  variables: [
    V('M', 'M', 'Mass', { unit: 'M☉', min: 0.08, max: 50, step: 0.01 }),
    V('L', 'L', 'Luminosity', { unit: 'L☉', min: 0, max: 1e7, step: 0.001, derived: true }),
    V('t', 't', 'Main-sequence lifetime', {
      unit: 'years',
      min: 0,
      max: 1e14,
      step: 1,
      scientific: true,
      derived: true,
    }),
  ],
  ...rels(
    rule('L = M^3.5', '{L} = {M}^3.5', (v) => v.L! - v.M! ** 3.5, {
      L: [
        (v) => v.M! ** 3.5,
        '{M}^3.5',
        'Luminosity rises steeply with mass on the main sequence.',
      ],
      M: [
        (v) => (v.L! > 0 ? v.L! ** (1 / 3.5) : undefined),
        '{L}^(1/3.5)',
        'The mass that shines L.',
      ],
    }),
    rule('t = 10¹⁰ ÷ M^2.5', '{t} = 10¹⁰ ÷ {M}^2.5', (v) => v.t! / (1e10 * v.M! ** -2.5) - 1, {
      t: [
        (v) => 1e10 * v.M! ** -2.5,
        '10¹⁰ ÷ {M}^2.5',
        'M times the fuel burned L = M^3.5 times as fast: the Sun’s life × M ÷ M^3.5.',
      ],
      M: [
        (v) => (v.t! > 0 ? (v.t! / 1e10) ** (-1 / 2.5) : undefined),
        '(10¹⁰ ÷ {t})^(1/2.5)',
        'The mass whose life is t.',
      ],
    }),
  ),
  example: { M: 2, L: 2 ** 3.5, t: 1e10 * 2 ** -2.5 },
  startWith: ['M'],
  representation: { kind: 'hrDiagram', mass: 'M', luminosity: 'L', lifetime: 't' },
};

// ── Galaxies, the Big Bang and the expanding universe ──

/** v = H₀ × d. */
const hubbleRel = product('v', 'H', 'd', 'v = H₀ × d', [
  'Each megaparsec of distance adds H₀ km/s of speed.',
  'The speed for each megaparsec: the slope of the Hubble plot.',
  'How many megaparsecs give that speed.',
]);

const hubble: ModuleDef = {
  id: 's.12.cosmology',
  unitSystems: ['metric'],
  assumptions: [
    'Farther galaxies move away faster because space itself stretches.',
    '1/H₀ is the age if expansion had never changed speed.',
    'Nearby galaxies such as Andromeda can approach us.',
  ],
  variables: [
    V('H', 'H₀', 'Hubble constant', { unit: 'km/s per Mpc', min: 50, max: 100, step: 0.1 }),
    V('d', 'd', 'Distance', { unit: 'Mpc', min: 1, max: 1000, step: 0.1 }),
    V('v', 'v', 'Speed away', { unit: 'km/s', units: ['km/s'], min: 0, max: 70000, step: 1 }),
    V('t', 't', 'Age from 1/H₀', {
      unit: 'billion years',
      min: 9.778,
      max: 19.556,
      step: 0.01,
      derived: true,
    }),
  ],
  ...rels(
    hubbleRel,
    rule('t = 977.8 ÷ H₀', '{t} = 977.8 ÷ {H}', (v) => v.t! - 977.8 / v.H!, {
      t: [
        (v) => div(977.8, v.H!),
        '977.8 ÷ {H}',
        '1 ÷ H₀ is a time; 977.8 turns km/s per Mpc into billions of years.',
      ],
      H: [(v) => div(977.8, v.t!), '977.8 ÷ {t}', 'The same rule turned round for H₀.'],
    }),
  ),
  example: { H: 70, d: 200, v: 14000, t: 977.8 / 70 },
  startWith: ['H', 'd'],
  representation: {
    kind: 'expandingUniverse',
    mode: 'hubble',
    distance: 'd',
    speed: 'v',
    constant: 'H',
  },
};

const redshift: ModuleDef = {
  id: 's.12.cosmology~redshift',
  title: 'A galaxy’s redshift and distance',
  use: 'Use this for “A galaxy’s light is shifted to longer wavelengths, z = 0.03. How fast is it moving away, and how far is it?”',
  unitSystems: ['metric'],
  assumptions: [
    'v = cz only for z under about 0.1.',
    'A redshift means longer wavelengths and a galaxy moving away.',
    'Hydrogen’s Hα line is 656.3 nm in the lab.',
  ],
  variables: [
    V('l', 'λ', 'Observed wavelength of Hα', {
      unit: 'nm',
      min: H_ALPHA,
      max: 721.93,
      step: 0.01,
    }),
    V('z', 'z', 'Redshift', { min: 0, max: 0.1, step: 0.00001, sigFigs: 5 }),
    V('v', 'v', 'Speed away', {
      unit: 'km/s',
      units: ['km/s'],
      min: 0,
      max: 30000,
      step: 1,
      sigFigs: 4,
    }),
    V('H', 'H₀', 'Hubble constant', { unit: 'km/s per Mpc', min: 50, max: 100, step: 0.1 }),
    V('d', 'd', 'Distance', { unit: 'Mpc', min: 0, max: 600, step: 0.1 }),
  ],
  ...rels(redshiftRel, czRel, hubbleRel),
  example: {
    l: 676,
    z: (676 - H_ALPHA) / H_ALPHA,
    v: (300000 * (676 - H_ALPHA)) / H_ALPHA,
    H: 70,
    d: (300000 * (676 - H_ALPHA)) / H_ALPHA / 70,
  },
  startWith: ['l', 'H'],
  pictureLabels: ['H', 'd'],
  representation: {
    kind: 'spectrum',
    wavelength: 'l',
    meters: 1e-9,
    lines: { element: 'H', mode: 'absorption', redshift: 'z', velocity: 'v' },
  },
};

const stretch: ModuleDef = {
  id: 's.12.cosmology~stretch',
  title: 'Space stretching: every galaxy moves apart',
  use: 'Use this for “Space doubles in size. How far does a galaxy 100 million light-years away move?”',
  assumptions: [
    'Space itself stretches, carrying the galaxies apart.',
    'Every distance grows by the same factor, so from any galaxy the others all seem to move away.',
    'Twice as far moves twice as far: that is Hubble’s law.',
  ],
  variables: [
    V('a', 'a', 'Stretch factor', { min: 1, max: 4, step: 0.01 }),
    V('d', 'd', 'Distance before', {
      unit: 'million light-years',
      min: 1,
      max: 1000,
      step: 1,
    }),
    V('D', 'D', 'Distance after', {
      unit: 'million light-years',
      min: 1,
      max: 4000,
      step: 1,
      derived: true,
    }),
    V('m', 'Δ', 'How far it moved', {
      unit: 'million light-years',
      min: 0,
      max: 3000,
      step: 1,
      derived: true,
    }),
  ],
  ...rels(
    product('D', 'a', 'd', 'D = a × d', [
      'Every distance grows by the stretch factor.',
      'How many times the distance grew.',
      'Undo the stretch: divide by the factor.',
    ]),
    difference('m', 'D', 'd', 'Δ = D − d', [
      'How far it moved is the growth in its distance.',
      'The distance after is the distance before plus how far it moved.',
      'The distance before is the distance after less how far it moved.',
    ]),
  ),
  example: { a: 2, d: 100, D: 200, m: 100 },
  startWith: ['a', 'd'],
  representation: {
    kind: 'expandingUniverse',
    mode: 'stretch',
    scale: 'a',
    distance: 'd',
    after: 'D',
  },
};

// ── Exoplanets and the search for life ──

/** Earth radii in the Sun's radius (696,000 km ÷ 6,371 km, rounded). */
const RE_PER_RSUN = 109;
const depthOf = (r: number, R: number) => 100 * (r / (RE_PER_RSUN * R)) ** 2;

const transit: ModuleDef = {
  id: 's.12.exoplanets',
  unitSystems: ['metric'],
  assumptions: [
    'The dip is the share of the star’s disk the planet covers.',
    'The orbit must be nearly edge-on to us, or there is no transit.',
    'Repeated dips a period apart confirm a planet.',
    '1 R☉ = 109 R⊕: the Sun is 109 Earths wide.',
  ],
  variables: [
    V('R', 'R', 'Star’s radius', { unit: 'R☉', min: 0.1, max: 10, step: 0.001 }),
    // Wide, so a dip that gives a planet outside 0.3–25 R⊕ meets the check below (with its
    // reason), not a silent clear.
    V('r', 'r', 'Planet’s radius', { unit: 'R⊕', min: 0.0001, max: 1090, step: 0.01 }),
    V('d', 'δ', 'Transit depth', { unit: '%', min: 1e-6, max: 100, step: 1e-6 }),
  ],
  ...rels(
    {
      relation: {
        id: 'r < 109 × R',
        constraint: true,
        display: '{r} is less than 109 × {R}',
        vars: ['r', 'R'],
        residual: (v: Values) => (v.r! < RE_PER_RSUN * v.R! ? 0 : 1),
        solve: {},
        message: () => 'A planet is smaller than its star, so it blocks only part of the light.',
      },
      steps: {},
    },
    {
      relation: {
        id: 'r from 0.3 to 25',
        constraint: true,
        display: '{r} is from 0.3 to 25',
        vars: ['r'],
        residual: (v: Values) => (v.r! >= 0.3 - 1e-9 && v.r! <= 25 + 1e-9 ? 0 : 1),
        solve: {},
        message: (v: Values) =>
          v.r! > 25 + 1e-9
            ? 'That dip needs a body over 25 Earths wide: a small star, not a planet.'
            : v.r! < 0.3 - 1e-9
              ? 'That dip is from a body under 0.3 Earths wide, too small to find this way.'
              : undefined,
      },
      steps: {},
    },
    rule(
      'δ = 100 × (r ÷ (109 × R))²',
      '{d} = 100 × ({r} ÷ (109 × {R}))²',
      (v) => v.d! - depthOf(v.r!, v.R!),
      {
        d: [
          (v) => depthOf(v.r!, v.R!),
          '100 × ({r} ÷ (109 × {R}))²',
          'The planet’s disk over the star’s disk: the ratio of their radii, squared.',
        ],
        r: [
          (v) => (v.d! >= 0 ? RE_PER_RSUN * v.R! * Math.sqrt(v.d! / 100) : undefined),
          '109 × {R} × √({d} ÷ 100)',
          'Undo the square: the radius ratio is the square root of the dip’s share.',
        ],
        R: [
          (v) => (v.d! > 0 ? v.r! / (RE_PER_RSUN * Math.sqrt(v.d! / 100)) : undefined),
          '{r} ÷ (109 × √({d} ÷ 100))',
          'The star is as many times wider as the square root of the share is small.',
        ],
      },
    ),
  ),
  example: { R: 1, r: 10.9, d: 1 },
  startWith: ['d', 'R'],
  representation: { kind: 'transit', star: 'R', planet: 'r', depth: 'd' },
};

const exoOrbit: ModuleDef = {
  id: 's.12.exoplanets~orbit',
  title: 'An exoplanet’s orbit from its period',
  use: 'Use this for “A planet circles a star of 0.5 solar masses every 1,461 days. How far is it from its star?”',
  unitSystems: ['metric'],
  assumptions: [
    'The planet’s mass is tiny beside its star’s.',
    'With M = 1 this is the solar system’s T² = a³.',
    'A heavier star pulls harder, so the same period means a wider orbit.',
  ],
  variables: [
    V('M', 'M', 'Star’s mass', { unit: 'M☉', min: 0.1, max: 5, step: 0.01 }),
    V('P', 'P', 'Period in days', { unit: 'days', min: 0.2, max: 10000, step: 0.001 }),
    V('T', 'T', 'Period in years', { unit: 'years', min: 0.0005, max: 27.4, step: 0.0001 }),
    V('a', 'a', 'Orbit size', { unit: 'AU', min: 0.001, max: 20, step: 0.0001 }),
  ],
  ...rels(
    rule('T = P ÷ 365.25', '{T} = {P} ÷ 365.25', (v) => v.T! - v.P! / 365.25, {
      T: [(v) => v.P! / 365.25, '{P} ÷ 365.25', 'A year is 365.25 days: count the years.'],
      P: [(v) => v.T! * 365.25, '{T} × 365.25', 'Each year is 365.25 days: multiply.'],
    }),
    ((r: Rel): Rel => ({
      ...r,
      steps: {
        ...r.steps,
        a: { ...r.steps.a!, work: (v) => [`a = ∛${fmt(v.M! * v.T! * v.T!)}`] },
      },
    }))(
      rule('a³ = M × T²', '{a}³ = {M} × {T}²', (v) => v.a! ** 3 - v.M! * v.T! * v.T!, {
        a: [
          (v) => Math.cbrt(v.M! * v.T! * v.T!),
          '∛({M} × {T}²)',
          'Kepler’s third law with the star’s mass: a is the cube root of M × T².',
        ],
        M: [(v) => div(v.a! ** 3, v.T! * v.T!), '{a}³ ÷ {T}²', 'Divide a³ by T².'],
        T: [
          (v) => (v.M! > 0 ? Math.sqrt(v.a! ** 3 / v.M!) : undefined),
          '√({a}³ ÷ {M})',
          'T² is a³ over the star’s mass; take the square root.',
        ],
      }),
    ),
  ),
  example: { M: 0.5, P: 1461, T: 4, a: 2 },
  startWith: ['P', 'M'],
  representation: {
    kind: 'circularMotion',
    mode: 'kepler',
    semiMajor: 'a',
    starMass: 'M',
    period: 'T',
  },
};

const habTemp = (L: number, a: number) => (278 * L ** 0.25) / Math.sqrt(a);

const habitable: ModuleDef = {
  id: 's.12.exoplanets~habitable-zone',
  title: 'The habitable zone and a planet’s temperature',
  use: 'Use this for “A star gives off 0.25 times the Sun’s light. Where is its habitable zone, and is a planet at 0.5 AU in it?”',
  unitSystems: ['metric'],
  assumptions: [
    'Between d₁ and d₂ a planet like Earth could keep liquid water.',
    'Light spreads out as the square of distance, so the zone moves out as √L.',
    'T leaves out clouds and greenhouse gases: it gives Earth 278 K, but Earth averages about 288 K.',
  ],
  variables: [
    V('L', 'L', 'Star’s luminosity', { unit: 'L☉', min: 0.001, max: 100, step: 0.001 }),
    V('d1', 'd₁', 'Inner edge of the zone', {
      unit: 'AU',
      min: 0.03,
      max: 9.5,
      step: 0.001,
      derived: true,
    }),
    V('d2', 'd₂', 'Outer edge of the zone', {
      unit: 'AU',
      min: 0.043,
      max: 13.7,
      step: 0.001,
      derived: true,
    }),
    V('a', 'a', 'Planet’s orbit', { unit: 'AU', min: 0.01, max: 100, step: 0.001 }),
    V('T', 'T', 'Planet’s temperature', { unit: 'K', min: 1, max: 10000, step: 0.1 }),
  ],
  ...rels(
    {
      relation: {
        id: 'a > 0.005 × √L',
        constraint: true,
        display: '{a} is more than 0.005 × √{L}',
        vars: ['a', 'L'],
        residual: (v: Values) => (v.a! > 0.005 * Math.sqrt(v.L!) ? 0 : 1),
        solve: {},
        message: (v: Values) =>
          v.a! > 0.005 * Math.sqrt(v.L!) ? undefined : 'That orbit is inside the star.',
      },
      steps: {},
    },
    rule('d₁ = 0.95 × √L', '{d1} = 0.95 × √{L}', (v) => v.d1! - 0.95 * Math.sqrt(v.L!), {
      d1: [
        (v) => 0.95 * Math.sqrt(v.L!),
        '0.95 × √{L}',
        'Nearer than this, a planet like Earth grows too hot and loses its water.',
      ],
      L: [(v) => (v.d1! / 0.95) ** 2, '({d1} ÷ 0.95)²', 'Undo the square root: square d₁ ÷ 0.95.'],
    }),
    rule('d₂ = 1.37 × √L', '{d2} = 1.37 × √{L}', (v) => v.d2! - 1.37 * Math.sqrt(v.L!), {
      d2: [(v) => 1.37 * Math.sqrt(v.L!), '1.37 × √{L}', 'Farther than this, its water freezes.'],
      L: [(v) => (v.d2! / 1.37) ** 2, '({d2} ÷ 1.37)²', 'Undo the square root: square d₂ ÷ 1.37.'],
    }),
    ((r: Rel): Rel => ({
      ...r,
      steps: {
        ...r.steps,
        T: {
          ...r.steps.T!,
          work: (v) => [`T = 278 × ${fmt(v.L! ** 0.25)} ÷ ${fmt(Math.sqrt(v.a!))}`],
          note: (v) =>
            v.a! < v.d1!
              ? `(${fmt(v.a!)} AU is inside ${fmt(v.d1!)} AU: too hot)`
              : v.a! > v.d2!
                ? `(${fmt(v.a!)} AU is past ${fmt(v.d2!)} AU: too cold)`
                : `(${fmt(v.d1!)} < ${fmt(v.a!)} < ${fmt(v.d2!)} AU: in the zone)`,
        },
      },
    }))(
      rule(
        'T = 278 × L^(1/4) ÷ √a',
        '{T} = 278 × {L}^(1/4) ÷ √{a}',
        (v) => v.T! - habTemp(v.L!, v.a!),
        {
          T: [
            (v) => habTemp(v.L!, v.a!),
            '278 × ∜{L} ÷ √{a}',
            'A planet at 1 AU from the Sun comes to 278 K; more light warms it, more distance cools it.',
          ],
          a: [
            (v) => (v.T! > 0 ? ((278 * v.L! ** 0.25) / v.T!) ** 2 : undefined),
            '(278 × ∜{L} ÷ {T})²',
            'Undo the square root of the distance: square the ratio.',
          ],
          L: [
            (v) => ((v.T! * Math.sqrt(v.a!)) / 278) ** 4,
            '({T} × √{a} ÷ 278)⁴',
            'Undo the fourth root of the light: raise to the fourth power.',
          ],
        },
      ),
    ),
  ),
  example: { L: 0.25, d1: 0.475, d2: 0.685, a: 0.5, T: 278 },
  startWith: ['L', 'a'],
  representation: {
    kind: 'habitableZone',
    luminosity: 'L',
    inner: 'd1',
    outer: 'd2',
    orbit: 'a',
    temperature: 'T',
  },
};

export const SCIENCE_12_MODULES: ModuleDef[] = [
  mineralDensity,
  earthInterior,
  epicenter,
  shadowZone,
  magnitude,
  spreading,
  earthDay,
  coralDays,
  discharge,
  carbonDating,
  uranium,
  bracket,
  halfLife,
  potassium,
  crossCutting,
  sonar,
  tides,
  lapse,
  pressureMap,
  humidity,
  cloudBase,
  energyBalance,
  energyMix,
  reserves,
  growingUse,
  kepler,
  wien,
  doppler,
  telescope,
  parallax,
  hr,
  fusion,
  lifetime,
  hubble,
  redshift,
  stretch,
  transit,
  exoOrbit,
  habitable,
];

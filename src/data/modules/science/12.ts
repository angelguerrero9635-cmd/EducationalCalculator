/**
 * Grade 12 science: every calculator module for the grade, the skill's main page first
 * and its problem types (`<skill id>~<slug>`) after it. Shared relation helpers live in
 * `../helpers.ts`; worked-line helpers in `../work.ts`. Rules: docs/MODULE_GUIDE.md; the
 * direction plan and build notes: docs/BUILD_HS.md.
 * The layout pages (explore, sort, sequence, observe) are in `../layouts/science12.ts`.
 */
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

/** a < b, checked only. */
const below = (a: string, b: string, id: string, display: string): Rel => ({
  relation: {
    id,
    constraint: true,
    display,
    vars: [a, b],
    residual: (v: Values) => (v[a]! < v[b]! ? 0 : 1),
    solve: {},
  },
  steps: {},
});

// ── Earthquakes, seismic waves and Earth's interior ──

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
    V('d', 'd', 'Distance to the focus', { unit: 'km', min: 1, max: 10000, step: 1 }),
    V('vp', 'vₚ', 'P-wave speed', { unit: 'km/s', min: 4, max: 14, step: 0.1 }),
    V('vs', 'vₛ', 'S-wave speed', { unit: 'km/s', min: 2, max: 8, step: 0.1 }),
    V('tp', 'tₚ', 'P arrival', { unit: 's', min: 0.01, max: 2500, step: 0.1, derived: true }),
    V('ts', 'tₛ', 'S arrival', { unit: 's', min: 0.01, max: 5000, step: 0.1, derived: true }),
    V('L', 'L', 'S − P lag', { unit: 's', min: 0.1, max: 1500, step: 0.1 }),
  ],
  ...rels(
    below('vs', 'vp', 'vₛ < vₚ', '{vs} is less than {vp}'),
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
      'Each km adds 1 ÷ vₛ − 1 ÷ vₚ seconds of lag; flip it for km per second of lag.',
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
    V('vp', 'vₚ', 'P-wave speed', { unit: 'km/s', min: 4, max: 14, step: 0.1 }),
    V('vs', 'vₛ', 'S-wave speed', { unit: 'km/s', min: 2, max: 8, step: 0.1 }),
    V('k', 'k', 'Distance per second of lag', {
      unit: 'km/s',
      min: 2,
      max: 1000,
      step: 0.1,
      derived: true,
    }),
    V('d1', 'd₁', 'Distance from station 1', { unit: 'km', min: 0.1, max: 100000, step: 1 }),
    V('d2', 'd₂', 'Distance from station 2', { unit: 'km', min: 0.1, max: 100000, step: 1 }),
    V('d3', 'd₃', 'Distance from station 3', { unit: 'km', min: 0.1, max: 100000, step: 1 }),
  ],
  ...rels(
    below('vs', 'vp', 'vₛ < vₚ', '{vs} is less than {vp}'),
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

/** Kilometres along Earth's surface per degree from the focus: π × 6371 ÷ 180. */
const KM_PER_DEG = (Math.PI * 6371) / 180;

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
    V('D', 'Δ', 'Angle from the focus', { unit: '°', min: 0, max: 180, step: 1 }),
    V('s', 's', 'Distance along the surface', { unit: 'km', min: 0, max: 20100, step: 1 }),
  ],
  ...rels(
    rule('s = Δ × π × 6371 ÷ 180', '{s} = {D} × π × 6371 ÷ 180', (v) => v.s! - v.D! * KM_PER_DEG, {
      s: [
        (v) => v.D! * KM_PER_DEG,
        '{D} × π × 6371 ÷ 180',
        'The angle’s share of 180°, times half the circumference, π × 6371 km.',
      ],
      D: [
        (v) => v.s! / KM_PER_DEG,
        '{s} × 180 ÷ (π × 6371)',
        'How many of the km in each degree fit into the distance.',
      ],
    }),
  ),
  example: { D: 120, s: 120 * KM_PER_DEG },
  startWith: ['D'],
  representation: { kind: 'earthLayers', mode: 'section', distance: 'D' },
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
        'Count the halvings with logs: how many times 2 goes into the drop.',
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
    V('p', 'p', 'C-14 left', { unit: '%', min: 0.01, max: 100, step: 0.01 }),
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
  ],
  variables: [
    V('R', 'R', 'Lead-206 atoms per U-238 atom', { min: 0, max: 15, step: 0.01 }),
    V('p', 'p', 'U-238 left', { unit: '%', min: 6.25, max: 100, step: 0.01, derived: true }),
    V('n', 'n', 'Half-lives passed', { min: 0, max: 4, step: 0.0001, derived: true }),
    V('t', 't', 'Age', { unit: 'years', min: 0, max: 1.8e10, step: 1000 }),
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
    V('P', 'P', 'U-235 left in the lower ash', { unit: '%', min: 50, max: 100, step: 0.01 }),
    V('n', 'n', 'Half-lives passed', { min: 0, max: 1, step: 0.0001, derived: true }),
    myr('t', 't', 'Age of the lower ash'),
    myr('u', 'u', 'Age of the upper ash'),
    myr('w', 'w', 'Width of the bracket', { derived: true }),
  ],
  ...rels(
    leftAfter('P', 'U-235'),
    fixedAge(U235_MA, '704'),
    below('u', 't', 'u < t', 'the upper ash {u} is younger than the lower ash {t}'),
    difference('w', 't', 'u', 'w = t − u', [
      'The shale is younger than the lower ash and older than the upper ash.',
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

export const SCIENCE_12_MODULES: ModuleDef[] = [
  earthInterior,
  epicenter,
  shadowZone,
  carbonDating,
  uranium,
  bracket,
];

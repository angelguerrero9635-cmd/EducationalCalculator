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
    V('t', 't', 'Echo time, down and back', { unit: 's', min: 0.01, max: 15, step: 0.01 }),
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
          '{m} × √(1 + 0.46^2 + 2 × 0.46 × cos(2 × {A}))',
          'Add the Moon’s and the Sun’s bulges at the angle between them.',
        ],
        m: [
          (v) => div(v.R!, tideRoot(v.A!)),
          '{R} ÷ √(1 + 0.46^2 + 2 × 0.46 × cos(2 × {A}))',
          'Undo the Sun’s share: divide the range by the same factor.',
        ],
        A: [
          (v) => {
            const k = ((v.R! / v.m!) ** 2 - 1 - 0.46 ** 2) / (2 * 0.46);
            if (!(k >= -1 - 1e-9 && k <= 1 + 1e-9)) return undefined;
            const a = (Math.acos(Math.max(-1, Math.min(1, k))) * 180) / Math.PI / 2;
            return [a, 180 - a];
          },
          'cos⁻¹((({R} ÷ {m})^2 − 1 − 0.46^2) ÷ (2 × 0.46)) ÷ 2',
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
    V('T', 'T', 'Temperature at h', { unit: '°C', min: -90, max: 50, step: 0.1 }),
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

export const SCIENCE_12_MODULES: ModuleDef[] = [
  earthInterior,
  epicenter,
  shadowZone,
  carbonDating,
  uranium,
  bracket,
  sonar,
  tides,
  lapse,
  pressureMap,
  humidity,
];

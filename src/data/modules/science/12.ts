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

export const SCIENCE_12_MODULES: ModuleDef[] = [earthInterior, epicenter, shadowZone];

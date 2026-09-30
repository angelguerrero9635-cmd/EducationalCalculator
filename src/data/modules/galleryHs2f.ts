/**
 * Grades 9–12 round 2 gallery demos (group H2F: earth and space (H103); see pictureRequestsHs.ts and
 * docs/HS_NEEDS.md). Each demo shows one option or part in a page stand-in: real variables,
 * relations, steps and a use line, so `scripts/promote-demo.mjs` can copy it into a grade file.
 * Spread into gallery.ts.
 */
import type { Relation, Values, VariableDef } from '@/engine/types';

import { div } from './helpers';
import type { LayoutDef } from './layouts';
import type { ModuleDef, StepText } from './types';

type Rel = { relation: Relation; steps: Record<string, StepText> };
type Solve = (v: Values) => number | number[] | undefined;

const V = (
  id: string,
  symbol: string,
  name: string,
  extra: Partial<VariableDef> = {},
): VariableDef => ({ id, symbol, name, ...extra });

const rels = (...rs: Rel[]) => ({
  relations: rs.map((r) => r.relation),
  steps: Object.fromEntries(rs.map((r) => [r.relation.id, r.steps])),
});

/** A relation from its id, display and residual, and per variable `[solve, expr, how]`. */
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

/** a = b × c, each way round. */
const product = (a: string, b: string, c: string, how: [string, string, string]) =>
  rule(`${a} = ${b} × ${c}`, `{${a}} = {${b}} × {${c}}`, (v) => v[a]! - v[b]! * v[c]!, {
    [a]: [(v) => v[b]! * v[c]!, `{${b}} × {${c}}`, how[0]],
    [b]: [(v) => div(v[a]!, v[c]!), `{${a}} ÷ {${c}}`, how[1]],
    [c]: [(v) => div(v[a]!, v[b]!), `{${a}} ÷ {${b}}`, how[2]],
  });

/** a = b ÷ c, each way round. */
const quotient = (a: string, b: string, c: string, how: [string, string, string]) =>
  rule(`${a} = ${b} ÷ ${c}`, `{${a}} = {${b}} ÷ {${c}}`, (v) => v[a]! * v[c]! - v[b]!, {
    [a]: [(v) => div(v[b]!, v[c]!), `{${b}} ÷ {${c}}`, how[0]],
    [b]: [(v) => v[a]! * v[c]!, `{${a}} × {${c}}`, how[1]],
    [c]: [(v) => div(v[b]!, v[a]!), `{${b}} ÷ {${a}}`, how[2]],
  });

/** a = b − c, each way round. */
const difference = (a: string, b: string, c: string, how: [string, string, string]) =>
  rule(`${a} = ${b} − ${c}`, `{${a}} = {${b}} − {${c}}`, (v) => v[a]! - (v[b]! - v[c]!), {
    [a]: [(v) => v[b]! - v[c]!, `{${b}} − {${c}}`, how[0]],
    [b]: [(v) => v[a]! + v[c]!, `{${a}} + {${c}}`, how[1]],
    [c]: [(v) => v[b]! - v[a]!, `{${b}} − {${a}}`, how[2]],
  });

// Keep the helpers referenced while later parts add their demos.
void product;

// ── Part 1: two seismograms by magnitude (earthLayers mode `magnitude`) ──

const mag = (id: string, symbol: string, name: string) =>
  V(id, symbol, name, { min: 0, max: 10, step: 0.1 });

const magnitude: ModuleDef = {
  id: 'g.s12-earth-interior-magnitude',
  title: 'Comparing earthquakes by magnitude',
  use: 'Use this for “A magnitude 6 quake and a magnitude 4 quake: how much more shaking, and how much more energy?”',
  assumptions: [
    'Magnitude is read from the largest swing of a seismogram, corrected for the station’s distance.',
    'Each step of 1 in magnitude is 10 times the ground motion and about 32 times the energy.',
    'Both quakes are measured on the same magnitude scale.',
  ],
  variables: [
    mag('M1', 'M₁', 'Magnitude of the first quake'),
    mag('M2', 'M₂', 'Magnitude of the second quake'),
    V('d', 'ΔM', 'Difference in magnitude', { min: -10, max: 10, step: 0.1, derived: true }),
    V('A', 'A', 'Amplitude ratio', { min: 1e-10, max: 1e10, step: 0.01, derived: true }),
    V('E', 'E', 'Energy ratio', { min: 1e-15, max: 1e15, step: 0.01, derived: true }),
  ],
  ...rels(
    difference('d', 'M2', 'M1', [
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

const magnitudeHalf: ModuleDef = {
  ...magnitude,
  id: 'g.s12-earth-interior-magnitude-half',
  title: 'Half a step of magnitude',
  use: 'Use this for quakes less than one magnitude apart, such as 5.5 and 6.',
  example: { M1: 5.5, M2: 6, d: 0.5, A: 10 ** 0.5, E: 10 ** 0.75 },
};

const magnitudeFar: ModuleDef = {
  ...magnitude,
  id: 'g.s12-earth-interior-magnitude-far',
  title: 'A great quake beside a small one',
  use: 'Use this for quakes far apart on the scale, such as 3 and 8.',
  example: { M1: 3, M2: 8, d: 5, A: 1e5, E: 10 ** 7.5 },
};

// ── Part 2: magnetic stripes on the seafloor (oceanProfile mode `stripes`) ──

const spreading: ModuleDef = {
  id: 'g.s12-earth-interior-spreading-rate',
  title: 'Seafloor spreading from magnetic stripes',
  use: 'Use this for “Rock 100 km from the ridge is 4 million years old. How fast is the seafloor spreading?”',
  assumptions: [
    'New seafloor forms at the ridge and moves away on both sides at the same rate.',
    'Cooling rock records the direction of Earth’s magnetic field, which has flipped many times, so the seafloor is striped the same on both sides.',
    'A kilometre per million years is a millimetre per year.',
  ],
  variables: [
    V('x', 'x', 'Distance from the ridge', { unit: 'km', min: 1, max: 1000, step: 1 }),
    V('t', 't', 'Age of the rock', { unit: 'million years', min: 0.1, max: 12, step: 0.01 }),
    V('v', 'v', 'Spreading rate, one side', {
      unit: 'mm/yr',
      min: 0.1,
      max: 10000,
      step: 0.1,
      derived: true,
    }),
    V('w', 'w', 'Full spreading rate', {
      unit: 'mm/yr',
      min: 0.2,
      max: 20000,
      step: 0.1,
      derived: true,
    }),
  ],
  ...rels(
    quotient('v', 'x', 't', [
      'The rock moved x kilometres in t million years; a kilometre per million years is a millimetre per year.',
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

const spreadingFast: ModuleDef = {
  ...spreading,
  id: 'g.s12-earth-interior-spreading-fast',
  title: 'A fast-spreading ridge',
  use: 'Use this for a fast ridge, where 4-million-year-old rock is 300 km out.',
  example: { x: 300, t: 4, v: 75, w: 150 },
};

const spreadingYoung: ModuleDef = {
  ...spreading,
  id: 'g.s12-earth-interior-spreading-young',
  title: 'Young rock near a slow ridge',
  use: 'Use this for a slow ridge and rock under a million years old, still in today’s stripe.',
  example: { x: 9, t: 0.6, v: 15, w: 30 },
};

// ── Part 3: a stream channel (new kind `streamChannel`) ──

const m = (id: string, symbol: string, name: string, unit: string, derived = false) =>
  V(id, symbol, name, { unit, min: 0.01, max: 100000, step: 0.01, derived });

const discharge: ModuleDef = {
  id: 'g.s12-surface-processes-discharge',
  title: 'A stream’s discharge',
  use: 'Use this for “A stream is 12 m wide and 1.5 m deep and flows at 0.8 m/s. What is its discharge?”',
  assumptions: [
    'Discharge is the volume of water that flows past a point each second.',
    'The channel is taken as a rectangle, and the speed is the average across it.',
    'A stream carries more sediment, and erodes faster, when its discharge rises in a flood.',
  ],
  variables: [
    m('w', 'w', 'Width of the water', 'm'),
    m('d', 'd', 'Depth of the water', 'm'),
    m('v', 'v', 'Flow speed', 'm/s'),
    m('A', 'A', 'Cross-section area', 'm²', true),
    m('Q', 'Q', 'Discharge', 'm³/s', true),
  ],
  ...rels(
    product('A', 'w', 'd', [
      'The cross-section is a rectangle, width by depth.',
      'Width: the area over the depth.',
      'Depth: the area over the width.',
    ]),
    product('Q', 'A', 'v', [
      'Each second a slab of water v metres long and A square metres across passes.',
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

const dischargeCreek: ModuleDef = {
  ...discharge,
  id: 'g.s12-surface-processes-discharge-creek',
  title: 'A small, fast creek',
  use: 'Use this for a narrow creek, deep for its width and flowing fast.',
  example: { w: 2, d: 0.8, v: 1.5, A: 1.6, Q: 2.4 },
};

const dischargeRiver: ModuleDef = {
  ...discharge,
  id: 'g.s12-surface-processes-discharge-river',
  title: 'A wide, slow river',
  use: 'Use this for a big river, far wider than it is deep.',
  example: { w: 400, d: 6, v: 1.2, A: 2400, Q: 2880 },
};

// ── Part 4: a rising air parcel (atmosphereLayers mode `parcel`) ──

const cloudBase: ModuleDef = {
  id: 'g.s12-atmosphere-weather-cloud-base',
  unitSystems: ['metric'],
  title: 'The height of a cloud’s base',
  use: 'Use this for “The air is 24 °C with a dew point of 12 °C. How high is the cloud base?”',
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
    rule('h = (T − Td) ÷ 8', '{h} = ({T} − {Td}) ÷ 8', (v) => 8 * v.h! - (v.T! - v.Td!), {
      h: [
        (v) => (v.T! - v.Td!) / 8,
        '({T} − {Td}) ÷ 8',
        'The gap closes 10 − 2 = 8 °C for each km the parcel rises.',
      ],
      T: [(v) => v.Td! + 8 * v.h!, '{Td} + 8 × {h}', 'The dew point plus 8 °C for each km.'],
      Td: [(v) => v.T! - 8 * v.h!, '{T} − 8 × {h}', 'The temperature less 8 °C for each km.'],
    }),
    {
      relation: {
        id: 'Td ≤ T',
        constraint: true,
        display: 'the dew point {Td} is at most the temperature {T}',
        vars: ['Td', 'T'],
        residual: (v: Values) => (v.Td! <= v.T! ? 0 : 1),
        solve: {},
      },
      steps: {},
    },
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

const cloudBaseHumid: ModuleDef = {
  ...cloudBase,
  id: 'g.s12-atmosphere-weather-cloud-base-humid',
  title: 'Low clouds on a humid day',
  use: 'Use this for humid air, where the dew point is close to the temperature.',
  example: { T: 30, Td: 26, h: 0.5 },
};

const cloudBaseDry: ModuleDef = {
  ...cloudBase,
  id: 'g.s12-atmosphere-weather-cloud-base-dry',
  title: 'High clouds over a desert',
  use: 'Use this for dry air, where the dew point is far below the temperature.',
  example: { T: 38, Td: 2, h: 4.5 },
};

export const HS2F_GALLERY_MODULES: ModuleDef[] = [
  cloudBase,
  cloudBaseHumid,
  cloudBaseDry,
  magnitude,
  magnitudeHalf,
  magnitudeFar,
  spreading,
  spreadingFast,
  spreadingYoung,
  discharge,
  dischargeCreek,
  dischargeRiver,
];

export const HS2F_GALLERY_LAYOUTS: LayoutDef[] = [];

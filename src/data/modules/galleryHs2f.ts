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

// ── Part 5: the energy balance as a calculator (atmosphereLayers mode `balance`) ──

const SIGMA = 5.67e-8;

const energyBalance: ModuleDef = {
  id: 'g.s12-climate-systems-energy-balance',
  unitSystems: ['metric'],
  title: 'Earth’s energy balance',
  use: 'Use this for “If Earth reflects 30 % of sunlight and has no greenhouse gases, how warm is it?”',
  assumptions: [
    'Sunlight falls on Earth’s disk but spreads over the whole globe, 4 times the disk’s area, so each square metre gets S ÷ 4 on average.',
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
    rule(
      'Tₑ = (F ÷ σ)^(1/4)',
      '{T} = ({F} ÷ (5.67 × 10⁻⁸))^(1/4)',
      (v) => v.T! - (Math.max(0, v.F!) / SIGMA) ** 0.25,
      {
        T: [
          (v) => (v.F! >= 0 ? (v.F! / SIGMA) ** 0.25 : undefined),
          '({F} ÷ (5.67 × 10⁻⁸))^(1/4)',
          'The temperature whose infrared, σTₑ⁴, carries away F.',
        ],
        F: [(v) => SIGMA * v.T! ** 4, '5.67 × 10⁻⁸ × {T}^4', 'A surface at Tₑ sends out σTₑ⁴.'],
      },
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

const energyBalanceIce: ModuleDef = {
  ...energyBalance,
  id: 'g.s12-climate-systems-energy-balance-ice',
  title: 'A snowball Earth',
  use: 'Use this for an icy Earth that reflects most of the sunlight.',
  example: { S: 1361, a: 0.6, F: (1361 * 0.4) / 4, T: ((1361 * 0.4) / 4 / SIGMA) ** 0.25 },
};

const energyBalanceMars: ModuleDef = {
  ...energyBalance,
  id: 'g.s12-climate-systems-energy-balance-mars',
  title: 'The balance on Mars',
  use: 'Use this for another planet: Mars gets 586 W/m² and reflects about 25 %.',
  example: { S: 586, a: 0.25, F: (586 * 0.75) / 4, T: ((586 * 0.75) / 4 / SIGMA) ** 0.25 },
};

// ── Part 6: a reserve drawn down (new kind `reserve`) ──

const reserves: ModuleDef = {
  id: 'g.s12-resource-management-reserves',
  unitSystems: ['metric'],
  title: 'How long a reserve lasts',
  use: 'Use this for “400 billion barrels of oil are used at 12.5 billion a year. How many years will they last?”',
  assumptions: [
    'Use and reserves stay the same.',
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
    quotient('y', 'Q', 'r', [
      'How many years of use the reserve holds.',
      'The reserve: the use each year times the years.',
      'The use each year: the reserve over the years.',
    ]),
  ),
  example: { Q: 400, r: 12.5, y: 32 },
  startWith: ['Q', 'r'],
  representation: { kind: 'reserve', reserve: 'Q', rate: 'r', years: 'y' },
};

const reservesSmall: ModuleDef = {
  ...reserves,
  id: 'g.s12-resource-management-reserves-field',
  title: 'A small oil field',
  use: 'Use this for a small reserve that lasts only a few years, part of a year at the end.',
  example: { Q: 2, r: 0.45, y: 2 / 0.45 },
};

const reservesLong: ModuleDef = {
  ...reserves,
  id: 'g.s12-resource-management-reserves-long',
  title: 'A reserve that lasts a century',
  use: 'Use this for a large reserve used slowly, over a hundred years.',
  example: { Q: 1100, r: 8, y: 137.5 },
};

// ── Part 8: a parent that decays two ways (rockLayers `dating.sample.second`) ──

const potassium: ModuleDef = {
  id: 'g.s12-radiometric-dating-potassium',
  title: 'Potassium-40: one parent, two daughters',
  use: 'Use this for dating volcanic ash by potassium-40, which decays to both calcium-40 and argon-40.',
  assumptions: [
    'Potassium-40 has a half-life of 1,250 million years: 89.3% of it decays to calcium-40 and 10.7% to argon-40.',
    'Argon is a gas that escapes molten rock but stays trapped once volcanic ash cools, so the argon clock starts at the eruption.',
    'Layers lie in order: younger above, older below.',
  ],
  variables: [
    V('P', 'P', 'Potassium-40 left', {
      unit: '%',
      min: 0.001,
      max: 100,
      step: 0.01,
      derived: true,
    }),
    V('n', 'n', 'Half-lives gone by', { min: 0, max: 12, step: 0.01 }),
    V('T', 'T', 'Half-life', { unit: 'million years', min: 1, max: 5000, step: 1 }),
    V('t', 't', 'Age of the ash bed', {
      unit: 'million years',
      min: 0,
      max: 60000,
      step: 0.1,
      derived: true,
    }),
  ],
  ...rels(
    rule('P = 100 × (1/2)^n', '{P} = 100 × (1/2)^{n}', (v) => v.P! - 100 * 0.5 ** v.n!, {
      P: [(v) => 100 * 0.5 ** v.n!, '100 × (1/2)^{n}', 'Each half-life halves what is left.'],
      n: [
        (v) => (v.P! > 0 ? Math.log2(100 / v.P!) : undefined),
        'log_2(100 ÷ {P})',
        'How many halvings take 100% down to P.',
      ],
    }),
    product('t', 'n', 'T', [
      'The age is the half-lives gone by times the length of one.',
      'Half-lives gone by: the age over the half-life.',
      'The half-life: the age over the half-lives gone by.',
    ]),
  ),
  example: { P: 50, n: 1, T: 1250, t: 1250 },
  startWith: ['n', 'T'],
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

// ── Part 9: mass on the H–R diagram (hrDiagram `mass`) ──

const lifetime: ModuleDef = {
  id: 'g.s12-stellar-evolution-lifetime',
  title: 'A star’s mass sets its life',
  use: 'Use this for “A star has twice the Sun’s mass. How bright is it, and how long will it last?”',
  assumptions: [
    'On the main sequence a star’s luminosity grows about as its mass to the power 3.5.',
    'Its life there is its fuel (its mass) over the rate it burns it (its luminosity): the Sun’s 10¹⁰ years × M^−2.5.',
    'Masses and luminosities are in Suns.',
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

const lifetimeDwarf: ModuleDef = {
  ...lifetime,
  id: 'g.s12-stellar-evolution-lifetime-dwarf',
  title: 'A red dwarf lives the longest',
  use: 'Use this for a small star, a fifth of the Sun’s mass, dim and very long-lived.',
  example: { M: 0.2, L: 0.2 ** 3.5, t: 1e10 * 0.2 ** -2.5 },
};

const lifetimeMassive: ModuleDef = {
  ...lifetime,
  id: 'g.s12-stellar-evolution-lifetime-massive',
  title: 'A massive star burns out fast',
  use: 'Use this for a star of 20 Suns, blue and brilliant for only a few million years.',
  example: { M: 20, L: 20 ** 3.5, t: 1e10 * 20 ** -2.5 },
};

export const HS2F_GALLERY_MODULES: ModuleDef[] = [
  lifetime,
  lifetimeDwarf,
  lifetimeMassive,
  potassium,
  reserves,
  reservesSmall,
  reservesLong,
  energyBalance,
  energyBalanceIce,
  energyBalanceMars,
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

// ── Part 7: spectra side by side (explore figure `spectra`) and ash in the greenhouse view ──

const spectraLayouts: LayoutDef[] = [
  {
    id: 'g.s12-starlight-spectra-lines',
    title: 'Matching a star’s lines to elements',
    kind: 'explore',
    use: 'Use this for “Which elements are in this star?” from its dark lines and lab spectra.',
    assumptions: [
      'Each element absorbs and gives off light only at its own wavelengths: its lines are a fingerprint.',
      'Cooler gas in a star’s outer layers absorbs those wavelengths, leaving dark lines in its rainbow.',
      'An element is in the star only if every one of its lines appears there.',
    ],
    figure: { kind: 'spectra' },
    scenes: [
      {
        label: 'The star',
        lines: [
          'The star’s light, spread into a rainbow, has dark lines where some wavelengths are missing.',
          'Below it are the bright lines of hydrogen, helium and sodium measured in a lab.',
        ],
        spectra: { star: ['H', 'Na'] },
      },
      {
        label: 'Hydrogen',
        lines: [
          'Each of hydrogen’s four visible lines lines up with a dark line in the star.',
          'The star contains hydrogen.',
        ],
        spectra: { star: ['H', 'Na'], lit: 'H' },
      },
      {
        label: 'Helium',
        lines: [
          'Helium’s yellow line sits close to sodium’s, but its blue and red lines have no dark line to match.',
          'Helium does not show in this star’s spectrum.',
        ],
        spectra: { star: ['H', 'Na'], lit: 'He' },
      },
      {
        label: 'Sodium',
        lines: [
          'Sodium’s pair of yellow lines and its fainter lines all match dark lines in the star.',
          'The star contains sodium.',
        ],
        spectra: { star: ['H', 'Na'], lit: 'Na' },
      },
    ],
  },
  {
    id: 'g.s12-climate-systems-particles',
    title: 'Ash and smoke in the energy balance',
    kind: 'explore',
    use: 'Use this for why a big eruption or large fires cool Earth for a year or two.',
    assumptions: [
      'Sunlight is mostly visible light, which passes through the air; the ground absorbs it and warms.',
      'Tiny particles of ash, sulfate and smoke high in the air reflect some sunlight back to space.',
      'The particles fall out of the air within a few years, so the cooling does not last.',
    ],
    figure: { kind: 'greenhouse' },
    scenes: [
      {
        label: 'Today',
        lines: [
          'Greenhouse gases send some infrared back down, warming the surface.',
          'With about 420 ppm of CO₂, the surface averages about 15 °C.',
        ],
        greenhouse: { view: 'energy', co2: 'today' },
      },
      {
        label: 'Ash and smoke',
        lines: [
          'Ash from a big eruption and smoke from fires add tiny particles high in the air.',
          'The particles reflect sunlight before it reaches the ground, which cools Earth for a year or two.',
        ],
        greenhouse: { view: 'energy', co2: 'today', particles: true },
      },
    ],
  },
];

export const HS2F_GALLERY_LAYOUTS: LayoutDef[] = [...spectraLayouts];

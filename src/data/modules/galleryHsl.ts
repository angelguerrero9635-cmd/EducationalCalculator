/**
 * Grades 9–12 gallery demos (group HL; see pictureRequestsHs.ts and docs/RENDERINGS_HS.md).
 * Each demo stands in for a planned page: real variables, relations, steps and a use line, so
 * `scripts/promote-demo.mjs` can copy it into a grade file. Spread into gallery.ts.
 *
 * Earth and space H71–H80: minerals and the Mohs scale, Earth's interior and earthquakes,
 * landforms, dated rock layers, the ocean, the atmosphere, the greenhouse effect, energy
 * sources, the H–R diagram and the expanding universe.
 */
import type { Relation, Values, VariableDef } from '@/engine/types';

import { div } from './helpers';
import type { LayoutDef } from './layouts';
import type { ModuleDef, StepText } from './types';

type Rel = { relation: Relation; steps: Record<string, StepText> };

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

/** a = b × c, with each way round. `how`: for a, for b, for c. */
function product(a: string, b: string, c: string, how: [string, string, string]): Rel {
  return {
    relation: {
      id: `${a} = ${b} × ${c}`,
      display: `{${a}} = {${b}} × {${c}}`,
      vars: [a, b, c],
      residual: (v: Values) => v[a]! - v[b]! * v[c]!,
      solve: {
        [a]: (v: Values) => v[b]! * v[c]!,
        [b]: (v: Values) => div(v[a]!, v[c]!),
        [c]: (v: Values) => div(v[a]!, v[b]!),
      },
    },
    steps: {
      [a]: { expr: `{${b}} × {${c}}`, how: how[0] },
      [b]: { expr: `{${a}} ÷ {${c}}`, how: how[1] },
      [c]: { expr: `{${a}} ÷ {${b}}`, how: how[2] },
    },
  };
}

/** a = b ÷ c, with each way round. */
function quotient(a: string, b: string, c: string, how: [string, string, string]): Rel {
  return {
    relation: {
      id: `${a} = ${b} ÷ ${c}`,
      display: `{${a}} = {${b}} ÷ {${c}}`,
      vars: [a, b, c],
      residual: (v: Values) => v[a]! * v[c]! - v[b]!,
      solve: {
        [a]: (v: Values) => div(v[b]!, v[c]!),
        [b]: (v: Values) => v[a]! * v[c]!,
        [c]: (v: Values) => div(v[b]!, v[a]!),
      },
    },
    steps: {
      [a]: { expr: `{${b}} ÷ {${c}}`, how: how[0] },
      [b]: { expr: `{${a}} × {${c}}`, how: how[1] },
      [c]: { expr: `{${b}} ÷ {${a}}`, how: how[2] },
    },
  };
}

/** a = b − c, with each way round. */
function difference(a: string, b: string, c: string, how: [string, string, string]): Rel {
  return {
    relation: {
      id: `${a} = ${b} − ${c}`,
      display: `{${a}} = {${b}} − {${c}}`,
      vars: [a, b, c],
      residual: (v: Values) => v[a]! - (v[b]! - v[c]!),
      solve: {
        [a]: (v: Values) => v[b]! - v[c]!,
        [b]: (v: Values) => v[a]! + v[c]!,
        [c]: (v: Values) => v[b]! - v[a]!,
      },
    },
    steps: {
      [a]: { expr: `{${b}} − {${c}}`, how: how[0] },
      [b]: { expr: `{${a}} + {${c}}`, how: how[1] },
      [c]: { expr: `{${b}} − {${a}}`, how: how[2] },
    },
  };
}

// ── H71: minerals and the Mohs scale ──

const MINERAL_WHY = [
  'A mineral is a natural, inorganic solid with a definite chemical makeup and an orderly crystal structure.',
  'Minerals are identified by their properties: luster, streak, hardness, cleavage or fracture, and density.',
];

const mineralLayouts: LayoutDef[] = [
  {
    id: 'g.s12-minerals-rocks-luster',
    title: 'Luster: metallic or nonmetallic',
    kind: 'sort',
    use: 'Use this for sorting minerals by how their surfaces reflect light.',
    assumptions: [
      ...MINERAL_WHY,
      'Luster is how a fresh surface reflects light: like polished metal, or glassy, pearly, silky or dull.',
    ],
    question: 'Does it shine like polished metal?',
    bins: [
      {
        id: 'metallic',
        label: 'Metallic luster',
        why: 'Opaque and shiny like metal; the streak is dark (pyrite’s greenish black, hematite’s red-brown).',
      },
      {
        id: 'nonmetallic',
        label: 'Nonmetallic luster',
        why: 'Glassy, pearly or dull: light passes into the crystal instead of bouncing off a metal surface.',
      },
    ],
    cards: [
      { label: 'Pyrite', bin: 'metallic', figure: { kind: 'icon', icon: 'pyrite' } },
      { label: 'Hematite', bin: 'metallic', figure: { kind: 'icon', icon: 'hematite' } },
      { label: 'Quartz', bin: 'nonmetallic', figure: { kind: 'icon', icon: 'quartz' } },
      { label: 'Feldspar', bin: 'nonmetallic', figure: { kind: 'icon', icon: 'feldspar' } },
      { label: 'Mica', bin: 'nonmetallic', figure: { kind: 'icon', icon: 'mica' } },
      { label: 'Calcite', bin: 'nonmetallic', figure: { kind: 'icon', icon: 'calcite' } },
      { label: 'Halite', bin: 'nonmetallic', figure: { kind: 'icon', icon: 'halite' } },
    ],
  },
  {
    id: 'g.s12-minerals-rocks-cleavage',
    title: 'Cleavage or fracture',
    kind: 'sort',
    use: 'Use this for telling minerals that split along flat planes from ones that break unevenly.',
    assumptions: [
      ...MINERAL_WHY,
      'Cleavage is splitting along flat planes where the bonds in the crystal are weakest.',
      'Fracture is breaking along curved or uneven surfaces, where the bonds are equally strong in every direction.',
    ],
    question: 'Does it split along flat planes?',
    bins: [
      {
        id: 'cleavage',
        label: 'Cleavage',
        why: 'Mica splits in one direction into sheets, feldspar in two at right angles, halite in three into cubes and calcite in three into rhombs.',
      },
      {
        id: 'fracture',
        label: 'Fracture',
        why: 'Quartz breaks in smooth curved shells, and pyrite and hematite break unevenly.',
      },
    ],
    cards: [
      { label: 'Mica', bin: 'cleavage', figure: { kind: 'icon', icon: 'mica' } },
      { label: 'Feldspar', bin: 'cleavage', figure: { kind: 'icon', icon: 'feldspar' } },
      { label: 'Halite', bin: 'cleavage', figure: { kind: 'icon', icon: 'halite' } },
      { label: 'Calcite', bin: 'cleavage', figure: { kind: 'icon', icon: 'calcite' } },
      { label: 'Quartz', bin: 'fracture', figure: { kind: 'icon', icon: 'quartz' } },
      { label: 'Pyrite', bin: 'fracture', figure: { kind: 'icon', icon: 'pyrite' } },
      { label: 'Hematite', bin: 'fracture', figure: { kind: 'icon', icon: 'hematite' } },
    ],
  },
  {
    id: 'g.s12-minerals-rocks-mohs',
    title: 'The Mohs hardness scale',
    kind: 'explore',
    use: 'Use this for estimating a mineral’s hardness from what scratches it and what it scratches.',
    assumptions: [
      'Hardness is how well a mineral resists being scratched.',
      'The Mohs scale ranks ten minerals from talc (1) to diamond (10); each scratches every mineral ranked below it.',
      'Everyday tools fit between them: a fingernail is about 2.5, a copper coin 3.5, glass 5.5 and a steel file 6.5.',
    ],
    figure: { kind: 'mohsScale' },
    scenes: [
      {
        label: 'The scale',
        lines: [
          'The ten minerals are ranked by which scratches which.',
          'The dashed lines show where the everyday scratch tools fit.',
        ],
        mohs: {},
      },
      {
        label: 'Quartz scratches glass',
        lines: [
          'Quartz, at 7, is harder than glass at 5.5, so it scratches a glass plate.',
          'Topaz, corundum and diamond scratch quartz.',
        ],
        mohs: { lit: 7 },
      },
      {
        label: 'An unknown mineral',
        lines: [
          'An unknown mineral scratches glass, but a steel file scratches it.',
          'Its hardness is between 5.5 and 6.5: orthoclase feldspar, at 6, fits.',
        ],
        mohs: { between: [5.5, 6.5], lit: 6 },
      },
      {
        label: 'Softer than a fingernail',
        lines: [
          'A fingernail scratches talc and gypsum, so both are softer than 2.5.',
          'Talc, at 1, feels soapy and is the softest mineral on the scale.',
        ],
        mohs: { between: [1, 2.5], lit: 1 },
      },
      {
        label: 'Absolute hardness',
        lines: [
          'The ranks are equal steps, but the hardness is not.',
          'Diamond, at 10, is about 15 times as hard as quartz at 7, and almost 4 times as hard as corundum at 9.',
        ],
        mohs: { absolute: true, lit: 10 },
      },
    ],
  },
];

// ── H72: Earth's interior and earthquakes ──

const QUAKE_WHY = [
  'An earthquake sends out P waves (push-pull, the fastest) and S waves (side to side, slower); surface waves come last.',
  'P waves travel through solids and liquids; S waves travel only through solids.',
];

/** Kilometres along Earth's surface per degree from the focus: 2π × 6371 ÷ 360. */
const KM_PER_DEG = (Math.PI * 6371) / 180;

const shadowZone: ModuleDef = {
  id: 'g.s12-earth-interior-shadow-zone',
  title: 'The shadow zones: which waves reach a station',
  use: 'Use this for which seismic waves reach a station a given angle from an earthquake, and why.',
  assumptions: [
    ...QUAKE_WHY,
    'Wave speed rises with depth, so paths through the mantle curve back up to the surface.',
    'No S waves arrive past 104° from the focus: the outer core is liquid. P waves bend at the core, leaving a P shadow zone from 104° to 140°.',
    'Distance along the surface is the angle’s share of Earth’s circumference, with a radius of 6,371 km.',
  ],
  variables: [
    V('D', 'Δ', 'Angle from the focus', { unit: '°', min: 0, max: 180, step: 1 }),
    V('s', 's', 'Distance along the surface', { unit: 'km', min: 0, max: 20100, step: 1 }),
  ],
  ...rels({
    relation: {
      id: 's = Δ × π × 6371 ÷ 180',
      display: '{s} = {D} × π × 6371 ÷ 180',
      vars: ['s', 'D'],
      residual: (v: Values) => v.s! - v.D! * KM_PER_DEG,
      solve: { s: (v: Values) => v.D! * KM_PER_DEG, D: (v: Values) => v.s! / KM_PER_DEG },
    },
    steps: {
      s: {
        expr: '{D} × π × 6371 ÷ 180',
        how: 'The angle’s share of the half circle, times half the circumference π × 6371 km.',
      },
      D: {
        expr: '{s} × 180 ÷ (π × 6371)',
        how: 'How many of the km per degree fit into the distance.',
      },
    },
  }),
  example: { D: 120, s: 120 * KM_PER_DEG },
  startWith: ['D'],
  representation: { kind: 'earthLayers', mode: 'section', distance: 'D' },
};

const shadowDirect: ModuleDef = {
  ...shadowZone,
  id: 'g.s12-earth-interior-shadow-direct',
  title: 'A station that gets both waves',
  use: 'Use this for a station close enough that P and S waves reach it through the mantle.',
  example: { D: 60, s: 60 * KM_PER_DEG },
};

const shadowCore: ModuleDef = {
  ...shadowZone,
  id: 'g.s12-earth-interior-shadow-core',
  title: 'A station past the core',
  use: 'Use this for a station on the far side of Earth, reached only by P waves through the core.',
  example: { D: 160, s: 160 * KM_PER_DEG },
};

const shadowEdge: ModuleDef = {
  ...shadowZone,
  id: 'g.s12-earth-interior-shadow-edge',
  title: 'The edge of the shadow zone',
  use: 'Use this for the 104° path that just grazes the core, where both shadow zones begin.',
  example: { D: 104, s: 104 * KM_PER_DEG },
};

const kmv = (id: string, symbol: string, name: string, derived = false) =>
  V(id, symbol, name, { unit: 'km', min: 1, max: 20000, step: 1, derived });
const sec = (id: string, symbol: string, name: string, derived = false) =>
  V(id, symbol, name, { unit: 's', min: 0.1, max: 5000, step: 0.1, derived });
const speed = (id: string, symbol: string, name: string) =>
  V(id, symbol, name, { unit: 'km/s', min: 0.5, max: 15, step: 0.1 });

const seismogram: ModuleDef = {
  id: 'g.s12-earth-interior-seismogram',
  title: 'Reading a seismogram: the S − P lag',
  use: 'Use this for when the P and S waves reach a station, and the lag between them.',
  assumptions: [
    ...QUAKE_WHY,
    'Each wave’s travel time is the distance divided by its speed; here P waves travel at about 6 km/s and S waves at 3.5 km/s in the crust.',
    'The farther the station, the longer the gap between the P and S arrivals.',
  ],
  variables: [
    kmv('d', 'd', 'Distance to the earthquake'),
    speed('vp', 'vₚ', 'P-wave speed'),
    speed('vs', 'vₛ', 'S-wave speed'),
    sec('tp', 'tₚ', 'P travel time', true),
    sec('ts', 'tₛ', 'S travel time', true),
    sec('L', 'L', 'S − P lag', true),
  ],
  ...rels(
    quotient('tp', 'd', 'vp', [
      'Travel time is the distance over the P wave’s speed.',
      'Distance is speed times time.',
      'Speed is distance over time.',
    ]),
    quotient('ts', 'd', 'vs', [
      'Travel time is the distance over the S wave’s speed.',
      'Distance is speed times time.',
      'Speed is distance over time.',
    ]),
    {
      relation: {
        id: 'vₛ < vₚ',
        constraint: true,
        display: '{vs} is less than {vp}',
        vars: ['vs', 'vp'],
        residual: (v: Values) => (v.vs! < v.vp! ? 0 : 1),
        solve: {},
      },
      steps: {},
    },
    difference('L', 'ts', 'tp', [
      'The S wave arrives this long after the P wave.',
      'The S wave arrives the lag after the P wave.',
      'The P wave arrives the lag before the S wave.',
    ]),
  ),
  example: { d: 420, vp: 6, vs: 3.5, tp: 70, ts: 120, L: 50 },
  startWith: ['d', 'vp', 'vs'],
  representation: {
    kind: 'earthLayers',
    mode: 'seismogram',
    km: 'd',
    vp: 'vp',
    vs: 'vs',
    lag: 'L',
  },
};

const seismogramNear: ModuleDef = {
  ...seismogram,
  id: 'g.s12-earth-interior-seismogram-near',
  title: 'A seismogram close to the earthquake',
  use: 'Use this for a station near the earthquake, where the P and S waves arrive only seconds apart.',
  example: { d: 35, vp: 6, vs: 3.5, tp: 35 / 6, ts: 10, L: 10 - 35 / 6 },
};

const epicenter: ModuleDef = {
  id: 'g.s12-earth-interior-epicenter',
  title: 'Locating an epicenter from three stations',
  use: 'Use this for finding an epicenter from three stations’ S − P lags.',
  assumptions: [
    ...QUAKE_WHY,
    'Each second of S − P lag means the same extra distance: here k = vₚ × vₛ ÷ (vₚ − vₛ) = 6 × 3.5 ÷ 2.5 = 8.4 km.',
    'Each station’s distance draws a circle round it: the epicenter is on that circle.',
    'Two circles cross at two points; the third circle picks the one where all three meet.',
  ],
  variables: [
    V('k', 'k', 'Distance per second of lag', { unit: 'km/s', min: 1, max: 20, step: 0.1 }),
    sec('t1', 'L₁', 'Lag at station 1'),
    sec('t2', 'L₂', 'Lag at station 2'),
    sec('t3', 'L₃', 'Lag at station 3'),
    kmv('d1', 'd₁', 'Distance from station 1', true),
    kmv('d2', 'd₂', 'Distance from station 2', true),
    kmv('d3', 'd₃', 'Distance from station 3', true),
  ],
  ...rels(
    ...(
      [
        ['d1', 't1'],
        ['d2', 't2'],
        ['d3', 't3'],
      ] as const
    ).map(([d, t]) =>
      product(d, 'k', t, [
        'Each second of lag is k more kilometres from the station.',
        'The kilometres per second of lag.',
        'How many seconds of lag cover the distance.',
      ]),
    ),
  ),
  example: { k: 8.4, t1: 25, t2: 10, t3: 25, d1: 210, d2: 84, d3: 210 },
  startWith: ['k', 't1', 't2', 't3'],
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

// ── H73: landforms ──

const landformLayouts: LayoutDef[] = [
  {
    id: 'g.s12-volcanoes-mountains-volcanoes',
    title: 'Three kinds of volcano',
    kind: 'explore',
    use: 'Use this for telling shield volcanoes, composite volcanoes and cinder cones apart by shape and eruption.',
    assumptions: [
      'A volcano’s shape depends on its magma: runny, low-silica basalt flows far; thick, silica-rich magma traps gas and explodes.',
      'Each drawing is a cross-section, not to the same scale: shields are the widest, cinder cones the smallest.',
    ],
    figure: { kind: 'landforms' },
    scenes: [
      {
        label: 'Shield volcano',
        lines: [
          'Runny basalt lava flows far before it cools, building a broad dome with gentle slopes.',
          'Eruptions are mostly quiet lava flows, as in Hawaii.',
        ],
        landform: { kind: 'shield' },
      },
      {
        label: 'Composite volcano',
        lines: [
          'Thick, gassy magma erupts explosively, then as lava: layers of ash and lava build a tall, steep cone.',
          'Composite volcanoes, such as Mount St. Helens, are the most dangerous.',
        ],
        landform: { kind: 'composite' },
      },
      {
        label: 'Cinder cone',
        lines: [
          'Gas-rich lava blasts into the air and falls as cinders, piling up at their steepest stable slope.',
          'Cinder cones are small and often erupt only once; lava may leak out from the base.',
        ],
        landform: { kind: 'cinderCone' },
      },
    ],
  },
  {
    id: 'g.s12-volcanoes-mountains-deformation',
    title: 'Folds and faults',
    kind: 'explore',
    use: 'Use this for matching folds and faults to the stress that made them.',
    assumptions: [
      'Stress on rock is compression (squeezing), tension (pulling apart) or shear (sliding past).',
      'Rock deep and warm bends into folds; rock near the surface breaks along faults.',
      'On a sloping fault, the hanging wall is the block above the fault and the footwall the block below.',
    ],
    figure: { kind: 'landforms' },
    scenes: [
      {
        label: 'Folds',
        lines: [
          'Compression bends layers into arches (anticlines) and troughs (synclines).',
          'Eroded down, an anticline shows its oldest rock in the middle.',
        ],
        landform: { kind: 'folds' },
      },
      {
        label: 'Normal fault',
        lines: [
          'Tension pulls the crust apart, and the hanging wall slips down the fault.',
          'Normal faults form at divergent boundaries and rift valleys.',
        ],
        landform: { kind: 'normalFault' },
      },
      {
        label: 'Reverse fault',
        lines: [
          'Compression pushes the hanging wall up the fault, stacking older rock on younger.',
          'Reverse faults form where plates collide and build mountains.',
        ],
        landform: { kind: 'reverseFault' },
      },
      {
        label: 'Strike-slip fault',
        lines: [
          'Shear slides the blocks past each other sideways, offsetting streams, fences and roads.',
          'The San Andreas Fault is a strike-slip fault at a transform boundary.',
        ],
        landform: { kind: 'strikeSlip' },
      },
    ],
  },
  {
    id: 'g.s12-surface-processes-landforms',
    title: 'Landforms shaped by water, ice and wind',
    kind: 'explore',
    use: 'Use this for recognizing the landforms rivers, glaciers, groundwater and wind leave behind.',
    assumptions: [
      'Weathering breaks rock down; erosion carries the pieces away; deposition drops them.',
      'Each agent leaves its own shapes, so a landform tells what made it.',
    ],
    figure: { kind: 'landforms' },
    scenes: [
      {
        label: 'V-shaped valley',
        lines: [
          'A river cuts down into its bed, and the sides wear back into a narrow V.',
          'V-shaped valleys are common in young mountain streams.',
        ],
        landform: { kind: 'vValley' },
      },
      {
        label: 'U-shaped valley',
        lines: [
          'A valley glacier scrapes its sides and floor, widening a V into a U with steep walls.',
          'When the ice melts, the broad flat floor is left behind.',
        ],
        landform: { kind: 'uValley' },
      },
      {
        label: 'Meandering river',
        lines: [
          'On flat land a river swings in loops: fast water on the outside of a bend erodes the cut bank.',
          'Slow water on the inside drops sand in a point bar; a cut-off loop becomes an oxbow lake.',
        ],
        landform: { kind: 'meander' },
      },
      {
        label: 'Aquifer',
        lines: [
          'Rain soaks down to the water table; below it, water fills the spaces in the rock.',
          'A permeable layer that holds and passes water is an aquifer; a well must reach below the water table.',
        ],
        landform: { kind: 'aquifer' },
      },
      {
        label: 'Sand dune',
        lines: [
          'Wind bounces sand up the gentle windward side; at the crest it slides down the steep slip face.',
          'Grain by grain, the dune creeps downwind.',
        ],
        landform: { kind: 'dunes' },
      },
    ],
  },
];

// ── H74: dated rock layers ──

const my = (id: string, symbol: string, name: string, derived = false) =>
  V(id, symbol, name, { unit: 'million years', min: 0, max: 4600, step: 0.1, derived });

/** A < B, checked only (a rule the values must keep). */
const younger = (a: string, b: string, display: string): Rel => ({
  relation: {
    id: `${a} < ${b}`,
    constraint: true,
    display,
    vars: [a, b],
    residual: (v: Values) => (v[a]! < v[b]! ? 0 : 1),
    solve: {},
  },
  steps: {},
});

const halfLife: ModuleDef = {
  id: 'g.s12-radiometric-dating-half-life',
  title: 'Dating an ash bed by half-lives',
  use: 'Use this for an ash bed’s age from the share of its parent isotope left.',
  assumptions: [
    'A radioactive parent isotope decays to a stable daughter at a steady rate: half of it is left after each half-life.',
    'Potassium-40 has a half-life of 1,250 million years: 89.3% of it decays to calcium-40 and 10.7% to argon-40, a gas that stays trapped once volcanic ash cools.',
    'Layers lie in order: younger above, older below. Fossils above the ash bed are younger than it, and those below are older.',
  ],
  variables: [
    V('P', 'P', 'Parent left', { unit: '%', min: 0.001, max: 100, step: 0.01, derived: true }),
    V('n', 'n', 'Half-lives gone by', { min: 0, max: 20, step: 0.01 }),
    my('T', 'T', 'Half-life'),
    my('t', 't', 'Age of the ash bed', true),
  ],
  ...rels(
    {
      relation: {
        id: 'P = 100 × (1/2)^n',
        display: '{P} = 100 × (1/2)^{n}',
        vars: ['P', 'n'],
        residual: (v: Values) => v.P! - 100 * 0.5 ** v.n!,
        solve: {
          P: (v: Values) => 100 * 0.5 ** v.n!,
          n: (v: Values) => (v.P! > 0 ? Math.log2(100 / v.P!) : undefined),
        },
      },
      steps: {
        P: { expr: '100 × (1/2)^{n}', how: 'Each half-life halves what is left.' },
        n: { expr: 'log_2(100 ÷ {P})', how: 'How many halvings take 100% down to P.' },
      },
    },
    product('t', 'n', 'T', [
      'The age is the half-lives gone by times the length of one.',
      'Half-lives gone by: the age over the half-life.',
      'The half-life: the age over the half-lives gone by.',
    ]),
  ),
  example: { P: 100 * 0.5 ** 0.2, n: 0.2, T: 1250, t: 250 },
  startWith: ['n', 'T'],
  representation: {
    kind: 'rockLayers',
    dating: {
      layers: [
        { rock: 'sandstone', fossil: 'ammonite' },
        { rock: 'shale' },
        { rock: 'ash', age: 't' },
        { rock: 'limestone', fossil: 'trilobite' },
        { rock: 'siltstone' },
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

const halfLifeYoung: ModuleDef = {
  ...halfLife,
  id: 'g.s12-radiometric-dating-young',
  title: 'A young ash bed: little decay yet',
  use: 'Use this for a young rock, where only a sliver of the parent has decayed.',
  example: { P: 100 * 0.5 ** 0.02, n: 0.02, T: 1250, t: 25 },
  representation: {
    kind: 'rockLayers',
    dating: {
      layers: [
        { rock: 'conglomerate' },
        { rock: 'sandstone', fossil: 'fern' },
        { rock: 'ash', age: 't' },
        { rock: 'shale' },
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

const bracket: ModuleDef = {
  id: 'g.s12-radiometric-dating-bracket',
  title: 'Bracketing a fossil layer’s age',
  use: 'Use this for the age range of an undated layer from dated rocks above, below and across it.',
  assumptions: [
    'Superposition: a layer is younger than the layers under it and older than those on top.',
    'Cross-cutting: a dike is younger than every layer it cuts, and older than the layers it does not reach.',
    'Sediment can’t be dated directly, so its age is bracketed by the ash beds and dikes around it.',
  ],
  variables: [
    my('a', 'a', 'Age of the upper ash bed'),
    my('i', 'i', 'Age of the dike'),
    my('b', 'b', 'Age of the lower ash bed'),
    my('w', 'w', 'Width of the bracket', true),
  ],
  ...rels(
    younger('a', 'i', 'the upper ash bed {a} is younger than the dike {i}'),
    younger('i', 'b', 'the dike {i} is younger than the lower ash bed {b}'),
    younger('a', 'b', 'the upper ash bed {a} is younger than the lower ash bed {b}'),
    difference('w', 'i', 'a', [
      'The shale is younger than the dike and older than the upper ash bed.',
      'The dike is the bracket’s width older than the upper ash bed.',
      'The upper ash bed is the bracket’s width younger than the dike.',
    ]),
  ),
  example: { a: 150, i: 180, b: 200, w: 30 },
  startWith: ['a', 'i', 'b'],
  representation: {
    kind: 'rockLayers',
    dating: {
      layers: [
        { rock: 'sandstone' },
        { rock: 'ash', age: 'a' },
        { rock: 'shale', fossil: 'ammonite' },
        { rock: 'limestone' },
        { rock: 'ash', age: 'b' },
        { rock: 'siltstone' },
      ],
      intrusion: { through: 3, age: 'i' },
      bracket: 2,
    },
  },
};

// ── H75: the ocean ──

const sonar: ModuleDef = {
  id: 'g.s12-ocean-atmosphere-sonar',
  title: 'Sounding the seafloor with sonar',
  use: 'Use this for the depth of the seafloor from a sonar echo’s round-trip time.',
  assumptions: [
    'A ship’s sonar sends a pulse of sound down; it bounces off the seafloor and returns.',
    'Sound travels about 1,500 m/s in seawater, and the echo’s time covers the trip down and back.',
    'Across an ocean the floor drops from the continental shelf down the slope and rise to the abyssal plain, climbs to a mid-ocean ridge, and plunges into trenches.',
  ],
  variables: [
    V('t', 't', 'Echo time, down and back', { unit: 's', min: 0.01, max: 20, step: 0.01 }),
    V('v', 'v', 'Speed of sound in seawater', { unit: 'm/s', min: 1400, max: 1600, step: 1 }),
    V('d', 'd', 'Depth', { unit: 'm', min: 1, max: 11000, step: 1, derived: true }),
  ],
  ...rels({
    relation: {
      id: 'd = v × t ÷ 2',
      display: '{d} = {v} × {t} ÷ 2',
      vars: ['d', 'v', 't'],
      residual: (v: Values) => v.d! - (v.v! * v.t!) / 2,
      solve: {
        d: (v: Values) => (v.v! * v.t!) / 2,
        t: (v: Values) => div(2 * v.d!, v.v!),
        v: (v: Values) => div(2 * v.d!, v.t!),
      },
    },
    steps: {
      d: {
        expr: '{v} × {t} ÷ 2',
        how: 'Distance down and back is speed times time; the depth is half of it.',
      },
      t: {
        expr: '2 × {d} ÷ {v}',
        how: 'The sound goes down and back: twice the depth, over its speed.',
      },
      v: { expr: '2 × {d} ÷ {t}', how: 'Twice the depth, over the echo’s time.' },
    },
  }),
  example: { t: 6, v: 1500, d: 4500 },
  startWith: ['t', 'v'],
  representation: { kind: 'oceanProfile', mode: 'profile', depth: 'd', over: 'plain' },
};

const sonarRidge: ModuleDef = {
  ...sonar,
  id: 'g.s12-ocean-atmosphere-sonar-ridge',
  title: 'Sonar over a mid-ocean ridge',
  use: 'Use this for a sounding over a mid-ocean ridge, where the floor rises toward the surface.',
  example: { t: 3.4, v: 1500, d: 2550 },
  representation: { kind: 'oceanProfile', mode: 'profile', depth: 'd', over: 'ridge' },
};

const sonarTrench: ModuleDef = {
  ...sonar,
  id: 'g.s12-ocean-atmosphere-sonar-trench',
  title: 'Sonar over a deep trench',
  use: 'Use this for a sounding over an ocean trench, the deepest parts of the ocean.',
  example: { t: 14, v: 1500, d: 10500 },
  representation: { kind: 'oceanProfile', mode: 'profile', depth: 'd', over: 'trench' },
};

const TIDE = 'Math.sqrt(1 + 0.46 ** 2 + 2 * 0.46 * cos(2A))';
const tideRoot = (deg: number) =>
  Math.sqrt(1 + 0.46 ** 2 + 2 * 0.46 * Math.cos((2 * deg * Math.PI) / 180));

const tides: ModuleDef = {
  id: 'g.s12-ocean-atmosphere-tides',
  title: 'Spring and neap tides',
  use: 'Use this for the tidal range from the Moon’s angle to the Sun: spring, neap or between.',
  assumptions: [
    'The Moon’s pull raises two bulges of ocean, one facing it and one opposite; Earth turns through both each day.',
    'The Sun raises bulges too, about 0.46 as high. In line (new and full moon) they add: spring tides.',
    'At right angles (the quarter moons) they partly cancel: neap tides. The range is m × √(1 + 0.46² + 2 × 0.46 × cos 2θ).',
  ],
  variables: [
    V('m', 'm', 'Range from the Moon alone', { unit: 'm', min: 0.1, max: 10, step: 0.01 }),
    V('A', 'θ', 'Moon’s angle from the Sun', { unit: '°', min: 0, max: 180, step: 1 }),
    V('R', 'R', 'Tidal range', { unit: 'm', min: 0.01, max: 20, step: 0.01, derived: true }),
  ],
  ...rels({
    relation: {
      id: `R = m × ${TIDE}`,
      display: '{R} = {m} × √(1 + 0.46² + 2 × 0.46 × cos(2 × {A}))',
      vars: ['R', 'm', 'A'],
      residual: (v: Values) => v.R! - v.m! * tideRoot(v.A!),
      solve: {
        R: (v: Values) => v.m! * tideRoot(v.A!),
        m: (v: Values) => div(v.R!, tideRoot(v.A!)),
        A: (v: Values) => {
          const k = ((v.R! / v.m!) ** 2 - 1 - 0.46 ** 2) / (2 * 0.46);
          if (!(k >= -1 - 1e-9 && k <= 1 + 1e-9)) return undefined;
          const a = (Math.acos(Math.max(-1, Math.min(1, k))) * 180) / Math.PI / 2;
          return [a, 180 - a];
        },
      },
    },
    steps: {
      R: {
        expr: '{m} × √(1 + 0.46^2 + 2 × 0.46 × cos(2 × {A}))',
        how: 'Add the Moon’s and the Sun’s bulges at the angle between them.',
      },
      m: {
        expr: '{R} ÷ √(1 + 0.46^2 + 2 × 0.46 × cos(2 × {A}))',
        how: 'Undo the Sun’s share: divide the range by the same factor.',
      },
      A: {
        expr: 'cos⁻¹((({R} ÷ {m})^2 − 1 − 0.46^2) ÷ (2 × 0.46)) ÷ 2',
        how: 'Solve the range rule for cos 2θ, then take the inverse cosine and halve it.',
      },
    },
  }),
  example: { m: 2, A: 0, R: 2 * tideRoot(0) },
  startWith: ['m', 'A'],
  representation: { kind: 'oceanProfile', mode: 'tides', angle: 'A', range: 'R' },
};

const tidesNeap: ModuleDef = {
  ...tides,
  id: 'g.s12-ocean-atmosphere-tides-neap',
  title: 'Neap tides at the quarter moon',
  use: 'Use this for the small tidal range when the Moon is at right angles to the Sun.',
  example: { m: 2, A: 90, R: 2 * tideRoot(90) },
};

const tidesFull: ModuleDef = {
  ...tides,
  id: 'g.s12-ocean-atmosphere-tides-full',
  title: 'Spring tides at the full moon',
  use: 'Use this for the full moon, on the far side of Earth from the Sun: spring tides again.',
  example: { m: 2, A: 180, R: 2 * tideRoot(180) },
};

const currentsLayouts: LayoutDef[] = [
  {
    id: 'g.s12-ocean-atmosphere-currents',
    title: 'Surface currents and the deep conveyor',
    kind: 'explore',
    use: 'Use this for how winds drive surface currents in gyres, and how cold salty water drives the deep conveyor.',
    assumptions: [
      'Winds drag the surface water; the Coriolis effect and the continents turn it into great loops called gyres.',
      'Currents flowing toward the poles carry warm water; those flowing toward the equator carry cold water.',
      'Deep currents are driven by density: cold, salty water sinks and spreads along the ocean floor.',
    ],
    figure: { kind: 'oceanCurrents' },
    scenes: [
      {
        label: 'Surface gyres',
        lines: [
          'Gyres turn clockwise in the Northern Hemisphere and counterclockwise in the Southern.',
          'Warm currents like the Gulf Stream run poleward along the west of each ocean; cold ones like the California Current run back along the east.',
        ],
        currents: { view: 'gyres' },
      },
      {
        label: 'The deep conveyor',
        lines: [
          'Near Greenland, cold salty water is dense enough to sink; it flows south along the bottom and round Antarctica.',
          'It rises in the Indian and Pacific Oceans and returns at the surface: one loop takes about 1,000 years.',
        ],
        currents: { view: 'conveyor' },
      },
    ],
  },
];

// ── H76: the atmosphere ──

const lapse: ModuleDef = {
  id: 'g.s12-atmosphere-weather-layers',
  title: 'Temperature through the atmosphere',
  use: 'Use this for the air temperature at a height in the troposphere, and the layers above it.',
  assumptions: [
    'The atmosphere has four layers, set apart by how temperature changes with height.',
    'In the troposphere, where weather happens, air cools about 6.5 °C for each km up, to the tropopause near 11 km.',
    'Ozone absorbs ultraviolet light, so the stratosphere warms with height; the mesosphere cools again, and the thin thermosphere heats up.',
  ],
  variables: [
    V('T0', 'T₀', 'Temperature at the ground', { unit: '°C', min: -40, max: 50, step: 0.1 }),
    V('h', 'h', 'Height', { unit: 'km', min: 0.01, max: 11, step: 0.1 }),
    V('T', 'T', 'Temperature at that height', {
      unit: '°C',
      min: -120,
      max: 50,
      step: 0.1,
      derived: true,
    }),
  ],
  ...rels({
    relation: {
      id: 'T = T₀ − 6.5 × h',
      display: '{T} = {T0} − 6.5 × {h}',
      vars: ['T', 'T0', 'h'],
      residual: (v: Values) => v.T! - (v.T0! - 6.5 * v.h!),
      solve: {
        T: (v: Values) => v.T0! - 6.5 * v.h!,
        T0: (v: Values) => v.T! + 6.5 * v.h!,
        h: (v: Values) => (v.T0! - v.T!) / 6.5,
      },
    },
    steps: {
      T: { expr: '{T0} − 6.5 × {h}', how: 'Take off 6.5 °C for each km of height.' },
      T0: { expr: '{T} + 6.5 × {h}', how: 'Add back the 6.5 °C lost for each km.' },
      h: { expr: '({T0} − {T}) ÷ 6.5', how: 'How many 6.5 °C drops make the difference.' },
    },
  }),
  example: { T0: 15, h: 8, T: -37 },
  startWith: ['T0', 'h'],
  representation: {
    kind: 'atmosphereLayers',
    mode: 'profile',
    altitude: 'h',
    temperature: 'T',
    ground: 'T0',
  },
};

const lapseTop: ModuleDef = {
  ...lapse,
  id: 'g.s12-atmosphere-weather-tropopause',
  title: 'At the tropopause',
  use: 'Use this for the top of the troposphere, where the cooling with height stops.',
  example: { T0: 15, h: 11, T: 15 - 6.5 * 11 },
};

const lapseHot: ModuleDef = {
  ...lapse,
  id: 'g.s12-atmosphere-weather-hot-day',
  title: 'A hot day: the air a few km up',
  use: 'Use this for a warm ground temperature and the air above it.',
  example: { T0: 30, h: 3, T: 30 - 6.5 * 3 },
};

const hpa = (id: string, symbol: string, name: string) =>
  V(id, symbol, name, { unit: 'hPa', min: 900, max: 1080, step: 1 });

const pressureMap: ModuleDef = {
  id: 'g.s12-atmosphere-weather-pressure',
  title: 'Highs, lows and the wind',
  use: 'Use this for the pressure difference and gradient between a high and a low, and how the wind blows between them.',
  assumptions: [
    'Isobars join places of equal air pressure; here they are drawn every 4 hPa (every 8 or more when the difference is large).',
    'Air is pushed from high toward low pressure, harder where the isobars crowd together.',
    'Earth’s turning deflects moving air (the Coriolis effect): to the right in the Northern Hemisphere, to the left in the Southern.',
    'Friction with the ground slows the wind, so it crosses the isobars into the low.',
  ],
  variables: [
    hpa('H', 'H', 'Pressure at the high'),
    hpa('Lw', 'L', 'Pressure at the low'),
    V('D', 'D', 'Distance between them', { unit: 'km', min: 50, max: 5000, step: 10 }),
    V('dP', 'ΔP', 'Pressure difference', {
      unit: 'hPa',
      min: 0.1,
      max: 180,
      step: 1,
      derived: true,
    }),
    V('G', 'G', 'Pressure gradient', {
      unit: 'hPa per 100 km',
      min: 0.001,
      max: 100,
      step: 0.01,
      derived: true,
    }),
  ],
  ...rels(
    younger('Lw', 'H', 'the low {Lw} is below the high {H}'),
    difference('dP', 'H', 'Lw', [
      'How much higher the pressure is at the high.',
      'The high is the difference above the low.',
      'The low is the difference below the high.',
    ]),
    {
      relation: {
        id: 'G = ΔP ÷ D × 100',
        display: '{G} = {dP} ÷ {D} × 100',
        vars: ['G', 'dP', 'D'],
        residual: (v: Values) => v.G! * v.D! - v.dP! * 100,
        solve: {
          G: (v: Values) => div(v.dP! * 100, v.D!),
          dP: (v: Values) => (v.G! * v.D!) / 100,
          D: (v: Values) => div(v.dP! * 100, v.G!),
        },
      },
      steps: {
        G: { expr: '{dP} ÷ {D} × 100', how: 'The pressure change per km, times 100 km.' },
        dP: { expr: '{G} × {D} ÷ 100', how: 'The change per 100 km, times the hundreds of km.' },
        D: { expr: '{dP} ÷ {G} × 100', how: 'How many 100 km steps the difference takes.' },
      },
    },
  ),
  example: { H: 1028, Lw: 988, D: 800, dP: 40, G: 5 },
  startWith: ['H', 'Lw', 'D'],
  representation: {
    kind: 'atmosphereLayers',
    mode: 'pressure',
    high: 'H',
    low: 'Lw',
    distance: 'D',
  },
};

const pressureSouth: ModuleDef = {
  ...pressureMap,
  id: 'g.s12-atmosphere-weather-pressure-south',
  title: 'Highs and lows south of the equator',
  use: 'Use this for winds in the Southern Hemisphere, where the Coriolis effect turns them the other way.',
  representation: {
    kind: 'atmosphereLayers',
    mode: 'pressure',
    high: 'H',
    low: 'Lw',
    distance: 'D',
    hemisphere: 'south',
  },
};

const pressureWeak: ModuleDef = {
  ...pressureMap,
  id: 'g.s12-atmosphere-weather-pressure-weak',
  title: 'A weak pressure gradient',
  use: 'Use this for widely spaced isobars and light winds.',
  example: { H: 1016, Lw: 1008, D: 1000, dP: 8, G: 0.8 },
};

// ── H77: the greenhouse effect and climate zones ──

const climateLayouts: LayoutDef[] = [
  {
    id: 'g.s12-climate-systems-greenhouse',
    title: 'The greenhouse effect',
    kind: 'explore',
    use: 'Use this for how greenhouse gases keep Earth warm, and why more CO₂ warms it further.',
    assumptions: [
      'Sunlight is mostly visible light, which passes through the air; the ground absorbs it and warms.',
      'The warm ground gives off infrared. Greenhouse gases such as water vapor, CO₂ and methane absorb infrared and send some back down.',
      'Temperatures are Earth’s average at the surface.',
    ],
    figure: { kind: 'greenhouse' },
    scenes: [
      {
        label: 'No greenhouse gases',
        lines: [
          'With no gases to absorb it, all the infrared escapes to space.',
          'Earth’s surface would average about −18 °C, frozen over.',
        ],
        greenhouse: { view: 'energy', co2: 'none' },
      },
      {
        label: 'Before 1750',
        lines: [
          'Greenhouse gases absorb some infrared and send it back down, warming the surface.',
          'With about 280 ppm of CO₂, the surface averaged about 14 °C.',
        ],
        greenhouse: { view: 'energy', co2: 'preindustrial' },
      },
      {
        label: 'Today',
        lines: [
          'Burning fossil fuels has raised CO₂ to about 420 ppm, so more infrared is sent back.',
          'The surface has warmed about 1.2 °C since 1850.',
        ],
        greenhouse: { view: 'energy', co2: 'today' },
      },
    ],
  },
  {
    id: 'g.s12-climate-systems-zones',
    title: 'Climate zones by latitude',
    kind: 'explore',
    use: 'Use this for why it is warmer near the equator than near the poles.',
    assumptions: [
      'Near the equator the Sun is high, so its light falls on a small area; toward the poles the same light spreads over more.',
      'The tropics lie between 23.5° N and 23.5° S, the polar zones beyond 66.5°, and the temperate zones between them.',
    ],
    figure: { kind: 'greenhouse' },
    scenes: [
      {
        label: 'Two beams',
        lines: [
          'Each beam carries the same sunlight.',
          'At 50° N it spreads over about 1.6 times the area it covers at the equator, so each square metre gets less.',
        ],
        greenhouse: { view: 'zones' },
      },
      {
        label: 'Tropical',
        lines: ['The Sun is high all year: warm every month.'],
        greenhouse: { view: 'zones', lit: 'tropical' },
      },
      {
        label: 'Temperate',
        lines: ['The Sun’s height changes with the seasons: warm summers and cool winters.'],
        greenhouse: { view: 'zones', lit: 'temperate' },
      },
      {
        label: 'Polar',
        lines: ['The Sun is always low, and absent for part of the winter: cold all year.'],
        greenhouse: { view: 'zones', lit: 'polar' },
      },
    ],
  },
];

// ── H78: energy sources ──

/** t = the parts added; `what` names them. */
function sum(t: string, parts: string[], what: string, symbols: Record<string, string>): Rel {
  const rest = (p: string) => parts.filter((x) => x !== p);
  const sym = (id: string) => symbols[id] ?? id;
  return {
    relation: {
      id: `${sym(t)} = ${parts.map(sym).join(' + ')}`,
      display: `{${t}} = ${parts.map((p) => `{${p}}`).join(' + ')}`,
      vars: [t, ...parts],
      residual: (v: Values) => v[t]! - parts.reduce((s, p) => s + v[p]!, 0),
      solve: Object.fromEntries([
        [t, (v: Values) => parts.reduce((s, p) => s + v[p]!, 0)],
        ...parts.map((p) => [p, (v: Values) => v[t]! - rest(p).reduce((s, q) => s + v[q]!, 0)]),
      ]),
    },
    steps: Object.fromEntries([
      [t, { expr: parts.map((p) => `{${p}}`).join(' + '), how: `Add up the ${what}.` }],
      ...parts.map((p) => [
        p,
        {
          expr: `{${t}} − ${rest(p)
            .map((q) => `{${q}}`)
            .join(' − ')}`,
          how: `Take the other ${what} away from the total.`,
        },
      ]),
    ]),
  };
}

const pct = (id: string, symbol: string, name: string, derived = false) =>
  V(id, symbol, name, { unit: '%', min: 0, max: 100, step: 1, integer: true, derived });

const ENERGY_WHY = [
  'Renewable sources are replaced naturally as fast as we use them: sunlight, wind and flowing water.',
  'Fossil fuels (coal, oil and natural gas) took millions of years to form, and burning them releases CO₂; nuclear fuel (uranium) is mined and also runs out.',
];

const electricityMix: ModuleDef = {
  id: 'g.s12-resource-management-mix',
  title: 'Where electricity comes from',
  use: 'Use this for an energy mix: each source’s share and how much of it is renewable.',
  assumptions: [
    ...ENERGY_WHY,
    'The shares are about those of US electricity in 2023, rounded to whole percents.',
  ],
  variables: [
    pct('g', 'g', 'Natural gas'),
    pct('n', 'n', 'Nuclear'),
    pct('k', 'k', 'Coal'),
    pct('w', 'w', 'Wind'),
    pct('h', 'h', 'Hydroelectric'),
    pct('s', 's', 'Solar'),
    pct('o', 'o', 'Other sources'),
    pct('T', 'T', 'All sources', true),
    pct('R', 'R', 'Renewable: wind, water and sun', true),
  ],
  ...rels(
    sum('T', ['g', 'n', 'k', 'w', 'h', 's', 'o'], 'shares', {}),
    sum('R', ['w', 'h', 's'], 'renewable shares', {}),
  ),
  example: { g: 43, n: 19, k: 16, w: 10, h: 6, s: 4, o: 2, T: 100, R: 20 },
  startWith: ['g', 'n', 'k', 'w', 'h', 's', 'o'],
  representation: {
    kind: 'bars',
    bars: [
      { var: 'g', icon: 'gas stove flame' },
      { var: 'n', icon: 'nuclear power plant' },
      { var: 'k', icon: 'lumps of coal' },
      { var: 'w', icon: 'wind turbine' },
      { var: 'h', icon: 'dam' },
      { var: 's', icon: 'solar panel' },
    ],
    min: 0,
    max: 50,
    total: 'T',
    scale: 10,
  },
};

const worldMix: ModuleDef = {
  id: 'g.s12-resource-management-world',
  title: 'The world’s energy: fossil, nuclear, renewable',
  use: 'Use this for the shares of all the energy the world uses, where fossil fuels still dominate.',
  assumptions: [
    ...ENERGY_WHY,
    'All energy, not just electricity: fuel for transport, heating and industry too.',
    'The shares are roughly the world’s in 2023: fossil fuels (oil, coal and gas) about 81%, renewables (water, wind, sun and others) about 15%.',
  ],
  variables: [
    pct('F', 'F', 'Fossil fuels'),
    pct('n', 'n', 'Nuclear'),
    pct('r', 'r', 'Renewable'),
    pct('T', 'T', 'All sources', true),
  ],
  ...rels(sum('T', ['F', 'n', 'r'], 'shares', {})),
  example: { F: 81, n: 4, r: 15, T: 100 },
  startWith: ['F', 'n', 'r'],
  sliders: false,
  representation: {
    kind: 'pieChart',
    parts: ['F', 'n', 'r'],
    total: 'T',
    colors: ['rubber', 'purple', 'landGrass'],
  },
};

const energyLayouts: LayoutDef[] = [
  {
    id: 'g.s12-resource-management-renewable',
    title: 'Renewable or nonrenewable',
    kind: 'sort',
    use: 'Use this for sorting energy sources by whether they are replaced as fast as we use them.',
    assumptions: ENERGY_WHY,
    question: 'Is it replaced as fast as we use it?',
    bins: [
      {
        id: 'renewable',
        label: 'Renewable',
        why: 'Sunlight, wind and rain keep coming, and making electricity from them gives off no CO₂.',
      },
      {
        id: 'nonrenewable',
        label: 'Nonrenewable',
        why: 'Coal, oil, gas and uranium are dug or pumped from the ground, and there is a limited amount.',
      },
    ],
    cards: [
      { label: 'Solar panels', bin: 'renewable', figure: { kind: 'icon', icon: 'solar panel' } },
      { label: 'Wind turbine', bin: 'renewable', figure: { kind: 'icon', icon: 'wind turbine' } },
      {
        label: 'Hydroelectric dam',
        bin: 'renewable',
        figure: { kind: 'icon', icon: 'dam' },
      },
      { label: 'Coal', bin: 'nonrenewable', figure: { kind: 'icon', icon: 'lumps of coal' } },
      { label: 'Oil rig', bin: 'nonrenewable', figure: { kind: 'icon', icon: 'oil rig' } },
      {
        label: 'Natural gas',
        bin: 'nonrenewable',
        figure: { kind: 'icon', icon: 'gas stove flame' },
      },
      {
        label: 'Nuclear plant',
        bin: 'nonrenewable',
        figure: { kind: 'icon', icon: 'nuclear power plant' },
      },
    ],
  },
];

// ── H79: the H–R diagram and a star's life ──

const SUN_K = 5772;
const lum = (r: number, t: number) => r * r * (t / SUN_K) ** 4;

const hr: ModuleDef = {
  id: 'g.s12-stellar-evolution-hr',
  title: 'Placing a star on the H–R diagram',
  use: 'Use this for a star’s luminosity from its temperature and size, and where it falls on the H–R diagram.',
  assumptions: [
    'The H–R diagram plots stars by surface temperature (hot on the left) and luminosity, both on log scales.',
    'A star’s luminosity grows with its surface area and the fourth power of its temperature: L = R² × (T ÷ 5772)⁴ in Suns, where 5772 K is the Sun’s temperature.',
    'Most stars, fusing hydrogen in their cores, lie on the main sequence; giants and supergiants are swollen, white dwarfs tiny.',
  ],
  variables: [
    V('T', 'T', 'Surface temperature', { unit: 'K', min: 2500, max: 40000, step: 10 }),
    V('R', 'R', 'Radius', { unit: 'R☉', min: 0.005, max: 1500, step: 0.001 }),
    V('L', 'L', 'Luminosity', {
      unit: 'L☉',
      min: 0.0001,
      max: 1000000,
      step: 0.0001,
      derived: true,
    }),
  ],
  ...rels({
    relation: {
      id: 'L = R² × (T ÷ 5772)^4',
      display: '{L} = {R}² × ({T} ÷ 5772)^4',
      vars: ['L', 'R', 'T'],
      residual: (v: Values) => v.L! - lum(v.R!, v.T!),
      solve: {
        L: (v: Values) => lum(v.R!, v.T!),
        R: (v: Values) => (v.L! > 0 ? Math.sqrt(v.L!) * (SUN_K / v.T!) ** 2 : undefined),
        T: (v: Values) => (v.L! > 0 && v.R! > 0 ? SUN_K * (v.L! / v.R! ** 2) ** 0.25 : undefined),
      },
    },
    steps: {
      L: {
        expr: '{R}^2 × ({T} ÷ 5772)^4',
        how: 'Surface area grows as R squared; each square metre shines as T to the fourth.',
      },
      R: {
        expr: '√({L}) × (5772 ÷ {T})^2',
        how: 'Undo the fourth power of the temperature, then the square of the radius.',
      },
      T: {
        expr: '5772 × ({L} ÷ {R}^2)^(1/4)',
        how: 'The light per unit of surface, then its fourth root.',
      },
    },
  }),
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

const hrStar = (id: string, title: string, use: string, name: string, T: number, R: number) =>
  ({
    ...hr,
    id,
    title,
    use,
    example: { T, R, L: lum(R, T) },
    representation: { kind: 'hrDiagram', temperature: 'T', luminosity: 'L', radius: 'R', name },
  }) satisfies ModuleDef;

const hrGiant = hrStar(
  'g.s12-stellar-evolution-giant',
  'A red giant: Aldebaran',
  'Use this for a cool but huge star above the main sequence.',
  'Aldebaran',
  3900,
  45,
);
const hrSupergiant = hrStar(
  'g.s12-stellar-evolution-supergiant',
  'A red supergiant: Betelgeuse',
  'Use this for one of the largest stars, near the top right of the diagram.',
  'Betelgeuse',
  3600,
  760,
);
const hrDwarf = hrStar(
  'g.s12-stellar-evolution-white-dwarf',
  'A white dwarf: Sirius B',
  'Use this for a hot but tiny star, below the main sequence.',
  'Sirius B',
  25000,
  0.0084,
);

const lifeLayouts: LayoutDef[] = [
  {
    id: 'g.s12-stellar-evolution-sunlike',
    title: 'The life of a Sun-like star',
    kind: 'sequence',
    use: 'Use this for the stages of a star up to about 8 times the Sun’s mass.',
    assumptions: [
      'A star’s mass sets its life: low-mass stars live long and end quietly.',
      'On the main sequence a star fuses hydrogen into helium in its core; when the core’s hydrogen runs out, the star swells into a red giant.',
      'The giant sheds its outer layers as a planetary nebula, leaving its hot core as a white dwarf about the size of Earth.',
    ],
    question: 'Put the stages of a Sun-like star’s life in order.',
    stages: [
      { label: 'Nebula', figure: { kind: 'icon', icon: 'stellar nebula' } },
      { label: 'Protostar', figure: { kind: 'icon', icon: 'protostar' } },
      { label: 'Main sequence', figure: { kind: 'icon', icon: 'Sun-like star' } },
      { label: 'Red giant', figure: { kind: 'icon', icon: 'red giant' } },
      { label: 'Planetary nebula', figure: { kind: 'icon', icon: 'planetary nebula' } },
      { label: 'White dwarf', figure: { kind: 'icon', icon: 'white dwarf' } },
    ],
  },
  {
    id: 'g.s12-stellar-evolution-massive',
    title: 'The life of a massive star',
    kind: 'sequence',
    use: 'Use this for the stages of a star of more than about 8 times the Sun’s mass.',
    assumptions: [
      'Massive stars burn hot and fast, living only millions of years.',
      'They swell into red supergiants, fusing elements up to iron, then the core collapses and the star explodes as a supernova.',
      'The core left behind is a neutron star, or, for the most massive stars (above about 20 Suns), a black hole.',
    ],
    question: 'Put the stages of a massive star’s life in order.',
    stages: [
      { label: 'Nebula', figure: { kind: 'icon', icon: 'stellar nebula' } },
      { label: 'Protostar', figure: { kind: 'icon', icon: 'protostar' } },
      { label: 'Massive star', figure: { kind: 'icon', icon: 'massive star' } },
      { label: 'Red supergiant', figure: { kind: 'icon', icon: 'red supergiant' } },
      { label: 'Supernova', figure: { kind: 'icon', icon: 'supernova' } },
      { label: 'Neutron star', figure: { kind: 'icon', icon: 'neutron star' } },
    ],
  },
  {
    id: 'g.s12-stellar-evolution-remnants',
    title: 'What a star leaves behind',
    kind: 'sort',
    use: 'Use this for matching a star’s end to its mass.',
    assumptions: [
      'Up to about 8 Suns: a white dwarf. About 8 to 20 Suns: a neutron star. Above about 20 Suns: a black hole.',
    ],
    question: 'Which kind of star leaves it behind?',
    bins: [
      {
        id: 'low',
        label: 'Sun-like star',
        why: 'It sheds its layers gently and leaves a white dwarf.',
      },
      {
        id: 'high',
        label: 'Massive star',
        why: 'It explodes as a supernova and its core collapses into a neutron star or a black hole.',
      },
    ],
    cards: [
      { label: 'Planetary nebula', bin: 'low', figure: { kind: 'icon', icon: 'planetary nebula' } },
      { label: 'White dwarf', bin: 'low', figure: { kind: 'icon', icon: 'white dwarf' } },
      { label: 'Supernova', bin: 'high', figure: { kind: 'icon', icon: 'supernova' } },
      { label: 'Neutron star', bin: 'high', figure: { kind: 'icon', icon: 'neutron star' } },
      { label: 'Black hole', bin: 'high', figure: { kind: 'icon', icon: 'black hole' } },
    ],
  },
];

// ── H80: the expanding universe, galaxies and the forming solar system ──

const stretch: ModuleDef = {
  id: 'g.s12-cosmology-stretch',
  title: 'Space stretching: every galaxy moves apart',
  use: 'Use this for how a galaxy’s distance grows as space stretches.',
  assumptions: [
    'The universe is expanding: space itself stretches, carrying galaxies apart.',
    'Every distance grows by the same factor, so from any galaxy the others all seem to move away, and none is at the center.',
    'Distances are in millions of light-years (Mly).',
  ],
  variables: [
    V('a', 'a', 'Stretch factor', { min: 1, max: 4, step: 0.01 }),
    V('d', 'd', 'Distance before', { unit: 'Mly', min: 1, max: 10000, step: 1 }),
    V('D', 'D', 'Distance after', { unit: 'Mly', min: 1, max: 40000, step: 1, derived: true }),
  ],
  ...rels(
    product('D', 'a', 'd', [
      'Every distance grows by the stretch factor.',
      'How many times the distance grew.',
      'Undo the stretch: divide by the factor.',
    ]),
  ),
  example: { a: 2, d: 100, D: 200 },
  startWith: ['a', 'd'],
  representation: {
    kind: 'expandingUniverse',
    mode: 'stretch',
    scale: 'a',
    distance: 'd',
    after: 'D',
  },
};

const stretchFar: ModuleDef = {
  ...stretch,
  id: 'g.s12-cosmology-stretch-far',
  title: 'Space stretched four times',
  use: 'Use this for a large stretch, as between the early universe and today.',
  example: { a: 4, d: 100, D: 400 },
};

const hubble: ModuleDef = {
  id: 'g.s12-cosmology-hubble',
  title: 'Hubble’s law',
  use: 'Use this for a galaxy’s speed away from us from its distance, v = H₀ × d.',
  assumptions: [
    'The light of distant galaxies is redshifted: they are moving away from us.',
    'Hubble’s law: a galaxy’s speed away is proportional to its distance. The slope is the Hubble constant, about 70 km/s per megaparsec (Mpc).',
    'One megaparsec is about 3.26 million light-years.',
  ],
  variables: [
    V('H', 'H₀', 'Hubble constant', { unit: 'km/s per Mpc', min: 50, max: 90, step: 0.1 }),
    V('d', 'd', 'Distance', { unit: 'Mpc', min: 0.1, max: 5000, step: 0.1 }),
    V('v', 'v', 'Speed away', { unit: 'km/s', min: 1, max: 450000, step: 1, derived: true }),
  ],
  ...rels(
    product('v', 'H', 'd', [
      'Each megaparsec of distance adds H₀ km/s of speed.',
      'The speed per megaparsec: the slope of the Hubble plot.',
      'How many megaparsecs give that speed.',
    ]),
  ),
  example: { H: 70, d: 100, v: 7000 },
  startWith: ['H', 'd'],
  representation: {
    kind: 'expandingUniverse',
    mode: 'hubble',
    distance: 'd',
    speed: 'v',
    constant: 'H',
  },
};

const hubbleFar: ModuleDef = {
  ...hubble,
  id: 'g.s12-cosmology-hubble-far',
  title: 'Hubble’s law for a distant galaxy',
  use: 'Use this for a galaxy a billion light-years and more away.',
  example: { H: 70, d: 400, v: 28000 },
};

const cosmosLayouts: LayoutDef[] = [
  {
    id: 'g.s12-cosmology-galaxies',
    title: 'Kinds of galaxies',
    kind: 'sort',
    use: 'Use this for sorting galaxies by shape: spiral, elliptical or irregular.',
    assumptions: [
      'Spiral galaxies have a bulge and a flat disk with arms where new stars form; many, like the Milky Way, have a bar across the middle.',
      'Elliptical galaxies are smooth balls of mostly old stars, with little gas.',
      'Irregular galaxies have no clear shape.',
    ],
    question: 'What shape is the galaxy?',
    bins: [
      {
        id: 'spiral',
        label: 'Spiral',
        why: 'A central bulge with arms winding out in a flat disk.',
      },
      { id: 'elliptical', label: 'Elliptical', why: 'A smooth oval of old stars, with no arms.' },
      {
        id: 'irregular',
        label: 'Irregular',
        why: 'Patchy clumps of stars and gas, with no set shape.',
      },
    ],
    cards: [
      { label: 'Andromeda Galaxy', bin: 'spiral', figure: { kind: 'icon', icon: 'spiral galaxy' } },
      { label: 'Milky Way', bin: 'spiral', figure: { kind: 'icon', icon: 'barred spiral galaxy' } },
      { label: 'M87', bin: 'elliptical', figure: { kind: 'icon', icon: 'elliptical galaxy' } },
      {
        label: 'Large Magellanic Cloud',
        bin: 'irregular',
        figure: { kind: 'icon', icon: 'irregular galaxy' },
      },
    ],
  },
  {
    id: 'g.s12-solar-system-formation',
    title: 'How the solar system formed',
    kind: 'sequence',
    use: 'Use this for the stages of the solar system’s formation, from a nebula to planets.',
    assumptions: [
      'About 4.6 billion years ago, a cloud of gas and dust began to collapse under its own gravity.',
      'As it shrank it spun faster and flattened into a disk; the center became the Sun.',
      'In the disk, dust stuck into planetesimals, which collided and grew into planets: rocky near the Sun, giants of gas and ice farther out.',
    ],
    question: 'Put the stages of the solar system’s formation in order.',
    stages: [
      { label: 'Solar nebula', figure: { kind: 'icon', icon: 'solar nebula' } },
      { label: 'Spinning disk', figure: { kind: 'icon', icon: 'spinning disk' } },
      { label: 'Protosun', figure: { kind: 'icon', icon: 'protosun' } },
      { label: 'Planetesimals', figure: { kind: 'icon', icon: 'planetesimals' } },
      { label: 'Planets', figure: { kind: 'icon', icon: 'young planets' } },
    ],
  },
];

export const HSL_GALLERY_MODULES: ModuleDef[] = [
  stretch,
  stretchFar,
  hubble,
  hubbleFar,
  hr,
  hrGiant,
  hrSupergiant,
  hrDwarf,
  electricityMix,
  worldMix,
  lapse,
  lapseTop,
  lapseHot,
  pressureMap,
  pressureSouth,
  pressureWeak,
  sonar,
  sonarRidge,
  sonarTrench,
  tides,
  tidesNeap,
  tidesFull,
  halfLife,
  halfLifeYoung,
  bracket,
  shadowZone,
  shadowDirect,
  shadowCore,
  shadowEdge,
  seismogram,
  seismogramNear,
  epicenter,
];
export const HSL_GALLERY_LAYOUTS: LayoutDef[] = [
  ...mineralLayouts,
  ...landformLayouts,
  ...currentsLayouts,
  ...climateLayouts,
  ...energyLayouts,
  ...lifeLayouts,
  ...cosmosLayouts,
];

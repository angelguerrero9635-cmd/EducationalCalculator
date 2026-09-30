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

export const HSL_GALLERY_MODULES: ModuleDef[] = [
  shadowZone,
  shadowDirect,
  shadowCore,
  shadowEdge,
  seismogram,
  seismogramNear,
  epicenter,
];
export const HSL_GALLERY_LAYOUTS: LayoutDef[] = [...mineralLayouts, ...landformLayouts];

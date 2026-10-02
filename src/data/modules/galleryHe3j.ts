/**
 * College gallery demos, round 3, group J (docs/RENDERINGS_HE.md). Each stands in for the
 * college page that waits, built from the plan's worked example. Spread into gallery.ts.
 *
 * HC88: `streamChannel` options (ACC-P19): Manning’s discharge and the Froude number, the
 * specific-energy curve, a hydraulic jump (hydraulics-hydrology#0).
 *
 * HC60: `roadCurve` (ACC-P22): stopping sight distance, the least radius with superelevation,
 * curve elements, a crest vertical curve (transportation#1).
 *
 * HC61: `connection` (ACC-P24): a plate in tension and its net section, a bolt group in a lap
 * splice, fillet welds, block shear (steel-design#1~tension, #3).
 *
 * HC89: `hydrograph` (ACC-P21): the curve-number split, the rational method, detention storage
 * (hydraulics-hydrology#2, #3~detention).
 *
 * HC90: `blockDiagram` (ACC-P34): P feedback with its offset, three equal lags, static feedforward
 * (process-control#1, #3).
 */
import { formatNumber } from '@/engine/format';
import type { Relation, Values, VariableDef } from '@/engine/types';

import type { LayoutDef } from './layouts';
import type { ModuleDef, StepText } from './types';
import type {
  BlockDiagramSpec,
  ConnectionSpec,
  HydrographSpec,
  RoadCurveSpec,
  StreamChannelHeSpec,
} from './typesHe3j';

// ─── Building blocks ─────────────────────────────────────────────────────────

type Solver = (v: Values) => number | undefined;

/** A relation and its steps from one table: each value it solves for, with its text. */
function rule(
  id: string,
  display: string,
  vars: string[],
  residual: (v: Values) => number,
  solves: Record<string, [Solver, string, string]>,
): { relation: Relation; steps: Record<string, StepText> } {
  return {
    relation: {
      id,
      display,
      vars,
      residual,
      solve: Object.fromEntries(Object.entries(solves).map(([k, [f]]) => [k, f])),
    },
    steps: Object.fromEntries(
      Object.entries(solves).map(([k, [, expr, how]]) => [k, { expr, how }]),
    ),
  };
}

const rules = (...rs: ReturnType<typeof rule>[]) => ({
  relations: rs.map((r) => r.relation),
  steps: Object.fromEntries(rs.map((r) => [r.relation.id, r.steps])),
});

const div = (a: number, b: number) => (b === 0 || !Number.isFinite(b) ? undefined : a / b);
const pos = (x: number) => (x > 0 && Number.isFinite(x) ? x : undefined);

/** A value with one unit (the formula is written in it). */
const q = (
  id: string,
  symbol: string,
  name: string,
  unit: string | undefined,
  min: number,
  max: number,
  step: number,
  more: Partial<VariableDef> = {},
): VariableDef => ({
  id,
  symbol,
  name,
  ...(unit ? { unit, units: [unit] } : {}),
  min,
  max,
  step,
  ...more,
});

/** A product of two values: c = a × b, solved for any one. */
const product = (c: string, a: string, b: string, how: string) =>
  rule(`${c} = ${a}${b}`, `{${c}} = {${a}} × {${b}}`, [c, a, b], (v) => v[c]! - v[a]! * v[b]!, {
    [c]: [(v) => v[a]! * v[b]!, `{${a}} × {${b}}`, how],
    [a]: [(v) => div(v[c]!, v[b]!), `{${c}} ÷ {${b}}`, `Divide ${c} by ${b}.`],
    [b]: [(v) => div(v[c]!, v[a]!), `{${c}} ÷ {${a}}`, `Divide ${c} by ${a}.`],
  });

/** A quotient: c = a ÷ b, solved for any one. */
const quotient = (c: string, a: string, b: string, how: string) =>
  rule(`${c} = ${a} ÷ ${b}`, `{${c}} = {${a}} ÷ {${b}}`, [c, a, b], (v) => v[c]! * v[b]! - v[a]!, {
    [c]: [(v) => div(v[a]!, v[b]!), `{${a}} ÷ {${b}}`, how],
    [a]: [(v) => v[c]! * v[b]!, `{${c}} × {${b}}`, `Multiply ${c} by ${b}.`],
    [b]: [(v) => div(v[a]!, v[c]!), `{${a}} ÷ {${c}}`, `Divide ${a} by ${c}.`],
  });

// ─── HC88: Manning’s equation and the Froude number (hydraulics-hydrology#0) ───

const G = 9.81;

const MANNING = rules(
  product('A', 'b', 'y', 'The flow area of a rectangle: width times depth.'),
  rule(
    'R = A ÷ (b + 2y)',
    '{R} = {A} ÷ ({b} + 2 × {y})',
    ['R', 'A', 'b', 'y'],
    (v) => v.R! * (v.b! + 2 * v.y!) - v.A!,
    {
      R: [
        (v) => div(v.A!, v.b! + 2 * v.y!),
        '{A} ÷ ({b} + 2 × {y})',
        'The hydraulic radius is the area over the wetted perimeter: the bed b and both walls y.',
      ],
      A: [
        (v) => v.R! * (v.b! + 2 * v.y!),
        '{R} × ({b} + 2 × {y})',
        'Multiply R by the wetted perimeter.',
      ],
    },
  ),
  rule(
    'Q = (1 ÷ n)AR^(2/3)S^(1/2)',
    '{Q} = (1 ÷ {n}) × {A} × {R}^(2 ÷ 3) × {S}^(1 ÷ 2)',
    ['Q', 'n', 'A', 'R', 'S'],
    (v) => v.Q! * v.n! - v.A! * v.R! ** (2 / 3) * Math.sqrt(v.S!),
    {
      Q: [
        (v) => pos((v.A! * v.R! ** (2 / 3) * Math.sqrt(v.S!)) / v.n!),
        '(1 ÷ {n}) × {A} × {R}^(2 ÷ 3) × {S}^(1 ÷ 2)',
        'Manning’s equation in SI units: rougher beds (larger n) carry less; steeper ones more.',
      ],
      n: [
        (v) => div(v.A! * v.R! ** (2 / 3) * Math.sqrt(v.S!), v.Q!),
        '{A} × {R}^(2 ÷ 3) × {S}^(1 ÷ 2) ÷ {Q}',
        'Solve Manning’s equation for n.',
      ],
      S: [
        (v) => {
          const r = div(v.Q! * v.n!, v.A! * v.R! ** (2 / 3));
          return r === undefined ? undefined : r * r;
        },
        '({Q} × {n} ÷ ({A} × {R}^(2 ÷ 3)))²',
        'Solve Manning’s equation for the slope: square Qn ÷ AR^(2/3).',
      ],
    },
  ),
  quotient('V', 'Q', 'A', 'The mean speed is the discharge spread over the area.'),
  rule(
    'Fr = V ÷ √(gy)',
    '{Fr} = {V} ÷ √(9.81 × {y})',
    ['Fr', 'V', 'y'],
    (v) => v.Fr! * Math.sqrt(G * v.y!) - v.V!,
    {
      Fr: [
        (v) => div(v.V!, Math.sqrt(G * v.y!)),
        '{V} ÷ √(9.81 × {y})',
        'Compare the flow’s speed with a shallow wave’s speed √(gy): below 1 the flow is subcritical.',
      ],
      V: [(v) => v.Fr! * Math.sqrt(G * v.y!), '{Fr} × √(9.81 × {y})', 'Multiply Fr by √(gy).'],
    },
  ),
);

const manningVars = (): VariableDef[] => [
  q('b', 'b', 'Channel width', 'm', 0.1, 100, 0.01),
  q('y', 'y', 'Flow depth', 'm', 0.01, 20, 0.01),
  q('n', 'n', 'Manning’s n', undefined, 0.008, 0.1, 0.001),
  q('S', 'S', 'Bed slope', undefined, 0.00001, 0.1, 0.00001),
  q('A', 'A', 'Flow area', 'm²', 0.001, 2000, 0.001),
  q('R', 'R', 'Hydraulic radius', 'm', 0.001, 20, 0.001),
  q('Q', 'Q', 'Discharge', 'm³/s', 0.0001, 100000, 0.001),
  q('V', 'V', 'Mean velocity', 'm/s', 0.0001, 50, 0.001),
  q('Fr', 'Fr', 'Froude number', undefined, 0.0001, 20, 0.001),
];

function manningExample(b: number, y: number, n: number, S: number): Values {
  const A = b * y;
  const R = A / (b + 2 * y);
  const Q = (A * R ** (2 / 3) * Math.sqrt(S)) / n;
  const V = Q / A;
  return { b, y, n, S, A, R, Q, V, Fr: V / Math.sqrt(G * y) };
}

const MANNING_ASSUMPTIONS = [
  'Uniform, steady flow: the depth is the normal depth.',
  'A rectangular channel; Manning’s equation in SI units (1.49 in US units).',
  'g = 9.81 m/s²; Fr < 1 is subcritical, Fr > 1 supercritical.',
];

const MANNING_SPEC: StreamChannelHeSpec = {
  kind: 'streamChannel',
  mode: 'manning',
  width: 'b',
  depth: 'y',
  n: 'n',
  slope: 'S',
  area: 'A',
  radius: 'R',
  discharge: 'Q',
  speed: 'V',
  froude: 'Fr',
  g: G,
  keep: ['b', 'n', 'S'],
};

const streamManning: ModuleDef = {
  id: 'g.he-streamChannel-manning',
  title: 'Open-channel flow: Manning’s discharge and the Froude number',
  use: 'Use this for the discharge of a rectangular channel at normal depth, and whether the flow is sub- or supercritical.',
  assumptions: MANNING_ASSUMPTIONS,
  variables: manningVars(),
  ...MANNING,
  example: manningExample(3, 1.2, 0.015, 0.001),
  startWith: ['b', 'n', 'S', 'y'],
  representation: { ...MANNING_SPEC },
};

const streamManningSteep: ModuleDef = {
  id: 'g.he-streamChannel-manning-steep',
  title: 'A steep concrete chute: shallow, fast, supercritical flow',
  use: 'Use this for a steep, smooth channel where the flow runs faster than a surface wave.',
  assumptions: MANNING_ASSUMPTIONS,
  variables: manningVars(),
  ...MANNING,
  example: manningExample(2, 0.4, 0.013, 0.02),
  startWith: ['b', 'n', 'S', 'y'],
  representation: { ...MANNING_SPEC },
};

// ─── HC88: critical depth and specific energy (~critical-depth) ──────────────

const ENERGY = rules(
  quotient('q', 'Q', 'b', 'The discharge per metre of width.'),
  rule(
    'y_c = (q² ÷ g)^(1/3)',
    '{yc} = ({q}² ÷ 9.81)^(1 ÷ 3)',
    ['yc', 'q'],
    (v) => v.yc! ** 3 - (v.q! * v.q!) / G,
    {
      yc: [
        (v) => Math.cbrt((v.q! * v.q!) / G),
        '({q}² ÷ 9.81)^(1 ÷ 3)',
        'The critical depth, where the specific energy is least: the cube root of q² ÷ g.',
      ],
      q: [(v) => pos(Math.sqrt(G * v.yc! ** 3)), '√(9.81 × {yc}³)', 'q = √(gy_c³).'],
    },
  ),
  rule('E_min = 1.5y_c', '{Emin} = 1.5 × {yc}', ['Emin', 'yc'], (v) => v.Emin! - 1.5 * v.yc!, {
    Emin: [
      (v) => 1.5 * v.yc!,
      '1.5 × {yc}',
      'At critical depth the velocity head is half the depth.',
    ],
    yc: [(v) => v.Emin! / 1.5, '{Emin} ÷ 1.5', 'Divide E_min by 1.5.'],
  }),
  rule(
    'E = y + q² ÷ (2gy²)',
    '{E} = {y} + {q}² ÷ (2 × 9.81 × {y}²)',
    ['E', 'y', 'q'],
    (v) => v.E! - v.y! - (v.q! * v.q!) / (2 * G * v.y! * v.y!),
    {
      E: [
        (v) => v.y! + (v.q! * v.q!) / (2 * G * v.y! * v.y!),
        '{y} + {q}² ÷ (2 × 9.81 × {y}²)',
        'The depth plus the velocity head V² ÷ 2g, with V = q ÷ y.',
      ],
    },
  ),
);

function energyExample(Q: number, b: number, y: number): Values {
  const qq = Q / b;
  const yc = Math.cbrt((qq * qq) / G);
  return { Q, b, q: qq, yc, Emin: 1.5 * yc, y, E: y + (qq * qq) / (2 * G * y * y) };
}

const energyVars = (): VariableDef[] => [
  q('Q', 'Q', 'Discharge', 'm³/s', 0.001, 100000, 0.01),
  q('b', 'b', 'Channel width', 'm', 0.1, 100, 0.01),
  q('q', 'q', 'Unit discharge', 'm²/s', 0.0001, 1000, 0.001),
  q('yc', 'y_c', 'Critical depth', 'm', 0.0001, 50, 0.001),
  q('Emin', 'E_min', 'Least specific energy', 'm', 0.0001, 100, 0.001),
  q('y', 'y', 'Flow depth', 'm', 0.01, 50, 0.01),
  q('E', 'E', 'Specific energy', 'm', 0.0001, 1000, 0.001),
];

const ENERGY_SPEC: StreamChannelHeSpec = {
  kind: 'streamChannel',
  mode: 'specificEnergy',
  discharge: 'Q',
  width: 'b',
  q: 'q',
  yc: 'yc',
  Emin: 'Emin',
  depth: 'y',
  energy: 'E',
  g: G,
  keep: ['Q', 'b'],
};

const ENERGY_ASSUMPTIONS = [
  'A rectangular channel; the specific energy is measured from the bed.',
  'g = 9.81 m/s²; above y_c the flow is subcritical, below it supercritical.',
];

const streamEnergy: ModuleDef = {
  id: 'g.he-streamChannel-specificEnergy',
  title: 'Specific energy: the critical depth and the least energy',
  use: 'Use this for the critical depth and the specific energy of a flow in a rectangular channel.',
  assumptions: ENERGY_ASSUMPTIONS,
  variables: energyVars(),
  ...ENERGY,
  example: energyExample(5.79, 3, 1.2),
  startWith: ['Q', 'b', 'y'],
  representation: { ...ENERGY_SPEC },
};

const streamEnergyShallow: ModuleDef = {
  id: 'g.he-streamChannel-specificEnergy-shallow',
  title: 'Specific energy below the critical depth: a fast, shallow flow',
  use: 'Use this for the specific energy of a shallow, supercritical flow and its deeper alternate depth.',
  assumptions: ENERGY_ASSUMPTIONS,
  variables: energyVars(),
  ...ENERGY,
  example: energyExample(5.79, 3, 0.4),
  startWith: ['Q', 'b', 'y'],
  representation: { ...ENERGY_SPEC },
};

// ─── HC88: the hydraulic jump (~jump) ────────────────────────────────────────

const JUMP = rules(
  rule(
    'Fr₁ = V₁ ÷ √(gy₁)',
    '{Fr1} = {V1} ÷ √(9.81 × {y1})',
    ['Fr1', 'V1', 'y1'],
    (v) => v.Fr1! * Math.sqrt(G * v.y1!) - v.V1!,
    {
      Fr1: [
        (v) => div(v.V1!, Math.sqrt(G * v.y1!)),
        '{V1} ÷ √(9.81 × {y1})',
        'The Froude number before the jump; a jump needs it above 1.',
      ],
      V1: [
        (v) => v.Fr1! * Math.sqrt(G * v.y1!),
        '{Fr1} × √(9.81 × {y1})',
        'Multiply Fr₁ by √(gy₁).',
      ],
    },
  ),
  rule(
    'y₂ = (y₁ ÷ 2)(√(1 + 8Fr₁²) − 1)',
    '{y2} = ({y1} ÷ 2) × (√(1 + 8 × {Fr1}²) − 1)',
    ['y2', 'y1', 'Fr1'],
    (v) => v.y2! - (v.y1! / 2) * (Math.sqrt(1 + 8 * v.Fr1! * v.Fr1!) - 1),
    {
      y2: [
        (v) => (v.y1! / 2) * (Math.sqrt(1 + 8 * v.Fr1! * v.Fr1!) - 1),
        '({y1} ÷ 2) × (√(1 + 8 × {Fr1}²) − 1)',
        'The sequent depth, from momentum kept across the jump.',
      ],
    },
  ),
  rule(
    'h_L = (y₂ − y₁)³ ÷ (4y₁y₂)',
    '{hL} = ({y2} − {y1})³ ÷ (4 × {y1} × {y2})',
    ['hL', 'y1', 'y2'],
    (v) => v.hL! * 4 * v.y1! * v.y2! - (v.y2! - v.y1!) ** 3,
    {
      hL: [
        (v) => div((v.y2! - v.y1!) ** 3, 4 * v.y1! * v.y2!),
        '({y2} − {y1})³ ÷ (4 × {y1} × {y2})',
        'The energy the roller turns to heat.',
      ],
    },
  ),
);

function jumpExample(y1: number, V1: number): Values {
  const Fr1 = V1 / Math.sqrt(G * y1);
  const y2 = (y1 / 2) * (Math.sqrt(1 + 8 * Fr1 * Fr1) - 1);
  return { y1, V1, Fr1, y2, hL: (y2 - y1) ** 3 / (4 * y1 * y2) };
}

const jumpVars = (): VariableDef[] => [
  q('y1', 'y₁', 'Depth before the jump', 'm', 0.01, 20, 0.01),
  q('V1', 'V₁', 'Speed before the jump', 'm/s', 0.01, 50, 0.01),
  q('Fr1', 'Fr₁', 'Froude number before the jump', undefined, 0.0001, 30, 0.001),
  q('y2', 'y₂', 'Depth after the jump', 'm', 0.0001, 100, 0.001),
  q('hL', 'h_L', 'Head lost in the jump', 'm', 0, 100, 0.001),
];

const JUMP_SPEC: StreamChannelHeSpec = {
  kind: 'streamChannel',
  mode: 'jump',
  y1: 'y1',
  V1: 'V1',
  Fr1: 'Fr1',
  y2: 'y2',
  hL: 'hL',
  g: G,
};

const JUMP_ASSUMPTIONS = [
  'A horizontal, rectangular channel; friction over the jump’s short length ignored.',
  'Momentum is kept across the jump; energy is not.',
];

const streamJump: ModuleDef = {
  id: 'g.he-streamChannel-jump',
  title: 'A hydraulic jump: the sequent depth and the head lost',
  use: 'Use this for the depth after a hydraulic jump and the energy it loses.',
  assumptions: JUMP_ASSUMPTIONS,
  variables: jumpVars(),
  ...JUMP,
  example: jumpExample(0.3, 6),
  startWith: ['y1', 'V1'],
  representation: { ...JUMP_SPEC },
};

const streamJumpWeak: ModuleDef = {
  id: 'g.he-streamChannel-jump-weak',
  title: 'A weak hydraulic jump: Fr₁ just above 1',
  use: 'Use this for an undular, weak jump that loses little energy.',
  assumptions: JUMP_ASSUMPTIONS,
  variables: jumpVars(),
  ...JUMP,
  example: jumpExample(0.5, 2.8),
  startWith: ['y1', 'V1'],
  representation: { ...JUMP_SPEC },
};

// ─── HC60: stopping sight distance (transportation#1) ────────────────────────

const STOPPING = rules(
  rule(
    'd_r = 0.278Vt',
    '{dr} = 0.278 × {V} × {t}',
    ['dr', 'V', 't'],
    (v) => v.dr! - 0.278 * v.V! * v.t!,
    {
      dr: [
        (v) => 0.278 * v.V! * v.t!,
        '0.278 × {V} × {t}',
        'Before the brakes bite the car keeps its speed: 0.278 turns km/h into m/s.',
      ],
      V: [(v) => div(v.dr!, 0.278 * v.t!), '{dr} ÷ (0.278 × {t})', 'Divide d_r by 0.278t.'],
      t: [(v) => div(v.dr!, 0.278 * v.V!), '{dr} ÷ (0.278 × {V})', 'Divide d_r by 0.278V.'],
    },
  ),
  rule(
    'd_b = V² ÷ (254(a ÷ g + G))',
    '{db} = {V}² ÷ (254 × ({a} ÷ 9.81 + {G}))',
    ['db', 'V', 'a', 'G'],
    (v) => v.db! * 254 * (v.a! / G + v.G!) - v.V! * v.V!,
    {
      db: [
        (v) => pos((v.V! * v.V!) / (254 * (v.a! / G + v.G!))),
        '{V}² ÷ (254 × ({a} ÷ 9.81 + {G}))',
        'Braking from V to rest at a, helped uphill by G and hindered downhill.',
      ],
      V: [
        (v) => pos(Math.sqrt(v.db! * 254 * (v.a! / G + v.G!))),
        '√({db} × 254 × ({a} ÷ 9.81 + {G}))',
        'Solve the braking distance for V.',
      ],
      a: [
        (v) => pos(G * ((v.V! * v.V!) / (254 * v.db!) - v.G!)),
        '9.81 × ({V}² ÷ (254 × {db}) − {G})',
        'Solve the braking distance for the deceleration.',
      ],
      G: [
        (v) => div(v.V! * v.V!, 254 * v.db!)! - v.a! / G,
        '{V}² ÷ (254 × {db}) − {a} ÷ 9.81',
        'Solve the braking distance for the grade.',
      ],
    },
  ),
  rule(
    'SSD = d_r + d_b',
    '{SSD} = {dr} + {db}',
    ['SSD', 'dr', 'db'],
    (v) => v.SSD! - v.dr! - v.db!,
    {
      SSD: [
        (v) => v.dr! + v.db!,
        '{dr} + {db}',
        'The car must stop within what the driver can see.',
      ],
      dr: [(v) => v.SSD! - v.db!, '{SSD} − {db}', 'Take d_b from the SSD.'],
      db: [(v) => v.SSD! - v.dr!, '{SSD} − {dr}', 'Take d_r from the SSD.'],
    },
  ),
);

const stoppingVars = (): VariableDef[] => [
  q('V', 'V', 'Design speed', 'km/h', 10, 200, 1),
  q('t', 't', 'Reaction time', 's', 0.5, 5, 0.1),
  q('a', 'a', 'Deceleration', 'm/s²', 1, 9, 0.1),
  q('G', 'G', 'Grade (+ uphill)', undefined, -0.12, 0.12, 0.01),
  q('dr', 'd_r', 'Reaction distance', 'm', 0.1, 1000, 0.1),
  q('db', 'd_b', 'Braking distance', 'm', 0.1, 2000, 0.1),
  q('SSD', 'SSD', 'Stopping sight distance', 'm', 0.1, 3000, 0.1),
];

function stoppingExample(V: number, t: number, a: number, Gr: number): Values {
  const dr = 0.278 * V * t;
  const db = (V * V) / (254 * (a / G + Gr));
  return { V, t, a, G: Gr, dr, db, SSD: dr + db };
}

const STOPPING_ASSUMPTIONS = [
  'AASHTO 2018: reaction time 2.5 s, deceleration 3.4 m/s².',
  'G is a decimal, + uphill; V in km/h gives metres.',
];

const STOPPING_SPEC: RoadCurveSpec = {
  kind: 'roadCurve',
  mode: 'stopping',
  speed: 'V',
  reaction: 't',
  decel: 'a',
  grade: 'G',
  g: G,
  reactionDistance: 'dr',
  brakingDistance: 'db',
  ssd: 'SSD',
  keep: ['t', 'a', 'G'],
};

const roadStopping: ModuleDef = {
  id: 'g.he-roadCurve-stopping',
  title: 'Stopping sight distance: reacting, then braking',
  use: 'Use this for the stopping sight distance at a design speed on a level road or a grade.',
  assumptions: STOPPING_ASSUMPTIONS,
  unitSystems: ['metric'],
  variables: stoppingVars(),
  ...STOPPING,
  example: stoppingExample(80, 2.5, 3.4, 0),
  startWith: ['V', 't', 'a', 'G'],
  representation: { ...STOPPING_SPEC },
};

const roadStoppingDown: ModuleDef = {
  id: 'g.he-roadCurve-stopping-downhill',
  title: 'Stopping on a 6% downgrade at 110 km/h',
  use: 'Use this for the longer braking distance down a steep grade at a high design speed.',
  assumptions: STOPPING_ASSUMPTIONS,
  unitSystems: ['metric'],
  variables: stoppingVars(),
  ...STOPPING,
  example: stoppingExample(110, 2.5, 3.4, -0.06),
  startWith: ['V', 't', 'a', 'G'],
  representation: { ...STOPPING_SPEC },
};

// ─── HC60: the least radius with superelevation (~horizontal-curve) ──────────

const RMIN = rules(
  rule(
    'R_min = V² ÷ (127(e + f))',
    '{R} = {V}² ÷ (127 × ({e} + {f}))',
    ['R', 'V', 'e', 'f'],
    (v) => v.R! * 127 * (v.e! + v.f!) - v.V! * v.V!,
    {
      R: [
        (v) => pos((v.V! * v.V!) / (127 * (v.e! + v.f!))),
        '{V}² ÷ (127 × ({e} + {f}))',
        'The bank and the side friction together supply the push toward the centre.',
      ],
      V: [
        (v) => pos(Math.sqrt(127 * v.R! * (v.e! + v.f!))),
        '√(127 × {R} × ({e} + {f}))',
        'Solve for the speed the curve allows.',
      ],
      e: [
        (v) => (v.V! * v.V!) / (127 * v.R!) - v.f!,
        '{V}² ÷ (127 × {R}) − {f}',
        'Solve for the bank.',
      ],
    },
  ),
);

const roadRadius: ModuleDef = {
  id: 'g.he-roadCurve-radius',
  title: 'The least radius of a banked curve',
  use: 'Use this for the smallest curve radius a design speed allows with a given bank and side friction.',
  assumptions: [
    'The car rounds the curve at the design speed; e and f are decimals.',
    'R_min = V² ÷ (127(e + f)) with V in km/h gives metres.',
  ],
  unitSystems: ['metric'],
  variables: [
    q('V', 'V', 'Design speed', 'km/h', 10, 200, 1),
    q('e', 'e', 'Superelevation', undefined, 0, 0.12, 0.01),
    q('f', 'f', 'Side friction factor', undefined, 0.05, 0.4, 0.01),
    q('R', 'R_min', 'Least radius', 'm', 1, 10000, 0.1),
  ],
  ...RMIN,
  example: { V: 100, e: 0.08, f: 0.12, R: (100 * 100) / (127 * 0.2) },
  startWith: ['V', 'e', 'f'],
  representation: { kind: 'roadCurve', mode: 'plan', speed: 'V', e: 'e', f: 'f', radius: 'R' },
};

// ─── HC60: curve elements (~curve-elements) ──────────────────────────────────

const half = (v: Values) => (v.D! * Math.PI) / 360;

const ELEMENTS = rules(
  rule(
    'L = RΔπ ÷ 180',
    '{L} = {R} × {D} × π ÷ 180',
    ['L', 'R', 'D'],
    (v) => v.L! - (v.R! * v.D! * Math.PI) / 180,
    {
      L: [
        (v) => (v.R! * v.D! * Math.PI) / 180,
        '{R} × {D} × π ÷ 180',
        'The arc’s length: R times Δ in radians.',
      ],
      R: [(v) => div(180 * v.L!, v.D! * Math.PI), '180 × {L} ÷ ({D} × π)', 'Solve for R.'],
      D: [(v) => div(180 * v.L!, v.R! * Math.PI), '180 × {L} ÷ ({R} × π)', 'Solve for Δ.'],
    },
  ),
  rule(
    'T = R tan(Δ ÷ 2)',
    '{T} = {R} × tan({D} ÷ 2)',
    ['T', 'R', 'D'],
    (v) => v.T! - v.R! * Math.tan(half(v)),
    {
      T: [
        (v) => v.R! * Math.tan(half(v)),
        '{R} × tan({D} ÷ 2)',
        'From the PC to the PI: half the deflection, in the right triangle with R.',
      ],
    },
  ),
  rule(
    'E = R(1 ÷ cos(Δ ÷ 2) − 1)',
    '{E} = {R} × (1 ÷ cos({D} ÷ 2) − 1)',
    ['E', 'R', 'D'],
    (v) => v.E! - v.R! * (1 / Math.cos(half(v)) - 1),
    {
      E: [
        (v) => v.R! * (1 / Math.cos(half(v)) - 1),
        '{R} × (1 ÷ cos({D} ÷ 2) − 1)',
        'From the PI to the middle of the curve.',
      ],
    },
  ),
);

const elementVars = (): VariableDef[] => [
  q('R', 'R', 'Radius', 'm', 1, 10000, 0.1),
  q('D', 'Δ', 'Deflection angle', '°', 1, 170, 0.1),
  q('L', 'L', 'Length of curve', 'm', 0.01, 50000, 0.01),
  q('T', 'T', 'Tangent length', 'm', 0.01, 100000, 0.01),
  q('E', 'E', 'External distance', 'm', 0.001, 100000, 0.001),
];

function elementExample(R: number, D: number): Values {
  const h = (D * Math.PI) / 360;
  return { R, D, L: (R * D * Math.PI) / 180, T: R * Math.tan(h), E: R * (1 / Math.cos(h) - 1) };
}

const ELEMENT_SPEC: RoadCurveSpec = {
  kind: 'roadCurve',
  mode: 'plan',
  radius: 'R',
  delta: 'D',
  length: 'L',
  tangent: 'T',
  external: 'E',
  keep: ['R'],
};

const roadElements: ModuleDef = {
  id: 'g.he-roadCurve-elements',
  title: 'A horizontal curve: its length, tangent and external distance',
  use: 'Use this for the length, tangent and external distance of a circular curve from R and Δ.',
  assumptions: ['A simple circular curve between two tangents; Δ in degrees.'],
  unitSystems: ['metric'],
  variables: elementVars(),
  ...ELEMENTS,
  example: elementExample(400, 30),
  startWith: ['R', 'D'],
  representation: { ...ELEMENT_SPEC },
};

const roadElementsSharp: ModuleDef = {
  id: 'g.he-roadCurve-elements-sharp',
  title: 'A sharp ramp curve: 60 m radius turning 110°',
  use: 'Use this for a tight curve with a large deflection, where the tangents grow longer than the radius.',
  assumptions: ['A simple circular curve between two tangents; Δ in degrees.'],
  unitSystems: ['metric'],
  variables: elementVars(),
  ...ELEMENTS,
  example: elementExample(60, 110),
  startWith: ['R', 'D'],
  representation: { ...ELEMENT_SPEC },
};

// ─── HC60: a crest vertical curve for sight distance (~crest-curve) ──────────

const fmt = (x: number) => formatNumber(Number(x.toPrecision(10)));

const crestL = (A: number, S: number) => {
  const long = (A * S * S) / 658;
  return long >= S ? long : 2 * S - 658 / A;
};

const CREST = rules(
  rule(
    'A = |G₁ − G₂|',
    '{A} = |{g1} − {g2}|',
    ['A', 'g1', 'g2'],
    (v) => v.A! - Math.abs(v.g1! - v.g2!),
    {
      A: [(v) => Math.abs(v.g1! - v.g2!), '|{g1} − {g2}|', 'The change of grade, in percent.'],
    },
  ),
);

const CREST_LENGTH = {
  relation: {
    id: 'L for sight distance S',
    display: '{L} = {A} × {S}² ÷ 658',
    vars: ['L', 'A', 'S'],
    residual: (v: Values) => v.L! - crestL(v.A!, v.S!),
    solve: { L: (v: Values) => pos(crestL(v.A!, v.S!)) },
    check: (v: Values) =>
      (v.A! * v.S! * v.S!) / 658 >= v.S!
        ? `${fmt(v.L!)} = ${fmt(v.A!)} × ${fmt(v.S!)}² ÷ 658`
        : `${fmt(v.L!)} = 2 × ${fmt(v.S!)} − 658 ÷ ${fmt(v.A!)}`,
  } satisfies Relation,
  steps: {
    L: {
      expr: (v: Values) =>
        (v.A! * v.S! * v.S!) / 658 >= v.S! ? '{A} × {S}² ÷ 658' : '2 × {S} − 658 ÷ {A}',
      how: (v: Values) =>
        (v.A! * v.S! * v.S!) / 658 >= v.S!
          ? 'The curve comes out longer than S, so the sight line lies over the curve: AS² ÷ 658.'
          : 'AS² ÷ 658 comes out shorter than S, so the line runs past the curve: 2S − 658 ÷ A.',
    },
  },
};

const crestVars = (): VariableDef[] => [
  q('g1', 'G₁', 'Grade in', '%', -10, 10, 0.1),
  q('g2', 'G₂', 'Grade out', '%', -10, 10, 0.1),
  q('A', 'A', 'Change of grade', '%', 0.01, 20, 0.01),
  q('S', 'S', 'Stopping sight distance', 'm', 1, 1000, 0.1),
  q('L', 'L', 'Length of the crest curve', 'm', 0.01, 10000, 0.01),
];

const CREST_SPEC: RoadCurveSpec = {
  kind: 'roadCurve',
  mode: 'profile',
  g1: 'g1',
  g2: 'g2',
  A: 'A',
  sight: 'S',
  curveLength: 'L',
  eye: 1.08,
  object: 0.6,
};

const CREST_ASSUMPTIONS = [
  'AASHTO: eye 1.08 m and object 0.60 m above the road, so 200(√h₁ + √h₂)² = 658.',
  'A parabolic curve; grades in percent.',
];

const crestExample = (g1: number, g2: number, S: number): Values => {
  const A = Math.abs(g1 - g2);
  return { g1, g2, A, S, L: crestL(A, S) };
};

const crestModule = (
  id: string,
  title: string,
  use: string,
  g1: number,
  g2: number,
  S: number,
): ModuleDef => ({
  id,
  title,
  use,
  assumptions: CREST_ASSUMPTIONS,
  unitSystems: ['metric'],
  variables: crestVars(),
  relations: [...CREST.relations, CREST_LENGTH.relation],
  steps: { ...CREST.steps, [CREST_LENGTH.relation.id]: CREST_LENGTH.steps },
  example: crestExample(g1, g2, S),
  startWith: ['g1', 'g2', 'S'],
  representation: { ...CREST_SPEC },
});

const roadCrest = crestModule(
  'g.he-roadCurve-crest',
  'A crest vertical curve long enough to see a stopped car',
  'Use this for the length of a crest vertical curve that gives the stopping sight distance.',
  3,
  -2,
  183.1,
);

const roadCrestShort = crestModule(
  'g.he-roadCurve-crest-short',
  'A gentle crest: the sight line runs past the curve',
  'Use this for a small change of grade, where the sight distance is longer than the curve.',
  1,
  -1,
  200,
);

// ─── HC61: a tension member's net section (steel-design#1~tension) ───────────

/** c = k × a × b, solved for c (the strength formulas). */
const scaled = (id: string, c: string, k: number, a: string, b: string, how: string) =>
  rule(id, `{${c}} = ${k} × {${a}} × {${b}}`, [c, a, b], (v) => v[c]! - k * v[a]! * v[b]!, {
    [c]: [(v) => k * v[a]! * v[b]!, `${k} × {${a}} × {${b}}`, how],
    [a]: [(v) => div(v[c]!, k * v[b]!), `{${c}} ÷ (${k} × {${b}})`, `Solve for ${a}.`],
  });

/** c = min(a, b): the smaller strength governs. */
const least = (c: string, a: string, b: string, how: string) =>
  rule(
    `${c} = min(${a}, ${b})`,
    `{${c}} = min({${a}}, {${b}})`,
    [c, a, b],
    (v) => v[c]! - Math.min(v[a]!, v[b]!),
    { [c]: [(v) => Math.min(v[a]!, v[b]!), `min({${a}}, {${b}})`, how] },
  );

const TENSION = rules(
  product('Ag', 'w', 't', 'The gross area: the whole width times the thickness.'),
  rule(
    'A_n = (w − holes × size)t',
    '{An} = ({w} − {nh} × {dh}) × {t}',
    ['An', 'w', 'nh', 'dh', 't'],
    (v) => v.An! - (v.w! - v.nh! * v.dh!) * v.t!,
    {
      An: [
        (v) => pos((v.w! - v.nh! * v.dh!) * v.t!),
        '({w} − {nh} × {dh}) × {t}',
        'The net area: the steel left on a line through the holes.',
      ],
      w: [(v) => v.An! / v.t! + v.nh! * v.dh!, '{An} ÷ {t} + {nh} × {dh}', 'Solve for the width.'],
      t: [(v) => div(v.An!, v.w! - v.nh! * v.dh!), '{An} ÷ ({w} − {nh} × {dh})', 'Solve for t.'],
    },
  ),
  product('Ae', 'U', 'An', 'The effective net area: shear lag U times A_n.'),
  scaled('φP_n yielding', 'Py', 0.9, 'Fy', 'Ag', 'Yielding of the whole plate, with φ = 0.90.'),
  scaled('φP_n rupture', 'Pr', 0.75, 'Fu', 'Ae', 'Rupture through the holes, with φ = 0.75.'),
  least('Pn', 'Py', 'Pr', 'The member is as strong as its weaker limit state.'),
);

const tensionVars = (): VariableDef[] => [
  q('w', 'w', 'Plate width', 'in', 0.5, 48, 0.125),
  q('t', 't', 'Plate thickness', 'in', 0.125, 4, 0.0625),
  q('nh', 'n_h', 'Holes across the section', undefined, 0, 12, 1, { integer: true }),
  q('dh', 'd_h', 'Hole size', 'in', 0.25, 2, 0.0625),
  q('Ag', 'A_g', 'Gross area', 'in²', 0.01, 200, 0.001),
  q('An', 'A_n', 'Net area', 'in²', 0.01, 200, 0.001),
  q('U', 'U', 'Shear lag factor', undefined, 0.4, 1, 0.01),
  q('Ae', 'A_e', 'Effective net area', 'in²', 0.01, 200, 0.001),
  q('Fy', 'F_y', 'Yield strength', 'ksi', 30, 100, 1),
  q('Fu', 'F_u', 'Tensile strength', 'ksi', 50, 120, 1),
  q('Py', 'φP_n,y', 'Design strength, yielding', 'kips', 0.01, 100000, 0.01),
  q('Pr', 'φP_n,r', 'Design strength, rupture', 'kips', 0.01, 100000, 0.01),
  q('Pn', 'φP_n', 'Design strength', 'kips', 0.01, 100000, 0.01),
];

function tensionExample(w: number, t: number, nh: number, dh: number, Fy: number, Fu: number) {
  const Ag = w * t;
  const An = (w - nh * dh) * t;
  const U = 1;
  const Ae = U * An;
  const Py = 0.9 * Fy * Ag;
  const Pr = 0.75 * Fu * Ae;
  return { w, t, nh, dh, Ag, An, U, Ae, Fy, Fu, Py, Pr, Pn: Math.min(Py, Pr) };
}

const TENSION_SPEC: ConnectionSpec = {
  kind: 'connection',
  mode: 'tension',
  plateWidth: 'w',
  t: 't',
  holes: 'nh',
  holeSize: 'dh',
  Ag: 'Ag',
  An: 'An',
  U: 'U',
  Ae: 'Ae',
  Fy: 'Fy',
  Fu: 'Fu',
  strength: 'Pn',
};

const TENSION_ASSUMPTIONS = [
  'AISC 360-22 LRFD; US units (in, ksi, kips).',
  'One straight row of holes across the plate; no staggered paths.',
  'U = 1 for a plate connected across its whole width.',
];

const connTension: ModuleDef = {
  id: 'g.he-connection-tension',
  title: 'A plate in tension: yielding against rupture at the holes',
  use: 'Use this for the design strength of a plate in tension with a row of bolt holes.',
  assumptions: TENSION_ASSUMPTIONS,
  unitSystems: ['us'],
  variables: tensionVars(),
  ...TENSION,
  pictureLabels: ['Py', 'Pr'],
  example: tensionExample(6, 0.5, 2, 1, 36, 58),
  startWith: ['w', 't', 'nh', 'dh', 'U', 'Fy', 'Fu'],
  representation: { ...TENSION_SPEC },
};

const connTensionWide: ModuleDef = {
  id: 'g.he-connection-tension-wide',
  title: 'A wide plate with four holes across',
  use: 'Use this for a wide plate where many holes cut the net section.',
  assumptions: TENSION_ASSUMPTIONS,
  unitSystems: ['us'],
  variables: tensionVars(),
  ...TENSION,
  pictureLabels: ['Py', 'Pr'],
  example: tensionExample(10, 0.75, 4, 1, 50, 65),
  startWith: ['w', 't', 'nh', 'dh', 'U', 'Fy', 'Fu'],
  representation: { ...TENSION_SPEC },
};

// ─── HC61: a bolt group in single shear (steel-design#3) ─────────────────────

const BOLTS = rules(
  rule(
    'A_b = πd² ÷ 4',
    '{Ab} = π × {d}² ÷ 4',
    ['Ab', 'd'],
    (v) => v.Ab! - (Math.PI * v.d! * v.d!) / 4,
    {
      Ab: [
        (v) => (Math.PI * v.d! * v.d!) / 4,
        'π × {d}² ÷ 4',
        'The bolt’s area from its diameter.',
      ],
      d: [(v) => pos(Math.sqrt((4 * v.Ab!) / Math.PI)), '√(4 × {Ab} ÷ π)', 'Solve for d.'],
    },
  ),
  scaled('φr_n = 0.75F_nvA_b', 'rn', 0.75, 'Fnv', 'Ab', 'One bolt cut once, with φ = 0.75.'),
  product('Rn', 'n', 'rn', 'Every bolt carries an equal share.'),
);

const boltVars = (): VariableDef[] => [
  q('d', 'd', 'Bolt diameter', 'in', 0.625, 1, 0.125, { allowed: [0.625, 0.75, 0.875, 1] }),
  q('Fnv', 'F_nv', 'Nominal shear stress', 'ksi', 54, 68, 1, { allowed: [54, 68] }),
  q('n', 'n', 'Number of bolts', undefined, 1, 24, 1, { integer: true }),
  q('Ab', 'A_b', 'Bolt area', 'in²', 0.01, 5, 0.001),
  q('rn', 'φr_n', 'Strength of one bolt', 'kips', 0.01, 1000, 0.01),
  q('Rn', 'φR_n', 'Strength of the group', 'kips', 0.01, 100000, 0.01),
];

const boltExample = (d: number, Fnv: number, n: number): Values => {
  const Ab = (Math.PI * d * d) / 4;
  const rn = 0.75 * Fnv * Ab;
  return { d, Fnv, n, Ab, rn, Rn: n * rn };
};

const BOLT_SPEC: ConnectionSpec = {
  kind: 'connection',
  mode: 'bolts',
  d: 'd',
  n: 'n',
  Ab: 'Ab',
  Fnv: 'Fnv',
  perBolt: 'rn',
  strength: 'Rn',
};

const BOLT_ASSUMPTIONS = [
  'One shear plane; standard holes; bearing at the holes checked on its own.',
  'Group A bolts: F_nv = 54 ksi with threads in the shear plane, 68 ksi without.',
];

const connBolts: ModuleDef = {
  id: 'g.he-connection-bolts',
  title: 'A lap splice: four bolts in single shear',
  use: 'Use this for the shear strength of a bolt group in a lap splice.',
  assumptions: BOLT_ASSUMPTIONS,
  unitSystems: ['us'],
  variables: boltVars(),
  ...BOLTS,
  example: boltExample(0.75, 54, 4),
  startWith: ['d', 'Fnv', 'n'],
  representation: { ...BOLT_SPEC },
};

const connBoltsSeven: ModuleDef = {
  id: 'g.he-connection-bolts-seven',
  title: 'Seven 1 in bolts, threads clear of the shear plane',
  use: 'Use this for a larger bolt group with the threads excluded from the shear plane.',
  assumptions: BOLT_ASSUMPTIONS,
  unitSystems: ['us'],
  variables: boltVars(),
  ...BOLTS,
  example: boltExample(1, 68, 7),
  startWith: ['d', 'Fnv', 'n'],
  representation: { ...BOLT_SPEC },
};

// ─── HC61: fillet welds (steel-design#3~weld) ────────────────────────────────

const WELD = rules(
  rule('throat = 0.707w', '{th} = 0.707 × {w}', ['th', 'w'], (v) => v.th! - 0.707 * v.w!, {
    th: [(v) => 0.707 * v.w!, '0.707 × {w}', 'The throat of an equal-leg fillet, at 45°.'],
    w: [(v) => v.th! / 0.707, '{th} ÷ 0.707', 'Solve for the leg.'],
  }),
  scaled('φR_n per inch', 'qw', 0.45, 'Fexx', 'th', 'Per inch: 0.75 × 0.6F_EXX on the throat.'),
  rule('φR_n = 2Lq', '{R} = 2 × {L} × {qw}', ['R', 'L', 'qw'], (v) => v.R! - 2 * v.L! * v.qw!, {
    R: [(v) => 2 * v.L! * v.qw!, '2 × {L} × {qw}', 'Two welds, each L long.'],
    L: [(v) => div(v.R!, 2 * v.qw!), '{R} ÷ (2 × {qw})', 'Solve for the length of each weld.'],
  }),
);

const weldVars = (): VariableDef[] => [
  q('w', 'w', 'Fillet leg', 'in', 0.125, 1, 0.0625),
  q('Fexx', 'F_EXX', 'Electrode strength', 'ksi', 60, 110, 10),
  q('L', 'L', 'Length of each weld', 'in', 0.5, 100, 0.25),
  q('th', 'throat', 'Throat', 'in', 0.01, 1, 0.0001),
  q('qw', 'φR_n/in', 'Strength per inch', 'kip/in', 0.01, 100, 0.01),
  q('R', 'φR_n', 'Strength of both welds', 'kips', 0.01, 10000, 0.01),
];

const weldExample = (w: number, Fexx: number, L: number): Values => {
  const th = 0.707 * w;
  const qw = 0.45 * Fexx * th;
  return { w, Fexx, L, th, qw, R: 2 * L * qw };
};

const connWeld: ModuleDef = {
  id: 'g.he-connection-weld',
  title: 'Two fillet welds: the throat and the strength per inch',
  use: 'Use this for the design strength of fillet welds from the leg, the electrode and the length.',
  assumptions: [
    'Equal-leg fillets loaded in shear along their length; E70 electrode unless typed.',
    'φ = 0.75 on 0.6F_EXX over the throat 0.707w.',
  ],
  unitSystems: ['us'],
  variables: weldVars(),
  ...WELD,
  example: weldExample(0.25, 70, 10),
  startWith: ['w', 'Fexx', 'L'],
  representation: {
    kind: 'connection',
    mode: 'weld',
    weldLeg: 'w',
    weldLength: 'L',
    welds: 2,
    Fexx: 'Fexx',
    throat: 'th',
    perInch: 'qw',
    strength: 'R',
  },
};

// ─── HC61: block shear (steel-design#3~block-shear) ──────────────────────────

const BLOCK = rules(
  scaled(
    'shear rupture 0.6F_uA_nv',
    'Vr',
    0.6,
    'Fu',
    'Anv',
    'Shear rupture on the net shear plane.',
  ),
  scaled(
    'shear yielding 0.6F_yA_gv',
    'Vy',
    0.6,
    'Fy',
    'Agv',
    'Shear yielding on the gross shear plane: the cap.',
  ),
  rule(
    'tension rupture U_bsF_uA_nt',
    '{Tn} = {Ubs} × {Fu} × {Ant}',
    ['Tn', 'Ubs', 'Fu', 'Ant'],
    (v) => v.Tn! - v.Ubs! * v.Fu! * v.Ant!,
    {
      Tn: [
        (v) => v.Ubs! * v.Fu! * v.Ant!,
        '{Ubs} × {Fu} × {Ant}',
        'Tension rupture on the net tension plane.',
      ],
      Ubs: [(v) => div(v.Tn!, v.Fu! * v.Ant!), '{Tn} ÷ ({Fu} × {Ant})', 'Solve for U_bs.'],
      Ant: [(v) => div(v.Tn!, v.Ubs! * v.Fu!), '{Tn} ÷ ({Ubs} × {Fu})', 'Solve for A_nt.'],
    },
  ),
  rule(
    'φR_n = 0.75(min(shear) + tension)',
    '{Rn} = 0.75 × (min({Vr}, {Vy}) + {Tn})',
    ['Rn', 'Vr', 'Vy', 'Tn'],
    (v) => v.Rn! - 0.75 * (Math.min(v.Vr!, v.Vy!) + v.Tn!),
    {
      Rn: [
        (v) => 0.75 * (Math.min(v.Vr!, v.Vy!) + v.Tn!),
        '0.75 × (min({Vr}, {Vy}) + {Tn})',
        'The weaker shear plane plus the tension plane, with φ = 0.75.',
      ],
      Tn: [
        (v) => v.Rn! / 0.75 - Math.min(v.Vr!, v.Vy!),
        '{Rn} ÷ 0.75 − min({Vr}, {Vy})',
        'Take the weaker shear plane from R_n ÷ 0.75.',
      ],
    },
  ),
  {
    relation: {
      id: 'A_nv ≤ A_gv',
      constraint: true,
      display: '{Anv} is at most {Agv}',
      vars: ['Anv', 'Agv'],
      residual: (v: Values) => (v.Anv! <= v.Agv! ? 0 : 1),
      solve: {},
    } satisfies Relation,
    steps: {},
  },
);

const blockVars = (): VariableDef[] => [
  q('Agv', 'A_gv', 'Gross shear area', 'in²', 0.01, 100, 0.01),
  q('Anv', 'A_nv', 'Net shear area', 'in²', 0.01, 100, 0.01),
  q('Ant', 'A_nt', 'Net tension area', 'in²', 0.01, 100, 0.01),
  q('Fy', 'F_y', 'Yield strength', 'ksi', 30, 100, 1),
  q('Fu', 'F_u', 'Tensile strength', 'ksi', 50, 120, 1),
  q('Ubs', 'U_bs', 'Tension stress factor', undefined, 0.5, 1, 0.5),
  q('Vr', 'R_vr', 'Shear rupture', 'kips', 0.01, 100000, 0.01, { derived: true }),
  q('Vy', 'R_vy', 'Shear yielding', 'kips', 0.01, 100000, 0.01, { derived: true }),
  q('Tn', 'R_t', 'Tension rupture', 'kips', 0.01, 100000, 0.01, { derived: true }),
  q('Rn', 'φR_n', 'Block shear strength', 'kips', 0.01, 100000, 0.01, { derived: true }),
];

const blockExample = (Agv: number, Anv: number, Ant: number, Fy: number, Fu: number) => {
  const Vr = 0.6 * Fu * Anv;
  const Vy = 0.6 * Fy * Agv;
  const Tn = Fu * Ant;
  return { Agv, Anv, Ant, Fy, Fu, Ubs: 1, Vr, Vy, Tn, Rn: 0.75 * (Math.min(Vr, Vy) + Tn) };
};

const BLOCK_SPEC: ConnectionSpec = {
  kind: 'connection',
  mode: 'blockShear',
  Agv: 'Agv',
  Anv: 'Anv',
  Ant: 'Ant',
  Fy: 'Fy',
  Fu: 'Fu',
  Ubs: 'Ubs',
  strength: 'Rn',
  holes: 3,
};

const BLOCK_ASSUMPTIONS = [
  'AISC 360-22 J4.3, LRFD with φ = 0.75; one line of three bolts.',
  'U_bs = 1 where the tension stress is uniform.',
];

const connBlock: ModuleDef = {
  id: 'g.he-connection-blockShear',
  title: 'Block shear: the end of a plate tearing out',
  use: 'Use this for the block shear strength of a bolted end from its shear and tension areas.',
  assumptions: BLOCK_ASSUMPTIONS,
  unitSystems: ['us'],
  variables: blockVars(),
  ...BLOCK,
  pictureLabels: ['Vr', 'Vy', 'Tn'],
  example: blockExample(3, 2.25, 0.75, 36, 58),
  startWith: ['Agv', 'Anv', 'Ant', 'Fy', 'Fu', 'Ubs'],
  representation: { ...BLOCK_SPEC },
};

const connBlockRupture: ModuleDef = {
  id: 'g.he-connection-blockShear-rupture',
  title: 'Block shear with large holes: rupture governs',
  use: 'Use this for block shear where the holes take so much of the shear plane that rupture governs.',
  assumptions: BLOCK_ASSUMPTIONS,
  unitSystems: ['us'],
  variables: blockVars(),
  ...BLOCK,
  pictureLabels: ['Vr', 'Vy', 'Tn'],
  example: blockExample(3, 1.5, 0.75, 36, 58),
  startWith: ['Agv', 'Anv', 'Ant', 'Fy', 'Fu', 'Ubs'],
  representation: { ...BLOCK_SPEC },
};

// ─── HC89: the NRCS curve number (hydraulics-hydrology#2) ────────────────────

const runoff = (v: Values) => (v.P! > v.Ia! ? (v.P! - v.Ia!) ** 2 / (v.P! + 0.8 * v.S!) : 0);

const CURVE_NUMBER = rules(
  rule(
    'S = 1000 ÷ CN − 10',
    '{S} = 1000 ÷ {CN} − 10',
    ['S', 'CN'],
    (v) => v.S! - (1000 / v.CN! - 10),
    {
      S: [
        (v) => div(1000, v.CN!)! - 10,
        '1000 ÷ {CN} − 10',
        'The most the ground can hold, in inches.',
      ],
      CN: [(v) => div(1000, v.S! + 10), '1000 ÷ ({S} + 10)', 'Solve for the curve number.'],
    },
  ),
  rule('I_a = 0.2S', '{Ia} = 0.2 × {S}', ['Ia', 'S'], (v) => v.Ia! - 0.2 * v.S!, {
    Ia: [(v) => 0.2 * v.S!, '0.2 × {S}', 'The first rain, caught before any runs off.'],
    S: [(v) => v.Ia! / 0.2, '{Ia} ÷ 0.2', 'Solve for S.'],
  }),
  {
    relation: {
      id: 'Q = (P − I_a)² ÷ (P + 0.8S)',
      display: '{Q} = ({P} − {Ia})² ÷ ({P} + 0.8 × {S})',
      vars: ['Q', 'P', 'Ia', 'S'],
      residual: (v: Values) => v.Q! - runoff(v),
      solve: { Q: (v: Values) => runoff(v) },
      check: (v: Values) =>
        v.P! > v.Ia!
          ? `${fmt(v.Q!)} = (${fmt(v.P!)} − ${fmt(v.Ia!)})² ÷ (${fmt(v.P!)} + 0.8 × ${fmt(v.S!)})`
          : `${fmt(v.Q!)} = 0`,
    } satisfies Relation,
    steps: {
      Q: {
        expr: (v: Values) => (v.P! > v.Ia! ? '({P} − {Ia})² ÷ ({P} + 0.8 × {S})' : '0'),
        how: (v: Values) =>
          v.P! > v.Ia!
            ? 'Past I_a, the runoff grows toward the rain as the ground fills.'
            : 'The rain is no more than I_a: none runs off.',
      },
    },
  },
  rule(
    'F = P − I_a − Q',
    '{F} = {P} − {Ia} − {Q}',
    ['F', 'P', 'Ia', 'Q'],
    (v) => v.F! - (v.P! - v.Ia! - v.Q!),
    {
      F: [(v) => v.P! - v.Ia! - v.Q!, '{P} − {Ia} − {Q}', 'What is left of the rain soaks in.'],
    },
  ),
);

const cnVars = (): VariableDef[] => [
  q('CN', 'CN', 'Curve number', undefined, 30, 98, 1),
  q('S', 'S', 'Potential retention', 'in', 0.2, 24, 0.01),
  q('Ia', 'I_a', 'Initial abstraction', 'in', 0.04, 5, 0.01),
  q('P', 'P', 'Rainfall', 'in', 0.1, 20, 0.01),
  q('Q', 'Q', 'Runoff', 'in', 0, 20, 0.01),
  q('F', 'F', 'Infiltration', 'in', 0, 20, 0.01),
];

const cnExample = (CN: number, P: number): Values => {
  const S = 1000 / CN - 10;
  const Ia = 0.2 * S;
  const Q = P > Ia ? (P - Ia) ** 2 / (P + 0.8 * S) : 0;
  return { CN, S, Ia, P, Q, F: P - Ia - Q };
};

const CN_SPEC: HydrographSpec = {
  kind: 'hydrograph',
  mode: 'split',
  CN: 'CN',
  S: 'S',
  Ia: 'Ia',
  P: 'P',
  Q: 'Q',
  F: 'F',
  depthUnit: 'in',
  keep: ['CN'],
};

const CN_ASSUMPTIONS = [
  'US units, as NRCS TR-55 publishes the method; average soil moisture.',
  'I_a = 0.2S, the ratio of the method.',
];

const hydroSplit: ModuleDef = {
  id: 'g.he-hydrograph-split',
  title: 'Runoff by the curve number: where a storm’s rain goes',
  use: 'Use this for the runoff depth from a storm by the NRCS curve number.',
  assumptions: CN_ASSUMPTIONS,
  unitSystems: ['us'],
  variables: cnVars(),
  ...CURVE_NUMBER,
  example: cnExample(80, 4),
  startWith: ['CN', 'P'],
  representation: { ...CN_SPEC },
};

const hydroSplitLight: ModuleDef = {
  id: 'g.he-hydrograph-split-light',
  title: 'A light storm on woodland: almost nothing runs off',
  use: 'Use this for a small storm on absorbent ground, where the rain barely passes I_a.',
  assumptions: CN_ASSUMPTIONS,
  unitSystems: ['us'],
  variables: cnVars(),
  ...CURVE_NUMBER,
  example: cnExample(65, 1.5),
  startWith: ['CN', 'P'],
  representation: { ...CN_SPEC },
};

// ─── HC89: the rational method (~rational) ───────────────────────────────────

const RATIONAL = rules(
  rule(
    'Q = CiA ÷ 360',
    '{Q} = {C} × {i} × {A} ÷ 360',
    ['Q', 'C', 'i', 'A'],
    (v) => v.Q! - (v.C! * v.i! * v.A!) / 360,
    {
      Q: [
        (v) => (v.C! * v.i! * v.A!) / 360,
        '{C} × {i} × {A} ÷ 360',
        'The share C of the rain falling on A runs off.',
      ],
      C: [(v) => div(360 * v.Q!, v.i! * v.A!), '360 × {Q} ÷ ({i} × {A})', 'Solve for C.'],
      i: [
        (v) => div(360 * v.Q!, v.C! * v.A!),
        '360 × {Q} ÷ ({C} × {A})',
        'Solve for the intensity.',
      ],
      A: [(v) => div(360 * v.Q!, v.C! * v.i!), '360 × {Q} ÷ ({C} × {i})', 'Solve for the area.'],
    },
  ),
);

const rationalVars = (): VariableDef[] => [
  q('C', 'C', 'Runoff coefficient', undefined, 0.05, 1, 0.01),
  q('i', 'i', 'Rainfall intensity', 'mm/h', 1, 500, 0.1),
  q('A', 'A', 'Watershed area', 'ha', 0.1, 5000, 0.1),
  q('Q', 'Q_p', 'Peak flow', 'm³/s', 0.0001, 10000, 0.001),
];

const RATIONAL_ASSUMPTIONS = [
  'A small watershed; the storm lasts at least the time of concentration.',
  'i in mm/h and A in hectares: dividing by 360 gives m³/s.',
];

const hydroRational: ModuleDef = {
  id: 'g.he-hydrograph-rational',
  title: 'The rational method: peak flow from a small watershed',
  use: 'Use this for the peak flow from a small watershed by Q = CiA.',
  assumptions: RATIONAL_ASSUMPTIONS,
  unitSystems: ['metric'],
  variables: rationalVars(),
  ...RATIONAL,
  example: { C: 0.6, i: 50, A: 20, Q: (0.6 * 50 * 20) / 360 },
  startWith: ['C', 'i', 'A'],
  representation: { kind: 'hydrograph', mode: 'rational', C: 'C', i: 'i', A: 'A', Qp: 'Q' },
};

const hydroRationalPeak: ModuleDef = {
  id: 'g.he-hydrograph-rational-tc',
  title: 'A paved catchment: the peak arrives at the time of concentration',
  use: 'Use this for the peak flow of a paved catchment and when it arrives.',
  assumptions: RATIONAL_ASSUMPTIONS,
  unitSystems: ['metric'],
  standalone: {
    vars: ['tc'],
    why: 't_c is when the peak arrives (the storm lasts that long); no formula here uses it.',
  },
  variables: [...rationalVars(), q('tc', 't_c', 'Time of concentration', 'min', 1, 600, 0.1)],
  ...RATIONAL,
  example: { C: 0.85, i: 120, A: 5, Q: (0.85 * 120 * 5) / 360, tc: 16.7 },
  startWith: ['C', 'i', 'A', 'tc'],
  representation: {
    kind: 'hydrograph',
    mode: 'rational',
    C: 'C',
    i: 'i',
    A: 'A',
    Qp: 'Q',
    tc: 'tc',
  },
};

// ─── HC89: detention storage (hydraulics-hydrology#3~detention) ──────────────

const DETENTION = rules(
  rule(
    'V = ½t_b(Q_i − Q_o)',
    '{V} = 0.5 × {tb} × 3600 × ({Qi} − {Qo})',
    ['V', 'tb', 'Qi', 'Qo'],
    (v) => v.V! - 0.5 * v.tb! * 3600 * (v.Qi! - v.Qo!),
    {
      V: [
        (v) => pos(0.5 * v.tb! * 3600 * (v.Qi! - v.Qo!)),
        '0.5 × {tb} × 3600 × ({Qi} − {Qo})',
        'The two triangles share their base; the storage is their difference (3600 s an hour).',
      ],
      Qo: [
        (v) => v.Qi! - v.V! / (1800 * v.tb!),
        '{Qi} − {V} ÷ (1800 × {tb})',
        'Solve for the outflow peak.',
      ],
      Qi: [
        (v) => v.Qo! + v.V! / (1800 * v.tb!),
        '{Qo} + {V} ÷ (1800 × {tb})',
        'Solve for the inflow peak.',
      ],
    },
  ),
  {
    relation: {
      id: 'Q_o < Q_i',
      constraint: true,
      display: '{Qo} is less than {Qi}',
      vars: ['Qo', 'Qi'],
      residual: (v: Values) => (v.Qo! < v.Qi! ? 0 : 1),
      solve: {},
    } satisfies Relation,
    steps: {},
  },
);

const detentionVars = (): VariableDef[] => [
  q('Qi', 'Q_i', 'Inflow peak', 'm³/s', 0.01, 1000, 0.01),
  q('Qo', 'Q_o', 'Allowed outflow peak', 'm³/s', 0.01, 1000, 0.01),
  q('tb', 't_b', 'Base time', 'h', 0.1, 48, 0.1),
  q('V', 'V', 'Storage volume', 'm³', 1, 1e8, 1),
];

const DETENTION_SPEC: HydrographSpec = {
  kind: 'hydrograph',
  mode: 'detention',
  Qin: 'Qi',
  Qout: 'Qo',
  tb: 'tb',
  V: 'V',
  tbSeconds: 3600,
  keep: ['Qi', 'tb'],
};

const DETENTION_ASSUMPTIONS = [
  'Triangular inflow and outflow hydrographs on the same base t_b.',
  'The outflow peaks where it meets the inflow’s falling limb.',
];

const detExample = (Qi: number, Qo: number, tb: number): Values => ({
  Qi,
  Qo,
  tb,
  V: 0.5 * tb * 3600 * (Qi - Qo),
});

const hydroDetention: ModuleDef = {
  id: 'g.he-hydrograph-detention',
  title: 'A detention pond: the storage between inflow and outflow',
  use: 'Use this for the storage a detention pond needs to cut a peak flow to an allowed outflow.',
  assumptions: DETENTION_ASSUMPTIONS,
  unitSystems: ['metric'],
  variables: detentionVars(),
  ...DETENTION,
  example: detExample(3, 1.2, 2),
  startWith: ['Qi', 'Qo', 'tb'],
  representation: { ...DETENTION_SPEC },
};

const hydroDetentionSmall: ModuleDef = {
  id: 'g.he-hydrograph-detention-small',
  title: 'Trimming a peak only a little: a small pond',
  use: 'Use this for a pond that only trims the peak, so it stores little.',
  assumptions: DETENTION_ASSUMPTIONS,
  unitSystems: ['metric'],
  variables: detentionVars(),
  ...DETENTION,
  example: detExample(3, 2.7, 2),
  startWith: ['Qi', 'Qo', 'tb'],
  representation: { ...DETENTION_SPEC },
};

// ─── HC90: proportional feedback (process-control#1) ─────────────────────────

const LOOP = rules(
  product('K', 'Kc', 'Kp', 'Around the loop the gains multiply.'),
  rule(
    'final = R × K ÷ (1 + K)',
    '{y} = {r} × {K} ÷ (1 + {K})',
    ['y', 'r', 'K'],
    (v) => v.y! * (1 + v.K!) - v.r! * v.K!,
    {
      y: [
        (v) => (v.r! * v.K!) / (1 + v.K!),
        '{r} × {K} ÷ (1 + {K})',
        'With P control alone the output settles short of the setpoint.',
      ],
      r: [
        (v) => div(v.y! * (1 + v.K!), v.K!),
        '{y} × (1 + {K}) ÷ {K}',
        'Solve for the setpoint change.',
      ],
    },
  ),
  rule('offset = R − final', '{e} = {r} − {y}', ['e', 'r', 'y'], (v) => v.e! - (v.r! - v.y!), {
    e: [(v) => v.r! - v.y!, '{r} − {y}', 'What is left over: the offset.'],
    y: [(v) => v.r! - v.e!, '{r} − {e}', 'Take the offset from the setpoint.'],
  }),
  rule(
    'τ_cl = τ ÷ (1 + K)',
    '{tcl} = {tau} ÷ (1 + {K})',
    ['tcl', 'tau', 'K'],
    (v) => v.tcl! * (1 + v.K!) - v.tau!,
    {
      tcl: [
        (v) => v.tau! / (1 + v.K!),
        '{tau} ÷ (1 + {K})',
        'Feedback speeds the response by 1 + K.',
      ],
      tau: [(v) => v.tcl! * (1 + v.K!), '{tcl} × (1 + {K})', 'Solve for the process’s τ.'],
    },
  ),
);

const loopVars = (): VariableDef[] => [
  q('Kc', 'K_c', 'Controller gain', undefined, 0.01, 1000, 0.01),
  q('Kp', 'K_p', 'Process gain', undefined, 0.01, 1000, 0.01),
  q('tau', 'τ', 'Process time constant', 'min', 0.01, 1000, 0.01),
  q('r', 'R', 'Setpoint change', undefined, 0.01, 1000, 0.01),
  q('K', 'K_cK_p', 'Loop gain', undefined, 0.0001, 1e6, 0.0001),
  q('y', 'Y_final', 'Final value', undefined, 0.0001, 1000, 0.0001),
  q('e', 'offset', 'Offset', undefined, 0.0001, 1000, 0.0001),
  q('tcl', 'τ_cl', 'Closed-loop time constant', 'min', 0.0001, 1000, 0.0001),
];

const loopExample = (Kc: number, Kp: number, tau: number, r: number): Values => {
  const K = Kc * Kp;
  const y = (r * K) / (1 + K);
  return { Kc, Kp, tau, r, K, y, e: r - y, tcl: tau / (1 + K) };
};

const LOOP_SPEC: BlockDiagramSpec = {
  kind: 'blockDiagram',
  mode: 'feedback',
  Kc: 'Kc',
  Kp: 'Kp',
  tau: 'tau',
  setpoint: 'r',
  loopGain: 'K',
  final: 'y',
  offset: 'e',
  tauCl: 'tcl',
  sensor: 1,
};

const LOOP_ASSUMPTIONS = [
  'Proportional-only control of a first-order process.',
  'An ideal sensor and valve (gain 1); deviation variables.',
];

const blockFeedback: ModuleDef = {
  id: 'g.he-blockDiagram-feedback',
  title: 'Proportional control: the offset and the faster loop',
  use: 'Use this for the offset and the closed-loop time constant of P control on a first-order process.',
  assumptions: LOOP_ASSUMPTIONS,
  unitSystems: ['metric'],
  variables: loopVars(),
  ...LOOP,
  pictureLabels: ['K', 'y', 'e', 'tcl'],
  example: loopExample(4, 2, 10, 5),
  startWith: ['Kc', 'Kp', 'tau', 'r'],
  representation: { ...LOOP_SPEC },
};

const blockFeedbackHigh: ModuleDef = {
  id: 'g.he-blockDiagram-feedback-high',
  title: 'A high controller gain: a small offset and a fast loop',
  use: 'Use this for P control with a large gain, where the offset shrinks but never vanishes.',
  assumptions: LOOP_ASSUMPTIONS,
  unitSystems: ['metric'],
  variables: loopVars(),
  ...LOOP,
  pictureLabels: ['K', 'y', 'e', 'tcl'],
  example: loopExample(25, 2, 10, 5),
  startWith: ['Kc', 'Kp', 'tau', 'r'],
  representation: { ...LOOP_SPEC },
};

// ─── HC90: three equal lags (process-control#3) ──────────────────────────────

const secPow = (n: number) => (1 / Math.cos(Math.PI / n)) ** n;

const LAGS = rules(
  rule(
    'K_c,uK_p = sec(π ÷ n)ⁿ',
    '{Kcu} = (1 ÷ cos(π ÷ {n}))^{n} ÷ {Kp}',
    ['Kcu', 'n', 'Kp'],
    (v) => v.Kcu! * v.Kp! - secPow(v.n!),
    {
      Kcu: [
        (v) => div(secPow(v.n!), v.Kp!),
        '(1 ÷ cos(π ÷ {n}))^{n} ÷ {Kp}',
        'At the edge each lag turns π ÷ n and the loop gain reaches sec(π ÷ n)ⁿ: 8 for three lags.',
      ],
      Kp: [(v) => div(secPow(v.n!), v.Kcu!), '(1 ÷ cos(π ÷ {n}))^{n} ÷ {Kcu}', 'Solve for K_p.'],
    },
  ),
  rule(
    'ω_u = tan(π ÷ n) ÷ τ',
    '{wu} = tan(π ÷ {n}) ÷ {tau}',
    ['wu', 'n', 'tau'],
    (v) => v.wu! * v.tau! - Math.tan(Math.PI / v.n!),
    {
      wu: [
        (v) => div(Math.tan(Math.PI / v.n!), v.tau!),
        'tan(π ÷ {n}) ÷ {tau}',
        'Where the phase reaches −180°: tan 60° = √3 for three lags.',
      ],
      tau: [(v) => div(Math.tan(Math.PI / v.n!), v.wu!), 'tan(π ÷ {n}) ÷ {wu}', 'Solve for τ.'],
    },
  ),
  rule('P_u = 2π ÷ ω_u', '{Pu} = 2 × π ÷ {wu}', ['Pu', 'wu'], (v) => v.Pu! * v.wu! - 2 * Math.PI, {
    Pu: [(v) => div(2 * Math.PI, v.wu!), '2 × π ÷ {wu}', 'The period of the steady oscillation.'],
    wu: [(v) => div(2 * Math.PI, v.Pu!), '2 × π ÷ {Pu}', 'Solve for ω_u.'],
  }),
);

const blockLags: ModuleDef = {
  id: 'g.he-blockDiagram-lags',
  title: 'Three equal lags: the ultimate gain and period',
  use: 'Use this for the gain that brings a loop of equal lags to the edge of stability, and its period.',
  assumptions: [
    'n equal first-order lags under P control (three on this page).',
    'The Routh array, or s = iω, gives K_cK_p = 8 and ω_uτ = √3 for three lags.',
  ],
  unitSystems: ['metric'],
  variables: [
    q('n', 'n', 'Equal lags', undefined, 3, 8, 1, { integer: true }),
    q('tau', 'τ', 'Each lag’s time constant', 'min', 0.01, 1000, 0.01),
    q('Kp', 'K_p', 'Process gain', undefined, 0.01, 1000, 0.01),
    q('Kcu', 'K_c,u', 'Ultimate gain', undefined, 0.0001, 1e6, 0.0001),
    q('wu', 'ω_u', 'Crossover frequency', 'rad/min', 0.0001, 1000, 0.0001),
    q('Pu', 'P_u', 'Ultimate period', 'min', 0.001, 1e6, 0.001),
  ],
  ...LAGS,
  example: {
    n: 3,
    tau: 2,
    Kp: 0.5,
    Kcu: 16,
    wu: Math.sqrt(3) / 2,
    Pu: (4 * Math.PI) / Math.sqrt(3),
  },
  startWith: ['n', 'tau', 'Kp'],
  representation: {
    kind: 'blockDiagram',
    mode: 'lags',
    lags: 'n',
    tau: 'tau',
    Kp: 'Kp',
    Kc: 'Kcu',
    Kcu: 'Kcu',
    wu: 'wu',
    Pu: 'Pu',
  },
};

// ─── HC90: static feedforward (process-control#3~feedforward) ────────────────

const FEEDFORWARD = rules(
  rule(
    'K_ff = −K_d ÷ K_p',
    '{Kff} = −{Kd} ÷ {Kp}',
    ['Kff', 'Kd', 'Kp'],
    (v) => v.Kff! * v.Kp! + v.Kd!,
    {
      Kff: [
        (v) => div(-v.Kd!, v.Kp!),
        '−{Kd} ÷ {Kp}',
        'Through the process it must cancel K_d at the output.',
      ],
      Kd: [(v) => -v.Kff! * v.Kp!, '−{Kff} × {Kp}', 'Solve for K_d.'],
      Kp: [(v) => div(-v.Kd!, v.Kff!), '−{Kd} ÷ {Kff}', 'Solve for K_p.'],
    },
  ),
);

const ffVars = (): VariableDef[] => [
  q('Kd', 'K_d', 'Disturbance gain', undefined, -100, 100, 0.01),
  q('Kp', 'K_p', 'Process gain', undefined, 0.01, 100, 0.01),
  q('Kff', 'K_ff', 'Feedforward gain', undefined, -1000, 1000, 0.0001),
];

const blockFeedforward: ModuleDef = {
  id: 'g.he-blockDiagram-feedforward',
  title: 'Static feedforward: cancelling a measured disturbance',
  use: 'Use this for the feedforward gain that cancels a measured disturbance at steady state.',
  assumptions: ['Steady-state gains only (no dynamics); the disturbance is measured.'],
  unitSystems: ['metric'],
  variables: ffVars(),
  ...FEEDFORWARD,
  example: { Kd: 1.5, Kp: 3, Kff: -0.5 },
  startWith: ['Kd', 'Kp'],
  representation: { kind: 'blockDiagram', mode: 'feedforward', Kd: 'Kd', Kp: 'Kp', Kff: 'Kff' },
};

const blockFeedforwardLoop: ModuleDef = {
  id: 'g.he-blockDiagram-feedforward-loop',
  title: 'Feedforward inside a feedback loop',
  use: 'Use this for feedforward added to a feedback loop: the feedforward takes the measured disturbance.',
  assumptions: [
    'Steady-state gains only; the disturbance is measured.',
    'The feedback controller trims what the feedforward misses.',
  ],
  unitSystems: ['metric'],
  standalone: {
    vars: ['Kc'],
    why: 'K_c is the feedback controller’s gain; the feedforward gain does not depend on it.',
  },
  variables: [...ffVars(), q('Kc', 'K_c', 'Controller gain', undefined, 0.01, 1000, 0.01)],
  ...FEEDFORWARD,
  example: { Kd: -0.8, Kp: 2.5, Kff: 0.32, Kc: 2 },
  startWith: ['Kd', 'Kp', 'Kc'],
  representation: {
    kind: 'blockDiagram',
    mode: 'feedforward',
    Kd: 'Kd',
    Kp: 'Kp',
    Kff: 'Kff',
    Kc: 'Kc',
    sensor: 1,
  },
};

export const HE3J_GALLERY_MODULES: ModuleDef[] = [
  streamManning,
  streamManningSteep,
  streamEnergy,
  streamEnergyShallow,
  streamJump,
  streamJumpWeak,
  roadStopping,
  roadStoppingDown,
  roadRadius,
  roadElements,
  roadElementsSharp,
  roadCrest,
  roadCrestShort,
  connTension,
  connTensionWide,
  connBolts,
  connBoltsSeven,
  connWeld,
  connBlock,
  connBlockRupture,
  hydroSplit,
  hydroSplitLight,
  hydroRational,
  hydroRationalPeak,
  hydroDetention,
  hydroDetentionSmall,
  blockFeedback,
  blockFeedbackHigh,
  blockLags,
  blockFeedforward,
  blockFeedforwardLoop,
];

export const HE3J_GALLERY_LAYOUTS: LayoutDef[] = [];

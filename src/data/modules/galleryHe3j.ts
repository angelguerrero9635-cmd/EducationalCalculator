/**
 * College gallery demos, round 3, group J (docs/RENDERINGS_HE.md). Each stands in for the
 * college page that waits, built from the plan's worked example. Spread into gallery.ts.
 *
 * HC88: `streamChannel` options (ACC-P19): Manning’s discharge and the Froude number, the
 * specific-energy curve, a hydraulic jump (hydraulics-hydrology#0).
 *
 * HC60: `roadCurve` (ACC-P22): stopping sight distance, the least radius with superelevation,
 * curve elements, a crest vertical curve (transportation#1).
 */
import { formatNumber } from '@/engine/format';
import type { Relation, Values, VariableDef } from '@/engine/types';

import type { LayoutDef } from './layouts';
import type { ModuleDef, StepText } from './types';
import type { RoadCurveSpec, StreamChannelHeSpec } from './typesHe3j';

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
];

export const HE3J_GALLERY_LAYOUTS: LayoutDef[] = [];

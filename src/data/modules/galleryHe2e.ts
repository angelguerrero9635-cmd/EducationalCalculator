/**
 * College gallery demos, round 2, group E (docs/RENDERINGS_HE.md). Each stands in for the
 * college page that waits, built from the plan's worked example. Spread into gallery.ts.
 *
 * HC19: `induction` field sources (a long wire, two wires, a thick wire inside and outside, a
 * loop on its axis and far along it, a coil in a uniform field, a solenoid, a toroid, charging
 * plates) and a rod on rails, from the physics (P-P13, P-P14) and electrical (EC-P31) plans.
 */
import type { Values, VariableDef } from '@/engine/types';

import type { LayoutDef } from './layouts';
import type { ModuleDef } from './types';

type Fn = (x: Values) => number | number[] | undefined;

/** A relation with its rearrangements, each [solve, expression, how] for the step text. */
interface Rule {
  id: string;
  display: string;
  vars: string[];
  residual: (x: Values) => number;
  solve: Record<string, [Fn, string, string]>;
}

const rule = (
  id: string,
  display: string,
  vars: string[],
  residual: (x: Values) => number,
  solve: Record<string, [Fn, string, string]>,
): Rule => ({ id, display, vars, residual, solve });

type Demo = Omit<ModuleDef, 'relations' | 'steps'> & { rules: Rule[] };

/** A module from its rules: the relations and their step text together. */
function demo({ rules, ...m }: Demo): ModuleDef {
  return {
    unitSystems: ['metric'],
    ...m,
    relations: rules.map((r) => ({
      id: r.id,
      display: r.display,
      vars: r.vars,
      residual: r.residual,
      solve: Object.fromEntries(Object.entries(r.solve).map(([k, [fn]]) => [k, fn])),
    })),
    steps: Object.fromEntries(
      rules.map((r) => [
        r.id,
        Object.fromEntries(Object.entries(r.solve).map(([k, [, expr, how]]) => [k, { expr, how }])),
      ]),
    ),
  };
}

const vr = (
  id: string,
  symbol: string,
  name: string,
  unit: string | undefined,
  min: number,
  max: number,
  more: Partial<VariableDef> = {},
): VariableDef => ({ id, symbol, name, ...(unit ? { unit } : {}), min, max, ...more });

const div = (a: number, b: number) => (b === 0 ? undefined : a / b);
/** A positive root, or nothing (a radius of 0 would divide by 0 in the check line). */
const sqrtOf = (x: number) => (x > 0 ? Math.sqrt(x) : undefined);

/** μ₀ = 4π × 10⁻⁷ T·m/A, as the steps write it. */
const MU0 = 4 * Math.PI * 1e-7;
const MU = '4π × 10⁻⁷';
/** ε₀ = 8.85 × 10⁻¹² C²/(N·m²), the physics plan's value. */
const EPS0 = 8.85e-12;
const EPS = '8.85 × 10⁻¹²';

/** A magnetic field in tesla, shown in scientific notation (1.00 × 10⁻⁴ T). */
const tesla = (id: string, symbol: string, name: string) =>
  vr(id, symbol, name, 'T', 0, 100, { scientific: true });
/** A length in meters, typed in `shown` (cm or mm). */
const meters = (id: string, symbol: string, name: string, shown: 'cm' | 'mm' | 'm', min = 1e-6) =>
  vr(id, symbol, name, 'm', min, 1e4, {
    units: ['mm', 'cm', 'm'],
    ...(shown === 'm' ? {} : { shownIn: shown }),
  });
const amps = (id: string, symbol: string, name: string, min = 0) =>
  vr(id, symbol, name, 'A', min, 1e5, { step: 0.1 });

// ─── B = μ₀I ÷ (2πr) and its rearrangements ───────────────────────────────────

const wireRule = (B: string, I: string, r: string) =>
  rule(
    'B = μ₀I ÷ (2πr)',
    `{${B}} = ${MU} × {${I}} ÷ (2π × {${r}})`,
    [B, I, r],
    (x) => x[B]! * 2 * Math.PI * x[r]! - MU0 * x[I]!,
    {
      [B]: [
        (x) => div(MU0 * x[I]!, 2 * Math.PI * x[r]!),
        `${MU} × {${I}} ÷ (2π × {${r}})`,
        'Ampère’s law round a circle of radius r: B × 2πr = μ₀I.',
      ],
      [I]: [
        (x) => (x[B]! * 2 * Math.PI * x[r]!) / MU0,
        `{${B}} × 2π × {${r}} ÷ (${MU})`,
        'Ampère’s law, solved for the current.',
      ],
      [r]: [
        (x) => div(MU0 * x[I]!, 2 * Math.PI * x[B]!),
        `${MU} × {${I}} ÷ (2π × {${B}})`,
        'Ampère’s law, solved for the distance.',
      ],
    },
  );

// ─── EC electromagnetics#1: B near a long wire ───────────────────────────────

const wire = demo({
  id: 'g.he-induction-wire',
  title: 'B near a long straight wire (Ampère’s law)',
  use: 'Use this for “Find B 2 cm from a long wire carrying 10 A.”',
  assumptions: [
    'A long straight wire; r is measured from its center.',
    'Ampère’s law with a circle of radius r: H × 2πr = I, so H = I ÷ (2πr).',
    'In air, B = μ₀H with μ₀ = 4π × 10⁻⁷ T·m/A.',
  ],
  variables: [
    amps('I', 'I', 'Current'),
    meters('r', 'r', 'Distance from the wire', 'cm'),
    vr('H', 'H', 'Field intensity', 'A/m', 0, 1e12),
    tesla('B', 'B', 'Magnetic flux density'),
  ],
  rules: [
    rule(
      'H = I ÷ (2πr)',
      '{H} = {I} ÷ (2π × {r})',
      ['H', 'I', 'r'],
      (x) => x.H! * 2 * Math.PI * x.r! - x.I!,
      {
        H: [
          (x) => div(x.I!, 2 * Math.PI * x.r!),
          '{I} ÷ (2π × {r})',
          'Ampère’s law: the current spread round the circle.',
        ],
        I: [
          (x) => x.H! * 2 * Math.PI * x.r!,
          '{H} × 2π × {r}',
          'Ampère’s law: H round the circle is the current.',
        ],
        r: [
          (x) => div(x.I!, 2 * Math.PI * x.H!),
          '{I} ÷ (2π × {H})',
          'Ampère’s law, solved for r.',
        ],
      },
    ),
    rule('B = μ₀H', `{B} = ${MU} × {H}`, ['B', 'H'], (x) => x.B! - MU0 * x.H!, {
      B: [(x) => MU0 * x.H!, `${MU} × {H}`, 'In air, B is μ₀ times H.'],
      H: [(x) => x.B! / MU0, `{B} ÷ (${MU})`, 'Divide B by μ₀.'],
    }),
  ],
  example: { I: 10, r: 0.02, H: 10 / (2 * Math.PI * 0.02), B: (MU0 * 10) / (2 * Math.PI * 0.02) },
  startWith: ['I', 'r'],
  representation: {
    kind: 'induction',
    mode: 'field',
    source: 'wire',
    current: 'I',
    r: 'r',
    field: 'B',
    H: 'H',
  },
});

// ─── UP2#3~wire-field: two parallel wires ─────────────────────────────────────

const pair = demo({
  id: 'g.he-induction-wire-pair',
  title: 'Two parallel wires: B and the force between them',
  use: 'Use this for “Two long wires 5 cm apart each carry 10 A the same way. Find B and the force per meter.”',
  assumptions: [
    'Long straight parallel wires r apart; each sits in the other’s field B = μ₀I ÷ (2πr).',
    'The force per length on wire 2 is F/L = I₂B: currents the same way attract, opposite ways repel.',
    'A negative I₂ runs the other way (the wires push apart).',
  ],
  variables: [
    amps('I1', 'I₁', 'Current in wire 1'),
    meters('r', 'r', 'Distance between the wires', 'cm'),
    tesla('B', 'B', 'Field of wire 1 at wire 2'),
    vr('I2', 'I₂', 'Current in wire 2', 'A', -1e5, 1e5, { step: 0.1 }),
    vr('F', 'F/L', 'Force per length', 'N/m', -1e6, 1e6, { scientific: true }),
  ],
  rules: [
    wireRule('B', 'I1', 'r'),
    rule('F/L = I₂B', '{F} = {I2} × {B}', ['F', 'I2', 'B'], (x) => x.F! - x.I2! * x.B!, {
      F: [
        (x) => x.I2! * x.B!,
        '{I2} × {B}',
        'The force per length on a current I₂ in the field B.',
      ],
      I2: [(x) => div(x.F!, x.B!), '{F} ÷ {B}', 'Divide the force per length by B.'],
      B: [(x) => div(x.F!, x.I2!), '{F} ÷ {I2}', 'Divide the force per length by I₂.'],
    }),
  ],
  example: { I1: 10, r: 0.05, B: 4e-5, I2: 10, F: 4e-4 },
  startWith: ['I1', 'r', 'I2'],
  representation: {
    kind: 'induction',
    mode: 'field',
    source: 'wire',
    current: 'I1',
    r: 'r',
    field: 'B',
    second: 'I2',
    force: 'F',
  },
});

// ─── EM#1~ampere-wire: a thick wire, inside and (edge) outside ────────────────

const thickInside = demo({
  id: 'g.he-induction-thick-wire',
  title: 'Inside a thick wire with even current',
  use: 'Use this for “A 2 mm-radius wire carries 20 A spread evenly. Find B 1 mm from its center.”',
  assumptions: [
    'The current is spread evenly over the wire’s cross-section.',
    'Ampère’s circle of radius r < a takes in the share (r/a)² of the current: B × 2πr = μ₀I r²/a².',
    'This rule is for inside the wire (r ≤ a); outside, B = μ₀I ÷ (2πr).',
  ],
  variables: [
    amps('I', 'I', 'Current'),
    meters('a', 'a', 'Wire radius', 'mm'),
    meters('r', 'r', 'Distance from the center', 'mm'),
    tesla('B', 'B', 'Magnetic field'),
  ],
  rules: [
    rule(
      'B = μ₀Ir ÷ (2πa²)',
      `{B} = ${MU} × {I} × {r} ÷ (2π × {a}²)`,
      ['B', 'I', 'r', 'a'],
      (x) => x.B! * 2 * Math.PI * x.a! ** 2 - MU0 * x.I! * x.r!,
      {
        B: [
          (x) => div(MU0 * x.I! * x.r!, 2 * Math.PI * x.a! ** 2),
          `${MU} × {I} × {r} ÷ (2π × {a}²)`,
          'Ampère’s law with the current inside r: B grows straight with r.',
        ],
        I: [
          (x) => div(x.B! * 2 * Math.PI * x.a! ** 2, MU0 * x.r!),
          `{B} × 2π × {a}² ÷ (${MU} × {r})`,
          'Solve for the current.',
        ],
        r: [
          (x) => div(x.B! * 2 * Math.PI * x.a! ** 2, MU0 * x.I!),
          `{B} × 2π × {a}² ÷ (${MU} × {I})`,
          'Solve for the distance.',
        ],
        a: [
          (x) => sqrtOf((MU0 * x.I! * x.r!) / (2 * Math.PI * x.B!)),
          `√(${MU} × {I} × {r} ÷ (2π × {B}))`,
          'Solve for the wire’s radius.',
        ],
      },
    ),
  ],
  example: { I: 20, a: 0.002, r: 0.001, B: (MU0 * 20 * 0.001) / (2 * Math.PI * 0.002 ** 2) },
  startWith: ['I', 'a', 'r'],
  representation: {
    kind: 'induction',
    mode: 'field',
    source: 'wire',
    current: 'I',
    radius: 'a',
    r: 'r',
    field: 'B',
    region: 'inside',
  },
});

const thickOutside = demo({
  id: 'g.he-induction-thick-wire-outside',
  title: 'Outside a thick wire: as if all the current were on the axis',
  use: 'Use this for “A 2 mm-radius wire carries 20 A. Find B 4 mm from its center.”',
  assumptions: [
    'Outside the wire (r ≥ a) Ampère’s circle takes in all the current, so B = μ₀I ÷ (2πr), as for a thin wire.',
    'B is largest at the surface, r = a, and falls as 1/r beyond it.',
  ],
  variables: [
    amps('I', 'I', 'Current'),
    meters('r', 'r', 'Distance from the center', 'mm'),
    tesla('B', 'B', 'Magnetic field'),
    meters('a', 'a', 'Wire radius', 'mm'),
  ],
  standalone: {
    vars: ['a'],
    why: 'The wire’s radius only places its surface on the picture; outside it, B depends on I and r alone.',
  },
  rules: [wireRule('B', 'I', 'r')],
  example: { I: 20, r: 0.004, B: (MU0 * 20) / (2 * Math.PI * 0.004), a: 0.002 },
  startWith: ['I', 'r', 'a'],
  representation: {
    kind: 'induction',
    mode: 'field',
    source: 'wire',
    current: 'I',
    radius: 'a',
    r: 'r',
    field: 'B',
    region: 'outside',
  },
});

// ─── EM#1 main: a loop on its axis (and far along it) ─────────────────────────

const loopRules = [
  rule(
    'B₀ = μ₀I ÷ (2R)',
    `{B0} = ${MU} × {I} ÷ (2 × {R})`,
    ['B0', 'I', 'R'],
    (x) => x.B0! * 2 * x.R! - MU0 * x.I!,
    {
      B0: [
        (x) => div(MU0 * x.I!, 2 * x.R!),
        `${MU} × {I} ÷ (2 × {R})`,
        'At the center every piece dl is R away and square to it.',
      ],
      I: [(x) => (x.B0! * 2 * x.R!) / MU0, `{B0} × 2 × {R} ÷ (${MU})`, 'Solve for the current.'],
      R: [
        (x) => (x.I! * x.B0! > 0 ? (MU0 * x.I!) / (2 * x.B0!) : undefined),
        `${MU} × {I} ÷ (2 × {B0})`,
        'Solve for the radius.',
      ],
    },
  ),
  rule(
    'B = μ₀IR² ÷ (2(z² + R²)^(3/2))',
    `{B} = ${MU} × {I} × {R}² ÷ (2 × (√({z}² + {R}²))³)`,
    ['B', 'I', 'R', 'z'],
    (x) => x.B! * 2 * Math.sqrt(x.z! ** 2 + x.R! ** 2) ** 3 - MU0 * x.I! * x.R! ** 2,
    {
      B: [
        (x) => div(MU0 * x.I! * x.R! ** 2, 2 * Math.sqrt(x.z! ** 2 + x.R! ** 2) ** 3),
        `${MU} × {I} × {R}² ÷ (2 × (√({z}² + {R}²))³)`,
        'Biot–Savart round the loop: the sideways parts cancel and the parts along the axis add.',
      ],
      I: [
        (x) => div(x.B! * 2 * Math.sqrt(x.z! ** 2 + x.R! ** 2) ** 3, MU0 * x.R! ** 2),
        `{B} × 2 × (√({z}² + {R}²))³ ÷ (${MU} × {R}²)`,
        'Solve for the current.',
      ],
      z: [
        (x) => {
          const s = Math.cbrt((MU0 * x.I! * x.R! ** 2) / (2 * x.B!)) ** 2 - x.R! ** 2;
          return s < 0 ? undefined : [Math.sqrt(s), -Math.sqrt(s)];
        },
        `±√((∛(${MU} × {I} × {R}² ÷ (2 × {B})))² − {R}²)`,
        'Solve for z: the field is the same either side of the loop.',
      ],
    },
  ),
];

const loopVars = (zShown: 'cm' | 'm') => [
  amps('I', 'I', 'Current'),
  meters('R', 'R', 'Loop radius', 'm'),
  tesla('B0', 'B₀', 'Field at the center'),
  vr('z', 'z', 'Distance along the axis', 'm', -1e4, 1e4, {
    units: ['mm', 'cm', 'm'],
    ...(zShown === 'cm' ? { shownIn: 'cm' } : {}),
  }),
  tesla('B', 'B', 'Field on the axis'),
];

const loopAssumptions = [
  'A single thin circular loop; P is on its axis, z from the center.',
  'Each piece dl adds dB by Biot–Savart; on the axis the sideways parts from opposite pieces cancel.',
  'Far away (z ≫ R) it acts as a magnetic dipole: B ≈ μ₀IR² ÷ (2z³).',
];

const loopB = (I: number, R: number, z: number) =>
  (MU0 * I * R * R) / (2 * Math.sqrt(z * z + R * R) ** 3);

const loop = demo({
  id: 'g.he-induction-loop',
  title: 'A current loop: B on its axis (Biot–Savart)',
  use: 'Use this for “A 10 cm-radius loop carries 5 A. Find B at its center and 10 cm along its axis.”',
  assumptions: loopAssumptions,
  variables: loopVars('m'),
  rules: loopRules,
  example: { I: 5, R: 0.1, B0: (MU0 * 5) / 0.2, z: 0.1, B: loopB(5, 0.1, 0.1) },
  startWith: ['I', 'R', 'z'],
  representation: {
    kind: 'induction',
    mode: 'field',
    source: 'loop',
    current: 'I',
    radius: 'R',
    z: 'z',
    center: 'B0',
    field: 'B',
  },
});

const loopFar = demo({
  id: 'g.he-induction-loop-far',
  title: 'A current loop far along its axis (the dipole field)',
  use: 'Use this for “How strong is a 10 cm loop’s field 50 cm along its axis, compared with its center?”',
  assumptions: loopAssumptions,
  variables: loopVars('m'),
  rules: loopRules,
  example: { I: 5, R: 0.1, B0: (MU0 * 5) / 0.2, z: 0.5, B: loopB(5, 0.1, 0.5) },
  startWith: ['I', 'R', 'z'],
  representation: {
    kind: 'induction',
    mode: 'field',
    source: 'loop',
    current: 'I',
    radius: 'R',
    z: 'z',
    center: 'B0',
    field: 'B',
  },
});

// ─── EM#1~loop-torque: a coil in a uniform field ──────────────────────────────

const RAD = Math.PI / 180;
const torque = demo({
  id: 'g.he-induction-loop-torque',
  title: 'A coil in a uniform field: moment, torque and energy',
  use: 'Use this for “A 50-turn coil of area 0.01 m² carries 0.5 A in a 0.2 T field at 30°. Find the torque.”',
  assumptions: [
    'A flat coil of N turns and area A carrying I has the magnetic moment μ = NIA, square to its plane (right-hand rule).',
    'θ is the angle between μ and B; the torque τ = μB sin θ turns μ toward B.',
    'The energy U = −μB cos θ is lowest with μ along B.',
  ],
  variables: [
    vr('N', 'N', 'Turns', undefined, 1, 1e5, { integer: true }),
    amps('I', 'I', 'Current'),
    vr('A', 'A', 'Coil area', 'm²', 1e-6, 100, { units: ['cm²', 'm²'] }),
    vr('mu', 'μ', 'Magnetic moment', 'A·m²', 0, 1e9),
    vr('B', 'B', 'Field', 'T', 0, 100, { step: 0.01 }),
    vr('th', 'θ', 'Angle between μ and B', '°', 0, 180, { step: 1 }),
    vr('tau', 'τ', 'Torque', 'N·m', 0, 1e9),
    vr('U', 'U', 'Energy', 'J', -1e9, 1e9),
  ],
  rules: [
    rule(
      'μ = NIA',
      '{mu} = {N} × {I} × {A}',
      ['mu', 'N', 'I', 'A'],
      (x) => x.mu! - x.N! * x.I! * x.A!,
      {
        mu: [(x) => x.N! * x.I! * x.A!, '{N} × {I} × {A}', 'Turns times current times area.'],
        I: [(x) => div(x.mu!, x.N! * x.A!), '{mu} ÷ ({N} × {A})', 'Solve for the current.'],
        A: [(x) => div(x.mu!, x.N! * x.I!), '{mu} ÷ ({N} × {I})', 'Solve for the area.'],
      },
    ),
    rule(
      'τ = μB sin θ',
      '{tau} = {mu} × {B} × sin({th})',
      ['tau', 'mu', 'B', 'th'],
      (x) => x.tau! - x.mu! * x.B! * Math.sin(x.th! * RAD),
      {
        tau: [
          (x) => x.mu! * x.B! * Math.sin(x.th! * RAD),
          '{mu} × {B} × sin({th})',
          'The torque on a magnetic moment in a field.',
        ],
        B: [
          (x) => div(x.tau!, x.mu! * Math.sin(x.th! * RAD)),
          '{tau} ÷ ({mu} × sin({th}))',
          'Solve for the field.',
        ],
        mu: [
          (x) => div(x.tau!, x.B! * Math.sin(x.th! * RAD)),
          '{tau} ÷ ({B} × sin({th}))',
          'Solve for the moment.',
        ],
      },
    ),
    rule(
      'U = −μB cos θ',
      '{U} = −{mu} × {B} × cos({th})',
      ['U', 'mu', 'B', 'th'],
      (x) => x.U! + x.mu! * x.B! * Math.cos(x.th! * RAD),
      {
        U: [
          (x) => -x.mu! * x.B! * Math.cos(x.th! * RAD),
          '−{mu} × {B} × cos({th})',
          'The moment’s energy in the field.',
        ],
      },
    ),
  ],
  example: {
    N: 50,
    I: 0.5,
    A: 0.01,
    mu: 0.25,
    B: 0.2,
    th: 30,
    tau: 0.25 * 0.2 * Math.sin(30 * RAD),
    U: -0.25 * 0.2 * Math.cos(30 * RAD),
  },
  startWith: ['N', 'I', 'A', 'B', 'th'],
  representation: {
    kind: 'induction',
    mode: 'field',
    source: 'loop',
    current: 'I',
    radius: 0.0564,
    turns: 'N',
    uniform: { field: 'B', angle: 'th', area: 'A', moment: 'mu', torque: 'tau', energy: 'U' },
  },
});

// ─── UP2#3~solenoid ───────────────────────────────────────────────────────────

const solenoid = demo({
  id: 'g.he-induction-solenoid',
  title: 'A solenoid: B inside, inductance and energy',
  use: 'Use this for “100 turns on a 10 cm tube of 1 cm² carry 2 A. Find B, L and the energy stored.”',
  assumptions: [
    'A long solenoid: inside, B runs along the axis and is the same everywhere; outside it is nearly 0.',
    'Ampère’s law round a rectangle half inside: Bℓ = μ₀NI, so B = μ₀nI with n = N ÷ ℓ.',
    'The flux through each turn is BA, so L = μ₀N²A ÷ ℓ and U = ½LI².',
  ],
  variables: [
    vr('N', 'N', 'Turns', undefined, 1, 1e6, { integer: true }),
    meters('l', 'ℓ', 'Length', 'cm'),
    vr('A', 'A', 'Cross-section area', 'm²', 1e-8, 10, { units: ['cm²', 'm²'], shownIn: 'cm²' }),
    amps('I', 'I', 'Current'),
    vr('n', 'n', 'Turns per meter', '/m', 0, 1e9),
    tesla('B', 'B', 'Field inside'),
    vr('L', 'L', 'Inductance', 'H', 0, 1e4, { scientific: true }),
    vr('U', 'U', 'Energy stored', 'J', 0, 1e12, { scientific: true }),
  ],
  rules: [
    rule('n = N ÷ ℓ', '{n} = {N} ÷ {l}', ['n', 'N', 'l'], (x) => x.n! * x.l! - x.N!, {
      n: [(x) => div(x.N!, x.l!), '{N} ÷ {l}', 'Turns per meter of length.'],
      N: [(x) => x.n! * x.l!, '{n} × {l}', 'Turns per meter times the length.'],
      l: [(x) => div(x.N!, x.n!), '{N} ÷ {n}', 'Solve for the length.'],
    }),
    rule('B = μ₀nI', `{B} = ${MU} × {n} × {I}`, ['B', 'n', 'I'], (x) => x.B! - MU0 * x.n! * x.I!, {
      B: [(x) => MU0 * x.n! * x.I!, `${MU} × {n} × {I}`, 'Ampère’s law for the solenoid.'],
      I: [(x) => div(x.B!, MU0 * x.n!), `{B} ÷ (${MU} × {n})`, 'Solve for the current.'],
      n: [(x) => div(x.B!, MU0 * x.I!), `{B} ÷ (${MU} × {I})`, 'Solve for the turns per meter.'],
    }),
    rule(
      'L = μ₀N²A ÷ ℓ',
      `{L} = ${MU} × {N}² × {A} ÷ {l}`,
      ['L', 'N', 'A', 'l'],
      (x) => x.L! * x.l! - MU0 * x.N! ** 2 * x.A!,
      {
        L: [
          (x) => div(MU0 * x.N! ** 2 * x.A!, x.l!),
          `${MU} × {N}² × {A} ÷ {l}`,
          'N turns each with flux μ₀nIA, per amp.',
        ],
        A: [
          (x) => div(x.L! * x.l!, MU0 * x.N! ** 2),
          `{L} × {l} ÷ (${MU} × {N}²)`,
          'Solve for the area.',
        ],
      },
    ),
    rule(
      'U = ½LI²',
      '{U} = ½ × {L} × {I}²',
      ['U', 'L', 'I'],
      (x) => x.U! - 0.5 * x.L! * x.I! ** 2,
      {
        U: [(x) => 0.5 * x.L! * x.I! ** 2, '½ × {L} × {I}²', 'The energy stored in the field.'],
        L: [(x) => div(2 * x.U!, x.I! ** 2), '2 × {U} ÷ {I}²', 'Solve for the inductance.'],
      },
    ),
  ],
  example: {
    N: 100,
    l: 0.1,
    A: 1e-4,
    I: 2,
    n: 1000,
    B: MU0 * 1000 * 2,
    L: (MU0 * 100 ** 2 * 1e-4) / 0.1,
    U: 0.5 * ((MU0 * 100 ** 2 * 1e-4) / 0.1) * 4,
  },
  startWith: ['N', 'l', 'A', 'I'],
  representation: {
    kind: 'induction',
    mode: 'field',
    source: 'solenoid',
    current: 'I',
    turns: 'N',
    length: 'l',
    area: 'A',
    perLength: 'n',
    field: 'B',
    inductance: 'L',
    energy: 'U',
  },
});

// ─── EM#1~toroid ──────────────────────────────────────────────────────────────

const toroid = demo({
  id: 'g.he-induction-toroid',
  title: 'A toroid: B inside the windings',
  use: 'Use this for “A 500-turn toroid carries 2 A. Find B 10 cm from its center.”',
  assumptions: [
    'The turns are wound evenly round a ring; B runs round the ring in circles.',
    'Ampère’s circle of radius r inside the windings takes in N turns: B × 2πr = μ₀NI.',
    'A circle outside the ring takes in the current both ways, so B = 0 there.',
  ],
  variables: [
    vr('N', 'N', 'Turns', undefined, 1, 1e6, { integer: true }),
    amps('I', 'I', 'Current'),
    meters('r', 'r', 'Radius inside the windings', 'cm'),
    tesla('B', 'B', 'Field at r'),
  ],
  rules: [
    rule(
      'B = μ₀NI ÷ (2πr)',
      `{B} = ${MU} × {N} × {I} ÷ (2π × {r})`,
      ['B', 'N', 'I', 'r'],
      (x) => x.B! * 2 * Math.PI * x.r! - MU0 * x.N! * x.I!,
      {
        B: [
          (x) => div(MU0 * x.N! * x.I!, 2 * Math.PI * x.r!),
          `${MU} × {N} × {I} ÷ (2π × {r})`,
          'Ampère’s law round the ring.',
        ],
        I: [
          (x) => div(x.B! * 2 * Math.PI * x.r!, MU0 * x.N!),
          `{B} × 2π × {r} ÷ (${MU} × {N})`,
          'Solve for the current.',
        ],
        r: [
          (x) => div(MU0 * x.N! * x.I!, 2 * Math.PI * x.B!),
          `${MU} × {N} × {I} ÷ (2π × {B})`,
          'Solve for the radius.',
        ],
      },
    ),
  ],
  example: { N: 500, I: 2, r: 0.1, B: (MU0 * 500 * 2) / (2 * Math.PI * 0.1) },
  startWith: ['N', 'I', 'r'],
  representation: {
    kind: 'induction',
    mode: 'field',
    source: 'toroid',
    current: 'I',
    turns: 'N',
    r: 'r',
    field: 'B',
  },
});

// ─── EM#2~displacement-current: charging plates ───────────────────────────────

const plates = demo({
  id: 'g.he-induction-plates',
  title: 'Displacement current: B between charging plates',
  use: 'Use this for “Round plates of radius 5 cm charge at 2 A. Find B 3 cm from the axis between them.”',
  assumptions: [
    'Round parallel plates; between them the field E is even and grows at dE/dt = I ÷ (ε₀πR²).',
    'Ampère–Maxwell: the displacement current ε₀ dΦ_E/dt through a circle of radius r ≤ R is I(r/R)².',
    'B circles the axis: B × 2πr = μ₀ × (displacement current inside r). ε₀ = 8.85 × 10⁻¹² C²/(N·m²).',
  ],
  variables: [
    amps('I', 'I', 'Charging current'),
    meters('R', 'R', 'Plate radius', 'cm'),
    meters('r', 'r', 'Distance from the axis', 'cm'),
    vr('dE', 'dE/dt', 'Rate E grows', 'V/(m·s)', 0, 1e30, { scientific: true }),
    vr('Id', 'I_d', 'Displacement current inside r', 'A', 0, 1e5, { scientific: true }),
    tesla('B', 'B', 'Field at r'),
  ],
  rules: [
    rule(
      'dE/dt = I ÷ (ε₀πR²)',
      `{dE} = {I} ÷ (${EPS} × π × {R}²)`,
      ['dE', 'I', 'R'],
      (x) => x.dE! * EPS0 * Math.PI * x.R! ** 2 - x.I!,
      {
        dE: [
          (x) => div(x.I!, EPS0 * Math.PI * x.R! ** 2),
          `{I} ÷ (${EPS} × π × {R}²)`,
          'The charge on the plates grows at I, so E = σ/ε₀ grows at I ÷ (ε₀πR²).',
        ],
        I: [
          (x) => x.dE! * EPS0 * Math.PI * x.R! ** 2,
          `{dE} × ${EPS} × π × {R}²`,
          'Solve for the current.',
        ],
      },
    ),
    rule(
      'I_d = I(r ÷ R)²',
      '{Id} = {I} × ({r} ÷ {R})²',
      ['Id', 'I', 'r', 'R'],
      (x) => x.Id! * x.R! ** 2 - x.I! * x.r! ** 2,
      {
        Id: [
          (x) => div(x.I! * x.r! ** 2, x.R! ** 2),
          '{I} × ({r} ÷ {R})²',
          'The circle takes in the share (r/R)² of the plates’ area.',
        ],
        I: [
          (x) => div(x.Id! * x.R! ** 2, x.r! ** 2),
          '{Id} × ({R} ÷ {r})²',
          'Solve for the current.',
        ],
        r: [(x) => sqrtOf((x.Id! * x.R! ** 2) / x.I!), '{R} × √({Id} ÷ {I})', 'Solve for r.'],
      },
    ),
    rule(
      'B = μ₀I_d ÷ (2πr)',
      `{B} = ${MU} × {Id} ÷ (2π × {r})`,
      ['B', 'Id', 'r'],
      (x) => x.B! * 2 * Math.PI * x.r! - MU0 * x.Id!,
      {
        B: [
          (x) => div(MU0 * x.Id!, 2 * Math.PI * x.r!),
          `${MU} × {Id} ÷ (2π × {r})`,
          'Ampère–Maxwell round the circle.',
        ],
        Id: [
          (x) => (x.B! * 2 * Math.PI * x.r!) / MU0,
          `{B} × 2π × {r} ÷ (${MU})`,
          'Solve for the displacement current.',
        ],
      },
    ),
  ],
  example: {
    I: 2,
    R: 0.05,
    r: 0.03,
    dE: 2 / (EPS0 * Math.PI * 0.05 ** 2),
    Id: 0.72,
    B: (MU0 * 0.72) / (2 * Math.PI * 0.03),
  },
  startWith: ['I', 'R', 'r'],
  representation: {
    kind: 'induction',
    mode: 'field',
    source: 'plates',
    current: 'I',
    radius: 'R',
    r: 'r',
    rate: 'dE',
    displacement: 'Id',
    field: 'B',
    eps0: EPS0,
  },
});

// ─── UP2#3~moving-rod: a rod on rails ─────────────────────────────────────────

const rails = demo({
  id: 'g.he-induction-rails',
  title: 'Motional emf: a rod sliding on rails',
  use: 'Use this for “A 0.4 m rod slides at 5 m/s on rails in a 0.5 T field, closed by 2 Ω. Find ε, I and the force needed.”',
  assumptions: [
    'B is square to the loop and even; the rod, rails and wires have no resistance but R.',
    'The flux BLx grows as the rod moves, so ε = BLv (Faraday); I = ε ÷ R runs to oppose the change (Lenz).',
    'The field pushes on the current in the rod with F = BIL, against v: a force F keeps v steady, at power P = Fv = I²R.',
  ],
  variables: [
    vr('B', 'B', 'Magnetic field', 'T', 0.0001, 100, { step: 0.01 }),
    vr('L', 'L', 'Rod length', 'm', 0.001, 100, { step: 0.01 }),
    vr('v', 'v', 'Speed', 'm/s', 0.001, 1e4, { step: 0.1 }),
    vr('e', 'ε', 'Induced emf', 'V', 0, 1e6),
    vr('R', 'R', 'Resistance', 'Ω', 0.001, 1e6, { step: 0.1 }),
    vr('I', 'I', 'Current', 'A', 0, 1e6),
    vr('F', 'F', 'Force needed', 'N', 0, 1e6),
    vr('P', 'P', 'Power', 'W', 0, 1e9),
  ],
  rules: [
    rule(
      'ε = BLv',
      '{e} = {B} × {L} × {v}',
      ['e', 'B', 'L', 'v'],
      (x) => x.e! - x.B! * x.L! * x.v!,
      {
        e: [(x) => x.B! * x.L! * x.v!, '{B} × {L} × {v}', 'Faraday: the flux grows at BLv.'],
        B: [(x) => div(x.e!, x.L! * x.v!), '{e} ÷ ({L} × {v})', 'Solve for the field.'],
        L: [(x) => div(x.e!, x.B! * x.v!), '{e} ÷ ({B} × {v})', 'Solve for the rod’s length.'],
        v: [(x) => div(x.e!, x.B! * x.L!), '{e} ÷ ({B} × {L})', 'Solve for the speed.'],
      },
    ),
    rule('I = ε ÷ R', '{I} = {e} ÷ {R}', ['I', 'e', 'R'], (x) => x.I! * x.R! - x.e!, {
      I: [(x) => div(x.e!, x.R!), '{e} ÷ {R}', 'Ohm’s law round the loop.'],
      e: [(x) => x.I! * x.R!, '{I} × {R}', 'Ohm’s law: the emf drives I through R.'],
      R: [(x) => div(x.e!, x.I!), '{e} ÷ {I}', 'Solve for the resistance.'],
    }),
    rule(
      'F = BIL',
      '{F} = {B} × {I} × {L}',
      ['F', 'B', 'I', 'L'],
      (x) => x.F! - x.B! * x.I! * x.L!,
      {
        F: [
          (x) => x.B! * x.I! * x.L!,
          '{B} × {I} × {L}',
          'The field’s push on the current in the rod.',
        ],
        I: [(x) => div(x.F!, x.B! * x.L!), '{F} ÷ ({B} × {L})', 'Solve for the current.'],
      },
    ),
    rule('P = Fv', '{P} = {F} × {v}', ['P', 'F', 'v'], (x) => x.P! - x.F! * x.v!, {
      P: [
        (x) => x.F! * x.v!,
        '{F} × {v}',
        'The power to keep the rod moving, all turned to heat in R.',
      ],
      F: [(x) => div(x.P!, x.v!), '{P} ÷ {v}', 'Solve for the force.'],
    }),
  ],
  example: { B: 0.5, L: 0.4, v: 5, e: 1, R: 2, I: 0.5, F: 0.1, P: 0.5 },
  startWith: ['B', 'L', 'v', 'R'],
  representation: {
    kind: 'induction',
    rails: { B: 'B', L: 'L', v: 'v', R: 'R', emf: 'e', I: 'I', F: 'F', P: 'P' },
  },
});

export const HE2E_GALLERY_MODULES: ModuleDef[] = [
  wire,
  pair,
  thickInside,
  thickOutside,
  loop,
  loopFar,
  torque,
  solenoid,
  toroid,
  plates,
  rails,
];

export const HE2E_GALLERY_LAYOUTS: LayoutDef[] = [];

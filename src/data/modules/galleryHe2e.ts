/**
 * College gallery demos, round 2, group E (docs/RENDERINGS_HE.md). Each stands in for the
 * college page that waits, built from the plan's worked example. Spread into gallery.ts.
 *
 * HC19: `induction` field sources (a long wire, two wires, a thick wire inside and outside, a
 * loop on its axis and far along it, a coil in a uniform field, a solenoid, a toroid, charging
 * plates) and a rod on rails, from the physics (P-P13, P-P14) and electrical (EC-P31) plans.
 *
 * HC29: `charges` Gauss surfaces (a ball outside and inside, a line charge with k and with ε₀, a
 * sheet) and distributions (a ring, a disk and a disk close in, a charge over a grounded plane),
 * from P-P10, P-P24 and EC-P31 (line).
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
    workedFigures: 3,
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
/** A length, radius or resistance worked out: only a positive one. */
const posDiv = (a: number, b: number) => {
  const v = div(a, b);
  return v !== undefined && v > 0 ? v : undefined;
};
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
        (x) => posDiv(MU0 * x[I]!, 2 * Math.PI * x[B]!),
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
          (x) => posDiv(x.I!, 2 * Math.PI * x.H!),
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
          (x) => posDiv(x.B! * 2 * Math.PI * x.a! ** 2, MU0 * x.I!),
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
      l: [(x) => posDiv(x.N!, x.n!), '{N} ÷ {n}', 'Solve for the length.'],
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
          (x) => posDiv(MU0 * x.N! ** 2 * x.A!, x.l!),
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
        L: [(x) => posDiv(2 * x.U!, x.I! ** 2), '2 × {U} ÷ {I}²', 'Solve for the inductance.'],
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
          (x) => posDiv(MU0 * x.N! * x.I!, 2 * Math.PI * x.B!),
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
        L: [(x) => posDiv(x.e!, x.B! * x.v!), '{e} ÷ ({B} × {v})', 'Solve for the rod’s length.'],
        v: [(x) => div(x.e!, x.B! * x.L!), '{e} ÷ ({B} × {L})', 'Solve for the speed.'],
      },
    ),
    rule('I = ε ÷ R', '{I} = {e} ÷ {R}', ['I', 'e', 'R'], (x) => x.I! * x.R! - x.e!, {
      I: [(x) => div(x.e!, x.R!), '{e} ÷ {R}', 'Ohm’s law round the loop.'],
      e: [(x) => x.I! * x.R!, '{I} × {R}', 'Ohm’s law: the emf drives I through R.'],
      R: [(x) => posDiv(x.e!, x.I!), '{e} ÷ {I}', 'Solve for the resistance.'],
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

// ─── HC29: Gauss surfaces and continuous distributions ────────────────────────

/** k = 8.99 × 10⁹ N·m²/C², the physics plan's value. */
const K = 8.99e9;
const KS = '8.99 × 10⁹';

const coulombs = (id: string, symbol: string, name: string, shown: 'nC' | 'μC') =>
  vr(id, symbol, name, 'C', -1e-3, 1e-3, {
    units: ['nC', 'μC', 'C'],
    shownIn: shown,
    scientific: true,
  });
const perMeter = (id: string, symbol: string, name: string, unit: string) =>
  vr(id, symbol, name, unit, -1e-3, 1e-3, { scientific: true });
const newtonsPerC = (id: string, symbol: string, name: string) =>
  vr(id, symbol, name, 'N/C', -1e15, 1e15, { scientific: true });

const sphereAssumptions = [
  'The charge is spread evenly through the ball, so E points straight out and is the same all over a sphere of radius r.',
  'Gauss’s law: E × 4πr² = Q_enc ÷ ε₀, with 1 ÷ ε₀ = 4πk and k = 8.99 × 10⁹ N·m²/C².',
];

const sphereOut = demo({
  id: 'g.he-charges-gauss-sphere',
  title: 'Gauss’s law: a charged ball, outside it',
  use: 'Use this for “A 10 cm ball holds 2 μC spread evenly. Find E 30 cm from its center.”',
  assumptions: [
    ...sphereAssumptions,
    'Outside (r ≥ R) the sphere takes in all of Q: the ball acts as a point charge.',
  ],
  variables: [
    coulombs('Q', 'Q', 'Charge', 'μC'),
    meters('r', 'r', 'Distance from the center', 'm'),
    newtonsPerC('E', 'E', 'Field at r'),
    vr('Phi', 'Φ', 'Flux through the sphere', 'N·m²/C', -1e12, 1e12, { scientific: true }),
    meters('R', 'R', 'Ball radius', 'm'),
  ],
  standalone: {
    vars: ['R'],
    why: 'The ball’s radius only places its surface on the picture; outside it, E depends on Q and r alone.',
  },
  rules: [
    rule(
      'E = kQ ÷ r²',
      `{E} = ${KS} × {Q} ÷ {r}²`,
      ['E', 'Q', 'r'],
      (x) => x.E! * x.r! ** 2 - K * x.Q!,
      {
        E: [
          (x) => div(K * x.Q!, x.r! ** 2),
          `${KS} × {Q} ÷ {r}²`,
          'Gauss’s law on a sphere of radius r round all of Q.',
        ],
        Q: [(x) => (x.E! * x.r! ** 2) / K, `{E} × {r}² ÷ (${KS})`, 'Solve for the charge.'],
        r: [(x) => sqrtOf((K * x.Q!) / x.E!), `√(${KS} × {Q} ÷ {E})`, 'Solve for the distance.'],
      },
    ),
    rule(
      'Φ = Q ÷ ε₀',
      `{Phi} = 4π × ${KS} × {Q}`,
      ['Phi', 'Q'],
      (x) => x.Phi! - 4 * Math.PI * K * x.Q!,
      {
        Phi: [
          (x) => 4 * Math.PI * K * x.Q!,
          `4π × ${KS} × {Q}`,
          'Gauss’s law: the flux is the charge inside over ε₀.',
        ],
        Q: [(x) => x.Phi! / (4 * Math.PI * K), `{Phi} ÷ (4π × ${KS})`, 'Solve for the charge.'],
      },
    ),
  ],
  example: { Q: 2e-6, r: 0.3, E: (K * 2e-6) / 0.09, Phi: 4 * Math.PI * K * 2e-6, R: 0.1 },
  startWith: ['Q', 'R', 'r'],
  representation: {
    kind: 'charges',
    gauss: { shape: 'sphere', Q: 'Q', R: 'R', r: 'r', E: 'E', flux: 'Phi', region: 'outside' },
    k: K,
  },
});

const sphereIn = demo({
  id: 'g.he-charges-gauss-sphere-inside',
  title: 'Gauss’s law: inside a charged ball',
  use: 'Use this for “A 10 cm ball holds 2 μC spread evenly. Find E 5 cm from its center.”',
  assumptions: [
    ...sphereAssumptions,
    'Inside (r ≤ R) the sphere takes in the share (r/R)³ of Q, so E grows straight with r.',
  ],
  variables: [
    coulombs('Q', 'Q', 'Charge', 'μC'),
    meters('R', 'R', 'Ball radius', 'm'),
    meters('r', 'r', 'Distance from the center', 'm'),
    coulombs('Qe', 'Q_enc', 'Charge inside r', 'μC'),
    newtonsPerC('E', 'E', 'Field at r'),
  ],
  rules: [
    rule(
      'Q_enc = Q(r ÷ R)³',
      '{Qe} = {Q} × ({r} ÷ {R})³',
      ['Qe', 'Q', 'r', 'R'],
      (x) => x.Qe! * x.R! ** 3 - x.Q! * x.r! ** 3,
      {
        Qe: [
          (x) => div(x.Q! * x.r! ** 3, x.R! ** 3),
          '{Q} × ({r} ÷ {R})³',
          'The sphere of radius r holds the share (r/R)³ of the ball.',
        ],
        Q: [
          (x) => div(x.Qe! * x.R! ** 3, x.r! ** 3),
          '{Qe} × ({R} ÷ {r})³',
          'Solve for the whole charge.',
        ],
      },
    ),
    rule(
      'E = kQ_enc ÷ r²',
      `{E} = ${KS} × {Qe} ÷ {r}²`,
      ['E', 'Qe', 'r'],
      (x) => x.E! * x.r! ** 2 - K * x.Qe!,
      {
        E: [
          (x) => div(K * x.Qe!, x.r! ** 2),
          `${KS} × {Qe} ÷ {r}²`,
          'Gauss’s law on the sphere of radius r: only the charge inside counts.',
        ],
        Qe: [(x) => (x.E! * x.r! ** 2) / K, `{E} × {r}² ÷ (${KS})`, 'Solve for the charge inside.'],
      },
    ),
  ],
  example: { Q: 2e-6, R: 0.1, r: 0.05, Qe: 2.5e-7, E: (K * 2.5e-7) / 0.0025 },
  startWith: ['Q', 'R', 'r'],
  representation: {
    kind: 'charges',
    gauss: { shape: 'sphere', Q: 'Q', R: 'R', r: 'r', E: 'E', enclosed: 'Qe', region: 'inside' },
    k: K,
  },
});

const lineK = demo({
  id: 'g.he-charges-gauss-line',
  title: 'Gauss’s law: a long line of charge',
  use: 'Use this for “A long wire carries 5 nC/m. Find E 20 cm from it.”',
  assumptions: [
    'A long straight line of charge: E points straight out from it and is the same all round a cylinder of radius r.',
    'Gauss’s law on a cylinder of length ℓ: E × 2πrℓ = λℓ ÷ ε₀, so E = 2kλ ÷ r. No flux leaves the flat ends.',
  ],
  variables: [
    perMeter('lam', 'λ', 'Charge per length', 'C/m'),
    meters('r', 'r', 'Distance from the line', 'cm'),
    newtonsPerC('E', 'E', 'Field at r'),
  ],
  rules: [
    rule(
      'E = 2kλ ÷ r',
      `{E} = 2 × ${KS} × {lam} ÷ {r}`,
      ['E', 'lam', 'r'],
      (x) => x.E! * x.r! - 2 * K * x.lam!,
      {
        E: [
          (x) => div(2 * K * x.lam!, x.r!),
          `2 × ${KS} × {lam} ÷ {r}`,
          'Gauss’s law on a cylinder round the line.',
        ],
        lam: [
          (x) => (x.E! * x.r!) / (2 * K),
          `{E} × {r} ÷ (2 × ${KS})`,
          'Solve for the charge per length.',
        ],
        r: [
          (x) => posDiv(2 * K * x.lam!, x.E!),
          `2 × ${KS} × {lam} ÷ {E}`,
          'Solve for the distance.',
        ],
      },
    ),
  ],
  example: { lam: 5e-9, r: 0.2, E: (2 * K * 5e-9) / 0.2 },
  startWith: ['lam', 'r'],
  representation: { kind: 'charges', gauss: { shape: 'line', Q: 'lam', r: 'r', E: 'E' }, k: K },
});

const lineEps = demo({
  id: 'g.he-charges-gauss-line-eps',
  title: 'Gauss’s law: E of a line charge (with ε₀)',
  use: 'Use this for “Find E 0.1 m from a line charge of 1 nC/m.”',
  assumptions: [
    'An infinite line charge: E is radial and the same all round a cylinder of radius r.',
    'Gauss’s law on the cylinder: E × 2πrℓ = λℓ ÷ ε₀, with ε₀ = 8.85 × 10⁻¹² F/m.',
  ],
  variables: [
    perMeter('lam', 'λ', 'Charge per length', 'C/m'),
    meters('r', 'r', 'Distance from the line', 'm'),
    vr('E', 'E', 'Field at r', 'V/m', -1e15, 1e15, { scientific: true }),
  ],
  rules: [
    rule(
      'E = λ ÷ (2πε₀r)',
      `{E} = {lam} ÷ (2π × ${EPS} × {r})`,
      ['E', 'lam', 'r'],
      (x) => x.E! * 2 * Math.PI * EPS0 * x.r! - x.lam!,
      {
        E: [
          (x) => div(x.lam!, 2 * Math.PI * EPS0 * x.r!),
          `{lam} ÷ (2π × ${EPS} × {r})`,
          'Gauss’s law on the cylinder round the line.',
        ],
        lam: [
          (x) => x.E! * 2 * Math.PI * EPS0 * x.r!,
          `{E} × 2π × ${EPS} × {r}`,
          'Solve for the charge per length.',
        ],
        r: [
          (x) => posDiv(x.lam!, 2 * Math.PI * EPS0 * x.E!),
          `{lam} ÷ (2π × ${EPS} × {E})`,
          'Solve for the distance.',
        ],
      },
    ),
  ],
  example: { lam: 1e-9, r: 0.1, E: 1e-9 / (2 * Math.PI * EPS0 * 0.1) },
  startWith: ['lam', 'r'],
  representation: {
    kind: 'charges',
    gauss: { shape: 'line', Q: 'lam', r: 'r', E: 'E' },
    eps0: EPS0,
  },
});

const plane = demo({
  id: 'g.he-charges-gauss-plane',
  title: 'Gauss’s law: a charged sheet',
  use: 'Use this for “A large sheet carries 8.85 nC/m². Find E near it, and between two opposite sheets.”',
  assumptions: [
    'A large flat sheet with even σ: E is square to it, the same on both sides and at every distance.',
    'Gauss’s law on a pillbox through the sheet: E × 2A = σA ÷ ε₀, so E = σ ÷ (2ε₀), ε₀ = 8.85 × 10⁻¹².',
    'Two opposite sheets: their fields add between them (σ ÷ ε₀) and cancel outside.',
  ],
  variables: [
    perMeter('s', 'σ', 'Charge per area', 'C/m²'),
    newtonsPerC('E', 'E', 'Field of one sheet'),
    newtonsPerC('Eb', 'E_b', 'Field between two opposite sheets'),
  ],
  rules: [
    rule('E = σ ÷ (2ε₀)', `{E} = {s} ÷ (2 × ${EPS})`, ['E', 's'], (x) => x.E! * 2 * EPS0 - x.s!, {
      E: [
        (x) => x.s! / (2 * EPS0),
        `{s} ÷ (2 × ${EPS})`,
        'Gauss’s law on the pillbox: flux out of both faces.',
      ],
      s: [(x) => x.E! * 2 * EPS0, `{E} × 2 × ${EPS}`, 'Solve for σ.'],
    }),
    rule('E_b = σ ÷ ε₀', `{Eb} = {s} ÷ (${EPS})`, ['Eb', 's'], (x) => x.Eb! * EPS0 - x.s!, {
      Eb: [(x) => x.s! / EPS0, `{s} ÷ (${EPS})`, 'Between opposite sheets the two fields add.'],
      s: [(x) => x.Eb! * EPS0, `{Eb} × ${EPS}`, 'Solve for σ.'],
    }),
  ],
  example: { s: 8.85e-9, E: 500, Eb: 1000 },
  startWith: ['s'],
  representation: {
    kind: 'charges',
    gauss: { shape: 'plane', Q: 's', E: 'E', between: 'Eb' },
    eps0: EPS0,
  },
});

const ringV = (Q: number, R: number, z: number) => (K * Q) / Math.hypot(z, R);
const ringE = (Q: number, R: number, z: number) => (K * Q * z) / Math.hypot(z, R) ** 3;

const ring = demo({
  id: 'g.he-charges-ring',
  title: 'A charged ring: V and E on its axis',
  use: 'Use this for “A 30 cm ring holds 10 nC. Find V and E 40 cm along its axis.”',
  assumptions: [
    'The charge is spread evenly round a thin ring; P is on the axis, z from the center.',
    'Every piece is the same distance √(z² + R²) from P, so V = kQ ÷ √(z² + R²) (a sum of scalars).',
    'On the axis the sideways parts of dE cancel; E is the slope of V: E = kQz ÷ (z² + R²)^(3/2).',
  ],
  variables: [
    coulombs('Q', 'Q', 'Charge', 'nC'),
    meters('R', 'R', 'Ring radius', 'm'),
    meters('z', 'z', 'Distance along the axis', 'm', 0.001),
    vr('V', 'V', 'Potential at P', 'V', -1e12, 1e12),
    newtonsPerC('E', 'E_z', 'Field along the axis'),
  ],
  rules: [
    rule(
      'V = kQ ÷ √(z² + R²)',
      `{V} = ${KS} × {Q} ÷ √({z}² + {R}²)`,
      ['V', 'Q', 'z', 'R'],
      (x) => x.V! * Math.hypot(x.z!, x.R!) - K * x.Q!,
      {
        V: [
          (x) => ringV(x.Q!, x.R!, x.z!),
          `${KS} × {Q} ÷ √({z}² + {R}²)`,
          'Every piece of the ring is √(z² + R²) from P.',
        ],
        Q: [
          (x) => (x.V! * Math.hypot(x.z!, x.R!)) / K,
          `{V} × √({z}² + {R}²) ÷ (${KS})`,
          'Solve for the charge.',
        ],
      },
    ),
    rule(
      'E_z = kQz ÷ (z² + R²)^(3/2)',
      `{E} = ${KS} × {Q} × {z} ÷ (√({z}² + {R}²))³`,
      ['E', 'Q', 'z', 'R'],
      (x) => x.E! * Math.hypot(x.z!, x.R!) ** 3 - K * x.Q! * x.z!,
      {
        E: [
          (x) => ringE(x.Q!, x.R!, x.z!),
          `${KS} × {Q} × {z} ÷ (√({z}² + {R}²))³`,
          'The parts along the axis add; the sideways parts cancel.',
        ],
        Q: [
          (x) => div(x.E! * Math.hypot(x.z!, x.R!) ** 3, K * x.z!),
          `{E} × (√({z}² + {R}²))³ ÷ (${KS} × {z})`,
          'Solve for the charge.',
        ],
      },
    ),
  ],
  example: { Q: 1e-8, R: 0.3, z: 0.4, V: ringV(1e-8, 0.3, 0.4), E: ringE(1e-8, 0.3, 0.4) },
  startWith: ['Q', 'R', 'z'],
  representation: {
    kind: 'charges',
    distribution: 'ring',
    charge: 'Q',
    radius: 'R',
    z: 'z',
    potential: 'V',
    field: 'E',
    k: K,
  },
});

const diskE = (s: number, R: number, z: number) => 2 * Math.PI * K * s * (1 - z / Math.hypot(z, R));

const diskDemo = (id: string, title: string, use: string, z: number) =>
  demo({
    id,
    title,
    use,
    assumptions: [
      'An even σ on a flat disk; P is on the axis, z > 0 from the center.',
      'The disk is rings from the center to R; on the axis each ring’s sideways parts cancel, and the rings add.',
      'Close in (z ≪ R) E nears a sheet’s 2πkσ = σ ÷ (2ε₀); far away the disk acts as a point charge.',
    ],
    variables: [
      perMeter('s', 'σ', 'Charge per area', 'C/m²'),
      meters('R', 'R', 'Disk radius', 'm'),
      meters('z', 'z', 'Distance along the axis', 'm'),
      newtonsPerC('Es', 'E_sheet', 'Sheet limit 2πkσ'),
      newtonsPerC('E', 'E_z', 'Field along the axis'),
    ],
    rules: [
      rule(
        'E_sheet = 2πkσ',
        `{Es} = 2π × ${KS} × {s}`,
        ['Es', 's'],
        (x) => x.Es! - 2 * Math.PI * K * x.s!,
        {
          Es: [
            (x) => 2 * Math.PI * K * x.s!,
            `2π × ${KS} × {s}`,
            'The field of a sheet with the same σ.',
          ],
          s: [(x) => x.Es! / (2 * Math.PI * K), `{Es} ÷ (2π × ${KS})`, 'Solve for σ.'],
        },
      ),
      rule(
        'E_z = 2πkσ(1 − z ÷ √(z² + R²))',
        '{E} = {Es} × (1 − {z} ÷ √({z}² + {R}²))',
        ['E', 'Es', 'z', 'R'],
        (x) => x.E! - x.Es! * (1 - x.z! / Math.hypot(x.z!, x.R!)),
        {
          E: [
            (x) => x.Es! * (1 - x.z! / Math.hypot(x.z!, x.R!)),
            '{Es} × (1 − {z} ÷ √({z}² + {R}²))',
            'The rings from the center to R added up.',
          ],
          Es: [
            (x) => div(x.E!, 1 - x.z! / Math.hypot(x.z!, x.R!)),
            '{E} ÷ (1 − {z} ÷ √({z}² + {R}²))',
            'Solve for the sheet’s field.',
          ],
        },
      ),
    ],
    example: { s: 1e-6, R: 0.3, z, Es: 2 * Math.PI * K * 1e-6, E: diskE(1e-6, 0.3, z) },
    startWith: ['s', 'R', 'z'],
    representation: {
      kind: 'charges',
      distribution: 'disk',
      charge: 's',
      radius: 'R',
      z: 'z',
      sheet: 'Es',
      field: 'E',
      k: K,
    },
  });

const disk = diskDemo(
  'g.he-charges-disk',
  'A charged disk: E on its axis',
  'Use this for “A 30 cm disk carries 1 μC/m². Find E 40 cm along its axis.”',
  0.4,
);
const diskNear = diskDemo(
  'g.he-charges-disk-near',
  'A charged disk close in: nearly a sheet',
  'Use this for “How close to a sheet’s field is a 30 cm disk’s field 1 cm from its center?”',
  0.01,
);

const image = demo({
  id: 'g.he-charges-image',
  title: 'The method of images: a charge over a grounded plane',
  use: 'Use this for “A 1 nC charge sits 5 cm above a grounded plane. Find the force on it and σ under it.”',
  assumptions: [
    'The plane is a grounded conductor (V = 0). An image −q at d below gives V = 0 on the plane, so above it the field is that of q and −q.',
    'The force on q is the image’s pull across 2d: F = kq² ÷ (2d)², toward the plane.',
    'The induced σ = ε₀E at the plane; under the charge σ₀ = −q ÷ (2πd²), and it adds to −q.',
  ],
  variables: [
    coulombs('q', 'q', 'Charge', 'nC'),
    meters('d', 'd', 'Height above the plane', 'cm'),
    vr('F', 'F', 'Force toward the plane', 'N', 0, 1e9, { scientific: true }),
    vr('s0', 'σ₀', 'Induced charge per area under q', 'C/m²', -1e3, 1e3, { scientific: true }),
    coulombs('Qi', 'Q_ind', 'Induced charge in all', 'nC'),
  ],
  rules: [
    rule(
      'F = kq² ÷ (2d)²',
      `{F} = ${KS} × {q}² ÷ (2 × {d})²`,
      ['F', 'q', 'd'],
      (x) => x.F! * 4 * x.d! ** 2 - K * x.q! ** 2,
      {
        F: [
          (x) => div(K * x.q! ** 2, 4 * x.d! ** 2),
          `${KS} × {q}² ÷ (2 × {d})²`,
          'Coulomb’s law between q and its image 2d away.',
        ],
        d: [
          (x) => (x.F! > 0 ? Math.sqrt((K * x.q! ** 2) / x.F!) / 2 : undefined),
          `√(${KS} × {q}² ÷ {F}) ÷ 2`,
          'Solve for the height.',
        ],
      },
    ),
    rule(
      'σ₀ = −q ÷ (2πd²)',
      '{s0} = −{q} ÷ (2π × {d}²)',
      ['s0', 'q', 'd'],
      (x) => x.s0! * 2 * Math.PI * x.d! ** 2 + x.q!,
      {
        s0: [
          (x) => div(-x.q!, 2 * Math.PI * x.d! ** 2),
          '−{q} ÷ (2π × {d}²)',
          'σ = ε₀E with the field of q and its image at the plane.',
        ],
        q: [(x) => -x.s0! * 2 * Math.PI * x.d! ** 2, '−{s0} × 2π × {d}²', 'Solve for the charge.'],
      },
    ),
    rule('Q_ind = −q', '{Qi} = −{q}', ['Qi', 'q'], (x) => x.Qi! + x.q!, {
      Qi: [(x) => -x.q!, '−{q}', 'All the field lines from q end on the plane.'],
      q: [(x) => -x.Qi!, '−{Qi}', 'The charge is minus the induced charge.'],
    }),
  ],
  example: {
    q: 1e-9,
    d: 0.05,
    F: (K * 1e-18) / 0.01,
    s0: -1e-9 / (2 * Math.PI * 0.0025),
    Qi: -1e-9,
  },
  startWith: ['q', 'd'],
  representation: {
    kind: 'charges',
    distribution: 'image',
    charge: 'q',
    z: 'd',
    force: 'F',
    density: 's0',
    induced: 'Qi',
    k: K,
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
  sphereOut,
  sphereIn,
  lineK,
  lineEps,
  plane,
  ring,
  disk,
  diskNear,
  image,
];

export const HE2E_GALLERY_LAYOUTS: LayoutDef[] = [];

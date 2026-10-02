/**
 * College gallery demos, round 1, group H (docs/RENDERINGS_HE.md). Each stands in for the
 * college page that waits, built from the plan's worked example. Spread into gallery.ts.
 *
 * HC7: the passive-circuit schematic (`net` on `seriesCircuit` and `circuit`), one demo per
 * topology from the circuits, physics and bioinstrumentation plans, and one at the edge (a
 * branch current that runs against its reference).
 */
import type { Values, VariableDef } from '@/engine/types';

import type { LayoutDef } from './layouts';
import type { ModuleDef, Representation } from './types';
import type { CircuitNet } from './typesHe1h';

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
const net = (kind: 'seriesCircuit' | 'circuit', n: CircuitNet): Representation => ({
  kind,
  net: n,
});

/** A resistance in ohms (or kΩ), 0.1 Ω to 1 MΩ. */
const ohms = (id: string, symbol: string, name: string, unit = 'Ω') =>
  vr(id, symbol, name, unit, unit === 'kΩ' ? 0.001 : 0.01, unit === 'kΩ' ? 1000 : 1e6, {
    step: 0.5,
  });

// ─── HC7: circuits-1#0~parallel ───────────────────────────────────────────────

const parallel = demo({
  id: 'g.he-series-circuit-parallel',
  title: 'Schematic: two resistors in parallel',
  use: 'Use this for “A 6 Ω and a 3 Ω resistor are in parallel across 12 V. Find each current.”',
  assumptions: [
    'Both resistors are connected across the source, so each sees the full source voltage.',
    'Kirchhoff’s current law: the current out of the source splits between the branches, I = I₁ + I₂.',
    'R_eq is less than the smaller resistor.',
  ],
  variables: [
    vr('V', 'V', 'Source voltage', 'V', 0, 1000, { step: 0.5 }),
    ohms('R1', 'R₁', 'Resistor 1'),
    ohms('R2', 'R₂', 'Resistor 2'),
    vr('Req', 'R_eq', 'Equivalent resistance', 'Ω', 0.001, 1e6),
    vr('I1', 'I₁', 'Current in R₁', 'A', 0, 1e5),
    vr('I2', 'I₂', 'Current in R₂', 'A', 0, 1e5),
    vr('I', 'I', 'Total current', 'A', 0, 2e5),
  ],
  rules: [
    rule(
      'R_eq = R₁R₂ ÷ (R₁ + R₂)',
      '{Req} = {R1} × {R2} ÷ ({R1} + {R2})',
      ['Req', 'R1', 'R2'],
      (x) => x.Req! - (x.R1! * x.R2!) / (x.R1! + x.R2!),
      {
        Req: [
          (x) => div(x.R1! * x.R2!, x.R1! + x.R2!),
          '{R1} × {R2} ÷ ({R1} + {R2})',
          'Product over sum: two resistors in parallel.',
        ],
        R1: [
          (x) => div(x.Req! * x.R2!, x.R2! - x.Req!),
          '{Req} × {R2} ÷ ({R2} − {Req})',
          'Solve 1/R_eq = 1/R₁ + 1/R₂ for R₁.',
        ],
        R2: [
          (x) => div(x.Req! * x.R1!, x.R1! - x.Req!),
          '{Req} × {R1} ÷ ({R1} − {Req})',
          'Solve 1/R_eq = 1/R₁ + 1/R₂ for R₂.',
        ],
      },
    ),
    rule('I₁ = V ÷ R₁', '{I1} = {V} ÷ {R1}', ['I1', 'V', 'R1'], (x) => x.I1! * x.R1! - x.V!, {
      I1: [
        (x) => div(x.V!, x.R1!),
        '{V} ÷ {R1}',
        'Ohm’s law for R₁, with the full source voltage across it.',
      ],
      V: [
        (x) => x.I1! * x.R1!,
        '{I1} × {R1}',
        'Ohm’s law for R₁: the source voltage is across it.',
      ],
      R1: [(x) => div(x.V!, x.I1!), '{V} ÷ {I1}', 'Ohm’s law for R₁, divided by its current.'],
    }),
    rule('I₂ = V ÷ R₂', '{I2} = {V} ÷ {R2}', ['I2', 'V', 'R2'], (x) => x.I2! * x.R2! - x.V!, {
      I2: [
        (x) => div(x.V!, x.R2!),
        '{V} ÷ {R2}',
        'Ohm’s law for R₂, with the full source voltage across it.',
      ],
      V: [
        (x) => x.I2! * x.R2!,
        '{I2} × {R2}',
        'Ohm’s law for R₂: the source voltage is across it.',
      ],
      R2: [(x) => div(x.V!, x.I2!), '{V} ÷ {I2}', 'Ohm’s law for R₂, divided by its current.'],
    }),
    rule('I = I₁ + I₂', '{I} = {I1} + {I2}', ['I', 'I1', 'I2'], (x) => x.I! - x.I1! - x.I2!, {
      I: [
        (x) => x.I1! + x.I2!,
        '{I1} + {I2}',
        'Kirchhoff’s current law at the top junction: the branch currents add.',
      ],
      I1: [(x) => x.I! - x.I2!, '{I} − {I2}', 'What doesn’t go through R₂ goes through R₁.'],
      I2: [(x) => x.I! - x.I1!, '{I} − {I1}', 'What doesn’t go through R₁ goes through R₂.'],
    }),
    rule('V = IR_eq', '{V} = {I} × {Req}', ['V', 'I', 'Req'], (x) => x.V! - x.I! * x.Req!, {
      V: [(x) => x.I! * x.Req!, '{I} × {Req}', 'Ohm’s law for the whole circuit.'],
      I: [
        (x) => div(x.V!, x.Req!),
        '{V} ÷ {Req}',
        'Ohm’s law for the whole circuit: voltage over R_eq.',
      ],
      Req: [
        (x) => div(x.V!, x.I!),
        '{V} ÷ {I}',
        'The resistance the source sees: voltage over total current.',
      ],
    }),
  ],
  example: { V: 12, R1: 6, R2: 3, Req: 2, I1: 2, I2: 4, I: 6 },
  startWith: ['V', 'R1', 'R2'],
  representation: net('seriesCircuit', {
    topology: 'parallel',
    elements: [
      { id: 'V', kind: 'V' },
      { id: 'R1', kind: 'R' },
      { id: 'R2', kind: 'R' },
    ],
    branches: ['I', 'I1', 'I2'],
  }),
});

// ─── circuits-1#0~power-sign ──────────────────────────────────────────────────

const powerSign = demo({
  id: 'g.he-series-circuit-element',
  title: 'Schematic: one element, the passive sign convention',
  use: 'Use this for “An element has 5 V across it and −2 A into its + terminal. Does it absorb or deliver power?”',
  assumptions: [
    'Passive sign convention: I is the current into the + terminal.',
    'P > 0: the element absorbs power; P < 0: it delivers power.',
    'The powers in a circuit add to 0.',
  ],
  variables: [
    vr('V', 'V', 'Voltage across', 'V', -1000, 1000, { step: 0.5 }),
    vr('I', 'I', 'Current into +', 'A', -1000, 1000, { step: 0.5 }),
    vr('P', 'P', 'Power absorbed', 'W', -1e6, 1e6),
  ],
  rules: [
    rule('P = VI', '{P} = {V} × {I}', ['P', 'V', 'I'], (x) => x.P! - x.V! * x.I!, {
      P: [
        (x) => x.V! * x.I!,
        '{V} × {I}',
        'Power absorbed: voltage times the current into the + terminal.',
      ],
      V: [(x) => div(x.P!, x.I!), '{P} ÷ {I}', 'Divide the power by the current.'],
      I: [(x) => div(x.P!, x.V!), '{P} ÷ {V}', 'Divide the power by the voltage.'],
    }),
  ],
  example: { V: 5, I: -2, P: -10 },
  startWith: ['V', 'I'],
  representation: net('seriesCircuit', {
    topology: 'element',
    elements: [{ kind: 'R', name: 'element', v: 'V', i: 'I', p: 'P' }],
  }),
});

// ─── circuits-1#1: nodal analysis ─────────────────────────────────────────────

/** The conductance matrix's determinant (mS²) for the two-node circuit, R in kΩ. */
const det2 = (x: Values) =>
  (1 / x.R1! + 1 / x.R2! + 1 / x.R3!) * (1 / x.R3! + 1 / x.R4!) - 1 / x.R3! ** 2;

const twoNode = demo({
  id: 'g.he-series-circuit-two-node',
  title: 'Schematic: nodal analysis with two node voltages',
  use: 'Use this for “Find the node voltages V₁ and V₂ by nodal analysis.”',
  assumptions: [
    'Kirchhoff’s current law at each node: the currents leaving through R₂ and R₃ (node 1), and R₄ (node 2), equal what comes in.',
    'Ground is the bottom wire (0 V); R in kΩ and currents in mA, so V/kΩ = mA.',
    'The conductance matrix is solved by Cramer’s rule.',
  ],
  variables: [
    vr('Vs', 'Vₛ', 'Source voltage', 'V', -100, 100, { step: 0.5 }),
    vr('Is', 'Iₛ', 'Current source', 'mA', -1000, 1000, { step: 0.5 }),
    ohms('R1', 'R₁', 'Resistor 1', 'kΩ'),
    ohms('R2', 'R₂', 'Resistor 2', 'kΩ'),
    ohms('R3', 'R₃', 'Resistor 3', 'kΩ'),
    ohms('R4', 'R₄', 'Resistor 4', 'kΩ'),
    vr('D', 'Δ', 'Determinant of the conductance matrix', 'mS²', 1e-12, 1e12, { derived: true }),
    vr('V1', 'V₁', 'Node voltage 1', 'V', -1e4, 1e4),
    vr('V2', 'V₂', 'Node voltage 2', 'V', -1e4, 1e4),
  ],
  rules: [
    rule(
      'Δ = (G₁ + G₂ + G₃)(G₃ + G₄) − G₃²',
      '{D} = (1 ÷ {R1} + 1 ÷ {R2} + 1 ÷ {R3}) × (1 ÷ {R3} + 1 ÷ {R4}) − (1 ÷ {R3})²',
      ['D', 'R1', 'R2', 'R3', 'R4'],
      (x) => x.D! - det2(x),
      {
        D: [
          det2,
          '(1 ÷ {R1} + 1 ÷ {R2} + 1 ÷ {R3}) × (1 ÷ {R3} + 1 ÷ {R4}) − (1 ÷ {R3})²',
          'The determinant of the conductance matrix [G₁ + G₂ + G₃, −G₃; −G₃, G₃ + G₄].',
        ],
      },
    ),
    rule(
      'V₁ by Cramer’s rule',
      '{V1} = ({Vs} ÷ {R1} × (1 ÷ {R3} + 1 ÷ {R4}) + {Is} ÷ {R3}) ÷ {D}',
      ['V1', 'Vs', 'R1', 'R3', 'R4', 'Is', 'D'],
      (x) => x.V1! * x.D! - ((x.Vs! / x.R1!) * (1 / x.R3! + 1 / x.R4!) + x.Is! / x.R3!),
      {
        V1: [
          (x) => div((x.Vs! / x.R1!) * (1 / x.R3! + 1 / x.R4!) + x.Is! / x.R3!, x.D!),
          '({Vs} ÷ {R1} × (1 ÷ {R3} + 1 ÷ {R4}) + {Is} ÷ {R3}) ÷ {D}',
          'Cramer’s rule: put the right side [Vₛ G₁, Iₛ] in the first column, then divide by Δ.',
        ],
        Vs: [
          (x) => div((x.V1! * x.D! - x.Is! / x.R3!) * x.R1!, 1 / x.R3! + 1 / x.R4!),
          '({V1} × {D} − {Is} ÷ {R3}) × {R1} ÷ (1 ÷ {R3} + 1 ÷ {R4})',
          'Undo Cramer’s rule for the source voltage.',
        ],
        Is: [
          (x) => (x.V1! * x.D! - (x.Vs! / x.R1!) * (1 / x.R3! + 1 / x.R4!)) * x.R3!,
          '({V1} × {D} − {Vs} ÷ {R1} × (1 ÷ {R3} + 1 ÷ {R4})) × {R3}',
          'Undo Cramer’s rule for the current source.',
        ],
      },
    ),
    rule(
      'V₂ by Cramer’s rule',
      '{V2} = ((1 ÷ {R1} + 1 ÷ {R2} + 1 ÷ {R3}) × {Is} + {Vs} ÷ ({R1} × {R3})) ÷ {D}',
      ['V2', 'R1', 'R2', 'R3', 'Is', 'Vs', 'D'],
      (x) => x.V2! * x.D! - ((1 / x.R1! + 1 / x.R2! + 1 / x.R3!) * x.Is! + x.Vs! / (x.R1! * x.R3!)),
      {
        V2: [
          (x) => div((1 / x.R1! + 1 / x.R2! + 1 / x.R3!) * x.Is! + x.Vs! / (x.R1! * x.R3!), x.D!),
          '((1 ÷ {R1} + 1 ÷ {R2} + 1 ÷ {R3}) × {Is} + {Vs} ÷ ({R1} × {R3})) ÷ {D}',
          'Cramer’s rule: put the right side in the second column, then divide by Δ.',
        ],
      },
    ),
  ],
  example: { Vs: 10, Is: 1, R1: 1, R2: 2, R3: 2, R4: 2, D: 1.75, V1: 6, V2: 4 },
  startWith: ['Vs', 'Is', 'R1', 'R2', 'R3', 'R4'],
  representation: net('seriesCircuit', {
    topology: 'twoNode',
    elements: [
      { id: 'Vs', kind: 'V' },
      { id: 'R1', kind: 'R' },
      { id: 'R2', kind: 'R' },
      { id: 'R3', kind: 'R' },
      { id: 'R4', kind: 'R' },
      { id: 'Is', kind: 'I' },
    ],
    nodes: ['V1', 'V2'],
  }),
});

// ─── circuits-1#1~mesh ────────────────────────────────────────────────────────

const meshDet = (x: Values) => (x.R1! + x.R2!) * (x.R2! + x.R3!) - x.R2! ** 2;

const twoMesh = demo({
  id: 'g.he-series-circuit-two-mesh',
  title: 'Schematic: two mesh currents',
  use: 'Use this for “Find the mesh currents I₁ and I₂ and the current in the shared resistor.”',
  assumptions: [
    'Both mesh currents are taken clockwise; V_b’s + terminal meets I₂ first.',
    'The shared resistor R₂ carries I₁ − I₂ (down).',
    'KVL round each mesh: (R₁ + R₂)I₁ − R₂I₂ = V_a and −R₂I₁ + (R₂ + R₃)I₂ = −V_b.',
  ],
  variables: [
    vr('Va', 'V_a', 'Left source', 'V', -100, 100, { step: 0.5 }),
    vr('Vb', 'V_b', 'Right source', 'V', -100, 100, { step: 0.5 }),
    ohms('R1', 'R₁', 'Resistor 1'),
    ohms('R2', 'R₂', 'Shared resistor'),
    ohms('R3', 'R₃', 'Resistor 3'),
    vr('I1', 'I₁', 'Mesh current 1', 'A', -1e4, 1e4),
    vr('I2', 'I₂', 'Mesh current 2', 'A', -1e4, 1e4),
    vr('IR2', 'I_R2', 'Current in R₂', 'A', -1e4, 1e4),
  ],
  rules: [
    rule(
      'I₁ by Cramer’s rule',
      '{I1} = ({Va} × ({R2} + {R3}) − {R2} × {Vb}) ÷ (({R1} + {R2}) × ({R2} + {R3}) − {R2}²)',
      ['I1', 'Va', 'R2', 'R3', 'Vb', 'R1'],
      (x) => x.I1! * meshDet(x) - (x.Va! * (x.R2! + x.R3!) - x.R2! * x.Vb!),
      {
        I1: [
          (x) => div(x.Va! * (x.R2! + x.R3!) - x.R2! * x.Vb!, meshDet(x)),
          '({Va} × ({R2} + {R3}) − {R2} × {Vb}) ÷ (({R1} + {R2}) × ({R2} + {R3}) − {R2}²)',
          'Cramer’s rule on the mesh equations: the right side [V_a, −V_b] in the first column, over the determinant.',
        ],
        Va: [
          (x) => div(x.I1! * meshDet(x) + x.R2! * x.Vb!, x.R2! + x.R3!),
          '({I1} × (({R1} + {R2}) × ({R2} + {R3}) − {R2}²) + {R2} × {Vb}) ÷ ({R2} + {R3})',
          'Undo Cramer’s rule for the left source.',
        ],
        Vb: [
          (x) => div(x.Va! * (x.R2! + x.R3!) - x.I1! * meshDet(x), x.R2!),
          '({Va} × ({R2} + {R3}) − {I1} × (({R1} + {R2}) × ({R2} + {R3}) − {R2}²)) ÷ {R2}',
          'Undo Cramer’s rule for the right source.',
        ],
      },
    ),
    rule(
      'I₂ by Cramer’s rule',
      '{I2} = ({R2} × {Va} − ({R1} + {R2}) × {Vb}) ÷ (({R1} + {R2}) × ({R2} + {R3}) − {R2}²)',
      ['I2', 'R2', 'Va', 'R1', 'Vb', 'R3'],
      (x) => x.I2! * meshDet(x) - (x.R2! * x.Va! - (x.R1! + x.R2!) * x.Vb!),
      {
        I2: [
          (x) => div(x.R2! * x.Va! - (x.R1! + x.R2!) * x.Vb!, meshDet(x)),
          '({R2} × {Va} − ({R1} + {R2}) × {Vb}) ÷ (({R1} + {R2}) × ({R2} + {R3}) − {R2}²)',
          'Cramer’s rule: the right side in the second column, over the same determinant.',
        ],
      },
    ),
    rule(
      'I_R2 = I₁ − I₂',
      '{IR2} = {I1} − {I2}',
      ['IR2', 'I1', 'I2'],
      (x) => x.IR2! - x.I1! + x.I2!,
      {
        IR2: [
          (x) => x.I1! - x.I2!,
          '{I1} − {I2}',
          'Both mesh currents pass through R₂, in opposite directions.',
        ],
        I1: [(x) => x.IR2! + x.I2!, '{IR2} + {I2}', 'Add I₂ back to the shared current.'],
        I2: [(x) => x.I1! - x.IR2!, '{I1} − {IR2}', 'Take the shared current from I₁.'],
      },
    ),
  ],
  example: { Va: 8, Vb: 2, R1: 2, R2: 4, R3: 2, I1: 2, I2: 1, IR2: 1 },
  startWith: ['Va', 'Vb', 'R1', 'R2', 'R3'],
  representation: net('seriesCircuit', {
    topology: 'twoMesh',
    elements: [
      { id: 'Va', kind: 'V' },
      { id: 'R1', kind: 'R' },
      { id: 'R2', kind: 'R' },
      { id: 'R3', kind: 'R' },
      { id: 'Vb', kind: 'V' },
    ],
    meshes: ['I1', 'I2'],
    branches: ['IR2'],
  }),
});

// ─── circuits-1#1~supernode ───────────────────────────────────────────────────

const supernode = demo({
  id: 'g.he-series-circuit-supernode',
  title: 'Schematic: a supernode round a voltage source',
  use: 'Use this for “A 6 V source joins two nodes. Find both node voltages with a supernode.”',
  assumptions: [
    'The voltage source fixes V₁ − V₂ = Vₓ; the two nodes and the source form one supernode.',
    'KCL round the supernode: Iₛ in equals V₁/R₁ + V₂/R₂ out.',
    'Ground is the bottom wire.',
  ],
  variables: [
    vr('Vx', 'Vₓ', 'Source between the nodes', 'V', -100, 100, { step: 0.5 }),
    vr('Is', 'Iₛ', 'Current source', 'A', -100, 100, { step: 0.5 }),
    ohms('R1', 'R₁', 'Resistor 1'),
    ohms('R2', 'R₂', 'Resistor 2'),
    vr('V1', 'V₁', 'Node voltage 1', 'V', -1e6, 1e6),
    vr('V2', 'V₂', 'Node voltage 2', 'V', -1e6, 1e6),
  ],
  rules: [
    rule('V₁ − V₂ = Vₓ', '{V2} = {V1} − {Vx}', ['V2', 'V1', 'Vx'], (x) => x.V2! - x.V1! + x.Vx!, {
      V2: [
        (x) => x.V1! - x.Vx!,
        '{V1} − {Vx}',
        'The source between the nodes sets their difference.',
      ],
      V1: [(x) => x.V2! + x.Vx!, '{V2} + {Vx}', 'Node 1 sits Vₓ above node 2.'],
      Vx: [
        (x) => x.V1! - x.V2!,
        '{V1} − {V2}',
        'The source’s voltage is the difference of the nodes.',
      ],
    }),
    rule(
      'V₁ from the supernode',
      '{V1} = ({Is} × {R1} × {R2} + {Vx} × {R1}) ÷ ({R1} + {R2})',
      ['V1', 'Is', 'R1', 'R2', 'Vx'],
      (x) => x.V1! * (x.R1! + x.R2!) - (x.Is! * x.R1! * x.R2! + x.Vx! * x.R1!),
      {
        V1: [
          (x) => div(x.Is! * x.R1! * x.R2! + x.Vx! * x.R1!, x.R1! + x.R2!),
          '({Is} × {R1} × {R2} + {Vx} × {R1}) ÷ ({R1} + {R2})',
          'Put V₂ = V₁ − Vₓ into V₁/R₁ + V₂/R₂ = Iₛ and solve for V₁.',
        ],
        Is: [
          (x) => div(x.V1! * (x.R1! + x.R2!) - x.Vx! * x.R1!, x.R1! * x.R2!),
          '({V1} × ({R1} + {R2}) − {Vx} × {R1}) ÷ ({R1} × {R2})',
          'The current the supernode must take in.',
        ],
        Vx: [
          (x) => div(x.V1! * (x.R1! + x.R2!) - x.Is! * x.R1! * x.R2!, x.R1!),
          '({V1} × ({R1} + {R2}) − {Is} × {R1} × {R2}) ÷ {R1}',
          'The source’s voltage from node 1’s voltage.',
        ],
      },
    ),
  ],
  example: { Vx: 6, Is: 6, R1: 2, R2: 4, V1: 10, V2: 4 },
  startWith: ['Vx', 'Is', 'R1', 'R2'],
  representation: net('seriesCircuit', {
    topology: 'supernode',
    elements: [
      { id: 'Is', kind: 'I' },
      { id: 'R1', kind: 'R' },
      { id: 'Vx', kind: 'V' },
      { id: 'R2', kind: 'R' },
    ],
    nodes: ['V1', 'V2'],
  }),
});

// ─── circuits-1#2: Thévenin ───────────────────────────────────────────────────

const thevenin = demo({
  id: 'g.he-series-circuit-thevenin',
  title: 'Schematic: a circuit and its Thévenin equivalent',
  use: 'Use this for “Find the Thévenin equivalent seen by R_L and the current through it.”',
  assumptions: [
    'V_Th is the open-circuit voltage at a–b; R_Th is the resistance there with Vₛ shorted.',
    'The equivalent gives the same current to any load.',
    'Ideal source and wires.',
  ],
  variables: [
    vr('Vs', 'Vₛ', 'Source voltage', 'V', 0, 1000, { step: 0.5 }),
    ohms('R1', 'R₁', 'Series resistor'),
    ohms('R2', 'R₂', 'Shunt resistor'),
    ohms('RL', 'R_L', 'Load'),
    vr('Vth', 'V_Th', 'Thévenin voltage', 'V', 0, 1000),
    vr('Rth', 'R_Th', 'Thévenin resistance', 'Ω', 0.001, 1e6),
    vr('IL', 'I_L', 'Load current', 'A', 0, 1e5),
    vr('VL', 'V_L', 'Load voltage', 'V', 0, 1000),
  ],
  rules: [
    rule(
      'V_Th = VₛR₂ ÷ (R₁ + R₂)',
      '{Vth} = {Vs} × {R2} ÷ ({R1} + {R2})',
      ['Vth', 'Vs', 'R2', 'R1'],
      (x) => x.Vth! * (x.R1! + x.R2!) - x.Vs! * x.R2!,
      {
        Vth: [
          (x) => div(x.Vs! * x.R2!, x.R1! + x.R2!),
          '{Vs} × {R2} ÷ ({R1} + {R2})',
          'With no load the two resistors divide the source voltage.',
        ],
        Vs: [
          (x) => div(x.Vth! * (x.R1! + x.R2!), x.R2!),
          '{Vth} × ({R1} + {R2}) ÷ {R2}',
          'Undo the divider.',
        ],
      },
    ),
    rule(
      'R_Th = R₁R₂ ÷ (R₁ + R₂)',
      '{Rth} = {R1} × {R2} ÷ ({R1} + {R2})',
      ['Rth', 'R1', 'R2'],
      (x) => x.Rth! * (x.R1! + x.R2!) - x.R1! * x.R2!,
      {
        Rth: [
          (x) => div(x.R1! * x.R2!, x.R1! + x.R2!),
          '{R1} × {R2} ÷ ({R1} + {R2})',
          'Short the source: from a–b, R₁ and R₂ are in parallel.',
        ],
      },
    ),
    rule(
      'I_L = V_Th ÷ (R_Th + R_L)',
      '{IL} = {Vth} ÷ ({Rth} + {RL})',
      ['IL', 'Vth', 'Rth', 'RL'],
      (x) => x.IL! * (x.Rth! + x.RL!) - x.Vth!,
      {
        IL: [
          (x) => div(x.Vth!, x.Rth! + x.RL!),
          '{Vth} ÷ ({Rth} + {RL})',
          'The equivalent is one loop: V_Th over R_Th and the load in series.',
        ],
        RL: [
          (x) => div(x.Vth!, x.IL!)! - x.Rth!,
          '{Vth} ÷ {IL} − {Rth}',
          'The loop’s total resistance, less R_Th.',
        ],
      },
    ),
    rule('V_L = I_L R_L', '{VL} = {IL} × {RL}', ['VL', 'IL', 'RL'], (x) => x.VL! - x.IL! * x.RL!, {
      VL: [(x) => x.IL! * x.RL!, '{IL} × {RL}', 'Ohm’s law for the load.'],
      IL: [(x) => div(x.VL!, x.RL!), '{VL} ÷ {RL}', 'Ohm’s law for the load, divided by R_L.'],
    }),
  ],
  example: { Vs: 12, R1: 3, R2: 6, RL: 6, Vth: 8, Rth: 2, IL: 1, VL: 6 },
  startWith: ['Vs', 'R1', 'R2', 'RL'],
  representation: net('seriesCircuit', {
    topology: 'thevenin',
    elements: [
      { id: 'Vs', kind: 'V' },
      { id: 'R1', kind: 'R' },
      { id: 'R2', kind: 'R' },
      { id: 'RL', kind: 'R', v: 'VL' },
    ],
    branches: ['IL'],
    equivalent: { v: 'Vth', r: 'Rth' },
  }),
});

// ─── circuits-1#2~norton ──────────────────────────────────────────────────────

const norton = demo({
  id: 'g.he-series-circuit-norton',
  title: 'Schematic: Thévenin and Norton forms',
  use: 'Use this for “Turn an 8 V, 2 Ω Thévenin equivalent into its Norton form.”',
  assumptions: [
    'Both forms give any load the same voltage and current.',
    'R_N = R_Th; I_N is the short-circuit current at a–b.',
  ],
  variables: [
    vr('Vth', 'V_Th', 'Thévenin voltage', 'V', -1000, 1000, { step: 0.5 }),
    ohms('Rth', 'R_Th', 'Thévenin resistance'),
    vr('In', 'I_N', 'Norton current', 'A', -1e5, 1e5),
  ],
  rules: [
    rule(
      'V_Th = I_N R_Th',
      '{Vth} = {In} × {Rth}',
      ['Vth', 'In', 'Rth'],
      (x) => x.Vth! - x.In! * x.Rth!,
      {
        In: [
          (x) => div(x.Vth!, x.Rth!),
          '{Vth} ÷ {Rth}',
          'Short a–b: the Thévenin source drives V_Th ÷ R_Th through the short.',
        ],
        Vth: [(x) => x.In! * x.Rth!, '{In} × {Rth}', 'Open a–b: all of I_N goes through R_Th.'],
        Rth: [
          (x) => div(x.Vth!, x.In!),
          '{Vth} ÷ {In}',
          'Open-circuit voltage over short-circuit current.',
        ],
      },
    ),
  ],
  example: { Vth: 8, Rth: 2, In: 4 },
  startWith: ['Vth', 'Rth'],
  representation: net('seriesCircuit', {
    topology: 'norton',
    elements: [
      { id: 'Vth', kind: 'V' },
      { id: 'Rth', kind: 'R' },
      { id: 'In', kind: 'I' },
    ],
  }),
});

// ─── circuits-1#2~max-power ───────────────────────────────────────────────────

const maxPower = demo({
  id: 'g.he-series-circuit-max-power',
  title: 'Schematic: power into a load on a Thévenin source',
  use: 'Use this for “What load takes the most power from an 8 V, 2 Ω source, and how much does a 6 Ω load take?”',
  assumptions: [
    'The load is on the Thévenin equivalent of the circuit.',
    'The load takes the most power when R_L = R_Th.',
  ],
  variables: [
    vr('Vth', 'V_Th', 'Thévenin voltage', 'V', 0, 1000, { step: 0.5 }),
    ohms('Rth', 'R_Th', 'Thévenin resistance'),
    ohms('RL', 'R_L', 'Load'),
    vr('PL', 'P_L', 'Power in the load', 'W', 0, 1e9),
    vr('Pmax', 'P_max', 'Most power any load takes', 'W', 0, 1e9),
  ],
  rules: [
    rule(
      'P_L = V_Th²R_L ÷ (R_Th + R_L)²',
      '{PL} = {Vth}² × {RL} ÷ ({Rth} + {RL})²',
      ['PL', 'Vth', 'RL', 'Rth'],
      (x) => x.PL! * (x.Rth! + x.RL!) ** 2 - x.Vth! ** 2 * x.RL!,
      {
        PL: [
          (x) => div(x.Vth! ** 2 * x.RL!, (x.Rth! + x.RL!) ** 2),
          '{Vth}² × {RL} ÷ ({Rth} + {RL})²',
          'The loop current V_Th ÷ (R_Th + R_L), squared, times R_L.',
        ],
        RL: [
          (x) => {
            // P_L R_L² + (2P_L R_Th − V_Th²) R_L + P_L R_Th² = 0: two loads give the same power.
            const [a, b, c] = [x.PL!, 2 * x.PL! * x.Rth! - x.Vth! ** 2, x.PL! * x.Rth! ** 2];
            const disc = b * b - 4 * a * c;
            if (a === 0 || disc < 0) return undefined;
            return [(-b + Math.sqrt(disc)) / (2 * a), (-b - Math.sqrt(disc)) / (2 * a)];
          },
          '({Vth}² − 2 × {PL} × {Rth} ± √(({Vth}² − 2 × {PL} × {Rth})² − 4 × {PL}² × {Rth}²)) ÷ (2 × {PL})',
          'A quadratic in R_L: two loads take the same power, one each side of R_Th.',
        ],
      },
    ),
    rule(
      'P_max = V_Th² ÷ (4R_Th)',
      '{Pmax} = {Vth}² ÷ (4 × {Rth})',
      ['Pmax', 'Vth', 'Rth'],
      (x) => x.Pmax! * 4 * x.Rth! - x.Vth! ** 2,
      {
        Pmax: [
          (x) => div(x.Vth! ** 2, 4 * x.Rth!),
          '{Vth}² ÷ (4 × {Rth})',
          'At R_L = R_Th the load gets half the voltage: (V_Th ÷ 2)² ÷ R_Th.',
        ],
        Rth: [
          (x) => div(x.Vth! ** 2, 4 * x.Pmax!),
          '{Vth}² ÷ (4 × {Pmax})',
          'Solve P_max = V_Th² ÷ (4R_Th) for R_Th.',
        ],
      },
    ),
  ],
  example: { Vth: 8, Rth: 2, RL: 6, PL: 6, Pmax: 8 },
  startWith: ['Vth', 'Rth', 'RL'],
  representation: net('seriesCircuit', {
    topology: 'series',
    elements: [
      { id: 'Vth', kind: 'V' },
      { id: 'Rth', kind: 'R' },
      { id: 'RL', kind: 'R', p: 'PL' },
    ],
  }),
});

// ─── circuits-1#2~superposition ───────────────────────────────────────────────

const superposition = demo({
  id: 'g.he-series-circuit-superposition',
  title: 'Schematic: superposition of two sources',
  use: 'Use this for “Find the node voltage by superposition: one source at a time.”',
  assumptions: [
    'A linear circuit: the response to both sources is the sum of the responses to each alone.',
    'A voltage source is turned off by a short, a current source by an open.',
  ],
  variables: [
    vr('Vs', 'Vₛ', 'Voltage source', 'V', -1000, 1000, { step: 0.5 }),
    vr('Is', 'Iₛ', 'Current source', 'A', -1000, 1000, { step: 0.5 }),
    ohms('R1', 'R₁', 'Series resistor'),
    ohms('R2', 'R₂', 'Shunt resistor'),
    vr('Vp', 'V′', 'Node voltage, Vₛ alone', 'V', -1e6, 1e6),
    vr('Vpp', 'V″', 'Node voltage, Iₛ alone', 'V', -1e6, 1e6),
    vr('V', 'V', 'Node voltage', 'V', -1e6, 1e6),
  ],
  rules: [
    rule(
      'V′ = VₛR₂ ÷ (R₁ + R₂)',
      '{Vp} = {Vs} × {R2} ÷ ({R1} + {R2})',
      ['Vp', 'Vs', 'R2', 'R1'],
      (x) => x.Vp! * (x.R1! + x.R2!) - x.Vs! * x.R2!,
      {
        Vp: [
          (x) => div(x.Vs! * x.R2!, x.R1! + x.R2!),
          '{Vs} × {R2} ÷ ({R1} + {R2})',
          'Iₛ opened: R₁ and R₂ divide Vₛ.',
        ],
        Vs: [
          (x) => div(x.Vp! * (x.R1! + x.R2!), x.R2!),
          '{Vp} × ({R1} + {R2}) ÷ {R2}',
          'Undo the divider.',
        ],
      },
    ),
    rule(
      'V″ = IₛR₁R₂ ÷ (R₁ + R₂)',
      '{Vpp} = {Is} × {R1} × {R2} ÷ ({R1} + {R2})',
      ['Vpp', 'Is', 'R1', 'R2'],
      (x) => x.Vpp! * (x.R1! + x.R2!) - x.Is! * x.R1! * x.R2!,
      {
        Vpp: [
          (x) => div(x.Is! * x.R1! * x.R2!, x.R1! + x.R2!),
          '{Is} × {R1} × {R2} ÷ ({R1} + {R2})',
          'Vₛ shorted: Iₛ flows into R₁ and R₂ in parallel.',
        ],
        Is: [
          (x) => div(x.Vpp! * (x.R1! + x.R2!), x.R1! * x.R2!),
          '{Vpp} × ({R1} + {R2}) ÷ ({R1} × {R2})',
          'Ohm’s law for the parallel pair.',
        ],
      },
    ),
    rule('V = V′ + V″', '{V} = {Vp} + {Vpp}', ['V', 'Vp', 'Vpp'], (x) => x.V! - x.Vp! - x.Vpp!, {
      V: [(x) => x.Vp! + x.Vpp!, '{Vp} + {Vpp}', 'Superposition: add the two one-source answers.'],
      Vp: [(x) => x.V! - x.Vpp!, '{V} − {Vpp}', 'Take away what the current source gives.'],
      Vpp: [(x) => x.V! - x.Vp!, '{V} − {Vp}', 'Take away what the voltage source gives.'],
    }),
  ],
  example: { Vs: 12, Is: 3, R1: 3, R2: 6, Vp: 8, Vpp: 6, V: 14 },
  startWith: ['Vs', 'Is', 'R1', 'R2'],
  representation: net('seriesCircuit', {
    topology: 'superposition',
    elements: [
      { id: 'Vs', kind: 'V' },
      { id: 'R1', kind: 'R' },
      { id: 'R2', kind: 'R' },
      { id: 'Is', kind: 'I' },
    ],
    nodes: ['V'],
    parts: ['Vp', 'Vpp'],
  }),
});

// ─── circuits-1#4: the switched RC, RL and RLC loops ──────────────────────────

const rcV = 10 * (1 - Math.exp(-1));
const rc = demo({
  id: 'g.he-series-circuit-rc',
  title: 'Schematic: an RC circuit switched on at t = 0',
  use: 'Use this for “A 100 μF capacitor charges through 10 kΩ from 10 V. Find v_C after 1 s.”',
  assumptions: [
    'The capacitor starts empty; the switch closes at t = 0.',
    'R in kΩ and C in μF give τ in ms; after 5τ the capacitor is within 1% of full.',
    'KVL at each moment: Vₛ = iR + v_C.',
  ],
  variables: [
    vr('Vs', 'Vₛ', 'Source voltage', 'V', 0, 1000, { step: 0.5 }),
    ohms('R', 'R', 'Resistance', 'kΩ'),
    vr('C', 'C', 'Capacitance', 'μF', 1e-6, 1e6, { step: 1 }),
    vr('tau', 'τ', 'Time constant', 'ms', 1e-9, 1e12),
    vr('t', 't', 'Time since the switch closed', 'ms', 0, 1e7, { step: 10 }),
    vr('vC', 'v_C', 'Capacitor voltage', 'V', 0, 1000),
    vr('i', 'i', 'Current', 'mA', 0, 1e6),
  ],
  rules: [
    rule('τ = RC', '{tau} = {R} × {C}', ['tau', 'R', 'C'], (x) => x.tau! - x.R! * x.C!, {
      tau: [(x) => x.R! * x.C!, '{R} × {C}', 'The time constant: kΩ × μF gives ms.'],
      R: [(x) => div(x.tau!, x.C!), '{tau} ÷ {C}', 'Divide τ by C.'],
      C: [(x) => div(x.tau!, x.R!), '{tau} ÷ {R}', 'Divide τ by R.'],
    }),
    rule(
      'v_C = Vₛ(1 − e^(−t/τ))',
      '{vC} = {Vs} × (1 − e^(−{t} ÷ {tau}))',
      ['vC', 'Vs', 't', 'tau'],
      (x) => x.vC! - x.Vs! * (1 - Math.exp(-x.t! / x.tau!)),
      {
        vC: [
          (x) => x.Vs! * (1 - Math.exp(-x.t! / x.tau!)),
          '{Vs} × (1 − e^(−{t} ÷ {tau}))',
          'The capacitor charges toward Vₛ, closing the gap by e each τ.',
        ],
        t: [
          (x) => (x.vC! < x.Vs! ? -x.tau! * Math.log(1 - x.vC! / x.Vs!) : undefined),
          '−{tau} × ln(1 − {vC} ÷ {Vs})',
          'Take the natural log to free t.',
        ],
      },
    ),
    rule(
      'i = (Vₛ − v_C) ÷ R',
      '{i} = ({Vs} − {vC}) ÷ {R}',
      ['i', 'Vs', 'vC', 'R'],
      (x) => x.i! * x.R! - (x.Vs! - x.vC!),
      {
        i: [
          (x) => div(x.Vs! - x.vC!, x.R!),
          '({Vs} − {vC}) ÷ {R}',
          'KVL: what the capacitor doesn’t hold is across R; V ÷ kΩ gives mA.',
        ],
        vC: [(x) => x.Vs! - x.i! * x.R!, '{Vs} − {i} × {R}', 'KVL round the loop: Vₛ = iR + v_C.'],
      },
    ),
  ],
  example: { Vs: 10, R: 10, C: 100, tau: 1000, t: 1000, vC: rcV, i: (10 - rcV) / 10 },
  startWith: ['Vs', 'R', 'C', 't'],
  representation: net('seriesCircuit', {
    topology: 'rc',
    elements: [
      { id: 'Vs', kind: 'V' },
      { id: 'R', kind: 'R', i: 'i' },
      { id: 'C', kind: 'C', v: 'vC' },
    ],
  }),
});

const rlI = 3 * (1 - Math.exp(-2));
const rl = demo({
  id: 'g.he-series-circuit-rl',
  title: 'Schematic: an RL circuit switched on at t = 0',
  use: 'Use this for “12 V drives a 2 H coil through 4 Ω. Find the current 1 s after the switch closes.”',
  assumptions: [
    'No current flows before t = 0; the inductor’s current can’t jump.',
    'τ = L ÷ R; the current climbs toward Vₛ ÷ R.',
  ],
  variables: [
    vr('Vs', 'Vₛ', 'Source voltage', 'V', 0, 1000, { step: 0.5 }),
    ohms('R', 'R', 'Resistance'),
    vr('L', 'L', 'Inductance', 'H', 1e-9, 1e4, { step: 0.1 }),
    vr('tau', 'τ', 'Time constant', 's', 1e-12, 1e9),
    vr('t', 't', 'Time since the switch closed', 's', 0, 1e6, { step: 0.1 }),
    vr('i', 'i', 'Current', 'A', 0, 1e5),
  ],
  rules: [
    rule('τ = L ÷ R', '{tau} = {L} ÷ {R}', ['tau', 'L', 'R'], (x) => x.tau! * x.R! - x.L!, {
      tau: [(x) => div(x.L!, x.R!), '{L} ÷ {R}', 'The time constant of an RL loop: H ÷ Ω gives s.'],
      L: [(x) => x.tau! * x.R!, '{tau} × {R}', 'Multiply τ by R.'],
      R: [(x) => div(x.L!, x.tau!), '{L} ÷ {tau}', 'Divide L by τ.'],
    }),
    rule(
      'i = (Vₛ ÷ R)(1 − e^(−t/τ))',
      '{i} = {Vs} ÷ {R} × (1 − e^(−{t} ÷ {tau}))',
      ['i', 'Vs', 'R', 't', 'tau'],
      (x) => x.i! - (x.Vs! / x.R!) * (1 - Math.exp(-x.t! / x.tau!)),
      {
        i: [
          (x) => div(x.Vs!, x.R!)! * (1 - Math.exp(-x.t! / x.tau!)),
          '{Vs} ÷ {R} × (1 − e^(−{t} ÷ {tau}))',
          'The current climbs toward Vₛ ÷ R, closing the gap by e each τ.',
        ],
        t: [
          (x) => (x.i! * x.R! < x.Vs! ? -x.tau! * Math.log(1 - (x.i! * x.R!) / x.Vs!) : undefined),
          '−{tau} × ln(1 − {i} × {R} ÷ {Vs})',
          'Take the natural log to free t.',
        ],
      },
    ),
  ],
  example: { Vs: 12, R: 4, L: 2, tau: 0.5, t: 1, i: rlI },
  startWith: ['Vs', 'R', 'L', 't'],
  representation: net('seriesCircuit', {
    topology: 'rl',
    elements: [
      { id: 'Vs', kind: 'V' },
      { id: 'R', kind: 'R', i: 'i' },
      { id: 'L', kind: 'L' },
    ],
  }),
});

const rlc = demo({
  id: 'g.he-series-circuit-rlc',
  title: 'Schematic: a series RLC loop and its damping',
  use: 'Use this for “Is a series RLC of 10 Ω, 1 mH and 10 μF over-, under- or critically damped?”',
  assumptions: [
    'A series loop: α = R ÷ (2L), ω₀ = 1 ÷ √(LC).',
    'α < ω₀: underdamped, ringing at ω_d = √(ω₀² − α²).',
  ],
  variables: [
    ohms('R', 'R', 'Resistance'),
    vr('L', 'L', 'Inductance', 'H', 1e-9, 1e4, { scientific: true }),
    vr('C', 'C', 'Capacitance', 'F', 1e-15, 10, { scientific: true }),
    vr('alpha', 'α', 'Neper frequency', 's⁻¹', 1e-9, 1e15),
    vr('w0', 'ω₀', 'Resonant frequency', 'rad/s', 1e-9, 1e15),
    vr('wd', 'ω_d', 'Damped frequency', 'rad/s', 0, 1e15),
  ],
  rules: [
    rule(
      'α = R ÷ (2L)',
      '{alpha} = {R} ÷ (2 × {L})',
      ['alpha', 'R', 'L'],
      (x) => x.alpha! * 2 * x.L! - x.R!,
      {
        alpha: [
          (x) => div(x.R!, 2 * x.L!),
          '{R} ÷ (2 × {L})',
          'How fast the loop loses energy to R.',
        ],
        R: [(x) => 2 * x.L! * x.alpha!, '2 × {L} × {alpha}', 'Multiply by 2L.'],
      },
    ),
    rule(
      'ω₀ = 1 ÷ √(LC)',
      '{w0} = 1 ÷ √({L} × {C})',
      ['w0', 'L', 'C'],
      (x) => x.w0! ** 2 * x.L! * x.C! - 1,
      {
        w0: [
          (x) => 1 / Math.sqrt(x.L! * x.C!),
          '1 ÷ √({L} × {C})',
          'The frequency L and C trade energy at with no R.',
        ],
        C: [
          (x) => div(1, x.w0! ** 2 * x.L!),
          '1 ÷ ({w0}² × {L})',
          'Square both sides, then divide by L.',
        ],
      },
    ),
    rule(
      'ω_d = √(ω₀² − α²)',
      '{wd} = √({w0}² − {alpha}²)',
      ['wd', 'w0', 'alpha'],
      (x) => x.wd! ** 2 - (x.w0! ** 2 - x.alpha! ** 2),
      {
        wd: [
          (x) => (x.w0! > x.alpha! ? Math.sqrt(x.w0! ** 2 - x.alpha! ** 2) : undefined),
          '√({w0}² − {alpha}²)',
          'Underdamped (α < ω₀): it rings a little slower than ω₀.',
        ],
      },
    ),
  ],
  example: { R: 10, L: 0.001, C: 0.00001, alpha: 5000, w0: 10000, wd: Math.sqrt(1e8 - 2.5e7) },
  startWith: ['R', 'L', 'C'],
  representation: net('seriesCircuit', {
    topology: 'rlc',
    elements: [
      { kind: 'V', name: 'Vₛ' },
      { id: 'R', kind: 'R' },
      { id: 'L', kind: 'L' },
      { id: 'C', kind: 'C' },
    ],
  }),
});

// ─── university-2#1: a capacitor network (`circuit`) ──────────────────────────

const capacitors = demo({
  id: 'g.he-circuit-capacitors',
  title: 'Schematic: C₁ in series with C₂ ∥ C₃',
  use: 'Use this for “6, 2 and 1 μF capacitors, C₁ in series with C₂ ∥ C₃, are charged by 12 V. Find the charge and energy.”',
  assumptions: [
    'In parallel, capacitances add; in series, the charge is the same on each and 1/C adds.',
    'The capacitors start uncharged.',
  ],
  variables: [
    vr('C1', 'C₁', 'Capacitor 1', 'μF', 1e-6, 1e6, { step: 0.5 }),
    vr('C2', 'C₂', 'Capacitor 2', 'μF', 1e-6, 1e6, { step: 0.5 }),
    vr('C3', 'C₃', 'Capacitor 3', 'μF', 1e-6, 1e6, { step: 0.5 }),
    vr('V', 'V', 'Source voltage', 'V', 0, 1e5, { step: 0.5 }),
    vr('Ceq', 'C_eq', 'Equivalent capacitance', 'μF', 1e-6, 1e6),
    vr('Q', 'Q', 'Charge', 'μC', 0, 1e12),
    vr('U', 'U', 'Energy stored', 'μJ', 0, 1e15),
    vr('V1', 'V₁', 'Voltage on C₁', 'V', 0, 1e5),
  ],
  rules: [
    rule(
      'C_eq = C₁(C₂ + C₃) ÷ (C₁ + C₂ + C₃)',
      '{Ceq} = {C1} × ({C2} + {C3}) ÷ ({C1} + {C2} + {C3})',
      ['Ceq', 'C1', 'C2', 'C3'],
      (x) => x.Ceq! * (x.C1! + x.C2! + x.C3!) - x.C1! * (x.C2! + x.C3!),
      {
        Ceq: [
          (x) => div(x.C1! * (x.C2! + x.C3!), x.C1! + x.C2! + x.C3!),
          '{C1} × ({C2} + {C3}) ÷ ({C1} + {C2} + {C3})',
          'C₂ and C₃ add in parallel; that pair in series with C₁ is product over sum.',
        ],
      },
    ),
    rule('Q = C_eq V', '{Q} = {Ceq} × {V}', ['Q', 'Ceq', 'V'], (x) => x.Q! - x.Ceq! * x.V!, {
      Q: [(x) => x.Ceq! * x.V!, '{Ceq} × {V}', 'The charge the source moves: μF × V gives μC.'],
      V: [(x) => div(x.Q!, x.Ceq!), '{Q} ÷ {Ceq}', 'Divide the charge by C_eq.'],
      Ceq: [(x) => div(x.Q!, x.V!), '{Q} ÷ {V}', 'Charge over voltage.'],
    }),
    rule(
      'U = ½C_eq V²',
      '{U} = ½ × {Ceq} × {V}²',
      ['U', 'Ceq', 'V'],
      (x) => x.U! - 0.5 * x.Ceq! * x.V! ** 2,
      {
        U: [
          (x) => 0.5 * x.Ceq! * x.V! ** 2,
          '½ × {Ceq} × {V}²',
          'Energy stored: μF × V² gives μJ.',
        ],
      },
    ),
    rule('V₁ = Q ÷ C₁', '{V1} = {Q} ÷ {C1}', ['V1', 'Q', 'C1'], (x) => x.V1! * x.C1! - x.Q!, {
      V1: [
        (x) => div(x.Q!, x.C1!),
        '{Q} ÷ {C1}',
        'C₁ is in series with the source, so it carries the full charge Q.',
      ],
      Q: [(x) => x.V1! * x.C1!, '{V1} × {C1}', 'The charge on C₁ is the charge the source moved.'],
      C1: [(x) => div(x.Q!, x.V1!), '{Q} ÷ {V1}', 'Charge over voltage for C₁.'],
    }),
  ],
  example: { C1: 6, C2: 2, C3: 1, V: 12, Ceq: 2, Q: 24, U: 144, V1: 4 },
  startWith: ['C1', 'C2', 'C3', 'V'],
  representation: net('circuit', {
    topology: 'seriesParallel',
    elements: [
      { id: 'V', kind: 'V' },
      { id: 'C1', kind: 'C', q: 'Q', v: 'V1' },
      { id: 'C2', kind: 'C' },
      { id: 'C3', kind: 'C' },
    ],
    total: 'Ceq',
  }),
});

// ─── university-2#2: two batteries, three branches (`circuit`) ────────────────

const loopDet = (x: Values) => x.R1! * x.R2! + x.R1! * x.R3! + x.R2! * x.R3!;

const twoLoopModule = (
  id: string,
  title: string,
  use: string,
  e1: number,
  e2: number,
): ModuleDef => {
  const ex = { e1, e2, R1: 2, R2: 2, R3: 2 } as Values;
  const I1 = (e1 * 4 - e2 * 2) / loopDet(ex);
  const I2 = (e2 * 4 - e1 * 2) / loopDet(ex);
  return demo({
    id,
    title,
    use,
    assumptions: [
      'Ideal batteries and wires; I₁ and I₂ are taken up through each battery, I₃ down through R₃.',
      'A negative current flows against its reference: the picture draws each arrow the way it really flows.',
      'Junction rule I₃ = I₁ + I₂; loop rule round each side.',
    ],
    variables: [
      vr('e1', 'ε₁', 'Left battery', 'V', 0, 1000, { step: 0.5 }),
      vr('e2', 'ε₂', 'Right battery', 'V', 0, 1000, { step: 0.5 }),
      ohms('R1', 'R₁', 'Left resistor'),
      ohms('R2', 'R₂', 'Right resistor'),
      ohms('R3', 'R₃', 'Middle resistor'),
      vr('I1', 'I₁', 'Current up through ε₁', 'A', -1e5, 1e5),
      vr('I2', 'I₂', 'Current up through ε₂', 'A', -1e5, 1e5),
      vr('I3', 'I₃', 'Current down through R₃', 'A', -1e5, 1e5),
    ],
    rules: [
      rule(
        'I₁ by Cramer’s rule',
        '{I1} = ({e1} × ({R2} + {R3}) − {e2} × {R3}) ÷ ({R1} × {R2} + {R1} × {R3} + {R2} × {R3})',
        ['I1', 'e1', 'R2', 'R3', 'e2', 'R1'],
        (x) => x.I1! * loopDet(x) - (x.e1! * (x.R2! + x.R3!) - x.e2! * x.R3!),
        {
          I1: [
            (x) => div(x.e1! * (x.R2! + x.R3!) - x.e2! * x.R3!, loopDet(x)),
            '({e1} × ({R2} + {R3}) − {e2} × {R3}) ÷ ({R1} × {R2} + {R1} × {R3} + {R2} × {R3})',
            'The two loop equations in I₁ and I₂, solved by Cramer’s rule.',
          ],
          e1: [
            (x) => div(x.I1! * loopDet(x) + x.e2! * x.R3!, x.R2! + x.R3!),
            '({I1} × ({R1} × {R2} + {R1} × {R3} + {R2} × {R3}) + {e2} × {R3}) ÷ ({R2} + {R3})',
            'Undo Cramer’s rule for ε₁.',
          ],
        },
      ),
      rule(
        'I₂ by Cramer’s rule',
        '{I2} = ({e2} × ({R1} + {R3}) − {e1} × {R3}) ÷ ({R1} × {R2} + {R1} × {R3} + {R2} × {R3})',
        ['I2', 'e2', 'R1', 'R3', 'e1', 'R2'],
        (x) => x.I2! * loopDet(x) - (x.e2! * (x.R1! + x.R3!) - x.e1! * x.R3!),
        {
          I2: [
            (x) => div(x.e2! * (x.R1! + x.R3!) - x.e1! * x.R3!, loopDet(x)),
            '({e2} × ({R1} + {R3}) − {e1} × {R3}) ÷ ({R1} × {R2} + {R1} × {R3} + {R2} × {R3})',
            'Cramer’s rule for the second current.',
          ],
          e2: [
            (x) => div(x.I2! * loopDet(x) + x.e1! * x.R3!, x.R1! + x.R3!),
            '({I2} × ({R1} × {R2} + {R1} × {R3} + {R2} × {R3}) + {e1} × {R3}) ÷ ({R1} + {R3})',
            'Undo Cramer’s rule for ε₂.',
          ],
        },
      ),
      rule('I₃ = I₁ + I₂', '{I3} = {I1} + {I2}', ['I3', 'I1', 'I2'], (x) => x.I3! - x.I1! - x.I2!, {
        I3: [
          (x) => x.I1! + x.I2!,
          '{I1} + {I2}',
          'Junction rule at the top node: both battery currents come down R₃.',
        ],
        I1: [(x) => x.I3! - x.I2!, '{I3} − {I2}', 'Junction rule, less I₂.'],
        I2: [(x) => x.I3! - x.I1!, '{I3} − {I1}', 'Junction rule, less I₁.'],
      }),
      rule(
        'ε₁ = I₁R₁ + I₃R₃',
        '{e1} = {I1} × {R1} + {I3} × {R3}',
        ['e1', 'I1', 'R1', 'I3', 'R3'],
        (x) => x.e1! - x.I1! * x.R1! - x.I3! * x.R3!,
        {
          e1: [
            (x) => x.I1! * x.R1! + x.I3! * x.R3!,
            '{I1} × {R1} + {I3} × {R3}',
            'Loop rule round the left loop: the battery’s rise equals the drops.',
          ],
          R1: [
            (x) => div(x.e1! - x.I3! * x.R3!, x.I1!),
            '({e1} − {I3} × {R3}) ÷ {I1}',
            'What R₃ doesn’t drop, R₁ does.',
          ],
        },
      ),
      rule(
        'ε₂ = I₂R₂ + I₃R₃',
        '{e2} = {I2} × {R2} + {I3} × {R3}',
        ['e2', 'I2', 'R2', 'I3', 'R3'],
        (x) => x.e2! - x.I2! * x.R2! - x.I3! * x.R3!,
        {
          e2: [
            (x) => x.I2! * x.R2! + x.I3! * x.R3!,
            '{I2} × {R2} + {I3} × {R3}',
            'Loop rule round the right loop.',
          ],
          R2: [
            (x) => div(x.e2! - x.I3! * x.R3!, x.I2!),
            '({e2} − {I3} × {R3}) ÷ {I2}',
            'What R₃ doesn’t drop, R₂ does.',
          ],
        },
      ),
    ],
    example: { ...ex, I1, I2, I3: I1 + I2 },
    startWith: ['e1', 'e2', 'R1', 'R2', 'R3'],
    representation: net('circuit', {
      topology: 'twoLoop',
      elements: [
        { id: 'e1', kind: 'V' },
        { id: 'R1', kind: 'R' },
        { id: 'e2', kind: 'V' },
        { id: 'R2', kind: 'R' },
        { id: 'R3', kind: 'R' },
      ],
      branches: ['I1', 'I2', 'I3'],
      loops: true,
    }),
  });
};

const twoLoop = twoLoopModule(
  'g.he-circuit-two-loop',
  'Schematic: two batteries and three branches',
  'Use this for “ε₁ = 12 V and ε₂ = 9 V, each resistor 2 Ω. Find the three branch currents.”',
  12,
  9,
);

const twoLoopBack = twoLoopModule(
  'g.he-circuit-two-loop-reverse',
  'Schematic: a weak battery charged backwards',
  'Use this for “ε₁ = 12 V and ε₂ = 3 V, each resistor 2 Ω. Which way does the current run through ε₂?”',
  12,
  3,
);

// ─── university-2#2~internal-resistance (`circuit`) ───────────────────────────

const internal = demo({
  id: 'g.he-circuit-internal',
  title: 'Schematic: a battery’s internal resistance',
  use: 'Use this for “A 12 V battery with 0.5 Ω inside drives 5.5 Ω. Find the current and the terminal voltage.”',
  assumptions: [
    'The battery is an ideal emf ε in series with its internal resistance r.',
    'The terminal voltage V = ε − Ir is less than ε whenever current flows.',
  ],
  variables: [
    vr('emf', 'ε', 'Emf', 'V', 0, 1000, { step: 0.5 }),
    ohms('r', 'r', 'Internal resistance'),
    ohms('R', 'R', 'Load'),
    vr('I', 'I', 'Current', 'A', 0, 1e5),
    vr('Vt', 'V', 'Terminal voltage', 'V', 0, 1000),
    vr('P', 'P', 'Power in the load', 'W', 0, 1e9),
  ],
  rules: [
    rule(
      'I = ε ÷ (R + r)',
      '{I} = {emf} ÷ ({R} + {r})',
      ['I', 'emf', 'R', 'r'],
      (x) => x.I! * (x.R! + x.r!) - x.emf!,
      {
        I: [
          (x) => div(x.emf!, x.R! + x.r!),
          '{emf} ÷ ({R} + {r})',
          'One loop: the emf over the load and r in series.',
        ],
        emf: [
          (x) => x.I! * (x.R! + x.r!),
          '{I} × ({R} + {r})',
          'The emf drives I through both resistances.',
        ],
        R: [
          (x) => div(x.emf!, x.I!)! - x.r!,
          '{emf} ÷ {I} − {r}',
          'The loop’s resistance, less r.',
        ],
      },
    ),
    rule(
      'V = ε − Ir',
      '{Vt} = {emf} − {I} × {r}',
      ['Vt', 'emf', 'I', 'r'],
      (x) => x.Vt! - x.emf! + x.I! * x.r!,
      {
        Vt: [
          (x) => x.emf! - x.I! * x.r!,
          '{emf} − {I} × {r}',
          'The terminals lose the drop across r.',
        ],
        r: [
          (x) => div(x.emf! - x.Vt!, x.I!),
          '({emf} − {Vt}) ÷ {I}',
          'The lost voltage over the current.',
        ],
      },
    ),
    rule('P = I²R', '{P} = {I}² × {R}', ['P', 'I', 'R'], (x) => x.P! - x.I! ** 2 * x.R!, {
      P: [(x) => x.I! ** 2 * x.R!, '{I}² × {R}', 'Power in the load.'],
    }),
  ],
  example: { emf: 12, r: 0.5, R: 5.5, I: 2, Vt: 11, P: 22 },
  startWith: ['emf', 'r', 'R'],
  representation: net('circuit', {
    topology: 'series',
    elements: [
      { id: 'emf', kind: 'V' },
      { id: 'R', kind: 'R', p: 'P' },
    ],
    internal: { r: 'r', terminal: 'Vt' },
    branches: ['I'],
  }),
});

// ─── bioinstrumentation#0~strain-gauge ────────────────────────────────────────

const bridge = demo({
  id: 'g.he-series-circuit-bridge',
  title: 'Schematic: a quarter bridge with one strain gauge',
  use: 'Use this for “A quarter bridge at 5 V with GF = 2 sees 500 με. What is the output?”',
  assumptions: [
    'One active gauge in a balanced quarter bridge; small strain.',
    'ε in με times V gives μV; ÷ 1000 gives mV, so the 4 becomes 4000.',
  ],
  variables: [
    vr('Vex', 'V_ex', 'Excitation', 'V', 0.1, 100, { step: 0.5 }),
    vr('GF', 'GF', 'Gauge factor', undefined, 1, 5, { step: 0.1 }),
    vr('eps', 'ε', 'Strain', 'με', 1, 1e5, { step: 10 }),
    vr('Vout', 'V_out', 'Output', 'mV', 0, 1e6),
  ],
  rules: [
    rule(
      'V_out = V_ex GF ε ÷ 4',
      '{Vout} = {Vex} × {GF} × {eps} ÷ 4000',
      ['Vout', 'Vex', 'GF', 'eps'],
      (x) => x.Vout! * 4000 - x.Vex! * x.GF! * x.eps!,
      {
        Vout: [
          (x) => (x.Vex! * x.GF! * x.eps!) / 4000,
          '{Vex} × {GF} × {eps} ÷ 4000',
          'The gauge changes by GF × ε; a quarter bridge passes a quarter of that times V_ex.',
        ],
        eps: [
          (x) => div(x.Vout! * 4000, x.Vex! * x.GF!),
          '{Vout} × 4000 ÷ ({Vex} × {GF})',
          'Read the strain back from the output.',
        ],
        Vex: [
          (x) => div(x.Vout! * 4000, x.GF! * x.eps!),
          '{Vout} × 4000 ÷ ({GF} × {eps})',
          'The excitation that gives this output.',
        ],
        GF: [
          (x) => div(x.Vout! * 4000, x.Vex! * x.eps!),
          '{Vout} × 4000 ÷ ({Vex} × {eps})',
          'The gauge factor from the output.',
        ],
      },
    ),
  ],
  example: { Vex: 5, GF: 2, eps: 500, Vout: 1.25 },
  startWith: ['Vex', 'GF', 'eps'],
  representation: net('seriesCircuit', {
    topology: 'bridge',
    elements: [
      { id: 'Vex', kind: 'V' },
      { kind: 'R', name: 'R' },
      { kind: 'R', name: 'R' },
      { kind: 'R', name: 'R' },
      { kind: 'R', name: 'R + ΔR' },
    ],
    bridge: { factor: 'GF', strain: 'eps', out: 'Vout' },
  }),
});

// ─── bioinstrumentation#3: an RC low-pass ─────────────────────────────────────

const fc0 = 1000 / (2 * Math.PI);
const gain0 = 1 / Math.sqrt(1 + (500 / fc0) ** 2);
const lowpass = demo({
  id: 'g.he-series-circuit-lowpass',
  title: 'Schematic: an RC low-pass filter',
  use: 'Use this for “An RC low-pass has 10 kΩ and 0.1 μF. Find its cutoff and its gain at 500 Hz.”',
  assumptions: [
    'A first-order RC filter, the output taken across C with no load.',
    'R in kΩ and C in μF: RC is in ms, so f_c = 1000 ÷ (2πRC) Hz.',
  ],
  variables: [
    ohms('R', 'R', 'Resistance', 'kΩ'),
    vr('C', 'C', 'Capacitance', 'μF', 1e-6, 1e6, { step: 0.01 }),
    vr('fc', 'f_c', 'Cutoff frequency', 'Hz', 1e-6, 1e12),
    vr('f', 'f', 'Frequency', 'Hz', 0.001, 1e9, { step: 10 }),
    vr('H', '|H|', 'Gain', undefined, 0, 1, { scientific: true }),
    vr('dB', 'G', 'Gain in decibels', 'dB', -1000, 0),
  ],
  rules: [
    rule(
      'f_c = 1 ÷ (2πRC)',
      '{fc} = 1000 ÷ (2π × {R} × {C})',
      ['fc', 'R', 'C'],
      (x) => x.fc! * 2 * Math.PI * x.R! * x.C! - 1000,
      {
        fc: [
          (x) => div(1000, 2 * Math.PI * x.R! * x.C!),
          '1000 ÷ (2π × {R} × {C})',
          'The cutoff, where the gain is 1/√2: kΩ × μF is ms, so 1000 turns it into Hz.',
        ],
        C: [
          (x) => div(1000, 2 * Math.PI * x.R! * x.fc!),
          '1000 ÷ (2π × {R} × {fc})',
          'The capacitor that sets this cutoff.',
        ],
      },
    ),
    rule(
      '|H| = 1 ÷ √(1 + (f ÷ f_c)²)',
      '{H} = 1 ÷ √(1 + ({f} ÷ {fc})²)',
      ['H', 'f', 'fc'],
      (x) => x.H! - 1 / Math.sqrt(1 + (x.f! / x.fc!) ** 2),
      {
        H: [
          (x) => 1 / Math.sqrt(1 + (x.f! / x.fc!) ** 2),
          '1 ÷ √(1 + ({f} ÷ {fc})²)',
          'The divider of R and C’s reactance: well under 1 above f_c.',
        ],
      },
    ),
    rule(
      'G = 20 log₁₀|H|',
      '{dB} = 20 × log₁₀({H})',
      ['dB', 'H'],
      (x) => x.dB! - 20 * Math.log10(x.H!),
      {
        dB: [
          (x) => (x.H! > 0 ? 20 * Math.log10(x.H!) : undefined),
          '20 × log₁₀({H})',
          'The gain in decibels.',
        ],
        H: [(x) => 10 ** (x.dB! / 20), '10^({dB} ÷ 20)', 'Undo the decibels.'],
      },
    ),
  ],
  example: { R: 10, C: 0.1, fc: fc0, f: 500, H: gain0, dB: 20 * Math.log10(gain0) },
  startWith: ['R', 'C', 'f'],
  representation: net('seriesCircuit', {
    topology: 'lowpass',
    elements: [
      { kind: 'V', name: 'vᵢₙ' },
      { id: 'R', kind: 'R' },
      { id: 'C', kind: 'C' },
    ],
    filter: { cutoff: 'fc', frequency: 'f', gain: 'H', db: 'dB' },
  }),
});

export const HE1H_GALLERY_MODULES: ModuleDef[] = [
  parallel,
  powerSign,
  twoNode,
  twoMesh,
  supernode,
  thevenin,
  norton,
  maxPower,
  superposition,
  rc,
  rl,
  rlc,
  capacitors,
  twoLoop,
  twoLoopBack,
  internal,
  bridge,
  lowpass,
];

export const HE1H_GALLERY_LAYOUTS: LayoutDef[] = [];

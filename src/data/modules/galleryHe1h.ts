/**
 * College gallery demos, round 1, group H (docs/RENDERINGS_HE.md). Each stands in for the
 * college page that waits, built from the plan's worked example. Spread into gallery.ts.
 *
 * HC11: the oscillator's damping, start phase, forcing, transmissibility, coupled masses and
 * springs, one demo per option from the math, physics, vibrations and controls plans, and one
 * close to resonance.
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

// ─── HC11: the oscillator's college options ───────────────────────────────────

/** A variable shown in its own unit only (no unit menu): the oscillator steps mix units. */
const vu = (...a: Parameters<typeof vr>): VariableDef => {
  const v = vr(...a);
  return v.unit ? { ...v, units: [v.unit] } : v;
};

const dampedX = (x: Values) => {
  const [a, b] = [x.alpha!, x.beta!];
  return Math.exp(a * x.t!) * x.x0! * (Math.cos(b * x.t!) - (a / b) * Math.sin(b * x.t!));
};

const damped = demo({
  id: 'g.he-oscillator-damped',
  title: 'Oscillator: a damped mass on a spring, my″ + cy′ + ky = 0',
  use: 'Use this for “A 1 kg mass on a 10 N/m spring with damping 2 N·s/m is pulled 1 m and let go from rest. Where is it after 1 s?”',
  assumptions: [
    'A linear spring and damper: my″ + cy′ + ky = 0, with roots α ± βi when c² < 4mk.',
    'c² < 4mk oscillates; c² = 4mk is critical; c² > 4mk creeps back without swinging.',
    'Let go from rest (v₀ = 0): y = e^(αt)(C₁ cos βt + C₂ sin βt) with C₁ = y₀ and C₂ = −αy₀/β; angles in radians.',
  ],
  variables: [
    vu('m', 'm', 'Mass', 'kg', 0.1, 100, { step: 0.1 }),
    vu('c', 'c', 'Damping constant', 'N·s/m', 0, 100, { step: 0.1 }),
    vu('k', 'k', 'Spring constant', 'N/m', 1, 1e4, { step: 1 }),
    vu('x0', 'y₀', 'Start position', 'm', -10, 10, { step: 0.1 }),
    vu('alpha', 'α', 'Decay rate (real part)', '1/s', -500, 0, { derived: true }),
    vu('beta', 'β', 'Damped frequency (imaginary part)', 'rad/s', 1e-6, 1000, { derived: true }),
    vu('t', 't', 'Time', 's', 0, 60, { step: 0.1 }),
    vu('x', 'y(t)', 'Position at t', 'm', -10, 10, { derived: true }),
  ],
  rules: [
    rule(
      'α = −c ÷ (2m)',
      '{alpha} = −{c} ÷ (2 × {m})',
      ['alpha', 'c', 'm'],
      (x) => x.alpha! * 2 * x.m! + x.c!,
      {
        alpha: [
          (x) => div(-x.c!, 2 * x.m!),
          '−{c} ÷ (2 × {m})',
          'The real part of the roots of mr² + cr + k = 0.',
        ],
        c: [(x) => -2 * x.m! * x.alpha!, '−2 × {m} × {alpha}', 'Undo α = −c ÷ (2m).'],
      },
    ),
    rule(
      'β = √(4mk − c²) ÷ (2m)',
      '{beta} = √(4 × {m} × {k} − {c}²) ÷ (2 × {m})',
      ['beta', 'm', 'k', 'c'],
      (x) => (2 * x.m! * x.beta!) ** 2 - (4 * x.m! * x.k! - x.c! ** 2),
      {
        beta: [
          (x) =>
            4 * x.m! * x.k! > x.c! ** 2
              ? Math.sqrt(4 * x.m! * x.k! - x.c! ** 2) / (2 * x.m!)
              : undefined,
          '√(4 × {m} × {k} − {c}²) ÷ (2 × {m})',
          'The imaginary part of the roots: the ringing frequency (only when c² < 4mk).',
        ],
        k: [
          (x) => ((2 * x.m! * x.beta!) ** 2 + x.c! ** 2) / (4 * x.m!),
          '((2 × {m} × {beta})² + {c}²) ÷ (4 × {m})',
          'Square both sides and solve for k.',
        ],
      },
    ),
    rule(
      'y = e^(αt)(C₁ cos βt + C₂ sin βt)',
      '{x} = e^({alpha} × {t}) × {x0} × (cos({beta} × {t}) − {alpha} ÷ {beta} × sin({beta} × {t}))',
      ['x', 'alpha', 't', 'x0', 'beta'],
      (x) => x.x! - dampedX(x),
      {
        x: [
          dampedX,
          'e^({alpha} × {t}) × {x0} × (cos({beta} × {t}) − {alpha} ÷ {beta} × sin({beta} × {t}))',
          'C₁ = y₀ and C₂ = −αy₀/β fit a start from rest; the swing shrinks by e^(αt).',
        ],
      },
    ),
  ],
  example: (() => {
    const ex: Values = { m: 1, c: 2, k: 10, x0: 1, alpha: -1, beta: 3, t: 1 };
    return { ...ex, x: dampedX(ex) };
  })(),
  startWith: ['m', 'c', 'k', 'x0', 't'],
  representation: {
    kind: 'oscillator',
    mass: 'm',
    spring: 'k',
    amplitude: 1,
    damping: { c: 'c', x0: 'x0', t: 't', x: 'x' },
  },
});

const phaseOmega = 10;
const phasePhi = -Math.atan(0.4 / (phaseOmega * 0.03));
const phaseA = Math.hypot(0.03, 0.4 / phaseOmega);
const phase = demo({
  id: 'g.he-oscillator-phase',
  title: 'Oscillator: simple harmonic motion from x₀ and v₀',
  use: 'Use this for “A 0.5 kg mass on a 50 N/m spring starts at 0.03 m moving at 0.4 m/s. Find A, φ and x at 0.2 s.”',
  assumptions: [
    'No friction: x(t) = A cos(ωt + φ) solves mẍ = −kx.',
    'φ is in radians; with x₀ > 0, φ = −arctan(v₀ ÷ (ωx₀)).',
  ],
  variables: [
    vu('m', 'm', 'Mass', 'kg', 0.01, 100, { step: 0.1 }),
    vu('k', 'k', 'Spring constant', 'N/m', 0.1, 1e4, { step: 1 }),
    vu('w', 'ω', 'Angular frequency', 'rad/s', 0.01, 1000, { derived: true }),
    vu('x0', 'x₀', 'Start position', 'm', 0.001, 10, { step: 0.01 }),
    vu('v0', 'v₀', 'Start velocity', 'm/s', -100, 100, { step: 0.1 }),
    vu('A', 'A', 'Amplitude', 'm', 0.001, 1e4, { derived: true }),
    vu('phi', 'φ', 'Phase', 'rad', -Math.PI, Math.PI, { derived: true }),
    vu('t', 't', 'Time', 's', 0, 60, { step: 0.1 }),
    vu('x', 'x', 'Position at t', 'm', -1e4, 1e4, { derived: true }),
  ],
  rules: [
    rule('ω = √(k ÷ m)', '{w} = √({k} ÷ {m})', ['w', 'k', 'm'], (x) => x.w! ** 2 * x.m! - x.k!, {
      w: [(x) => Math.sqrt(x.k! / x.m!), '√({k} ÷ {m})', 'The natural angular frequency.'],
      k: [(x) => x.w! ** 2 * x.m!, '{w}² × {m}', 'Square ω and multiply by m.'],
      m: [(x) => div(x.k!, x.w! ** 2), '{k} ÷ {w}²', 'Divide k by ω².'],
    }),
    rule(
      'A = √(x₀² + (v₀/ω)²)',
      '{A} = √({x0}² + ({v0} ÷ {w})²)',
      ['A', 'x0', 'v0', 'w'],
      (x) => x.A! ** 2 - x.x0! ** 2 - (x.v0! / x.w!) ** 2,
      {
        A: [
          (x) => Math.hypot(x.x0!, x.v0! / x.w!),
          '√({x0}² + ({v0} ÷ {w})²)',
          'The start position and the start velocity (over ω) are the legs; A is the hypotenuse.',
        ],
      },
    ),
    rule(
      'φ = −arctan(v₀ ÷ (ωx₀))',
      '{phi} = −arctan({v0} ÷ ({w} × {x0}))',
      ['phi', 'v0', 'w', 'x0'],
      (x) => Math.tan(-x.phi!) * x.w! * x.x0! - x.v0!,
      {
        phi: [
          (x) => -Math.atan(x.v0! / (x.w! * x.x0!)),
          '−arctan({v0} ÷ ({w} × {x0}))',
          'x(0) = A cos φ and v(0) = −Aω sin φ: their ratio gives tan φ.',
        ],
        v0: [
          (x) => -Math.tan(x.phi!) * x.w! * x.x0!,
          '−tan({phi}) × {w} × {x0}',
          'The start velocity from the phase.',
        ],
      },
    ),
    rule(
      'x = A cos(ωt + φ)',
      '{x} = {A} × cos({w} × {t} + {phi})',
      ['x', 'A', 'w', 't', 'phi'],
      (x) => x.x! - x.A! * Math.cos(x.w! * x.t! + x.phi!),
      {
        x: [
          (x) => x.A! * Math.cos(x.w! * x.t! + x.phi!),
          '{A} × cos({w} × {t} + {phi})',
          'The position at time t, angle in radians.',
        ],
      },
    ),
  ],
  example: {
    m: 0.5,
    k: 50,
    w: phaseOmega,
    x0: 0.03,
    v0: 0.4,
    A: phaseA,
    phi: phasePhi,
    t: 0.2,
    x: phaseA * Math.cos(2 + phasePhi),
  },
  startWith: ['m', 'k', 'x0', 'v0', 't'],
  representation: {
    kind: 'oscillator',
    mass: 'm',
    spring: 'k',
    amplitude: 'A',
    phase: { x0: 'x0', v0: 'v0', amplitude: 'A', phase: 'phi', omega: 'w', t: 't', x: 'x' },
  },
});

const envelope = demo({
  id: 'g.he-oscillator-envelope',
  title: 'Oscillator: light damping, the amplitude decaying',
  use: 'Use this for “A 0.5 kg mass on 50 N/m has damping b = 0.4 kg/s. Find ω′, Q and the amplitude after 5 s from 0.05 m.”',
  assumptions: [
    'Underdamped only: b < 2√(mk); at the limit the motion is critically damped.',
    'The amplitude decays as A₀e^(−bt/2m); ω′ = √(k/m − (b/2m)²).',
  ],
  variables: [
    vu('m', 'm', 'Mass', 'kg', 0.01, 100, { step: 0.1 }),
    vu('k', 'k', 'Spring constant', 'N/m', 0.1, 1e4, { step: 1 }),
    vu('b', 'b', 'Damping constant', 'kg/s', 0.001, 100, { step: 0.1 }),
    vu('wp', 'ω′', 'Damped angular frequency', 'rad/s', 0.001, 1000, { derived: true }),
    vu('Q', 'Q', 'Quality factor', undefined, 0.5, 1e5, { derived: true }),
    vu('A0', 'A₀', 'Start amplitude', 'm', 0.001, 10, { step: 0.01 }),
    vu('t', 't', 'Time', 's', 0, 600, { step: 0.5 }),
    vu('A', 'A', 'Amplitude at t', 'm', 0, 10, { derived: true }),
  ],
  rules: [
    rule(
      'ω′ = √(k/m − (b/2m)²)',
      '{wp} = √({k} ÷ {m} − ({b} ÷ (2 × {m}))²)',
      ['wp', 'k', 'm', 'b'],
      (x) => x.wp! ** 2 - (x.k! / x.m! - (x.b! / (2 * x.m!)) ** 2),
      {
        wp: [
          (x) =>
            x.k! / x.m! > (x.b! / (2 * x.m!)) ** 2
              ? Math.sqrt(x.k! / x.m! - (x.b! / (2 * x.m!)) ** 2)
              : undefined,
          '√({k} ÷ {m} − ({b} ÷ (2 × {m}))²)',
          'Damping slows the swing a little below √(k/m).',
        ],
      },
    ),
    rule(
      'Q = √(mk) ÷ b',
      '{Q} = √({m} × {k}) ÷ {b}',
      ['Q', 'm', 'k', 'b'],
      (x) => x.Q! * x.b! - Math.sqrt(x.m! * x.k!),
      {
        Q: [
          (x) => div(Math.sqrt(x.m! * x.k!), x.b!),
          '√({m} × {k}) ÷ {b}',
          'Q = mω₀ ÷ b: about how many radians it rings before fading.',
        ],
        b: [
          (x) => div(Math.sqrt(x.m! * x.k!), x.Q!),
          '√({m} × {k}) ÷ {Q}',
          'The damping that gives this Q.',
        ],
      },
    ),
    rule(
      'A = A₀e^(−bt/2m)',
      '{A} = {A0} × e^(−{b} × {t} ÷ (2 × {m}))',
      ['A', 'A0', 'b', 't', 'm'],
      (x) => x.A! - x.A0! * Math.exp((-x.b! * x.t!) / (2 * x.m!)),
      {
        A: [
          (x) => x.A0! * Math.exp((-x.b! * x.t!) / (2 * x.m!)),
          '{A0} × e^(−{b} × {t} ÷ (2 × {m}))',
          'The envelope: the amplitude shrinks by e every 2m/b seconds.',
        ],
        A0: [
          (x) => x.A! / Math.exp((-x.b! * x.t!) / (2 * x.m!)),
          '{A} ÷ e^(−{b} × {t} ÷ (2 × {m}))',
          'Undo the decay.',
        ],
      },
    ),
  ],
  example: {
    m: 0.5,
    k: 50,
    b: 0.4,
    wp: Math.sqrt(100 - 0.16),
    Q: 12.5,
    A0: 0.05,
    t: 5,
    A: 0.05 * Math.exp(-2),
  },
  startWith: ['m', 'k', 'b', 'A0', 't'],
  representation: {
    kind: 'oscillator',
    mass: 'm',
    spring: 'k',
    amplitude: 'A0',
    damping: { c: 'b', letter: 'b', x0: 'A0', damped: 'wp' },
  },
});

const massSpring = demo({
  id: 'g.he-oscillator-mass-spring',
  title: 'Oscillator: a mass, spring and damper as a second-order system',
  use: 'Use this for “Find ωₙ, ζ and the DC gain of G(s) = 1 ÷ (2s² + 8s + 50).”',
  assumptions: [
    'G(s) = 1 ÷ (ms² + bs + k) from force to position.',
    'ωₙ = √(k/m), ζ = b ÷ (2√(km)); the DC gain is 1/k.',
  ],
  variables: [
    vu('m', 'm', 'Mass', 'kg', 0.01, 1000, { step: 0.1 }),
    vu('b', 'b', 'Damping', 'N·s/m', 0, 1e4, { step: 0.5 }),
    vu('k', 'k', 'Spring constant', 'N/m', 0.1, 1e6, { step: 1 }),
    vu('wn', 'ωₙ', 'Natural frequency', 'rad/s', 1e-6, 1e6),
    vu('zeta', 'ζ', 'Damping ratio', undefined, 0, 100),
    vu('K', 'K', 'DC gain', 'm/N', 1e-9, 10),
  ],
  rules: [
    rule(
      'ωₙ = √(k ÷ m)',
      '{wn} = √({k} ÷ {m})',
      ['wn', 'k', 'm'],
      (x) => x.wn! ** 2 * x.m! - x.k!,
      {
        wn: [(x) => Math.sqrt(x.k! / x.m!), '√({k} ÷ {m})', 'The natural frequency of ms² + k.'],
        k: [(x) => x.wn! ** 2 * x.m!, '{wn}² × {m}', 'Square ωₙ, times m.'],
      },
    ),
    rule(
      'ζ = b ÷ (2√(km))',
      '{zeta} = {b} ÷ (2 × √({k} × {m}))',
      ['zeta', 'b', 'k', 'm'],
      (x) => x.zeta! * 2 * Math.sqrt(x.k! * x.m!) - x.b!,
      {
        zeta: [
          (x) => div(x.b!, 2 * Math.sqrt(x.k! * x.m!)),
          '{b} ÷ (2 × √({k} × {m}))',
          'Match ms² + bs + k to m(s² + 2ζωₙs + ωₙ²).',
        ],
        b: [
          (x) => x.zeta! * 2 * Math.sqrt(x.k! * x.m!),
          '{zeta} × 2 × √({k} × {m})',
          'The damping for this ζ.',
        ],
      },
    ),
    rule('K = 1 ÷ k', '{K} = 1 ÷ {k}', ['K', 'k'], (x) => x.K! * x.k! - 1, {
      K: [(x) => div(1, x.k!), '1 ÷ {k}', 'At s = 0 only the spring holds the force: G(0) = 1/k.'],
      k: [(x) => div(1, x.K!), '1 ÷ {K}', 'The spring from the DC gain.'],
    }),
  ],
  example: { m: 2, b: 8, k: 50, wn: 5, zeta: 0.4, K: 0.02 },
  startWith: ['m', 'b', 'k'],
  representation: {
    kind: 'oscillator',
    mass: 'm',
    spring: 'k',
    amplitude: 0.02,
    damping: { c: 'b', letter: 'b', natural: 'wn', zeta: 'zeta' },
  },
});

const ratio = demo({
  id: 'g.he-oscillator-damping-ratio',
  title: 'Oscillator: critical damping, ζ and ω_d',
  use: 'Use this for “2 kg on 800 N/m with c = 16 N·s/m: find c_cr, ζ and ω_d.”',
  assumptions: [
    'c_cr = 2√(km) is the damping that just stops the swing.',
    'ζ < 1: ω_d = ωₙ√(1 − ζ²); the page names the over- and critically damped cases.',
  ],
  variables: [
    vu('m', 'm', 'Mass', 'kg', 0.001, 1000, { step: 0.1 }),
    vu('k', 'k', 'Spring constant', 'N/m', 0.1, 1e6, { step: 10 }),
    vu('c', 'c', 'Damping constant', 'N·s/m', 0, 1e5, { step: 1 }),
    vu('cc', 'c_cr', 'Critical damping', 'N·s/m', 1e-6, 1e6),
    vu('zeta', 'ζ', 'Damping ratio', undefined, 0, 100),
    vu('wn', 'ωₙ', 'Natural frequency', 'rad/s', 1e-6, 1e6),
    vu('wd', 'ω_d', 'Damped frequency', 'rad/s', 0, 1e6),
  ],
  rules: [
    rule(
      'c_cr = 2√(km)',
      '{cc} = 2 × √({k} × {m})',
      ['cc', 'k', 'm'],
      (x) => x.cc! - 2 * Math.sqrt(x.k! * x.m!),
      {
        cc: [(x) => 2 * Math.sqrt(x.k! * x.m!), '2 × √({k} × {m})', 'The damping where c² = 4km.'],
      },
    ),
    rule(
      'ζ = c ÷ c_cr',
      '{zeta} = {c} ÷ {cc}',
      ['zeta', 'c', 'cc'],
      (x) => x.zeta! * x.cc! - x.c!,
      {
        zeta: [(x) => div(x.c!, x.cc!), '{c} ÷ {cc}', 'The damping as a fraction of critical.'],
        c: [(x) => x.zeta! * x.cc!, '{zeta} × {cc}', 'Multiply back by c_cr.'],
      },
    ),
    rule(
      'ωₙ = √(k ÷ m)',
      '{wn} = √({k} ÷ {m})',
      ['wn', 'k', 'm'],
      (x) => x.wn! ** 2 * x.m! - x.k!,
      {
        wn: [(x) => Math.sqrt(x.k! / x.m!), '√({k} ÷ {m})', 'The undamped natural frequency.'],
      },
    ),
    rule(
      'ω_d = ωₙ√(1 − ζ²)',
      '{wd} = {wn} × √(1 − {zeta}²)',
      ['wd', 'wn', 'zeta'],
      (x) => x.wd! ** 2 - x.wn! ** 2 * (1 - x.zeta! ** 2),
      {
        wd: [
          (x) => (x.zeta! < 1 ? x.wn! * Math.sqrt(1 - x.zeta! ** 2) : undefined),
          '{wn} × √(1 − {zeta}²)',
          'Damping slows the swing: ω_d < ωₙ.',
        ],
      },
    ),
  ],
  example: { m: 2, k: 800, c: 16, cc: 80, zeta: 0.2, wn: 20, wd: 20 * Math.sqrt(0.96) },
  startWith: ['m', 'k', 'c'],
  representation: {
    kind: 'oscillator',
    mass: 'm',
    spring: 'k',
    amplitude: 0.01,
    damping: { c: 'c', critical: 'cc', zeta: 'zeta', natural: 'wn', damped: 'wd' },
  },
});

const logDelta = Math.log(5) / 5;
const logZeta = logDelta / Math.sqrt(4 * Math.PI ** 2 + logDelta ** 2);
const logDec = demo({
  id: 'g.he-oscillator-log-dec',
  title: 'Oscillator: the logarithmic decrement from two crests',
  use: 'Use this for “The swing falls from 10 mm to 2 mm in 5 cycles. Find δ and ζ.”',
  assumptions: [
    'Viscous damping: each crest is e^(−δ) of the one before.',
    'Drawn on 1 kg and 100 N/m (c_cr = 20 N·s/m), so c = 20ζ.',
  ],
  variables: [
    vu('x0', 'x₀', 'First crest', 'mm', 0.01, 1000, { step: 0.5 }),
    vu('xn', 'xₙ', 'Crest n cycles later', 'mm', 0.001, 1000, { step: 0.5 }),
    vu('n', 'n', 'Cycles between them', undefined, 1, 50, { integer: true }),
    vu('delta', 'δ', 'Logarithmic decrement', undefined, 0.0001, 5),
    vu('zeta', 'ζ', 'Damping ratio', undefined, 0.00001, 0.7),
    vu('c', 'c', 'Damping constant (drawn)', 'N·s/m', 0.0002, 14, { derived: true }),
  ],
  rules: [
    rule(
      'δ = (1/n) ln(x₀ ÷ xₙ)',
      '{delta} = ln({x0} ÷ {xn}) ÷ {n}',
      ['delta', 'x0', 'xn', 'n'],
      (x) => x.delta! * x.n! - Math.log(x.x0! / x.xn!),
      {
        delta: [
          (x) => (x.xn! > 0 ? Math.log(x.x0! / x.xn!) / x.n! : undefined),
          'ln({x0} ÷ {xn}) ÷ {n}',
          'n cycles shrink the crest by e^(−nδ).',
        ],
        xn: [
          (x) => x.x0! * Math.exp(-x.n! * x.delta!),
          '{x0} × e^(−{n} × {delta})',
          'The crest after n cycles.',
        ],
      },
    ),
    rule(
      'ζ = δ ÷ √(4 × π² + δ²)',
      '{zeta} = {delta} ÷ √(4 × π² + {delta}²)',
      ['zeta', 'delta'],
      (x) => x.zeta! - x.delta! / Math.sqrt(4 * Math.PI ** 2 + x.delta! ** 2),
      {
        zeta: [
          (x) => x.delta! / Math.sqrt(4 * Math.PI ** 2 + x.delta! ** 2),
          '{delta} ÷ √(4 × π² + {delta}²)',
          'From δ = 2πζ ÷ √(1 − ζ²), solved for ζ.',
        ],
        delta: [
          (x) => (x.zeta! < 1 ? (2 * Math.PI * x.zeta!) / Math.sqrt(1 - x.zeta! ** 2) : undefined),
          '2π × {zeta} ÷ √(1 − {zeta}²)',
          'The decrement a damping ratio gives.',
        ],
      },
    ),
    rule('c = 20ζ', '{c} = 20 × {zeta}', ['c', 'zeta'], (x) => x.c! - 20 * x.zeta!, {
      c: [(x) => 20 * x.zeta!, '20 × {zeta}', 'The damping drawn: ζ times c_cr = 20 N·s/m.'],
      zeta: [(x) => x.c! / 20, '{c} ÷ 20', 'The damping as a fraction of 20 N·s/m.'],
    }),
  ],
  example: { x0: 10, xn: 2, n: 5, delta: logDelta, zeta: logZeta, c: 20 * logZeta },
  startWith: ['x0', 'xn', 'n'],
  representation: {
    kind: 'oscillator',
    mass: 1,
    spring: 100,
    amplitude: 'x0',
    damping: { c: 'c', x0: 'x0', cycles: 'n', end: 'xn', decrement: 'delta', zeta: 'zeta' },
  },
});

const forcedModule = (id: string, title: string, use: string, ex: Values): ModuleDef => {
  const wn = Math.sqrt(ex.k! / ex.m!);
  const r = ex.w! / wn;
  const fr = 1 / Math.sqrt((1 - r * r) ** 2 + (2 * ex.zeta! * r) ** 2);
  const mag = (x: Values) => 1 / Math.sqrt((1 - x.r! ** 2) ** 2 + (2 * x.zeta! * x.r!) ** 2);
  return demo({
    id,
    title,
    use,
    assumptions: [
      'Steady state under F₀ sin ωt; the start-up motion has died away.',
      'X = (F₀ ÷ k) ÷ √((1 − r²)² + (2ζr)²), tan φ = 2ζr ÷ (1 − r²), φ in radians.',
    ],
    variables: [
      vu('m', 'm', 'Mass', 'kg', 0.01, 1e4, { step: 0.5 }),
      vu('k', 'k', 'Spring constant', 'N/m', 1, 1e7, { step: 100 }),
      vu('wn', 'ωₙ', 'Natural frequency', 'rad/s', 0.01, 1e4),
      vu('w', 'ω', 'Driving frequency', 'rad/s', 0.01, 1e4, { step: 0.5 }),
      vu('r', 'r', 'Frequency ratio', undefined, 0.001, 20),
      vu('zeta', 'ζ', 'Damping ratio', undefined, 0.001, 5, { step: 0.01 }),
      vu('F0', 'F₀', 'Force amplitude', 'N', 1e-6, 1e8, { step: 10 }),
      vu('X', 'X', 'Steady amplitude', 'm', 0, 1e6),
      vu('phi', 'φ', 'Phase lag', 'rad', 0, Math.PI),
    ],
    rules: [
      rule(
        'ωₙ = √(k ÷ m)',
        '{wn} = √({k} ÷ {m})',
        ['wn', 'k', 'm'],
        (x) => x.wn! ** 2 * x.m! - x.k!,
        {
          wn: [(x) => Math.sqrt(x.k! / x.m!), '√({k} ÷ {m})', 'The natural frequency.'],
          k: [(x) => x.wn! ** 2 * x.m!, '{wn}² × {m}', 'Square ωₙ, times m.'],
        },
      ),
      rule('r = ω ÷ ωₙ', '{r} = {w} ÷ {wn}', ['r', 'w', 'wn'], (x) => x.r! * x.wn! - x.w!, {
        r: [
          (x) => div(x.w!, x.wn!),
          '{w} ÷ {wn}',
          'How fast it is driven, against how fast it rings.',
        ],
        w: [(x) => x.r! * x.wn!, '{r} × {wn}', 'The driving frequency from r.'],
      }),
      rule(
        'X = (F₀/k) ÷ √((1 − r²)² + (2ζr)²)',
        '{X} = {F0} ÷ {k} ÷ √((1 − {r}²)² + (2 × {zeta} × {r})²)',
        ['X', 'F0', 'k', 'r', 'zeta'],
        (x) => x.X! - (x.F0! / x.k!) * mag(x),
        {
          X: [
            (x) => (x.F0! / x.k!) * mag(x),
            '{F0} ÷ {k} ÷ √((1 − {r}²)² + (2 × {zeta} × {r})²)',
            'The static stretch F₀/k times the magnification at r.',
          ],
          F0: [
            (x) => (x.X! * x.k!) / mag(x),
            '{X} × {k} × √((1 − {r}²)² + (2 × {zeta} × {r})²)',
            'The force that gives this amplitude.',
          ],
        },
      ),
      rule(
        'tan φ = 2ζr ÷ (1 − r²)',
        '{phi} = arccos((1 − {r}²) ÷ √((1 − {r}²)² + (2 × {zeta} × {r})²))',
        ['phi', 'zeta', 'r'],
        (x) => x.phi! - Math.atan2(2 * x.zeta! * x.r!, 1 - x.r! ** 2),
        {
          phi: [
            (x) => Math.atan2(2 * x.zeta! * x.r!, 1 - x.r! ** 2),
            'arccos((1 − {r}²) ÷ √((1 − {r}²)² + (2 × {zeta} × {r})²))',
            'The response lags the force: little below r = 1, 90° at it, nearly 180° above.',
          ],
        },
      ),
    ],
    example: {
      ...ex,
      wn,
      r,
      X: (ex.F0! / ex.k!) * fr,
      phi: Math.atan2(2 * ex.zeta! * r, 1 - r * r),
    },
    startWith: ['m', 'k', 'w', 'zeta', 'F0'],
    representation: {
      kind: 'oscillator',
      mass: 'm',
      spring: 'k',
      amplitude: 'X',
      forcing: { force: 'F0', omega: 'w', zeta: 'zeta', ratio: 'r', response: 'X', lag: 'phi' },
    },
  });
};

const forcedDemo = forcedModule(
  'g.he-oscillator-forced',
  'Oscillator: forced vibration and the response curve',
  'Use this for “10 kg on 4000 N/m with ζ = 0.1 is driven by 100 N at 15 rad/s. Find the amplitude and the lag.”',
  { m: 10, k: 4000, w: 15, zeta: 0.1, F0: 100 },
);

const resonance = forcedModule(
  'g.he-oscillator-resonance',
  'Oscillator: driven close to resonance',
  'Use this for “1 kg on 100 N/m with ζ = 0.05 is driven by 10 N at 9.8 rad/s. How big is the swing?”',
  { m: 1, k: 100, w: 9.8, zeta: 0.05, F0: 10 },
);

const trOf = (x: Values) =>
  Math.sqrt(1 + (2 * x.zeta! * x.r!) ** 2) /
  Math.sqrt((1 - x.r! ** 2) ** 2 + (2 * x.zeta! * x.r!) ** 2);
const transmit = demo({
  id: 'g.he-oscillator-transmit',
  title: 'Oscillator: transmissibility and isolation',
  use: 'Use this for “A mount runs at r = 3 with ζ = 0.05. What fraction of the force gets through?”',
  assumptions: [
    'Force (or base motion) transmitted through spring and damper in steady state.',
    'TR < 1 only above r = √2: below it the mount makes things worse.',
  ],
  variables: [
    vu('r', 'r', 'Frequency ratio', undefined, 0.01, 20, { step: 0.1 }),
    vu('zeta', 'ζ', 'Damping ratio', undefined, 0.001, 5, { step: 0.01 }),
    vu('TR', 'TR', 'Transmissibility', undefined, 0, 1e4),
    vu('iso', 'I', 'Isolation', '%', -1e6, 100),
  ],
  rules: [
    rule(
      'TR = √(1 + (2ζr)²) ÷ √((1 − r²)² + (2ζr)²)',
      '{TR} = √(1 + (2 × {zeta} × {r})²) ÷ √((1 − {r}²)² + (2 × {zeta} × {r})²)',
      ['TR', 'zeta', 'r'],
      (x) => x.TR! - trOf(x),
      {
        TR: [
          trOf,
          '√(1 + (2 × {zeta} × {r})²) ÷ √((1 − {r}²)² + (2 × {zeta} × {r})²)',
          'The force through the mount over the force applied.',
        ],
      },
    ),
    rule(
      'I = 100(1 − TR)',
      '{iso} = 100 × (1 − {TR})',
      ['iso', 'TR'],
      (x) => x.iso! - 100 * (1 - x.TR!),
      {
        iso: [
          (x) => 100 * (1 - x.TR!),
          '100 × (1 − {TR})',
          'The share of the force kept out, as a percent.',
        ],
        TR: [(x) => 1 - x.iso! / 100, '1 − {iso} ÷ 100', 'The share that gets through.'],
      },
    ),
  ],
  example: (() => {
    const ex: Values = { r: 3, zeta: 0.05 };
    const TR = trOf(ex);
    return { ...ex, TR, iso: 100 * (1 - TR) };
  })(),
  startWith: ['r', 'zeta'],
  representation: {
    kind: 'oscillator',
    mass: 1,
    spring: 1,
    amplitude: 1,
    transmit: { ratio: 'r', zeta: 'zeta', value: 'TR' },
  },
});

const coupled = demo({
  id: 'g.he-oscillator-coupled',
  title: 'Oscillator: two equal masses, three springs',
  use: 'Use this for “Two 1 kg masses on 100 N/m springs are joined by 10.5 N/m. Find both modes and how long the hand-off takes.”',
  assumptions: [
    'Small motions along the line, no friction; any motion is a mix of the two modes.',
    'In step the middle spring never stretches: ω₁ = √(k/m); opposite it stretches twice: ω₂ = √((k + 2k′)/m).',
  ],
  variables: [
    vu('m', 'm', 'Mass', 'kg', 0.01, 100, { step: 0.1 }),
    vu('k', 'k', 'Outer springs', 'N/m', 1, 1e4, { step: 1 }),
    vu('kc', 'k′', 'Coupling spring', 'N/m', 0.1, 1e4, { step: 0.5 }),
    vu('w1', 'ω₁', 'Slow mode', 'rad/s', 0.01, 1e4),
    vu('w2', 'ω₂', 'Fast mode', 'rad/s', 0.01, 1e4),
    vu('Tex', 'T_ex', 'Energy-exchange period', 's', 1e-4, 1e5, { derived: true }),
  ],
  rules: [
    rule(
      'ω₁ = √(k ÷ m)',
      '{w1} = √({k} ÷ {m})',
      ['w1', 'k', 'm'],
      (x) => x.w1! ** 2 * x.m! - x.k!,
      {
        w1: [
          (x) => Math.sqrt(x.k! / x.m!),
          '√({k} ÷ {m})',
          'In step: the coupling spring keeps its length.',
        ],
        k: [(x) => x.w1! ** 2 * x.m!, '{w1}² × {m}', 'The outer springs from the slow mode.'],
      },
    ),
    rule(
      'ω₂ = √((k + 2k′) ÷ m)',
      '{w2} = √(({k} + 2 × {kc}) ÷ {m})',
      ['w2', 'k', 'kc', 'm'],
      (x) => x.w2! ** 2 * x.m! - x.k! - 2 * x.kc!,
      {
        w2: [
          (x) => Math.sqrt((x.k! + 2 * x.kc!) / x.m!),
          '√(({k} + 2 × {kc}) ÷ {m})',
          'Opposite: each mass feels k plus the coupling spring stretched from both ends.',
        ],
        kc: [
          (x) => (x.w2! ** 2 * x.m! - x.k!) / 2,
          '({w2}² × {m} − {k}) ÷ 2',
          'The coupling spring from the fast mode.',
        ],
      },
    ),
    rule(
      'T_ex = 2π ÷ (ω₂ − ω₁)',
      '{Tex} = 2π ÷ ({w2} − {w1})',
      ['Tex', 'w2', 'w1'],
      (x) => x.Tex! * (x.w2! - x.w1!) - 2 * Math.PI,
      {
        Tex: [
          (x) => div(2 * Math.PI, x.w2! - x.w1!),
          '2π ÷ ({w2} − {w1})',
          'The modes drift out of step and back: the beat brings the motion back to m₁.',
        ],
      },
    ),
  ],
  example: { m: 1, k: 100, kc: 10.5, w1: 10, w2: 11, Tex: 2 * Math.PI },
  startWith: ['m', 'k', 'kc'],
  representation: {
    kind: 'oscillator',
    mass: 'm',
    spring: 'k',
    amplitude: 0.05,
    coupled: { m1: 'm', k1: 'k', k2: 'kc', slow: 'w1', fast: 'w2', exchange: 'Tex' },
  },
});

/** ω² of two masses on k₁ (wall), k₂ (between) and k₃ (other wall; 0 for a free end). */
const modeW2 = (x: Values, k3: number, sign: 1 | -1) => {
  const P = x.m1! * (x.k2! + k3) + x.m2! * (x.k1! + x.k2!);
  const Q = (x.k1! + x.k2!) * (x.k2! + k3) - x.k2! ** 2;
  return (P + sign * Math.sqrt(P * P - 4 * x.m1! * x.m2! * Q)) / (2 * x.m1! * x.m2!);
};

const twoMassModule = (chain: boolean): ModuleDef => {
  const k3 = (x: Values) => (chain ? 0 : x.k3!);
  const vars = chain ? ['m1', 'm2', 'k1', 'k2'] : ['m1', 'm2', 'k1', 'k2', 'k3'];
  const ex: Values = chain
    ? { m1: 1, m2: 1, k1: 200, k2: 100 }
    : { m1: 1, m2: 1, k1: 100, k2: 100, k3: 100 };
  const w = (x: Values, s: 1 | -1) => Math.sqrt(modeW2(x, k3(x), s));
  const rOf = (x: Values, wv: number) => (x.k1! + x.k2! - x.m1! * wv ** 2) / x.k2!;
  const P = chain
    ? '{m1} × {k2} + {m2} × ({k1} + {k2})'
    : '{m1} × ({k2} + {k3}) + {m2} × ({k1} + {k2})';
  const Q = chain ? '{k1} × {k2}' : '({k1} + {k2}) × ({k2} + {k3}) − {k2}²';
  const root = (s: string) =>
    `√((${P} ${s} √((${P})² − 4 × {m1} × {m2} × (${Q}))) ÷ (2 × {m1} × {m2}))`;
  return demo({
    id: chain ? 'g.he-oscillator-chain' : 'g.he-oscillator-two-mass',
    title: chain
      ? 'Oscillator: a two-mass chain, the far end free'
      : 'Oscillator: two masses between walls',
    use: chain
      ? 'Use this for “Wall, 200 N/m, 1 kg, 100 N/m, 1 kg, free end: find both modes and their shapes.”'
      : 'Use this for “Two 1 kg masses between walls on three 100 N/m springs: find the natural frequencies and mode shapes.”',
    assumptions: [
      'Small motions along the line, no friction.',
      chain
        ? 'det(K − ω²M) = 0 with K = [k₁ + k₂, −k₂; −k₂, k₂], the far end free.'
        : 'det(K − ω²M) = 0 with K = [k₁ + k₂, −k₂; −k₂, k₂ + k₃].',
      'Each mode’s shape x₂/x₁ = (k₁ + k₂ − m₁ω²) ÷ k₂.',
    ],
    variables: [
      vu('m1', 'm₁', 'Mass 1', 'kg', 0.01, 100, { step: 0.1 }),
      vu('m2', 'm₂', 'Mass 2', 'kg', 0.01, 100, { step: 0.1 }),
      vu('k1', 'k₁', 'Wall spring', 'N/m', 1, 1e4, { step: 10 }),
      vu('k2', 'k₂', 'Middle spring', 'N/m', 1, 1e4, { step: 10 }),
      ...(chain ? [] : [vu('k3', 'k₃', 'Far wall spring', 'N/m', 1, 1e4, { step: 10 })]),
      vu('w1', 'ω₁', 'Slow mode', 'rad/s', 0, 1e4, { derived: true }),
      vu('w2', 'ω₂', 'Fast mode', 'rad/s', 0, 1e4, { derived: true }),
      vu('r1', 'r₁', 'Slow mode shape x₂/x₁', undefined, -1e6, 1e6, { derived: true }),
      vu('r2', 'r₂', 'Fast mode shape x₂/x₁', undefined, -1e6, 1e6, { derived: true }),
    ],
    rules: [
      rule(
        'ω₁ from det(K − ω²M) = 0',
        `{w1} = ${root('−')}`,
        ['w1', ...vars],
        (x) => x.w1! - w(x, -1),
        {
          w1: [(x) => w(x, -1), root('−'), 'The smaller root of m₁m₂ω⁴ − Pω² + Q = 0.'],
        },
      ),
      rule(
        'ω₂ from det(K − ω²M) = 0',
        `{w2} = ${root('+')}`,
        ['w2', ...vars],
        (x) => x.w2! - w(x, 1),
        {
          w2: [(x) => w(x, 1), root('+'), 'The larger root of the same equation.'],
        },
      ),
      rule(
        'r₁ = (k₁ + k₂ − m₁ω₁²) ÷ k₂',
        '{r1} = ({k1} + {k2} − {m1} × {w1}²) ÷ {k2}',
        ['r1', 'k1', 'k2', 'm1', 'w1'],
        (x) => x.r1! * x.k2! - (x.k1! + x.k2! - x.m1! * x.w1! ** 2),
        {
          r1: [
            (x) => rOf(x, x.w1!),
            '({k1} + {k2} − {m1} × {w1}²) ÷ {k2}',
            'The first row of (K − ω²M)x = 0 gives x₂/x₁.',
          ],
        },
      ),
      rule(
        'r₂ = (k₁ + k₂ − m₁ω₂²) ÷ k₂',
        '{r2} = ({k1} + {k2} − {m1} × {w2}²) ÷ {k2}',
        ['r2', 'k1', 'k2', 'm1', 'w2'],
        (x) => x.r2! * x.k2! - (x.k1! + x.k2! - x.m1! * x.w2! ** 2),
        {
          r2: [
            (x) => rOf(x, x.w2!),
            '({k1} + {k2} − {m1} × {w2}²) ÷ {k2}',
            'The same row at the fast mode: negative, the blocks move opposite.',
          ],
        },
      ),
    ],
    example: (() => {
      const [w1, w2] = [w(ex, -1), w(ex, 1)];
      return { ...ex, w1, w2, r1: rOf(ex, w1), r2: rOf(ex, w2) };
    })(),
    startWith: vars,
    representation: {
      kind: 'oscillator',
      mass: 'm1',
      spring: 'k1',
      amplitude: 0.05,
      coupled: {
        m1: 'm1',
        m2: 'm2',
        k1: 'k1',
        k2: 'k2',
        ...(chain ? { layout: 'chain' as const } : { k3: 'k3' }),
        slow: 'w1',
        fast: 'w2',
        ratios: ['r1', 'r2'],
      },
    },
  });
};

const springsModule = (layout: 'series' | 'parallel'): ModuleDef =>
  demo({
    id: `g.he-oscillator-springs-${layout}`,
    title: `Oscillator: two springs in ${layout}`,
    use: `Use this for “Springs of 3000 and 6000 N/m are joined in ${layout}. What single spring acts the same?”`,
    assumptions:
      layout === 'series'
        ? [
            'In series both springs carry the same force; their stretches add.',
            '1/k_eq = 1/k₁ + 1/k₂.',
          ]
        : ['In parallel both springs stretch the same; their forces add.', 'k_eq = k₁ + k₂.'],
    variables: [
      vu('k1', 'k₁', 'Spring 1', 'N/m', 1, 1e6, { step: 100 }),
      vu('k2', 'k₂', 'Spring 2', 'N/m', 1, 1e6, { step: 100 }),
      vu('keq', 'k_eq', 'Equivalent spring', 'N/m', 0.5, 2e6),
    ],
    rules: [
      layout === 'series'
        ? rule(
            'k_eq = k₁k₂ ÷ (k₁ + k₂)',
            '{keq} = {k1} × {k2} ÷ ({k1} + {k2})',
            ['keq', 'k1', 'k2'],
            (x) => x.keq! * (x.k1! + x.k2!) - x.k1! * x.k2!,
            {
              keq: [
                (x) => div(x.k1! * x.k2!, x.k1! + x.k2!),
                '{k1} × {k2} ÷ ({k1} + {k2})',
                'The stretches add, so the softnesses 1/k add: product over sum.',
              ],
              k1: [
                (x) => div(x.keq! * x.k2!, x.k2! - x.keq!),
                '{keq} × {k2} ÷ ({k2} − {keq})',
                'Solve 1/k_eq = 1/k₁ + 1/k₂ for k₁.',
              ],
              k2: [
                (x) => div(x.keq! * x.k1!, x.k1! - x.keq!),
                '{keq} × {k1} ÷ ({k1} − {keq})',
                'Solve 1/k_eq = 1/k₁ + 1/k₂ for k₂.',
              ],
            },
          )
        : rule(
            'k_eq = k₁ + k₂',
            '{keq} = {k1} + {k2}',
            ['keq', 'k1', 'k2'],
            (x) => x.keq! - x.k1! - x.k2!,
            {
              keq: [
                (x) => x.k1! + x.k2!,
                '{k1} + {k2}',
                'The same stretch in both: their forces add.',
              ],
              k1: [(x) => x.keq! - x.k2!, '{keq} − {k2}', 'Take away spring 2.'],
              k2: [(x) => x.keq! - x.k1!, '{keq} − {k1}', 'Take away spring 1.'],
            },
          ),
    ],
    example: { k1: 3000, k2: 6000, keq: layout === 'series' ? 2000 : 9000 },
    startWith: ['k1', 'k2'],
    representation: {
      kind: 'oscillator',
      mass: 1,
      spring: 'keq',
      amplitude: 0.01,
      springs: { k1: 'k1', k2: 'k2', layout, total: 'keq' },
    },
  });

const HC11_MODULES = [
  damped,
  phase,
  envelope,
  massSpring,
  ratio,
  logDec,
  forcedDemo,
  resonance,
  transmit,
  coupled,
  twoMassModule(true),
  twoMassModule(false),
  springsModule('series'),
  springsModule('parallel'),
];

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
  ...HC11_MODULES,
];

export const HE1H_GALLERY_LAYOUTS: LayoutDef[] = [];

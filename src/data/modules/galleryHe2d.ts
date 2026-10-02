/**
 * College gallery demos, round 2, group D (docs/RENDERINGS_HE.md). Each stands in for the
 * college page that waits, built from the plan's worked example. Spread into gallery.ts.
 *
 * HC18: op-amp circuits (`amp` on `seriesCircuit`), one demo per circuit from the circuits,
 * electronics and bioinstrumentation plans, and one at the edge (the output at the rail).
 *
 * HC39: semiconductor circuits (`device` on `seriesCircuit`), one demo per circuit from the
 * electronics plan, and one at the edge (a BJT just short of saturation).
 */
import type { Relation, Values, VariableDef } from '@/engine/types';

import type { LayoutDef } from './layouts';
import type { ModuleDef } from './types';
import type { AmpSpec, DeviceSpec } from './typesHe2d';

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

type Demo = Omit<ModuleDef, 'relations' | 'steps'> & { rules: Rule[]; limits?: Relation[] };

/** A module from its rules (the relations and their step text together) and its page limits. */
function demo({ rules, limits = [], ...m }: Demo): ModuleDef {
  return {
    ...m,
    relations: [
      ...rules.map((r) => ({
        id: r.id,
        display: r.display,
        vars: r.vars,
        residual: r.residual,
        solve: Object.fromEntries(Object.entries(r.solve).map(([k, [fn]]) => [k, fn])),
      })),
      ...limits,
    ],
    steps: Object.fromEntries([
      ...rules.map((r) => [
        r.id,
        Object.fromEntries(Object.entries(r.solve).map(([k, [, expr, how]]) => [k, { expr, how }])),
      ]),
      ...limits.map((l) => [l.id, {}]),
    ]),
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

/** A resistance in kΩ (10 Ω to 10 MΩ), or in Ω. */
const kohm = (id: string, symbol: string, name: string) =>
  vr(id, symbol, name, 'kΩ', 0.01, 10000, { step: 1 });
/** A voltage in V, either sign. */
const volts = (id: string, symbol: string, name: string, lim = 30) =>
  vr(id, symbol, name, 'V', -lim, lim, { step: 0.1 });
/** The supply rail V_sat, 1 to 30 V. */
const rail = (id = 'Vsat') => vr(id, 'Vₛₐₜ', 'Supply rail', 'V', 1, 30, { step: 1 });
const amp = (spec: Omit<AmpSpec, 'kind'>): AmpSpec => ({ kind: 'seriesCircuit', ...spec });

/** The page limit: the output can't pass the supply rail. */
const railLimit = (out: string, r = 'Vsat'): Relation => ({
  id: 'the output stays inside the rails',
  constraint: true,
  display: `{${out}} stays within ±{${r}}`,
  vars: [out, r],
  residual: (x) => (Math.abs(x[out]!) <= x[r]! * (1 + 1e-9) ? 0 : 1),
  solve: {},
  message: (x) =>
    Math.abs(x[out]!) <= x[r]! * (1 + 1e-9) ? undefined : 'The output can’t pass the supply rail.',
});

const IDEAL = 'Ideal op-amp: no current into either input, and v₊ = v₋ (the virtual short).';
const RAILS = 'The output stays inside the rails ±Vₛₐₜ.';

// ─── circuits-1#3: the inverting amplifier ────────────────────────────────────

/** A_v = −R_f ÷ R_in and v_out = A_v v_in, for the inverting pages. */
const invertingRules = (gain = 'Av'): Rule[] => [
  rule(
    'A_v = −R_f ÷ R_in',
    `{${gain}} = −{Rf} ÷ {Rin}`,
    [gain, 'Rf', 'Rin'],
    (x) => x[gain]! * x.Rin! + x.Rf!,
    {
      [gain]: [
        (x) => div(-x.Rf!, x.Rin!),
        '−{Rf} ÷ {Rin}',
        'The gain is the resistor ratio, inverted.',
      ],
      Rf: [
        (x) => -x[gain]! * x.Rin!,
        '−{' + gain + '} × {Rin}',
        'Undo the ratio: R_f = −A_v R_in.',
      ],
      Rin: [
        (x) => div(-x.Rf!, x[gain]!),
        '−{Rf} ÷ {' + gain + '}',
        'Undo the ratio: R_in = −R_f ÷ A_v.',
      ],
    },
  ),
  rule(
    'v_out = A_v v_in',
    `{vout} = {${gain}} × {vin}`,
    ['vout', gain, 'vin'],
    (x) => x.vout! - x[gain]! * x.vin!,
    {
      vout: [
        (x) => x[gain]! * x.vin!,
        `{${gain}} × {vin}`,
        'The output is the input times the gain.',
      ],
      vin: [(x) => div(x.vout!, x[gain]!), `{vout} ÷ {${gain}}`, 'Divide the output by the gain.'],
      [gain]: [(x) => div(x.vout!, x.vin!), '{vout} ÷ {vin}', 'The gain is output over input.'],
    },
  ),
];

const invertingVars = (lim = 15) => [
  volts('vin', 'vᵢₙ', 'Input voltage', lim),
  kohm('Rin', 'Rᵢₙ', 'Input resistance'),
  kohm('Rf', 'R_f', 'Feedback resistance'),
  vr('Av', 'Aᵥ', 'Voltage gain', undefined, -1e6, 0, { step: 0.1 }),
  volts('vout', 'vₒᵤₜ', 'Output voltage'),
  rail(),
];

const inverting = demo({
  id: 'g.he-series-circuit-amp-inverting',
  title: 'Schematic: the inverting amplifier',
  use: 'Use this for “An inverting amplifier has R_in = 10 kΩ and R_f = 47 kΩ. Find v_out for 0.2 V in.”',
  assumptions: [IDEAL, 'The + input is grounded, so the − input is a virtual ground.', RAILS],
  variables: invertingVars(),
  rules: invertingRules(),
  limits: [railLimit('vout')],
  example: { vin: 0.2, Rin: 10, Rf: 47, Av: -4.7, vout: -0.94, Vsat: 15 },
  startWith: ['vin', 'Rin', 'Rf', 'Vsat'],
  representation: amp({
    amp: 'inverting',
    vin: ['vin'],
    rin: ['Rin'],
    rf: 'Rf',
    gain: 'Av',
    vout: 'vout',
    rail: 'Vsat',
  }),
});

// The edge: a gain of −10 takes 1.5 V in to the −15 V rail exactly.
const atRail = demo({
  id: 'g.he-series-circuit-amp-at-rail',
  title: 'Schematic: an inverting amplifier at its rail',
  use: 'Use this for “How large an input can a gain of −10 take before a ±15 V op-amp clips?”',
  assumptions: [IDEAL, RAILS, 'Past the rail the output clips: the formulas stop holding.'],
  variables: invertingVars(),
  rules: invertingRules(),
  limits: [railLimit('vout')],
  example: { vin: 1.5, Rin: 10, Rf: 100, Av: -10, vout: -15, Vsat: 15 },
  startWith: ['vin', 'Rin', 'Rf', 'Vsat'],
  representation: amp({
    amp: 'inverting',
    vin: ['vin'],
    rin: ['Rin'],
    rf: 'Rf',
    gain: 'Av',
    vout: 'vout',
    rail: 'Vsat',
  }),
});

// ─── circuits-1#3~non-inverting ───────────────────────────────────────────────

const nonInverting = demo({
  id: 'g.he-series-circuit-amp-non-inverting',
  title: 'Schematic: the non-inverting amplifier',
  use: 'Use this for “A non-inverting amplifier has R_g = 10 kΩ and R_f = 30 kΩ. Find its gain and output for 0.5 V.”',
  assumptions: [IDEAL, 'R_f and R_g divide the output down to the − input.', RAILS],
  variables: [
    volts('vin', 'vᵢₙ', 'Input voltage', 15),
    kohm('Rg', 'R_g', 'Ground resistance'),
    kohm('Rf', 'R_f', 'Feedback resistance'),
    vr('Av', 'Aᵥ', 'Voltage gain', undefined, 1, 1e6, { step: 0.1 }),
    volts('vout', 'vₒᵤₜ', 'Output voltage'),
    rail(),
  ],
  rules: [
    rule(
      'A_v = 1 + R_f ÷ R_g',
      '{Av} = 1 + {Rf} ÷ {Rg}',
      ['Av', 'Rf', 'Rg'],
      (x) => (x.Av! - 1) * x.Rg! - x.Rf!,
      {
        Av: [(x) => div(x.Rf!, x.Rg!)! + 1, '1 + {Rf} ÷ {Rg}', 'One plus the resistor ratio.'],
        Rf: [(x) => (x.Av! - 1) * x.Rg!, '({Av} − 1) × {Rg}', 'Take 1 from the gain, times R_g.'],
        Rg: [(x) => div(x.Rf!, x.Av! - 1), '{Rf} ÷ ({Av} − 1)', 'R_f over the gain less 1.'],
      },
    ),
    rule(
      'v_out = A_v v_in',
      '{vout} = {Av} × {vin}',
      ['vout', 'Av', 'vin'],
      (x) => x.vout! - x.Av! * x.vin!,
      {
        vout: [(x) => x.Av! * x.vin!, '{Av} × {vin}', 'The output is the input times the gain.'],
        vin: [(x) => div(x.vout!, x.Av!), '{vout} ÷ {Av}', 'Divide the output by the gain.'],
        Av: [(x) => div(x.vout!, x.vin!), '{vout} ÷ {vin}', 'The gain is output over input.'],
      },
    ),
  ],
  limits: [railLimit('vout')],
  example: { vin: 0.5, Rg: 10, Rf: 30, Av: 4, vout: 2, Vsat: 15 },
  startWith: ['vin', 'Rg', 'Rf', 'Vsat'],
  representation: amp({
    amp: 'nonInverting',
    vin: ['vin'],
    rg: 'Rg',
    rf: 'Rf',
    gain: 'Av',
    vout: 'vout',
    rail: 'Vsat',
  }),
});

// ─── circuits-1#3~summing ─────────────────────────────────────────────────────

const summing = demo({
  id: 'g.he-series-circuit-amp-summing',
  title: 'Schematic: the summing amplifier',
  use: 'Use this for “A summing amplifier has every resistor 10 kΩ. Find v_out for inputs of 1 V and 2 V.”',
  assumptions: [
    IDEAL,
    'Each input’s current meets at the virtual ground and flows on through R_f.',
    RAILS,
  ],
  variables: [
    volts('v1', 'v₁', 'Input 1', 15),
    volts('v2', 'v₂', 'Input 2', 15),
    kohm('R1', 'R₁', 'Resistor 1'),
    kohm('R2', 'R₂', 'Resistor 2'),
    kohm('Rf', 'R_f', 'Feedback resistance'),
    volts('vout', 'vₒᵤₜ', 'Output voltage'),
    rail(),
  ],
  rules: [
    rule(
      'v_out = −R_f(v₁ ÷ R₁ + v₂ ÷ R₂)',
      '{vout} = −{Rf} × ({v1} ÷ {R1} + {v2} ÷ {R2})',
      ['vout', 'Rf', 'v1', 'R1', 'v2', 'R2'],
      (x) => x.vout! + x.Rf! * (x.v1! / x.R1! + x.v2! / x.R2!),
      {
        vout: [
          (x) => -x.Rf! * (x.v1! / x.R1! + x.v2! / x.R2!),
          '−{Rf} × ({v1} ÷ {R1} + {v2} ÷ {R2})',
          'Add the input currents, then times −R_f.',
        ],
        v1: [
          (x) => x.R1! * (-x.vout! / x.Rf! - x.v2! / x.R2!),
          '{R1} × (−{vout} ÷ {Rf} − {v2} ÷ {R2})',
          'The current v₁ must add, times R₁.',
        ],
        v2: [
          (x) => x.R2! * (-x.vout! / x.Rf! - x.v1! / x.R1!),
          '{R2} × (−{vout} ÷ {Rf} − {v1} ÷ {R1})',
          'The current v₂ must add, times R₂.',
        ],
        Rf: [
          (x) => div(-x.vout!, x.v1! / x.R1! + x.v2! / x.R2!),
          '−{vout} ÷ ({v1} ÷ {R1} + {v2} ÷ {R2})',
          'The output over the summed current.',
        ],
      },
    ),
  ],
  limits: [railLimit('vout')],
  example: { v1: 1, v2: 2, R1: 10, R2: 10, Rf: 10, vout: -3, Vsat: 15 },
  startWith: ['v1', 'v2', 'R1', 'R2', 'Rf', 'Vsat'],
  representation: amp({
    amp: 'summing',
    vin: ['v1', 'v2'],
    rin: ['R1', 'R2'],
    rf: 'Rf',
    vout: 'vout',
    rail: 'Vsat',
  }),
});

// ─── circuits-1#3~difference ──────────────────────────────────────────────────

const difference = demo({
  id: 'g.he-series-circuit-amp-difference',
  title: 'Schematic: the difference amplifier',
  use: 'Use this for “A difference amplifier has R₁ = 10 kΩ and R₂ = 50 kΩ. Find v_out for v₂ = 1.2 V and v₁ = 1 V.”',
  assumptions: [IDEAL, 'Matched pairs: both R₁ equal, both R₂ equal.', RAILS],
  variables: [
    volts('v1', 'v₁', 'Input 1 (to −)', 15),
    volts('v2', 'v₂', 'Input 2 (to +)', 15),
    kohm('R1', 'R₁', 'Input resistance'),
    kohm('R2', 'R₂', 'Feedback resistance'),
    vr('G', 'G', 'Difference gain', undefined, 0.001, 1e6, { step: 0.1 }),
    volts('vout', 'vₒᵤₜ', 'Output voltage'),
    rail(),
  ],
  rules: [
    rule('G = R₂ ÷ R₁', '{G} = {R2} ÷ {R1}', ['G', 'R2', 'R1'], (x) => x.G! * x.R1! - x.R2!, {
      G: [(x) => div(x.R2!, x.R1!), '{R2} ÷ {R1}', 'The resistor ratio.'],
      R2: [(x) => x.G! * x.R1!, '{G} × {R1}', 'The gain times R₁.'],
      R1: [(x) => div(x.R2!, x.G!), '{R2} ÷ {G}', 'R₂ over the gain.'],
    }),
    rule(
      'v_out = G(v₂ − v₁)',
      '{vout} = {G} × ({v2} − {v1})',
      ['vout', 'G', 'v2', 'v1'],
      (x) => x.vout! - x.G! * (x.v2! - x.v1!),
      {
        vout: [
          (x) => x.G! * (x.v2! - x.v1!),
          '{G} × ({v2} − {v1})',
          'Only the difference is amplified.',
        ],
        v2: [
          (x) => div(x.vout!, x.G!)! + x.v1!,
          '{vout} ÷ {G} + {v1}',
          'Undo the gain, then add v₁.',
        ],
        v1: [
          (x) => x.v2! - div(x.vout!, x.G!)!,
          '{v2} − {vout} ÷ {G}',
          'Undo the gain, then take it from v₂.',
        ],
        G: [
          (x) => div(x.vout!, x.v2! - x.v1!),
          '{vout} ÷ ({v2} − {v1})',
          'Output over the difference.',
        ],
      },
    ),
  ],
  limits: [railLimit('vout')],
  example: { v1: 1, v2: 1.2, R1: 10, R2: 50, G: 5, vout: 1, Vsat: 15 },
  startWith: ['v1', 'v2', 'R1', 'R2', 'Vsat'],
  representation: amp({
    amp: 'difference',
    vin: ['v1', 'v2'],
    rin: ['R1'],
    rf: 'R2',
    gain: 'G',
    vout: 'vout',
    rail: 'Vsat',
  }),
});

// ─── electronics#3~integrator ─────────────────────────────────────────────────

const integrator = demo({
  id: 'g.he-series-circuit-amp-integrator',
  title: 'Schematic: the op-amp integrator',
  use: 'Use this for “An integrator has R = 10 kΩ and C = 1 μF. Find v_out 4 ms after 0.5 V is applied.”',
  assumptions: [
    IDEAL,
    'The capacitor starts uncharged, so v_out starts at 0 V.',
    'R in kΩ, C in μF: RC is in ms.',
    RAILS,
  ],
  variables: [
    volts('vin', 'vᵢₙ', 'Input voltage', 15),
    kohm('R', 'R', 'Input resistance'),
    vr('C', 'C', 'Capacitance', 'μF', 1e-6, 1e6, { step: 0.1 }),
    vr('t', 't', 'Time', 'ms', 1e-6, 1e6, { step: 0.5 }),
    volts('vout', 'vₒᵤₜ', 'Output voltage'),
    rail(),
  ],
  rules: [
    rule(
      'v_out = −v_in t ÷ (RC)',
      '{vout} = −{vin} × {t} ÷ ({R} × {C})',
      ['vout', 'vin', 't', 'R', 'C'],
      (x) => x.vout! * x.R! * x.C! + x.vin! * x.t!,
      {
        vout: [
          (x) => div(-x.vin! * x.t!, x.R! * x.C!),
          '−{vin} × {t} ÷ ({R} × {C})',
          'A steady current v_in ÷ R charges C: the output falls in a straight line.',
        ],
        t: [
          (x) => div(-x.vout! * x.R! * x.C!, x.vin!),
          '−{vout} × {R} × {C} ÷ {vin}',
          'The time the ramp takes to reach this output.',
        ],
        vin: [
          (x) => div(-x.vout! * x.R! * x.C!, x.t!),
          '−{vout} × {R} × {C} ÷ {t}',
          'The input that ramps this far in this time.',
        ],
        C: [
          (x) => div(-x.vin! * x.t!, x.vout! * x.R!),
          '−{vin} × {t} ÷ ({vout} × {R})',
          'The capacitor that sets this slope.',
        ],
      },
    ),
  ],
  limits: [railLimit('vout')],
  example: { vin: 0.5, R: 10, C: 1, t: 4, vout: -0.2, Vsat: 15 },
  startWith: ['vin', 'R', 'C', 't', 'Vsat'],
  representation: amp({
    amp: 'integrator',
    vin: ['vin'],
    rin: ['R'],
    c: 'C',
    time: 't',
    vout: 'vout',
    rail: 'Vsat',
  }),
});

// ─── electronics#3~active-lowpass ─────────────────────────────────────────────

const lowpass = demo({
  id: 'g.he-series-circuit-amp-active-lowpass',
  title: 'Schematic: the active low-pass filter',
  use: 'Use this for “An inverting low-pass has R₁ = 10 kΩ, R_f = 100 kΩ and C = 1.59 nF. Find its gain and cutoff.”',
  assumptions: [
    IDEAL,
    'C sits across R_f: well below f_c it is nearly open; above f_c it shorts R_f.',
    'R in kΩ and C in nF: R_f C is in μs, so f_c = 1000 ÷ (2πR_f C) kHz.',
  ],
  variables: [
    kohm('R1', 'R₁', 'Input resistance'),
    kohm('Rf', 'R_f', 'Feedback resistance'),
    vr('C', 'C', 'Capacitance', 'nF', 1e-6, 1e9, { step: 0.01 }),
    vr('A', 'A', 'Passband gain', undefined, -1e6, 0, { step: 0.1 }),
    vr('dB', 'G', 'Passband gain in decibels', 'dB', -200, 200),
    vr('fc', 'f_c', 'Cutoff frequency', 'kHz', 1e-9, 1e9),
  ],
  rules: [
    rule('A = −R_f ÷ R₁', '{A} = −{Rf} ÷ {R1}', ['A', 'Rf', 'R1'], (x) => x.A! * x.R1! + x.Rf!, {
      A: [(x) => div(-x.Rf!, x.R1!), '−{Rf} ÷ {R1}', 'The inverting gain, below the cutoff.'],
      Rf: [(x) => -x.A! * x.R1!, '−{A} × {R1}', 'Undo the ratio for R_f.'],
      R1: [(x) => div(-x.Rf!, x.A!), '−{Rf} ÷ {A}', 'Undo the ratio for R₁.'],
    }),
    rule(
      'G = 20 log₁₀(−A)',
      '{dB} = 20 × log₁₀(−{A})',
      ['dB', 'A'],
      (x) => x.dB! - 20 * Math.log10(Math.abs(x.A!)),
      {
        dB: [
          (x) => (x.A! !== 0 ? 20 * Math.log10(Math.abs(x.A!)) : undefined),
          '20 × log₁₀(−{A})',
          'The gain’s size in decibels.',
        ],
        A: [
          (x) => -(10 ** (x.dB! / 20)),
          '−10^({dB} ÷ 20)',
          'Undo the decibels; the gain is inverting.',
        ],
      },
    ),
    rule(
      'f_c = 1 ÷ (2πR_f C)',
      '{fc} = 1000 ÷ (2π × {Rf} × {C})',
      ['fc', 'Rf', 'C'],
      (x) => x.fc! * 2 * Math.PI * x.Rf! * x.C! - 1000,
      {
        fc: [
          (x) => div(1000, 2 * Math.PI * x.Rf! * x.C!),
          '1000 ÷ (2π × {Rf} × {C})',
          'R_f and C set the corner: kΩ × nF is μs, so 1000 turns it into kHz.',
        ],
        C: [
          (x) => div(1000, 2 * Math.PI * x.Rf! * x.fc!),
          '1000 ÷ (2π × {Rf} × {fc})',
          'The capacitor that puts the corner here.',
        ],
        Rf: [
          (x) => div(1000, 2 * Math.PI * x.C! * x.fc!),
          '1000 ÷ (2π × {C} × {fc})',
          'The feedback resistor that puts the corner here.',
        ],
      },
    ),
  ],
  example: {
    R1: 10,
    Rf: 100,
    C: 1.59,
    A: -10,
    dB: 20,
    fc: 1000 / (2 * Math.PI * 100 * 1.59),
  },
  startWith: ['R1', 'Rf', 'C'],
  representation: amp({
    amp: 'activeLowPass',
    rin: ['R1'],
    rf: 'Rf',
    c: 'C',
    gain: 'A',
    db: 'dB',
    cutoff: 'fc',
  }),
});

// ─── electronics#3~schmitt ────────────────────────────────────────────────────

const schmitt = demo({
  id: 'g.he-series-circuit-amp-schmitt',
  title: 'Schematic: the Schmitt trigger',
  use: 'Use this for “An inverting Schmitt trigger has ±12 V rails, R₁ = 10 kΩ and R₂ = 50 kΩ. Find its thresholds.”',
  assumptions: [
    'The output sits at +Vₛₐₜ or −Vₛₐₜ (positive feedback, no linear range).',
    'R₁ and R₂ divide the output to the + input: that is the threshold.',
  ],
  variables: [
    rail(),
    kohm('R1', 'R₁', 'Resistor to ground'),
    kohm('R2', 'R₂', 'Feedback resistor'),
    vr('VTH', 'V_TH', 'Threshold', 'V', 0.001, 30),
    vr('VH', 'V_H', 'Hysteresis width', 'V', 0.002, 60),
  ],
  rules: [
    rule(
      'V_TH = V_sat R₁ ÷ (R₁ + R₂)',
      '{VTH} = {Vsat} × {R1} ÷ ({R1} + {R2})',
      ['VTH', 'Vsat', 'R1', 'R2'],
      (x) => x.VTH! * (x.R1! + x.R2!) - x.Vsat! * x.R1!,
      {
        VTH: [
          (x) => div(x.Vsat! * x.R1!, x.R1! + x.R2!),
          '{Vsat} × {R1} ÷ ({R1} + {R2})',
          'The divider’s share of the rail reaches the + input.',
        ],
        R2: [
          (x) => div(x.R1! * (x.Vsat! - x.VTH!), x.VTH!),
          '{R1} × ({Vsat} − {VTH}) ÷ {VTH}',
          'The feedback resistor that gives this threshold.',
        ],
        Vsat: [
          (x) => div(x.VTH! * (x.R1! + x.R2!), x.R1!),
          '{VTH} × ({R1} + {R2}) ÷ {R1}',
          'Scale the threshold back up by the divider.',
        ],
      },
    ),
    rule('V_H = 2V_TH', '{VH} = 2 × {VTH}', ['VH', 'VTH'], (x) => x.VH! - 2 * x.VTH!, {
      VH: [(x) => 2 * x.VTH!, '2 × {VTH}', 'From −V_TH to +V_TH.'],
      VTH: [(x) => x.VH! / 2, '{VH} ÷ 2', 'Half the width.'],
    }),
  ],
  example: { Vsat: 12, R1: 10, R2: 50, VTH: 2, VH: 4 },
  startWith: ['Vsat', 'R1', 'R2'],
  representation: amp({
    amp: 'schmitt',
    rin: ['R1'],
    rf: 'R2',
    rail: 'Vsat',
    threshold: 'VTH',
    width: 'VH',
  }),
});

// ─── bioinstrumentation#1~inamp ───────────────────────────────────────────────

const inamp = demo({
  id: 'g.he-series-circuit-amp-instrumentation',
  title: 'Schematic: the three-op-amp instrumentation amplifier',
  use: 'Use this for “Which gain resistor gives a three-op-amp instrumentation amplifier a gain of 500?”',
  assumptions: [
    IDEAL,
    'The difference stage has four equal resistors (gain 1).',
    'R in kΩ, R_g in Ω: 1000 turns R into ohms.',
  ],
  variables: [
    kohm('R', 'R', 'Buffer feedback resistance'),
    vr('Rg', 'R_g', 'Gain resistor', 'Ω', 0.1, 1e7, { step: 1 }),
    vr('G', 'G', 'Gain', undefined, 1, 1e7, { step: 1 }),
    vr('Vd', 'V_d', 'Difference signal', 'mV', -1e4, 1e4, { step: 0.1 }),
    volts('vout', 'vₒᵤₜ', 'Output voltage'),
  ],
  rules: [
    rule(
      'G = 1 + 2R ÷ R_g',
      '{G} = 1 + 2 × 1000 × {R} ÷ {Rg}',
      ['G', 'R', 'Rg'],
      (x) => (x.G! - 1) * x.Rg! - 2000 * x.R!,
      {
        G: [
          (x) => div(2000 * x.R!, x.Rg!)! + 1,
          '1 + 2 × 1000 × {R} ÷ {Rg}',
          'R_g sets the whole gain.',
        ],
        Rg: [
          (x) => div(2000 * x.R!, x.G! - 1),
          '2 × 1000 × {R} ÷ ({G} − 1)',
          'The gain resistor for this gain.',
        ],
        R: [
          (x) => ((x.G! - 1) * x.Rg!) / 2000,
          '({G} − 1) × {Rg} ÷ (2 × 1000)',
          'The buffer resistors for this gain.',
        ],
      },
    ),
    rule(
      'v_out = G V_d',
      '{vout} = {G} × {Vd} ÷ 1000',
      ['vout', 'G', 'Vd'],
      (x) => 1000 * x.vout! - x.G! * x.Vd!,
      {
        vout: [
          (x) => (x.G! * x.Vd!) / 1000,
          '{G} × {Vd} ÷ 1000',
          'The difference times the gain: mV to V.',
        ],
        Vd: [(x) => div(1000 * x.vout!, x.G!), '1000 × {vout} ÷ {G}', 'Undo the gain: V to mV.'],
        G: [
          (x) => div(1000 * x.vout!, x.Vd!),
          '1000 × {vout} ÷ {Vd}',
          'Output over input, in the same unit.',
        ],
      },
    ),
  ],
  example: { R: 25, Rg: 100, G: 501, Vd: 1, vout: 0.501 },
  startWith: ['R', 'Rg', 'Vd'],
  representation: amp({
    amp: 'instrumentation',
    vin: ['Vd'],
    rf: 'R',
    rg: 'Rg',
    gain: 'G',
    vout: 'vout',
  }),
});

// ─── bioinstrumentation#1: CMRR and hum ───────────────────────────────────────

const cmrr = demo({
  id: 'g.he-series-circuit-amp-cmrr',
  title: 'Schematic: a biopotential amplifier’s hum',
  use: 'Use this for “An ECG amplifier has a gain of 1000 and a CMRR of 100 dB. How much of 0.5 V of hum reaches the output?”',
  assumptions: [
    'An ideal op-amp apart from its CMRR; linear, no clipping.',
    'The electrodes share V_cm (mains hum); the heart’s signal is the difference V_d.',
  ],
  variables: [
    vr('Ad', 'A_d', 'Differential gain', undefined, 1, 1e6, { step: 1 }),
    vr('CMRR', 'CMRR', 'Common-mode rejection', 'dB', 40, 140, { step: 1 }),
    vr('Ac', 'A_c', 'Common-mode gain', undefined, 1e-9, 1e6),
    vr('Vd', 'V_d', 'Difference signal', 'mV', -1e4, 1e4, { step: 0.1 }),
    vr('Vcm', 'V_cm', 'Common-mode voltage', 'V', -100, 100, { step: 0.1 }),
    volts('vout', 'vₒᵤₜ', 'Signal out'),
    vr('hum', 'vₕᵤₘ', 'Hum out', 'mV', -1e6, 1e6),
  ],
  rules: [
    rule(
      'A_c = A_d ÷ 10^(CMRR ÷ 20)',
      '{Ac} = {Ad} ÷ 10^({CMRR} ÷ 20)',
      ['Ac', 'Ad', 'CMRR'],
      (x) => x.Ac! - x.Ad! / 10 ** (x.CMRR! / 20),
      {
        Ac: [
          (x) => x.Ad! / 10 ** (x.CMRR! / 20),
          '{Ad} ÷ 10^({CMRR} ÷ 20)',
          'The CMRR in dB, undone, divides the gain.',
        ],
        Ad: [
          (x) => x.Ac! * 10 ** (x.CMRR! / 20),
          '{Ac} × 10^({CMRR} ÷ 20)',
          'Multiply back by the ratio.',
        ],
        CMRR: [
          (x) => (x.Ac! > 0 ? 20 * Math.log10(x.Ad! / x.Ac!) : undefined),
          '20 × log₁₀({Ad} ÷ {Ac})',
          'The ratio of the gains, in dB.',
        ],
      },
    ),
    rule(
      'out = A_d V_d',
      '{vout} = {Ad} × {Vd} ÷ 1000',
      ['vout', 'Ad', 'Vd'],
      (x) => 1000 * x.vout! - x.Ad! * x.Vd!,
      {
        vout: [
          (x) => (x.Ad! * x.Vd!) / 1000,
          '{Ad} × {Vd} ÷ 1000',
          'The signal times the gain: mV to V.',
        ],
        Vd: [(x) => div(1000 * x.vout!, x.Ad!), '1000 × {vout} ÷ {Ad}', 'Undo the gain: V to mV.'],
      },
    ),
    rule(
      'hum = A_c V_cm',
      '{hum} = {Ac} × {Vcm} × 1000',
      ['hum', 'Ac', 'Vcm'],
      (x) => x.hum! - 1000 * x.Ac! * x.Vcm!,
      {
        hum: [
          (x) => 1000 * x.Ac! * x.Vcm!,
          '{Ac} × {Vcm} × 1000',
          'The common mode times its small gain: V to mV.',
        ],
        Vcm: [
          (x) => div(x.hum!, 1000 * x.Ac!),
          '{hum} ÷ ({Ac} × 1000)',
          'Undo the common-mode gain.',
        ],
      },
    ),
  ],
  example: { Ad: 1000, CMRR: 100, Ac: 0.01, Vd: 1, Vcm: 0.5, vout: 1, hum: 5 },
  startWith: ['Ad', 'CMRR', 'Vd', 'Vcm'],
  representation: amp({
    amp: 'instrumentation',
    vin: ['Vd', 'Vcm'],
    gain: 'Ad',
    cmrr: 'CMRR',
    common: 'Ac',
    vout: 'vout',
    hum: 'hum',
  }),
});

// ─── HC39: semiconductor circuits ─────────────────────────────────────────────

const device = (spec: Omit<DeviceSpec, 'kind'>): DeviceSpec => ({ kind: 'seriesCircuit', ...spec });
const ma = (id: string, symbol: string, name: string, min = 0) =>
  vr(id, symbol, name, 'mA', min, 1e4, { step: 0.1 });

/** A rule that only checks, with the page's message when it breaks. */
const limit = (
  id: string,
  display: string,
  vars: string[],
  holds: (x: Values) => boolean,
  message: string,
): Relation => ({
  id,
  constraint: true,
  display,
  vars,
  residual: (x) => (holds(x) ? 0 : 1),
  solve: {},
  message: (x) => (holds(x) ? undefined : message),
});

// electronics#0: a diode and a resistor (the main's stand-in until the I–V curve lands).

const diodeLoop = demo({
  id: 'g.he-series-circuit-device-diode-r',
  title: 'Schematic: a diode and resistor in series',
  use: 'Use this for “A silicon diode and a 1 kΩ resistor are in series with 5 V. Find the current.”',
  assumptions: [
    'Constant-drop model: the diode takes V_D whenever it conducts.',
    'The diode points with the current. R in kΩ, so the current is in mA.',
  ],
  variables: [
    vr('Vs', 'Vₛ', 'Source voltage', 'V', 0.01, 1000, { step: 0.5 }),
    vr('VD', 'V_D', 'Diode drop', 'V', 0.2, 3.5, { step: 0.1 }),
    kohm('R', 'R', 'Resistance'),
    vr('VR', 'V_R', 'Resistor voltage', 'V', 0, 1000),
    ma('I', 'I', 'Current'),
    vr('PD', 'P_D', 'Diode power', 'mW', 0, 1e7),
  ],
  rules: [
    rule('V_R = Vₛ − V_D', '{VR} = {Vs} − {VD}', ['VR', 'Vs', 'VD'], (x) => x.VR! - x.Vs! + x.VD!, {
      VR: [(x) => x.Vs! - x.VD!, '{Vs} − {VD}', 'The diode takes its drop; R takes the rest.'],
      Vs: [(x) => x.VR! + x.VD!, '{VR} + {VD}', 'The two drops add to the source.'],
      VD: [(x) => x.Vs! - x.VR!, '{Vs} − {VR}', 'What the resistor leaves.'],
    }),
    rule('I = V_R ÷ R', '{I} = {VR} ÷ {R}', ['I', 'VR', 'R'], (x) => x.I! * x.R! - x.VR!, {
      I: [(x) => div(x.VR!, x.R!), '{VR} ÷ {R}', 'Ohm’s law for R: V ÷ kΩ gives mA.'],
      VR: [(x) => x.I! * x.R!, '{I} × {R}', 'Ohm’s law for R.'],
      R: [(x) => div(x.VR!, x.I!), '{VR} ÷ {I}', 'The resistor that sets this current.'],
    }),
    rule('P_D = V_D I', '{PD} = {VD} × {I}', ['PD', 'VD', 'I'], (x) => x.PD! - x.VD! * x.I!, {
      PD: [(x) => x.VD! * x.I!, '{VD} × {I}', 'The diode’s drop times its current: V × mA is mW.'],
      I: [(x) => div(x.PD!, x.VD!), '{PD} ÷ {VD}', 'Power over the drop.'],
    }),
  ],
  limits: [
    limit(
      'the diode conducts',
      '{Vs} is above {VD}',
      ['Vs', 'VD'],
      (x) => x.Vs! > x.VD!,
      'Below its drop the diode is off; no current flows.',
    ),
  ],
  example: { Vs: 5, VD: 0.7, R: 1, VR: 4.3, I: 4.3, PD: 3.01 },
  startWith: ['Vs', 'VD', 'R'],
  representation: device({
    device: 'diodeR',
    parts: ['Vs', 'VD', 'R'],
    values: { current: 'I', vr: 'VR', power: 'PD' },
  }),
});

// electronics#0~zener

const zenerReg = demo({
  id: 'g.he-series-circuit-device-zener',
  title: 'Schematic: a zener regulator',
  use: 'Use this for “A 5.1 V zener regulates 12 V for a 20 mA load with 5 mA left for the zener. Find R.”',
  assumptions: [
    'The zener holds V_Z across the load while its current stays above I_Z.',
    'Currents in mA, R in Ω: 1000 turns mA into A. P_Z is with the load removed.',
  ],
  variables: [
    vr('Vs', 'Vₛ', 'Source voltage', 'V', 0.01, 1000, { step: 0.5 }),
    vr('VZ', 'V_Z', 'Zener voltage', 'V', 0.5, 500, { step: 0.1 }),
    ma('IL', 'I_L', 'Load current'),
    ma('IZ', 'I_Z', 'Least zener current', 0.001),
    vr('R', 'R', 'Series resistance', 'Ω', 0.1, 1e7, { step: 1 }),
    vr('PZ', 'P_Z', 'Zener power with no load', 'mW', 0, 1e8),
  ],
  rules: [
    rule(
      'R = (Vₛ − V_Z) ÷ (I_L + I_Z)',
      '{R} = 1000 × ({Vs} − {VZ}) ÷ ({IL} + {IZ})',
      ['R', 'Vs', 'VZ', 'IL', 'IZ'],
      (x) => x.R! * (x.IL! + x.IZ!) - 1000 * (x.Vs! - x.VZ!),
      {
        R: [
          (x) => div(1000 * (x.Vs! - x.VZ!), x.IL! + x.IZ!),
          '1000 × ({Vs} − {VZ}) ÷ ({IL} + {IZ})',
          'R drops what the zener doesn’t, carrying both currents.',
        ],
        IZ: [
          (x) => div(1000 * (x.Vs! - x.VZ!), x.R!)! - x.IL!,
          '1000 × ({Vs} − {VZ}) ÷ {R} − {IL}',
          'What R carries, less the load’s share.',
        ],
        IL: [
          (x) => div(1000 * (x.Vs! - x.VZ!), x.R!)! - x.IZ!,
          '1000 × ({Vs} − {VZ}) ÷ {R} − {IZ}',
          'What R carries, less the zener’s share.',
        ],
      },
    ),
    rule(
      'P_Z = V_Z(Vₛ − V_Z) ÷ R',
      '{PZ} = 1000 × {VZ} × ({Vs} − {VZ}) ÷ {R}',
      ['PZ', 'VZ', 'Vs', 'R'],
      (x) => x.PZ! * x.R! - 1000 * x.VZ! * (x.Vs! - x.VZ!),
      {
        PZ: [
          (x) => div(1000 * x.VZ! * (x.Vs! - x.VZ!), x.R!),
          '1000 × {VZ} × ({Vs} − {VZ}) ÷ {R}',
          'With no load the zener takes all of R’s current: W into mW.',
        ],
      },
    ),
  ],
  example: { Vs: 12, VZ: 5.1, IL: 20, IZ: 5, R: 276, PZ: 127.5 },
  startWith: ['Vs', 'VZ', 'IL', 'IZ'],
  representation: device({
    device: 'zener',
    parts: ['Vs', 'VZ', 'R'],
    values: { current: 'IL', zener: 'IZ', power: 'PZ' },
  }),
});

// electronics#0~rectifier

const vr0 = (1000 * 10.6) / (120 * 1 * 470);
const rectifier = demo({
  id: 'g.he-series-circuit-device-rectifier',
  title: 'Schematic: a bridge rectifier with its ripple',
  use: 'Use this for “A bridge rectifier on a 12 V peak secondary feeds 470 μF and 1 kΩ. Find the ripple and the dc output.”',
  assumptions: [
    'Two silicon diodes conduct each half cycle: 2 × 0.7 V is lost.',
    'C discharges in a near-straight line between peaks (ripple well under V_p).',
    'R in kΩ and C in μF: RC is in ms, so 1000 turns f_r RC into a ratio.',
  ],
  variables: [
    vr('Vsec', 'V_sec', 'Secondary peak voltage', 'V', 1.5, 1000, { step: 0.5 }),
    vr('Vp', 'V_p', 'Output peak', 'V', 0.1, 1000),
    vr('fr', 'f_r', 'Ripple frequency', 'Hz', 1, 1e6, { step: 10 }),
    kohm('R', 'R', 'Load resistance'),
    vr('C', 'C', 'Capacitance', 'μF', 0.001, 1e6, { step: 10 }),
    vr('Vr', 'V_r', 'Ripple', 'V', 0, 1000),
    vr('Vdc', 'V_dc', 'Dc output', 'V', -1000, 1000),
  ],
  rules: [
    rule(
      'V_p = V_sec − 2 × 0.7 V',
      '{Vp} = {Vsec} − 2 × 0.7',
      ['Vp', 'Vsec'],
      (x) => x.Vp! - x.Vsec! + 1.4,
      {
        Vp: [(x) => x.Vsec! - 1.4, '{Vsec} − 2 × 0.7', 'Two diode drops come off the peak.'],
        Vsec: [(x) => x.Vp! + 1.4, '{Vp} + 2 × 0.7', 'Add the two drops back.'],
      },
    ),
    rule(
      'V_r = V_p ÷ (f_r RC)',
      '{Vr} = 1000 × {Vp} ÷ ({fr} × {R} × {C})',
      ['Vr', 'Vp', 'fr', 'R', 'C'],
      (x) => x.Vr! * x.fr! * x.R! * x.C! - 1000 * x.Vp!,
      {
        Vr: [
          (x) => div(1000 * x.Vp!, x.fr! * x.R! * x.C!),
          '1000 × {Vp} ÷ ({fr} × {R} × {C})',
          'C loses V_p ÷ (RC) a second for one ripple period.',
        ],
        C: [
          (x) => div(1000 * x.Vp!, x.fr! * x.R! * x.Vr!),
          '1000 × {Vp} ÷ ({fr} × {R} × {Vr})',
          'The capacitor that holds the ripple to this.',
        ],
      },
    ),
    rule(
      'V_dc = V_p − V_r ÷ 2',
      '{Vdc} = {Vp} − {Vr} ÷ 2',
      ['Vdc', 'Vp', 'Vr'],
      (x) => x.Vdc! - x.Vp! + x.Vr! / 2,
      {
        Vdc: [
          (x) => x.Vp! - x.Vr! / 2,
          '{Vp} − {Vr} ÷ 2',
          'The average sits halfway down the ripple.',
        ],
        Vr: [(x) => 2 * (x.Vp! - x.Vdc!), '2 × ({Vp} − {Vdc})', 'Twice the sag from the peak.'],
      },
    ),
  ],
  example: { Vsec: 12, Vp: 10.6, fr: 120, R: 1, C: 470, Vr: vr0, Vdc: 10.6 - vr0 / 2 },
  startWith: ['Vsec', 'fr', 'R', 'C'],
  representation: device({
    device: 'bridge',
    parts: ['Vsec', 'R', 'C'],
    values: { peak: 'Vp', ripple: 'Vr', dc: 'Vdc', frequency: 'fr' },
  }),
});

// electronics#1: voltage-divider bias

const bjtVars = () => [
  vr('VCC', 'V_CC', 'Supply voltage', 'V', 0.01, 100, { step: 0.5 }),
  kohm('R1', 'R₁', 'Upper divider resistor'),
  kohm('R2', 'R₂', 'Lower divider resistor'),
  kohm('RC', 'R_C', 'Collector resistor'),
  kohm('RE', 'R_E', 'Emitter resistor'),
  vr('VB', 'V_B', 'Base voltage', 'V', 0, 100),
  ma('IC', 'I_C', 'Collector current'),
  vr('VCE', 'V_CE', 'Collector–emitter voltage', 'V', -1000, 100),
];
const bjtRules = (): Rule[] => [
  rule(
    'V_B = V_CC R₂ ÷ (R₁ + R₂)',
    '{VB} = {VCC} × {R2} ÷ ({R1} + {R2})',
    ['VB', 'VCC', 'R1', 'R2'],
    (x) => x.VB! * (x.R1! + x.R2!) - x.VCC! * x.R2!,
    {
      VB: [
        (x) => div(x.VCC! * x.R2!, x.R1! + x.R2!),
        '{VCC} × {R2} ÷ ({R1} + {R2})',
        'The divider’s share of the supply.',
      ],
      VCC: [
        (x) => div(x.VB! * (x.R1! + x.R2!), x.R2!),
        '{VB} × ({R1} + {R2}) ÷ {R2}',
        'Scale the base voltage back up.',
      ],
    },
  ),
  rule(
    'I_C = (V_B − 0.7) ÷ R_E',
    '{IC} = ({VB} − 0.7) ÷ {RE}',
    ['IC', 'VB', 'RE'],
    (x) => x.IC! * x.RE! - x.VB! + 0.7,
    {
      IC: [
        (x) => div(x.VB! - 0.7, x.RE!),
        '({VB} − 0.7) ÷ {RE}',
        'The emitter sits 0.7 V under the base; I_E ≈ I_C.',
      ],
      VB: [(x) => x.IC! * x.RE! + 0.7, '{IC} × {RE} + 0.7', 'The emitter voltage plus V_BE.'],
      RE: [
        (x) => div(x.VB! - 0.7, x.IC!),
        '({VB} − 0.7) ÷ {IC}',
        'The emitter resistor that sets this current.',
      ],
    },
  ),
  rule(
    'V_CE = V_CC − I_C(R_C + R_E)',
    '{VCE} = {VCC} − {IC} × ({RC} + {RE})',
    ['VCE', 'VCC', 'IC', 'RC', 'RE'],
    (x) => x.VCE! - x.VCC! + x.IC! * (x.RC! + x.RE!),
    {
      VCE: [
        (x) => x.VCC! - x.IC! * (x.RC! + x.RE!),
        '{VCC} − {IC} × ({RC} + {RE})',
        'What R_C and R_E leave of the supply: mA × kΩ is V.',
      ],
      RC: [
        (x) => div(x.VCC! - x.VCE!, x.IC!)! - x.RE!,
        '({VCC} − {VCE}) ÷ {IC} − {RE}',
        'The collector resistor for this V_CE.',
      ],
    },
  ),
];
const active = limit(
  'the transistor is active',
  '{VCE} is above 0.2 V',
  ['VCE'],
  (x) => x.VCE! > 0.2,
  'Past this the transistor saturates; the active-mode formulas no longer hold.',
);
const bjtRep = device({
  device: 'bjtDivider',
  parts: ['VCC', 'R1', 'R2', 'RC', 'RE'],
  values: { base: 'VB', current: 'IC', vce: 'VCE' },
});

const bjt = demo({
  id: 'g.he-series-circuit-device-bjt-divider',
  title: 'Schematic: voltage-divider bias',
  use: 'Use this for “Find I_C and V_CE for the voltage-divider bias circuit.”',
  assumptions: [
    'Stiff divider: the base current is too small to load it (β large).',
    'V_BE = 0.7 V and I_E ≈ I_C. Resistors in kΩ, so currents are in mA.',
  ],
  variables: bjtVars(),
  rules: bjtRules(),
  limits: [active],
  example: { VCC: 12, R1: 40, R2: 10, RC: 3, RE: 1, VB: 2.4, IC: 1.7, VCE: 5.2 },
  startWith: ['VCC', 'R1', 'R2', 'RC', 'RE'],
  representation: bjtRep,
});

// The edge: a larger R_C leaves V_CE just above saturation.
const bjtEdge = demo({
  id: 'g.he-series-circuit-device-bjt-edge',
  title: 'Schematic: a BJT at the edge of saturation',
  use: 'Use this for “How large can R_C be before the voltage-divider BJT saturates?”',
  assumptions: [
    'Stiff divider, V_BE = 0.7 V, I_E ≈ I_C.',
    'Active only while V_CE stays above 0.2 V.',
  ],
  variables: bjtVars(),
  rules: bjtRules(),
  limits: [active],
  example: { VCC: 12, R1: 40, R2: 10, RC: 5.9, RE: 1, VB: 2.4, IC: 1.7, VCE: 12 - 1.7 * 6.9 },
  startWith: ['VCC', 'R1', 'R2', 'RC', 'RE'],
  representation: bjtRep,
});

// electronics#2~cs-mosfet

const mosfet = demo({
  id: 'g.he-series-circuit-device-mosfet-cs',
  title: 'Schematic: a common-source MOSFET amplifier',
  use: 'Use this for “A MOSFET biased at 0.5 mA with 0.25 V of overdrive drives 10 kΩ. Find g_m and the gain.”',
  assumptions: [
    'The MOSFET is in saturation, with small signals at the gate.',
    'The source is grounded (bypassed); r_o is ignored. mA ÷ V is mS, and mS × kΩ is a ratio.',
  ],
  variables: [
    ma('ID', 'I_D', 'Drain current', 0.001),
    vr('VOV', 'V_OV', 'Overdrive voltage', 'V', 0.001, 10, { step: 0.05 }),
    vr('gm', 'g_m', 'Transconductance', 'mS', 0.001, 1e5),
    kohm('RD', 'R_D', 'Drain resistor'),
    vr('Av', 'Aᵥ', 'Voltage gain', undefined, -1e6, 0),
  ],
  rules: [
    rule(
      'g_m = 2I_D ÷ V_OV',
      '{gm} = 2 × {ID} ÷ {VOV}',
      ['gm', 'ID', 'VOV'],
      (x) => x.gm! * x.VOV! - 2 * x.ID!,
      {
        gm: [
          (x) => div(2 * x.ID!, x.VOV!),
          '2 × {ID} ÷ {VOV}',
          'The slope of the square law at the bias point.',
        ],
        ID: [(x) => (x.gm! * x.VOV!) / 2, '{gm} × {VOV} ÷ 2', 'The bias current for this g_m.'],
        VOV: [(x) => div(2 * x.ID!, x.gm!), '2 × {ID} ÷ {gm}', 'The overdrive for this g_m.'],
      },
    ),
    rule(
      'A_v = −g_m R_D',
      '{Av} = −{gm} × {RD}',
      ['Av', 'gm', 'RD'],
      (x) => x.Av! + x.gm! * x.RD!,
      {
        Av: [
          (x) => -x.gm! * x.RD!,
          '−{gm} × {RD}',
          'The current swing g_m v_gs through R_D, inverted.',
        ],
        RD: [(x) => div(-x.Av!, x.gm!), '−{Av} ÷ {gm}', 'The drain resistor for this gain.'],
        gm: [(x) => div(-x.Av!, x.RD!), '−{Av} ÷ {RD}', 'The g_m this gain needs.'],
      },
    ),
  ],
  example: { ID: 0.5, VOV: 0.25, gm: 4, RD: 10, Av: -40 },
  startWith: ['ID', 'VOV', 'RD'],
  representation: device({
    device: 'mosfetCS',
    parts: ['RD'],
    values: { current: 'ID', overdrive: 'VOV', gm: 'gm', gain: 'Av' },
  }),
});

// electronics#2: the hybrid-π model

const gm0 = 1 / 0.02585;
const hybrid = demo({
  id: 'g.he-series-circuit-device-hybrid-pi',
  title: 'Schematic: the hybrid-π model',
  use: 'Use this for “A CE amplifier biased at I_C = 1 mA has R_C = R_L = 4 kΩ. Find the voltage gain.”',
  assumptions: [
    'V_T = 25.85 mV; small signals of a few mV at the base.',
    'The emitter is bypassed and r_o is ignored. mA ÷ V is mS; kΩ × mS is a ratio.',
  ],
  variables: [
    ma('IC', 'I_C', 'Collector current', 0.001),
    vr('beta', 'β', 'Current gain', undefined, 1, 10000, { step: 10 }),
    vr('gm', 'g_m', 'Transconductance', 'mS', 0.001, 1e6),
    vr('rpi', 'r_π', 'Input resistance', 'kΩ', 1e-6, 1e6),
    kohm('RC', 'R_C', 'Collector resistor'),
    kohm('RL', 'R_L', 'Load resistor'),
    vr('Rp', 'R_p', 'R_C ∥ R_L', 'kΩ', 1e-6, 1e6),
    vr('Av', 'Aᵥ', 'Voltage gain', undefined, -1e7, 0),
  ],
  rules: [
    rule('g_m = I_C ÷ V_T', '{gm} = {IC} ÷ 0.02585', ['gm', 'IC'], (x) => x.gm! * 0.02585 - x.IC!, {
      gm: [(x) => x.IC! / 0.02585, '{IC} ÷ 0.02585', 'Collector current over V_T: mA ÷ V is mS.'],
      IC: [(x) => x.gm! * 0.02585, '{gm} × 0.02585', 'The bias current for this g_m.'],
    }),
    rule(
      'r_π = β ÷ g_m',
      '{rpi} = {beta} ÷ {gm}',
      ['rpi', 'beta', 'gm'],
      (x) => x.rpi! * x.gm! - x.beta!,
      {
        rpi: [(x) => div(x.beta!, x.gm!), '{beta} ÷ {gm}', 'What the base sees: ÷ mS gives kΩ.'],
        beta: [(x) => x.rpi! * x.gm!, '{rpi} × {gm}', 'r_π times g_m.'],
      },
    ),
    rule(
      'R_p = R_C R_L ÷ (R_C + R_L)',
      '{Rp} = {RC} × {RL} ÷ ({RC} + {RL})',
      ['Rp', 'RC', 'RL'],
      (x) => x.Rp! * (x.RC! + x.RL!) - x.RC! * x.RL!,
      {
        Rp: [
          (x) => div(x.RC! * x.RL!, x.RC! + x.RL!),
          '{RC} × {RL} ÷ ({RC} + {RL})',
          'R_C and the load in parallel.',
        ],
        RL: [
          (x) => div(x.Rp! * x.RC!, x.RC! - x.Rp!),
          '{Rp} × {RC} ÷ ({RC} − {Rp})',
          'The load that gives this R_p.',
        ],
      },
    ),
    rule(
      'A_v = −g_m R_p',
      '{Av} = −{gm} × {Rp}',
      ['Av', 'gm', 'Rp'],
      (x) => x.Av! + x.gm! * x.Rp!,
      {
        Av: [(x) => -x.gm! * x.Rp!, '−{gm} × {Rp}', 'g_m v_π flows into R_p, inverted.'],
        Rp: [(x) => div(-x.Av!, x.gm!), '−{Av} ÷ {gm}', 'The load resistance this gain needs.'],
      },
    ),
  ],
  example: { IC: 1, beta: 100, gm: gm0, rpi: 100 / gm0, RC: 4, RL: 4, Rp: 2, Av: -2 * gm0 },
  startWith: ['IC', 'beta', 'RC', 'RL'],
  representation: device({
    device: 'hybridPi',
    parts: ['RC', 'RL'],
    values: { current: 'IC', beta: 'beta', gm: 'gm', rpi: 'rpi', rp: 'Rp', gain: 'Av' },
  }),
});

export const HE2D_GALLERY_MODULES: ModuleDef[] = [
  inverting,
  nonInverting,
  summing,
  difference,
  integrator,
  lowpass,
  schmitt,
  inamp,
  cmrr,
  atRail,
  diodeLoop,
  zenerReg,
  rectifier,
  bjt,
  mosfet,
  hybrid,
  bjtEdge,
];

export const HE2D_GALLERY_LAYOUTS: LayoutDef[] = [];

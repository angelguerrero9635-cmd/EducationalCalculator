/**
 * College gallery demos, round 2, group D (docs/RENDERINGS_HE.md). Each stands in for the
 * college page that waits, built from the plan's worked example. Spread into gallery.ts.
 *
 * HC18: op-amp circuits (`amp` on `seriesCircuit`), one demo per circuit from the circuits,
 * electronics and bioinstrumentation plans, and one at the edge (the output at the rail).
 */
import type { Relation, Values, VariableDef } from '@/engine/types';

import type { LayoutDef } from './layouts';
import type { ModuleDef } from './types';
import type { AmpSpec } from './typesHe2d';

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
];

export const HE2D_GALLERY_LAYOUTS: LayoutDef[] = [];

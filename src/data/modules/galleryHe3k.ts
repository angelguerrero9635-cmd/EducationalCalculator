/**
 * College gallery demos, round 3, group K (docs/RENDERINGS_HE.md). Each stands in for the
 * college page that waits, built from the plan's worked example. Spread into gallery.ts.
 *
 * HC91: `waterfall` `decibels` (EC-P12): a link budget, a link with its margin, a receiver's
 * noise floor under a signal, and gains of a two-stage amplifier in dB.
 */
import type { Relation, Values, VariableDef } from '@/engine/types';

import type { LayoutDef } from './layouts';
import { aliasOf, convolveAt, cosinePeriod, stepResponse } from '@/components/module/reps/he3kMath';

import type { ModuleDef, StepText } from './types';

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
const log10 = (x: number) => (x > 0 ? Math.log10(x) : undefined);

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

/** a = b + c + … − …, each term solvable: `terms` are [id, sign]. */
function sumRule(id: string, total: string, terms: [string, 1 | -1][], how: string) {
  const all = [total, ...terms.map(([t]) => t)];
  const text = (skip?: string) =>
    terms
      .filter(([t]) => t !== skip)
      .map(([t, s], i) =>
        i === 0 ? (s > 0 ? `{${t}}` : `−{${t}}`) : `${s > 0 ? '+' : '−'} {${t}}`,
      )
      .join(' ');
  const display = `{${total}} = ${text()}`;
  const solves: Record<string, [Solver, string, string]> = {
    [total]: [(v) => terms.reduce((a, [t, s]) => a + s * v[t]!, 0), text(), how],
  };
  for (const [t, s] of terms) {
    const rest = terms.filter(([u]) => u !== t);
    solves[t] = [
      (v) => s * (v[total]! - rest.reduce((a, [u, r]) => a + r * v[u]!, 0)),
      s > 0
        ? `{${total}}${rest.map(([u, r]) => ` ${r > 0 ? '−' : '+'} {${u}}`).join('')}`
        : `${rest.map(([u, r], i) => (i === 0 ? (r > 0 ? `{${u}}` : `−{${u}}`) : ` ${r > 0 ? '+' : '−'} {${u}}`)).join('')} − {${total}}`,
      'Move the other terms across: in dB, gains and losses add and subtract.',
    ];
  }
  return rule(
    id,
    display,
    all,
    (v) => v[total]! - terms.reduce((a, [t, s]) => a + s * v[t]!, 0),
    solves,
  );
}

// ─── HC91: a link budget (electromagnetics#3) ────────────────────────────────

const C_LIGHT = 3e8;

const LINK = [
  rule(
    'λ = c ÷ f',
    '{lambda} = 3 × 10⁸ ÷ ({f} × 10⁹)',
    ['lambda', 'f'],
    (v) => v.lambda! * v.f! * 1e9 - C_LIGHT,
    {
      lambda: [
        (v) => div(C_LIGHT, v.f! * 1e9),
        '3 × 10⁸ ÷ ({f} × 10⁹)',
        'The speed of light, 3.00 × 10⁸ m/s, over the frequency in hertz.',
      ],
      f: [
        (v) => div(C_LIGHT, v.lambda! * 1e9),
        '3 × 10⁸ ÷ ({lambda} × 10⁹)',
        'The speed of light over the wavelength, in GHz.',
      ],
    },
  ),
  rule(
    'L_fs = 20 log₁₀(4πd ÷ λ)',
    '{L} = 20 × log₁₀(4π × {d} × 1000 ÷ {lambda})',
    ['L', 'd', 'lambda'],
    (v) => v.L! - 20 * Math.log10((4 * Math.PI * v.d! * 1000) / v.lambda!),
    {
      L: [
        (v) => {
          const r = log10(div(4 * Math.PI * v.d! * 1000, v.lambda!) ?? NaN);
          return r === undefined ? undefined : 20 * r;
        },
        '20 × log₁₀(4π × {d} × 1000 ÷ {lambda})',
        'The distance in metres, times 4π, over the wavelength; 20 times its common log.',
      ],
      d: [
        (v) => div(v.lambda! * 10 ** (v.L! / 20), 4 * Math.PI * 1000),
        '{lambda} × 10^({L} ÷ 20) ÷ (4π × 1000)',
        'Undo the log: 10 to the L ÷ 20, times λ, over 4π, then metres to km.',
      ],
      lambda: [
        (v) => pos((4 * Math.PI * v.d! * 1000) / 10 ** (v.L! / 20)),
        '4π × {d} × 1000 ÷ 10^({L} ÷ 20)',
        'Undo the log: 4πd over 10 to the L ÷ 20.',
      ],
    },
  ),
  sumRule(
    'P_r = P_t + G_t + G_r − L_fs',
    'Pr',
    [
      ['Pt', 1],
      ['Gt', 1],
      ['Gr', 1],
      ['L', -1],
    ],
    'Add the gains to the power sent and take away the path loss, all in dB.',
  ),
];

const linkVars: VariableDef[] = [
  q('Pt', 'P_t', 'Transmit power', 'dBm', -30, 90, 0.1),
  q('Gt', 'G_t', 'Transmit antenna gain', 'dBi', -10, 70, 0.1),
  q('Gr', 'G_r', 'Receive antenna gain', 'dBi', -10, 70, 0.1),
  q('f', 'f', 'Frequency', 'GHz', 0.001, 300, 0.001),
  q('d', 'd', 'Distance', 'km', 0.001, 1e6, 0.001),
  q('lambda', 'λ', 'Wavelength', 'm', 1e-4, 300000, 0.0001),
  q('L', 'L_fs', 'Free-space path loss', 'dB', 0, 400, 0.1),
  q('Pr', 'P_r', 'Received power', 'dBm', -300, 200, 0.1),
];

const LINK_ASSUMPTIONS = [
  'Free space, far field, polarizations matched.',
  'Powers in dBm (dB above 1 mW), gains in dBi; c = 3.00 × 10⁸ m/s.',
];

function linkExample(Pt: number, Gt: number, Gr: number, f: number, d: number): Values {
  const lambda = C_LIGHT / (f * 1e9);
  const L = 20 * Math.log10((4 * Math.PI * d * 1000) / lambda);
  return { Pt, Gt, Gr, f, d, lambda, L, Pr: Pt + Gt + Gr - L };
}

const linkBudget: ModuleDef = {
  id: 'g.he-waterfall-link',
  title: 'Link budget: a 2.4 GHz link over 1 km',
  use: 'Use this for the received power of a radio link from the Friis equation, in dB.',
  assumptions: LINK_ASSUMPTIONS,
  variables: linkVars,
  ...rules(...LINK),
  example: linkExample(30, 3, 3, 2.4, 1),
  startWith: ['Pt', 'Gt', 'Gr', 'f', 'd'],
  representation: {
    kind: 'waterfall',
    items: [
      { var: 'Pt', sign: 1 },
      { var: 'Gt', sign: 1 },
      { var: 'Gr', sign: 1 },
      { var: 'L', sign: -1 },
    ],
    total: 'Pr',
    decibels: { level: true },
  },
};

const linkMargin: ModuleDef = {
  id: 'g.he-waterfall-link-margin',
  title: 'Link budget: 10 km, and the margin over the sensitivity',
  use: 'Use this for a link’s fade margin: the received power above the receiver’s sensitivity.',
  assumptions: [...LINK_ASSUMPTIONS, 'The sensitivity is the least power the receiver decodes.'],
  variables: [
    ...linkVars,
    q('S', 'P_min', 'Receiver sensitivity', 'dBm', -200, 50, 0.1),
    q('M', 'M', 'Link margin', 'dB', -200, 300, 0.1),
  ],
  ...rules(
    ...LINK,
    sumRule(
      'M = P_r − P_min',
      'M',
      [
        ['Pr', 1],
        ['S', -1],
      ],
      'The margin is how far the received power stands above the sensitivity.',
    ),
  ),
  example: (() => {
    const v = linkExample(30, 3, 3, 2.4, 10);
    return { ...v, S: -90, M: v.Pr! + 90 };
  })(),
  startWith: ['Pt', 'Gt', 'Gr', 'f', 'd', 'S'],
  representation: {
    kind: 'waterfall',
    items: [
      { var: 'Pt', sign: 1 },
      { var: 'Gt', sign: 1 },
      { var: 'Gr', sign: 1 },
      { var: 'L', sign: -1 },
    ],
    total: 'Pr',
    decibels: { level: true, floor: 'S', margin: 'M' },
  },
};

// ─── HC91: a receiver's noise floor (communication-systems#2) ────────────────

const K_B = 1.380649e-23;

const noiseFloor: ModuleDef = {
  id: 'g.he-waterfall-noise',
  title: 'Noise floor: kTB plus the noise figure, and the SNR',
  use: 'Use this for the noise floor of a receiver and the SNR of a signal above it.',
  assumptions: [
    'Thermal noise kTB at the input; T₀ = 290 K gives −174 dBm in each hertz.',
    'NF is the receiver’s noise figure; k = 1.380649 × 10⁻²³ J/K.',
  ],
  variables: [
    q('T', 'T', 'Noise temperature', 'K', 1, 10000, 1),
    q('B', 'B', 'Bandwidth', 'MHz', 1e-6, 10000, 0.000001),
    q('N', 'N', 'Thermal noise power kTB', 'dBm', -250, 50, 0.01),
    q('NF', 'NF', 'Noise figure', 'dB', 0, 40, 0.1),
    q('Pn', 'P_n', 'Noise floor', 'dBm', -250, 90, 0.01),
    q('Ps', 'P_s', 'Signal power', 'dBm', -250, 90, 0.1),
    q('SNR', 'SNR', 'Signal-to-noise ratio', 'dB', -100, 300, 0.01),
  ],
  ...rules(
    rule(
      'N = 10 log₁₀(kTB ÷ 1 mW)',
      '{N} = 10 × log₁₀(1.380649 × 10⁻²³ × {T} × {B} × 10⁶ ÷ 10⁻³)',
      ['N', 'T', 'B'],
      (v) => v.N! - 10 * Math.log10((K_B * v.T! * v.B! * 1e6) / 1e-3),
      {
        N: [
          (v) => {
            const r = log10((K_B * v.T! * v.B! * 1e6) / 1e-3);
            return r === undefined ? undefined : 10 * r;
          },
          '10 × log₁₀(1.380649 × 10⁻²³ × {T} × {B} × 10⁶ ÷ 10⁻³)',
          'kTB in watts (B in hertz), over 1 mW; 10 times its common log gives dBm.',
        ],
        T: [
          (v) => pos((10 ** (v.N! / 10) * 1e-3) / (K_B * v.B! * 1e6)),
          '10^({N} ÷ 10) × 10⁻³ ÷ (1.380649 × 10⁻²³ × {B} × 10⁶)',
          'Undo the dBm to watts, then divide by kB.',
        ],
        B: [
          (v) => pos((10 ** (v.N! / 10) * 1e-3) / (K_B * v.T! * 1e6)),
          '10^({N} ÷ 10) × 10⁻³ ÷ (1.380649 × 10⁻²³ × {T} × 10⁶)',
          'Undo the dBm to watts, then divide by kT (and hertz to MHz).',
        ],
      },
    ),
    sumRule(
      'P_n = N + NF',
      'Pn',
      [
        ['N', 1],
        ['NF', 1],
      ],
      'The receiver adds its noise figure to the thermal noise.',
    ),
    sumRule(
      'SNR = P_s − P_n',
      'SNR',
      [
        ['Ps', 1],
        ['Pn', -1],
      ],
      'The SNR in dB is how far the signal stands above the noise floor.',
    ),
  ),
  example: (() => {
    const N = 10 * Math.log10((K_B * 290 * 1e6) / 1e-3);
    return { T: 290, B: 1, N, NF: 6, Pn: N + 6, Ps: -90, SNR: -90 - (N + 6) };
  })(),
  startWith: ['T', 'B', 'NF', 'Ps'],
  representation: {
    kind: 'waterfall',
    items: [
      { var: 'N', sign: 1 },
      { var: 'NF', sign: 1 },
    ],
    total: 'Pn',
    decibels: { level: true, floor: 'Ps', margin: 'SNR' },
  },
};

// ─── HC91: cascaded gain in dB (electronics#2~cascade) ───────────────────────

const gainDb = (G: string, A: string, which: string) =>
  rule(
    `${G} = 20 log₁₀ ${A}`,
    `{${G}} = 20 × log₁₀({${A}})`,
    [G, A],
    (v) => v[G]! - 20 * Math.log10(v[A]!),
    {
      [G]: [
        (v) => {
          const r = log10(v[A]!);
          return r === undefined ? undefined : 20 * r;
        },
        `20 × log₁₀({${A}})`,
        `A voltage gain in dB is 20 times its common log (${which}).`,
      ],
      [A]: [(v) => 10 ** (v[G]! / 20), `10^({${G}} ÷ 20)`, 'Undo the log: 10 to the G ÷ 20.'],
    },
  );

const cascade: ModuleDef = {
  id: 'g.he-waterfall-cascade',
  title: 'Cascaded stages: gains multiply, decibels add',
  use: 'Use this for the overall gain of amplifier stages in a chain, as a ratio and in dB.',
  assumptions: [
    'Each gain is measured with the next stage connected (loading included).',
    'Voltage gains: G = 20 log₁₀ A.',
  ],
  variables: [
    q('A1', 'A_1', 'Voltage gain of stage 1', undefined, 0.001, 1e6, 0.001),
    q('A2', 'A_2', 'Voltage gain of stage 2', undefined, 0.001, 1e6, 0.001),
    q('A', 'A', 'Overall voltage gain', undefined, 1e-6, 1e12, 0.001),
    q('G1', 'G_1', 'Gain of stage 1', 'dB', -120, 120, 0.01),
    q('G2', 'G_2', 'Gain of stage 2', 'dB', -120, 120, 0.01),
    q('G', 'G', 'Overall gain', 'dB', -240, 240, 0.01),
  ],
  ...rules(
    gainDb('G1', 'A1', 'stage 1'),
    gainDb('G2', 'A2', 'stage 2'),
    rule('A = A₁A₂', '{A} = {A1} × {A2}', ['A', 'A1', 'A2'], (v) => v.A! - v.A1! * v.A2!, {
      A: [(v) => v.A1! * v.A2!, '{A1} × {A2}', 'Gains in a chain multiply.'],
      A1: [(v) => div(v.A!, v.A2!), '{A} ÷ {A2}', 'Divide the overall gain by stage 2’s.'],
      A2: [(v) => div(v.A!, v.A1!), '{A} ÷ {A1}', 'Divide the overall gain by stage 1’s.'],
    }),
    sumRule(
      'G = G₁ + G₂',
      'G',
      [
        ['G1', 1],
        ['G2', 1],
      ],
      'The log of a product is the sum of the logs: decibels add.',
    ),
  ),
  example: {
    A1: 20,
    A2: 50,
    A: 1000,
    G1: 20 * Math.log10(20),
    G2: 20 * Math.log10(50),
    G: 60,
  },
  startWith: ['A1', 'A2'],
  representation: {
    kind: 'waterfall',
    items: [
      { var: 'G1', sign: 1 },
      { var: 'G2', sign: 1 },
    ],
    total: 'G',
    decibels: true,
  },
};

// ─── HC86: a composite lamina (aerospace-structures#1) ───────────────────────

const VM = rule('V_m = 1 − V_f', '{Vm} = 1 − {Vf}', ['Vm', 'Vf'], (v) => v.Vm! + v.Vf! - 1, {
  Vm: [(v) => 1 - v.Vf!, '1 − {Vf}', 'With no voids, the matrix fills what the fibers leave.'],
  Vf: [(v) => 1 - v.Vm!, '1 − {Vm}', 'With no voids, the fibers fill what the matrix leaves.'],
});

/** a = b·V_f + c·V_m (the rule of mixtures), each part solvable. */
const mixture = (id: string, out: string, f: string, m: string, how: string) =>
  rule(
    id,
    `{${out}} = {${f}} × {Vf} + {${m}} × {Vm}`,
    [out, f, m, 'Vf', 'Vm'],
    (v) => v[out]! - (v[f]! * v.Vf! + v[m]! * v.Vm!),
    {
      [out]: [(v) => v[f]! * v.Vf! + v[m]! * v.Vm!, `{${f}} × {Vf} + {${m}} × {Vm}`, how],
      [f]: [
        (v) => div(v[out]! - v[m]! * v.Vm!, v.Vf!),
        `({${out}} − {${m}} × {Vm}) ÷ {Vf}`,
        'Take the matrix’s share away, then divide by V_f.',
      ],
      [m]: [
        (v) => div(v[out]! - v[f]! * v.Vf!, v.Vm!),
        `({${out}} − {${f}} × {Vf}) ÷ {Vm}`,
        'Take the fibers’ share away, then divide by V_m.',
      ],
    },
  );

const ALONG = mixture(
  'E₁ = E_fV_f + E_mV_m',
  'E1',
  'Ef',
  'Em',
  'Along the fibers both stretch alike, so their stiffnesses add by share (springs side by side).',
);

const ACROSS = rule(
  '1 ÷ E₂ = V_f ÷ E_f + V_m ÷ E_m',
  '1 ÷ {E2} = {Vf} ÷ {Ef} + {Vm} ÷ {Em}',
  ['E2', 'Vf', 'Ef', 'Vm', 'Em'],
  (v) => 1 / v.E2! - (v.Vf! / v.Ef! + v.Vm! / v.Em!),
  {
    E2: [
      (v) => pos(1 / (v.Vf! / v.Ef! + v.Vm! / v.Em!)),
      '1 ÷ ({Vf} ÷ {Ef} + {Vm} ÷ {Em})',
      'Across the fibers both carry the same stress, so their flexibilities add (springs in series).',
    ],
    Ef: [
      (v) => pos(v.Vf! / (1 / v.E2! - v.Vm! / v.Em!)),
      '{Vf} ÷ (1 ÷ {E2} − {Vm} ÷ {Em})',
      'Take the matrix’s flexibility from 1 ÷ E₂; V_f over what is left.',
    ],
    Em: [
      (v) => pos(v.Vm! / (1 / v.E2! - v.Vf! / v.Ef!)),
      '{Vm} ÷ (1 ÷ {E2} − {Vf} ÷ {Ef})',
      'Take the fibers’ flexibility from 1 ÷ E₂; V_m over what is left.',
    ],
  },
);

const moduli = (fiber: string): VariableDef[] => [
  q('Ef', 'E_f', `Fiber modulus (${fiber})`, 'GPa', 0.1, 1000, 0.1),
  q('Em', 'E_m', 'Matrix modulus (epoxy)', 'GPa', 0.1, 1000, 0.1),
  q('Vf', 'V_f', 'Fiber volume fraction', undefined, 0, 0.8, 0.01),
  q('Vm', 'V_m', 'Matrix volume fraction', undefined, 0.2, 1, 0.01, { derived: true }),
];

const LAMINA_ASSUMPTIONS = [
  'Fibers and matrix bonded perfectly; no voids.',
  'Each stays linear elastic; the fibers run one way.',
];

const FIBER_NAME = { carbon: 'carbon', glass: 'E-glass', aramid: 'aramid' } as const;

function laminaModule(
  id: string,
  title: string,
  use: string,
  load: 'along' | 'across',
  fiber: 'carbon' | 'glass' | 'aramid',
  Ef: number,
  Vf: number,
): ModuleDef {
  const Em = 3.5;
  const along = load === 'along';
  return {
    id,
    title,
    use,
    assumptions: [
      ...LAMINA_ASSUMPTIONS,
      along
        ? 'Along the fibers both stretch the same (iso-strain).'
        : 'Across the fibers both carry the same stress (iso-stress).',
    ],
    variables: [
      ...moduli(FIBER_NAME[fiber]),
      along
        ? q('E1', 'E_1', 'Modulus along the fibers', 'GPa', 0.1, 1000, 0.01)
        : q('E2', 'E_2', 'Modulus across the fibers', 'GPa', 0.1, 1000, 0.01),
    ],
    ...rules(VM, along ? ALONG : ACROSS),
    example: along
      ? { Ef, Em, Vf, Vm: 1 - Vf, E1: Ef * Vf + Em * (1 - Vf) }
      : { Ef, Em, Vf, Vm: 1 - Vf, E2: 1 / (Vf / Ef + (1 - Vf) / Em) },
    startWith: ['Ef', 'Em', 'Vf'],
    representation: {
      kind: 'lamina',
      load,
      fiber,
      Vf: 'Vf',
      Ef: 'Ef',
      Em: 'Em',
      ...(along ? { E1: 'E1' } : { E2: 'E2' }),
    },
  };
}

const laminaAlong = laminaModule(
  'g.he-lamina-along',
  'Carbon–epoxy lamina: the modulus along the fibers',
  'Use this for the longitudinal modulus of a fiber composite by the rule of mixtures.',
  'along',
  'carbon',
  230,
  0.6,
);

const laminaAcross = laminaModule(
  'g.he-lamina-across',
  'Carbon–epoxy lamina: the modulus across the fibers',
  'Use this for the transverse modulus of a fiber composite (springs in series).',
  'across',
  'carbon',
  230,
  0.6,
);

const laminaDense = laminaModule(
  'g.he-lamina-across-dense',
  'Glass–epoxy at 80% fiber: still soft across',
  'Use this for the transverse modulus of a tightly packed glass–epoxy lamina.',
  'across',
  'glass',
  72,
  0.8,
);

const laminaSparse = laminaModule(
  'g.he-lamina-along-sparse',
  'Aramid–epoxy at 10% fiber: a few fibers carry most of the load',
  'Use this for the longitudinal modulus of a lamina with few fibers.',
  'along',
  'aramid',
  124,
  0.1,
);

const laminaSpecific: ModuleDef = {
  id: 'g.he-lamina-specific',
  title: 'Carbon–epoxy: density and specific stiffness',
  use: 'Use this for a composite’s density and its stiffness per unit mass (E₁ ÷ ρ_c).',
  assumptions: [
    ...LAMINA_ASSUMPTIONS,
    'Along the fibers both stretch the same (iso-strain).',
    'GPa ÷ (g/cm³) is MN·m/kg; aluminum is about 26 MN·m/kg.',
  ],
  variables: [
    ...moduli('carbon'),
    q('E1', 'E_1', 'Modulus along the fibers', 'GPa', 0.1, 1000, 0.01),
    q('rf', 'ρ_f', 'Fiber density', 'g/cm³', 0.5, 25, 0.01),
    q('rm', 'ρ_m', 'Matrix density', 'g/cm³', 0.5, 25, 0.01),
    q('rc', 'ρ_c', 'Composite density', 'g/cm³', 0.5, 25, 0.001),
    q('s', 'E_1/ρ_c', 'Specific stiffness', 'MN·m/kg', 0.001, 2000, 0.01),
  ],
  ...rules(
    VM,
    ALONG,
    mixture(
      'ρ_c = ρ_fV_f + ρ_mV_m',
      'rc',
      'rf',
      'rm',
      'Mass adds by volume share: each part’s density times its fraction.',
    ),
    rule('E₁ ÷ ρ_c', '{s} = {E1} ÷ {rc}', ['s', 'E1', 'rc'], (v) => v.s! * v.rc! - v.E1!, {
      s: [(v) => div(v.E1!, v.rc!), '{E1} ÷ {rc}', 'Stiffness per unit mass: E₁ over the density.'],
      E1: [(v) => v.s! * v.rc!, '{s} × {rc}', 'Multiply the specific stiffness by the density.'],
      rc: [(v) => div(v.E1!, v.s!), '{E1} ÷ {s}', 'Divide E₁ by the specific stiffness.'],
    }),
  ),
  example: (() => {
    const v: Values = { Ef: 230, Em: 3.5, Vf: 0.6, Vm: 0.4, rf: 1.8, rm: 1.2 };
    v.E1 = 230 * 0.6 + 3.5 * 0.4;
    v.rc = 1.8 * 0.6 + 1.2 * 0.4;
    v.s = v.E1 / v.rc;
    return v;
  })(),
  startWith: ['Ef', 'Em', 'Vf', 'rf', 'rm'],
  representation: {
    kind: 'lamina',
    load: 'along',
    Vf: 'Vf',
    Ef: 'Ef',
    Em: 'Em',
    E1: 'E1',
    rho: { f: 'rf', m: 'rm', c: 'rc' },
    specific: 's',
  },
};

/** A page limit: `a` below `b` (checked, never solved). */
const below = (a: string, b: string, words: string): Relation => ({
  id: `${a} < ${b}`,
  constraint: true,
  display: words,
  vars: [a, b],
  residual: (v) => (v[a]! <= v[b]! ? 0 : 1),
  solve: {},
});

// ─── HC87: a rocket (propulsion#1) ───────────────────────────────────────────

const G0 = 9.81;

const withLimits = (r: ReturnType<typeof rules>, limits: Relation[]) => ({
  relations: [...limits, ...r.relations],
  steps: { ...r.steps, ...Object.fromEntries(limits.map((l) => [l.id, {}])) },
});

/** Δv = I_sp g ln(m₀ ÷ m_f) for the ids given, each solvable. */
const rocketEq = (id: string, dv: string, Isp: string, m0: string, mf: string) =>
  rule(
    id,
    `{${dv}} = {${Isp}} × 9.81 × ln({${m0}} ÷ {${mf}})`,
    [dv, Isp, m0, mf],
    (v) => v[dv]! - v[Isp]! * G0 * Math.log(v[m0]! / v[mf]!),
    {
      [dv]: [
        (v) => (v[m0]! > 0 && v[mf]! > 0 ? v[Isp]! * G0 * Math.log(v[m0]! / v[mf]!) : undefined),
        `{${Isp}} × 9.81 × ln({${m0}} ÷ {${mf}})`,
        'Integrate m dv = −v_e dm from m₀ to m_f; v_e is I_sp times g.',
      ],
      [Isp]: [
        (v) => div(v[dv]!, G0 * Math.log(v[m0]! / v[mf]!)),
        `{${dv}} ÷ (9.81 × ln({${m0}} ÷ {${mf}}))`,
        'Divide Δv by g times the log of the mass ratio.',
      ],
      [m0]: [
        (v) => v[mf]! * Math.exp(v[dv]! / (v[Isp]! * G0)),
        `{${mf}} × e^({${dv}} ÷ ({${Isp}} × 9.81))`,
        'Undo the log: the mass ratio is e to the Δv ÷ v_e.',
      ],
      [mf]: [
        (v) => v[m0]! / Math.exp(v[dv]! / (v[Isp]! * G0)),
        `{${m0}} ÷ e^({${dv}} ÷ ({${Isp}} × 9.81))`,
        'Undo the log: divide m₀ by e to the Δv ÷ v_e.',
      ],
    },
  );

const FRACTION = rule(
  'ζ = 1 − m_f ÷ m₀',
  '{zeta} = 1 − {mf} ÷ {m0}',
  ['zeta', 'mf', 'm0'],
  (v) => v.zeta! - (1 - v.mf! / v.m0!),
  {
    zeta: [
      (v) => (v.m0! > 0 ? 1 - v.mf! / v.m0! : undefined),
      '1 − {mf} ÷ {m0}',
      'The share of the starting mass that is propellant.',
    ],
    mf: [(v) => v.m0! * (1 - v.zeta!), '{m0} × (1 − {zeta})', 'What is left is the dry share.'],
    m0: [(v) => div(v.mf!, 1 - v.zeta!), '{mf} ÷ (1 − {zeta})', 'Divide m_f by the dry share.'],
  },
);

const ROCKET_ASSUMPTIONS = [
  'Ideal Δv: no gravity or drag losses.',
  'The exhaust speed is constant; g = 9.81 m/s² defines I_sp.',
];

function rocketMass(id: string, title: string, Isp: number, m0: number, mf: number): ModuleDef {
  return {
    id,
    title,
    use: 'Use this for a rocket’s Δv from I_sp and its masses, or the propellant a Δv needs.',
    assumptions: ROCKET_ASSUMPTIONS,
    variables: [
      q('Isp', 'I_sp', 'Specific impulse', 's', 100, 500, 0.1),
      q('m0', 'm_0', 'Initial mass', 't', 0.001, 1e5, 0.001),
      q('mf', 'm_f', 'Final (dry) mass', 't', 0.001, 1e5, 0.001),
      q('zeta', 'ζ', 'Propellant fraction', undefined, 0, 0.999, 0.001),
      q('dv', 'Δv', 'Ideal velocity change', 'm/s', 0, 30000, 1),
    ],
    ...withLimits(rules(rocketEq('Δv = I_sp g ln(m₀ ÷ m_f)', 'dv', 'Isp', 'm0', 'mf'), FRACTION), [
      below('mf', 'm0', '{mf} is at most {m0}: the rocket can’t gain mass'),
    ]),
    example: { Isp, m0, mf, zeta: 1 - mf / m0, dv: Isp * G0 * Math.log(m0 / mf) },
    startWith: ['Isp', 'm0', 'mf'],
    representation: {
      kind: 'rocket',
      Isp: 'Isp',
      m0: 'm0',
      mf: 'mf',
      dv: 'dv',
      fraction: 'zeta',
      g: G0,
    },
  };
}

const rocketMain = rocketMass(
  'g.he-rocket-mass',
  'The rocket equation: 300 s, 50 t down to 15 t',
  300,
  50,
  15,
);

const rocketHigh = rocketMass(
  'g.he-rocket-mass-high',
  'A hydrogen stage at 450 s, 92% propellant',
  450,
  100,
  8,
);

const thrustRule = rule(
  'F = ṁv_e + (p_e − p_a)A_e',
  '{F} = {mdot} × {ve} ÷ 1000 + ({pe} − {pa}) × {Ae}',
  ['F', 'mdot', 've', 'pe', 'pa', 'Ae'],
  (v) => v.F! - (v.mdot! * v.ve! * 0.001 + (v.pe! - v.pa!) * v.Ae!),
  {
    F: [
      (v) => v.mdot! * v.ve! * 0.001 + (v.pe! - v.pa!) * v.Ae!,
      '{mdot} × {ve} ÷ 1000 + ({pe} − {pa}) × {Ae}',
      'Momentum thrust in kN, plus the exit pressure’s push over the outside pressure, kPa × m².',
    ],
    mdot: [
      (v) => div((v.F! - (v.pe! - v.pa!) * v.Ae!) * 1000, v.ve!),
      '({F} − ({pe} − {pa}) × {Ae}) × 1000 ÷ {ve}',
      'Take the pressure term from F, then divide by v_e.',
    ],
    ve: [
      (v) => div((v.F! - (v.pe! - v.pa!) * v.Ae!) * 1000, v.mdot!),
      '({F} − ({pe} − {pa}) × {Ae}) × 1000 ÷ {mdot}',
      'Take the pressure term from F, then divide by ṁ.',
    ],
    pe: [
      (v) => (div(v.F! - v.mdot! * v.ve! * 0.001, v.Ae!) ?? NaN) + v.pa!,
      '({F} − {mdot} × {ve} ÷ 1000) ÷ {Ae} + {pa}',
      'Take the momentum thrust from F, divide by A_e and add p_a.',
    ],
    pa: [
      (v) => v.pe! - (div(v.F! - v.mdot! * v.ve! * 0.001, v.Ae!) ?? NaN),
      '{pe} − ({F} − {mdot} × {ve} ÷ 1000) ÷ {Ae}',
      'Take the momentum thrust from F, divide by A_e, and take that from p_e.',
    ],
    Ae: [
      (v) => pos((v.F! - v.mdot! * v.ve! * 0.001) / (v.pe! - v.pa!)),
      '({F} − {mdot} × {ve} ÷ 1000) ÷ ({pe} − {pa})',
      'Take the momentum thrust from F, then divide by the pressure difference.',
    ],
  },
);

const ispRule = rule(
  'I_sp = F ÷ (ṁg)',
  '{Isp} = {F} × 1000 ÷ ({mdot} × 9.81)',
  ['Isp', 'F', 'mdot'],
  (v) => v.Isp! * v.mdot! * G0 - v.F! * 1000,
  {
    Isp: [
      (v) => div(v.F! * 1000, v.mdot! * G0),
      '{F} × 1000 ÷ ({mdot} × 9.81)',
      'Thrust in newtons over the weight of propellant burned each second.',
    ],
    F: [
      (v) => (v.Isp! * v.mdot! * G0) / 1000,
      '{Isp} × {mdot} × 9.81 ÷ 1000',
      'F = I_sp ṁ g, in kN.',
    ],
    mdot: [
      (v) => div(v.F! * 1000, v.Isp! * G0),
      '{F} × 1000 ÷ ({Isp} × 9.81)',
      'Divide the thrust in newtons by I_sp g.',
    ],
  },
);

function rocketThrust(id: string, title: string, pa: number): ModuleDef {
  const v: Values = { mdot: 250, ve: 2900, pe: 70, pa, Ae: 1 };
  v.F = 250 * 2900 * 0.001 + (70 - pa) * 1;
  v.Isp = (v.F * 1000) / (250 * G0);
  return {
    id,
    title,
    use: 'Use this for a rocket’s thrust with the pressure term, and its specific impulse.',
    assumptions: [
      'Steady flow; the exit pressure is uniform over A_e.',
      'g = 9.81 m/s² defines I_sp.',
    ],
    variables: [
      q('mdot', 'ṁ', 'Mass flow', 'kg/s', 0.001, 1e5, 0.1),
      q('ve', 'v_e', 'Exhaust speed', 'm/s', 1, 10000, 1),
      q('pe', 'p_e', 'Exit pressure', 'kPa', 0, 10000, 0.001),
      q('pa', 'p_a', 'Outside pressure', 'kPa', 0, 200, 0.001),
      q('Ae', 'A_e', 'Exit area', 'm²', 0.0001, 100, 0.0001),
      q('F', 'F', 'Thrust', 'kN', -1e5, 1e6, 0.1),
      q('Isp', 'I_sp', 'Specific impulse', 's', -1e4, 10000, 0.1),
    ],
    ...rules(thrustRule, ispRule),
    example: v,
    startWith: ['mdot', 've', 'pe', 'pa', 'Ae'],
    representation: {
      kind: 'rocket',
      thrust: { mdot: 'mdot', ve: 've', pe: 'pe', pa: 'pa', Ae: 'Ae', F: 'F', Isp: 'Isp' },
      g: G0,
    },
  };
}

const rocketThrustSea = rocketThrust(
  'g.he-rocket-thrust',
  'Thrust at sea level: an over-expanded nozzle pulls back',
  101.325,
);

const rocketThrustVacuum = rocketThrust(
  'g.he-rocket-thrust-high',
  'The same engine high up, at 1.2 kPa: the pressure term pushes',
  1.2,
);

const rocketStages: ModuleDef = {
  id: 'g.he-rocket-stages',
  title: 'Two stages: drop the empty tanks, add the Δv',
  use: 'Use this for the total Δv of a two-stage rocket, each stage by the rocket equation.',
  assumptions: [
    ...ROCKET_ASSUMPTIONS,
    'Stage 1’s structure is dropped at burnout; stage 2’s m₀ is what is left.',
  ],
  variables: [
    q('Isp1', 'I_sp1', 'Specific impulse, stage 1', 's', 100, 500, 0.1),
    q('m01', 'm_01', 'Mass at lift-off', 't', 0.001, 1e5, 0.001),
    q('mf1', 'm_f1', 'Mass at stage 1 burnout', 't', 0.001, 1e5, 0.001),
    q('Isp2', 'I_sp2', 'Specific impulse, stage 2', 's', 100, 500, 0.1),
    q('m02', 'm_02', 'Mass at stage 2 ignition', 't', 0.001, 1e5, 0.001),
    q('mf2', 'm_f2', 'Mass at stage 2 burnout', 't', 0.001, 1e5, 0.001),
    q('dv1', 'Δv_1', 'Δv of stage 1', 'm/s', 0, 30000, 1),
    q('dv2', 'Δv_2', 'Δv of stage 2', 'm/s', 0, 30000, 1),
    q('dv', 'Δv', 'Total Δv', 'm/s', 0, 60000, 1),
  ],
  ...withLimits(
    rules(
      rocketEq('Δv₁ = I_sp1 g ln(m₀₁ ÷ m_f1)', 'dv1', 'Isp1', 'm01', 'mf1'),
      rocketEq('Δv₂ = I_sp2 g ln(m₀₂ ÷ m_f2)', 'dv2', 'Isp2', 'm02', 'mf2'),
      sumRule(
        'Δv = Δv₁ + Δv₂',
        'dv',
        [
          ['dv1', 1],
          ['dv2', 1],
        ],
        'Each stage adds its own Δv.',
      ),
    ),
    [
      below('mf1', 'm01', '{mf1} is at most {m01}'),
      below('mf2', 'm02', '{mf2} is at most {m02}'),
      below('m02', 'mf1', 'Stage 2 ({m02}) is what is left of {mf1} when stage 1 drops'),
    ],
  ),
  example: (() => {
    const v: Values = { Isp1: 300, m01: 120, mf1: 50, Isp2: 340, m02: 30, mf2: 10 };
    v.dv1 = 300 * G0 * Math.log(120 / 50);
    v.dv2 = 340 * G0 * Math.log(30 / 10);
    v.dv = v.dv1 + v.dv2;
    return v;
  })(),
  startWith: ['Isp1', 'm01', 'mf1', 'Isp2', 'm02', 'mf2'],
  representation: {
    kind: 'rocket',
    stages: [
      { Isp: 'Isp1', m0: 'm01', mf: 'mf1', dv: 'dv1' },
      { Isp: 'Isp2', m0: 'm02', mf: 'mf2', dv: 'dv2' },
    ],
    dv: 'dv',
    g: G0,
  },
};

// ─── HC62: a diode and a resistor (electronics#0) ────────────────────────────

const DIODE_DROP = [
  sumRule(
    'V_R = V_s − V_D',
    'VR',
    [
      ['Vs', 1],
      ['VD', -1],
    ],
    'The resistor takes what the source gives beyond the diode’s drop (KVL).',
  ),
  rule('I = V_R ÷ R', '{I} = {VR} ÷ {R}', ['I', 'VR', 'R'], (v) => v.I! * v.R! - v.VR!, {
    I: [
      (v) => div(v.VR!, v.R!),
      '{VR} ÷ {R}',
      'Ohm’s law on the resistor: volts over kΩ gives mA.',
    ],
    VR: [(v) => v.I! * v.R!, '{I} × {R}', 'Ohm’s law: mA times kΩ gives volts.'],
    R: [(v) => div(v.VR!, v.I!), '{VR} ÷ {I}', 'Ohm’s law: volts over mA gives kΩ.'],
  }),
  rule('P_D = V_D I', '{PD} = {VD} × {I}', ['PD', 'VD', 'I'], (v) => v.PD! - v.VD! * v.I!, {
    PD: [
      (v) => v.VD! * v.I!,
      '{VD} × {I}',
      'The diode’s power: its drop times its current (V × mA = mW).',
    ],
    VD: [(v) => div(v.PD!, v.I!), '{PD} ÷ {I}', 'Divide the power by the current.'],
    I: [(v) => div(v.PD!, v.VD!), '{PD} ÷ {VD}', 'Divide the power by the drop.'],
  }),
];

function diodeDrop(id: string, title: string, Vs: number, VD: number, R: number): ModuleDef {
  const I = (Vs - VD) / R;
  return {
    id,
    title,
    use: 'Use this for the current through a diode and resistor in series, constant-drop model.',
    assumptions: [
      'Constant-drop model: no current below V_D, then V_D whatever the current.',
      'The diode points with the current.',
    ],
    variables: [
      q('Vs', 'V_s', 'Source voltage', 'V', 0, 1000, 0.01),
      q('VD', 'V_D', 'Diode drop', 'V', 0.2, 3.5, 0.01),
      q('R', 'R', 'Resistance', 'kΩ', 0.001, 10000, 0.001),
      q('VR', 'V_R', 'Resistor voltage', 'V', 0, 1000, 0.01),
      q('I', 'I', 'Current', 'mA', 0, 1e6, 0.001),
      q('PD', 'P_D', 'Diode power', 'mW', 0, 1e7, 0.001),
    ],
    ...withLimits(rules(...DIODE_DROP), [
      below('VD', 'Vs', '{VD} is below {Vs}: below its drop the diode is off'),
    ]),
    example: { Vs, VD, R, VR: Vs - VD, I, PD: VD * I },
    startWith: ['Vs', 'VD', 'R'],
    representation: {
      kind: 'deviceCurves',
      device: 'diode',
      model: 'drop',
      Vs: 'Vs',
      VD: 'VD',
      R: 'R',
      I: 'I',
    },
  };
}

const diodeMain = diodeDrop(
  'g.he-deviceCurves-diode',
  'A silicon diode and 1 kΩ on 5 V: the load line',
  5,
  0.7,
  1,
);

const diodeLed = diodeDrop(
  'g.he-deviceCurves-led',
  'A blue LED on 3.3 V: just above its drop',
  3.3,
  3,
  0.015,
);

// ─── HC62: Shockley's equation (electronics#0~shockley) ──────────────────────

const SHOCKLEY = rule(
  'I = I_S(e^(V ÷ nV_T) − 1)',
  '{I} = {Is} × (e^({V} ÷ ({n} × {VT})) − 1)',
  ['I', 'Is', 'V', 'n', 'VT'],
  (v) => v.I! / v.Is! - (Math.exp(v.V! / (v.n! * v.VT!)) - 1),
  {
    I: [
      (v) => v.Is! * (Math.exp(v.V! / (v.n! * v.VT!)) - 1),
      '{Is} × (e^({V} ÷ ({n} × {VT})) − 1)',
      'Shockley’s equation: the current grows tenfold every nV_T ln 10 volts.',
    ],
    Is: [
      (v) => div(v.I!, Math.exp(v.V! / (v.n! * v.VT!)) - 1),
      '{I} ÷ (e^({V} ÷ ({n} × {VT})) − 1)',
      'Divide the current by the exponential part.',
    ],
    V: [
      (v) => v.n! * v.VT! * Math.log(v.I! / v.Is! + 1),
      '{n} × {VT} × ln({I} ÷ {Is} + 1)',
      'Undo the exponential with a natural log.',
    ],
  },
);

const DECADE = rule(
  'ΔV = nV_T ln 10',
  '{dV} = {n} × {VT} × ln(10)',
  ['dV', 'n', 'VT'],
  (v) => v.dV! - v.n! * v.VT! * Math.log(10),
  {
    dV: [
      (v) => v.n! * v.VT! * Math.log(10),
      '{n} × {VT} × ln(10)',
      'Ten times the current: ΔV = nV_T ln(I₂ ÷ I₁) with the ratio 10.',
    ],
    n: [
      (v) => div(v.dV!, v.VT! * Math.log(10)),
      '{dV} ÷ ({VT} × ln(10))',
      'Divide ΔV by V_T ln 10.',
    ],
    VT: [(v) => div(v.dV!, v.n! * Math.log(10)), '{dV} ÷ ({n} × ln(10))', 'Divide ΔV by n ln 10.'],
  },
);

function diodeShockley(id: string, title: string, Is: number, n: number, V: number): ModuleDef {
  const VT = 0.02585;
  return {
    id,
    title,
    use: 'Use this for a diode’s current from Shockley’s equation, and the volts per decade of current.',
    assumptions: [
      'V_T = kT ÷ q = 25.85 mV at 300 K.',
      'Forward bias well above V_T, so the −1 hardly matters.',
    ],
    variables: [
      q('Is', 'I_S', 'Saturation current', 'A', 1e-18, 1e-6, 1e-18, { scientific: true }),
      q('n', 'n', 'Ideality factor', undefined, 1, 2, 0.01),
      q('VT', 'V_T', 'Thermal voltage', 'V', 0.001, 0.1, 0.00001, {
        units: ['V', 'mV'],
        shownIn: 'mV',
      }),
      q('V', 'V', 'Diode voltage', 'V', 0, 2, 0.001),
      q('I', 'I', 'Diode current', 'A', 0, 100, 1e-9, { units: ['A', 'mA'], shownIn: 'mA' }),
      q('dV', 'ΔV', 'Voltage for ten times the current', 'V', 0, 1, 0.0001, {
        units: ['V', 'mV'],
        shownIn: 'mV',
      }),
    ],
    ...rules(SHOCKLEY, DECADE),
    example: { Is, n, VT, V, I: Is * (Math.exp(V / (n * VT)) - 1), dV: n * VT * Math.log(10) },
    startWith: ['Is', 'n', 'VT', 'V'],
    representation: {
      kind: 'deviceCurves',
      device: 'diode',
      model: 'shockley',
      Is: 'Is',
      n: 'n',
      VT: 'VT',
      V: 'V',
      I: 'I',
      decade: 'dV',
    },
  };
}

const diodeShockleyMain = diodeShockley(
  'g.he-deviceCurves-shockley',
  'Shockley’s equation: 0.65 V across a small silicon diode',
  1e-14,
  1,
  0.65,
);

const diodeShockleyN2 = diodeShockley(
  'g.he-deviceCurves-shockley-n2',
  'An ideality factor of 2: twice the volts per decade',
  1e-9,
  2,
  0.7,
);

// ─── HC62: MOSFET output curves (electronics#1~mosfet-sat, ~mosfet-triode) ───

const OVERDRIVE = sumRule(
  'V_OV = V_GS − V_t',
  'Vov',
  [
    ['Vgs', 1],
    ['Vt', -1],
  ],
  'The overdrive is how far V_GS stands above the threshold.',
);

const SATURATION = rule(
  'I_D = ½k_nV_OV²',
  '{Id} = ½ × {kn} × {Vov}²',
  ['Id', 'kn', 'Vov'],
  (v) => v.Id! - 0.5 * v.kn! * v.Vov! ** 2,
  {
    Id: [
      (v) => 0.5 * v.kn! * v.Vov! ** 2,
      '½ × {kn} × {Vov}²',
      'In saturation the current depends on V_OV only (mA/V² × V² = mA).',
    ],
    kn: [
      (v) => div(2 * v.Id!, v.Vov! ** 2),
      '2 × {Id} ÷ {Vov}²',
      'Double I_D, then divide by V_OV².',
    ],
    Vov: [(v) => pos(Math.sqrt((2 * v.Id!) / v.kn!)), '√(2 × {Id} ÷ {kn})', 'Undo the square.'],
  },
);

const TRIODE = rule(
  'I_D = k_n(V_OVV_DS − ½V_DS²)',
  '{Id} = {kn} × ({Vov} × {Vds} − ½ × {Vds}²)',
  ['Id', 'kn', 'Vov', 'Vds'],
  (v) => v.Id! - v.kn! * (v.Vov! * v.Vds! - 0.5 * v.Vds! ** 2),
  {
    Id: [
      (v) => v.kn! * (v.Vov! * v.Vds! - 0.5 * v.Vds! ** 2),
      '{kn} × ({Vov} × {Vds} − ½ × {Vds}²)',
      'Below V_OV the channel is open all along: the triode formula.',
    ],
    kn: [
      (v) => div(v.Id!, v.Vov! * v.Vds! - 0.5 * v.Vds! ** 2),
      '{Id} ÷ ({Vov} × {Vds} − ½ × {Vds}²)',
      'Divide I_D by the bracket.',
    ],
    Vov: [
      (v) => div(v.Id! / v.kn! + 0.5 * v.Vds! ** 2, v.Vds!),
      '({Id} ÷ {kn} + ½ × {Vds}²) ÷ {Vds}',
      'Undo the bracket: add ½V_DS², divide by V_DS.',
    ],
  },
);

const mosVars = (): VariableDef[] => [
  q('kn', 'k_n', 'Process transconductance × W/L', 'mA/V²', 0.01, 100, 0.01),
  q('Vgs', 'V_GS', 'Gate–source voltage', 'V', 0, 20, 0.01),
  q('Vt', 'V_t', 'Threshold voltage', 'V', 0.1, 5, 0.01),
  q('Vov', 'V_OV', 'Overdrive', 'V', 0.001, 20, 0.001),
  q('Id', 'I_D', 'Drain current', 'mA', 0, 1e4, 0.001),
];

const MOS_ASSUMPTIONS = [
  'k_n = μₙC_ox W/L (texts writing I_D = KV_OV² use K = k_n ÷ 2).',
  'No channel-length modulation: the saturation curves are flat.',
];

const mosfetSat: ModuleDef = {
  id: 'g.he-deviceCurves-mosfet-sat',
  title: 'MOSFET in saturation: I_D from the overdrive',
  use: 'Use this for an n-channel MOSFET’s drain current in saturation, and the least V_DS that keeps it there.',
  assumptions: MOS_ASSUMPTIONS,
  variables: mosVars(),
  ...withLimits(rules(OVERDRIVE, SATURATION), [
    below('Vt', 'Vgs', '{Vgs} is above {Vt}: a channel forms'),
  ]),
  example: { kn: 2, Vgs: 3, Vt: 1, Vov: 2, Id: 4 },
  startWith: ['kn', 'Vgs', 'Vt'],
  representation: {
    kind: 'deviceCurves',
    device: 'mosfet',
    kn: 'kn',
    Vgs: 'Vgs',
    Vt: 'Vt',
    Vov: 'Vov',
    Id: 'Id',
  },
};

const mosfetTriode: ModuleDef = {
  id: 'g.he-deviceCurves-mosfet-triode',
  title: 'MOSFET in triode: V_DS below the overdrive',
  use: 'Use this for an n-channel MOSFET’s drain current when V_DS is below V_GS − V_t.',
  assumptions: MOS_ASSUMPTIONS,
  variables: [...mosVars(), q('Vds', 'V_DS', 'Drain–source voltage', 'V', 0.001, 50, 0.001)],
  ...withLimits(rules(OVERDRIVE, TRIODE), [
    below('Vt', 'Vgs', '{Vgs} is above {Vt}: a channel forms'),
    below('Vds', 'Vov', '{Vds} is below {Vov}: still in triode'),
  ]),
  example: { kn: 2, Vgs: 3, Vt: 1, Vov: 2, Vds: 0.5, Id: 2 * (2 * 0.5 - 0.125) },
  startWith: ['kn', 'Vgs', 'Vt', 'Vds'],
  representation: {
    kind: 'deviceCurves',
    device: 'mosfet',
    kn: 'kn',
    Vgs: 'Vgs',
    Vt: 'Vt',
    Vov: 'Vov',
    Vds: 'Vds',
    Id: 'Id',
  },
};

// ─── HC63: a periodic discrete cosine (signals-systems#0~discrete-period) ────

const cosineModule = (id: string, title: string, k: number, N: number): ModuleDef => ({
  id,
  title,
  use: 'Use this for the period of cos(Ω₀n) when Ω₀ = 2πk ÷ N.',
  assumptions: [
    'k and N are whole numbers; the period is N once k ÷ N is in lowest terms.',
    'When Ω₀ ÷ 2π is irrational, cos(Ω₀n) never repeats.',
  ],
  variables: [
    q('k', 'k', 'Cycles in N samples', undefined, 1, 100, 1, { integer: true }),
    q('N', 'N', 'Samples', undefined, 1, 100, 1, { integer: true }),
    q('W', 'Ω_0', 'Frequency', 'rad/sample', 0, 700, 0.0001, { derived: true }),
    q('P', 'N_0', 'Period', 'samples', 1, 100, 1, { integer: true, derived: true }),
  ],
  ...rules(
    rule(
      'Ω₀ = 2πk ÷ N',
      '{W} = 2π × {k} ÷ {N}',
      ['W', 'k', 'N'],
      (v) => v.W! * v.N! - 2 * Math.PI * v.k!,
      {
        W: [
          (v) => div(2 * Math.PI * v.k!, v.N!),
          '2π × {k} ÷ {N}',
          'k full turns spread over N samples.',
        ],
      },
    ),
    rule(
      'N₀ = N ÷ gcd(k, N)',
      '{P} = {N} ÷ gcd({k}, {N})',
      ['P', 'N', 'k'],
      (v) => v.P! - cosinePeriod(v.k!, v.N!),
      {
        P: [
          (v) => (v.N! >= 1 && v.k! >= 1 ? cosinePeriod(v.k!, v.N!) : undefined),
          '{N} ÷ gcd({k}, {N})',
          'Put k ÷ N in lowest terms: the period is what is left of N.',
        ],
      },
    ),
  ),
  example: { k, N, W: (2 * Math.PI * k) / N, P: cosinePeriod(k, N) },
  startWith: ['k', 'N'],
  representation: { kind: 'stemPlot', cosine: { k: 'k', N: 'N', period: 'P' } },
});

const stemCosine = cosineModule('g.he-stemPlot-cosine', 'cos(3πn ÷ 4): period 8', 3, 8);

const stemCosineReduce = cosineModule(
  'g.he-stemPlot-cosine-lowest',
  'k ÷ N = 6 ÷ 16 is 3 ÷ 8: period 8, not 16',
  6,
  16,
);

// ─── HC63: a first-order difference equation (signals-systems#3~difference-eq)

const STEP = [
  rule(
    'y[n] = (1 − αⁿ⁺¹) ÷ (1 − α)',
    '{y} = (1 − {a}^({n} + 1)) ÷ (1 − {a})',
    ['y', 'a', 'n'],
    (v) => v.y! - stepResponse(v.a!, v.n!),
    {
      y: [
        (v) => (v.a === 1 ? undefined : stepResponse(v.a!, v.n!)),
        '(1 − {a}^({n} + 1)) ÷ (1 − {a})',
        'Each step adds αⁿ more: 1 + α + … + αⁿ, a geometric sum.',
      ],
    },
  ),
  rule('y[∞] = 1 ÷ (1 − α)', '{yf} = 1 ÷ (1 − {a})', ['yf', 'a'], (v) => v.yf! * (1 - v.a!) - 1, {
    yf: [
      (v) => div(1, 1 - v.a!),
      '1 ÷ (1 − {a})',
      'The sum of all the αⁿ, when |α| < 1: H(1) for H(z) = z ÷ (z − α).',
    ],
    a: [(v) => 1 - 1 / v.yf!, '1 − 1 ÷ {yf}', 'Undo the fraction.'],
  }),
];

const recursiveModule = (id: string, title: string, a: number, n: number): ModuleDef => ({
  id,
  title,
  use: 'Use this for the step response of y[n] = αy[n − 1] + x[n] at a sample n, and its final value.',
  assumptions: ['The input is the unit step u[n]; y[−1] = 0.', '|α| < 1, so the output settles.'],
  variables: [
    q('a', 'α', 'Feedback coefficient', undefined, -0.99, 0.99, 0.01),
    q('n', 'n', 'Sample', undefined, 0, 20, 1, { integer: true }),
    q('y', 'y[n]', 'Output at n', undefined, -1000, 1000, 0.0001),
    q('yf', 'y[∞]', 'Final value', undefined, 0, 1000, 0.0001),
  ],
  ...rules(...STEP),
  example: { a, n, y: stepResponse(a, n), yf: 1 / (1 - a) },
  startWith: ['a', 'n'],
  representation: { kind: 'stemPlot', recursive: { alpha: 'a', n: 'n', y: 'y', final: 'yf' } },
});

const stemRecursive = recursiveModule(
  'g.he-stemPlot-recursive',
  'y[n] = 0.5y[n − 1] + u[n]: climbing to 2',
  0.5,
  3,
);

const stemRecursiveNegative = recursiveModule(
  'g.he-stemPlot-recursive-negative',
  'α = −0.8: the step response rings as it settles',
  -0.8,
  5,
);

// ─── HC63: convolution of short sequences (signals-systems#1) ────────────────

/** y[m] = Σ x[k]h[m − k] over the pairs that line up: a relation linear in each sample. */
function convolveRule(m: number) {
  const pairs = [0, 1, 2]
    .filter((k) => m - k >= 0 && m - k <= 2)
    .map((k) => [`x${k}`, `h${m - k}`] as const);
  const y = `y${m}`;
  const sum = (v: Values) => pairs.reduce((a, [p, r]) => a + v[p]! * v[r]!, 0);
  const text = pairs.map(([p, r]) => `{${p}} × {${r}}`).join(' + ');
  const solves: Record<string, [Solver, string, string]> = {
    [y]: [sum, text, `Flip h, slide it to n = ${m}, multiply the samples that line up, and add.`],
  };
  for (const [p, r] of pairs)
    for (const [id, partner] of [
      [p, r],
      [r, p],
    ] as const) {
      const others = pairs.filter(([a]) => a !== p);
      solves[id] = [
        (v) => div(v[y]! - others.reduce((a, [a1, b1]) => a + v[a1]! * v[b1]!, 0), v[partner]!),
        `({${y}}${others.map(([a1, b1]) => ` − {${a1}} × {${b1}}`).join('')}) ÷ {${partner}}`,
        'Take the other products away, then divide by its partner.',
      ];
    }
  return rule(
    `y[${m}] = Σ x[k]h[${m} − k]`,
    `{${y}} = ${text}`,
    [y, ...pairs.flat()],
    (v) => v[y]! - sum(v),
    solves,
  );
}

const CONVOLVE = rules(...[0, 1, 2, 3, 4].map(convolveRule));

const convolveModule = (
  id: string,
  title: string,
  x: [number, number, number],
  h: [number, number, number],
  n: number,
): ModuleDef => {
  const ids = ['x0', 'x1', 'x2', 'h0', 'h1', 'h2'];
  const y = [0, 1, 2, 3, 4].map((m) => convolveAt(x, h, m).sum);
  return {
    id,
    title,
    use: 'Use this for the convolution of two three-sample sequences, one output sample at a time.',
    assumptions: [
      'Both sequences are 0 outside n = 0, 1, 2, so y has 3 + 3 − 1 = 5 samples.',
      'Check: the sum of y is the sum of x times the sum of h.',
    ],
    standalone: { vars: ['n'], why: 'n picks the output sample the picture slides h to.' },
    variables: [
      ...ids.map((s) =>
        q(
          s,
          `${s[0]}[${s[1]}]`,
          `${s[0] === 'x' ? 'Input' : 'Impulse response'} at ${s[1]}`,
          undefined,
          -100,
          100,
          0.01,
          { group: s[0] },
        ),
      ),
      ...[0, 1, 2, 3, 4].map((m) =>
        q(`y${m}`, `y[${m}]`, `Output at ${m}`, undefined, -1e5, 1e5, 0.0001, { group: 'y' }),
      ),
      q('n', 'n', 'Sample shown', undefined, 0, 4, 1, { integer: true }),
    ],
    ...CONVOLVE,
    example: {
      x0: x[0],
      x1: x[1],
      x2: x[2],
      h0: h[0],
      h1: h[1],
      h2: h[2],
      n,
      ...Object.fromEntries(y.map((v, m) => [`y${m}`, v])),
    },
    startWith: [...ids, 'n'],
    representation: {
      kind: 'stemPlot',
      convolve: {
        x: ['x0', 'x1', 'x2'],
        h: ['h0', 'h1', 'h2'],
        n: 'n',
        ys: ['y0', 'y1', 'y2', 'y3', 'y4'],
      },
    },
  };
};

const stemConvolve = convolveModule(
  'g.he-stemPlot-convolve',
  'Convolving {1, 2, 3} with {1, 1, 2}: y[2]',
  [1, 2, 3],
  [1, 1, 2],
  2,
);

const stemConvolveSigned = convolveModule(
  'g.he-stemPlot-convolve-signed',
  'Signed samples: {2, −1, 3} with {1, −2, 1} at n = 1',
  [2, -1, 3],
  [1, -2, 1],
  1,
);

// ─── HC63: sampling and aliasing (signals-systems#4) ─────────────────────────

const ALIAS = [
  rule('f_N = f_s ÷ 2', '{fN} = {fs} ÷ 2', ['fN', 'fs'], (v) => v.fN! * 2 - v.fs!, {
    fN: [(v) => v.fs! / 2, '{fs} ÷ 2', 'The highest frequency the samples can show.'],
    fs: [(v) => v.fN! * 2, '2 × {fN}', 'Twice the Nyquist frequency.'],
  }),
  rule('Nyquist rate = 2f', '{fR} = 2 × {f}', ['fR', 'f'], (v) => v.fR! - 2 * v.f!, {
    fR: [(v) => 2 * v.f!, '2 × {f}', 'To capture f, sample faster than twice it.'],
    f: [(v) => v.fR! / 2, '{fR} ÷ 2', 'Half the Nyquist rate.'],
  }),
  rule(
    'f_a = |f − f_s round(f ÷ f_s)|',
    '{fa} = |{f} − {fs} × round({f} ÷ {fs})|',
    ['fa', 'f', 'fs'],
    (v) => v.fa! - aliasOf(v.f!, v.fs!),
    {
      fa: [
        (v) => (v.fs! > 0 ? aliasOf(v.f!, v.fs!) : undefined),
        '|{f} − {fs} × round({f} ÷ {fs})|',
        'Take away the nearest whole number of f_s: what is left is what the samples show.',
      ],
    },
  ),
];

const sampledModule = (id: string, title: string, f: number, fs: number): ModuleDef => ({
  id,
  title,
  use: 'Use this for the Nyquist rate of a tone and the alias it shows when sampled too slowly.',
  assumptions: [
    'A pure tone, cos(2πft).',
    'The alias is the frequency from 0 to f_s ÷ 2 the samples can’t tell from f.',
  ],
  variables: [
    q('f', 'f', 'Tone frequency', 'kHz', 0.001, 1e6, 0.001),
    q('fs', 'f_s', 'Sampling rate', 'kHz', 0.001, 1e6, 0.001),
    q('fN', 'f_N', 'Nyquist frequency', 'kHz', 0.0005, 5e5, 0.0005),
    q('fR', 'f_R', 'Nyquist rate', 'kHz', 0.002, 2e6, 0.001),
    q('fa', 'f_a', 'Alias frequency', 'kHz', 0, 5e5, 0.001, { derived: true }),
  ],
  ...rules(...ALIAS),
  example: { f, fs, fN: fs / 2, fR: 2 * f, fa: aliasOf(f, fs) },
  startWith: ['f', 'fs'],
  representation: { kind: 'stemPlot', sampled: { f: 'f', fs: 'fs', alias: 'fa' } },
});

const stemSampled = sampledModule(
  'g.he-stemPlot-sampled',
  'A 5 kHz tone sampled at 8 kHz shows up at 3 kHz',
  5,
  8,
);

const stemSampledClean = sampledModule(
  'g.he-stemPlot-sampled-clean',
  'A 1 kHz tone sampled at 8 kHz: no alias',
  1,
  8,
);

export const HE3K_GALLERY_MODULES: ModuleDef[] = [
  linkBudget,
  linkMargin,
  noiseFloor,
  cascade,
  laminaAlong,
  laminaAcross,
  laminaSpecific,
  laminaDense,
  laminaSparse,
  rocketMain,
  rocketHigh,
  rocketThrustSea,
  rocketThrustVacuum,
  rocketStages,
  diodeMain,
  diodeLed,
  diodeShockleyMain,
  diodeShockleyN2,
  mosfetSat,
  mosfetTriode,
  stemCosine,
  stemCosineReduce,
  stemRecursive,
  stemRecursiveNegative,
  stemConvolve,
  stemConvolveSigned,
  stemSampled,
  stemSampledClean,
];

export const HE3K_GALLERY_LAYOUTS: LayoutDef[] = [];

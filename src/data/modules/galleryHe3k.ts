/**
 * College gallery demos, round 3, group K (docs/RENDERINGS_HE.md). Each stands in for the
 * college page that waits, built from the plan's worked example. Spread into gallery.ts.
 *
 * HC91: `waterfall` `decibels` (EC-P12): a link budget, a link with its margin, a receiver's
 * noise floor under a signal, and gains of a two-stage amplifier in dB.
 */
import type { Relation, Values, VariableDef } from '@/engine/types';

import type { LayoutDef } from './layouts';
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

export const HE3K_GALLERY_MODULES: ModuleDef[] = [linkBudget, linkMargin, noiseFloor, cascade];

export const HE3K_GALLERY_LAYOUTS: LayoutDef[] = [];

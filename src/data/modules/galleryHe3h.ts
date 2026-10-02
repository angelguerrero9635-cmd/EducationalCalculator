/**
 * College gallery demos, round 3, group H (docs/RENDERINGS_HE.md). Each stands in for the
 * college page that waits, built from the plan's worked example. Spread into gallery.ts.
 *
 * HC40: `heatExchanger` (ME-P15, ACC-P35): counterflow and parallel flow by LMTD, the energy
 * balance, effectiveness–NTU, a process exchanger, and a close approach.
 */
import { formatNumber } from '@/engine/format';
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
const fin = (x: number) => (Number.isFinite(x) ? x : undefined);

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

/** a = b − c, solved every way. */
const diffRule = (a: string, b: string, c: string, how: string) =>
  rule(
    `${a} = ${b} − ${c}`,
    `{${a}} = {${b}} − {${c}}`,
    [a, b, c],
    (v) => v[a]! - (v[b]! - v[c]!),
    {
      [a]: [(v) => v[b]! - v[c]!, `{${b}} − {${c}}`, how],
      [b]: [(v) => v[a]! + v[c]!, `{${a}} + {${c}}`, 'Add the difference back on.'],
      [c]: [(v) => v[b]! - v[a]!, `{${b}} − {${a}}`, 'Take the difference away.'],
    },
  );

/** a × k = b × c × d (k a fixed unit factor, 1 when none), solved every way. */
const productRule = (a: string, k: number, [b, c, d]: [string, string, string], how: string) => {
  const kt = k === 1 ? '' : ` × ${k.toLocaleString('en-US')}`;
  const kd = k === 1 ? '' : ` ÷ ${k.toLocaleString('en-US')}`;
  return rule(
    `${a}${kt} = ${b} × ${c} × ${d}`,
    `{${a}}${kt} = {${b}} × {${c}} × {${d}}`,
    [a, b, c, d],
    (v) => v[a]! * k - v[b]! * v[c]! * v[d]!,
    {
      [a]: [(v) => (v[b]! * v[c]! * v[d]!) / k, `{${b}} × {${c}} × {${d}}${kd}`, how],
      [b]: [
        (v) => div(v[a]! * k, v[c]! * v[d]!),
        `{${a}}${kt} ÷ ({${c}} × {${d}})`,
        'Divide by the other two factors.',
      ],
      [c]: [
        (v) => div(v[a]! * k, v[b]! * v[d]!),
        `{${a}}${kt} ÷ ({${b}} × {${d}})`,
        'Divide by the other two factors.',
      ],
      [d]: [
        (v) => div(v[a]! * k, v[b]! * v[c]!),
        `{${a}}${kt} ÷ ({${b}} × {${c}})`,
        'Divide by the other two factors.',
      ],
    },
  );
};

// ─── HC40: heat exchangers (heat-transfer#3, process-design#1) ───────────────

const tempVar = (id: string, symbol: string, name: string) =>
  q(id, symbol, name, '°C', -100, 1500, 0.1);
const dTVar = (id: string, symbol: string, name: string) =>
  q(id, symbol, name, 'K', 0.01, 2000, 0.01);

/** LMTD of two end differences (the mean of one when they are equal). */
const lmtdOf = (d1: number, d2: number) =>
  !(d1 > 0 && d2 > 0)
    ? undefined
    : Math.abs(d1 - d2) < 1e-9 * Math.max(d1, d2)
      ? d1
      : (d1 - d2) / Math.log(d1 / d2);

const same = (a: number, b: number) => Math.abs(a - b) < 1e-9 * Math.max(Math.abs(a), Math.abs(b));
const n6 = (x: number) => formatNumber(Number(x.toPrecision(6)));

const LMTD_RULE = {
  relation: {
    id: 'ΔT_lm = (ΔT₁ − ΔT₂) ÷ ln(ΔT₁ ÷ ΔT₂)',
    display: '{lmtd} = ({dT1} − {dT2}) ÷ ln({dT1} ÷ {dT2})',
    vars: ['lmtd', 'dT1', 'dT2'],
    residual: (v: Values) =>
      same(v.dT1!, v.dT2!)
        ? v.lmtd! - v.dT1!
        : v.lmtd! * Math.log(v.dT1! / v.dT2!) - (v.dT1! - v.dT2!),
    solve: { lmtd: (v: Values) => lmtdOf(v.dT1!, v.dT2!) },
    // Equal ends: the log mean is that difference itself (the formula's 0 ÷ 0 has that limit).
    check: (v: Values) =>
      same(v.dT1!, v.dT2!)
        ? `${n6(v.lmtd!)} = ${n6(v.dT1!)}`
        : `${n6(v.lmtd!)} = (${n6(v.dT1!)} − ${n6(v.dT2!)}) ÷ ln(${n6(v.dT1!)} ÷ ${n6(v.dT2!)})`,
  } as Relation,
  steps: {
    lmtd: {
      expr: (v: Values) =>
        v.dT1 !== undefined && v.dT2 !== undefined && same(v.dT1, v.dT2)
          ? '{dT1}'
          : '({dT1} − {dT2}) ÷ ln({dT1} ÷ {dT2})',
      how: (v: Values) =>
        v.dT1 !== undefined && v.dT2 !== undefined && same(v.dT1, v.dT2)
          ? 'The two ends are equal, so the difference is the same all along: the log mean is that difference.'
          : 'The difference between the streams shrinks exponentially along the length; its mean is the log mean of the two ends.',
    },
  } as Record<string, StepText>,
};

/** A rule that only checks a ≤ b, with the reason shown when it fails. */
const atMost = (a: string, b: string, display: string, why: string) => ({
  relation: {
    id: `${a} ≤ ${b}`,
    constraint: true,
    display,
    vars: [a, b],
    residual: (x: Values) => (x[a]! <= x[b]! + 1e-9 ? 0 : 1),
    solve: {},
    message: () => why,
  } as Relation,
  steps: {} as Record<string, StepText>,
});

/** The temperatures an exchanger can have: each stream moves the right way, no cross. */
const exchangerLimits = () => [
  atMost(
    'Tho',
    'Thi',
    '{Tho} ≤ {Thi}',
    'The hot stream gives heat, so it can’t leave warmer than it came in.',
  ),
  atMost(
    'Tci',
    'Tco',
    '{Tci} ≤ {Tco}',
    'The cold stream takes heat, so it can’t leave colder than it came in.',
  ),
  atMost(
    'Tco',
    'Thi',
    '{Tco} ≤ {Thi}',
    'The cold stream can’t end hotter than the hot stream starts.',
  ),
  atMost(
    'Tci',
    'Tho',
    '{Tci} ≤ {Tho}',
    'The hot stream can’t end colder than the cold stream starts.',
  ),
];

const EXCHANGER_ASSUMPTIONS = [
  'Steady flow; no heat lost to the surroundings.',
  'U is the same all along the exchanger; no phase change.',
  'Each stream’s specific heat is constant.',
];

/** An exchanger sized by LMTD: the four temperatures, ΔT₁, ΔT₂, ΔT_lm, q (kW), U and A. */
function lmtdDemo(o: {
  id: string;
  title: string;
  use: string;
  arrangement: 'counter' | 'parallel';
  temps: [number, number, number, number];
  qkW: number;
  U: number;
  names: { hot: string; cold: string; hotLong: string; coldLong: string };
  fluids?: { hot?: 'oil' | 'water' | 'gas'; cold?: 'water' | 'air' | 'oil' };
}): ModuleDef {
  const [Thi, Tho, Tci, Tco] = o.temps;
  const counter = o.arrangement === 'counter';
  const dT1 = counter ? Thi - Tco : Thi - Tci;
  const dT2 = counter ? Tho - Tci : Tho - Tco;
  const lmtd = lmtdOf(dT1, dT2)!;
  const A = (o.qkW * 1000) / (o.U * lmtd);
  const end1 = counter
    ? 'At the hot inlet’s end the hot stream meets the cold outlet.'
    : 'Both streams enter at the same end.';
  const end2 = counter
    ? 'At the far end the hot outlet meets the cold inlet.'
    : 'Both streams leave at the far end.';
  return {
    id: o.id,
    title: o.title,
    use: o.use,
    assumptions: [
      `${counter ? 'Counterflow' : 'Parallel flow'}: the streams run ${counter ? 'in opposite directions' : 'the same way'}.`,
      ...EXCHANGER_ASSUMPTIONS,
    ],
    variables: [
      tempVar('Thi', 'T_hi', `${o.names.hotLong} in`),
      tempVar('Tho', 'T_ho', `${o.names.hotLong} out`),
      tempVar('Tci', 'T_ci', `${o.names.coldLong} in`),
      tempVar('Tco', 'T_co', `${o.names.coldLong} out`),
      dTVar('dT1', 'ΔT₁', 'Temperature difference at the hot inlet’s end'),
      dTVar('dT2', 'ΔT₂', 'Temperature difference at the other end'),
      dTVar('lmtd', 'ΔT_lm', 'Log-mean temperature difference'),
      q('q', 'q', 'Heat rate', 'kW', 0.001, 1e6, 0.01),
      q('U', 'U', 'Overall heat transfer coefficient', 'W/(m²·K)', 1, 1e5, 0.1),
      q('A', 'A', 'Heat transfer area', 'm²', 0.0001, 1e5, 0.001),
    ],
    ...rules(
      diffRule('dT1', 'Thi', counter ? 'Tco' : 'Tci', end1),
      diffRule('dT2', 'Tho', counter ? 'Tci' : 'Tco', end2),
      LMTD_RULE,
      ...exchangerLimits(),
      productRule(
        'q',
        1000,
        ['U', 'A', 'lmtd'],
        'The rate equation q = UAΔT_lm, in watts; ÷ 1,000 gives kW.',
      ),
    ),
    example: { Thi, Tho, Tci, Tco, dT1, dT2, lmtd, q: o.qkW, U: o.U, A },
    startWith: ['Thi', 'Tho', 'Tci', 'Tco', 'q', 'U'],
    representation: {
      kind: 'heatExchanger',
      arrangement: o.arrangement,
      Thi: 'Thi',
      Tho: 'Tho',
      Tci: 'Tci',
      Tco: 'Tco',
      dT1: 'dT1',
      dT2: 'dT2',
      lmtd: 'lmtd',
      q: 'q',
      U: 'U',
      A: 'A',
      hotName: o.names.hot,
      coldName: o.names.cold,
      ...(o.fluids?.hot ? { hotFluid: o.fluids.hot } : {}),
      ...(o.fluids?.cold ? { coldFluid: o.fluids.cold } : {}),
    },
  };
}

const OIL_WATER = { hot: 'oil', cold: 'water', hotLong: 'Oil', coldLong: 'Water' };

const exchangerCounter = lmtdDemo({
  id: 'g.he-heatExchanger-counter',
  title: 'An oil cooler in counterflow: the area by LMTD',
  use: 'Use this for the area of a counterflow exchanger from its four temperatures, q and U.',
  arrangement: 'counter',
  temps: [120, 70, 20, 50],
  qkW: 50,
  U: 300,
  names: OIL_WATER,
});

const exchangerParallel = lmtdDemo({
  id: 'g.he-heatExchanger-parallel',
  title: 'The same oil cooler in parallel flow',
  use: 'Use this for a parallel-flow exchanger, and to see why it needs more area than counterflow.',
  arrangement: 'parallel',
  temps: [120, 70, 20, 50],
  qkW: 50,
  U: 300,
  names: OIL_WATER,
});

const exchangerProcess = lmtdDemo({
  id: 'g.he-heatExchanger-process',
  title: 'Sizing a process exchanger from its duty',
  use: 'Use this for the area of a countercurrent process exchanger from its duty, U and four temperatures.',
  arrangement: 'counter',
  temps: [150, 90, 30, 80],
  qkW: 500,
  U: 500,
  names: {
    hot: 'hot stream',
    cold: 'cooling water',
    hotLong: 'Hot stream',
    coldLong: 'Cooling water',
  },
});

const exchangerClose = lmtdDemo({
  id: 'g.he-heatExchanger-counter-close',
  title: 'A close approach: the cold outlet above the hot outlet',
  use: 'Use this for a counterflow exchanger whose cold outlet ends hotter than the hot outlet.',
  arrangement: 'counter',
  temps: [90, 40, 30, 85],
  qkW: 100,
  U: 800,
  names: {
    hot: 'hot water',
    cold: 'feed water',
    hotLong: 'Hot water',
    coldLong: 'Feed water',
  },
  fluids: { hot: 'water' },
});

/** q = ṁc_pΔT for one stream (q in kW, c_p in kJ/(kg·K)), solved every way. */
const streamRule = (m: string, cp: string, T1: string, T2: string, which: string) =>
  rule(
    `q = ṁc_p ΔT (${which})`,
    `{q} = {${m}} × {${cp}} × ({${T1}} − {${T2}})`,
    ['q', m, cp, T1, T2],
    (v) => v.q! - v[m]! * v[cp]! * (v[T1]! - v[T2]!),
    {
      q: [
        (v) => v[m]! * v[cp]! * (v[T1]! - v[T2]!),
        `{${m}} × {${cp}} × ({${T1}} − {${T2}})`,
        `The heat the ${which} stream gives or takes: its capacity rate ṁc_p times its change.`,
      ],
      [m]: [
        (v) => div(v.q!, v[cp]! * (v[T1]! - v[T2]!)),
        `{q} ÷ ({${cp}} × ({${T1}} − {${T2}}))`,
        'Divide the heat by c_p and the temperature change.',
      ],
      [cp]: [
        (v) => div(v.q!, v[m]! * (v[T1]! - v[T2]!)),
        `{q} ÷ ({${m}} × ({${T1}} − {${T2}}))`,
        'Divide the heat by ṁ and the temperature change.',
      ],
      [T1]: [
        (v) => fin(v[T2]! + v.q! / (v[m]! * v[cp]!)),
        `{${T2}} + {q} ÷ ({${m}} × {${cp}})`,
        'The change is q ÷ ṁc_p; add it to the other temperature.',
      ],
      [T2]: [
        (v) => fin(v[T1]! - v.q! / (v[m]! * v[cp]!)),
        `{${T1}} − {q} ÷ ({${m}} × {${cp}})`,
        'The change is q ÷ ṁc_p; take it from the other temperature.',
      ],
    },
  );

const exchangerBalance: ModuleDef = {
  id: 'g.he-heatExchanger-balance',
  title: 'The energy balance: the water flow an oil cooler needs',
  use: 'Use this for an unknown flow rate or outlet temperature, from the heat one stream gives the other.',
  assumptions: ['Counterflow.', ...EXCHANGER_ASSUMPTIONS],
  variables: [
    q('mh', 'ṁ_h', 'Oil mass flow', 'kg/s', 0.0001, 1e4, 0.001),
    q('cph', 'c_ph', 'Oil specific heat', 'kJ/(kg·K)', 0.1, 20, 0.01),
    tempVar('Thi', 'T_hi', 'Oil in'),
    tempVar('Tho', 'T_ho', 'Oil out'),
    q('q', 'q', 'Heat rate', 'kW', 0.001, 1e6, 0.01),
    q('mc', 'ṁ_c', 'Water mass flow', 'kg/s', 0.0001, 1e4, 0.001),
    q('cpc', 'c_pc', 'Water specific heat', 'kJ/(kg·K)', 0.1, 20, 0.01),
    tempVar('Tci', 'T_ci', 'Water in'),
    tempVar('Tco', 'T_co', 'Water out'),
  ],
  ...rules(
    streamRule('mh', 'cph', 'Thi', 'Tho', 'hot'),
    streamRule('mc', 'cpc', 'Tco', 'Tci', 'cold'),
    ...exchangerLimits(),
  ),
  example: {
    mh: 0.5,
    cph: 2,
    Thi: 120,
    Tho: 70,
    q: 50,
    mc: 50 / (4.18 * 30),
    cpc: 4.18,
    Tci: 20,
    Tco: 50,
  },
  startWith: ['mh', 'cph', 'Thi', 'Tho', 'cpc', 'Tci', 'Tco'],
  representation: {
    kind: 'heatExchanger',
    arrangement: 'counter',
    Thi: 'Thi',
    Tho: 'Tho',
    Tci: 'Tci',
    Tco: 'Tco',
    q: 'q',
    mh: 'mh',
    cph: 'cph',
    mc: 'mc',
    cpc: 'cpc',
    hotName: 'oil',
    coldName: 'water',
  },
};

/** Counterflow ε from NTU and C_r (C_r = 1: NTU ÷ (1 + NTU)). */
const effCounter = (ntu: number, cr: number) => {
  if (Math.abs(1 - cr) < 1e-9) return ntu / (1 + ntu);
  const e = Math.exp(-ntu * (1 - cr));
  return (1 - e) / (1 - cr * e);
};

const exchangerNtu: ModuleDef = {
  id: 'g.he-heatExchanger-ntu',
  title: 'Effectiveness–NTU: the heat without the outlet temperatures',
  use: 'Use this for the heat a counterflow exchanger passes when only the inlets, UA and the flows are known.',
  assumptions: ['Counterflow; the oil has the smaller capacity rate.', ...EXCHANGER_ASSUMPTIONS],
  variables: [
    tempVar('Thi', 'T_hi', 'Oil in'),
    tempVar('Tci', 'T_ci', 'Water in'),
    q('Cmin', 'C_min', 'Smaller capacity rate (the oil’s ṁc_p)', 'W/K', 0.01, 1e8, 0.1),
    q('Cr', 'C_r', 'Capacity ratio C_min ÷ C_max', undefined, 0.01, 1, 0.001),
    q('UA', 'UA', 'Overall conductance', 'W/K', 0.01, 1e9, 0.1),
    q('ntu', 'NTU', 'Number of transfer units', undefined, 0.001, 50, 0.001),
    q('eff', 'ε', 'Effectiveness', undefined, 0.0001, 0.9999, 0.0001),
    q('q', 'q', 'Heat rate', 'kW', 0.001, 1e6, 0.01),
  ],
  ...rules(
    rule(
      'NTU = UA ÷ C_min',
      '{ntu} = {UA} ÷ {Cmin}',
      ['ntu', 'UA', 'Cmin'],
      (v) => v.ntu! * v.Cmin! - v.UA!,
      {
        ntu: [
          (v) => div(v.UA!, v.Cmin!),
          '{UA} ÷ {Cmin}',
          'NTU measures the exchanger’s size against the smaller capacity rate.',
        ],
        UA: [(v) => v.ntu! * v.Cmin!, '{ntu} × {Cmin}', 'Multiply NTU by C_min.'],
        Cmin: [(v) => div(v.UA!, v.ntu!), '{UA} ÷ {ntu}', 'Divide UA by NTU.'],
      },
    ),
    rule(
      'ε = (1 − e^(−NTU(1 − C_r))) ÷ (1 − C_r e^(−NTU(1 − C_r)))',
      '{eff} = (1 − e^(−{ntu} × (1 − {Cr}))) ÷ (1 − {Cr} × e^(−{ntu} × (1 − {Cr})))',
      ['eff', 'ntu', 'Cr'],
      (v) => v.eff! - effCounter(v.ntu!, v.Cr!),
      {
        eff: [
          (v) => effCounter(v.ntu!, v.Cr!),
          '(1 − e^(−{ntu} × (1 − {Cr}))) ÷ (1 − {Cr} × e^(−{ntu} × (1 − {Cr})))',
          'The counterflow effectiveness: the share of the largest possible heat this exchanger passes.',
        ],
        ntu: [
          (v) =>
            Math.abs(1 - v.Cr!) < 1e-9
              ? div(v.eff!, 1 - v.eff!)
              : fin(Math.log((1 - v.eff! * v.Cr!) / (1 - v.eff!)) / (1 - v.Cr!)),
          'ln((1 − {eff} × {Cr}) ÷ (1 − {eff})) ÷ (1 − {Cr})',
          'The effectiveness rule turned round: the NTU a wanted ε needs.',
        ],
      },
    ),
    rule(
      'q = εC_min(T_hi − T_ci)',
      '{q} × 1,000 = {eff} × {Cmin} × ({Thi} − {Tci})',
      ['q', 'eff', 'Cmin', 'Thi', 'Tci'],
      (v) => v.q! * 1000 - v.eff! * v.Cmin! * (v.Thi! - v.Tci!),
      {
        q: [
          (v) => (v.eff! * v.Cmin! * (v.Thi! - v.Tci!)) / 1000,
          '{eff} × {Cmin} × ({Thi} − {Tci}) ÷ 1,000',
          'The largest heat is C_min times the inlets’ difference; ε of it passes. ÷ 1,000 gives kW.',
        ],
        eff: [
          (v) => div(v.q! * 1000, v.Cmin! * (v.Thi! - v.Tci!)),
          '{q} × 1,000 ÷ ({Cmin} × ({Thi} − {Tci}))',
          'The heat passed over the largest possible heat.',
        ],
        Cmin: [
          (v) => div(v.q! * 1000, v.eff! * (v.Thi! - v.Tci!)),
          '{q} × 1,000 ÷ ({eff} × ({Thi} − {Tci}))',
          'Divide the heat in watts by ε and the inlets’ difference.',
        ],
        Thi: [
          (v) => fin(v.Tci! + (v.q! * 1000) / (v.eff! * v.Cmin!)),
          '{Tci} + {q} × 1,000 ÷ ({eff} × {Cmin})',
          'The inlets’ difference is q ÷ εC_min; add it to the cold inlet.',
        ],
        Tci: [
          (v) => fin(v.Thi! - (v.q! * 1000) / (v.eff! * v.Cmin!)),
          '{Thi} − {q} × 1,000 ÷ ({eff} × {Cmin})',
          'The inlets’ difference is q ÷ εC_min; take it from the hot inlet.',
        ],
      },
    ),
  ),
  example: (() => {
    const ntu = 841 / 1000;
    const eff = effCounter(ntu, 0.6);
    return {
      Thi: 120,
      Tci: 20,
      Cmin: 1000,
      Cr: 0.6,
      UA: 841,
      ntu,
      eff,
      q: (eff * 1000 * 100) / 1000,
    };
  })(),
  startWith: ['Thi', 'Tci', 'Cmin', 'Cr', 'UA'],
  representation: {
    kind: 'heatExchanger',
    arrangement: 'counter',
    Thi: 'Thi',
    Tci: 'Tci',
    q: 'q',
    Cmin: 'Cmin',
    Cr: 'Cr',
    ntu: 'ntu',
    eff: 'eff',
    minSide: 'hot',
    hotName: 'oil',
    coldName: 'water',
    more: ['UA'],
  },
};

export const HE3H_GALLERY_MODULES: ModuleDef[] = [
  exchangerCounter,
  exchangerParallel,
  exchangerBalance,
  exchangerNtu,
  exchangerProcess,
  exchangerClose,
];

export const HE3H_GALLERY_LAYOUTS: LayoutDef[] = [];

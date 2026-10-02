/**
 * College gallery demos, round 3, group H (docs/RENDERINGS_HE.md). Each stands in for the
 * college page that waits, built from the plan's worked example. Spread into gallery.ts.
 *
 * HC40: `heatExchanger` (ME-P15, ACC-P35): counterflow and parallel flow by LMTD, the energy
 * balance, effectiveness–NTU, a process exchanger, and a close approach.
 *
 * HC59: `shaft` (ME-P6): a solid and a hollow shaft in torsion, sizing for power and speed,
 * bending with torsion, and a long thin rod twisting tens of degrees.
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
    unitSystems: ['metric'],
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
  unitSystems: ['metric'],
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
  unitSystems: ['metric'],
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

// ─── HC59: shafts in torsion and bending (mechanics-of-materials#2, machine-design#2) ──

const SHAFT_ASSUMPTIONS = [
  'A straight round shaft of one material, elastic (stresses under the yield strength).',
  'Plane sections stay plane; the torque is the same all along the length.',
];

const torqueVar = (id = 'T', name = 'Torque') => q(id, 'T', name, 'N·m', 0.001, 1e7, 0.1);
const mmVar = (id: string, symbol: string, name: string, min = 0.1) =>
  q(id, symbol, name, 'mm', min, 1e5, 0.01);
const mpaVar = (id: string, symbol: string, name: string) =>
  q(id, symbol, name, 'MPa', 0.0001, 1e5, 0.01);

/** J = π(d⁴ − d_i⁴) ÷ 32 (d_i left out when solid). */
const polarRule = (d: string, di?: string) =>
  di
    ? rule(
        'J = π(d⁴ − d_i⁴) ÷ 32',
        `{J} = π × ({${d}}⁴ − {${di}}⁴) ÷ 32`,
        ['J', d, di],
        (v) => v.J! - (Math.PI * (v[d]! ** 4 - v[di]! ** 4)) / 32,
        {
          J: [
            (v) => (Math.PI * (v[d]! ** 4 - v[di]! ** 4)) / 32,
            `π × ({${d}}⁴ − {${di}}⁴) ÷ 32`,
            'The polar moment of a ring: the whole disc’s less the bore’s.',
          ],
          [d]: [
            (v) => fin(((32 * v.J!) / Math.PI + v[di]! ** 4) ** 0.25),
            `(32 × {J} ÷ π + {${di}}⁴)^(1/4)`,
            'Undo the ÷ 32 and the π, add the bore’s d_i⁴ back, then take the fourth root.',
          ],
          [di]: [
            (v) => {
              const x = v[d]! ** 4 - (32 * v.J!) / Math.PI;
              return x > 0 ? x ** 0.25 : undefined;
            },
            `({${d}}⁴ − 32 × {J} ÷ π)^(1/4)`,
            'Take the ring’s 32J ÷ π from d⁴, then the fourth root.',
          ],
        },
      )
    : rule(
        'J = πd⁴ ÷ 32',
        `{J} = π × {${d}}⁴ ÷ 32`,
        ['J', d],
        (v) => v.J! - (Math.PI * v[d]! ** 4) / 32,
        {
          J: [
            (v) => (Math.PI * v[d]! ** 4) / 32,
            `π × {${d}}⁴ ÷ 32`,
            'The polar moment of a solid round section.',
          ],
          [d]: [
            (v) => fin(((32 * v.J!) / Math.PI) ** 0.25),
            '(32 × {J} ÷ π)^(1/4)',
            'Undo the ÷ 32 and the π, then take the fourth root.',
          ],
        },
      );

/** τ = T(d ÷ 2) ÷ J, T in N·m (× 1,000 to N·mm), d in mm, J in mm⁴, τ in MPa. */
const torsionRule = (tau: string, T: string, d: string) =>
  rule(
    'τ_max = Tc ÷ J',
    `{${tau}} = {${T}} × 1,000 × ({${d}} ÷ 2) ÷ {J}`,
    [tau, T, d, 'J'],
    (v) => v[tau]! * v.J! - v[T]! * 1000 * (v[d]! / 2),
    {
      [tau]: [
        (v) => div(v[T]! * 1000 * (v[d]! / 2), v.J!),
        `{${T}} × 1,000 × ({${d}} ÷ 2) ÷ {J}`,
        'Shear grows with the radius, so it is largest at the surface, c = d ÷ 2; × 1,000 turns N·m into N·mm, giving MPa.',
      ],
      [T]: [
        (v) => div(v[tau]! * v.J!, 1000 * (v[d]! / 2)),
        `{${tau}} × {J} ÷ (1,000 × ({${d}} ÷ 2))`,
        'Turn the rule round: τJ ÷ c is the torque in N·mm; ÷ 1,000 gives N·m.',
      ],
      J: [
        (v) => div(v[T]! * 1000 * (v[d]! / 2), v[tau]!),
        `{${T}} × 1,000 × ({${d}} ÷ 2) ÷ {${tau}}`,
        'Turn the rule round: J = Tc ÷ τ.',
      ],
    },
  );

/** φ = TL ÷ GJ: T × 1,000 (N·mm) and G × 1,000 (MPa) cancel. */
const twistRule = (T: string) =>
  rule(
    'φ = TL ÷ GJ',
    `{phi} = {${T}} × {L} ÷ ({G} × {J})`,
    ['phi', T, 'L', 'G', 'J'],
    (v) => v.phi! * v.G! * v.J! - v[T]! * v.L!,
    {
      phi: [
        (v) => div(v[T]! * v.L!, v.G! * v.J!),
        `{${T}} × {L} ÷ ({G} × {J})`,
        'The twist grows with torque and length and falls with stiffness GJ; the × 1,000 for N·mm and the × 1,000 for GPa cancel.',
      ],
      [T]: [
        (v) => div(v.phi! * v.G! * v.J!, v.L!),
        '{phi} × {G} × {J} ÷ {L}',
        'Turn the rule round: T = φGJ ÷ L.',
      ],
      L: [
        (v) => div(v.phi! * v.G! * v.J!, v[T]!),
        '{phi} × {G} × {J} ÷ {T}',
        'Turn the rule round: L = φGJ ÷ T.',
      ],
      G: [
        (v) => div(v[T]! * v.L!, v.phi! * v.J!),
        '{T} × {L} ÷ ({phi} × {J})',
        'Turn the rule round: G = TL ÷ φJ.',
      ],
      J: [
        (v) => div(v[T]! * v.L!, v.phi! * v.G!),
        '{T} × {L} ÷ ({phi} × {G})',
        'Turn the rule round: J = TL ÷ φG.',
      ],
    },
  );

const degRule = rule(
  'φ° = φ × 180 ÷ π',
  '{phiDeg} = {phi} × 180 ÷ π',
  ['phiDeg', 'phi'],
  (v) => v.phiDeg! - (v.phi! * 180) / Math.PI,
  {
    phiDeg: [(v) => (v.phi! * 180) / Math.PI, '{phi} × 180 ÷ π', 'A radian is 180 ÷ π degrees.'],
    phi: [(v) => (v.phiDeg! * Math.PI) / 180, '{phiDeg} × π ÷ 180', 'A degree is π ÷ 180 radians.'],
  },
);

const twistVars = (): VariableDef[] => [
  mmVar('L', 'L', 'Length'),
  q('G', 'G', 'Shear modulus', 'GPa', 0.01, 1000, 0.1),
  q('J', 'J', 'Polar moment of area', 'mm⁴', 0.0001, 1e14, 0.1),
  mpaVar('tau', 'τ_max', 'Largest shear stress'),
  q('phi', 'φ', 'Angle of twist', 'rad', 0.000001, 10, 0.0001),
  q('phiDeg', 'φ°', 'Angle of twist in degrees', '°', 0.0001, 600, 0.01),
];

function solidShaft(o: {
  id: string;
  title: string;
  use: string;
  T: number;
  d: number;
  L: number;
  G: number;
}): ModuleDef {
  const J = (Math.PI * o.d ** 4) / 32;
  const tau = (o.T * 1000 * (o.d / 2)) / J;
  const phi = (o.T * o.L) / (o.G * J);
  return {
    id: o.id,
    title: o.title,
    use: o.use,
    assumptions: SHAFT_ASSUMPTIONS,
    variables: [torqueVar(), mmVar('d', 'd', 'Diameter'), ...twistVars()],
    ...rules(polarRule('d'), torsionRule('tau', 'T', 'd'), twistRule('T'), degRule),
    example: { T: o.T, d: o.d, L: o.L, G: o.G, J, tau, phi, phiDeg: (phi * 180) / Math.PI },
    startWith: ['T', 'd', 'L', 'G'],
    unitSystems: ['metric'],
    representation: {
      kind: 'shaft',
      d: 'd',
      length: 'L',
      torque: 'T',
      G: 'G',
      J: 'J',
      tau: 'tau',
      angle: 'phi',
      more: ['phiDeg'],
    },
  };
}

const shaftSolid = solidShaft({
  id: 'g.he-shaft-solid',
  title: 'A solid steel shaft: the largest shear and the twist',
  use: 'Use this for the largest shear stress and the angle of twist of a solid shaft under a torque.',
  T: 2000,
  d: 50,
  L: 1500,
  G: 77,
});

const shaftLong = solidShaft({
  id: 'g.he-shaft-long',
  title: 'A long thin rod: a twist big enough to see',
  use: 'Use this for a long, slender torsion rod whose twist is tens of degrees.',
  T: 20,
  d: 10,
  L: 2000,
  G: 77,
});

const shaftHollow: ModuleDef = (() => {
  const [T, d, di, L, G] = [2000, 60, 40, 1500, 77];
  const J = (Math.PI * (d ** 4 - di ** 4)) / 32;
  const tau = (T * 1000 * (d / 2)) / J;
  const phi = (T * L) / (G * J);
  return {
    id: 'g.he-shaft-hollow',
    title: 'A hollow shaft: less steel, nearly the same strength',
    use: 'Use this for the shear stress and twist of a hollow (tube) shaft.',
    assumptions: SHAFT_ASSUMPTIONS,
    variables: [
      torqueVar(),
      mmVar('d', 'd_o', 'Outer diameter'),
      mmVar('di', 'd_i', 'Inner diameter (the bore)', 0.01),
      ...twistVars(),
    ],
    ...rules(
      polarRule('d', 'di'),
      torsionRule('tau', 'T', 'd'),
      twistRule('T'),
      degRule,
      atMost('di', 'd', '{di} ≤ {d}', 'The bore must be narrower than the shaft.'),
    ),
    example: { T, d, di, L, G, J, tau, phi, phiDeg: (phi * 180) / Math.PI },
    startWith: ['T', 'd', 'di', 'L', 'G'],
    unitSystems: ['metric'],
    representation: {
      kind: 'shaft',
      d: 'd',
      di: 'di',
      length: 'L',
      torque: 'T',
      G: 'G',
      J: 'J',
      tau: 'tau',
      angle: 'phi',
      more: ['phiDeg'],
    },
  };
})();

const shaftPower: ModuleDef = (() => {
  const [P, n, tauA] = [30, 1200, 60];
  const w = (2 * Math.PI * n) / 60;
  const T = (P * 1000) / w;
  const d = ((16 * T * 1000) / (Math.PI * tauA)) ** (1 / 3);
  return {
    id: 'g.he-shaft-power',
    title: 'Sizing a shaft for a power and a speed',
    use: 'Use this for “Size a solid shaft to carry 30 kW at 1200 rpm with 60 MPa allowed.”',
    assumptions: [...SHAFT_ASSUMPTIONS, 'Steady power; the shaft is sized on shear alone.'],
    variables: [
      q('P', 'P', 'Power', 'kW', 0.0001, 1e6, 0.01),
      q('n', 'n', 'Speed', 'rpm', 0.01, 1e6, 1),
      q('w', 'ω', 'Angular speed', 'rad/s', 0.001, 1e6, 0.01),
      torqueVar(),
      mpaVar('tauA', 'τ_allow', 'Allowed shear stress'),
      mmVar('d', 'd', 'Diameter needed', 0.01),
    ],
    ...rules(
      rule(
        'ω = 2πn ÷ 60',
        '{w} = 2π × {n} ÷ 60',
        ['w', 'n'],
        (v) => v.w! - (2 * Math.PI * v.n!) / 60,
        {
          w: [
            (v) => (2 * Math.PI * v.n!) / 60,
            '2π × {n} ÷ 60',
            'Each turn is 2π radians, and a minute is 60 s.',
          ],
          n: [
            (v) => (v.w! * 60) / (2 * Math.PI),
            '{w} × 60 ÷ (2π)',
            'Turn radians per second into turns per minute.',
          ],
        },
      ),
      rule(
        'T = P ÷ ω',
        '{T} = {P} × 1,000 ÷ {w}',
        ['T', 'P', 'w'],
        (v) => v.T! * v.w! - v.P! * 1000,
        {
          T: [
            (v) => div(v.P! * 1000, v.w!),
            '{P} × 1,000 ÷ {w}',
            'Power is torque times angular speed; × 1,000 turns kW into W.',
          ],
          P: [
            (v) => (v.T! * v.w!) / 1000,
            '{T} × {w} ÷ 1,000',
            'Power is torque times angular speed; ÷ 1,000 gives kW.',
          ],
          w: [
            (v) => div(v.P! * 1000, v.T!),
            '{P} × 1,000 ÷ {T}',
            'Divide the power in W by the torque.',
          ],
        },
      ),
      rule(
        'd = (16T ÷ πτ_allow)^(1/3)',
        '{d} = (16 × {T} × 1,000 ÷ (π × {tauA}))^(1/3)',
        ['d', 'T', 'tauA'],
        (v) => v.d! ** 3 * Math.PI * v.tauA! - 16 * v.T! * 1000,
        {
          d: [
            (v) => fin(((16 * v.T! * 1000) / (Math.PI * v.tauA!)) ** (1 / 3)),
            '(16 × {T} × 1,000 ÷ (π × {tauA}))^(1/3)',
            'Set τ_max = 16T ÷ πd³ to the allowed stress and solve for d; × 1,000 turns N·m into N·mm.',
          ],
          T: [
            (v) => (Math.PI * v.tauA! * v.d! ** 3) / 16000,
            'π × {tauA} × {d}³ ÷ 16,000',
            'The torque this shaft carries at the allowed stress, in N·m.',
          ],
          tauA: [
            (v) => div(16 * v.T! * 1000, Math.PI * v.d! ** 3),
            '16 × {T} × 1,000 ÷ (π × {d}³)',
            'The largest shear stress in this shaft: 16T ÷ πd³.',
          ],
        },
      ),
    ),
    example: { P, n, w, T, tauA, d },
    startWith: ['P', 'n', 'tauA'],
    unitSystems: ['metric'],
    representation: {
      kind: 'shaft',
      d: 'd',
      torque: 'T',
      tau: 'tauA',
      power: 'P',
      speed: 'n',
      more: ['w'],
    },
  };
})();

const shaftBending: ModuleDef = (() => {
  const [d, M, T, Sy] = [40, 400, 600, 420];
  const sigma = (32 * M * 1000) / (Math.PI * d ** 3);
  const tau = (16 * T * 1000) / (Math.PI * d ** 3);
  const sv = Math.sqrt(sigma ** 2 + 3 * tau ** 2);
  return {
    id: 'g.he-shaft-bending',
    title: 'A shaft in bending and torsion: the factor of safety',
    use: 'Use this for the von Mises factor of safety of a shaft carrying a bending moment and a torque.',
    assumptions: [
      ...SHAFT_ASSUMPTIONS,
      'Static loads (no fatigue); the stress element at the surface.',
    ],
    variables: [
      mmVar('d', 'd', 'Diameter'),
      q('M', 'M', 'Bending moment', 'N·m', 0.001, 1e7, 0.1),
      torqueVar(),
      mpaVar('sigma', 'σ', 'Bending stress at the surface'),
      mpaVar('tau', 'τ', 'Torsion shear stress at the surface'),
      mpaVar('sv', 'σ′', 'Von Mises stress'),
      mpaVar('Sy', 'S_y', 'Yield strength'),
      q('n', 'n', 'Factor of safety', undefined, 0.0001, 1e6, 0.01),
    ],
    ...rules(
      rule(
        'σ = 32M ÷ πd³',
        '{sigma} = 32 × {M} × 1,000 ÷ (π × {d}³)',
        ['sigma', 'M', 'd'],
        (v) => v.sigma! * Math.PI * v.d! ** 3 - 32000 * v.M!,
        {
          sigma: [
            (v) => (32000 * v.M!) / (Math.PI * v.d! ** 3),
            '32 × {M} × 1,000 ÷ (π × {d}³)',
            'Bending stress at the surface, Mc ÷ I for a round section; × 1,000 turns N·m into N·mm.',
          ],
          M: [
            (v) => (v.sigma! * Math.PI * v.d! ** 3) / 32000,
            '{sigma} × π × {d}³ ÷ 32,000',
            'Turn the rule round for the moment, in N·m.',
          ],
          d: [
            (v) => fin(((32000 * v.M!) / (Math.PI * v.sigma!)) ** (1 / 3)),
            '(32 × {M} × 1,000 ÷ (π × {sigma}))^(1/3)',
            'Turn the rule round and take the cube root.',
          ],
        },
      ),
      rule(
        'τ = 16T ÷ πd³',
        '{tau} = 16 × {T} × 1,000 ÷ (π × {d}³)',
        ['tau', 'T', 'd'],
        (v) => v.tau! * Math.PI * v.d! ** 3 - 16000 * v.T!,
        {
          tau: [
            (v) => (16000 * v.T!) / (Math.PI * v.d! ** 3),
            '16 × {T} × 1,000 ÷ (π × {d}³)',
            'Torsion shear at the surface; × 1,000 turns N·m into N·mm.',
          ],
          T: [
            (v) => (v.tau! * Math.PI * v.d! ** 3) / 16000,
            '{tau} × π × {d}³ ÷ 16,000',
            'Turn the rule round for the torque, in N·m.',
          ],
          d: [
            (v) => fin(((16000 * v.T!) / (Math.PI * v.tau!)) ** (1 / 3)),
            '(16 × {T} × 1,000 ÷ (π × {tau}))^(1/3)',
            'Turn the rule round and take the cube root.',
          ],
        },
      ),
      rule(
        'σ′ = √(σ² + 3τ²)',
        '{sv} = √({sigma}² + 3 × {tau}²)',
        ['sv', 'sigma', 'tau'],
        (v) => v.sv! ** 2 - v.sigma! ** 2 - 3 * v.tau! ** 2,
        {
          sv: [
            (v) => Math.sqrt(v.sigma! ** 2 + 3 * v.tau! ** 2),
            '√({sigma}² + 3 × {tau}²)',
            'Von Mises joins the two stresses into one to compare with S_y.',
          ],
          sigma: [
            (v) => {
              const x = v.sv! ** 2 - 3 * v.tau! ** 2;
              return x >= 0 ? Math.sqrt(x) : undefined;
            },
            '√({sv}² − 3 × {tau}²)',
            'Take 3τ² from σ′², then the square root.',
          ],
          tau: [
            (v) => {
              const x = (v.sv! ** 2 - v.sigma! ** 2) / 3;
              return x >= 0 ? Math.sqrt(x) : undefined;
            },
            '√(({sv}² − {sigma}²) ÷ 3)',
            'Take σ² from σ′², divide by 3, then the square root.',
          ],
        },
      ),
      rule('n = S_y ÷ σ′', '{n} = {Sy} ÷ {sv}', ['n', 'Sy', 'sv'], (v) => v.n! * v.sv! - v.Sy!, {
        n: [
          (v) => div(v.Sy!, v.sv!),
          '{Sy} ÷ {sv}',
          'How many times the stress the material can take before it yields.',
        ],
        Sy: [(v) => v.n! * v.sv!, '{n} × {sv}', 'Multiply σ′ by n.'],
        sv: [(v) => div(v.Sy!, v.n!), '{Sy} ÷ {n}', 'Divide S_y by n.'],
      }),
    ),
    example: { d, M, T, sigma, tau, sv, Sy, n: Sy / sv },
    startWith: ['d', 'M', 'T', 'Sy'],
    unitSystems: ['metric'],
    representation: {
      kind: 'shaft',
      d: 'd',
      torque: 'T',
      moment: 'M',
      sigma: 'sigma',
      tau: 'tau',
      vonMises: 'sv',
      n: 'n',
      more: ['Sy'],
    },
  };
})();

export const HE3H_GALLERY_MODULES: ModuleDef[] = [
  exchangerCounter,
  exchangerParallel,
  exchangerBalance,
  exchangerNtu,
  exchangerProcess,
  exchangerClose,
  shaftSolid,
  shaftHollow,
  shaftPower,
  shaftBending,
  shaftLong,
];

export const HE3H_GALLERY_LAYOUTS: LayoutDef[] = [];

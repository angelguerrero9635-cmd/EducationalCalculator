/**
 * College gallery demos, round 3, group E (docs/RENDERINGS_HE.md). Each stands in for the
 * college page that waits, built from the plan's worked example. Spread into gallery.ts.
 *
 * HC55: `instrumentTrace` (C-P5): ¹H NMR, a chromatogram, a rotational spectrum, and the IR
 * sort's `ir` cards.
 * HC70: `orbitalDiagram` mode `mo` (C-P3): diatomic MOs, a heteronuclear pair, Frost circles.
 * HC72: `vsepr` modes `expanded` (5–6 domains) and `complex` (C-P13).
 * HC74: `moleMap` solution and gas boxes, `reaction` `combustion` (C-P24).
 */
import { diatomicMOs, frost, heteronuclear } from '@/components/module/reps/orbitalMoMath';
import { domainAngleOf } from '@/components/module/reps/vseprHe3eMath';
import type { Relation, VariableDef } from '@/engine/types';

import type { LayoutDef } from './layouts';
import type { ModuleDef, Representation, StepText } from './types';
import type { IrBand } from './typesHe3e';

/** A relation and its step text, built together so a demo lists both from one place. */
interface Rule {
  relation: Relation;
  steps: Record<string, StepText>;
}

const rules = (...rs: Rule[]) => ({
  relations: rs.map((r) => r.relation),
  steps: Object.fromEntries(rs.map((r) => [r.relation.id, r.steps])),
});

const st = (expr: string, how: string): StepText => ({ expr, how });
const div = (a: number, b: number) => (b === 0 || !Number.isFinite(b) ? undefined : a / b);
const pos = (x: number) => (x > 0 && Number.isFinite(x) ? x : undefined);

/** A value with a unit that never changes (the formula is written in it). */
const quantity = (
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

/** a = b × c, solved for any one. */
const product = (
  id: string,
  a: string,
  b: string,
  c: string,
  how: [string, string, string],
): Rule => ({
  relation: {
    id,
    display: `{${a}} = {${b}} × {${c}}`,
    vars: [a, b, c],
    residual: (v) => v[a]! - v[b]! * v[c]!,
    solve: {
      [a]: (v) => v[b]! * v[c]!,
      [b]: (v) => div(v[a]!, v[c]!),
      [c]: (v) => div(v[a]!, v[b]!),
    },
  },
  steps: {
    [a]: st(`{${b}} × {${c}}`, how[0]),
    [b]: st(`{${a}} ÷ {${c}}`, how[1]),
    [c]: st(`{${a}} ÷ {${b}}`, how[2]),
  },
});

/** a = b ÷ c, solved for any one. */
const quotient = (
  id: string,
  a: string,
  b: string,
  c: string,
  how: [string, string, string],
): Rule => ({
  relation: {
    id,
    display: `{${a}} = {${b}} ÷ {${c}}`,
    vars: [a, b, c],
    residual: (v) => v[a]! * v[c]! - v[b]!,
    solve: {
      [a]: (v) => div(v[b]!, v[c]!),
      [b]: (v) => v[a]! * v[c]!,
      [c]: (v) => div(v[b]!, v[a]!),
    },
  },
  steps: {
    [a]: st(`{${b}} ÷ {${c}}`, how[0]),
    [b]: st(`{${a}} × {${c}}`, how[1]),
    [c]: st(`{${b}} ÷ {${a}}`, how[2]),
  },
});

/** A page limit, checked only: `ok` must hold, else `why` is the reason. */
const limit = (
  id: string,
  display: string,
  ok: (v: Record<string, number>) => boolean,
  why: string,
): Rule => ({
  relation: {
    id,
    display,
    constraint: true,
    vars: [...new Set([...display.matchAll(/\{(\w+)\}/g)].map((m) => m[1]!))],
    residual: (v) => (ok(v) ? 0 : 1),
    solve: {},
    message: (v) => (ok(v) ? undefined : why),
  },
  steps: {},
});

// ─── HC55 NMR (organic-1#4) ─────────────────────────────────────────────────

/** Sum of the three integrals. */
const integralSum: Rule = {
  relation: {
    id: 'ΣI = I₁ + I₂ + I₃',
    display: '{sum} = {I1} + {I2} + {I3}',
    vars: ['sum', 'I1', 'I2', 'I3'],
    residual: (v) => v.sum! - v.I1! - v.I2! - v.I3!,
    solve: {
      sum: (v) => v.I1! + v.I2! + v.I3!,
      I1: (v) => pos(v.sum! - v.I2! - v.I3!),
      I2: (v) => pos(v.sum! - v.I1! - v.I3!),
      I3: (v) => pos(v.sum! - v.I1! - v.I2!),
    },
  },
  steps: {
    sum: st('{I1} + {I2} + {I3}', 'Add the three integrals.'),
    I1: st('{sum} − {I2} − {I3}', 'Take the other two integrals from the sum.'),
    I2: st('{sum} − {I1} − {I3}', 'Take the other two integrals from the sum.'),
    I3: st('{sum} − {I1} − {I2}', 'Take the other two integrals from the sum.'),
  },
};

/** hᵢ = H × Iᵢ ÷ ΣI. */
const share = (h: string, I: string): Rule => ({
  relation: {
    id: `${h} = H × ${I} ÷ ΣI`,
    display: `{${h}} = {H} × {${I}} ÷ {sum}`,
    vars: [h, 'H', I, 'sum'],
    residual: (v) => v[h]! * v.sum! - v.H! * v[I]!,
    solve: {
      [h]: (v) => div(v.H! * v[I]!, v.sum!),
      H: (v) => div(v[h]! * v.sum!, v[I]!),
    },
  },
  steps: {
    [h]: st(`{H} × {${I}} ÷ {sum}`, 'Its share of the integrals is its share of the H.'),
    H: st(
      `{${h}} × {sum} ÷ {${I}}`,
      'Scale this signal’s H up by the integrals’ total over its own.',
    ),
  },
});

const integral = (id: string, symbol: string, name: string) =>
  quantity(id, symbol, name, undefined, 0.01, 10000, 0.1);
const hcount = (id: string, symbol: string, name: string) =>
  quantity(id, symbol, name, undefined, 0, 60, 0.01, { figures: 3 });

const nmrMain: ModuleDef = {
  id: 'g.he-instrumentTrace-nmr',
  title: 'H in each ¹H NMR signal from its integral',
  use: 'Use this for “C₄H₈O₂ gives integrals 26, 17.4 and 26.1. How many H does each signal stand for?”',
  assumptions: [
    'An integral counts H, not carbons: each signal’s share of the integrals is its share of the H.',
    'Round each H count to a whole number. Ethyl ethanoate (CH₃COOCH₂CH₃) is drawn.',
  ],
  variables: [
    quantity('H', 'H', 'H in the formula', undefined, 1, 60, 1, { integer: true }),
    integral('I1', 'I₁', 'Integral of signal a'),
    integral('I2', 'I₂', 'Integral of signal b'),
    integral('I3', 'I₃', 'Integral of signal c'),
    integral('sum', 'ΣI', 'Sum of the integrals'),
    hcount('h1', 'h₁', 'H in signal a'),
    hcount('h2', 'h₂', 'H in signal b'),
    hcount('h3', 'h₃', 'H in signal c'),
  ],
  ...rules(integralSum, share('h1', 'I1'), share('h2', 'I2'), share('h3', 'I3')),
  example: {
    H: 8,
    I1: 26,
    I2: 17.4,
    I3: 26.1,
    sum: 69.5,
    h1: (8 * 26) / 69.5,
    h2: (8 * 17.4) / 69.5,
    h3: (8 * 26.1) / 69.5,
  },
  startWith: ['H', 'I1', 'I2', 'I3'],
  representation: {
    kind: 'instrumentTrace',
    mode: 'nmr',
    smiles: 'CC(=O)OCC',
    name: 'Ethyl ethanoate, C₄H₈O₂',
    hydrogens: 'H',
    signals: [
      { shift: 2.03, neighbors: 0, integral: 'I1', count: 'h1', atoms: [0] },
      { shift: 4.12, neighbors: 3, integral: 'I2', count: 'h2', atoms: [4] },
      { shift: 1.26, neighbors: 2, integral: 'I3', count: 'h3', atoms: [5] },
    ],
  },
};

/** lines = n + 1. */
const linesRule: Rule = {
  relation: {
    id: 'lines = n + 1',
    display: '{lines} = {n} + 1',
    vars: ['lines', 'n'],
    residual: (v) => v.lines! - v.n! - 1,
    solve: { lines: (v) => v.n! + 1, n: (v) => v.lines! - 1 },
  },
  steps: {
    lines: st('{n} + 1', 'n equivalent neighbors split a signal into n + 1 lines.'),
    n: st('{lines} − 1', 'One fewer neighbor than lines.'),
  },
};

const nmrSeptet: ModuleDef = {
  id: 'g.he-instrumentTrace-nmr-septet',
  title: 'A septet’s width in Hz and ppm (propan-2-ol at 60 MHz)',
  use: 'Use this for “How wide, in Hz and in ppm, is a septet with J = 6.1 Hz at 60 MHz?”',
  assumptions: [
    'Equal J to every equivalent neighbor; the lines are J apart.',
    'δ stays the same on any magnet; a width in Hz does not, so it is divided by ν₀ (MHz) for ppm.',
  ],
  variables: [
    quantity('n', 'n', 'Neighboring H', undefined, 0, 8, 1, { integer: true }),
    quantity('lines', 'lines', 'Lines in the multiplet', undefined, 1, 9, 1, { integer: true }),
    quantity('J', 'J', 'Coupling constant', 'Hz', 0.1, 30, 0.1),
    quantity('W', 'W', 'Multiplet width', 'Hz', 0, 300, 0.1),
    quantity('nu0', 'ν₀', 'Spectrometer frequency', 'MHz', 20, 1200, 1),
    quantity('Wppm', 'W_ppm', 'Multiplet width in ppm', 'ppm', 0, 20, 0.0001, { figures: 3 }),
  ],
  ...rules(
    linesRule,
    product('W = nJ', 'W', 'n', 'J', [
      'The outer lines are n gaps of J apart.',
      'Divide the width by J.',
      'Divide the width by the number of gaps.',
    ]),
    quotient('W(ppm) = W ÷ ν₀', 'Wppm', 'W', 'nu0', [
      'Hz over MHz gives parts per million.',
      'Multiply the ppm width by ν₀.',
      'Divide the Hz width by the ppm width.',
    ]),
  ),
  example: { n: 6, lines: 7, J: 6.1, W: 36.6, nu0: 60, Wppm: 0.61 },
  startWith: ['n', 'J', 'nu0'],
  representation: {
    kind: 'instrumentTrace',
    mode: 'nmr',
    smiles: 'CC(C)O',
    name: 'Propan-2-ol, C₃H₈O',
    coupling: 'J',
    field: 'nu0',
    signals: [
      { shift: 4.01, neighbors: 'n', integral: 1, count: 1, atoms: [1] },
      { shift: 2.2, neighbors: 0, integral: 1, count: 1, atoms: [3] },
      { shift: 1.2, neighbors: 1, integral: 6, count: 6, atoms: [0, 2] },
    ],
  },
};

// ─── HC55 chromatogram (analytical#3) ───────────────────────────────────────

const minutes = (id: string, symbol: string, name: string) =>
  quantity(id, symbol, name, 'min', 0.01, 1000, 0.01);

const resolutionRule: Rule = {
  relation: {
    id: 'R = 2(t₂ − t₁) ÷ (w₁ + w₂)',
    display: '{R} = 2 × ({t2} − {t1}) ÷ ({w1} + {w2})',
    vars: ['R', 't1', 't2', 'w1', 'w2'],
    residual: (v) => v.R! * (v.w1! + v.w2!) - 2 * (v.t2! - v.t1!),
    solve: {
      R: (v) => div(2 * (v.t2! - v.t1!), v.w1! + v.w2!),
      t2: (v) => v.t1! + (v.R! * (v.w1! + v.w2!)) / 2,
      t1: (v) => pos(v.t2! - (v.R! * (v.w1! + v.w2!)) / 2),
    },
  },
  steps: {
    R: st(
      '2 × ({t2} − {t1}) ÷ ({w1} + {w2})',
      'Twice the gap between the peaks over the sum of their base widths.',
    ),
    t2: st('{t1} + {R} × ({w1} + {w2}) ÷ 2', 'Add half of R times the widths to t₁.'),
    t1: st('{t2} − {R} × ({w1} + {w2}) ÷ 2', 'Take half of R times the widths from t₂.'),
  },
};

const factor = (k: string, t: string): Rule => ({
  relation: {
    id: `${k} = (${t} − t_M) ÷ t_M`,
    display: `{${k}} = ({${t}} − {tM}) ÷ {tM}`,
    vars: [k, t, 'tM'],
    residual: (v) => v[k]! * v.tM! - (v[t]! - v.tM!),
    solve: {
      [k]: (v) => div(v[t]! - v.tM!, v.tM!),
      [t]: (v) => v.tM! * (1 + v[k]!),
      tM: (v) => div(v[t]!, 1 + v[k]!),
    },
  },
  steps: {
    [k]: st(`({${t}} − {tM}) ÷ {tM}`, 'Time held on the column over the time in the mobile phase.'),
    [t]: st(`{tM} × (1 + {${k}})`, 'The dead time plus k dead times.'),
    tM: st(`{${t}} ÷ (1 + {${k}})`, 'Divide the retention time by 1 + k.'),
  },
});

const platesRule: Rule = {
  relation: {
    id: 'N = 16(t₂ ÷ w₂)²',
    display: '{N} = 16 × ({t2} ÷ {w2})²',
    vars: ['N', 't2', 'w2'],
    residual: (v) => v.N! * v.w2! ** 2 - 16 * v.t2! ** 2,
    solve: {
      N: (v) => div(16 * v.t2! ** 2, v.w2! ** 2),
      w2: (v) => pos((4 * v.t2!) / Math.sqrt(v.N!)),
    },
  },
  steps: {
    N: st(
      '16 × ({t2} ÷ {w2})²',
      'Square the retention time over the base width and multiply by 16.',
    ),
    w2: st('4 × {t2} ÷ √{N}', 'A peak 4σ wide: w = 4t ÷ √N.'),
  },
};

const chromDemo = (id: string, title: string, t2: number): ModuleDef => {
  const [tM, t1, w1, w2] = [1.0, 5.0, 0.3, 0.32];
  const k1 = (t1 - tM) / tM;
  const k2 = (t2 - tM) / tM;
  return {
    id,
    title,
    use: `Use this for “t_M = 1.00 min; peaks at 5.00 and ${t2.toFixed(2)} min, base widths 0.30 and 0.32 min. Find R, k, α and N.”`,
    assumptions: [
      'Widths are measured at the base, where the peak’s tangents meet the baseline (4σ).',
      'R of 1.5 or more separates two peaks to the baseline.',
    ],
    variables: [
      minutes('tM', 't_M', 'Dead time'),
      minutes('t1', 't₁', 'Retention time of peak 1'),
      minutes('t2', 't₂', 'Retention time of peak 2'),
      minutes('w1', 'w₁', 'Base width of peak 1'),
      minutes('w2', 'w₂', 'Base width of peak 2'),
      quantity('R', 'R', 'Resolution', undefined, 0, 50, 0.01),
      quantity('k1', 'k₁', 'Retention factor of peak 1', undefined, 0.001, 1000, 0.001),
      quantity('k2', 'k₂', 'Retention factor of peak 2', undefined, 0.001, 1000, 0.001),
      quantity('alpha', 'α', 'Selectivity', undefined, 0, 100, 0.001),
      quantity('N', 'N', 'Plates (peak 2)', undefined, 1, 1e7, 1),
    ],
    ...rules(
      resolutionRule,
      factor('k1', 't1'),
      factor('k2', 't2'),
      quotient('α = k₂ ÷ k₁', 'alpha', 'k2', 'k1', [
        'How many times longer the column holds the second.',
        'Multiply α by k₁.',
        'Divide k₂ by α.',
      ]),
      platesRule,
    ),
    example: {
      tM,
      t1,
      t2,
      w1,
      w2,
      R: (2 * (t2 - t1)) / (w1 + w2),
      k1,
      k2,
      alpha: k2 / k1,
      N: 16 * (t2 / w2) ** 2,
    },
    startWith: ['tM', 't1', 't2', 'w1', 'w2'],
    representation: {
      kind: 'instrumentTrace',
      mode: 'chromatogram',
      dead: 'tM',
      peaks: [
        { time: 't1', width: 'w1' },
        { time: 't2', width: 'w2' },
      ],
      resolution: 'R',
      factors: ['k1', 'k2'],
      selectivity: 'alpha',
      plates: 'N',
    },
  };
};

// ─── HC55 rotational spectrum (physical-2#4) ────────────────────────────────

/** h ÷ (8π²c) with c in cm/s, in kg·m²·cm⁻¹ (B = this ÷ I). */
const ROTOR = 2.799e-46;
const AMU = 1.6605e-27;

const reduced: Rule = {
  relation: {
    id: 'μ = m₁m₂ ÷ (m₁ + m₂) × u',
    display: '{mu} = {m1} × {m2} ÷ ({m1} + {m2}) × 1.6605 × 10⁻²⁷',
    vars: ['mu', 'm1', 'm2'],
    residual: (v) => v.mu! / (((v.m1! * v.m2!) / (v.m1! + v.m2!)) * AMU) - 1,
    solve: { mu: (v) => ((v.m1! * v.m2!) / (v.m1! + v.m2!)) * AMU },
  },
  steps: {
    mu: st(
      '{m1} × {m2} ÷ ({m1} + {m2}) × 1.6605 × 10⁻²⁷',
      'Product over sum of the masses, then u to kg.',
    ),
  },
};

const inertia: Rule = {
  relation: {
    id: 'I = μr²',
    display: '{I} = {mu} × ({r} × 10⁻¹²)²',
    vars: ['I', 'mu', 'r'],
    residual: (v) => v.I! / (v.mu! * (v.r! * 1e-12) ** 2) - 1,
    solve: {
      I: (v) => v.mu! * (v.r! * 1e-12) ** 2,
      r: (v) => pos(Math.sqrt(v.I! / v.mu!) * 1e12),
    },
  },
  steps: {
    I: st('{mu} × ({r} × 10⁻¹²)²', 'Reduced mass times the bond length (pm to m) squared.'),
    r: st('√({I} ÷ {mu}) × 10¹²', 'Square root of I over μ, then m to pm.'),
  },
};

const rotorB: Rule = {
  relation: {
    id: 'B = h ÷ (8π²cI)',
    display: '{B} = 2.799 × 10⁻⁴⁶ ÷ {I}',
    vars: ['B', 'I'],
    residual: (v) => (v.B! * v.I!) / ROTOR - 1,
    solve: { B: (v) => div(ROTOR, v.I!), I: (v) => div(ROTOR, v.B!) },
  },
  steps: {
    B: st('2.799 × 10⁻⁴⁶ ÷ {I}', 'h ÷ (8π²c) over the moment of inertia.'),
    I: st('2.799 × 10⁻⁴⁶ ÷ {B}', 'h ÷ (8π²c) over B.'),
  },
};

const lineRule: Rule = {
  relation: {
    id: 'ν̃ = 2B(J + 1)',
    display: '{nu} = 2 × {B} × ({J} + 1)',
    vars: ['nu', 'B', 'J'],
    residual: (v) => v.nu! - 2 * v.B! * (v.J! + 1),
    solve: {
      nu: (v) => 2 * v.B! * (v.J! + 1),
      B: (v) => div(v.nu!, 2 * (v.J! + 1)),
    },
  },
  steps: {
    nu: st('2 × {B} × ({J} + 1)', 'A J → J + 1 line sits at 2B(J + 1).'),
    B: st('{nu} ÷ (2 × ({J} + 1))', 'Divide the line by 2(J + 1).'),
  },
};

const wavenumber = (id: string, symbol: string, name: string, more: Partial<VariableDef> = {}) =>
  quantity(id, symbol, name, 'cm⁻¹', 0.01, 10000, 0.01, { figures: 4, ...more });

const rotHCl: ModuleDef = (() => {
  const [m1, m2, r] = [1.008, 34.969, 127.5];
  const mu = ((m1 * m2) / (m1 + m2)) * AMU;
  const I = mu * (r * 1e-12) ** 2;
  const B = ROTOR / I;
  return {
    id: 'g.he-instrumentTrace-rotational',
    title: 'H³⁵Cl’s microwave lines, 2B apart',
    use: 'Use this for “H–³⁵Cl has r = 127.5 pm. Find I, B and the J = 0 → 1 line.”',
    assumptions: [
      'A rigid rotor: absorption takes ΔJ = +1, so the lines are 2B apart; only polar molecules show them.',
      'h ÷ (8π²c) = 2.799 × 10⁻⁴⁶ kg·m²·cm⁻¹ with c in cm/s; 1 u = 1.6605 × 10⁻²⁷ kg.',
    ],
    variables: [
      quantity('m1', 'm₁', 'Mass of H', 'u', 0.5, 300, 0.001),
      quantity('m2', 'm₂', 'Mass of ³⁵Cl', 'u', 0.5, 300, 0.001),
      quantity('mu', 'μ', 'Reduced mass', 'kg', 1e-28, 1e-24, 1e-30, { scientific: true }),
      quantity('r', 'r', 'Bond length', 'pm', 50, 500, 0.1),
      quantity('I', 'I', 'Moment of inertia', 'kg·m²', 1e-48, 1e-43, 1e-49, { scientific: true }),
      wavenumber('B', 'B', 'Rotational constant'),
      quantity('J', 'J', 'Lower level', undefined, 0, 30, 1, { integer: true }),
      wavenumber('nu', 'ν̃', 'Line'),
    ],
    ...rules(reduced, inertia, rotorB, lineRule),
    example: { m1, m2, mu, r, I, B, J: 0, nu: 2 * B },
    startWith: ['m1', 'm2', 'r', 'J'],
    representation: {
      kind: 'instrumentTrace',
      mode: 'rotational',
      constant: 'B',
      lower: 'J',
      line: 'nu',
      name: 'H³⁵Cl at 298.15 K',
    },
  };
})();

const rotCO: ModuleDef = {
  id: 'g.he-instrumentTrace-rotational-hot',
  title: 'CO at 500 K: many lines, the strongest far from J = 0',
  use: 'Use this for “Where is CO’s J = 7 → 8 line (B = 1.921 cm⁻¹), and how far apart are the lines?”',
  assumptions: [
    'A rigid rotor at temperature T: line heights follow the lower level’s population, (2J + 1)e^(−hcBJ(J + 1) ÷ kT).',
    'hc ÷ k = 1.4388 cm·K.',
  ],
  variables: [
    wavenumber('B', 'B', 'Rotational constant'),
    quantity('T', 'T', 'Temperature', 'K', 10, 3000, 1),
    quantity('J', 'J', 'Lower level', undefined, 0, 30, 1, { integer: true }),
    wavenumber('nu', 'ν̃', 'Line'),
    wavenumber('s', '2B', 'Line spacing'),
  ],
  ...rules(lineRule, {
    relation: {
      id: 'spacing = 2B',
      display: '{s} = 2 × {B}',
      vars: ['s', 'B'],
      residual: (v) => v.s! - 2 * v.B!,
      solve: { s: (v) => 2 * v.B!, B: (v) => v.s! / 2 },
    },
    steps: {
      s: st('2 × {B}', 'Neighboring lines differ by 2B.'),
      B: st('{s} ÷ 2', 'Half the spacing.'),
    },
  }),
  standalone: { vars: ['T'], why: 'The temperature sets only the line heights the picture draws.' },
  example: { B: 1.921, T: 500, J: 7, nu: 2 * 1.921 * 8, s: 2 * 1.921 },
  startWith: ['B', 'J', 'T'],
  representation: {
    kind: 'instrumentTrace',
    mode: 'rotational',
    constant: 'B',
    temperature: 'T',
    lower: 'J',
    line: 'nu',
    spacing: 's',
    name: 'CO',
  },
};

// ─── HC55 the IR sort's cards (organic-1#4~ir-bands) ────────────────────────

const irCard = (...bands: IrBand[]) => ({ kind: 'ir' as const, bands });

const irBands: LayoutDef = {
  kind: 'sort',
  id: 'g.he-instrumentTrace-ir-cards',
  title: 'Which group does the IR band show?',
  use: 'Use this for “Which functional group gives a strong sharp band at 1715 cm⁻¹?”',
  assumptions: [
    'Each card’s spectrum is drawn from its band list: transmittance dips into each band, 4000 → 400 cm⁻¹.',
    'A very broad dip from 2500 to 3300 is an acid’s O–H; a rounded one near 3350 is an alcohol’s.',
  ],
  question: 'Which bond gives the band?',
  bins: [
    {
      id: 'oh',
      label: 'Alcohol O–H (broad, 3200–3550 cm⁻¹)',
      why: 'Hydrogen bonding spreads the O–H stretch into a rounded band.',
    },
    {
      id: 'acid',
      label: 'Acid O–H (very broad, 2500–3300)',
      why: 'Acid dimers hold the O–H in strong hydrogen bonds: a very wide band.',
    },
    {
      id: 'co',
      label: 'C=O (1670–1780)',
      why: 'A strong, sharp band: the C=O stretch changes the dipole a lot.',
    },
    {
      id: 'cn',
      label: 'C≡N or C≡C (2100–2260)',
      why: 'Triple bonds are stiff: a sharp band in an otherwise empty region.',
    },
    { id: 'cc', label: 'C=C (1620–1680)', why: 'A weak band just below the C=O region.' },
  ],
  cards: [
    {
      label: 'A broad band at 3350',
      bin: 'oh',
      figure: irCard({ at: 3350, shape: 'broad' }, { at: 2950, strength: 'medium' }, { at: 1050 }),
    },
    {
      label: 'A broad band at 3400',
      bin: 'oh',
      figure: irCard(
        { at: 3400, shape: 'broad' },
        { at: 2930, strength: 'medium' },
        { at: 1100, strength: 'medium' },
      ),
    },
    {
      label: 'A very broad band from 2500 to 3300',
      bin: 'acid',
      figure: irCard(
        { at: 2500, to: 3300, strength: 'medium' },
        { at: 1710 },
        { at: 1290, strength: 'medium' },
      ),
    },
    {
      label: 'A strong sharp band at 1715',
      bin: 'co',
      figure: irCard({ at: 2960, strength: 'medium' }, { at: 1715 }),
    },
    {
      label: 'A strong band at 1735',
      bin: 'co',
      figure: irCard({ at: 2980, strength: 'medium' }, { at: 1735 }, { at: 1240 }),
    },
    {
      label: 'A sharp band at 2250',
      bin: 'cn',
      figure: irCard({ at: 2950, strength: 'medium' }, { at: 2250 }),
    },
    {
      label: 'A weak band at 1650',
      bin: 'cc',
      figure: irCard(
        { at: 3080, strength: 'weak' },
        { at: 2930, strength: 'medium' },
        { at: 1650, strength: 'weak' },
        { at: 910, strength: 'medium' },
      ),
    },
  ],
};

const HC55_DEMOS: ModuleDef[] = [
  nmrMain,
  nmrSeptet,
  chromDemo(
    'g.he-instrumentTrace-chromatogram',
    'Two peaks: resolution, retention factors, plates',
    5.6,
  ),
  chromDemo(
    'g.he-instrumentTrace-chromatogram-overlap',
    'Two peaks that overlap (R under 1.5)',
    5.25,
  ),
  rotHCl,
  rotCO,
];

// ─── HC70 orbitalDiagram mode `mo` (gen-chem-1#4~bond-order, physical-2#3, ~huckel) ──

/** The electrons a filled diagram holds in its bonding (or antibonding) MOs, as a sum. */
const moCount = (id: string, of: 'bonding' | 'antibonding' | 'unpaired'): Rule => {
  const count = (e: number) => {
    const mo = diatomicMOs(e);
    return of === 'bonding' ? mo.bonding : of === 'antibonding' ? mo.antibonding : mo.unpaired;
  };
  const parts = (e: number) => {
    const mo = diatomicMOs(e);
    if (of === 'unpaired') return [];
    return mo.levels
      .filter((l) => l.bonding === (of === 'bonding'))
      .map((l) => l.fill.reduce((a, x) => a + x, 0))
      .filter((x) => x > 0);
  };
  const phrase = of === 'unpaired' ? 'unpaired MO electrons of' : `${of} electrons of`;
  const how = {
    bonding: 'Fill σ2s, σ∗2s, then the 2p MOs in order; add the electrons in σ2s, π2p and σ2p.',
    antibonding: 'Add the electrons that land in σ∗2s, π∗2p and σ∗2p.',
    unpaired: 'Count the single arrows: a π pair takes one electron in each before any pairs.',
  }[of];
  return {
    relation: {
      id: `${id} from the filled MOs`,
      display: `{${id}} = ${phrase} {e}`,
      vars: [id, 'e'],
      residual: (v) => v[id]! - count(v.e!),
      solve: { [id]: (v) => count(v.e!), e: () => undefined },
    },
    steps: {
      [id]: {
        expr: `${phrase} {e}`,
        how,
        work: (v) => (parts(v.e!).length > 1 ? [parts(v.e!).join(' + ')] : []),
      },
    },
  };
};

const bondOrderRule: Rule = {
  relation: {
    id: 'bond order = (b − a) ÷ 2',
    display: '{BO} = ({b} − {a}) ÷ 2',
    vars: ['BO', 'b', 'a'],
    residual: (v) => v.BO! - (v.b! - v.a!) / 2,
    solve: {
      BO: (v) => (v.b! - v.a!) / 2,
      b: (v) => 2 * v.BO! + v.a!,
      a: (v) => v.b! - 2 * v.BO!,
    },
  },
  steps: {
    BO: st('({b} − {a}) ÷ 2', 'Bonding minus antibonding electrons, halved.'),
    b: st('2 × {BO} + {a}', 'Twice the bond order plus the antibonding electrons.'),
    a: st('{b} − 2 × {BO}', 'Bonding electrons less twice the bond order.'),
  },
};

const whole = (id: string, symbol: string, name: string, max: number) =>
  quantity(id, symbol, name, undefined, 0, max, 1, { integer: true });

const diatomicDemo = (
  id: string,
  title: string,
  formula: string,
  e: number,
  use: string,
): ModuleDef => {
  const mo = diatomicMOs(e);
  return {
    id,
    title,
    use,
    assumptions: [
      'Valence electrons only (2s and 2p); MOs fill from the lowest, one electron in each orbital of a π pair before any pairs.',
      'Through N₂ (10 valence electrons) s–p mixing puts π2p below σ2p; from O₂ on, σ2p is lower.',
    ],
    variables: [
      quantity('e', 'e', 'Valence electrons', undefined, 2, 16, 1, { integer: true }),
      whole('b', 'b', 'Bonding electrons', 16),
      whole('a', 'a', 'Antibonding electrons', 16),
      quantity('BO', 'BO', 'Bond order', undefined, -1, 4, 0.5),
      whole('u', 'u', 'Unpaired electrons', 4),
    ],
    ...rules(
      moCount('b', 'bonding'),
      moCount('a', 'antibonding'),
      bondOrderRule,
      moCount('u', 'unpaired'),
    ),
    example: { e, b: mo.bonding, a: mo.antibonding, BO: mo.bondOrder, u: mo.unpaired },
    startWith: ['e'],
    representation: {
      kind: 'orbitalDiagram',
      mode: 'mo',
      view: 'diatomic',
      formula,
      electrons: 'e',
      bonding: 'b',
      antibonding: 'a',
      bondOrder: 'BO',
      unpaired: 'u',
    },
  };
};

/** E± = (α_A + α_B) ÷ 2 ∓ √(((α_A − α_B) ÷ 2)² + β²). */
const eRoot = (id: 'Ep' | 'Em', sign: -1 | 1): Rule => {
  const op = sign < 0 ? '−' : '+';
  return {
    relation: {
      id: `${id === 'Ep' ? 'E₊' : 'E₋'} from the secular determinant`,
      display: `{${id}} = ({aA} + {aB}) ÷ 2 ${op} √((({aA} − {aB}) ÷ 2)² + {beta}²)`,
      vars: [id, 'aA', 'aB', 'beta'],
      residual: (v) => v[id]! - heteronuclear(v.aA!, v.aB!, v.beta!)[sign < 0 ? 'plus' : 'minus'],
      solve: { [id]: (v) => heteronuclear(v.aA!, v.aB!, v.beta!)[sign < 0 ? 'plus' : 'minus'] },
    },
    steps: {
      [id]: st(
        `({aA} + {aB}) ÷ 2 ${op} √((({aA} − {aB}) ÷ 2)² + {beta}²)`,
        sign < 0
          ? 'The lower root of the determinant: the bonding MO.'
          : 'The upper root: the antibonding MO.',
      ),
    },
  };
};

const eV = (id: string, symbol: string, name: string) =>
  quantity(id, symbol, name, 'eV', -100, 100, 0.01, { figures: 4 });

const heteroDemo: ModuleDef = {
  id: 'g.he-orbitalDiagram-mo-heteronuclear',
  title: 'Two AOs make two MOs: E± from the 2 × 2 determinant',
  use: 'Use this for “α_A = −10 eV, α_B = −14 eV, β = −3 eV. Find the bonding and antibonding energies.”',
  assumptions: [
    'The secular determinant |α_A − E, β; β, α_B − E| = 0, the overlap S neglected.',
    'β is negative, so E₊ (bonding) is the lower root; equal α gives α ± β.',
  ],
  variables: [
    eV('aA', 'α_A', 'Coulomb integral of A'),
    eV('aB', 'α_B', 'Coulomb integral of B'),
    quantity('beta', 'β', 'Resonance integral', 'eV', -20, -0.01, 0.01),
    eV('Ep', 'E₊', 'Bonding energy'),
    eV('Em', 'E₋', 'Antibonding energy'),
    quantity('dE', 'ΔE', 'Splitting', 'eV', 0, 200, 0.01, { figures: 4 }),
  ],
  ...rules(eRoot('Ep', -1), eRoot('Em', 1), {
    relation: {
      id: 'splitting = E₋ − E₊',
      display: '{dE} = {Em} − {Ep}',
      vars: ['dE', 'Em', 'Ep'],
      residual: (v) => v.dE! - (v.Em! - v.Ep!),
      solve: { dE: (v) => v.Em! - v.Ep! },
    },
    steps: { dE: st('{Em} − {Ep}', 'The antibonding level less the bonding one.') },
  }),
  example: (() => {
    const mo = heteronuclear(-10, -14, -3);
    return { aA: -10, aB: -14, beta: -3, Ep: mo.plus, Em: mo.minus, dE: mo.splitting };
  })(),
  startWith: ['aA', 'aB', 'beta'],
  representation: {
    kind: 'orbitalDiagram',
    mode: 'mo',
    view: 'heteronuclear',
    alphaA: 'aA',
    alphaB: 'aB',
    beta: 'beta',
    plus: 'Ep',
    minus: 'Em',
    splitting: 'dE',
  },
};

/** π energy beyond Nα: Σ electrons × 2cos(2πk ÷ N), in β. */
const frostSum = (of: 'energy' | 'unpaired'): Rule => {
  const id = of === 'energy' ? 'Epi' : 'u';
  const total = (v: Record<string, number>) =>
    of === 'energy' ? frost(v.N!, v.e!).energy : frost(v.N!, v.e!).unpaired;
  const parts = (N: number, e: number) =>
    frost(N, e)
      .levels.map((l) => [l.fill.reduce((a, x) => a + x, 0), Number(l.coef.toFixed(3))] as const)
      .filter(([n]) => n > 0)
      .map(([n, c]) => `${n} × ${c < 0 ? `(${c})` : c}`);
  const phrase =
    of === 'energy'
      ? 'Hückel energy of {e} electrons in a ring of {N}'
      : 'unpaired ring electrons of {e} in a ring of {N}';
  return {
    relation: {
      id: of === 'energy' ? 'π energy from the Frost levels' : 'unpaired from the Frost levels',
      display: `{${id}} = ${phrase}`,
      vars: [id, 'N', 'e'],
      residual: (v) => v[id]! - total(v),
      solve: { [id]: (v) => total(v), N: () => undefined, e: () => undefined },
    },
    steps: {
      [id]: {
        expr: phrase,
        how:
          of === 'energy'
            ? 'Fill the levels from α + 2β up; add each electron’s 2cos(2πk ÷ N).'
            : 'Count the single electrons in a half-filled pair.',
        work: (v) =>
          of === 'energy' && parts(v.N!, v.e!).length ? [parts(v.N!, v.e!).join(' + ')] : [],
      },
    },
  };
};

const frostDemo = (id: string, title: string, N: number, use: string): ModuleDef => {
  const f = frost(N, N);
  return {
    id,
    title,
    use,
    assumptions: [
      'Hückel theory: each ring carbon gives one p orbital; levels α + 2β cos(2πk ÷ N), β negative.',
      'Isolated double bonds hold each pair at α + β, so N electrons give Nβ; the difference is the delocalization energy.',
    ],
    variables: [
      quantity('N', 'N', 'Ring carbons', undefined, 3, 8, 1, { integer: true }),
      quantity('e', 'e', 'π electrons', undefined, 0, 16, 1, { integer: true }),
      quantity('Epi', 'E_π', 'π energy (in β)', undefined, -20, 20, 0.001),
      quantity('iso', 'E_iso', 'Isolated double bonds (in β)', undefined, 0, 20, 1),
      quantity('deloc', 'E_deloc', 'Delocalization (in β)', undefined, -10, 10, 0.001),
      whole('u', 'u', 'Unpaired electrons', 4),
    ],
    ...rules(
      frostSum('energy'),
      {
        relation: {
          id: 'isolated = e',
          display: '{iso} = {e} × 1',
          vars: ['iso', 'e'],
          residual: (v) => v.iso! - v.e!,
          solve: { iso: (v) => v.e!, e: (v) => v.iso! },
        },
        steps: {
          iso: st('{e} × 1', 'Each electron in an isolated C=C adds one β.'),
          e: st('{iso} ÷ 1', 'One electron per β.'),
        },
      },
      {
        relation: {
          id: 'delocalization = E_π − E_iso',
          display: '{deloc} = {Epi} − {iso}',
          vars: ['deloc', 'Epi', 'iso'],
          residual: (v) => v.deloc! - (v.Epi! - v.iso!),
          solve: {
            deloc: (v) => v.Epi! - v.iso!,
            Epi: (v) => v.deloc! + v.iso!,
            iso: (v) => v.Epi! - v.deloc!,
          },
        },
        steps: {
          deloc: st('{Epi} − {iso}', 'What the ring gains over isolated double bonds.'),
          Epi: st('{deloc} + {iso}', 'Isolated double bonds plus the delocalization.'),
          iso: st('{Epi} − {deloc}', 'The ring’s π energy less the delocalization.'),
        },
      },
      frostSum('unpaired'),
      limit(
        'π electrons in pairs, at most 2N',
        '{e} ≤ 2 × {N}',
        (v) => v.e! <= 2 * v.N! && Math.round(v.e!) % 2 === 0,
        'Type an even number of π electrons, at most two per ring carbon.',
      ),
    ),
    example: { N, e: N, Epi: f.energy, iso: f.isolated, deloc: f.delocalization, u: f.unpaired },
    startWith: ['N', 'e'],
    representation: {
      kind: 'orbitalDiagram',
      mode: 'mo',
      view: 'frost',
      ring: 'N',
      electrons: 'e',
      energy: 'Epi',
      isolated: 'iso',
      delocalization: 'deloc',
      unpaired: 'u',
    },
  };
};

const HC70_DEMOS: ModuleDef[] = [
  diatomicDemo(
    'g.he-orbitalDiagram-mo-diatomic',
    'O₂’s MO diagram: bond order 2, two unpaired electrons',
    'O2',
    12,
    'Use this for “Find the bond order of O₂ and say whether it is paramagnetic.”',
  ),
  diatomicDemo(
    'g.he-orbitalDiagram-mo-diatomic-ion',
    'N₂⁺: s–p mixing, bond order 2.5',
    'N2+',
    9,
    'Use this for “Find the bond order of N₂⁺ and its unpaired electrons.”',
  ),
  heteroDemo,
  frostDemo(
    'g.he-orbitalDiagram-mo-frost',
    'Benzene’s Frost circle: 2β of delocalization',
    6,
    'Use this for “Find benzene’s π energy and delocalization energy by Hückel theory.”',
  ),
  frostDemo(
    'g.he-orbitalDiagram-mo-frost-antiaromatic',
    'Cyclobutadiene: no delocalization, two unpaired electrons',
    4,
    'Use this for “Why is cyclobutadiene antiaromatic? Find its π energy by Hückel theory.”',
  ),
];

// ─── HC72 vsepr 5–6 domains (gen-chem-1#4) and complexes (inorganic#1) ──────

const loneRule: Rule = {
  relation: {
    id: 'l = (V − 2b − o) ÷ 2',
    display: '{l} = ({V} − 2 × {b} − {o}) ÷ 2',
    vars: ['l', 'V', 'b', 'o'],
    residual: (v) => 2 * v.l! - (v.V! - 2 * v.b! - v.o!),
    solve: {
      l: (v) => (v.V! - 2 * v.b! - v.o!) / 2,
      V: (v) => 2 * v.l! + 2 * v.b! + v.o!,
      o: (v) => v.V! - 2 * v.b! - 2 * v.l!,
    },
  },
  steps: {
    l: st(
      '({V} − 2 × {b} − {o}) ÷ 2',
      'Take the bonds’ pairs and the outer atoms’ lone electrons from V; halve what is left.',
    ),
    V: st(
      '2 × {l} + 2 × {b} + {o}',
      'Add the center’s lone electrons, the bonds’ electrons and the outer ones.',
    ),
    o: st('{V} − 2 × {b} − 2 × {l}', 'What the bonds and the center’s lone pairs leave.'),
  },
};

const domainRule: Rule = {
  relation: {
    id: 'd = b + l',
    display: '{d} = {b} + {l}',
    vars: ['d', 'b', 'l'],
    residual: (v) => v.d! - v.b! - v.l!,
    solve: { d: (v) => v.b! + v.l!, b: (v) => v.d! - v.l!, l: (v) => v.d! - v.b! },
  },
  steps: {
    d: st('{b} + {l}', 'Each bonded atom and each lone pair is one electron domain.'),
    b: st('{d} − {l}', 'Domains less lone pairs.'),
    l: st('{d} − {b}', 'Domains less bonded atoms.'),
  },
};

const thetaRule: Rule = {
  relation: {
    id: 'θ from d',
    display: '{theta} = smallest angle between {d} domains',
    vars: ['theta', 'd'],
    residual: (v) => v.theta! - domainAngleOf(v.d!),
    solve: { theta: (v) => domainAngleOf(v.d!), d: () => undefined },
  },
  steps: {
    theta: {
      expr: 'smallest angle between {d} domains',
      how: 'Two domains 180°, three 120°, four 109.5°, five and six 90° at the closest.',
    },
  },
};

const vseprDemo = (
  id: string,
  title: string,
  formula: string,
  [V, b, o]: [number, number, number],
): ModuleDef => {
  const l = (V - 2 * b - o) / 2;
  return {
    id,
    title,
    use: `Use this for “Give the shape, the smallest bond angle and the hybridization of ${formula}.”`,
    assumptions: [
      'Count an ion’s charge in V; hybrid orbitals = domains (sp, sp², sp³, sp³d, sp³d²).',
      'Lone pairs take the roomiest places: equatorial in 5 domains, trans in 6.',
    ],
    variables: [
      whole('V', 'V', 'Valence electrons', 60),
      quantity('b', 'b', 'Bonded atoms', undefined, 2, 6, 1, { integer: true }),
      whole('o', 'o', 'Lone electrons on the outer atoms', 42),
      quantity('l', 'l', 'Lone pairs on the center', undefined, 0, 3, 1, { integer: true }),
      quantity('d', 'd', 'Electron domains', undefined, 2, 6, 1, { integer: true }),
      quantity('theta', 'θ', 'Smallest ideal angle', '°', 90, 180, 0.5),
    ],
    ...rules(loneRule, domainRule, thetaRule),
    example: { V, b, o, l, d: b + l, theta: domainAngleOf(b + l) },
    startWith: ['V', 'b', 'o'],
    representation: {
      kind: 'vsepr',
      mode: 'expanded',
      bonded: 'b',
      lone: 'l',
      angle: 'theta',
      domains: 'd',
    },
  };
};

const oxidationRule: Rule = {
  relation: {
    id: 'oxidation state = q − ligand charge',
    display: '{ox} = {q} − {L}',
    vars: ['ox', 'q', 'L'],
    residual: (v) => v.ox! - (v.q! - v.L!),
    solve: { ox: (v) => v.q! - v.L!, q: (v) => v.ox! + v.L!, L: (v) => v.q! - v.ox! },
  },
  steps: {
    ox: st('{q} − {L}', 'The ion’s charge less what the ligands bring.'),
    q: st('{ox} + {L}', 'The metal’s charge plus the ligands’.'),
    L: st('{q} − {ox}', 'The ion’s charge less the metal’s.'),
  },
};

const dCountRule: Rule = {
  relation: {
    id: 'd count = group − oxidation state',
    display: '{dn} = {G} − {ox}',
    vars: ['dn', 'G', 'ox'],
    residual: (v) => v.dn! - (v.G! - v.ox!),
    solve: { dn: (v) => v.G! - v.ox!, G: (v) => v.dn! + v.ox!, ox: (v) => v.G! - v.dn! },
  },
  steps: {
    dn: st(
      '{G} − {ox}',
      'The group number counts the metal’s valence electrons; the charge takes some away.',
    ),
    G: st('{dn} + {ox}', 'd electrons plus the oxidation state.'),
    ox: st('{G} − {dn}', 'The group less the d electrons.'),
  },
};

const complexDemo = (
  id: string,
  title: string,
  formula: string,
  complex: Extract<Representation, { kind: 'vsepr'; mode: 'complex' }>['complex'],
  [q, L, G]: [number, number, number],
): ModuleDef => {
  const cn = complex.ligands.reduce((s, x) => s + x.count, 0);
  return {
    id,
    title,
    use: `Use this for “Find the oxidation state, d count and coordination number of ${formula}.”`,
    assumptions: [
      'NH₃ and H₂O are neutral ligands, Cl⁻ and CN⁻ carry −1; the d count is the group number less the oxidation state.',
      complex.isomer
        ? `The minority ligand is drawn ${complex.isomer}; the coordination number counts the donor atoms.`
        : 'The coordination number counts the donor atoms on the metal.',
    ],
    variables: [
      quantity('q', 'q', 'Charge of the complex ion', undefined, -4, 4, 1, { integer: true }),
      quantity('L', 'L', 'Total ligand charge', undefined, -6, 0, 1, { integer: true }),
      quantity('ox', 'ox', 'Oxidation state of the metal', undefined, -2, 8, 1, { integer: true }),
      quantity('G', 'G', 'Group of the metal', undefined, 3, 12, 1, { integer: true }),
      quantity('dn', 'd', 'd electrons', undefined, 0, 10, 1, { integer: true }),
      quantity('CN', 'CN', 'Coordination number', undefined, cn, cn, 1, { integer: true }),
    ],
    ...rules(oxidationRule, dCountRule),
    standalone: {
      vars: ['CN'],
      why: 'The coordination number is counted on the drawing: the donor atoms on this metal.',
    },
    example: { q, L, ox: q - L, G, dn: G - (q - L), CN: cn },
    startWith: ['q', 'L', 'G', 'CN'],
    representation: {
      kind: 'vsepr',
      mode: 'complex',
      complex: { ...complex, formula },
      coordination: 'CN',
    },
  };
};

const HC72_DEMOS: ModuleDef[] = [
  vseprDemo(
    'g.he-vsepr-expanded',
    'XeF₄: six domains, two lone pairs trans, square planar',
    'XeF₄',
    [36, 4, 24],
  ),
  vseprDemo(
    'g.he-vsepr-expanded-seesaw',
    'SF₄: five domains, the lone pair equatorial',
    'SF₄',
    [34, 4, 24],
  ),
  vseprDemo(
    'g.he-vsepr-expanded-linear',
    'XeF₂: three lone pairs equatorial leave a line',
    'XeF₂',
    [22, 2, 12],
  ),
  complexDemo(
    'g.he-vsepr-complex-cis',
    'cis-[Co(NH₃)₄Cl₂]⁺: the two Cl 90° apart',
    '[Co(NH₃)₄Cl₂]⁺',
    {
      metal: 'Co',
      geometry: 'octahedral',
      ligands: [
        { name: 'NH3', count: 4, donor: 'N' },
        { name: 'Cl', count: 2, donor: 'Cl' },
      ],
      isomer: 'cis',
    },
    [1, -2, 9],
  ),
  complexDemo(
    'g.he-vsepr-complex-mer',
    'mer-[Co(NH₃)₃Cl₃]: three Cl in a plane through the metal',
    '[Co(NH₃)₃Cl₃]',
    {
      metal: 'Co',
      geometry: 'octahedral',
      ligands: [
        { name: 'NH3', count: 3, donor: 'N' },
        { name: 'Cl', count: 3, donor: 'Cl' },
      ],
      isomer: 'mer',
    },
    [0, -3, 9],
  ),
  complexDemo(
    'g.he-vsepr-complex-trans',
    'trans-[Pt(NH₃)₂Cl₂]: square planar, the Cl opposite',
    '[Pt(NH₃)₂Cl₂]',
    {
      metal: 'Pt',
      geometry: 'squarePlanar',
      ligands: [
        { name: 'NH3', count: 2, donor: 'N' },
        { name: 'Cl', count: 2, donor: 'Cl' },
      ],
      isomer: 'trans',
    },
    [0, -2, 10],
  ),
];

// ─── HC74 moleMap boxes (gen-chem-1#1~solution-stoich, #2~gas-stoich) and combustion (#1) ──

/** n = C × V with V in mL. */
const molarityRule = (n: string, C: string, V: string): Rule => ({
  relation: {
    id: `${n} = ${C} × ${V} ÷ 1000`,
    display: `{${n}} = {${C}} × {${V}} ÷ 1000`,
    vars: [n, C, V],
    residual: (v) => 1000 * v[n]! - v[C]! * v[V]!,
    solve: {
      [n]: (v) => (v[C]! * v[V]!) / 1000,
      [C]: (v) => div(1000 * v[n]!, v[V]!),
      [V]: (v) => div(1000 * v[n]!, v[C]!),
    },
  },
  steps: {
    [n]: st(`{${C}} × {${V}} ÷ 1000`, 'Molarity times the volume in litres (mL ÷ 1000).'),
    [C]: st(`1000 × {${n}} ÷ {${V}}`, 'Moles per litre of solution.'),
    [V]: st(`1000 × {${n}} ÷ {${C}}`, 'Moles over molarity gives litres; × 1000 for mL.'),
  },
});

const ratioRule: Rule = product('n₂ = r × n₁', 'n2', 'r', 'n1', [
  'The mole ratio from the balanced equation carries the moles across.',
  'Divide the second’s moles by the first’s.',
  'Divide the second’s moles by the ratio.',
]);

const gasRule = (n: string): Rule => ({
  relation: {
    id: 'V = nRT ÷ P',
    display: `{V} = {${n}} × 0.08206 × {T} ÷ {P}`,
    vars: ['V', n, 'T', 'P'],
    residual: (v) => v.V! * v.P! - v[n]! * 0.08206 * v.T!,
    solve: {
      V: (v) => div(v[n]! * 0.08206 * v.T!, v.P!),
      [n]: (v) => div(v.V! * v.P!, 0.08206 * v.T!),
      T: (v) => div(v.V! * v.P!, v[n]! * 0.08206),
      P: (v) => div(v[n]! * 0.08206 * v.T!, v.V!),
    },
  },
  steps: {
    V: st(`{${n}} × 0.08206 × {T} ÷ {P}`, 'The ideal gas law solved for V.'),
    [n]: st(`{V} × {P} ÷ (0.08206 × {T})`, 'PV ÷ RT counts the moles of gas.'),
    T: st(`{V} × {P} ÷ ({${n}} × 0.08206)`, 'Solve PV = nRT for T: PV ÷ nR.'),
    P: st(`{${n}} × 0.08206 × {T} ÷ {V}`, 'Solve PV = nRT for P: nRT ÷ V.'),
  },
});

const molarityVar = (id: string, symbol: string, name: string) =>
  quantity(id, symbol, name, 'M', 0.0001, 20, 0.001);
const mlVar = (id: string, symbol: string, name: string) =>
  quantity(id, symbol, name, 'mL', 0.01, 10000, 0.01);
const molVar = (id: string, symbol: string, name: string) =>
  quantity(id, symbol, name, 'mol', 1e-9, 1000, 1e-6, { figures: 4 });
const ratioVar = quantity('r', 'r', 'Mole ratio (second per first)', undefined, 0.1, 10, 0.001, {
  allowed: [1, 2, 3, 0.5, 1 / 3, 1.5, 2 / 3],
});

const solutionDemo: ModuleDef = {
  id: 'g.he-moleMap-solution',
  unitSystems: ['metric'],
  title: 'Titration stoichiometry: solution to moles to solution',
  use: 'Use this for “What volume of 0.100 M NaOH reacts with 25.00 mL of 0.150 M H₂SO₄?”',
  assumptions: [
    'H₂SO₄ + 2NaOH → Na₂SO₄ + 2H₂O: 2 mol of base for each mol of acid.',
    'Moles of a solute = molarity × litres of solution.',
  ],
  variables: [
    molarityVar('C1', 'C₁', 'Acid concentration'),
    mlVar('V1', 'V₁', 'Acid volume'),
    molVar('n1', 'n₁', 'Moles of acid'),
    ratioVar,
    molVar('n2', 'n₂', 'Moles of base'),
    molarityVar('C2', 'C₂', 'Base concentration'),
    mlVar('V2', 'V₂', 'Base volume'),
  ],
  ...rules(molarityRule('n1', 'C1', 'V1'), ratioRule, molarityRule('n2', 'C2', 'V2')),
  example: { C1: 0.15, V1: 25, n1: 0.00375, r: 2, n2: 0.0075, C2: 0.1, V2: 75 },
  startWith: ['C1', 'V1', 'C2', 'r'],
  representation: {
    kind: 'moleMap',
    moles: 'n1',
    formula: 'H2SO4',
    second: { formula: 'NaOH', ratio: [1, 'r'], moles: 'n2' },
    solution: {
      first: { molarity: 'C1', volume: 'V1' },
      second: { molarity: 'C2', volume: 'V2' },
    },
  },
};

const gasDemo: ModuleDef = {
  id: 'g.he-moleMap-gas',
  unitSystems: ['metric'],
  title: 'Gas stoichiometry: grams to moles to litres of gas at T and P',
  use: 'Use this for “What volume of O₂ at 25 °C and 1.00 atm comes from 5.00 g of KClO₃?”',
  assumptions: [
    '2KClO₃ → 2KCl + 3O₂: 3 mol of O₂ for every 2 mol of KClO₃ (r = 1.5).',
    'O₂ behaves as an ideal gas; R = 0.08206 L·atm/(mol·K), T in kelvin.',
  ],
  variables: [
    quantity('m', 'm', 'Mass of KClO₃', 'g', 0.001, 10000, 0.01),
    molVar('n1', 'n₁', 'Moles of KClO₃'),
    ratioVar,
    molVar('n2', 'n₂', 'Moles of O₂'),
    quantity('T', 'T', 'Temperature', 'K', 1, 3000, 0.01),
    quantity('P', 'P', 'Pressure', 'atm', 0.001, 100, 0.01),
    quantity('V', 'V', 'Volume of O₂', 'L', 1e-6, 1e5, 0.001),
  ],
  ...rules(
    {
      relation: {
        id: 'n₁ = m ÷ 122.55',
        display: '{n1} = {m} ÷ 122.55',
        vars: ['n1', 'm'],
        residual: (v) => v.n1! * 122.55 - v.m!,
        solve: { n1: (v) => v.m! / 122.55, m: (v) => v.n1! * 122.55 },
      },
      steps: {
        n1: st('{m} ÷ 122.55', 'Grams over the molar mass of KClO₃, 122.55 g/mol.'),
        m: st('{n1} × 122.55', 'Moles times the molar mass of KClO₃.'),
      },
    },
    ratioRule,
    gasRule('n2'),
  ),
  example: (() => {
    const n1 = 5 / 122.55;
    const n2 = n1 * 1.5;
    return { m: 5, n1, r: 1.5, n2, T: 298.15, P: 1, V: (n2 * 0.08206 * 298.15) / 1 };
  })(),
  startWith: ['m', 'r', 'T', 'P'],
  representation: {
    kind: 'moleMap',
    moles: 'n1',
    mass: 'm',
    formula: 'KClO3',
    second: { formula: 'O2', ratio: [1, 'r'], moles: 'n2' },
    gas: { temperature: 'T', pressure: 'P', volume: 'V' },
  },
};

const gasToSolutionDemo: ModuleDef = {
  id: 'g.he-moleMap-gas-solution',
  unitSystems: ['metric'],
  title: 'A gas into a solution: CO₂ taken up by NaOH',
  use: 'Use this for “What volume of 0.250 M NaOH takes up 0.500 L of CO₂ at 0 °C and 1.00 atm?”',
  assumptions: [
    'CO₂ + 2NaOH → Na₂CO₃ + H₂O: 2 mol of NaOH for each mol of CO₂.',
    'CO₂ behaves as an ideal gas; R = 0.08206 L·atm/(mol·K).',
  ],
  variables: [
    quantity('V', 'V', 'Volume of CO₂', 'L', 1e-6, 1e5, 0.001),
    quantity('T', 'T', 'Temperature', 'K', 1, 3000, 0.01),
    quantity('P', 'P', 'Pressure', 'atm', 0.001, 100, 0.01),
    molVar('n1', 'n₁', 'Moles of CO₂'),
    ratioVar,
    molVar('n2', 'n₂', 'Moles of NaOH'),
    molarityVar('C2', 'C₂', 'NaOH concentration'),
    mlVar('V2', 'V₂', 'NaOH volume'),
  ],
  ...rules(gasRule('n1'), ratioRule, molarityRule('n2', 'C2', 'V2')),
  example: (() => {
    const n1 = (0.5 * 1) / (0.08206 * 273.15);
    const n2 = 2 * n1;
    return { V: 0.5, T: 273.15, P: 1, n1, r: 2, n2, C2: 0.25, V2: (1000 * n2) / 0.25 };
  })(),
  startWith: ['V', 'T', 'P', 'r', 'C2'],
  representation: {
    kind: 'moleMap',
    moles: 'n1',
    formula: 'CO2',
    second: { formula: 'NaOH', ratio: [1, 'r'], moles: 'n2' },
    gas: { temperature: 'T', pressure: 'P', volume: 'V', of: 'first' },
    solution: { second: { molarity: 'C2', volume: 'V2' } },
  },
};

/** Combustion analysis: n_C, n_H, m_O, n_O and the ratios to C. */
const combustionRules = rules(
  {
    relation: {
      id: 'n_C = m_CO₂ ÷ 44.01',
      display: '{nC} = {mCO2} ÷ 44.01',
      vars: ['nC', 'mCO2'],
      residual: (v) => v.nC! * 44.01 - v.mCO2!,
      solve: { nC: (v) => v.mCO2! / 44.01, mCO2: (v) => v.nC! * 44.01 },
    },
    steps: {
      nC: st('{mCO2} ÷ 44.01', 'Each mol of CO₂ holds one mol of C.'),
      mCO2: st('{nC} × 44.01', 'Moles of C as grams of CO₂.'),
    },
  },
  {
    relation: {
      id: 'n_H = 2m_H₂O ÷ 18.02',
      display: '{nH} = 2 × {mH2O} ÷ 18.02',
      vars: ['nH', 'mH2O'],
      residual: (v) => v.nH! * 18.02 - 2 * v.mH2O!,
      solve: { nH: (v) => (2 * v.mH2O!) / 18.02, mH2O: (v) => (v.nH! * 18.02) / 2 },
    },
    steps: {
      nH: st('2 × {mH2O} ÷ 18.02', 'Each mol of H₂O holds two mol of H.'),
      mH2O: st('{nH} × 18.02 ÷ 2', 'Half the moles of H, as grams of water.'),
    },
  },
  {
    relation: {
      id: 'm_O = m − 12.01n_C − 1.008n_H',
      display: '{mO} = {m} − 12.01 × {nC} − 1.008 × {nH}',
      vars: ['mO', 'm', 'nC', 'nH'],
      residual: (v) => v.mO! - (v.m! - 12.01 * v.nC! - 1.008 * v.nH!),
      solve: {
        mO: (v) => v.m! - 12.01 * v.nC! - 1.008 * v.nH!,
        m: (v) => v.mO! + 12.01 * v.nC! + 1.008 * v.nH!,
      },
    },
    steps: {
      mO: st('{m} − 12.01 × {nC} − 1.008 × {nH}', 'O is what is left of the sample’s mass.'),
      m: st('{mO} + 12.01 × {nC} + 1.008 × {nH}', 'Add the masses of C, H and O.'),
    },
  },
  {
    relation: {
      id: 'n_O = m_O ÷ 16',
      display: '{nO} = {mO} ÷ 16',
      vars: ['nO', 'mO'],
      residual: (v) => v.nO! * 16 - v.mO!,
      solve: { nO: (v) => v.mO! / 16, mO: (v) => v.nO! * 16 },
    },
    steps: {
      nO: st('{mO} ÷ 16', 'Grams of O over 16 g/mol.'),
      mO: st('{nO} × 16', 'Moles of O as grams.'),
    },
  },
  quotient('H per C', 'rH', 'nH', 'nC', [
    'Moles of H for each mole of C.',
    'The ratio times the moles of C.',
    'Moles of H over the ratio.',
  ]),
  quotient('O per C', 'rO', 'nO', 'nC', [
    'Moles of O for each mole of C.',
    'The ratio times the moles of C.',
    'Moles of O over the ratio.',
  ]),
);

const combustionDemo = (
  id: string,
  title: string,
  [m, mCO2, mH2O]: [number, number, number],
  use: string,
): ModuleDef => {
  const nC = mCO2 / 44.01;
  const nH = (2 * mH2O) / 18.02;
  const mO = m - 12.01 * nC - 1.008 * nH;
  const nO = mO / 16;
  return {
    id,
    title,
    use,
    unitSystems: ['metric'],
    assumptions: [
      'All the C ends in CO₂ and all the H in H₂O; O is what is left of the mass (the O₂ used can’t be weighed in).',
      'Ratios within 0.05 of a whole number round; otherwise multiply all by 2, 3 … until they are whole.',
    ],
    variables: [
      quantity('m', 'm', 'Sample mass', 'g', 0.001, 100, 0.0001),
      quantity('mCO2', 'm_CO₂', 'CO₂ mass', 'g', 0.0001, 1000, 0.0001),
      quantity('mH2O', 'm_H₂O', 'H₂O mass', 'g', 0.0001, 1000, 0.0001),
      molVar('nC', 'n_C', 'Moles of C'),
      molVar('nH', 'n_H', 'Moles of H'),
      quantity('mO', 'm_O', 'Mass of O', 'g', 0, 100, 0.0001, { figures: 4 }),
      quantity('nO', 'n_O', 'Moles of O', 'mol', 0, 100, 1e-6, { figures: 4 }),
      quantity('rH', 'r_H', 'H per C', undefined, 0, 10, 0.01, { figures: 3 }),
      quantity('rO', 'r_O', 'O per C', undefined, 0, 10, 0.01, { figures: 3 }),
    ],
    ...combustionRules,
    example: { m, mCO2, mH2O, nC, nH, mO, nO, rH: nH / nC, rO: nO / nC },
    startWith: ['m', 'mCO2', 'mH2O'],
    representation: {
      kind: 'reaction',
      reactants: [],
      products: [],
      combustion: {
        sample: 'm',
        co2: 'mCO2',
        h2o: 'mH2O',
        carbon: 'nC',
        hydrogen: 'nH',
        oxygenMass: 'mO',
        oxygen: 'nO',
        hPerC: 'rH',
        oPerC: 'rO',
      },
    },
  };
};

const HC74_DEMOS: ModuleDef[] = [
  solutionDemo,
  gasDemo,
  gasToSolutionDemo,
  combustionDemo(
    'g.he-reaction-combustion',
    'Combustion analysis: CH₂O from the CO₂ and H₂O',
    [0.25, 0.3664, 0.15],
    'Use this for “0.2500 g of a C, H, O compound gives 0.3664 g CO₂ and 0.1500 g H₂O. Find its empirical formula.”',
  ),
  combustionDemo(
    'g.he-reaction-combustion-hydrocarbon',
    'A hydrocarbon: no O left, the ratio × 3 gives C₃H₈',
    [0.1, 0.2994, 0.1635],
    'Use this for “0.1000 g of a hydrocarbon gives 0.2994 g CO₂ and 0.1635 g H₂O. Find its empirical formula.”',
  ),
];

export const HE3E_GALLERY_MODULES: ModuleDef[] = [
  ...HC55_DEMOS,
  ...HC70_DEMOS,
  ...HC72_DEMOS,
  ...HC74_DEMOS,
];

export const HE3E_GALLERY_LAYOUTS: LayoutDef[] = [irBands];

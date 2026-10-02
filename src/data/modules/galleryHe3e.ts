/**
 * College gallery demos, round 3, group E (docs/RENDERINGS_HE.md). Each stands in for the
 * college page that waits, built from the plan's worked example. Spread into gallery.ts.
 *
 * HC55: `instrumentTrace` (C-P5): ¹H NMR, a chromatogram, a rotational spectrum, and the IR
 * sort's `ir` cards.
 */
import type { Relation, VariableDef } from '@/engine/types';

import type { LayoutDef } from './layouts';
import type { ModuleDef, StepText } from './types';
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

export const HE3E_GALLERY_MODULES: ModuleDef[] = [...HC55_DEMOS];

export const HE3E_GALLERY_LAYOUTS: LayoutDef[] = [irBands];

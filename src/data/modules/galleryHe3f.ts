/**
 * College gallery demos, round 3, group F (docs/RENDERINGS_HE.md). Each stands in for the
 * college page that waits, built from the plan's worked example. Spread into gallery.ts.
 *
 * HC56: `chemDiagram` mode `cell` at the page's concentrations (Nernst), a concentration cell
 * and an electrolysis (C-P9).
 * HC58: `equilibriumChart` mode `gibbs`: G against the extent, the minimum at K and Q's slope
 * as ΔG (C-P23).
 * HC71: `phScale` titration options: a polyprotic acid, a buffer, a free amino acid (C-P6).
 * HC73: `phScale` mode `pka`, the pKₐ ladder with a reaction's arrow (C-P22).
 */
import type { Relation, VariableDef, Values } from '@/engine/types';

import type { LayoutDef } from './layouts';
import { LADDER_ACIDS } from './typesHe3f';
import type { ModuleDef, StepText } from './types';

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
const pos = (x: number) => (x > 0 && Number.isFinite(x) ? x : undefined);
const div = (a: number, b: number) => (b === 0 || !Number.isFinite(b) ? undefined : a / b);

/** A value with a unit (the formula is written in it). */
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

const R = 8.314;
const F = 96485;

// ─── HC56 cells (gen-chem-2#4, ~concentration-cell, ~electrolysis; analytical#4) ─────

const molar = (id: string, symbol: string, name: string) =>
  quantity(id, symbol, name, 'M', 1e-9, 20, 0.0001, { scientific: true });

/** Q = [anode ion] ÷ [cathode ion]. */
const cellQRule: Rule = {
  relation: {
    id: 'Q = [anode ion] ÷ [cathode ion]',
    display: '{Q} = {ca} ÷ {cc}',
    vars: ['Q', 'ca', 'cc'],
    residual: (v) => v.Q! * v.cc! - v.ca!,
    solve: {
      Q: (v) => div(v.ca!, v.cc!),
      ca: (v) => v.Q! * v.cc!,
      cc: (v) => div(v.ca!, v.Q!),
    },
  },
  steps: {
    Q: st('{ca} ÷ {cc}', 'Solids stay out of Q: divide the anode’s ion by the cathode’s.'),
    ca: st('{Q} × {cc}', 'Multiply Q by the cathode’s ion concentration.'),
    cc: st('{ca} ÷ {Q}', 'Divide the anode’s ion concentration by Q.'),
  },
};

/** E = E° − (RT ÷ nF) ln Q. */
const nernstRule: Rule = {
  relation: {
    id: 'E = E° − (RT ÷ nF) ln Q',
    display: '{E} = {E0} − (8.314 × {T} ÷ ({n} × 96485)) × ln({Q})',
    vars: ['E', 'E0', 'T', 'n', 'Q'],
    residual: (v) => v.E! - (v.E0! - ((R * v.T!) / (v.n! * F)) * Math.log(v.Q!)),
    solve: {
      E: (v) => v.E0! - ((R * v.T!) / (v.n! * F)) * Math.log(v.Q!),
      E0: (v) => v.E! + ((R * v.T!) / (v.n! * F)) * Math.log(v.Q!),
      Q: (v) => Math.exp(((v.E0! - v.E!) * v.n! * F) / (R * v.T!)),
      T: (v) => pos(((v.E0! - v.E!) * v.n! * F) / (R * Math.log(v.Q!))),
    },
  },
  steps: {
    E: st(
      '{E0} − (8.314 × {T} ÷ ({n} × 96485)) × ln({Q})',
      'Find RT ÷ nF, multiply it by ln Q, and take that from E°.',
    ),
    E0: st(
      '{E} + (8.314 × {T} ÷ ({n} × 96485)) × ln({Q})',
      'Find RT ÷ nF, multiply it by ln Q, and add that to E.',
    ),
    Q: st(
      'e^(({E0} − {E}) × {n} × 96485 ÷ (8.314 × {T}))',
      'Multiply E° − E by nF ÷ RT, then raise e to it.',
    ),
    T: st(
      '({E0} − {E}) × {n} × 96485 ÷ (8.314 × ln({Q}))',
      'Multiply E° − E by nF, then divide by R ln Q.',
    ),
  },
};

const cellNernst: ModuleDef = {
  id: 'g.he-chemDiagram-cell-nernst',
  title: 'A cell away from 1 M: the Nernst equation',
  use: 'Use this for a cell potential at non-standard concentrations, from E°, n and the two ions.',
  assumptions: [
    'The cell is M | M²⁺ ‖ N²⁺ | N: Q = [anode ion] ÷ [cathode ion]; solids are left out.',
    'At 25 °C, (RT ÷ F) ln Q is 0.05916 log Q.',
  ],
  variables: [
    quantity('E0', 'E°', 'Standard cell potential', 'V', -6, 6, 0.001),
    quantity('n', 'n', 'Electrons transferred', undefined, 1, 6, 1, { integer: true }),
    quantity('T', 'T', 'Temperature', 'K', 200, 500, 0.01),
    molar('ca', '[Zn²⁺]', 'Anode ion concentration'),
    molar('cc', '[Cu²⁺]', 'Cathode ion concentration'),
    quantity('Q', 'Q', 'Reaction quotient', undefined, 1e-30, 1e30, 0.0001, { scientific: true }),
    quantity('E', 'E', 'Cell potential', 'V', -10, 10, 0.0001),
  ],
  ...rules(cellQRule, nernstRule),
  example: {
    E0: 1.1,
    n: 2,
    T: 298.15,
    ca: 1.0,
    cc: 0.01,
    Q: 100,
    E: 1.1 - ((R * 298.15) / (2 * F)) * Math.log(100),
  },
  startWith: ['E0', 'n', 'T', 'ca', 'cc'],
  representation: {
    kind: 'chemDiagram',
    mode: 'cell',
    metals: ['Zn', 'Cu'],
    concentrations: { anode: 'ca', cathode: 'cc' },
    n: 'n',
    standard: 'E0',
    T: 'T',
    Q: 'Q',
    E: 'E',
  },
};

/** The edge: a cathode ion two million times thinner than the anode's. */
const cellNernstDilute: ModuleDef = {
  ...cellNernst,
  id: 'g.he-chemDiagram-cell-nernst-dilute',
  title: 'A cell with its cathode ion almost gone',
  example: {
    E0: 1.1,
    n: 2,
    T: 298.15,
    ca: 2.0,
    cc: 1.0e-6,
    Q: 2.0e6,
    E: 1.1 - ((R * 298.15) / (2 * F)) * Math.log(2.0e6),
  },
};

/** A concentration cell at 25 °C: E = (0.05916 ÷ n) log(c_conc ÷ c_dil). */
const concRule: Rule = {
  relation: {
    id: 'E = (0.05916 ÷ n) log₁₀(c_conc ÷ c_dil)',
    display: '{E} = (0.05916 ÷ {n}) × log₁₀({cc} ÷ {ca})',
    vars: ['E', 'n', 'cc', 'ca'],
    residual: (v) => v.E! - (0.05916 / v.n!) * Math.log10(v.cc! / v.ca!),
    solve: {
      E: (v) => (0.05916 / v.n!) * Math.log10(v.cc! / v.ca!),
      cc: (v) => v.ca! * 10 ** ((v.E! * v.n!) / 0.05916),
      ca: (v) => v.cc! / 10 ** ((v.E! * v.n!) / 0.05916),
    },
  },
  steps: {
    E: st(
      '(0.05916 ÷ {n}) × log₁₀({cc} ÷ {ca})',
      'Take log of how many times stronger, times 0.05916 ÷ n.',
    ),
    cc: st(
      '{ca} × 10^({E} × {n} ÷ 0.05916)',
      'Raise 10 to En ÷ 0.05916 and scale the dilute side up.',
    ),
    ca: st(
      '{cc} ÷ 10^({E} × {n} ÷ 0.05916)',
      'Raise 10 to En ÷ 0.05916 and divide the strong side by it.',
    ),
  },
};

const cellConcentration: ModuleDef = {
  id: 'g.he-chemDiagram-cell-concentration',
  title: 'A concentration cell: one metal, two strengths',
  use: 'Use this for the voltage of a concentration cell, or the concentration that gives a voltage.',
  assumptions: [
    'The same metal on both sides, so E° = 0; the dilute side is the anode.',
    '25 °C: RT ln 10 ÷ F = 0.05916 V.',
  ],
  variables: [
    quantity('n', 'n', 'Electrons transferred', undefined, 1, 6, 1, { integer: true }),
    molar('ca', 'c_dil', 'Dilute concentration'),
    molar('cc', 'c_conc', 'Concentrated concentration'),
    quantity('E', 'E', 'Cell potential', 'V', -2, 2, 0.0001),
  ],
  ...rules(concRule, {
    relation: {
      id: 'dilute below concentrated',
      display: '{ca} < {cc}',
      constraint: true,
      vars: ['ca', 'cc'],
      residual: (v: Values) => (v.ca! < v.cc! ? 0 : 1),
      solve: {},
      message: (v: Values) =>
        v.ca! < v.cc! ? undefined : 'The dilute side must be weaker than the concentrated side.',
    },
    steps: {},
  }),
  example: { n: 2, ca: 1.0e-3, cc: 1.0, E: (0.05916 / 2) * 3 },
  startWith: ['n', 'ca', 'cc'],
  representation: {
    kind: 'chemDiagram',
    mode: 'cell',
    metals: ['Cu', 'Cu'],
    concentrations: { anode: 'ca', cathode: 'cc' },
    n: 'n',
    E: 'E',
  },
};

// Electrolysis: Q = It, n(e⁻) = Q ÷ F, n = n(e⁻) ÷ z, m = nM.
const product = (
  id: string,
  display: string,
  out: string,
  a: string,
  b: string,
  how: [string, string, string],
  fixedB = false,
): Rule => ({
  relation: {
    id,
    display,
    vars: [out, a, b],
    residual: (v) => v[out]! - v[a]! * v[b]!,
    solve: {
      [out]: (v) => v[a]! * v[b]!,
      [a]: (v) => div(v[out]!, v[b]!),
      // A whole count (z) or a property (M) is typed, never worked out backward.
      ...(fixedB ? {} : { [b]: (v: Values) => div(v[out]!, v[a]!) }),
    },
  },
  steps: {
    [out]: st(`{${a}} × {${b}}`, how[0]),
    [a]: st(`{${out}} ÷ {${b}}`, how[1]),
    ...(fixedB ? {} : { [b]: st(`{${out}} ÷ {${a}}`, how[2]) }),
  },
});

const cellElectrolysis: ModuleDef = {
  id: 'g.he-chemDiagram-cell-electrolysis',
  title: 'Electrolysis: metal plated by a current',
  use: 'Use this for the mass plated by a current in a time, or the time or current a mass needs.',
  assumptions: [
    'Every electron reduces the metal’s ion (100% current efficiency).',
    'F = 96,485 C per mole of electrons.',
  ],
  variables: [
    quantity('I', 'I', 'Current', 'A', 1e-9, 1e6, 0.001, { scientific: true }),
    quantity('t', 't', 'Time', 's', 1, 1e7, 0.1, { units: ['s', 'min'], shownIn: 'min' }),
    quantity('q', 'Q', 'Charge', 'C', 1e-12, 1e14, 0.1, { scientific: true }),
    quantity('ne', 'n(e⁻)', 'Moles of electrons', 'mol', 1e-18, 1e9, 0.0001, {
      scientific: true,
    }),
    quantity('z', 'z', 'Electrons per ion', undefined, 1, 6, 1, { integer: true }),
    quantity('nm', 'n', 'Moles of metal', 'mol', 1e-18, 1e9, 0.0001, { scientific: true }),
    quantity('M', 'M', 'Molar mass', 'g/mol', 1, 300, 0.01),
    quantity('m', 'm', 'Mass plated', 'g', 1e-16, 1e12, 0.0001, { scientific: true }),
  ],
  ...rules(
    product('Q = It', '{q} = {I} × {t}', 'q', 'I', 't', [
      'Multiply the current by the time in seconds.',
      'Divide the charge by the time.',
      'Divide the charge by the current.',
    ]),
    {
      relation: {
        id: 'n(e⁻) = Q ÷ F',
        display: '{ne} = {q} ÷ 96485',
        vars: ['ne', 'q'],
        residual: (v) => v.ne! * F - v.q!,
        solve: { ne: (v) => v.q! / F, q: (v) => v.ne! * F },
      },
      steps: {
        ne: st('{q} ÷ 96485', 'Divide the charge by F, the charge of a mole of electrons.'),
        q: st('{ne} × 96485', 'Multiply the moles of electrons by F.'),
      },
    },
    product(
      'n(e⁻) = n × z',
      '{ne} = {nm} × {z}',
      'ne',
      'nm',
      'z',
      [
        'Each ion takes z electrons: multiply.',
        'Divide the moles of electrons by z.',
        'Divide the moles of electrons by the moles of metal.',
      ],
      true,
    ),
    product(
      'm = nM',
      '{m} = {nm} × {M}',
      'm',
      'nm',
      'M',
      [
        'Multiply the moles of metal by its molar mass.',
        'Divide the mass by the molar mass.',
        'Divide the mass by the moles.',
      ],
      true,
    ),
  ),
  example: {
    I: 2.0,
    t: 1800,
    q: 3600,
    ne: 3600 / F,
    z: 2,
    nm: 3600 / F / 2,
    M: 63.55,
    m: (3600 / F / 2) * 63.55,
  },
  startWith: ['I', 't', 'z', 'M'],
  unitSystems: ['metric'],
  representation: {
    kind: 'chemDiagram',
    mode: 'cell',
    electrolysis: {
      current: 'I',
      time: 't',
      z: 'z',
      metal: 'Cu',
      charge: 'q',
      electrons: 'ne',
      moles: 'nm',
      molar: 'M',
      mass: 'm',
    },
  },
};

/** The edge: silver(I), one electron per ion, a small current for a long time. */
const cellElectrolysisSilver: ModuleDef = {
  ...cellElectrolysis,
  id: 'g.he-chemDiagram-cell-electrolysis-silver',
  title: 'Electrolysis: silver plated by a small current',
  representation: {
    kind: 'chemDiagram',
    mode: 'cell',
    electrolysis: {
      current: 'I',
      time: 't',
      z: 'z',
      metal: 'Ag',
      charge: 'q',
      electrons: 'ne',
      moles: 'nm',
      molar: 'M',
      mass: 'm',
    },
  },
  example: {
    I: 0.05,
    t: 36000,
    q: 1800,
    ne: 1800 / F,
    z: 1,
    nm: 1800 / F,
    M: 107.87,
    m: (1800 / F) * 107.87,
  },
};

// ─── HC58 G against the extent (gen-chem-2#3, ~nonstandard; physical-1#2; biochemistry#3) ───

const kjmol = (id: string, symbol: string, name: string) =>
  quantity(id, symbol, name, 'kJ/mol', -1000, 1000, 0.01);
const kelvin = quantity('T', 'T', 'Temperature', 'K', 1, 2000, 0.01);

/** ΔG° = −RT ln K (ΔG° in kJ/mol, so × 1000 into J). */
const gibbsK: Rule = {
  relation: {
    id: 'ΔG° = −RT ln K',
    display: '{dG0} × 1000 = −8.314 × {T} × {lnK}',
    vars: ['dG0', 'T', 'lnK'],
    residual: (v) => v.dG0! * 1000 + R * v.T! * v.lnK!,
    solve: {
      dG0: (v) => (-R * v.T! * v.lnK!) / 1000,
      lnK: (v) => (-v.dG0! * 1000) / (R * v.T!),
      T: (v) => pos((-v.dG0! * 1000) / (R * v.lnK!)),
    },
  },
  steps: {
    dG0: st('−8.314 × {T} × {lnK} ÷ 1000', 'Multiply −R by T and ln K, then turn J into kJ.'),
    lnK: st('−{dG0} × 1000 ÷ (8.314 × {T})', 'Turn ΔG° into J, then divide −ΔG° by RT.'),
    T: st('−{dG0} × 1000 ÷ (8.314 × {lnK})', 'Turn ΔG° into J, then divide −ΔG° by R ln K.'),
  },
};

const expK: Rule = {
  relation: {
    id: 'K = e^(ln K)',
    display: '{K} = e^({lnK})',
    vars: ['K', 'lnK'],
    residual: (v) => Math.log(v.K!) - v.lnK!,
    solve: { K: (v) => Math.exp(v.lnK!), lnK: (v) => (v.K! > 0 ? Math.log(v.K!) : undefined) },
  },
  steps: {
    K: st('e^({lnK})', 'Raise e to ln K.'),
    lnK: st('ln({K})', 'Take ln of K.'),
  },
};

const gibbsStandard: ModuleDef = {
  id: 'g.he-equilibriumChart-gibbs-standard',
  title: 'ΔG° and K: where G is lowest',
  use: 'Use this for K from ΔG° at a temperature, or ΔG° from K.',
  assumptions: [
    'R = 8.314 J/(mol·K), so ΔG° goes into J.',
    'ΔG° < 0 means K > 1 (products favored), not that the reaction is fast.',
  ],
  variables: [
    kjmol('dG0', 'ΔG°', 'Standard free energy change'),
    kelvin,
    quantity('lnK', 'ln K', 'ln K', undefined, -500, 500, 0.0001),
    quantity('K', 'K', 'Equilibrium constant', undefined, 1e-200, 1e200, 0.0001, {
      scientific: true,
    }),
  ],
  ...rules(gibbsK, expK),
  example: {
    dG0: -33.0,
    T: 298.15,
    lnK: 33000 / (R * 298.15),
    K: Math.exp(33000 / (R * 298.15)),
  },
  startWith: ['dG0', 'T'],
  representation: {
    kind: 'equilibriumChart',
    mode: 'gibbs',
    gibbs: { standard: 'dG0', T: 'T', K: 'K' },
  },
};

/** ΔG = ΔG° + RT ln Q (kJ/mol). */
const gibbsQ: Rule = {
  relation: {
    id: 'ΔG = ΔG° + RT ln Q',
    display: '{dG} = {dG0} + 8.314 × {T} × ln({Q}) ÷ 1000',
    vars: ['dG', 'dG0', 'T', 'Q'],
    residual: (v) => v.dG! - (v.dG0! + (R * v.T! * Math.log(v.Q!)) / 1000),
    solve: {
      dG: (v) => v.dG0! + (R * v.T! * Math.log(v.Q!)) / 1000,
      dG0: (v) => v.dG! - (R * v.T! * Math.log(v.Q!)) / 1000,
      Q: (v) => Math.exp(((v.dG! - v.dG0!) * 1000) / (R * v.T!)),
    },
  },
  steps: {
    dG: st('{dG0} + 8.314 × {T} × ln({Q}) ÷ 1000', 'Find RT ln Q in kJ and add it to ΔG°.'),
    dG0: st('{dG} − 8.314 × {T} × ln({Q}) ÷ 1000', 'Find RT ln Q in kJ and take it from ΔG.'),
    Q: st(
      'e^(({dG} − {dG0}) × 1000 ÷ (8.314 × {T}))',
      'Divide ΔG − ΔG° in J by RT and raise e to it.',
    ),
  },
};

const gibbsNonstandard: ModuleDef = {
  id: 'g.he-equilibriumChart-gibbs-nonstandard',
  title: 'ΔG away from standard: which way it runs',
  use: 'Use this for ΔG at a reaction quotient Q, and which way the reaction runs.',
  assumptions: [
    'ΔG < 0: Q < K, it runs forward; ΔG > 0: Q > K, it runs backward.',
    'R = 8.314 J/(mol·K); RT ln Q is turned into kJ.',
  ],
  variables: [
    kjmol('dG0', 'ΔG°', 'Standard free energy change'),
    kelvin,
    quantity('Q', 'Q', 'Reaction quotient', undefined, 1e-100, 1e100, 0.0001, { scientific: true }),
    kjmol('dG', 'ΔG', 'Free energy change'),
  ],
  ...rules(gibbsQ),
  example: { dG0: -33.0, T: 298.15, Q: 1.0e6, dG: -33.0 + (R * 298.15 * Math.log(1e6)) / 1000 },
  startWith: ['dG0', 'T', 'Q'],
  representation: {
    kind: 'equilibriumChart',
    mode: 'gibbs',
    gibbs: { standard: 'dG0', T: 'T', Q: 'Q', delta: 'dG' },
  },
};

/** The edge: a small ΔG° (+5.0 kJ/mol), so the minimum sits well inside, and Q far below K. */
const gibbsNear: ModuleDef = {
  ...gibbsNonstandard,
  id: 'g.he-equilibriumChart-gibbs-near',
  title: 'A small ΔG°: the minimum in the middle',
  example: { dG0: 5.0, T: 298.15, Q: 0.01, dG: 5.0 + (R * 298.15 * Math.log(0.01)) / 1000 },
};

/** ATP in a cell (biochemistry#3): Q from three concentrations in mM. */
const atpQ: Rule = {
  relation: {
    id: 'Q = [ADP][Pᵢ] ÷ [ATP]',
    display: '{Q} = ({adp} ÷ 1000) × ({pi} ÷ 1000) ÷ ({atp} ÷ 1000)',
    vars: ['Q', 'adp', 'pi', 'atp'],
    residual: (v) => v.Q! * v.atp! * 1000 - v.adp! * v.pi!,
    solve: {
      Q: (v) => div(v.adp! * v.pi!, v.atp! * 1000),
      adp: (v) => div(v.Q! * v.atp! * 1000, v.pi!),
      pi: (v) => div(v.Q! * v.atp! * 1000, v.adp!),
      atp: (v) => div(v.adp! * v.pi!, v.Q! * 1000),
    },
  },
  steps: {
    Q: st(
      '({adp} ÷ 1000) × ({pi} ÷ 1000) ÷ ({atp} ÷ 1000)',
      'Turn mM into M, then products over reactants.',
    ),
    adp: st('{Q} × {atp} × 1000 ÷ {pi}', 'Multiply Q by [ATP] (in M terms) and divide by [Pᵢ].'),
    pi: st('{Q} × {atp} × 1000 ÷ {adp}', 'Multiply Q by [ATP] (in M terms) and divide by [ADP].'),
    atp: st('{adp} × {pi} ÷ ({Q} × 1000)', 'Multiply [ADP] by [Pᵢ] and divide by Q (in M terms).'),
  },
};

const mM = (id: string, symbol: string, name: string) =>
  quantity(id, symbol, name, 'mM', 1e-30, 1e6, 0.001, { scientific: true });

const gibbsAtp: ModuleDef = {
  id: 'g.he-equilibriumChart-gibbs-atp',
  title: 'ATP hydrolysis in a cell: far from equilibrium',
  use: 'Use this for ΔG of ATP hydrolysis at a cell’s concentrations.',
  assumptions: [
    '°′ means pH 7 and 1 M for everything else; concentrations go into M.',
    'A cell keeps ATP high, so ΔG is far below ΔG°′.',
  ],
  variables: [
    kjmol('dG0', 'ΔG°′', 'Standard free energy change (pH 7)'),
    kelvin,
    mM('atp', '[ATP]', 'ATP concentration'),
    mM('adp', '[ADP]', 'ADP concentration'),
    mM('pi', '[Pᵢ]', 'Phosphate concentration'),
    quantity('Q', 'Q', 'Reaction quotient', undefined, 1e-30, 1e30, 0.0001, { scientific: true }),
    kjmol('dG', 'ΔG', 'Free energy change'),
  ],
  ...rules(atpQ, gibbsQ),
  example: {
    dG0: -30.5,
    T: 310.15,
    atp: 5.0,
    adp: 0.5,
    pi: 5.0,
    Q: 5.0e-4,
    dG: -30.5 + (R * 310.15 * Math.log(5.0e-4)) / 1000,
  },
  startWith: ['dG0', 'T', 'atp', 'adp', 'pi'],
  representation: {
    kind: 'equilibriumChart',
    mode: 'gibbs',
    gibbs: { standard: 'dG0', T: 'T', Q: 'Q', delta: 'dG' },
    species: ['ATP', 'ADP + Pᵢ'],
  },
};

// ─── HC71 titration options (analytical#1~polyprotic, gen-chem-2#2~buffer, biochemistry#0) ───

const pk = (id: string, symbol: string, name: string, min = -10, max = 60) =>
  quantity(id, symbol, name, undefined, min, max, 0.01);
const mL = (id: string, symbol: string, name: string) =>
  quantity(id, symbol, name, 'mL', 0.001, 1000, 0.01);
const molPer = (id: string, symbol: string, name: string) =>
  quantity(id, symbol, name, 'M', 1e-6, 20, 0.0001);

/** Vₖ = k × CₐVₐ ÷ C_b. */
const equivalenceRule = (id: string, k: number): Rule => ({
  relation: {
    id: `V${k} = ${k}CₐVₐ ÷ C_b`,
    display: `{${id}} = ${k} × {ca} × {va} ÷ {cb}`,
    vars: [id, 'ca', 'va', 'cb'],
    residual: (v) => v[id]! * v.cb! - k * v.ca! * v.va!,
    solve: {
      [id]: (v) => div(k * v.ca! * v.va!, v.cb!),
      ca: (v) => div(v[id]! * v.cb!, k * v.va!),
      va: (v) => div(v[id]! * v.cb!, k * v.ca!),
      cb: (v) => div(k * v.ca! * v.va!, v[id]!),
    },
  },
  steps: {
    [id]: st(
      `${k} × {ca} × {va} ÷ {cb}`,
      k > 1
        ? `Moles of acid times ${k} protons, over the base’s concentration.`
        : 'Moles of acid over the base’s concentration.',
    ),
    ca: st(`{${id}} × {cb} ÷ (${k} × {va})`, 'Moles of base used, shared over the acid’s volume.'),
    va: st(`{${id}} × {cb} ÷ (${k} × {ca})`, 'Moles of base used, over the acid’s concentration.'),
    cb: st(`${k} × {ca} × {va} ÷ {${id}}`, 'Moles of acid protons over the volume of base.'),
  },
});

const polyprotic: ModuleDef = {
  id: 'g.he-phScale-polyprotic',
  title: 'Titrating a diprotic acid: two equivalence points',
  use: 'Use this for the equivalence volumes of a diprotic acid and the pH at the first one.',
  assumptions: [
    'Each proton takes CₐVₐ ÷ C_b of base: V₂ = 2V₁.',
    'The acid is H₂A with pKₐ₁ 2.00 and pKₐ₂ 6.00; at V₁, pH ≈ (pKₐ₁ + pKₐ₂) ÷ 2 = 4.00.',
  ],
  variables: [
    molPer('ca', 'Cₐ', 'Acid concentration'),
    mL('va', 'Vₐ', 'Acid volume'),
    molPer('cb', 'C_b', 'Base concentration'),
    mL('v1', 'V₁', 'First equivalence volume'),
    mL('v2', 'V₂', 'Second equivalence volume'),
  ],
  ...rules(equivalenceRule('v1', 1), equivalenceRule('v2', 2)),
  example: { ca: 0.1, va: 25, cb: 0.1, v1: 25, v2: 50 },
  startWith: ['ca', 'va', 'cb'],
  representation: {
    kind: 'phScale',
    mode: 'titration',
    acid: { concentration: 'ca', volume: 'va', name: 'H₂A' },
    base: { concentration: 'cb', name: 'NaOH' },
    added: 'v1',
    fixed: true,
    polyprotic: { pKa: [2.0, 6.0], equivalences: ['v1', 'v2'] },
  },
};

/** The edge: phosphoric acid, three protons, the third step barely shows. */
const polyproticTri: ModuleDef = {
  ...polyprotic,
  id: 'g.he-phScale-polyprotic-triprotic',
  title: 'Titrating phosphoric acid: three protons',
  use: 'Use this for the three equivalence volumes of a triprotic acid.',
  assumptions: [
    'Each proton takes CₐVₐ ÷ C_b of base: V₂ = 2V₁, V₃ = 3V₁.',
    'pKₐ 2.15, 7.20 and 12.35: the third step is too weak to show a sharp jump.',
  ],
  variables: [...polyprotic.variables, mL('v3', 'V₃', 'Third equivalence volume')],
  ...rules(equivalenceRule('v1', 1), equivalenceRule('v2', 2), equivalenceRule('v3', 3)),
  example: {
    ca: 0.1,
    va: 25,
    cb: 0.1,
    v1: 25,
    v2: 50,
    v3: 75,
  },
  startWith: ['ca', 'va', 'cb'],
  representation: {
    kind: 'phScale',
    mode: 'titration',
    acid: { concentration: 'ca', volume: 'va', name: 'H₃PO₄' },
    base: { concentration: 'cb', name: 'NaOH' },
    added: 'v2',
    fixed: true,
    polyprotic: { pKa: [2.15, 7.2, 12.35], equivalences: ['v1', 'v2', 'v3'] },
  },
};

const moles = (id: string, symbol: string, name: string) =>
  quantity(id, symbol, name, 'mol', 1e-12, 1000, 0.0001, { scientific: true });

const bufferBefore: Rule = {
  relation: {
    id: 'pH = pKₐ + log(n(A⁻) ÷ n(HA))',
    display: '{before} = {pKa} + log₁₀({nb} ÷ {na})',
    vars: ['before', 'pKa', 'nb', 'na'],
    residual: (v) => v.before! - v.pKa! - Math.log10(v.nb! / v.na!),
    solve: {
      before: (v) => v.pKa! + Math.log10(v.nb! / v.na!),
      pKa: (v) => v.before! - Math.log10(v.nb! / v.na!),
      nb: (v) => v.na! * 10 ** (v.before! - v.pKa!),
      na: (v) => v.nb! / 10 ** (v.before! - v.pKa!),
    },
  },
  steps: {
    before: st('{pKa} + log₁₀({nb} ÷ {na})', 'Add the log of the base-to-acid ratio to pKₐ.'),
    pKa: st('{before} − log₁₀({nb} ÷ {na})', 'Take the log of the ratio from the pH.'),
    nb: st('{na} × 10^({before} − {pKa})', 'The ratio is 10 to (pH − pKₐ): scale n(HA) by it.'),
    na: st('{nb} ÷ 10^({before} − {pKa})', 'The ratio is 10 to (pH − pKₐ): divide n(A⁻) by it.'),
  },
};

const bufferAfter: Rule = {
  relation: {
    id: 'after = pKₐ + log((n(A⁻) − a) ÷ (n(HA) + a))',
    display: '{after} = {pKa} + log₁₀(({nb} − {a}) ÷ ({na} + {a}))',
    vars: ['after', 'pKa', 'nb', 'na', 'a'],
    residual: (v) => v.after! - v.pKa! - Math.log10((v.nb! - v.a!) / (v.na! + v.a!)),
    solve: {
      after: (v) => {
        const r = (v.nb! - v.a!) / (v.na! + v.a!);
        return r > 0 ? v.pKa! + Math.log10(r) : undefined;
      },
    },
  },
  steps: {
    after: st(
      '{pKa} + log₁₀(({nb} − {a}) ÷ ({na} + {a}))',
      'The acid turns that much A⁻ into HA: change both, then use the ratio.',
    ),
  },
};

const buffer: ModuleDef = {
  id: 'g.he-phScale-buffer',
  title: 'A buffer, and a little strong acid added',
  use: 'Use this for a buffer’s pH, and its pH after adding a strong acid or base.',
  assumptions: [
    'Both amounts are much larger than what is added; the volume cancels in the ratio.',
    'Strong acid is positive, strong base negative.',
  ],
  variables: [
    pk('pKa', 'pKₐ', 'Acid’s pKₐ', 0, 14),
    moles('na', 'n(HA)', 'Moles of acid'),
    moles('nb', 'n(A⁻)', 'Moles of conjugate base'),
    quantity('a', 'a', 'Strong acid added', 'mol', -1000, 1000, 0.0001),
    pk('before', 'pH', 'pH before', 0, 14),
    pk('after', 'pH′', 'pH after', 0, 14),
  ],
  ...rules(bufferBefore, bufferAfter, {
    relation: {
      id: 'the buffer survives',
      display: '−{na} < {a} < {nb}',
      constraint: true,
      vars: ['a', 'nb', 'na'],
      residual: (v: Values) => (v.a! < v.nb! && -v.a! < v.na! ? 0 : 1),
      solve: {},
      message: (v: Values) =>
        v.a! < v.nb! && -v.a! < v.na! ? undefined : 'That much uses up one side of the buffer.',
    },
    steps: {},
  }),
  example: {
    pKa: 4.74,
    na: 0.1,
    nb: 0.15,
    a: 0.01,
    before: 4.74 + Math.log10(1.5),
    after: 4.74 + Math.log10(0.14 / 0.11),
  },
  startWith: ['pKa', 'na', 'nb', 'a'],
  representation: {
    kind: 'phScale',
    mode: 'buffer',
    pKa: 'pKa',
    acid: 'na',
    base: 'nb',
    added: 'a',
    before: 'before',
    after: 'after',
  },
};

/** The edge: strong base taking the buffer near the top of its band. */
const bufferBase: ModuleDef = {
  ...buffer,
  id: 'g.he-phScale-buffer-base',
  title: 'A buffer pushed by strong base',
  example: {
    pKa: 4.74,
    na: 0.1,
    nb: 0.15,
    a: -0.05,
    before: 4.74 + Math.log10(1.5),
    after: 4.74 + Math.log10(0.2 / 0.05),
  },
};

const sigma = (x: number) => 1 / (1 + 10 ** x);

/** Net charge: −1 ÷ (1 + 10^(pKₐ₁ − pH)) + 1 ÷ (1 + 10^(pH − pKₐ₂)) (+ a basic side chain). */
const chargeRule = (basic: boolean): Rule => {
  const text = basic
    ? '−1 ÷ (1 + 10^({k1} − {pH})) + 1 ÷ (1 + 10^({pH} − {k2})) + 1 ÷ (1 + 10^({pH} − {kR}))'
    : '−1 ÷ (1 + 10^({k1} − {pH})) + 1 ÷ (1 + 10^({pH} − {k2}))';
  const q = (v: Values) =>
    -sigma(v.k1! - v.pH!) + sigma(v.pH! - v.k2!) + (basic ? sigma(v.pH! - v.kR!) : 0);
  return {
    relation: {
      id: 'net charge by Henderson–Hasselbalch',
      display: `{q} = ${text}`,
      vars: basic ? ['q', 'k1', 'pH', 'k2', 'kR'] : ['q', 'k1', 'pH', 'k2'],
      residual: (v) => v.q! - q(v),
      solve: { q },
    },
    steps: {
      q: st(
        text,
        'Add each group’s share of its charge: −1 for the carboxyl, +1 for each amino group.',
      ),
    },
  };
};

const pIRule = (a: string, b: string): Rule => ({
  relation: {
    id: 'pI = mean of the two pKₐ either side',
    display: `{pI} = ({${a}} + {${b}}) ÷ 2`,
    vars: ['pI', a, b],
    residual: (v) => 2 * v.pI! - v[a]! - v[b]!,
    solve: {
      pI: (v) => (v[a]! + v[b]!) / 2,
      [a]: (v) => 2 * v.pI! - v[b]!,
      [b]: (v) => 2 * v.pI! - v[a]!,
    },
  },
  steps: {
    pI: st(
      `({${a}} + {${b}}) ÷ 2`,
      'The neutral form lies between these two pKₐ: take their mean.',
    ),
    [a]: st(`2 × {pI} − {${b}}`, 'Double pI and take away the other pKₐ.'),
    [b]: st(`2 × {pI} − {${a}}`, 'Double pI and take away the other pKₐ.'),
  },
});

const glycine: ModuleDef = {
  id: 'g.he-phScale-amino-glycine',
  title: 'An amino acid’s charge and its isoelectric point',
  use: 'Use this for the isoelectric point of an amino acid and its net charge at a pH.',
  assumptions: [
    'A free amino acid in water; each group follows Henderson–Hasselbalch.',
    'No ionizable side chain (glycine, alanine).',
  ],
  variables: [
    pk('k1', 'pKₐ₁', 'α-carboxyl pKₐ', 0, 7),
    pk('k2', 'pKₐ₂', 'α-amino pKₐ', 7, 14),
    pk('pH', 'pH', 'pH', 0, 14),
    quantity('q', 'z', 'Net charge', undefined, -3, 3, 0.001),
    pk('pI', 'pI', 'Isoelectric point', 0, 14),
  ],
  ...rules(chargeRule(false), pIRule('k1', 'k2')),
  example: {
    k1: 2.34,
    k2: 9.6,
    pH: 7.4,
    q: -sigma(2.34 - 7.4) + sigma(7.4 - 9.6),
    pI: 5.97,
  },
  startWith: ['k1', 'k2', 'pH'],
  representation: {
    kind: 'phScale',
    mode: 'aminoAcid',
    pKa1: 'k1',
    pKa2: 'k2',
    side: 'none',
    pH: 'pH',
    charge: 'q',
    pI: 'pI',
    name: 'Glycine',
  },
};

/** The edge: lysine, a basic side chain, pI high between the two amino groups. */
const lysine: ModuleDef = {
  ...glycine,
  id: 'g.he-phScale-amino-lysine',
  title: 'A basic amino acid: lysine’s isoelectric point',
  assumptions: [
    'A free amino acid in water; each group follows Henderson–Hasselbalch.',
    'A basic side chain: the neutral form sits between pKₐ₂ and pKₐR.',
  ],
  variables: [
    ...glycine.variables.slice(0, 2),
    pk('kR', 'pKₐR', 'Side-chain pKₐ', 7, 14),
    ...glycine.variables.slice(2),
  ],
  ...rules(chargeRule(true), pIRule('k2', 'kR')),
  example: {
    k1: 2.18,
    k2: 8.95,
    kR: 10.53,
    pH: 7.4,
    q: -sigma(2.18 - 7.4) + sigma(7.4 - 8.95) + sigma(7.4 - 10.53),
    pI: 9.74,
  },
  startWith: ['k1', 'k2', 'kR', 'pH'],
  representation: {
    kind: 'phScale',
    mode: 'aminoAcid',
    pKa1: 'k1',
    pKa2: 'k2',
    pKaR: 'kR',
    side: 'basic',
    pH: 'pH',
    charge: 'q',
    pI: 'pI',
    name: 'Lysine',
  },
};

// ─── HC73 the pKₐ ladder (organic-1#0~pka-equilibrium, ~acid-order; organic-2#3) ───

const logKRule: Rule = {
  relation: {
    id: 'log K = pKₐ(right) − pKₐ(left)',
    display: '{logK} = {pr} − {pl}',
    vars: ['logK', 'pr', 'pl'],
    residual: (v) => v.logK! - v.pr! + v.pl!,
    solve: {
      logK: (v) => v.pr! - v.pl!,
      pr: (v) => v.logK! + v.pl!,
      pl: (v) => v.pr! - v.logK!,
    },
  },
  steps: {
    logK: st('{pr} − {pl}', 'Take the pKₐ of the acid used from the pKₐ of the acid formed.'),
    pr: st('{logK} + {pl}', 'Add log K to the pKₐ of the acid used.'),
    pl: st('{pr} − {logK}', 'Take log K from the pKₐ of the acid formed.'),
  },
};

const tenTo: Rule = {
  relation: {
    id: 'K = 10^log K',
    display: '{K} = 10^({logK})',
    vars: ['K', 'logK'],
    residual: (v) => Math.log10(v.K!) - v.logK!,
    solve: {
      K: (v) => 10 ** v.logK!,
      logK: (v) => (v.K! > 0 ? Math.log10(v.K!) : undefined),
    },
  },
  steps: {
    K: st('10^({logK})', 'Raise 10 to log K.'),
    logK: st('log₁₀({K})', 'Take log₁₀ of K.'),
  },
};

const ladderModule = (
  id: string,
  title: string,
  left: string,
  right: string,
  pl: number,
  pr: number,
): ModuleDef => ({
  id,
  title,
  use: 'Use this for which way an acid–base reaction lies and its K, from the two pKₐ values.',
  assumptions: [
    'The reaction favors the side with the weaker acid (the larger pKₐ).',
    'pKₐ values in water; far outside 0–14 they are estimates.',
  ],
  variables: [
    pk('pl', 'pKₐ(left)', `pKₐ of ${left}, the acid used`, -10, 50),
    pk('pr', 'pKₐ(right)', `pKₐ of ${right}, the acid formed`, -10, 50),
    quantity('logK', 'log K', 'log K', undefined, -60, 60, 0.01),
    quantity('K', 'K', 'Equilibrium constant', undefined, 1e-60, 1e60, 0.0001, {
      scientific: true,
    }),
  ],
  ...rules(logKRule, tenTo),
  example: { pl, pr, logK: pr - pl, K: 10 ** (pr - pl) },
  startWith: ['pl', 'pr'],
  representation: {
    kind: 'phScale',
    mode: 'pka',
    acids: LADDER_ACIDS,
    reaction: {
      left: { name: left, pKa: 'pl' },
      right: { name: right, pKa: 'pr' },
      logK: 'logK',
      K: 'K',
    },
  },
});

const pkaEquilibrium = ladderModule(
  'g.he-phScale-pka-equilibrium',
  'Which way an acid–base reaction lies',
  'ethanoic acid',
  'water',
  4.76,
  15.7,
);

/** The edge: two acids almost equal, the arrow (just) toward the reactants. */
const pkaReverse = ladderModule(
  'g.he-phScale-pka-reverse',
  'An acid–base reaction that barely goes',
  'ethanol',
  'water',
  16,
  15.7,
);

export const HE3F_GALLERY_MODULES: ModuleDef[] = [
  cellNernst,
  cellNernstDilute,
  cellConcentration,
  cellElectrolysis,
  cellElectrolysisSilver,
  gibbsStandard,
  gibbsNonstandard,
  gibbsNear,
  gibbsAtp,
  polyprotic,
  polyproticTri,
  buffer,
  bufferBase,
  glycine,
  lysine,
  pkaEquilibrium,
  pkaReverse,
];

export const HE3F_GALLERY_LAYOUTS: LayoutDef[] = [];

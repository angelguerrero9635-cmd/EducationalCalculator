/**
 * College gallery demos, round 1, group C (docs/RENDERINGS_HE.md). Each stands in for the
 * college page that waits, built from the plan's worked example. Spread into gallery.ts.
 *
 * HC2 (C-P14, docs/plans/he.chemistry.md): the `skeletal` picture on Organic Chemistry I's
 * calculators (~unsaturation, ~hydrogenation, ~chair, and R/S with ~optical-rotation), and the
 * `skeletal` card on the organic sorts and sequences.
 */
import type { LayoutDef } from './layouts';
import type { ModuleDef } from './types';
import type { SkeletalCandidate, SkeletalCard } from './typesHe1c';

const div = (a: number, b: number) => (b === 0 ? undefined : a / b);
/** The gas constant the chair page passes (J/(mol·K)). */
const R = 8.314;

// ─── HC2: IHD from a formula, a structure drawn (organic-1#0~unsaturation) ──────

/** Structures a typed formula can draw, each with its rings and π bonds. */
const UNSATURATION_CANDIDATES: SkeletalCandidate[] = [
  { smiles: 'O=C1CCCCC1', name: 'cyclohexanone' },
  { smiles: 'c1ccc2ccccc2c1', name: 'naphthalene' },
  { smiles: 'c1ccccc1', name: 'benzene' },
  { smiles: 'c1ccncc1', name: 'pyridine' },
  { smiles: 'Clc1ccccc1', name: 'chlorobenzene' },
  { smiles: 'N#Cc1ccccc1', name: 'benzonitrile' },
  { smiles: 'CC#N', name: 'ethanenitrile' },
  { smiles: 'CC(C)=O', name: 'propanone' },
  { smiles: 'C=CC=C', name: 'buta-1,3-diene' },
  { smiles: 'C1CCCCC1', name: 'cyclohexane' },
  { smiles: 'CCO', name: 'ethanol' },
  { smiles: 'CCN', name: 'ethanamine' },
  { smiles: 'ClCCCl', name: '1,2-dichloroethane' },
  { smiles: 'C#C', name: 'ethyne' },
];

const unsaturation = (id: string, title: string, example: Record<string, number>): ModuleDef => ({
  id,
  title,
  use: 'Use this for “How many rings and π bonds does C₆H₁₀O have?”',
  unitSystems: ['metric'],
  workedFigures: 3,
  assumptions: [
    'Each ring or π bond takes away 2 H from the open chain CₙH₂ₙ₊₂: IHD counts them.',
    'A double bond is 1 π bond, a triple bond 2, and a benzene ring 4 (1 ring and 3 π bonds).',
    'O and S add no H, so they leave the IHD as it is; N adds 1 H and a halogen X takes the place of 1 H.',
    'The picture draws one structure with the typed counts, when it knows one.',
  ],
  variables: [
    { id: 'C', symbol: 'C', name: 'Carbon atoms', min: 1, max: 40, step: 1, integer: true },
    { id: 'H', symbol: 'H', name: 'Hydrogen atoms', min: 0, max: 82, step: 1, integer: true },
    { id: 'N', symbol: 'N', name: 'Nitrogen atoms', min: 0, max: 10, step: 1, integer: true },
    { id: 'X', symbol: 'X', name: 'Halogen atoms', min: 0, max: 20, step: 1, integer: true },
    { id: 'IHD', symbol: 'IHD', name: 'Index of hydrogen deficiency', min: 0, max: 40, step: 1 },
  ],
  relations: [
    {
      id: 'IHD = (2C + 2 + N − H − X) ÷ 2',
      display: '{IHD} = (2 × {C} + 2 + {N} − {H} − {X}) ÷ 2',
      vars: ['IHD', 'C', 'H', 'N', 'X'],
      residual: (x) => 2 * x.IHD! - (2 * x.C! + 2 + x.N! - x.H! - x.X!),
      solve: {
        IHD: (x) => (2 * x.C! + 2 + x.N! - x.H! - x.X!) / 2,
        C: (x) => (2 * x.IHD! - 2 - x.N! + x.H! + x.X!) / 2,
        H: (x) => 2 * x.C! + 2 + x.N! - x.X! - 2 * x.IHD!,
        N: (x) => 2 * x.IHD! - 2 * x.C! - 2 + x.H! + x.X!,
        X: (x) => 2 * x.C! + 2 + x.N! - x.H! - 2 * x.IHD!,
      },
    },
  ],
  steps: {
    'IHD = (2C + 2 + N − H − X) ÷ 2': {
      IHD: {
        expr: '(2 × {C} + 2 + {N} − {H} − {X}) ÷ 2',
        how: 'An open chain of C carbons holds 2C + 2 H. Add one for each N, take away the H and the halogens, and halve: each ring or π bond is 2 H missing.',
      },
      C: {
        expr: '(2 × {IHD} − 2 − {N} + {H} + {X}) ÷ 2',
        how: 'Double the IHD, take away 2 and the N, add back the H and the halogens, then halve.',
      },
      H: {
        expr: '2 × {C} + 2 + {N} − {X} − 2 × {IHD}',
        how: 'Start from a full chain, 2C + 2 H, add the N, take away the halogens and 2 H for each ring or π bond.',
      },
      N: {
        expr: '2 × {IHD} − 2 × {C} − 2 + {H} + {X}',
        how: 'Each N adds one H to the full chain; what is left over after the carbons, H and halogens is the N count.',
      },
      X: {
        expr: '2 × {C} + 2 + {N} − {H} − 2 × {IHD}',
        how: 'Each halogen takes the place of one H: the H missing from the full chain, less 2 for each ring or π bond.',
      },
    },
  },
  example,
  startWith: ['C', 'H', 'N', 'X'],
  representation: {
    kind: 'skeletal',
    ihd: { carbons: 'C', hydrogens: 'H', nitrogens: 'N', halogens: 'X', value: 'IHD' },
    candidates: UNSATURATION_CANDIDATES,
  },
});

const ihdCyclohexanone = unsaturation(
  'g.he-skeletal-unsaturation',
  'Rings and π bonds from a formula',
  { C: 6, H: 10, N: 0, X: 0, IHD: 2 },
);

const ihdNaphthalene = unsaturation(
  'g.he-skeletal-unsaturation-naphthalene',
  'Rings and π bonds: naphthalene, IHD 7',
  { C: 10, H: 8, N: 0, X: 0, IHD: 7 },
);

// ─── HC2: π bonds from H₂ uptake (organic-1#3~hydrogenation) ─────────────────

const HYDROGENATION_CANDIDATES: SkeletalCandidate[] = [
  { smiles: 'C1=CCCCC1', name: 'cyclohexene' },
  { smiles: 'C=CC=CCC', name: 'hexa-1,3-diene' },
  { smiles: 'C#CCCCC', name: 'hex-1-yne' },
  { smiles: 'C1CC2CC2C1', name: 'bicyclo[3.1.0]hexane' },
  { smiles: 'CC1=CCC(CC1)C(C)=C', name: 'limonene' },
  { smiles: 'CC(C)=CCCC(=C)C=C', name: 'myrcene' },
  { smiles: 'C1CCCCC1', name: 'cyclohexane' },
  { smiles: 'C=CCCCC', name: 'hex-1-ene' },
  { smiles: 'c1ccccc1', name: 'benzene' },
  { smiles: 'C=Cc1ccccc1', name: 'styrene' },
  { smiles: 'C=CC=C', name: 'buta-1,3-diene' },
];

const hydrogenation = (id: string, title: string, example: Record<string, number>): ModuleDef => ({
  id,
  title,
  use: 'Use this for “0.500 g of C₆H₁₀ takes up 6.09 mmol of H₂. How many rings and π bonds?”',
  unitSystems: ['metric'],
  workedFigures: 3,
  assumptions: [
    'H₂ with a Pd catalyst adds to every C=C and C≡C: one H₂ per π bond. Rings stay.',
    'A benzene ring takes up no H₂ under these conditions; the page counts only the H₂ taken up.',
    'IHD = (2C + 2 − H) ÷ 2 for a hydrocarbon: the π bonds and the rings together.',
  ],
  variables: [
    { id: 'C', symbol: 'C', name: 'Carbon atoms', min: 1, max: 40, step: 1, integer: true },
    { id: 'H', symbol: 'H', name: 'Hydrogen atoms', min: 0, max: 82, step: 1, integer: true },
    { id: 'IHD', symbol: 'IHD', name: 'Index of hydrogen deficiency', min: 0, max: 40, step: 1 },
    { id: 'm', symbol: 'm', name: 'Sample mass', unit: 'g', min: 0.001, max: 100, step: 0.001 },
    { id: 'M', symbol: 'M', name: 'Molar mass', unit: 'g/mol', min: 1, max: 1000, step: 0.01 },
    { id: 'n', symbol: 'n', name: 'Moles of compound', unit: 'mol', min: 0.000001, max: 10 },
    {
      id: 'nH2',
      symbol: 'n_H₂',
      name: 'Moles of H₂ taken up',
      unit: 'mol',
      min: 0,
      max: 100,
    },
    { id: 'pi', symbol: 'π', name: 'π bonds', min: 0, max: 40, step: 1 },
    { id: 'rings', symbol: 'rings', name: 'Rings', min: 0, max: 40, step: 1 },
  ],
  relations: [
    {
      id: 'IHD = (2C + 2 − H) ÷ 2',
      display: '{IHD} = (2 × {C} + 2 − {H}) ÷ 2',
      vars: ['IHD', 'C', 'H'],
      residual: (x) => 2 * x.IHD! - (2 * x.C! + 2 - x.H!),
      solve: {
        IHD: (x) => (2 * x.C! + 2 - x.H!) / 2,
        C: (x) => (2 * x.IHD! - 2 + x.H!) / 2,
        H: (x) => 2 * x.C! + 2 - 2 * x.IHD!,
      },
    },
    {
      id: 'n = m ÷ M',
      display: '{n} = {m} ÷ {M}',
      vars: ['n', 'm', 'M'],
      residual: (x) => x.n! * x.M! - x.m!,
      solve: { n: (x) => div(x.m!, x.M!), m: (x) => x.n! * x.M!, M: (x) => div(x.m!, x.n!) },
    },
    {
      id: 'π = n_H₂ ÷ n',
      display: '{pi} = {nH2} ÷ {n}',
      vars: ['pi', 'nH2', 'n'],
      residual: (x) => x.pi! - x.nH2! / x.n!,
      solve: {
        pi: (x) => div(x.nH2!, x.n!),
        nH2: (x) => x.pi! * x.n!,
        n: (x) => (x.nH2! > 0 ? div(x.nH2!, x.pi!) : undefined),
      },
    },
    {
      id: 'rings = IHD − π',
      display: '{rings} = {IHD} − {pi}',
      vars: ['rings', 'IHD', 'pi'],
      residual: (x) => x.rings! - x.IHD! + x.pi!,
      solve: {
        rings: (x) => x.IHD! - x.pi!,
        IHD: (x) => x.rings! + x.pi!,
        pi: (x) => x.IHD! - x.rings!,
      },
    },
  ],
  steps: {
    'IHD = (2C + 2 − H) ÷ 2': {
      IHD: {
        expr: '(2 × {C} + 2 − {H}) ÷ 2',
        how: 'A chain of C carbons holds 2C + 2 H; each ring or π bond is 2 H fewer.',
      },
      C: {
        expr: '(2 × {IHD} − 2 + {H}) ÷ 2',
        how: 'Double the IHD, take away 2, add the H, then halve.',
      },
      H: {
        expr: '2 × {C} + 2 − 2 × {IHD}',
        how: 'A full chain’s H, less 2 for each ring or π bond.',
      },
    },
    'n = m ÷ M': {
      n: { expr: '{m} ÷ {M}', how: 'Divide the mass by the molar mass.' },
      m: { expr: '{n} × {M}', how: 'Multiply the moles by the molar mass.' },
      M: { expr: '{m} ÷ {n}', how: 'Divide the mass by the moles.' },
    },
    'π = n_H₂ ÷ n': {
      pi: {
        expr: '{nH2} ÷ {n}',
        how: 'Each π bond takes one H₂: the moles of H₂ per mole of compound is the number of π bonds.',
      },
      nH2: { expr: '{pi} × {n}', how: 'One mole of H₂ for each π bond in each mole of compound.' },
      n: { expr: '{nH2} ÷ {pi}', how: 'Divide the H₂ taken up by the π bonds in each molecule.' },
    },
    'rings = IHD − π': {
      rings: {
        expr: '{IHD} − {pi}',
        how: 'The IHD counts rings and π bonds; the H₂ found the π bonds, so the rest are rings.',
      },
      IHD: { expr: '{rings} + {pi}', how: 'Add the rings and the π bonds.' },
      pi: { expr: '{IHD} − {rings}', how: 'Take the rings from the IHD.' },
    },
  },
  example,
  startWith: ['C', 'H', 'm', 'M', 'nH2'],
  representation: {
    kind: 'skeletal',
    ihd: { carbons: 'C', hydrogens: 'H', value: 'IHD', pi: 'pi', rings: 'rings', hydrogen: true },
    candidates: HYDROGENATION_CANDIDATES,
  },
  pictureLabels: ['m', 'M', 'n', 'nH2'],
});

const hydrogenationCyclohexene = (() => {
  const [m, M] = [0.5, 82.14];
  const n = m / M;
  return hydrogenation('g.he-skeletal-hydrogenation', 'π bonds from the H₂ taken up', {
    C: 6,
    H: 10,
    IHD: 2,
    m,
    M,
    n,
    nH2: n,
    pi: 1,
    rings: 1,
  });
})();

const hydrogenationLimonene = (() => {
  const [m, M] = [0.5, 136.24];
  const n = m / M;
  return hydrogenation(
    'g.he-skeletal-hydrogenation-limonene',
    'π bonds from H₂: limonene takes up two',
    { C: 10, H: 16, IHD: 3, m, M, n, nH2: 2 * n, pi: 2, rings: 1 },
  );
})();

// ─── HC2: the chair and its ring flip (organic-1#1~chair) ─────────────────────

const chair = (
  id: string,
  title: string,
  label: string,
  example: Record<string, number>,
): ModuleDef => ({
  id,
  title,
  use: 'Use this for “Methylcyclohexane: A = 7.3 kJ/mol. What percent is equatorial at 25 °C?”',
  unitSystems: ['metric'],
  workedFigures: 3,
  assumptions: [
    'A is the axial chair’s extra free energy: its group is crowded by the two axial H on the same side (1,3-diaxial strain).',
    'A ring flip turns the axial group equatorial; K = equatorial ÷ axial = e^(A ÷ RT), with R = 8.314 J/(mol·K).',
    'A bulkier group has a larger A.',
  ],
  variables: [
    { id: 'A', symbol: 'A', name: 'A-value', unit: 'kJ/mol', min: 0, max: 25, step: 0.1 },
    { id: 'T', symbol: 'T', name: 'Temperature', unit: 'K', min: 100, max: 1000, step: 0.01 },
    { id: 'K', symbol: 'K', name: 'Equatorial ÷ axial', min: 1, max: 1e9 },
    {
      id: 'pct',
      symbol: '%eq',
      name: 'Percent equatorial',
      unit: '%',
      min: 50,
      max: 100,
      step: 0.1,
    },
  ],
  relations: [
    {
      id: 'K = e^(A/RT)',
      display: '{K} = e^({A} × 1000 ÷ (8.314 × {T}))',
      vars: ['K', 'A', 'T'],
      residual: (x) => Math.log(x.K!) - (x.A! * 1000) / (R * x.T!),
      solve: {
        K: (x) => Math.exp((x.A! * 1000) / (R * x.T!)),
        A: (x) => (x.K! > 0 ? (R * x.T! * Math.log(x.K!)) / 1000 : undefined),
        T: (x) => (x.K! > 1 ? (x.A! * 1000) / (R * Math.log(x.K!)) : undefined),
      },
    },
    {
      id: '% = 100K ÷ (1 + K)',
      display: '{pct} = 100 × {K} ÷ (1 + {K})',
      vars: ['pct', 'K'],
      residual: (x) => x.pct! * (1 + x.K!) - 100 * x.K!,
      solve: {
        pct: (x) => (100 * x.K!) / (1 + x.K!),
        K: (x) => (x.pct! < 100 ? x.pct! / (100 - x.pct!) : undefined),
      },
    },
  ],
  steps: {
    'K = e^(A/RT)': {
      K: {
        expr: 'e^({A} × 1000 ÷ (8.314 × {T}))',
        how: 'Change A to J/mol (× 1000), divide by RT, and raise e to that power.',
      },
      A: {
        expr: '8.314 × {T} × ln({K}) ÷ 1000',
        how: 'Take ln of K, multiply by RT, and change J/mol to kJ/mol (÷ 1000).',
      },
      T: {
        expr: '{A} × 1000 ÷ (8.314 × ln({K}))',
        how: 'Divide A (in J/mol) by R times ln K.',
      },
    },
    '% = 100K ÷ (1 + K)': {
      pct: {
        expr: '100 × {K} ÷ (1 + {K})',
        how: 'For every 1 axial molecule there are K equatorial ones: K of every 1 + K.',
      },
      K: {
        expr: '{pct} ÷ (100 − {pct})',
        how: 'Divide the equatorial percent by the axial percent.',
      },
    },
  },
  example,
  startWith: ['A', 'T'],
  representation: {
    kind: 'skeletal',
    mode: 'chair',
    chair: {
      groups: [{ at: 1, label, face: 'up' }],
      energy: 'A',
      temperature: 'T',
      k: 'K',
      percent: 'pct',
    },
  },
});

const chairExample = (A: number, T: number) => {
  const K = Math.exp((A * 1000) / (R * T));
  return { A, T, K, pct: (100 * K) / (1 + K) };
};

const chairMethyl = chair(
  'g.he-skeletal-chair',
  'Methylcyclohexane: the ring flip',
  'CH₃',
  chairExample(7.3, 298.15),
);

const chairTertButyl = chair(
  'g.he-skeletal-chair-tert-butyl',
  'tert-Butylcyclohexane: almost all equatorial',
  'C(CH₃)₃',
  chairExample(20.5, 298.15),
);

// ─── HC2: R or S, and the enantiomer's share (organic-1#1~optical-rotation) ───

const rotation: ModuleDef = {
  id: 'g.he-skeletal-enantiomers',
  title: 'Enantiomeric excess, with R and S drawn',
  use: 'Use this for “A sample of (S)-butan-2-ol rotates +0.540° (1.00 dm, 0.0500 g/mL). What is its ee?”',
  unitSystems: ['metric'],
  workedFigures: 3,
  assumptions: [
    '[α] = α ÷ (l × c), with l in dm and c in g/mL; a racemic mixture reads 0.',
    'The drawn enantiomer, (S)-butan-2-ol, has [α]₀ = +13.5°; its mirror image, (R), turns light as far the other way.',
    'The sign of the rotation says nothing about R or S: that comes from the CIP ranks and the wedge.',
  ],
  variables: [
    {
      id: 'alpha',
      symbol: 'α',
      name: 'Observed rotation',
      unit: '°',
      min: -180,
      max: 180,
      step: 0.001,
    },
    { id: 'l', symbol: 'l', name: 'Path length', unit: 'dm', min: 0.1, max: 10, step: 0.01 },
    {
      id: 'c',
      symbol: 'c',
      name: 'Concentration',
      unit: 'g/mL',
      min: 0.0001,
      max: 2,
      step: 0.0001,
    },
    {
      id: 'sr',
      symbol: '[α]',
      name: 'Specific rotation',
      unit: '°',
      min: -1000,
      max: 1000,
    },
    {
      id: 'sr0',
      symbol: '[α]₀',
      name: 'Pure enantiomer’s specific rotation',
      unit: '°',
      min: -1000,
      max: 1000,
      step: 0.1,
    },
    {
      id: 'ee',
      symbol: 'ee',
      name: 'Enantiomeric excess',
      unit: '%',
      min: -100,
      max: 100,
    },
    {
      id: 'major',
      symbol: 'x₊',
      name: 'Share of the (+) enantiomer',
      unit: '%',
      min: 0,
      max: 100,
    },
  ],
  relations: [
    {
      id: '[α] = α ÷ (lc)',
      display: '{sr} = {alpha} ÷ ({l} × {c})',
      vars: ['sr', 'alpha', 'l', 'c'],
      residual: (x) => x.sr! * x.l! * x.c! - x.alpha!,
      solve: {
        sr: (x) => div(x.alpha!, x.l! * x.c!),
        alpha: (x) => x.sr! * x.l! * x.c!,
        l: (x) => div(x.alpha!, x.sr! * x.c!),
        c: (x) => div(x.alpha!, x.sr! * x.l!),
      },
    },
    {
      id: 'ee = 100[α] ÷ [α]₀',
      display: '{ee} = 100 × {sr} ÷ {sr0}',
      vars: ['ee', 'sr', 'sr0'],
      residual: (x) => x.ee! * x.sr0! - 100 * x.sr!,
      solve: {
        ee: (x) => div(100 * x.sr!, x.sr0!),
        sr: (x) => (x.ee! * x.sr0!) / 100,
        sr0: (x) => div(100 * x.sr!, x.ee!),
      },
    },
    {
      id: 'x₊ = (100 + ee) ÷ 2',
      display: '{major} = (100 + {ee}) ÷ 2',
      vars: ['major', 'ee'],
      residual: (x) => 2 * x.major! - 100 - x.ee!,
      solve: { major: (x) => (100 + x.ee!) / 2, ee: (x) => 2 * x.major! - 100 },
    },
  ],
  steps: {
    '[α] = α ÷ (lc)': {
      sr: {
        expr: '{alpha} ÷ ({l} × {c})',
        how: 'Divide the observed rotation by the path length times the concentration.',
      },
      alpha: {
        expr: '{sr} × {l} × {c}',
        how: 'Multiply the specific rotation by the path length and the concentration.',
      },
      l: { expr: '{alpha} ÷ ({sr} × {c})', how: 'Divide the rotation by [α] times c.' },
      c: { expr: '{alpha} ÷ ({sr} × {l})', how: 'Divide the rotation by [α] times l.' },
    },
    'ee = 100[α] ÷ [α]₀': {
      ee: {
        expr: '100 × {sr} ÷ {sr0}',
        how: 'The sample turns light this fraction as far as the pure enantiomer.',
      },
      sr: { expr: '{ee} × {sr0} ÷ 100', how: 'Take ee percent of the pure enantiomer’s rotation.' },
      sr0: { expr: '100 × {sr} ÷ {ee}', how: 'Divide the sample’s [α] by the ee as a fraction.' },
    },
    'x₊ = (100 + ee) ÷ 2': {
      major: {
        expr: '(100 + {ee}) ÷ 2',
        how: 'The excess is all one enantiomer; the rest is half each.',
      },
      ee: { expr: '2 × {major} − 100', how: 'The (+) share less the (−) share, 100 − x₊.' },
    },
  },
  example: { alpha: 0.54, l: 1, c: 0.05, sr: 10.8, sr0: 13.5, ee: 80, major: 90 },
  startWith: ['alpha', 'l', 'c', 'sr0'],
  representation: {
    kind: 'skeletal',
    smiles: 'C[C@H](O)CC',
    name: 'butan-2-ol',
    center: 1,
    enantiomers: { major: 'major' },
  },
  pictureLabels: ['alpha', 'l', 'c', 'sr', 'sr0', 'ee'],
};

export const HE1C_GALLERY_MODULES: ModuleDef[] = [
  ihdCyclohexanone,
  ihdNaphthalene,
  hydrogenationCyclohexene,
  hydrogenationLimonene,
  chairMethyl,
  chairTertButyl,
  rotation,
];

// ─── HC2: skeletal cards ─────────────────────────────────────────────────────

const card = (smiles: string, more: Omit<SkeletalCard, 'kind' | 'smiles'> = {}): SkeletalCard => ({
  kind: 'skeletal',
  smiles,
  ...more,
});

/** Stands in for he.chemistry.organic-2#0: aromatic, antiaromatic or nonaromatic, drawn. */
const aromaticCards: LayoutDef = {
  kind: 'sort',
  id: 'g.he-skeletal-card-aromatic',
  title: 'Aromatic, antiaromatic or nonaromatic',
  use: 'Use this for “Is the cyclopentadienyl anion aromatic?”',
  assumptions: [
    'Aromatic: a flat ring of p orbitals with 4n + 2 π electrons (2, 6, 10).',
    'Antiaromatic: a flat ring of p orbitals with 4n π electrons (4, 8).',
    'A lone pair in a p orbital counts 2 π electrons; an empty p orbital (a cation) counts 0.',
  ],
  question: 'Is the ring aromatic, antiaromatic or nonaromatic?',
  bins: [
    {
      id: 'aromatic',
      label: 'Aromatic',
      why: 'A flat ring of p orbitals with 2, 6 or 10 π electrons.',
    },
    {
      id: 'anti',
      label: 'Antiaromatic',
      why: 'A flat ring of p orbitals with 4 or 8 π electrons.',
    },
    {
      id: 'non',
      label: 'Nonaromatic',
      why: 'The ring of p orbitals is broken (an sp³ carbon) or the ring is not flat.',
    },
  ],
  cards: (
    [
      ['Benzene', 'c1ccccc1', 'aromatic'],
      ['Cyclopentadienyl anion', '[cH-]1cccc1', 'aromatic'],
      ['Cycloheptatrienyl cation', '[cH+]1cccccc1', 'aromatic'],
      ['Pyridine', 'c1ccncc1', 'aromatic'],
      ['Pyrrole', 'c1cc[nH]c1', 'aromatic'],
      ['Furan', 'c1ccoc1', 'aromatic'],
      ['Cyclobutadiene', 'C1=CC=C1', 'anti'],
      ['Cyclopentadienyl cation', '[CH+]1C=CC=C1', 'anti'],
      ['Cyclopenta-1,3-diene', 'C1=CCC=C1', 'non'],
      ['Cyclooctatetraene', 'C1=CC=CC=CC=C1', 'non'],
      ['Cyclohexene', 'C1=CCCCC1', 'non'],
    ] as const
  ).map(([label, smiles, bin]) => ({ label, bin, figure: card(smiles) })),
};

/** Stands in for he.chemistry.organic-1#0~functional-groups: each group lit. */
const groupCards: LayoutDef = {
  kind: 'sort',
  id: 'g.he-skeletal-card-groups',
  title: 'The name’s ending from the lit group',
  use: 'Use this for “What ending does the name of CH₃CH₂CN take?”',
  assumptions: [
    'The lit part of each structure is the group that gives the name its ending.',
    'With two groups, the one higher in priority gives the ending; the other becomes a prefix (hydroxy-).',
  ],
  question: 'Which ending does the name take?',
  pickBar: true,
  bins: [
    { id: 'acid', label: '-oic acid', why: 'A C=O with an –OH on the same carbon.' },
    { id: 'ester', label: '-oate', why: 'A C=O whose single-bonded O links to another carbon.' },
    { id: 'amide', label: '-amide', why: 'A C=O with an N on the same carbon.' },
    { id: 'nitrile', label: '-nitrile', why: 'A carbon triple-bonded to N.' },
    { id: 'al', label: '-al', why: 'A C=O at the end of the chain, with an H on it.' },
    { id: 'one', label: '-one', why: 'A C=O between two carbons.' },
    { id: 'ol', label: '-ol', why: 'An –OH on a carbon with no C=O.' },
    { id: 'amine', label: '-amine', why: 'An N on a carbon with no C=O.' },
  ],
  cards: (
    [
      ['Propanoic acid', 'CCC(=O)O', 'acid', 'carboxyl'],
      ['Ethyl ethanoate', 'CC(=O)OCC', 'ester', 'ester'],
      ['Ethanamide', 'CC(N)=O', 'amide', 'amide'],
      ['Propanenitrile', 'CCC#N', 'nitrile', 'nitrile'],
      ['Propanal', 'CCC=O', 'al', 'aldehyde'],
      ['Propanone', 'CC(C)=O', 'one', 'ketone'],
      ['Ethanol', 'CCO', 'ol', 'hydroxyl'],
      ['Ethanamine', 'CCN', 'amine', 'amine'],
      ['3-Hydroxypropanoic acid', 'OCCC(=O)O', 'acid', 'carboxyl'],
      ['4-Hydroxybutan-2-one', 'CC(=O)CCO', 'one', 'ketone'],
    ] as const
  ).map(([label, smiles, bin, group]) => ({ label, bin, figure: card(smiles, { group }) })),
};

/** R or S from the ranks drawn on each stereocenter (organic-1#1~cip's cards with structures). */
const rsCards: LayoutDef = {
  kind: 'sort',
  id: 'g.he-skeletal-card-rs',
  title: 'R or S from the CIP ranks',
  use: 'Use this for “Is this stereocenter R or S?”',
  assumptions: [
    'Each group on the stereocenter is ranked by atomic number at the first point of difference: 1 highest, 4 lowest.',
    'A wedge points toward you and a dash away. With 4 pointing away, 1 → 2 → 3 clockwise is R and counterclockwise is S.',
  ],
  question: 'Is the ranked stereocenter R or S?',
  bins: [
    { id: 'R', label: 'R', why: 'With rank 4 away from you, 1 → 2 → 3 turns clockwise.' },
    { id: 'S', label: 'S', why: 'With rank 4 away from you, 1 → 2 → 3 turns counterclockwise.' },
  ],
  cards: (
    [
      ['(R)-Butan-2-ol', 'CC[C@@H](C)O', 2, 'R'],
      ['(S)-Butan-2-ol', 'C[C@H](O)CC', 1, 'S'],
      ['(S)-Alanine', 'N[C@@H](C)C(=O)O', 1, 'S'],
      ['(R)-Glyceraldehyde', 'OC[C@@H](O)C=O', 2, 'R'],
      ['(R)-2-Chlorobutane', 'CC[C@@H](C)Cl', 2, 'R'],
      ['(S)-2-Bromobutane', 'C[C@H](Br)CC', 1, 'S'],
    ] as const
  ).map(([label, smiles, center, bin]) => ({ label, bin, figure: card(smiles, { center }) })),
};

/** Stands in for he.chemistry.organic-1#0: naming a branched alkane, step by step. */
const NAMED = 'CC(C)C(CC)CCC';
const namingStages: LayoutDef = {
  kind: 'sequence',
  id: 'g.he-skeletal-card-naming',
  title: 'Name a branched alkane',
  use: 'Use this for “Name the alkane CH₃CH(CH₃)CH(CH₂CH₃)CH₂CH₂CH₃.”',
  assumptions: [
    'The worked molecule is 3-ethyl-2-methylhexane.',
    'The parent is the longest chain; with two of the same length, the one with more branches.',
  ],
  question: 'Put the steps of naming in order.',
  stages: [
    {
      label: 'Find the longest carbon chain: the parent',
      figure: card(NAMED, { group: [0, 1, 3, 6, 7, 8] }),
    },
    {
      label: 'Number the chain from the end nearer the first branch',
      figure: card(NAMED, { numbered: true }),
    },
    {
      label: 'Name each branch and give it its number',
      figure: card(NAMED, { numbered: true, group: [2, 4, 5] }),
    },
    {
      label: 'List the branches in alphabetical order (di- and tri- don’t count)',
      figure: card(NAMED, { numbered: true, group: [4, 5] }),
    },
    { label: 'Write the numbers, the branch names, then the parent' },
  ],
};

export const HE1C_GALLERY_LAYOUTS: LayoutDef[] = [aromaticCards, groupCards, rsCards, namingStages];

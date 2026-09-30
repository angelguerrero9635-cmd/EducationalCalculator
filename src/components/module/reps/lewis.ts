/**
 * Bonding data for the `lewisStructure` pictures (H47): hand-made Lewis structures of the
 * molecules and ions the lessons use (atoms, bonds and lone pairs, every atom's octet or duet
 * checked by the tests), ionic formulas from the charges, and hydrocarbon chains from n
 * carbons. No drawing, so the harness checks the same numbers.
 */
import { atomicNumber, groupOf, parseFormula } from './chem';

export interface LewisAtom {
  el: string;
  x: number;
  y: number;
  /** Directions of its lone pairs, in degrees (0 right, 90 down). */
  lone: number[];
}

export interface Lewis {
  atoms: LewisAtom[];
  /** [atom, atom, 1 | 2 | 3] */
  bonds: [number, number, number][];
  /** An ion's charge (drawn in brackets). */
  charge: number;
}

const at = (el: string, x: number, y: number, ...lone: number[]): LewisAtom => ({ el, x, y, lone });

export const LEWIS: Record<string, Lewis> = {
  H2: { atoms: [at('H', -0.5, 0), at('H', 0.5, 0)], bonds: [[0, 1, 1]], charge: 0 },
  H2O: {
    atoms: [at('O', 0, 0, 200, 340), at('H', -0.82, 0.57), at('H', 0.82, 0.57)],
    bonds: [
      [0, 1, 1],
      [0, 2, 1],
    ],
    charge: 0,
  },
  CO2: {
    atoms: [at('O', -1, 0, 180, 270), at('C', 0, 0), at('O', 1, 0, 0, 270)],
    bonds: [
      [0, 1, 2],
      [1, 2, 2],
    ],
    charge: 0,
  },
  NH3: {
    atoms: [at('N', 0, 0, 270), at('H', -1, 0), at('H', 1, 0), at('H', 0, 1)],
    bonds: [
      [0, 1, 1],
      [0, 2, 1],
      [0, 3, 1],
    ],
    charge: 0,
  },
  CH4: {
    atoms: [at('C', 0, 0), at('H', -1, 0), at('H', 1, 0), at('H', 0, -1), at('H', 0, 1)],
    bonds: [
      [0, 1, 1],
      [0, 2, 1],
      [0, 3, 1],
      [0, 4, 1],
    ],
    charge: 0,
  },
  O2: {
    atoms: [at('O', -0.5, 0, 180, 270), at('O', 0.5, 0, 0, 270)],
    bonds: [[0, 1, 2]],
    charge: 0,
  },
  N2: { atoms: [at('N', -0.5, 0, 180), at('N', 0.5, 0, 0)], bonds: [[0, 1, 3]], charge: 0 },
  F2: {
    atoms: [at('F', -0.5, 0, 180, 90, 270), at('F', 0.5, 0, 0, 90, 270)],
    bonds: [[0, 1, 1]],
    charge: 0,
  },
  Cl2: {
    atoms: [at('Cl', -0.5, 0, 180, 90, 270), at('Cl', 0.5, 0, 0, 90, 270)],
    bonds: [[0, 1, 1]],
    charge: 0,
  },
  HF: { atoms: [at('H', -0.5, 0), at('F', 0.5, 0, 0, 90, 270)], bonds: [[0, 1, 1]], charge: 0 },
  HCl: { atoms: [at('H', -0.5, 0), at('Cl', 0.5, 0, 0, 90, 270)], bonds: [[0, 1, 1]], charge: 0 },
  CH2O: {
    atoms: [at('C', 0, 0.3), at('O', 0, -0.7, 225, 315), at('H', -0.87, 0.8), at('H', 0.87, 0.8)],
    bonds: [
      [0, 1, 2],
      [0, 2, 1],
      [0, 3, 1],
    ],
    charge: 0,
  },
  HCN: {
    atoms: [at('H', -1, 0), at('C', 0, 0), at('N', 1, 0, 0)],
    bonds: [
      [0, 1, 1],
      [1, 2, 3],
    ],
    charge: 0,
  },
  'NH4+': {
    atoms: [at('N', 0, 0), at('H', -1, 0), at('H', 1, 0), at('H', 0, -1), at('H', 0, 1)],
    bonds: [
      [0, 1, 1],
      [0, 2, 1],
      [0, 3, 1],
      [0, 4, 1],
    ],
    charge: 1,
  },
  'H3O+': {
    atoms: [at('O', 0, 0, 270), at('H', -1, 0), at('H', 1, 0), at('H', 0, 1)],
    bonds: [
      [0, 1, 1],
      [0, 2, 1],
      [0, 3, 1],
    ],
    charge: 1,
  },
  'OH-': {
    atoms: [at('O', -0.5, 0, 180, 270, 90), at('H', 0.5, 0)],
    bonds: [[0, 1, 1]],
    charge: -1,
  },
  'CN-': { atoms: [at('C', -0.5, 0, 180), at('N', 0.5, 0, 0)], bonds: [[0, 1, 3]], charge: -1 },
};

/** A structure's key from its atoms and charge ({ H: 4, N: 1 }, +1 → "NH4+"), if one is drawn. */
export function lewisKey(atoms: Record<string, number>, charge = 0): string | undefined {
  const want = Object.entries(atoms).filter(([, n]) => n > 0);
  return Object.keys(LEWIS).find((key) => {
    const q = key.endsWith('+') ? 1 : key.endsWith('-') ? -1 : 0;
    if (q !== charge) return false;
    const parts = parseFormula(key.replace(/[+-]$/, ''));
    return (
      parts.length === want.length &&
      want.every(([el, n]) => parts.some((p) => p.el === el && p.n === n))
    );
  });
}

/** Valence electrons of a main-group atom: its group's last digit (helium 2). */
export function valenceElectrons(el: string): number {
  const z = atomicNumber(el);
  if (z === undefined) return 0;
  if (z === 2) return 2;
  const g = groupOf(z) ?? 0;
  return g <= 2 ? g : g >= 13 ? g - 10 : 0;
}

/** Totals of a structure: valence electrons, bonding pairs, lone pairs. */
export function lewisCounts(s: Lewis) {
  const valence = s.atoms.reduce((sum, a) => sum + valenceElectrons(a.el), 0) - s.charge;
  const bonding = s.bonds.reduce((sum, b) => sum + b[2], 0);
  const lone = s.atoms.reduce((sum, a) => sum + a.lone.length, 0);
  return { valence, bonding, lone };
}

/** Electrons around one atom: its lone pairs and every bond it is in, 2 each. */
export const electronsAround = (s: Lewis, i: number) =>
  2 * s.atoms[i]!.lone.length +
  2 * s.bonds.filter(([a, b]) => a === i || b === i).reduce((sum, b) => sum + b[2], 0);

/** "NH4+" → "NH₄⁺", "OH-" → "OH⁻". */
export function ionFormula(key: string): string {
  const sub = '₀₁₂₃₄₅₆₇₈₉';
  return key
    .replace(/(\d)/g, (d) => sub[Number(d)]!)
    .replace(/\+$/, '⁺')
    .replace(/-$/, '⁻');
}

// ─── Ionic bonds ─────────────────────────────────────────────────────────────

const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));

/**
 * An ionic compound of a metal and a nonmetal: each metal atom gives its valence electrons,
 * each nonmetal atom takes enough to fill its octet, and the ions come in the smallest whole
 * numbers that balance: Mg and Cl → MgCl₂ (2 electrons move).
 */
export function ionic(metal: string, nonmetal: string) {
  const give = valenceElectrons(metal);
  const take = 8 - valenceElectrons(nonmetal);
  const lcm = (give * take) / gcd(give, take);
  return { give, take, metals: lcm / give, nonmetals: lcm / take, transferred: lcm };
}

/** Metals and nonmetals the ionic pictures draw. */
export const IONIC_METALS = ['Li', 'Na', 'K', 'Rb', 'Cs', 'Be', 'Mg', 'Ca', 'Sr', 'Ba', 'Al'];
export const IONIC_NONMETALS = ['F', 'Cl', 'Br', 'I', 'O', 'S', 'N', 'P'];

// ─── Hydrocarbons ────────────────────────────────────────────────────────────

export type CarbonBond = 'single' | 'double' | 'triple';

const STEMS = ['meth', 'eth', 'prop', 'but', 'pent', 'hex', 'hept', 'oct', 'non', 'dec'];

/** Hydrogens in a chain of n carbons: CₙH₂ₙ₊₂, CₙH₂ₙ (one double bond), CₙH₂ₙ₋₂ (one triple). */
export const hydrogensOf = (n: number, bond: CarbonBond) =>
  bond === 'single' ? 2 * n + 2 : bond === 'double' ? 2 * n : 2 * n - 2;

/** The chain's name: propane, 1-butene, ethyne … */
export function hydrocarbonName(n: number, bond: CarbonBond): string {
  const stem = STEMS[n - 1] ?? `C${n}`;
  const end = bond === 'single' ? 'ane' : bond === 'double' ? 'ene' : 'yne';
  return `${bond !== 'single' && n >= 4 ? '1-' : ''}${stem}${end}`;
}

/**
 * Hydrogens on each carbon of a straight chain with its multiple bond (if any) between the
 * first two carbons: every carbon makes four bonds.
 */
export function chainHydrogens(n: number, bond: CarbonBond): number[] {
  const order = bond === 'single' ? 1 : bond === 'double' ? 2 : 3;
  return Array.from({ length: n }, (_, i) => {
    const left = i === 0 ? 0 : i === 1 ? order : 1;
    const right = i === n - 1 ? 0 : i === 0 ? order : 1;
    return 4 - left - right;
  });
}

/** Most carbons a chain draws. */
export const MAX_CARBONS = 8;

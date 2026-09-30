/**
 * Chemistry geometry and arithmetic for the Grades 9–12 round 2 pictures (group H2D, H101): no
 * drawing and no colors, so the harness checks the same numbers the pictures draw.
 *
 * - Formulas whose subscripts are values ("C{x}H{y}"), and a hydrocarbon drawn as a chain.
 * - Ionic compounds drawn as a cluster of ions (a formula unit).
 */
import { atomColor, atomRadius, parseFormula, type Atom, type Molecule } from './chem';
import { chainHydrogens, hydrocarbonName } from './lewis';

// ─── Branched alkanes (lewisStructure hydrocarbon `branches`) ────────────────

/** Methyl groups on each carbon of a main chain of n, from 1-based positions. */
export const branchCounts = (n: number, branches: number[]) =>
  Array.from({ length: n }, (_, i) => branches.filter((p) => p === i + 1).length);

/** Hydrogens left on each main-chain carbon once its methyl groups take a bond each. */
export const branchedHydrogens = (n: number, branches: number[]) => {
  const k = branchCounts(n, branches);
  return chainHydrogens(n, 'single').map((h, i) => h - k[i]!);
};

/** Why methyl groups at these positions don't make a drawable branched alkane, or undefined. */
export function branchProblem(n: number, branches: number[]): string | undefined {
  if (branches.some((p) => !Number.isInteger(p) || p < 2 || p > n - 1))
    return `a methyl group must sit on carbons 2 to ${n - 1} (on an end it lengthens the chain)`;
  if (branchCounts(n, branches).some((k) => k > 2)) return 'at most 2 methyl groups on a carbon';
  return undefined;
}

/** The IUPAC name: the lowest locants, "2,2-dimethylpropane", "2,3-dimethylbutane". */
export function branchedName(n: number, branches: number[]): string {
  if (branches.length === 0) return hydrocarbonName(n, 'single');
  const a = [...branches].sort((x, y) => x - y);
  const b = branches.map((p) => n + 1 - p).sort((x, y) => x - y);
  const firstDiff = a.findIndex((x, i) => x !== b[i]);
  const locants = firstDiff >= 0 && b[firstDiff]! < a[firstDiff]! ? b : a;
  const mult = ['', 'di', 'tri', 'tetra'][branches.length - 1] ?? '';
  return `${locants.join(',')}-${mult}methyl${hydrocarbonName(n, 'single')}`;
}

// ─── Formulas from values ────────────────────────────────────────────────────

const VAR = /\{([^}]+)\}/g;

/** The variable ids a formula names in braces: "C{x}H{y}" → ['x', 'y']. */
export const formulaVars = (formula: string): string[] =>
  [...formula.matchAll(VAR)].map((m) => m[1]!);

/** Whether a formula takes its subscripts from values. */
export const isTemplate = (formula: string) => formula.includes('{');

/**
 * A formula with its values put in ("C{x}H{y}" with x 3, y 8 → "C3H8"); undefined while a value
 * is unknown or not a whole number of at least 1 (a subscript of 1 is left out, as written).
 * With `zeroDrops`, a subscript of 0 leaves its element out ("H{h}SO4" with h 0 → "SO4").
 */
export function fillFormula(
  formula: string,
  get: (id: string) => number | undefined,
  zeroDrops = false,
): string | undefined {
  let ok = true;
  const out = formula.replace(
    /([A-Z][a-z]?)?\{([^}]+)\}/g,
    (_, el: string | undefined, id: string) => {
      const v = get(id);
      if (zeroDrops && v === 0) return '';
      if (v === undefined || !Number.isInteger(v) || v < 1) {
        ok = false;
        return el ?? '';
      }
      return `${el ?? ''}${v === 1 ? '' : v}`;
    },
  );
  return ok ? out : undefined;
}

const SUB_LETTERS: Record<string, string> = {
  a: 'ₐ',
  e: 'ₑ',
  h: 'ₕ',
  i: 'ᵢ',
  k: 'ₖ',
  m: 'ₘ',
  n: 'ₙ',
  o: 'ₒ',
  p: 'ₚ',
  r: 'ᵣ',
  s: 'ₛ',
  t: 'ₜ',
  x: 'ₓ',
  y: 'ᵧ',
};
const SUB_DIGITS = '₀₁₂₃₄₅₆₇₈₉';

/** A symbol as a subscript where Unicode has one ("x" → "ₓ"), else after an underscore. */
const subscriptSymbol = (s: string) =>
  [...s].every((ch) => SUB_LETTERS[ch] || /\d/.test(ch))
    ? [...s].map((ch) => SUB_LETTERS[ch] ?? SUB_DIGITS[Number(ch)]!).join('')
    : `_${s}`;

/** A template printed with its symbols as subscripts: "C{x}H{y}" → "CₓHᵧ". */
export const symbolFormula = (formula: string, symbol: (id: string) => string) =>
  formula
    .replace(VAR, (_, id: string) => `\u0000${id}\u0000`)
    .split('\u0000')
    .map((part, i) =>
      i % 2 === 1 ? subscriptSymbol(symbol(part)) : part.replace(/\d/g, (d) => SUB_DIGITS[+d]!),
    )
    .join('');

// ─── A hydrocarbon as a chain ────────────────────────────────────────────────

/**
 * Bonds between neighboring carbons of an unbranched CₓHᵧ: each missing pair of hydrogens
 * (below the alkane's 2x + 2) makes one bond double, then triple, from the first carbon on.
 */
export function chainBonds(x: number, y: number): number[] {
  const orders = Array<number>(Math.max(0, x - 1)).fill(1);
  let missing = Math.max(0, Math.floor((2 * x + 2 - y) / 2));
  for (let pass = 0; pass < 2 && missing > 0; pass++)
    for (let i = 0; i < orders.length && missing > 0; i += 2) {
      orders[i]!++;
      missing--;
    }
  for (let i = 1; i < orders.length && missing > 0; i += 2) {
    orders[i]!++;
    missing--;
  }
  return orders;
}

/** Whether CₓHᵧ is an unbranched chain the picture draws (whole, y even, at most 2x + 2). */
export const drawableChain = (x: number, y: number) =>
  Number.isInteger(x) &&
  Number.isInteger(y) &&
  x >= 1 &&
  x <= 12 &&
  y >= 0 &&
  y % 2 === 0 &&
  y <= 2 * x + 2 &&
  // Every carbon keeps at most 4 bonds.
  chainBonds(x, y).every((o) => o <= 3) &&
  hydrogensOn(x, y).every((h) => h >= 0);

/** Hydrogens on each carbon of the chain: 4 less its bonds to carbon, the rest from the end. */
function hydrogensOn(x: number, y: number): number[] {
  const orders = chainBonds(x, y);
  const free = Array.from({ length: x }, (_, i) => 4 - (orders[i - 1] ?? 0) - (orders[i] ?? 0));
  const out = free.map(() => 0);
  let left = y;
  // Fill the carbons evenly, each up to its free bonds.
  for (let round = 0; left > 0 && round < 4; round++)
    for (let i = 0; i < x && left > 0; i++)
      if (out[i]! < free[i]!) {
        out[i]!++;
        left--;
      }
  return left > 0 ? out.map(() => -1) : out;
}

/**
 * An unbranched hydrocarbon laid flat like a structural formula (bond length 1): the carbons
 * in a row, each one's hydrogens above and below it, and the end carbons' third one outward.
 */
export function hydrocarbon(x: number, y: number): Molecule {
  const orders = chainBonds(x, y);
  const hs = hydrogensOn(x, y).map((h) => Math.max(0, h));
  const atoms: Atom[] = [];
  const bonds: [number, number, number][] = [];
  const HB = 0.82;
  for (let i = 0; i < x; i++) {
    atoms.push({ el: 'C', x: i, y: 0, z: 0 });
    if (i > 0) bonds.push([i - 1, i, orders[i - 1]!]);
  }
  const spots = (i: number, n: number): [number, number][] => {
    const end = x === 1 ? 'both' : i === 0 ? 'left' : i === x - 1 ? 'right' : 'mid';
    const up: [number, number] = [i, -HB];
    const down: [number, number] = [i, HB];
    const left: [number, number] = [i - HB, 0];
    const right: [number, number] = [i + HB, 0];
    const order =
      end === 'both'
        ? [left, right, up, down]
        : end === 'left'
          ? [left, up, down]
          : end === 'right'
            ? [right, up, down]
            : [up, down];
    return order.slice(0, n);
  };
  for (let i = 0; i < x; i++)
    for (const [hx, hy] of spots(i, hs[i]!)) {
      atoms.push({ el: 'H', x: hx, y: hy, z: 0 });
      bonds.push([i, atoms.length - 1, 1]);
    }
  return { atoms, bonds };
}

/** C and H counts of a formula made only of carbon and hydrogen, else undefined. */
export function hydrocarbonCounts(formula: string): { x: number; y: number } | undefined {
  const parts = parseFormula(formula);
  if (parts.some((p) => p.el !== 'C' && p.el !== 'H')) return undefined;
  const x = parts.find((p) => p.el === 'C')?.n ?? 0;
  const y = parts.find((p) => p.el === 'H')?.n ?? 0;
  return x >= 1 ? { x, y } : undefined;
}

// ─── Ionic compounds as ions ─────────────────────────────────────────────────

/** A metal joined with nonmetals: an ionic compound (ZnCl₂, Al₂O₃, NaCl). */
export function isIonic(formula: string): boolean {
  const parts = parseFormula(formula);
  const metal = (el: string) => ['atomMetal', 'atomAlkali'].includes(atomColor(el));
  return parts.length >= 2 && parts.some((p) => metal(p.el)) && parts.some((p) => !metal(p.el));
}

/**
 * A formula unit of an ionic compound: the metal ions in a row at the middle and the nonmetal
 * ions around them, touching, with no sticks (bond length 1).
 */
export function ionicUnit(formula: string): Molecule {
  const parts = parseFormula(formula);
  const metal = (el: string) => ['atomMetal', 'atomAlkali'].includes(atomColor(el));
  const cations = parts.filter((p) => metal(p.el)).flatMap((p) => Array<string>(p.n).fill(p.el));
  const anions = parts.filter((p) => !metal(p.el)).flatMap((p) => Array<string>(p.n).fill(p.el));
  const rc = Math.max(...cations.map(atomRadius));
  const ra = Math.max(...anions.map(atomRadius));
  const touch = rc + ra;
  const atoms: Atom[] = [];
  if (cations.length === 1) {
    // One cation: the anions around it, spread evenly (Cl⁻ Zn²⁺ Cl⁻ in a row).
    atoms.push({ el: cations[0]!, x: 0, y: 0, z: 1 });
    const n = anions.length;
    anions.forEach((el, k) => {
      const t = n === 2 ? Math.PI * k : Math.PI + (2 * Math.PI * k) / n;
      atoms.push({ el, x: touch * Math.cos(t), y: touch * Math.sin(t), z: 0 });
    });
  } else {
    // Several: cations and anions taking turns along a zigzag, the more common ion at the ends
    // (O²⁻ Al³⁺ O²⁻ Al³⁺ O²⁻), each touching its neighbors.
    const [many, few] = anions.length >= cations.length ? [anions, cations] : [cations, anions];
    const seq: string[] = [];
    for (let i = 0; i < many.length; i++) {
      seq.push(many[i]!);
      if (i < few.length) seq.push(few[i]!);
    }
    const dx = touch * 0.87;
    const dy = touch * 0.25;
    seq.forEach((el, i) =>
      atoms.push({ el, x: (i - (seq.length - 1) / 2) * dx, y: i % 2 ? dy : -dy, z: 0 }),
    );
  }
  return { atoms, bonds: [], ionic: true };
}

// ─── Effusion, isotopes, oxidation numbers, mass defect ─────────────────────

/** Graham's law: how many times faster gas 1 effuses than gas 2, √(M₂ ÷ M₁). */
export const grahamRatio = (m1: number, m2: number) => Math.sqrt(m2 / m1);

/**
 * Of `total` molecules that have escaped, how many are the first gas: in the ratio of the rates
 * (rounded, at least one of each when both rates are real).
 */
export function escapedSplit(ratio: number, total: number): [number, number] {
  const first = Math.min(total - 1, Math.max(1, Math.round((total * ratio) / (1 + ratio))));
  return [first, total - first];
}

/** The average atomic mass of two isotopes from the first one's percent. */
export const averageMass = (m1: number, m2: number, p1: number) =>
  (m1 * p1) / 100 + (m2 * (100 - p1)) / 100;

/** Atoms of a formula one by one, in the order written: "MnO4" → Mn, O, O, O, O. */
export const atomsInOrder = (formula: string) =>
  parseFormula(formula).flatMap(({ el, n }) => Array<string>(n).fill(el));

/** A signed number as a chemist writes an oxidation number or a charge: +7, −2, 0. */
export const signedText = (x: number, text = String(Math.abs(x))) =>
  x > 0 ? `+${text}` : x < 0 ? `−${text}` : '0';

/** A charge as a superscript after a formula: −1 → ⁻, +2 → ²⁺, 0 → nothing. */
export function chargeSuperscript(q: number): string {
  if (!q) return '';
  const SUP = '⁰¹²³⁴⁵⁶⁷⁸⁹';
  const n = Math.abs(Math.round(q));
  return `${n === 1 ? '' : [...String(n)].map((d) => SUP[Number(d)]).join('')}${q > 0 ? '⁺' : '⁻'}`;
}

/** Energy from a mass defect: Δm (u) × 931.5 MeV per u. */
export const defectEnergy = (dm: number) => dm * 931.5;

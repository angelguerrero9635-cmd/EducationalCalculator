/**
 * Chemistry geometry and arithmetic for the Grades 9–12 round 2 pictures (group H2D, H101): no
 * drawing and no colors, so the harness checks the same numbers the pictures draw.
 *
 * - Formulas whose subscripts are values ("C{x}H{y}"), and a hydrocarbon drawn as a chain.
 * - Ionic compounds drawn as a cluster of ions (a formula unit).
 */
import { atomColor, atomRadius, parseFormula, type Atom, type Molecule } from './chem';

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
 */
export function fillFormula(
  formula: string,
  get: (id: string) => number | undefined,
): string | undefined {
  let ok = true;
  const out = formula.replace(VAR, (_, id: string) => {
    const v = get(id);
    if (v === undefined || !Number.isInteger(v) || v < 1) {
      ok = false;
      return '';
    }
    return v === 1 ? '' : String(v);
  });
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

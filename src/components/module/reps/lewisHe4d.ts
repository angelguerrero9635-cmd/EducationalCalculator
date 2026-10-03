/**
 * Lewis structures for the college options of `lewisStructure` (HC111, `typesHe4d.ts`): ions
 * drawn as their resonance forms (the same atoms, the bonds and lone pairs moved) and molecules
 * with expanded octets, with every atom's formal charge FC = v − N − B ÷ 2. Hand-made, original;
 * no drawing here, so the harness checks the same numbers.
 */
import { LEWIS, valenceElectrons, type Lewis } from './lewis';

export interface ResonanceAtom {
  el: string;
  x: number;
  y: number;
}

/** One resonance form: its bonds [atom, atom, order] and each atom's lone-pair directions. */
export interface ResonanceForm {
  bonds: [number, number, number][];
  /** Per atom, its lone pairs' directions in degrees (0 right, 90 down). */
  lone: number[][];
}

export interface ResonanceSet {
  atoms: ResonanceAtom[];
  forms: ResonanceForm[];
  charge: number;
  /** How many forms there are in all, when only some are drawn (SO₄²⁻: 3 of 6). */
  total?: number;
}

const A = (el: string, x: number, y: number): ResonanceAtom => ({ el, x, y });
const deg = (x: number, y: number) => (Math.atan2(y, x) * 180) / Math.PI;

/** Lone pairs pointing away from the centre: 1, 2 or 3 of them, spread around the outward line. */
function away(atom: ResonanceAtom, pairs: number): number[] {
  const t = deg(atom.x, atom.y);
  if (pairs === 1) return [t];
  if (pairs === 2) return [t - 55, t + 55];
  if (pairs === 3) return [t - 90, t, t + 90];
  return [];
}

/**
 * A centre (atom 0) bonded to outer atoms (1 …) with the given orders; each outer atom fills its
 * octet (or keeps 3 pairs as a halogen) with lone pairs pointing out; the centre gets `centre`.
 */
function star(
  centre: string,
  outer: [string, number, number][],
  orders: number[],
  centrePairs: number[],
): ResonanceForm & { atoms: ResonanceAtom[] } {
  const atoms = [A(centre, 0, 0), ...outer.map(([el, x, y]) => A(el, x, y))];
  const bonds = orders.map((o, i) => [0, i + 1, o] as [number, number, number]);
  const lone = [centrePairs, ...outer.map((_, i) => away(atoms[i + 1]!, 4 - orders[i]!))];
  return { atoms, bonds, lone };
}

/** Several forms of one star, by the outer atoms' bond orders in each. */
function starSet(
  centre: string,
  outer: [string, number, number][],
  forms: { orders: number[]; centre: number[] }[],
  charge: number,
  total?: number,
): ResonanceSet {
  const made = forms.map((f) => star(centre, outer, f.orders, f.centre));
  return {
    atoms: made[0]!.atoms,
    forms: made.map(({ bonds, lone }) => ({ bonds, lone })),
    charge,
    ...(total ? { total } : {}),
  };
}

const TRIGONAL: [number, number][] = [
  [0, -1],
  [-0.87, 0.5],
  [0.87, 0.5],
];
const tri = (el: string) => TRIGONAL.map(([x, y]) => [el, x, y] as [string, number, number]);
const ring = (el: string, n: number, start: number) =>
  Array.from({ length: n }, (_, k) => {
    const a = ((start + (360 * k) / n) * Math.PI) / 180;
    return [el, Number(Math.cos(a).toFixed(3)), Number(Math.sin(a).toFixed(3))] as [
      string,
      number,
      number,
    ];
  });

export const RESONANCE: Record<string, ResonanceSet> = {
  'NO3-': starSet(
    'N',
    tri('O'),
    [
      { orders: [2, 1, 1], centre: [] },
      { orders: [1, 2, 1], centre: [] },
      { orders: [1, 1, 2], centre: [] },
    ],
    -1,
  ),
  'CO3 2-': starSet(
    'C',
    tri('O'),
    [
      { orders: [2, 1, 1], centre: [] },
      { orders: [1, 2, 1], centre: [] },
      { orders: [1, 1, 2], centre: [] },
    ],
    -2,
  ),
  // Ozone: bent, the middle O with one lone pair on top.
  O3: starSet(
    'O',
    [
      ['O', -0.87, 0.5],
      ['O', 0.87, 0.5],
    ],
    [
      { orders: [2, 1], centre: [270] },
      { orders: [1, 2], centre: [270] },
    ],
    0,
  ),
  'NO2-': starSet(
    'N',
    [
      ['O', -0.87, 0.5],
      ['O', 0.87, 0.5],
    ],
    [
      { orders: [2, 1], centre: [270] },
      { orders: [1, 2], centre: [270] },
    ],
    -1,
  ),
  // Sulfate with two S=O (formal charge 0 on S): 3 of its 6 forms.
  'SO4 2-': starSet(
    'S',
    [
      ['O', 0, -1],
      ['O', 1, 0],
      ['O', 0, 1],
      ['O', -1, 0],
    ],
    [
      { orders: [2, 2, 1, 1], centre: [] },
      { orders: [1, 2, 2, 1], centre: [] },
      { orders: [1, 1, 2, 2], centre: [] },
    ],
    -2,
    6,
  ),
  // Expanded octets: one form each.
  PCl5: starSet('P', ring('Cl', 5, -90), [{ orders: [1, 1, 1, 1, 1], centre: [] }], 0),
  SF6: starSet('S', ring('F', 6, 0), [{ orders: [1, 1, 1, 1, 1, 1], centre: [] }], 0),
  // Seesaw: two axial F (up, down), two equatorial to the left, the lone pair to the right.
  SF4: starSet(
    'S',
    [
      ['F', 0, -1],
      ['F', 0, 1],
      ['F', -0.87, -0.5],
      ['F', -0.87, 0.5],
    ],
    [{ orders: [1, 1, 1, 1], centre: [0] }],
    0,
  ),
  // T-shaped: three F, two lone pairs to the right.
  ClF3: starSet(
    'Cl',
    [
      ['F', 0, -1],
      ['F', 0, 1],
      ['F', -1, 0],
    ],
    [{ orders: [1, 1, 1], centre: [-35, 35] }],
    0,
  ),
  // Square planar: the lone pairs on the diagonals (above and below the plane in 3-D).
  XeF4: starSet('Xe', ring('F', 4, 0), [{ orders: [1, 1, 1, 1], centre: [45, 225] }], 0),
  // Linear I₃⁻: three lone pairs on the middle iodine.
  'I3-': starSet(
    'I',
    [
      ['I', -1, 0],
      ['I', 1, 0],
    ],
    [{ orders: [1, 1], centre: [90, 230, 310] }],
    -1,
  ),
};

/** "NO3-" → "NO₃⁻", "CO3 2-" → "CO₃²⁻". */
export function setFormula(key: string): string {
  const sub = '₀₁₂₃₄₅₆₇₈₉';
  const sup = '⁰¹²³⁴⁵⁶⁷⁸⁹';
  const [body, q] = key.split(' ');
  const main = body!.replace(/[+-]$/, '').replace(/(\d)/g, (d) => sub[Number(d)]!);
  const charge = q ?? (/[+-]$/.test(body!) ? body!.slice(-1) : '');
  const text = charge
    .replace(/(\d)/g, (d) => sup[Number(d)]!)
    .replace('+', '⁺')
    .replace('-', '⁻');
  return main + text;
}

/** A Grades 9–12 structure as a one-form set. */
function fromLewis(s: Lewis): ResonanceSet {
  return {
    atoms: s.atoms.map((a) => A(a.el, a.x, a.y)),
    forms: [{ bonds: s.bonds, lone: s.atoms.map((a) => a.lone) }],
    charge: s.charge,
  };
}

/** The set a formula names: the college table first, then the Grades 9–12 structures. */
export function resonanceSet(formula: string): ResonanceSet | undefined {
  if (RESONANCE[formula]) return RESONANCE[formula];
  return LEWIS[formula] ? fromLewis(LEWIS[formula]) : undefined;
}

export interface AtomCount {
  v: number;
  /** Nonbonding electrons. */
  N: number;
  /** Bonding electrons (2 per bond order). */
  B: number;
  FC: number;
  /** Electrons around the atom: N + B. */
  around: number;
}

/** Each atom's v, N, B and formal charge in one form. */
export function formalCharges(set: ResonanceSet, form: ResonanceForm): AtomCount[] {
  return set.atoms.map((a, i) => {
    const v = valenceElectrons(a.el);
    const N = 2 * form.lone[i]!.length;
    const B = 2 * form.bonds.filter(([p, q]) => p === i || q === i).reduce((s, b) => s + b[2], 0);
    return { v, N, B, FC: v - N - B / 2, around: N + B };
  });
}

/** Valence electrons of the whole set (the ion's charge counted) and those drawn in a form. */
export function electronTotals(set: ResonanceSet, form: ResonanceForm) {
  const valence = set.atoms.reduce((s, a) => s + valenceElectrons(a.el), 0) - set.charge;
  const drawn =
    2 * form.lone.reduce((s, l) => s + l.length, 0) + 2 * form.bonds.reduce((s, b) => s + b[2], 0);
  return { valence, drawn };
}

/** A `lewisStructure` molecule the college option draws (formal charges, resonance, a set). */
export const isLewisHe4d = (s: {
  mode: string;
  formula?: string;
  formal?: unknown;
  resonance?: boolean;
}) =>
  s.mode === 'molecule' &&
  (s.formal !== undefined || !!s.resonance || (!!s.formula && !!RESONANCE[s.formula]));

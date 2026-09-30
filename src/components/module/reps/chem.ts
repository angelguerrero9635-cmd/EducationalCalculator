/**
 * Chemistry data and geometry for the Grade 7–8 pictures: the elements (symbol, name, atomic
 * mass) and where each sits on the periodic table, chemical formulas read into atom counts,
 * and ball-and-stick layouts of common molecules. No drawing and no colors here, so the
 * harness can use it too.
 */

import { EXTRA_LAYOUTS } from './chemLayoutsHs2d';

/**
 * Every element in order of atomic number: [symbol, name, standard atomic mass]. Masses are
 * the rounded standard values; a mass in brackets is the mass number of the longest-lived
 * isotope of an element with no stable one.
 */
export const ELEMENTS: readonly (readonly [string, string, string])[] = [
  ['H', 'Hydrogen', '1.008'],
  ['He', 'Helium', '4.003'],
  ['Li', 'Lithium', '6.94'],
  ['Be', 'Beryllium', '9.012'],
  ['B', 'Boron', '10.81'],
  ['C', 'Carbon', '12.011'],
  ['N', 'Nitrogen', '14.007'],
  ['O', 'Oxygen', '15.999'],
  ['F', 'Fluorine', '18.998'],
  ['Ne', 'Neon', '20.180'],
  ['Na', 'Sodium', '22.990'],
  ['Mg', 'Magnesium', '24.305'],
  ['Al', 'Aluminum', '26.982'],
  ['Si', 'Silicon', '28.085'],
  ['P', 'Phosphorus', '30.974'],
  ['S', 'Sulfur', '32.06'],
  ['Cl', 'Chlorine', '35.45'],
  ['Ar', 'Argon', '39.948'],
  ['K', 'Potassium', '39.098'],
  ['Ca', 'Calcium', '40.078'],
  ['Sc', 'Scandium', '44.956'],
  ['Ti', 'Titanium', '47.867'],
  ['V', 'Vanadium', '50.942'],
  ['Cr', 'Chromium', '51.996'],
  ['Mn', 'Manganese', '54.938'],
  ['Fe', 'Iron', '55.845'],
  ['Co', 'Cobalt', '58.933'],
  ['Ni', 'Nickel', '58.693'],
  ['Cu', 'Copper', '63.546'],
  ['Zn', 'Zinc', '65.38'],
  ['Ga', 'Gallium', '69.723'],
  ['Ge', 'Germanium', '72.630'],
  ['As', 'Arsenic', '74.922'],
  ['Se', 'Selenium', '78.971'],
  ['Br', 'Bromine', '79.904'],
  ['Kr', 'Krypton', '83.798'],
  ['Rb', 'Rubidium', '85.468'],
  ['Sr', 'Strontium', '87.62'],
  ['Y', 'Yttrium', '88.906'],
  ['Zr', 'Zirconium', '91.224'],
  ['Nb', 'Niobium', '92.906'],
  ['Mo', 'Molybdenum', '95.95'],
  ['Tc', 'Technetium', '[98]'],
  ['Ru', 'Ruthenium', '101.07'],
  ['Rh', 'Rhodium', '102.91'],
  ['Pd', 'Palladium', '106.42'],
  ['Ag', 'Silver', '107.87'],
  ['Cd', 'Cadmium', '112.41'],
  ['In', 'Indium', '114.82'],
  ['Sn', 'Tin', '118.71'],
  ['Sb', 'Antimony', '121.76'],
  ['Te', 'Tellurium', '127.60'],
  ['I', 'Iodine', '126.90'],
  ['Xe', 'Xenon', '131.29'],
  ['Cs', 'Cesium', '132.91'],
  ['Ba', 'Barium', '137.33'],
  ['La', 'Lanthanum', '138.91'],
  ['Ce', 'Cerium', '140.12'],
  ['Pr', 'Praseodymium', '140.91'],
  ['Nd', 'Neodymium', '144.24'],
  ['Pm', 'Promethium', '[145]'],
  ['Sm', 'Samarium', '150.36'],
  ['Eu', 'Europium', '151.96'],
  ['Gd', 'Gadolinium', '157.25'],
  ['Tb', 'Terbium', '158.93'],
  ['Dy', 'Dysprosium', '162.50'],
  ['Ho', 'Holmium', '164.93'],
  ['Er', 'Erbium', '167.26'],
  ['Tm', 'Thulium', '168.93'],
  ['Yb', 'Ytterbium', '173.05'],
  ['Lu', 'Lutetium', '174.97'],
  ['Hf', 'Hafnium', '178.49'],
  ['Ta', 'Tantalum', '180.95'],
  ['W', 'Tungsten', '183.84'],
  ['Re', 'Rhenium', '186.21'],
  ['Os', 'Osmium', '190.23'],
  ['Ir', 'Iridium', '192.22'],
  ['Pt', 'Platinum', '195.08'],
  ['Au', 'Gold', '196.97'],
  ['Hg', 'Mercury', '200.59'],
  ['Tl', 'Thallium', '204.38'],
  ['Pb', 'Lead', '207.2'],
  ['Bi', 'Bismuth', '208.98'],
  ['Po', 'Polonium', '[209]'],
  ['At', 'Astatine', '[210]'],
  ['Rn', 'Radon', '[222]'],
  ['Fr', 'Francium', '[223]'],
  ['Ra', 'Radium', '[226]'],
  ['Ac', 'Actinium', '[227]'],
  ['Th', 'Thorium', '232.04'],
  ['Pa', 'Protactinium', '231.04'],
  ['U', 'Uranium', '238.03'],
  ['Np', 'Neptunium', '[237]'],
  ['Pu', 'Plutonium', '[244]'],
  ['Am', 'Americium', '[243]'],
  ['Cm', 'Curium', '[247]'],
  ['Bk', 'Berkelium', '[247]'],
  ['Cf', 'Californium', '[251]'],
  ['Es', 'Einsteinium', '[252]'],
  ['Fm', 'Fermium', '[257]'],
  ['Md', 'Mendelevium', '[258]'],
  ['No', 'Nobelium', '[259]'],
  ['Lr', 'Lawrencium', '[266]'],
  ['Rf', 'Rutherfordium', '[267]'],
  ['Db', 'Dubnium', '[268]'],
  ['Sg', 'Seaborgium', '[269]'],
  ['Bh', 'Bohrium', '[270]'],
  ['Hs', 'Hassium', '[269]'],
  ['Mt', 'Meitnerium', '[278]'],
  ['Ds', 'Darmstadtium', '[281]'],
  ['Rg', 'Roentgenium', '[282]'],
  ['Cn', 'Copernicium', '[285]'],
  ['Nh', 'Nihonium', '[286]'],
  ['Fl', 'Flerovium', '[289]'],
  ['Mc', 'Moscovium', '[290]'],
  ['Lv', 'Livermorium', '[293]'],
  ['Ts', 'Tennessine', '[294]'],
  ['Og', 'Oganesson', '[294]'],
];

/** Atomic number of a symbol ("O" → 8), or undefined. */
export const atomicNumber = (symbol: string): number | undefined => {
  const i = ELEMENTS.findIndex(([s]) => s === symbol);
  return i < 0 ? undefined : i + 1;
};

/** An element by atomic number or symbol: { z, symbol, name, mass }. */
export function element(which: number | string) {
  const z = typeof which === 'number' ? Math.round(which) : atomicNumber(which);
  if (z === undefined || z < 1 || z > ELEMENTS.length) return undefined;
  const [symbol, name, mass] = ELEMENTS[z - 1]!;
  return { z, symbol, name, mass };
}

/** The lanthanides (57–71) and actinides (89–103) sit in two rows under the table. */
const fBlock = (z: number) => (z >= 57 && z <= 71) || (z >= 89 && z <= 103);

/** Period (row 1–7) of an element. */
export function periodOf(z: number): number {
  const ends = [2, 10, 18, 36, 54, 86, 118];
  return ends.findIndex((e) => z <= e) + 1;
}

/** Group (column 1–18) of an element; undefined for the lanthanides and actinides. */
export function groupOf(z: number): number | undefined {
  if (fBlock(z)) return undefined;
  if (z === 1) return 1;
  if (z === 2) return 18;
  const p = periodOf(z);
  const first = [0, 1, 3, 11, 19, 37, 55, 87][p]!;
  const k = z - first; // 0-based place in the period
  if (p <= 3) return k < 2 ? k + 1 : k + 11;
  if (p <= 5) return k + 1;
  // Periods 6 and 7: two s-block, the f-block below, then groups 4–18.
  return k < 2 ? k + 1 : k - 14 + 1;
}

/**
 * Where an element is drawn: column 0–17 and row 0–6 in the main table, rows 8–9 for the
 * lanthanides and actinides (row 7 is the gap), which start under group 4.
 */
export function cellOf(z: number): { col: number; row: number } {
  if (fBlock(z)) {
    const first = z <= 71 ? 57 : 89;
    return { col: 3 + (z - first), row: z <= 71 ? 8 : 9 };
  }
  return { col: groupOf(z)! - 1, row: periodOf(z) - 1 };
}

export type Family = 'metal' | 'metalloid' | 'nonmetal' | 'noble';

const NOBLE = [2, 10, 18, 36, 54, 86, 118];
const METALLOIDS = [5, 14, 32, 33, 51, 52, 85];
const NONMETALS = [1, 6, 7, 8, 9, 15, 16, 17, 34, 35, 53, 117];

/** The family a school periodic table colors an element by. */
export const familyOf = (z: number): Family =>
  NOBLE.includes(z)
    ? 'noble'
    : METALLOIDS.includes(z)
      ? 'metalloid'
      : NONMETALS.includes(z)
        ? 'nonmetal'
        : 'metal';

// ─── Formulas ────────────────────────────────────────────────────────────────

/**
 * The atoms in one particle of a formula, in the order they are written: "H2O" → H 2, O 1;
 * "Ca(OH)2" → Ca 1, O 2, H 2. Unknown symbols are kept (they draw pink).
 */
export function parseFormula(formula: string): { el: string; n: number }[] {
  const out = new Map<string, number>();
  const add = (el: string, n: number) => out.set(el, (out.get(el) ?? 0) + n);
  const re = /\(([^)]*)\)(\d*)|([A-Z][a-z]?)(\d*)/g;
  for (const m of formula.matchAll(re)) {
    if (m[1] !== undefined) {
      const k = m[2] ? Number(m[2]) : 1;
      for (const { el, n } of parseFormula(m[1])) add(el, n * k);
    } else if (m[3]) add(m[3], m[4] ? Number(m[4]) : 1);
  }
  return [...out].map(([el, n]) => ({ el, n }));
}

/** Atoms of one element in one particle of the formula. */
export const atomsOf = (formula: string, el: string) =>
  parseFormula(formula).find((a) => a.el === el)?.n ?? 0;

/** Every atom in one particle ("H2O" → 3). */
export const atomTotal = (formula: string) => parseFormula(formula).reduce((s, a) => s + a.n, 0);

const SUB = '₀₁₂₃₄₅₆₇₈₉';
/** A formula with subscript digits: "H2O" → "H₂O". */
export const subscript = (formula: string) => formula.replace(/\d/g, (d) => SUB[Number(d)]!);

/** An element's name, or the symbol when it isn't one. */
export const elementName = (el: string) => element(el)?.name ?? el;

/**
 * The elements across several formulas, in a teacher's order (carbon, hydrogen, oxygen, then
 * the rest as they appear), each once.
 */
export function elementsIn(formulas: string[]): string[] {
  const seen: string[] = [];
  for (const f of formulas)
    for (const { el } of parseFormula(f)) if (!seen.includes(el)) seen.push(el);
  const rank = (el: string) => (el === 'C' ? 0 : el === 'H' ? 1 : el === 'O' ? 2 : 3);
  return seen
    .map((el, i) => ({ el, i }))
    .sort((a, b) => rank(a.el) - rank(b.el) || a.i - b.i)
    .map((x) => x.el);
}

/** Most molecules a `molecules` picture draws; past this the tally still counts them all. */
export const MAX_MOLECULES = 24;

// ─── Molecule geometry ───────────────────────────────────────────────────────

/** Which theme color an atom takes (the CPK convention). */
export type AtomColor =
  | 'atomH'
  | 'atomC'
  | 'atomO'
  | 'atomN'
  | 'atomHalogen'
  | 'atomS'
  | 'atomP'
  | 'atomAlkali'
  | 'atomMetal'
  | 'atomNoble'
  | 'atomOther';

export const ATOM_COLORS: AtomColor[] = [
  'atomH',
  'atomC',
  'atomO',
  'atomN',
  'atomHalogen',
  'atomS',
  'atomP',
  'atomAlkali',
  'atomMetal',
  'atomNoble',
  'atomOther',
];

export function atomColor(el: string): AtomColor {
  switch (el) {
    case 'H':
      return 'atomH';
    case 'C':
      return 'atomC';
    case 'O':
      return 'atomO';
    case 'N':
      return 'atomN';
    case 'F':
    case 'Cl':
    case 'Br':
    case 'I':
      return 'atomHalogen';
    case 'S':
      return 'atomS';
    case 'P':
      return 'atomP';
    case 'Li':
    case 'Na':
    case 'K':
    case 'Rb':
    case 'Cs':
      return 'atomAlkali';
  }
  const z = atomicNumber(el);
  if (z === undefined) return 'atomOther';
  const fam = familyOf(z);
  return fam === 'noble' ? 'atomNoble' : fam === 'metal' ? 'atomMetal' : 'atomOther';
}

/** Hydrogen and the atoms printed in dark ink (light balls); the rest in white. */
export const lightAtom = (el: string) => ['atomH', 'atomS', 'atomNoble'].includes(atomColor(el));

/** Ball radius as a fraction of a bond's length: hydrogen smallest, metals and chlorine biggest. */
export function atomRadius(el: string): number {
  if (el === 'H') return 0.3;
  if (['C', 'N', 'O', 'F'].includes(el)) return 0.4;
  if (['Cl', 'S', 'P', 'Br', 'Si'].includes(el)) return 0.48;
  if (['He', 'Ne', 'Ar'].includes(el)) return 0.38;
  return 0.52;
}

export interface Atom {
  el: string;
  x: number;
  y: number;
  /** Depth: atoms with a bigger z are nearer and drawn last. */
  z: number;
}
export interface Molecule {
  atoms: Atom[];
  /** [atom, atom, 1 | 2 | 3] */
  bonds: [number, number, number][];
  /** Ions held together without sticks (table salt). */
  ionic?: boolean;
}

const A = (el: string, x: number, y: number, z = 0): Atom => ({ el, x, y, z });

/** Hand-made layouts (bond length 1, y down) for the molecules lessons use most. */
const LAYOUTS: Record<string, Molecule> = {
  H2: { atoms: [A('H', -0.5, 0), A('H', 0.5, 0)], bonds: [[0, 1, 1]] },
  O2: { atoms: [A('O', -0.55, 0), A('O', 0.55, 0)], bonds: [[0, 1, 2]] },
  N2: { atoms: [A('N', -0.55, 0), A('N', 0.55, 0)], bonds: [[0, 1, 3]] },
  Cl2: { atoms: [A('Cl', -0.6, 0), A('Cl', 0.6, 0)], bonds: [[0, 1, 1]] },
  F2: { atoms: [A('F', -0.55, 0), A('F', 0.55, 0)], bonds: [[0, 1, 1]] },
  // 104.5° between the two O–H bonds.
  H2O: {
    atoms: [A('O', 0, -0.3), A('H', -0.79, 0.31), A('H', 0.79, 0.31)],
    bonds: [
      [0, 1, 1],
      [0, 2, 1],
    ],
  },
  CO2: {
    atoms: [A('O', -1.1, 0), A('C', 0, 0), A('O', 1.1, 0)],
    bonds: [
      [0, 1, 2],
      [1, 2, 2],
    ],
  },
  CO: { atoms: [A('C', -0.55, 0), A('O', 0.55, 0)], bonds: [[0, 1, 3]] },
  NO: { atoms: [A('N', -0.55, 0), A('O', 0.55, 0)], bonds: [[0, 1, 2]] },
  HCl: { atoms: [A('H', -0.6, 0), A('Cl', 0.55, 0)], bonds: [[0, 1, 1]] },
  // A tetrahedron seen a little from the side: one H behind the carbon.
  CH4: {
    atoms: [
      A('C', 0, 0),
      A('H', 0, -1),
      A('H', -0.94, 0.4),
      A('H', 0.94, 0.4),
      A('H', 0.3, 0.55, -1),
    ],
    bonds: [
      [0, 1, 1],
      [0, 2, 1],
      [0, 3, 1],
      [0, 4, 1],
    ],
  },
  // A low pyramid: the nitrogen on top, one H in front.
  NH3: {
    atoms: [A('N', 0, -0.35), A('H', -0.92, 0.1), A('H', 0.92, 0.1), A('H', 0.1, 0.62, 1)],
    bonds: [
      [0, 1, 1],
      [0, 2, 1],
      [0, 3, 1],
    ],
  },
  O3: {
    atoms: [A('O', 0, -0.3), A('O', -0.85, 0.22), A('O', 0.85, 0.22)],
    bonds: [
      [0, 1, 2],
      [0, 2, 1],
    ],
  },
  SO2: {
    atoms: [A('S', 0, -0.3), A('O', -0.9, 0.22), A('O', 0.9, 0.22)],
    bonds: [
      [0, 1, 2],
      [0, 2, 2],
    ],
  },
  NO2: {
    atoms: [A('N', 0, -0.3), A('O', -0.87, 0.22), A('O', 0.87, 0.22)],
    bonds: [
      [0, 1, 2],
      [0, 2, 1],
    ],
  },
  H2O2: {
    atoms: [A('H', -1.2, -0.55), A('O', -0.5, 0.05), A('O', 0.5, -0.05), A('H', 1.2, 0.55)],
    bonds: [
      [0, 1, 1],
      [1, 2, 1],
      [2, 3, 1],
    ],
  },
  NaCl: { atoms: [A('Na', -0.52, 0), A('Cl', 0.48, 0)], bonds: [], ionic: true },
  MgO: { atoms: [A('Mg', -0.47, 0), A('O', 0.4, 0)], bonds: [], ionic: true },
  // Two chains of carbon: ethane and propane, zigzag, hydrogens above and below.
  C2H6: {
    atoms: [
      A('C', -0.5, 0),
      A('C', 0.5, 0),
      A('H', -1.1, -0.75),
      A('H', -1.3, 0.45),
      A('H', -0.5, 0.95, 1),
      A('H', 1.1, 0.75),
      A('H', 1.3, -0.45),
      A('H', 0.5, -0.95, 1),
    ],
    bonds: [
      [0, 1, 1],
      [0, 2, 1],
      [0, 3, 1],
      [0, 4, 1],
      [1, 5, 1],
      [1, 6, 1],
      [1, 7, 1],
    ],
  },
  CH3OH: {
    atoms: [
      A('C', -0.45, 0),
      A('O', 0.55, 0),
      A('H', 1.1, -0.6),
      A('H', -0.95, -0.85),
      A('H', -1.3, 0.35),
      A('H', -0.3, 0.95, 1),
    ],
    bonds: [
      [0, 1, 1],
      [1, 2, 1],
      [0, 3, 1],
      [0, 4, 1],
      [0, 5, 1],
    ],
  },
};
// The same molecules under other ways of writing them.
LAYOUTS.CH4O = LAYOUTS.CH3OH!;
LAYOUTS.ClNa = LAYOUTS.NaCl!;

/** Layouts are looked up by the formula's atoms, so "OH2" still finds water. */
const keyOf = (formula: string) =>
  parseFormula(formula)
    .map(({ el, n }) => `${el}${n > 1 ? n : ''}`)
    .join('');

/**
 * A ball-and-stick layout for any formula: a hand-made one when there is one; one atom alone
 * (an element such as iron); otherwise the atoms packed around the first non-hydrogen one,
 * each bonded to its nearest neighbor inward, so the particle has the right atoms in it.
 */
export function moleculeOf(formula: string): Molecule {
  const known = LAYOUTS[keyOf(formula)] ?? LAYOUTS[formula] ?? EXTRA_LAYOUTS[keyOf(formula)];
  if (known) return known;
  const atoms = parseFormula(formula).flatMap(({ el, n }) => Array<string>(n).fill(el));
  if (atoms.length === 0) return { atoms: [], bonds: [] };
  if (atoms.length === 1) return { atoms: [A(atoms[0]!, 0, 0)], bonds: [] };
  // Heavy atoms at the middle, hydrogens on the outside.
  const order = [...atoms].sort((a, b) => (a === 'H' ? 1 : 0) - (b === 'H' ? 1 : 0));
  const spots = hexSpots(order.length);
  const placed = order.map((el, i) => A(el, spots[i]![0], spots[i]![1]));
  const bonds: [number, number, number][] = [];
  for (let i = 1; i < placed.length; i++) {
    let best = 0;
    let bestD = Infinity;
    for (let j = 0; j < i; j++) {
      const d = Math.hypot(placed[i]!.x - placed[j]!.x, placed[i]!.y - placed[j]!.y);
      if (d < bestD - 1e-9) {
        bestD = d;
        best = j;
      }
    }
    bonds.push([best, i, 1]);
  }
  return { atoms: placed, bonds };
}

/** The first n spots of a hexagonal packing, spiralling out from the middle (spacing 1). */
function hexSpots(n: number): [number, number][] {
  const out: [number, number][] = [[0, 0]];
  const dirs: [number, number][] = [0, 1, 2, 3, 4, 5].map((k) => [
    Math.cos((Math.PI / 3) * k),
    Math.sin((Math.PI / 3) * k),
  ]);
  for (let ring = 1; out.length < n; ring++) {
    let [x, y] = [dirs[4]![0] * ring, dirs[4]![1] * ring];
    for (let side = 0; side < 6 && out.length < n; side++) {
      for (let step = 0; step < ring && out.length < n; step++) {
        out.push([x, y]);
        x += dirs[side]![0];
        y += dirs[side]![1];
      }
    }
  }
  return out.slice(0, n);
}

/** A molecule turned `deg` degrees in the picture's plane (the balls stay lit from the top left). */
export function turned(m: Molecule, deg: number): Molecule {
  if (deg % 360 === 0) return m;
  const [cos, sin] = [Math.cos((deg * Math.PI) / 180), Math.sin((deg * Math.PI) / 180)];
  return {
    ...m,
    atoms: m.atoms.map((a) => ({ ...a, x: a.x * cos - a.y * sin, y: a.x * sin + a.y * cos })),
  };
}

/** The box a molecule's balls fill, in bond lengths: [minX, minY, maxX, maxY]. */
export function extentOf(m: Molecule): [number, number, number, number] {
  if (m.atoms.length === 0) return [0, 0, 0, 0];
  const xs = m.atoms.flatMap((a) => [a.x - atomRadius(a.el), a.x + atomRadius(a.el)]);
  const ys = m.atoms.flatMap((a) => [a.y - atomRadius(a.el), a.y + atomRadius(a.el)]);
  return [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)];
}

// ─── Heating curve ───────────────────────────────────────────────────────────

/**
 * A heating curve's corners, [time, temperature]: warming the solid from `start` to `melt`,
 * melting (flat), warming the liquid to `boil`, boiling (flat), then warming the gas to `end`
 * when there is a fifth span.
 */
export function heatingCorners(
  start: number,
  melt: number,
  boil: number,
  spans: number[],
  end?: number,
): [number, number][] {
  const temps = [start, melt, melt, boil, boil, end ?? boil];
  const pts: [number, number][] = [[0, start]];
  let t = 0;
  spans.slice(0, end === undefined ? 4 : 5).forEach((s, i) => {
    t += s;
    pts.push([t, temps[i + 1]!]);
  });
  return pts;
}

/** The temperature on the curve at time t (the last corner's past the end). */
export function heatingTemp(corners: [number, number][], t: number): number {
  for (let i = 1; i < corners.length; i++) {
    const [t0, y0] = corners[i - 1]!;
    const [t1, y1] = corners[i]!;
    if (t <= t1 + 1e-9) return t1 === t0 ? y1 : y0 + ((y1 - y0) * (t - t0)) / (t1 - t0);
  }
  return corners[corners.length - 1]![1];
}

/** Which part of the curve time t is in: 0 solid, 1 melting, 2 liquid, 3 boiling, 4 gas. */
export function heatingPart(corners: [number, number][], t: number): number {
  for (let i = 1; i < corners.length; i++) if (t < corners[i]![0] - 1e-9) return i - 1;
  return corners.length - 2;
}

/**
 * Picture specs for Grade 7–8 chemistry (atoms and molecules, phase changes, reactions, the
 * periodic table), kept apart from `types.ts` so that file's union only lists them. A
 * `NumOrVar` field is a fixed number or a variable id. Formulas are written plainly ("H2O",
 * "CO2", "Fe"); the pictures print them with subscripts.
 */
import type { NumOrVar } from './typesGraphs';

/**
 * Ball-and-stick molecules of one substance (atoms in the classroom colors: hydrogen white,
 * carbon black, oxygen red, nitrogen blue), `count` of them, and a tally of the atoms of each
 * element (2 × 3 = 6 hydrogen atoms). An element's formula ("Fe", "O2") draws its atoms as
 * balls of one color.
 */
export interface MoleculesSpec {
  kind: 'molecules';
  formula: string;
  /** How many molecules (whole, up to 24 drawn). */
  count: NumOrVar;
  /** Variables holding the total atoms of an element, by symbol: { H: 'h', O: 'o' }. */
  atoms?: Record<string, string>;
  /** The substance's name for the caption ("water"). */
  name?: string;
}

/** One substance in a reaction: its formula and how many particles (the coefficient). */
export interface ReactionTerm {
  formula: string;
  count: NumOrVar;
}

/**
 * A reaction as particles before and after the arrow (2 H₂ + O₂ → 2 H₂O): every molecule
 * drawn, then a row per element with its atoms counted on each side as counters, = when they
 * match (the atoms are rearranged, none lost), ≠ when not. Coefficients up to 8 each.
 */
export interface ReactionSpec {
  kind: 'reaction';
  /** One to three substances on each side. */
  reactants: ReactionTerm[];
  products: ReactionTerm[];
  /** Variables holding the atoms of an element on each side: { O: ['o1', 'o2'] }. */
  atoms?: Record<string, [string, string]>;
}

/**
 * A heating curve: temperature against time as a substance is heated at a steady rate,
 * rising while it warms and flat while it melts and boils. `spans` are the times for
 * warming the solid, melting, warming the liquid, boiling (and warming the gas, with `end`).
 * With `at`, a point on the curve at that time (drag it along the curve) and a box of the
 * particles as they are then.
 */
export interface HeatingCurveSpec {
  kind: 'heatingCurve';
  /** Temperatures: at the start, the melting point, the boiling point (and at the end). */
  start: NumOrVar;
  melt: NumOrVar;
  boil: NumOrVar;
  end?: NumOrVar;
  spans: NumOrVar[];
  /** A time: the point on the curve (dragged along it) and the particles then. */
  at?: string;
  /** The temperature at `at`, when the module has it as a value. */
  temp?: string;
  /** The three states' names (default solid, liquid, gas: 'ice', 'water', 'steam'). */
  names?: [string, string, string];
  /** Units of fixed numbers (default minutes and °C; a variable's own unit wins). */
  units?: { time?: string; temp?: string };
  /** The substance, drawn as its molecules in the particle box ("H2O"); plain balls if left out. */
  formula?: string;
}

/**
 * The periodic table as a grid of symbols, with one element, a group (column) or a period
 * (row) lit; the element's card (number, symbol, name, mass) in the gap over the middle.
 * Tap an element to choose it when `element` is a variable; `families` colors metals,
 * metalloids, nonmetals and noble gases, with a key.
 */
export interface PeriodicTableSpec {
  kind: 'periodicTable';
  /** Atomic number. */
  element?: NumOrVar;
  group?: NumOrVar;
  period?: NumOrVar;
  families?: boolean;
}

export type ChemSpec = MoleculesSpec | ReactionSpec | HeatingCurveSpec | PeriodicTableSpec;

/** Every variable id a chemistry spec refers to (for the module tests). */
export function chemSpecVars(r: ChemSpec): string[] {
  const ids = (...xs: (NumOrVar | undefined)[]) =>
    xs.filter((x): x is string => typeof x === 'string');
  switch (r.kind) {
    case 'molecules':
      return ids(r.count, ...Object.values(r.atoms ?? {}));
    case 'reaction':
      return ids(
        ...[...r.reactants, ...r.products].map((t) => t.count),
        ...Object.values(r.atoms ?? {}).flat(),
      );
    case 'heatingCurve':
      return ids(r.start, r.melt, r.boil, r.end, ...r.spans, r.at, r.temp);
    case 'periodicTable':
      return ids(r.element, r.group, r.period);
  }
}

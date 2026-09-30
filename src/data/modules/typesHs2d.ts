/**
 * Picture options and specs for Grades 9–12 round 2, group H2D (H101: chemistry; see
 * pictureRequestsHs.ts and docs/plans/s.10.md, "Engine and picture needs"). Kept apart from
 * `types.ts` and the round 1 files so their unions only name them. A `NumOrVar` field is a fixed
 * number or a variable id.
 */
import { formulaVars } from '@/components/module/reps/chemHs2d';

import type { NumOrVar } from './typesGraphs';

const ids = (...xs: (NumOrVar | undefined)[]) =>
  xs.filter((x): x is string => typeof x === 'string');

// ─── Part 1: reaction formulas from values ───────────────────────────────────

/**
 * Round 2 options on a `reaction` term (H101 part 1). A term's `formula` may name variables in
 * braces, "C{x}H{y}": the subscripts are the page's values, the molecule is drawn from them (a
 * carbon chain for a hydrocarbon) and the atoms are tallied from them; while a value is "?" the
 * term draws faded and reads CₓHᵧ. `molar` is a variable holding the term's molar mass, printed
 * under its label and checked against the formula.
 */
export interface ReactionTermHs2d {
  molar?: string;
}

/**
 * Round 2 options on `reaction` (H101 part 1), all off unless a page sets them. `most` raises the
 * molecules a term draws (default 8, up to 32): the columns grow taller so the equation still
 * fits a phone. `ions` draws an ionic compound (a metal with nonmetals: ZnCl₂, Al₂O₃) as a
 * cluster of ions with no sticks, a formula unit rather than a molecule.
 */
export interface ReactionHs2d {
  most?: number;
  ions?: boolean;
}

/** The variables a reaction's round 2 options name: formula subscripts and molar masses. */
export function reactionHs2dVars(r: {
  reactants: ({ formula: string } & ReactionTermHs2d)[];
  products: ({ formula: string } & ReactionTermHs2d)[];
}): string[] {
  const terms = [...r.reactants, ...r.products];
  return [...terms.flatMap((t) => formulaVars(t.formula)), ...ids(...terms.map((t) => t.molar))];
}

// ─── Part 4: the limiting reactant from grams (moleMap) ──────────────────────

/** One reactant of a `limiting` mole map: its grams → moles → the product's moles from it. */
export interface LimitingReactant {
  formula: string;
  /** Its coefficient in the balanced equation. */
  coef: NumOrVar;
  /** Grams on hand. */
  mass: NumOrVar;
  /** Its molar mass (default: from the formula). */
  molarMass?: NumOrVar;
  /** Moles on hand, mass ÷ molar mass (checked). */
  moles?: NumOrVar;
  /** Moles of product it could make, moles × product coefficient ÷ its coefficient (checked). */
  yields?: NumOrVar;
}

/**
 * `limiting` on `moleMap` (H101 part 4): two reactants side by side, each one's grams → moles
 * → the product's moles it could make; the smaller amount is lit (that reactant runs out, the
 * limiting reactant) and carried down to the product's mass. The map's own `moles`, `mass`,
 * `molarMass` and `formula` are the product's: `moles` is the smaller yield (checked), `mass`
 * its grams. `coef` is the product's coefficient.
 */
export interface MoleMapLimiting {
  reactants: [LimitingReactant, LimitingReactant];
  coef: NumOrVar;
}

/** The variables a mole map's `limiting` names. */
export function moleMapHs2dVars(r: { limiting?: MoleMapLimiting }): string[] {
  const l = r.limiting;
  if (!l) return [];
  return ids(
    l.coef,
    ...l.reactants.flatMap((t) => [t.coef, t.mass, t.molarMass, t.moles, t.yields]),
  );
}

// ─── Part 5: an enthalpy ladder (energyProfile mode 'ladder') ────────────────

/** A level on an enthalpy ladder: what is there ("CO + ½O₂") and its enthalpy, when given. */
export interface LadderLevel {
  name: string;
  /** Its enthalpy (kJ); left out, it follows from a step to or from a level that has one. */
  value?: NumOrVar;
}

/** An arrow from one level to another (indices into `levels`); its ΔH is `to` − `from`. */
export interface LadderStep {
  from: number;
  to: number;
  /** The step's ΔH (checked as the levels' difference). */
  value?: NumOrVar;
  /** Its name ("ΔH₁"); the default is ΔH with the step's number. */
  label?: string;
  /**
   * A step used backwards (Hess's law): the equation as given is drawn as a faded dashed arrow
   * the other way, with the opposite sign, beside the reversed one.
   */
  flipped?: boolean;
}

/**
 * An enthalpy ladder (H101 part 5): levels only, no hump, on an energy axis to scale. Each level
 * is a line with its name; `steps` are arrows between levels (down for heat given off, up for
 * heat taken in), each with its ΔH; `total` is the overall change, lit, beside them: ΔH = ΔH₁ +
 * ΔH₂ (Hess's law), or products − reactants with both measured from the elements at 0
 * (formation enthalpies). A level's value is given or follows from the steps.
 */
export interface EnergyLadderSpec {
  kind: 'energyProfile';
  mode: 'ladder';
  levels: LadderLevel[];
  steps: LadderStep[];
  total?: LadderStep;
  /** The unit (default kJ). */
  unit?: string;
}

/** The variables an enthalpy ladder names. */
export function ladderVars(r: EnergyLadderSpec): string[] {
  return ids(...r.levels.map((l) => l.value), ...r.steps.map((s) => s.value), r.total?.value);
}

/**
 * Every level's enthalpy, from the values given and the steps between them (a level with none
 * is its neighbor's plus or minus the step); undefined where nothing reaches it. `val` reads a
 * fixed number or a known variable.
 */
export function ladderLevels(
  r: EnergyLadderSpec,
  val: (x: NumOrVar) => number | undefined,
): (number | undefined)[] {
  const out = r.levels.map((l) => (l.value === undefined ? undefined : val(l.value)));
  const steps = [...r.steps, ...(r.total ? [r.total] : [])];
  for (let pass = 0; pass < r.levels.length; pass++)
    for (const s of steps) {
      const d = s.value === undefined ? undefined : val(s.value);
      if (d === undefined) continue;
      if (out[s.to] === undefined && out[s.from] !== undefined) out[s.to] = out[s.from]! + d;
      if (out[s.from] === undefined && out[s.to] !== undefined) out[s.from] = out[s.to]! - d;
    }
  return out;
}

// ─── Parts 6, 7, 8, 14: the chemDiagram kind ─────────────────────────────────

/** A gas in an effusion box: its formula (drawn as its molecules) and molar mass (g/mol). */
export interface EffusionGas {
  formula: string;
  molarMass: NumOrVar;
}

/** An atom of the formula's element with its oxidation number (a variable or a number). */
export type OxidationNumbers = Record<string, NumOrVar>;

/** A nucleus or particle on one side of a mass-defect picture: its name and mass (u). */
export interface MassPart {
  name: string;
  mass: NumOrVar;
}

/**
 * Chemistry pictures of Grades 9–12 round 2 (H101), by `mode`:
 *
 * - `effusion` (part 6): two gases mixed in one box with a pinhole in its wall. Each molecule
 *   trails a line as long as its speed, ∝ √(1/M) at one temperature, and the molecules that
 *   have escaped through the pinhole are in the same ratio. `ratio` (rate of the first ÷ rate
 *   of the second, √(M₂ ÷ M₁), Graham's law) is checked; bars compare the two rates.
 * - `isotopes` (part 7): 100 atoms of an element, `percents[0]` of them the first isotope (the
 *   rest the second; `percents[1]`, when given, is checked as 100 − the first), and a beam from
 *   `masses[0]` to `masses[1]` (u) with each isotope's share as a weight at its mass, balanced on
 *   a pivot at the average atomic mass (`average`, checked as m₁f₁ + m₂f₂). `names` label the
 *   isotopes (default: the symbol with the mass number, "¹⁰B").
 * - `oxidation` (part 8): every atom of `formula` in a row with its oxidation number on it
 *   (`numbers`, by element), each element's atoms added (4 × −2 = −8) and the sum equal to the
 *   `charge` (default 0), checked.
 * - `massDefect` (part 14): the mass `before` and `after` a nuclear change as two bars on a
 *   broken axis, so a few thousandths of a unit show on top of hundreds; the gap is the mass
 *   defect (`defect`, checked as before − after) and `energy` (MeV, checked as Δm × 931.5).
 */
export type ChemDiagramSpec =
  | {
      kind: 'chemDiagram';
      mode: 'effusion';
      gases: [EffusionGas, EffusionGas];
      ratio?: NumOrVar;
    }
  | {
      kind: 'chemDiagram';
      mode: 'isotopes';
      element: string;
      masses: [NumOrVar, NumOrVar];
      percents: [NumOrVar] | [NumOrVar, NumOrVar];
      average?: NumOrVar;
      names?: [string, string];
    }
  | {
      kind: 'chemDiagram';
      mode: 'oxidation';
      formula: string;
      numbers: OxidationNumbers;
      charge?: NumOrVar;
    }
  | {
      kind: 'chemDiagram';
      mode: 'massDefect';
      before: MassPart[];
      after: MassPart[];
      defect?: NumOrVar;
      energy?: NumOrVar;
    };

/** The variables a chemDiagram names (for the module tests). */
export function chemDiagramVars(r: ChemDiagramSpec): string[] {
  switch (r.mode) {
    case 'effusion':
      return ids(...r.gases.map((g) => g.molarMass), r.ratio);
    case 'isotopes':
      return ids(...r.masses, ...r.percents, r.average);
    case 'oxidation':
      return ids(...Object.values(r.numbers), r.charge);
    case 'massDefect':
      return ids(...[...r.before, ...r.after].map((p) => p.mass), r.defect, r.energy);
  }
}

/** MeV per atomic mass unit (E = mc²). */
export const MEV_PER_U = 931.5;

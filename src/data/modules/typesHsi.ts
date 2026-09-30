/**
 * Picture specs for Grades 9–12, group I (see docs/RENDERINGS_HS.md, H43–H50): chemistry
 * measurement, atoms, electrons, bonding, molecular shape and the mole. Kept apart from
 * `types.ts` so that file's union only lists them. A `NumOrVar` field is a fixed number or a
 * variable id. Formulas are written plainly ("H2O", "NH4+"); the pictures print subscripts.
 */
import type { NumOrVar } from './typesGraphs';
import { ionicChargeVars, type IonicCharges } from './typesHs3e';
import { moleMapHs2dVars, type MoleMapLimiting } from './typesHs2d';

/** One conversion factor in a chain: `top` `topUnit` over `bottom` `bottomUnit` (1000 m / 1 km). */
export interface ChainFactor {
  top: NumOrVar;
  topUnit: string;
  bottom: NumOrVar;
  bottomUnit: string;
}

/**
 * Measurement pictures for chemistry (H43), by `mode`:
 *
 * - `chain`: dimensional analysis. The given quantity (`start` `unit`, or a rate `unit`/`per`)
 *   times each conversion factor as a stacked fraction, equals the `result`. Units on a top and
 *   a bottom cancel and are struck through; what is left is the answer's unit.
 * - `ruler`: a wooden ruler marked every `division` `unit`, a metal rod lying along it from `start` to
 *   `end`, and a close-up of the rod's end: the digits the marks give are certain, one more
 *   is estimated between two marks. With `start`, the rod starts past 0 and its `length` is
 *   end − start.
 * - `target`: accuracy and precision. Each trial is a dot on a target whose center is the
 *   `accepted` value; a dot sits right of center when the trial is high, left when low, each
 *   ring `ring` percent (default 1%). `mean` and `error` (percent error) are checked.
 */
export type UnitChainSpec =
  | {
      kind: 'unitChain';
      mode: 'chain';
      start: NumOrVar;
      unit: string;
      /** A rate's bottom unit (65 mi/h: unit 'mi', per 'h'). */
      per?: string;
      /** One to four factors, in the order they are multiplied. */
      factors: ChainFactor[];
      result: string;
    }
  | {
      kind: 'unitChain';
      mode: 'ruler';
      /** Where the rod starts (default 0) and ends, each read to one digit past the marks. */
      start?: NumOrVar;
      end: string;
      /** The rod's length, end − start (checked). */
      length?: string;
      /** The smallest marked division (1, 0.1 …) in `unit`. */
      division: number;
      unit: string;
      /** The ruler's length in `unit` (default: the next whole unit past the end, at least 5). */
      span?: number;
    }
  | {
      kind: 'unitChain';
      mode: 'target';
      /** Two to six trials. */
      trials: NumOrVar[];
      accepted: NumOrVar;
      unit?: string;
      mean?: string;
      error?: string;
      /** Percent of the accepted value between rings (default 1). */
      ring?: number;
    };

/**
 * A Bohr model (H44): `protons` and `neutrons` packed in the nucleus, every one drawn, and the
 * `electrons` (default: as many as protons) on shells filled from the ground-state
 * configuration (iron: 2, 8, 14, 2); the nuclide symbol ³⁵₁₇Cl⁻ beside it. Through xenon
 * (54 protons and electrons). `mass` (p + n), `charge` (p − e) and `valence` (the outer shell's
 * electrons, lit) are checked.
 */
export interface AtomModelSpec {
  kind: 'atomModel';
  protons: NumOrVar;
  neutrons?: NumOrVar;
  electrons?: NumOrVar;
  mass?: string;
  charge?: string;
  valence?: string;
}

/**
 * Electrons in atoms (H45), by `mode`:
 *
 * - `boxes`: orbital boxes at their energies (4s below 3d), filled in Aufbau order with up and
 *   down arrows (Hund's rule, then pairs), the configuration written above and in noble-gas
 *   shorthand below. `element` is the atomic number (named; neutral exceptions such as
 *   chromium and copper drawn as they are); `electrons` defaults to it (fewer for a positive
 *   ion, more for a negative one). Through 54 electrons. `unpaired` is checked.
 * - `ladder`: hydrogen's levels n = 1 to `levels` (default 6) to scale, Eₙ = −13.6/n² eV; the
 *   electron's drop from `upper` to `lower` and the photon given off, placed on the visible
 *   spectrum (or pointed off it: ultraviolet, infrared). `energy` (eV) and `wavelength`
 *   (nm, 1240 ÷ E) are checked.
 */
export type OrbitalDiagramSpec =
  | {
      kind: 'orbitalDiagram';
      mode: 'boxes';
      element?: NumOrVar;
      electrons?: NumOrVar;
      unpaired?: string;
    }
  | {
      kind: 'orbitalDiagram';
      mode: 'ladder';
      upper: NumOrVar;
      lower: NumOrVar;
      energy?: string;
      wavelength?: string;
      levels?: number;
    };

/**
 * `limiting` on `reaction` (H49): the particles each reactant starts with (`amounts`, in the
 * reactants' order, up to 12 each), the reaction run as many whole times as the scarcest
 * reactant allows, the products made and the leftover reactant lit (the other one is the
 * limiting reactant). `runs`, `made` (per product) and `left` (per reactant) are checked. The
 * coefficients must balance the equation.
 */
export interface ReactionLimiting {
  amounts: NumOrVar[];
  runs?: string;
  made?: string[];
  left?: string[];
}

/** A periodic trend (H46). */
export type TrendProperty = 'radius' | 'ionization' | 'electronegativity';

/**
 * `trend` on `periodicTable` (H46): every element shaded by its atomic radius (covalent, pm),
 * first ionization energy (kJ/mol) or electronegativity (Pauling), darker for more, with a key,
 * and arrows saying how the property changes across a period and down a group. The table's
 * `element` is lit with its value on the card (`value`, checked); `compare` rings a second
 * element (`compareValue`, checked).
 */
export interface PeriodicTrend {
  property: TrendProperty;
  value?: string;
  compare?: NumOrVar;
  compareValue?: string;
}

/**
 * Bonding (H47), by `mode`:
 *
 * - `molecule`: a Lewis structure, shared pairs as lines (or `dots`) and lone pairs as dots, an
 *   ion in brackets with its charge. The structure is looked up from the `atoms` counts
 *   ({ H: 'h', O: 'o' }) and `charge`, or fixed by `formula` ("H2O", "NH4+"); drawn: H₂, H₂O,
 *   CO₂, NH₃, CH₄, O₂, N₂, F₂, Cl₂, HF, HCl, CH₂O, HCN, NH₄⁺, H₃O⁺, OH⁻, CN⁻ (anything else is
 *   named in the caption). `valence`, `bonding` (shared pairs) and `lone` (lone pairs) are checked.
 * - `ionic`: `metal` atoms giving their valence electrons to `nonmetal` atoms (arrows), then
 *   the ions in brackets; `metals` and `nonmetals` (ion counts, whose charges must balance) and
 *   `transferred` are checked. Metals of groups 1, 2 and Al; nonmetals F, Cl, Br, I, O, S, N, P.
 * - `metallic`: `atoms` metal ions (up to 24) in a sea of every electron they gave up;
 *   `electrons` is checked.
 * - `hydrocarbon`: a straight chain of `carbons` (1–8) with its hydrogens, all single bonds or
 *   one double or triple bond between the first two carbons; `hydrogens` is checked.
 */
export type LewisStructureSpec = { kind: 'lewisStructure' } & (
  | {
      mode: 'molecule';
      atoms?: Record<string, NumOrVar>;
      charge?: NumOrVar;
      formula?: string;
      valence?: string;
      bonding?: string;
      lone?: string;
      dots?: boolean;
    }
  | {
      mode: 'ionic';
      metal: string;
      nonmetal: string;
      metals?: NumOrVar;
      nonmetals?: NumOrVar;
      transferred?: string;
      /** Round 3: the elements from the ions' charges (`typesHs3e.ts`, H108 part 2). */
      charges?: IonicCharges;
    }
  | { mode: 'metallic'; element: string; atoms: NumOrVar; electrons?: string }
  | {
      mode: 'hydrocarbon';
      carbons: NumOrVar;
      bond?: 'single' | 'double' | 'triple';
      hydrogens?: string;
      /** Round 2: methyl branches on an alkane (`typesHs2d.ts`, H101 part 9b). */
      branches?: number[];
    }
);

/**
 * Molecular shape (H48). `shape` (the default): a ball-and-stick molecule from the `bonded`
 * atoms (2–4) and `lone` pairs (0–2) on the central atom, 2 to 4 domains in all: linear,
 * trigonal planar, bent, tetrahedral or trigonal pyramidal, drawn as an example molecule (CO₂,
 * BF₃, SO₂, CH₄, NH₃, H₂O) with its lone pairs as lobes and the bond angle marked; `angle` is
 * checked; `polar` adds the bond dipoles and the net dipole. `hbonds`: `molecules` water
 * molecules (2–5) around one in the middle, joined by dotted hydrogen bonds (`bonds`, checked:
 * one fewer than the molecules).
 */
export type VseprSpec =
  | {
      kind: 'vsepr';
      mode?: 'shape';
      bonded: NumOrVar;
      lone: NumOrVar;
      angle?: string;
      polar?: boolean;
    }
  | { kind: 'vsepr'; mode: 'hbonds'; molecules: NumOrVar; bonds?: string };

/**
 * The mole map (H50): the `moles` of a substance in the middle, joined to its `mass` (× the
 * molar mass, `molarMass`, or worked out from `formula`), its `particles` (× 6.022 × 10²³) and
 * the `volume` of a gas at STP (× 22.4 L). Each arrow carries its factor; the value the student
 * typed is filled, the ones worked from it outlined, and the arrows between known values lit.
 * `second` adds a second substance of a balanced reaction: its moles by the mole ratio
 * (`ratio`: [coefficient of the first, of the second]) and its mass. Every value is checked.
 */
export interface MoleMapSpec {
  kind: 'moleMap';
  moles: NumOrVar;
  mass?: NumOrVar;
  molarMass?: NumOrVar;
  particles?: NumOrVar;
  volume?: NumOrVar;
  formula?: string;
  second?: {
    formula?: string;
    ratio: [NumOrVar, NumOrVar];
    moles: NumOrVar;
    mass?: NumOrVar;
    molarMass?: NumOrVar;
  };
  /** Round 2: two reactants from grams, the limiting one lit (`typesHs2d.ts`, H101). */
  limiting?: MoleMapLimiting;
}

export type HsiSpec =
  UnitChainSpec | AtomModelSpec | OrbitalDiagramSpec | LewisStructureSpec | VseprSpec | MoleMapSpec;

/** Every variable id a group I spec refers to (for the module tests). */
export function hsiSpecVars(r: HsiSpec): string[] {
  const ids = (...xs: (NumOrVar | undefined)[]) =>
    xs.filter((x): x is string => typeof x === 'string');
  switch (r.kind) {
    case 'unitChain':
      if (r.mode === 'chain')
        return ids(r.start, r.result, ...r.factors.flatMap((f) => [f.top, f.bottom]));
      if (r.mode === 'ruler') return ids(r.start, r.end, r.length);
      return ids(...r.trials, r.accepted, r.mean, r.error);
    case 'atomModel':
      return ids(r.protons, r.neutrons, r.electrons, r.mass, r.charge, r.valence);
    case 'orbitalDiagram':
      return r.mode === 'boxes'
        ? ids(r.element, r.electrons, r.unpaired)
        : ids(r.upper, r.lower, r.energy, r.wavelength);
    case 'moleMap':
      return ids(
        r.moles,
        r.mass,
        r.molarMass,
        r.particles,
        r.volume,
        ...(r.second ? [...r.second.ratio, r.second.moles, r.second.mass, r.second.molarMass] : []),
        ...moleMapHs2dVars(r),
      );
    case 'vsepr':
      return r.mode === 'hbonds' ? ids(r.molecules, r.bonds) : ids(r.bonded, r.lone, r.angle);
    case 'lewisStructure':
      switch (r.mode) {
        case 'molecule':
          return ids(...Object.values(r.atoms ?? {}), r.charge, r.valence, r.bonding, r.lone);
        case 'ionic':
          return ids(r.metals, r.nonmetals, r.transferred, ...ionicChargeVars(r.charges));
        case 'metallic':
          return ids(r.atoms, r.electrons);
        default:
          return ids(r.carbons, r.hydrogens);
      }
  }
}

/**
 * Picture specs for Grades 9–12, group J (see docs/RENDERINGS_HS.md, H51–H57): chemistry's gas
 * piston, solutions in a beaker, reaction energy and the calorimeter, equilibrium, the pH scale
 * and titration, and radioactive decay. Kept apart from `types.ts` so that file's union only
 * lists them. A `NumOrVar` field is a fixed number or a variable id.
 */
import type { NumOrVar } from './typesGraphs';
import { ladderVars, type EnergyLadderSpec } from './typesHs2d';

// ─── H51 gasPiston ───────────────────────────────────────────────────────────

/** A gas's state: pressure, volume and temperature (kelvins), each a number or a variable. */
export interface GasState {
  pressure?: NumOrVar;
  volume?: NumOrVar;
  temperature?: NumOrVar;
}

/**
 * A glass cylinder closed by a metal piston: the gas under it as particles (their count from
 * the moles, their speed trails ∝ √T), a pressure gauge on a pipe, a volume scale up the glass
 * and a thermometer in kelvins.
 *
 * - `law` names what the page holds still: 'boyle' (T and n: P₁V₁ = P₂V₂), 'charles' (P and n:
 *   V₁/T₁ = V₂/T₂), 'gayLussac' (V and n: the piston pinned, P₁/T₁ = P₂/T₂), 'combined' (n:
 *   P₁V₁/T₁ = P₂V₂/T₂) or 'ideal' (one state: PV = nRT).
 * - A two-state law draws `before` beside the gas now; a value the law holds still can be left
 *   out of both (it is drawn the same in both and named "held").
 * - `moles` (ideal) sets the particle count: one particle per 0.1, 0.2, 0.5, 1 … mol, the key
 *   under the picture. Two-state pages draw the same 20 particles in both cylinders.
 * - `R` is the gas constant in the page's units (0.0821 L·atm/(mol·K) by default), checked.
 * - Drag the piston of the gas now to change its volume: the law's other value moves
 *   (pressure; temperature under Charles's law), `keep` pins typed values, `fixed` has no handle.
 */
export interface GasPistonSpec extends GasState {
  kind: 'gasPiston';
  law: 'boyle' | 'charles' | 'gayLussac' | 'combined' | 'ideal';
  before?: GasState;
  moles?: NumOrVar;
  R?: number;
  keep?: string[];
  fixed?: boolean;
  /**
   * H102: the first law instead of a gas law (pass `law: 'ideal'` and no state): heat `heat` Q
   * in (+) or out (−) and work `work` W by the gas (+) or on it (−) as bands, and
   * ΔU = Q − W (`change`) in a waterfall beside the cylinder.
   */
  energy?: { heat: NumOrVar; work: NumOrVar; change?: string };
}

// ─── H52 beaker: solutions ───────────────────────────────────────────────────

/** Salts with a solubility curve (g per 100 g of water, 0–100 °C; `solubility.ts`). */
export type SaltName = 'KNO3' | 'NaNO3' | 'NaCl' | 'KCl' | 'NH4Cl' | 'KClO3';

/**
 * A solution in a beaker (`beaker` with `solution`, H52):
 *
 * - 'molarity': a beaker filled to `volume` (L or mL) with `moles` of solute, drawn as dots
 *   spread through the liquid (one dot per 0.01, 0.02, 0.05 … mol, the key in the caption) and
 *   tinted by the concentration; `molarity` (mol/L) is checked against n ÷ V.
 * - 'dilution': the stock (`stock`: molarity and volume) beside the diluted solution (`diluted`),
 *   an arrow between them with the water added (`water`, checked as V₂ − V₁); the same dots in
 *   both, so M₁V₁ = M₂V₂ is the moles of solute, unchanged.
 * - 'solubility': the salt's solubility curve (grams per 100 g of water against °C), `others`
 *   drawn faint for comparison, and the point (`temperature`, `amount`): under the curve it is
 *   unsaturated, on it saturated, over it the extra settles out. `solubility` names the
 *   curve's value at the temperature (checked).
 *
 * `solute` names the solute in the caption and the key ("NaCl").
 */
export type BeakerSolution =
  | {
      mode: 'molarity';
      moles: NumOrVar;
      volume: NumOrVar;
      molarity?: NumOrVar;
      solute?: string;
    }
  | {
      mode: 'dilution';
      stock: { molarity: NumOrVar; volume: NumOrVar };
      diluted: { molarity: NumOrVar; volume: NumOrVar };
      water?: NumOrVar;
      solute?: string;
    }
  | {
      mode: 'solubility';
      salt: SaltName;
      temperature: NumOrVar;
      amount?: NumOrVar;
      solubility?: NumOrVar;
      others?: SaltName[];
    };

/** Every variable id a beaker solution refers to (for the module tests). */
export function solutionVars(s: BeakerSolution): string[] {
  const ids = (...xs: (NumOrVar | undefined)[]) =>
    xs.filter((x): x is string => typeof x === 'string');
  switch (s.mode) {
    case 'molarity':
      return ids(s.moles, s.volume, s.molarity);
    case 'dilution':
      return ids(s.stock.molarity, s.stock.volume, s.diluted.molarity, s.diluted.volume, s.water);
    case 'solubility':
      return ids(s.temperature, s.amount, s.solubility);
  }
}

// ─── H53 energyProfile ───────────────────────────────────────────────────────

/**
 * A reaction's energy (H53).
 *
 * - The profile (no `mode`): energy against reaction progress. The reactants' level, a hump
 *   `activation` above it and the products' level; `deltaH` (checked as products − reactants)
 *   is an arrow between the levels, `activation` an arrow up to the peak and `reverse`
 *   (checked as Eₐ − ΔH) one from the products up to it. `catalyst` is the activation energy
 *   with a catalyst: a lower hump, dashed, between the same two levels. `names` label the
 *   levels ("N₂ + 3H₂"). A peak under either level can't happen: drawn faded with the reason.
 *   Drag the peak to change `activation`; `keep` pins typed values, `fixed` has no handle.
 * - 'calorimeter': a foam-cup calorimeter, water of `mass` g with specific heat `heat`
 *   (J/(g·°C)) going from `start` to `end` °C on the thermometer; `change` (ΔT) and `q` (J)
 *   are checked against q = mcΔT. `metal` drops a hot block in (its name, mass and starting
 *   temperature; `heat` its specific heat, checked against the heat the water took in).
 */
export type EnergyProfileSpec =
  | {
      kind: 'energyProfile';
      mode?: 'profile';
      reactants: NumOrVar;
      products: NumOrVar;
      activation: NumOrVar;
      deltaH?: NumOrVar;
      reverse?: NumOrVar;
      catalyst?: NumOrVar;
      names?: { reactants?: string; products?: string };
      keep?: string[];
      fixed?: boolean;
    }
  | {
      kind: 'energyProfile';
      mode: 'calorimeter';
      mass: NumOrVar;
      heat: NumOrVar;
      start: NumOrVar;
      end: NumOrVar;
      change?: NumOrVar;
      q?: NumOrVar;
      metal?: { name: string; mass: NumOrVar; start: NumOrVar; heat?: NumOrVar };
    }
  /** Round 2: an enthalpy ladder, levels only (`typesHs2d.ts`, H101). */
  | EnergyLadderSpec;

// ─── H54 equilibriumChart ────────────────────────────────────────────────────

/** One substance in an equilibrium: its formula, coefficient, side and starting concentration. */
export interface EquilibriumSpecies {
  formula: string;
  coef: number;
  side: 'reactant' | 'product';
  /** The concentration (mol/L) the chart starts from. */
  start: NumOrVar;
  /** A variable holding its concentration at the first equilibrium (checked). */
  eq?: NumOrVar;
}

/**
 * Concentrations against time (H54): each substance's line from its `start` to equilibrium,
 * where Q = K, all moving together by the reaction's extent (so the coefficients hold at every
 * moment); the lines level off. `K` is the equilibrium constant (a page that starts at
 * equilibrium can leave it out: it is read from the starting values).
 *
 * `stress` then disturbs it halfway along: `add` a substance (by its index; a negative amount
 * removes it), `scale` every concentration (2 when the volume is halved) or a new `K` (a change
 * of temperature). The lines jump, and move to the new equilibrium; `Q` names the reaction
 * quotient just after the stress (checked), and the caption says which way it shifts. `label`
 * names the stress on the chart ("Add H₂").
 */
export interface EquilibriumChartSpec {
  kind: 'equilibriumChart';
  species: EquilibriumSpecies[];
  K?: NumOrVar;
  stress?: {
    add?: { species: number; amount: NumOrVar };
    scale?: NumOrVar;
    K?: NumOrVar;
    Q?: NumOrVar;
    label: string;
  };
}

// ─── H55 phScale ─────────────────────────────────────────────────────────────

/**
 * Acids and bases (H55).
 *
 * - The scale (no `mode`): 0 to 14 in universal-indicator colors, `pH` marked (drag it), the
 *   [H⁺] under every other number as a power of ten, acidic and basic either side of 7.
 *   `hydrogen` ([H⁺]), `hydroxide` ([OH⁻]) and `pOH` name the page's values (checked against
 *   pH). `examples` marks everyday things (lemon juice, coffee, pure water, baking soda,
 *   ammonia). `keep` pins typed values while dragging; `fixed` has no handle.
 * - 'titration': a monoprotic acid (`acid`: concentration, volume, `Ka` for a weak acid, left
 *   out for a strong one) titrated with a strong base (`base`: concentration). The pH against
 *   the base added, from the exact charge balance, colored by the indicator along the pH axis;
 *   the equivalence point (`equivalence` names its volume, checked) and, for a weak acid, the
 *   half-equivalence point where pH = pKₐ. `added` is the point on the curve (drag it along).
 */
export type PhScaleSpec =
  | {
      kind: 'phScale';
      mode?: 'scale';
      pH: NumOrVar;
      hydrogen?: NumOrVar;
      hydroxide?: NumOrVar;
      pOH?: NumOrVar;
      examples?: boolean;
      keep?: string[];
      fixed?: boolean;
    }
  | {
      kind: 'phScale';
      mode: 'titration';
      acid: { concentration: NumOrVar; volume: NumOrVar; Ka?: NumOrVar; name?: string };
      base: { concentration: NumOrVar; name?: string };
      added: NumOrVar;
      equivalence?: NumOrVar;
      keep?: string[];
      fixed?: boolean;
    };

// ─── H56 electrochemicalCell (explore figure) ───────────────────────────────

/** Metals a galvanic cell's electrodes can be (each in a solution of its own ion). */
export type CellMetal = 'Mg' | 'Al' | 'Zn' | 'Fe' | 'Ni' | 'Pb' | 'Cu' | 'Ag';

/**
 * A scene of the `electrochemicalCell` explore figure (H56): two metals, each in a beaker of
 * its own ion's solution, joined by a wire through a voltmeter or a bulb and by a salt bridge
 * (KNO₃). The figure works out which metal is the anode (the lower standard reduction
 * potential), draws the electrons along the wire from it to the cathode, the ions drifting in
 * the bridge, both half-reactions and the cell's voltage E° = E°cathode − E°anode. `lit` rings
 * one part: the electrons, the anode, the cathode, the salt bridge or the meter.
 */
export interface GalvanicScene {
  metals: [CellMetal, CellMetal];
  meter?: 'voltmeter' | 'bulb';
  lit?: 'electrons' | 'anode' | 'cathode' | 'bridge' | 'meter';
}

// ─── H57 decayChart ──────────────────────────────────────────────────────────

/**
 * One term of a nuclear equation: a nucleus by its mass number A and atomic number Z (its
 * symbol from Z unless given), or a particle. `count` stands in front (3 neutrons).
 */
export type Nuclide =
  | { mass: NumOrVar; atomic: NumOrVar; symbol?: string; count?: NumOrVar }
  | { particle: 'alpha' | 'beta' | 'positron' | 'neutron' | 'gamma'; count?: NumOrVar };

/**
 * Radioactive decay (H57).
 *
 * - The decay (no `mode`): a grid of 100 atoms of the parent, and after `time` the ones that
 *   have decayed turned to the daughter, in an order drawn at random from a fixed seed; as many
 *   are left as the half-life says, 100 × (1/2)^(t ÷ T), rounded. Beside it, the decay curve of
 *   the amount left (`start` at t = 0) with each half-life dashed, and the point at `time`
 *   (drag it along). `left` names the amount left and `halves` the half-lives passed (both
 *   checked). `parent` and `daughter` name the isotopes ('C-14', 'N-14').
 * - 'equation': a nuclear equation, `left` → `right`, each term with its mass number over its
 *   atomic number, and the two sums under it (checked to balance).
 */
export type DecayChartSpec =
  | {
      kind: 'decayChart';
      mode?: 'decay';
      halfLife: NumOrVar;
      time: NumOrVar;
      start: NumOrVar;
      left?: NumOrVar;
      halves?: NumOrVar;
      parent?: string;
      daughter?: string;
      keep?: string[];
      fixed?: boolean;
    }
  | { kind: 'decayChart'; mode: 'equation'; left: Nuclide[]; right: Nuclide[] };

export type HsjSpec =
  GasPistonSpec | EnergyProfileSpec | EquilibriumChartSpec | PhScaleSpec | DecayChartSpec;

/** Every variable id a group J picture refers to (for the module tests). */
export function hsjSpecVars(r: HsjSpec): string[] {
  const ids = (...xs: (NumOrVar | undefined)[]) =>
    xs.filter((x): x is string => typeof x === 'string');
  switch (r.kind) {
    case 'gasPiston':
      return ids(
        r.pressure,
        r.volume,
        r.temperature,
        r.moles,
        r.before?.pressure,
        r.before?.volume,
        r.before?.temperature,
        r.energy?.heat,
        r.energy?.work,
        r.energy?.change,
      );
    case 'energyProfile':
      if (r.mode === 'ladder') return ladderVars(r);
      return r.mode === 'calorimeter'
        ? ids(
            r.mass,
            r.heat,
            r.start,
            r.end,
            r.change,
            r.q,
            r.metal?.mass,
            r.metal?.start,
            r.metal?.heat,
          )
        : ids(r.reactants, r.products, r.activation, r.deltaH, r.reverse, r.catalyst);
    case 'equilibriumChart':
      return ids(
        ...r.species.flatMap((s) => [s.start, s.eq]),
        r.K,
        r.stress?.add?.amount,
        r.stress?.scale,
        r.stress?.K,
        r.stress?.Q,
      );
    case 'phScale':
      return r.mode === 'titration'
        ? ids(
            r.acid.concentration,
            r.acid.volume,
            r.acid.Ka,
            r.base.concentration,
            r.added,
            r.equivalence,
          )
        : ids(r.pH, r.hydrogen, r.hydroxide, r.pOH);
    case 'decayChart': {
      if (r.mode !== 'equation') return ids(r.halfLife, r.time, r.start, r.left, r.halves);
      const terms = [...r.left, ...r.right];
      return ids(
        ...terms.flatMap((t) => ('particle' in t ? [t.count] : [t.mass, t.atomic, t.count])),
      );
    }
  }
}

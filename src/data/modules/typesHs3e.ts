/**
 * Picture options and specs for Grades 9–12 round 3, group H3E (H108: chemistry; see
 * pictureRequestsHs.ts and docs/build/s.10.md, "Shared needs"). Kept apart from `types.ts` and
 * the earlier round files so their unions only name them. A `NumOrVar` field is a fixed number
 * or a variable id.
 */
import { phaseSubstanceVars, type PhaseSubstance } from './typesHe1i';
import { chemRateHe2kVars, type ChemRateHe2kSpec } from './typesHe2k';
import { chemCellHe3fVars, type ChemCellHe3fSpec } from './typesHe3f';
import type { NumOrVar } from './typesGraphs';

const ids = (...xs: (NumOrVar | undefined)[]) =>
  xs.filter((x): x is string => typeof x === 'string');

// ─── Part 2: an ionic compound from its ions' charges ────────────────────────

/**
 * Round 3 option on `lewisStructure` mode `ionic` (H108 part 2): the ions come from their
 * charges. `metal` is the metal ion's charge (1–3: Na⁺, Mg²⁺, Al³⁺) and `nonmetal` the size of
 * the nonmetal ion's charge (1–3: Cl⁻, O²⁻, N³⁻); `metals` and `nonmetals` pick other elements
 * by charge (index 0 for a charge of 1). While a charge is "?" the spec's own `metal` and
 * `nonmetal` draw faded.
 */
export type IonicCharges = {
  metal: NumOrVar;
  nonmetal: NumOrVar;
  metals?: [string, string, string];
  nonmetals?: [string, string, string];
};

export const ionicChargeVars = (c: IonicCharges | undefined) => (c ? ids(c.metal, c.nonmetal) : []);

// ─── Parts 3, 4, 5: chemDiagram modes ────────────────────────────────────────

/**
 * Round 3 modes of the `chemDiagram` kind (H108), in °C, s, mol/L and V (the pages' only units):
 *
 * - `phase` (part 3): water's phase diagram, pressure against temperature (the pressure not to
 *   scale): the solid, liquid and gas regions, the triple point and the 1 atm line. A solution's
 *   lines are drawn dashed beside pure water's: the melting line moved to its `freezing` point
 *   and the boiling curve to its `boiling` point (°C, at 1 atm), ice's own line kept. The
 *   temperature axis is broken into two parts round 0 °C and 100 °C, each to its own scale, so a
 *   shift of a few tenths of a degree shows; `drop` (0 − freezing) and `rise` (boiling − 100)
 *   are bracketed on the 1 atm line and checked.
 * - `rate` (part 4): a reactant's concentration against time through two readings
 *   (`times`, `concentrations`), drawn as a first-order curve through both for its shape, and the
 *   secant through them with its run Δt (`span`) and rise Δ[A] (`change`); `rate` (−Δ[A] ÷ Δt)
 *   is checked. `species` names the reactant (default A).
 * - `cell` (part 5): the galvanic cell of the metals whose standard reduction potentials are
 *   `cathode` and `anode` (V, from the cell figure's table: Mg, Al, Zn, Fe, Ni, Pb, Cu, Ag): the
 *   cell figure with its meter reading `voltage`, and under it the two potentials on a scale
 *   with the gap E°cathode − E°anode bracketed. `voltage` is checked.
 */
export type ChemDiagramHs3eSpec =
  | {
      kind: 'chemDiagram';
      mode: 'phase';
      freezing?: NumOrVar;
      boiling?: NumOrVar;
      drop?: NumOrVar;
      rise?: NumOrVar;
      /** College (HC8): any one-component substance, drawn from its values (`typesHe1i.ts`). */
      substance?: PhaseSubstance;
    }
  | {
      kind: 'chemDiagram';
      mode: 'rate';
      times: [NumOrVar, NumOrVar];
      concentrations: [NumOrVar, NumOrVar];
      span?: NumOrVar;
      change?: NumOrVar;
      rate?: NumOrVar;
      species?: string;
    }
  /** College (HC34): integrated rate laws, Arrhenius, consecutive reactions (`typesHe2k.ts`). */
  | ChemRateHe2kSpec
  | {
      kind: 'chemDiagram';
      mode: 'cell';
      cathode: NumOrVar;
      anode: NumOrVar;
      voltage?: NumOrVar;
    }
  /** College (HC56): a cell at its concentrations, or an electrolysis (`typesHe3f.ts`). */
  | ChemCellHe3fSpec;

export function chemDiagramHs3eVars(r: ChemDiagramHs3eSpec): string[] {
  switch (r.mode) {
    case 'phase':
      return [...ids(r.freezing, r.boiling, r.drop, r.rise), ...phaseSubstanceVars(r.substance)];
    case 'rate':
      if (!('times' in r)) return chemRateHe2kVars(r);
      return ids(...r.times, ...r.concentrations, r.span, r.change, r.rate);
    case 'cell':
      if (!('cathode' in r)) return chemCellHe3fVars(r);
      return ids(r.cathode, r.anode, r.voltage);
  }
}

// ─── Part 6: a gas mixture in the piston ─────────────────────────────────────

/**
 * Round 3 option on `gasPiston` (H108 part 6): a mixture of 2 to 4 `gases`, each with its
 * partial pressure (a value in the page's pressure unit). The cylinder holds 24 particles shared
 * by partial pressure (Dalton: a gas's share of the pressure is its share of the particles),
 * each gas in its own color and drawn as its molecule (He one ball, O₂ two); beside it a bar of
 * the partial pressures stacked to the `total` (checked as their sum), and `fraction` (the
 * first gas's mole fraction, checked as P₁ ÷ P) under it. Pass `law: 'ideal'` and no state.
 */
export interface GasMixture {
  gases: { formula: string; pressure: NumOrVar }[];
  total?: NumOrVar;
  fraction?: NumOrVar;
}

export const gasMixtureVars = (m: GasMixture | undefined) =>
  m ? ids(...m.gases.map((g) => g.pressure), m.total, m.fraction) : [];

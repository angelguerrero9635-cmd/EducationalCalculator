/**
 * Picture options for the college pictures of round 3, group F (docs/RENDERINGS_HE.md, HC56,
 * HC58, HC71, HC73; chemistry). Kept apart from the shared type files, which only name them.
 * A `NumOrVar` field is a fixed number or a variable id; a variable is read in its formula
 * unit. Constants (R, F) come from the page, with the plan's values as defaults.
 */
import type { NumOrVar } from './typesGraphs';

const ids = (...xs: (NumOrVar | undefined)[]) =>
  xs.filter((x): x is string => typeof x === 'string');

// ─── HC56: chemDiagram mode `cell`, college options ──────────────────────────

/**
 * A cell at the page's concentrations (HC56, C-P9): two glass beakers, the anode's metal (left)
 * and the cathode's (right) as electrodes, a salt bridge and a voltmeter reading E. Each
 * beaker's ions are drawn as dots in proportion to its concentration (the richer one 40 dots).
 * Under it, a volt scale with E° and E, the shift −(RT ÷ nF) ln Q between them, Q beside it.
 * The same metal twice is a concentration cell (E° = 0 when `standard` is left out). Units:
 * concentrations in M, E° and E in V, T in K (default 298.15).
 */
export interface CellConcentrations {
  kind: 'chemDiagram';
  mode: 'cell';
  /** The anode's and the cathode's metal symbols ('Zn', 'Cu'); one metal twice for a concentration cell. */
  metals: [string, string];
  /** Each electrode's ion concentration. */
  concentrations: { anode: NumOrVar; cathode: NumOrVar };
  /** Electrons transferred (the ions' charge, unless `ions` names them). */
  n: NumOrVar;
  standard?: NumOrVar;
  T?: NumOrVar;
  Q?: NumOrVar;
  E?: NumOrVar;
  /** The ions as written ('Zn²⁺', 'Ag⁺'); default each metal with charge n. */
  ions?: [string, string];
  R?: number;
  F?: number;
}

/**
 * Electrolysis (HC56, C-P9): a DC supply driving a plating cell, its current and time beside
 * it, electrons along the wires, the metal's ions moving to the cathode and its half-reaction
 * Mᶻ⁺ + ze⁻ → M; under it the count, row by row: Q = It, n(e⁻) = Q ÷ F, n = n(e⁻) ÷ z, m = nM.
 * `time` is read in seconds (its formula unit); `molar` in g/mol gives `mass` in g.
 */
export interface CellElectrolysis {
  kind: 'chemDiagram';
  mode: 'cell';
  electrolysis: {
    current: NumOrVar;
    time: NumOrVar;
    z: NumOrVar;
    /** The metal plated ('Cu'). */
    metal: string;
    charge?: NumOrVar;
    electrons?: NumOrVar;
    moles?: NumOrVar;
    molar?: NumOrVar;
    mass?: NumOrVar;
    F?: number;
  };
}

export type ChemCellHe3fSpec = CellConcentrations | CellElectrolysis;

export function chemCellHe3fVars(r: ChemCellHe3fSpec): string[] {
  if ('electrolysis' in r) {
    const e = r.electrolysis;
    return ids(e.current, e.time, e.z, e.charge, e.electrons, e.moles, e.molar, e.mass);
  }
  return ids(r.concentrations.anode, r.concentrations.cathode, r.n, r.standard, r.T, r.Q, r.E);
}

// ─── HC58: equilibriumChart mode `gibbs` ─────────────────────────────────────

/**
 * G against the extent of reaction (HC58, C-P23), from pure reactants (ξ = 0) to pure products
 * (ξ = 1), for a model A ⇌ B with the page's ΔG° and ideal mixing: the minimum at the
 * equilibrium extent K ÷ (1 + K), and the page's Q placed at Q ÷ (1 + Q) with its tangent, whose
 * slope is ΔG = ΔG° + RT ln Q (downhill toward the minimum). Under it the slope itself against
 * log₁₀ Q: a straight line crossing zero at log₁₀ K, so a minimum squeezed against an edge
 * (K of 10⁵) still shows. `standard` and `delta` are read in J/mol (their formula unit; a page
 * shows kJ/mol by unit), T in K.
 */
export interface EquilibriumGibbsSpec {
  kind: 'equilibriumChart';
  mode: 'gibbs';
  gibbs: {
    standard: NumOrVar;
    T: NumOrVar;
    K?: NumOrVar;
    Q?: NumOrVar;
    delta?: NumOrVar;
    R?: number;
  };
  /** The reactant and product names (default A and B). */
  species?: [string, string];
}

export const gibbsVars = (r: EquilibriumGibbsSpec) =>
  ids(r.gibbs.standard, r.gibbs.T, r.gibbs.K, r.gibbs.Q, r.gibbs.delta);

// ─── HC71: phScale titration options ─────────────────────────────────────────

/**
 * A polyprotic acid on mode `titration` (HC71, C-P6): `pKa` holds its two or three pKₐ values
 * (they replace `acid.Ka`). The curve comes from the exact charge balance; each equivalence
 * point (n × CₐVₐ ÷ C_b) is dashed and each half-way point marked, pH = pKₐ there when the
 * acid's step is weak and its steps far apart. `equivalences` and `firstPH` name the page's
 * equivalence volumes and the pH at the first one (checked).
 */
export interface PhPolyprotic {
  pKa: NumOrVar[];
  equivalences?: NumOrVar[];
  firstPH?: NumOrVar;
}

/**
 * A buffer (HC71, mode `buffer`): pH = pKₐ + log(n(A⁻) ÷ n(HA)) against the share of the acid
 * as A⁻, the useful band pKₐ ± 1 shaded; the buffer before (a point, two bars HA and A⁻) and,
 * with `added` (mol of strong acid, negative for strong base), after: the point moved and the
 * bars changed. `before` and `after` name the page's pH values (checked).
 */
export interface PhBufferSpec {
  kind: 'phScale';
  mode: 'buffer';
  pKa: NumOrVar;
  acid: NumOrVar;
  base: NumOrVar;
  added?: NumOrVar;
  before?: NumOrVar;
  after?: NumOrVar;
  /** The pair as written (default HA and A⁻). */
  names?: [string, string];
}

/**
 * A free amino acid (HC71, mode `aminoAcid`): its titration curve from the fully protonated
 * form, pH against the equivalents of OH⁻ added (one per group), each half-way point at its
 * pKₐ, the pI marked where the net charge is 0, and the page's pH placed with its net charge.
 * `side` is the side chain's kind (a fixed value or a variable holding 0 none, 1 acidic, 2
 * basic); `charge` and `pI` name the page's values (checked).
 */
export interface PhAminoAcidSpec {
  kind: 'phScale';
  mode: 'aminoAcid';
  pKa1: NumOrVar;
  pKa2: NumOrVar;
  pKaR?: NumOrVar;
  side?: 'none' | 'acidic' | 'basic' | NumOrVar;
  pH?: NumOrVar;
  charge?: NumOrVar;
  pI?: NumOrVar;
  name?: string;
}

// ─── HC73: phScale mode `pka` ────────────────────────────────────────────────

/** An acid on the ladder: its name and pKₐ (a number or the page's variable). */
export interface LadderAcid {
  name: string;
  pKa: NumOrVar;
}

/**
 * The pKₐ ladder (HC73, C-P22): a vertical scale from −10 (strongest acids, top) to 50, each
 * acid named at its pKₐ. With `reaction`, the acid on the left (`left`, the acid that gives up
 * its proton) and the acid it forms (`right`) are lit, joined by the equilibrium arrow, which
 * points toward the weaker acid (the larger pKₐ); log K = pKₐ(right) − pKₐ(left), and `logK`
 * and `K` name the page's values (checked). `acids` adds reference acids (none by default;
 * `LADDER_ACIDS` is a set of common ones).
 */
export interface PhPkaSpec {
  kind: 'phScale';
  mode: 'pka';
  acids?: LadderAcid[];
  reaction?: { left: LadderAcid; right: LadderAcid; logK?: NumOrVar; K?: NumOrVar };
  /** The scale's ends (default −10 to 50). */
  range?: [number, number];
}

/** Common acids for the ladder (approximate pKₐ in water; ethane and ammonia estimated). */
export const LADDER_ACIDS: LadderAcid[] = [
  { name: 'HCl', pKa: -7 },
  { name: 'H₃O⁺', pKa: -1.7 },
  { name: 'ethanoic acid', pKa: 4.76 },
  { name: 'phenol', pKa: 10 },
  { name: 'water', pKa: 15.7 },
  { name: 'ethyne', pKa: 25 },
  { name: 'ammonia', pKa: 38 },
  { name: 'ethane', pKa: 50 },
];

export type PhScaleHe3fSpec = PhBufferSpec | PhAminoAcidSpec | PhPkaSpec;

export function phScaleHe3fVars(r: PhScaleHe3fSpec): string[] {
  switch (r.mode) {
    case 'buffer':
      return ids(r.pKa, r.acid, r.base, r.added, r.before, r.after);
    case 'aminoAcid':
      return ids(
        r.pKa1,
        r.pKa2,
        r.pKaR,
        r.side === 'none' || r.side === 'acidic' || r.side === 'basic' ? undefined : r.side,
        r.pH,
        r.charge,
        r.pI,
      );
    case 'pka':
      return ids(
        ...(r.acids ?? []).map((a) => a.pKa),
        r.reaction?.left.pKa,
        r.reaction?.right.pKa,
        r.reaction?.logK,
        r.reaction?.K,
      );
  }
}

export const polyproticVars = (p: PhPolyprotic | undefined) =>
  p ? ids(...p.pKa, ...(p.equivalences ?? []), p.firstPH) : [];

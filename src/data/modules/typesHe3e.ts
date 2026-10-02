/**
 * College pictures, round 3, group E (docs/RENDERINGS_HE.md): HC55 `instrumentTrace` and its
 * `ir` card, HC70 `orbitalDiagram` mode `mo`, HC72 `vsepr` 5–6 domains and `complex`, HC74
 * `moleMap` boxes and the combustion train. Kept apart from `types.ts` and the earlier round
 * files so their unions only name them. A `NumOrVar` field is a fixed number or a variable id.
 */
import type { NumOrVar } from './typesGraphs';

const ids = (...xs: (NumOrVar | undefined)[]) =>
  xs.filter((x): x is string => typeof x === 'string');

// ─── HC55: instrumentTrace ───────────────────────────────────────────────────

/** One ¹H NMR signal: its shift, its neighbors (n + 1 lines) and its integral. */
export interface NmrSignal {
  /** Chemical shift δ (ppm, 0–12). */
  shift: NumOrVar;
  /** Equivalent H on the neighboring atoms (0–8): the signal splits into n + 1 lines. */
  neighbors: NumOrVar;
  /** Its integral (any units): the integral trace rises by it. */
  integral?: NumOrVar;
  /** The H it stands for: H × I ÷ ΣI with `hydrogens` (checked), written on its step. */
  count?: NumOrVar;
  /** The structure's atoms (numbered from 0 in `smiles`) whose H give the signal. */
  atoms?: number[];
}

/** One chromatographic peak: its retention time and base width (minutes, or the page's unit). */
export interface ChromPeak {
  time: NumOrVar;
  width: NumOrVar;
  /** The compound's name, for the caption. */
  name?: string;
}

/**
 * Instrument traces computed from peak lists (HC55, C-P5), never traced from a real spectrum.
 *
 * - `nmr`: a ¹H spectrum on a reversed δ axis (ppm), TMS at 0; each signal an n + 1 multiplet
 *   with Pascal-triangle heights (area ∝ its integral), lettered a, b, c; the integral trace
 *   above, stepping up by each integral with its H count; with `smiles`, the structure above
 *   with each signal's letter on its atoms. `coupling` J (Hz) and `field` ν₀ (MHz) give the
 *   multiplet width nJ in Hz and ppm (the lines are drawn wider than scale when they would
 *   touch). `hydrogens` (H in the formula) checks each `count` = H × I ÷ ΣI.
 * - `chromatogram`: Gaussian peaks (σ = w ÷ 4, equal areas) on a time axis, the dead time t_M as
 *   a blip, each peak's tangent triangle meeting the baseline w apart, Δt and the base widths
 *   bracketed, R in a chip. Peaks far from t_M break the axis. `resolution` (first two peaks),
 *   `factors` (kᵢ), `selectivity` (α = k₂ ÷ k₁) and `plates` (N of the second peak) are checked.
 * - `rotational`: a rigid rotor's microwave lines at ν̃ = 2B(J + 1), heights by the lower level's
 *   population (2J + 1)e^(−hcBJ(J + 1) ÷ kT), each line's lower J under it, the 2B spacing
 *   bracketed and the `lower` J's line lit with its `line` ν̃ (checked). `temperature` (K) is
 *   the page's (default 298.15 K); hc ÷ k = 1.4388 cm·K.
 */
export type InstrumentTraceSpec =
  | {
      kind: 'instrumentTrace';
      mode: 'nmr';
      signals: NmrSignal[];
      hydrogens?: NumOrVar;
      smiles?: string;
      /** The compound's name and formula for the caption ("ethyl ethanoate, C4H8O2"). */
      name?: string;
      coupling?: NumOrVar;
      field?: NumOrVar;
    }
  | {
      kind: 'instrumentTrace';
      mode: 'chromatogram';
      dead: NumOrVar;
      peaks: ChromPeak[];
      resolution?: NumOrVar;
      factors?: NumOrVar[];
      selectivity?: NumOrVar;
      plates?: NumOrVar;
    }
  | {
      kind: 'instrumentTrace';
      mode: 'rotational';
      /** Rotational constant B (cm⁻¹). */
      constant: NumOrVar;
      temperature?: NumOrVar;
      lower?: NumOrVar;
      line?: NumOrVar;
      spacing?: NumOrVar;
      /** The molecule, for the caption ("H³⁵Cl"). */
      name?: string;
    };

export function instrumentTraceVars(r: InstrumentTraceSpec): string[] {
  switch (r.mode) {
    case 'nmr':
      return [
        ...ids(r.hydrogens, r.coupling, r.field),
        ...r.signals.flatMap((s) => ids(s.shift, s.neighbors, s.integral, s.count)),
      ];
    case 'chromatogram':
      return [
        ...ids(r.dead, r.resolution, r.selectivity, r.plates, ...(r.factors ?? [])),
        ...r.peaks.flatMap((p) => ids(p.time, p.width)),
      ];
    case 'rotational':
      return ids(r.constant, r.temperature, r.lower, r.line, r.spacing);
  }
}

/** One IR band: a dip at `at` cm⁻¹ (or across `at` to `to` for a very broad one). */
export interface IrBand {
  at: number;
  to?: number;
  strength?: 'strong' | 'medium' | 'weak';
  shape?: 'sharp' | 'broad';
}

/**
 * The `ir` card figure (HC55): an IR spectrum, 140 × 60, transmittance falling into each band
 * on a reversed 4000–400 cm⁻¹ axis (ticks every 1000), in the card's text color with the bands
 * in its shade. Bands are computed from the list, never traced.
 */
export interface IrCard {
  kind: 'ir';
  bands: IrBand[];
}

export const IR_CARD_W = 140;
export const IR_CARD_H = 60;

// ─── HC70: orbitalDiagram mode `mo` ──────────────────────────────────────────

/**
 * Molecular orbitals (HC70, C-P3), flat, energy up the page, in three views:
 *
 * - `diatomic`: a second-period homonuclear diatomic (or ion) from its `electrons` (valence,
 *   2–16): the two atoms' 2s and 2p levels at the sides, the MOs between, joined by dashed
 *   lines; s–p mixing (π2p below σ2p) through 10 electrons (N₂), the other order from O₂; MOs
 *   filled one to each orbital of a pair before any pairs. `bonding`, `antibonding`,
 *   `bondOrder` and `unpaired` are checked; `formula` names it ("O2+"; default the neutral one).
 * - `heteronuclear`: the AO levels α_A and α_B (`alphaA`, `alphaB`, eV) and the two MOs E₊ and
 *   E₋ from the 2 × 2 secular determinant with `beta` (β < 0), to scale on an energy axis, the
 *   splitting bracketed, `electrons` (default 2) filled. `plus`, `minus`, `splitting` checked.
 * - `frost`: a ring of `ring` carbons (3–8) in a circle of radius 2β, a vertex down; its levels
 *   α + 2β cos(2πk ÷ N) at the vertices, filled with `electrons` π electrons; `energy` (the π
 *   energy beyond Nα, in β), `isolated` (the same electrons in isolated C=C, in β),
 *   `delocalization` and `unpaired` are checked.
 */
export interface OrbitalMoSpec {
  kind: 'orbitalDiagram';
  mode: 'mo';
  view: 'diatomic' | 'heteronuclear' | 'frost';
  electrons?: NumOrVar;
  formula?: string;
  bonding?: NumOrVar;
  antibonding?: NumOrVar;
  bondOrder?: NumOrVar;
  unpaired?: NumOrVar;
  alphaA?: NumOrVar;
  alphaB?: NumOrVar;
  beta?: NumOrVar;
  plus?: NumOrVar;
  minus?: NumOrVar;
  splitting?: NumOrVar;
  /** The two atoms' names for `heteronuclear` (default A and B). */
  atoms?: [string, string];
  ring?: NumOrVar;
  energy?: NumOrVar;
  isolated?: NumOrVar;
  delocalization?: NumOrVar;
}

export function orbitalMoVars(r: OrbitalMoSpec): string[] {
  return ids(
    r.electrons,
    r.bonding,
    r.antibonding,
    r.bondOrder,
    r.unpaired,
    r.alphaA,
    r.alphaB,
    r.beta,
    r.plus,
    r.minus,
    r.splitting,
    r.ring,
    r.energy,
    r.isolated,
    r.delocalization,
  );
}

// ─── HC72: vsepr 5–6 domains and `complex` ───────────────────────────────────

/**
 * `vsepr` mode `expanded` (HC72, C-P13): a ball-and-stick molecule from 2 to 6 electron domains,
 * `bonded` atoms (2–6) and `lone` pairs (0–3) on the central atom: the 2–4 domain shapes, and
 * from 5 the trigonal bipyramid, seesaw, T and line (lone pairs equatorial), from 6 the
 * octahedron, square pyramid and square plane (two lone pairs trans). The hybrid (sp … sp³d²)
 * and shape are named; the smallest bond angle marked (the pair nearest the page). `angle` (θ, the smallest
 * ideal angle between domains: 180°, 120°, 109.5°, 90°, 90°) and `domains` (d = b + l) are
 * checked. `central` and `outer` draw another molecule than the shape's example.
 */
export interface VseprExpandedSpec {
  kind: 'vsepr';
  mode: 'expanded';
  bonded: NumOrVar;
  lone: NumOrVar;
  angle?: NumOrVar;
  domains?: NumOrVar;
  central?: string;
  outer?: string;
  /** The molecule's formula for the label ("XeF4"). */
  formula?: string;
}

/**
 * `vsepr` mode `complex` (HC72): a metal with its named ligands in an `octahedral`,
 * `squarePlanar` or `tetrahedral` place set, the minority ligand at `isomer` places (cis
 * neighbors, trans opposite, fac on a face, mer in a plane), lit and joined with their angle.
 * `ligands` lists one or two ligands with their counts (the majority first) and the atom each
 * binds through (NH3 → N). `coordination` (the ligand count) is checked.
 */
export interface VseprComplexSpec {
  kind: 'vsepr';
  mode: 'complex';
  complex: {
    metal: string;
    geometry: 'octahedral' | 'squarePlanar' | 'tetrahedral';
    ligands: { name: string; count: number; donor: string }[];
    isomer?: 'cis' | 'trans' | 'fac' | 'mer';
    /** The ion's formula for the label ("[Co(NH3)4Cl2]+"). */
    formula?: string;
  };
  coordination?: NumOrVar;
}

export type VseprHe3eSpec = VseprExpandedSpec | VseprComplexSpec;

export function vseprHe3eVars(r: VseprHe3eSpec): string[] {
  return r.mode === 'expanded' ? ids(r.bonded, r.lone, r.angle, r.domains) : ids(r.coordination);
}

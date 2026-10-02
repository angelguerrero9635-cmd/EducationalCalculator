/**
 * Picture options for the college pictures of round 4, group D (docs/RENDERINGS_HE.md, HC109–
 * HC113, HC115; chemistry). Kept apart from the shared type files, which only name them. A
 * `NumOrVar` field is a fixed number or a variable id, read in its formula unit. Constants come
 * from the page, with the plan's values as defaults.
 */
import type { NumOrVar } from './typesGraphs';

const ids = (...xs: (NumOrVar | undefined)[]) =>
  xs.filter((x): x is string => typeof x === 'string');

// ─── HC109: orbitalDiagram ladder `Z` and mode `radial` ──────────────────────

/**
 * A hydrogen-like ion's ladder (HC109, C-P2): the levels Eₙ = −R∞Z² ÷ n² to scale (n = 1 up to
 * at least 4, or n + 1), the page's level n lit with its energy; under it the shell's n²
 * orbitals as boxes all at one energy, the subshell l lit, and a slice through one of its
 * orbitals with the radial nodes as rings and the angular nodes as lines (the lobes signed +
 * and −). `energy` (eV), `radial`, `angular` and `degeneracy` are checked. `rydberg` defaults
 * to 13.6 eV.
 */
export interface OrbitalLadderZ {
  kind: 'orbitalDiagram';
  mode: 'ladder';
  Z: NumOrVar;
  n: NumOrVar;
  l?: NumOrVar;
  energy?: NumOrVar;
  radial?: NumOrVar;
  angular?: NumOrVar;
  degeneracy?: NumOrVar;
  rydberg?: number;
  /** The Grades 9–12 ladder's photon fields are not used here. */
  upper?: never;
  lower?: never;
}

/**
 * The radial distribution (HC109, C-P2): P(r) = r²R²(r) for a hydrogen-like orbital (n ≤ 10,
 * l < n) against r in a₀, its area 1 shaded, the radial nodes marked, ⟨r⟩ dashed and the most
 * probable radius ringed (the tallest hump). `mean` and `peak` are in a₀ (`meanNm`, `peakNm`
 * in nm, a₀ = 0.0529177 nm); `nodes` counts the radial nodes. All are checked; `peak` is the
 * tallest hump, n²a₀ ÷ Z when l = n − 1.
 */
export interface OrbitalRadial {
  kind: 'orbitalDiagram';
  mode: 'radial';
  Z: NumOrVar;
  n: NumOrVar;
  l: NumOrVar;
  mean?: NumOrVar;
  meanNm?: NumOrVar;
  peak?: NumOrVar;
  peakNm?: NumOrVar;
  nodes?: NumOrVar;
}

// ─── HC110: orbitalDiagram mode `crystalField` ───────────────────────────────

/**
 * A metal ion's d orbitals in a crystal field (HC110, C-P4): the five free-ion boxes on the
 * left, split on the right into t₂g and e_g by Δₒ (drawn to scale against P, a bar beside it),
 * filled one electron at a time where each costs least (low spin when Δₒ > P); CFSE and the
 * spin-only μ in the caption. `geometry` (default octahedral) also draws tetrahedral (e below
 * t₂, Δₜ) or square planar (four levels). `split` and `pairing` in cm⁻¹ (any one unit for both).
 * `t2g` (the lower set), `eg` (the upper set), `unpaired`, `cfse` and `moment` (BM) are checked.
 */
export interface OrbitalCrystalField {
  kind: 'orbitalDiagram';
  mode: 'crystalField';
  d: NumOrVar;
  split: NumOrVar;
  pairing: NumOrVar;
  geometry?: 'octahedral' | 'tetrahedral' | 'squarePlanar';
  t2g?: NumOrVar;
  eg?: NumOrVar;
  unpaired?: NumOrVar;
  cfse?: NumOrVar;
  moment?: NumOrVar;
  /** The ion and its ligand, named over the picture ("Fe²⁺", "H₂O"). */
  ion?: string;
  ligand?: string;
  /** The unit written on Δ, P and CFSE (default "cm⁻¹"). */
  unit?: string;
}

export type OrbitalHe4dSpec = OrbitalLadderZ | OrbitalRadial | OrbitalCrystalField;

/** A group D `orbitalDiagram` option (ladder with Z, radial, crystal field). */
export function isOrbitalHe4d<T extends { kind: string; mode?: string }>(
  s: T | OrbitalHe4dSpec,
): s is OrbitalHe4dSpec {
  return (
    s.kind === 'orbitalDiagram' &&
    (s.mode === 'radial' || s.mode === 'crystalField' || (s.mode === 'ladder' && 'Z' in s))
  );
}

export function orbitalHe4dVars(r: OrbitalHe4dSpec): string[] {
  switch (r.mode) {
    case 'ladder':
      return ids(r.Z, r.n, r.l, r.energy, r.radial, r.angular, r.degeneracy);
    case 'radial':
      return ids(r.Z, r.n, r.l, r.mean, r.meanNm, r.peak, r.peakNm, r.nodes);
    default:
      return ids(r.d, r.split, r.pairing, r.t2g, r.eg, r.unpaired, r.cfse, r.moment);
  }
}

// ─── HC111: lewisStructure `formal`, `resonance`, expanded octets ────────────

/**
 * Formal charges on a `lewisStructure` molecule (HC111, C-P12): every atom's FC = v − N − B ÷ 2
 * circled beside it (signed; 0 drawn small), and the atom whose valence electrons v,
 * nonbonding electrons N and bonding electrons B are the page's values ringed in each form
 * where it matches (or atom `atom`, an index into the structure, while they are "?"). `charge`
 * is checked as v − N − B ÷ 2; the charges of each form must add to the ion's charge.
 */
export interface LewisFormal {
  valence?: NumOrVar;
  nonbonding?: NumOrVar;
  bonding?: NumOrVar;
  charge?: NumOrVar;
  atom?: number;
}

/**
 * The college structures a `lewisStructure` molecule draws by `formula` (HC111): resonance
 * sets NO3-, NO2-, "CO3 2-", O3 and "SO4 2-" (3 of its 6 forms), and expanded octets PCl5, SF4,
 * SF6, ClF3, XeF4, I3-. `resonance: true` draws every form, joined by double-headed arrows (two
 * on a row); without it the first form only.
 */
export interface LewisHe4dSpec {
  kind: 'lewisStructure';
  mode: 'molecule';
  formula?: string;
  charge?: NumOrVar;
  formal?: LewisFormal;
  resonance?: boolean;
}

export function lewisFormalVars(f: LewisFormal | undefined): string[] {
  return f ? ids(f.valence, f.nonbonding, f.bonding, f.charge) : [];
}

// ─── HC112: beaker `cuvette` ─────────────────────────────────────────────────

/**
 * A spectrophotometer's cuvette (HC112, C-P16): a lamp's beam I₀ through a glass cuvette of
 * path b (drawn to scale, 56 px per cm up to 2.5 cm), its width falling as 10^(−A·x ÷ b) inside
 * the solution, so the beam that reaches the detector is T times as wide; the solution tinted by
 * εc (or A ÷ b). `path` in cm, `transmittance` in % (100 × 10^(−A)), `absorptivity` in
 * L/(mol·cm), `concentration` in M. A, %T and A = εbc (when ε and c are given) are checked.
 */
export interface BeakerCuvette {
  path: NumOrVar;
  absorbance?: NumOrVar;
  transmittance?: NumOrVar;
  absorptivity?: NumOrVar;
  concentration?: NumOrVar;
}

export function cuvetteVars(c: BeakerCuvette): string[] {
  return ids(c.path, c.absorbance, c.transmittance, c.absorptivity, c.concentration);
}

// ─── HC113: explore figure `symmetryElements` ────────────────────────────────

/** The molecules a `symmetryElements` figure draws (keys of `SYMMETRY_MOLECULES`). */
export type SymmetryMolecule =
  'H2O' | 'CH2Cl2' | 'NH3' | 'BF3' | 'PCl5' | 'CH4' | 'XeF4' | 'SF6' | 'CO2' | 'N2F2';

/**
 * A `symmetryElements` scene (HC113, C-P18): a ball-and-stick molecule in 3-D and one of its
 * symmetry elements lit, by its id in `symmetryMath.ts`: an axis Cₙ (dashed, with the turn
 * drawn round it), a mirror plane σ (a pane through the molecule), the centre i (the atom
 * pairs it swaps joined through it) or an improper axis Sₙ (the axis and the pane
 * perpendicular to it). With no `element`, the molecule alone, named with its point group.
 */
export interface SymmetryScene {
  molecule: SymmetryMolecule;
  element?: string;
}

/** The round 4 group D explore figures (listed in `layouts/types.ts`). */
export type He4dFigure = { kind: 'symmetryElements' };

/** The scene field each group D figure reads (for the layout tests). */
export const HE4D_SCENE_FIELD = { symmetryElements: 'symmetry' } as const;

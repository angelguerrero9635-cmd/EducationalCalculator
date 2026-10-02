/**
 * College picture kinds of round 2, group B (docs/RENDERINGS_HE.md): HC15 `potentialWell` and
 * HC16 `unitCell`. Kept apart from `types.ts` so its union only names them. A `NumOrVar` is a
 * fixed number or a variable id; values are read in the variable's own unit, and a check that
 * needs SI reads the unit from the variable (eV or J, nm or μm, kg or u).
 */
import type { NumOrVar } from './typesGraphs';

// ─── HC15: a potential well with its levels and wavefunctions ────────────────

/**
 * A one-dimensional potential drawn in ink, its energy levels to scale and ψ (or |ψ|²) on the
 * chosen levels; a transition arrow with ΔE and the photon λ.
 *
 * - `box`: the infinite square well, levels ∝ n², ψ = sin(nπx/L) with n − 1 nodes. `region`
 *   shades |ψ|² from x₁ to x₂ (the chance P); `mean` and `spread` mark ⟨x⟩ and ±Δx.
 * - `harmonic`: the parabola ½kx², levels (v + ½)ħω evenly spaced, ψᵥ with v nodes, each level
 *   drawn between its classical turning points.
 * - `step`: a step of height U₀ under a particle of energy E: the wave shortens past the step
 *   (k₁/k₂) and R, T are labelled; below the step's top ψ decays into it.
 * - `barrier`: a barrier of width a: ψ decays as e^(−κx) inside, leaving e^(−κa) of its size,
 *   so T ≈ e^(−2κa).
 * - `bump`: the box with a small step V₀ from x₁ to x₂ shaded; |ψₙ|² over it shaded (P), the
 *   level and the first-order estimate E = Eₙ + V₀P dashed.
 */
export interface PotentialWellSpec {
  kind: 'potentialWell';
  model: 'box' | 'harmonic' | 'step' | 'barrier' | 'bump';
  /** The letter of the quantum number: n (default in a box) or v (default for an oscillator). */
  letter?: 'n' | 'v';
  /** `box`, `bump`: the width L (a label; positions in the box are read against it). */
  length?: NumOrVar;
  /** The particle's mass (a label; the `barrier` check reads κ from it). */
  mass?: NumOrVar;
  /** `harmonic`: the force constant k and the angular frequency ω (labels). */
  force?: NumOrVar;
  omega?: NumOrVar;
  /**
   * The lower and upper levels (n or v), lit with ψ on each, and the transition arrow between
   * them. `harmonic` without `upper` draws the next level up (the photon of ħω); a box without
   * `upper` lights `lower` alone.
   */
  lower?: NumOrVar;
  upper?: NumOrVar;
  /** The arrow points up (absorbed photon) instead of down (emitted). */
  absorb?: boolean;
  /** Draw |ψ|² instead of ψ. */
  square?: boolean;
  /**
   * Energies, any one of which sets every level's label: E₁ (box) or E₀ (oscillator), the
   * spacing ħω or hν (oscillator), and the lower and upper levels' energies.
   */
  ground?: NumOrVar;
  spacing?: NumOrVar;
  lowerEnergy?: NumOrVar;
  upperEnergy?: NumOrVar;
  /** The gap ΔE and the photon's wavelength λ (λ is worked out from ΔE when not given). */
  gap?: NumOrVar;
  wavelength?: NumOrVar;
  /** `box`, `bump`: the stretch from x₁ to x₂ (in L's unit), and the chance P of being in it. */
  region?: { from: NumOrVar; to: NumOrVar };
  probability?: NumOrVar;
  /** `box`: ⟨x⟩ and Δx, marked on |ψ|². */
  mean?: NumOrVar;
  spread?: NumOrVar;
  /** `step`, `barrier`: the particle's energy E and the height U (U₀); or U − E alone. */
  energy?: NumOrVar;
  height?: NumOrVar;
  above?: NumOrVar;
  /** `barrier`: width a and the decay constant κ (κa is read in one length unit). */
  width?: NumOrVar;
  kappa?: NumOrVar;
  /** `step`, `barrier`: transmission T and reflection R; `step`: the ratio k₁/k₂. */
  transmission?: NumOrVar;
  reflection?: NumOrVar;
  ratio?: NumOrVar;
  /** `bump`: its height V₀ and the first-order shift E⁽¹⁾. */
  bump?: NumOrVar;
  shift?: NumOrVar;
  /** Further values labelled under the picture. */
  more?: string[];
}

export type He2bSpec = PotentialWellSpec;

const ids = (xs: unknown[]): string[] =>
  xs.flatMap((x) =>
    typeof x === 'string'
      ? [x]
      : Array.isArray(x)
        ? ids(x)
        : x && typeof x === 'object'
          ? ids(Object.values(x))
          : [],
  );

/** The variable ids a group B picture reads (for the module tests). */
export function he2bSpecVars(r: He2bSpec): string[] {
  const { kind: _k, model: _m, letter: _l, ...rest } = r;
  return ids(Object.values(rest));
}

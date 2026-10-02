/**
 * College picture kinds of round 2, group H (docs/RENDERINGS_HE.md): HC24 `wing`, HC30 `duct`,
 * HC31 `supersonicFlow`. Kept apart from `types.ts` so its union only names them. A `NumOrVar` is
 * a fixed number or a variable id; values are read in the variable's own unit, angles in degrees.
 */
import type { NumOrVar } from './typesGraphs';

// ─── HC24: an airfoil section or a wing's planform ───────────────────────────

/**
 * HC24 (ACC-P1). `section` (the default): a NACA four-digit airfoil to scale, its chord and
 * camber line, tilted by α against the relative wind (horizontal, from the left); the lift
 * arrow ⟂ the wind, never the chord. `planform`: the wing from above to scale (span b, root
 * and tip chords, S shaded), its tip vortices trailing, and under it the view from behind with
 * the vortices turning and the downwash between them.
 */
export interface WingSpec {
  kind: 'wing';
  mode?: 'section' | 'planform';
  /** Angle of attack α (degrees), chord against the relative wind. Left out: the chord level. */
  alpha?: NumOrVar;
  /**
   * Zero-lift angle α_L0 (degrees). Without `digits` the section's camber is the one thin-airfoil
   * theory says gives it (max camber at 40% of the chord); the zero-lift line is dashed.
   */
  alphaL0?: NumOrVar;
  /** NACA four digits: max camber d₁% of c, at d₂ × 10% of c, thickness d₃d₄% of c. */
  digits?: { d1: NumOrVar; d2: NumOrVar; d34: NumOrVar };
  /** The chord c, bracketed under the section. */
  chord?: NumOrVar;
  /** With `digits`: the max camber, its distance from the leading edge and the thickness. */
  camber?: NumOrVar;
  camberAt?: NumOrVar;
  thickness?: NumOrVar;
  /** Section lift and drag coefficients (c_l labels the lift arrow; with `cd`, L ÷ D). */
  cl?: NumOrVar;
  cd?: NumOrVar;
  /** Lift and drag to scale (L ⟂ the wind, D along it) and the resultant dashed. */
  forces?: { lift: NumOrVar; drag: NumOrVar };
  /**
   * The pressure coefficient at one point of the surface (`at` × c from the leading edge,
   * default 0.3, upper unless `surface`): an arrow normal to the surface, outward for suction
   * (C_p < 0), inward for pressure, its length ∝ |C_p|; the local speed V along the surface.
   */
  pressure?: { cp: NumOrVar; speed?: NumOrVar; at?: number; surface?: 'upper' | 'lower' };
  /** A loop of circulation Γ round the section (clockwise for lift) and the lift per span L′. */
  circulation?: { gamma: NumOrVar; lift?: NumOrVar };
  /** Free-stream speed V∞ on the relative wind. */
  speed?: NumOrVar;
  /** `planform`: span b, root and tip chords (tip = root, or left out, is rectangular). */
  span?: NumOrVar;
  rootChord?: NumOrVar;
  tipChord?: NumOrVar;
  /** `planform`: wing area S and aspect ratio AR (with AR alone the wing is drawn rectangular). */
  area?: NumOrVar;
  aspectRatio?: NumOrVar;
  /** `planform`: taper λ = c_t ÷ c_r, labelled. */
  taper?: NumOrVar;
  /** `planform`: wing lift coefficient C_L, span efficiency e, C_Di and the induced angle α_i (°). */
  CL?: NumOrVar;
  e?: NumOrVar;
  CDi?: NumOrVar;
  alphaI?: NumOrVar;
  /** Further values labelled under the picture (q, a₀, a, Re). */
  more?: string[];
}

// ─── HC30: a stream tube, a nozzle or a turbojet ─────────────────────────────

/**
 * HC30 (ACC-P2). Ducts drawn to scale by A ÷ A* (widths ∝ √(A ÷ A*), a round duct), steel walls,
 * the gas flat. γ comes from the page (default 1.4).
 *
 * - `station` (the default): one station at Mach `M` (or at `areaRatio` = A ÷ A* on `branch`).
 *   Supersonic: a converging–diverging duct ending at the station. Subsonic: a converging duct
 *   ending at the station, the throat A* it would need dashed beyond it. M = 1 (`choked`): a
 *   converging duct ending at a lit throat. The reservoir on the left holds p₀ and T₀ at rest.
 * - `nozzle`: reservoir (or a rocket `chamber`), throat at M = 1, exit at `areaRatio` = A_e ÷ A_t
 *   (or from `Me`, or from `pressureRatio` = p_e ÷ p₀); a normal shock where A ÷ A_t = `shockAt`;
 *   with `axis`, p ÷ p₀ and M along the axis under it, from the area–Mach relation.
 * - `engine`: a turbojet outline (inlet, compressor, burner, turbine, nozzle), V₀ in and V_e out
 *   as arrows to one scale, the fuel ṁ_f into the burner and the thrust F forward.
 */
export interface DuctSpec {
  kind: 'duct';
  mode?: 'station' | 'nozzle' | 'engine';
  /** Ratio of specific heats γ (default 1.4). */
  gamma?: NumOrVar;
  /** The station's Mach number, its T and p, and the stagnation T₀ and p₀. */
  M?: NumOrVar;
  T?: NumOrVar;
  p?: NumOrVar;
  T0?: NumOrVar;
  p0?: NumOrVar;
  /** A ÷ A* at the station, or the nozzle's A_e ÷ A_t. */
  areaRatio?: NumOrVar;
  /** The branch when only `areaRatio` is known (default supersonic). */
  branch?: 'sub' | 'super';
  /** Light the throat at M = 1 (a choked station). */
  choked?: boolean;
  /** Throat area A* (A_t) and the mass flow ṁ, labelled at the throat. */
  throatArea?: NumOrVar;
  mdot?: NumOrVar;
  /** `nozzle`: exit Mach, pressure, temperature; p_e ÷ p₀ (sets the exit when no area ratio). */
  Me?: NumOrVar;
  pe?: NumOrVar;
  Te?: NumOrVar;
  pressureRatio?: NumOrVar;
  /** `nozzle`: a normal shock where A ÷ A_t = shockAt, with M₁ and M₂ either side. */
  shockAt?: NumOrVar;
  shockM1?: NumOrVar;
  shockM2?: NumOrVar;
  /** `nozzle`: a rocket chamber in place of the reservoir (p₀ and T₀ label as p_c and T_c). */
  chamber?: boolean;
  /** `nozzle`: p ÷ p₀ and M along the axis. */
  axis?: boolean;
  /** Exhaust speed v_e out of the exit, and the thrust F forward. */
  exhaust?: NumOrVar;
  thrust?: NumOrVar;
  /** `engine`: flight speed V₀ into the inlet, jet speed V_e out, and the fuel flow ṁ_f. */
  V0?: NumOrVar;
  Ve?: NumOrVar;
  fuel?: NumOrVar;
  /** Further values labelled under the picture. */
  more?: string[];
}

// ─── HC31: shocks, expansion fans and Mach waves ─────────────────────────────

/**
 * HC31 (ACC-P3). Supersonic flow from the left, streamlines flat, angles in degrees, every wave
 * angle computed from the relations (θ–β–M, Prandtl–Meyer, sin⁻¹(1 ÷ M)) with the page's γ.
 *
 * - `normal`: a vertical shock, M₁ > 1 in and M₂ < 1 out, the arrows shortened by ρ₁ ÷ ρ₂, and
 *   bars for the `ratios`; with `probe`, a pitot tube behind its detached bow shock reading p₀₂.
 * - `wedge`: a wedge of half-angle θ, the oblique shock at β from its corner, streamlines turning
 *   by θ through it, the Mach angle μ₁ dashed (β ≥ μ₁).
 * - `corner`: a wall turning away by θ, the expansion fan between the Mach lines at μ₁ (to the
 *   flow before) and μ₂ (to the flow after), streamlines bending through it.
 * - `flatPlate`: a plate at α, a shock and a fan at each edge (from the relations, not Ackeret's
 *   linear waves), lift ⟂ the stream and wave drag along it.
 * - `mach`: sound fronts from a moving point; the Mach cone at μ when M > 1, none below.
 */
export interface SupersonicFlowSpec {
  kind: 'supersonicFlow';
  mode: 'normal' | 'wedge' | 'corner' | 'flatPlate' | 'mach';
  /** Ratio of specific heats γ (default 1.4). */
  gamma?: NumOrVar;
  /** Mach numbers before and after (M∞ on the plate, M of the point in `mach`). */
  M1?: NumOrVar;
  M2?: NumOrVar;
  /** Shock angle β, the wedge's or the corner's turn θ, the plate's α, the Mach angle μ (°). */
  beta?: NumOrVar;
  theta?: NumOrVar;
  alpha?: NumOrVar;
  mu?: NumOrVar;
  /** `wedge`: the normal Mach number M₁ sin β. */
  Mn1?: NumOrVar;
  /** `corner`: the Prandtl–Meyer angles ν₁ and ν₂ (°). */
  nu1?: NumOrVar;
  nu2?: NumOrVar;
  /** `normal` (and `wedge`, p only): ratios across the shock, drawn as bars. */
  ratios?: { p?: NumOrVar; rho?: NumOrVar; T?: NumOrVar; p0?: NumOrVar };
  /** `normal`: a pitot probe reading p₀₂ behind its bow shock. */
  probe?: { p02: NumOrVar };
  /** `flatPlate`: lift and wave-drag coefficients. */
  cl?: NumOrVar;
  cd?: NumOrVar;
  /** Further values labelled under the picture. */
  more?: string[];
}

export type He2hSpec = WingSpec | DuctSpec | SupersonicFlowSpec;

/** Fields holding a word, not a value. */
const WORDS = new Set(['kind', 'mode', 'surface', 'branch']);

const ids = (x: unknown): string[] =>
  typeof x === 'string'
    ? [x]
    : Array.isArray(x)
      ? x.flatMap(ids)
      : x && typeof x === 'object'
        ? Object.entries(x).flatMap(([k, y]) => (WORDS.has(k) ? [] : ids(y)))
        : [];

/** The variable ids a group H picture reads (for the module tests). */
export function he2hSpecVars(r: He2hSpec): string[] {
  return ids(r);
}

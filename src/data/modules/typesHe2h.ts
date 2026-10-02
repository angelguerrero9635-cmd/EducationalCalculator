/**
 * College picture kinds of round 2, group H (docs/RENDERINGS_HE.md): HC24 `wing`. Kept apart
 * from `types.ts` so its union only names them. A `NumOrVar` is a fixed number or a variable id;
 * values are read in the variable's own unit, angles in degrees.
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

export type He2hSpec = WingSpec;

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

/** The variable ids a group H picture reads (for the module tests). */
export function he2hSpecVars(r: He2hSpec): string[] {
  const { kind: _k, mode: _m, ...rest } = r;
  const { pressure, ...others } = rest;
  return ids([
    ...Object.values(others),
    pressure ? [pressure.cp, pressure.speed].filter((x) => x !== undefined) : [],
  ]);
}

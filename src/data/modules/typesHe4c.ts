/**
 * College pictures, round 4, group C (docs/RENDERINGS_HE.md): HC99 `motionGraph` `polynomial`,
 * HC101 `impulse` `shape`, HC103 `pendulum` `rod`, HC104 the new kind `spacetime`, HC105
 * `photoelectric` `mode: 'compton'`, HC118 `freeBody` `slab`.
 * Kept apart from `types.ts` so the union only names them.
 *
 * Every string is a variable id; a `NumOrVar` is a fixed number or one. A value is read in its
 * variable's formula unit (the unit each field names); a "?" draws nothing for that value.
 */
import type { Representation } from './types';
import type { NumOrVar } from './typesGraphs';

// ─── HC99 motionGraph polynomial ─────────────────────────────────────────────

/**
 * Position as a cubic in time, x = c₀ + c₁t + c₂t² + c₃t³ (m, m/s, m/s², m/s³; t in s), with
 * v = dx/dt and a = dv/dt by the power rule: x–t, v–t and a–t stacked on one time axis, the
 * point at `at` on each, the tangent on x–t whose slope is v, and every turnaround (v = 0 where
 * v changes sign) ringed on x–t and v–t. Drag the point for t.
 */
export interface MotionPolynomial {
  c0: NumOrVar;
  c1: NumOrVar;
  c2: NumOrVar;
  c3: NumOrVar;
  /** The time t (s) marked on the three graphs. */
  at: NumOrVar;
  /** The page's x, v and a at t, when it names them. */
  position?: string;
  velocity?: string;
  acceleration?: string;
}

export interface MotionGraphHe4cSpec {
  kind: 'motionGraph';
  polynomial: MotionPolynomial;
  fixed?: boolean;
}

// ─── HC101 impulse shapes ────────────────────────────────────────────────────

/**
 * A force pulse on the F–t graph: a `rectangle` (a steady push), a `triangle` (up to the peak
 * half-way, then down) or a `halfSine` (F = Fₘₐₓ sin(πt ÷ Δt)) of `peak` Fₘₐₓ (N) lasting `time`
 * Δt (s). Its area is the impulse J = ∫F dt (Fₘₐₓ·Δt, ½Fₘₐₓ·Δt or (2 ÷ π)Fₘₐₓ·Δt), shaded and
 * written; the rectangle of the same area at the average force J ÷ Δt is dashed. With `mass`
 * (kg) a ball leaves at Δv = J ÷ m. Drag the peak for Fₘₐₓ and the pulse's end for Δt.
 */
export interface ImpulseShapeSpec {
  kind: 'impulse';
  shape: 'rectangle' | 'triangle' | 'halfSine';
  peak: NumOrVar;
  time: NumOrVar;
  /** J (N·s), the average force (N). */
  impulse?: string;
  average?: string;
  /** The mass (kg) the pulse acts on, and its change in speed Δv (m/s). */
  mass?: NumOrVar;
  change?: string;
  fixed?: boolean;
}

// ─── HC103 pendulum rod ──────────────────────────────────────────────────────

/**
 * A physical pendulum: a uniform rod of `length` L (m) on a pin `pivot` p (m) below its top end
 * (0, the default, hangs it from the end), swinging. The center of mass is marked at
 * d = L ÷ 2 − p below the pin, I = mL² ÷ 12 + md² (parallel axes, or the page's `inertia`), and
 * the simple pendulum of the same period, length I ÷ (md), is drawn dashed from the same pin.
 * T = 2π√(I ÷ (mgd)); `g` (m/s²) is the page's. Drag the center of mass for p (or the rod's end
 * for L when the pin is fixed).
 */
export interface PendulumRod {
  length: NumOrVar;
  pivot?: NumOrVar;
}

export interface PendulumRodSpec {
  kind: 'pendulum';
  rod: PendulumRod;
  /** kg and m/s². */
  mass: NumOrVar;
  g: NumOrVar;
  /** I about the pin (kg·m²), d (m), T (s) and the equivalent length I ÷ (md) (m). */
  inertia?: string;
  distance?: string;
  period?: string;
  equivalent?: string;
  fixed?: boolean;
}

// ─── HC104 spacetime (new kind) ──────────────────────────────────────────────

/**
 * A Minkowski diagram, x across and ct up on one scale, the light lines x = ±ct at 45°.
 *
 * - `lorentz`: the frame S′ moving at `speed` β = v ÷ c, its ct′ axis (x = βct) and x′ axis
 *   (ct = βx) tilted toward the light line by tan⁻¹β; the event at (`x`, `ct`) (m) read on both
 *   sets of axes with dashed lines parallel to each, x′ = γ(x − βct) and ct′ = γ(ct − βx), and
 *   the invariant hyperbola (ct)² − x² = s² through it. Drag the event.
 * - `addition`: world lines from the origin: S′ moving at `speed` v, an object moving at `other`
 *   u′ in S′, and the object in S at u = (v + u′) ÷ (1 + vu′), always inside the light line; the
 *   Galilean v + u′ dashed beside it (past the light line when it would beat c). Speeds in c.
 */
export type SpacetimeSpec = { kind: 'spacetime'; fixed?: boolean } & (
  | {
      mode: 'lorentz';
      speed: NumOrVar;
      x: NumOrVar;
      ct: NumOrVar;
      /** γ, x′ and ct′ (m), the interval s² = (ct)² − x² (m²). */
      gamma?: string;
      xPrime?: string;
      ctPrime?: string;
      interval?: string;
    }
  | {
      mode: 'addition';
      speed: NumOrVar;
      other: NumOrVar;
      /** u (in c). */
      result?: string;
    }
);

// ─── HC105 photoelectric compton ─────────────────────────────────────────────

/**
 * Compton scattering: a photon of `wavelength` λ (pm) hits a free electron at rest and leaves at
 * `angle` θ (°) with the longer λ′ = λ + (h ÷ mₑc)(1 − cos θ); the electron recoils at φ below
 * the axis. The photons are drawn as waves and every arrow to one momentum scale (p ∝ 1 ÷ λ),
 * with pₑ copied dashed from p′'s tip to close p = p′ + pₑ; under it λ and λ′ as wave strips to
 * one scale, six waves each, the gap 6Δλ bracketed. Energies in keV: E = hc ÷ λ. Drag the
 * scattered photon round for θ.
 */
export interface PhotoelectricComptonSpec {
  kind: 'photoelectric';
  mode: 'compton';
  wavelength: NumOrVar;
  angle: NumOrVar;
  /** Δλ and λ′ (pm); E, E′ and the electron's K (keV); the electron's angle φ (°). */
  shift?: string;
  scattered?: string;
  energy?: string;
  scatteredEnergy?: string;
  kinetic?: string;
  electronAngle?: string;
  /** The page's constants: h ÷ (mₑc) in pm (default 2.426) and hc in keV·pm (default 1240). */
  compton?: number;
  hc?: number;
  fixed?: boolean;
}

// ─── HC118 freeBody slab ─────────────────────────────────────────────────────

/**
 * An infinite slope in section: a slab of soil (or a glacier's ice) on a slope of `angle` θ (or
 * the ice surface's α, °), `thickness` z (vertical depth to the slip surface, or the ice
 * thickness H, m), over a dashed slip surface (soil) or bedrock (ice). The stresses on the base
 * as arrows to one scale: σ = γz cos²θ pressing on it, τ = γz sin θ cos θ driving it downslope
 * and the strength s = c + σ tan φ against τ; FS = s ÷ τ, and "slides" exactly when FS < 1.
 * Ice: the basal shear τ_b = ρgH sin α (kPa), with `g` from the page. The slope's angle is true;
 * the depth is not to scale (the slab is long next to it). Drag the slope's foot for θ.
 */
export interface FreeBodySlab {
  material: 'soil' | 'ice';
  thickness: NumOrVar;
  angle: NumOrVar;
  /** Soil: unit weight γ (kN/m³), cohesion c (kPa), friction angle φ (°). */
  unitWeight?: NumOrVar;
  cohesion?: NumOrVar;
  friction?: NumOrVar;
  /** Ice: density ρ (kg/m³) and g (m/s²). */
  density?: NumOrVar;
  g?: NumOrVar;
  /** σ, τ (τ_b for ice) and s (kPa); the factor of safety FS. */
  normal?: string;
  shear?: string;
  strength?: string;
  safety?: string;
}

export interface FreeBodySlabSpec {
  kind: 'freeBody';
  slab: FreeBodySlab;
  fixed?: boolean;
}

// ─── The union ───────────────────────────────────────────────────────────────

/** Group HE4C's options on kinds that exist (sent to He4cView before the kind's own picture). */
export type He4cOptionSpec =
  | MotionGraphHe4cSpec
  | ImpulseShapeSpec
  | PendulumRodSpec
  | PhotoelectricComptonSpec
  | FreeBodySlabSpec;

/** Every picture of group HE4C. */
export type He4cSpec = He4cOptionSpec | SpacetimeSpec;

/** Whether a picture is one of group HE4C's options on an existing kind. */
export function isHe4cOption(r: Representation): r is He4cOptionSpec {
  if (r.kind === 'motionGraph') return 'polynomial' in r;
  if (r.kind === 'impulse') return 'shape' in r;
  if (r.kind === 'pendulum') return 'rod' in r;
  if (r.kind === 'photoelectric') return 'mode' in r && r.mode === 'compton';
  if (r.kind === 'freeBody') return 'slab' in r;
  return false;
}

const ids = (...xs: (NumOrVar | undefined)[]) =>
  xs.filter((x): x is string => typeof x === 'string');

/** Every variable id a group-HE4C picture reads (modules.test.ts). */
export function he4cSpecVars(r: He4cSpec): string[] {
  switch (r.kind) {
    case 'motionGraph': {
      const p = r.polynomial;
      return ids(p.c0, p.c1, p.c2, p.c3, p.at, p.position, p.velocity, p.acceleration);
    }
    case 'impulse':
      return ids(r.peak, r.time, r.impulse, r.average, r.mass, r.change);
    case 'freeBody': {
      const b = r.slab;
      return ids(
        b.thickness,
        b.angle,
        b.unitWeight,
        b.cohesion,
        b.friction,
        b.density,
        b.g,
        b.normal,
        b.shear,
        b.strength,
        b.safety,
      );
    }
    case 'photoelectric':
      return ids(
        r.wavelength,
        r.angle,
        r.shift,
        r.scattered,
        r.energy,
        r.scatteredEnergy,
        r.kinetic,
        r.electronAngle,
      );
    case 'spacetime':
      return r.mode === 'lorentz'
        ? ids(r.speed, r.x, r.ct, r.gamma, r.xPrime, r.ctPrime, r.interval)
        : ids(r.speed, r.other, r.result);
    case 'pendulum':
      return ids(
        r.rod.length,
        r.rod.pivot,
        r.mass,
        r.g,
        r.inertia,
        r.distance,
        r.period,
        r.equivalent,
      );
  }
}

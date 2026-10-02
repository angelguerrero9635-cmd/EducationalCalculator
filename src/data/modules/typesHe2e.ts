/**
 * College pictures, round 2, group E (docs/RENDERINGS_HE.md): options on `induction` (HC19,
 * field sources and sliding rails) and on `charges` (HC29, Gauss surfaces and continuous
 * distributions). Every value is SI in the page's formula units (T, A, m, C, N/C); constants
 * come from the page (`mu0`, `k` or `eps0`), with μ₀ = 4π × 10⁻⁷ and k = 8.99 × 10⁹ the
 * defaults. A field naming a worked-out value is checked by the harness (picturesHe2e.ts).
 */
import type { NumOrVar } from './typesGraphs';

const ids = (...xs: (NumOrVar | undefined)[]) =>
  xs.filter((x): x is string => typeof x === 'string');

// ─── HC19 induction: field sources ───────────────────────────────────────────

interface FieldCommon {
  mode: 'field';
  /** μ₀ in T·m/A (default 4π × 10⁻⁷). */
  mu0?: number;
  /** The current I (A); `plates`: the charging current in the wires. */
  current: NumOrVar;
  /** B where the picture marks it (T), checked against the source's formula. */
  field?: string;
}

/**
 * `induction` `mode: 'field'`: a source of magnetic field with its B lines and an Amperian
 * loop (or the axis point) where B is read.
 *
 * - `wire`: a long straight wire end-on, current out of the page (• ; × with I < 0), B
 *   circles round it by the right-hand rule, the Amperian circle at `r` dashed and B there.
 *   With `radius` a the wire is thick with even current: B = μ₀Ir/(2πa²) inside, μ₀I/(2πr)
 *   outside, and a small B(r) graph under it with the peak at the surface (`region` for a page
 *   whose rule is one side's). `H` names
 *   H = I/(2πr) (A/m, electrical pages). `second` I₂ draws a parallel wire at r with the force
 *   per length `force` (N/m, + attract) on each.
 * - `loop`: a loop of `turns` N (default 1), radius R, in perspective, its traced B lines in
 *   the plane through the axis, B₀ at the center (`center`) and B at `z` on the axis. With
 *   `uniform` the loop sits in a uniform field instead: its moment μ = NIA at θ to B and the
 *   torque τ = μB sin θ.
 * - `solenoid`: N turns over length ℓ, the B lines traced from the turns: straight and evenly
 *   spaced inside, B = μ₀nI; `area` A gives the drawn diameter (to scale, or widened and said),
 *   `perLength` n, `inductance` L = μ₀N²A/ℓ, `energy` U = ½LI².
 * - `toroid`: N turns round a ring seen from above, the B circle inside the windings at r,
 *   B = μ₀NI/(2πr), and B = 0 outside said.
 * - `plates`: round plates of radius R charging at I, seen at a slant; the Amperian circle at
 *   r between them, its displacement current I_d = I(r/R)² shaded, B = μ₀I_d/(2πr) round it,
 *   `rate` dE/dt = I/(ε₀πR²).
 */
export type InductionField = FieldCommon &
  (
    | {
        source: 'wire';
        r: NumOrVar;
        radius?: NumOrVar;
        /**
         * A page whose rule holds on one side of the surface only: its B is checked with that
         * side's formula, and an r on the other side draws faded with the reason.
         */
        region?: 'inside' | 'outside';
        H?: string;
        second?: NumOrVar;
        force?: string;
      }
    | {
        source: 'loop';
        radius: NumOrVar;
        turns?: NumOrVar;
        z?: NumOrVar;
        center?: string;
        uniform?: {
          field: NumOrVar;
          angle: NumOrVar;
          area: NumOrVar;
          moment?: string;
          torque?: string;
          energy?: string;
        };
      }
    | {
        source: 'solenoid';
        turns: NumOrVar;
        length: NumOrVar;
        area?: NumOrVar;
        perLength?: string;
        inductance?: string;
        energy?: string;
      }
    | { source: 'toroid'; turns: NumOrVar; r: NumOrVar }
    | {
        source: 'plates';
        radius: NumOrVar;
        r: NumOrVar;
        displacement?: string;
        rate?: string;
        /** ε₀ for dE/dt (default 8.85 × 10⁻¹²). */
        eps0?: number;
      }
  );

/**
 * `induction` `rails`: a top view of a copper rod of length L sliding at v on two steel rails
 * closed by R, in B square to the loop (× into the page, or • with `out`). The induced current
 * runs round the loop by Lenz's law and the force F = BIL on the rod points against v.
 * ε = BLv, I = ε/R, F = BIL, P = Fv; each named value is checked.
 */
export interface InductionRails {
  mode?: undefined;
  rails: {
    B: NumOrVar;
    L: NumOrVar;
    v: NumOrVar;
    R?: NumOrVar;
    emf?: string;
    I?: string;
    F?: string;
    P?: string;
    out?: boolean;
  };
}

/** The variables an HC19 option reads. */
export function he2eInductionVars(r: InductionField | InductionRails): string[] {
  if ('rails' in r) {
    const x = r.rails;
    return ids(x.B, x.L, x.v, x.R, x.emf, x.I, x.F, x.P);
  }
  const base = ids(r.current, r.field);
  switch (r.source) {
    case 'wire':
      return [...base, ...ids(r.r, r.radius, r.H, r.second, r.force)];
    case 'loop': {
      const u = r.uniform;
      return [
        ...base,
        ...ids(r.radius, r.turns, r.z, r.center),
        ...(u ? ids(u.field, u.angle, u.area, u.moment, u.torque, u.energy) : []),
      ];
    }
    case 'solenoid':
      return [...base, ...ids(r.turns, r.length, r.area, r.perLength, r.inductance, r.energy)];
    case 'toroid':
      return [...base, ...ids(r.turns, r.r)];
    case 'plates':
      return [...base, ...ids(r.radius, r.r, r.displacement, r.rate)];
  }
}

/** Whether an `induction` spec is one of the HC19 options. */
export const isHe2eInduction = (r: object): r is InductionField | InductionRails =>
  'rails' in r || (r as { mode?: string }).mode === 'field';

// ─── HC29 charges: Gauss surfaces and continuous distributions ───────────────

interface ElectricConstants {
  /** k in N·m²/C² (default 8.99 × 10⁹); or give `eps0` instead. One sets the other. */
  k?: number;
  /** ε₀ in C²/(N·m²), for pages that write ε₀ (then k = 1/(4πε₀)). */
  eps0?: number;
  fixed?: boolean;
}

/**
 * `charges` `gauss`: a charge and a dashed Gaussian surface at r with E arrows on it and the
 * enclosed charge shaded.
 *
 * - `sphere`: Q (C) in a ball of radius R (a point charge without R), a sphere at r;
 *   E = kQ_enc/r² with Q_enc = Q(r/R)³ inside, Q outside, and an E(r) graph under it. `flux`
 *   Φ = Q_enc/ε₀, `enclosed` Q_enc.
 * - `line`: λ (C/m) on a long rod (or a solid cylinder of radius R), a cylinder of radius r;
 *   E = 2kλ_enc/r = λ_enc/(2πε₀r).
 * - `plane`: σ (C/m²) on a sheet, a pillbox through it; E = σ/(2ε₀) either side, the same at
 *   every distance; `between` names σ/ε₀ between two opposite sheets (drawn edge-on beside).
 *
 * `region` is the page's rule for one side of R (sphere, line); r on the other side draws faded
 * with the reason.
 */
export interface ChargesGauss extends ElectricConstants {
  kind: 'charges';
  mode?: undefined;
  gauss: {
    shape: 'sphere' | 'line' | 'plane';
    Q: NumOrVar;
    r?: NumOrVar;
    R?: NumOrVar;
    E?: string;
    flux?: string;
    enclosed?: string;
    between?: string;
    region?: 'inside' | 'outside';
  };
}

/**
 * `charges` `distribution`: a ring (charge Q, radius R) or a disk (σ, radius R) in perspective
 * with a point P on its axis at z: dE from two opposite pieces, their sideways parts cancelling,
 * and E_z summed (`field`); a ring's `potential` V = kQ/√(z² + R²); a disk's `sheet` limit
 * 2πkσ drawn dashed beside E. `image`: a charge q (C) at height z = d over a grounded plane, the
 * image −q dashed at −d, field lines meeting the plane square, the induced σ shaded; `force`
 * F = kq²/(2d)² toward the plane, `density` σ₀ = −q/(2πd²) under it, `induced` −q.
 */
export interface ChargesDistribution extends ElectricConstants {
  kind: 'charges';
  mode?: undefined;
  distribution: 'ring' | 'disk' | 'image';
  charge: NumOrVar;
  z: NumOrVar;
  radius?: NumOrVar;
  field?: string;
  potential?: string;
  sheet?: string;
  force?: string;
  density?: string;
  induced?: string;
}

/** The variables an HC29 option reads. */
export function he2eChargesVars(r: ChargesGauss | ChargesDistribution): string[] {
  if ('gauss' in r) {
    const g = r.gauss;
    return ids(g.Q, g.r, g.R, g.E, g.flux, g.enclosed, g.between);
  }
  return ids(r.charge, r.z, r.radius, r.field, r.potential, r.sheet, r.force, r.density, r.induced);
}

/** Whether a `charges` spec is one of the HC29 options. */
export const isHe2eCharges = (r: object): r is ChargesGauss | ChargesDistribution =>
  'gauss' in r || 'distribution' in r;

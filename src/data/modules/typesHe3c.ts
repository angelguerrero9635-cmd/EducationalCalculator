/**
 * College picture options of round 3, group C (docs/RENDERINGS_HE.md): HC53 `polarGrid` areas,
 * regions, tangent and cycloid. Kept apart from the shared type files, which name them in a
 * line each. A `NumOrVar` is a fixed number or a variable id; every option is off unless a page
 * sets it.
 */
import type { NumOrVar } from './typesGraphs';

// ─── HC53: polarGrid ─────────────────────────────────────────────────────────

/** x = r(t − sin t), y = r(1 − cos t): a point on a rolling circle of radius r (t in radians). */
export interface CycloidPathHe3c {
  family: 'cycloid';
  r: NumOrVar;
}

/** The `polarGrid` options HC53 adds (θ in degrees, as the curve's). */
export interface PolarGridHe3c {
  /**
   * The region the curve sweeps from θ = `from` to `to`, shaded from the pole, with
   * A = ½∫ r² dθ worked in the caption; `value` (a variable id) is checked against it.
   */
  area?: { from: NumOrVar; to: NumOrVar; value?: string };
  /**
   * An annular sector r₁ ≤ r ≤ r₂, `from` ≤ θ ≤ `to`, shaded with its edges marked; `area` is
   * checked as ½(β − α)(r₂² − r₁²) (radians).
   */
  region?: { r1: NumOrVar; r2: NumOrVar; from: NumOrVar; to: NumOrVar; area?: string };
  /**
   * The tangent to the curve at `point`, drawn through it; `slope` (a variable id) is checked
   * against dy/dx = (r′ sin θ + r cos θ) ÷ (r′ cos θ − r sin θ).
   */
  tangent?: true | { slope?: string };
}

/** The parametric options HC53 adds. */
export interface ParametricHe3c {
  /** t in radians, labelled in multiples of π where it lands on one (t = 3π/2). */
  radians?: boolean;
  /** The traced length from the range's start to t, worked by summing the path; checked. */
  length?: string;
}

/** The variable ids the HC53 options name (for the module tests). */
export function polarGridHe3cVars(r: PolarGridHe3c): string[] {
  const t = r.tangent && r.tangent !== true ? r.tangent.slope : undefined;
  return ids(
    r.area?.from,
    r.area?.to,
    r.area?.value,
    r.region?.r1,
    r.region?.r2,
    r.region?.from,
    r.region?.to,
    r.region?.area,
    t,
  );
}

const ids = (...xs: (NumOrVar | undefined)[]) =>
  xs.filter((x): x is string => typeof x === 'string');

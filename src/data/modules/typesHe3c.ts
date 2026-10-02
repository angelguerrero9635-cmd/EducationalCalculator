/**
 * College picture options of round 3, group C (docs/RENDERINGS_HE.md): HC53 `polarGrid` areas,
 * regions, tangent and cycloid. Kept apart from the shared type files, which name them in a
 * line each. A `NumOrVar` is a fixed number or a variable id; every option is off unless a page
 * sets it.
 */
import type { NumOrVar } from './typesGraphs';

/** The variable ids among some fields. */
const ids = (...xs: (NumOrVar | undefined)[]) =>
  xs.filter((x): x is string => typeof x === 'string');

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

// ─── HC54: related rates and pumping work ────────────────────────────────────

/**
 * `rightTriangle` with `rates`: the triangle drawn large (no side squares), each side's rate
 * (an id, its sign the way the side changes) as an arrow at the end that moves, and the
 * caption working a·a′ + b·b′ = c·c′ from a² + b² = c² (a side with no rate is fixed, rate 0).
 * `scene` draws it as a ladder against a wall or two roads meeting at a right angle.
 */
export interface RightTriangleHe3c {
  rates?: { a?: string; b?: string; c?: string };
  scene?: 'ladder' | 'roads';
  /** Values held while the foot is dragged (the ladder holds c). */
  keep?: string[];
  /** No drag. */
  fixed?: boolean;
}

/**
 * `curvedSolid` options. `fill` (shape 'cone'): the cone stands on its apex as a tank, water
 * to `depth` with the surface radius r = R·depth ÷ H (`r`, checked), the inflow poured in and
 * the surface's rise dh/dt = inflow ÷ (πr²) (`rise`, checked). `slab` (shape 'cylinder'): a
 * full tank with a thin layer at height `y` lifted to the outlet `above` the rim; its lift
 * H + above − y (`lift`, checked) and the whole tank's work ρgπr²(H²/2 + above·H) (`work`,
 * checked with the page's `density` and `g`).
 */
export interface CurvedSolidHe3c {
  fill?: { depth: NumOrVar; r?: string; inflow?: NumOrVar; rise?: string };
  slab?: {
    y: NumOrVar;
    above?: NumOrVar;
    lift?: string;
    density?: NumOrVar;
    g?: NumOrVar;
    work?: string;
  };
}

/** The variable ids the HC54 options name (for the module tests). */
export function rightTriangleHe3cVars(r: RightTriangleHe3c): string[] {
  return ids(r.rates?.a, r.rates?.b, r.rates?.c);
}

/** The variable ids the HC54 options name (for the module tests). */
export function curvedSolidHe3cVars(r: CurvedSolidHe3c): string[] {
  const { fill: f, slab: s } = r;
  return ids(
    f?.depth,
    f?.r,
    f?.inflow,
    f?.rise,
    s?.y,
    s?.above,
    s?.lift,
    s?.density,
    s?.g,
    s?.work,
  );
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

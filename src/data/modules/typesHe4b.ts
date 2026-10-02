/**
 * College picture options of round 4, group B (docs/RENDERINGS_HE.md): `vectorDiagram`
 * `project`, `masses`, `forces` and `cone` (HC96, HC100, HC171, HC108) and `rotor` `rolling`,
 * `rod`, `precession` and `plate` (HC102, HC106, HC107). Every option is off unless a page sets
 * it, so existing pages draw as before. A `NumOrVar` is a fixed number or a variable id; every
 * other string names a variable the page works out (checked by harness/picturesHe4b.ts).
 */
import type { NumOrVar } from './typesGraphs';

/** Component ids a page works out for a vector (any left out are not checked). */
export interface PartsOf {
  x?: string;
  y?: string;
  z?: string;
}

/**
 * HC96: the projection of the first vector u onto the second v, proj_v u = (u·v ÷ v·v)v,
 * drawn along v (v's line dashed through the origin), the perpendicular part u − proj_v u
 * dashed from the projection's tip to u's tip with a right-angle mark. With `space` (and z on
 * each vector) it is drawn on x, y, z axes, and the perpendicular part is also drawn from the
 * origin as Gram–Schmidt's next vector. `proj` and `perp` name the page's components, `k` the
 * factor u·v ÷ v·v, `dot` u·v (all checked). Drag u's tip in the plane.
 */
export interface ProjectOf {
  proj?: PartsOf;
  perp?: PartsOf;
  k?: string;
  dot?: string;
  /** Names drawn at the tips: the projection ("proj_v u") and the perpendicular part. */
  projName?: string;
  perpName?: string;
}

/** HC100: a point mass m (kg) at x (and y, m). */
export interface MassOf {
  m: NumOrVar;
  x: NumOrVar;
  y?: NumOrVar;
  name?: string;
}

/**
 * HC171: a force by its size and its direction, either `direction` (degrees from +x,
 * counterclockwise) or `level` (degrees from the horizontal) pointing `left` and/or `down`.
 */
export interface ForceOf {
  name: string;
  magnitude: NumOrVar;
  direction?: NumOrVar;
  level?: NumOrVar;
  left?: boolean;
  down?: boolean;
}

/**
 * HC171: two to four forces from one point, each angle from the horizontal marked, and beside
 * them the force polygon tip to tail: it closes when the forces balance (`equilibrium`), else
 * the resultant runs from the first tail to the last tip. The resultant's values come from
 * `vectors[0]` (name, x, y, magnitude, direction; checked against the sum).
 */
export interface ForcesOf {
  list: ForceOf[];
  equilibrium?: boolean;
}

/**
 * HC108: the vector model of orbital angular momentum: L of length √(ℓ(ℓ + 1)) (in ħ) on its
 * cone about z at height m (L_z = mħ), every one of the 2ℓ + 1 cones faint, θ marked from z.
 * `size` |L|, `lz` L_z, `angle` θ (degrees) and `states` 2ℓ + 1 name the page's values
 * (checked). Drag L's tip up or down for m.
 */
export interface ConeOf {
  l: NumOrVar;
  m: NumOrVar;
  size?: string;
  lz?: string;
  angle?: string;
  states?: string;
}

/** Options on `vectorDiagram` (HC96, HC100, HC108, HC171). */
export interface VectorDiagramHe4b {
  project?: ProjectOf;
  /**
   * HC100: point masses on a ruler (or a plane, when any has y), balls sized by mass; the
   * balance point x_cm = Σmx ÷ Σm marked by a triangle under the line (a ⊕ on a plane).
   * `vectors[0].name` names it ("x_cm"); drag a mass along the ruler.
   */
  masses?: MassOf[];
  /** HC100: the page's center-of-mass values (checked) and the total mass. */
  centerOfMass?: { x?: string; y?: string; total?: string };
  forces?: ForcesOf;
  cone?: ConeOf;
}

/**
 * HC102: rolling down a ramp of drop h without slipping: the body (by `shape` c in I = cmr²)
 * faded at the top and solid at the bottom with v and ω, and bars K_t + K_r = mgh. `shapes`
 * races several (c values) side by side at the bottom. `g` (default 9.8, physics) comes from
 * the page. `speed` v, `spin` ω, `kt`, `kr` name the page's values (checked).
 */
export interface RollingOf {
  height: NumOrVar;
  shapes?: NumOrVar[];
  g?: NumOrVar;
  speed?: string;
  spin?: string;
  kt?: string;
  kr?: string;
}

/**
 * HC102: a uniform rod of `length` L and the rotor's `mass` M: the center axis dashed, the
 * turning axis lit a distance d from it (d bracketed; `axis: 'end'` puts it at L/2), and a bar
 * I = I_cm + Md². `icm` and `inertia` name the page's values (checked).
 */
export interface RodOf {
  length: NumOrVar;
  d?: NumOrVar;
  axis?: 'center' | 'end';
  icm?: string;
  inertia?: string;
}

/**
 * HC106: a gyroscope on a pivot: the rotor (`mass` m, `radius` R, I = ½mR² unless `inertia` is
 * given) spinning at ω (`omega`, rad/s) on a level axle r from the pivot; L along the axle, mg
 * down, τ = mgr sideways and the precession circle with Ω = τ ÷ L. `L`, `torque`, `rate`
 * Ω and `period` T_p name the page's values (checked).
 */
export interface PrecessionOf {
  r: NumOrVar;
  omega: NumOrVar;
  g?: NumOrVar;
  L?: string;
  torque?: string;
  rate?: string;
  period?: string;
}

/**
 * HC107: a thin a × b plate (the rotor's `mass` M) drawn to scale with its three principal
 * axes, each moment written on it (I₁ = Mb²/12 about the axis along a, I₂ = Ma²/12 along b,
 * I₃ = I₁ + I₂ square to the plate); the middle one marked "tumbles". `i1`, `i2`, `i3` name the
 * page's values (checked).
 */
export interface PlateOf {
  a: NumOrVar;
  b: NumOrVar;
  i1?: string;
  i2?: string;
  i3?: string;
}

/** Options on `rotor` (HC102, HC106, HC107). */
export interface RotorHe4b {
  rolling?: RollingOf;
  rod?: RodOf;
  precession?: PrecessionOf;
  plate?: PlateOf;
}

const ids = (...xs: (NumOrVar | undefined)[]) =>
  xs.filter((x): x is string => typeof x === 'string');
const parts = (p?: PartsOf) => ids(p?.x, p?.y, p?.z);

/** Whether a vectorDiagram spec uses this group's options (then VectorHe4b draws it). */
export const isVectorHe4b = (s: VectorDiagramHe4b) =>
  !!(s.project || s.masses || s.forces || s.cone);

/** Whether a rotor spec uses this group's options (then RotorHe4b draws it). */
export const isRotorHe4b = (s: RotorHe4b) => !!(s.rolling || s.rod || s.precession || s.plate);

/** The variable ids this group's options name (for the module tests). */
export function he4bSpecVars(spec: { kind: string }): string[] {
  const out: string[] = [];
  const r = spec as { kind: string } & VectorDiagramHe4b & RotorHe4b;
  if (r.kind === 'vectorDiagram') {
    const p = r.project;
    if (p) out.push(...parts(p.proj), ...parts(p.perp), ...ids(p.k, p.dot));
    for (const m of r.masses ?? []) out.push(...ids(m.m, m.x, m.y));
    const c = r.centerOfMass;
    if (c) out.push(...ids(c.x, c.y, c.total));
    for (const f of r.forces?.list ?? []) out.push(...ids(f.magnitude, f.direction, f.level));
    const k = r.cone;
    if (k) out.push(...ids(k.l, k.m, k.size, k.lz, k.angle, k.states));
  }
  if (r.kind === 'rotor') {
    const q = r.rolling;
    if (q) out.push(...ids(q.height, q.g, q.speed, q.spin, q.kt, q.kr, ...(q.shapes ?? [])));
    const d = r.rod;
    if (d) out.push(...ids(d.length, d.d, d.icm, d.inertia));
    const p = r.precession;
    if (p) out.push(...ids(p.r, p.omega, p.g, p.L, p.torque, p.rate, p.period));
    const t = r.plate;
    if (t) out.push(...ids(t.a, t.b, t.i1, t.i2, t.i3));
  }
  return out;
}

/**
 * College pictures, round 3, group B (docs/RENDERINGS_HE.md): the new kinds `surfacePlot` (HC46)
 * and `solidOfRevolution` (HC65), and the `vectorDiagram` `space` objects (HC47). Kept apart from
 * `types.ts` and `typesHs3b.ts` so those gain a line each. A `NumOrVar` field is a fixed number or
 * a variable id; an expression is in the HC10 grammar (`exprHe1e.ts`), its other names value ids.
 */
import { namesOf, parseExpr } from '@/components/module/reps/exprHe1e';

import type { NumOrVar } from './typesGraphs';

const ids = (...xs: (NumOrVar | undefined)[]) =>
  xs.filter((x): x is string => typeof x === 'string');

/** The value ids an expression reads (its inputs left out), or [] when it doesn't parse. */
export function exprNamesHe3b(src: string | undefined, inputs: string[]): string[] {
  if (src === undefined) return [];
  try {
    return namesOf(parseExpr(src)).filter((n) => !inputs.includes(n));
  } catch {
    return [];
  }
}

/** A point or vector in space by its three coordinates. */
export type Triple = [NumOrVar, NumOrVar, NumOrVar];
/** The ids of three worked-out coordinates (checked). */
export interface IdTriple {
  x?: string;
  y?: string;
  z?: string;
}

// ─── HC46: surfacePlot ──────────────────────────────────────────────────────────

/**
 * HC46 `surfacePlot`: z = f(x, y) over a window, on the `vectorDiagram` `space` camera (drag the
 * turn handle to spin it about z). `f` is an expression in x and y ('a*x^2 + b*x*y + c*y^2 +
 * d*x + e*y', 'p*x*y + q'). Partials are worked out exactly from the expression.
 * - `point` (x₀, y₀): the point on the surface, its x-trace (y held) and y-trace (x held) drawn
 *   with their tangent lines, slopes f_x and f_y; `z`, `fx`, `fy`, `grad` (|∇f|) checked.
 * - `tangentPlane`: the plane z = f + f_x(x − x₀) + f_y(y − y₀), a patch round the point.
 * - `critical`: the point where ∇f = 0 (found from the expression), marked min, max or saddle
 *   by D = f_xx f_yy − f_xy²; `x`, `y`, `z`, `D` checked.
 * - `region` [a, b] × [c, d]: `boxes` × `boxes` prisms at their midpoint heights (below the
 *   floor drawn in the minus colour), `sum` their total and `value` the integral (checked).
 * - `view: 'contour'`: the top view instead: level curves, the one through the point heavy, ∇f
 *   at the point square to it; `direction` u with its rate D_u f (`rate`, checked); `constraint`
 *   p·x + q·y = k drawn as a line (a level curve touching it at the point).
 * `x` and `y` set the window (default: round the point, the critical point or the region).
 */
export interface SurfacePlotSpec {
  kind: 'surfacePlot';
  f: string;
  /** The function's letter in labels (default f). */
  name?: string;
  x?: [NumOrVar, NumOrVar];
  y?: [NumOrVar, NumOrVar];
  view?: 'surface' | 'contour';
  point?: {
    x: NumOrVar;
    y: NumOrVar;
    z?: string;
    fx?: string;
    fy?: string;
    grad?: string;
    /** Draw the x- and y-traces with their slopes (default true on the surface). */
    traces?: boolean;
  };
  tangentPlane?: boolean;
  critical?: { x?: string; y?: string; z?: string; D?: string };
  region?: {
    a: NumOrVar;
    b: NumOrVar;
    c: NumOrVar;
    d: NumOrVar;
    boxes?: NumOrVar;
    sum?: string;
    value?: string;
  };
  /** contour: a direction ⟨p, q⟩ from the point (made a unit vector) and D_u f there. */
  direction?: { x: NumOrVar; y: NumOrVar; rate?: string };
  /** contour: the constraint line p·x + q·y = k. */
  constraint?: { p: NumOrVar; q: NumOrVar; k: NumOrVar };
  keep?: string[];
  fixed?: boolean;
}

export function surfacePlotVars(r: SurfacePlotSpec): string[] {
  return [
    ...exprNamesHe3b(r.f, ['x', 'y']),
    ...ids(...(r.x ?? []), ...(r.y ?? [])),
    ...ids(r.point?.x, r.point?.y, r.point?.z, r.point?.fx, r.point?.fy, r.point?.grad),
    ...ids(r.critical?.x, r.critical?.y, r.critical?.z, r.critical?.D),
    ...ids(r.region?.a, r.region?.b, r.region?.c, r.region?.d, r.region?.boxes),
    ...ids(r.region?.sum, r.region?.value),
    ...ids(r.direction?.x, r.direction?.y, r.direction?.rate),
    ...ids(r.constraint?.p, r.constraint?.q, r.constraint?.k),
  ];
}

// ─── HC65: solidOfRevolution ───────────────────────────────────────────────────

/**
 * HC65 `solidOfRevolution`: the region under `f` (and over `g`, when given) on [from, to] turned
 * about an axis, drawn as a see-through solid with the region lit on its half-plane and one
 * slice at x = `at`: a disk (radius f), a washer (radii f and g) about the x-axis, or a shell
 * (radius x, height f − g) about the y-axis. `f` and `g` are expressions in x. `volume` is the
 * method's integral (checked against the integral worked out numerically); `radius` and `inner`
 * the slice's radii (disk, washer), `height` the shell's (checked). Drag the slice.
 */
export interface SolidOfRevolutionSpec {
  kind: 'solidOfRevolution';
  f: string;
  g?: string;
  from: NumOrVar;
  to: NumOrVar;
  axis: 'x' | 'y';
  method: 'disk' | 'washer' | 'shell';
  at?: NumOrVar;
  volume?: string;
  radius?: string;
  inner?: string;
  height?: string;
  keep?: string[];
  fixed?: boolean;
}

export function solidOfRevolutionVars(r: SolidOfRevolutionSpec): string[] {
  return [
    ...exprNamesHe3b(r.f, ['x']),
    ...exprNamesHe3b(r.g, ['x']),
    ...ids(r.from, r.to, r.at, r.volume, r.radius, r.inner, r.height),
  ];
}

// ─── HC47: vectorDiagram space objects ─────────────────────────────────────────

/**
 * HC47: objects in the `vectorDiagram` `space` scene (C3 vectors, curves, flux and Stokes'). With
 * any of them set, the scene draws the objects on the x, y, z axes, and each vector in `vectors`
 * is drawn from the object's anchor instead of the origin: the plane's point (the normal n), the
 * line's point (its direction v), the helix point r(t) (its velocity), the sphere's top (0, 0, r)
 * (the field there) or the circle's center (curl F). A zero vector is not drawn.
 * - `plane`: through `point`, square to the first vector n; `q` a point dropped to it along n,
 *   the foot F marked; `d` (n · P₀), `distance` |n · Q − d| ÷ |n| and `foot` checked.
 * - `line`: r(t) = `point` + t·v (v the first vector), the point at `t` marked; `meets` a plane
 *   n · r = d drawn as a patch round it; `at` the point's coordinates (checked).
 * - `curve.helix`: r(t) = ⟨a cos t, a sin t, ct⟩ for t from 0 to `T` (default one turn, 2π), the
 *   point at `t` (radians); `speed` √(a² + c²), `length` T·speed, `curvature` a ÷ (a² + c²) checked.
 * - `sphere`: radius r about the origin, with outward normals at eight points (`normals`); with
 *   `k`, F = k⟨x, y, z⟩ along them: `fn` F · n = kr and `flux` 4πkr³ (checked).
 * - `circle`: radius r at height z (default 0), run counterclockwise seen from above, F = k⟨−y,
 *   x, 0⟩ along it; `cap` its capping surface, a flat disk or a dome (or both); `circulation`
 *   2πkr² (checked).
 */
export interface SpaceObjectsHe3b {
  plane?: { point: Triple; q?: Triple; d?: string; distance?: string; foot?: IdTriple };
  line?: {
    point: Triple;
    t: NumOrVar;
    at?: IdTriple;
    meets?: { normal: Triple; d: NumOrVar };
  };
  curve?: {
    helix: { a: NumOrVar; c: NumOrVar };
    t: NumOrVar;
    T?: NumOrVar;
    speed?: string;
    length?: string;
    curvature?: string;
  };
  sphere?: { r: NumOrVar; normals?: boolean; k?: NumOrVar; fn?: string; flux?: string };
  circle?: {
    r: NumOrVar;
    z?: NumOrVar;
    k?: NumOrVar;
    cap?: 'disk' | 'dome' | 'both';
    circulation?: string;
  };
}

/** Whether a `space` sets any HC47 object. */
export const hasSpaceObjects = (s: SpaceObjectsHe3b | undefined) =>
  !!(s && (s.plane || s.line || s.curve || s.sphere || s.circle));

export function spaceObjectsVars(s: SpaceObjectsHe3b | undefined): string[] {
  if (!s) return [];
  const t3 = (t?: Triple) => ids(...(t ?? []));
  const i3 = (t?: IdTriple) => ids(t?.x, t?.y, t?.z);
  return [
    ...t3(s.plane?.point),
    ...t3(s.plane?.q),
    ...ids(s.plane?.d, s.plane?.distance),
    ...i3(s.plane?.foot),
    ...t3(s.line?.point),
    ...ids(s.line?.t),
    ...i3(s.line?.at),
    ...t3(s.line?.meets?.normal),
    ...ids(s.line?.meets?.d),
    ...ids(s.curve?.helix.a, s.curve?.helix.c, s.curve?.t, s.curve?.T),
    ...ids(s.curve?.speed, s.curve?.length, s.curve?.curvature),
    ...ids(s.sphere?.r, s.sphere?.k, s.sphere?.fn, s.sphere?.flux),
    ...ids(s.circle?.r, s.circle?.z, s.circle?.k, s.circle?.circulation),
  ];
}

export type He3bSpec = SurfacePlotSpec;

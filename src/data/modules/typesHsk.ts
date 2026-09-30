/**
 * Picture specs for the Grades 9–12 physics pictures of group HK (H58–H70 in
 * `pictureRequestsHs.ts`), kept apart from `types.ts` so that file's union only names them. A
 * `NumOrVar` field is a fixed number or a variable id; every other string is a variable id.
 */
import type { NumOrVar } from './typesGraphs';

const ids = (...xs: (NumOrVar | undefined)[]) =>
  xs.filter((x): x is string => typeof x === 'string');

// ─── H58 motionGraph (an option on the Grade 8 speed graph) ─────────────────

/**
 * High-school kinematics on a `motionGraph` with `graph: 'speed'` (its `start` is v₀, `speed`
 * the velocity v at the end of `time`, `acceleration` a and `distance` the displacement Δx).
 * Velocities are signed: a line that crosses the time axis turns the object round.
 *
 * - `view: 'velocity'`: v against t; the area between the line and the axis is shaded as the
 *   displacement, above the axis +, below it −, each part labelled, the net Δx and the distance
 *   travelled (the parts' sizes added) in the caption.
 * - `view: 'position'`: x against t, the curve x = x₀ + v₀t + ½at², and its tangent at time
 *   `at` whose slope is the velocity then (`slope`, v = v₀ + a × t₁), with a rise/run triangle.
 *   Drag the tangent point along the curve.
 *
 * Above either graph a strobe motion diagram dots the object's position at equal times, an
 * arrow on each dot for its velocity (the way back on a second row). `fixed` leaves out the
 * handles.
 */
export interface MotionKinematics {
  view: 'velocity' | 'position';
  /** The tangent's time t₁ (position view). */
  at?: string;
  /** The velocity at t₁: the tangent's slope. */
  slope?: string;
  /** The position at time 0 (default 0). */
  position?: NumOrVar;
  /** `false` leaves out the strobe diagram. */
  strobe?: boolean;
  fixed?: boolean;
}

// ─── H59 projectile ──────────────────────────────────────────────────────────

/**
 * A projectile launched at `speed` and `angle` (degrees above level) from `height` above flat
 * ground, drawn to scale (one unit the same both ways): the path, the ball at launch, at the top
 * and on landing (or at time `at`) with its velocity and the components vₓ (steady) and v_y
 * (changing), the maximum height H dashed and the range R along the ground. Drag the tip of the
 * launch velocity to change the angle. `parametric` names the path x(t), y(t) for the Grade 12
 * parametric page and marks the point at `at`. Gravity `g` defaults to 9.8 m/s².
 */
export interface ProjectileSpec {
  kind: 'projectile';
  speed: string;
  angle: string;
  height?: NumOrVar;
  g?: number;
  /** Flight time, range and maximum height, when the page names them. */
  time?: string;
  range?: string;
  peak?: string;
  /** The launch components, when the page names them. */
  vx?: string;
  vy?: string;
  /** A time t: the ball drawn there, its position (x, y) and velocity. */
  at?: string;
  /** Position at `at`, when the page names it. */
  x?: string;
  y?: string;
  parametric?: boolean;
  fixed?: boolean;
}

// ─── H60 freeBody ────────────────────────────────────────────────────────────

/**
 * A block and the forces on it, each arrow drawn from the block's center as long as its size
 * (one scale in N for all), labelled with its name and value:
 *
 * - `floor`: weight down, the normal force up, an `applied` force (or a rope's `tension`) at
 *   `appliedAngle` (`tensionAngle`) degrees above level, friction against the pull;
 * - `incline` at `incline` degrees (rising to the right): weight, the normal force at right
 *   angles to the slope, an applied force or rope up the slope, friction along it; the weight's
 *   components mg sin θ and mg cos θ dashed, with θ marked between the weight and mg cos θ;
 * - `hanging`: a rope's tension up and the weight (an elevator cable, a mass on a string).
 *
 * Friction is at most what stops the block: when `friction` (the most it can be, μN) is more
 * than the rest along the surface, it is static and matches the rest (net 0). The net force is
 * a separate arrow beside the block. `g` defaults to 9.8 N/kg.
 */
export interface FreeBodySpec {
  kind: 'freeBody';
  support: 'floor' | 'incline' | 'hanging';
  mass: string;
  g?: number;
  incline?: NumOrVar;
  weight?: string;
  normal?: string;
  /** The friction force (kinetic, or the most static friction can give). */
  friction?: string;
  /** The coefficient of friction μ, named in the caption. */
  mu?: string;
  applied?: NumOrVar;
  appliedAngle?: NumOrVar;
  tension?: NumOrVar;
  tensionAngle?: NumOrVar;
  /** The weight's component down the slope, mg sin θ (incline). */
  along?: string;
  /**
   * The block is already sliding this way (floor: right or left; incline: up or down the
   * slope): friction is kinetic, full size, against the motion, and `net` is counted + the
   * way it moves (negative: slowing down). Without it the block starts at rest.
   */
  moving?: 'right' | 'left' | 'up' | 'down';
  net?: string;
  acceleration?: string;
  fixed?: boolean;
}

// ─── H61 circularMotion ──────────────────────────────────────────────────────

/**
 * Motion on a circle and the pull of gravity:
 *
 * - `string`: a ball whirled on a string, seen from above: the circle of `radius`, the velocity
 *   tangent to it (drag its tip for the speed), the centripetal acceleration v²/r toward the
 *   center, the dashed straight path it would take if the string broke;
 * - `car`: a car rounding a curve of `radius`, friction toward the center as the centripetal
 *   force;
 * - `gravity`: two masses `distance` apart (not to scale), the equal and opposite pulls
 *   F = Gm₁m₂/r² (drag the second mass for r: the arrows follow the inverse square);
 * - `kepler`: an orbit as an ellipse of `semiMajor` (AU) and `eccentricity`, the sun at one
 *   focus and the empty focus marked, perihelion and aphelion, and two sectors swept in equal
 *   times (1/8 of the period each, from Kepler's equation) with equal areas; T² = a³.
 */
export interface CircularMotionSpec {
  kind: 'circularMotion';
  mode: 'string' | 'car' | 'gravity' | 'kepler';
  radius?: NumOrVar;
  speed?: NumOrVar;
  mass?: NumOrVar;
  /** The centripetal acceleration v²/r. */
  acceleration?: string;
  /** The centripetal force m v²/r (or the gravitational pull). */
  force?: string;
  /** Time for one turn (s), or the orbit's period in years (kepler). */
  period?: string;
  /** Gravity: the two masses (kg) and the distance between their centers (m). */
  masses?: [NumOrVar, NumOrVar];
  distance?: NumOrVar;
  /** Kepler: the semi-major axis in AU and the eccentricity (0 to 0.9). */
  semiMajor?: NumOrVar;
  eccentricity?: NumOrVar;
  /** Kepler: the closest and farthest distances from the sun (AU). */
  perihelion?: string;
  aphelion?: string;
  fixed?: boolean;
}

// ─── H62 collision ───────────────────────────────────────────────────────────

/**
 * Two carts on a track, before and after (velocities signed, + to the right), each with its
 * velocity and its momentum p = mv as arrows on one scale, and the total momentum built tip to
 * tail in each row (the same before and after).
 *
 * - `stick`: they couple and move on together at (m₁v₁ + m₂v₂)/(m₁ + m₂) (kinetic energy lost);
 * - `elastic`: they bounce apart with the kinetic energy kept;
 * - `explode`: they start together at `before[0]` and a spring pushes them apart; `after[0]`
 *   is the first cart's velocity, the second's follows from the momentum.
 *
 * `after` names the values the page solves for (one for `stick`, two otherwise); the picture
 * works them out from the masses and the velocities before, and the harness checks the page's.
 */
export interface CollisionSpec {
  kind: 'collision';
  type: 'stick' | 'elastic' | 'explode';
  masses: [NumOrVar, NumOrVar];
  before: [NumOrVar, NumOrVar?];
  after?: [NumOrVar, NumOrVar?];
  /** The total momentum, and the kinetic energy before and after, when the page names them. */
  momentum?: string;
  energy?: [string, string];
  fixed?: boolean;
}

// ─── The union and the variables each picture reads ──────────────────────────

/** New picture kinds of group HK. */
export type HskSpec = ProjectileSpec | FreeBodySpec | CircularMotionSpec | CollisionSpec;

/** Every variable id a group-HK picture reads (for modules.test.ts). */
export function hskSpecVars(r: HskSpec): string[] {
  switch (r.kind) {
    case 'projectile':
      return ids(r.speed, r.angle, r.height, r.time, r.range, r.peak, r.vx, r.vy, r.at, r.x, r.y);
    case 'freeBody':
      return ids(
        r.mass,
        r.incline,
        r.weight,
        r.normal,
        r.friction,
        r.mu,
        r.applied,
        r.appliedAngle,
        r.tension,
        r.tensionAngle,
        r.along,
        r.net,
        r.acceleration,
      );
    case 'circularMotion':
      return ids(
        r.radius,
        r.speed,
        r.mass,
        r.acceleration,
        r.force,
        r.period,
        ...(r.masses ?? []),
        r.distance,
        r.semiMajor,
        r.eccentricity,
        r.perihelion,
        r.aphelion,
      );
    case 'collision':
      return ids(...r.masses, ...r.before, ...(r.after ?? []), r.momentum, ...(r.energy ?? []));
  }
}

/** The variable ids the group-HK options on older kinds read (motionGraph, …). */
export function hskOptionVars(r: { kind: string }): string[] {
  const o = r as unknown as Record<string, unknown>;
  if (r.kind === 'motionGraph' && o.kinematics) {
    const k = o.kinematics as MotionKinematics;
    return ids(k.at, k.slope, k.position);
  }
  return [];
}

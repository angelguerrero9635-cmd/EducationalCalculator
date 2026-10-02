/**
 * College pictures, round 2, group F (docs/RENDERINGS_HE.md): the `freeBody` mechanics options
 * (HC20: pulley, ladder, tip, drum, banked; reps/FreeBodyHe.tsx). Every string is a variable id;
 * a `NumOrVar` is a fixed number or one. Constants (g) come from the page: a picture that needs
 * g takes the page's value. A spec with any of these options draws the college picture; a
 * `freeBody` without them (`support`) draws as before.
 */
import type { Representation } from './types';
import type { NumOrVar } from './typesGraphs';
import type { PlanetName } from './typesPhysics8';

// ─── HC20 freeBody mechanics options ─────────────────────────────────────────

/**
 * Two blocks joined by a rope over a pulley, each block with its own force diagram on one scale
 * (N) and the shared acceleration a as an arrow beside each, the way it moves:
 *
 * - `table`: m₁ slides on a table (W₁, N₁, kinetic friction μN₁ against the motion, T to the
 *   pulley), m₂ hangs from the rope at the table's edge (T up, W₂ down);
 * - `atwood`: both hang, m₁ on the left and m₂ on the right; a > 0 means m₂ goes down.
 *
 * A `pulleyMass` M (a uniform disk, I = ½MR²) makes the rope's two tensions differ: T on m₁'s
 * side, `T2` on m₂'s, T₂ − T₁ = ½Ma turns the pulley. a ≤ 0 on a table means friction holds:
 * nothing slides (a = 0, T = W₂ and static friction).
 */
export interface FbPulley {
  layout: 'table' | 'atwood';
  m1: NumOrVar;
  m2: NumOrVar;
  /** Kinetic coefficient on the table. */
  mu?: NumOrVar;
  a?: string;
  /** The tension on m₁'s side (the only one with a light pulley). */
  T?: string;
  /** The tension on m₂'s side, with a massive pulley. */
  T2?: string;
  pulleyMass?: NumOrVar;
}

/**
 * A uniform ladder on a rough floor against a smooth wall at `angle` θ (degrees, with the
 * floor): W at its middle, the wall's push N_w (level, away from the wall), the floor's N_f up
 * and the friction f toward the wall at the foot, one scale; the lever arms about the foot
 * dashed (½L cos θ for W, L sin θ for N_w). `mu` is the least μ_s = f ÷ N_f that holds it.
 */
export interface FbLadder {
  angle: NumOrVar;
  weight: NumOrVar;
  wall?: string;
  floor?: string;
  friction?: string;
  mu?: string;
}

/**
 * A crate `width` b wide on a floor, pushed level at `height` h: the push P, W at the center,
 * and at the tipping edge (the front bottom corner, ringed) N and the friction. P_tip = Wb ÷ (2h)
 * and P_slip = μ_sW: the smaller force governs and is the one drawn; the caption says whether
 * it tips or slips first. `crateHeight` (default h × 1.25, at least b ÷ 2) only shapes the box.
 */
export interface FbTip {
  width: NumOrVar;
  height: NumOrVar;
  weight: NumOrVar;
  mu: NumOrVar;
  tip?: string;
  slip?: string;
  crateHeight?: NumOrVar;
}

/**
 * A rope round a fixed drum, in contact over the wrap angle β (degrees; `radians` when the
 * page's value is in radians), the slack side T₁ on the left and the tight side T₂ on the
 * right, about to slip toward T₂: T₂ = T₁e^(μβ). Arrows on one scale; β arced over the contact.
 * Past 330° the rope is drawn at 330° with the turns written.
 */
export interface FbDrum {
  t1: NumOrVar;
  t2: NumOrVar;
  mu: NumOrVar;
  wrap: NumOrVar;
  radians?: boolean;
}

/**
 * A car in section (seen from behind) on a road banked at `angle` θ, the curve's center to the
 * left: mg down, N square to the road, N's parts dashed (N cos θ up, N sin θ to the center) and
 * the net force mv²/r level toward the center. With `mu` the car is at its top speed: friction
 * μN down the slope adds to the inward pull. Without `mass` the forces are written per mg.
 */
export interface FbBanked {
  angle: NumOrVar;
  radius?: NumOrVar;
  speed?: NumOrVar;
  mass?: NumOrVar;
  normal?: string;
  mu?: NumOrVar;
  /** The net (centripetal) force mv²/r. */
  net?: string;
}

// ─── HC25 freeBody aircraft ──────────────────────────────────────────────────

/**
 * An aircraft and the forces on it (HC25):
 *
 * - `side`: the airplane from the side flying right along a path climbing at `gamma` γ (°):
 *   L square to the path, W down, T forward and D back along it. L and W share one scale; T and
 *   D (far smaller in cruise) share a second, magnified by a nice factor that the picture names.
 *   In a climb W sin γ is dashed after D, so D + W sin γ lines up against T. `alpha` draws the
 *   relative wind at α to the fuselage; `elevator` δe (°, trailing edge up negative) deflects
 *   the elevator, drawn magnified in an inset.
 * - `front`: seen from the front, banked `phi` φ (°) into a turn to the right: L square to the
 *   wings, W down, L cos φ and L sin φ dashed. Without `weight` the forces read in W (L = nW).
 *   `factor` n, `speed` V, `radius` R and `rate` ω (rad/s, or °/s with `rateDegrees`) are
 *   written when the page names them; g comes from the page.
 * - `stability`: the airplane above its mean aerodynamic chord c̄, with the aerodynamic center
 *   `hac`, the center of gravity `h` and the neutral point `hn` (fractions of c̄) marked and the
 *   static margin `margin` = h_n − h bracketed: stable exactly when the CG is ahead (SM > 0).
 */
export interface FbAircraft {
  view: 'side' | 'front' | 'stability';
  weight?: NumOrVar;
  lift?: NumOrVar;
  thrust?: NumOrVar;
  drag?: NumOrVar;
  gamma?: NumOrVar;
  alpha?: NumOrVar;
  elevator?: NumOrVar;
  phi?: NumOrVar;
  factor?: string;
  speed?: NumOrVar;
  radius?: string;
  rate?: string;
  rateDegrees?: boolean;
  hac?: NumOrVar;
  h?: NumOrVar;
  hn?: NumOrVar;
  margin?: string;
}

/** `freeBody` with one college option (HC20, HC25). */
export type FreeBodyHe2fSpec = {
  kind: 'freeBody';
  /** g from the page (m/s²): 9.8 on physics pages, 9.81 on engineering pages. */
  g?: NumOrVar;
  fixed?: boolean;
} & (
  | { pulley: FbPulley }
  | { ladder: FbLadder }
  | { tip: FbTip }
  | { drum: FbDrum }
  | { banked: FbBanked }
  | { aircraft: FbAircraft }
);

// ─── HC35 circularMotion orbits and path coordinates ─────────────────────────

/**
 * A Hohmann transfer: the circular orbits r₁ and r₂ (dashed) round the central `body` at their
 * common center, the transfer half-ellipse (perigee on r₁, apogee on r₂, a = (r₁ + r₂) ÷ 2)
 * solid, its other half faint, and the burns Δv₁ at perigee and Δv₂ at apogee as arrows on one
 * scale. `mu` is μ = GM from the page, in the units of r and v (km³/s² with km and km/s, or
 * m³/s² with m and m/s); `tof` is π√(a³ ÷ μ) in seconds ÷ `tofScale` (3600 for hours, 86,400
 * for days). Round the Sun (`body: 'sun'`) the planets (`planets`) sit at departure and
 * arrival and Δv₁ is the hyperbolic excess `vinf`; the Sun is not to scale and says so.
 */
export interface CmHohmann {
  mode: 'hohmann';
  mu: NumOrVar;
  r1: NumOrVar;
  r2: NumOrVar;
  a?: string;
  v1?: string;
  vp?: string;
  va?: string;
  v2?: string;
  dv1?: string;
  dv2?: string;
  vinf?: string;
  tof?: string;
  tofScale?: number;
  body?: 'earth' | 'sun';
  /** The central body's radius (the units of r), for drawing it to scale. */
  bodyRadius?: NumOrVar;
  planets?: [PlanetName, PlanetName];
}

/**
 * An orbit as an ellipse of perigee `rp` and apogee `ra` round the body at a focus, with the
 * point where the distance is `r` (on the way out from perigee), r drawn from the focus and the
 * speed v = √(μ(2 ÷ r − 1 ÷ a)) as an arrow along the orbit beside v_p and v_a.
 */
export interface CmVisViva {
  mode: 'visViva';
  mu: NumOrVar;
  rp: NumOrVar;
  ra: NumOrVar;
  r: NumOrVar;
  a?: string;
  v?: string;
  body?: 'earth' | 'sun';
  bodyRadius?: NumOrVar;
}

/**
 * Two planets on circular orbits round the Sun with periods `t1` < `t2` (radii by Kepler's third
 * law, T^(2/3)), lined up at t = 0 (faint) and drawn where they are at `time` (default the
 * synodic period S, when they line up again): each angle 360° × t ÷ T. 1 ÷ S = 1 ÷ T₁ − 1 ÷ T₂.
 */
export interface CmPair {
  mode: 'pair';
  t1: NumOrVar;
  t2: NumOrVar;
  synodic?: string;
  time?: NumOrVar;
  planets?: [PlanetName, PlanetName];
}

/**
 * Path (normal–tangential) coordinates: a curved path with the particle at P, v along the
 * tangent, a_t along it (back when negative), a_n = v² ÷ ρ toward the center of curvature (ρ
 * drawn dashed, not to scale) and their sum a with its parallelogram.
 */
export interface CmTangential {
  mode: 'tangential';
  speed: NumOrVar;
  rho: NumOrVar;
  at: NumOrVar;
  an?: string;
  accel?: string;
}

/** `circularMotion` with one college mode (HC35). */
export type CircularMotionHe2fSpec = { kind: 'circularMotion'; fixed?: boolean } & (
  | CmHohmann
  | CmVisViva
  | CmPair
  | CmTangential
);

/** The college pictures of group HE2F. */
export type He2fSpec = FreeBodyHe2fSpec | CircularMotionHe2fSpec;

const FB_OPTIONS = ['pulley', 'ladder', 'tip', 'drum', 'banked', 'aircraft'] as const;

const CM_MODES = ['hohmann', 'visViva', 'pair', 'tangential'];

/** Whether a picture is one of group HE2F's (a college `freeBody` or `circularMotion` option). */
export function isHe2fSpec(r: Representation): r is He2fSpec {
  if (r.kind === 'freeBody') return FB_OPTIONS.some((k) => k in r);
  if (r.kind === 'circularMotion') return CM_MODES.includes(r.mode);
  return false;
}

const ids = (...xs: (NumOrVar | undefined)[]) =>
  xs.filter((x): x is string => typeof x === 'string');

/** Every variable id a group-HE2F picture reads (modules.test.ts). */
export function he2fSpecVars(r: He2fSpec): string[] {
  if (r.kind === 'circularMotion') {
    switch (r.mode) {
      case 'hohmann':
        return ids(r.mu, r.r1, r.r2, r.a, r.v1, r.vp, r.va, r.v2, r.dv1, r.dv2, r.vinf, r.tof)
          .concat(ids(r.bodyRadius));
      case 'visViva':
        return ids(r.mu, r.rp, r.ra, r.r, r.a, r.v, r.bodyRadius);
      case 'pair':
        return ids(r.t1, r.t2, r.synodic, r.time);
      case 'tangential':
        return ids(r.speed, r.rho, r.at, r.an, r.accel);
    }
  }
  const out = ids(r.g);
  if ('pulley' in r) {
    const p = r.pulley;
    out.push(...ids(p.m1, p.m2, p.mu, p.a, p.T, p.T2, p.pulleyMass));
  }
  if ('ladder' in r) {
    const l = r.ladder;
    out.push(...ids(l.angle, l.weight, l.wall, l.floor, l.friction, l.mu));
  }
  if ('tip' in r) {
    const t = r.tip;
    out.push(...ids(t.width, t.height, t.weight, t.mu, t.tip, t.slip, t.crateHeight));
  }
  if ('drum' in r) out.push(...ids(r.drum.t1, r.drum.t2, r.drum.mu, r.drum.wrap));
  if ('banked' in r) {
    const b = r.banked;
    out.push(...ids(b.angle, b.radius, b.speed, b.mass, b.normal, b.mu, b.net));
  }
  if ('aircraft' in r) {
    const a = r.aircraft;
    out.push(
      ...ids(a.weight, a.lift, a.thrust, a.drag, a.gamma, a.alpha, a.elevator, a.phi),
      ...ids(a.factor, a.speed, a.radius, a.rate, a.hac, a.h, a.hn, a.margin),
    );
  }
  return out;
}

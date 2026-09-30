/**
 * Picture specs for the Grades 9–12 physics pictures of group HK (H58–H70 in
 * `pictureRequestsHs.ts`), kept apart from `types.ts` so that file's union only names them. A
 * `NumOrVar` field is a fixed number or a variable id; every other string is a variable id.
 */
import type { NumOrVar } from './typesGraphs';
import type { PlanetName } from './typesPhysics8';

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
  /**
   * `false` leaves out the strobe diagram; `'vertical'` (H102) stands it up in a column left of
   * the graph, + up, for a dropped or thrown object.
   */
  strobe?: boolean | 'vertical';
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
  /** H105: a number for a launch that never changes (0° off a ledge): no handle. */
  angle: NumOrVar;
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
  /**
   * Floor (H102): the block moves `displacement` d (m) to the right, bracketed under the floor,
   * with the pull's part along it, F cos θ, dashed; `work` names W = Fd cos θ.
   */
  displacement?: NumOrVar;
  work?: string;
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
 *   times (1/8 of the period each, from Kepler's equation) with equal areas; T² = a³;
 * - `satellite` (H102): a satellite on a circular orbit of `radius` r (m) round a `central`
 *   mass M (kg): v = √(GM/r) along the orbit, GM/r² toward the center, the period T = 2πr/v
 *   (`speed`, `acceleration` and `period` name them). The central `body` is drawn in its
 *   colors (default Earth), to scale when its `bodyRadius` (m) is given. Drag the satellite
 *   for r.
 */
export interface CircularMotionSpec {
  kind: 'circularMotion';
  mode: 'string' | 'car' | 'gravity' | 'kepler' | 'satellite';
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
  /** Satellite: the central mass (kg), its look and its radius (m) for drawing to scale. */
  central?: NumOrVar;
  body?: PlanetName | 'sun';
  bodyRadius?: NumOrVar;
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
 *   is the first cart's velocity, the second's follows from the momentum;
 * - `general` (H102): any collision, `after[0]` the first cart's velocity after (given), the
 *   second's from the momentum; each cart's kinetic energy is labelled, and `lost` names the
 *   kinetic energy lost (before − after).
 *
 * `after` names the values the page solves for (one for `stick`, two otherwise); the picture
 * works them out from the masses and the velocities before, and the harness checks the page's.
 */
export interface CollisionSpec {
  kind: 'collision';
  type: 'stick' | 'elastic' | 'explode' | 'general';
  masses: [NumOrVar, NumOrVar];
  before: [NumOrVar, NumOrVar?];
  after?: [NumOrVar, NumOrVar?];
  /** The total momentum, and the kinetic energy before and after, when the page names them. */
  momentum?: string;
  energy?: [string, string];
  /** `general`: the kinetic energy lost, before − after (H102). */
  lost?: string;
  /** H105, `explode`: the energy the spring gives, after − before, labelled between the carts. */
  spring?: string;
  fixed?: boolean;
}

// ─── H63 simpleMachine, and the energyTrack option ──────────────────────────

/**
 * A simple machine lifting a `load` (N) with an `effort` (N), both arrows on one scale:
 *
 * - `lever`: a plank on a fulcrum, the load at `loadArm` from it and the effort at `effortArm`
 *   (m), drawn to scale; ideal mechanical advantage = effort arm/load arm;
 * - `pulley`: a block and tackle with `strands` supporting strands (1 to 6; 1 is a single fixed
 *   pulley), each sheave drawn; ideal MA = the number of supporting strands;
 * - `incline`: a crate pushed up a ramp of `length` rising `height`; ideal MA = length/height.
 *
 * `efficiency` (percent, default 100) makes the actual effort ideal effort ÷ efficiency.
 * `effortDistance` and `loadDistance` are how far each moves (work in = effort × its distance).
 */
export interface SimpleMachineSpec {
  kind: 'simpleMachine';
  machine: 'lever' | 'pulley' | 'incline';
  load: NumOrVar;
  effort?: string;
  advantage?: string;
  effortArm?: NumOrVar;
  loadArm?: NumOrVar;
  strands?: NumOrVar;
  length?: NumOrVar;
  height?: NumOrVar;
  efficiency?: NumOrVar;
  effortDistance?: string;
  loadDistance?: string;
  fixed?: boolean;
}

/**
 * An `energyTrack` option (H63): a spring launcher, a rough patch of floor and a smooth ramp.
 * The spring (`k` N/m, pressed in `compression` m) stores ½kx²; the block leaves it, loses
 * `friction` × `rough` (N × m) to heat on the rough patch and climbs the ramp to the track's
 * `height`. Bars for the spring's energy, kinetic, potential and heat add to the same total.
 * The spec's `potential` and `kinetic` are the block's at `height`; `heat` the heat made.
 */
export interface EnergySpring {
  k: NumOrVar;
  compression: NumOrVar;
  /** The spring's stored energy ½kx², when the page names it. */
  stored?: string;
  friction?: NumOrVar;
  rough?: NumOrVar;
  heat?: string;
  fixed?: boolean;
}

// ─── H64 heatEngine ──────────────────────────────────────────────────────────

/**
 * A heat engine between a hot and a cold reservoir, the flows of energy as bands as wide as
 * their size: heat Q_H in from the hot reservoir, work W out, heat Q_L to the cold reservoir
 * (Q_H = W + Q_L), and an efficiency bar (W/Q_H) with the Carnot limit 1 − T_L/T_H marked. An
 * efficiency past the limit draws faded, the caption saying why. `refrigerator` runs it
 * backward: work in moves Q_L out of the cold reservoir and Q_H = Q_L + W into the hot one,
 * with the coefficient of performance Q_L/W beside the Carnot COP T_L/(T_H − T_L).
 * Energies in J, temperatures in K.
 */
export interface HeatEngineSpec {
  kind: 'heatEngine';
  mode?: 'engine' | 'refrigerator';
  /** Engine: Q_H and W given (Q_L = Q_H − W). Refrigerator: Q_L and W given (Q_H = Q_L + W). */
  hotHeat?: NumOrVar;
  coldHeat?: NumOrVar;
  work: NumOrVar;
  hot?: NumOrVar;
  cold?: NumOrVar;
  /** Efficiency in percent, or the refrigerator's COP. */
  efficiency?: string;
  /** The Carnot limit: efficiency in percent, or the COP. */
  carnot?: string;
}

// ─── H65 wave options: standing waves and the Doppler effect ────────────────

/**
 * A `wave` option: the standing wave of `harmonic` n on a string fixed at both ends, or in a
 * pipe open at both ends or closed at one, of `length` L. The envelope is drawn at both
 * extremes, nodes (N) and antinodes (A) marked and counted, a half wavelength bracketed; the
 * wave's `wavelength` is 2L/n (string, open pipe) or 4L/n (closed pipe, odd n only; an even n
 * draws faded). With the wave `speed`, `frequency` f = v/λ. Pipes show the air's displacement:
 * an antinode at each open end, a node at a closed end.
 */
export interface StandingWave {
  medium: 'string' | 'open' | 'closed';
  harmonic: NumOrVar;
  length: NumOrVar;
  speed?: NumOrVar;
}

/**
 * A `wave` option: a source moving at `sourceSpeed` through still air sends out wavefronts at
 * `waveSpeed`, one each period (6 drawn), each centered where the source was when it left:
 * bunched ahead, spread behind; at or past the wave speed they pile into a shock cone. The
 * frequency heard ahead is f v/(v − vₛ) and behind f v/(v + vₛ) (`ahead`, `behind`).
 */
export interface DopplerWave {
  sourceSpeed: NumOrVar;
  waveSpeed: NumOrVar;
  frequency: NumOrVar;
  ahead?: string;
  behind?: string;
}

// ─── H66 rayDiagram ──────────────────────────────────────────────────────────

/**
 * Light as rays:
 *
 * - `lens` (`converging` or `diverging`) and `mirror` (`concave` or `convex`): the object arrow
 *   at `objectDistance` dₒ, the focal points (and 2F) at `focal` f (a positive length; the
 *   shape gives its sign), the three principal rays, and the image from 1/f = 1/dₒ + 1/dᵢ:
 *   real (solid, the rays meet) or virtual (dashed, the rays only seem to come from it),
 *   upright or inverted, magnification m = −dᵢ/dₒ; drag the object;
 * - `refraction`: a ray from a medium of index `n1` into `n2` at `angle` θ₁ from the normal,
 *   bent to θ₂ by Snell's law n₁ sin θ₁ = n₂ sin θ₂; past the critical angle, total internal
 *   reflection; drag the incoming ray;
 * - `doubleSlit`: light of `wavelength` (nm) through two slits `spacing` (mm) apart onto a
 *   screen `screen` (m) away: bright fringes Δy = λL/d apart (mm), not to scale across;
 * - `telescope`: a refracting telescope (objective and eyepiece lenses, f_o + f_e apart) or a
 *   reflecting one (a concave mirror and a flat diagonal), rays from a distant star; the
 *   magnification f_o/f_e.
 */
export type RayDiagramSpec = { kind: 'rayDiagram'; fixed?: boolean } & (
  | {
      mode: 'lens' | 'mirror';
      shape: 'converging' | 'diverging' | 'concave' | 'convex';
      focal: NumOrVar;
      objectDistance: NumOrVar;
      objectHeight?: NumOrVar;
      imageDistance?: string;
      imageHeight?: string;
      magnification?: string;
    }
  | {
      mode: 'refraction';
      n1: NumOrVar;
      n2: NumOrVar;
      angle: NumOrVar;
      refracted?: string;
      critical?: string;
      /** Names of the two media, top then bottom (default "air", "water"). */
      media?: [string, string];
    }
  | {
      mode: 'doubleSlit';
      wavelength: NumOrVar;
      spacing: NumOrVar;
      screen: NumOrVar;
      fringe?: string;
    }
  | {
      mode: 'telescope';
      design: 'refracting' | 'reflecting';
      objective: NumOrVar;
      eyepiece: NumOrVar;
      magnification?: string;
      length?: string;
    }
);

// ─── H67 charges ─────────────────────────────────────────────────────────────

/**
 * Point charges (μC, signed) and their electric field lines, traced from the field itself:
 * out of + charges, into − charges, as many from each as its size. With two charges
 * `distance` r apart (m, not to scale), the Coulomb forces F = k|q₁q₂|/r² (k = 8.99 × 10⁹
 * N·m²/C²) on each, equal and opposite: apart for like charges, together for unlike; drag the
 * second charge for r (the arrows follow the inverse square). With one charge, the field
 * E = k|q|/r² at a point r away (`field`, N/C), pointing away from + and toward −.
 * With two charges and a `point` x (m from q₁ along the line toward q₂; H102), the field
 * there from each charge, dashed, and their sum E (`field`, N/C, signed: + toward q₂'s side).
 */
export interface ChargesSpec {
  kind: 'charges';
  mode?: 'points';
  charges: [NumOrVar, NumOrVar?];
  distance: NumOrVar;
  force?: string;
  field?: string;
  point?: NumOrVar;
  fixed?: boolean;
}

/**
 * `charges` mode `plates` (H102): two parallel plates `gap` d (m) apart with a potential
 * difference `voltage` V (V) across them, the uniform field E = V/d (V/m, `field`) drawn as
 * evenly spaced lines from + to −, and a `charge` q (C, signed; an electron −1.602 × 10⁻¹⁹)
 * between them with its force F = qE (`force`, N, signed: + along the field).
 */
export interface ChargePlatesSpec {
  kind: 'charges';
  mode: 'plates';
  voltage: NumOrVar;
  gap: NumOrVar;
  field?: string;
  charge?: NumOrVar;
  force?: string;
  fixed?: boolean;
}

// ─── H68 circuit option: mixed series-parallel ──────────────────────────────

/**
 * A `circuit` option: three resistors (Ω) on a battery (the circuit's `voltage`), either
 * `seriesParallel` (R₁ in series with R₂ ∥ R₃) or `parallelSeries` ((R₁ + R₂) ∥ R₃), in copper
 * wire with an ammeter for the total current (the circuit's `current`). Each resistor carries
 * its reading: the voltage across it, the current through it and its power. `equivalent` is
 * R_eq, `power` the total power VI; `voltages`, `currents` and `powers` name each resistor's
 * values when the page has them (checked).
 */
export interface MixedCircuit {
  layout: 'seriesParallel' | 'parallelSeries';
  resistors: [NumOrVar, NumOrVar, NumOrVar];
  equivalent?: string;
  power?: string;
  voltages?: [string?, string?, string?];
  currents?: [string?, string?, string?];
  powers?: [string?, string?, string?];
}

// ─── H69 induction ───────────────────────────────────────────────────────────

/**
 * Electromagnetism:
 *
 * - `coil`: a bar magnet pushed into (or pulled out of) a copper coil of `turns` N, its field
 *   lines traced, and a center-zero galvanometer whose needle swings by the induced
 *   emf = N ΔΦ/Δt (`flux` ΔΦ in Wb over `time` Δt in s), one way going in and the other coming
 *   out (Lenz's law);
 * - `force`: a wire of `length` L carrying `current` I across a magnetic `field` B (drawn as ×
 *   into the page or • out of it), and the force F = BIL sin θ on it, its direction from the
 *   right-hand rule (F = IL × B);
 * - `transformer`: an iron core with `primary` Nₚ and `secondary` Nₛ turns (each turn drawn up
 *   to 20), Vₛ = Vₚ Nₛ/Nₚ, and with a primary `current`, Iₛ = Iₚ Nₚ/Nₛ (power kept).
 */
export type InductionSpec = { kind: 'induction'; fixed?: boolean } & (
  | {
      mode: 'coil';
      turns: NumOrVar;
      flux: NumOrVar;
      time: NumOrVar;
      emf?: string;
      direction?: 'in' | 'out';
    }
  | {
      mode: 'force';
      field: NumOrVar;
      current: NumOrVar;
      length: NumOrVar;
      angle?: NumOrVar;
      force?: string;
      currentDir?: 'right' | 'left';
      fieldDir?: 'in' | 'out';
    }
  | {
      mode: 'transformer';
      primary: NumOrVar;
      secondary: NumOrVar;
      voltage: NumOrVar;
      output?: string;
      current?: NumOrVar;
      outputCurrent?: string;
    }
);

// ─── H70 spectrum options: spectral lines, redshift, photons ────────────────

/**
 * A `spectrum` option: the visible spectrum (380–750 nm) with an element's lines at their
 * measured wavelengths (hydrogen's Balmer lines, helium, sodium's D doublet): bright lines on
 * black (`emission`) or dark lines across the rainbow (`absorption`). With `redshift` z a second
 * strip shows the same lines at λ(1 + z), each joined to its lab line, the shift to the red (or
 * blue, z < 0); the spectrum's `wavelength` is then the observed wavelength of line `line`
 * (default the element's first listed: Hα, He 587.6, Na D). `rest` names the lab wavelength,
 * `velocity` v ≈ cz (km/s, small z).
 */
export interface SpectrumLines {
  element: 'H' | 'He' | 'Na';
  mode: 'emission' | 'absorption';
  redshift?: NumOrVar;
  /** H105: 'rest' follows the `rest` value: the element's line nearest it (any Balmer line). */
  line?: number | 'rest';
  rest?: string;
  velocity?: string;
}

/**
 * A `spectrum` option: one photon of `frequency` (Hz): its wave in its color (or grey outside
 * the visible), its wavelength λ = c/f (the spectrum's `wavelength`, in nm with `meters: 1e-9`)
 * and its energy E = hf in joules (`energy`) and electronvolts (`electronVolts`).
 */
export interface PhotonEnergy {
  frequency: NumOrVar;
  /** Hz in one of the frequency's units (1e12 when the page counts terahertz). Default 1. */
  hertz?: number;
  energy?: string;
  electronVolts?: string;
}

// ─── The union and the variables each picture reads ──────────────────────────

/** New picture kinds of group HK. */
export type HskSpec =
  | ProjectileSpec
  | FreeBodySpec
  | CircularMotionSpec
  | CollisionSpec
  | SimpleMachineSpec
  | HeatEngineSpec
  | RayDiagramSpec
  | ChargesSpec
  | ChargePlatesSpec
  | InductionSpec;

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
        r.displacement,
        r.work,
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
        r.central,
        r.bodyRadius,
      );
    case 'collision':
      return ids(
        ...r.masses,
        ...r.before,
        ...(r.after ?? []),
        r.momentum,
        ...(r.energy ?? []),
        r.lost,
        r.spring,
      );
    case 'simpleMachine':
      return ids(
        r.load,
        r.effort,
        r.advantage,
        r.effortArm,
        r.loadArm,
        r.strands,
        r.length,
        r.height,
        r.efficiency,
        r.effortDistance,
        r.loadDistance,
      );
    case 'heatEngine':
      return ids(r.hotHeat, r.coldHeat, r.work, r.hot, r.cold, r.efficiency, r.carnot);
    case 'charges':
      return r.mode === 'plates'
        ? ids(r.voltage, r.gap, r.field, r.charge, r.force)
        : ids(...r.charges, r.distance, r.force, r.field, r.point);
    case 'induction':
      switch (r.mode) {
        case 'coil':
          return ids(r.turns, r.flux, r.time, r.emf);
        case 'force':
          return ids(r.field, r.current, r.length, r.angle, r.force);
        case 'transformer':
          return ids(r.primary, r.secondary, r.voltage, r.output, r.current, r.outputCurrent);
      }
      break;
    case 'rayDiagram':
      switch (r.mode) {
        case 'lens':
        case 'mirror':
          return ids(
            r.focal,
            r.objectDistance,
            r.objectHeight,
            r.imageDistance,
            r.imageHeight,
            r.magnification,
          );
        case 'refraction':
          return ids(r.n1, r.n2, r.angle, r.refracted, r.critical);
        case 'doubleSlit':
          return ids(r.wavelength, r.spacing, r.screen, r.fringe);
        case 'telescope':
          return ids(r.objective, r.eyepiece, r.magnification, r.length);
      }
      break;
  }
}

/** The variable ids the group-HK options on older kinds read (motionGraph, …). */
export function hskOptionVars(r: { kind: string }): string[] {
  const o = r as unknown as Record<string, unknown>;
  if (r.kind === 'motionGraph' && o.kinematics) {
    const k = o.kinematics as MotionKinematics;
    return ids(k.at, k.slope, k.position);
  }
  if (r.kind === 'wave' && o.standing) {
    const w = o.standing as StandingWave;
    return ids(w.harmonic, w.length, w.speed);
  }
  if (r.kind === 'wave' && o.doppler) {
    const d = o.doppler as DopplerWave;
    return ids(d.sourceSpeed, d.waveSpeed, d.frequency, d.ahead, d.behind);
  }
  if (r.kind === 'spectrum' && (o.lines || o.photon)) {
    const l = o.lines as SpectrumLines | undefined;
    const p = o.photon as PhotonEnergy | undefined;
    return ids(l?.redshift, l?.rest, l?.velocity, p?.frequency, p?.energy, p?.electronVolts);
  }
  if (r.kind === 'circuit' && o.mixed) {
    const m = o.mixed as MixedCircuit;
    return ids(
      ...m.resistors,
      m.equivalent,
      m.power,
      ...(m.voltages ?? []),
      ...(m.currents ?? []),
      ...(m.powers ?? []),
    );
  }
  if (r.kind === 'energyTrack' && o.spring) {
    const e = o.spring as EnergySpring;
    return ids(e.k, e.compression, e.stored, e.friction, e.rough, e.heat);
  }
  return [];
}

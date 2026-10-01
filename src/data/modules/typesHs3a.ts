/**
 * Picture specs for the Grades 9–12 round 3 physics pictures of group H3A (H107 in
 * `pictureRequestsHs.ts`), kept apart from `types.ts` so that file's union only names them. A
 * `NumOrVar` field is a fixed number or a variable id; every other string is a variable id.
 *
 * Every value is read in the formula's units (the unit the page declares for the variable),
 * never the unit shown, so a page keeps its unit menus; labels show the unit shown. The
 * options this group adds to round 1's kinds (`simpleMachine` `seesaw`, `charges`
 * `equipotentials` and plates `launch`, `induction` mode `charge`) are typed here and named
 * from `typesHsk.ts`.
 */
import type { NumOrVar } from './typesGraphs';

const ids = (...xs: (NumOrVar | undefined)[]) =>
  xs.filter((x): x is string => typeof x === 'string');

// ─── H107.1 torque ───────────────────────────────────────────────────────────

/**
 * Torque: a wrench on a bolt (or a door on its hinge, seen from above), the lever arm r (m)
 * from the pivot to where the force F (N) pushes at `angle` θ (°, between the arm and the
 * force; default 90). F splits into its part along the arm (dashed, no turn) and its part
 * across it, F⊥ = F sin θ (`across`), which turns the arm: τ = rF⊥ = rF sin θ (`torque`,
 * N·m), a curved arrow round the pivot. Drag the tip of F for θ.
 */
export interface TorqueSpec {
  kind: 'torque';
  arm: NumOrVar;
  force: NumOrVar;
  angle?: NumOrVar;
  across?: string;
  torque?: string;
  /** What turns: a wrench on a bolt (default) or a door on its hinge. */
  body?: 'wrench' | 'door';
  fixed?: boolean;
}

// ─── H107.3 rotor ────────────────────────────────────────────────────────────

/**
 * A body turning about its center: a hoop, a solid disk or a solid ball by its `shape` factor
 * c (1, 0.5 or 0.4 in I = cmr²), or a spoked wheel when no shape is given. Everything is
 * optional but the drawing, so one kind serves three pages:
 *
 * - rotational inertia: `mass` m (kg), `radius` r (m), `inertia` I = cmr² (kg·m²), `torque`
 *   τ (N·m, a curved arrow at the rim) and `acceleration` α = τ/I (rad/s²); `compare` adds the
 *   three shapes side by side with their I and α for the same m, r and τ;
 * - speeding up: `start` ω₀ and `speed` ω (rad/s) as curved arrows as long as their size,
 *   `time` t (s), the `angle` swept Δθ = ω₀t + ½αt² (rad) as the area under a small ω–t
 *   line, and the `turns` n = Δθ/2π as a row of turn dials (whole turns full, the last part
 *   a slice);
 * - turning steadily: `rpm` N (turns a minute), `speed` ω = 2πN/60, `period` T = 2π/ω (s) and
 *   the `rim` speed v = rω (m/s) along the tangent.
 */
export interface RotorSpec {
  kind: 'rotor';
  shape?: NumOrVar;
  mass?: NumOrVar;
  radius?: NumOrVar;
  inertia?: string;
  torque?: NumOrVar;
  acceleration?: NumOrVar;
  start?: NumOrVar;
  speed?: NumOrVar;
  time?: NumOrVar;
  angle?: string;
  turns?: string;
  rpm?: NumOrVar;
  period?: string;
  rim?: string;
  compare?: boolean;
  /** H111: the hollow ball (c = ⅔) joins the compare row, four shapes instead of three. */
  hollow?: boolean;
  fixed?: boolean;
}

// ─── H107.4 oscillator ───────────────────────────────────────────────────────

/**
 * A mass on a spring:
 *
 * - `swing` (default): a block of `mass` m (kg) on a frictionless floor on a spring of
 *   `spring` constant k (N/m), pulled out `amplitude` A (m). The rest line and ±A marked, the
 *   block at `position` x (m; default A/2) and a faded one through the middle with v_max = Aω
 *   (`top`); beside it the x–t trace x = A cos ωt over two periods, T = 2π√(m/k) (`period`)
 *   and A marked, the moment drawn as a dot; bars for ½kx² and ½mv² that add to E = ½kA²
 *   (`energy`). `frequency` f = 1/T and `angular` ω = 2π/T when the page names them.
 * - `hang`: a spring hung from a beam, its unstretched end dashed, stretched `stretch` x (m) by
 *   a `mass` m (kg): the spring's pull kx up and the weight mg down (`force` F = mg, N) and,
 *   beside it, the F–x line through (x, F) with the triangle under it, U = ½kx² (`energy`, J).
 *   `g` defaults to 9.8 N/kg.
 */
export type OscillatorSpec = { kind: 'oscillator'; fixed?: boolean } & (
  | {
      mode?: 'swing';
      mass: NumOrVar;
      spring: NumOrVar;
      amplitude: NumOrVar;
      position?: NumOrVar;
      period?: string;
      frequency?: string;
      angular?: string;
      top?: string;
      energy?: string;
    }
  | {
      mode: 'hang';
      mass: NumOrVar;
      stretch: NumOrVar;
      spring?: NumOrVar;
      force?: string;
      energy?: string;
      g?: number;
    }
);

// ─── H107.5 pendulum ─────────────────────────────────────────────────────────

/**
 * A simple pendulum: a bob on a string of `length` L (m) drawn to the scale of a meter rule
 * beside it, swinging a small `swing` angle (°, default 10) each way, its path an arc, in
 * `gravity` g (m/s², default 9.8; Earth, the Moon and Mars are named). T = 2π√(L/g)
 * (`period`, s) as a time strip of whole seconds, f = 1/T (`frequency`, Hz). Drag the bob
 * down or up for L.
 */
export interface PendulumSpec {
  kind: 'pendulum';
  length: NumOrVar;
  gravity?: NumOrVar;
  period?: string;
  frequency?: string;
  swing?: number;
  fixed?: boolean;
}

// ─── H107.6 capacitor ────────────────────────────────────────────────────────

/**
 * A parallel-plate capacitor on a battery of `voltage` V: two metal plates, +Q on the one on
 * the battery's + side and −Q on the other (`charge`, as many signs as Q allows), the even
 * field between them, an optional slab of `dielectric` κ (> 1) filling the gap, and an energy
 * bar U = ½CV² (`energy`, J). `capacitance` C is in units of `farads` F each (default 1; 1e-6
 * for μF, 1e-12 for pF), and Q in coulombs of the same prefix (μC, pC). With `area` A (m²)
 * and `gap` d (in units of `meters` m each, 1e-3 for mm) the plates are labelled and
 * C = κε₀A/d with ε₀ = 8.85 × 10⁻¹² F/m. Not to scale.
 */
export interface CapacitorSpec {
  kind: 'capacitor';
  voltage: NumOrVar;
  capacitance?: NumOrVar;
  charge?: string;
  energy?: string;
  farads?: number;
  dielectric?: NumOrVar;
  area?: NumOrVar;
  gap?: NumOrVar;
  meters?: number;
  fixed?: boolean;
}

// ─── Options on round 1's kinds ──────────────────────────────────────────────

/**
 * `simpleMachine` lever option (H107.2): a seesaw, balanced. The two weights are F₁ (the
 * machine's `load`, at `loadArm` d₁) and F₂ (its `effort`, at `effortArm` d₂), each pressing
 * down on a plank balanced on its pivot; their torques F₁d₁ (turning it one way) and F₂d₂ (the
 * other) are equal (`torque` τ, N·m), and the pivot pushes up F_p = F₁ + F₂ (`pivot`, N).
 * Distances to scale.
 */
export interface SeesawOption {
  torque?: string;
  pivot?: string;
}

/**
 * `charges` option (H107.7), with one charge: circles of equal potential round it, dashed,
 * at the distance r and at r/2 and 2r, each labelled with its V = kq/r (k = 8.99 × 10⁹, q in
 * μC as the kind counts it; `potential` names V at r, in V), and a `test` charge q₀ (μC) on
 * the circle at r with its potential energy U = q₀V (`energy`, J).
 */
export interface ChargeEquipotentials {
  potential?: string;
  test?: NumOrVar;
  energy?: string;
}

/**
 * `charges` mode `plates` option (H107.8): a charge let go at rest beside one plate (an
 * electron at the − plate, a proton or other + ion at the + plate) crossing the voltage ΔV.
 * `charge` is its size in electron charges e, `mass` in kg (electron 9.109 × 10⁻³¹, proton
 * 1.673 × 10⁻²⁷ are named); it gains K = qΔV (`energy`, eV) and reaches
 * v = √(2K/m) (`speed`, m/s, K in joules). Its place at equal times is strobed (∝ t², it speeds
 * up), and its speed is set against a tenth of light's. The plates' `gap` may be left out.
 */
export interface PlateLaunch {
  charge: NumOrVar;
  mass: NumOrVar;
  energy?: string;
  speed?: string;
}

/**
 * `induction` mode `charge` (H107.9): a charge `charge` q (in units of `coulombs` C each,
 * default 1; 1e-6 for μC, 1.602e-19 when counted in e; signed) moving at `speed` v (m/s)
 * through a magnetic `field` B (T), into the page (default) or out of it, at `angle` θ (°,
 * between v and B; default 90 with B across the page). The force F = |q|vB sin θ (`force`,
 * N) from F = qv × B: for a − charge the other way. With a `mass` (kg) and θ = 90° its path is
 * a circle of `radius` r = mv/(|q|B) (m), drawn to its own scale.
 */
export interface MovingCharge {
  mode: 'charge';
  field: NumOrVar;
  charge: NumOrVar;
  coulombs?: number;
  speed: NumOrVar;
  angle?: NumOrVar;
  force?: string;
  mass?: NumOrVar;
  radius?: string;
  fieldDir?: 'in' | 'out';
}

// ─── The union and the variables each picture reads ──────────────────────────

/** New picture kinds of group H3A. */
export type Hs3aSpec = TorqueSpec | RotorSpec | OscillatorSpec | PendulumSpec | CapacitorSpec;

/** Every variable id a group-H3A picture reads (for modules.test.ts). */
export function hs3aSpecVars(r: Hs3aSpec): string[] {
  switch (r.kind) {
    case 'torque':
      return ids(r.arm, r.force, r.angle, r.across, r.torque);
    case 'rotor':
      return ids(
        r.shape,
        r.mass,
        r.radius,
        r.inertia,
        r.torque,
        r.acceleration,
        r.start,
        r.speed,
        r.time,
        r.angle,
        r.turns,
        r.rpm,
        r.period,
        r.rim,
      );
    case 'oscillator':
      return r.mode === 'hang'
        ? ids(r.mass, r.stretch, r.spring, r.force, r.energy)
        : ids(
            r.mass,
            r.spring,
            r.amplitude,
            r.position,
            r.period,
            r.frequency,
            r.angular,
            r.top,
            r.energy,
          );
    case 'pendulum':
      return ids(r.length, r.gravity, r.period, r.frequency);
    case 'capacitor':
      return ids(r.voltage, r.capacitance, r.charge, r.energy, r.dielectric, r.area, r.gap);
  }
}

/** The variable ids the group-H3A options on round 1's kinds read. */
export const seesawVars = (o?: SeesawOption) => ids(o?.torque, o?.pivot);
export const equipotentialVars = (o?: ChargeEquipotentials) =>
  ids(o?.potential, o?.test, o?.energy);
export const launchVars = (o?: PlateLaunch) => ids(o?.charge, o?.mass, o?.energy, o?.speed);
export const movingChargeVars = (o: MovingCharge) =>
  ids(o.field, o.charge, o.speed, o.angle, o.force, o.mass, o.radius);

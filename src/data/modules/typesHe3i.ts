/**
 * College picture kinds and options of round 3, group I (docs/RENDERINGS_HE.md): HC81
 * `simpleMachine` option `limb`, HC82 `binaryPhase`, HC83 `machining` and HC84 `linkage`. Kept
 * apart from `types.ts` so its union only names them. A `NumOrVar` is a fixed number or a
 * variable id; values are read in the variable's own unit (a check that mixes units reads the
 * unit from the variable: mm or cm, m/min or m/s).
 */
import type { NumOrVar } from './typesGraphs';

// ─── HC81: simpleMachine option `limb` ───────────────────────────────────────

/**
 * `simpleMachine` lever option `limb` (HC81): a limb's bones drawn to scale from the arms, the
 * muscle's line of pull, each load at its arm and the joint force at the fulcrum, every force
 * vertical and on one scale, with the two moments about the joint as bars of equal length.
 *
 * The spec's `effort` is the muscle force at `effortArm`; its `load` is the main load at
 * `loadArm` (a weight in the hand, or the body's weight on one leg).
 *
 * - `forearm`: the elbow is the fulcrum, the forearm level; the biceps pulls up between the
 *   elbow and the loads (a third-class lever), so the elbow pushes down on the forearm with
 *   F_J = F_M − Σ loads.
 * - `hip`: the pelvis balanced on one leg (frontal view); the abductors pull down on one side of
 *   the hip joint and `share` × W acts at the body's centre on the other (a first-class lever),
 *   so the joint pushes up with F_J = F_M + Σ loads.
 */
export interface LimbOption {
  body: 'forearm' | 'hip';
  /** Further vertical loads at their arms from the joint (the forearm's own weight W_f at d_f). */
  loads?: { force: NumOrVar; arm: NumOrVar; name?: string }[];
  /** `hip`: the share of the spec's load that acts at its arm (default 5/6: the stance leg
   * itself is the other sixth). */
  share?: number;
  /** The joint force F_J (on the forearm downward, on the pelvis upward). */
  joint?: string;
  /** F_J ÷ the spec's load (the hip force in body weights). */
  ratio?: string;
}

// ─── HC82: binaryPhase ───────────────────────────────────────────────────────

/**
 * A binary phase diagram, flat (temperature up, wt% of the second component across), with the
 * alloy's vertical line at C₀, a tie line at T, its ends and the lever arms, the tie line
 * enlarged beneath as a lever with the arms labelled, and two bars of the phase fractions.
 * Every boundary is computed in code, shaped to pass through the page's tie-line ends.
 *
 * - `isomorphous`: an A–B lens (liquidus over solidus); the tie line runs from the liquid C_L
 *   to the solid C_α; W_L = (C_α − C₀) ÷ (C_α − C_L).
 * - `eutectic`: a eutectic diagram, the tie line just above T_E from C_α to C_E; the eutectic
 *   share W_e = (C₀ − C_α) ÷ (C_E − C_α) and the primary α W_α′ = 1 − W_e.
 * - `steel`: the iron–carbon steel corner (eutectoid at 0.76 wt% C, 727 °C, α to 0.022 wt%);
 *   the tie line just above the eutectoid from C_α to C_E; pearlite W_P = (C₀ − C_α) ÷
 *   (C_E − C_α) and proeutectoid ferrite 1 − W_P. A hypereutectoid steel (C₀ > C_E) draws faded.
 */
export interface BinaryPhaseSpec {
  kind: 'binaryPhase';
  system: 'isomorphous' | 'eutectic' | 'steel';
  /** The two components, A and B ('Cu', 'Ni'); the steel corner is Fe and C. */
  names?: [string, string];
  /** The alloy's composition C₀ (wt% B). */
  c0: NumOrVar;
  /** `isomorphous`: the liquid's composition C_L at T. */
  cl?: NumOrVar;
  /** The solid's composition C_α at the tie line (`steel`: default 0.022). */
  calpha?: NumOrVar;
  /** `eutectic`: the eutectic composition C_E; `steel`: the eutectoid's (default 0.76). */
  ce?: NumOrVar;
  /** `eutectic`: the β end of the eutectic line (default part way from C_E to 100). */
  cbeta?: NumOrVar;
  /** The tie line's temperature (a label; `steel` defaults to 727 °C). */
  temperature?: NumOrVar;
  /** `isomorphous`: the melting points of A and B, labelled at the axis ends; with
   * `temperature` they set where the tie line sits between them. */
  melts?: [NumOrVar, NumOrVar];
  /** The fractions: the liquid W_L (`isomorphous`), the eutectic or pearlite W_e and the solid
   * or primary α W_α (or W_α′). */
  wl?: NumOrVar;
  we?: NumOrVar;
  walpha?: NumOrVar;
}

// ─── HC83: machining ─────────────────────────────────────────────────────────

/**
 * A cut in metal, drawn in steel with the tool in carbide.
 *
 * - `turning`: a bar of diameter D held in the chuck, turning at N; the tool moves f per turn
 *   along the bar, cutting depth d over the length L (time T_m); the surface speed v = πDN
 *   tangent at the top. A detail shows the cut enlarged: depth d and the feed marks f apart.
 * - `milling`: a cutter of diameter D with n_t teeth turning at N over a block, cutting depth d
 *   across width w (the block drawn in oblique), the table feed f_r = Nn_tf_t; each tooth's
 *   bite f_t enlarged.
 * - `finish`: the ideal surface: tool-nose arcs of radius r spaced f leave cusps of height
 *   h = f² ÷ (8r); the mean line, and the shaded departures whose mean is R_a ≈ f² ÷ (32r).
 *   Heights are drawn enlarged, said in the caption.
 *
 * Lengths in mm (or the variable's unit: cm, m, μm, in), speeds in m/min (or m/s, ft/min),
 * spindle speed in rpm, feeds in mm per turn (or per tooth), and a table feed in mm/min.
 */
export interface MachiningSpec {
  kind: 'machining';
  mode: 'turning' | 'milling' | 'finish';
  /** The bar's (turning) or cutter's (milling) diameter D. */
  diameter?: NumOrVar;
  /** The cutting speed v. */
  speed?: NumOrVar;
  /** The spindle speed N (rpm). */
  rpm?: NumOrVar;
  /** The feed f per turn (turning, finish). */
  feed?: NumOrVar;
  /** The depth of cut d. */
  depth?: NumOrVar;
  /** `turning`: the length cut L and the time T_m. */
  length?: NumOrVar;
  time?: NumOrVar;
  /** The material removal rate (MRR). */
  rate?: NumOrVar;
  /** `milling`: the teeth n_t, the feed per tooth f_t, the table feed f_r, the width w. */
  teeth?: NumOrVar;
  toothFeed?: NumOrVar;
  tableFeed?: NumOrVar;
  width?: NumOrVar;
  /** `finish`: the tool's nose radius r, the roughness R_a and the cusp height h. */
  radius?: NumOrVar;
  roughness?: NumOrVar;
  cusp?: NumOrVar;
  /** Further values labelled under the picture. */
  more?: string[];
}

// ─── HC84: linkage ───────────────────────────────────────────────────────────

/**
 * Rigid bodies in plane motion, flat, with their instantaneous centre (IC).
 *
 * - `ladder`: a ladder of length L sliding, its foot A on the floor at θ, its top B on the
 *   wall; the IC where the normals to the two paths meet; dashed rays from it, each point's
 *   velocity ⟂ its ray and ∝ its distance (v = ωr); ω round the IC.
 * - `rolling`: a wheel (or ball, hoop, disk by `shape` c = I ÷ mr²) rolling without slipping on
 *   a floor or a slope of `angle`; the IC at the contact: v = 0 there, v at the centre, 2v at
 *   the top, two rim points ⟂ their rays; the acceleration a along the slope.
 * - `mechanism`: a single closed loop of n links (link 1 the ground, hatched), its pins circled
 *   and numbered, a slider or a pin in a slot (a half joint) where the page counts one; the
 *   mobility M = 3(n − 1) − 2j₁ − j₂ (Gruebler). `slider` draws a slider-crank.
 */
export interface LinkageSpec {
  kind: 'linkage';
  mode: 'ladder' | 'rolling' | 'mechanism';
  /** `ladder`: the length L, the angle θ with the floor (degrees), the speeds of the foot v_A
   * and the top v_B, and ω. `rolling`: `angle` is the slope's. */
  length?: NumOrVar;
  angle?: NumOrVar;
  footSpeed?: NumOrVar;
  topSpeed?: NumOrVar;
  omega?: NumOrVar;
  /** `rolling`: the radius r, the centre's speed v, its acceleration a and the shape c. */
  radius?: NumOrVar;
  speed?: NumOrVar;
  acceleration?: NumOrVar;
  shape?: NumOrVar;
  /** `mechanism`: links n (with the ground), full joints j₁, half joints j₂ and mobility M. */
  links?: NumOrVar;
  full?: NumOrVar;
  half?: NumOrVar;
  mobility?: NumOrVar;
  slider?: boolean;
  /** Further values labelled under the picture. */
  more?: string[];
}

export type He3iSpec = BinaryPhaseSpec | MachiningSpec | LinkageSpec;

const ids = (xs: unknown[]): string[] =>
  xs.flatMap((x) =>
    typeof x === 'string'
      ? [x]
      : Array.isArray(x)
        ? ids(x)
        : x && typeof x === 'object'
          ? ids(Object.values(x))
          : [],
  );

/** The variable ids a group-I spec names (its mode and system words are not variables). */
export function he3iSpecVars(r: He3iSpec): string[] {
  switch (r.kind) {
    case 'binaryPhase': {
      const { kind: _k, system: _s, names: _n, ...rest } = r;
      return ids(Object.values(rest));
    }
    case 'machining':
    case 'linkage': {
      const { kind: _k, mode: _m, ...rest } = r;
      return ids(Object.values(rest));
    }
  }
}

/** The variable ids the `limb` option names. */
export function limbVars(o: LimbOption | undefined): string[] {
  if (!o) return [];
  const { loads, joint, ratio } = o;
  return ids([(loads ?? []).map((l) => [l.force, l.arm]), joint, ratio]);
}

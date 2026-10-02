/**
 * College picture kinds of round 3, group J (docs/RENDERINGS_HE.md): HC60 `roadCurve`, HC61
 * `connection`, HC88 `streamChannel` options (`manning`, `froude`, `specificEnergy`, `jump`),
 * HC89 `hydrograph` and HC90 `blockDiagram`. Kept apart from `types.ts` so its union only names
 * them. A `NumOrVar` is a fixed number or a variable id; values are read in the formula's units.
 */
import type { NumOrVar } from './typesGraphs';

// ─── HC88: open-channel flow (an option on `streamChannel`) ──────────────────

/**
 * `streamChannel` with a `mode` (HC88, ACC-P19): a rectangular channel for open-channel flow.
 * `manning`: the section to scale (b × y, the wetted perimeter b + 2y lit) beside a side view
 * with the slope S, the roughness n and the speed V, and with `froude` Fr = V ÷ √(gy) named sub-
 * or supercritical. `specificEnergy`: the E–y curve for a unit discharge q, its least E at y_c,
 * the depth y on it and its alternate depth. `jump`: y₁ under a fast stream, the roller, y₂, the
 * energy line dropping by h_L. A page without `mode` keeps the Grade 12 slab (StreamChannelSpec).
 */
export interface StreamChannelHeSpec {
  kind: 'streamChannel';
  mode: 'manning' | 'specificEnergy' | 'jump';
  /** Width b and depth y (m or ft). */
  width?: NumOrVar;
  depth?: NumOrVar;
  /** Manning's n and the bed slope S (m/m). */
  n?: NumOrVar;
  slope?: NumOrVar;
  /** The page's worked values: area A, hydraulic radius R, discharge Q, mean speed V. */
  area?: NumOrVar;
  radius?: NumOrVar;
  discharge?: NumOrVar;
  speed?: NumOrVar;
  /** The Froude number Fr = V ÷ √(gy), named "subcritical" or "supercritical" by the picture. */
  froude?: NumOrVar;
  /** Manning's constant: 1 in SI (the default), 1.49 in US units. */
  manningK?: number;
  /** g from the page (9.81 m/s², the default). */
  g?: NumOrVar;
  /** `specificEnergy`: unit discharge q = Q ÷ b, y_c, E_min and E at `depth`. */
  q?: NumOrVar;
  yc?: NumOrVar;
  Emin?: NumOrVar;
  energy?: NumOrVar;
  /** `jump`: y₁, V₁, Fr₁, y₂ and the head loss h_L. */
  y1?: NumOrVar;
  V1?: NumOrVar;
  Fr1?: NumOrVar;
  y2?: NumOrVar;
  hL?: NumOrVar;
  /** Typed values a drag of the depth keeps. */
  keep?: string[];
}

// ─── HC60: geometric design of roads ─────────────────────────────────────────

/**
 * `roadCurve` (HC60, ACC-P22). `stopping`: a road seen from above, the car, the reaction strip
 * 0.278Vt then the braking strip V² ÷ (254(a ÷ g ± G)) to the object, to one scale. `plan`: a
 * circular curve between two tangents (PC, PI, PT, R, Δ, T, L, E) to scale; with `e` and `f`, a
 * banked section of the road beside it. `profile`: a crest vertical curve between grades G₁ and
 * G₂, the sight line of length S from the eye to the object at its worst place, clearing the
 * crest (or touching it exactly when L meets the formula), heights exaggerated and said so.
 */
export interface RoadCurveSpec {
  kind: 'roadCurve';
  mode: 'stopping' | 'plan' | 'profile';
  /** Design speed V, km/h. */
  speed?: NumOrVar;
  /** Reaction time t (s), deceleration a (m/s²), grade G (a decimal, + uphill), g (9.81). */
  reaction?: NumOrVar;
  decel?: NumOrVar;
  grade?: NumOrVar;
  g?: NumOrVar;
  /** The worked distances, m: reaction, braking and the stopping sight distance. */
  reactionDistance?: NumOrVar;
  brakingDistance?: NumOrVar;
  ssd?: NumOrVar;
  /** `plan`: radius R (m), deflection Δ (degrees), arc length L, tangent T, external E. */
  radius?: NumOrVar;
  delta?: NumOrVar;
  length?: NumOrVar;
  tangent?: NumOrVar;
  external?: NumOrVar;
  /** `plan` with superelevation: the bank e and side friction f (decimals). */
  e?: NumOrVar;
  f?: NumOrVar;
  /** `profile`: grades G₁ and G₂ (%), A = |G₁ − G₂| (%), curve length L and sight distance S (m). */
  g1?: NumOrVar;
  g2?: NumOrVar;
  A?: NumOrVar;
  curveLength?: NumOrVar;
  sight?: NumOrVar;
  /** The driver's eye and the object's heights, m (AASHTO 1.08 and 0.60, the defaults). */
  eye?: number;
  object?: number;
  /** Typed values a drag keeps. */
  keep?: string[];
}

// ─── HC61: steel connections ─────────────────────────────────────────────────

/**
 * `connection` (HC61, ACC-P24), US units (in, ksi, kips), painted steel. `tension`: a plate with
 * `holes` bolt holes across its width and the net section through them (w − holes × size).
 * `bolts`: a lap splice, n bolts in rows of two in single shear, plan and edge view. `weld`: a
 * plate lapped on a gusset with fillet welds of leg w and length L, the throat 0.707w in a
 * section. `blockShear`: a plate end with a line of holes, the block torn out along the shear
 * plane (A_gv, A_nv) and the tension plane (A_nt), drawn in proportion to the areas.
 */
export interface ConnectionSpec {
  kind: 'connection';
  mode: 'tension' | 'bolts' | 'weld' | 'blockShear';
  /** `tension`: plate width and thickness t, holes across, hole size (in). */
  plateWidth?: NumOrVar;
  t?: NumOrVar;
  holes?: NumOrVar;
  holeSize?: NumOrVar;
  /** Areas (in²): gross, net, effective; shear lag U. */
  Ag?: NumOrVar;
  An?: NumOrVar;
  Ae?: NumOrVar;
  U?: NumOrVar;
  /** Yield and tensile strengths (ksi). */
  Fy?: NumOrVar;
  Fu?: NumOrVar;
  /** The design strength φR_n or φP_n (kips). */
  strength?: NumOrVar;
  /** `bolts`: bolt diameter d (in), count n, bolt area A_b, F_nv, one bolt's φr_n. */
  d?: NumOrVar;
  n?: NumOrVar;
  Ab?: NumOrVar;
  Fnv?: NumOrVar;
  perBolt?: NumOrVar;
  /** `weld`: leg w and length L of each weld (in), the welds' count (2), F_EXX, throat, φR_n per inch. */
  weldLeg?: NumOrVar;
  weldLength?: NumOrVar;
  welds?: number;
  Fexx?: NumOrVar;
  throat?: NumOrVar;
  perInch?: NumOrVar;
  /** `blockShear`: gross and net shear areas, net tension area (in²), U_bs. */
  Agv?: NumOrVar;
  Anv?: NumOrVar;
  Ant?: NumOrVar;
  Ubs?: NumOrVar;
}

// ─── HC89: rainfall and runoff ───────────────────────────────────────────────

/**
 * `hydrograph` (HC89, ACC-P21). `split`: the storm's depth P as a column cut into the initial
 * abstraction I_a, infiltration F and runoff Q, beside the curve-number curve Q(P) with the storm
 * on it. `rational`: rain at intensity i over a watershed of area A, the share C running off to
 * the outlet as Q = CiA; with `tc`, the rain bar hanging from the top and the runoff rising to
 * its peak at t_c below. `detention`: the inflow and outflow triangles over t_b, the storage
 * between them shaded, V = ½t_b(Q_i − Q_o).
 */
export interface HydrographSpec {
  kind: 'hydrograph';
  mode: 'split' | 'rational' | 'detention';
  /** `split`: rain P, initial abstraction I_a, infiltration F, runoff Q (in or mm); S and CN. */
  P?: NumOrVar;
  Ia?: NumOrVar;
  F?: NumOrVar;
  Q?: NumOrVar;
  S?: NumOrVar;
  CN?: NumOrVar;
  /** The depth unit printed (in). */
  depthUnit?: string;
  /** `rational`: runoff coefficient C, intensity i (mm/h), area A (ha), peak Q_p (m³/s), t_c (min). */
  C?: NumOrVar;
  i?: NumOrVar;
  A?: NumOrVar;
  Qp?: NumOrVar;
  tc?: NumOrVar;
  /** `detention`: inflow and outflow peaks (m³/s), base time t_b, storage V (m³). */
  Qin?: NumOrVar;
  Qout?: NumOrVar;
  tb?: NumOrVar;
  V?: NumOrVar;
  /** Seconds in one unit of t_b (3600 when t_b is in hours, the default). */
  tbSeconds?: number;
  /** The inflow's peak as a share of t_b (0.375, the SCS triangle's 3 ÷ 8). */
  peakAt?: number;
  /** Typed values a drag keeps. */
  keep?: string[];
}

// ─── HC90: control-loop block diagrams ───────────────────────────────────────

/**
 * `blockDiagram` (HC90, ACC-P34), flat. `feedback`: setpoint, comparator (+ and −), controller
 * K_c, process K_p ÷ (τs + 1), output, and the sensor back to the minus sign. `lags`: the same
 * loop around K_p ÷ (τs + 1)³. `feedforward`: the disturbance through K_d to the output, and
 * measured through K_ff to the process input, cancelling it. `cascade`: an inner loop (K_c2 and
 * the fast process) inside the outer one. Every gain in a block is a value.
 */
export interface BlockDiagramSpec {
  kind: 'blockDiagram';
  mode: 'feedback' | 'lags' | 'feedforward' | 'cascade';
  /** Controller gain, process gain and time constant (min). */
  Kc?: NumOrVar;
  Kp?: NumOrVar;
  tau?: NumOrVar;
  /** The setpoint change. */
  setpoint?: NumOrVar;
  /** Equal lags in `lags` mode (3). */
  lags?: number;
  /** The worked values of the loop: K_cK_p, the final value, the offset, τ_cl. */
  loopGain?: NumOrVar;
  final?: NumOrVar;
  offset?: NumOrVar;
  tauCl?: NumOrVar;
  /** `lags`: the ultimate gain K_c,u, the crossover ω_u and the ultimate period P_u. */
  Kcu?: NumOrVar;
  wu?: NumOrVar;
  Pu?: NumOrVar;
  /** `feedforward`: the disturbance gain K_d and the feedforward gain K_ff. */
  Kd?: NumOrVar;
  Kff?: NumOrVar;
  /** `cascade`: the inner controller and process. */
  Kc2?: NumOrVar;
  Kp2?: NumOrVar;
  tau2?: NumOrVar;
  /** The valve's and the sensor's gains (1, ideal, when left out). */
  valve?: NumOrVar;
  sensor?: NumOrVar;
  /** The time unit printed with τ (min). */
  timeUnit?: string;
}

/** The group J picture kinds of their own (listed in `types.ts`). */
export type He3jSpec =
  StreamChannelHeSpec | RoadCurveSpec | ConnectionSpec | HydrographSpec | BlockDiagramSpec;

/** The variable ids a group J picture reads (for the module tests). */
export function he3jSpecVars(r: He3jSpec): string[] {
  const rest: Record<string, unknown> = { ...r };
  // The kind, the mode and the printed units are words, not values.
  for (const k of ['kind', 'mode', 'depthUnit', 'timeUnit']) delete rest[k];
  return Object.values(rest)
    .flat()
    .filter((x): x is string => typeof x === 'string');
}

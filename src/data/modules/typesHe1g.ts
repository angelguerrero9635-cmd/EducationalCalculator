/**
 * Picture specs for the college pictures of round 1, group G (docs/RENDERINGS_HE.md, HC6):
 * `fluidSystem`, one kind for fluid statics, Bernoulli, momentum, pipe flow, pipe networks,
 * boundary layers and models. Kept apart from `types.ts` so that file's union only lists it.
 *
 * A `NumOrVar` field is a fixed number or a variable id; a variable shown as "?" draws nothing
 * for that value. Values are read in the variable's own unit and turned into SI for the
 * drawing (kPa → Pa, mm → m), so a page may show any registered unit. Constants come from the
 * page: `g` (default 9.81 m/s², the engineering pages' value) and every density. Every option
 * is off unless a page sets it.
 */
import type { NumOrVar } from './typesGraphs';

/** A fluid's paint: water (blue), oil (amber), mercury (silver), air (pale, streamlines). */
export type FluidName = 'water' | 'oil' | 'mercury' | 'air';

interface FluidBase {
  kind: 'fluidSystem';
  /** Gravity, m/s², as the page has it (default 9.81). */
  g?: NumOrVar;
  /** No handle: the picture can't solve backwards from a drag. */
  fixed?: boolean;
  /** Values a drag pins (default: the typed values the drag doesn't move). */
  keep?: string[];
}

/**
 * Pressure at a depth (`tank`): water in a glass tank, the depth h of a point from the surface,
 * P_gauge = ρgh at the point, and a bar of P_atm + P_gauge = P_abs beside it. Drag the point.
 */
export interface FluidTankSpec extends FluidBase {
  mode: 'tank';
  depth: NumOrVar;
  density: NumOrVar;
  gauge?: NumOrVar;
  atm?: NumOrVar;
  absolute?: NumOrVar;
  fluid?: FluidName;
}

/**
 * A differential manometer (`manometer`): a pipe of the flowing fluid (ρ) with two taps down to
 * a glass U-tube of a heavier gauge fluid (ρ_m); its levels differ by h, so
 * ΔP = (ρ_m − ρ)gh. Drag the higher level for h. A gauge fluid no heavier than ρ draws faded.
 */
export interface FluidManometerSpec extends FluidBase {
  mode: 'manometer';
  reading: NumOrVar;
  density: NumOrVar;
  gaugeDensity: NumOrVar;
  difference?: NumOrVar;
  fluid?: FluidName;
  gaugeFluid?: FluidName;
}

/**
 * A vertical rectangular gate in a reservoir wall (`gate`), side view to scale: width b
 * (named), height H, its top d below the surface, the pressure prism growing with depth, the
 * centroid at h_c = d + H ÷ 2, and F = ρgh_cbH at the center of pressure
 * y_cp = h_c + H² ÷ (12h_c). Drag the gate for d.
 */
export interface FluidGateSpec extends FluidBase {
  mode: 'gate';
  width: NumOrVar;
  height: NumOrVar;
  top: NumOrVar;
  density: NumOrVar;
  centroid?: NumOrVar;
  force?: NumOrVar;
  center?: NumOrVar;
}

/**
 * A floating block (`buoyancy`) in a glass tank: a cube of volume V and density ρ_body, under
 * the water by V_sub ÷ V = ρ_body ÷ ρ, the submerged part shaded, F_B = ρgV_sub up and the
 * weight down. A body denser than the fluid draws on the floor, faded, with the reason.
 */
export interface FluidBuoyancySpec extends FluidBase {
  mode: 'buoyancy';
  volume: NumOrVar;
  bodyDensity: NumOrVar;
  density: NumOrVar;
  submerged?: NumOrVar;
  /** The submerged share, % (0–100). */
  share?: NumOrVar;
  buoyant?: NumOrVar;
  fluid?: FluidName;
  /** The body's paint (default wood; ice for ice). */
  body?: 'wood' | 'ice';
}

/**
 * A venturi meter (`venturi`): a glass tube narrowing from D₁ to D₂ (to scale with each other),
 * water arrows V₁ and V₂, and two piezometer columns whose tops differ by
 * Δh = ΔP ÷ ρg on a metre scale. Drag the throat for D₂. A throat no narrower than the inlet
 * draws faded.
 */
export interface FluidVenturiSpec extends FluidBase {
  mode: 'venturi';
  inlet: NumOrVar;
  throat: NumOrVar;
  density: NumOrVar;
  difference?: NumOrVar;
  speed1?: NumOrVar;
  speed2?: NumOrVar;
  flow?: NumOrVar;
  fluid?: FluidName;
}

/**
 * A pitot-static tube in a stream (`pitot`): the stagnation point at its nose, the static
 * ports on its side, the stream speed V and ΔP = ½ρV². With `gaugeDensity` the two lines run
 * to a U-tube whose levels differ by h = ΔP ÷ ((ρ_m − ρ)g).
 */
export interface FluidPitotSpec extends FluidBase {
  mode: 'pitot';
  speed: NumOrVar;
  difference: NumOrVar;
  density: NumOrVar;
  gaugeDensity?: NumOrVar;
  fluid?: FluidName;
  gaugeFluid?: FluidName;
}

/**
 * A jet on a fixed vane (`jet`): a nozzle's jet of speed V and area A turned through θ, the
 * control volume dashed round the vane, and the force of the jet on the vane,
 * Fₓ = ṁV(1 − cos θ) downstream and F_y = ṁV sin θ against the turn. Drag the outlet for θ.
 */
export interface FluidJetSpec extends FluidBase {
  mode: 'jet';
  speed: NumOrVar;
  angle: NumOrVar;
  area?: NumOrVar;
  density?: NumOrVar;
  massFlow?: NumOrVar;
  forceX?: NumOrVar;
  forceY?: NumOrVar;
}

/**
 * One pipe and its grade lines (`pipe`): the energy grade line falling by h_L along L, the
 * hydraulic grade line V² ÷ 2g under it. With `pump`, two reservoirs Δz apart and a pump that
 * lifts the energy line by h_p = Δz + h_L (P = ρgQh_p ÷ η). Heads are to the scale beside them;
 * the pipe's length runs on its own scale.
 */
export interface FluidPipeSpec extends FluidBase {
  mode: 'pipe';
  diameter?: NumOrVar;
  length?: NumOrVar;
  speed?: NumOrVar;
  flow?: NumOrVar;
  headLoss: NumOrVar;
  /** The pressure drop ρgh_L, when the page names it. */
  drop?: NumOrVar;
  density?: NumOrVar;
  friction?: NumOrVar;
  reynolds?: NumOrVar;
  /** Draw two reservoirs and a pump (the pump page). */
  pump?: boolean;
  rise?: NumOrVar;
  pumpHead?: NumOrVar;
  power?: NumOrVar;
  efficiency?: NumOrVar;
}

/** One branch of a pipe network. */
export interface FluidBranch {
  diameter?: NumOrVar;
  length?: NumOrVar;
  flow?: NumOrVar;
  /** h_f = KQ² (a loop page's pipe constant). */
  constant?: NumOrVar;
}

/**
 * Two pipes between two nodes (`parallel`): the flow Q splitting into Q₁ + Q₂, each pipe drawn
 * with its D and L (widths to scale with each other) and the same h_f across both; with
 * `hazen` (C), the h_f of each is worked out by Hazen–Williams and must agree.
 */
export interface FluidParallelSpec extends FluidBase {
  mode: 'parallel';
  flow: NumOrVar;
  pipes: [FluidBranch, FluidBranch];
  headLoss?: NumOrVar;
  hazen?: NumOrVar;
}

/**
 * One loop of four pipes (`loop`) for a Hardy Cross step: each pipe's assumed flow (+
 * clockwise) as an arrow with K and h_f = KQ|Q|, Σh_f and Σ2h_f ÷ |Q| in the middle, the
 * correction ΔQ = −Σh_f ÷ Σ(2h_f ÷ Q) as a turning arrow, and the new flows.
 */
export interface FluidLoopSpec extends FluidBase {
  mode: 'loop';
  pipes: [FluidBranch, FluidBranch, FluidBranch, FluidBranch];
  correction?: NumOrVar;
}

/**
 * A storm sewer flowing full (`full`), in section: the pipe of the next standard size in
 * concrete (the page's `size`, or the first of its `sizes` at least D; else D itself), the
 * required D = (3.208Qn ÷ √S)^(3/8) dashed inside it, and a side strip with the
 * slope S; the full velocity Q ÷ A, flagged under about 0.9 m/s (solids settle).
 */
export interface FluidFullSpec extends FluidBase {
  mode: 'full';
  flow: NumOrVar;
  manning: NumOrVar;
  slope: NumOrVar;
  diameter: NumOrVar;
  /** The standard size laid, when the page names it. */
  size?: NumOrVar;
  /** The sizes made (mm), the page's list: the picture lays the first at least D. */
  sizes?: number[];
}

/**
 * A flat plate's boundary layer (`plate`): the plate in metal, the stream V, the layer's edge
 * growing as δ ∝ √x (laminar) or x^0.8 (`turbulent`), drawn tall (the scale says how much),
 * and the velocity profiles at L ÷ 2 and L. A laminar page with Re_L ≥ 5 × 10⁵ draws faded.
 */
export interface FluidPlateSpec extends FluidBase {
  mode: 'plate';
  speed: NumOrVar;
  length: NumOrVar;
  viscosity: NumOrVar;
  thickness?: NumOrVar;
  reynolds?: NumOrVar;
  turbulent?: boolean;
}

/**
 * A prototype and its model side by side at scale (`model`): the model L_m ÷ L_p the size, each
 * with its speed arrow to one scale, matched by Reynolds (V_mL_m ÷ ν_m = V_pL_p ÷ ν_p) or Froude
 * (V_m ÷ √L_m = V_p ÷ √L_p). A car in a wind tunnel, or a ship on water.
 */
export interface FluidModelSpec extends FluidBase {
  mode: 'model';
  rule: 'reynolds' | 'froude';
  protoSpeed: NumOrVar;
  protoLength: NumOrVar;
  modelLength: NumOrVar;
  modelSpeed: NumOrVar;
  protoViscosity?: NumOrVar;
  modelViscosity?: NumOrVar;
  reynolds?: NumOrVar;
  body?: 'car' | 'ship';
}

export type FluidSystemSpec =
  | FluidTankSpec
  | FluidManometerSpec
  | FluidGateSpec
  | FluidBuoyancySpec
  | FluidVenturiSpec
  | FluidPitotSpec
  | FluidJetSpec
  | FluidPipeSpec
  | FluidParallelSpec
  | FluidLoopSpec
  | FluidFullSpec
  | FluidPlateSpec
  | FluidModelSpec;

export type He1gSpec = FluidSystemSpec;

/** The variable ids a `fluidSystem` picture reads (for the module tests). */
export function he1gSpecVars(r: He1gSpec): string[] {
  const out: string[] = [];
  const walk = (x: unknown) => {
    if (typeof x === 'string') out.push(x);
    else if (Array.isArray(x)) x.forEach(walk);
    else if (x && typeof x === 'object') Object.values(x).forEach(walk);
  };
  for (const [k, v] of Object.entries(r))
    if (!['kind', 'mode', 'fluid', 'gaugeFluid', 'body', 'rule', 'keep'].includes(k)) walk(v);
  return [...new Set(out)];
}

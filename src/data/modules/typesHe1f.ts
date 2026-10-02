/**
 * College picture kinds of round 1, group F (docs/RENDERINGS_HE.md): HC5 `controlVolume` and
 * HC13 `velocityProfile`. Kept apart from `types.ts` so its union only names them. A `NumOrVar`
 * is a fixed number or a variable id; values are read in the variable's own unit.
 */
import type { NumOrVar } from './typesGraphs';

// ─── HC5: a control volume round a process unit or a steady-flow device ──────

/** A flow: one value, or a sum of values ([1, 'f'] is 1 + f, a combustor's gas per kg of air). */
export type CvFlow = NumOrVar | NumOrVar[];

/** One stream crossing (or, for a bypass, running inside) the control volume. */
export interface CvStream {
  /** The stream's name on its arrow ("Feed", "Air", "Distillate"). */
  name: string;
  /** Into or out of the control volume; `inside` is a stream between two parts (a bypass). */
  dir: 'in' | 'out' | 'inside';
  /** The total flow (F, ṁ, ṅ, q), in the unit of its variable. */
  flow?: CvFlow;
  /** The flow's symbol and unit when `flow` is a fixed number or a sum ("ṁ", "kg"). */
  symbol?: string;
  unit?: string;
  /** Component fractions of the flow, by component name. */
  fractions?: { name: string; x: NumOrVar }[];
  /** The component that makes up the rest (1 − Σx), e.g. water beside ethanol. */
  rest?: string;
  /** Component flows by name (mol/h of each), where the page counts them. */
  amounts?: { name: string; n: NumOrVar }[];
  /** Specific enthalpy h (kJ/kg), speed V (m/s), temperature T and pressure P at the port. */
  h?: NumOrVar;
  V?: NumOrVar;
  T?: NumOrVar;
  P?: NumOrVar;
  /** Further values labelled on the stream (molar flows, a mole fraction, dry CO₂ %). */
  more?: string[];
  /** Symbols named on the stream with no value (a degrees-of-freedom page); lit = unknown. */
  tags?: { text: string; unknown?: boolean }[];
}

/**
 * HC5 (ACC-P9, ME-P11): a unit (`unit`) or a steady-flow device in metal (`device`) inside a
 * dashed control volume, its streams as labelled arrows (flow, composition, ṁ, h, V, T), Q̇ and Ẇ
 * arrows, a balance line "in = out" per component and, where the streams carry energy, an energy
 * bar (Σṁh in + Q̇ = Σṁh out + Ẇ).
 *
 * Streams by unit, in order (ins on the left, outs on the right unless named):
 * - `stream`: one stream (an arrow and its composition box).
 * - `mixer`, `splitter`, `mixingChamber`, `box`: any ins and outs.
 * - `column`: feed, distillate (top), bottoms. `recovery` is the first component's share of the
 *   feed's that leaves in the distillate.
 * - `evaporator`: feed, vapour (out of the top), concentrate; with `bypass`, six: fresh feed,
 *   vapour, product, then inside the bypass, the evaporator feed and the concentrate.
 * - `burner`: fuel, air, flue gas (`reaction` names the reaction and its extent).
 * - `tank`: in, out (`volume`, `residence`, and `loading` for an aeration tank).
 * - `heater`: in, out (`heat`, and `steam` condensing to supply it).
 * - `membrane`: feed, retentate, permeate (out of the bottom); `pressure` draws ΔP and π bars.
 * - `stages`: feed, solvent, raffinate, extract (`stages` draws the chain).
 * - devices: inlets then outlets; `heat` Q̇ into the volume, `work` Ẇ out of it (negative = in).
 */
export interface ControlVolumeSpec {
  kind: 'controlVolume';
  unit?:
    | 'stream'
    | 'box'
    | 'mixer'
    | 'splitter'
    | 'column'
    | 'evaporator'
    | 'burner'
    | 'tank'
    | 'heater'
    | 'membrane'
    | 'stages';
  device?: 'turbine' | 'compressor' | 'pump' | 'nozzle' | 'diffuser' | 'valve' | 'mixingChamber';
  streams: CvStream[];
  /** Heat rate Q̇ into the control volume (negative: lost), in the energy unit of ṁh. */
  heat?: NumOrVar;
  /** Work rate Ẇ out of the control volume (negative: work done on it). */
  work?: NumOrVar;
  /** `work` is the work done on the volume (a pump's or compressor's Ẇ_in, positive). */
  workIn?: boolean;
  /** The energy bar's unit ("kW", "kJ/kg"); default Q̇'s or Ẇ's unit, else kJ/kg. */
  energyUnit?: string;
  /** Specific heat: a stream with T and no h carries h = c_p T (from 0 in T's unit). */
  cp?: NumOrVar;
  /** The evaporator's bypass line (six streams, above). */
  bypass?: boolean;
  /** One reaction: its equation, each species' coefficient (− for reactants) and the extent ξ. */
  reaction?: { equation: string; nu: Record<string, number>; extent: NumOrVar };
  /** `column`: the light key's recovery in the distillate, as a fraction (0.924) or a %. */
  recovery?: NumOrVar;
  /** `column`: whether `recovery` is a percent. */
  recoveryPercent?: boolean;
  /** `heater`: steam condensing at ṁ_s with latent heat λ supplies Q̇ = ṁ_sλ. */
  steam?: { flow: NumOrVar; latent: NumOrVar };
  /** `membrane`: applied ΔP and osmotic π (bar), the water permeability A_w and flux J_w. */
  pressure?: {
    applied: NumOrVar;
    osmotic?: NumOrVar;
    permeability?: NumOrVar;
    flux?: NumOrVar;
  };
  /** `membrane` (gas permeation): the selectivity α, so y_A ÷ (1 − y_A) = αx_A ÷ (1 − x_A). */
  selectivity?: NumOrVar;
  /** `tank`: the liquid volume V. */
  volume?: NumOrVar;
  /** `tank`: residence time τ = V ÷ q × `factor` (24 for V ÷ q in days and τ in hours). */
  residence?: { tau: NumOrVar; factor?: number };
  /** Aeration tank: biomass X, F/M = QS₀ ÷ (VX) (`ratio`) and the feed's substrate S₀. */
  loading?: { biomass: NumOrVar; ratio: NumOrVar; substrate: NumOrVar };
  /**
   * `stages`: n equilibrium stages, crosscurrent (fresh solvent split equally into each) or
   * countercurrent; distribution coefficient K_D, total solvent-to-feed ratio S ÷ F, the
   * fraction of solute left in the raffinate and the extraction factor E per stage.
   */
  stages?: {
    count: NumOrVar;
    flow: 'crosscurrent' | 'countercurrent';
    kd: NumOrVar;
    ratio: NumOrVar;
    left?: NumOrVar;
    factor?: NumOrVar;
  };
  /** A degrees-of-freedom page: unknowns, balances, specifications, relations and the DOF. */
  dof?: {
    unknowns: NumOrVar;
    balances: NumOrVar;
    specs: NumOrVar;
    relations: NumOrVar;
    dof: NumOrVar;
  };
  /** The flow unit printed on the balance lines ("kg/h"); default the first flow's unit. */
  balanceUnit?: string;
}

// ─── HC13: velocity (and concentration) profiles ─────────────────────────────

/**
 * HC13 (ACC-P31 less `temperature`, B-P28). Modes:
 * - `tube`: a tube (or, with `vessel`, a blood vessel) cut lengthwise, parabolic velocity arrows
 *   v = v_max(1 − r² ÷ R²), v_max on the axis, v_avg dashed, τ_w ticks at the wall, P₁ and P₂ at
 *   the ends, R and L bracketed. v_max = 2v_avg = 2Q ÷ πR².
 * - `plates`: Couette flow, a linear profile from 0 to the top plate's V over the gap h, τ = μV ÷ h.
 * - `film`: a liquid film falling down a wall (β from vertical), a half parabola from 0 at the
 *   wall to v_max = 1.5v_avg at the free surface.
 * - `concentration`: steady diffusion across a film of thickness L, a straight line from c_A1 to
 *   c_A2, the flux N_A = D(c_A1 − c_A2) ÷ L.
 * - `stefan`: a Stefan tube, liquid A at the bottom evaporating up through stagnant gas; x_A
 *   falls from x_A1 to x_A2 on the curve (1 − x_A) = (1 − x_A1)((1 − x_A2) ÷ (1 − x_A1))^(z ÷ L).
 * - `analogy`: velocity, thermal and concentration boundary layers side by side,
 *   δ_T = δPr^(−1/3) and δ_c = δSc^(−1/3).
 *
 * `si` gives each value's factor to SI (r in mm: 0.001; Q in mL/min: 1 ÷ 60,000,000) where the
 * page's units are not SI; the checks and the drawing work in SI.
 */
export interface VelocityProfileSpec {
  kind: 'velocityProfile';
  mode: 'tube' | 'plates' | 'film' | 'concentration' | 'stefan' | 'analogy';
  /** `tube`: draw a blood vessel's wall and blood instead of a steel tube and water. */
  vessel?: boolean;
  /** Radius R (tube), or the gap h (plates). */
  R?: NumOrVar;
  h?: NumOrVar;
  /** Centre speed, mean speed and flow rate. */
  vmax?: NumOrVar;
  vavg?: NumOrVar;
  Q?: NumOrVar;
  /** Wall shear stress τ_w (the plates' τ). */
  tauW?: NumOrVar;
  /** Pressures at the ends, or the drop between them, and the length L between them. */
  P1?: NumOrVar;
  P2?: NumOrVar;
  dP?: NumOrVar;
  L?: NumOrVar;
  /** Viscosity μ. */
  mu?: NumOrVar;
  /** `plates`: the top plate's speed V. */
  V?: NumOrVar;
  /** `film`: thickness δ and the wall's angle β from vertical (degrees). */
  delta?: NumOrVar;
  angle?: NumOrVar;
  /** `concentration`: c_A1, c_A2 at the faces, D_AB and the flux N_A. */
  cA1?: NumOrVar;
  cA2?: NumOrVar;
  D?: NumOrVar;
  flux?: NumOrVar;
  /** `stefan`: mole fractions at the liquid surface and the top, and the total concentration c. */
  x1?: NumOrVar;
  x2?: NumOrVar;
  c?: NumOrVar;
  /** `analogy`: Re, Pr, Sc (and Nu, Sh to label). */
  Re?: NumOrVar;
  Pr?: NumOrVar;
  Sc?: NumOrVar;
  Nu?: NumOrVar;
  Sh?: NumOrVar;
  /** Factors to SI by field name (R, Q, L, vmax, vavg, mu, tauW, dP, P1, P2, V, h, delta, D, c). */
  si?: Partial<Record<string, number>>;
}

export type He1fSpec = ControlVolumeSpec | VelocityProfileSpec;

const ids = (xs: (NumOrVar | NumOrVar[] | undefined)[]) =>
  xs.flat().filter((x): x is string => typeof x === 'string');

/** The variable ids a group F picture reads (for the module tests). */
export function he1fSpecVars(r: He1fSpec): string[] {
  if (r.kind === 'velocityProfile') {
    const { kind: _k, mode: _m, vessel: _v, si: _s, ...rest } = r;
    return ids(Object.values(rest));
  }
  return ids([
    ...r.streams.flatMap((s) => [
      s.flow,
      ...(s.fractions ?? []).map((f) => f.x),
      ...(s.amounts ?? []).map((a) => a.n),
      s.h,
      s.V,
      s.T,
      s.P,
      ...(s.more ?? []),
    ]),
    r.heat,
    r.work,
    r.cp,
    r.reaction?.extent,
    r.recovery,
    r.steam?.flow,
    r.steam?.latent,
    r.selectivity,
    ...Object.values(r.pressure ?? {}),
    r.volume,
    r.residence?.tau,
    ...Object.values(r.loading ?? {}),
    ...(r.stages
      ? [r.stages.count, r.stages.kd, r.stages.ratio, r.stages.left, r.stages.factor]
      : []),
    ...Object.values(r.dof ?? {}),
  ]);
}

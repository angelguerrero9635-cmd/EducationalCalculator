/**
 * College picture kinds of round 2, group C (docs/RENDERINGS_HE.md): HC17 `propertyDiagram`
 * and HC23 `thermalWall`.
 * Kept apart from `types.ts` so its union only names them. A `NumOrVar` is a fixed number or a
 * variable id; values are read in the variable's own unit.
 */
import type { NumOrVar } from './typesGraphs';

// ─── HC17: T–v, P–v and T–s planes ───────────────────────────────────────────

/** A value, or a sum of values (['h1', 'wp'] is h₁ + w_p, a pump's exit). */
export type PdNum = NumOrVar | NumOrVar[];

/**
 * A numbered state. Water: any two of T, P, v, s, h, x place it (P and x, P and v, P and h…);
 * gas: T and P (P relative is fine: 1 and r_p), or T and an isentropic partner's s.
 */
export interface PdState {
  /** Its number or name on the dot ("1", "2s"). */
  name: string;
  T?: NumOrVar;
  P?: NumOrVar;
  v?: NumOrVar;
  s?: NumOrVar;
  h?: PdNum;
  x?: NumOrVar;
  /** An ideal comparison state (the isentropic 2s beside the real 2): a hollow dot. */
  ideal?: boolean;
}

/** A process between two states. */
export interface PdStep {
  from: string;
  to: string;
  /**
   * `isobaric` follows the constant-pressure line (across the dome flat); `isentropic` is a
   * vertical line on T–s; `isothermal` a level line; `actual` a real process, dashed.
   */
  process: 'isobaric' | 'isentropic' | 'isothermal' | 'actual';
  /** Heat into or out of the working fluid along this step: a q arrow. */
  heat?: 'in' | 'out';
  /** The q (or w) labelled on the arrow. */
  q?: NumOrVar;
}

/**
 * HC17 (ME-P10, ACC-P10): a property plane, flat like a chart.
 * - `Tv` and `Pv` with `substance: 'water'`: the vapor dome on a log v axis (P–v log–log), the
 *   critical point, a tie line at P with v_f and v_g, the state on it with x.
 * - `Ts`, water: the dome on T–s, states, isobars that follow the liquid line, run flat across
 *   the dome and rise through the superheat; whole cycles (Rankine) with q_in and q_out.
 * - `Ts`, `substance: 'gas'`: constant-pressure lines T = T₀e^((s − s₀) ÷ c_p), states,
 *   isentropic steps vertical and real ones dashed, Δs bracketed (Brayton, a compressor).
 * - `Pv`, `substance: 'gas'`: an `isotherm` (van der Waals or the two-term virial) beside the
 *   ideal-gas one (dashed), the state and the vdW critical point.
 */
export interface PropertyDiagramSpec {
  kind: 'propertyDiagram';
  plane: 'Tv' | 'Pv' | 'Ts';
  substance: 'water' | 'gas';
  states?: PdState[];
  steps?: PdStep[];
  /** The cycle's name for the caption. */
  cycle?: 'rankine' | 'brayton';
  /** Water: the tie line at P with the page's typed v_f, v_g (checked against IAPWS). */
  tie?: { P: NumOrVar; vf?: NumOrVar; vg?: NumOrVar };
  /** Gas: c_p and k (or R), from the page. */
  gas?: { cp: NumOrVar; k?: NumOrVar; R?: NumOrVar };
  /** Gas on T–s: constant-pressure lines drawn across the plane, with their names. */
  isobars?: { P: NumOrVar; name: string }[];
  /** Δs between two states, bracketed under them and labelled with the page's value. */
  ds?: { from: string; to: string; value: NumOrVar };
  /** Further values said in the caption (w_net, η, Z). */
  more?: string[];
  /**
   * Gas on P–v: one isotherm at T. `vdw` takes a and b (SI: Pa·m⁶/mol², m³/mol); `virial`
   * takes Z at the state's P (B = (Z − 1)RT ÷ P). R from the page (8.314 J/(mol·K)). The state
   * sits at V (or, for the virial, V = ZRT ÷ P) and P.
   */
  isotherm?: {
    model: 'vdw' | 'virial';
    T: NumOrVar;
    R: NumOrVar;
    a?: NumOrVar;
    b?: NumOrVar;
    Z?: NumOrVar;
    P?: NumOrVar;
    V?: NumOrVar;
    /** The gas's name in the caption ("CO₂"). */
    name?: string;
  };
  /** Units of T, P (and the isotherm's V): water °C and kPa, gas K and bar by default. */
  units?: { T?: 'K' | '°C'; P?: 'kPa' | 'MPa' | 'bar'; V?: 'L/mol' | 'm³/mol' };
}

// ─── HC23: heat through walls, pipes, fins, tubes, wires and to the surroundings ─

/** One plane layer of a wall, in its material. */
export interface ThermalLayer {
  L: NumOrVar;
  k: NumOrVar;
  material: 'brick' | 'foam' | 'steel' | 'concrete' | 'wood' | 'glass';
  /** Its name over the layer ("Brick"); default the material's. */
  name?: string;
}

/**
 * HC23 (ME-P14, ACC-P31 `temperature`). Modes:
 * - `wall`: plane layers in their materials (to scale by L) between inside and outside air, the
 *   temperature stepping straight through each layer and dropping across each film, the
 *   resistance network beneath (1 ÷ h, L ÷ k), q″ along it. Per m² of wall.
 * - `cylinder`: a pipe's insulation in section to scale (r₁, r₂), the log temperature profile
 *   beside it, the outer film with h, R_cond and R_conv in series, the critical radius r_c = k ÷ h.
 * - `fin`: a pin fin on a hot base, its temperature fading as cosh(m(L − x)) ÷ cosh(mL), θ(x)
 *   plotted under it, the heat q leaving the base.
 * - `tube`: flow in a tube cut lengthwise, heat into the water through the wall, h = Nu k ÷ D.
 * - `radiation`: a surface in large surroundings, εσT_s⁴ out and εσT_surr⁴ in as arrows to scale.
 * - `wire`: a wire with heat generation S, T(r) a parabola from T_s to T_center.
 */
export interface ThermalWallSpec {
  kind: 'thermalWall';
  mode: 'wall' | 'cylinder' | 'fin' | 'tube' | 'radiation' | 'wire';
  /** `wall`: the layers, inside to outside. */
  layers?: ThermalLayer[];
  /** Inside and outside temperatures (fluid or surroundings) and their film coefficients. */
  Tin?: NumOrVar;
  Tout?: NumOrVar;
  hIn?: NumOrVar;
  hOut?: NumOrVar;
  /** Total resistance (wall: R″ per m²; cylinder: per length or for the length). */
  R?: NumOrVar;
  /** The heat: flux q″, rate per length q′ or rate q, as the page has it. */
  q?: NumOrVar;
  /** `cylinder`: radii, conductivity, the outer h, the length, ΔT (when no T_in, T_out). */
  r1?: NumOrVar;
  r2?: NumOrVar;
  k?: NumOrVar;
  h?: NumOrVar;
  length?: NumOrVar;
  dT?: NumOrVar;
  Rcond?: NumOrVar;
  Rconv?: NumOrVar;
  rc?: NumOrVar;
  /** `fin` and `tube`: diameter D; `fin`: length L, m and the base excess θ_b. */
  D?: NumOrVar;
  L?: NumOrVar;
  m?: NumOrVar;
  thetaB?: NumOrVar;
  /** `tube`: speed V, kinematic viscosity ν, Re, Pr, Nu. */
  V?: NumOrVar;
  nu?: NumOrVar;
  Re?: NumOrVar;
  Pr?: NumOrVar;
  Nu?: NumOrVar;
  /** `radiation`: emissivity, area, surface and surroundings temperatures, σ from the page. */
  eps?: NumOrVar;
  A?: NumOrVar;
  Ts?: NumOrVar;
  Tsurr?: NumOrVar;
  sigma?: NumOrVar;
  /** `wire`: generation S (W/m³), radius, T_s (Ts) and the centre's T_c. */
  S?: NumOrVar;
  radius?: NumOrVar;
  Tc?: NumOrVar;
  /** Lengths' unit factor to metres where the page types mm (r₁, r₂, D, L, radius). */
  si?: number;
  /** Further values said in the caption. */
  more?: string[];
}

export type He2cSpec = PropertyDiagramSpec | ThermalWallSpec;

const ids = (xs: (NumOrVar | NumOrVar[] | undefined)[]) =>
  xs.flat().filter((x): x is string => typeof x === 'string');

/** The variable ids a group C picture reads (for the module tests). */
export function he2cSpecVars(r: He2cSpec): string[] {
  if (r.kind === 'thermalWall') {
    const { kind: _k, mode: _m, si: _s, layers, more, ...rest } = r;
    return ids([
      ...Object.values(rest),
      ...(layers ?? []).flatMap((l) => [l.L, l.k]),
      ...(more ?? []),
    ]);
  }
  return ids([
    ...(r.states ?? []).flatMap((s) => [s.T, s.P, s.v, s.s, s.h, s.x]),
    ...(r.steps ?? []).map((s) => s.q),
    r.tie?.P,
    r.tie?.vf,
    r.tie?.vg,
    r.gas?.cp,
    r.gas?.k,
    r.gas?.R,
    ...(r.isobars ?? []).map((i) => i.P),
    r.ds?.value,
    ...(r.more ?? []),
    ...(r.isotherm
      ? [
          r.isotherm.T,
          r.isotherm.R,
          r.isotherm.a,
          r.isotherm.b,
          r.isotherm.Z,
          r.isotherm.P,
          r.isotherm.V,
        ]
      : []),
  ]);
}

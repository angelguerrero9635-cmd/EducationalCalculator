/**
 * College picture kinds of round 3, group H (docs/RENDERINGS_HE.md): HC40 `heatExchanger`, HC52
 * `fatigueDiagram`, HC59 `shaft`.
 * Kept apart from `types.ts` so its union only names them. A `NumOrVar` is a fixed number or a
 * variable id; a variable is read in its own unit and turned into the kind's base unit
 * (`reps/he3hUnits.ts`: W for heat rates, W/K for capacity rates, m² for areas); a fixed number
 * is taken in the base unit already.
 */
import type { NumOrVar } from './typesGraphs';

// ─── HC40: a double-pipe heat exchanger and its temperature profiles ─────────

/**
 * A double-pipe exchanger (the hot stream in the inner tube, the cold one in the shell, each
 * painted in its fluid) above the two temperature lines along the length, drawn from the
 * values: ΔT(x) falls exponentially from ΔT₁ (x = 0, the hot inlet's end) to ΔT₂, so the lines
 * curve as they truly do. ΔT₁ and ΔT₂ are bracketed at the ends and ΔT_lm dashed where the local
 * difference equals it; the stream whose temperature changes more is named C_min. Temperatures
 * that can't be an exchanger (the hot line crossing the cold) draw faded with the reason.
 *
 * `ntu` pages that have no outlet temperatures pass `q`, `Cmin`, `Cr` and `minSide`, and the
 * picture works the outlets out (the C_min stream changes by q ÷ C_min, the other by C_r of it).
 */
export interface HeatExchangerSpec {
  kind: 'heatExchanger';
  arrangement: 'counter' | 'parallel';
  /** Inlet and outlet temperatures, all in one unit (°C or K). */
  Thi: NumOrVar;
  Tho?: NumOrVar;
  Tci: NumOrVar;
  Tco?: NumOrVar;
  /** The end differences and the LMTD (K), when the page has them as values. */
  dT1?: NumOrVar;
  dT2?: NumOrVar;
  lmtd?: NumOrVar;
  /** Heat rate (W, kW or MW by its unit), U (W/(m²·K)) and area (m²). */
  q?: NumOrVar;
  U?: NumOrVar;
  A?: NumOrVar;
  /** Mass flows (kg/s) and specific heats (kJ/(kg·K) or J/(kg·K) by unit) of each stream. */
  mh?: NumOrVar;
  cph?: NumOrVar;
  mc?: NumOrVar;
  cpc?: NumOrVar;
  /** `ntu`: C_min (W/K or kW/K), C_r, NTU, effectiveness ε, and which stream is C_min. */
  Cmin?: NumOrVar;
  Cr?: NumOrVar;
  ntu?: NumOrVar;
  eff?: NumOrVar;
  minSide?: 'hot' | 'cold';
  /** The streams' names ("oil", "water") and how each is painted. */
  hotName?: string;
  coldName?: string;
  hotFluid?: 'oil' | 'water' | 'gas';
  coldFluid?: 'water' | 'air' | 'oil';
  /** Further values said in the caption. */
  more?: string[];
}

// ─── HC59: a round shaft in torsion (and bending) ────────────────────────────

/**
 * A steel shaft with T at both ends as curved arrows and a scribed line twisting by φ (drawn
 * larger on the side, said, when φ is too small to see; the end view shows it to scale); the end
 * face with τ growing linearly from the centre (from the bore when `di` is given, the ring to
 * scale). With `moment` the shaft sags under M and the stress element at the surface carries σ
 * and τ. A power page (`power`, `speed`) draws the end view turning at n. Units by each variable's
 * unit: T and M in N·m (or N·mm, kN·m), d, d_i and L in mm (or m), G in GPa, stresses in MPa, φ in
 * rad or °, P in W or kW; a fixed number in N·m, mm, GPa, MPa, rad and W.
 */
export interface ShaftSpec {
  kind: 'shaft';
  /** Outer diameter, and the bore (hollow) when given. */
  d: NumOrVar;
  di?: NumOrVar;
  length?: NumOrVar;
  torque?: NumOrVar;
  G?: NumOrVar;
  J?: NumOrVar;
  /** τ_max at the surface and the angle of twist φ (worked out here when not given). */
  tau?: NumOrVar;
  angle?: NumOrVar;
  /** Bending: the moment M, σ at the surface, von Mises σ′, yield S_y and the factor n. */
  moment?: NumOrVar;
  sigma?: NumOrVar;
  vonMises?: NumOrVar;
  n?: NumOrVar;
  /** A power page: P, the speed n (rpm) and τ_allow. */
  power?: NumOrVar;
  speed?: NumOrVar;
  tauAllow?: NumOrVar;
  /** Further values said in the caption. */
  more?: string[];
}

// ─── HC52: fatigue: Goodman, S–N, Basquin, Miner ─────────────────────────────

/**
 * Fatigue diagrams, flat, drawn from the values. Modes:
 * - `goodman`: σ_m against σ_a; the Goodman line from (0, S_e) to (S_ut, 0) with the safe side
 *   shaded, the yield line (S_y) dashed, the point (σ_m, σ_a) (from σ_max and σ_min when given)
 *   and the load line from the origin to the Goodman line, where n is the ratio of the lengths.
 * - `sn`: the S–N line on log–log axes from (10³, fS_ut) to (10⁶, S_e), flat after; the page's
 *   S_f read across to its life N (a and b worked out when not given; f defaults to 0.9).
 * - `basquin`: σ_a = σ′_f(2N)^b over reversals 2N from 1, the page's σ_a read across to 2N.
 * - `miner`: a bar to failure at D = 1, each block's nᵢ ÷ Nᵢ in turn, D bracketed, the set
 *   repeated until the bar fills (1 ÷ D).
 * Stresses by their unit (MPa, kPa, GPa, psi, ksi); a fixed number in MPa.
 */
export interface FatigueDiagramSpec {
  kind: 'fatigueDiagram';
  mode: 'goodman' | 'sn' | 'basquin' | 'miner';
  /** Endurance limit (or fatigue strength at the design life), ultimate and yield strengths. */
  Se?: NumOrVar;
  Sut?: NumOrVar;
  Sy?: NumOrVar;
  /** The load: alternating and mean stress, or the cycle's largest and smallest stress. */
  sa?: NumOrVar;
  sm?: NumOrVar;
  smax?: NumOrVar;
  smin?: NumOrVar;
  /** The factor of safety. */
  n?: NumOrVar;
  /** `sn`: the fraction f of S_ut at 10³ cycles, the stress level S_f, the life N, a and b. */
  f?: NumOrVar;
  Sf?: NumOrVar;
  N?: NumOrVar;
  a?: NumOrVar;
  b?: NumOrVar;
  /** `basquin`: σ′_f and reversals 2N (b, σ_a and N shared). */
  sigmaF?: NumOrVar;
  reversals?: NumOrVar;
  /** `miner`: each block's cycles n and life N, the damage D and repeats to failure. */
  blocks?: { n: NumOrVar; N: NumOrVar }[];
  D?: NumOrVar;
  repeats?: NumOrVar;
  /** Further values said in the caption. */
  more?: string[];
}

export type He3hSpec = HeatExchangerSpec | ShaftSpec | FatigueDiagramSpec;

const ids = (xs: (NumOrVar | NumOrVar[] | undefined)[]) =>
  xs.flat().filter((x): x is string => typeof x === 'string');

/** The variable ids a group H picture reads (for the module tests). */
export function he3hSpecVars(r: He3hSpec): string[] {
  if (r.kind === 'fatigueDiagram') {
    const { kind: _k, mode: _m, blocks, more, ...rest } = r;
    return ids([
      ...Object.values(rest),
      ...(blocks ?? []).flatMap((x) => [x.n, x.N]),
      ...(more ?? []),
    ]);
  }
  if (r.kind === 'shaft') {
    const { kind: _k, more, ...rest } = r;
    return ids([...Object.values(rest), ...(more ?? [])]);
  }
  const {
    kind: _k,
    arrangement: _a,
    minSide: _m,
    hotName: _hn,
    coldName: _cn,
    hotFluid: _hf,
    coldFluid: _cf,
    more,
    ...rest
  } = r;
  return ids([...Object.values(rest), ...(more ?? [])]);
}

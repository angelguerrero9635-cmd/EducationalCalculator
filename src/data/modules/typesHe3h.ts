/**
 * College picture kinds of round 3, group H (docs/RENDERINGS_HE.md): HC40 `heatExchanger`.
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

export type He3hSpec = HeatExchangerSpec;

const ids = (xs: (NumOrVar | NumOrVar[] | undefined)[]) =>
  xs.flat().filter((x): x is string => typeof x === 'string');

/** The variable ids a group H picture reads (for the module tests). */
export function he3hSpecVars(r: He3hSpec): string[] {
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

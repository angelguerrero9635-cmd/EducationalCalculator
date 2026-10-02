/**
 * College pictures of round 3, group G (docs/RENDERINGS_HE.md): HC43 `gasPiston` options `pv`
 * and `real`. Kept apart from the shared type files, which name these with one line each. A
 * `NumOrVar` is a fixed number or a variable id; values are read in the variable's own unit.
 */
import type { NumOrVar } from './typesGraphs';

// ─── HC43: gasPiston `pv` and `real` ─────────────────────────────────────────

/** A path between two states on a P–V diagram. */
export type GasPath = 'isothermal' | 'adiabatic' | 'isobaric' | 'isochoric';

/** One corner of a cycle: its volume and its pressure or temperature (one gives the other). */
export interface GasCorner {
  volume: NumOrVar;
  pressure?: NumOrVar;
  temperature?: NumOrVar;
}

/**
 * HC43 `pv`: the P–V diagram beside the piston (the cylinder at state 2, state 1's piston
 * dashed). The path from state 1 to 2 is drawn to scale with the area under it shaded as the
 * work, its sign named; the isotherms through both ends are dashed.
 *
 * - `path`: 'isothermal' (P = P₁V₁ ÷ V), 'adiabatic' (P = P₁(V₁ ÷ V)^γ), 'isobaric' (P held),
 *   'isochoric' (V held, no work) or 'cycle' (`corners` joined by `legs`, the enclosed area the
 *   net work, clockwise positive).
 * - States: `v1`, `v2` and any of `p1`, `p2`, `t1`, `t2`. A missing pressure follows from
 *   PV = nRT (`moles`, `R`) or from the path; a missing T₂ from the path.
 * - `R` is the page's gas constant (8.314 J/(mol·K) by default); the pressure axis is in the
 *   units R and the volume give (`units.pressure`, default kPa for L, Pa for m³, atm when R is
 *   0.08206) and the work in `units.work` (default J, L·atm with R = 0.08206).
 * - `gamma` (γ) or `cv` (C_V, γ = 1 + R ÷ C_V) for the adiabat.
 * - `work`: the page's work, `sign: 'by'` (physics, W by the gas, the default) or `'on'`
 *   (chemistry, w = −∫P dV); `heat` (Q or q) is named in the caption when given.
 * - Drag state 2 along the path to change `v2` (`keep` pins typed values, `fixed` no handle).
 */
export interface GasPv {
  path: GasPath | 'cycle';
  v1?: NumOrVar;
  v2?: NumOrVar;
  p1?: NumOrVar;
  p2?: NumOrVar;
  t1?: NumOrVar;
  t2?: NumOrVar;
  moles?: NumOrVar;
  R?: number;
  gamma?: NumOrVar;
  cv?: NumOrVar;
  work?: NumOrVar;
  heat?: NumOrVar;
  sign?: 'by' | 'on';
  units?: { pressure?: string; work?: string };
  /** 'cycle': the corners in order and the path of each leg (corner i to i + 1, the last back). */
  corners?: GasCorner[];
  legs?: GasPath[];
  keep?: string[];
  fixed?: boolean;
}

/**
 * HC43 `real`: a van der Waals gas in the piston (`volume`, `temperature`, `moles`, `R` from
 * the gasPiston spec, R = 0.08206 L·atm/(mol·K) by default). The molecules are drawn with their
 * own volume (the excluded volume nb as a band to scale at the foot of the gas) and short
 * attraction lines between neighbours, as many as the share of pressure attraction takes away;
 * two gauges on one scale read the ideal pressure nRT ÷ V and the van der Waals pressure
 * nRT ÷ (V − nb) − an² ÷ V²; Z = PV ÷ (nRT) is in the caption.
 */
export interface GasReal {
  a: NumOrVar;
  b: NumOrVar;
  /** The ideal pressure P_id and the van der Waals pressure P (checked). */
  ideal?: NumOrVar;
  pressure?: NumOrVar;
  /** The compressibility factor Z (checked). */
  z?: NumOrVar;
  /** The gas's name in the caption ("CO₂"). */
  gas?: string;
}

const ids = (xs: (NumOrVar | undefined)[]) => xs.filter((x): x is string => typeof x === 'string');

/** The variable ids the HC43 options read (for the module tests). */
export function gasHe3gVars(r: { pv?: GasPv; real?: GasReal }): string[] {
  const out: string[] = [];
  if (r.pv) {
    const p = r.pv;
    out.push(
      ...ids([p.v1, p.v2, p.p1, p.p2, p.t1, p.t2, p.moles, p.gamma, p.cv, p.work, p.heat]),
      ...ids((p.corners ?? []).flatMap((c) => [c.volume, c.pressure, c.temperature])),
    );
  }
  if (r.real) out.push(...ids([r.real.a, r.real.b, r.real.ideal, r.real.pressure, r.real.z]));
  return out;
}

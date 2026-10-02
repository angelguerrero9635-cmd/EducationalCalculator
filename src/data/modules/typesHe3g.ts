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

// ─── HC44: energyProfile `quantity`, `steps`, `bomb` ─────────────────────────

/**
 * What an energy profile or ladder measures: enthalpy (the default, ΔH) or free energy, as
 * ΔG, ΔG° or ΔG°′ (pH 7, the biochemists' standard). It renames the levels, steps and axis and
 * says "runs forward on its own" (exergonic) for a drop instead of "gives off heat".
 */
export type EnergyQuantity = 'H' | 'G' | 'G°' | 'G°′';

/**
 * HC44 `steps`: a mechanism of 2–3 steps on the profile. The first step's barrier is the
 * profile's `activation`; `intermediates` are the levels between steps (one fewer than the
 * steps), `barriers` each later step's Eₐ from the level before it. `tops` name each transition
 * state's energy and `highest` the highest (checked); the highest hump is marked
 * rate-determining. `names` label the intermediates ("R⁺ + Br⁻").
 */
export interface EnergySteps {
  intermediates: NumOrVar[];
  barriers: NumOrVar[];
  tops?: NumOrVar[];
  highest?: NumOrVar;
  names?: string[];
}

/**
 * HC44 `mode: 'bomb'`: a bomb calorimeter at constant volume. A steel bomb with the sample cup
 * and its ignition wires, in a bucket of water with a stirrer and a thermometer, all in an
 * insulated jacket. The thermometer rises by `change` (ΔT, °C); `constant` is the calorimeter
 * constant C_cal (kJ/°C) and `q` (kJ) is checked as C_cal × ΔT. `sample` names what burns, its
 * mass and moles; `deltaU` (kJ/mol) is checked as −q ÷ n and `deltaH` as ΔU + Δn_g RT with
 * `gas` (Δn_g, gases only) and `temperature` (K), R = 0.008314 kJ/(mol·K) unless `R` is given.
 */
export interface EnergyBombSpec {
  kind: 'energyProfile';
  mode: 'bomb';
  constant: NumOrVar;
  change: NumOrVar;
  q?: NumOrVar;
  sample?: { name?: string; mass?: NumOrVar; moles?: NumOrVar; molar?: NumOrVar };
  deltaU?: NumOrVar;
  deltaH?: NumOrVar;
  gas?: NumOrVar;
  temperature?: NumOrVar;
  R?: number;
}

/** The variable ids the HC44 options read (for the module tests). */
export function energyHe3gVars(r: object): string[] {
  const x = r as { steps?: EnergySteps; mode?: string } & Partial<EnergyBombSpec>;
  const out: string[] = [];
  if (x.steps)
    out.push(
      ...ids([
        ...x.steps.intermediates,
        ...x.steps.barriers,
        ...(x.steps.tops ?? []),
        x.steps.highest,
      ]),
    );
  if (x.mode === 'bomb')
    out.push(
      ...ids([
        x.constant,
        x.change,
        x.q,
        x.sample?.mass,
        x.sample?.moles,
        x.sample?.molar,
        x.deltaU,
        x.deltaH,
        x.gas,
        x.temperature,
      ]),
    );
  return out;
}

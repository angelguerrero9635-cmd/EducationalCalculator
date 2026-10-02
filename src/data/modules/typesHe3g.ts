/**
 * College pictures of round 3, group G (docs/RENDERINGS_HE.md): HC43 `gasPiston` options `pv`
 * and `real`, HC44 `energyProfile` options, HC57 the pathway detail and card. Kept apart from the shared type files, which name these with one line each. A
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

// ─── HC57: organelleEnergy `detail` and the `pathwayStep` card ───────────────

/** The pathways a detail scene or a stage card can draw. */
export type PathwayName = 'glycolysis' | 'krebs' | 'etc';

/** A molecule drawn as its carbon chain: carbons, phosphates on it, a CoA tag. */
export interface Metabolite {
  name: string;
  /** Its short name in the detail rows ("G3P"). */
  short: string;
  carbons: number;
  phosphates: number;
  coa?: boolean;
  /** Which carbons carry the phosphates (from 0), when not the chain's ends. */
  on?: number[];
}

/** What one step makes (+) or uses (−), per glucose (glycolysis) or per acetyl-CoA (krebs). */
export interface StepYield {
  ATP?: number;
  GTP?: number;
  NADH?: number;
  FADH2?: number;
  CO2?: number;
  H2O?: number;
}

/** One step: its enzyme, what goes in and comes out, and its yield. */
export interface PathwayStep {
  enzyme: string;
  from: Metabolite[];
  to: Metabolite[];
  yields: StepYield;
  /** ETC complexes: protons pumped out per pair of electrons (to the intermembrane space). */
  protons?: number;
  /** A note under the step (ETC: "NADH → NAD⁺"). */
  note?: string;
}

const m = (name: string, short: string, carbons: number, phosphates = 0, coa = false) => ({
  name,
  short,
  carbons,
  phosphates,
  ...(coa ? { coa } : {}),
});

const GLC = m('glucose', 'Glc', 6);
const G6P = m('glucose 6-phosphate', 'G6P', 6, 1);
const F6P = m('fructose 6-phosphate', 'F6P', 6, 1);
const FBP = m('fructose 1,6-bisphosphate', 'F1,6BP', 6, 2);
const DHAP = m('dihydroxyacetone phosphate', 'DHAP', 3, 1);
const G3P = m('glyceraldehyde 3-phosphate', 'G3P', 3, 1);
const BPG = m('1,3-bisphosphoglycerate', '1,3BPG', 3, 2);
const PG3 = m('3-phosphoglycerate', '3PG', 3, 1);
const PG2 = { ...m('2-phosphoglycerate', '2PG', 3, 1), on: [1] };
const PEP = { ...m('phosphoenolpyruvate', 'PEP', 3, 1), on: [1] };
const PYR = m('pyruvate', 'pyruvate', 3);
const ACOA = m('acetyl-CoA', 'acetyl-CoA', 2, 0, true);
const OAA = m('oxaloacetate', 'OAA', 4);
const CIT = m('citrate', 'citrate', 6);
const ICIT = m('isocitrate', 'isocitrate', 6);
const AKG = m('α-ketoglutarate', 'α-KG', 5);
const SCOA = m('succinyl-CoA', 'succinyl-CoA', 4, 0, true);
const SUCC = m('succinate', 'succinate', 4);
const FUM = m('fumarate', 'fumarate', 4);
const MAL = m('malate', 'malate', 4);

/**
 * The pathways' steps (Grade 13+ biochemistry): glycolysis per glucose (steps 6–10 run twice,
 * once for each G3P), the citric acid cycle per acetyl-CoA, and the electron transport chain
 * per pair of electrons.
 */
export const PATHWAYS: Record<PathwayName, PathwayStep[]> = {
  glycolysis: [
    { enzyme: 'hexokinase', from: [GLC], to: [G6P], yields: { ATP: -1 } },
    { enzyme: 'phosphoglucose isomerase', from: [G6P], to: [F6P], yields: {} },
    { enzyme: 'phosphofructokinase-1', from: [F6P], to: [FBP], yields: { ATP: -1 } },
    { enzyme: 'aldolase', from: [FBP], to: [DHAP, G3P], yields: {} },
    { enzyme: 'triose phosphate isomerase', from: [DHAP], to: [G3P], yields: {} },
    { enzyme: 'G3P dehydrogenase', from: [G3P], to: [BPG], yields: { NADH: 2 } },
    { enzyme: 'phosphoglycerate kinase', from: [BPG], to: [PG3], yields: { ATP: 2 } },
    { enzyme: 'phosphoglycerate mutase', from: [PG3], to: [PG2], yields: {} },
    { enzyme: 'enolase', from: [PG2], to: [PEP], yields: { H2O: 2 } },
    { enzyme: 'pyruvate kinase', from: [PEP], to: [PYR], yields: { ATP: 2 } },
  ],
  krebs: [
    { enzyme: 'citrate synthase', from: [ACOA, OAA], to: [CIT], yields: {} },
    { enzyme: 'aconitase', from: [CIT], to: [ICIT], yields: {} },
    { enzyme: 'isocitrate dehydrogenase', from: [ICIT], to: [AKG], yields: { NADH: 1, CO2: 1 } },
    {
      enzyme: 'α-ketoglutarate dehydrogenase',
      from: [AKG],
      to: [SCOA],
      yields: { NADH: 1, CO2: 1 },
    },
    { enzyme: 'succinyl-CoA synthetase', from: [SCOA], to: [SUCC], yields: { GTP: 1 } },
    { enzyme: 'succinate dehydrogenase', from: [SUCC], to: [FUM], yields: { FADH2: 1 } },
    { enzyme: 'fumarase', from: [FUM], to: [MAL], yields: {} },
    { enzyme: 'malate dehydrogenase', from: [MAL], to: [OAA], yields: { NADH: 1 } },
  ],
  etc: [
    { enzyme: 'Complex I', from: [], to: [], yields: {}, protons: 4, note: 'NADH → NAD⁺' },
    {
      enzyme: 'Complex II',
      from: [],
      to: [],
      yields: {},
      protons: 0,
      note: 'FADH₂ → FAD (succinate → fumarate)',
    },
    { enzyme: 'Complex III', from: [], to: [], yields: {}, protons: 4, note: 'QH₂ → Q' },
    {
      enzyme: 'Complex IV',
      from: [],
      to: [],
      yields: { H2O: 1 },
      protons: 2,
      note: '½O₂ + 2H⁺ → H₂O',
    },
    {
      enzyme: 'ATP synthase',
      from: [],
      to: [],
      yields: {},
      note: 'H⁺ flow back in: ADP + Pᵢ → ATP (4 H⁺ each)',
    },
  ],
};

/** H⁺ through ATP synthase for each ATP (with the phosphate carried in). */
export const PROTONS_PER_ATP = 4;

/** The yields of the first `upTo` steps of a pathway (all of them by default), added. */
export function pathwayTally(name: PathwayName, upTo?: number): Required<StepYield> {
  const out = { ATP: 0, GTP: 0, NADH: 0, FADH2: 0, CO2: 0, H2O: 0 };
  for (const s of PATHWAYS[name].slice(0, upTo ?? PATHWAYS[name].length))
    for (const [k, v] of Object.entries(s.yields)) out[k as keyof StepYield] += v ?? 0;
  return out;
}

/** The names a yield is written with ("FADH₂", "CO₂"). */
export const YIELD_NAMES: Record<keyof StepYield, string> = {
  ATP: 'ATP',
  GTP: 'GTP',
  NADH: 'NADH',
  FADH2: 'FADH₂',
  CO2: 'CO₂',
  H2O: 'H₂O',
};

/** A `pathwayStep` card figure (112 × 76): one step's molecules and what it makes or uses. */
export interface PathwayStepCard {
  kind: 'pathwayStep';
  pathway: 'glycolysis' | 'krebs';
  /** The step, from 1. */
  step: number;
}

export const PATHWAY_CARD_W = 112;
export const PATHWAY_CARD_H = 76;

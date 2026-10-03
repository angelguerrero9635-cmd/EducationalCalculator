/**
 * College pictures, round 4, group M (docs/RENDERINGS_HE.md). Kept apart from `types.ts`,
 * `typesHsd.ts` and `layouts/types.ts` so each gains a line. A `NumOrVar` field is a fixed
 * number or a variable id, read in the variable's shown unit; a string field is the page's own
 * value, checked.
 *
 * - HC174 `soilPhases` (new kind): the three-phase block of a soil.
 * - HC175 `losScale` (new kind): a freeway segment's density on the level-of-service bar.
 * - HC180 `oneLine` (new kind): a power system's one-line diagram with a fault on a bus.
 */
import type { NumOrVar } from './typesGraphs';

const ids = (...xs: (NumOrVar | undefined)[]) =>
  xs.filter((x): x is string => typeof x === 'string');

// ─── HC174: soilPhases (new kind) ───────────────────────────────────────────────

/**
 * HC174 (ACC-P16): the phase diagram of a soil, a block cut into air (top), water and solids
 * (bottom) with volumes on the left and weights (or masses) on the right. The heights are to
 * scale: V_s = 1, V_w = Se = wG_s, V_v = e (scaled to `volume` when it is given).
 *
 * `e` is the void ratio; left out, it is worked out as wG_s ÷ S. `S` is the degree of
 * saturation (0–1); left out, wG_s ÷ e. `w` is the water content in % (as the pages type it).
 * `gammaW` is the page's unit weight of water (9.81 kN/m³ on the engineering pages); left out,
 * the weights are written in γ_w. `porosity`, `dryUnitWeight` and `unitWeight` are the page's
 * n, γ_d and γ (checked: n = e ÷ (1 + e), γ_d = G_sγ_w ÷ (1 + e), γ = γ_d(1 + w)).
 *
 * The sand cone (`volume` and `mass`): the block is the hole's volume V, the masses on the
 * right (M_s = M ÷ (1 + w), M_w = wM_s, M_a = 0) in the mass's unit; `density` and
 * `dryDensity` are the page's ρ = M ÷ V and ρ_d = ρ ÷ (1 + w) (checked, in mass and volume
 * units as shown: kg and cm³ make g/cm³ with × 1000). Without G_s and e the block is one
 * piece (the split needs G_s). A "?" draws nothing for that value; S above 1 draws faded with
 * the reason.
 */
export interface SoilPhasesSpec {
  kind: 'soilPhases';
  Gs?: NumOrVar;
  w?: NumOrVar;
  S?: NumOrVar;
  e?: NumOrVar;
  gammaW?: NumOrVar;
  porosity?: string;
  dryUnitWeight?: string;
  unitWeight?: string;
  /** The block's volume and unit (V = 1 m³ of solids when left out). */
  volume?: NumOrVar;
  /** The soil's total (wet) mass: the right side shows masses, not weights. */
  mass?: NumOrVar;
  density?: string;
  dryDensity?: string;
  /** Units written beside the numbers: volumes (m³) and weights (kN) when not from values. */
  volumeUnit?: string;
  weightUnit?: string;
}

/** The variable ids a soilPhases spec names. */
export const soilPhasesVars = (r: SoilPhasesSpec): string[] =>
  ids(
    r.Gs,
    r.w,
    r.S,
    r.e,
    r.gammaW,
    r.porosity,
    r.dryUnitWeight,
    r.unitWeight,
    r.volume,
    r.mass,
    r.density,
    r.dryDensity,
  );

// ─── HC175: losScale (new kind) ─────────────────────────────────────────────────

/**
 * HC175 (ACC-P23): level of service by density. A bar from 0 past the last bound cut into bands
 * A–F with the letters printed and the bounds under it (HCM basic freeway segment: A ≤ 11,
 * B ≤ 18, C ≤ 26, D ≤ 35, E ≤ 45 pc/mi/ln, F above; `bounds` gives another table), the segment's
 * `density` marked with its band outlined. Above it one mile of one lane with the density's
 * cars spaced evenly along it. `flow` and `speed` are the page's v_p and S (checked:
 * D = v_p ÷ S). A "?" density marks nothing and draws no cars.
 */
export interface LosScaleSpec {
  kind: 'losScale';
  density: NumOrVar;
  flow?: NumOrVar;
  speed?: NumOrVar;
  /** The upper bounds of A–E, rising (F is everything above the last). */
  bounds?: [number, number, number, number, number];
  /** The density's unit (pc/mi/ln) and the length the cars stand on (1 mi). */
  unit?: string;
  length?: string;
}

/** The variable ids a losScale spec names. */
export const losScaleVars = (r: LosScaleSpec): string[] => ids(r.density, r.flow, r.speed);

// ─── HC180: oneLine (new kind) ──────────────────────────────────────────────────

/** One element of a one-line diagram, from the source to the faulted bus. */
export interface OneLineElement {
  type: 'generator' | 'transformer' | 'line' | 'source';
  /** Its reactance in pu on the common base (written jX); left out, the element is unlabelled. */
  x?: NumOrVar;
  /** Its name over it: "G", "T₁", "Line". */
  name?: string;
}

/**
 * HC180 (EC-P13): a one-line diagram of a radial system, the source on the left, a bus (a
 * thick bar) after each element, a load arrow off the last bus and the fault bolt on the
 * faulted bus (the last by default): `'3φ'` bolted, `'slg'` phase a to ground. Each element is
 * written with its reactance (jX pu). Under it the reactance diagram: V_f behind the elements'
 * reactances in series to the fault (X_th = ΣX, `xth` checked), or for a single line-to-ground
 * fault the three sequence networks in series (`sequence`, I_a = 3V_f ÷ (X₁ + X₂ + X₀)).
 * `current` is the page's fault current in pu (checked); `base` the system base with the
 * page's base current (A), the current in kA and the fault MVA (checked). A "?" reactance is
 * left unlabelled and no sum is written.
 */
export interface OneLineSpec {
  kind: 'oneLine';
  elements: OneLineElement[];
  fault?: '3φ' | 'slg';
  /** The faulted bus, counted from 1 after the first element (default the last). */
  faultBus?: number;
  load?: boolean;
  vf?: NumOrVar;
  xth?: NumOrVar;
  current?: NumOrVar;
  sequence?: { x1: NumOrVar; x2: NumOrVar; x0: NumOrVar };
  base?: { s: NumOrVar; v: NumOrVar; iBase?: string; iKA?: string; mva?: string };
}

/** The variable ids a oneLine spec names. */
export const oneLineVars = (r: OneLineSpec): string[] =>
  ids(
    ...r.elements.map((e) => e.x),
    r.vf,
    r.xth,
    r.current,
    r.sequence?.x1,
    r.sequence?.x2,
    r.sequence?.x0,
    r.base?.s,
    r.base?.v,
    r.base?.iBase,
    r.base?.iKA,
    r.base?.mva,
  );

// ─── The new kinds together ──────────────────────────────────────────────────────

/** Group M's new picture kinds (one line in `types.ts`). */
export type He4mSpec = SoilPhasesSpec | LosScaleSpec | OneLineSpec;

/** The variable ids a group M new-kind spec names (one case in `modules.test.ts`). */
export function he4mSpecVars(r: He4mSpec): string[] {
  switch (r.kind) {
    case 'soilPhases':
      return soilPhasesVars(r);
    case 'losScale':
      return losScaleVars(r);
    case 'oneLine':
      return oneLineVars(r);
  }
}

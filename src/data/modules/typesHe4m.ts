/**
 * College pictures, round 4, group M (docs/RENDERINGS_HE.md). Kept apart from `types.ts`,
 * `typesHsd.ts` and `layouts/types.ts` so each gains a line. A `NumOrVar` field is a fixed
 * number or a variable id, read in the variable's shown unit; a string field is the page's own
 * value, checked.
 *
 * - HC174 `soilPhases` (new kind): the three-phase block of a soil.
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

// ─── The new kinds together ──────────────────────────────────────────────────────

/** Group M's new picture kinds (one line in `types.ts`). */
export type He4mSpec = SoilPhasesSpec;

/** The variable ids a group M new-kind spec names (one case in `modules.test.ts`). */
export function he4mSpecVars(r: He4mSpec): string[] {
  switch (r.kind) {
    case 'soilPhases':
      return soilPhasesVars(r);
  }
}

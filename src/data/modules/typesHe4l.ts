/**
 * College pictures, round 4, group L (docs/RENDERINGS_HE.md), all from the mechanical plan
 * (docs/plans/he.mechanical.md). Kept apart from `types.ts` and `layouts/types.ts` so each gains
 * a line. A `NumOrVar` field is a fixed number or a variable id, read in the variable's own unit
 * (converted to SI where a picture needs lengths to scale).
 *
 * - HC165 `moodyChart` (ME-P13): f against Re on log–log axes, the ε ÷ D curves computed from
 *   Colebrook, the page's point on its lit curve.
 */
import type { NumOrVar } from './typesGraphs';

const ids = (...xs: (NumOrVar | undefined)[]) =>
  xs.filter((x): x is string => typeof x === 'string');

// ─── HC165: moodyChart (new kind) ──────────────────────────────────────────────

/**
 * HC165 (ME-P13): the Moody chart, drawn from equations, never digitized. Log–log axes, Re from
 * 10³ to 10⁸ and f from 0.005 to 0.1; the laminar line f = 64 ÷ Re up to Re = 2300; the
 * transition band (2300 to 4000) shaded; a family of turbulent curves, one per relative
 * roughness in `curves` (default smooth, 10⁻⁵, 10⁻⁴, 10⁻³, 0.005, 0.01, 0.05), each computed
 * from Colebrook, 1 ÷ √f = −2 log₁₀(ε ÷ 3.7D + 2.51 ÷ (Re√f)). The page's ε ÷ D (`roughness`,
 * or `epsilon` over `diameter`, any length units) is lit; its point (`re`, `f`) is ringed with
 * guides to both axes. A "?" Re draws no point; a "?" f draws the Re guide up to the lit curve
 * and no point; a "?" roughness lights no curve. No handles.
 */
export interface MoodyChartSpec {
  kind: 'moodyChart';
  re: NumOrVar;
  f?: NumOrVar;
  /** ε ÷ D, a ratio. */
  roughness?: NumOrVar;
  /** ε and D, when the page has them apart (lengths, converted by their units). */
  epsilon?: NumOrVar;
  diameter?: NumOrVar;
  /** The family's relative roughnesses (0 draws the smooth pipe). */
  curves?: number[];
}

/** The variable ids a moodyChart spec names. */
export const moodyChartVars = (r: MoodyChartSpec): string[] =>
  ids(r.re, r.f, r.roughness, r.epsilon, r.diameter);

// ─── Every group L spec ─────────────────────────────────────────────────────────

/** The round 4 group L picture specs (listed once in `types.ts`). */
export type He4lSpec = MoodyChartSpec;

/** The variable ids a group L spec names. */
export function he4lSpecVars(r: He4lSpec): string[] {
  switch (r.kind) {
    case 'moodyChart':
      return moodyChartVars(r);
  }
}

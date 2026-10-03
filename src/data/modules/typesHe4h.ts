/**
 * College pictures, round 4, group H (docs/RENDERINGS_HE.md): earth, geography and one biology
 * picture. Kept apart from `types.ts` so it gains one line. A `NumOrVar` field is a fixed number
 * or a variable id, read in the variable's shown unit (the units named below); a string field is
 * the page's own worked-out value, checked by the harness.
 *
 * - HC129 `catchment` (new kind): the rational method, Qₚ = CiA ÷ 3.6.
 */
import type { NumOrVar } from './typesGraphs';

const ids = (...xs: (NumOrVar | undefined)[]) =>
  xs.filter((x): x is string => typeof x === 'string');

// ─── HC129: catchment (new kind) ───────────────────────────────────────────────

/**
 * HC129 (EG-P18): a small drainage basin seen from above, to scale (its outline holds `area`
 * km², read off the km scale bar), its streams running to the outlet. Rain at `intensity` mm/h
 * falls from a cloud band (more streaks for harder rain); 40 drops on the basin, of which
 * round(40C) run to the streams (filled, an arrow toward the channel) and the rest soak in
 * (hollow, a tick into the ground), so the drawn share is C (`coefficient`, 0 to 1). The outlet
 * arrow carries `peak` (Qₚ, m³/s; checked: CiA ÷ 3.6). A "?" draws nothing for its value: no
 * rain, no split, no scale bar, no outlet number.
 */
export interface CatchmentSpec {
  kind: 'catchment';
  coefficient: NumOrVar;
  intensity: NumOrVar;
  area: NumOrVar;
  peak?: string;
}

/** Every spec of group H. */
export type He4hSpec = CatchmentSpec;

const HE4H_KINDS = new Set<string>(['catchment']);

/** Whether a picture spec is one of group H's (a new kind, or an option on `sample`). */
export const isHe4hSpec = (r: { kind: string }): r is He4hSpec => HE4H_KINDS.has(r.kind);

/** The variable ids a group-H spec names. */
export function he4hSpecVars(r: He4hSpec): string[] {
  switch (r.kind) {
    case 'catchment':
      return ids(r.coefficient, r.intensity, r.area, r.peak);
  }
}

/**
 * College pictures, round 4, group H (docs/RENDERINGS_HE.md): earth, geography and one biology
 * picture. Kept apart from `types.ts` so it gains one line. A `NumOrVar` field is a fixed number
 * or a variable id, read in the variable's shown unit (the units named below); a string field is
 * the page's own worked-out value, checked by the harness.
 *
 * - HC129 `catchment` (new kind): the rational method, Qₚ = CiA ÷ 3.6.
 * - HC133 `contourMap` (new kind): a hill's contours, a transect and its profile.
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

// ─── HC133: contourMap (new kind) ──────────────────────────────────────────────

/**
 * HC133 (EG-P24): a made-up hill of contours at `interval` CI (m), every fifth from A's contour
 * bold and labelled with its elevation. The transect A–B runs straight up the hill from A on
 * the contour at `base` (m; default 10 × CI) to B on the contour n = `crossed` intervals higher,
 * so it crosses exactly n intervals; with n = 0 both lie on the flat below the hill. Under the
 * map a scale bar (1:`scale`, the line AB `mapDistance` cm long) and the profile lined up with
 * the transect: elevation against ground distance, each contour crossing dotted, rise = n × CI
 * and run = map × scale ÷ 100 (m) bracketed, the slope written as `gradient` % and `angle` °
 * (the profile is drawn with its vertical exaggeration named). `rise`, `ground`, `gradient`
 * and `angle` are the page's values (checked). A "?" draws nothing for its value: no elevations
 * without CI, no transect without n, no scale bar or run without the map distance or scale.
 */
export interface ContourMapSpec {
  kind: 'contourMap';
  interval: NumOrVar;
  crossed: NumOrVar;
  mapDistance: NumOrVar;
  scale: NumOrVar;
  base?: NumOrVar;
  rise?: string;
  ground?: string;
  gradient?: string;
  angle?: string;
}

/** Every spec of group H. */
export type He4hSpec = CatchmentSpec | ContourMapSpec;

const HE4H_KINDS = new Set<string>(['catchment', 'contourMap']);

/** Whether a picture spec is one of group H's (a new kind, or an option on `sample`). */
export const isHe4hSpec = (r: { kind: string }): r is He4hSpec => HE4H_KINDS.has(r.kind);

/** The variable ids a group-H spec names. */
export function he4hSpecVars(r: He4hSpec): string[] {
  switch (r.kind) {
    case 'catchment':
      return ids(r.coefficient, r.intensity, r.area, r.peak);
    case 'contourMap':
      return ids(
        r.interval,
        r.crossed,
        r.mapDistance,
        r.scale,
        r.base,
        r.rise,
        r.ground,
        r.gradient,
        r.angle,
      );
  }
}

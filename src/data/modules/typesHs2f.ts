/**
 * Picture specs for Grades 9–12 round 2, group F (earth and space, H103; see
 * pictureRequestsHs.ts and docs/HS_NEEDS.md P15), kept apart from `typesHsl.ts` so that file's
 * unions only list them. A `NumOrVar` field is a fixed number or a variable id. Every option is
 * off unless a page sets it.
 */
import type { NumOrVar } from './typesGraphs';

/**
 * `earthLayers` mode `magnitude` (H103 part 1): two seismograms, the smaller quake above the
 * larger, drawn to one amplitude scale, then a log scale of magnitude with a bar to each quake;
 * each whole step is 10 times the ground motion, and the gap between the bars is bracketed with
 * the amplitude ratio 10^(M₂ − M₁). The energy ratio 10^(1.5 (M₂ − M₁)) is in the caption. Drag
 * a bar's end to change its magnitude (unless `fixed`).
 */
export interface MagnitudeSpec {
  kind: 'earthLayers';
  mode: 'magnitude';
  /** The two magnitudes, 0–10 (usually the smaller first). */
  m1: NumOrVar;
  m2: NumOrVar;
  /** The amplitude ratio 10^(M₂ − M₁), when the page works it out (else worked out). */
  amplitude?: NumOrVar;
  /** The energy ratio 10^(1.5 (M₂ − M₁)), when the page works it out (else worked out). */
  energy?: NumOrVar;
  fixed?: boolean;
}

/** The variable ids a group F spec names (for the module tests). */
export function hs2fSpecVars(r: MagnitudeSpec): string[] {
  const ids = (xs: (NumOrVar | undefined)[]) =>
    xs.filter((x): x is string => typeof x === 'string');
  switch (r.mode) {
    case 'magnitude':
      return ids([r.m1, r.m2, r.amplitude, r.energy]);
  }
}

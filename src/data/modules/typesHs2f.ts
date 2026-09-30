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

/**
 * `oceanProfile` mode `stripes` (H103 part 2): a mid-ocean ridge seen from above, the seafloor
 * on both sides striped by the polarity it cooled in (normal dark, reversed light, from the
 * polarity time scale to 12 million years), the same stripes mirrored about the ridge. A rock
 * `distance` km from the ridge is `age` million years old, so the stripes sit at the half rate
 * v = distance ÷ age; ages run along the top, kilometres along the bottom, the plates' arrows
 * below.
 */
export interface StripesSpec {
  kind: 'oceanProfile';
  mode: 'stripes';
  /** The rock's distance from the ridge, km. */
  distance: NumOrVar;
  /** Its age, million years (0–12). */
  age: NumOrVar;
  /** The half spreading rate, km per million years (= mm per year), when the page names it. */
  rate?: NumOrVar;
  /** The full spreading rate, 2 × the half rate, when the page names it. */
  full?: NumOrVar;
}

/**
 * `streamChannel` (H103 part 3, a new kind): a stream's channel seen in cross-section and in
 * perspective, drawn to scale: the water `width` m wide and `depth` m deep (A = w × d), and the
 * slab of water that passes in one second, `speed` m long, so its volume is the discharge
 * Q = A × v in m³/s. Soil banks either side, the flow arrow along the channel.
 */
export interface StreamChannelSpec {
  kind: 'streamChannel';
  /** The water's width and depth, m. */
  width: NumOrVar;
  depth: NumOrVar;
  /** The mean flow speed, m/s. */
  speed: NumOrVar;
  /** The cross-section's area, m², and the discharge, m³/s, when the page works them out. */
  area?: NumOrVar;
  discharge?: NumOrVar;
}

/** The group F picture kinds of their own (listed in `types.ts`). */
export type Hs2fKindSpec = StreamChannelSpec;

/** Every group F spec. */
export type Hs2fSpec = MagnitudeSpec | StripesSpec | Hs2fKindSpec;

/** The variable ids a group F spec names (for the module tests). */
export function hs2fSpecVars(r: Hs2fSpec): string[] {
  const ids = (xs: (NumOrVar | undefined)[]) =>
    xs.filter((x): x is string => typeof x === 'string');
  if (r.kind === 'streamChannel') return ids([r.width, r.depth, r.speed, r.area, r.discharge]);
  switch (r.mode) {
    case 'magnitude':
      return ids([r.m1, r.m2, r.amplitude, r.energy]);
    case 'stripes':
      return ids([r.distance, r.age, r.rate, r.full]);
  }
}

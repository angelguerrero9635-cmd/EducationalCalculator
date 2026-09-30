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
 * `atmosphereLayers` mode `parcel` (H103 part 4): a parcel of air rising from the ground. On a
 * temperature (across) against altitude (up) chart, the parcel cools 10 °C per km (dry) and its
 * dew point falls 2 °C per km, so they meet at the cloud base h = (T − T_d) ÷ 8 km; above it the
 * parcel is saturated and cools about 6 °C per km with its dew point. Beside the chart, the
 * parcel rises to a cumulus cloud whose flat base is at h, on the same altitude scale.
 */
export interface ParcelSpec {
  kind: 'atmosphereLayers';
  mode: 'parcel';
  /** The air's temperature and dew point at the ground, °C. */
  temperature: NumOrVar;
  dewPoint: NumOrVar;
  /** The cloud base, km, when the page works it out (else worked out). */
  base?: NumOrVar;
}

/**
 * `atmosphereLayers` mode `balance` (H103 part 5): Earth's energy balance with no greenhouse
 * effect, as the `greenhouse` figure's energy view draws it but driven by values. Sunlight in,
 * averaged over the globe (S ÷ 4), splits at the surface into the part reflected (the albedo α)
 * and the part absorbed, F = S(1 − α) ÷ 4; in balance the ground sends F back out as infrared,
 * σTₑ⁴ = F, and a thermometer reads Tₑ. Band widths are to scale (the sunlight in is the full
 * width).
 */
export interface BalanceSpec {
  kind: 'atmosphereLayers';
  mode: 'balance';
  /** The albedo, 0–1: the share of sunlight reflected. */
  albedo: NumOrVar;
  /** The sunlight at the top of the atmosphere, W/m² (default 1,361, the solar constant). */
  sunlight?: NumOrVar;
  /** The sunlight absorbed per square metre, averaged over the globe, when the page names it. */
  absorbed?: NumOrVar;
  /** The balance temperature Tₑ, K, when the page names it. */
  temperature?: NumOrVar;
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

/**
 * `reserve` (H103 part 6, a new kind): a reserve drawn down. A bar as long as the reserve Q, cut
 * into the slices used each year (r each), the first slice lit; a years axis under it, and the
 * bar empty after y = Q ÷ r years (the last slice may be part of a year). Flat, like a tape.
 */
export interface ReserveSpec {
  kind: 'reserve';
  /** The reserve, in the page's unit (billion barrels, tonnes). */
  reserve: NumOrVar;
  /** The amount used each year, in the same unit per year. */
  rate: NumOrVar;
  /** The years it lasts, when the page works it out. */
  years?: NumOrVar;
}

/** The group F picture kinds of their own (listed in `types.ts`). */
export type Hs2fKindSpec = StreamChannelSpec | ReserveSpec;

/** Every group F spec. */
export type Hs2fSpec = MagnitudeSpec | StripesSpec | ParcelSpec | BalanceSpec | Hs2fKindSpec;

/** The variable ids a group F spec names (for the module tests). */
export function hs2fSpecVars(r: Hs2fSpec): string[] {
  const ids = (xs: (NumOrVar | undefined)[]) =>
    xs.filter((x): x is string => typeof x === 'string');
  if (r.kind === 'streamChannel') return ids([r.width, r.depth, r.speed, r.area, r.discharge]);
  if (r.kind === 'reserve') return ids([r.reserve, r.rate, r.years]);
  switch (r.mode) {
    case 'magnitude':
      return ids([r.m1, r.m2, r.amplitude, r.energy]);
    case 'stripes':
      return ids([r.distance, r.age, r.rate, r.full]);
    case 'parcel':
      return ids([r.temperature, r.dewPoint, r.base]);
    case 'balance':
      return ids([r.albedo, r.sunlight, r.absorbed, r.temperature]);
  }
}

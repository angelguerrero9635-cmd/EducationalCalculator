/**
 * Picture specs for Grades 9–12 round 3, group C (earth and space, H110; see
 * pictureRequestsHs.ts and docs/HS_NEEDS.md P22), kept apart from `types.ts` so that file's union
 * only lists them. A `NumOrVar` field is a fixed number or a variable id. Every option is off
 * unless a page sets it.
 */
import type { NumOrVar } from './typesGraphs';

/** One reference event on the geologic clock: its age (million years ago) and its name. */
export interface ClockEvent {
  age: number;
  name: string;
}

/**
 * Earth's history on one 24-hour day (H110 part 1): a 24-hour dial with Earth's formation at
 * midnight (the top) and today at the next midnight. The event `ago` million years ago is at
 * clock time t = 24 − A ÷ span × 24, a hand points to it, and the last m = A ÷ span × 1,440
 * minutes of the day (everything since) are shaded. `events` are marked and numbered on the
 * dial, with a key; the last hour, 23:00 to midnight, is drawn stretched out below the dial,
 * so the events crowded into it can be told apart. Drag the hand for the clock time.
 */
export interface GeologicClockSpec {
  kind: 'geologicClock';
  /** How long ago the event was, million years (0 to `span`). */
  ago?: NumOrVar;
  /** The event's clock time, hours (0 to 24); worked out from `ago` when not given. */
  time?: NumOrVar;
  /** The minutes before midnight, when the page names them. */
  minutes?: NumOrVar;
  /** The share of Earth's history since the event, %, when the page names it. */
  share?: NumOrVar;
  /** Earth's age, million years (default 4,600). */
  span?: number;
  /** Reference events marked on the dial (up to 8), in any order. */
  events?: ClockEvent[];
  fixed?: boolean;
}

/**
 * A fossil coral's growth lines (H110 part 2): a horn coral lying on its side, its wall ridged
 * with `lines` fine daily growth lines across `bands` yearly bands (the grooves between them), so
 * a band holds N = n ÷ b days. When the lines would be closer than 2.5 px, every 2nd, 5th, 10th …
 * line is drawn and the key says so; the band count is always exact. Below, the day's length
 * then, D = year ÷ N hours (a year of 8,766 hours), as a bar beside today's 24 hours.
 */
export interface CoralSectionSpec {
  kind: 'coralSection';
  /** The daily growth lines counted (a whole number). */
  lines: NumOrVar;
  /** The yearly bands they cross (a whole number, 1 to 10). */
  bands: NumOrVar;
  /** Days in a year then, n ÷ b, when the page names it. */
  days?: NumOrVar;
  /** The length of a day then, hours, when the page names it. */
  day?: NumOrVar;
  /** Hours in a year (default 8,766: 365.25 days of 24 hours). */
  yearHours?: number;
}

/**
 * A planet crossing its star (H110 part 3): the star's disk and the planet's black disk to one
 * scale (the planet is r ÷ (109 × R) of the star's width, since the Sun is 109 Earths wide),
 * crossing the middle of the star; under it, on the same horizontal scale, the light curve: the
 * star's brightness dips as the planet covers it, by δ = 100 × (r ÷ (109 × R))² % at the bottom
 * (the covered area worked out exactly as the disks overlap; no limb darkening). The dip is drawn
 * a fixed height with its brightness levels labeled, since δ may be a millionth of a percent.
 */
export interface TransitSpec {
  kind: 'transit';
  /** The star's radius, in Sun radii (R☉). */
  star: NumOrVar;
  /** The planet's radius, in Earth radii (R⊕). */
  planet: NumOrVar;
  /** The transit depth δ, %, when the page names it (else worked out). */
  depth?: NumOrVar;
}

/**
 * A star's habitable zone (H110 part 4), seen from above: the star at the left, drawn bigger
 * and bluer for a brighter star (not to scale), the zone from d₁ = 0.95 × √L to d₂ = 1.37 × √L AU
 * shaded green between a too-hot inside and a too-cold outside, and the planet on its orbit at
 * `orbit` AU, labeled with its temperature T = 278 × L^(1/4) ÷ √a K. Distances are to one scale
 * (the AU axis below). Drag the planet for its orbit.
 */
export interface HabitableZoneSpec {
  kind: 'habitableZone';
  /** The star's luminosity, in Suns (L☉). */
  luminosity: NumOrVar;
  /** The zone's inner and outer edges, AU, when the page names them (else worked out). */
  inner?: NumOrVar;
  outer?: NumOrVar;
  /** The planet's orbit, AU. */
  orbit?: NumOrVar;
  /** The planet's temperature, K, when the page names it (else worked out). */
  temperature?: NumOrVar;
  fixed?: boolean;
}

/**
 * A star's parallax (H110 part 7): Earth on its orbit round the Sun in January and in July,
 * 2 AU apart, and a near star above; seen from each side of the orbit the near star sits
 * against different far stars (both places marked on the background). The parallax angle p, at
 * the star between the lines to the Sun and to Earth (1 AU), is marked, and the star's distance
 * d = 1 ÷ p parsecs (× 3.26 in light-years). Not to scale: p is at most 1″ (1/3,600 of a
 * degree), so the drawn angle is enlarged, but it shrinks as the star is farther.
 */
export interface ParallaxSpec {
  kind: 'parallax';
  /** The parallax angle p, arcseconds (0.001″ to 1″). */
  angle: NumOrVar;
  /** The distance, parsecs, when the page names it (else worked out). */
  parsecs?: NumOrVar;
  /** The distance, light-years, when the page names it. */
  lightYears?: NumOrVar;
}

export type Hs3cSpec =
  GeologicClockSpec | CoralSectionSpec | TransitSpec | HabitableZoneSpec | ParallaxSpec;

/** The variable ids a group C picture reads (for the module tests). */
export function hs3cSpecVars(r: Hs3cSpec): string[] {
  const ids = (xs: (NumOrVar | undefined)[]) =>
    xs.filter((x): x is string => typeof x === 'string');
  switch (r.kind) {
    case 'geologicClock':
      return ids([r.ago, r.time, r.minutes, r.share]);
    case 'coralSection':
      return ids([r.lines, r.bands, r.days, r.day]);
    case 'transit':
      return ids([r.star, r.planet, r.depth]);
    case 'habitableZone':
      return ids([r.luminosity, r.inner, r.outer, r.orbit, r.temperature]);
    case 'parallax':
      return ids([r.angle, r.parsecs, r.lightYears]);
  }
}

// ── Explore figures ──

/**
 * An `earthLayers` scene (H110 part 6): the Earth cut through an earthquake's focus, as the
 * calculator picture's `section` mode draws it, with a station `distance` degrees from the focus
 * on both halves: filled where that wave arrives, hollow where it doesn't.
 */
export interface EarthSectionScene {
  /** The station's angular distance from the focus, 0°–180°. */
  distance: number;
}

/** The group C explore figures (listed in `layouts/types.ts`). */
export type Hs3cFigure = { kind: 'earthLayers' };

/** The scene field each group C figure reads (for the layout tests). */
export const HS3C_SCENE_FIELD = { earthLayers: 'earthSection' } as const satisfies Record<
  Hs3cFigure['kind'],
  string
>;

/**
 * Picture specs for Grades 9–12, group L (earth and space H71–H80; see docs/RENDERINGS_HS.md),
 * kept apart from `types.ts` so that file's union only lists them, and the scenes of the group's
 * explore figures. A `NumOrVar` field is a fixed number or a variable id.
 */
import type { NumOrVar } from './typesGraphs';

// ── Calculator pictures ──

/**
 * Earth's interior and earthquakes (H72), in one of three modes.
 *
 * `section`: Earth cut through the focus (at the top), its layers to scale (crust, mantle, the
 * liquid outer core from 2,900 km, the solid inner core from 5,150 km). P-wave paths on the left
 * half curve through the mantle to 104° and refract through the core to 140°–180°, leaving the P
 * shadow zone (104°–140°); S-wave paths on the right stop at the liquid outer core, leaving no S
 * waves past 104°. `distance` puts a station that many degrees from the focus on both halves and
 * says which waves reach it; drag it round the surface.
 */
export interface EarthSectionSpec {
  kind: 'earthLayers';
  mode: 'section';
  /** The station's angular distance from the focus, 0°–180°. */
  distance?: NumOrVar;
  fixed?: boolean;
}

/**
 * `seismogram`: the trace a station records: quiet, then the P arrival at d ÷ vP, the larger S
 * arrival at d ÷ vS, then the largest, slower surface waves; the S − P lag is bracketed.
 */
export interface SeismogramSpec {
  kind: 'earthLayers';
  mode: 'seismogram';
  /** Distance from the station to the focus, km. */
  km: NumOrVar;
  /** P and S wave speeds, km/s (defaults 6 and 3.5). */
  vp?: NumOrVar;
  vs?: NumOrVar;
  /** The S − P lag in seconds, when the page names it (else worked out). */
  lag?: NumOrVar;
}

/** One seismic station on an `epicenter` map: its name, place (km) and distance circle. */
export interface QuakeStation {
  name: string;
  x: number;
  y: number;
  /** Its distance to the epicenter, km (a variable, usually from its S − P lag). */
  r: NumOrVar;
}

/**
 * `epicenter`: three stations on a km grid (north up), each with a circle of its distance; where
 * the three circles meet is the epicenter, starred. Circles that don't meet at one point draw
 * faded, with the reason.
 */
export interface EpicenterSpec {
  kind: 'earthLayers';
  mode: 'epicenter';
  stations: [QuakeStation, QuakeStation, QuakeStation];
}

export type EarthLayersSpec = EarthSectionSpec | SeismogramSpec | EpicenterSpec;

export type HslSpec = EarthLayersSpec;

/** The variable ids a spec above names (for the module tests). */
export function hslSpecVars(r: HslSpec): string[] {
  const ids = (xs: (NumOrVar | undefined)[]) =>
    xs.filter((x): x is string => typeof x === 'string');
  switch (r.kind) {
    case 'earthLayers':
      if (r.mode === 'section') return ids([r.distance]);
      if (r.mode === 'seismogram') return ids([r.km, r.vp, r.vs, r.lag]);
      return ids(r.stations.map((s) => s.r));
  }
}

// ── Explore figures ──

/** A `mohsScale` scene: the ten minerals, the test tools, a mineral or a range lit. */
export interface MohsScene {
  /** A hardness 1–10 whose mineral is lit. */
  lit?: number;
  /** An unknown mineral's hardness range, shaded between two hardnesses (tools sit at 2.5 …). */
  between?: [number, number];
  /** Bars to absolute hardness (talc 1 … diamond 1500) instead of the rank. */
  absolute?: boolean;
}

/** The landforms a `landforms` figure draws, each in cross-section or seen from above. */
export type LandformKind =
  | 'shield'
  | 'composite'
  | 'cinderCone'
  | 'folds'
  | 'normalFault'
  | 'reverseFault'
  | 'strikeSlip'
  | 'vValley'
  | 'uValley'
  | 'meander'
  | 'aquifer'
  | 'dunes';

/** A `landforms` scene: the landform drawn, its parts labeled. */
export interface LandformScene {
  kind: LandformKind;
}

/** The explore figures of group L (listed in `layouts/types.ts`). */
export type HslFigure = { kind: 'mohsScale' } | { kind: 'landforms' };

/** The scene field each group L figure reads (for the layout tests). */
export const HSL_SCENE_FIELD = {
  mohsScale: 'mohs',
  landforms: 'landform',
} as const satisfies Record<HslFigure['kind'], string>;

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

/** The rocks a dated cliff draws: sediments, a volcanic ash bed and a lava flow. */
export type DatedRock =
  'sandstone' | 'shale' | 'limestone' | 'siltstone' | 'conglomerate' | 'ash' | 'lava';

/** An index fossil drawn in a layer. */
export type IndexFossil = 'trilobite' | 'ammonite' | 'fern';

/**
 * Geologic time on a cliff (H74, an extension of `rockLayers`): layers top to bottom, each dated
 * layer (an ash bed or lava flow) labeled with its absolute age, index fossils in their layers, an
 * igneous intrusion cutting up through the lower layers (younger than every layer it cuts, older
 * than the ones it doesn't reach), a layer's age bracketed between the nearest ages above and
 * below it, and a radiometric sample of 100 atoms, parent and daughter counted from the values.
 */
export interface RockDatingSpec {
  kind: 'rockLayers';
  dating: {
    /** Top to bottom (3 to 8). `age`: million years, typed or worked out. */
    layers: { rock: DatedRock; age?: NumOrVar; fossil?: IndexFossil }[];
    /** A dike from the bottom up through layer `through` (0 is the top), with its age. */
    intrusion?: { through: number; age?: NumOrVar };
    /** A layer whose age is bracketed by the nearest ages above and below it. */
    bracket?: number;
    /**
     * 100 atoms from a dated layer (`layer`) or the intrusion (`layer: -1`): `parent`, the
     * percent of parent atoms left, drawn as that many (rounded) of 100; `parentName` and
     * `daughterName` in the key ("potassium-40", "argon-40").
     */
    sample?: {
      parent: NumOrVar;
      layer: number;
      parentName: string;
      daughterName: string;
      /** Half-lives gone by, when the page names them (parent = 100 × (1/2)ⁿ). */
      halfLives?: NumOrVar;
    };
  };
}

/** The labeled parts of the seafloor profile. */
export type SeafloorPart = 'shelf' | 'slope' | 'rise' | 'plain' | 'ridge' | 'trench';

/**
 * The ocean (H75), `profile` mode: the seafloor from a continent across an ocean to an island
 * arc (shelf, slope, rise, abyssal plain, mid-ocean ridge with its rift, trench), depths to scale
 * on a stretched vertical axis. `depth` puts a ship where the floor is that deep (within `over`
 * when given) and draws its sonar ping down and back.
 */
export interface OceanSonarSpec {
  kind: 'oceanProfile';
  mode: 'profile';
  /** The depth under the ship, m. */
  depth?: NumOrVar;
  /** The part of the profile the ship is over. */
  over?: SeafloorPart;
}

/**
 * The ocean, `tides` mode: Earth seen from above the North Pole with its two tidal bulges, the
 * Sun far to the left and the Moon on its orbit `angle` degrees from the Sun's direction; the
 * bulges from Moon and Sun add (spring tides, at 0° and 180°) or partly cancel (neap, at 90°).
 * Drag the Moon round its orbit.
 */
export interface TidesSpec {
  kind: 'oceanProfile';
  mode: 'tides';
  /** The Moon's angle from the Sun's direction, 0°–180° (0 new moon, 90 quarter, 180 full). */
  angle: NumOrVar;
  /** The tidal range, when the page works it out (shown in the caption). */
  range?: NumOrVar;
  fixed?: boolean;
}

export type OceanProfileSpec = OceanSonarSpec | TidesSpec;

export type HslSpec = EarthLayersSpec | RockDatingSpec | OceanProfileSpec;

/** The variable ids a spec above names (for the module tests). */
export function hslSpecVars(r: HslSpec): string[] {
  const ids = (xs: (NumOrVar | undefined)[]) =>
    xs.filter((x): x is string => typeof x === 'string');
  switch (r.kind) {
    case 'earthLayers':
      if (r.mode === 'section') return ids([r.distance]);
      if (r.mode === 'seismogram') return ids([r.km, r.vp, r.vs, r.lag]);
      return ids(r.stations.map((s) => s.r));
    case 'oceanProfile':
      return r.mode === 'profile' ? ids([r.depth]) : ids([r.angle, r.range]);
    case 'rockLayers':
      return ids([
        ...r.dating.layers.map((l) => l.age),
        r.dating.intrusion?.age,
        r.dating.sample?.parent,
        r.dating.sample?.halfLives,
      ]);
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
/** An `oceanCurrents` scene: the surface gyres, or the deep conveyor. */
export interface CurrentsScene {
  view: 'gyres' | 'conveyor';
}

export type HslFigure = { kind: 'mohsScale' } | { kind: 'landforms' } | { kind: 'oceanCurrents' };

/** The scene field each group L figure reads (for the layout tests). */
export const HSL_SCENE_FIELD = {
  mohsScale: 'mohs',
  landforms: 'landform',
  oceanCurrents: 'currents',
} as const satisfies Record<HslFigure['kind'], string>;

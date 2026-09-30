/**
 * Picture specs for Grades 9–12, group L (earth and space H71–H80; see docs/RENDERINGS_HS.md),
 * kept apart from `types.ts` so that file's union only lists them, and the scenes of the group's
 * explore figures. A `NumOrVar` field is a fixed number or a variable id.
 */
import type { NumOrVar } from './typesGraphs';
import { hs2fSpecVars, type MagnitudeSpec } from './typesHs2f';

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

export type EarthLayersSpec = EarthSectionSpec | SeismogramSpec | EpicenterSpec | MagnitudeSpec;

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

/**
 * The atmosphere (H76), `profile` mode: temperature against altitude to 120 km, the troposphere,
 * stratosphere (with the ozone layer), mesosphere and thermosphere as bands, the troposphere
 * cooling 6.5 °C per km from the ground's temperature, and a point at `altitude`.
 */
export interface AtmosphereProfileSpec {
  kind: 'atmosphereLayers';
  mode: 'profile';
  /** Altitude of the point, km. */
  altitude?: NumOrVar;
  /** Its temperature, °C (as the page works it out). */
  temperature?: NumOrVar;
  /** The ground's temperature, °C (default 15, the standard atmosphere). */
  ground?: NumOrVar;
}

/**
 * The atmosphere, `pressure` mode: a weather map with a high and a low, isobars every 4 hPa
 * between them, and surface winds that blow from high to low turned by the Coriolis effect (to
 * the right in the north, the left in the south) and partly back by friction: out of a high
 * clockwise and into a low counterclockwise in the north.
 */
export interface PressureMapSpec {
  kind: 'atmosphereLayers';
  mode: 'pressure';
  /** The centres' pressures, hPa. */
  high: NumOrVar;
  low: NumOrVar;
  /** The distance between the centres, km (a scale bar). */
  distance?: NumOrVar;
  hemisphere?: 'north' | 'south';
}

export type AtmosphereLayersSpec = AtmosphereProfileSpec | PressureMapSpec;

/**
 * The Hertzsprung–Russell diagram (H79): surface temperature (K) across, hot on the left, and
 * luminosity (L☉) up, both on log scales; the main sequence, giants, supergiants and white dwarfs
 * as regions, dashed lines of equal radius (0.01, 1, 100 R☉), the Sun marked, and a star plotted
 * from its values in its color, named by the region it falls in. Drag the star (unless `fixed`).
 */
export interface HrDiagramSpec {
  kind: 'hrDiagram';
  /** Surface temperature, K. */
  temperature: NumOrVar;
  /** Luminosity, in Suns. */
  luminosity: NumOrVar;
  /** Radius, in Suns (the caption checks L = R²(T ÷ 5772)⁴). */
  radius?: NumOrVar;
  /** The star's name by its dot ("Sirius A"). */
  name?: string;
  fixed?: boolean;
}

/**
 * The expanding universe (H80), `stretch` mode: the same patch of galaxies before and after space
 * stretches by `scale`, our galaxy in the middle; every galaxy moves away from every other, the
 * far ones farther, and one marked galaxy's distance grows from `distance` to `after`.
 */
export interface StretchSpec {
  kind: 'expandingUniverse';
  mode: 'stretch';
  /** How many times larger space has grown (the scale factor). */
  scale: NumOrVar;
  /** The marked galaxy's distance before and after (the page's unit). */
  distance?: NumOrVar;
  after?: NumOrVar;
}

/**
 * `hubble` mode: galaxies' recession speed (km/s) against distance (Mpc), the line v = H₀d
 * through the origin with its slope, a scatter of other galaxies about it, and the page's galaxy.
 */
export interface HubbleSpec {
  kind: 'expandingUniverse';
  mode: 'hubble';
  /** The galaxy's distance, Mpc. */
  distance: NumOrVar;
  /** Its speed away from us, km/s. */
  speed: NumOrVar;
  /** The Hubble constant, km/s per Mpc (default 70). */
  constant?: NumOrVar;
}

export type ExpandingUniverseSpec = StretchSpec | HubbleSpec;

export type HslSpec =
  | ExpandingUniverseSpec
  | EarthLayersSpec
  | RockDatingSpec
  | OceanProfileSpec
  | AtmosphereLayersSpec
  | HrDiagramSpec;

/** The variable ids a spec above names (for the module tests). */
export function hslSpecVars(r: HslSpec): string[] {
  const ids = (xs: (NumOrVar | undefined)[]) =>
    xs.filter((x): x is string => typeof x === 'string');
  switch (r.kind) {
    case 'earthLayers':
      if (r.mode === 'section') return ids([r.distance]);
      if (r.mode === 'seismogram') return ids([r.km, r.vp, r.vs, r.lag]);
      if (r.mode === 'magnitude') return hs2fSpecVars(r);
      return ids(r.stations.map((s) => s.r));
    case 'oceanProfile':
      return r.mode === 'profile' ? ids([r.depth]) : ids([r.angle, r.range]);
    case 'hrDiagram':
      return ids([r.temperature, r.luminosity, r.radius]);
    case 'expandingUniverse':
      return r.mode === 'stretch'
        ? ids([r.scale, r.distance, r.after])
        : ids([r.distance, r.speed, r.constant]);
    case 'atmosphereLayers':
      return r.mode === 'profile'
        ? ids([r.altitude, r.temperature, r.ground])
        : ids([r.high, r.low, r.distance]);
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

/**
 * A `greenhouse` scene. `energy`: sunlight in, infrared out and some sent back by greenhouse
 * gases, as many CO₂ molecules drawn as the `co2` level and the surface's mean temperature on a
 * thermometer; `zones`: Earth at an equinox with the climate zones by latitude, the same beam of
 * sunlight on a small patch at the equator and a large one near a pole.
 */
export interface GreenhouseScene {
  view: 'energy' | 'zones';
  /** No greenhouse gases, the air before 1750 (280 ppm CO₂), or today’s (about 420 ppm). */
  co2?: 'none' | 'preindustrial' | 'today';
  /** The zone lit (a `zones` view). */
  lit?: 'tropical' | 'temperate' | 'polar';
}

export type HslFigure =
  | { kind: 'mohsScale' }
  | { kind: 'landforms' }
  | { kind: 'oceanCurrents' }
  | { kind: 'greenhouse' };

/** The scene field each group L figure reads (for the layout tests). */
export const HSL_SCENE_FIELD = {
  mohsScale: 'mohs',
  landforms: 'landform',
  oceanCurrents: 'currents',
  greenhouse: 'greenhouse',
} as const satisfies Record<HslFigure['kind'], string>;

/**
 * Picture specs for the college pictures, round 3, group M (docs/RENDERINGS_HE.md): HC75
 * `aquifer`, HC76 `refraction`, HC77 the `coordinatePlane` options `shoelace`, `buffer` and
 * `center`, and HC78 `projection` with its card figure. Kept apart from `types.ts` so its
 * union only names them. A `NumOrVar` field is a fixed number or a variable id.
 */
import type { NumOrVar } from './typesGraphs';

const ids = (...xs: (NumOrVar | undefined)[]) =>
  xs.filter((x): x is string => typeof x === 'string');

// ─── HC75: aquifer ───────────────────────────────────────────────────────────

/**
 * A cross-section through the ground (HC75, EG-P17): the land surface, sand painted in its
 * colour, the saturated zone below the water table, clay beneath. Values in the plan's units
 * (m, m/day, m², m³/day, days, kPa).
 *
 * - `section: { drop, length, conductivity?, area?, gradient?, discharge?, flux?, porosity?,
 *   velocity?, time?, confined? }` — two wells L apart, their water levels Δh apart, the water
 *   table (or, `confined`, the potentiometric surface over a clay layer) between them, flow
 *   arrows from high head to low, the face of area A. Heights are stretched (× X, written)
 *   so a gentle gradient shows; lengths along the ground are to scale.
 * - `head: { elevation, pressureHead?, pressure?, head?, weight? }` — one piezometer: the
 *   datum, the screen at z, the water risen ψ = p ÷ γ above it, h = z + ψ bracketed; to scale.
 *   `weight` is γ = ρg in kN/m³ (default 9.81).
 * - `well: { thickness, r1, r2, h1, h2, rate?, conductivity? }` — a confined aquifer b thick
 *   pumped by a well: the cone of depression h(r) through both observation wells (Thiem),
 *   solid between r₁ and r₂; heads on a stretched scale above the confining layer.
 *
 * A "?" draws nothing for its value; values the picture can't make (L ≤ 0, r₂ ≤ r₁) draw
 * faded with the reason in the caption.
 */
export type AquiferSpec =
  | {
      kind: 'aquifer';
      mode: 'section';
      drop: NumOrVar;
      length: NumOrVar;
      conductivity?: NumOrVar;
      area?: NumOrVar;
      gradient?: NumOrVar;
      discharge?: NumOrVar;
      flux?: NumOrVar;
      porosity?: NumOrVar;
      velocity?: NumOrVar;
      time?: NumOrVar;
      confined?: boolean;
    }
  | {
      kind: 'aquifer';
      mode: 'head';
      elevation: NumOrVar;
      pressureHead?: NumOrVar;
      pressure?: NumOrVar;
      head?: NumOrVar;
      weight?: NumOrVar;
    }
  | {
      kind: 'aquifer';
      mode: 'well';
      thickness: NumOrVar;
      r1: NumOrVar;
      r2: NumOrVar;
      h1: NumOrVar;
      h2: NumOrVar;
      rate?: NumOrVar;
      conductivity?: NumOrVar;
    };

export function aquiferVars(r: AquiferSpec): string[] {
  switch (r.mode) {
    case 'section':
      return ids(
        r.drop,
        r.length,
        r.conductivity,
        r.area,
        r.gradient,
        r.discharge,
        r.flux,
        r.porosity,
        r.velocity,
        r.time,
      );
    case 'head':
      return ids(r.elevation, r.pressureHead, r.pressure, r.head, r.weight);
    case 'well':
      return ids(r.thickness, r.r1, r.r2, r.h1, r.h2, r.rate, r.conductivity);
  }
}

// ─── HC76: refraction ────────────────────────────────────────────────────────

/**
 * A seismic or radar survey seen in section, with its travel-time graph under it (HC76,
 * EG-P20). Lengths in m, angles in degrees. Depths and offsets share one scale, so every
 * ray's angle is true.
 *
 * - `refraction: { v1, v2, crossover?, depth?, critical?, intercept? }` — layer 1 (v₁) over a
 *   faster layer 2 (v₂) at depth h, a source and geophones; the direct, head-wave (i_c
 *   marked) and reflected paths. Under it t against x: the direct line x ÷ v₁, the head-wave
 *   line tᵢ + x ÷ v₂ (dashed back to tᵢ), the crossover x_c ringed. Speeds in m/s, `intercept`
 *   in ms. With v₂ ≤ v₁ there is no head wave: faded, the reason in the caption.
 * - `reflection: { depth, speed, offset, t0?, time?, moveout? }` — one layer over a
 *   reflector: the ray to the receiver at x and back, the zero-offset ray dashed; under it the
 *   hyperbola t(x) = √(x² + 4h²) ÷ v with t₀, the point at x and the moveout Δt. Times in s.
 * - `gpr: { permittivity, time, speed?, depth?, light? }` — an antenna over ground of
 *   relative permittivity εᵣ, the pulse down to a buried reflector and back, a depth scale
 *   (m) beside the two-way-time scale (ns) it matches: v = c ÷ √εᵣ, d = vt ÷ 2. `light` is c
 *   in m/ns (default 0.3).
 */
export type RefractionSpec =
  | {
      kind: 'refraction';
      mode: 'refraction';
      v1: NumOrVar;
      v2: NumOrVar;
      crossover?: NumOrVar;
      depth?: NumOrVar;
      critical?: NumOrVar;
      intercept?: NumOrVar;
    }
  | {
      kind: 'refraction';
      mode: 'reflection';
      depth: NumOrVar;
      speed: NumOrVar;
      offset: NumOrVar;
      t0?: NumOrVar;
      time?: NumOrVar;
      moveout?: NumOrVar;
    }
  | {
      kind: 'refraction';
      mode: 'gpr';
      permittivity: NumOrVar;
      time: NumOrVar;
      speed?: NumOrVar;
      depth?: NumOrVar;
      light?: NumOrVar;
    };

export function refractionVars(r: RefractionSpec): string[] {
  switch (r.mode) {
    case 'refraction':
      return ids(r.v1, r.v2, r.crossover, r.depth, r.critical, r.intercept);
    case 'reflection':
      return ids(r.depth, r.speed, r.offset, r.t0, r.time, r.moveout);
    case 'gpr':
      return ids(r.permittivity, r.time, r.speed, r.depth, r.light);
  }
}

// ─── HC77: coordinatePlane GIS options ───────────────────────────────────────

/**
 * GIS options of `coordinatePlane` (HC77, EG-P26), drawn by `CoordinatePlaneHe3m.tsx` on a
 * plane sized to the figure (equal scales, coordinates in metres or the page's unit). A page
 * sets one of them; each is off unless set, so the Grades 9–12 polygon and every other plane
 * are unchanged.
 *
 * - `shoelace: { area? }` with the plane's `polygon` (3–6 vertices in order round the edge;
 *   `x`, `y` its first corner): the polygon shaded, each cross term xᵢyᵢ₊₁ − xᵢ₊₁yᵢ listed and
 *   the area ½|Σ| worked; a figure whose sides cross is drawn faded with the reason.
 * - `buffer: { area? }`: the plane's `x` is the line's length L and its `y` the buffer radius
 *   r (a buffer has no corner to place, so the one point is the outline's corner (L, r), which
 *   drags L and r). The line, its outline r out with round ends, the 2rL strip and the two
 *   half-discs (πr²) shaded apart, a scale bar; L = 0 is a point's buffer, a disc.
 * - `center: { points, x?, y?, sd? }`: the points (`x`, `y` the first), the mean centre
 *   (x̄, ȳ) and the standard-distance circle of radius SD = √(Σ((x − x̄)² + (y − ȳ)²) ÷ n),
 *   dashed spokes from the centre.
 */
export interface PlaneGis {
  shoelace?: { area?: NumOrVar };
  buffer?: { area?: NumOrVar };
  center?: { points: [NumOrVar, NumOrVar][]; x?: NumOrVar; y?: NumOrVar; sd?: NumOrVar };
}

export function planeGisVars(r: PlaneGis): string[] {
  return ids(
    r.shoelace?.area,
    r.buffer?.area,
    ...(r.center ? [...r.center.points.flat(), r.center.x, r.center.y, r.center.sd] : []),
  );
}

// ─── HC78: projection and its card ───────────────────────────────────────────

/** A projection the card figure draws (the main picture draws the three cylinders). */
export type ProjectionName =
  | 'mercator'
  | 'cylindricalEqualArea'
  | 'equirectangular'
  | 'gallPeters'
  | 'mollweide'
  | 'winkelTripel'
  | 'lambertConformalConic'
  | 'albersEqualAreaConic'
  | 'stereographic'
  | 'azimuthalEquidistant';

/**
 * A world map on a cylinder (HC78, EG-P28), computed from the projection's formulas: the
 * graticule every 15°, rough land shapes written in code (`land`, never traced from a map),
 * Tissot ellipses at the equator and at φ with their axes k_E and k_N, faint ones every 30°,
 * and the parallel φ lit with its height y. Fields: `projection` (`mercator`,
 * `cylindricalEqualArea`, `equirectangular`), `latitude` φ (°), `radius` R (the globe's, in the
 * page's unit), `y`, `kE` (Mercator's k), `kN`, `area` (the area factor). Mercator stops at
 * 80° (or 5° past φ, to 85°): the poles never fit. Drag the lit ellipse to move φ.
 */
export interface ProjectionSpec {
  kind: 'projection';
  projection: 'mercator' | 'cylindricalEqualArea' | 'equirectangular';
  latitude: NumOrVar;
  radius?: NumOrVar;
  y?: NumOrVar;
  kE?: NumOrVar;
  kN?: NumOrVar;
  area?: NumOrVar;
  land?: boolean;
}

export function projectionVars(r: ProjectionSpec): string[] {
  return ids(r.latitude, r.radius, r.y, r.kE, r.kN, r.area);
}

/**
 * The `projection` card figure (HC78): one projection's outline and graticule every 30°, the
 * land shapes shaded, and (`tissot`) small Tissot ellipses that show what it keeps. 84 × 52.
 */
export interface ProjectionCard {
  kind: 'projection';
  projection: ProjectionName;
  tissot?: boolean;
  land?: boolean;
}

export const PROJECTION_CARD_W = 84;
export const PROJECTION_CARD_H = 52;

/** The round-3 group M picture kinds (more are added with each request). */
export type He3mSpec = AquiferSpec | RefractionSpec | ProjectionSpec;

export function he3mVars(r: He3mSpec): string[] {
  switch (r.kind) {
    case 'aquifer':
      return aquiferVars(r);
    case 'refraction':
      return refractionVars(r);
    case 'projection':
      return projectionVars(r);
  }
}

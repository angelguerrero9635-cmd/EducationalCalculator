/**
 * College pictures, round 4, group H (docs/RENDERINGS_HE.md): earth, geography and one biology
 * picture. Kept apart from `types.ts` so it gains one line. A `NumOrVar` field is a fixed number
 * or a variable id, read in the variable's shown unit (the units named below); a string field is
 * the page's own worked-out value, checked by the harness.
 *
 * - HC129 `catchment` (new kind): the rational method, Qₚ = CiA ÷ 3.6.
 * - HC133 `contourMap` (new kind): a hill's contours, a transect and its profile.
 * - HC134 `rasterGrid` (new kind): a raster's extent and cells; a 3 × 3 slope window.
 * - HC135 `sample` `pattern`: points with a nearest-neighbour index R.
 * - HC150 `sample` `herd`: 100 people, the immune shaded, one case's R₀ contacts.
 * - HC136 `populationPyramid` (new kind): age bars from three group totals, dependency ratio.
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

// ─── HC134: rasterGrid (new kind) ──────────────────────────────────────────────

/**
 * HC134 (EG-P25) `extent`: a lake (a vector feature, dashed) on a raster `width` × `height` km
 * at cell size `cell` m, the cells whose centres fall in it filled, columns (1,000 × width ÷ c)
 * and rows counted. Past 40 cells a side each drawn square is b × b cells (b = 1, 2 or 5 × 10ⁿ,
 * named under the grid). `columns`, `rows`, `cells` and `size` (MB, cells × `bytes` ÷ 10⁶) are
 * the page's values (checked). The caption says what halving c does (four times the cells).
 */
export interface RasterExtentSpec {
  kind: 'rasterGrid';
  mode: 'extent';
  width: NumOrVar;
  height: NumOrVar;
  cell: NumOrVar;
  bytes?: NumOrVar;
  columns?: string;
  rows?: string;
  cells?: string;
  size?: string;
}

/**
 * HC134 (EG-P25) `window`: a 3 × 3 window of a DEM, cell size `cell` m, the elevations (m) east,
 * west, north and south of the centre cell (and the centre's own, `center?`, which the slope
 * doesn't use), each cell shaded by height; the arrow downhill from the centre and a compass
 * with the aspect swept from north. `dzdx` = (z_E − z_W) ÷ 2c and `dzdy` = (z_N − z_S) ÷ 2c,
 * `slope` (°), `percent` and `aspect` (° from north, the way the ground falls) are the page's
 * values (checked). A flat window draws no arrow.
 */
export interface RasterWindowSpec {
  kind: 'rasterGrid';
  mode: 'window';
  cell: NumOrVar;
  east: NumOrVar;
  west: NumOrVar;
  north: NumOrVar;
  south: NumOrVar;
  center?: NumOrVar;
  dzdx?: string;
  dzdy?: string;
  slope?: string;
  percent?: string;
  aspect?: string;
}

// ─── HC135, HC150: sample options ─────────────────────────────────────────────

/**
 * HC135 (EG-P27) `pattern`: `n` points (2 to 10,000; at most 300 drawn, in the same pattern) in
 * a square of `area` km², seeded and placed clustered, random or dispersed so that their own
 * nearest-neighbour index is within 0.05 of R = `index` (0 to 2.15). Under the square a gauge
 * from clustered (0) through random (1) to dispersed (2.15) with R marked; a button shows each
 * point's segment to its nearest neighbour. `observed` (d̄, km), `expected` (0.5 ÷ √(n ÷ A)),
 * `se` and `z` are the page's values (checked); `seed` changes the draw.
 */
export interface SamplePatternSpec {
  kind: 'sample';
  pattern: {
    n: NumOrVar;
    index: NumOrVar;
    area?: NumOrVar;
    observed?: NumOrVar;
    expected?: string;
    se?: string;
    z?: string;
    seed?: number;
  };
}

/**
 * HC150 (B-P15) `herd`: 100 people in a 10 × 10 crowd, round(100p) of them immune (shaded; p is
 * `immune`, a share 0 to 1, or a percent when its variable's unit is %), one case with arrows
 * to round(R₀) contacts (at most 20); arrows to immune people stop short at a bar, the others
 * reach and mark the person infected. round(p × contacts) arrows stop: R₀ × p to rounding. The
 * caption works R = R₀(1 − p). `threshold` is the page's 1 − 1 ÷ R₀ (checked, a share or %).
 */
export interface SampleHerdSpec {
  kind: 'sample';
  herd: { r0: NumOrVar; immune: NumOrVar; threshold?: string };
}

// ─── HC136: populationPyramid (new kind) ───────────────────────────────────────

/**
 * HC136 (EG-P29): five-year age bars (0–4 to 85+), male left and female right, built from the
 * page's group totals `young` (0–14), `working` (15–64) and `old` (65+) and a `shape`
 * (expansive, stationary or constrictive; left out, read from young against working per bar):
 * each group's bars add to its total, the shape inside a group is drawn. The dependent groups
 * are shaded apart from the working ages and each group is bracketed with its total; `ratio`,
 * `youth` and `oldAge` (per 100 of working age) are the page's values (checked). A "?" group
 * draws no bars.
 */
export interface PopulationPyramidSpec {
  kind: 'populationPyramid';
  young: NumOrVar;
  working: NumOrVar;
  old: NumOrVar;
  shape?: 'expansive' | 'stationary' | 'constrictive';
  ratio?: string;
  youth?: string;
  oldAge?: string;
}

/** Every spec of group H. */
export type He4hSpec =
  | CatchmentSpec
  | ContourMapSpec
  | RasterExtentSpec
  | RasterWindowSpec
  | SamplePatternSpec
  | SampleHerdSpec
  | PopulationPyramidSpec;

const HE4H_KINDS = new Set<string>(['catchment', 'contourMap', 'rasterGrid', 'populationPyramid']);

/** Whether a picture spec is one of group H's (a new kind, or an option on `sample`). */
export const isHe4hSpec = (r: { kind: string }): r is He4hSpec =>
  HE4H_KINDS.has(r.kind) || (r.kind === 'sample' && ('pattern' in r || 'herd' in r));

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
    case 'rasterGrid':
      return r.mode === 'window'
        ? ids(
            r.cell,
            r.east,
            r.west,
            r.north,
            r.south,
            r.center,
            r.dzdx,
            r.dzdy,
            r.slope,
            r.percent,
            r.aspect,
          )
        : ids(r.width, r.height, r.cell, r.bytes, r.columns, r.rows, r.cells, r.size);
    case 'sample':
      return 'pattern' in r
        ? ids(
            r.pattern.n,
            r.pattern.index,
            r.pattern.area,
            r.pattern.observed,
            r.pattern.expected,
            r.pattern.se,
            r.pattern.z,
          )
        : ids(r.herd.r0, r.herd.immune, r.herd.threshold);
    case 'populationPyramid':
      return ids(r.young, r.working, r.old, r.ratio, r.youth, r.oldAge);
  }
}

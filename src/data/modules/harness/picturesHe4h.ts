/**
 * Picture checks for college round 4, group H (docs/RENDERINGS_HE.md), called from `repIssues`
 * in `pictures.ts` before its switch. Each request's check is written apart from the picture's
 * own sums where it can be. Test-only.
 */
import type { VariableDef } from '@/engine/types';
import {
  BASIN,
  BASIN_AREA,
  CATCHMENT_DROP_AT,
  CATCHMENT_DROPS,
  contourCount,
  contourShare,
  RASTER_MAX_DRAWN,
  downhillBearing,
  inside,
  rasterBlock,
  runoffDrops,
  transectCrossings,
  transectEnds,
} from '@/components/module/reps/he4hMath';

import type { He4hSpec } from '../typesHe4h';

type Val = (x: string | number) => number | undefined;

const close = (a: number, b: number, rel = 1e-3) =>
  Math.abs(a - b) <= rel * Math.max(1e-9, Math.abs(a), Math.abs(b));

export function he4hIssues(rep: He4hSpec, val: Val, byId: Map<string, VariableDef>): string[] {
  void byId;
  const get = (v: string | number | undefined) => (v === undefined ? undefined : val(v));
  switch (rep.kind) {
    case 'catchment':
      return catchmentIssues(rep, get);
    case 'contourMap':
      return contourIssues(rep, get);
    case 'rasterGrid':
      return rasterIssues(rep, get);
  }
}

/**
 * HC129: Qₚ = CiA ÷ 3.6 (written out here); C in [0, 1]; the drawn share of the 40 drops is C
 * within half a drop; all 40 drops lie in the basin; A is what the scale bar makes of the
 * outline (the bar's km per unit, squared, times the outline's own shoelace area).
 */
function catchmentIssues(
  rep: Extract<He4hSpec, { kind: 'catchment' }>,
  get: (v: string | number | undefined) => number | undefined,
): string[] {
  const out: string[] = [];
  const [C, i, A, Q] = [get(rep.coefficient), get(rep.intensity), get(rep.area), get(rep.peak)];
  if (C !== undefined && (C < 0 || C > 1)) out.push(`catchment: C = ${C} is outside 0 to 1`);
  if (i !== undefined && i <= 0) out.push(`catchment: i = ${i} is not positive`);
  if (A !== undefined && A <= 0) out.push(`catchment: A = ${A} is not positive`);
  if (C !== undefined && i !== undefined && A !== undefined && Q !== undefined) {
    const q = C * (i / 3600 / 1000) * (A * 1e6); // m/s × m² = m³/s
    if (!close(q, Q)) out.push(`catchment: Qₚ = ${Q} m³/s, but CiA ÷ 3.6 = ${q}`);
  }
  if (C !== undefined && C >= 0 && C <= 1) {
    const k = runoffDrops(C);
    if (Math.abs(k / CATCHMENT_DROPS - C) > 0.5 / CATCHMENT_DROPS + 1e-12)
      out.push(`catchment: ${k} of ${CATCHMENT_DROPS} drops run off, not the share C = ${C}`);
  }
  if (CATCHMENT_DROP_AT.length !== CATCHMENT_DROPS)
    out.push(`catchment: ${CATCHMENT_DROP_AT.length} drops placed, not ${CATCHMENT_DROPS}`);
  if (CATCHMENT_DROP_AT.some((p) => !inside(p, BASIN)))
    out.push('catchment: a drop lies outside the basin');
  if (A !== undefined && A > 0) {
    // The bar's km per unit length, squared, times the outline's area in units.
    let s = 0;
    for (let j = 0; j < BASIN.length; j++) {
      const a = BASIN[j]!;
      const b = BASIN[(j + 1) % BASIN.length]!;
      s += a.x * b.y - b.x * a.y;
    }
    const kmPerUnit = Math.sqrt(A / BASIN_AREA);
    if (!close((Math.abs(s) / 2) * kmPerUnit ** 2, A, 1e-9))
      out.push(`catchment: the outline at the bar's scale is not A = ${A} km²`);
  }
  return out;
}

/**
 * HC133: rise = n × CI; ground = map × scale ÷ 100; gradient = 100 × rise ÷ ground; angle =
 * tan⁻¹(rise ÷ ground) (all written out here). The line A–B meets exactly n contours after A,
 * one interval apart and climbing (so it crosses n intervals), and the contours shrink toward the
 * summit, so the profile through them is the straight slope rise ÷ run.
 */
function contourIssues(
  rep: Extract<He4hSpec, { kind: 'contourMap' }>,
  get: (v: string | number | undefined) => number | undefined,
): string[] {
  const out: string[] = [];
  const [CI, n, map, S] = [
    get(rep.interval),
    get(rep.crossed),
    get(rep.mapDistance),
    get(rep.scale),
  ];
  if (CI !== undefined && CI <= 0) out.push(`contour: CI = ${CI} is not positive`);
  if (n !== undefined && (n < 0 || Math.abs(n - Math.round(n)) > 1e-9))
    out.push(`contour: n = ${n} is not a whole number of intervals`);
  const rise = n !== undefined && CI !== undefined ? n * CI : undefined;
  const ground = map !== undefined && S !== undefined ? (map * S) / 100 : undefined;
  const r = get(rep.rise);
  if (r !== undefined && rise !== undefined && !close(r, rise))
    out.push(`contour: rise ${r} m is not n × CI = ${rise} m`);
  const g = get(rep.ground);
  if (g !== undefined && ground !== undefined && !close(g, ground))
    out.push(`contour: ground ${g} m is not map × scale ÷ 100 = ${ground} m`);
  const G = get(rep.gradient);
  if (G !== undefined && rise !== undefined && ground && !close(G, (100 * rise) / ground))
    out.push(`contour: gradient ${G} % is not 100 × rise ÷ run = ${(100 * rise) / ground}`);
  const a = get(rep.angle);
  const angle = rise !== undefined && ground ? (Math.atan2(rise, ground) * 180) / Math.PI : NaN;
  if (a !== undefined && Number.isFinite(angle) && !close(a, angle))
    out.push(`contour: angle ${a}° is not tan⁻¹(rise ÷ run) = ${angle}°`);
  if (n !== undefined && n >= 0) {
    const k = Math.round(n);
    const met = transectCrossings(k);
    if (met.length !== k) out.push(`contour: A–B meets ${met.length} contours, not n = ${k}`);
    if (met.some((x, i) => x !== i + 1)) out.push('contour: A–B skips a contour');
    const K = contourCount(k);
    for (let j = 1; j < K; j++)
      if (!(contourShare(j, K) < contourShare(j - 1, K)))
        out.push('contour: the contours do not shrink toward the summit');
    const { a: sa, b: sb } = transectEnds(k);
    if (
      k > 0 &&
      (Math.abs(sa - contourShare(0, K)) > 1e-12 || Math.abs(sb - contourShare(k, K)) > 1e-12)
    )
      out.push('contour: A or B is not on its contour');
  }
  return out;
}

/**
 * HC134 `extent`: columns = 1,000 × width ÷ c, rows likewise, cells = columns × rows, size =
 * cells × bytes ÷ 10⁶ (bytes 1, 2, 4 or 8); the drawn squares (b cells a side) cover the columns
 * and rows with less than one square over, at most 40 a side. `window`: east = (z_E − z_W) ÷ 2c,
 * north = (z_N − z_S) ÷ 2c, slope = tan⁻¹ of their length, percent = 100 × it; the aspect is the
 * way downhill: a step from the centre that way lowers the plane z = east·x + north·y.
 */
function rasterIssues(
  rep: Extract<He4hSpec, { kind: 'rasterGrid' }>,
  get: (v: string | number | undefined) => number | undefined,
): string[] {
  const out: string[] = [];
  const c = get(rep.cell);
  if (c !== undefined && c <= 0) out.push(`raster: cell size ${c} m is not positive`);
  if (rep.mode === 'extent') {
    const [W, H, bytes] = [get(rep.width), get(rep.height), get(rep.bytes)];
    if (bytes !== undefined && ![1, 2, 4, 8].includes(bytes))
      out.push(`raster: ${bytes} bytes a cell is not 1, 2, 4 or 8`);
    if (W === undefined || H === undefined || c === undefined || c <= 0) return out;
    const cols = (W * 1000) / c;
    const rows = (H * 1000) / c;
    const pairs: [string | undefined, number, string][] = [
      [rep.columns, cols, 'columns'],
      [rep.rows, rows, 'rows'],
      [rep.cells, cols * rows, 'cells'],
      [rep.size, bytes !== undefined ? (cols * rows * bytes) / 1e6 : NaN, 'size (MB)'],
    ];
    for (const [id, want, what] of pairs) {
      const got = get(id);
      if (got !== undefined && Number.isFinite(want) && !close(got, want, 1e-6))
        out.push(`raster: ${what} ${got} is not ${want}`);
    }
    const b = rasterBlock(cols, rows);
    for (const n of [cols, rows]) {
      const drawn = Math.ceil(n / b - 1e-9);
      if (drawn > RASTER_MAX_DRAWN) out.push(`raster: ${drawn} squares drawn a side`);
      if (drawn * b < n - 1e-9 || (drawn - 1) * b >= n - 1e-9)
        out.push(`raster: ${drawn} squares of ${b} cells do not just cover ${n}`);
    }
    return out;
  }
  const [E, Wz, N, S] = [get(rep.east), get(rep.west), get(rep.north), get(rep.south)];
  if (
    c === undefined ||
    c <= 0 ||
    E === undefined ||
    Wz === undefined ||
    N === undefined ||
    S === undefined
  )
    return out;
  const ex = (E - Wz) / (2 * c);
  const ny = (N - S) / (2 * c);
  const g = Math.sqrt(ex * ex + ny * ny);
  const checks: [string | undefined, number, string][] = [
    [rep.dzdx, ex, 'east gradient'],
    [rep.dzdy, ny, 'north gradient'],
    [rep.slope, (Math.atan(g) * 180) / Math.PI, 'slope (°)'],
    [rep.percent, 100 * g, 'slope (%)'],
  ];
  for (const [id, want, what] of checks) {
    const got = get(id);
    if (got !== undefined && !close(got, want, 1e-6))
      out.push(`raster: ${what} ${got} is not ${want}`);
  }
  const b = downhillBearing(ex, ny);
  if (g > 1e-12) {
    if (b === undefined) out.push('raster: a sloping window draws no downhill arrow');
    else {
      const t = (b * Math.PI) / 180;
      // A unit step that way (east = sin, north = cos) changes z by east·sin + north·cos = −g.
      const dz = ex * Math.sin(t) + ny * Math.cos(t);
      if (!close(dz, -g, 1e-9)) out.push(`raster: the arrow at ${b}° is not straight downhill`);
      const a = get(rep.aspect);
      if (a !== undefined && !close(a, b, 1e-6)) out.push(`raster: aspect ${a}° is not ${b}°`);
    }
  }
  return out;
}

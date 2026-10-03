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
  inside,
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

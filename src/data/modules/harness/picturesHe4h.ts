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
  inside,
  runoffDrops,
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

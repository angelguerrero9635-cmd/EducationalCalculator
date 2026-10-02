/**
 * Picture checks for the college round 3 group C options (`typesHe3c.ts`): HC53 `polarGrid`
 * areas, regions, tangent and traced length. What each draws must agree with the page's
 * values. Called from `repIssues` in `pictures.ts`. Test-only.
 */
import { CURVE_FIELDS, PATH_FIELDS } from '@/components/module/reps/polar';
import {
  pathLength,
  polarArea,
  polarTangent,
  regionArea,
} from '@/components/module/reps/polarHe3cMath';

import type { NumOrVar } from '../typesGraphs';
import type { PolarGridSpec } from '../typesHsd';
import type { Representation } from '../types';

type Val = (x: string | number) => number | undefined;

/** Equal to a relative tolerance (or 10⁻⁶ near zero). */
const near = (a: number, b: number, tol = 1e-3) =>
  Math.abs(a - b) <= tol * Math.max(1e-6, Math.abs(a), Math.abs(b));

export function he3cIssues(rep: Representation, val: Val): string[] {
  const out: string[] = [];
  const get = (x: NumOrVar | undefined) => {
    if (x === undefined) return undefined;
    const y = val(x);
    return y === undefined || Number.isNaN(y) ? undefined : y;
  };
  const check = (id: string | undefined, want: number, what: string) => {
    const got = get(id);
    if (got !== undefined && !near(got, want))
      out.push(`${what} is ${got}, the picture gives ${want}`);
  };
  if (rep.kind === 'polarGrid') polarIssues(rep, get, check, out);
  return out;
}

function polarIssues(
  rep: PolarGridSpec,
  get: (x: NumOrVar | undefined) => number | undefined,
  check: (id: string | undefined, want: number, what: string) => void,
  out: string[],
) {
  const read = (o: object, fields: string[]) => {
    const v: Record<string, number> = {};
    for (const k of fields) {
      const x = (o as Record<string, NumOrVar | undefined>)[k];
      if (x === undefined) continue;
      const n = get(x);
      if (n === undefined) return undefined;
      v[k] = n;
    }
    return v;
  };
  const cv = rep.curve ? read(rep.curve, CURVE_FIELDS[rep.curve.shape]) : undefined;
  // The shaded area is ½∫ r² dθ over the swept angles.
  const [from, to] = [get(rep.area?.from), get(rep.area?.to)];
  if (rep.area && rep.curve && cv && from !== undefined && to !== undefined) {
    if (to < from) out.push(`the swept area runs backwards (${from}° to ${to}°)`);
    check(rep.area.value, polarArea(rep.curve, cv, from, to), 'the swept area');
  }
  if (rep.area && !rep.curve) out.push('area needs a curve');
  // The annular sector.
  const g = rep.region;
  if (g) {
    const [r1, r2, a, b] = [get(g.r1), get(g.r2), get(g.from), get(g.to)];
    if (r1 !== undefined && r2 !== undefined && a !== undefined && b !== undefined) {
      if (r1 < 0 || r2 < r1) out.push(`the region needs 0 ≤ r₁ ≤ r₂ (${r1}, ${r2})`);
      if (b < a || b - a > 360 + 1e-9) out.push(`the region's angles run ${a}° to ${b}°`);
      check(g.area, regionArea(r1, r2, a, b), 'the region’s area');
    }
  }
  // The tangent slope at the point.
  const th = get(rep.point?.theta);
  if (rep.tangent && rep.curve && cv && th !== undefined) {
    const t = polarTangent(rep.curve, cv, th);
    const id = rep.tangent === true ? undefined : rep.tangent.slope;
    if (t.slope === undefined) {
      if (get(id) !== undefined) out.push('the tangent is vertical but a slope is given');
    } else check(id, t.slope, 'the tangent slope');
  }
  if (rep.tangent && !rep.point) out.push('tangent needs a point');
  // The traced length.
  const p = rep.parametric;
  const pt = get(p?.t);
  if (p?.length && pt !== undefined) {
    const pv = read(p, PATH_FIELDS[p.family]);
    if (pv) check(p.length, pathLength(p, pv, p.range[0], pt), 'the traced length');
  }
}

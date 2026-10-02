/**
 * Picture checks for college round 3, group B (docs/RENDERINGS_HE.md). Called from each kind's
 * case in `pictures.ts`. Test-only.
 * - HC46 `surfacePlot`: f parses; f, f_x, f_y and |∇f| at the point equal the exact partials;
 *   ∇f is square to the level curve there; the critical point has ∇f = 0 and its D; the prism
 *   sum equals the midpoint sum and the integral an independent Simpson sum; D_u f = ∇f · u.
 */
import { surfaceOf } from '@/components/module/reps/exprDiffHe3b';
import { parseExpr } from '@/components/module/reps/exprHe1e';
import { integral2, prismsOf } from '@/components/module/reps/surfaceMathHe3b';

import type { Representation } from '../types';
import type { NumOrVar } from '../typesGraphs';
import { exprNamesHe3b } from '../typesHe3b';

type Val = (x: string | number) => number | undefined;

const near = (a: number, b: number, rel = 1e-6) =>
  Math.abs(a - b) <= rel * Math.max(1, Math.abs(a), Math.abs(b));

/** Every value a list names, or undefined when one is "?". */
function all(val: Val, xs: NumOrVar[]): number[] | undefined {
  const out = xs.map((x) => val(x));
  return out.every((x) => x !== undefined) ? (out as number[]) : undefined;
}

export function surfacePlotIssues(
  rep: Extract<Representation, { kind: 'surfacePlot' }>,
  val: Val,
): string[] {
  const out: string[] = [];
  try {
    parseExpr(rep.f);
  } catch (e) {
    return [`surfacePlot: f does not parse (${(e as Error).message})`];
  }
  const names = exprNamesHe3b(rep.f, ['x', 'y']);
  if (names.some((n) => val(n) === undefined)) return out;
  const S = surfaceOf(rep.f, (n) => val(n)!)!;
  const check = (id: string | undefined, want: number, what: string) => {
    if (id === undefined) return;
    const got = val(id);
    if (got !== undefined && !near(got, want))
      out.push(`surfacePlot: ${what} is ${got}, not ${want}`);
  };
  const p = rep.point ? all(val, [rep.point.x, rep.point.y]) : undefined;
  if (rep.point && p) {
    const [x, y] = p as [number, number];
    const [fx, fy] = [S.fx(x, y), S.fy(x, y)];
    check(rep.point.z, S.f(x, y), 'f at the point');
    check(rep.point.fx, fx, 'f_x');
    check(rep.point.fy, fy, 'f_y');
    check(rep.point.grad, Math.hypot(fx, fy), '|∇f|');
    // ∇f square to the level curve: f barely changes a short step along (−f_y, f_x).
    const g = Math.hypot(fx, fy);
    if (g > 1e-9) {
      const h = 1e-5 * (Math.hypot(x, y) || 1);
      const along = S.f(x - (h * fy) / g, y + (h * fx) / g) - S.f(x, y);
      if (Math.abs(along) > 1e-3 * g * h)
        out.push('surfacePlot: ∇f is not square to the level curve');
    }
    if (rep.direction) {
      const d = all(val, [rep.direction.x, rep.direction.y]);
      if (d && Math.hypot(d[0]!, d[1]!) > 0) {
        const m = Math.hypot(d[0]!, d[1]!);
        check(rep.direction.rate, (fx * d[0]!) / m + (fy * d[1]!) / m, 'D_u f');
      }
    }
  }
  if (rep.critical) {
    const xy = all(val, [rep.critical.x ?? 0, rep.critical.y ?? 0]);
    if (xy && rep.critical.x !== undefined && rep.critical.y !== undefined) {
      const [x, y] = xy as [number, number];
      if (Math.hypot(S.fx(x, y), S.fy(x, y)) > 1e-6 * Math.max(1, Math.abs(S.f(x, y))))
        out.push(`surfacePlot: ∇f is not 0 at the critical point (${x}, ${y})`);
      check(rep.critical.z, S.f(x, y), 'f at the critical point');
      check(rep.critical.D, S.fxx(x, y) * S.fyy(x, y) - S.fxy(x, y) ** 2, 'D');
    }
  }
  if (rep.region) {
    const r = all(val, [rep.region.a, rep.region.b, rep.region.c, rep.region.d]);
    if (r) {
      const [a, b, c, d] = r as [number, number, number, number];
      if (!(b > a && d > c)) out.push('surfacePlot: the region is empty');
      const n = rep.region.boxes === undefined ? 4 : val(rep.region.boxes);
      if (n !== undefined) {
        if (!Number.isInteger(n) || n < 1 || n > 12) out.push(`surfacePlot: ${n} boxes a side`);
        else check(rep.region.sum, prismsOf(S.f, a, b, c, d, n).sum, 'the prism sum');
      }
      check(rep.region.value, integral2(S.f, a, b, c, d, 60), 'the integral');
    }
  }
  return out;
}

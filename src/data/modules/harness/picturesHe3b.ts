/**
 * Picture checks for college round 3, group B (docs/RENDERINGS_HE.md). Called from each kind's
 * case in `pictures.ts`. Test-only.
 * - HC46 `surfacePlot`: f parses; f, f_x, f_y and |∇f| at the point equal the exact partials;
 *   ∇f is square to the level curve there; the critical point has ∇f = 0 and its D; the prism
 *   sum equals the midpoint sum and the integral an independent Simpson sum; D_u f = ∇f · u.
 * - HC47 `vectorDiagram` space objects: the plane passes through its point (d = n · P₀), D and
 *   the foot F of the drop; the line's point at t, on the plane it meets; the helix's speed,
 *   length and curvature; F · n and the flux out of the sphere; the circulation round the circle.
 * - HC65 `solidOfRevolution`: f and g parse; the volume equals the method's integral (an
 *   independent trapezoid sum); the slice's radius equals f(at) (the inner g(at), the shell's
 *   height f − g); the slice lies on [a, b].
 */
import { curveOfHe3b, surfaceOf } from '@/components/module/reps/exprDiffHe3b';
import { solidProblem } from '@/components/module/reps/solidMathHe3b';
import { parseExpr } from '@/components/module/reps/exprHe1e';
import {
  circleCirculation,
  helixAt,
  lineAt,
  planeDrop,
  sphereFlux,
} from '@/components/module/reps/spaceObjectsMathHe3b';
import { integral2, prismsOf } from '@/components/module/reps/surfaceMathHe3b';
import { dot3, type V3 } from '@/components/module/reps/vectorSpace';

import type { Representation } from '../types';
import type { NumOrVar } from '../typesGraphs';
import { exprNamesHe3b, type IdTriple, type Triple } from '../typesHe3b';

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

export function spaceObjectsIssues(
  rep: Extract<Representation, { kind: 'vectorDiagram' }>,
  val: Val,
): string[] {
  const out: string[] = [];
  const s = rep.space;
  if (!s) return out;
  const tri = (t?: Triple) => (t ? (all(val, t) as V3 | undefined) : undefined);
  const v0 = rep.vectors[0];
  const n = v0 ? tri([v0.x ?? 0, v0.y ?? 0, v0.z ?? 0]) : undefined;
  const check = (id: string | undefined, want: number, what: string) => {
    if (id === undefined) return;
    const got = val(id);
    if (got !== undefined && !near(got, want)) out.push(`space: ${what} is ${got}, not ${want}`);
  };
  const check3 = (ids: IdTriple | undefined, want: V3, what: string) =>
    (['x', 'y', 'z'] as const).forEach((k, i) => check(ids?.[k], want[i]!, `${what}'s ${k}`));
  if (s.plane) {
    const p0 = tri(s.plane.point);
    const q = tri(s.plane.q);
    if (n && p0) {
      if (!(Math.hypot(...n) > 0)) out.push('space: the plane needs a nonzero normal');
      const pd = planeDrop(n, p0, q);
      check(s.plane.d, pd.d, 'd = n · P₀');
      if (pd.distance !== undefined) {
        check(s.plane.distance, pd.distance, 'the distance D');
        check3(s.plane.foot, pd.foot!, 'the foot F');
        if (Math.abs(dot3(n, pd.foot!) - pd.d) > 1e-6 * Math.max(1, Math.abs(pd.d)))
          out.push('space: the foot F is not on the plane');
      }
    }
  }
  if (s.line) {
    const p0 = tri(s.line.point);
    const t = val(s.line.t);
    if (n && p0 && t !== undefined) {
      const at = lineAt(p0, n, t);
      check3(s.line.at, at, 'r(t)');
      const mn = tri(s.line.meets?.normal);
      const md = s.line.meets ? val(s.line.meets.d) : undefined;
      if (mn && md !== undefined && Math.abs(dot3(mn, at) - md) > 1e-6 * Math.max(1, Math.abs(md)))
        out.push(`space: r(${t}) is not on the plane it meets`);
    }
  }
  if (s.curve) {
    const [a, c, T] = [val(s.curve.helix.a), val(s.curve.helix.c), val(s.curve.T ?? 2 * Math.PI)];
    if (a !== undefined && c !== undefined) {
      const h = helixAt(a, c, 0);
      check(s.curve.speed, h.speed, 'the speed');
      check(s.curve.curvature, h.curvature, 'the curvature');
      if (T !== undefined) check(s.curve.length, h.speed * T, 'the length');
      if (T !== undefined && !(T > 0)) out.push('space: the helix needs T > 0');
    }
  }
  if (s.sphere) {
    const [r, k] = [val(s.sphere.r), s.sphere.k === undefined ? undefined : val(s.sphere.k)];
    if (r !== undefined && !(r > 0)) out.push('space: the sphere needs r > 0');
    if (r !== undefined && k !== undefined) {
      const f = sphereFlux(k, r);
      check(s.sphere.fn, f.fn, 'F · n');
      check(s.sphere.flux, f.flux, 'the flux');
    }
  }
  if (s.circle) {
    const [r, k] = [val(s.circle.r), s.circle.k === undefined ? undefined : val(s.circle.k)];
    if (r !== undefined && !(r > 0)) out.push('space: the circle needs r > 0');
    if (r !== undefined && k !== undefined)
      check(s.circle.circulation, circleCirculation(k, r).circulation, 'the circulation');
  }
  return out;
}

export function solidIssues(
  rep: Extract<Representation, { kind: 'solidOfRevolution' }>,
  val: Val,
): string[] {
  const out: string[] = [];
  for (const src of [rep.f, rep.g])
    if (src !== undefined)
      try {
        parseExpr(src);
      } catch (e) {
        return [`solidOfRevolution: ${src} does not parse (${(e as Error).message})`];
      }
  const names = [...exprNamesHe3b(rep.f, ['x']), ...exprNamesHe3b(rep.g, ['x'])];
  const [a, b] = [val(rep.from), val(rep.to)];
  if (names.some((n) => val(n) === undefined) || a === undefined || b === undefined) return out;
  const f = curveOfHe3b(rep.f, (n) => val(n)!)!;
  const g = rep.g ? curveOfHe3b(rep.g, (n) => val(n)!)! : undefined;
  if (rep.method === 'washer' && !g) out.push('solidOfRevolution: a washer needs g');
  // A case the values can't make draws faded with its reason; nothing to check.
  if (solidProblem(f, g, rep.axis, rep.method, a, b)) return out;
  const inner = g ?? (() => 0);
  // An independent sum (the trapezoid rule on 4000 strips), not the picture's Simpson.
  const n = 4000;
  const w = (b - a) / n;
  let V = 0;
  for (let i = 0; i <= n; i++) {
    const x = a + i * w;
    const h =
      rep.method === 'shell'
        ? 2 * Math.PI * x * (f(x) - inner(x))
        : Math.PI * (f(x) ** 2 - inner(x) ** 2);
    V += (i === 0 || i === n ? 0.5 : 1) * h * w;
  }
  const check = (id: string | undefined, want: number, what: string, rel = 1e-6) => {
    if (id === undefined) return;
    const got = val(id);
    if (got !== undefined && !near(got, want, rel))
      out.push(`solidOfRevolution: ${what} is ${got}, not ${want}`);
  };
  check(rep.volume, V, 'the volume', 1e-4);
  const at = rep.at === undefined ? undefined : val(rep.at);
  if (at !== undefined) {
    if (at < a - 1e-9 || at > b + 1e-9)
      out.push(`solidOfRevolution: the slice x = ${at} is off [${a}, ${b}]`);
    check(rep.radius, Math.abs(f(at)), 'the slice radius f(at)');
    check(rep.inner, Math.abs(inner(at)), 'the inner radius g(at)');
    check(rep.height, f(at) - inner(at), 'the shell height');
  }
  return out;
}

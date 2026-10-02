/**
 * Picture checks for the college round 3 group C options (`typesHe3c.ts`): HC53 `polarGrid`
 * areas, regions, tangent and traced length; HC54 related rates and pumping work; HC66 series charts; HC67
 * the product rule's rectangle and a circle's area under the arc and tangent. What each draws must agree with the page's
 * values. Called from `repIssues` in `pictures.ts`. Test-only.
 */
import { CURVE_FIELDS, PATH_FIELDS } from '@/components/module/reps/polar';
import {
  pathLength,
  polarArea,
  polarTangent,
  regionArea,
} from '@/components/module/reps/polarHe3cMath';
import {
  circleTangent,
  productRate,
  quotientRate,
  underArc,
} from '@/components/module/reps/growCircleHe3cMath';
import {
  coneRise,
  coneSurface,
  pumpWork,
  rateGap,
  slabLift,
} from '@/components/module/reps/ratesHe3cMath';

import { termsModel } from '@/components/module/reps/termsModel';
import { isSeriesHe3c, sumHe3c } from '@/components/module/reps/termsSeriesHe3c';
import type { VariableDef } from '@/engine/types';

import type { NumOrVar } from '../typesGraphs';
import type { PolarGridSpec } from '../typesHsd';
import type { Representation } from '../types';

type Val = (x: string | number) => number | undefined;

/** Equal to a relative tolerance (or 10⁻⁶ near zero). */
const near = (a: number, b: number, tol = 1e-3) =>
  Math.abs(a - b) <= tol * Math.max(1e-6, Math.abs(a), Math.abs(b));

export function he3cIssues(
  rep: Representation,
  shown: Val,
  byId: Map<string, VariableDef>,
): string[] {
  const out: string[] = [];
  // Values in the formula's units (the shown value times its unit factor).
  const val: Val = (x) => {
    const v = shown(x);
    return v === undefined || typeof x === 'number' ? v : v * (byId.get(x)?.unitFactor ?? 1);
  };
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
  if (rep.kind === 'rightTriangle' && rep.rates) {
    // a² + b² = c² differentiated: a·a′ + b·b′ = c·c′ (a side with no rate is fixed).
    const [a, b, c] = [get(rep.a), get(rep.b), get(rep.c)];
    const r = (id: string | undefined) => (id === undefined ? 0 : get(id));
    const [da, db, dc] = [r(rep.rates.a), r(rep.rates.b), r(rep.rates.c)];
    if ([a, b, c, da, db, dc].every((x) => x !== undefined)) {
      const gap = rateGap(a!, b!, c!, da!, db!, dc!);
      const scale = Math.max(Math.abs(a! * da!), Math.abs(b! * db!), Math.abs(c! * dc!), 1e-9);
      if (Math.abs(gap) > 1e-3 * scale)
        out.push(`the rates don't satisfy a·a′ + b·b′ = c·c′ (off by ${gap})`);
    }
  }
  if (rep.kind === 'termsChart' && isSeriesHe3c(rep)) {
    // HC66: aₙ₊₁ and the ratio by the rule; the band holds the sum; a limit id is the sum.
    if (rep.alternate && rep.type === 'recursive')
      out.push('alternate is not for a recursive rule');
    if (rep.alternate && rep.type === 'geometric')
      out.push('alternate on a geometric series: use a negative ratio instead');
    // Only when the rule's values are all known (the picture draws nothing worked otherwise).
    const [a, d, n] = [get(rep.first), get(rep.step), get(rep.count)];
    const m = termsModel(rep, get);
    if (a !== undefined && d !== undefined && n !== undefined && !m.problem && m.count) {
      const next = m.terms[m.count];
      if (rep.next !== undefined || rep.ratio !== undefined) {
        if (next === undefined) out.push('aₙ₊₁ is not drawn');
        else {
          check(rep.next, rep.alternate ? Math.abs(next) : next, 'aₙ₊₁');
          const last = m.terms[m.count - 1]!;
          if (last !== 0) check(rep.ratio, next / last, 'the ratio aₙ₊₁ ÷ aₙ');
        }
      }
      const S = sumHe3c(rep, a, d);
      if (typeof rep.limit === 'string') {
        if (S === undefined) {
          if (get(rep.limit) !== undefined) out.push('a sum is given for a series that diverges');
        } else check(rep.limit, S, 'the sum S');
      }
      const [lo, hi] = [get(rep.bounds?.low), get(rep.bounds?.high)];
      if (lo !== undefined && hi !== undefined) {
        if (lo > hi + 1e-12) out.push(`the band runs backwards (${lo} to ${hi})`);
        const want = typeof rep.limit === 'string' ? (get(rep.limit) ?? S) : S;
        if (
          want !== undefined &&
          (want < lo - 1e-9 * Math.abs(want) || want > hi + 1e-9 * Math.abs(want))
        )
          out.push(`the sum ${want} is outside the band ${lo} to ${hi}`);
      }
    }
  }
  if (rep.kind === 'rectangle' && rep.grow) {
    // HC67: the strips add to the product's change to first order: (uv)′ = u′v + uv′.
    const [u, v, du, dv] = [get(rep.length), get(rep.width), get(rep.grow.du), get(rep.grow.dv)];
    if (u !== undefined && v !== undefined && du !== undefined && dv !== undefined) {
      check(rep.grow.product, productRate(u, v, du, dv), '(uv)′');
      const q = quotientRate(u, v, du, dv);
      if (q !== undefined) check(rep.grow.quotient, q, '(u/v)′');
      // Δt small: the corner is under a tenth of the strips together.
      const dt = get(rep.grow.dt);
      if (dt !== undefined && Math.abs(du * dv * dt) > 0.1 * (Math.abs(du * v) + Math.abs(u * dv)))
        out.push(`Δt = ${dt} is too long: the corner is not small beside the strips`);
    }
  }
  if (rep.kind === 'conicGraph' && rep.conic === 'circle') {
    // HC67: triangle + sector is the integral; the tangent is square to the radius.
    const [h, k, r] = [get(rep.h ?? 0), get(rep.k ?? 0), get(rep.r)];
    const b = get(rep.under?.to);
    if (rep.under && r !== undefined && b !== undefined) {
      if (b < 0 || b > Math.abs(r) * (1 + 1e-9)) out.push(`b = ${b} is outside 0 to r = ${r}`);
      else {
        const U = underArc(Math.abs(r), b);
        check(rep.under.triangle, U.triangle, 'the triangle');
        check(rep.under.sector, U.sector, 'the sector');
        check(rep.under.integral, U.integral, 'triangle + sector');
        check(rep.under.angle, (U.theta * 180) / Math.PI, 'θ');
      }
    }
    if (rep.tangent && !rep.point) out.push('tangent needs a point');
    const [x0, y0] = [get(rep.point?.x), get(rep.point?.y)];
    if (rep.tangent && rep.tangent !== true && h !== undefined && k !== undefined)
      if (x0 !== undefined && y0 !== undefined) {
        const t = circleTangent(h, k, x0, y0);
        if (t.slope === undefined) {
          if (get(rep.tangent.slope) !== undefined)
            out.push('the tangent is vertical but a slope is given');
        } else {
          check(rep.tangent.slope, t.slope, 'the tangent slope');
          check(rep.tangent.intercept, t.intercept!, 'the tangent intercept');
        }
      }
  }
  if (rep.kind === 'curvedSolid') {
    const [R, H] = [get(rep.radius), get(rep.height)];
    const f = rep.fill;
    if (f && rep.shape !== 'cone') out.push('fill is drawn on a cone');
    const h = get(f?.depth);
    if (f && R !== undefined && H !== undefined && h !== undefined) {
      if (h < 0 || h > H * (1 + 1e-9)) out.push(`depth ${h} is outside the tank (0 to ${H})`);
      const r = coneSurface(R, H, h);
      check(f.r, r, 'the surface radius');
      const q = get(f.inflow);
      if (q !== undefined && r > 0) check(f.rise, coneRise(q, r), 'dh/dt');
    }
    const sl = rep.slab;
    if (sl && rep.shape !== 'cylinder') out.push('slab is drawn in a cylinder');
    const [y, above] = [get(sl?.y), sl ? get(sl.above ?? 0) : undefined];
    if (sl && H !== undefined && y !== undefined && above !== undefined) {
      if (y < 0 || y > H * (1 + 1e-9)) out.push(`the slab at ${y} is outside the tank (0 to ${H})`);
      check(sl.lift, slabLift(H, above, y), 'the lift');
    }
    const [rho, g] = [get(sl?.density), get(sl?.g)];
    if (sl?.work && R !== undefined && H !== undefined && above !== undefined) {
      if (rho !== undefined && g !== undefined)
        check(sl.work, pumpWork(rho, g, R, H, above), 'the pumping work');
    }
  }
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

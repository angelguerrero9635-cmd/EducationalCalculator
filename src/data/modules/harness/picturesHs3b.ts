/**
 * Harness checks for the round 3 group B options (H106): the function graph in the unit menu's
 * units and the other math options. Called from each kind's case in `pictures.ts`. Test-only.
 */
import { transformCurve } from '@/components/module/reps/functionGraphHs3b';
import { curveOf, zerosIn } from '@/components/module/reps/functionGraphMath';
import { reshapeVars } from '@/components/module/reps/functionGraphHs2g';
import { toShownUnits } from '@/components/module/reps/functionGraphUnits';
import { quadAt, quadCrossings } from '@/components/module/reps/lineParabola';
import { turnedConic } from '@/components/module/reps/conicTurned';
import { polarConicParts } from '@/components/module/reps/polarConic';
import { riemannOf } from '@/components/module/reps/riemann';
import { ownCenter } from '@/components/module/reps/transformHs3b';
import { angle3, cross3, dot3, len3, sub3, type V3 } from '@/components/module/reps/vectorSpace';
import type { VariableDef } from '@/engine/types';

import type { Representation } from '../types';

type Val = (x: string | number) => number | undefined;

/** A value in the formula's units (the shown value times its unit factor). */
const formulaOf =
  (val: Val, byId: Map<string, VariableDef>): Val =>
  (x) => {
    const v = val(x);
    return v === undefined || typeof x === 'number' ? v : v * (byId.get(x)?.unitFactor ?? 1);
  };

/**
 * The values a kind's own checks read: for a function graph with `unitsOf`, the formula's units
 * (the curve, the traced point and the marked values all hold there); otherwise as shown.
 */
export function hs3bVal(rep: Representation, val: Val, byId: Map<string, VariableDef>): Val {
  return rep.kind === 'functionGraph' && rep.unitsOf ? formulaOf(val, byId) : val;
}

const near = (a: number, b: number) =>
  Math.abs(a - b) <= 1e-6 * Math.max(1, Math.abs(a), Math.abs(b));

/** `transform`: g is a·f(x − h) + k everywhere, its zeros are zeros, the image is worked out. */
function transformIssues(rep: Extract<Representation, { kind: 'functionGraph' }>, val: Val) {
  const out: string[] = [];
  const t = rep.transform;
  if (!t || rep.other) return out;
  const get = (v: string | number | undefined, d: number) => (v === undefined ? d : (val(v) ?? d));
  const [a, h, k] = [get(t.a, 1), get(t.h, 0), get(t.k, 0)];
  const f = curveOf(rep, (v) => val(v));
  const { curve: g } = transformCurve(rep, f, get, a, h, k, 'x', !reshapeVars(rep).length);
  for (const x of [-6.5, -2.25, -0.5, 0.75, 1.5, 3.25, 7.5]) {
    const [want, got] = [a * f.f(x - h) + k, g.f(x)];
    if (
      Number.isFinite(want) !== Number.isFinite(got) ||
      (Number.isFinite(want) && !near(want, got))
    )
      out.push(`transform: g(${x}) = ${got}, but a·f(x − h) + k = ${want}`);
  }
  for (const z of zerosIn(g, -30, 30))
    if (!(Math.abs(g.f(z.x)) <= 1e-6 * Math.max(1, Math.abs(z.x))))
      out.push(`transform: g's zero ${z.x} gives ${g.f(z.x)}`);
  const x0 = t.from !== undefined ? get(t.from, 0) : (f.key?.x ?? 0);
  const [ix, iy] = [t.image?.x && val(t.image.x), t.image?.y && val(t.image.y)];
  if (typeof ix === 'number' && !near(ix, x0 + h)) out.push(`image x ${ix} is not ${x0 + h}`);
  if (typeof iy === 'number' && !near(iy, a * f.f(x0) + k))
    out.push(`image y ${iy} is not a·f(${x0}) + k = ${a * f.f(x0) + k}`);
  return out;
}

/** A transformation's own center (`about: 'center'`): the corners' average, or unknown. */
export function hs3bCenter(
  rep: Extract<Representation, { kind: 'transformation' }>,
  val: Val,
): [number | undefined, number | undefined] {
  const ps = rep.figure.map(([x, y]) => [val(x), val(y)]);
  if (ps.some((p) => p[0] === undefined || p[1] === undefined)) return [undefined, undefined];
  const c = ownCenter(ps as [number, number][]);
  return [c[0], c[1]];
}

/** `space`: three components each; u × v, the areas, u · v, θ, the box, PQ and M worked out. */
function spaceIssues(rep: Extract<Representation, { kind: 'vectorDiagram' }>, val: Val) {
  const out: string[] = [];
  const s = rep.space;
  if (!s) return out;
  if (rep.vectors.some((v) => v.z === undefined || v.x === undefined || v.y === undefined))
    out.push('space: every vector needs x, y and z');
  const vec = (v: { x?: string | number; y?: string | number; z?: string | number }) => {
    const p = [v.x ?? 0, v.y ?? 0, v.z ?? 0].map((x) => val(x));
    return p.every((x) => x !== undefined) ? (p as V3) : undefined;
  };
  const [u, v] = rep.vectors.map(vec);
  const w = s.w ? vec(s.w) : undefined;
  const check = (id: string | undefined, want: number, what: string) => {
    const got = id === undefined ? undefined : val(id);
    if (got !== undefined && !near(got, want)) out.push(`space: ${what} is ${got}, not ${want}`);
  };
  if (s.points) {
    if (!u || !v) return out;
    check(s.distance, len3(sub3(v, u)), 'PQ');
    (['x', 'y', 'z'] as const).forEach((k, i) =>
      check(s.mid?.[k], (u[i]! + v[i]!) / 2, `the midpoint's ${k}`),
    );
    return out;
  }
  if (!u || !v) return out;
  const n = cross3(u, v);
  (['x', 'y', 'z'] as const).forEach((k, i) => check(s.cross?.[k], n[i]!, `u × v's ${k}`));
  check(s.area, len3(n), 'the area |u × v|');
  check(s.triangle, len3(n) / 2, 'the triangle |u × v| ÷ 2');
  check(s.dot, dot3(u, v), 'u · v');
  const th = angle3(u, v);
  if (th !== undefined) check(s.angle, th, 'the angle');
  if (w) {
    const T = dot3(u, cross3(v, w));
    check(s.triple, T, 'u · (v × w)');
    check(s.volume, Math.abs(T), 'the volume');
  }
  return out;
}

export function hs3bIssues(
  rep: Representation,
  val: Val,
  byId: Map<string, VariableDef>,
): string[] {
  const out: string[] = [];
  const formula = formulaOf(val, byId);
  const off = (x: number, y: number) => Math.abs(x - y) > 1e-6 * Math.max(1, Math.abs(y));
  switch (rep.kind) {
    case 'rectangle': {
      // Bounds: e not negative and under each side; the least and greatest areas.
      const b = rep.bounds;
      if (!b) break;
      const [l, w, e] = [formula(rep.length), formula(rep.width), formula(b.error)];
      if (l === undefined || w === undefined || e === undefined) break;
      if (e < 0 || e >= Math.min(l, w)) out.push(`error ${e} for sides ${l} and ${w}`);
      const [lo, hi] = [b.least && formula(b.least), b.greatest && formula(b.greatest)];
      if (typeof lo === 'number' && off(lo, (l - e) * (w - e)))
        out.push(`least area ${lo} is not (l − e)(w − e) = ${(l - e) * (w - e)}`);
      if (typeof hi === 'number' && off(hi, (l + e) * (w + e)))
        out.push(`greatest area ${hi} is not (l + e)(w + e) = ${(l + e) * (w + e)}`);
      break;
    }
    case 'circle': {
      // Population: not negative, and D = N ÷ A in the formula's units.
      const pop = rep.population;
      if (!pop) break;
      const N = formula(pop.people);
      if (N !== undefined && N < 0) out.push(`population ${N} is negative`);
      const [A, D] = [
        rep.area ? formula(rep.area) : undefined,
        pop.density && formula(pop.density),
      ];
      if (N !== undefined && A !== undefined && typeof D === 'number' && off(D * A, N))
        out.push(`density ${D} × area ${A} is not the population ${N}`);
      break;
    }
    case 'table': {
      // The graph needs rows to span: at least 3 distinct swept values (the rows function
      // reads the values as shown with `rowsFrom`).
      if ('twoWay' in rep || !(rep.graph || rep.rowsFrom)) break;
      const values = Object.fromEntries(
        [...rep.params, rep.sweep].flatMap((id) => {
          const x = rep.rowsFrom === 'shown' ? val(id) : formula(id);
          return x === undefined ? [] : [[id, x]];
        }),
      );
      const rows = typeof rep.rows === 'function' ? rep.rows(values) : rep.rows;
      if (new Set(rows).size < 3) out.push(`a table graph with ${new Set(rows).size} rows`);
      if (rows.some((x) => !Number.isFinite(x))) out.push('a table row is not a number');
      break;
    }
    case 'venn': {
      // One event: B and "both" are not drawn, so they are 0.
      if (!('chances' in rep) || !rep.chances.one) break;
      const [b, both] = [val(rep.chances.b), val(rep.chances.both)];
      if (b !== 0 || both !== 0) out.push(`a one-event Venn with P(B) ${b} and P(both) ${both}`);
      break;
    }
    case 'polygon': {
      // The apothem, the half angle and ½aP, in the formula's units.
      if (!rep.apothem || !rep.sides) break;
      const n = val(rep.sides);
      if (n !== undefined && (n < 3 || n > 12 || !Number.isInteger(n)))
        out.push(`apothem polygon with ${n} sides (3 to 12)`);
      if (n === undefined) break;
      const s = rep.side ? formula(rep.side) : undefined;
      const a = formula(rep.apothem);
      if (s !== undefined && a !== undefined && off(a, s / (2 * Math.tan(Math.PI / n))))
        out.push(`apothem ${a} is not s ÷ (2 tan(180°/${n})) = ${s / (2 * Math.tan(Math.PI / n))}`);
      const t = rep.angle ? val(rep.angle) : undefined;
      if (t !== undefined && off(t, 180 / n)) out.push(`angle ${t} is not 180° ÷ ${n}`);
      const P = rep.around ? formula(rep.around) : undefined;
      const K = rep.area ? formula(rep.area) : undefined;
      if (a !== undefined && P !== undefined && K !== undefined && off(K, (a * P) / 2))
        out.push(`area ${K} is not ½ × ${a} × ${P}`);
      break;
    }
    case 'lineSystem': {
      // The parabola and the line: each worked-out crossing is on both, in order, and they
      // are the crossings there are.
      const qs = rep.lines.map((l) => ({
        a: l.square === undefined ? 0 : val(l.square),
        m: val(l.slope),
        b: val(l.intercept),
      }));
      if (qs.some((q) => q.a === undefined || q.m === undefined || q.b === undefined)) break;
      const [p, q] = qs as { a: number; m: number; b: number }[];
      const found = quadCrossings(p!, q!);
      const sols = [...(rep.solutions ?? []), ...(rep.solution ? [rep.solution] : [])]
        .map((s) => ({ x: val(s.x), y: val(s.y) }))
        .filter((s): s is { x: number; y: number } => s.x !== undefined && s.y !== undefined);
      for (const s of sols) {
        const tol = 1e-6 * Math.max(1, Math.abs(s.y));
        if (Math.abs(quadAt(p!, s.x) - s.y) > tol || Math.abs(quadAt(q!, s.x) - s.y) > tol)
          out.push(`solution (${s.x}, ${s.y}) is not on both curves`);
      }
      if (found !== 'same' && sols.length > found.length)
        out.push(`${sols.length} solutions given, but the curves cross ${found.length} times`);
      for (let i = 1; i < sols.length; i++)
        if (rep.solutions && sols[i]!.x < sols[i - 1]!.x) out.push('solutions not left to right');
      break;
    }
    case 'vectorDiagram':
      out.push(...spaceIssues(rep, val));
      break;
    case 'conicGraph': {
      // A turned conic: θ, A′, C′ and B² − 4AC as the picture works them out.
      if (rep.conic !== 'turned') break;
      const [A, B, C] = [val(rep.A), val(rep.B), val(rep.C)];
      if (A === undefined || B === undefined || C === undefined) break;
      const t = turnedConic(A, B, C, rep.F === undefined ? -1 : (val(rep.F) ?? -1));
      const chk = (id: string | undefined, want: number, what: string) => {
        const got = id === undefined ? undefined : val(id);
        if (got !== undefined && Math.abs(got - want) > 1e-6 * Math.max(1, Math.abs(want)))
          out.push(`turned conic: ${what} ${got} is not ${want}`);
      };
      chk(rep.angle, t.theta, 'θ');
      chk(rep.turned?.A, t.A1, 'A′');
      chk(rep.turned?.C, t.C1, 'C′');
      chk(rep.discriminant, t.D, 'B² − 4AC');
      break;
    }
    case 'polarGrid': {
      // A polar conic: e = |n| ÷ m and d = k ÷ |n|, as the picture draws them.
      const cv = rep.curve;
      if (cv?.shape !== 'conic') break;
      const [k, m, n] = [val(cv.k), cv.m === undefined ? 1 : val(cv.m), val(cv.n)];
      if (k === undefined || m === undefined || n === undefined) break;
      if (!(m > 0)) out.push(`polar conic: m = ${m} (must be above 0)`);
      const p = polarConicParts(cv, { k, m, n });
      const [e, d] = [cv.e && val(cv.e), cv.d && val(cv.d)];
      if (typeof e === 'number' && off(e, p.e)) out.push(`polar conic: e ${e} is not ${p.e}`);
      if (typeof d === 'number' && p.d !== undefined && off(d, p.d))
        out.push(`polar conic: d ${d} is not ${p.d}`);
      break;
    }
    case 'functionGraph': {
      out.push(...transformIssues(rep, val));
      // The power family and the log sum draw only from values they can take.
      for (const f of [rep, ...(rep.other ? [rep.other] : [])]) {
        const g = (v: string | number | undefined, d: number) =>
          v === undefined ? d : (val(v) ?? d);
        if (f.family === 'power') {
          const [p, q] = [g(f.p, 1), g(f.q, 1)];
          if (!Number.isInteger(p) || p === 0) out.push(`power p = ${p} (a whole number, not 0)`);
          if (!Number.isInteger(q) || q < 1 || q > 12) out.push(`power q = ${q} (1 to 12)`);
        }
        if (f.family === 'logSum' && f.b !== undefined) {
          const b = g(f.b, 10);
          if (!(b > 0) || b === 1) out.push(`log base ${b} (positive, not 1)`);
        }
      }
      if (rep.riemann) {
        // The rectangles: a whole n of at least 1, and their sum is the page's S.
        const g = (v: string | number | undefined, d: number) =>
          v === undefined ? d : (val(v) ?? d);
        const n = rep.riemann.n === undefined ? undefined : val(rep.riemann.n);
        if (n !== undefined && (!Number.isInteger(n) || n < 1)) out.push(`riemann n = ${n}`);
        const S = rep.riemann.sum === undefined ? undefined : val(rep.riemann.sum);
        const f = curveOf(rep, (v) => val(v));
        const want = riemannOf(rep.riemann, f.f, g).sum;
        if (S !== undefined && Number.isFinite(want) && off(S, want))
          out.push(`riemann sum ${S} is not the rectangles' ${want}`);
      }
      if (rep.reject !== undefined) {
        const r = val(rep.reject);
        if (r !== undefined && Number.isFinite(curveOf(rep, (v) => val(v)).f(r)))
          out.push(`rejected x = ${r} is inside the domain`);
      }
      if (!rep.unitsOf) break;
      // The curve drawn in the shown units is the formula's curve converted: Y = f(fₓX) ÷ f_y.
      const { x: ix, y: iy } = rep.unitsOf;
      for (const id of [ix, iy])
        if (id !== undefined && !byId.has(id)) out.push(`unitsOf names no value ${id}`);
      const fx = (ix && byId.get(ix)?.unitFactor) || 1;
      const fy = (iy && byId.get(iy)?.unitFactor) || 1;
      const num = (v: string | number | undefined, d: number) =>
        v === undefined ? d : (formula(v) ?? d);
      let conv;
      try {
        conv = toShownUnits(rep, num, fx, fy);
      } catch (e) {
        out.push(`unitsOf: ${String(e)}`);
        break;
      }
      const shownVal = (v: string | number) =>
        typeof v === 'number' ? v : conv.value.has(v) ? conv.value.get(v) : val(v);
      const base = curveOf(rep, (v) => formula(v));
      const drawn = curveOf(conv.spec, shownVal);
      for (const X of [-7.3, -2.1, -0.4, 0.35, 1.7, 4.2, 9.6, 23.5]) {
        const want = base.f(fx * X) / fy;
        const got = drawn.f(X);
        if (Number.isFinite(want) !== Number.isFinite(got)) {
          out.push(`unitsOf: at ${X} the drawn curve is ${got}, the formula's ${want}`);
          continue;
        }
        if (Number.isFinite(want) && Math.abs(want - got) > 1e-6 * Math.max(1, Math.abs(want)))
          out.push(`unitsOf: at ${X} the drawn curve is ${got}, the formula's ${want}`);
      }
      break;
    }
  }
  return out;
}

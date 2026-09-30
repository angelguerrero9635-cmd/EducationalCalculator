/**
 * Picture check for `functionGraph` (H01): every feature the graph marks satisfies the formula it
 * draws, to 1e-6 (zeros, the vertex, the intercept, extrema, holes, asymptotes, piece ends, the
 * crossing of two curves), and every value the module works out that the picture shows (the
 * traced point, the vertex, the zeros, a secant slope) is the graph's own. Called from
 * `repIssues` in `pictures.ts`. Test-only.
 */
import {
  crossings,
  curveOf,
  extremaIn,
  zerosIn,
  type Curve,
} from '@/components/module/reps/functionGraphMath';

import {
  familyVars,
  type FunctionFamily,
  type FunctionGraphSpec,
  type NumOrVar,
} from '../typesFunctionGraph';

const TOL = 1e-6;
const close = (a: number, b: number, scale = 1) =>
  Math.abs(a - b) <= TOL * Math.max(1, scale, Math.abs(a), Math.abs(b));

/** Values a family can't draw (a base of 1, a flat parabola, pieces out of order). */
function familyIssues(f: FunctionFamily, val: (v: NumOrVar) => number | undefined, out: string[]) {
  const v = (x: NumOrVar | undefined, d: number) => (x === undefined ? d : (val(x) ?? d));
  switch (f.family) {
    case 'exponential':
    case 'log': {
      const b = 'b' in f ? v(f.b, 2) : Math.E;
      if (!(b > 0) || b === 1) out.push(`base ${b} (a base is positive and not 1)`);
      if (v(f.a, 1) === 0) out.push('stretch a = 0 flattens the curve');
      break;
    }
    case 'logistic':
      if (!(v(f.start, 1) > 0) || !(v(f.K, 1) > 0))
        out.push('a logistic start and limit are positive');
      break;
    case 'polynomial':
      if ('coefficients' in f && v(f.coefficients[0], 1) === 0) out.push('leading coefficient 0');
      // H105: a multiplicity from a value is a whole number 1 to 9.
      if ('zeros' in f)
        for (const z of f.zeros) {
          const t = v(z.times, 1);
          if (!Number.isInteger(t) || t < 1 || t > 9) out.push(`multiplicity ${t} (1 to 9)`);
        }
      break;
    case 'piecewise': {
      let prev = -Infinity;
      for (const p of f.pieces) {
        const lo = p.from === undefined ? -Infinity : v(p.from, 0);
        const hi = p.to === undefined ? Infinity : v(p.to, 0);
        if (lo > hi) out.push(`piece from ${lo} to ${hi} is backwards`);
        if (lo < prev) out.push(`pieces overlap at ${lo}`);
        prev = hi;
        familyIssues(p.f, val, out);
      }
      break;
    }
    case 'sin':
    case 'cos':
    case 'tan':
      if (v(f.b, 1) === 0) out.push('frequency b = 0');
      break;
  }
}

/** Every feature of a curve in [lo, hi] satisfies its formula. */
function featureIssues(c: Curve, lo: number, hi: number, out: string[], what = 'f') {
  const d = (x: number) => (c.f(x + 1e-6) - c.f(x - 1e-6)) / 2e-6;
  // (a root's start, √(x − h) at h, has no slope on its left: scale 1 there)
  const scale = (x: number) => (Number.isFinite(d(x)) ? Math.max(1, Math.abs(d(x))) : 1);
  for (const z of zerosIn(c, lo, hi))
    if (!(Math.abs(c.f(z.x)) <= TOL * scale(z.x)))
      out.push(`${what}: zero at ${z.x} gives ${c.f(z.x)}`);
  if (c.key && c.key.what !== 'center') {
    if (!close(c.f(c.key.x), c.key.y))
      out.push(
        `${what}: marked ${c.key.what} (${c.key.x}, ${c.key.y}) is off the curve (${c.f(c.key.x)})`,
      );
  }
  if (c.key?.what === 'vertex') {
    const e = 1e-3;
    const [l, r] = [c.f(c.key.x - e) - c.key.y, c.f(c.key.x + e) - c.key.y];
    if (!(l * r > 0)) out.push(`${what}: vertex (${c.key.x}, ${c.key.y}) is not a turning point`);
  }
  for (const e of extremaIn(c, lo, hi)) {
    const s = 1e-4;
    const [l, r] = [c.f(e.x - s) - e.y, c.f(e.x + s) - e.y];
    if (!close(c.f(e.x), e.y) || !(l * r >= 0))
      out.push(`${what}: extremum (${e.x}, ${e.y}) is not one`);
  }
  for (const h of c.holes) {
    if (Number.isFinite(c.f(h.x))) out.push(`${what}: hole at ${h.x} has a value`);
    const [l, r] = [c.f(h.x - 1e-7), c.f(h.x + 1e-7)];
    if (!close(l, h.y, 1e3) || !close(r, h.y, 1e3))
      out.push(`${what}: hole (${h.x}, ${h.y}) is not where the curve goes (${l}, ${r})`);
  }
  for (const v of c.vas(lo, hi)) {
    // On each side where the curve is, |f| grows without stopping as x closes in on v.
    const sides = ([-1, 1] as const).filter((sd) => Number.isFinite(c.f(v + sd * 1e-2)));
    const grows = sides.every((sd) => {
      const ys = [1e-2, 1e-5, 1e-8, 1e-11].map((e) =>
        Math.abs(c.f(v + sd * e * Math.max(1, Math.abs(v)))),
      );
      return ys.every((y, i) => i === 0 || y > ys[i - 1]!) && ys[3]! > 3 * ys[0]!;
    });
    if (!sides.length || !grows) out.push(`${what}: asymptote x = ${v} doesn't blow up`);
  }
  for (const a of c.has) {
    const ends = [c.f(-1e7), c.f(1e7), c.f(-60), c.f(60)].filter(Number.isFinite);
    if (!ends.some((y) => Math.abs(y - a) < 1e-3 * Math.max(1, Math.abs(a))))
      out.push(`${what}: horizontal asymptote y = ${a} isn't approached`);
  }
  if (c.slant) {
    const x = 1e5;
    if (Math.abs(c.f(x) - (c.slant.m * x + c.slant.b)) > 1e-3)
      out.push(`${what}: slant asymptote is off`);
  }
  for (const e of c.ends) {
    const side = [c.side(e.x, -1), c.side(e.x, 1)];
    if (!side.some((y) => close(y, e.y)))
      out.push(`${what}: piece end (${e.x}, ${e.y}) is off its piece`);
    if (e.closed && !close(c.f(e.x), e.y))
      out.push(`${what}: closed end (${e.x}, ${e.y}) is not f(${e.x}) = ${c.f(e.x)}`);
  }
}

export function functionGraphIssues(
  rep: FunctionGraphSpec,
  val: (x: string | number) => number | undefined,
): string[] {
  const out: string[] = [];
  const ids = [...familyVars(rep), ...(rep.other ? familyVars(rep.other) : [])];
  if (ids.some((id) => val(id) === undefined)) return out;
  familyIssues(rep, val, out);
  if (rep.other) familyIssues(rep.other, val, out);
  if (out.length) return out;
  const c = curveOf(rep, val);
  const lo = rep.window?.x?.[0] ?? -30;
  const hi = rep.window?.x?.[1] ?? 30;
  featureIssues(c, lo, hi, out);
  const num = (id: string | undefined) => (id === undefined ? undefined : val(id));
  // The traced point is on the curve.
  const [ax, ay] = [num(rep.at?.x), num(rep.at?.y)];
  if (ax !== undefined && ay !== undefined) {
    const y = c.f(ax);
    if (!Number.isFinite(y)) out.push(`traced x = ${ax} is outside the domain but y = ${ay}`);
    else {
      // The solver finds x to about 1e-9 of its size: on a steep curve that moves y too.
      const slope = Math.abs((c.f(ax + 1e-6) - c.f(ax - 1e-6)) / 2e-6);
      const slack = Number.isFinite(slope) ? slope * 1e-9 * Math.max(1, Math.abs(ax)) : 0;
      if (Math.abs(y - ay) > TOL * Math.max(1, Math.abs(y), Math.abs(ay)) + slack)
        out.push(`traced point (${ax}, ${ay}) is off the curve (${y})`);
    }
  }
  // Values the module works out that the picture marks.
  const s = rep.shows;
  const [vx, vy] = [num(s?.vertex?.x), num(s?.vertex?.y)];
  if (vx !== undefined && (!c.key || !close(c.key.x, vx)))
    out.push(`vertex x ${vx} is not the graph's (${c.key?.x})`);
  if (vy !== undefined && (!c.key || !close(c.key.y, vy)))
    out.push(`vertex y ${vy} is not the graph's (${c.key?.y})`);
  for (const id of s?.zeros ?? []) {
    const z = val(id);
    if (z !== undefined && !(Math.abs(c.f(z)) <= 1e-4))
      out.push(`zero ${id} = ${z} gives f = ${c.f(z)}`);
  }
  const yi = num(s?.intercept);
  if (yi !== undefined && !close(c.f(0), yi)) out.push(`intercept ${yi} is not f(0) = ${c.f(0)}`);
  const va = num(s?.va);
  if (va !== undefined && !c.vas(va - 1e-6, va + 1e-6).length)
    out.push(`x = ${va} is not a vertical asymptote`);
  const ha = num(s?.ha);
  if (ha !== undefined && !c.has.some((a) => close(a, ha)))
    out.push(`y = ${ha} is not a horizontal asymptote`);
  const per = num(s?.period);
  if (per !== undefined && (c.period === undefined || !close(per, c.period)))
    out.push(`period ${per} is not the graph's (${c.period})`);
  const amp = num(s?.amplitude);
  if (amp !== undefined && (c.amplitude === undefined || !close(amp, c.amplitude)))
    out.push(`amplitude ${amp} is not the graph's (${c.amplitude})`);
  // A second curve and where they cross.
  if (rep.other) {
    const g = curveOf(rep.other, val);
    featureIssues(g, lo, hi, out, 'g');
    for (const p of crossings(c, g, lo, hi))
      if (!(Math.abs(c.f(p.x) - g.f(p.x)) <= TOL * Math.max(1, Math.abs(p.y))))
        out.push(`crossing at ${p.x} is not f = g`);
    const [cx, cy] = [num(rep.crossing?.x), num(rep.crossing?.y)];
    if (cx !== undefined && !(Math.abs(c.f(cx) - g.f(cx)) <= 1e-4 * Math.max(1, Math.abs(c.f(cx)))))
      out.push(`crossing x = ${cx} gives f = ${c.f(cx)}, g = ${g.f(cx)}`);
    if (cx !== undefined && cy !== undefined && !close(c.f(cx), cy))
      out.push(`crossing y ${cy} is not f(${cx})`);
  }
  // The secant's slope.
  if (rep.secant) {
    const [x, h, m] = [val(rep.secant.x), val(rep.secant.h), num(rep.secant.slope)];
    if (x !== undefined && h !== undefined && m !== undefined && h !== 0) {
      const want = (c.f(x + h) - c.f(x)) / h;
      if (!close(want, m)) out.push(`secant slope ${m} is not (f(x + h) − f(x)) ÷ h = ${want}`);
    }
  }
  if (rep.limit) {
    const x = val(rep.limit.x);
    if (x !== undefined && [c.side(x, -1), c.side(x, 1)].some((y) => Number.isNaN(y)))
      out.push(`limit at ${x}: no curve there`);
  }
  return out;
}

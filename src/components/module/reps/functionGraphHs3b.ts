/**
 * H106 (round 3, group B): `functionGraph`'s second curve from the first, g(x) = a·f(x − h) + k.
 * Pure, so the picture and the harness draw and check the same curve.
 */
import type { FunctionFamily, NumOrVar } from '@/data/modules/typesFunctionGraph';

import {
  buildCurve,
  fracText,
  numText,
  type Curve,
  type Get,
  type Interval,
} from './functionGraphMath';

const MINUS = '−';

/** g's family as numbers, when f's family takes a, h and k (or is a line or a parabola). */
export function transformedFamily(
  f: FunctionFamily,
  get: Get,
  a: number,
  h: number,
  k: number,
): FunctionFamily | undefined {
  const n = (v: NumOrVar | undefined, d: number) => get(v, d);
  switch (f.family) {
    case 'linear': {
      const [m, b] = [n(f.m, 1), n(f.b, 0)];
      return { family: 'linear', m: a * m, b: a * (b - m * h) + k };
    }
    case 'quadratic': {
      if (f.form === 'standard') {
        // a(A(x − h)² + B(x − h) + C) + k, multiplied out.
        const [A, B, C] = [n(f.a, 1), n(f.b, 0), n(f.c, 0)];
        return {
          family: 'quadratic',
          form: 'standard',
          a: a * A,
          b: a * (B - 2 * A * h),
          c: a * (A * h * h - B * h + C) + k,
        };
      }
      if (f.form === 'factored') {
        if (k !== 0) return undefined;
        return { ...f, a: a * n(f.a, 1), p: n(f.p, 0) + h, q: n(f.q, 0) + h };
      }
      return { ...f, a: a * n(f.a, 1), h: n(f.h, 0) + h, k: a * n(f.k, 0) + k };
    }
    case 'absolute':
    case 'root':
    case 'log':
    case 'sin':
    case 'cos':
    case 'tan':
      return {
        ...f,
        ...('b' in f && f.b !== undefined ? { b: n(f.b, 1) } : {}),
        a: a * n(f.a, 1),
        h: n(f.h, 0) + h,
        k: a * n(f.k, 0) + k,
      } as FunctionFamily;
    case 'exponential':
      return 'b' in f
        ? { ...f, b: n(f.b, 2), a: a * n(f.a, 1), h: n(f.h, 0) + h, k: a * n(f.k, 0) + k }
        : { ...f, r: n(f.r, 1), a: a * n(f.a, 1), h: n(f.h, 0) + h, k: a * n(f.k, 0) + k };
    default:
      return undefined;
  }
}

/** Any curve moved: g(x) = a·c(x − h) + k (numeric features; the text is given). */
function moved(c: Curve, a: number, h: number, k: number): Curve {
  const y = (v: number) => a * v + k;
  const shift = (xs: number[]) => xs.map((x) => x + h);
  const mapIv = (i: Interval): Interval => ({ ...i, lo: i.lo + h, hi: i.hi + h });
  return {
    ...c,
    f: (x) => y(c.f(x - h)),
    side: (x, s) => y(c.side(x - h, s)),
    vas: (lo, hi) => shift(c.vas(lo - h, hi - h)),
    breaks: (lo, hi) => shift(c.breaks(lo - h, hi - h)),
    has: c.has.map(y),
    slant: c.slant ? { m: a * c.slant.m, b: a * (c.slant.b - c.slant.m * h) + k } : undefined,
    holes: c.holes.map((p) => ({ x: p.x + h, y: y(p.y) })),
    ends: c.ends.map((p) => ({ ...p, x: p.x + h, y: y(p.y) })),
    key: c.key ? { ...c.key, x: c.key.x + h, y: y(c.key.y) } : undefined,
    zeros:
      a !== 0 && k === 0 && c.zeros
        ? (lo, hi) => c.zeros!(lo - h, hi - h).map((z) => ({ x: z.x + h, text: fracText(z.x + h) }))
        : undefined,
    domain: c.domain.map(mapIv),
    range: undefined,
    handles: [],
    inverse: undefined,
    parent: undefined,
    amplitude: c.amplitude === undefined ? undefined : Math.abs(a) * c.amplitude,
    midline: c.midline === undefined ? undefined : y(c.midline),
    inflection: c.inflection ? { x: c.inflection.x + h, y: y(c.inflection.y) } : undefined,
  };
}

/** "2f(x − 3) + 1", "f(x + 2)", "−f(x)": g written from f. */
export function transformText(
  fName: string,
  x: string,
  a: string,
  h: number,
  hs: string,
  k: number,
  ks: string,
): string {
  const lead = a === '1' ? '' : a === '−1' ? MINUS : a.includes('/') ? `(${a})` : a;
  const inner =
    hs === '?' ? `${x} − ?` : h === 0 ? x : `${x} ${h > 0 ? '−' : '+'} ${hs.replace(/^−/, '')}`;
  const tail = ks === '?' ? ' + ?' : k === 0 ? '' : ` ${k > 0 ? '+' : '−'} ${ks.replace(/^−/, '')}`;
  return `${lead}${fName}(${inner})${tail}`;
}

/**
 * g's curve: from g's own family when there is one (its formula written), else f moved (always,
 * when `ownFamily` is false: f is reshaped).
 */
export function transformCurve(
  f: FunctionFamily,
  main: Curve,
  get: Get,
  a: number,
  h: number,
  k: number,
  x: string,
  ownFamily = true,
): { curve: Curve; own: boolean } {
  const fam = ownFamily ? transformedFamily(f, get, a, h, k) : undefined;
  if (fam && a !== 0) {
    const g: Get = (v, d) => (v === undefined ? d : typeof v === 'number' ? v : get(v, d));
    const curve = buildCurve(fam, g, (v, d) => numText(g(v, d)), x);
    return { curve: { ...curve, handles: [], parent: undefined, inverse: undefined }, own: true };
  }
  return { curve: moved(main, a, h, k), own: false };
}

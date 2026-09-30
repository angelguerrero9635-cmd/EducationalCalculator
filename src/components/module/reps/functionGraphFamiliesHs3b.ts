/**
 * H106 (round 3, group B): the power family y = a·(x − h)^(p/q) + k and the log sum
 * y = log_b(x) + log_b(x + c), built as `buildCurve` builds the others (it hands these two here).
 */
import type { FamilyHs3b } from '@/data/modules/typesHs3b';

import {
  fracText,
  lead,
  plusText,
  shiftText,
  type Curve,
  type Get,
  type HandleDef,
  type Interval,
  type Pt,
  type Tok,
} from './functionGraphMath';

type SayField = Parameters<typeof import('./functionGraphMath').buildCurve>[2];

const gcd = (a: number, b: number): number => (b === 0 ? Math.abs(a) : gcd(b, a % b));

/** p/q in lowest terms with q > 0 (whole numbers; q at least 1). */
export function powerOf(p: number, q: number): { p: number; q: number } {
  const [P, Q] = [Math.round(p), Math.max(1, Math.round(q))];
  const g = gcd(P, Q) || 1;
  return { p: P / g, q: Q / g };
}

/** u^(p/q), real: an odd q takes the real root of a negative u. */
export function realPower(u: number, p: number, q: number): number {
  if (u === 0) return p > 0 ? 0 : NaN;
  if (u < 0) {
    if (q % 2 === 0) return NaN;
    const r = -((-u) ** (1 / q));
    return r ** p;
  }
  return u ** (p / q);
}

const iv = (lo: number, hi: number, loIn: boolean, hiIn: boolean): Interval => ({
  lo,
  hi,
  loIn,
  hiIn,
});
const ALL = iv(-Infinity, Infinity, false, false);

export function buildHs3b(fam: FamilyHs3b, get: Get, say: SayField, x: string): Curve {
  const base = { has: [] as number[], holes: [] as Pt[], ends: [] as (Pt & { closed: boolean })[] };
  if (fam.family === 'power') {
    const [a, h, k] = [get(fam.a, 1), get(fam.h, 0), get(fam.k, 0)];
    const { p, q } = powerOf(get(fam.p, 1), get(fam.q, 1));
    const f = (t: number) => a * realPower(t - h, p, q) + k;
    const even = q % 2 === 0;
    const neg = p < 0;
    const at = (lo: number, hi: number) => (neg && h >= lo && h <= hi ? [h] : []);
    const exp = q === 1 ? String(p) : `${p}/${q}`.replace('-', '−');
    const coef = lead(a, say(fam.a, 1));
    const pSaid = say(fam.p, 1);
    const qSaid = say(fam.q, 1);
    const expText =
      pSaid === '?' || qSaid === '?'
        ? q === 1 && fam.q === undefined
          ? pSaid
          : `${pSaid}/${qSaid}`
        : exp;
    const inner = shiftText(x, h, say(fam.h, 0));
    const text: Tok[] = [
      { t: `${coef}${inner === x ? x : `(${inner})`}` },
      { t: expText, sup: true },
      { t: plusText(k, say(fam.k, 0)) },
    ];
    // The zeros: (x − h)^(p/q) = −k/a, both roots when p is even (±), none past the domain.
    const zeros = () => {
      if (a === 0) return [];
      const w = -k / a;
      const out: number[] = [];
      if (w === 0) return p > 0 ? [{ x: h, text: fracText(h) }] : [];
      // u = w^(q/p) over the reals, then its opposite when p is even.
      const u = realPower(w, q, p);
      if (Number.isFinite(u)) out.push(h + u);
      if (p % 2 === 0 && Number.isFinite(u) && u !== 0 && !even) out.push(h - u);
      return out
        .filter((z) => Math.abs(f(z)) < 1e-9 * Math.max(1, Math.abs(k)))
        .sort((m, n) => m - n)
        .map((z) => ({ x: z, text: fracText(z) }));
    };
    const handles: HandleDef[] = neg
      ? []
      : [
          {
            name: even ? 'the start' : 'the center',
            x: h,
            y: k,
            axis: 'xy',
            sets: ['h', 'k'],
            to: (X, Y) => ({ h: X, k: Y }),
          },
          {
            name: 'the stretch',
            x: h + 1,
            y: a + k,
            axis: 'y',
            sets: ['a'],
            to: (_, Y) => ({ a: Y - k }),
          },
        ];
    return {
      ...base,
      family: 'power',
      f,
      side: (c, s) => {
        const v = f(c);
        return Number.isFinite(v) ? v : f(c + s * 1e-9);
      },
      vas: at,
      has: neg ? [k] : [],
      breaks: at,
      key: neg ? undefined : { x: h, y: k, what: even ? 'start' : 'center' },
      zeros: (lo, hi) => zeros().filter((z) => z.x >= lo && z.x <= hi),
      domain: even
        ? [iv(h, Infinity, !neg, false)]
        : neg
          ? [iv(-Infinity, h, false, false), iv(h, Infinity, false, false)]
          : [ALL],
      text,
      parent: { family: 'power', p, q },
      handles,
    };
  }
  // logSum: log_b(x) + log_b(x + c).
  const natural = fam.b === undefined;
  const b = natural ? Math.E : get(fam.b, 10);
  const c = get(fam.c, 0);
  const start = Math.max(0, -c);
  const lnB = Math.log(b);
  const f = (t: number) => (t > start ? (Math.log(t) + Math.log(t + c)) / lnB : NaN);
  const zero = (-c + Math.sqrt(c * c + 4)) / 2;
  const cSaid = say(fam.c, 0);
  const log = (arg: string, tail = ''): Tok[] =>
    natural
      ? [{ t: `ln(${arg})${tail}` }]
      : [{ t: 'log' }, { t: say(fam.b, 10), sub: true }, { t: `(${arg})${tail}` }];
  const second = plusText(c, cSaid);
  return {
    ...base,
    family: 'logSum',
    f,
    side: (t, s) =>
      t > start ? f(t) : s > 0 && t === start ? (lnB > 0 ? -Infinity : Infinity) : NaN,
    vas: (lo, hi) => (start >= lo && start <= hi ? [start] : []),
    breaks: (lo, hi) => (start >= lo && start <= hi ? [start] : []),
    key: undefined,
    zeros: (lo, hi) => (zero >= lo && zero <= hi ? [{ x: zero, text: fracText(zero) }] : []),
    domain: [iv(start, Infinity, false, false)],
    range: [ALL],
    // The first log's bracket carries the plus (spaces between tokens are not kept).
    text: [...log(x, '\u00a0+\u00a0'), ...log(`${x}${second}`)],
    handles: [],
  };
}

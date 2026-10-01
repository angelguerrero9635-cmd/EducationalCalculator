/**
 * H106: a rational function by its top's coefficients over its factors (`family: 'rational'`
 * with `top`): (aₙxⁿ + … + a₀) ÷ ((x − p₁)(x − p₂)…(x² + jx + k)…). The top can be a number
 * alone or have complex zeros, and the bottom can hold quadratics with no real zeros. Built on
 * the zeros-and-poles curve (its real zeros, poles, holes and domain), times what is left over,
 * which has no real zeros or poles.
 */
import type { RationalByTop } from '@/data/modules/typesHs3b';

import type { Curve, Get } from './functionGraphMath';
import { polyAt, quadraticRoots } from './functionGraphMath';
import type { FunctionFamily } from '@/data/modules/typesFunctionGraph';

type Build = (fam: FunctionFamily, x: string) => Curve;

const MINUS = '−';

/** a·b for coefficient lists, highest power first. */
const times = (a: number[], b: number[]) => {
  const out = new Array(a.length + b.length - 1).fill(0) as number[];
  a.forEach((p, i) => b.forEach((q, j) => (out[i + j]! += p * q)));
  return out;
};

/** A coefficient as written: "3", "−2", "0.5". */
const num = (x: number) => {
  const r = Number(x.toFixed(4));
  return `${r < 0 ? MINUS : ''}${Math.abs(r)}`;
};

/** "3x² − 2x + 3", "4": terms with signs, 1s left off, 0s dropped. */
export function polyText(cs: number[], x: string): string {
  const n = cs.length - 1;
  const terms = cs
    .map((c, i) => ({ c, p: n - i }))
    .filter((t) => Math.abs(t.c) > 1e-12)
    .map(({ c, p }, i) => {
      const body = p === 0 ? '' : p === 1 ? x : `${x}${p === 2 ? '²' : p === 3 ? '³' : `^${p}`}`;
      const mag = Math.abs(c) === 1 && p > 0 ? '' : num(Math.abs(c));
      const sign = c < 0 ? (i ? ` ${MINUS} ` : MINUS) : i ? ' + ' : '';
      return `${sign}${mag}${body}`;
    });
  return terms.length ? terms.join('') : '0';
}

/** The top's coefficients (leading zeros dropped), its real zeros, the poles and quadratics. */
export function rationalByTopParts(fam: RationalByTop, get: Get) {
  let top = fam.top.map((c) => get(c, 0));
  while (top.length > 1 && Math.abs(top[0]!) < 1e-12) top = top.slice(1);
  const poles = fam.poles.map((p) => get(p, 0));
  const quads = (fam.quadratics ?? []).map((q) => [1, get(q.j, 0), get(q.k, 1)] as number[]);
  let bottom = [1];
  for (const p of poles) bottom = times(bottom, [1, -p]);
  for (const q of quads) bottom = times(bottom, q);
  const deg = top.length - 1;
  let zeros: number[] = [];
  if (deg === 1) zeros = [-top[1]! / top[0]!];
  else if (deg === 2) {
    const rs = quadraticRoots(top[0]!, top[1]!, top[2]!).map((r) => r.x);
    zeros = rs.length === 1 ? [rs[0]!, rs[0]!] : rs;
  }
  return { top, poles, quads, bottom, zeros, lead: top[0]! };
}

export function rationalByTopCurve(fam: RationalByTop, get: Get, x: string, build: Build): Curve {
  const { top, poles, bottom, zeros, lead } = rationalByTopParts(fam, get);
  const base = build({ family: 'rational', a: lead, zeros, poles }, x);
  const f = (t: number) => (poles.some((p) => t === p) ? NaN : polyAt(top, t) / polyAt(bottom, t));
  // What the zeros-and-poles curve leaves out: complex zeros on top, quadratics below.
  const rest = (t: number) => {
    const shown = zeros.reduce((m, z) => m * (t - z), lead);
    const den = polyAt(bottom, t) / poles.reduce((m, p) => m * (t - p), 1);
    return Math.abs(shown) < 1e-300 ? 1 : polyAt(top, t) / shown / den;
  };
  const [n, d] = [top.length - 1, bottom.length - 1];
  const has = n < d ? [0] : n === d ? [lead] : [];
  let slant: { m: number; b: number } | undefined;
  if (n === d + 1) {
    const m = top[0]!;
    slant = { m, b: top[1]! - m * bottom[1]! };
  }
  return {
    ...base,
    f,
    side: (c, s) => base.side(c, s) * rest(c),
    has,
    slant,
    holes: base.holes.map((h) => ({ x: h.x, y: h.y * rest(h.x + 1e-7) })),
    key: undefined,
    range: undefined,
    parent: undefined,
    handles: [],
    text: [{ frac: [[{ t: polyText(top, x) }], [{ t: bottomText(fam, get, x) }]] }],
  };
}

/** "(x − 1)(x² + 1)", "(x − 2)²". */
function bottomText(fam: RationalByTop, get: Get, x: string) {
  const parts: string[] = [];
  const ps = fam.poles.map((p) => get(p, 0));
  const seen = new Map<number, number>();
  for (const p of ps) seen.set(p, (seen.get(p) ?? 0) + 1);
  for (const [p, times0] of seen) {
    const f = p === 0 ? x : `(${x} ${p > 0 ? MINUS : '+'} ${num(Math.abs(p))})`;
    parts.push(times0 === 1 ? f : `${f.startsWith('(') ? f : `(${f})`}${times0 === 2 ? '²' : '³'}`);
  }
  for (const q of fam.quadratics ?? [])
    parts.push(`(${polyText([1, get(q.j, 0), get(q.k, 1)], x)})`);
  const out = parts.join('');
  return out.startsWith('(') && parts.length === 1 && !out.endsWith('²') && !out.endsWith('³')
    ? out.slice(1, -1)
    : out || '1';
}

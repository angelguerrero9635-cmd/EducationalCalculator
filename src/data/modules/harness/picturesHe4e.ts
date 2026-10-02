/**
 * Picture checks for college round 4, group E (docs/RENDERINGS_HE.md). HC114: the critical t
 * holds the level (two-sided) within 0.001 (when the picture or the page works it out; a typed
 * t is the page's to pick, and the caption says the area it holds); the half-width is t⋆s ÷ √n,
 * the ends x̄ ∓ it; the observed t is |x̄ − μ|√n ÷ s. HC152: the shaded tail's mean (an
 * independent sum over the drawn tail) is μ + S; R = h²S; the offspring's mean is μ + R. Called from `repIssues` in `pictures.ts`.
 * Test-only.
 */
import type { VariableDef } from '@/engine/types';
import { halfWidth, selectedTail, tCritical, tMiddle } from '@/components/module/reps/he4eMath';
import { normalPdf, simpson } from '@/components/module/reps/statMath';

import type { Representation } from '../types';

type Val = (x: string | number) => number | undefined;

const close = (a: number, b: number, rel = 1e-6) =>
  Math.abs(a - b) <= rel * Math.max(1, Math.abs(a), Math.abs(b));

/** HC114 and HC152 on `normalCurve`. */
export function he4eNormalIssues(
  rep: Representation,
  val: Val,
  byId: Map<string, VariableDef>,
): string[] {
  if (rep.kind !== 'normalCurve') return [];
  const out: string[] = [];
  if (rep.family === 't') {
    const b = rep.bracket;
    const level = rep.level ?? 0.95;
    const get = (v: string | number | undefined) => (v === undefined ? undefined : val(v));
    const n = get(b?.n);
    const df = rep.df !== undefined ? get(rep.df) : n !== undefined ? n - 1 : undefined;
    if (n !== undefined && (n < 2 || Math.abs(n - Math.round(n)) > 1e-9))
      out.push(`t picture: n = ${n} is not a whole number of at least 2`);
    if (df !== undefined && df < 1) out.push(`t picture: df = ${df} is below 1`);
    if (df === undefined || df < 1) return out;
    const typed = typeof rep.tStar === 'string' && !byId.get(rep.tStar)?.derived;
    const t = rep.tStar !== undefined ? get(rep.tStar) : tCritical(level, df);
    if (t === undefined) return out;
    if (!typed && Math.abs(tMiddle(t, df) - level) > 0.001)
      out.push(
        `t picture: ±${t} holds ${tMiddle(t, df).toFixed(4)} of the t(${df}) curve, not ${level}`,
      );
    const [mean, s] = [get(b?.mean), get(b?.s)];
    if (b && mean !== undefined && s !== undefined && n !== undefined) {
      const h = halfWidth(t, s, n);
      const [half, lo, hi] = [get(b.half), get(b.lower), get(b.upper)];
      if (half !== undefined && !close(half, h))
        out.push(`t picture: half-width ${half} is not t⋆s ÷ √n = ${h}`);
      if (lo !== undefined && !close(lo, mean - h))
        out.push(`t picture: lower end ${lo} is not x̄ − t⋆s ÷ √n = ${mean - h}`);
      if (hi !== undefined && !close(hi, mean + h))
        out.push(`t picture: upper end ${hi} is not x̄ + t⋆s ÷ √n = ${mean + h}`);
      const [mu, obs] = [get(b.mu), get(rep.observed)];
      if (mu !== undefined && obs !== undefined && s > 0) {
        const tt = (Math.abs(mean - mu) * Math.sqrt(n)) / s;
        if (!close(obs, tt)) out.push(`t picture: observed t ${obs} is not |x̄ − μ|√n ÷ s = ${tt}`);
      }
    }
  }
  if (rep.shift) {
    const sh = rep.shift;
    const get = (v: string | number | undefined) => (v === undefined ? undefined : val(v));
    const [mu, S, R, h2, after] = [
      get(rep.mean),
      get(sh.selected),
      get(sh.response),
      get(sh.h2),
      get(sh.after),
    ];
    const sd = get(rep.sd) ?? 1;
    if (!(sd > 0)) out.push(`shift: the spread ${sd} is not positive`);
    if (mu !== undefined && S !== undefined && sd > 0) {
      const tail = selectedTail(mu, sd, S);
      if (tail) {
        const [a, b] =
          tail.side > 0 ? [tail.cut, tail.cut + 12 * sd] : [tail.cut - 12 * sd, tail.cut];
        const mass = simpson((x) => normalPdf(x, mu, sd), a, b);
        const first = simpson((x) => x * normalPdf(x, mu, sd), a, b);
        if (!close(first / mass, mu + S, 1e-4))
          out.push(`shift: the shaded tail's mean ${first / mass} is not μ + S = ${mu + S}`);
      }
    }
    if (R !== undefined && S !== undefined && h2 !== undefined && !close(R, h2 * S))
      out.push(`shift: R = ${R} is not h²S = ${h2 * S}`);
    if (h2 !== undefined && (h2 < 0 || h2 > 1)) out.push(`shift: h² = ${h2} is outside 0 to 1`);
    if (after !== undefined && mu !== undefined && R !== undefined && !close(after, mu + R))
      out.push(`shift: the offspring's mean ${after} is not μ + R = ${mu + R}`);
  }
  return out;
}

/**
 * HC66 (college round 3, group C): `termsChart` for series pages — the n·rⁿ and cⁿ/n! rules,
 * alternating signs, the sum a convergent series closes in on, and the caption's lines. Pure,
 * so `termsModel` and the harness use it too.
 */
import type { TermsChartSpec } from '@/data/modules/typesHsb';
import { formatNumber } from '@/engine/format';

const num = (x: number) => formatNumber(Number(x.toPrecision(6)));
const sub = (n: number) => [...String(n)].map((d) => '₀₁₂₃₄₅₆₇₈₉'[Number(d)]).join('');
const sup = (n: number) =>
  n === 1
    ? ''
    : Number.isInteger(n) && n >= 0
      ? [...String(n)].map((d) => '⁰¹²³⁴⁵⁶⁷⁸⁹'[Number(d)]).join('')
      : `^${num(n)}`;
const br = (x: number) => (x < 0 ? `(${num(x)})` : num(x));

/** Whether the chart takes the HC66 series treatment (names aₙ, its own caption). */
export const isSeriesHe3c = (s: TermsChartSpec) =>
  s.type === 'nr' ||
  s.type === 'factorial' ||
  !!s.alternate ||
  !!s.bounds ||
  s.next !== undefined ||
  s.ratio !== undefined;

/** How many terms past n the chart runs: one for aₙ₊₁. */
export const extraHe3c = (s: TermsChartSpec) =>
  s.next !== undefined || s.ratio !== undefined ? 1 : 0;

export const factorial = (n: number) => {
  let f = 1;
  for (let k = 2; k <= n; k++) f *= k;
  return f;
};

/**
 * Term n (from 1) by the HC66 rules, or undefined where the existing rule stands unchanged
 * (no new type and no alternating signs).
 */
export function termHe3c(s: TermsChartSpec, a: number, d: number, n: number): number | undefined {
  const sign = s.alternate ? (n % 2 ? 1 : -1) : 1;
  if (s.type === 'nr') return sign * a * n * d ** n;
  if (s.type === 'factorial') return (sign * a * d ** n) / factorial(n);
  if (!s.alternate) return undefined;
  if (s.type === 'power') return sign * a * n ** d;
  if (s.type === 'geometric') return sign * a * d ** (n - 1);
  if (s.type === 'arithmetic') return sign * (a + (n - 1) * d);
  return undefined; // recursive: no alternating option
}

/** Rewrites the terms in place where an HC66 rule applies. */
export function seriesTermsHe3c(s: TermsChartSpec, a: number, d: number, terms: number[]) {
  terms.forEach((_, i) => {
    const t = termHe3c(s, a, d, i + 1);
    if (t !== undefined) terms[i] = t;
  });
}

/** The series' sum Σ from n = 1 to ∞, when it converges (closed form or summed to 10⁻⁹). */
export function sumHe3c(s: TermsChartSpec, a: number, d: number): number | undefined {
  const alt = !!s.alternate;
  switch (s.type) {
    case 'nr':
      if (Math.abs(d) >= 1) return undefined;
      return alt ? (a * d) / (1 + d) ** 2 : (a * d) / (1 - d) ** 2;
    case 'factorial':
      return alt ? a * (1 - Math.exp(-d)) : a * (Math.exp(d) - 1);
    case 'geometric':
      if (Math.abs(d) >= 1) return undefined;
      return alt ? a / (1 + d) : a / (1 - d);
    case 'power': {
      const p = -d;
      if (alt) {
        if (p <= 0) return undefined;
        // η(p): sum to N, then half the next term (the error is far under the next term).
        const N = 200000;
        let S = 0;
        for (let n = 1; n <= N; n++) S += (n % 2 ? 1 : -1) / n ** p;
        return a * (S + (N % 2 ? -0.5 : 0.5) / (N + 1) ** p);
      }
      if (p <= 1) return undefined;
      // ζ(p) by Euler–Maclaurin: S_N + N^(1−p)/(p − 1) − N^(−p)/2 + p·N^(−p−1)/12.
      const N = 2000;
      let S = 0;
      for (let n = 1; n < N; n++) S += 1 / n ** p;
      return a * (S + N ** (1 - p) / (p - 1) + 0.5 / N ** p + p / (12 * N ** (p + 1)));
    }
    default:
      return undefined;
  }
}

/** The rule as a lesson writes it: "aₙ = n·(0.5)ⁿ", "aₙ = 2ⁿ ÷ n!", "aₙ = (−1)ⁿ⁺¹ ÷ n". */
function ruleText(s: TermsChartSpec, a: number, d: number): string {
  const sign = s.alternate ? '(−1)ⁿ⁺¹' : '';
  const k = a === 1 ? '' : `${num(a)} × `;
  switch (s.type) {
    case 'nr':
      return `aₙ = ${k}${sign ? `${sign} × ` : ''}n·${br(d)}ⁿ`;
    case 'factorial':
      return `aₙ = ${k}${sign ? `${sign} × ` : ''}${br(d)}ⁿ ÷ n!`;
    case 'power':
      return d < 0
        ? `aₙ = ${sign || (a === 1 ? '1' : num(a))}${sign && a !== 1 ? ` × ${num(a)}` : ''} ÷ n${sup(-d)}`
        : `aₙ = ${k}${sign ? `${sign} × ` : ''}n${sup(d)}`;
    case 'geometric':
      return `aₙ = ${sign ? `${sign} × ` : ''}${num(a)} × ${br(d)}ⁿ⁻¹`;
    default:
      return `aₙ = ${sign ? `${sign} × ` : ''}(${num(a)} + (n − 1) × ${br(d)})`;
  }
}

/** Term n worked with its numbers: "a₅ = 5 × 0.5⁵ = 0.15625". */
function worked(s: TermsChartSpec, a: number, d: number, n: number, t: number): string {
  const sign = s.alternate ? (n % 2 ? '' : '−') : '';
  const k = a === 1 ? '' : `${num(a)} × `;
  const body =
    s.type === 'nr'
      ? `${k}${n} × ${br(d)}${sup(n)}`
      : s.type === 'factorial'
        ? `${k}${br(d)}${sup(n)} ÷ ${n}!`
        : s.type === 'power' && d < 0
          ? `${num(a)} ÷ ${n}${sup(-d)}`
          : undefined;
  return body
    ? `a${sub(n)} = ${sign}${sign ? `(${body})` : body} = ${num(t)}`
    : `a${sub(n)} = ${num(t)}`;
}

/**
 * The caption: the terms and the rule, aₙ worked, aₙ₊₁ and the ratio, Sₙ, the error bound when
 * the signs alternate, the sum and the band.
 */
export function seriesLinesHe3c(
  s: TermsChartSpec,
  a: number,
  d: number,
  n: number,
  terms: number[],
  sums: number[],
  band: { low: number; high: number } | undefined,
  limit: number | undefined,
): string[] {
  const shown =
    n <= 5
      ? terms.slice(0, n).map(num).join(', ')
      : `${terms.slice(0, 4).map(num).join(', ')}, …, ${num(terms[n - 1]!)}`;
  const lines = [`Terms: ${shown} (${ruleText(s, a, d)}).`, worked(s, a, d, n, terms[n - 1]!)];
  const next = terms[n];
  if (extraHe3c(s) && next !== undefined) {
    lines.push(worked(s, a, d, n + 1, next));
    if (s.ratio !== undefined && terms[n - 1] !== 0)
      lines.push(
        `a${sub(n + 1)} ÷ a${sub(n)} = ${num(next)} ÷ ${num(terms[n - 1]!)} = ${num(next / terms[n - 1]!)}` +
          (s.type === 'nr'
            ? `; the ratio tends to |r| = ${num(Math.abs(d))}${Math.abs(d) < 1 ? ' < 1: the series converges' : ' ≥ 1: no convergence'}`
            : s.type === 'factorial'
              ? `; the ratio ${num(Math.abs(d))} ÷ (n + 1) tends to 0 < 1: the series converges`
              : ''),
      );
  }
  if (s.sums) lines.push(`S${sub(n)} = ${num(sums[n - 1]!)}`);
  if (s.alternate && next !== undefined)
    lines.push(`Error: |S − S${sub(n)}| ≤ |a${sub(n + 1)}| = ${num(Math.abs(next))}`);
  if (band)
    lines.push(
      `Band: ${num(band.low)} ≤ S ≤ ${num(band.high)}` +
        (limit !== undefined
          ? limit >= band.low - 1e-9 && limit <= band.high + 1e-9
            ? ` (S = ${num(limit)} lies in it)`
            : ` (S = ${num(limit)} lies outside it)`
          : ''),
    );
  if (limit !== undefined)
    lines.push(`S = ${num(limit)}; S${sub(n)} is ${num(Math.abs(limit - sums[n - 1]!))} from it.`);
  else if (s.limit) lines.push('This series has no sum: it diverges.');
  return lines;
}

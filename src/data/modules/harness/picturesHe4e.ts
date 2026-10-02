/**
 * Picture checks for college round 4, group E (docs/RENDERINGS_HE.md). HC114: the critical t
 * holds the level (two-sided) within 0.001 (when the picture or the page works it out; a typed
 * t is the page's to pick, and the caption says the area it holds); the half-width is t⋆s ÷ √n,
 * the ends x̄ ∓ it; the observed t is |x̄ − μ|√n ÷ s. HC152: the shaded tail's mean (an
 * independent sum over the drawn tail) is μ + S; R = h²S; the offspring's mean is μ + R. HC151
 * and HC153, HC148 and HC179 below. Called from `repIssues` in `pictures.ts`.
 * Test-only.
 */
import type { VariableDef } from '@/engine/types';
import {
  ampAt,
  ampMid,
  driftPaths,
  fourierB,
  halfWidth,
  heterozygosity,
  pForH,
  selectedTail,
  tCritical,
  tMiddle,
} from '@/components/module/reps/he4eMath';
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

/**
 * HC151 on `alleleFrequencies` `after`: p′ lies in [0, 1]; the page's Δp is p′ − p (so the arrow,
 * drawn from p to p′, points the way its sign says); w̄ = p²w_AA + 2pqw_Aa + q²w_aa.
 */
export function he4eAlleleIssues(rep: Representation, val: Val): string[] {
  if (rep.kind !== 'alleleFrequencies' || !rep.after) return [];
  const out: string[] = [];
  const [p, p2] = [val(rep.p), val(rep.after)];
  if (p2 !== undefined && (p2 < -1e-9 || p2 > 1 + 1e-9)) out.push(`p′ = ${p2} is outside 0 to 1`);
  if (p !== undefined && p2 !== undefined && rep.change) {
    const dp = val(rep.change);
    if (dp !== undefined && !close(dp, p2 - p, 1e-6))
      out.push(`Δp = ${dp} is not p′ − p = ${p2 - p}: the arrow would point the other way`);
  }
  if (p !== undefined && rep.fitness && rep.mean) {
    const [wAA, wAa, waa, wbar] = [...rep.fitness.map(val), val(rep.mean)];
    if ([wAA, wAa, waa, wbar].every((x) => x !== undefined)) {
      const q = 1 - p;
      const m = p * p * wAA! + 2 * p * q * wAa! + q * q * waa!;
      if (!close(wbar!, m)) out.push(`w̄ = ${wbar} is not p²w_AA + 2pqw_Aa + q²w_aa = ${m}`);
    }
  }
  return out;
}

/**
 * HC153 `driftPaths`: every drawn path starts at p₀ and stays in [0, 1] in steps of 1 ÷ 2Nₑ (a
 * count of gene copies); the dashed H at t is H₀(1 − 1 ÷ 2Nₑ)ᵗ (an independent product) and
 * equals the page's H_t; the page's share kept is H_t ÷ H₀; Nₑ ≥ 1.
 */
export function driftPathsIssues(rep: Representation, val: Val): string[] {
  if (rep.kind !== 'driftPaths') return [];
  const out: string[] = [];
  const get = (v: string | number | undefined) => (v === undefined ? undefined : val(v));
  const [ne, gens, h0Given, pGiven] = [get(rep.ne), get(rep.generations), get(rep.h0), get(rep.p0)];
  if (ne !== undefined && ne < 1) out.push(`drift: Nₑ = ${ne} is below 1`);
  if (gens !== undefined && (gens < 1 || Math.abs(gens - Math.round(gens)) > 1e-9))
    out.push(`drift: ${gens} generations is not a whole number of at least 1`);
  if (h0Given !== undefined && (h0Given < 0 || h0Given > 0.5))
    out.push(`drift: H₀ = ${h0Given} is outside 0 to 0.5`);
  if (ne === undefined || ne < 1 || gens === undefined || gens < 1) return out;
  const p0 = pGiven ?? (h0Given !== undefined ? pForH(h0Given) : 0.5);
  const h0 = h0Given ?? 2 * p0 * (1 - p0);
  if (h0Given !== undefined && pGiven !== undefined && !close(h0Given, 2 * pGiven * (1 - pGiven)))
    out.push(`drift: H₀ = ${h0Given} is not 2p₀(1 − p₀) for p₀ = ${pGiven}`);
  const N2 = Math.max(2, Math.round(2 * ne));
  const paths = driftPaths(ne, Math.min(gens, 200), p0, rep.populations ?? 12, rep.seed);
  for (const path of paths) {
    if (Math.abs(path[0]! - p0) > 1e-12)
      out.push(`drift: a path starts at ${path[0]}, not p₀ = ${p0}`);
    for (const p of path.slice(1))
      if (p < 0 || p > 1 || Math.abs(p * N2 - Math.round(p * N2)) > 1e-6) {
        out.push(`drift: a path reaches p = ${p}, not a count out of 2Nₑ = ${N2} in [0, 1]`);
        break;
      }
  }
  const t = rep.t !== undefined ? get(rep.t) : gens;
  if (t === undefined) return out;
  let h = h0;
  for (let i = 0; i < t; i++) h *= 1 - 1 / (2 * ne);
  if (Math.abs(heterozygosity(h0, ne, t) - h) > 1e-9 * Math.max(1e-12, h))
    out.push(`drift: the dashed H at t = ${t} is not H₀(1 − 1 ÷ 2Nₑ)ᵗ = ${h}`);
  const ht = get(rep.ht);
  if (ht !== undefined && !close(ht, h, 1e-6)) out.push(`drift: H_t = ${ht} is not ${h}`);
  const kept = get(rep.kept);
  if (kept !== undefined && h0 > 0 && !close(kept, h / h0) && !close(kept, (100 * h) / h0))
    out.push(`drift: the share kept ${kept} is not H_t ÷ H₀ = ${h / h0}`);
  return out;
}

/**
 * HC148 and HC179 on `functionGraph`. Amplification: the threshold lies between 0 and the
 * plateau; each drawn curve meets it at its Ct and doubles per cycle (within 1%) four cycles
 * before; at most four curves of two genes. Fourier: N whole, 1 to 99; bₖ from the textbook
 * formula (written out here apart from the picture's) equals the drawn stem and the page's;
 * fₖ = kf₀; the share is (bₖ² ÷ 2) over the wave's power.
 */
export function he4eGraphIssues(rep: Representation, val: Val): string[] {
  if (rep.kind !== 'functionGraph') return [];
  const out: string[] = [];
  const get = (v: string | number | undefined) => (v === undefined ? undefined : val(v));
  if (rep.family === 'amplification') {
    const th = rep.threshold;
    const level = get(th.level) ?? 0.1;
    if (!(level > 0 && level < 1))
      out.push(`amplification: threshold ${level} is not inside (0, 1)`);
    if (th.curves.length > 4) out.push(`amplification: ${th.curves.length} curves (4 fit)`);
    if (new Set(th.curves.map((c) => c.name)).size > 2)
      out.push('amplification: more than 2 genes');
    for (const cv of th.curves) {
      const ct = get(cv.ct);
      if (ct === undefined || !(level > 0 && level < 1)) continue;
      if (ct < 1 || ct > 45) out.push(`amplification: Ct ${ct} is outside 1 to 45`);
      const mid = ampMid(ct, level);
      if (Math.abs(ampAt(ct, mid) - level) > 1e-9)
        out.push(
          `amplification: ${cv.name} meets the threshold at ${ampAt(ct, mid)}, not at its Ct`,
        );
      const ratio = ampAt(ct - 3, mid) / ampAt(ct - 4, mid);
      if (Math.abs(ratio - 2) > 0.02)
        out.push(`amplification: ${cv.name} grows ×${ratio} a cycle before the threshold, not ×2`);
    }
  }
  if (rep.family === 'fourier') {
    const s = rep.fourier;
    const N = get(s.terms);
    if (N !== undefined && (N < 1 || N > 99 || Math.abs(N - Math.round(N)) > 1e-9))
      out.push(`fourier: ${N} terms is not a whole number from 1 to 99`);
    const k = get(s.k);
    const A = get(s.amplitude) ?? 1;
    if (k === undefined) return out;
    if (k < 1 || k > 99 || Math.abs(k - Math.round(k)) > 1e-9)
      out.push(`fourier: harmonic ${k} is not a whole number from 1 to 99`);
    const odd = Math.round(k) % 2 === 1;
    const b =
      s.wave === 'square'
        ? odd
          ? (4 * A) / (k * Math.PI)
          : 0
        : s.wave === 'saw'
          ? (2 * A * (-1) ** (Math.round(k) + 1)) / (k * Math.PI)
          : odd
            ? (8 * A * (-1) ** ((Math.round(k) - 1) / 2)) / (k * k * Math.PI * Math.PI)
            : 0;
    if (Math.abs(fourierB(s.wave, Math.round(k), A) - b) > 1e-9 * Math.max(1, Math.abs(b)))
      out.push(`fourier: the lit stem is ${fourierB(s.wave, Math.round(k), A)}, not b${k} = ${b}`);
    const coef = get(s.coefficient);
    if (coef !== undefined && !close(coef, b)) out.push(`fourier: b${k} = ${coef} is not ${b}`);
    const [f0, fk] = [get(s.f0), get(s.fk)];
    if (f0 !== undefined && fk !== undefined && !close(fk, k * f0))
      out.push(`fourier: fₖ = ${fk} is not k × f₀ = ${k * f0}`);
    const share = get(s.share);
    const power = s.wave === 'square' ? A * A : (A * A) / 3;
    if (share !== undefined && power > 0) {
      const want = (b * b) / 2 / power;
      if (!close(share, want) && !close(share, 100 * want))
        out.push(`fourier: the power share ${share} is not (b² ÷ 2) ÷ P = ${want}`);
    }
  }
  return out;
}

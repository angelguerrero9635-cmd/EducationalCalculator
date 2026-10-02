/**
 * Picture checks for `functionGraph` families and regions, college round 1 group E (HC10, HC12;
 * docs/RENDERINGS_HE.md). Every expression parses within the grammar and reads only values and
 * the input; θ(K) = top ÷ 2 (and n = 1 is the rational curve); t_max = ln(k_a ÷ k) ÷ (k_a − k)
 * is the curve's peak; the sawtooth's troughs rise toward the steady trough; the real power
 * passes (1, a); erfc starts at C_s; every written area equals the integral by quadrature
 * within 0.1%; each ring is a root of f − y; F at x equals the page's value; the Levenspiel
 * rectangle and area equal V_CSTR and V_PFR within 1%; A₁ = A₂ within 1% at the critical angle.
 * Called from `repIssues` in `pictures.ts`. Test-only.
 */
import { parseExpr } from '@/components/module/reps/exprHe1e';
import { curveOf } from '@/components/module/reps/functionGraphMath';
import {
  doseNumbers,
  dosesOf,
  levelCrossings,
  oneDose,
  regionOf,
} from '@/components/module/reps/functionGraphHe1e';

import type { Representation } from '../types';
import { familyVars, type NumOrVar } from '../typesFunctionGraph';
import { familyHe1eShows } from '../typesHe1e';

type Val = (x: string | number) => number | undefined;

const near = (a: number, b: number, rel: number) =>
  Math.abs(a - b) <= rel * Math.max(1e-9, Math.abs(a), Math.abs(b));

/** ∫ from a to b by Simpson's rule on many panels (independent of the picture's own sum). */
function quad(f: (x: number) => number, a: number, b: number, n = 6000): number {
  const h = (b - a) / n;
  const g = (x: number) => (Number.isFinite(f(x)) ? f(x) : 0);
  let s = g(a) + g(b);
  for (let i = 1; i < n; i++) s += (i % 2 ? 4 : 2) * g(a + i * h);
  return (s * h) / 3;
}

/** The checks; nothing when the spec uses none of these families or options. */
export function he1eIssues(rep: Representation, val: Val): string[] {
  if (rep.kind !== 'functionGraph') return [];
  const out: string[] = [];
  const v = (x: NumOrVar | undefined, d: number) => (x === undefined ? d : (val(x) ?? d));
  const num = (id: string | undefined) => (id === undefined ? undefined : val(id));
  // An expression: in the grammar (its names are the page's values: the module tests).
  for (const f of [rep, ...(rep.other ? [rep.other] : [])])
    if (f.family === 'expr') {
      try {
        parseExpr(f.expr);
      } catch (e) {
        out.push(`expr "${f.expr}": ${(e as Error).message}`);
      }
    }
  if (out.length) return out;
  const ids = [...familyVars(rep), ...(rep.other ? familyVars(rep.other) : [])];
  if (ids.some((id) => val(id) === undefined)) return out;
  const c = curveOf(rep, val);
  const g = rep.other ? curveOf(rep.other, val) : undefined;

  switch (rep.family) {
    case 'hill': {
      const [K, n, top] = [v(rep.K, 1), v(rep.n, 1), v(rep.top, 1)];
      if (!(K > 0)) out.push(`hill: K = ${K} (K is positive)`);
      if (!near(c.f(K), top / 2, 1e-9))
        out.push(`hill: θ(K) = ${c.f(K)}, not top ÷ 2 = ${top / 2}`);
      if (n === 1)
        for (const L of [0.1, 1, 5, 40].map((t) => t * K))
          if (!near(c.f(L), (top * L) / (K + L), 1e-9))
            out.push(`hill: n = 1 is not top·L ÷ (K + L)`);
      const [fx, fy] = [num(rep.feature?.x), num(rep.feature?.y)];
      if (fx !== undefined && !near(fx, K, 1e-6)) out.push(`hill: marked K ${fx} is not ${K}`);
      if (fy !== undefined && !near(fy, top / 2, 1e-6)) out.push(`hill: marked half ${fy}`);
      break;
    }
    case 'bateman': {
      const [ka, k] = [v(rep.ka, 1), v(rep.k, 0.1)];
      if (!(ka > 0 && k > 0)) {
        out.push('bateman: k_a and k are positive');
        break;
      }
      const tmax = ka === k ? 1 / k : Math.log(ka / k) / (ka - k);
      // The curve's own peak, by golden-section search on [0, 20·t_max].
      let [a, b] = [0, 20 * tmax];
      const r = (Math.sqrt(5) - 1) / 2;
      for (let i = 0; i < 200; i++) {
        const [m1, m2] = [b - r * (b - a), a + r * (b - a)];
        if (c.f(m1) < c.f(m2)) a = m1;
        else b = m2;
      }
      const peak = (a + b) / 2;
      if (!near(peak, tmax, 1e-5)) out.push(`bateman: the peak is at ${peak}, not t_max ${tmax}`);
      const [fx, fy] = [num(rep.feature?.x), num(rep.feature?.y)];
      if (fx !== undefined && !near(fx, tmax, 1e-4))
        out.push(`bateman: t_max ${fx} is not ${tmax}`);
      if (fy !== undefined && !near(fy, c.f(tmax), 1e-4))
        out.push(`bateman: C_max ${fy} is not ${c.f(tmax)}`);
      break;
    }
    case 'power':
      if ('exponent' in rep) {
        const [a, h, k] = [v(rep.a, 1), v(rep.h, 0), v(rep.k, 0)];
        if (!near(c.f(1 + h), a + k, 1e-9))
          out.push(`power: f(${1 + h}) = ${c.f(1 + h)}, not a + k = ${a + k}`);
      }
      break;
    case 'erfc': {
      const Cs = v(rep.Cs, 1);
      if (!near(c.f(0), Cs, 1e-12)) out.push(`erfc: C(0) = ${c.f(0)}, not C_s = ${Cs}`);
      break;
    }
    case 'levenspiel': {
      const X = v(rep.X, 0.5);
      if (!(X > 0 && X < 1)) {
        out.push(`levenspiel: X = ${X} (0 < X < 1)`);
        break;
      }
      const rect = X * c.f(X);
      const area = quad(c.f, 0, X);
      const [vc, vp] = [num(rep.cstr), num(rep.pfr)];
      if (vc !== undefined && !near(rect, vc, 0.01))
        out.push(`levenspiel: rectangle ${rect} is not V_CSTR ${vc}`);
      if (vp !== undefined && !near(area, vp, 0.01))
        out.push(`levenspiel: area ${area} is not V_PFR ${vp}`);
      break;
    }
    case 'equalArea': {
      const [pm, pmax, dc] = [v(rep.pm, 1), v(rep.pmax, 2), v(rep.dc, 90)];
      const k = rep.radians ? 1 : Math.PI / 180;
      if (!(pm > 0 && pm < pmax)) {
        out.push(`equalArea: P_m = ${pm} must be between 0 and P_max = ${pmax}`);
        break;
      }
      const d0 = Math.asin(pm / pmax) / k;
      const dmax = (rep.radians ? Math.PI : 180) - d0;
      const A1 = quad(() => pm, d0 * k, dc * k);
      const A2 = quad((d) => c.f(d / k) - pm, dc * k, dmax * k);
      if (!near(A1, A2, 0.01)) out.push(`equalArea: A₁ = ${A1}, A₂ = ${A2} at δ_cr = ${dc}`);
      const [s0, sm] = familyHe1eShows(rep).map((id) => num(id));
      if (rep.d0 && s0 !== undefined && !near(s0, d0, 1e-3))
        out.push(`equalArea: δ₀ ${s0} ≠ ${d0}`);
      if (rep.dmax && sm !== undefined && !near(sm, dmax, 1e-3))
        out.push(`equalArea: δ_max ${sm} ≠ ${dmax}`);
      break;
    }
  }

  // The repeated dose: troughs rise toward the steady trough; the average is the page's.
  const d = dosesOf(rep, (x, f) => v(x, f));
  const one = oneDose(c);
  const every = rep.repeat?.every;
  const typed = !(typeof every === 'string' && val(every) === undefined);
  if (d && one && typed) {
    const q = doseNumbers(one, d.every, d.count);
    q.troughs.forEach((t, i) => {
      // (rises, or stays put once a dose has died away before the next)
      if (i && t < q.troughs[i - 1]! * (1 - 1e-12)) out.push(`repeat: trough ${i + 1} falls`);
      if (!(t <= q.steady * (1 + 1e-9)))
        out.push(`repeat: trough ${t} passes the steady ${q.steady}`);
    });
    const avg = num(rep.repeat?.avg);
    if (avg !== undefined && !near(avg, q.avg, 1e-4))
      out.push(`repeat: C_ss,avg ${avg} is not ${q.avg}`);
  }

  // Regions: written areas by quadrature within 0.1%.
  const get = (x: NumOrVar | undefined, f: number) => v(x, f);
  const r = regionOf(rep, c, g, get);
  if (r) {
    const ends =
      rep.area ?? (rep.accumulation && { from: rep.accumulation.from, to: rep.accumulation.x });
    const sign = ends && v(ends.from, 0) > v(ends.to, 1) ? -1 : 1;
    const want = rep.between
      ? quad((x) => Math.abs(c.f(x) - g!.f(x)), r.from, r.to, 20000)
      : quad(c.f, r.from, r.to, 20000) * sign;
    if (!near(r.value, want, 1e-3)) out.push(`region: drawn ${r.value}, quadrature ${want}`);
    const id = rep.between ? rep.between.value : rep.area?.value;
    const page = num(id);
    if (page !== undefined && !near(page, want, 1e-3))
      out.push(`region: the page's ${page} is not ∫ = ${want}`);
  }
  if (rep.level) {
    const y = v(rep.level.y, 0);
    for (const p of levelCrossings(c, y, -60, 60))
      if (!(Math.abs(c.f(p.x) - y) <= 1e-6 * Math.max(1, Math.abs(y))))
        out.push(`level: ring at ${p.x} is not a root (f = ${c.f(p.x)})`);
  }
  if (rep.accumulation) {
    const [a, x] = [v(rep.accumulation.from, 0), v(rep.accumulation.x, 0)];
    const F = num(rep.accumulation.value);
    const want = quad(c.f, a, x, 20000);
    if (F !== undefined && !near(F, want, 1e-3))
      out.push(`accumulation: F(${x}) = ${F}, not ${want}`);
  }
  return out;
}

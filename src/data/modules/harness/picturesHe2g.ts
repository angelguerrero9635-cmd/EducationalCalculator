/**
 * Picture checks for college round 2, group G (docs/RENDERINGS_HE.md). HC21 `fieldPlot`: every
 * expression parses within the grammar; Euler's points and the exact end equal the page's; each
 * side's integral and the total equal the page's (by an independent Simpson sum); eigenvalues
 * equal the page's λ; x(t) equals the page's point; the equilibrium equals (γ ÷ δ, α ÷ β) or
 * the isoclines' crossing, and no crossing is named when an N* ≤ 0. Called from `repIssues` in
 * `pictures.ts`. Test-only.
 */
import { parseExpr } from '@/components/module/reps/exprHe1e';
import {
  competitionNumbers,
  eigen2,
  eulerOf,
  fieldFn,
  lotkaNumbers,
  pathPieces,
  phasePoint,
  slopeSolution,
  type Get,
} from '@/components/module/reps/fieldPlotMath';

import { curveOf } from '@/components/module/reps/functionGraphMath';
import { seriesOf } from '@/components/module/reps/functionGraphHe2g';

import type { Representation } from '../types';
import { familyVars } from '../typesFunctionGraph';
import type { NumOrVar } from '../typesGraphs';
import { fieldPlotInputs } from '../typesHe2g';

type Val = (x: string | number) => number | undefined;

const near = (a: number, b: number, rel: number) =>
  Math.abs(a - b) <= rel * Math.max(1e-9, Math.abs(a), Math.abs(b));

/** ∫ along a piece by the trapezoid rule on many panels (independent of the picture's Simpson). */
function trap(f: (t: number) => number, n = 20000): number {
  let s = (f(0) + f(1)) / 2;
  for (let i = 1; i < n; i++) s += f(i / n);
  return s / n;
}

/** HC21: the field's checks; nothing until its values are known. */
export function fieldPlotIssues(rep: Representation, val: Val): string[] {
  if (rep.kind !== 'fieldPlot') return [];
  const out: string[] = [];
  for (const src of [rep.dy, rep.P, rep.Q])
    if (src !== undefined)
      try {
        parseExpr(src);
      } catch (e) {
        out.push(`fieldPlot: "${src}": ${(e as Error).message}`);
      }
  if (out.length) return out;
  if (rep.mode === 'slope' && !rep.dy) out.push('fieldPlot slope: no dy');
  if (rep.mode === 'vector' && !(rep.P && rep.Q)) out.push('fieldPlot vector: no P, Q');
  if (rep.mode === 'phase' && !rep.matrix && !rep.lotka) out.push('fieldPlot phase: no system');
  if (rep.mode === 'isoclines' && !rep.competition) out.push('fieldPlot isoclines: none');
  if (out.length) return out;
  if (fieldPlotInputs(rep).some((id) => val(id) === undefined)) return out;
  const get: Get = (v: NumOrVar | undefined, d: number) => (v === undefined ? d : (val(v) ?? d));
  const num = (id: string | undefined) => (id === undefined ? undefined : val(id));
  const same = (what: string, id: string | undefined, x: number, rel = 1e-6) => {
    const v = num(id);
    if (v !== undefined && !near(v, x, rel))
      out.push(`fieldPlot: ${what} is ${v}, the picture ${x}`);
  };

  if (rep.mode === 'slope' && rep.euler && rep.start) {
    const n = num(typeof rep.euler.n === 'string' ? rep.euler.n : undefined) ?? get(rep.euler.n, 1);
    if (!Number.isInteger(n) || n < 1 || n > 50) out.push(`fieldPlot: Euler steps n = ${n}`);
    const pts = eulerOf(rep, get);
    if (pts && pts.length > 1) {
      const last = pts[pts.length - 1]!;
      same('Euler’s last y', rep.euler.last, last[1], 1e-6);
      const g = fieldFn(rep.dy, get);
      const exact = slopeSolution(g, get(rep.start.x, 0), get(rep.start.y, 0), last[0], 20000);
      same('the exact y', rep.euler.exact, exact, 1e-4);
    }
  }

  if (rep.mode === 'vector' && rep.path) {
    const [P, Q] = [fieldFn(rep.P, get), fieldFn(rep.Q, get)];
    const works = pathPieces(rep.path, get).map((p) =>
      trap((t) => {
        const [x, y] = p.r(t);
        const [dx, dy] = p.dr(t);
        return P(x, y) * dx + Q(x, y) * dy;
      }),
    );
    const tol = (x: number) => Math.max(1e-6, 1e-5 * Math.abs(x));
    (rep.sides ?? []).forEach((id, i) => {
      const v = num(id);
      if (i >= works.length) out.push(`fieldPlot: side ${i + 1} beyond the path's ${works.length}`);
      else if (v !== undefined && Math.abs(v - works[i]!) > tol(works[i]!))
        out.push(`fieldPlot: side ${i + 1} is ${v}, ∫F·dr = ${works[i]}`);
    });
    const total = works.reduce((s, x) => s + x, 0);
    const w = num(rep.work);
    if (w !== undefined && Math.abs(w - total) > tol(total))
      out.push(`fieldPlot: work ${w}, ∫F·dr = ${total}`);
  }

  if (rep.mode === 'phase' && rep.matrix) {
    const [a, b, c, d] = rep.matrix.map((m) => get(m, 0)) as [number, number, number, number];
    const e = eigen2(a, b, c, d);
    const said = [num(rep.eigen?.l1), num(rep.eigen?.l2)];
    if (said.some((x) => x !== undefined)) {
      if (!e.real) out.push('fieldPlot: the page names real eigenvalues; they are complex');
      else {
        const got = said.filter((x): x is number => x !== undefined).sort((p, q) => q - p);
        const want = [e.real.l1, e.real.l2];
        if (!got.every((x) => want.some((y) => Math.abs(x - y) <= 1e-6 * Math.max(1, Math.abs(y)))))
          out.push(`fieldPlot: eigenvalues ${got.join(', ')}, A has ${want.join(', ')}`);
      }
    }
    const q = phasePoint(rep, get);
    if (q) {
      const tol = (x: number) => 1e-4 * Math.max(1, Math.abs(x));
      for (const [id, x, n] of [
        [rep.point?.x, q[0], 'x(t)'],
        [rep.point?.y, q[1], 'y(t)'],
      ] as const) {
        const v = num(id);
        if (v !== undefined && Math.abs(v - x) > tol(x))
          out.push(`fieldPlot: ${n} is ${v}, the flow ${x}`);
      }
    }
  }
  if (rep.mode === 'phase' && rep.lotka) {
    const l = rep.lotka;
    const e = lotkaNumbers(get(l.alpha, 1), get(l.beta, 1), get(l.gamma, 1), get(l.delta, 1));
    if (![l.alpha, l.beta, l.gamma, l.delta].every((x) => get(x, 1) > 0))
      out.push('fieldPlot: α, β, γ, δ are positive');
    same('the equilibrium’s x', rep.equilibrium?.x, e.x);
    same('the equilibrium’s y', rep.equilibrium?.y, e.y);
  }
  if (rep.mode === 'isoclines' && rep.competition) {
    const k = rep.competition;
    const cn = competitionNumbers(get(k.K1, 1), get(k.K2, 1), get(k.alpha, 1), get(k.beta, 1));
    // The picture rings a crossing only when both N* are positive (and αβ < 1).
    const [n1, n2] = [num(rep.equilibrium?.x), num(rep.equilibrium?.y)];
    if (n1 !== undefined) same('N₁*', rep.equilibrium?.x, cn.n1);
    if (n2 !== undefined) same('N₂*', rep.equilibrium?.y, cn.n2);
    if (cn.coexist && !(cn.n1 > 0 && cn.n2 > 0)) out.push('fieldPlot: a ring with an N* ≤ 0');
  }
  return out;
}

/**
 * HC37 and HC38: the tangent's slope is a central difference of f at x (10⁻⁶ relative) and its
 * L(at) is on the line; f(x ± δ) stays within y ± ε; the polynomial is Σ cₖ(x − a)ᵏ (summed
 * power by power here), its P(x), the error |f − P| and ∫P equal the page's; linearOde solves
 * y″ = (cx − ω²)y.
 */
export function he2gGraphIssues(rep: Representation, val: Val): string[] {
  if (rep.kind !== 'functionGraph') return [];
  if (!rep.tangent && !rep.band && !rep.series && rep.family !== 'linearOde') return [];
  const out: string[] = [];
  if (familyVars(rep).some((id) => val(id) === undefined)) return out;
  const get: Get = (v: NumOrVar | undefined, d: number) => (v === undefined ? d : (val(v) ?? d));
  const num = (id: string | undefined) => (id === undefined ? undefined : val(id));
  const f = curveOf(rep, val).f;
  const close = (a: number, b: number, rel = 1e-6) =>
    Math.abs(a - b) <= rel * Math.max(1, Math.abs(a), Math.abs(b));
  if (rep.family === 'linearOde') {
    const [w, c] = [get(rep.omega, 0), get(rep.c, 0)];
    if (!close(f(0), get(rep.a0, 1), 1e-9)) out.push(`linearOde: y(0) = ${f(0)}`);
    for (const x of [-1.3, 0.4, 1.7]) {
      const e = 1e-3;
      const ypp = (f(x + e) - 2 * f(x) + f(x - e)) / (e * e);
      if (!close(ypp, (c * x - w * w) * f(x), 1e-4)) out.push(`linearOde: y″ ≠ (cx − ω²)y at ${x}`);
    }
  }
  const typed = (...xs: (NumOrVar | undefined)[]) =>
    xs.every((x) => x === undefined || val(x) !== undefined);
  const t = rep.tangent;
  if (t && typed(t.x, t.at)) {
    const x = get(t.x, 0);
    const e = 1e-6 * Math.max(1, Math.abs(x));
    const m = (f(x + e) - f(x - e)) / (2 * e);
    const s = num(t.slope);
    if (s !== undefined && !close(s, m, 1e-5)) out.push(`tangent: slope ${s}, f′(${x}) = ${m}`);
    const y = num(t.y);
    if (y !== undefined && !close(y, f(x))) out.push(`tangent: y ${y}, f(${x}) = ${f(x)}`);
    const L = num(t.value);
    if (L !== undefined && t.at !== undefined) {
      const want = f(x) + m * (get(t.at, x) - x);
      if (!close(L, want, 1e-5)) out.push(`tangent: L ${L}, the line gives ${want}`);
    }
  }
  const b = rep.band;
  if (b && typed(b.x, b.y, b.dx, b.dy)) {
    const [x, y, dx, dy] = [get(b.x, 0), get(b.y, 0), get(b.dx, 0), get(b.dy, 0)];
    if (!(dx > 0 && dy > 0)) out.push(`band: δ = ${dx}, ε = ${dy} (both positive)`);
    else
      for (const u of [x - dx, x + dx, x - dx / 2, x + dx / 2])
        if (Math.abs(f(u) - y) > dy * (1 + 1e-9) + 1e-12)
          out.push(`band: f(${u}) = ${f(u)} leaves ${y} ± ${dy}`);
  }
  const sr = rep.series;
  const inputs = sr
    ? [sr.center, sr.degree, sr.terms, sr.x, ...(sr.coefficients ?? []), ...(sr.derivatives ?? [])]
    : [];
  if (sr && typed(...inputs, sr.integral?.from, sr.integral?.to)) {
    if (sr.of === 'ode' && rep.family !== 'linearOde') out.push("series: 'ode' needs linearOde");
    const sp = seriesOf(rep, get);
    if (!sp) out.push('series: no coefficients, derivatives or of');
    else {
      const P = (x: number) => sp.cs.reduce((s, c, k) => s + c * (x - sp.a) ** k, 0);
      if (sr.x !== undefined) {
        const x = get(sr.x, 0);
        const v = num(sr.value);
        if (v !== undefined && !close(v, P(x))) out.push(`series: P(${x}) = ${P(x)}, page ${v}`);
        const er = num(sr.error);
        const want = Math.abs(f(x) - P(x));
        if (er !== undefined && Math.abs(er - want) > 1e-7 + 1e-5 * want)
          out.push(`series: error ${er}, |f − P| = ${want}`);
      }
      const I = sr.integral;
      const iv = num(I?.value);
      if (I && iv !== undefined) {
        const [p, q] = [get(I.from, 0), get(I.to, 1)];
        const n = 2000;
        const h = (q - p) / n;
        let s = P(p) + P(q);
        for (let i = 1; i < n; i++) s += (i % 2 ? 4 : 2) * P(p + i * h);
        if (!close(iv, (s * h) / 3)) out.push(`series: ∫P = ${(s * h) / 3}, page ${iv}`);
      }
    }
  }
  return out;
}

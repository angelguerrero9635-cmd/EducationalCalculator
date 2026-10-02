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

import type { Representation } from '../types';
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

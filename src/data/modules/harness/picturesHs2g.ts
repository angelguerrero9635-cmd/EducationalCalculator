/**
 * Harness checks for the round 2 group G options (H93–H95, H97–H99): sequences past 30 terms,
 * by a recursive rule and with a second lit term, and the function-graph, polynomial,
 * probability, unit-circle, statistics and complex-number options. Called from each kind's case
 * in `pictures.ts`.
 */
import { boxProduct, monomialModel } from '@/components/module/reps/algebraBox';
import { curveOf } from '@/components/module/reps/functionGraphMath';
import { termsModel } from '@/components/module/reps/termsModel';

import type { Representation } from '../types';

type Val = (x: string | number) => number | undefined;

export function hs2gIssues(rep: Representation, val: Val): string[] {
  const out: string[] = [];
  const get = (x: string | number | undefined) => (x === undefined ? undefined : val(x));
  const near = (a: number, b: number, tol = 1e-6) =>
    Math.abs(a - b) <= tol * Math.max(1, Math.abs(b));
  switch (rep.kind) {
    case 'termsChart': {
      if (rep.plus !== undefined && rep.type !== 'recursive')
        out.push('terms chart: `plus` is for a recursive rule');
      const a = get(rep.first);
      const d = get(rep.step);
      if (rep.powers && rep.type === 'geometric' && a !== undefined && d !== undefined && a !== d)
        out.push(`terms chart: powers need r = a₁ (${d} ≠ ${a})`);
      if (rep.powers && rep.type !== 'geometric') out.push('terms chart: powers need a geometric');
      const lit = get(rep.lit);
      if (rep.lit === undefined || lit === undefined) break;
      if (!Number.isInteger(lit) || lit < 1 || lit > 30)
        out.push(`terms chart: lit term ${lit} (whole, 1 to 30)`);
      const m = termsModel(rep, (x) => get(x));
      if (m.problem || lit < 1 || lit > m.terms.length) break;
      const want = m.terms[lit - 1]!;
      const typed = get(rep.litTerm);
      if (typed !== undefined && !near(typed, want))
        out.push(`terms chart: lit term ${lit} is ${want}, but the value is ${typed}`);
      break;
    }
    case 'functionGraph': {
      // H94: a horizontal factor on the families that take one, never 0.
      if (rep.horizontal !== undefined) {
        if (!['absolute', 'root', 'exponential', 'log'].includes(rep.family))
          out.push(`horizontal factor on a ${rep.family} graph`);
        if (get(rep.horizontal) === 0) out.push('horizontal factor b = 0 flattens the graph');
      }
      const [lo, hi] = [get(rep.restrict?.from), get(rep.restrict?.to)];
      if (lo !== undefined && hi !== undefined && lo > hi)
        out.push(`kept domain ${lo} to ${hi} is backwards`);
      if (!rep.abs && !rep.restrict && rep.horizontal === undefined) break;
      const c = curveOf(rep, (x) => get(x));
      const from = lo ?? (hi !== undefined ? hi - 40 : -20);
      const to = hi ?? from + 40;
      // y = a·f(b(x − h)) + k takes at h + t ÷ b the family's value at h + t.
      const b = get(rep.horizontal);
      if (b !== undefined && b !== 0 && !rep.abs && !rep.restrict) {
        const plainCurve = curveOf({ ...rep, horizontal: undefined }, (x) => get(x));
        const h = 'h' in rep && rep.h !== undefined ? (get(rep.h) ?? 0) : 0;
        for (const t of [0.5, 1, 2, 3.5, -0.5, -1, -2]) {
          const [want, got] = [plainCurve.f(h + t), c.f(h + t / b)];
          if (
            Number.isFinite(want) !== Number.isFinite(got) ||
            (Number.isFinite(want) && !near(got, want))
          )
            out.push(`horizontal factor: f at ${h + t / b} is ${got}, not ${want}`);
        }
      }
      const ys: number[] = [];
      for (let i = 0; i <= 200; i++) ys.push(c.f(from + ((to - from) * i) / 200));
      if (rep.abs && ys.some((y) => y < 0)) out.push('|f(x)| is below the x-axis');
      // Outside the kept domain nothing is drawn.
      if (lo !== undefined && Number.isFinite(c.f(lo - 0.5))) out.push(`drawn left of ${lo}`);
      if (hi !== undefined && Number.isFinite(c.f(hi + 0.5))) out.push(`drawn right of ${hi}`);
      // The kept part of a graph with its inverse is one-to-one: always rising or falling.
      if (rep.inverse && rep.restrict) {
        const fin = ys.filter(Number.isFinite);
        const steps = fin.slice(1).map((y, i) => y - fin[i]!);
        if (steps.some((d) => d > 1e-9) && steps.some((d) => d < -1e-9))
          out.push('the kept part is not one-to-one, so its inverse is not a function');
      }
      break;
    }
    case 'algebraTiles': {
      if (rep.mode === 'box') {
        // H95: up to a cubic across the top and a trinomial down the side; the product checked.
        if (rep.top.length < 1 || rep.top.length > 4 || rep.side.length < 1 || rep.side.length > 3)
          out.push(`area box ${rep.side.length} × ${rep.top.length} (1–3 rows, 1–4 columns)`);
        const top = rep.top.map(get);
        const side = rep.side.map(get);
        if (top.some((x) => x === undefined) || side.some((x) => x === undefined)) break;
        const want = boxProduct(top as number[], side as number[]);
        if (rep.product && rep.product.length !== want.length)
          out.push(`area box: ${rep.product.length} product terms, not ${want.length}`);
        (rep.product ?? []).forEach((id, i) => {
          const v = get(id);
          if (v !== undefined && !near(v, want[i]!))
            out.push(`area box: product term ${i + 1} is ${v}, not ${want[i]}`);
        });
      } else if (rep.mode === 'monomial') {
        const [a, m, b, n] = [rep.a, rep.m, rep.b, rep.n].map(get);
        if ([a, m, b, n].some((x) => x === undefined)) break;
        for (const e of [m!, n!])
          if (!Number.isInteger(e) || Math.abs(e) > 10)
            out.push(`exponent ${e} (whole, −10 to 10)`);
        const model = monomialModel(a!, m!, b!, n!);
        if (model.over - model.under !== model.k) out.push('the factors left are not m − n');
        const [c, k] = [get(rep.c), get(rep.k)];
        if (c !== undefined && Number.isFinite(model.c) && !near(c, model.c))
          out.push(`monomial: c ${c} is not a ÷ b = ${model.c}`);
        if (k !== undefined && k !== model.k)
          out.push(`monomial: k ${k} is not m − n = ${model.k}`);
      }
      break;
    }
    default:
      break;
  }
  return out;
}

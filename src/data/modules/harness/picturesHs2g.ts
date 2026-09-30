/**
 * Harness checks for the round 2 group G options (H93–H95, H97–H99): sequences past 30 terms,
 * by a recursive rule and with a second lit term, and the function-graph, polynomial,
 * probability, unit-circle, statistics and complex-number options. Called from each kind's case
 * in `pictures.ts`.
 */
import { boxProduct, monomialModel } from '@/components/module/reps/algebraBox';
import { curveOf } from '@/components/module/reps/functionGraphMath';
import { choose } from '@/components/module/reps/statMath';
import { shadedChance } from '@/components/module/reps/stats';
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
    case 'venn': {
      // H97: counts out of a total.
      const v = 'chances' in rep ? rep.chances : undefined;
      if (!v?.counts) break;
      const [a, b, both, N] = [v.a, v.b, v.both, v.counts.total].map(get);
      if ([a, b, both, N].some((x) => x === undefined)) break;
      for (const x of [a!, b!, both!, N!])
        if (!Number.isInteger(x) || x < 0) out.push(`Venn count ${x} is not a whole number`);
      if (both! > Math.min(a!, b!)) out.push(`both = ${both} is more than A or B`);
      if (a! + b! - both! > N!) out.push(`A or B = ${a! + b! - both!} is more than the total ${N}`);
      if (!v.shade || !(N! > 0)) break;
      const want = shadedChance(v.shade, a! / N!, b! / N!, v.exclusive ? 0 : both! / N!);
      const [count, r] = [get(v.counts.count), get(v.result)];
      if (count !== undefined && !near(count, want * N!))
        out.push(`shaded ${v.shade} holds ${want * N!}, count shows ${count}`);
      if (r !== undefined && !near(r, want))
        out.push(`shaded ${v.shade} is ${want}, result shows ${r}`);
      break;
    }
    case 'treeDiagram': {
      // H97: a third stage.
      const t = 'chances' in rep ? rep.chances : undefined;
      if (!t?.third) break;
      const [A, B, C] = [t.names[0].length, t.names[1].length, t.thirdNames?.length ?? 0];
      if (C < 2 || C > 3) out.push(`${C} third-stage outcomes (2 or 3)`);
      if (A * B * C > 12) out.push(`${A * B * C} leaves (at most 12)`);
      if (t.third.length !== A || t.third.some((r) => r.length !== B))
        out.push(`third-stage chances are not ${A} × ${B} lists`);
      const full = (xs: (number | undefined)[], k: number) =>
        xs.every((x) => x !== undefined)
          ? xs.length === k - 1
            ? [...(xs as number[]), 1 - (xs as number[]).reduce((p, q) => p + q, 0)]
            : (xs as number[])
          : undefined;
      const pC = t.third.map((r) => r.map((xs) => full(xs.map(get), C)));
      for (const xs of pC.flat()) {
        if (!xs) continue;
        if (xs.length !== C) out.push(`${xs.length} third chances for ${C} outcomes`);
        else if (
          xs.some((p) => p < -1e-9 || p > 1 + 1e-9) ||
          !near(
            xs.reduce((p, q) => p + q, 0),
            1,
          )
        )
          out.push(`third-stage branches ${xs.join(', ')} don't add to 1`);
      }
      if (t.path3 !== undefined && !(t.path3 >= 0 && t.path3 < C))
        out.push(`no third outcome ${t.path3}`);
      if (!t.path || t.path3 === undefined || !t.chance) break;
      const [i, j] = t.path;
      const pa = full(t.first.map(get), A)?.[i];
      const pb = full((t.second[i] ?? []).map(get), B)?.[j];
      const pc = pC[i]?.[j]?.[t.path3];
      const x = get(t.chance);
      if (pa !== undefined && pb !== undefined && pc !== undefined && x !== undefined) {
        const want = pa * pb * pc;
        if (!near(x, want)) out.push(`path chance shows ${x}, the three branches give ${want}`);
      }
      break;
    }
    case 'pascalTriangle': {
      // H97: C(a, r) over C(n, r).
      const f = rep.fraction;
      if (!f) break;
      const [n, k, fn, fk] = [rep.n, rep.k, f.n, f.k].map(get);
      if ([n, k, fn, fk].some((x) => x === undefined)) break;
      if (fn! > n!) out.push(`the top count's row ${fn} is past row ${n}`);
      if (fk! > fn! || fk! < 0) out.push(`C(${fn}, ${fk}) has no entry ${fk}`);
      const top = fk! <= fn! ? choose(fn!, fk!) : 0;
      const bottom = choose(n!, k!);
      const [count, chance] = [get(f.count), get(f.chance)];
      if (count !== undefined && count !== top)
        out.push(`top count ${count} is not C(${fn}, ${fk}) = ${top}`);
      if (chance !== undefined && bottom > 0 && !near(chance, top / bottom))
        out.push(`chance ${chance} is not ${top} ÷ ${bottom}`);
      break;
    }
    default:
      break;
  }
  return out;
}

/**
 * Picture checks for college round 3, group A (docs/RENDERINGS_HE.md), `functionGraph`:
 * HC42 the marked speeds are the formulas' and vₚ < ⟨v⟩ < vᵣₘₛ, the curve peaks at vₚ and its
 * area is 1 (an independent sum); λ_max = b ÷ T is where Planck's curve peaks (0.1%) and equals
 * the page's; the page's occupancies are the formulas' and FD ≤ 1. HC45 each drawn Newton
 * iterate and bisection midpoint equals the walkthrough's; the solver's last y equals the
 * page's (an independent loop); the trapezoid or Simpson sum equals the page's (an independent
 * sum); the nodes lie on the curve. HC92 the lit code is ⌊V_in ÷ LSB⌋ and equals the page's D,
 * the voltage back is D × LSB. Called from `repIssues` in `pictures.ts`. Test-only.
 */
import { fieldFn } from '@/components/module/reps/fieldPlotMath';
import {
  KB_DEFAULT,
  R_DEFAULT,
  WIEN_DEFAULT,
  bisectBrackets,
  newtonIterates,
  planckAt,
  quantizerNumbers,
} from '@/components/module/reps/functionGraphHe3a';
import { curveOf, type Get } from '@/components/module/reps/functionGraphMath';

import type { Representation } from '../types';
import { familyVars } from '../typesFunctionGraph';
import type { NumOrVar } from '../typesGraphs';

type Val = (x: string | number) => number | undefined;

const close = (a: number, b: number, rel: number) =>
  Math.abs(a - b) <= rel * Math.max(1e-12, Math.abs(a), Math.abs(b));

export function he3aGraphIssues(rep: Representation, val: Val): string[] {
  if (rep.kind !== 'functionGraph') return [];
  const fam = rep.family;
  const on =
    fam === 'distribution' ||
    fam === 'quantizer' ||
    fam === 'lagrange' ||
    rep.newton ||
    rep.bisect ||
    rep.steps ||
    rep.through ||
    rep.riemann?.side === 'trapezoid' ||
    rep.riemann?.side === 'simpson';
  if (!on) return [];
  const out: string[] = [];
  if (familyVars(rep).some((id) => val(id) === undefined)) return out;
  const get: Get = (v: NumOrVar | undefined, d: number) => (v === undefined ? d : (val(v) ?? d));
  const num = (id: string | undefined) => (id === undefined ? undefined : val(id));
  const typed = (...xs: (NumOrVar | undefined)[]) =>
    xs.every((x) => x === undefined || val(x) !== undefined);
  const page = (id: string | undefined, want: number, what: string, rel = 1e-3) => {
    const v = num(id);
    if (v !== undefined && !close(v, want, rel))
      out.push(`${what}: page ${v}, the picture ${want}`);
  };
  const f = curveOf(rep, val).f;

  if (rep.family === 'distribution' && rep.distribution === 'maxwell') {
    const R = get(rep.R, R_DEFAULT);
    const M = get(rep.molar, 28) / 1000;
    const T = get(rep.T, 300);
    const vp = Math.sqrt((2 * R * T) / M);
    const avg = Math.sqrt((8 * R * T) / (Math.PI * M));
    const rms = Math.sqrt((3 * R * T) / M);
    if (!(vp < avg && avg < rms)) out.push('maxwell: vₚ < ⟨v⟩ < vᵣₘₛ fails');
    page(rep.speeds?.vp, vp, 'maxwell vₚ');
    page(rep.speeds?.avg, avg, 'maxwell ⟨v⟩');
    page(rep.speeds?.rms, rms, 'maxwell vᵣₘₛ');
    // The drawn curve (scaled) integrates to the scale; it peaks at vₚ.
    const scale = rep.yScale ?? 1000;
    let area = 0;
    const top = 12 * rms;
    const n = 20000;
    for (let i = 0; i < n; i++) area += f(((i + 0.5) * top) / n) * (top / n);
    if (!close(area / scale, 1, 1e-3)) out.push(`maxwell: area ${area / scale}, not 1`);
    if (!(f(vp) > f(vp * 0.99) && f(vp) > f(vp * 1.01))) out.push('maxwell: no peak at vₚ');
  }
  if (rep.family === 'distribution' && rep.distribution === 'planck') {
    const per = rep.unit === 'nm' ? 1000 : 1;
    const b = get(rep.wien, WIEN_DEFAULT);
    for (const tv of [rep.T, ...(rep.others ?? [])]) {
      const T = get(tv, 5800);
      // Golden-section search for the peak, in μm.
      let [lo, hi] = [b / T / 3, (3 * b) / T];
      for (let i = 0; i < 200; i++) {
        const m1 = hi - (hi - lo) / 1.618;
        const m2 = lo + (hi - lo) / 1.618;
        if (planckAt(m1, T, b) > planckAt(m2, T, b)) hi = m2;
        else lo = m1;
      }
      if (!close((lo + hi) / 2, b / T, 1e-3))
        out.push(`planck: the peak at ${(lo + hi) / 2} μm, b ÷ T = ${b / T}`);
    }
    page(rep.peak, (b / get(rep.T, 5800)) * per, 'planck λ_max');
  }
  if (rep.family === 'distribution' && rep.distribution === 'occupancy') {
    const x =
      rep.x !== undefined
        ? val(rep.x)
        : typed(rep.energy, rep.T, rep.kB) && rep.energy !== undefined && rep.T !== undefined
          ? get(rep.energy, 0) / (get(rep.kB, KB_DEFAULT) * get(rep.T, 300))
          : undefined;
    if (x !== undefined) {
      page(rep.fd, 1 / (Math.exp(x) + 1), 'occupancy f_FD');
      if (x > 0) page(rep.be, 1 / (Math.exp(x) - 1), 'occupancy f_BE');
      page(rep.mb, Math.exp(-x), 'occupancy f_MB');
      if (f(x) > 1) out.push('occupancy: Fermi–Dirac above 1');
    }
  }
  if (rep.family === 'quantizer') {
    const q = quantizerNumbers(rep, get, (v) => v === undefined || val(v) !== undefined);
    page(rep.lsb, q.lsb, 'quantizer LSB');
    if (q.D !== undefined) {
      if (!q.dac) {
        const want = Math.floor(q.vin! / (q.vref / 2 ** q.n) + (q.round ? 0.5 : 1e-9));
        if (want !== q.D) out.push(`quantizer: lit code ${q.D}, ⌊V_in ÷ LSB⌋ = ${want}`);
        page(typeof rep.code === 'string' ? rep.code : undefined, q.D, 'quantizer D', 1e-9);
        if (f(q.vin!) !== q.D) out.push(`quantizer: the staircase at V_in reads ${f(q.vin!)}`);
      }
      page(rep.back, q.D * q.lsb, 'quantizer voltage back');
    }
  }
  const nw = rep.newton;
  if (nw && typed(nw.x0, nw.steps)) {
    const it = newtonIterates(f, get(nw.x0, 1), get(nw.steps, 1));
    // Independently: Newton with a forward difference of the curve.
    let x = get(nw.x0, 1);
    for (let k = 1; k < it.length; k++) {
      const e = 1e-5 * Math.max(1, Math.abs(x));
      x -= f(x) / ((f(x + e) - f(x - e)) / (2 * e));
      if (Math.abs(it[k]! - x) > 1e-6 * Math.max(1, Math.abs(x)))
        out.push(`newton: x${k} drawn ${it[k]}, worked ${x}`);
    }
    page(nw.next, it[it.length - 1]!, 'newton last iterate', 1e-4);
  }
  const bs = rep.bisect;
  if (bs && typed(bs.a, bs.b, bs.steps)) {
    const [a, b] = [get(bs.a, 0), get(bs.b, 1)];
    if (Math.sign(f(a)) === Math.sign(f(b))) out.push('bisect: no sign change on [a, b]');
    const br = bisectBrackets(f, a, b, get(bs.steps, 1));
    br.forEach((q) => {
      if (!close(q.m, (q.a + q.b) / 2, 1e-12)) out.push(`bisect: midpoint ${q.m}`);
    });
    page(bs.mid, br[br.length - 1]!.m, 'bisect last midpoint', 1e-9);
  }
  const st = rep.steps;
  if (st && typed(st.h, st.n, st.y0, st.x0)) {
    const g = fieldFn(st.dy, get);
    const h = get(st.h, 0.1);
    let [x, y] = [get(st.x0, 0), get(st.y0, 1)];
    for (let i = 0; i < Math.round(get(st.n, 1)); i++) {
      const k1 = g(x, y);
      if (st.method === 'euler') y = y + h * k1;
      else if (st.method === 'heun') y = y + (h * (k1 + g(x + h, y + h * k1))) / 2;
      else {
        const k2 = g(x + h / 2, y + (h * k1) / 2);
        const k3 = g(x + h / 2, y + (h * k2) / 2);
        y = y + (h * (k1 + 2 * k2 + 2 * k3 + g(x + h, y + h * k3))) / 6;
      }
      x += h;
    }
    page(st.last, y, `steps (${st.method}) yₙ`, 1e-4);
  }
  const r = rep.riemann;
  if (r && (r.side === 'trapezoid' || r.side === 'simpson') && typed(r.n, r.from, r.to)) {
    let n = Math.round(get(r.n, 4));
    if (r.side === 'simpson' && n % 2) out.push(`simpson: n = ${n} is odd`);
    if (r.side === 'simpson' && n % 2) n += 1;
    const [a, b] = [get(r.from, 0), get(r.to, 1)];
    const h = (b - a) / n;
    let s = 0;
    for (let i = 0; i <= n; i++) {
      const w = i === 0 || i === n ? 1 : r.side === 'simpson' ? (i % 2 ? 4 : 2) : 2;
      s += w * f(a + i * h);
    }
    const sum = r.side === 'simpson' ? (s * h) / 3 : (s * h) / 2;
    page(r.sum, sum, `${r.side} sum`, 1e-6);
  }
  if (rep.through && rep.through.every((q) => typed(q.x, q.y)))
    for (const q of rep.through) {
      const [x, y] = [get(q.x, 0), get(q.y, 0)];
      if (!close(f(x), y, 1e-6) && Math.abs(f(x) - y) > 1e-9)
        out.push(`through: (${x}, ${y}) is off the curve (${f(x)})`);
    }
  return out;
}

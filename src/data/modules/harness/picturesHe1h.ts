/**
 * Picture checks for the college pictures of round 1, group H: the passive-circuit schematic
 * (HC7). Each labelled value must be the one the drawn circuit makes: the DC circuits are solved
 * (modified nodal analysis), then KCL at every drawn node and KVL round every drawn loop are
 * summed with the page's own values in place, to 0.1%. Test-only.
 */
import type { VariableDef } from '@/engine/types';

import {
  DC,
  kindsOf,
  lowpassOf,
  netlistOf,
  siFactor,
  solveNet,
  superpositionOf,
  theveninOf,
} from '@/components/module/reps/netMath';

import {
  forced,
  freeVibration,
  transmissibility,
  twoModes,
} from '@/components/module/reps/oscMath';

import type { OscillatorSpec } from '../typesHs3a';
import { oscillatorHe, type CircuitNet, type CircuitNetSpec } from '../typesHe1h';

type Val = (id: string) => number | undefined;

/**
 * HC11: the oscillator's college options. ω_d < ω_n; ω_n, ζ, ω_d and c_cr as the page writes
 * them; the marked x(t) on the trace; x(0) = A cos φ (and the slope v₀); the crests follow the
 * envelope and their ratio matches δ; the forced point lies on X ÷ δ_st (and its lag); TR at r;
 * each mode's ω² a root of det(K − ω²M) and its ratio; k_eq. `val` reads formula units.
 */
export function oscillatorIssues(
  rep: OscillatorSpec,
  val: Val,
  byId: Map<string, VariableDef>,
): string[] {
  const out: string[] = [];
  if (rep.mode === 'hang' || !oscillatorHe(rep)) return out;
  const si = (x: string | number | undefined): number | undefined => {
    if (x === undefined || typeof x === 'number') return x;
    const raw = val(x);
    return raw === undefined ? undefined : raw * siFactor(byId.get(x)?.unit);
  };
  // `floor`: the absolute slack (a position read off a trace: 0.1% of its swing).
  const same = (
    id: string | undefined,
    want: number | undefined,
    what: string,
    floor = 1e-9 * Math.max(1, Math.abs(want ?? 0)),
  ) => {
    const x = si(id);
    if (id === undefined || x === undefined || want === undefined || !Number.isFinite(want)) return;
    if (!near(x, want, floor))
      out.push(`oscillator: ${what} ${id} = ${x}, the picture draws ${want}`);
  };
  const [m, k] = [si(rep.mass), si(rep.spring)];
  const { damping: d, phase: p, forcing: f, transmit: t, coupled: c, springs: s } = rep;
  if (m !== undefined && k !== undefined && (m <= 0 || k <= 0))
    out.push('oscillator: a mass or spring constant of 0 or less');
  const ok = m !== undefined && k !== undefined && m > 0 && k > 0;
  const wn = ok ? Math.sqrt(k / m) : NaN;

  if (d && ok) {
    const cc = si(d.c);
    if (cc !== undefined) {
      if (cc < 0) out.push(`oscillator: damping ${cc} is negative`);
      const x0 = si(d.x0 ?? rep.amplitude) ?? 0;
      const v0 = si(d.v0) ?? 0;
      const fv = freeVibration(m, cc, k, x0, v0);
      const swing = Math.max(Math.abs(x0), Math.abs(v0) / wn);
      same(d.natural, wn, 'ω_n');
      same(d.zeta, fv.zeta, 'ζ = c ÷ (2√(km))');
      same(d.critical, 2 * Math.sqrt(k * m), 'c_cr = 2√(km)');
      if (fv.regime === 'under' || fv.regime === 'none') {
        same(d.damped, fv.wd, 'ω_d');
        if (fv.wd > wn * (1 + 1e-12) || (fv.zeta > 1e-6 && !(fv.wd < wn)))
          out.push(`oscillator: ω_d ${fv.wd} is not less than ω_n ${wn}`);
        // Each crest sits on the envelope, and n cycles shrink it by e^(−nδ).
        const delta = (2 * Math.PI * fv.zeta) / Math.sqrt(1 - fv.zeta ** 2);
        // (Only where the crests are numbers: a swing of 0, or one gone in a cycle, has none.)
        const crests = swing > 0 && delta < 20 ? fv.crests(4) : [];
        for (const tc of crests)
          if (!near(fv.x(tc), fv.envelope!(tc) * Math.cos(Math.atan2(fv.zeta * wn, fv.wd)), 1e-12))
            out.push(`oscillator: the crest at t = ${tc} is off the envelope`);
        if (
          crests.length > 1 &&
          delta > 1e-6 &&
          !near(Math.log(fv.x(crests[0]!) / fv.x(crests[1]!)), delta)
        )
          out.push('oscillator: the crests’ ratio does not match δ');
        same(d.decrement, delta, 'δ');
        const n = si(d.cycles);
        const end = si(d.end);
        if (n !== undefined && end !== undefined && x0 > 0)
          same(d.decrement, Math.log(x0 / end) / n, 'δ = (1/n) ln(x₀/xₙ)');
      } else if (d.damped) same(d.damped, 0, 'ω_d (not underdamped)');
      const tt = si(d.t);
      if (tt !== undefined) same(d.x, fv.x(tt), 'x at the marked t', 1e-3 * swing);
    }
  }

  if (p && ok) {
    const [x0, v0] = [si(p.x0), si(p.v0)];
    if (x0 !== undefined && v0 !== undefined) {
      const A = Math.hypot(x0, v0 / wn);
      const phi = Math.atan2(-v0 / wn, x0);
      same(p.omega, wn, 'ω');
      same(p.amplitude, A, 'A');
      same(p.phase, phi, 'φ');
      const [Ap, phip] = [si(p.amplitude) ?? A, si(p.phase) ?? phi];
      if (!near(Ap * Math.cos(phip), x0, 1e-12)) out.push('oscillator: x(0) ≠ A cos φ');
      if (!near(-Ap * wn * Math.sin(phip), v0, 1e-12)) out.push('oscillator: the slope at 0 ≠ v₀');
      const tt = si(p.t);
      if (tt !== undefined) same(p.x, A * Math.cos(wn * tt + phi), 'x at the marked t', 1e-3 * A);
    }
  }

  if (f && ok) {
    const w = si(f.omega);
    const F0 = si(f.force);
    const cc = d ? si(d.c) : 0;
    const zeta =
      f.zeta !== undefined
        ? si(f.zeta)
        : cc === undefined
          ? undefined
          : cc / (2 * Math.sqrt(k * m));
    if (w !== undefined && zeta !== undefined) {
      const r = w / wn;
      const fr = forced(r, zeta);
      same(f.ratio, r, 'r = ω/ω_n');
      if (F0 !== undefined) same(f.response, (F0 / k) * fr.mag, 'X on the response curve');
      const unit = f.lag ? byId.get(f.lag)?.unit : undefined;
      same(f.lag, unit === '°' ? (fr.lag * 180) / Math.PI : fr.lag, 'phase lag');
    }
  }

  if (t) {
    const [r, z] = [si(t.ratio), si(t.zeta)];
    if (r !== undefined && z !== undefined) same(t.value, transmissibility(r, z), 'TR at r');
  }

  if (c) {
    const [m1, m2, k1, k2] = [si(c.m1), si(c.m2 ?? c.m1), si(c.k1), si(c.k2)];
    const k3 = c.layout === 'chain' ? 0 : si(c.k3 ?? c.k1);
    if ([m1, m2, k1, k2, k3].every((x) => x !== undefined && x >= 0)) {
      const md = twoModes(m1!, m2!, k1!, k2!, k3!);
      same(c.slow, md.w[0], 'ω₁');
      same(c.fast, md.w[1], 'ω₂');
      same(c.ratios?.[0], md.ratios[0], 'x₂/x₁ (slow)');
      same(c.ratios?.[1], md.ratios[1], 'x₂/x₁ (fast)');
      for (const id of [c.slow, c.fast]) {
        const w = si(id);
        if (w !== undefined && Math.abs(md.residual(w * w)) > 1e-3)
          out.push(`oscillator: ω² = ${w * w} is not an eigenvalue of the drawn spring matrix`);
      }
      same(c.exchange, (2 * Math.PI) / (md.w[1] - md.w[0]), 'T_ex = 2π ÷ (ω₂ − ω₁)');
    }
  }

  if (s) {
    const [k1, k2] = [si(s.k1), si(s.k2)];
    if (k1 !== undefined && k2 !== undefined)
      same(s.total, s.layout === 'series' ? (k1 * k2) / (k1 + k2) : k1 + k2, 'k_eq');
  }
  return out;
}

/** Within 0.1% of the larger, or both within `floor` of 0. */
const near = (a: number, b: number, floor = 1e-12) =>
  Math.abs(a - b) <= Math.max(1e-3 * Math.max(Math.abs(a), Math.abs(b)), floor);

/** The schematic's checks; `val` reads the page's values in formula units. */
export function netIssues(rep: CircuitNetSpec, val: Val, byId: Map<string, VariableDef>): string[] {
  const out: string[] = [];
  const net: CircuitNet = rep.net;
  const si = (x: string | number | undefined): number | undefined => {
    if (x === undefined || typeof x === 'number') return x;
    const raw = val(x);
    return raw === undefined ? undefined : raw * siFactor(byId.get(x)?.unit);
  };
  const same = (id: string | undefined, want: number | undefined, what: string, floor = 1e-9) => {
    const x = si(id);
    if (id === undefined || x === undefined || want === undefined || !Number.isFinite(want)) return;
    if (!near(x, want, floor * Math.max(1, Math.abs(want))))
      out.push(`${rep.kind} net ${net.topology}: ${what} ${id} = ${x}, the circuit makes ${want}`);
  };
  const list = netlistOf(net);
  const kinds = kindsOf(net, list);
  const values = list.edges.map((ed) =>
    ed.el < 0 ? si(net.internal?.r) : si(net.elements[ed.el]!.id),
  );
  const known = values.every((x) => x !== undefined && Number.isFinite(x));
  const value = values.map((x) => x ?? NaN);
  const P = net.topology;

  for (const el of net.elements)
    if (el.kind !== 'V' && el.kind !== 'I') {
      const x = si(el.id);
      if (x !== undefined && x < 0) out.push(`net ${P}: ${el.kind} ${String(el.id)} = ${x} < 0`);
    }

  if (DC.has(P) && known) {
    const s = solveNet(list.nodes, list.edges, kinds, value);
    if (!s) return [...out, `net ${P}: the circuit has no single solution`];
    (net.nodes ?? []).forEach((id, k) => same(id, s.v[list.nodeAt[k]!], `node ${k + 1}`));
    (net.branches ?? []).forEach((id, k) => same(id, s.i[list.branchAt[k]!], `branch ${k + 1}`));
    (net.meshes ?? []).forEach((id, k) => same(id, s.i[list.meshAt[k]!], `mesh ${k + 1}`));
    list.edges.forEach((ed, k) => {
      if (ed.el < 0) return;
      const el = net.elements[ed.el]!;
      // A source's voltage is its rise; a passive part's, its drop.
      same(el.v, el.kind === 'V' ? -s.drop[k]! : s.drop[k]!, `voltage on element ${ed.el + 1}`);
      if (el.kind === 'C') same(el.q, s.i[k], `charge on element ${ed.el + 1}`);
      else same(el.i, s.i[k], `current in element ${ed.el + 1}`);
      if (el.p) same(el.p, s.drop[k]! * s.i[k]!, `power in element ${ed.el + 1}`);
    });
    if (net.internal?.terminal) {
      const r = list.edges.findIndex((ed) => ed.el < 0);
      same(net.internal.terminal, s.v[list.edges[r]!.b], 'terminal voltage');
    }
    // KCL at every node and KVL round every loop, the page's values in place of the solver's.
    const cur = s.i.map((x, k) => {
      const ed = list.edges[k]!;
      if (ed.el < 0) return x;
      const el = net.elements[ed.el]!;
      const b = list.branchAt.indexOf(k);
      return si(el.kind === 'C' ? el.q : el.i) ?? (b >= 0 ? si(net.branches?.[b]) : undefined) ?? x;
    });
    const pot = s.v.map((x, n) => {
      const k = list.nodeAt.indexOf(n);
      return (k >= 0 ? si(net.nodes?.[k]) : undefined) ?? x;
    });
    const scale = Math.max(1e-30, ...cur.map(Math.abs));
    for (let n = 1; n < list.nodes; n++) {
      let sum = 0;
      list.edges.forEach((ed, k) => {
        if (ed.a === n) sum -= cur[k]!;
        if (ed.b === n) sum += cur[k]!;
      });
      if (Math.abs(sum) > 1e-3 * scale) out.push(`net ${P}: KCL at node ${n} sums to ${sum}`);
    }
    const vScale = Math.max(1e-30, ...pot.map(Math.abs));
    list.loops.forEach((loop, j) => {
      const sum = loop.reduce((acc, [k, dir]) => {
        const ed = list.edges[k]!;
        return acc + dir * (pot[ed.a]! - pot[ed.b]!);
      }, 0);
      if (Math.abs(sum) > 1e-3 * vScale) out.push(`net ${P}: KVL round loop ${j + 1} is ${sum}`);
    });
    if (P === 'thevenin' && net.equivalent) {
      const th = theveninOf(list, kinds, value);
      same(net.equivalent.v, th?.v, 'V_Th');
      same(net.equivalent.r, th?.r, 'R_Th');
      same(net.equivalent.norton, th?.isc, 'I_N');
    }
    if (P === 'superposition' && net.parts) {
      const parts = superpositionOf(list, kinds, value);
      same(net.parts[0], parts?.[0], 'V′');
      same(net.parts[1], parts?.[1], 'V″');
      if (parts) same(net.nodes?.[0], parts[0] + parts[1], 'V′ + V″');
    }
    if ((P === 'seriesParallel' || P === 'parallelSeries') && net.total) {
      const src = s.i[0]!;
      const E = value[0]!;
      const allC = net.elements.slice(1).every((x) => x.kind === 'C');
      same(net.total, allC ? src / E : E / src, 'equivalent');
    }
  }

  // A switched loop at one moment: the source's rise is the drops round the loop.
  if ((P === 'rc' || P === 'rl' || P === 'rlc') && net.elements[0]?.kind === 'V') {
    const E = si(net.elements[0].id);
    const i = net.elements.map((x) => si(x.i)).find((x) => x !== undefined);
    const drops = net.elements.slice(1).map((x) => {
      const v = si(x.v);
      if (v !== undefined) return v;
      const R = si(x.id);
      return x.kind === 'R' && i !== undefined && R !== undefined ? i * R : undefined;
    });
    if (E !== undefined && drops.every((x) => x !== undefined)) {
      const sum = (drops as number[]).reduce((a, b) => a + b, 0);
      if (!near(sum, E, 1e-9)) out.push(`net ${P}: the drops add to ${sum}, the source is ${E}`);
    }
  }

  if (P === 'element') {
    const el = net.elements[0];
    const [v, i] = [si(el?.v ?? el?.id), si(el?.i)];
    if (el?.p && v !== undefined && i !== undefined) same(el.p, v * i, 'power absorbed');
  }

  if (P === 'norton') {
    const [V, R, I] = net.elements.map((x) => si(x.id));
    if (V !== undefined && R !== undefined && I !== undefined && !near(V, I * R))
      out.push(`net norton: V_Th = ${V} but I_N R_Th = ${I * R}`);
  }

  if (P === 'bridge' && net.bridge) {
    const b = net.bridge;
    const [E, GF, eps] = [si(net.elements[0]?.id), si(b.factor), strainOf(b, val, byId)];
    if (E !== undefined && GF !== undefined && eps !== undefined)
      same(b.out, (E * GF * eps) / 4, 'V_out (quarter bridge)');
  }

  if (P === 'lowpass' && net.filter) {
    const [R, C, f] = [si(net.elements[1]?.id), si(net.elements[2]?.id), si(net.filter.frequency)];
    if (R !== undefined && C !== undefined) {
      const lp = lowpassOf(R, C, f ?? 0);
      same(net.filter.cutoff, lp.fc, 'f_c');
      if (f !== undefined) {
        same(net.filter.gain, lp.gain, '|H|');
        same(net.filter.db, lp.db, 'gain in dB', 1e-3);
      }
    }
  }
  return out;
}

/** A bridge's strain as a ratio: its value times `strainUnit`, or its unit (με = 10⁻⁶). */
export function strainOf(
  b: NonNullable<CircuitNet['bridge']>,
  val: Val,
  byId: Map<string, VariableDef>,
): number | undefined {
  const x = typeof b.strain === 'number' ? b.strain : val(b.strain);
  if (x === undefined) return undefined;
  const unit = typeof b.strain === 'string' ? byId.get(b.strain)?.unit : undefined;
  return x * (b.strainUnit ?? siFactor(unit));
}

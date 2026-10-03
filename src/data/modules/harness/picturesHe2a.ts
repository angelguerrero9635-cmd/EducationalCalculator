/**
 * Picture checks for college round 2, group A (`typesHe2a.ts`): HC14 `complexPlane` on
 * electrical pages and HC22 `bode`. What the picture draws must agree with the page's values.
 * Called from `repIssues` in `pictures.ts` with a reader of formula units (`siOf`). Test-only.
 */
import {
  asymptoteDb,
  bodeAt,
  bodeTfOf,
  gainCrossover,
  phaseCrossover,
} from '@/components/module/reps/bodeMath';
import {
  breakawayPoints,
  cabs,
  centroidOf,
  closedLoopPoles,
  onRealLocus,
  phasorAngle,
  phasorLayout,
  phasorVector,
  polyAdd,
  polyAt,
  polyDiff,
  polyMul,
  polyOf,
  withConjugates,
  type Cx,
  type PhasorValue,
} from '@/components/module/reps/complexPlaneHe2aMath';

import type { BodeSpec, PlanePointHe2a } from '../typesHe2a';
import type { ComplexPlaneSpec } from '../typesHsd';

type Val = (id: string) => number | undefined;
type X = number | string | undefined;

const read = (val: Val, x: X) => (x === undefined ? undefined : typeof x === 'number' ? x : val(x));
const near = (a: number, b: number, rel = 1e-3, abs = 1e-9) =>
  Math.abs(a - b) <= rel * Math.max(Math.abs(a), Math.abs(b)) + abs;
const RAD = Math.PI / 180;
/** The difference of two angles, in (−180°, 180°]. */
const angleGap = (a: number, b: number) => ((((a - b) % 360) + 540) % 360) - 180;

/** HC14: the electrical options of `complexPlane`. */
export function complexPlaneHe2aIssues(rep: ComplexPlaneSpec, val: Val): string[] {
  const out: string[] = [];
  const get = (x: X) => read(val, x);
  // z by its parts: its size and angle, and X = X_L − X_C.
  if (!rep.phasors && !rep.poles && !rep.zeros && !rep.locus) {
    let z: Cx | undefined;
    if ('modulus' in rep.z) {
      const [r, t] = [get(rep.z.modulus), get(rep.z.argument)];
      if (r !== undefined && t !== undefined)
        z = { re: r * Math.cos(t * RAD), im: r * Math.sin(t * RAD) };
    } else {
      const [a, b] = [get(rep.z.re), get(rep.z.im)];
      if (a !== undefined && b !== undefined) z = { re: a, im: b };
      const [xl, xc] = [get(rep.reactances?.inductive), get(rep.reactances?.capacitive)];
      if (b !== undefined && xl !== undefined && xc !== undefined && !near(b, xl - xc, 1e-3, 1e-6))
        out.push(`the jX leg is ${b}, but X_L − X_C = ${xl - xc}`);
    }
    if (z) {
      const m = get(rep.zMag);
      if (m !== undefined && !near(m, cabs(z), 1e-3, 1e-6))
        out.push(`|z| is ${m}, the arrow is ${cabs(z)} long`);
      const t = get(rep.zAngle);
      if (t !== undefined && cabs(z) > 1e-9) {
        const want = Math.atan2(z.im, z.re) / RAD;
        if (Math.abs(angleGap(t, want)) > 0.05)
          out.push(`the angle is ${t}°, the arrow is at ${want}°`);
        if (t <= -180 - 1e-9 || t > 180 + 1e-9)
          out.push(`the angle ${t}° is outside −180° to 180°`);
      }
    }
  }
  // Phasors: each arrow as long as its magnitude (times its unit's scale) at its angle, and a
  // tip-to-tail phasor ending on the tip it names.
  if (rep.phasors) {
    const vals: PhasorValue[] = [];
    for (const p of rep.phasors) {
      const [m, a] = [get(p.mag), get(p.angle)];
      if (m === undefined || a === undefined) continue;
      if (m < 0) out.push(`phasor ${p.name} has a negative magnitude ${m}`);
      if (p.tail && !rep.phasors.some((q) => q.name === p.tail))
        out.push(`phasor ${p.name} tails on ${p.tail}, which is not drawn`);
      vals.push({
        name: p.name,
        mag: m,
        angle: phasorAngle(a, p.negate, p.offset),
        unit: p.unit,
        tail: p.tail,
        ends: p.ends,
      });
    }
    const lay = phasorLayout(vals);
    const byName = new Map(vals.map((v) => [v.name, v]));
    for (const v of vals) {
      const l = lay.get(v.name)!;
      const d = { re: l.to.re - l.from.re, im: l.to.im - l.from.im };
      if (!near(cabs(d), v.mag * l.scale, 1e-6, 1e-9))
        out.push(`phasor ${v.name} is drawn ${cabs(d)} long, not ${v.mag * l.scale}`);
      if (v.mag > 1e-9 && Math.abs(angleGap(Math.atan2(d.im, d.re) / RAD, v.angle)) > 0.01)
        out.push(`phasor ${v.name} is drawn at the wrong angle`);
      if (v.ends) {
        const t = v.tail ? byName.get(v.tail) : undefined;
        const e = byName.get(v.ends);
        if (!e) out.push(`phasor ${v.name} ends on ${v.ends}, which is not drawn`);
        else if (v.unit !== e.unit || (t && t.unit !== v.unit))
          out.push(`phasor ${v.name} is summed with a phasor of another unit`);
        else {
          const from = t ? phasorVector(t) : { re: 0, im: 0 };
          const tip = phasorVector(v);
          const want = phasorVector(e);
          const gap = Math.hypot(from.re + tip.re - want.re, from.im + tip.im - want.im);
          if (gap > 2e-3 * Math.max(e.mag, v.mag))
            out.push(`${v.name} drawn tip to tail misses ${v.ends}'s tip by ${gap.toPrecision(3)}`);
        }
      }
    }
  }
  // Poles and zeros, read.
  const points = (ps: PlanePointHe2a[] | undefined) => {
    const xs: Cx[] = [];
    for (const p of ps ?? []) {
      const [re, im] = [get(p.re), p.im === undefined ? 0 : get(p.im)];
      if (re === undefined || im === undefined) return undefined;
      xs.push({ re: (p.neg ? -1 : 1) * re, im });
    }
    return withConjugates(xs);
  };
  if (rep.transfer?.dc) {
    const [ps, zs, k, g0] = [
      points(rep.poles),
      points(rep.zeros),
      get(rep.transfer.gain),
      get(rep.transfer.dc),
    ];
    if (ps && zs && k !== undefined && g0 !== undefined) {
      const want =
        (k * polyAt(polyOf(zs), { re: 0, im: 0 }).re) / polyAt(polyOf(ps), { re: 0, im: 0 }).re;
      if (Number.isFinite(want) && !near(g0, want, 1e-3, 1e-9))
        out.push(`G(0) is ${g0}, the poles and zeros give ${want}`);
    }
  }
  const L = rep.locus;
  if (L) {
    const [ps, zs] = [points(L.poles), points(L.zeros)];
    const gains = (Array.isArray(L.gain) ? L.gain : [L.gain]).map(get);
    if (ps && zs) {
      if (zs.length > ps.length)
        out.push(`the locus has more zeros (${zs.length}) than poles (${ps.length})`);
      const D = polyOf(ps);
      const N = polyOf(zs);
      const scale = Math.max(1, ...ps.map(cabs), ...zs.map(cabs));
      if (gains.every((g): g is number => g !== undefined)) {
        const K = gains.reduce((a, b) => a * b, 1);
        if (K < 0) out.push(`the gain ${K} is negative (the locus is drawn for K > 0)`);
        const ch = polyAdd(D, N, 1, K);
        const size = Math.max(...ch.map(Math.abs));
        const roots = closedLoopPoles(ps, zs, K);
        for (const r of roots) {
          const res = cabs(polyAt(ch, r)) / (size * Math.max(1, cabs(r)) ** (ch.length - 1));
          if (res > 1e-7)
            out.push(`the closed-loop pole at ${r.re} + j${r.im} does not solve D + KN = 0`);
        }
        for (const id of L.closed ?? []) {
          const x = get(id);
          if (
            x !== undefined &&
            !roots.some((r) => Math.abs(r.im) < 1e-6 && near(r.re, x, 1e-3, 1e-6 * scale))
          )
            out.push(`closed-loop pole ${id} = ${x} is not a root of D(s) + K·N(s) at K = ${K}`);
        }
      }
      const sig = get(L.centroid);
      const want = centroidOf(ps, zs);
      if (sig !== undefined && (want === undefined || !near(sig, want, 1e-3, 1e-6 * scale)))
        out.push(`the centroid is ${sig}, the poles and zeros give ${want}`);
      const b = get(L.breakaway);
      if (b !== undefined) {
        const f = polyAdd(polyMul(polyDiff(D), N), polyMul(D, polyDiff(N)), 1, -1);
        const fs =
          Math.max(...f.map(Math.abs)) * Math.max(1, Math.abs(b)) ** Math.max(0, f.length - 1);
        if (Math.abs(polyAt(f, { re: b, im: 0 }).re) > 1e-3 * fs)
          out.push(`dK/ds is not 0 at the breakaway ${b}`);
        if (!onRealLocus(b, ps, zs)) out.push(`the breakaway ${b} is not on the real-axis locus`);
        if (!breakawayPoints(ps, zs).some((x) => near(x, b, 1e-3, 1e-6 * scale)))
          out.push(`the breakaway ${b} is not one the picture marks`);
      }
    }
  }
  return out;
}

/** HC22: the Bode plot's readings agree with the transfer function it draws. */
export function bodeIssues(rep: BodeSpec, val: Val): string[] {
  const out: string[] = [];
  const get = (x: X) => read(val, x);
  for (const x of [
    ...(rep.poles ?? []),
    ...(rep.zeros ?? []),
    ...(rep.pairs ?? []).map((p) => p.freq),
  ]) {
    const v = get(x);
    if (v !== undefined && !(v > 0)) out.push(`a corner frequency is ${v}, not positive`);
  }
  if (rep.gain === undefined && rep.dc === undefined) out.push('bode needs `gain` or `dc`');
  if (rep.dc !== undefined && (rep.integrators ?? 0) !== 0)
    out.push('`dc` with integrators has no low-frequency gain');
  const tf = bodeTfOf(rep, (x) => get(x));
  if (!tf) return out;
  const w = get(rep.at);
  if (w !== undefined && w > 0) {
    const p = bodeAt(tf, w);
    const db = get(rep.read?.db);
    if (db !== undefined && Math.abs(db - p.db) > 0.1)
      out.push(`the gain at ${w} is ${p.db} dB, the page says ${db}`);
    const ratio = get(rep.read?.ratio);
    if (ratio !== undefined && !near(ratio, p.ratio, 1e-3, 1e-9))
      out.push(`|H| at ${w} is ${p.ratio}, the page says ${ratio}`);
    const ph = get(rep.read?.phase);
    if (ph !== undefined && Math.abs(angleGap(ph, p.phase)) > 0.5)
      out.push(`the phase at ${w} is ${p.phase}°, the page says ${ph}°`);
    const as = get(rep.read?.asymptote);
    if (as !== undefined && Math.abs(as - asymptoteDb(tf, w)) > 0.1)
      out.push(`the asymptote at ${w} is ${asymptoteDb(tf, w)} dB, the page says ${as}`);
  }
  if (rep.crossover) {
    const gc = gainCrossover(tf);
    const [wc, pm] = [get(rep.crossover.freq), get(rep.crossover.margin)];
    if (!gc && (wc !== undefined || pm !== undefined)) out.push('the gain never crosses 0 dB');
    if (gc && wc !== undefined && Math.abs(bodeAt(tf, wc).db) > 0.1)
      out.push(`|G| at the crossover ${wc} is ${bodeAt(tf, wc).db} dB, not 0`);
    if (gc && pm !== undefined && Math.abs(pm - gc.pm) > 0.5)
      out.push(`the phase margin is ${gc.pm}°, the page says ${pm}°`);
  }
  if (rep.margin) {
    const pc = phaseCrossover(tf);
    const [w180, gm, gmDb] = [get(rep.margin.freq), get(rep.margin.gain), get(rep.margin.db)];
    if (!pc && (w180 !== undefined || gm !== undefined || gmDb !== undefined))
      out.push('the phase never reaches −180°');
    if (pc && w180 !== undefined && Math.abs(bodeAt(tf, w180).phase + 180) > 0.5)
      out.push(`the phase at ${w180} is not −180°`);
    if (pc && gm !== undefined && !near(gm, pc.gm, 5e-3))
      out.push(`the gain margin is ${pc.gm}, the page says ${gm}`);
    if (pc && gmDb !== undefined && Math.abs(gmDb - pc.gmDb) > 0.1)
      out.push(`the gain margin is ${pc.gmDb} dB, the page says ${gmDb}`);
  }
  if (rep.closed) {
    const g = get(rep.closed.gain);
    const bw = get(rep.closed.bandwidth);
    if (g !== undefined && g <= 0) out.push(`the closed-loop gain ${g} is not positive`);
    if (
      g !== undefined &&
      bw !== undefined &&
      tf.n === 1 &&
      !tf.poles.length &&
      !near(bw, Math.abs(tf.k) / g, 5e-3)
    )
      out.push(
        `the closed-loop line meets the open-loop line at ${Math.abs(tf.k) / g}, the page says ${bw}`,
      );
  }
  return out;
}

/**
 * Picture checks for the college pictures of round 4, group C (`typesHe4c.ts`): what each one
 * draws must agree with the values. Called from `repIssues` in `pictures.ts`. Test-only. `val`
 * reads formula units (see `siOf`).
 */
import {
  cubicAt,
  PULSE_SHARE,
  pulseForce,
  rodPendulum,
  turnarounds,
  type Cubic,
} from '@/components/module/reps/he4cMath';

import type { He4cSpec } from '../typesHe4c';
import type { NumOrVar } from '../typesGraphs';

type Val = (id: string) => number | undefined;

/** Equal to 1e-4 of the larger (shown values are rounded, then worked on). */
const near = (a: number, b: number, tol = 1e-4) =>
  Math.abs(a - b) <= tol * Math.max(1, Math.abs(a), Math.abs(b));

export function he4cIssues(rep: He4cSpec, val: Val): string[] {
  const out: string[] = [];
  const read = (x: NumOrVar | undefined) =>
    x === undefined ? undefined : typeof x === 'number' ? x : val(x);
  /** The page's value of `id` agrees with what the picture draws. */
  const same = (id: string | undefined, want: number | undefined, what: string) => {
    const x = id ? val(id) : undefined;
    if (x === undefined || want === undefined || !Number.isFinite(want)) return;
    if (!near(x, want)) out.push(`${rep.kind}: ${what} ${id} = ${x}, the picture draws ${want}`);
  };
  switch (rep.kind) {
    case 'motionGraph': {
      // HC99: x, v and a at t by the power rule; every ringed turnaround has v = 0.
      const p = rep.polynomial;
      const cs = [read(p.c0), read(p.c1), read(p.c2), read(p.c3)];
      const t = read(p.at);
      if (t !== undefined && t < 0) out.push(`motionGraph: time ${t} is before 0`);
      if (cs.some((x) => x === undefined)) break;
      const cubic = cs as unknown as Cubic;
      for (const r of turnarounds(cubic)) {
        const v = cubicAt(cubic, r).v;
        if (Math.abs(v) > 1e-6) out.push(`motionGraph: the turnaround at t = ${r} has v = ${v}`);
        const [before, after] = [cubicAt(cubic, r * 0.999).v, cubicAt(cubic, r * 1.001).v];
        if (before * after > 0) out.push(`motionGraph: v doesn't change sign at t = ${r}`);
      }
      if (t === undefined) break;
      const s = cubicAt(cubic, t);
      same(p.position, s.x, 'x = c₀ + c₁t + c₂t² + c₃t³:');
      same(p.velocity, s.v, 'v = c₁ + 2c₂t + 3c₃t²:');
      same(p.acceleration, s.a, 'a = 2c₂ + 6c₃t:');
      break;
    }
    case 'impulse': {
      // HC101: the drawn pulse's area (by quadrature) = J; F_avg·Δt = J; Δv = J ÷ m.
      const [F, dt, m] = [read(rep.peak), read(rep.time), read(rep.mass)];
      if (F !== undefined && F <= 0) out.push(`impulse: peak force ${F} is not positive`);
      if (dt !== undefined && dt <= 0) out.push(`impulse: contact time ${dt} is not positive`);
      if (m !== undefined && m <= 0) out.push(`impulse: mass ${m} is not positive`);
      if (F === undefined || dt === undefined || F <= 0 || dt <= 0) break;
      const n = 2000;
      let area = 0;
      for (let i = 0; i < n; i++)
        area += pulseForce(rep.shape, F, dt, ((i + 0.5) * dt) / n) * (dt / n);
      const J = PULSE_SHARE[rep.shape] * F * dt;
      if (!near(area, J, 1e-3)) out.push(`impulse: the pulse's area ${area} is not J = ${J}`);
      same(rep.impulse, J, 'J (the area)');
      same(rep.average, J / dt, 'the average force J ÷ Δt');
      const avg = rep.average ? val(rep.average) : undefined;
      if (avg !== undefined && !near(avg * dt, J))
        out.push(`impulse: F_avg·Δt ${avg * dt} ≠ J ${J}`);
      if (m !== undefined && m > 0) same(rep.change, J / m, 'Δv = J ÷ m');
      break;
    }
    case 'pendulum': {
      // HC103: d = L ÷ 2 − p; I by parallel axes (a uniform rod); T = 2π√(I ÷ (mgd)); I ÷ (md).
      const [L, p, m, g] = [
        read(rep.rod.length),
        read(rep.rod.pivot ?? 0),
        read(rep.mass),
        read(rep.g),
      ];
      if (L !== undefined && L <= 0) out.push(`pendulum: rod length ${L} is not positive`);
      if (p !== undefined && L !== undefined && (p < 0 || p > L / 2))
        out.push(`pendulum: the pin ${p} is not on the rod's upper half (0 to ${L / 2})`);
      if (L === undefined || p === undefined || m === undefined || g === undefined) break;
      const I = rep.inertia ? val(rep.inertia) : undefined;
      const r = rodPendulum(L, p, m, g, I);
      same(rep.distance, r.d, 'd = L ÷ 2 − p:');
      same(rep.inertia, rodPendulum(L, p, m, g).I, 'I = mL² ÷ 12 + md²:');
      same(rep.period, r.T, 'T = 2π√(I ÷ (mgd)):');
      same(rep.equivalent, r.Leq, 'the equivalent length I ÷ (md):');
      break;
    }
  }
  return out;
}

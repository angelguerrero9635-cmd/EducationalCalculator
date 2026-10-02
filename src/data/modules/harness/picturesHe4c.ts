/**
 * Picture checks for the college pictures of round 4, group C (`typesHe4c.ts`): what each one
 * draws must agree with the values. Called from `repIssues` in `pictures.ts`. Test-only. `val`
 * reads formula units (see `siOf`).
 */
import {
  addVelocities,
  COMPTON_PM,
  comptonOf,
  cubicAt,
  fromPrimed,
  HC_KEV_PM,
  lorentzOf,
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
const near = (a: number, b: number, tol = 1e-4, scale = 0) =>
  Math.abs(a - b) <= tol * Math.max(1, Math.abs(a), Math.abs(b), scale);

export function he4cIssues(rep: He4cSpec, val: Val): string[] {
  const out: string[] = [];
  const read = (x: NumOrVar | undefined) =>
    x === undefined ? undefined : typeof x === 'number' ? x : val(x);
  /** The page's value of `id` agrees with what the picture draws. */
  /** `scale`: the size of the terms `want` is worked from (a difference of big numbers). */
  const same = (id: string | undefined, want: number | undefined, what: string, scale = 0) => {
    const x = id ? val(id) : undefined;
    if (x === undefined || want === undefined || !Number.isFinite(want)) return;
    if (!near(x, want, 1e-4, scale))
      out.push(`${rep.kind}: ${what} ${id} = ${x}, the picture draws ${want}`);
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
    case 'photoelectric': {
      // HC105: λ′ − λ = (h ÷ mₑc)(1 − cos θ); the energies; momentum closes in x and y.
      const [lam, th] = [read(rep.wavelength), read(rep.angle)];
      if (lam !== undefined && lam <= 0)
        out.push(`photoelectric: wavelength ${lam} is not positive`);
      if (th !== undefined && (th < 0 || th > 180))
        out.push(`photoelectric: angle ${th} is not 0° to 180°`);
      if (lam === undefined || th === undefined || lam <= 0) break;
      const C = rep.compton ?? COMPTON_PM;
      const k = comptonOf(lam, th, C, rep.hc ?? HC_KEV_PM);
      if (!near(k.lamP - lam, C * (1 - Math.cos((th * Math.PI) / 180)), 1e-6))
        out.push(`photoelectric: λ′ − λ = ${k.lamP - lam} is not the Compton shift`);
      const t = (th * Math.PI) / 180;
      const [sx, sy] = [k.pp * Math.cos(t) + k.pe.x - k.p, k.pp * Math.sin(t) + k.pe.y];
      if (Math.abs(sx) > 1e-9 * k.p || Math.abs(sy) > 1e-9 * k.p)
        out.push(`photoelectric: momentum doesn't close (${sx}, ${sy})`);
      same(rep.shift, k.shift, 'Δλ = (h ÷ mₑc)(1 − cos θ):', C);
      same(rep.scattered, k.lamP, 'λ′ = λ + Δλ:');
      same(rep.energy, k.E, 'E = hc ÷ λ:');
      same(rep.scatteredEnergy, k.Ep, 'E′ = hc ÷ λ′:');
      same(rep.kinetic, k.K, 'K = E − E′:', k.E);
      same(rep.electronAngle, k.phi, 'the electron’s angle φ:');
      break;
    }
    case 'spacetime': {
      // HC104: the drawn tilt is tan⁻¹β; s² read on both frames agrees; u from the addition law.
      const b = read(rep.speed);
      if (b !== undefined && Math.abs(b) >= 1) out.push(`spacetime: speed ${b} is not below c`);
      if (b === undefined || Math.abs(b) >= 1) break;
      if (rep.mode === 'addition') {
        const up = read(rep.other);
        if (up === undefined) break;
        if (Math.abs(up) >= 1) out.push(`spacetime: u′ = ${up} is not below c`);
        const u = addVelocities(b, up);
        if (Math.abs(u) >= 1) out.push(`spacetime: u = ${u} is not below c`);
        same(rep.result, u, 'u = (v + u′) ÷ (1 + vu′):');
        break;
      }
      // The ct′ axis is drawn along (β, 1): its angle from the ct axis is tan⁻¹β.
      const drawn = Math.atan2(b, 1);
      if (!near(drawn, Math.atan(b))) out.push(`spacetime: the drawn tilt ${drawn} is not tan⁻¹β`);
      same(rep.gamma, 1 / Math.sqrt(1 - b * b), 'γ = 1 ÷ √(1 − β²):');
      const [x, ct] = [read(rep.x), read(rep.ct)];
      if (x === undefined || ct === undefined) break;
      const lz = lorentzOf(b, x, ct);
      const size = lz.gamma * (Math.abs(x) + Math.abs(ct));
      same(rep.xPrime, lz.xp, 'x′ = γ(x − βct):', size);
      same(rep.ctPrime, lz.ctp, 'ct′ = γ(ct − βx):', size);
      same(rep.interval, lz.s2, 's² = (ct)² − x²:', x * x + ct * ct);
      const back = fromPrimed(b, lz.xp, lz.ctp);
      if (!near(back.x, x, 1e-4, size) || !near(back.ct, ct, 1e-4, size))
        out.push(`spacetime: the event read back from S′ is (${back.x}, ${back.ct})`);
      if (!near(lz.ctp ** 2 - lz.xp ** 2, lz.s2, 1e-6, size * size))
        out.push(`spacetime: s² in S′ ${lz.ctp ** 2 - lz.xp ** 2} ≠ s² in S ${lz.s2}`);
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

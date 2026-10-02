/**
 * Picture checks for the college pictures of round 3, group L (typesHe3l.ts): every value the
 * picture marks agrees with the sums it draws from (reps/he3lMath.ts). `val` reads formula
 * units (the variable's own unit), turned to SI here from the unit's name. Test-only.
 */
import {
  ETA_0,
  emWaveOf,
  gammaOf,
  gratingAngle,
  gratingOf,
  hoopOf,
  LIGHT_SPEED,
  oscillatorOf,
  pendulumOf,
  singleSlitOf,
  standingOf,
  thinFilmOf,
  unitSI,
} from '@/components/module/reps/he3lMath';
import type { VariableDef } from '@/engine/types';

import type { NumOrVar } from '../typesGraphs';
import type { He3lSpec } from '../typesHe3l';

type Val = (id: string) => number | undefined;

const near = (a: number, b: number, rel = 5e-3, abs = 0) =>
  Math.abs(a - b) <= rel * Math.max(Math.abs(a), Math.abs(b), 1e-300) + abs;

/** The checks for one group-HE3L picture. */
export function he3lIssues(rep: He3lSpec, val: Val, byId: Map<string, VariableDef>): string[] {
  const out: string[] = [];
  /** A field in SI (`per` SI per unit for a fixed number or an unknown unit). */
  const si = (x: NumOrVar | undefined, per = 1) => {
    if (x === undefined) return undefined;
    if (typeof x === 'number') return x * per;
    const v = val(x);
    return v === undefined ? undefined : v * unitSI(byId.get(x)?.unit, per);
  };
  /** A marked value against the drawn one (both SI). */
  const same = (id: NumOrVar | undefined, drawn: number | undefined, what: string, per = 1) => {
    if (typeof id !== 'string' || drawn === undefined || !Number.isFinite(drawn)) return;
    const x = si(id, per);
    // A box shows 4 decimals: a value under that reads as 0.
    if (x !== undefined && !near(x, drawn, 5e-3, 1e-4 * unitSI(byId.get(id)?.unit, per)))
      out.push(`${what}: ${id} = ${x}, the picture draws ${drawn}`);
  };

  if (rep.kind === 'rayDiagram') {
    if (rep.mode === 'singleSlit') {
      const [lam, a, L] = [si(rep.wavelength, 1e-9), si(rep.width, 1e-3), si(rep.screen)];
      if (lam === undefined || a === undefined) return out;
      if (lam <= 0 || a <= 0) out.push('single slit: λ and a must be positive');
      const s = singleSlitOf(lam, a, L ?? 1);
      if (s.theta1 === undefined) {
        if (typeof rep.angle === 'string' && val(rep.angle) !== undefined)
          out.push(`single slit: a = ${a} m ≤ λ has no dark fringe, yet θ₁ is marked`);
        return out;
      }
      same(rep.angle, s.theta1, 'θ₁ from a sin θ₁ = λ');
      if (L !== undefined) same(rep.central, s.central, 'w = 2L tan θ₁', 1e-3);
      // The central band is twice the first side band (to first order in θ).
      const d2 = s.darks[1];
      if (d2 && s.theta1 < 5 && !near(d2.y - s.darks[0]!.y, s.darks[0]!.y, 0.02))
        out.push('single slit: the side band is not half the central band');
      return out;
    }
    if (rep.mode === 'grating') {
      const [lam, N, dGiven] = [
        si(rep.wavelength, 1e-9),
        si(rep.lines, 1e3),
        si(rep.spacing, 1e-6),
      ];
      if (N !== undefined) same(rep.spacing, 1 / N, 'd = 1 ÷ N', 1e-6);
      const Nd = dGiven !== undefined && dGiven > 0 ? 1 / dGiven : N;
      if (lam === undefined || Nd === undefined) return out;
      const g = gratingOf(lam, Nd);
      if (typeof rep.highest === 'string') {
        const h = val(rep.highest);
        if (h !== undefined && h !== g.highest)
          out.push(`grating: m_max ${h}, the picture draws ${g.highest}`);
      }
      for (const o of g.orders)
        if (Math.abs((o.m * lam) / g.d) > 1 + 1e-9)
          out.push(`grating: order ${o.m} drawn past sin θ = 1`);
      const m = typeof rep.order === 'string' ? val(rep.order) : rep.order;
      if (m !== undefined) {
        if (!Number.isInteger(m)) out.push(`grating: order ${m} is not whole`);
        const th = gratingAngle(lam, g.d, m);
        if (th === undefined && typeof rep.angle === 'string' && val(rep.angle) !== undefined)
          out.push(`grating: order ${m} is past sin θ = 1, yet θ is marked`);
        same(rep.angle, th, 'θ from d sin θ = mλ');
      }
      return out;
    }
    const [n, t] = [si(rep.index), si(rep.thickness, 1e-9)];
    const m = typeof rep.order === 'string' ? val(rep.order) : rep.order;
    if (n === undefined || t === undefined || m === undefined) return out;
    if (!Number.isInteger(m) || m < 0 || m > 10) out.push(`thin film: order ${m} is not 0 to 10`);
    const f = thinFilmOf(n, t, m, rep.flips ?? 'one');
    same(rep.wavelength, f.lambda, 'λ from 2nt', 1e-9);
    return out;
  }

  if (rep.kind === 'phaseSpace') {
    if (rep.system === 'oscillator') {
      const [m, k, x, p] = [si(rep.mass), si(rep.spring), si(rep.position), si(rep.momentum)];
      if ([m, k, x, p].some((v) => v === undefined)) return out;
      if (m! <= 0 || k! <= 0) out.push('phase space: m and k must be positive');
      const o = oscillatorOf(m!, k!, x!, p!);
      // H at the point is the drawn ellipse's H: x²/xHalf² + p²/pHalf² = 1.
      if (o.H > 0 && !near((x! / o.xHalf) ** 2 + (p! / o.pHalf) ** 2, 1, 1e-9))
        out.push('phase space: the point is off its ellipse');
      same(rep.energy, o.H, 'H = p² ÷ 2m + ½kx²');
      same(rep.velocity, o.xdot, 'ẋ = ∂H/∂p');
      same(rep.force, o.pdot, 'ṗ = −∂H/∂x');
      same(rep.omega, o.omega, 'ω = √(k ÷ m)');
      same(rep.area, o.area, '𝒜 = 2πH ÷ ω');
      return out;
    }
    if (rep.system === 'pendulum') {
      const [m, L, w0, g] = [si(rep.mass), si(rep.length), si(rep.speed), si(rep.g)];
      if ([m, L, w0, g].some((v) => v === undefined)) return out;
      const pd = pendulumOf(m!, L!, w0!, g!);
      same(rep.energy, pd.E, 'E = ½mL²ω₀²');
      same(rep.separatrix, pd.Es, 'E_s = 2mgL');
      if (pd.thetaMax === undefined) {
        if (typeof rep.amplitude === 'string' && val(rep.amplitude) !== undefined)
          out.push('pendulum: it goes over the top, yet θ_max is marked');
      } else same(rep.amplitude, pd.thetaMax, 'θ_max from cos θ_max = 1 − E ÷ mgL');
      return out;
    }
    const [R, w, g] = [si(rep.radius), si(rep.spin), si(rep.g)];
    if ([R, w, g].some((v) => v === undefined)) return out;
    const h = hoopOf(R!, w!, g!);
    same(rep.critical, h.wc, 'ω_c = √(g ÷ R)');
    same(rep.angle, h.theta0, 'θ₀ at the minimum of U_eff');
    same(rep.frequency, h.Omega, 'Ω');
    return out;
  }

  if ('em' in rep) {
    const e = rep.em;
    const E0 = si(e.amplitude);
    if (E0 === undefined) return out;
    // A speed or impedance the page names but hasn't found yet: nothing to compare.
    if ([e.speed, e.impedance].some((x) => x !== undefined && si(x) === undefined)) return out;
    const v = si(e.speed) ?? LIGHT_SPEED;
    const eta = si(e.impedance) ?? (e.speed === undefined ? ETA_0 : undefined);
    const w = emWaveOf(E0, v, eta);
    if ((e.field ?? 'B') === 'B') same(e.magnetic, w.B0, 'B₀ = E₀ ÷ v');
    else same(e.magnetic, w.H0, 'H₀ = E₀ ÷ η');
    same(e.intensity, w.intensity, 'I = E₀² ÷ 2η');
    return out;
  }

  const l = rep.line;
  const G = si(l.gamma);
  const [z0, rl] = [si(l.impedance), si(l.load)];
  if (G === undefined) return out;
  if (Math.abs(G) > 1) out.push(`line: |Γ| = ${Math.abs(G)} is past 1`);
  if (z0 !== undefined && rl !== undefined && !near(gammaOf(z0, rl), G) && Math.abs(G) > 1e-9)
    out.push(`line: Γ = ${G}, the load and line give ${gammaOf(z0, rl)}`);
  const s = standingOf(G);
  // The drawn V_max ÷ V_min is the VSWR.
  if (Number.isFinite(s.vswr)) {
    same(l.vswr, s.vmax / s.vmin, 'V_max ÷ V_min = VSWR');
    if (Math.abs(G) > 1e-9) same(l.returnLoss, -20 * Math.log10(Math.abs(G)), 'RL = −20 log|Γ|');
  }
  if (typeof l.share === 'string') {
    const pct = byId.get(l.share)?.unit === '%';
    same(l.share, pct ? G * G * 100 : G * G, 'reflected share Γ²');
  }
  return out;
}

/**
 * Harness checks for the college pictures, round 3, group K: `waterfall` `decibels` (HC91),
 * `lamina` (HC86), `rocket` (HC87), `deviceCurves` (HC62) and `stemPlot` (HC63). Each check
 * recomputes what the picture draws, with the picture's own math (reps/he3kMath.ts), and
 * compares it with the page's values. Values arrive in the formula's units. Called from
 * `pictures.ts`.
 */
import {
  HEX_MAX,
  dbLevels,
  drawnFiberShare,
  dropQ,
  inverseRule,
  massBar,
  mosfetId,
  rocketDv,
  ruleOfMixtures,
  shockley,
  thrustParts,
} from '@/components/module/reps/he3kMath';

import type { Representation } from '../types';
import type { DeviceCurvesSpec, He3kSpec, LaminaSpec, RocketSpec } from '../typesHe3k';

type Val = (x: string | number) => number | undefined;

const near = (a: number, b: number, tol = 2e-3) =>
  Math.abs(a - b) <= tol * Math.max(Math.abs(a), Math.abs(b)) + 1e-9;

const reader = (val: Val) => (x: string | number | undefined) =>
  x === undefined ? undefined : val(x);

// ─── HC91 ────────────────────────────────────────────────────────────────────

type Waterfall = Extract<Representation, { kind: 'waterfall' }>;

/** The end bar is the sum of the signed items; the margin is the gap to the floor. */
export function waterfallDecibelsIssues(rep: Waterfall, val: Val): string[] {
  const out: string[] = [];
  if (!rep.decibels) return out;
  const opts = rep.decibels === true ? {} : rep.decibels;
  const xs = rep.items.map((i) => val(i.var));
  const total = val(rep.total);
  if (xs.some((x) => x === undefined) || total === undefined) return out;
  const levels = dbLevels(rep.items.map((i, k) => ({ sign: i.sign, value: xs[k]! })));
  const end = levels[levels.length - 1]?.to ?? 0;
  if (Math.abs(end - total) > 0.05)
    out.push(`the end bar ${total} dB is not the sum of the signed items (${end.toFixed(2)})`);
  if (opts.margin) {
    const floor = opts.floor === undefined ? undefined : val(opts.floor);
    const margin = val(opts.margin);
    if (opts.floor === undefined) out.push('a margin is bracketed with no floor to bracket it to');
    else if (
      floor !== undefined &&
      margin !== undefined &&
      Math.abs(Math.abs(total - floor) - Math.abs(margin)) > 0.05
    )
      out.push(
        `the bracket from ${total} to ${floor} is ${Math.abs(total - floor)} dB, not ${margin}`,
      );
  }
  return out;
}

// ─── HC86 ────────────────────────────────────────────────────────────────────

/** The drawn fiber share is V_f within 2%; E₁, E₂ and ρ_c by their rules; E₂ ≤ E₁. */
export function laminaIssues(rep: LaminaSpec, val: Val): string[] {
  const out: string[] = [];
  const n = reader(val);
  const Vf = n(rep.Vf);
  if (Vf === undefined) return out;
  if (Vf < 0 || Vf > HEX_MAX) {
    out.push(`V_f = ${Vf} can't be drawn: fibers pack to ${HEX_MAX.toFixed(3)} at most`);
    return out;
  }
  const share = drawnFiberShare(Vf);
  if (Math.abs(share - Vf) > 0.02)
    out.push(`the drawn fiber share is ${share.toFixed(3)}, not V_f = ${Vf}`);
  const [Ef, Em, E1, E2] = [n(rep.Ef), n(rep.Em), n(rep.E1), n(rep.E2)];
  if (Ef !== undefined && Em !== undefined && Ef > 0 && Em > 0) {
    if (E1 !== undefined && !near(E1, ruleOfMixtures(Ef, Em, Vf)))
      out.push(`E₁ = ${E1}, the rule of mixtures gives ${ruleOfMixtures(Ef, Em, Vf)}`);
    if (E2 !== undefined && !near(E2, inverseRule(Ef, Em, Vf)))
      out.push(`E₂ = ${E2}, the inverse rule gives ${inverseRule(Ef, Em, Vf)}`);
  }
  if (E1 !== undefined && E2 !== undefined && E2 > E1 * (1 + 1e-9))
    out.push(`E₂ = ${E2} > E₁ = ${E1}`);
  if (rep.rho) {
    const [f, m, c] = [n(rep.rho.f), n(rep.rho.m), n(rep.rho.c)];
    if (f !== undefined && m !== undefined && c !== undefined && !near(c, ruleOfMixtures(f, m, Vf)))
      out.push(`ρ_c = ${c}, the mixture gives ${ruleOfMixtures(f, m, Vf)}`);
  }
  return out;
}

// ─── HC87 ────────────────────────────────────────────────────────────────────

/**
 * The propellant bar ÷ the whole is 1 − m_f ÷ m₀; Δv by the rocket equation, and larger for a
 * larger mass ratio; F = ṁv_e + (p_e − p_a)A_e; Δv₁ + Δv₂ = Δv, stage 2 no heavier than
 * stage 1 at burnout.
 */
export function rocketIssues(rep: RocketSpec, val: Val): string[] {
  const out: string[] = [];
  const n = reader(val);
  const g = n(rep.g) ?? 9.81;
  const [m0, mf, Isp, dv] = [n(rep.m0), n(rep.mf), n(rep.Isp), n(rep.dv)];
  if (m0 !== undefined && mf !== undefined && m0 > 0 && mf > 0) {
    const bar = massBar(m0, mf, 100);
    const fraction = n(rep.fraction);
    if (mf < m0 && !near(bar.prop / 100, 1 - mf / m0))
      out.push(`the propellant bar is ${bar.prop}% of m₀, not 1 − m_f ÷ m₀`);
    if (fraction !== undefined && !near(fraction, 1 - mf / m0, 5e-3))
      out.push(`fraction ${fraction} ≠ 1 − m_f ÷ m₀ = ${1 - mf / m0}`);
    const ratio = n(rep.ratio);
    if (ratio !== undefined && !near(ratio, m0 / mf)) out.push(`ratio ${ratio} ≠ m₀ ÷ m_f`);
    if (Isp !== undefined && dv !== undefined && mf < m0) {
      const drawn = rocketDv(Isp, g, m0, mf)!;
      if (!near(dv, drawn)) out.push(`Δv = ${dv}, the rocket equation gives ${drawn}`);
      // Δv grows with the mass ratio: a little more propellant, a little more Δv.
      if (!(rocketDv(Isp, g, m0 * 1.01, mf)! > drawn)) out.push('Δv does not grow with m₀ ÷ m_f');
    }
  }
  const t = rep.thrust;
  if (t) {
    const xs = [n(t.mdot), n(t.ve), n(t.pe), n(t.pa), n(t.Ae)];
    const F = n(t.F);
    if (xs.every((x) => x !== undefined) && F !== undefined) {
      const [mdot, ve, pe, pa, Ae] = xs as number[];
      const p = thrustParts(mdot!, ve!, pe!, pa!, Ae!, t.mv, t.pA);
      if (!near(F, p.momentum + p.pressure))
        out.push(`F = ${F}, the two terms add to ${p.momentum + p.pressure}`);
      const isp = n(t.Isp);
      if (isp !== undefined && mdot! > 0 && !near(isp, F / (t.mv ?? 0.001) / (mdot! * g)))
        out.push(`I_sp = ${isp}, F ÷ (ṁg) gives ${F / (t.mv ?? 0.001) / (mdot! * g)}`);
    }
  }
  if (rep.stages) {
    const s = rep.stages.map((x) => ({ Isp: n(x.Isp), m0: n(x.m0), mf: n(x.mf), dv: n(x.dv) }));
    s.forEach((x, i) => {
      if (x.Isp !== undefined && x.m0 !== undefined && x.mf !== undefined && x.dv !== undefined) {
        const d = rocketDv(x.Isp, g, x.m0, x.mf);
        if (d !== undefined && !near(x.dv, d))
          out.push(`Δv${i + 1} = ${x.dv}, the equation gives ${d}`);
      }
    });
    if (s[0]!.mf !== undefined && s[1]!.m0 !== undefined && s[1]!.m0 > s[0]!.mf)
      out.push('stage 2 weighs more than stage 1 at burnout: nothing to drop');
    if (
      s[0]!.dv !== undefined &&
      s[1]!.dv !== undefined &&
      dv !== undefined &&
      !near(dv, s[0]!.dv + s[1]!.dv)
    )
      out.push(`Δv = ${dv} ≠ Δv₁ + Δv₂ = ${s[0]!.dv + s[1]!.dv}`);
  }
  return out;
}

// ─── HC62 ────────────────────────────────────────────────────────────────────

/** Q lies on the device curve and on the load line; ΔV for a decade is nV_T ln 10. */
export function deviceCurvesIssues(rep: DeviceCurvesSpec, val: Val): string[] {
  const out: string[] = [];
  const n = reader(val);
  if (rep.device === 'diode') {
    const [Vs, R, I] = [n(rep.Vs), n(rep.R), n(rep.I)];
    if (rep.model === 'shockley') {
      const [Is, nn, VT, V] = [n(rep.Is), n(rep.n), n(rep.VT), n(rep.V)];
      if (Is === undefined || nn === undefined || VT === undefined) return out;
      if (V !== undefined && I !== undefined && !near(I, shockley(Is, nn, VT, V)))
        out.push(`Q is off the diode curve: I = ${I}, the curve gives ${shockley(Is, nn, VT, V)}`);
      if (
        V !== undefined &&
        I !== undefined &&
        Vs !== undefined &&
        R !== undefined &&
        !near(I, (Vs - V) / R)
      )
        out.push(`Q is off the load line: I = ${I}, (V_s − V) ÷ R = ${(Vs - V) / R}`);
      const dV = n(rep.decade);
      if (dV !== undefined && !near(dV, nn * VT * Math.log(10)))
        out.push(`ΔV = ${dV} for ten times the current, nV_T ln 10 = ${nn * VT * Math.log(10)}`);
    } else {
      const VD = n(rep.VD);
      if (Vs === undefined || R === undefined || VD === undefined) return out;
      const Q = dropQ(Vs, VD, R);
      if (Q && I !== undefined && !near(I, Q.I))
        out.push(`Q is off the load line at V_D: I = ${I}, (V_s − V_D) ÷ R = ${Q.I}`);
    }
    return out;
  }
  const [kn, Vgs, Vt, Vds, Id, Vov] = [
    n(rep.kn),
    n(rep.Vgs),
    n(rep.Vt),
    n(rep.Vds),
    n(rep.Id),
    n(rep.Vov),
  ];
  if (kn === undefined || Vgs === undefined || Vt === undefined) return out;
  // The overdrive the page worked out (V_GS − V_t), as the picture draws it.
  const ov = Vov ?? Vgs - Vt;
  const at = Vds ?? ov;
  // A triode page past its V_DS < V_OV limit is refused by the page, not drawn as triode.
  const pastEdge = rep.Vds !== undefined && (Vds === undefined || Vds > ov);
  if (Id !== undefined && ov > 0 && !pastEdge && !near(Id, mosfetId(kn, ov, at)))
    out.push(`Q is off the V_GS curve: I_D = ${Id}, the curve gives ${mosfetId(kn, ov, at)}`);
  const [VDD, RD] = [n(rep.load?.VDD), n(rep.load?.RD)];
  if (Id !== undefined && VDD !== undefined && RD !== undefined && !near(Id, (VDD - at) / RD))
    out.push(`Q is off the load line: I_D = ${Id}, (V_DD − V_DS) ÷ R_D = ${(VDD - at) / RD}`);
  return out;
}

export function he3kIssues(rep: He3kSpec, val: Val): string[] {
  switch (rep.kind) {
    case 'lamina':
      return laminaIssues(rep, val);
    case 'rocket':
      return rocketIssues(rep, val);
    case 'deviceCurves':
      return deviceCurvesIssues(rep, val);
  }
}

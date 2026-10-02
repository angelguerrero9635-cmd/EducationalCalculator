/**
 * Harness checks for the college pictures of round 3, group H (docs/RENDERINGS_HE.md): HC40
 * `heatExchanger`. What each draws must agree with the values and the physics. Called from
 * `pictures.ts`; `val` reads a value as shown (its own unit), turned here into the base unit.
 */
import type { VariableDef } from '@/engine/types';
import { unitScale, type He3hDim } from '@/components/module/reps/he3hUnits';
import {
  endDiffs,
  lmtd,
  tempsProblem,
  type Temps,
} from '@/components/module/reps/heatExchangerMath';

import {
  polarJ,
  sigmaBend,
  tauMax,
  torqueOf,
  twist,
  vonMises,
} from '@/components/module/reps/shaftMath';

import type { HeatExchangerSpec, He3hSpec, ShaftSpec } from '../typesHe3h';

type Val = (x: string | number) => number | undefined;
type NumOrVar = number | string | undefined;

const near = (a: number, b: number, tol = 2e-3) =>
  Math.abs(a - b) <= tol * Math.max(1, Math.abs(a), Math.abs(b));

export function he3hIssues(rep: He3hSpec, val: Val, byId: Map<string, VariableDef>): string[] {
  const get = (x: NumOrVar, dim: He3hDim = 'none') => {
    if (x === undefined) return undefined;
    const v = val(x);
    if (v === undefined || !Number.isFinite(v)) return undefined;
    return typeof x === 'number' ? v : v * unitScale(byId.get(x)?.unit, dim);
  };
  switch (rep.kind) {
    case 'heatExchanger':
      return exchangerIssues(rep, get);
    case 'shaft':
      return shaftIssues(rep, get);
  }
  return [];
}

type Get = (x: NumOrVar, dim?: He3hDim) => number | undefined;

function exchangerIssues(spec: HeatExchangerSpec, get: Get): string[] {
  const out: string[] = [];
  const [Thi, Tho, Tci, Tco] = [get(spec.Thi), get(spec.Tho), get(spec.Tci), get(spec.Tco)];
  const [q, U, A] = [get(spec.q, 'power'), get(spec.U), get(spec.A, 'area')];
  const [Cmin, Cr, ntu, eff] = [
    get(spec.Cmin, 'capacity'),
    get(spec.Cr),
    get(spec.ntu),
    get(spec.eff),
  ];
  const lm = get(spec.lmtd);
  if (ntu !== undefined && U !== undefined && A !== undefined && Cmin !== undefined)
    if (!near(ntu, (U * A) / Cmin)) out.push(`NTU ${ntu} is not UA ÷ C_min = ${(U * A) / Cmin}`);
  if (Thi === undefined || Tci === undefined) return out;
  if (eff !== undefined && q !== undefined && Cmin !== undefined)
    if (!near(eff, q / (Cmin * (Thi - Tci))))
      out.push(`ε ${eff} is not q ÷ C_min(T_hi − T_ci) = ${q / (Cmin * (Thi - Tci))}`);
  if (Tho === undefined || Tco === undefined) return out;
  const t: Temps = { Thi, Tho, Tci, Tco };
  const problem = tempsProblem(spec.arrangement, t);
  if (problem) return [...out, `the temperatures can't be drawn: ${problem}`];
  const [d1, d2] = endDiffs(spec.arrangement, t);
  const dT1 = get(spec.dT1);
  const dT2 = get(spec.dT2);
  if (dT1 !== undefined && !near(dT1, d1)) out.push(`ΔT₁ ${dT1} is not the ${d1} drawn at x = 0`);
  if (dT2 !== undefined && !near(dT2, d2)) out.push(`ΔT₂ ${dT2} is not the ${d2} drawn at x = L`);
  const L = lmtd(d1, d2);
  if (L < Math.min(d1, d2) - 1e-9 || L > Math.max(d1, d2) + 1e-9)
    out.push(`ΔT_lm ${L} is not between ΔT₁ and ΔT₂`);
  if (lm !== undefined && !near(lm, L)) out.push(`ΔT_lm ${lm} is not the drawn ${L}`);
  if (spec.minSide) {
    const [dh, dc] = [Thi - Tho, Tco - Tci];
    const named = spec.minSide === 'hot' ? dh : dc;
    if (named + 1e-9 < Math.max(dh, dc))
      out.push(`C_min is named on the ${spec.minSide} side, which changes less`);
    if (Cr !== undefined && Math.max(dh, dc) > 0 && !near(Cr, Math.min(dh, dc) / Math.max(dh, dc)))
      out.push(`C_r ${Cr} is not the ratio of the temperature changes`);
  }
  if (spec.arrangement === 'parallel' && Tco > Tho + 1e-9)
    out.push('the lines cross in parallel flow');
  return out;
}

function shaftIssues(spec: ShaftSpec, get: Get): string[] {
  const out: string[] = [];
  const d = get(spec.d, 'length');
  const di = get(spec.di, 'length') ?? 0;
  if (d === undefined) return out;
  if (di >= d) return [`the bore ${di} is not narrower than the shaft ${d}`];
  const P = get(spec.power, 'power');
  const rpm = get(spec.speed);
  const T = get(spec.torque, 'torque');
  const J = get(spec.J);
  const tau = get(spec.tau, 'stress');
  const phi = get(spec.angle, 'angle');
  const [L, G, M] = [
    get(spec.length, 'length'),
    get(spec.G, 'modulus'),
    get(spec.moment, 'torque'),
  ];
  const sigma = get(spec.sigma, 'stress');
  if (J !== undefined && !near(J, polarJ(d, di)))
    out.push(`J ${J} is not the ${polarJ(d, di)} of the section`);
  if (T !== undefined && tau !== undefined && !near(tau, tauMax(T, d, di)))
    out.push(`τ_max ${tau} is not 16T ÷ πd³ (Tc ÷ J) = ${tauMax(T, d, di)}`);
  if (
    T !== undefined &&
    L !== undefined &&
    G !== undefined &&
    phi !== undefined &&
    !near(phi, twist(T, L, G, d, di))
  )
    out.push(`φ ${phi} is not TL ÷ GJ = ${twist(T, L, G, d, di)}`);
  if (M !== undefined && sigma !== undefined && !near(sigma, sigmaBend(M, d, di)))
    out.push(`σ ${sigma} is not 32M ÷ πd³ = ${sigmaBend(M, d, di)}`);
  const sv = get(spec.vonMises, 'stress');
  if (
    sv !== undefined &&
    sigma !== undefined &&
    tau !== undefined &&
    !near(sv, vonMises(sigma, tau))
  )
    out.push(`σ′ ${sv} is not √(σ² + 3τ²)`);
  if (P !== undefined && rpm !== undefined && T !== undefined && !near(T, torqueOf(P, rpm)))
    out.push(`T ${T} is not P ÷ ω = ${torqueOf(P, rpm)}`);
  return out;
}

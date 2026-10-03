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

import {
  basquinReversals,
  goodmanN,
  lifeAt,
  minerDamage,
  snLine,
} from '@/components/module/reps/fatigueMath';

import {
  elementForce,
  meshCounts,
  nodeDisplacements,
  nodeImbalance,
} from '@/components/module/reps/elementChainMath';

import type {
  ElementChainSpec,
  FatigueDiagramSpec,
  HeatExchangerSpec,
  He3hSpec,
  ShaftSpec,
} from '../typesHe3h';

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
    case 'fatigueDiagram':
      return fatigueIssues(rep, get);
    case 'elementChain':
      return chainIssues(rep, get);
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

function fatigueIssues(spec: FatigueDiagramSpec, get: Get): string[] {
  const out: string[] = [];
  const s = (x: NumOrVar) => get(x, 'stress');
  if (spec.mode === 'goodman') {
    const [Se, Sut, n] = [s(spec.Se), s(spec.Sut), get(spec.n)];
    const [smax, smin] = [s(spec.smax), s(spec.smin)];
    let [sa, sm] = [s(spec.sa), s(spec.sm)];
    if (smax !== undefined && smin !== undefined) {
      if (sa !== undefined && !near(sa, (smax - smin) / 2))
        out.push(`σ_a ${sa} is not (σ_max − σ_min) ÷ 2`);
      if (sm !== undefined && !near(sm, (smax + smin) / 2))
        out.push(`σ_m ${sm} is not (σ_max + σ_min) ÷ 2`);
      sa ??= (smax - smin) / 2;
      sm ??= (smax + smin) / 2;
    }
    if (
      Se !== undefined &&
      Sut !== undefined &&
      sa !== undefined &&
      sm !== undefined &&
      n !== undefined
    ) {
      const drawn = goodmanN(sa, sm, Se, Sut);
      if (!near(n, drawn))
        out.push(`n ${n} is not where the load line meets the Goodman line (${drawn})`);
    }
    return out;
  }
  if (spec.mode === 'miner') {
    const blocks = (spec.blocks ?? []).map((x) => ({ n: get(x.n), N: get(x.N) }));
    if (blocks.some((x) => x.n === undefined || x.N === undefined)) return out;
    const D = minerDamage(blocks as { n: number; N: number }[]);
    const Dp = get(spec.D);
    if (Dp !== undefined && !near(Dp, D)) out.push(`D ${Dp} is not Σn ÷ N = ${D}`);
    const rep = get(spec.repeats);
    if (rep !== undefined && !near(rep, 1 / D)) out.push(`repeats ${rep} is not 1 ÷ D`);
    return out;
  }
  if (spec.mode === 'basquin') {
    const [sf, b, sa] = [s(spec.sigmaF), get(spec.b), s(spec.sa)];
    if (sf === undefined || b === undefined || sa === undefined) return out;
    const rev = basquinReversals(sa, sf, b);
    const r = get(spec.reversals);
    if (r !== undefined && !near(r, rev)) out.push(`2N ${r} is not read off the line (${rev})`);
    const N = get(spec.N);
    if (N !== undefined && !near(N, rev / 2))
      out.push(`N ${N} is not half the reversals read off the line`);
    return out;
  }
  const [Sut, Se] = [s(spec.Sut), s(spec.Se)];
  const f = spec.f === undefined ? 0.9 : get(spec.f);
  if (f === undefined || Sut === undefined || Se === undefined || !(f * Sut > Se)) return out;
  const { a, b } = snLine(Sut, Se, f);
  const [ap, bp] = [s(spec.a), get(spec.b)];
  if (ap !== undefined && !near(ap, a)) out.push(`a ${ap} is not (fS_ut)² ÷ S_e = ${a}`);
  if (bp !== undefined && !near(bp, b)) out.push(`b ${bp} is not −log(fS_ut ÷ S_e) ÷ 3 = ${b}`);
  const [Sf, N] = [s(spec.Sf), get(spec.N)];
  if (Sf !== undefined && N !== undefined && Sf >= Se && !near(N, lifeAt(Sf, a, b)))
    out.push(`N ${N} is not read off the line at S_f (${lifeAt(Sf, a, b)})`);
  return out;
}

function chainIssues(spec: ElementChainSpec, get: Get): string[] {
  const out: string[] = [];
  if (spec.mode === 'mesh') {
    const [nx, ny] = [get(spec.nx), get(spec.ny)];
    if (nx === undefined || ny === undefined) return out;
    const { nodes, dof } = meshCounts(nx, ny, spec.dofPerNode ?? 2);
    const [np, dp] = [get(spec.nodes), get(spec.dof)];
    if (np !== undefined && np !== nodes) out.push(`${np} nodes, but the mesh drawn has ${nodes}`);
    if (dp !== undefined && dp !== dof) out.push(`${dp} DOF, but the mesh drawn has ${dof}`);
    return out;
  }
  const els = spec.elements ?? [];
  const count = els.length + 1;
  const u = nodeDisplacements(
    count,
    spec.fixed ?? [],
    (spec.disp ?? []).map((x) => ({ node: x.node, u: get(x.u, 'length') })),
  );
  const forces = els.map((e, i) => {
    const k = get(e.k, 'stiffness');
    const fromK =
      k !== undefined && u[i] !== undefined && u[i + 1] !== undefined
        ? elementForce(k, u[i]!, u[i + 1]!)
        : undefined;
    const given = get(e.force, 'force');
    if (given !== undefined && fromK !== undefined && !near(given, fromK))
      out.push(`element ${i + 1}'s force ${given} is not k(u_j − u_i) = ${fromK}`);
    return given ?? fromK;
  });
  for (let node = 1; node <= count; node++) {
    let F = 0;
    let known = true;
    for (const l of spec.loads ?? [])
      if (l.node === node) {
        const v = get(l.F, 'force');
        if (v === undefined) known = false;
        else F += l.negate ? -v : v;
      }
    for (const r of spec.reactions ?? [])
      if (r.node === node) {
        const v = get(r.R, 'force');
        if (v === undefined) known = false;
        else F += v;
      }
    const fixedHere = (spec.fixed ?? []).includes(node);
    if (fixedHere && !(spec.reactions ?? []).some((r) => r.node === node)) continue;
    const left = node > 1 ? forces[node - 2] : 0;
    const right = node < count ? forces[node - 1] : 0;
    if (!known || left === undefined || right === undefined) continue;
    const off = nodeImbalance(F, left, right);
    if (Math.abs(off) > 2e-3 * Math.max(1, Math.abs(F), Math.abs(left), Math.abs(right)))
      out.push(`node ${node} doesn't balance: its load and the element forces leave ${off}`);
  }
  return out;
}

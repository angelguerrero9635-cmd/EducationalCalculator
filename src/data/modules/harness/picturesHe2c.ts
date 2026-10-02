/**
 * Picture checks for the college round 2 group C kinds (`typesHe2c.ts`): HC17
 * `propertyDiagram` and HC23 `thermalWall`. What each draws must agree with the values and the physics. Called from
 * `repIssues` in `pictures.ts`. Test-only.
 */
import {
  gasConstants,
  pdUnits,
  resolveStates,
  satAtP,
  vdwCritical,
  vdwP,
  type PdGetter,
} from '@/components/module/reps/propertyDiagramMath';
import {
  cylinderR,
  filmR,
  finM,
  finQ,
  finTheta,
  radiant,
  seriesTemperatures,
  wallResistances,
  wireT,
} from '@/components/module/reps/thermalWallMath';

import type { NumOrVar } from '../typesGraphs';
import type { PdState, PropertyDiagramSpec, ThermalWallSpec } from '../typesHe2c';
import type { Representation } from '../types';

/** Equal to a relative tolerance (or 10⁻⁶ near zero). */
const near = (a: number, b: number, tol = 1e-3) =>
  Math.abs(a - b) <= tol * Math.max(1e-6, Math.abs(a), Math.abs(b));

export function he2cIssues(rep: Representation, val: (id: string) => number | undefined): string[] {
  const get: PdGetter = (x: NumOrVar | undefined) => {
    if (x === undefined) return undefined;
    const y = typeof x === 'number' ? x : val(x);
    return y === undefined || Number.isNaN(y) ? undefined : y;
  };
  if (rep.kind === 'propertyDiagram') return propertyIssues(rep, get);
  if (rep.kind === 'thermalWall') return thermalIssues(rep, get);
  return [];
}

function propertyIssues(spec: PropertyDiagramSpec, get: PdGetter): string[] {
  const out: string[] = [];
  const u = pdUnits(spec);
  const pts = resolveStates(spec, get);

  // Every state whose values are all known is placed, and steps name listed states.
  const known = (x: NumOrVar | NumOrVar[] | undefined) =>
    x === undefined || (Array.isArray(x) ? x : [x]).every((y) => get(y) !== undefined);
  const all = (st: PdState) => [st.T, st.P, st.v, st.s, st.h, st.x].every(known);
  // A gas's entropy is measured from the first state, so it must be known too.
  const ref = spec.substance === 'gas' ? spec.states?.[0] : undefined;
  for (const st of spec.states ?? [])
    if (all(st) && (!ref || all(ref)) && !pts.has(st.name))
      out.push(`state ${st.name} can't be placed from its values`);
  for (const step of spec.steps ?? [])
    for (const n of [step.from, step.to])
      if (!spec.states?.some((s) => s.name === n)) out.push(`step names state ${n}, not listed`);

  if (spec.substance === 'water') {
    // 0 < x < 1 lies under the dome, between the page's v_f and v_g on the tie line. (Whether
    // the page's table values match IAPWS is said in the caption: a sampled page types any.)
    const P = get(spec.tie?.P);
    const sat = P === undefined ? undefined : satAtP(P * u.toMPa);
    const [vf, vg] = [get(spec.tie?.vf) ?? sat?.vf, get(spec.tie?.vg) ?? sat?.vg];
    for (const st of spec.states ?? []) {
      const p = pts.get(st.name);
      const x = get(st.x);
      const v = get(st.v);
      if (!p || x === undefined) continue;
      if (x > 0 && x < 1) {
        if (p.region !== 'mixture') out.push(`state ${st.name}: x = ${x} but drawn off the dome`);
        if (vf !== undefined && vg !== undefined && p.v !== undefined) {
          const [lo, hi] = [Math.min(vf, vg), Math.max(vf, vg)];
          if (p.v < lo * (1 - 1e-3) || p.v > hi * (1 + 1e-3))
            out.push(`state ${st.name}: x = ${x} drawn outside v_f to v_g`);
          if (v !== undefined && vg !== vf && !near((v - vf) / (vg - vf), x, 2e-3))
            out.push(
              `state ${st.name}: x = ${x} but (v − v_f) ÷ (v_g − v_f) = ${(v - vf) / (vg - vf)}`,
            );
        }
      } else if (!p.why && p.region === 'mixture' && (x < 0 || x > 1))
        out.push(`state ${st.name}: x = ${x} drawn under the dome`);
    }
  } else {
    const gas = gasConstants(spec, get);
    // An isentropic gas step: T₂ ÷ T₁ = (P₂ ÷ P₁)^((k − 1) ÷ k), and compression heats.
    for (const step of spec.steps ?? []) {
      const [a, b] = [pts.get(step.from), pts.get(step.to)];
      if (step.process !== 'isentropic' || !a || !b || gas.k === undefined) continue;
      if (a.T === undefined || b.T === undefined || a.P === undefined || b.P === undefined)
        continue;
      const ratio = (b.P / a.P) ** ((gas.k - 1) / gas.k);
      if (!near(b.T / a.T, ratio, 2e-3))
        out.push(
          `isentropic ${step.from}→${step.to}: T ratio ${b.T / a.T}, pressures give ${ratio}`,
        );
      if (b.P > a.P && !(b.T > a.T)) out.push(`compression ${step.from}→${step.to} doesn't heat`);
    }
    // The real compressor exit lies right of (and above) the ideal one at the same P.
    const ideal = spec.states?.find((s) => s.ideal);
    const actual = spec.steps?.find((s) => s.process === 'actual');
    if (ideal && actual) {
      const [pi, pa] = [pts.get(ideal.name), pts.get(actual.to)];
      if (pi?.s !== undefined && pa?.s !== undefined && pi.T !== undefined && pa.T !== undefined) {
        // (the same point at η = 1, within rounding)
        if (pa.s < pi.s - 1e-4 * Math.max(1, Math.abs(pi.s)))
          out.push(`real state ${actual.to} not right of the ideal ${ideal.name}`);
        if (pa.T < pi.T * (1 - 1e-4))
          out.push(`real state ${actual.to} not hotter than the ideal ${ideal.name}`);
      }
    }
    // Δs as labelled equals the drawn states' difference.
    if (spec.ds) {
      const [a, b, D] = [pts.get(spec.ds.from), pts.get(spec.ds.to), get(spec.ds.value)];
      if (a?.s !== undefined && b?.s !== undefined && D !== undefined && !near(b.s - a.s, D, 2e-3))
        out.push(`Δs labelled ${D}, drawn ${b.s - a.s}`);
    }
    // The Brayton cycle runs T₂ > T₁ and T₃ > T₄.
    if (spec.cycle === 'brayton') {
      const T = (n: string) => pts.get(n)?.T;
      const [t1, t2, t3, t4] = ['1', '2', '3', '4'].map(T);
      if (t1 !== undefined && t2 !== undefined && !(t2 > t1)) out.push('Brayton: T₂ ≤ T₁');
      if (t3 !== undefined && t4 !== undefined && !(t3 > t4)) out.push('Brayton: T₃ ≤ T₄');
    }
  }

  // Isentropic steps are vertical on T–s.
  if (spec.plane === 'Ts')
    for (const step of spec.steps ?? []) {
      const [a, b] = [pts.get(step.from), pts.get(step.to)];
      if (step.process === 'isentropic' && a?.s !== undefined && b?.s !== undefined)
        if (Math.abs(a.s - b.s) > 1e-3 * Math.max(1, Math.abs(a.s)))
          out.push(`isentropic ${step.from}→${step.to} not vertical: s ${a.s} to ${b.s}`);
    }

  // A real gas's isotherm: the state on it, and the ideal one met at large V.
  const it = spec.isotherm;
  if (it) {
    const [T, R, a, b] = [get(it.T), get(it.R), get(it.a), get(it.b)];
    const fP = { bar: 1e5, kPa: 1e3, MPa: 1e6 }[spec.units?.P ?? 'bar'] ?? 1e5;
    const fV = spec.units?.V === 'm³/mol' ? 1 : 1e-3;
    if (
      it.model === 'vdw' &&
      T !== undefined &&
      R !== undefined &&
      a !== undefined &&
      b !== undefined
    ) {
      const [V, P] = [get(it.V), get(it.P)];
      if (V !== undefined && P !== undefined && !near(vdwP(T, V * fV, a, b, R), P * fP, 2e-3))
        out.push(`vdW state: P = ${P}, the isotherm gives ${vdwP(T, V * fV, a, b, R) / fP}`);
      const far = 1000 * Math.max(b, a / (R * T));
      if (!near(vdwP(T, far, a, b, R), (R * T) / far, 0.02))
        out.push('vdW isotherm does not meet the ideal one at large V');
      const crit = vdwCritical(a, b, R);
      if (!(crit.P > 0 && crit.V > b)) out.push('vdW critical point not drawn right of b');
    }
    if (it.model === 'virial' && T !== undefined && R !== undefined) {
      const [Z, P] = [get(it.Z), get(it.P)];
      if (Z !== undefined && !(Z > 0)) out.push(`virial Z = ${Z} not positive`);
      if (P !== undefined && !(P > 0)) out.push(`virial P = ${P} not positive`);
    }
  }
  return out;
}

/** HC23: each drop is q × its R, and the drawn profiles meet the page's values. */
function thermalIssues(spec: ThermalWallSpec, get: PdGetter): string[] {
  const out: string[] = [];
  const len = (x: NumOrVar | undefined) => {
    const v = get(x);
    return v === undefined ? undefined : v * (spec.si ?? 1);
  };
  const has = (...xs: (number | undefined)[]) => xs.every((x) => x !== undefined);
  if (spec.mode === 'wall') {
    const layers = (spec.layers ?? []).map((l) => ({ L: len(l.L), k: get(l.k) }));
    const [Tin, Tout, hIn, hOut, q] = [
      get(spec.Tin),
      get(spec.Tout),
      get(spec.hIn),
      get(spec.hOut),
      get(spec.q),
    ];
    const films =
      (spec.hIn === undefined || hIn !== undefined) &&
      (spec.hOut === undefined || hOut !== undefined);
    if (!films || layers.some((l) => l.L === undefined || l.k === undefined)) return out;
    const Rs = wallResistances(
      spec.hIn !== undefined ? hIn : undefined,
      layers.map((l) => ({ L: l.L!, k: l.k! })),
      spec.hOut !== undefined ? hOut : undefined,
    ).map((r) => r.R);
    const total = Rs.reduce((a, b) => a + b, 0);
    const R = get(spec.R);
    if (R !== undefined && !near(R, total)) out.push(`wall: R = ${R}, the parts add to ${total}`);
    if (Tin !== undefined && Tout !== undefined) {
      // The drops, each q × R, add up to T_in − T_out: the profile ends at T_out.
      const nodes = seriesTemperatures(Tin, q ?? (Tin - Tout) / total, Rs);
      const end = nodes[nodes.length - 1]!;
      if (Math.abs(end - Tout) > 2e-3 * Math.max(1, Math.abs(Tin - Tout)))
        out.push(`wall: the profile ends at ${end}, not T_out = ${Tout}`);
    }
  } else if (spec.mode === 'cylinder') {
    const [r1, r2, k, h, Lc] = [
      len(spec.r1),
      len(spec.r2),
      get(spec.k),
      get(spec.h),
      get(spec.length),
    ];
    const [Rcond, Rconv, q, rc] = [
      get(spec.Rcond) ?? get(spec.R),
      get(spec.Rconv),
      get(spec.q),
      len(spec.rc),
    ];
    if (r1 !== undefined && r2 !== undefined && k !== undefined && Rcond !== undefined && r2 > r1) {
      const want = cylinderR(r1, r2, k, Lc ?? 1);
      if (!near(Rcond, want)) out.push(`cylinder: R_cond = ${Rcond}, ln(r₂ ÷ r₁) ÷ 2πkL = ${want}`);
    }
    if (r2 !== undefined && h !== undefined && Rconv !== undefined) {
      const want = filmR(r2, h, Lc ?? 1);
      if (!near(Rconv, want)) out.push(`cylinder: R_conv = ${Rconv}, 1 ÷ 2πr₂h = ${want}`);
    }
    if (k !== undefined && h !== undefined && rc !== undefined && !near(rc, k / h))
      out.push(`cylinder: r_c = ${rc}, k ÷ h = ${k / h}`);
    const [Ti, To] = [get(spec.Tin), get(spec.Tout)];
    const dT = get(spec.dT) ?? (Ti !== undefined && To !== undefined ? Ti - To : undefined);
    const Rt =
      Rcond !== undefined ? Rcond + (spec.h !== undefined ? (Rconv ?? NaN) : 0) : undefined;
    if (dT !== undefined && q !== undefined && Rt !== undefined && Number.isFinite(Rt))
      if (!near(q, dT / Rt)) out.push(`cylinder: q = ${q}, ΔT ÷ ΣR = ${dT / Rt}`);
  } else if (spec.mode === 'fin') {
    const [h, k, D, L, th, m, q] = [
      get(spec.h),
      get(spec.k),
      len(spec.D),
      len(spec.L),
      get(spec.thetaB),
      get(spec.m),
      get(spec.q),
    ];
    if (h !== undefined && k !== undefined && D !== undefined && h > 0 && k > 0 && D > 0) {
      const mm = finM(h, k, D);
      if (m !== undefined && !near(m, mm)) out.push(`fin: m = ${m}, √(4h ÷ kD) = ${mm}`);
      if (L !== undefined && th !== undefined && q !== undefined) {
        const want = finQ(h, k, D, L, th);
        if (!near(q, want)) out.push(`fin: q = ${q}, drawn ${want}`);
      }
      if (L !== undefined && L > 0 && !(finTheta(L, mm, L) <= 1))
        out.push('fin: the tip is hotter than the base');
    }
  } else if (spec.mode === 'tube') {
    const [D, h, k, Nu, V, nu, Re] = [
      len(spec.D),
      get(spec.h),
      get(spec.k),
      get(spec.Nu),
      get(spec.V),
      get(spec.nu),
      get(spec.Re),
    ];
    if (has(D, h, k, Nu) && !near(h!, (Nu! * k!) / D!))
      out.push(`tube: h = ${h}, Nu k ÷ D = ${(Nu! * k!) / D!}`);
    if (has(D, V, nu, Re) && !near(Re!, (V! * D!) / nu!))
      out.push(`tube: Re = ${Re}, VD ÷ ν = ${(V! * D!) / nu!}`);
  } else if (spec.mode === 'radiation') {
    const [eps, sigma, Ts, Tsu, A, q] = [
      get(spec.eps),
      get(spec.sigma),
      get(spec.Ts),
      get(spec.Tsurr),
      get(spec.A),
      get(spec.q),
    ];
    if (Ts !== undefined && !(Ts > 0)) out.push(`radiation: T_s = ${Ts} K is not above 0 K`);
    if (has(eps, sigma, Ts, Tsu)) {
      const [o, i] = [radiant(eps!, sigma!, Ts!), radiant(eps!, sigma!, Tsu!)];
      if (i > 0 && !near(o / i, (Ts! / Tsu!) ** 4))
        out.push('radiation: arrows not in the ratio (T_s ÷ T_surr)⁴');
      if (has(A, q) && Math.abs(q! - A! * (o - i)) > 1e-3 * A! * Math.max(o, i))
        out.push(`radiation: q = ${q}, εσA(T_s⁴ − T_surr⁴) = ${A! * (o - i)}`);
    }
  } else if (spec.mode === 'wire') {
    const [S, R, k, Ts, Tc] = [
      get(spec.S),
      len(spec.radius),
      get(spec.k),
      get(spec.Ts),
      get(spec.Tc),
    ];
    if (has(S, R, k, Ts, Tc) && k! > 0) {
      const rise = wireT(0, R!, S!, k!, Ts!) - Ts!;
      if (!near(Tc! - Ts!, rise, 2e-3))
        out.push(`wire: T_c − T_s = ${Tc! - Ts!}, SR² ÷ 4k = ${rise}`);
    }
  }
  return out;
}

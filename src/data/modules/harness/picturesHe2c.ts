/**
 * Picture checks for the college round 2 group C kinds (`typesHe2c.ts`): HC17
 * `propertyDiagram`. What each draws must agree with the values and the physics. Called from
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

import type { NumOrVar } from '../typesGraphs';
import type { PdState, PropertyDiagramSpec } from '../typesHe2c';
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

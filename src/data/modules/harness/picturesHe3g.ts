/**
 * Picture checks for the college round 3 group G pictures (`typesHe3g.ts`): what each draws
 * must agree with the values. Called from `repIssues` in `pictures.ts`. Values are read in the
 * page's own units (the pictures use the page's constants). Test-only.
 */
import {
  R_J,
  areaUnder,
  pvOutline,
  pvWork,
  solvePv,
  vdw,
} from '@/components/module/reps/gasPvMath';
import { bombSums, stepsAt, stepTops } from '@/components/module/reps/energyHe3gMath';
import { profileAt } from '@/components/module/reps/energyModel';

import type { NumOrVar } from '../typesGraphs';
import type { EnergyProfileSpec, GasPistonSpec } from '../typesHsj';

type Val = (id: string) => number | undefined;

/** Equal to display rounding: values are read as shown (4 figures). */
const near = (a: number, b: number, tol = 2e-3) =>
  Math.abs(a - b) <= tol * Math.max(1e-9, Math.abs(a), Math.abs(b));

const reader = (val: Val) => (x: NumOrVar | undefined) =>
  x === undefined ? undefined : typeof x === 'number' ? x : val(x);

/** HC43: the P–V path, its area and both ends; the van der Waals pressures and Z. */
export function gasHe3gIssues(rep: GasPistonSpec, val: Val): string[] {
  const out: string[] = [];
  const num = reader(val);
  if (rep.pv) {
    const pv = rep.pv;
    const R = pv.R ?? R_J;
    if (pv.path === 'cycle' && (pv.corners?.length ?? 0) !== (pv.legs?.length ?? -1))
      out.push('gasPiston pv: a cycle needs one leg per corner');
    const s = solvePv(pv, num);
    if (s && s.legs.length) {
      const W = pvWork(s);
      const area = areaUnder(pvOutline(s));
      // The shaded area is the work (to 0.1%).
      if (!near(Math.abs(area), Math.abs(W), 1e-3))
        out.push(`gasPiston pv: shaded area ${area} is not |W| = ${Math.abs(W)}`);
      const w = num(pv.work);
      const want = (pv.sign ?? 'by') === 'by' ? W : -W;
      if (w !== undefined && !near(w, want))
        out.push(`gasPiston pv: work ${w}, the path gives ${want}`);
      // PV = nRT at both ends, where the page gives n, P and T.
      const n = num(pv.moles);
      const ends =
        pv.path === 'cycle'
          ? (pv.corners ?? []).map((c) => [c.pressure, c.volume, c.temperature] as const)
          : ([
              [pv.p1, pv.v1, pv.t1],
              [pv.p2, pv.v2 ?? pv.v1, pv.t2],
            ] as const);
      ends.forEach(([p, v, t], i) => {
        const [P, V, T] = [num(p), num(v), num(t)];
        if (n !== undefined && P !== undefined && V !== undefined && T !== undefined)
          if (!near(P * V, n * R * T, 1e-2))
            out.push(`gasPiston pv: state ${i + 1} PV ${P * V} ≠ nRT ${n * R * T}`);
      });
      // P₂ and T₂ by the path.
      if (pv.path !== 'cycle' && s.states.length === 2) {
        const [a, b] = s.states as [(typeof s.states)[0], (typeof s.states)[0]];
        const p2 = num(pv.p2);
        if (p2 !== undefined && pv.path !== 'isochoric' && !near(p2, b.p, 1e-2))
          out.push(`gasPiston pv: P₂ ${p2}, the ${pv.path} path gives ${b.p}`);
        const t2 = num(pv.t2);
        if (t2 !== undefined && b.t !== undefined && !near(t2, b.t, 1e-2))
          out.push(`gasPiston pv: T₂ ${t2}, the ${pv.path} path gives ${b.t}`);
        if (pv.path === 'isothermal' && a.t !== undefined && b.t !== undefined && !near(a.t, b.t))
          out.push('gasPiston pv: the isotherm changes T');
      }
      // Each cycle corner sits on the leg that reaches it.
      if (pv.path === 'cycle')
        s.legs.forEach((leg, i) => {
          const a = s.states[i]!;
          const b = s.states[(i + 1) % s.states.length]!;
          const ok =
            leg === 'isochoric'
              ? near(a.v, b.v, 1e-2)
              : leg === 'isobaric'
                ? near(a.p, b.p, 1e-2)
                : leg === 'isothermal'
                  ? near(a.p * a.v, b.p * b.v, 1e-2)
                  : near(a.p * a.v ** s.gamma, b.p * b.v ** s.gamma, 1e-2);
          if (!ok)
            out.push(`gasPiston pv: corner ${i + 2} is not on the ${leg} leg from corner ${i + 1}`);
        });
    }
  }
  if (rep.real) {
    const R = rep.R ?? 0.08206;
    const [n, V, T, a, b] = [
      num(rep.moles),
      num(rep.volume),
      num(rep.temperature),
      num(rep.real.a),
      num(rep.real.b),
    ];
    if (
      n !== undefined &&
      V !== undefined &&
      T !== undefined &&
      a !== undefined &&
      b !== undefined
    ) {
      if (V <= n * b) out.push('gasPiston real: V is not above nb');
      else {
        const g = vdw(n, V, T, a, b, R);
        const [pid, p, z] = [num(rep.real.ideal), num(rep.real.pressure), num(rep.real.z)];
        if (pid !== undefined && !near(pid, g.ideal, 1e-2))
          out.push(`gasPiston real: P ideal ${pid} ≠ nRT/V ${g.ideal}`);
        if (p !== undefined && !near(p, g.p, 1e-2))
          out.push(`gasPiston real: P ${p} ≠ van der Waals ${g.p}`);
        if (z !== undefined && !near(z, g.p / g.ideal, 1e-2))
          out.push(`gasPiston real: Z ${z} ≠ ${g.p / g.ideal}`);
      }
    }
  }
  return out;
}

/** HC44: each hump's top = level before + its Eₐ, the highest named; the bomb's q, ΔU and ΔH. */
export function energyHe3gIssues(rep: EnergyProfileSpec, val: Val): string[] {
  const out: string[] = [];
  const num = reader(val);
  if (rep.mode === 'bomb') {
    const [C, dT] = [num(rep.constant), num(rep.change)];
    if (C === undefined || dT === undefined) return out;
    const m = num(rep.sample?.mass);
    const M = num(rep.sample?.molar);
    const n = num(rep.sample?.moles) ?? (m !== undefined && M ? m / M : undefined);
    if (n !== undefined && m !== undefined && M !== undefined && !near(n, m / M, 1e-2))
      out.push(`bomb: n ${n} is not m ÷ M = ${m / M}`);
    const s = bombSums(C, dT, n, num(rep.gas), num(rep.temperature), rep.R);
    const [q, dU, dH] = [num(rep.q), num(rep.deltaU), num(rep.deltaH)];
    if (q !== undefined && !near(q, s.q, 1e-2)) out.push(`bomb: q ${q} is not C_cal ΔT = ${s.q}`);
    if (dU !== undefined && s.dU !== undefined && !near(dU, s.dU, 1e-2))
      out.push(`bomb: ΔU ${dU} is not −q ÷ n = ${s.dU}`);
    if (dH !== undefined && s.dH !== undefined && !near(dH, s.dH, 1e-2))
      out.push(`bomb: ΔH ${dH} is not ΔU + Δn RT = ${s.dH}`);
    return out;
  }
  if (rep.mode === 'ladder' || rep.mode === 'calorimeter' || !rep.steps) return out;
  const st = rep.steps;
  if (st.intermediates.length !== st.barriers.length)
    out.push('steps: one intermediate between each pair of steps');
  if (st.barriers.length < 1 || st.barriers.length > 2) out.push('steps: 2 or 3 steps');
  const levels = [rep.reactants, ...st.intermediates, rep.products].map(num);
  const barriers = [rep.activation, ...st.barriers].map(num);
  if (levels.some((x) => x === undefined) || barriers.some((x) => x === undefined)) return out;
  const L = levels as number[];
  const E = barriers as number[];
  const tops = stepTops(L, E);
  const k = E.length;
  // The curve meets each level and each top where it is drawn.
  for (let i = 0; i < k; i++) {
    if (!near(stepsAt((i + 0.5) / k, L, E), tops[i]!, 1e-9))
      out.push(`steps: hump ${i + 1} peaks at ${stepsAt((i + 0.5) / k, L, E)}, not ${tops[i]}`);
    if (!near(profileAt(0, L[i]!, L[i + 1]!, E[i]!), L[i]!, 1e-9)) out.push('steps: level missed');
  }
  (st.tops ?? []).forEach((t, i) => {
    const x = num(t);
    if (x !== undefined && tops[i] !== undefined && !near(x, tops[i]!, 1e-2))
      out.push(`steps: top ${i + 1} ${x} is not ${L[i]} + ${E[i]} = ${tops[i]}`);
  });
  const hi = num(st.highest);
  if (hi !== undefined && !near(hi, Math.max(...tops), 1e-2))
    out.push(`steps: highest ${hi} is not ${Math.max(...tops)}`);
  return out;
}

/**
 * Harness checks for the college round 1 group D options (HC4 time responses, HC9 log and
 * flipped axes) on `functionGraph`. Called from the kind's case in `pictures.ts`. Test-only.
 */
import {
  envelope,
  firstOrder,
  fitTimes,
  freeDecay,
  osFraction,
  peaksOf,
  secondOrder,
} from '@/components/module/reps/functionGraphHe1dMath';
import type { VariableDef } from '@/engine/types';

import type { NumOrVar } from '../typesGraphs';
import type { Representation } from '../types';

type Val = (x: string | number) => number | undefined;
type Spec = Extract<Representation, { kind: 'functionGraph' }>;

/** Within `rel` of each other (relative to the larger, at least 1e-9 absolute). */
const near = (a: number, b: number, rel: number) =>
  Math.abs(a - b) <= rel * Math.max(Math.abs(a), Math.abs(b)) + 1e-9;

/** The checks for a spec `FunctionGraphHe1d` draws. */
export function he1dIssues(rep: Spec, shown: Val, byId: Map<string, VariableDef>): string[] {
  const out: string[] = [];
  // In the formula's units, where the relations (and the picture) hold, whatever the menus show.
  const val: Val = (x) => {
    const v = shown(x);
    return v === undefined || typeof x === 'number' ? v : v * (byId.get(x)?.unitFactor ?? 1);
  };
  const num = (v: NumOrVar | undefined) => (v === undefined ? undefined : val(v));
  if (rep.transient) transientIssues(rep, num, out);
  if (rep.stepResponse) stepIssues(rep, num, byId, out);
  return out;
}

function transientIssues(
  rep: Spec,
  num: (v: NumOrVar | undefined) => number | undefined,
  out: string[],
) {
  const t = rep.transient!;
  const [x0, xf, tau, time, value] = [t.initial, t.final, t.tau, t.time, t.value].map(num);
  const theta = num(t.deadTime) ?? 0;
  if (theta < 0) out.push(`dead time ${theta} is negative`);
  if (t.tau === undefined) {
    // A ramp: by its rate, or through the page's point.
    const rate = num(t.rate);
    if (x0 !== undefined && rate !== undefined && time !== undefined && value !== undefined)
      if (!near(x0 + rate * time, value, 1e-6))
        out.push(`ramp point (${time}, ${value}) is off x₀ + rate × t (${x0 + rate * time})`);
    return;
  }
  // τ ≤ 0 draws no curve (the caption asks for τ): nothing to check.
  if (tau !== undefined && !(tau > 0)) return;
  if (x0 === undefined || xf === undefined || tau === undefined) return;
  const f = firstOrder(x0, xf, tau, theta);
  // The curve has made 63.2% of the change at θ + τ.
  if (!near(f(theta + tau) - x0, 0.632120559 * (xf - x0), 1e-6))
    out.push(`the curve is not at 63.2% of the change at θ + τ`);
  if (time !== undefined && value !== undefined) {
    const y = f(time);
    if (!near(y, value, 1e-6) && Math.abs(y - value) > 1e-9 * Math.max(1, Math.abs(xf - x0)))
      out.push(`point (${time}, ${value}) is off the response (${y})`);
  }
  if (typeof t.points === 'object') {
    const fit = fitTimes(tau, theta);
    const [t28, t63] = [num(t.points.t28), num(t.points.t63)];
    if (t28 !== undefined && !near(t28, fit.t28, 0.005))
      out.push(`t₂₈ ${t28} is not θ + τ/3 (${fit.t28})`);
    if (t63 !== undefined && !near(t63, fit.t63, 0.005))
      out.push(`t₆₃ ${t63} is not θ + τ (${fit.t63})`);
    // 28.3% of the change at t₂₈.
    if (t28 !== undefined && !near(f(t28) - x0, 0.2835 * (xf - x0), 0.01))
      out.push(`the curve is not at 28.3% of the change at t₂₈`);
  }
  errorIssues(rep, num, xf, out);
}

/** The bracketed error is the input's size less the final value. */
function errorIssues(
  rep: Spec,
  num: (v: NumOrVar | undefined) => number | undefined,
  final: number | undefined,
  out: string[],
) {
  if (!rep.error) return;
  const size = rep.stepInput?.size === undefined ? 1 : num(rep.stepInput.size);
  const e = num(rep.error);
  if (size === undefined || e === undefined || final === undefined) return;
  if (!near(e, size - final, 1e-6))
    out.push(`error ${e} is not the input less the final value (${size - final})`);
}

function stepIssues(
  rep: Spec,
  num: (v: NumOrVar | undefined) => number | undefined,
  byId: Map<string, VariableDef>,
  out: string[],
) {
  const s = rep.stepResponse!;
  const wn = num(s.wn);
  const alpha = num(s.alpha);
  const zeta = num(s.zeta) ?? (alpha !== undefined && wn ? alpha / wn : undefined);
  const k = s.gain === undefined ? 1 : num(s.gain);
  // (ωₙ ≤ 0 or ζ < 0 draws no curve: nothing to check.)
  if (wn === undefined || zeta === undefined || k === undefined || !(wn > 0) || !(zeta >= 0))
    return;
  const so = secondOrder(zeta, wn);
  const pct = (id: string) => byId.get(id)?.unit === '%';
  if (s.mode === 'oscillation') {
    const f = freeDecay(so, k);
    const env = envelope(so, k);
    const end = Math.min(zeta > 0 ? 4 * so.halfLife : 50 / wn, 60 / wn);
    // The envelope bounds every peak.
    for (const p of peaksOf(f, end))
      if (Math.abs(p.y) > env(p.t) * (1 + 1e-6) + 1e-12)
        out.push(`a peak at ${p.t} (${p.y}) is outside the envelope (${env(p.t)})`);
    const half = num(s.halfLife);
    if (half !== undefined && zeta > 0 && !near(half, so.halfLife, 0.005))
      out.push(`t½ ${half} is not ln 2 ÷ (ζωₙ) (${so.halfLife})`);
  } else {
    const f = (t: number) => k * so.step(t);
    if (zeta < 1 && so.tp !== undefined && k !== 0) {
      // The first peak ÷ the final value is 1 + OS, at T_p.
      const first = peaksOf(f, so.tp * 1.5)[0];
      if (!first || !near(first.y / k, 1 + so.os, 0.005))
        out.push(`the first peak ÷ final (${first ? first.y / k : 'none'}) is not 1 + OS`);
      else if (!near(first.t, so.tp, 0.005)) out.push(`the first peak is at ${first.t}, not T_p`);
    }
    if (s.overshoot) {
      const v = num(s.overshoot);
      if (v !== undefined && !near(osFraction(v, pct(s.overshoot)), so.os, 0.005))
        out.push(`overshoot ${v} is not the drawn ${so.os * 100}%`);
    }
    const tp = num(s.peak);
    if (tp !== undefined && so.tp !== undefined && !near(tp, so.tp, 0.005))
      out.push(`T_p ${tp} is not π ÷ ω_d (${so.tp})`);
    const ts = num(s.settling);
    if (
      ts !== undefined &&
      !near(ts, so.ts, 0.01) &&
      !(so.tsEnvelope !== undefined && near(ts, so.tsEnvelope, 0.01))
    )
      out.push(`T_s ${ts} is neither 4 ÷ σ (${so.ts}) nor the envelope's entry to the band`);
    const decay = num(s.decay);
    if (decay !== undefined && so.decay !== undefined) {
      if (!near(decay, so.decay, 0.005)) out.push(`decay ratio ${decay} is not OS² (${so.decay})`);
      // The next peak's overshoot ÷ the first's is the decay ratio.
      const ps = peaksOf(f, (so.tp ?? 0) + (so.period ?? 0) * 1.3).filter((p) => p.y > k);
      if (
        so.decay > 1e-4 &&
        ps.length >= 2 &&
        !near((ps[1]!.y - k) / (ps[0]!.y - k), so.decay, 0.005)
      )
        out.push(`the drawn peaks' decay ratio is not OS²`);
    }
    errorIssues(rep, num, k, out);
  }
  const per = num(s.period);
  if (per !== undefined && so.period !== undefined)
    if (!near(per, so.period, 0.01) && !near(per, (2 * Math.PI) / wn, 0.01))
      out.push(`period ${per} is not 2π ÷ ω_d (${so.period})`);
  const [time, value] = [num(s.time), num(s.value)];
  if (time !== undefined && value !== undefined) {
    const y = s.mode === 'oscillation' ? freeDecay(so, k)(time) : k * so.step(time);
    if (!near(y, value, 1e-6)) out.push(`point (${time}, ${value}) is off the response (${y})`);
  }
}

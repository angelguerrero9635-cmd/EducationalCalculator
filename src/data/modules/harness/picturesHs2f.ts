/**
 * Picture checks for the Grades 9–12 round 2 group F options (`typesHs2f.ts`, earth and space
 * H103): what each one draws must agree with the values and with the science. Called from
 * `repIssues` in `pictures.ts` beside the kind's own checks. Test-only.
 */
import {
  amplitudeRatio,
  energyRatio,
  MAGNITUDE_RANGE,
} from '@/components/module/reps/earthModelHs2f';

import type { Representation } from '../types';

/** Equal to display rounding. */
const near = (a: number, b: number, tol = 1e-6) =>
  Math.abs(a - b) <= tol * Math.max(1, Math.abs(a), Math.abs(b));

export function hs2fIssues(rep: Representation, val: (id: string) => number | undefined): string[] {
  const out: string[] = [];
  const num = (x: string | number | undefined, d?: number) => {
    const y = x === undefined ? d : typeof x === 'number' ? x : val(x);
    return y === undefined || Number.isNaN(y) ? undefined : y;
  };
  if (rep.kind === 'earthLayers' && rep.mode === 'magnitude') {
    const m1 = num(rep.m1);
    const m2 = num(rep.m2);
    for (const m of [m1, m2])
      if (m !== undefined && (m < MAGNITUDE_RANGE.min || m > MAGNITUDE_RANGE.max))
        out.push(`magnitude ${m} is off the 0–10 scale`);
    if (m1 === undefined || m2 === undefined) return out;
    // The bracket and caption say 10^ΔM and 10^(1.5 ΔM): the page's values must agree.
    const a = num(rep.amplitude);
    if (a !== undefined && !near(a, amplitudeRatio(m1, m2), 1e-4))
      out.push(`amplitude ratio ${a}, but 10^(${m2} − ${m1}) = ${amplitudeRatio(m1, m2)}`);
    const e = num(rep.energy);
    if (e !== undefined && !near(e, energyRatio(m1, m2), 1e-4))
      out.push(`energy ratio ${e}, but 10^(1.5 × (${m2} − ${m1})) = ${energyRatio(m1, m2)}`);
  }
  return out;
}

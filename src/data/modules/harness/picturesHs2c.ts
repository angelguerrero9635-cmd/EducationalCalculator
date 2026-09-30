/**
 * Picture checks for the Grades 9–12 round 2 physics pictures of group H2C (`typesHs2c.ts`,
 * and the options this group adds to round 1's kinds): what each one draws must agree with the
 * values. Called from `repIssues` in `pictures.ts`. Test-only. Pages on these pictures use SI
 * units (nm and eV where the spec says so).
 */
import type { VariableDef } from '@/engine/types';
import { G_NEWTON as G } from '@/components/module/reps/hskMath';

import type { Hs2cSpec } from '../typesHs2c';
import type { CircularMotionSpec } from '../typesHsk';

type Val = (id: string) => number | undefined;

/** Equal to 1e-5 of the larger (values are rounded when shown, then worked on). */
const near = (a: number, b: number) =>
  Math.abs(a - b) <= 1e-5 * Math.max(1, Math.abs(a), Math.abs(b));

/** A reader of formula (SI) units from one of shown units. */
export const siOf =
  (val: Val, byId: Map<string, VariableDef>): Val =>
  (id) => {
    const x = val(id);
    return x === undefined ? x : x * (byId.get(id)?.unitFactor ?? 1);
  };

const read = (val: Val, x: number | string | undefined, fallback?: number) =>
  x === undefined ? fallback : typeof x === 'number' ? x : val(x);

/** The new picture kinds of group H2C. `val` reads formula units (see `siOf`). */
export function hs2cIssues(rep: Hs2cSpec, val: Val): string[] {
  const out: string[] = [];
  const same = (id: string | undefined, want: number, what: string) => {
    const x = id ? val(id) : undefined;
    if (x !== undefined && Number.isFinite(want) && !near(x, want))
      out.push(`${rep.kind}: ${what} ${id} = ${x}, the picture draws ${want}`);
  };
  switch (rep.kind) {
    case 'impulse': {
      const [m, v0, v, t, t2] = [
        read(val, rep.mass),
        read(val, rep.before),
        read(val, rep.after),
        read(val, rep.time),
        read(val, rep.compare),
      ];
      if (m !== undefined && m <= 0) out.push(`impulse: mass ${m} is not positive`);
      if (t !== undefined && t <= 0) out.push(`impulse: time ${t} is not positive`);
      if (t2 !== undefined && t2 <= 0) out.push(`impulse: compared time ${t2} is not positive`);
      if (m === undefined || v0 === undefined || v === undefined) break;
      const dp = m * (v - v0);
      same(rep.change, dp, 'Δp');
      if (t !== undefined && t > 0) same(rep.force, dp / t, 'average force');
      break;
    }
  }
  return out;
}

/** H102: a satellite's speed √(GM/r), its acceleration GM/r² and period 2πr/v. SI values. */
export function satelliteIssues(rep: CircularMotionSpec, val: Val): string[] {
  const out: string[] = [];
  const [M, r, R] = [
    read(val, rep.central, 5.97e24),
    read(val, rep.radius),
    read(val, rep.bodyRadius),
  ];
  if (M !== undefined && M <= 0) out.push(`circularMotion: central mass ${M} is not positive`);
  if (r !== undefined && r <= 0) out.push(`circularMotion: orbit radius ${r} is not positive`);
  if (R !== undefined && R < 0) out.push(`circularMotion: body radius ${R} is negative`);
  if (M === undefined || r === undefined || M <= 0 || r <= 0) return out;
  const v = Math.sqrt((G * M) / r);
  const check = (id: string | undefined, want: number, what: string) => {
    const x = id ? val(id) : undefined;
    if (x !== undefined && !near(x, want))
      out.push(`circularMotion: ${what} ${id} = ${x}, the picture draws ${want}`);
  };
  check(typeof rep.speed === 'string' ? rep.speed : undefined, v, 'orbital speed √(GM/r)');
  check(rep.acceleration, (G * M) / (r * r), 'acceleration GM/r²');
  check(rep.period, (2 * Math.PI * r) / v, 'period 2πr/v');
  return out;
}

/** The smallest 1, 2 or 5 × 10ⁿ at least `x` (as `hsdGrid.niceStep`, which draws the dots). */
function niceStep(x: number): number {
  if (!(x > 0)) return 1;
  const pow = 10 ** Math.floor(Math.log10(x));
  const n = x / pow;
  return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10) * pow;
}

/**
 * H102: a vertical strobe (`motionGraph` kinematics `strobe: 'vertical'`) dots the position at
 * equal steps of a nice time: from 1 to 12 steps once time has passed.
 */
export function strobeColumnIssues(t: number | undefined): string[] {
  if (t === undefined || t <= 0) return [];
  const steps = Math.floor(t / niceStep(t / 10) + 1e-9);
  return steps >= 1 && steps <= 12 ? [] : [`motionGraph: a vertical strobe of ${steps} steps`];
}

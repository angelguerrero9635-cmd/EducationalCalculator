/**
 * Picture checks for the Grades 9–12 physics pictures of group HK (`typesHsk.ts`): what each
 * one draws must agree with the values. Called from `repIssues` in `pictures.ts`. Test-only.
 * Values are read in the shown units; pages built on these pictures use SI units.
 */
import type { MotionGraphSpec } from '../typesMechanics';

/** Equal to 1e-6 of the larger (values are rounded to 9 places when shown). */
const near = (a: number, b: number) =>
  Math.abs(a - b) <= 1e-6 * Math.max(1, Math.abs(a), Math.abs(b));

type Val = (id: string) => number | undefined;
const read = (val: Val, x: number | string | undefined, fallback?: number) =>
  x === undefined ? fallback : typeof x === 'number' ? x : val(x);

/**
 * H58: the tangent's slope is the velocity at t₁ (v₀ + a t₁), and t₁ is not before the start.
 * `val` reads formula units (m, s, m/s).
 */
export function motionKinematicsIssues(rep: MotionGraphSpec, val: Val): string[] {
  const out: string[] = [];
  const k = rep.kinematics;
  if (!k || rep.graph !== 'speed') return out;
  const [a, v0] = [val(rep.acceleration), read(val, rep.start, 0)];
  const t1 = k.at ? val(k.at) : undefined;
  const v1 = k.slope ? val(k.slope) : undefined;
  if (k.view === 'position' && !k.at) out.push('a position view needs the tangent time `at`');
  if (t1 !== undefined && t1 < 0) out.push(`tangent time ${t1} is before the start`);
  if (t1 !== undefined && v1 !== undefined && a !== undefined && v0 !== undefined)
    if (!near(v1, v0 + a * t1)) out.push(`tangent slope ${v1} is not v₀ + a t₁ = ${v0 + a * t1}`);
  return out;
}

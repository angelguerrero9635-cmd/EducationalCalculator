/**
 * Picture checks for the Grades 9–12 physics pictures of group HK (`typesHsk.ts`): what each
 * one draws must agree with the values. Called from `repIssues` in `pictures.ts`. Test-only.
 * Values are read in the shown units; pages built on these pictures use SI units.
 */
import type { VariableDef } from '@/engine/types';
import { projectileOf } from '@/components/module/reps/hskMath';

import type { MotionGraphSpec } from '../typesMechanics';
import type { HskSpec } from '../typesHsk';

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

/**
 * The new picture kinds of group HK. `val` reads shown values; `byId` gives each variable's
 * factor to formula (SI) units, so a page shown in cm/s or km/h is checked in m/s.
 */
export function hskIssues(rep: HskSpec, val: Val, byId: Map<string, VariableDef>): string[] {
  const out: string[] = [];
  const si: Val = (id) => {
    const x = val(id);
    return x === undefined ? x : x * (byId.get(id)?.unitFactor ?? 1);
  };
  const same = (id: string | undefined, want: number, what: string) => {
    const x = id ? si(id) : undefined;
    if (x !== undefined && Number.isFinite(want) && !near(x, want))
      out.push(`${rep.kind}: ${what} ${id} = ${x}, the picture draws ${want}`);
  };
  switch (rep.kind) {
    case 'projectile': {
      const [v, th, h] = [si(rep.speed), si(rep.angle), read(si, rep.height, 0)];
      if (v !== undefined && v < 0) out.push(`projectile: launch speed ${v} is negative`);
      if (th !== undefined && (th < -90 || th > 90))
        out.push(`projectile: angle ${th}° is not from −90° to 90°`);
      if (h !== undefined && h < 0) out.push(`projectile: launch height ${h} is below the ground`);
      if (v === undefined || th === undefined || h === undefined || h < 0) break;
      const p = projectileOf(v, th, h, rep.g);
      same(rep.vx, p.vx, 'vₓ');
      same(rep.vy, p.vy, 'v_y');
      same(rep.time, p.T, 'flight time');
      same(rep.range, p.R, 'range');
      same(rep.peak, p.H, 'maximum height');
      const t = rep.at ? si(rep.at) : undefined;
      if (t !== undefined) {
        if (t < 0) out.push(`projectile: time ${t} is before the launch`);
        same(rep.x, p.vx * t, 'x');
        same(rep.y, h + p.vy * t - ((rep.g ?? 9.8) * t * t) / 2, 'y');
      }
      break;
    }
  }
  return out;
}

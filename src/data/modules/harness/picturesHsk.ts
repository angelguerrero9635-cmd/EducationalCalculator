/**
 * Picture checks for the Grades 9–12 physics pictures of group HK (`typesHsk.ts`): what each
 * one draws must agree with the values. Called from `repIssues` in `pictures.ts`. Test-only.
 * Values are read in the shown units; pages built on these pictures use SI units.
 */
import type { VariableDef } from '@/engine/types';
import { freeBodyOf, projectileOf } from '@/components/module/reps/hskMath';

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
    case 'freeBody': {
      const m = si(rep.mass);
      if (m !== undefined && m < 0) out.push(`freeBody: mass ${m} is negative`);
      const th = read(si, rep.incline, 0);
      if (rep.support === 'incline' && th !== undefined && (th < 0 || th >= 90))
        out.push(`freeBody: incline ${th}° is not from 0° to 90°`);
      const parts = [rep.applied, rep.appliedAngle, rep.tension, rep.tensionAngle, rep.friction];
      const vals = parts.map((x) => read(si, x, 0));
      if (m === undefined || th === undefined || vals.some((x) => x === undefined)) break;
      const [F, phi, T, psi, f] = vals as [number, number, number, number, number];
      for (const [x, what] of [
        [F, 'applied force'],
        [T, 'tension'],
        [f, 'friction'],
      ] as const)
        if (x! < 0) out.push(`freeBody: ${what} ${x} is negative`);
      const dir = rep.moving === 'right' || rep.moving === 'up' ? 1 : rep.moving ? -1 : undefined;
      const fb = freeBodyOf({
        support: rep.support,
        m,
        g: rep.g ?? 9.8,
        theta: th,
        F,
        phi,
        T,
        psi,
        f,
        moving: dir,
      });
      // Net along the motion, signed; else its size (a rope's up or down counted either way).
      const rad = (th * Math.PI) / 180;
      const signed = dir
        ? dir *
          (rep.support === 'incline'
            ? fb.net.x * Math.cos(rad) + fb.net.y * Math.sin(rad)
            : fb.net.x)
        : undefined;
      same(rep.weight, fb.W, 'weight');
      if (rep.support !== 'hanging') same(rep.normal, fb.N, 'normal force');
      same(rep.along, fb.W * Math.sin((th * Math.PI) / 180), 'weight down the slope');
      const net = rep.net ? si(rep.net) : undefined;
      // A net force the page counts signed (up or down a rope) is compared by size.
      const cmp = (x: number, want: number) =>
        signed !== undefined ? near(x, want) : near(Math.abs(x), Math.abs(want));
      const want = signed ?? fb.netSize;
      if (net !== undefined && !cmp(net, want))
        out.push(`freeBody: net force ${net} is not the arrows' sum ${want}`);
      if (m > 0) {
        const a = rep.acceleration ? si(rep.acceleration) : undefined;
        if (a !== undefined && !cmp(a, want / m))
          out.push(`freeBody: acceleration ${a} is not F_net/m = ${fb.netSize / m}`);
      }
      break;
    }
  }
  return out;
}

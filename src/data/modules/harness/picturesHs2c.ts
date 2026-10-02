/**
 * Picture checks for the Grades 9–12 round 2 physics pictures of group H2C (`typesHs2c.ts`,
 * and the options this group adds to round 1's kinds): what each one draws must agree with the
 * values. Called from `repIssues` in `pictures.ts`. Test-only. Pages on these pictures use SI
 * units (nm and eV where the spec says so).
 */
import type { VariableDef } from '@/engine/types';
import { fieldAtPoint, G_NEWTON as G } from '@/components/module/reps/hskMath';

import type { Hs2cSpec } from '../typesHs2c';
import type { ChargePlatesSpec, ChargesSpec, CircularMotionSpec, FreeBodySpec } from '../typesHsk';
import type { GasPistonSpec } from '../typesHsj';

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
    case 'powerLift': {
      const [m, h, t] = [read(val, rep.mass), read(val, rep.height), read(val, rep.time)];
      if (m !== undefined && m < 0) out.push(`powerLift: mass ${m} is negative`);
      if (h !== undefined && h < 0) out.push(`powerLift: height ${h} is negative`);
      if (t !== undefined && t <= 0) out.push(`powerLift: time ${t} is not positive`);
      if (m === undefined || h === undefined) break;
      const W = m * (rep.g ?? 9.8) * h;
      same(rep.work, W, 'work mgh');
      if (t !== undefined && t > 0) same(rep.power, W / t, 'power W/t');
      break;
    }
    case 'photoelectric': {
      // In nm and eV, as the picture reads them (hc = 1240 eV·nm).
      const [lam, phi] = [read(val, rep.wavelength), read(val, rep.workFunction)];
      // `blank` hides a "?" value; a typed number is never "?", so it would hide nothing.
      if (rep.blank && typeof rep.wavelength === 'number' && typeof rep.workFunction === 'number')
        out.push('photoelectric: blank with no variable to leave unknown');
      if (lam !== undefined && lam <= 0)
        out.push(`photoelectric: wavelength ${lam} is not positive`);
      if (phi !== undefined && phi < 0) out.push(`photoelectric: work function ${phi} is negative`);
      if (lam !== undefined && lam > 0) same(rep.energy, 1240 / lam, 'photon energy 1240/λ');
      if (phi !== undefined && phi > 0) same(rep.threshold, 1240 / phi, 'threshold 1240/φ');
      if (lam !== undefined && lam > 0 && phi !== undefined) {
        const K = 1240 / lam - phi;
        const named = rep.kinetic ? val(rep.kinetic) : undefined;
        // Below the threshold no electron leaves: K_max is 0 or left unsolved, never negative.
        if (named !== undefined && K > 0) same(rep.kinetic, K, 'K_max E − φ');
        if (named !== undefined && named < 0) out.push(`photoelectric: K_max ${named} is negative`);
      }
      break;
    }
    case 'lightClock': {
      const b = read(val, rep.speed);
      if (b === undefined) break;
      if (b < 0 || b >= 1) {
        out.push(`lightClock: speed ${b} c is not from 0 to below 1`);
        break;
      }
      const g = 1 / Math.sqrt(1 - b * b);
      same(rep.gamma, g, 'γ');
      const t0 = read(val, rep.proper);
      if (t0 !== undefined) same(rep.dilated, g * t0, 'Δt = γΔt₀');
      const L0 = read(val, rep.length);
      if (L0 !== undefined) same(rep.contracted, L0 / g, 'L = L₀/γ');
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

/** H102: a floor block's displacement d (not negative) and the pull's work Fd cos θ. SI values. */
export function freeBodyWorkIssues(rep: FreeBodySpec, val: Val): string[] {
  const out: string[] = [];
  if (rep.displacement === undefined && rep.work === undefined) return out;
  if (rep.support !== 'floor') out.push('freeBody: a displacement is drawn on a floor only');
  if (rep.work !== undefined && rep.displacement === undefined)
    out.push('freeBody: work needs a displacement');
  const d = read(val, rep.displacement);
  if (d !== undefined && d < 0) out.push(`freeBody: displacement ${d} is negative`);
  const F = read(val, rep.applied ?? rep.tension, 0);
  const th = read(val, rep.applied !== undefined ? rep.appliedAngle : rep.tensionAngle, 0);
  const W = rep.work ? val(rep.work) : undefined;
  if (d === undefined || F === undefined || th === undefined || W === undefined) return out;
  const want = F * d * Math.cos((th * Math.PI) / 180);
  if (!near(W, want)) out.push(`freeBody: work ${rep.work} = ${W}, the picture draws ${want}`);
  return out;
}

/** H102: the gas piston's first law, ΔU = Q − W. SI values. */
export function gasEnergyIssues(rep: GasPistonSpec, val: Val): string[] {
  const e = rep.energy;
  if (!e) return [];
  const out: string[] = [];
  if (rep.law !== 'ideal' || rep.before || rep.pressure || rep.volume || rep.temperature)
    out.push('gasPiston: the first law draws no gas state (law ideal, no values)');
  const [Q, W] = [read(val, e.heat), read(val, e.work)];
  const U = e.change ? val(e.change) : undefined;
  if (Q !== undefined && W !== undefined && U !== undefined && !near(U, Q - W))
    out.push(`gasPiston: ΔU ${e.change} = ${U}, the picture draws Q − W = ${Q - W}`);
  return out;
}

/** H102: plates' field E = V/d and the force F = qE on the charge. SI values. */
export function platesIssues(rep: ChargePlatesSpec, val: Val): string[] {
  const out: string[] = [];
  const [V, d, q] = [read(val, rep.voltage), read(val, rep.gap), read(val, rep.charge)];
  if (d !== undefined && d <= 0) out.push(`charges: plate gap ${d} is not positive`);
  if (V === undefined || d === undefined || d <= 0) return out;
  const E = V / d;
  const check = (id: string | undefined, want: number, what: string) => {
    const x = id ? val(id) : undefined;
    if (x !== undefined && !near(x, want))
      out.push(`charges: ${what} ${id} = ${x}, the picture draws ${want}`);
  };
  check(rep.field, E, 'field V/d');
  if (q !== undefined) check(rep.force, q * E, 'force qE');
  return out;
}

/** H102: two charges' field at a point x along their line (signed, + toward q₂'s side). */
export function pointFieldIssues(rep: ChargesSpec, val: Val): string[] {
  if (rep.point === undefined) return [];
  const out: string[] = [];
  if (rep.charges[1] === undefined) out.push('charges: a field point needs two charges');
  const [q1, q2, r, x] = [
    read(val, rep.charges[0]),
    read(val, rep.charges[1]),
    read(val, rep.distance),
    read(val, rep.point),
  ];
  if (q1 === undefined || q2 === undefined || r === undefined || x === undefined) return out;
  if (Math.abs(x) < 1e-12 || Math.abs(x - r) < 1e-12)
    out.push('charges: the field point is on a charge');
  const E = fieldAtPoint(q1, q2, r, x).E;
  const named = rep.field ? val(rep.field) : undefined;
  if (named !== undefined && Number.isFinite(E) && !near(named, E))
    out.push(`charges: field ${rep.field} = ${named}, the picture draws ${E}`);
  return out;
}

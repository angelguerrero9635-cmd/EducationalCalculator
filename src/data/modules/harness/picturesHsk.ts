/**
 * Picture checks for the Grades 9–12 physics pictures of group HK (`typesHsk.ts`): what each
 * one draws must agree with the values. Called from `repIssues` in `pictures.ts`. Test-only.
 * Values are read in the shown units; pages built on these pictures use SI units.
 */
import type { VariableDef } from '@/engine/types';
import * as hm from '@/components/module/reps/hskMath';

import type { EnergyTrackSpec, MotionGraphSpec } from '../typesMechanics';
import type { HskSpec } from '../typesHsk';

const { collisionOf, freeBodyOf, G_NEWTON, heatEngineOf, machineOf, projectileOf, sweptArea } = hm;

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
    case 'circularMotion': {
      if (rep.mode === 'gravity') {
        const [m1, m2] = (rep.masses ?? [1, 1]).map((x) => read(si, x));
        const d = read(si, rep.distance);
        if (m1 === undefined || m2 === undefined || d === undefined) break;
        if (m1 < 0 || m2 < 0 || d <= 0) out.push('circularMotion: a negative mass or distance');
        else same(rep.force, (G_NEWTON * m1 * m2) / (d * d), 'pull Gm₁m₂/r²');
        break;
      }
      if (rep.mode === 'kepler') {
        const [a, e] = [read(si, rep.semiMajor, 1), read(si, rep.eccentricity, 0)];
        if (a === undefined || e === undefined) break;
        if (e < 0 || e > 0.95) out.push(`circularMotion: eccentricity ${e} is not from 0 to 0.95`);
        if (a <= 0) out.push(`circularMotion: semi-major axis ${a} is not positive`);
        if (a <= 0 || e < 0 || e > 0.95) break;
        same(rep.perihelion, a * (1 - e), 'perihelion a(1 − e)');
        same(rep.aphelion, a * (1 + e), 'aphelion a(1 + e)');
        same(rep.period, Math.pow(a, 1.5), 'period (T² = a³)');
        // The two shaded sectors: each 1/8 of the period, each 1/8 of the ellipse's area.
        const whole = Math.PI * a * a * Math.sqrt(1 - e * e);
        for (const M of [0, Math.PI]) {
          const A = sweptArea(a, e, M - Math.PI / 8, M + Math.PI / 8);
          if (Math.abs(A - whole / 8) > 1e-3 * whole)
            out.push(`circularMotion: a sector sweeps ${A}, not 1/8 of ${whole}`);
        }
        break;
      }
      const [r, v, m] = [read(si, rep.radius, 1), read(si, rep.speed, 0), read(si, rep.mass, 1)];
      if (r === undefined || v === undefined || m === undefined) break;
      if (r <= 0 || v < 0) {
        out.push(`circularMotion: radius ${r} or speed ${v} out of range`);
        break;
      }
      same(rep.acceleration, (v * v) / r, 'centripetal acceleration v²/r');
      same(rep.force, (m * v * v) / r, 'centripetal force mv²/r');
      if (v > 0) same(rep.period, (2 * Math.PI * r) / v, 'period 2πr/v');
      break;
    }
    case 'collision': {
      const [m1, m2] = rep.masses.map((x) => read(si, x));
      const v1 = read(si, rep.before[0]);
      const v2 = rep.type === 'explode' ? v1 : read(si, rep.before[1]);
      const first = rep.type === 'explode' ? read(si, rep.after?.[0]) : 0;
      if ([m1, m2, v1, v2, first].some((x) => x === undefined)) break;
      if (m1! <= 0 || m2! <= 0) {
        out.push('collision: a cart with no mass');
        break;
      }
      const [u1, u2] = collisionOf(rep.type, m1!, m2!, v1!, v2!, first);
      const a = rep.after ?? [];
      if (rep.type !== 'explode') same(typeof a[0] === 'string' ? a[0] : undefined, u1, 'v₁ after');
      same(typeof a[1] === 'string' ? a[1] : undefined, u2, 'v₂ after');
      same(rep.momentum, m1! * v1! + m2! * v2!, 'total momentum');
      if (!near(m1! * u1 + m2! * u2, m1! * v1! + m2! * v2!))
        out.push('collision: momentum after is not momentum before');
      const ke = (m: number, v: number) => (m * v * v) / 2;
      same(rep.energy?.[0], ke(m1!, v1!) + ke(m2!, v2!), 'kinetic energy before');
      same(rep.energy?.[1], ke(m1!, u1) + ke(m2!, u2), 'kinetic energy after');
      if (rep.type === 'elastic' && !near(ke(m1!, u1) + ke(m2!, u2), ke(m1!, v1!) + ke(m2!, v2!)))
        out.push('collision: an elastic collision lost kinetic energy');
      break;
    }
    case 'simpleMachine': {
      const [load, Le, Ll, n, L, h, e] = [
        read(si, rep.load),
        read(si, rep.effortArm, 1),
        read(si, rep.loadArm, 1),
        read(si, rep.strands, 1),
        read(si, rep.length, 1),
        read(si, rep.height, 1),
        read(si, rep.efficiency, 100),
      ];
      if ([load, Le, Ll, n, L, h, e].some((x) => x === undefined)) break;
      if (rep.machine === 'pulley' && (n! < 1 || n! > 6 || Math.abs(n! - Math.round(n!)) > 1e-9))
        out.push(`simpleMachine: ${n} strands (a whole number from 1 to 6)`);
      if (e! <= 0 || e! > 100) out.push(`simpleMachine: efficiency ${e}% is not from 0 to 100`);
      const mo = machineOf({
        machine: rep.machine,
        load: load!,
        effortArm: Le!,
        loadArm: Ll!,
        strands: n!,
        length: L!,
        height: h!,
        efficiency: e!,
      });
      same(rep.advantage, mo.ima, 'mechanical advantage');
      if (e! > 0) same(rep.effort, mo.effort, 'effort');
      const [de, dl] = [rep.effortDistance, rep.loadDistance].map((x) => (x ? si(x) : undefined));
      if (de !== undefined && dl !== undefined && !near(de, mo.ima * dl))
        out.push(`simpleMachine: effort moves ${de}, not MA × ${dl}`);
      break;
    }
    case 'heatEngine': {
      const mode = rep.mode ?? 'engine';
      const heat = read(si, mode === 'engine' ? rep.hotHeat : rep.coldHeat);
      const [W, TH, TC] = [read(si, rep.work), read(si, rep.hot, 0), read(si, rep.cold, 0)];
      if ([heat, W, TH, TC].some((x) => x === undefined)) break;
      if (heat! < 0 || W! < 0) out.push('heatEngine: a negative heat or work');
      if (TH! < 0 || TC! < 0) out.push('heatEngine: a temperature below absolute zero');
      const fl = heatEngineOf(mode, heat!, W!, TH!, TC!);
      const other = mode === 'engine' ? rep.coldHeat : rep.hotHeat;
      same(
        typeof other === 'string' ? other : undefined,
        mode === 'engine' ? fl.QC : fl.QH,
        'heat',
      );
      same(rep.efficiency, mode === 'engine' ? fl.e * 100 : fl.e, 'efficiency');
      if (rep.hot !== undefined && rep.cold !== undefined && TH! > TC!)
        same(rep.carnot, mode === 'engine' ? fl.carnot * 100 : fl.carnot, 'Carnot limit');
      break;
    }
  }
  return out;
}

/** H63: the spring's ½kx², friction's heat fd and the kinetic energy left at the height. */
export function energySpringIssues(rep: EnergyTrackSpec, si: Val): string[] {
  const out: string[] = [];
  const sp = rep.spring;
  if (!sp) return out;
  const [k, x, m, f, d, h] = [
    read(si, sp.k),
    read(si, sp.compression),
    read(si, rep.mass, 1),
    read(si, sp.friction, 0),
    read(si, sp.rough, 0),
    si(rep.height),
  ];
  if ([k, x, m, f, d, h].some((v) => v === undefined)) return out;
  const E0 = (k! * x! * x!) / 2;
  const heat = f! * d!;
  const check = (id: string | undefined, want: number, what: string) => {
    const v = id ? si(id) : undefined;
    if (v !== undefined && !near(v, want))
      out.push(`energyTrack: ${what} ${v}, the picture draws ${want}`);
  };
  check(sp.stored, E0, 'spring energy');
  check(sp.heat, heat, 'heat');
  const ke = E0 - heat - m! * (rep.g ?? 9.8) * h!;
  if (ke >= 0) check(rep.kinetic, ke, 'kinetic energy');
  return out;
}

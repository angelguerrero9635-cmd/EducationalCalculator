/**
 * Picture checks for the Grades 9–12 physics pictures of group HK (`typesHsk.ts`): what each
 * one draws must agree with the values. Called from `repIssues` in `pictures.ts`. Test-only.
 * Values are read in the shown units; pages built on these pictures use SI units.
 */
import type { VariableDef } from '@/engine/types';
import * as hm from '@/components/module/reps/hskMath';
import { labLineIndex } from '@/components/module/reps/hs2h';

import type { EnergyTrackSpec, MotionGraphSpec } from '../typesMechanics';
import type { Representation } from '../types';
import type { HskSpec } from '../typesHsk';
import {
  freeBodyWorkIssues,
  platesIssues,
  pointFieldIssues,
  satelliteIssues,
  strobeColumnIssues,
} from './picturesHs2c';

const {
  collisionOf,
  dopplerOf,
  freeBodyOf,
  G_NEWTON,
  heatEngineOf,
  machineOf,
  projectileOf,
  standingOf,
  sweptArea,
} = hm;

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
  const [a, v0] = [read(val, rep.acceleration), read(val, rep.start, 0)];
  const t1 = k.at ? val(k.at) : undefined;
  const v1 = k.slope ? val(k.slope) : undefined;
  if (k.view === 'position' && !k.at) out.push('a position view needs the tangent time `at`');
  if (k.strobe === 'vertical') out.push(...strobeColumnIssues(val(rep.time)));
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
      const [v, th, h] = [si(rep.speed), read(si, rep.angle), read(si, rep.height, 0)];
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
      out.push(...freeBodyWorkIssues(rep, si));
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
      if (rep.mode === 'satellite') {
        out.push(...satelliteIssues(rep, si));
        break;
      }
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
        if (e < 0 || e > 0.97) out.push(`circularMotion: eccentricity ${e} is not from 0 to 0.97`);
        if (a <= 0) out.push(`circularMotion: semi-major axis ${a} is not positive`);
        const M = read(si, rep.starMass, 1);
        if (M === undefined) break;
        if (M <= 0) out.push(`circularMotion: star mass ${M} is not positive`);
        if (a <= 0 || e < 0 || e > 0.97 || M <= 0) break;
        same(rep.perihelion, a * (1 - e), 'perihelion a(1 − e)');
        same(rep.aphelion, a * (1 + e), 'aphelion a(1 + e)');
        // Round the Sun T² = a³; round a star of M Suns a³ = M × T² (H110).
        same(rep.period, Math.sqrt(a ** 3 / M), 'period (a³ = M × T²)');
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
      const given = rep.type === 'explode' || rep.type === 'general';
      const first = given ? read(si, rep.after?.[0]) : 0;
      if ([m1, m2, v1, v2, first].some((x) => x === undefined)) break;
      if (m1! <= 0 || m2! <= 0) {
        out.push('collision: a cart with no mass');
        break;
      }
      const [u1, u2] = collisionOf(rep.type, m1!, m2!, v1!, v2!, first);
      const a = rep.after ?? [];
      if (!given) same(typeof a[0] === 'string' ? a[0] : undefined, u1, 'v₁ after');
      same(typeof a[1] === 'string' ? a[1] : undefined, u2, 'v₂ after');
      same(rep.momentum, m1! * v1! + m2! * v2!, 'total momentum');
      if (!near(m1! * u1 + m2! * u2, m1! * v1! + m2! * v2!))
        out.push('collision: momentum after is not momentum before');
      const ke = (m: number, v: number) => (m * v * v) / 2;
      same(rep.energy?.[0], ke(m1!, v1!) + ke(m2!, v2!), 'kinetic energy before');
      same(rep.energy?.[1], ke(m1!, u1) + ke(m2!, u2), 'kinetic energy after');
      same(
        rep.lost,
        ke(m1!, v1!) + ke(m2!, v2!) - ke(m1!, u1) - ke(m2!, u2),
        'kinetic energy lost',
      );
      // H105: an explosion's spring gives the kinetic energy gained.
      if (rep.spring && rep.type !== 'explode') out.push('collision: spring energy on a collision');
      same(rep.spring, ke(m1!, u1) + ke(m2!, u2) - ke(m1!, v1!) - ke(m2!, v2!), 'spring energy');
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
    case 'induction': {
      if (rep.mode === 'coil') {
        const [N, dF, dt] = [read(si, rep.turns), read(si, rep.flux), read(si, rep.time)];
        if (N === undefined || dF === undefined || dt === undefined) break;
        if (N < 1 || Math.abs(N - Math.round(N)) > 1e-9) out.push(`induction: ${N} turns`);
        if (dt <= 0) out.push(`induction: time ${dt} is not positive`);
        else same(rep.emf, (N * dF) / dt, 'emf');
      } else if (rep.mode === 'force') {
        const [B, I, L, th] = [
          read(si, rep.field),
          read(si, rep.current),
          read(si, rep.length),
          read(si, rep.angle, 90),
        ];
        if (B === undefined || I === undefined || L === undefined || th === undefined) break;
        same(rep.force, B * I * L * Math.sin((th * Math.PI) / 180), 'force BIL sin θ');
      } else if (rep.mode === 'transformer') {
        const [Np, Ns, Vp] = [
          read(si, rep.primary),
          read(si, rep.secondary),
          read(si, rep.voltage),
        ];
        if (Np === undefined || Ns === undefined || Vp === undefined) break;
        if (Np < 1 || Ns < 1) out.push('induction: a winding with no turns');
        else {
          same(rep.output, (Vp * Ns) / Np, 'secondary voltage');
          const Ip = read(si, rep.current);
          if (Ip !== undefined) same(rep.outputCurrent, (Ip * Np) / Ns, 'secondary current');
        }
      }
      break;
    }
    case 'charges': {
      if (rep.mode === 'plates') {
        out.push(...platesIssues(rep, si));
        break;
      }
      out.push(...pointFieldIssues(rep, si));
      const [q1, q2] = rep.charges.map((x) => (x === undefined ? undefined : read(si, x)));
      const r = read(si, rep.distance);
      if (q1 === undefined || r === undefined) break;
      if (r <= 0) out.push(`charges: distance ${r} is not positive`);
      else if (rep.charges[1] !== undefined) {
        // A page may count the force signed (− for attraction): compared by size.
        const F = rep.force ? si(rep.force) : undefined;
        const want = q2 === undefined ? undefined : hm.coulombOf(q1, q2, r).F;
        if (F !== undefined && want !== undefined && !near(Math.abs(F), want))
          out.push(`charges: force ${F}, the picture draws ${want}`);
      } else {
        const E = rep.field ? si(rep.field) : undefined;
        if (E !== undefined && !near(Math.abs(E), hm.fieldOf(q1, r)))
          out.push(`charges: field ${E}, the picture draws ${hm.fieldOf(q1, r)}`);
      }
      break;
    }
    case 'rayDiagram': {
      if (rep.mode === 'lens' || rep.mode === 'mirror') {
        const [f, dO, hO] = [
          read(si, rep.focal),
          read(si, rep.objectDistance),
          read(si, rep.objectHeight, 1),
        ];
        if (f === undefined || dO === undefined || hO === undefined) break;
        if (dO <= 0) out.push(`rayDiagram: object distance ${dO} is not in front`);
        const signed = rep.shape === 'converging' || rep.shape === 'concave';
        if (f < 0 === signed) out.push(`rayDiagram: a ${rep.shape} element with f = ${f}`);
        const L = hm.thinLensOf(rep.shape, Math.abs(f), dO, hO);
        if (!Number.isFinite(L.dI)) break;
        same(rep.imageDistance, L.dI, 'image distance');
        same(rep.magnification, L.m, 'magnification');
        same(rep.imageHeight, L.hI, 'image height');
      } else if (rep.mode === 'refraction') {
        const [n1, n2, th] = [read(si, rep.n1), read(si, rep.n2), read(si, rep.angle)];
        if (n1 === undefined || n2 === undefined || th === undefined) break;
        if (n1 < 1 || n2 < 1) out.push('rayDiagram: an index of refraction below 1');
        if (th < 0 || th >= 90) out.push(`rayDiagram: angle ${th}° is not from 0° to 90°`);
        const sn = hm.snellOf(n1, n2, th);
        // Compared by their sines: near 90° a hair in sin θ₂ is a visible hundredth of a degree.
        const r = rep.refracted ? si(rep.refracted) : undefined;
        const sin = (d: number) => Math.sin((d * Math.PI) / 180);
        if (sn.refracted !== undefined && r !== undefined && !near(sin(r), sin(sn.refracted)))
          out.push(
            `rayDiagram: refracted angle ${rep.refracted} = ${r}, the picture draws ${sn.refracted}`,
          );
        if (sn.critical !== undefined) same(rep.critical, sn.critical, 'critical angle');
      } else if (rep.mode === 'doubleSlit') {
        const [l, d, L] = [read(si, rep.wavelength), read(si, rep.spacing), read(si, rep.screen)];
        if (l === undefined || d === undefined || L === undefined) break;
        same(rep.fringe, hm.fringeOf(l, d, L), 'fringe spacing');
      } else if (rep.mode === 'telescope') {
        const [fo, fe] = [read(si, rep.objective), read(si, rep.eyepiece)];
        if (fo === undefined || fe === undefined) break;
        if (fo <= 0 || fe <= 0) out.push('rayDiagram: a focal length that is not positive');
        else {
          same(rep.magnification, fo / fe, 'magnification');
          same(rep.length, fo + fe, 'tube length');
        }
      }
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

type WaveSpec = Extract<Representation, { kind: 'wave' }>;

/** H65: a standing wave's λ (2L/n, 4L/n with odd n) and f = v/λ; the Doppler frequencies. */
export function waveHsIssues(rep: WaveSpec, si: Val): string[] {
  const out: string[] = [];
  const check = (id: string | undefined, want: number, what: string) => {
    const v = id ? si(id) : undefined;
    if (v !== undefined && Number.isFinite(want) && !near(v, want))
      out.push(`wave: ${what} ${v}, the picture draws ${want}`);
  };
  if (rep.standing) {
    const w = rep.standing;
    const [n, L, v] = [read(si, w.harmonic, 1), read(si, w.length, 1), read(si, w.speed)];
    if (n === undefined || L === undefined) return out;
    if (!Number.isInteger(n) || n < 1 || n > 12)
      out.push(`wave: harmonic ${n} is not a whole number 1 to 12`);
    const st = standingOf(w.medium, n, L);
    if (Number.isInteger(n) && n >= 1 && st.valid) {
      check(rep.wavelength, st.lambda, 'wavelength');
      if (v !== undefined) check(rep.frequency, v / st.lambda, 'frequency v/λ');
    }
  }
  if (rep.doppler) {
    const d = rep.doppler;
    const [vs, v, f] = [read(si, d.sourceSpeed), read(si, d.waveSpeed), read(si, d.frequency)];
    if (vs === undefined || v === undefined || f === undefined) return out;
    if (vs < 0 || v <= 0) out.push('wave: a negative source speed or wave speed');
    const h = dopplerOf(f, v, vs);
    if (vs < v) check(d.ahead, h.ahead, 'frequency ahead');
    check(d.behind, h.behind, 'frequency behind');
  }
  return out;
}

/** A shown value in formula (SI) units, or undefined for a "?". */
export const mapSi = (x: number | undefined, factor = 1) => (x === undefined ? x : x * factor);

type Physics8 = Extract<
  Representation,
  { kind: 'spectrum' | 'circuit' | 'electromagnet' | 'orbit' }
>;

/** Whether a Grade 8 physics picture carries a group-HK option (checked here instead). */
export const physicsHsOption = (rep: Physics8) =>
  (rep.kind === 'circuit' && !!rep.mixed) ||
  (rep.kind === 'spectrum' && (!!rep.lines || !!rep.photon));

/** Equal, or equal up to a unit prefix (a value shown in mA or kΩ is 10³ from the formula's). */
const nearUnit = (a: number, b: number) => {
  if (near(a, b)) return true;
  if (!(a > 0 && b > 0)) return false;
  const k = Math.log10(a / b);
  return Math.abs(k - Math.round(k)) < 1e-4 && Math.round(k) % 3 === 0;
};

/** H68: a mixed circuit's R_eq, total current, power and each resistor's readings. */
export function physicsHsIssues(rep: Physics8, val: Val): string[] {
  const out: string[] = [];
  if (rep.kind === 'spectrum') return spectrumHsIssues(rep, val);
  if (rep.kind !== 'circuit' || !rep.mixed) return out;
  const m = rep.mixed;
  const Rs = m.resistors.map((x) => read(val, x));
  const V = val(rep.voltage);
  if (Rs.some((r) => r !== undefined && r <= 0))
    out.push('circuit: a resistor that is not positive');
  if (V === undefined || Rs.some((r) => r === undefined || r <= 0)) return out;
  const c = hm.mixedOf(m.layout, Rs as [number, number, number], V);
  const check = (id: string | undefined, want: number, what: string) => {
    const x = id ? val(id) : undefined;
    if (x !== undefined && !nearUnit(x, want))
      out.push(`circuit: ${what} ${x}, the picture draws ${want}`);
  };
  check(rep.current, c.I, 'total current');
  check(m.equivalent, c.Req, 'equivalent resistance');
  check(m.power, V * c.I, 'total power');
  [0, 1, 2].forEach((i) => {
    check(m.voltages?.[i], c.V[i]!, `voltage across R${i + 1}`);
    check(m.currents?.[i], c.I3[i]!, `current through R${i + 1}`);
    check(m.powers?.[i], c.P[i]!, `power of R${i + 1}`);
  });
  return out;
}

/** H70: the observed line at λ₀(1 + z), v ≈ cz; a photon's λ = c/f and E = hf. */
function spectrumHsIssues(rep: Extract<Physics8, { kind: 'spectrum' }>, val: Val): string[] {
  const out: string[] = [];
  const check = (id: string | undefined, want: number, what: string) => {
    const x = id ? val(id) : undefined;
    if (x !== undefined && Number.isFinite(want) && !near(x, want))
      out.push(`spectrum: ${what} ${x}, the picture draws ${want}`);
  };
  const m = rep.meters ?? 1;
  if (rep.lines) {
    const l = rep.lines;
    const lab = hm.SPECTRAL_LINES[l.element];
    // H105: `line: 'rest'` follows the rest value; that value must be one of the lines.
    const r0 = l.rest ? val(l.rest) : undefined;
    const z = read(val, l.redshift, 0);
    if (z === undefined) return out;
    const lam0 = val(rep.wavelength);
    const ref =
      lab[
        labLineIndex(lab, l.line, r0 === undefined ? undefined : (r0 * m) / 1e-9, {
          nm: lam0 === undefined ? undefined : (lam0 * m) / 1e-9,
          z,
        })
      ]!.nm;
    if (z <= -1) out.push(`spectrum: redshift ${z} is not above −1`);
    check(l.rest, ref, 'lab wavelength');
    // Without a redshift the wavelength may be any of the element's lines.
    const lam = val(rep.wavelength);
    if (l.redshift !== undefined)
      check(rep.wavelength, (ref * (1 + z) * 1e-9) / m, 'observed wavelength');
    else if (lam !== undefined && !lab.some((q) => near((lam * m) / 1e-9, q.nm)))
      out.push(`spectrum: ${lam} is not one of the ${l.element} lines`);
    check(l.velocity, 300000 * z, 'speed cz');
  }
  if (rep.photon) {
    const f0 = read(val, rep.photon.frequency);
    const f = f0 === undefined ? undefined : f0 * (rep.photon.hertz ?? 1);
    if (f === undefined) return out;
    if (f <= 0) out.push(`spectrum: frequency ${f} is not positive`);
    else {
      const ph = hm.photonOf(f);
      check(rep.wavelength, (ph.nm * 1e-9) / m, 'wavelength c/f');
      check(rep.photon.energy, ph.J, 'energy hf');
      check(rep.photon.electronVolts, ph.eV, 'energy in eV');
    }
  }
  return out;
}

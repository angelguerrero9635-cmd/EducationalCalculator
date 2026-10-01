/**
 * Picture checks for the Grades 9–12 round 3 physics pictures of group H3A (`typesHs3a.ts`,
 * and the options this group adds to round 1's kinds): what each one draws must agree with the
 * values. Called from `repIssues` in `pictures.ts` with a reader of formula units (`siOf`).
 * Test-only.
 */
import * as m from '@/components/module/reps/hs3aMath';

import type { Hs3aSpec } from '../typesHs3a';
import type { ChargePlatesSpec, ChargesSpec, InductionSpec, SimpleMachineSpec } from '../typesHsk';

type Val = (id: string) => number | undefined;

/**
 * Equal to 1e-5 of the larger (values are rounded when shown, then worked on), or of `scale`
 * when the value is a difference of terms that size (ω₀t + ½αt² near 0), or within 1e-6 (a
 * page shows 2.5 × 10⁻⁷ J to 6 places as 0).
 */
const near = (a: number, b: number, scale = 0) =>
  Math.abs(a - b) <= 1e-5 * Math.max(Math.abs(a), Math.abs(b), scale) + 1e-6;

const read = (val: Val, x: number | string | undefined, fallback?: number) =>
  x === undefined ? fallback : typeof x === 'number' ? x : val(x);

/** A checker: a named value must be what the picture draws. */
function checker(kind: string, val: Val, out: string[]) {
  return (id: string | undefined, want: number | undefined, what: string, scale = 0) => {
    const x = id ? val(id) : undefined;
    if (x !== undefined && want !== undefined && Number.isFinite(want) && !near(x, want, scale))
      out.push(`${kind}: ${what} ${id} = ${x}, the picture draws ${want}`);
  };
}

/** The new picture kinds of group H3A. `val` reads formula units. */
export function hs3aIssues(rep: Hs3aSpec, val: Val): string[] {
  const out: string[] = [];
  const same = checker(rep.kind, val, out);
  switch (rep.kind) {
    case 'torque': {
      const [r, F, th] = [read(val, rep.arm), read(val, rep.force), read(val, rep.angle, 90)];
      if (th !== undefined && (th < 0 || th > 180))
        out.push(`torque: angle ${th}° is not from 0° to 180°`);
      if (r !== undefined && r < 0) out.push(`torque: arm ${r} is negative`);
      if (F !== undefined && F < 0) out.push(`torque: force ${F} is negative`);
      if (F === undefined || th === undefined) break;
      const t = m.torqueOf(r ?? 0, F, th);
      same(rep.across, t.across, 'F⊥ = F sin θ');
      if (r !== undefined) same(rep.torque, t.torque, 'τ = rF sin θ');
      break;
    }
    case 'rotor': {
      const c = read(val, rep.shape);
      if (c !== undefined && (c <= 0 || c > 1))
        out.push(`rotor: shape factor ${c} is not in (0, 1]`);
      // H111: with the hollow ball in the row, the shape is one of the four named ones.
      if (rep.hollow && c !== undefined && ![1, 2 / 3, 0.5, 0.4].some((k) => near(c, k)))
        out.push(`rotor: shape factor ${c} is not a hoop, hollow ball, solid disk or solid ball`);
      const [mass, r] = [read(val, rep.mass), read(val, rep.radius)];
      const I =
        c !== undefined && mass !== undefined && r !== undefined
          ? m.inertiaOf(c, mass, r)
          : read(val, rep.inertia);
      if (c !== undefined && mass !== undefined && r !== undefined)
        same(rep.inertia, I, 'I = cmr²');
      const [tau, alpha] = [read(val, rep.torque), read(val, rep.acceleration)];
      if (tau !== undefined && alpha !== undefined && I !== undefined && !near(tau, I * alpha))
        out.push(`rotor: τ ${tau} is not Iα = ${I * alpha}`);
      const [w0, t] = [read(val, rep.start), read(val, rep.time)];
      if (t !== undefined && t < 0) out.push(`rotor: time ${t} is negative`);
      if (w0 !== undefined && alpha !== undefined && t !== undefined) {
        const s = m.spinUpOf(w0, alpha, t);
        const terms = Math.abs(w0 * t) + Math.abs(0.5 * alpha * t * t);
        const speed = typeof rep.speed === 'string' ? rep.speed : undefined;
        same(speed, s.speed, 'ω = ω₀ + αt', Math.abs(w0) + Math.abs(alpha * t));
        same(rep.angle, s.angle, 'Δθ = ω₀t + ½αt²', terms);
        same(rep.turns, s.turns, 'n = Δθ/2π', terms / (2 * Math.PI));
      }
      const N = read(val, rep.rpm);
      if (N !== undefined) {
        const s = m.steadyOf(N, r ?? 0);
        same(typeof rep.speed === 'string' ? rep.speed : undefined, s.w, 'ω = 2πN/60');
      }
      const w = read(val, rep.speed);
      if (w !== undefined) {
        if (w > 0) same(rep.period, (2 * Math.PI) / w, 'T = 2π/ω');
        if (r !== undefined) same(rep.rim, r * w, 'v = rω');
      }
      break;
    }
    case 'oscillator': {
      if (rep.mode === 'hang') {
        const g = rep.g ?? 9.8;
        const [mass, x, k] = [read(val, rep.mass), read(val, rep.stretch), read(val, rep.spring)];
        if (x !== undefined && x <= 0) out.push(`oscillator: stretch ${x} is not positive`);
        if (mass === undefined) break;
        same(rep.force, mass * g, 'F = mg');
        if (x !== undefined && x > 0) {
          const kk = (mass * g) / x;
          if (typeof rep.spring === 'string') same(rep.spring, kk, 'k = mg/x');
          else if (k !== undefined && !near(k, kk)) out.push(`oscillator: k ${k} is not mg/x`);
          same(rep.energy, 0.5 * kk * x * x, 'U = ½kx²');
        }
        break;
      }
      const [mass, k, A] = [read(val, rep.mass), read(val, rep.spring), read(val, rep.amplitude)];
      if (mass === undefined || k === undefined || A === undefined) break;
      if (mass <= 0 || k <= 0) out.push('oscillator: a mass or spring constant of 0 or less');
      const x = read(val, rep.position, A / 2)!;
      if (Math.abs(x) > A * (1 + 1e-9)) out.push(`oscillator: position ${x} is past ±A = ${A}`);
      const s = m.springOf(mass, k, A, x);
      same(rep.period, s.T, 'T = 2π√(m/k)');
      same(rep.frequency, s.f, 'f = 1/T');
      same(rep.angular, s.w, 'ω = √(k/m)');
      same(rep.top, s.top, 'v_max = Aω');
      same(rep.energy, s.E, 'E = ½kA²');
      break;
    }
    case 'pendulum': {
      const [L, g] = [read(val, rep.length), read(val, rep.gravity, 9.8)];
      if (L !== undefined && L <= 0) out.push(`pendulum: length ${L} is not positive`);
      if (g !== undefined && g <= 0) out.push(`pendulum: gravity ${g} is not positive`);
      if (L === undefined || g === undefined) break;
      const p = m.pendulumOf(L, g);
      same(rep.period, p.T, 'T = 2π√(L/g)');
      same(rep.frequency, p.f, 'f = 1/T');
      if ((rep.swing ?? 10) > 20) out.push(`pendulum: a ${rep.swing}° swing is not small`);
      break;
    }
    case 'capacitor': {
      const farads = rep.farads ?? 1;
      const [V, k, A, d] = [
        read(val, rep.voltage),
        read(val, rep.dielectric, 1),
        read(val, rep.area),
        read(val, rep.gap),
      ];
      if (k !== undefined && k < 1) out.push(`capacitor: dielectric constant ${k} is below 1`);
      const fromPlates =
        k !== undefined && A !== undefined && d !== undefined && d > 0
          ? m.plateCapacitance(k, A, d * (rep.meters ?? 1), farads)
          : undefined;
      const C = read(val, rep.capacitance) ?? fromPlates;
      if (fromPlates !== undefined && typeof rep.capacitance === 'string')
        same(rep.capacitance, fromPlates, 'C = κε₀A/d');
      if (C === undefined || V === undefined) break;
      const cap = m.capacitorOf(C, V, farads);
      same(rep.charge, cap.Q, 'Q = CV');
      same(rep.energy, cap.U, 'U = ½CV²');
      break;
    }
  }
  return out;
}

/** H107.2: a balanced seesaw: τ = F₁d₁ = F₂d₂ and F_p = F₁ + F₂. */
function seesawIssues(rep: SimpleMachineSpec, val: Val): string[] {
  const out: string[] = [];
  if (!rep.seesaw) return out;
  if (rep.machine !== 'lever') out.push('simpleMachine: a seesaw on a machine not a lever');
  const same = checker('simpleMachine', val, out);
  const [F1, d1, d2] = [read(val, rep.load), read(val, rep.loadArm), read(val, rep.effortArm)];
  const F2 = rep.effort ? val(rep.effort) : undefined;
  if (F1 === undefined || d1 === undefined) return out;
  same(rep.seesaw.torque, F1 * d1, 'τ = F₁d₁');
  if (F2 !== undefined && d2 !== undefined && !near(F1 * d1, F2 * d2))
    out.push(`simpleMachine: seesaw not balanced, F₁d₁ = ${F1 * d1}, F₂d₂ = ${F2 * d2}`);
  if (F2 !== undefined) same(rep.seesaw.pivot, F1 + F2, 'F_p = F₁ + F₂');
  return out;
}

/** H107.7: equal-potential circles round one charge, V = kq/r and U = q₀V. */
function equipotentialIssues(rep: ChargesSpec, val: Val): string[] {
  const out: string[] = [];
  const o = rep.equipotentials;
  if (!o) return out;
  if (rep.charges[1] !== undefined) out.push('charges: equipotentials drawn for two charges');
  const same = checker('charges', val, out);
  const [q, r] = [read(val, rep.charges[0]), read(val, rep.distance)];
  if (q === undefined || r === undefined || r <= 0) return out;
  const V = m.potentialOf(q, r);
  same(o.potential, V, 'V = kq/r');
  const q0 = read(val, o.test);
  if (q0 !== undefined) same(o.energy, q0 * 1e-6 * V, 'U = q₀V');
  return out;
}

/** H107.8: a charge let go at a plate: K = qΔV (eV) and v = √(2K/m). */
function launchIssues(rep: ChargePlatesSpec, val: Val): string[] {
  const out: string[] = [];
  const o = rep.launch;
  if (!o) return out;
  const same = checker('charges', val, out);
  const [n, V, mass] = [read(val, o.charge), read(val, rep.voltage), read(val, o.mass)];
  if (n !== undefined && n <= 0) out.push(`charges: a launched charge of ${n} e`);
  if (V !== undefined && V < 0) out.push(`charges: launched through ${V} V`);
  if (n === undefined || V === undefined) return out;
  const l = m.launchOf(n, V, mass ?? NaN);
  same(o.energy, l.K, 'K = qΔV');
  if (mass !== undefined) same(o.speed, l.v, 'v = √(2K/m)');
  return out;
}

/** H107.9: F = |q|vB sin θ on a moving charge; r = mv/(|q|B). */
function movingChargeIssues(rep: InductionSpec, val: Val): string[] {
  if (rep.mode !== 'charge') return [];
  const out: string[] = [];
  const same = checker('induction', val, out);
  const [q, v, B, th] = [
    read(val, rep.charge),
    read(val, rep.speed),
    read(val, rep.field),
    read(val, rep.angle, 90),
  ];
  if (v !== undefined && v < 0) out.push(`induction: speed ${v} is negative`);
  if (q === undefined || v === undefined || B === undefined || th === undefined) return out;
  const mass = read(val, rep.mass);
  const mc = m.magneticOf(q * (rep.coulombs ?? 1), v, B, th, mass);
  same(rep.force, mc.F, 'F = |q|vB sin θ');
  if (mass !== undefined) {
    if (Math.abs(th - 90) > 1e-9 && rep.radius) out.push('induction: a circle with θ ≠ 90°');
    else same(rep.radius, mc.r, 'r = mv/(|q|B)');
  }
  return out;
}

/** The group-H3A options on round 1's kinds (seesaw, equipotentials, launch, moving charge). */
export function hs3aOptionIssues(rep: { kind: string }, val: Val): string[] {
  switch (rep.kind) {
    case 'simpleMachine':
      return seesawIssues(rep as SimpleMachineSpec, val);
    case 'charges': {
      const c = rep as ChargesSpec | ChargePlatesSpec;
      return c.mode === 'plates' ? launchIssues(c, val) : equipotentialIssues(c, val);
    }
    case 'induction':
      return movingChargeIssues(rep as InductionSpec, val);
    default:
      return [];
  }
}

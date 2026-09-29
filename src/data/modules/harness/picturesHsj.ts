/**
 * Picture checks for the Grades 9–12 group J pictures (`typesHsj.ts`, chemistry H51–H57): what
 * each one draws must agree with the values. Called from `repIssues` in `pictures.ts`. Test-only.
 */
import {
  MAX_PARTICLES,
  R_LATM,
  molesPerParticle,
  particleCount,
} from '@/components/module/reps/gasModel';

import { solubilityAt } from '@/components/module/reps/solubility';
import type { VariableDef } from '@/engine/types';
import { convert, getUnit } from '@/engine/units';

import type { BeakerSolution, GasState, HsjSpec } from '../typesHsj';
import type { NumOrVar } from '../typesGraphs';

/** Equal to display rounding (values are read as shown, 4 decimals or 4 significant figures). */
const near = (a: number, b: number, tol = 2e-3) =>
  Math.abs(a - b) <= tol * Math.max(1e-9, Math.abs(a), Math.abs(b));

export function hsjIssues(rep: HsjSpec, val: (id: string) => number | undefined): string[] {
  const out: string[] = [];
  const num = (x: NumOrVar | undefined) =>
    x === undefined ? undefined : typeof x === 'number' ? x : val(x);
  switch (rep.kind) {
    case 'gasPiston': {
      const state = (s: GasState) => ({
        p: num(s.pressure),
        v: num(s.volume),
        t: num(s.temperature),
      });
      const now = state(rep);
      for (const [k, x] of Object.entries(now))
        if (x !== undefined && x <= 0) out.push(`gas ${k} ${x} is not positive`);
      if (rep.law === 'ideal') {
        const n = num(rep.moles);
        const R = rep.R ?? R_LATM;
        if (now.p !== undefined && now.v !== undefined && now.t !== undefined && n !== undefined) {
          if (!near(now.p * now.v, n * R * now.t))
            out.push(`PV = ${now.p * now.v} but nRT = ${n * R * now.t}`);
        }
        if (n !== undefined && n > 0) {
          const count = particleCount(n);
          if (count > MAX_PARTICLES) out.push(`${count} particles drawn for ${n} mol`);
        }
        if (n !== undefined && n > 0 && molesPerParticle(n) <= 0) out.push('no particle key');
        break;
      }
      if (!rep.before) {
        out.push(`${rep.law}: a two-state law with no before`);
        break;
      }
      const was = state(rep.before);
      // The law's held value is left out of both states, or is equal in both.
      const heldKey = ({ boyle: 't', charles: 'p', gayLussac: 'v', combined: undefined } as const)[
        rep.law
      ];
      if (heldKey) {
        const [a, b] = [was[heldKey], now[heldKey]];
        if (a !== undefined && b !== undefined && !near(a, b))
          out.push(`${rep.law}: held ${heldKey} differs (${a} and ${b})`);
      }
      const side = (s: { p?: number; v?: number; t?: number }) => {
        const p = heldKey === 'p' ? 1 : s.p;
        const v = heldKey === 'v' ? 1 : s.v;
        const t = heldKey === 't' ? 1 : s.t;
        return p === undefined || v === undefined || t === undefined ? undefined : (p * v) / t;
      };
      const [l, r] = [side(was), side(now)];
      if (l !== undefined && r !== undefined && !near(l, r))
        out.push(`${rep.law}: the two states give ${l} and ${r}`);
      break;
    }
  }
  return out;
}

/** A beaker solution (H52): the concentration, the dilution and the curve agree with the values. */
export function solutionIssues(
  s: BeakerSolution,
  val: (id: string) => number | undefined,
  byId: Map<string, VariableDef>,
): string[] {
  const out: string[] = [];
  const num = (x: NumOrVar | undefined) =>
    x === undefined ? undefined : typeof x === 'number' ? x : val(x);
  /** A volume in liters, from its shown value. */
  const liters = (x: NumOrVar) => {
    const v = num(x);
    if (v === undefined) return undefined;
    const def = typeof x === 'string' ? byId.get(x) : undefined;
    const unit = def?.displayUnit ?? def?.unit;
    return getUnit(unit)?.dimension === 'volume' ? convert(v, unit!, 'L') : v;
  };
  switch (s.mode) {
    case 'molarity': {
      const [n, v, m] = [num(s.moles), liters(s.volume), num(s.molarity)];
      if (n !== undefined && v !== undefined && m !== undefined && !near(m, n / v))
        out.push(`molarity ${m} is not ${n} mol ÷ ${v} L`);
      if (n !== undefined && particleCount(n) > MAX_PARTICLES) out.push(`too many dots for ${n}`);
      break;
    }
    case 'dilution': {
      const [m1, v1] = [num(s.stock.molarity), liters(s.stock.volume)];
      const [m2, v2] = [num(s.diluted.molarity), liters(s.diluted.volume)];
      if (m1 !== undefined && v1 !== undefined && m2 !== undefined && v2 !== undefined) {
        if (!near(m1 * v1, m2 * v2)) out.push(`M₁V₁ = ${m1 * v1} but M₂V₂ = ${m2 * v2}`);
        if (v2 < v1 - 1e-9) out.push(`diluted volume ${v2} L is less than the stock's ${v1} L`);
      }
      const w = liters(s.water ?? NaN);
      if (s.water !== undefined && w !== undefined && v1 !== undefined && v2 !== undefined)
        if (!near(w, v2 - v1, 1e-3)) out.push(`water added ${w} L is not ${v2} − ${v1}`);
      break;
    }
    case 'solubility': {
      const t = num(s.temperature);
      if (t !== undefined && (t < 0 || t > 100)) out.push(`temperature ${t} °C is off the curve`);
      const sol = num(s.solubility);
      if (t !== undefined && sol !== undefined && !near(sol, solubilityAt(s.salt, t)))
        out.push(`solubility ${sol} g is not the curve's ${solubilityAt(s.salt, t)} g`);
      break;
    }
  }
  return out;
}

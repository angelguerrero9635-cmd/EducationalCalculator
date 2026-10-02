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
import { element } from '@/components/module/reps/chem';
import { GRID_ATOMS, PARTICLES, atomsLeft, shareLeft } from '@/components/module/reps/decayModel';
import { PEAK, profileAt } from '@/components/module/reps/energyModel';
import { quotient, stages } from '@/components/module/reps/equilibriumModel';
import { equivalenceVolume, titrationPH } from '@/components/module/reps/phModel';
import { solubilityAt } from '@/components/module/reps/solubility';
import type { VariableDef } from '@/engine/types';
import { convert, getUnit } from '@/engine/units';

import type { BeakerSolution, GasState, HsjSpec, Nuclide } from '../typesHsj';
import type { NumOrVar } from '../typesGraphs';
import { ladderIssues } from './picturesHs2d';

/** Equal to display rounding (values are read as shown, 4 decimals or 4 significant figures). */
const near = (a: number, b: number, tol = 2e-3) =>
  Math.abs(a - b) <= tol * Math.max(1e-9, Math.abs(a), Math.abs(b));

export function hsjIssues(rep: HsjSpec, val: (id: string) => number | undefined): string[] {
  const out: string[] = [];
  const num = (x: NumOrVar | undefined) =>
    x === undefined ? undefined : typeof x === 'number' ? x : val(x);
  switch (rep.kind) {
    case 'gasPiston': {
      if (rep.energy) break; // H102: the first law, checked by gasEnergyIssues.
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
    case 'energyProfile': {
      if (rep.mode === 'ladder') {
        out.push(...ladderIssues(rep, num));
        break;
      }
      if (rep.mode === 'bomb') break; // HC44: picturesHe3g.ts
      if (rep.mode === 'calorimeter') {
        const [m, c, t1, t2] = [num(rep.mass), num(rep.heat), num(rep.start), num(rep.end)];
        if (m === undefined || c === undefined || t1 === undefined || t2 === undefined) break;
        const dT = num(rep.change);
        if (dT !== undefined && !near(dT, t2 - t1, 1e-3)) out.push(`ΔT ${dT} is not ${t2} − ${t1}`);
        const q = num(rep.q);
        if (q !== undefined && !near(q, m * c * (t2 - t1), 1e-3))
          out.push(`q ${q} J is not mcΔT = ${m * c * (t2 - t1)} J`);
        if (rep.metal) {
          const [mm, tm, cm] = [num(rep.metal.mass), num(rep.metal.start), num(rep.metal.heat)];
          // A metal that warms the water starts hotter than the end (once its values are all in).
          if (tm !== undefined && mm !== undefined && cm !== undefined && t2 > t1 && tm < t2)
            out.push(`the ${rep.metal.name} starts colder than the end`);
          if (mm !== undefined && tm !== undefined && cm !== undefined && tm !== t2)
            if (!near(cm, (m * c * (t2 - t1)) / (mm * (tm - t2)), 1e-3))
              out.push(`the ${rep.metal.name}'s c ${cm} does not give the heat the water took in`);
        }
        break;
      }
      const [r, p, ea] = [num(rep.reactants), num(rep.products), num(rep.activation)];
      if (r === undefined || p === undefined || ea === undefined) break;
      // The curve starts at the reactants, peaks at r + Eₐ and ends at the products.
      if (!near(profileAt(0, r, p, ea), r, 1e-9) || !near(profileAt(1, r, p, ea), p, 1e-9))
        out.push('the profile does not start and end at its levels');
      if (!near(profileAt(PEAK, r, p, ea), r + ea, 1e-9)) out.push('the peak is not r + Eₐ');
      const dH = num(rep.deltaH);
      if (dH !== undefined && !near(dH, p - r, 1e-3)) out.push(`ΔH ${dH} is not ${p} − ${r}`);
      const rev = num(rep.reverse);
      if (rev !== undefined && !near(rev, ea - (p - r), 1e-3))
        out.push(`the reverse barrier ${rev} is not Eₐ − ΔH`);
      const cat = num(rep.catalyst);
      if (cat !== undefined && cat > ea + 1e-9) out.push(`the catalyst's Eₐ ${cat} is above ${ea}`);
      break;
    }
    case 'equilibriumChart': {
      if ('gibbs' in rep) break;
      const species = rep.species.map((s) => ({
        coef: s.coef,
        sign: s.side === 'product' ? (1 as const) : (-1 as const),
      }));
      const c0 = rep.species.map((s) => num(s.start));
      if (c0.some((x) => x === undefined)) break;
      const K = rep.K === undefined ? quotient(species, c0 as number[]) : num(rep.K);
      if (K === undefined || !(K > 0)) break;
      const st = rep.stress;
      const amount = num(st?.add?.amount);
      const scale = num(st?.scale);
      const K2 = num(st?.K);
      if (st?.add && amount === undefined) break;
      const s = stages(
        species,
        c0 as number[],
        K,
        st
          ? {
              ...(st.add ? { add: { index: st.add.species, amount: amount! } } : {}),
              ...(scale !== undefined ? { scale } : {}),
              ...(K2 !== undefined ? { K: K2 } : {}),
            }
          : undefined,
      );
      // Each level drawn is an equilibrium (Q = K), and the page's named levels are those.
      if (!near(quotient(species, s.eq1), K, 1e-6)) out.push(`first levels give Q ≠ K = ${K}`);
      rep.species.forEach((sp, i) => {
        const e = num(sp.eq);
        if (e !== undefined && !near(e, s.eq1[i]!, 2e-3) && Math.abs(e - s.eq1[i]!) > 1e-4)
          out.push(`[${sp.formula}] = ${e} but the chart levels at ${s.eq1[i]}`);
      });
      if (s.eq2 && s.K2 !== undefined && !near(quotient(species, s.eq2), s.K2, 1e-6))
        out.push('the levels after the stress are not at equilibrium');
      const q = num(st?.Q);
      if (q !== undefined && s.Q2 !== undefined && !near(q, s.Q2, 2e-3))
        out.push(`Q after the stress is ${s.Q2}, not ${q}`);
      if (rep.species.some((sp) => sp.coef <= 0)) out.push('a coefficient is not positive');
      break;
    }
    case 'phScale': {
      if (rep.mode === 'buffer' || rep.mode === 'aminoAcid' || rep.mode === 'pka') break;
      if (rep.mode === 'titration' && rep.polyprotic) break;
      if (rep.mode === 'titration') {
        const [ca, va, cb] = [
          num(rep.acid.concentration),
          num(rep.acid.volume),
          num(rep.base.concentration),
        ];
        if (ca === undefined || va === undefined || cb === undefined) break;
        const ka = num(rep.acid.Ka);
        if (rep.acid.Ka !== undefined && ka === undefined) break;
        const veq = equivalenceVolume(ca, va, cb);
        const named = num(rep.equivalence);
        if (named !== undefined && !near(named, veq, 1e-3))
          out.push(`equivalence ${named} is not CₐVₐ ÷ C_b = ${veq}`);
        // The curve rises, a strong acid's equivalence is neutral and a weak acid's half-way
        // point is at its pKₐ.
        const at = (v: number) => titrationPH(ca, va, cb, v, ka);
        for (let k = 1; k <= 20; k++)
          if (at((veq * 2 * k) / 20) < at((veq * 2 * (k - 1)) / 20) - 1e-6)
            out.push('the titration curve falls');
        if (ka === undefined && Math.abs(at(veq) - 7) > 1e-3)
          out.push(`strong acid at equivalence: pH ${at(veq)}, not 7`);
        if (
          ka !== undefined &&
          ca > 1e3 * ka &&
          ka >= 1e-9 &&
          Math.abs(at(veq / 2) + Math.log10(ka)) > 0.05
        )
          out.push(`half-way pH ${at(veq / 2)} is not pKₐ ${-Math.log10(ka)}`);
        break;
      }
      const ph = num(rep.pH);
      if (ph === undefined) break;
      if (ph < 0 || ph > 14) out.push(`pH ${ph} is off the 0–14 scale`);
      const h = num(rep.hydrogen);
      if (h !== undefined && !near(h, 10 ** -ph, 5e-3)) out.push(`[H⁺] ${h} is not 10^−${ph}`);
      const poh = num(rep.pOH);
      if (poh !== undefined && Math.abs(poh - (14 - ph)) > 1e-3)
        out.push(`pOH ${poh} is not 14 − ${ph}`);
      const oh = num(rep.hydroxide);
      if (oh !== undefined && !near(oh, 10 ** (ph - 14), 5e-3))
        out.push(`[OH⁻] ${oh} is not 10^(${ph} − 14)`);
      break;
    }
    case 'decayChart': {
      if (rep.mode === 'equation') {
        // Mass numbers and atomic numbers balance; a symbol given matches its atomic number.
        const terms = (ts: Nuclide[]) =>
          ts.map((t) => {
            const count = t.count === undefined ? 1 : num(t.count);
            if ('particle' in t) {
              const p = PARTICLES[t.particle];
              return { mass: p.mass, atomic: p.atomic, count, symbol: undefined };
            }
            return { mass: num(t.mass), atomic: num(t.atomic), count, symbol: t.symbol };
          });
        const [l, r] = [terms(rep.left), terms(rep.right)];
        const all = [...l, ...r];
        if (
          all.some((t) => t.mass === undefined || t.atomic === undefined || t.count === undefined)
        )
          break;
        const sum = (ts: typeof l, k: 'mass' | 'atomic') =>
          ts.reduce((s, t) => s + t.count! * t[k]!, 0);
        for (const k of ['mass', 'atomic'] as const)
          if (Math.abs(sum(l, k) - sum(r, k)) > 1e-9)
            out.push(`${k} numbers ${sum(l, k)} → ${sum(r, k)} don't balance`);
        for (const t of all)
          if (t.symbol && element(t.symbol)?.z !== t.atomic)
            out.push(`${t.symbol} is not element ${t.atomic}`);
        break;
      }
      const [T, t, n0] = [num(rep.halfLife), num(rep.time), num(rep.start)];
      if (T === undefined || t === undefined || n0 === undefined) break;
      if (!(T > 0)) out.push(`half-life ${T} is not positive`);
      const left = num(rep.left);
      if (left !== undefined && !near(left, n0 * shareLeft(t, T), 2e-3))
        out.push(`left ${left} is not ${n0} × (1/2)^(${t} ÷ ${T})`);
      const halves = num(rep.halves);
      if (halves !== undefined && !near(halves, t / T, 1e-3))
        out.push(`half-lives ${halves} is not ${t} ÷ ${T}`);
      const atoms = atomsLeft(t, T);
      if (atoms < 0 || atoms > GRID_ATOMS || Math.abs(atoms - GRID_ATOMS * shareLeft(t, T)) > 0.5)
        out.push(`grid shows ${atoms} atoms left`);
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

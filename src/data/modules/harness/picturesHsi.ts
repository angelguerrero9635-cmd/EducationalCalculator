/**
 * Picture checks for the Grades 9–12 group I pictures (`typesHsi.ts`): what each one draws must
 * agree with the values. Called from `repIssues` in `pictures.ts`. Test-only.
 */
import {
  cancelUnits,
  chainValue,
  meanOf,
  percentError,
  placesOf,
} from '@/components/module/reps/unitChainMath';

import { MAX_ELECTRONS, configuration, shells } from '@/components/module/reps/electrons';

import type { HsiSpec } from '../typesHsi';

/** Equal to display rounding (values are read as shown, 4 decimals or 4 significant figures). */
const near = (a: number, b: number, tol = 1e-4) =>
  Math.abs(a - b) <= tol * Math.max(1, Math.abs(a), Math.abs(b));

export function hsiIssues(rep: HsiSpec, val: (id: string) => number | undefined): string[] {
  const out: string[] = [];
  const num = (x: string | number | undefined) =>
    x === undefined ? undefined : typeof x === 'number' ? x : val(x);
  switch (rep.kind) {
    case 'unitChain': {
      if (rep.mode === 'chain') {
        if (rep.factors.length < 1 || rep.factors.length > 4)
          out.push(`${rep.factors.length} factors (1 to 4 fit)`);
        const { result } = cancelUnits(rep.unit, rep.per, rep.factors);
        if (result === '1') out.push('every unit cancels: the chain has no unit left');
        const s = num(rep.start);
        const fs = rep.factors.map((f) => [num(f.top), num(f.bottom)]);
        const r = num(rep.result);
        if (s === undefined || r === undefined || fs.flat().some((x) => x === undefined)) break;
        const want = chainValue(s, fs as [number, number][]);
        if (want === undefined) out.push('a factor has a bottom of 0');
        else if (!near(want, r)) out.push(`the chain gives ${want}, the value shows ${r}`);
        break;
      }
      if (rep.mode === 'ruler') {
        const places = placesOf(rep.division);
        if (Math.abs(1 / rep.division - Math.round(1 / rep.division)) > 1e-9)
          out.push(`a division of ${rep.division} does not split a unit evenly`);
        const [s, e] = [num(rep.start ?? 0), num(rep.end)];
        if (s === undefined || e === undefined) break;
        const span = rep.span ?? Math.max(5, Math.ceil(e + 0.5));
        if (s < 0 || e > span) out.push(`rod from ${s} to ${e} is off the ruler (0 to ${span})`);
        if (e < s) out.push(`rod ends at ${e}, before its start ${s}`);
        for (const x of [s, e]) {
          const scaled = x * 10 ** (places + 1);
          if (Math.abs(scaled - Math.round(scaled)) > 1e-6)
            out.push(`reading ${x} has more than one digit past the ${rep.division} marks`);
        }
        const L = num(rep.length);
        if (L !== undefined && !near(L, e - s, 1e-9))
          out.push(`rod is ${e - s} long, the value shows ${L}`);
        break;
      }
      if (rep.trials.length < 2 || rep.trials.length > 6)
        out.push(`${rep.trials.length} trials (2 to 6 fit)`);
      const xs = rep.trials.map(num);
      const acc = num(rep.accepted);
      if (acc !== undefined && acc <= 0) out.push(`accepted value ${acc} is not positive`);
      if (xs.some((x) => x === undefined)) break;
      const mean = meanOf(xs as number[]);
      const m = num(rep.mean);
      if (m !== undefined && !near(m, mean))
        out.push(`mean of the trials is ${mean}, the value shows ${m}`);
      const e = num(rep.error);
      if (acc === undefined || e === undefined) break;
      const want = percentError(mean, acc);
      if (want !== undefined && !near(e, want, 1e-3))
        out.push(`percent error is ${want}, the value shows ${e}`);
      break;
    }
    case 'atomModel': {
      const whole = (x: number | undefined, what: string, lo: number, hi: number) => {
        if (x === undefined) return;
        if (x !== Math.round(x) || x < lo || x > hi)
          out.push(`${what} ${x} (whole, ${lo} to ${hi} drawn)`);
      };
      const p = num(rep.protons);
      const n = num(rep.neutrons);
      const e = rep.electrons === undefined ? p : num(rep.electrons);
      whole(p, 'protons', 1, MAX_ELECTRONS);
      whole(n, 'neutrons', 0, 90);
      whole(e, 'electrons', 0, MAX_ELECTRONS);
      const A = num(rep.mass);
      if (A !== undefined && p !== undefined && n !== undefined && A !== p + n)
        out.push(`mass number ${A}, but ${p} + ${n} particles are drawn in the nucleus`);
      const q = num(rep.charge);
      if (q !== undefined && p !== undefined && e !== undefined && q !== p - e)
        out.push(`charge ${q}, but ${p} protons and ${e} electrons are drawn`);
      const v = num(rep.valence);
      if (v !== undefined && p !== undefined && e !== undefined && e >= 1) {
        const sh = shells(configuration(p, e));
        if (sh[sh.length - 1] !== v)
          out.push(`outer shell holds ${sh[sh.length - 1]}, the value shows ${v}`);
      }
      break;
    }
  }
  return out;
}

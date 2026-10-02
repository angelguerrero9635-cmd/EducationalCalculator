/**
 * Harness checks for Grades 9–12 round 3, group H3E (H108: chemistry). Called from the kinds'
 * cases in `pictures.ts` (or the round 1 check files).
 */
import { ionsFromCharges } from '@/components/module/reps/ionicCharges';
import { IONIC_METALS, IONIC_NONMETALS, valenceElectrons } from '@/components/module/reps/lewis';

import { CELL_METALS } from '@/components/module/layouts/galvanic';

import type { ChemDiagramHs3eSpec, GasMixture, IonicCharges } from '../typesHs3e';

type Num = (x: string | number | undefined) => number | undefined;

/**
 * `lewisStructure` ionic `charges` (part 2): each charge a whole number 1–3 and each element it
 * picks one the picture draws. Returns the pair the picture draws, for the rest of the check.
 */
export function ionicChargeIssues(
  rep: { metal: string; nonmetal: string; charges?: IonicCharges },
  num: Num,
  out: string[],
): { metal: string; nonmetal: string } {
  const ch = rep.charges;
  if (!ch) return rep;
  for (const [x, what] of [
    [ch.metal, 'metal ion charge'],
    [ch.nonmetal, 'nonmetal ion charge'],
  ] as const) {
    const v = num(x);
    if (v !== undefined && !(Number.isInteger(v) && v >= 1 && v <= 3))
      out.push(`${what} ${v} (a whole number 1 to 3 draws)`);
  }
  for (const m of ch.metals ?? []) if (!IONIC_METALS.includes(m)) out.push(`${m} is not a metal`);
  for (const n of ch.nonmetals ?? [])
    if (!IONIC_NONMETALS.includes(n)) out.push(`${n} is not a nonmetal`);
  const pick = ionsFromCharges(ch, rep, (x) => num(x));
  (ch.metals ?? []).forEach((m, k) => {
    if (IONIC_METALS.includes(m) && valenceElectrons(m) !== k + 1)
      out.push(`${m} is listed for charge ${k + 1}`);
  });
  (ch.nonmetals ?? []).forEach((n, k) => {
    if (IONIC_NONMETALS.includes(n) && 8 - valenceElectrons(n) !== k + 1)
      out.push(`${n} is listed for charge −${k + 1}`);
  });
  return pick;
}

/** Equal to display rounding (values are read as shown, 4 decimals or 4 significant figures). */
const near = (a: number, b: number, tol = 1e-4) =>
  Math.abs(a - b) <= tol * Math.max(1, Math.abs(a), Math.abs(b));

const POTENTIALS = Object.values(CELL_METALS).map((m) => m.potential);

/** The `chemDiagram` modes `phase`, `rate` and `cell` (parts 3, 4, 5). */
export function chemDiagramHs3eIssues(rep: ChemDiagramHs3eSpec, num: Num): string[] {
  const out: string[] = [];
  switch (rep.mode) {
    case 'phase': {
      const [f, b] = [num(rep.freezing), num(rep.boiling)];
      if (f !== undefined && f > 0) out.push(`freezing point ${f} °C is above water’s 0 °C`);
      if (b !== undefined && b < 100) out.push(`boiling point ${b} °C is below water’s 100 °C`);
      const [d, r] = [num(rep.drop), num(rep.rise)];
      if (d !== undefined && f !== undefined && !near(d, -f))
        out.push(`ΔTf is drawn as ${-f}, the value shows ${d}`);
      if (r !== undefined && b !== undefined && !near(r, b - 100))
        out.push(`ΔTb is drawn as ${b - 100}, the value shows ${r}`);
      break;
    }
    case 'rate': {
      if (!('times' in rep)) break; // college options: picturesHe2k.ts
      const [t1, t2] = rep.times.map((t) => num(t));
      const [a1, a2] = rep.concentrations.map((a) => num(a));
      if (t1 === undefined || t2 === undefined || a1 === undefined || a2 === undefined) break;
      if (!(t2 > t1)) out.push(`the second time (${t2}) is not after the first (${t1})`);
      if (!(a1 > 0 && a2 > 0)) out.push('a concentration is not positive: no curve through it');
      if (a2 > a1) out.push(`[A] rises from ${a1} to ${a2}: a reactant’s curve falls`);
      if (t2 <= t1) break;
      const [dt, dA, r] = [num(rep.span), num(rep.change), num(rep.rate)];
      if (dt !== undefined && !near(dt, t2 - t1))
        out.push(`Δt is drawn as ${t2 - t1}, the value shows ${dt}`);
      if (dA !== undefined && !near(dA, a2 - a1, 1e-3))
        out.push(`Δ[A] is drawn as ${a2 - a1}, the value shows ${dA}`);
      if (r !== undefined && !near(r, -(a2 - a1) / (t2 - t1), 1e-3))
        out.push(`the secant gives a rate of ${-(a2 - a1) / (t2 - t1)}, the value shows ${r}`);
      break;
    }
    case 'cell': {
      const [ec, ea] = [num(rep.cathode), num(rep.anode)];
      for (const [e, what] of [
        [ec, 'cathode'],
        [ea, 'anode'],
      ] as const)
        if (e !== undefined && !POTENTIALS.some((p) => near(p, e)))
          out.push(`${what} potential ${e} V is no metal the cell draws`);
      if (ec === undefined || ea === undefined) break;
      // A cathode below the anode draws faded with the reason (the page's own message).
      if (!(ec > ea)) break;
      const v = num(rep.voltage);
      if (v !== undefined && !near(v, ec - ea, 1e-3))
        out.push(`the cell gives ${ec - ea} V, the value shows ${v}`);
      break;
    }
  }
  return out;
}

/** `gasPiston` `mixture` (part 6): 2 to 4 gases, pressures not negative, the total and fraction. */
export function gasMixtureIssues(m: GasMixture | undefined, num: Num): string[] {
  if (!m) return [];
  const out: string[] = [];
  if (m.gases.length < 2 || m.gases.length > 4) out.push(`${m.gases.length} gases (2 to 4 draw)`);
  const ps = m.gases.map((g) => num(g.pressure));
  ps.forEach((p, i) => {
    if (p !== undefined && p < 0) out.push(`${m.gases[i]!.formula}’s pressure ${p} is negative`);
  });
  if (ps.some((p) => p === undefined)) return out;
  const sum = ps.reduce((a, b) => a! + b!, 0)!;
  const t = num(m.total);
  if (t !== undefined && !near(t, sum))
    out.push(`the pressures add to ${sum}, the total shows ${t}`);
  const x = num(m.fraction);
  if (x !== undefined && sum > 0 && !near(x, ps[0]! / sum, 1e-3))
    out.push(`${m.gases[0]!.formula}’s share is ${ps[0]! / sum}, the fraction shows ${x}`);
  return out;
}

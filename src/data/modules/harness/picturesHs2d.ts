/**
 * Picture checks for Grades 9–12 round 2, group H2D (H101: chemistry; `typesHs2d.ts`), called
 * from the kinds' cases in `pictures.ts`. Test-only.
 */
import {
  drawableChain,
  fillFormula,
  formulaVars,
  hydrocarbonCounts,
  isTemplate,
} from '@/components/module/reps/chemHs2d';
import { molarMassOf } from '@/components/module/reps/moles';

import type { ChemSpec } from '../typesChem';
import type { NumOrVar } from '../typesGraphs';
import { ladderLevels, type EnergyLadderSpec } from '../typesHs2d';
import type { MoleMapSpec } from '../typesHsi';

type Val = (x: string | number) => number | undefined;

const near = (a: number, b: number, rel = 1e-3) =>
  Math.abs(a - b) <= rel * Math.max(1, Math.abs(a), Math.abs(b));

/**
 * A chemistry spec with every formula template filled from the values (C{x}H{y} → C3H8), so the
 * round 1 checks read real formulas. A template whose values are missing stays as it is.
 */
export function filledChem(rep: ChemSpec, val: Val): ChemSpec {
  if (rep.kind !== 'reaction') return rep;
  const fill = <T extends { formula: string }>(t: T): T => {
    if (!isTemplate(t.formula)) return t;
    const f = fillFormula(t.formula, (id) => val(id));
    return f === undefined ? t : { ...t, formula: f };
  };
  return { ...rep, reactants: rep.reactants.map(fill), products: rep.products.map(fill) };
}

/** The round 2 options on the chemistry kinds (H101 part 1: reaction). */
export function chemHs2dIssues(rep: ChemSpec, val: Val): string[] {
  const out: string[] = [];
  if (rep.kind !== 'reaction') return out;
  if (rep.most !== undefined && (rep.most < 8 || rep.most > 32 || !Number.isInteger(rep.most)))
    out.push(`most ${rep.most}: a term draws 8 to 32 molecules`);
  for (const t of [...rep.reactants, ...rep.products]) {
    const f = isTemplate(t.formula) ? fillFormula(t.formula, (id) => val(id)) : t.formula;
    if (isTemplate(t.formula)) {
      if (f === undefined) {
        const bad = formulaVars(t.formula)
          .map((id) => val(id))
          .filter((v) => v !== undefined && (!Number.isInteger(v) || v < 1));
        if (bad.length) out.push(`${t.formula}: subscript ${bad[0]} is not a whole number ≥ 1`);
        continue;
      }
      const hc = hydrocarbonCounts(f);
      if (hc && !drawableChain(hc.x, hc.y))
        out.push(`${f} is not an unbranched hydrocarbon the chain draws (H even, at most 2x + 2)`);
    }
    if (t.molar !== undefined && f !== undefined) {
      const M = molarMassOf(f);
      const v = val(t.molar);
      if (M === undefined) out.push(`no molar mass for ${f}`);
      else if (v !== undefined && !near(v, M)) out.push(`${f} is ${M} g/mol, the value shows ${v}`);
    }
  }
  return out;
}

/** `limiting` on moleMap (H101 part 4): grams → moles → product, the smaller yield carried on. */
export function moleMapHs2dIssues(rep: MoleMapSpec, val: Val): string[] {
  const out: string[] = [];
  const lim = rep.limiting;
  if (!lim) return out;
  const num = (x: string | number | undefined) => (x === undefined ? undefined : val(x));
  const pc = num(lim.coef);
  const yields = lim.reactants.map((r) => {
    const M = num(r.molarMass) ?? molarMassOf(r.formula);
    if (M === undefined) out.push(`no molar mass for ${r.formula}`);
    const Mv = num(r.molarMass);
    const fromTable = molarMassOf(r.formula);
    if (Mv !== undefined && fromTable !== undefined && !near(Mv, fromTable))
      out.push(`${r.formula} is ${fromTable} g/mol, the value shows ${Mv}`);
    const m = num(r.mass);
    const k = num(r.coef);
    if (m === undefined || M === undefined) return undefined;
    const n = m / M;
    const nv = num(r.moles);
    if (nv !== undefined && !near(nv, n))
      out.push(`${r.formula}: ${m} g ÷ ${M} is ${n} mol, the value shows ${nv}`);
    if (k === undefined || pc === undefined || k <= 0) return undefined;
    const y = (n * pc) / k;
    const yv = num(r.yields);
    if (yv !== undefined && !near(yv, y))
      out.push(`${r.formula} makes ${y} mol of product, the value shows ${yv}`);
    return y;
  });
  if (yields.every((y) => y !== undefined)) {
    const least = Math.min(...(yields as number[]));
    const n = num(rep.moles);
    if (n !== undefined && !near(n, least))
      out.push(`the limiting reactant makes ${least} mol, the value shows ${n}`);
  }
  if (rep.second) out.push('limiting and second are two different maps: use one');
  return out;
}

/** An enthalpy ladder (H101 part 5): every step is its levels' difference, levels in range. */
export function ladderIssues(
  rep: EnergyLadderSpec,
  num: (x: NumOrVar | undefined) => number | undefined,
): string[] {
  const out: string[] = [];
  const n = rep.levels.length;
  if (n < 2 || n > 5) out.push(`${n} levels (the ladder draws 2 to 5)`);
  const steps = [...rep.steps, ...(rep.total ? [rep.total] : [])];
  if (rep.steps.length < 1 || rep.steps.length > 4)
    out.push(`${rep.steps.length} steps (the ladder draws 1 to 4 beside the total)`);
  for (const s of steps)
    if (![s.from, s.to].every((i) => Number.isInteger(i) && i >= 0 && i < n) || s.from === s.to)
      out.push(`a step from level ${s.from} to ${s.to} is not between two levels`);
  const levels = ladderLevels(rep, (x) => num(x));
  levels.forEach((v, i) => {
    if (v === undefined && steps.every((s) => num(s.value) !== undefined))
      out.push(`level ${i} (${rep.levels[i]!.name}) has no value and no step reaches it`);
  });
  for (const s of steps) {
    const d = num(s.value);
    const [a, b] = [levels[s.from], levels[s.to]];
    if (d !== undefined && a !== undefined && b !== undefined && !near(d, b - a))
      out.push(`${s.label ?? 'a step'} is drawn as ${b - a}, the value shows ${d}`);
  }
  return out;
}

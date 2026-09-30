/**
 * Picture checks for Grades 9–12 round 2, group H2D (H101: chemistry; `typesHs2d.ts`), called
 * from the kinds' cases in `pictures.ts`. Test-only.
 */
import { ELEMENTS, parseFormula } from '@/components/module/reps/chem';
import {
  atomsInOrder,
  averageMass,
  branchProblem,
  defectEnergy,
  drawableChain,
  fillFormula,
  formulaVars,
  grahamRatio,
  hydrocarbonCounts,
  isTemplate,
} from '@/components/module/reps/chemHs2d';
import { molarMassOf } from '@/components/module/reps/moles';

import type { ChemSpec } from '../typesChem';
import type { NumOrVar } from '../typesGraphs';
import { ladderLevels, type ChemDiagramSpec, type EnergyLadderSpec } from '../typesHs2d';
import type { MoleMapSpec } from '../typesHsi';

type Val = (x: string | number) => number | undefined;

const near = (a: number, b: number, rel = 1e-3) =>
  Math.abs(a - b) <= rel * Math.max(1, Math.abs(a), Math.abs(b));

/** `branches` on a lewisStructure hydrocarbon (H101 part 9b): methyls on an alkane's chain. */
export function branchIssues(branches: number[], bond: string, n: number | undefined): string[] {
  const out: string[] = [];
  if (bond !== 'single') out.push('methyl branches are drawn on alkanes (single bonds) only');
  if (branches.length > 4) out.push(`${branches.length} methyl groups (up to 4 drawn)`);
  if (n !== undefined) {
    const p = branchProblem(n, branches);
    if (p) out.push(`branches ${branches.join(', ')} on ${n} carbons: ${p}`);
  }
  return out;
}

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

/** The chemDiagram kind (H101 parts 6, 7, 8, 14). */
export function chemDiagramIssues(rep: ChemDiagramSpec, val: Val): string[] {
  const out: string[] = [];
  const num = (x: NumOrVar | undefined) => (x === undefined ? undefined : val(x));
  const formulaOk = (f: string) => {
    const parts = parseFormula(f);
    if (parts.length === 0) out.push(`formula "${f}" has no atoms`);
    for (const { el } of parts)
      if (!ELEMENTS.some(([sym]) => sym === el)) out.push(`"${el}" in ${f} is not an element`);
  };
  switch (rep.mode) {
    case 'effusion': {
      rep.gases.forEach((g) => formulaOk(g.formula));
      const [m1, m2] = rep.gases.map((g) => num(g.molarMass));
      if ([m1, m2].some((m) => m !== undefined && !(m > 0)))
        out.push('a molar mass is not positive');
      const r = num(rep.ratio);
      if (m1 && m2 && m1 > 0 && m2 > 0 && r !== undefined && !near(r, grahamRatio(m1, m2)))
        out.push(`√(${m2} ÷ ${m1}) is ${grahamRatio(m1, m2)}, the value shows ${r}`);
      break;
    }
    case 'isotopes': {
      formulaOk(rep.element);
      const [m1, m2] = rep.masses.map(num);
      const p1 = num(rep.percents[0]);
      const p2 = num(rep.percents[1]);
      if (p1 !== undefined && (p1 < 0 || p1 > 100)) out.push(`${p1}% is not a percent`);
      if (p1 !== undefined && p2 !== undefined && !near(p1 + p2, 100, 1e-6))
        out.push(`the percents add to ${p1 + p2}, not 100`);
      if ([m1, m2].some((m) => m !== undefined && !(m > 0)))
        out.push('an isotope mass is not positive');
      const avg = num(rep.average);
      if (m1 !== undefined && m2 !== undefined && p1 !== undefined && avg !== undefined)
        if (!near(avg, averageMass(m1, m2, p1), 1e-4))
          out.push(`the pivot is at ${averageMass(m1, m2, p1)}, the value shows ${avg}`);
      break;
    }
    case 'oxidation': {
      const template = isTemplate(rep.formula);
      const filled = fillFormula(rep.formula, (id) => val(id), true);
      if (filled === undefined) break;
      formulaOk(filled);
      const atoms = atomsInOrder(filled);
      if (atoms.length > 14) out.push(`${atoms.length} atoms (the tally draws up to 14)`);
      const els = [...new Set(atoms)];
      for (const el of els)
        if (!(el in rep.numbers)) out.push(`no oxidation number for ${el} in ${rep.formula}`);
      if (!template)
        for (const el of Object.keys(rep.numbers))
          if (!els.includes(el)) out.push(`${el} is not in ${rep.formula}`);
      const ns = els.map((el) => num(rep.numbers[el]));
      for (const n of ns)
        if (n !== undefined && (!Number.isInteger(n) || n < -4 || n > 8))
          out.push(`oxidation number ${n} (whole, −4 to +8)`);
      const q = rep.charge === undefined ? 0 : num(rep.charge);
      if (q !== undefined && ns.every((n) => n !== undefined)) {
        const total = els.reduce(
          (sum, el, i) => sum + ns[i]! * atoms.filter((a) => a === el).length,
          0,
        );
        if (!near(total, q, 1e-9))
          out.push(`the oxidation numbers add to ${total}, the charge is ${q}`);
      }
      break;
    }
    case 'massDefect': {
      if (
        rep.before.length < 1 ||
        rep.before.length > 3 ||
        rep.after.length < 1 ||
        rep.after.length > 4
      )
        out.push('1 to 3 parts before and 1 to 4 after');
      const side = (ps: typeof rep.before) => {
        const ms = ps.map((p) => num(p.mass));
        return ms.some((m) => m === undefined) ? undefined : ms.reduce((a, b) => a! + b!, 0)!;
      };
      const [b, a] = [side(rep.before), side(rep.after)];
      if (b === undefined || a === undefined) break;
      const dm = num(rep.defect);
      if (dm !== undefined && !near(dm, b - a, 1e-6))
        out.push(`Δm is ${b - a} u, the value shows ${dm}`);
      if (b - a <= 0)
        out.push(`the mass after (${a}) is not less than before (${b}): no gap to draw`);
      const E = num(rep.energy);
      if (E !== undefined && !near(E, defectEnergy(dm ?? b - a), 2e-3))
        out.push(`E is ${defectEnergy(dm ?? b - a)} MeV, the value shows ${E}`);
      break;
    }
  }
  return out;
}

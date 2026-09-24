import { formatNumber, renderTemplate } from '@/engine/format';
import { holds, type SolveResult } from '@/engine/solve';
import type { Values } from '@/engine/types';
import { makeUnitContext, type UnitContext } from '@/engine/unitContext';

import type { ModuleDef } from './types';

export interface Quantity {
  id: string;
  symbol: string;
  name: string;
  /** e.g. "12 cm²" or "?" */
  value: string;
}

export interface Step {
  id: string;
  /** "Find w", i.e. the variable's name */
  title: string;
  /** The relation used, symbolically: "A = l × w" */
  formula: string;
  how: string;
  /** "w = A ÷ l" (omitted when solved numerically) */
  rearranged?: string;
  /** "w = 12 ÷ 4" */
  substituted?: string;
  /** Worked arithmetic between the substituted line and the result. */
  work?: string[];
  /** "w = 3 cm" */
  result: string;
}

export interface Walkthrough {
  given: Quantity[];
  find: Quantity[];
  steps: Step[];
  /** Every relation with the final numbers plugged in (only relations with all values known). */
  check: { formula: string; ok: boolean }[];
  /** Variables still unknown. */
  missing: Quantity[];
  /**
   * When the formulas don't hold directly in the chosen units: each entered value converted
   * into the formula's units before solving, and each answer converted back afterwards.
   */
  convertIn: string[];
  convertOut: string[];
  /** The formula units the steps are worked in, when conversion was needed ("cm, cm²"). */
  workingUnits?: string;
}

/**
 * Builds the step-by-step explanation of how `result` was reached from the entered values.
 * If the formulas hold in the chosen units, the steps are worked in those units; otherwise
 * values are converted to the formula's units first and the answers converted back.
 */
export function buildSteps(
  module: ModuleDef,
  result: SolveResult,
  units: UnitContext = makeUnitContext(module, { system: 'metric' }),
): Walkthrough {
  const vars = module.variables;
  const byId = new Map(vars.map((v) => [v.id, v]));
  const relations = new Map(module.relations.map((r) => [r.id, r]));
  const direct = units.coherent;

  const shownValue = (id: string) => units.toDisplay(id, result.values[id]!);
  const shownUnit = (id: string) => units.display[id];
  const formulaUnit = (id: string) => byId.get(id)!.unit;
  const needsConversion = (id: string) => (shownUnit(id) ?? '') !== (formulaUnit(id) ?? '');
  /**
   * Formats a value with its unit. Whole-number rounding applies only to values in the shown
   * unit (lesson numbers), never to the same value converted into formula units.
   */
  const fmt = (id: string, x: number, unit: string | undefined, inShownUnit = true) =>
    `${formatNumber(x, inShownUnit ? byId.get(id) : undefined)}${unit ? (unit === '¢' ? unit : ` ${unit}`) : ''}`;
  /** Variables for filling formulas with working values (no whole-number rounding if converted). */
  const workVars = direct ? vars : vars.map((v) => ({ ...v, integer: false }));

  /** Values and units the steps are worked in. */
  const workValue = (id: string) => (direct ? shownValue(id) : result.values[id]!);
  const workUnit = (id: string) => (direct ? shownUnit(id) : formulaUnit(id));
  const working: Values = Object.fromEntries(
    Object.keys(result.values).map((id) => [id, workValue(id)]),
  );

  const quantity = (id: string): Quantity => {
    const v = byId.get(id)!;
    const known = result.values[id] !== undefined;
    return {
      id,
      symbol: v.symbol,
      name: v.name,
      value: known ? fmt(id, shownValue(id), shownUnit(id)) : '?',
    };
  };

  const steps = result.trace.map((t): Step => {
    const v = byId.get(t.id)!;
    const relation = relations.get(t.relation)!;
    const text = module.steps[t.relation]?.[t.id];
    const base = {
      id: t.id,
      // Lowercase only the first letter, so names like “Pencil A” keep their capital.
      // “Find how many more (circles, squares)” would get two sets of brackets: use a colon.
      title: v.name.endsWith(')')
        ? `Find ${v.name[0]!.toLowerCase()}${v.name.slice(1)}: ${v.symbol}`
        : `Find ${v.name[0]!.toLowerCase()}${v.name.slice(1)} (${v.symbol})`,
      formula: renderTemplate(relation.display, vars),
      result: `${v.symbol} = ${fmt(t.id, workValue(t.id), workUnit(t.id), direct)}`,
    };
    if (!text || !t.exact) {
      return { ...base, how: 'Tried numbers until both sides match.' };
    }
    // Text functions get the numbers the steps show (the working values), so every line matches.
    const expr = typeof text.expr === 'function' ? text.expr(working) : text.expr;
    const work = typeof text.work === 'function' ? text.work(working) : text.work;
    return {
      ...base,
      ...(text.note && direct ? { result: `${base.result} ${text.note(working)}` } : {}),
      how: typeof text.how === 'function' ? text.how(working) : text.how,
      rearranged: `${v.symbol} = ${renderTemplate(expr, vars)}`,
      substituted: `${v.symbol} = ${renderTemplate(expr, workVars, working)}`,
      ...(work?.length
        ? { work: work.map((line) => renderTemplate(line, workVars, working)) }
        : {}),
    };
  });

  const conversion = (id: string, into: 'formula' | 'shown') => {
    const v = byId.get(id)!;
    const shown = fmt(id, shownValue(id), shownUnit(id));
    const formula = fmt(id, result.values[id]!, formulaUnit(id), false);
    // State the factor in the direction that reads as a number ≥ 1 ("1 kg = 2.20462 lb").
    const f = units.factor(id);
    const sig = (x: number) => String(Number(x.toPrecision(6)));
    const one =
      f >= 1
        ? `1 ${shownUnit(id)} = ${sig(f)} ${formulaUnit(id)}`
        : `1 ${formulaUnit(id)} = ${sig(1 / f)} ${shownUnit(id)}`;
    return into === 'formula'
      ? `${v.symbol} = ${shown} = ${formula}   (${one})`
      : `${v.symbol} = ${formula} = ${shown}   (${one})`;
  };

  const converted = direct ? [] : vars.map((v) => v.id).filter(needsConversion);
  const givenIds = result.given.map((g) => g.id);
  const workingUnits = direct
    ? undefined
    : [...new Set(converted.map(formulaUnit).filter((u): u is string => !!u))].join(', ');

  return {
    given: givenIds.map(quantity),
    find: result.trace.map((t) => quantity(t.id)),
    steps,
    check: module.relations
      .filter((r) => r.vars.every((id) => id in result.values))
      .map((r) => ({
        formula:
          r.check && direct ? r.check(working) : renderTemplate(r.display, workVars, working),
        ok: holds(r, result.values),
      })),
    missing: result.unknown.map(quantity),
    convertIn: givenIds
      .filter((id) => converted.includes(id))
      .map((id) => conversion(id, 'formula')),
    convertOut: result.trace
      .map((t) => t.id)
      .filter((id) => converted.includes(id))
      .map((id) => conversion(id, 'shown')),
    workingUnits: workingUnits || undefined,
  };
}

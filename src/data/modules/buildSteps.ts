import { formatNumber, renderTemplate } from '@/engine/format';
import { holds, type SolveResult } from '@/engine/solve';

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
}

/** Builds the step-by-step explanation of how `result` was reached from the entered values. */
export function buildSteps(module: ModuleDef, result: SolveResult): Walkthrough {
  const vars = module.variables;
  const byId = new Map(vars.map((v) => [v.id, v]));
  const relations = new Map(module.relations.map((r) => [r.id, r]));
  const withUnit = (id: string) => {
    const v = byId.get(id)!;
    const x = result.values[id];
    if (x === undefined) return '?';
    return `${formatNumber(x, v)}${v.unit ? ` ${v.unit}` : ''}`;
  };
  const quantity = (id: string): Quantity => {
    const v = byId.get(id)!;
    return { id, symbol: v.symbol, name: v.name, value: withUnit(id) };
  };

  const steps = result.trace.map((t): Step => {
    const v = byId.get(t.id)!;
    const relation = relations.get(t.relation)!;
    const text = module.steps[t.relation]?.[t.id];
    const formula = renderTemplate(relation.display, vars);
    const base = {
      id: t.id,
      title: `Find ${v.name.toLowerCase()} (${v.symbol})`,
      formula,
      result: `${v.symbol} = ${withUnit(t.id)}`,
    };
    if (!text || !t.exact) {
      return { ...base, how: 'Solved numerically: tried values until both sides matched.' };
    }
    return {
      ...base,
      how: text.how,
      rearranged: `${v.symbol} = ${renderTemplate(text.expr, vars)}`,
      substituted: `${v.symbol} = ${renderTemplate(text.expr, vars, result.values)}`,
    };
  });

  return {
    given: result.given.map((g) => quantity(g.id)),
    find: result.trace.map((t) => quantity(t.id)),
    steps,
    check: module.relations
      .filter((r) => r.vars.every((id) => id in result.values))
      .map((r) => ({
        formula: renderTemplate(r.display, vars, result.values),
        ok: holds(r, result.values),
      })),
    missing: result.unknown.map(quantity),
  };
}

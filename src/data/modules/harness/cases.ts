/**
 * Checks on a step solved from a relation that switches (HE-E11, HE-E12): the step names the
 * case the values are in, its comparisons hold as printed ("1500 < 2300: laminar"), and a
 * category answer reads as the word its code stands for. Test-only.
 */
import { branchOf, comparisonHolds } from '@/engine/cases';
import { codeLabel } from '@/engine/choices';
import type { Relation, Values, VariableDef } from '@/engine/types';

import type { Step } from '../buildSteps';
import { evaluate } from './evaluate';

/** What is wrong with one step of a relation that switches (empty when nothing is). */
export function caseIssues(
  step: Pick<Step, 'id' | 'lines' | 'result'> & { work?: string[] },
  variable: VariableDef,
  relation: Relation,
  values: Values,
  /** Every line of the walkthrough: a case line an earlier step showed is not shown again. */
  shown: readonly string[] = [],
): string[] {
  const out: string[] = [];
  const branch = branchOf(relation, values);
  if (!branch) return [`no case of "${relation.id}" applies to the values found`];
  const lines = [...step.lines, ...(step.work ?? [])];
  const said = lines.filter((l) => l.endsWith(`: ${branch.name}`));
  if (said.length === 0 && !shown.some((l) => l.endsWith(`: ${branch.name}`)))
    out.push(`step for ${step.id} doesn't name its case (${branch.name})`);
  for (const line of said) {
    if (comparisonHolds(line, (t) => evaluate(t)) === false)
      out.push(`case line compares the wrong way: "${line}"`);
  }
  // A case of another name with a comparison that holds would say two cases apply.
  for (const b of relation.branches ?? []) {
    if (b === branch) continue;
    for (const line of lines.filter((l) => l.endsWith(`: ${b.name}`)))
      out.push(`step names case ${b.name}, but the values are in ${branch.name}: "${line}"`);
  }
  if (variable.labels) {
    const word = codeLabel(variable, values[variable.id]);
    if (step.result !== `${variable.symbol} = ${word}`)
      out.push(`category answer "${step.result}" is not ${variable.symbol} = ${word}`);
  }
  return out;
}

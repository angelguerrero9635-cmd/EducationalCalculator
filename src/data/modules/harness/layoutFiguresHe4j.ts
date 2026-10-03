/**
 * Layout-figure checks for the college pictures of round 4, group J (`typesHe4j.ts`), called from
 * `layoutFigures.ts`. HC156: gait cards in a sequence come in the cycle's order, heel strike
 * first, each phase once. Test-only.
 */
import type { LayoutDef } from '../layouts';
import { GAIT_PHASES } from '../typesHe4j';

export function he4jFigureIssues(l: LayoutDef): string[] {
  const out: string[] = [];
  if (l.kind === 'sequence') {
    const at = l.stages.flatMap((s) =>
      s.figure?.kind === 'gait' ? [GAIT_PHASES.indexOf(s.figure.phase)] : [],
    );
    if (at.some((k, i) => k < 0 || (i > 0 && k <= at[i - 1]!)))
      out.push(`gait cards are not in the order ${GAIT_PHASES.join(', ')}`);
  }
  return out;
}

/**
 * Layout-figure checks for the Grades 9–12 round 2 figures of group H2E (`typesHs2e.ts`), called
 * from `layoutFigures.ts`. Test-only.
 */
import type { LayoutDef } from '../layouts';

const REPLICATION_ORDER = ['unzip', 'pair', 'join', 'copies'];

export function hs2eFigureIssues(l: LayoutDef): string[] {
  const out: string[] = [];
  // Replication cards in a sequence come in the order the stages happen.
  if (l.kind === 'sequence') {
    const stages = l.stages.flatMap((s) =>
      s.figure?.kind === 'replication' ? [REPLICATION_ORDER.indexOf(s.figure.stage)] : [],
    );
    if (stages.some((k, i) => i > 0 && k <= stages[i - 1]!))
      out.push('replication cards are not in the order unzip, pair, join, copies');
  }
  return out;
}

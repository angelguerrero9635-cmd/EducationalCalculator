/**
 * Layout-figure checks for the Grades 9–12 round 2 figures of group H2E (`typesHs2e.ts`), called
 * from `layoutFigures.ts`. Test-only.
 */
import type { LayoutDef } from '../layouts';
import { geneIsOn } from '../typesHs2e';

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
  // Gene expression: every scene sets its switch, and a line that says the gene is on or off
  // agrees with the figure.
  if (l.kind === 'explore' && l.figure.kind === 'geneExpression') {
    for (const s of l.scenes) {
      if (!s.gene) {
        out.push(`scene "${s.label}": no gene switch`);
        continue;
      }
      const said = s.lines.join(' ').match(/gene is (on|off)/);
      const on = geneIsOn(s.gene);
      if (said && (said[1] === 'on') !== on)
        out.push(
          `scene "${s.label}": the text says ${said[1]}, the figure draws ${on ? 'on' : 'off'}`,
        );
    }
  }
  return out;
}

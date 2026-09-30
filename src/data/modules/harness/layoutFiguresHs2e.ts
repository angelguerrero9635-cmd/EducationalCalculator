/**
 * Layout-figure checks for the Grades 9–12 round 2 figures of group H2E (`typesHs2e.ts`), called
 * from `layoutFigures.ts`. Test-only.
 */
import type { LayoutDef } from '../layouts';
import { geneIsOn, keyPath } from '../typesHs2e';

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
  // A dichotomous key is a tree: every question reached once from the first, every answer a
  // question or a name, the names different; a scene's specimen is one of them.
  if (l.kind === 'explore' && l.figure.kind === 'dichotomousKey') {
    const steps = l.figure.steps;
    const reached = new Map<number, number>();
    const names: string[] = [];
    const walk = (node: number | string, depth: number) => {
      if (typeof node === 'string') return void names.push(node);
      if (!steps[node])
        return void out.push(`key: answer leads to question ${node}, not in the key`);
      reached.set(node, (reached.get(node) ?? 0) + 1);
      if (reached.get(node)! > 1 || depth > steps.length) return;
      walk(steps[node].yes, depth + 1);
      walk(steps[node].no, depth + 1);
    };
    walk(0, 0);
    steps.forEach((s, k) => {
      const n = reached.get(k) ?? 0;
      if (n !== 1) out.push(`key: question ${k} ("${s.question}") is reached ${n} times`);
      if (!/\?$/.test(s.question)) out.push(`key: question ${k} does not end in "?"`);
    });
    if (new Set(names).size !== names.length) out.push('key: a name appears twice');
    for (const s of l.scenes) {
      const who = s.key?.specimen;
      if (who !== undefined && !keyPath(steps, who))
        out.push(`scene "${s.label}": ${who} is not a name in the key`);
      const q = s.key?.step;
      if (q !== undefined && !steps[q]) out.push(`scene "${s.label}": no question ${q}`);
    }
  }
  return out;
}

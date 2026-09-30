/**
 * Layout figure checks for Grades 9–12 round 2, group H2D (H101, `typesHs2d.ts`): a hydration
 * scene's ions are real ions, and a condensed-formula card has the functional group it lights.
 * Called from `layoutFigureIssues`. Test-only.
 */
import { ELEMENTS, parseFormula } from '@/components/module/reps/chem';

import type { LayoutDef } from '../layouts';
import { condensedUnits, groupUnits, ionOf } from '../typesHs2d';

export function hs2dFigureIssues(l: LayoutDef): string[] {
  const out: string[] = [];
  if (l.kind === 'explore' && l.figure.kind === 'molecules')
    for (const s of l.scenes) {
      const h = s.molecules?.hydration;
      if (!h) continue;
      if (h.ions.length < 1 || h.ions.length > 2)
        out.push(`scene "${s.label}": ${h.ions.length} ions (the figure rings 1 or 2)`);
      for (const text of h.ions) {
        const ion = ionOf(text);
        if (!ion) out.push(`scene "${s.label}": "${text}" is not an ion (write "Na+", "Cl-")`);
        else if (parseFormula(ion.formula).some(({ el }) => !ELEMENTS.some(([sym]) => sym === el)))
          out.push(`scene "${s.label}": ${ion.formula} is not made of elements`);
      }
      if (h.waters !== undefined && (h.waters < 4 || h.waters > 8))
        out.push(`scene "${s.label}": ${h.waters} waters (4 to 8 fit around an ion)`);
    }
  const cards =
    l.kind === 'sort'
      ? l.cards.map((c) => ({ label: c.label, f: c.figure }))
      : l.kind === 'sequence'
        ? l.stages.map((c) => ({ label: c.label, f: c.figure }))
        : [];
  for (const { label, f } of cards) {
    if (f?.kind !== 'condensed') continue;
    if (groupUnits(f.formula, f.group).length === 0)
      out.push(`card "${label}": ${f.formula} has no ${f.group} group to light`);
    if (condensedUnits(f.formula).length > 8)
      out.push(`card "${label}": ${f.formula} is too long for a card (8 groups at most)`);
  }
  return out;
}

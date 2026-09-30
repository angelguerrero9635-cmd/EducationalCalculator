/**
 * Layout figure checks for group HH's explore figures (biology H39–H42). A cladogram's taxa are
 * unique and few enough to draw, every trait's taxa are one clade (an ancestor and all its
 * descendants, so the mark has one branch to sit on), and a scene lights a listed trait and rings
 * listed taxa; a feedback loop has 3 to 6 steps, short enough for its boxes. Called from
 * `layoutFigureIssues`. Test-only.
 */
import { cladeNodes, CLADE_MAX, traitNode } from '@/components/module/layouts/cladeMath';

import type { LayoutDef } from '../layouts';

export function hshFigureIssues(l: LayoutDef): string[] {
  const out: string[] = [];
  if (l.kind !== 'explore') return out;
  const f = l.figure;
  if (f.kind === 'cladogram') {
    const nodes = cladeNodes(f.tree);
    const taxa = nodes[0]!.taxa;
    if (new Set(taxa).size !== taxa.length) out.push('a taxon is listed twice in the tree');
    if (taxa.length < 3 || taxa.length > CLADE_MAX)
      out.push(`${taxa.length} taxa (3 to ${CLADE_MAX} are drawn)`);
    if (nodes.some((n) => !n.name && n.children.length < 2))
      out.push('a clade in the tree has fewer than two branches');
    for (const t of f.traits) {
      const missing = t.taxa.filter((x) => !taxa.includes(x));
      if (missing.length) out.push(`trait ${t.name}: ${missing.join(', ')} not in the tree`);
      else if (traitNode(nodes, t) < 0)
        out.push(`trait ${t.name}: ${t.taxa.join(', ')} are not one clade`);
    }
    if (new Set(f.traits.map((t) => t.name)).size !== f.traits.length)
      out.push('two traits share a name');
    for (const s of l.scenes) {
      const lit = s.clade?.lit;
      if (lit !== undefined && !f.traits.some((t) => t.name === lit))
        out.push(`scene "${s.label}": no trait ${lit}`);
      for (const r of s.clade?.ring ?? [])
        if (!taxa.includes(r)) out.push(`scene "${s.label}": ${r} is not in the tree`);
    }
  }
  if (f.kind === 'feedbackLoop') {
    for (const s of l.scenes) {
      const loop = s.loop;
      if (!loop) continue;
      if (loop.steps.length < 3 || loop.steps.length > 6)
        out.push(`scene "${s.label}": ${loop.steps.length} loop steps (3 to 6 are drawn)`);
      if (loop.lit !== undefined && (loop.lit < 0 || loop.lit >= loop.steps.length))
        out.push(`scene "${s.label}": step ${loop.lit} lit, not a step`);
      if (loop.steps.some((st) => st.text.length > 90))
        out.push(`scene "${s.label}": a step over 90 characters (keep each box to 3 lines)`);
    }
  }
  return out;
}

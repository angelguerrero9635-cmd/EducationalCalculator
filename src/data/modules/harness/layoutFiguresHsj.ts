/**
 * Layout figure checks for group HJ's `electrochemicalCell` figure (H56): every scene names two
 * different metals the figure knows, the anode it draws has the lower reduction potential and
 * the voltage it reads is E°cathode − E°anode (positive). Called from `layoutFigureIssues`.
 * Test-only.
 */
import { CELL_METALS, cellOf } from '@/components/module/layouts/galvanic';

import type { LayoutDef } from '../layouts';

export function galvanicFigureIssues(l: LayoutDef): string[] {
  const out: string[] = [];
  if (l.kind !== 'explore' || l.figure.kind !== 'electrochemicalCell') return out;
  for (const s of l.scenes) {
    const g = s.galvanic;
    if (!g) {
      out.push(`scene "${s.label}": no galvanic cell`);
      continue;
    }
    if (!g.metals.every((m) => m in CELL_METALS)) out.push(`scene "${s.label}": unknown metal`);
    const cell = cellOf(g.metals);
    if (!cell) {
      out.push(`scene "${s.label}": the same metal on both sides makes no cell`);
      continue;
    }
    const [an, ca] = [CELL_METALS[cell.anode], CELL_METALS[cell.cathode]];
    if (!(an.potential < ca.potential)) out.push(`scene "${s.label}": the anode is not the lower`);
    if (Math.abs(cell.voltage - (ca.potential - an.potential)) > 1e-9 || cell.voltage <= 0)
      out.push(`scene "${s.label}": E° ${cell.voltage} V is not E°cathode − E°anode`);
  }
  return out;
}

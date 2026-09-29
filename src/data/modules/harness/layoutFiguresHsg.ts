/**
 * Layout figure checks for group HG's biology figures (`typesHsg.ts`): a `macromolecules` scene
 * joins 2 to 4 monomers and gives off one water per bond. Called from `layoutFigureIssues`.
 * Test-only.
 */
import type { LayoutDef } from '../layouts';
import { watersOf } from '../typesHsg';

export function hsgFigureIssues(l: LayoutDef): string[] {
  const out: string[] = [];
  if (l.kind === 'explore' && l.figure.kind === 'macromolecules') {
    for (const s of l.scenes) {
      const m = s.macro;
      if (!m) continue;
      if (m.kind === 'lipid' && m.count !== undefined && m.count !== 3)
        out.push(`scene "${s.label}": a fat is glycerol and 3 fatty acids, not ${m.count}`);
      if (m.kind !== 'lipid' && m.count !== undefined && (m.count < 2 || m.count > 4))
        out.push(`scene "${s.label}": ${m.count} monomers (the figure joins 2 to 4)`);
      // One water per new bond: n − 1 in a chain, 3 for a fat's three ester bonds.
      const bonds = m.kind === 'lipid' ? 3 : (m.count ?? 3) - 1;
      if (watersOf(m) !== bonds)
        out.push(`scene "${s.label}": ${watersOf(m)} water molecules for ${bonds} bonds`);
      // A line that counts the water must say the figure's number.
      const said = s.lines.join(' ').match(/(\d+) (?:water|H₂O)/);
      if (said && Number(said[1]) !== watersOf(m))
        out.push(
          `scene "${s.label}": the text says ${said[1]} water, the figure draws ${watersOf(m)}`,
        );
    }
  }
  return out;
}

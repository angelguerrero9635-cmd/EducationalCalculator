/**
 * Layout figure checks for group HG's biology figures (`typesHsg.ts`): a `macromolecules` scene
 * joins 2 to 4 monomers and gives off one water per bond. Called from `layoutFigureIssues`.
 * Test-only.
 */
import { cellsOf, diploidOf, isMeiosis } from '@/components/module/layouts/divisionMath';

import type { LayoutDef } from '../layouts';
import { ENERGY_FLOWS, watersOf, type DivisionStage } from '../typesHsg';

const DIVISION_ORDER: DivisionStage[] = [
  'interphase',
  'prophase',
  'metaphase',
  'anaphase',
  'telophase',
  'cytokinesis',
  'prophase I',
  'metaphase I',
  'anaphase I',
  'telophase I',
  'prophase II',
  'metaphase II',
  'anaphase II',
  'telophase II',
];

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
  // Cell-division cards: 2n drawable, each cell's chromosomes right for its stage, stages in order.
  const cards =
    l.kind === 'sequence'
      ? l.stages.map((s) => ({ label: s.label, f: s.figure }))
      : l.kind === 'sort'
        ? l.cards.map((s) => ({ label: s.label, f: s.figure }))
        : [];
  const division = cards.flatMap(({ label, f }) =>
    f?.kind === 'cellDivision' ? [{ label, f }] : [],
  );
  for (const { label, f } of division) {
    if (f.diploid !== undefined && ![2, 4, 6].includes(f.diploid))
      out.push(`card "${label}": 2n = ${f.diploid} (the card draws 2, 4 or 6)`);
    const n = diploidOf(f.diploid) / 2;
    const cells = cellsOf(f.stage, f.diploid);
    const late = ['anaphase II', 'telophase II'].includes(f.stage);
    const halved = isMeiosis(f.stage) && !['prophase I', 'metaphase I'].includes(f.stage);
    const want = isMeiosis(f.stage) ? (late ? 4 : halved ? 2 : 1) : cells.length;
    if (cells.length !== want) out.push(`card "${label}": ${cells.length} cells, expected ${want}`);
    for (const cell of cells) {
      // Mitosis keeps 2n in every cell; meiosis I halves it to n, one of each pair.
      const size = halved ? n : 2 * n;
      if (cell.length !== size)
        out.push(`card "${label}": a cell with ${cell.length} chromosomes, expected ${size}`);
      if (halved && new Set(cell.map((ch) => ch.pair)).size !== n)
        out.push(`card "${label}": a cell after meiosis I lacks one of each pair`);
      const dup = cell.every((ch) => ch.chromatids.length === 2);
      const single = cell.every((ch) => ch.chromatids.length === 1);
      const duplicated =
        !['interphase', 'anaphase', 'telophase', 'cytokinesis'].includes(f.stage) && !late;
      if (duplicated ? !dup : !single)
        out.push(`card "${label}": chromatids per chromosome are wrong for ${f.stage}`);
    }
    if (f.stage === 'telophase II') {
      const key = (cell: (typeof cells)[number]) =>
        cell.map((ch) => ch.chromatids.map((t) => t.parent + t.tip).join()).join('|');
      if (new Set(cells.map(key)).size !== 4)
        out.push(`card "${label}": the four cells after meiosis are not all different`);
    }
  }
  if (l.kind === 'sequence' && division.length) {
    const at = division.map(({ f }) => DIVISION_ORDER.indexOf(f.stage));
    if (at.some((x, i) => i > 0 && x <= at[i - 1]!))
      out.push('cell-division stages are out of order');
  }
  if (l.kind === 'explore' && l.figure.kind === 'organelleEnergy') {
    for (const s of l.scenes) {
      const e = s.energy;
      if (!e) continue;
      // A ringed substance must be one the lit process takes in or gives out.
      const flows = ENERGY_FLOWS[e.process ?? 'cycle'];
      if (e.lit && !flows.includes(e.lit))
        out.push(`scene "${s.label}": ${e.lit} is not part of ${e.process ?? 'the cycle'}`);
    }
  }
  return out;
}

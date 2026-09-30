/**
 * Layout figure checks: what an observe figure, a drawn parts figure, an animal `dots` scene or
 * a sort's header draws must fit the page's data (every column has its height or distance, the
 * scale reaches the page's values, every part named is drawn). Test-only.
 */
import { DRAWN_PARTS, drawnPart, scaleTicks } from '@/components/module/layouts/figureMath';

import type { LayoutDef } from '../layouts';
import { studyFigureIssues } from './layoutFiguresHsb';
import { galvanicFigureIssues } from './layoutFiguresHsj';

/** The number in a column label ("20 cm" → 20). */
const numberIn = (label: string) => {
  const m = /(\d+(?:\.\d+)?)/.exec(label);
  return m ? Number(m[1]) : undefined;
};

export function layoutFigureIssues(l: LayoutDef): string[] {
  const out: string[] = [];
  if (l.kind === 'observe' && l.figure) {
    const f = l.figure;
    const n = l.columns.length;
    /** One entry per column, each matching the number in the column's label when it has one. */
    const perColumn = (xs: number[], what: string) => {
      if (xs.length !== n) out.push(`${f.kind}: ${xs.length} ${what}s for ${n} columns`);
      xs.forEach((x, i) => {
        if (!(x > 0)) out.push(`${f.kind}: ${what} ${x} for "${l.columns[i]}" is not positive`);
        const shown = numberIn(l.columns[i] ?? '');
        if (shown !== undefined && shown !== x) {
          out.push(`${f.kind}: column "${l.columns[i]}" is drawn at ${x}`);
        }
      });
    };
    switch (f.kind) {
      case 'shadowStick':
        if (!(f.stick > 0)) out.push(`shadowStick: stick ${f.stick}`);
        if (f.sides && f.sides.length !== n) {
          out.push(`shadowStick: ${f.sides.length} sides for ${n} columns`);
        }
        break;
      case 'thermometer':
        if (!l.unit.startsWith('°')) out.push(`thermometer: unit "${l.unit}" is not degrees`);
        // The scale is labeled from 0 to max: the top must be one of its labels.
        if (l.max % scaleTicks(l.max, 170 / l.max).label !== 0) {
          out.push(`thermometer: top ${l.max} is not on the scale's labels`);
        }
        break;
      case 'plantHeight':
        if (l.unit !== 'cm') out.push(`plantHeight: the ruler is in cm, not "${l.unit}"`);
        // A mark per centimeter at least 4 px apart on a ~170 px ruler.
        if (l.max > 40) out.push(`plantHeight: a ${l.max} cm ruler is too fine to read`);
        break;
      case 'ramp':
        if (l.unit !== 'cm') out.push(`ramp: distances are in cm, not "${l.unit}"`);
        perColumn(f.heights, 'height');
        break;
      case 'flashlight':
        if (l.unit !== 'cm') out.push(`flashlight: the circle is measured in cm, not "${l.unit}"`);
        perColumn(f.distances, 'distance');
        break;
      case 'cup':
        if (l.unit !== 'mm' && l.unit !== 'cm') out.push(`cup: level unit "${l.unit}"`);
        break;
    }
  }
  if (l.kind === 'explore') {
    const f = l.figure;
    if (f.kind === 'parts' && f.drawing) {
      const drawn = DRAWN_PARTS[f.drawing];
      for (const p of f.parts) {
        if (!drawn.includes(drawnPart(p.name))) {
          out.push(`${f.drawing} drawing has no part "${p.name}" (${drawn.join(', ')})`);
        }
      }
    }
    for (const s of l.scenes) {
      if (!s.animal) continue;
      if (f.kind !== 'dots') out.push(`scene "${s.label}": animal on a ${f.kind} figure`);
      const count = (s.dots?.[0] ?? 1) * (s.dots?.[1] ?? 1);
      if (count > 60) out.push(`scene "${s.label}": ${count} animals, the figure draws 60`);
    }
  }
  out.push(...studyFigureIssues(l));
  out.push(...galvanicFigureIssues(l));
  if (l.kind === 'sort' && l.header?.kind === 'offspring') {
    const animals = l.header.animals;
    if (animals.length < 2 || animals.length > 4) {
      out.push(`offspring: ${animals.length} animals (2 to 4 fit)`);
    }
    for (const a of animals) {
      if (a.animal === 'cat' && (a.antlers || a.spots))
        out.push(`offspring: a cat with antlers or spots`);
      if (a.animal === 'cat' && a.fur === 'brown')
        out.push('offspring: a brown cat is drawn as a deer coat');
    }
    if (!animals.some((a) => a.young)) out.push('offspring: no young animal');
  }
  return out;
}

/**
 * Harness checks for the round 2 group H2H options (H105), kept apart from pictures.ts so each
 * kind's case there only calls in. `val` reads a value as shown (undefined when it is "?").
 * Test-only.
 */
import type { Representation } from '../types';

type Val = (x: string | number) => number | undefined;

/** The H105 options' checks, by kind. */
export function hs2hIssues(rep: Representation, val: Val): string[] {
  const out: string[] = [];
  switch (rep.kind) {
    case 'transformation': {
      // A mirror picked by a value: 1 is y = x, −1 is y = −x.
      if (rep.move !== 'reflect' || !rep.slope) break;
      const s = val(rep.slope);
      if (s !== undefined && s !== 1 && s !== -1) out.push(`mirror slope ${s} is not 1 or −1`);
      break;
    }
    case 'treeDiagram': {
      // Each size's names: as many as the size, all different.
      if ('chances' in rep || 'chain' in rep || !rep.namesBySize) break; // HC98: chain apart
      for (const [size, names] of Object.entries(rep.namesBySize)) {
        if (names.length !== Number(size)) out.push(`${names.length} names for a stage of ${size}`);
        if (new Set(names).size !== names.length) out.push(`names for ${size} repeat`);
      }
      break;
    }
    case 'markedFigure': {
      // Diagonals make a rhombus only; a ray point starts from a point placed before it.
      const q = rep.quadrilateral;
      if (q?.across && q.family !== 'rhombus') out.push(`diagonals (across) on a ${q.family}`);
      if (q && !q.across && q.width === undefined) out.push('a quadrilateral with no width');
      const names = Object.keys(rep.points ?? {});
      Object.entries(rep.points ?? {}).forEach(([name, p]) => {
        if (Array.isArray(p)) return;
        for (const from of [p.from, ...(p.meets ? [p.meets.from] : [])]) {
          const at = names.indexOf(from);
          const src = rep.points![from];
          if (at < 0 || (!Array.isArray(src) && at >= names.indexOf(name)))
            out.push(`point ${name}'s ray starts at ${from}, not placed before it`);
        }
      });
      break;
    }
    case 'linearFunction':
      // A test point is tested in the inequality the line bounds.
      if (rep.test && !rep.shade) out.push('a test point with no inequality (shade)');
      break;
  }
  return out;
}

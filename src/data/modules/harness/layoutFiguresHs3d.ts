/**
 * Layout-figure checks for round 3 group H3D (biology, H109; `typesHs3d.ts`), called from
 * `layoutFigures.ts`. Test-only.
 */
import { bandAt } from '@/components/module/reps/bioModel';
import {
  gelCaption,
  gelFigureWindow,
  gelSceneLanes,
} from '@/components/module/layouts/gelFigureMath';

import type { LayoutDef } from '../layouts';
import { GEL_FIGURE_LANES, GEL_SCENE_LANES, REFLEX_ORDER } from '../typesHs3d';

/** The gel's running length on the figure (px): bands closer than 6 px read as one. */
const RUN = 236;

export function hs3dFigureIssues(l: LayoutDef): string[] {
  const out: string[] = [];
  // Reflex-arc cards in a sequence come in the order the impulse reaches their parts.
  if (l.kind === 'sequence') {
    const at = l.stages.flatMap((s) =>
      s.figure?.kind === 'reflexArc' ? [REFLEX_ORDER.indexOf(s.figure.lit)] : [],
    );
    if (at.some((k, i) => i > 0 && k <= at[i - 1]!))
      out.push(`reflexArc cards are not in the order ${REFLEX_ORDER.join(', ')}`);
  }
  if (l.kind === 'explore' && l.figure.kind === 'gel') {
    const fig = l.figure;
    const names = fig.lanes.map((x) => x.label);
    if (names.length > GEL_FIGURE_LANES) out.push(`gel: ${names.length} lanes, at most 8`);
    if (new Set(names).size !== names.length) out.push('gel: two lanes share a name');
    const win = gelFigureWindow(fig);
    for (const lane of fig.lanes) {
      if (lane.bands.length === 0 || lane.bands.length > 6)
        out.push(`gel: lane ${lane.label} has ${lane.bands.length} bands (1–6)`);
      if (lane.bands.some((b) => !(b >= 50 && b <= 20000)))
        out.push(`gel: lane ${lane.label} has a band outside 50–20,000 bp`);
      const ys = lane.bands.map((b) => bandAt(b, win) * RUN).sort((a, b) => a - b);
      if (ys.some((y, i) => i > 0 && y - ys[i - 1]! < 6))
        out.push(`gel: lane ${lane.label} has two bands too close to tell apart`);
    }
    for (const s of l.scenes) {
      const g = s.gel;
      if (!g) continue;
      const shown = gelSceneLanes(fig, g).map((x) => x.label);
      for (const n of g.lanes ?? [])
        if (!names.includes(n)) out.push(`scene "${s.label}": no lane ${n}`);
      if ((g.lanes ?? names).length > GEL_SCENE_LANES)
        out.push(`scene "${s.label}": more than ${GEL_SCENE_LANES} lanes`);
      for (const n of [...(g.lit ?? []), ...(g.compare ? [g.compare] : []), ...(g.parents ?? [])])
        if (!shown.includes(n)) out.push(`scene "${s.label}": lane ${n} is not shown`);
      if (g.parents && (!g.compare || g.parents.includes(g.compare)))
        out.push(`scene "${s.label}": parents need the child's lane as compare`);
      // A line naming a verdict agrees with the bands.
      const text = s.lines.join(' ');
      const cap = gelCaption(gelSceneLanes(fig, g), g);
      if (/ruled out/.test(text) !== /ruled out/.test(cap))
        out.push(`scene "${s.label}": the text and the bands disagree on ruling out`);
    }
  }
  return out;
}

/**
 * Picture checks for group H2B's geometry options (H96, `typesHs2b.ts`): what each draws must
 * agree with the values. Called from `repIssues` in `pictures.ts` beside the kind's own check.
 * Test-only.
 */
import { angleAt, buildRegular } from '@/components/module/reps/regularGeo';

import type { Representation } from '../types';

const near = (x: number, y: number) => Math.abs(x - y) <= 1e-6 * Math.max(1, Math.abs(x));

export function hs2bIssues(rep: Representation, val: (id: string) => number | undefined): string[] {
  const out: string[] = [];
  const num = (x: string | number | undefined) =>
    x === undefined ? undefined : typeof x === 'number' ? x : val(x);
  if (rep.kind === 'markedFigure' && rep.regular) {
    const r = rep.regular;
    const n = num(r.sides);
    if (n === undefined) return out;
    const fig = buildRegular(n);
    if (fig.reason) return [`~regular polygon can't be drawn: ${fig.reason}`];
    // The drawn corners are all on one circle, the sides equal, and the angle at B is the
    // interior angle; the exterior angle at B makes 180° with it.
    const [A, B, C] = [fig.pts[0]!, fig.pts[1]!, fig.pts[2]!];
    const side = Math.hypot(B[0] - A[0], B[1] - A[1]);
    fig.pts.forEach((p, i) => {
      const q = fig.pts[(i + 1) % n]!;
      if (!near(Math.hypot(q[0] - p[0], q[1] - p[1]), side)) out.push(`side ${i} is not equal`);
    });
    const drawnInterior = angleAt(B, A, C);
    const drawnExterior = angleAt(B, fig.E, C);
    if (!near(drawnInterior, fig.interior))
      out.push(`the angle at B is drawn ${drawnInterior} for ${fig.interior}`);
    if (!near(drawnExterior, fig.exterior))
      out.push(`the exterior angle is drawn ${drawnExterior} for ${fig.exterior}`);
    const check = (id: string | undefined, want: number, what: string) => {
      const x = id ? val(id) : undefined;
      if (x !== undefined && !near(x, want)) out.push(`${what} ${x} is not ${want} for ${n} sides`);
    };
    check(r.labels?.sum, fig.sum, 'interior sum');
    check(r.labels?.interior, fig.interior, 'interior angle');
    check(r.labels?.exterior, fig.exterior, 'exterior angle');
  }
  return out;
}

/**
 * Picture checks for the Grades 9–12 geometry pictures of group HC (`typesHsc.ts`): what each
 * draws must agree with the values. Called from `repIssues` in `pictures.ts`. Test-only.
 */
import { buildFigure, markIssues, measure } from '@/components/module/reps/markedFigureGeo';
import { solveTriangle, triangleError, type Tri } from '@/components/module/reps/triangleSolve';

import type { HscSpec, TriPart } from '../typesHsc';

const PARTS: TriPart[] = ['a', 'b', 'c', 'A', 'B', 'C'];
const SPECIAL = { '45-45-90': [45, 45, 90], '30-60-90': [30, 60, 90] } as const;

export function hscIssues(rep: HscSpec, val: (id: string) => number | undefined): string[] {
  const out: string[] = [];
  const num = (x: string | number | undefined) =>
    x === undefined ? undefined : typeof x === 'number' ? x : val(x);
  switch (rep.kind) {
    case 'triangleSolver': {
      const right = !!(rep.trig || rep.special || rep.scene);
      const known: Partial<Record<TriPart, number>> = {};
      for (const p of PARTS) {
        let x = num(rep.parts[p]);
        const i = ['A', 'B', 'C'].indexOf(p);
        if (x === undefined && rep.special && i >= 0) x = SPECIAL[rep.special][i];
        if (x === undefined && right && p === 'C') x = 90;
        if (x !== undefined) known[p] = x;
      }
      // Fewer than three parts, or no side: the picture asks for more (drawn faded).
      if (Object.keys(known).length < 3 || !['a', 'b', 'c'].some((p) => p in known)) break;
      const solved = solveTriangle(known);
      if (solved.triangles.length === 0) {
        // The picture then draws faded with the reason: a note, not an error.
        out.push(`~triangle parts make no triangle: ${solved.reason}`);
        break;
      }
      // The drawn triangle satisfies the laws of sines and cosines and holds every known part.
      const fits = (t: Tri) =>
        triangleError(t) < 1e-6 &&
        PARTS.every(
          (p) =>
            known[p] === undefined || Math.abs(t[p] - known[p]!) <= 1e-4 * Math.max(1, known[p]!),
        );
      if (!solved.triangles.some(fits))
        out.push(`triangle parts ${JSON.stringify(known)} break the laws of sines and cosines`);
      if (right && known.C !== undefined && Math.abs(known.C - 90) > 1e-6)
        out.push(`right-triangle picture with C = ${known.C}`);
      if (rep.similar) {
        const k = val(rep.similar.scale);
        for (const p of ['a', 'b', 'c'] as const) {
          const id = rep.similar.sides?.[p];
          const x = id ? val(id) : undefined;
          if (k !== undefined && x !== undefined && known[p] !== undefined)
            if (Math.abs(x - k * known[p]!) > 1e-4 * Math.max(1, x))
              out.push(`similar side ${x} is not ${k} × ${known[p]}`);
        }
      }
      break;
    }
    case 'markedFigure': {
      // Every mark means what it says on the drawn figure, and every labelled value is the
      // length or angle it sits on.
      const fig = buildFigure(rep, num);
      if (fig.reason) {
        out.push(`~figure can't be drawn: ${fig.reason}`);
        break;
      }
      out.push(...markIssues(fig));
      for (const l of fig.labels) {
        const x = l.value ? val(l.value) : undefined;
        const m = measure(fig, l.at);
        if (x !== undefined && m !== undefined && Math.abs(x - m) > 1e-4 * Math.max(1, m))
          out.push(`label ${l.at} = ${x} but the figure's is ${m}`);
      }
      const t = rep.transversal;
      if (t) for (const n of t.highlight ?? []) if (!(n >= 1 && n <= 8)) out.push(`angle ${n}`);
      if (rep.proof) {
        const k = val(rep.proof.step);
        if (k !== undefined && !(Number.isInteger(k) && k >= 1 && k <= rep.proof.steps.length))
          out.push(`proof step ${k} of ${rep.proof.steps.length}`);
      }
      break;
    }
  }
  return out;
}

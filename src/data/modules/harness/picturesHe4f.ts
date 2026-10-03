/**
 * Picture checks for college round 4, group F (docs/RENDERINGS_HE.md, earth science), called
 * from `repIssues` in `pictures.ts` with values in formula units. Test-only.
 *
 * - HC116 `ternary`: the point's coordinates are each amount ÷ the sum (0.5 %, and the page's
 *   normalized values the same); the field named in the caption contains the point (its drawn
 *   polygon, an independent test of the rules); the share is c ÷ (b + c).
 */
import {
  FELDSPAR_FIELDS,
  QAP_FIELDS,
  baryXY,
  inPolygon,
  normalize,
  ternaryField,
} from '@/components/module/reps/he4fMath';

import type { He4fSpec, TernarySpec } from '../typesHe4f';

type Val = (id: string) => number | undefined;

const near = (a: number, b: number, tol: number) =>
  Math.abs(a - b) <= tol * Math.max(1, Math.abs(a), Math.abs(b));

/** Every check of group HE4F. */
export function he4fIssues(rep: He4fSpec, val: Val): string[] {
  const num = (x: string | number | undefined) =>
    x === undefined ? undefined : typeof x === 'number' ? x : val(x);
  switch (rep.kind) {
    case 'ternary':
      return ternaryIssues(rep, num);
  }
}

type Num = (x: string | number | undefined) => number | undefined;

function ternaryIssues(rep: TernarySpec, num: Num): string[] {
  const out: string[] = [];
  const [a, b, c] = [num(rep.a), num(rep.b), num(rep.c)];
  if (a === undefined || b === undefined || c === undefined) return out;
  if (a < 0 || b < 0 || c < 0) out.push(`ternary: an amount is negative (${a}, ${b}, ${c})`);
  const p = normalize(a, b, c);
  if (!p) return out;
  const s = a + b + c;
  // The drawn point: its distance from each side is that corner's share of the height.
  const [x, y] = baryXY(p);
  const h = Math.sqrt(3) / 2;
  const fromBase = y / h;
  const fromRight = (Math.sqrt(3) * (1 - x) - y) / 2 / h;
  const fromLeft = (Math.sqrt(3) * x - y) / 2 / h;
  for (const [got, want, name] of [
    [fromBase, a / s, rep.labels[0]],
    [fromRight, b / s, rep.labels[1]],
    [fromLeft, c / s, rep.labels[2]],
  ] as const)
    if (Math.abs(got - want) > 0.005) out.push(`ternary: ${name} is drawn at ${got}, not ${want}`);
  rep.normalized?.forEach((n, i) => {
    const v = num(n);
    if (v !== undefined && Math.abs(v - (100 * [a, b, c][i]!) / s) > 0.05)
      out.push(`ternary: ${rep.labels[i]}′ = ${v}, not ${(100 * [a, b, c][i]!) / s}`);
  });
  const share = num(rep.share);
  if (share !== undefined && b + c > 0 && !near(share, (100 * c) / (b + c), 1e-4))
    out.push(`ternary: the share ${share}% is not ${(100 * c) / (b + c)}%`);
  if (rep.fields) {
    const f = ternaryField(rep.fields, p);
    const all = rep.fields === 'qap' ? QAP_FIELDS : FELDSPAR_FIELDS;
    if (!all.includes(f)) out.push(`ternary: field ${f.code} is not drawn`);
    if (!inPolygon(p, f.poly)) out.push(`ternary: the point is outside field ${f.code} named`);
    // The fields tile the triangle: the point is in some field, and only on edges in two.
    const holding = all.filter((g) => inPolygon(p, g.poly));
    if (!holding.length) out.push('ternary: the point is in no field');
  }
  return out;
}

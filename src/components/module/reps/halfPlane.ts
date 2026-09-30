/**
 * Half-planes for graphed inequalities (H16): y (sign) mx + b as a region of the grid, clipped
 * to the frame, and the overlap of several. Exact: the region is the frame polygon cut along
 * each boundary line (Sutherland–Hodgman), so its edge lies on the drawn line.
 */
import type { InequalitySign } from '@/data/modules/typesGraphs';

import type { Frame } from './graphKit';

type Pt = [number, number];

/** A boundary: y (sign) mx + b, or with `upright` (H92) x (sign) b (m unused). */
export interface Bound {
  m: number;
  b: number;
  sign: InequalitySign;
  upright?: boolean;
}

/** Above the line for > and ≥, below it for < and ≤. */
export const above = (sign: InequalitySign) => sign === '>' || sign === '≥';
/** < and >: the boundary is left out (drawn dashed). */
export const strict = (sign: InequalitySign) => sign === '<' || sign === '>';

/** Whether (x, y) satisfies y (sign) mx + b (to 1e-9, so a point on a solid line counts). */
export function holds(q: Bound, x: number, y: number) {
  const d = q.upright ? x - q.b : y - (q.m * x + q.b);
  const eps = 1e-9 * Math.max(1, Math.abs(q.upright ? x : y));
  return q.sign === '>'
    ? d > eps
    : q.sign === '≥'
      ? d >= -eps
      : q.sign === '<'
        ? d < -eps
        : d <= eps;
}

/** The part of a convex polygon on the kept side of one boundary. */
function cut(poly: Pt[], q: Bound): Pt[] {
  const side = (p: Pt) =>
    (above(q.sign) ? 1 : -1) * (q.upright ? p[0] - q.b : p[1] - (q.m * p[0] + q.b));
  const out: Pt[] = [];
  poly.forEach((p, i) => {
    const n = poly[(i + 1) % poly.length]!;
    const [sp, sn] = [side(p), side(n)];
    if (sp >= 0) out.push(p);
    if (sp * sn < 0) {
      const t = sp / (sp - sn);
      out.push([p[0] + t * (n[0] - p[0]), p[1] + t * (n[1] - p[1])]);
    }
  });
  return out;
}

/** The region of the frame where every boundary holds, as a polygon in grid numbers. */
export function region(bounds: Bound[], f: Frame): Pt[] {
  let poly: Pt[] = [
    [f.x[0], f.y[0]],
    [f.x[1], f.y[0]],
    [f.x[1], f.y[1]],
    [f.x[0], f.y[1]],
  ];
  for (const q of bounds) poly = cut(poly, q);
  return poly;
}

/** The polygon as an SVG path in canvas pixels ('' when it is empty). */
export function regionPath(poly: Pt[], f: Frame) {
  if (poly.length < 3) return '';
  return `${poly.map((p, i) => `${i ? 'L' : 'M'} ${f.sx(p[0])} ${f.sy(p[1])}`).join(' ')} Z`;
}

/**
 * Whether two boundaries share any point at all (anywhere, not only in the frame): only
 * parallel lines shading away from each other can miss.
 */
export function overlaps(p: Bound, q: Bound) {
  if (!!p.upright !== !!q.upright) return true;
  if ((!p.upright && p.m !== q.m) || above(p.sign) === above(q.sign)) return true;
  const [lo, hi] = above(p.sign) ? [p, q] : [q, p];
  // y above lo.b and below hi.b (at every x): a strip, a line (both solid, equal) or nothing.
  return lo.b < hi.b || (lo.b === hi.b && !strict(lo.sign) && !strict(hi.sign));
}

/** "y = 2x + 3" as the inequality "y > 2x + 3". */
export const withSign = (equation: string, sign: string | undefined) =>
  sign ? equation.replace(' = ', ` ${sign} `) : equation;

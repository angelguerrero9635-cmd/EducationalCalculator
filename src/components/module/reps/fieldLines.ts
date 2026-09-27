/**
 * Magnetic field lines traced from poles: each magnet is a north pole (q > 0) and a south pole
 * (q < 0), and a line runs along the field from a start point near a north pole until it
 * reaches a south pole or leaves the box. Pure geometry, shared by the bar-magnet figure and
 * the electromagnet picture.
 */

export interface Pole {
  x: number;
  y: number;
  /** + for a north pole, − for a south pole; the size is its strength. */
  q: number;
}

export interface Box {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
}

/** The field's direction at (x, y) (unit vector), or undefined right on a pole. */
export function fieldAt(poles: Pole[], x: number, y: number): [number, number] | undefined {
  let fx = 0;
  let fy = 0;
  for (const p of poles) {
    const dx = x - p.x;
    const dy = y - p.y;
    const r2 = dx * dx + dy * dy;
    if (r2 < 1e-6) return undefined;
    const k = p.q / (r2 * Math.sqrt(r2));
    fx += k * dx;
    fy += k * dy;
  }
  const len = Math.hypot(fx, fy);
  return len > 0 ? [fx / len, fy / len] : undefined;
}

/**
 * Traces one line from (x, y) along the field (midpoint steps of `step` px). It stops within
 * `catchR` of a south pole (a north pole, traced backward), outside `box`, inside any `solid`
 * rectangle (a magnet's body) after leaving it, or after `max` steps.
 */
export function traceLine(
  poles: Pole[],
  x: number,
  y: number,
  box: Box,
  solids: Box[] = [],
  step = 2,
  catchR = 5,
  max = 1600,
  /** −1 traces against the field, from a south pole back toward a north pole. */
  dir: 1 | -1 = 1,
): [number, number][] {
  const pts: [number, number][] = [[x, y]];
  const inside = (px: number, py: number, b: Box) =>
    px > b.x0 && px < b.x1 && py > b.y0 && py < b.y1;
  let left = !solids.some((b) => inside(x, y, b));
  for (let i = 0; i < max; i++) {
    const d1 = fieldAt(poles, x, y);
    if (!d1) break;
    const d2 = fieldAt(poles, x + (dir * d1[0] * step) / 2, y + (dir * d1[1] * step) / 2);
    if (!d2) break;
    x += dir * d2[0] * step;
    y += dir * d2[1] * step;
    pts.push([x, y]);
    if (x < box.x0 || x > box.x1 || y < box.y0 || y > box.y1) break;
    const inSolid = solids.some((b) => inside(x, y, b));
    if (inSolid && left) break;
    if (!inSolid) left = true;
    if (poles.some((p) => p.q * dir < 0 && Math.hypot(x - p.x, y - p.y) < catchR)) break;
  }
  return pts;
}

/** An SVG path through the points. */
export const pathOf = (pts: [number, number][]) =>
  pts.map(([x, y], i) => `${i ? 'L' : 'M'} ${x.toFixed(1)} ${y.toFixed(1)}`).join(' ');

/** A point partway along a line (`t` from 0 to 1) and the direction there, for its arrow. */
export function arrowAt(
  pts: [number, number][],
  t = 0.5,
): { x: number; y: number; angle: number } | undefined {
  if (pts.length < 3) return undefined;
  const i = Math.min(pts.length - 2, Math.max(1, Math.round((pts.length - 1) * t)));
  const [x0, y0] = pts[i - 1]!;
  const [x1, y1] = pts[i + 1]!;
  return { x: pts[i]![0], y: pts[i]![1], angle: (Math.atan2(y1 - y0, x1 - x0) * 180) / Math.PI };
}

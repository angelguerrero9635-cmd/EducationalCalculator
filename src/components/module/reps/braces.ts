/**
 * A curly brace from (x1, y1) to (x2, y2) as an SVG path, bulging `depth` px to the left of
 * the direction of travel (so left-to-right points up, top-to-bottom points right). Its tip is
 * at the middle. Drawn with a stroke and no fill.
 */
export function bracePath(x1: number, y1: number, x2: number, y2: number, depth = 8): string {
  const len = Math.hypot(x2 - x1, y2 - y1);
  if (len < 1) return `M ${x1} ${y1} L ${x2} ${y2}`;
  const ux = (x2 - x1) / len;
  const uy = (y2 - y1) / len;
  // Left of the direction of travel (screen coordinates, y down).
  const nx = uy;
  const ny = -ux;
  const s = depth * 0.55;
  const at = (t: number, d: number) =>
    `${(x1 + t * len * ux + d * nx).toFixed(2)} ${(y1 + t * len * uy + d * ny).toFixed(2)}`;
  // Each half: a curve out from the end to the shoulder, along it, then a curve to the tip.
  const k = Math.min(0.2, depth / len);
  return [
    `M ${at(0, 0)} Q ${at(0, s)} ${at(k, s)} L ${at(0.5 - k, s)} Q ${at(0.5, s)} ${at(0.5, depth)}`,
    `M ${at(1, 0)} Q ${at(1, s)} ${at(1 - k, s)} L ${at(0.5 + k, s)} Q ${at(0.5, s)} ${at(0.5, depth)}`,
  ].join(' ');
}

/** A square bracket from (x1, y1) to (x2, y2) with ends turned `depth` px to the right of travel. */
export function bracketPath(x1: number, y1: number, x2: number, y2: number, depth = 6): string {
  const len = Math.hypot(x2 - x1, y2 - y1) || 1;
  const nx = -(y2 - y1) / len;
  const ny = (x2 - x1) / len;
  return `M ${x1 + depth * nx} ${y1 + depth * ny} L ${x1} ${y1} L ${x2} ${y2} L ${x2 + depth * nx} ${y2 + depth * ny}`;
}

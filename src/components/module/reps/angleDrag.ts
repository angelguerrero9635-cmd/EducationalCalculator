/**
 * An angle dragged round a vertex that never jumps as the pointer passes the vertex (an angle's
 * middle ray, a point on a rose, a vector's tip, a turned image). Each pointer move turns the
 * angle by the change in the pointer's direction seen from the vertex; a move that comes within
 * `near` px of the vertex turns it only by its sideways part over `near`, so crossing the vertex
 * is a small turn, not 180° at once (the complementary angle went 32° → 1° in one step, the rose
 * 15° → 233°). Pure, so it is tested without a screen.
 */

/** Screen px from the vertex (y down). */
export interface Offset {
  x: number;
  y: number;
}

/** The distance from the vertex (the origin) to the segment p–q. */
function reach(p: Offset, q: Offset): number {
  const [dx, dy] = [q.x - p.x, q.y - p.y];
  const len2 = dx * dx + dy * dy;
  const t = len2 > 0 ? Math.max(0, Math.min(1, -(p.x * dx + p.y * dy) / len2)) : 0;
  return Math.hypot(p.x + t * dx, p.y + t * dy);
}

/**
 * A tracker for one drag: `start` is where the pointer went down (px from the vertex, y down)
 * and `angle` the value then (degrees, counterclockwise). The returned function takes the
 * pointer's offset from where it went down (DragHandle's dx, dy) and gives the angle, unwrapped
 * (it may pass 360° or go below 0°) and kept within [min, max] when they are given, so a
 * pointer that pushed past an end turns back at once.
 */
export function angleDrag(
  start: Offset,
  angle: number,
  opts: { near?: number; min?: number; max?: number } = {},
) {
  const near = opts.near ?? 40;
  let last = { ...start };
  let a = angle;
  return (dx: number, dy: number): number => {
    const p = { x: start.x + dx, y: start.y + dy };
    let turn: number;
    if (reach(last, p) >= near) {
      // y up for counterclockwise degrees.
      turn = Math.atan2(-p.y, p.x) - Math.atan2(-last.y, last.x);
      turn -= 2 * Math.PI * Math.round(turn / (2 * Math.PI));
    } else {
      // The sideways part of the move, over at least `near`: (last × move) ÷ r².
      const cross = last.x * -(p.y - last.y) - -last.y * (p.x - last.x);
      turn = cross / Math.max(near, Math.hypot(last.x, last.y)) ** 2;
    }
    a += (turn * 180) / Math.PI;
    if (opts.min !== undefined) a = Math.max(opts.min, a);
    if (opts.max !== undefined) a = Math.min(opts.max, a);
    last = p;
    return a;
  };
}

/** An angle in [0°, 360°). */
export const wrap360 = (deg: number) => ((deg % 360) + 360) % 360;

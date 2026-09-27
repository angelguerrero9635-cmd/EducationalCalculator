/**
 * Where a figure's corner goes under a translation, reflection, rotation or dilation. Shared
 * by the transformation picture and the harness, so both agree. Plain math, no drawing.
 */
import type { Mirror, TransformationSpec } from '@/data/modules/typesGraphs';

export type Pt = [number, number];

/** The move's numbers (shown units): a slide, a mirror, a turn in degrees, a scale factor. */
export interface MoveValues {
  right: number;
  up: number;
  mirror?: Mirror;
  /** The a in x = a (or b in y = b) for a mirror line that is a value. */
  line?: number;
  angle: number;
  factor: number;
  center: Pt;
}

const clean = (x: number) => Number(x.toFixed(9));

/** Where a point goes under the move (the picture and the harness agree on this). */
export function imageOf(p: Pt, move: TransformationSpec['move'], v: MoveValues): Pt {
  const [x, y] = p;
  const [cx, cy] = v.center;
  switch (move) {
    case 'translate':
      return [clean(x + v.right), clean(y + v.up)];
    case 'reflect': {
      const m = v.mirror;
      if (m === 'x-axis') return [x, clean(-y)];
      if (m === 'y-axis') return [clean(-x), y];
      if (m === 'y = x') return [y, x];
      if (m === 'y = −x') return [clean(-y), clean(-x)];
      if (m && typeof m === 'object' && 'x' in m) return [clean(2 * v.line! - x), y];
      return [x, clean(2 * v.line! - y)];
    }
    case 'rotate': {
      const t = (v.angle * Math.PI) / 180;
      // Quarter turns exactly (no 6.1e-17 from the cosine of 90°).
      const q = ((Math.round(v.angle / 90) % 4) + 4) % 4;
      const exact = Math.abs(v.angle / 90 - Math.round(v.angle / 90)) < 1e-9;
      const [cos, sin] = exact
        ? ([
            [1, 0],
            [0, 1],
            [-1, 0],
            [0, -1],
          ][q] as Pt)
        : [Math.cos(t), Math.sin(t)];
      const [dx, dy] = [x - cx, y - cy];
      return [clean(cx + dx * cos - dy * sin), clean(cy + dx * sin + dy * cos)];
    }
    case 'dilate':
      return [clean(cx + v.factor * (x - cx)), clean(cy + v.factor * (y - cy))];
  }
}

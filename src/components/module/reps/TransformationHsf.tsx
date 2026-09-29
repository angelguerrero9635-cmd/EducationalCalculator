/**
 * The Grades 9–12 parts of the transformation picture (H23): reading a second move's values,
 * and drawing a figure's lines of symmetry and its order of rotational symmetry.
 */
import { G, Circle, Line, Path } from 'react-native-svg';

import type { SecondMove } from '@/data/modules/typesHsf';
import { chart, usePalette } from '@/theme';

import type { MoveValues, Pt } from './transform';
import type { Symmetry } from './transformHsf';
import { arrowHead, Chip, coef, type reader } from './graphKit';

type Read = ReturnType<typeof reader>;

/** A second move's numbers, and whether every one is known. */
export function readMove(m: SecondMove, read: Read): { v: MoveValues; known: boolean } {
  const none = { value: 0, known: true };
  const center =
    (m.move === 'rotate' || m.move === 'dilate') && m.center
      ? [read(m.center[0]), read(m.center[1])]
      : [none, none];
  const right = m.move === 'translate' ? read(m.right) : none;
  const up = m.move === 'translate' ? read(m.up) : none;
  const mirror = m.move === 'reflect' ? m.mirror : undefined;
  const line =
    mirror && typeof mirror === 'object' ? read('x' in mirror ? mirror.x : mirror.y) : undefined;
  const angle = m.move === 'rotate' ? read(m.angle) : none;
  const factor = m.move === 'dilate' ? read(m.factor) : { value: 1, known: true };
  return {
    v: {
      right: right.value,
      up: up.value,
      mirror,
      line: line?.value,
      angle: angle.value,
      factor: factor.value,
      center: [center[0]!.value, center[1]!.value],
    },
    known: [right, up, angle, factor, ...center, line].every((r) => !r || r.known),
  };
}

/** "4 lines of symmetry. Rotational symmetry of order 4: turns of 90° carry it onto itself." */
export function symmetryText(s: Symmetry): string {
  const n = s.lines.length;
  const lines = n === 0 ? 'No line of symmetry.' : `${n} line${n === 1 ? '' : 's'} of symmetry.`;
  const turn =
    s.order === 1
      ? 'No rotational symmetry (order 1): only a full turn carries it onto itself.'
      : `Rotational symmetry of order ${s.order}: turns of ${coef(360 / s.order)}° about the center carry it onto itself.`;
  return `${lines} ${turn}`;
}

/**
 * The lines of symmetry (dashed, across the figure and a little past it) and, with turns, the
 * center with a turn arrow and "order n".
 */
export function SymmetryMarks({
  s,
  P,
  reach,
  box,
  w,
  h,
}: {
  s: Symmetry;
  /** Grid point to pixels. */
  P: (p: Pt) => readonly [number, number];
  /** How far each line runs from the center either way (grid units). */
  reach: number;
  /** The grid's window, [[x0, x1], [y0, y1]]: the lines stop at its edges. */
  box: [[number, number], [number, number]];
  w: number;
  h: number;
}) {
  const c = usePalette();
  const [cx, cy] = P(s.center);
  const r = 13;
  // The turn arrow: three quarters of a circle about the center, counterclockwise.
  const t1 = Math.PI / 4;
  const t2 = t1 + (3 * Math.PI) / 2;
  const at = (t: number) => [cx + r * Math.cos(t), cy - r * Math.sin(t)] as const;
  const [x1, y1] = at(t1);
  const [x2, y2] = at(t2);
  return (
    <G>
      {s.lines.map(([dx, dy], i) => {
        // Along the line from −reach to reach, cut where it leaves the window.
        let [lo, hi] = [-reach, reach];
        [dx, dy].forEach((d, k) => {
          if (Math.abs(d) < 1e-12) return;
          const [t1, t2] = box[k]!.map((e) => (e - s.center[k]!) / d) as [number, number];
          lo = Math.max(lo, Math.min(t1, t2));
          hi = Math.min(hi, Math.max(t1, t2));
        });
        const [ax, ay] = P([s.center[0] + dx * lo, s.center[1] + dy * lo]);
        const [bx, by] = P([s.center[0] + dx * hi, s.center[1] + dy * hi]);
        return (
          <Line
            key={`sym${i}`}
            x1={ax}
            y1={ay}
            x2={bx}
            y2={by}
            stroke={c.chartSecond}
            strokeWidth={chart.stroke + 0.5}
            strokeDasharray="8 5"
          />
        );
      })}
      {s.order > 1 ? (
        <G>
          <Path
            d={`M ${x1} ${y1} A ${r} ${r} 0 1 0 ${x2} ${y2}`}
            stroke={c.chartHighlight}
            strokeWidth={chart.stroke}
            fill="none"
          />
          <Path d={arrowHead(x2, y2, -Math.sin(t2), -Math.cos(t2), 7)} fill={c.chartHighlight} />
          <Chip x={cx} y={cy - r - 6} text={`order ${s.order}`} w={w} h={h} size={chart.label} />
        </G>
      ) : null}
      {s.order > 1 ? <Circle cx={cx} cy={cy} r={3.5} fill={c.chartHighlight} /> : null}
    </G>
  );
}

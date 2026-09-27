/**
 * The Pythagorean pieces two pictures share: the right triangle under a segment between two
 * grid points (legs across and up, their lengths, the right angle) and the words for a square
 * root ("√34 ≈ 5.83", or "5" when it comes out whole).
 */
import { G, Line, Path, Rect } from 'react-native-svg';

import { formatNumber } from '@/engine/format';
import { chart, usePalette } from '@/theme';

import { ChartText, fitLabel } from './common';

/** A number to two places at most: 5.8310 → "5.83". */
export const near = (x: number) => formatNumber(Number(x.toFixed(2)));

/** A square number's root: "5" when whole, else "√34 ≈ 5.83" (the square to two places). */
export function rootText(square: number): string {
  const r = Math.sqrt(square);
  if (Math.abs(r - Math.round(r)) < 1e-9) return formatNumber(Math.round(r));
  return `√${near(square)} ≈ ${near(r)}`;
}

/**
 * The legs of the right triangle from p to q on a grid: across from p to the corner (q.x, p.y),
 * then up or down to q, dashed, with a right-angle mark and each leg's length; the hypotenuse
 * gets `label` on the side away from the corner.
 */
export function DistanceLegs({
  p,
  q,
  sx,
  sy,
  w,
  label,
}: {
  p: { x: number; y: number };
  q: { x: number; y: number };
  sx: (x: number) => number;
  sy: (y: number) => number;
  w: number;
  label?: string;
}) {
  const c = usePalette();
  const dx = q.x - p.x;
  const dy = q.y - p.y;
  if (dx === 0 && dy === 0) return null;
  const [cx, cy] = [sx(q.x), sy(p.y)];
  // The right-angle mark: a small square in the corner, toward p and toward q.
  const k = 9;
  const ux = dx > 0 ? -k : k;
  const uy = dy > 0 ? -k : k;
  const across = formatNumber(Math.abs(dx));
  const up = formatNumber(Math.abs(dy));
  // The hypotenuse label sits off the segment, on the side away from the corner: at its
  // middle, or nearer an end when the middle would sit on an axis's numbers.
  // A segment straight across or up has no corner: its label goes above it or to its right.
  const nx = dy === 0 ? 0 : dx === 0 ? 1 : (sx(p.x) + sx(q.x)) / 2 - cx;
  const ny = dy === 0 ? -1 : dx === 0 ? 0 : (sy(p.y) + sy(q.y)) / 2 - cy;
  const nl = Math.hypot(nx, ny) || 1;
  const off = 16;
  const tw = (label?.length ?? 0) * chart.label * 0.58;
  const place = (t: number) => {
    const lx = sx(p.x) + t * (sx(q.x) - sx(p.x)) + (nx / nl) * off;
    const ly = sy(p.y) + t * (sy(q.y) - sy(p.y)) + (ny / nl) * off + 4;
    const anchor: 'start' | 'middle' | 'end' =
      dy === 0 ? 'middle' : dx === 0 ? 'start' : lx < cx ? 'end' : 'start';
    const at = fitLabel(lx, label ?? '', chart.label, w, anchor, 4);
    const left =
      at.textAnchor === 'start' ? at.x : at.textAnchor === 'end' ? at.x - tw : at.x - tw / 2;
    return { at, ly, left };
  };
  // The axes' numbers sit just left of the y-axis and just under the x-axis.
  const [ax, ay] = [sx(0), sy(0)];
  const clear = ({ ly, left }: ReturnType<typeof place>) =>
    (left > ax + 2 || left + tw < ax - 26) && (ly - 12 > ay + 17 || ly + 2 < ay);
  const spot = [0.5, 0.35, 0.65, 0.25, 0.75].map(place).find(clear) ?? place(0.5);
  return (
    <G>
      {dx !== 0 && dy !== 0 ? (
        <>
          <Path
            d={`M ${sx(p.x)} ${sy(p.y)} L ${cx} ${cy} L ${sx(q.x)} ${sy(q.y)}`}
            stroke={c.chartSecond}
            strokeWidth={chart.strokeHeavy}
            strokeDasharray={chart.dash}
            fill="none"
          />
          <Path
            d={`M ${cx + ux} ${cy} L ${cx + ux} ${cy + uy} L ${cx} ${cy + uy}`}
            stroke={c.chartInk}
            strokeWidth={chart.strokeLight}
            fill="none"
          />
          <ChartText
            {...fitLabel((sx(p.x) + cx) / 2, `${across} across`, chart.small, w)}
            y={cy + (dy > 0 ? 15 : -7)}
            fontSize={chart.small}
            fontWeight="700"
          >
            {`${across} across`}
          </ChartText>
          <ChartText
            {...fitLabel(
              cx + (dx > 0 ? 7 : -7),
              `${up} ${dy > 0 ? 'up' : 'down'}`,
              chart.small,
              w,
              dx > 0 ? 'start' : 'end',
              7,
            )}
            y={(cy + sy(q.y)) / 2 + 4}
            fontSize={chart.small}
            fontWeight="700"
          >
            {`${up} ${dy > 0 ? 'up' : 'down'}`}
          </ChartText>
        </>
      ) : null}
      <Line
        x1={sx(p.x)}
        y1={sy(p.y)}
        x2={sx(q.x)}
        y2={sy(q.y)}
        stroke={c.chartHighlight}
        strokeWidth={chart.strokeHeavy}
      />
      {label ? (
        <>
          <Rect
            x={spot.left - 3}
            y={spot.ly - 12}
            width={tw + 6}
            height={16}
            rx={4}
            fill={c.card}
            opacity={0.85}
          />
          <ChartText
            {...spot.at}
            y={spot.ly}
            fontSize={chart.label}
            fontWeight="700"
            fill={c.chartHighlight}
          >
            {label}
          </ChartText>
        </>
      ) : null}
    </G>
  );
}

/**
 * The caption for a distance on the grid: the legs, then d² = a² + b² with the numbers, then
 * the root. `d` is the distance's symbol.
 */
export function distanceCaption(
  p: { x: number; y: number },
  q: { x: number; y: number },
  d: string,
  unit = 'units',
): string {
  const a = Math.abs(q.x - p.x);
  const b = Math.abs(q.y - p.y);
  const from = `From (${formatNumber(p.x)}, ${formatNumber(p.y)}) to (${formatNumber(q.x)}, ${formatNumber(q.y)})`;
  if (a === 0 || b === 0)
    return `${from}: ${formatNumber(a + b)} ${unit}, straight ${a === 0 ? 'up or down' : 'across'}.`;
  const sq = a * a + b * b;
  return (
    `${from}: legs ${formatNumber(a)} across and ${formatNumber(b)} ${q.y > p.y ? 'up' : 'down'}. · ` +
    `${d}² = ${formatNumber(a)}² + ${formatNumber(b)}² = ${near(a * a)} + ${near(b * b)} = ${near(sq)} · ` +
    `${d} = ${rootText(sq)} ${unit}`
  );
}

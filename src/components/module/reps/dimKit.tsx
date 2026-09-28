/**
 * Flat drafting marks for measured shapes (round 4, group E): dimension lines with end ticks,
 * label pills that read over grid lines, and square-corner marks. Abstract diagrams only.
 */
import { G, Line, Path, Rect } from 'react-native-svg';

import { chart, usePalette } from '@/theme';

import { ChartText } from './common';

/** Estimated width of a label (the same estimate `fitLabel` uses). */
export const textW = (text: string, size: number = chart.value) => text.length * size * 0.58;

/** A pill's size for a label: the text plus padding. */
export const pillSize = (text: string, size: number = chart.value) => ({
  w: textW(text, size) + 12,
  h: size + 9,
});

/**
 * A label on a rounded pill centred on (x, y), so it reads over grid lines and fills.
 * `x` is clamped so the pill stays inside `[0, w]` when `w` is given.
 */
export function Pill({
  x,
  y,
  text,
  size = chart.value,
  color,
  fill,
  stroke,
  w,
  bold = true,
}: {
  x: number;
  y: number;
  text: string;
  size?: number;
  color?: string;
  fill?: string;
  stroke?: string;
  w?: number;
  bold?: boolean;
}) {
  const c = usePalette();
  const p = pillSize(text, size);
  const cx = w === undefined ? x : Math.min(w - p.w / 2 - 2, Math.max(p.w / 2 + 2, x));
  return (
    <G>
      <Rect
        x={cx - p.w / 2}
        y={y - p.h / 2}
        width={p.w}
        height={p.h}
        rx={p.h / 2}
        fill={fill ?? c.card}
        stroke={stroke ?? c.chartGrid}
        strokeWidth={1}
      />
      <ChartText
        x={cx}
        y={y + size * 0.36}
        textAnchor="middle"
        fontSize={size}
        fontWeight={bold ? '700' : '400'}
        fill={color ?? c.chartInk}
      >
        {text}
      </ChartText>
    </G>
  );
}

/**
 * A dimension line from (x1, y1) to (x2, y2) (horizontal or vertical) with end ticks, and its
 * label beside the middle on `side`. `w` keeps a horizontal line's label inside the canvas.
 */
export function DimLine({
  x1,
  y1,
  x2,
  y2,
  label,
  side,
  color,
  w,
  size = chart.value,
}: {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  label?: string;
  side: 'above' | 'below' | 'left' | 'right';
  color?: string;
  w?: number;
  size?: number;
}) {
  const c = usePalette();
  const ink = color ?? c.chartInk;
  const vertical = Math.abs(x2 - x1) < Math.abs(y2 - y1);
  const t = 5; // half a tick
  const ticks = vertical
    ? `M ${x1 - t} ${y1} h ${2 * t} M ${x2 - t} ${y2} h ${2 * t}`
    : `M ${x1} ${y1 - t} v ${2 * t} M ${x2} ${y2 - t} v ${2 * t}`;
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2;
  let tx = mx;
  let ty = my;
  let anchor: 'start' | 'middle' | 'end' = 'middle';
  if (side === 'below') ty = my + size + 6;
  else if (side === 'above') ty = my - 8;
  else if (side === 'left') {
    tx = mx - 8;
    ty = my + size * 0.36;
    anchor = 'end';
  } else {
    tx = mx + 8;
    ty = my + size * 0.36;
    anchor = 'start';
  }
  if (w !== undefined && anchor === 'middle') {
    const half = textW(label ?? '', size) / 2 + 2;
    tx = Math.min(w - half, Math.max(half, tx));
  }
  return (
    <G>
      <Line x1={x1} y1={y1} x2={x2} y2={y2} stroke={ink} strokeWidth={chart.strokeLight} />
      <Path d={ticks} stroke={ink} strokeWidth={chart.strokeLight} />
      {label ? (
        <ChartText x={tx} y={ty} textAnchor={anchor} fontSize={size} fontWeight="700" fill={ink}>
          {label}
        </ChartText>
      ) : null}
    </G>
  );
}

/** A square-corner mark `size` px, at the corner (x, y), opening towards (dx, dy) (each ±1). */
export function RightAngle({
  x,
  y,
  dx,
  dy,
  size = 10,
  color,
}: {
  x: number;
  y: number;
  dx: number;
  dy: number;
  size?: number;
  color?: string;
}) {
  const c = usePalette();
  return (
    <Path
      d={`M ${x + dx * size} ${y} L ${x + dx * size} ${y + dy * size} L ${x} ${y + dy * size}`}
      stroke={color ?? c.chartInk}
      strokeWidth={chart.strokeLight}
      fill="none"
    />
  );
}

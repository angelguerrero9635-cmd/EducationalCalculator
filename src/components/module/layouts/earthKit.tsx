/**
 * A small kit for the Grade 6 earth and body figures (round 4, group C): a fixed board scaled
 * to the canvas, curved arrows, label chips and text with a halo, so labels stay readable on a
 * painted landscape or a cross-section.
 */
import type { ReactNode } from 'react';
import Svg, { G, Path, Rect } from 'react-native-svg';

import { chart, type Palette } from '@/theme';

import { Canvas, ChartText } from '../reps/common';

/** The board every figure in this kit is drawn on: this wide, scaled to the canvas. */
export const BOARD_W = 360;

/** Text width estimate at a font size (as `fitLabel` does; bold runs a little wider). */
export const textW = (s: string, size: number, bold = false) =>
  s.length * size * (bold ? 0.62 : 0.58);

/** A board `BOARD_W` wide and `height` tall, scaled to fit the canvas width. */
export function Board({ height, children }: { height: number; children: ReactNode }) {
  return (
    <Canvas aspect={height / BOARD_W}>
      {({ w, h }) => (
        <Svg width={w} height={h}>
          <G transform={`scale(${w / BOARD_W})`}>{children}</G>
        </Svg>
      )}
    </Canvas>
  );
}

/** The control point of a curve from `a` to `b` bowed `bend` px to the left of travel. */
export function bendPoint(a: [number, number], b: [number, number], bend: number) {
  const [mx, my] = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
  const len = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
  return [mx + (bend * (b[1] - a[1])) / len, my - (bend * (b[0] - a[0])) / len] as const;
}

/**
 * A curved arrow from `a` to `b`. `on`: heavy, in the highlight, over a soft halo so it reads on
 * a painted scene; off: thin and faint, so the rest of a cycle stays in view without noise.
 */
export function CurveArrow({
  a,
  b,
  bend = 0,
  on = true,
  c,
  color,
  width,
  halo = true,
  faint = 0.28,
}: {
  a: [number, number];
  b: [number, number];
  bend?: number;
  on?: boolean;
  c: Palette;
  color?: string;
  width?: number;
  halo?: boolean;
  faint?: number;
}) {
  const q = bendPoint(a, b, bend);
  const t = Math.atan2(b[1] - q[1], b[0] - q[0]);
  const sw = width ?? (on ? chart.strokeHeavy : chart.strokeLight);
  const head = on ? 6 + sw * 2 : 7;
  const hx = (d: number) => b[0] - head * Math.cos(t + d);
  const hy = (d: number) => b[1] - head * Math.sin(t + d);
  const stroke = color ?? (on ? c.chartHighlight : c.chartInk);
  const line = `M ${a[0]} ${a[1]} Q ${q[0]} ${q[1]} ${b[0]} ${b[1]}`;
  const tip = `M ${hx(0.45)} ${hy(0.45)} L ${b[0]} ${b[1]} L ${hx(-0.45)} ${hy(-0.45)}`;
  const draw = (s: string, wd: number, op = 1) => (
    <>
      <Path
        d={line}
        stroke={s}
        strokeWidth={wd}
        strokeOpacity={op}
        strokeLinecap="round"
        fill="none"
      />
      <Path
        d={tip}
        stroke={s}
        strokeWidth={wd}
        strokeOpacity={op}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </>
  );
  return (
    <G opacity={on ? 1 : faint}>
      {on && halo ? draw(c.card, sw + 4, 0.75) : null}
      {draw(stroke, sw)}
    </G>
  );
}

/**
 * Text with a halo in the card color behind it, so it reads over lines and paint. `size` at
 * least `chart.label`.
 */
export function HaloText({
  x,
  y,
  text,
  c,
  size = chart.value,
  bold = false,
  anchor = 'middle',
  fill,
  halo,
}: {
  x: number;
  y: number;
  text: string;
  c: Palette;
  size?: number;
  bold?: boolean;
  anchor?: 'start' | 'middle' | 'end';
  fill?: string;
  halo?: string;
}) {
  const tw = textW(text, size, bold);
  const x0 = anchor === 'middle' ? x - tw / 2 : anchor === 'end' ? x - tw : x;
  return (
    <G>
      <Rect
        x={x0 - 4}
        y={y - size * 0.95}
        width={tw + 8}
        height={size * 1.35}
        rx={size * 0.45}
        fill={halo ?? c.card}
        opacity={0.8}
      />
      <ChartText
        x={x}
        y={y}
        fontSize={size}
        fontWeight={bold ? '700' : '500'}
        textAnchor={anchor}
        fill={fill ?? c.chartInk}
      >
        {text}
      </ChartText>
    </G>
  );
}

/**
 * A rounded label chip centred at (x, y). `lit`: highlight fill with light text (the step a
 * scene is about); otherwise a card-colored chip with an ink outline.
 */
export function Chip({
  x,
  y,
  text,
  c,
  lit = false,
  size = chart.value,
  color,
}: {
  x: number;
  y: number;
  text: string;
  c: Palette;
  lit?: boolean;
  size?: number;
  /** A swatch color: a dot at the chip's left (a key to an organ or a rock). */
  color?: string;
}) {
  const tw = textW(text, size, lit);
  const dot = color ? 12 : 0;
  const cw = tw + 16 + dot;
  const ch = size + 10;
  const x0 = x - cw / 2;
  return (
    <G>
      <Rect
        x={x0}
        y={y - ch / 2}
        width={cw}
        height={ch}
        rx={ch / 2}
        fill={lit ? c.chartHighlight : c.card}
        stroke={lit ? c.chartHighlight : c.chartGrid}
        strokeWidth={1.5}
      />
      {color ? (
        <Rect
          x={x0 + 8}
          y={y - 4}
          width={8}
          height={8}
          rx={4}
          fill={color}
          stroke={lit ? c.onChartHighlight : c.chartInk}
          strokeWidth={1}
        />
      ) : null}
      <ChartText
        x={x0 + 8 + dot + tw / 2}
        y={y + size * 0.36}
        fontSize={size}
        fontWeight={lit ? '700' : '500'}
        textAnchor="middle"
        fill={lit ? c.onChartHighlight : c.chartInk}
      >
        {text}
      </ChartText>
    </G>
  );
}

/** Width of a `Chip` for `text` (to place chips side by side or keep them in the board). */
export const chipW = (text: string, size: number = chart.value, lit = false, dot = false) =>
  textW(text, size, lit) + 16 + (dot ? 12 : 0);

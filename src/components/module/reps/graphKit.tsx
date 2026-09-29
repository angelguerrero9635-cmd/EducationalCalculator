/**
 * Shared pieces for the Grade 8 graphs (lines, systems, mappings, transformations): a grid
 * frame with its scales, the grid and numbered axes, labels on a card-colored chip so they
 * read over grid lines, and the text of y = mx + b. Flat and exact: no shading.
 */
import { G, Line, Path, Rect } from 'react-native-svg';

import { formatNumber } from '@/engine/format';
import { chart, usePalette } from '@/theme';

import { toFraction } from './exact';
import { ChartText, fitLabel, niceCeil, type useRep } from './common';

type Rep = ReturnType<typeof useRep>;

/** A fixed number or a variable's value (shown units), and whether it is known. */
export function reader(rep: Rep) {
  return (v: number | string) =>
    typeof v === 'number'
      ? { value: v, known: true, text: formatNumber(v) }
      : { value: rep.shown(v), known: rep.known(v), text: rep.value(v, false) };
}

/** Grid spacing: every 1 up to 20 across, then 2, 5, 10, … */
export const gridStep = (range: number) =>
  range <= 20 ? 1 : range <= 40 ? 2 : range <= 100 ? 5 : niceCeil(range / 20);

/** The x- and y-extents of a spec's `extent` (a number is both). */
export const extents = (e: number | { x: number; y: number } | undefined) =>
  e === undefined ? { x: 10, y: 10 } : typeof e === 'number' ? { x: e, y: e } : e;

/** Grows an extent to a round size that keeps every value in view. */
export const fitExtent = (base: number, values: number[]) => {
  const big = Math.max(0, ...values.filter(Number.isFinite).map(Math.abs));
  return big > base ? niceCeil(big * 1.05) : base;
};

export interface Frame {
  sx: (x: number) => number;
  sy: (y: number) => number;
  /** Pixels per unit across and up. */
  ux: number;
  uy: number;
  x: [number, number];
  y: [number, number];
  w: number;
  h: number;
}

/**
 * Scales for a grid over x × y inside a w × h canvas. `square` keeps a unit the same size
 * both ways (centered); otherwise each axis fills its side. Room is left for the numbers and,
 * with `named`, for the axis names.
 */
export function makeFrame(
  w: number,
  h: number,
  x: [number, number],
  y: [number, number],
  square: boolean,
  named = false,
): Frame {
  const [L, R, T, B] = named ? [40, 14, 26, 34] : [26, 18, 22, 24];
  let ux = (w - L - R) / (x[1] - x[0]);
  let uy = (h - T - B) / (y[1] - y[0]);
  if (square) ux = uy = Math.min(ux, uy);
  const left = L + (w - L - R - ux * (x[1] - x[0])) / 2;
  const top = T + (h - T - B - uy * (y[1] - y[0])) / 2;
  return {
    sx: (v) => left + (v - x[0]) * ux,
    sy: (v) => top + (y[1] - v) * uy,
    ux,
    uy,
    x,
    y,
    w,
    h,
  };
}

const steps = (lo: number, hi: number, step: number) => {
  const out: number[] = [];
  for (let v = Math.ceil(lo / step - 1e-9) * step; v <= hi + 1e-9; v += step) {
    out.push(Number(v.toFixed(6)));
  }
  return out;
};

/** The grid lines, the two axes with their numbers, and the axis names (or x and y). */
export function GridAxes({ f, names }: { f: Frame; names?: { x?: string; y?: string } }) {
  const c = usePalette();
  const xs = gridStep(f.x[1] - f.x[0]);
  const ys = gridStep(f.y[1] - f.y[0]);
  // A tight grid numbers every other line.
  const xEvery = xs * f.ux < 22 ? 2 : 1;
  const yEvery = ys * f.uy < 16 ? 2 : 1;
  const ax = f.sx(Math.min(f.x[1], Math.max(f.x[0], 0)));
  const ay = f.sy(Math.min(f.y[1], Math.max(f.y[0], 0)));
  const xName = names?.x ?? 'x';
  const yName = names?.y ?? 'y';
  return (
    <G>
      {steps(f.x[0], f.x[1], xs).map((v) => (
        <Line
          key={`gx${v}`}
          x1={f.sx(v)}
          y1={f.sy(f.y[0])}
          x2={f.sx(v)}
          y2={f.sy(f.y[1])}
          stroke={c.chartGrid}
          strokeWidth={chart.strokeLight / 1.5}
        />
      ))}
      {steps(f.y[0], f.y[1], ys).map((v) => (
        <Line
          key={`gy${v}`}
          x1={f.sx(f.x[0])}
          y1={f.sy(v)}
          x2={f.sx(f.x[1])}
          y2={f.sy(v)}
          stroke={c.chartGrid}
          strokeWidth={chart.strokeLight / 1.5}
        />
      ))}
      <Line
        x1={f.sx(f.x[0])}
        y1={ay}
        x2={f.sx(f.x[1])}
        y2={ay}
        stroke={c.chartInk}
        strokeWidth={chart.strokeLight}
      />
      <Line
        x1={ax}
        y1={f.sy(f.y[0])}
        x2={ax}
        y2={f.sy(f.y[1])}
        stroke={c.chartInk}
        strokeWidth={chart.strokeLight}
      />
      {steps(f.x[0], f.x[1], xs)
        .filter((v) => v !== 0 && Math.round(v / xs) % xEvery === 0)
        .map((v) => (
          <ChartText
            key={`nx${v}`}
            x={f.sx(v)}
            y={ay + 12}
            fontSize={chart.tiny}
            fill={c.chartMuted}
            textAnchor="middle"
          >
            {formatNumber(v)}
          </ChartText>
        ))}
      {steps(f.y[0], f.y[1], ys)
        .filter((v) => v !== 0 && Math.round(v / ys) % yEvery === 0)
        .map((v) => (
          <ChartText
            key={`ny${v}`}
            x={ax - 4}
            y={f.sy(v) + 3}
            fontSize={chart.tiny}
            fill={c.chartMuted}
            textAnchor="end"
          >
            {formatNumber(v)}
          </ChartText>
        ))}
      {f.x[0] >= 0 && f.y[0] >= 0 ? (
        <ChartText
          x={ax - 4}
          y={ay + 12}
          fontSize={chart.tiny}
          fill={c.chartMuted}
          textAnchor="end"
        >
          0
        </ChartText>
      ) : null}
      {names?.x ? (
        <ChartText
          x={f.sx(f.x[1])}
          y={ay + 26}
          fontSize={chart.small}
          fontWeight="700"
          textAnchor="end"
        >
          {xName}
        </ChartText>
      ) : (
        <ChartText x={f.sx(f.x[1]) + 5} y={ay + 4} fontSize={chart.label} fontWeight="700">
          x
        </ChartText>
      )}
      {names?.y ? (
        <ChartText
          {...fitLabel(ax - 30, yName, chart.small, f.w, 'start')}
          y={f.sy(f.y[1]) - 10}
          fontSize={chart.small}
          fontWeight="700"
        >
          {yName}
        </ChartText>
      ) : (
        <ChartText x={ax + 5} y={f.sy(f.y[1]) - 6} fontSize={chart.label} fontWeight="700">
          y
        </ChartText>
      )}
    </G>
  );
}

/**
 * A label on a small chip of the card color, so it reads over grid lines. Kept inside the
 * canvas (`fitLabel`) and above/below the canvas edges.
 */
export function Chip({
  x,
  y,
  text,
  w,
  h,
  anchor = 'middle',
  color,
  size = chart.small,
  bold = true,
}: {
  x: number;
  y: number;
  text: string;
  /** Canvas size. */
  w: number;
  h: number;
  anchor?: 'start' | 'middle' | 'end';
  color?: string;
  size?: number;
  bold?: boolean;
}) {
  const c = usePalette();
  const fit = fitLabel(x, text, size, w, anchor, 0);
  // The start/end flip of fitLabel needs a gap; a chip slides in from the edge instead.
  const tw = text.length * size * 0.58 + 6;
  let left =
    fit.textAnchor === 'start'
      ? fit.x - 3
      : fit.textAnchor === 'end'
        ? fit.x - tw + 3
        : fit.x - tw / 2;
  left = Math.min(w - tw - 1, Math.max(1, left));
  const top = Math.min(h - size - 5, Math.max(1, y - size + 1));
  return (
    <G>
      <Rect x={left} y={top} width={tw} height={size + 4} rx={3} fill={c.card} opacity={0.88} />
      <ChartText
        x={left + tw / 2}
        y={top + size}
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

/** Where y = mx + b enters and leaves the frame, or undefined when it misses it. */
export function clipLine(m: number, b: number, f: Frame) {
  const [x0, x1] = f.x;
  const [y0, y1] = f.y;
  if (m === 0) return b >= y0 - 1e-9 && b <= y1 + 1e-9 ? { a: [x0, b], b: [x1, b] } : undefined;
  let lo = x0;
  let hi = x1;
  const xa = (y0 - b) / m;
  const xb = (y1 - b) / m;
  lo = Math.max(lo, Math.min(xa, xb));
  hi = Math.min(hi, Math.max(xa, xb));
  if (hi < lo) return undefined;
  return { a: [lo, m * lo + b] as const, b: [hi, m * hi + b] as const };
}

/** A filled arrowhead at (x, y) pointing along (dx, dy). */
export function arrowHead(x: number, y: number, dx: number, dy: number, size = 8) {
  const len = Math.hypot(dx, dy) || 1;
  const [ux, uy] = [dx / len, dy / len];
  const bx = x - ux * size;
  const by = y - uy * size;
  const px = -uy * size * 0.55;
  const py = ux * size * 0.55;
  return `M ${x} ${y} L ${bx + px} ${by + py} L ${bx - px} ${by - py} Z`;
}

export function Arrow({
  x1,
  y1,
  x2,
  y2,
  color,
  width = chart.stroke,
  dash,
}: {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  color: string;
  width?: number;
  dash?: string;
}) {
  const len = Math.hypot(x2 - x1, y2 - y1) || 1;
  const ex = x2 - ((x2 - x1) / len) * 6;
  const ey = y2 - ((y2 - y1) / len) * 6;
  return (
    <G>
      <Line
        x1={x1}
        y1={y1}
        x2={ex}
        y2={ey}
        stroke={color}
        strokeWidth={width}
        strokeDasharray={dash}
      />
      <Path d={arrowHead(x2, y2, x2 - x1, y2 - y1)} fill={color} />
    </G>
  );
}

/**
 * A number the way it is written in an equation: 2/3 as a fraction, others as decimals. A
 * rate like 24.5 stays a decimal (49/2 reads as nothing a student typed).
 */
export function coef(x: number): string {
  const f = toFraction(x, 12);
  const cents = Math.abs(x * 100 - Math.round(x * 100)) < 1e-9;
  if (f && f[1] !== 1 && !(Math.abs(f[0]) > 12 && cents))
    return `${f[0] < 0 ? '−' : ''}${Math.abs(f[0])}/${f[1]}`;
  return formatNumber(x);
}

/**
 * "y = 2x + 3", "y = −x", "y = (2/3)x − 1", "y = 4": the equation of a line from its slope
 * and intercept texts ("?" stays in place).
 */
export function lineEquation(
  m: { value: number; known: boolean },
  b: { value: number; known: boolean },
  x = 'x',
  y = 'y',
): string {
  const mText = !m.known
    ? '?'
    : m.value === 1
      ? ''
      : m.value === -1
        ? '−'
        : coef(m.value).includes('/')
          ? `(${coef(m.value)})`
          : coef(m.value);
  const term = m.known && m.value === 0 ? '' : `${mText}${x}`;
  const bText = !b.known ? '?' : coef(Math.abs(b.value));
  if (!term) return `${y} = ${b.known ? coef(b.value) : '?'}`;
  if (b.known && b.value === 0) return `${y} = ${term}`;
  return `${y} = ${term} ${b.known && b.value < 0 ? '−' : '+'} ${bText}`;
}

/** A point as text: "(3, −2)". */
export const pointText = (x: number, y: number) => `(${coef(x)},\u00a0${coef(y)})`;

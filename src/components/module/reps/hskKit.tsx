/**
 * Shared pieces for the Grades 9–12 physics pictures of group HK: numbers to a few
 * significant figures, a value reader for number-or-variable fields, a labelled force arrow and
 * a window along one axis that starts at 0. Flat.
 */
import { G, Line, Path, Rect, TSpan } from 'react-native-svg';

import { formatNumber } from '@/engine/format';
import { chart, usePalette } from '@/theme';

import { ChartText, type useRep } from './common';
import { arrowHead } from './graphKit';
import { niceStep } from './hsdGrid';

type Rep = ReturnType<typeof useRep>;

/** A number to `digits` significant figures, as the app writes numbers (−, 3 × 10⁸). */
export const sig = (x: number, digits = 3): string =>
  !Number.isFinite(x) ? '?' : formatNumber(Number(x.toPrecision(digits)) || 0);

/** A number in scientific notation to `digits` significant figures: 6 × 10¹⁴. */
export const sci = (x: number, digits = 3): string =>
  !Number.isFinite(x)
    ? '?'
    : formatNumber(Number(x.toPrecision(digits)) || 0, { scientific: true });

/** A number with its unit after a space ("12 m", "−9.8 m/s²"); ° goes straight after. */
export const withUnit = (text: string, unit?: string) =>
  !unit ? text : unit === '°' ? `${text}°` : `${text} ${unit}`;

/** A fixed number or a variable (its shown value), with whether it is known and its text. */
export function numOrVar(rep: Rep, x: number | string | undefined, fallback = 0) {
  if (x === undefined)
    return {
      value: fallback,
      known: true,
      text: sig(fallback),
      id: undefined as string | undefined,
    };
  if (typeof x === 'number') return { value: x, known: true, text: sig(x), id: undefined };
  return { value: rep.shown(x), known: rep.known(x), text: rep.value(x), id: x };
}

/** A window [0, hi] holding `x` with room, in nice steps (1, 2 or 5 × 10ⁿ), about `ticks` of them. */
export function zeroWindow(x: number, ticks = 6, pad = 0.08) {
  const hi0 = Math.max(1e-9, x) * (1 + pad);
  const step = niceStep(hi0 / ticks);
  return { lo: 0, hi: Math.ceil(hi0 / step - 1e-9) * step, step };
}

/** A window [lo, hi] holding every value (and 0), in nice steps, about `ticks` of them. */
export function spanWindow(values: number[], ticks = 6, pad = 0.1) {
  const xs = values.filter(Number.isFinite);
  let lo = Math.min(0, ...xs);
  let hi = Math.max(0, ...xs);
  if (hi - lo < 1e-9) hi = lo + 1;
  const span = hi - lo;
  if (lo < 0) lo -= span * pad;
  if (hi > 0) hi += span * pad;
  const step = niceStep((hi - lo) / ticks);
  return { lo: Math.floor(lo / step + 1e-9) * step, hi: Math.ceil(hi / step - 1e-9) * step, step };
}

/** An arrow from (x1, y1) to (x2, y2) with a filled head; nothing when it is shorter than 2 px. */
export function Vec({
  x1,
  y1,
  x2,
  y2,
  color,
  width = chart.strokeHeavy,
  dash,
  head = 10,
  opacity = 1,
}: {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  color: string;
  width?: number;
  dash?: string;
  head?: number;
  opacity?: number;
}) {
  const len = Math.hypot(x2 - x1, y2 - y1);
  if (len < 2) return null;
  const k = Math.min(head, len * 0.6);
  const ex = x2 - ((x2 - x1) / len) * k * 0.8;
  const ey = y2 - ((y2 - y1) / len) * k * 0.8;
  return (
    <G opacity={opacity}>
      <Line
        x1={x1}
        y1={y1}
        x2={ex}
        y2={ey}
        stroke={color}
        strokeWidth={width}
        strokeDasharray={dash}
        strokeLinecap="round"
      />
      <Path d={arrowHead(x2, y2, x2 - x1, y2 - y1, k)} fill={color} />
    </G>
  );
}

/** Degrees to radians. */
export const RAD = Math.PI / 180;

/**
 * A label whose `_x` parts are subscripts ("v_y = 10 m/s", "F_N"), the first letter of a
 * symbol in italics, on an optional chip of the card color. `x` is the anchor, `y` the baseline.
 */
export function SubLabel({
  x,
  y,
  text,
  color,
  size = chart.label,
  anchor = 'middle',
  chip = true,
  bold = true,
  w,
}: {
  x: number;
  y: number;
  text: string;
  color?: string;
  size?: number;
  anchor?: 'start' | 'middle' | 'end';
  chip?: boolean;
  bold?: boolean;
  /** Canvas width: the label is slid inside it. */
  w?: number;
}) {
  const c = usePalette();
  const segs = text.split(/(_[A-Za-z0-9]+)/).filter(Boolean);
  const width = segs.reduce(
    (n, sg) => n + (sg.startsWith('_') ? (sg.length - 1) * 0.78 : sg.length) * size * 0.58,
    0,
  );
  let left = anchor === 'start' ? x : anchor === 'end' ? x - width : x - width / 2;
  if (w !== undefined) left = Math.min(w - width - 4, Math.max(4, left));
  const drop = size * 0.3;
  return (
    <G>
      {chip ? (
        <Rect
          x={left - 3}
          y={y - size + 1}
          width={width + 6}
          height={size + 6}
          rx={3}
          fill={c.card}
          opacity={0.88}
        />
      ) : null}
      <ChartText
        x={left}
        y={y}
        fontSize={size}
        fontWeight={bold ? '700' : '400'}
        fill={color ?? c.chartInk}
      >
        {segs.map((sg, i) => {
          const sub = sg.startsWith('_');
          const prevSub = i > 0 && segs[i - 1]!.startsWith('_');
          return (
            <TSpan
              key={i}
              dy={sub ? drop : prevSub ? -drop : 0}
              fontSize={sub ? size * 0.78 : size}
            >
              {sub ? sg.slice(1) : sg}
            </TSpan>
          );
        })}
      </ChartText>
    </G>
  );
}

/** A subscript written for plain text (captions): "v_y" stays, "v_x" becomes "vₓ". */
export const plainSub = (text: string) =>
  text.replace(/_x\b/g, 'ₓ').replace(/_0\b/g, '₀').replace(/_1\b/g, '₁').replace(/_2\b/g, '₂');

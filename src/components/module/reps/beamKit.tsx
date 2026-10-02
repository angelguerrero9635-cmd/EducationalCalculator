/**
 * Shared pieces of the `beam` picture (HC1): a value reader in formula units, labels in college
 * notation (the symbol italic, subscripts lowered, units after a space), supports (pin, roller,
 * wall), hatched ground, dimension lines and the painted beam itself (steel, concrete with
 * aggregate, wood, aluminum).
 */
import { Fragment } from 'react';
import {
  Circle,
  G,
  Line,
  LinearGradient,
  Path,
  Polygon,
  Rect,
  Stop,
  TSpan,
} from 'react-native-svg';

import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { ChartText, useRep } from './common';
import { num } from './CircularSatellite';
import { arrowHead } from './graphKit';

type X = number | string | undefined;

/**
 * Reads number-or-variable fields in formula units (`v`), whether each is known (a fixed
 * number always is), and labels: `text(x, value, unit)` is the page's value as shown, or the
 * number worked out here with `unit`.
 */
export function useBeamReader(calc: Calculator) {
  const rep = useRep(calc);
  const v = (x: X, fallback = 0) =>
    x === undefined ? fallback : typeof x === 'number' ? x : rep.val(x);
  const known = (x: X) => typeof x !== 'string' || rep.known(x);
  const text = (x: X, value: number, unit = '') =>
    typeof x === 'string' ? rep.value(x) : `${num(value)}${unit ? ` ${unit}` : ''}`;
  const symbol = (x: X, fallback: string) =>
    typeof x === 'string' ? rep.variable(x).symbol : fallback;
  /** "R_A = 25 kN": the page's symbol and value, or `fallback` and the number worked out. */
  const named = (x: X, fallback: string, value: number, unit = '') =>
    `${symbol(x, fallback)} = ${text(x, value, unit)}`;
  const unit = (x: X, fallback: string) =>
    typeof x === 'string' ? (rep.unit(x) ?? rep.variable(x).unit ?? fallback) : fallback;
  return { rep, v, known, all: (...xs: X[]) => xs.every(known), text, symbol, named, unit };
}

export type BeamReader = ReturnType<typeof useBeamReader>;

/** Characters that are letters of a symbol (Latin or Greek), drawn italic. */
const LETTER = /[A-Za-zα-ωΑ-Ω]/;

/**
 * A label in college notation: the symbol before " = " in italics (subscripts lowered and
 * upright: R_A, M_max, P_cr), the value and unit upright. On a chip of the card colour, kept
 * inside a canvas `w` wide. `x` is the anchor, `y` the baseline.
 */
export function HeLabel({
  x,
  y,
  text,
  color,
  size = chart.label,
  anchor = 'middle',
  chip = true,
  w,
}: {
  x: number;
  y: number;
  text: string;
  color?: string;
  size?: number;
  anchor?: 'start' | 'middle' | 'end';
  chip?: boolean;
  w?: number;
}) {
  const c = usePalette();
  const cut = text.indexOf(' = ');
  // A bare symbol with a subscript ("δ_max") is all head, so its subscript is typeset too.
  const bare = cut < 0 && /^\S+_\S+$/.test(text);
  const head = cut >= 0 ? text.slice(0, cut) : bare ? text : '';
  const tail = cut >= 0 ? text.slice(cut) : bare ? '' : text;
  // The symbol's parts: base letters, then "_sub" runs.
  const parts = head.split(/(_[A-Za-z0-9α-ω,]+)/).filter(Boolean);
  const width =
    parts.reduce(
      (n, p) => n + (p.startsWith('_') ? (p.length - 1) * 0.78 : p.length) * size * 0.58,
      0,
    ) +
    tail.length * size * 0.58;
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
      <ChartText x={left} y={y} fontSize={size} fontWeight="700" fill={color ?? c.chartInk}>
        {parts.map((p, i) => {
          const sub = p.startsWith('_');
          const prevSub = i > 0 && parts[i - 1]!.startsWith('_');
          return (
            <TSpan
              key={i}
              dy={sub ? drop : prevSub ? -drop : 0}
              fontSize={sub ? size * 0.78 : size}
              fontStyle={!sub && LETTER.test(p) ? 'italic' : 'normal'}
            >
              {sub ? p.slice(1) : p}
            </TSpan>
          );
        })}
        <TSpan dy={parts.length && parts[parts.length - 1]!.startsWith('_') ? -drop : 0}>
          {tail}
        </TSpan>
      </ChartText>
    </G>
  );
}

/** Hatching under a line from (x1, y) to (x2, y): short slanted strokes, ground or a wall. */
export function Hatch({
  x1,
  x2,
  y,
  depth = 7,
  vertical = false,
  side = 1,
}: {
  x1: number;
  x2: number;
  y: number;
  depth?: number;
  /** A wall: the line runs from (y, x1) to (y, x2) upright, hatched to `side` (−1 left). */
  vertical?: boolean;
  side?: 1 | -1;
}) {
  const c = usePalette();
  const n = Math.max(2, Math.floor(Math.abs(x2 - x1) / 6));
  const marks = [...Array(n).keys()].map((i) => x1 + ((x2 - x1) * (i + 0.5)) / n);
  return (
    <G>
      {vertical ? (
        <Line x1={y} y1={x1} x2={y} y2={x2} stroke={c.chartInk} strokeWidth={chart.stroke} />
      ) : (
        <Line x1={x1} y1={y} x2={x2} y2={y} stroke={c.chartInk} strokeWidth={chart.stroke} />
      )}
      {marks.map((m, i) =>
        vertical ? (
          <Line
            key={i}
            x1={y}
            y1={m}
            x2={y + side * depth}
            y2={m + depth}
            stroke={c.chartMuted}
            strokeWidth={1}
          />
        ) : (
          <Line
            key={i}
            x1={m}
            y1={y}
            x2={m - depth}
            y2={y + depth}
            stroke={c.chartMuted}
            strokeWidth={1}
          />
        ),
      )}
    </G>
  );
}

/**
 * A support under the beam at (x, y) (y the beam's underside): a pin (a triangle on hatched
 * ground), a roller (a triangle on two wheels) or, at an end, a fixed wall `wallH` tall facing
 * the beam (`side` −1: the wall is left of x).
 */
export function SupportGlyph({
  x,
  y,
  kind,
  side = -1,
  wallTop,
  wallH,
}: {
  x: number;
  y: number;
  kind: 'pin' | 'roller' | 'fixed';
  side?: 1 | -1;
  wallTop?: number;
  wallH?: number;
}) {
  const c = usePalette();
  if (kind === 'fixed') {
    const top = wallTop ?? y - 30;
    const h = wallH ?? 48;
    return (
      <G>
        <Rect
          x={side < 0 ? x - 10 : x}
          y={top}
          width={10}
          height={h}
          fill={c.chartGrid}
          opacity={0.6}
        />
        <Hatch x1={top} x2={top + h} y={x} vertical side={side} depth={8} />
      </G>
    );
  }
  const H = 14;
  const B = 9;
  const base = kind === 'roller' ? y + H + 7 : y + H;
  return (
    <G>
      <Polygon
        points={`${x},${y} ${x - B},${y + H} ${x + B},${y + H}`}
        fill={c.card}
        stroke={c.chartInk}
        strokeWidth={chart.strokeLight}
      />
      <Circle cx={x} cy={y + 3} r={2.2} fill={c.chartInk} />
      {kind === 'roller' ? (
        <>
          <Circle cx={x - 5} cy={y + H + 3.5} r={3.2} fill={c.card} stroke={c.chartInk} />
          <Circle cx={x + 5} cy={y + H + 3.5} r={3.2} fill={c.card} stroke={c.chartInk} />
        </>
      ) : null}
      <Hatch x1={x - 13} x2={x + 13} y={base} depth={5} />
    </G>
  );
}

/** How far below the beam's underside a pin or roller (with its ground) reaches. */
export const SUPPORT_DEPTH = 28;

/**
 * A dimension line from x1 to x2 at height y, with end ticks and the label centred over it
 * (or beside it when it is too short for the label).
 */
export function Dimension({
  x1,
  x2,
  y,
  text,
  w,
  color,
}: {
  x1: number;
  x2: number;
  y: number;
  text: string;
  w: number;
  color?: string;
}) {
  const c = usePalette();
  const ink = color ?? c.chartMuted;
  if (Math.abs(x2 - x1) < 2) return null;
  const [a, b] = [Math.min(x1, x2), Math.max(x1, x2)];
  return (
    <G>
      <Line x1={a} y1={y} x2={b} y2={y} stroke={ink} strokeWidth={1} />
      <Path d={arrowHead(a, y, -1, 0, 6)} fill={ink} />
      <Path d={arrowHead(b, y, 1, 0, 6)} fill={ink} />
      <Line x1={a} y1={y - 6} x2={a} y2={y + 6} stroke={ink} strokeWidth={1} />
      <Line x1={b} y1={y - 6} x2={b} y2={y + 6} stroke={ink} strokeWidth={1} />
      <HeLabel x={(a + b) / 2} y={y - 4} text={text} size={chart.label} w={w} />
    </G>
  );
}

/** The paint ids a beam body needs; pass the matching ids from `usePaintIds`. */
export interface BeamPaint {
  steel: string;
  light: string;
}

/** The gradients behind a painted beam: steel lit from above, and a top light for the rest. */
export function BeamDefs({ ids }: { ids: BeamPaint }) {
  const c = usePalette();
  const k = c.sheen;
  return (
    <>
      <LinearGradient id={ids.steel} x1="0" y1="0" x2="0" y2="1">
        <Stop offset="0" stopColor={c.shine} stopOpacity={0.5 * k} />
        <Stop offset="0.25" stopColor={c.metal} stopOpacity={1} />
        <Stop offset="0.75" stopColor={c.metal} stopOpacity={1} />
        <Stop offset="1" stopColor={c.metalDark} stopOpacity={1} />
      </LinearGradient>
      <LinearGradient id={ids.light} x1="0" y1="0" x2="0" y2="1">
        <Stop offset="0" stopColor={c.shine} stopOpacity={0.35 * k} />
        <Stop offset="0.5" stopColor={c.shine} stopOpacity={0.05 * k} />
        <Stop offset="1" stopColor={c.shade} stopOpacity={0.12 * k} />
      </LinearGradient>
    </>
  );
}

/** A small pseudo-random number in [0, 1) from a seed (aggregate in concrete, wood grain). */
const jitter = (i: number) => {
  const s = Math.sin(i * 12.9898 + 78.233) * 43758.5453;
  return s - Math.floor(s);
};

/**
 * The beam's body from (x1, y) to (x2, y + h), painted in its material: a steel I-beam seen from
 * the side (flange lines top and bottom), concrete with aggregate, wood with grain, or aluminum.
 */
export function BeamBody({
  x1,
  x2,
  y,
  h,
  material = 'steel',
  ids,
  opacity = 1,
}: {
  x1: number;
  x2: number;
  y: number;
  h: number;
  material?: 'steel' | 'concrete' | 'wood' | 'aluminum';
  ids: BeamPaint;
  opacity?: number;
}) {
  const c = usePalette();
  const width = Math.max(0, x2 - x1);
  if (material === 'concrete') {
    const n = Math.floor((width * h) / 90);
    return (
      <G opacity={opacity}>
        <Rect x={x1} y={y} width={width} height={h} fill={c.beamConcrete} />
        {[...Array(n).keys()].map((i) => (
          <Circle
            key={i}
            cx={x1 + 2 + jitter(i) * (width - 4)}
            cy={y + 2 + jitter(i + 999) * (h - 4)}
            r={0.8 + jitter(i + 77) * 1.4}
            fill={c.beamConcreteDark}
            opacity={0.55}
          />
        ))}
        <Rect x={x1} y={y} width={width} height={h} fill={`url(#${ids.light})`} />
        <Rect x={x1} y={y} width={width} height={h} fill="none" stroke={c.beamConcreteDark} />
      </G>
    );
  }
  if (material === 'wood') {
    return (
      <G opacity={opacity}>
        <Rect x={x1} y={y} width={width} height={h} fill={c.wood} />
        {[0.3, 0.55, 0.8].map((f, i) => (
          <Path
            key={i}
            d={`M ${x1} ${y + h * f} C ${x1 + width * 0.3} ${y + h * (f - 0.12)}, ${x1 + width * 0.6} ${y + h * (f + 0.1)}, ${x2} ${y + h * f}`}
            stroke={c.woodDark}
            strokeWidth={0.8}
            fill="none"
            opacity={0.6}
          />
        ))}
        <Rect x={x1} y={y} width={width} height={h} fill={`url(#${ids.light})`} />
        <Rect x={x1} y={y} width={width} height={h} fill="none" stroke={c.woodDark} />
      </G>
    );
  }
  const flange = Math.max(2, Math.min(4, h * 0.2));
  return (
    <G opacity={opacity}>
      <Rect x={x1} y={y} width={width} height={h} fill={`url(#${ids.steel})`} />
      {material === 'steel' ? (
        <>
          <Line
            x1={x1}
            y1={y + flange}
            x2={x2}
            y2={y + flange}
            stroke={c.metalDark}
            strokeWidth={1}
          />
          <Line
            x1={x1}
            y1={y + h - flange}
            x2={x2}
            y2={y + h - flange}
            stroke={c.metalDark}
            strokeWidth={1}
          />
        </>
      ) : null}
      <Rect x={x1} y={y} width={width} height={h} fill="none" stroke={c.metalDark} />
    </G>
  );
}

/** A filled arrow from (x1, y1) to (x2, y2). */
export function Arrow({
  x1,
  y1,
  x2,
  y2,
  color,
  width = chart.stroke,
  head = 8,
}: {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  color: string;
  width?: number;
  head?: number;
}) {
  const len = Math.hypot(x2 - x1, y2 - y1);
  if (len < 2) return null;
  const k = Math.min(head, len * 0.7);
  const ex = x2 - ((x2 - x1) / len) * k * 0.8;
  const ey = y2 - ((y2 - y1) / len) * k * 0.8;
  return (
    <Fragment>
      <Line x1={x1} y1={y1} x2={ex} y2={ey} stroke={color} strokeWidth={width} />
      <Path d={arrowHead(x2, y2, x2 - x1, y2 - y1, k)} fill={color} />
    </Fragment>
  );
}

/** A number for a picture label: 3 significant figures, as the app writes numbers. */
export const fmt = (x: number) => num(Math.abs(x) < 1e-9 ? 0 : x);

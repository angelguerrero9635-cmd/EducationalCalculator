/**
 * Shared parts of the `fluidSystem` picture (HC6): reading values in SI, a board drawn at a
 * fixed design width and scaled to the canvas, arrows and dimension lines, fluid paint and
 * number text. Every drawing file of the kind uses these.
 */
import type { ReactNode } from 'react';
import Svg, { G, Line, Path, Polygon } from 'react-native-svg';

import type { FluidName } from '@/data/modules/typesHe1g';
import type { NumOrVar } from '@/data/modules/typesGraphs';
import { formatNumber } from '@/engine/format';
import { getUnit } from '@/engine/units';
import { chart, type Palette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, useRep } from './common';
import { DEFAULT_G } from './fluidMath';

/** The design width every fluid drawing is laid out in (scaled to the canvas). */
export const BW = 340;

export type Rep = ReturnType<typeof useRep>;

/** SI per unit of a variable's own unit (kPa → 1000), 1 for unregistered labels (m³/s). */
const siFactor = (rep: Rep, id: string) => getUnit(rep.variable(id).unit)?.factor ?? 1;

/** A value read for drawing: SI when known; undefined when "?" (draws nothing). */
export function useFluidReader(calc: Calculator, gSpec: NumOrVar | undefined) {
  const rep = useRep(calc);
  const si = (x: NumOrVar | undefined): number | undefined => {
    if (x === undefined) return undefined;
    if (typeof x === 'number') return x;
    return rep.known(x) ? rep.val(x) * siFactor(rep, x) : undefined;
  };
  /** "P = 147.2 kPa" for a variable; `symbol = n unit` for a fixed number; undefined for "?". */
  const label = (x: NumOrVar | undefined, symbol: string, unit = ''): string | undefined => {
    if (x === undefined) return undefined;
    if (typeof x === 'number') return `${symbol} = ${num(x)}${unit ? ` ${unit}` : ''}`;
    return rep.known(x) ? rep.label(x) : undefined;
  };
  /** The value as the page shows it, with its unit ("147.2 kPa"), or undefined for "?". */
  const text = (x: NumOrVar | undefined, unit = ''): string | undefined => {
    if (x === undefined) return undefined;
    if (typeof x === 'number') return `${num(x)}${unit ? ` ${unit}` : ''}`;
    return rep.known(x) ? rep.value(x) : undefined;
  };
  /** Sets a variable from an SI value (a drag), snapped to its step and range. */
  const fromSi = (id: string, x: number) => rep.snapTo(id, x / siFactor(rep, id));
  const g = si(gSpec ?? DEFAULT_G) ?? DEFAULT_G;
  return { rep, si, label, text, fromSi, g };
}

export type FluidReader = ReturnType<typeof useFluidReader>;

/** A number for a caption or a label: 4 significant figures, × 10ⁿ when very big or small. */
export const num = (x: number, figures = 4) =>
  formatNumber(Number(x.toPrecision(figures)), {
    scientific: Math.abs(x) >= 1e7 || (x !== 0 && Math.abs(x) < 1e-3),
    scientificFigures: 3,
  });

/**
 * The board: `height` design units tall, scaled to the canvas width. `draw` returns the SVG in
 * design units; `handles` the drag handles, placed with `k` (canvas pixels per design unit).
 */
export function Board({
  height,
  draw,
  handles,
}: {
  height: number;
  draw: () => ReactNode;
  handles?: (k: number) => ReactNode;
}) {
  return (
    <Canvas aspect={height / BW}>
      {({ w, h }) => {
        const k = w / BW;
        return (
          <>
            <Svg width={w} height={h}>
              <G transform={`scale(${k})`}>{draw()}</G>
            </Svg>
            {handles?.(k)}
          </>
        );
      }}
    </Canvas>
  );
}

/** A straight arrow from (x1, y1) to (x2, y2), its head at the end. */
export function Arrow({
  x1,
  y1,
  x2,
  y2,
  color,
  width = chart.stroke,
  head = 8,
  dash,
}: {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  color: string;
  width?: number;
  head?: number;
  dash?: string;
}) {
  const len = Math.hypot(x2 - x1, y2 - y1);
  if (len < 1) return null;
  const [ux, uy] = [(x2 - x1) / len, (y2 - y1) / len];
  const h = Math.min(head, len * 0.6);
  const bx = x2 - ux * h;
  const by = y2 - uy * h;
  const [px, py] = [-uy * h * 0.5, ux * h * 0.5];
  return (
    <G>
      <Line
        x1={x1}
        y1={y1}
        x2={bx}
        y2={by}
        stroke={color}
        strokeWidth={width}
        strokeDasharray={dash}
        strokeLinecap="round"
      />
      <Polygon points={`${x2},${y2} ${bx + px},${by + py} ${bx - px},${by - py}`} fill={color} />
    </G>
  );
}

/** A dimension line between two points with end ticks (a depth, a length). */
export function Dimension({
  x1,
  y1,
  x2,
  y2,
  color,
}: {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  color: string;
}) {
  const len = Math.hypot(x2 - x1, y2 - y1);
  if (len < 0.5) return null;
  const [nx, ny] = [(-(y2 - y1) / len) * 5, ((x2 - x1) / len) * 5];
  return (
    <Path
      d={`M ${x1 + nx} ${y1 + ny} L ${x1 - nx} ${y1 - ny} M ${x2 + nx} ${y2 + ny} L ${x2 - nx} ${y2 - ny} M ${x1} ${y1} L ${x2} ${y2}`}
      stroke={color}
      strokeWidth={1.5}
      fill="none"
    />
  );
}

/** A fluid's top and deep colours (the liquid deepens downward). */
export function fluidPaint(c: Palette, name: FluidName | undefined) {
  switch (name) {
    case 'oil':
      return { top: c.fluidOil, deep: c.fluidOilDeep };
    case 'mercury':
      return { top: c.fluidMercury, deep: c.fluidMercuryDeep };
    case 'air':
      return { top: c.fluidAir, deep: c.fluidAir };
    default:
      return { top: c.water, deep: c.waterDeep };
  }
}

/** Nice step for a scale covering `span` in about `n` steps. */
export function niceStep(span: number, n = 5) {
  const raw = span / n;
  const p = 10 ** Math.floor(Math.log10(raw));
  const m = raw / p;
  return (m <= 1 ? 1 : m <= 2 ? 2 : m <= 2.5 ? 2.5 : m <= 5 ? 5 : 10) * p;
}

/** A value fits the drawing (finite and positive). */
export const pos = (x: number | undefined): x is number =>
  x !== undefined && Number.isFinite(x) && x > 0;

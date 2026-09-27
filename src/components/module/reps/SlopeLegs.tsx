import { G, Path, Polygon, Rect } from 'react-native-svg';

import { chart, usePalette } from '@/theme';

import { ChartText, fitLabel } from './common';

/**
 * The rise/run triangle between two points on a coordinate plane (Grade 8 slope): the
 * triangle shaded, the run across and the rise up (or down) drawn heavy with arrowheads, a
 * right-angle mark at the corner and each leg labelled with its value. Drawn inside the
 * plane's Svg; `sx`/`sy` map plane coordinates to pixels.
 */
export function SlopeLegs({
  from,
  to,
  sx,
  sy,
  w,
  rise,
  run,
}: {
  from: { x: number; y: number };
  to: { x: number; y: number };
  sx: (x: number) => number;
  sy: (y: number) => number;
  w: number;
  /** Labels, e.g. "rise = 6" and "run = 3". */
  rise: string;
  run: string;
}) {
  const c = usePalette();
  const [ax, ay] = [sx(from.x), sy(from.y)];
  const [bx, by] = [sx(to.x), sy(to.y)];
  // The corner: straight across from the first point, straight below (or above) the second.
  const [cx, cy] = [bx, ay];
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const head = (x: number, y: number, ux: number, uy: number) =>
    `M ${x} ${y} l ${-ux * 8 - uy * 4.5} ${-uy * 8 + ux * 4.5} l ${uy * 9} ${-ux * 9} z`;
  const ux = Math.sign(bx - ax);
  const uy = Math.sign(by - cy);
  const mark = Math.min(9, Math.abs(bx - ax) / 3, Math.abs(by - ay) / 3);
  // The run's label goes on the side of the run away from the triangle; the rise's label on
  // the side of the rise away from the triangle.
  const runY = dy > 0 ? cy + 17 : cy - 8;
  const riseX = bx + (dx > 0 ? 8 : -8);
  const label = (x: number, y: number, text: string, anchor: 'start' | 'middle' | 'end') => {
    const fit = fitLabel(x, text, chart.label, w, anchor, 8);
    const tw = text.length * chart.label * 0.6 + 6;
    const left =
      fit.textAnchor === 'start'
        ? fit.x - 3
        : fit.textAnchor === 'end'
          ? fit.x - tw + 3
          : fit.x - tw / 2;
    return (
      <G key={text}>
        {/* A page-colored backing keeps the label clear of the grid lines under it. */}
        <Rect
          x={left}
          y={y - 12}
          width={tw}
          height={16}
          rx={3}
          fill={c.background}
          opacity={0.85}
        />
        <ChartText {...fit} y={y} fontSize={chart.label} fontWeight="700" fill={c.chartInk}>
          {text}
        </ChartText>
      </G>
    );
  };
  return (
    <G>
      <Polygon
        points={`${ax},${ay} ${cx},${cy} ${bx},${by}`}
        fill={c.chartSecond}
        fillOpacity={0.18}
      />
      {Math.abs(bx - ax) > 0 ? (
        <>
          <Path
            d={`M ${ax} ${ay} L ${cx - ux * 6} ${cy}`}
            stroke={c.chartSecond}
            strokeWidth={chart.strokeHeavy}
          />
          <Path d={head(cx, cy, ux, 0)} fill={c.chartSecond} />
        </>
      ) : null}
      {Math.abs(by - cy) > 0 ? (
        <>
          <Path
            d={`M ${cx} ${cy} L ${bx} ${by - uy * 6}`}
            stroke={c.chartSecond}
            strokeWidth={chart.strokeHeavy}
          />
          <Path d={head(bx, by, 0, uy)} fill={c.chartSecond} />
        </>
      ) : null}
      {mark > 3 ? (
        <Path
          d={`M ${cx - ux * mark} ${cy} L ${cx - ux * mark} ${cy + uy * mark} L ${cx} ${cy + uy * mark}`}
          stroke={c.chartInk}
          strokeWidth={1}
          fill="none"
        />
      ) : null}
      {label((ax + cx) / 2, runY, run, 'middle')}
      {label(riseX, (cy + by) / 2 + 4, rise, dx > 0 ? 'start' : 'end')}
    </G>
  );
}

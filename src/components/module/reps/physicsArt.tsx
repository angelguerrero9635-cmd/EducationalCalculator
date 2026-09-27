/**
 * Real objects for the Grade 8 physics pictures, in their materials (theme tokens and the
 * shading in paint.tsx): a battery cell, a light bulb in its socket, an ammeter and a knife
 * switch. Each takes the ids of gradients the picture defines with `usePaintIds`.
 */
import { Circle, G, Line, Path, Rect } from 'react-native-svg';

import { chart, usePalette } from '@/theme';

import { ChartText } from './common';
import { url } from './paint';

/**
 * A battery cell standing up, + end (copper band and nub) on top: body from `top` to
 * `top + height`, centered on `x`. `sheen` is a Sheen gradient id.
 */
export function Battery({
  x,
  top,
  height,
  width = 24,
  sheen,
  faded,
}: {
  x: number;
  top: number;
  height: number;
  width?: number;
  sheen: string;
  faded?: boolean;
}) {
  const c = usePalette();
  const band = height * 0.28;
  return (
    <G opacity={faded ? 0.45 : 1}>
      <Rect
        x={x + 3 - width / 2}
        y={top + 3}
        width={width}
        height={height}
        rx={4}
        fill={c.shadow}
      />
      {/* The + terminal's nub. */}
      <Rect
        x={x - 5}
        y={top - 5}
        width={10}
        height={7}
        rx={2}
        fill={c.metal}
        stroke={c.metalDark}
      />
      <Rect x={x - width / 2} y={top} width={width} height={height} rx={4} fill={c.rubber} />
      <Rect x={x - width / 2} y={top} width={width} height={band} rx={4} fill={c.copper} />
      <Rect x={x - width / 2} y={top} width={width} height={height} rx={4} fill={url(sheen)} />
      <ChartText
        x={x}
        y={top + band - 5}
        fontSize={chart.label}
        fontWeight="700"
        fill={c.pennyInk}
        textAnchor="middle"
      >
        +
      </ChartText>
      <ChartText
        x={x}
        y={top + height - 6}
        fontSize={chart.label}
        fontWeight="700"
        fill={c.pennyInk}
        textAnchor="middle"
      >
        −
      </ChartText>
    </G>
  );
}

/**
 * A light bulb in a metal screw socket, the socket's middle at (x, y): a glass globe above it
 * with a filament, glowing with `glow` (0 dark to 1 full). `glass` is a Glass gradient id and
 * `metal` a Metal one.
 */
export function Bulb({
  x,
  y,
  glow,
  glass,
  metal,
  r = 13,
  faded,
}: {
  x: number;
  y: number;
  glow: number;
  glass: string;
  metal: string;
  r?: number;
  faded?: boolean;
}) {
  const c = usePalette();
  const cy = y - 6 - r * 0.85;
  const lit = glow > 0.02;
  return (
    <G opacity={faded ? 0.45 : 1}>
      {lit ? (
        <>
          <Circle
            cx={x}
            cy={cy}
            r={r + 4 + 14 * glow}
            fill={c.bulbGlow}
            opacity={0.18 + 0.3 * glow}
          />
          <Circle
            cx={x}
            cy={cy}
            r={r + 2 + 6 * glow}
            fill={c.bulbGlow}
            opacity={0.25 + 0.4 * glow}
          />
        </>
      ) : null}
      {/* The globe: clear glass, filled with light when lit. */}
      <Path
        d={`M ${x - r * 0.45} ${y - 6} C ${x - r * 0.5} ${cy + r * 0.55}, ${x - r} ${cy + r * 0.35}, ${x - r} ${cy} A ${r} ${r} 0 0 1 ${x + r} ${cy} C ${x + r} ${cy + r * 0.35}, ${x + r * 0.5} ${cy + r * 0.55}, ${x + r * 0.45} ${y - 6} Z`}
        fill={url(glass)}
        stroke={c.glassEdge}
        strokeWidth={1.2}
      />
      {lit ? (
        <Circle cx={x} cy={cy} r={r * 0.8} fill={c.bulbGlow} opacity={Math.min(0.9, 0.2 + glow)} />
      ) : null}
      {/* Filament on two supports. */}
      <Path
        d={`M ${x - 3} ${y - 6} L ${x - 4} ${cy + 1} M ${x + 3} ${y - 6} L ${x + 4} ${cy + 1}`}
        stroke={c.metalDark}
        strokeWidth={0.9}
      />
      <Path
        d={`M ${x - 4} ${cy + 1} q 1 -4 2 0 q 1 4 2 0 q 1 -4 2 0 q 1 4 2 0`}
        stroke={lit ? c.sunRay : c.chartMuted}
        strokeWidth={lit ? 1.6 : 1}
        fill="none"
      />
      {/* The screw socket. */}
      <Rect
        x={x - r * 0.5}
        y={y - 6}
        width={r}
        height={12}
        rx={2}
        fill={url(metal)}
        stroke={c.metalDark}
      />
      {[0, 1, 2].map((i) => (
        <Line
          key={i}
          x1={x - r * 0.5}
          y1={y - 3 + i * 3.5}
          x2={x + r * 0.5}
          y2={y - 4.5 + i * 3.5}
          stroke={c.metalDark}
          strokeWidth={0.8}
        />
      ))}
    </G>
  );
}

/**
 * A round ammeter centered on (x, y): a metal rim, a paper face with a scale from 0 to `max`, and
 * a needle at `reading` (a share of the scale, 0 to 1). `metal` is a Metal gradient id.
 */
export function Meter({
  x,
  y,
  r = 22,
  reading,
  max,
  letter = 'A',
  metal,
  faded,
}: {
  x: number;
  y: number;
  r?: number;
  reading: number;
  max: string;
  letter?: string;
  metal: string;
  faded?: boolean;
}) {
  const c = usePalette();
  const a0 = (-140 * Math.PI) / 180;
  const a1 = (-40 * Math.PI) / 180;
  const at = (t: number) => a0 + (a1 - a0) * Math.min(1, Math.max(0, t));
  const pt = (t: number, rr: number) => [x + rr * Math.cos(at(t)), y + 4 + rr * Math.sin(at(t))];
  const [nx, ny] = pt(reading, r - 6);
  return (
    <G opacity={faded ? 0.45 : 1}>
      <Circle cx={x + 2} cy={y + 3} r={r} fill={c.shadow} />
      <Circle cx={x} cy={y} r={r} fill={url(metal)} stroke={c.metalDark} />
      <Circle cx={x} cy={y} r={r - 4} fill={c.silver} stroke={c.metalDark} strokeWidth={0.8} />
      {[0, 0.25, 0.5, 0.75, 1].map((t) => {
        const [x1, y1] = pt(t, r - 7);
        const [x2, y2] = pt(t, r - 10);
        return (
          <Line key={t} x1={x1} y1={y1} x2={x2} y2={y2} stroke={c.coinInk} strokeWidth={0.9} />
        );
      })}
      <ChartText
        x={pt(0, r - 8)[0]! - 1}
        y={y + 9}
        fontSize={7}
        fill={c.coinInk}
        textAnchor="middle"
      >
        0
      </ChartText>
      <ChartText
        x={pt(1, r - 8)[0]! + 1}
        y={y + 9}
        fontSize={7}
        fill={c.coinInk}
        textAnchor="middle"
      >
        {max}
      </ChartText>
      <ChartText
        x={x}
        y={y + 14}
        fontSize={chart.small}
        fontWeight="700"
        fill={c.coinInk}
        textAnchor="middle"
      >
        {letter}
      </ChartText>
      <Line
        x1={x}
        y1={y + 4}
        x2={nx}
        y2={ny}
        stroke={c.mercury}
        strokeWidth={1.6}
        strokeLinecap="round"
      />
      <Circle cx={x} cy={y + 4} r={2} fill={c.coinInk} />
    </G>
  );
}

/**
 * A knife switch on a wire at height `y`, from `x0` to `x1`: two metal posts and a lever from
 * the left post, down on the right post when closed, raised when open.
 */
export function KnifeSwitch({
  x0,
  x1,
  y,
  closed,
  faded,
}: {
  x0: number;
  x1: number;
  y: number;
  closed: boolean;
  faded?: boolean;
}) {
  const c = usePalette();
  const len = x1 - x0;
  const angle = closed ? 0 : (-35 * Math.PI) / 180;
  return (
    <G opacity={faded ? 0.45 : 1}>
      <Rect
        x={x0 - 6}
        y={y - 2}
        width={len + 12}
        height={9}
        rx={2}
        fill={c.wood}
        stroke={c.woodDark}
      />
      <Rect x={x0 - 3} y={y - 5} width={6} height={7} rx={1} fill={c.metal} stroke={c.metalDark} />
      <Rect x={x1 - 3} y={y - 5} width={6} height={7} rx={1} fill={c.metal} stroke={c.metalDark} />
      <Line
        x1={x0}
        y1={y - 4}
        x2={x0 + len * Math.cos(angle)}
        y2={y - 4 + len * Math.sin(angle)}
        stroke={c.metalDark}
        strokeWidth={chart.strokeHeavy + 0.5}
        strokeLinecap="round"
      />
      <Circle cx={x0} cy={y - 4} r={2.4} fill={c.metal} stroke={c.metalDark} />
    </G>
  );
}

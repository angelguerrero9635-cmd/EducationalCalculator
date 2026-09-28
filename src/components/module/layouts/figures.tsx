import type { ReactNode } from 'react';
import Svg, { Circle, G, Line, Path, Rect } from 'react-native-svg';

import type { MoonPhase, Scene } from '@/data/modules/layouts';
import { chart, type Palette } from '@/theme';

import { Canvas, ChartText } from '../reps/common';

/**
 * Explore figures for the K–3 science and Grade 3 math pages (docs/MODULE_GUIDE.md, "Module
 * layouts"). Each draws one scene; what a student reads about the scene is the scene's
 * lines, so the figures only name the things they draw.
 */

/** An arrow from (x1, y1) to (x2, y2) with a small head at the end; `heavy` for a hard push. */
export function Arrow({
  x1,
  y1,
  x2,
  y2,
  c,
  heavy,
  color,
  dashed,
}: {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  c: Palette;
  heavy?: boolean;
  color?: string;
  dashed?: boolean;
}) {
  const a = Math.atan2(y2 - y1, x2 - x1);
  const head = heavy ? 16 : 9;
  const hx = (t: number) => x2 - head * Math.cos(a + t);
  const hy = (t: number) => y2 - head * Math.sin(a + t);
  const stroke = color ?? c.chartHighlight;
  const width = heavy ? chart.strokeHeavy * 2 : chart.stroke;
  return (
    <G>
      <Path
        d={`M ${x1} ${y1} L ${x2} ${y2}`}
        stroke={stroke}
        strokeWidth={width}
        strokeLinecap="round"
        strokeDasharray={dashed ? chart.dash : undefined}
      />
      <Path
        d={`M ${hx(0.45)} ${hy(0.45)} L ${x2} ${y2} L ${hx(-0.45)} ${hy(-0.45)}`}
        stroke={stroke}
        strokeWidth={width}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </G>
  );
}

/** A five-point star centered on (x, y). */
function Star({ x, y, r, c }: { x: number; y: number; r: number; c: Palette }) {
  const pts = Array.from({ length: 10 }, (_, i) => {
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    const rad = i % 2 === 0 ? r : r * 0.45;
    return `${x + rad * Math.cos(a)},${y + rad * Math.sin(a)}`;
  });
  return <Path d={`M ${pts.join(' L ')} Z`} fill={c.chartHighlight} />;
}

const PHASES: MoonPhase[] = [
  'new',
  'waxing crescent',
  'first quarter',
  'waxing gibbous',
  'full',
  'waning gibbous',
  'third quarter',
  'waning crescent',
];

/**
 * The moon at (x, y) in one of its shapes, as seen from the Northern Hemisphere: the dark disc,
 * then the lit part bounded by the edge and the curved line between day and night. Waxing
 * moons are lit on the right, waning moons on the left.
 */
export function MoonShape({
  x,
  y,
  r,
  phase,
  c,
}: {
  x: number;
  y: number;
  r: number;
  phase: MoonPhase;
  c: Palette;
}) {
  const i = PHASES.indexOf(phase);
  const angle = (i * Math.PI) / 4;
  const waxing = i > 0 && i < 4;
  // Half the width of the curve between the lit and dark parts: a full circle at new and full
  // moon, a straight line at the quarters.
  const rx = Math.abs(r * Math.cos(angle));
  const crescent = i === 1 || i === 7;
  let lit: ReactNode = null;
  if (phase === 'full') {
    lit = <Circle cx={x} cy={y} r={r} fill={c.moonLit} />;
  } else if (phase !== 'new') {
    // The edge half (right when waxing), then back up along the curve: it bulges toward the
    // lit edge for a crescent and away from it for a gibbous moon.
    const edge = waxing ? 1 : 0;
    const curve = waxing === crescent ? 0 : 1;
    lit = (
      <Path
        d={`M ${x} ${y - r} A ${r} ${r} 0 0 ${edge} ${x} ${y + r} A ${Math.max(rx, 0.01)} ${r} 0 0 ${curve} ${x} ${y - r} Z`}
        fill={c.moonLit}
      />
    );
  }
  return (
    <G>
      <Circle cx={x} cy={y} r={r} fill={c.moonDark} />
      {lit}
      {/* The rim, dashed for a new moon, so it is still seen. */}
      <Circle
        cx={x}
        cy={y}
        r={r}
        fill="none"
        stroke={c.chartMuted}
        strokeWidth={1}
        strokeDasharray={phase === 'new' ? chart.dashFine : undefined}
      />
    </G>
  );
}

/**
 * The sky over a house, East on the left and West on the right (facing south), with the
 * sun's path as a dotted arc. The sun sits low in the east, high at midday or low in the
 * west; at night the sky is dark with the moon, in its shape, and stars. `rising` draws the
 * way the sun or moon moves along its path; `cycle` a strip of the moon's eight shapes.
 */
export function Sky({ sky, c }: { sky: NonNullable<Scene['sky']>; c: Palette }) {
  const strip = sky.cycle ? 78 : 0;
  return (
    <Canvas aspect={(w) => 0.55 + strip / w}>
      {({ w, h }) => {
        const ground = h - 44 - strip;
        const cx = w / 2;
        const rx = w / 2 - 44;
        const ry = ground - 34;
        const spot = (t: number, grow = 0) => ({
          x: cx - (rx + grow) * Math.cos(t),
          y: ground - (ry + grow) * Math.sin(t),
        });
        const t0 = sky.at === 'east' ? 0.35 : sky.at === 'west' ? Math.PI - 0.35 : Math.PI / 2;
        const at = spot(t0);
        const night = sky.body === 'night';
        const phase = sky.phase ?? 'waxing crescent';
        // The way it moves: along the path toward the west, just outside it.
        const way = Array.from({ length: 9 }, (_, k) => spot(t0 + 0.28 + k * 0.05, 26));
        const last = way[way.length - 1]!;
        const before = way[way.length - 2]!;
        return (
          <Svg width={w} height={h}>
            <Rect x={0} y={0} width={w} height={ground} fill={night ? c.chartNight : c.chartDay} />
            <Path
              d={`M ${cx - rx} ${ground} A ${rx} ${ry} 0 0 1 ${cx + rx} ${ground}`}
              stroke={night ? c.chartMuted : c.chartInk}
              strokeWidth={chart.strokeLight}
              strokeDasharray={chart.dashFine}
              fill="none"
            />
            {night ? (
              <G>
                {[
                  [0.14, 0.2],
                  [0.3, 0.1],
                  [0.62, 0.16],
                  [0.8, 0.3],
                  [0.9, 0.12],
                  [0.46, 0.34],
                ].map(([fx, fy], i) => (
                  <Star key={i} x={w * fx!} y={ground * fy!} r={6} c={c} />
                ))}
                <MoonShape x={at.x} y={at.y} r={16} phase={phase} c={c} />
              </G>
            ) : (
              <G>
                {Array.from({ length: 8 }, (_, i) => {
                  const a = (i * Math.PI) / 4;
                  return (
                    <Line
                      key={i}
                      x1={at.x + 22 * Math.cos(a)}
                      y1={at.y + 22 * Math.sin(a)}
                      x2={at.x + 30 * Math.cos(a)}
                      y2={at.y + 30 * Math.sin(a)}
                      stroke={c.chartHighlight}
                      strokeWidth={chart.stroke}
                    />
                  );
                })}
                <Circle
                  cx={at.x}
                  cy={at.y}
                  r={16}
                  fill={c.chartHighlight}
                  stroke={c.chartInk}
                  strokeWidth={chart.stroke}
                />
              </G>
            )}
            {sky.rising ? (
              <G>
                <Path
                  d={`M ${way.map((p) => `${p.x} ${p.y}`).join(' L ')}`}
                  stroke={night ? c.moonLit : c.chartInk}
                  strokeWidth={chart.stroke}
                  strokeLinecap="round"
                  fill="none"
                />
                <Arrow
                  x1={before.x}
                  y1={before.y}
                  x2={last.x}
                  y2={last.y}
                  c={c}
                  color={night ? c.moonLit : c.chartInk}
                />
              </G>
            ) : null}
            <Line
              x1={0}
              y1={ground}
              x2={w}
              y2={ground}
              stroke={c.chartInk}
              strokeWidth={chart.stroke}
            />
            {/* The house */}
            <Path
              d={`M ${cx - 22} ${ground} v -26 l 22 -18 l 22 18 v 26 Z`}
              fill={c.chartFill}
              stroke={c.chartInk}
              strokeWidth={chart.stroke}
            />
            <ChartText x={8} y={ground + 18} fontSize={chart.label} fontWeight="600">
              East
            </ChartText>
            <ChartText
              x={w - 8}
              y={ground + 18}
              fontSize={chart.label}
              fontWeight="600"
              textAnchor="end"
            >
              West
            </ChartText>
            <ChartText x={cx} y={ground + 38} fontSize={chart.label} textAnchor="middle">
              {night
                ? sky.rising
                  ? 'moonrise'
                  : sky.phase
                    ? `${sky.phase === 'new' || sky.phase === 'full' ? `${sky.phase} moon` : sky.phase}`
                    : 'night'
                : sky.rising
                  ? 'sunrise'
                  : sky.at === 'east'
                    ? 'morning'
                    : sky.at === 'west'
                      ? 'evening'
                      : 'midday'}
            </ChartText>
            {sky.cycle ? (
              <G>
                {PHASES.map((p, k) => {
                  const slot = (w - 16) / 8;
                  const mx = 8 + slot * (k + 0.5);
                  const my = h - strip + 30;
                  const r = Math.min(13, slot / 2 - 5);
                  return (
                    <G key={p}>
                      {p === phase ? (
                        <Circle
                          cx={mx}
                          cy={my}
                          r={r + 5}
                          fill="none"
                          stroke={c.chartHighlight}
                          strokeWidth={chart.strokeHeavy}
                        />
                      ) : null}
                      <MoonShape x={mx} y={my} r={r} phase={p} c={c} />
                    </G>
                  );
                })}
                {(['new', 'full'] as const).map((p) => (
                  <ChartText
                    key={p}
                    x={8 + ((w - 16) / 8) * (p === 'new' ? 0.5 : 4.5)}
                    y={h - 8}
                    fontSize={chart.tiny}
                    fill={c.chartMuted}
                    textAnchor="middle"
                  >
                    {p}
                  </ChartText>
                ))}
              </G>
            ) : null}
          </Svg>
        );
      }}
    </Canvas>
  );
}

/**
 * An addition or times table from 0 to 10. A scene lights whole rows or columns, the even
 * or odd answers, or the mirror line (the diagonal where the two factors are the same).
 */
export function TimesTable({ table, c }: { table: NonNullable<Scene['table']>; c: Palette }) {
  const n = 11;
  const lit = (r: number, col: number, v: number) =>
    (table.rows?.includes(r) ?? false) ||
    (table.columns?.includes(col) ?? false) ||
    (table.cells === 'even' && v % 2 === 0) ||
    (table.cells === 'odd' && v % 2 === 1) ||
    (table.mirror === true && r === col);
  return (
    <Canvas aspect={1}>
      {({ w }) => {
        const cell = Math.floor((w - 4) / (n + 1));
        const size = cell * (n + 1);
        const x0 = (w - size) / 2;
        const font = cell >= 30 ? chart.label : chart.tiny;
        const cells: ReactNode[] = [];
        for (let r = -1; r < n; r++) {
          for (let col = -1; col < n; col++) {
            const x = x0 + (col + 1) * cell;
            const y = (r + 1) * cell;
            const head = r < 0 || col < 0;
            if (r < 0 && col < 0) {
              cells.push(
                <ChartText
                  key="op"
                  x={x + cell / 2}
                  y={y + cell / 2 + 5}
                  fontSize={chart.emphasis}
                  fontWeight="700"
                  textAnchor="middle"
                >
                  {table.op}
                </ChartText>,
              );
              continue;
            }
            const v = head ? Math.max(r, col) : table.op === '×' ? r * col : r + col;
            const on = !head && lit(r, col, v);
            cells.push(
              <G key={`${r}.${col}`}>
                <Rect
                  x={x}
                  y={y}
                  width={cell}
                  height={cell}
                  fill={head ? c.chartFill : on ? c.chartHighlight : c.chartSurface}
                  stroke={c.chartGrid}
                  strokeWidth={1}
                />
                <ChartText
                  x={x + cell / 2}
                  y={y + cell / 2 + 4}
                  fontSize={font}
                  fontWeight={head ? '700' : '400'}
                  fill={on ? c.onChartHighlight : c.chartInk}
                  textAnchor="middle"
                >
                  {String(v)}
                </ChartText>
              </G>,
            );
          }
        }
        return (
          <Svg width={w} height={size + 2}>
            {cells}
            {table.mirror ? (
              <Line
                x1={x0 + cell}
                y1={cell}
                x2={x0 + size}
                y2={size}
                stroke={c.chartInk}
                strokeWidth={chart.strokeLight}
                strokeDasharray={chart.dash}
              />
            ) : null}
          </Svg>
        );
      }}
    </Canvas>
  );
}

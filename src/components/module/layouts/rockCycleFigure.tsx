import type { ReactNode } from 'react';
import { Circle, Defs, G, Path, RadialGradient, Stop } from 'react-native-svg';

import type { Scene } from '@/data/modules/layouts';
import { chart, type Palette } from '@/theme';

import { ChartText } from '../reps/common';
import { SunDisk } from '../reps/nature';
import { Ball, url, usePaintIds } from '../reps/paint';
import { BOARD_W, Board, Chip, chipW } from './earthKit';

/**
 * The rock cycle as the standard ring (Grade 6): six stations, each a round swatch of the rock
 * (cracked surface rock, loose sediment, layered sandstone, banded gneiss, glowing magma and
 * speckled granite), joined clockwise around the ring by weathering, deposition, metamorphism,
 * melting, cooling and uplift. Three chords and one short inner arc show the shortcuts (any rock
 * can become another), and none of them cross. The scene's step is drawn heavy in the highlight
 * with its name on a chip; the rest stay thin and muted. What drives the step sits in the
 * middle: Earth's inner heat, or the sun and gravity.
 */

type Station = 'surface' | 'sediment' | 'sedimentary' | 'metamorphic' | 'magma' | 'igneous';
type Process = NonNullable<Scene['rock']>['process'];

const H = 324;
const CX = 166;
const CY = 162;
const RX = 86;
const RY = 118;
const R = 18;

/** Each station's angle on the ring (degrees, clockwise from the right), and its name's lines. */
const STATIONS: Record<
  Station,
  { deg: number; lines: string[]; side: 'top' | 'right' | 'left' | 'bottom' }
> = {
  surface: { deg: 270, lines: ['rock at the surface'], side: 'top' },
  sediment: { deg: 318, lines: ['sediment'], side: 'right' },
  sedimentary: { deg: 8, lines: ['sedimentary', 'rock'], side: 'right' },
  metamorphic: { deg: 56, lines: ['metamorphic', 'rock'], side: 'right' },
  magma: { deg: 118, lines: ['magma'], side: 'bottom' },
  igneous: { deg: 196, lines: ['igneous', 'rock'], side: 'left' },
};

const at = (deg: number): [number, number] => {
  const t = (deg * Math.PI) / 180;
  return [CX + RX * Math.cos(t), CY + RY * Math.sin(t)];
};

/**
 * Every step. `ring`: along the ring, clockwise; otherwise a chord bowed `bend` px to the left of
 * its way. What drives it: Earth's inner heat, or the sun and gravity.
 */
const STEPS: { process: Process; from: Station; to: Station; ring?: boolean; bend?: number }[] = [
  { process: 'weathering', from: 'surface', to: 'sediment', ring: true },
  { process: 'deposition', from: 'sediment', to: 'sedimentary', ring: true },
  { process: 'metamorphism', from: 'sedimentary', to: 'metamorphic', ring: true },
  { process: 'melting', from: 'metamorphic', to: 'magma', ring: true },
  { process: 'cooling', from: 'magma', to: 'igneous', ring: true },
  { process: 'uplift', from: 'igneous', to: 'surface', ring: true },
  // Shortcuts across the ring (they never cross one another).
  { process: 'melting', from: 'igneous', to: 'magma', bend: 14 },
  { process: 'metamorphism', from: 'igneous', to: 'metamorphic', bend: -10 },
  { process: 'uplift', from: 'metamorphic', to: 'surface', bend: -16 },
  { process: 'uplift', from: 'sedimentary', to: 'surface', bend: -8 },
];
const HEAT: Record<Process, boolean> = {
  melting: true,
  cooling: true,
  metamorphism: true,
  uplift: true,
  weathering: false,
  deposition: false,
};

/** Points along a step, from the edge of one swatch to the edge of the next. */
function route(s: (typeof STEPS)[number]): [number, number][] {
  const a = at(STATIONS[s.from].deg);
  const b = at(STATIONS[s.to].deg);
  let pts: [number, number][];
  if (s.ring) {
    let d0 = STATIONS[s.from].deg;
    let d1 = STATIONS[s.to].deg;
    if (d1 < d0) d1 += 360;
    pts = Array.from({ length: 41 }, (_, i) => at(d0 + ((d1 - d0) * i) / 40));
    d0 = 0;
  } else {
    const [mx, my] = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
    const len = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
    const bend = s.bend ?? 0;
    const q = [mx + (bend * (b[1] - a[1])) / len, my - (bend * (b[0] - a[0])) / len];
    pts = Array.from({ length: 41 }, (_, i) => {
      const t = i / 40;
      const u = 1 - t;
      return [
        u * u * a[0] + 2 * u * t * q[0]! + t * t * b[0],
        u * u * a[1] + 2 * u * t * q[1]! + t * t * b[1],
      ] as [number, number];
    });
  }
  // Trim to the swatches' edges (a little gap at each end).
  return pts.filter(
    ([x, y]) => Math.hypot(x - a[0], y - a[1]) > R + 5 && Math.hypot(x - b[0], y - b[1]) > R + 7,
  );
}

function StepPath({ pts, on, c }: { pts: [number, number][]; on: boolean; c: Palette }) {
  if (pts.length < 2) return null;
  const d = 'M ' + pts.map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join(' L ');
  const [x1, y1] = pts[pts.length - 1]!;
  const [x0, y0] = pts[pts.length - 3] ?? pts[0]!;
  const t = Math.atan2(y1 - y0, x1 - x0);
  const head = on ? 11 : 7;
  const hx = (k: number) => x1 - head * Math.cos(t + k);
  const hy = (k: number) => y1 - head * Math.sin(t + k);
  const stroke = on ? c.chartHighlight : c.chartMuted;
  const width = on ? chart.strokeHeavy : chart.strokeLight;
  return (
    <G opacity={on ? 1 : 0.75}>
      <Path
        d={d}
        stroke={stroke}
        strokeWidth={width}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <Path
        d={`M ${hx(0.45)} ${hy(0.45)} L ${x1} ${y1} L ${hx(-0.45)} ${hy(-0.45)}`}
        stroke={stroke}
        strokeWidth={width}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </G>
  );
}

export function RockCycleFigure({ rock, c }: { rock: NonNullable<Scene['rock']>; c: Palette }) {
  const ids = usePaintIds('magma', 'round', 'sun', 'flame');
  const on = rock.process;
  const heat = HEAT[on];

  /** The rock inside each swatch, drawn in a circle of radius R at (x, y). */
  const swatch = (s: Station, x: number, y: number): ReactNode => {
    const ring = (fill: string, children?: ReactNode) => (
      <G>
        <Circle cx={x} cy={y} r={R} fill={fill} />
        {children}
        <Circle cx={x} cy={y} r={R} fill={url(ids.round)} />
        <Circle cx={x} cy={y} r={R} fill="none" stroke={c.chartInk} strokeWidth={1.5} />
      </G>
    );
    const clip = (dx: number) => Math.sqrt(Math.max(0, R * R - dx * dx)) - 1;
    switch (s) {
      case 'surface':
        return ring(
          c.rock2,
          <Path
            d={`M ${x - 12} ${y - 8} L ${x - 3} ${y - 2} L ${x - 5} ${y + 7} M ${x - 3} ${y - 2} L ${x + 9} ${y - 5} M ${x + 4} ${y + 3} L ${x + 12} ${y + 9}`}
            stroke={c.rock5}
            strokeWidth={1.4}
            fill="none"
          />,
        );
      case 'sediment':
        return ring(
          c.rock1,
          <G>
            {[
              [-10, -6, 3],
              [-2, -9, 2.4],
              [7, -6, 3.2],
              [-12, 4, 2.6],
              [-3, 2, 3.4],
              [8, 4, 2.4],
              [0, 11, 2.8],
              [-8, 12, 2],
              [11, -1, 1.8],
            ].map(([dx, dy, r]) => (
              <Circle
                key={`${dx}${dy}`}
                cx={x + dx!}
                cy={y + dy!}
                r={r}
                fill={c.rock4}
                stroke={c.rock5}
                strokeWidth={0.6}
              />
            ))}
          </G>,
        );
      case 'sedimentary':
        return ring(
          c.rock1,
          <G>
            {[
              [-13, c.rock6],
              [-5, c.rock4],
              [3, c.rock3],
              [11, c.rock4],
            ].map(([dy, fill]) => {
              const y0 = y + (dy as number);
              const w = clip(dy as number);
              return (
                <Path
                  key={String(dy)}
                  d={`M ${x - w} ${y0} L ${x + w} ${y0} L ${x + w} ${y0 + 5} L ${x - w} ${y0 + 5} Z`}
                  fill={fill as string}
                />
              );
            })}
          </G>,
        );
      case 'metamorphic':
        return ring(
          c.rock3,
          <G>
            {[-12, -4, 4, 12].map((dy, i) => (
              <Path
                key={dy}
                d={`M ${x - clip(dy)} ${y + dy} C ${x - 8} ${y + dy - 6} ${x + 2} ${y + dy + 6} ${x + clip(dy)} ${y + dy - 2}`}
                stroke={i % 2 ? c.rock5 : c.chartInk}
                strokeOpacity={i % 2 ? 0.9 : 0.55}
                strokeWidth={3}
                fill="none"
              />
            ))}
          </G>,
        );
      case 'magma':
        return ring(url(ids.magma));
      case 'igneous':
        return ring(
          c.rock6,
          <G>
            {[
              [-9, -8, c.chartInk],
              [4, -11, c.snow],
              [10, -3, c.chartInk],
              [-12, 3, c.snow],
              [-2, 1, c.chartInk],
              [7, 8, c.snow],
              [-6, 11, c.chartInk],
              [13, 6, c.chartInk],
              [0, -4, c.snow],
            ].map(([dx, dy, fill]) => (
              <Path
                key={`${dx}${dy}`}
                d={`M ${x + (dx as number)} ${y + (dy as number) - 2} l 2.2 1.6 l -0.8 2.4 l -2.8 0 l -0.8 -2.4 z`}
                fill={fill as string}
                opacity={0.75}
              />
            ))}
          </G>,
        );
    }
  };

  const steps = STEPS.map((s) => ({ s, pts: route(s), lit: s.process === on }));
  const name = {
    melting: 'melting',
    cooling: 'cooling',
    weathering: 'weathering',
    deposition: 'deposition',
    metamorphism: 'heat and pressure',
    uplift: 'uplift',
  }[on];

  return (
    <Board height={H}>
      <Defs>
        <RadialGradient id={ids.magma} cx="0.45" cy="0.4" r="0.6">
          <Stop offset="0" stopColor={c.sunDisk} />
          <Stop offset="0.5" stopColor={c.orange} />
          <Stop offset="1" stopColor={c.mercury} />
        </RadialGradient>
        <RadialGradient id={ids.round} cx="0.35" cy="0.3" r="0.8" fx="0.3" fy="0.25">
          <Stop offset="0" stopColor={c.shine} stopOpacity={0.4 * c.sheen} />
          <Stop offset="0.55" stopColor={c.shine} stopOpacity={0} />
          <Stop offset="1" stopColor={c.shade} stopOpacity={0.2} />
        </RadialGradient>
        <Ball id={ids.sun} color={c.sunDisk} />
        <RadialGradient id={ids.flame} cx="0.5" cy="0.7" r="0.6">
          <Stop offset="0" stopColor={c.sunDisk} />
          <Stop offset="0.6" stopColor={c.orange} />
          <Stop offset="1" stopColor={c.mercury} />
        </RadialGradient>
      </Defs>
      {/* What drives the step, in the middle of the ring. */}
      <G transform="translate(0 -20)">
        {heat ? (
          <Path
            d={`M ${CX - 14} ${CY + 2} C ${CX - 16} ${CY - 10} ${CX - 6} ${CY - 14} ${CX - 6} ${CY - 26} C ${CX + 4} ${CY - 18} ${CX + 2} ${CY - 12} ${CX + 6} ${CY - 8} C ${CX + 8} ${CY - 14} ${CX + 12} ${CY - 16} ${CX + 12} ${CY - 20} C ${CX + 20} ${CY - 8} ${CX + 18} ${CY + 2} ${CX + 12} ${CY + 8} C ${CX + 4} ${CY + 14} ${CX - 8} ${CY + 12} ${CX - 14} ${CY + 2} Z`}
            fill={url(ids.flame)}
            stroke={c.mercury}
            strokeWidth={1}
          />
        ) : (
          <G>
            <SunDisk x={CX - 8} y={CY - 10} r={10} ball={ids.sun} c={c} />
            <Path
              d={`M ${CX + 16} ${CY - 20} L ${CX + 16} ${CY + 6} M ${CX + 10} ${CY} L ${CX + 16} ${CY + 7} L ${CX + 22} ${CY}`}
              stroke={c.chartInk}
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </G>
        )}
      </G>
      {(heat ? ['Earth’s', 'inner heat'] : ['sun and', 'gravity']).map((line, i) => (
        <ChartText
          key={line}
          x={CX + 2}
          y={CY + 10 + i * 15}
          fontSize={chart.value}
          fontWeight="600"
          textAnchor="middle"
          fill={c.chartInk}
        >
          {line}
        </ChartText>
      ))}
      {steps
        .filter((x) => !x.lit)
        .map(({ s, pts }, i) => (
          <StepPath key={`o${i}`} pts={pts} on={false} c={c} />
        ))}
      {steps
        .filter((x) => x.lit)
        .map(({ s, pts }, i) => (
          <StepPath key={`l${s.from}${i}`} pts={pts} on c={c} />
        ))}
      {(Object.keys(STATIONS) as Station[]).map((s) => {
        const [x, y] = at(STATIONS[s].deg);
        const { lines, side } = STATIONS[s];
        const lit = steps.some((t) => t.lit && (t.s.from === s || t.s.to === s));
        const tx = side === 'right' ? x + R + 8 : side === 'left' ? x - R - 8 : x;
        const ty =
          side === 'top'
            ? y - R - 10 - (lines.length - 1) * 15
            : side === 'bottom'
              ? y + R + 18
              : y + 5 - ((lines.length - 1) * 15) / 2;
        return (
          <G key={s}>
            {lit ? (
              <Circle
                cx={x}
                cy={y}
                r={R + 4}
                fill="none"
                stroke={c.chartHighlight}
                strokeWidth={2.5}
              />
            ) : null}
            {swatch(s, x, y)}
            {lines.map((line, i) => (
              <ChartText
                key={line}
                x={tx}
                y={ty + i * 15}
                fontSize={chart.value}
                fontWeight="700"
                textAnchor={side === 'right' ? 'start' : side === 'left' ? 'end' : 'middle'}
                fill={c.chartInk}
              >
                {line}
              </ChartText>
            ))}
          </G>
        );
      })}
      <Chip x={BOARD_W - 8 - chipW(name, chart.value, true) / 2} y={H - 18} text={name} c={c} lit />
    </Board>
  );
}

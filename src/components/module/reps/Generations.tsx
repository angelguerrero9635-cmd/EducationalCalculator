import { useRef } from 'react';
import { View } from 'react-native';
import Svg, { Defs, Ellipse, G, Line, Path, Rect } from 'react-native-svg';

import type { Representation } from '@/data/modules';
import type { BeetleColor } from '@/data/modules/typesLife';
import { formatNumber } from '@/engine/format';
import { chart, usePalette, type Palette } from '@/theme';

import type { Calculator } from '../useCalculator';
import {
  Canvas,
  Caption,
  ChartText,
  DragHandle,
  fitLabel,
  niceCeil,
  useFrozen,
  useRep,
} from './common';
import { Ball, url, usePaintIds } from './paint';

type Spec = Extract<Representation, { kind: 'generations' }>;

/** The most generations drawn side by side. */
export const GENERATIONS_MAX = 8;

/** A beetle's shell color, and the ink that reads on it. */
export const beetleColor = (c: Palette, color: BeetleColor) =>
  ({
    green: c.frogSkin,
    brown: c.feather,
    black: c.rubber,
    yellow: c.sunDisk,
    red: c.blockRed,
  })[color];
const inkOn = (c: Palette, color: BeetleColor) => (color === 'yellow' ? c.coinInk : c.onBlock);

/**
 * A population over generations: a stacked bar per generation, one segment per variety
 * (green and brown beetles), the followed variety at the bottom so its share is read as it
 * grows or shrinks. Counts are written in the segments and the share over each bar; a
 * painted beetle of each color keys the bars. Drag the first generation's split.
 */
export function Generations({ spec, calc }: { spec: Spec; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  const start = useRef(0);
  const rows = spec.counts.slice(0, GENERATIONS_MAX);
  const kinds = rows[0]?.length ?? 0;
  const colors: BeetleColor[] = spec.colors ?? ['green', 'brown', 'black'];
  const names = Array.from(
    { length: kinds },
    (_, k) => spec.names?.[k] ?? `${colors[k] ?? 'other'} beetles`,
  );
  const follow = Math.min(spec.follow ?? 0, Math.max(0, kinds - 1));
  // Bottom-up order of the segments: the followed variety first.
  const order = [follow, ...Array.from({ length: kinds }, (_, k) => k).filter((k) => k !== follow)];
  const ids = usePaintIds('b0', 'b1', 'b2');
  const ball = [ids.b0, ids.b1, ids.b2];
  const count = (id: string) => (rep.known(id) ? Math.max(0, rep.shown(id)) : 0);
  const totals = rows.map((row) => row.reduce((s, id) => s + count(id), 0));
  const top = useFrozen(niceCeil(Math.max(1, ...totals)));
  const first = rows[0]?.[follow];
  const draggable = first !== undefined && !rep.variable(first).derived;
  const share = (g: number) => {
    const row = rows[g]!;
    if (!row.every(rep.known) || totals[g]! <= 0) return undefined;
    return (count(row[follow]!) / totals[g]!) * 100;
  };
  const label = spec.label ?? 'Generation';

  return (
    <View>
      <Canvas aspect={0.78}>
        {({ w, h }) => {
          const legendH = 34;
          const axis = 34;
          const plotTop = legendH + 20;
          const plotBottom = h - 38;
          const plotH = plotBottom - plotTop;
          const slot = (w - axis - 8) / rows.length;
          const barW = Math.min(46, slot * 0.64);
          const cx = (g: number) => axis + slot * (g + 0.5);
          const sy = (x: number) => plotBottom - (Math.min(x, top.value) / top.value) * plotH;
          const every = niceCeil(top.value / 5);
          const marks = Array.from(
            { length: Math.floor(top.value / every + 1e-9) + 1 },
            (_, i) => i * every,
          );
          const legendSlot = w / kinds;
          return (
            <>
              <Svg width={w} height={h}>
                <Defs>
                  {colors.slice(0, 3).map((col, k) => (
                    <Ball key={k} id={ball[k]!} color={beetleColor(c, col)} />
                  ))}
                </Defs>
                {names.map((name, k) => {
                  const x = legendSlot * (k + 0.5);
                  const text = name;
                  const tw = text.length * chart.small * 0.58;
                  return (
                    <G key={name}>
                      <Beetle
                        x={x - tw / 2 - 14}
                        y={legendH / 2}
                        size={26}
                        fill={url(ball[k]!)}
                        c={c}
                      />
                      <ChartText x={x - tw / 2 + 2} y={legendH / 2 + 4} fontSize={chart.small}>
                        {text}
                      </ChartText>
                    </G>
                  );
                })}
                {marks.map((m) => (
                  <G key={m}>
                    <Line
                      x1={axis}
                      y1={sy(m)}
                      x2={w - 4}
                      y2={sy(m)}
                      stroke={m === 0 ? c.chartInk : c.chartGrid}
                      strokeWidth={m === 0 ? chart.strokeLight : 0.75}
                    />
                    <ChartText
                      x={axis - 5}
                      y={sy(m) + 4}
                      fontSize={chart.small}
                      fill={c.chartMuted}
                      textAnchor="end"
                    >
                      {formatNumber(m)}
                    </ChartText>
                  </G>
                ))}
                {rows.map((row, g) => {
                  let base = 0;
                  const known = row.every(rep.known);
                  const p = share(g);
                  return (
                    <G key={g}>
                      {order.map((k) => {
                        const id = row[k]!;
                        const n = count(id);
                        const y0 = sy(base);
                        base += n;
                        const y1 = sy(base);
                        const col = colors[k] ?? 'green';
                        if (n <= 0 && rep.known(id)) return null;
                        return (
                          <G key={id} opacity={rep.known(id) ? 1 : 0.35}>
                            <Rect
                              x={cx(g) - barW / 2}
                              y={y1}
                              width={barW}
                              height={Math.max(rep.known(id) ? 1 : 0, y0 - y1)}
                              fill={beetleColor(c, col)}
                              stroke={c.chartInk}
                              strokeWidth={1}
                            />
                            {y0 - y1 >= 15 ? (
                              <ChartText
                                x={cx(g)}
                                y={(y0 + y1) / 2 + 4}
                                fontSize={chart.small}
                                fontWeight="700"
                                textAnchor="middle"
                                fill={inkOn(c, col)}
                              >
                                {formatNumber(n)}
                              </ChartText>
                            ) : null}
                          </G>
                        );
                      })}
                      {!known ? (
                        <ChartText
                          x={cx(g)}
                          y={sy(base) - 6}
                          fontSize={chart.small}
                          textAnchor="middle"
                          fill={c.chartMuted}
                        >
                          ?
                        </ChartText>
                      ) : p !== undefined ? (
                        <ChartText
                          {...fitLabel(cx(g), `${formatNumber(Math.round(p))}%`, chart.small, w)}
                          y={sy(base) - 6}
                          fontSize={chart.small}
                          fontWeight="700"
                        >
                          {`${formatNumber(Math.round(p))}%`}
                        </ChartText>
                      ) : null}
                      <ChartText
                        x={cx(g)}
                        y={plotBottom + 15}
                        fontSize={chart.small}
                        textAnchor="middle"
                      >
                        {String(g + 1)}
                      </ChartText>
                    </G>
                  );
                })}
                <ChartText
                  x={axis + (w - axis) / 2}
                  y={h - 6}
                  fontSize={chart.small}
                  textAnchor="middle"
                  fill={c.chartMuted}
                >
                  {label}
                </ChartText>
              </Svg>
              {draggable && first ? (
                <DragHandle
                  testID={`drag-${first}`}
                  x={cx(0) + barW / 2}
                  y={sy(count(first))}
                  label={rep.variable(first).name}
                  onStart={() => {
                    start.current = count(first);
                    top.freeze();
                  }}
                  onEnd={top.release}
                  onMove={(_, dy) =>
                    calc.set(
                      {
                        [first]: rep.snapTo(
                          first,
                          Math.max(0, start.current - (dy / plotH) * top.value) * rep.factor(first),
                        ),
                      },
                      rep.slide(first),
                    )
                  }
                />
              ) : null}
            </>
          );
        }}
      </Canvas>
      <Caption>
        {[
          `${cap(names[follow] ?? '')}: ${rows.map((row) => rep.value(row[follow]!)).join(', ')}`,
          `In all: ${rows.map((row, g) => (row.every(rep.known) ? formatNumber(totals[g]!) : '?')).join(', ')}`,
          `Share of all: ${rows
            .map((_, g) => {
              const p = share(g);
              return p === undefined ? '?' : `${formatNumber(Math.round(p * 10) / 10)}%`;
            })
            .join(', ')}`,
        ].join(' · ')}
      </Caption>
    </View>
  );
}

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/**
 * A beetle seen from above, head up, about `size` long: six legs and two feelers in black,
 * the head and the plate behind it darker, and the shell (two wing covers split down the
 * middle) in its color, lit from the top left.
 */
export function Beetle({
  x,
  y,
  size,
  fill,
  c,
}: {
  x: number;
  y: number;
  size: number;
  /** The shell: a `Ball` gradient url in the beetle's color. */
  fill: string;
  c: Palette;
}) {
  const s = size / 22;
  return (
    <G transform={`translate(${x} ${y}) scale(${s})`}>
      {[-3, 1.5, 6].map((ly, i) => (
        <G key={i}>
          <Path
            d={`M -4 ${ly} L -9 ${ly - 2 + i * 2} L -10.5 ${ly + 1 + i * 2}`}
            stroke={c.rubber}
            strokeWidth={1.1}
            fill="none"
            strokeLinejoin="round"
          />
          <Path
            d={`M 4 ${ly} L 9 ${ly - 2 + i * 2} L 10.5 ${ly + 1 + i * 2}`}
            stroke={c.rubber}
            strokeWidth={1.1}
            fill="none"
            strokeLinejoin="round"
          />
        </G>
      ))}
      <Path
        d="M -1.5 -9 C -3 -12 -4 -13 -6 -13.5 M 1.5 -9 C 3 -12 4 -13 6 -13.5"
        stroke={c.rubber}
        strokeWidth={0.9}
        fill="none"
      />
      <Ellipse cx={0} cy={-8.5} rx={2.8} ry={2.2} fill={c.rubber} />
      <Ellipse cx={0} cy={-5} rx={5} ry={2.6} fill={fill} stroke={c.rubber} strokeWidth={0.6} />
      <Ellipse cx={0} cy={-5} rx={5} ry={2.6} fill={c.shade} opacity={0.25} />
      <Ellipse cx={0} cy={3} rx={6.2} ry={8} fill={fill} stroke={c.rubber} strokeWidth={0.7} />
      <Line x1={0} y1={-2.4} x2={0} y2={10.8} stroke={c.rubber} strokeWidth={0.7} />
      <Ellipse cx={-2.6} cy={0} rx={1.4} ry={3} fill={c.shine} opacity={0.35} />
    </G>
  );
}

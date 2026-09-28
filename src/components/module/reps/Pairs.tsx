import { View } from 'react-native';
import Svg, { Circle, Defs, G, Rect } from 'react-native-svg';

import type { Representation } from '@/data/modules';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Ball, BoxShadow, TopLight, url, usePaintIds } from './paint';
import { Canvas, ChartText, useRep, Caption } from './common';
import { Steppers } from './Steppers';

type Spec = Extract<Representation, { kind: 'pairs' }>;

/** Trays in a row before wrapping, the tray's padding, and the label line under each tray. */
const PER_ROW = 6;
const PAD = 5;
const LABEL_H = 24;
const ROW_GAP = 12;

/**
 * Objects put into pairs: each pair sits in a two-cell plastic tray, numbered 1, 2, 3 … under
 * it. An odd number leaves one counter in a tray whose other cell is empty (dashed), tagged
 * "left over": no partner is something you can see, not a colour code.
 */
export function Pairs({ spec, calc }: { spec: Spec; calc: Calculator }) {
  const c = usePalette();
  const ids = usePaintIds('ball', 'tray');
  const rep = useRep(calc);
  const n = Math.max(0, Math.round(rep.shown(spec.value)));
  const pairs = Math.floor(n / 2);
  const odd = n % 2 === 1;
  const trays = pairs + (odd ? 1 : 0);
  const rows = Math.max(1, Math.ceil(trays / PER_ROW));
  const perRow = Math.min(PER_ROW, Math.max(1, trays));
  // Counters as big as the width allows (up to 34 px), the same in every row.
  const sizeOf = (w: number) => Math.min(34, (w - 16) / perRow - 2 * PAD - 12);
  const trayH = (s: number) => 2 * (s + 6) + 2 * PAD;
  const heightOf = (w: number) => rows * (trayH(sizeOf(w)) + LABEL_H) + (rows - 1) * ROW_GAP + 8;

  return (
    <View>
      <Canvas aspect={(w) => heightOf(w) / w}>
        {({ w, h }) => {
          const s = sizeOf(w);
          const cell = s + 6;
          const tw = cell + 2 * PAD;
          const th = trayH(s);
          const pitch = (w - 16) / perRow;
          const tray = (t: number) => {
            const row = Math.floor(t / PER_ROW);
            // Each row centred; a short last row lines up under the first row's trays.
            const x = w / 2 - ((perRow - 1) * pitch) / 2 + (t % PER_ROW) * pitch - tw / 2;
            const y = 4 + row * (th + LABEL_H + ROW_GAP);
            const lonely = odd && t === trays - 1;
            const slot = (k: number) => {
              const cx = x + PAD + cell / 2;
              const cy = y + PAD + cell / 2 + k * cell;
              const empty = lonely && k === 1;
              return (
                <G key={k}>
                  {/* A recessed cell. */}
                  <Rect
                    x={cx - cell / 2 + 1}
                    y={cy - cell / 2 + 1}
                    width={cell - 2}
                    height={cell - 2}
                    rx={cell / 2}
                    fill={c.shade}
                    fillOpacity={0.1}
                    stroke={empty ? c.chartMuted : c.edgeShade}
                    strokeDasharray={empty ? chart.dashFine : undefined}
                    strokeWidth={empty ? chart.strokeLight : 1}
                  />
                  {empty ? null : (
                    <G>
                      <Circle cx={cx + 1.5} cy={cy + 2} r={s / 2} fill={c.shadow} />
                      <Circle
                        cx={cx}
                        cy={cy}
                        r={s / 2}
                        fill={url(ids.ball)}
                        stroke={c.chartInk}
                        strokeOpacity={0.6}
                        strokeWidth={1.2}
                      />
                    </G>
                  )}
                </G>
              );
            };
            return (
              <G key={t}>
                <BoxShadow x={x} y={y} width={tw} height={th} r={12} />
                <Rect
                  x={x}
                  y={y}
                  width={tw}
                  height={th}
                  rx={12}
                  fill={c.plastic}
                  stroke={c.glassEdge}
                />
                <Rect x={x} y={y} width={tw} height={th} rx={12} fill={url(ids.tray)} />
                <Rect
                  x={x + 1.5}
                  y={y + 1.5}
                  width={tw - 3}
                  height={th - 3}
                  rx={10.5}
                  fill="none"
                  stroke={c.edgeLight}
                />
                {slot(0)}
                {slot(1)}
                <ChartText
                  x={x + tw / 2}
                  y={y + th + 18}
                  textAnchor="middle"
                  fontSize={lonely ? chart.value : chart.emphasis}
                  fontWeight={lonely ? '600' : '700'}
                  fill={lonely ? c.chartMuted : c.chartInk}
                >
                  {lonely ? 'left over' : String(t + 1)}
                </ChartText>
              </G>
            );
          };
          return (
            <Svg
              width={w}
              height={h}
              accessibilityLabel={`${pairs} ${pairs === 1 ? 'pair' : 'pairs'}${odd ? ' and 1 left over' : ''}`}
            >
              <Defs>
                <Ball id={ids.ball} color={c.chartSecond} />
                <TopLight id={ids.tray} />
              </Defs>
              {Array.from({ length: trays }, (_, t) => tray(t))}
            </Svg>
          );
        }}
      </Canvas>
      <Caption>{`${rep.words ? '' : `${rep.variable(spec.value).symbol} = `}${n} is ${odd ? 'odd' : 'even'}: ${pairs} ${pairs === 1 ? 'pair' : 'pairs'}${odd ? ' and 1 left over' : ', none left over'}`}</Caption>
      <Steppers calc={calc} items={[{ var: spec.value, steps: [1], pin: [] }]} />
    </View>
  );
}

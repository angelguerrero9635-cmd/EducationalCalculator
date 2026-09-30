/**
 * H109 `neuron` (see `NeuronSpec` in typesHs3d.ts): a motor neuron across the picture, its
 * dendrites and cell body on the left, the axon, and its terminals on a striped muscle fiber on
 * the right. Under the axon, a distance scale from the cell body (0) to the terminals (the
 * length) and a time scale (0 to the time) share quarter marks: the impulse is at each mark's
 * distance at that mark's time. Myelinated (3 m/s or faster): sheaths with nodes between, the
 * impulse drawn hopping node to node; bare (slower): the impulse a creeping wave. Flat, like a
 * textbook diagram; values typed, no handles.
 */
import Svg, { Circle, G, Line, Path, Rect } from 'react-native-svg';

import { MYELIN_SPEED, type NeuronSpec } from '@/data/modules/typesHs3d';
import { formatNumber } from '@/engine/format';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { HaloText } from '../layouts/earthKit';
import { Canvas, Caption, ChartText, useRep } from './common';

const W = 360;
const H = 206;
const AX0 = 74;
const AX1 = 300;
const AXY = 58;
const DIST_Y = 126;
const TIME_Y = 176;

/** Quarter marks along the axon. */
const MARKS = [0, 0.25, 0.5, 0.75, 1];

export function Neuron({ spec, calc }: { spec: NeuronSpec; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  const num = (x: string | number | undefined) =>
    x === undefined ? undefined : typeof x === 'number' ? x : rep.known(x) ? rep.val(x) : undefined;
  const d = num(spec.length);
  const v = num(spec.speed);
  const t = spec.time === undefined ? (d && v ? (1000 * d) / v : undefined) : num(spec.time);
  const myelin = spec.myelin ?? (v === undefined ? true : v >= MYELIN_SPEED);
  const xOf = (f: number) => AX0 + f * (AX1 - AX0);
  const nodes = 7;
  const seg = (AX1 - AX0) / nodes;
  const tick = (x: number | undefined, f: number) =>
    x === undefined ? '?' : formatNumber(Math.round(x * f * 1000) / 1000);

  return (
    <>
      <Canvas aspect={H / W}>
        {({ w, h }) => (
          <Svg width={w} height={h}>
            <G transform={`scale(${w / W})`}>
              {/* Dendrites and the cell body with its nucleus. */}
              {[
                'M 40 58 L 14 34 M 26 46 L 20 26',
                'M 40 58 L 10 60 M 22 59 L 8 72',
                'M 40 58 L 16 86 M 28 72 L 30 94',
                'M 44 50 L 40 18',
              ].map((dd, k) => (
                <Path
                  key={k}
                  d={dd}
                  stroke={c.neuronCell}
                  strokeWidth={3}
                  strokeLinecap="round"
                  fill="none"
                />
              ))}
              <Path
                d={`M 26 58 C 26 38, 58 36, 62 52 L ${AX0} ${AXY - 3} L ${AX0} ${AXY + 3} L 62 64 C 58 80, 26 78, 26 58 Z`}
                fill={c.neuronCell}
                stroke={c.chartInk}
                strokeWidth={1}
              />
              <Circle cx={43} cy={58} r={8} fill={c.card} stroke={c.chartInk} strokeWidth={1} />
              {/* The axon, bare or in its myelin sheaths. */}
              <Line x1={AX0} y1={AXY} x2={AX1 + 4} y2={AXY} stroke={c.neuronCell} strokeWidth={5} />
              {myelin
                ? Array.from({ length: nodes }, (_, k) => (
                    <Rect
                      key={k}
                      x={AX0 + k * seg + 2}
                      y={AXY - 8}
                      width={seg - 4}
                      height={16}
                      rx={7}
                      fill={c.neuronMyelin}
                      stroke={c.chartInk}
                      strokeWidth={0.8}
                    />
                  ))
                : null}
              {/* Terminals on a muscle fiber. */}
              {[-14, 0, 14].map((dy) => (
                <G key={dy}>
                  <Path
                    d={`M ${AX1 + 2} ${AXY} Q ${AX1 + 14} ${AXY + dy / 2}, ${AX1 + 22} ${AXY + dy}`}
                    stroke={c.neuronCell}
                    strokeWidth={3}
                    fill="none"
                  />
                  <Circle cx={AX1 + 24} cy={AXY + dy} r={3.5} fill={c.neuronCell} />
                </G>
              ))}
              <Rect
                x={AX1 + 28}
                y={AXY - 30}
                width={26}
                height={60}
                rx={5}
                fill={c.organDeep}
                opacity={0.85}
              />
              {[0, 1, 2, 3, 4, 5, 6].map((k) => (
                <Line
                  key={k}
                  x1={AX1 + 28}
                  x2={AX1 + 54}
                  y1={AXY - 24 + k * 8}
                  y2={AXY - 24 + k * 8}
                  stroke={c.organ}
                  strokeWidth={1.5}
                />
              ))}
              {/* The impulse: hops over the sheaths, or a wave along the bare axon. */}
              {myelin ? (
                Array.from({ length: nodes }, (_, k) => {
                  const x1 = AX0 + k * seg;
                  const x2 = x1 + seg;
                  return (
                    <Path
                      key={k}
                      d={`M ${x1} ${AXY - 10} Q ${(x1 + x2) / 2} ${AXY - 30}, ${x2} ${AXY - 10}`}
                      stroke={c.chartHighlight}
                      strokeWidth={2}
                      fill="none"
                    />
                  );
                })
              ) : (
                <Path
                  d={Array.from(
                    { length: 22 },
                    (_, k) =>
                      `${k ? 'L' : 'M'} ${AX0 + (k * (AX1 - AX0)) / 21} ${AXY - 10 - (k % 2 ? 5 : 0)}`,
                  ).join(' ')}
                  stroke={c.chartHighlight}
                  strokeWidth={2}
                  fill="none"
                />
              )}
              <ChartText
                x={(AX0 + AX1) / 2}
                y={16}
                fontSize={chart.label}
                fontWeight="700"
                textAnchor="middle"
                fill={c.chartHighlight}
              >
                {myelin
                  ? 'Myelin: the impulse jumps node to node'
                  : 'No myelin: the impulse creeps along'}
              </ChartText>
              <ChartText
                x={43}
                y={AXY + 44}
                fontSize={chart.label}
                fill={c.chartMuted}
                textAnchor="middle"
              >
                cell body
              </ChartText>
              <ChartText
                x={AX1 + 41}
                y={AXY + 46}
                fontSize={chart.label}
                fill={c.chartMuted}
                textAnchor="middle"
              >
                muscle
              </ChartText>
              {/* Dotted guides from the axon down through both scales. */}
              {MARKS.map((f) => (
                <Line
                  key={f}
                  x1={xOf(f)}
                  x2={xOf(f)}
                  y1={AXY + 12}
                  y2={TIME_Y - 6}
                  stroke={c.chartMuted}
                  strokeWidth={1}
                  strokeDasharray={chart.dashFine}
                  opacity={0.6}
                />
              ))}
              {/* The two scales, one mark for each quarter of the axon. */}
              {(
                [
                  [DIST_Y, 'Distance', '(m)', d],
                  [TIME_Y, 'Time', '(ms)', t],
                ] as const
              ).map(([y, name, unit, total]) => (
                <G key={name} opacity={total === undefined ? 0.45 : 1}>
                  <ChartText
                    x={AX0 - 10}
                    y={y + 2}
                    fontSize={chart.label}
                    fontWeight="700"
                    textAnchor="end"
                  >
                    {name}
                  </ChartText>
                  <ChartText
                    x={AX0 - 10}
                    y={y + 17}
                    fontSize={chart.label}
                    fill={c.chartMuted}
                    textAnchor="end"
                  >
                    {unit}
                  </ChartText>
                  <Line
                    x1={AX0}
                    x2={AX1}
                    y1={y}
                    y2={y}
                    stroke={c.chartInk}
                    strokeWidth={chart.stroke}
                  />
                  {MARKS.map((f) => (
                    <G key={f}>
                      <Line
                        x1={xOf(f)}
                        x2={xOf(f)}
                        y1={y - 5}
                        y2={y + 5}
                        stroke={c.chartInk}
                        strokeWidth={chart.stroke}
                      />
                      <HaloText
                        x={xOf(f)}
                        y={y + 19}
                        text={tick(total, f)}
                        c={c}
                        size={chart.label}
                        bold={f === 1}
                        halo={c.chartSurface}
                      />
                    </G>
                  ))}
                </G>
              ))}
            </G>
          </Svg>
        )}
      </Canvas>
      <Caption>
        {d !== undefined && v !== undefined && t !== undefined
          ? `The impulse runs ${formatNumber(d)} m at ${formatNumber(v)} m/s: 1,000 × ${formatNumber(d)} ÷ ${formatNumber(v)} = ${formatNumber(Math.round(t * 100) / 100)} ms. ${myelin ? 'The axon is myelinated, so the impulse jumps from node to node.' : 'Without myelin it moves along the whole membrane, slowly.'}`
          : 'Type the axon’s length and the speed to time the impulse.'}
      </Caption>
    </>
  );
}

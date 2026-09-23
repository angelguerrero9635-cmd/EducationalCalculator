import { useRef } from 'react';
import { StyleSheet } from 'react-native';
import Svg, { Line, Path } from 'react-native-svg';

import { Text } from '@/components/Text';
import type { Representation } from '@/data/modules';
import { chart, font, space, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, ChartText, DragHandle, useRep } from './common';

type Spec = Extract<Representation, { kind: 'seriesCircuit' }>;
/** Pixels of vertical drag per variable step. */
const PX_PER_STEP = 8;

const zigzag = (x: number, y: number, len: number) => {
  const n = 6;
  const seg = len / n;
  let d = `M ${x} ${y}`;
  for (let i = 0; i < n; i++) d += ` L ${x + seg * (i + 0.5)} ${y + (i % 2 ? 8 : -8)}`;
  return `${d} L ${x + len} ${y}`;
};

/**
 * A source driving current around one loop through resistors in series. Drag the source's
 * handle or a resistor up to increase it, down to decrease it.
 */
export function SeriesCircuit({ spec, calc }: { spec: Spec; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  const start = useRef(0);
  const resistorIds = spec.resistors.map((r) => r.r);

  const dragProps = (id: string, pin: string[]) => ({
    label: rep.variable(id).name,
    onStart: () => {
      start.current = rep.val(id);
    },
    onMove: (_: number, dy: number) => {
      const step = rep.variable(id).step ?? 0.5;
      calc.set({
        ...rep.pin(pin),
        [id]: rep.snapTo(id, start.current - (dy / PX_PER_STEP) * step),
      });
    },
  });

  return (
    <>
      <Canvas aspect={0.62}>
        {({ w, h }) => {
          const left = 48;
          const right = w - 24;
          const topY = 56;
          const botY = h - 40;
          const midY = (topY + botY) / 2;
          const n = spec.resistors.length;
          const span = (right - left) / n;
          const rLen = Math.min(70, span * 0.55);
          const rx = (i: number) => left + span * (i + 0.5) - rLen / 2;
          const stroke = { stroke: c.chartInk, strokeWidth: chart.stroke, fill: 'none' as const };
          const arrowX = (left + right) / 2;
          return (
            <>
              <Svg width={w} height={h}>
                {/* Loop wires; the left wire meets the battery plates. */}
                <Line x1={left} y1={topY} x2={left} y2={midY - 6} {...stroke} />
                <Line x1={left} y1={midY + 6} x2={left} y2={botY} {...stroke} />
                <Line x1={left} y1={botY} x2={right} y2={botY} {...stroke} />
                <Line x1={right} y1={botY} x2={right} y2={topY} {...stroke} />
                {spec.resistors.map((_, i) => (
                  <Line
                    key={`w${i}`}
                    x1={i === 0 ? left : rx(i - 1) + rLen}
                    y1={topY}
                    x2={rx(i)}
                    y2={topY}
                    {...stroke}
                  />
                ))}
                <Line x1={rx(n - 1) + rLen} y1={topY} x2={right} y2={topY} {...stroke} />

                {/* Battery: long plate (+) on top, short plate (−) below, with polarity marks. */}
                <Line x1={left - 16} y1={midY - 6} x2={left + 16} y2={midY - 6} {...stroke} />
                <Line
                  x1={left - 8}
                  y1={midY + 6}
                  x2={left + 8}
                  y2={midY + 6}
                  stroke={c.chartInk}
                  strokeWidth={chart.strokeHeavy}
                />
                <ChartText
                  x={left - 24}
                  y={midY - 3}
                  fontSize={chart.value}
                  fontWeight="700"
                  textAnchor="middle"
                >
                  +
                </ChartText>
                <ChartText
                  x={left - 24}
                  y={midY + 16}
                  fontSize={chart.value}
                  fontWeight="700"
                  textAnchor="middle"
                >
                  −
                </ChartText>
                <ChartText x={left + 52} y={midY + 5} fontSize={chart.value} fontWeight="600">
                  {rep.label(spec.source)}
                </ChartText>

                {/* Resistors: resistance above, voltage drop below. */}
                {spec.resistors.map((r, i) => [
                  <Path key={`r${i}`} d={zigzag(rx(i), topY, rLen)} {...stroke} />,
                  <ChartText
                    key={`rl${i}`}
                    x={rx(i) + rLen / 2}
                    y={topY - 18}
                    fontWeight="600"
                    textAnchor="middle"
                  >
                    {rep.label(r.r)}
                  </ChartText>,
                  <ChartText
                    key={`vl${i}`}
                    x={rx(i) + rLen / 2}
                    y={topY + 28}
                    fill={c.chartMuted}
                    textAnchor="middle"
                  >
                    {rep.label(r.v)}
                  </ChartText>,
                ])}

                {/* Conventional current: out of +, clockwise, so leftward on the bottom wire. */}
                <Path
                  d={`M ${arrowX - 7} ${botY} L ${arrowX + 7} ${botY - 6} M ${arrowX - 7} ${botY} L ${arrowX + 7} ${botY + 6}`}
                  stroke={c.chartInk}
                  strokeWidth={chart.stroke}
                />
                <ChartText
                  x={arrowX}
                  y={botY + 22}
                  fontSize={chart.value}
                  fontWeight="600"
                  textAnchor="middle"
                >
                  {rep.label(spec.current)}
                </ChartText>
              </Svg>
              <DragHandle
                testID="drag-source"
                x={left + 32}
                y={midY}
                {...dragProps(spec.source, resistorIds)}
              />
              {spec.resistors.map((r, i) => (
                <DragHandle
                  key={r.r}
                  testID={`drag-${r.r}`}
                  x={rx(i) + rLen / 2}
                  y={topY}
                  {...dragProps(r.r, [spec.source, ...resistorIds.filter((id) => id !== r.r)])}
                />
              ))}
            </>
          );
        }}
      </Canvas>
      <Text style={[styles.hint, { color: c.textMuted }]}>
        Drag the source’s handle or a resistor up or down to change it.
      </Text>
    </>
  );
}

const styles = StyleSheet.create({
  hint: { fontSize: font.caption + 1, textAlign: 'center', marginTop: space.sm },
});

import { useRef } from 'react';
import { StyleSheet } from 'react-native';
import { Text } from '@/components/Text';
import Svg, { Line, Rect } from 'react-native-svg';

import type { Representation } from '@/data/modules';
import { formatNumber } from '@/engine/format';
import { chart, font, space, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, ChartText, DragHandle, niceCeil, useFrozen, useRep } from './common';

type Spec = Extract<Representation, { kind: 'bars' }>;

export function Bars({ spec, calc }: { spec: Spec; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  const start = useRef(0);
  const editable = spec.bars.filter((b) => b.editable).map((b) => b.var);
  // Bars are drawn and labeled in the shown unit.
  const shown = spec.bars.map((b) => rep.shown(b.var));
  const lowest = Math.min(0, ...shown);
  const highest = Math.max(0, ...shown);
  // Range grows (to a round number) to fit the values; frozen while a bar is dragged.
  const range = useFrozen({
    min: lowest < spec.min ? -niceCeil(-lowest) : spec.min,
    max: highest > spec.max ? niceCeil(highest) : spec.max,
  });

  return (
    <>
      <Canvas aspect={0.65}>
        {({ w, h }) => {
          const top = 30;
          const bottom = 36;
          const plotH = h - top - bottom;
          const { min, max } = range.value;
          const scale = plotH / (max - min);
          const sy = (v: number) => top + (max - Math.min(max, Math.max(min, v))) * scale;
          // Room on the left for the numbered scale, when there is one.
          const axis = spec.scale ? 30 : 0;
          const slot = (w - 16 - axis) / spec.bars.length;
          const barW = Math.min(56, slot * 0.6);
          const cx = (i: number) => 8 + axis + slot * (i + 0.5);
          // Every `scale`, or every 2 × scale when the range grows past 10 marks.
          const every = spec.scale ? spec.scale * ((max - min) / spec.scale > 10 ? 2 : 1) : 0;
          const marks = every
            ? Array.from({ length: Math.floor((max - min) / every) + 1 }, (_, i) => min + i * every)
            : [];
          return (
            <>
              <Svg width={w} height={h}>
                {marks.map((m) => [
                  <Line
                    key={`g${m}`}
                    x1={axis}
                    y1={sy(m)}
                    x2={w - 4}
                    y2={sy(m)}
                    stroke={c.chartGrid}
                    strokeWidth={chart.strokeLight}
                  />,
                  <ChartText
                    key={`s${m}`}
                    x={axis - 6}
                    y={sy(m) + 4}
                    fontSize={chart.small}
                    fill={c.chartMuted}
                    textAnchor="end"
                  >
                    {formatNumber(m)}
                  </ChartText>,
                ])}
                <Line
                  // Starts at the scale so the 0 label isn't struck through.
                  x1={axis || 4}
                  y1={sy(0)}
                  x2={w - 4}
                  y2={sy(0)}
                  stroke={c.chartInk}
                  strokeWidth={chart.strokeLight}
                />
                {spec.bars.map((b, i) => {
                  const v = rep.shown(b.var);
                  const y0 = sy(0);
                  const y1 = sy(v);
                  const known = rep.known(b.var);
                  return (
                    <Rect
                      key={b.var}
                      x={cx(i) - barW / 2}
                      y={Math.min(y0, y1)}
                      width={barW}
                      height={Math.max(1, Math.abs(y1 - y0))}
                      fill={b.editable ? c.chartFill : c.chartSurface}
                      stroke={c.chartInk}
                      strokeDasharray={b.editable ? undefined : chart.dash}
                      opacity={known ? 1 : 0.35}
                    />
                  );
                })}
                {spec.bars.map((b, i) => {
                  const v = rep.shown(b.var);
                  const variable = rep.variable(b.var);
                  return [
                    <ChartText
                      key={`v${b.var}`}
                      x={cx(i)}
                      // Editable bars have a drag handle on top; keep the value clear of it.
                      y={v >= 0 ? sy(v) - (b.editable ? 20 : 6) : sy(v) + (b.editable ? 28 : 14)}
                      fontSize={chart.label}
                      fontWeight="600"
                      fill={c.chartInk}
                      textAnchor="middle"
                    >
                      {rep.known(b.var) ? formatNumber(v, variable) : '?'}
                    </ChartText>,
                    <ChartText
                      key={`l${b.var}`}
                      x={cx(i)}
                      y={h - bottom + 16}
                      fontSize={chart.small}
                      fill={c.chartMuted}
                      textAnchor="middle"
                    >
                      {variable.symbol}
                    </ChartText>,
                    spec.bars.length <= 5 && (
                      <ChartText
                        key={`n${b.var}`}
                        x={cx(i)}
                        y={h - bottom + 30}
                        fontSize={chart.small}
                        fill={c.chartMuted}
                        textAnchor="middle"
                      >
                        {variable.name}
                      </ChartText>
                    ),
                  ];
                })}
              </Svg>
              {spec.bars.map((b, i) =>
                b.editable ? (
                  <DragHandle
                    key={b.var}
                    testID={`drag-${b.var}`}
                    x={cx(i)}
                    y={sy(rep.shown(b.var))}
                    label={rep.variable(b.var).name}
                    onStart={() => {
                      start.current = rep.shown(b.var);
                      range.freeze();
                    }}
                    onEnd={range.release}
                    onMove={(_, dy) =>
                      calc.set({
                        ...rep.pin(editable.filter((id) => id !== b.var)),
                        [b.var]: rep.snapTo(
                          b.var,
                          (start.current - dy / scale) * rep.factor(b.var),
                        ),
                      })
                    }
                  />
                ) : null,
              )}
            </>
          );
        }}
      </Canvas>
      {spec.total ? (
        <Text style={[styles.caption, { color: c.chartInk }]}>
          {`${rep.variable(spec.total).name}: ${rep.label(spec.total)}`}
        </Text>
      ) : null}
    </>
  );
}

const styles = StyleSheet.create({
  caption: { fontSize: font.body, textAlign: 'center', marginTop: space.sm, fontWeight: '600' },
});

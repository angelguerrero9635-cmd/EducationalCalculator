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
  const step =
    typeof spec.scale === 'string'
      ? rep.known(spec.scale)
        ? Math.max(1, rep.shown(spec.scale))
        : 1
      : spec.scale;
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
          // Room under the axis for the names, clear of a handle resting at 0.
          const bottom = 44;
          const plotH = h - top - bottom;
          // A line every `scale` step; numbers every 1, 2, 5 or 10 steps, whichever gives at
          // most 10 numbers. The top is rounded up to the next number, so the tallest bar (50
          // with steps of 2) always sits on the scale.
          const k = step
            ? ([1, 2, 5, 10, 20, 50].find(
                (n) => (range.value.max - range.value.min) / (step * n) <= 10,
              ) ?? 100)
            : 0;
          const every = (step ?? 0) * k;
          const min = range.value.min;
          const max = every
            ? Math.ceil((range.value.max - min) / every) * every + min
            : range.value.max;
          const scale = plotH / (max - min);
          const sy = (v: number) => top + (max - Math.min(max, Math.max(min, v))) * scale;
          // Room on the left for the numbered scale, when there is one.
          const axis = step ? 30 : 0;
          const slot = (w - 16 - axis) / spec.bars.length;
          const barW = Math.min(56, slot * 0.6);
          const cx = (i: number) => 8 + axis + slot * (i + 0.5);
          const lines =
            step && (max - min) / step <= 60
              ? Array.from({ length: Math.round((max - min) / step) + 1 }, (_, i) => min + i * step)
              : [];
          const marks = every
            ? Array.from({ length: Math.round((max - min) / every) + 1 }, (_, i) => min + i * every)
            : [];
          return (
            <>
              <Svg width={w} height={h}>
                {lines.map((m) => (
                  <Line
                    key={`g${m}`}
                    x1={axis}
                    y1={sy(m)}
                    x2={w - 4}
                    y2={sy(m)}
                    stroke={c.chartGrid}
                    strokeWidth={marks.includes(m) ? chart.strokeLight : 0.75}
                  />
                ))}
                {marks.map((m) => (
                  <ChartText
                    key={`s${m}`}
                    x={axis - 6}
                    y={sy(m) + 4}
                    fontSize={chart.small}
                    fill={c.chartMuted}
                    textAnchor="end"
                  >
                    {formatNumber(m)}
                  </ChartText>
                ))}
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
                      fill={b.editable ? c.chartHighlight : c.chartSurface}
                      fillOpacity={b.editable ? 0.85 : 1}
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
                    !(spec.readScale && rep.known(b.var)) && (
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
                      </ChartText>
                    ),
                    <ChartText
                      key={`l${b.var}`}
                      x={cx(i)}
                      y={h - bottom + 24}
                      fontSize={chart.small}
                      fill={c.chartMuted}
                      textAnchor="middle"
                    >
                      {rep.words ? variable.name : variable.symbol}
                    </ChartText>,
                    !rep.words && spec.bars.length <= 5 && (
                      <ChartText
                        key={`n${b.var}`}
                        x={cx(i)}
                        y={h - bottom + 38}
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
                      calc.set(
                        {
                          ...rep.pin(editable.filter((id) => id !== b.var)),
                          [b.var]: rep.snapTo(
                            b.var,
                            (start.current - dy / scale) * rep.factor(b.var),
                          ),
                        },
                        rep.slide(b.var),
                      )
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

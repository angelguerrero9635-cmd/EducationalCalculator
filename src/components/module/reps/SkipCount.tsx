import { useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Line, Path } from 'react-native-svg';

import { Text } from '@/components/Text';
import type { Representation } from '@/data/modules';
import { formatNumber } from '@/engine/format';
import { chart, font, space, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, ChartText, DragHandle, niceCeil, useFrozen, useRep, Caption } from './common';
import { Steppers } from './Steppers';

type Spec = Extract<Representation, { kind: 'skipCount' }>;

/**
 * A number line from the start number (0 unless `start` is set) with equal jumps of `step`.
 * Drag the end to add or remove jumps.
 */
export function SkipCount({ spec, calc }: { spec: Spec; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  const start = useRef(0);
  // A number keeps the jump size fixed (1 meter = 100 cm).
  const stepVar = typeof spec.step === 'string' ? spec.step : undefined;
  const s = Math.max(1, Math.round(stepVar ? rep.shown(stepVar) : (spec.step as number)));
  const k = Math.max(0, Math.round(rep.shown(spec.count)));
  const from = spec.start && rep.known(spec.start) ? Math.round(rep.shown(spec.start)) : 0;
  // Room for 10 jumps, so the 11 labeled ticks fall where the jumps land (0, 4, 8, … for 4s).
  const fit = useFrozen(k <= 10 ? s * 10 : niceCeil(s * k));
  // Counting back: jumps go left from the start, so the line ends at the start.
  const dir = spec.back ? -1 : 1;

  return (
    <View>
      <Canvas aspect={0.42}>
        {({ w, h }) => {
          const pad = 24;
          const max = fit.value;
          const lo = spec.back ? from - max : from;
          const px = (x: number) => pad + ((x - lo) / max) * (w - 2 * pad);
          const y = h * 0.72;
          const lift = Math.min(h * 0.4, Math.max(14, (px(s) - px(0)) * 0.6));
          const labels = Array.from({ length: 11 }, (_, i) => lo + (max / 10) * i);
          return (
            <>
              <Svg width={w} height={h}>
                <Line
                  x1={pad - 6}
                  y1={y}
                  x2={w - pad + 6}
                  y2={y}
                  stroke={c.chartInk}
                  strokeWidth={chart.stroke}
                />
                {labels.map((x) => (
                  <Line
                    key={`t${x}`}
                    x1={px(x)}
                    y1={y - 5}
                    x2={px(x)}
                    y2={y + 5}
                    stroke={c.chartInk}
                  />
                ))}
                {labels.map((x) => (
                  <ChartText
                    key={`l${x}`}
                    x={px(x)}
                    y={y + 20}
                    fontSize={chart.tiny}
                    fill={c.chartMuted}
                    textAnchor="middle"
                  >
                    {formatNumber(x)}
                  </ChartText>
                ))}
                {Array.from({ length: k }, (_, i) => (
                  <Path
                    key={`j${i}`}
                    d={`M ${px(from + dir * i * s)} ${y} Q ${(px(from + dir * i * s) + px(from + dir * (i + 1) * s)) / 2} ${y - 2 * lift} ${px(from + dir * (i + 1) * s)} ${y}`}
                    stroke={c.chartInk}
                    strokeWidth={chart.strokeLight}
                    fill="none"
                  />
                ))}
                {Array.from({ length: k }, (_, i) => (
                  <Circle
                    key={`d${i}`}
                    cx={px(from + dir * (i + 1) * s)}
                    cy={y}
                    r={4}
                    fill={c.chartHighlight}
                  />
                ))}
              </Svg>
              <DragHandle
                testID="drag-end"
                x={px(from + dir * k * s)}
                y={y}
                label={rep.variable(spec.count).name}
                onStart={() => {
                  start.current = k;
                  fit.freeze();
                }}
                onEnd={fit.release}
                onMove={(dx) =>
                  calc.set({
                    ...rep.pin(stepVar ? [stepVar] : []),
                    [spec.count]: rep.snapTo(
                      spec.count,
                      start.current + (dir * dx) / (px(s) - px(0)),
                    ),
                  })
                }
              />
            </>
          );
        }}
      </Canvas>
      <Caption>
        {k === 0
          ? formatNumber(from)
          : Array.from({ length: Math.min(k + 1, 12) }, (_, i) =>
              formatNumber(from + dir * i * s),
            ).join(', ') + (k + 1 > 12 ? ', …' : '')}
      </Caption>
      <Text style={[styles.symbols, { color: c.textMuted }]}>
        {[
          ...(spec.start ? [spec.start] : []),
          ...(stepVar ? [stepVar] : []),
          spec.count,
          spec.total,
        ]
          .map((id) => rep.named(id))
          .join('   ·   ')}
      </Text>
      <Steppers
        calc={calc}
        items={[
          ...(spec.start
            ? [
                {
                  var: spec.start,
                  steps: [1, 10, 100],
                  pin: [...(stepVar ? [stepVar] : []), spec.count],
                },
              ]
            : []),
          ...(stepVar
            ? [
                {
                  var: stepVar,
                  // A jump size that must be a multiple (of 5) steps by that multiple.
                  steps: rep.variable(stepVar).multipleOf
                    ? [rep.variable(stepVar).multipleOf!]
                    : [1, 5],
                  pin: [spec.count, ...(spec.start ? [spec.start] : [])],
                },
              ]
            : [{ var: spec.count, steps: [1], pin: spec.start ? [spec.start] : [] }]),
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  symbols: { fontSize: font.caption + 1, textAlign: 'center', marginTop: space.xs },
});

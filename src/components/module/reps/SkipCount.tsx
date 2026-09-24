import { useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Line, Path } from 'react-native-svg';

import { Text } from '@/components/Text';
import type { Representation } from '@/data/modules';
import { formatNumber } from '@/engine/format';
import { chart, font, space, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, ChartText, DragHandle, niceCeil, useFrozen, useRep } from './common';
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
  const s = Math.max(1, Math.round(rep.shown(spec.step)));
  const k = Math.max(0, Math.round(rep.shown(spec.count)));
  const from = spec.start && rep.known(spec.start) ? Math.round(rep.shown(spec.start)) : 0;
  const fit = useFrozen(niceCeil(Math.max(s * 10, s * k)));

  return (
    <View>
      <Canvas aspect={0.42}>
        {({ w, h }) => {
          const pad = 24;
          const max = fit.value;
          const px = (x: number) => pad + ((x - from) / max) * (w - 2 * pad);
          const y = h * 0.72;
          const lift = Math.min(h * 0.4, Math.max(14, (px(s) - px(0)) * 0.6));
          const labels = Array.from({ length: 11 }, (_, i) => from + (max / 10) * i);
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
                    d={`M ${px(from + i * s)} ${y} Q ${(px(from + i * s) + px(from + (i + 1) * s)) / 2} ${y - 2 * lift} ${px(from + (i + 1) * s)} ${y}`}
                    stroke={c.chartInk}
                    strokeWidth={chart.strokeLight}
                    fill="none"
                  />
                ))}
                {Array.from({ length: k }, (_, i) => (
                  <Circle
                    key={`d${i}`}
                    cx={px(from + (i + 1) * s)}
                    cy={y}
                    r={4}
                    fill={c.chartHighlight}
                  />
                ))}
              </Svg>
              <DragHandle
                testID="drag-end"
                x={px(from + k * s)}
                y={y}
                label={rep.variable(spec.count).name}
                onStart={() => {
                  start.current = k;
                  fit.freeze();
                }}
                onEnd={fit.release}
                onMove={(dx) =>
                  calc.set({
                    ...rep.pin([spec.step]),
                    [spec.count]: rep.snapTo(spec.count, start.current + dx / (px(s) - px(0))),
                  })
                }
              />
            </>
          );
        }}
      </Canvas>
      <Text style={[styles.caption, { color: c.text }]}>
        {k === 0
          ? formatNumber(from)
          : Array.from({ length: Math.min(k + 1, 12) }, (_, i) => formatNumber(from + i * s)).join(
              ', ',
            ) + (k + 1 > 12 ? ', …' : '')}
      </Text>
      <Text style={[styles.symbols, { color: c.textMuted }]}>
        {[...(spec.start ? [spec.start] : []), spec.step, spec.count, spec.total]
          .map((id) => rep.label(id))
          .join('   ·   ')}
      </Text>
      <Steppers
        calc={calc}
        items={[
          ...(spec.start
            ? [{ var: spec.start, steps: [1, 10, 100], pin: [spec.step, spec.count] }]
            : []),
          { var: spec.step, steps: [1, 5], pin: [spec.count, ...(spec.start ? [spec.start] : [])] },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  symbols: { fontSize: font.caption + 1, textAlign: 'center', marginTop: space.xs },
  caption: {
    fontSize: font.body,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: space.sm,
    paddingHorizontal: space.lg,
  },
});

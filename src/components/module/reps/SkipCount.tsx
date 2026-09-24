import { useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Line, Path } from 'react-native-svg';

import { Text } from '@/components/Text';
import type { Representation } from '@/data/modules';
import { formatNumber } from '@/engine/format';
import { chart, font, space, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, ChartText, DragHandle, niceCeil, useFrozen, useRep } from './common';

type Spec = Extract<Representation, { kind: 'skipCount' }>;

/** A number line from 0 with equal jumps of `step`. Drag the end to add or remove jumps. */
export function SkipCount({ spec, calc }: { spec: Spec; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  const start = useRef(0);
  const s = Math.max(1, Math.round(rep.shown(spec.step)));
  const k = Math.max(0, Math.round(rep.shown(spec.count)));
  const fit = useFrozen(niceCeil(Math.max(s * 10, s * k)));

  return (
    <View>
      <Canvas aspect={0.42}>
        {({ w, h }) => {
          const pad = 24;
          const max = fit.value;
          const px = (x: number) => pad + (x / max) * (w - 2 * pad);
          const y = h * 0.72;
          const lift = Math.min(h * 0.4, Math.max(14, (px(s) - px(0)) * 0.6));
          const labels = Array.from({ length: 11 }, (_, i) => (max / 10) * i);
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
                    d={`M ${px(i * s)} ${y} Q ${(px(i * s) + px((i + 1) * s)) / 2} ${y - 2 * lift} ${px((i + 1) * s)} ${y}`}
                    stroke={c.chartInk}
                    strokeWidth={chart.strokeLight}
                    fill="none"
                  />
                ))}
                {Array.from({ length: k }, (_, i) => (
                  <Circle key={`d${i}`} cx={px((i + 1) * s)} cy={y} r={4} fill={c.chartHighlight} />
                ))}
              </Svg>
              <DragHandle
                testID="drag-end"
                x={px(k * s)}
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
          ? '0'
          : Array.from({ length: Math.min(k, 12) }, (_, i) => formatNumber((i + 1) * s)).join(
              ', ',
            ) + (k > 12 ? ', …' : '')}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  caption: {
    fontSize: font.body,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: space.sm,
    paddingHorizontal: space.lg,
  },
});

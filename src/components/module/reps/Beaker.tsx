import { StyleSheet, View } from 'react-native';
import Svg, { G, Line, Path, Rect } from 'react-native-svg';

import { Text } from '@/components/Text';
import type { Representation } from '@/data/modules';
import { chart, font, space, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, ChartText, useRep } from './common';
import { Steppers } from './Steppers';

type Spec = Extract<Representation, { kind: 'beaker' }>;

/** A measuring jug with liter marks; each part is a layer of liquid, stacked up to the total. */
export function Beaker({ spec, calc }: { spec: Spec; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  const parts = spec.parts.map((id) => ({
    id,
    x: rep.known(id) ? Math.max(0, rep.shown(id)) : 0,
  }));
  const total = parts.reduce((s, p) => s + p.x, 0);
  const max = Math.max(spec.max, Math.ceil(total));
  const every = max > 10 ? 2 : 1;
  const fills = [c.chartHighlight, c.chartFill, c.chartSurface];

  return (
    <View>
      <Canvas aspect={0.8}>
        {({ w, h }) => {
          const jw = Math.min(150, w * 0.4);
          const x0 = w * 0.18;
          const top = 20;
          const bottom = h - 16;
          const py = (x: number) => bottom - (x / max) * (bottom - top);
          let level = 0;
          return (
            <Svg width={w} height={h}>
              {parts.map((p, i) => {
                const from = level;
                level += p.x;
                return (
                  <G key={p.id}>
                    <Rect
                      x={x0}
                      y={py(level)}
                      width={jw}
                      height={py(from) - py(level)}
                      fill={fills[i % fills.length]}
                    />
                    {p.x > 0 ? (
                      <ChartText
                        x={x0 + jw + 16}
                        y={(py(from) + py(level)) / 2 + 4}
                        fontSize={chart.small}
                      >
                        {`${rep.variable(p.id).name}: ${rep.value(p.id)}`}
                      </ChartText>
                    ) : null}
                  </G>
                );
              })}
              {Array.from({ length: Math.floor(max / every) + 1 }, (_, i) => (
                <G key={i}>
                  <Line
                    x1={x0}
                    y1={py(i * every)}
                    x2={x0 + 12}
                    y2={py(i * every)}
                    stroke={c.chartInk}
                    strokeWidth={chart.strokeLight}
                  />
                  <ChartText
                    x={x0 - 6}
                    y={py(i * every) + 4}
                    fontSize={chart.tiny}
                    fill={c.chartMuted}
                    textAnchor="end"
                  >
                    {`${i * every} L`}
                  </ChartText>
                </G>
              ))}
              <Path
                d={`M ${x0 - 4} ${top - 6} L ${x0} ${top} L ${x0} ${bottom} L ${x0 + jw} ${bottom} L ${x0 + jw} ${top}`}
                stroke={c.chartInk}
                strokeWidth={chart.stroke}
                fill="none"
              />
              <Line
                x1={x0 - 8}
                y1={py(total)}
                x2={x0 + jw + 8}
                y2={py(total)}
                stroke={c.chartInk}
                strokeWidth={chart.stroke}
                strokeDasharray="4 3"
              />
            </Svg>
          );
        }}
      </Canvas>
      <Text style={[styles.caption, { color: c.text }]}>
        {`${spec.parts.map((id) => rep.value(id)).join(' + ')} = ${rep.value(spec.total)} in all`}
      </Text>
      <Steppers
        calc={calc}
        items={spec.parts.map((id) => ({
          var: id,
          steps: [1],
          pin: spec.parts.filter((x) => x !== id),
        }))}
      />
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

import { StyleSheet, View } from 'react-native';
import Svg, { Circle, G, Line, Path } from 'react-native-svg';

import { Text } from '@/components/Text';
import type { Representation } from '@/data/modules';
import { chart, font, space, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, ChartText, useRep } from './common';
import { Steppers } from './Steppers';

type Spec = Extract<Representation, { kind: 'hops' }>;

/**
 * A number line with one hop per step of a word problem: start at `start`, hop forward (+) or
 * back (−) by each hop's value, and land on `end`. − / + buttons change the start and each hop.
 */
export function Hops({ spec, calc }: { spec: Spec; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  const ids = [spec.start, ...spec.hops.map((x) => x.var), spec.end];
  const faded = !ids.every(rep.known);
  const stops = spec.hops.reduce(
    (acc, hop) => [...acc, acc[acc.length - 1]! + hop.sign * rep.val(hop.var)],
    [rep.val(spec.start)],
  );
  const lo = Math.min(spec.min, ...stops);
  const hi = Math.max(spec.max, ...stops);

  return (
    <View>
      <Canvas aspect={0.46}>
        {({ w, h }) => {
          const pad = 24;
          const unit = (w - 2 * pad) / (hi - lo);
          const sx = (n: number) => pad + (n - lo) * unit;
          const y = h * 0.66;
          const tick = spec.tick ?? 10;
          const ticks = Array.from(
            { length: Math.floor((hi - lo) / tick) + 1 },
            (_, i) => lo + i * tick,
          );
          return (
            <Svg width={w} height={h}>
              <Line
                x1={pad - 8}
                y1={y}
                x2={w - pad + 8}
                y2={y}
                stroke={c.chartInk}
                strokeWidth={chart.stroke}
              />
              {ticks.map((n) => (
                <G key={n}>
                  <Line x1={sx(n)} y1={y - 6} x2={sx(n)} y2={y + 6} stroke={c.chartInk} />
                  <ChartText
                    x={sx(n)}
                    y={y + 22}
                    fontSize={chart.label}
                    fill={c.chartMuted}
                    textAnchor="middle"
                  >
                    {n}
                  </ChartText>
                </G>
              ))}
              {spec.hops.map((hop, i) => {
                const from = stops[i]!;
                const to = stops[i + 1]!;
                // Every hop arcs above the line; later hops are lower so they don't overlap.
                // Backward hops are dashed.
                const up = hop.sign > 0;
                const lift =
                  Math.min(h * 0.4, 24 + Math.abs(to - from) * unit * 0.25) * (i === 0 ? 1 : 0.6);
                const mid = (sx(from) + sx(to)) / 2;
                const cy = y - 2 * lift;
                return (
                  <G key={hop.var} opacity={faded ? 0.35 : 1}>
                    <Path
                      d={`M ${sx(from)} ${y} Q ${mid} ${cy} ${sx(to)} ${y}`}
                      stroke={c.chartInk}
                      strokeWidth={chart.stroke}
                      strokeDasharray={up ? undefined : chart.dash}
                      fill="none"
                    />
                    <ChartText
                      x={mid}
                      // Later hops' labels go under the numbers, clear of the first arc.
                      y={i === 0 ? y - lift - 6 : y + 42}
                      fontSize={chart.small}
                      fill={c.chartInk}
                      textAnchor="middle"
                    >
                      {`${up ? '+' : '−'}${rep.label(hop.var, false)}`}
                    </ChartText>
                  </G>
                );
              })}
              {stops.map((n, i) => (
                <Circle
                  key={i}
                  cx={sx(n)}
                  cy={y}
                  r={i === stops.length - 1 ? 6 : 5}
                  fill={i === stops.length - 1 ? c.chartInk : c.chartMuted}
                />
              ))}
            </Svg>
          );
        }}
      </Canvas>
      <Text style={[styles.caption, { color: c.text }]}>
        {`Start ${rep.label(spec.start, false)}, ${spec.hops
          .map((hop) => `${hop.sign > 0 ? 'add' : 'take away'} ${rep.label(hop.var, false)}`)
          .join(', then ')}. End ${rep.label(spec.end, false)}.`}
      </Text>
      <Steppers
        calc={calc}
        items={[spec.start, ...spec.hops.map((x) => x.var)].map((id, _, all) => ({
          var: id,
          steps: [1, 10],
          pin: all.filter((x) => x !== id),
        }))}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  caption: { fontSize: font.body, fontWeight: '600', textAlign: 'center', marginTop: space.sm },
});

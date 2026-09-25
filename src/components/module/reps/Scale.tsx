import { StyleSheet, View } from 'react-native';
import Svg, { Circle, G, Line, Path, Rect } from 'react-native-svg';

import { Text } from '@/components/Text';
import type { Representation } from '@/data/modules';
import { formatNumber } from '@/engine/format';
import { chart, font, space, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, ChartText, useRep } from './common';
import { Steppers } from './Steppers';

type Spec = Extract<Representation, { kind: 'scale' }>;

/**
 * A kitchen scale: the things on the pan, and a dial whose needle points at the total mass.
 * Either separate `items`, or `count` equal bags of mass `each`.
 */
export function Scale({ spec, calc }: { spec: Spec; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  const total = rep.known(spec.total) ? rep.shown(spec.total) : 0;
  const count = spec.count ? Math.max(0, Math.min(10, Math.round(rep.shown(spec.count)))) : 0;
  const blocks: { label: string; id: string }[] = spec.items
    ? spec.items.map((id) => ({ id, label: rep.value(id) }))
    : Array.from({ length: count }, () => ({ id: spec.each!, label: rep.value(spec.each!) }));
  const max = Math.max(spec.max, total);
  const big = spec.max >= 500;

  return (
    <View>
      <Canvas aspect={0.8}>
        {({ w, h }) => {
          const cx = w / 2;
          const panY = h * 0.22;
          const dialY = h * 0.84;
          const r = Math.min(w * 0.36, h * 0.42);
          const bw = Math.min(64, (w * 0.8) / Math.max(1, blocks.length) - 6);
          const angle = (x: number) => Math.PI * (1 - Math.min(1, x / max));
          const needle = angle(total);
          return (
            <Svg width={w} height={h}>
              {blocks.map((b, i) => {
                const x = cx - (blocks.length * (bw + 6)) / 2 + i * (bw + 6);
                return (
                  <G key={i}>
                    <Rect
                      x={x}
                      y={panY - 40}
                      width={bw}
                      height={36}
                      rx={6}
                      fill={spec.items ? (i % 2 ? c.chartSurface : c.chartFill) : c.chartFill}
                      stroke={c.chartInk}
                      strokeWidth={chart.strokeLight}
                    />
                    <ChartText
                      x={x + bw / 2}
                      y={panY - 17}
                      fontSize={bw < 48 ? chart.tiny : chart.small}
                      textAnchor="middle"
                    >
                      {b.label}
                    </ChartText>
                  </G>
                );
              })}
              <Path
                d={`M ${cx - w * 0.38} ${panY} L ${cx + w * 0.38} ${panY} L ${cx + w * 0.32} ${panY + 12} L ${cx - w * 0.32} ${panY + 12} Z`}
                fill={c.chartSurface}
                stroke={c.chartInk}
                strokeWidth={chart.stroke}
              />
              <Line
                x1={cx}
                y1={panY + 12}
                x2={cx}
                y2={dialY - r - 6}
                stroke={c.chartInk}
                strokeWidth={chart.stroke}
              />
              <Path
                d={`M ${cx - r - 10} ${dialY} A ${r + 10} ${r + 10} 0 0 1 ${cx + r + 10} ${dialY} Z`}
                fill={c.chartSurface}
                stroke={c.chartInk}
                strokeWidth={chart.stroke}
              />
              {Array.from({ length: 11 }, (_, i) => {
                const a = Math.PI * (1 - i / 10);
                const x1 = cx + Math.cos(a) * r;
                const y1 = dialY - Math.sin(a) * r;
                const x2 = cx + Math.cos(a) * (r - (i % 5 ? 6 : 12));
                const y2 = dialY - Math.sin(a) * (r - (i % 5 ? 6 : 12));
                return (
                  <G key={i}>
                    <Line
                      x1={x1}
                      y1={y1}
                      x2={x2}
                      y2={y2}
                      stroke={c.chartInk}
                      strokeWidth={chart.strokeLight}
                    />
                    {/* Every mark is numbered when the dial has room (0, 100, 200, …). */}
                    {i % 5 === 0 || r >= 110 ? (
                      <ChartText
                        // The two ends (0 and the most) sit under the dial's flat edge, clear of
                        // their neighbors.
                        x={cx + Math.cos(a) * (r - (i % 10 === 0 ? 12 : 26))}
                        y={i % 10 === 0 ? dialY + 16 : dialY - Math.sin(a) * (r - 26) + 4}
                        fontSize={chart.tiny}
                        fill={c.chartMuted}
                        textAnchor="middle"
                      >
                        {formatNumber((max * i) / 10)}
                      </ChartText>
                    ) : null}
                  </G>
                );
              })}
              <Line
                x1={cx}
                y1={dialY}
                x2={cx + Math.cos(needle) * (r - 8)}
                y2={dialY - Math.sin(needle) * (r - 8)}
                stroke={c.chartHighlight}
                strokeWidth={chart.strokeHeavy}
              />
              <Circle cx={cx} cy={dialY} r={5} fill={c.chartInk} />
              <ChartText
                x={cx}
                y={dialY + 24}
                fontSize={chart.value}
                fontWeight="700"
                textAnchor="middle"
              >
                {`${rep.tag(spec.total)}: ${rep.value(spec.total)}`}
              </ChartText>
            </Svg>
          );
        }}
      </Canvas>
      <Text style={[styles.caption, { color: c.text }]}>
        {spec.items
          ? `${spec.items.map((id) => rep.value(id)).join(' + ')} = ${rep.value(spec.total)}`
          : `${count} ${count === 1 ? 'bag' : 'bags'} of ${rep.value(spec.each!)} = ${rep.value(spec.total)}`}
      </Text>
      <Steppers
        calc={calc}
        items={
          spec.items
            ? spec.items.map((id) => ({
                var: id,
                steps: big ? [10, 100] : [1],
                pin: spec.items!.filter((x) => x !== id),
              }))
            : [
                { var: spec.count!, steps: [1], pin: [spec.each!] },
                { var: spec.each!, steps: [1], pin: [spec.count!] },
              ]
        }
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

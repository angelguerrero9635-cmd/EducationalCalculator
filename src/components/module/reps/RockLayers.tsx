import { StyleSheet, View } from 'react-native';
import Svg, { Ellipse, Path, Rect } from 'react-native-svg';

import type { Representation } from '@/data/modules';
import { chart, font, space, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, ChartText, useRep, Caption } from './common';
import { Steppers } from './Steppers';

type Spec = Extract<Representation, { kind: 'rockLayers' }>;

/** Rock layers stacked on a fossil: each layer took the same number of years to form. */
export function RockLayers({ spec, calc }: { spec: Spec; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  const n = rep.known(spec.layers)
    ? Math.max(0, Math.min(12, Math.round(rep.shown(spec.layers))))
    : 0;
  const fills = [c.chartFill, c.chartSurface];

  return (
    <View>
      <Canvas aspect={0.62}>
        {({ w, h }) => {
          const left = 24;
          const width = w - 130;
          const top = 14;
          const fossilH = 40;
          const bottom = h - fossilH - 10;
          const layerH = n > 0 ? (bottom - top) / n : 0;
          return (
            <Svg width={w} height={h}>
              {Array.from({ length: n }, (_, i) => {
                const y = top + i * layerH;
                return [
                  <Rect
                    key={`l${i}`}
                    x={left}
                    y={y}
                    width={width}
                    height={layerH}
                    fill={fills[i % 2]}
                    stroke={c.chartInk}
                    strokeWidth={chart.strokeLight}
                  />,
                  layerH >= 14 ? (
                    <ChartText
                      key={`t${i}`}
                      x={left + width + 8}
                      y={y + layerH / 2 + 4}
                      fontSize={chart.tiny}
                      fill={c.chartMuted}
                    >
                      {rep.value(spec.years)}
                    </ChartText>
                  ) : null,
                ];
              })}
              <Rect
                x={left}
                y={bottom}
                width={width}
                height={fossilH}
                fill={c.chartSurface}
                stroke={c.chartInk}
                strokeWidth={chart.stroke}
              />
              {/* The fossil: a small shell in the bottom layer. */}
              <Ellipse
                cx={left + width / 2}
                cy={bottom + fossilH / 2 + 4}
                rx={22}
                ry={12}
                fill={c.chartFill}
                stroke={c.chartInk}
                strokeWidth={chart.stroke}
              />
              <Path
                d={`M ${left + width / 2 - 22} ${bottom + fossilH / 2 + 4} Q ${left + width / 2} ${bottom + fossilH / 2 - 14} ${left + width / 2 + 22} ${bottom + fossilH / 2 + 4}`}
                stroke={c.chartInk}
                strokeWidth={chart.strokeLight}
                fill="none"
              />
              <ChartText
                x={left + width + 8}
                y={bottom + fossilH / 2 + 4}
                fontSize={chart.small}
                fontWeight="700"
              >
                fossil
              </ChartText>
            </Svg>
          );
        }}
      </Canvas>
      <Caption>{`${rep.named(spec.layers)}, each ${rep.value(spec.years)}: ${rep.named(spec.total)}.`}</Caption>
      <Steppers
        calc={calc}
        items={[
          { var: spec.layers, steps: [1], pin: [spec.years] },
          { var: spec.years, steps: [10], pin: [spec.layers] },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({});

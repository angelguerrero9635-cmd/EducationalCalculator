import { View } from 'react-native';
import Svg, { G, Rect } from 'react-native-svg';

import type { Representation } from '@/data/modules';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, Caption, ChartText, useRep } from './common';
import { Steppers } from './Steppers';

type Spec = Extract<Representation, { kind: 'shareWholes' }>;

/**
 * Wholes shared equally: each whole is a bar cut into as many parts as there are people, and
 * one person's part is shaded in every bar. Their share is one part from each whole.
 */
export function ShareWholes({ spec, calc }: { spec: Spec; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  const known = rep.known(spec.wholes) && rep.known(spec.people);
  const W = Math.max(1, Math.min(12, Math.round(rep.shown(spec.wholes))));
  const P = Math.max(1, Math.min(12, Math.round(rep.shown(spec.people))));
  const barH = 26;
  const gap = 10;
  return (
    <View>
      <Canvas aspect={(w) => (W * (barH + gap) + gap + 18) / w}>
        {({ w, h }) => {
          const left = 70;
          const bw = w - left - 16;
          return (
            <Svg width={w} height={h} opacity={known ? 1 : 0.35}>
              {Array.from({ length: W }, (_, i) => {
                const y = gap + i * (barH + gap);
                return (
                  <G key={i}>
                    <ChartText
                      x={left - 10}
                      y={y + barH / 2 + 5}
                      fontSize={chart.small}
                      textAnchor="end"
                    >
                      {`Whole ${i + 1}`}
                    </ChartText>
                    {Array.from({ length: P }, (_, j) => (
                      <Rect
                        key={j}
                        x={left + (j * bw) / P}
                        y={y}
                        width={bw / P}
                        height={barH}
                        fill={j === 0 ? c.chartHighlight : c.chartSurface}
                        stroke={c.chartInk}
                        strokeWidth={chart.strokeLight}
                      />
                    ))}
                  </G>
                );
              })}
              <ChartText x={left} y={h - 4} fontSize={chart.small} fill={c.chartMuted}>
                {`shaded: one person’s share, 1/${P} of each whole`}
              </ChartText>
            </Svg>
          );
        }}
      </Canvas>
      <Caption>
        {known
          ? `${W} ${W === 1 ? 'whole' : 'wholes'} shared by ${P}: ${W} × 1/${P} = ${W}/${P} for each person.`
          : 'Type the wholes and the people sharing them.'}
      </Caption>
      <Steppers
        calc={calc}
        items={[
          { var: spec.wholes, steps: [1], pin: [spec.people] },
          { var: spec.people, steps: [1], pin: [spec.wholes] },
        ]}
      />
    </View>
  );
}

import { StyleSheet, View } from 'react-native';
import Svg, { Line, Path } from 'react-native-svg';

import { Text } from '@/components/Text';
import type { Representation } from '@/data/modules';
import { chart, font, space, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, ChartText, useRep } from './common';
import { Steppers } from './Steppers';

type Spec = Extract<Representation, { kind: 'waves' }>;

/**
 * One wavy line per value: the number of bumps in one second. More bumps in the same width
 * means faster vibration and a higher sound.
 */
export function Waves({ spec, calc }: { spec: Spec; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  const counts = spec.rows.map((id) =>
    rep.known(id) ? Math.max(0, Math.min(spec.max, Math.round(rep.shown(id)))) : 0,
  );

  return (
    <View>
      <Canvas aspect={(w) => (spec.rows.length * 70 + 20) / w}>
        {({ w }) => {
          const left = 16;
          const right = w - 16;
          const amp = 16;
          return (
            <Svg width={w} height={spec.rows.length * 70 + 20}>
              {spec.rows.map((id, i) => {
                const mid = 36 + i * 70;
                const n = counts[i]!;
                const span = right - left;
                // A bump is half a wave: up then back to the middle line, so 2 bumps per wave.
                const step = n > 0 ? span / n : span;
                let d = `M ${left} ${mid}`;
                for (let k = 0; k < n; k++) {
                  const x0 = left + k * step;
                  const up = k % 2 === 0 ? -amp : amp;
                  d += ` Q ${x0 + step / 2} ${mid + 2 * up} ${x0 + step} ${mid}`;
                }
                return [
                  <Line
                    key={`b${id}`}
                    x1={left}
                    y1={mid}
                    x2={right}
                    y2={mid}
                    stroke={c.chartGrid}
                    strokeWidth={chart.strokeLight}
                  />,
                  n > 0 ? (
                    <Path
                      key={`w${id}`}
                      d={d}
                      stroke={c.chartHighlight}
                      strokeWidth={chart.strokeHeavy}
                      fill="none"
                    />
                  ) : null,
                  <ChartText key={`t${id}`} x={left} y={mid - amp - 8} fontSize={chart.small}>
                    {`${rep.tag(id)}: ${rep.value(id)} in one second`}
                  </ChartText>,
                ];
              })}
            </Svg>
          );
        }}
      </Canvas>
      <Text style={[styles.caption, { color: c.text }]}>
        {(() => {
          const known = spec.rows.every(rep.known);
          if (!known) return 'Type how many times each band vibrates in one second.';
          const [a, b] = counts as [number, number];
          if (a === b) return 'Both vibrate the same: the same sound.';
          const hi = spec.rows[a > b ? 0 : 1]!;
          return `${rep.variable(hi).name} vibrates more times: it makes the higher sound.`;
        })()}
      </Text>
      <Steppers
        calc={calc}
        items={spec.rows.map((id) => ({
          var: id,
          steps: [1],
          pin: spec.rows.filter((x) => x !== id),
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

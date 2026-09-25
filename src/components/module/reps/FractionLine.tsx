import { useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Line, Path } from 'react-native-svg';

import { Text } from '@/components/Text';
import type { Representation } from '@/data/modules';
import { chart, font, space, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, ChartText, DragHandle, useRep } from './common';
import { Steppers } from './Steppers';

type Spec = Extract<Representation, { kind: 'fractionLine' }>;

/**
 * Fractions on a number line: each whole from 0 to `wholes` cut into equal parts, one jump per
 * part from 0 to the fraction. Drag the point to another mark.
 */
export function FractionLine({ spec, calc }: { spec: Spec; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  const start = useRef(0);
  const b = Math.max(1, Math.round(rep.shown(spec.denominator)));
  const raw = Math.max(0, Math.round(rep.shown(spec.numerator)));
  // Enough wholes for the fraction (at least `wholes`), so 17/5 is drawn where it is.
  const W = Math.max(spec.wholes, Math.ceil(raw / b));
  const a = raw;
  const known = rep.known(spec.numerator) && rep.known(spec.denominator);
  const wholes = Math.floor(a / b);
  const left = a - wholes * b;

  return (
    <View>
      <Canvas aspect={0.5}>
        {({ w, h }) => {
          const pad = 22;
          const unit = (w - 2 * pad) / W;
          const px = (x: number) => pad + x * unit;
          const y = h * 0.66;
          const step = unit / b;
          const lift = Math.min(h * 0.38, Math.max(10, step * 0.55));
          // Label every mark when there's room; otherwise only whole numbers.
          const labelAll = step >= 30;
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
                {Array.from({ length: W * b + 1 }, (_, i) => {
                  const whole = i % b === 0;
                  return (
                    <Line
                      key={`t${i}`}
                      x1={px(i / b)}
                      y1={y - (whole ? 10 : 6)}
                      x2={px(i / b)}
                      y2={y + (whole ? 10 : 6)}
                      stroke={c.chartInk}
                      strokeWidth={whole ? chart.stroke : chart.strokeLight}
                    />
                  );
                })}
                {Array.from({ length: W + 1 }, (_, i) => i)
                  // Long lines label every 2nd or 5th whole so the numbers don't touch.
                  .filter((i) => i % (unit >= 26 ? 1 : unit >= 13 ? 2 : 5) === 0 || i === W)
                  .map((i) => (
                    <ChartText
                      key={`w${i}`}
                      x={px(i)}
                      y={y + 28}
                      fontSize={chart.value}
                      fontWeight="700"
                      textAnchor="middle"
                    >
                      {String(i)}
                    </ChartText>
                  ))}
                {labelAll
                  ? Array.from({ length: W * b + 1 }, (_, i) => (
                      <ChartText
                        key={`f${i}`}
                        x={px(i / b)}
                        y={y + 44}
                        fontSize={chart.tiny}
                        fill={c.chartMuted}
                        textAnchor="middle"
                      >
                        {`${i}/${b}`}
                      </ChartText>
                    ))
                  : null}
                {known
                  ? Array.from({ length: a }, (_, i) => (
                      <Path
                        key={`j${i}`}
                        d={`M ${px(i / b)} ${y} Q ${px((i + 0.5) / b)} ${y - 2 * lift} ${px((i + 1) / b)} ${y}`}
                        stroke={c.chartHighlight}
                        strokeWidth={chart.strokeLight}
                        fill="none"
                      />
                    ))
                  : null}
                {known ? (
                  <>
                    <Circle cx={px(a / b)} cy={y} r={6} fill={c.chartHighlight} />
                    <ChartText
                      x={Math.min(w - 24, Math.max(24, px(a / b)))}
                      y={y - 2 * lift - 10}
                      fontSize={chart.emphasis}
                      fontWeight="700"
                      textAnchor="middle"
                    >
                      {`${a}/${b}`}
                    </ChartText>
                  </>
                ) : null}
              </Svg>
              {known ? (
                <DragHandle
                  testID="drag-fraction"
                  x={px(a / b)}
                  y={y}
                  label={rep.variable(spec.numerator).name}
                  onStart={() => (start.current = a)}
                  onMove={(dx) =>
                    calc.set({
                      ...rep.pin([spec.denominator]),
                      [spec.numerator]: rep.snapTo(
                        spec.numerator,
                        Math.min(W * b, Math.max(0, start.current + dx / step)),
                      ),
                    })
                  }
                />
              ) : null}
            </>
          );
        }}
      </Canvas>
      <Text style={[styles.caption, { color: c.text }]}>
        {known
          ? `${a}/${b}: ${a} ${a === 1 ? 'jump' : 'jumps'} of 1/${b} from 0.` +
            (spec.unit
              ? ` That is ${wholes > 0 ? `${wholes} ${wholes === 1 ? spec.unit.one : spec.unit.many}` : ''}${wholes > 0 && left > 0 ? ' and ' : ''}${left > 0 || wholes === 0 ? `${left}/${b} ${spec.unit.one}` : ''}.`
              : wholes > 0
                ? left > 0
                  ? ` That is ${wholes} ${wholes === 1 ? 'whole' : 'wholes'} and ${left}/${b} more.`
                  : ` That is exactly ${wholes}: ${a}/${b} = ${wholes}.`
                : '')
          : 'Type the parts counted and the parts in one whole.'}
      </Text>
      <Steppers
        calc={calc}
        items={[
          {
            var: spec.denominator,
            // Halves and quarters of an inch step 2 ↔ 4; plain fractions step by 1.
            steps: [rep.variable(spec.denominator).step ?? 1],
            pin: [spec.numerator],
          },
          { var: spec.numerator, steps: [1], pin: [spec.denominator] },
        ]}
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

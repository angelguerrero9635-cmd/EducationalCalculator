import { useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Line, Rect } from 'react-native-svg';

import { Text } from '@/components/Text';
import type { Representation } from '@/data/modules';
import { chart, font, space, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, ChartText, DragHandle, useRep } from './common';
import { Steppers } from './Steppers';

type Spec = Extract<Representation, { kind: 'thermometers' }>;

/** One thermometer per value, side by side, numbered every 10 degrees. Drag the top of the liquid. */
export function Thermometers({ spec, calc }: { spec: Spec; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  const start = useRef(0);
  const shown = spec.items.map((id) => (rep.known(id) ? rep.shown(id) : undefined));
  // The scale grows to fit the values, in whole tens.
  const lo = Math.min(
    spec.min,
    ...shown.map((x) => (x === undefined ? spec.min : Math.floor(x / 10) * 10)),
  );
  const hi = Math.max(
    spec.max,
    ...shown.map((x) => (x === undefined ? spec.max : Math.ceil(x / 10) * 10)),
  );
  const unit = rep.unit(spec.items[0]!) ?? '';

  return (
    <View>
      <Canvas aspect={0.7}>
        {({ w, h }) => {
          const top = 22;
          // Leaves room under the bulb for the name label.
          const bottom = h - 40;
          const py = (x: number) => bottom - ((x - lo) / (hi - lo)) * (bottom - top);
          const slot = w / spec.items.length;
          const tube = 18;
          return (
            <>
              <Svg width={w} height={h}>
                {spec.items.map((id, i) => {
                  const cx = slot * i + slot / 2 + 10;
                  const x = shown[i];
                  return [
                    <Rect
                      key={`t${id}`}
                      x={cx - tube / 2}
                      y={top - 6}
                      width={tube}
                      height={bottom - top + 6}
                      rx={tube / 2}
                      fill={c.chartSurface}
                      stroke={c.chartInk}
                      strokeWidth={chart.stroke}
                    />,
                    x === undefined ? null : (
                      <Rect
                        key={`f${id}`}
                        x={cx - tube / 2 + 4}
                        y={py(x)}
                        width={tube - 8}
                        height={bottom - py(x) + 6}
                        fill={c.chartHighlight}
                      />
                    ),
                    <Circle
                      key={`b${id}`}
                      cx={cx}
                      cy={bottom + 12}
                      r={13}
                      fill={x === undefined ? c.chartSurface : c.chartHighlight}
                      stroke={c.chartInk}
                      strokeWidth={chart.stroke}
                    />,
                    ...[
                      // A ten next to an extra mark (30 by 32) gives way to the mark.
                      ...Array.from({ length: (hi - lo) / 10 + 1 }, (_, k) => lo + k * 10).filter(
                        (v) => !(spec.marks ?? []).some((m) => m !== v && Math.abs(m - v) < 5),
                      ),
                      ...(spec.marks ?? []).filter((v) => v > lo && v < hi && v % 10 !== 0),
                    ].map((v, k) => {
                      const mark = v % 10 !== 0;
                      return [
                        <Line
                          key={`m${id}${k}`}
                          x1={cx - tube / 2 - 8}
                          y1={py(v)}
                          x2={cx - tube / 2}
                          y2={py(v)}
                          stroke={c.chartInk}
                          strokeWidth={mark ? chart.stroke : chart.strokeLight}
                        />,
                        <ChartText
                          key={`l${id}${k}`}
                          x={cx - tube / 2 - 12}
                          y={py(v) + 4}
                          fontSize={chart.tiny}
                          fill={mark ? c.chartInk : c.chartMuted}
                          fontWeight={mark ? '700' : undefined}
                          textAnchor="end"
                        >
                          {String(v)}
                        </ChartText>,
                      ];
                    }),
                    x === undefined ? null : (
                      <ChartText
                        key={`v${id}`}
                        x={cx + tube / 2 + 8}
                        y={py(x) + 4}
                        fontSize={chart.small}
                        fontWeight="700"
                      >
                        {rep.value(id)}
                      </ChartText>
                    ),
                    <ChartText
                      key={`n${id}`}
                      x={cx}
                      y={h - 2}
                      fontSize={chart.tiny}
                      fill={c.chartMuted}
                      textAnchor="middle"
                    >
                      {rep.tag(id)}
                    </ChartText>,
                  ];
                })}
              </Svg>
              {spec.items.map((id, i) =>
                shown[i] === undefined ? null : (
                  <DragHandle
                    key={`d${id}`}
                    testID={`drag-${id}`}
                    x={slot * i + slot / 2 + 10}
                    y={py(shown[i]!)}
                    label={rep.variable(id).name}
                    onStart={() => (start.current = shown[i]!)}
                    onMove={(_, dy) =>
                      calc.set({
                        ...rep.pin(spec.items.filter((x) => x !== id)),
                        [id]: rep.snapTo(
                          id,
                          (start.current - (dy / (bottom - top)) * (hi - lo)) * rep.factor(id),
                        ),
                      })
                    }
                  />
                ),
              )}
            </>
          );
        }}
      </Canvas>
      <Text style={[styles.caption, { color: c.text }]}>
        {(() => {
          const names = `${spec.items.map((id) => rep.named(id)).join('. ')}.`;
          const [a, b] = shown;
          if (!spec.difference || a === undefined || b === undefined) return names;
          // Say which one is warmer, so a shade warmer than the sun reads as what it is.
          if (a === b) return `${names} Both the same.`;
          const warmer = rep.variable(spec.items[a > b ? 0 : 1]!).name;
          return `${names} ${warmer} is warmer by ${rep.value(spec.difference)}.`;
        })()}
      </Text>
      <Steppers
        calc={calc}
        items={spec.items.map((id, i) => ({
          var: id,
          steps: hi - lo > 60 ? [1, 10] : [1],
          pin: spec.items.filter((x) => x !== id),
          // A "?" thermometer starts next to the other one, or at the bottom of the scale.
          from: shown.find((x, k) => k !== i && x !== undefined) ?? spec.min,
        }))}
      />
      {unit ? null : null}
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

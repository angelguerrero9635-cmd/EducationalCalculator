import { useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Rect } from 'react-native-svg';

import { Text } from '@/components/Text';
import type { Representation } from '@/data/modules';
import { chart, font, space, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, ChartText, DragHandle, useFrozen, useRep } from './common';
import { Steppers } from './Steppers';

type Spec = Extract<Representation, { kind: 'unitTiles' }>;

/**
 * One object measured two ways: a row of small cubes and a row of bigger units (each `size`
 * cubes long), laid end to end with no gaps. Drag the object's end to change how many big
 * units long it is.
 */
export function UnitTiles({ spec, calc }: { spec: Spec; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  const start = useRef(0);
  const count = Math.max(0, Math.round(rep.shown(spec.count)));
  const size = Math.max(1, Math.round(rep.shown(spec.size)));
  const total = count * size;
  // Room for at least 24 cubes; longer objects shrink the cubes (held steady while dragging).
  const span = useFrozen(Math.max(24, total));

  return (
    <View>
      <Canvas aspect={(w) => (80 + 2 * Math.min(24, (w - 92) / span.value)) / w}>
        {({ w, h }) => {
          const left = 76;
          const cell = Math.min(24, (w - left - 16) / span.value);
          const objY = 16;
          const cubeY = objY + 38;
          const clipY = cubeY + cell + 16;
          const end = left + total * cell;
          return (
            <>
              <Svg width={w} height={h}>
                <ChartText x={8} y={objY + 16} fontSize={chart.small}>
                  Object
                </ChartText>
                <Rect
                  x={left}
                  y={objY}
                  width={Math.max(2, total * cell)}
                  height={22}
                  rx={4}
                  fill={c.chartHighlight}
                />
                <ChartText x={8} y={cubeY + cell / 2 + 4} fontSize={chart.small}>
                  {rep.variable(spec.total).name}
                </ChartText>
                {Array.from({ length: total }, (_, i) => (
                  <Rect
                    key={`c${i}`}
                    x={left + i * cell}
                    y={cubeY}
                    width={cell}
                    height={cell}
                    fill={c.chartFill}
                    stroke={c.chartInk}
                    strokeWidth={chart.strokeLight}
                  />
                ))}
                <ChartText x={8} y={clipY + cell / 2 + 4} fontSize={chart.small}>
                  {rep.variable(spec.count).name}
                </ChartText>
                {Array.from({ length: count }, (_, i) => (
                  <Rect
                    key={`p${i}`}
                    x={left + i * size * cell + 1}
                    y={clipY}
                    width={size * cell - 2}
                    height={cell}
                    rx={cell / 2}
                    fill={c.chartSurface}
                    stroke={c.chartInk}
                    strokeWidth={chart.stroke}
                  />
                ))}
              </Svg>
              <DragHandle
                testID="drag-end"
                x={end}
                y={objY + 11}
                label={rep.variable(spec.count).name}
                onStart={() => {
                  start.current = count;
                  span.freeze();
                }}
                onEnd={span.release}
                onMove={(dx) =>
                  calc.set({
                    ...rep.pin([spec.size]),
                    [spec.count]: rep.snapTo(spec.count, start.current + dx / (size * cell)),
                  })
                }
              />
            </>
          );
        }}
      </Canvas>
      <Text style={[styles.caption, { color: c.text }]}>
        {`${total} cubes = ${count} ${rep.variable(spec.count).name.toLowerCase()}, each ${size} ${size === 1 ? 'cube' : 'cubes'} long`}
      </Text>
      <Steppers calc={calc} items={[{ var: spec.size, steps: [1], pin: [spec.count] }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  caption: { fontSize: font.body, textAlign: 'center', marginTop: space.sm },
});

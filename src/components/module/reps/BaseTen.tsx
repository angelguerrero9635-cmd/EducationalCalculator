import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { G, Line, Rect } from 'react-native-svg';

import { Text } from '@/components/Text';
import type { Representation } from '@/data/modules';
import { chart, font, space, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, ChartText, useRep } from './common';
import { Steppers } from './Steppers';

type Spec = Extract<Representation, { kind: 'baseTen' }>;

const digits = (n: number) => ({
  h: Math.floor(n / 100),
  t: Math.floor((n % 100) / 10),
  o: n % 10,
});

/**
 * Base-ten blocks: hundreds as 10 × 10 flats, tens as rods of 10, ones as single cubes. Each
 * group gets its own row; the total row shows the sum regrouped (10 ones make a ten).
 */
export function BaseTen({ spec, calc }: { spec: Spec; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  const rows = [...spec.groups, ...(spec.total ? [spec.total] : [])];
  const value = (id: string) => (rep.known(id) ? Math.max(0, Math.round(rep.shown(id))) : 0);
  const controlIds = spec.controls.map((k) => k.var);

  const blocks = (id: string, top: number, u: number, fill: string) => {
    const { h, t, o } = digits(value(id));
    const out: ReactNode[] = [];
    const y = top + 18;
    let x = 8;
    for (let i = 0; i < h; i++, x += 10 * u + 6) {
      out.push(
        <Rect
          key={`h${i}`}
          x={x}
          y={y}
          width={10 * u}
          height={10 * u}
          fill={fill}
          stroke={c.chartInk}
          strokeWidth={chart.strokeLight}
        />,
        ...Array.from({ length: 9 }, (_, k) => (
          <Line
            key={`h${i}-${k}`}
            x1={x + (k + 1) * u}
            y1={y}
            x2={x + (k + 1) * u}
            y2={y + 10 * u}
            stroke={c.chartGrid}
          />
        )),
      );
    }
    for (let i = 0; i < t; i++, x += u + 4) {
      out.push(
        <Rect
          key={`t${i}`}
          x={x}
          y={y}
          width={u}
          height={10 * u}
          fill={fill}
          stroke={c.chartInk}
          strokeWidth={chart.strokeLight}
        />,
      );
    }
    x += 6;
    for (let i = 0; i < o; i++) {
      out.push(
        <Rect
          key={`o${i}`}
          x={x + (i % 5) * (u + 3)}
          y={y + 10 * u - (Math.floor(i / 5) + 1) * (u + 3)}
          width={u}
          height={u}
          fill={fill}
          stroke={c.chartInk}
          strokeWidth={chart.strokeLight}
        />,
      );
    }
    return out;
  };

  return (
    <View>
      <Canvas aspect={0.3 * rows.length + 0.04}>
        {({ w, h }) => {
          const rowH = (h - 8) / rows.length;
          const u = Math.max(3, Math.min(8, (rowH - 26) / 10));
          return (
            <Svg width={w} height={h}>
              {rows.map((id, r) => {
                const top = 4 + r * rowH;
                const d = digits(value(id));
                const fill =
                  id === spec.total ? c.chartHighlight : r % 2 === 0 ? c.chartFill : c.chartSurface;
                return (
                  <G key={id} opacity={rep.known(id) ? 1 : 0.35}>
                    <ChartText x={8} y={top + 12} fontSize={chart.small}>
                      {`${rep.variable(id).name}: ${rep.known(id) ? value(id) : '?'}  =  ${d.h} hundreds, ${d.t} tens, ${d.o} ones`}
                    </ChartText>
                    {blocks(id, top, u, fill)}
                  </G>
                );
              })}
            </Svg>
          );
        }}
      </Canvas>
      <Steppers
        calc={calc}
        items={spec.controls.map((k) => ({
          var: k.var,
          steps: k.steps,
          pin: controlIds.filter((x) => x !== k.var),
        }))}
      />
      <Text style={[styles.hint, { color: c.textMuted }]}>
        Flats are hundreds, rods are tens, small cubes are ones.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  hint: { fontSize: font.caption + 1, textAlign: 'center', marginTop: space.sm },
});

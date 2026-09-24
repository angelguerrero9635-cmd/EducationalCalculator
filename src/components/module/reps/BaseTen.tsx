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

  // Up to 5 flats per line; more wrap onto a second line so 3-digit numbers fit a phone.
  const flatCols = (h: number) => (h > 5 ? Math.ceil(h / 2) : h);
  const flatLines = (h: number) => (h > 5 ? 2 : 1);
  const hundreds = rows.some((id) => (rep.variable(id).max ?? 0) >= 100);
  const place = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;
  const describe = (n: number) => {
    const d = digits(n);
    // Name only the places in use ("3 hundreds", not "3 hundreds, 0 tens, 0 ones").
    const parts = [
      ...(d.h > 0 ? [place(d.h, 'hundred', 'hundreds')] : []),
      ...(d.t > 0 ? [place(d.t, 'ten', 'tens')] : []),
      ...(d.o > 0 ? [place(d.o, 'one', 'ones')] : []),
    ];
    return parts.length ? parts.join(', ') : '0';
  };

  const blocks = (id: string, top: number, u: number, fill: string) => {
    const { h, t, o } = digits(value(id));
    const out: ReactNode[] = [];
    const y0 = top + 18;
    const cols = flatCols(h);
    for (let i = 0; i < h; i++) {
      const x = 8 + (i % Math.max(cols, 1)) * (10 * u + 6);
      const y = y0 + Math.floor(i / Math.max(cols, 1)) * (10 * u + 4);
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
    // Rods and ones sit beside the flats, on the flats' last line.
    const y = y0 + (flatLines(h) - 1) * (10 * u + 4);
    let x = 8 + cols * (10 * u + 6);
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
          y={y + (h || t ? 10 * u : 2 * (u + 3)) - (Math.floor(i / 5) + 1) * (u + 3)}
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

  const lines = rows.map((id) => flatLines(digits(value(id)).h));
  // A row of only small cubes is short: two rows of cubes instead of a rod's height.
  const onlyOnes = rows.map((id) => {
    const d = digits(value(id));
    return d.h === 0 && d.t === 0;
  });
  const blockHeight = (r: number, u: number) =>
    onlyOnes[r] ? 2 * (u + 3) + 4 : lines[r]! * (10 * u + 4);
  // Block size from the width: room for every row's flats plus 9 rods and 5 ones, so stepping
  // the ones or tens doesn't resize the picture. The height then follows.
  const unitFor = (w: number) =>
    Math.max(
      2.5,
      Math.min(
        8,
        ...rows.map((id) => {
          const cols = flatCols(digits(value(id)).h);
          return (w - 16 - 6 * cols - 36 - 6 - 15) / (10 * cols + 9 + 5);
        }),
      ),
    );
  const heightFor = (w: number) =>
    8 + rows.reduce((sum, _, r) => sum + 26 + blockHeight(r, unitFor(w)), 0);

  return (
    <View>
      <Canvas aspect={(w) => heightFor(w) / w}>
        {({ w, h }) => {
          const u = unitFor(w);
          let top = 4;
          return (
            <Svg width={w} height={h}>
              {rows.map((id, r) => {
                const rowTop = top;
                top += 26 + blockHeight(r, u);
                const fill =
                  id === spec.total ? c.chartHighlight : r % 2 === 0 ? c.chartFill : c.chartSurface;
                return (
                  <G key={id} opacity={rep.known(id) ? 1 : 0.35}>
                    <ChartText x={8} y={rowTop + 12} fontSize={chart.small}>
                      {`${rep.variable(id).name}: ${rep.label(id)}${rep.known(id) ? `  =  ${describe(value(id))}` : ''}`}
                    </ChartText>
                    {blocks(id, rowTop, u, fill)}
                  </G>
                );
              })}
            </Svg>
          );
        }}
      </Canvas>
      {spec.compare && spec.groups.length === 2 && spec.groups.every(rep.known) ? (
        <Text style={[styles.compare, { color: c.text }]}>
          {(() => {
            const [a, b] = spec.groups.map(value) as [number, number];
            return `${a} ${a > b ? '>' : a < b ? '<' : '='} ${b}`;
          })()}
        </Text>
      ) : null}
      <Steppers
        calc={calc}
        items={spec.controls.map((k) => ({
          var: k.var,
          steps: k.steps,
          pin: controlIds.filter((x) => x !== k.var),
        }))}
      />
      <Text style={[styles.hint, { color: c.textMuted }]}>
        {hundreds
          ? 'Flats are hundreds, rods are tens, small cubes are ones.'
          : 'Rods are tens, small cubes are ones.'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  compare: { fontSize: font.title, fontWeight: '700', textAlign: 'center', marginTop: space.sm },
  hint: { fontSize: font.caption + 1, textAlign: 'center', marginTop: space.sm },
});

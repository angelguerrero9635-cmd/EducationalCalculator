import { View } from 'react-native';
import Svg, { Circle, G, Line, Rect } from 'react-native-svg';

import type { Representation } from '@/data/modules';
import { formatNumber } from '@/engine/format';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, Caption, ChartText, useRep } from './common';
import { Steppers } from './Steppers';

type Spec = Extract<Representation, { kind: 'ratioTable' }>;

/**
 * A table of equivalent ratios: two columns named after the parts, rows 1 to 4 times the
 * ratio with the typed row slotted in order and outlined, "× k" beside each row. With `graph`
 * the pairs are points on a first-quadrant plane beside the table, on one line through 0.
 */
export function RatioTable({ spec, calc }: { spec: Spec; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  const p = rep.shown(spec.first);
  const q = rep.shown(spec.second);
  const k = rep.shown(spec.times);
  const known = rep.known(spec.first) && rep.known(spec.second);
  const base = spec.rows ?? [1, 2, 3, 4];
  const current = rep.known(spec.times) ? Number(k.toFixed(4)) : undefined;
  const multipliers = [...new Set([...base, ...(current !== undefined ? [current] : [])])].sort(
    (x, y) => x - y,
  );
  const [nameA, nameB] = spec.amounts.map((id) => rep.variable(id).name);
  const header = (name: string) => name.replace(/^(First|Second) amount:? ?/i, '') || name;

  return (
    <View>
      <Canvas aspect={(w) => (spec.graph && w >= 360 ? 0.62 : 0.3 + multipliers.length * 0.09)}>
        {({ w, h }) => {
          const tableW = spec.graph && w >= 360 ? w * 0.5 : w;
          const rowH = Math.min(30, (h - 34) / (multipliers.length + 1));
          const colW = (tableW - 54) / 2;
          const x0 = 50;
          const cell = (row: number, col: number) => ({
            x: x0 + col * colW,
            y: 8 + row * rowH,
          });
          // The plane: the pairs as points, scaled to the biggest row.
          const px0 = tableW + 26;
          const pw = w - px0 - 12;
          const maxX = Math.max(1, ...multipliers.map((m) => m * p));
          const maxY = Math.max(1, ...multipliers.map((m) => m * q));
          const gx = (x: number) => px0 + (x / maxX) * pw;
          const gy = (y: number) => h - 26 - (y / maxY) * (h - 44);
          return (
            <Svg width={w} height={h} opacity={known ? 1 : 0.4}>
              {[nameA ?? '', nameB ?? ''].map((name, col) => {
                // A header wider than its column goes on two lines ("First / amount").
                const text = header(name);
                const words = text.split(' ');
                const fits = text.length * chart.small * 0.56 <= colW - 6 || words.length < 2;
                const cut = Math.ceil(words.length / 2);
                const lines = fits
                  ? [text]
                  : [words.slice(0, cut).join(' '), words.slice(cut).join(' ')];
                return lines.map((line, i) => (
                  <ChartText
                    key={`h${col}-${i}`}
                    x={cell(0, col).x + colW / 2}
                    y={cell(0, col).y + rowH * 0.66 + (i - (lines.length - 1)) * (chart.small + 1)}
                    fontSize={chart.small}
                    fontWeight="700"
                    fill={c.chartInk}
                    textAnchor="middle"
                  >
                    {line.length > 18 ? `${line.slice(0, 17)}…` : line}
                  </ChartText>
                ));
              })}
              {multipliers.map((m, i) => {
                const on = m === current;
                const row = i + 1;
                return (
                  <G key={m}>
                    <ChartText
                      x={x0 - 8}
                      y={cell(row, 0).y + rowH * 0.66}
                      fontSize={chart.small}
                      fill={on ? c.chartHighlight : c.chartMuted}
                      textAnchor="end"
                    >
                      {`× ${formatNumber(m)}`}
                    </ChartText>
                    {[m * p, m * q].map((value, col) => (
                      <G key={col}>
                        <Rect
                          x={cell(row, col).x}
                          y={cell(row, col).y}
                          width={colW}
                          height={rowH}
                          fill={on ? c.chartHighlight : c.chartSurface}
                          fillOpacity={on ? 0.25 : 1}
                          stroke={on ? c.chartHighlight : c.chartGrid}
                          strokeWidth={on ? chart.strokeHeavy : 1}
                        />
                        <ChartText
                          x={cell(row, col).x + colW / 2}
                          y={cell(row, col).y + rowH * 0.66}
                          fontSize={chart.value}
                          fontWeight={on ? '700' : '400'}
                          fill={c.chartInk}
                          textAnchor="middle"
                        >
                          {formatNumber(Number(value.toFixed(4)))}
                        </ChartText>
                      </G>
                    ))}
                  </G>
                );
              })}
              {spec.graph && w >= 360 ? (
                <G>
                  <Line x1={px0} y1={gy(0)} x2={px0 + pw} y2={gy(0)} stroke={c.chartInk} />
                  <Line x1={px0} y1={gy(0)} x2={px0} y2={8} stroke={c.chartInk} />
                  <Line
                    x1={gx(0)}
                    y1={gy(0)}
                    x2={gx(maxX)}
                    y2={gy(maxY)}
                    stroke={c.chartMuted}
                    strokeDasharray={chart.dashFine}
                  />
                  {multipliers.map((m) => (
                    <Circle
                      key={`p${m}`}
                      cx={gx(m * p)}
                      cy={gy(m * q)}
                      r={m === current ? 6 : 4}
                      fill={m === current ? c.chartHighlight : c.chartInk}
                    />
                  ))}
                  <ChartText
                    x={px0 + pw}
                    y={gy(0) + 18}
                    fontSize={chart.tiny}
                    fill={c.chartMuted}
                    textAnchor="end"
                  >
                    {header(nameA ?? '')}
                  </ChartText>
                  <ChartText x={px0 + 4} y={16} fontSize={chart.tiny} fill={c.chartMuted}>
                    {header(nameB ?? '')}
                  </ChartText>
                </G>
              ) : null}
            </Svg>
          );
        }}
      </Canvas>
      <Caption>
        {known
          ? `${formatNumber(p)} : ${formatNumber(q)}${current !== undefined ? ` is the same ratio as ${formatNumber(Number((current * p).toFixed(4)))} : ${formatNumber(Number((current * q).toFixed(4)))}. Both parts were multiplied by ${formatNumber(current)}.` : '.'}`
          : 'Type the two parts of the ratio.'}
      </Caption>
      <Steppers
        calc={calc}
        items={[{ var: spec.times, steps: [1], pin: [spec.first, spec.second] }]}
      />
    </View>
  );
}

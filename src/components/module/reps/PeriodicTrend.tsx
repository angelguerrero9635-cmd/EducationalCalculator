/**
 * A periodic trend on the table (H46, `periodicTable` with `trend`): every element shaded by
 * its atomic radius, first ionization energy or electronegativity (darker for more, blank where
 * there is no value), a key from the smallest to the largest, and arrows saying how the property
 * changes across a period and down a group. The page's element is lit with its value on a card;
 * `compare` rings a second one. Tap an element to choose it. Flat, like any chart.
 */
import { Pressable, View } from 'react-native';
import Svg, { G, Line, Path, Rect } from 'react-native-svg';

import type { Representation } from '@/data/modules';
import { formatNumber } from '@/engine/format';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { ELEMENTS, cellOf, element } from './chem';
import { TRENDS, trendValue } from './chemTrends';
import { Canvas, Caption, ChartText, useRep } from './common';
import { reader } from './graphKit';

type Spec = Extract<Representation, { kind: 'periodicTable' }>;

const LEFT = 30;
const TOP = 30;
const KEY = 44;

const tableHeight = (w: number) => {
  const cell = (w - LEFT - 4) / 18;
  return { cell, h: TOP + cell * 9.4 + KEY };
};

const placeOf = (z: number, cell: number) => {
  const { col, row } = cellOf(z);
  return { x: LEFT + col * cell, y: TOP + (row >= 8 ? row - 0.6 : row) * cell };
};

export function PeriodicTrend({ spec, calc }: { spec: Spec; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  const read = reader(rep);
  const trend = spec.trend!;
  const data = TRENDS[trend.property];
  const zr = spec.element === undefined ? undefined : read(spec.element);
  const cr = trend.compare === undefined ? undefined : read(trend.compare);
  const z = zr?.known ? Math.round(zr.value) : undefined;
  const z2 = cr?.known ? Math.round(cr.value) : undefined;
  const values = data.values.filter((v): v is number => v !== null);
  const lo = Math.min(...values);
  const hi = Math.max(...values);
  const t = (v: number) => (v - lo) / (hi - lo);
  const unit = data.unit ? ` ${data.unit}` : '';
  const show = (v: number | undefined) =>
    v === undefined ? 'no value' : `${formatNumber(v)}${unit}`;
  const el = z === undefined ? undefined : element(z);
  const el2 = z2 === undefined ? undefined : element(z2);
  const v1 = z === undefined ? undefined : trendValue(trend.property, z);
  const v2 = z2 === undefined ? undefined : trendValue(trend.property, z2);
  const tapId = typeof spec.element === 'string' ? spec.element : undefined;

  return (
    <View>
      <Canvas aspect={(w) => tableHeight(w).h / w}>
        {({ w, h }) => {
          const { cell } = tableHeight(w);
          const fs = Math.min(12, cell * 0.6);
          const right = LEFT + 18 * cell;
          const bottom = TOP + 7 * cell;
          const keyY = h - KEY + 12;
          const steps = 12;
          const kx0 = LEFT + 2 * cell;
          const kx1 = right - 2 * cell;
          const card = (x: number, y: number) => (
            <G>
              <Rect
                x={x}
                y={y}
                width={9.6 * cell}
                height={2.6 * cell}
                rx={4}
                fill={c.card}
                stroke={c.chartHighlight}
                strokeWidth={chart.strokeLight}
              />
              {el ? (
                <>
                  <ChartText x={x + 8} y={y + 0.9 * cell} fontSize={chart.value} fontWeight="700">
                    {`${el.name} (${el.symbol})`}
                  </ChartText>
                  <ChartText x={x + 8} y={y + 1.65 * cell + 2} fontSize={chart.label}>
                    {show(v1)}
                  </ChartText>
                  {el2 ? (
                    <ChartText
                      x={x + 8}
                      y={y + 2.35 * cell + 2}
                      fontSize={chart.label}
                      fill={c.chartMuted}
                    >
                      {`${el2.symbol}: ${show(v2)}`}
                    </ChartText>
                  ) : null}
                </>
              ) : (
                <ChartText x={x + 8} y={y + 1.5 * cell} fontSize={chart.label} fill={c.chartMuted}>
                  Tap an element
                </ChartText>
              )}
            </G>
          );
          return (
            <View style={{ width: w, height: h }}>
              <Svg width={w} height={h}>
                {/* Across a period, then down a group. */}
                <Line
                  x1={LEFT}
                  y1={12}
                  x2={right - 8}
                  y2={12}
                  stroke={c.chartInk}
                  strokeWidth={chart.strokeLight}
                />
                <Path d={`M ${right} 12 l -9 -5 l 0 10 z`} fill={c.chartInk} />
                <ChartText
                  x={(LEFT + right) / 2}
                  y={25}
                  fontSize={chart.label}
                  fontWeight="700"
                  textAnchor="middle"
                >
                  {`${data.across} across a period`}
                </ChartText>
                <Line
                  x1={10}
                  y1={TOP}
                  x2={10}
                  y2={bottom - 8}
                  stroke={c.chartInk}
                  strokeWidth={chart.strokeLight}
                />
                <Path d={`M 10 ${bottom} l -5 -9 l 10 0 z`} fill={c.chartInk} />
                <ChartText
                  x={24}
                  y={(TOP + bottom) / 2}
                  fontSize={chart.label}
                  fontWeight="700"
                  textAnchor="middle"
                  transform={`rotate(-90 24 ${(TOP + bottom) / 2})`}
                >
                  {`${data.down} down a group`}
                </ChartText>
                {ELEMENTS.map(([sym], i) => {
                  const zz = i + 1;
                  const { x, y } = placeOf(zz, cell);
                  const v = trendValue(trend.property, zz);
                  const k = v === undefined ? undefined : t(v);
                  return (
                    <G key={sym}>
                      <Rect
                        x={x + 0.5}
                        y={y + 0.5}
                        width={cell - 1}
                        height={cell - 1}
                        rx={1.5}
                        fill={c.chartSurface}
                        stroke={c.chartGrid}
                        strokeWidth={1}
                        strokeDasharray={k === undefined ? chart.dashFine : undefined}
                      />
                      {k !== undefined ? (
                        <Rect
                          x={x + 0.5}
                          y={y + 0.5}
                          width={cell - 1}
                          height={cell - 1}
                          rx={1.5}
                          fill={c.trendShade}
                          opacity={0.08 + 0.87 * k}
                        />
                      ) : null}
                      <ChartText
                        x={x + cell / 2}
                        y={y + cell / 2 + fs * 0.36}
                        fontSize={fs}
                        fontWeight="600"
                        textAnchor="middle"
                        fill={
                          k !== undefined && k > 0.5
                            ? c.onTrendShade
                            : k === undefined
                              ? c.chartMuted
                              : c.chartInk
                        }
                      >
                        {sym}
                      </ChartText>
                    </G>
                  );
                })}
                {[
                  { zz: z2, color: c.chartSecond },
                  { zz: z, color: c.chartHighlight },
                ].map(({ zz, color }, k) =>
                  zz === undefined || zz < 1 || zz > ELEMENTS.length ? null : (
                    <Rect
                      key={k}
                      x={placeOf(zz, cell).x - 1.5}
                      y={placeOf(zz, cell).y - 1.5}
                      width={cell + 3}
                      height={cell + 3}
                      rx={3}
                      fill="none"
                      stroke={color}
                      strokeWidth={chart.strokeHeavy}
                    />
                  ),
                )}
                {card(LEFT + 2.2 * cell, TOP + 0.05 * cell)}
                {/* Key: the lightest is the smallest value, the darkest the largest. */}
                {Array.from({ length: steps }, (_, k) => {
                  const x = kx0 + (k * (kx1 - kx0)) / steps;
                  return (
                    <G key={`k${k}`}>
                      <Rect
                        x={x}
                        y={keyY}
                        width={(kx1 - kx0) / steps}
                        height={12}
                        fill={c.chartSurface}
                      />
                      <Rect
                        x={x}
                        y={keyY}
                        width={(kx1 - kx0) / steps}
                        height={12}
                        fill={c.trendShade}
                        opacity={0.08 + (0.87 * (k + 0.5)) / steps}
                      />
                    </G>
                  );
                })}
                <Rect
                  x={kx0}
                  y={keyY}
                  width={kx1 - kx0}
                  height={12}
                  fill="none"
                  stroke={c.chartGrid}
                />
                <ChartText x={kx0 - 4} y={keyY + 10} fontSize={chart.label} textAnchor="end">
                  {formatNumber(lo)}
                </ChartText>
                <ChartText x={kx1 + 4} y={keyY + 10} fontSize={chart.label}>
                  {formatNumber(hi)}
                </ChartText>
                <ChartText
                  x={(kx0 + kx1) / 2}
                  y={keyY + 28}
                  fontSize={chart.label}
                  textAnchor="middle"
                  fill={c.chartMuted}
                >
                  {`${data.name}${unit ? ` (${data.unit})` : ''}`}
                </ChartText>
              </Svg>
              {tapId
                ? ELEMENTS.map(([sym], i) => {
                    const { x, y } = placeOf(i + 1, cell);
                    return (
                      <Pressable
                        key={`t${sym}`}
                        testID={`element-${sym}`}
                        accessibilityRole="button"
                        accessibilityLabel={`${ELEMENTS[i]![1]}, atomic number ${i + 1}`}
                        onPress={() =>
                          calc.set({ [tapId]: rep.snapTo(tapId, (i + 1) * rep.factor(tapId)) })
                        }
                        style={{ position: 'absolute', left: x, top: y, width: cell, height: cell }}
                      />
                    );
                  })
                : null}
            </View>
          );
        }}
      </Canvas>
      <Caption>
        {[
          el
            ? `${data.name} of ${el.name}: ${show(v1)}.`
            : 'Tap an element, or type its atomic number.',
          el && el2 && v1 !== undefined && v2 !== undefined
            ? `${el2.name}: ${show(v2)}, so ${v1 > v2 ? el.symbol : el2.symbol} has the ${trend.property === 'radius' ? 'larger radius' : 'higher value'}.`
            : undefined,
          `${data.name} ${data.across} across a period and ${data.down} down a group; the stronger the shade, the larger the value.`,
          trend.property === 'electronegativity'
            ? 'Dashed cells have no value: helium, neon and argon form no compounds.'
            : undefined,
        ]
          .filter(Boolean)
          .join(' · ')}
      </Caption>
    </View>
  );
}

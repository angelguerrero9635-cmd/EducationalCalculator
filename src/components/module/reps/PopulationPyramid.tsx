/**
 * HC136 `populationPyramid` (PopulationPyramidSpec in typesHe4h.ts): five-year age bars, male
 * left and female right, built from the page's three group totals and a shape; the dependent
 * groups (0–14, 65+) shaded apart from the working ages and each group bracketed with its total,
 * the dependency ratio over them. Flat; no handles.
 */
import { View } from 'react-native';
import Svg, { G, Line, Rect } from 'react-native-svg';

import type { PopulationPyramidSpec } from '@/data/modules/typesHe4h';
import { formatNumber } from '@/engine/format';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, Caption, ChartText, useRep } from './common';
import { PYRAMID_AGES, PYRAMID_GROUP, compactPeople, pyramidBars, pyramidShape } from './he4hMath';

const n3 = (x: number) => formatNumber(Number(x.toPrecision(3)));
type V = number | string | undefined;

const ROW = 15;
const TOP = 30;
const AGE_W = 44;
const BRACKET_W = 106;

export function PopulationPyramid({
  spec,
  calc,
}: {
  spec: PopulationPyramidSpec;
  calc: Calculator;
}) {
  const c = usePalette();
  const rep = useRep(calc);
  const known = (v: V) => v !== undefined && (typeof v === 'number' || rep.known(v));
  const get = (v: V): number | undefined =>
    !known(v) ? undefined : typeof v === 'number' ? v : rep.shown(v as string);
  const say = (v: V, x: number) =>
    typeof v === 'string' && rep.typed(v) ? rep.value(v, false) : n3(x);
  const Y = get(spec.young);
  const Wk = get(spec.working);
  const O = get(spec.old);
  const groups = [Y, Wk, O];
  const shape =
    spec.shape ?? (Y !== undefined && Wk !== undefined ? pyramidShape(Y, Wk) : 'stationary');
  const bars = pyramidBars(Y, Wk, O, shape);
  const most = Math.max(1e-9, ...bars.flatMap((b) => (b ? [b.male, b.female] : [])));
  const ratio = Y !== undefined && Wk && O !== undefined ? (100 * (Y + O)) / Wk : undefined;

  const lines: string[] = [];
  if (Y !== undefined && Wk && O !== undefined) {
    lines.push(
      `Youth ratio = 100 × ${say(spec.young, Y)} ÷ ${say(spec.working, Wk)} = ${say(spec.youth, (100 * Y) / Wk)}; old-age ratio = 100 × ${say(spec.old, O)} ÷ ${say(spec.working, Wk)} = ${say(spec.oldAge, (100 * O) / Wk)}.`,
      `Dependency ratio = ${say(spec.youth, (100 * Y) / Wk)} + ${say(spec.oldAge, (100 * O) / Wk)} = ${say(spec.ratio, ratio!)} dependents per 100 people of working age.`,
    );
  } else lines.push('Type the three age groups to build the pyramid.');
  lines.push(
    `The five-year bars are shaped ${shape} and add up to each group’s total; the shape inside a group is drawn, not data.`,
  );

  return (
    <View>
      <Canvas aspect={(w) => (TOP + PYRAMID_AGES.length * ROW + 40) / w}>
        {({ w }) => {
          const side = (w - 8 - AGE_W - BRACKET_W) / 2;
          const cx = 8 + side + AGE_W / 2;
          const sx = (x: number) => (x / most) * side;
          const yOf = (i: number) => TOP + (PYRAMID_AGES.length - 1 - i) * ROW;
          const bottom = TOP + PYRAMID_AGES.length * ROW;
          const bx = cx + AGE_W / 2 + side + 8;
          const tick = most * 0.8;
          return (
            <Svg width={w} height={TOP + PYRAMID_AGES.length * ROW + 40}>
              <ChartText x={cx - AGE_W / 2 - side / 2} y={16} textAnchor="middle" fontWeight="700">
                Male
              </ChartText>
              <ChartText x={cx + AGE_W / 2 + side / 2} y={16} textAnchor="middle" fontWeight="700">
                Female
              </ChartText>
              {bars.map((b, i) => {
                const y = yOf(i);
                const g = PYRAMID_GROUP[i]!;
                const fill = g === 1 ? c.chartHighlight : c.he4hCase;
                return (
                  <G key={`b${i}`}>
                    {b ? (
                      <G>
                        <Rect
                          x={cx - AGE_W / 2 - sx(b.male)}
                          y={y + 1.5}
                          width={sx(b.male)}
                          height={ROW - 3}
                          fill={fill}
                          fillOpacity={g === 1 ? 0.55 : 0.6}
                        />
                        <Rect
                          x={cx + AGE_W / 2}
                          y={y + 1.5}
                          width={sx(b.female)}
                          height={ROW - 3}
                          fill={fill}
                          fillOpacity={g === 1 ? 0.35 : 0.4}
                        />
                      </G>
                    ) : null}
                    {i % 2 === 0 || i === PYRAMID_AGES.length - 1 ? (
                      <ChartText x={cx} y={y + ROW - 3} textAnchor="middle" fill={c.chartMuted}>
                        {PYRAMID_AGES[i]!}
                      </ChartText>
                    ) : null}
                  </G>
                );
              })}
              {/* The axis: people in each bar, both ways. */}
              <Line
                x1={cx - AGE_W / 2 - side}
                y1={bottom + 2}
                x2={cx + AGE_W / 2 + side}
                y2={bottom + 2}
                stroke={c.chartInk}
                strokeWidth={chart.strokeLight}
              />
              {bars.some(Boolean)
                ? [-1, 1].map((d) => (
                    <G key={`t${d}`}>
                      <Line
                        x1={cx + d * (AGE_W / 2 + sx(tick))}
                        y1={bottom + 2}
                        x2={cx + d * (AGE_W / 2 + sx(tick))}
                        y2={bottom + 7}
                        stroke={c.chartInk}
                      />
                      <ChartText
                        x={cx + d * (AGE_W / 2 + sx(tick))}
                        y={bottom + 20}
                        textAnchor="middle"
                        fill={c.chartMuted}
                      >
                        {compactPeople(tick)}
                      </ChartText>
                    </G>
                  ))
                : null}
              <ChartText x={cx} y={bottom + 36} textAnchor="middle" fill={c.chartMuted}>
                people in each 5-year group
              </ChartText>
              {/* The groups bracketed: 0–14 and 65+ dependent, 15–64 working age. */}
              {[0, 1, 2].map((g) => {
                const rows = PYRAMID_GROUP.flatMap((x, i) => (x === g ? [i] : []));
                const y0 = yOf(rows[rows.length - 1]!) + 2;
                const y1 = yOf(rows[0]!) + ROW - 2;
                const v = groups[g];
                const name = ['0–14 young', '15–64 working', '65+ old'][g]!;
                return (
                  <G key={`g${g}`}>
                    <Line x1={bx} y1={y0} x2={bx} y2={y1} stroke={c.chartInk} strokeWidth={1.2} />
                    <Line
                      x1={bx - 4}
                      y1={y0}
                      x2={bx}
                      y2={y0}
                      stroke={c.chartInk}
                      strokeWidth={1.2}
                    />
                    <Line
                      x1={bx - 4}
                      y1={y1}
                      x2={bx}
                      y2={y1}
                      stroke={c.chartInk}
                      strokeWidth={1.2}
                    />
                    <ChartText x={bx + 6} y={(y0 + y1) / 2 - (g === 2 ? 0 : 2)} fontWeight="700">
                      {name}
                    </ChartText>
                    {v !== undefined ? (
                      <ChartText
                        x={bx + 6}
                        y={(y0 + y1) / 2 + (g === 2 ? 14 : 12)}
                        fill={c.chartMuted}
                      >
                        {compactPeople(v)}
                      </ChartText>
                    ) : null}
                  </G>
                );
              })}
              {ratio !== undefined ? (
                <ChartText x={w - 4} y={16} textAnchor="end" fontWeight="700" fill={c.he4hCase}>
                  {`ratio ${say(spec.ratio, ratio)}`}
                </ChartText>
              ) : null}
            </Svg>
          );
        }}
      </Canvas>
      <Caption>{lines.join(' ')}</Caption>
    </View>
  );
}

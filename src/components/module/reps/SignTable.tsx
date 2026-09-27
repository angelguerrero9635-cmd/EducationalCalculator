import { Pressable, View } from 'react-native';
import Svg, { Line, Rect } from 'react-native-svg';

import type { Representation } from '@/data/modules';
import { formatNumber } from '@/engine/format';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, Caption, ChartText, fitLabel, useRep } from './common';
import { Steppers } from './Steppers';

type Spec = Extract<Representation, { kind: 'signTable' }>;

const HEAD = 34;
const CELL = 74;

/**
 * The sign rule for multiplying or dividing: rows for the first number positive or negative,
 * columns for the second, and in each cell the sign of the answer. The cell the numbers fall in
 * is outlined, with their equation in it. Tap a cell to give the numbers those signs.
 */
export function SignTable({ spec, calc }: { spec: Spec; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  const op = spec.op ?? '×';
  const known = rep.known(spec.first) && rep.known(spec.second);
  const a = rep.shown(spec.first);
  const b = rep.shown(spec.second);
  // The cell the numbers are in (none while one is 0 or "?").
  const row = known && a !== 0 ? (a > 0 ? 0 : 1) : undefined;
  const col = known && b !== 0 ? (b > 0 ? 0 : 1) : undefined;
  const name = (id: string) => (rep.words ? '' : `${rep.variable(id).symbol} `);
  const n = (x: number) => (x < 0 ? `(${formatNumber(x)})` : formatNumber(x));
  const result = rep.known(spec.result) ? formatNumber(rep.shown(spec.result)) : '?';
  const equation = `${formatNumber(a)} ${op} ${n(b)} = ${result}`;
  const SIGNS = ['+', '−'] as const;
  const WORDS = ['positive', 'negative'] as const;

  return (
    <View>
      <Canvas aspect={(w) => (HEAD + 2 * CELL + 4) / w}>
        {({ w, h }) => {
          const side = Math.min(96, w * 0.26);
          const cw = (w - side - 2) / 2;
          const x = (j: number) => side + j * cw;
          const y = (i: number) => HEAD + i * CELL;
          const setSigns = (i: number, j: number) =>
            calc.set({
              [spec.first]: Math.abs(rep.val(spec.first) || 1) * (i === 0 ? 1 : -1),
              [spec.second]: Math.abs(rep.val(spec.second) || 1) * (j === 0 ? 1 : -1),
            });
          return (
            <>
              <Svg width={w} height={h}>
                <Rect x={0} y={0} width={w} height={HEAD} fill={c.chartSurface} />
                <Rect x={0} y={0} width={side} height={h} fill={c.chartSurface} />
                <ChartText
                  x={side / 2}
                  y={HEAD / 2 + 5}
                  fontSize={chart.emphasis}
                  fontWeight="700"
                  textAnchor="middle"
                >
                  {rep.words ? op : `${name(spec.first)}${op} ${rep.variable(spec.second).symbol}`}
                </ChartText>
                {[0, 1].map((j) => (
                  <ChartText
                    key={`c${j}`}
                    x={x(j) + cw / 2}
                    y={HEAD / 2 + 4}
                    fontSize={chart.label}
                    fontWeight="700"
                    textAnchor="middle"
                  >
                    {`${name(spec.second)}${WORDS[j]} (${SIGNS[j]})`}
                  </ChartText>
                ))}
                {[0, 1].map((i) => (
                  <ChartText
                    key={`r${i}`}
                    x={side / 2}
                    y={y(i) + CELL / 2 + 4}
                    fontSize={chart.label}
                    fontWeight="700"
                    textAnchor="middle"
                  >
                    {`${name(spec.first)}${WORDS[i]} (${SIGNS[i]})`}
                  </ChartText>
                ))}
                {[0, 1].flatMap((i) =>
                  [0, 1].map((j) => {
                    const here = i === row && j === col;
                    return (
                      <Rect
                        key={`f${i}${j}`}
                        x={x(j)}
                        y={y(i)}
                        width={cw}
                        height={CELL}
                        fill={here ? c.chartHighlight : c.card}
                        fillOpacity={here ? 0.14 : 1}
                      />
                    );
                  }),
                )}
                {[0.5, side, x(1), w - 1].map((lx, k) => (
                  <Line key={`vv${k}`} x1={lx} y1={0} x2={lx} y2={y(2)} stroke={c.chartGrid} />
                ))}
                {[0, HEAD, y(1), y(2)].map((ly, k) => (
                  <Line key={`h${k}`} x1={0} y1={ly} x2={w - 1} y2={ly} stroke={c.chartGrid} />
                ))}
                {[0, 1].flatMap((i) =>
                  [0, 1].map((j) => {
                    const here = i === row && j === col;
                    const positive = i === j;
                    return (
                      <ChartText
                        key={`s${i}${j}`}
                        x={x(j) + cw / 2}
                        y={y(i) + (here ? 30 : 36)}
                        fontSize={26}
                        fontWeight="700"
                        fill={here ? c.chartHighlight : c.chartInk}
                        textAnchor="middle"
                      >
                        {positive ? '+' : '−'}
                      </ChartText>
                    );
                  }),
                )}
                {[0, 1].flatMap((i) =>
                  [0, 1].map((j) => {
                    const here = i === row && j === col;
                    const text = here ? equation : WORDS[i === j ? 0 : 1];
                    return (
                      <ChartText
                        key={`w${i}${j}`}
                        {...fitLabel(x(j) + cw / 2, text, chart.label, w)}
                        y={y(i) + (here ? 56 : 58)}
                        fontSize={here ? chart.label : chart.small}
                        fontWeight={here ? '700' : '400'}
                        fill={here ? c.chartInk : c.chartMuted}
                      >
                        {text}
                      </ChartText>
                    );
                  }),
                )}
                {row !== undefined && col !== undefined ? (
                  <Rect
                    x={x(col) + 1}
                    y={y(row) + 1}
                    width={cw - 2}
                    height={CELL - 2}
                    fill="none"
                    stroke={c.chartHighlight}
                    strokeWidth={chart.strokeHeavy}
                  />
                ) : null}
              </Svg>
              {[0, 1].flatMap((i) =>
                [0, 1].map((j) => (
                  <Pressable
                    key={`p${i}${j}`}
                    testID={`sign-${i}${j}`}
                    accessibilityLabel={`First number ${WORDS[i]}, second number ${WORDS[j]}`}
                    onPress={() => setSigns(i, j)}
                    style={{
                      position: 'absolute',
                      left: x(j),
                      top: y(i),
                      width: cw,
                      height: CELL,
                    }}
                  />
                )),
              )}
            </>
          );
        }}
      </Canvas>
      <Caption>{caption()}</Caption>
      <Steppers
        calc={calc}
        items={[
          { var: spec.first, steps: [1], pin: [spec.second] },
          { var: spec.second, steps: [1], pin: [spec.first] },
        ]}
      />
    </View>
  );

  function caption() {
    if (!known) return 'Type both numbers, or tap a cell to pick their signs.';
    if (a === 0 || b === 0)
      return op === '÷' && b === 0
        ? 'You can’t divide by 0.'
        : `${equation} · 0 is neither positive nor negative.`;
    const same = a > 0 === b > 0;
    return `${equation} · ${same ? 'Same signs' : 'Different signs'}: the answer is ${same ? 'positive' : 'negative'}.`;
  }
}

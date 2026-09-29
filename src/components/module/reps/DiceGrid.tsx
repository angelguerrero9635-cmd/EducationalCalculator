import { Pressable, View } from 'react-native';
import Svg, { Circle, Defs, G, Rect } from 'react-native-svg';

import type { Representation } from '@/data/modules';
import { formatNumber } from '@/engine/format';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, Caption, ChartText, useRep } from './common';
import { chanceText } from './chance';
import { diceCount, diceValue, inEvent } from './dice';
import { TopLight, url, usePaintIds } from './paint';

type Spec = Extract<Representation, { kind: 'diceGrid' }>;

const COMPARE_WORDS = {
  '=': 'of',
  '<': 'less than',
  '≤': 'of at most',
  '>': 'greater than',
  '≥': 'of at least',
} as const;

/** Pip places on a die face (in thirds of the face), for 1 to 6. */
const PIPS: Record<number, [number, number][]> = {
  1: [[1, 1]],
  2: [
    [0, 0],
    [2, 2],
  ],
  3: [
    [0, 0],
    [1, 1],
    [2, 2],
  ],
  4: [
    [0, 0],
    [2, 0],
    [0, 2],
    [2, 2],
  ],
  5: [
    [0, 0],
    [2, 0],
    [1, 1],
    [0, 2],
    [2, 2],
  ],
  6: [
    [0, 0],
    [2, 0],
    [0, 1],
    [2, 1],
    [0, 2],
    [2, 2],
  ],
};

/**
 * Every way two dice can land, as a 6 × 6 grid: the red die down the side, the white die
 * across the top, each cell showing their sum (or difference, or product). The cells in the
 * event are shaded and counted; tap a cell to make its number the target.
 */
export function DiceGrid({ spec, calc }: { spec: Spec; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  const ids = usePaintIds('die');
  const event = spec.event ?? 'sum';
  const compare = spec.compare ?? '=';
  const known = rep.known(spec.target);
  const t = rep.shown(spec.target);
  const count = known ? diceCount(event, compare, t) : undefined;
  const word = event === 'sum' ? 'sum' : event === 'difference' ? 'difference' : 'product';
  const sym = (id: string) => (rep.words ? rep.variable(id).name : rep.variable(id).symbol);
  const target = known ? formatNumber(t) : '?';
  const eventText = `${word}${compare === '=' ? ' of' : ` ${compare}`} ${target}`;
  /** The event in words for the caption: "a sum of at least 10". */
  const eventWords = `${word} ${COMPARE_WORDS[compare]} ${target}`;

  const die = (x: number, y: number, s: number, pips: number, red: boolean, key: string) => {
    const pad = s * 0.24;
    const step = (s - 2 * pad) / 2;
    return (
      <G key={key}>
        <Rect x={x + 1} y={y + 2} width={s} height={s} rx={s * 0.2} fill={c.shadow} />
        <Rect
          x={x}
          y={y}
          width={s}
          height={s}
          rx={s * 0.2}
          fill={red ? c.blockRed : c.snow}
          stroke={red ? c.blockRed : c.metalDark}
          strokeWidth={0.75}
        />
        <Rect x={x} y={y} width={s} height={s} rx={s * 0.2} fill={url(ids.die)} />
        {PIPS[pips]!.map(([i, j], k) => (
          <Circle
            key={k}
            cx={x + pad + i * step}
            cy={y + pad + j * step}
            r={s * 0.085}
            fill={red ? c.snow : c.coinInk}
          />
        ))}
      </G>
    );
  };

  return (
    <View>
      <Canvas aspect={1.02}>
        {({ w, h }) => {
          const head = Math.min(44, w * 0.12);
          const cell = Math.min((w - head - 8) / 6, (h - head - 8) / 6);
          const x0 = (w - (head + 6 * cell)) / 2 + head;
          const y0 = head + 4;
          const ds = Math.min(cell * 0.72, head - 8);
          return (
            <>
              <Svg width={w} height={h}>
                <Defs>
                  <TopLight id={ids.die} strength={0.9} />
                </Defs>
                {[1, 2, 3, 4, 5, 6].map((b) =>
                  die(
                    x0 + (b - 1) * cell + (cell - ds) / 2,
                    (head - ds) / 2,
                    ds,
                    b,
                    false,
                    `t${b}`,
                  ),
                )}
                {[1, 2, 3, 4, 5, 6].map((a) =>
                  die(
                    x0 - head + (head - ds) / 2,
                    y0 + (a - 1) * cell + (cell - ds) / 2,
                    ds,
                    a,
                    true,
                    `s${a}`,
                  ),
                )}
                {[1, 2, 3, 4, 5, 6].flatMap((a) =>
                  [1, 2, 3, 4, 5, 6].map((b) => {
                    const v = diceValue(event, a, b);
                    const on = known && inEvent(compare, v, t);
                    const x = x0 + (b - 1) * cell;
                    const y = y0 + (a - 1) * cell;
                    return (
                      <G key={`${a}-${b}`}>
                        <Rect
                          x={x}
                          y={y}
                          width={cell}
                          height={cell}
                          fill={on ? c.chartHighlight : c.chartSurface}
                          stroke={c.chartGrid}
                          strokeWidth={1}
                        />
                        <ChartText
                          x={x + cell / 2}
                          y={y + cell / 2 + 5}
                          fontSize={chart.value}
                          fontWeight={on ? '700' : '400'}
                          fill={on ? c.onChartHighlight : c.chartInk}
                          textAnchor="middle"
                        >
                          {formatNumber(v)}
                        </ChartText>
                      </G>
                    );
                  }),
                )}
                <Rect
                  x={x0}
                  y={y0}
                  width={6 * cell}
                  height={6 * cell}
                  fill="none"
                  stroke={c.chartInk}
                  strokeWidth={chart.strokeLight}
                />
              </Svg>
              {/* Tap a cell: its number becomes the target. */}
              {[1, 2, 3, 4, 5, 6].flatMap((a) =>
                [1, 2, 3, 4, 5, 6].map((b) => (
                  <Pressable
                    key={`p${a}-${b}`}
                    testID={`dice-${a}-${b}`}
                    accessibilityLabel={`Red ${a}, white ${b}: ${word} ${diceValue(event, a, b)}`}
                    onPress={() =>
                      calc.set({
                        [spec.target]: rep.snapTo(
                          spec.target,
                          diceValue(event, a, b) * rep.factor(spec.target),
                        ),
                      })
                    }
                    style={{
                      position: 'absolute',
                      left: x0 + (b - 1) * cell,
                      top: y0 + (a - 1) * cell,
                      width: cell,
                      height: cell,
                    }}
                  />
                )),
              )}
            </>
          );
        }}
      </Canvas>
      <Caption>
        {[
          'Red die down the side, white die across the top: 36 equally likely pairs.',
          count !== undefined
            ? `${spec.count ? `${sym(spec.count)} = ` : ''}${count} pairs have a ${eventWords}.`
            : `Type the target: pairs with a ${eventWords}.`,
          spec.chance && count !== undefined
            ? `${rep.words ? rep.variable(spec.chance).name : `${sym(spec.chance)}(${eventText})`} = ${chanceText(count, 36, rep.value(spec.chance), rep.shown(spec.chance))}`
            : undefined,
        ]
          .filter(Boolean)
          .join(' · ')}
      </Caption>
    </View>
  );
}

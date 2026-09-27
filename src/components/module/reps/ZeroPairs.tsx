import { View } from 'react-native';
import Svg, { Circle, Defs, G, Path, Rect } from 'react-native-svg';

import type { Representation } from '@/data/modules';
import { formatNumber } from '@/engine/format';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, Caption, ChartText, useRep } from './common';
import { Ball, url, usePaintIds } from './paint';
import { Steppers } from './Steppers';

type Spec = Extract<Representation, { kind: 'zeroPairs' }>;

/** Counters a row holds at most before it wraps onto another line of pairs. */
const PER_LINE = 10;
/** Counters of each sign the picture draws at most. */
export const ZERO_PAIRS_MAX = 20;

/** One counter: its row (+ or −), column, and whether it was added as a zero pair or taken away. */
interface Counter {
  plus: boolean;
  col: number;
  added: boolean;
  out: boolean;
}

/**
 * Where every counter goes. Adding: all the counters of both numbers, each + over a − as a zero
 * pair, the rest left over. Subtracting: the first number's counters, zero pairs added when
 * there are too few of the kind to take away, then that many taken away (crossed out).
 */
export function layOut(a: number, b: number, subtract: boolean) {
  const counters: Counter[] = [];
  const row = (plus: boolean, from: number, n: number, added = false) => {
    for (let i = 0; i < n; i++) counters.push({ plus, col: from + i, added, out: false });
  };
  let added = 0;
  if (!subtract) {
    const pos = Math.max(0, a) + Math.max(0, b);
    const neg = Math.max(0, -a) + Math.max(0, -b);
    row(true, 0, pos);
    row(false, 0, neg);
    return { counters, pairs: Math.min(pos, neg), added, cols: Math.max(pos, neg) };
  }
  // Subtracting: start with the first number, take away the second.
  const aPlus = a >= 0;
  row(aPlus, 0, Math.abs(a));
  const takePlus = b >= 0;
  const have = aPlus === takePlus ? Math.abs(a) : 0;
  added = Math.max(0, Math.abs(b) - have);
  row(true, Math.abs(a), added, true);
  row(false, Math.abs(a), added, true);
  // Take the second number's counters away, the added ones first.
  const kind = counters.filter((x) => x.plus === takePlus).sort((x, y) => y.col - x.col);
  kind.slice(0, Math.abs(b)).forEach((x) => (x.out = true));
  return { counters, pairs: 0, added, cols: Math.abs(a) + added };
}

/**
 * Two-color counters for adding and subtracting integers: yellow positive (+) and red negative
 * (−) counters, one row each. Adding pairs each + with a − (a zero pair, circled, is 0); the
 * counters left over are the answer. Subtracting takes the second number's counters away,
 * adding zero pairs first when there aren't enough.
 */
export function ZeroPairs({ spec, calc }: { spec: Spec; calc: Calculator }) {
  const c = usePalette();
  const paint = usePaintIds('plus', 'minus');
  const rep = useRep(calc);
  const subtract = spec.op === '−';
  const a = rep.shown(spec.first);
  const b = rep.shown(spec.second);
  const whole = Number.isInteger(a) && Number.isInteger(b);
  const cap = (x: number) => Math.max(-ZERO_PAIRS_MAX, Math.min(ZERO_PAIRS_MAX, x));
  const { counters, pairs, added, cols } = whole
    ? layOut(cap(a), cap(b), subtract)
    : { counters: [], pairs: 0, added: 0, cols: 0 };
  const per = cols <= 12 ? Math.max(cols, 1) : PER_LINE;
  const lines = Math.max(1, Math.ceil(cols / per));
  const LINE = 2; // rows (+ and −) in a line of pairs

  return (
    <View>
      <Canvas
        aspect={(w) => {
          const s = Math.min(38, (w - 40) / Math.max(per, 6));
          return (lines * (LINE * s + 16) + 12) / w;
        }}
      >
        {({ w, h }) => {
          const left = 34;
          const s = Math.min(38, (w - 40) / Math.max(per, 6));
          const r = s * 0.38;
          const x0 = left + (w - left - 6 - per * s) / 2;
          const at = (x: Counter) => {
            const line = Math.floor(x.col / per);
            const top = 6 + line * (LINE * s + 16);
            return {
              cx: x0 + (x.col % per) * s + s / 2,
              cy: top + (x.plus ? 0 : s) + s / 2,
              top,
            };
          };
          // A zero pair's outline: a + over a − in one column.
          const outlined = Array.from({ length: pairs + added }, (_, i) =>
            subtract ? Math.abs(a) + i : i,
          );
          return (
            <Svg width={w} height={h}>
              <Defs>
                <Ball id={paint.plus} color={c.chartSecond} />
                <Ball id={paint.minus} color={c.blockRed} />
              </Defs>
              {Array.from({ length: lines }, (_, line) => {
                const top = 6 + line * (LINE * s + 16);
                return (
                  <G key={`row${line}`}>
                    {/* What each counter in the row is worth. */}
                    {[
                      { t: '+1', y: top + s / 2 + 4 },
                      { t: '−1', y: top + s + s / 2 + 4 },
                    ].map(({ t, y }) => (
                      <ChartText
                        key={t}
                        x={x0 - 6}
                        y={y}
                        fontSize={chart.small}
                        fontWeight="700"
                        fill={c.chartMuted}
                        textAnchor="end"
                      >
                        {t}
                      </ChartText>
                    ))}
                  </G>
                );
              })}
              {outlined.map((col) => {
                const { cx, top } = at({ plus: true, col, added: false, out: false });
                return (
                  <Rect
                    key={`pair${col}`}
                    x={cx - s / 2 + 1.5}
                    y={top + 1.5}
                    width={s - 3}
                    height={2 * s - 3}
                    rx={s / 2 - 1.5}
                    fill="none"
                    stroke={subtract ? c.chartMuted : c.chartInk}
                    strokeWidth={chart.strokeLight}
                    strokeDasharray={subtract ? chart.dashFine : undefined}
                  />
                );
              })}
              {counters.map((x, i) => {
                const { cx, cy } = at(x);
                return (
                  <G key={i}>
                    <G opacity={x.out ? 0.35 : 1}>
                      <Circle
                        cx={cx}
                        cy={cy}
                        r={r}
                        fill={url(x.plus ? paint.plus : paint.minus)}
                        stroke={c.chartInk}
                        strokeWidth={chart.strokeLight}
                      />
                      <ChartText
                        x={cx}
                        y={cy + r * 0.42}
                        fontSize={Math.max(chart.tiny, r * 1.2)}
                        fontWeight="700"
                        fill={x.plus ? c.coinInk : c.onBlock}
                        textAnchor="middle"
                      >
                        {x.plus ? '+' : '−'}
                      </ChartText>
                    </G>
                    {x.out ? (
                      <Path
                        d={`M ${cx - r} ${cy - r} L ${cx + r} ${cy + r} M ${cx + r} ${cy - r} L ${cx - r} ${cy + r}`}
                        stroke={c.chartInk}
                        strokeWidth={chart.stroke}
                      />
                    ) : null}
                  </G>
                );
              })}
            </Svg>
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
    if (!rep.known(spec.first) || !rep.known(spec.second))
      return 'Type both numbers to lay out their counters.';
    if (!whole)
      return 'Counters show whole numbers. Use the number line for fractions and decimals.';
    if (Math.abs(a) > ZERO_PAIRS_MAX || Math.abs(b) > ZERO_PAIRS_MAX)
      return `The counters go up to ${ZERO_PAIRS_MAX} of each kind.`;
    const n = (x: number) => (x < 0 ? `(${formatNumber(x)})` : formatNumber(x));
    const result = rep.known(spec.result) ? formatNumber(rep.shown(spec.result)) : '?';
    const sum = `${formatNumber(a)} ${subtract ? '−' : '+'} ${n(b)} = ${result}`;
    // What is left once the zero pairs are 0: the answer, counted.
    const net = counters.reduce((t, x) => t + (x.out ? 0 : x.plus ? 1 : -1), 0);
    const kinds = (k: number, positive: boolean) =>
      `${k} ${positive ? 'positive' : 'negative'} counter${k === 1 ? '' : 's'}`;
    const leftOver = !rep.known(spec.result)
      ? ''
      : net === 0
        ? 'Nothing is left over: 0.'
        : `${kinds(Math.abs(net), net > 0)} left: ${formatNumber(net)}.`;
    if (subtract) {
      const take = `take away ${kinds(Math.abs(b), b >= 0)}`;
      return [
        sum,
        added
          ? `Add ${added} zero pair${added === 1 ? '' : 's'}, then ${take}.`
          : `${take[0]!.toUpperCase()}${take.slice(1)}.`,
        leftOver,
      ]
        .filter(Boolean)
        .join(' · ');
    }
    return [sum, pairs ? `${pairs} zero pair${pairs === 1 ? '' : 's'} make 0.` : '', leftOver]
      .filter(Boolean)
      .join(' · ');
  }
}

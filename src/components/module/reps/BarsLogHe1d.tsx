/**
 * HC9 (college round 1, group D): `bars` with `log`, a bar chart on a log scale (a signal's
 * amplification, stage by stage: 1, 20, 20,000). Decade grid lines with minor lines at 2–9;
 * each bar from the bottom decade up to its value, its value on top. A value of 0 or below has
 * no place on a log scale: its bar isn't drawn and the caption says so. No handles (the values
 * are typed in their boxes). Flat.
 */
import { View } from 'react-native';
import Svg, { Line, Rect } from 'react-native-svg';

import type { Representation } from '@/data/modules';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, Caption, ChartText, useRep } from './common';
import { textW } from './he1dText';
import { axisMap, decadeText, decadesAround, logTicks } from './functionGraphHe1dMath';

type Spec = Extract<Representation, { kind: 'bars' }>;

export function BarsLogHe1d({ spec, calc }: { spec: Spec; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  const bars = spec.bars.map((b) => ({
    id: b.var,
    v: rep.known(b.var) ? rep.shown(b.var) : undefined,
    name: rep.variable(b.var).name,
    symbol: rep.variable(b.var).symbol,
  }));
  const pos = bars.map((b) => b.v).filter((v): v is number => v !== undefined && v > 0);
  const [lo, hi0] = decadesAround(Math.min(1, ...pos), Math.max(10, ...pos));
  const hi = hi0 === Math.max(10, ...pos) ? hi0 * 10 : hi0;
  const refused = bars.filter((b) => b.v !== undefined && !(b.v > 0));
  const captions = [
    'A log scale: each grid line up is 10 times the one below.',
    ...refused.map((b) => `${b.symbol} = ${rep.value(b.id)} isn’t drawn: a log scale has no 0.`),
  ];
  const ticks = logTicks(lo, hi);
  const map = axisMap(lo, hi, true);

  return (
    <View>
      <Canvas aspect={(w) => (w * 0.6 + 70) / w}>
        {({ w, h }) => {
          const labels = ticks.major.map(decadeText);
          const L = Math.max(34, Math.max(...labels.map((s) => textW(s, chart.label))) + 12);
          const top = 16;
          const bottom = h - 58;
          const ph = bottom - top;
          const pw = w - L - 12;
          const y = (v: number) => bottom - (map(v) ?? 0) * ph;
          const slot = pw / bars.length;
          const bw = Math.min(56, slot * 0.6);
          return (
            <Svg width={w} height={h}>
              {ticks.minor.map((v) => (
                <Line
                  key={`m${v}`}
                  x1={L}
                  x2={L + pw}
                  y1={y(v)}
                  y2={y(v)}
                  stroke={c.chartGrid}
                  strokeWidth={0.6}
                />
              ))}
              {ticks.major.map((v, i) => (
                <Line
                  key={`M${v}`}
                  x1={L}
                  x2={L + pw}
                  y1={y(v)}
                  y2={y(v)}
                  stroke={c.chartGrid}
                  strokeWidth={1}
                />
              ))}
              {ticks.major.map((v, i) => (
                <ChartText
                  key={`n${v}`}
                  x={L - 5}
                  y={y(v) + 4}
                  fontSize={chart.label}
                  fill={c.chartMuted}
                  textAnchor="end"
                >
                  {labels[i]}
                </ChartText>
              ))}
              <Line
                x1={L}
                x2={L}
                y1={top}
                y2={bottom}
                stroke={c.chartInk}
                strokeWidth={chart.strokeLight}
              />
              <Line
                x1={L}
                x2={L + pw}
                y1={bottom}
                y2={bottom}
                stroke={c.chartInk}
                strokeWidth={chart.strokeLight}
              />
              {bars.map((b, i) => {
                const cx = L + slot * (i + 0.5);
                const ok = b.v !== undefined && b.v > 0;
                const by = ok ? y(b.v!) : bottom;
                return [
                  ok ? (
                    <Rect
                      key={`b${i}`}
                      x={cx - bw / 2}
                      y={by}
                      width={bw}
                      height={Math.max(0, bottom - by)}
                      fill={c.chartHighlight}
                      stroke={c.chartInk}
                      strokeWidth={1}
                    />
                  ) : null,
                  <ChartText
                    key={`v${i}`}
                    x={cx}
                    y={by - 6}
                    fontSize={chart.value}
                    fill={c.chartInk}
                    textAnchor="middle"
                    fontWeight="600"
                  >
                    {b.v === undefined ? '?' : rep.value(b.id, false)}
                  </ChartText>,
                  <ChartText
                    key={`s${i}`}
                    x={cx}
                    y={bottom + 16}
                    fontSize={chart.label}
                    fill={c.chartInk}
                    textAnchor="middle"
                    fontStyle="italic"
                  >
                    {b.symbol}
                  </ChartText>,
                  ...nameLines(b.name, Math.floor((slot - 4) / (chart.label * 0.56))).map(
                    (line, k) => (
                      <ChartText
                        key={`t${i}-${k}`}
                        x={cx}
                        y={bottom + 32 + 14 * k}
                        fontSize={chart.label}
                        fill={c.chartMuted}
                        textAnchor="middle"
                      >
                        {line}
                      </ChartText>
                    ),
                  ),
                ];
              })}
            </Svg>
          );
        }}
      </Canvas>
      <Caption>{captions.join(' · ')}</Caption>
    </View>
  );
}

/** A bar's name in at most two lines of `max` characters, broken between words. */
function nameLines(name: string, max: number): string[] {
  const lines: string[] = [];
  for (const word of name.split(' ')) {
    const last = lines[lines.length - 1];
    if (last !== undefined && `${last} ${word}`.length <= max)
      lines[lines.length - 1] = `${last} ${word}`;
    else lines.push(word);
  }
  if (lines.length <= 2) return lines.map((l) => (l.length > max ? `${l.slice(0, max - 1)}…` : l));
  const second = lines.slice(1).join(' ');
  return [lines[0]!, `${second.slice(0, Math.max(3, max - 1))}…`];
}

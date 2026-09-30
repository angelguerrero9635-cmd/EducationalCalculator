import { useRef } from 'react';
import { View } from 'react-native';
import Svg, { Circle, G, Line, Path } from 'react-native-svg';

import type { Representation } from '@/data/modules';
import { formatNumber } from '@/engine/format';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, Caption, ChartText, DragHandle, fitLabel, useFrozen, useRep } from './common';
import { tickStep } from './IntegerLine';
import { closedEnd } from './signBox';

type Spec = Extract<Representation, { kind: 'integerLine' }>;

/** "|x − 1|", "|x + 3|", "|x|". */
const absText = (x: string, c: number) =>
  c === 0 ? `|${x}|` : `|${x} ${c < 0 ? '+' : '−'} ${formatNumber(Math.abs(c))}|`;

/**
 * A compound inequality on a number line (H17). 'and': the stretch between the two bounds,
 * both parts true at once; 'or': two rays outward, either part true. With a center and a
 * radius it is |x − c| < d (the numbers less than d from c) or > d, the center marked and the
 * distance bracketed to each bound. Bounds are open (left out) or closed (taken in) circles;
 * a test number is marked true or false. The bounds (or the center and the radius) and the
 * test number drag.
 */
export function CompoundLine({ spec, calc }: { spec: Spec; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  const start = useRef(0);
  const cp = spec.compound!;
  const and = cp.join === 'and';
  // H90: each end fixed, or closed while its sign box holds ≤ or ≥.
  const readId = (id: string) => (rep.known(id) ? rep.shown(id) : undefined);
  const [closedLo, closedHi] = (cp.closed ?? [false, false]).map((e) => closedEnd(e, readId));
  const x = cp.letter ?? 'x';
  const lo = rep.shown(spec.value);
  const hi = spec.second ? rep.shown(spec.second) : lo;
  const known = rep.known(spec.value) && !!spec.second && rep.known(spec.second);
  const distance = cp.center && cp.radius ? { c: cp.center, r: cp.radius } : undefined;
  const center = distance ? rep.shown(distance.c) : undefined;
  const radius = distance ? rep.shown(distance.r) : undefined;
  const test = cp.test && rep.known(cp.test) ? rep.shown(cp.test) : undefined;
  const unit = spec.unit ?? '';
  const num = (v: number) => `${formatNumber(v)}${unit ? ` ${unit}` : ''}`;
  const n = formatNumber;
  const paren = (v: number) => (v < 0 ? `(${n(v)})` : n(v));
  const signLo = and ? (closedLo ? '≤' : '<') : closedLo ? '≤' : '<';
  const signHi = and ? (closedHi ? '≤' : '<') : closedHi ? '≥' : '>';
  const inLo = (v: number) => (closedLo ? v >= lo : v > lo);
  const inHi = (v: number) => (closedHi ? v <= hi : v < hi);
  const outHi = (v: number) => (closedHi ? v >= hi : v > hi);
  const outLo = (v: number) => (closedLo ? v <= lo : v < lo);
  const holds = (v: number) => (and ? inLo(v) && inHi(v) : outLo(v) || outHi(v));
  // 'and' with nothing between the bounds; 'or' whose rays meet or pass.
  const empty = and && !(lo < hi || (lo === hi && closedLo && closedHi));
  const everything = !and && (hi < lo || (hi === lo && (closedLo || closedHi)));
  const statement = distance
    ? `${absText(x, center!)} ${and ? signLo : closedLo ? '≥' : '>'} ${n(radius!)}`
    : and
      ? `${n(lo)} ${signLo} ${x} ${signHi} ${n(hi)}`
      : `${x} ${signLo} ${n(lo)} or ${x} ${signHi} ${n(hi)}`;

  const extent = useFrozen(
    (() => {
      const pts = [lo, hi, ...(test === undefined ? [] : [test])];
      const a = Math.min(spec.min, ...pts.map((p) => p - 1));
      const b = Math.max(spec.max, ...pts.map((p) => p + 1));
      const s = tickStep(b - a);
      return [Math.floor(a / s) * s, Math.ceil(b / s) * s] as [number, number];
    })(),
  );
  const [from, to] = extent.value;
  const step = tickStep(to - from);
  const H = distance ? 206 : 170;

  /** The sentence for the test number. */
  const testLine = () => {
    if (test === undefined) return '';
    if (distance) {
      const d = Math.abs(test - center!);
      const s = and ? signLo : closedLo ? '≥' : '>';
      return `Test ${num(test)}: ${absText(n(test), center!)} = ${n(d)}, and ${n(d)} ${s} ${n(radius!)} is ${holds(test)}.`;
    }
    const parts = and
      ? [
          `${n(test)} ${closedLo ? '≥' : '>'} ${n(lo)} is ${inLo(test)}`,
          `${n(test)} ${signHi} ${n(hi)} is ${inHi(test)}`,
        ]
      : [
          `${n(test)} ${signLo} ${n(lo)} is ${outLo(test)}`,
          `${n(test)} ${signHi} ${n(hi)} is ${outHi(test)}`,
        ];
    return `Test ${num(test)}: ${parts.join(', ')}: ${
      holds(test)
        ? and
          ? 'both true, a solution.'
          : 'one part is enough, a solution.'
        : and
          ? 'not both, not a solution.'
          : 'neither, not a solution.'
    }`;
  };

  const words = !known
    ? 'Type both bounds to draw the solutions.'
    : distance
      ? `${statement}: every number ${
          and ? (closedLo ? 'at most' : 'less than') : closedLo ? 'at least' : 'more than'
        } ${n(radius!)} from ${n(center!)} · ${n(center!)} − ${paren(radius!)} = ${n(lo)} · ${n(center!)} + ${paren(radius!)} = ${n(hi)} · So ${
          and
            ? empty
              ? 'no number is that close: no solution'
              : `${n(lo)} ${signLo} ${x} ${signHi} ${n(hi)}`
            : everything
              ? `every number is a solution`
              : `${x} ${signLo} ${n(lo)} or ${x} ${signHi} ${n(hi)}`
        }.`
      : and
        ? empty
          ? `${statement}: no number is past ${n(lo)} and before ${n(hi)} at once. No solution.`
          : `${statement}: ${n(lo)} ${signLo} ${x} and ${x} ${signHi} ${n(hi)}, both true at once: the numbers between.`
        : everything
          ? `${statement}: the two parts overlap, so together they take in every number.`
          : `${statement}: a number in either part is a solution.`;
  const circles = !known
    ? ''
    : closedLo === closedHi
      ? ` ${closedLo ? `Both circles are closed: ${n(lo)} and ${n(hi)} are taken in.` : `Both circles are open: ${n(lo)} and ${n(hi)} are left out.`}`
      : ` The ${closedLo ? 'closed' : 'open'} circle ${closedLo ? 'takes in' : 'leaves out'} ${n(lo)}; the ${closedHi ? 'closed' : 'open'} circle ${closedHi ? 'takes in' : 'leaves out'} ${n(hi)}.`;

  return (
    <View>
      <Canvas aspect={(w) => H / w}>
        {({ w, h }) => {
          const pad = 28;
          const px = (v: number) => pad + ((v - from) / (to - from)) * (w - 2 * pad);
          const perUnit = px(1) - px(0);
          const lineAt = h - 68;
          const ticks = Array.from(
            { length: Math.round((to - from) / step) + 1 },
            (_, i) => from + i * step,
          );
          const [L, U] = [px(lo), px(hi)];
          const [left, right] = [pad - 10, w - pad + 10];
          const band = chart.strokeHeavy + 2;
          const ray = (x0: number, toRight: boolean) => (
            <G key={`r${toRight ? 1 : 0}`}>
              <Line
                x1={x0}
                y1={lineAt}
                x2={toRight ? right - 8 : left + 8}
                y2={lineAt}
                stroke={c.chartHighlight}
                strokeWidth={band}
              />
              <Path
                d={`M ${toRight ? right : left} ${lineAt} l ${toRight ? -12 : 12} -8 l 0 16 z`}
                fill={c.chartHighlight}
              />
            </G>
          );
          const bracketAt = lineAt - 40;
          const testY = distance ? lineAt - 92 : lineAt - 56;
          const testLabel =
            test === undefined ? '' : `${formatNumber(test)}: ${holds(test) ? 'true' : 'false'}`;
          // The bounds' labels above them, pushed apart when they would touch.
          const tw = (s: string) => s.length * chart.value * 0.58;
          const loText = distance || and ? n(lo) : `${x} ${signLo} ${n(lo)}`;
          const hiText = distance || and ? n(hi) : `${x} ${signHi} ${n(hi)}`;
          // (Bounds past each other, as in an 'or' that covers every number, swap sides.)
          const dir = U >= L ? 1 : -1;
          const gap = dir * (U - L) - (tw(loText) + tw(hiText)) / 2 - 8;
          const [loX, hiX] = gap < 0 ? [L + (dir * gap) / 2, U - (dir * gap) / 2] : [L, U];
          const handles = [
            ...(distance
              ? [
                  { id: distance.c, at: px(center!), y: lineAt + 44, pin: [distance.r] },
                  { id: distance.r, at: U, y: lineAt + 44, pin: [distance.c], grows: true },
                ]
              : [
                  { id: spec.value, at: L, y: lineAt + 44, pin: [spec.second!] },
                  { id: spec.second!, at: U, y: lineAt + 44, pin: [spec.value] },
                ]),
            ...(test !== undefined && cp.test
              ? [{ id: cp.test, at: px(test), y: testY + 7, pin: [] as string[] }]
              : []),
          ].filter((d) => rep.known(d.id));
          return (
            <>
              <Svg width={w} height={h} opacity={known ? 1 : 0.4}>
                <Line
                  x1={left}
                  y1={lineAt}
                  x2={right}
                  y2={lineAt}
                  stroke={c.chartInk}
                  strokeWidth={chart.stroke}
                />
                {ticks.map((t) => (
                  <Line
                    key={`t${t}`}
                    x1={px(t)}
                    y1={lineAt - (t === 0 ? 8 : 5)}
                    x2={px(t)}
                    y2={lineAt + (t === 0 ? 8 : 5)}
                    stroke={c.chartInk}
                    strokeWidth={t === 0 ? chart.stroke : 1}
                  />
                ))}
                {ticks
                  .filter((t, i) => t === 0 || i % Math.ceil(28 / (perUnit * step)) === 0)
                  .map((t) => (
                    <ChartText
                      key={`l${t}`}
                      x={px(t)}
                      y={lineAt + 22}
                      fontSize={chart.tiny}
                      fill={c.chartMuted}
                      textAnchor="middle"
                    >
                      {formatNumber(t)}
                    </ChartText>
                  ))}
                {/* The solutions: the stretch between ('and') or the two rays ('or'). */}
                {known && and && !empty ? (
                  <Line
                    x1={L}
                    y1={lineAt}
                    x2={U}
                    y2={lineAt}
                    stroke={c.chartHighlight}
                    strokeWidth={band}
                  />
                ) : null}
                {known && !and ? [ray(L, false), ray(U, true)] : null}
                {/* |x − c|: the center and the distance to each bound, bracketed. */}
                {distance && radius! > 0 ? (
                  <G>
                    {[L, U].map((bx, i) => {
                      const cx = px(center!);
                      return (
                        <G key={`b${i}`}>
                          <Path
                            d={`M ${cx} ${bracketAt + 8} L ${cx} ${bracketAt} L ${bx} ${bracketAt} L ${bx} ${bracketAt + 8}`}
                            stroke={c.chartMuted}
                            strokeWidth={chart.strokeLight}
                            fill="none"
                          />
                          <ChartText
                            x={(cx + bx) / 2}
                            y={bracketAt - 6}
                            fontSize={chart.label}
                            fontWeight="700"
                            fill={c.chartMuted}
                            textAnchor="middle"
                          >
                            {num(radius!)}
                          </ChartText>
                        </G>
                      );
                    })}
                  </G>
                ) : null}
                {distance ? (
                  <G>
                    <Path
                      d={`M ${px(center!)} ${lineAt - 7} l 7 7 l -7 7 l -7 -7 z`}
                      fill={c.chartInk}
                    />
                    {radius! > 0 && Math.abs(U - px(center!)) > 30 ? (
                      <ChartText
                        x={px(center!)}
                        y={lineAt - 14}
                        fontSize={chart.value}
                        fontWeight="700"
                        textAnchor="middle"
                      >
                        {n(center!)}
                      </ChartText>
                    ) : null}
                  </G>
                ) : null}
                {[
                  { at: L, closed: closedLo },
                  { at: U, closed: closedHi },
                ].map((b, i) => (
                  <Circle
                    key={`c${i}`}
                    cx={b.at}
                    cy={lineAt}
                    r={7}
                    fill={b.closed ? c.chartHighlight : c.chartSurface}
                    stroke={c.chartHighlight}
                    strokeWidth={chart.stroke + 0.5}
                  />
                ))}
                {[
                  { at: loX, text: loText },
                  { at: hiX, text: hiText },
                ].map((b, i) => (
                  <ChartText
                    key={`bl${i}`}
                    {...fitLabel(b.at, b.text, chart.value, w)}
                    y={lineAt - 16}
                    fontSize={chart.value}
                    fontWeight="700"
                    fill={c.chartHighlight}
                  >
                    {b.text}
                  </ChartText>
                ))}
                {test !== undefined ? (
                  <G>
                    <Line
                      x1={px(test)}
                      y1={testY + 14}
                      x2={px(test)}
                      y2={lineAt}
                      stroke={c.chartInk}
                      strokeWidth={1}
                      strokeDasharray={chart.dashFine}
                    />
                    <Path
                      d={`M ${px(test)} ${testY} l 7 7 l -7 7 l -7 -7 z`}
                      fill={holds(test) ? c.chartInk : c.chartSurface}
                      stroke={c.chartInk}
                      strokeWidth={chart.strokeLight}
                    />
                    <ChartText
                      {...fitLabel(px(test), testLabel, chart.label, w)}
                      y={testY - 6}
                      fontSize={chart.label}
                      fontWeight="700"
                    >
                      {testLabel}
                    </ChartText>
                  </G>
                ) : null}
              </Svg>
              {handles.map((d) => (
                <DragHandle
                  key={d.id}
                  testID={`drag-${d.id}`}
                  x={d.at}
                  y={d.y}
                  label={rep.variable(d.id).name}
                  onStart={() => {
                    start.current = rep.shown(d.id);
                    extent.freeze();
                  }}
                  onEnd={extent.release}
                  onMove={(dx) =>
                    calc.set(
                      {
                        ...rep.pin(
                          [...d.pin, ...(cp.test && d.id !== cp.test ? [cp.test] : [])].filter(
                            (v) => v !== d.id,
                          ),
                        ),
                        [d.id]: rep.snapTo(d.id, (start.current + dx / perUnit) * rep.factor(d.id)),
                      },
                      rep.slide(d.id),
                    )
                  }
                />
              ))}
            </>
          );
        }}
      </Canvas>
      <Caption>{`${words}${circles}${test === undefined || !known ? '' : ` ${testLine()}`}`}</Caption>
    </View>
  );
}

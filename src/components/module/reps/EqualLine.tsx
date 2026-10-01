/**
 * H91: |x − c| = d on a number line (`compound.join: 'equal'`). The two solutions, c − d and
 * c + d, are closed dots with nothing shaded between them (the numbers exactly d from c), the
 * center marked and the distance d bracketed to each. d = 0 leaves one dot at c; a negative d
 * none (a distance is never negative). A test number is marked true or false. The center and
 * the distance (and the test number) drag.
 */
import { useRef } from 'react';
import { View } from 'react-native';
import Svg, { Circle, G, Line, Path } from 'react-native-svg';

import type { Representation } from '@/data/modules';
import { formatNumber } from '@/engine/format';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, Caption, ChartText, DragHandle, fitLabel, useFrozen, useRep } from './common';
import { lineStep, lineWindow } from './integerLineWindow';

type Spec = Extract<Representation, { kind: 'integerLine' }>;

/** "|x − 1|", "|x + 3|", "|x|". */
const absText = (x: string, c: number) =>
  c === 0 ? `|${x}|` : `|${x} ${c < 0 ? '+' : '−'} ${formatNumber(Math.abs(c))}|`;

export function EqualLine({ spec, calc }: { spec: Spec; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  const start = useRef(0);
  const cp = spec.compound!;
  const x = cp.letter ?? 'x';
  const n = formatNumber;
  const unit = spec.unit ?? '';
  const num = (v: number) => `${n(v)}${unit ? ` ${unit}` : ''}`;
  const paren = (v: number) => (v < 0 ? `(${n(v)})` : n(v));
  const ids = [spec.value, spec.second, cp.center, cp.radius].filter((v): v is string => !!v);
  const a = rep.shown(spec.value);
  const b = spec.second ? rep.shown(spec.second) : a;
  const center = cp.center ? rep.shown(cp.center) : (a + b) / 2;
  const radius = cp.radius ? rep.shown(cp.radius) : Math.abs(b - a) / 2;
  // A negative distance has no solutions to type: the center and the distance are enough.
  const known =
    cp.center && cp.radius && rep.known(cp.center) && rep.known(cp.radius) && radius < 0
      ? true
      : ids.every((id) => rep.known(id));
  const test = cp.test && rep.known(cp.test) ? rep.shown(cp.test) : undefined;
  const none = radius < 0;
  const [lo, hi] = [center - Math.abs(radius), center + Math.abs(radius)];
  const statement = `${absText(x, center)} = ${n(radius)}`;
  const holds = (t: number) => Math.abs(Math.abs(t - center) - radius) < 1e-9;

  const extent = useFrozen(
    lineWindow(spec, [lo, hi, center, ...(test === undefined ? [] : [test])], 1),
  );
  const [from, to] = extent.value;
  const step = lineStep(spec, from, to);

  const words = !known
    ? 'Type the values to draw the solutions.'
    : none
      ? `${statement}: a distance is never negative, so no number is ${n(radius)} from ${n(center)}. No solution.`
      : radius === 0
        ? `${statement}: only ${n(center)} itself is 0 from ${n(center)}. So ${x} = ${n(center)}.`
        : `${statement}: the numbers exactly ${n(radius)} from ${n(center)} · ${n(center)} − ${paren(radius)} = ${n(lo)} · ${n(center)} + ${paren(radius)} = ${n(hi)} · The solutions are ${n(lo)} and ${n(hi)}; nothing between them is one.`;
  const testLine =
    test === undefined || !known
      ? ''
      : ` Test ${num(test)}: ${absText(n(test), center)} = ${n(Math.abs(test - center))}, and ${n(Math.abs(test - center))} = ${n(radius)} is ${holds(test)}.`;

  return (
    <View>
      <Canvas aspect={(w) => (cp.test ? 206 : 150) / w}>
        {({ w, h }) => {
          const pad = 28;
          const px = (v: number) => pad + ((v - from) / (to - from)) * (w - 2 * pad);
          const perUnit = px(1) - px(0);
          const lineAt = h - 68;
          const ticks = Array.from(
            { length: Math.round((to - from) / step) + 1 },
            (_, i) => from + i * step,
          );
          const [L, U, C] = [px(lo), px(hi), px(center)];
          const bracketAt = lineAt - 40;
          const testY = lineAt - 92;
          const testLabel = test === undefined ? '' : `${n(test)}: ${holds(test)}`;
          // The two solutions' labels, pushed apart when they would touch.
          const tw = (s: string) => s.length * chart.value * 0.58;
          const gap = U - L - (tw(n(lo)) + tw(n(hi))) / 2 - 8;
          const [loX, hiX] = gap < 0 ? [L + gap / 2, U - gap / 2] : [L, U];
          const handles = [
            ...(cp.center && cp.radius
              ? [
                  { id: cp.center, at: C, pin: [cp.radius] },
                  {
                    id: cp.radius,
                    // On c + d; a short distance's handle steps right of the center's.
                    at: Math.abs(U - C) < chart.handleTouch ? C + chart.handleTouch : U,
                    pin: [cp.center],
                  },
                ]
              : []),
            ...(test !== undefined && cp.test
              ? [{ id: cp.test, at: px(test), y: testY + 7, pin: [] as string[] }]
              : []),
          ].filter((d) => rep.known(d.id) && !(none && d.id === cp.radius));
          const dots = none ? [] : radius === 0 ? [C] : [L, U];
          return (
            <>
              <Svg width={w} height={h} opacity={known ? 1 : 0.4}>
                <Line
                  x1={pad - 10}
                  y1={lineAt}
                  x2={w - pad + 10}
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
                      {n(t)}
                    </ChartText>
                  ))}
                {/* The distance from the center to each solution, bracketed. */}
                {!none && radius > 0
                  ? [L, U].map((bx, i) => (
                      <G key={`b${i}`}>
                        <Path
                          d={`M ${C} ${bracketAt + 8} L ${C} ${bracketAt} L ${bx} ${bracketAt} L ${bx} ${bracketAt + 8}`}
                          stroke={c.chartMuted}
                          strokeWidth={chart.strokeLight}
                          fill="none"
                        />
                        <ChartText
                          x={(C + bx) / 2}
                          y={bracketAt - 6}
                          fontSize={chart.label}
                          fontWeight="700"
                          fill={c.chartMuted}
                          textAnchor="middle"
                        >
                          {num(radius)}
                        </ChartText>
                      </G>
                    ))
                  : null}
                <Path d={`M ${C} ${lineAt - 7} l 7 7 l -7 7 l -7 -7 z`} fill={c.chartInk} />
                {radius !== 0 && (none || Math.abs(U - C) > 30) ? (
                  <ChartText
                    x={C}
                    y={lineAt - 14}
                    fontSize={chart.value}
                    fontWeight="700"
                    textAnchor="middle"
                  >
                    {n(center)}
                  </ChartText>
                ) : null}
                {dots.map((dx, i) => (
                  <Circle
                    key={`d${i}`}
                    cx={dx}
                    cy={lineAt}
                    r={7}
                    fill={c.chartHighlight}
                    stroke={c.chartHighlight}
                    strokeWidth={chart.stroke + 0.5}
                  />
                ))}
                {(radius === 0
                  ? [{ at: C, text: `${x} = ${n(center)}` }]
                  : none
                    ? []
                    : [
                        { at: loX, text: n(lo) },
                        { at: hiX, text: n(hi) },
                      ]
                ).map((d, i) => (
                  <ChartText
                    key={`dl${i}`}
                    {...fitLabel(d.at, d.text, chart.value, w)}
                    y={lineAt - 16}
                    fontSize={chart.value}
                    fontWeight="700"
                    fill={c.chartHighlight}
                  >
                    {d.text}
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
                  y={'y' in d && d.y !== undefined ? d.y : lineAt + 44}
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
      <Caption>{`${words}${testLine}`}</Caption>
    </View>
  );
}

import { View } from 'react-native';
import Svg, { Circle, Defs, G, Line, Rect } from 'react-native-svg';

import type { Representation } from '@/data/modules';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Ball, url, usePaintIds } from './paint';
import { Canvas, ChartText, useRep, Caption } from './common';
import { Steppers } from './Steppers';

type Spec = Extract<Representation, { kind: 'numberBond' }>;

/** Counters fit a 2 × 5 frame in each circle; past 10 they go on in more rows of 5. */
const FRAME = 5;

/**
 * Number bond: the whole in the top circle, joined to its two parts by firm lines that meet
 * the circles' edges. Each part circle is tinted with its counters' colour (the first part in
 * the highlight, the second in the second colour); under each number its counters sit in a
 * 2 × 5 ten-frame cluster, and the whole shows both parts' counters together, so the parts
 * can be seen making the whole. − / + change the parts (and the whole, when it can change).
 */
export function NumberBond({ spec, calc }: { spec: Spec; calc: Calculator }) {
  const c = usePalette();
  const paint = usePaintIds('a', 'b');
  const rep = useRep(calc);
  const [a, b] = spec.parts;
  const text = (x: string | number) =>
    typeof x === 'number' ? String(x) : rep.known(x) ? String(Math.round(rep.shown(x))) : '?';
  const count = (x: string) => (rep.known(x) ? Math.max(0, Math.round(rep.shown(x))) : 0);
  const wholeIsVar = typeof spec.whole === 'string';
  const [na, nb] = [count(a), count(b)];
  // The whole shows the parts' counters when they make it (they always should).
  const wholeN = typeof spec.whole === 'number' ? spec.whole : count(spec.whole);
  const wholeDots = na + nb === wholeN && wholeN > 0;

  return (
    <View>
      <Canvas aspect={0.8}>
        {({ w, h }) => {
          const r = Math.min(w * 0.17, h * 0.21, 68);
          const top = { x: w / 2, y: r + 6 };
          const left = { x: Math.max(r + 8, w * 0.26), y: h - r - 6 };
          const right = { x: Math.min(w - r - 8, w * 0.74), y: h - r - 6 };
          const d = Math.min(15, (r * 1.5) / FRAME);
          /** A 2 × 5 cluster of counters under the number, first `k1` in one colour. */
          const frame = (at: { x: number; y: number }, n: number, fills: [string, number][]) => {
            const x0 = at.x - (FRAME / 2) * d;
            const y0 = at.y + r * 0.12;
            const rowsN = Math.max(2, Math.ceil(n / FRAME));
            const out = [];
            // The frame's cells, faint, so an empty spot shows too.
            out.push(
              <Rect
                key="f"
                x={x0 - 2}
                y={y0 - 2}
                width={FRAME * d + 4}
                height={rowsN * d + 4}
                rx={4}
                fill={c.card}
                fillOpacity={0.7}
                stroke={c.chartGrid}
              />,
            );
            // Faint cell lines: a ten-frame, so the empty spots can be counted too.
            for (let k = 1; k < FRAME; k++)
              out.push(
                <Line
                  key={`v${k}`}
                  x1={x0 + k * d}
                  y1={y0}
                  x2={x0 + k * d}
                  y2={y0 + rowsN * d}
                  stroke={c.chartGrid}
                />,
              );
            for (let k = 1; k < rowsN; k++)
              out.push(
                <Line
                  key={`h${k}`}
                  x1={x0}
                  y1={y0 + k * d}
                  x2={x0 + FRAME * d}
                  y2={y0 + k * d}
                  stroke={c.chartGrid}
                />,
              );
            let i = 0;
            for (const [fill, k] of fills) {
              for (let j = 0; j < k; j++, i++) {
                out.push(
                  <Circle
                    key={i}
                    cx={x0 + ((i % FRAME) + 0.5) * d}
                    cy={y0 + (Math.floor(i / FRAME) + 0.5) * d}
                    r={d * 0.42}
                    fill={fill}
                    stroke={c.chartInk}
                    strokeOpacity={0.6}
                    strokeWidth={1}
                  />,
                );
              }
            }
            return <G>{out}</G>;
          };
          // A connector from the edge of one circle to the edge of the other.
          const link = (p: { x: number; y: number }, q: { x: number; y: number }) => {
            const len = Math.hypot(q.x - p.x, q.y - p.y);
            const [ux, uy] = [(q.x - p.x) / len, (q.y - p.y) / len];
            return (
              <Line
                x1={p.x + ux * r}
                y1={p.y + uy * r}
                x2={q.x - ux * r}
                y2={q.y - uy * r}
                stroke={c.chartInk}
                strokeWidth={chart.strokeHeavy}
                strokeLinecap="round"
              />
            );
          };
          const circle = (p: { x: number; y: number }, tint: string | null) => (
            <G>
              <Circle cx={p.x} cy={p.y} r={r} fill={c.chartFill} />
              {tint ? <Circle cx={p.x} cy={p.y} r={r} fill={tint} fillOpacity={0.2} /> : null}
              <Circle
                cx={p.x}
                cy={p.y}
                r={r}
                fill="none"
                stroke={tint ?? c.chartInk}
                strokeWidth={chart.strokeHeavy}
              />
            </G>
          );
          const number = (p: { x: number; y: number }, s: string) => (
            <ChartText
              x={p.x}
              y={p.y - r * 0.18}
              fontSize={Math.min(34, r * 0.5)}
              fontWeight="800"
              textAnchor="middle"
            >
              {s}
            </ChartText>
          );
          return (
            <Svg width={w} height={h}>
              <Defs>
                <Ball id={paint.a} color={c.chartHighlight} />
                <Ball id={paint.b} color={c.chartSecond} />
              </Defs>
              {link(top, left)}
              {link(top, right)}
              {circle(top, null)}
              {circle(left, c.chartHighlight)}
              {circle(right, c.chartSecond)}
              {number(top, text(spec.whole))}
              {number(left, text(a))}
              {number(right, text(b))}
              {frame(
                top,
                wholeDots ? wholeN : 0,
                wholeDots
                  ? [
                      [url(paint.a), na],
                      [url(paint.b), nb],
                    ]
                  : [],
              )}
              {frame(left, na, [[url(paint.a), na]])}
              {frame(right, nb, [[url(paint.b), nb]])}
            </Svg>
          );
        }}
      </Canvas>
      <Caption>{`Whole: ${typeof spec.whole === 'number' ? spec.whole : rep.label(spec.whole)}   ·   Parts: ${rep.label(a)} and ${rep.label(b)}`}</Caption>
      <Steppers
        calc={calc}
        items={[
          { var: a, steps: [1], marker: '●', pin: wholeIsVar ? [spec.whole as string] : [] },
          { var: b, steps: [1], marker: '○', pin: wholeIsVar ? [spec.whole as string] : [] },
          ...(wholeIsVar ? [{ var: spec.whole as string, steps: [1], pin: [a] }] : []),
        ]}
      />
    </View>
  );
}

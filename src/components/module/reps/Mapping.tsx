import { useRef, useState } from 'react';
import { View } from 'react-native';
import Svg, { Circle, Ellipse, G, Line } from 'react-native-svg';

import type { MappingSpec } from '@/data/modules/typesGraphs';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, Caption, ChartText, DragHandle, niceCeil, useRep } from './common';
import { Arrow, Chip, coef, GridAxes, gridStep, makeFrame, reader } from './graphKit';

const same = (a: number, b: number) => Math.abs(a - b) < 1e-9;
const uniq = (xs: number[]) =>
  xs.filter((x, i) => xs.findIndex((y) => same(x, y)) === i).sort((a, b) => a - b);
/** "5 and 7", "5, 7 and 9". */
const listed = (xs: number[]) =>
  xs.length < 2
    ? xs.map(coef).join('')
    : `${xs.slice(0, -1).map(coef).join(', ')} and ${coef(xs.at(-1)!)}`;

/**
 * A relation as pairs: a mapping diagram (inputs in one oval, outputs in the other, an arrow
 * for each pair) and its graph with a vertical line to drag. An input with two or more
 * outputs is drawn in the second color and named in the caption: not a function.
 */
export function Mapping({ spec, calc }: { spec: MappingSpec; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  const read = reader(rep);
  const view = spec.view ?? 'both';
  const pairs = spec.pairs.map((p) => ({ x: read(p.x), y: read(p.y) }));
  const known = pairs.filter((p) => p.x.known && p.y.known);
  const inputs = uniq(known.map((p) => p.x.value));
  const outputs = uniq(known.map((p) => p.y.value));
  const outsOf = (x: number) => uniq(known.filter((p) => same(p.x.value, x)).map((p) => p.y.value));
  const many = inputs.filter((x) => outsOf(x).length > 1);
  const anyUnknown = known.length < pairs.length;
  // The vertical line: where the student drags it (starts on an input with two outputs).
  const [probe, setProbe] = useState<number | undefined>(undefined);
  const lineX = probe ?? many[0] ?? inputs[0] ?? 0;
  const start = useRef(0);
  const hits = known.filter((p) => same(p.x.value, lineX));
  const hitYs = uniq(hits.map((p) => p.y.value));
  const xSym = 'x';

  const verdict = anyUnknown
    ? 'Type every pair to test the relation.'
    : many.length
      ? `${many
          .map((x) => `Input ${coef(x)} has ${outsOf(x).length} outputs, ${listed(outsOf(x))}`)
          .join('. ')}: not a function.`
      : 'Each input has exactly one output: a function.';

  const diagram = (w: number) => {
    const rows = Math.max(inputs.length, outputs.length, 1);
    const rowH = 26;
    const h = rows * rowH + 44;
    const lx = w * 0.27;
    const rx = w * 0.73;
    const rowY = (i: number, n: number) => 34 + (i + 0.5) * rowH + ((rows - n) * rowH) / 2;
    const ovalRx = Math.min(58, w * 0.16);
    return {
      h,
      node: (
        <Svg width={w} height={h}>
          {[
            [lx, 'Input'],
            [rx, 'Output'],
          ].map(([x, t]) => (
            <G key={t as string}>
              <Ellipse
                cx={x as number}
                cy={34 + (rows * rowH) / 2}
                rx={ovalRx}
                ry={(rows * rowH) / 2 + 8}
                fill={c.chartSurface}
                stroke={c.chartGrid}
                strokeWidth={chart.strokeLight}
              />
              <ChartText
                x={x as number}
                y={16}
                textAnchor="middle"
                fontWeight="700"
                fontSize={chart.label}
              >
                {t as string}
              </ChartText>
            </G>
          ))}
          {known.map((p, i) => {
            const a = inputs.findIndex((x) => same(x, p.x.value));
            const b = outputs.findIndex((y) => same(y, p.y.value));
            const bad = many.some((x) => same(x, p.x.value));
            return (
              <Arrow
                key={`a${i}`}
                x1={lx + 20}
                y1={rowY(a, inputs.length)}
                x2={rx - 22}
                y2={rowY(b, outputs.length)}
                color={bad ? c.chartSecond : c.chartInk}
                width={bad ? chart.strokeHeavy : chart.strokeLight}
              />
            );
          })}
          {inputs.map((x, i) => (
            <G key={`i${x}`}>
              {many.some((m) => same(m, x)) ? (
                <Circle
                  cx={lx}
                  cy={rowY(i, inputs.length) - 4}
                  r={12}
                  fill="none"
                  stroke={c.chartSecond}
                  strokeWidth={chart.stroke}
                />
              ) : null}
              <ChartText
                x={lx}
                y={rowY(i, inputs.length)}
                textAnchor="middle"
                fontWeight="700"
                fontSize={chart.value}
              >
                {coef(x)}
              </ChartText>
            </G>
          ))}
          {outputs.map((y, i) => (
            <ChartText
              key={`o${y}`}
              x={rx}
              y={rowY(i, outputs.length)}
              textAnchor="middle"
              fontWeight="700"
              fontSize={chart.value}
            >
              {coef(y)}
            </ChartText>
          ))}
        </Svg>
      ),
    };
  };

  // The graph's range: every value and 0, a grid step beyond.
  const xs = known.map((p) => p.x.value);
  const ys = known.map((p) => p.y.value);
  const range = (vs: number[]) => {
    const lo = Math.min(0, ...vs);
    const hi = Math.max(1, ...vs);
    const step = gridStep(hi - lo);
    return [lo < 0 ? -niceCeil(-lo + step) : 0, niceCeil(hi + step)] as [number, number];
  };
  const xr = range(xs);
  const yr = range(ys);
  const square = xr[1] - xr[0] === yr[1] - yr[0];

  return (
    <View>
      {view !== 'graph' ? (
        <Canvas aspect={(w) => diagram(w).h / w}>{({ w }) => diagram(w).node}</Canvas>
      ) : null}
      {view !== 'arrows' ? (
        <Canvas aspect={square ? 0.9 : 0.75}>
          {({ w, h }) => {
            const f = makeFrame(w, h, xr, yr, square);
            const hit = hitYs.length > 1;
            const lx = f.sx(lineX);
            return (
              <>
                <Svg width={w} height={h}>
                  <GridAxes f={f} />
                  <Line
                    x1={lx}
                    y1={f.sy(yr[1])}
                    x2={lx}
                    y2={f.sy(yr[0])}
                    stroke={hit ? c.chartSecond : c.chartMuted}
                    strokeWidth={hit ? chart.strokeHeavy : chart.stroke}
                    strokeDasharray={hit ? undefined : chart.dash}
                  />
                  {pairs.map((p, i) => {
                    const on = p.x.known && p.y.known && same(p.x.value, lineX) && hit;
                    return (
                      <G key={`p${i}`} opacity={p.x.known && p.y.known ? 1 : 0.3}>
                        {on ? (
                          <Circle
                            cx={f.sx(p.x.value)}
                            cy={f.sy(p.y.value)}
                            r={10}
                            fill="none"
                            stroke={c.chartSecond}
                            strokeWidth={chart.stroke}
                          />
                        ) : null}
                        <Circle
                          cx={f.sx(p.x.value)}
                          cy={f.sy(p.y.value)}
                          r={5}
                          fill={c.chartHighlight}
                        />
                      </G>
                    );
                  })}
                  <Chip
                    x={lx + 10}
                    y={f.sy(yr[1]) + 30}
                    text={`${xSym} = ${coef(lineX)}: ${hits.length === 0 ? 'no points' : hitYs.length === 1 ? '1 point' : `${hitYs.length} points`}`}
                    anchor="start"
                    w={w}
                    h={h}
                  />
                </Svg>
                <DragHandle
                  testID="drag-vertical-line"
                  x={lx}
                  y={f.sy(yr[1]) + 12}
                  label="the vertical line"
                  onStart={() => {
                    start.current = lineX;
                  }}
                  onMove={(dx) => {
                    const step = gridStep(xr[1] - xr[0]) / 2;
                    const x = Math.round((start.current + dx / f.ux) / step) * step;
                    setProbe(Math.min(xr[1], Math.max(xr[0], Number(x.toFixed(6)))));
                  }}
                />
              </>
            );
          }}
        </Canvas>
      ) : null}
      <Caption>
        {[
          verdict,
          ...(view !== 'arrows' && !anyUnknown
            ? [
                hitYs.length > 1
                  ? `The vertical line at ${xSym} = ${coef(lineX)} crosses ${hitYs.length} points: it fails the vertical-line test.`
                  : 'Drag the vertical line: a function never has two points on one vertical line.',
              ]
            : []),
        ].join(' · ')}
      </Caption>
    </View>
  );
}

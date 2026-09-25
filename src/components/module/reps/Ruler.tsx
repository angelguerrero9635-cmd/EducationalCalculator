import { useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Line, Rect } from 'react-native-svg';

import type { Representation } from '@/data/modules';
import { formatNumber } from '@/engine/format';
import { chart, font, space, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, ChartText, DragHandle, nowrap, useFrozen, useRep, Caption } from './common';
import { Steppers } from './Steppers';

type Spec = Extract<Representation, { kind: 'ruler' }>;

/**
 * Objects laid along a ruler marked in the shown unit, all starting at 0. Drag an object's end
 * to change its length.
 */
export function Ruler({ spec, calc }: { spec: Spec; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  const start = useRef(0);
  const unit = rep.unit(spec.lengths[0]!) ?? '';
  const shown = spec.lengths.map((id) => rep.shown(id));
  // A broken ruler: the object starts at a mark other than 0.
  const offset = spec.from ? rep.shown(spec.from) : 0;
  const fit = useFrozen(Math.max(spec.extent, Math.ceil(offset + Math.max(...shown))));

  /** "Longest to shortest: Red (a) 9, Blue (b) 6, Green (c) 4." */
  const order = () =>
    `Longest to shortest: ${spec.lengths
      .map((id, i) => ({ id, x: shown[i]! }))
      .sort((p, q) => q.x - p.x)
      .map((p) => `${rep.variable(p.id).name} ${formatNumber(p.x)}`)
      .join(', ')}.`;

  /** "Ribbon A is 4 cm longer than ribbon B." */
  const compare = () => {
    const [a, b] = spec.lengths as [string, string];
    const [x, y] = [rep.shown(a), rep.shown(b)];
    if (x === y) return 'They are the same length.';
    const [long, short] = x > y ? [a, b] : [b, a];
    const d = spec.difference!;
    const unit = rep.unit(d);
    return `${rep.variable(long).name} is ${formatNumber(rep.shown(d), rep.variable(d))}${unit ? ` ${unit}` : ''} longer than ${rep.variable(short).name}.`;
  };

  return (
    <View>
      <Canvas aspect={(w) => (12 + 34 * spec.lengths.length + 60) / w}>
        {({ w, h }) => {
          const left = 16;
          const scale = (w - left - 24) / fit.value;
          const rulerY = h - 44;
          const tickEvery = fit.value > 40 ? 10 : fit.value > 20 ? 5 : 1;
          return (
            <>
              <Svg width={w} height={h}>
                {spec.lengths.map((id, i) => (
                  <Rect
                    key={id}
                    x={left + offset * scale}
                    y={12 + i * 34}
                    width={Math.max(2, shown[i]! * scale)}
                    height={20}
                    rx={4}
                    fill={i === 0 ? c.chartHighlight : c.chartFill}
                    stroke={c.chartInk}
                    opacity={rep.known(id) ? 1 : 0.35}
                  />
                ))}
                {spec.lengths.map((id, i) => {
                  // Short bars: put the name after the bar's end so it stays readable.
                  const inside = shown[i]! * scale >= 64;
                  const x0 = left + offset * scale;
                  return (
                    <ChartText
                      key={`l${id}`}
                      x={inside ? x0 + 6 : x0 + Math.max(2, shown[i]! * scale) + 6}
                      y={12 + i * 34 + 15}
                      fontSize={chart.small}
                      fill={inside && i === 0 ? c.onChartHighlight : c.chartInk}
                    >
                      {rep.tag(id)}
                    </ChartText>
                  );
                })}
                {/* A margin past 0 and the last mark, so the end numbers aren't cut by the edge. */}
                <Rect
                  x={left - space.sm}
                  y={rulerY}
                  width={fit.value * scale + 2 * space.sm}
                  height={26}
                  fill={c.chartSurface}
                  stroke={c.chartInk}
                />
                {Array.from({ length: fit.value + 1 }, (_, t) => (
                  <Line
                    key={`t${t}`}
                    x1={left + t * scale}
                    y1={rulerY}
                    x2={left + t * scale}
                    y2={rulerY + (t % tickEvery === 0 ? 12 : 6)}
                    stroke={c.chartInk}
                  />
                ))}
                {Array.from({ length: Math.floor(fit.value / tickEvery) + 1 }, (_, i) => (
                  <ChartText
                    key={`n${i}`}
                    x={left + i * tickEvery * scale}
                    y={rulerY + 24}
                    fontSize={chart.small}
                    textAnchor="middle"
                  >
                    {formatNumber(i * tickEvery)}
                  </ChartText>
                ))}
                <ChartText
                  x={w - 8}
                  y={rulerY - 6}
                  fontSize={chart.small}
                  fill={c.chartMuted}
                  textAnchor="end"
                >
                  {unit}
                </ChartText>
              </Svg>
              {spec.lengths.map((id, i) => (
                <DragHandle
                  key={id}
                  testID={`drag-${id}`}
                  x={left + (offset + shown[i]!) * scale}
                  y={12 + i * 34 + 10}
                  label={rep.variable(id).name}
                  onStart={() => {
                    start.current = shown[i]!;
                    fit.freeze();
                  }}
                  onEnd={fit.release}
                  onMove={(dx) =>
                    calc.set({
                      ...rep.pin(spec.lengths.filter((x) => x !== id)),
                      [id]: rep.snapTo(id, (start.current + dx / scale) * rep.factor(id)),
                    })
                  }
                />
              ))}
            </>
          );
        }}
      </Canvas>
      {spec.from ? (
        <>
          <Caption>{`Starts at ${nowrap(rep.label(spec.from))}${spec.to ? `, ends at ${nowrap(rep.label(spec.to))}` : ''}. Length: ${nowrap(`${rep.label(spec.lengths[0]!)}.`)}`}</Caption>
          <Steppers calc={calc} items={[{ var: spec.from, steps: [1], pin: [spec.lengths[0]!] }]} />
        </>
      ) : null}
      {spec.lengths.length > 2 && spec.lengths.every(rep.known) ? (
        <Caption>{order()}</Caption>
      ) : null}
      {spec.difference && spec.lengths.length === 2 && spec.lengths.every(rep.known) ? (
        <Caption>{compare()}</Caption>
      ) : spec.difference ? (
        <Caption>{rep.named(spec.difference)}</Caption>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({});

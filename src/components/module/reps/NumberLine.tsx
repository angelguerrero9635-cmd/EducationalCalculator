import { useRef } from 'react';
import Svg, { Circle, G, Line, Path } from 'react-native-svg';

import type { Representation } from '@/data/modules';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { View } from 'react-native';

import { formatNumber } from '@/engine/format';

import { Canvas, Caption, DragHandle, fitLabel, useRep, ChartText } from './common';

type Spec = Extract<Representation, { kind: 'numberLine' }>;

export function NumberLine({ spec, calc }: { spec: Spec; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  const start = useRef(0);
  const a = rep.val(spec.start);
  const end = rep.val(spec.end);
  // A line counted by ticks (`count`) has no distance value: the jump is the ticks between.
  const counted = !!spec.count && !!spec.from;
  const b = spec.jump ? rep.val(spec.jump) : end - a;
  const faded = ![spec.start, spec.jump ?? spec.count ?? spec.end, spec.end].every(rep.known);
  // Subtraction (the end and the jump typed, the start worked out): hop back from the end.
  const back = calc.status(spec.start) === 'derived' && calc.status(spec.end) === 'given';
  // A line from a value (500) in ticks of 1, 10 or 100; otherwise min to max.
  const tick = Math.max(1e-9, spec.every ? rep.val(spec.every) : (spec.tick ?? 1));
  const lo = spec.from ? rep.val(spec.from) : spec.min;
  const hi = spec.from ? lo + (spec.span ?? 10) * tick : spec.max;
  const fromKnown = !spec.from || (rep.known(spec.from) && (!spec.every || rep.known(spec.every)));

  const picture = (
    <Canvas aspect={0.42}>
      {({ w, h }) => {
        const pad = 24;
        const unit = (w - 2 * pad) / (hi - lo);
        const sx = (n: number) => pad + (n - lo) * unit;
        const y = h * 0.64;
        const ticks = Array.from({ length: Math.floor((hi - lo) / tick + 1e-9) + 1 }, (_, i) =>
          Number((lo + i * tick).toFixed(6)),
        );
        // Long numbers (1,000) on every tick would touch: every other one is named.
        const room = (w - 2 * pad) / ticks.length;
        const named = (i: number) =>
          i % 2 === 0 ||
          i === ticks.length - 1 ||
          room >= 8 + chart.label * 0.6 * formatNumber(ticks[i]!).length;
        // Arcs from start to end (or back from the end to the start when subtracting): one
        // jump, or jumps of 10 and then the ones.
        const [from0, to0] = back ? [end, a] : [a, end];
        const d = to0 - from0;
        const sign = d < 0 ? -1 : 1;
        const size = spec.jumps === 'ticks' || counted ? tick : 10;
        const tens =
          spec.jumps === 'tens' || spec.jumps === 'ticks' || counted
            ? Math.min(40, Math.floor(Math.abs(d) / size + 1e-9))
            : 0;
        const stops = [
          from0,
          ...Array.from({ length: tens }, (_, i) =>
            Number((from0 + sign * size * (i + 1)).toFixed(6)),
          ),
        ];
        if (stops[stops.length - 1] !== to0 || stops.length === 1) stops.push(to0);
        const arcs = stops.slice(1).map((to, i) => ({ from: stops[i]!, to }));
        const minor = tick > 1 && unit >= (spec.from ? 5 : 2.5) && Number.isInteger(lo);
        return (
          <>
            <Svg width={w} height={h}>
              <Line
                x1={pad - 8}
                y1={y}
                x2={w - pad + 8}
                y2={y}
                stroke={c.chartInk}
                strokeWidth={chart.stroke}
              />
              {minor
                ? Array.from({ length: Math.floor(hi - lo) + 1 }, (_, i) => (
                    <Line
                      key={`m${i}`}
                      x1={sx(lo + i)}
                      y1={y - 3}
                      x2={sx(lo + i)}
                      y2={y + 3}
                      stroke={c.chartGrid}
                    />
                  ))
                : null}
              {ticks.map((n) => (
                <Line key={n} x1={sx(n)} y1={y - 6} x2={sx(n)} y2={y + 6} stroke={c.chartInk} />
              ))}
              {ticks.map((n, i) =>
                named(i) ? (
                  <ChartText
                    key={`t${n}`}
                    x={sx(n)}
                    y={y + 22}
                    fontSize={chart.label}
                    fill={c.chartMuted}
                    textAnchor="middle"
                  >
                    {formatNumber(n)}
                  </ChartText>
                ) : null,
              )}
              {arcs.map(({ from, to }, i) => {
                const lift = Math.min(h * 0.45, 30 + Math.abs(to - from) * unit * 0.3);
                const mid = (sx(from) + sx(to)) / 2;
                // A faded line (a number still "?") labels its jumps "?", not the example's.
                const label = faded
                  ? `${sign > 0 ? '+' : '−'}?`
                  : arcs.length === 1 && spec.jump
                    ? `${back ? '−' : b >= 0 ? '+' : ''}${rep.value(spec.jump)}`
                    : `${sign > 0 ? '+' : '−'}${formatNumber(Number(Math.abs(to - from).toFixed(6)))}`;
                // Many small jumps name only the first, so the labels don't pile up; a counted
                // line names every jump while the labels fit between the ticks.
                const roomy = counted && unit * tick >= 10 + chart.small * 0.6 * label.length;
                if (
                  arcs.length > 6 &&
                  i > 0 &&
                  !roomy &&
                  Math.abs(Math.abs(to - from) - size) < 1e-9
                ) {
                  return (
                    <Path
                      key={i}
                      opacity={faded ? 0.35 : 1}
                      d={`M ${sx(from)} ${y} Q ${mid} ${y - 2 * lift} ${sx(to)} ${y}`}
                      stroke={c.chartInk}
                      strokeWidth={chart.stroke}
                      strokeDasharray={chart.dash}
                      fill="none"
                    />
                  );
                }
                return (
                  <G key={i} opacity={faded ? 0.35 : 1}>
                    <Path
                      d={`M ${sx(from)} ${y} Q ${mid} ${y - 2 * lift} ${sx(to)} ${y}`}
                      stroke={c.chartInk}
                      strokeWidth={chart.stroke}
                      strokeDasharray={chart.dash}
                      fill="none"
                    />
                    <ChartText
                      {...fitLabel(
                        mid,
                        label,
                        arcs.length === 1 && !counted ? chart.value : chart.small,
                        w,
                      )}
                      y={y - lift - 8}
                      fontSize={arcs.length === 1 && !counted ? chart.value : chart.small}
                      fill={c.chartInk}
                    >
                      {label}
                    </ChartText>
                  </G>
                );
              })}
              <Circle cx={sx(a)} cy={y} r={5} fill={c.chartMuted} />
              <Circle cx={sx(end)} cy={y} r={6} fill={c.chartInk} />
              <ChartText
                {...fitLabel(sx(a), rep.label(spec.start), chart.label, w)}
                y={y + 40}
                fontSize={chart.label}
                fill={c.chartInk}
              >
                {rep.label(spec.start)}
              </ChartText>
              <ChartText
                {...fitLabel(sx(end), rep.label(spec.end), chart.label, w)}
                y={Math.abs(sx(end) - sx(a)) < 90 ? y + 54 : y + 40}
                fontSize={chart.label}
                fill={c.chartInk}
              >
                {rep.label(spec.end)}
              </ChartText>
            </Svg>
            {spec.from === spec.start ? null : (
              <DragHandle
                testID="drag-start"
                x={sx(a)}
                y={y}
                label={rep.variable(spec.start).name}
                onStart={() => (start.current = a)}
                onMove={(dx) =>
                  calc.set(
                    {
                      ...rep.pin([spec.jump ?? spec.count ?? spec.end]),
                      [spec.start]: rep.snapTo(spec.start, start.current + dx / unit),
                    },
                    rep.slide(spec.start),
                  )
                }
              />
            )}
            <DragHandle
              testID="drag-end"
              x={sx(end)}
              y={y}
              label={rep.variable(spec.end).name}
              onStart={() => (start.current = end)}
              onMove={(dx) =>
                calc.set(
                  {
                    ...rep.pin([spec.start, ...(spec.every ? [spec.every] : [])]),
                    [spec.end]: counted
                      ? // On a tick: the start and a whole number of ticks.
                        lo +
                        tick *
                          Math.min(
                            Math.round((hi - lo) / tick),
                            Math.max(0, Math.round((start.current + dx / unit - lo) / tick)),
                          )
                      : rep.snapTo(spec.end, Math.min(hi, Math.max(lo, start.current + dx / unit))),
                  },
                  rep.slide(spec.end),
                )
              }
            />
          </>
        );
      }}
    </Canvas>
  );
  if (!spec.from) return picture;
  if (counted) {
    // Grade 2 counts the ticks: "Start at 500. 4 jumps of 10: 510, 520, 530, 540."
    const k = rep.val(spec.count!);
    const stops = Array.from({ length: Math.min(k, 20) }, (_, i) =>
      formatNumber(Number((a + (i + 1) * tick).toFixed(6))),
    );
    const list = k > 20 ? [...stops.slice(0, 2), '…', formatNumber(end)] : stops;
    return (
      <View>
        {picture}
        <Caption>
          {faded || !fromKnown
            ? 'Type the numbers to place the point.'
            : k === 0
              ? `The point is at the start: ${formatNumber(a)}.`
              : `Start at ${formatNumber(a)}. ${k} ${k === 1 ? 'jump' : 'jumps'} of ${formatNumber(tick)}: ${list.join(', ')}.`}
        </Caption>
      </View>
    );
  }
  // The number sentence the jumps show, with every number: "500 + 40 = 540".
  const jumpsN = spec.jumps === 'ticks' ? Math.floor(Math.abs(end - a) / tick + 1e-9) : 0;
  const rest = Number((Math.abs(end - a) - jumpsN * tick).toFixed(6));
  return (
    <View>
      {picture}
      <Caption>
        {faded || !fromKnown
          ? 'Type the numbers to place the point.'
          : `${formatNumber(a)} ${end >= a ? '+' : '−'} ${formatNumber(Math.abs(end - a))} = ${formatNumber(end)}.` +
            (jumpsN > 0
              ? ` ${jumpsN} ${jumpsN === 1 ? 'jump' : 'jumps'} of ${formatNumber(tick)}${rest > 0 ? ` and ${formatNumber(rest)} more` : ''}.`
              : '')}
      </Caption>
    </View>
  );
}

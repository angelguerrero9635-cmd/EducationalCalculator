import { useRef } from 'react';
import Svg, { Circle, G, Line, Path } from 'react-native-svg';

import type { Representation } from '@/data/modules';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, DragHandle, useRep, ChartText } from './common';

type Spec = Extract<Representation, { kind: 'numberLine' }>;

export function NumberLine({ spec, calc }: { spec: Spec; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  const start = useRef(0);
  const a = rep.val(spec.start);
  const b = rep.val(spec.jump);
  const end = rep.val(spec.end);
  const faded = ![spec.start, spec.jump, spec.end].every(rep.known);
  // Subtraction (the end and the jump typed, the start worked out): hop back from the end.
  const back = calc.status(spec.start) === 'derived' && calc.status(spec.end) === 'given';

  return (
    <Canvas aspect={0.42}>
      {({ w, h }) => {
        const pad = 24;
        const unit = (w - 2 * pad) / (spec.max - spec.min);
        const sx = (n: number) => pad + (n - spec.min) * unit;
        const y = h * 0.64;
        const tick = spec.tick ?? 1;
        const ticks = Array.from(
          { length: Math.floor((spec.max - spec.min) / tick) + 1 },
          (_, i) => spec.min + i * tick,
        );
        // Arcs from start to end (or back from the end to the start when subtracting): one
        // jump, or jumps of 10 and then the ones.
        const [from0, to0] = back ? [end, a] : [a, end];
        const d = to0 - from0;
        const sign = d < 0 ? -1 : 1;
        const tens = spec.jumps === 'tens' ? Math.floor(Math.abs(d) / 10) : 0;
        const stops = [
          from0,
          ...Array.from({ length: tens }, (_, i) => from0 + sign * 10 * (i + 1)),
        ];
        if (stops[stops.length - 1] !== to0 || stops.length === 1) stops.push(to0);
        const arcs = stops.slice(1).map((to, i) => ({ from: stops[i]!, to }));
        const minor = tick > 1 && unit >= 2.5;
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
                ? Array.from({ length: spec.max - spec.min + 1 }, (_, i) => (
                    <Line
                      key={`m${i}`}
                      x1={sx(spec.min + i)}
                      y1={y - 3}
                      x2={sx(spec.min + i)}
                      y2={y + 3}
                      stroke={c.chartGrid}
                    />
                  ))
                : null}
              {ticks.map((n) => (
                <Line key={n} x1={sx(n)} y1={y - 6} x2={sx(n)} y2={y + 6} stroke={c.chartInk} />
              ))}
              {ticks.map((n) => (
                <ChartText
                  key={`t${n}`}
                  x={sx(n)}
                  y={y + 22}
                  fontSize={chart.label}
                  fill={c.chartMuted}
                  textAnchor="middle"
                >
                  {n}
                </ChartText>
              ))}
              {arcs.map(({ from, to }, i) => {
                const lift = Math.min(h * 0.45, 30 + Math.abs(to - from) * unit * 0.3);
                const mid = (sx(from) + sx(to)) / 2;
                const label =
                  arcs.length === 1
                    ? `${back ? '−' : b >= 0 ? '+' : ''}${rep.value(spec.jump)}`
                    : `${sign > 0 ? '+' : '−'}${Math.abs(to - from)}`;
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
                      x={mid}
                      y={y - lift - 8}
                      fontSize={arcs.length === 1 ? chart.value : chart.small}
                      fill={c.chartInk}
                      textAnchor="middle"
                    >
                      {label}
                    </ChartText>
                  </G>
                );
              })}
              <Circle cx={sx(a)} cy={y} r={5} fill={c.chartMuted} />
              <Circle cx={sx(end)} cy={y} r={6} fill={c.chartInk} />
              <ChartText
                x={sx(a)}
                y={y + 40}
                fontSize={chart.label}
                fill={c.chartInk}
                textAnchor="middle"
              >
                {rep.label(spec.start)}
              </ChartText>
              <ChartText
                x={sx(end)}
                y={Math.abs(sx(end) - sx(a)) < 90 ? y + 54 : y + 40}
                fontSize={chart.label}
                fill={c.chartInk}
                textAnchor="middle"
              >
                {rep.label(spec.end)}
              </ChartText>
            </Svg>
            <DragHandle
              testID="drag-start"
              x={sx(a)}
              y={y}
              label={rep.variable(spec.start).name}
              onStart={() => (start.current = a)}
              onMove={(dx) =>
                calc.set({
                  ...rep.pin([spec.jump]),
                  [spec.start]: rep.snapTo(spec.start, start.current + dx / unit),
                })
              }
            />
            <DragHandle
              testID="drag-end"
              x={sx(end)}
              y={y}
              label={rep.variable(spec.end).name}
              onStart={() => (start.current = end)}
              onMove={(dx) =>
                calc.set({
                  ...rep.pin([spec.start]),
                  [spec.end]: rep.snapTo(spec.end, start.current + dx / unit),
                })
              }
            />
          </>
        );
      }}
    </Canvas>
  );
}

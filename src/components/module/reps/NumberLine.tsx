import { useRef } from 'react';
import Svg, { Circle, Line, Path } from 'react-native-svg';

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

  return (
    <Canvas aspect={0.42}>
      {({ w, h }) => {
        const pad = 24;
        const unit = (w - 2 * pad) / (spec.max - spec.min);
        const sx = (n: number) => pad + (n - spec.min) * unit;
        const y = h * 0.7;
        const tick = spec.tick ?? 1;
        const ticks = Array.from(
          { length: Math.floor((spec.max - spec.min) / tick) + 1 },
          (_, i) => spec.min + i * tick,
        );
        const lift = Math.min(h * 0.45, 30 + Math.abs(end - a) * unit * 0.3);
        const mid = (sx(a) + sx(end)) / 2;
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
              <Path
                d={`M ${sx(a)} ${y} Q ${mid} ${y - 2 * lift} ${sx(end)} ${y}`}
                stroke={c.chartInk}
                strokeWidth={chart.stroke}
                strokeDasharray={chart.dash}
                fill="none"
                opacity={faded ? 0.35 : 1}
              />
              <ChartText
                x={mid}
                y={y - lift - 8}
                fontSize={chart.value}
                fill={c.chartInk}
                textAnchor="middle"
              >
                {`${b >= 0 ? '+' : ''}${rep.label(spec.jump).split(' = ')[1]}`}
              </ChartText>
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
                y={y + 40}
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

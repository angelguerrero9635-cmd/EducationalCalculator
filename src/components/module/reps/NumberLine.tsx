import { useRef } from 'react';
import Svg, { Circle, Line, Path, Text as SvgText } from 'react-native-svg';

import type { Representation } from '@/data/modules';
import { usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, DragHandle, useRep } from './common';

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
        const ticks = Array.from({ length: spec.max - spec.min + 1 }, (_, i) => spec.min + i);
        const lift = Math.min(h * 0.45, 30 + Math.abs(end - a) * unit * 0.3);
        const mid = (sx(a) + sx(end)) / 2;
        return (
          <>
            <Svg width={w} height={h}>
              <Line x1={pad - 8} y1={y} x2={w - pad + 8} y2={y} stroke={c.text} strokeWidth={2} />
              {ticks.map((n) => (
                <Line key={n} x1={sx(n)} y1={y - 6} x2={sx(n)} y2={y + 6} stroke={c.text} />
              ))}
              {ticks.map((n) => (
                <SvgText
                  key={`t${n}`}
                  x={sx(n)}
                  y={y + 22}
                  fontSize={12}
                  fill={c.textMuted}
                  textAnchor="middle"
                >
                  {n}
                </SvgText>
              ))}
              <Path
                d={`M ${sx(a)} ${y} Q ${mid} ${y - 2 * lift} ${sx(end)} ${y}`}
                stroke={c.text}
                strokeWidth={2}
                strokeDasharray="5 4"
                fill="none"
                opacity={faded ? 0.35 : 1}
              />
              <SvgText x={mid} y={y - lift - 8} fontSize={13} fill={c.text} textAnchor="middle">
                {`${b >= 0 ? '+' : ''}${rep.label(spec.jump).split(' = ')[1]}`}
              </SvgText>
              <Circle cx={sx(a)} cy={y} r={5} fill={c.textMuted} />
              <Circle cx={sx(end)} cy={y} r={6} fill={c.text} />
              <SvgText x={sx(a)} y={y + 40} fontSize={12} fill={c.text} textAnchor="middle">
                {rep.label(spec.start)}
              </SvgText>
              <SvgText x={sx(end)} y={y + 40} fontSize={12} fill={c.text} textAnchor="middle">
                {rep.label(spec.end)}
              </SvgText>
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

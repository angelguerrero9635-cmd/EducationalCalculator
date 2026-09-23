import { useRef } from 'react';
import Svg, { Line, Rect, Text as SvgText } from 'react-native-svg';

import type { Representation } from '@/data/modules';
import { usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, DragHandle, useRep } from './common';

type Spec = Extract<Representation, { kind: 'rectangle' }>;

export function RectangleDiagram({ spec, calc }: { spec: Spec; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  const start = useRef({ l: 0, w: 0 });
  const l = rep.val(spec.length);
  const wd = rep.val(spec.width);
  const faded = ![spec.length, spec.width].every(rep.known);

  return (
    <Canvas aspect={0.8}>
      {({ w, h }) => {
        const left = 70;
        const top = 16;
        const unit = Math.min((w - left - 24) / spec.max, (h - top - 44) / spec.max);
        const rw = Math.min(l, spec.max) * unit;
        const rh = Math.min(wd, spec.max) * unit;
        const showGrid = Number.isInteger(l) && Number.isInteger(wd) && l <= 20 && wd <= 20;
        return (
          <>
            <Svg width={w} height={h}>
              <Rect
                x={left}
                y={top}
                width={rw}
                height={rh}
                fill={c.placeholder}
                stroke={c.text}
                strokeWidth={2}
                opacity={faded ? 0.35 : 1}
              />
              {showGrid
                ? [
                    ...Array.from({ length: Math.max(0, Math.min(l, spec.max) - 1) }, (_, i) => (
                      <Line
                        key={`x${i}`}
                        x1={left + (i + 1) * unit}
                        y1={top}
                        x2={left + (i + 1) * unit}
                        y2={top + rh}
                        stroke={c.border}
                      />
                    )),
                    ...Array.from({ length: Math.max(0, Math.min(wd, spec.max) - 1) }, (_, i) => (
                      <Line
                        key={`y${i}`}
                        x1={left}
                        y1={top + (i + 1) * unit}
                        x2={left + rw}
                        y2={top + (i + 1) * unit}
                        stroke={c.border}
                      />
                    )),
                  ]
                : null}
              <SvgText
                x={left + rw / 2}
                y={top + rh + 22}
                fontSize={13}
                fill={c.text}
                textAnchor="middle"
              >
                {rep.label(spec.length)}
              </SvgText>
              <SvgText
                x={left - 8}
                y={top + rh / 2 + 4}
                fontSize={13}
                fill={c.text}
                textAnchor="end"
              >
                {rep.label(spec.width)}
              </SvgText>
              {spec.inside ? (
                <SvgText
                  x={left + Math.max(rw, 90) / 2}
                  y={top + rh / 2 + 5}
                  fontSize={14}
                  fontWeight="700"
                  fill={c.text}
                  textAnchor="middle"
                >
                  {rep.label(spec.inside)}
                </SvgText>
              ) : null}
            </Svg>
            <DragHandle
              testID="drag-corner"
              x={left + rw}
              y={top + rh}
              label={`${rep.variable(spec.length).name} and ${rep.variable(spec.width).name}`}
              onStart={() => (start.current = { l, w: wd })}
              onMove={(dx, dy) =>
                calc.set({
                  [spec.length]: rep.snapTo(spec.length, start.current.l + dx / unit),
                  [spec.width]: rep.snapTo(spec.width, start.current.w + dy / unit),
                })
              }
            />
          </>
        );
      }}
    </Canvas>
  );
}

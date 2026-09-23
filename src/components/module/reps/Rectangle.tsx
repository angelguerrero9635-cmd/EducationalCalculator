import { useRef } from 'react';
import Svg, { Line, Rect } from 'react-native-svg';

import type { Representation } from '@/data/modules';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, ChartText, DragHandle, useFrozen, useRep } from './common';

type Spec = Extract<Representation, { kind: 'rectangle' }>;

/** Rectangle drawn to scale with its unit squares. Drag the corner to change both sides. */
export function RectangleDiagram({ spec, calc }: { spec: Spec; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  const start = useRef({ l: 0, w: 0 });
  const l = rep.val(spec.length);
  const wd = rep.val(spec.width);
  const faded = ![spec.length, spec.width].every(rep.known);
  // Extent and unit squares are in the shown unit; geometry stays in formula units.
  const f = rep.factor(spec.length);
  const fit = useFrozen(Math.max(spec.extent, Math.ceil(Math.max(l, wd) / f)) * f);
  const sl = rep.shown(spec.length);
  const sw = rep.shown(spec.width);
  const sameUnit = rep.unit(spec.length) === rep.unit(spec.width);

  return (
    <Canvas aspect={0.8}>
      {({ w, h }) => {
        const left = 72;
        const top = 16;
        const unit = Math.min((w - left - 28) / fit.value, (h - top - 44) / fit.value);
        const rw = l * unit;
        const rh = wd * unit;
        const cellPx = unit * f;
        const showGrid = sameUnit && Number.isInteger(sl) && Number.isInteger(sw) && cellPx >= 6;
        return (
          <>
            <Svg width={w} height={h}>
              <Rect
                x={left}
                y={top}
                width={rw}
                height={rh}
                fill={c.chartFill}
                stroke={c.chartInk}
                strokeWidth={chart.stroke}
                opacity={faded ? 0.35 : 1}
              />
              {showGrid
                ? [
                    ...Array.from({ length: Math.max(0, sl - 1) }, (_, i) => (
                      <Line
                        key={`x${i}`}
                        x1={left + (i + 1) * cellPx}
                        y1={top}
                        x2={left + (i + 1) * cellPx}
                        y2={top + rh}
                        stroke={c.chartGrid}
                      />
                    )),
                    ...Array.from({ length: Math.max(0, sw - 1) }, (_, i) => (
                      <Line
                        key={`y${i}`}
                        x1={left}
                        y1={top + (i + 1) * cellPx}
                        x2={left + rw}
                        y2={top + (i + 1) * cellPx}
                        stroke={c.chartGrid}
                      />
                    )),
                  ]
                : null}
              <ChartText
                x={left + rw / 2}
                y={top + rh + 22}
                fontSize={chart.value}
                textAnchor="middle"
              >
                {rep.label(spec.length)}
              </ChartText>
              <ChartText x={left - 8} y={top + rh / 2 + 4} fontSize={chart.value} textAnchor="end">
                {rep.label(spec.width)}
              </ChartText>
              {spec.inside ? (
                <ChartText
                  x={left + Math.max(rw, 100) / 2}
                  y={top + rh / 2 + 5}
                  fontSize={chart.emphasis}
                  fontWeight="700"
                  textAnchor="middle"
                >
                  {rep.label(spec.inside)}
                </ChartText>
              ) : null}
            </Svg>
            <DragHandle
              testID="drag-corner"
              x={left + rw}
              y={top + rh}
              label={`${rep.variable(spec.length).name} and ${rep.variable(spec.width).name}`}
              onStart={() => {
                start.current = { l, w: wd };
                fit.freeze();
              }}
              onEnd={fit.release}
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

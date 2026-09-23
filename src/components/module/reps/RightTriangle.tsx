import { useRef } from 'react';
import Svg, { Line, Polygon } from 'react-native-svg';

import type { Representation } from '@/data/modules';
import { formatNumber } from '@/engine/format';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, ChartText, DragHandle, useFrozen, useRep } from './common';

type Spec = Extract<Representation, { kind: 'rightTriangle' }>;

/** Right triangle with the square on each side, so a² + b² = c² is visible as areas. */
export function RightTriangle({ spec, calc }: { spec: Spec; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  const start = useRef(0);
  const a = rep.val(spec.a);
  const b = rep.val(spec.b);
  const faded = ![spec.a, spec.b, spec.c].every(rep.known);
  const fit = useFrozen(Math.max(spec.extent, Math.ceil(Math.max(a, b))));
  const sq = (id: string) => {
    const v = rep.variable(id);
    return rep.known(id) ? `${v.symbol}² = ${formatNumber(rep.val(id) ** 2)}` : `${v.symbol}² = ?`;
  };

  return (
    <Canvas aspect={1}>
      {({ w, h }) => {
        // Math coordinates (y up), right angle at the origin: legs on the axes, squares on
        // a (left), b (below) and c (outward from the hypotenuse). Fits 3 × extent each way.
        const s = (Math.min(w, h) - 16) / (3 * fit.value);
        const ox = fit.value * s + 8;
        const oy = h - fit.value * s - 8;
        const P = (x: number, y: number) => `${ox + x * s},${oy - y * s}`;
        const X = (x: number) => ox + x * s;
        const Y = (y: number) => oy - y * s;
        const op = faded ? 0.35 : 1;
        const corner = Math.min(0.6, Math.min(a, b) / 3);
        return (
          <>
            <Svg width={w} height={h}>
              <Polygon
                points={[P(-a, 0), P(0, 0), P(0, a), P(-a, a)].join(' ')}
                fill={c.chartSurface}
                stroke={c.chartGrid}
                opacity={op}
              />
              <Polygon
                points={[P(0, 0), P(b, 0), P(b, -b), P(0, -b)].join(' ')}
                fill={c.chartSurface}
                stroke={c.chartGrid}
                opacity={op}
              />
              <Polygon
                points={[P(0, a), P(b, 0), P(b + a, b), P(a, a + b)].join(' ')}
                fill={c.chartFill}
                stroke={c.chartGrid}
                opacity={op}
              />
              <Polygon
                points={[P(0, 0), P(b, 0), P(0, a)].join(' ')}
                fill={c.background}
                stroke={c.chartInk}
                strokeWidth={chart.stroke}
                opacity={op}
              />
              <Line x1={X(corner)} y1={Y(0)} x2={X(corner)} y2={Y(corner)} stroke={c.chartInk} />
              <Line x1={X(0)} y1={Y(corner)} x2={X(corner)} y2={Y(corner)} stroke={c.chartInk} />
              {[
                // Each side's label and its square's area, centered in that side's square.
                { id: spec.a, x: -a / 2, y: a / 2 },
                { id: spec.b, x: b / 2, y: -b / 2 },
                { id: spec.c, x: (a + b) / 2, y: (a + b) / 2 },
              ].map(({ id, x, y }) => [
                <ChartText
                  key={`${id}-l`}
                  x={X(x)}
                  y={Y(y) - 2}
                  fontWeight="600"
                  textAnchor="middle"
                >
                  {rep.label(id)}
                </ChartText>,
                <ChartText
                  key={`${id}-s`}
                  x={X(x)}
                  y={Y(y) + 13}
                  fontSize={chart.small}
                  fill={c.chartMuted}
                  textAnchor="middle"
                >
                  {sq(id)}
                </ChartText>,
              ])}
            </Svg>
            <DragHandle
              testID="drag-a"
              x={X(0)}
              y={Y(a)}
              label={rep.variable(spec.a).name}
              onStart={() => {
                start.current = a;
                fit.freeze();
              }}
              onEnd={fit.release}
              onMove={(_, dy) =>
                calc.set({
                  ...rep.pin([spec.b]),
                  [spec.a]: rep.snapTo(spec.a, start.current - dy / s),
                })
              }
            />
            <DragHandle
              testID="drag-b"
              x={X(b)}
              y={Y(0)}
              label={rep.variable(spec.b).name}
              onStart={() => {
                start.current = b;
                fit.freeze();
              }}
              onEnd={fit.release}
              onMove={(dx) =>
                calc.set({
                  ...rep.pin([spec.a]),
                  [spec.b]: rep.snapTo(spec.b, start.current + dx / s),
                })
              }
            />
          </>
        );
      }}
    </Canvas>
  );
}

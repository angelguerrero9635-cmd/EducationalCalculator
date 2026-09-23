import { useRef } from 'react';
import Svg, { Line, Polygon, Text as SvgText } from 'react-native-svg';

import type { Representation } from '@/data/modules';
import { formatNumber } from '@/engine/format';
import { usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, DragHandle, useRep } from './common';

type Spec = Extract<Representation, { kind: 'rightTriangle' }>;

/** Right triangle with the square on each side, so a² + b² = c² is visible as areas. */
export function RightTriangle({ spec, calc }: { spec: Spec; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  const start = useRef(0);
  const a = Math.min(rep.val(spec.a), spec.max);
  const b = Math.min(rep.val(spec.b), spec.max);
  const faded = ![spec.a, spec.b, spec.c].every(rep.known);
  const sq = (id: string) => {
    const v = rep.variable(id);
    return rep.known(id) ? `${v.symbol}² = ${formatNumber(rep.val(id) ** 2)}` : `${v.symbol}² = ?`;
  };

  return (
    <Canvas aspect={1}>
      {({ w, h }) => {
        // Math coordinates (y up) with the right angle at the origin: legs on the axes,
        // squares on a (left), b (below) and c (outward from the hypotenuse).
        const s = (Math.min(w, h) - 16) / (3 * spec.max);
        const ox = spec.max * s + 8;
        const oy = h - spec.max * s - 8;
        const P = (x: number, y: number) => `${ox + x * s},${oy - y * s}`;
        const X = (x: number) => ox + x * s;
        const Y = (y: number) => oy - y * s;
        const op = faded ? 0.35 : 1;
        return (
          <>
            <Svg width={w} height={h}>
              <Polygon
                points={[P(-a, 0), P(0, 0), P(0, a), P(-a, a)].join(' ')}
                fill={c.surface}
                stroke={c.border}
                opacity={op}
              />
              <Polygon
                points={[P(0, 0), P(b, 0), P(b, -b), P(0, -b)].join(' ')}
                fill={c.surface}
                stroke={c.border}
                opacity={op}
              />
              <Polygon
                points={[P(0, a), P(b, 0), P(b + a, b), P(a, a + b)].join(' ')}
                fill={c.placeholder}
                stroke={c.border}
                opacity={op}
              />
              <Polygon
                points={[P(0, 0), P(b, 0), P(0, a)].join(' ')}
                fill={c.background}
                stroke={c.text}
                strokeWidth={2}
                opacity={op}
              />
              <Line x1={X(0.6)} y1={Y(0)} x2={X(0.6)} y2={Y(0.6)} stroke={c.text} />
              <Line x1={X(0)} y1={Y(0.6)} x2={X(0.6)} y2={Y(0.6)} stroke={c.text} />
              {[
                // Each side's label and its square's area, centered in that side's square.
                { id: spec.a, x: -a / 2, y: a / 2 },
                { id: spec.b, x: b / 2, y: -b / 2 },
                { id: spec.c, x: (a + b) / 2, y: (a + b) / 2 },
              ].map(({ id, x, y }) => [
                <SvgText
                  key={`${id}-l`}
                  x={X(x)}
                  y={Y(y) - 2}
                  fontSize={12}
                  fontWeight="600"
                  fill={c.text}
                  textAnchor="middle"
                >
                  {rep.label(id)}
                </SvgText>,
                <SvgText
                  key={`${id}-s`}
                  x={X(x)}
                  y={Y(y) + 13}
                  fontSize={11}
                  fill={c.textMuted}
                  textAnchor="middle"
                >
                  {sq(id)}
                </SvgText>,
              ])}
            </Svg>
            <DragHandle
              testID="drag-a"
              x={X(0)}
              y={Y(a)}
              label={rep.variable(spec.a).name}
              onStart={() => (start.current = a)}
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
              onStart={() => (start.current = b)}
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

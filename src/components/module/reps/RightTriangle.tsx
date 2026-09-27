import { useRef } from 'react';
import { View } from 'react-native';
import Svg, { Line, Polygon } from 'react-native-svg';

import type { Representation } from '@/data/modules';
import { formatNumber } from '@/engine/format';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, Caption, ChartText, DragHandle, useFrozen, useRep } from './common';
import { near, rootText } from './DistanceLegs';

type Spec = Extract<Representation, { kind: 'rightTriangle' }>;

/**
 * Right triangle with the square on each side, so a² + b² = c² is visible as areas. With
 * `grid`, each square is ruled in unit squares (whole sides up to 12), so 9 + 16 = 25 can be
 * counted; the caption works the equation with the numbers.
 */
export function RightTriangle({ spec, calc }: { spec: Spec; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  const start = useRef(0);
  const a = rep.val(spec.a);
  const b = rep.val(spec.b);
  const faded = ![spec.a, spec.b, spec.c].every(rep.known);
  const f = rep.factor(spec.a);
  const fit = useFrozen(Math.max(spec.extent, Math.ceil(Math.max(a, b) / f)) * f);
  const sq = (id: string) => {
    const v = rep.variable(id);
    return rep.known(id)
      ? `${v.symbol}² = ${formatNumber(rep.shown(id) ** 2)}`
      : `${v.symbol}² = ?`;
  };

  const known = [spec.a, spec.b, spec.c].every(rep.known);
  // All three sides in a's unit, so the squares add up whatever unit each box shows.
  const [sa, sb, sc] = [spec.a, spec.b, spec.c].map((id) => rep.val(id) / f) as [
    number,
    number,
    number,
  ];
  const sym = (id: string) => rep.variable(id).symbol;
  const unit = rep.unit(spec.a);
  const sum = sa * sa + sb * sb;
  const caption = known
    ? `${sym(spec.a)}² + ${sym(spec.b)}² = ${sym(spec.c)}² · ` +
      `${formatNumber(sa)}² + ${formatNumber(sb)}² = ${near(sa * sa)} + ${near(sb * sb)} = ${near(sum)} · ` +
      `${sym(spec.c)} = ${rootText(sum).startsWith('√') ? rootText(sum) : `√${near(sum)} = ${rootText(sum)}`}${unit ? ` ${unit}` : ''}`
    : `${sym(spec.a)}² + ${sym(spec.b)}² = ${sym(spec.c)}²: type two sides to find the third.`;
  // Unit squares only where they can be counted: whole sides up to 12 in the shown unit.
  const ruled = !!spec.grid && Math.max(sa, sb, sc) <= 12;

  return (
    <View>
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
          // Unit-square lines (every shown unit, f formula units) across a square with corner
          // o and sides along u and v (unit vectors), `side` long.
          const rule = (
            key: string,
            o: [number, number],
            u: [number, number],
            v: [number, number],
            side: number,
          ) =>
            Array.from({ length: Math.max(0, Math.ceil(side / f - 1e-9) - 1) }, (_, i) => {
              const t = (i + 1) * f;
              return [
                <Line
                  key={`${key}u${i}`}
                  x1={X(o[0] + u[0] * t)}
                  y1={Y(o[1] + u[1] * t)}
                  x2={X(o[0] + u[0] * t + v[0] * side)}
                  y2={Y(o[1] + u[1] * t + v[1] * side)}
                  stroke={c.chartMuted}
                  strokeWidth={1}
                  opacity={op * 0.4}
                />,
                <Line
                  key={`${key}v${i}`}
                  x1={X(o[0] + v[0] * t)}
                  y1={Y(o[1] + v[1] * t)}
                  x2={X(o[0] + v[0] * t + u[0] * side)}
                  y2={Y(o[1] + v[1] * t + u[1] * side)}
                  stroke={c.chartMuted}
                  strokeWidth={1}
                  opacity={op * 0.4}
                />,
              ];
            });
          const cc = Math.hypot(a, b) || 1;
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
                {ruled
                  ? [
                      rule('a', [-a, 0], [1, 0], [0, 1], a),
                      rule('b', [0, -b], [1, 0], [0, 1], b),
                      rule('c', [0, a], [b / cc, -a / cc], [a / cc, b / cc], cc),
                    ]
                  : null}
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
                  calc.set(
                    {
                      ...rep.pin([spec.b]),
                      [spec.a]: rep.snapTo(spec.a, start.current - dy / s),
                    },
                    rep.slide(spec.a),
                  )
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
                  calc.set(
                    {
                      ...rep.pin([spec.a]),
                      [spec.b]: rep.snapTo(spec.b, start.current + dx / s),
                    },
                    rep.slide(spec.b),
                  )
                }
              />
            </>
          );
        }}
      </Canvas>
      <Caption>{caption}</Caption>
    </View>
  );
}

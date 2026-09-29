import { View } from 'react-native';
import Svg, { Circle, Line, Path, Polygon } from 'react-native-svg';

import type { Representation } from '@/data/modules';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, Caption, ChartText, fitLabel, useRep } from './common';
import { Steppers } from './Steppers';

type Spec = Extract<Representation, { kind: 'angles' }>;

const rad = (deg: number) => (deg * Math.PI) / 180;

/**
 * A triangle with its three angles (`parts` at the bottom two corners, `triangle.third` at
 * the top) and the exterior angle at the top corner (`whole`): the left side runs on past the
 * top, and the angle between that line and the right side equals the two far angles together.
 */
export function TriangleAngles({ spec, calc }: { spec: Spec; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  const [first, second] = spec.parts;
  const third = spec.triangle!.third;
  const exterior = typeof spec.whole === 'string' ? spec.whole : undefined;
  const known = rep.known(first) && rep.known(second);
  const sym = (id: string) => (rep.words ? rep.variable(id).name : rep.variable(id).symbol);
  // The two bottom angles as drawn: typed, or 60° each while a box shows "?". Kept inside a
  // triangle (together under 180°) and wide enough to see.
  const a = Math.min(170, Math.max(4, rep.known(first) ? rep.shown(first) : 60));
  const b = Math.min(176 - a, Math.max(4, rep.known(second) ? rep.shown(second) : 60));
  const top = 180 - a - b;

  return (
    <View>
      <Canvas aspect={0.62}>
        {({ w, h }) => {
          // The base is 1 long; the top corner is where the two sides meet (law of sines).
          const side = Math.sin(rad(b)) / Math.sin(rad(a + b));
          const tx = side * Math.cos(rad(a));
          const ty = side * Math.sin(rad(a));
          // The left side runs on past the top corner by a third of its length.
          const ex = tx * 1.35;
          const ey = ty * 1.35;
          const minX = Math.min(0, tx, ex);
          const maxX = Math.max(1, tx, ex);
          const maxY = Math.max(ty, ey);
          const pad = 30;
          const s = Math.min((w - 2 * pad) / (maxX - minX), (h - 2 * pad) / Math.max(maxY, 0.05));
          const X = (x: number) => pad + (x - minX) * s + (w - 2 * pad - (maxX - minX) * s) / 2;
          const Y = (y: number) => h - pad - y * s;
          const A = [X(0), Y(0)] as const;
          const B = [X(1), Y(0)] as const;
          const C = [X(tx), Y(ty)] as const;
          const E = [X(ex), Y(ey)] as const;
          /** A wedge at (x, y) from direction `from` to `to` (degrees, counterclockwise). */
          const wedge = (x: number, y: number, from: number, to: number, r: number) => {
            const p = (d: number) => [x + r * Math.cos(rad(d)), y - r * Math.sin(rad(d))];
            const [x1, y1] = p(from);
            const [x2, y2] = p(to);
            return `M ${x} ${y} L ${x1} ${y1} A ${r} ${r} 0 0 0 ${x2} ${y2} Z`;
          };
          const text = (x: number, y: number, d: number, r: number, t: string, key: string) => {
            const lx = x + r * Math.cos(rad(d));
            const ly = y - r * Math.sin(rad(d));
            return (
              <ChartText
                key={key}
                {...fitLabel(lx, t, chart.label, w)}
                y={ly + 4}
                fontSize={chart.label}
                fontWeight="700"
              >
                {t}
              </ChartText>
            );
          };
          const r = Math.min(34, s * 0.18);
          // Directions of the sides at each corner.
          const toC = a;
          const fromBtoC = 180 - b;
          const down = 180 + a; // from the top corner back to the bottom-left
          const toB = 360 - b; // from the top corner down to the bottom-right
          return (
            <Svg width={w} height={h} opacity={known ? 1 : 0.4}>
              <Polygon
                points={[A, B, C].map((p) => p.join(',')).join(' ')}
                fill={c.chartFill}
                opacity={0.35}
              />
              <Path d={wedge(...A, 0, toC, r)} fill={c.chartHighlight} opacity={0.3} />
              <Path d={wedge(...B, fromBtoC, 180, r)} fill={c.chartHighlight} opacity={0.3} />
              <Path d={wedge(...C, down, toB, r)} fill={c.chartHighlight} opacity={0.3} />
              {exterior ? <Path d={wedge(...C, toB - 360, a, r * 0.8)} fill={c.chartFill} /> : null}
              <Line
                x1={C[0]}
                y1={C[1]}
                x2={E[0]}
                y2={E[1]}
                stroke={c.chartMuted}
                strokeWidth={chart.stroke}
                strokeDasharray={chart.dash}
              />
              <Polygon
                points={[A, B, C].map((p) => p.join(',')).join(' ')}
                fill="none"
                stroke={c.chartInk}
                strokeWidth={chart.strokeHeavy}
              />
              {[A, B, C].map(([x, y], i) => (
                <Circle key={i} cx={x} cy={y} r={3} fill={c.chartInk} />
              ))}
              {text(...A, a / 2, r + 22, rep.label(first), 'la')}
              {text(...B, 180 - b / 2, r + 22, rep.label(second), 'lb')}
              {text(...C, (toB + down) / 2, r + 18, rep.label(third), 'lc')}
              {exterior ? text(...C, (toB - 360 + a) / 2, r + 26, rep.label(exterior), 'le') : null}
            </Svg>
          );
        }}
      </Canvas>
      <Caption>
        {[
          `${sym(first)} + ${sym(second)} + ${sym(third)} = 180°`,
          `${rep.value(first)} + ${rep.value(second)} + ${rep.value(third)} = 180°`,
          ...(exterior
            ? [
                `The exterior angle ${sym(exterior)} = ${sym(first)} + ${sym(second)} = ${rep.value(exterior)}: it and ${sym(third)} make a straight line.`,
              ]
            : ['The three angles of a triangle add to 180°.']),
        ].join(' · ')}
      </Caption>
      <Steppers
        calc={calc}
        items={spec.parts.map((id) => ({
          var: id,
          steps: [1, 10],
          pin: spec.parts.filter((x) => x !== id),
        }))}
      />
    </View>
  );
}

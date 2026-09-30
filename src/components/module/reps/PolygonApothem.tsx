/**
 * H106 (round 3, group B): `polygon` with its apothem (`apothem`), for the area of a regular
 * polygon. The n-gon sits on a flat side; lines from the center to the corners cut it into n
 * triangles (faint), the one on the bottom side tinted. The apothem runs from the center to that
 * side's midpoint with a right-angle mark and its label; with `angle`, half the center angle θ
 * is marked between the apothem and a radius. The bottom side is labelled s, and with `area` the
 * caption works K = ½ × a × P. Flat and exact: the shape is drawn from n; lengths are labels.
 */
import { View } from 'react-native';
import Svg, { G, Line, Path, Polygon, Circle } from 'react-native-svg';

import type { Representation } from '@/data/modules';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, Caption, ChartText, fitLabel, useRep } from './common';
import { RightAngle } from './dimKit';
import { Steppers } from './Steppers';

type Spec = Extract<Representation, { kind: 'polygon' }>;

const NAMES: Record<number, string> = {
  3: 'equilateral triangle',
  4: 'square',
  5: 'regular pentagon',
  6: 'regular hexagon',
  7: 'regular heptagon',
  8: 'regular octagon',
  9: 'regular nonagon',
  10: 'regular decagon',
  11: 'regular 11-gon',
  12: 'regular dodecagon',
};

export function PolygonApothem({ spec, calc }: { spec: Spec; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  const sides = spec.sides!;
  const n = Math.max(3, Math.min(12, Math.round(rep.shown(sides))));
  const a = spec.apothem!;
  const known = (id?: string) => !!id && rep.known(id);
  const say = (id: string) => (rep.known(id) ? rep.label(id) : `${rep.variable(id).symbol} = ?`);
  const theta = 180 / n;

  const lines: string[] = [
    `A ${NAMES[n] ?? `regular ${n}-gon`}: ${n} triangles meet at the center, each with base ${spec.side ? rep.variable(spec.side).symbol : 's'} and height ${rep.variable(a).symbol}, the apothem`,
  ];
  if (spec.angle)
    lines.push(
      `Half the center angle: ${rep.variable(spec.angle).symbol} = 180° ÷ ${n} = ${+theta.toFixed(4)}°`,
    );
  if (spec.area && spec.around && known(a) && known(spec.around))
    lines.push(
      `${rep.variable(spec.area).symbol} = ½ × ${rep.value(a, false)} × ${rep.value(spec.around, false)} = ${rep.known(spec.area) ? rep.value(spec.area) : '?'}`,
    );

  return (
    <View>
      <Canvas aspect={0.8}>
        {({ w, h }) => {
          // The polygon on a flat bottom side, as big as the canvas allows with room for labels.
          const R = Math.min((w - 40) / 2, (h - 56) / (1 + Math.cos(Math.PI / n))) * 0.94;
          const cx = w / 2;
          // Center to bottom side is R cos(π/n); to the top corner R (or the top side, n even).
          const top = n % 2 === 0 ? R * Math.cos(Math.PI / n) : R;
          const ap = R * Math.cos(Math.PI / n);
          const cy = 16 + top + (h - 56 - top - ap) / 2;
          const pts = Array.from({ length: n }, (_, i) => {
            const t = Math.PI / 2 + Math.PI / n + (2 * Math.PI * i) / n;
            return [cx + R * Math.cos(t), cy + R * Math.sin(t)] as [number, number];
          });
          // pts[n − 1] and pts[0] are the bottom side's ends (left, right).
          const [bl, br] = [pts[n - 1]!, pts[0]!];
          const my = cy + ap;
          const half = R * Math.sin(Math.PI / n);
          const fade = known(a) ? 1 : 0.4;
          // θ: an arc between the apothem (down) and the radius to the bottom-right corner.
          const rArc = Math.min(26, ap * 0.4);
          const arc = `M ${cx} ${cy + rArc} A ${rArc} ${rArc} 0 0 0 ${cx + rArc * Math.sin(Math.PI / n)} ${cy + rArc * Math.cos(Math.PI / n)}`;
          const aText = say(a);
          const aX = cx + 8;
          const aFit = fitLabel(aX, aText, chart.label, w, 'start');
          const sText = spec.side ? say(spec.side) : '';
          return (
            <Svg width={w} height={h}>
              <Polygon
                points={pts.map((p) => p.join(',')).join(' ')}
                fill={c.chartFill}
                stroke={c.chartInk}
                strokeWidth={chart.strokeHeavy}
                strokeLinejoin="round"
              />
              {/* The n triangles: a line from the center to every corner. */}
              {pts.map(([x, y], i) => (
                <Line
                  key={`r${i}`}
                  x1={cx}
                  y1={cy}
                  x2={x}
                  y2={y}
                  stroke={c.chartMuted}
                  strokeWidth={chart.strokeLight}
                  strokeDasharray={chart.dashFine}
                />
              ))}
              <Path
                d={`M ${cx} ${cy} L ${bl[0]} ${bl[1]} L ${br[0]} ${br[1]} Z`}
                fill={c.chartHighlight}
                opacity={0.16}
              />
              <G opacity={fade}>
                <Line
                  x1={cx}
                  y1={cy}
                  x2={cx}
                  y2={my}
                  stroke={c.chartHighlight}
                  strokeWidth={chart.strokeHeavy}
                />
                <RightAngle x={cx} y={my} dx={1} dy={-1} size={9} color={c.chartHighlight} />
              </G>
              {spec.angle ? (
                <G>
                  <Path d={arc} stroke={c.fnSecond} strokeWidth={chart.stroke} fill="none" />
                  <ChartText
                    x={cx - 6}
                    y={cy + rArc + 4}
                    fontSize={chart.label}
                    fontWeight="700"
                    textAnchor="end"
                    fill={c.fnSecond}
                  >
                    {`${rep.variable(spec.angle).symbol} = ${+theta.toFixed(2)}°`}
                  </ChartText>
                </G>
              ) : null}
              <Circle cx={cx} cy={cy} r={3.5} fill={c.chartInk} />
              <ChartText
                x={aFit.x}
                y={(cy + my) / 2 + 12}
                fontSize={chart.label}
                fontWeight="700"
                textAnchor={aFit.textAnchor}
                fill={known(a) ? c.chartHighlight : c.chartMuted}
              >
                {aText}
              </ChartText>
              {spec.side ? (
                <ChartText
                  x={cx}
                  y={my + 20}
                  fontSize={chart.label}
                  fontWeight="700"
                  textAnchor="middle"
                  fill={known(spec.side) ? c.chartInk : c.chartMuted}
                >
                  {half > 0 ? sText : ''}
                </ChartText>
              ) : null}
            </Svg>
          );
        }}
      </Canvas>
      <Caption>{lines.join(' · ')}</Caption>
      <Steppers
        calc={calc}
        items={[{ var: sides, steps: [1], pin: spec.side ? [spec.side] : [], skip: [1, 2] }]}
      />
    </View>
  );
}

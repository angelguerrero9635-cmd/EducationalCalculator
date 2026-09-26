import { View } from 'react-native';
import Svg, { Circle, Line, Polygon } from 'react-native-svg';

import type { Representation } from '@/data/modules';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, nowrap, useRep, Caption } from './common';
import { Steppers } from './Steppers';

type Spec = Extract<Representation, { kind: 'prism' }>;

const NAMES: Record<number, string> = {
  3: 'triangular prism',
  4: 'cube (or a box)',
  5: 'pentagonal prism',
  6: 'hexagonal prism',
};

/**
 * A prism seen from slightly above: two copies of the base joined by straight edges. Corners
 * are dotted; hidden edges are dashed. − / + change the sides of the base.
 */
export function Prism({ spec, calc }: { spec: Spec; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  const n = Math.max(3, Math.round(rep.shown(spec.sides)));

  return (
    <View>
      <Canvas aspect={0.7}>
        {({ w, h }) => {
          const rx = Math.min(w * 0.3, 120);
          const ry = rx * 0.4;
          const height = n === 4 ? rx * 1.25 : h * 0.45;
          const cx = w / 2;
          const topY = (h - height) / 2;
          // Turned a little, so no edge points straight at the viewer (looks solid).
          const angle = (i: number) => (2 * Math.PI * i) / n + Math.PI / 2 + 0.45;
          const base = (y: number) =>
            Array.from({ length: n }, (_, i) => ({
              x: cx + rx * Math.cos(angle(i)),
              y: y + ry * Math.sin(angle(i)),
            }));
          // Seen from above: side face i (from corner i to i + 1) faces us when its middle is
          // on the near side. Hidden edges are dashed: a bottom edge of a hidden face, and an
          // upright edge between two hidden faces.
          const faces = (i: number) => Math.sin(angle(i) + Math.PI / n) > 1e-9;
          const hiddenUpright = (i: number) => !faces(i) && !faces((i + n - 1) % n);
          const top = base(topY);
          const bottom = base(topY + height);
          const ink = { stroke: c.chartInk, strokeWidth: chart.stroke };
          return (
            <Svg width={w} height={h} opacity={rep.known(spec.sides) ? 1 : 0.35}>
              {/* A see-through solid lit from the front left: each visible side a little
                  darker the more it turns away, so the shape reads as solid while the dashed
                  hidden edges still show through. */}
              {top.map((p, i) => {
                if (!faces(i)) return null;
                const j = (i + 1) % n;
                const turn = Math.cos(angle(i) + Math.PI / n - Math.PI * 0.7);
                return (
                  <Polygon
                    key={`f${i}`}
                    points={[p, top[j]!, bottom[j]!, bottom[i]!]
                      .map((q) => `${q.x},${q.y}`)
                      .join(' ')}
                    fill={c.chartHighlight}
                    fillOpacity={0.1 + (0.18 * (1 - turn)) / 2}
                  />
                );
              })}
              <Polygon
                points={top.map((p) => `${p.x},${p.y}`).join(' ')}
                fill={c.chartHighlight}
                fillOpacity={0.06}
                {...ink}
              />
              {bottom.map((p, i) => {
                const q = bottom[(i + 1) % n]!;
                return (
                  <Line
                    key={`b${i}`}
                    x1={p.x}
                    y1={p.y}
                    x2={q.x}
                    y2={q.y}
                    {...ink}
                    strokeDasharray={faces(i) ? undefined : chart.dash}
                  />
                );
              })}
              {top.map((p, i) => (
                <Line
                  key={`s${i}`}
                  x1={p.x}
                  y1={p.y}
                  x2={bottom[i]!.x}
                  y2={bottom[i]!.y}
                  {...ink}
                  strokeDasharray={hiddenUpright(i) ? chart.dash : undefined}
                />
              ))}
              {[...top, ...bottom].map((p, i) => (
                <Circle key={`v${i}`} cx={p.x} cy={p.y} r={4.5} fill={c.chartHighlight} />
              ))}
            </Svg>
          );
        }}
      </Canvas>
      <Caption>{`A ${NAMES[n] ?? `prism with a ${n}-sided base`}: ${nowrap(`${rep.label(spec.faces)} faces`)}, ${nowrap(`${rep.label(spec.edges)} edges`)}, ${nowrap(`${rep.label(spec.corners)} corners`)}`}</Caption>
      <Steppers calc={calc} items={[{ var: spec.sides, steps: [1], pin: [] }]} />
    </View>
  );
}

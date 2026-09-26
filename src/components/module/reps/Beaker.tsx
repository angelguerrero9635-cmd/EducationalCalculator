import { View } from 'react-native';
import Svg, { Defs, Ellipse, G, Line, Path, Rect } from 'react-native-svg';

import type { Representation } from '@/data/modules';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, ChartText, useRep, Caption } from './common';
import { Deepen, FloorShadow, Glass, Sheen, url, usePaintIds } from './paint';
import { Steppers } from './Steppers';

type Spec = Extract<Representation, { kind: 'beaker' }>;

/** A measuring jug with liter marks; each part is a layer of liquid, stacked up to the total. */
export function Beaker({ spec, calc }: { spec: Spec; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  const parts = spec.parts.map((id) => ({
    id,
    x: rep.known(id) ? Math.max(0, rep.shown(id)) : 0,
  }));
  const total = parts.reduce((s, p) => s + p.x, 0);
  const max = Math.max(spec.max, Math.ceil(total));
  const every = max > 10 ? 2 : 1;
  const ids = usePaintIds('glass', 'sheen', 'l0', 'l1', 'l2');
  // Each part is its own layer of water: deepest at the bottom, lighter as it's poured on top.
  const layers: [string, string][] = [
    [c.water, c.waterDeep],
    [c.waterTop, c.waterTop],
    [c.glass, c.waterTop],
  ];

  return (
    <View>
      <Canvas aspect={0.8}>
        {({ w, h }) => {
          const jw = Math.min(150, w * 0.4);
          const x0 = w * 0.18;
          const top = 20;
          const bottom = h - 16;
          const py = (x: number) => bottom - (x / max) * (bottom - top);
          let level = 0;
          return (
            <Svg width={w} height={h}>
              <Defs>
                <Glass id={ids.glass} />
                <Sheen id={ids.sheen} strength={0.8} />
                {layers.map(([from, to], i) => (
                  <Deepen key={i} id={ids[`l${i}` as 'l0']} from={from} to={to} />
                ))}
              </Defs>
              <FloorShadow cx={x0 + jw / 2} cy={bottom + 3} rx={jw * 0.55} ry={4} />
              {/* The glass body, then the water inside it. */}
              <Rect x={x0} y={top} width={jw} height={bottom - top} fill={url(ids.glass)} />
              {parts.map((p, i) => {
                const from = level;
                level += p.x;
                const y = py(level);
                return (
                  <G key={p.id}>
                    <Rect
                      x={x0}
                      y={y}
                      width={jw}
                      height={py(from) - y}
                      fill={url(ids[`l${i % layers.length}` as 'l0'])}
                    />
                    {/* Where one pour meets the next. */}
                    {i > 0 && p.x > 0 ? (
                      <Line
                        x1={x0}
                        y1={py(from)}
                        x2={x0 + jw}
                        y2={py(from)}
                        stroke={c.waterDeep}
                        strokeWidth={1}
                        strokeDasharray={chart.dashFine}
                      />
                    ) : null}
                    {p.x > 0 ? (
                      <ChartText x={x0 + jw + 16} y={(py(from) + y) / 2 + 4} fontSize={chart.small}>
                        {`${rep.variable(p.id).name}: ${rep.value(p.id)}`}
                      </ChartText>
                    ) : null}
                  </G>
                );
              })}
              {/* The water's surface, seen a little from above. */}
              {total > 0 ? (
                <Ellipse
                  cx={x0 + jw / 2}
                  cy={py(total)}
                  rx={jw / 2}
                  ry={3}
                  fill={c.waterTop}
                  stroke={c.water}
                  strokeWidth={1}
                />
              ) : null}
              <Rect x={x0} y={top} width={jw} height={bottom - top} fill={url(ids.sheen)} />
              {Array.from({ length: Math.floor(max / every) + 1 }, (_, i) => (
                <G key={i}>
                  <Line
                    x1={x0}
                    y1={py(i * every)}
                    x2={x0 + (i % 2 === 0 ? 14 : 9)}
                    y2={py(i * every)}
                    stroke={c.chartInk}
                    strokeWidth={chart.strokeLight}
                  />
                  <ChartText
                    x={x0 - 6}
                    y={py(i * every) + 4}
                    fontSize={chart.tiny}
                    fill={c.chartMuted}
                    textAnchor="end"
                  >
                    {`${i * every} L`}
                  </ChartText>
                </G>
              ))}
              {/* Rim with a pouring lip, walls and a thick base. */}
              <Path
                d={`M ${x0 - 8} ${top - 8} Q ${x0 - 2} ${top - 4} ${x0} ${top + 4} L ${x0} ${bottom - 4} Q ${x0} ${bottom} ${x0 + 4} ${bottom} L ${x0 + jw - 4} ${bottom} Q ${x0 + jw} ${bottom} ${x0 + jw} ${bottom - 4} L ${x0 + jw} ${top}`}
                stroke={c.glassEdge}
                strokeWidth={chart.strokeHeavy}
                strokeLinejoin="round"
                strokeLinecap="round"
                fill="none"
              />
              <Line
                x1={x0 - 8}
                y1={py(total)}
                x2={x0 + jw + 8}
                y2={py(total)}
                stroke={c.chartInk}
                strokeWidth={chart.stroke}
                strokeDasharray="4 3"
              />
            </Svg>
          );
        }}
      </Canvas>
      <Caption>{`${spec.parts.map((id) => rep.value(id)).join(' + ')} = ${rep.value(spec.total)} in all`}</Caption>
      <Steppers
        calc={calc}
        items={spec.parts.map((id) => ({
          var: id,
          steps: [1],
          pin: spec.parts.filter((x) => x !== id),
        }))}
      />
    </View>
  );
}

import { View } from 'react-native';
import Svg, { Circle, Defs, Ellipse, G, Line, Path, Rect } from 'react-native-svg';

import type { Representation } from '@/data/modules';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, ChartText, useRep, Caption } from './common';
import { TopLight, url, usePaintIds } from './paint';
import { Steppers } from './Steppers';

type Spec = Extract<Representation, { kind: 'rockLayers' }>;

/**
 * A column of rock layers holding two fossils. Each fossil sits in the layer below the
 * number of layers above it, so the deeper one is the older one.
 */
export function RockLayers({ spec, calc }: { spec: Spec; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  const [first, second] = spec.fossils;
  const above = (id: string) =>
    rep.known(id) ? Math.max(0, Math.min(12, Math.round(rep.shown(id)))) : undefined;
  const a = above(first);
  const b = above(second);
  const n = Math.max(a ?? 0, b ?? 0) + 1;
  // Each layer its own rock, so neighbors part at a glance: sandstone, shale, limestone, …
  const fills = [c.rock1, c.rock2, c.rock3, c.rock4, c.rock5, c.rock6];
  const paint = usePaintIds('light');

  return (
    <View>
      <Canvas aspect={0.5}>
        {({ w, h }) => {
          const left = 24;
          const width = w - 130;
          const top = 18;
          const bottom = h - 10;
          const layerH = (bottom - top) / n;
          const fossil = (id: string, layers: number | undefined, shell: boolean) => {
            if (layers === undefined) return null;
            const cx = left + width * (shell ? 0.68 : 0.32);
            const cy = top + layers * layerH + layerH / 2;
            const r = Math.min(22, layerH / 2 - 3);
            return (
              <>
                {shell ? (
                  <>
                    <Ellipse
                      cx={cx}
                      cy={cy + r / 4}
                      rx={r}
                      ry={r / 2}
                      fill={c.paper}
                      stroke={c.chartInk}
                      strokeWidth={chart.stroke}
                    />
                    {/* The shell's ribs fanning out from its hinge. */}
                    {[-0.6, -0.3, 0, 0.3, 0.6].map((t) => (
                      <Line
                        key={t}
                        x1={cx}
                        y1={cy + r * 0.7}
                        x2={cx + t * r * 1.3}
                        y2={cy - r / 5}
                        stroke={c.chartInk}
                        strokeWidth={1}
                      />
                    ))}
                  </>
                ) : (
                  <>
                    <Ellipse
                      cx={cx}
                      cy={cy}
                      rx={r}
                      ry={r / 2}
                      fill={c.paper}
                      stroke={c.chartInk}
                      strokeWidth={chart.stroke}
                    />
                    <Path
                      d={`M ${cx + r} ${cy} l ${r / 2} ${-r / 2} l 0 ${r} z`}
                      fill={c.paper}
                      stroke={c.chartInk}
                      strokeWidth={chart.stroke}
                    />
                    {/* Backbone, ribs and an eye: a fish turned to stone. */}
                    <Line x1={cx - r * 0.6} y1={cy} x2={cx + r} y2={cy} stroke={c.chartInk} />
                    {[-0.3, 0, 0.3, 0.6].map((t) => (
                      <Line
                        key={t}
                        x1={cx + t * r}
                        y1={cy - r * 0.38}
                        x2={cx + t * r}
                        y2={cy + r * 0.38}
                        stroke={c.chartInk}
                        strokeWidth={1}
                      />
                    ))}
                    <Circle cx={cx - r * 0.7} cy={cy - r * 0.12} r={1.6} fill={c.chartInk} />
                  </>
                )}
                <ChartText
                  x={left + width + 8}
                  // Both fossils in one layer: the names stack instead of running together.
                  y={cy + 4 + (a === b ? (shell ? 7 : -7) : 0)}
                  fontSize={chart.small}
                  fontWeight="700"
                  fill={c.chartInk}
                >
                  {rep.variable(id).name.replace(/^Layers above the /, '')}
                </ChartText>
              </>
            );
          };
          return (
            <Svg width={w} height={h}>
              <Defs>
                <TopLight id={paint.light} strength={0.6} />
              </Defs>
              {Array.from({ length: n }, (_, i) => {
                const y = top + i * layerH;
                // A few grains, flecks or joints so each layer looks like rock, not paint.
                const marks = Array.from({ length: Math.floor(width / 26) }, (_, k) => {
                  const x = left + 10 + k * 26 + ((i * 11) % 13);
                  const my = y + layerH * (0.3 + ((k * 7 + i * 3) % 5) * 0.1);
                  return i % 3 === 0 ? (
                    <Circle key={k} cx={x} cy={my} r={1.1} fill={c.chartInk} opacity={0.3} />
                  ) : i % 3 === 1 ? (
                    <Line
                      key={k}
                      x1={x}
                      y1={my}
                      x2={x + 9}
                      y2={my}
                      stroke={c.chartInk}
                      strokeOpacity={0.25}
                    />
                  ) : (
                    <Line
                      key={k}
                      x1={x}
                      y1={y + 2}
                      x2={x}
                      y2={y + layerH - 2}
                      stroke={c.chartInk}
                      strokeOpacity={0.15}
                    />
                  );
                });
                return (
                  <G key={`l${i}`}>
                    <Rect
                      x={left}
                      y={y}
                      width={width}
                      height={layerH}
                      fill={fills[i % fills.length]}
                      stroke={c.chartInk}
                      strokeWidth={chart.strokeLight}
                    />
                    {layerH > 10 ? marks : null}
                    <Rect x={left} y={y} width={width} height={layerH} fill={url(paint.light)} />
                  </G>
                );
              })}
              {/* Grass on the surface. */}
              <Rect x={left} y={top - 5} width={width} height={5} fill={c.lifeDeep} />
              {fossil(first, a, false)}
              {fossil(second, b, true)}
            </Svg>
          );
        }}
      </Canvas>
      <Caption>
        {(() => {
          const names = `${rep.named(first)}. ${rep.named(second)}.`;
          if (a === undefined || b === undefined) return names;
          if (a === b) return `${names} Same layer: about the same age.`;
          const [deep, high] = a > b ? [first, second] : [second, first];
          const short = (id: string) => rep.variable(id).name.replace(/^Layers above the /, '');
          return `${names} The ${short(deep)} is ${rep.value(spec.difference)} layers deeper than the ${short(high)}, so it is older.`;
        })()}
      </Caption>
      <Steppers
        calc={calc}
        items={[
          { var: first, steps: [1], pin: [second] },
          { var: second, steps: [1], pin: [first] },
        ]}
      />
    </View>
  );
}

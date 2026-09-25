import { View } from 'react-native';
import Svg, { Ellipse, Path, Rect } from 'react-native-svg';

import type { Representation } from '@/data/modules';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, ChartText, useRep, Caption } from './common';
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
  const fills = [c.chartFill, c.chartSurface];

  return (
    <View>
      <Canvas aspect={0.5}>
        {({ w, h }) => {
          const left = 24;
          const width = w - 130;
          const top = 14;
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
                      fill={c.chartFill}
                      stroke={c.chartInk}
                      strokeWidth={chart.stroke}
                    />
                    <Path
                      d={`M ${cx - r} ${cy + r / 4} Q ${cx} ${cy - r / 2} ${cx + r} ${cy + r / 4}`}
                      stroke={c.chartInk}
                      strokeWidth={chart.strokeLight}
                      fill="none"
                    />
                  </>
                ) : (
                  <>
                    <Ellipse
                      cx={cx}
                      cy={cy}
                      rx={r}
                      ry={r / 2}
                      fill={c.chartFill}
                      stroke={c.chartInk}
                      strokeWidth={chart.stroke}
                    />
                    <Path
                      d={`M ${cx + r} ${cy} l ${r / 2} ${-r / 2} l 0 ${r} z`}
                      fill={c.chartFill}
                      stroke={c.chartInk}
                      strokeWidth={chart.stroke}
                    />
                  </>
                )}
                <ChartText
                  x={left + width + 8}
                  y={cy + 4}
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
              {Array.from({ length: n }, (_, i) => (
                <Rect
                  key={`l${i}`}
                  x={left}
                  y={top + i * layerH}
                  width={width}
                  height={layerH}
                  fill={fills[i % 2]}
                  stroke={c.chartInk}
                  strokeWidth={chart.strokeLight}
                />
              ))}
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

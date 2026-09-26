import { View } from 'react-native';
import Svg, { Circle, Ellipse, G, Line } from 'react-native-svg';

import type { Representation } from '@/data/modules';
import { formatNumber } from '@/engine/format';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, Caption, ChartText, useRep } from './common';
import { Steppers } from './Steppers';

type Spec = Extract<Representation, { kind: 'fieldOfView' }>;

/**
 * The circle seen through a microscope eyepiece, its width labelled, with `across` cells laid
 * end to end along the middle; one cell is outlined with its length. Past 30 cells the row is
 * drawn as 30 and the count is written.
 */
export function FieldOfView({ spec, calc }: { spec: Spec; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  const n = Math.max(1, Math.round(rep.shown(spec.across)));
  const drawn = Math.min(n, 30);
  const known = rep.known(spec.field) && rep.known(spec.across);
  const unit = rep.unit(spec.field) ?? '';

  return (
    <View>
      <Canvas aspect={0.8}>
        {({ w, h }) => {
          const r = Math.min(w, h) / 2 - 26;
          const cx = w / 2;
          const cy = h / 2 + 6;
          const cell = (2 * r) / drawn;
          return (
            <Svg width={w} height={h} opacity={known ? 1 : 0.4}>
              <Circle
                cx={cx}
                cy={cy}
                r={r}
                fill={c.chartSurface}
                stroke={c.chartInk}
                strokeWidth={chart.strokeHeavy}
              />
              {Array.from({ length: drawn }, (_, i) => {
                const x = cx - r + i * cell;
                const hh = Math.min(cell * 0.7, 30);
                return (
                  <G key={i}>
                    <Ellipse
                      cx={x + cell / 2}
                      cy={cy}
                      rx={cell / 2 - 0.5}
                      ry={hh / 2}
                      fill={i === 0 ? c.chartHighlight : c.chartFill}
                      fillOpacity={i === 0 ? 0.35 : 1}
                      stroke={c.chartInk}
                      strokeWidth={1}
                    />
                    {cell > 10 ? (
                      <Circle
                        cx={x + cell / 2}
                        cy={cy}
                        r={Math.min(3, cell / 6)}
                        fill={c.chartMuted}
                      />
                    ) : null}
                  </G>
                );
              })}
              {/* The width of the circle, across the top. */}
              <Line x1={cx - r} y1={16} x2={cx + r} y2={16} stroke={c.chartInk} />
              <Line x1={cx - r} y1={10} x2={cx - r} y2={22} stroke={c.chartInk} />
              <Line x1={cx + r} y1={10} x2={cx + r} y2={22} stroke={c.chartInk} />
              <ChartText x={cx} y={11} fontSize={chart.label} fill={c.chartInk} textAnchor="middle">
                {`${rep.value(spec.field)} across`}
              </ChartText>
              <ChartText
                x={cx - r + cell / 2}
                y={cy + Math.min(cell * 0.35, 15) + 18}
                fontSize={chart.small}
                fontWeight="700"
                fill={c.chartHighlight}
                textAnchor={cell > 60 ? 'middle' : 'start'}
              >
                {spec.size && rep.known(spec.size)
                  ? `one cell: ${rep.value(spec.size)}`
                  : 'one cell'}
              </ChartText>
            </Svg>
          );
        }}
      </Canvas>
      <Caption>
        {known
          ? `${n} cells fill ${formatNumber(rep.shown(spec.field))}${unit ? ` ${unit}` : ''} end to end${n > 30 ? ' (30 drawn)' : ''}.`
          : 'Type the field of view and the cells across.'}
      </Caption>
      <Steppers calc={calc} items={[{ var: spec.across, steps: [1], pin: [spec.field] }]} />
    </View>
  );
}

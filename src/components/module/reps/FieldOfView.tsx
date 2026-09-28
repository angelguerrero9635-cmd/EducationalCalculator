import { View } from 'react-native';
import Svg, {
  Circle,
  ClipPath,
  Defs,
  Ellipse,
  G,
  Line,
  Path,
  RadialGradient,
  Rect,
  Stop,
} from 'react-native-svg';

import type { Representation } from '@/data/modules';
import { formatNumber } from '@/engine/format';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, Caption, ChartText, useRep } from './common';
import { Metal, url, usePaintIds } from './paint';
import { Steppers } from './Steppers';

type Spec = Extract<Representation, { kind: 'fieldOfView' }>;

/**
 * The circle seen through a microscope eyepiece (a black metal tube), its width on a dimension
 * line, with `across` onion-skin cells laid end to end along the middle and the tissue fainter
 * around them; the first cell is outlined, bracketed and labelled with its length. Past 30 cells the row is
 * drawn at true size up to 100 (thin slivers past that), so one cell is always 1/n of the field.
 */
export function FieldOfView({ spec, calc }: { spec: Spec; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  const paint = usePaintIds('light', 'cell', 'ring', 'clip');
  const n = Math.max(1, Math.round(rep.shown(spec.across)));
  // Cells are drawn at their true size (the field ÷ n) up to 100 of them.
  const drawn = Math.min(n, 100);
  const known = rep.known(spec.field) && rep.known(spec.across);
  const unit = rep.unit(spec.field) ?? '';

  return (
    <View>
      <Canvas aspect={0.86}>
        {({ w, h }) => {
          const ring = 12;
          const top = 46;
          const R = Math.min(w / 2 - ring - 12, (h - top - 2 * ring - 6) / 2);
          const cx = w / 2;
          const cy = top + ring + R;
          const cell = (2 * R) / n;
          // Onion-skin cells: long boxes, the middle row a third of the field tall at most.
          const hh = Math.max(10, Math.min(0.3 * 2 * R, cell * 0.6));
          const rowGap = hh + 3;
          const one = (x: number, y: number, k: string, lit: boolean, faint: boolean) => (
            <G key={k} opacity={faint ? 0.4 : 1}>
              <Rect
                x={x + 0.6}
                y={y - hh / 2}
                width={Math.max(0.8, cell - 1.2)}
                height={hh}
                rx={Math.min(4, cell / 5)}
                fill={url(paint.cell)}
                stroke={lit ? c.chartHighlight : c.lifeDeep}
                strokeWidth={lit ? 2.5 : cell > 6 ? 1.4 : 0.6}
              />
              {cell > 12 ? (
                <>
                  <Ellipse
                    cx={x + cell * (0.35 + ((k.length * 7) % 5) * 0.06)}
                    cy={y + hh * 0.08}
                    rx={Math.min(6, cell / 7)}
                    ry={Math.min(5, hh / 5)}
                    fill={c.lifeDeep}
                    fillOpacity={0.75}
                  />
                  <Circle
                    cx={x + cell * (0.35 + ((k.length * 7) % 5) * 0.06) + 1}
                    cy={y + hh * 0.08 - 1}
                    r={Math.min(1.6, cell / 20)}
                    fill={c.shade}
                    fillOpacity={0.5}
                  />
                </>
              ) : null}
            </G>
          );
          // Label under the measured cell, kept inside the lit circle.
          const labelText =
            spec.size && rep.known(spec.size) ? `1 cell = ${rep.value(spec.size)}` : '1 cell';
          const by = cy + hh / 2 + 6;
          const ly = by + 20;
          const edge = cx - Math.sqrt(Math.max(0, R * R - (ly - cy + 4) ** 2)) + 6;
          const tw = labelText.length * chart.value * 0.56;
          const lx = Math.max(edge, Math.min(cx - R + cell / 2 - tw / 2, cx + R - tw));
          return (
            <Svg width={w} height={h} opacity={known ? 1 : 0.4}>
              <Defs>
                {/* Lamp light through the slide: even, dimming only at the very edge. */}
                <RadialGradient id={paint.light} cx="0.5" cy="0.5" r="0.5">
                  <Stop offset="0" stopColor={c.slideLight} />
                  <Stop offset="0.95" stopColor={c.slideLight} />
                  <Stop offset="1" stopColor={c.shade} stopOpacity={0.22} />
                </RadialGradient>
                <RadialGradient id={paint.cell} cx="0.45" cy="0.4" r="0.7">
                  <Stop offset="0" stopColor={c.life} stopOpacity={0.18} />
                  <Stop offset="1" stopColor={c.life} stopOpacity={0.55} />
                </RadialGradient>
                <Metal id={paint.ring} light={c.metalDark} dark={c.rubber} />
                <ClipPath id={paint.clip}>
                  <Circle cx={cx} cy={cy} r={R} />
                </ClipPath>
              </Defs>
              {/* The eyepiece: a black metal tube around the lit circle. */}
              <Circle cx={cx} cy={cy + 3} r={R + ring} fill={c.shadow} />
              <Circle cx={cx} cy={cy} r={R + ring} fill={url(paint.ring)} />
              <Circle cx={cx} cy={cy} r={R} fill={url(paint.light)} />
              <G clipPath={url(paint.clip)}>
                {/* The tissue around the counted row, fainter, each row set half a cell over. */}
                {cell >= 8
                  ? [-4, -3, -2, -1, 1, 2, 3, 4].flatMap((row) =>
                      Array.from({ length: drawn + 1 }, (_, i) =>
                        one(
                          cx - R + (i - (row % 2 ? 0.5 : 0)) * cell,
                          cy + row * rowGap,
                          `t${row}-${i}`,
                          false,
                          true,
                        ),
                      ),
                    )
                  : null}
                {Array.from({ length: drawn }, (_, i) =>
                  i === 0 ? null : one(cx - R + i * cell, cy, `c${i}`, false, false),
                )}
                {one(cx - R, cy, 'c0', true, false)}
              </G>
              <Circle
                cx={cx}
                cy={cy}
                r={R}
                fill="none"
                stroke={c.shade}
                strokeOpacity={0.7}
                strokeWidth={1.5}
              />
              {/* The measured cell's length: a bracket under it and its label. */}
              <Path
                d={`M ${cx - R + 1} ${by - 4} V ${by} H ${cx - R + cell - 1} V ${by - 4}`}
                fill="none"
                stroke={c.chartHighlight}
                strokeWidth={chart.stroke}
              />
              <Rect
                x={lx - 4}
                y={ly - chart.value - 1}
                width={tw + 8}
                height={chart.value + 7}
                rx={4}
                fill={c.card}
                fillOpacity={0.9}
              />
              <ChartText
                x={lx}
                y={ly}
                fontSize={chart.value}
                fontWeight="700"
                fill={c.chartHighlight}
              >
                {labelText}
              </ChartText>
              {/* The width of the lit circle: a dimension line with end ticks. */}
              <Line
                x1={cx - R}
                y1={top - 12}
                x2={cx - R}
                y2={cy}
                stroke={c.chartInk}
                strokeOpacity={0.35}
                strokeDasharray={chart.dashFine}
              />
              <Line
                x1={cx + R}
                y1={top - 12}
                x2={cx + R}
                y2={cy}
                stroke={c.chartInk}
                strokeOpacity={0.35}
                strokeDasharray={chart.dashFine}
              />
              <Line
                x1={cx - R}
                y1={top - 12}
                x2={cx + R}
                y2={top - 12}
                stroke={c.chartInk}
                strokeWidth={chart.stroke}
              />
              <Line
                x1={cx - R}
                y1={top - 19}
                x2={cx - R}
                y2={top - 5}
                stroke={c.chartInk}
                strokeWidth={chart.stroke}
              />
              <Line
                x1={cx + R}
                y1={top - 19}
                x2={cx + R}
                y2={top - 5}
                stroke={c.chartInk}
                strokeWidth={chart.stroke}
              />
              <ChartText
                x={cx}
                y={top - 19}
                fontSize={chart.value}
                fontWeight="700"
                textAnchor="middle"
              >
                {`${rep.value(spec.field)} across`}
              </ChartText>
            </Svg>
          );
        }}
      </Canvas>
      <Caption>
        {known
          ? `${n} ${n === 1 ? 'cell fills' : 'cells fill'} ${formatNumber(rep.shown(spec.field))}${unit ? ` ${unit}` : ''} end to end${n > 100 ? ' (100 drawn)' : ''}.`
          : 'Type the field of view and the cells across.'}
      </Caption>
      <Steppers calc={calc} items={[{ var: spec.across, steps: [1], pin: [spec.field] }]} />
    </View>
  );
}

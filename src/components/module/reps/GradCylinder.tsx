import { useRef } from 'react';
import { View } from 'react-native';
import Svg, { Defs, Ellipse, Line, Path, Rect } from 'react-native-svg';

import type { Representation } from '@/data/modules';
import { formatNumber } from '@/engine/format';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, Caption, ChartText, DragHandle, niceCeil, useFrozen, useRep } from './common';
import { Ball, Deepen, Glass, Sheen, url, usePaintIds } from './paint';
import { Steppers } from './Steppers';

type Spec = Extract<Representation, { kind: 'gradCylinder' }>;

/**
 * A graduated cylinder on a hexagonal foot, with mL marks: the water level before as a ghosted
 * dashed line, the level after as the bottom of the meniscus, a stone sunk at the bottom, and the rise bracketed with the
 * object's volume. The scale grows past `max` to fit the water.
 */
export function GradCylinder({ spec, calc }: { spec: Spec; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  const before = Math.max(0, rep.shown(spec.before));
  const after = Math.max(0, rep.shown(spec.after));
  const known = rep.known(spec.before) && rep.known(spec.after);
  // The scale holds still while a level is dragged.
  const fit = useFrozen(Math.max(spec.max, niceCeil(after * 1.1)));
  const top = fit.value;
  const start = useRef({ before: 0, after: 0 });
  const ids = usePaintIds('glass', 'sheen', 'water', 'rock');
  const step = top <= 100 ? 10 : top <= 250 ? 25 : top <= 500 ? 50 : 100;

  return (
    <View>
      <Canvas aspect={0.9}>
        {({ w, h }) => {
          const tubeW = Math.min(90, w * 0.28);
          const x0 = w / 2 - tubeW / 2;
          const y0 = h - 22; // the bottom of the tube
          const y1 = 22; // the top mark
          const Y = (ml: number) => y0 - (ml / top) * (y0 - y1);
          const marks = Array.from({ length: Math.floor(top / step) + 1 }, (_, i) => i * step);
          // The stone: its size follows the rise, and it always lies fully under the water.
          const rock = Math.min(
            tubeW * 0.32,
            Math.max(8, (y0 - Y(after)) * 0.42),
            Math.max(10, (y0 - Y(Math.max(0, after - before))) * 0.8),
          );
          const perMl = (y0 - y1) / top;
          const drag = (id: string, other: string, key: 'before' | 'after') => (
            <DragHandle
              key={id}
              testID={`drag-${id}`}
              x={x0 + tubeW + 2}
              y={Y(key === 'before' ? before : after)}
              label={rep.variable(id).name}
              onStart={() => {
                start.current = { before, after };
                fit.freeze();
              }}
              onEnd={fit.release}
              onMove={(_, dy) =>
                calc.set(
                  {
                    ...rep.pin([other]),
                    // The level after stays above the level before (the object takes up room).
                    [id]: rep.snapTo(
                      id,
                      key === 'after'
                        ? Math.max(start.current.before + 1, start.current.after - dy / perMl)
                        : Math.min(
                            start.current.after - 1,
                            Math.max(0, start.current.before - dy / perMl),
                          ),
                    ),
                  },
                  rep.slide(id),
                )
              }
            />
          );
          return (
            <>
              <Svg width={w} height={h} opacity={known ? 1 : 0.4}>
                <Defs>
                  <Glass id={ids.glass} />
                  <Sheen id={ids.sheen} strength={0.8} />
                  <Deepen id={ids.water} from={c.waterTop} to={c.water} />
                  <Ball id={ids.rock} color={c.rock5} />
                </Defs>
                {/* The hexagonal foot the cylinder stands on, seen from a little above. */}
                <Ellipse cx={w / 2 + 3} cy={y0 + 14} rx={tubeW * 0.95} ry={5} fill={c.shadow} />
                {(() => {
                  const fx = w / 2;
                  const R = tubeW * 0.8;
                  const k = 0.28;
                  const pt = (a: number, dy: number) =>
                    `${fx + R * Math.cos(a)} ${y0 + 2 + dy + R * k * Math.sin(a)}`;
                  const angles = [0, 1, 2, 3, 4, 5].map((i) => (i * Math.PI) / 3 + Math.PI / 6);
                  const topFace = `M ${angles.map((a) => pt(a, 0)).join(' L ')} Z`;
                  // The front three sides, 7 px deep.
                  const side = `M ${pt(angles[5]! - 2 * Math.PI, 0)} L ${pt(0 + Math.PI / 6, 0)} L ${pt(Math.PI / 2, 0)} L ${pt((5 * Math.PI) / 6, 0)} L ${pt(Math.PI + Math.PI / 6, 0)} L ${pt(Math.PI + Math.PI / 6, 7)} L ${pt((5 * Math.PI) / 6, 7)} L ${pt(Math.PI / 2, 7)} L ${pt(Math.PI / 6, 7)} L ${pt(-Math.PI / 6, 7)} Z`;
                  return (
                    <>
                      <Path
                        d={side}
                        fill={c.glassEdge}
                        fillOpacity={0.55}
                        stroke={c.glassEdge}
                        strokeLinejoin="round"
                      />
                      <Path
                        d={topFace}
                        fill={url(ids.glass)}
                        stroke={c.glassEdge}
                        strokeWidth={chart.strokeLight}
                        strokeLinejoin="round"
                      />
                    </>
                  );
                })()}
                <Rect x={x0} y={y1 - 8} width={tubeW} height={y0 - y1 + 8} fill={url(ids.glass)} />
                <Path
                  d={`M ${x0} ${Y(after) - 5} Q ${x0 + tubeW / 2} ${Y(after) + 5} ${x0 + tubeW} ${Y(after) - 5} L ${x0 + tubeW} ${y0} L ${x0} ${y0} Z`}
                  fill={url(ids.water)}
                  fillOpacity={0.85}
                />
                {/* The stone at the bottom, under the water, with its contact shadow. */}
                <Ellipse cx={w / 2 + 2} cy={y0 - 1.5} rx={rock * 1.05} ry={2.5} fill={c.shadow} />
                <Path
                  d={`M ${w / 2 - rock} ${y0 - 1} L ${w / 2 - rock * 1.02} ${y0 - rock * 0.45} L ${w / 2 - rock * 0.7} ${y0 - rock * 0.95} L ${w / 2 - rock * 0.1} ${y0 - rock * 1.12} L ${w / 2 + rock * 0.55} ${y0 - rock * 0.98} L ${w / 2 + rock * 0.98} ${y0 - rock * 0.55} L ${w / 2 + rock} ${y0 - 1} Z`}
                  fill={url(ids.rock)}
                  stroke={c.chartInk}
                  strokeWidth={1}
                  strokeLinejoin="round"
                />
                {[
                  [-0.5, 0.35],
                  [0.1, 0.7],
                  [0.45, 0.4],
                  [-0.2, 0.2],
                  [0.65, 0.2],
                  [-0.6, 0.65],
                ].map(([u, v]) => (
                  <Ellipse
                    key={`${u}${v}`}
                    cx={w / 2 + u! * rock}
                    cy={y0 - v! * rock}
                    rx={Math.max(1, rock * 0.07)}
                    ry={Math.max(0.7, rock * 0.045)}
                    fill={c.chartInk}
                    fillOpacity={0.3}
                  />
                ))}
                {/* The water's surface curves down in the middle (the meniscus); read its bottom. */}
                <Path
                  d={`M ${x0} ${Y(after) - 5} Q ${x0 + tubeW / 2} ${Y(after) + 5} ${x0 + tubeW} ${Y(after) - 5}`}
                  stroke={c.waterDeep}
                  strokeWidth={1.5}
                  fill="none"
                />
                <Rect x={x0} y={y1 - 8} width={tubeW} height={y0 - y1 + 8} fill={url(ids.sheen)} />
                {/* The glass wall, with a flared rim and a pour lip on the left. */}
                <Path
                  d={`M ${x0 - 9} ${y1 - 15} Q ${x0 - 2} ${y1 - 13} ${x0} ${y1 - 4} L ${x0} ${y0} L ${x0 + tubeW} ${y0} L ${x0 + tubeW} ${y1 - 6} Q ${x0 + tubeW} ${y1 - 9} ${x0 + tubeW + 3} ${y1 - 10}`}
                  stroke={c.glassEdge}
                  strokeWidth={chart.strokeHeavy}
                  strokeLinejoin="round"
                  strokeLinecap="round"
                  fill="none"
                />
                {marks.map((m) => (
                  <Line
                    key={m}
                    x1={x0}
                    y1={Y(m)}
                    x2={x0 + (m % (step * 2) === 0 ? 24 : 12)}
                    y2={Y(m)}
                    stroke={c.chartInk}
                    strokeWidth={1}
                  />
                ))}
                {marks
                  .filter((m) => m % (step * 2) === 0)
                  .map((m) => (
                    <ChartText
                      key={`l${m}`}
                      x={x0 - 6}
                      y={Y(m) + 4}
                      fontSize={chart.label}
                      fill={c.chartInk}
                      textAnchor="end"
                    >
                      {formatNumber(m)}
                    </ChartText>
                  ))}
                <Line
                  x1={x0 - 4}
                  y1={Y(before)}
                  x2={x0 + tubeW + 4}
                  y2={Y(before)}
                  stroke={c.waterDeep}
                  strokeWidth={chart.stroke}
                  strokeDasharray={chart.dash}
                />
                <Line
                  x1={x0}
                  y1={Y(after)}
                  x2={x0 + tubeW}
                  y2={Y(after)}
                  stroke={c.chartHighlight}
                  strokeWidth={chart.stroke}
                />
                <ChartText
                  x={x0 + tubeW + 18}
                  y={Y(before) + (Y(before) - Y(after) < 16 ? 12 : 4)}
                  fontSize={chart.label}
                  fill={c.chartInk}
                >
                  {`before ${rep.known(spec.before) ? formatNumber(before) : '?'} mL`}
                </ChartText>
                <ChartText
                  x={x0 + tubeW + 18}
                  y={Y(after) - 4}
                  fontSize={chart.label}
                  fontWeight="700"
                  fill={c.chartHighlight}
                >
                  {`after ${rep.known(spec.after) ? formatNumber(after) : '?'} mL`}
                </ChartText>
                {known && after > before ? (
                  <>
                    <Path
                      d={`M ${x0 - 44} ${Y(before)} l -7 0 L ${x0 - 51} ${Y(after)} l 7 0`}
                      stroke={c.chartHighlight}
                      strokeWidth={chart.stroke}
                      fill="none"
                    />
                    <ChartText
                      x={x0 - 56}
                      y={(Y(before) + Y(after)) / 2 + 5}
                      fontSize={chart.emphasis}
                      fontWeight="700"
                      fill={c.chartHighlight}
                      textAnchor="end"
                    >
                      {spec.volume && rep.known(spec.volume)
                        ? rep.value(spec.volume)
                        : `${formatNumber(Number((after - before).toFixed(3)))} cm³`}
                    </ChartText>
                  </>
                ) : null}
              </Svg>
              {/* Drag the water's surface, or the level before. */}
              {drag(spec.after, spec.before, 'after')}
              {drag(spec.before, spec.after, 'before')}
            </>
          );
        }}
      </Canvas>
      <Caption>
        {known
          ? after >= before
            ? `The water rose from ${formatNumber(before)} mL to ${formatNumber(after)} mL: the object takes up ${formatNumber(Number((after - before).toFixed(3)))} cm³.`
            : 'The level after can’t be below the level before.'
          : 'Type the water level before and after.'}
      </Caption>
      <Steppers
        calc={calc}
        items={[
          { var: spec.before, steps: [1, 10], pin: [spec.after] },
          { var: spec.after, steps: [1, 10], pin: [spec.before] },
        ]}
      />
    </View>
  );
}

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
 * A graduated cylinder with mL marks: the water level before as a dashed line, the level
 * after as the water's surface, the object sunk at the bottom, and the rise bracketed with the
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
          const rock = Math.min(
            tubeW * 0.35,
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
                  <Ball id={ids.rock} color={c.metalDark} />
                </Defs>
                {/* The foot the cylinder stands on, with its shadow. */}
                <Ellipse cx={w / 2} cy={y0 + 12} rx={tubeW * 0.95} ry={5} fill={c.shadow} />
                <Path
                  d={`M ${x0 - tubeW * 0.35} ${y0 + 10} L ${x0 - tubeW * 0.2} ${y0} L ${x0 + tubeW * 1.2} ${y0} L ${x0 + tubeW * 1.35} ${y0 + 10} Z`}
                  fill={c.glass}
                  stroke={c.glassEdge}
                  strokeWidth={chart.strokeLight}
                  strokeLinejoin="round"
                />
                <Rect x={x0} y={y1 - 8} width={tubeW} height={y0 - y1 + 8} fill={url(ids.glass)} />
                <Rect
                  x={x0}
                  y={Y(after)}
                  width={tubeW}
                  height={y0 - Y(after)}
                  fill={url(ids.water)}
                  fillOpacity={0.85}
                />
                {/* The object at the bottom, under the water. */}
                <Path
                  d={`M ${x0 + tubeW / 2 - rock} ${y0} q ${rock * 0.2} ${-rock} ${rock} ${-rock} q ${rock * 0.9} 0 ${rock} ${rock} z`}
                  fill={url(ids.rock)}
                  stroke={c.chartInk}
                  strokeWidth={1}
                />
                {/* The water's surface curves down in the middle (the meniscus); read its bottom. */}
                <Path
                  d={`M ${x0} ${Y(after) - 3} Q ${x0 + tubeW / 2} ${Y(after) + 3} ${x0 + tubeW} ${Y(after) - 3}`}
                  stroke={c.waterDeep}
                  strokeWidth={1}
                  fill={c.waterTop}
                  fillOpacity={0.6}
                />
                <Rect x={x0} y={y1 - 8} width={tubeW} height={y0 - y1 + 8} fill={url(ids.sheen)} />
                <Path
                  d={`M ${x0 - 5} ${y1 - 12} Q ${x0} ${y1 - 10} ${x0} ${y1 - 4} L ${x0} ${y0} L ${x0 + tubeW} ${y0} L ${x0 + tubeW} ${y1 - 8}`}
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
                    x2={x0 + (m % (step * 2) === 0 ? 16 : 9)}
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
                      fontSize={chart.tiny}
                      fill={c.chartMuted}
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
                  stroke={c.chartInk}
                  strokeWidth={chart.strokeLight}
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
                  y={Y(before) + 4}
                  fontSize={chart.small}
                  fill={c.chartInk}
                >
                  {`before ${rep.known(spec.before) ? formatNumber(before) : '?'} mL`}
                </ChartText>
                <ChartText
                  x={x0 + tubeW + 18}
                  y={Y(after) - 4}
                  fontSize={chart.small}
                  fill={c.chartHighlight}
                >
                  {`after ${rep.known(spec.after) ? formatNumber(after) : '?'} mL`}
                </ChartText>
                {known && after > before ? (
                  <>
                    <Path
                      d={`M ${x0 - 30} ${Y(before)} l -6 0 L ${x0 - 36} ${Y(after)} l 6 0`}
                      stroke={c.chartHighlight}
                      strokeWidth={chart.stroke}
                      fill="none"
                    />
                    <ChartText
                      x={x0 - 42}
                      y={(Y(before) + Y(after)) / 2 + 4}
                      fontSize={chart.label}
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

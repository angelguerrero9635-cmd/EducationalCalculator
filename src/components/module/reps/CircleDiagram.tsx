import { useRef } from 'react';
import Svg, { Circle, Line } from 'react-native-svg';

import type { Representation } from '@/data/modules';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, ChartText, DragHandle, useFrozen, useRep } from './common';

type Spec = Extract<Representation, { kind: 'circle' }>;

/** Circle with its radius and diameter drawn; drag the radius end to resize. */
export function CircleDiagram({ spec, calc }: { spec: Spec; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  const handleStart = useRef({ x: 0, y: 0 });
  const r = rep.val(spec.radius);
  const faded = !rep.known(spec.radius);
  const fit = useFrozen(Math.max(spec.extent * rep.factor(spec.radius), r));

  return (
    <Canvas aspect={0.9}>
      {({ w, h }) => {
        const cx = w / 2;
        const cy = h / 2 + 8;
        const scale = (Math.min(w, h) / 2 - 40) / fit.value;
        const R = r * scale;
        const angle = -Math.PI / 4;
        const hx = cx + R * Math.cos(angle);
        const hy = cy + R * Math.sin(angle);
        return (
          <>
            <Svg width={w} height={h}>
              <Circle
                cx={cx}
                cy={cy}
                r={R}
                fill={c.chartFill}
                stroke={c.chartInk}
                strokeWidth={chart.stroke}
                opacity={faded ? 0.35 : 1}
              />
              {spec.diameter ? (
                <Line
                  x1={cx - R}
                  y1={cy}
                  x2={cx + R}
                  y2={cy}
                  stroke={c.chartMuted}
                  strokeDasharray={chart.dash}
                />
              ) : null}
              <Line
                x1={cx}
                y1={cy}
                x2={hx}
                y2={hy}
                stroke={c.chartInk}
                strokeWidth={chart.stroke}
              />
              <Circle cx={cx} cy={cy} r={3} fill={c.chartInk} />
              <ChartText x={hx + 14} y={hy - 8} fontSize={chart.value}>
                {rep.label(spec.radius)}
              </ChartText>
              {spec.diameter ? (
                <ChartText x={cx} y={cy + 18} fill={c.chartMuted} textAnchor="middle">
                  {rep.label(spec.diameter)}
                </ChartText>
              ) : null}
              {spec.area ? (
                <ChartText
                  x={cx}
                  y={cy + R / 2 + 10}
                  fontSize={chart.value}
                  fontWeight="700"
                  textAnchor="middle"
                >
                  {rep.label(spec.area)}
                </ChartText>
              ) : null}
              {spec.circumference ? (
                <ChartText
                  x={cx}
                  y={Math.max(16, cy - R - 12)}
                  fontSize={chart.value}
                  textAnchor="middle"
                >
                  {`${rep.label(spec.circumference)} (all the way around)`}
                </ChartText>
              ) : null}
            </Svg>
            <DragHandle
              testID="drag-radius"
              x={hx}
              y={hy}
              label={rep.variable(spec.radius).name}
              onStart={() => {
                handleStart.current = { x: hx, y: hy };
                fit.freeze();
              }}
              onEnd={fit.release}
              onMove={(dx, dy) => {
                const d = Math.hypot(
                  handleStart.current.x + dx - cx,
                  handleStart.current.y + dy - cy,
                );
                calc.set({ [spec.radius]: rep.snapTo(spec.radius, d / scale) });
              }}
            />
          </>
        );
      }}
    </Canvas>
  );
}

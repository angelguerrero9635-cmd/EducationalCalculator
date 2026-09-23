import { useRef } from 'react';
import Svg, { Line, Path, Rect } from 'react-native-svg';

import type { Representation } from '@/data/modules';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, ChartText, DragHandle, niceCeil, useFrozen, useRep } from './common';

type Spec = Extract<Representation, { kind: 'force' }>;

const arrow = (x1: number, y: number, x2: number) => {
  const dir = x2 >= x1 ? 1 : -1;
  const head = Math.min(10, Math.abs(x2 - x1));
  return `M ${x1} ${y} L ${x2} ${y} M ${x2 - dir * head} ${y - 6} L ${x2} ${y} L ${x2 - dir * head} ${y + 6}`;
};

/** A block pushed by the net force, with its acceleration drawn above. Drag the force tip. */
export function ForceDiagram({ spec, calc }: { spec: Spec; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  const start = useRef(0);
  const F = rep.val(spec.force);
  const a = rep.val(spec.acceleration);
  const fit = useFrozen({
    force: Math.max(spec.forceExtent, niceCeil(F)),
    accel: Math.max(spec.accelerationExtent, niceCeil(a)),
  });

  return (
    <Canvas aspect={0.6}>
      {({ w, h }) => {
        const ground = h - 24;
        const size = Math.min(90, h * 0.4);
        const bx = 16;
        const by = ground - size;
        const fx0 = bx + size;
        const fScale = (w - fx0 - 24) / fit.value.force;
        const fx1 = fx0 + F * fScale;
        const fy = by + size / 2;
        const ay = by - 28;
        const ax1 = bx + (a / fit.value.accel) * (w - bx - 24);
        return (
          <>
            <Svg width={w} height={h}>
              <Line
                x1={0}
                y1={ground}
                x2={w}
                y2={ground}
                stroke={c.chartInk}
                strokeWidth={chart.stroke}
              />
              <Rect
                x={bx}
                y={by}
                width={size}
                height={size}
                fill={c.chartFill}
                stroke={c.chartInk}
                strokeWidth={chart.stroke}
              />
              <ChartText
                x={bx + size / 2}
                y={by + size / 2 + 4}
                fontWeight="600"
                textAnchor="middle"
              >
                {rep.label(spec.mass)}
              </ChartText>
              <Path
                d={arrow(fx0, fy, fx1)}
                stroke={c.chartInk}
                strokeWidth={chart.strokeHeavy}
                fill="none"
                opacity={rep.known(spec.force) ? 1 : 0.35}
              />
              <ChartText
                x={(fx0 + Math.max(fx1, fx0 + 60)) / 2}
                y={fy - 10}
                fontSize={chart.value}
                fontWeight="600"
                textAnchor="middle"
              >
                {rep.label(spec.force)}
              </ChartText>
              <Path
                d={arrow(bx, ay, Math.max(ax1, bx + 1))}
                stroke={c.chartMuted}
                strokeWidth={chart.stroke}
                strokeDasharray={chart.dash}
                fill="none"
                opacity={rep.known(spec.acceleration) ? 1 : 0.35}
              />
              <ChartText x={bx} y={ay - 10} fill={c.chartMuted}>
                {rep.label(spec.acceleration)}
              </ChartText>
            </Svg>
            <DragHandle
              testID="drag-force"
              x={fx1}
              y={fy}
              label={rep.variable(spec.force).name}
              onStart={() => {
                start.current = F;
                fit.freeze();
              }}
              onEnd={fit.release}
              onMove={(dx) =>
                calc.set({
                  ...rep.pin([spec.mass]),
                  [spec.force]: rep.snapTo(spec.force, start.current + dx / fScale),
                })
              }
            />
          </>
        );
      }}
    </Canvas>
  );
}

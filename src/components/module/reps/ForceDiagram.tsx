import { useRef } from 'react';
import Svg, { Line, Path, Rect, Text as SvgText } from 'react-native-svg';

import type { Representation } from '@/data/modules';
import { usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, DragHandle, useRep } from './common';

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
  const F = Math.min(rep.val(spec.force), spec.maxForce);
  const a = Math.min(rep.val(spec.acceleration), spec.maxAcceleration);

  return (
    <Canvas aspect={0.6}>
      {({ w, h }) => {
        const ground = h - 24;
        const size = Math.min(90, h * 0.4);
        const bx = 16;
        const by = ground - size;
        const fx0 = bx + size;
        const span = w - fx0 - 24;
        const fScale = span / spec.maxForce;
        const fx1 = fx0 + F * fScale;
        const fy = by + size / 2;
        const ay = by - 28;
        const ax1 = bx + (a / spec.maxAcceleration) * (w - bx - 24);
        return (
          <>
            <Svg width={w} height={h}>
              <Line x1={0} y1={ground} x2={w} y2={ground} stroke={c.text} strokeWidth={2} />
              <Rect
                x={bx}
                y={by}
                width={size}
                height={size}
                fill={c.placeholder}
                stroke={c.text}
                strokeWidth={2}
              />
              <SvgText
                x={bx + size / 2}
                y={by + size / 2 + 4}
                fontSize={12}
                fontWeight="600"
                fill={c.text}
                textAnchor="middle"
              >
                {rep.label(spec.mass)}
              </SvgText>
              <Path
                d={arrow(fx0, fy, fx1)}
                stroke={c.text}
                strokeWidth={3}
                fill="none"
                opacity={rep.known(spec.force) ? 1 : 0.35}
              />
              <SvgText
                x={(fx0 + Math.max(fx1, fx0 + 60)) / 2}
                y={fy - 10}
                fontSize={13}
                fontWeight="600"
                fill={c.text}
                textAnchor="middle"
              >
                {rep.label(spec.force)}
              </SvgText>
              <Path
                d={arrow(bx, ay, Math.max(ax1, bx + 1))}
                stroke={c.textMuted}
                strokeWidth={2}
                strokeDasharray="6 4"
                fill="none"
                opacity={rep.known(spec.acceleration) ? 1 : 0.35}
              />
              <SvgText x={bx} y={ay - 10} fontSize={12} fill={c.textMuted}>
                {rep.label(spec.acceleration)}
              </SvgText>
            </Svg>
            <DragHandle
              testID="drag-force"
              x={fx1}
              y={fy}
              label={rep.variable(spec.force).name}
              onStart={() => (start.current = F)}
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

import { useRef } from 'react';
import Svg, { Circle, Line, Text as SvgText } from 'react-native-svg';

import type { Representation } from '@/data/modules';
import { usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, DragHandle, useRep } from './common';

type Spec = Extract<Representation, { kind: 'circle' }>;

export function CircleDiagram({ spec, calc }: { spec: Spec; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  const handleStart = useRef({ x: 0, y: 0 });
  const r = rep.val(spec.radius);
  const faded = !rep.known(spec.radius);

  return (
    <Canvas aspect={0.9}>
      {({ w, h }) => {
        const cx = w / 2;
        const cy = h / 2;
        const scale = (Math.min(w, h) / 2 - 36) / spec.max;
        const R = Math.min(r, spec.max) * scale;
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
                fill={c.placeholder}
                stroke={c.text}
                strokeWidth={2}
                opacity={faded ? 0.35 : 1}
              />
              {spec.diameter ? (
                <Line
                  x1={cx - R}
                  y1={cy}
                  x2={cx + R}
                  y2={cy}
                  stroke={c.textMuted}
                  strokeDasharray="5 4"
                />
              ) : null}
              <Line x1={cx} y1={cy} x2={hx} y2={hy} stroke={c.text} strokeWidth={2} />
              <Circle cx={cx} cy={cy} r={3} fill={c.text} />
              <SvgText x={hx + 14} y={hy - 8} fontSize={13} fill={c.text}>
                {rep.label(spec.radius)}
              </SvgText>
              {spec.diameter ? (
                <SvgText x={cx} y={cy + 18} fontSize={12} fill={c.textMuted} textAnchor="middle">
                  {rep.label(spec.diameter)}
                </SvgText>
              ) : null}
              {spec.area ? (
                <SvgText
                  x={cx}
                  y={cy + R / 2 + 10}
                  fontSize={13}
                  fontWeight="700"
                  fill={c.text}
                  textAnchor="middle"
                >
                  {rep.label(spec.area)}
                </SvgText>
              ) : null}
              {spec.circumference ? (
                <SvgText
                  x={cx}
                  y={Math.max(14, cy - R - 10)}
                  fontSize={13}
                  fill={c.text}
                  textAnchor="middle"
                >
                  {`${rep.label(spec.circumference)} (all the way around)`}
                </SvgText>
              ) : null}
            </Svg>
            <DragHandle
              testID="drag-radius"
              x={hx}
              y={hy}
              label={rep.variable(spec.radius).name}
              onStart={() => (handleStart.current = { x: hx, y: hy })}
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

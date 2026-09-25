import { View } from 'react-native';
import Svg, { Line, Path, Rect } from 'react-native-svg';

import type { Representation } from '@/data/modules';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, ChartText, useRep, Caption } from './common';
import { Steppers } from './Steppers';

type Spec = Extract<Representation, { kind: 'pushes' }>;

/** A box pushed from both sides; each arrow's length is the size of its push. */
export function Pushes({ spec, calc }: { spec: Spec; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  const r = rep.known(spec.right) ? Math.max(0, rep.shown(spec.right)) : 0;
  const l = rep.known(spec.left) ? Math.max(0, rep.shown(spec.left)) : 0;
  const max = Math.max(spec.max, r, l);
  const both = rep.known(spec.right) && rep.known(spec.left);

  return (
    <View>
      <Canvas aspect={0.36}>
        {({ w, h }) => {
          const cx = w / 2;
          const box = 56;
          const y = h * 0.5;
          const room = cx - box / 2 - 20;
          const px = (x: number) => (x / max) * room;
          const arrow = (from: number, to: number, key: string) =>
            Math.abs(to - from) < 2 ? null : (
              <Path
                key={key}
                d={`M ${from} ${y} L ${to} ${y} M ${to} ${y} l ${to > from ? -10 : 10} -6 M ${to} ${y} l ${to > from ? -10 : 10} 6`}
                stroke={c.chartHighlight}
                strokeWidth={chart.strokeHeavy}
                fill="none"
              />
            );
          return (
            <Svg width={w} height={h}>
              <Line
                x1={12}
                y1={y + box / 2}
                x2={w - 12}
                y2={y + box / 2}
                stroke={c.chartInk}
                strokeWidth={chart.stroke}
              />
              <Rect
                x={cx - box / 2}
                y={y - box / 2}
                width={box}
                height={box}
                rx={6}
                fill={c.chartFill}
                stroke={c.chartInk}
                strokeWidth={chart.stroke}
              />
              {/* The push to the right comes from the left side; the push to the left from the right. */}
              {arrow(cx - box / 2 - px(r), cx - box / 2, 'r')}
              {arrow(cx + box / 2 + px(l), cx + box / 2, 'l')}
              <ChartText
                x={cx - box / 2 - px(r) / 2}
                y={y - 14}
                fontSize={chart.small}
                fontWeight="700"
                textAnchor="middle"
              >
                {rep.value(spec.right)}
              </ChartText>
              <ChartText
                x={cx + box / 2 + px(l) / 2}
                y={y - 14}
                fontSize={chart.small}
                fontWeight="700"
                textAnchor="middle"
              >
                {rep.value(spec.left)}
              </ChartText>
              <ChartText
                x={cx - box / 2 - px(r) / 2}
                y={y + box / 2 + 18}
                fontSize={chart.small}
                fill={c.chartMuted}
                textAnchor="middle"
              >
                {rep.tag(spec.right)}
              </ChartText>
              <ChartText
                x={cx + box / 2 + px(l) / 2}
                y={y + box / 2 + 18}
                fontSize={chart.small}
                fill={c.chartMuted}
                textAnchor="middle"
              >
                {rep.tag(spec.left)}
              </ChartText>
            </Svg>
          );
        }}
      </Canvas>
      <Caption>
        {!both
          ? 'Type both pushes.'
          : r === l
            ? `Balanced: ${rep.value(spec.right)} each way. The box stays still.`
            : `Unbalanced: the box moves ${r > l ? 'right' : 'left'}. ${rep.named(spec.extra)}.`}
      </Caption>
      <Steppers
        calc={calc}
        items={[
          { var: spec.right, steps: [1, 5], pin: [spec.left] },
          { var: spec.left, steps: [1, 5], pin: [spec.right] },
        ]}
      />
    </View>
  );
}

/**
 * H106 (round 3, group B): a one-event Venn diagram (`venn` `chances` with `one`), for the
 * complement rule. The sample space as a rectangle (probability 1, or the count N) and one
 * circle A; A holds P(A), the rest of the rectangle P(not A) = 1 − P(A). `shade` 'notA' lights
 * the outside, 'aOnly' or 'or' the circle. Flat, like `VennChance`.
 */
import { View } from 'react-native';
import Svg, { Circle, Rect } from 'react-native-svg';

import type { VennChances } from '@/data/modules/typesHse';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { probText } from './ChanceTree';
import { Canvas, Caption, ChartText, useRep } from './common';
import { reader } from './graphKit';
import { countText } from './VennCounts';

export function VennOne({ spec, calc }: { spec: VennChances; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  const read = reader(rep);
  const A = read(spec.a);
  const total = spec.counts ? read(spec.counts.total) : undefined;
  const N = total ? total.value : 1;
  const known = A.known && (!total || total.known);
  const a = A.value / N;
  const valid = a >= -1e-9 && a <= 1 + 1e-9;
  // With a value "?" the regions read "?" (never the example's numbers behind the "?").
  const say0 = spec.counts ? (x: number) => countText(x, N) : probText;
  const say = (x: number) => (known ? say0(x) : '?');
  const [nA] = spec.names ?? ['A'];
  const inside = spec.shade === 'aOnly' || spec.shade === 'or' || spec.shade === 'and';
  const outside = spec.shade === 'notA' || spec.shade === 'neither';

  const caption = !known
    ? 'Type the probability to fill the diagram.'
    : !valid
      ? `P(${nA}) is between 0 and 1.`
      : [
          `P(${nA}) = ${say(a)}`,
          `${nA} and not ${nA} fill the rectangle: P(${nA}) + P(not ${nA}) = ${spec.counts ? countText(1, N) : '1'}`,
          ...(outside
            ? [`Shaded: P(not ${nA}) = 1 − P(${nA}) = 1 − ${probText(a)} = ${probText(1 - a)}`]
            : inside
              ? [`Shaded: P(${nA}) = ${probText(a)}`]
              : []),
        ].join(' · ');

  return (
    <View>
      <Canvas aspect={0.62}>
        {({ w, h }) => {
          const pad = 8;
          const top = 26;
          const box = { x: pad, y: top, w: w - 2 * pad, h: h - top - pad };
          const R = Math.min(box.h * 0.36, box.w * 0.24);
          const cx = box.x + box.w * 0.4;
          const cy = box.y + box.h / 2;
          const shadeFill = c.accentSoft;
          return (
            <Svg width={w} height={h} opacity={known && valid ? 1 : 0.4}>
              <Rect
                x={box.x}
                y={box.y}
                width={box.w}
                height={box.h}
                fill={outside ? shadeFill : c.card}
              />
              <Circle cx={cx} cy={cy} r={R} fill={inside ? shadeFill : c.card} />
              <Rect
                x={box.x}
                y={box.y}
                width={box.w}
                height={box.h}
                fill="none"
                stroke={c.chartInk}
                strokeWidth={chart.strokeLight}
              />
              <Circle
                cx={cx}
                cy={cy}
                r={R}
                fill="none"
                stroke={c.chartHighlight}
                strokeWidth={chart.stroke}
              />
              <ChartText x={pad} y={16} fontSize={chart.label} fontWeight="700">
                {spec.counts ? `All: ${countText(1, N)}` : 'All outcomes: 1'}
              </ChartText>
              <ChartText
                x={cx}
                y={cy - R - 8}
                fontSize={chart.value}
                fontWeight="700"
                fill={c.chartHighlight}
                textAnchor="middle"
              >
                {nA}
              </ChartText>
              <ChartText
                x={cx}
                y={cy + 5}
                fontSize={chart.value}
                fontWeight="700"
                textAnchor="middle"
              >
                {say(a)}
              </ChartText>
              <ChartText
                x={(cx + R + box.x + box.w) / 2}
                y={cy + 5}
                fontSize={chart.value}
                fontWeight="700"
                textAnchor="middle"
              >
                {`not ${nA}`}
              </ChartText>
              <ChartText
                x={(cx + R + box.x + box.w) / 2}
                y={cy + 25}
                fontSize={chart.value}
                textAnchor="middle"
              >
                {say(1 - a)}
              </ChartText>
            </Svg>
          );
        }}
      </Canvas>
      <Caption>{caption}</Caption>
    </View>
  );
}

import { useRef } from 'react';
import { View } from 'react-native';
import Svg, { Circle, Line, Path } from 'react-native-svg';

import type { Representation } from '@/data/modules';
import { formatNumber } from '@/engine/format';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, ChartText, DragHandle, useRep, Caption } from './common';
import { Steppers } from './Steppers';

type Spec = Extract<Representation, { kind: 'rounding' }>;

/**
 * Rounding on a number line: from the ten (or hundred) below the number to the one above, with
 * the halfway mark. An arrow goes from the number to the nearer end. Drag the number.
 */
export function Rounding({ spec, calc }: { spec: Spec; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  const start = useRef(0);
  const to =
    typeof spec.to === 'number' ? spec.to : rep.shown(spec.to) > 0 ? rep.shown(spec.to) : 10;
  // Decimal places of a tick (a tenth of the place): 2 for rounding to 0.1.
  const dp = Math.max(0, Math.round(-Math.log10(to)) + 1);
  const fix = (x: number) => Number(x.toFixed(dp));
  const known = rep.known(spec.value);
  const n = fix(rep.shown(spec.value));
  // The ends come from the number itself, so the line is right even before they are solved.
  const lo = fix(Math.floor(n / to + 1e-9) * to);
  const hi = fix(lo + to);
  const half = fix(lo + to / 2);
  const up = n >= half;
  const r = up ? hi : lo;

  return (
    <View>
      <Canvas aspect={0.46}>
        {({ w, h }) => {
          const pad = 30;
          const px = (x: number) => pad + ((x - lo) / to) * (w - 2 * pad);
          const y = h * 0.62;
          const ticks = Array.from({ length: 11 }, (_, i) => fix(lo + (to / 10) * i));
          const arc = `M ${px(n)} ${y - 10} Q ${(px(n) + px(r)) / 2} ${y - 48} ${px(r)} ${y - 10}`;
          return (
            <>
              <Svg width={w} height={h}>
                <Line
                  x1={pad - 8}
                  y1={y}
                  x2={w - pad + 8}
                  y2={y}
                  stroke={c.chartInk}
                  strokeWidth={chart.stroke}
                />
                {ticks.map((x, i) => (
                  <Line
                    key={`t${x}`}
                    x1={px(x)}
                    y1={y - (i === 5 ? 12 : i % 10 === 0 ? 10 : 5)}
                    x2={px(x)}
                    y2={y + (i === 5 ? 12 : i % 10 === 0 ? 10 : 5)}
                    stroke={i === 5 ? c.chartHighlight : c.chartInk}
                    strokeWidth={i === 5 || i % 10 === 0 ? chart.stroke : chart.strokeLight}
                  />
                ))}
                {ticks
                  // Six-figure labels ("347,100") would touch: past thousands, label the
                  // ends and the halfway mark only.
                  .map((x, i) => [x, i] as const)
                  .filter(([, i]) => (to <= 100 && to >= 1) || i % 5 === 0)
                  .map(([x, i]) => (
                    <ChartText
                      key={`l${x}`}
                      x={px(x)}
                      y={y + 24}
                      fontSize={i % 5 === 0 ? chart.label : chart.tiny}
                      fontWeight={x === lo || x === hi ? '700' : undefined}
                      fill={i % 5 === 0 ? c.chartInk : c.chartMuted}
                      textAnchor="middle"
                    >
                      {formatNumber(x)}
                    </ChartText>
                  ))}
                <ChartText
                  x={px(half)}
                  y={y + 42}
                  fontSize={chart.small}
                  fill={c.chartHighlight}
                  textAnchor="middle"
                >
                  halfway
                </ChartText>
                {known ? (
                  <>
                    <Path
                      d={arc}
                      stroke={c.chartHighlight}
                      strokeWidth={chart.stroke}
                      fill="none"
                    />
                    <Path
                      d={`M ${px(r) - 6} ${y - 18} L ${px(r)} ${y - 10} L ${px(r) + 6} ${y - 18}`}
                      stroke={c.chartHighlight}
                      strokeWidth={chart.stroke}
                      fill="none"
                    />
                    <Circle
                      cx={px(r)}
                      cy={y}
                      r={7}
                      fill="none"
                      stroke={c.chartHighlight}
                      strokeWidth={chart.stroke}
                    />
                    <Circle cx={px(n)} cy={y} r={5} fill={c.chartHighlight} />
                    <ChartText
                      x={Math.min(w - 50, Math.max(50, px(n)))}
                      y={y - 56}
                      fontSize={chart.value}
                      fontWeight="700"
                      textAnchor="middle"
                    >
                      {rep.named(spec.value)}
                    </ChartText>
                  </>
                ) : null}
              </Svg>
              {known ? (
                <DragHandle
                  testID="drag-number"
                  x={px(n)}
                  y={y}
                  label={rep.variable(spec.value).name}
                  onStart={() => (start.current = n)}
                  onMove={(dx) =>
                    calc.set({
                      [spec.value]: rep.snapTo(
                        spec.value,
                        Math.min(hi, Math.max(lo, start.current + (dx / (w - 2 * pad)) * to)),
                      ),
                    })
                  }
                />
              ) : null}
            </>
          );
        }}
      </Canvas>
      <Caption>
        {known
          ? `${formatNumber(n)} is ${formatNumber(fix(n - lo))} past ${formatNumber(lo)} and ${formatNumber(fix(hi - n))} before ${formatNumber(hi)}. ${up ? `${formatNumber(fix(n - lo))} is ${formatNumber(fix(to / 2))} or more, so it rounds up` : `${formatNumber(fix(n - lo))} is less than ${formatNumber(fix(to / 2))}, so it rounds down`} to ${formatNumber(r)}.`
          : `Type a number to round.`}
      </Caption>
      <Steppers
        calc={calc}
        items={[
          {
            var: spec.value,
            steps:
              to === 10
                ? [1, 10]
                : to === 100
                  ? [1, 10, 100]
                  : to < 1
                    ? [fix(to / 10), to]
                    : [1, to / 10, to],
            pin: [],
          },
        ]}
      />
    </View>
  );
}

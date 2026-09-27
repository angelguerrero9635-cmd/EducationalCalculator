import { useRef } from 'react';
import { View } from 'react-native';
import Svg, { Circle, Line, Path } from 'react-native-svg';

import type { Representation } from '@/data/modules';
import { formatNumber } from '@/engine/format';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, Caption, ChartText, DragHandle, fitLabel, useFrozen, useRep } from './common';
import { tickStep } from './IntegerLine';
import { Steppers } from './Steppers';

type Spec = Extract<Representation, { kind: 'integerLine' }>;

/**
 * Adding or subtracting signed numbers as a jump on a number line: start at `value`, jump by
 * `jump.by` (right for a positive number, left for a negative one; subtracting jumps the other
 * way, the same as adding the opposite) and land on `jump.result`. Drag the start or the end.
 */
export function SignedJump({ spec, calc }: { spec: Spec; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  const start = useRef(0);
  const jump = spec.jump!;
  const subtract = jump.op === '−';
  const a = rep.shown(spec.value);
  const b = rep.shown(jump.by);
  // The move along the line: b, or its opposite when subtracting.
  const move = subtract ? -b : b;
  const end = a + move;
  const aKnown = rep.known(spec.value);
  const bKnown = rep.known(jump.by);
  const unit = spec.unit ? ` ${spec.unit}` : '';
  const extent = useFrozen(
    (() => {
      const lo = Math.min(spec.min, a, end);
      const hi = Math.max(spec.max, a, end);
      const s = tickStep(hi - lo);
      return [Math.floor(lo / s) * s, Math.ceil(hi / s) * s] as [number, number];
    })(),
  );
  const [lo, hi] = extent.value;
  const step = tickStep(hi - lo);
  const n = (x: number) => (x < 0 ? `(${formatNumber(x)})` : formatNumber(x));
  const jumpText = `${subtract ? '−' : '+'} ${n(b)}`;

  return (
    <View>
      <Canvas aspect={0.42}>
        {({ w, h }) => {
          const pad = 24;
          const x = (v: number) => pad + ((v - lo) / (hi - lo)) * (w - 2 * pad);
          const perUnit = (w - 2 * pad) / (hi - lo);
          const lineY = h * 0.68;
          const ticks = Array.from({ length: Math.round((hi - lo) / step) + 1 }, (_, i) =>
            Number((lo + i * step).toFixed(10)),
          );
          const every = Math.ceil(26 / (perUnit * step));
          const [p, q] = [x(a), x(end)];
          // The jump: an arc above the line, higher for a longer jump, with a head at the end.
          const rise = Math.min(h * 0.42, 18 + Math.abs(q - p) * 0.25);
          // The head points along the arc's end (from its control point to the end).
          const [ux, uy] = (() => {
            const dx = q - (p + q) / 2;
            const dy = 2 * rise;
            const len = Math.hypot(dx, dy) || 1;
            return [dx / len, dy / len];
          })();
          const head = 9;
          // Which way the jump goes, to keep the two labels apart when it is short.
          const dirSign = q >= p ? 1 : -1;
          const tip = { x: q, y: lineY - 12 };
          const side = (k: number) =>
            `${tip.x - head * ux + k * head * 0.5 * uy} ${tip.y - head * uy - k * head * 0.5 * ux}`;
          const arrowHead = `M ${tip.x} ${tip.y} L ${side(1)} L ${side(-1)} Z`;
          const showJump = aKnown && bKnown && move !== 0;
          return (
            <>
              <Svg width={w} height={h}>
                <Line
                  x1={pad - 10}
                  y1={lineY}
                  x2={w - pad + 10}
                  y2={lineY}
                  stroke={c.chartInk}
                  strokeWidth={chart.stroke}
                />
                <Path
                  d={`M ${pad - 10} ${lineY} l 7 -5 m -7 5 l 7 5 M ${w - pad + 10} ${lineY} l -7 -5 m 7 5 l -7 5`}
                  stroke={c.chartInk}
                  strokeWidth={chart.stroke}
                  fill="none"
                />
                {ticks.map((t, i) => (
                  <Line
                    key={`t${t}`}
                    x1={x(t)}
                    y1={lineY - (t === 0 ? 9 : 5)}
                    x2={x(t)}
                    y2={lineY + (t === 0 ? 9 : 5)}
                    stroke={c.chartInk}
                    strokeWidth={t === 0 ? chart.stroke : 1}
                    opacity={i % every === 0 || t === 0 ? 1 : 0.6}
                  />
                ))}
                {ticks
                  .filter((t, i) => t === 0 || i % every === 0)
                  .map((t) => (
                    <ChartText
                      key={`l${t}`}
                      x={x(t)}
                      y={lineY + 22}
                      fontSize={chart.tiny}
                      fontWeight={t === 0 ? '700' : '400'}
                      fill={t === 0 ? c.chartInk : c.chartMuted}
                      textAnchor="middle"
                    >
                      {formatNumber(t)}
                    </ChartText>
                  ))}
                {showJump ? (
                  <>
                    <Path
                      d={`M ${p} ${lineY - 12} Q ${(p + q) / 2} ${lineY - 12 - 2 * rise} ${q} ${lineY - 12}`}
                      stroke={c.chartHighlight}
                      strokeWidth={chart.stroke}
                      fill="none"
                    />
                    <Path d={arrowHead} fill={c.chartHighlight} />
                    <ChartText
                      {...fitLabel((p + q) / 2, jumpText, chart.value, w)}
                      y={lineY - 12 - rise - 6}
                      fontSize={chart.value}
                      fontWeight="700"
                      fill={c.chartHighlight}
                    >
                      {jumpText}
                    </ChartText>
                  </>
                ) : null}
                <Circle cx={p} cy={lineY} r={6} fill={c.chartInk} opacity={aKnown ? 1 : 0.35} />
                {aKnown ? (
                  <ChartText
                    {...fitLabel(
                      p + (showJump && Math.abs(q - p) < 40 ? -dirSign * 4 : 0),
                      formatNumber(a),
                      chart.label,
                      w,
                      showJump && Math.abs(q - p) < 40 ? (dirSign > 0 ? 'end' : 'start') : 'middle',
                    )}
                    y={lineY + 40}
                    fontSize={chart.label}
                    fontWeight="700"
                  >
                    {formatNumber(a)}
                  </ChartText>
                ) : null}
                {showJump ? (
                  <>
                    <Circle
                      cx={q}
                      cy={lineY}
                      r={6.5}
                      fill={c.card}
                      stroke={c.chartHighlight}
                      strokeWidth={chart.stroke + 0.5}
                    />
                    <ChartText
                      {...fitLabel(
                        q + (Math.abs(q - p) < 40 ? dirSign * 4 : 0),
                        formatNumber(end),
                        chart.label,
                        w,
                        Math.abs(q - p) < 40 ? (dirSign > 0 ? 'start' : 'end') : 'middle',
                      )}
                      y={lineY + 40}
                      fontSize={chart.label}
                      fontWeight="700"
                      fill={c.chartHighlight}
                    >
                      {rep.known(jump.result) ? formatNumber(end) : '?'}
                    </ChartText>
                  </>
                ) : null}
              </Svg>
              {aKnown ? (
                <DragHandle
                  testID={`drag-${spec.value}`}
                  x={p}
                  y={lineY}
                  label={rep.variable(spec.value).name}
                  onStart={() => {
                    start.current = a;
                    extent.freeze();
                  }}
                  onEnd={extent.release}
                  onMove={(dx) =>
                    calc.set(
                      {
                        ...rep.pin([jump.by]),
                        [spec.value]: rep.snapTo(
                          spec.value,
                          (start.current + dx / perUnit) * rep.factor(spec.value),
                        ),
                      },
                      rep.slide(spec.value),
                    )
                  }
                />
              ) : null}
              {showJump ? (
                <DragHandle
                  testID={`drag-${jump.by}`}
                  x={q}
                  y={lineY}
                  label={rep.variable(jump.by).name}
                  onStart={() => {
                    start.current = b;
                    extent.freeze();
                  }}
                  onEnd={extent.release}
                  onMove={(dx) =>
                    calc.set(
                      {
                        ...rep.pin([spec.value]),
                        [jump.by]: rep.snapTo(
                          jump.by,
                          (start.current + ((subtract ? -1 : 1) * dx) / perUnit) *
                            rep.factor(jump.by),
                        ),
                      },
                      rep.slide(jump.by),
                    )
                  }
                />
              ) : null}
            </>
          );
        }}
      </Canvas>
      <Caption>{caption()}</Caption>
      <Steppers
        calc={calc}
        items={[
          { var: spec.value, steps: [1], pin: [jump.by] },
          { var: jump.by, steps: [1], pin: [spec.value] },
        ]}
      />
    </View>
  );

  function caption() {
    if (!aKnown) return 'Type a number to start from.';
    if (!bKnown)
      return `Start at ${formatNumber(a)}${unit}. Type the number to ${subtract ? 'subtract' : 'add'}.`;
    const result = rep.known(jump.result) ? formatNumber(end) : '?';
    const sentence = `${formatNumber(a)} ${jumpText} = ${result}`;
    if (move === 0) return `${sentence} · A jump of 0 stays put.`;
    const how = `move ${formatNumber(Math.abs(b))}${unit} to the ${move > 0 ? 'right' : 'left'}`;
    return subtract
      ? `${sentence} · Subtracting ${n(b)} is adding ${n(-b)}: ${how}.`
      : `${sentence} · Start at ${formatNumber(a)}${unit} and ${how}.`;
  }
}

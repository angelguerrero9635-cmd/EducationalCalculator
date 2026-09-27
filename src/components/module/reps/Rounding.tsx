import { useRef } from 'react';
import { View } from 'react-native';
import Svg, { Circle, G, Line, Path } from 'react-native-svg';

import type { Representation } from '@/data/modules';
import { formatNumber } from '@/engine/format';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, ChartText, DragHandle, useRep, Caption } from './common';
import { Steppers } from './Steppers';

type Spec = Extract<Representation, { kind: 'rounding' }>;

/**
 * Rounding on a number line: from the ten (or hundred) below the number to the one above, with
 * the halfway mark. An arrow goes from the number to the nearer end. Drag the number. With
 * `second`, a second number's line under the first, and the estimate the two make.
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
  /** One number's line: its ends, halfway mark and the end it rounds to. */
  const lineOf = (id: string) => {
    const n = fix(rep.shown(id));
    // The ends come from the number itself, so the line is right even before they are solved.
    const lo = fix(Math.floor(n / to + 1e-9) * to);
    const hi = fix(lo + to);
    const half = fix(lo + to / 2);
    const up = n >= half;
    return { id, known: rep.known(id), n, lo, hi, half, up, r: up ? hi : lo };
  };
  type RoundLine = ReturnType<typeof lineOf>;
  const lines = [lineOf(spec.value), ...(spec.second ? [lineOf(spec.second.value)] : [])];
  const first = lines[0]!;
  // Each line's share of the canvas height (one line alone: 0.46 of the width, as before).
  const band = (w: number) => (lines.length > 1 ? Math.min(w * 0.46, 150) : w * 0.46);

  const drawLine = (L: RoundLine, w: number, top: number, h: number) => {
    const pad = 30;
    const px = (x: number) => pad + ((x - L.lo) / to) * (w - 2 * pad);
    const y = top + h * 0.62;
    const ticks = Array.from({ length: 11 }, (_, i) => fix(L.lo + (to / 10) * i));
    const arc = `M ${px(L.n)} ${y - 10} Q ${(px(L.n) + px(L.r)) / 2} ${y - 48} ${px(L.r)} ${y - 10}`;
    return {
      px,
      y,
      art: (
        <G key={L.id}>
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
                fontWeight={x === L.lo || x === L.hi ? '700' : undefined}
                fill={i % 5 === 0 ? c.chartInk : c.chartMuted}
                textAnchor="middle"
              >
                {formatNumber(x)}
              </ChartText>
            ))}
          <ChartText
            x={px(L.half)}
            y={y + 42}
            fontSize={chart.small}
            fill={c.chartHighlight}
            textAnchor="middle"
          >
            halfway
          </ChartText>
          {L.known ? (
            <>
              <Path d={arc} stroke={c.chartHighlight} strokeWidth={chart.stroke} fill="none" />
              <Path
                d={`M ${px(L.r) - 6} ${y - 18} L ${px(L.r)} ${y - 10} L ${px(L.r) + 6} ${y - 18}`}
                stroke={c.chartHighlight}
                strokeWidth={chart.stroke}
                fill="none"
              />
              <Circle
                cx={px(L.r)}
                cy={y}
                r={7}
                fill="none"
                stroke={c.chartHighlight}
                strokeWidth={chart.stroke}
              />
              <Circle cx={px(L.n)} cy={y} r={5} fill={c.chartHighlight} />
              <ChartText
                x={Math.min(w - 50, Math.max(50, px(L.n)))}
                y={y - 56}
                fontSize={chart.value}
                fontWeight="700"
                textAnchor="middle"
              >
                {rep.named(L.id)}
              </ChartText>
            </>
          ) : null}
        </G>
      ),
    };
  };

  const says = (L: RoundLine) =>
    `${formatNumber(L.n)} is ${formatNumber(fix(L.n - L.lo))} past ${formatNumber(L.lo)} and ${formatNumber(fix(L.hi - L.n))} before ${formatNumber(L.hi)}. ${L.up ? `${formatNumber(fix(L.n - L.lo))} is ${formatNumber(fix(to / 2))} or more, so it rounds up` : `${formatNumber(fix(L.n - L.lo))} is less than ${formatNumber(fix(to / 2))}, so it rounds down`} to ${formatNumber(L.r)}.`;
  const caption = () => {
    if (!spec.second) return first.known ? says(first) : 'Type a number to round.';
    const two = lines[1]!;
    if (!first.known || !two.known) return 'Type both numbers to round.';
    const sign = spec.second.minus ? '−' : '+';
    const e = fix(spec.second.minus ? first.r - two.r : first.r + two.r);
    return `${formatNumber(first.n)} rounds to ${formatNumber(first.r)}. ${formatNumber(two.n)} rounds to ${formatNumber(two.r)}. Estimate: ${formatNumber(first.r)} ${sign} ${formatNumber(two.r)} = ${formatNumber(e)}.`;
  };
  const others = (id: string) => lines.filter((o) => o.id !== id).map((o) => o.id);

  return (
    <View>
      <Canvas aspect={(w) => (band(w) * lines.length) / w}>
        {({ w }) => {
          const drawn = lines.map((L, k) => ({ L, ...drawLine(L, w, k * band(w), band(w)) }));
          return (
            <>
              <Svg width={w} height={band(w) * lines.length}>
                {drawn.map((d) => d.art)}
              </Svg>
              {drawn.map(({ L, px, y }) =>
                L.known ? (
                  <DragHandle
                    key={L.id}
                    testID={L.id === spec.value ? 'drag-number' : `drag-${L.id}`}
                    x={px(L.n)}
                    y={y}
                    label={rep.variable(L.id).name}
                    onStart={() => (start.current = L.n)}
                    onMove={(dx) =>
                      calc.set(
                        {
                          ...rep.pin(others(L.id)),
                          [L.id]: rep.snapTo(
                            L.id,
                            Math.min(L.hi, Math.max(L.lo, start.current + (dx / (w - 60)) * to)),
                          ),
                        },
                        rep.slide(L.id),
                      )
                    }
                  />
                ) : null,
              )}
            </>
          );
        }}
      </Canvas>
      <Caption>{caption()}</Caption>
      <Steppers
        calc={calc}
        items={lines.map((L) => ({
          var: L.id,
          steps:
            to === 10
              ? [1, 10]
              : to === 100
                ? [1, 10, 100]
                : to < 1
                  ? [fix(to / 10), to]
                  : [1, to / 10, to],
          pin: others(L.id),
        }))}
      />
    </View>
  );
}

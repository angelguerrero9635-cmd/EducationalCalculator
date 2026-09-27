import { useRef } from 'react';
import { View } from 'react-native';
import Svg, { Circle, Line, Path } from 'react-native-svg';

import type { Representation } from '@/data/modules';
import { formatNumber } from '@/engine/format';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, Caption, ChartText, DragHandle, useFrozen, useRep } from './common';
import { InequalityLine } from './Inequality';
import { Steppers } from './Steppers';

type Spec = Extract<Representation, { kind: 'integerLine' }>;

/** A tick spacing that gives at most `most` ticks over `span`: 1, 2, 5, 10, 20, 25, 50, … */
export function tickStep(span: number, most = 20): number {
  for (const base of [1, 10, 100, 1000]) {
    // No 2.5 below 10: a line counts by 1, 2 or 5 there, never by 2.5.
    for (const k of base === 1 ? [1, 2, 5] : [1, 2, 2.5, 5]) {
      const s = k * base;
      if (span / s <= most) return s;
    }
  }
  return 10000;
}

/**
 * A number line through 0 (across, or up and down for temperatures and heights): the number
 * as a point to drag, its opposite mirrored through 0 with a dashed arc, its distance from 0
 * bracketed (absolute value), or a second point with the jump between the two. With
 * `inequality`, an inequality's solutions instead (Inequality.tsx).
 */
export function IntegerLine({ spec, calc }: { spec: Spec; calc: Calculator }) {
  return spec.inequality ? (
    <InequalityLine spec={spec} calc={calc} />
  ) : (
    <PointLine spec={spec} calc={calc} />
  );
}

function PointLine({ spec, calc }: { spec: Spec; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  const start = useRef(0);
  const a = rep.shown(spec.value);
  const b = spec.second ? rep.shown(spec.second) : undefined;
  const unit = spec.unit ?? '';
  const num = (x: number) => `${formatNumber(x)}${unit ? ` ${unit}` : ''}`;
  // The line runs from min to max, growing to take in the points (and the opposite).
  const extent = useFrozen(
    (() => {
      const pts = [a, ...(spec.opposite ? [-a] : []), ...(b === undefined ? [] : [b])];
      const lo = Math.min(spec.min, ...pts);
      const hi = Math.max(spec.max, ...pts);
      const s = tickStep(hi - lo);
      return [Math.floor(lo / s) * s, Math.ceil(hi / s) * s] as [number, number];
    })(),
  );
  const [lo, hi] = extent.value;
  const step = tickStep(hi - lo);
  const vertical = !!spec.vertical;
  // A cleared number is drawn faded, with no handle and no jump to or from it.
  const aKnown = rep.known(spec.value);
  const bKnown = !spec.second || rep.known(spec.second);

  return (
    <View>
      <Canvas aspect={vertical ? 1.05 : 0.4}>
        {({ w, h }) => {
          const pad = 28;
          // Distance along the line for a number, then the point on the canvas.
          const along = (x: number) =>
            vertical
              ? h - pad - ((x - lo) / (hi - lo)) * (h - 2 * pad)
              : pad + ((x - lo) / (hi - lo)) * (w - 2 * pad);
          const lineAt = vertical ? w * 0.42 : h * 0.62;
          const pt = (x: number, off = 0) =>
            vertical ? { x: lineAt + off, y: along(x) } : { x: along(x), y: lineAt - off };
          const perUnit = Math.abs(along(1) - along(0));
          const ticks = Array.from(
            { length: Math.round((hi - lo) / step) + 1 },
            (_, i) => lo + i * step,
          );
          const p = pt(a);
          const q = b === undefined ? undefined : pt(b);
          const zero = pt(0);
          const opp = pt(-a);
          return (
            <>
              <Svg width={w} height={h}>
                <Line
                  x1={vertical ? lineAt : pad - 8}
                  y1={vertical ? pad - 8 : lineAt}
                  x2={vertical ? lineAt : w - pad + 8}
                  y2={vertical ? h - pad + 8 : lineAt}
                  stroke={c.chartInk}
                  strokeWidth={chart.stroke}
                />
                {ticks.map((t) => {
                  const at = pt(t);
                  const major = t === 0;
                  return (
                    <Line
                      key={`t${t}`}
                      x1={vertical ? lineAt - (major ? 9 : 5) : at.x}
                      y1={vertical ? at.y : lineAt - (major ? 9 : 5)}
                      x2={vertical ? lineAt + (major ? 9 : 5) : at.x}
                      y2={vertical ? at.y : lineAt + (major ? 9 : 5)}
                      stroke={c.chartInk}
                      strokeWidth={major ? chart.stroke : 1}
                    />
                  );
                })}
                {ticks
                  // Labels thin out on a phone so they never touch.
                  .filter((t, i) => t === 0 || i % Math.ceil(28 / (perUnit * step)) === 0)
                  .map((t) => {
                    const at = pt(t);
                    return (
                      <ChartText
                        key={`l${t}`}
                        x={vertical ? lineAt - 14 : at.x}
                        y={vertical ? at.y + 4 : lineAt + 22}
                        fontSize={chart.tiny}
                        fontWeight={t === 0 ? '700' : '400'}
                        fill={t === 0 ? c.chartInk : c.chartMuted}
                        textAnchor={vertical ? 'end' : 'middle'}
                      >
                        {formatNumber(t)}
                      </ChartText>
                    );
                  })}
                {/* The opposite: the same distance on the other side, joined through 0. */}
                {spec.opposite && aKnown && a !== 0 ? (
                  <>
                    <Path
                      d={
                        vertical
                          ? `M ${p.x} ${p.y} Q ${lineAt + 60} ${zero.y} ${opp.x} ${opp.y}`
                          : `M ${p.x} ${p.y} Q ${zero.x} ${lineAt - 70} ${opp.x} ${opp.y}`
                      }
                      stroke={c.chartMuted}
                      strokeWidth={chart.strokeLight}
                      strokeDasharray={chart.dash}
                      fill="none"
                    />
                    <Circle
                      cx={opp.x}
                      cy={opp.y}
                      r={7}
                      fill={c.chartSurface}
                      stroke={c.chartHighlight}
                      strokeWidth={chart.stroke}
                    />
                    <ChartText
                      x={vertical ? opp.x + 12 : opp.x}
                      y={vertical ? opp.y + 4 : opp.y - 14}
                      fontSize={chart.label}
                      fill={c.chartInk}
                      textAnchor={vertical ? 'start' : 'middle'}
                    >
                      {formatNumber(-a)}
                    </ChartText>
                  </>
                ) : null}
                {/* Absolute value: the distance from 0, bracketed on the far side. */}
                {spec.absolute && aKnown && a !== 0 ? (
                  <>
                    <Line
                      x1={vertical ? lineAt - 34 : zero.x}
                      y1={vertical ? zero.y : lineAt + 34}
                      x2={vertical ? lineAt - 34 : p.x}
                      y2={vertical ? p.y : lineAt + 34}
                      stroke={c.chartHighlight}
                      strokeWidth={chart.stroke}
                    />
                    <ChartText
                      x={vertical ? lineAt - 40 : (zero.x + p.x) / 2}
                      y={vertical ? (zero.y + p.y) / 2 + 4 : lineAt + 48}
                      fontSize={chart.label}
                      fontWeight="700"
                      fill={c.chartHighlight}
                      textAnchor={vertical ? 'end' : 'middle'}
                    >
                      {`${formatNumber(Math.abs(a))} from 0`}
                    </ChartText>
                  </>
                ) : null}
                {/* A second point and the jump between the two. */}
                {q && aKnown && bKnown ? (
                  <>
                    <Path
                      d={
                        vertical
                          ? `M ${p.x} ${p.y} Q ${lineAt + 70} ${(p.y + q.y) / 2} ${q.x} ${q.y}`
                          : `M ${p.x} ${p.y} Q ${(p.x + q.x) / 2} ${lineAt - 70} ${q.x} ${q.y}`
                      }
                      stroke={c.chartHighlight}
                      strokeWidth={chart.stroke}
                      fill="none"
                    />
                    <ChartText
                      x={vertical ? lineAt + 58 : (p.x + q.x) / 2}
                      y={vertical ? (p.y + q.y) / 2 + 4 : lineAt - 42}
                      fontSize={chart.label}
                      fontWeight="700"
                      fill={c.chartHighlight}
                      textAnchor={vertical ? 'start' : 'middle'}
                    >
                      {num(Math.abs(b! - a))}
                    </ChartText>
                  </>
                ) : null}
                <Circle
                  cx={p.x}
                  cy={p.y}
                  r={6}
                  fill={c.chartHighlight}
                  opacity={aKnown ? 1 : 0.4}
                />
                {q ? (
                  <Circle cx={q.x} cy={q.y} r={6} fill={c.chartInk} opacity={bKnown ? 1 : 0.4} />
                ) : null}
              </Svg>
              {[
                { id: spec.value, at: p },
                ...(spec.second && q ? [{ id: spec.second, at: q }] : []),
              ]
                .filter(({ id }) => rep.known(id))
                .map(({ id, at }) => (
                  <DragHandle
                    key={id}
                    testID={`drag-${id}`}
                    x={at.x}
                    y={at.y}
                    label={rep.variable(id).name}
                    onStart={() => {
                      start.current = rep.shown(id);
                      extent.freeze();
                    }}
                    onEnd={extent.release}
                    onMove={(dx, dy) => {
                      const moved = vertical ? -dy / perUnit : dx / perUnit;
                      calc.set(
                        {
                          ...rep.pin(
                            spec.second ? [id === spec.value ? spec.second : spec.value] : [],
                          ),
                          [id]: rep.snapTo(id, (start.current + moved) * rep.factor(id)),
                        },
                        rep.slide(id),
                      );
                    }}
                  />
                ))}
            </>
          );
        }}
      </Canvas>
      <Caption>
        {!rep.known(spec.value)
          ? 'Type a number to place it on the line.'
          : spec.second && !bKnown
            ? `Type the ${rep.variable(spec.second).name.toLowerCase()} to see the jump.`
            : b !== undefined && spec.second
              ? `From ${num(a)} to ${num(b)}: ${num(Math.abs(b - a))} ${b >= a ? (vertical ? 'up' : 'to the right') : vertical ? 'down' : 'to the left'}.`
              : a === 0
                ? '0 is its own opposite. It is 0 from 0.'
                : `${formatNumber(a)} is ${formatNumber(Math.abs(a))} from 0${spec.opposite ? `. Its opposite is ${formatNumber(-a)}` : ''}.`}
      </Caption>
      <Steppers
        calc={calc}
        items={[
          { var: spec.value, steps: [1, 10], pin: spec.second ? [spec.second] : [] },
          ...(spec.second ? [{ var: spec.second, steps: [1, 10], pin: [spec.value] }] : []),
        ]}
      />
    </View>
  );
}

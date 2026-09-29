import { useRef } from 'react';
import { View } from 'react-native';
import Svg, { Circle, G, Line, Rect } from 'react-native-svg';

import type { Representation } from '@/data/modules';
import { formatNumber, fullDecimal } from '@/engine/format';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, Caption, ChartText, DragHandle, fitLabel, useFrozen, useRep } from './common';
import { sup } from './FactorRows';

type Spec = Extract<Representation, { kind: 'powerScale' }>;

export { fullDecimal };

/** Decades drawn on the powers-of-ten ruler: two below the number's, three above. */
const BELOW = 2;
const DECADES = 5;

/**
 * Scientific notation on a powers-of-ten ruler (Grade 8): a log scale marked 10ⁿ⁻², …, 10ⁿ⁺³,
 * the number placed on it inside its decade, and that decade opened up below as a ruler from
 * 1 to 10 (a slide rule), where the mantissa is read: 470,000 sits at 4.7 on the 10⁵ decade,
 * so 470,000 = 4.7 × 10⁵. Drag the point on the lower ruler to change the mantissa, or the
 * point on the upper ruler to move the number to another decade.
 */
export function PowerScale({ spec, calc }: { spec: Spec; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  const start = useRef({ log: 0 });
  const known = rep.known(spec.mantissa) && rep.known(spec.exponent);
  const numberKnown = rep.known(spec.number);
  // The mantissa and exponent, from those values or read off the number.
  const fromNumber = () => {
    const x = Math.max(1e-300, rep.shown(spec.number));
    const e = Math.floor(Math.log10(x) + 1e-12);
    return { a: x / 10 ** e, e };
  };
  const { a, e } = known
    ? {
        a: Math.min(9.9999, Math.max(1, rep.shown(spec.mantissa))),
        e: Math.round(rep.shown(spec.exponent)),
      }
    : fromNumber();
  const drawn = known || numberKnown;
  const lo = useFrozen(e - BELOW);
  const first = lo.value;
  const logA = Math.log10(a);
  const full = known ? fullDecimal(rep.shown(spec.mantissa), e) : rep.value(spec.number, false);
  const aText = rep.known(spec.mantissa) ? rep.value(spec.mantissa, false) : '?';
  const eText = rep.known(spec.exponent) ? sup(e) : '?';

  return (
    <View>
      <Canvas aspect={(w) => 200 / w}>
        {({ w, h }) => {
          const pad = 22;
          const topY = 52;
          const zoomY = 142;
          const decade = (w - 2 * pad) / DECADES;
          // The upper ruler: a log scale, one decade per 10ᵏ.
          const tx = (log: number) => pad + (log - first) * decade;
          // The lower ruler: the number's decade, 1 to 10, as wide as the canvas.
          const zx = (log: number) => pad + log * (w - 2 * pad);
          const inView = e >= first && e < first + DECADES;
          const numberX = tx(e + logA);
          const pointX = zx(logA);
          const minor = [2, 3, 4, 5, 6, 7, 8, 9];
          return (
            <>
              <Svg width={w} height={h}>
                {/* The number's decade, shaded on the upper ruler and opened up below. */}
                {inView ? (
                  <G opacity={drawn ? 1 : 0.35}>
                    <Rect
                      x={tx(e)}
                      y={topY - 7}
                      width={decade}
                      height={14}
                      fill={c.chartSecond}
                      opacity={0.45}
                    />
                    <Line
                      x1={tx(e)}
                      y1={topY + 7}
                      x2={zx(0)}
                      y2={zoomY - 9}
                      stroke={c.chartMuted}
                      strokeWidth={1}
                      strokeDasharray={chart.dash}
                    />
                    <Line
                      x1={tx(e + 1)}
                      y1={topY + 7}
                      x2={zx(1)}
                      y2={zoomY - 9}
                      stroke={c.chartMuted}
                      strokeWidth={1}
                      strokeDasharray={chart.dash}
                    />
                    <Rect
                      x={zx(0)}
                      y={zoomY - 9}
                      width={zx(1) - zx(0)}
                      height={18}
                      fill={c.chartSecond}
                      opacity={0.2}
                    />
                  </G>
                ) : null}
                {/* Upper ruler. */}
                <Line
                  x1={tx(first)}
                  y1={topY}
                  x2={tx(first + DECADES)}
                  y2={topY}
                  stroke={c.chartInk}
                  strokeWidth={chart.stroke}
                />
                {Array.from({ length: DECADES + 1 }, (_, i) => first + i).map((k) => (
                  <G key={`d${k}`}>
                    <Line
                      x1={tx(k)}
                      y1={topY - 8}
                      x2={tx(k)}
                      y2={topY + 8}
                      stroke={c.chartInk}
                      strokeWidth={chart.strokeLight}
                    />
                    <ChartText
                      {...fitLabel(tx(k), `10${sup(k)}`, chart.label, w)}
                      y={topY + 24}
                      fontSize={chart.label}
                      fontWeight={k === e ? '700' : '400'}
                    >
                      {`10${sup(k)}`}
                    </ChartText>
                    {k < first + DECADES
                      ? minor.map((m) => (
                          <Line
                            key={`m${k}-${m}`}
                            x1={tx(k + Math.log10(m))}
                            y1={topY - 3}
                            x2={tx(k + Math.log10(m))}
                            y2={topY + 3}
                            stroke={c.chartMuted}
                            strokeWidth={1}
                          />
                        ))
                      : null}
                  </G>
                ))}
                {inView ? (
                  <G opacity={drawn ? 1 : 0.35}>
                    <Circle
                      cx={numberX}
                      cy={topY}
                      r={6}
                      fill={c.chartHighlight}
                      stroke={c.background}
                      strokeWidth={1.5}
                    />
                    <ChartText
                      {...fitLabel(numberX, full, chart.value, w)}
                      y={topY - 14}
                      fontSize={chart.value}
                      fontWeight="700"
                      fill={c.chartHighlight}
                    >
                      {full}
                    </ChartText>
                  </G>
                ) : null}
                {/* Lower ruler: 1 to 10 on the same log spacing, tenths where there is room. */}
                <Line
                  x1={zx(0)}
                  y1={zoomY}
                  x2={zx(1)}
                  y2={zoomY}
                  stroke={c.chartInk}
                  strokeWidth={chart.stroke}
                />
                {Array.from({ length: 91 }, (_, i) => 1 + i / 10).map((t) => {
                  const whole = Math.abs(t - Math.round(t)) < 1e-9;
                  const half = Math.abs(t * 2 - Math.round(t * 2)) < 1e-9;
                  const gap = zx(Math.log10(t + 0.1)) - zx(Math.log10(t));
                  if (!whole && gap < (half ? 3 : 4)) return null;
                  const len = whole ? 8 : half ? 5 : 3;
                  return (
                    <Line
                      key={`z${Math.round(t * 10)}`}
                      x1={zx(Math.log10(t))}
                      y1={zoomY - len}
                      x2={zx(Math.log10(t))}
                      y2={zoomY + len}
                      stroke={whole ? c.chartInk : c.chartMuted}
                      strokeWidth={whole ? chart.strokeLight : 1}
                    />
                  );
                })}
                {Array.from({ length: 10 }, (_, i) => i + 1).map((t) => (
                  <ChartText
                    key={`zl${t}`}
                    x={zx(Math.log10(t))}
                    y={zoomY + 22}
                    fontSize={chart.label}
                    textAnchor="middle"
                  >
                    {String(t)}
                  </ChartText>
                ))}
                <ChartText
                  x={w / 2}
                  y={zoomY + 44}
                  fontSize={chart.label}
                  fill={c.chartMuted}
                  textAnchor="middle"
                >
                  {`the numbers on this ruler × 10${eText}`}
                </ChartText>
                <G opacity={known ? 1 : 0.35}>
                  <Circle
                    cx={pointX}
                    cy={zoomY}
                    r={6}
                    fill={c.chartHighlight}
                    stroke={c.background}
                    strokeWidth={1.5}
                  />
                  <ChartText
                    {...fitLabel(pointX, `${aText} × 10${eText}`, chart.value, w)}
                    y={zoomY - 16}
                    fontSize={chart.value}
                    fontWeight="700"
                    fill={c.chartHighlight}
                  >
                    {`${aText} × 10${eText}`}
                  </ChartText>
                </G>
              </Svg>
              {known ? (
                <>
                  <DragHandle
                    testID="drag-mantissa"
                    x={pointX}
                    y={zoomY}
                    label={rep.variable(spec.mantissa).name}
                    onStart={() => {
                      start.current = { log: logA };
                      lo.freeze();
                    }}
                    onEnd={lo.release}
                    onMove={(dx) => {
                      const log = Math.min(
                        0.99999,
                        Math.max(0, start.current.log + dx / (w - 2 * pad)),
                      );
                      calc.set(
                        {
                          ...rep.pin([spec.exponent]),
                          [spec.mantissa]: rep.snapTo(
                            spec.mantissa,
                            10 ** log * rep.factor(spec.mantissa),
                          ),
                        },
                        rep.slide(spec.mantissa),
                      );
                    }}
                  />
                  {inView ? (
                    <DragHandle
                      testID="drag-number"
                      x={numberX}
                      y={topY}
                      label={rep.variable(spec.exponent).name}
                      onStart={() => {
                        start.current = { log: e + logA };
                        lo.freeze();
                      }}
                      onEnd={lo.release}
                      onMove={(dx) => {
                        // Whole decades only: the mantissa stays, the exponent moves.
                        const k = Math.round(start.current.log + dx / decade - logA);
                        calc.set(
                          {
                            ...rep.pin([spec.mantissa]),
                            [spec.exponent]: rep.snapTo(
                              spec.exponent,
                              k * rep.factor(spec.exponent),
                            ),
                          },
                          rep.slide(spec.exponent),
                        );
                      }}
                    />
                  ) : null}
                </>
              ) : null}
            </>
          );
        }}
      </Canvas>
      <Caption>
        {known
          ? `${full} = ${aText} × 10${eText} · 10${sup(e)} ≤ ${full} < 10${sup(e + 1)}${Math.abs(e) <= 6 ? ` · 10${sup(e)} = ${fullDecimal(1, e)} · 10${sup(e + 1)} = ${fullDecimal(1, e + 1)}` : ''}`
          : 'Type the number, or the number between 1 and 10 and the power of ten.'}
      </Caption>
    </View>
  );
}

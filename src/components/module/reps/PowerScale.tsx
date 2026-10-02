import { useRef } from 'react';
import { View } from 'react-native';
import Svg, { Circle, G, Line, Rect } from 'react-native-svg';

import type { Representation } from '@/data/modules';
import { fullDecimal } from '@/engine/format';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import {
  Canvas,
  Caption,
  ChartText,
  DragHandle,
  fitLabel,
  useFrozen,
  useRep,
  pinHeld,
} from './common';
import { sup } from './FactorRows';
import { LOG_ROOM, LogScale } from './PowerScaleHsf';

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
  // A second number to compare: the ruler starts low enough to show both when they are
  // within three decades of each other.
  const second =
    spec.second && rep.known(spec.second) && rep.shown(spec.second) > 0
      ? Math.log10(rep.shown(spec.second))
      : undefined;
  const eSecond = second === undefined ? undefined : Math.floor(second + 1e-12);
  const lo = useFrozen(
    eSecond !== undefined && eSecond < e && e - eSecond <= DECADES - 2
      ? eSecond - 1
      : eSecond !== undefined && eSecond > e && eSecond - e > DECADES - BELOW - 1
        ? Math.max(e - BELOW, Math.min(e, eSecond - DECADES + 2))
        : e - BELOW,
  );
  const first = lo.value;
  const logA = Math.log10(a);
  const full = known ? fullDecimal(rep.shown(spec.mantissa), e) : rep.value(spec.number, false);
  const aText = rep.known(spec.mantissa) ? rep.value(spec.mantissa, false) : '?';
  const eText = rep.known(spec.exponent) ? sup(e) : '?';

  return (
    <View>
      <Canvas aspect={(w) => (200 + (spec.log ? LOG_ROOM : 0)) / w}>
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
                {spec.second && second !== undefined
                  ? (() => {
                      // The second number: a hollow marker, or an arrow at the ruler's end.
                      const label = rep.label(spec.second);
                      const left = second < first;
                      const right = second > first + DECADES;
                      const x = left ? tx(first) : right ? tx(first + DECADES) : tx(second);
                      return (
                        <G>
                          {left || right ? (
                            <Line
                              x1={x + (left ? 12 : -12)}
                              y1={topY + 36}
                              x2={x}
                              y2={topY + 36}
                              stroke={c.chartInk}
                              strokeWidth={chart.stroke}
                            />
                          ) : (
                            <Circle
                              cx={x}
                              cy={topY}
                              r={6}
                              fill={c.card}
                              stroke={c.chartInk}
                              strokeWidth={2}
                            />
                          )}
                          <ChartText
                            {...fitLabel(
                              left || right ? x + (left ? 16 : -16) : x,
                              left ? `← ${label}` : right ? `${label} →` : label,
                              chart.small,
                              w,
                              left ? 'start' : right ? 'end' : 'middle',
                            )}
                            y={topY + 40}
                            fontSize={chart.small}
                            fontWeight="600"
                          >
                            {left ? `← ${label}` : right ? `${label} →` : label}
                          </ChartText>
                        </G>
                      );
                    })()
                  : null}
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
                {/* Grades 9–12: the log scale under the 1–10 ruler (PowerScaleHsf.tsx). */}
                {spec.log ? (
                  <LogScale zx={zx} y={zoomY} logA={logA} pointX={pointX} w={w} known={known} />
                ) : null}
                <ChartText
                  x={w / 2}
                  // Under the 1–10 ruler it is about (the log ruler has its own line).
                  y={zoomY + 40}
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
              {known && !spec.fixed ? (
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
                      const m = rep.snapTo(spec.mantissa, 10 ** log * rep.factor(spec.mantissa));
                      calc.set(
                        {
                          ...pinHeld(calc, rep, [spec.exponent], { [spec.mantissa]: m }),
                          [spec.mantissa]: m,
                        },
                        rep.slide(spec.mantissa),
                      );
                    }}
                  />
                  {/* Mid-drag (the scale held) it stays mounted past the view, on its edge. */}
                  {inView || lo.frozen ? (
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
                        const ex = rep.snapTo(spec.exponent, k * rep.factor(spec.exponent));
                        // A worked-out exponent (from the typed number) moves the number, the
                        // mantissa held: 4.7 × 10⁵ → 4.7 × 10⁶.
                        calc.set(
                          {
                            ...(rep.typed(spec.exponent)
                              ? pinHeld(calc, rep, [spec.mantissa], { [spec.exponent]: ex })
                              : rep.pin([spec.mantissa])),
                            [spec.exponent]: ex,
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
        {known && spec.log
          ? logCaption(
              full,
              aText,
              e,
              logA,
              rep.known(spec.log) ? rep.value(spec.log, false) : undefined,
            )
          : known
            ? `${full} = ${aText} × 10${eText} · 10${sup(e)} ≤ ${full} < 10${sup(e + 1)}${Math.abs(e) <= 6 ? ` · 10${sup(e)} = ${fullDecimal(1, e)} · 10${sup(e + 1)} = ${fullDecimal(1, e + 1)}` : ''}`
            : 'Type the number, or the number between 1 and 10 and the power of ten.'}
      </Caption>
    </View>
  );
}

/** log₁₀ 470,000 = 5 + log₁₀ 4.7 ≈ 5 + 0.672 = 5.672: the exponent, then the mantissa's log. */
function logCaption(full: string, a: string, e: number, logA: number, typed?: string) {
  const minus = (x: string) => x.replace(/^-/, '−');
  const total = minus((e + logA).toFixed(3));
  const k = minus(String(e));
  return [
    `${full} = ${a} × 10${sup(e)}, so its log is ${k} plus the log of ${a}.`,
    `log₁₀ ${full} = ${k} + log₁₀ ${a} ≈ ${k} + ${logA.toFixed(3)} = ${typed ?? total}`,
    'The power of ten gives the whole part; the ruler gives the decimal part.',
  ].join(' · ');
}

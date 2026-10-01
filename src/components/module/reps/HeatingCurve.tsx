import { useRef } from 'react';
import { View } from 'react-native';
import Svg, { Circle, Defs, G, Line, Polyline, Rect } from 'react-native-svg';

import type { Representation } from '@/data/modules';
import { formatNumber } from '@/engine/format';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { heatingCorners, heatingPart, heatingTemp } from './chem';
import { Canvas, Caption, ChartText, DragHandle, fitLabel, niceCeil, useRep } from './common';
import { MoleculeArt, useAtomPaint } from './MoleculeArt';
import { Ball, usePaintIds, url } from './paint';

type Spec = Extract<Representation, { kind: 'heatingCurve' }>;

/** A tick step giving about 4–7 ticks over a range. */
const tickStep = (range: number) => {
  const s = niceCeil(range / 6);
  return s;
};

/** Fixed spots for the particles in the little box, as fractions of it, by part of the curve. */
const SOLID: [number, number][] = [0, 1, 2, 3].flatMap((i) =>
  [0, 1, 2].map((j) => [0.2 + i * 0.2, 0.84 - j * 0.22] as [number, number]),
);
const LIQUID: [number, number][] = [
  [0.14, 0.86],
  [0.34, 0.84],
  [0.55, 0.87],
  [0.76, 0.83],
  [0.9, 0.66],
  [0.24, 0.64],
  [0.46, 0.66],
  [0.68, 0.62],
  [0.1, 0.46],
  [0.36, 0.44],
  [0.58, 0.45],
  [0.8, 0.45],
];
const GAS: [number, number][] = [
  [0.12, 0.2],
  [0.5, 0.12],
  [0.86, 0.26],
  [0.3, 0.42],
  [0.68, 0.5],
  [0.1, 0.72],
  [0.46, 0.8],
  [0.88, 0.84],
  [0.26, 0.9],
  [0.62, 0.3],
  [0.84, 0.6],
  [0.4, 0.6],
];
const spotsFor = (part: number): [number, number][] =>
  part === 0
    ? SOLID
    : part === 1
      ? [
          ...SOLID.slice(0, 6),
          ...LIQUID.slice(0, 4).map(([x, y]) => [x * 0.5 + 0.5, y] as [number, number]),
          [0.62, 0.45],
          [0.84, 0.45],
        ]
      : part === 2
        ? LIQUID
        : part === 3
          ? [...LIQUID.slice(0, 8), [0.2, 0.12], [0.55, 0.2], [0.85, 0.1], [0.4, 0.3]]
          : GAS;

/**
 * A heating curve (Grade 7): temperature against time as a substance is heated at a steady
 * rate. It rises while the solid, liquid or gas warms and runs flat while it melts and boils,
 * each flat step named and its temperature dashed across to the axis. With `at`, a point on
 * the curve at that time (drag it along the curve) with its time and temperature, and a box
 * of the particles as they are then: packed, loosening, sliding, bubbling off, far apart.
 */
export function HeatingCurve({ spec, calc }: { spec: Spec; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  const paint = useAtomPaint();
  const ids = usePaintIds('ball');
  const start = useRef(0);
  // Fixed numbers are in the formula units; everything is drawn in the units the time and
  // temperature values are shown in (a time typed in hours puts hours on the axis).
  const timeRef = spec.at ?? spec.spans.find((x): x is string => typeof x === 'string');
  const tempRef =
    spec.temp ??
    [spec.start, spec.melt, spec.boil, spec.end].find((x): x is string => typeof x === 'string');
  const fT = timeRef ? rep.factor(timeRef) : 1;
  const fY = tempRef ? rep.factor(tempRef) : 1;
  const read = (v: string | number, f: number) =>
    typeof v === 'number'
      ? { value: v / f, known: true, text: formatNumber(Number((v / f).toFixed(9))) }
      : { value: rep.shown(v), known: rep.known(v), text: rep.value(v, false) };
  const vals = [
    spec.start,
    spec.melt,
    spec.boil,
    ...(spec.end === undefined ? [] : [spec.end]),
  ].map((v) => read(v, fY));
  const spans = spec.spans.slice(0, spec.end === undefined ? 4 : 5).map((v) => read(v, fT));
  const known = [...vals, ...spans].every((v) => v.known);
  const [s, m, b, e] = vals.map((v) => v.value);
  const corners = heatingCorners(
    s!,
    m!,
    b!,
    spans.map((x) => Math.max(0, x.value)),
    e,
  );
  const total = corners[corners.length - 1]![0];
  const tempUnit = (tempRef ? rep.unit(tempRef) : undefined) ?? spec.units?.temp ?? '°C';
  const timeUnit = (timeRef ? rep.unit(timeRef) : undefined) ?? spec.units?.time ?? 'min';
  // A curve against energy (J, kJ, cal) has heat added on its axis, not time.
  const heat = ['J', 'kJ', 'MJ', 'cal', 'kcal'].includes(timeUnit);
  const axisName = heat ? 'Heat added' : 'Time';
  const names = spec.names ?? ['solid', 'liquid', 'gas'];
  const partNames = [names[0], 'melting', names[1], 'boiling', names[2]];
  const withUnit = (x: string, u: string) => `${x}${u === '°' ? '' : ' '}${u}`;
  const tempText = (v: { text: string }) => withUnit(v.text, tempUnit);
  const at = spec.at ? read(spec.at, fT) : undefined;
  const t = at ? Math.min(total, Math.max(0, at.value)) : undefined;
  const part = t === undefined ? undefined : heatingPart(corners, t);
  const y = t === undefined ? undefined : heatingTemp(corners, t);
  const tempAt = spec.temp && rep.known(spec.temp) ? rep.value(spec.temp, false) : undefined;
  const yText = y === undefined ? '?' : (tempAt ?? formatNumber(Number(y.toFixed(6))));

  const lo = Math.min(0, s!);
  const hi = Math.max(b!, e ?? b!);
  const step = tickStep(hi - lo);
  const yMin =
    Math.floor(lo / step) * step -
    (Math.abs(lo - Math.floor(lo / step) * step) < step / 3 ? step : 0);
  const yMax =
    Math.ceil(hi / step) * step + (Math.ceil(hi / step) * step - hi < step / 3 ? step : 0);
  const tStep = tickStep(total);
  const tMax = Math.ceil(total / tStep) * tStep;

  const drag = (w: number) => (dx: number) => {
    if (!spec.at) return;
    const scale = (w - 56) / tMax;
    const next = Math.min(total, Math.max(0, start.current + dx / scale));
    calc.set({ [spec.at]: rep.snapTo(spec.at, next * rep.factor(spec.at)) }, rep.slide(spec.at));
  };

  const atWords = at
    ? heat
      ? `After ${withUnit(at.text, timeUnit)} of heat`
      : `At ${withUnit(at.text, timeUnit)}`
    : '';

  return (
    <View>
      <Canvas aspect={0.78}>
        {({ w, h }) => {
          const L = 44;
          const R = 12;
          const T = 12;
          const B = 40;
          const sx = (x: number) => L + (x / tMax) * (w - L - R);
          const sy = (v: number) => T + ((yMax - v) / (yMax - yMin)) * (h - T - B);
          const pts = corners.map(([x, v]) => `${sx(x)},${sy(v)}`).join(' ');
          const flats = [1, 3].filter((i) => i + 1 < corners.length);
          const px = t === undefined ? 0 : sx(t);
          const py = y === undefined ? 0 : sy(y);
          // The particle box, with its name under it, in a corner the curve stays out of.
          const bw = 96;
          const bh = 62;
          const clear = (x: number, y0: number) =>
            Array.from({ length: 121 }, (_, k) => (k / 120) * total).every((u) => {
              const [qx, qy] = [sx(u), sy(heatingTemp(corners, u))];
              return qx < x - 8 || qx > x + bw + 8 || qy < y0 - 8 || qy > y0 + bh + 26;
            });
          const spots = [
            { x: w - R - bw - 8, y: h - B - bh - 24 },
            { x: L + 8, y: T + 6 },
            { x: w - R - bw - 8, y: T + 6 },
          ];
          const box = { ...(spots.find((p) => clear(p.x, p.y)) ?? spots[0]!), w: bw, h: bh };
          const tw = (text: string, size: number) => text.length * size * 0.58;
          /** A label centered at x, kept inside the plot. */
          const inPlot = (x: number, text: string, size: number) =>
            Math.min(w - R - tw(text, size) / 2, Math.max(L + tw(text, size) / 2 + 2, x));
          const particle = part === undefined ? undefined : spotsFor(part);
          return (
            <>
              <Svg width={w} height={h}>
                <Defs>
                  {paint.defs}
                  <Ball id={ids.ball} color={c.water} />
                </Defs>
                {/* Grid and numbered axes. */}
                {Array.from(
                  { length: Math.round((yMax - yMin) / step) + 1 },
                  (_, i) => yMin + i * step,
                ).map((v) => (
                  <G key={`y${v}`}>
                    <Line
                      x1={L}
                      y1={sy(v)}
                      x2={w - R}
                      y2={sy(v)}
                      stroke={c.chartGrid}
                      strokeWidth={1}
                    />
                    <ChartText
                      x={L - 5}
                      y={sy(v) + 4}
                      fontSize={chart.small}
                      textAnchor="end"
                      fill={c.chartMuted}
                    >
                      {formatNumber(v)}
                    </ChartText>
                  </G>
                ))}
                {Array.from({ length: Math.round(tMax / tStep) + 1 }, (_, i) => i * tStep).map(
                  (x) => (
                    <G key={`x${x}`}>
                      <Line
                        x1={sx(x)}
                        y1={T}
                        x2={sx(x)}
                        y2={h - B}
                        stroke={c.chartGrid}
                        strokeWidth={1}
                      />
                      <ChartText
                        // The last number slides in from the edge instead of being cut.
                        {...fitLabel(sx(x), formatNumber(x), chart.small, w)}
                        y={h - B + 15}
                        fontSize={chart.small}
                        fill={c.chartMuted}
                      >
                        {formatNumber(x)}
                      </ChartText>
                    </G>
                  ),
                )}
                <Line
                  x1={L}
                  y1={h - B}
                  x2={w - R}
                  y2={h - B}
                  stroke={c.chartInk}
                  strokeWidth={chart.strokeLight}
                />
                <Line
                  x1={L}
                  y1={T}
                  x2={L}
                  y2={h - B}
                  stroke={c.chartInk}
                  strokeWidth={chart.strokeLight}
                />
                <ChartText x={(L + w - R) / 2} y={h - 6} fontSize={chart.label} textAnchor="middle">
                  {`${axisName} (${timeUnit})`}
                </ChartText>
                <ChartText
                  x={12}
                  y={(T + h - B) / 2}
                  fontSize={chart.label}
                  textAnchor="middle"
                  transform={`rotate(-90 12 ${(T + h - B) / 2})`}
                >
                  {`Temperature (${tempUnit})`}
                </ChartText>
                <G opacity={known ? 1 : 0.35}>
                  {/* The melting and boiling points dashed across to the axis. */}
                  {flats.map((i) => (
                    <Line
                      key={`d${i}`}
                      x1={L}
                      y1={sy(corners[i]![1])}
                      x2={sx(corners[i]![0])}
                      y2={sy(corners[i]![1])}
                      stroke={c.chartMuted}
                      strokeWidth={1}
                      strokeDasharray={chart.dash}
                    />
                  ))}
                  <Polyline
                    points={pts}
                    fill="none"
                    stroke={c.chartHighlight}
                    strokeWidth={chart.strokeHeavy}
                    strokeLinejoin="round"
                  />
                  {flats.map((i) => {
                    const [x0, v] = corners[i]!;
                    const x1 = corners[i + 1]![0];
                    const text = `${partNames[i]} at ${tempText(vals[i === 1 ? 1 : 2]!)}`;
                    return (
                      <G key={`f${i}`}>
                        <Line
                          x1={sx(x0)}
                          y1={sy(v)}
                          x2={sx(x1)}
                          y2={sy(v)}
                          stroke={c.chartSecond}
                          strokeWidth={chart.strokeHeavy + 2}
                          strokeLinecap="round"
                        />
                        <ChartText
                          // Melting: over its step, ending at its right end (the solid's
                          // name sits under the step's left end, the rising line leaves from
                          // its right end upward); boiling: over its step, centred.
                          {...(i === 1
                            ? {
                                x: Math.max(L + 4 + tw(text, chart.label), sx(x1) - 4),
                                textAnchor: 'end' as const,
                              }
                            : { x: inPlot((sx(x0) + sx(x1)) / 2, text, chart.label) })}
                          y={sy(v) - 8}
                          fontSize={chart.label}
                          fontWeight="700"
                        >
                          {text}
                        </ChartText>
                      </G>
                    );
                  })}
                  {/* The state on each warming stretch, beside its middle. */}
                  {[0, 2, 4]
                    .filter((i) => i + 1 < corners.length && corners[i + 1]![0] > corners[i]![0])
                    .map((i) => {
                      const mx = (sx(corners[i]![0]) + sx(corners[i + 1]![0])) / 2;
                      const my = (sy(corners[i]![1]) + sy(corners[i + 1]![1])) / 2;
                      const text = partNames[i]!;
                      return (
                        <ChartText
                          key={`n${i}`}
                          {...fitLabel(mx + 8, text, chart.label, w, 'start', 8)}
                          y={my + 12}
                          fontSize={chart.label}
                          fill={c.chartMuted}
                        >
                          {text}
                        </ChartText>
                      );
                    })}
                </G>
                {t !== undefined && y !== undefined ? (
                  <G opacity={at!.known ? 1 : 0.35}>
                    <Line
                      x1={px}
                      y1={py}
                      x2={px}
                      y2={h - B}
                      stroke={c.chartInk}
                      strokeWidth={1}
                      strokeDasharray={chart.dashFine}
                    />
                    <Line
                      x1={L}
                      y1={py}
                      x2={px}
                      y2={py}
                      stroke={c.chartInk}
                      strokeWidth={1}
                      strokeDasharray={chart.dashFine}
                    />
                    <Circle
                      cx={px}
                      cy={py}
                      r={6}
                      fill={c.chartHighlight}
                      stroke={c.card}
                      strokeWidth={1.5}
                    />
                    <ChartText
                      // On a flat step: under it. On a rising stretch: up and to the left, clear
                      // of the line (the state's name is on its right).
                      {...(part === 1 || part === 3
                        ? fitLabel(px, withUnit(yText, tempUnit), chart.value, w)
                        : fitLabel(px - 10, withUnit(yText, tempUnit), chart.value, w, 'end', 10))}
                      y={py + (part === 1 || part === 3 ? 22 : -8)}
                      fontSize={chart.value}
                      fontWeight="700"
                      fill={c.chartHighlight}
                    >
                      {withUnit(yText, tempUnit)}
                    </ChartText>
                  </G>
                ) : null}
                {particle && part !== undefined ? (
                  <G opacity={at!.known ? 1 : 0.35}>
                    <Rect
                      x={box.x}
                      y={box.y}
                      width={box.w}
                      height={box.h}
                      rx={4}
                      fill={c.card}
                      stroke={c.chartInk}
                      strokeWidth={chart.strokeLight}
                    />
                    {particle.map(([fx, fy], k) =>
                      spec.formula ? (
                        <MoleculeArt
                          key={k}
                          formula={spec.formula}
                          cx={box.x + 6 + fx * (box.w - 12)}
                          cy={box.y + 4 + fy * (box.h - 10)}
                          scale={7}
                          ids={paint.ids}
                          symbols={false}
                        />
                      ) : (
                        <Circle
                          key={k}
                          cx={box.x + 6 + fx * (box.w - 12)}
                          cy={box.y + 4 + fy * (box.h - 10)}
                          r={5}
                          fill={url(ids.ball)}
                          stroke={c.chartInk}
                          strokeWidth={0.75}
                        />
                      ),
                    )}
                    <ChartText
                      x={box.x + box.w / 2}
                      y={box.y + box.h + 15}
                      fontSize={chart.label}
                      fontWeight="700"
                      textAnchor="middle"
                    >
                      {partNames[part]!}
                    </ChartText>
                  </G>
                ) : null}
              </Svg>
              {spec.at && at?.known ? (
                <DragHandle
                  testID="drag-time"
                  x={px}
                  y={py}
                  label={rep.variable(spec.at).name}
                  onStart={() => {
                    start.current = t ?? 0;
                  }}
                  onMove={(dx) => drag(w)(dx)}
                />
              ) : null}
            </>
          );
        }}
      </Canvas>
      <Caption>
        {[
          `Melting point = ${tempText(vals[1]!)}`,
          `Boiling point = ${tempText(vals[2]!)}`,
          `${axisName} = ${spans.map((x) => x.text).join(' + ')} = ${known ? withUnit(formatNumber(Number(total.toFixed(6))), timeUnit) : '?'}`,
          ...(t !== undefined && part !== undefined
            ? [
                part === 1 || part === 3
                  ? `${atWords} it is ${partNames[part]}: the temperature stays at ${withUnit(yText, tempUnit)}`
                  : `${atWords} the ${partNames[part]} is at ${withUnit(yText, tempUnit)}`,
              ]
            : []),
        ].join(' · ')}
      </Caption>
    </View>
  );
}

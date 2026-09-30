/**
 * Acids and bases (H55, Grades 9–12 chemistry): the pH scale from 0 to 14 in universal-indicator
 * colors with the pH marked and [H⁺] as a power of ten under it; or a titration curve, the pH
 * against the base added, worked from the exact charge balance, with the equivalence point.
 */
import { useRef } from 'react';
import { View } from 'react-native';
import Svg, { Circle, G, Line, Path, Polyline, Rect } from 'react-native-svg';

import type { PhScaleSpec } from '@/data/modules/typesHsj';
import type { NumOrVar } from '@/data/modules/typesGraphs';
import { formatNumber } from '@/engine/format';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, Caption, ChartText, DragHandle, fitLabel, useFrozen, useRep } from './common';
import { MathChip } from './hsdText';
import { axisOf, makePlot, PlotFrame } from './hsjPlot';
import { EVERYDAY, equivalenceVolume, indicatorColor, titrationPH } from './phModel';

type Rep = ReturnType<typeof useRep>;
type Scale = Exclude<PhScaleSpec, { mode: 'titration' }>;
type Titration = Extract<PhScaleSpec, { mode: 'titration' }>;

const RAISED: Record<string, string> = {
  '0': '⁰',
  '1': '¹',
  '2': '²',
  '3': '³',
  '4': '⁴',
  '5': '⁵',
  '6': '⁶',
  '7': '⁷',
  '8': '⁸',
  '9': '⁹',
  '-': '⁻',
};
/** 10 to a whole power, raised: 10⁻⁴. */
const tenTo = (n: number) =>
  `10${String(n)
    .split('')
    .map((ch) => RAISED[ch] ?? ch)
    .join('')}`;
const fmt = (x: number) => formatNumber(Number(x.toPrecision(4)));

const readOf = (rep: Rep) => (x: NumOrVar) =>
  typeof x === 'number'
    ? { value: x, known: true, text: formatNumber(x), id: undefined as string | undefined }
    : { value: rep.shown(x), known: rep.known(x), text: rep.value(x, false), id: x };

export function PhScale({ spec, calc }: { spec: PhScaleSpec; calc: Calculator }) {
  const rep = useRep(calc);
  return spec.mode === 'titration' ? (
    <TitrationView spec={spec} rep={rep} calc={calc} />
  ) : (
    <ScaleView spec={spec} rep={rep} calc={calc} />
  );
}

function ScaleView({ spec, rep, calc }: { spec: Scale; rep: Rep; calc: Calculator }) {
  const c = usePalette();
  const read = readOf(rep);
  const start = useRef(0);
  const ph = read(spec.pH);
  const x = Math.min(14, Math.max(0, ph.value));
  const h = 10 ** -ph.value;
  const phId = typeof spec.pH === 'string' ? spec.pH : undefined;
  const others = [spec.hydrogen, spec.hydroxide, spec.pOH].filter(
    (v): v is string => typeof v === 'string',
  );
  const top = spec.examples ? 40 : 14;
  return (
    <View>
      <Canvas aspect={(w) => (top + 150) / w}>
        {({ w }) => {
          const L = 16;
          const cell = (w - 2 * L) / 15;
          const sx = (v: number) => L + (v + 0.5) * cell;
          const barH = 26;
          const numbersY = top + barH + 16;
          const pointerY = numbersY + 8;
          return (
            <>
              <Svg width={w} height={top + 150}>
                {spec.examples
                  ? EVERYDAY.map((e) => (
                      <G key={e.name}>
                        <Line
                          x1={sx(e.pH)}
                          y1={e.row === 0 ? 18 : 34}
                          x2={sx(e.pH)}
                          y2={top}
                          stroke={c.chartMuted}
                          strokeWidth={1}
                        />
                        <ChartText
                          {...fitLabel(sx(e.pH), e.name, chart.label, w)}
                          y={e.row === 0 ? 12 : 28}
                          fontSize={chart.label}
                          fill={c.chartMuted}
                        >
                          {e.name}
                        </ChartText>
                      </G>
                    ))
                  : null}
                {/* The fifteen colors of universal indicator, 0 to 14. */}
                {Array.from({ length: 15 }, (_, i) => (
                  <G key={i}>
                    <Rect
                      x={L + i * cell}
                      y={top}
                      width={cell}
                      height={barH}
                      fill={indicatorColor(i, c)}
                    />
                    <ChartText
                      x={sx(i)}
                      y={numbersY}
                      textAnchor="middle"
                      fontSize={chart.label}
                      fontWeight={i === 7 ? '700' : '400'}
                    >
                      {String(i)}
                    </ChartText>
                    {i % 2 === 0 ? (
                      <ChartText
                        x={sx(i)}
                        y={top + barH + 88}
                        textAnchor="middle"
                        fontSize={chart.label}
                        fill={c.chartMuted}
                      >
                        {tenTo(-i)}
                      </ChartText>
                    ) : null}
                  </G>
                ))}
                <Rect
                  x={L}
                  y={top}
                  width={cell * 15}
                  height={barH}
                  fill="none"
                  stroke={c.chartInk}
                  strokeWidth={1}
                />
                <G opacity={ph.known ? 1 : 0.4}>
                  {/* The pH marked through the bar, and a pointer under the numbers. */}
                  <Line
                    x1={sx(x)}
                    y1={top - 4}
                    x2={sx(x)}
                    y2={top + barH + 4}
                    stroke={c.card}
                    strokeWidth={5}
                  />
                  <Line
                    x1={sx(x)}
                    y1={top - 4}
                    x2={sx(x)}
                    y2={top + barH + 4}
                    stroke={c.chartInk}
                    strokeWidth={2.5}
                  />
                  <Path d={`M ${sx(x)} ${pointerY} l -7 12 l 14 0 Z`} fill={c.chartInk} />
                  <ChartText
                    {...fitLabel(sx(x), `pH ${ph.text}`, chart.value, w)}
                    y={pointerY + 30}
                    fontSize={chart.value}
                    fontWeight="700"
                  >
                    {`pH ${ph.text}`}
                  </ChartText>
                </G>
                <ChartText x={L} y={top + barH + 108} fontSize={chart.label} fill={c.chartMuted}>
                  [H⁺] in mol/L at each pH
                </ChartText>
                <ChartText x={L} y={top + barH + 124} fontSize={chart.label} fontWeight="700">
                  ← acidic
                </ChartText>
                <ChartText
                  x={sx(7)}
                  y={top + barH + 124}
                  textAnchor="middle"
                  fontSize={chart.label}
                  fontWeight="700"
                >
                  neutral
                </ChartText>
                <ChartText
                  x={w - L}
                  y={top + barH + 124}
                  textAnchor="end"
                  fontSize={chart.label}
                  fontWeight="700"
                >
                  basic →
                </ChartText>
              </Svg>
              {phId && !spec.fixed ? (
                <DragHandle
                  testID="drag-ph"
                  x={sx(x)}
                  y={pointerY + 8}
                  label="the pH"
                  onStart={() => {
                    start.current = ph.value;
                  }}
                  onMove={(dx) => {
                    const next = Math.min(14, Math.max(0, start.current + dx / cell));
                    calc.set(
                      {
                        ...(spec.keep ? rep.pin(spec.keep) : {}),
                        [phId]: rep.snapTo(phId, next * rep.factor(phId)),
                      },
                      rep.slide(phId),
                    );
                  }}
                />
              ) : null}
            </>
          );
        }}
      </Canvas>
      <Caption>
        {[
          `Since pH = −log₁₀[H⁺], here [H⁺] = ${Number.isInteger(ph.value) ? tenTo(-ph.value) : `10^−${ph.text}`} = ${formatNumber(h)} mol/L.`,
          ph.value < 7 - 1e-9
            ? 'Below 7: acidic.'
            : ph.value > 7 + 1e-9
              ? `Above 7: basic. pOH = 14 − pH = ${fmt(14 - ph.value)}.`
              : 'At 7: neutral, [H⁺] = [OH⁻].',
          ...(others.length && !ph.known ? ['Type a value to mark it.'] : []),
        ].join(' · ')}
      </Caption>
    </View>
  );
}

function TitrationView({ spec, rep, calc }: { spec: Titration; rep: Rep; calc: Calculator }) {
  const c = usePalette();
  const read = readOf(rep);
  const start = useRef(0);
  const [ca, va, cb, vb] = [
    read(spec.acid.concentration),
    read(spec.acid.volume),
    read(spec.base.concentration),
    read(spec.added),
  ];
  const ka = spec.acid.Ka === undefined ? undefined : read(spec.acid.Ka);
  const veq = equivalenceVolume(ca.value, va.value, cb.value);
  const live = axisOf(0, Math.max(Number.isFinite(veq) ? veq * 2 : 1, vb.value * 1.1, 1), 5);
  const xFrame = useFrozen(live);
  const xa = xFrame.value;
  const phAt = (v: number) => titrationPH(ca.value, va.value, cb.value, v, ka?.value);
  const unit = (typeof spec.added === 'string' ? rep.unit(spec.added) : undefined) ?? 'mL';
  const known = ca.known && va.known && cb.known && (ka?.known ?? true);
  const addedId = typeof spec.added === 'string' ? spec.added : undefined;
  const acid = spec.acid.name ?? 'acid';
  const base = spec.base.name ?? 'base';
  const phEq = Number.isFinite(veq) ? phAt(veq) : undefined;
  const phNow = phAt(Math.max(0, vb.value));

  return (
    <View>
      <Canvas aspect={0.86}>
        {({ w, h }) => {
          const p = makePlot(w, h, xa, { lo: 0, hi: 14, step: 2 }, { L: 44, R: 16, B: 40 });
          const n = 240;
          const pts = Array.from({ length: n + 1 }, (_, k) => (xa.hi * k) / n)
            .map((v) => `${p.sx(v)},${p.sy(phAt(v))}`)
            .join(' ');
          const strip = Array.from({ length: 28 }, (_, k) => k / 2);
          return (
            <>
              <Svg width={w} height={h}>
                <PlotFrame p={p} xName={`${base} added (${unit})`} yName="pH" />
                {/* The indicator's color at each pH, up the pH axis. */}
                {strip.map((v) => (
                  <Rect
                    key={v}
                    x={p.L + 1}
                    y={p.sy(v + 0.5)}
                    width={7}
                    height={p.sy(v) - p.sy(v + 0.5) + 0.5}
                    fill={indicatorColor(v + 0.25, c)}
                  />
                ))}
                <G opacity={known ? 1 : 0.4}>
                  <Polyline
                    points={pts}
                    fill="none"
                    stroke={c.chartHighlight}
                    strokeWidth={chart.strokeHeavy}
                    strokeLinejoin="round"
                  />
                  {phEq !== undefined && veq <= xa.hi ? (
                    <G>
                      <Line
                        x1={p.sx(veq)}
                        y1={p.sy(0)}
                        x2={p.sx(veq)}
                        y2={p.sy(phEq)}
                        stroke={c.chartMuted}
                        strokeWidth={1.5}
                        strokeDasharray={chart.dash}
                      />
                      <Circle
                        cx={p.sx(veq)}
                        cy={p.sy(phEq)}
                        r={5}
                        fill={c.card}
                        stroke={c.chartInk}
                        strokeWidth={2}
                      />
                      <MathChip
                        x={p.sx(veq) + 8}
                        y={p.sy(phEq) + 4}
                        text={`equivalence: pH ${fmt(phEq)}`}
                        anchor="start"
                        bold={false}
                        w={w}
                        h={h}
                      />
                    </G>
                  ) : null}
                  {ka && Number.isFinite(veq) ? (
                    <G>
                      <Circle
                        cx={p.sx(veq / 2)}
                        cy={p.sy(phAt(veq / 2))}
                        r={4.5}
                        fill={c.card}
                        stroke={c.chartMuted}
                        strokeWidth={2}
                      />
                      <MathChip
                        x={p.sx(veq / 2)}
                        y={p.sy(phAt(veq / 2)) - 12}
                        text={`half-way: pH ${fmt(phAt(veq / 2))}${Math.abs(phAt(veq / 2) + Math.log10(ka.value)) < 0.05 ? ' = pKₐ' : ''}`}
                        anchor="middle"
                        bold={false}
                        w={w}
                        h={h}
                      />
                    </G>
                  ) : null}
                </G>
                <G opacity={vb.known && known ? 1 : 0.4}>
                  <Circle
                    cx={p.sx(vb.value)}
                    cy={p.sy(phNow)}
                    r={6}
                    fill={c.chartSecond}
                    stroke={c.chartInk}
                    strokeWidth={1}
                  />
                  {/* Its pH, unless the half-way point beside it already says it. */}
                  {!ka || Math.abs(p.sx(vb.value) - p.sx(veq / 2)) > 60 ? (
                    <MathChip
                      x={p.sx(vb.value) + (vb.value > veq ? -10 : 10)}
                      y={p.sy(phNow) + (phNow > 7 ? 20 : -10)}
                      text={`pH ${fmt(phNow)}`}
                      anchor={vb.value > veq ? 'end' : 'start'}
                      w={w}
                      h={h}
                    />
                  ) : null}
                </G>
              </Svg>
              {addedId && !spec.fixed ? (
                <DragHandle
                  testID="drag-added"
                  x={p.sx(vb.value)}
                  y={p.sy(phNow)}
                  label="the base added"
                  onStart={() => {
                    start.current = vb.value;
                    xFrame.freeze();
                  }}
                  onMove={(dx) => {
                    const perPx = (xa.hi - xa.lo) / (w - p.L - p.R);
                    const next = Math.min(xa.hi, Math.max(0, start.current + dx * perPx));
                    calc.set(
                      {
                        ...(spec.keep ? rep.pin(spec.keep) : {}),
                        [addedId]: rep.snapTo(addedId, next * rep.factor(addedId)),
                      },
                      rep.slide(addedId),
                    );
                  }}
                  onEnd={xFrame.release}
                />
              ) : null}
            </>
          );
        }}
      </Canvas>
      <Caption>
        {[
          `The ${acid} is used up at ${fmt(veq)} ${unit} of ${base}, where the pH is ${phEq === undefined ? '?' : fmt(phEq)}${ka ? ': above 7, since the acid’s partner base is left' : ''}.`,
          `After ${vb.text} ${unit} of ${base}, the pH is ${fmt(phNow)}.`,
        ].join(' · ')}
      </Caption>
    </View>
  );
}

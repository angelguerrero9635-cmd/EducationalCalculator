import { useRef, type ReactNode } from 'react';
import { View } from 'react-native';
import Svg, { Circle, Defs, G, Line, Path, Rect } from 'react-native-svg';

import type { Representation } from '@/data/modules';
import { formatNumber } from '@/engine/format';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { BoxShadow, Sheen, TopLight, url, usePaintIds } from './paint';
import { Canvas, ChartText, DragHandle, nowrap, useFrozen, useRep, Caption } from './common';
import { Steppers } from './Steppers';
import { WoodStick } from './wood';

type Spec = Extract<Representation, { kind: 'ruler' }>;

/** Sizes: a ribbon, the name line above it, the gap between rows, and the ruler. */
const RIBBON = 18;
const NAME_H = 18;
const ROW_GAP = 6;
const RULER = 36;
/** The row of counted spaces under a broken ruler. */
const COUNT_H = 28;

/**
 * Ribbons laid on a wooden ruler marked in the shown unit, all starting at 0 (or, on a broken
 * ruler, at a later mark). The last ribbon lies flush on the ruler's top edge; dashed guides
 * drop from every ribbon end to its mark, and two ribbons' difference is bracketed. On a broken
 * ruler the spaces the ribbon covers are shaded and counted 1, 2, 3 … under it. Drag a ribbon's
 * end to change its length.
 */
export function Ruler({ spec, calc }: { spec: Spec; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  const start = useRef(0);
  const unit = rep.unit(spec.lengths[0]!) ?? '';
  // Lengths counted in half or quarter marks are drawn in whole units (numbers on the ruler).
  // A variable id reads the marks per unit from that value (halves or quarters, chosen).
  const per =
    typeof spec.marks === 'string'
      ? Math.max(1, Math.round(rep.shown(spec.marks)) || 1)
      : (spec.marks ?? 1);
  const shown = spec.lengths.map((id) => rep.shown(id) / per);
  // A broken ruler: the object starts at a mark other than 0, and the ruler is broken off one
  // mark before it.
  const offset = spec.from ? rep.shown(spec.from) / per : 0;
  const first = spec.from ? Math.max(0, Math.floor(offset) - 1) : 0;
  const fit = useFrozen(Math.max(spec.extent, Math.ceil(offset + Math.max(...shown))));
  const n = spec.lengths.length;
  // Room at the ruler's left end for the unit ("cm") printed on it.
  const UNIT_W = unit ? Math.max(30, unit.length * chart.label * 0.65 + 18) : 12;
  const broken = !!spec.from && first > 0;

  /** "Longest to shortest: Red (a) 9, Blue (b) 6, Green (c) 4." */
  const order = () =>
    `Longest to shortest: ${spec.lengths
      .map((id, i) => ({ id, x: shown[i]! * per }))
      .sort((p, q) => q.x - p.x)
      .map((p) => `${rep.variable(p.id).name} ${formatNumber(p.x)}`)
      .join(', ')}.`;

  /** "Ribbon A is 4 cm longer than ribbon B." */
  const compare = () => {
    const [a, b] = spec.lengths as [string, string];
    const [x, y] = [rep.shown(a), rep.shown(b)];
    if (x === y) return 'They are the same length.';
    const [long, short] = x > y ? [a, b] : [b, a];
    const d = spec.difference!;
    const unit = rep.unit(d);
    return `${rep.variable(long).name} is ${formatNumber(rep.shown(d), rep.variable(d))}${unit ? ` ${unit}` : ''} longer than ${rep.variable(short).name}.`;
  };

  const paint = usePaintIds('ribbon', 'wood');
  const colors = [c.blockBlue, c.blockRed, c.blockGreen, c.purple];
  const rowY = (i: number) => 4 + i * (NAME_H + RIBBON + ROW_GAP) + NAME_H;
  const rulerY = rowY(n - 1) + RIBBON;
  const height = rulerY + RULER + (spec.from ? COUNT_H : 0) + 8;

  return (
    <View>
      <Canvas aspect={(w) => height / w}>
        {({ w, h }) => {
          const left = 12 + UNIT_W;
          const scale = (w - left - 16) / (fit.value - first);
          const X = (units: number) => left + (units - first) * scale;
          // Numbers every 1, 2, 5 or 10 units, at least 24 px apart.
          const every = per > 1 ? 1 : ([1, 2, 5, 10, 20].find((s) => s * scale >= 24) ?? 50);
          // Half marks between whole ones on a centimeter or inch ruler with room for them.
          const sub =
            per > 1 ? per : scale >= 10 && /^(cm|in|inches?|centimeters?)$/.test(unit) ? 2 : 1;
          const ends = spec.lengths.map((_, i) => X(offset + shown[i]!));
          const nodes: ReactNode[] = [];

          // Ticks and numbers on the ruler.
          for (let t = first * sub; t <= fit.value * sub; t++) {
            const whole = t % sub === 0;
            const u = t / sub;
            const len = whole ? (u % every === 0 ? 16 : 12) : per === 4 && t % 2 === 0 ? 10 : 7;
            nodes.push(
              <Line
                key={`t${t}`}
                x1={X(u)}
                y1={rulerY}
                x2={X(u)}
                y2={rulerY + len}
                stroke={c.coinInk}
                strokeWidth={whole ? 1.5 : 1}
              />,
            );
            if (whole && u % every === 0)
              nodes.push(
                <ChartText
                  key={`n${t}`}
                  x={X(u)}
                  y={rulerY + RULER - 7}
                  fontSize={chart.value}
                  fontWeight="600"
                  fill={c.coinInk}
                  textAnchor="middle"
                >
                  {formatNumber(u)}
                </ChartText>,
              );
          }

          // A broken ruler: the spaces the ribbon covers, shaded and counted.
          if (spec.from && rep.known(spec.lengths[0]!)) {
            const len = Math.round(shown[0]! * per);
            for (let k = 0; k < len; k++) {
              const x0 = X(offset + k / per);
              const x1 = X(offset + (k + 1) / per);
              nodes.push(
                <Rect
                  key={`h${k}`}
                  x={x0 + 1}
                  y={rulerY + RULER + 3}
                  width={x1 - x0 - 2}
                  height={6}
                  rx={2}
                  fill={colors[0]!}
                  fillOpacity={k % 2 ? 0.55 : 0.85}
                />,
              );
              if (x1 - x0 >= 14)
                nodes.push(
                  <ChartText
                    key={`k${k}`}
                    x={(x0 + x1) / 2}
                    y={rulerY + RULER + 24}
                    fontSize={chart.label}
                    fontWeight="600"
                    textAnchor="middle"
                  >
                    {k + 1}
                  </ChartText>,
                );
            }
          }

          // Two ribbons: the difference bracketed on the shorter one's row.
          let bracket: ReactNode = null;
          if (n === 2 && spec.difference && spec.lengths.every(rep.known)) {
            const [a, b] = [shown[0]!, shown[1]!];
            if (a !== b) {
              const s = a < b ? 0 : 1;
              const x0 = ends[s]!;
              const x1 = ends[1 - s]!;
              const yy = rowY(s) + RIBBON / 2;
              const text = rep.value(spec.difference);
              const pw = text.length * chart.value * 0.6 + 14;
              // Clear of the short ribbon's handle; past the long end when the gap is too small.
              const inGap = x1 - x0 - chart.handleTouch / 2 - 4 >= pw;
              const px = inGap
                ? Math.max(x0 + chart.handleTouch / 2 + 2 + pw / 2, (x0 + x1) / 2)
                : x1 + 6 + pw / 2;
              const showPill = inGap || px + pw / 2 <= w - 2;
              bracket = (
                <G>
                  <Path
                    d={`M ${x0} ${yy - 6} V ${yy + 6} M ${x0} ${yy} H ${x1} M ${x1} ${yy - 6} V ${yy + 6}`}
                    stroke={c.chartSecond}
                    strokeWidth={chart.strokeHeavy}
                    strokeLinecap="round"
                    fill="none"
                  />
                  {showPill ? (
                    <G>
                      <Rect
                        x={px - pw / 2}
                        y={yy - 10}
                        width={pw}
                        height={20}
                        rx={10}
                        fill={c.chartSecond}
                      />
                      <ChartText
                        x={px}
                        y={yy + 4.5}
                        fontSize={chart.value}
                        fontWeight="700"
                        fill={c.coinInk}
                        textAnchor="middle"
                      >
                        {text}
                      </ChartText>
                    </G>
                  ) : null}
                </G>
              );
            }
          }

          return (
            <>
              <Svg width={w} height={h}>
                <Defs>
                  <Sheen id={paint.ribbon} vertical strength={0.8} />
                  <TopLight id={paint.wood} />
                </Defs>
                {/* The ruler, with the unit printed at its left end. */}
                <BoxShadow
                  x={broken ? left - 14 : left - UNIT_W}
                  y={rulerY}
                  width={X(fit.value) + 10 - (broken ? left - 14 : left - UNIT_W)}
                  height={RULER}
                  r={3}
                />
                <WoodStick
                  x0={broken ? left - 14 : left - UNIT_W}
                  x1={X(fit.value) + 10}
                  y={rulerY}
                  height={RULER}
                  lightId={paint.wood}
                  r={3}
                  jagged={broken}
                />
                {!broken && unit ? (
                  <ChartText
                    x={left - UNIT_W + 5}
                    y={rulerY + RULER - 7}
                    fontSize={chart.label}
                    fontWeight="700"
                    fill={c.coinInk}
                  >
                    {unit}
                  </ChartText>
                ) : null}
                {nodes}
                {/* Dashed guides from each ribbon's ends down to their marks. */}
                {spec.lengths.map((id, i) =>
                  [X(offset), ends[i]!].map((gx, k) =>
                    k === 0 && i === n - 1 ? null : (
                      <Line
                        key={`g${id}${k}`}
                        x1={gx}
                        y1={rowY(i) + RIBBON}
                        x2={gx}
                        y2={rulerY + 16}
                        stroke={c.chartMuted}
                        strokeWidth={1}
                        strokeDasharray={chart.dashFine}
                      />
                    ),
                  ),
                )}
                {/* Ribbons: satin, shiny across their width; the name and length above each. */}
                {spec.lengths.map((id, i) => {
                  const x0 = X(offset);
                  const len = Math.max(2, ends[i]! - x0);
                  const y0 = rowY(i);
                  return (
                    <G key={id}>
                      <G opacity={rep.known(id) ? 1 : 0.35}>
                        <Rect
                          x={x0}
                          y={y0}
                          width={len}
                          height={RIBBON}
                          rx={3}
                          fill={colors[i % colors.length]!}
                        />
                        <Rect
                          x={x0}
                          y={y0}
                          width={len}
                          height={RIBBON}
                          rx={3}
                          fill={url(paint.ribbon)}
                        />
                      </G>
                      <ChartText x={x0} y={y0 - 5} fontSize={chart.label} fontWeight="700">
                        {`${rep.tag(id)}: ${rep.value(id)}`}
                      </ChartText>
                    </G>
                  );
                })}
                {bracket}
                {/* Where each ribbon starts: a dot on its mark. */}
                <Circle cx={X(offset)} cy={rulerY} r={2.5} fill={c.chartInk} />
              </Svg>
              {spec.lengths.map((id, i) => (
                <DragHandle
                  key={id}
                  testID={`drag-${id}`}
                  x={ends[i]!}
                  y={rowY(i) + RIBBON / 2}
                  label={rep.variable(id).name}
                  onStart={() => {
                    start.current = shown[i]!;
                    fit.freeze();
                  }}
                  onEnd={fit.release}
                  onMove={(dx) =>
                    calc.set(
                      {
                        ...rep.pin(spec.lengths.filter((x) => x !== id)),
                        [id]: rep.snapTo(id, (start.current + dx / scale) * per * rep.factor(id)),
                      },
                      rep.slide(id),
                    )
                  }
                />
              ))}
            </>
          );
        }}
      </Canvas>
      {spec.from ? (
        <>
          <Caption>{`Starts at ${nowrap(rep.label(spec.from))}${spec.to ? `, ends at ${nowrap(rep.label(spec.to))}` : ''}. Length: ${nowrap(`${rep.label(spec.lengths[0]!)}.`)}`}</Caption>
          <Steppers calc={calc} items={[{ var: spec.from, steps: [1], pin: [spec.lengths[0]!] }]} />
        </>
      ) : null}
      {spec.lengths.length > 2 && spec.lengths.every(rep.known) ? (
        <Caption>{order()}</Caption>
      ) : null}
      {spec.difference && spec.lengths.length === 2 && spec.lengths.every(rep.known) ? (
        <Caption>{compare()}</Caption>
      ) : spec.difference ? (
        <Caption>{rep.named(spec.difference)}</Caption>
      ) : null}
    </View>
  );
}

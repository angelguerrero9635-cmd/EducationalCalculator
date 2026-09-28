import { Pressable, StyleSheet, View, type GestureResponderEvent } from 'react-native';

import Svg, { Circle, Defs, G, Line, Path, Rect } from 'react-native-svg';

import { Text } from '@/components/Text';
import type { Representation } from '@/data/modules';
import type { MeasuredThing } from '@/data/modules/types';
import { chart, font, space, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Ball, BoxShadow, Glass, Sheen, TopLight, url, usePaintIds } from './paint';
import { Canvas, ChartText, fitLabel, useRep } from './common';
import { SnapCube } from './snapCube';
import { Steppers } from './Steppers';

type Spec = Extract<Representation, { kind: 'compareRows' }>;

/** Room for a row's name, the strip's padding, and the space between the two strips. */
const NAME_H = 22;
const PAD = 5;
const GAP_H = 46;
/** Height of the thing measured (a pencil, crayon or ribbon) above a row of cubes. */
const OBJECT_H = 16;

/**
 * Two rows lined up one-to-one from the same left edge, each on a counting strip: counters
 * (or cups of water, or snap cubes under the thing they measure). Thin lines match each
 * counter with its partner; the ones with no partner sit under a bracket, "3 more". Cube rows
 * get a dashed guide where the shorter one ends instead, so what sticks out shows. Tap a spot
 * in a strip to set that row's count (tap the last one to remove it).
 */
export function CompareRows({ spec, calc }: { spec: Spec; calc: Calculator }) {
  const c = usePalette();
  const ids = usePaintIds('strip', 'a', 'b', 'cube', 'glass', 'water', 'sheen');
  const rep = useRep(calc);
  const rows = [spec.a, spec.b] as const;
  const counts = rows.map((id) => (rep.known(id) ? Math.round(rep.shown(id)) : 0));
  const known = rows.every((id) => rep.known(id));
  const varMax = Math.max(...rows.map((id) => rep.variable(id).max ?? 10));
  const [a, b] = counts as [number, number];
  const lo = Math.min(a, b);
  const hi = Math.max(a, b);
  // Slots from the values shown: at least 10, then in fives, always one to grow into.
  const cols = Math.min(varMax, Math.max(10, Math.ceil((hi + 1) / 5) * 5));
  const more = a > b ? spec.a : spec.b;
  const less = a > b ? spec.b : spec.a;
  const n = hi - lo;
  const cube = spec.icon === 'cube';
  const unitWord = cube ? 'cube' : spec.icon === 'cup' ? 'cup' : '';
  const amount = unitWord ? `${n} ${n === 1 ? unitWord : `${unitWord}s`}` : `${n}`;
  const name = (id: string) => rep.variable(id).name;
  // Two short lines of equal weight: "First row has 3 more." / "Second row has 3 fewer."
  const has = (id: string, word: string) =>
    `${name(id)} has ${n} ${word}${unitWord ? ` ${n === 1 ? unitWord : `${unitWord}s`}` : ''}.`;
  const verdict: string[] = !known
    ? []
    : a === b
      ? [
          spec.object
            ? 'They are the same length.'
            : spec.icon === 'cup'
              ? 'They hold the same.'
              : 'They are equal.',
        ]
      : spec.object
        ? [
            `${name(more)} is ${amount} ${spec.words[0]}.`,
            `${name(less)} is ${amount} ${spec.words[1]}.`,
          ]
        : spec.icon === 'cup'
          ? [
              `${name(more)} holds ${amount} ${spec.words[0]}.`,
              `${name(less)} holds ${amount} ${spec.words[1]}.`,
            ]
          : [has(more, spec.words[0]), has(less, spec.words[1])];
  // The bracket over the extras: "3 more", "3 cubes longer", "3 cups more".
  const extraText =
    spec.object || spec.icon === 'cup' ? `${amount} ${spec.words[0]}` : `${n} ${spec.words[0]}`;
  const objH = spec.object ? OBJECT_H + 8 : 0;

  const cellOf = (w: number) => Math.min(40, (w - 16 - 2 * PAD) / cols);
  const layout = (w: number) => {
    const cell = cellOf(w);
    const stripH = cell + 2 * PAD;
    const stripW = cols * cell + 2 * PAD;
    const x0 = (w - stripW) / 2;
    const topA = NAME_H + objH;
    const topB = topA + stripH + GAP_H + objH;
    return { cell, stripH, stripW, x0, topA, topB, h: topB + stripH + NAME_H + 6 };
  };

  return (
    <View style={{ gap: space.sm }}>
      <Canvas aspect={(w) => layout(w).h / w}>
        {({ w, h }) => {
          const { cell, stripH, stripW, x0, topA, topB } = layout(w);
          const cx = (i: number) => x0 + PAD + (i + 0.5) * cell;
          const tops = [topA, topB];
          const colors = [c.chartHighlight, c.chartSecond];
          const r = cell * 0.4;
          const unit = (row: number, i: number, filled: boolean) => {
            const x = cx(i);
            const y = tops[row]! + stripH / 2;
            if (!filled) {
              // An empty slot: a faint outline, so there is room to tap and add one.
              return spec.icon === 'dot' ? (
                <Circle
                  key={`${row}-${i}`}
                  cx={x}
                  cy={y}
                  r={r * 0.8}
                  fill="none"
                  stroke={c.chartGrid}
                  strokeDasharray={chart.dashFine}
                />
              ) : (
                <Rect
                  key={`${row}-${i}`}
                  x={x - cell * 0.36}
                  y={y - cell * 0.36}
                  width={cell * 0.72}
                  height={cell * 0.72}
                  rx={3}
                  fill="none"
                  stroke={c.chartGrid}
                  strokeDasharray={chart.dashFine}
                />
              );
            }
            if (spec.icon === 'dot') {
              return (
                <Circle
                  key={`${row}-${i}`}
                  cx={x}
                  cy={y}
                  r={r}
                  fill={url(row === 0 ? ids.a : ids.b)}
                  stroke={c.chartInk}
                  strokeOpacity={0.6}
                  strokeWidth={1.2}
                />
              );
            }
            if (spec.icon === 'cup')
              return <WaterCup key={`${row}-${i}`} x={x} y={y} s={cell} ids={ids} />;
            // Cubes touch (a length), with the 1 px gap of snapped cubes.
            const s = cell - 1;
            return (
              <SnapCube
                key={`${row}-${i}`}
                x={x - s / 2}
                y={y - s / 2 + 1.5}
                s={s}
                color={colors[row]!}
                lightId={ids.cube}
              />
            );
          };
          const edge = (i: number) => x0 + PAD + i * cell;
          const stripBottomA = topA + stripH;
          const gapTop = stripBottomA;
          const gapBottom = topB - objH;
          const bracket = (() => {
            if (!known || n === 0) return null;
            const [x1, x2] = [edge(lo) + 3, edge(hi) - 3];
            const text = extraText;
            const lx = fitLabel((x1 + x2) / 2, text, chart.emphasis, w);
            // Under the top row's extras, or over the bottom row's.
            const down = a > b;
            const y = down ? gapTop + 6 : gapBottom - 6;
            const tick = down ? -5 : 5;
            return (
              <G>
                <Path
                  d={`M ${x1} ${y + tick} V ${y} H ${x2} V ${y + tick} M ${(x1 + x2) / 2} ${y} v ${-tick}`}
                  fill="none"
                  stroke={c.chartMuted}
                  strokeWidth={chart.strokeLight}
                />
                <ChartText
                  x={lx.x}
                  y={down ? y + 22 : y - 12}
                  textAnchor={lx.textAnchor}
                  fontSize={chart.emphasis}
                  fontWeight="700"
                >
                  {text}
                </ChartText>
              </G>
            );
          })();
          return (
            <View>
              <Svg width={w} height={h}>
                <Defs>
                  <TopLight id={ids.strip} strength={0.8} />
                  <TopLight id={ids.cube} strength={1.2} />
                  <Ball id={ids.a} color={c.chartHighlight} />
                  <Ball id={ids.b} color={c.chartSecond} />
                  <Glass id={ids.glass} />
                  <Sheen id={ids.sheen} vertical />
                  <TopLight id={ids.water} />
                </Defs>
                {rows.map((id, row) => (
                  <G key={id}>
                    {/* The counting strip: a card lying on the table. */}
                    <BoxShadow x={x0} y={tops[row]!} width={stripW} height={stripH} r={8} />
                    <Rect
                      x={x0}
                      y={tops[row]!}
                      width={stripW}
                      height={stripH}
                      rx={8}
                      fill={c.paper}
                      stroke={c.chartGrid}
                    />
                    <Rect
                      x={x0}
                      y={tops[row]!}
                      width={stripW}
                      height={stripH}
                      rx={8}
                      fill={url(ids.strip)}
                    />
                    <ChartText
                      x={x0 + 2}
                      y={row === 0 ? NAME_H - 7 : tops[row]! + stripH + NAME_H - 5}
                      fontSize={chart.emphasis}
                      fontWeight="600"
                    >
                      {rep.tag(id)}
                    </ChartText>
                  </G>
                ))}
                {/* Match lines: each counter and its partner in the other row. */}
                {!cube
                  ? Array.from({ length: lo }, (_, i) => (
                      <Line
                        key={`m${i}`}
                        x1={cx(i)}
                        y1={topA + stripH / 2 + r + 2}
                        x2={cx(i)}
                        y2={topB + stripH / 2 - r - 2}
                        stroke={c.chartMuted}
                        strokeWidth={1.2}
                      />
                    ))
                  : null}
                {/* Cubes: where the shorter one ends, so the extra sticks out past the line. */}
                {cube && known && n > 0 ? (
                  <Line
                    x1={edge(lo)}
                    y1={NAME_H - 2}
                    x2={edge(lo)}
                    y2={topB + stripH + 2}
                    stroke={c.chartMuted}
                    strokeDasharray={chart.dash}
                    strokeWidth={chart.strokeLight}
                  />
                ) : null}
                {spec.object
                  ? rows.map((id, row) => (
                      <MeasuredObject
                        key={`o${id}`}
                        kind={Array.isArray(spec.object) ? spec.object[row]! : spec.object!}
                        x={edge(0)}
                        y={tops[row]! - OBJECT_H - 5}
                        length={counts[row]! * cell}
                        sheenId={ids.sheen}
                      />
                    ))
                  : null}
                {rows.map((_, row) =>
                  Array.from({ length: cols }, (_, i) => unit(row, i, i < counts[row]!)),
                )}
                {bracket}
              </Svg>
              {/* One tap target per strip (a K finger needs room): the spot tapped sets the count. */}
              {rows.map((id, row) => (
                <Pressable
                  key={id}
                  testID={`row-${id}`}
                  accessibilityLabel={`${rep.variable(id).name}: tap a spot to set how many`}
                  onPress={(e: GestureResponderEvent) => {
                    const ne = e.nativeEvent as unknown as { locationX?: number; offsetX?: number };
                    const lx = ne.locationX ?? ne.offsetX ?? 0;
                    const i = Math.max(0, Math.min(cols - 1, Math.floor((lx - PAD) / cell)));
                    calc.set({
                      ...rep.pin(rows.filter((x) => x !== id)),
                      [id]: i + 1 === counts[row] ? i : i + 1,
                    });
                  }}
                  style={{
                    position: 'absolute',
                    left: x0,
                    // At least a finger tall, centred on the strip.
                    top: tops[row]! + stripH / 2 - Math.max(chart.handleTouch, stripH) / 2,
                    width: stripW,
                    height: Math.max(chart.handleTouch, stripH),
                  }}
                />
              ))}
            </View>
          );
        }}
      </Canvas>
      {verdict.length ? (
        <View>
          {verdict.map((line) => (
            <Text key={line} style={[styles.verdict, { color: c.text }]}>
              {line}
            </Text>
          ))}
        </View>
      ) : null}
      <Steppers
        calc={calc}
        items={rows.map((id) => ({ var: id, steps: [1], pin: rows.filter((x) => x !== id) }))}
      />
      <Text style={[styles.legend, { color: c.textMuted }]}>
        {cube
          ? 'Both start at the same line. Count the cubes past the dashed line.'
          : 'Each line joins a pair. The extras have no partner.'}
      </Text>
    </View>
  );
}

/** A clear cup of water, `s` px cell centred on (x, y): glass walls, water to near the top. */
function WaterCup({
  x,
  y,
  s,
  ids,
}: {
  x: number;
  y: number;
  s: number;
  ids: { glass: string; water: string };
}) {
  const c = usePalette();
  const [tw, bw, hh] = [s * 0.74, s * 0.52, s * 0.8];
  const top = y - hh / 2;
  const bot = y + hh / 2;
  const lvl = 0.22;
  const at = (k: number) => [(tw - (tw - bw) * k) / 2, top + hh * k] as const;
  const [wl, wy] = at(lvl);
  return (
    <G>
      <Path
        d={`M ${x - tw / 2} ${top} L ${x - bw / 2} ${bot} Q ${x} ${bot + 2} ${x + bw / 2} ${bot} L ${x + tw / 2} ${top} Z`}
        fill={url(ids.glass)}
      />
      <Path
        d={`M ${x - wl} ${wy} L ${x - bw / 2} ${bot} Q ${x} ${bot + 2} ${x + bw / 2} ${bot} L ${x + wl} ${wy} Z`}
        fill={c.water}
      />
      <Path
        d={`M ${x - wl} ${wy} L ${x - bw / 2} ${bot} Q ${x} ${bot + 2} ${x + bw / 2} ${bot} L ${x + wl} ${wy} Z`}
        fill={url(ids.water)}
      />
      <Line x1={x - wl} y1={wy} x2={x + wl} y2={wy} stroke={c.waterTop} strokeWidth={1.6} />
      <Path
        d={`M ${x - tw / 2} ${top} L ${x - bw / 2} ${bot} Q ${x} ${bot + 2} ${x + bw / 2} ${bot} L ${x + tw / 2} ${top}`}
        fill="none"
        stroke={c.glassEdge}
        strokeWidth={1.3}
        strokeLinejoin="round"
      />
      <Line
        x1={x - tw / 2 - 0.5}
        y1={top}
        x2={x + tw / 2 + 0.5}
        y2={top}
        stroke={c.glassEdge}
        strokeWidth={1.6}
        strokeLinecap="round"
      />
    </G>
  );
}

/**
 * The thing being measured, exactly as long as the cubes under it and starting at the same
 * edge: a yellow pencil (eraser, metal band, sharpened wood and lead), a wax crayon in its
 * paper wrapper, or a ribbon.
 */
function MeasuredObject({
  kind,
  x,
  y,
  length,
  sheenId,
}: {
  kind: MeasuredThing;
  x: number;
  y: number;
  length: number;
  sheenId: string;
}) {
  const c = usePalette();
  const h = OBJECT_H;
  const L = Math.max(0, length);
  if (L === 0) return null;
  const tip = Math.min(h * 1.1, L / 3);
  const cy = y + h / 2;
  if (kind === 'ribbon') {
    return (
      <G>
        <Rect x={x} y={y + 3} width={L} height={h - 6} rx={1.5} fill={c.purple} />
        <Rect x={x} y={y + 3} width={L} height={h - 6} rx={1.5} fill={url(sheenId)} />
      </G>
    );
  }
  if (kind === 'crayon') {
    const body = L - tip;
    return (
      <G>
        <Path
          d={`M ${x + 2} ${y + 1} H ${x + body} L ${x + L} ${cy - 1.5} V ${cy + 1.5} L ${x + body} ${y + h - 1} H ${x + 2} Q ${x} ${cy} ${x + 2} ${y + 1} Z`}
          fill={c.blockRed}
        />
        {/* The paper wrapper, with its two bands. */}
        <Rect x={x + body * 0.12} y={y + 1} width={body * 0.76} height={h - 2} fill={c.cupLight} />
        <Path
          d={`M ${x + body * 0.2} ${y + 1} V ${y + h - 1} M ${x + body * 0.8} ${y + 1} V ${y + h - 1}`}
          stroke={c.blockRed}
          strokeWidth={2}
        />
        <Path
          d={`M ${x + 2} ${y + 1} H ${x + body} L ${x + L} ${cy - 1.5} V ${cy + 1.5} L ${x + body} ${y + h - 1} H ${x + 2} Q ${x} ${cy} ${x + 2} ${y + 1} Z`}
          fill={url(sheenId)}
          stroke={c.chartInk}
          strokeOpacity={0.45}
        />
      </G>
    );
  }
  const eraser = Math.min(h * 0.6, L / 6);
  const band = Math.min(h * 0.45, L / 8);
  const body = L - tip;
  return (
    <G>
      <Rect x={x} y={y + 1} width={eraser + 2} height={h - 2} rx={3} fill={c.rock6} />
      <Rect x={x + eraser} y={y} width={band} height={h} fill={c.metal} />
      <Path
        d={`M ${x + eraser + band * 0.35} ${y} V ${y + h} M ${x + eraser + band * 0.7} ${y} V ${y + h}`}
        stroke={c.metalDark}
        strokeWidth={0.8}
      />
      <Rect
        x={x + eraser + band}
        y={y}
        width={body - eraser - band}
        height={h}
        fill={c.chartSecond}
      />
      <Path
        d={`M ${x + eraser + band} ${cy - h / 6} H ${x + body} M ${x + eraser + band} ${cy + h / 6} H ${x + body}`}
        stroke={c.shade}
        strokeOpacity={0.18}
        strokeWidth={0.8}
      />
      <Path d={`M ${x + body} ${y} L ${x + L} ${cy} L ${x + body} ${y + h} Z`} fill={c.wood} />
      <Path
        d={`M ${x + L - tip * 0.3} ${cy - h * 0.15} L ${x + L} ${cy} L ${x + L - tip * 0.3} ${cy + h * 0.15} Z`}
        fill={c.rubber}
      />
      <Rect x={x} y={y} width={body} height={h} fill={url(sheenId)} />
      <Path
        d={`M ${x + 3} ${y + 1} H ${x + body} L ${x + L} ${cy} L ${x + body} ${y + h - 1} H ${x + 3}`}
        fill="none"
        stroke={c.chartInk}
        strokeOpacity={0.4}
        strokeLinejoin="round"
      />
    </G>
  );
}

const styles = StyleSheet.create({
  verdict: { fontSize: font.body, fontWeight: '600', textAlign: 'center', lineHeight: 22 },
  legend: { fontSize: font.caption + 1, textAlign: 'center' },
});

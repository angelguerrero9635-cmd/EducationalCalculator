import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Defs, G, Line, Path, Rect } from 'react-native-svg';

import { SegmentedControl } from '@/components/SegmentedControl';
import { Text } from '@/components/Text';
import type { Representation } from '@/data/modules';
import { chart, font, space, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, useRep, Caption } from './common';
import { Ball, Sheen, url, usePaintIds } from './paint';
import { Steppers } from './Steppers';

type Spec = Extract<Representation, { kind: 'partition' }>;

const NAMES: Record<number, string> = { 1: 'one whole', 2: 'halves', 3: 'thirds', 4: 'fourths' };
/** "1 fourth shaded", "3 fourths shaded". */
const ONE: Record<number, string> = { 1: 'whole', 2: 'half', 3: 'third', 4: 'fourth' };
const MANY: Record<number, string> = { 1: 'wholes', 2: 'halves', 3: 'thirds', 4: 'fourths' };
/** The things in a set model, one and many. */
const OBJECTS = {
  umbrella: ['umbrella', 'umbrellas'],
  counter: ['counter', 'counters'],
} as const;

/** A set's objects go in rows of up to 8 (even rows past that), each in a square cell. */
const setPerRow = (p: number) => (p <= 8 ? p : Math.ceil(p / Math.ceil(p / 8)));
const setRows = (p: number) => Math.ceil(p / setPerRow(p));
const setCell = (p: number, w: number) => Math.min(72, (w - 24) / setPerRow(p));

/**
 * An umbrella seen from the side in a `s`-wide cell whose canopy rim sits at (cx, cy): a
 * scalloped fabric canopy on ribs, a metal shaft and a wooden crook handle.
 */
function Umbrella({
  cx,
  cy,
  s,
  fill,
  sheenId,
}: {
  cx: number;
  cy: number;
  s: number;
  fill: string;
  sheenId: string;
}) {
  const c = usePalette();
  const r = s * 0.44;
  const top = cy - s * 0.36;
  const n = 4;
  const tips = Array.from({ length: n + 1 }, (_, i) => cx - r + (2 * r * i) / n);
  const scallop = r / n;
  const canopy =
    `M ${cx - r} ${cy} C ${cx - r} ${top + s * 0.02} ${cx - r * 0.45} ${top} ${cx} ${top} ` +
    `C ${cx + r * 0.45} ${top} ${cx + r} ${top + s * 0.02} ${cx + r} ${cy} ` +
    tips
      .slice(0, -1)
      .reverse()
      .map((x) => `A ${scallop} ${scallop * 0.55} 0 0 0 ${x} ${cy}`)
      .join(' ') +
    ' Z';
  const foot = cy + s * 0.44;
  return (
    <G>
      <Line
        x1={cx}
        y1={top - s * 0.06}
        x2={cx}
        y2={foot}
        stroke={c.metalDark}
        strokeWidth={Math.max(1.5, s * 0.035)}
      />
      <Path
        d={`M ${cx} ${foot - s * 0.02} A ${s * 0.07} ${s * 0.07} 0 0 1 ${cx - s * 0.14} ${foot}`}
        stroke={c.woodDark}
        strokeWidth={Math.max(2.5, s * 0.06)}
        strokeLinecap="round"
        fill="none"
      />
      <Path d={canopy} fill={fill} stroke={c.chartInk} strokeWidth={1.2} strokeLinejoin="round" />
      {tips.slice(1, -1).map((x, i) => (
        <Path
          key={i}
          d={`M ${cx} ${top} Q ${(cx + x) / 2 + (x - cx) * 0.15} ${top + s * 0.08} ${x} ${cy}`}
          stroke={c.chartInk}
          strokeOpacity={0.35}
          strokeWidth={1}
          fill="none"
        />
      ))}
      <Path d={canopy} fill={url(sheenId)} />
    </G>
  );
}

/**
 * A whole (circle or rectangle) cut into equal parts; tap a part to shade or unshade it. − / +
 * change the parts. More equal parts make each part smaller.
 */
export function Partition({ spec, calc }: { spec: Spec; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  // Tests show both round and rectangular wholes; the student can switch. A set stays a set.
  const [shape, setShape] = useState<'circle' | 'rectangle' | 'set'>(spec.shape);
  const paint = usePaintIds('sheen', 'on', 'off');
  const set = spec.shape === 'set';
  const [one, many] = OBJECTS[spec.object ?? 'counter'];
  const p = Math.max(1, Math.round(rep.shown(spec.parts)));
  const k = Math.min(p, Math.max(0, Math.round(rep.shown(spec.shaded))));
  const tap = (i: number) =>
    calc.set({ ...rep.pin([spec.parts]), [spec.shaded]: i < k ? i : i + 1 });

  return (
    <View>
      {set ? null : (
        <View style={styles.toggle}>
          <SegmentedControl
            segments={[
              { value: 'circle', label: 'Circle' },
              { value: 'rectangle', label: 'Rectangle' },
            ]}
            value={shape}
            onChange={setShape}
          />
        </View>
      )}
      <Canvas aspect={set ? (w) => (setRows(p) * setCell(p, w) + 20) / w : 0.62}>
        {({ w, h }) => {
          const size = Math.min(w - 32, h - 16);
          if (set) {
            const perRow = setPerRow(p);
            const rows = setRows(p);
            const s = setCell(p, w);
            const cell = (i: number) => {
              const row = Math.floor(i / perRow);
              const inRow = Math.min(perRow, p - row * perRow);
              return {
                cx: w / 2 + (i - row * perRow - (inRow - 1) / 2) * s,
                cy: h / 2 + (row - (rows - 1) / 2) * s,
              };
            };
            return (
              <Svg width={w} height={h}>
                <Defs>
                  <Sheen id={paint.sheen} />
                  <Ball id={paint.on} color={c.chartHighlight} />
                  <Ball id={paint.off} color={c.chartFill} />
                </Defs>
                {Array.from({ length: p }, (_, i) => {
                  const { cx, cy } = cell(i);
                  return (
                    <G key={i}>
                      {spec.object === 'umbrella' ? (
                        <Umbrella
                          cx={cx}
                          cy={cy - s * 0.02}
                          s={s * 0.92}
                          fill={i < k ? c.chartHighlight : c.fabric}
                          sheenId={paint.sheen}
                        />
                      ) : (
                        <Circle
                          cx={cx}
                          cy={cy}
                          r={s * 0.36}
                          fill={url(i < k ? paint.on : paint.off)}
                          stroke={c.chartInk}
                          strokeWidth={1.5}
                        />
                      )}
                      <Rect
                        testID={`part-${i + 1}`}
                        x={cx - s / 2}
                        y={cy - s / 2}
                        width={s}
                        height={s}
                        fill={c.chartInk}
                        fillOpacity={0}
                        onPress={() => tap(i)}
                      />
                    </G>
                  );
                })}
              </Svg>
            );
          }
          if (shape === 'rectangle') {
            const rw = Math.min(w - 32, size * 1.6);
            const x0 = (w - rw) / 2;
            const y0 = (h - size * 0.7) / 2;
            return (
              <Svg width={w} height={h}>
                {Array.from({ length: p }, (_, i) => (
                  <Rect
                    key={i}
                    testID={`part-${i + 1}`}
                    x={x0 + (rw / p) * i}
                    y={y0}
                    width={rw / p}
                    height={size * 0.7}
                    fill={i < k ? c.chartHighlight : c.chartFill}
                    stroke={c.chartInk}
                    strokeWidth={chart.stroke}
                    onPress={() => tap(i)}
                  />
                ))}
              </Svg>
            );
          }
          const r = size / 2;
          const cx = w / 2;
          const cy = h / 2;
          const slice = (i: number) => {
            if (p === 1)
              return `M ${cx - r} ${cy} A ${r} ${r} 0 1 1 ${cx + r} ${cy} A ${r} ${r} 0 1 1 ${cx - r} ${cy} Z`;
            const a0 = -Math.PI / 2 + (2 * Math.PI * i) / p;
            const a1 = a0 + (2 * Math.PI) / p;
            const [x0, y0, x1, y1] = [
              cx + r * Math.cos(a0),
              cy + r * Math.sin(a0),
              cx + r * Math.cos(a1),
              cy + r * Math.sin(a1),
            ];
            return `M ${cx} ${cy} L ${x0} ${y0} A ${r} ${r} 0 ${a1 - a0 > Math.PI ? 1 : 0} 1 ${x1} ${y1} Z`;
          };
          return (
            <Svg width={w} height={h}>
              {Array.from({ length: p }, (_, i) => (
                <Path
                  key={i}
                  testID={`part-${i + 1}`}
                  d={slice(i)}
                  fill={i < k ? c.chartHighlight : c.chartFill}
                  stroke={c.chartInk}
                  strokeWidth={chart.stroke}
                  onPress={() => tap(i)}
                />
              ))}
            </Svg>
          );
        }}
      </Canvas>
      <Caption>
        {set
          ? !rep.known(spec.parts) || !rep.known(spec.shaded)
            ? `${rep.known(spec.parts) ? p : '?'} ${many}: ${rep.known(spec.shaded) ? k : '?'} shaded.`
            : `${rep.words ? '' : `${rep.variable(spec.parts).symbol} = `}${p} ${p === 1 ? one : many}: ${k} shaded, ${p - k} not shaded. ${k} of the ${p} ${p === 1 ? one : many}` +
              (spec.fraction
                ? ` ${k === 1 ? 'is' : 'are'} shaded: ${k}/${p} of the set.`
                : ` ${k === 1 ? 'is' : 'are'} shaded.`)
          : !rep.known(spec.parts) || !rep.known(spec.shaded)
            ? // A "?" is never shown as a number: say what is known and ask for the rest.
              `${rep.known(spec.parts) ? p : '?'} equal parts: ${rep.known(spec.shaded) ? k : '?'} shaded.`
            : spec.fraction
              ? `${rep.words ? '' : `${rep.variable(spec.parts).symbol} = `}${p} equal parts: ${k}/${p} shaded, ${p - k}/${p} not shaded.`
              : `${rep.words ? '' : `${rep.variable(spec.parts).symbol} = `}${p} equal parts (${NAMES[p] ?? `${p} parts`}): ${rep.words ? '' : `${rep.variable(spec.shaded).symbol} = `}${k} shaded, ${p - k} not shaded. ${k} ${(k === 1 ? ONE : MANY)[p] ?? 'parts'} shaded.`}
      </Caption>
      <Steppers
        calc={calc}
        items={[{ var: spec.control ?? spec.parts, steps: [spec.step ?? 1], pin: [spec.shaded] }]}
      />
      <Text style={[styles.hint, { color: c.textMuted }]}>
        {set
          ? `Tap ${spec.object === 'umbrella' ? 'an' : 'a'} ${one} to shade it.`
          : 'Tap a part to shade it.'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  toggle: { paddingHorizontal: space.lg, marginBottom: space.sm },
  hint: { fontSize: font.caption + 1, textAlign: 'center', marginTop: space.xs },
});

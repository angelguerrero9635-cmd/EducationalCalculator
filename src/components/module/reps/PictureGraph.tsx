import { Pressable, StyleSheet, View } from 'react-native';
import Svg, { Circle, Polygon, Rect } from 'react-native-svg';

import { Text } from '@/components/Text';
import type { Representation } from '@/data/modules';
import type { CardIcon } from '@/data/modules/layouts';
import { formatNumber } from '@/engine/format';
import { chart, font, space, usePalette } from '@/theme';

import { Icon as CardIconArt } from '../layouts/CardFigure';
import type { Calculator } from '../useCalculator';
import { Canvas, useRep } from './common';
import { Steppers } from './Steppers';

type Spec = Extract<Representation, { kind: 'pictureGraph' }>;
type Icon = Spec['columns'][number]['icon'];
const SHAPES: readonly Icon[] = ['circle', 'square', 'triangle', 'star'];

function Shape({
  icon,
  size,
  fill,
  stroke,
}: {
  icon: Icon;
  size: number;
  fill: string;
  stroke: string;
}) {
  const s = size;
  const pad = s * 0.14;
  const common = { fill, stroke, strokeWidth: chart.strokeLight };
  // A card icon ('apple', 'frog') in its own colors, scaled from its 48 × 48 box.
  if (!SHAPES.includes(icon))
    return (
      <Svg width={s} height={s} viewBox="0 0 48 48">
        <CardIconArt icon={icon as CardIcon} ink={stroke} shade={fill} />
      </Svg>
    );
  return (
    <Svg width={s} height={s}>
      {icon === 'circle' ? (
        <Circle cx={s / 2} cy={s / 2} r={s / 2 - pad} {...common} />
      ) : icon === 'square' ? (
        <Rect x={pad} y={pad} width={s - 2 * pad} height={s - 2 * pad} {...common} />
      ) : icon === 'star' ? (
        <Polygon
          points={Array.from({ length: 10 }, (_, i) => {
            const r = i % 2 === 0 ? s / 2 - pad : (s / 2 - pad) * 0.45;
            const t = -Math.PI / 2 + (Math.PI * i) / 5;
            return `${s / 2 + r * Math.cos(t)},${s / 2 + r * Math.sin(t)}`;
          }).join(' ')}
          {...common}
        />
      ) : (
        <Polygon points={`${s / 2},${pad} ${s - pad},${s - pad} ${pad},${s - pad}`} {...common} />
      )}
    </Svg>
  );
}

/**
 * One column of picture icons per category. Tap the k-th cell of a column to count k; tap the
 * top icon of a column to take one away (so a count can go down to 0). With `half`, the top
 * icon takes half a picture away and a half picture is in the key.
 */
export function PictureGraph({ spec, calc }: { spec: Spec; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  const ids = spec.columns.map((col) => col.var);
  // Rows shown: the biggest count plus two to grow into, never more than the picture holds.
  const biggest = Math.max(0, ...ids.map((id) => (rep.known(id) ? Math.ceil(rep.val(id)) : 0)));
  const rows = Math.max(3, Math.min(spec.max, biggest + 2));
  const colWidth = (w: number) => Math.min(88, (w - 16) / spec.columns.length);
  // Each icon is a tap target: at least 44 pt when the columns leave room; a tall graph (9 or
  // 10 rows) keeps to 44 so it fits a phone screen with its inputs.
  const cellFor = (w: number) =>
    Math.max(Math.min(44, colWidth(w)), Math.min(52, colWidth(w) * 0.75, 440 / rows));

  return (
    <View style={{ gap: space.md }}>
      <Canvas aspect={(w) => (rows * cellFor(w) + 56) / w}>
        {({ w }) => {
          const colW = colWidth(w);
          const cell = cellFor(w);
          return (
            <View style={styles.graph}>
              {spec.columns.map((col) => {
                const known = rep.known(col.var);
                // A scaled graph can end a column in half a picture (half the key).
                const value = rep.val(col.var);
                const n = spec.key ? Math.floor(value + 1e-9) : Math.round(value);
                const half = spec.key !== undefined && value - n >= 0.5 - 1e-9;
                return (
                  <View
                    key={col.var}
                    style={{ width: colW, alignItems: 'center', opacity: known ? 1 : 0.35 }}
                  >
                    <View style={[styles.column, { borderBottomColor: c.chartInk }]}>
                      {Array.from({ length: rows }, (_, i) => (
                        <Pressable
                          key={i}
                          testID={`pic-${col.var}-${i + 1}`}
                          accessibilityLabel={`${rep.variable(col.var).name}: ${i + 1}`}
                          onPress={() =>
                            calc.set({
                              ...rep.pin(ids.filter((id) => id !== col.var)),
                              [col.var]:
                                spec.half && half && i === n
                                  ? n
                                  : i + 1 === n && !half
                                    ? n - (spec.half ? 0.5 : 1)
                                    : i + 1,
                            })
                          }
                          style={{
                            width: cell,
                            height: cell,
                            opacity: i < n || (half && i === n) ? 1 : 0.12,
                          }}
                        >
                          {half && i === n ? (
                            // Half a picture: the left half, cut down the middle.
                            <View style={{ width: cell / 2, height: cell, overflow: 'hidden' }}>
                              <Shape
                                icon={col.icon}
                                size={cell}
                                fill={c.chartFill}
                                stroke={c.chartInk}
                              />
                            </View>
                          ) : (
                            <Shape
                              icon={col.icon}
                              size={cell}
                              fill={i < n ? c.chartFill : 'none'}
                              stroke={c.chartInk}
                            />
                          )}
                        </Pressable>
                      ))}
                    </View>
                    <Text style={[styles.label, { color: c.text }]}>{rep.tag(col.var)}</Text>
                    <Text style={[styles.count, { color: c.text }]}>
                      {known
                        ? half
                          ? spec.half
                            ? n
                              ? `${n} 1/2`
                              : '1/2'
                            : `${n} and a half`
                          : n
                        : '?'}
                    </Text>
                  </View>
                );
              })}
            </View>
          );
        }}
      </Canvas>
      {spec.key ? (
        <>
          {/* The key as it's drawn on a worksheet: the pictures, then what each stands for. */}
          <View style={styles.key}>
            <Text style={[styles.total, { color: c.text }]}>Key:</Text>
            {/* Each picture once: a graph drawn in one icon shows it once. */}
            {[...new Set(spec.columns.map((col) => col.icon))].map((icon) => (
              <Shape key={icon} icon={icon} size={22} fill={c.chartFill} stroke={c.chartInk} />
            ))}
            <Text style={[styles.total, { color: c.text }]}>
              {spec.half ? `= ${rep.value(spec.key)}` : `each stands for ${rep.value(spec.key)}`}
            </Text>
            {spec.half ? (
              <>
                <View style={{ width: 11, height: 22, overflow: 'hidden', marginLeft: space.md }}>
                  <Shape
                    icon={spec.columns[0]!.icon}
                    size={22}
                    fill={c.chartFill}
                    stroke={c.chartInk}
                  />
                </View>
                <Text style={[styles.total, { color: c.text }]}>
                  {rep.known(spec.key)
                    ? `= ${formatNumber(rep.val(spec.key) / 2)} (half of ${rep.value(spec.key)})`
                    : '= half of ?'}
                </Text>
              </>
            ) : null}
          </View>
          <Steppers
            calc={calc}
            items={[{ var: spec.key, steps: [1], pin: spec.columns.map((x) => x.var) }]}
          />
        </>
      ) : null}
      {spec.total ? (
        <Text style={[styles.total, { color: c.text }]}>
          {`${rep.variable(spec.total).name}: ${rep.label(spec.total)}`}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  key: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: space.xs,
  },
  graph: { flexDirection: 'row', justifyContent: 'center', alignItems: 'flex-end' },
  column: {
    flexDirection: 'column-reverse',
    borderBottomWidth: chart.stroke,
    paddingBottom: 2,
  },
  label: { fontSize: font.caption + 1, marginTop: space.xs, textAlign: 'center' },
  count: { fontSize: font.body, fontWeight: '700' },
  total: { fontSize: font.body, fontWeight: '600', textAlign: 'center' },
});

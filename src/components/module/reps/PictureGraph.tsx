import { Pressable, StyleSheet, View } from 'react-native';
import Svg, { Circle, Polygon, Rect } from 'react-native-svg';

import { Text } from '@/components/Text';
import type { Representation } from '@/data/modules';
import { chart, font, space, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, useRep } from './common';
import { Steppers } from './Steppers';

type Spec = Extract<Representation, { kind: 'pictureGraph' }>;
type Icon = Spec['columns'][number]['icon'];

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
 * top icon of a column to take one away (so a count can go down to 0).
 */
export function PictureGraph({ spec, calc }: { spec: Spec; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  const ids = spec.columns.map((col) => col.var);

  return (
    <View style={{ gap: space.md }}>
      <Canvas aspect={1}>
        {({ w, h }) => {
          const colW = Math.min(88, (w - 16) / spec.columns.length);
          const cell = Math.min(colW * 0.75, (h - 56) / spec.max);
          return (
            <View style={styles.graph}>
              {spec.columns.map((col) => {
                const known = rep.known(col.var);
                const n = Math.round(rep.val(col.var));
                return (
                  <View
                    key={col.var}
                    style={{ width: colW, alignItems: 'center', opacity: known ? 1 : 0.35 }}
                  >
                    <View style={[styles.column, { borderBottomColor: c.chartInk }]}>
                      {Array.from({ length: spec.max }, (_, i) => (
                        <Pressable
                          key={i}
                          testID={`pic-${col.var}-${i + 1}`}
                          accessibilityLabel={`${rep.variable(col.var).name}: ${i + 1}`}
                          onPress={() =>
                            calc.set({
                              ...rep.pin(ids.filter((id) => id !== col.var)),
                              [col.var]: i + 1 === n ? n - 1 : i + 1,
                            })
                          }
                          style={{ width: cell, height: cell, opacity: i < n ? 1 : 0.12 }}
                        >
                          <Shape
                            icon={col.icon}
                            size={cell}
                            fill={i < n ? c.chartFill : 'none'}
                            stroke={c.chartInk}
                          />
                        </Pressable>
                      ))}
                    </View>
                    <Text style={[styles.label, { color: c.text }]}>{rep.tag(col.var)}</Text>
                    <Text style={[styles.count, { color: c.text }]}>{known ? n : '?'}</Text>
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
            {spec.columns.map((col) => (
              <Shape
                key={col.var}
                icon={col.icon}
                size={22}
                fill={c.chartFill}
                stroke={c.chartInk}
              />
            ))}
            <Text style={[styles.total, { color: c.text }]}>
              {`each stands for ${rep.value(spec.key)}`}
            </Text>
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

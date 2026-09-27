import { StyleSheet, View } from 'react-native';
import Svg, { Circle, G, Rect } from 'react-native-svg';

import type { Representation } from '@/data/modules';
import { chart, space, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { CounterDot, raised } from './paint';
import { Canvas, ChartText, useRep, Caption } from './common';
import { Steppers } from './Steppers';

type Spec = Extract<Representation, { kind: 'equalGroups' }>;

/**
 * Equal groups: one circle per group with the same number of dots in each. − / + change both.
 * With `bundles`, more than 12 groups go in rows of ten small circles, each with its number.
 */
export function EqualGroups({ spec, calc }: { spec: Spec; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  const g = rep.known(spec.groups) ? Math.max(0, Math.round(rep.shown(spec.groups))) : 0;
  const k = rep.known(spec.each) ? Math.max(0, Math.round(rep.shown(spec.each))) : 0;
  const bundled = spec.bundles === true && g > 12;
  const [tens, rest] = [Math.floor(g / 10), g % 10];

  return (
    <View style={{ gap: space.sm }}>
      {bundled ? (
        <Bundles groups={g} each={rep.known(spec.each) ? rep.value(spec.each, false) : undefined} />
      ) : (
        <View style={styles.groups}>
          {Array.from({ length: g }, (_, i) => (
            <View
              key={i}
              style={[
                styles.group,
                spec.unit === 10 && styles.rodGroup,
                { borderColor: c.chartInk },
              ]}
            >
              {spec.unit === 10
                ? Array.from({ length: k }, (_, j) => (
                    // A ten-rod: ten cubes in a column.
                    <View key={j} style={[styles.rod, { borderColor: c.chartInk }]}>
                      {Array.from({ length: 10 }, (_, q) => (
                        <View
                          key={q}
                          style={[
                            styles.rodCube,
                            {
                              backgroundColor: c.chartHighlight,
                              borderColor: c.chartInk,
                              ...raised(c, 10),
                            },
                          ]}
                        />
                      ))}
                    </View>
                  ))
                : Array.from({ length: k }, (_, j) => (
                    // Past 16 dots, they shrink so a group of up to 100 still fits the circle.
                    <CounterDot key={j} size={k > 16 ? dotSize(k) : 13} color={c.chartHighlight} />
                  ))}
            </View>
          ))}
        </View>
      )}
      <Caption>{`${rep.label(spec.groups)} groups of ${rep.label(spec.each)}${spec.unit === 10 ? ' tens' : ''}${
        bundled
          ? `   ·   ${tens} ${tens === 1 ? 'row' : 'rows'} of ten groups${rest ? ` and ${rest} more` : ''}`
          : ''
      }   ·   ${rep.label(spec.total)} in all`}</Caption>
      <Steppers
        calc={calc}
        items={[
          { var: spec.groups, steps: [1], pin: [spec.each] },
          { var: spec.each, steps: [1], pin: [spec.groups] },
        ]}
      />
    </View>
  );
}

/**
 * Many groups: rows of ten small circles, each with the number in a group (or a faded "?"), and
 * every full row of ten framed as one bundle.
 */
function Bundles({ groups, each }: { groups: number; each?: string }) {
  const c = usePalette();
  const rows = Math.ceil(groups / 10);
  const pad = 6;
  const gap = 4;
  const size = (w: number) => Math.min(34, (w - 4 - 2 * pad - 9 * gap) / 10);
  const rowH = (w: number) => size(w) + 2 * pad + gap;
  return (
    <Canvas aspect={(w) => (rows * rowH(w)) / w}>
      {({ w, h }) => {
        const d = size(w);
        const left = (w - (10 * d + 9 * gap + 2 * pad)) / 2;
        return (
          <Svg width={w} height={h}>
            {Array.from({ length: rows }, (_, r) => {
              const top = r * rowH(w);
              const n = Math.min(10, groups - 10 * r);
              return (
                <G key={r}>
                  {n === 10 ? (
                    <Rect
                      x={left}
                      y={top}
                      width={10 * d + 9 * gap + 2 * pad}
                      height={d + 2 * pad}
                      rx={8}
                      fill={c.chartSurface}
                      stroke={c.chartGrid}
                      strokeWidth={chart.strokeLight}
                    />
                  ) : null}
                  {Array.from({ length: n }, (_, i) => {
                    const cx = left + pad + i * (d + gap) + d / 2;
                    const cy = top + pad + d / 2;
                    return (
                      <G key={i}>
                        <Circle
                          cx={cx}
                          cy={cy}
                          r={d / 2 - 1}
                          fill={c.chartHighlight}
                          fillOpacity={0.25}
                          stroke={c.chartInk}
                          strokeWidth={chart.strokeLight}
                        />
                        <ChartText
                          x={cx}
                          y={cy + 4}
                          textAnchor="middle"
                          fontSize={Math.min(chart.label, d / 2.6)}
                          opacity={each === undefined ? 0.4 : 1}
                        >
                          {each ?? '?'}
                        </ChartText>
                      </G>
                    );
                  })}
                </G>
              );
            })}
          </Svg>
        );
      }}
    </Canvas>
  );
}

/** Dot side for k dots in the 68 px inside of a group circle, with 2 px gaps. */
const dotSize = (k: number) => Math.max(4, Math.floor(60 / Math.ceil(Math.sqrt(k))) - 2);

const styles = StyleSheet.create({
  groups: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: space.sm,
    paddingHorizontal: space.md,
  },
  group: {
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: chart.stroke,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignContent: 'center',
    justifyContent: 'center',
    gap: 4,
    padding: 10,
  },
  rodGroup: { width: 'auto', minWidth: 60, borderRadius: 16, gap: 3, paddingHorizontal: 8 },
  rod: { width: 7, borderWidth: 1 },
  rodCube: { height: 5, borderBottomWidth: StyleSheet.hairlineWidth },
  dot: { width: 13, height: 13, borderRadius: 7, borderWidth: chart.strokeLight },
});

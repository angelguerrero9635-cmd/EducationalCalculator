import { StyleSheet, View } from 'react-native';
import Svg, { Defs, G, Line, Path, Rect } from 'react-native-svg';

import { Text } from '@/components/Text';
import type { Representation } from '@/data/modules';
import { chart, font, space, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, ChartText, fitLabel, useRep } from './common';
import { TopLight, usePaintIds } from './paint';
import { SnapCube } from './snapCube';
import { Steppers } from './Steppers';

type Spec = Extract<Representation, { kind: 'cubeTrains' }>;

/** Row pieces: the train's name above it, room for the nubs, the bracket under a group. */
const NAME_H = 22;
const NUB = 5;
const BRACKET_H = 26;
const ROW_GAP = 10;
const SIDE = 16;

/**
 * Cube trains built from the same parts in different orders and groupings. Every train is
 * snap cubes on one left edge, each part in its own color; the part added first sits on a
 * soft band with a bracket under it naming its sum, and a dashed line at the right shows
 * every train ends at the same total: order and grouping don't change a sum.
 */
export function CubeTrains({ spec, calc }: { spec: Spec; calc: Calculator }) {
  const c = usePalette();
  const ids = usePaintIds('light');
  const rep = useRep(calc);
  const parts = [...new Set(spec.rows.flat(2))];
  // Connecting cubes in three colors, one per part.
  const shades = [c.chartHighlight, c.chartSecond, c.life];
  const count = (id: string) => (rep.known(id) ? Math.max(0, Math.round(rep.shown(id))) : 0);
  const shade = (id: string) => shades[parts.indexOf(id) % shades.length]!;
  // K–2 reads the numbers ("3 + 4"); later grades the letters ("a + b").
  const symbol = (id: string) => (rep.words ? rep.value(id, false) : rep.variable(id).symbol);
  const label = (row: Spec['rows'][number]) =>
    row.map((p) => (Array.isArray(p) ? `(${p.map(symbol).join(' + ')})` : symbol(p))).join(' + ');
  const lengthOf = (row: Spec['rows'][number]) => row.flat().reduce((n, id) => n + count(id), 0);
  // One cube size for every train, so equal sums look equally long on one line.
  const longest = Math.max(1, ...spec.rows.map(lengthOf));
  const rowH = (row: Spec['rows'][number], s: number) =>
    NAME_H + NUB + s + (row.some(Array.isArray) ? BRACKET_H : 6) + ROW_GAP;
  const sizeOf = (w: number) => Math.max(8, Math.min(28, (w - 2 * SIDE) / longest));
  const heightOf = (w: number) =>
    spec.rows.reduce((h, row) => h + rowH(row, sizeOf(w)), 0) - ROW_GAP + 4;
  const allSame = spec.rows.every((row) => lengthOf(row) === lengthOf(spec.rows[0]!));

  return (
    <View style={{ gap: space.sm }}>
      <Canvas aspect={(w) => heightOf(w) / w}>
        {({ w, h }) => {
          const s = sizeOf(w);
          const x0 = SIDE;
          let y = 0;
          const trains = spec.rows.map((row, r) => {
            const top = y + NAME_H + NUB;
            y += rowH(row, s);
            let at = 0;
            const pieces = row.map((p, g) => {
              const ids2 = Array.isArray(p) ? p : [p];
              const start = at;
              const cubes = ids2.flatMap((id) =>
                Array.from({ length: count(id) }, () => {
                  const i = at++;
                  return (
                    <SnapCube
                      key={`${r}-${i}`}
                      x={x0 + i * s + 0.5}
                      y={top}
                      s={s - 1}
                      color={shade(id)}
                      lightId={ids.light}
                    />
                  );
                }),
              );
              if (!Array.isArray(p)) return <G key={g}>{cubes}</G>;
              // The part added first: a soft band behind it and a bracket naming its sum.
              const [gx1, gx2] = [x0 + start * s, x0 + at * s];
              const sum = p.reduce((n, id) => n + count(id), 0);
              const allKnown = p.every((id) => rep.known(id));
              const text = `${p.map(symbol).join(' + ')} = ${allKnown ? sum : '?'}`;
              const by = top + s + 8;
              const lx = fitLabel((gx1 + gx2) / 2, text, chart.value, w);
              return (
                <G key={g}>
                  <Rect
                    x={gx1 - 4}
                    y={top - NUB - 3}
                    width={Math.max(0, gx2 - gx1) + 8}
                    height={s + NUB + 7}
                    rx={6}
                    fill={c.chartHighlight}
                    fillOpacity={0.14}
                    stroke={c.chartHighlight}
                    strokeOpacity={0.45}
                  />
                  {cubes}
                  {gx2 > gx1 ? (
                    <Path
                      d={`M ${gx1} ${by - 4} V ${by} H ${gx2} V ${by - 4} M ${(gx1 + gx2) / 2} ${by} v 4`}
                      fill="none"
                      stroke={c.chartMuted}
                      strokeWidth={chart.strokeLight}
                    />
                  ) : null}
                  <ChartText
                    x={lx.x}
                    y={by + 18}
                    textAnchor={lx.textAnchor}
                    fontSize={chart.value}
                    fontWeight="700"
                  >
                    {text}
                  </ChartText>
                </G>
              );
            });
            return (
              <G key={r}>
                <ChartText x={x0} y={top - NUB - 7} fontSize={chart.emphasis} fontWeight="600">
                  {label(row)}
                </ChartText>
                {pieces}
              </G>
            );
          });
          const end = x0 + longest * s;
          return (
            <Svg width={w} height={h}>
              <Defs>
                <TopLight id={ids.light} strength={1.2} />
              </Defs>
              {trains}
              {/* Every train ends here: the same total. */}
              {allSame && longest > 1 ? (
                <Line
                  x1={end}
                  y1={NAME_H - 2}
                  x2={end}
                  y2={h - 2}
                  stroke={c.chartMuted}
                  strokeDasharray={chart.dash}
                  strokeWidth={chart.strokeLight}
                />
              ) : null}
            </Svg>
          );
        }}
      </Canvas>
      <Text style={[styles.total, { color: c.text }]}>
        {`Every train: ${rep.label(spec.total)} cubes`}
      </Text>
      <Steppers
        calc={calc}
        items={parts.map((id) => ({ var: id, steps: [1], pin: parts.filter((x) => x !== id) }))}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  total: { fontSize: font.body, fontWeight: '600', textAlign: 'center' },
});

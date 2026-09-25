import { StyleSheet, View } from 'react-native';
import Svg, { Rect } from 'react-native-svg';

import { Text } from '@/components/Text';
import type { Representation } from '@/data/modules';
import { chart, font, space, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, ChartText, useRep } from './common';
import { Steppers } from './Steppers';

type Spec = Extract<Representation, { kind: 'fractionBars' }>;

/** Fraction bars of the same whole, one under another, so their sizes compare at a glance. */
export function FractionBars({ spec, calc }: { spec: Spec; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  const rows = spec.rows.map((r) => {
    const den = Math.max(1, Math.round(rep.shown(r.den)));
    const num = Math.min(den, Math.max(0, Math.round(rep.shown(r.num))));
    return { num, den, known: rep.known(r.num) && rep.known(r.den) };
  });
  const [p, q] = rows;
  const both = p && q && p.known && q.known;
  // Compare without decimals: a/b vs c/d is a·d vs c·b.
  const cmp = both ? Math.sign(p.num * q.den - q.num * p.den) : 0;
  const sign = cmp > 0 ? '>' : cmp < 0 ? '<' : '=';

  return (
    <View>
      <Canvas aspect={(w) => (rows.length * 58 + 12) / w}>
        {({ w }) => {
          const left = 56;
          const bw = w - left - 16;
          const bh = 40;
          const gap = 18;
          return (
            <Svg width={w} height={rows.length * (bh + gap) + 8}>
              {rows.map((r, i) => {
                const y = 8 + i * (bh + gap);
                const part = bw / r.den;
                return [
                  <ChartText
                    key={`l${i}`}
                    x={left - 12}
                    y={y + bh / 2 + 6}
                    fontSize={chart.emphasis}
                    fontWeight="700"
                    textAnchor="end"
                  >
                    {r.known ? `${r.num}/${r.den}` : '?'}
                  </ChartText>,
                  ...Array.from({ length: r.den }, (_, k) => (
                    <Rect
                      key={`p${i}-${k}`}
                      x={left + k * part}
                      y={y}
                      width={part}
                      height={bh}
                      fill={r.known && k < r.num ? c.chartHighlight : c.chartSurface}
                      stroke={c.chartInk}
                      strokeWidth={chart.strokeLight}
                    />
                  )),
                ];
              })}
            </Svg>
          );
        }}
      </Canvas>
      {both ? (
        <Text style={[styles.caption, { color: c.text }]}>
          {spec.equal
            ? cmp === 0
              ? `${p.num}/${p.den} = ${q.num}/${q.den}: the shaded parts are the same size.`
              : `${p.num}/${p.den} ${sign} ${q.num}/${q.den}: not the same size.`
            : `${p.num}/${p.den} ${sign} ${q.num}/${q.den}`}
        </Text>
      ) : null}
      <Steppers
        calc={calc}
        items={spec.controls.map((id) => ({
          var: id,
          steps: [1],
          pin: spec.controls.filter((x) => x !== id),
        }))}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  caption: {
    fontSize: font.body,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: space.sm,
    paddingHorizontal: space.lg,
  },
});

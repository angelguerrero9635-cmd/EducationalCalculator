import { View } from 'react-native';
import Svg, { Rect } from 'react-native-svg';

import type { Representation } from '@/data/modules';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, ChartText, useRep, Caption } from './common';
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
  const [pi, qi, ai, bi] = spec.compare ?? [0, 1];
  const p = rows[pi];
  const q = rows[qi];
  const both = p && q && p.known && q.known;
  // Compare without decimals: a/b vs c/d is a·d vs c·b.
  const cmp = both ? Math.sign(p!.num * q!.den - q!.num * p!.den) : 0;
  const sign = cmp > 0 ? '>' : cmp < 0 ? '<' : '=';
  const frac = (r: { num: number; den: number } | undefined) => (r ? `${r.num}/${r.den}` : '?');
  // "9/12 > 8/12, so 3/4 > 2/3" when the caption speaks for a second pair too.
  const meaning =
    ai !== undefined && bi !== undefined && rows[ai]?.known && rows[bi]?.known
      ? `, so ${frac(rows[ai])} ${sign} ${frac(rows[bi])}`
      : '';

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
                // Many thin parts outlined one by one merge into a dark band: past 24 parts
                // the parts are unlined and the bar keeps a single outline.
                const lined = r.den <= 24;
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
                      stroke={lined ? c.chartInk : 'none'}
                      strokeWidth={lined ? chart.strokeLight : 0}
                    />
                  )),
                  lined ? null : (
                    <Rect
                      key={`o${i}`}
                      x={left}
                      y={y}
                      width={bw}
                      height={bh}
                      fill="none"
                      stroke={c.chartInk}
                      strokeWidth={chart.strokeLight}
                    />
                  ),
                ];
              })}
            </Svg>
          );
        }}
      </Canvas>
      {spec.caption ? (
        <Caption>
          {spec.caption.replace(/\{(\w+)\}/g, (_, id: string) =>
            rep.known(id) ? String(Math.round(rep.shown(id))) : '?',
          )}
        </Caption>
      ) : both ? (
        <Caption>
          {spec.equal
            ? cmp === 0
              ? `${p.num}/${p.den} = ${q.num}/${q.den}: the shaded parts are the same size.`
              : `${p.num}/${p.den} ${sign} ${q.num}/${q.den}: not the same size.`
            : `${p.num}/${p.den} ${sign} ${q.num}/${q.den}${meaning}`}
        </Caption>
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

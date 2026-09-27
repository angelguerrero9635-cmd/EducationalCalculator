import { View } from 'react-native';
import Svg, { Defs, Rect } from 'react-native-svg';

import type { Representation } from '@/data/modules';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { LitRect, TopLight, usePaintIds } from './paint';
import { Canvas, ChartText, useRep, Caption } from './common';
import { mixedParts } from './exact';
import { Steppers } from './Steppers';

type Spec = Extract<Representation, { kind: 'fractionBars' }>;

/** Whole bars a row can hold side by side at phone width. */
export const MAX_BAR_WHOLES = 6;

/**
 * Fraction bars of the same whole, one under another, so their sizes compare at a glance. A
 * fraction past one whole takes as many whole bars as it needs, side by side (7/4 is one whole
 * bar and 3/4 of the next), every whole the same size in every row.
 */
export function FractionBars({ spec, calc }: { spec: Spec; calc: Calculator }) {
  const c = usePalette();
  const paint = usePaintIds('light');
  const rep = useRep(calc);
  const rows = spec.rows.map((r) => {
    const den = Math.max(1, Math.round(rep.shown(r.den)));
    const known = rep.known(r.num) && rep.known(r.den);
    const num = Math.min(den * MAX_BAR_WHOLES, Math.max(0, Math.round(rep.shown(r.num))));
    // A "?" draws one empty whole, never the fallback's wholes.
    return { num, den, known, wholes: known ? Math.max(1, Math.ceil(num / den)) : 1 };
  });
  // Every row's wholes are the same size: as wide as the row that needs the most allows.
  const columns = Math.min(
    MAX_BAR_WHOLES,
    Math.max(spec.wholes ?? 1, ...rows.map((r) => r.wholes)),
  );
  // "7/4 = 1 3/4" for each fraction the caption compares that is past one whole.
  const past = (r: { num: number; den: number; known: boolean } | undefined) =>
    r && r.known && r.num > r.den ? [`${r.num}/${r.den} = ${mixedParts(r.num, r.den)}`] : [];
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
          const bh = 40;
          const gap = 18;
          // Wholes side by side with a small gap between them.
          const between = columns > 1 ? 6 : 0;
          const ww = (w - left - 16 - between * (columns - 1)) / columns;
          return (
            <Svg width={w} height={rows.length * (bh + gap) + 8}>
              <Defs>
                <TopLight id={paint.light} />
              </Defs>
              {rows.map((r, i) => {
                const y = 8 + i * (bh + gap);
                const part = ww / r.den;
                // Many thin parts outlined one by one merge into a dark band: past 24 parts
                // (or under 4 px each) the parts are unlined and each bar keeps one outline.
                const lined = r.den <= 24 && part >= 4;
                // Past one whole, the mixed number under the fraction: 7/4 is 1 3/4.
                const over = r.known && r.num > r.den;
                return [
                  <ChartText
                    key={`l${i}`}
                    x={left - 12}
                    y={y + bh / 2 + (over ? 0 : 6)}
                    fontSize={chart.emphasis}
                    fontWeight="700"
                    textAnchor="end"
                  >
                    {r.known ? `${r.num}/${r.den}` : '?'}
                  </ChartText>,
                  over ? (
                    <ChartText
                      key={`m${i}`}
                      x={left - 12}
                      y={y + bh / 2 + 15}
                      fontSize={chart.small}
                      fill={c.chartMuted}
                      textAnchor="end"
                    >
                      {mixedParts(r.num, r.den)}
                    </ChartText>
                  ) : null,
                  ...Array.from({ length: r.wholes }, (_, b) => {
                    const x0 = left + b * (ww + between);
                    return [
                      ...Array.from({ length: r.den }, (_, k) => (
                        <LitRect
                          lightId={paint.light}
                          key={`p${i}-${b}-${k}`}
                          x={x0 + k * part}
                          y={y}
                          width={part}
                          height={bh}
                          fill={
                            r.known && b * r.den + k < r.num ? c.chartHighlight : c.chartSurface
                          }
                          stroke={lined ? c.chartInk : 'none'}
                          strokeWidth={lined ? chart.strokeLight : 0}
                        />
                      )),
                      lined && columns === 1 ? null : (
                        // Each whole keeps a firm outline, so the wholes count at a glance.
                        <Rect
                          key={`o${i}-${b}`}
                          x={x0}
                          y={y}
                          width={ww}
                          height={bh}
                          fill="none"
                          stroke={c.chartInk}
                          strokeWidth={lined ? chart.stroke : chart.strokeLight}
                        />
                      ),
                    ];
                  }),
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
          {[
            spec.equal
              ? cmp === 0
                ? `${p.num}/${p.den} = ${q.num}/${q.den}: the shaded parts are the same size.`
                : `${p.num}/${p.den} ${sign} ${q.num}/${q.den}: not the same size.`
              : `${p.num}/${p.den} ${sign} ${q.num}/${q.den}${meaning}`,
            ...past(p),
            ...past(q),
          ].join(' · ')}
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

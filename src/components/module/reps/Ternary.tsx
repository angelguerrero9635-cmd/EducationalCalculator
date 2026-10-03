/**
 * HC116 `ternary` (TernarySpec in typesHe4f.ts): three amounts plotted on a triangle with a 10 %
 * grid, the corners named; with `fields`, the IUGS QAP fields (numbered, keyed under the
 * triangle) or the feldspar fields (named along the edges), the point's field lit and named in
 * the caption. Flat; no handles.
 */
import { View } from 'react-native';
import Svg, { G, Line, Path, Circle } from 'react-native-svg';

import type { TernarySpec } from '@/data/modules/typesHe4f';
import { formatNumber } from '@/engine/format';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, Caption, ChartText, fitLabel, useRep } from './common';
import {
  ANORTHOCLASE_TO,
  FELDSPAR_EDGE,
  FELDSPAR_FIELDS,
  PLAGIOCLASE,
  QAP_FIELDS,
  QAP_LEVELS,
  QAP_SHARES,
  baryXY,
  centroid,
  normalize,
  ternaryField,
  type Bary,
} from './he4fMath';

const BW = 360;
const S = 270;
const X0 = (BW - S) / 2;
const TOP = 34;
const BASE = TOP + (S * Math.sqrt(3)) / 2;

const QAP_KEY = [
  '1a quartzolite · 1b quartz-rich granitoid',
  '2 alkali-feldspar granite · 3a syenogranite',
  '3b monzogranite · 4 granodiorite · 5 tonalite',
  '6–10 alkali-feldspar syenite, syenite,',
  'monzonite, monzodiorite, diorite (or gabbro)',
  '6*–10* the same with “quartz” in front',
];

/** Three significant figures (a share of 0 or 100 stays whole). */
const n3 = (x: number) => formatNumber(Number(x.toPrecision(3)));

/** A barycentric point in the drawing's coordinates. */
const at = (p: Bary): [number, number] => {
  const [x, y] = baryXY(p);
  return [X0 + S * x, BASE - S * y];
};
const poly = (ps: Bary[]) =>
  ps.map((p, i) => `${i ? 'L' : 'M'}${at(p)[0].toFixed(1)},${at(p)[1].toFixed(1)}`).join('') + 'Z';

export function Ternary({ spec, calc }: { spec: TernarySpec; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  type V = number | string | undefined;
  const known = (v: V) => v !== undefined && (typeof v === 'number' || rep.known(v));
  const get = (v: V): number | undefined =>
    !known(v) ? undefined : typeof v === 'number' ? v : rep.val(v as string);
  const [a, b, cc] = [get(spec.a), get(spec.b), get(spec.c)];
  const p =
    a === undefined || b === undefined || cc === undefined ? undefined : normalize(a, b, cc);
  const kind = spec.fields;
  const field = p && kind ? ternaryField(kind, p) : undefined;
  const fields = kind === 'qap' ? QAP_FIELDS : kind === 'feldspar' ? FELDSPAR_FIELDS : [];
  const pt = p ? at(p) : undefined;
  const share = p && p[1] + p[2] > 0 ? p[2] / (p[1] + p[2]) : undefined;
  const [L0, L1, L2] = spec.labels;
  const keyTop = BASE + 50;
  const height = kind === 'qap' ? keyTop + 15 * (QAP_KEY.length - 1) + 10 : BASE + 44;

  const lines: string[] = [];
  if (!p) lines.push(`Type the three amounts to plot the point (their sum must be above 0).`);
  else {
    // The page's own percents when it names them (else the picture's), to 3 figures.
    const say = (i: 0 | 1 | 2) => n3(get(spec.normalized?.[i]) ?? 100 * p[i]);
    const prime = kind === 'qap' ? '′' : '';
    lines.push(
      `${L0}${prime} = ${say(0)}%, ${L1}${prime} = ${say(1)}%, ${L2}${prime} = ${say(2)}% of ${L0} + ${L1} + ${L2}.`,
    );
    if (share !== undefined && spec.share !== undefined)
      lines.push(`${L2} ÷ (${L1} + ${L2}) = ${n3(get(spec.share) ?? 100 * share)}%.`);
    if (field)
      lines.push(
        kind === 'qap'
          ? `The point is in field ${field.code}: ${field.name}.`
          : `The point's field: ${field.name}.`,
      );
  }

  return (
    <View>
      <Canvas aspect={height / BW}>
        {({ w, h }) => (
          <Svg width={w} height={h}>
            <G transform={`scale(${w / BW})`}>
              {/* The point's field, lit. */}
              {field ? (
                <Path d={poly(field.poly)} fill={c.chartHighlight} fillOpacity={0.18} />
              ) : null}
              {/* The 10 % grid, parallel to each side. */}
              {Array.from({ length: 9 }, (_, i) => (i + 1) / 10).map((k) => (
                <G key={k}>
                  {(
                    [
                      [
                        [k, 1 - k, 0],
                        [k, 0, 1 - k],
                      ],
                      [
                        [1 - k, k, 0],
                        [0, k, 1 - k],
                      ],
                      [
                        [1 - k, 0, k],
                        [0, 1 - k, k],
                      ],
                    ] as [Bary, Bary][]
                  ).map(([u, v], j) => (
                    <Line
                      key={j}
                      x1={at(u)[0]}
                      y1={at(u)[1]}
                      x2={at(v)[0]}
                      y2={at(v)[1]}
                      stroke={c.chartGrid}
                      strokeWidth={1}
                    />
                  ))}
                </G>
              ))}
              {/* The fields' edges. */}
              {fields.map((f) => (
                <Path
                  key={f.code}
                  d={poly(f.poly)}
                  fill="none"
                  stroke={c.chartInk}
                  strokeWidth={1}
                  strokeLinejoin="round"
                />
              ))}
              <Path
                d={poly([
                  [1, 0, 0],
                  [0, 1, 0],
                  [0, 0, 1],
                ])}
                fill="none"
                stroke={c.chartInk}
                strokeWidth={chart.stroke}
                strokeLinejoin="round"
              />
              {/* QAP: field numbers, the Q′ rows on the left edge, the shares along the base. */}
              {kind === 'qap' ? (
                <G>
                  {QAP_FIELDS.filter((f) => f.code !== '1a').map((f) => {
                    const [cx, y] = at(centroid(f.poly));
                    const thin = /^\d+$/.test(f.code) && Number(f.code) >= 6;
                    // A number the point would hide is left out: its field is lit and named.
                    const ty = thin ? BASE - 6 : y;
                    if (pt && Math.hypot(pt[0] - cx, pt[1] - ty) < 14) return null;
                    return (
                      <ChartText
                        key={f.code}
                        x={cx}
                        y={thin ? BASE - 2 : y + 4}
                        textAnchor="middle"
                        fontWeight={f === field ? '700' : '400'}
                        fill={f === field ? c.chartHighlight : c.chartInk}
                        halo
                      >
                        {f.code}
                      </ChartText>
                    );
                  })}
                  <ChartText
                    x={at([0.95, 0, 0.05])[0] + 8}
                    y={at([0.95, 0, 0.05])[1] + 4}
                    fontWeight={field?.code === '1a' ? '700' : '400'}
                    fill={field?.code === '1a' ? c.chartHighlight : c.chartInk}
                  >
                    1a
                  </ChartText>
                  {QAP_LEVELS.map((q) => {
                    const [x, y] = at([q, 1 - q, 0]);
                    return (
                      <ChartText key={q} x={x - 6} y={y + 4} textAnchor="end" fill={c.chartMuted}>
                        {formatNumber(100 * q)}
                      </ChartText>
                    );
                  })}
                  <ChartText
                    x={at([0.9, 0.1, 0])[0] - 6}
                    y={at([0.9, 0.1, 0])[1] - 12}
                    textAnchor="end"
                    fill={c.chartMuted}
                  >
                    {`${L0}′ (%)`}
                  </ChartText>
                  {QAP_SHARES.slice(1, -1).map((s) => (
                    <ChartText
                      key={s}
                      x={X0 + S * s}
                      y={BASE + 16}
                      textAnchor="middle"
                      fill={c.chartMuted}
                    >
                      {formatNumber(100 * s)}
                    </ChartText>
                  ))}
                  {QAP_KEY.map((t, i) => (
                    <ChartText key={i} x={14} y={keyTop + 15 * i} fill={c.chartInk}>
                      {t}
                    </ChartText>
                  ))}
                </G>
              ) : null}
              {/* Feldspar: plagioclase names under the base, alkali feldspars by the left edge. */}
              {kind === 'feldspar' ? (
                <G>
                  {PLAGIOCLASE.map(([s0, s1, name], i) => {
                    const lit = field?.code === name;
                    return (
                      <ChartText
                        key={name}
                        {...fitLabel(X0 + (S * (s0 + s1)) / 200, name, chart.label, BW)}
                        y={BASE + 16 + 14 * (i % 2)}
                        fontWeight={lit ? '700' : '400'}
                        fill={lit ? c.chartHighlight : c.chartInk}
                      >
                        {name}
                      </ChartText>
                    );
                  })}
                  {(
                    [
                      ['anorthoclase', (FELDSPAR_EDGE + ANORTHOCLASE_TO) / 2],
                      ['sanidine, orthoclase', (ANORTHOCLASE_TO + 1) / 2],
                    ] as const
                  ).map(([name, or]) => {
                    const [x, y] = at([or, 1 - or, 0]);
                    const lit = field?.code === name.split(',')[0];
                    return (
                      <ChartText
                        key={name}
                        x={x - 8}
                        y={y - 4}
                        textAnchor="middle"
                        transform={`rotate(-60 ${x - 8} ${y - 4})`}
                        fontWeight={lit ? '700' : '400'}
                        fill={lit ? c.chartHighlight : c.chartInk}
                      >
                        {name}
                      </ChartText>
                    );
                  })}
                  {['no single feldspar', '(miscibility gap)'].map((t, i) => (
                    <ChartText
                      key={t}
                      x={at([0.4, 0.3, 0.3])[0]}
                      y={at([0.4, 0.3, 0.3])[1] + 14 * i}
                      textAnchor="middle"
                      fontWeight={field?.code === 'gap' ? '700' : '400'}
                      fill={field?.code === 'gap' ? c.chartHighlight : c.chartMuted}
                      halo
                    >
                      {t}
                    </ChartText>
                  ))}
                </G>
              ) : null}
              {/* Corners. */}
              <ChartText
                x={X0 + S / 2}
                y={TOP - 10}
                textAnchor="middle"
                fontSize={chart.emphasis}
                fontWeight="700"
              >
                {L0}
              </ChartText>
              <ChartText
                x={X0 - 8}
                y={BASE + 5}
                textAnchor="end"
                fontSize={chart.emphasis}
                fontWeight="700"
              >
                {L1}
              </ChartText>
              <ChartText x={X0 + S + 8} y={BASE + 5} fontSize={chart.emphasis} fontWeight="700">
                {L2}
              </ChartText>
              {/* The base share, dashed from the top corner, and the point. */}
              {p && share !== undefined && spec.share !== undefined ? (
                <Line
                  x1={X0 + S / 2}
                  y1={TOP}
                  x2={X0 + S * share}
                  y2={BASE}
                  stroke={c.chartHighlight}
                  strokeWidth={chart.strokeLight}
                  strokeDasharray={chart.dash}
                />
              ) : null}
              {p ? (
                <Circle
                  cx={at(p)[0]}
                  cy={at(p)[1]}
                  r={5.5}
                  fill={c.chartHighlight}
                  stroke={c.background}
                  strokeWidth={1.5}
                />
              ) : null}
            </G>
          </Svg>
        )}
      </Canvas>
      <Caption>{lines.join(' ')}</Caption>
    </View>
  );
}

/**
 * HC148 (`functionGraph` `family: 'amplification'`, FamilyHe4e in typesHe4e.ts): qPCR. Each
 * curve is a logistic placed to meet the threshold at its Ct (doubling each cycle far below the
 * plateau); the threshold is a dashed level, each crossing dropped to the cycle axis with its Ct
 * written in a row for its gene. Two genes in two colours; treated dashed, control solid. Flat;
 * no handles.
 */
import { View } from 'react-native';
import Svg, { Circle, G, Line, Path } from 'react-native-svg';

import type { FunctionGraphSpec } from '@/data/modules/typesFunctionGraph';
import { formatNumber } from '@/engine/format';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, Caption, ChartText, useRep } from './common';
import { ampAt, ampMid } from './he4eMath';

const n4 = (x: number) => formatNumber(Number(x.toPrecision(4)));

export function AmplificationHe4e({ spec, calc }: { spec: FunctionGraphSpec; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  if (spec.family !== 'amplification') return null;
  type V = number | string | undefined;
  const known = (v: V) => v !== undefined && (typeof v === 'number' || rep.known(v));
  const get = (v: V): number | undefined =>
    !known(v) ? undefined : typeof v === 'number' ? v : rep.shown(v as string);
  const say = (v: V, x: number) => (typeof v === 'string' ? rep.value(v, false) : n4(x));
  const th = spec.threshold;
  const level = get(th.level) ?? 0.1;
  const levelOk = level > 0 && level < 1;
  const genes = [...new Set(th.curves.map((cv) => cv.name))].slice(0, 2);
  const colorOf = (name: string) => (genes.indexOf(name) === 1 ? c.fnSecond : c.chartHighlight);
  const curves = th.curves.slice(0, 4).map((cv) => {
    const ct = get(cv.ct);
    return { ...cv, ctv: ct, mid: ct !== undefined && levelOk ? ampMid(ct, level) : undefined };
  });
  const cts = curves.flatMap((cv) => (cv.ctv === undefined ? [] : [cv.ctv]));
  const X = Math.min(
    50,
    Math.max(30, Math.ceil(((cts.length ? Math.max(...cts) : 20) + 10) / 5) * 5),
  );

  // ── Caption ──
  const lines: string[] = [];
  for (const g of genes) {
    const mine = curves.filter((cv) => cv.name === g);
    lines.push(
      `${g}: ${mine
        .map(
          (cv) =>
            `${cv.treated ? 'treated' : 'control'} Ct = ${cv.ctv === undefined ? '?' : say(cv.ct, cv.ctv)}`,
        )
        .join(', ')}.`,
    );
  }
  const find = (g: string | undefined, treated: boolean) =>
    curves.find((cv) => cv.name === g && !!cv.treated === treated)?.ctv;
  const [tT, tC, rT, rC] = [
    find(genes[0], true),
    find(genes[0], false),
    find(genes[1], true),
    find(genes[1], false),
  ];
  if ([tT, tC, rT, rC].every((x) => x !== undefined)) {
    const ddct = tT! - rT! - (tC! - rC!);
    lines.push(
      `ΔCt: treated ${n4(tT! - rT!)}, control ${n4(tC! - rC!)}; ΔΔCt = ${n4(ddct)}, so the fold change is 2^(−ΔΔCt) = ${n4(2 ** -ddct)}.`,
    );
  }
  lines.push(
    'Far below the plateau each curve doubles every cycle: one cycle earlier, twice the start.',
  );

  return (
    <View>
      <Canvas aspect={(w) => (30 + Math.min(220, 0.5 * w) + 76) / w}>
        {({ w, h }) => {
          const L = 30;
          const R = 14;
          const top = 30;
          const ph = Math.min(220, 0.5 * w);
          const base = top + ph;
          const sx = (cyc: number) => L + (cyc / X) * (w - L - R);
          const sy = (f: number) => base - (f / 1.08) * ph;
          const pathOf = (mid: number) => {
            let d = '';
            for (let i = 0; i <= 240; i++) {
              const cyc = (X * i) / 240;
              d += `${i ? 'L' : 'M'}${sx(cyc).toFixed(1)},${sy(ampAt(cyc, mid)).toFixed(1)}`;
            }
            return d;
          };
          const ticks: number[] = [];
          for (let t = 0; t <= X; t += 10) ticks.push(t);
          // Ct labels: one row per gene, nudged apart where two would touch.
          const rows = genes.map((g, gi) => {
            const xs = [
              ...new Set(
                curves.filter((cv) => cv.name === g && cv.ctv !== undefined).map((cv) => cv.ctv!),
              ),
            ].sort((a, b) => a - b);
            let right = -Infinity;
            return xs.map((x) => {
              const text = n4(x);
              const half = (text.length * chart.label * 0.6) / 2;
              const cx = Math.max(sx(x), right + 6 + half);
              right = cx + half;
              return { text, x: cx, y: base + 34 + gi * 16, color: colorOf(g) };
            });
          });
          return (
            <Svg width={w} height={h}>
              {/* Key: genes by colour, treated dashed. */}
              {genes.map((g, i) => (
                <G key={`k${g}`}>
                  <Line
                    x1={L + i * 104}
                    y1={10}
                    x2={L + i * 104 + 16}
                    y2={10}
                    stroke={colorOf(g)}
                    strokeWidth={chart.stroke}
                  />
                  <ChartText x={L + i * 104 + 20} y={14} fill={colorOf(g)} fontWeight="700">
                    {g}
                  </ChartText>
                </G>
              ))}
              <Line
                x1={w - R - 70}
                y1={10}
                x2={w - R - 54}
                y2={10}
                stroke={c.chartMuted}
                strokeWidth={chart.stroke}
                strokeDasharray={chart.dash}
              />
              <ChartText x={w - R} y={14} textAnchor="end" fill={c.chartMuted}>
                treated
              </ChartText>
              {/* Axes. */}
              <Line
                x1={L}
                y1={base}
                x2={w - R}
                y2={base}
                stroke={c.chartInk}
                strokeWidth={chart.strokeLight}
              />
              <Line
                x1={L}
                y1={top}
                x2={L}
                y2={base}
                stroke={c.chartInk}
                strokeWidth={chart.strokeLight}
              />
              {[0, 0.5, 1].map((f) => (
                <G key={`y${f}`}>
                  <Line
                    x1={L - 4}
                    y1={sy(f)}
                    x2={L}
                    y2={sy(f)}
                    stroke={c.chartInk}
                    strokeWidth={1}
                  />
                  <ChartText x={L - 6} y={sy(f) + 4} textAnchor="end" fill={c.chartMuted}>
                    {formatNumber(f)}
                  </ChartText>
                </G>
              ))}
              <ChartText x={L + 6} y={top + 2} fontStyle="italic" fontWeight="700">
                F
              </ChartText>
              {ticks.map((t) => (
                <G key={`x${t}`}>
                  <Line
                    x1={sx(t)}
                    y1={base}
                    x2={sx(t)}
                    y2={base + 5}
                    stroke={c.chartInk}
                    strokeWidth={1}
                  />
                  <ChartText x={sx(t)} y={base + 17} textAnchor="middle" fill={c.chartMuted}>
                    {formatNumber(t)}
                  </ChartText>
                </G>
              ))}
              {/* The curves. */}
              {curves.map((cv, i) =>
                cv.mid === undefined ? null : (
                  <Path
                    key={`c${i}`}
                    d={pathOf(cv.mid)}
                    fill="none"
                    stroke={colorOf(cv.name)}
                    strokeWidth={chart.stroke}
                    strokeDasharray={cv.treated ? chart.dash : undefined}
                  />
                ),
              )}
              {/* The threshold and each crossing, dropped to the cycle axis. */}
              {levelOk ? (
                <G>
                  <Line
                    x1={L}
                    y1={sy(level)}
                    x2={w - R}
                    y2={sy(level)}
                    stroke={c.normalReject}
                    strokeWidth={chart.strokeLight}
                    strokeDasharray={chart.dashFine}
                  />
                  <ChartText
                    x={w - R}
                    y={sy(level) - 5}
                    textAnchor="end"
                    fill={c.normalReject}
                    fontWeight="700"
                    halo
                  >
                    threshold
                  </ChartText>
                </G>
              ) : null}
              {curves.map((cv, i) =>
                cv.ctv === undefined || !levelOk ? null : (
                  <G key={`x${i}`}>
                    <Line
                      x1={sx(cv.ctv)}
                      y1={sy(level)}
                      x2={sx(cv.ctv)}
                      y2={base}
                      stroke={colorOf(cv.name)}
                      strokeWidth={1}
                      strokeDasharray={chart.dashFine}
                    />
                    <Circle cx={sx(cv.ctv)} cy={sy(level)} r={3.5} fill={colorOf(cv.name)} />
                  </G>
                ),
              )}
              <ChartText x={4} y={base + 34} fill={c.chartMuted} fontWeight="700">
                Ct
              </ChartText>
              {rows.flat().map((r, i) => (
                <ChartText
                  key={`r${i}`}
                  x={r.x}
                  y={r.y}
                  textAnchor="middle"
                  fill={r.color}
                  fontWeight="700"
                >
                  {r.text}
                </ChartText>
              ))}
              <ChartText x={(L + w - R) / 2} y={base + 70} textAnchor="middle" fill={c.chartMuted}>
                Cycle
              </ChartText>
            </Svg>
          );
        }}
      </Canvas>
      <Caption>{lines.join(' ')}</Caption>
    </View>
  );
}

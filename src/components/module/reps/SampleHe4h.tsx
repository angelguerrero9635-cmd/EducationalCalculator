/**
 * Group H's options on `sample` (typesHe4h.ts). HC135 `pattern`: n points in a square, seeded,
 * placed clustered, random or dispersed so their nearest-neighbour index is the page's R, with an
 * R gauge under them and segments to each point's nearest neighbour on tap. HC150 `herd`: 100
 * people, the immune share shaded, one case with arrows to its R₀ contacts, the arrows to immune
 * people stopped. Flat; no handles.
 */
import { useState } from 'react';
import { View } from 'react-native';
import Svg, { Circle, G, Line, Path, Rect } from 'react-native-svg';

import type { SampleHerdSpec, SamplePatternSpec } from '@/data/modules/typesHe4h';
import { formatNumber } from '@/engine/format';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { PictureButton } from './chance';
import { Canvas, Caption, ChartText, useRep } from './common';
import {
  HERD_PEOPLE,
  NNI_MAX,
  PATTERN_MAX,
  herdPlan,
  nearestNeighbours,
  patternPoints,
} from './he4hMath';

const n3 = (x: number) => formatNumber(Number(x.toPrecision(3)));
type V = number | string | undefined;

function useValues(calc: Calculator) {
  const rep = useRep(calc);
  const known = (v: V) => v !== undefined && (typeof v === 'number' || rep.known(v));
  const get = (v: V): number | undefined =>
    !known(v) ? undefined : typeof v === 'number' ? v : rep.shown(v as string);
  const say = (v: V, x: number, unit = '') =>
    typeof v === 'string' && rep.typed(v)
      ? rep.value(v, unit !== '')
      : `${n3(x)}${unit ? (unit === '%' ? unit : ` ${unit}`) : ''}`;
  return { rep, get, say };
}

export function SampleHe4h({
  spec,
  calc,
}: {
  spec: SamplePatternSpec | SampleHerdSpec;
  calc: Calculator;
}) {
  return 'pattern' in spec ? (
    <SamplePattern spec={spec} calc={calc} />
  ) : (
    <SampleHerd spec={spec} calc={calc} />
  );
}

// ─── HC135: pattern ─────────────────────────────────────────────────────────────

function SamplePattern({ spec, calc }: { spec: SamplePatternSpec; calc: Calculator }) {
  const c = usePalette();
  const { get, say } = useValues(calc);
  const [links, setLinks] = useState(false);
  const p = spec.pattern;
  const nRaw = get(p.n);
  const n = nRaw !== undefined && nRaw >= 2 ? Math.round(nRaw) : undefined;
  const R = get(p.index);
  const A = get(p.area);
  const dbar = get(p.observed);
  const drawnN = n !== undefined ? Math.min(PATTERN_MAX, n) : undefined;
  const made =
    drawnN !== undefined && R !== undefined && R > 0 ? patternPoints(drawnN, R, p.seed) : undefined;
  const near = made ? nearestNeighbours(made.points) : [];
  const expected = n !== undefined && A !== undefined && A > 0 ? 0.5 / Math.sqrt(n / A) : undefined;
  const kind = (r: number) => (r < 0.9 ? 'clustered' : r > 1.1 ? 'dispersed' : 'about random');

  const lines: string[] = [];
  if (expected !== undefined)
    lines.push(
      `Expected mean distance for ${say(p.n, n!)} random points in ${say(p.area, A!, 'km²')}: 0.5 ÷ √(${n3(n!)} ÷ ${n3(A!)}) = ${say(p.expected, expected, 'km')}.`,
    );
  if (R !== undefined)
    lines.push(
      `${dbar !== undefined && expected !== undefined ? `R = ${say(p.observed, dbar, 'km')} ÷ ${n3(expected)} km = ${say(p.index, R)}` : `R = ${say(p.index, R)}`}: ${kind(R)}.`,
    );
  if (n !== undefined && A !== undefined && A > 0 && dbar !== undefined && expected !== undefined) {
    const se = 0.26136 / Math.sqrt((n * n) / A);
    lines.push(
      `SE = 0.26136 ÷ √(${n3(n)}² ÷ ${n3(A)}) = ${say(p.se, se)} km; z = (${n3(dbar)} − ${n3(expected)}) ÷ ${n3(se)} = ${say(p.z, (dbar - expected) / se)}.`,
    );
  }
  if (made)
    lines.push(
      `${drawnN! < n! ? `${drawnN} of the ${formatNumber(n!)} points drawn, in the same pattern; their` : 'The drawn points’'} own index is ${n3(made.R)}${Math.abs(made.R - R!) > 0.05 ? ', as near as these points can come' : ''}.`,
    );
  else lines.push('Type n and R to scatter the points.');

  return (
    <View>
      <Canvas aspect={(w) => patternLayout(w).h / w}>
        {({ w }) => {
          const L = patternLayout(w);
          const X = (u: number) => L.x + 5 + u * (L.s - 10);
          const Y = (u: number) => L.y + 5 + u * (L.s - 10);
          const gx = (r: number) => L.gx + (Math.min(NNI_MAX, Math.max(0, r)) / NNI_MAX) * L.gw;
          return (
            <Svg width={w} height={L.h}>
              <Rect
                x={L.x}
                y={L.y}
                width={L.s}
                height={L.s}
                fill={c.he4hMapPaper}
                stroke={c.chartInk}
                strokeWidth={chart.strokeLight}
              />
              {links && made
                ? made.points.map((q, i) => {
                    const to = made.points[near[i]!]!;
                    return (
                      <Line
                        key={`l${i}`}
                        x1={X(q.x)}
                        y1={Y(q.y)}
                        x2={X(to.x)}
                        y2={Y(to.y)}
                        stroke={c.chartHighlight}
                        strokeWidth={1.2}
                      />
                    );
                  })
                : null}
              {made?.points.map((q, i) => (
                <Circle
                  key={`p${i}`}
                  cx={X(q.x)}
                  cy={Y(q.y)}
                  r={drawnN! > 150 ? 2.2 : 3}
                  fill={c.chartInk}
                />
              ))}
              {A !== undefined ? (
                <ChartText
                  x={L.x + L.s / 2}
                  y={L.y + L.s + 16}
                  textAnchor="middle"
                  fill={c.chartMuted}
                >
                  {`${say(p.area, A, 'km²')}: ${n3(Math.sqrt(A))} km a side`}
                </ChartText>
              ) : null}
              {/* The R gauge: clustered to 0, random at 1, dispersed to 2.15. */}
              <Rect
                x={L.gx}
                y={L.gy}
                width={gx(0.9) - L.gx}
                height={8}
                fill={c.he4hContour}
                fillOpacity={0.35}
              />
              <Rect
                x={gx(0.9)}
                y={L.gy}
                width={gx(1.1) - gx(0.9)}
                height={8}
                fill={c.chartSurface}
                stroke={c.chartGrid}
              />
              <Rect
                x={gx(1.1)}
                y={L.gy}
                width={L.gx + L.gw - gx(1.1)}
                height={8}
                fill={c.chartHighlight}
                fillOpacity={0.3}
              />
              {[0, 1, NNI_MAX].map((r) => (
                <ChartText
                  key={`t${r}`}
                  x={gx(r)}
                  y={L.gy + 24}
                  textAnchor="middle"
                  fill={c.chartMuted}
                >
                  {formatNumber(r)}
                </ChartText>
              ))}
              <ChartText x={L.gx} y={L.gy + 40} fill={c.chartMuted}>
                clustered
              </ChartText>
              <ChartText x={gx(1)} y={L.gy + 40} textAnchor="middle" fill={c.chartMuted}>
                random
              </ChartText>
              <ChartText x={L.gx + L.gw} y={L.gy + 40} textAnchor="end" fill={c.chartMuted}>
                dispersed
              </ChartText>
              {R !== undefined ? (
                <G>
                  <Path d={`M${gx(R)},${L.gy + 9}l-6,9h12z`} fill={c.chartInk} />
                  <ChartText x={gx(R)} y={L.gy - 6} textAnchor="middle" fontWeight="700">
                    {`R = ${say(p.index, R)}`}
                  </ChartText>
                </G>
              ) : null}
            </Svg>
          );
        }}
      </Canvas>
      {made ? (
        <PictureButton
          testID="pattern-links"
          label={links ? 'Hide nearest neighbours' : 'Show nearest neighbours'}
          onPress={() => setLinks((x) => !x)}
        />
      ) : null}
      <Caption>{lines.join(' ')}</Caption>
    </View>
  );
}

function patternLayout(w: number) {
  const s = Math.min(w - 40, 290);
  const x = (w - s) / 2;
  const gw = Math.min(w - 60, 280);
  return { s, x, y: 6, gx: (w - gw) / 2, gw, gy: 6 + s + 46, h: 6 + s + 46 + 48 };
}

// ─── HC150: herd ────────────────────────────────────────────────────────────────

function SampleHerd({ spec, calc }: { spec: SampleHerdSpec; calc: Calculator }) {
  const c = usePalette();
  const { rep, get, say } = useValues(calc);
  const hd = spec.herd;
  const r0 = get(hd.r0);
  const raw = get(hd.immune);
  const pct = typeof hd.immune === 'string' && rep.unit(hd.immune) === '%';
  const share = raw === undefined ? undefined : pct ? raw / 100 : raw;
  const plan = r0 !== undefined && share !== undefined ? herdPlan(r0, share) : undefined;
  const contacts = plan?.contacts ?? [];
  const immune = new Set(plan?.immune ?? []);

  const lines: string[] = [];
  if (plan && r0 !== undefined && share !== undefined) {
    const reached = contacts.filter((k) => !immune.has(k)).length;
    lines.push(
      `${plan.immune.length} of ${HERD_PEOPLE} people are immune (${say(hd.immune, pct ? raw! : share, pct ? '%' : '')}). The case meets R₀ = ${say(hd.r0, r0)} people${contacts.length !== r0 ? ` (${contacts.length} drawn)` : ''}: ${plan.stopped} ${plan.stopped === 1 ? 'arrow stops' : 'arrows stop'} at immune people and ${reached} ${reached === 1 ? 'passes' : 'pass'} it on.`,
      `Each case now infects R₀(1 − p) = ${n3(r0)} × (1 − ${n3(share)}) = ${n3(r0 * (1 - share))}${r0 * (1 - share) <= 1 + 1e-9 ? ': at or below 1, the outbreak dies out' : ': above 1, it still spreads'}.`,
    );
  } else lines.push('Type R₀ and the immune share to draw the contacts.');

  return (
    <View>
      <Canvas aspect={(w) => herdLayout(w).h / w}>
        {({ w }) => {
          const L = herdLayout(w);
          const at = (k: number) => ({
            x: L.x + ((k % 10) + 0.5) * L.cell,
            y: L.y + (Math.floor(k / 10) + 0.5) * L.cell,
          });
          const caseAt = at(plan?.index ?? 44);
          const person = (k: number) => {
            const p = at(k);
            const s = L.cell;
            const isCase = plan !== undefined && k === plan.index;
            const isImm = immune.has(k);
            const hit = contacts.includes(k) && !isImm;
            const fill = isCase ? c.he4hCase : isImm ? c.he4hImmune : hit ? c.he4hCaseSoft : c.card;
            const ink = isCase || hit ? c.he4hCase : isImm ? c.he4hImmune : c.chartMuted;
            return (
              <G key={`m${k}`}>
                <Circle
                  cx={p.x}
                  cy={p.y - s * 0.17}
                  r={s * 0.14}
                  fill={fill}
                  stroke={ink}
                  strokeWidth={1.2}
                />
                <Path
                  d={`M${p.x - s * 0.24},${p.y + s * 0.3}Q${p.x - s * 0.24},${p.y} ${p.x},${p.y}Q${p.x + s * 0.24},${p.y} ${p.x + s * 0.24},${p.y + s * 0.3}Z`}
                  fill={fill}
                  stroke={ink}
                  strokeWidth={1.2}
                />
              </G>
            );
          };
          return (
            <Svg width={w} height={L.h}>
              {Array.from({ length: HERD_PEOPLE }, (_, k) => person(k))}
              {contacts.map((k) => {
                const to = at(k);
                const dx = to.x - caseAt.x;
                const dy = to.y - caseAt.y;
                const d = Math.hypot(dx, dy);
                const ux = dx / d;
                const uy = dy / d;
                const stop = immune.has(k);
                const start = L.cell * 0.32;
                const end = stop ? d - L.cell * 0.55 : d - L.cell * 0.36;
                const ex = caseAt.x + ux * end;
                const ey = caseAt.y + uy * end;
                return (
                  <G key={`a${k}`}>
                    <Line
                      x1={caseAt.x + ux * start}
                      y1={caseAt.y + uy * start}
                      x2={ex}
                      y2={ey}
                      stroke={c.he4hCase}
                      strokeWidth={1.5}
                      strokeDasharray={stop ? chart.dashFine : undefined}
                    />
                    {stop ? (
                      <Line
                        x1={ex - uy * 5}
                        y1={ey + ux * 5}
                        x2={ex + uy * 5}
                        y2={ey - ux * 5}
                        stroke={c.he4hCase}
                        strokeWidth={2.2}
                      />
                    ) : (
                      <Path
                        d={`M${ex},${ey}L${ex - ux * 7 - uy * 4},${ey - uy * 7 + ux * 4}L${ex - ux * 7 + uy * 4},${ey - uy * 7 - ux * 4}Z`}
                        fill={c.he4hCase}
                      />
                    )}
                  </G>
                );
              })}
              {/* The key: three a row. */}
              {(
                [
                  [c.he4hCase, c.he4hCase, 'case'],
                  [c.he4hCaseSoft, c.he4hCase, 'infected'],
                  [c.he4hImmune, c.he4hImmune, 'immune'],
                  [c.card, c.chartMuted, 'not immune'],
                ] as const
              ).map(([fill, ink, name], i) => {
                const kx = L.x + (i % 3) * (L.s / 3);
                const ky = L.y + L.s + 18 + Math.floor(i / 3) * 20;
                return (
                  <G key={name}>
                    <Circle
                      cx={kx + 6}
                      cy={ky - 4}
                      r={6}
                      fill={fill}
                      stroke={ink}
                      strokeWidth={1.2}
                    />
                    <ChartText x={kx + 18} y={ky}>
                      {name}
                    </ChartText>
                  </G>
                );
              })}
              <G>
                <Line
                  x1={L.x + L.s / 3}
                  y1={L.y + L.s + 34}
                  x2={L.x + L.s / 3 + 18}
                  y2={L.y + L.s + 34}
                  stroke={c.he4hCase}
                  strokeWidth={1.5}
                  strokeDasharray={chart.dashFine}
                />
                <Line
                  x1={L.x + L.s / 3 + 18}
                  y1={L.y + L.s + 29}
                  x2={L.x + L.s / 3 + 18}
                  y2={L.y + L.s + 39}
                  stroke={c.he4hCase}
                  strokeWidth={2.2}
                />
                <ChartText x={L.x + L.s / 3 + 26} y={L.y + L.s + 38}>
                  stopped by immunity
                </ChartText>
              </G>
            </Svg>
          );
        }}
      </Canvas>
      <Caption>{lines.join(' ')}</Caption>
    </View>
  );
}

function herdLayout(w: number) {
  const s = Math.min(w - 20, 320);
  return { s, cell: s / 10, x: (w - s) / 2, y: 4, h: 4 + s + 56 };
}

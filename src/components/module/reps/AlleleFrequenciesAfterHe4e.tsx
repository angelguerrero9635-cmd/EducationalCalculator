/**
 * HC151 (`alleleFrequencies` `after`, AlleleFrequenciesHe4e in typesHe4e.ts): one generation of
 * selection. Two trays of 100 glass beads, p before and p′ after, and under them one p scale
 * with both marked and Δp arrowed from p to p′. The p handle stays on the scale.
 */
import { useRef } from 'react';
import { View } from 'react-native';
import Svg, { Circle, Defs, G, Line, Path, Rect } from 'react-native-svg';

import type { AlleleFrequenciesSpec } from '@/data/modules/typesHsh';
import { formatNumber } from '@/engine/format';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, Caption, ChartText, DragHandle, fitLabel, useRep } from './common';
import { Ball, BoxShadow, url, usePaintIds } from './paint';
import { ALLELE_BEADS, beadsFor } from './bioModel';

const fmt = (x: number) => formatNumber(Number(x.toFixed(4)));

export function AlleleFrequenciesAfterHe4e({
  spec,
  calc,
}: {
  spec: AlleleFrequenciesSpec;
  calc: Calculator;
}) {
  const c = usePalette();
  const rep = useRep(calc);
  const ids = usePaintIds('big', 'small');
  const start = useRef(0);
  const [A, a] = spec.alleles ?? ['A', 'a'];
  const pId = typeof spec.p === 'string' ? spec.p : undefined;
  const clamp = (x: number) => Math.min(1, Math.max(0, x));
  const p = clamp(typeof spec.p === 'number' ? spec.p : rep.val(spec.p));
  const known = pId === undefined || rep.known(pId);
  const afterKnown = !!spec.after && rep.known(spec.after);
  const p2 = afterKnown ? clamp(rep.val(spec.after!)) : undefined;
  const dp = p2 !== undefined && known ? p2 - p : undefined;
  const draggable = !spec.fixed && pId !== undefined && known && !rep.variable(pId).derived;
  const pText = pId ? rep.value(pId, false) : fmt(p);
  const p2Text = afterKnown ? rep.value(spec.after!, false) : '?';
  const dpText =
    dp === undefined
      ? '?'
      : spec.change && rep.known(spec.change)
        ? rep.value(spec.change, false)
        : fmt(dp);
  const w3 = (spec.fitness ?? []).map((f) =>
    typeof f === 'number' ? fmt(f) : rep.known(f) ? rep.value(f, false) : '?',
  );

  const lines: string[] = [];
  if (spec.fitness)
    lines.push(
      `Fitness: w(${A}${A}) = ${w3[0]}, w(${A}${a}) = ${w3[1]}, w(${a}${a}) = ${w3[2]}${spec.mean ? `; w̄ = ${rep.value(spec.mean, false)}` : ''}.`,
    );
  if (!known) lines.push('Type p to fill the first tray.');
  else if (p2 === undefined) lines.push(`p = ${pText}. Type the fitnesses to find p′.`);
  else
    lines.push(
      `p = ${pText} → p′ = ${p2Text}: Δp = ${dpText}, ${
        Math.abs(dp!) < 5e-5 ? 'no change' : dp! > 0 ? `${A} rises` : `${A} falls`
      }.`,
      `${beadsFor(p)} → ${beadsFor(p2)} of ${ALLELE_BEADS} alleles are ${A}.`,
    );

  return (
    <View>
      <Canvas aspect={(w) => (Math.min(150, (w - 40) / 2) + 108) / w}>
        {({ w, h }) => {
          const S = Math.min(150, (w - 40) / 2);
          const y0 = 24;
          const xs = [8, w - 8 - S];
          const pitch = (S - 8) / 10;
          const r = pitch * 0.42;
          const L = 16;
          const scaleW = w - 2 * L;
          const px = (t: number) => L + t * scaleW;
          const scaleY = y0 + S + 58;
          const tray = (x0: number, f: number | undefined, key: string) => {
            const nA = f === undefined ? 0 : beadsFor(f);
            return (
              <G key={key}>
                <BoxShadow x={x0} y={y0} width={S} height={S} r={8} />
                <Rect
                  x={x0}
                  y={y0}
                  width={S}
                  height={S}
                  rx={8}
                  fill={c.plastic}
                  stroke={c.chartGrid}
                  strokeWidth={chart.strokeLight}
                />
                {f === undefined
                  ? null
                  : Array.from({ length: ALLELE_BEADS }, (_, i) => (
                      <Circle
                        key={i}
                        cx={x0 + 4 + pitch * ((i % 10) + 0.5)}
                        cy={y0 + 4 + pitch * (Math.floor(i / 10) + 0.5)}
                        r={r}
                        fill={url(i < nA ? ids.big : ids.small)}
                        stroke={c.chartInk}
                        strokeWidth={0.4}
                      />
                    ))}
                <ChartText x={x0 + S / 2} y={y0 + S + 17} textAnchor="middle" fill={c.chartMuted}>
                  {f === undefined ? `? ${A} · ? ${a}` : `${nA} ${A} · ${ALLELE_BEADS - nA} ${a}`}
                </ChartText>
              </G>
            );
          };
          const gapX = (xs[0]! + S + xs[1]!) / 2;
          return (
            <>
              <Svg width={w} height={h}>
                <Defs>
                  <Ball id={ids.big} color={c.chartHighlight} />
                  <Ball id={ids.small} color={c.chartSecond} />
                </Defs>
                <ChartText x={xs[0]! + S / 2} y={15} textAnchor="middle" fontWeight="700">
                  {`Before: p = ${known ? pText : '?'}`}
                </ChartText>
                <ChartText
                  x={xs[1]! + S / 2}
                  y={15}
                  textAnchor="middle"
                  fontWeight="700"
                  fill={c.he4eAfter}
                >
                  {`After: p′ = ${p2Text}`}
                </ChartText>
                {tray(xs[0]!, known ? p : undefined, 'before')}
                {tray(xs[1]!, p2, 'after')}
                {/* One generation of selection: a chevron between the trays. */}
                <Path
                  d={`M${gapX - 6},${y0 + S / 2 - 9}L${gapX + 5},${y0 + S / 2}L${gapX - 6},${y0 + S / 2 + 9}`}
                  fill="none"
                  stroke={c.chartMuted}
                  strokeWidth={chart.strokeHeavy}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                {/* The p scale: p and p′ marked, Δp arrowed between them. */}
                <Line
                  x1={px(0)}
                  y1={scaleY}
                  x2={px(1)}
                  y2={scaleY}
                  stroke={c.chartSecond}
                  strokeWidth={4}
                  strokeLinecap="round"
                />
                <Line
                  x1={px(0)}
                  y1={scaleY}
                  x2={px(p)}
                  y2={scaleY}
                  stroke={c.chartHighlight}
                  strokeWidth={4}
                  strokeLinecap="round"
                  opacity={known ? 1 : 0.3}
                />
                {[0, 0.5, 1].map((t) => (
                  <G key={t}>
                    <Line
                      x1={px(t)}
                      y1={scaleY - 5}
                      x2={px(t)}
                      y2={scaleY + 5}
                      stroke={c.chartInk}
                      strokeWidth={1}
                    />
                    <ChartText
                      {...fitLabel(px(t), formatNumber(t), chart.label, w)}
                      y={scaleY + 19}
                      fill={c.chartMuted}
                    >
                      {formatNumber(t)}
                    </ChartText>
                  </G>
                ))}
                {known ? (
                  <Line
                    x1={px(p)}
                    y1={scaleY - 9}
                    x2={px(p)}
                    y2={scaleY + 9}
                    stroke={c.chartInk}
                    strokeWidth={chart.strokeHeavy}
                    strokeLinecap="round"
                  />
                ) : null}
                {p2 !== undefined ? (
                  <G>
                    <Line
                      x1={px(p2)}
                      y1={scaleY - 9}
                      x2={px(p2)}
                      y2={scaleY + 9}
                      stroke={c.he4eAfter}
                      strokeWidth={chart.strokeHeavy}
                      strokeLinecap="round"
                    />
                  </G>
                ) : null}
                {dp !== undefined && Math.abs(px(p2!) - px(p)) >= 2
                  ? (() => {
                      const y = scaleY - 18;
                      const [xa, xb] = [px(p), px(p2!)];
                      const dir = xb > xa ? 1 : -1;
                      const head = Math.min(7, Math.abs(xb - xa));
                      return (
                        <G>
                          <Line
                            x1={xa}
                            y1={y}
                            x2={xb - dir * head}
                            y2={y}
                            stroke={c.he4eAfter}
                            strokeWidth={chart.stroke}
                          />
                          <Path
                            d={`M${xb},${y}L${xb - dir * head},${y - 4.5}L${xb - dir * head},${y + 4.5}Z`}
                            fill={c.he4eAfter}
                          />
                        </G>
                      );
                    })()
                  : null}
                {dp !== undefined ? (
                  <ChartText
                    {...fitLabel((px(p) + px(p2!)) / 2, `Δp = ${dpText}`, chart.label, w)}
                    y={scaleY - 27}
                    fontWeight="700"
                    fill={c.he4eAfter}
                  >
                    {`Δp = ${dpText}`}
                  </ChartText>
                ) : null}
              </Svg>
              {draggable ? (
                <DragHandle
                  testID={`drag-${pId}`}
                  x={px(p)}
                  y={scaleY}
                  label={rep.variable(pId).name}
                  onStart={() => {
                    start.current = p;
                  }}
                  onMove={(dx) =>
                    calc.set(
                      {
                        ...(spec.keep ? rep.pin(spec.keep) : {}),
                        [pId]: rep.snapTo(
                          pId,
                          Math.round(clamp(start.current + dx / scaleW) * 100) / 100,
                        ),
                      },
                      { slide: { id: pId, step: 0.01 } },
                    )
                  }
                />
              ) : null}
            </>
          );
        }}
      </Canvas>
      <Caption>{lines.join(' ')}</Caption>
    </View>
  );
}

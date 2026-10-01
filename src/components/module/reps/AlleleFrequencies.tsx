import { useRef } from 'react';
import { View } from 'react-native';
import Svg, { Circle, Defs, G, Line, Rect } from 'react-native-svg';

import type { AlleleFrequenciesSpec } from '@/data/modules/typesHsh';
import { formatNumber } from '@/engine/format';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, Caption, ChartText, DragHandle, useRep } from './common';
import { Ball, BoxShadow, url, usePaintIds } from './paint';
import { ALLELE_BEADS, beadsFor } from './bioModel';

/**
 * Hardy–Weinberg (see `AlleleFrequenciesSpec`): a tray of 100 glass beads, one per allele, the
 * dominant allele's counted from p; a p scale with a handle under it; the genotype bars p², 2pq
 * and q² beside it, flat, on a 0–1 scale.
 */
export function AlleleFrequencies({
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
  const p = Math.min(1, Math.max(0, typeof spec.p === 'number' ? spec.p : rep.val(spec.p)));
  const known = pId === undefined || rep.known(pId);
  const q = 1 - p;
  const nA = beadsFor(p);
  const exact = Math.abs(p * ALLELE_BEADS - nA) < 1e-9;
  const fmt = (x: number) => formatNumber(Number(x.toFixed(4)));
  const bars = [
    { name: `${A}${A}`, sym: 'p²', f: p * p, fill: [c.chartHighlight, c.chartHighlight] },
    { name: `${A}${a}`, sym: '2pq', f: 2 * p * q, fill: [c.chartHighlight, c.chartSecond] },
    { name: `${a}${a}`, sym: 'q²', f: q * q, fill: [c.chartSecond, c.chartSecond] },
  ];
  const draggable = !spec.fixed && pId !== undefined && known && !rep.variable(pId).derived;
  const pText = pId ? rep.value(pId, false) : fmt(p);

  return (
    <View>
      <Canvas aspect={(w) => (Math.min(172, w * 0.46) + 84) / w}>
        {({ w, h }) => {
          const S = Math.min(172, w * 0.46);
          const x0 = 8;
          const y0 = 8;
          const pitch = (S - 8) / 10;
          const r = pitch * 0.42;
          const scaleY = y0 + S + 46;
          const px = (t: number) => x0 + t * S;
          // The bars: a 0–1 axis, three bars.
          const bx0 = x0 + S + 44;
          const bw = (w - 6 - bx0) / 3;
          const base = y0 + S;
          const top = y0 + 14;
          const yOf = (f: number) => base - f * (base - top);
          return (
            <>
              <Svg width={w} height={h}>
                <Defs>
                  <Ball id={ids.big} color={c.chartHighlight} />
                  <Ball id={ids.small} color={c.chartSecond} />
                </Defs>
                {/* The tray of beads. */}
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
                {Array.from({ length: ALLELE_BEADS }, (_, i) => {
                  const big = i < nA;
                  return (
                    <Circle
                      key={i}
                      cx={x0 + 4 + pitch * ((i % 10) + 0.5)}
                      cy={y0 + 4 + pitch * (Math.floor(i / 10) + 0.5)}
                      r={r}
                      fill={url(big ? ids.big : ids.small)}
                      stroke={c.chartInk}
                      strokeWidth={0.4}
                      opacity={known ? 1 : 0.3}
                    />
                  );
                })}
                <ChartText
                  x={x0 + S / 2}
                  y={y0 + S + 18}
                  fontSize={chart.label}
                  textAnchor="middle"
                  fill={c.chartMuted}
                >
                  {known ? `${nA} ${A} · ${ALLELE_BEADS - nA} ${a}` : `? ${A} · ? ${a}`}
                </ChartText>
                {/* The p scale. */}
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
                      x={px(t)}
                      y={scaleY + 20}
                      fontSize={chart.label}
                      textAnchor="middle"
                      fill={c.chartMuted}
                    >
                      {formatNumber(t)}
                    </ChartText>
                  </G>
                ))}
                <ChartText x={px(1) + 10} y={scaleY + 5} fontSize={chart.label} fontWeight="700">
                  {`p = ${known ? pText : '?'}`}
                </ChartText>
                {/* The genotype bars. */}
                {[0, 0.5, 1].map((t) => (
                  <G key={`g${t}`}>
                    <Line
                      x1={bx0 - 4}
                      y1={yOf(t)}
                      x2={w - 6}
                      y2={yOf(t)}
                      stroke={c.chartGrid}
                      strokeWidth={1}
                    />
                    <ChartText
                      x={bx0 - 8}
                      y={yOf(t) + 4}
                      fontSize={chart.label}
                      textAnchor="end"
                      fill={c.chartMuted}
                    >
                      {formatNumber(t)}
                    </ChartText>
                  </G>
                ))}
                {bars.map((b, i) => {
                  const x = bx0 + bw * i + bw * 0.18;
                  const width = bw * 0.64;
                  const y = yOf(b.f);
                  return (
                    <G key={b.name} opacity={known ? 1 : 0.3}>
                      <Rect x={x} y={y} width={width / 2} height={base - y} fill={b.fill[0]} />
                      <Rect
                        x={x + width / 2}
                        y={y}
                        width={width / 2}
                        height={base - y}
                        fill={b.fill[1]}
                      />
                      <Rect
                        x={x}
                        y={y}
                        width={width}
                        height={base - y}
                        fill="none"
                        stroke={c.chartInk}
                        strokeWidth={1}
                      />
                      <ChartText
                        x={x + width / 2}
                        y={y - 5}
                        fontSize={chart.label}
                        fontWeight="700"
                        textAnchor="middle"
                      >
                        {known ? fmt(b.f) : '?'}
                      </ChartText>
                      <ChartText
                        x={x + width / 2}
                        y={base + 18}
                        fontSize={chart.value}
                        fontWeight="700"
                        textAnchor="middle"
                      >
                        {b.name}
                      </ChartText>
                      <ChartText
                        x={x + width / 2}
                        y={base + 34}
                        fontSize={chart.label}
                        textAnchor="middle"
                        fill={c.chartMuted}
                      >
                        {b.sym}
                      </ChartText>
                    </G>
                  );
                })}
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
                        // To hundredths: a frequency reads 0.37, never 0.3674.
                        [pId]: rep.snapTo(
                          pId,
                          Math.round(Math.min(1, Math.max(0, start.current + dx / S)) * 100) / 100,
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
      <Caption>
        {known
          ? [
              `p + q = ${fmt(p)} + ${fmt(q)} = 1`,
              `p² + 2pq + q² = ${bars.map((b) => fmt(b.f)).join(' + ')} = 1`,
              exact
                ? `${nA} of ${ALLELE_BEADS} alleles are ${A}.`
                : `About ${nA} of ${ALLELE_BEADS} alleles are ${A}.`,
            ].join(' · ')
          : 'Type p or q to fill the tray.'}
      </Caption>
    </View>
  );
}

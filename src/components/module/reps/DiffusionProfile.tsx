/**
 * HC159 `diffusionProfile` (DiffusionProfileSpec in typesHe4j.ts): a solute spreading into a
 * tissue slab from a source face held at C₀. The slab is shaded by concentration, and under it
 * the profile C ÷ C₀ = erfc(x ÷ (2√(Dt))) is drawn to scale on a depth axis in μm, its half depth
 * ticked and L = √(2Dt) dashed through both. Drag the L line to change L.
 */
import { useRef } from 'react';
import { View } from 'react-native';
import Svg, { Circle, G, Line, Path, Rect } from 'react-native-svg';

import type { DiffusionProfileSpec } from '@/data/modules/typesHe4j';
import { formatNumber } from '@/engine/format';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, Caption, ChartText, DragHandle, fitLabel, useFrozen, useRep } from './common';
import { depthSpan, halfDepth, inUnit, niceUp, profileShare, spreadDepth } from './he4jMath';

const n3 = (x: number) => formatNumber(Number(x.toPrecision(3)));
const sig3 = (x: number) =>
  Number.isInteger(x) || Math.abs(x) >= 1000 || Math.abs(x) < 0.001
    ? n3(x)
    : x.toPrecision(3).replace('-', '−');

const H = 258;
const SLAB = { top: 24, bottom: 92 };
const GRAPH = { top: 118, bottom: 212 };

export function DiffusionProfile({ spec, calc }: { spec: DiffusionProfileSpec; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  const start = useRef(0);
  type V = number | string | undefined;
  /** A value in `unit`, its own unit (or `assume` when it has none) converted. */
  const get = (v: V, assume: string, unit: string): number | undefined => {
    if (v === undefined) return undefined;
    if (typeof v === 'number') return inUnit(v, assume, unit);
    if (!rep.known(v)) return undefined;
    return inUnit(rep.val(v), rep.variable(v).unit ?? assume, unit);
  };
  const say = (v: V, x: number, unit: string) => {
    if (typeof v !== 'string' || !rep.known(v)) return `${sig3(x)} ${unit}`;
    if (rep.typed(v)) return rep.value(v);
    const u = rep.unit(v);
    return `${sig3(rep.shown(v))}${u ? ` ${u}` : ''}`;
  };
  // D in μm²/s, depths in μm, times in s.
  const Dsi = get(spec.D, 'cm²/s', 'm²/s');
  const D = Dsi === undefined ? undefined : Dsi * 1e12;
  const Lgiven = get(spec.L, 'μm', 'μm');
  const tGiven = get(spec.t, 's', 's');
  const t =
    tGiven ??
    (Lgiven !== undefined && D !== undefined && D > 0 ? (Lgiven * Lgiven) / (2 * D) : undefined);
  const ok = D !== undefined && D > 0 && t !== undefined && t > 0;
  const spread = ok ? spreadDepth(D, t) : undefined;
  const L = Lgiven ?? spread;
  const half = ok ? halfDepth(D, t) : undefined;
  const span = useFrozen(depthSpan(L ?? spread ?? 100));

  const lines: string[] = [];
  if (!ok) lines.push('Type D and L (or t) to see how far the solute has spread.');
  else {
    if (Lgiven !== undefined && spec.D !== undefined)
      lines.push(
        `t = L² ÷ (2D) = (${say(spec.L, Lgiven, 'μm')})² ÷ (2 × ${say(spec.D, Dsi! * 1e4, 'cm²/s')}) = ${say(spec.t, t, 's')}${t >= 3600 ? `, ${sig3(t / 3600)} h` : ''}.`,
      );
    lines.push(
      `At L, C is ${Math.round(100 * profileShare(L!, D, t))}% of C₀; half of C₀ has reached ${sig3(half!)} μm.`,
    );
    lines.push('Doubling L takes four times as long.');
  }

  return (
    <View>
      <Canvas aspect={(w) => H / w}>
        {({ w }) => {
          const x0 = 42;
          const x1 = w - 18;
          const xmax = span.value;
          const X = (d: number) => x0 + (d / xmax) * (x1 - x0);
          const Y = (s: number) => GRAPH.bottom - s * (GRAPH.bottom - GRAPH.top);
          const stripes = 60;
          const step = niceUp(xmax / 4);
          const ticks: number[] = [];
          for (let d = 0; d <= xmax + 1e-9; d += step) ticks.push(d);
          const curve = (() => {
            if (!ok) return '';
            let d = '';
            for (let i = 0; i <= 120; i++) {
              const x = (xmax * i) / 120;
              d += `${i ? 'L' : 'M'}${X(x).toFixed(1)},${Y(profileShare(x, D, t)).toFixed(1)}`;
            }
            return d;
          })();
          const lText = L !== undefined ? `L = ${say(spec.L, L, 'μm')}` : '';
          const atL = ok && L !== undefined ? profileShare(L, D, t) : undefined;
          return (
            <>
              <Svg width={w} height={H}>
                {/* The tissue, shaded by how much solute has reached each depth. */}
                <Rect
                  x={x0}
                  y={SLAB.top}
                  width={x1 - x0}
                  height={SLAB.bottom - SLAB.top}
                  fill={c.he4jEosin}
                  fillOpacity={0.35}
                />
                {ok
                  ? Array.from({ length: stripes }, (_, i) => {
                      const s = profileShare(((i + 0.5) * xmax) / stripes, D, t);
                      return (
                        <Rect
                          key={i}
                          x={X((i * xmax) / stripes)}
                          y={SLAB.top}
                          width={(x1 - x0) / stripes + 0.4}
                          height={SLAB.bottom - SLAB.top}
                          fill={c.he4jSolute}
                          fillOpacity={0.85 * s}
                        />
                      );
                    })
                  : null}
                <Rect
                  x={x0}
                  y={SLAB.top}
                  width={x1 - x0}
                  height={SLAB.bottom - SLAB.top}
                  fill="none"
                  stroke={c.chartInk}
                  strokeWidth={1}
                />
                {/* The source face, held at C₀. */}
                <Rect
                  x={16}
                  y={SLAB.top}
                  width={x0 - 16}
                  height={SLAB.bottom - SLAB.top}
                  fill={c.he4jSolute}
                />
                <ChartText x={(16 + x0) / 2} y={SLAB.top - 8} textAnchor="middle" fontWeight="700">
                  C₀
                </ChartText>
                {/* The profile. */}
                <Line
                  x1={x0}
                  y1={GRAPH.top - 4}
                  x2={x0}
                  y2={GRAPH.bottom}
                  stroke={c.chartInk}
                  strokeWidth={chart.strokeLight}
                />
                <Line
                  x1={x0}
                  y1={GRAPH.bottom}
                  x2={x1}
                  y2={GRAPH.bottom}
                  stroke={c.chartInk}
                  strokeWidth={chart.strokeLight}
                />
                {[0, 0.5, 1].map((s) => (
                  <G key={s}>
                    <Line
                      x1={x0}
                      y1={Y(s)}
                      x2={x1}
                      y2={Y(s)}
                      stroke={c.chartGrid}
                      strokeWidth={1}
                      strokeDasharray={s === 0.5 ? chart.dashFine : undefined}
                    />
                    <ChartText x={x0 - 6} y={Y(s) + 4} textAnchor="end" fill={c.chartMuted}>
                      {formatNumber(s)}
                    </ChartText>
                  </G>
                ))}
                <ChartText x={x0 + 4} y={GRAPH.top - 6} fill={c.chartMuted}>
                  C ÷ C₀
                </ChartText>
                {ticks.map((d) => (
                  <G key={d}>
                    <Line
                      x1={X(d)}
                      y1={GRAPH.bottom}
                      x2={X(d)}
                      y2={GRAPH.bottom + 5}
                      stroke={c.chartInk}
                      strokeWidth={1}
                    />
                    <ChartText
                      {...fitLabel(X(d), formatNumber(d), chart.label, w)}
                      y={GRAPH.bottom + 18}
                      fill={c.chartMuted}
                    >
                      {formatNumber(d)}
                    </ChartText>
                  </G>
                ))}
                <ChartText
                  {...fitLabel((x0 + x1) / 2, 'depth x (μm)', chart.label, w)}
                  y={GRAPH.bottom + 36}
                  fill={c.chartMuted}
                >
                  depth x (μm)
                </ChartText>
                {ok ? (
                  <Path
                    d={curve}
                    stroke={c.he4jSolute}
                    strokeWidth={chart.strokeHeavy}
                    fill="none"
                  />
                ) : null}
                {/* Half of C₀: its depth ticked on the curve. */}
                {half !== undefined && half <= xmax ? (
                  <G>
                    <Circle
                      cx={X(half)}
                      cy={Y(0.5)}
                      r={4}
                      fill={c.background}
                      stroke={c.he4jSolute}
                      strokeWidth={chart.stroke}
                    />
                    {/* Under the half line, left of the point: below the curve, so clear. */}
                    <ChartText
                      x={X(half) - 6}
                      y={Y(0.5) + 15}
                      textAnchor="end"
                      fill={c.he4jSolute}
                      fontWeight="700"
                    >
                      ½C₀
                    </ChartText>
                  </G>
                ) : null}
                {/* L = √(2Dt), dashed through the slab and the profile. */}
                {L !== undefined && L <= xmax ? (
                  <G>
                    <Line
                      x1={X(L)}
                      y1={SLAB.top - 4}
                      x2={X(L)}
                      y2={GRAPH.bottom}
                      stroke={c.chartInk}
                      strokeWidth={chart.strokeLight}
                      strokeDasharray={chart.dash}
                    />
                    <ChartText
                      {...fitLabel(X(L), lText, chart.label, w)}
                      y={SLAB.top - 8}
                      fontWeight="700"
                    >
                      {lText}
                    </ChartText>
                    {atL !== undefined ? (
                      <G>
                        <Circle cx={X(L)} cy={Y(atL)} r={4.5} fill={c.he4jSolute} />
                        <ChartText
                          {...fitLabel(
                            X(L) + 8,
                            `C = ${Math.round(100 * atL)}% of C₀`,
                            chart.label,
                            w,
                            'start',
                            8,
                          )}
                          y={Y(atL) + 16}
                          fontWeight="700"
                          halo
                        >
                          {`C = ${Math.round(100 * atL)}% of C₀`}
                        </ChartText>
                      </G>
                    ) : null}
                  </G>
                ) : null}
              </Svg>
              {L !== undefined &&
              L <= xmax &&
              typeof spec.L === 'string' &&
              !spec.fixed &&
              rep.movable(spec.L) ? (
                <DragHandle
                  testID={`drag-${spec.L}`}
                  x={X(L)}
                  y={(SLAB.top + SLAB.bottom) / 2}
                  label={rep.variable(spec.L).name}
                  onStart={() => {
                    start.current = rep.val(spec.L as string);
                    span.freeze();
                  }}
                  onEnd={span.release}
                  onMove={(dx) => {
                    const id = spec.L as string;
                    const perUm = inUnit(1, 'μm', rep.variable(id).unit ?? 'μm');
                    const next = start.current + (dx / (x1 - x0)) * xmax * perUm;
                    calc.set(
                      { ...rep.pin(spec.keep ?? []), [id]: rep.snapTo(id, next) },
                      rep.slide(id),
                    );
                  }}
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

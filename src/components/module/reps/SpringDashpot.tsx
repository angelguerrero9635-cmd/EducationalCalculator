/**
 * HC157 `springDashpot` (SpringDashpotSpec in typesHe4j.ts): a viscoelastic model beside its
 * curve. Maxwell: a steel spring and an oil dashpot in series, held stretched between two walls;
 * as t passes the spring gives its stretch to the dashpot and the stress relaxes, σ₀e^(−t/τ),
 * with τ and 37% marked. Kelvin–Voigt: the two side by side under a load; they stretch together
 * and the strain creeps up to σ ÷ E, with τ and 63% marked. The model is painted; the graph is
 * flat. Drag the point on the curve to change t.
 */
import { useRef } from 'react';
import { View } from 'react-native';
import Svg, { Circle, Defs, G, Line, Path, Polygon, Rect } from 'react-native-svg';

import type { SpringDashpotSpec } from '@/data/modules/typesHe4j';
import { formatNumber } from '@/engine/format';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, Caption, ChartText, DragHandle, fitLabel, useFrozen, useRep } from './common';
import { creepShare, inUnit, relaxShare, springSpan } from './he4jMath';
import { Glass, Sheen, url, usePaintIds } from './paint';

const n3 = (x: number) => formatNumber(Number(x.toPrecision(3)));
const sig3 = (x: number) =>
  Number.isInteger(x) || Math.abs(x) >= 1000 || Math.abs(x) < 0.001
    ? n3(x)
    : x.toPrecision(3).replace('-', '−');

/** The model panel's width and the canvas height. */
const MW = 116;
const H = 236;

export function SpringDashpot({ spec, calc }: { spec: SpringDashpotSpec; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  const ids = usePaintIds('glass', 'steel');
  const start = useRef(0);
  type V = number | string | undefined;
  const raw = (v: V): number | undefined =>
    v === undefined ? undefined : typeof v === 'number' ? v : rep.known(v) ? rep.val(v) : undefined;
  const seconds = (v: V) => {
    const x = raw(v);
    return x === undefined || typeof v !== 'string' ? x : inUnit(x, rep.variable(v).unit, 's');
  };
  const say = (v: V, x: number, unit = '') => {
    if (typeof v !== 'string' || !rep.known(v)) return `${sig3(x)}${unit ? ` ${unit}` : ''}`;
    if (rep.typed(v)) return rep.value(v);
    const u = rep.unit(v);
    return `${sig3(rep.shown(v))}${u ? ` ${u}` : ''}`;
  };
  const bare = (v: V, x: number) =>
    typeof v === 'string' && rep.known(v) && rep.typed(v) ? rep.value(v, false) : sig3(x);
  const unitOf = (...vs: V[]) => {
    for (const v of vs) if (typeof v === 'string' && rep.unit(v)) return rep.unit(v)!;
    return '';
  };

  const maxwell = spec.model === 'maxwell';
  const E = raw(spec.E);
  const eta = raw(spec.eta);
  const tau =
    seconds(spec.tau) ?? (E !== undefined && eta !== undefined && E > 0 ? eta / E : undefined);
  const t = seconds(spec.t);
  const ok = tau !== undefined && tau > 0;
  // Maxwell: the starting stress; Kelvin: the final strain σ ÷ E.
  const e0 = raw(spec.strain0);
  const s0 = raw(spec.stress0) ?? (E !== undefined && e0 !== undefined ? E * e0 : undefined);
  const load = raw(spec.load);
  const eInf =
    raw(spec.final) ?? (load !== undefined && E !== undefined && E > 0 ? load / E : undefined);
  const top = maxwell ? s0 : eInf;
  const share = (x: number) => (maxwell ? relaxShare(x, tau!) : creepShare(x, tau!));
  const level = maxwell ? Math.exp(-1) : 1 - Math.exp(-1);
  const span = useFrozen(ok ? springSpan(tau, t) : 1);
  const stressUnit = unitOf(spec.stress0, spec.stress, spec.load, spec.E);

  // The caption, in the page's numbers.
  const lines: string[] = [];
  if (!ok) lines.push('Type E and η to find the time constant τ = η ÷ E.');
  else {
    lines.push(
      `τ = η ÷ E = ${bare(spec.eta, eta ?? tau * (E ?? 1))} ÷ ${bare(spec.E, E ?? 1)} = ${say(spec.tau, tau, 's')}.`,
    );
    if (maxwell) {
      if (e0 !== undefined && E !== undefined && s0 !== undefined)
        lines.push(
          `σ₀ = Eε₀ = ${bare(spec.E, E)} × ${bare(spec.strain0, e0)} = ${say(spec.stress0, s0, stressUnit)}.`,
        );
      if (t !== undefined && s0 !== undefined)
        lines.push(
          `σ = σ₀e^(−t/τ) = ${bare(spec.stress0, s0)} × e^(−${bare(spec.t, t)} ÷ ${sig3(tau)}) = ${say(spec.stress, s0 * share(t), stressUnit)}: ${sig3(100 * share(t))}% of σ₀ left.`,
        );
      lines.push('After one τ, 37% of the stress is left.');
    } else {
      if (load !== undefined && E !== undefined && eInf !== undefined)
        lines.push(
          `It creeps toward σ ÷ E = ${bare(spec.load, load)} ÷ ${bare(spec.E, E)} = ${say(spec.final, eInf)} and never flows.`,
        );
      if (t !== undefined && eInf !== undefined)
        lines.push(
          `ε = (σ ÷ E)(1 − e^(−t/τ)) = ${sig3(eInf)} × (1 − e^(−${bare(spec.t, t)} ÷ ${sig3(tau)})) = ${say(spec.strain, eInf * share(t))}: ${sig3(100 * share(t))}% of the way.`,
        );
      lines.push('After one τ, the strain is 63% of the way there.');
    }
  }

  // The model's state at t: the spring's share of the stretch (Maxwell) or the stretch so far.
  const f = ok && t !== undefined ? share(t) : maxwell ? 1 : 0;

  return (
    <View>
      <Canvas aspect={(w) => H / w}>
        {({ w }) => {
          const mx = MW / 2;
          const gx0 = MW + 40;
          const gx1 = w - 14;
          const gTop = 30;
          const gBot = 188;
          const tmax = span.value;
          const yMax =
            top !== undefined && top > 0 ? (maxwell ? top : top * 1.15) : maxwell ? 1 : 1.15;
          const yTop = top !== undefined && top > 0 ? top : 1;
          const X = (x: number) => gx0 + (x / tmax) * (gx1 - gx0);
          const Y = (y: number) => gBot - (y / yMax) * (gBot - gTop);
          const curve = (() => {
            if (!ok) return '';
            let d = '';
            for (let i = 0; i <= 120; i++) {
              const x = (tmax * i) / 120;
              d += `${i ? 'L' : 'M'}${X(x).toFixed(1)},${Y(yTop * share(x)).toFixed(1)}`;
            }
            return d;
          })();
          const wall = (y: number, key: string) => (
            <G key={key}>
              <Rect
                x={14}
                y={y}
                width={MW - 28}
                height={8}
                fill={c.chartFill}
                stroke={c.chartInk}
                strokeWidth={1}
              />
              <Path
                d={Array.from({ length: 11 }, (_, i) => `M ${18 + i * 8} ${y + 8} l 6 -8`).join(
                  ' ',
                )}
                stroke={c.chartMuted}
                strokeWidth={0.8}
              />
            </G>
          );
          const rod = (x: number, y0: number, y1: number, key: string) => (
            <Line key={key} x1={x} y1={y0} x2={x} y2={y1} stroke={c.silverDark} strokeWidth={3} />
          );
          const spring = (x: number, y0: number, y1: number) => {
            const n = 8;
            const pts: string[] = [`M ${x} ${y0}`, `L ${x} ${y0 + 4}`];
            for (let i = 0; i < n; i++) {
              const y = y0 + 4 + ((y1 - y0 - 8) * (i + 0.5)) / n;
              pts.push(`L ${x + (i % 2 ? -10 : 10)} ${y.toFixed(1)}`);
            }
            pts.push(`L ${x} ${y1 - 4}`, `L ${x} ${y1}`);
            const d = pts.join(' ');
            return (
              <G>
                <Path
                  d={d}
                  stroke={c.silverDark}
                  strokeWidth={3.2}
                  fill="none"
                  strokeLinejoin="round"
                />
                <Path
                  d={d}
                  stroke={c.silver}
                  strokeWidth={1.1}
                  fill="none"
                  strokeLinejoin="round"
                />
              </G>
            );
          };
          /** A dashpot: the cylinder from y0 to y1 (open at the top), oil, the piston at yp. */
          const dashpot = (x: number, y0: number, y1: number, yp: number) => (
            <G>
              <Rect x={x - 15} y={y0} width={30} height={y1 - y0} fill={url(ids.glass)} />
              <Rect
                x={x - 14}
                y={yp}
                width={28}
                height={y1 - yp}
                fill={c.he4jOil}
                fillOpacity={0.85}
              />
              <Path
                d={`M ${x - 15} ${y0} V ${y1} H ${x + 15} V ${y0}`}
                stroke={c.chartInk}
                strokeWidth={1.4}
                fill="none"
              />
              <Rect x={x - 13} y={yp - 2.5} width={26} height={5} rx={1} fill={c.silverDark} />
              <Rect x={x - 13} y={yp - 2.5} width={26} height={5} rx={1} fill={url(ids.steel)} />
            </G>
          );
          const tx = ok && t !== undefined ? X(Math.min(t, tmax)) : undefined;
          const ty = ok && t !== undefined ? Y(yTop * share(Math.min(t, tmax))) : undefined;
          const pointLabel =
            ok && t !== undefined && top !== undefined
              ? maxwell
                ? `σ = ${say(spec.stress, top * share(t), stressUnit)}`
                : `ε = ${say(spec.strain, top * share(t))}`
              : '';
          return (
            <>
              <Svg width={w} height={H}>
                <Defs>
                  <Glass id={ids.glass} />
                  <Sheen id={ids.steel} />
                </Defs>
                {/* The model. */}
                {wall(6, 'top')}
                {maxwell
                  ? (() => {
                      const ls = 50 + 30 * f;
                      const ysb = 24 + ls;
                      const yp = ysb + 50;
                      return (
                        <G>
                          {rod(mx, 14, 24, 'r1')}
                          {spring(mx, 24, ysb)}
                          <Rect x={mx - 8} y={ysb} width={16} height={3} fill={c.silverDark} />
                          {rod(mx, ysb + 3, yp, 'r2')}
                          {dashpot(mx, 118, 184, yp)}
                          {rod(mx, 184, 194, 'r3')}
                          {wall(194, 'bottom')}
                          <ChartText
                            {...fitLabel(
                              mx,
                              e0 !== undefined ? `ε₀ = ${bare(spec.strain0, e0)} held` : 'held',
                              chart.label,
                              MW + 30,
                            )}
                            y={222}
                            fontWeight="700"
                          >
                            {e0 !== undefined ? `ε₀ = ${bare(spec.strain0, e0)} held` : 'held'}
                          </ChartText>
                        </G>
                      );
                    })()
                  : (() => {
                      const yb = 138 + 30 * f;
                      const sx = mx - 22;
                      const dx = mx + 22;
                      return (
                        <G>
                          {spring(sx, 14, yb)}
                          {rod(dx, 14, 110, 'r1')}
                          {dashpot(dx, yb - 76, yb - 6, 110)}
                          {rod(dx, yb - 6, yb, 'r2')}
                          <Rect x={mx - 36} y={yb} width={72} height={5} fill={c.silverDark} />
                          <Line
                            x1={mx}
                            y1={yb + 5}
                            x2={mx}
                            y2={yb + 26}
                            stroke={c.he4jCurve}
                            strokeWidth={chart.stroke}
                          />
                          <Polygon
                            points={`${mx - 6},${yb + 24} ${mx + 6},${yb + 24} ${mx},${yb + 34}`}
                            fill={c.he4jCurve}
                          />
                          <ChartText
                            {...fitLabel(
                              mx,
                              load !== undefined ? `σ = ${say(spec.load, load, stressUnit)}` : 'σ',
                              chart.label,
                              MW + 30,
                            )}
                            y={226}
                            fontWeight="700"
                            fill={c.he4jCurve}
                          >
                            {load !== undefined ? `σ = ${say(spec.load, load, stressUnit)}` : 'σ'}
                          </ChartText>
                        </G>
                      );
                    })()}

                {/* The graph: σ falling (relaxation) or ε rising (creep). */}
                <Line
                  x1={gx0}
                  y1={gTop - 6}
                  x2={gx0}
                  y2={gBot}
                  stroke={c.chartInk}
                  strokeWidth={chart.strokeLight}
                />
                <Line
                  x1={gx0}
                  y1={gBot}
                  x2={gx1}
                  y2={gBot}
                  stroke={c.chartInk}
                  strokeWidth={chart.strokeLight}
                />
                <ChartText x={gx0 - 4} y={gTop - 14} fontStyle="italic" fontWeight="700">
                  {maxwell ? `σ${stressUnit ? ` (${stressUnit})` : ''}` : 'ε'}
                </ChartText>
                <ChartText x={gx0 - 6} y={gBot + 4} textAnchor="end" fill={c.chartMuted}>
                  0
                </ChartText>
                {top !== undefined && top > 0 ? (
                  <G>
                    <Line
                      x1={gx0 - 4}
                      y1={Y(top)}
                      x2={maxwell ? gx0 : gx1}
                      y2={Y(top)}
                      stroke={c.chartMuted}
                      strokeWidth={1}
                      strokeDasharray={maxwell ? undefined : chart.dash}
                    />
                    <ChartText x={gx0 - 6} y={Y(top) + 4} textAnchor="end" fill={c.chartMuted}>
                      {sig3(top)}
                    </ChartText>
                    {!maxwell ? (
                      <ChartText
                        {...fitLabel(gx1, 'σ ÷ E', chart.label, w, 'end')}
                        y={Y(top) - 5}
                        fill={c.chartMuted}
                      >
                        σ ÷ E
                      </ChartText>
                    ) : null}
                  </G>
                ) : null}
                <ChartText
                  {...fitLabel(gx1, `${formatNumber(tmax)} s`, chart.label, w, 'end')}
                  y={gBot + 16}
                  fill={c.chartMuted}
                >
                  {`${formatNumber(tmax)} s`}
                </ChartText>
                <ChartText
                  {...fitLabel((gx0 + gx1) / 2 + 20, 't', chart.label, w)}
                  y={gBot + 32}
                  fontStyle="italic"
                  fill={c.chartMuted}
                >
                  t
                </ChartText>
                {ok ? (
                  <G>
                    {/* τ and the curve's level there: 37% or 63%. */}
                    <Path
                      d={`M ${X(tau)} ${gBot} V ${Y(yTop * level)} H ${gx0}`}
                      stroke={c.chartMuted}
                      strokeWidth={1}
                      strokeDasharray={chart.dashFine}
                      fill="none"
                    />
                    <ChartText
                      {...fitLabel(X(tau), `τ = ${sig3(tau)} s`, chart.label, w)}
                      y={gBot + 16}
                      fill={c.he4jCurve}
                      fontWeight="700"
                    >
                      {`τ = ${sig3(tau)} s`}
                    </ChartText>
                    {/* Beside the axis, on the side of the level line the curve leaves empty. */}
                    <ChartText
                      x={gx0 + 5}
                      y={Y(yTop * level) + (maxwell ? 15 : -5)}
                      fill={c.chartMuted}
                      halo
                    >
                      {maxwell ? '37%' : '63%'}
                    </ChartText>
                    <Path
                      d={curve}
                      stroke={c.he4jCurve}
                      strokeWidth={chart.strokeHeavy}
                      fill="none"
                    />
                  </G>
                ) : null}
                {tx !== undefined && ty !== undefined ? (
                  <G>
                    <Circle
                      cx={tx}
                      cy={ty}
                      r={5}
                      fill={c.he4jCurve}
                      stroke={c.background}
                      strokeWidth={1.5}
                    />
                    {pointLabel ? (
                      <ChartText
                        {...fitLabel(tx + 8, pointLabel, chart.label, w, 'start', 8)}
                        y={maxwell ? ty - 10 : ty + 18}
                        fontWeight="700"
                        halo
                      >
                        {pointLabel}
                      </ChartText>
                    ) : null}
                  </G>
                ) : null}
              </Svg>
              {tx !== undefined &&
              ty !== undefined &&
              typeof spec.t === 'string' &&
              !spec.fixed &&
              rep.movable(spec.t) ? (
                <DragHandle
                  testID={`drag-${spec.t}`}
                  x={tx}
                  y={ty}
                  label={rep.variable(spec.t).name}
                  onStart={() => {
                    start.current = rep.val(spec.t as string);
                    span.freeze();
                  }}
                  onEnd={span.release}
                  onMove={(dx) => {
                    const id = spec.t as string;
                    const perS = inUnit(1, 's', rep.variable(id).unit ?? 's');
                    const next = start.current + (dx / (gx1 - gx0)) * tmax * perS;
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

/**
 * HC168 `fitDiagram` (FitDiagramSpec in typesHe4l.ts): limits and fits, flat. Deviation runs
 * across (enlarged) from the basic-size zero line; the hole's zone and the shaft's are bars
 * with their limits at the ends; C_max and C_min are dimensioned below, negative as
 * interference, and the fit named. With `stack`, the chain of toleranced dimensions and its
 * budget: the worst case ΣTᵢ stacked and the RSS √(ΣTᵢ²) under it, to one scale.
 */
import type { ReactNode } from 'react';
import { View } from 'react-native';
import Svg, { G, Line, Rect } from 'react-native-svg';

import type { FitDiagramSpec } from '@/data/modules/typesHe4l';
import { formatNumber } from '@/engine/format';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { HeLabel } from './beamKit';
import { Canvas, Caption, ChartText } from './common';
import { useHe3iReader } from './he3iKit';
import { fitName, si4l, stackRss, stackWorst } from './he4lMath';

type X = FitDiagramSpec['basic'];
const f3 = (x: number) => formatNumber(Number(x.toPrecision(3)));
/** A round scale length (1, 2 or 5 × 10ⁿ) near `x`. */
const nice = (x: number) => {
  const e = 10 ** Math.floor(Math.log10(x));
  const m = x / e;
  return (m < 2 ? 1 : m < 5 ? 2 : 5) * e;
};

export function FitDiagram({ spec, calc }: { spec: FitDiagramSpec; calc: Calculator }) {
  const c = usePalette();
  const r = useHe3iReader(calc);
  const k = (x: X) => x !== undefined && r.known(x);
  /** A length in mm, whatever unit its variable is in. */
  const mm = (x: X) => (x === undefined ? 0 : r.v(x) * si4l(r.unitOf(x, 'mm')) * 1000);
  const txt = (x: X) => r.text(x, r.v(x), 'mm');
  const sym = (x: X, f: string) => r.symbol(x, f);
  return spec.stack ? stackView() : fitView();

  function fitView(): ReactNode {
    const basic = spec.basic !== undefined && k(spec.basic) ? mm(spec.basic) : 0;
    const dev = (x: X) => (k(x) ? (spec.deviations ? mm(x) : mm(x) - basic) : undefined);
    const zone = (z: FitDiagramSpec['hole']) => {
      if (!z) return undefined;
      const [hi, lo] = [dev(z.max), dev(z.min)];
      return hi === undefined || lo === undefined ? undefined : { hi, lo };
    };
    const hole = zone(spec.hole);
    const shaft = zone(spec.shaft);
    const cMax = hole && shaft ? hole.hi - shaft.lo : undefined;
    const cMin = hole && shaft ? hole.lo - shaft.hi : undefined;
    const name = cMax !== undefined && cMin !== undefined ? fitName(cMax, cMin) : undefined;
    const lines: string[] = [];
    const H = spec.hole;
    const S = spec.shaft;
    if (name && H && S) {
      lines.push(
        `${sym(spec.maxClearance, 'C_max')} = largest hole − smallest shaft = ${txt(H.max)} − ${txt(S.min)} = ${spec.maxClearance !== undefined && k(spec.maxClearance) ? txt(spec.maxClearance) : `${f3(cMax!)} mm`}.`,
        `${sym(spec.minClearance, 'C_min')} = smallest hole − largest shaft = ${txt(H.min)} − ${txt(S.max)} = ${spec.minClearance !== undefined && k(spec.minClearance) ? txt(spec.minClearance) : `${f3(cMin!)} mm`}.`,
        name === 'clearance'
          ? 'Both are positive: a clearance fit, the shaft always slides in.'
          : name === 'interference'
            ? 'Both are negative: an interference fit, the shaft is always pressed in.'
            : 'One positive, one negative: a transition fit, which may slide or press.',
      );
    } else lines.push('Type the hole’s and the shaft’s limits to draw their zones.');
    lines.push('Deviations are enlarged; the zero line is the basic size.');

    const ext = [0, ...(hole ? [hole.hi, hole.lo] : []), ...(shaft ? [shaft.hi, shaft.lo] : [])];
    const lo = Math.min(...ext);
    const hi = Math.max(...ext);
    const span = Math.max(hi - lo, 0.01);
    const rows = { hole: 64, shaft: 108, cMax: 156, cMin: 196 };
    return (
      <View>
        <Canvas aspect={(w) => 240 / w}>
          {({ w, h }) => {
            const pad = 76;
            const sx = (d: number) => pad + ((d - lo) / span) * (w - 2 * pad);
            const x0 = sx(0);
            const scale = nice(span / 3);
            const bar = (
              zn: { hi: number; lo: number } | undefined,
              y: number,
              fill: string,
              z: FitDiagramSpec['hole'],
              what: string,
            ) =>
              zn && z ? (
                <G>
                  <Rect
                    x={sx(zn.lo)}
                    y={y - 11}
                    width={Math.max(2, sx(zn.hi) - sx(zn.lo))}
                    height={22}
                    fill={fill}
                    stroke={c.chartInk}
                    strokeWidth={1}
                  />
                  {sx(zn.hi) - sx(zn.lo) > 46 ? (
                    <ChartText
                      x={(sx(zn.lo) + sx(zn.hi)) / 2}
                      y={y + 4}
                      textAnchor="middle"
                      fontWeight="700"
                    >
                      {what}
                    </ChartText>
                  ) : null}
                  <ChartText x={sx(zn.lo) - 5} y={y + 4} textAnchor="end" halo>
                    {txt(z.min)}
                  </ChartText>
                  <ChartText x={sx(zn.hi) + 5} y={y + 4} halo>
                    {txt(z.max)}
                  </ChartText>
                  {sx(zn.hi) - sx(zn.lo) <= 46 ? (
                    <ChartText
                      x={(sx(zn.lo) + sx(zn.hi)) / 2}
                      y={y - 15}
                      textAnchor="middle"
                      fontWeight="700"
                    >
                      {what}
                    </ChartText>
                  ) : null}
                </G>
              ) : null;
            /** A dimension between two deviations on row y, extension lines up to the bars. */
            const dim = (
              a: number,
              b: number,
              y: number,
              fromY: [number, number],
              text: string,
              color: string,
            ) => {
              const [xa, xb] = [sx(a), sx(b)];
              return (
                <G>
                  <Line
                    x1={xa}
                    y1={fromY[0]}
                    x2={xa}
                    y2={y + 6}
                    stroke={c.chartMuted}
                    strokeWidth={1}
                    strokeDasharray={chart.dashFine}
                  />
                  <Line
                    x1={xb}
                    y1={fromY[1]}
                    x2={xb}
                    y2={y + 6}
                    stroke={c.chartMuted}
                    strokeWidth={1}
                    strokeDasharray={chart.dashFine}
                  />
                  <Line x1={xa} y1={y} x2={xb} y2={y} stroke={color} strokeWidth={2} />
                  <Line x1={xa} y1={y - 5} x2={xa} y2={y + 5} stroke={color} strokeWidth={2} />
                  <Line x1={xb} y1={y - 5} x2={xb} y2={y + 5} stroke={color} strokeWidth={2} />
                  <HeLabel x={(xa + xb) / 2} y={y - 7} text={text} color={color} w={w} />
                </G>
              );
            };
            return (
              <Svg width={w} height={h}>
                {/* The zero line: the basic size. */}
                <Line
                  x1={x0}
                  y1={42}
                  x2={x0}
                  y2={rows.cMin + 10}
                  stroke={c.chartInk}
                  strokeWidth={chart.strokeLight}
                />
                <ChartText x={x0} y={36} textAnchor="middle" fontWeight="700" halo>
                  {spec.basic !== undefined && k(spec.basic) ? `0 = ${txt(spec.basic)}` : '0'}
                </ChartText>
                {name ? (
                  <ChartText
                    x={8}
                    y={16}
                    fontWeight="700"
                    fill={
                      name === 'clearance'
                        ? c.success
                        : name === 'interference'
                          ? c.danger
                          : c.warning
                    }
                  >
                    {`${name[0]!.toUpperCase()}${name.slice(1)} fit`}
                  </ChartText>
                ) : null}
                {bar(hole, rows.hole, c.he4lHole, spec.hole, 'hole')}
                {bar(shaft, rows.shaft, c.he4lShaft, spec.shaft, 'shaft')}
                {hole && shaft
                  ? dim(
                      shaft.lo,
                      hole.hi,
                      rows.cMax,
                      [rows.shaft + 11, rows.hole + 11],
                      `${sym(spec.maxClearance, 'C_max')} = ${spec.maxClearance !== undefined && k(spec.maxClearance) ? txt(spec.maxClearance) : `${f3(cMax!)} mm`}`,
                      cMax! >= 0 ? c.success : c.danger,
                    )
                  : null}
                {hole && shaft
                  ? dim(
                      shaft.hi,
                      hole.lo,
                      rows.cMin,
                      [rows.shaft + 11, rows.hole + 11],
                      `${sym(spec.minClearance, 'C_min')} = ${spec.minClearance !== undefined && k(spec.minClearance) ? txt(spec.minClearance) : `${f3(cMin!)} mm`}`,
                      cMin! >= 0 ? c.success : c.danger,
                    )
                  : null}
                {/* A scale bar: how big a micrometre is here. */}
                <Line
                  x1={w - 8 - (scale / span) * (w - 2 * pad)}
                  y1={h - 10}
                  x2={w - 8}
                  y2={h - 10}
                  stroke={c.chartInk}
                  strokeWidth={2}
                />
                <ChartText
                  x={w - 8 - (scale / span) * (w - 2 * pad) - 6}
                  y={h - 6}
                  textAnchor="end"
                  fill={c.chartMuted}
                >
                  {`${formatNumber(Number((scale * 1000).toPrecision(3)))} μm`}
                </ChartText>
              </Svg>
            );
          }}
        </Canvas>
        <Caption>{lines.join(' ')}</Caption>
      </View>
    );
  }

  function stackView(): ReactNode {
    const parts = spec.stack ?? [];
    const ts = parts.map((x) => (k(x) ? Math.abs(mm(x)) : undefined));
    const all = ts.every((t) => t !== undefined);
    const worst = all ? stackWorst(ts as number[]) : undefined;
    const rss = all ? stackRss(ts as number[]) : undefined;
    const lines: string[] = [];
    if (all) {
      lines.push(
        `Worst case: ${sym(spec.worst, 'T_wc')} = ΣTᵢ = ${parts.map((x) => r.text(x, r.v(x))).join(' + ')} = ±${spec.worst !== undefined && k(spec.worst) ? txt(spec.worst) : `${f3(worst!)} mm`}.`,
        `RSS: √(ΣTᵢ²) = ±${spec.rss !== undefined && k(spec.rss) ? txt(spec.rss) : `${f3(rss!)} mm`}, likelier when the parts vary at random.`,
      );
    } else lines.push('Type every tolerance to add up the stack.');
    return (
      <View>
        <Canvas aspect={(w) => 196 / w}>
          {({ w, h }) => {
            const x0 = 16;
            const x1 = w - 16;
            const n = Math.max(1, parts.length);
            const seg = (x1 - x0) / n;
            const sc = worst ? (x1 - x0) / worst : 0;
            const fills = [c.he4lHole, c.he4lShaft];
            let at = x0;
            return (
              <Svg width={w} height={h}>
                {/* The chain: one box per dimension, its ± tolerance on it. */}
                {parts.map((x, i) => (
                  <G key={`p${i}`}>
                    <Rect
                      x={x0 + i * seg}
                      y={20}
                      width={seg}
                      height={30}
                      fill={fills[i % 2]}
                      stroke={c.chartInk}
                      strokeWidth={1}
                    />
                    <ChartText x={x0 + (i + 0.5) * seg} y={39} textAnchor="middle" fontWeight="700">
                      {k(x) ? `±${formatNumber(Math.abs(r.v(x)))}` : '?'}
                    </ChartText>
                  </G>
                ))}
                <ChartText x={x0} y={68} fill={c.chartMuted}>
                  {`${parts.length} dimensions in a chain (mm)`}
                </ChartText>
                {all ? (
                  <G>
                    <HeLabel
                      x={x0}
                      y={96}
                      anchor="start"
                      text={`worst case ΣTᵢ = ±${spec.worst !== undefined && k(spec.worst) ? txt(spec.worst) : `${f3(worst!)} mm`}`}
                      w={w}
                    />
                    {(ts as number[]).map((t, i) => {
                      const x = at;
                      at += t * sc;
                      return (
                        <Rect
                          key={`w${i}`}
                          x={x}
                          y={104}
                          width={t * sc}
                          height={20}
                          fill={fills[i % 2]}
                          stroke={c.chartInk}
                          strokeWidth={1}
                        />
                      );
                    })}
                    <HeLabel
                      x={x0}
                      y={152}
                      anchor="start"
                      text={`RSS √(ΣTᵢ²) = ±${spec.rss !== undefined && k(spec.rss) ? txt(spec.rss) : `${f3(rss!)} mm`}`}
                      color={c.he4lFace}
                      w={w}
                    />
                    <Rect
                      x={x0}
                      y={160}
                      width={rss! * sc}
                      height={20}
                      fill={c.he4lFace}
                      opacity={0.75}
                      stroke={c.chartInk}
                      strokeWidth={1}
                    />
                    <Line x1={x0} y1={100} x2={x0} y2={184} stroke={c.chartInk} strokeWidth={1.5} />
                  </G>
                ) : null}
              </Svg>
            );
          }}
        </Canvas>
        <Caption>{lines.join(' ')}</Caption>
      </View>
    );
  }
}

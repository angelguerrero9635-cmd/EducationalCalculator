/**
 * Any one-component phase diagram (HC8; C-P8), `chemDiagram` mode `phase` with `substance`: flat
 * like a graph, pressure on a log scale against temperature in kelvins, all from the page's
 * values. The vapor curve runs from the triple point to the critical point through the page's
 * points by Clausius–Clapeyron (straight in 1 ÷ T against ln P between neighbours), so it passes
 * each point exactly; the melting line leaves the triple point at the page's dP/dT; the solid–gas
 * line runs through its own point by Clausius–Clapeyron. `zoom: 'melting'` draws the triple
 * point's neighbourhood to linear scales so the melting slope reads. `rule` marks a point with
 * F = C − P + 2 and an arrow for each degree of freedom.
 */
import { View } from 'react-native';
import Svg, { Circle, G, Line, Path, Rect } from 'react-native-svg';

import type { ChemDiagramHs3eSpec } from '@/data/modules/typesHs3e';
import type { PhaseRuleAt, PhaseSubstance } from '@/data/modules/typesHe1i';
import { formatNumber } from '@/engine/format';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, Caption, ChartText } from './common';
import { arrowHead } from './graphKit';
import { poly, ticks, useReadSpec } from './phaseEnvelopeKit';
import { degreesOfFreedom, vaporP, type TP } from './phaseEnvelopeMath';

type Spec = Extract<ChemDiagramHs3eSpec, { mode: 'phase' }>;
type Pt = [number, number];

const SUPER = '⁰¹²³⁴⁵⁶⁷⁸⁹';
/** 10ⁿ as written on a log axis: plain from 0.01 to 1000, a power of ten beyond. */
const decade = (n: number) =>
  n >= -2 && n <= 3
    ? formatNumber(10 ** n)
    : `10${n < 0 ? '⁻' : ''}${[...String(Math.abs(n))].map((d) => SUPER[Number(d)]).join('')}`;

/** ln P straight in 1 ÷ T through (T₀, P₀) with slope −b (b = ΔH ÷ R). */
const ccLine = (T0: number, P0: number, b: number) => (T: number) =>
  P0 * Math.exp(-b * (1 / T - 1 / T0));

export function ChemPhaseSubstance({ spec, calc }: { spec: Spec; calc: Calculator }) {
  const c = usePalette();
  const { read } = useReadSpec(calc);
  const s = spec.substance as PhaseSubstance;
  const unit = s.unit ?? 'atm';
  const name = s.name ?? 'The substance';
  const [Tt, Pt, Tc, Pc] = [
    read(s.triple[0]),
    read(s.triple[1]),
    read(s.critical[0]),
    read(s.critical[1]),
  ];
  const frame =
    Tt.known &&
    Pt.known &&
    Tc.known &&
    Pc.known &&
    Tc.value > Tt.value &&
    Pc.value > Pt.value &&
    Tt.value > 0 &&
    Pt.value > 0;
  const atm = s.atm ?? 1;
  const Tb = read(s.normalBoiling);
  const slopeV = read(s.meltSlope, 3);
  const sub = s.sublimation ? [read(s.sublimation[0]), read(s.sublimation[1])] : undefined;
  // The page's points on the vapor curve (a "?" one is left out).
  const pts = (s.points ?? []).map(([t, p], i) => ({ T: read(t), P: read(p), i }));
  const onCurve = (T: number) => frame && T > Tt.value && T < Tc.value;
  const knots: TP[] = frame
    ? [
        [Tt.value, Pt.value] as TP,
        ...pts
          .filter((p) => p.T.known && p.P.known && p.P.value > 0 && onCurve(p.T.value))
          .map((p): TP => [p.T.value, p.P.value]),
        ...(Tb.known && onCurve(Tb.value) ? [[Tb.value, atm] as TP] : []),
        [Tc.value, Pc.value] as TP,
      ]
        .sort((a, b) => a[0] - b[0])
        .filter(([T], i, all) => i === 0 || T > all[i - 1]![0] + 1e-9)
    : [];
  const monotone = knots.every(([, P], i) => i === 0 || P > knots[i - 1]![1]);
  // The vapor curve's first piece sets ΔH_vap near the triple point.
  const bVap =
    knots.length > 1
      ? -Math.log(knots[1]![1] / knots[0]![1]) / (1 / knots[1]![0] - 1 / knots[0]![0])
      : 0;
  const subKnown =
    !!sub &&
    sub[0]!.known &&
    sub[1]!.known &&
    sub[0]!.value < Tt.value &&
    sub[1]!.value > 0 &&
    sub[1]!.value < Pt.value;
  const bSub = subKnown
    ? -Math.log(Pt.value / sub![1]!.value) / (1 / Tt.value - 1 / sub![0]!.value)
    : 1.15 * bVap;
  const slope = slopeV.known && slopeV.value !== 0 ? slopeV.value : undefined;
  const zoom = s.zoom === 'melting';

  // The phase rule's point.
  const rule = s.rule;
  const C = read(rule?.components);
  const Ph = read(rule?.phases);
  const Fv = read(rule?.freedom);
  const F = C.known && Ph.known ? degreesOfFreedom(C.value, Ph.value) : undefined;
  const at: PhaseRuleAt | undefined =
    rule?.at ??
    (Ph.known
      ? ({ 3: 'triple', 2: 'vapor', 1: 'liquid' } as Record<number, PhaseRuleAt>)[Ph.value]
      : undefined);
  const ruleOk = !!rule && C.known && C.value === 1 && F !== undefined && F >= 0 && Ph.value <= 3;

  const art = (w: number, h: number) => {
    const l = 56;
    const r = w - 14;
    const t = 30;
    const b = h - 44;
    if (!frame)
      return (
        <Svg width={w} height={h}>
          <Line x1={l} y1={t} x2={l} y2={b} stroke={c.chartInk} strokeWidth={1.2} />
          <Line x1={l} y1={b} x2={r} y2={b} stroke={c.chartInk} strokeWidth={1.2} />
        </Svg>
      );
    const span = Tc.value - Tt.value;
    const vap = (T: number) => vaporP(knots, T);
    const melt = (P: number) => Tt.value + (P - Pt.value) / (slope ?? 0);
    // ── The window: log P over the whole diagram, or linear round the triple point ──
    let sx: (T: number) => number;
    let sy: (P: number) => number;
    let Tlo: number;
    let Thi: number;
    let Plo: number;
    let Phi: number;
    if (zoom) {
      const sl = slope ?? 1;
      [Tlo, Thi] = sl < 0 ? [Tt.value - 9, Tt.value + 3] : [Tt.value - 3, Tt.value + 9];
      Plo = 0;
      Phi = Pt.value + Math.abs(sl) * 8;
      sx = (T) => l + ((T - Tlo) / (Thi - Tlo)) * (r - l);
      sy = (P) => b - ((P - Plo) / (Phi - Plo)) * (b - t);
    } else {
      const Ps = pts.filter((p) => p.P.known && p.P.value > 0).map((p) => p.P.value);
      const Ts = pts.filter((p) => p.T.known).map((p) => p.T.value);
      Tlo = Math.min(
        Tt.value - 0.22 * span,
        ...Ts.map((x) => x - 0.05 * span),
        subKnown ? sub![0]!.value - 0.05 * span : Infinity,
      );
      Tlo = Math.max(1, Tlo);
      Thi = Math.max(Tc.value + 0.1 * span, ...Ts.map((x) => x + 0.05 * span));
      Plo = 10 ** Math.floor(Math.log10(Math.min(Pt.value / 100, ...Ps.map((p) => p / 3))));
      Phi = 10 ** Math.ceil(Math.log10(Math.max(Pc.value * 10, ...Ps.map((p) => p * 3))));
      const [a, z] = [Math.log10(Plo), Math.log10(Phi)];
      sx = (T) => l + ((T - Tlo) / (Thi - Tlo)) * (r - l);
      sy = (P) => b - ((Math.log10(Math.max(P, Plo)) - a) / (z - a)) * (b - t);
    }
    const inY = (P: number) => P >= Plo && P <= Phi;
    // ── The lines ──
    const vapor: Pt[] = [];
    for (let k = 0; k <= 80; k++) {
      const T = Tt.value + (span * k) / 80;
      vapor.push([sx(T), sy(vap(T))]);
    }
    for (const [T, P] of knots) vapor.push([sx(T), sy(P)]);
    vapor.sort((p, q) => p[0] - q[0]);
    const subl: Pt[] = [];
    const subP = ccLine(Tt.value, Pt.value, bSub);
    for (let k = 0; k <= 60; k++) {
      const T = Tlo + ((Tt.value - Tlo) * k) / 60;
      const P = subP(T);
      if (P >= Plo || zoom) subl.push([sx(T), sy(P)]);
    }
    // The melting line, from the triple point to the top (sketched upright without a slope).
    const meltTop: Pt = slope ? [sx(melt(Phi)), sy(Phi)] : [sx(Tt.value) + 0.02 * (r - l), sy(Phi)];
    const meltPath: Pt[] = [];
    for (let k = 0; k <= 40; k++) {
      const u = k / 40;
      if (slope) {
        const P = zoom ? Pt.value + (Phi - Pt.value) * u : Pt.value * (Phi / Pt.value) ** u;
        meltPath.push([sx(melt(P)), sy(P)]);
      } else
        meltPath.push([
          sx(Tt.value) + 0.02 * (r - l) * u,
          sy(Pt.value) + (sy(Phi) - sy(Pt.value)) * u,
        ]);
    }
    const tri: Pt = [sx(Tt.value), sy(Pt.value)];
    const crit: Pt = [sx(Tc.value), sy(Pc.value)];
    const solid: Pt[] = [...subl, ...meltPath, [l, t], [l, subl[0]?.[1] ?? b]];
    const liquid: Pt[] = [...meltPath, [Math.min(r, crit[0]), t], crit, ...[...vapor].reverse()];
    // ── Axes ──
    const tx = ticks(Tlo, Thi, zoom ? 4 : 5).out.filter((T) => T >= Tlo && T <= Thi);
    const decades: number[] = [];
    if (!zoom) {
      const [a, z] = [Math.round(Math.log10(Plo)), Math.round(Math.log10(Phi))];
      const every = Math.ceil((z - a + 1) / 7);
      for (let n = a; n <= z; n += every) decades.push(n);
    }
    const py = zoom ? ticks(0, Phi, 5).out.filter((P) => P <= Phi) : [];
    // ── The phase rule's point ──
    let rp: Pt | undefined;
    let dirs: Pt[] = [];
    if (rule && at) {
      const tangent = (T: number, f: (T: number) => number): Pt => {
        const [x0, y0, x1, y1] = [
          sx(T - 0.01 * span),
          sy(f(T - 0.01 * span)),
          sx(T + 0.01 * span),
          sy(f(T + 0.01 * span)),
        ];
        const d = Math.hypot(x1 - x0, y1 - y0) || 1;
        return [(x1 - x0) / d, (y1 - y0) / d];
      };
      const Tv = Tb.known && onCurve(Tb.value) ? Tb.value : Tt.value + 0.45 * span;
      const placed: Record<PhaseRuleAt, () => [Pt, Pt[]]> = {
        triple: () => [tri, []],
        critical: () => [crit, []],
        vapor: () => [[sx(Tv), sy(vap(Tv))], [tangent(Tv, vap)]],
        sublimation: () => {
          const T = Tt.value - 0.1 * span;
          return [[sx(T), sy(subP(T))], [tangent(T, subP)]];
        },
        melting: () => {
          const p = meltPath[20]!;
          const q = meltPath[24]!;
          const d = Math.hypot(q[0] - p[0], q[1] - p[1]) || 1;
          return [p, [[(q[0] - p[0]) / d, (q[1] - p[1]) / d]]];
        },
        liquid: () => {
          const T = Tt.value + 0.4 * span;
          return [
            [sx(T), sy(Math.min(vap(T) * 30, Pc.value * 3))],
            [
              [1, 0],
              [0, 1],
            ],
          ];
        },
        gas: () => {
          const T = Tt.value + 0.55 * span;
          return [
            [sx(T), sy(vap(T) / 40)],
            [
              [1, 0],
              [0, 1],
            ],
          ];
        },
        solid: () => {
          const T = Tt.value - 0.12 * span;
          return [
            [sx(T), sy(Math.max(subP(T) * 40, Pt.value * 10))],
            [
              [1, 0],
              [0, 1],
            ],
          ];
        },
      };
      [rp, dirs] = placed[at]();
    }
    /** A point's name beside it, turned to the other side where it would leave the plot. */
    const label = (x: number, y: number, text: string, side: 'start' | 'end', dy = -8) => {
      const tw = [...text].length * chart.label * 0.6;
      const anchor =
        side === 'start' && x + 8 + tw > r
          ? 'end'
          : side === 'end' && x - 8 - tw < l
            ? 'start'
            : side;
      return (
        <ChartText
          x={x + (anchor === 'start' ? 8 : -8)}
          y={y + dy}
          textAnchor={anchor}
          fontSize={chart.label}
          fontWeight="700"
          halo
        >
          {text}
        </ChartText>
      );
    };
    const midRight = (x: number) => (x > (l + r) / 2 ? 'end' : 'start');
    // Slope triangle in the zoom: a run of 1 K and its rise.
    const tri1 =
      zoom && slope
        ? (() => {
            const P0 = Pt.value + 0.3 * (Phi - Pt.value);
            const T0 = melt(P0);
            return {
              a: [sx(T0), sy(P0)] as Pt,
              bq: [sx(T0 + 1), sy(P0)] as Pt,
              cq: [sx(T0 + 1), sy(P0 + slope)] as Pt,
            };
          })()
        : undefined;
    const slopeFits =
      !!tri1 &&
      tri1.bq[0] + 8 + [...`dP/dT = ${slopeV.text} ${unit}/K`].length * chart.value * 0.6 < r;
    return (
      <Svg width={w} height={h}>
        <Rect x={l} y={t} width={r - l} height={b - t} fill={c.phaseGas} />
        <Path d={`${poly(solid)} Z`} fill={c.phaseSolid} />
        <Path d={`${poly(liquid)} Z`} fill={c.phaseLiquid} />
        {/* Axes and ticks. */}
        {tx.map((T) => (
          <G key={`t${T}`}>
            <Line x1={sx(T)} y1={b} x2={sx(T)} y2={b + 4} stroke={c.chartInk} />
            <ChartText
              x={sx(T)}
              y={b + 16}
              textAnchor="middle"
              fontSize={chart.label}
              fill={c.chartMuted}
            >
              {formatNumber(T)}
            </ChartText>
          </G>
        ))}
        {decades.map((n) => (
          <G key={`p${n}`}>
            <Line x1={l - 4} y1={sy(10 ** n)} x2={l} y2={sy(10 ** n)} stroke={c.chartInk} />
            <ChartText
              x={l - 6}
              y={sy(10 ** n) + 4}
              textAnchor="end"
              fontSize={chart.label}
              fill={c.chartMuted}
            >
              {decade(n)}
            </ChartText>
          </G>
        ))}
        {py.map((P) => (
          <G key={`p${P}`}>
            <Line x1={l - 4} y1={sy(P)} x2={l} y2={sy(P)} stroke={c.chartInk} />
            <ChartText
              x={l - 6}
              y={sy(P) + 4}
              textAnchor="end"
              fontSize={chart.label}
              fill={c.chartMuted}
            >
              {formatNumber(P)}
            </ChartText>
          </G>
        ))}
        <Line x1={l} y1={t} x2={l} y2={b} stroke={c.chartInk} strokeWidth={1.2} />
        <Line x1={l} y1={b} x2={r} y2={b} stroke={c.chartInk} strokeWidth={1.2} />
        <ChartText x={(l + r) / 2} y={h - 8} textAnchor="middle" fontSize={chart.label}>
          T (K)
        </ChartText>
        <ChartText x={4} y={t - 12} fontSize={chart.label}>
          {`P (${unit})${zoom ? '' : ', log scale'}`}
        </ChartText>
        {/* 1 atm, dashed. */}
        {!zoom && inY(atm) ? (
          <G>
            <Line
              x1={l}
              y1={sy(atm)}
              x2={r}
              y2={sy(atm)}
              stroke={c.chartMuted}
              strokeDasharray={chart.dashFine}
            />
            <ChartText
              x={r - 4}
              y={sy(atm) - 5}
              textAnchor="end"
              fontSize={chart.label}
              fill={c.chartMuted}
              halo
            >
              1 atm
            </ChartText>
          </G>
        ) : null}
        {/* Supercritical: beyond the critical point, dashed. */}
        {!zoom ? (
          <G>
            <Line
              x1={crit[0]}
              y1={crit[1]}
              x2={crit[0]}
              y2={t}
              stroke={c.chartMuted}
              strokeDasharray={chart.dash}
            />
            <Line
              x1={crit[0]}
              y1={crit[1]}
              x2={r}
              y2={crit[1]}
              stroke={c.chartMuted}
              strokeDasharray={chart.dash}
            />
          </G>
        ) : null}
        {/* The three lines. */}
        <Path
          d={poly(subl)}
          stroke={c.chartInk}
          strokeWidth={chart.stroke}
          fill="none"
          strokeDasharray={subKnown ? undefined : chart.dash}
        />
        <Path
          d={poly(meltPath)}
          stroke={c.chartInk}
          strokeWidth={chart.stroke}
          fill="none"
          strokeDasharray={slope ? undefined : chart.dash}
        />
        <Path
          d={poly(vapor)}
          stroke={c.chartInk}
          strokeWidth={chart.stroke}
          fill="none"
          opacity={monotone ? 1 : 0.4}
        />
        {/* Region names. */}
        <ChartText x={l + 6} y={zoom ? b - 30 : t + 16} fontSize={chart.value} fontWeight="700">
          Solid
        </ChartText>
        {/* Clear of "Solid" where the solid is a narrow strip (water). */}
        <ChartText
          x={Math.max(Math.min(crit[0], meltTop[0] + (r - l) * 0.12), zoom ? 0 : l + 62)}
          y={t + 16}
          fontSize={chart.value}
          fontWeight="700"
        >
          Liquid
        </ChartText>
        {/* (In the zoom the gas is a sliver at P ≈ 0, too thin to name.) */}
        {!zoom ? (
          <ChartText x={r - 6} y={b - 10} textAnchor="end" fontSize={chart.value} fontWeight="700">
            Gas
          </ChartText>
        ) : null}
        {!zoom && crit[0] < r - 60 ? (
          <ChartText
            x={r - 6}
            y={t + 16}
            textAnchor="end"
            fontSize={chart.label}
            fill={c.chartMuted}
          >
            Supercritical
          </ChartText>
        ) : null}
        {/* The marked points. */}
        <Circle cx={tri[0]} cy={tri[1]} r={4} fill={c.chartInk} />
        {label(tri[0], tri[1], 'triple point', 'end', zoom ? -10 : 16)}
        {!zoom ? (
          <G>
            <Circle cx={crit[0]} cy={crit[1]} r={4} fill={c.chartInk} />
            {label(crit[0], crit[1], 'critical point', 'end')}
          </G>
        ) : null}
        {!zoom
          ? pts.map((p, i) =>
              p.T.known && p.P.known && p.P.value > 0 && onCurve(p.T.value) ? (
                <G key={`pt${p.i}`}>
                  <Circle cx={sx(p.T.value)} cy={sy(p.P.value)} r={5} fill={c.chartHighlight} />
                  {label(
                    sx(p.T.value),
                    sy(p.P.value),
                    `${p.T.text} K, ${p.P.text} ${unit}`,
                    i % 2 ? 'start' : 'end',
                    i % 2 ? 16 : -8,
                  )}
                </G>
              ) : null,
            )
          : null}
        {!zoom && Tb.known && onCurve(Tb.value) ? (
          <G>
            <Circle cx={sx(Tb.value)} cy={sy(atm)} r={4.5} fill={c.chartHighlight} />
            {label(sx(Tb.value), sy(atm), `boils at ${Tb.text} K`, 'start', 16)}
          </G>
        ) : null}
        {subKnown && !zoom ? (
          <G>
            <Circle cx={sx(sub![0]!.value)} cy={sy(sub![1]!.value)} r={4} fill={c.chartInk} />
          </G>
        ) : null}
        {tri1 ? (
          <G>
            <Line
              x1={tri1.a[0]}
              y1={tri1.a[1]}
              x2={tri1.bq[0]}
              y2={tri1.bq[1]}
              stroke={c.chartHighlight}
              strokeWidth={1.6}
            />
            <Line
              x1={tri1.bq[0]}
              y1={tri1.bq[1]}
              x2={tri1.cq[0]}
              y2={tri1.cq[1]}
              stroke={c.chartHighlight}
              strokeWidth={1.6}
            />
            <ChartText
              x={(tri1.a[0] + tri1.bq[0]) / 2}
              y={tri1.a[1] + (slope! < 0 ? -6 : 16)}
              textAnchor="middle"
              fontSize={chart.label}
              fontWeight="700"
              fill={c.chartHighlight}
              halo
            >
              1 K
            </ChartText>
            {/* Beside the rise, or over the triangle where it would leave the plot. */}
            <ChartText
              x={slopeFits ? tri1.bq[0] + 8 : r - 4}
              y={
                slopeFits
                  ? (tri1.bq[1] + tri1.cq[1]) / 2 + 4
                  : Math.min(tri1.bq[1], tri1.cq[1], tri1.a[1]) - 10
              }
              textAnchor={slopeFits ? 'start' : 'end'}
              fontSize={chart.value}
              fontWeight="700"
              fill={c.chartHighlight}
              halo
            >
              {`dP/dT = ${slopeV.text} ${unit}/K`}
            </ChartText>
          </G>
        ) : null}
        {/* The phase rule's point and its free directions. */}
        {rp ? (
          <G opacity={ruleOk ? 1 : 0.35}>
            {F !== undefined && F >= 1
              ? (F >= 2 ? dirs.slice(0, 2) : dirs.slice(0, 1)).flatMap(([dx, dy], k) =>
                  [1, -1].map((sgn) => {
                    const [ex, ey] = [rp![0] + sgn * dx * 26, rp![1] + sgn * dy * 26];
                    return (
                      <G key={`a${k}${sgn}`}>
                        <Line
                          x1={rp![0]}
                          y1={rp![1]}
                          x2={ex - sgn * dx * 6}
                          y2={ey - sgn * dy * 6}
                          stroke={c.lineUpright}
                          strokeWidth={2}
                        />
                        <Path d={arrowHead(ex, ey, sgn * dx, sgn * dy, 8)} fill={c.lineUpright} />
                      </G>
                    );
                  }),
                )
              : null}
            <Circle
              cx={rp[0]}
              cy={rp[1]}
              r={7}
              fill="none"
              stroke={c.lineUpright}
              strokeWidth={2.5}
            />
            {label(
              rp[0],
              rp[1],
              `F = ${Fv.known ? Fv.text : F === undefined ? '?' : formatNumber(F)}`,
              midRight(rp[0]),
              -12,
            )}
          </G>
        ) : null}
      </Svg>
    );
  };

  const lines: string[] = [];
  if (!frame) lines.push('Type the triple and critical points to draw the diagram.');
  else {
    const shown = pts.filter((p) => p.T.known && p.P.known);
    lines.push(
      zoom
        ? `${name} near its triple point (${Tt.text} K, ${Pt.text} ${unit}), both axes to linear scales: the vapor and solid–gas lines hug P ≈ 0 here.`
        : `${name}: the vapor curve runs from the triple point (${Tt.text} K, ${Pt.text} ${unit}) to the critical point (${Tc.text} K, ${Pc.text} ${unit})${shown.length ? `, through ${shown.map((p) => `(${p.T.text} K, ${p.P.text} ${unit})`).join(' and ')}` : ''}; pressure on a log scale.`,
    );
    if (!zoom)
      lines.push(
        'Between neighbouring points ln P is a straight line in 1 ÷ T: Clausius–Clapeyron, ln(P₂ ÷ P₁) = −(ΔH_vap ÷ R)(1/T₂ − 1/T₁), with ΔH_vap constant on each piece.',
      );
    if (!monotone)
      lines.push(
        'The points don’t rise with temperature, so no vapor curve passes through them all (drawn faded).',
      );
    for (const p of pts)
      if (p.T.known && !onCurve(p.T.value))
        lines.push(
          `${p.T.text} K lies outside the liquid’s range (${Tt.text} to ${Tc.text} K): that point is not on the vapor curve.`,
        );
    if (slope)
      lines.push(
        slope < 0
          ? `The melting line leans left: dP/dT = ${slopeV.text} ${unit}/K, so raising the pressure lowers the melting point.`
          : `The melting line leans right: dP/dT = ${slopeV.text} ${unit}/K, so raising the pressure raises the melting point.`,
      );
    else lines.push('The melting line is sketched steep (no slope given).');
    if (!subKnown && !zoom)
      lines.push(
        'The solid–gas line is sketched dashed, with ΔH_sub taken as 1.15 ΔH_vap (no point given).',
      );
    if (Pt.value > atm && !zoom)
      lines.push(`The triple point is above 1 atm: at 1 atm the solid turns straight to gas.`);
    if (rule) {
      if (F === undefined) lines.push('Type C and P to find the degrees of freedom.');
      else {
        const sum = `F = C − P + 2 = ${C.text} − ${Ph.text} + 2 = ${formatNumber(F)}`;
        if (C.value !== 1)
          lines.push(
            `${sum}. This diagram has one component; with C = ${C.text} the point needs composition axes too (drawn faded).`,
          );
        else if (F < 0 || Ph.value > 3)
          lines.push(
            `${sum}: no point of a one-component system has more than three phases together (drawn faded).`,
          );
        else
          lines.push(
            `${sum}: ${
              F === 0
                ? 'nothing can change; the point is fixed'
                : F === 1
                  ? 'one of T and P can change, and the other must follow the line'
                  : 'T and P can both change on their own'
            }.`,
          );
      }
    }
  }

  return (
    <View>
      <Canvas aspect={(w) => Math.min(1, 360 / w)}>{({ w, h }) => art(w, h)}</Canvas>
      <Caption>{lines.join(' · ')}</Caption>
    </View>
  );
}

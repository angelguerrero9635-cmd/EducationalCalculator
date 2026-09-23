import { useRef } from 'react';
import { StyleSheet } from 'react-native';
import Svg, { Circle, ClipPath, Defs, G, Line, Path, Rect } from 'react-native-svg';

import { Text } from '@/components/Text';
import type { Representation } from '@/data/modules';
import { formatNumber } from '@/engine/format';
import { solve } from '@/engine/solve';
import { chart, font, space, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, ChartText, DragHandle, niceCeil, useFrozen, useRep } from './common';

type Spec = Extract<Representation, { kind: 'plot' }>;
const SAMPLES = 120;

/** A tick spacing of 1, 2 or 5 × 10ⁿ giving about 5 ticks. */
export function niceStep(range: number): number {
  const raw = range / 5;
  const pow = 10 ** Math.floor(Math.log10(raw));
  const n = raw / pow;
  return (n < 1.5 ? 1 : n < 3.5 ? 2 : n < 7.5 ? 5 : 10) * pow;
}

const ticks = (min: number, max: number) => {
  const step = niceStep(max - min);
  const out: number[] = [];
  for (let t = Math.ceil(min / step) * step; t <= max + 1e-9; t += step) {
    out.push(Number(t.toFixed(10)));
  }
  return out;
};

/** Grows [min, max] to a round range that includes every value (never shrinks it). */
const grow = (min: number, max: number, values: number[]) => {
  const lo = Math.min(min, ...values);
  const hi = Math.max(max, ...values);
  return {
    min: lo < min ? -niceCeil(-lo * 1.1) : min,
    max: hi > max ? niceCeil(hi * 1.1) : max,
  };
};

export function Plot({ spec, calc }: { spec: Spec; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  const start = useRef(0);
  const { module, values } = calc;
  const pinned = rep.pin(spec.params);
  const paramsKnown = spec.params.every(rep.known);
  // Everything on the graph is in the shown units (axis ranges in the spec are shown numbers).
  const fx = rep.factor(spec.x.var);
  const fy = rep.factor(spec.y.var);
  const px = values[spec.x.var] === undefined ? undefined : values[spec.x.var]! / fx;
  const py = values[spec.y.var] === undefined ? undefined : values[spec.y.var]! / fy;

  const curveOver = (xMin: number, xMax: number) => {
    if (!paramsKnown) return [];
    const givens = Object.entries(pinned).map(([id, value]) => ({ id, value }));
    return Array.from({ length: SAMPLES + 1 }, (_, i) => {
      const x = xMin + ((xMax - xMin) * i) / SAMPLES;
      const y = solve(module, [...givens, { id: spec.x.var, value: x * fx }]).values[spec.y.var];
      return { x, y: y === undefined ? undefined : y / fy };
    });
  };

  // Axis ranges: the spec's ranges, grown to keep the point and curve in view if autoRange.
  const xr = spec.autoRange && px !== undefined ? grow(spec.x.min, spec.x.max, [px]) : spec.x;
  const liveCurve = curveOver(xr.min, xr.max);
  const yr = spec.autoRange
    ? grow(spec.y.min, spec.y.max, [
        ...liveCurve.flatMap((p) => (p.y === undefined || !Number.isFinite(p.y) ? [] : [p.y])),
        ...(py === undefined ? [] : [py]),
      ])
    : spec.y;
  const axes = useFrozen({ x: { min: xr.min, max: xr.max }, y: { min: yr.min, max: yr.max } });
  const X = axes.value.x;
  const Yr = axes.value.y;
  const curve = X.min === xr.min && X.max === xr.max ? liveCurve : curveOver(X.min, X.max);

  // Slopes are converted to shown-y per shown-x; the intercept to shown-y.
  const slopeOf = (id: string | undefined) =>
    id && values[id] !== undefined ? (values[id]! * fx) / fy : undefined;
  const slope = slopeOf(spec.tangentSlope);
  const riseRun = slopeOf(spec.slopeTriangle);
  const intercept =
    spec.intercept && values[spec.intercept] !== undefined
      ? values[spec.intercept]! / fy
      : undefined;
  const axisLabel = (axis: Spec['x']) => {
    const v = rep.variable(axis.var);
    const unit = rep.unit(axis.var);
    return axis.label ?? `${v.symbol}${unit ? ` (${unit})` : ''}`;
  };
  const xVar = rep.variable(spec.x.var);

  return (
    <>
      <Canvas aspect={0.75}>
        {({ w, h }) => {
          const L = 44;
          const R = 12;
          const T = 24;
          const B = 34;
          const xScale = (w - L - R) / (X.max - X.min);
          const yScale = (h - T - B) / (Yr.max - Yr.min);
          const sx = (x: number) => L + (x - X.min) * xScale;
          const sy = (y: number) => h - B - (y - Yr.min) * yScale;
          const axisY = sy(Math.min(Yr.max, Math.max(Yr.min, 0)));
          const axisX = sx(Math.min(X.max, Math.max(X.min, 0)));

          let d = '';
          let pen = false;
          for (const p of curve) {
            if (p.y === undefined || !Number.isFinite(p.y)) {
              pen = false;
              continue;
            }
            d += `${pen ? 'L' : 'M'} ${sx(p.x).toFixed(1)} ${sy(p.y).toFixed(1)} `;
            pen = true;
          }

          let shade = '';
          if (spec.shadeToPoint && px !== undefined) {
            const pts = curve.filter((p) => p.y !== undefined && p.x <= px);
            if (pts.length > 1) {
              shade =
                `M ${sx(pts[0]!.x)} ${sy(0)} ` +
                pts.map((p) => `L ${sx(p.x)} ${sy(p.y!)}`).join(' ') +
                ` L ${sx(pts[pts.length - 1]!.x)} ${sy(0)} Z`;
            }
          }

          // Rise/run triangle: run of 1 to the right (or left if there is no room).
          const run = px !== undefined && px + 1 > X.max ? -1 : 1;
          const hasPoint = px !== undefined && py !== undefined;
          const hx = px === undefined ? undefined : Math.min(w - R, Math.max(L, sx(px)));
          const hy = py === undefined ? undefined : Math.min(h - B, Math.max(T, sy(py)));

          return (
            <>
              <Svg width={w} height={h}>
                <Defs>
                  <ClipPath id="plot-area">
                    <Rect x={L} y={T} width={w - L - R} height={h - T - B} />
                  </ClipPath>
                </Defs>
                <Rect
                  x={L}
                  y={T}
                  width={w - L - R}
                  height={h - T - B}
                  fill="none"
                  stroke={c.chartGrid}
                />
                {ticks(X.min, X.max).map((t) => (
                  <G key={`x${t}`}>
                    <Line x1={sx(t)} y1={T} x2={sx(t)} y2={h - B} stroke={c.chartSurface} />
                    <ChartText
                      x={sx(t)}
                      y={h - B + 14}
                      fontSize={chart.tiny}
                      fill={c.chartMuted}
                      textAnchor="middle"
                    >
                      {formatNumber(t)}
                    </ChartText>
                  </G>
                ))}
                {ticks(Yr.min, Yr.max).map((t) => (
                  <G key={`y${t}`}>
                    <Line x1={L} y1={sy(t)} x2={w - R} y2={sy(t)} stroke={c.chartSurface} />
                    <ChartText
                      x={L - 6}
                      y={sy(t) + 3}
                      fontSize={chart.tiny}
                      fill={c.chartMuted}
                      textAnchor="end"
                    >
                      {formatNumber(t)}
                    </ChartText>
                  </G>
                ))}
                <Line x1={L} y1={axisY} x2={w - R} y2={axisY} stroke={c.chartMuted} />
                <Line x1={axisX} y1={T} x2={axisX} y2={h - B} stroke={c.chartMuted} />
                <ChartText x={w - R} y={h - 4} fontSize={chart.small} textAnchor="end">
                  {axisLabel(spec.x)}
                </ChartText>
                <ChartText x={4} y={12} fontSize={chart.small}>
                  {axisLabel(spec.y)}
                </ChartText>
                <G clipPath="url(#plot-area)">
                  {shade ? <Path d={shade} fill={c.chartFill} /> : null}
                  {d ? (
                    <Path d={d} stroke={c.chartInk} strokeWidth={chart.stroke} fill="none" />
                  ) : null}
                  {slope !== undefined && hasPoint ? (
                    <Line
                      x1={sx(X.min)}
                      y1={sy(py! + slope * (X.min - px!))}
                      x2={sx(X.max)}
                      y2={sy(py! + slope * (X.max - px!))}
                      stroke={c.chartMuted}
                      strokeWidth={chart.strokeLight}
                      strokeDasharray={chart.dash}
                    />
                  ) : null}
                  {riseRun !== undefined && hasPoint ? (
                    <>
                      <Path
                        d={`M ${sx(px!)} ${sy(py!)} L ${sx(px! + run)} ${sy(py!)} L ${sx(px! + run)} ${sy(py! + run * riseRun)}`}
                        stroke={c.chartMuted}
                        strokeWidth={chart.strokeLight}
                        strokeDasharray={chart.dashFine}
                        fill="none"
                      />
                      <ChartText
                        x={sx(px! + run / 2)}
                        y={sy(py!) + (riseRun * run >= 0 ? 14 : -6)}
                        fontSize={chart.small}
                        fill={c.chartMuted}
                        textAnchor="middle"
                      >
                        run 1
                      </ChartText>
                      <ChartText
                        x={sx(px! + run) + (run > 0 ? 4 : -4)}
                        y={sy(py! + (run * riseRun) / 2) + 4}
                        fontSize={chart.small}
                        fill={c.chartMuted}
                        textAnchor={run > 0 ? 'start' : 'end'}
                      >
                        {`rise ${formatNumber(riseRun)}`}
                      </ChartText>
                    </>
                  ) : null}
                  {intercept !== undefined ? (
                    <>
                      <Circle
                        cx={sx(0)}
                        cy={sy(intercept)}
                        r={4}
                        fill={c.background}
                        stroke={c.chartInk}
                        strokeWidth={chart.strokeLight}
                      />
                      <ChartText x={sx(0) + 7} y={sy(intercept) - 7} fontSize={chart.small}>
                        {`(0, ${formatNumber(intercept)})`}
                      </ChartText>
                    </>
                  ) : null}
                  {hasPoint ? (
                    <>
                      <Line
                        x1={sx(px!)}
                        y1={sy(py!)}
                        x2={sx(px!)}
                        y2={axisY}
                        stroke={c.chartMuted}
                        strokeDasharray={chart.dashFine}
                      />
                      <Line
                        x1={sx(px!)}
                        y1={sy(py!)}
                        x2={axisX}
                        y2={sy(py!)}
                        stroke={c.chartMuted}
                        strokeDasharray={chart.dashFine}
                      />
                      <Circle cx={sx(px!)} cy={sy(py!)} r={5} fill={c.chartInk} />
                    </>
                  ) : null}
                </G>
              </Svg>
              {hx !== undefined && hy !== undefined ? (
                <DragHandle
                  testID="drag-point"
                  x={hx}
                  y={hy}
                  label={xVar.name}
                  onStart={() => {
                    start.current = px ?? 0;
                    axes.freeze();
                  }}
                  onEnd={axes.release}
                  onMove={(dx) =>
                    calc.set({
                      ...pinned,
                      [spec.x.var]: rep.snapTo(spec.x.var, (start.current + dx / xScale) * fx),
                    })
                  }
                />
              ) : null}
            </>
          );
        }}
      </Canvas>
      <Text style={[styles.caption, { color: c.text }]}>
        {[spec.x.var, spec.y.var, ...(spec.tangentSlope ? [spec.tangentSlope] : []), ...spec.params]
          .map((id) => rep.label(id))
          .join('   ·   ')}
      </Text>
      {!paramsKnown ? (
        <Text style={[styles.caption, { color: c.textMuted }]}>
          {`Enter ${spec.params.map((id) => rep.variable(id).symbol).join(' and ')} to draw the graph.`}
        </Text>
      ) : null}
    </>
  );
}

const styles = StyleSheet.create({
  caption: {
    fontSize: font.caption + 1,
    textAlign: 'center',
    marginTop: space.sm,
    paddingHorizontal: space.lg,
  },
});

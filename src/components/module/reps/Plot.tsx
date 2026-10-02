import { useRef } from 'react';
import { StyleSheet } from 'react-native';
import Svg, { Circle, ClipPath, Defs, G, Line, Path, Rect } from 'react-native-svg';

import { Text } from '@/components/Text';
import type { Representation } from '@/data/modules';
import { formatNumber } from '@/engine/format';
import { solve } from '@/engine/solve';
import { chart, font, space, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import {
  Canvas,
  ChartText,
  DragHandle,
  fitLabel,
  niceCeil,
  useFrozen,
  useRep,
  Caption,
  pinHeld,
} from './common';

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
    // K–6 words pages name the axis ("Mass (g)"), never "m (g)".
    return axis.label ?? `${rep.words ? v.name : v.symbol}${unit ? ` (${unit})` : ''}`;
  };
  const xVar = rep.variable(spec.x.var);

  // y = kx: the point (1, k), in shown units.
  const k = spec.unitRate && paramsKnown ? slopeOf(spec.unitRate) : undefined;
  const unitPoint = k === undefined ? undefined : { k, text: `(1, ${formatNumber(k)})` };
  const symbolOf = (id: string) => (rep.words ? rep.variable(id).name : rep.variable(id).symbol);
  const [xs, ys] = [symbolOf(spec.x.var), symbolOf(spec.y.var)];
  // The table: its x values and the point's, each with y and y ÷ x (the same k in every row).
  const yAt = (x: number) => {
    if (!paramsKnown) return undefined;
    const givens = Object.entries(pinned).map(([id, value]) => ({ id, value }));
    const y = solve(module, [...givens, { id: spec.x.var, value: x * fx }]).values[spec.y.var];
    return y === undefined ? undefined : Number((y / fy).toFixed(10));
  };
  const tableHeads = [xs, ys, `${ys} ÷ ${xs}`];
  const tableRows = spec.table
    ? [...new Set([...spec.table, ...(px === undefined ? [] : [px])])]
        .sort((a, b) => a - b)
        .slice(0, 8)
        .map((x) => {
          const y = yAt(x);
          return {
            cells: [
              formatNumber(x),
              y === undefined ? '?' : formatNumber(y),
              y === undefined ? '?' : x === 0 ? '—' : formatNumber(Number((y / x).toFixed(8))),
            ],
            current: x === px,
          };
        })
    : [];

  return (
    <>
      <Canvas aspect={spec.table ? 0.72 : 0.75}>
        {({ w: cw, h }) => {
          // With a table, the graph takes the left part and the table the right.
          const w = spec.table ? Math.round(cw * 0.62) : cw;
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
          const inView = (x: number, y: number) =>
            x >= L - 1 && x <= w - R + 1 && y >= T - 1 && y <= h - B + 1;

          return (
            <>
              <Svg width={cw} height={h}>
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
                  {(spec.reference ?? []).map((r) => (
                    <G key={r.label}>
                      <Line
                        x1={sx(X.min)}
                        y1={sy(r.slope * X.min)}
                        x2={sx(X.max)}
                        y2={sy(r.slope * X.max)}
                        stroke={c.chartMuted}
                        strokeWidth={chart.strokeLight}
                        strokeDasharray={chart.dash}
                      />
                      <ChartText
                        x={sx(Math.min(X.max, (Yr.max * 0.9) / r.slope)) - 4}
                        y={sy(Math.min(Yr.max * 0.9, r.slope * X.max)) - 6}
                        fontSize={chart.small}
                        fill={c.chartMuted}
                        textAnchor="end"
                      >
                        {r.label}
                      </ChartText>
                    </G>
                  ))}
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
                  {unitPoint ? (
                    <>
                      <Line
                        x1={sx(1)}
                        y1={sy(unitPoint.k)}
                        x2={sx(1)}
                        y2={axisY}
                        stroke={c.chartHighlight}
                        strokeDasharray={chart.dashFine}
                      />
                      <Line
                        x1={sx(1)}
                        y1={sy(unitPoint.k)}
                        x2={axisX}
                        y2={sy(unitPoint.k)}
                        stroke={c.chartHighlight}
                        strokeDasharray={chart.dashFine}
                      />
                      <Circle cx={sx(0)} cy={sy(0)} r={3.5} fill={c.chartInk} />
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
                {unitPoint && inView(sx(1), sy(unitPoint.k)) ? (
                  <>
                    <Circle
                      cx={sx(1)}
                      cy={sy(unitPoint.k)}
                      r={6}
                      fill={c.card}
                      stroke={c.chartHighlight}
                      strokeWidth={chart.stroke}
                    />
                    <ChartText
                      {...fitLabel(sx(1) + 14, unitPoint.text, chart.label, w - R, 'start', 14)}
                      y={Math.max(T + 10, sy(unitPoint.k) - 12)}
                      fontSize={chart.label}
                      fontWeight="700"
                      fill={c.chartHighlight}
                    >
                      {unitPoint.text}
                    </ChartText>
                  </>
                ) : null}
                {spec.table ? (
                  <ValueColumns
                    x0={w + 10}
                    x1={cw - 1}
                    y0={T - 14}
                    y1={h - B + 10}
                    heads={tableHeads}
                    rows={tableRows}
                  />
                ) : null}
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
                  onMove={(dx) => {
                    const x = rep.snapTo(spec.x.var, (start.current + dx / xScale) * fx);
                    calc.set(
                      { ...pinHeld(calc, rep, spec.params, { [spec.x.var]: x }), [spec.x.var]: x },
                      rep.slide(spec.x.var),
                    );
                  }}
                />
              ) : null}
              {/* Mid-drag (the axes held) the handle stays mounted past them, kept on the picture. */}
              {unitPoint && spec.unitRate && (inView(sx(1), sy(unitPoint.k)) || axes.frozen) ? (
                <DragHandle
                  testID={`drag-${spec.unitRate}`}
                  x={sx(1)}
                  y={sy(unitPoint.k)}
                  label={rep.variable(spec.unitRate).name}
                  onStart={() => {
                    start.current = unitPoint.k;
                    axes.freeze();
                  }}
                  onEnd={axes.release}
                  onMove={(_, dy) =>
                    calc.set(
                      {
                        ...rep.pin([spec.x.var, ...spec.params.filter((p) => p !== spec.unitRate)]),
                        [spec.unitRate!]: rep.snapTo(
                          spec.unitRate!,
                          ((start.current - dy / yScale) * fy) / fx,
                        ),
                      },
                      rep.slide(spec.unitRate!),
                    )
                  }
                />
              ) : null}
            </>
          );
        }}
      </Canvas>
      <Caption>
        {[
          ...(unitPoint
            ? [
                `${ys} = ${formatNumber(unitPoint.k)}${xs}`,
                `The line goes through (0, 0) and (1, ${formatNumber(unitPoint.k)}).`,
              ]
            : []),
          ...[
            spec.x.var,
            spec.y.var,
            ...(spec.tangentSlope ? [spec.tangentSlope] : []),
            ...spec.params,
          ].map((id) => rep.named(id)),
        ].join('   ·   ')}
      </Caption>
      {!paramsKnown ? (
        <Text style={[styles.caption, { color: c.textMuted }]}>
          {`Enter ${spec.params.map((id) => (rep.words ? rep.variable(id).name.toLowerCase() : rep.variable(id).symbol)).join(' and ')} to draw the graph.`}
        </Text>
      ) : null}
    </>
  );
}

/** A small table drawn in the chart: a header row, then rows; the current row outlined. */
function ValueColumns({
  x0,
  x1,
  y0,
  y1,
  heads,
  rows,
}: {
  x0: number;
  x1: number;
  y0: number;
  y1: number;
  heads: string[];
  rows: { cells: string[]; current: boolean }[];
}) {
  const c = usePalette();
  const cw = (x1 - x0) / heads.length;
  const rh = Math.min(30, (y1 - y0) / (rows.length + 1));
  const size = cw < 40 ? chart.tiny : chart.small;
  const rowY = (i: number) => y0 + rh * i;
  return (
    <G>
      <Rect x={x0} y={y0} width={x1 - x0} height={rh} fill={c.chartSurface} />
      {rows.map((r, i) =>
        r.current ? (
          <Rect
            key={`hl${i}`}
            x={x0}
            y={rowY(i + 1)}
            width={x1 - x0}
            height={rh}
            fill={c.chartHighlight}
            fillOpacity={0.14}
          />
        ) : null,
      )}
      {Array.from({ length: rows.length + 2 }, (_, i) => (
        <Line key={`h${i}`} x1={x0} y1={rowY(i)} x2={x1} y2={rowY(i)} stroke={c.chartGrid} />
      ))}
      {Array.from({ length: heads.length + 1 }, (_, i) => (
        <Line
          key={`v${i}`}
          x1={x0 + cw * i}
          y1={y0}
          x2={x0 + cw * i}
          y2={rowY(rows.length + 1)}
          stroke={c.chartGrid}
        />
      ))}
      {heads.map((t, j) => (
        <ChartText
          key={`t${j}`}
          x={x0 + cw * (j + 0.5)}
          y={y0 + rh / 2 + 4}
          fontSize={size}
          fontWeight="700"
          textAnchor="middle"
        >
          {t}
        </ChartText>
      ))}
      {rows.map((r, i) =>
        r.cells.map((t, j) => (
          <ChartText
            key={`c${i}-${j}`}
            x={x0 + cw * (j + 0.5)}
            y={rowY(i + 1) + rh / 2 + 4}
            fontSize={size}
            fontWeight={r.current || j === 2 ? '700' : '400'}
            fill={j === 2 ? c.chartHighlight : t === '?' ? c.chartMuted : c.chartInk}
            textAnchor="middle"
          >
            {t}
          </ChartText>
        )),
      )}
      {rows.map((r, i) =>
        r.current ? (
          <Rect
            key={`o${i}`}
            x={x0}
            y={rowY(i + 1)}
            width={x1 - x0}
            height={rh}
            fill="none"
            stroke={c.chartHighlight}
            strokeWidth={chart.stroke}
          />
        ) : null,
      )}
    </G>
  );
}

const styles = StyleSheet.create({
  caption: {
    fontSize: font.body,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: space.sm,
    paddingHorizontal: space.lg,
  },
});

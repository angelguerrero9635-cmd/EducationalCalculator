import { useRef } from 'react';
import { View } from 'react-native';
import Svg, { Circle, ClipPath, Defs, Ellipse, G, Line, Rect } from 'react-native-svg';

import type { Representation } from '@/data/modules';
import { formatNumber } from '@/engine/format';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, Caption, ChartText, DragHandle, fitLabel, niceCeil, useRep } from './common';
import { near } from './DistanceLegs';
import { usePaintIds } from './paint';
import { niceStep } from './Plot';
import { correlation, leastSquares, squaredResiduals, strength, twoPlaces } from './stats';

type Spec = Extract<Representation, { kind: 'scatter' }>;
type Axis = Spec['x'];

const ticks = (a: Axis) => {
  const step = a.step ?? niceStep(a.max - a.min);
  const out: number[] = [];
  for (let t = Math.ceil(a.min / step - 1e-9) * step; t <= a.max + 1e-9; t += step)
    out.push(Number(t.toFixed(10)));
  return out;
};

/** "y = 2.5x + 2", "y = −0.5x − 3", "y = 4" (slope 0). */
export function lineText(y: string, x: string, m: number, b: number) {
  const slope = m === 0 ? '' : `${m === 1 ? '' : m === -1 ? '−' : formatNumber(m)}${x}`;
  const icpt =
    b === 0 && slope
      ? ''
      : slope
        ? ` ${b < 0 ? '−' : '+'} ${formatNumber(Math.abs(b))}`
        : formatNumber(b);
  return `${y} = ${slope}${icpt}`;
}

/**
 * A scatter plot of the points (x, y) in the spec, with a line of fit y = mx + b drawn from
 * two values and dragged by a handle near each end. Clusters are ringed and named, an outlier
 * ringed; the caption counts the points above and below the line. With `at`, an input is read
 * up to the line and across to its prediction.
 */
export function Scatter({ spec, calc }: { spec: Spec; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  const ids = usePaintIds('clip');
  const start = useRef({ ya: 0, yb: 0 });
  // Grades 9–12: a least-squares line may be given as numbers (from a calculator).
  const read = (v: string | number) => (typeof v === 'number' ? v : rep.shown(v));
  const known = [spec.slope, spec.intercept].every((v) => typeof v === 'number' || rep.known(v));
  const m = read(spec.slope);
  const b = read(spec.intercept);
  const slopeId = typeof spec.slope === 'string' ? spec.slope : undefined;
  const interceptId = typeof spec.intercept === 'string' ? spec.intercept : undefined;
  const X = spec.x;
  const Y = spec.y;
  // The handles sit a fifth of the way in from each end of the x-axis.
  const xa = X.min + (X.max - X.min) * 0.2;
  const xb = X.max - (X.max - X.min) * 0.2;
  const fit = (x: number) => m * x + b;
  const gap = (Y.max - Y.min) * 1e-3;
  const above = spec.points.filter(([x, y]) => y - fit(x) > gap).length;
  const below = spec.points.filter(([x, y]) => fit(x) - y > gap).length;
  const on = spec.points.length - above - below;
  const xs = spec.at ? rep.variable(spec.at.x).symbol : 'x';
  const ys = spec.at ? rep.variable(spec.at.y).symbol : 'y';
  const atKnown = !!spec.at && known && rep.known(spec.at.x);
  const ax = spec.at ? rep.shown(spec.at.x) : 0;
  const outlier = spec.outlier === undefined ? undefined : spec.points[spec.outlier];
  // Grades 9–12: residuals, r and the least-squares line.
  const plot = spec.residuals === 'plot';
  const ls = spec.leastSquares ? leastSquares(spec.points) : undefined;
  const fixedFit = spec.leastSquares === 'fit';
  const res = spec.points.map(([x, y]) => y - fit(x));
  const approx = (x: number) => {
    const t = twoPlaces(x);
    return `${t.exact ? '=' : '≈'} ${formatNumber(t.value)}`;
  };
  const eqApprox = (m0: number, b0: number) => {
    const [tm, tb] = [twoPlaces(m0), twoPlaces(b0)];
    const text = lineText(ys, xs, tm.value, tb.value);
    return tm.exact && tb.exact ? text : text.replace(' = ', ' ≈ ');
  };
  // H105: the point may be a value (k, counted from 1); "?" picks none.
  const pick = spec.residualOf?.point;
  const oneAt =
    typeof pick === 'string' ? (rep.known(pick) ? Math.round(rep.shown(pick)) - 1 : -1) : pick;
  const one = oneAt !== undefined ? spec.points[oneAt] : undefined;
  const oneRes = one ? one[1] - fit(one[0]) : 0;
  const rOwn = spec.r === true ? correlation(spec.points) : undefined;
  const rId = typeof spec.r === 'string' ? spec.r : undefined;
  const rKnown = rOwn !== undefined || (!!rId && rep.known(rId));
  const extra = !known
    ? []
    : [
        ...(spec.r
          ? [
              rKnown
                ? `r ${rOwn !== undefined ? approx(rOwn) : `= ${rep.value(rId!, false)}`}: a ${strength(rOwn ?? rep.shown(rId!))} correlation`
                : 'r = ?',
            ]
          : []),
        ...(spec.residuals
          ? [
              `Residual = actual − predicted: ${res.filter((d) => d > gap).length} positive (above the line), ${res.filter((d) => d < -gap).length} negative`,
              `Sum of squared residuals ${approx(squaredResiduals(spec.points, m, b))}`,
            ]
          : []),
        ...(one
          ? [
              `Point ${typeof pick === 'string' ? `${oneAt! + 1} ` : ''}(${formatNumber(one[0])}, ${formatNumber(one[1])}): predicted ${near(fit(one[0]))}, residual ${formatNumber(one[1])} − ${near(fit(one[0]))} ${approx(oneRes)}`,
            ]
          : []),
        ...(ls && spec.leastSquares === 'beside'
          ? [
              `Least-squares line (dashed): ${eqApprox(ls.m, ls.b)}, sum of squared residuals ${approx(squaredResiduals(spec.points, ls.m, ls.b))}, the least any line gives`,
            ]
          : []),
        ...(ls && fixedFit
          ? ['The least-squares line makes the sum of the squared residuals as small as it can be']
          : []),
        ...(plot
          ? ['Residual plot: no pattern around 0 means a line fits; a curve means it does not']
          : []),
      ];
  /** The residual plot: each residual against x about a line at 0, under the scatter plot. */
  const residualPlot = (
    top: number,
    bottom: number,
    sx: (x: number) => number,
    left: number,
    right: number,
  ) => {
    const T2 = top + 20;
    const B2 = bottom - 22;
    const big = niceCeil(Math.max(1e-9, ...res.map(Math.abs)) * 1.1);
    const ry = (d: number) => (T2 + B2) / 2 - (d / big) * ((B2 - T2) / 2);
    return (
      <G opacity={known ? 1 : 0.35}>
        <ChartText x={4} y={top + 10} fontSize={chart.small} fontWeight="600">
          Residual
        </ChartText>
        {ticks(X).map((t) => (
          <G key={`rx${t}`}>
            <Line x1={sx(t)} y1={T2} x2={sx(t)} y2={B2} stroke={c.chartGrid} strokeWidth={1} />
            <ChartText
              x={sx(t)}
              y={B2 + 14}
              fontSize={chart.tiny}
              fill={c.chartMuted}
              textAnchor="middle"
            >
              {formatNumber(t)}
            </ChartText>
          </G>
        ))}
        {[big, 0, -big].map((d) => (
          <G key={`ry${d}`}>
            <Line
              x1={left}
              y1={ry(d)}
              x2={right}
              y2={ry(d)}
              stroke={d === 0 ? c.chartInk : c.chartGrid}
              strokeWidth={d === 0 ? chart.strokeLight : 1}
            />
            <ChartText
              x={left - 6}
              y={ry(d) + 3}
              fontSize={chart.tiny}
              fill={c.chartMuted}
              textAnchor="end"
            >
              {formatNumber(d)}
            </ChartText>
          </G>
        ))}
        <Line
          x1={left}
          y1={T2}
          x2={left}
          y2={B2}
          stroke={c.chartInk}
          strokeWidth={chart.strokeLight}
        />
        {spec.points.map(([x], i) => (
          <G key={`rp${i}`}>
            <Line
              x1={sx(x)}
              y1={ry(0)}
              x2={sx(x)}
              y2={ry(res[i]!)}
              stroke={c.chartSecond}
              strokeWidth={chart.stroke}
            />
            <Circle cx={sx(x)} cy={ry(res[i]!)} r={4} fill={c.chartInk} fillOpacity={0.85} />
          </G>
        ))}
      </G>
    );
  };
  const caption = [
    known
      ? `${fixedFit ? 'Least-squares line' : 'Line of fit'}: ${lineText(ys, xs, m, b)}`
      : 'Type the slope and intercept to draw the line of fit.',
    // (With residuals, their line says the same.)
    ...(known && !spec.residuals
      ? [
          `${above} ${above === 1 ? 'point' : 'points'} above the line, ${below} below${on ? `, ${on} on it` : ''}.`,
        ]
      : []),
    ...(atKnown
      ? [
          `Prediction for ${xs} of ${formatNumber(ax)}: ${ys} = ${formatNumber(m)} × ${formatNumber(ax)} ${b < 0 ? '−' : '+'} ${formatNumber(Math.abs(b))} = ${near(fit(ax))}`,
        ]
      : []),
    ...(outlier
      ? [
          `The outlier (${formatNumber(outlier[0])}, ${formatNumber(outlier[1])}) sits far from the rest.`,
        ]
      : []),
    ...extra,
  ].join(' · ');

  return (
    <View>
      <Canvas aspect={plot ? 1.04 : 0.8}>
        {({ w, h }) => {
          // The scatter plot's height (a residual plot, when there is one, goes under it).
          const H1 = plot ? w * 0.68 : h;
          const L = 42;
          const R = 14;
          const T = 26;
          const B = 36;
          const xScale = (w - L - R) / (X.max - X.min);
          const yScale = (H1 - T - B) / (Y.max - Y.min);
          const sx = (x: number) => L + (x - X.min) * xScale;
          const sy = (y: number) => H1 - B - (y - Y.min) * yScale;
          const clampY = (py: number) => Math.min(H1 - B, Math.max(T, py));
          const pts = spec.points.map(([x, y]) => [sx(x), sy(y)] as const);
          const op = known ? 1 : 0.35;
          // The residual's label goes left of its segment when a point sits in the way.
          const oneLeft =
            !!one &&
            pts.some(
              ([px, py]) =>
                px > sx(one[0]) + 4 &&
                px < sx(one[0]) + 84 &&
                Math.abs(py - (sy(one[1]) + sy(fit(one[0]))) / 2) < 14,
            );
          // Clusters: a dashed ring around each group (under the dots), its name above it (over
          // the line), or under it when there is no room above.
          const rings = (spec.clusters ?? []).map((cl) => {
            const own = cl.points.map((i) => pts[i]).filter((p) => !!p);
            if (!own.length) return null;
            const x0 = Math.min(...own.map((p) => p[0]));
            const x1 = Math.max(...own.map((p) => p[0]));
            const y0 = Math.min(...own.map((p) => p[1]));
            const y1 = Math.max(...own.map((p) => p[1]));
            const rx = ((x1 - x0) / 2 + 14) * 1.1;
            const ry = ((y1 - y0) / 2 + 14) * 1.1;
            const cx = (x0 + x1) / 2;
            const cy = (y0 + y1) / 2;
            const ly = cy - ry - 6 > T + 8 ? cy - ry - 6 : cy + ry + 14;
            const at = fitLabel(cx, cl.label, chart.small, w);
            const tw = cl.label.length * chart.small * 0.58;
            return {
              ring: (
                <Ellipse
                  key={`r${cl.label}`}
                  cx={cx}
                  cy={cy}
                  rx={rx}
                  ry={ry}
                  fill={c.chartHighlight}
                  fillOpacity={0.06}
                  stroke={c.chartMuted}
                  strokeWidth={chart.strokeLight}
                  strokeDasharray={chart.dash}
                />
              ),
              name: (
                <G key={`n${cl.label}`}>
                  <Rect
                    x={at.x - tw / 2 - 3}
                    y={ly - 10}
                    width={tw + 6}
                    height={14}
                    rx={3}
                    fill={c.background}
                    opacity={0.85}
                  />
                  <ChartText
                    {...at}
                    y={ly}
                    fontSize={chart.small}
                    fontWeight="700"
                    fill={c.chartMuted}
                  >
                    {cl.label}
                  </ChartText>
                </G>
              ),
            };
          });
          return (
            <>
              <Svg width={w} height={h}>
                <Defs>
                  <ClipPath id={ids.clip}>
                    <Rect x={L} y={T} width={w - L - R} height={H1 - T - B} />
                  </ClipPath>
                </Defs>
                {ticks(X).map((t) => (
                  <G key={`x${t}`}>
                    <Line
                      x1={sx(t)}
                      y1={T}
                      x2={sx(t)}
                      y2={H1 - B}
                      stroke={c.chartGrid}
                      strokeWidth={1}
                    />
                    <ChartText
                      x={sx(t)}
                      y={H1 - B + 14}
                      fontSize={chart.tiny}
                      fill={c.chartMuted}
                      textAnchor="middle"
                    >
                      {formatNumber(t)}
                    </ChartText>
                  </G>
                ))}
                {ticks(Y).map((t) => (
                  <G key={`y${t}`}>
                    <Line
                      x1={L}
                      y1={sy(t)}
                      x2={w - R}
                      y2={sy(t)}
                      stroke={c.chartGrid}
                      strokeWidth={1}
                    />
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
                <Line
                  x1={L}
                  y1={H1 - B}
                  x2={w - R}
                  y2={H1 - B}
                  stroke={c.chartInk}
                  strokeWidth={chart.strokeLight}
                />
                <Line
                  x1={L}
                  y1={T}
                  x2={L}
                  y2={H1 - B}
                  stroke={c.chartInk}
                  strokeWidth={chart.strokeLight}
                />
                <ChartText
                  {...fitLabel(w - R, X.label, chart.small, w, 'end')}
                  y={H1 - 4}
                  fontSize={chart.small}
                  fontWeight="600"
                >
                  {X.label}
                </ChartText>
                <ChartText
                  {...fitLabel(4, Y.label, chart.small, w, 'start')}
                  y={13}
                  fontSize={chart.small}
                  fontWeight="600"
                >
                  {Y.label}
                </ChartText>
                {rings.map((r) => r?.ring)}
                <G clipPath={`url(#${ids.clip})`}>
                  {/* The prediction: up from the input to the line, across to the output. */}
                  {atKnown ? (
                    <G>
                      <Line
                        x1={sx(ax)}
                        y1={H1 - B}
                        x2={sx(ax)}
                        y2={sy(fit(ax))}
                        stroke={c.chartSecond}
                        strokeWidth={chart.stroke}
                        strokeDasharray={chart.dash}
                      />
                      <Line
                        x1={sx(ax)}
                        y1={sy(fit(ax))}
                        x2={L}
                        y2={sy(fit(ax))}
                        stroke={c.chartSecond}
                        strokeWidth={chart.stroke}
                        strokeDasharray={chart.dash}
                      />
                    </G>
                  ) : null}
                  {known && (spec.residuals || one)
                    ? spec.points.map(([x, y], i) =>
                        spec.residuals || i === oneAt ? (
                          <Line
                            key={`res${i}`}
                            x1={sx(x)}
                            y1={sy(y)}
                            x2={sx(x)}
                            y2={sy(fit(x))}
                            stroke={c.chartSecond}
                            strokeWidth={i === oneAt ? chart.strokeHeavy : chart.stroke}
                          />
                        ) : null,
                      )
                    : null}
                  {ls && spec.leastSquares === 'beside' ? (
                    <Line
                      x1={sx(X.min)}
                      y1={sy(ls.m * X.min + ls.b)}
                      x2={sx(X.max)}
                      y2={sy(ls.m * X.max + ls.b)}
                      stroke={c.lineSum}
                      strokeWidth={chart.stroke}
                      strokeDasharray={chart.dash}
                    />
                  ) : null}
                  <Line
                    x1={sx(X.min)}
                    y1={sy(fit(X.min))}
                    x2={sx(X.max)}
                    y2={sy(fit(X.max))}
                    stroke={c.chartHighlight}
                    strokeWidth={chart.strokeHeavy}
                    opacity={op}
                  />
                  {pts.map(([px, py], i) => (
                    <Circle key={i} cx={px} cy={py} r={4.5} fill={c.chartInk} fillOpacity={0.85} />
                  ))}
                  {atKnown ? (
                    <Circle
                      cx={sx(ax)}
                      cy={sy(fit(ax))}
                      r={5.5}
                      fill={c.card}
                      stroke={c.chartSecond}
                      strokeWidth={chart.strokeHeavy}
                    />
                  ) : null}
                </G>
                {rings.map((r) => r?.name)}
                {atKnown ? (
                  <ChartText
                    {...fitLabel(
                      sx(ax) + 8,
                      `(${formatNumber(ax)}, ${near(fit(ax))})`,
                      chart.small,
                      w,
                      'start',
                      8,
                    )}
                    y={clampY(sy(fit(ax))) + (m >= 0 ? 16 : -10)}
                    fontSize={chart.small}
                    fontWeight="700"
                  >
                    {`(${formatNumber(ax)}, ${near(fit(ax))})`}
                  </ChartText>
                ) : null}
                {outlier ? (
                  <G>
                    <Circle
                      cx={sx(outlier[0])}
                      cy={sy(outlier[1])}
                      r={10}
                      fill="none"
                      stroke={c.chartSecond}
                      strokeWidth={chart.stroke}
                    />
                    <ChartText
                      {...fitLabel(sx(outlier[0]) + 14, 'outlier', chart.small, w, 'start', 14)}
                      y={sy(outlier[1]) + 4}
                      fontSize={chart.small}
                      fontWeight="700"
                    >
                      outlier
                    </ChartText>
                  </G>
                ) : null}
                {one && known ? (
                  <ChartText
                    {...fitLabel(
                      sx(one[0]) + (oneLeft ? -8 : 8),
                      `residual ${near(oneRes)}`,
                      chart.label,
                      w,
                      oneLeft ? 'end' : 'start',
                      8,
                    )}
                    y={clampY((sy(one[1]) + sy(fit(one[0]))) / 2) + 4}
                    fontSize={chart.label}
                    fontWeight="700"
                    fill={c.chartInk}
                  >
                    {`residual ${near(oneRes)}`}
                  </ChartText>
                ) : null}
                {plot ? residualPlot(H1 + 8, h, sx, L, w - R) : null}
              </Svg>
              {known && !fixedFit && slopeId && interceptId
                ? (
                    [
                      ['drag-line-left', xa, 'ya'],
                      ['drag-line-right', xb, 'yb'],
                    ] as const
                  ).map(([testID, hx, end]) => (
                    <DragHandle
                      key={testID}
                      testID={testID}
                      x={sx(hx)}
                      y={clampY(sy(fit(hx)))}
                      label="the line of fit"
                      onStart={() => {
                        start.current = { ya: fit(xa), yb: fit(xb) };
                      }}
                      onMove={(_, dy) => {
                        // Move this end of the line; the other end stays where it was.
                        const ends = { ...start.current, [end]: start.current[end] - dy / yScale };
                        const slope = (ends.yb - ends.ya) / (xb - xa);
                        const icpt = ends.ya - slope * xa;
                        calc.set(
                          {
                            ...rep.pin(spec.at ? [spec.at.x] : []),
                            [slopeId]: rep.snapTo(slopeId, slope * rep.factor(slopeId)),
                            [interceptId]: rep.snapTo(interceptId, icpt * rep.factor(interceptId)),
                          },
                          rep.slide(slopeId),
                        );
                      }}
                    />
                  ))
                : null}
            </>
          );
        }}
      </Canvas>
      <Caption>{caption}</Caption>
    </View>
  );
}

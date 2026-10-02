/**
 * The x–y diagram of `phaseEnvelope` (HC8; ACC-P30): the vapor's y against the liquid's x, both
 * to one scale. Distillation: the equilibrium curve of constant α, the 45° line, x_B, x_F and
 * x_D on it, the rectifying line, the q-line, the stripping line and the McCabe–Thiele stairs
 * (or the stairs at total reflux), R_min dashed to its pinch. A dilute absorber: the straight
 * equilibrium line y = mx, the operating line from the top, its stairs and (L ÷ G)min dashed.
 */
import { View } from 'react-native';
import Svg, { Circle, G, Line, Path } from 'react-native-svg';

import type { PhaseEnvelopeSpec } from '@/data/modules/typesHe1i';
import { chart, usePalette, type Palette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, Caption, ChartText, niceCeil } from './common';
import { Frame, KeyItem, poly, sig, ticks, useReadSpec } from './phaseEnvelopeKit';
import {
  absorberStairs,
  distillationStairs,
  feedPoint,
  qPinch,
  rectifying,
  yEq,
  type Equilibrium,
  type Stair,
  type Staircase,
} from './phaseEnvelopeMath';

type XySpec = Extract<PhaseEnvelopeSpec, { mode: 'xy' }>;
type Pt = [number, number];

/** The stairs as a path: across to the curve, then down (or up) to the operating line. */
const stairPath = (stairs: Stair[], sx: (x: number) => number, sy: (y: number) => number) =>
  stairs
    .map((s) => `M ${sx(s.x0)} ${sy(s.y)} L ${sx(s.x1)} ${sy(s.y)} L ${sx(s.x1)} ${sy(s.y1)}`)
    .join(' ');

/** Stage numbers at each stair's corner on the curve, where the stair is wide enough. */
function StageNumbers({
  c,
  stairs,
  sx,
  sy,
  feed,
  above,
}: {
  c: Palette;
  stairs: Stair[];
  sx: (x: number) => number;
  sy: (y: number) => number;
  feed?: number;
  above: boolean;
}) {
  return (
    <G>
      {stairs.map((s, i) => {
        const wide = Math.abs(sx(s.x0) - sx(s.x1)) >= 13 || i === stairs.length - 1;
        const isFeed = feed === i + 1;
        if (!wide && !isFeed) return null;
        return (
          <G key={i}>
            {isFeed ? (
              <Circle
                cx={sx(s.x1)}
                cy={sy(s.y)}
                r={6}
                fill="none"
                stroke={c.lineUpright}
                strokeWidth={2}
              />
            ) : null}
            <ChartText
              x={sx(s.x1) + (above ? -4 : 4)}
              y={sy(s.y) + (above ? -7 : 14)}
              textAnchor={above ? 'end' : 'start'}
              fontSize={chart.label}
              fontWeight="700"
              fill={isFeed ? c.lineUpright : c.chartInk}
              halo
            >
              {isFeed ? `${i + 1} feed` : `${i + 1}`}
            </ChartText>
          </G>
        );
      })}
    </G>
  );
}

export function PhaseEnvelopeXy({ spec, calc }: { spec: XySpec; calc: Calculator }) {
  return spec.absorber ? (
    <Absorber spec={spec} calc={calc} />
  ) : (
    <Distillation spec={spec} calc={calc} />
  );
}

function Distillation({ spec, calc }: { spec: XySpec; calc: Calculator }) {
  const c = usePalette();
  const { read } = useReadSpec(calc);
  const [n1] = spec.names ?? ['A', 'B'];
  const al = read(spec.alpha);
  const [xD, xB, xF, R, Rm] = [
    read(spec.xD),
    read(spec.xB),
    read(spec.xF),
    read(spec.R),
    read(spec.Rmin),
  ];
  const q = spec.q === undefined ? { known: true, value: 1, text: '1' } : read(spec.q);
  const N = read(spec.minStages, 3);
  const slopeV = read(spec.slope, 3);
  const interV = read(spec.intercept, 3);
  const frac = (v: { known: boolean; value: number }) => v.known && v.value > 0 && v.value < 1;
  const e: Equilibrium | undefined = al.known && al.value > 1 ? { alpha: al.value } : undefined;
  const top = frac(xD) && R.known && R.value >= 0 ? rectifying(R.value, xD.value) : undefined;
  const fp =
    top && frac(xF) && q.known && xF.value < xD.value
      ? feedPoint(R.value, xD.value, xF.value, q.value)
      : undefined;
  const pinch = e && frac(xF) && q.known ? qPinch(e.alpha, xF.value, q.value) : undefined;
  const ordered = frac(xD) && frac(xB) && xB.value < xD.value;
  // The staircase: total reflux, or McCabe–Thiele once every value is in.
  let stairs: Staircase | undefined;
  if (e && ordered && spec.steps === 'total')
    stairs = distillationStairs(e.alpha, xD.value, xB.value);
  if (e && ordered && spec.steps === 'stages' && fp && frac(xF) && xF.value > xB.value)
    stairs = distillationStairs(e.alpha, xD.value, xB.value, {
      R: R.value,
      xF: xF.value,
      q: q.value,
    });
  const pinched = !!stairs?.pinched;
  const minPinchOk = !!(pinch && frac(xD) && pinch[0] < xD.value);

  const art = (w: number, h: number) => {
    const l = 48;
    const t = 58;
    const side = Math.min(w - l - 14, h - t - 42);
    const [r, b] = [l + side, t + side];
    const sx = (x: number) => l + x * side;
    const sy = (y: number) => b - y * side;
    const curve: Pt[] = e ? Array.from({ length: 61 }, (_, k): Pt => [k / 60, yEq(e, k / 60)]) : [];
    const mark = (
      v: { value: number },
      name: string,
      dx: number,
      dy: number,
      anchor: 'start' | 'end',
    ) => (
      <G key={name}>
        <Line
          x1={sx(v.value)}
          y1={sy(v.value)}
          x2={sx(v.value)}
          y2={b}
          stroke={c.chartMuted}
          strokeDasharray={chart.dashFine}
        />
        <Circle cx={sx(v.value)} cy={sy(v.value)} r={4} fill={c.chartInk} />
        <ChartText
          x={anchor === 'start' ? Math.min(sx(v.value) + dx, w - 26) : sx(v.value) + dx}
          y={sy(v.value) + dy}
          textAnchor={anchor}
          fontSize={chart.value}
          fontWeight="700"
          halo
        >
          {name}
        </ChartText>
      </G>
    );
    const ints = top && !fp && frac(xD);
    return (
      <Svg width={w} height={h}>
        <Frame
          c={c}
          l={l}
          r={r}
          t={t}
          b={b}
          xs={[0, 0.2, 0.4, 0.6, 0.8, 1]}
          ys={[0, 0.2, 0.4, 0.6, 0.8, 1]}
          sx={sx}
          sy={sy}
          xName={`x (liquid mole fraction of ${n1})`}
          yName="y (vapor)"
        />
        <Line x1={sx(0)} y1={sy(0)} x2={sx(1)} y2={sy(1)} stroke={c.chartMuted} strokeWidth={1.2} />
        {e ? (
          <Path
            d={poly(curve.map(([x, y]): Pt => [sx(x), sy(y)]))}
            stroke={c.chartHighlight}
            strokeWidth={chart.stroke}
            fill="none"
          />
        ) : null}
        {/* The q-line, from (x_F, x_F) up to the curve. */}
        {frac(xF) && q.known ? (
          <Line
            x1={sx(xF.value)}
            y1={sy(xF.value)}
            x2={sx(pinch ? pinch[0] : fp ? fp[0] : xF.value)}
            y2={sy(pinch ? pinch[1] : fp ? fp[1] : xF.value)}
            stroke={c.lineUpright}
            strokeWidth={chart.stroke}
          />
        ) : null}
        {/* R_min: the line from (x_D, x_D) that touches the curve on the q-line. */}
        {Rm.known && minPinchOk && pinch ? (
          <G>
            <Line
              x1={sx(xD.value)}
              y1={sy(xD.value)}
              x2={sx(pinch[0])}
              y2={sy(pinch[1])}
              stroke={c.lineSum}
              strokeWidth={chart.stroke}
              strokeDasharray={chart.dash}
            />
            <Circle
              cx={sx(pinch[0])}
              cy={sy(pinch[1])}
              r={6}
              fill="none"
              stroke={c.chartInk}
              strokeWidth={2}
            />
            <ChartText
              x={sx(pinch[0]) - 9}
              y={sy(pinch[1]) - 6}
              textAnchor="end"
              fontSize={chart.label}
              fontWeight="700"
              halo
            >
              pinch
            </ChartText>
          </G>
        ) : null}
        {/* The operating lines (faded when they cross above the curve). */}
        <G opacity={pinched ? 0.4 : 1}>
          {top && fp ? (
            <Line
              x1={sx(xD.value)}
              y1={sy(xD.value)}
              x2={sx(fp[0])}
              y2={sy(fp[1])}
              stroke={c.lineSum}
              strokeWidth={chart.stroke}
            />
          ) : null}
          {ints ? (
            <G>
              <Line
                x1={sx(xD.value)}
                y1={sy(xD.value)}
                x2={sx(0)}
                y2={sy(top.intercept)}
                stroke={c.lineSum}
                strokeWidth={chart.stroke}
              />
              <Circle cx={sx(0)} cy={sy(top.intercept)} r={4.5} fill={c.lineSum} />
              <ChartText
                x={sx(0) + 8}
                y={sy(top.intercept) + 18}
                fontSize={chart.value}
                fontWeight="700"
                fill={c.lineSum}
                halo
              >
                {`x_D ÷ (R + 1) = ${interV.known ? interV.text : sig(top.intercept)}`}
              </ChartText>
              <ChartText
                x={sx(xD.value * 0.5) - 6}
                y={sy(top.intercept + top.slope * xD.value * 0.5) - 10}
                textAnchor="end"
                fontSize={chart.value}
                fontWeight="700"
                fill={c.lineSum}
                halo
              >
                {`slope ${slopeV.known ? slopeV.text : sig(top.slope)}`}
              </ChartText>
            </G>
          ) : null}
          {fp && frac(xB) && spec.steps === 'stages' ? (
            <Line
              x1={sx(xB.value)}
              y1={sy(xB.value)}
              x2={sx(fp[0])}
              y2={sy(fp[1])}
              stroke={c.lineSum}
              strokeWidth={chart.stroke}
            />
          ) : null}
          {stairs && !pinched ? (
            <G>
              <Path
                d={stairPath(stairs.stairs, sx, sy)}
                stroke={c.chartInk}
                strokeWidth={1.4}
                fill="none"
              />
              <StageNumbers c={c} stairs={stairs.stairs} sx={sx} sy={sy} feed={stairs.feed} above />
            </G>
          ) : null}
        </G>
        {frac(xB) ? mark(xB, 'x_B', 8, 16, 'start') : null}
        {frac(xF) ? mark(xF, 'x_F', 8, 16, 'start') : null}
        {frac(xD) ? mark(xD, 'x_D', 6, 18, 'start') : null}
        <KeyItem
          x={8}
          y={16}
          color={c.chartHighlight}
          text={e ? `Equilibrium, α = ${al.text}` : 'Equilibrium'}
        />
        <KeyItem x={Math.max(180, w * 0.55)} y={16} color={c.lineSum} text="Operating" />
        {frac(xF) ? (
          <KeyItem x={Math.max(180, w * 0.55)} y={34} color={c.lineUpright} text="q-line" />
        ) : null}
        {Rm.known ? (
          <KeyItem x={8} y={34} color={c.lineSum} dash={chart.dash} text={`R_min = ${Rm.text}`} />
        ) : null}
      </Svg>
    );
  };

  const lines: string[] = [];
  if (!e && spec.alpha !== undefined)
    lines.push('Type α (more than 1) to draw the equilibrium curve.');
  else if (e)
    lines.push(
      `Equilibrium curve: y = αx ÷ (1 + (α − 1)x) with α = ${al.text}; the 45° line is y = x.`,
    );
  if (spec.steps === 'total' && stairs) {
    const n = stairs.stairs.length;
    lines.push(
      `At total reflux both operating lines are the 45° line: from x_D = ${xD.text} down to x_B = ${xB.text} the stairs take ${n}, the last one partial.`,
    );
    if (N.known)
      lines.push(
        `Fenske: N_min = ln[(x_D ÷ (1 − x_D))((1 − x_B) ÷ x_B)] ÷ ln α = ${N.text} stages, the reboiler counted, so ${n} whole stairs.`,
      );
  }
  if (top && (fp || spec.slope !== undefined))
    lines.push(
      `Rectifying line: y = (R ÷ (R + 1))x + x_D ÷ (R + 1) = ${sig(top.slope)}x + ${sig(top.intercept)}, through (x_D, x_D).`,
    );
  if (frac(xF) && q.known && fp)
    lines.push(
      Math.abs(q.value - 1) < 1e-9
        ? `q = 1 (saturated liquid feed): the q-line rises straight up from x_F = ${xF.text}.`
        : `q-line: y = (q ÷ (q − 1))x − x_F ÷ (q − 1), q = ${q.text}, from (x_F, x_F); the operating lines cross on it.`,
    );
  if (Rm.known && pinch)
    lines.push(
      `At R_min = ${Rm.text} the rectifying line touches the curve where the q-line meets it (the pinch): stairs never get past it.${R.known ? ` R = ${R.text} clears it.` : ''}`,
    );
  if (spec.steps === 'stages' && stairs)
    lines.push(
      pinched
        ? `R = ${R.text} is too small: the operating lines cross above the equilibrium curve, so no number of stages reaches x_B.`
        : `McCabe–Thiele from the top: ${stairs.stairs.length} stages (the last one partial, the reboiler counted), the feed on stage ${stairs.feed ?? '?'}.`,
    );
  if (!lines.length) lines.push('Type the values to draw the diagram.');

  return (
    <View>
      <Canvas aspect={(w) => Math.min(1.12, (w - 48 - 14 + 58 + 42) / w)}>
        {({ w, h }) => art(w, h)}
      </Canvas>
      <Caption>{lines.join(' · ')}</Caption>
    </View>
  );
}

function Absorber({ spec, calc }: { spec: XySpec; calc: Calculator }) {
  const c = usePalette();
  const { read } = useReadSpec(calc);
  const a = spec.absorber!;
  const [yIn, yOut, xIn, m] = [read(a.yIn), read(a.yOut), read(a.xIn), read(spec.m)];
  const A = read(a.A, 3);
  const LGv = read(a.LG, 3);
  const LGmin = read(a.LGmin, 3);
  const N = read(a.N, 3);
  const base = yIn.known && yOut.known && xIn.known && m.known && m.value > 0;
  const LG = LGv.known ? LGv.value : A.known && m.known ? A.value * m.value : undefined;
  const ok = base && yIn.value > yOut.value && yOut.value > m.value * xIn.value && xIn.value >= 0;
  const xOut = ok && LG ? xIn.value + (yIn.value - yOut.value) / LG : undefined;
  const pinchX = ok ? yIn.value / m.value : undefined;
  const stairs =
    ok && LG ? absorberStairs(m.value, LG, yIn.value, yOut.value, xIn.value) : undefined;
  const xMax = niceCeil(1.12 * Math.max(xOut ?? 0, pinchX ?? 0, ok ? yIn.value / m.value : 0.01));
  const yMax = niceCeil(1.12 * (ok ? yIn.value : 0.01));

  const art = (w: number, h: number) => {
    const l = 56;
    const t = 58;
    const r = w - 16;
    const b = h - 42;
    const sx = (x: number) => l + (x / xMax) * (r - l);
    const sy = (y: number) => b - (y / yMax) * (b - t);
    const xs = ticks(0, xMax, 4).out.filter((v) => v <= xMax);
    const ys = ticks(0, yMax, 5).out.filter((v) => v <= yMax);
    return (
      <Svg width={w} height={h}>
        <Frame
          c={c}
          l={l}
          r={r}
          t={t}
          b={b}
          xs={xs}
          ys={ys}
          sx={sx}
          sy={sy}
          xName="x (solute in the liquid)"
          yName="y (solute in the gas)"
        />
        {m.known && m.value > 0 ? (
          <Line
            x1={sx(0)}
            y1={sy(0)}
            x2={sx(Math.min(xMax, yMax / m.value))}
            y2={sy(Math.min(yMax, m.value * xMax))}
            stroke={c.chartHighlight}
            strokeWidth={chart.stroke}
          />
        ) : null}
        {ok && LGmin.known && pinchX !== undefined ? (
          <G>
            <Line
              x1={sx(xIn.value)}
              y1={sy(yOut.value)}
              x2={sx(pinchX)}
              y2={sy(yIn.value)}
              stroke={c.lineSum}
              strokeWidth={chart.stroke}
              strokeDasharray={chart.dash}
            />
            <Circle
              cx={sx(pinchX)}
              cy={sy(yIn.value)}
              r={6}
              fill="none"
              stroke={c.chartInk}
              strokeWidth={2}
            />
            <ChartText
              x={sx(pinchX) - 9}
              y={sy(yIn.value) - 8}
              textAnchor="end"
              fontSize={chart.label}
              fontWeight="700"
              halo
            >
              pinch
            </ChartText>
          </G>
        ) : null}
        {ok && xOut !== undefined ? (
          <G opacity={stairs?.pinched ? 0.4 : 1}>
            <Line
              x1={sx(xIn.value)}
              y1={sy(yOut.value)}
              x2={sx(xOut)}
              y2={sy(yIn.value)}
              stroke={c.lineSum}
              strokeWidth={chart.stroke}
            />
            {stairs && !stairs.pinched ? (
              <G>
                <Path
                  d={stairPath(stairs.stairs, sx, sy)}
                  stroke={c.chartInk}
                  strokeWidth={1.4}
                  fill="none"
                />
                <StageNumbers c={c} stairs={stairs.stairs} sx={sx} sy={sy} above={false} />
              </G>
            ) : null}
            <Circle cx={sx(xOut)} cy={sy(yIn.value)} r={4.5} fill={c.lineSum} />
            <ChartText
              x={sx(xOut) - 8}
              y={sy(yIn.value) - 8}
              textAnchor="end"
              fontSize={chart.label}
              fontWeight="700"
              halo
            >
              bottom
            </ChartText>
          </G>
        ) : null}
        {ok ? (
          <G>
            <Circle cx={sx(xIn.value)} cy={sy(yOut.value)} r={4.5} fill={c.lineSum} />
            <ChartText
              x={sx(xIn.value) + 8}
              y={sy(yOut.value) - 8}
              fontSize={chart.label}
              fontWeight="700"
              halo
            >
              top
            </ChartText>
          </G>
        ) : null}
        <KeyItem
          x={8}
          y={16}
          color={c.chartHighlight}
          text={m.known ? `Equilibrium y = ${m.text}x` : 'Equilibrium'}
        />
        <KeyItem x={Math.max(180, w * 0.55)} y={16} color={c.lineSum} text="Operating" />
        {LGmin.known ? (
          <KeyItem
            x={Math.max(180, w * 0.55)}
            y={34}
            color={c.lineSum}
            dash={chart.dash}
            text="(L ÷ G)ₘᵢₙ"
          />
        ) : null}
      </Svg>
    );
  };

  const lines: string[] = [];
  if (!base) lines.push('Type y_in, y_out, x_in and m to draw the absorber.');
  else if (!ok)
    lines.push(
      yIn.value <= yOut.value
        ? 'y_out must be below y_in: the gas loses solute on its way up.'
        : 'The gas leaving must hold more solute than the entering liquid allows (y_out > mx_in), or no stages can reach it.',
    );
  else {
    lines.push(
      `Equilibrium is the straight line y = ${m.text}x (dilute, Henry’s law). The gas enters at the bottom with y_in = ${yIn.text} and leaves at the top with y_out = ${yOut.text}; the liquid enters at the top with x_in = ${xIn.text}.`,
    );
    if (LG !== undefined && xOut !== undefined)
      lines.push(
        `Operating line: slope L ÷ G = ${LGv.known ? LGv.text : `A × m = ${sig(LG)}`}, from the top (x_in, y_out) to the bottom, where the liquid leaves with x_out = ${sig(xOut)}.`,
      );
    if (stairs)
      lines.push(
        stairs.pinched
          ? 'L ÷ G is too small: the operating line meets the equilibrium line, so no number of stages reaches y_in.'
          : `From the top the stairs take ${stairs.stairs.length}, the last one partial${N.known ? `; Kremser gives N = ${N.text}` : ''}.`,
      );
    if (LGmin.known)
      lines.push(
        `(L ÷ G)ₘᵢₙ = (y_in − y_out) ÷ (y_in ÷ m − x_in) = ${LGmin.text}: the dashed line touches the equilibrium line where the gas enters (the pinch).`,
      );
  }

  return (
    <View>
      <Canvas aspect={(w) => Math.min(1.1, 350 / w)}>{({ w, h }) => art(w, h)}</Canvas>
      <Caption>{lines.join(' · ')}</Caption>
    </View>
  );
}

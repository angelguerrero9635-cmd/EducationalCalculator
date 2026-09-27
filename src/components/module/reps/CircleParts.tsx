import { useRef } from 'react';
import { View } from 'react-native';
import Svg, { Circle, G, Line, Path, Rect } from 'react-native-svg';

import type { Representation } from '@/data/modules';
import { formatNumber } from '@/engine/format';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, Caption, ChartText, DragHandle, fitLabel, useFrozen, useRep } from './common';
import { bracket } from './Tape';

type Spec = Extract<Representation, { kind: 'circle' }>;

const PAD = 14;

/** A value with its unit (the radius's unit, or its square for an area): "18.85 cm". */
function useLengths(spec: Spec, calc: Calculator) {
  const rep = useRep(calc);
  const unit = rep.unit(spec.radius);
  const r = rep.shown(spec.radius);
  const known = rep.known(spec.radius);
  const withUnit = (x: number, square = false) =>
    `${formatNumber(Number(x.toFixed(2)))}${unit ? ` ${unit}${square ? '²' : ''}` : ''}`;
  /** A value's own text when the module has it, else worked out from r. */
  const text = (id: string | undefined, x: number, square = false) =>
    id && rep.known(id) ? rep.value(id) : known ? withUnit(x, square) : '?';
  const sym = (id: string | undefined, fallback: string) =>
    id && !rep.words ? rep.variable(id).symbol : fallback;
  return { rep, r, known, text, sym };
}

/**
 * The circle rolled one full turn along a line: the line it covers is the circumference.
 * Under it, three diameters end to end and a little more (π diameters), and a bracket with
 * C = π × d. Drag the end of the line to change the circle.
 */
export function CircleUnroll({ spec, calc }: { spec: Spec; calc: Calculator }) {
  const c = usePalette();
  const { rep, r, known, text, sym } = useLengths(spec, calc);
  const start = useRef(0);
  // Drawn to fill the width at the current size (held while the end is dragged).
  const fit = useFrozen(Math.max(rep.shown(spec.radius), 1e-6));
  const d = 2 * r;
  const C = Math.PI * d;
  const dSym = sym(spec.diameter, 'd');
  const cSym = sym(spec.circumference, 'C');
  const D = text(spec.diameter, d);
  const Ct = text(spec.circumference, C);
  const lines = known
    ? [
        'One turn covers the circumference: π diameters, a little more than 3.',
        `${cSym} = π × ${dSym} = π × ${formatNumber(d)} ≈ ${Ct}`,
      ]
    : ['Type the radius or the diameter.'];

  return (
    <View>
      <Canvas aspect={(w) => heightFor(w) / w}>
        {({ w, h }) => {
          const { scale, lineY } = geometry(w);
          const Dp = d * scale;
          const x0 = PAD + (fit.value * 2 * scale) / 2;
          const x1 = x0 + Math.PI * Dp;
          const cy = lineY - Dp / 2;
          const barY = lineY + 10;
          const turns = Array.from({ length: 3 }, (_, i) => i);
          return (
            <>
              <Svg width={w} height={h} opacity={known ? 1 : 0.4}>
                <Line
                  x1={PAD}
                  y1={lineY}
                  x2={w - PAD}
                  y2={lineY}
                  stroke={c.chartGrid}
                  strokeWidth={chart.stroke}
                />
                {/* The circle at the start, and dashed where it ends after one turn. */}
                <Circle
                  cx={x0}
                  cy={cy}
                  r={Dp / 2}
                  fill={c.chartFill}
                  stroke={c.chartInk}
                  strokeWidth={chart.stroke}
                />
                <Line
                  x1={x0 - Dp / 2}
                  y1={cy}
                  x2={x0 + Dp / 2}
                  y2={cy}
                  stroke={c.chartHighlight}
                  strokeWidth={chart.strokeHeavy}
                />
                <ChartText x={x0} y={cy - 6} textAnchor="middle" fontSize={chart.small}>
                  {dSym}
                </ChartText>
                <Circle
                  cx={x1}
                  cy={cy}
                  r={Dp / 2}
                  fill="none"
                  stroke={c.chartMuted}
                  strokeWidth={chart.strokeLight}
                  strokeDasharray={chart.dash}
                />
                {/* The point that touched the line at the start, back at the bottom. */}
                <Circle cx={x0} cy={lineY} r={4} fill={c.chartInk} />
                <Circle cx={x1} cy={lineY} r={4} fill={c.chartInk} />
                {/* The rolling: an arrow over the top. */}
                <Path
                  d={`M ${x0 + Dp * 0.35} ${cy - Dp / 2 - 4} Q ${(x0 + x1) / 2} ${cy - Dp / 2 - 22} ${x1 - Dp * 0.35 - 6} ${cy - Dp / 2 - 6}`}
                  stroke={c.chartMuted}
                  strokeWidth={chart.strokeLight}
                  fill="none"
                />
                <Path
                  d={`M ${x1 - Dp * 0.35} ${cy - Dp / 2 - 3} l -9 -6 l 0 9 z`}
                  fill={c.chartMuted}
                />
                <ChartText
                  x={(x0 + x1) / 2}
                  y={cy - Dp / 2 - 18}
                  textAnchor="middle"
                  fontSize={chart.small}
                  fill={c.chartMuted}
                >
                  one turn
                </ChartText>
                {/* The circumference laid flat. */}
                <Line
                  x1={x0}
                  y1={lineY}
                  x2={x1}
                  y2={lineY}
                  stroke={c.chartInk}
                  strokeWidth={chart.strokeHeavy}
                />
                {/* Three diameters end to end, and the little more. */}
                {turns.map((i) => (
                  <G key={i}>
                    <Rect
                      x={x0 + i * Dp}
                      y={barY}
                      width={Dp}
                      height={16}
                      fill={i % 2 ? c.chartSecond : c.chartHighlight}
                      stroke={c.chartInk}
                      strokeWidth={1}
                    />
                    <ChartText
                      x={x0 + (i + 0.5) * Dp}
                      y={barY + 12}
                      textAnchor="middle"
                      fontSize={chart.small}
                      fontWeight="700"
                      fill={i % 2 ? c.coinInk : c.onChartHighlight}
                    >
                      {Dp > 60 ? `${dSym} = ${D}` : dSym}
                    </ChartText>
                  </G>
                ))}
                <Rect
                  x={x0 + 3 * Dp}
                  y={barY}
                  width={x1 - x0 - 3 * Dp}
                  height={16}
                  fill={c.chartSurface}
                  stroke={c.chartInk}
                  strokeWidth={1}
                />
                <Path d={bracket(x0, x1, barY + 26, 1)} stroke={c.chartInk} fill="none" />
                <ChartText
                  {...fitLabel((x0 + x1) / 2, `${cSym} = ${Ct}`, chart.value, w)}
                  y={barY + 48}
                  fontSize={chart.value}
                  fontWeight="700"
                >
                  {`${cSym} = ${Ct}`}
                </ChartText>
              </Svg>
              {known ? (
                <DragHandle
                  testID={`drag-${spec.radius}`}
                  x={x1}
                  y={lineY}
                  label={rep.variable(spec.radius).name}
                  onStart={() => {
                    start.current = r * rep.factor(spec.radius);
                    fit.freeze();
                  }}
                  onEnd={fit.release}
                  onMove={(dx) =>
                    calc.set(
                      {
                        [spec.radius]: rep.snapTo(
                          spec.radius,
                          start.current + (dx / scale / (2 * Math.PI)) * rep.factor(spec.radius),
                        ),
                      },
                      rep.slide(spec.radius),
                    )
                  }
                />
              ) : null}
            </>
          );
        }}
      </Canvas>
      <Caption>{lines.join(' · ')}</Caption>
    </View>
  );

  /** Pixels per unit: the biggest circle and one turn of it fit the width. */
  function geometry(w: number) {
    const scale = (w - 2 * PAD) / ((Math.PI + 1) * 2 * fit.value);
    const top = 34;
    return { scale, lineY: top + 2 * fit.value * scale };
  }
  function heightFor(w: number) {
    return geometry(w).lineY + 70;
  }
}

/**
 * The area as wedges: the circle cut into an even number of equal wedges, the top half one
 * color and the bottom half the other, then laid in a row, tips up and down, into a
 * near-parallelogram as long as half the circumference (π × r) and as tall as the radius.
 */
export function CircleWedges({ spec, calc }: { spec: Spec; calc: Calculator }) {
  const c = usePalette();
  const { rep, r, known, text, sym } = useLengths(spec, calc);
  const nRaw =
    spec.wedges === undefined
      ? 8
      : typeof spec.wedges === 'number'
        ? spec.wedges
        : rep.known(spec.wedges)
          ? rep.shown(spec.wedges)
          : 8;
  const n = Math.max(4, Math.min(24, 2 * Math.round(nRaw / 2)));
  const rSym = sym(spec.radius, 'r');
  const aSym = sym(spec.area, 'A');
  const half = text(undefined, Math.PI * r);
  const A = text(spec.area, Math.PI * r * r, true);
  const Rt = text(undefined, r);
  const lines = known
    ? [
        `${n} wedges make a shape close to a parallelogram: π × ${rSym} long and ${rSym} tall.`,
        `${aSym} = π × ${rSym} × ${rSym} = π × ${formatNumber(r)} × ${formatNumber(r)} ≈ ${A}`,
      ]
    : ['Type the radius.'];

  return (
    <View>
      <Canvas aspect={(w) => layout(w).h / w}>
        {({ w, h }) => {
          const { R, cx, cy, rowY } = layout(w);
          const th = (2 * Math.PI) / n;
          const hw = R * Math.sin(th / 2);
          const tall = R * Math.cos(th / 2);
          const x0 = (w - (n + 1) * hw) / 2;
          const yb = rowY + tall;
          const color = (top: boolean) => (top ? c.chartHighlight : c.chartSecond);
          // Wedge k of the circle, from 9 o'clock clockwise: the first n/2 are the top half.
          const inCircle = Array.from({ length: n }, (_, k) => {
            const a0 = Math.PI + k * th;
            const a1 = a0 + th;
            const p = (a: number) => `${cx + R * Math.cos(a)} ${cy + R * Math.sin(a)}`;
            return (
              <Path
                key={k}
                d={`M ${cx} ${cy} L ${p(a0)} A ${R} ${R} 0 0 1 ${p(a1)} Z`}
                fill={color(k < n / 2)}
                stroke={c.chartInk}
                strokeWidth={1}
                strokeLinejoin="round"
              />
            );
          });
          // In the row, the top half's wedges point down (arc on top), the bottom half's up.
          const inRow = Array.from({ length: n }, (_, k) => {
            const ax = x0 + (k + 0.5) * hw + hw / 2;
            const top = k % 2 === 0;
            const d = top
              ? `M ${ax} ${yb} L ${ax - hw} ${yb - tall} A ${R} ${R} 0 0 1 ${ax + hw} ${yb - tall} Z`
              : `M ${ax} ${yb - tall} L ${ax - hw} ${yb} A ${R} ${R} 0 0 0 ${ax + hw} ${yb} Z`;
            return (
              <Path
                key={k}
                d={d}
                fill={color(top)}
                stroke={c.chartInk}
                strokeWidth={1}
                strokeLinejoin="round"
              />
            );
          });
          const left = x0;
          const right = x0 + (n / 2) * 2 * hw;
          const halfText = `π × ${rSym} = ${half}`;
          return (
            <Svg width={w} height={h} opacity={known ? 1 : 0.4}>
              {inCircle}
              <Line
                x1={cx}
                y1={cy}
                x2={cx}
                y2={cy - R}
                stroke={c.chartInk}
                strokeWidth={chart.stroke}
              />
              <ChartText x={cx + R + 8} y={cy + 4} fontSize={chart.label} fontWeight="700">
                {`${rSym} = ${Rt}`}
              </ChartText>
              {inRow}
              {/* Half the circumference along the top; the radius up the side. */}
              <Path
                d={bracket(left, right, rowY - (R - tall) - 8, -1)}
                stroke={c.chartInk}
                fill="none"
              />
              <ChartText
                {...fitLabel((left + right) / 2, halfText, chart.label, w)}
                y={rowY - (R - tall) - 22}
                fontWeight="700"
              >
                {halfText}
              </ChartText>
              <Line
                x1={x0 + hw / 2 + hw / 2}
                y1={yb}
                x2={x0 + hw / 2 + hw / 2}
                y2={yb - tall}
                stroke={c.chartInk}
                strokeDasharray={chart.dashFine}
              />
              <ChartText
                {...fitLabel(x0 - 4, rSym, chart.label, w, 'end')}
                y={yb - tall / 2 + 4}
                fontWeight="700"
              >
                {rSym}
              </ChartText>
              <ChartText
                {...fitLabel(w / 2, `half the circumference × ${rSym}`, chart.small, w)}
                y={yb + 20}
                fontSize={chart.small}
                fill={c.chartMuted}
              >
                {`half the circumference × ${rSym}`}
              </ChartText>
            </Svg>
          );
        }}
      </Canvas>
      <Caption>{lines.join(' · ')}</Caption>
    </View>
  );

  /** The circle above, the row below; both as big as the width allows (radius up to 64). */
  function layout(w: number) {
    const R = Math.min(64, (w - 2 * PAD - 20) / Math.PI);
    const cy = 8 + R;
    const rowY = cy + R + 44;
    return { R, cx: w / 2, cy, rowY, h: rowY + R + 30 };
  }
}

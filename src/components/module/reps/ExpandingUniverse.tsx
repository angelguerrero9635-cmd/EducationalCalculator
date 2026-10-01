import { useRef, type ReactNode } from 'react';
import { View } from 'react-native';
import Svg, { ClipPath, Circle, Defs, Ellipse, G, Line, Path, Rect } from 'react-native-svg';

import type { ExpandingUniverseSpec, HubbleSpec, StretchSpec } from '@/data/modules/typesHsl';
import { formatNumber } from '@/engine/format';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import {
  Canvas,
  Caption,
  ChartText,
  DragHandle,
  fitLabel,
  niceCeil,
  useFrozen,
  useRep,
} from './common';
import { url, usePaintIds } from './paint';

/** A repeatable "random" number in [0, 1). */
const rnd = (i: number, k: number) => {
  const x = Math.sin(i * 12.9898 + k * 78.233) * 43758.5453;
  return x - Math.floor(x);
};

/** Galaxies as space stretches, or a Hubble plot (see `ExpandingUniverseSpec`). */
export function ExpandingUniverse({
  spec,
  calc,
}: {
  spec: ExpandingUniverseSpec;
  calc: Calculator;
}) {
  return spec.mode === 'stretch' ? (
    <Stretch spec={spec} calc={calc} />
  ) : (
    <Hubble spec={spec} calc={calc} />
  );
}

// ── Space stretching ──

const BW = 360;
const SH = 242;
const PANEL = 170;
const PY = 30;
const G0 = 18;

/**
 * Two views of one patch of space, before and after it stretches `scale` times, at the same
 * scale: the galaxies (each fixed in space) spread apart as the grid of space grows; in the
 * second view each galaxy's old place is a faint dot with an arrow to where it is now, the far
 * ones moving farther. Our galaxy is ringed in the middle; one neighbor is marked with its
 * distance before and after.
 */
function Stretch({ spec, calc }: { spec: StretchSpec; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  const ids = usePaintIds('a', 'b');
  const num = (x: number | string | undefined, d: number) =>
    x === undefined ? d : typeof x === 'number' ? x : rep.val(x);
  const known = (x: number | string | undefined) =>
    x === undefined || typeof x === 'number' || rep.known(x);
  const text = (x: number | string | undefined) =>
    x === undefined ? '' : typeof x === 'number' ? formatNumber(x) : rep.value(x);
  const a = Math.max(1, Math.min(4, num(spec.scale, 2)));
  const on = known(spec.scale);
  const galaxies: [number, number][] = [];
  for (let i = -4; i <= 4; i++) for (let j = -4; j <= 4; j++) galaxies.push([i, j]);
  const panel = (x0: number, s: number, clip: string, after: boolean) => {
    const cx = x0 + PANEL / 2;
    const cy = PY + PANEL / 2;
    const out: ReactNode[] = [];
    for (let k = -8; k <= 8; k++) {
      const p = k * G0 * s;
      if (Math.abs(p) > PANEL / 2) continue;
      out.push(
        <Line
          key={`v${k}`}
          x1={cx + p}
          y1={PY}
          x2={cx + p}
          y2={PY + PANEL}
          stroke={c.nebulaBlue}
          strokeOpacity={0.25}
        />,
        <Line
          key={`h${k}`}
          x1={x0}
          y1={cy + p}
          x2={x0 + PANEL}
          y2={cy + p}
          stroke={c.nebulaBlue}
          strokeOpacity={0.25}
        />,
      );
    }
    galaxies.forEach(([i, j], n) => {
      const jitter = [(rnd(n, 1) - 0.5) * 6, (rnd(n, 2) - 0.5) * 6];
      const [bx, by] = [i * G0 + jitter[0]!, j * G0 + jitter[1]!];
      const [gx, gy] = [cx + bx * s, cy + by * s];
      if (after && (i || j) && Math.abs(bx) * s < PANEL / 2 && Math.abs(by) * s < PANEL / 2) {
        // Where it was: a faint dot and an arrow to where it is now.
        const [ox, oy] = [cx + bx, cy + by];
        out.push(
          <Circle key={`o${n}`} cx={ox} cy={oy} r={1.2} fill={c.starWhite} opacity={0.4} />,
          <Line
            key={`m${n}`}
            x1={ox}
            y1={oy}
            x2={gx - (gx - ox) * 0.12}
            y2={gy - (gy - oy) * 0.12}
            stroke={c.starOrange}
            strokeWidth={1}
            opacity={0.8}
          />,
        );
      }
      const us = i === 0 && j === 0;
      out.push(
        <Ellipse
          key={`g${n}`}
          cx={gx}
          cy={gy}
          rx={us ? 4.5 : 3.2}
          ry={us ? 2.2 : 1.6}
          fill={us ? c.starYellow : n % 3 ? c.starWhite : c.nebulaBlue}
          transform={`rotate(${rnd(n, 3) * 180} ${gx} ${gy})`}
        />,
      );
    });
    // Our galaxy, ringed; and the marked neighbour, one step to the right.
    const mx = cx + G0 * s;
    out.push(
      <Circle
        key="us"
        cx={cx}
        cy={cy}
        r={8}
        fill="none"
        stroke={c.chartSecond}
        strokeWidth={1.5}
      />,
      <Circle
        key="mk"
        cx={mx}
        cy={cy}
        r={7}
        fill="none"
        stroke={c.chartHighlight}
        strokeWidth={2}
      />,
      <Path
        key="d"
        d={`M ${cx} ${cy + 14} V ${cy + 20} H ${mx} V ${cy + 14}`}
        stroke={c.chartHighlight}
        strokeWidth={1.5}
        fill="none"
      />,
    );
    return (
      <G>
        <Defs>
          <ClipPath id={clip}>
            <Rect x={x0} y={PY} width={PANEL} height={PANEL} rx={6} />
          </ClipPath>
        </Defs>
        <Rect x={x0} y={PY} width={PANEL} height={PANEL} rx={6} fill={c.space} />
        <G clipPath={url(clip)}>{out}</G>
      </G>
    );
  };
  return (
    <View>
      <Canvas aspect={SH / BW}>
        {({ w, h }) => (
          <Svg width={w} height={h}>
            <G transform={`scale(${w / BW})`} opacity={on ? 1 : 0.4}>
              {panel(6, 1, ids.a, false)}
              {panel(184, a, ids.b, true)}
              <ChartText
                x={6 + PANEL / 2}
                y={20}
                fontSize={chart.label}
                fontWeight="700"
                textAnchor="middle"
              >
                before
              </ChartText>
              <ChartText
                x={184 + PANEL / 2}
                y={20}
                fontSize={chart.label}
                fontWeight="700"
                textAnchor="middle"
              >
                {`space stretched × ${formatNumber(Number(a.toFixed(2)))}`}
              </ChartText>
              {spec.distance !== undefined ? (
                // Two lines under each panel, each inside its panel's width (one line ran
                // into the other panel's and was cut).
                <G>
                  {['marked galaxy:', known(spec.distance) ? text(spec.distance) : '?'].map(
                    (line, k) => (
                      <ChartText
                        key={k}
                        x={6 + PANEL / 2}
                        y={SH - 24 + k * 16}
                        fontSize={chart.label}
                        textAnchor="middle"
                        fill={c.chartHighlight}
                        fontWeight="700"
                      >
                        {line}
                      </ChartText>
                    ),
                  )}
                </G>
              ) : null}
              {spec.after !== undefined ? (
                <G>
                  {['now:', known(spec.after) ? text(spec.after) : '?'].map((line, k) => (
                    <ChartText
                      key={k}
                      x={184 + PANEL / 2}
                      y={SH - 24 + k * 16}
                      fontSize={chart.label}
                      textAnchor="middle"
                      fill={c.chartHighlight}
                      fontWeight="700"
                    >
                      {line}
                    </ChartText>
                  ))}
                </G>
              ) : null}
            </G>
          </Svg>
        )}
      </Canvas>
      <Caption>
        {on
          ? `Every distance grows ${formatNumber(Number(a.toFixed(2)))} times: a galaxy twice as far moves twice as far in the same time, so it recedes twice as fast. No galaxy is the center.`
          : 'Type how many times space stretches.'}
      </Caption>
    </View>
  );
}

// ── The Hubble plot ──

const HH = 270;
const HL = 58;
const HT = 18;
const HB = 42;

/** Speed against distance: the Hubble line through the origin, other galaxies, and the page's. */
function Hubble({ spec, calc }: { spec: HubbleSpec; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  const start = useRef(0);
  const num = (x: number | string | undefined, d: number) =>
    x === undefined ? d : typeof x === 'number' ? x : rep.val(x);
  const known = (x: number | string | undefined) =>
    x === undefined || typeof x === 'number' || rep.known(x);
  const h0 = num(spec.constant, 70);
  const d = Math.max(0, num(spec.distance, 100));
  const v = Math.max(0, num(spec.speed, h0 * d));
  const on = [spec.distance, spec.speed, spec.constant].every(known);
  const frame = useFrozen({ dMax: niceCeil(Math.max(d * 1.25, 50)), h0 });
  const dMax = frame.value.dMax;
  const vMax = niceCeil(Math.max(frame.value.h0 * dMax, v * 1.1));
  const id = typeof spec.distance === 'string' ? spec.distance : undefined;
  return (
    <View>
      <Canvas aspect={HH / 358}>
        {({ w, h }) => {
          const R = w - 14;
          const base = h - HB;
          const X = (x: number) => HL + (x / dMax) * (R - HL);
          const Y = (y: number) => base - (y / vMax) * (base - HT);
          const dStep = niceCeil(dMax / 5);
          const vStep = niceCeil(vMax / 5);
          const sample = Array.from({ length: 16 }, (_, i) => {
            const x = dMax * (0.06 + 0.9 * rnd(i, 7));
            return [x, h0 * x * (1 + (rnd(i, 8) - 0.5) * 0.3)] as const;
          }).filter(([, y]) => y < vMax);
          const lineEnd = Math.min(dMax, vMax / h0);
          const slopeText = `slope H₀ = ${formatNumber(h0)} km/s per Mpc`;
          const sFit = fitLabel(X(lineEnd * 0.55), slopeText, chart.label, w, 'end');
          return (
            <>
              <Svg width={w} height={h}>
                {Array.from({ length: Math.floor(dMax / dStep) + 1 }, (_, i) => i * dStep).map(
                  (x) => (
                    <G key={`x${x}`}>
                      <Line x1={X(x)} y1={HT} x2={X(x)} y2={base} stroke={c.chartGrid} />
                      <ChartText
                        x={X(x)}
                        y={base + 16}
                        fontSize={chart.label}
                        textAnchor="middle"
                        fill={c.chartMuted}
                      >
                        {formatNumber(x)}
                      </ChartText>
                    </G>
                  ),
                )}
                {Array.from({ length: Math.floor(vMax / vStep) + 1 }, (_, i) => i * vStep).map(
                  (y) => (
                    <G key={`y${y}`}>
                      <Line x1={HL} y1={Y(y)} x2={R} y2={Y(y)} stroke={c.chartGrid} />
                      <ChartText
                        x={HL - 5}
                        y={Y(y) + 4}
                        fontSize={chart.label}
                        textAnchor="end"
                        fill={c.chartMuted}
                      >
                        {formatNumber(y)}
                      </ChartText>
                    </G>
                  ),
                )}
                <Line x1={HL} y1={base} x2={R} y2={base} stroke={c.chartInk} strokeWidth={1.5} />
                <Line x1={HL} y1={HT} x2={HL} y2={base} stroke={c.chartInk} strokeWidth={1.5} />
                <ChartText
                  x={(HL + R) / 2}
                  y={h - 6}
                  fontSize={chart.label}
                  textAnchor="middle"
                  fill={c.chartMuted}
                >
                  Distance (Mpc)
                </ChartText>
                <ChartText
                  x={10}
                  y={(HT + base) / 2}
                  fontSize={chart.label}
                  textAnchor="middle"
                  fill={c.chartMuted}
                  transform={`rotate(-90 10 ${(HT + base) / 2})`}
                >
                  Speed away (km/s)
                </ChartText>
                {sample.map(([x, y], i) => (
                  <Circle key={i} cx={X(x)} cy={Y(y)} r={3.5} fill={c.chartMuted} opacity={0.7} />
                ))}
                <Line
                  x1={X(0)}
                  y1={Y(0)}
                  x2={X(lineEnd)}
                  y2={Y(h0 * lineEnd)}
                  stroke={c.chartHighlight}
                  strokeWidth={chart.stroke}
                />
                <ChartText
                  x={sFit.x}
                  y={Y(h0 * lineEnd * 0.55) - 10}
                  fontSize={chart.label}
                  textAnchor={sFit.textAnchor}
                  fill={c.chartHighlight}
                  fontWeight="700"
                >
                  {slopeText}
                </ChartText>
                <G opacity={on ? 1 : 0.4}>
                  <Line
                    x1={X(d)}
                    y1={Y(v)}
                    x2={X(d)}
                    y2={base}
                    stroke={c.fnSecond}
                    strokeDasharray={chart.dash}
                  />
                  <Line
                    x1={HL}
                    y1={Y(v)}
                    x2={X(d)}
                    y2={Y(v)}
                    stroke={c.fnSecond}
                    strokeDasharray={chart.dash}
                  />
                  <Circle
                    cx={X(d)}
                    cy={Y(v)}
                    r={6}
                    fill={c.fnSecond}
                    stroke={c.card}
                    strokeWidth={1.5}
                  />
                </G>
              </Svg>
              {id ? (
                <DragHandle
                  x={X(d)}
                  y={Y(v)}
                  label="the galaxy's distance"
                  onStart={() => {
                    start.current = d;
                    frame.freeze();
                  }}
                  onMove={(dx) => {
                    const nd = Math.max(0, start.current + (dx / (R - HL)) * dMax);
                    calc.set({ [id]: rep.snapTo(id, nd) }, rep.slide(id));
                  }}
                  onEnd={frame.release}
                />
              ) : null}
            </>
          );
        }}
      </Canvas>
      <Caption>
        {on
          ? `The farther a galaxy, the faster it moves away: ${formatNumber(Number(v.toFixed(1)))} km/s at ${formatNumber(Number(d.toFixed(2)))} Mpc.`
          : 'Type the distance and the Hubble constant to plot the galaxy.'}
      </Caption>
    </View>
  );
}

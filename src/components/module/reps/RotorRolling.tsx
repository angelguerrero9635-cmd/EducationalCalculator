import { View } from 'react-native';
import Svg, { Circle, Defs, G, Line, Path, Rect } from 'react-native-svg';

import type { RotorSpec } from '@/data/modules/typesHs3a';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, Caption } from './common';
import { CurvedArrow } from './hs3aKit';
import { rollingOf } from './he4bMath';
import { useValues } from './he4bKit';
import { short } from './hsdKit';
import { MathChip } from './hsdText';
import { SubLabel, Vec } from './hskKit';
import { Ball, Metal, TopLight, url, usePaintIds } from './paint';

/** A shape factor's name as the pages write it. */
const shapeName = (c: number) =>
  Math.abs(c - 1) < 1e-6
    ? 'hoop'
    : Math.abs(c - 2 / 3) < 1e-6
      ? 'hollow ball'
      : Math.abs(c - 0.5) < 1e-6
        ? 'disk'
        : Math.abs(c - 0.4) < 1e-6
          ? 'solid ball'
          : `c = ${short(c)}`;

const H = 300;

/**
 * HC102 `rolling`: a body rolling without slipping down a ramp of drop h, faded at the top and
 * solid at the bottom with v along the floor and ω round it; beside it a bar per shape, K_t and
 * K_r stacked to mgh. With `shapes`, several bodies race: each at the bottom with its own v.
 */
export function RotorRolling({ spec, calc }: { spec: RotorSpec; calc: Calculator }) {
  const c = usePalette();
  const { v, known, all } = useValues(calc);
  const ids = usePaintIds('metal', 'ball', 'ramp', 'bar');
  const q = spec.rolling!;
  const g = v(q.g, 9.8);
  const [m, r, h] = [v(spec.mass, 1), v(spec.radius, 0.1), v(q.height, 1)];
  const own = v(spec.shape, 0.5);
  const cs = q.shapes?.length ? q.shapes.map((x) => v(x)) : [own];
  const ready = all(spec.shape, spec.mass, spec.radius, q.height, q.g);
  const runs = cs.map((cc) => ({ c: cc, ...rollingOf(cc, m, r, h, g) }));
  const mine = rollingOf(own, m, r, h, g);
  const fastest = Math.max(1e-9, ...runs.map((x) => x.v));
  const total = mine.total;

  const lines: string[] = [];
  if (!ready) lines.push('v = √(2gh ÷ (1 + c)): ? until c, m, r and h are known.');
  else {
    lines.push(
      `mgh = ${short(m)} × ${short(g)} × ${short(h)} = ${short(total)} J at the top.`,
      `v = √(2 × ${short(g)} × ${short(h)} ÷ (1 + ${short(own)})) = ${short(mine.v)} m/s, and ω = v ÷ r = ${short(mine.w)} rad/s.`,
      `Kₜ = ½mv² = ${short(mine.kt)} J and K_r = cKₜ = ${short(mine.kr)} J: together ${short(mine.kt + mine.kr)} J = mgh.`,
    );
    if (runs.length > 1)
      lines.push(
        `At the bottom: ${runs.map((x) => `${shapeName(x.c)} ${short(x.v)} m/s`).join(', ')}.`,
      );
    if (runs.length > 1)
      lines.push(
        `Mass and radius cancel: the smaller c, the less goes into spin, so the ${shapeName(Math.min(...cs))} wins.`,
      );
  }

  return (
    <View>
      <Canvas aspect={(w) => (cs.length > 1 ? H : H - 50) / w}>
        {({ w, h: hh }) => {
          const rampR = w * 0.4;
          const [x0, y0, x1, y1] = [34, 56, rampR, 214];
          const floorY = y1;
          const n = runs.length;
          const R = n > 1 ? 13 : 20;
          const slope = Math.atan2(y1 - y0, x1 - x0);
          // A body resting on the slope near the top.
          const nx = Math.sin(slope);
          const ny = -Math.cos(slope);
          const topC = {
            x: x0 + (x1 - x0) * 0.12 + nx * R,
            y: y0 + (y1 - y0) * 0.12 + ny * R,
          };
          const barsX = w * 0.72;
          const barW = n > 1 ? Math.min(18, (w - barsX - 8) / n - 6) : 22;
          const barTop = 64;
          const barBottom = floorY;
          const kBar = (barBottom - barTop) / Math.max(1e-9, total);
          return (
            <Svg width={w} height={hh}>
              <Defs>
                <Metal id={ids.metal} light={c.metal} dark={c.metalDark} />
                <Ball id={ids.ball} color={c.metal} />
                <TopLight id={ids.ramp} />
                <TopLight id={ids.bar} />
              </Defs>
              {/* The ramp, a wooden wedge, and the floor. */}
              <Line
                x1={8}
                y1={floorY}
                x2={w - 8}
                y2={floorY}
                stroke={c.chartInk}
                strokeWidth={1.5}
              />
              <Path
                d={`M ${x0} ${y0} L ${x1} ${y1} L ${x0} ${y1} Z`}
                fill={c.wood}
                stroke={c.woodDark}
              />
              <Path d={`M ${x0} ${y0} L ${x1} ${y1} L ${x0} ${y1} Z`} fill={url(ids.ramp)} />
              {/* The drop h, bracketed beside the ramp. */}
              <Line
                x1={x0 - 10}
                y1={y0}
                x2={x0 - 10}
                y2={y1}
                stroke={c.chartInk}
                strokeWidth={1.2}
              />
              <Line
                x1={x0 - 15}
                y1={y0}
                x2={x0 - 5}
                y2={y0}
                stroke={c.chartInk}
                strokeWidth={1.2}
              />
              <Line
                x1={x0 - 15}
                y1={y1}
                x2={x0 - 5}
                y2={y1}
                stroke={c.chartInk}
                strokeWidth={1.2}
              />
              {known(q.height) ? (
                <SubLabel
                  x={x0 + 6}
                  y={(y0 + y1) / 2 + 30}
                  text={`h = ${short(h)} m`}
                  anchor="start"
                  w={w}
                />
              ) : null}
              {/* At the top, at rest (faded). */}
              <G opacity={0.4}>{body(topC.x, topC.y, R, cs[0]!)}</G>
              {ready
                ? runs.map((run, i) => {
                    // At the bottom, side by side; each v as long as its speed.
                    const cx = x1 + 14 + R + (n > 1 ? 0 : 6);
                    const cy = floorY - R - (n > 1 ? i * (2 * R + 26) : 0);
                    const len = Math.max(14, ((barsX - 18 - cx) * run.v) / fastest);
                    return (
                      <G key={`b${i}`}>
                        {n > 1 ? (
                          <Line
                            x1={cx - R - 6}
                            y1={cy + R}
                            x2={barsX - 12}
                            y2={cy + R}
                            stroke={c.chartGrid}
                            strokeWidth={1}
                          />
                        ) : null}
                        {body(cx, cy, R, run.c)}
                        <CurvedArrow
                          cx={cx}
                          cy={cy}
                          r={R + 5}
                          from={Math.PI * 0.9}
                          to={Math.PI * 0.9 - 1.6}
                          color={c.chartHighlight}
                          width={2}
                          head={8}
                        />
                        <Vec
                          x1={cx}
                          y1={cy - R - 10}
                          x2={cx + len}
                          y2={cy - R - 10}
                          color={c.forceNet}
                          width={2.5}
                          head={9}
                        />
                        {n > 1 ? (
                          <MathChip
                            x={cx + len / 2}
                            y={cy - R - 15}
                            text={`${short(run.v)} m/s`}
                            w={w}
                            h={hh}
                            color={c.forceNet}
                            size={chart.label}
                          />
                        ) : null}
                      </G>
                    );
                  })
                : null}
              {ready && n === 1 ? (
                <G>
                  <SubLabel
                    x={x1 + 4}
                    y={floorY - 2 * R - 18}
                    text={`v = ${short(mine.v)} m/s`}
                    anchor="start"
                    color={c.forceNet}
                    w={w}
                  />
                  <SubLabel
                    x={x1 + 4}
                    y={floorY + 22}
                    text={`ω = ${short(mine.w)} rad/s`}
                    anchor="start"
                    color={c.chartHighlight}
                    w={w}
                  />
                </G>
              ) : null}
              {/* K_t and K_r stacked to mgh, a bar per shape. */}
              {ready ? (
                <G>
                  <Line
                    x1={barsX - 4}
                    y1={barTop}
                    x2={w - 4}
                    y2={barTop}
                    stroke={c.chartInk}
                    strokeWidth={1}
                    strokeDasharray={chart.dash}
                  />
                  <MathChip
                    x={w - 4}
                    y={barTop - 8}
                    text={`mgh = ${short(total)} J`}
                    w={w}
                    h={hh}
                    anchor="end"
                  />
                  {runs.map((run, i) => {
                    const bx = barsX + i * (barW + 8);
                    const tH = run.kt * kBar;
                    const rH = run.kr * kBar;
                    return (
                      <G key={`k${i}`}>
                        <Rect
                          x={bx}
                          y={barBottom - tH}
                          width={barW}
                          height={tH}
                          fill={c.forceNet}
                        />
                        <Rect
                          x={bx}
                          y={barBottom - tH - rH}
                          width={barW}
                          height={rH}
                          fill={c.chartHighlight}
                        />
                        <Rect
                          x={bx}
                          y={barBottom - tH - rH}
                          width={barW}
                          height={tH + rH}
                          fill={url(ids.bar)}
                        />
                        {n > 1 ? <G>{body(bx + barW / 2, barBottom + 16, 8, run.c)}</G> : null}
                      </G>
                    );
                  })}
                  {n === 1 ? (
                    <G>
                      <SubLabel
                        x={barsX + barW + 6}
                        y={barBottom - (mine.kt * kBar) / 2 + 4}
                        text={`K_t = ${short(mine.kt)} J`}
                        anchor="start"
                        color={c.forceNet}
                        w={w}
                      />
                      <SubLabel
                        x={barsX + barW + 6}
                        y={barBottom - mine.kt * kBar - (mine.kr * kBar) / 2 + 4}
                        text={`K_r = ${short(mine.kr)} J`}
                        anchor="start"
                        color={c.chartHighlight}
                        w={w}
                      />
                    </G>
                  ) : (
                    <G>
                      <SubLabel
                        x={barsX}
                        y={floorY + 50}
                        text="K_t"
                        anchor="start"
                        color={c.forceNet}
                        w={w}
                      />
                      <SubLabel
                        x={barsX + 34}
                        y={floorY + 50}
                        text="K_r"
                        anchor="start"
                        color={c.chartHighlight}
                        w={w}
                      />
                    </G>
                  )}
                </G>
              ) : null}
            </Svg>
          );
        }}
      </Canvas>
      <Caption>{lines.join(' · ')}</Caption>
    </View>
  );

  /** A hoop, hollow ball, disk or solid ball of radius R, in metal. */
  function body(cx: number, cy: number, R: number, cc: number) {
    // The nearest of the four shapes (as Rotor draws them).
    const name = cc > 0.83 ? 'hoop' : cc > 0.58 ? 'hollow ball' : cc > 0.45 ? 'disk' : 'ball';
    if (name === 'hoop')
      return (
        <G>
          <Circle
            cx={cx}
            cy={cy}
            r={R - R * 0.12}
            stroke={url(ids.metal)}
            strokeWidth={R * 0.24}
            fill="none"
          />
          <Circle cx={cx} cy={cy} r={R} stroke={c.metalDark} strokeWidth={0.8} fill="none" />
          <Circle cx={cx} cy={cy} r={1.5} fill={c.metalDark} />
        </G>
      );
    if (name === 'disk')
      return (
        <G>
          <Circle cx={cx} cy={cy} r={R} fill={c.metal} stroke={c.metalDark} strokeWidth={2} />
          <Circle
            cx={cx}
            cy={cy}
            r={R * 0.65}
            fill="none"
            stroke={c.metalDark}
            strokeOpacity={0.35}
          />
          <Circle cx={cx} cy={cy} r={Math.max(1.5, R * 0.14)} fill={c.metalDark} />
        </G>
      );
    if (name === 'hollow ball')
      return (
        <G>
          <Circle cx={cx} cy={cy} r={R} fill={url(ids.ball)} stroke={c.metalDark} />
          <Circle
            cx={cx}
            cy={cy}
            r={R * 0.72}
            fill={c.card}
            stroke={c.metalDark}
            strokeWidth={0.8}
          />
        </G>
      );
    return (
      <G>
        <Circle cx={cx} cy={cy} r={R} fill={url(ids.ball)} stroke={c.metalDark} />
        <Path
          d={`M ${cx - R} ${cy} A ${R} ${R * 0.3} 0 0 0 ${cx + R} ${cy}`}
          fill="none"
          stroke={c.metalDark}
          strokeOpacity={0.4}
        />
      </G>
    );
  }
}

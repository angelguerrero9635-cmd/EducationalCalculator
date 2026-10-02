import { View } from 'react-native';
import Svg, { Defs, Ellipse, G, Line, Rect } from 'react-native-svg';

import type { RotorSpec } from '@/data/modules/typesHs3a';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, Caption } from './common';
import { rodOf } from './he4bMath';
import { useValues } from './he4bKit';
import { short } from './hsdKit';
import { SubLabel, Vec } from './hskKit';
import { Sheen, TopLight, url, usePaintIds } from './paint';

const H = 250;

/**
 * HC102 `rod`: a uniform rod to scale, its center axis dashed and the turning axis lit a
 * distance d away (d bracketed under the rod, L over it), a turn drawn round the lit axis; under
 * it a bar I = I_cm + Md², the two parts in proportion.
 */
export function RotorRod({ spec, calc }: { spec: RotorSpec; calc: Calculator }) {
  const c = usePalette();
  const { v, all } = useValues(calc);
  const ids = usePaintIds('rod', 'bar');
  const q = spec.rod!;
  const [M, L] = [v(spec.mass, 1), v(q.length, 1)];
  const d = q.d !== undefined ? v(q.d) : q.axis === 'end' ? L / 2 : 0;
  const ready = all(spec.mass, q.length, q.d);
  const s = rodOf(M, L, d);
  const unitI = 'kg·m²';

  const lines: string[] = [];
  if (!ready) lines.push('I is the center’s ML² ÷ 12 plus Md²: ? until M, L and d are known.');
  else
    lines.push(
      `About the center: ML² ÷ 12 = ${short(M)} × ${short(L)}² ÷ 12 = ${short(s.icm)} ${unitI}.`,
      `Moved d = ${short(d)} m: I = ${short(s.icm)} + ${short(M)} × ${short(d)}² = ${short(s.icm)} + ${short(s.shift)} = ${short(s.I)} ${unitI}.`,
      Math.abs(d - L / 2) < 1e-9
        ? 'At the end, I = ML² ÷ 3: four times the center’s.'
        : d === 0
          ? 'About the center itself, I is least.'
          : 'Any axis but the center’s gives a larger I.',
    );

  return (
    <View>
      <Canvas aspect={(w) => H / w}>
        {({ w, h }) => {
          // The rod and both axes to one scale.
          const lo = Math.min(-L / 2, d);
          const hi = Math.max(L / 2, d);
          const k = (w - 60) / Math.max(1e-9, hi - lo);
          const X = (x: number) => 30 + (x - lo) * k;
          const rodY = 108;
          const thick = 12;
          const [xc, xa] = [X(0), X(d)];
          const barY = 196;
          const barW = w - 40;
          const kI = barW / Math.max(1e-12, s.I);
          return (
            <Svg width={w} height={h}>
              <Defs>
                <Sheen id={ids.rod} vertical />
                <TopLight id={ids.bar} />
              </Defs>
              {/* L over the rod. */}
              <Line
                x1={X(-L / 2)}
                y1={rodY - 34}
                x2={X(L / 2)}
                y2={rodY - 34}
                stroke={c.chartInk}
                strokeWidth={1.2}
              />
              <Line
                x1={X(-L / 2)}
                y1={rodY - 40}
                x2={X(-L / 2)}
                y2={rodY - 28}
                stroke={c.chartInk}
                strokeWidth={1.2}
              />
              <Line
                x1={X(L / 2)}
                y1={rodY - 40}
                x2={X(L / 2)}
                y2={rodY - 28}
                stroke={c.chartInk}
                strokeWidth={1.2}
              />
              {ready ? (
                <SubLabel
                  x={X(L / 2) - xa > xa - X(-L / 2) ? (xa + X(L / 2)) / 2 : (X(-L / 2) + xa) / 2}
                  y={rodY - 40}
                  text={`L = ${short(L)} m`}
                  w={w}
                />
              ) : null}
              {/* The rod, in steel. */}
              <Rect
                x={X(-L / 2)}
                y={rodY - thick / 2}
                width={X(L / 2) - X(-L / 2)}
                height={thick}
                rx={3}
                fill={c.metal}
                stroke={c.metalDark}
              />
              <Rect
                x={X(-L / 2)}
                y={rodY - thick / 2}
                width={X(L / 2) - X(-L / 2)}
                height={thick}
                rx={3}
                fill={url(ids.rod)}
              />
              {/* The center axis dashed; the turning axis lit, with a turn round it. */}
              <Line
                x1={xc}
                y1={rodY - 22}
                x2={xc}
                y2={rodY + 40}
                stroke={c.chartMuted}
                strokeWidth={1.5}
                strokeDasharray={chart.dash}
              />
              {ready ? (
                <G>
                  <Line
                    x1={xa}
                    y1={rodY - 60}
                    x2={xa}
                    y2={rodY + 40}
                    stroke={c.chartHighlight}
                    strokeWidth={3}
                  />
                  <Ellipse
                    cx={xa}
                    cy={rodY - 50}
                    rx={16}
                    ry={5}
                    stroke={c.chartHighlight}
                    strokeWidth={1.5}
                    fill="none"
                  />
                  <Vec
                    x1={xa - 4}
                    y1={rodY - 45}
                    x2={xa + 6}
                    y2={rodY - 45}
                    color={c.chartHighlight}
                    width={1.5}
                    head={7}
                  />
                  {d !== 0 ? (
                    <G>
                      <Line
                        x1={xc}
                        y1={rodY + 32}
                        x2={xa}
                        y2={rodY + 32}
                        stroke={c.chartInk}
                        strokeWidth={1.2}
                      />
                      <Line
                        x1={xc}
                        y1={rodY + 26}
                        x2={xc}
                        y2={rodY + 38}
                        stroke={c.chartInk}
                        strokeWidth={1.2}
                      />
                      <Line
                        x1={xa}
                        y1={rodY + 26}
                        x2={xa}
                        y2={rodY + 38}
                        stroke={c.chartInk}
                        strokeWidth={1.2}
                      />
                    </G>
                  ) : null}
                  <SubLabel
                    x={d !== 0 ? (xc + xa) / 2 : xc}
                    y={rodY + 54}
                    text={`d = ${short(d)} m`}
                    w={w}
                  />
                  {/* I = I_cm + Md², in proportion. */}
                  <Rect x={20} y={barY} width={s.icm * kI} height={18} fill={c.chartMuted} />
                  <Rect
                    x={20 + s.icm * kI}
                    y={barY}
                    width={s.shift * kI}
                    height={18}
                    fill={c.chartHighlight}
                  />
                  <Rect x={20} y={barY} width={barW} height={18} fill={url(ids.bar)} />
                  <SubLabel
                    x={20}
                    y={barY - 8}
                    text={`I_cm = ${short(s.icm)}`}
                    anchor="start"
                    w={w}
                  />
                  <SubLabel
                    x={20 + barW}
                    y={barY - 8}
                    text={`Md² = ${short(s.shift)}`}
                    anchor="end"
                    color={c.chartHighlight}
                    w={w}
                  />
                  <SubLabel
                    x={20 + barW / 2}
                    y={barY + 38}
                    text={`I = ${short(s.I)} ${unitI}`}
                    w={w}
                  />
                </G>
              ) : null}
            </Svg>
          );
        }}
      </Canvas>
      <Caption>{lines.join(' · ')}</Caption>
    </View>
  );
}

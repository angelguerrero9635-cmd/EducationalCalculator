/**
 * HC139 (EG-P32): `scatter` with `classes`, minimum-distance classification in a feature space.
 * Each class mean a named star, the pixel a ringed dot, a segment from the pixel to each mean
 * with its length; the nearest segment solid and lit, the others dashed. One scale on both
 * axes, so equal lengths look equal. Flat, no handles.
 */
import { View } from 'react-native';
import Svg, { Circle, G, Line, Polygon } from 'react-native-svg';

import type { ScatterClassesSpec } from '@/data/modules/typesHe4a';
import { formatNumber } from '@/engine/format';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, Caption, ChartText, useRep } from './common';
import { textWidth } from './hsdText';

const fmt3 = (x: number) => formatNumber(Number(x.toPrecision(3)));
const fmt = (x: number) => formatNumber(Number(x.toPrecision(4)));

/** A round grid step for a range. */
function stepFor(range: number): number {
  const raw = range / 5;
  const pow = 10 ** Math.floor(Math.log10(raw));
  const n = raw / pow;
  return (n < 1.5 ? 1 : n < 3.5 ? 2 : n < 7.5 ? 5 : 10) * pow;
}

/** A five-pointed star's corners about (x, y). */
const star = (x: number, y: number, r: number) =>
  Array.from({ length: 10 }, (_, k) => {
    const a = -Math.PI / 2 + (k * Math.PI) / 5;
    const rr = k % 2 ? r * 0.45 : r;
    return `${x + rr * Math.cos(a)},${y + rr * Math.sin(a)}`;
  }).join(' ');

export function ScatterClassesHe4a({ spec, calc }: { spec: ScatterClassesSpec; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  const read = (x: number | string) =>
    typeof x === 'number' ? x : rep.known(x) ? rep.val(x) : undefined;
  const X = spec.x;
  const Y = spec.y;
  const means = spec.classes.map((k) => ({ name: k.name, x: read(k.x), y: read(k.y) }));
  const [px, py] = [read(spec.pixel.x), read(spec.pixel.y)];
  const pixel = px !== undefined && py !== undefined;
  const dist = means.map((m) =>
    pixel && m.x !== undefined && m.y !== undefined ? Math.hypot(px - m.x, py - m.y) : undefined,
  );
  const known = dist.filter((d): d is number => d !== undefined);
  const best = known.length ? dist.indexOf(Math.min(...known)) : -1;
  // A tie (to 3 figures) is said, not decided.
  const tie =
    best >= 0 &&
    dist.some((d, i) => i !== best && d !== undefined && fmt3(d) === fmt3(dist[best]!));

  const lines: string[] = [];
  if (!pixel) lines.push('Type the pixel’s two values to measure its distance to each class.');
  else {
    lines.push(
      `Distance in feature space: d = √(Δx² + Δy²) from the pixel (${fmt(px)}, ${fmt(py)}) to each class mean.`,
    );
    means.forEach((m, i) => {
      if (dist[i] === undefined) return;
      lines.push(
        `${m.name}: √((${fmt(px)} − ${fmt(m.x!)})² + (${fmt(py)} − ${fmt(m.y!)})²) = ${fmt3(dist[i]!)}`,
      );
    });
    if (best >= 0)
      lines.push(
        tie
          ? `Two classes are equally near (${fmt3(dist[best]!)}): the rule can’t decide.`
          : `Nearest: ${means[best]!.name.toLowerCase()} (${fmt3(dist[best]!)}), so the pixel is classed ${means[best]!.name.toLowerCase()}.`,
      );
  }

  const L = 44;
  const R = 14;
  const T = 26;
  const B = 34;
  const ratio = (Y.max - Y.min) / (X.max - X.min);
  return (
    <View>
      <Canvas aspect={(w) => Math.min(1.25, ((w - L - R) * ratio + T + B) / w)}>
        {({ w, h }) => {
          // One scale on both axes when it fits; else each axis its own.
          const sxk = (w - L - R) / (X.max - X.min);
          const syk = (h - T - B) / (Y.max - Y.min);
          const sx = (x: number) => L + (x - X.min) * sxk;
          const sy = (y: number) => h - B - (y - Y.min) * syk;
          const ticks = (a: typeof X) => {
            const step = a.step ?? stepFor(a.max - a.min);
            const out: number[] = [];
            for (let t = Math.ceil(a.min / step - 1e-9) * step; t <= a.max + 1e-9; t += step)
              out.push(Number(t.toFixed(10)));
            return out;
          };
          const P = pixel ? ([sx(px), sy(py)] as const) : undefined;
          // Labels are placed in turn, each at the first candidate spot clear of the stars,
          // the pixel and the labels already placed (centered boxes: x, y the text's middle).
          type Box = [number, number, number, number];
          const taken: Box[] = [];
          const starAt = means.map((m) =>
            m.x === undefined || m.y === undefined ? undefined : ([sx(m.x), sy(m.y)] as const),
          );
          for (const s of starAt) if (s) taken.push([s[0] - 10, s[1] - 10, s[0] + 10, s[1] + 10]);
          if (P) taken.push([P[0] - 9, P[1] - 9, P[0] + 9, P[1] + 9]);
          const clear = ([a, b, c2, d]: Box) =>
            a > 1 &&
            c2 < w - 1 &&
            b > T - 4 &&
            d < h - B - 1 &&
            taken.every(([e, f, g, k]) => a >= g || c2 <= e || b >= k || d <= f);
          const place = (text: string, spots: [number, number][]) => {
            const tw = textWidth(text, chart.label);
            const box = ([x, y]: [number, number]): Box => [
              x - tw / 2 - 2,
              y - 9,
              x + tw / 2 + 2,
              y + 5,
            ];
            const at = spots.find((s) => clear(box(s))) ?? spots[0]!;
            taken.push(box(at));
            return { text, x: at[0], y: at[1] + 4 };
          };
          // A short segment's length goes with its class's name, not on the segment.
          const short = means.map((_, i) => {
            const s = starAt[i];
            return !!P && !!s && Math.hypot(s[0] - P[0], s[1] - P[1]) < 70;
          });
          const names = means.map((m, i) => {
            const s = starAt[i];
            if (!s) return undefined;
            const text = short[i] && dist[i] !== undefined ? `${m.name} ${fmt3(dist[i]!)}` : m.name;
            const half = textWidth(text, chart.label) / 2;
            // Away from the pixel first: the side its segment doesn't leave by.
            const away = P ? (P[0] > s[0] ? -1 : 1) : 1;
            const up = P ? (P[1] > s[1] ? -1 : 1) : -1;
            const spots: [number, number][] = [
              [s[0] + away * (half + 12), s[1] + up * 14],
              [s[0] + away * (half + 12), s[1] - up * 14],
              [s[0] - away * (half + 12), s[1] + up * 14],
              [s[0] - away * (half + 12), s[1] - up * 14],
              [s[0], s[1] + up * 20],
              [s[0], s[1] - up * 20],
            ];
            return place(text, spots);
          });
          const pixelLabel = P
            ? place('pixel', [
                [P[0] + 30, P[1] + 16],
                [P[0] - 30, P[1] + 16],
                [P[0] + 30, P[1] - 16],
                [P[0] - 30, P[1] - 16],
              ])
            : undefined;
          // Distance labels: along each long segment, off it to either side.
          const labels = means.map((m, i) => {
            const s = starAt[i];
            if (!P || !s || dist[i] === undefined || short[i]) return undefined;
            const len = Math.hypot(s[0] - P[0], s[1] - P[1]) || 1;
            const [ux, uy] = [(s[0] - P[0]) / len, (s[1] - P[1]) / len];
            const text = fmt3(dist[i]!);
            const tw = textWidth(text, chart.label);
            const n: [number, number] = [-uy, ux];
            const off = Math.abs(n[0]) * (tw / 2 + 5) + Math.abs(n[1]) * 11;
            const spots: [number, number][] = [];
            for (const t of [0.5, 0.38, 0.62, 0.28, 0.72])
              for (const sgn of [1, -1])
                spots.push([
                  P[0] + (s[0] - P[0]) * t + sgn * n[0] * off,
                  P[1] + (s[1] - P[1]) * t + sgn * n[1] * off,
                ]);
            return place(text, spots);
          });
          return (
            <Svg width={w} height={h}>
              {ticks(X).map((t) => (
                <G key={`x${t}`}>
                  <Line
                    x1={sx(t)}
                    y1={T}
                    x2={sx(t)}
                    y2={h - B}
                    stroke={c.chartGrid}
                    strokeWidth={1}
                  />
                  <ChartText
                    x={sx(t)}
                    y={h - B + 15}
                    fontSize={chart.label}
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
                    y={sy(t) + 4}
                    fontSize={chart.label}
                    fill={c.chartMuted}
                    textAnchor="end"
                  >
                    {formatNumber(t)}
                  </ChartText>
                </G>
              ))}
              <Line
                x1={L}
                y1={h - B}
                x2={w - R}
                y2={h - B}
                stroke={c.chartInk}
                strokeWidth={chart.strokeLight}
              />
              <Line
                x1={L}
                y1={T}
                x2={L}
                y2={h - B}
                stroke={c.chartInk}
                strokeWidth={chart.strokeLight}
              />
              <ChartText
                x={w - R}
                y={h - 4}
                fontSize={chart.label}
                fontWeight="600"
                textAnchor="end"
              >
                {X.label}
              </ChartText>
              <ChartText x={4} y={14} fontSize={chart.label} fontWeight="600">
                {Y.label}
              </ChartText>
              {(spec.points ?? []).map(([x, y], i) => (
                <Circle
                  key={`o${i}`}
                  cx={sx(x)}
                  cy={sy(y)}
                  r={3}
                  fill={c.chartMuted}
                  opacity={0.4}
                />
              ))}
              {P
                ? means.map((m, i) =>
                    dist[i] === undefined ? null : (
                      <Line
                        key={`s${i}`}
                        x1={P[0]}
                        y1={P[1]}
                        x2={sx(m.x!)}
                        y2={sy(m.y!)}
                        stroke={i === best ? c.chartHighlight : c.chartMuted}
                        strokeWidth={i === best ? chart.strokeHeavy : chart.strokeLight}
                        strokeDasharray={i === best ? undefined : chart.dash}
                      />
                    ),
                  )
                : null}
              {means.map((m, i) => {
                if (m.x === undefined || m.y === undefined) return null;
                const [mx, my] = [sx(m.x), sy(m.y)];
                const name = names[i]!;
                return (
                  <G key={`m${i}`}>
                    <Polygon
                      points={star(mx, my, 9)}
                      fill={i === best ? c.chartHighlight : c.chartInk}
                      stroke={c.card}
                      strokeWidth={1}
                    />
                    <ChartText
                      x={name.x}
                      y={name.y}
                      fontSize={chart.label}
                      fontWeight="700"
                      textAnchor="middle"
                      fill={i === best ? c.chartHighlight : c.chartInk}
                      halo
                    >
                      {name.text}
                    </ChartText>
                  </G>
                );
              })}
              {labels.map((l, i) =>
                l ? (
                  <ChartText
                    key={`d${i}`}
                    x={l.x}
                    y={l.y}
                    fontSize={chart.label}
                    fontWeight={i === best ? '700' : '400'}
                    textAnchor="middle"
                    fill={i === best ? c.chartHighlight : c.chartInk}
                    halo
                  >
                    {l.text}
                  </ChartText>
                ) : null,
              )}
              {P ? (
                <G>
                  <Circle
                    cx={P[0]}
                    cy={P[1]}
                    r={7}
                    fill={c.card}
                    stroke={c.chartInk}
                    strokeWidth={chart.stroke}
                  />
                  <Circle cx={P[0]} cy={P[1]} r={3} fill={c.chartInk} />
                  <ChartText
                    x={pixelLabel!.x}
                    y={pixelLabel!.y}
                    fontSize={chart.label}
                    fontWeight="700"
                    textAnchor="middle"
                    halo
                  >
                    pixel
                  </ChartText>
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

import { View } from 'react-native';
import Svg, { Circle, Defs, G, Line, Path, Rect } from 'react-native-svg';

import type { Representation } from '@/data/modules';
import type { WaveHe3lSpec } from '@/data/modules/typesHe3l';
import type { WaveDepthSpec } from '@/data/modules/typesHe4f'; // HC128
import type { StandingWave } from '@/data/modules/typesHsk';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, Caption, ChartText, useRep } from './common';
import { standingOf } from './hskMath';
import { sig, SubLabel, worked } from './hskKit';
import { Glass, Sheen, url, usePaintIds } from './paint';

type Spec = Exclude<Extract<Representation, { kind: 'wave' }>, WaveHe3lSpec | WaveDepthSpec>;

const AMP = 28;

/**
 * A standing wave (H65) on a string fixed at both ends, or in a pipe open at both ends or
 * closed at one: the envelope at both extremes, nodes and antinodes marked and counted, half a
 * wavelength bracketed, λ = 2L/n or 4L/n. A closed pipe with an even n draws faded.
 */
export function WaveStanding({ spec, s, calc }: { spec: Spec; s: StandingWave; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  const ids = usePaintIds('glass', 'post');
  const si = (x: number | string | undefined, d = 0) =>
    x === undefined ? d : typeof x === 'number' ? x : rep.val(x);
  const known = (x: number | string | undefined) => typeof x !== 'string' || rep.known(x);
  const n = Math.max(1, Math.round(si(s.harmonic, 1)));
  const L = Math.max(1e-9, si(s.length, 1));
  const v = s.speed !== undefined ? si(s.speed) : undefined;
  const st = standingOf(s.medium, n, L);
  const all = [s.harmonic, s.length, s.speed].every(known);
  const lOkDrawn = known(s.harmonic) && known(s.length);
  const lengthUnit = typeof s.length === 'string' ? (rep.variable(s.length).unit ?? 'm') : 'm';
  // Displacement along the length (x from 0 to 1), as a fraction of the amplitude.
  const shape = (x: number) =>
    s.medium === 'string'
      ? Math.sin(n * Math.PI * x)
      : s.medium === 'open'
        ? Math.cos(n * Math.PI * x)
        : Math.sin((n * Math.PI * x) / 2);
  const pipe = s.medium !== 'string';
  const lines = captionLines();

  return (
    <View>
      <Canvas aspect={0.52}>
        {({ w, h }) => {
          const x0 = 26;
          const x1 = w - 26;
          const mid = h * 0.5;
          const X = (x: number) => x0 + (x1 - x0) * x;
          const env = (sign: 1 | -1) =>
            Array.from({ length: 121 }, (_, i) => i / 120)
              .map(
                (x, i) =>
                  `${i ? 'L' : 'M'} ${X(x).toFixed(1)} ${(mid - sign * AMP * shape(x)).toFixed(1)}`,
              )
              .join(' ');
          const half: [number, number] | undefined =
            st.nodes.length >= 2
              ? [st.nodes[0]!, st.nodes[1]!]
              : st.antinodes.length >= 2
                ? [st.antinodes[0]!, st.antinodes[1]!]
                : undefined;
          return (
            <Svg width={w} height={h}>
              <Defs>
                <Glass id={ids.glass} />
                <Sheen id={ids.post} />
              </Defs>
              {pipe ? (
                <G>
                  <Rect
                    x={x0}
                    y={mid - AMP - 12}
                    width={x1 - x0}
                    height={2 * AMP + 24}
                    fill={url(ids.glass)}
                  />
                  <Line
                    x1={x0}
                    y1={mid - AMP - 12}
                    x2={x1}
                    y2={mid - AMP - 12}
                    stroke={c.glassEdge}
                    strokeWidth={2}
                  />
                  <Line
                    x1={x0}
                    y1={mid + AMP + 12}
                    x2={x1}
                    y2={mid + AMP + 12}
                    stroke={c.glassEdge}
                    strokeWidth={2}
                  />
                  {s.medium === 'closed' ? (
                    <Rect
                      x={x0 - 8}
                      y={mid - AMP - 16}
                      width={8}
                      height={2 * AMP + 32}
                      rx={2}
                      fill={c.metalDark}
                    />
                  ) : null}
                </G>
              ) : (
                <G>
                  {[x0, x1].map((x) => (
                    <G key={x}>
                      <Rect
                        x={x - 5}
                        y={mid - 44}
                        width={10}
                        height={88}
                        rx={2}
                        fill={c.metal}
                        stroke={c.metalDark}
                      />
                      <Rect
                        x={x - 5}
                        y={mid - 44}
                        width={10}
                        height={88}
                        rx={2}
                        fill={url(ids.post)}
                      />
                    </G>
                  ))}
                  <Line
                    x1={x0}
                    y1={mid}
                    x2={x1}
                    y2={mid}
                    stroke={c.chartMuted}
                    strokeDasharray={chart.dashFine}
                  />
                </G>
              )}
              <G opacity={all && st.valid ? 1 : 0.35}>
                <Path
                  d={env(1)}
                  stroke={c.chartHighlight}
                  strokeWidth={chart.strokeHeavy}
                  fill="none"
                />
                <Path
                  d={env(-1)}
                  stroke={c.chartHighlight}
                  strokeWidth={chart.stroke}
                  strokeDasharray={chart.dash}
                  fill="none"
                />
                {st.nodes.map((x) => (
                  <G key={`n${x}`}>
                    <Circle cx={X(x)} cy={mid} r={4.5} fill={c.chartInk} />
                    <ChartText
                      x={X(x)}
                      y={mid + AMP + (pipe ? 30 : 20)}
                      textAnchor="middle"
                      fontSize={chart.label}
                      fontWeight="700"
                    >
                      N
                    </ChartText>
                  </G>
                ))}
                {st.antinodes.map((x) => (
                  <ChartText
                    key={`a${x}`}
                    x={X(x)}
                    y={mid - AMP - (pipe ? 18 : 8)}
                    textAnchor="middle"
                    fontSize={chart.label}
                    fontWeight="700"
                    fill={c.chartHighlight}
                  >
                    A
                  </ChartText>
                ))}
                {half ? (
                  <G>
                    <Line
                      x1={X(half[0])}
                      y1={16}
                      x2={X(half[1])}
                      y2={16}
                      stroke={c.chartInk}
                      strokeWidth={1.5}
                    />
                    <Line
                      x1={X(half[0])}
                      y1={11}
                      x2={X(half[0])}
                      y2={21}
                      stroke={c.chartInk}
                      strokeWidth={1.5}
                    />
                    <Line
                      x1={X(half[1])}
                      y1={11}
                      x2={X(half[1])}
                      y2={21}
                      stroke={c.chartInk}
                      strokeWidth={1.5}
                    />
                    <SubLabel
                      x={(X(half[0]) + X(half[1])) / 2}
                      y={13}
                      text={`λ/2 = ${lOkDrawn ? sig(st.lambda / 2) : '?'} ${lengthUnit}`}
                      size={chart.label}
                      w={w}
                    />
                  </G>
                ) : null}
              </G>
              <Line x1={x0} y1={h - 14} x2={x1} y2={h - 14} stroke={c.chartMuted} />
              <Line x1={x0} y1={h - 19} x2={x0} y2={h - 9} stroke={c.chartMuted} />
              <Line x1={x1} y1={h - 19} x2={x1} y2={h - 9} stroke={c.chartMuted} />
              <SubLabel
                x={w / 2}
                y={h - 10}
                text={`L = ${known(s.length) ? sig(L) : '?'} ${lengthUnit},  n = ${known(s.harmonic) ? n : '?'}`}
                size={chart.label}
                w={w}
              />
            </Svg>
          );
        }}
      </Canvas>
      <Caption>{lines.join(' · ')}</Caption>
    </View>
  );

  function captionLines(): string[] {
    if (!st.valid)
      return [
        `A pipe closed at one end has only odd harmonics (1, 3, 5, …): a node at the closed end and an antinode at the open end. n = ${n} can’t fit.`,
      ];
    // A "?" value: the rules only, never worked with the example's numbers behind the "?".
    const lOk = known(s.harmonic) && known(s.length);
    const out = worked(
      lOk,
      s.medium === 'closed'
        ? `λ = 4L/n = 4 × ${sig(L)}/${n} = ${sig(st.lambda)} ${lengthUnit}`
        : `λ = 2L/n = 2 × ${sig(L)}/${n} = ${sig(st.lambda)} ${lengthUnit}`,
    );
    if (v !== undefined)
      out.push(...worked(all, `f = v/λ = ${sig(v)}/${sig(st.lambda)} = ${sig(v / st.lambda)} Hz`));
    if (known(s.harmonic))
      out.push(
        `${st.nodes.length} ${st.nodes.length === 1 ? 'node' : 'nodes'} (N, no motion) and ${st.antinodes.length} ${st.antinodes.length === 1 ? 'antinode' : 'antinodes'} (A, the most motion).`,
        s.medium === 'string'
          ? 'The fixed ends are nodes.'
          : s.medium === 'open'
            ? 'Both open ends are antinodes: the air moves most there.'
            : 'The closed end is a node, the open end an antinode.',
      );
    return out;
  }
}

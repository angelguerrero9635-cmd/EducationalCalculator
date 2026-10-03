/**
 * `beaker` with `cuvette` (HC112; `typesHe4d.ts`): a spectrophotometer seen from the side. A
 * lamp sends the beam I₀ through a glass cuvette of path b (to scale up to 2.5 cm); inside the
 * solution the beam narrows as 10^(−A·x ÷ b), so it reaches the detector T times as wide. The
 * solution is tinted by εc (or A ÷ b). Lamp, glass, solution and detector are painted; the beam
 * and the dimension line stay flat. A "?" value draws nothing for itself.
 */
import { View } from 'react-native';
import Svg, { Circle, Defs, G, Line, Path, Rect } from 'react-native-svg';

import type { BeakerCuvette as Spec } from '@/data/modules/typesHe4d';
import { formatNumber } from '@/engine/format';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, Caption, ChartText, useRep } from './common';
import { fig3 } from './he1dText';
import { numReader } from './he3fKit';
import { beamHalf, CUVETTE_MAX, CUVETTE_PX, cuvetteAbsorbance } from './cuvetteMath';
import { Deepen, Glass, Metal, Sheen, TopLight, url, usePaintIds } from './paint';

export function BeakerCuvette({ spec, calc }: { spec: Spec; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  const num = numReader(rep);
  const ids = usePaintIds('glass', 'liquid', 'sheen', 'lamp', 'box');
  const b = num(spec.path);
  const eps = num(spec.absorptivity);
  const conc = num(spec.concentration);
  const A = cuvetteAbsorbance(num(spec.absorbance), num(spec.transmittance), eps, b, conc);
  const T = A === undefined ? undefined : 10 ** -A;
  // How strongly the solution absorbs per cm sets its colour (εc, or A ÷ b).
  const perCm =
    eps !== undefined && conc !== undefined ? eps * conc : A !== undefined && b ? A / b : undefined;
  const tint = perCm === undefined ? 0.12 : 0.12 + 0.7 * (1 - 10 ** -Math.max(0, perCm));
  const scaled = b !== undefined && b <= CUVETTE_MAX;

  return (
    <View>
      <Canvas aspect={(w) => 210 / w}>
        {({ w }) => {
          const yc = 104;
          const w0 = 16;
          const x0 = 104;
          const cw = b === undefined ? 56 : Math.max(30, Math.min(CUVETTE_MAX, b) * CUVETTE_PX);
          const x1 = x0 + cw;
          const dx = w - 56;
          const inside = (t: number) => (A === undefined ? w0 : beamHalf(w0, A, t));
          const n = 24;
          const top = Array.from({ length: n + 1 }, (_, k) => {
            const t = k / n;
            return `${x0 + 3 + t * (cw - 6)} ${yc - inside(t)}`;
          });
          const bottom = Array.from({ length: n + 1 }, (_, k) => {
            const t = 1 - k / n;
            return `${x0 + 3 + t * (cw - 6)} ${yc + inside(t)}`;
          });
          const out = A === undefined ? undefined : w0 * T!;
          const title = [
            A !== undefined ? `A = ${fig3(A)}` : undefined,
            T !== undefined ? `%T = ${fig3(100 * T)}%` : undefined,
          ]
            .filter(Boolean)
            .join(' · ');
          return (
            <Svg width={w} height={210}>
              <Defs>
                <Glass id={ids.glass} />
                <Deepen id={ids.liquid} from={c.he4dSolution} to={c.he4dSolution} />
                <Sheen id={ids.sheen} />
                <Metal id={ids.lamp} light={c.glassEdge} dark={c.chartInk} />
                <TopLight id={ids.box} />
              </Defs>
              {title ? (
                <ChartText
                  x={w / 2}
                  y={20}
                  textAnchor="middle"
                  fontSize={chart.emphasis}
                  fontWeight="700"
                >
                  {title}
                </ChartText>
              ) : null}
              {/* The lamp. */}
              <Rect x={8} y={yc - 26} width={42} height={52} rx={6} fill={url(ids.lamp)} />
              <Circle cx={44} cy={yc} r={9} fill={c.he4dBeam} stroke={c.chartInk} strokeWidth={1} />
              <ChartText x={29} y={yc + 44} textAnchor="middle" fill={c.chartMuted}>
                lamp
              </ChartText>
              {/* The beam in: I₀. */}
              <Rect
                x={52}
                y={yc - w0}
                width={x0 - 52}
                height={2 * w0}
                fill={c.he4dBeam}
                opacity={0.75}
              />
              <ChartText x={(52 + x0) / 2} y={yc - w0 - 8} textAnchor="middle" fontWeight="700">
                I₀
              </ChartText>
              {/* The cuvette: glass walls, the solution, the beam narrowing inside it. */}
              <Rect
                x={x0}
                y={yc - 62}
                width={cw}
                height={106}
                rx={2}
                fill={url(ids.glass)}
                stroke={c.glassEdge}
                strokeWidth={1.5}
              />
              <Rect
                x={x0 + 3}
                y={yc - 46}
                width={cw - 6}
                height={87}
                fill={url(ids.liquid)}
                opacity={tint}
              />
              {A !== undefined ? (
                <Path
                  d={`M ${top.join(' L ')} L ${bottom.join(' L ')} Z`}
                  fill={c.he4dBeam}
                  opacity={0.75}
                />
              ) : null}
              <Rect x={x0 + 3} y={yc - 46} width={cw - 6} height={87} fill={url(ids.sheen)} />
              {/* The beam out: I, T times as wide; then the detector. */}
              {out !== undefined ? (
                <G>
                  <Rect
                    x={x1}
                    y={yc - out}
                    width={dx - x1}
                    height={2 * out}
                    fill={c.he4dBeam}
                    opacity={0.75}
                  />
                  <ChartText x={(x1 + dx) / 2} y={yc - w0 - 8} textAnchor="middle" fontWeight="700">
                    I
                  </ChartText>
                </G>
              ) : null}
              <Rect x={dx} y={yc - 28} width={44} height={56} rx={4} fill={c.chartMuted} />
              <Rect x={dx} y={yc - 28} width={44} height={56} rx={4} fill={url(ids.box)} />
              <Rect x={dx + 8} y={yc - 12} width={28} height={24} rx={2} fill={c.card} />
              <ChartText x={dx + 22} y={yc + 46} textAnchor="middle" fill={c.chartMuted}>
                detector
              </ChartText>
              {/* The path b, to scale. */}
              {b !== undefined ? (
                <G>
                  <Line
                    x1={x0}
                    y1={yc + 58}
                    x2={x1}
                    y2={yc + 58}
                    stroke={c.chartInk}
                    strokeWidth={1.2}
                  />
                  <Line
                    x1={x0}
                    y1={yc + 52}
                    x2={x0}
                    y2={yc + 64}
                    stroke={c.chartInk}
                    strokeWidth={1.2}
                  />
                  <Line
                    x1={x1}
                    y1={yc + 52}
                    x2={x1}
                    y2={yc + 64}
                    stroke={c.chartInk}
                    strokeWidth={1.2}
                  />
                  <ChartText x={(x0 + x1) / 2} y={yc + 78} textAnchor="middle" fontWeight="700">
                    {`b = ${formatNumber(b)} cm${scaled ? '' : ' (not to scale)'}`}
                  </ChartText>
                </G>
              ) : null}
            </Svg>
          );
        }}
      </Canvas>
      <Caption>
        {A !== undefined && T !== undefined
          ? [
              eps !== undefined && b !== undefined && conc !== undefined
                ? `A = εbc = ${fig3(eps)} × ${formatNumber(b)} × ${fig3(conc)} = ${fig3(eps * b * conc)}.`
                : undefined,
              `%T = 100 × 10^(−A) = ${fig3(100 * T)}%: the beam leaves with ${fig3(T)} of its light, drawn as its width.`,
              'A = −log(I ÷ I₀); the more strongly the solution absorbs, the deeper its colour.',
            ]
              .filter(Boolean)
              .join(' · ')
          : 'Type ε, b and c (or A, or %T).'}
      </Caption>
    </View>
  );
}

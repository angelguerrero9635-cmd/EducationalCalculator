/**
 * HC128 `wave` option `depth` (WaveDepthSpec in typesHe4f.ts): one wavelength of a water wave
 * over the floor at depth d, drawn to the wavelength's scale (a floor too deep to show is cut off
 * with its depth written; a layer too thin to see is stretched, and says so), L ÷ 2 dashed, and
 * the water particles' orbits under the crest and the trough: circles shrinking with depth in deep
 * water, ellipses flattening to the floor in intermediate and shallow water. The label deep,
 * intermediate or shallow follows d ÷ L (½ and 1/20). The water is painted. No handles.
 */
import { View } from 'react-native';
import Svg, { Defs, Ellipse, G, Line, Path, Rect } from 'react-native-svg';

import type { WaveDepthSpec } from '@/data/modules/typesHe4f';
import { formatNumber } from '@/engine/format';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, Caption, ChartText, useRep } from './common';
import { orbitAxes, waterDepthClass } from './he4fMath';
import { Deepen, url, usePaintIds } from './paint';

const BW = 360;
const X0 = 30;
const PW = 300;
const SEA = 62;
/** The deepest water drawn (px) and the thinnest. */
const VIS = 176;
const THIN = 56;
/** The drawn amplitude (not to scale). */
const AMP = 12;

const n3 = (x: number) => formatNumber(Number(x.toPrecision(3)));

export function WaveDepth({ spec, calc }: { spec: WaveDepthSpec; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  const ids = usePaintIds('sea');
  type V = number | string | undefined;
  const known = (v: V) => v !== undefined && (typeof v === 'number' || rep.known(v));
  const get = (v: V): number | undefined =>
    !known(v) ? undefined : typeof v === 'number' ? v : rep.val(v as string);
  const say = (v: V, x: number) =>
    typeof v === 'string' && known(v) ? rep.value(v, false) : n3(x);
  const o = spec.depth;
  const d = get(o.depth);
  const L = get(o.wavelength);
  const ok = d !== undefined && L !== undefined && d > 0 && L > 0;
  const k = ok ? PW / L! : 1;
  // Depth px: to scale, cut off past VIS, or stretched up to THIN.
  const trueDepth = ok ? d! * k : 0;
  const cut = trueDepth > VIS;
  const stretch = ok && trueDepth < THIN ? THIN / trueDepth : 1;
  const floorY = SEA + (cut ? VIS : trueDepth * stretch);
  const ky = k * stretch;
  const cls = ok ? waterDepthClass(d!, L!) : undefined;
  const height = (ok ? floorY : SEA + VIS) + 40;

  // Orbits at four depths down to the floor (or to L ÷ 2 when the floor is deeper).
  const zMax = ok ? Math.min(d!, cut ? VIS / ky : d!) : 0;
  const levels = ok ? [0, 0.3, 0.6, 0.9].map((f) => f * zMax) : [];
  // The surface, a crest a quarter of the way along and a trough at three quarters.
  const surface = Array.from({ length: 61 }, (_, i) => {
    const x = X0 + (PW * i) / 60;
    const y = SEA - AMP * Math.cos(2 * Math.PI * (i / 60 - 0.25));
    return `${i ? 'L' : 'M'}${x.toFixed(1)},${y.toFixed(1)}`;
  }).join('');
  const water = `${surface} L${X0 + PW},${floorY} L${X0},${floorY} Z`;
  // Shallow-water orbits are far wider than tall: the largest is drawn at most 28 px across.
  const orbitScale = ok ? Math.min(1, 28 / orbitAxes(AMP, L!, d!, 0)[0]) : 1;
  const halfY = ok ? SEA + (L! / 2) * ky : 0;
  const showHalf = ok && halfY < floorY - 2 && halfY <= SEA + VIS;

  const lines: string[] = [];
  if (!ok) lines.push('Type the depth and the wavelength to draw the floor under the wave.');
  else {
    const ratio = d! / L!;
    lines.push(
      `d ÷ L = ${n3(d!)} ÷ ${n3(L!)} = ${n3(ratio)}: ${cls === 'deep' ? 'deep water (d > L ÷ 2): the orbits are circles that shrink with depth and never reach the floor' : cls === 'shallow' ? 'shallow water (d < L ÷ 20): the orbits are flat ellipses down to the floor, and c = √(gd)' : 'intermediate water (L ÷ 20 to L ÷ 2): the orbits flatten into ellipses near the floor'}.`,
    );
    const sp = get(o.speed);
    if (sp !== undefined) lines.push(`Wave speed c = ${n3(sp)} m/s.`);
    if (stretch > 1) lines.push(`Depths are stretched × ${n3(stretch)} to show the orbits.`);
    lines.push('Wave heights are not to scale.');
  }

  return (
    <View>
      <Canvas aspect={height / BW}>
        {({ w, h }) => (
          <Svg width={w} height={h}>
            <Defs>
              <Deepen id={ids.sea} from={c.waterTop} to={c.waterDeep} />
            </Defs>
            <G transform={`scale(${w / BW})`}>
              <Path d={water} fill={url(ids.sea)} opacity={0.85} />
              <Path d={surface} fill="none" stroke={c.waterDeep} strokeWidth={2} />
              {/* The floor: sand, or a break where it lies deeper than shown. */}
              {ok && !cut ? (
                <Rect x={X0} y={floorY} width={PW} height={10} fill={c.seafloor} />
              ) : null}
              {ok && cut ? (
                <Path
                  d={`M${X0},${floorY} l10,-6 l10,12 l10,-12 l10,12 l10,-6 M${X0 + PW - 50},${floorY} l10,-6 l10,12 l10,-12 l10,12 l10,-6`}
                  fill="none"
                  stroke={c.chartInk}
                  strokeWidth={1.2}
                />
              ) : null}
              {/* L above the wave. */}
              <Path
                d={`M${X0},${SEA - AMP - 14} v-6 M${X0},${SEA - AMP - 17} H${X0 + PW} M${X0 + PW},${SEA - AMP - 14} v-6`}
                stroke={c.chartInk}
                strokeWidth={1.2}
                fill="none"
              />
              <ChartText x={X0 + PW / 2} y={SEA - AMP - 24} textAnchor="middle" fontWeight="700">
                {`L = ${L !== undefined ? n3(L) : '?'} m`}
              </ChartText>
              {/* L ÷ 2, the wave base. */}
              {showHalf ? (
                <G>
                  <Line
                    x1={X0}
                    y1={halfY}
                    x2={X0 + PW}
                    y2={halfY}
                    stroke={c.chartInk}
                    strokeWidth={1.2}
                    strokeDasharray={chart.dash}
                  />
                  <ChartText x={X0 + 4} y={halfY - 5} fill={c.chartInk} halo>
                    {`L ÷ 2 = ${n3(L! / 2)} m`}
                  </ChartText>
                </G>
              ) : null}
              {/* Orbits under the crest and the trough. */}
              {ok
                ? [0.25, 0.75].flatMap((fx) =>
                    levels.map((z, i) => {
                      const [ax, az] = orbitAxes(AMP * orbitScale, L!, d!, z);
                      if (ax < 0.6) return null;
                      return (
                        <Ellipse
                          key={`${fx}-${i}`}
                          cx={X0 + PW * fx}
                          cy={SEA + z * ky}
                          rx={ax}
                          ry={Math.max(az, 0.4)}
                          fill="none"
                          stroke={c.he4fOrbit}
                          strokeWidth={1.5}
                        />
                      );
                    }),
                  )
                : null}
              {/* d at the right, and the class. */}
              {ok ? (
                <G>
                  <Line
                    x1={X0 + PW + 10}
                    y1={SEA}
                    x2={X0 + PW + 10}
                    y2={floorY}
                    stroke={c.chartInk}
                    strokeWidth={1.2}
                  />
                  <ChartText
                    x={X0 + PW - 4}
                    y={Math.min(floorY + 26, height - 6)}
                    textAnchor="end"
                    fontWeight="700"
                  >
                    {`d = ${say(o.depth, d!)} m${cut ? ' (floor deeper than shown)' : ''}`}
                  </ChartText>
                  <ChartText
                    x={X0}
                    y={Math.min(floorY + 26, height - 6)}
                    fontWeight="700"
                    fill={c.chartHighlight}
                  >
                    {cls === 'deep' ? 'deep' : cls === 'shallow' ? 'shallow' : 'intermediate'}
                  </ChartText>
                </G>
              ) : null}
            </G>
          </Svg>
        )}
      </Canvas>
      <Caption>{lines.join(' ')}</Caption>
    </View>
  );
}

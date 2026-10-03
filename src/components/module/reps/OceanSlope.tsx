/**
 * HC126 `oceanProfile` mode `slope` (OceanSlopeSpec in typesHe4f.ts): a section across a
 * geostrophic current, the sea surface tilted Δη over Δx (the vertical stretch written), a parcel
 * with the pressure-gradient force down the slope and the Coriolis force back up it, equal and
 * opposite, and the current into (⊗) or out of (⊙) the page: high sea level on its right in the
 * north, on its left in the south. The water is painted; the arrows flat. No handles.
 */
import { View } from 'react-native';
import Svg, { Circle, Defs, G, Line, Path } from 'react-native-svg';

import type { OceanSlopeSpec } from '@/data/modules/typesHe4f';
import { formatNumber, scientific } from '@/engine/format';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, Caption, ChartText, useRep } from './common';
import { geostrophic, OMEGA_EARTH } from './he4fMath';
import { Deepen, url, usePaintIds } from './paint';

const BW = 360;
const X0 = 30;
const X1 = 330;
/** The surface's mean level, the drawn rise and the section's floor. */
const SEA = 74;
const RISE = 40;
const FLOOR = 214;
const PARCEL: [number, number] = [180, 146];
const ARROW = 78;

const n3 = (x: number) =>
  Math.abs(x) >= 1e5 || (x !== 0 && Math.abs(x) < 1e-3)
    ? scientific(Number(x.toPrecision(3)))
    : formatNumber(Number(x.toPrecision(3)));

/** An arrow from (x, y) along dx with a filled head. */
const arrow = (x: number, y: number, dx: number) => {
  const s = Math.sign(dx);
  const tip = x + dx;
  return {
    shaft: `M${x},${y} L${tip - 9 * s},${y}`,
    head: `M${tip},${y} L${tip - 11 * s},${y - 6} L${tip - 11 * s},${y + 6} Z`,
  };
};

export function OceanSlope({ spec, calc }: { spec: OceanSlopeSpec; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  const ids = usePaintIds('sea');
  type V = number | string | undefined;
  const known = (v: V) => v !== undefined && (typeof v === 'number' || rep.known(v));
  const get = (v: V): number | undefined =>
    !known(v) ? undefined : typeof v === 'number' ? v : rep.val(v as string);
  const say = (v: V, x: number) =>
    typeof v === 'string' && known(v) ? rep.value(v, false) : n3(x);
  const rise = get(spec.rise);
  const dx = get(spec.width);
  const phi = get(spec.latitude);
  const g = get(spec.g ?? 9.81);
  const omega = spec.omega ?? OMEGA_EARTH;
  const south = spec.hemisphere === 'south' || (phi !== undefined && phi < 0);
  const tilt = rise === undefined || rise === 0 ? 0 : Math.sign(rise);
  // Drawn: the surface rises to the right for a positive rise (left for a negative one).
  const yl = SEA + (tilt * RISE) / 2;
  const yr = SEA - (tilt * RISE) / 2;
  const flat = phi !== undefined && Math.abs(phi) < 1;
  const geo =
    rise !== undefined && dx !== undefined && phi !== undefined && g !== undefined && !flat
      ? geostrophic(rise, dx * 1000, phi, g, omega)
      : undefined;
  // Into the page when high sea level is on the right in the north (or the left in the south).
  const into = tilt !== 0 && tilt > 0 !== south;
  const stretch = rise && dx ? RISE / Math.abs(rise) / ((X1 - X0) / (dx * 1000)) : undefined;
  const height = FLOOR + 24;

  const lines: string[] = [];
  if (rise === undefined || dx === undefined || phi === undefined)
    lines.push('Type the rise, the width and the latitude to balance the current.');
  else if (flat)
    lines.push(
      `At ${n3(phi)}° the Coriolis parameter is nearly 0: no geostrophic balance near the equator.`,
    );
  else if (geo) {
    const fText = `${n3(Math.abs(get(spec.coriolis) ?? geo.f))} s⁻¹`;
    lines.push(
      `f = 2Ω sin φ = 2 × ${formatNumber(Number(omega.toPrecision(4)), { scientific: true })} × sin ${n3(Math.abs(phi))}° = ${fText}.`,
      `v = gΔη ÷ (fΔx) = ${n3(g!)} × ${say(spec.rise, Math.abs(rise))} ÷ (${n3(geo.f)} × ${n3(dx * 1000)}) = ${n3(Math.abs(get(spec.speed) ?? geo.v))} m/s.`,
      tilt === 0
        ? 'A flat sea surface drives no current.'
        : `The current flows ${into ? 'into' : 'out of'} the page: high sea level on its ${south ? 'left (south)' : 'right (north)'}.`,
    );
  }

  const pgf = arrow(PARCEL[0], PARCEL[1], -tilt * ARROW);
  const cor = arrow(PARCEL[0], PARCEL[1], tilt * ARROW);
  const water = `M${X0},${yl} L${X1},${yr} L${X1},${FLOOR} L${X0},${FLOOR} Z`;
  const highX = tilt >= 0 ? X1 : X0;
  return (
    <View>
      <Canvas aspect={height / BW}>
        {({ w, h }) => (
          <Svg width={w} height={h}>
            <Defs>
              <Deepen id={ids.sea} from={c.waterTop} to={c.waterDeep} />
            </Defs>
            <G transform={`scale(${w / BW})`}>
              <Path d={water} fill={url(ids.sea)} opacity={0.9} />
              <Line x1={X0} y1={yl} x2={X1} y2={yr} stroke={c.waterDeep} strokeWidth={2.5} />
              {/* Δη: from the low end's level up to the high end. */}
              {tilt !== 0 ? (
                <G>
                  <Line
                    x1={X0}
                    y1={SEA + RISE / 2}
                    x2={X1}
                    y2={SEA + RISE / 2}
                    stroke={c.chartInk}
                    strokeWidth={1}
                    strokeDasharray={chart.dashFine}
                  />
                  <Path
                    d={`M${highX + (tilt > 0 ? 6 : -6)},${SEA - RISE / 2} h${tilt > 0 ? 6 : -6} V${SEA + RISE / 2} h${tilt > 0 ? -6 : 6}`}
                    fill="none"
                    stroke={c.chartInk}
                    strokeWidth={1.5}
                  />
                  <ChartText
                    x={tilt > 0 ? X1 - 4 : X0 + 4}
                    y={SEA - RISE / 2 - 8}
                    textAnchor={tilt > 0 ? 'end' : 'start'}
                    fontWeight="700"
                  >
                    {`high: Δη = ${rise !== undefined ? say(spec.rise, Math.abs(rise)) : '?'} m`}
                  </ChartText>
                </G>
              ) : null}
              {/* Δx under the section, and the stretch. */}
              <Path
                d={`M${X0},${FLOOR + 4} v6 H${X1} v-6`}
                fill="none"
                stroke={c.chartInk}
                strokeWidth={1.2}
              />
              <ChartText x={(X0 + X1) / 2} y={FLOOR + 22} textAnchor="middle" fontWeight="700">
                {`Δx = ${dx !== undefined ? say(spec.width, dx) : '?'} km`}
              </ChartText>
              {stretch ? (
                <ChartText x={X0} y={20} fill={c.chartMuted}>
                  {`Heights stretched × ${formatNumber(Number(stretch.toPrecision(2)))}`}
                </ChartText>
              ) : null}
              {/* The forces on a parcel, and the current. */}
              {geo && tilt !== 0 ? (
                <G>
                  <Path
                    d={pgf.shaft}
                    stroke={c.he4fPressureForce}
                    strokeWidth={chart.strokeHeavy}
                  />
                  <Path d={pgf.head} fill={c.he4fPressureForce} />
                  <Path d={cor.shaft} stroke={c.he4fCoriolis} strokeWidth={chart.strokeHeavy} />
                  <Path d={cor.head} fill={c.he4fCoriolis} />
                  <ChartText
                    x={PARCEL[0] - (tilt * ARROW) / 2}
                    y={PARCEL[1] - 14}
                    textAnchor="middle"
                    fontWeight="700"
                    fill={c.he4fPressureForce}
                    halo
                  >
                    pressure gradient
                  </ChartText>
                  <ChartText
                    x={PARCEL[0] + (tilt * ARROW) / 2}
                    y={PARCEL[1] + 24}
                    textAnchor="middle"
                    fontWeight="700"
                    fill={c.he4fCoriolis}
                    halo
                  >
                    Coriolis
                  </ChartText>
                  <Circle
                    cx={PARCEL[0]}
                    cy={PARCEL[1]}
                    r={11}
                    fill={c.card}
                    stroke={c.chartInk}
                    strokeWidth={chart.stroke}
                  />
                  {into ? (
                    <Path
                      d={`M${PARCEL[0] - 6},${PARCEL[1] - 6} L${PARCEL[0] + 6},${PARCEL[1] + 6} M${PARCEL[0] + 6},${PARCEL[1] - 6} L${PARCEL[0] - 6},${PARCEL[1] + 6}`}
                      stroke={c.chartInk}
                      strokeWidth={2}
                    />
                  ) : (
                    <Circle cx={PARCEL[0]} cy={PARCEL[1]} r={3.5} fill={c.chartInk} />
                  )}
                  <ChartText
                    x={PARCEL[0]}
                    y={PARCEL[1] + 48}
                    textAnchor="middle"
                    fontWeight="700"
                    halo
                  >
                    {`v = ${n3(Math.abs(get(spec.speed) ?? geo.v))} m/s ${into ? 'into' : 'out of'} the page`}
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

import { View } from 'react-native';
import Svg, { Circle, Defs, G, Line, Path, RadialGradient, Rect, Stop } from 'react-native-svg';

import type { TransitSpec } from '@/data/modules/typesHs3c';
import { formatNumber } from '@/engine/format';
import { chart, usePalette } from '@/theme';

import { HaloText } from '../layouts/earthKit';
import type { Calculator } from '../useCalculator';
import { Canvas, Caption, ChartText, useRep } from './common';
import { url, usePaintIds } from './paint';
import { EARTH_PER_SUN, overlapArea, transitDepth } from './spaceHs3c';

const BW = 356;
const BH = 330;
const CX = 178;
/** The star, drawn this many px in radius, in its patch of sky. */
const RS = 66;
const SKY_TOP = 8;
const SKY_H = 176;
const CY = SKY_TOP + SKY_H / 2 + 6;
/** The light curve: full brightness at FULL, the bottom of the dip at LOW. */
const FULL = 220;
const LOW = 282;
const LEFT = 16;
const RIGHT = 340;

/** A number to 4 significant figures, as the page shows δ. */
const sig = (x: number, n = 4) => formatNumber(Number(x.toPrecision(n)));

/** A planet crossing its star and the dip in the star's light (TransitSpec). */
export function Transit({ spec, calc }: { spec: TransitSpec; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  const ids = usePaintIds('star');
  const known = (x: number | string | undefined) =>
    x !== undefined && (typeof x === 'number' || rep.known(x));
  const num = (x: number | string) => (typeof x === 'number' ? x : rep.val(x));
  const R = Math.max(1e-6, num(spec.star));
  const r = Math.max(0, num(spec.planet));
  const on = known(spec.star) && known(spec.planet);
  // The planet's size beside the star's: the depth is this ratio squared.
  const ratio = Math.min(0.999, r / (EARTH_PER_SUN * R));
  const rp = RS * ratio;
  const d = spec.depth !== undefined && known(spec.depth) ? num(spec.depth) : transitDepth(r, R);
  const tiny = rp < 1.5;
  // The curve: brightness lost when the planet's centre is x px from the star's.
  const lost = (x: number) => (rp > 0 ? overlapArea(RS, rp, Math.abs(x)) / (Math.PI * rp * rp) : 0);
  const curve = Array.from({ length: 241 }, (_, i) => {
    const x = LEFT + ((RIGHT - 20 - LEFT) * i) / 240;
    return `${i ? 'L' : 'M'} ${x.toFixed(2)} ${(FULL + (LOW - FULL) * lost(x - CX)).toFixed(2)}`;
  }).join(' ');
  const text = (x: number | string | undefined, fallback: string) =>
    typeof x === 'string' ? rep.named(x) : fallback;
  const starText = text(spec.star, `R = ${formatNumber(R)} R☉`);
  const planetText = text(spec.planet, `r = ${formatNumber(r)} R⊕`);
  // A depth worked from a "?" star or planet reads "?", not the example's dip.
  const depthText =
    typeof spec.depth === 'string' && rep.known(spec.depth)
      ? rep.named(spec.depth)
      : on
        ? `δ = ${sig(d)}%`
        : 'δ = ?';

  return (
    <View>
      <Canvas aspect={BH / BW}>
        {({ w, h }) => (
          <Svg width={w} height={h}>
            <Defs>
              {/* The star's disk, brightest in the middle and dimmer toward its edge. */}
              <RadialGradient id={ids.star} cx="0.5" cy="0.5" r="0.5">
                <Stop offset="0" stopColor={c.starWhite} />
                <Stop offset="0.55" stopColor={c.starYellow} />
                <Stop offset="1" stopColor={c.starOrange} />
              </RadialGradient>
            </Defs>
            <G transform={`scale(${w / BW})`}>
              <Rect
                x={LEFT}
                y={SKY_TOP}
                width={RIGHT - LEFT}
                height={SKY_H}
                rx={8}
                fill={c.space}
              />
              <Circle cx={CX} cy={CY} r={RS} fill={url(ids.star)} />
              <G opacity={on ? 1 : 0.4}>
                {/* The planet's path across the middle of the star, and the planet halfway. */}
                <Line
                  x1={CX - RS - rp - 18}
                  y1={CY}
                  x2={CX + RS + rp + 18}
                  y2={CY}
                  stroke={c.starWhite}
                  strokeOpacity={0.55}
                  strokeDasharray={chart.dashFine}
                />
                <Path
                  d={`M ${CX + RS + rp + 18} ${CY} l -7 -4 v 8 Z`}
                  fill={c.starWhite}
                  fillOpacity={0.7}
                />
                <Circle cx={CX} cy={CY} r={Math.max(rp, 0.8)} fill={c.transitPlanet} />
                {tiny ? (
                  <Circle
                    cx={CX}
                    cy={CY}
                    r={7}
                    fill="none"
                    stroke={c.transitPlanet}
                    strokeWidth={1.5}
                  />
                ) : null}
              </G>
              <HaloText
                x={LEFT + 8}
                y={SKY_TOP + 22}
                text={`star ${starText}`}
                c={c}
                size={chart.label}
                bold
                anchor="start"
              />
              <HaloText
                x={RIGHT - 8}
                y={SKY_TOP + 22}
                text={`planet ${planetText}`}
                c={c}
                size={chart.label}
                bold
                anchor="end"
              />
              <HaloText
                x={CX}
                y={SKY_TOP + SKY_H - 8}
                text={
                  tiny
                    ? 'to scale: the planet is a dot (ringed)'
                    : `to scale: the planet is ${sig(ratio, 3)} of the star’s width`
                }
                c={c}
                size={chart.label}
                anchor="middle"
              />
              {/* The star's edges, down to where the dip starts and ends. */}
              {[-1, 1].map((s) => (
                <Line
                  key={s}
                  x1={CX + s * RS}
                  y1={CY}
                  x2={CX + s * RS}
                  y2={LOW + 6}
                  stroke={c.chartMuted}
                  strokeDasharray={chart.dashFine}
                />
              ))}
              {/* The light curve. */}
              <ChartText x={LEFT} y={FULL - 14} fontSize={chart.label} fill={c.chartMuted}>
                Brightness
              </ChartText>
              <G opacity={on ? 1 : 0.4}>
                <Path d={curve} stroke={c.chartHighlight} strokeWidth={chart.stroke} fill="none" />
              </G>
              <HaloText
                x={LEFT + 2}
                y={FULL + 16}
                text="100%"
                c={c}
                size={chart.label}
                anchor="start"
              />
              <HaloText
                x={CX}
                y={LOW + 18}
                text={`${sig(100 - d, 7)}%`}
                c={c}
                size={chart.label}
                anchor="middle"
              />
              {/* The depth, bracketed at the right. */}
              <Path
                d={`M ${RIGHT - 14} ${FULL} h 6 V ${LOW} h -6`}
                stroke={c.chartInk}
                strokeWidth={1.4}
                fill="none"
              />
              <Line
                x1={CX + RS}
                y1={LOW}
                x2={RIGHT - 16}
                y2={LOW}
                stroke={c.chartMuted}
                strokeDasharray={chart.dashFine}
              />
              <HaloText
                x={RIGHT}
                y={LOW + 18}
                text={depthText}
                c={c}
                size={chart.value}
                bold
                anchor="end"
              />
              <ChartText
                x={RIGHT}
                y={LOW + 38}
                fontSize={chart.label}
                textAnchor="end"
                fill={c.chartMuted}
              >
                time →
              </ChartText>
              <ChartText x={LEFT} y={LOW + 38} fontSize={chart.label} fill={c.chartMuted}>
                dip drawn tall to be seen
              </ChartText>
            </G>
          </Svg>
        )}
      </Canvas>
      <Caption>
        {on
          ? `The planet covers (r ÷ (109 × R))² of the star’s disk: (${formatNumber(r)} ÷ (109 × ${formatNumber(R)}))² = ${sig(d / 100)}, so the light dips by δ = ${sig(d)}%. The dip starts as the planet touches the star’s edge and is deepest once it is wholly in front.`
          : 'Type the star’s and the planet’s radius to draw the transit.'}
      </Caption>
    </View>
  );
}

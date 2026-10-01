import { View } from 'react-native';
import Svg, { Circle, Defs, Ellipse, G, Line, Path, Rect } from 'react-native-svg';

import type { ParallaxSpec } from '@/data/modules/typesHs3c';
import { formatNumber } from '@/engine/format';
import { chart, usePalette } from '@/theme';

import { HaloText } from '../layouts/earthKit';
import type { Calculator } from '../useCalculator';
import { Canvas, Caption, ChartText, fitLabel, useRep } from './common';
import { Ball, url, usePaintIds } from './paint';
import { LY_PER_PC, parsecsOf } from './spaceHs3c';

const BW = 356;
const BH = 350;
const CX = 178;
/** The far stars' patch of sky, and the height the near star's images are seen at. */
const SKY0 = 8;
const SKY1 = 78;
const SEEN = 46;
/** The Sun, and Earth in January (left) and July (right), 1 AU either side of it. */
const SUN_Y = 290;
const AU = 74;

/** The far background stars: fixed places across the patch of sky. */
const FAR: [number, number, number][] = [
  [30, 22, 1.6],
  [58, 60, 2.2],
  [92, 30, 1.4],
  [128, 66, 1.8],
  [150, 18, 2.4],
  [196, 58, 1.5],
  [226, 26, 2],
  [262, 68, 1.4],
  [288, 16, 1.8],
  [318, 52, 2.2],
  [336, 28, 1.4],
  [112, 50, 1.2],
  [240, 44, 1.2],
];

/** A four-pointed star of radius r at (x, y). */
const twinkle = (x: number, y: number, r: number) =>
  `M ${x} ${y - r * 2} L ${x + r * 0.5} ${y - r * 0.5} L ${x + r * 2} ${y} L ${x + r * 0.5} ${y + r * 0.5} L ${x} ${y + r * 2} L ${x - r * 0.5} ${y + r * 0.5} L ${x - r * 2} ${y} L ${x - r * 0.5} ${y - r * 0.5} Z`;

const round = (x: number, n = 4) => Number(x.toPrecision(n));

/** A near star's parallax against the far stars (ParallaxSpec). */
export function Parallax({ spec, calc }: { spec: ParallaxSpec; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  const ids = usePaintIds('star', 'sun', 'earth');
  const known = (x: number | string | undefined) =>
    x !== undefined && (typeof x === 'number' || rep.known(x));
  const num = (x: number | string) => (typeof x === 'number' ? x : rep.val(x));
  const p = Math.max(1e-4, num(spec.angle));
  const on = known(spec.angle);
  const d = parsecsOf(p);
  // Not to scale: the star climbs toward the far stars as it is farther, so p shrinks.
  const SY = 196 - 26 * Math.log10(Math.max(1, Math.min(1000, d)));
  const hit = (xe: number) => xe + ((CX - xe) * (SUN_Y - SEEN)) / (SUN_Y - SY);
  const [jan, jul] = [CX - AU, CX + AU];
  const seenJan = hit(jan);
  const seenJul = hit(jul);
  const pText = typeof spec.angle === 'string' ? rep.named(spec.angle) : `p = ${formatNumber(p)}″`;
  const dText =
    typeof spec.parsecs === 'string' && rep.known(spec.parsecs)
      ? rep.named(spec.parsecs)
      : `d = ${formatNumber(round(d))} parsecs`;
  // The angle p at the star, from its line to the Sun (straight down) to its line to July's Earth.
  const toJul = Math.atan2(jul - CX, SUN_Y - SY);
  const arcR = 34;
  const arc = `M ${CX} ${SY + arcR} A ${arcR} ${arcR} 0 0 0 ${CX + arcR * Math.sin(toJul)} ${SY + arcR * Math.cos(toJul)}`;
  const janLabel = fitLabel(seenJan, 'seen in January', chart.label, BW - 10);
  const julLabel = fitLabel(seenJul, 'seen in July', chart.label, BW - 10);

  return (
    <View>
      <Canvas aspect={BH / BW}>
        {({ w, h }) => (
          <Svg width={w} height={h}>
            <Defs>
              <Ball id={ids.star} color={c.starOrange} />
              <Ball id={ids.sun} color={c.sunDisk} />
              <Ball id={ids.earth} color={c.planetNeptune} />
            </Defs>
            <G transform={`scale(${w / BW})`}>
              {/* The far stars, which don't seem to move. */}
              <Rect x={8} y={SKY0} width={BW - 16} height={SKY1 - SKY0} rx={8} fill={c.space} />
              {FAR.map(([x, y, r]) => (
                <Path key={`${x}-${y}`} d={twinkle(x, y, r)} fill={c.starWhite} />
              ))}
              <G opacity={on ? 1 : 0.4}>
                {/* The triangle Sun–Earth–star, with p at the star. */}
                <Path
                  d={`M ${CX} ${SY} L ${CX} ${SUN_Y} L ${jul} ${SUN_Y} Z`}
                  fill={c.chartHighlight}
                  opacity={0.12}
                />
                {/* Sight lines from each side of the orbit, past the star to the far stars. */}
                {[jan, jul].map((xe) => (
                  <G key={xe}>
                    <Line
                      x1={xe}
                      y1={SUN_Y}
                      x2={CX}
                      y2={SY}
                      stroke={c.chartInk}
                      strokeWidth={1.2}
                    />
                    <Line
                      x1={CX}
                      y1={SY}
                      x2={hit(xe)}
                      y2={SEEN}
                      stroke={c.chartMuted}
                      strokeWidth={1.2}
                      strokeDasharray={chart.dash}
                    />
                  </G>
                ))}
                <Line
                  x1={CX}
                  y1={SY}
                  x2={CX}
                  y2={SUN_Y}
                  stroke={c.chartMuted}
                  strokeDasharray={chart.dashFine}
                />
                {/* Where the near star appears against the far stars, each half year. */}
                {[seenJan, seenJul].map((x) => (
                  <Circle
                    key={x}
                    cx={x}
                    cy={SEEN}
                    r={5}
                    fill={c.starOrange}
                    stroke={c.chartHighlight}
                    strokeWidth={2}
                  />
                ))}
                <HaloText
                  x={janLabel.x}
                  y={SEEN - 12}
                  text="seen in January"
                  c={c}
                  size={chart.label}
                  anchor={janLabel.textAnchor}
                />
                <HaloText
                  x={julLabel.x}
                  y={SEEN + 22}
                  text="seen in July"
                  c={c}
                  size={chart.label}
                  anchor={julLabel.textAnchor}
                />
                <Path d={arc} stroke={c.chartHighlight} strokeWidth={2} fill="none" />
                <HaloText
                  x={CX + arcR * Math.sin(toJul) + 8}
                  y={SY + arcR + 6}
                  text={pText}
                  c={c}
                  size={chart.value}
                  bold
                  anchor="start"
                  fill={c.chartHighlight}
                />
                <Circle cx={CX} cy={SY} r={8} fill={url(ids.star)} />
                <HaloText
                  x={CX - 14}
                  y={SY + 4}
                  text="near star"
                  c={c}
                  size={chart.label}
                  anchor="end"
                />
                <HaloText
                  x={CX - 8}
                  y={(SY + SUN_Y) / 2 + 22}
                  text={dText}
                  c={c}
                  size={chart.label}
                  bold
                  anchor="end"
                />
              </G>
              {/* Earth's orbit round the Sun, Earth half a year apart. */}
              <Ellipse
                cx={CX}
                cy={SUN_Y}
                rx={AU}
                ry={15}
                fill="none"
                stroke={c.chartInk}
                strokeWidth={1}
                strokeDasharray={chart.dashFine}
              />
              <Circle cx={CX} cy={SUN_Y} r={10} fill={url(ids.sun)} stroke={c.sunRay} />
              {[jan, jul].map((x) => (
                <Circle key={x} cx={x} cy={SUN_Y} r={6} fill={url(ids.earth)} />
              ))}
              <HaloText x={(CX + jul) / 2} y={SUN_Y - 5} text="1 AU" c={c} size={chart.label} />
              {(
                [
                  [jan, 'Earth, January'],
                  [CX, 'Sun'],
                  [jul, 'Earth, July'],
                ] as const
              ).map(([x, name]) => (
                <ChartText
                  key={name}
                  x={x}
                  y={SUN_Y + 32}
                  fontSize={chart.label}
                  textAnchor="middle"
                  fill={c.chartMuted}
                >
                  {name}
                </ChartText>
              ))}
              <ChartText
                x={CX}
                y={BH - 6}
                fontSize={chart.label}
                textAnchor="middle"
                fill={c.chartMuted}
              >
                Not to scale: p is always under 1″, far too small to see.
              </ChartText>
            </G>
          </Svg>
        )}
      </Canvas>
      <Caption>
        {on
          ? `d = 1 ÷ p = 1 ÷ ${formatNumber(p)} = ${formatNumber(round(d))} parsecs, or 3.26 × ${formatNumber(round(d))} = ${formatNumber(round(LY_PER_PC * d))} light-years. Half a year apart, Earth has moved 2 AU, so the near star shifts by 2p against the far stars; the farther the star, the smaller the shift.`
          : 'Type the parallax angle to place the star.'}
      </Caption>
    </View>
  );
}

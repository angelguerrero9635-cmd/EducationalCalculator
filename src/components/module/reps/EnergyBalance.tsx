import { View } from 'react-native';
import Svg, { Circle, Defs, G, Line, Path, Rect } from 'react-native-svg';

import type { BalanceSpec } from '@/data/modules/typesHs2f';
import { formatNumber } from '@/engine/format';
import { chart, usePalette } from '@/theme';

import { HaloText } from '../layouts/earthKit';
import type { Calculator } from '../useCalculator';
import { Canvas, Caption, ChartText, useRep } from './common';
import { absorbedOf, balanceTemp, SOLAR_CONSTANT } from './earthModelHs2f';
import { Ball, Deepen, url, usePaintIds } from './paint';

const BW = 360;
const BH = 318;
/** The scene: space above, the air, the ground. */
const SPACE = 54;
const AIR = 96;
const GROUND = 250;
/** Where the bands start at the top, where the sunlight splits, and the full band's width. */
const TOPY = 70;
const SPLIT = 206;
const FULL = 58;
const IN_X = 56;
const IR_X = 196;
/** The thermometer, 150–350 K. */
const TH_X = 304;
const TH_TOP = 76;
const TH_BOT = 250;
const T_LO = 150;
const T_HI = 350;

const round = (x: number, places = 0) => Number(x.toFixed(places));
const celsius = (k: number) => {
  const c = round(k - 273.15);
  return `${c < 0 ? `−${-c}` : c} °C`;
};

/** Earth's energy balance with no greenhouse effect, driven by S and α (BalanceSpec). */
export function EnergyBalance({ spec, calc }: { spec: BalanceSpec; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  const ids = usePaintIds('sun', 'soil');
  const num = (x: number | string | undefined, d: number) =>
    x === undefined ? d : typeof x === 'number' ? x : rep.val(x);
  const known = (x: number | string | undefined) =>
    x === undefined || typeof x === 'number' || rep.known(x);
  const s = Math.max(0, num(spec.sunlight, SOLAR_CONSTANT));
  const a = Math.max(0, Math.min(1, num(spec.albedo, 0.3)));
  const on = known(spec.albedo) && known(spec.sunlight);
  const inflow = s / 4;
  const f = absorbedOf(s, a);
  const refl = inflow - f;
  const t = balanceTemp(f);
  const wAbs = FULL * (1 - a);
  const wRef = FULL * a;
  const x1 = IN_X + wAbs + wRef / 2;
  const x2 = x1 + wRef + 12;
  const r = (x2 - x1) / 2;
  const tY = (k: number) =>
    TH_BOT - ((Math.max(T_LO, Math.min(T_HI, k)) - T_LO) / (T_HI - T_LO)) * (TH_BOT - TH_TOP);
  const w0 = (x: number) => formatNumber(round(x));
  // A wavy infrared line up the middle of its band.
  const wave = (cx: number) => {
    let d = `M ${cx} ${GROUND - 4}`;
    const n = 12;
    for (let i = 0; i < n; i++) {
      const y0 = GROUND - 4 - ((i + 0.5) * (GROUND - 4 - TOPY - 10)) / n;
      const y1 = GROUND - 4 - ((i + 1) * (GROUND - 4 - TOPY - 10)) / n;
      d += ` Q ${cx + (i % 2 ? -5 : 5)} ${y0.toFixed(1)} ${cx} ${y1.toFixed(1)}`;
    }
    return d;
  };
  const key: [string, string][] = [
    ['sunlight in, S ÷ 4', c.sunRay],
    ['reflected, α × S ÷ 4', c.sunDisk],
    ['absorbed, F', c.sunRay],
    ['infrared out, σTₑ⁴', c.spectrumRed],
  ];

  return (
    <View>
      <Canvas aspect={BH / BW}>
        {({ w, h }) => {
          const k = w / BW;
          return (
            <Svg width={w} height={h}>
              <Defs>
                <Ball id={ids.sun} color={c.sunDisk} />
                <Deepen id={ids.soil} from={c.soil} to={c.soilDark} />
              </Defs>
              <G transform={`scale(${k})`}>
                {/* The key, in W/m² averaged over the globe. */}
                {key.map(([name, col], i) => {
                  const x = i % 2 ? 190 : 8;
                  const y = 14 + Math.floor(i / 2) * 18;
                  return (
                    <G key={name}>
                      <Rect x={x} y={y - 9} width={14} height={10} rx={2} fill={col} />
                      <ChartText x={x + 19} y={y} fontSize={chart.label}>
                        {name}
                      </ChartText>
                    </G>
                  );
                })}
                <Rect x={0} y={SPACE} width={BW} height={AIR - SPACE} fill={c.space} />
                <Rect x={0} y={AIR} width={BW} height={GROUND - AIR} fill={c.airBand} />
                <Rect x={0} y={GROUND} width={BW} height={BH - GROUND} fill={url(ids.soil)} />
                <Path d={`M 0 ${GROUND} H ${BW}`} stroke={c.landGrass} strokeWidth={4} />
                <Circle cx={24} cy={SPACE + 20} r={14} fill={url(ids.sun)} />
                <ChartText
                  x={BW - 6}
                  y={SPACE + 16}
                  fontSize={chart.label}
                  textAnchor="end"
                  fill={c.moonLit}
                >
                  space
                </ChartText>
                <G opacity={on ? 1 : 0.4}>
                  {/* Sunlight in: the full band, down to where it splits. */}
                  <Rect x={IN_X} y={TOPY} width={FULL} height={SPLIT - TOPY} fill={c.sunRay} />
                  {/* Absorbed: into the ground. */}
                  {wAbs > 0.5 ? (
                    <>
                      <Rect
                        x={IN_X}
                        y={SPLIT - 1}
                        width={wAbs}
                        height={GROUND - SPLIT - 6}
                        fill={c.sunRay}
                      />
                      <Path
                        d={`M ${IN_X - 5} ${GROUND - 7} L ${IN_X + wAbs / 2} ${GROUND + 8} L ${IN_X + wAbs + 5} ${GROUND - 7} Z`}
                        fill={c.sunRay}
                      />
                    </>
                  ) : null}
                  {/* Reflected: turned back up to space. */}
                  {wRef > 0.5 ? (
                    <>
                      <Path
                        d={`M ${x1} ${SPLIT - 2} A ${r} ${r} 0 0 0 ${x2} ${SPLIT - 2} L ${x2} ${TOPY + 10}`}
                        stroke={c.sunDisk}
                        strokeWidth={wRef}
                        fill="none"
                      />
                      <Path
                        d={`M ${x2 - wRef / 2 - 5} ${TOPY + 10} L ${x2} ${TOPY - 6} L ${x2 + wRef / 2 + 5} ${TOPY + 10} Z`}
                        fill={c.sunDisk}
                      />
                    </>
                  ) : null}
                  {/* Infrared out from the warm ground, as much as it absorbs. */}
                  {wAbs > 0.5 ? (
                    <>
                      <Rect
                        x={IR_X}
                        y={TOPY + 10}
                        width={wAbs}
                        height={GROUND - TOPY - 10}
                        fill={c.spectrumRed}
                        opacity={0.35}
                      />
                      <Path
                        d={`M ${IR_X - 5} ${TOPY + 10} L ${IR_X + wAbs / 2} ${TOPY - 6} L ${IR_X + wAbs + 5} ${TOPY + 10} Z`}
                        fill={c.spectrumRed}
                        opacity={0.6}
                      />
                      <Path
                        d={wave(IR_X + wAbs / 2)}
                        stroke={c.spectrumRed}
                        strokeWidth={2.2}
                        fill="none"
                      />
                    </>
                  ) : null}
                  {/* The numbers on the bands. */}
                  <HaloText x={IN_X + FULL / 2} y={134} text={w0(inflow)} c={c} bold />
                  {wRef > 0.5 ? <HaloText x={x2} y={160} text={w0(refl)} c={c} bold /> : null}
                  {wAbs > 0.5 ? (
                    <>
                      <HaloText x={IN_X + wAbs / 2} y={GROUND - 16} text={w0(f)} c={c} bold />
                      <HaloText
                        x={IR_X + wAbs / 2}
                        y={150}
                        text={w0(f)}
                        c={c}
                        bold
                        fill={c.spectrumRed}
                      />
                    </>
                  ) : null}
                </G>
                <ChartText
                  x={IR_X + FULL / 2}
                  y={BH - 10}
                  fontSize={chart.label}
                  textAnchor="middle"
                  fill={c.moonLit}
                >
                  numbers in W/m²
                </ChartText>
                {/* The thermometer at Tₑ. */}
                <Rect
                  x={TH_X - 6}
                  y={TH_TOP - 6}
                  width={12}
                  height={TH_BOT - TH_TOP + 12}
                  rx={6}
                  fill={c.paper}
                  stroke={c.chartInk}
                  strokeWidth={1}
                />
                <Rect
                  x={TH_X - 3}
                  y={tY(t)}
                  width={6}
                  height={TH_BOT + 10 - tY(t)}
                  fill={c.mercury}
                  opacity={on ? 1 : 0.4}
                />
                <Circle
                  cx={TH_X}
                  cy={TH_BOT + 14}
                  r={9}
                  fill={c.mercury}
                  stroke={c.chartInk}
                  strokeWidth={1}
                />
                {[200, 273, 300].map((kv) => (
                  <G key={kv}>
                    <Line
                      x1={TH_X - 10}
                      y1={tY(kv)}
                      x2={TH_X - 6}
                      y2={tY(kv)}
                      stroke={c.chartInk}
                      strokeWidth={1}
                    />
                    <HaloText
                      x={TH_X - 12}
                      y={tY(kv) + 4}
                      text={kv === 273 ? '0 °C' : `${kv} K`}
                      c={c}
                      size={chart.label}
                      anchor="end"
                    />
                  </G>
                ))}
                <HaloText
                  x={TH_X + 10}
                  y={tY(t) + 4}
                  text={`${formatNumber(round(t))} K`}
                  c={c}
                  size={chart.value}
                  bold
                  anchor="start"
                />
                <HaloText
                  x={TH_X + 10}
                  y={tY(t) + 21}
                  text={celsius(round(t))}
                  c={c}
                  size={chart.label}
                  anchor="start"
                />
              </G>
            </Svg>
          );
        }}
      </Canvas>
      <Caption>
        {on
          ? `Averaged over the globe, ${w0(s)} ÷ 4 = ${w0(inflow)} W/m² arrives. With α = ${formatNumber(round(a, 3))}, ${w0(refl)} is reflected and F = ${w0(s)} × (1 − ${formatNumber(round(a, 3))}) ÷ 4 = ${w0(f)} W/m² is absorbed. In balance the ground sends F back out: σTₑ⁴ = ${w0(f)}, so Tₑ = ${formatNumber(round(t))} K (${celsius(round(t))}).`
          : 'Type the albedo to balance the energy.'}
      </Caption>
    </View>
  );
}

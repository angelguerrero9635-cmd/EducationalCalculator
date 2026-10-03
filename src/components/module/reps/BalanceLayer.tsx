/**
 * HC125 `atmosphereLayers` `balance` with `layer` (typesHe4g.ts): the one-layer greenhouse.
 * Sunlight S ÷ 4 comes in, α of it is reflected and F = S(1 − α) ÷ 4 passes the layer (it is
 * transparent to sunlight) into the ground. The ground sends up G = σT_s⁴; the layer absorbs εG,
 * the rest (1 − ε)G escapes, and the layer sends εG ÷ 2 up and εG ÷ 2 back down. Every band is
 * to scale, and the books balance at the top (F out), in the layer and at the ground. A
 * thermometer reads T_s, with Tₑ (no greenhouse) marked: T_s = Tₑ(2 ÷ (2 − ε))^(1/4).
 */
import { View } from 'react-native';
import Svg, { Circle, Defs, G, Line, Path, Rect } from 'react-native-svg';

import type { BalanceLayerSpec } from '@/data/modules/typesHe4g';
import { chart, usePalette } from '@/theme';

import { HaloText } from '../layouts/earthKit';
import type { Calculator } from '../useCalculator';
import { Canvas, Caption, ChartText } from './common';
import { absorbedOf, balanceTemp, SOLAR_CONSTANT } from './earthModelHs2f';
import { fmt } from './he2fKit';
import { useHe4g } from './he4gKit';
import { layerBudget } from './he4gMath';
import { Ball, Deepen, url, usePaintIds } from './paint';

const BW = 360;
const BH = 344;
/** Space, the layer and the ground. */
const SPACE_B = 64;
const LAYER_T = 150;
const LAYER_B = 184;
const GROUND = 292;
/** Where the sunlight splits (above the layer). */
const SPLIT = 118;
/** Band width per W/m²: 400 W/m² is 56 px. */
const PX = 56 / 400;
const IN_X = 10;
const IR_X = 96;
const LAY_X = 176;
/** The thermometer, 200–320 K. */
const TH_X = 324;
const TH_TOP = 72;
const TH_BOT = 272;
const T_LO = 200;
const T_HI = 320;

const celsius = (k: number) => {
  const c = Math.round(k - 273.15);
  return `${c < 0 ? `−${-c}` : c} °C`;
};

/** An upward band from y0 to y1 (y1 < y0) with an arrowhead, in `color`. */
function UpBand({
  x,
  w,
  y0,
  y1,
  color,
  wavy,
}: {
  x: number;
  w: number;
  y0: number;
  y1: number;
  color: string;
  wavy?: boolean;
}) {
  if (w < 0.6) return null;
  const head = Math.min(14, (y0 - y1) * 0.4);
  const n = Math.max(2, Math.round((y0 - y1 - head) / 14));
  let d = `M ${x + w / 2} ${y0}`;
  for (let i = 0; i < n; i++) {
    const ya = y0 - ((i + 0.5) * (y0 - y1 - head)) / n;
    const yb = y0 - ((i + 1) * (y0 - y1 - head)) / n;
    d += ` Q ${x + w / 2 + (i % 2 ? -4 : 4)} ${ya.toFixed(1)} ${x + w / 2} ${yb.toFixed(1)}`;
  }
  return (
    <G>
      <Rect x={x} y={y1 + head} width={w} height={y0 - y1 - head} fill={color} opacity={0.35} />
      <Path
        d={`M ${x - 4} ${y1 + head} L ${x + w / 2} ${y1} L ${x + w + 4} ${y1 + head} Z`}
        fill={color}
        opacity={0.7}
      />
      {wavy ? <Path d={d} stroke={color} strokeWidth={2} fill="none" /> : null}
    </G>
  );
}

/** A downward band from y0 to y1 (y1 > y0) with an arrowhead. */
function DownBand({
  x,
  w,
  y0,
  y1,
  color,
  opacity = 1,
}: {
  x: number;
  w: number;
  y0: number;
  y1: number;
  color: string;
  opacity?: number;
}) {
  if (w < 0.6) return null;
  const head = Math.min(14, (y1 - y0) * 0.4);
  return (
    <G opacity={opacity}>
      <Rect x={x} y={y0} width={w} height={y1 - y0 - head} fill={color} />
      <Path
        d={`M ${x - 4} ${y1 - head} L ${x + w / 2} ${y1} L ${x + w + 4} ${y1 - head} Z`}
        fill={color}
      />
    </G>
  );
}

export function BalanceLayer({ spec, calc }: { spec: BalanceLayerSpec; calc: Calculator }) {
  const c = usePalette();
  const ids = usePaintIds('sun', 'soil');
  const { num, label, say } = useHe4g(calc);
  const s = spec.sunlight === undefined ? SOLAR_CONSTANT : num(spec.sunlight);
  const a = num(spec.albedo);
  const eps = num(spec.layer.emissivity);
  const ok = s !== undefined && s > 0 && a !== undefined && a >= 0 && a <= 1 && eps !== undefined;
  const e = Math.max(0, Math.min(1, eps ?? 0));
  const f = ok ? absorbedOf(s, a) : 0;
  const te = balanceTemp(f);
  const b = layerBudget(f, e);
  const inflow = ok ? s / 4 : 0;
  const refl = inflow - f;
  const w = (x: number) => Math.max(0, x * PX);
  const tY = (k: number) =>
    TH_BOT - ((Math.max(T_LO, Math.min(T_HI, k)) - T_LO) / (T_HI - T_LO)) * (TH_BOT - TH_TOP);
  const n0 = (x: number) => (ok ? fmt(x, 4) : '?');
  // Band x positions: sunlight, the reflected part curling back up, the ground's infrared and
  // the part that escapes, the layer's two halves.
  const wIn = w(inflow);
  const wF = w(f);
  const wR = w(refl);
  const rx1 = IN_X + wF + wR / 2;
  const rx2 = rx1 + wR + 10;
  const wG = w(b.ground);
  const wPass = w(b.through);
  const wHalf = w(b.half);
  const tsText = label(spec.layer.surface, 'T_s', b.surfaceTemp(te), 'K');
  // The thermometer's labels, kept off the layer's own label.
  const off = (y: number) =>
    y < LAYER_T + 2 || y > LAYER_B + 2
      ? y
      : y < (LAYER_T + LAYER_B) / 2
        ? LAYER_T - 4
        : LAYER_B + 14;
  const teY = off(tY(te) + 4);
  const tsY0 = Math.min(off(tY(b.surfaceTemp(te)) + 4), teY - 16);
  const tsY = tsY0 > LAYER_T + 2 && tsY0 < LAYER_B + 2 ? LAYER_T - 4 : tsY0;
  const teText = label(spec.temperature, 'Tₑ', te, 'K');

  const lines = ok
    ? [
        `F = S(1 − α) ÷ 4 = ${say(spec.sunlight, s)} × (1 − ${say(spec.albedo, a)}) ÷ 4 = ${say(spec.absorbed, f)} W/m², so Tₑ = (F ÷ σ)^(1/4) = ${say(spec.temperature, te)} K.`,
        `The layer absorbs ε = ${say(spec.layer.emissivity, e)} of the ground’s infrared and sends half back down, so Tₛ = Tₑ(2 ÷ (2 − ε))^(1/4) = ${fmt(te)} × ${fmt((2 / (2 - e)) ** 0.25)} = ${say(spec.layer.surface, b.surfaceTemp(te))} K (${celsius(b.surfaceTemp(te))}).`,
        `At the top ${fmt(b.through)} + ${fmt(b.half)} = ${fmt(f)} W/m² goes out, as much as comes in.`,
      ]
    : ['Type the sunlight, the albedo and the layer’s emissivity to balance the energy.'];

  return (
    <View>
      <Canvas aspect={BH / BW}>
        {({ w: cw, h }) => {
          const k = cw / BW;
          return (
            <Svg width={cw} height={h}>
              <Defs>
                <Ball id={ids.sun} color={c.sunDisk} />
                <Deepen id={ids.soil} from={c.soil} to={c.soilDark} />
              </Defs>
              <G transform={`scale(${k})`}>
                {/* Space, the air with its layer, the ground. */}
                <Rect x={0} y={0} width={BW} height={SPACE_B} fill={c.space} />
                <Rect x={0} y={SPACE_B} width={BW} height={GROUND - SPACE_B} fill={c.airBand} />
                <Rect
                  x={0}
                  y={LAYER_T}
                  width={BW}
                  height={LAYER_B - LAYER_T}
                  fill={c.he4gLayer}
                  opacity={0.85}
                />
                <Rect x={0} y={GROUND} width={BW} height={BH - GROUND} fill={url(ids.soil)} />
                <Path d={`M 0 ${GROUND} H ${BW}`} stroke={c.landGrass} strokeWidth={4} />
                <Circle cx={22} cy={22} r={13} fill={url(ids.sun)} />
                <ChartText x={42} y={18} fontSize={chart.label} fill={c.moonLit}>
                  sunlight
                </ChartText>
                <ChartText x={IR_X + 34} y={18} fontSize={chart.label} fill={c.moonLit}>
                  infrared
                </ChartText>
                <ChartText x={218} y={LAYER_T + 21} fontSize={chart.label} fontWeight="700">
                  {`layer, ε = ${ok ? fmt(e, 3) : '?'}`}
                </ChartText>
                <ChartText
                  x={8}
                  y={BH - 10}
                  fontSize={chart.label}
                  fill={c.moonLit}
                  fontWeight="700"
                >
                  numbers in W/m²
                </ChartText>
                <G opacity={ok ? 1 : 0.35}>
                  {/* Sunlight in, to the split; F on through the layer into the ground. */}
                  <DownBand x={IN_X} w={wIn} y0={34} y1={SPLIT} color={c.sunRay} />
                  <Rect x={IN_X} y={SPLIT - 15} width={wIn} height={16} fill={c.sunRay} />
                  <DownBand x={IN_X} w={wF} y0={SPLIT} y1={GROUND + 6} color={c.sunRay} />
                  {wR > 0.6 ? (
                    <G>
                      <Path
                        d={`M ${rx1} ${SPLIT} A ${(rx2 - rx1) / 2} ${(rx2 - rx1) / 2} 0 0 0 ${rx2} ${SPLIT} L ${rx2} ${SPACE_B - 10}`}
                        stroke={c.sunDisk}
                        strokeWidth={wR}
                        fill="none"
                      />
                      <Path
                        d={`M ${rx2 - wR / 2 - 4} ${SPACE_B - 10} L ${rx2} ${SPACE_B - 24} L ${rx2 + wR / 2 + 4} ${SPACE_B - 10} Z`}
                        fill={c.sunDisk}
                      />
                    </G>
                  ) : null}
                  {/* The ground's infrared up to the layer; the share 1 − ε on to space. */}
                  <UpBand x={IR_X} w={wG} y0={GROUND} y1={LAYER_B - 2} color={c.spectrumRed} wavy />
                  <UpBand
                    x={IR_X + (wG - wPass) / 2}
                    w={wPass}
                    y0={LAYER_T}
                    y1={30}
                    color={c.spectrumRed}
                    wavy
                  />
                  {/* The layer's own infrared, half up and half down. */}
                  <UpBand x={LAY_X} w={wHalf} y0={LAYER_T} y1={30} color={c.spectrumRed} wavy />
                  <DownBand
                    x={LAY_X}
                    w={wHalf}
                    y0={LAYER_B}
                    y1={GROUND + 6}
                    color={c.spectrumRed}
                    opacity={0.55}
                  />
                  {/* The numbers on the bands. */}
                  <HaloText
                    x={IN_X + wIn / 2}
                    y={52}
                    text={n0(inflow)}
                    c={c}
                    size={chart.label}
                    bold
                  />
                  {wR > 0.6 ? (
                    <HaloText
                      x={rx2}
                      y={SPLIT - 22}
                      text={n0(refl)}
                      c={c}
                      size={chart.label}
                      bold
                    />
                  ) : null}
                  <HaloText
                    x={IN_X + wF / 2}
                    y={GROUND - 18}
                    text={n0(f)}
                    c={c}
                    size={chart.label}
                    bold
                  />
                  <HaloText
                    x={IR_X + wG / 2}
                    y={GROUND - 30}
                    text={n0(b.ground)}
                    c={c}
                    size={chart.label}
                    bold
                    fill={c.spectrumRed}
                  />
                  <HaloText
                    x={IR_X + wG / 2}
                    y={LAYER_B + 16}
                    text={`${n0(b.absorbed)} in`}
                    c={c}
                    size={chart.label}
                    fill={c.spectrumRed}
                  />
                  {wPass > 0.6 ? (
                    <HaloText
                      x={IR_X + wG / 2}
                      y={LAYER_T - 22}
                      text={n0(b.through)}
                      c={c}
                      size={chart.label}
                      bold
                      fill={c.spectrumRed}
                    />
                  ) : null}
                  {wHalf > 0.6 ? (
                    <G>
                      <HaloText
                        x={LAY_X + wHalf / 2}
                        y={LAYER_T - 22}
                        text={n0(b.half)}
                        c={c}
                        size={chart.label}
                        bold
                        fill={c.spectrumRed}
                      />
                      <HaloText
                        x={LAY_X + wHalf / 2}
                        y={GROUND - 18}
                        text={n0(b.half)}
                        c={c}
                        size={chart.label}
                        bold
                        fill={c.spectrumRed}
                      />
                    </G>
                  ) : null}
                </G>
                {/* Out at the top: the sum of what escapes equals F. */}
                <HaloText
                  x={218}
                  y={SPACE_B - 26}
                  text={`out: ${n0(b.through + b.half)}`}
                  c={c}
                  size={chart.label}
                  bold
                  anchor="start"
                />
                {/* The thermometer: T_s, with Tₑ marked. */}
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
                  y={tY(b.surfaceTemp(te))}
                  width={6}
                  height={TH_BOT + 10 - tY(b.surfaceTemp(te))}
                  fill={c.mercury}
                  opacity={ok ? 1 : 0.35}
                />
                <Circle
                  cx={TH_X}
                  cy={TH_BOT + 14}
                  r={9}
                  fill={c.mercury}
                  stroke={c.chartInk}
                  strokeWidth={1}
                />
                {ok ? (
                  <G>
                    <Line
                      x1={TH_X - 12}
                      y1={tY(te)}
                      x2={TH_X + 12}
                      y2={tY(te)}
                      stroke={c.chartInk}
                      strokeWidth={1.5}
                      strokeDasharray={chart.dashFine}
                    />
                    {teText ? (
                      <HaloText
                        x={TH_X - 14}
                        y={teY}
                        text={teText}
                        c={c}
                        size={chart.label}
                        anchor="end"
                      />
                    ) : null}
                    {tsText ? (
                      <HaloText
                        x={TH_X - 14}
                        y={tsY}
                        text={tsText}
                        c={c}
                        size={chart.label}
                        bold
                        anchor="end"
                      />
                    ) : null}
                  </G>
                ) : null}
                {[220, 260, 300].map((kv) => (
                  <G key={kv}>
                    <Line
                      x1={TH_X + 6}
                      y1={tY(kv)}
                      x2={TH_X + 10}
                      y2={tY(kv)}
                      stroke={c.chartInk}
                    />
                    <ChartText x={TH_X + 13} y={tY(kv) + 4} fontSize={chart.label}>
                      {String(kv)}
                    </ChartText>
                  </G>
                ))}
              </G>
            </Svg>
          );
        }}
      </Canvas>
      <Caption>{lines.join(' ')}</Caption>
    </View>
  );
}

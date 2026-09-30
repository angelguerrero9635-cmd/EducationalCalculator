import { useRef } from 'react';
import { View } from 'react-native';
import Svg, { Circle, ClipPath, Defs, G, Line, Path, Rect } from 'react-native-svg';

import type { HabitableZoneSpec } from '@/data/modules/typesHs3c';
import { formatNumber } from '@/engine/format';
import { chart, usePalette, type Palette } from '@/theme';

import { HaloText } from '../layouts/earthKit';
import type { Calculator } from '../useCalculator';
import { Canvas, Caption, ChartText, DragHandle, fitLabel, useFrozen, useRep } from './common';
import { Ball, url, usePaintIds } from './paint';
import { planetTemp, zoneInner, zoneOuter } from './spaceHs3c';

const BW = 356;
const BH = 262;
/** The view from above: a patch of sky with the star at its left edge. */
const PX0 = 8;
const PX1 = 348;
const PY0 = 8;
const PY1 = 206;
const SX = 30;
const SY = 118;
const AXIS = 222;

const round = (x: number, n = 3) => Number(x.toPrecision(n));

/** A tick step of 1, 2 or 5 × 10ⁿ giving at most `most` steps over `span`. */
const tickStep = (span: number, most: number) => {
  const raw = span / most;
  const pow = 10 ** Math.floor(Math.log10(raw));
  const n = raw / pow;
  return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10) * pow;
};

/** The star's colour on the main sequence: dim stars red, bright ones blue-white. */
const starColor = (c: Palette, L: number) =>
  L < 0.05
    ? c.starRed
    : L < 0.5
      ? c.starOrange
      : L < 3
        ? c.starYellow
        : L < 25
          ? c.starWhite
          : c.starBlue;

/** A ring between radii r1 and r2 round the star (even-odd fill). */
const ring = (r1: number, r2: number) =>
  [r2, r1]
    .filter((r) => r > 0)
    .map(
      (r) =>
        `M ${SX - r} ${SY} A ${r} ${r} 0 1 0 ${SX + r} ${SY} A ${r} ${r} 0 1 0 ${SX - r} ${SY} Z`,
    )
    .join(' ');

/** A star's habitable zone and a planet's orbit, from above (HabitableZoneSpec). */
export function HabitableZone({ spec, calc }: { spec: HabitableZoneSpec; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  const ids = usePaintIds('clip', 'star', 'planet');
  const known = (x: number | string | undefined) =>
    x !== undefined && (typeof x === 'number' || rep.known(x));
  const num = (x: number | string | undefined, d: number) =>
    x === undefined ? d : typeof x === 'number' ? x : rep.val(x);
  const L = Math.max(1e-6, num(spec.luminosity, 1));
  const on = known(spec.luminosity);
  const d1 = known(spec.inner) ? num(spec.inner, 0) : zoneInner(L);
  const d2 = known(spec.outer) ? num(spec.outer, 0) : zoneOuter(L);
  const has = spec.orbit !== undefined;
  const a = Math.max(1e-6, num(spec.orbit, 1));
  const onA = has && known(spec.orbit);
  const T = known(spec.temperature) ? num(spec.temperature, 0) : planetTemp(L, a);
  // The scale: the farther of the zone's edge and the orbit fills the width (held during a drag).
  const scale = useFrozen((PX1 - SX - 22) / (Math.max(d2, has ? a : 0) * 1.08));
  const s = scale.value;
  const X = (au: number) => SX + au * s;
  const [r1, r2] = [d1 * s, d2 * s];
  const step = tickStep((PX1 - SX) / s, 5);
  const ticks = Array.from(
    { length: Math.floor((PX1 - SX) / s / step + 1e-9) + 1 },
    (_, i) => i * step,
  );
  const rs = Math.max(4, Math.min(18, 9 * L ** 0.15));
  const where = a < d1 ? 'hot' : a > d2 ? 'cold' : 'in';
  const text = (x: number | string | undefined, fallback: string) =>
    typeof x === 'string' && rep.known(x) ? rep.named(x) : fallback;
  const d1Text = text(spec.inner, `d₁ = ${formatNumber(round(d1))} AU`);
  const d2Text = text(spec.outer, `d₂ = ${formatNumber(round(d2))} AU`);
  const aText = text(spec.orbit, `a = ${formatNumber(round(a))} AU`);
  const TText = text(spec.temperature, `T = ${formatNumber(round(T))} K`);
  const zoneLabel = `${d1Text} to ${d2Text}`;
  const zoneAt = fitLabel((X(d1) + X(d2)) / 2, zoneLabel, chart.label, PX1 - 4);
  const planetId = typeof spec.orbit === 'string' && !spec.fixed ? spec.orbit : undefined;
  const start = useRef(a);

  return (
    <View>
      <Canvas aspect={BH / BW}>
        {({ w, h }) => {
          const k = w / BW;
          return (
            <>
              <Svg width={w} height={h}>
                <Defs>
                  <ClipPath id={ids.clip}>
                    <Rect x={PX0} y={PY0} width={PX1 - PX0} height={PY1 - PY0} rx={8} />
                  </ClipPath>
                  <Ball id={ids.star} color={starColor(c, L)} />
                  <Ball id={ids.planet} color={c.planetNeptune} />
                </Defs>
                <G transform={`scale(${k})`}>
                  <Rect
                    x={PX0}
                    y={PY0}
                    width={PX1 - PX0}
                    height={PY1 - PY0}
                    rx={8}
                    fill={c.space}
                  />
                  <G clipPath={url(ids.clip)} opacity={on ? 1 : 0.45}>
                    {/* Too hot inside the zone, too cold beyond it (faint), the zone green. */}
                    <Circle cx={SX} cy={SY} r={r1} fill={c.zoneHot} opacity={0.22} />
                    <Path d={ring(r2, 2000)} fill={c.zoneCold} opacity={0.16} fillRule="evenodd" />
                    <Path
                      d={ring(r1, r2)}
                      fill={c.zoneHabitable}
                      opacity={0.75}
                      fillRule="evenodd"
                    />
                    {has ? (
                      <Circle
                        cx={SX}
                        cy={SY}
                        r={a * s}
                        fill="none"
                        stroke={c.starWhite}
                        strokeOpacity={0.8}
                        strokeWidth={1.2}
                        strokeDasharray={chart.dash}
                      />
                    ) : null}
                  </G>
                  <Circle cx={SX} cy={SY} r={rs} fill={url(ids.star)} />
                  {r1 > 64 ? (
                    <ChartText
                      x={SX + r1 / 2 + rs / 2}
                      y={SY + 44}
                      fontSize={chart.label}
                      textAnchor="middle"
                      fill={c.starWhite}
                    >
                      too hot
                    </ChartText>
                  ) : null}
                  {PX1 - X(d2) > 70 ? (
                    <ChartText
                      x={(X(d2) + PX1) / 2}
                      y={SY + 44}
                      fontSize={chart.label}
                      textAnchor="middle"
                      fill={c.starWhite}
                    >
                      too cold
                    </ChartText>
                  ) : null}
                  <HaloText
                    x={zoneAt.x}
                    y={PY1 - 14}
                    text={zoneLabel}
                    c={c}
                    size={chart.label}
                    bold
                    anchor={zoneAt.textAnchor}
                  />
                  <HaloText
                    x={PX0 + 8}
                    y={PY0 + 20}
                    text={`star ${text(spec.luminosity, `L = ${formatNumber(L)} L☉`)} (not to scale)`}
                    c={c}
                    size={chart.label}
                    anchor="start"
                  />
                  {has ? (
                    <G opacity={onA ? 1 : 0.45}>
                      <Circle
                        cx={X(a)}
                        cy={SY}
                        r={6}
                        fill={url(ids.planet)}
                        stroke={c.starWhite}
                        strokeWidth={1}
                      />
                      {(() => {
                        const at1 = fitLabel(X(a), aText, chart.label, PX1 - 4);
                        const at2 = fitLabel(X(a), TText, chart.label, PX1 - 4);
                        return (
                          <>
                            <HaloText
                              x={at1.x}
                              y={SY - 32}
                              text={aText}
                              c={c}
                              size={chart.label}
                              bold
                              anchor={at1.textAnchor}
                            />
                            <HaloText
                              x={at2.x}
                              y={SY - 50}
                              text={TText}
                              c={c}
                              size={chart.label}
                              bold
                              anchor={at2.textAnchor}
                            />
                          </>
                        );
                      })()}
                    </G>
                  ) : null}
                  {/* Distance from the star, to the same scale. */}
                  <Line
                    x1={SX}
                    y1={AXIS}
                    x2={PX1}
                    y2={AXIS}
                    stroke={c.chartInk}
                    strokeWidth={1.2}
                  />
                  {ticks.map((t) => (
                    <G key={t}>
                      <Line x1={X(t)} y1={AXIS} x2={X(t)} y2={AXIS + 5} stroke={c.chartInk} />
                      <ChartText
                        x={X(t)}
                        y={AXIS + 19}
                        fontSize={chart.label}
                        textAnchor="middle"
                        fill={c.chartMuted}
                      >
                        {formatNumber(round(t, 6))}
                      </ChartText>
                    </G>
                  ))}
                  <ChartText
                    x={PX1}
                    y={AXIS + 36}
                    fontSize={chart.label}
                    textAnchor="end"
                    fill={c.chartMuted}
                  >
                    AU from the star
                  </ChartText>
                </G>
              </Svg>
              {planetId && onA ? (
                <DragHandle
                  testID="drag-orbit"
                  x={X(a) * k}
                  y={SY * k}
                  label="the planet's orbit"
                  onStart={() => {
                    start.current = a;
                    scale.freeze();
                  }}
                  onEnd={scale.release}
                  onMove={(dx) => {
                    const au = Math.max(1e-6, start.current + dx / k / s);
                    calc.set({ [planetId]: rep.snapTo(planetId, au) }, rep.slide(planetId));
                  }}
                />
              ) : null}
            </>
          );
        }}
      </Canvas>
      <Caption>
        {!on
          ? 'Type the star’s luminosity to draw its habitable zone.'
          : `The zone runs from 0.95 × √${formatNumber(L)} = ${formatNumber(round(d1))} AU to 1.37 × √${formatNumber(L)} = ${formatNumber(round(d2))} AU.${
              has && onA
                ? ` At ${formatNumber(round(a))} AU the planet is ${
                    where === 'in'
                      ? 'inside the zone'
                      : where === 'hot'
                        ? 'nearer than the zone: too hot'
                        : 'beyond the zone: too cold'
                  }, T = 278 × ${formatNumber(L)}^(1/4) ÷ √${formatNumber(round(a))} = ${formatNumber(round(T))} K.`
                : ''
            }`}
      </Caption>
    </View>
  );
}

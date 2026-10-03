/**
 * HC123 `atmosphereLayers` mode `saturation` (typesHe4g.ts): Tetens' saturation vapor pressure
 * e_s(T) from −40 to 50 °C, the air's point (T, e), up to the curve for e_s at T and across to
 * the curve at the dew point (e_s(T_d) = e). RH = e ÷ e_s; with a pressure, r = 622e ÷ (p − e).
 * Drag the air's point for T and the dew point along the curve.
 */
import { useRef } from 'react';
import { View } from 'react-native';
import Svg, { ClipPath, Circle, Defs, G, Line, Path, Rect } from 'react-native-svg';

import type { AtmosphereSaturationSpec } from '@/data/modules/typesHe4g';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, Caption, ChartText, DragHandle } from './common';
import { fmt, Tag, tagW } from './he2fKit';
import { useHe4g } from './he4gKit';
import { mixingOf, TETENS, tetensOf, tickStep } from './he4gMath';
import { url, usePaintIds } from './paint';

const BW = 360;
const BH = 290;
const L = 50;
const R = 344;
const TOP = 30;
const BASE = 246;
const T_LO = -40;
const T_HI = 50;

const neg = (x: string) => x.replace(/^-/, '−');

export function AtmosphereSaturation({
  spec,
  calc,
}: {
  spec: AtmosphereSaturationSpec;
  calc: Calculator;
}) {
  const c = usePalette();
  const ids = usePaintIds('plot');
  const { rep, num, label, setOne, say } = useHe4g(calc);
  const start = useRef(0);
  const co = spec.coefficients ?? TETENS;
  const t = num(spec.temperature);
  const td0 = num(spec.dewPoint);
  const td = t !== undefined && td0 !== undefined ? Math.min(t, td0) : td0;
  const es = t !== undefined ? tetensOf(t, co) : undefined;
  const e = td !== undefined ? tetensOf(td, co) : undefined;
  const ok = es !== undefined && e !== undefined;
  const rh = ok ? (100 * e) / es : undefined;
  const p = num(spec.pressure);
  const r = e !== undefined && p !== undefined && p > e ? mixingOf(e, p) : undefined;
  // e up to a round value above e_s(T) (the curve runs off the top past it).
  const eMax0 = Math.max(1, (es ?? tetensOf(25, co)) * 1.35);
  const eStep = tickStep(eMax0, 5);
  const eTop = Math.ceil(eMax0 / eStep) * eStep;
  const X = (x: number) => L + ((x - T_LO) / (T_HI - T_LO)) * (R - L);
  const Y = (y: number) => BASE - (y / eTop) * (BASE - TOP);
  const curve = Array.from({ length: 91 }, (_, i) => {
    const x = T_LO + i;
    return `${i ? 'L' : 'M'} ${X(x).toFixed(1)} ${Y(tetensOf(x, co)).toFixed(1)}`;
  }).join(' ');
  const eTicks = Array.from({ length: Math.round(eTop / eStep) + 1 }, (_, i) =>
    Number((i * eStep).toPrecision(6)),
  );

  const tText = label(spec.temperature, 'T', t, '°C');
  const tdText = label(spec.dewPoint, 'T_d', td, '°C');
  const esText = label(spec.saturation, 'e_s', es, 'hPa');
  const eText = label(spec.vapor, 'e', e, 'hPa');
  const tVar = typeof spec.temperature === 'string' ? spec.temperature : undefined;
  const tdVar = typeof spec.dewPoint === 'string' ? spec.dewPoint : undefined;
  const keep = [spec.temperature, spec.dewPoint, spec.pressure];
  // The labels: eₛ beside the curve's point, T_d by the dew point, e right of the
  // air's point (or under the line across when there is no room) and T under it.
  const eRight = ok && X(t!) + 14 + tagW(eText ?? '') < R;
  // T_d goes above-left of the dew point while it clears the axis numbers, else at the foot of its line.
  const tdLeft = !ok || X(td!) - 8 - tagW(tdText ?? '') > L + 4;

  const lines: string[] = [];
  if (!ok) lines.push('Type the temperature and the dew point to place the air.');
  else {
    const a = fmt(co[0]);
    lines.push(
      `eₛ = ${a}e^(${fmt(co[1])}T ÷ (T + ${fmt(co[2])})) = ${say(spec.saturation, es!)} hPa at ${say(spec.temperature, t!)} °C; at the dew point ${say(spec.dewPoint, td!)} °C it is e = ${say(spec.vapor, e!)} hPa.`,
      `RH = 100e ÷ eₛ = 100 × ${fmt(e!)} ÷ ${fmt(es!)} = ${say(spec.rh, rh!)} %.`,
    );
    if (r !== undefined)
      lines.push(
        `r = 622e ÷ (p − e) = 622 × ${fmt(e!)} ÷ (${say(spec.pressure, p!)} − ${fmt(e!)}) = ${say(spec.mixing, r)} g/kg.`,
      );
    if (td0 !== undefined && t !== undefined && td0 > t)
      lines.push('The dew point can’t be above the temperature: drawn at T.');
  }

  return (
    <View>
      <Canvas aspect={BH / BW}>
        {({ w, h: ch }) => {
          const s = w / BW;
          return (
            <>
              <Svg width={w} height={ch}>
                <Defs>
                  <ClipPath id={ids.plot}>
                    <Rect x={L} y={TOP} width={R - L} height={BASE - TOP} />
                  </ClipPath>
                </Defs>
                <G transform={`scale(${s})`}>
                  <Line
                    x1={10}
                    y1={12}
                    x2={30}
                    y2={12}
                    stroke={c.lineSum}
                    strokeWidth={chart.strokeHeavy}
                  />
                  <ChartText x={35} y={16} fontSize={chart.label} fill={c.chartMuted}>
                    e_s(T): the most vapor the air can hold
                  </ChartText>
                  {eTicks.map((y) => (
                    <G key={`e${y}`}>
                      <Line x1={L} y1={Y(y)} x2={R} y2={Y(y)} stroke={c.chartGrid} />
                      <ChartText
                        x={L - 5}
                        y={Y(y) + 4}
                        fontSize={chart.label}
                        textAnchor="end"
                        fill={c.chartMuted}
                      >
                        {fmt(y)}
                      </ChartText>
                    </G>
                  ))}
                  {[-40, -20, 0, 20, 40].map((x) => (
                    <G key={`t${x}`}>
                      <Line x1={X(x)} y1={TOP} x2={X(x)} y2={BASE} stroke={c.chartGrid} />
                      <ChartText
                        x={X(x)}
                        y={BASE + 16}
                        fontSize={chart.label}
                        textAnchor="middle"
                        fill={c.chartMuted}
                      >
                        {neg(String(x))}
                      </ChartText>
                    </G>
                  ))}
                  <Path
                    d={`M ${L} ${TOP} V ${BASE} H ${R}`}
                    stroke={c.chartInk}
                    strokeWidth={1.5}
                    fill="none"
                  />
                  <ChartText
                    x={(L + R) / 2}
                    y={BASE + 34}
                    fontSize={chart.label}
                    textAnchor="middle"
                    fill={c.chartMuted}
                  >
                    Temperature, °C
                  </ChartText>
                  <ChartText
                    x={12}
                    y={(TOP + BASE) / 2}
                    fontSize={chart.label}
                    textAnchor="middle"
                    fill={c.chartMuted}
                    transform={`rotate(-90 12 ${(TOP + BASE) / 2})`}
                  >
                    Vapor pressure, hPa
                  </ChartText>
                  <G clipPath={url(ids.plot)}>
                    <Path
                      d={curve}
                      stroke={c.lineSum}
                      strokeWidth={chart.strokeHeavy}
                      fill="none"
                    />
                  </G>
                  {ok ? (
                    <G>
                      {/* Up from the air to the curve: e_s at T. */}
                      <Line
                        x1={X(t!)}
                        y1={Y(e!)}
                        x2={X(t!)}
                        y2={Y(es!)}
                        stroke={c.lineSum}
                        strokeWidth={1.5}
                        strokeDasharray={chart.dash}
                      />
                      {/* Across at the same e to the curve: the dew point. */}
                      <Line
                        x1={X(td!)}
                        y1={Y(e!)}
                        x2={X(t!)}
                        y2={Y(e!)}
                        stroke={c.fnSecond}
                        strokeWidth={1.5}
                        strokeDasharray={chart.dash}
                      />
                      <Line
                        x1={X(td!)}
                        y1={Y(e!)}
                        x2={X(td!)}
                        y2={BASE}
                        stroke={c.fnSecond}
                        strokeWidth={1}
                        strokeDasharray={chart.dashFine}
                      />
                      <Circle cx={X(t!)} cy={Y(es!)} r={4.5} fill={c.lineSum} />
                      <Circle
                        cx={X(td!)}
                        cy={Y(e!)}
                        r={5}
                        fill={c.fnSecond}
                        stroke={c.card}
                        strokeWidth={1.5}
                      />
                      <Circle
                        cx={X(t!)}
                        cy={Y(e!)}
                        r={6}
                        fill={c.chartHighlight}
                        stroke={c.card}
                        strokeWidth={1.5}
                      />
                      {esText ? (
                        <Tag
                          x={X(t!) + 8}
                          y={Y(es!) + 4}
                          text={esText}
                          anchor="start"
                          color={c.lineSum}
                          w={BW}
                        />
                      ) : null}
                      {eText ? (
                        <Tag
                          x={eRight ? X(t!) + 10 : (X(td!) + X(t!)) / 2}
                          y={eRight ? Y(e!) + 4 : Math.min(BASE - 22, Y(e!) + 19)}
                          text={eText}
                          anchor={eRight ? 'start' : 'middle'}
                          color={c.chartHighlight}
                          w={BW}
                        />
                      ) : null}
                      {tText ? (
                        <Tag
                          x={X(t!)}
                          y={Math.min(BASE - 4, Y(e!) + (eRight ? 20 : 37))}
                          text={tText}
                          color={c.chartHighlight}
                          w={BW}
                        />
                      ) : null}
                      {tdText ? (
                        <Tag
                          x={tdLeft ? X(td!) - 8 : X(td!) + 6}
                          y={tdLeft ? Y(e!) - 8 : BASE - 8}
                          text={tdText}
                          anchor={tdLeft ? 'end' : 'start'}
                          color={c.fnSecond}
                          w={BW}
                        />
                      ) : null}
                      {rh !== undefined ? (
                        <Tag
                          x={L + 8}
                          y={TOP + 16}
                          text={label(spec.rh, 'RH', rh, '%') ?? ''}
                          anchor="start"
                          w={BW}
                        />
                      ) : null}
                    </G>
                  ) : null}
                </G>
              </Svg>
              {ok && !spec.fixed && tVar && rep.typed(tVar) ? (
                <DragHandle
                  x={X(t!) * s}
                  y={Y(e!) * s}
                  label="the air’s temperature"
                  onStart={() => {
                    start.current = t!;
                  }}
                  onMove={(dx) => {
                    const nt = start.current + ((dx / s) * (T_HI - T_LO)) / (R - L);
                    setOne(tVar, Math.max(td!, nt), keep);
                  }}
                />
              ) : null}
              {ok && !spec.fixed && tdVar && rep.typed(tdVar) ? (
                <DragHandle
                  x={X(td!) * s}
                  y={Y(e!) * s}
                  label="the dew point"
                  onStart={() => {
                    start.current = td!;
                  }}
                  onMove={(dx) => {
                    const nt = start.current + ((dx / s) * (T_HI - T_LO)) / (R - L);
                    setOne(tdVar, Math.min(t!, nt), keep);
                  }}
                />
              ) : null}
            </>
          );
        }}
      </Canvas>
      <Caption>{lines.join(' ')}</Caption>
    </View>
  );
}

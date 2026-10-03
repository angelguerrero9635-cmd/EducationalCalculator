/**
 * HC155 `heartPump` (HeartPumpSpec in typesHe4j.ts): the left ventricle in section, its cavity
 * filled to EDV and emptied to ESV with the stroke volume between them lit, on a mL scale whose
 * marks sit at their true levels for the cavity's shape; the aorta carrying blood out; a dial
 * gauge with the band from DBP to SBP, cut in thirds, its needle at MAP; and a minute under them,
 * one tick a beat and the liters pumped. The heart and the gauge are painted; the minute is flat.
 * No handles.
 */
import { View } from 'react-native';
import Svg, { Circle, Defs, G, Line, Path, Rect } from 'react-native-svg';

import type { HeartPumpSpec } from '@/data/modules/typesHe4j';
import { formatNumber } from '@/engine/format';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, Caption, ChartText, fitLabel, useRep } from './common';
import {
  DIAL_MAX,
  beatsDrawn,
  cavityCap,
  cavityLevel,
  dialAngle,
  inUnit,
  meanPressure,
  niceUp,
} from './he4jMath';
import { Metal, Sheen, TopLight, url, usePaintIds } from './paint';

const n3 = (x: number) => formatNumber(Number(x.toPrecision(3)));
/** A worked-out value to 3 significant figures, its zeros kept (19.0, 4.90); whole ones plain. */
const sig3 = (x: number) =>
  Number.isInteger(x) || Math.abs(x) >= 1000 || Math.abs(x) < 0.01
    ? n3(x)
    : x.toPrecision(3).replace('-', '−');

/** Cavity: half-width, height, base line, apex; wall thickness. */
const CX = 100;
const A = 34;
const H = 140;
const BASE = 52;
const APEX = BASE + H;
const WALL = 12;
/** Height of the top panel (heart and gauge). */
const TOP = 214;

export function HeartPump({ spec, calc }: { spec: HeartPumpSpec; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  const ids = usePaintIds('wall', 'rim', 'light');
  type V = number | string | undefined;
  /** A value in `unit` (a "?" or missing one is undefined). */
  const get = (v: V, unit: string): number | undefined => {
    if (v === undefined) return undefined;
    if (typeof v === 'number') return v;
    if (!rep.known(v)) return undefined;
    return inUnit(rep.val(v), rep.variable(v).unit, unit);
  };
  /** A value as the page shows it, with its unit. */
  const say = (v: V, x: number, unit: string) => {
    if (typeof v !== 'string' || !rep.known(v)) return `${n3(x)} ${unit}`;
    if (rep.typed(v)) return rep.value(v);
    // A worked-out value to 3 figures, as the picture's working shows it.
    const u = rep.unit(v);
    return `${sig3(rep.shown(v))}${u ? (u === '%' ? '%' : ` ${u}`) : ''}`;
  };
  const edv = get(spec.edv, 'mL');
  const esv = get(spec.esv, 'mL');
  const svGiven = get(spec.sv, 'mL');
  const sv = svGiven ?? (edv !== undefined && esv !== undefined ? edv - esv : undefined);
  const hr = get(spec.hr, 'min⁻¹');
  const coGiven = get(spec.co, 'L/min');
  const co = coGiven ?? (hr !== undefined && sv !== undefined ? (hr * sv) / 1000 : undefined);
  const sbp = get(spec.sbp, 'mmHg');
  const dbp = get(spec.dbp, 'mmHg');
  const mapGiven = get(spec.map, 'mmHg');
  const map =
    mapGiven ?? (sbp !== undefined && dbp !== undefined ? meanPressure(sbp, dbp) : undefined);
  const hasVolumes = spec.edv !== undefined || spec.esv !== undefined;
  const hasGauge = spec.sbp !== undefined || spec.dbp !== undefined || spec.map !== undefined;
  const hasMinute = spec.hr !== undefined || spec.co !== undefined;
  const bad = edv !== undefined && esv !== undefined && esv > edv;
  const cap = cavityCap(Math.max(edv ?? 0, esv ?? 0, sv ?? 0));

  // The caption: each relation the picture shows, with the page's numbers.
  const lines: string[] = [];
  if (bad)
    lines.push('ESV is more than EDV: the ventricle cannot end a beat fuller than it began.');
  else if (edv !== undefined && esv !== undefined) {
    lines.push(
      `SV = EDV − ESV = ${say(spec.edv, edv, 'mL')} − ${say(spec.esv, esv, 'mL')} = ${say(spec.sv, edv - esv, 'mL')}.`,
    );
    if (spec.ef !== undefined && get(spec.ef, '%') !== undefined)
      lines.push(`EF = SV ÷ EDV = ${say(spec.ef, 0, '%')}.`);
  }
  if (hr !== undefined && sv !== undefined)
    lines.push(
      `CO = HR × SV = ${say(spec.hr, hr, 'per min')} × ${say(spec.sv, sv, 'mL')} = ${say(spec.co, co!, 'L/min')}.`,
    );
  if (sbp !== undefined && dbp !== undefined)
    lines.push(
      `MAP = DBP + (SBP − DBP) ÷ 3 = ${n3(dbp)} + ${n3(sbp - dbp)} ÷ 3 = ${say(spec.map, map!, 'mmHg')}.`,
    );
  if (sbp !== undefined && dbp !== undefined && dbp >= sbp)
    lines.push('DBP is not below SBP, so the gauge draws no band.');
  else if (sbp !== undefined && sbp > DIAL_MAX)
    lines.push(`SBP is past the gauge’s ${DIAL_MAX} mmHg.`);
  if (hr !== undefined && hr > 250) lines.push('The minute shows the first 250 beats.');
  if (spec.tpr !== undefined && typeof spec.tpr === 'string' && rep.known(spec.tpr))
    lines.push(`TPR = MAP ÷ CO = ${say(spec.tpr, 0, '')}.`);
  if (!lines.length)
    lines.push('Type the values to fill the ventricle, count the beats and read the gauge.');

  /** The cavity's radius at height share s, and its y. */
  const rAt = (s: number) => A * Math.sqrt(Math.max(0, 2 * s - s * s));
  const yAt = (s: number) => APEX - s * H;
  /** The cavity's outline from the apex up to share `top`, closed by a level line. */
  const cavityPath = (top: number, inset = 0) => {
    const n = 40;
    const right: string[] = [];
    const left: string[] = [];
    for (let i = 0; i <= n; i++) {
      const s = (top * i) / n;
      const r = Math.max(0, rAt(s) - inset);
      right.push(`${(CX + r).toFixed(1)},${yAt(s).toFixed(1)}`);
      left.unshift(`${(CX - r).toFixed(1)},${yAt(s).toFixed(1)}`);
    }
    return `M ${left.join(' L ')} L ${right.join(' L ')} Z`;
  };
  /** The wall: the same shape grown by the wall's thickness, open at the base. */
  const wallPath = (() => {
    const n = 40;
    const pts: string[] = [];
    for (let i = 0; i <= n; i++) {
      const s = i / n;
      const r = (A + WALL) * Math.sqrt(Math.max(0, 2 * s - s * s));
      const y = APEX + WALL + 2 - s * (H + WALL + 2);
      pts.push(`${(CX + r).toFixed(1)},${y.toFixed(1)}`);
    }
    const left = pts.map((p) => {
      const [x, y] = p.split(',').map(Number);
      return `${(2 * CX - x!).toFixed(1)},${y}`;
    });
    return `M ${left.reverse().join(' L ')} L ${pts.join(' L ')} Z`;
  })();

  const sEdv = edv !== undefined && !bad ? cavityLevel(edv / cap) : undefined;
  const sEsv = esv !== undefined && !bad ? cavityLevel(esv / cap) : undefined;
  const step = niceUp(cap / 6);
  const marks: number[] = [];
  for (let v = step; v < cap - 1e-9; v += step) marks.push(v);

  // Labels to the right of the heart, pushed apart to 15 px.
  const right: { y: number; text: string; color: string; bold?: boolean }[] = [];
  if (sEdv !== undefined)
    right.push({ y: yAt(sEdv), text: `EDV = ${say(spec.edv, edv!, 'mL')}`, color: c.chartInk });
  if (sEdv !== undefined && sEsv !== undefined)
    right.push({
      y: (yAt(sEdv) + yAt(sEsv)) / 2,
      text: `SV = ${say(spec.sv, edv! - esv!, 'mL')}`,
      color: c.organDeep,
      bold: true,
    });
  if (sEsv !== undefined)
    right.push({ y: yAt(sEsv), text: `ESV = ${say(spec.esv, esv!, 'mL')}`, color: c.chartInk });
  if (!hasVolumes && sv !== undefined)
    right.push({
      y: BASE + 30,
      text: `SV = ${say(spec.sv, sv, 'mL')}`,
      color: c.organDeep,
      bold: true,
    });
  for (let i = 1; i < right.length; i++) right[i]!.y = Math.max(right[i]!.y, right[i - 1]!.y + 15);
  for (let i = right.length - 2; i >= 0; i--)
    right[i]!.y = Math.min(right[i]!.y, right[i + 1]!.y - 15);

  const minuteH = hasMinute ? 118 : 0;
  return (
    <View>
      <Canvas aspect={(w) => (TOP + minuteH) / w}>
        {({ w }) => {
          const R = Math.min(56, Math.max(40, (w - 252) / 2));
          const gx = w - R - 6;
          const gy = R + 14;
          const polar = (p: number, r: number) => {
            const a = (dialAngle(p) * Math.PI) / 180;
            return [gx + r * Math.cos(a), gy + r * Math.sin(a)] as const;
          };
          const arc = (p0: number, p1: number, r: number) => {
            const [x0, y0] = polar(p0, r);
            const [x1, y1] = polar(p1, r);
            const large = dialAngle(p1) - dialAngle(p0) > 180 ? 1 : 0;
            return `M ${x0.toFixed(1)} ${y0.toFixed(1)} A ${r} ${r} 0 ${large} 1 ${x1.toFixed(1)} ${y1.toFixed(1)}`;
          };
          const L = 16;
          const W = w - 2 * L;
          const y1 = TOP + 34;
          const y2 = TOP + 82;
          const beats = hr !== undefined ? beatsDrawn(hr) : 0;
          const lmax = co !== undefined ? niceUp(Math.max(1, co)) : 1;
          const lstep = niceUp(lmax / 6);
          return (
            <Svg width={w} height={TOP + minuteH}>
              <Defs>
                <Sheen id={ids.wall} />
                <Metal id={ids.rim} light={c.silver} dark={c.silverDark} />
                <TopLight id={ids.light} />
              </Defs>
              {/* The aorta, rising from the base and arching off to the right. */}
              <Path
                d={`M ${CX + 6} ${BASE + 2} V ${BASE - 22} Q ${CX + 6} 12 ${CX + 34} 12 H ${CX + 62}`}
                stroke={c.profileWall}
                strokeWidth={22}
                fill="none"
              />
              <Path
                d={`M ${CX + 6} ${BASE + 2} V ${BASE - 22} Q ${CX + 6} 12 ${CX + 34} 12 H ${CX + 62}`}
                stroke={c.bloodCell}
                strokeWidth={14}
                fill="none"
              />
              <Path d={`M ${CX + 62} 4 L ${CX + 76} 12 L ${CX + 62} 20 Z`} fill={c.bloodCell} />
              {/* The wall (myocardium), lit from the top left, and the empty cavity. */}
              <Path d={wallPath} fill={c.he4jWall} />
              <Path d={wallPath} fill={url(ids.wall)} />
              <Path d={cavityPath(1)} fill={c.paper} stroke={c.organDeep} strokeWidth={1.5} />
              {/* Blood: everything below ESV dark, the stroke volume to EDV lit. */}
              {!hasVolumes && sv !== undefined ? (
                <Path d={cavityPath(1, 1)} fill={c.bloodCell} />
              ) : null}
              {sEdv !== undefined ? (
                <Path d={cavityPath(sEdv, 1)} fill={c.bloodCell} fillOpacity={0.42} />
              ) : null}
              {sEsv !== undefined ? <Path d={cavityPath(sEsv, 1)} fill={c.bloodCell} /> : null}
              {sEdv !== undefined ? (
                <Line
                  x1={CX - rAt(sEdv) - 4}
                  y1={yAt(sEdv)}
                  x2={CX + A + WALL + 4}
                  y2={yAt(sEdv)}
                  stroke={c.chartInk}
                  strokeWidth={chart.strokeLight}
                  strokeDasharray={chart.dash}
                />
              ) : null}
              {sEsv !== undefined ? (
                <Line
                  x1={CX - rAt(sEsv) - 4}
                  y1={yAt(sEsv)}
                  x2={CX + A + WALL + 4}
                  y2={yAt(sEsv)}
                  stroke={c.chartInk}
                  strokeWidth={chart.strokeLight}
                />
              ) : null}
              {/* The mitral valve's two leaflets on the left of the base; blood coming in. */}
              <Path
                d={`M ${CX - A + 2} ${BASE} L ${CX - 22} ${BASE + 12} M ${CX - 6} ${BASE} L ${CX - 14} ${BASE + 12}`}
                stroke={c.he4jMembrane}
                strokeWidth={2}
                strokeLinecap="round"
              />
              <Path
                d={`M ${CX - 18} ${BASE - 26} V ${BASE - 6} M ${CX - 23} ${BASE - 12} L ${CX - 18} ${BASE - 5} L ${CX - 13} ${BASE - 12}`}
                stroke={c.chartMuted}
                strokeWidth={chart.strokeLight}
                fill="none"
              />
              {/* The mL scale on the cavity's left wall, each mark at its true level. */}
              {hasVolumes
                ? marks.map((v) => {
                    const s = cavityLevel(v / cap);
                    const x = CX - rAt(s);
                    return (
                      <G key={v}>
                        <Line
                          x1={x}
                          y1={yAt(s)}
                          x2={x + 7}
                          y2={yAt(s)}
                          stroke={c.chartInk}
                          strokeWidth={1}
                        />
                        <ChartText
                          x={CX - A - WALL - 6}
                          y={yAt(s) + 4}
                          textAnchor="end"
                          fill={c.chartMuted}
                        >
                          {formatNumber(v)}
                        </ChartText>
                      </G>
                    );
                  })
                : null}
              {hasVolumes ? (
                <ChartText x={CX - A - WALL - 6} y={BASE - 2} textAnchor="end" fill={c.chartMuted}>
                  mL
                </ChartText>
              ) : null}
              {right.map((l) => (
                <ChartText
                  key={l.text}
                  x={CX + A + WALL + 8}
                  y={l.y + 4}
                  fill={l.color}
                  fontWeight={l.bold ? '700' : '400'}
                  halo
                >
                  {l.text}
                </ChartText>
              ))}

              {/* The gauge: a metal rim, the face, mmHg every 10 and labelled every 50. */}
              {hasGauge ? (
                <G>
                  <Circle cx={gx} cy={gy} r={R} fill={url(ids.rim)} />
                  <Circle cx={gx} cy={gy} r={R - 5} fill={c.paper} />
                  {Array.from({ length: DIAL_MAX / 10 + 1 }, (_, k) => {
                    const p = k * 10;
                    const long = p % 50 === 0;
                    const [xa, ya] = polar(p, R - 6);
                    const [xb, yb] = polar(p, R - (long ? 13 : 9));
                    return (
                      <Line
                        key={p}
                        x1={xa}
                        y1={ya}
                        x2={xb}
                        y2={yb}
                        stroke={c.chartInk}
                        strokeWidth={long ? 1.4 : 0.8}
                      />
                    );
                  })}
                  {[0, 100, 200, 300].map((p) => {
                    const [x, y] = polar(p, R - 23);
                    return (
                      <ChartText key={p} x={x} y={y + 4} textAnchor="middle" fill={c.chartMuted}>
                        {formatNumber(p)}
                      </ChartText>
                    );
                  })}
                  {sbp !== undefined && dbp !== undefined && sbp > dbp ? (
                    <G>
                      <Path
                        d={arc(dbp, sbp, R - 9)}
                        stroke={c.he4jBand}
                        strokeWidth={6}
                        fill="none"
                      />
                      {[1, 2].map((k) => {
                        const p = dbp + (k * (sbp - dbp)) / 3;
                        const [xa, ya] = polar(p, R - 13);
                        const [xb, yb] = polar(p, R - 5);
                        return (
                          <Line
                            key={k}
                            x1={xa}
                            y1={ya}
                            x2={xb}
                            y2={yb}
                            stroke={c.paper}
                            strokeWidth={1.5}
                          />
                        );
                      })}
                    </G>
                  ) : null}
                  {map !== undefined ? (
                    <Line
                      x1={gx}
                      y1={gy}
                      x2={polar(map, R - 10)[0]}
                      y2={polar(map, R - 10)[1]}
                      stroke={c.chartInk}
                      strokeWidth={2.2}
                      strokeLinecap="round"
                    />
                  ) : null}
                  <Circle cx={gx} cy={gy} r={4} fill={url(ids.rim)} />
                  <Circle cx={gx} cy={gy} r={R - 5} fill={url(ids.light)} />
                  <ChartText
                    {...fitLabel(gx, 'mmHg', chart.label, w)}
                    y={gy + R - 14}
                    fill={c.chartMuted}
                  >
                    mmHg
                  </ChartText>
                  {sbp !== undefined && dbp !== undefined ? (
                    <ChartText
                      {...fitLabel(gx, `${n3(sbp)}/${n3(dbp)}`, chart.value, w)}
                      y={gy + R + 16}
                      fontSize={chart.value}
                      fill={c.he4jBand}
                      fontWeight="700"
                    >
                      {`${n3(sbp)}/${n3(dbp)}`}
                    </ChartText>
                  ) : null}
                  {map !== undefined ? (
                    <ChartText
                      {...fitLabel(gx, `MAP = ${say(spec.map, map, 'mmHg')}`, chart.label, w)}
                      y={gy + R + 32}
                      fontWeight="700"
                    >
                      {`MAP = ${say(spec.map, map, 'mmHg')}`}
                    </ChartText>
                  ) : null}
                </G>
              ) : null}

              {/* One minute: a tick a beat, and the liters pumped in it. */}
              {hasMinute ? (
                <G>
                  <ChartText x={L} y={y1 - 16} fontWeight="700">
                    {hr !== undefined
                      ? `${formatNumber(beats)} beats in 1 min (HR = ${say(spec.hr, hr, 'per min')})`
                      : 'Beats in 1 min'}
                  </ChartText>
                  <Line
                    x1={L}
                    y1={y1}
                    x2={L + W}
                    y2={y1}
                    stroke={c.chartInk}
                    strokeWidth={chart.strokeLight}
                  />
                  {Array.from({ length: beats }, (_, k) => {
                    const x = L + ((k * 60) / hr! / 60) * W;
                    return (
                      <Line
                        key={k}
                        x1={x}
                        y1={y1 - 8}
                        x2={x}
                        y2={y1}
                        stroke={c.bloodCell}
                        strokeWidth={1.2}
                      />
                    );
                  })}
                  {[0, 30, 60].map((t) => (
                    <ChartText
                      key={t}
                      {...fitLabel(L + (t / 60) * W, `${t} s`, chart.label, w)}
                      y={y1 + 15}
                      fill={c.chartMuted}
                    >
                      {`${t} s`}
                    </ChartText>
                  ))}
                  <ChartText x={L} y={y2 - 8} fontWeight="700">
                    {co !== undefined
                      ? `Pumped in 1 min: CO = ${say(spec.co, co, 'L/min')}`
                      : 'Pumped in 1 min'}
                  </ChartText>
                  <Rect
                    x={L}
                    y={y2}
                    width={W}
                    height={12}
                    fill={c.chartFill}
                    stroke={c.chartInk}
                    strokeWidth={1}
                  />
                  {co !== undefined ? (
                    <Rect
                      x={L}
                      y={y2}
                      width={(Math.min(co, lmax) / lmax) * W}
                      height={12}
                      fill={c.bloodCell}
                    />
                  ) : null}
                  {Array.from({ length: Math.round(lmax / lstep) + 1 }, (_, k) => {
                    const v = k * lstep;
                    const x = L + (v / lmax) * W;
                    const text =
                      k === Math.round(lmax / lstep) ? `${formatNumber(v)} L` : formatNumber(v);
                    return (
                      <G key={k}>
                        <Line
                          x1={x}
                          y1={y2}
                          x2={x}
                          y2={y2 + 16}
                          stroke={c.chartInk}
                          strokeWidth={1}
                        />
                        <ChartText
                          {...fitLabel(x, text, chart.label, w)}
                          y={y2 + 29}
                          fill={c.chartMuted}
                        >
                          {text}
                        </ChartText>
                      </G>
                    );
                  })}
                </G>
              ) : null}
            </Svg>
          );
        }}
      </Canvas>
      <Caption>{lines.join(' ')}</Caption>
    </View>
  );
}

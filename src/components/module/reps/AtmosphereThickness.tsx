/**
 * HC122 `atmosphereLayers` mode `thickness` (typesHe4g.ts): the hypsometric equation. Pressure on
 * a log scale across, height up from the lower level; the column at mean temperature T̄ is the
 * straight line ln p = ln p₁ − z ÷ H. The levels p₁ and p₂ with the thickness Δz bracketed, and
 * the scale height H where p has fallen to p₁ ÷ e. Drag the upper level for p₂ (or z).
 */
import { useRef } from 'react';
import { View } from 'react-native';
import Svg, { Circle, G, Line, Path } from 'react-native-svg';

import type { AtmosphereThicknessSpec } from '@/data/modules/typesHe4g';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, Caption, ChartText, DragHandle } from './common';
import { fmt, Tag, tagW } from './he2fKit';
import { useHe4g } from './he4gKit';
import {
  G_EARTH,
  logTicks,
  pressureAt,
  R_DRY,
  scaleHeightOf,
  thicknessOf,
  tickStep,
} from './he4gMath';

const BW = 360;
const BH = 300;
const L = 58;
const R = 340;
const TOP = 14;
const BASE = 256;

export function AtmosphereThickness({
  spec,
  calc,
}: {
  spec: AtmosphereThicknessSpec;
  calc: Calculator;
}) {
  const c = usePalette();
  const { rep, num, label, setOne, say, sym } = useHe4g(calc);
  const start = useRef(0);
  const unit = spec.unit ?? 'm';
  const per = unit === 'km' ? 1000 : 1;
  const [s1, s2, sz, sh, st] = [
    sym(spec.lower, 'p₁'),
    sym(spec.upper, 'p₂'),
    sym(spec.thickness, 'Δz'),
    sym(spec.scaleHeight, 'H'),
    sym(spec.temperature, 'T̄'),
  ];
  const p1 = num(spec.lower);
  const t = num(spec.temperature);
  const g = spec.g === undefined ? G_EARTH : num(spec.g);
  const rd = spec.gasConstant === undefined ? R_DRY : num(spec.gasConstant);
  const hTyped = num(spec.scaleHeight);
  const hWorked =
    t !== undefined && g !== undefined && rd !== undefined && g > 0
      ? scaleHeightOf(t, g, rd) / per
      : undefined;
  // The page's H when it has one, else R_d T̄ ÷ g.
  const h = hTyped ?? hWorked;
  const ok = p1 !== undefined && p1 > 0 && h !== undefined && h > 0;
  const pUp = num(spec.upper);
  const dzTyped = num(spec.thickness);
  const dz =
    dzTyped ??
    (ok && pUp !== undefined && pUp > 0 && pUp < p1 ? thicknessOf(h, p1, pUp) : undefined);
  const p2 = pUp ?? (ok && dz !== undefined ? pressureAt(p1, dz, h) : undefined);
  const has2 = ok && dz !== undefined && dz > 0 && p2 !== undefined && p2 < p1;

  // Height up from p₁ to a round top above Δz and H; pressure across on a log scale.
  const zMax = ok ? Math.max(h, has2 ? dz : 0) * 1.15 : 10000 / per;
  const zStep = tickStep(zMax, 5);
  const zTop = Math.ceil(zMax / zStep) * zStep;
  const pHi = ok ? p1 * 1.08 : 1080;
  const pLo = ok ? pressureAt(p1, zTop, h) / 1.08 : 200;
  const X = (p: number) =>
    L + ((Math.log(p) - Math.log(pLo)) / (Math.log(pHi) - Math.log(pLo))) * (R - L);
  const Y = (z: number) => BASE - (z / zTop) * (BASE - TOP);
  // Pressure ticks no closer than 30 px.
  const ticks: number[] = [];
  for (const p of logTicks(pLo, pHi))
    if (!ticks.length || X(p) - X(ticks[ticks.length - 1]!) >= 30) ticks.push(p);
  const zTicks = Array.from({ length: Math.round(zTop / zStep) + 1 }, (_, i) =>
    Number((i * zStep).toPrecision(6)),
  );

  const upVar = typeof spec.upper === 'string' ? spec.upper : undefined;
  const dzVar = typeof spec.thickness === 'string' ? spec.thickness : undefined;
  const dragId = upVar && rep.typed(upVar) ? upVar : dzVar && rep.typed(dzVar) ? dzVar : undefined;
  const canDrag = !spec.fixed && has2 && dragId !== undefined;
  const keep = [spec.lower, spec.temperature, spec.scaleHeight, spec.g, spec.gasConstant];

  const hText = label(spec.scaleHeight, 'H', h, unit);
  const dzText = label(spec.thickness, 'Δz', dz, unit);
  const p1Text = label(spec.lower, 'p₁', p1, 'hPa');
  const p2Text = label(spec.upper, 'p₂', p2, 'hPa');
  const yH = ok ? Y(h) : 0;
  const yDz = has2 ? Y(dz) : 0;
  const hBelow = has2 && Math.abs(yH - yDz) < 20;
  // The thickness's label: beside its bracket at the right, clear of the column's line and the
  // level labels (the first place that is).
  const lineX = (y: number) => (ok ? X(pressureAt(p1, ((BASE - y) / (BASE - TOP)) * zTop, h)) : 0);
  const dzSpot = (() => {
    if (!has2 || !dzText) return { x: R - 14, y: 0, anchor: 'end' as const };
    const wd = tagW(dzText);
    const taken = [yDz - 6, BASE - 7, hBelow ? yH + 16 : yH - 6];
    const spots = [
      { x: R - 14, y: (BASE + yDz) / 2 + 4, anchor: 'end' as const },
      { x: R - 14, y: yDz + 20, anchor: 'end' as const },
      { x: R - 4, y: yDz - 8, anchor: 'end' as const },
      { x: R - 14, y: BASE - 26, anchor: 'end' as const },
    ];
    const clear = (sp: (typeof spots)[number]) => {
      const [x0, x1] = [sp.x - wd - 4, sp.x + 4];
      const crosses = [sp.y - 13, sp.y - 6, sp.y + 4].some((y) => {
        const lx = lineX(Math.min(BASE, Math.max(TOP, y)));
        return lx >= x0 && lx <= x1;
      });
      const near = taken.some((y) => Math.abs(y - sp.y) < 17 && x0 < L + 6 + 150);
      return !crosses && !near && sp.y > TOP + 12 && sp.y < BASE - 4;
    };
    return spots.find(clear) ?? spots[0]!;
  })();

  const lines: string[] = [];
  if (!ok) lines.push(`Type ${s1} and ${hTyped === undefined ? st : sh} to draw the column.`);
  else {
    if (t !== undefined)
      lines.push(
        `${sh} = R${st} ÷ g = ${say(spec.gasConstant, rd!)} × ${say(spec.temperature, t)} ÷ ${say(spec.g, g!)} = ${fmt(h * per)} m${unit === 'km' ? ` = ${fmt(h)} km` : ''}.`,
      );
    if (has2)
      lines.push(
        spec.temperature === undefined
          ? `${s2} = ${s1}e^(−${sz} ÷ ${sh}) = ${say(spec.lower, p1)} × e^(−${say(spec.thickness, dz)} ÷ ${say(spec.scaleHeight, h)}) = ${say(spec.upper, p2)} hPa.`
          : `${sz} = ${sh} ln(${s1} ÷ ${s2}) = ${fmt(h)} × ln(${say(spec.lower, p1)} ÷ ${say(spec.upper, p2)}) = ${say(spec.thickness, dz)} ${unit}.`,
      );
    if (pUp !== undefined && pUp >= p1)
      lines.push(`${s2} must be below ${s1}: pressure falls going up, so no layer is drawn.`);
    lines.push(
      spec.temperature === undefined
        ? `Each ${sh} up, the pressure falls to 1 ÷ e of what it was.`
        : 'A warmer layer has a larger H, so the same two pressures lie farther apart.',
    );
  }

  return (
    <View>
      <Canvas aspect={BH / BW}>
        {({ w, h: ch }) => {
          const k = w / BW;
          return (
            <>
              <Svg width={w} height={ch}>
                <G transform={`scale(${k})`}>
                  {zTicks.map((z) => (
                    <G key={`z${z}`}>
                      <Line x1={L} y1={Y(z)} x2={R} y2={Y(z)} stroke={c.chartGrid} />
                      <ChartText
                        x={L - 5}
                        y={Y(z) + 4}
                        fontSize={chart.label}
                        textAnchor="end"
                        fill={c.chartMuted}
                      >
                        {fmt(z)}
                      </ChartText>
                    </G>
                  ))}
                  {ticks.map((p) => (
                    <G key={`p${p}`}>
                      <Line x1={X(p)} y1={TOP} x2={X(p)} y2={BASE} stroke={c.chartGrid} />
                      <ChartText
                        x={X(p)}
                        y={BASE + 15}
                        fontSize={chart.label}
                        textAnchor="middle"
                        fill={c.chartMuted}
                      >
                        {fmt(p)}
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
                    y={BASE + 33}
                    fontSize={chart.label}
                    textAnchor="middle"
                    fill={c.chartMuted}
                  >
                    Pressure, hPa (log scale)
                  </ChartText>
                  <ChartText
                    x={12}
                    y={(TOP + BASE) / 2}
                    fontSize={chart.label}
                    textAnchor="middle"
                    fill={c.chartMuted}
                    transform={`rotate(-90 12 ${(TOP + BASE) / 2})`}
                  >
                    {`Height above ${s1}, ${unit}`}
                  </ChartText>
                  {ok ? (
                    <G>
                      {/* The scale height: where p = p₁ ÷ e. */}
                      <Line
                        x1={L}
                        y1={yH}
                        x2={X(p1 / Math.E)}
                        y2={yH}
                        stroke={c.lineSum}
                        strokeWidth={1.5}
                        strokeDasharray={chart.dash}
                      />
                      <Line
                        x1={X(p1 / Math.E)}
                        y1={yH}
                        x2={X(p1 / Math.E)}
                        y2={BASE}
                        stroke={c.lineSum}
                        strokeWidth={1}
                        strokeDasharray={chart.dashFine}
                      />
                      {/* The column at T̄: a straight line on log-p axes. */}
                      <Line
                        x1={X(p1)}
                        y1={BASE}
                        x2={X(pressureAt(p1, zTop, h))}
                        y2={TOP}
                        stroke={c.fnSecond}
                        strokeWidth={chart.strokeHeavy}
                      />
                      <Circle cx={X(p1 / Math.E)} cy={yH} r={4} fill={c.lineSum} />
                      {hText ? (
                        <Tag
                          x={L + 6}
                          y={hBelow ? yH + 16 : yH - 6}
                          text={`${hText} (p = ${s1} ÷ e)`}
                          anchor="start"
                          color={c.lineSum}
                          w={BW}
                        />
                      ) : null}
                      <Circle
                        cx={X(p1)}
                        cy={BASE}
                        r={5}
                        fill={c.chartHighlight}
                        stroke={c.card}
                        strokeWidth={1.5}
                      />
                      {p1Text ? (
                        <Tag
                          x={L + 6}
                          y={BASE - 7}
                          text={p1Text}
                          anchor="start"
                          color={c.chartHighlight}
                          w={BW}
                        />
                      ) : null}
                    </G>
                  ) : null}
                  {has2 ? (
                    <G>
                      <Line
                        x1={L}
                        y1={yDz}
                        x2={X(p2)}
                        y2={yDz}
                        stroke={c.chartHighlight}
                        strokeWidth={1.5}
                        strokeDasharray={chart.dash}
                      />
                      <Circle
                        cx={X(p2)}
                        cy={yDz}
                        r={5}
                        fill={c.chartHighlight}
                        stroke={c.card}
                        strokeWidth={1.5}
                      />
                      {p2Text ? (
                        <Tag
                          x={L + 6}
                          y={hBelow && yH < yDz ? yDz + 16 : yDz - 6}
                          text={p2Text}
                          anchor="start"
                          color={c.chartHighlight}
                          w={BW}
                        />
                      ) : null}
                      {/* The thickness, bracketed at the right. */}
                      <Path
                        d={`M ${R - 18} ${BASE} H ${R - 8} V ${yDz} H ${R - 18}`}
                        stroke={c.chartInk}
                        strokeWidth={1.5}
                        fill="none"
                      />
                      {dzText ? (
                        <Tag
                          x={dzSpot.x}
                          y={dzSpot.y}
                          text={dzText}
                          anchor={dzSpot.anchor}
                          w={BW}
                        />
                      ) : null}
                    </G>
                  ) : null}
                </G>
              </Svg>
              {canDrag ? (
                <DragHandle
                  x={X(p2) * k}
                  y={yDz * k}
                  label="the upper level"
                  onStart={() => {
                    start.current = dz;
                  }}
                  onMove={(_, dy) => {
                    const z = Math.max(zStep / 20, start.current - (dy / k / (BASE - TOP)) * zTop);
                    if (dragId === upVar) setOne(upVar!, pressureAt(p1, z, h), keep);
                    else setOne(dragId!, z, keep);
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

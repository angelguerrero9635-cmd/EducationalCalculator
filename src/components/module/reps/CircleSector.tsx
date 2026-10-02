/**
 * The Grades 9–12 circle views (H26): a sector shaded by its central angle in degrees or
 * radians, with its arc length and area; and radians shown as radius-long arcs wrapped around
 * the circle, 2π ≈ 6.28 of them in a turn.
 */
import { useRef } from 'react';
import { View } from 'react-native';
import Svg, { Circle, G, Line, Path } from 'react-native-svg';

import type { Representation } from '@/data/modules';
import { formatNumber } from '@/engine/format';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, Caption, ChartText, DragHandle, fitLabel, useFrozen, useRep } from './common';
import { toFraction } from './exact';
import { Chip, coef } from './graphKit';

type Spec = Extract<Representation, { kind: 'circle' }>;

/** x as a multiple of π when it is one (2π/3, π, 4π), else undefined. */
export function piMultiple(x: number): string | undefined {
  const f = toFraction(x / Math.PI, 12);
  if (!f || f[0] === 0) return f && f[0] === 0 ? '0' : undefined;
  const [p, q] = f;
  const top = `${p < 0 ? '−' : ''}${Math.abs(p) === 1 ? '' : Math.abs(p)}π`;
  return q === 1 ? top : `${top}/${q}`;
}

/** Two decimals at most. */
const short = (x: number) => formatNumber(Number(x.toFixed(2)));

/** "2π ≈ 6.28", or "6.25" when x is no simple multiple of π. */
const exactText = (x: number) => {
  const p = piMultiple(x);
  return p && p !== '0' ? `${p} ≈ ${short(x)}` : short(x);
};

/** The sector's numbers: radius (shown units), angle in its unit and in radians. */
function useSector(spec: Spec, calc: Calculator) {
  const rep = useRep(calc);
  const s = spec.sector;
  const radians = s?.unit === 'radians';
  const turn = radians ? 2 * Math.PI : 360;
  const angleId = s && typeof s.angle === 'string' ? s.angle : undefined;
  const t = !s ? 0 : typeof s.angle === 'number' ? s.angle : rep.shown(s.angle);
  const tKnown = !!s && (typeof s.angle === 'number' || rep.known(s.angle));
  const rad = radians ? t : (t * Math.PI) / 180;
  const r = rep.shown(spec.radius);
  const unit = rep.unit(spec.radius);
  const u = (square = false) => (unit ? ` ${unit}${square ? '²' : ''}` : '');
  // A "?" angle reads "?" (the shaded angle is drawn from the example's but never labelled so).
  const angleText = !tKnown
    ? radians
      ? '?'
      : '?°'
    : radians
      ? (piMultiple(t) ?? short(t))
      : `${formatNumber(t)}°`;
  return { rep, s, radians, turn, angleId, t, tKnown, rad, r, u, angleText };
}

/** Screen point at angle a (math way round) and distance d from the center. */
const at = (cx: number, cy: number, a: number, d: number) =>
  [cx + d * Math.cos(a), cy - d * Math.sin(a)] as const;

/** The sector (or whole disc) from angle 0 counterclockwise to a. */
function sectorPath(cx: number, cy: number, R: number, a: number) {
  if (a >= 2 * Math.PI - 1e-9)
    return `M ${cx + R} ${cy} A ${R} ${R} 0 1 0 ${cx - R} ${cy} A ${R} ${R} 0 1 0 ${cx + R} ${cy} Z`;
  const [x, y] = at(cx, cy, a, R);
  return `M ${cx} ${cy} L ${cx + R} ${cy} A ${R} ${R} 0 ${a > Math.PI ? 1 : 0} 0 ${x} ${y} Z`;
}

/** An arc of radius R from angle a0 to a1 (counterclockwise). */
function arcPath(cx: number, cy: number, R: number, a0: number, a1: number) {
  const [x0, y0] = at(cx, cy, a0, R);
  const [x1, y1] = at(cx, cy, a1, R);
  return `M ${x0} ${y0} A ${R} ${R} 0 ${a1 - a0 > Math.PI ? 1 : 0} 0 ${x1} ${y1}`;
}

/** The angle handle: drag the arc's end around the circle. */
function useAngleDrag(spec: Spec, calc: Calculator, sec: ReturnType<typeof useSector>) {
  return (cx: number, cy: number, x: number, y: number) => {
    const { rep, angleId, radians, turn } = sec;
    if (!angleId) return;
    let a = Math.atan2(-(y - cy), x - cx);
    if (a <= 0) a += 2 * Math.PI;
    const t = radians ? a : (a * 180) / Math.PI;
    calc.set(
      { ...rep.pin([spec.radius]), [angleId]: rep.snapTo(angleId, Math.min(turn, t)) },
      rep.slide(angleId),
    );
  };
}

/**
 * A sector shaded by its central angle: the two radii, the arc drawn heavy with its length,
 * the angle marked at the center, the area inside. Drag the arc's end to change the angle
 * and the radius's end to change the radius.
 */
export function CircleSector({ spec, calc }: { spec: Spec; calc: Calculator }) {
  const c = usePalette();
  const sec = useSector(spec, calc);
  const { rep, s, radians, turn, angleId, t, tKnown, rad, r, u, angleText } = sec;
  const start = useRef({ x: 0, y: 0 });
  const rVal = rep.val(spec.radius);
  const fit = useFrozen(Math.max(spec.extent * rep.factor(spec.radius), rVal));
  const dragAngle = useAngleDrag(spec, calc, sec);
  const known = rep.known(spec.radius) && tKnown;
  const ok = t > 0 && t <= turn + 1e-9;
  const arc = r * rad;
  const area = (r * r * rad) / 2;
  const valueText = (id: string | undefined, x: number, square = false) =>
    id && rep.known(id) ? `${exactText(rep.shown(id))}${u(square)}` : `${exactText(x)}${u(square)}`;
  const share = coef(t / turn);
  const lines: string[] = [];
  if (!s) lines.push('Give the sector’s angle.');
  else if (!known) lines.push('Type the radius and the angle.');
  else if (!ok) lines.push(`The angle is more than a full turn (${radians ? '2π' : '360°'}).`);
  else {
    lines.push(
      radians
        ? `A central angle of ${angleText} radians is ${share} of a full turn of 2π.`
        : `A central angle of ${angleText} is ${share} of the full 360°, or ${exactText(rad)} radians.`,
    );
    const rt = formatNumber(r);
    lines.push(
      radians
        ? `s = r × θ = ${rt} × ${angleText} = ${valueText(s.arc, arc)}`
        : `s = ${formatNumber(t)} ÷ 360 × 2π × ${rt} = ${valueText(s.arc, arc)}`,
    );
    if (s.area)
      lines.push(
        radians
          ? `A = r² × θ ÷ 2 = ${rt}² × ${angleText} ÷ 2 = ${valueText(s.area, area, true)}`
          : `A = ${formatNumber(t)} ÷ 360 × π × ${rt}² = ${valueText(s.area, area, true)}`,
      );
  }

  return (
    <View>
      <Canvas aspect={0.86}>
        {({ w, h }) => {
          const cx = w / 2;
          const cy = h / 2 + 4;
          const scale = (Math.min(w, h) / 2 - 58) / fit.value;
          const R = rVal * scale;
          const a = ok ? rad : 0;
          const [ex, ey] = at(cx, cy, a, R);
          const mid = a / 2;
          const [lx, ly] = at(cx, cy, mid, R + 16);
          const cos = Math.cos(mid);
          // On the picture the arc is short: exact (2π cm) when it is a multiple of π.
          const arcShort = s?.arc && rep.known(s.arc) ? rep.shown(s.arc) : arc;
          const arcText = `s = ${piMultiple(arcShort) ?? short(arcShort)}${u()}`;
          const arcAnchor = cos > 0.3 ? 'start' : cos < -0.3 ? 'end' : 'middle';
          // The angle's label sits on the bisector, clear of the small arc mark.
          const mark = Math.min(24, R * 0.3);
          const [ax, ay] = at(cx, cy, mid, Math.min(R * 0.55, mark + 26));
          return (
            <>
              <Svg width={w} height={h} opacity={known ? 1 : 0.4}>
                <Circle
                  cx={cx}
                  cy={cy}
                  r={R}
                  fill={c.chartFill}
                  stroke={c.chartInk}
                  strokeWidth={chart.stroke}
                />
                {ok && a > 0 ? (
                  <G>
                    <Path d={sectorPath(cx, cy, R, a)} fill={c.chartHighlight} fillOpacity={0.25} />
                    {a >= 2 * Math.PI - 1e-9 ? (
                      <Circle
                        cx={cx}
                        cy={cy}
                        r={R}
                        stroke={c.chartHighlight}
                        strokeWidth={chart.strokeHeavy + 1}
                        fill="none"
                      />
                    ) : (
                      <Path
                        d={arcPath(cx, cy, R, 0, a)}
                        stroke={c.chartHighlight}
                        strokeWidth={chart.strokeHeavy + 1}
                        fill="none"
                        strokeLinecap="round"
                      />
                    )}
                    {a < 2 * Math.PI - 1e-9 ? (
                      <Path
                        d={arcPath(cx, cy, mark, 0, a)}
                        stroke={c.chartInk}
                        strokeWidth={chart.strokeLight}
                        fill="none"
                      />
                    ) : null}
                    <ChartText
                      x={ax}
                      y={ay + 4}
                      textAnchor="middle"
                      fontSize={chart.value}
                      fontWeight="700"
                    >
                      {angleText}
                    </ChartText>
                    <Chip
                      x={lx}
                      y={Math.min(h - 4, Math.max(14, ly + 4))}
                      text={arcText}
                      anchor={arcAnchor}
                      w={w}
                      h={h}
                      size={chart.label}
                      color={c.chartHighlight}
                    />
                  </G>
                ) : null}
                {/* The two radii. */}
                <Line
                  x1={cx}
                  y1={cy}
                  x2={cx + R}
                  y2={cy}
                  stroke={c.chartInk}
                  strokeWidth={chart.stroke}
                />
                <Line
                  x1={cx}
                  y1={cy}
                  x2={ex}
                  y2={ey}
                  stroke={c.chartInk}
                  strokeWidth={chart.stroke}
                />
                <Circle cx={cx} cy={cy} r={3} fill={c.chartInk} />
                <ChartText x={cx + R / 2} y={cy + 18} textAnchor="middle" fontSize={chart.value}>
                  {rep.label(spec.radius)}
                </ChartText>
              </Svg>
              {known && ok ? (
                <>
                  <DragHandle
                    testID={`drag-${spec.radius}`}
                    x={cx + R}
                    y={cy}
                    label={rep.variable(spec.radius).name}
                    onStart={() => {
                      start.current = { x: cx + R, y: cy };
                      fit.freeze();
                    }}
                    onEnd={fit.release}
                    onMove={(dx, dy) =>
                      calc.set(
                        {
                          ...(angleId ? rep.pin([angleId]) : {}),
                          [spec.radius]: rep.snapTo(
                            spec.radius,
                            Math.hypot(start.current.x + dx - cx, start.current.y + dy - cy) /
                              scale,
                          ),
                        },
                        rep.slide(spec.radius),
                      )
                    }
                  />
                  {angleId ? (
                    <DragHandle
                      testID={`drag-${angleId}`}
                      x={ex}
                      y={ey}
                      label={rep.variable(angleId).name}
                      onStart={() => {
                        start.current = { x: ex, y: ey };
                        fit.freeze();
                      }}
                      onEnd={fit.release}
                      onMove={(dx, dy) =>
                        dragAngle(cx, cy, start.current.x + dx, start.current.y + dy)
                      }
                    />
                  ) : null}
                </>
              ) : null}
            </>
          );
        }}
      </Canvas>
      <Caption>{lines.join(' · ')}</Caption>
    </View>
  );
}

/**
 * What a radian is: arcs one radius long laid around the circle, numbered, alternating colors,
 * with the part left over (2π − 6 ≈ 0.28); the first arc's angle is one radian (≈ 57.3°).
 * With a sector, its angle is shaded and counted in radius-lengths of arc.
 */
export function CircleRadian({ spec, calc }: { spec: Spec; calc: Calculator }) {
  const c = usePalette();
  const sec = useSector(spec, calc);
  const { rep, s, tKnown, rad, angleText, radians } = sec;
  const known = rep.known(spec.radius);
  const r = rep.shown(spec.radius);
  const rt = rep.label(spec.radius);
  const lines = [
    `Each colored arc is one radius long (${rt}). The angle it makes at the center is 1 radian ≈ 57.3°.`,
    'About 6.28 of them go around: a full turn is 2π radians = 360°.',
    ...(s && tKnown && rad > 0 && rad <= 2 * Math.PI + 1e-9
      ? [
          `The shaded angle, ${radians ? `${angleText} radians` : `${angleText} = ${exactText(rad)} radians`}, has an arc ${short(rad)} radii long: ${known ? short(rad * r) : '?'}${sec.u()}.`,
        ]
      : []),
  ];
  return (
    <View>
      <Canvas aspect={0.86}>
        {({ w, h }) => {
          const cx = w / 2;
          const cy = h / 2 + 4;
          const R = Math.min(w, h) / 2 - 46;
          const whole = Math.floor(2 * Math.PI);
          const shade = s && tKnown && rad > 0 ? Math.min(rad, 2 * Math.PI) : 0;
          return (
            <Svg width={w} height={h} opacity={known ? 1 : 0.4}>
              <Circle
                cx={cx}
                cy={cy}
                r={R}
                fill={c.chartFill}
                stroke={c.chartMuted}
                strokeWidth={1}
              />
              {shade > 0 ? (
                <Path d={sectorPath(cx, cy, R, shade)} fill={c.chartHighlight} fillOpacity={0.18} />
              ) : null}
              {/* One radian: its wedge's edges and the angle mark. */}
              <Line
                x1={cx}
                y1={cy}
                x2={cx + R}
                y2={cy}
                stroke={c.chartInk}
                strokeWidth={chart.stroke}
              />
              <Line
                x1={cx}
                y1={cy}
                x2={at(cx, cy, 1, R)[0]}
                y2={at(cx, cy, 1, R)[1]}
                stroke={c.chartInk}
                strokeWidth={chart.stroke}
              />
              <Path
                d={arcPath(cx, cy, 22, 0, 1)}
                stroke={c.chartInk}
                strokeWidth={chart.strokeLight}
                fill="none"
              />
              <ChartText
                x={at(cx, cy, 0.5, 46)[0]}
                y={at(cx, cy, 0.5, 46)[1] + 4}
                textAnchor="middle"
                fontWeight="700"
              >
                1 rad
              </ChartText>
              <ChartText x={cx + R / 2} y={cy + 17} textAnchor="middle" fontWeight="700">
                r
              </ChartText>
              {Array.from({ length: whole }, (_, i) => {
                const [nx, ny] = at(cx, cy, i + 0.5, R + 20);
                return (
                  <G key={i}>
                    <Path
                      d={arcPath(cx, cy, R, i, i + 1)}
                      stroke={i % 2 ? c.chartSecond : c.chartHighlight}
                      strokeWidth={chart.strokeHeavy + 3}
                      fill="none"
                    />
                    <Circle
                      cx={at(cx, cy, i, R)[0]}
                      cy={at(cx, cy, i, R)[1]}
                      r={3}
                      fill={c.chartInk}
                    />
                    <ChartText
                      x={nx}
                      y={ny + 5}
                      textAnchor="middle"
                      fontSize={chart.value}
                      fontWeight="700"
                    >
                      {String(i + 1)}
                    </ChartText>
                  </G>
                );
              })}
              {/* The part left over: 2π − 6 ≈ 0.28 of a radius. */}
              <Path
                d={arcPath(cx, cy, R, whole, 2 * Math.PI)}
                stroke={c.chartMuted}
                strokeWidth={chart.strokeHeavy + 3}
                strokeDasharray="3 2"
                fill="none"
              />
              <ChartText
                {...fitLabel(
                  at(cx, cy, whole + 0.14, R + 20)[0] + 4,
                  '0.28',
                  chart.label,
                  w,
                  'start',
                  4,
                )}
                y={at(cx, cy, whole + 0.14, R + 20)[1] + 12}
                fill={c.chartMuted}
                fontWeight="700"
              >
                0.28
              </ChartText>
              <Circle cx={cx} cy={cy} r={3} fill={c.chartInk} />
            </Svg>
          );
        }}
      </Canvas>
      <Caption>{lines.join(' · ')}</Caption>
    </View>
  );
}

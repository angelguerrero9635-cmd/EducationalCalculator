import { useRef } from 'react';
import { View } from 'react-native';
import Svg, { Circle, Defs, Ellipse, G, Line, Path, Rect } from 'react-native-svg';

import type { Representation } from '@/data/modules';
import { formatNumber } from '@/engine/format';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, Caption, ChartText, DragHandle, fitLabel, useFrozen, useRep } from './common';
import { near } from './DistanceLegs';
import { toFraction } from './exact';
import { Ball, Deepen, FloorShadow, Glass, Sheen, url, usePaintIds } from './paint';

type Spec = Extract<Representation, { kind: 'curvedSolid' }>;
type Shape = Spec['shape'];

/** Volume as a multiple of π: r²h for a cylinder, r²h/3 for a cone, 4r³/3 for a sphere. */
const piTimes = (shape: Shape, r: number, h: number) =>
  shape === 'cylinder' ? r * r * h : shape === 'cone' ? (r * r * h) / 3 : (4 * r ** 3) / 3;

/** "90π", "20π/3" (a fraction with a small bottom), or undefined for a long decimal. */
export function piText(k: number): string | undefined {
  if (Math.abs(k * 100 - Math.round(k * 100)) < 1e-6)
    return `${formatNumber(Number(k.toFixed(2)))}π`;
  const f = toFraction(k, 12);
  return f ? `${formatNumber(f[0])}π/${f[1]}` : undefined;
}

/** How much of the same-sized cylinder the solid's water fills. */
const SHARE = { cone: [1, 3], sphere: [2, 3], cylinder: [1, 1] } as const;

/**
 * A glass cylinder, cone or sphere full of water, drawn to scale with its radius (and height)
 * marked; drag the rim to change the radius and the top to change the height. With `compare`,
 * the cylinder of the same radius and height (2r for a sphere) stands beside it holding the
 * solid's water: a third of it for a cone, two thirds for a sphere.
 */
export function CurvedSolid({ spec, calc }: { spec: Spec; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  const ids = usePaintIds('glass', 'water', 'sheen', 'ball');
  const start = useRef(0);
  const sphere = spec.shape === 'sphere';
  const r = rep.val(spec.radius);
  const hgt = sphere ? 2 * r : rep.val(spec.height!);
  const f = rep.factor(spec.radius);
  const known = rep.known(spec.radius) && (sphere || rep.known(spec.height!));
  const op = known ? 1 : 0.35;
  // The scale fits the diameter across and the height (or the extent) up; held while dragging.
  const fit = useFrozen({ across: 2 * r, up: Math.max(spec.extent * f, hgt) });
  const compare = !!spec.compare && spec.shape !== 'cylinder';

  // Numbers in the shown unit for the caption.
  const sr = rep.shown(spec.radius);
  // The height in the radius's unit, so r and h multiply in one unit whatever each box shows.
  const sh = hgt / f;
  const unit = rep.unit(spec.radius);
  const k = piTimes(spec.shape, sr, sh);
  const kCyl = sr * sr * sh;
  const cubed = unit ? ` ${unit}³` : '';
  const rule =
    spec.shape === 'cylinder'
      ? 'V = π × r² × h'
      : spec.shape === 'cone'
        ? 'V = 1/3 × π × r² × h'
        : 'V = 4/3 × π × r³';
  const worked =
    spec.shape === 'cylinder'
      ? `π × ${formatNumber(sr)}² × ${formatNumber(sh)}`
      : spec.shape === 'cone'
        ? `1/3 × π × ${formatNumber(sr)}² × ${formatNumber(sh)}`
        : `4/3 × π × ${formatNumber(sr)}³`;
  const exact = piText(k);
  const [top, bottom] = SHARE[spec.shape];
  const caption = known
    ? [
        rule,
        `V = ${worked} = ${exact ? `${exact} ≈ ` : '≈ '}${near(Math.PI * k)}${cubed}`,
        ...(compare && piText(kCyl)
          ? [
              `Its water fills ${top}/${bottom} of the cylinder ${formatNumber(sh)}${unit ? ` ${unit}` : ''} tall: ${piText(kCyl)} × ${top}/${bottom} = ${exact ?? near(k) + 'π'}`,
            ]
          : []),
      ].join(' · ')
    : `${rule}: type the ${sphere ? 'radius' : 'radius and height'}.`;

  // The height line's label, on the left: h, or 2r for a sphere beside its cylinder.
  const hText = sphere
    ? compare
      ? `2r = ${known ? formatNumber(2 * sr) : '?'}${known && unit ? ` ${unit}` : ''}`
      : ''
    : rep.label(spec.height!);
  /**
   * Where everything goes at width w: [height line and label] [solid] (gap [cylinder] thirds),
   * centered; the scale is the most the width allows, at most 190 px for the height.
   */
  const layout = (w: number) => {
    const L = hText ? hText.length * chart.label * 0.58 + 26 : 8;
    const gap = compare ? 40 : 0;
    const right = compare ? 30 : 16;
    const across = compare ? 2 * fit.value.across : fit.value.across;
    const s = Math.min((w - L - gap - right) / Math.max(across, 1e-9), 190 / fit.value.up);
    const R = r * s;
    const Hp = hgt * s;
    const ry = Math.max(R * 0.3, 2);
    const T = (compare ? 44 : 26) + ry;
    const B = spec.shape === 'cone' ? 34 : 18;
    const total = L + 2 * R + (compare ? gap + 2 * R : 0) + right;
    const cx = (w - total) / 2 + L + R;
    return { s, R, Hp, ry, T, B, cx, cx2: cx + 2 * R + gap, h: T + Hp + ry + B };
  };

  return (
    <View>
      <Canvas aspect={(w) => layout(w).h / w}>
        {({ w, h }) => {
          const { s, R, Hp, ry, T, cx, cx2 } = layout(w);
          const yb = T + Hp;
          const label = (
            x: number,
            y: number,
            text: string,
            anchor: 'start' | 'middle' | 'end',
          ) => {
            const at = fitLabel(x, text, chart.label, w, anchor, 4);
            const tw = text.length * chart.label * 0.58 + 8;
            const left =
              at.textAnchor === 'start'
                ? at.x - 4
                : at.textAnchor === 'end'
                  ? at.x - tw + 4
                  : at.x - tw / 2;
            return (
              <G opacity={op}>
                <Rect
                  x={left}
                  y={y - 12}
                  width={tw}
                  height={17}
                  rx={4}
                  fill={c.card}
                  opacity={0.85}
                />
                <ChartText {...at} y={y} fontWeight="700">
                  {text}
                </ChartText>
              </G>
            );
          };
          const hLabel = (x: number, height: number, text: string) => (
            <G>
              <Line
                x1={x}
                y1={yb}
                x2={x}
                y2={yb - height}
                stroke={c.chartInk}
                strokeWidth={chart.strokeLight}
                opacity={op}
              />
              <Line
                x1={x - 4}
                y1={yb}
                x2={x + 4}
                y2={yb}
                stroke={c.chartInk}
                strokeWidth={chart.strokeLight}
                opacity={op}
              />
              <Line
                x1={x - 4}
                y1={yb - height}
                x2={x + 4}
                y2={yb - height}
                stroke={c.chartInk}
                strokeWidth={chart.strokeLight}
                opacity={op}
              />
              {label(x - 6, yb - height / 2 + 4, text, 'end')}
            </G>
          );
          /** A glass cylinder at x, water up to `level` of its height (0–1). */
          const cylinder = (x: number, level: number, thirds: boolean) => {
            const topY = yb - Hp;
            const body = `M ${x - R} ${topY} L ${x - R} ${yb} A ${R} ${ry} 0 0 0 ${x + R} ${yb} L ${x + R} ${topY} A ${R} ${ry} 0 0 0 ${x - R} ${topY} Z`;
            const wy = yb - level * Hp;
            const water = `M ${x - R} ${wy} L ${x - R} ${yb} A ${R} ${ry} 0 0 0 ${x + R} ${yb} L ${x + R} ${wy} Z`;
            return (
              <G opacity={op}>
                <FloorShadow cx={x + 3} cy={yb + ry + 2} rx={R * 1.1} ry={Math.max(3, ry * 0.5)} />
                <Path d={body} fill={url(ids.glass)} />
                {level > 0 ? (
                  <>
                    <Path d={water} fill={url(ids.water)} />
                    <Ellipse
                      cx={x}
                      cy={wy}
                      rx={R}
                      ry={ry}
                      fill={c.waterTop}
                      stroke={c.water}
                      strokeWidth={1}
                    />
                  </>
                ) : null}
                <Path d={body} fill={url(ids.sheen)} />
                {thirds
                  ? [1, 2].map((i) => (
                      <G key={i}>
                        <Path
                          d={`M ${x - R} ${yb - (i * Hp) / 3} A ${R} ${ry} 0 0 0 ${x + R} ${yb - (i * Hp) / 3}`}
                          stroke={c.chartInk}
                          strokeWidth={1}
                          strokeDasharray={chart.dashFine}
                          fill="none"
                        />
                        <ChartText
                          x={x + R + 5}
                          y={yb - (i * Hp) / 3 + 4}
                          fontSize={chart.small}
                          fontWeight="700"
                        >
                          {`${i}/3`}
                        </ChartText>
                      </G>
                    ))
                  : null}
                {/* The far edge of the base shows through the glass. */}
                <Path
                  d={`M ${x - R} ${yb} A ${R} ${ry} 0 0 1 ${x + R} ${yb}`}
                  stroke={c.glassEdge}
                  strokeWidth={1}
                  fill="none"
                />
                <Path
                  d={`M ${x - R} ${topY} L ${x - R} ${yb} A ${R} ${ry} 0 0 0 ${x + R} ${yb} L ${x + R} ${topY}`}
                  stroke={c.glassEdge}
                  strokeWidth={chart.stroke}
                  fill="none"
                />
                <Ellipse
                  cx={x}
                  cy={topY}
                  rx={R}
                  ry={ry}
                  fill="none"
                  stroke={c.glassEdge}
                  strokeWidth={chart.stroke}
                />
              </G>
            );
          };
          const cone = (x: number) => {
            const apex = yb - Hp;
            const body = `M ${x - R} ${yb} L ${x} ${apex} L ${x + R} ${yb} A ${R} ${ry} 0 0 1 ${x - R} ${yb} Z`;
            return (
              <G opacity={op}>
                <FloorShadow cx={x + 3} cy={yb + ry + 2} rx={R * 1.1} ry={Math.max(3, ry * 0.5)} />
                <Path d={body} fill={url(ids.glass)} />
                <Path d={body} fill={url(ids.water)} />
                <Path d={body} fill={url(ids.sheen)} />
                <Path
                  d={`M ${x - R} ${yb} A ${R} ${ry} 0 0 1 ${x + R} ${yb}`}
                  stroke={c.glassEdge}
                  strokeWidth={1}
                  fill="none"
                />
                <Path
                  d={`M ${x - R} ${yb} L ${x} ${apex} L ${x + R} ${yb} A ${R} ${ry} 0 0 1 ${x - R} ${yb}`}
                  stroke={c.glassEdge}
                  strokeWidth={chart.stroke}
                  strokeLinejoin="round"
                  fill="none"
                />
              </G>
            );
          };
          const ball = (x: number) => {
            const cy = yb - R;
            return (
              <G opacity={op}>
                <FloorShadow cx={x + 3} cy={yb + 2} rx={R * 0.9} ry={Math.max(3, R * 0.12)} />
                <Circle cx={x} cy={cy} r={R} fill={url(ids.ball)} />
                <Ellipse
                  cx={x}
                  cy={cy}
                  rx={R}
                  ry={ry}
                  fill="none"
                  stroke={c.waterTop}
                  strokeWidth={1}
                  strokeDasharray={chart.dashFine}
                />
                <Circle
                  cx={x}
                  cy={cy}
                  r={R}
                  fill="none"
                  stroke={c.glassEdge}
                  strokeWidth={chart.stroke}
                />
              </G>
            );
          };
          // Where the radius is drawn: the top rim (cylinder), the base (cone), the middle (sphere).
          const ry0 = spec.shape === 'cylinder' ? yb - Hp : spec.shape === 'cone' ? yb : yb - R;
          const radius = (x: number, y: number, below: boolean) => (
            <G>
              <Line
                x1={x}
                y1={y}
                x2={x + R}
                y2={y}
                stroke={c.chartInk}
                strokeWidth={chart.stroke}
                opacity={op}
              />
              <Circle cx={x} cy={y} r={2.5} fill={c.chartInk} opacity={op} />
              {label(
                x + R / 2,
                below ? yb + ry + 17 : y - ry - 6,
                rep.label(spec.radius),
                'middle',
              )}
            </G>
          );
          const drag = (dy: boolean) => ({
            onStart: () => {
              start.current = dy ? hgt : r;
              fit.freeze();
            },
            onEnd: fit.release,
          });
          return (
            <>
              <Svg width={w} height={h}>
                <Defs>
                  <Glass id={ids.glass} />
                  <Deepen id={ids.water} from={c.water} to={c.waterDeep} />
                  <Sheen id={ids.sheen} strength={0.8} />
                  <Ball id={ids.ball} color={c.water} />
                </Defs>
                {spec.shape === 'cylinder'
                  ? cylinder(cx, 1, false)
                  : spec.shape === 'cone'
                    ? cone(cx)
                    : ball(cx)}
                {radius(cx, ry0, spec.shape === 'cone')}
                {hText ? hLabel(cx - R - 12, Hp, hText) : null}
                {compare ? (
                  <>
                    {cylinder(cx2, top / bottom, true)}
                    {/* The same height: a guide from the solid's top across to the cylinder's. */}
                    <Line
                      x1={sphere ? cx : cx + 4}
                      y1={yb - Hp}
                      x2={cx2 - R}
                      y2={yb - Hp}
                      stroke={c.chartMuted}
                      strokeWidth={1}
                      strokeDasharray={chart.dashFine}
                      opacity={op}
                    />
                    {/* Poured from the solid into the cylinder. */}
                    <Path
                      d={`M ${cx + R * 0.6} ${yb - Hp - 10} Q ${(cx + cx2) / 2} ${yb - Hp - 34} ${cx2 - R * 0.6} ${yb - Hp - 10}`}
                      stroke={c.chartMuted}
                      strokeWidth={chart.strokeLight}
                      fill="none"
                      opacity={op}
                    />
                    <Path
                      d={`M ${cx2 - R * 0.6} ${yb - Hp - 10} l -9 -3 l 4 -7 z`}
                      fill={c.chartMuted}
                      opacity={op}
                    />
                  </>
                ) : null}
              </Svg>
              {known ? (
                <DragHandle
                  testID="drag-radius"
                  x={cx + R}
                  y={ry0}
                  label={rep.variable(spec.radius).name}
                  {...drag(false)}
                  onMove={(dx) =>
                    calc.set(
                      {
                        ...rep.pin(spec.height ? [spec.height] : []),
                        [spec.radius]: rep.snapTo(spec.radius, start.current + dx / s),
                      },
                      rep.slide(spec.radius),
                    )
                  }
                />
              ) : null}
              {known && !sphere ? (
                <DragHandle
                  testID="drag-height"
                  x={spec.shape === 'cone' ? cx : cx - R - 12}
                  y={yb - Hp}
                  label={rep.variable(spec.height!).name}
                  {...drag(true)}
                  onMove={(_, dy) =>
                    calc.set(
                      {
                        ...rep.pin([spec.radius]),
                        [spec.height!]: rep.snapTo(spec.height!, start.current - dy / s),
                      },
                      rep.slide(spec.height!),
                    )
                  }
                />
              ) : null}
            </>
          );
        }}
      </Canvas>
      <Caption>{caption}</Caption>
    </View>
  );
}

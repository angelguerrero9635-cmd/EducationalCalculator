/**
 * A clear cylinder or cone cut by a plane (H27), the cut shaded on the solid and drawn flat
 * beside it to the same scale with its measures: a level cut is a circle (the same as the base
 * in a cylinder, shrinking toward a cone's tip); an upright cut is a rectangle in a cylinder,
 * and in a cone a triangle through the axis or a curved region off it. Drag the plane.
 */
import { useRef } from 'react';
import { View } from 'react-native';
import Svg, { Defs, Ellipse, G, Line, Path, Polygon } from 'react-native-svg';

import type { Representation } from '@/data/modules';
import { formatNumber } from '@/engine/format';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, Caption, ChartText, DragHandle, fitLabel, useRep } from './common';
import { piText } from './CurvedSolid';
import { Sheen, url, usePaintIds } from './paint';
import { roundCut, roundReach, type RoundSolid } from './roundSection';

type Spec = Extract<Representation, { kind: 'crossSection' }>;

/** Circles seen from a little above: an ellipse this many times as tall as it is wide. */
const TILT = 0.3;

const short = (x: number) => formatNumber(Number(x.toFixed(2)));

export function CrossSectionRound({ spec, calc }: { spec: Spec; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  const ids = usePaintIds('sheen');
  const start = useRef({ at: 0 });
  const solid = spec.solid as RoundSolid;
  const cut = spec.cut === 'side' ? 'side' : 'base';
  const f = rep.factor(spec.length);
  // Numbers in the radius's shown unit.
  const r = Math.max(0.01, rep.val(spec.length) / f);
  const h = Math.max(0.01, rep.val(spec.height) / f);
  const reach = roundReach(cut, r, h);
  const at = spec.at ? Math.min(reach, Math.max(0, rep.val(spec.at) / f)) : reach / 2;
  const known = [spec.length, spec.height, spec.at].every((id) => !id || rep.known(id));
  const sec = roundCut(solid, cut, r, h, at);
  const unit = rep.unit(spec.length);
  const u = unit ? ` ${unit}` : '';
  const sq = unit ? ` ${unit}²` : '';
  const sym = (id: string) => rep.variable(id).symbol;
  const exact = (k: number) => {
    const p = piText(k);
    return p ? `${p} ≈ ${short(Math.PI * k)}` : `≈ ${short(Math.PI * k)}`;
  };
  const areaName = spec.area ? `${sym(spec.area)} = ` : 'A = ';
  // While a value is "?" its numbers read "?" (never the example's behind the "?").
  const kn = (x: number) => (known ? short(x) : '?');
  const knExact = (k: number) => (known ? exact(k) : '?');
  const cutLine =
    sec.name === 'none'
      ? 'The plane only touches the solid here.'
      : sec.name === 'circle'
        ? `The cut is a circle of radius ${kn(sec.radius!)}${u}: ${areaName}π × ${kn(sec.radius!)}² = ${knExact(sec.radius! ** 2)}${sq}.`
        : sec.name === 'rectangle'
          ? `The cut is a rectangle ${kn(sec.width!)}${u} wide and ${kn(h)}${u} tall: ${areaName}${kn(sec.width!)} × ${kn(h)} = ${kn(sec.area)}${sq}.`
          : sec.name === 'triangle'
            ? `Through the axis the cut is a triangle: ${areaName}1/2 × ${kn(2 * r)} × ${kn(h)} = ${kn(sec.area)}${sq}.`
            : `Off the axis the cut is a curved region (a hyperbola's), ${kn(sec.width!)}${u} wide at the base: ${areaName.replace(' = ', '')} ≈ ${kn(sec.area)}${sq}.`;
  const note =
    cut === 'base'
      ? solid === 'cylinder'
        ? 'Every level cut of a cylinder is the same circle as its base.'
        : 'Level cuts of a cone are circles that shrink toward the tip.'
      : solid === 'cylinder'
        ? 'Upright cuts are rectangles, narrower the farther they are from the axis.'
        : 'Upright cuts of a cone: a triangle through the axis, curved regions off it.';
  const vol = solid === 'cylinder' ? r * r * h : (r * r * h) / 3;
  const volumeLine = spec.volume
    ? `${sym(spec.volume)} = ${solid === 'cone' ? '1/3 × ' : ''}π × ${kn(r)}² × ${kn(h)} = ${knExact(vol)}${unit ? ` ${unit}³` : ''}`
    : undefined;

  /**
   * Left: the height's label, then the solid with its plane; right: the cut, flat, to the same
   * scale. The scale is what the width allows, at most 230 px for the solid's height.
   */
  const cutW = sec.name === 'circle' ? 2 * sec.radius! : (sec.width ?? 0);
  const layout = (w: number) => {
    const pad = 20;
    const left = 74;
    const k = Math.min(
      (w - left - 2 * pad - 30) / (2 * r * 1.35 + Math.max(cutW, r)),
      230 / (h + 2 * r * TILT * 1.4),
    );
    return { k, pad, cx: left + r * k * 1.1, ch: h * k + 2 * r * TILT * k * 1.4 + 2 * pad + 40 };
  };

  return (
    <View>
      <Canvas aspect={(w) => layout(w).ch / w}>
        {({ w, h: ch }) => {
          const { k, cx, pad } = layout(w);
          const R = r * k;
          const ry = R * TILT;
          const yb = ch - pad - ry - 6;
          const H = h * k;
          // A point in the solid: across from the axis, depth toward the back, up.
          const P = (x: number, d: number, z: number) =>
            [cx + x * k, yb - z * k - d * k * TILT] as const;
          const body =
            solid === 'cylinder'
              ? `M ${cx - R} ${yb - H} L ${cx - R} ${yb} A ${R} ${ry} 0 0 0 ${cx + R} ${yb} L ${cx + R} ${yb - H} A ${R} ${ry} 0 0 0 ${cx - R} ${yb - H} Z`
              : `M ${cx - R} ${yb} L ${cx} ${yb - H} L ${cx + R} ${yb} A ${R} ${ry} 0 0 1 ${cx - R} ${yb} Z`;
          // The plane: level at the cut's height, or upright at its depth.
          const m = r * 0.35;
          const sheet =
            cut === 'base'
              ? [
                  P(-r - m, -r - m, at),
                  P(r + m, -r - m, at),
                  P(r + m, r + m, at),
                  P(-r - m, r + m, at),
                ]
              : [
                  P(-r - m, at, -m * 0.5),
                  P(r + m, at, -m * 0.5),
                  P(r + m, at, h + m * 0.5),
                  P(-r - m, at, h + m * 0.5),
                ];
          const pts = (ps: readonly (readonly [number, number])[]) =>
            ps.map((p) => p.join(',')).join(' ');
          const onSolid = sec.outline.map(([x, y]) => (cut === 'base' ? P(x, y, at) : P(x, at, y)));
          // The cut laid flat on the right, its base on the same floor line.
          const fx = cx + R * 1.2 + pad + 30 + (cutW * k) / 2;
          const flat = sec.outline.map(
            ([x, y]) =>
              (cut === 'base' ? [fx + x * k, yb - H / 2 - y * k] : [fx + x * k, yb - y * k]) as [
                number,
                number,
              ],
          );
          const handle = cut === 'base' ? sheet[1]! : sheet[2]!;
          const along = cut === 'base' ? { x: 0, y: -k } : { x: 0, y: -k * TILT };
          const measure =
            sec.name === 'circle'
              ? `r = ${kn(sec.radius!)}${u}`
              : sec.name === 'none'
                ? ''
                : `${kn(sec.width!)}${u}`;
          return (
            <>
              <Svg width={w} height={ch} opacity={known ? 1 : 0.4}>
                <Defs>
                  <Sheen id={ids.sheen} strength={0.7} />
                </Defs>
                {/* The far half of the base shows through the glass. */}
                <Path
                  d={`M ${cx - R} ${yb} A ${R} ${ry} 0 0 1 ${cx + R} ${yb}`}
                  stroke={c.glassEdge}
                  strokeWidth={chart.strokeLight}
                  strokeDasharray={chart.dash}
                  fill="none"
                />
                <Polygon
                  points={pts(sheet)}
                  fill={c.chartSecond}
                  fillOpacity={0.16}
                  stroke={c.chartSecond}
                  strokeWidth={chart.strokeLight}
                />
                <Path d={body} fill={c.glass} fillOpacity={0.5} />
                <Path d={body} fill={url(ids.sheen)} />
                {onSolid.length ? (
                  <Polygon
                    points={pts(onSolid)}
                    fill={c.chartHighlight}
                    fillOpacity={0.5}
                    stroke={c.chartHighlight}
                    strokeWidth={chart.stroke}
                    strokeLinejoin="round"
                  />
                ) : null}
                <Path
                  d={body}
                  stroke={c.chartInk}
                  strokeWidth={chart.stroke}
                  strokeLinejoin="round"
                  fill="none"
                />
                {solid === 'cylinder' ? (
                  <Ellipse
                    cx={cx}
                    cy={yb - H}
                    rx={R}
                    ry={ry}
                    fill="none"
                    stroke={c.chartInk}
                    strokeWidth={chart.stroke}
                  />
                ) : null}
                {/* Its measures: the radius along the base, the height up the side. */}
                <Line
                  x1={cx}
                  y1={yb}
                  x2={cx + R}
                  y2={yb}
                  stroke={c.chartInk}
                  strokeWidth={chart.strokeLight}
                />
                <ChartText x={cx + R / 2} y={yb + ry + 16} textAnchor="middle" fontWeight="700">
                  {`${sym(spec.length)} = ${kn(r)}${u}`}
                </ChartText>
                <ChartText
                  {...fitLabel(
                    cx - R - 6,
                    `${sym(spec.height)} = ${kn(h)}${u}`,
                    chart.label,
                    w,
                    'end',
                    6,
                  )}
                  y={yb - H / 2}
                  fontWeight="700"
                >
                  {`${sym(spec.height)} = ${kn(h)}${u}`}
                </ChartText>
                {/* The cut, flat and to scale. */}
                {flat.length ? (
                  <G>
                    <Polygon
                      points={pts(flat)}
                      fill={c.chartHighlight}
                      fillOpacity={0.35}
                      stroke={c.chartHighlight}
                      strokeWidth={chart.stroke}
                      strokeLinejoin="round"
                    />
                    <ChartText
                      {...fitLabel(fx, measure, chart.label, w)}
                      y={cut === 'base' ? yb - H / 2 + 4 : yb + 16}
                      fontWeight="700"
                    >
                      {measure}
                    </ChartText>
                    <ChartText
                      {...fitLabel(fx, `${kn(sec.area)}${sq}`, chart.value, w)}
                      y={
                        cut === 'base'
                          ? yb - H / 2 - (sec.radius ?? 0) * k - 10
                          : yb - (sec.height ?? 0) * k - 10
                      }
                      fontSize={chart.value}
                      fontWeight="700"
                      fill={c.chartHighlight}
                    >
                      {`${kn(sec.area)}${sq}`}
                    </ChartText>
                  </G>
                ) : null}
              </Svg>
              {spec.at ? (
                <DragHandle
                  testID={`drag-${spec.at}`}
                  x={handle[0]}
                  y={handle[1]}
                  label={rep.variable(spec.at).name}
                  onStart={() => {
                    start.current = { at };
                  }}
                  onMove={(dx, dy) => {
                    const moved = (dx * along.x + dy * along.y) / (along.x ** 2 + along.y ** 2);
                    const next = Math.min(reach, Math.max(0, start.current.at + moved));
                    calc.set(
                      {
                        ...rep.pin([spec.length, spec.height]),
                        [spec.at!]: rep.snapTo(spec.at!, next * f),
                      },
                      rep.slide(spec.at!),
                    );
                  }}
                />
              ) : null}
            </>
          );
        }}
      </Canvas>
      <Caption>{[cutLine, note, volumeLine].filter(Boolean).join(' · ')}</Caption>
    </View>
  );
}

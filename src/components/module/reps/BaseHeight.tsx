import { useRef, useState } from 'react';
import { View } from 'react-native';
import Svg, { G, Line, Path, Polygon } from 'react-native-svg';

import type { Representation } from '@/data/modules';
import { formatNumber } from '@/engine/format';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, Caption, DragHandle, useFrozen, useRep } from './common';
import { DimLine, Pill, RightAngle, pillSize, textW } from './dimKit';
import { arrowHead } from './graphKit';
import { Steppers } from './Steppers';

type Spec = Extract<Representation, { kind: 'baseHeight' }>;
type Pt = [number, number];

/** How far each shape may lean, as a fraction of its base. */
const LEAN_LIMIT = { parallelogram: 0.95, triangle: 1.2, trapezoid: 1, house: 0 } as const;

/** The shape in units (x along the base, y up): outline, where the height stands, the handle. */
function geometry(spec: Spec, b: number, hgt: number, top: number | undefined, lean: number) {
  const shift = lean * b;
  let outline: Pt[];
  let footX: number;
  let handleX: number;
  let topY = hgt;
  const extra: number[] = [];
  if (spec.shape === 'parallelogram') {
    outline = [
      [0, 0],
      [b, 0],
      [b + shift, hgt],
      [shift, hgt],
    ];
    // The height is the cut: at the top corner that overhangs the base.
    footX = shift >= 0 ? shift : b + shift;
    handleX = b + shift;
  } else if (spec.shape === 'triangle') {
    const apex = b / 2 + shift;
    outline = [
      [0, 0],
      [b, 0],
      [apex, hgt],
    ];
    footX = apex;
    handleX = apex;
    if (spec.show === 'double') extra.push(apex + b);
  } else if (spec.shape === 'trapezoid') {
    const t = top ?? b / 2;
    const left = (b - t) / 2 + shift;
    outline = [
      [0, 0],
      [b, 0],
      [left + t, hgt],
      [left, hgt],
    ];
    footX = left;
    handleX = left + t;
  } else {
    const roof = top ?? hgt / 2;
    outline = [
      [0, 0],
      [b, 0],
      [b, hgt],
      [b / 2, hgt + roof],
      [0, hgt],
    ];
    footX = b / 2;
    handleX = b / 2;
    topY = hgt + roof;
  }
  const xs = [...outline.map((p) => p[0]), footX, ...extra];
  return { outline, footX, handleX, shift, topY, minX: Math.min(...xs), maxX: Math.max(...xs) };
}

/** Where the horizontal line at height y crosses the outline: [left, right]. */
function span(outline: Pt[], y: number): [number, number] {
  const xs: number[] = [];
  outline.forEach(([x1, y1], i) => {
    const [x2, y2] = outline[(i + 1) % outline.length]!;
    if ((y1 - y) * (y2 - y) <= 0 && y1 !== y2) xs.push(x1 + ((y - y1) / (y2 - y1)) * (x2 - x1));
  });
  return [Math.min(...xs), Math.max(...xs)];
}

/**
 * A parallelogram, triangle, trapezoid or house shape, flat, with its base and height as
 * dimension lines: the base below with end ticks, the height a dashed perpendicular with
 * arrowheads and a square corner (outside the shape when it leans past the base). Drag the
 * top corner along its track to lean the shape: the base and height, and so the area, stay.
 * `rearrange` shades the parallelogram's cut-off triangle and repeats it dashed on the other
 * side (a rectangle base × height); `double` adds the triangle's turned copy as a faint
 * parallelogram; a trapezoid is cut by a diagonal into two triangles, each with its area.
 */
export function BaseHeight({ spec, calc }: { spec: Spec; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  const [lean, setLean] = useState(spec.shape === 'triangle' ? 0.35 : 0.3);
  const startLean = useRef(0);
  const b = Math.max(0.1, rep.shown(spec.base));
  const hgt = Math.max(0.1, rep.shown(spec.height));
  const top = spec.top ? Math.max(0.1, rep.shown(spec.top)) : undefined;
  const known = rep.known(spec.base) && rep.known(spec.height);
  const areaUnit = rep.unit(spec.area) ?? '';
  const n = (x: number) => formatNumber(Number(x.toFixed(3)));
  const withUnit = (x: number) => `${n(x)}${areaUnit ? ` ${areaUnit}` : ''}`;
  const house = spec.shape === 'house';

  const live = geometry(spec, b, hgt, top, lean);
  // The frame stays still while the corner is dragged, so the shape doesn't rescale underfoot.
  const frame = useFrozen({ minX: live.minX, maxX: live.maxX });
  const heightLabel = rep.named(spec.height);
  const topLabel = spec.top ? rep.named(spec.top) : '';

  const layout = (w: number) => {
    const L = 24;
    const R = house ? 30 + Math.max(textW(heightLabel), textW(topLabel)) : 24;
    const T = spec.shape === 'trapezoid' ? 48 : house ? 16 : 30;
    const B = 46;
    const { minX, maxX } = frame.value;
    const s = Math.min((w - L - R) / (maxX - minX), Math.min(0.62 * w, 260) / live.topY);
    const x0 = L + (w - L - R - (maxX - minX) * s) / 2 - minX * s;
    return { s, x0, y0: T + live.topY * s, h: T + live.topY * s + B };
  };

  return (
    <View>
      <Canvas aspect={(w) => layout(w).h / w}>
        {({ w }) => {
          const { s, x0, y0 } = layout(w);
          const X = (u: number) => x0 + u * s;
          const Y = (v: number) => y0 - v * s;
          const g = live;
          const pts = (p: Pt[]) => p.map(([u, v]) => `${X(u)},${Y(v)}`).join(' ');
          const { outline, footX, shift } = g;
          const outside = footX < 0 || footX > b;
          const heightTop = house ? g.topY : hgt;

          // The trapezoid's two area chips: one in each triangle.
          const chips: { x: number; y: number; text: string }[] =
            spec.shape === 'trapezoid' && top !== undefined
              ? [
                  {
                    x: X((outline[2]![0] * 0.22 + b + (outline[2]![0] - b) * 0.22) / 2),
                    y: Y(hgt * 0.22),
                    text: withUnit(0.5 * b * hgt),
                  },
                  {
                    x: X(((2 * outline[3]![0] + top) / 2) * 0.8),
                    y: Y(hgt * 0.8),
                    text: withUnit(0.5 * top * hgt),
                  },
                ]
              : [];
          // The height label sits beside the dashed height, clear of every line and chip: the
          // first of a few places (either side, a few heights) that touches nothing.
          const hp = pillSize(heightLabel);
          const segs: [number, number, number, number][] = outline.map(([u1, v1], i) => {
            const [u2, v2] = outline[(i + 1) % outline.length]!;
            return [X(u1), Y(v1), X(u2), Y(v2)];
          });
          if (spec.shape === 'trapezoid') segs.push([X(0), Y(0), X(outline[2]![0]), Y(hgt)]);
          if (spec.show === 'double' && spec.shape === 'triangle')
            segs.push(
              [X(b), Y(0), X(g.handleX + b), Y(hgt)],
              [X(g.handleX), Y(hgt), X(g.handleX + b), Y(hgt)],
            );
          const clear = (cx: number, cy: number) => {
            const [l0, r0, t0, b0] = [
              cx - hp.w / 2 - 3,
              cx + hp.w / 2 + 3,
              cy - hp.h / 2 - 3,
              cy + hp.h / 2 + 3,
            ];
            if (l0 < 2 || r0 > w - 2) return false;
            const hit = segs.some(([x1, y1, x2, y2]) =>
              Array.from({ length: 25 }, (_, k) => k / 24).some((t) => {
                const px = x1 + (x2 - x1) * t;
                const py = y1 + (y2 - y1) * t;
                return px > l0 && px < r0 && py > t0 && py < b0;
              }),
            );
            return (
              !hit &&
              chips.every((ch) => {
                const cw = pillSize(ch.text).w;
                return Math.abs(ch.x - cx) > (cw + hp.w) / 2 + 4 || Math.abs(ch.y - cy) > hp.h + 4;
              })
            );
          };
          const [inL, inR] = span(outline, hgt / 2);
          const roomy = inR - footX >= footX - inL ? 1 : -1;
          const spots = [0.5, 0.35, 0.65, 0.25, 0.75].flatMap((t) =>
            [roomy, -roomy].map((sd) => [X(footX) + sd * (hp.w / 2 + 8), Y(hgt * t)] as const),
          );
          const [hx, hy] = spots.find(([x, y]) => clear(x, y)) ?? spots[0]!;

          const lean0 = (d: number) => {
            const lim = LEAN_LIMIT[spec.shape];
            const fits = (l: number) => {
              const t = geometry(spec, b, hgt, top, l);
              return X(t.minX) >= 6 && X(t.maxX) <= w - 6 && Math.abs(l) <= lim;
            };
            let good = startLean.current;
            let want = startLean.current + d;
            if (fits(want)) return want;
            for (let i = 0; i < 14; i++) {
              const mid = (good + want) / 2;
              if (fits(mid)) good = mid;
              else want = mid;
            }
            return good;
          };

          return (
            <>
              <Svg width={w} height={layout(w).h} opacity={known ? 1 : 0.4}>
                {!house ? (
                  // The track the top corner slides along: a line parallel to the base.
                  <G>
                    <Line
                      x1={14}
                      y1={Y(hgt)}
                      x2={w - 14}
                      y2={Y(hgt)}
                      stroke={c.chartMuted}
                      strokeOpacity={0.55}
                      strokeWidth={chart.strokeLight}
                      strokeDasharray={chart.dashFine}
                    />
                    <Path d={arrowHead(6, Y(hgt), -1, 0, 8)} fill={c.chartMuted} opacity={0.7} />
                    <Path d={arrowHead(w - 6, Y(hgt), 1, 0, 8)} fill={c.chartMuted} opacity={0.7} />
                  </G>
                ) : null}
                {spec.show === 'double' && spec.shape === 'triangle' ? (
                  // The same triangle turned round: together they make a parallelogram.
                  <Polygon
                    points={pts([
                      [b, 0],
                      [g.handleX + b, hgt],
                      [g.handleX, hgt],
                    ])}
                    fill={c.chartSurface}
                    stroke={c.chartMuted}
                    strokeWidth={chart.strokeLight}
                    strokeDasharray={chart.dash}
                  />
                ) : null}
                {house ? (
                  <>
                    <Polygon
                      points={pts([
                        [0, 0],
                        [b, 0],
                        [b, hgt],
                        [0, hgt],
                      ])}
                      fill={c.chartHighlight}
                      fillOpacity={0.16}
                    />
                    <Polygon
                      points={pts([
                        [0, hgt],
                        [b, hgt],
                        [b / 2, g.topY],
                      ])}
                      fill={c.chartSecond}
                      fillOpacity={0.4}
                    />
                  </>
                ) : spec.shape === 'trapezoid' ? (
                  <>
                    <Polygon
                      points={pts([outline[0]!, outline[1]!, outline[2]!])}
                      fill={c.chartHighlight}
                      fillOpacity={0.16}
                    />
                    <Polygon
                      points={pts([outline[0]!, outline[2]!, outline[3]!])}
                      fill={c.chartSecond}
                      fillOpacity={0.35}
                    />
                  </>
                ) : (
                  <Polygon points={pts(outline)} fill={c.chartHighlight} fillOpacity={0.16} />
                )}
                {spec.show === 'rearrange' && spec.shape === 'parallelogram' && shift !== 0 ? (
                  // Cut off at the height and moved to the other side: a rectangle base × height.
                  <>
                    <Polygon
                      points={pts(
                        shift > 0
                          ? [
                              [0, 0],
                              [shift, 0],
                              [shift, hgt],
                            ]
                          : [
                              [b + shift, 0],
                              [b, 0],
                              [b + shift, hgt],
                            ],
                      )}
                      fill={c.chartSecond}
                      fillOpacity={0.55}
                    />
                    <Polygon
                      points={pts(
                        shift > 0
                          ? [
                              [b, 0],
                              [b + shift, 0],
                              [b + shift, hgt],
                            ]
                          : [
                              [shift, 0],
                              [0, 0],
                              [shift, hgt],
                            ],
                      )}
                      fill={c.chartSecond}
                      fillOpacity={0.22}
                      stroke={c.chartInk}
                      strokeOpacity={0.7}
                      strokeWidth={chart.strokeLight}
                      strokeDasharray={chart.dash}
                    />
                  </>
                ) : null}
                <Polygon
                  points={pts(outline)}
                  fill="none"
                  stroke={c.chartInk}
                  strokeWidth={chart.stroke}
                  strokeLinejoin="round"
                />
                {spec.shape === 'trapezoid' ? (
                  <Line
                    x1={X(0)}
                    y1={Y(0)}
                    x2={X(outline[2]![0])}
                    y2={Y(hgt)}
                    stroke={c.chartInk}
                    strokeWidth={chart.strokeLight}
                    strokeDasharray={chart.dash}
                  />
                ) : null}
                {house ? (
                  <Line
                    x1={X(0)}
                    y1={Y(hgt)}
                    x2={X(b)}
                    y2={Y(hgt)}
                    stroke={c.chartInk}
                    strokeWidth={chart.strokeLight}
                    strokeDasharray={chart.dash}
                  />
                ) : null}
                {outside ? (
                  // The base extended to the foot of the height.
                  <Line
                    x1={X(Math.min(0, footX))}
                    y1={Y(0)}
                    x2={X(Math.max(b, footX))}
                    y2={Y(0)}
                    stroke={c.chartMuted}
                    strokeWidth={chart.strokeLight}
                    strokeDasharray={chart.dashFine}
                  />
                ) : null}

                {/* The height: dashed, arrowheads at both ends, a square corner at the foot. */}
                <Line
                  x1={X(footX)}
                  y1={Y(house ? hgt : 0) - 7}
                  x2={X(footX)}
                  y2={Y(heightTop) + 7}
                  stroke={c.chartInk}
                  strokeWidth={chart.strokeLight}
                  strokeDasharray={chart.dash}
                />
                <Path d={arrowHead(X(footX), Y(house ? hgt : 0), 0, 1, 8)} fill={c.chartInk} />
                <Path d={arrowHead(X(footX), Y(heightTop), 0, -1, 8)} fill={c.chartInk} />
                <RightAngle
                  x={X(footX)}
                  y={Y(house ? hgt : 0)}
                  dx={footX < b / 2 ? 1 : -1}
                  dy={-1}
                />

                {/* The base: a dimension line under it, with extension lines at its ends. */}
                <Path
                  d={`M ${X(0)} ${Y(0) + 4} v 18 M ${X(b)} ${Y(0) + 4} v 18`}
                  stroke={c.chartMuted}
                  strokeWidth={1}
                />
                <DimLine
                  x1={X(0)}
                  y1={Y(0) + 17}
                  x2={X(b)}
                  y2={Y(0) + 17}
                  side="below"
                  label={rep.named(spec.base)}
                  w={w}
                />

                {house ? (
                  // Wall height and roof height as one dimension line on the right.
                  <G>
                    <Path
                      d={`M ${X(b) + 4} ${Y(0)} H ${X(b) + 24} M ${X(b) + 4} ${Y(hgt)} H ${X(b) + 24} M ${X(b / 2) + 6} ${Y(g.topY)} H ${X(b) + 24}`}
                      stroke={c.chartMuted}
                      strokeWidth={1}
                      strokeDasharray={chart.dashFine}
                    />
                    <DimLine
                      x1={X(b) + 19}
                      y1={Y(0)}
                      x2={X(b) + 19}
                      y2={Y(hgt)}
                      side="right"
                      label={heightLabel}
                    />
                    <DimLine
                      x1={X(b) + 19}
                      y1={Y(hgt)}
                      x2={X(b) + 19}
                      y2={Y(g.topY)}
                      side="right"
                      label={topLabel}
                    />
                  </G>
                ) : (
                  <Pill x={hx} y={hy} text={heightLabel} w={w} />
                )}

                {spec.shape === 'trapezoid' && top !== undefined ? (
                  <G>
                    <Path
                      d={`M ${X(outline[3]![0])} ${Y(hgt) - 13} v -15 M ${X(outline[2]![0])} ${Y(hgt) - 13} v -15`}
                      stroke={c.chartMuted}
                      strokeWidth={1}
                    />
                    <DimLine
                      x1={X(outline[3]![0])}
                      y1={Y(hgt) - 22}
                      x2={X(outline[2]![0])}
                      y2={Y(hgt) - 22}
                      side="above"
                      label={topLabel}
                      w={w}
                    />
                    {/* Each triangle's area inside it: ½ × base × height. */}
                    {chips.map((ch, i) => (
                      <Pill key={i} x={ch.x} y={ch.y} text={ch.text} />
                    ))}
                  </G>
                ) : null}
              </Svg>
              {!house ? (
                <DragHandle
                  testID="drag-lean"
                  x={X(g.handleX)}
                  y={Y(hgt)}
                  label="Lean"
                  onStart={() => {
                    startLean.current = lean;
                    frame.freeze();
                  }}
                  onMove={(dx) => setLean(lean0(dx / (b * s)))}
                  onEnd={frame.release}
                />
              ) : null}
            </>
          );
        }}
      </Canvas>
      <Caption>{caption()}</Caption>
      <Steppers
        calc={calc}
        items={[
          { var: spec.base, steps: [1], pin: [spec.height, ...(spec.top ? [spec.top] : [])] },
          { var: spec.height, steps: [1], pin: [spec.base, ...(spec.top ? [spec.top] : [])] },
        ]}
      />
    </View>
  );

  function caption() {
    if (!known || !rep.known(spec.area)) return 'Type the base and the height.';
    const area = `Area: ${rep.value(spec.area, false)}${areaUnit ? ` ${areaUnit}` : ''}.`;
    const lean = 'Leaning the shape keeps the base, the height and the area.';
    if (house) return `${area} The rectangle and the triangle roof add up to the whole shape.`;
    if (spec.show === 'rearrange' && spec.shape === 'parallelogram')
      return `${area} Move the yellow triangle to the other side: a rectangle ${n(b)} by ${n(hgt)}. ${lean}`;
    if (spec.show === 'double' && spec.shape === 'triangle')
      return `${area} Two copies make a parallelogram ${n(b)} by ${n(hgt)}: the triangle is half. ${lean}`;
    return `${area} ${lean}`;
  }
}

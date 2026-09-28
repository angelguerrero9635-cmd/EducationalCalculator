import { useRef, type ReactNode } from 'react';
import Svg, { Defs, G, Line, Path, Polygon, Rect } from 'react-native-svg';

import type { Representation } from '@/data/modules';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, ChartText, DragHandle, useFrozen, useRep } from './common';
import { DimLine, Pill, pillSize, textW } from './dimKit';
import { TopLight, url, usePaintIds } from './paint';

type Spec = Extract<Representation, { kind: 'rectangle' }>;

/**
 * A rectangle drawn to scale, flat: its unit squares in a light two-tint checkerboard you can
 * count, the area on a pill in the middle, and dimension lines with end ticks for the length
 * (below) and the width (left). With a perimeter the outline is drawn heavy in the highlight
 * and all four sides are labelled (perimeter alone: a mark at each unit along the edge).
 * `roof` draws it as a real slate roof in perspective with rain falling on it. Drag the corner
 * to change both sides.
 */
export function RectangleDiagram({ spec, calc }: { spec: Spec; calc: Calculator }) {
  return spec.roof ? <Roof spec={spec} calc={calc} /> : <Flat spec={spec} calc={calc} />;
}

function Flat({ spec, calc }: { spec: Spec; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  const start = useRef({ l: 0, w: 0 });
  const l = rep.val(spec.length);
  const wd = rep.val(spec.width);
  const faded = ![spec.length, spec.width].every(rep.known);
  // Extent and unit squares are in the shown unit; geometry stays in formula units.
  const f = rep.factor(spec.length);
  // Sized from the values shown, with room to drag a little longer (and at least 0.4 of the
  // extent, so a 1 by 1 isn't a giant); held still while the corner is dragged.
  const floor = spec.extent * 0.4 * f;
  const fit = useFrozen({ L: Math.max(l * 1.15, floor), W: Math.max(wd, floor), l });
  const sl = rep.shown(spec.length);
  const sw = rep.shown(spec.width);
  const sameUnit = rep.unit(spec.length) === rep.unit(spec.width);
  const around = !!spec.around;
  const lenLabel = rep.label(spec.length);
  const widLabel = rep.label(spec.width);

  // Room around the rectangle: the width's label on the left (and right, with a perimeter),
  // the length's below (and above), the perimeter line at the bottom.
  const padL = textW(widLabel) + (around ? 14 : 30);
  const padR = around ? textW(widLabel) + 30 : 26;
  const baseTop = around ? 30 : 16;
  const below = around ? 60 : 50;
  const inside = spec.inside ? rep.label(spec.inside) : '';
  const pill = pillSize(inside, chart.emphasis);
  const layout = (w: number) => {
    const unit = Math.min(
      (w - padL - padR - 16) / fit.value.L,
      Math.min(260, 0.7 * w) / fit.value.W,
    );
    const group = padL + fit.value.l * unit + padR;
    const x0 = (w - group) / 2 + padL;
    const rw = l * unit;
    const rh = wd * unit;
    // Where the area label goes: on a pill inside; beside a thin shape when the canvas has
    // room at the right; else on a pill above the shape (a 12 by 1 fills the width).
    const pillFits = pill.w + 8 <= rw && pill.h + 6 <= rh;
    const fitsRight = x0 + rw + 30 + textW(inside, chart.emphasis) <= w - 4;
    const above = !!spec.inside && !pillFits && !fitsRight;
    const top = baseTop + (above ? pill.h + 6 : 0);
    return { unit, x0, top, pillFits, above, h: top + Math.max(40, rh) + below };
  };

  return (
    <Canvas aspect={(w) => layout(w).h / w}>
      {({ w, h }) => {
        const { unit, x0, top, pillFits, above } = layout(w);
        const rw = l * unit;
        const rh = wd * unit;
        const cellPx = unit * f;
        const whole = sameUnit && Number.isInteger(sl) && Number.isInteger(sw) && cellPx >= 6;
        // Perimeter alone: marks along the edge (a length to walk around), not squares inside.
        const edgeOnly = around && !spec.inside && !spec.grid;
        const showGrid = whole && !edgeOnly;
        const tick = (x: number, y: number, dx: number, dy: number, key: string) => (
          <Line
            key={key}
            x1={x - dx * 6}
            y1={y - dy * 6}
            x2={x + dx * 6}
            y2={y + dy * 6}
            stroke={c.chartInk}
            strokeWidth={chart.strokeLight}
          />
        );
        const cells: ReactNode[] = [];
        if (showGrid && cellPx >= 9)
          for (let i = 0; i < sl; i++)
            for (let j = 0; j < sw; j++)
              if ((i + j) % 2)
                cells.push(
                  <Rect
                    key={`c${i}-${j}`}
                    x={x0 + i * cellPx}
                    y={top + j * cellPx}
                    width={cellPx}
                    height={cellPx}
                    fill={c.chartHighlight}
                    fillOpacity={0.09}
                  />,
                );
        const rightX = x0 + rw + (rh < 60 ? 26 : 10);
        return (
          <>
            <Svg width={w} height={h} opacity={faded ? 0.4 : 1}>
              <Rect
                x={x0}
                y={top}
                width={rw}
                height={rh}
                fill={showGrid ? c.chartHighlight : c.chartFill}
                fillOpacity={showGrid ? 0.1 : 1}
              />
              {cells}
              {showGrid ? (
                <Path
                  d={[
                    ...Array.from(
                      { length: Math.max(0, sl - 1) },
                      (_, i) => `M ${x0 + (i + 1) * cellPx} ${top} v ${rh}`,
                    ),
                    ...Array.from(
                      { length: Math.max(0, sw - 1) },
                      (_, i) => `M ${x0} ${top + (i + 1) * cellPx} h ${rw}`,
                    ),
                  ].join(' ')}
                  stroke={c.chartHighlight}
                  strokeOpacity={0.4}
                  strokeWidth={1}
                />
              ) : null}
              {whole && edgeOnly
                ? [
                    ...Array.from({ length: Math.max(0, sl - 1) }, (_, i) => [
                      tick(x0 + (i + 1) * cellPx, top, 0, 1, `t${i}`),
                      tick(x0 + (i + 1) * cellPx, top + rh, 0, 1, `b${i}`),
                    ]).flat(),
                    ...Array.from({ length: Math.max(0, sw - 1) }, (_, i) => [
                      tick(x0, top + (i + 1) * cellPx, 1, 0, `l${i}`),
                      tick(x0 + rw, top + (i + 1) * cellPx, 1, 0, `r${i}`),
                    ]).flat(),
                  ]
                : null}
              <Rect
                x={x0}
                y={top}
                width={rw}
                height={rh}
                fill="none"
                stroke={around ? c.chartHighlight : c.chartInk}
                strokeWidth={around ? chart.strokeHeavy + 1 : chart.stroke}
                strokeLinejoin="round"
              />
              {around ? (
                // All four sides labelled: the perimeter is the walk around them.
                <G>
                  <ChartText
                    x={x0 + rw / 2}
                    y={top + rh + 22}
                    fontSize={chart.value}
                    fontWeight="700"
                    textAnchor="middle"
                  >
                    {lenLabel}
                  </ChartText>
                  <ChartText
                    x={x0 + rw / 2}
                    y={top - 10}
                    fontSize={chart.value}
                    fontWeight="700"
                    textAnchor="middle"
                  >
                    {lenLabel}
                  </ChartText>
                  <ChartText
                    x={x0 - 10}
                    y={top + rh / 2 + 4.5}
                    fontSize={chart.value}
                    fontWeight="700"
                    textAnchor="end"
                  >
                    {widLabel}
                  </ChartText>
                  <ChartText
                    x={rightX}
                    y={top + rh / 2 + 4.5}
                    fontSize={chart.value}
                    fontWeight="700"
                    textAnchor="start"
                  >
                    {widLabel}
                  </ChartText>
                  <ChartText
                    x={w / 2}
                    y={top + rh + 48}
                    fontSize={chart.value}
                    fontWeight="700"
                    fill={c.chartHighlight}
                    textAnchor="middle"
                  >
                    {`${rep.tag(spec.around!)}: ${rep.value(spec.around!)} all the way around`}
                  </ChartText>
                </G>
              ) : (
                <G>
                  <Path
                    d={`M ${x0} ${top + rh + 4} v 16 M ${x0 + rw} ${top + rh + 4} v 16 M ${x0 - 4} ${top} h -20 M ${x0 - 4} ${top + rh} h -20`}
                    stroke={c.chartMuted}
                    strokeWidth={1}
                  />
                  <DimLine
                    x1={x0}
                    y1={top + rh + 15}
                    x2={x0 + rw}
                    y2={top + rh + 15}
                    side="below"
                    label={lenLabel}
                    w={w}
                  />
                  <DimLine
                    x1={x0 - 15}
                    y1={top}
                    x2={x0 - 15}
                    y2={top + rh}
                    side="left"
                    label={widLabel}
                  />
                </G>
              )}
              {spec.inside ? (
                pillFits ? (
                  <Pill
                    x={x0 + rw / 2}
                    y={top + rh / 2}
                    text={inside}
                    size={chart.emphasis}
                    stroke={c.chartMuted}
                  />
                ) : above ? (
                  // Too thin to hold the pill and no room at the right: it sits above.
                  <Pill
                    x={x0 + rw / 2}
                    y={top - pill.h / 2 - 4}
                    text={inside}
                    size={chart.emphasis}
                    stroke={c.chartMuted}
                    w={w}
                  />
                ) : (
                  // Too small to hold the pill: the area sits to the right.
                  <ChartText
                    x={x0 + rw + 30}
                    y={top + rh / 2 - (around ? 14 : -5)}
                    fontSize={chart.emphasis}
                    fontWeight="700"
                    textAnchor="start"
                  >
                    {inside}
                  </ChartText>
                )
              ) : null}
            </Svg>
            <DragHandle
              testID="drag-corner"
              x={x0 + rw}
              y={top + rh}
              label={`${rep.variable(spec.length).name} and ${rep.variable(spec.width).name}`}
              onStart={() => {
                start.current = { l, w: wd };
                fit.freeze();
              }}
              onEnd={fit.release}
              onMove={(dx, dy) =>
                calc.set({
                  [spec.length]: rep.snapTo(spec.length, start.current.l + dx / unit),
                  [spec.width]: rep.snapTo(spec.width, start.current.w + dy / unit),
                })
              }
            />
          </>
        );
      }}
    </Canvas>
  );
}

/** How the roof's depth (its width) is drawn: across and up, and the ground's slope below. */
const DEPTH_X = 0.45;
const DEPTH_Y = 0.5;
const GROUND_Y = 0.16;

/**
 * The rectangle as a real roof, seen from the front and above: slate shingles lit from the top
 * left, a metal gutter along the front edge, the house's walls below, and rain falling on it.
 * The length runs along the front edge and the width back along the roof; both are drawn to
 * scale, with the area on a pill in the middle of the roof.
 */
function Roof({ spec, calc }: { spec: Spec; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  const ids = usePaintIds('roofLight', 'wallLight');
  const start = useRef({ l: 0, w: 0 });
  const l = rep.val(spec.length);
  const wd = rep.val(spec.width);
  const faded = ![spec.length, spec.width].every(rep.known);
  const f = rep.factor(spec.length);
  const half = (spec.extent / 2) * f;
  const fit = useFrozen({ L: Math.max(l, half * 0.6), W: Math.max(wd, half * 0.3), l, wd });
  const lenLabel = rep.label(spec.length);
  const widLabel = rep.label(spec.width);
  const rain = 34;
  const below = 46;
  const padR = 20;
  const layout = (w: number) => {
    const { L, W } = fit.value;
    // The width's label sits left of the middle of the roof's left edge, which leans right:
    // the room it needs on the left shrinks as the roof gets deeper.
    const unitFor = (padL: number) =>
      Math.min(
        (w - padL - padR - 8) / (L + DEPTH_X * W),
        Math.min(240, 0.6 * w) / (DEPTH_Y * W + 0.2 * L),
      );
    const first = unitFor(textW(widLabel) + 34);
    const padL = Math.max(16, textW(widLabel) + 38 - (DEPTH_X * fit.value.wd * first) / 2);
    const unit = unitFor(padL);
    const wallH = Math.max(30, Math.min(56, 0.16 * L * unit));
    const group = padL + (fit.value.l + DEPTH_X * fit.value.wd) * unit + padR;
    const x0 = (w - group) / 2 + padL;
    const yb = rain + DEPTH_Y * fit.value.wd * unit;
    return { unit, wallH, x0, yb, h: yb + wallH + below };
  };

  return (
    <Canvas aspect={(w) => layout(w).h / w}>
      {({ w, h }) => {
        const { unit, wallH, x0 } = layout(w);
        // The front edge stays put while dragging; the back edge moves with the width.
        const yb = layout(w).yb;
        const L = l * unit;
        const dx = DEPTH_X * wd * unit;
        const dy = DEPTH_Y * wd * unit;
        const gy = GROUND_Y * wd * unit;
        const p0: [number, number] = [x0, yb];
        const p1: [number, number] = [x0 + L, yb];
        const p2: [number, number] = [x0 + L + dx, yb - dy];
        const p3: [number, number] = [x0 + dx, yb - dy];
        const pts = (p: [number, number][]) => p.map(([x, y]) => `${x},${y}`).join(' ');
        const ground = yb + wallH;
        // Shingle courses: lines parallel to the front edge, and staggered tab joints.
        const rows = Math.max(3, Math.round(Math.hypot(dx, dy) / 9));
        const shingles: string[] = [];
        for (let i = 1; i < rows; i++) {
          const t = i / rows;
          const ax = x0 + dx * t;
          const ay = yb - dy * t;
          shingles.push(`M ${ax} ${ay} h ${L}`);
        }
        const tab = 16;
        for (let i = 0; i < rows; i++) {
          const t0 = i / rows;
          const t1 = (i + 1) / rows;
          const off = (i % 2) * (tab / 2);
          for (let s = off + tab; s < L - 2; s += tab)
            shingles.push(
              `M ${x0 + dx * t0 + s} ${yb - dy * t0} L ${x0 + dx * t1 + s} ${yb - dy * t1}`,
            );
        }
        // Rain: short slanted streaks above the roof, stopping at its surface.
        const topAt = (x: number) =>
          x < p3[0] ? yb - ((x - x0) / Math.max(1, dx)) * dy : x <= p2[0] ? yb - dy : 0;
        const streaks: string[] = [];
        let k = 0;
        for (let x = x0 + 6; x < p2[0] - 4; x += 17) {
          k++;
          const bottom = topAt(x) - 5;
          for (let y = 4 + ((k * 7) % 22); y + 12 < bottom; y += 26)
            streaks.push(`M ${x + 3} ${y} l -3 12`);
        }
        const doorW = Math.min(26, L * 0.12);
        const winW = Math.min(34, L * 0.16);
        return (
          <>
            <Svg width={w} height={h} opacity={faded ? 0.4 : 1}>
              <Defs>
                <TopLight id={ids.roofLight} />
                <TopLight id={ids.wallLight} strength={0.6} />
              </Defs>
              {/* The ground's shadow, then the side wall (in shade) and the front wall. */}
              <Polygon
                points={pts([
                  [x0 - 6, ground + 2],
                  [x0 + L + 6, ground + 2],
                  [x0 + L + dx + 6, ground - gy + 2],
                ])}
                fill={c.shadow}
              />
              <Polygon
                points={pts([p1, p2, [p2[0], ground - gy], [p1[0], ground]])}
                fill={c.rock3}
              />
              <Polygon
                points={pts([p1, p2, [p2[0], ground - gy], [p1[0], ground]])}
                fill={c.shade}
                fillOpacity={0.18}
              />
              <Rect x={x0} y={yb} width={L} height={wallH} fill={c.rock3} />
              <Rect x={x0} y={yb} width={L} height={wallH} fill={url(ids.wallLight)} />
              {/* A door and a window, so it reads as a house. */}
              <Rect
                x={x0 + L * 0.2}
                y={ground - wallH * 0.62}
                width={doorW}
                height={wallH * 0.62}
                fill={c.wood}
                stroke={c.woodDark}
              />
              <Rect
                x={x0 + L * 0.62}
                y={yb + wallH * 0.32}
                width={winW}
                height={wallH * 0.36}
                fill={c.glass}
                stroke={c.glassEdge}
                strokeWidth={chart.strokeLight}
              />
              <Line
                x1={x0 - 10}
                y1={ground}
                x2={x0 + L + dx + 12}
                y2={ground}
                stroke={c.soil}
                strokeWidth={chart.stroke}
                strokeLinecap="round"
              />
              {/* The roof: slate, lit from above, with its shingle courses. */}
              <Polygon points={pts([p0, p1, p2, p3])} fill={c.rock2} />
              <Polygon points={pts([p0, p1, p2, p3])} fill={url(ids.roofLight)} />
              <Path d={shingles.join(' ')} stroke={c.shade} strokeOpacity={0.28} strokeWidth={1} />
              <Polygon
                points={pts([p0, p1, p2, p3])}
                fill="none"
                stroke={c.metalDark}
                strokeWidth={chart.strokeLight}
                strokeLinejoin="round"
              />
              {/* The gutter along the front edge. */}
              <Rect
                x={x0 - 3}
                y={yb - 1}
                width={L + 6}
                height={6}
                rx={2}
                fill={c.metal}
                stroke={c.metalDark}
                strokeWidth={1}
              />
              <Path
                d={streaks.join(' ')}
                stroke={c.water}
                strokeWidth={chart.strokeLight}
                strokeLinecap="round"
                opacity={0.85}
              />
              {/* The length along the front, the width back along the roof's left edge. */}
              <DimLine
                x1={x0}
                y1={ground + 14}
                x2={x0 + L}
                y2={ground + 14}
                side="below"
                label={lenLabel}
                w={w}
              />
              <SlantDim
                x1={x0 - 12}
                y1={yb - 4}
                x2={x0 - 12 + dx}
                y2={yb - 4 - dy}
                label={widLabel}
              />
              {spec.inside ? (
                <Pill
                  x={x0 + L / 2 + dx / 2}
                  y={yb - dy / 2}
                  text={rep.label(spec.inside)}
                  size={chart.emphasis}
                  stroke={c.metalDark}
                />
              ) : null}
            </Svg>
            <DragHandle
              testID="drag-corner"
              x={p2[0]}
              y={p2[1]}
              label={`${rep.variable(spec.length).name} and ${rep.variable(spec.width).name}`}
              onStart={() => {
                start.current = { l, w: wd };
                fit.freeze();
              }}
              onEnd={fit.release}
              onMove={(mx, my) => {
                // Up the roof is the width; what's left across is the length.
                const dw = -my / (DEPTH_Y * unit);
                const dl = (mx - DEPTH_X * dw * unit) / unit;
                calc.set({
                  [spec.length]: rep.snapTo(spec.length, start.current.l + dl),
                  [spec.width]: rep.snapTo(spec.width, start.current.w + dw),
                });
              }}
            />
          </>
        );
      }}
    </Canvas>
  );
}

/** A dimension line along a slanted edge, ticks across it, its label to the left. */
function SlantDim({
  x1,
  y1,
  x2,
  y2,
  label,
}: {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  label: string;
}) {
  const c = usePalette();
  const len = Math.hypot(x2 - x1, y2 - y1) || 1;
  // Unit normal pointing up and left, away from the roof.
  const nx = -(y1 - y2) / len;
  const ny = -(x2 - x1) / len;
  const t = 5;
  return (
    <G>
      <Line x1={x1} y1={y1} x2={x2} y2={y2} stroke={c.chartInk} strokeWidth={chart.strokeLight} />
      <Path
        d={`M ${x1 - nx * t} ${y1 - ny * t} l ${2 * nx * t} ${2 * ny * t} M ${x2 - nx * t} ${y2 - ny * t} l ${2 * nx * t} ${2 * ny * t}`}
        stroke={c.chartInk}
        strokeWidth={chart.strokeLight}
      />
      <Rect
        x={(x1 + x2) / 2 - 16 - textW(label) - 4}
        y={(y1 + y2) / 2 - 9}
        width={textW(label) + 8}
        height={18}
        rx={9}
        fill={c.card}
        opacity={0.9}
      />
      <ChartText
        x={(x1 + x2) / 2 - 16}
        y={(y1 + y2) / 2 + 4.5}
        fontSize={chart.value}
        fontWeight="700"
        textAnchor="end"
      >
        {label}
      </ChartText>
    </G>
  );
}

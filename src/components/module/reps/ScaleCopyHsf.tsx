/**
 * The Grades 9–12 scaled-copy pictures (H24): a dilation from any center on one grid, with a
 * ray from the center through each corner and its image; and the side-splitter, a triangle cut
 * by a line parallel to its base, which is the triangle dilated from its top corner.
 */
import { useRef } from 'react';
import { View } from 'react-native';
import Svg, { Circle, G, Line, Path, Polygon } from 'react-native-svg';

import type { Representation } from '@/data/modules';
import { formatNumber } from '@/engine/format';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, Caption, ChartText, DragHandle, fitLabel, useFrozen, useRep } from './common';
import { coef } from './graphKit';
import { outline } from './scaleOutline';
import { splitterShape } from './scaleSplitter';

type Spec = Extract<Representation, { kind: 'scaleCopy' }>;
type Pt = [number, number];

const LETTERS = 'ABCDEF';

/** Readers for a spec value: a fixed number or a variable. */
function useValues(calc: Calculator) {
  const rep = useRep(calc);
  return {
    rep,
    num: (v: string | number) => (typeof v === 'number' ? v : rep.shown(v)),
    known: (v: string | number) => typeof v === 'number' || rep.known(v),
    text: (v: string | number) => (typeof v === 'number' ? formatNumber(v) : rep.value(v)),
  };
}

/**
 * The original and its image under a dilation from a center, on one grid: the center O, a
 * dashed ray from O through each corner out to the farther of the corner and its image, the
 * corners lettered A, B, … and A′, B′, …. Drag the image's corner along its ray.
 */
export function ScaleDilation({ spec, calc }: { spec: Spec; calc: Calculator }) {
  const c = usePalette();
  const { rep, num, known, text } = useValues(calc);
  const start = useRef({ k: 1, x: 0, y: 0 });
  const W = Math.max(1, num(spec.width));
  const H = Math.max(1, num(spec.height));
  const kKnown = rep.known(spec.factor);
  const k = Math.max(0.05, rep.shown(spec.factor));
  const O: Pt = [num(spec.center![0]), num(spec.center![1])];
  const oKnown = known(spec.center![0]) && known(spec.center![1]);
  const pts = outline(spec.shape, W, H);
  const img = pts.map(([x, y]) => [O[0] + k * (x - O[0]), O[1] + k * (y - O[1])] as Pt);
  // The grid: every corner, image and the center, with a square to spare all round.
  const all = [...pts, ...img, O];
  const box = useFrozen({
    x0: Math.floor(Math.min(...all.map((p) => p[0]))) - 1,
    x1: Math.ceil(Math.max(...all.map((p) => p[0]))) + 1,
    y0: Math.floor(Math.min(...all.map((p) => p[1]))) - 1,
    y1: Math.ceil(Math.max(...all.map((p) => p[1]))) + 1,
  });
  const { x0, x1, y0, y1 } = box.value;
  const [cols, rows] = [x1 - x0, y1 - y0];
  const K = formatNumber(k);
  // The handle's corner: the one farthest from the center (it moves most with the factor).
  const far = pts.reduce(
    (b, p, i) =>
      Math.hypot(p[0] - O[0], p[1] - O[1]) > b.d
        ? { i, d: Math.hypot(p[0] - O[0], p[1] - O[1]) }
        : b,
    { i: 0, d: -1 },
  );
  const plain = (id: string | undefined, x: number) =>
    id && rep.known(id) ? formatNumber(rep.shown(id)) : formatNumber(x);
  const lines: string[] = [];
  if (!kKnown) lines.push('Scale factor: ?');
  else {
    lines.push(
      `Dilation from O by scale factor ${K}: each image corner is ${K} times as far from O, on the same ray`,
    );
    lines.push(
      k < 1
        ? 'A factor under 1 shrinks the figure toward O'
        : k > 1
          ? 'A factor over 1 stretches the figure away from O'
          : 'A factor of 1 leaves the figure where it is',
    );
    if (known(spec.width))
      lines.push(`Width: ${formatNumber(W)} × ${K} = ${plain(spec.copyWidth, W * k)}`);
    if (known(spec.height))
      lines.push(`Height: ${formatNumber(H)} × ${K} = ${plain(spec.copyHeight, H * k)}`);
    if (spec.area && rep.known(spec.area[0]))
      lines.push(
        `Area: ${formatNumber(rep.shown(spec.area[0]))} × ${K} × ${K} = ${plain(spec.area[1], rep.shown(spec.area[0]) * k * k)}`,
      );
  }

  const size = (w: number) => Math.min(30, (w - 16) / cols, 320 / rows);
  return (
    <View>
      <Canvas aspect={(w) => (rows * size(w) + 24) / w}>
        {({ w, h }) => {
          const s = size(w);
          const gx = (w - cols * s) / 2;
          const top = 12;
          const P = ([x, y]: Pt) => [gx + (x - x0) * s, top + (y1 - y) * s] as const;
          const poly = (ps: Pt[]) => ps.map((p) => P(p).join(',')).join(' ');
          const [ox, oy] = P(O);
          const centroid = (ps: Pt[]): [number, number] => [
            ps.reduce((t, p) => t + P(p)[0], 0) / ps.length,
            ps.reduce((t, p) => t + P(p)[1], 0) / ps.length,
          ];
          /** Corner letters, pushed out from the middle of their figure. */
          const letters = (ps: Pt[], mark: string, color: string) => {
            const [mx, my] = centroid(ps);
            return ps.map((p, i) => {
              // A corner at the center stays put: O names it.
              if (Math.hypot(p[0] - O[0], p[1] - O[1]) < 1e-9) return null;
              const [x, y] = P(p);
              const t = Math.atan2(y - my, x - mx);
              // The handle's corner letter stands clear of the handle.
              const gap = mark && i === far.i ? 22 : 13;
              const lx = Math.min(w - 8, Math.max(8, x + Math.cos(t) * gap));
              const ly = Math.min(h - 3, Math.max(11, y + Math.sin(t) * gap + 4));
              return (
                <ChartText
                  key={`${mark}${i}`}
                  x={lx}
                  y={ly}
                  textAnchor="middle"
                  fontWeight="700"
                  fill={color}
                >
                  {`${LETTERS[i]}${mark}`}
                </ChartText>
              );
            });
          };
          const handle = P(img[far.i]!);
          const [hx, hy] = P(pts[far.i]!);
          // "× k" beside the ray with the most room: between a corner and its image, off the
          // corners, their letters and the center.
          const marks = [...pts, ...img].map(P);
          const factorAt = pts
            .map((p, i) => {
              const [px, py] = P(p);
              const [qx, qy] = P(img[i]!);
              const len = Math.hypot(qx - px, qy - py);
              if (len < 1) return undefined;
              const [nx, ny] = [-(qy - py) / len, (qx - px) / len];
              return [1, -1].map((side) => {
                const [lx, ly] = [(px + qx) / 2 + side * nx * 14, (py + qy) / 2 + side * ny * 14];
                const room = Math.min(
                  Math.hypot(lx - ox, ly - oy),
                  ...marks.map(([mx, my]) => Math.hypot(lx - mx, ly - my)),
                  lx - 20,
                  w - 20 - lx,
                );
                return { lx, ly, room };
              });
            })
            .flat()
            .filter((x): x is { lx: number; ly: number; room: number } => !!x)
            .reduce((b, x) => (x.room > b.room ? x : b), {
              lx: (hx + handle[0]) / 2 + 10,
              ly: (hy + handle[1]) / 2,
              room: -Infinity,
            });
          return (
            <>
              <Svg width={w} height={h}>
                {Array.from({ length: cols + 1 }, (_, i) => (
                  <Line
                    key={`c${i}`}
                    x1={gx + i * s}
                    y1={top}
                    x2={gx + i * s}
                    y2={top + rows * s}
                    stroke={c.chartGrid}
                    strokeWidth={1}
                  />
                ))}
                {Array.from({ length: rows + 1 }, (_, i) => (
                  <Line
                    key={`r${i}`}
                    x1={gx}
                    y1={top + i * s}
                    x2={gx + cols * s}
                    y2={top + i * s}
                    stroke={c.chartGrid}
                    strokeWidth={1}
                  />
                ))}
                {/* Rays from O through each corner, out to the farther of it and its image. */}
                {kKnown && oKnown
                  ? pts.map((p, i) => {
                      const q = k >= 1 ? img[i]! : p;
                      const [qx, qy] = P(q);
                      return (
                        <Line
                          key={`ray${i}`}
                          x1={ox}
                          y1={oy}
                          x2={qx}
                          y2={qy}
                          stroke={c.chartMuted}
                          strokeWidth={1}
                          strokeDasharray={chart.dash}
                        />
                      );
                    })
                  : null}
                <Polygon
                  opacity={known(spec.width) && known(spec.height) ? 1 : 0.35}
                  points={poly(pts)}
                  fill={c.chartSecond}
                  fillOpacity={0.45}
                  stroke={c.chartInk}
                  strokeWidth={chart.stroke}
                  strokeLinejoin="round"
                />
                <G opacity={kKnown && oKnown ? 1 : 0.35}>
                  <Polygon
                    points={poly(img)}
                    fill={c.chartHighlight}
                    fillOpacity={0.25}
                    stroke={c.chartHighlight}
                    strokeWidth={chart.stroke}
                    strokeLinejoin="round"
                  />
                </G>
                {letters(pts, '', c.chartInk)}
                {kKnown && oKnown ? letters(img, '′', c.chartHighlight) : null}
                <Circle cx={ox} cy={oy} r={4.5} fill={c.chartInk} opacity={oKnown ? 1 : 0.35} />
                <ChartText
                  {...fitLabel(ox - 8, 'O', chart.label, w, 'end', 8)}
                  y={oy + 16}
                  fontWeight="700"
                >
                  O
                </ChartText>
                {kKnown ? (
                  <ChartText
                    {...fitLabel(factorAt.lx, `× ${K}`, chart.label, w)}
                    y={factorAt.ly + 4}
                    fontWeight="700"
                    fill={c.chartHighlight}
                  >
                    {`× ${K}`}
                  </ChartText>
                ) : null}
                {known(spec.width) ? (
                  <ChartText
                    {...fitLabel(P([W / 2, 0])[0], text(spec.width), chart.label, w)}
                    y={P([0, 0])[1] - 6}
                    fontWeight="700"
                  >
                    {text(spec.width)}
                  </ChartText>
                ) : null}
              </Svg>
              {kKnown && oKnown && far.d > 0 ? (
                <DragHandle
                  testID={`drag-${spec.factor}`}
                  x={handle[0]}
                  y={handle[1]}
                  label={rep.variable(spec.factor).name}
                  onStart={() => {
                    start.current = { k, x: handle[0], y: handle[1] };
                    box.freeze();
                  }}
                  onEnd={box.release}
                  onMove={(dx, dy) => {
                    // How far along the ray from O through the corner the finger is.
                    const [ux, uy] = [hx - ox, hy - oy];
                    const t =
                      ((start.current.x + dx - ox) * ux + (start.current.y + dy - oy) * uy) /
                      (ux * ux + uy * uy);
                    calc.set(
                      {
                        ...rep.pin(
                          [spec.width, spec.height, ...spec.center!].filter(
                            (v): v is string => typeof v === 'string',
                          ),
                        ),
                        [spec.factor]: rep.snapTo(spec.factor, t),
                      },
                      rep.slide(spec.factor),
                    );
                  }}
                />
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
 * The side-splitter: triangle ABC with DE parallel to BC, D on AB and E on AC at the scale
 * factor's fraction of the way from A. Parallel arrows on DE and BC; the pieces of the sides
 * labelled outside them; the small triangle ADE shaded. Drag D along AB.
 */
export function SideSplitter({ spec, calc }: { spec: Spec; calc: Calculator }) {
  const c = usePalette();
  const { rep, num, known, text } = useValues(calc);
  const start = useRef({ k: 0, x: 0, y: 0 });
  const sp = spec.splitter!;
  const AB = num(spec.width);
  const AC = num(spec.height);
  const kKnown = rep.known(spec.factor);
  const k = rep.shown(spec.factor);
  const BC = sp.base && rep.known(sp.base[1]) ? rep.shown(sp.base[1]) : undefined;
  const shape = splitterShape(AB, AC, BC);
  const sidesKnown = known(spec.width) && known(spec.height);
  const fits = !!shape.tri && k > 0 && k < 1;
  // A piece the page doesn't name is worked out from k, in the sides' unit.
  const unit = typeof spec.width === 'string' ? rep.unit(spec.width) : undefined;
  const part = (i: number, x: number) => {
    const id = sp.parts?.[i];
    return id ? rep.value(id) : `${formatNumber(x)}${unit ? ` ${unit}` : ''}`;
  };
  const [ad, db, ae, ec] = [
    part(0, k * AB),
    part(1, (1 - k) * AB),
    part(2, k * AC),
    part(3, (1 - k) * AC),
  ];
  const lines: string[] = [];
  if (!shape.tri) lines.push(shape.reason);
  else if (!kKnown) lines.push('Where DE cuts the sides: ?');
  else if (!fits) lines.push('D must be between A and B: the scale factor is between 0 and 1');
  else {
    const ratio = coef(k / (1 - k));
    lines.push('DE ∥ BC, so it cuts the two sides in the same ratio.');
    lines.push(`AD ÷ DB = ${ad} ÷ ${db} = ${ratio}`);
    lines.push(`AE ÷ EC = ${ae} ÷ ${ec} = ${ratio}`);
    lines.push('Triangle ADE ~ triangle ABC, a dilation from A.');
    lines.push(`k = AD ÷ AB = ${ad} ÷ ${text(spec.width)} = ${coef(k)}`);
    if (sp.base)
      lines.push(`DE = k × BC = ${coef(k)} × ${rep.value(sp.base[1])} = ${rep.value(sp.base[0])}`);
  }

  return (
    <View>
      <Canvas aspect={0.72}>
        {({ w, h }) => {
          const tri = shape.tri ?? splitterShape(1, 1).tri!;
          // Fit the triangle (unit coordinates, y down) with room for labels.
          const xs = tri.map((p) => p[0]);
          const ys = tri.map((p) => p[1]);
          const [minX, maxX, minY, maxY] = [
            Math.min(...xs),
            Math.max(...xs),
            Math.min(...ys),
            Math.max(...ys),
          ];
          const sc = Math.min((w - 110) / (maxX - minX), (h - 56) / (maxY - minY));
          const left = (w - (maxX - minX) * sc) / 2;
          const P = ([x, y]: Pt) => [left + (x - minX) * sc, 22 + (y - minY) * sc] as const;
          const [A, B, C] = tri.map(P) as [
            readonly [number, number],
            readonly [number, number],
            readonly [number, number],
          ];
          const kk = fits ? k : 0.5;
          const lerp = (p: readonly number[], q: readonly number[], t: number) =>
            [p[0]! + (q[0]! - p[0]!) * t, p[1]! + (q[1]! - p[1]!) * t] as const;
          const D = lerp(A, B, kk);
          const E = lerp(A, C, kk);
          const pts = (ps: (readonly [number, number])[]) => ps.map((p) => p.join(',')).join(' ');
          /** A label beside the segment p–q, on the side away from the point `away`. */
          const beside = (
            p: readonly [number, number],
            q: readonly [number, number],
            away: readonly [number, number],
            t: string,
            color: string,
            key: string,
          ) => {
            const [mx, my] = [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2];
            let [nx, ny] = [-(q[1] - p[1]), q[0] - p[0]];
            const len = Math.hypot(nx, ny) || 1;
            [nx, ny] = [nx / len, ny / len];
            if ((away[0] - mx) * nx + (away[1] - my) * ny > 0) [nx, ny] = [-nx, -ny];
            const anchor = Math.abs(nx) < 0.35 ? 'middle' : nx > 0 ? 'start' : 'end';
            return (
              <ChartText
                key={key}
                {...fitLabel(mx + nx * 9, t, chart.label, w, anchor, 9)}
                y={my + ny * 12 + 5}
                fontWeight="700"
                fill={color}
              >
                {t}
              </ChartText>
            );
          };
          /** One arrowhead in the middle of p–q, pointing from p to q: the parallel mark. */
          const chevron = (
            p: readonly [number, number],
            q: readonly [number, number],
            color: string,
          ) => {
            const [mx, my] = [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2];
            const len = Math.hypot(q[0] - p[0], q[1] - p[1]) || 1;
            const [ux, uy] = [(q[0] - p[0]) / len, (q[1] - p[1]) / len];
            const a = 7;
            return (
              <Path
                d={`M ${mx - ux * a - uy * a * 0.8} ${my - uy * a + ux * a * 0.8} L ${mx + ux * 2} ${my + uy * 2} L ${mx - ux * a + uy * a * 0.8} ${my - uy * a - ux * a * 0.8}`}
                stroke={color}
                strokeWidth={chart.stroke}
                fill="none"
                strokeLinejoin="round"
              />
            );
          };
          const name = (p: readonly [number, number], t: string, dx: number, dy: number) => (
            <ChartText key={t} x={p[0] + dx} y={p[1] + dy} textAnchor="middle" fontWeight="700">
              {t}
            </ChartText>
          );
          const center = [(A[0] + B[0] + C[0]) / 3, (A[1] + B[1] + C[1]) / 3] as const;
          return (
            <>
              <Svg width={w} height={h}>
                <G opacity={shape.tri && sidesKnown ? 1 : 0.35}>
                  <Polygon
                    points={pts([A, B, C])}
                    fill={c.chartFill}
                    stroke={c.chartInk}
                    strokeWidth={chart.stroke}
                    strokeLinejoin="round"
                  />
                  <G opacity={fits ? 1 : 0.35}>
                    <Polygon points={pts([A, D, E])} fill={c.chartHighlight} fillOpacity={0.22} />
                    <Line
                      x1={D[0]}
                      y1={D[1]}
                      x2={E[0]}
                      y2={E[1]}
                      stroke={c.chartHighlight}
                      strokeWidth={chart.strokeHeavy}
                    />
                    {chevron(D, E, c.chartHighlight)}
                    {chevron(B, C, c.chartInk)}
                    {[D, E].map((p, i) => (
                      <Circle key={`de${i}`} cx={p[0]} cy={p[1]} r={3.5} fill={c.chartHighlight} />
                    ))}
                  </G>
                  {name(A, 'A', 0, -8)}
                  {name(B, 'B', -10, 14)}
                  {name(C, 'C', 10, 14)}
                  {/* D's letter clears its handle. */}
                  {name(D, 'D', D[0] < center[0] ? -20 : 20, 4)}
                  {name(E, 'E', E[0] < center[0] ? -12 : 12, 0)}
                  {fits ? (
                    <G>
                      {beside(A, D, center, ad, c.chartHighlight, 'ad')}
                      {beside(D, B, center, db, c.chartInk, 'db')}
                      {beside(A, E, center, ae, c.chartHighlight, 'ae')}
                      {beside(E, C, center, ec, c.chartInk, 'ec')}
                      {sp.base
                        ? beside(D, E, A, rep.value(sp.base[0]), c.chartHighlight, 'de')
                        : null}
                      {sp.base ? beside(B, C, A, rep.value(sp.base[1]), c.chartInk, 'bc') : null}
                    </G>
                  ) : null}
                </G>
              </Svg>
              {fits && kKnown && sidesKnown ? (
                <DragHandle
                  testID={`drag-${spec.factor}`}
                  x={D[0]}
                  y={D[1]}
                  label={rep.variable(spec.factor).name}
                  onStart={() => {
                    start.current = { k, x: D[0], y: D[1] };
                  }}
                  onMove={(dx, dy) => {
                    // How far along AB the finger is.
                    const [ux, uy] = [B[0] - A[0], B[1] - A[1]];
                    const t =
                      ((start.current.x + dx - A[0]) * ux + (start.current.y + dy - A[1]) * uy) /
                      (ux * ux + uy * uy);
                    calc.set(
                      {
                        ...rep.pin(
                          [spec.width, spec.height, ...(sp.base ? [sp.base[1]] : [])].filter(
                            (v): v is string => typeof v === 'string',
                          ),
                        ),
                        [spec.factor]: rep.snapTo(spec.factor, Math.min(0.95, Math.max(0.05, t))),
                      },
                      rep.slide(spec.factor),
                    );
                  }}
                />
              ) : null}
            </>
          );
        }}
      </Canvas>
      <Caption>{lines.join(' · ')}</Caption>
    </View>
  );
}

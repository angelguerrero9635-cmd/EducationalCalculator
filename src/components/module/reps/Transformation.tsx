import { useRef } from 'react';
import { View } from 'react-native';
import Svg, { Circle, G, Line, Path } from 'react-native-svg';

import type { Mirror, NumOrVar, TransformationSpec } from '@/data/modules/typesGraphs';
import { imageOf, type MoveValues, type Pt } from './transform';
import { symmetryOf } from './transformHsf';
import { mirrorOf } from './hs2h';
import { readMove, symmetryText, SymmetryMarks } from './TransformationHsf';
import { PointPairs } from './TransformationHs3b';
import { ownCenter, pointSymmetryText } from './transformHs3b';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { angleDrag } from './angleDrag';
import { Canvas, Caption, ChartText, DragHandle, useFrozen, useRep } from './common';
import {
  Arrow,
  arrowHead,
  Chip,
  coef,
  extents,
  fitExtent,
  GridAxes,
  makeFrame,
  pointText,
  reader,
} from './graphKit';

const LETTERS = 'ABCDEF';

/** The coordinate rule for a move, when it has a short one: "(x, y) → (x + 4, y − 2)". */
function ruleText(move: TransformationSpec['move'], v: MoveValues): string | undefined {
  const plus = (s: string, n: number) =>
    n === 0 ? s : `${s} ${n < 0 ? '−' : '+'} ${coef(Math.abs(n))}`;
  const atOrigin = v.center[0] === 0 && v.center[1] === 0;
  switch (move) {
    case 'translate':
      return `(x, y) → (${plus('x', v.right)}, ${plus('y', v.up)})`;
    case 'reflect': {
      const m = v.mirror;
      if (m === 'x-axis') return '(x, y) → (x, −y)';
      if (m === 'y-axis') return '(x, y) → (−x, y)';
      if (m === 'y = x') return '(x, y) → (y, x)';
      if (m === 'y = −x') return '(x, y) → (−y, −x)';
      const two = coef(2 * v.line!);
      if (m && typeof m === 'object' && 'x' in m)
        return v.line === 0 ? '(x, y) → (−x, y)' : `(x, y) → (${two} − x, y)`;
      return v.line === 0 ? '(x, y) → (x, −y)' : `(x, y) → (x, ${two} − y)`;
    }
    case 'rotate': {
      if (!atOrigin) return undefined;
      const q = (((Math.round(v.angle / 90) % 4) + 4) % 4) as 0 | 1 | 2 | 3;
      if (Math.abs(v.angle / 90 - Math.round(v.angle / 90)) > 1e-9) return undefined;
      return ['(x, y) → (x, y)', '(x, y) → (−y, x)', '(x, y) → (−x, −y)', '(x, y) → (y, −x)'][q];
    }
    case 'dilate': {
      // A fraction factor is bracketed: (x, y) → ((5/4)x, (5/4)y).
      const k = coef(v.factor).includes('/') ? `(${coef(v.factor)})` : coef(v.factor);
      return atOrigin ? `(x, y) → (${k}x, ${k}y)` : undefined;
    }
  }
}

const mirrorName = (m: Mirror, line?: number) =>
  typeof m === 'string'
    ? m === 'x-axis' || m === 'y-axis'
      ? `the ${m}`
      : m
    : `${'x' in m ? 'x' : 'y'} = ${coef(line ?? 0)}`;

/**
 * A figure and its image on a grid: a translation (an arrow from A to A′), a reflection (the
 * mirror line, each corner joined to its image), a rotation (the center, the turn from A to
 * A′) or a dilation (the center and the rays through each corner). Drag A′ to change the
 * move, or the mirror line.
 */
export function Transformation({
  spec,
  calc,
}: {
  spec: Exclude<TransformationSpec, { move: 'matrix' }>; // HC95: TransformationMatrixHe4a
  calc: Calculator;
}) {
  const c = usePalette();
  const rep = useRep(calc);
  const read = reader(rep);
  const start = useRef({ a: 0, b: 0 });
  // A turn's angle as the drag has turned it: continuous past the center (angleDrag).
  const turn = useRef<(dx: number, dy: number) => number>(() => 0);
  const turnFrom = useRef(0);
  const fig = spec.figure.map(([x, y]) => ({ x: read(x), y: read(y) }));
  const pts = fig.map((p) => [p.x.value, p.y.value] as Pt);
  const figKnown = fig.every((p) => p.x.known && p.y.known);
  const none = { value: 0, known: true, text: '0' };
  // H106: `about: 'center'` turns about the figure's own center (no center values).
  const own = spec.about === 'center' ? ownCenter(pts) : undefined;
  const center =
    spec.move === 'rotate' || spec.move === 'dilate'
      ? own
        ? {
            x: { value: own[0], known: figKnown, text: coef(own[0]) },
            y: { value: own[1], known: figKnown, text: coef(own[1]) },
          }
        : spec.center
          ? { x: read(spec.center[0]), y: read(spec.center[1]) }
          : { x: none, y: none }
      : undefined;
  const right = spec.move === 'translate' ? read(spec.right) : none;
  const up = spec.move === 'translate' ? read(spec.up) : none;
  // H105: a value (1 or −1) may pick the mirror y = x or y = −x.
  const readKnown = (id: string) => (rep.known(id) ? rep.shown(id) : undefined);
  const mirror = spec.move === 'reflect' ? mirrorOf(spec, readKnown) : undefined;
  const slopeVal = spec.move === 'reflect' && spec.slope ? read(spec.slope) : undefined;
  const lineVal =
    mirror && typeof mirror === 'object' ? read('x' in mirror ? mirror.x : mirror.y) : undefined;
  const angle = spec.move === 'rotate' ? read(spec.angle) : none;
  const factor = spec.move === 'dilate' ? read(spec.factor) : { ...none, value: 1 };
  const moveKnown = [right, up, angle, factor, center?.x, center?.y, lineVal, slopeVal].every(
    (r) => !r || r.known,
  );
  const v = {
    right: right.value,
    up: up.value,
    mirror,
    line: lineVal?.value,
    angle: angle.value,
    factor: factor.value,
    center: [center?.x.value ?? 0, center?.y.value ?? 0] as Pt,
  };
  const img = pts.map((p) => imageOf(p, spec.move, v));
  // A second move (Grades 9–12): A′ is the middle image, A″ the final one.
  const then = spec.then;
  const second = then ? readMove(then, read) : undefined;
  const v2 = second?.v;
  const img2 = then && v2 ? img.map((p) => imageOf(p, then.move, v2)) : undefined;
  const known = figKnown && moveKnown && (second?.known ?? true);
  const sym = spec.symmetry && figKnown ? symmetryOf(pts) : undefined;
  const base = extents(spec.extent).x;
  const all = [...pts, ...img, v.center, ...(img2 ?? []), ...(v2 ? [v2.center] : [])].flat();
  const ext = useFrozen(
    fitExtent(base, [...all, ...(lineVal ? [lineVal.value] : []), ...(v2?.line ? [v2.line] : [])]),
  );
  const q1 = spec.quadrants === 1;
  const E = ext.value;
  const prime = (i: number) => `${LETTERS[i]}′`;
  const prime2 = (i: number) => `${LETTERS[i]}″`;
  /** A value's id when it is a variable (a handle can only set variables). */
  const idOf = (x: NumOrVar | undefined) => (typeof x === 'string' ? x : undefined);
  const moveVars = (
    spec.move === 'translate'
      ? [spec.right, spec.up]
      : spec.move === 'rotate'
        ? [spec.angle, ...(spec.center ?? [])]
        : spec.move === 'dilate'
          ? [spec.factor, ...(spec.center ?? [])]
          : mirror && typeof mirror === 'object'
            ? ['x' in mirror ? mirror.x : mirror.y]
            : [spec.slope]
  ).filter((x): x is string => typeof x === 'string');
  const figVars = spec.figure.flat().filter((x): x is string => typeof x === 'string');
  const pinned = (except: string[]) =>
    rep.pin([...figVars, ...moveVars].filter((id) => !except.includes(id)));

  const a = pts[0] ?? [0, 0];
  const a2 = img[0] ?? [0, 0];
  const describe = (move: TransformationSpec['move'], mv: MoveValues) => {
    const turn =
      mv.angle === 0
        ? 'no turn'
        : `${coef(Math.abs(mv.angle))}° ${mv.angle > 0 ? 'counterclockwise' : 'clockwise'}`;
    return move === 'translate'
      ? `Translate ${coef(Math.abs(mv.right))} ${mv.right < 0 ? 'left' : 'right'} and ${coef(Math.abs(mv.up))} ${mv.up < 0 ? 'down' : 'up'}`
      : move === 'reflect'
        ? `Reflect across ${mirrorName(mv.mirror!, mv.line)}`
        : move === 'rotate'
          ? `Rotate ${turn} about ${pointText(...mv.center)}`
          : `Dilate by scale factor ${coef(mv.factor)} from ${pointText(...mv.center)}`;
  };
  const what = describe(spec.move, v);
  const rule = ruleText(spec.move, v)?.replace(/ /g, '\u00a0');
  const rigid = spec.move !== 'dilate' && then?.move !== 'dilate';
  const caption = !known
    ? 'Type every corner and the move to draw the image.'
    : then && v2 && img2
      ? [
          `${what}, then ${describe(then.move, v2).replace(/^./, (x) => x.toLowerCase())}.`,
          `${LETTERS[0]}${pointText(...a)} → ${prime(0)}${pointText(...a2)} → ${prime2(0)}${pointText(...img2[0]!)}.`,
          rigid
            ? 'Both moves keep lengths and angles, so the final image is congruent to the figure.'
            : 'A dilation changes the lengths, so the final image is similar to the figure.',
        ].join(' · ')
      : [
          `${what}${rule ? `: ${rule}` : ''}.`,
          `${LETTERS[0]}${pointText(...a)} → ${prime(0)}${pointText(...a2)}${
            pts.length > 1
              ? `; ${img
                  .slice(1)
                  .map((p, i) => `${prime(i + 1)}${pointText(...p)}`)
                  .join(', ')}`
              : ''
          }.`,
          spec.move === 'dilate'
            ? `Each side is ${coef(Math.abs(v.factor))} times as long; the angles stay the same.`
            : 'The image has the same side lengths and angles.',
          ...(sym ? [symmetryText(sym)] : []),
          ...(own ? [pointSymmetryText(pts, own)] : []),
        ].join(' · ');

  return (
    <View>
      <Canvas aspect={q1 ? 0.9 : 1}>
        {({ w, h }) => {
          const f = makeFrame(w, h, [q1 ? 0 : -E, E], [q1 ? 0 : -E, E], true);
          const P = (p: Pt) => [f.sx(p[0]), f.sy(p[1])] as const;
          const path = (ps: Pt[]) =>
            ps.map((p, i) => `${i ? 'L' : 'M'} ${P(p)[0]} ${P(p)[1]}`).join(' ') +
            (ps.length > 2 ? ' Z' : '');
          const centroid = (ps: Pt[]) =>
            [
              ps.reduce((s, p) => s + p[0], 0) / ps.length,
              ps.reduce((s, p) => s + p[1], 0) / ps.length,
            ] as Pt;
          /** Corner labels, pushed out from the middle of the shape. */
          /** Two points drawn at one place. */
          const same = (p?: Pt, q?: Pt) =>
            !!p && !!q && Math.abs(p[0] - q[0]) < 1e-9 && Math.abs(p[1] - q[1]) < 1e-9;
          const labels = (
            ps: Pt[],
            name: (i: number) => string,
            color: string,
            gap = 16,
            skip: (i: number) => boolean = () => false,
          ) => {
            const [mx, my] = P(centroid(ps));
            return ps.map((p, i) => {
              if (skip(i)) return null;
              const [x, y] = P(p);
              // Out from the middle of the shape; turned (by eighths of a turn) off the axes'
              // numbers when it would land on them.
              const out = ps.length > 1 ? Math.atan2(y - my, x - mx) : -Math.PI / 4;
              const [ax0, ay0] = [f.sx(0), f.sy(0)];
              const spot = (t: number) => {
                const lx = Math.min(w - 8, Math.max(8, x + Math.cos(t) * gap));
                const ly = Math.min(h - 3, Math.max(11, y + Math.sin(t) * gap + 4));
                return {
                  lx,
                  ly,
                  bad: (lx > ax0 - 26 && lx < ax0 + 8) || (ly > ay0 - 2 && ly < ay0 + 18),
                };
              };
              const pick =
                [0, 1, -1, 2, -2, 3, -3, 4]
                  .map((k) => spot(out + (k * Math.PI) / 4))
                  .find((q) => !q.bad) ?? spot(out);
              return (
                <ChartText
                  key={`${name(i)}`}
                  x={pick.lx}
                  y={pick.ly}
                  textAnchor="middle"
                  fontSize={chart.label}
                  fontWeight="700"
                  fill={color}
                >
                  {name(i)}
                </ChartText>
              );
            });
          };
          /** The guides of one move, from the corners `pts` to their images `img`. */
          const guidesFor = (
            move: TransformationSpec['move'],
            pts: Pt[],
            img: Pt[],
            v: MoveValues,
          ) => {
            const [cxp, cyp] = P(v.center);
            const a: Pt = pts[0] ?? [0, 0];
            const a2: Pt = img[0] ?? [0, 0];
            const mirror = v.mirror;
            const angle = { value: v.angle };
            switch (move) {
              case 'translate': {
                const [x1, y1] = P(a);
                const [x2, y2] = P(a2);
                return (
                  <G>
                    {pts.slice(1).map((p, i) => {
                      const [px, py] = P(p);
                      const [qx, qy] = P(img[i + 1]!);
                      return (
                        <Line
                          key={`t${i}`}
                          x1={px}
                          y1={py}
                          x2={qx}
                          y2={qy}
                          stroke={c.chartMuted}
                          strokeWidth={1}
                          strokeDasharray={chart.dashFine}
                        />
                      );
                    })}
                    {x1 !== x2 || y1 !== y2 ? (
                      <Arrow
                        x1={x1}
                        y1={y1}
                        x2={x2}
                        y2={y2}
                        color={c.chartSecond}
                        width={chart.stroke + 0.5}
                      />
                    ) : null}
                  </G>
                );
              }
              case 'reflect': {
                const m = mirror!;
                const [lo, hi] = [q1 ? 0 : -E, E];
                const ends: [Pt, Pt] =
                  m === 'x-axis'
                    ? [
                        [lo, 0],
                        [hi, 0],
                      ]
                    : m === 'y-axis'
                      ? [
                          [0, lo],
                          [0, hi],
                        ]
                      : m === 'y = x'
                        ? [
                            [lo, lo],
                            [hi, hi],
                          ]
                        : m === 'y = −x'
                          ? [
                              [q1 ? 0 : -E, E],
                              [E, q1 ? 0 : -E],
                            ]
                          : 'x' in m
                            ? [
                                [v.line!, lo],
                                [v.line!, hi],
                              ]
                            : [
                                [lo, v.line!],
                                [hi, v.line!],
                              ];
                const [e1, e2] = [P(ends[0]), P(ends[1])];
                return (
                  <G>
                    {pts.map((p, i) => {
                      const [px, py] = P(p);
                      const [qx, qy] = P(img[i]!);
                      return (
                        <Line
                          key={`r${i}`}
                          x1={px}
                          y1={py}
                          x2={qx}
                          y2={qy}
                          stroke={c.chartMuted}
                          strokeWidth={1}
                          strokeDasharray={chart.dashFine}
                        />
                      );
                    })}
                    <Line
                      x1={e1[0]}
                      y1={e1[1]}
                      x2={e2[0]}
                      y2={e2[1]}
                      stroke={c.chartSecond}
                      strokeWidth={chart.strokeHeavy}
                      strokeDasharray="9 5"
                    />
                    {/* The line's name at its low end (its handle is at the top), off the axes. */}
                    <Chip
                      x={e1[0] + (e1[0] === e2[0] ? 6 : 4)}
                      y={e1[1] - 8}
                      text={mirrorName(m, v.line)}
                      anchor="start"
                      w={w}
                      h={h}
                    />
                  </G>
                );
              }
              case 'rotate': {
                const [ax, ay] = P(a);
                const [bx, by] = P(a2);
                const r = Math.max(14, Math.min(40, Math.hypot(ax - cxp, ay - cyp) * 0.7));
                const t1 = Math.atan2(a[1] - v.center[1], a[0] - v.center[0]);
                const sweep = (angle.value * Math.PI) / 180;
                const t2 = t1 + sweep;
                // Angles are the math way round (counterclockwise); screen y points down.
                const pt = (t: number) => [cxp + r * Math.cos(t), cyp - r * Math.sin(t)] as const;
                const [sx1, sy1] = pt(t1);
                const [sx2, sy2] = pt(t2);
                const large = Math.abs(sweep) > Math.PI ? 1 : 0;
                const dir = sweep > 0 ? 0 : 1;
                const mid = pt(t1 + sweep / 2);
                return (
                  <G>
                    {[
                      [ax, ay],
                      [bx, by],
                    ].map(([x, y], i) => (
                      <Line
                        key={`s${i}`}
                        x1={cxp}
                        y1={cyp}
                        x2={x}
                        y2={y}
                        stroke={c.chartMuted}
                        strokeWidth={chart.strokeLight}
                        strokeDasharray={chart.dash}
                      />
                    ))}
                    {r > 4 && Math.abs(sweep) > 1e-9 && Math.abs(sweep) < 2 * Math.PI - 1e-9 ? (
                      <>
                        <Path
                          d={`M ${sx1} ${sy1} A ${r} ${r} 0 ${large} ${dir} ${sx2} ${sy2}`}
                          stroke={c.chartSecond}
                          strokeWidth={chart.stroke + 0.5}
                          fill="none"
                        />
                        <Path
                          d={arrowHead(
                            sx2,
                            sy2,
                            -Math.sin(t2) * Math.sign(sweep),
                            -Math.cos(t2) * Math.sign(sweep),
                          )}
                          fill={c.chartSecond}
                        />
                      </>
                    ) : null}
                    <Chip
                      x={cxp + ((mid[0] - cxp) * (r + 18)) / r}
                      y={cyp + ((mid[1] - cyp) * (r + 14)) / r + 4}
                      text={`${coef(Math.abs(angle.value))}°`}
                      w={w}
                      h={h}
                      size={chart.label}
                    />
                  </G>
                );
              }
              case 'dilate':
                return (
                  <G>
                    {pts.map((p, i) => {
                      const q = img[i]!;
                      const far = Math.abs(v.factor) >= 1 ? q : p;
                      const [fx, fy] = P(far);
                      return (
                        <Line
                          key={`d${i}`}
                          x1={cxp}
                          y1={cyp}
                          x2={fx}
                          y2={fy}
                          stroke={c.chartMuted}
                          strokeWidth={1}
                          strokeDasharray={chart.dash}
                        />
                      );
                    })}
                    {(() => {
                      // "× 2" beside the ray with the most room, off the axes…
                      const mids = pts.map((p, i) => {
                        const far = Math.abs(v.factor) >= 1 ? img[i]! : p;
                        const [fx, fy] = P(far);
                        // Between the corner and its image, where the ray is clear of both shapes.
                        const [px2, py2] = P(p);
                        const [qx2, qy2] = P(img[i]!);
                        const [mx, my] = [(px2 + qx2) / 2, (py2 + qy2) / 2];
                        const len = Math.hypot(fx - cxp, fy - cyp) || 1;
                        const [nx, ny] = [-(fy - cyp) / len, (fx - cxp) / len];
                        const [lx, ly] = [mx + nx * 12, my + ny * 12];
                        return {
                          lx,
                          ly,
                          room: Math.min(
                            Math.abs(lx - f.sx(0)),
                            Math.abs(ly - f.sy(0)),
                            // …and from the corners and their labels.
                            ...[...pts, ...img].map(
                              (q) => Math.hypot(P(q)[0] - lx, P(q)[1] - ly) - 12,
                            ),
                          ),
                        };
                      });
                      const best = mids.reduce((b, m) => (m.room > b.room ? m : b), mids[0]!);
                      return (
                        <Chip
                          x={best.lx}
                          y={best.ly + 4}
                          text={`× ${coef(v.factor)}`}
                          w={w}
                          h={h}
                          size={chart.label}
                        />
                      );
                    })()}
                  </G>
                );
            }
          };
          const [cxp, cyp] = P(v.center);
          const guides = known ? guidesFor(spec.move, pts, img, v) : null;
          const guides2 = known && then && v2 && img2 ? guidesFor(then.move, img, img2, v2) : null;
          const aHandle = P(a2);
          // With a second move the first image is the middle step, drawn dashed.
          const mid = then ? c.chartMuted : c.chartHighlight;
          // A symmetry turn or flip lands the image on the figure: its labels stand further out.
          const onto =
            !!sym && img.every((q) => pts.some((p) => Math.hypot(p[0] - q[0], p[1] - q[1]) < 1e-6));
          const symReach = sym
            ? Math.max(...pts.map((p) => Math.hypot(p[0] - sym.center[0], p[1] - sym.center[1]))) +
              1
            : 0;
          return (
            <>
              <Svg width={w} height={h}>
                <GridAxes f={f} />
                {sym ? null : guides}
                {guides2}
                <Path
                  d={path(pts)}
                  fill={c.chartFill}
                  fillOpacity={0.9}
                  stroke={c.chartInk}
                  strokeWidth={chart.stroke}
                  opacity={figKnown ? 1 : 0.35}
                />
                {known ? (
                  <Path
                    d={path(img)}
                    fill={mid}
                    fillOpacity={then ? 0.08 : 0.2}
                    stroke={mid}
                    strokeWidth={chart.stroke + (then ? 0 : 0.5)}
                    strokeDasharray={then ? chart.dash : undefined}
                  />
                ) : null}
                {/* With symmetry the turn or flip is drawn over the figure, which it lands on. */}
                {sym ? guides : null}
                {known && img2 ? (
                  <Path
                    d={path(img2)}
                    fill={c.chartHighlight}
                    fillOpacity={0.2}
                    stroke={c.chartHighlight}
                    strokeWidth={chart.stroke + 0.5}
                  />
                ) : null}
                {own && known ? <PointPairs pts={pts} center={own} P={P} /> : null}
                {sym ? (
                  <SymmetryMarks s={sym} P={P} reach={symReach} box={[f.x, f.y]} w={w} h={h} />
                ) : null}
                {pts.map((p, i) => (
                  <Circle key={`v${i}`} cx={P(p)[0]} cy={P(p)[1]} r={3} fill={c.chartInk} />
                ))}
                {known
                  ? [...img, ...(img2 ?? [])].map((p, i) => (
                      <Circle
                        key={`w${i}`}
                        cx={P(p)[0]}
                        cy={P(p)[1]}
                        r={3}
                        fill={i < img.length ? mid : c.chartHighlight}
                      />
                    ))
                  : null}
                {/* A point its moves leave where it was (B at the origin, turned and
                    dilated about it) gets one tag, "B = B′ = B″", not three on top of each
                    other. */}
                {labels(
                  pts,
                  (i) =>
                    [
                      LETTERS[i]!,
                      ...(known && same(img[i], pts[i]) ? [prime(i)] : []),
                      ...(known && img2 && same(img2[i], pts[i]) ? [prime2(i)] : []),
                    ].join(' = '),
                  c.chartInk,
                )}
                {known
                  ? labels(
                      img,
                      (i) =>
                        img2 && same(img2[i], img[i]) && !same(img[i], pts[i])
                          ? `${prime(i)} = ${prime2(i)}`
                          : prime(i),
                      mid,
                      onto ? 30 : 16,
                      (i) => same(img[i], pts[i]),
                    )
                  : null}
                {known && img2
                  ? labels(
                      img2,
                      prime2,
                      c.chartHighlight,
                      16,
                      (i) => same(img2[i], pts[i]) || same(img2[i], img[i]),
                    )
                  : null}
                {v2 && then && (then.move === 'rotate' || then.move === 'dilate') ? (
                  <Circle
                    cx={P(v2.center)[0]}
                    cy={P(v2.center)[1]}
                    r={5}
                    fill={c.chartSecond}
                    stroke={c.chartInk}
                    strokeWidth={1}
                  />
                ) : null}
                {center ? (
                  <G>
                    <Circle
                      cx={cxp}
                      cy={cyp}
                      r={5}
                      fill={c.chartSecond}
                      stroke={c.chartInk}
                      strokeWidth={1}
                    />
                    {/* At (0, 0) the caption names the center; elsewhere it is labelled. */}
                    {v.center[0] !== 0 || v.center[1] !== 0 ? (
                      <Chip
                        x={cxp + 8}
                        y={cyp + 18}
                        text={`center ${pointText(...v.center)}`}
                        anchor="start"
                        w={w}
                        h={h}
                      />
                    ) : null}
                  </G>
                ) : null}
              </Svg>
              {known && spec.move === 'translate' && (idOf(spec.right) || idOf(spec.up)) ? (
                <DragHandle
                  testID="drag-image"
                  x={aHandle[0]}
                  y={aHandle[1]}
                  label={`the image ${prime(0)}`}
                  onStart={() => {
                    start.current = { a: v.right, b: v.up };
                    ext.freeze();
                  }}
                  onMove={(dx, dy) => {
                    const [r, u] = [idOf(spec.right), idOf(spec.up)];
                    calc.set({
                      ...pinned([r, u].filter((x): x is string => !!x)),
                      ...(r
                        ? { [r]: rep.snapTo(r, (start.current.a + dx / f.ux) * rep.factor(r)) }
                        : {}),
                      ...(u
                        ? { [u]: rep.snapTo(u, (start.current.b - dy / f.uy) * rep.factor(u)) }
                        : {}),
                    });
                  }}
                  onEnd={ext.release}
                />
              ) : null}
              {known && spec.move === 'rotate' && idOf(spec.angle) ? (
                <DragHandle
                  testID="drag-image"
                  x={aHandle[0]}
                  y={aHandle[1]}
                  label={`the image ${prime(0)}`}
                  onStart={() => {
                    start.current = { a: aHandle[0], b: aHandle[1] };
                    turnFrom.current = rep.val(spec.angle as string);
                    turn.current = angleDrag(
                      { x: aHandle[0] - cxp, y: aHandle[1] - cyp },
                      turnFrom.current,
                    );
                    ext.freeze();
                  }}
                  onMove={(dx, dy) => {
                    const id = spec.angle as string;
                    // The turn from A to where the finger is, about the center, turning on
                    // as the finger passes the center (never 340° at once).
                    let deg = turn.current(dx, dy);
                    // Keep the turn the same way round as it was, within one full turn.
                    const variable = rep.variable(id);
                    const lo = variable.min ?? -360;
                    while (deg < lo) deg += 360;
                    while (deg > (variable.max ?? 360)) deg -= 360;
                    // Quarter turns only (90°, 180°, …): a turn of 10° or more goes on to the
                    // next one that way, not back to the nearest (which stood still).
                    const from = turnFrom.current;
                    const list = variable.allowed;
                    if (list && Math.abs(deg - from) >= 10) {
                      const way = list.filter((a) => (deg > from ? a > from : a < from));
                      const next = way.sort((a, b) => Math.abs(a - deg) - Math.abs(b - deg))[0];
                      if (next !== undefined) deg = next;
                    }
                    calc.set({ ...pinned([id]), [id]: rep.snapTo(id, deg) }, rep.slide(id));
                  }}
                  onEnd={ext.release}
                />
              ) : null}
              {known &&
              spec.move === 'dilate' &&
              idOf(spec.factor) &&
              (a[0] !== v.center[0] || a[1] !== v.center[1]) ? (
                <DragHandle
                  testID="drag-image"
                  x={aHandle[0]}
                  y={aHandle[1]}
                  label={`the image ${prime(0)}`}
                  onStart={() => {
                    start.current = { a: aHandle[0], b: aHandle[1] };
                    ext.freeze();
                  }}
                  onMove={(dx, dy) => {
                    const id = spec.factor as string;
                    // How far along the ray from the center through A the finger is.
                    const [ax, ay] = P(a);
                    const [ux, uy] = [ax - cxp, ay - cyp];
                    const k =
                      ((start.current.a + dx - cxp) * ux + (start.current.b + dy - cyp) * uy) /
                      (ux * ux + uy * uy);
                    calc.set({ ...pinned([id]), [id]: rep.snapTo(id, k) }, rep.slide(id));
                  }}
                  onEnd={ext.release}
                />
              ) : null}
              {known &&
              lineVal &&
              mirror &&
              typeof mirror === 'object' &&
              idOf('x' in mirror ? mirror.x : mirror.y) ? (
                <DragHandle
                  testID="drag-mirror"
                  x={'x' in mirror ? f.sx(v.line!) : f.sx(q1 ? E * 0.1 : -E * 0.9)}
                  y={'x' in mirror ? f.sy(E * 0.9) : f.sy(v.line!)}
                  label="the mirror line"
                  onStart={() => {
                    start.current = { a: v.line!, b: 0 };
                    ext.freeze();
                  }}
                  onMove={(dx, dy) => {
                    const id = ('x' in mirror ? mirror.x : mirror.y) as string;
                    const next =
                      'x' in mirror ? start.current.a + dx / f.ux : start.current.a - dy / f.uy;
                    // A mirror worked out from the figure (x = m, the middle of the base) moves
                    // the typed value behind it: holding the figure kept it where it was.
                    calc.set(
                      {
                        ...(rep.typed(id) ? pinned([id]) : {}),
                        [id]: rep.snapTo(id, next * rep.factor(id)),
                      },
                      rep.slide(id),
                    );
                  }}
                  onEnd={ext.release}
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

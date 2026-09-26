import { useRef } from 'react';
import { StyleSheet, View } from 'react-native';

import { Text } from '@/components/Text';
import Svg, { Circle, G, Line, Path } from 'react-native-svg';

import type { Representation } from '@/data/modules';
import { formatNumber } from '@/engine/format';
import { chart, font, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, Caption, ChartText, DragHandle, niceCeil, useFrozen, useRep } from './common';
import { Steppers } from './Steppers';

type Spec = Extract<Representation, { kind: 'coordinatePlane' }>;

/**
 * A coordinate plane (the first quadrant, or all four) with a point to drag. With a second
 * point the line through both is drawn, and a rise-over-run triangle between them shows the
 * slope.
 */
export function CoordinatePlane({ spec, calc }: { spec: Spec; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  const start = useRef({ x: 0, y: 0 });
  const pts = [
    { x: spec.x, y: spec.y, testID: 'drag-point' },
    ...(spec.second ? [{ x: spec.second.x, y: spec.second.y, testID: 'drag-second' }] : []),
  ].map((p) => ({
    ...p,
    px: rep.shown(p.x),
    py: rep.shown(p.y),
    known: rep.known(p.x) && rep.known(p.y),
  }));
  // The plane grows (to a round size) to keep every point in view; held while dragging.
  const biggest = Math.max(spec.extent, ...pts.flatMap((p) => [Math.abs(p.px), Math.abs(p.py)]));
  const ext = useFrozen(biggest > spec.extent ? niceCeil(biggest) : spec.extent);
  const E = ext.value;
  const lo = spec.quadrants === 4 ? -E : 0;
  const step = E <= 10 ? 1 : E <= 20 ? 2 : E <= 50 ? 5 : niceCeil(E / 10);
  const [p, q] = pts;
  // A pattern's earlier points: step back from the point until a coordinate would go below 0.
  const trail: [number, number][] = [];
  if (spec.trail && p?.known) {
    const step = (v: number | string) =>
      typeof v === 'number' ? v : rep.known(v) ? rep.shown(v) : 0;
    const [ax, uy] = [step(spec.trail.across), step(spec.trail.up)];
    if (ax > 0 || uy > 0) {
      for (
        let x = p.px - ax, y = p.py - uy;
        x >= -1e-9 && y >= -1e-9 && trail.length < 10;
        x -= ax, y -= uy
      ) {
        trail.unshift([Number(x.toFixed(6)), Number(y.toFixed(6))]);
      }
    }
  }
  const both = p && q && p.known && q.known;
  /**
   * Where along a segment its label goes: the middle, unless that is on an axis (its numbers
   * are there); then the middle of the longer part on one side of 0.
   */
  const clear = (a: number, b: number) => {
    const mid = (a + b) / 2;
    const [lo, hi] = [Math.min(a, b), Math.max(a, b)];
    if (lo >= 0 || hi <= 0 || Math.abs(mid) > (hi - lo) / 6) return mid;
    return hi >= -lo ? hi / 2 : lo / 2;
  };
  // Reflections of the point across the x-axis, the y-axis and both (drawn hollow).
  const images: [number, number, string][] =
    spec.reflect && p?.known
      ? ([
          [p.px, -p.py, 'x'],
          [-p.px, p.py, 'y'],
          [-p.px, -p.py, 'both'],
        ].filter(([ix, iy]) => ix !== p.px || iy !== p.py) as [number, number, string][])
      : [];
  const corner = (id: string) => (rep.known(id) ? rep.shown(id) : undefined);
  const rect =
    spec.rect && [spec.rect.left, spec.rect.right, spec.rect.bottom, spec.rect.top].every(rep.known)
      ? {
          l: corner(spec.rect.left)!,
          r: corner(spec.rect.right)!,
          b: corner(spec.rect.bottom)!,
          t: corner(spec.rect.top)!,
        }
      : undefined;
  const dx = both ? q.px - p.px : 0;
  const dy = both ? q.py - p.py : 0;
  // Before slope (Grade 8) the move is said in words: "7 right, 0 up".
  const moveX = `${formatNumber(Math.abs(dx))} ${dx < 0 ? 'left' : 'right'}`;
  const moveY = `${formatNumber(Math.abs(dy))} ${dy < 0 ? 'down' : 'up'}`;

  return (
    <View>
      <Canvas aspect={spec.quadrants === 4 ? 1 : 0.92}>
        {({ w, h }) => {
          const pad = 30;
          const size = Math.min(w, h) - 2 * pad;
          const unit = size / (E - lo);
          const x0 = (w - size) / 2;
          const sx = (x: number) => x0 + (x - lo) * unit;
          const sy = (y: number) => pad + (E - y) * unit;
          const gridLines: number[] = [];
          for (let v = lo; v <= E + 1e-9; v += step) gridLines.push(Number(v.toFixed(6)));
          const lineThrough = () => {
            if (!both || (dx === 0 && dy === 0)) return null;
            // The line, clipped to the plane: parametric through p with direction (dx, dy).
            const ts: number[] = [];
            if (dx !== 0) ts.push((lo - p.px) / dx, (E - p.px) / dx);
            if (dy !== 0) ts.push((lo - p.py) / dy, (E - p.py) / dy);
            const inside = (t: number) => {
              const x = p.px + t * dx;
              const y = p.py + t * dy;
              return x >= lo - 1e-6 && x <= E + 1e-6 && y >= lo - 1e-6 && y <= E + 1e-6;
            };
            const ends = ts.filter(inside).sort((a, b) => a - b);
            const t0 = ends[0];
            const t1 = ends[ends.length - 1];
            if (t0 === undefined || t1 === undefined) return null;
            return (
              <Line
                x1={sx(p.px + t0 * dx)}
                y1={sy(p.py + t0 * dy)}
                x2={sx(p.px + t1 * dx)}
                y2={sy(p.py + t1 * dy)}
                stroke={c.chartHighlight}
                strokeWidth={chart.stroke}
              />
            );
          };
          return (
            <>
              <Svg width={w} height={h}>
                {gridLines.map((v) => [
                  <Line
                    key={`gx${v}`}
                    x1={sx(v)}
                    y1={sy(lo)}
                    x2={sx(v)}
                    y2={sy(E)}
                    stroke={c.chartGrid}
                    strokeWidth={chart.strokeLight}
                  />,
                  <Line
                    key={`gy${v}`}
                    x1={sx(lo)}
                    y1={sy(v)}
                    x2={sx(E)}
                    y2={sy(v)}
                    stroke={c.chartGrid}
                    strokeWidth={chart.strokeLight}
                  />,
                ])}
                <Line
                  x1={sx(lo)}
                  y1={sy(0)}
                  x2={sx(E)}
                  y2={sy(0)}
                  stroke={c.chartInk}
                  strokeWidth={chart.stroke}
                />
                <Line
                  x1={sx(0)}
                  y1={sy(lo)}
                  x2={sx(0)}
                  y2={sy(E)}
                  stroke={c.chartInk}
                  strokeWidth={chart.stroke}
                />
                {gridLines
                  // A tight grid (four quadrants on a phone) numbers every other line.
                  .filter((v, _, all) => {
                    const unit = Math.abs((all[1] ?? 1) - (all[0] ?? 0)) || 1;
                    const every = Math.abs(sx(unit) - sx(0)) < 22 ? 2 : 1;
                    return v !== 0 && Math.round(v / unit) % every === 0;
                  })
                  .map((v) => [
                    <ChartText
                      key={`lx${v}`}
                      x={sx(v)}
                      y={sy(0) + 14}
                      fontSize={chart.tiny}
                      fill={c.chartMuted}
                      textAnchor="middle"
                    >
                      {formatNumber(v)}
                    </ChartText>,
                    <ChartText
                      key={`ly${v}`}
                      x={sx(0) - 5}
                      y={sy(v) + 3}
                      fontSize={chart.tiny}
                      fill={c.chartMuted}
                      textAnchor="end"
                    >
                      {formatNumber(v)}
                    </ChartText>,
                  ])}
                <ChartText x={sx(E) + 4} y={sy(0) - 5} fontSize={chart.label} fontWeight="700">
                  x
                </ChartText>
                <ChartText x={sx(0) + 6} y={sy(E) - 4} fontSize={chart.label} fontWeight="700">
                  y
                </ChartText>
                {spec.quadrantLabels
                  ? (
                      [
                        ['I', E / 2, E / 2],
                        ['II', -E / 2, E / 2],
                        ['III', -E / 2, -E / 2],
                        ['IV', E / 2, -E / 2],
                      ] as const
                    ).map(([t, qx, qy]) => (
                      <ChartText
                        key={`q${t}`}
                        x={sx(qx)}
                        y={sy(qy)}
                        fontSize={chart.emphasis}
                        fontWeight="700"
                        fill={c.chartMuted}
                        opacity={0.6}
                        textAnchor="middle"
                      >
                        {t}
                      </ChartText>
                    ))
                  : null}
                {rect ? (
                  <Path
                    d={`M ${sx(rect.l)} ${sy(rect.b)} L ${sx(rect.r)} ${sy(rect.b)} L ${sx(rect.r)} ${sy(rect.t)} L ${sx(rect.l)} ${sy(rect.t)} Z`}
                    fill={c.chartHighlight}
                    fillOpacity={0.15}
                    stroke={c.chartHighlight}
                    strokeWidth={chart.stroke}
                  />
                ) : null}
                {rect
                  ? (
                      [
                        [rect.l, rect.b],
                        [rect.r, rect.b],
                        [rect.r, rect.t],
                        [rect.l, rect.t],
                      ] as const
                    ).map(([cx, cy], i) => (
                      <G key={`rc${i}`}>
                        <Circle cx={sx(cx)} cy={sy(cy)} r={4} fill={c.chartHighlight} />
                        <ChartText
                          x={sx(cx) + (cx === rect.l ? -6 : 6)}
                          y={sy(cy) + (cy === rect.b ? 14 : -6)}
                          fontSize={chart.small}
                          fontWeight="700"
                          textAnchor={cx === rect.l ? 'end' : 'start'}
                        >
                          {`(${formatNumber(cx)}, ${formatNumber(cy)})`}
                        </ChartText>
                      </G>
                    ))
                  : null}
                {images.map(([ix, iy, name]) => (
                  <G key={`im${name}`}>
                    <Circle
                      cx={sx(ix)}
                      cy={sy(iy)}
                      r={6}
                      fill={c.chartSurface}
                      stroke={c.chartHighlight}
                      strokeWidth={chart.stroke}
                    />
                    <ChartText
                      x={sx(ix) + (ix < 0 ? -9 : 9)}
                      y={sy(iy) + (iy < 0 ? 18 : -8)}
                      fontSize={chart.small}
                      fill={c.chartInk}
                      textAnchor={ix < 0 ? 'end' : 'start'}
                    >
                      {`(${formatNumber(ix)}, ${formatNumber(iy)})`}
                    </ChartText>
                  </G>
                ))}
                {spec.segment ? (
                  both ? (
                    <>
                      <Line
                        x1={sx(p.px)}
                        y1={sy(p.py)}
                        x2={sx(q.px)}
                        y2={sy(q.py)}
                        stroke={c.chartHighlight}
                        strokeWidth={chart.strokeHeavy}
                      />
                      {spec.distance && rep.known(spec.distance) ? (
                        <ChartText
                          x={sx(clear(p.px, q.px)) + (dx === 0 ? 8 : 0)}
                          y={sy(clear(p.py, q.py)) + (dx === 0 ? 4 : 18)}
                          fontSize={chart.label}
                          fontWeight="700"
                          fill={c.chartHighlight}
                          textAnchor={dx === 0 ? 'start' : 'middle'}
                        >
                          {`${rep.value(spec.distance, false)} units`}
                        </ChartText>
                      ) : null}
                    </>
                  ) : null
                ) : (
                  lineThrough()
                )}
                {!spec.segment && both && dx !== 0 && dy !== 0 ? (
                  <>
                    <Path
                      d={`M ${sx(p.px)} ${sy(p.py)} L ${sx(q.px)} ${sy(p.py)} L ${sx(q.px)} ${sy(q.py)}`}
                      stroke={c.chartMuted}
                      strokeWidth={chart.strokeLight}
                      strokeDasharray={chart.dash}
                      fill="none"
                    />
                    <ChartText
                      x={sx((p.px + q.px) / 2)}
                      y={sy(p.py) + (dy > 0 ? 14 : -6)}
                      fontSize={chart.small}
                      fill={c.chartMuted}
                      textAnchor="middle"
                    >
                      {spec.slope ? `run ${formatNumber(dx)}` : moveX}
                    </ChartText>
                    <ChartText
                      x={sx(q.px) + (dx > 0 ? 6 : -6)}
                      y={sy((p.py + q.py) / 2) + 4}
                      fontSize={chart.small}
                      fill={c.chartMuted}
                      textAnchor={dx > 0 ? 'start' : 'end'}
                    >
                      {spec.slope ? `rise ${formatNumber(dy)}` : moveY}
                    </ChartText>
                  </>
                ) : null}
                {trail.map(([tx, ty], i) => (
                  <Circle key={`trail${i}`} cx={sx(tx)} cy={sy(ty)} r={4} fill={c.chartMuted} />
                ))}
                {pts.map((pt) => (
                  <Circle
                    key={pt.testID}
                    cx={sx(pt.px)}
                    cy={sy(pt.py)}
                    r={6}
                    fill={c.chartHighlight}
                    opacity={pt.known ? 1 : 0.35}
                  />
                ))}
                {pts.map((pt) => {
                  // A point on a rectangle's corner already has the corner's label.
                  if (rect && [rect.l, rect.r].includes(pt.px) && [rect.b, rect.t].includes(pt.py))
                    return null;
                  // The label goes above the point, on the side the line does not cross: the
                  // upper-left when the line rises (and there is room), else the upper-right.
                  // A lone point in four quadrants (reflections) labels away from both axes,
                  // where their numbers are.
                  const out = !both && spec.quadrants === 4;
                  const upLeft = out ? pt.px < 0 : both && dx * dy > 0 && sx(pt.px) - x0 > 60;
                  const below = out && pt.py < 0;
                  return (
                    <ChartText
                      key={`t${pt.testID}`}
                      x={sx(pt.px) + (upLeft ? -9 : 9)}
                      y={sy(pt.py) + (below ? 20 : -8)}
                      fontSize={chart.label}
                      fontWeight="700"
                      textAnchor={upLeft ? 'end' : 'start'}
                    >
                      {`(${rep.value(pt.x, false)}, ${rep.value(pt.y, false)})`}
                    </ChartText>
                  );
                })}
              </Svg>
              {pts
                .filter((pt) => pt.known)
                .map((pt) => (
                  <DragHandle
                    key={pt.testID}
                    testID={pt.testID}
                    x={sx(pt.px)}
                    y={sy(pt.py)}
                    label={`the point (${rep.words ? rep.variable(pt.x).name : rep.variable(pt.x).symbol}, ${rep.words ? rep.variable(pt.y).name : rep.variable(pt.y).symbol})`}
                    onStart={() => {
                      start.current = { x: pt.px, y: pt.py };
                      ext.freeze();
                    }}
                    onMove={(mx, my) =>
                      calc.set({
                        ...rep.pin(pts.filter((o) => o !== pt).flatMap((o) => [o.x, o.y])),
                        [pt.x]: rep.snapTo(pt.x, (start.current.x + mx / unit) * rep.factor(pt.x)),
                        [pt.y]: rep.snapTo(pt.y, (start.current.y - my / unit) * rep.factor(pt.y)),
                      })
                    }
                    onEnd={ext.release}
                  />
                ))}
            </>
          );
        }}
      </Canvas>
      {trail.length > 0 && p?.known ? (
        <View style={styles.table}>
          <View style={[styles.col, { borderColor: c.chartGrid }]}>
            <Text style={[styles.cellText, styles.head, { color: c.textMuted }]}>
              {rep.variable(spec.x).name}
            </Text>
            <Text style={[styles.cellText, styles.head, { color: c.textMuted }]}>
              {rep.variable(spec.y).name}
            </Text>
          </View>
          {[...trail, [p.px, p.py] as [number, number]].map(([tx, ty], i) => (
            <View key={i} style={[styles.col, { borderColor: c.chartGrid }]}>
              <Text style={[styles.cellText, { color: c.text }]}>{formatNumber(tx)}</Text>
              <Text style={[styles.cellText, { color: c.text }]}>{formatNumber(ty)}</Text>
            </View>
          ))}
        </View>
      ) : null}
      <Caption>
        {rect
          ? `A rectangle ${formatNumber(Math.abs(rect.r - rect.l))} units wide and ${formatNumber(Math.abs(rect.t - rect.b))} units tall.`
          : spec.reflect && p?.known
            ? `(${formatNumber(p.px)}, ${formatNumber(p.py)}) reflected across the x-axis is (${formatNumber(p.px)}, ${formatNumber(-p.py)}); across the y-axis (${formatNumber(-p.px)}, ${formatNumber(p.py)}); across both (${formatNumber(-p.px)}, ${formatNumber(-p.py)}).`
            : spec.segment && both
              ? `From (${formatNumber(p.px)}, ${formatNumber(p.py)}) to (${formatNumber(q.px)}, ${formatNumber(q.py)}): ${formatNumber(Math.abs(dx) + Math.abs(dy))} units${dx !== 0 && dy !== 0 ? ' (not on one line across or up)' : ''}.`
              : p?.known
                ? both
                  ? `From (${formatNumber(p.px)}, ${formatNumber(p.py)}) to (${formatNumber(q.px)}, ${formatNumber(q.py)}): ${spec.slope ? `rise ${formatNumber(dy)}, run ${formatNumber(dx)}. Slope: ${rep.value(spec.slope)}.` : `${moveX}, ${moveY}.`}`
                  : `The point is ${formatNumber(p.px)} across and ${formatNumber(p.py)} up.`
                : 'Type both coordinates to place the point.'}
      </Caption>
      <Steppers
        calc={calc}
        items={pts.flatMap((pt) =>
          [pt.x, pt.y].map((id) => ({
            var: id,
            steps: [1],
            pin: pts.flatMap((o) => [o.x, o.y]).filter((v) => v !== id),
          })),
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  table: { flexDirection: 'row', justifyContent: 'center', flexWrap: 'wrap', marginBottom: 4 },
  col: {
    borderWidth: StyleSheet.hairlineWidth,
    minWidth: 34,
    alignItems: 'center',
    paddingVertical: 2,
  },
  head: { paddingHorizontal: 4, fontWeight: '600' },
  cellText: { fontSize: font.caption + 1, fontVariant: ['tabular-nums'] },
});

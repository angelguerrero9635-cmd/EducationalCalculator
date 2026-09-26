import { useRef } from 'react';
import { StyleSheet, View } from 'react-native';

import { Text } from '@/components/Text';
import Svg, { Circle, Line, Path } from 'react-native-svg';

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
  const dx = both ? q.px - p.px : 0;
  const dy = both ? q.py - p.py : 0;

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
                  .filter((v) => v !== 0)
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
                <ChartText x={sx(E) + 4} y={sy(0) + 4} fontSize={chart.label} fontWeight="700">
                  x
                </ChartText>
                <ChartText x={sx(0) + 6} y={sy(E) - 4} fontSize={chart.label} fontWeight="700">
                  y
                </ChartText>
                {lineThrough()}
                {both && dx !== 0 && dy !== 0 ? (
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
                      {`run ${formatNumber(dx)}`}
                    </ChartText>
                    <ChartText
                      x={sx(q.px) + (dx > 0 ? 6 : -6)}
                      y={sy((p.py + q.py) / 2) + 4}
                      fontSize={chart.small}
                      fill={c.chartMuted}
                      textAnchor={dx > 0 ? 'start' : 'end'}
                    >
                      {`rise ${formatNumber(dy)}`}
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
                  // The label goes above the point, on the side the line does not cross: the
                  // upper-left when the line rises (and there is room), else the upper-right.
                  const upLeft = both && dx * dy > 0 && sx(pt.px) - x0 > 60;
                  return (
                    <ChartText
                      key={`t${pt.testID}`}
                      x={sx(pt.px) + (upLeft ? -9 : 9)}
                      y={sy(pt.py) - 8}
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
        {p?.known
          ? both
            ? `From (${formatNumber(p.px)}, ${formatNumber(p.py)}) to (${formatNumber(q.px)}, ${formatNumber(q.py)}): rise ${formatNumber(dy)}, run ${formatNumber(dx)}.${spec.slope ? ` Slope: ${rep.value(spec.slope)}.` : ''}`
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

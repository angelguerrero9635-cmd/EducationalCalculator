/**
 * HC54 (college round 3, group C): `rightTriangle` with `rates`, for related rates. The triangle
 * drawn large and to scale with the right angle C at the bottom right, the leg b along the
 * ground to the left and a up; each side's rate an arrow at the end that moves (its length
 * scaled to the biggest rate, its direction the rate's sign). `scene` makes it a ladder against
 * a brick wall or two roads meeting at a right angle. The caption works a·a′ + b·b′ = c·c′.
 */
import { useRef } from 'react';
import { View } from 'react-native';
import Svg, { G, Line, Path, Polygon, Rect } from 'react-native-svg';

import type { Representation } from '@/data/modules';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, Caption, ChartText, DragHandle, useFrozen, useRep } from './common';
import { arrowHead } from './graphKit';
import { rateGap, sig4 as sig } from './ratesHe3cMath';
import { TriangleScene } from './TriangleScene';

type Spec = Extract<Representation, { kind: 'rightTriangle' }>;
type Side = 'a' | 'b' | 'c';

export function RightTriangleRatesHe3c({ spec, calc }: { spec: Spec; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  const start = useRef(0);
  const rates = spec.rates ?? {};
  const [a, b, cc] = [rep.val(spec.a), rep.val(spec.b), rep.val(spec.c)];
  const sidesKnown = [spec.a, spec.b, spec.c].every(rep.known);
  const op = sidesKnown ? 1 : 0.35;
  const fit = useFrozen({ a: Math.max(a, 1e-9), b: Math.max(b, 1e-9) });
  const sym = (id: string) => rep.variable(id).symbol;

  // Each rate: known (drawn) or not (nothing drawn, "?" in the caption).
  const rateOf = (s: Side) => {
    const id = rates[s];
    if (!id) return { id, v: 0, known: true, fixed: true };
    return { id, v: rep.val(id), known: rep.known(id), fixed: false };
  };
  const R = { a: rateOf('a'), b: rateOf('b'), c: rateOf('c') };
  const biggest = Math.max(
    1e-12,
    ...(['a', 'b', 'c'] as Side[])
      .filter((s) => !R[s].fixed && R[s].known)
      .map((s) => Math.abs(R[s].v)),
  );
  const arrowLen = (v: number) => 16 + (34 * Math.abs(v)) / biggest;

  // Caption: the rates, then the relation they satisfy.
  const sideId = { a: spec.a, b: spec.b, c: spec.c };
  const lines: string[] = [];
  const shownRates = (['a', 'b', 'c'] as Side[]).filter((s) => !R[s].fixed);
  if (shownRates.length) lines.push(shownRates.map((s) => rep.label(R[s].id!)).join(', '));
  const prime = (s: Side) => (R[s].fixed ? `${sym(sideId[s])}′` : sym(R[s].id!));
  const rule = `${sym(spec.a)}² + ${sym(spec.b)}² = ${sym(spec.c)}², so ${sym(spec.a)}·${prime('a')} + ${sym(spec.b)}·${prime('b')} = ${sym(spec.c)}·${prime('c')}`;
  const fixedNote = (['a', 'b', 'c'] as Side[])
    .filter((s) => R[s].fixed)
    .map((s) => `${sym(sideId[s])} is fixed (${sym(sideId[s])}′ = 0)`);
  if (sidesKnown && (['a', 'b', 'c'] as Side[]).every((s) => R[s].known)) {
    const left = a * R.a.v + b * R.b.v;
    lines.push(
      `${rule}: ${sig(a)} × ${sig(R.a.v)} + ${sig(b)} × ${sig(R.b.v)} = ${sig(left)}, ${sig(cc)} × ${sig(R.c.v)} = ${sig(cc * R.c.v)}`,
    );
    if (Math.abs(rateGap(a, b, cc, R.a.v, R.b.v, R.c.v)) > 1e-3 * Math.max(1, Math.abs(left)))
      lines.push('These rates don’t fit together: change one.');
  } else lines.push(rule);
  if (fixedNote.length) lines.push(fixedNote.join('; '));

  const ladder = spec.scene === 'ladder';
  const roads = spec.scene === 'roads';

  return (
    <View>
      <Canvas aspect={0.78}>
        {({ w, h }) => {
          const [L, Rm, T, B] = [70, ladder ? 96 : roads ? 88 : 80, rates.a ? 58 : 36, 40];
          const s = Math.min((w - L - Rm) / fit.value.b, (h - T - B) / fit.value.a);
          const Cx = w - Rm;
          const Cy = h - B;
          const A = { x: Cx - b * s, y: Cy };
          const Bp = { x: Cx, y: Cy - a * s };
          const mark = Math.min(12, (Math.min(a, b) * s) / 3);
          const ink = c.chartInk;
          const arrow = (x1: number, y1: number, x2: number, y2: number, key: string) => (
            <G key={key}>
              <Line
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke={c.hopBack}
                strokeWidth={chart.stroke + 0.5}
              />
              <Path d={arrowHead(x2, y2, x2 - x1, y2 - y1, 10)} fill={c.hopBack} />
            </G>
          );
          const tag = (x: number, y: number, text: string, anchor: 'start' | 'middle' | 'end') => (
            <ChartText
              x={x}
              y={y}
              textAnchor={anchor}
              fontSize={chart.label}
              fontWeight="700"
              fill={c.hopBack}
            >
              {text}
            </ChartText>
          );
          // The hypotenuse's outward normal (up and to the left, away from C).
          const len = Math.hypot(Bp.x - A.x, Bp.y - A.y) || 1;
          const u = { x: (Bp.x - A.x) / len, y: (Bp.y - A.y) / len };
          const n = { x: u.y, y: -u.x };
          const mid = { x: (A.x + Bp.x) / 2, y: (A.y + Bp.y) / 2 };
          const cRate = !R.c.fixed && R.c.known && Math.abs(R.c.v) > 1e-12;
          const cOff = cRate ? 40 : 16;
          return (
            <>
              <Svg width={w} height={h}>
                <G opacity={op}>
                  {roads ? (
                    <G>
                      <Rect x={0} y={Cy - 9} width={Cx + 9} height={18} fill={c.fbRoad} />
                      <Rect x={Cx - 9} y={0} width={18} height={Cy + 9} fill={c.fbRoad} />
                      <Line
                        x1={0}
                        y1={Cy}
                        x2={Cx - 9}
                        y2={Cy}
                        stroke={c.card}
                        strokeWidth={1.5}
                        strokeDasharray="8 6"
                      />
                      <Line
                        x1={Cx}
                        y1={0}
                        x2={Cx}
                        y2={Cy - 9}
                        stroke={c.card}
                        strokeWidth={1.5}
                        strokeDasharray="8 6"
                      />
                    </G>
                  ) : null}
                  {ladder ? (
                    <TriangleScene
                      kind="ladder"
                      pts={[
                        [A.x, A.y],
                        [Bp.x, Bp.y],
                        [Cx, Cy],
                      ]}
                      eye={0}
                      width={w}
                    />
                  ) : (
                    <Polygon
                      points={`${A.x},${A.y} ${Bp.x},${Bp.y} ${Cx},${Cy}`}
                      fill={roads ? 'none' : c.chartFill}
                      stroke={ink}
                      strokeWidth={chart.stroke}
                      strokeDasharray={roads ? chart.dash : undefined}
                    />
                  )}
                  {roads
                    ? [A, Bp].map((p, i) => (
                        <Rect
                          key={i}
                          x={p.x - (i ? 6 : 10)}
                          y={p.y - (i ? 10 : 6)}
                          width={i ? 12 : 20}
                          height={i ? 20 : 12}
                          rx={3}
                          fill={i ? c.chartHighlight : c.chartSecond}
                          stroke={ink}
                          strokeWidth={1}
                        />
                      ))
                    : null}
                  <Path
                    d={`M ${Cx - mark} ${Cy} L ${Cx - mark} ${Cy - mark} L ${Cx} ${Cy - mark}`}
                    stroke={ink}
                    strokeWidth={1}
                    fill="none"
                  />
                  {/* Side labels: b under its leg, a right of its leg, c out past the hypotenuse. */}
                  <ChartText x={(A.x + Cx) / 2} y={Cy + 26} textAnchor="middle" fontWeight="600">
                    {rep.label(spec.b)}
                  </ChartText>
                  <ChartText
                    x={Cx + (ladder ? 26 : roads ? 14 : 8)}
                    y={(Cy + Bp.y) / 2 + 4}
                    textAnchor="start"
                    fontWeight="600"
                  >
                    {rep.label(spec.a)}
                  </ChartText>
                  <ChartText
                    x={mid.x + n.x * cOff}
                    y={mid.y + n.y * cOff + 4}
                    textAnchor="end"
                    fontWeight="600"
                  >
                    {rep.label(spec.c)}
                  </ChartText>
                </G>
                {sidesKnown && !R.b.fixed && R.b.known && Math.abs(R.b.v) > 1e-12
                  ? (() => {
                      // b grows: the far end A moves away from C (left).
                      const d = -Math.sign(R.b.v) * arrowLen(R.b.v);
                      const y = Cy - 16;
                      const x0 = R.b.v > 0 ? A.x - 4 : A.x + 4 - d;
                      return (
                        <G>
                          {arrow(x0, y, x0 + d, y, 'b')}
                          {tag(Math.min(x0, x0 + d) - 4, y + 4, sym(R.b.id!), 'end')}
                        </G>
                      );
                    })()
                  : null}
                {sidesKnown && !R.a.fixed && R.a.known && Math.abs(R.a.v) > 1e-12
                  ? (() => {
                      // a grows: the top B moves up.
                      const d = -Math.sign(R.a.v) * arrowLen(R.a.v);
                      const x = Cx + (ladder ? 30 : roads ? 18 : 12);
                      const y0 = R.a.v > 0 ? Bp.y - 4 : Bp.y + 4 - d;
                      return (
                        <G>
                          {arrow(x, y0, x, y0 + d, 'a')}
                          {tag(x + 6, (y0 + y0 + d) / 2 + 4, sym(R.a.id!), 'start')}
                        </G>
                      );
                    })()
                  : null}
                {sidesKnown && cRate
                  ? (() => {
                      // c grows: heads point out along the hypotenuse; shrinks: in.
                      const half = arrowLen(R.c.v) / 2 + 6;
                      const o = { x: mid.x + n.x * 16, y: mid.y + n.y * 16 };
                      const grow = R.c.v > 0;
                      const ends = [-1, 1].map((k) => ({
                        x: o.x + u.x * half * k,
                        y: o.y + u.y * half * k,
                      }));
                      return (
                        <G>
                          <Line
                            x1={ends[0]!.x}
                            y1={ends[0]!.y}
                            x2={ends[1]!.x}
                            y2={ends[1]!.y}
                            stroke={c.hopBack}
                            strokeWidth={chart.stroke + 0.5}
                          />
                          {ends.map((e, k) => {
                            const dir = (k ? 1 : -1) * (grow ? 1 : -1);
                            const tip = grow
                              ? e
                              : {
                                  x: o.x + u.x * 3 * (k ? 1 : -1),
                                  y: o.y + u.y * 3 * (k ? 1 : -1),
                                };
                            return (
                              <Path
                                key={k}
                                d={arrowHead(tip.x, tip.y, u.x * dir, u.y * dir, 10)}
                                fill={c.hopBack}
                              />
                            );
                          })}
                          {tag(ends[1]!.x + 6, ends[1]!.y + 4, sym(R.c.id!), 'start')}
                        </G>
                      );
                    })()
                  : null}
              </Svg>
              {sidesKnown && !spec.fixed ? (
                <DragHandle
                  testID="drag-b"
                  x={A.x}
                  y={A.y}
                  label={rep.variable(spec.b).name}
                  onStart={() => {
                    start.current = b;
                    fit.freeze();
                  }}
                  onEnd={fit.release}
                  onMove={(dx) =>
                    calc.set(
                      {
                        ...rep.pin(
                          ladder ? [spec.c, ...(spec.keep ?? [])] : [spec.a, ...(spec.keep ?? [])],
                        ),
                        [spec.b]: rep.snapTo(spec.b, start.current - dx / s),
                      },
                      rep.slide(spec.b),
                    )
                  }
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

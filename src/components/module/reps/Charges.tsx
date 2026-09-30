import { useRef } from 'react';
import { View } from 'react-native';
import Svg, { Circle, Defs, G, Line, Path } from 'react-native-svg';

import type { ChargesSpec } from '@/data/modules/typesHsk';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, Caption, ChartText, DragHandle, useFrozen, useRep } from './common';
import { arrowAt, pathOf, traceLine, type Pole } from './fieldLines';
import { arrowHead } from './graphKit';
import { coulombOf, fieldAtPoint, fieldOf, K_COULOMB } from './hskMath';
import { PointField } from './chargesPoint';
import { sig, SubLabel, Vec } from './hskKit';
import { Ball, url, usePaintIds } from './paint';

const R = 15;

/**
 * Point charges (H67): field lines traced from the field of the charges (out of +, into −,
 * as many as each charge's size), and the Coulomb forces on two charges, equal and opposite,
 * scaled by k|q₁q₂|/r²; or one charge's field E at a point. Drag the second charge (or the
 * point) for the distance.
 */
export function Charges({ spec, calc }: { spec: ChargesSpec; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  const ids = usePaintIds('plus', 'minus', 'test');
  const drag = useRef(0);
  const si = (x: number | string | undefined, d = 0) =>
    x === undefined ? d : typeof x === 'number' ? x : rep.val(x);
  const known = (x: number | string | undefined) => typeof x !== 'string' || rep.known(x);
  const q1 = si(spec.charges[0], 1);
  const two = spec.charges[1] !== undefined;
  const q2 = two ? si(spec.charges[1], 1) : 0;
  const r = Math.max(1e-9, si(spec.distance, 1));
  const co = coulombOf(q1, q2, r);
  const E = fieldOf(q1, r);
  const all = [...spec.charges, spec.distance].every(known);
  const ref = useFrozen(two ? co.F : E);
  // H102: the field at a point x along the line of two charges (the forces are left out).
  const at = two && spec.point !== undefined ? si(spec.point) : undefined;
  const fp = at === undefined ? undefined : fieldAtPoint(q1, q2, r, at);
  const lines =
    fp && at !== undefined ? [...captionLines().slice(2), ...pointLines()] : captionLines();

  return (
    <View>
      <Canvas aspect={0.74}>
        {({ w, h }) => {
          const mid = h * 0.5;
          const D = w * 0.44;
          const A = { x: two ? w / 2 - D / 2 : w * 0.3, y: mid };
          const B = { x: A.x + D, y: mid };
          const box = { x0: 2, y0: 2, x1: w - 2, y1: h - 2 };
          const poles: Pole[] = [
            { x: A.x, y: A.y, q: q1 },
            ...(two ? [{ x: B.x, y: B.y, q: q2 }] : []),
          ];
          const big = Math.max(1e-12, ...poles.map((p) => Math.abs(p.q)));
          const count = (q: number) =>
            q === 0 ? 0 : Math.max(2, Math.round((12 * Math.abs(q)) / big));
          const pos = poles.filter((p) => p.q > 0).reduce((s, p) => s + p.q, 0);
          const neg = -poles.filter((p) => p.q < 0).reduce((s, p) => s + p.q, 0);
          // Trace from the side with more charge, so every line of the other ends on a charge.
          const fromPlus = pos >= neg;
          const traced = poles
            .filter((p) => (fromPlus ? p.q > 0 : p.q < 0))
            .flatMap((p, pi) =>
              Array.from({ length: count(p.q) }, (_, k) => {
                const a = (2 * Math.PI * (k + 0.5)) / count(p.q) + pi * 0.2;
                const pts = traceLine(
                  poles,
                  p.x + (R + 2) * Math.cos(a),
                  p.y + (R + 2) * Math.sin(a),
                  box,
                  [],
                  2,
                  R,
                  1600,
                  fromPlus ? 1 : -1,
                );
                return { pts, flip: !fromPlus };
              }),
            );
          const k = 70 / Math.max(1e-300, ref.value);
          const L = Math.min(D / 2 - R - 6, (two ? co.F : E) * k);
          const dirA = two ? (co.repel ? -1 : 1) : 1;
          return (
            <>
              <Svg width={w} height={h}>
                <Defs>
                  <Ball id={ids.plus} color={c.physPlus} />
                  <Ball id={ids.minus} color={c.physMinus} />
                  <Ball id={ids.test} color={c.chartSurface} />
                </Defs>
                <G opacity={all ? 1 : 0.4}>
                  {traced.map(({ pts, flip }, i) => {
                    const at = arrowAt(pts, 0.35);
                    const ang = at ? ((at.angle + (flip ? 180 : 0)) * Math.PI) / 180 : 0;
                    return (
                      <G key={i}>
                        <Path d={pathOf(pts)} stroke={c.physField} strokeWidth={1.4} fill="none" />
                        {at ? (
                          <Path
                            d={arrowHead(at.x, at.y, Math.cos(ang), Math.sin(ang), 7)}
                            fill={c.physField}
                          />
                        ) : null}
                      </G>
                    );
                  })}
                  {fp && at !== undefined ? (
                    <PointField
                      x={A.x + (D * at) / r}
                      y={mid}
                      field={fp}
                      w={w}
                      faded={!known(spec.point)}
                    />
                  ) : two ? (
                    <G>
                      <Vec
                        x1={A.x + dirA * (R + 2)}
                        y1={A.y}
                        x2={A.x + dirA * (R + 2 + L)}
                        y2={A.y}
                        color={c.forceNet}
                      />
                      <Vec
                        x1={B.x - dirA * (R + 2)}
                        y1={B.y}
                        x2={B.x - dirA * (R + 2 + L)}
                        y2={B.y}
                        color={c.forceNet}
                      />
                      <SubLabel
                        x={w / 2}
                        y={mid - 26}
                        text={`F ${sig(co.F)} N on each`}
                        color={c.forceNet}
                        w={w}
                      />
                    </G>
                  ) : (
                    <G>
                      <Circle cx={B.x} cy={B.y} r={5} fill={c.chartInk} />
                      <Vec
                        x1={B.x}
                        y1={B.y}
                        x2={B.x + (q1 >= 0 ? 1 : -1) * Math.max(10, L)}
                        y2={B.y}
                        color={c.forceNet}
                      />
                      <SubLabel
                        x={B.x + 6}
                        y={B.y - 14}
                        text={`E ${sig(E)} N/C`}
                        anchor="start"
                        color={c.forceNet}
                        w={w}
                      />
                    </G>
                  )}
                  {poles.map((p, i) => (
                    <G key={i}>
                      <Circle
                        cx={p.x}
                        cy={p.y}
                        r={R}
                        fill={url(p.q >= 0 ? ids.plus : ids.minus)}
                        stroke={c.chartInk}
                      />
                      <ChartText
                        x={p.x}
                        y={p.y + 6}
                        textAnchor="middle"
                        fontSize={chart.emphasis + 2}
                        fontWeight="800"
                        fill={c.onAccent}
                      >
                        {p.q >= 0 ? '+' : '−'}
                      </ChartText>
                      <SubLabel
                        x={p.x}
                        y={p.y + R + 20}
                        text={`q_${i + 1} ${p.q > 0 ? '+' : ''}${sig(p.q)} μC`}
                        w={w}
                      />
                    </G>
                  ))}
                </G>
                <Line x1={A.x} y1={h - 18} x2={B.x} y2={h - 18} stroke={c.chartMuted} />
                <Line x1={A.x} y1={h - 24} x2={A.x} y2={h - 12} stroke={c.chartMuted} />
                <Line x1={B.x} y1={h - 24} x2={B.x} y2={h - 12} stroke={c.chartMuted} />
                <SubLabel
                  x={(A.x + B.x) / 2}
                  y={h - 22}
                  text={`r = ${sig(r)} m`}
                  size={chart.label}
                  w={w}
                />
              </Svg>
              {!spec.fixed && typeof spec.distance === 'string' && rep.known(spec.distance) ? (
                <DragHandle
                  testID="drag-distance"
                  x={B.x}
                  y={B.y}
                  label={rep.variable(spec.distance).name}
                  onStart={() => {
                    drag.current = r;
                    ref.freeze();
                  }}
                  onEnd={ref.release}
                  onMove={(dx) => {
                    const id = spec.distance as string;
                    calc.set(
                      {
                        ...rep.pin(spec.charges.flatMap((x) => (typeof x === 'string' ? [x] : []))),
                        [id]: rep.snapTo(id, drag.current * Math.max(0.2, (D + dx) / D)),
                      },
                      rep.slide(id),
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

  /** H102: each charge's field at the point and their sum, + toward q₂'s side. */
  function pointLines(): string[] {
    if (!fp || at === undefined) return [];
    return [
      `At x = ${sig(at)} m: E₁ = kq₁/x² = ${sig(fp.E1)} N/C and E₂ = kq₂/(x − r)² = ${sig(fp.E2)} N/C, each + pointing toward q₂’s side.`,
      `E = E₁ + E₂ = ${sig(fp.E1)} + ${fp.E2 < 0 ? `(${sig(fp.E2)})` : sig(fp.E2)} = ${sig(fp.E)} N/C`,
      'Each charge’s field points away from it if +, toward it if −; the fields add as arrows.',
    ];
  }

  function captionLines(): string[] {
    const k = `${sig(K_COULOMB)}`;
    if (two)
      return [
        `F = k|q₁q₂|/r² = ${k} × ${sig(Math.abs(q1))} × 10⁻⁶ × ${sig(Math.abs(q2))} × 10⁻⁶/${sig(r)}² = ${sig(co.F)} N`,
        co.repel
          ? 'Like charges repel: each is pushed away from the other, just as hard.'
          : 'Unlike charges attract: each is pulled toward the other, just as hard.',
        'Field lines leave + charges and end on − charges; where they crowd, the field is strong.',
      ];
    return [
      `E = k|q|/r² = ${k} × ${sig(Math.abs(q1))} × 10⁻⁶/${sig(r)}² = ${sig(E)} N/C`,
      q1 >= 0 ? 'The field points away from a + charge.' : 'The field points toward a − charge.',
      'Twice as far, a quarter of the field.',
    ];
  }
}

import { useRef } from 'react';
import { View } from 'react-native';
import Svg, { Circle, ClipPath, Defs, G, Line, Path, Rect } from 'react-native-svg';

import type { ChargesSpec } from '@/data/modules/typesHsk';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, Caption, ChartText, DragHandle } from './common';
import { num } from './CircularSatellite';
import { arrowHead } from './graphKit';
import { onCircle, par, useReader } from './hs3aKit';
import { potentialOf } from './hs3aMath';
import { SubLabel, worked } from './hskKit';
import { Ball, url, usePaintIds } from './paint';

const R = 16;
/** The equal-potential circles, as multiples of r. */
const RINGS = [0.5, 1, 2];

/**
 * `charges` option `equipotentials` (H107): one charge with its field lines, and dashed
 * circles of equal potential at r/2, r and 2r, each labelled with V = kq/r there (2V, V, V/2);
 * a second charge q₀ on the circle at r with its potential energy U = q₀V. Drag q₀ for r.
 */
export function ChargesPotential({ spec, calc }: { spec: ChargesSpec; calc: Calculator }) {
  const c = usePalette();
  const { rep, v, known, all, text } = useReader(calc);
  const ids = usePaintIds('plus', 'minus', 'clip');
  const drag = useRef(0);
  const o = spec.equipotentials ?? {};
  const q = v(spec.charges[0], 1);
  const r = Math.max(1e-9, v(spec.distance, 1));
  const V = potentialOf(q, r);
  const q0 = o.test === undefined ? undefined : v(o.test);
  const U = q0 === undefined ? undefined : q0 * 1e-6 * V;
  const distId = typeof spec.distance === 'string' ? spec.distance : undefined;
  // A "?" box reads "?" on the picture too, not the example's number drawn faded behind it.
  const vOk = all(spec.charges[0], spec.distance);

  return (
    <View>
      <Canvas aspect={0.86}>
        {({ w, h }) => {
          const O = { x: w * 0.34, y: h * 0.5 };
          const unit = w * 0.24;
          const test = { x: O.x + unit, y: O.y };
          const out = q >= 0;
          return (
            <>
              <Svg width={w} height={h}>
                <Defs>
                  <Ball id={ids.plus} color={c.physPlus} />
                  <Ball id={ids.minus} color={c.physMinus} />
                  <ClipPath id={ids.clip}>
                    <Rect x={0} y={0} width={w} height={h} />
                  </ClipPath>
                </Defs>
                <G opacity={all(spec.charges[0], spec.distance, o.test) ? 1 : 0.4}>
                  {/* Field lines, out of + and into −. */}
                  {Array.from({ length: 8 }, (_, i) => {
                    const a = (i * Math.PI) / 4 + Math.PI / 8;
                    const p1 = onCircle(O.x, O.y, R + 3, a);
                    const p2 = onCircle(O.x, O.y, w, a);
                    const m = onCircle(O.x, O.y, unit * 1.5, a);
                    const d = out ? 1 : -1;
                    return (
                      <G key={i} clipPath={url(ids.clip)}>
                        <Line
                          x1={p1.x}
                          y1={p1.y}
                          x2={p2.x}
                          y2={p2.y}
                          stroke={c.physField}
                          strokeWidth={1.2}
                          strokeOpacity={0.45}
                        />
                        <Path
                          d={arrowHead(m.x, m.y, d * Math.cos(a), -d * Math.sin(a), 7)}
                          fill={c.physField}
                        />
                      </G>
                    );
                  })}
                  {/* Circles of equal potential. */}
                  {RINGS.map((k) => (
                    <Circle
                      key={k}
                      cx={O.x}
                      cy={O.y}
                      r={unit * k}
                      fill="none"
                      stroke={c.chartHighlight}
                      strokeWidth={k === 1 ? 2.5 : 1.8}
                      strokeDasharray="6 4"
                    />
                  ))}
                  {RINGS.map((k) => {
                    const p = onCircle(O.x, O.y, unit * k, k === 2 ? -0.9 : k === 1 ? 0.9 : 1.9);
                    const label =
                      k === 1
                        ? `V = ${text(o.potential, V, 'V')}`
                        : `${k === 2 ? 'V/2' : '2V'} = ${vOk ? num(V / k) : '?'} V`;
                    return (
                      <SubLabel
                        key={k}
                        x={p.x + (k === 0.5 ? -4 : 4)}
                        y={p.y - 4}
                        text={label}
                        anchor={k === 0.5 ? 'end' : 'start'}
                        color={c.chartHighlight}
                        size={k === 1 ? chart.value : chart.label}
                        w={w}
                      />
                    );
                  })}
                  {/* r, out to the second charge. */}
                  <Line x1={O.x} y1={O.y + 30} x2={test.x} y2={test.y + 30} stroke={c.chartMuted} />
                  <Line x1={test.x} y1={O.y + 24} x2={test.x} y2={O.y + 36} stroke={c.chartMuted} />
                  <SubLabel
                    x={(O.x + test.x) / 2}
                    y={O.y + 50}
                    text={`r = ${text(spec.distance, r, 'm')}`}
                    size={chart.label}
                    w={w}
                  />
                  <Circle
                    cx={O.x}
                    cy={O.y}
                    r={R}
                    fill={url(q >= 0 ? ids.plus : ids.minus)}
                    stroke={c.chartInk}
                  />
                  <ChartText
                    x={O.x}
                    y={O.y + 6}
                    textAnchor="middle"
                    fontSize={chart.emphasis + 2}
                    fontWeight="800"
                    fill={c.onAccent}
                  >
                    {q >= 0 ? '+' : '−'}
                  </ChartText>
                  <SubLabel
                    x={O.x}
                    y={O.y - R - 8}
                    text={`q = ${text(spec.charges[0], q, 'μC')}`}
                    size={chart.label}
                    w={w}
                  />
                  {q0 !== undefined ? (
                    <G>
                      <Circle
                        cx={test.x}
                        cy={test.y}
                        r={10}
                        fill={url(q0 >= 0 ? ids.plus : ids.minus)}
                        stroke={c.chartInk}
                      />
                      <ChartText
                        x={test.x}
                        y={test.y + 5}
                        textAnchor="middle"
                        fontSize={chart.emphasis}
                        fontWeight="800"
                        fill={c.onAccent}
                      >
                        {q0 >= 0 ? '+' : '−'}
                      </ChartText>
                      <SubLabel
                        x={test.x + 14}
                        y={test.y - 12}
                        text={`q_0 = ${text(o.test, q0, 'μC')}`}
                        anchor="start"
                        w={w}
                      />
                      <SubLabel
                        x={test.x + 14}
                        y={test.y + 20}
                        text={`U = ${text(o.energy, U!, 'J')}`}
                        anchor="start"
                        color={c.physWork}
                        w={w}
                      />
                    </G>
                  ) : null}
                </G>
              </Svg>
              {!spec.fixed && distId && known(distId) ? (
                <DragHandle
                  testID="drag-distance"
                  x={test.x}
                  y={test.y}
                  label={rep.variable(distId).name}
                  onStart={() => {
                    drag.current = r;
                  }}
                  onMove={(dx) => {
                    const pinned = [spec.charges[0], o.test].filter(
                      (x): x is string => typeof x === 'string',
                    );
                    calc.set(
                      {
                        ...rep.pin(pinned),
                        [distId]: rep.snapTo(
                          distId,
                          drag.current * Math.max(0.2, (unit + dx) / unit),
                        ),
                      },
                      rep.slide(distId),
                    );
                  }}
                />
              ) : null}
            </>
          );
        }}
      </Canvas>
      <Caption>
        {[
          ...worked(vOk, `V = kq/r = 8.99 × 10⁹ × ${par(num(q))} × 10⁻⁶/${num(r)} = ${num(V)} V`),
          ...(q0 !== undefined && U !== undefined
            ? worked(
                vOk && known(o.test),
                `U = q₀V = ${par(num(q0))} × 10⁻⁶ × ${par(num(V))} = ${num(U)} J`,
              )
            : []),
          'Half as far, twice the potential: V falls off as 1/r, not 1/r².',
          'Moving a charge along a dashed circle takes no work: V is the same all the way round.',
        ].join(' · ')}
      </Caption>
    </View>
  );
}

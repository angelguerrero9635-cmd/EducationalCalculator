import { View } from 'react-native';
import Svg, { Circle, Defs, G, Line, Path } from 'react-native-svg';

import type { MovingCharge as MovingChargeSpec } from '@/data/modules/typesHs3a';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, Caption, ChartText } from './common';
import { num } from './CircularSatellite';
import { arrowHead } from './graphKit';
import { onCircle, par, useReader } from './hs3aKit';
import { magneticOf } from './hs3aMath';
import { RAD, sci, SubLabel, Vec } from './hskKit';
import { Ball, url, usePaintIds } from './paint';

type Spec = MovingChargeSpec & { kind: 'induction'; fixed?: boolean };

/**
 * `induction` mode `charge` (H107): a charge moving through a magnetic field. With B across
 * the page (× in, • out) the force F = |q|vB is in the page, square to v, from F = qv × B
 * (the other way for a − charge), and with a mass the path is a circle of r = mv/(|q|B); with
 * an angle θ, B runs along the page, v at θ to it, and F = |q|vB sin θ points into or out of
 * the page.
 */
export function MovingCharge({ spec, calc }: { spec: Spec; calc: Calculator }) {
  const c = usePalette();
  const { v, all, text } = useReader(calc);
  const ids = usePaintIds('plus', 'minus');
  const per = spec.coulombs ?? 1;
  const qShown = v(spec.charge, 1);
  const q = qShown * per;
  const speed = Math.max(0, v(spec.speed, 1));
  const B = Math.max(0, v(spec.field, 1));
  const inPlane = spec.angle !== undefined;
  const th = inPlane ? v(spec.angle, 90) : 90;
  const mass = spec.mass === undefined ? undefined : v(spec.mass);
  const { F, r } = magneticOf(q, speed, B, th, mass);
  const into = (spec.fieldDir ?? 'in') === 'in';
  const plus = q >= 0;
  // B into the page, v to the right: F = qv × B points up for a + charge.
  const up = plus === into;
  // B along the page to the right, v at θ above it: F points into the page for a + charge.
  const forceInto = plus;
  const circle = !inPlane && mass !== undefined && Number.isFinite(r);
  const qUnit = per === 1 ? 'C' : Math.abs(per - 1e-6) < 1e-12 ? 'μC' : 'e';

  return (
    <View>
      <Canvas aspect={0.82}>
        {({ w, h }) => {
          const xs = Array.from({ length: Math.floor((w - 20) / 34) }, (_, i) => 20 + i * 34);
          const ys = Array.from({ length: Math.floor((h - 50) / 34) }, (_, i) => 22 + i * 34);
          const Rpx = h * 0.3;
          const P = circle
            ? { x: w * 0.42, y: up ? h * 0.46 + Rpx : h * 0.46 - Rpx }
            : { x: w * 0.36, y: h * 0.52 };
          const O = { x: P.x, y: up ? P.y - Rpx : P.y + Rpx };
          const dir = inPlane ? { x: Math.cos(th * RAD), y: -Math.sin(th * RAD) } : { x: 1, y: 0 };
          return (
            <Svg width={w} height={h}>
              <Defs>
                <Ball id={ids.plus} color={c.physPlus} />
                <Ball id={ids.minus} color={c.physMinus} />
              </Defs>
              <G
                opacity={all(spec.charge, spec.speed, spec.field, spec.angle, spec.mass) ? 1 : 0.4}
              >
                {/* The field: × into the page, • out of it, or arrows along it. */}
                {inPlane
                  ? ys.map((y) => (
                      <Vec
                        key={y}
                        x1={12}
                        y1={y}
                        x2={w - 12}
                        y2={y}
                        color={c.physField}
                        width={1.2}
                        head={7}
                        opacity={0.7}
                      />
                    ))
                  : xs.flatMap((x) =>
                      ys.map((y) =>
                        into ? (
                          <G key={`${x},${y}`} opacity={0.7}>
                            <Line
                              x1={x - 4}
                              y1={y - 4}
                              x2={x + 4}
                              y2={y + 4}
                              stroke={c.physField}
                              strokeWidth={1.5}
                            />
                            <Line
                              x1={x - 4}
                              y1={y + 4}
                              x2={x + 4}
                              y2={y - 4}
                              stroke={c.physField}
                              strokeWidth={1.5}
                            />
                          </G>
                        ) : (
                          <Circle
                            key={`${x},${y}`}
                            cx={x}
                            cy={y}
                            r={2.5}
                            fill={c.physField}
                            opacity={0.7}
                          />
                        ),
                      ),
                    )}
                {/* The circle it follows, square to the field. */}
                {circle ? (
                  <G>
                    <Circle
                      cx={O.x}
                      cy={O.y}
                      r={Rpx}
                      fill="none"
                      stroke={c.chartHighlight}
                      strokeWidth={2}
                      strokeDasharray="6 5"
                    />
                    {[0.25, 0.5, 0.75].map((k) => {
                      // Along the turn: counterclockwise when the center is above.
                      const a0 = up ? -Math.PI / 2 : Math.PI / 2;
                      const a = a0 + (up ? 1 : -1) * 2 * Math.PI * k;
                      const p = onCircle(O.x, O.y, Rpx, a);
                      const s = up ? 1 : -1;
                      return (
                        <Path
                          key={k}
                          d={arrowHead(p.x, p.y, -s * Math.sin(a), -s * Math.cos(a), 9)}
                          fill={c.chartHighlight}
                        />
                      );
                    })}
                    <Line x1={O.x} y1={O.y} x2={O.x + Rpx} y2={O.y} stroke={c.chartHighlight} />
                    <Circle cx={O.x} cy={O.y} r={3} fill={c.chartHighlight} />
                    <SubLabel
                      x={O.x + Rpx / 2}
                      y={O.y - 8}
                      text={`r = ${text(spec.radius, r, 'm')}`}
                      color={c.chartHighlight}
                      w={w}
                    />
                  </G>
                ) : null}
                {/* The charge, its velocity and the force. */}
                <Vec
                  x1={P.x + dir.x * 14}
                  y1={P.y + dir.y * 14}
                  x2={P.x + dir.x * 84}
                  y2={P.y + dir.y * 84}
                  color={c.chartInk}
                  width={3}
                />
                <SubLabel
                  x={P.x + dir.x * 84 + 6}
                  y={P.y + dir.y * 84 + (inPlane ? -6 : 20)}
                  text={`v = ${text(spec.speed, speed, 'm/s')}`}
                  anchor="start"
                  w={w}
                />
                {inPlane ? (
                  <G>
                    <Circle
                      cx={P.x - 44}
                      cy={P.y}
                      r={12}
                      fill={c.card}
                      stroke={c.forceNet}
                      strokeWidth={2.5}
                    />
                    {forceInto ? (
                      <G>
                        <Line
                          x1={P.x - 51}
                          y1={P.y - 7}
                          x2={P.x - 37}
                          y2={P.y + 7}
                          stroke={c.forceNet}
                          strokeWidth={2.5}
                        />
                        <Line
                          x1={P.x - 51}
                          y1={P.y + 7}
                          x2={P.x - 37}
                          y2={P.y - 7}
                          stroke={c.forceNet}
                          strokeWidth={2.5}
                        />
                      </G>
                    ) : (
                      <Circle cx={P.x - 44} cy={P.y} r={4} fill={c.forceNet} />
                    )}
                    <SubLabel
                      x={P.x - 44}
                      y={P.y + 34}
                      text={`F = ${text(spec.force, F, 'N')} ${forceInto ? 'into' : 'out of'} the page`}
                      color={c.forceNet}
                      w={w}
                    />
                    <Path
                      d={`M ${P.x + 30} ${P.y} A 30 30 0 0 0 ${P.x + 30 * Math.cos(th * RAD)} ${P.y - 30 * Math.sin(th * RAD)}`}
                      stroke={c.chartInk}
                      fill="none"
                    />
                    <SubLabel
                      x={P.x + 40 * Math.cos((th / 2) * RAD) + 4}
                      y={P.y - 40 * Math.sin((th / 2) * RAD) + 4}
                      text={`θ = ${text(spec.angle, th, '°')}`}
                      anchor="start"
                      size={chart.label}
                      w={w}
                    />
                  </G>
                ) : (
                  <G>
                    <Vec
                      x1={P.x}
                      y1={P.y + (up ? -14 : 14)}
                      x2={P.x}
                      y2={P.y + (up ? -74 : 74)}
                      color={c.forceNet}
                      width={4}
                    />
                    <SubLabel
                      x={P.x - 8}
                      y={P.y + (up ? -50 : 58)}
                      text={`F = ${text(spec.force, F, 'N')}`}
                      anchor="end"
                      color={c.forceNet}
                      w={w}
                    />
                  </G>
                )}
                <Circle
                  cx={P.x}
                  cy={P.y}
                  r={12}
                  fill={url(plus ? ids.plus : ids.minus)}
                  stroke={c.chartInk}
                />
                <ChartText
                  x={P.x}
                  y={P.y + 5}
                  textAnchor="middle"
                  fontSize={chart.emphasis}
                  fontWeight="800"
                  fill={c.onAccent}
                >
                  {plus ? '+' : '−'}
                </ChartText>
              </G>
              <SubLabel
                x={10}
                y={h - 10}
                text={
                  inPlane
                    ? `B = ${text(spec.field, B, 'T')} →`
                    : `B = ${text(spec.field, B, 'T')} ${into ? 'into' : 'out of'} the page`
                }
                anchor="start"
                size={chart.label}
                w={w}
              />
              <SubLabel
                x={w - 10}
                y={h - 10}
                text={`q = ${text(spec.charge, qShown, qUnit)}`}
                anchor="end"
                size={chart.label}
                w={w}
              />
            </Svg>
          );
        }}
      </Canvas>
      <Caption>{captionLines().join(' · ')}</Caption>
    </View>
  );

  function captionLines(): string[] {
    const qC = per === 1 ? num(Math.abs(q)) : sci(Math.abs(q));
    const out = [
      inPlane
        ? `F = |q|vB sin θ = ${qC} × ${num(speed)} × ${num(B)} × sin ${num(th)}° = ${num(F)} N`
        : `F = |q|vB = ${qC} × ${num(speed)} × ${num(B)} = ${num(F)} N`,
    ];
    if (circle && mass !== undefined)
      out.push(
        `r = mv/(|q|B) = ${sci(mass)} × ${num(speed)}/(${qC} × ${num(B)}) = ${num(r)} m`,
        'The force is always square to v, so it turns the charge without speeding it up: a circle.',
      );
    else
      out.push(
        `Right-hand rule for a + charge: fingers along v, curl them toward B; the thumb is F${plus ? '' : ', and a − charge is pushed the other way'}.`,
      );
    if (!plus) out.push(`The charge is negative, ${par(num(qShown))}: F turns round.`);
    return out;
  }
}

import { useRef } from 'react';
import { View } from 'react-native';
import Svg, { Circle, Defs, G, Line, Rect } from 'react-native-svg';

import type { CollisionSpec } from '@/data/modules/typesHsk';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, Caption, ChartText, DragHandle, useFrozen, useRep } from './common';
import { collisionOf } from './hskMath';
import { sig, SubLabel, Vec } from './hskKit';
import { Sheen, TopLight, url, usePaintIds } from './paint';

const [CW, CH] = [58, 24];

/** A signed number in brackets for substituting: (−2). */
const par = (s: string) => (s.startsWith('−') ? `(${s})` : s);

/**
 * A collision on a track (H62): two carts before and after, each with its momentum as an arrow
 * on one scale and its velocity under it, and the total momentum tip to tail in each row: the
 * same before and after. Carts stick together, bounce apart elastically, or push apart from rest.
 * Drag the first cart's momentum arrow to change its velocity.
 */
export function Collision({ spec, calc }: { spec: CollisionSpec; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  const ids = usePaintIds('light', 'rail');
  const drag = useRef(0);
  const si = (x: number | string | undefined, d = 0) =>
    x === undefined ? d : typeof x === 'number' ? x : rep.val(x);
  const known = (x: number | string | undefined) => typeof x !== 'string' || rep.known(x);
  const [m1, m2] = spec.masses.map((x) => Math.max(0, si(x))) as [number, number];
  const v1 = si(spec.before[0]);
  const v2 = spec.type === 'explode' ? v1 : si(spec.before[1]);
  const first = spec.type === 'explode' ? si(spec.after?.[0]) : 0;
  const [u1, u2] = collisionOf(spec.type, m1, m2, v1, v2, first);
  const all =
    [...spec.masses, ...spec.before].every(known) &&
    (spec.type !== 'explode' || known(spec.after?.[0]));
  const pB: [number, number] = [m1 * v1, m2 * v2];
  const pA: [number, number] = [m1 * u1, m2 * u2];
  const total = pB[0] + (spec.type === 'explode' ? pB[1] : pB[1]);
  const big = Math.max(
    1e-9,
    ...pB.map(Math.abs),
    ...pA.map(Math.abs),
    Math.abs(pB[0]) + Math.abs(pB[1]),
    Math.abs(pA[0]) + Math.abs(pA[1]),
    Math.abs(total),
  );
  const scale = useFrozen(big);
  const vUnit =
    typeof spec.before[0] === 'string' ? (rep.variable(spec.before[0]).unit ?? 'm/s') : 'm/s';
  const lines = captionLines();

  return (
    <View>
      <Canvas aspect={0.98}>
        {({ w, h }) => {
          const H = h / 2;
          const rows: {
            y0: number;
            title: string;
            carts: { x: number; m: number; v: number; p: number; color: string; n: 1 | 2 }[];
            joined: boolean;
          }[] = [
            {
              y0: 0,
              title: 'Before',
              joined: spec.type === 'explode',
              carts:
                spec.type === 'explode'
                  ? [
                      { x: w * 0.44 - CW / 2, m: m1, v: v1, p: pB[0], color: c.physCartA, n: 1 },
                      { x: w * 0.44 + CW / 2, m: m2, v: v2, p: pB[1], color: c.physCartB, n: 2 },
                    ]
                  : [
                      { x: w * 0.26, m: m1, v: v1, p: pB[0], color: c.physCartA, n: 1 },
                      { x: w * 0.72, m: m2, v: v2, p: pB[1], color: c.physCartB, n: 2 },
                    ],
            },
            {
              y0: H,
              title: 'After',
              joined: spec.type === 'stick',
              carts:
                spec.type === 'stick'
                  ? [
                      { x: w * 0.46 - CW / 2, m: m1, v: u1, p: pA[0], color: c.physCartA, n: 1 },
                      { x: w * 0.46 + CW / 2, m: m2, v: u2, p: pA[1], color: c.physCartB, n: 2 },
                    ]
                  : [
                      { x: w * 0.22, m: m1, v: u1, p: pA[0], color: c.physCartA, n: 1 },
                      { x: w * 0.74, m: m2, v: u2, p: pA[1], color: c.physCartB, n: 2 },
                    ],
            },
          ];
          // One scale: the biggest momentum is 40% of the width, and every arrow stays inside.
          let k = (w * 0.4) / scale.value;
          for (const row of rows)
            for (const q of row.carts) {
              const room = q.p > 0 ? w - 10 - q.x : q.x - 10;
              if (Math.abs(q.p) > 1e-12) k = Math.min(k, Math.max(4, room) / Math.abs(q.p));
            }
          const beforeTip = { x: rows[0]!.carts[0]!.x + pB[0] * k, y: H * 0.46 };
          return (
            <>
              <Svg width={w} height={h}>
                <Defs>
                  <TopLight id={ids.light} />
                  <Sheen id={ids.rail} vertical />
                </Defs>
                <Line x1={0} y1={H} x2={w} y2={H} stroke={c.chartGrid} />
                {rows.map((row) => {
                  const railY = row.y0 + H * 0.72;
                  const arrowY = row.y0 + H * 0.46;
                  // The total momentum tip to tail, centered in the row's top band.
                  const ps =
                    row.joined && row.title === 'After'
                      ? [pA[0] + pA[1]]
                      : row.carts.map((q) => q.p);
                  const run = ps.reduce<number[]>(
                    (acc, p) => [...acc, acc[acc.length - 1]! + p],
                    [0],
                  );
                  const lo = Math.min(...run);
                  const hi = Math.max(...run);
                  const x0 = w / 2 - ((lo + hi) / 2) * k;
                  const tY = row.y0 + 30;
                  const sum = run[run.length - 1]!;
                  return (
                    <G key={row.title} opacity={all ? 1 : 0.45}>
                      <ChartText x={10} y={row.y0 + 16} fontSize={chart.label} fontWeight="700">
                        {row.title}
                      </ChartText>
                      {/* Total momentum. */}
                      {ps.map((p, i) => (
                        <Vec
                          key={i}
                          x1={x0 + run[i]! * k}
                          y1={tY}
                          x2={x0 + run[i + 1]! * k}
                          y2={tY}
                          color={ps.length === 1 ? c.forceNet : i === 0 ? c.physCartA : c.physCartB}
                          width={2.5}
                          head={8}
                        />
                      ))}
                      <Line x1={x0} y1={tY - 7} x2={x0} y2={tY + 7} stroke={c.chartInk} />
                      <SubLabel
                        x={Math.max(x0, x0 + sum * k) + 8}
                        y={tY + 5}
                        text={`total ${sig(sum)} kg·m/s`}
                        anchor="start"
                        color={c.forceNet}
                        w={w}
                      />
                      {/* The track. */}
                      <Rect x={6} y={railY} width={w - 12} height={6} rx={2} fill={c.metal} />
                      <Rect x={6} y={railY} width={w - 12} height={6} rx={2} fill={url(ids.rail)} />
                      {row.carts.map((q) => (
                        <G key={q.n}>
                          {[0.22, 0.78].map((f) => (
                            <Circle
                              key={f}
                              cx={q.x - CW / 2 + CW * f}
                              cy={railY - 2}
                              r={5}
                              fill={c.rubber}
                            />
                          ))}
                          <Rect
                            x={q.x - CW / 2}
                            y={railY - CH - 6}
                            width={CW}
                            height={CH}
                            rx={4}
                            fill={q.color}
                            stroke={c.chartInk}
                            strokeWidth={1}
                          />
                          <Rect
                            x={q.x - CW / 2}
                            y={railY - CH - 6}
                            width={CW}
                            height={CH}
                            rx={4}
                            fill={url(ids.light)}
                          />
                          <ChartText
                            x={q.x}
                            y={railY - CH / 2 - 2}
                            textAnchor="middle"
                            fontSize={chart.label}
                            fontWeight="700"
                            fill={c.onAccent}
                          >
                            {`${sig(q.m)} kg`}
                          </ChartText>
                          {row.joined ? null : (
                            <Vec
                              x1={q.x}
                              y1={arrowY}
                              x2={q.x + q.p * k}
                              y2={arrowY}
                              color={q.color}
                              head={9}
                            />
                          )}
                          {row.joined ? null : (
                            <SubLabel
                              x={q.x}
                              y={arrowY - 10}
                              text={`p_${q.n} ${sig(q.p)}`}
                              color={q.color}
                              w={w}
                            />
                          )}
                          {row.joined && q.n === 2 ? null : (
                            <SubLabel
                              x={row.joined ? q.x + CW / 2 : q.x}
                              y={railY + 24}
                              text={
                                row.joined
                                  ? `${row.title === 'After' ? 'v′' : 'v'} ${sig(q.v)} ${vUnit}`
                                  : `v_${q.n}${row.title === 'After' ? '′' : ''} ${sig(q.v)} ${vUnit}`
                              }
                              bold={false}
                              w={w}
                            />
                          )}
                        </G>
                      ))}
                      {row.joined ? (
                        <G>
                          <Rect
                            x={w * (row.title === 'After' ? 0.46 : 0.44) - 3}
                            y={railY - CH - 2}
                            width={6}
                            height={CH - 8}
                            fill={c.rubber}
                          />
                          <Vec
                            x1={w * (row.title === 'After' ? 0.46 : 0.44)}
                            y1={arrowY}
                            x2={
                              w * (row.title === 'After' ? 0.46 : 0.44) +
                              (row.carts[0]!.p + row.carts[1]!.p) * k
                            }
                            y2={arrowY}
                            color={c.forceNet}
                            head={9}
                          />
                        </G>
                      ) : null}
                    </G>
                  );
                })}
              </Svg>
              {!spec.fixed &&
              typeof spec.before[0] === 'string' &&
              rep.known(spec.before[0]) &&
              spec.type !== 'explode' ? (
                <DragHandle
                  testID="drag-velocity"
                  x={beforeTip.x}
                  y={beforeTip.y}
                  label={rep.variable(spec.before[0]).name}
                  onStart={() => {
                    drag.current = rep.val(spec.before[0] as string);
                    scale.freeze();
                  }}
                  onEnd={scale.release}
                  onMove={(dx) => {
                    const id = spec.before[0] as string;
                    const pinned = [...spec.masses, spec.before[1]].filter(
                      (x): x is string => typeof x === 'string',
                    );
                    calc.set(
                      {
                        ...rep.pin(pinned),
                        [id]: rep.snapTo(id, drag.current + dx / (k * Math.max(1e-9, m1))),
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

  function captionLines(): string[] {
    const s = (x: number) => par(sig(x));
    const pb = pB[0] + pB[1];
    const pa = pA[0] + pA[1];
    const keB =
      0.5 * m1 * v1 * v1 + (spec.type === 'explode' ? 0.5 * m2 * v1 * v1 : 0.5 * m2 * v2 * v2);
    const keA = 0.5 * m1 * u1 * u1 + 0.5 * m2 * u2 * u2;
    const out = [
      spec.type === 'explode'
        ? `Before: (m₁ + m₂)v = (${sig(m1)} + ${sig(m2)}) × ${s(v1)} = ${sig(pb)} kg·m/s`
        : `Before: m₁v₁ + m₂v₂ = ${sig(m1)} × ${s(v1)} + ${sig(m2)} × ${s(v2)} = ${sig(pb)} kg·m/s`,
      spec.type === 'stick'
        ? `After: (m₁ + m₂)v′ = ${sig(pb)}, so v′ = ${sig(pb)}/${sig(m1 + m2)} = ${sig(u1)} ${vUnit}`
        : `After: m₁v₁′ + m₂v₂′ = ${sig(m1)} × ${s(u1)} + ${sig(m2)} × ${s(u2)} = ${sig(pa)} kg·m/s`,
      `Kinetic energy: ${sig(keB)} J before, ${sig(keA)} J after${
        spec.type === 'stick'
          ? `: ${sig(keB - keA)} J turned to heat and sound.`
          : spec.type === 'elastic'
            ? ': kept, the collision is elastic.'
            : `: the spring gave ${sig(keA - keB)} J.`
      }`,
    ];
    return out;
  }
}

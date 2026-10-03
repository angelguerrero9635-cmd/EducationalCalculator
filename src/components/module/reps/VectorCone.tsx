import { useRef } from 'react';
import { View } from 'react-native';
import Svg, { Circle, Ellipse, G, Line, Path } from 'react-native-svg';

import type { VectorDiagramSpec } from '@/data/modules/typesHsd';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, Caption, DragHandle } from './common';
import { coneOf } from './he4bMath';
import { along, around, labelPlacer, unit2, useValues } from './he4bKit';
import { short } from './hsdKit';
import { MathChip } from './hsdText';
import { SubLabel, Vec } from './hskKit';

const TILT = 16 * (Math.PI / 180);
/** Where round its cone L is drawn (any place is as likely: only L_z is known). */
const AZ = 32 * (Math.PI / 180);

/** "ħ", "2ħ", "−ħ", "0" */
const hbar = (m: number) => (m === 0 ? '0' : m === 1 ? 'ħ' : m === -1 ? '−ħ' : `${short(m)}ħ`);

/**
 * HC108: the vector model of L. Every allowed cone about z faint (2ℓ + 1 of them, rims at
 * heights mħ on a sphere of radius |L| = √(ℓ(ℓ + 1))ħ), the page's cone lit with L on it, its
 * z-part along the axis and θ from z marked. Drag L's tip up or down for m.
 */
export function VectorCone({ spec, calc }: { spec: VectorDiagramSpec; calc: Calculator }) {
  const c = usePalette();
  const { rep, v, known } = useValues(calc);
  const k0 = spec.cone!;
  const l = Math.max(0, Math.round(v(k0.l)));
  const m = Math.max(-l, Math.min(l, Math.round(v(k0.m))));
  const ok = known(k0.l) && known(k0.m);
  const q = coneOf(l, m);
  const name = spec.vectors[0]?.name || 'L';
  const drag = useRef(0);

  const lines: string[] = [];
  if (!ok) lines.push(`|${name}| = √(ℓ(ℓ + 1))ħ and its z-part is mħ: ? until ℓ and m are known.`);
  else if (l === 0) lines.push(`ℓ = 0: |${name}| = 0, one state, no cone.`);
  else {
    lines.push(
      `|${name}| = √(${l} × ${l + 1})ħ = ${short(q.size)}ħ, and its z-part is mħ = ${hbar(m)}.`,
      `cos θ = ${short(m)} ÷ ${short(q.size)}, so θ = ${short(q.theta)}° from the z-axis.`,
      `2ℓ + 1 = ${q.states} cones; ${name} is never straight along z, and its x- and y-parts stay unknown round the cone.`,
    );
  }

  return (
    <View>
      <Canvas aspect={(w) => Math.min(1.05, 380 / w)}>
        {({ w, h }) => {
          const R = Math.max(q.size, 1);
          const k = Math.min((w / 2 - 50) / R, (h / 2 - 24) / (R + 0.9));
          const o = { x: w / 2 + 10, y: h / 2 + 4 };
          /** A point (x, y, z) in ħ, seen from a little above. */
          const S = (x: number, y: number, z: number) => ({
            x: o.x + k * y,
            y: o.y - k * (z * Math.cos(TILT) - x * Math.sin(TILT)),
          });
          const tipAt = (mm: number) => {
            const r = Math.sqrt(Math.max(0, q.size * q.size - mm * mm));
            return S(r * Math.cos(AZ + Math.PI / 2), r * Math.sin(AZ + Math.PI / 2), mm);
          };
          const T = tipAt(m);
          const Z = S(0, 0, m);
          const top = S(0, 0, R + 0.9);
          const bottom = S(0, 0, -R - 0.5);
          const L = labelPlacer(w, h, [...along(o, T), ...along(bottom, top)]);
          const zSpotAxis = L.put('z', [{ x: top.x + 10, y: top.y + 8, anchor: 'start' }]);
          const ms = Array.from({ length: 2 * l + 1 }, (_, i) => i - l);
          const spread = k * Math.cos(TILT);
          const every = spread < 15 ? Math.ceil(15 / spread) : 1;
          const rim = (mm: number, lit: boolean) => {
            const r = Math.sqrt(Math.max(0, q.size * q.size - mm * mm));
            const ctr = S(0, 0, mm);
            const rx = k * r;
            const ry = k * r * Math.sin(TILT);
            return (
              <G key={`c${mm}`} opacity={lit ? 1 : 0.35}>
                <Line
                  x1={o.x}
                  y1={o.y}
                  x2={ctr.x - rx}
                  y2={ctr.y}
                  stroke={lit ? c.chartHighlight : c.chartMuted}
                  strokeWidth={lit ? 1.5 : 1}
                />
                <Line
                  x1={o.x}
                  y1={o.y}
                  x2={ctr.x + rx}
                  y2={ctr.y}
                  stroke={lit ? c.chartHighlight : c.chartMuted}
                  strokeWidth={lit ? 1.5 : 1}
                />
                <Ellipse
                  cx={ctr.x}
                  cy={ctr.y}
                  rx={Math.max(0.5, rx)}
                  ry={Math.max(0.5, ry)}
                  stroke={lit ? c.chartHighlight : c.chartMuted}
                  strokeWidth={lit ? 2 : 1}
                  strokeDasharray={lit ? undefined : chart.dashFine}
                  fill={lit ? c.chartHighlight : 'none'}
                  fillOpacity={lit ? 0.12 : 0}
                />
              </G>
            );
          };
          // Heights on the z-axis: every m (or every few when they crowd), the lit one always.
          const ticks = ms.filter((mm) => mm === m || (mm - -l) % every === 0);
          const tickLabels = ticks.map((mm) => {
            const p = S(0, 0, mm);
            const t = hbar(mm);
            const s = L.put(t, [
              { x: o.x - k * R - 14, y: p.y + 4, anchor: 'end' },
              { x: p.x - 10, y: p.y + 4, anchor: 'end' },
            ]);
            return (
              <MathChip
                key={`t${mm}`}
                x={s.x}
                y={s.y}
                text={t}
                w={w}
                h={h}
                anchor={s.anchor}
                bold={mm === m}
                color={mm === m ? c.chartHighlight : c.chartMuted}
              />
            );
          });
          const lText = `|${name}| = ${short(q.size)}ħ`;
          const lSpot = L.put(lText, around(T.x, T.y, 10));
          const zText = `${name}_z = ${hbar(m)}`;
          const zSpot = L.put(zText.replace('_', ''), [
            { x: Z.x + 10, y: Z.y - 8, anchor: 'start' },
            { x: Z.x + 10, y: Z.y + 18, anchor: 'start' },
            { x: Z.x - 10, y: Z.y - 8, anchor: 'end' },
            { x: Z.x - 10, y: Z.y + 18, anchor: 'end' },
          ]);
          const arcR = Math.min(34, k * q.size * 0.45);
          const thText = `θ = ${short(q.theta)}°`;
          // θ from +z to L, drawn in the screen plane through z and L.
          const len = Math.hypot(T.x - o.x, T.y - o.y) || 1;
          const dirL = { x: (T.x - o.x) / len, y: (T.y - o.y) / len };
          const half = unit2(dirL.x, dirL.y - 1);
          const thSpot = L.put(
            thText,
            around(o.x + half.x * (arcR + 12), o.y + half.y * (arcR + 12), 4),
          );
          const a0 = { x: o.x, y: o.y - arcR };
          const a1 = { x: o.x + dirL.x * arcR, y: o.y + dirL.y * arcR };
          const sweep = dirL.x >= 0 ? 1 : 0;
          return (
            <>
              <Svg width={w} height={h}>
                {/* The sphere |L| reaches, and the z-axis. */}
                {l > 0 ? (
                  <Circle
                    cx={o.x}
                    cy={o.y}
                    r={k * q.size}
                    stroke={c.chartMuted}
                    strokeWidth={1}
                    strokeDasharray={chart.dash}
                    fill="none"
                    opacity={0.6}
                  />
                ) : null}
                <Vec
                  x1={bottom.x}
                  y1={bottom.y}
                  x2={top.x}
                  y2={top.y}
                  color={c.chartInk}
                  width={1.5}
                  head={9}
                />
                <MathChip x={zSpotAxis.x} y={zSpotAxis.y} text="z" w={w} h={h} anchor="start" />
                {ok && l > 0 ? (
                  <G>
                    {ms.filter((mm) => mm !== m).map((mm) => rim(mm, false))}
                    {rim(m, true)}
                    {ticks.map((mm) => {
                      const p = S(0, 0, mm);
                      return (
                        <Line
                          key={`k${mm}`}
                          x1={p.x - 5}
                          y1={p.y}
                          x2={p.x + 5}
                          y2={p.y}
                          stroke={mm === m ? c.chartHighlight : c.chartMuted}
                          strokeWidth={1.5}
                        />
                      );
                    })}
                    {/* L's z-part along the axis, and the level from L's tip to it. */}
                    <Line
                      x1={T.x}
                      y1={T.y}
                      x2={Z.x}
                      y2={Z.y}
                      stroke={c.chartInk}
                      strokeWidth={1}
                      strokeDasharray={chart.dashFine}
                    />
                    {m !== 0 ? (
                      <Vec
                        x1={o.x}
                        y1={o.y}
                        x2={Z.x}
                        y2={Z.y}
                        color={c.vectorResultant}
                        width={4}
                        head={11}
                      />
                    ) : null}
                    {arcR > 8 && q.theta > 1 ? (
                      <Path
                        d={`M ${a0.x} ${a0.y} A ${arcR} ${arcR} 0 0 ${sweep} ${a1.x} ${a1.y}`}
                        stroke={c.chartInk}
                        strokeWidth={1.5}
                        fill="none"
                      />
                    ) : null}
                    <Vec
                      x1={o.x}
                      y1={o.y}
                      x2={T.x}
                      y2={T.y}
                      color={c.chartHighlight}
                      width={3.5}
                      head={12}
                    />
                    {tickLabels}
                    <MathChip
                      x={lSpot.x}
                      y={lSpot.y}
                      text={lText}
                      w={w}
                      h={h}
                      anchor={lSpot.anchor}
                      color={c.chartHighlight}
                    />
                    {m !== 0 ? (
                      <SubLabel
                        x={zSpot.x}
                        y={zSpot.y}
                        text={zText}
                        anchor={zSpot.anchor}
                        color={c.vectorResultant}
                        w={w}
                      />
                    ) : null}
                    <MathChip
                      x={thSpot.x}
                      y={thSpot.y}
                      text={thText}
                      w={w}
                      h={h}
                      anchor={thSpot.anchor}
                    />
                  </G>
                ) : null}
                <Circle cx={o.x} cy={o.y} r={3.5} fill={c.chartInk} />
              </Svg>
              {ok && l > 0 && !spec.fixed && typeof k0.m === 'string' ? (
                <DragHandle
                  testID="drag-cone-m"
                  x={T.x}
                  y={T.y}
                  label="the tip of L (m)"
                  onStart={() => {
                    drag.current = m;
                  }}
                  onMove={(_dx, dy) => {
                    const id = k0.m as string;
                    const next = Math.max(-l, Math.min(l, Math.round(drag.current - dy / spread)));
                    calc.set(
                      {
                        ...rep.pin(typeof k0.l === 'string' ? [k0.l] : []),
                        [id]: next * rep.factor(id),
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
}

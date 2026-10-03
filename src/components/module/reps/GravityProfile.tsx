/**
 * HC131 `gravityProfile` (typesHe4g.ts), a new kind for geophysics.
 *
 * - `sphere`: a buried sphere of radius R and density contrast Δρ, its centre z down, drawn to
 *   scale in section under the profile of its anomaly, Δg(x) = Δg_max(1 + x² ÷ z²)^(−3/2): the
 *   peak over the centre and the half-width x½ = 0.766z bracketed at half the peak. Drag the
 *   sphere for its depth.
 * - `airy`: crust floating on the mantle. Normal crust T thick either side of a mountain of
 *   height h whose root r = hρ_c ÷ (ρ_m − ρ_c) reaches the compensation depth; two columns down
 *   to it, dashed, weigh the same. Heights to scale; widths not.
 */
import { useRef } from 'react';
import { View } from 'react-native';
import Svg, { Circle, Defs, G, Line, Path, Rect } from 'react-native-svg';

import type {
  GravityAirySpec,
  GravityProfileSpec,
  GravitySphereSpec,
} from '@/data/modules/typesHe4g';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, Caption, ChartText, DragHandle } from './common';
import { Arrow } from './he1fKit';
import { fmt, Tag } from './he2fKit';
import { useHe4g } from './he4gKit';
import {
  airyRootOf,
  G_NEWTON,
  HALF_WIDTH,
  sphereAnomalyAt,
  sphereMassOf,
  spherePeakOf,
  tickStep,
} from './he4gMath';
import { Ball, Deepen, url, usePaintIds } from './paint';

const BW = 360;

export function GravityProfile({ spec, calc }: { spec: GravityProfileSpec; calc: Calculator }) {
  return spec.mode === 'airy' ? (
    <AiryColumns spec={spec} calc={calc} />
  ) : (
    <SphereProfile spec={spec} calc={calc} />
  );
}

// ── A buried sphere ──

const SH = 330;
const PL = 54;
const PR = 344;
/** The profile's plot, then the ground's surface and the section under it. */
const P_TOP = 30;
const P_BOT = 150;
const SURF = 184;
const S_BOT = 318;

function SphereProfile({ spec, calc }: { spec: GravitySphereSpec; calc: Calculator }) {
  const c = usePalette();
  const ids = usePaintIds('body', 'rock');
  const { rep, num, label, setOne, say } = useHe4g(calc);
  const start = useRef(0);
  const rr = num(spec.radius);
  const drho = num(spec.contrast);
  const z = num(spec.depth);
  const gc = spec.G === undefined ? G_NEWTON : num(spec.G);
  const ok =
    rr !== undefined &&
    drho !== undefined &&
    z !== undefined &&
    gc !== undefined &&
    rr > 0 &&
    z > 0;
  const buried = ok && z > rr;
  const mass = ok ? sphereMassOf(rr, drho) : 0;
  const peak = ok ? spherePeakOf(mass, z, gc) : 0;
  const xh = ok ? HALF_WIDTH * z : 0;
  // One scale across and down: the profile spans ±3z (and the sphere fits under the surface).
  const half = ok ? Math.max(3 * z, 1.6 * (z + rr)) : 600;
  const m = (PR - PL) / (2 * half);
  const X = (x: number) => (PL + PR) / 2 + x * m;
  const D = (d: number) => SURF + d * m;
  const deep = ok ? D(z + rr) > S_BOT - 4 : false;
  const scaleDown = deep ? (S_BOT - 4 - SURF) / ((z! + rr!) * m) : 1;
  const Dz = (d: number) => SURF + d * m * scaleDown;
  // The anomaly's axis: zero to the peak (a low dips below zero).
  const gMax = ok ? Math.abs(peak) * 1.2 || 1 : 1;
  const gStep = tickStep(gMax, 3);
  const gTop = Math.ceil(gMax / gStep) * gStep;
  const neg = peak < 0;
  const Yg = (g: number) =>
    neg ? P_TOP + (-g / gTop) * (P_BOT - P_TOP) : P_BOT - (g / gTop) * (P_BOT - P_TOP);
  const curve = Array.from({ length: 121 }, (_, i) => {
    const x = -half + (2 * half * i) / 120;
    return `${i ? 'L' : 'M'} ${X(x).toFixed(1)} ${Yg(sphereAnomalyAt(peak, x, z ?? 1)).toFixed(1)}`;
  }).join(' ');
  const gTicks = Array.from({ length: Math.round(gTop / gStep) + 1 }, (_, i) =>
    Number(((neg ? -1 : 1) * i * gStep).toPrecision(6)),
  );
  const zVar = typeof spec.depth === 'string' ? spec.depth : undefined;
  const canDrag = !spec.fixed && buried && !deep && zVar !== undefined && rep.typed(zVar);
  const keep = [spec.radius, spec.contrast, spec.G];
  const peakText = label(spec.peak, 'Δg_max', peak, 'mGal');
  const halfText = label(spec.halfWidth, 'x½', xh, 'm');
  const zText = label(spec.depth, 'z', z, 'm');
  const rText = label(spec.radius, 'R', rr, 'm');
  const dText = label(spec.contrast, 'Δρ', drho, 'kg/m³');

  const lines: string[] = [];
  if (!ok) lines.push('Type the radius, the density contrast and the depth to draw the anomaly.');
  else if (!buried)
    lines.push('The sphere must be buried: its centre deeper than its radius (z > R).');
  else
    lines.push(
      `Excess mass = (4 ÷ 3)πR³Δρ = (4 ÷ 3) × π × ${say(spec.radius, rr)}³ × ${say(spec.contrast, drho)} = ${say(spec.mass, mass)} kg.`,
      `Δgₘₐₓ = G × mass ÷ z² = ${fmt(gc!)} × ${fmt(mass)} ÷ ${say(spec.depth, z)}² × 10⁵ = ${say(spec.peak, peak)} mGal.`,
      `It falls to half at x½ = 0.766z = ${say(spec.halfWidth, xh)} m either side: a deeper body gives a lower, wider anomaly.`,
    );
  if (deep) lines.push('The section is squeezed down to fit; the profile is to scale.');

  return (
    <View>
      <Canvas aspect={SH / BW}>
        {({ w, h }) => {
          const k = w / BW;
          return (
            <>
              <Svg width={w} height={h}>
                <Defs>
                  <Ball id={ids.body} color={neg ? c.he4gLight : c.he4gDense} />
                  <Deepen id={ids.rock} from={c.he4gRock} to={c.he4gRockDark} />
                </Defs>
                <G transform={`scale(${k})`}>
                  {/* The profile. */}
                  {gTicks.map((g) => (
                    <G key={`g${g}`}>
                      <Line x1={PL} y1={Yg(g)} x2={PR} y2={Yg(g)} stroke={c.chartGrid} />
                      <ChartText
                        x={PL - 5}
                        y={Yg(g) + 4}
                        fontSize={chart.label}
                        textAnchor="end"
                        fill={c.chartMuted}
                      >
                        {fmt(g)}
                      </ChartText>
                    </G>
                  ))}
                  <Line
                    x1={PL}
                    y1={P_TOP}
                    x2={PL}
                    y2={P_BOT}
                    stroke={c.chartInk}
                    strokeWidth={1.5}
                  />
                  <ChartText
                    x={12}
                    y={(P_TOP + P_BOT) / 2}
                    fontSize={chart.label}
                    textAnchor="middle"
                    fill={c.chartMuted}
                    transform={`rotate(-90 12 ${(P_TOP + P_BOT) / 2})`}
                  >
                    Δg, mGal
                  </ChartText>
                  {buried ? (
                    <G>
                      <Path
                        d={curve}
                        stroke={c.fnSecond}
                        strokeWidth={chart.strokeHeavy}
                        fill="none"
                      />
                      {/* x½ at half the peak. */}
                      <Line
                        x1={X(-xh)}
                        y1={Yg(peak / 2)}
                        x2={X(xh)}
                        y2={Yg(peak / 2)}
                        stroke={c.lineSum}
                        strokeWidth={1.5}
                      />
                      {[-xh, xh].map((x) => (
                        <Line
                          key={x}
                          x1={X(x)}
                          y1={Yg(peak / 2) - 5}
                          x2={X(x)}
                          y2={Yg(peak / 2) + 5}
                          stroke={c.lineSum}
                          strokeWidth={1.5}
                        />
                      ))}
                      {halfText ? (
                        <Tag
                          x={X(xh) + 6}
                          y={Yg(peak / 2) + 4}
                          text={halfText}
                          anchor="start"
                          color={c.lineSum}
                          w={BW}
                        />
                      ) : null}
                      <Circle cx={X(0)} cy={Yg(peak)} r={4.5} fill={c.fnSecond} />
                      {peakText ? (
                        <Tag
                          x={X(0) + 8}
                          y={neg ? Yg(peak) + 16 : Yg(peak) - 2}
                          text={peakText}
                          anchor="start"
                          color={c.fnSecond}
                          w={BW}
                        />
                      ) : null}
                    </G>
                  ) : null}
                  {/* The section: rock under the surface, the sphere at depth z. */}
                  <Rect x={0} y={SURF} width={BW} height={SH - SURF} fill={url(ids.rock)} />
                  <Line x1={0} y1={SURF} x2={BW} y2={SURF} stroke={c.landGrass} strokeWidth={4} />
                  {/* Stations along the surface, under the profile's x. */}
                  {Array.from({ length: 13 }, (_, i) => -half + (i * half) / 6).map((x) => (
                    <Path
                      key={x}
                      d={`M ${X(x) - 4} ${SURF - 2} L ${X(x)} ${SURF - 9} L ${X(x) + 4} ${SURF - 2} Z`}
                      fill={c.chartInk}
                    />
                  ))}
                  <Line
                    x1={X(0)}
                    y1={P_BOT}
                    x2={X(0)}
                    y2={SURF - 10}
                    stroke={c.chartMuted}
                    strokeDasharray={chart.dashFine}
                  />
                  {ok ? (
                    <G opacity={buried ? 1 : 0.4}>
                      <Circle
                        cx={X(0)}
                        cy={Dz(z)}
                        r={Math.max(2, rr * m * scaleDown)}
                        fill={url(ids.body)}
                        stroke={c.chartInk}
                        strokeWidth={1}
                      />
                      <Line
                        x1={X(0)}
                        y1={Dz(z)}
                        x2={X(0) + rr * m * scaleDown}
                        y2={Dz(z)}
                        stroke={c.chartInk}
                        strokeWidth={1.5}
                      />
                      <Circle cx={X(0)} cy={Dz(z)} r={2.5} fill={c.chartInk} />
                      {/* z from the surface to the centre, at the left of the sphere. */}
                      <Arrow
                        x1={X(0) - rr * m * scaleDown - 14}
                        y1={(SURF + Dz(z)) / 2}
                        x2={X(0) - rr * m * scaleDown - 14}
                        y2={Dz(z)}
                        color={c.chartInk}
                        width={1.2}
                      />
                      <Arrow
                        x1={X(0) - rr * m * scaleDown - 14}
                        y1={(SURF + Dz(z)) / 2}
                        x2={X(0) - rr * m * scaleDown - 14}
                        y2={SURF}
                        color={c.chartInk}
                        width={1.2}
                      />
                      {zText ? (
                        <Tag
                          x={X(0) - rr * m * scaleDown - 20}
                          y={(SURF + Dz(z)) / 2 + 4}
                          text={zText}
                          anchor="end"
                          w={BW}
                        />
                      ) : null}
                      {rText ? (
                        <Tag
                          x={X(0) + rr * m * scaleDown + 8}
                          y={Dz(z) + 4}
                          text={rText}
                          anchor="start"
                          w={BW}
                        />
                      ) : null}
                      {dText ? (
                        <Tag
                          x={X(0) + rr * m * scaleDown + 8}
                          y={Dz(z) + 22}
                          text={dText}
                          anchor="start"
                          w={BW}
                        />
                      ) : null}
                    </G>
                  ) : null}
                  {/* A scale bar on the section. */}
                  {(() => {
                    const bar = tickStep(half / 2, 1);
                    const x0 = PR - bar * m;
                    const y = SH - 8;
                    const t = `${fmt(bar)} m`;
                    return (
                      <G>
                        <Path
                          d={`M ${x0} ${y - 5} V ${y} H ${PR} V ${y - 5}`}
                          stroke={c.he4gOnGround}
                          strokeWidth={2}
                          fill="none"
                        />
                        <ChartText
                          x={x0 - 6}
                          y={y}
                          fontSize={chart.label}
                          textAnchor="end"
                          fill={c.he4gOnGround}
                          fontWeight="700"
                        >
                          {t}
                        </ChartText>
                      </G>
                    );
                  })()}
                </G>
              </Svg>
              {canDrag ? (
                <DragHandle
                  x={X(0) * k}
                  y={Dz(z!) * k}
                  label="the sphere’s depth"
                  onStart={() => {
                    start.current = z!;
                  }}
                  onMove={(_, dy) => {
                    setOne(zVar!, Math.max(rr! * 1.05, start.current + dy / k / m), keep);
                  }}
                />
              ) : null}
            </>
          );
        }}
      </Canvas>
      <Caption>{lines.join(' ')}</Caption>
    </View>
  );
}

// ── Airy isostasy ──

const AH = 330;
const A_TOP = 22;
const A_BOT = 300;

function AiryColumns({ spec, calc }: { spec: GravityAirySpec; calc: Calculator }) {
  const c = usePalette();
  const ids = usePaintIds('crust', 'mantle', 'peak');
  const { num, label, say } = useHe4g(calc);
  const hh = num(spec.height);
  const rc = num(spec.crust);
  const rm = num(spec.mantle);
  const t = num(spec.thickness);
  const ok =
    hh !== undefined && rc !== undefined && rm !== undefined && t !== undefined && rm > rc && t > 0;
  const r = ok ? airyRootOf(hh, rc, rm) : 0;
  const total = ok ? t + hh + r : 0;
  // Heights to scale: the mountain's top to a little under the compensation depth.
  const span = ok ? (hh + t + r) * 1.12 : 60;
  const v = (A_BOT - A_TOP) / span;
  const sea = A_TOP + (ok ? hh : 3) * v;
  const Y = (d: number) => sea + d * v;
  const comp = ok ? Y(t + r) : A_BOT;
  // Widths not to scale: the mountain in the middle.
  const M0 = 128;
  const M1 = 232;
  const colA = 50;
  const colB = 172;
  const hText = label(spec.height, 'h', hh, 'km');
  const tText = label(spec.thickness, 'T', t, 'km');
  const rText = label(spec.root, 'r', r, 'km');
  const totText = label(spec.total, 'crust', total, 'km');
  const lines: string[] = [];
  if (!ok)
    lines.push(
      rc !== undefined && rm !== undefined && rm <= rc
        ? 'The mantle must be denser than the crust, or the crust would sink.'
        : 'Type the height, the two densities and the normal crust to float the mountain.',
    );
  else
    lines.push(
      `Root r = h × crust density ÷ (mantle − crust density) = ${say(spec.height, hh)} × ${say(spec.crust, rc)} ÷ (${say(spec.mantle, rm)} − ${say(spec.crust, rc)}) = ${say(spec.root, r)} km.`,
      `Crust under the peak = T + h + r = ${say(spec.thickness, t)} + ${say(spec.height, hh)} + ${fmt(r)} = ${say(spec.total, total)} km.`,
      `Down to the compensation depth both columns weigh the same: ${fmt(rc)} × ${fmt(hh + t + r)} = ${fmt(rc)} × ${fmt(t)} + ${fmt(rm)} × ${fmt(r)}.`,
    );
  // The crust's outline: normal crust either side, the mountain above and its root below.
  const crust = ok
    ? `M 0 ${Y(0)} H ${M0 - 18} L ${M0 + 14} ${Y(-hh)} H ${M1 - 14} L ${M1 + 18} ${Y(0)} H ${BW} V ${Y(t)} H ${M1 + 18} L ${M1 - 6} ${Y(t + r)} H ${M0 + 6} L ${M0 - 18} ${Y(t)} H 0 Z`
    : '';
  return (
    <View>
      <Canvas aspect={AH / BW}>
        {({ w, h }) => (
          <Svg width={w} height={h}>
            <Defs>
              <Deepen id={ids.crust} from={c.earthCrust} to={c.he4gCrustDeep} />
              <Deepen id={ids.mantle} from={c.earthMantle} to={c.he4gMantleDeep} />
            </Defs>
            <G transform={`scale(${w / BW})`}>
              <Rect x={0} y={0} width={BW} height={AH} fill={c.airBand} />
              <Rect x={0} y={sea} width={BW} height={AH - sea} fill={url(ids.mantle)} />
              {ok ? (
                <G>
                  <Path d={crust} fill={url(ids.crust)} stroke={c.chartInk} strokeWidth={1.2} />
                  {/* The compensation depth. */}
                  <Line
                    x1={0}
                    y1={comp}
                    x2={BW}
                    y2={comp}
                    stroke={c.chartInk}
                    strokeWidth={1.5}
                    strokeDasharray={chart.dash}
                  />
                  <Tag
                    x={BW - 6}
                    y={comp + 16}
                    text="compensation depth"
                    anchor="end"
                    chip
                    bold={false}
                    w={BW}
                  />
                  {/* Two columns down to it: the same weight. */}
                  {[
                    [colA, Y(0)],
                    [colB, Y(-hh)],
                  ].map(([x, y0]) => (
                    <Rect
                      key={x}
                      x={x}
                      y={y0}
                      width={26}
                      height={comp - y0!}
                      fill="none"
                      stroke={c.he4gOnGround}
                      strokeWidth={2}
                      strokeDasharray={chart.dashFine}
                    />
                  ))}
                  <Tag
                    x={colA + 13}
                    y={comp - 8}
                    text="A"
                    color={c.he4gOnGround}
                    chip={false}
                    w={BW}
                  />
                  <Tag
                    x={colB + 13}
                    y={comp - 8}
                    text="B"
                    color={c.he4gOnGround}
                    chip={false}
                    w={BW}
                  />
                  {/* Brackets: h above the normal surface, T, and the root r. */}
                  {(
                    [
                      [M1 + 34, Y(-hh), Y(0), hText],
                      [16, Y(0), Y(t), tText],
                      [M1 + 34, Y(t), Y(t + r), rText],
                    ] as const
                  ).map(([x, y0, y1, text]) =>
                    text ? (
                      <G key={`${x}${y0}`}>
                        <Path
                          d={`M ${x - 5} ${y0} H ${x} V ${y1} H ${x - 5}`}
                          stroke={c.chartInk}
                          strokeWidth={1.5}
                          fill="none"
                        />
                        <Tag x={x + 6} y={(y0 + y1) / 2 + 4} text={text} anchor="start" w={BW} />
                      </G>
                    ) : null,
                  )}
                  {totText ? <Tag x={(M0 + M1) / 2} y={Y(-hh) - 6} text={totText} w={BW} /> : null}
                  <Tag
                    x={8}
                    y={Y(0) - 8}
                    text={`crust, ${label(spec.crust, 'ρ_c', rc, 'g/cm³')}`}
                    anchor="start"
                    w={BW}
                  />
                  <Tag
                    x={8}
                    y={AH - 10}
                    text={`mantle, ${label(spec.mantle, 'ρ_m', rm, 'g/cm³')}`}
                    anchor="start"
                    w={BW}
                  />
                </G>
              ) : null}
              <ChartText
                x={BW - 6}
                y={AH - 10}
                fontSize={chart.label}
                textAnchor="end"
                fill={c.he4gOnGround}
              >
                heights to scale, widths not
              </ChartText>
            </G>
          </Svg>
        )}
      </Canvas>
      <Caption>{lines.join(' ')}</Caption>
    </View>
  );
}

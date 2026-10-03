/**
 * A unidirectional composite lamina (HC86, `lamina`; ACC-P8). Left: its section end-on, fibers
 * on a hexagonal array in an epoxy matrix, painted, the fiber share of the drawn block exactly
 * V_f. Right: the slab model, fiber and matrix as springs held by a wall and pulled by F: along
 * the fibers the two sit side by side (the same strain), across them they sit in series (the
 * same stress). Under them, bars for E_f, E_m, E₁ and E₂ to one scale (and the densities to
 * their own). A "?" draws nothing for its value.
 */
import Svg, { Circle, ClipPath, Defs, G, Line, Path, Rect } from 'react-native-svg';

import type { LaminaSpec } from '@/data/modules/typesHe3k';
import { formatNumber } from '@/engine/format';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, Caption, ChartText, useRep } from './common';
import { HEX_MAX, laminaFibers } from './he3kMath';
import { Ball, TopLight, url, usePaintIds } from './paint';

const LABEL = chart.label;
const TOP_H = 160;
const KEY_H = 26;
const ROW = 24;
const GAP = 10;

/** A zigzag spring from x1 to x2 at height y, `amp` high. */
function springPath(x1: number, x2: number, y: number, amp: number, coils = 6) {
  const lead = Math.min(10, (x2 - x1) * 0.15);
  const a = x1 + lead;
  const b = x2 - lead;
  const pts = [`M ${x1} ${y}`, `L ${a} ${y}`];
  const n = coils * 2;
  for (let k = 1; k < n; k++) pts.push(`L ${a + ((b - a) * k) / n} ${y + (k % 2 ? -amp : amp)}`);
  pts.push(`L ${b} ${y}`, `L ${x2} ${y}`);
  return pts.join(' ');
}

/** The value of a field, or undefined for a "?" or a missing field. */
function reader(rep: ReturnType<typeof useRep>) {
  return (x: string | number | undefined) =>
    x === undefined ? undefined : typeof x === 'number' ? x : rep.known(x) ? rep.val(x) : undefined;
}

export function Lamina({ spec, calc }: { spec: LaminaSpec; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  const ids = usePaintIds('fiber', 'matrix', 'clip', 'light');
  const num = reader(rep);
  const across = spec.load === 'across';
  const Vf = num(spec.Vf);
  const tooDense = Vf !== undefined && (Vf > HEX_MAX || Vf < 0);
  const fiberColor =
    spec.fiber === 'glass'
      ? c.laminaGlass
      : spec.fiber === 'aramid'
        ? c.laminaAramid
        : c.laminaCarbon;

  // Bars: the moduli to one scale, the densities to their own.
  type Bar = { id: string | number; fill: string; group: 0 | 1 };
  const bars: Bar[] = [
    ...(spec.Ef !== undefined ? [{ id: spec.Ef, fill: fiberColor, group: 0 as const }] : []),
    ...(spec.Em !== undefined ? [{ id: spec.Em, fill: c.laminaMatrix, group: 0 as const }] : []),
    ...(spec.E1 !== undefined
      ? [{ id: spec.E1, fill: across ? c.chartMuted : c.chartHighlight, group: 0 as const }]
      : []),
    ...(spec.E2 !== undefined
      ? [{ id: spec.E2, fill: across ? c.chartHighlight : c.chartMuted, group: 0 as const }]
      : []),
    ...(spec.rho
      ? [
          { id: spec.rho.f, fill: fiberColor, group: 1 as const },
          { id: spec.rho.m, fill: c.laminaMatrix, group: 1 as const },
          ...(spec.rho.c !== undefined
            ? [{ id: spec.rho.c, fill: c.chartHighlight, group: 1 as const }]
            : []),
        ]
      : []),
  ];
  const groups = new Set(bars.map((b) => b.group)).size;
  const barsH = bars.length * ROW + (groups > 1 ? GAP : 0) + 8;
  const symOf = (x: string | number) => (typeof x === 'string' ? rep.variable(x).symbol : '');
  // Four figures at most (8.555 GPa, 139.4 GPa), as the plan's worked values read.
  const fig4 = (x: number) => formatNumber(Number(x.toPrecision(4)));
  const valueOf = (x: string | number) =>
    typeof x === 'number'
      ? fig4(x)
      : rep.known(x)
        ? `${fig4(rep.shown(x))}${rep.unit(x) ? ` ${rep.unit(x)}` : ''}`
        : '?';
  const groupMax = (g: 0 | 1) =>
    Math.max(1e-12, ...bars.filter((b) => b.group === g).map((b) => num(b.id) ?? 0));

  return (
    <>
      <Canvas aspect={(w) => (TOP_H + KEY_H + barsH) / w}>
        {({ w, h }) => {
          // ── The section, end-on ──
          const S = Math.min(150, Math.round(w * 0.4));
          const sx0 = 8;
          const sy0 = 30;
          const geo = laminaFibers(tooDense ? HEX_MAX : (Vf ?? 0), S);
          // ── The slab model ──
          const mx0 = S + 30;
          const wallW = 9;
          const arrowW = 34;
          const bx0 = mx0 + wallW;
          const bw = Math.max(60, w - 8 - arrowW - bx0);
          const by0 = sy0;
          const bh = geo.height;
          const share = Vf === undefined || tooDense ? undefined : Vf;
          const fiberThick = share === undefined ? 0 : (across ? bw : bh) * share;
          const fiberRect = across
            ? { x: bx0, y: by0, width: fiberThick, height: bh }
            : { x: bx0, y: by0, width: bw, height: fiberThick };
          const matrixRect = across
            ? { x: bx0 + fiberThick, y: by0, width: bw - fiberThick, height: bh }
            : { x: bx0, y: by0 + fiberThick, width: bw, height: bh - fiberThick };
          const plateX = bx0 + bw;
          // Springs: side by side along, end to end across.
          const springs =
            share === undefined
              ? []
              : across
                ? [
                    springPath(bx0, bx0 + fiberThick, by0 + bh / 2, 7, 3),
                    springPath(bx0 + fiberThick, plateX, by0 + bh / 2, 7, 3),
                  ]
                : [
                    springPath(bx0, plateX, by0 + fiberThick / 2, Math.min(7, fiberThick * 0.3)),
                    springPath(
                      bx0,
                      plateX,
                      by0 + fiberThick + (bh - fiberThick) / 2,
                      Math.min(7, (bh - fiberThick) * 0.3),
                    ),
                  ];
          const fiberLines = (() => {
            // The fibers' direction drawn in their layer: along the load, or across it.
            if (share === undefined || fiberThick < 4) return [];
            const out: [number, number, number, number][] = [];
            const n = Math.max(1, Math.floor(fiberThick / 7));
            for (let k = 1; k <= n; k++) {
              const t = (k - 0.5) / n;
              if (across)
                out.push([bx0 + t * fiberThick, by0 + 2, bx0 + t * fiberThick, by0 + bh - 2]);
              else out.push([bx0 + 2, by0 + t * fiberThick, plateX - 2, by0 + t * fiberThick]);
            }
            return out;
          })();
          const keyY = TOP_H + 16;
          const key = [
            { fill: fiberColor, text: 'Fiber' },
            { fill: c.laminaMatrix, text: 'Matrix (epoxy)' },
          ];
          const keyW = key.map((k) => 18 + k.text.length * LABEL * 0.58);
          const keyX0 = (w - keyW.reduce((a, b) => a + b + 16, -16)) / 2;
          // ── Bars ──
          const lblW = 40;
          const valW = 92;
          const barX = lblW + 4;
          const barMax = w - valW - barX - 6;
          const rowsTop = TOP_H + KEY_H;
          let y = rowsTop;
          const placed = bars.map((b, i) => {
            if (i > 0 && b.group !== bars[i - 1]!.group) y += GAP;
            const at = y;
            y += ROW;
            return { ...b, y: at };
          });
          return (
            <Svg width={w} height={h}>
              <Defs>
                <Ball id={ids.fiber} color={fiberColor} />
                <TopLight id={ids.light} />
                <ClipPath id={ids.clip}>
                  <Rect x={sx0} y={sy0} width={geo.width} height={geo.height} />
                </ClipPath>
              </Defs>
              {/* Titles. */}
              <ChartText x={sx0} y={16} fontSize={LABEL} fontWeight="700">
                Section, end-on
              </ChartText>
              <ChartText x={mx0} y={16} fontSize={LABEL} fontWeight="700">
                {across ? 'Loaded across' : 'Loaded along'}
              </ChartText>
              {/* The section: matrix, then the fibers clipped to the block. */}
              <Rect
                x={sx0}
                y={sy0}
                width={geo.width}
                height={geo.height}
                fill={c.laminaMatrix}
                opacity={tooDense ? 0.35 : 1}
              />
              <Rect x={sx0} y={sy0} width={geo.width} height={geo.height} fill={url(ids.light)} />
              {Vf !== undefined ? (
                <G clipPath={url(ids.clip)} opacity={tooDense ? 0.35 : 1}>
                  {geo.centers.map((p, i) => (
                    <Circle
                      key={i}
                      cx={sx0 + p.x}
                      cy={sy0 + p.y}
                      r={geo.r}
                      fill={url(ids.fiber)}
                      stroke={c.chartInk}
                      strokeOpacity={0.35}
                      strokeWidth={0.6}
                    />
                  ))}
                </G>
              ) : null}
              <Rect
                x={sx0}
                y={sy0}
                width={geo.width}
                height={geo.height}
                fill="none"
                stroke={c.chartInk}
                strokeWidth={1}
              />
              <ChartText
                x={sx0 + geo.width / 2}
                y={sy0 + geo.height + 17}
                fontSize={LABEL}
                textAnchor="middle"
              >
                {Vf === undefined
                  ? `${symOf(spec.Vf) || 'V_f'} = ?`
                  : tooDense
                    ? 'Fibers can’t pack this close'
                    : `${Math.round(Vf * 1000) / 10}% fiber by volume`}
              </ChartText>
              {/* The slab model: a wall, the two layers, their springs, the plate and F. */}
              <Rect
                x={mx0}
                y={by0 - 6}
                width={wallW}
                height={bh + 12}
                fill={c.chartMuted}
                opacity={0.35}
              />
              {Array.from({ length: Math.floor((bh + 12) / 8) }, (_, k) => (
                <Line
                  key={`h${k}`}
                  x1={mx0}
                  y1={by0 - 6 + k * 8 + 8}
                  x2={mx0 + wallW}
                  y2={by0 - 6 + k * 8}
                  stroke={c.chartInk}
                  strokeWidth={1}
                />
              ))}
              {share !== undefined ? (
                <>
                  <Rect {...fiberRect} fill={fiberColor} opacity={0.9} />
                  <Rect {...matrixRect} fill={c.laminaMatrix} />
                  <Rect x={bx0} y={by0} width={bw} height={bh} fill={url(ids.light)} />
                  {fiberLines.map(([x1, y1, x2, y2], k) => (
                    <Line
                      key={`f${k}`}
                      x1={x1}
                      y1={y1}
                      x2={x2}
                      y2={y2}
                      stroke={c.background}
                      strokeOpacity={0.35}
                      strokeWidth={1}
                    />
                  ))}
                  {/* Each spring on a pale halo, so it reads on dark carbon too. */}
                  {springs.map((d, k) => (
                    <G key={`s${k}`}>
                      <Path
                        d={d}
                        fill="none"
                        stroke={c.background}
                        strokeOpacity={0.8}
                        strokeWidth={4}
                        strokeLinejoin="round"
                      />
                      <Path
                        d={d}
                        fill="none"
                        stroke={c.chartInk}
                        strokeWidth={1.6}
                        strokeLinejoin="round"
                      />
                    </G>
                  ))}
                </>
              ) : null}
              <Rect
                x={bx0}
                y={by0}
                width={bw}
                height={bh}
                fill="none"
                stroke={c.chartInk}
                strokeWidth={1}
                strokeDasharray={share === undefined ? chart.dash : undefined}
              />
              <Rect x={plateX} y={by0 - 6} width={4} height={bh + 12} fill={c.chartInk} />
              <Line
                x1={plateX + 4}
                y1={by0 + bh / 2}
                x2={plateX + arrowW - 4}
                y2={by0 + bh / 2}
                stroke={c.chartHighlight}
                strokeWidth={2.5}
              />
              <Path
                d={`M ${plateX + arrowW} ${by0 + bh / 2} l -9 -5 l 0 10 z`}
                fill={c.chartHighlight}
              />
              <ChartText
                x={plateX + arrowW / 2 + 2}
                y={by0 + bh / 2 - 9}
                fontSize={chart.value}
                fontWeight="700"
                textAnchor="middle"
                fontStyle="italic"
              >
                F
              </ChartText>
              <ChartText x={bx0 + bw / 2} y={by0 + bh + 17} fontSize={LABEL} textAnchor="middle">
                {across ? 'In series: same stress σ' : 'Side by side: same strain ε'}
              </ChartText>
              {/* What the colours are. */}
              {key.map((k, i) => {
                const x = keyX0 + keyW.slice(0, i).reduce((a, b) => a + b + 16, 0);
                return (
                  <G key={k.text}>
                    <Rect
                      x={x}
                      y={keyY - 10}
                      width={12}
                      height={12}
                      rx={2}
                      fill={k.fill}
                      stroke={c.chartInk}
                      strokeOpacity={0.3}
                    />
                    <ChartText x={x + 17} y={keyY} fontSize={LABEL} fill={c.chartMuted}>
                      {k.text}
                    </ChartText>
                  </G>
                );
              })}
              {/* The bars: symbol, bar, value. */}
              {placed.map((b, i) => {
                const v = num(b.id);
                const len =
                  v === undefined
                    ? 0
                    : Math.max(1.5, (Math.max(0, v) / groupMax(b.group)) * barMax);
                return (
                  <G key={`b${i}`}>
                    <ChartText x={4} y={b.y + 16} fontSize={chart.value} fontWeight="700">
                      {symOf(b.id)}
                    </ChartText>
                    {v !== undefined ? (
                      <Rect
                        x={barX}
                        y={b.y + 5}
                        width={len}
                        height={ROW - 9}
                        rx={2}
                        fill={b.fill}
                        stroke={c.chartInk}
                        strokeOpacity={0.25}
                      />
                    ) : null}
                    <ChartText x={w - 4} y={b.y + 16} fontSize={chart.value} textAnchor="end">
                      {valueOf(b.id)}
                    </ChartText>
                  </G>
                );
              })}
            </Svg>
          );
        }}
      </Canvas>
      <Caption>{captionOf()}</Caption>
    </>
  );

  function captionOf() {
    const n = (x: string | number | undefined) =>
      x === undefined
        ? '?'
        : typeof x === 'number'
          ? String(x)
          : rep.known(x)
            ? fig4(rep.shown(x))
            : '?';
    const unit = (x: string | number | undefined) =>
      typeof x === 'string' && rep.unit(x) ? ` ${rep.unit(x)}` : '';
    const vm = Vf === undefined ? '?' : String(Math.round((1 - Vf) * 1e4) / 1e4);
    const lines: string[] = [];
    if (tooDense)
      lines.push(
        `A fiber fraction of ${n(spec.Vf)} is past the densest packing, ${HEX_MAX.toFixed(3)}.`,
      );
    if (spec.E1 !== undefined && !across)
      lines.push(
        `Along: ${n(spec.Ef)} × ${n(spec.Vf)} + ${n(spec.Em)} × ${vm} = ${n(spec.E1)}${unit(spec.E1)}`,
      );
    if (spec.E2 !== undefined)
      lines.push(
        `Across: 1 ÷ (${n(spec.Vf)} ÷ ${n(spec.Ef)} + ${vm} ÷ ${n(spec.Em)}) = ${n(spec.E2)}${unit(spec.E2)}`,
      );
    if (spec.E1 !== undefined && across)
      lines.push(`Along, for comparison: ${n(spec.E1)}${unit(spec.E1)}`);
    if (spec.rho?.c !== undefined)
      lines.push(
        `Density: ${n(spec.rho.f)} × ${n(spec.Vf)} + ${n(spec.rho.m)} × ${vm} = ${n(spec.rho.c)}${unit(spec.rho.c)}`,
      );
    if (spec.specific !== undefined && typeof spec.specific === 'string')
      lines.push(`${rep.variable(spec.specific).name}: ${valueOf(spec.specific)}`);
    return lines.join(' · ');
  }
}

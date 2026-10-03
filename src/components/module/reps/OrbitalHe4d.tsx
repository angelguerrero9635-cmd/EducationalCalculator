/**
 * The college options of `orbitalDiagram` (HC109, HC110; `typesHe4d.ts`), flat diagrams:
 * - `ladder` with `Z`: a hydrogen-like ion's levels −R∞Z² ÷ n² to scale, the page's level lit;
 *   under it the shell's n² orbitals at one energy and a slice through one orbital with its
 *   radial nodes (rings) and angular nodes (lines), the lobes signed + and −.
 * - `radial`: P(r) = r²R²(r) against r in a₀, the area 1 shaded, the radial nodes, ⟨r⟩ dashed
 *   and the most probable radius ringed.
 * - `crystalField`: the five free-ion d boxes split into t₂g and e_g (or e and t₂, or four square
 *   planar levels) by Δ, drawn to scale beside a bar of the pairing energy P, filled high or
 *   low spin.
 * A "?" value draws nothing for itself.
 */
import { View } from 'react-native';
import Svg, { Circle, G, Line, Path, Polygon, Polyline, Rect } from 'react-native-svg';

import type {
  OrbitalCrystalField,
  OrbitalHe4dSpec,
  OrbitalLadderZ,
  OrbitalRadial,
} from '@/data/modules/typesHe4d';
import { formatNumber } from '@/engine/format';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { chargeSup } from './AtomModel';
import { element } from './chem';
import { Canvas, Caption, ChartText, fitLabel, useRep } from './common';
import { fig3 } from './he1dText';
import { minus, numReader } from './he3fKit';
import { axisOf, makePlot, PlotFrame } from './hsjPlot';
import {
  BOHR_NM,
  degeneracy,
  fieldConfig,
  fieldFill,
  fieldLevels,
  hydrogenicEnergy,
  meanRadius,
  peakRadius,
  radialNodeRadii,
  radialNodes,
  radialP,
  radialReach,
  RYDBERG,
  subshellLetter,
} from './orbitalHe4dMath';

export function OrbitalHe4d({ spec, calc }: { spec: OrbitalHe4dSpec; calc: Calculator }) {
  if (spec.mode === 'radial') return <Radial spec={spec} calc={calc} />;
  if (spec.mode === 'crystalField') return <CrystalField spec={spec} calc={calc} />;
  return <LadderZ spec={spec} calc={calc} />;
}

/** A whole value in [lo, hi], or undefined. */
const wholeIn = (x: number | undefined, lo: number, hi: number) =>
  x !== undefined && Number.isInteger(Math.round(x)) && Math.round(x) >= lo && Math.round(x) <= hi
    ? Math.round(x)
    : undefined;

/** The ion of a hydrogen-like atom of charge Z: H, He⁺, Li²⁺ … */
export const hydrogenLike = (Z: number) => `${element(Z)?.symbol ?? `Z = ${Z}`}${chargeSup(Z - 1)}`;

const eV = (x: number) => `${minus(fig3(x))} eV`;

// ─── Ladder with Z ───────────────────────────────────────────────────────────

const LADDER_H = 330;

/** A slice through one orbital: rings at the radial nodes, lines at the angular ones, ± lobes. */
function NodeSlice({
  cx,
  cy,
  R,
  Z,
  n,
  l,
}: {
  cx: number;
  cy: number;
  R: number;
  Z: number;
  n: number;
  l: number;
}) {
  const c = usePalette();
  const nodes = radialNodeRadii(Z, n, l);
  // The slice ends where the outermost hump has mostly died away.
  const outer = Math.max(peakRadius(Z, n, l) * 1.55, (nodes[nodes.length - 1] ?? 0) * 1.35);
  const k = R / outer;
  const radii = [0, ...nodes.map((r) => r * k), R];
  const sectors = l === 0 ? 1 : 2 * l;
  const span = (2 * Math.PI) / sectors;
  const pt = (r: number, a: number) => `${cx + r * Math.cos(a)} ${cy - r * Math.sin(a)}`;
  const regions: { d: string; plus: boolean; tx: number; ty: number; big: boolean }[] = [];
  for (let i = 0; i < radii.length - 1; i++) {
    const [r1, r2] = [radii[i]!, radii[i + 1]!];
    for (let j = 0; j < sectors; j++) {
      const plus = (i + j) % 2 === 0;
      const mid = (r1 + r2) / 2;
      if (sectors === 1) {
        regions.push({
          d:
            `M ${pt(r2, 0)} A ${r2} ${r2} 0 1 0 ${pt(r2, Math.PI)} A ${r2} ${r2} 0 1 0 ${pt(r2, 0)} Z` +
            (r1 > 0
              ? ` M ${pt(r1, 0)} A ${r1} ${r1} 0 1 1 ${pt(r1, Math.PI)} A ${r1} ${r1} 0 1 1 ${pt(r1, 0)} Z`
              : ''),
          plus,
          tx: i === 0 ? cx : cx,
          ty: i === 0 ? cy + 4 : cy - mid + 4,
          big: r2 - r1 >= 14,
        });
        continue;
      }
      const [a1, a2] = [j * span, (j + 1) * span];
      const am = (a1 + a2) / 2;
      regions.push({
        d:
          r1 > 0
            ? `M ${pt(r2, a1)} A ${r2} ${r2} 0 0 0 ${pt(r2, a2)} L ${pt(r1, a2)} A ${r1} ${r1} 0 0 1 ${pt(r1, a1)} Z`
            : `M ${cx} ${cy} L ${pt(r2, a1)} A ${r2} ${r2} 0 0 0 ${pt(r2, a2)} Z`,
        plus,
        tx: cx + (r1 > 0 ? mid : r2 * 0.58) * Math.cos(am),
        ty: cy - (r1 > 0 ? mid : r2 * 0.58) * Math.sin(am) + 4,
        big: r2 - r1 >= 14 && (r1 > 0 ? mid : r2 * 0.58) * span >= 14,
      });
    }
  }
  return (
    <G>
      {regions.map((g, i) => (
        <Path
          key={`r${i}`}
          d={g.d}
          fill={g.plus ? c.he4dLobePlus : c.he4dLobeMinus}
          fillRule="evenodd"
          stroke={c.chartMuted}
          strokeWidth={0.8}
        />
      ))}
      {nodes.map((r, i) => (
        <Circle
          key={`n${i}`}
          cx={cx}
          cy={cy}
          r={r * k}
          fill="none"
          stroke={c.he4dNode}
          strokeWidth={1.8}
          strokeDasharray={chart.dashFine}
        />
      ))}
      {Array.from({ length: l }, (_, j) => {
        const a = (j * Math.PI) / l;
        return (
          <Line
            key={`a${j}`}
            x1={cx - (R + 6) * Math.cos(a)}
            y1={cy + (R + 6) * Math.sin(a)}
            x2={cx + (R + 6) * Math.cos(a)}
            y2={cy - (R + 6) * Math.sin(a)}
            stroke={c.he4dNode}
            strokeWidth={1.8}
            strokeDasharray={chart.dash}
          />
        );
      })}
      {regions
        .filter((g) => g.big)
        .map((g, i) => (
          <ChartText
            key={`s${i}`}
            x={g.tx}
            y={g.ty}
            textAnchor="middle"
            fontSize={chart.label}
            fontWeight="700"
          >
            {g.plus ? '+' : '−'}
          </ChartText>
        ))}
    </G>
  );
}

function LadderZ({ spec, calc }: { spec: OrbitalLadderZ; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  const num = numReader(rep);
  const ryd = spec.rydberg ?? RYDBERG;
  const Z = wholeIn(num(spec.Z), 1, 10);
  const n = wholeIn(num(spec.n), 1, 10);
  const lRaw = spec.l === undefined ? undefined : wholeIn(num(spec.l), 0, 9);
  const l = n !== undefined && lRaw !== undefined && lRaw < n ? lRaw : undefined;
  const top = Math.min(10, Math.max(4, (n ?? 0) + 1));
  const levels = Array.from({ length: top }, (_, i) => i + 1);
  const ion = Z === undefined ? undefined : hydrogenLike(Z);
  const E = Z !== undefined && n !== undefined ? hydrogenicEnergy(Z, n, ryd) : undefined;
  const g = n === undefined ? undefined : degeneracy(n);
  const sub = n !== undefined && l !== undefined ? `${n}${subshellLetter(l)}` : undefined;

  return (
    <View>
      <Canvas aspect={(w) => LADDER_H / w}>
        {({ w, h }) => {
          const zeroY = 40;
          const oneY = h - 26;
          const x0 = 60;
          const x1 = w - 12;
          // To scale: Eₙ ∝ −1 ÷ n², the same for every Z (Z only sets the numbers).
          const yOf = (k: number) => zeroY + (oneY - zeroY) / (k * k);
          // Labels: the lit level first, then each level clear of those already labelled.
          const shown: number[] = n !== undefined ? [n] : [];
          for (const k of levels) {
            const y = yOf(k);
            if (k === n || y - zeroY < 13) continue;
            if (shown.every((s) => Math.abs(yOf(s) - y) >= 13)) shown.push(k);
          }
          const midTop = yOf(2) + 16;
          const half = w / 2;
          const R = Math.max(30, Math.min(50, (half - 30) / 2, (oneY - midTop - 70) / 2));
          const sx = half + (half - 6) / 2;
          const sy = midTop + R + 14;
          const box = 15;
          const rows =
            n === undefined
              ? []
              : [
                  ...Array.from({ length: Math.min(n, 4) }, (_, k) => k),
                  ...(l !== undefined && l > 3 ? [l] : []),
                ];
          return (
            <Svg width={w} height={h}>
              <ChartText
                x={w / 2}
                y={18}
                textAnchor="middle"
                fontSize={chart.emphasis}
                fontWeight="700"
              >
                {ion
                  ? `${ion} (Z = ${Z}): Eₙ = −${fig3(ryd * Z! * Z!)} eV ÷ n²`
                  : 'Eₙ = −13.6Z² ÷ n²'}
              </ChartText>
              <Line
                x1={x0}
                y1={zeroY}
                x2={x1}
                y2={zeroY}
                stroke={c.chartMuted}
                strokeWidth={1}
                strokeDasharray={chart.dashFine}
              />
              <ChartText x={x1} y={zeroY - 5} textAnchor="end" fill={c.chartMuted}>
                0 eV (free)
              </ChartText>
              {levels.map((k) => {
                const y = yOf(k);
                const lit = k === n;
                const label = shown.includes(k);
                return (
                  <G key={k}>
                    <Line
                      x1={x0}
                      y1={y}
                      x2={x1}
                      y2={y}
                      stroke={lit ? c.chartHighlight : c.chartMuted}
                      strokeWidth={lit ? chart.strokeHeavy : 1.2}
                    />
                    {label ? (
                      <ChartText
                        x={x0 - 6}
                        y={y + 4}
                        textAnchor="end"
                        fontWeight="700"
                        fill={lit ? c.chartHighlight : c.chartInk}
                      >
                        {`n = ${k}`}
                      </ChartText>
                    ) : null}
                    {label && Z !== undefined && y - zeroY >= 14 ? (
                      <ChartText
                        x={x1}
                        y={y - 4}
                        textAnchor="end"
                        fontWeight={lit ? '700' : '400'}
                        fill={lit ? c.chartHighlight : c.chartMuted}
                        halo
                      >
                        {eV(hydrogenicEnergy(Z, k, ryd))}
                      </ChartText>
                    ) : null}
                  </G>
                );
              })}
              {n !== undefined ? (
                <G>
                  <ChartText x={12} y={midTop + 4} fontWeight="700">
                    {`n = ${n}: ${g} orbital${g === 1 ? '' : 's'}${E !== undefined ? ` at ${eV(E)}` : ', one energy'}`}
                  </ChartText>
                  {rows.map((lr, i) => {
                    const k = 2 * lr + 1;
                    const bw = Math.min(box, (half - 50) / k);
                    const y = midTop + 16 + i * 22;
                    const litRow = lr === l;
                    return (
                      <G key={lr}>
                        <ChartText
                          x={14}
                          y={y + bw - 3}
                          fontWeight={litRow ? '700' : '400'}
                          fill={litRow ? c.chartHighlight : c.chartInk}
                        >
                          {`${n}${subshellLetter(lr)}`}
                        </ChartText>
                        {Array.from({ length: k }, (_, b) => (
                          <Rect
                            key={b}
                            x={44 + b * bw}
                            y={y}
                            width={bw}
                            height={bw}
                            fill={litRow ? c.he4dLobePlus : c.card}
                            stroke={litRow ? c.chartHighlight : c.chartInk}
                            strokeWidth={litRow ? 1.8 : 1}
                          />
                        ))}
                      </G>
                    );
                  })}
                  {n > 4 && !(l !== undefined && l > 3) ? (
                    <ChartText x={14} y={midTop + 16 + rows.length * 22 + 10} fill={c.chartMuted}>
                      {`… up to ${n}${subshellLetter(n - 1)}`}
                    </ChartText>
                  ) : null}
                  {Z !== undefined && l !== undefined ? (
                    <G>
                      <NodeSlice cx={sx} cy={sy} R={R} Z={Z} n={n} l={l} />
                      <ChartText
                        x={sx}
                        y={sy + R + 20}
                        textAnchor="middle"
                        fontWeight="700"
                        fill={c.he4dNode}
                      >
                        {`radial nodes: ${radialNodes(n, l)} (rings)`}
                      </ChartText>
                      <ChartText
                        x={sx}
                        y={sy + R + 35}
                        textAnchor="middle"
                        fontWeight="700"
                        fill={c.he4dNode}
                      >
                        {`angular nodes: ${l} (lines)`}
                      </ChartText>
                    </G>
                  ) : null}
                </G>
              ) : null}
            </Svg>
          );
        }}
      </Canvas>
      <Caption>
        {Z !== undefined && n !== undefined && E !== undefined
          ? [
              `${ion}, n = ${n}${sub ? ` (${sub})` : ''}: E = −${fig3(ryd)} × ${Z}² ÷ ${n}² = ${eV(E)}.`,
              l !== undefined
                ? `Radial nodes n − l − 1 = ${n} − ${l} − 1 = ${radialNodes(n, l)}; angular nodes l = ${l}.`
                : undefined,
              `Every subshell of a shell has the same energy here: g = n² = ${g} orbitals.`,
              l !== undefined
                ? `The slice cuts one of the ${2 * l + 1} ${sub} orbitals; + and − are the signs of ψ.`
                : undefined,
            ]
              .filter(Boolean)
              .join(' · ')
          : 'Type Z and n.'}
      </Caption>
    </View>
  );
}

// ─── Radial distribution ─────────────────────────────────────────────────────

function Radial({ spec, calc }: { spec: OrbitalRadial; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  const num = numReader(rep);
  const Z = wholeIn(num(spec.Z), 1, 10);
  const n = wholeIn(num(spec.n), 1, 10);
  const lRaw = wholeIn(num(spec.l), 0, 9);
  const l = n !== undefined && lRaw !== undefined && lRaw < n ? lRaw : undefined;
  const ok = Z !== undefined && n !== undefined && l !== undefined;
  const P = ok ? radialP(Z, n, l) : undefined;
  const mean = ok ? meanRadius(Z, n, l) : undefined;
  const peak = ok ? peakRadius(Z, n, l) : undefined;
  const nodes = ok ? radialNodeRadii(Z, n, l) : [];
  const sub = ok ? `${n}${subshellLetter(l)}` : undefined;
  // The axis ends where 99.5% of the area lies inside.
  const end = (() => {
    if (!P || !ok) return 10;
    const reach = radialReach(Z, n);
    const steps = 1500;
    let area = 0;
    for (let i = 1; i <= steps; i++) {
      const r = (reach * i) / steps;
      area += P(r) * (reach / steps);
      if (area > 0.995) return Math.max(r, (mean ?? 0) * 1.15);
    }
    return reach;
  })();
  const samples = P ? Array.from({ length: 241 }, (_, i) => (end * i) / 240) : [];
  const Ps = P ? samples.map(P) : [];
  const top = Ps.length ? Math.max(...Ps) : 1;

  return (
    <View>
      <Canvas aspect={0.66}>
        {({ w, h }) => {
          const x = axisOf(0, end, 5);
          const y = axisOf(0, top * 1.3, 4);
          const p = makePlot(w, h, x, y, { L: 52, R: 14, T: 14, B: 38 });
          const curve = samples.map((r, i) => `${p.sx(r)},${p.sy(Ps[i]!)}`).join(' ');
          const fill = P ? `${p.sx(0)},${p.sy(0)} ${curve} ${p.sx(end)},${p.sy(0)}` : '';
          const meanLeft = mean !== undefined && peak !== undefined && mean < peak;
          const meanText = mean === undefined ? '' : `⟨r⟩ = ${fig3(mean)} a₀`;
          const peakText = peak === undefined ? '' : `r_mp = ${fig3(peak)} a₀`;
          const nodeGap = (p.sx(x.hi) - p.sx(0)) / Math.max(1, end);
          return (
            <Svg width={w} height={h}>
              <PlotFrame
                p={p}
                xName="r (a₀)"
                yName="P(r) = r²R² (per a₀)"
                yText={(v) => formatNumber(Number(v.toPrecision(3)))}
              />
              {P ? (
                <G>
                  <Polygon points={fill} fill={c.he4dRadialFill} opacity={0.75} />
                  <Polyline
                    points={curve}
                    fill="none"
                    stroke={c.he4dRadial}
                    strokeWidth={chart.strokeHeavy}
                    strokeLinejoin="round"
                  />
                </G>
              ) : null}
              {nodes.map((r, i) => {
                const prev = nodes[i - 1];
                const room = prev === undefined || (r - prev) * nodeGap > 40;
                return (
                  <G key={`node${i}`}>
                    <Circle
                      cx={p.sx(r)}
                      cy={p.sy(0)}
                      r={4.5}
                      fill={c.card}
                      stroke={c.he4dNode}
                      strokeWidth={2}
                    />
                    {room ? (
                      <ChartText
                        x={p.sx(r)}
                        y={p.sy(0) - 9}
                        textAnchor="middle"
                        fontWeight="700"
                        fill={c.he4dNode}
                        halo
                      >
                        node
                      </ChartText>
                    ) : null}
                  </G>
                );
              })}
              {mean !== undefined ? (
                <G>
                  <Line
                    x1={p.sx(mean)}
                    y1={p.T + 18}
                    x2={p.sx(mean)}
                    y2={p.sy(0)}
                    stroke={c.chartInk}
                    strokeWidth={1.5}
                    strokeDasharray={chart.dash}
                  />
                  <ChartText
                    {...fitLabel(
                      p.sx(mean) + (meanLeft ? -6 : 6),
                      meanText,
                      chart.label,
                      w,
                      meanLeft ? 'end' : 'start',
                      6,
                    )}
                    y={p.T + 14}
                    fontWeight="700"
                    halo
                  >
                    {meanText}
                  </ChartText>
                </G>
              ) : null}
              {peak !== undefined && P ? (
                <G>
                  <Circle
                    cx={p.sx(peak)}
                    cy={p.sy(P(peak))}
                    r={7}
                    fill="none"
                    stroke={c.chartHighlight}
                    strokeWidth={2.5}
                  />
                  <ChartText
                    {...fitLabel(
                      p.sx(peak) + (meanLeft ? 10 : -10),
                      peakText,
                      chart.label,
                      w,
                      meanLeft ? 'start' : 'end',
                      10,
                    )}
                    y={p.sy(P(peak)) - 10}
                    fontWeight="700"
                    fill={c.chartHighlight}
                    halo
                  >
                    {peakText}
                  </ChartText>
                </G>
              ) : null}
            </Svg>
          );
        }}
      </Canvas>
      <Caption>
        {ok && mean !== undefined && peak !== undefined
          ? [
              `${hydrogenLike(Z)} ${sub}: P(r) = r²R²(r), the chance per a₀ of finding the electron at r; the shaded area is 1.`,
              `Radial nodes n − l − 1 = ${radialNodes(n, l)}${nodes.length ? ` (at ${nodes.map((r) => fig3(r)).join(', ')} a₀)` : ''}.`,
              `⟨r⟩ = (3n² − l(l + 1)) ÷ 2Z = (3 × ${n}² − ${l} × ${l + 1}) ÷ ${2 * Z} = ${fig3(mean)} a₀ = ${fig3(mean * BOHR_NM)} nm.`,
              l === n - 1
                ? `r_mp = n²a₀ ÷ Z = ${n}² ÷ ${Z} = ${fig3(peak)} a₀ = ${fig3(peak * BOHR_NM)} nm (one hump).`
                : `r_mp = ${fig3(peak)} a₀ = ${fig3(peak * BOHR_NM)} nm, the tallest hump (n²a₀ ÷ Z holds only when l = n − 1).`,
            ].join(' · ')
          : 'Type Z, n and l (l below n).'}
      </Caption>
    </View>
  );
}

// ─── Crystal field ───────────────────────────────────────────────────────────

const sup = (k: number) => [...String(k)].map((ch) => '⁰¹²³⁴⁵⁶⁷⁸⁹'[Number(ch)]).join('');

function CrystalField({ spec, calc }: { spec: OrbitalCrystalField; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  const num = numReader(rep);
  const geometry = spec.geometry ?? 'octahedral';
  const unit = spec.unit ?? 'cm⁻¹';
  const d = wholeIn(num(spec.d), 0, 10);
  const split = num(spec.split);
  const pairing = num(spec.pairing);
  const levels = fieldLevels(geometry);
  const ready = d !== undefined && split !== undefined && split > 0 && pairing !== undefined;
  const fill = ready ? fieldFill(d, split, pairing, geometry) : undefined;
  const delta = geometry === 'tetrahedral' ? 'Δₜ' : geometry === 'squarePlanar' ? 'Δ' : 'Δₒ';
  const big = (x: number) => minus(formatNumber(Math.round(x)));
  const free =
    d === undefined ? [] : Array.from({ length: 5 }, (_, k) => (d > 5 + k ? 2 : d > k ? 1 : 0));

  return (
    <View>
      <Canvas aspect={(w) => 300 / w}>
        {({ w, h }) => {
          const bw = 24;
          const mid = h / 2 + 8;
          const fx = 12;
          const rx = fx + 5 * 20 + 34;
          const lo = Math.min(...levels.map((lv) => lv.at));
          const hi = Math.max(...levels.map((lv) => lv.at));
          // Δ and P on one scale: the larger of the split's height and P fills 180 px.
          // Kept inside the canvas: the top level and P's bar (from the lowest level) below
          // y = 44, the lowest level above the bottom.
          const P0 = pairing !== undefined && pairing > 0 ? pairing : 0;
          const scale =
            split !== undefined && split > 0
              ? Math.min(
                  180 / Math.max(split * (hi - lo), P0),
                  (mid - 44) / (hi * split),
                  P0 > 0 ? (mid - 44) / Math.max(1e-9, P0 + lo * split) : Infinity,
                  (h - 40 - mid) / (-lo * split),
                )
              : 0;
          const yOf = (at: number) => mid - at * (split ?? 0) * scale;
          const barX = Math.min(w - 64, rx + 5 * bw * 0.6 + 70);
          const arrow = (ax: number, y0: number, up: boolean, color: string) => {
            const [a, b] = up ? [y0 + bw - 4, y0 + 4] : [y0 + 4, y0 + bw - 4];
            const s = up ? 1 : -1;
            return (
              <G>
                <Line x1={ax} y1={a} x2={ax} y2={b + s * 3} stroke={color} strokeWidth={1.8} />
                <Path d={`M ${ax} ${b} l -3.5 ${s * 5} l 7 0 z`} fill={color} />
              </G>
            );
          };
          const boxRow = (x: number, yTop: number, cells: number[], size: number, key: string) =>
            cells.map((e, k) => (
              <G key={`${key}${k}`}>
                <Rect
                  x={x + k * size}
                  y={yTop}
                  width={size}
                  height={size}
                  fill={c.card}
                  stroke={c.chartInk}
                  strokeWidth={1.2}
                />
                {e >= 1
                  ? arrow(
                      x + k * size + (e === 2 ? size * 0.32 : size / 2),
                      yTop + (size - bw) / 2,
                      true,
                      e === 1 ? c.chartHighlight : c.chartInk,
                    )
                  : null}
                {e === 2
                  ? arrow(x + k * size + size * 0.68, yTop + (size - bw) / 2, false, c.chartInk)
                  : null}
              </G>
            ));
          const freeTop = mid - 10;
          // Levels closer than a box (square planar's lower three) step sideways, not on top.
          const xs: number[] = [];
          levels.forEach((lv, i) => {
            const prev = levels[i - 1];
            const near = prev && Math.abs(yOf(lv.at) - yOf(prev.at)) < bw + 2;
            xs.push(near ? xs[i - 1]! + prev.orbitals * bw + 44 : rx);
          });
          return (
            <Svg width={w} height={h}>
              <ChartText
                x={w / 2}
                y={18}
                textAnchor="middle"
                fontSize={chart.emphasis}
                fontWeight="700"
              >
                {`${spec.ion ? `${spec.ion} ` : ''}${d !== undefined ? `d${sup(d)}` : 'dⁿ'}${spec.ligand ? ` with ${spec.ligand}` : ''}, ${geometry === 'squarePlanar' ? 'square planar' : geometry}`}
              </ChartText>
              {/* The free ion: five boxes at one energy. */}
              {boxRow(fx, freeTop, d === undefined ? [0, 0, 0, 0, 0] : free, 20, 'f')}
              <ChartText x={fx + 50} y={freeTop + 36} textAnchor="middle" fill={c.chartMuted}>
                free ion
              </ChartText>
              {split !== undefined && split > 0 ? (
                <G>
                  {levels.map((lv, i) => {
                    const y = yOf(lv.at);
                    const x = xs[i]!;
                    const cells = fill ? fill.boxes[i]! : Array<number>(lv.orbitals).fill(0);
                    return (
                      <G key={lv.name}>
                        <Line
                          x1={fx + 100 + 4}
                          y1={mid}
                          x2={x - 4}
                          y2={y}
                          stroke={c.chartMuted}
                          strokeWidth={1}
                          strokeDasharray={chart.dashFine}
                        />
                        {boxRow(x, y - bw / 2, cells, bw, lv.name)}
                        <ChartText
                          x={x + lv.orbitals * bw + 6}
                          y={y + 5}
                          fontWeight="700"
                          fontSize={chart.value}
                        >
                          {lv.name}
                        </ChartText>
                      </G>
                    );
                  })}
                  {/* Δ: a bracket from the lowest level to the highest, beside P's bar. */}
                  <Line
                    x1={barX}
                    y1={yOf(lo)}
                    x2={barX}
                    y2={yOf(hi)}
                    stroke={c.he4dSplit}
                    strokeWidth={chart.strokeHeavy}
                  />
                  <Line
                    x1={barX - 5}
                    y1={yOf(lo)}
                    x2={barX + 5}
                    y2={yOf(lo)}
                    stroke={c.he4dSplit}
                    strokeWidth={2}
                  />
                  <Line
                    x1={barX - 5}
                    y1={yOf(hi)}
                    x2={barX + 5}
                    y2={yOf(hi)}
                    stroke={c.he4dSplit}
                    strokeWidth={2}
                  />
                  <ChartText
                    x={barX}
                    y={yOf(hi) - 8}
                    textAnchor="middle"
                    fontWeight="700"
                    fill={c.he4dSplit}
                  >
                    {delta}
                  </ChartText>
                  {pairing !== undefined && pairing > 0 ? (
                    <G>
                      <Rect
                        x={barX + 22}
                        y={yOf(lo) - pairing * scale}
                        width={10}
                        height={pairing * scale}
                        fill={c.he4dPairing}
                        opacity={0.8}
                      />
                      <ChartText
                        x={barX + 27}
                        y={yOf(lo) - pairing * scale - 8}
                        textAnchor="middle"
                        fontWeight="700"
                        fill={c.he4dPairing}
                      >
                        P
                      </ChartText>
                    </G>
                  ) : null}
                  <ChartText x={barX + 14} y={yOf(lo) + 18} textAnchor="middle" fill={c.chartMuted}>
                    to scale
                  </ChartText>
                </G>
              ) : null}
            </Svg>
          );
        }}
      </Canvas>
      <Caption>
        {ready && fill && d !== undefined
          ? [
              `${delta} = ${big(split)} ${unit} ${split > pairing ? '>' : split < pairing ? '<' : '='} P = ${big(pairing)} ${unit}: ${fill.low ? 'low spin, pairing is cheaper than climbing' : 'high spin, every orbital takes one electron before any pairs'}; ${fieldConfig(levels, fill.counts)}.`,
              `${fill.unpaired} unpaired; μ = √(${fill.unpaired} × ${fill.unpaired + 2}) = ${fig3(fill.moment)} BM.`,
              `CFSE = (${levels
                .map(
                  (lv, i) =>
                    `${i === 0 ? (lv.at < 0 ? '−' : '') : lv.at < 0 ? ' − ' : ' + '}${formatNumber(Math.abs(lv.at))} × ${fill.counts[i]}`,
                )
                .join(
                  '',
                )}) × ${big(split)} + ${fill.extraPairs} × ${big(pairing)} = ${big(fill.cfse)} ${unit}.`,
              `Each pair beyond the free ion's ${Math.max(0, d - 5)} costs P: ${fill.extraPairs} extra.`,
            ].join(' · ')
          : 'Type the d electrons, Δ and P.'}
      </Caption>
    </View>
  );
}

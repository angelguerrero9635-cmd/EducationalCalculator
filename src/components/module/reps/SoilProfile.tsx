/**
 * HC26 `soilProfile` (SoilProfileSpec in typesHe2i.ts): soil to scale, painted in its materials
 * (sand, silt, clay, gravel; concrete; asphalt and crushed stone), with flat stress lines,
 * brackets and plans: σ, u and σ′ with depth; a clay layer consolidating under a load; a
 * footing with its failure wedges, or seen from above with its punching perimeter; a pavement.
 */
import type { ReactNode } from 'react';
import { View } from 'react-native';
import Svg, { Circle, Defs, G, Line, Path, Polygon, Rect } from 'react-native-svg';

import type { NumOrVar } from '@/data/modules/typesGraphs';
import type { SoilProfileSpec } from '@/data/modules/typesHe2i';
import { chart, usePalette, type Palette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Arrow, fmt, HeLabel } from './beamKit';
import { Canvas, Caption, niceCeil, useRep } from './common';
import { useValueLabel } from './he1fKit';
import { TopLight, url, usePaintIds } from './paint';
import {
  bearingFactors,
  bendDepths,
  failureMechanism,
  settlement,
  stackLayers,
  stressAt,
  structuralNumber,
} from './soilMath';

const BW = 358;
const SIZE = chart.label;
const SUB = ['₁', '₂', '₃', '₄', '₅'];

type Box = { x1: number; y1: number; x2: number; y2: number };
export const labelW = (t: string) => t.replace(/_/g, '').length * SIZE * 0.58 + 6;
const boxAt = (x: number, y: number, t: string): Box => {
  const w = labelW(t);
  return { x1: x - w / 2, y1: y - SIZE, x2: x + w / 2, y2: y + 5 };
};
const hits = (a: Box, b: Box) => a.x1 < b.x2 && b.x1 < a.x2 && a.y1 < b.y2 && b.y1 < a.y2;

/** A small pseudo-random number in [0, 1) from a seed (grains, stones). */
const jitter = (i: number) => {
  const s = Math.sin(i * 12.9898 + 78.233) * 43758.5453;
  return s - Math.floor(s);
};

export type Material =
  'sand' | 'clay' | 'silt' | 'gravel' | 'asphalt' | 'base' | 'subgrade' | 'concrete';

/** A patch of a material from (x, y), w × h: its colour, its grains or stones, lit from above. */
export function Patch({
  x,
  y,
  w,
  h,
  m,
  light,
  c,
  seed = 0,
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  m: Material;
  light: string;
  c: Palette;
  seed?: number;
}) {
  if (!(w > 0) || !(h > 0)) return null;
  const fill = {
    sand: c.landSand,
    clay: c.landClay,
    silt: c.soilSilt,
    gravel: c.soilGravel,
    asphalt: c.soilAsphalt,
    base: c.soilBase,
    subgrade: c.soil,
    concrete: c.beamConcrete,
  }[m];
  const marks: ReactNode[] = [];
  const n = Math.floor((w * h) / (m === 'clay' ? 160 : m === 'gravel' || m === 'base' ? 110 : 55));
  for (let i = 0; i < n; i++) {
    const px = x + 2 + jitter(seed + i) * (w - 4);
    const py = y + 2 + jitter(seed + i + 999) * (h - 4);
    const r = jitter(seed + i + 77);
    if (m === 'clay')
      marks.push(
        <Line
          key={i}
          x1={px - 3}
          x2={px + 3}
          y1={py}
          y2={py}
          stroke={c.soilClayLine}
          strokeWidth={1}
          opacity={0.6}
        />,
      );
    else if (m === 'gravel' || m === 'base')
      marks.push(
        <Circle
          key={i}
          cx={px}
          cy={py}
          r={1.2 + r * 1.8}
          fill="none"
          stroke={c.soilGravelStone}
          strokeWidth={1}
        />,
      );
    else
      marks.push(
        <Circle
          key={i}
          cx={px}
          cy={py}
          r={0.6 + r * 0.7}
          fill={
            m === 'asphalt'
              ? c.soilAsphaltStone
              : m === 'subgrade'
                ? c.soilDark
                : m === 'concrete'
                  ? c.beamConcreteDark
                  : c.soilGrain
          }
          opacity={0.7}
        />,
      );
  }
  return (
    <G>
      <Rect x={x} y={y} width={w} height={h} fill={fill} />
      {marks}
      <Rect x={x} y={y} width={w} height={h} fill={url(light)} />
    </G>
  );
}

/** Labels kept apart: `place` puts one at the first clear spot inside the canvas. */
export function useLabels() {
  const placed: Box[] = [];
  const els: ReactNode[] = [];
  const place = (
    key: string,
    spots: [number, number][],
    text: string | undefined,
    color?: string,
    chip = true,
  ) => {
    if (!text) return;
    const inside = ([x]: [number, number]) =>
      x - labelW(text) / 2 > 2 && x + labelW(text) / 2 < BW - 2;
    const spot =
      spots.find((p) => inside(p) && !placed.some((b) => hits(b, boxAt(p[0], p[1], text)))) ??
      spots.find(inside) ??
      spots[0]!;
    placed.push(boxAt(spot[0], spot[1], text));
    els.push(
      <HeLabel
        key={key}
        x={spot[0]}
        y={spot[1]}
        text={text}
        color={color}
        w={BW}
        size={SIZE}
        chip={chip}
      />,
    );
  };
  return { placed, els, place };
}

export function SoilProfile({ spec, calc }: { spec: SoilProfileSpec; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  const valueLabel = useValueLabel(calc);
  const paint = usePaintIds('light');
  const get = (x: NumOrVar | undefined) =>
    x === undefined ? undefined : typeof x === 'number' ? x : rep.known(x) ? rep.val(x) : undefined;
  /** "σ = 92 kPa": the page's value as shown (nothing while it is "?"), or a number worked here. */
  const lab = (x: NumOrVar | undefined, sym: string, v: number | undefined, unit = '') =>
    typeof x === 'string'
      ? valueLabel(x)
      : v === undefined || !Number.isFinite(v)
        ? undefined
        : `${sym} = ${fmt(v)}${unit ? ` ${unit}` : ''}`;
  const L = useLabels();
  const body: ReactNode[] = [];
  const caption: string[] = [];
  let BH = 200;

  if (spec.mode === 'stress') {
    // ── Layers, the water table, and σ, u, σ′ with depth ──
    const ls = spec.layers.map((l) => ({
      thickness: get(l.thickness) ?? NaN,
      gamma: get(l.gamma),
      gammaSat: get(l.gammaSat),
    }));
    const [zw, z] = [get(spec.zw), get(spec.z)];
    const gw = get(spec.gammaW) ?? 9.81;
    const finite = ls.slice(0, -1).reduce((s, l) => s + l.thickness, 0);
    const ready =
      zw !== undefined &&
      z !== undefined &&
      ls.every((l, i) => i === ls.length - 1 || l.thickness > 0) &&
      spec.layers.every(
        (l, i) =>
          (l.gamma === undefined || ls[i]!.gamma !== undefined) &&
          (l.gammaSat === undefined || ls[i]!.gammaSat !== undefined),
      );
    if (!ready || !Number.isFinite(finite)) {
      caption.push('Type the layers, the water table and the depth to draw the stresses.');
    } else {
      const layers = stackLayers(ls);
      const zMax = Math.max(finite * 1.25, z * 1.15, zw * 1.1, 1);
      const [top, colX, colW, H] = [40, 12, 124, 230];
      const sz = H / zMax;
      const Y = (d: number) => top + d * sz;
      const at = stressAt(layers, zw, z, gw);
      const bottom = stressAt(layers, zw, zMax, gw);
      const scale = niceCeil(bottom.sigma);
      const [cx0, cw] = [184, 150];
      const X = (s: number) => cx0 + (s / scale) * cw;
      // The column, layer by layer, and the water below the table.
      layers.forEach((l, i) => {
        const y1 = Y(l.top);
        const y2 = Y(Math.min(l.bottom, zMax));
        body.push(
          <Patch
            key={`l${i}`}
            x={colX}
            y={y1}
            w={colW}
            h={y2 - y1}
            m={spec.layers[i]!.soil}
            light={paint.light}
            c={c}
            seed={i * 131}
          />,
        );
        if (i > 0)
          body.push(
            <Line
              key={`b${i}`}
              x1={colX}
              x2={colX + colW}
              y1={y1}
              y2={y1}
              stroke={c.chartInk}
              strokeWidth={1}
            />,
          );
      });
      body.push(
        <Rect
          key="water"
          x={colX}
          y={Y(zw)}
          width={colW}
          height={Math.max(0, Y(zMax) - Y(zw))}
          fill={c.soilWater}
        />,
        <Rect
          key="col"
          x={colX}
          y={top}
          width={colW}
          height={H}
          fill="none"
          stroke={c.chartInk}
          strokeWidth={1.2}
        />,
        <Line
          key="wt"
          x1={colX}
          x2={colX + colW}
          y1={Y(zw)}
          y2={Y(zw)}
          stroke={c.soilPore}
          strokeWidth={1.6}
        />,
        <Polygon
          key="wtmark"
          points={`${colX + colW - 22},${Y(zw) - 11} ${colX + colW - 10},${Y(zw) - 11} ${colX + colW - 16},${Y(zw) - 1}`}
          fill={c.soilPore}
        />,
      );
      // Each layer's name and unit weights, inside it.
      layers.forEach((l, i) => {
        const s = spec.layers[i]!;
        const y1 = Y(l.top);
        const y2 = Y(Math.min(l.bottom, zMax));
        const lines = [
          s.name,
          l.top < zw
            ? lab(s.gamma, 'γ', s.gamma === undefined ? undefined : l.gamma, 'kN/m³')
            : undefined,
          Math.min(l.bottom, zMax) > zw
            ? lab(s.gammaSat, 'γ_sat', s.gammaSat === undefined ? undefined : l.gammaSat, 'kN/m³')
            : undefined,
        ].filter((t): t is string => !!t);
        const room = Math.floor((y2 - y1 - 6) / 16);
        lines.slice(0, Math.max(0, room)).forEach((t, k, all) => {
          const y = (y1 + y2) / 2 - ((all.length - 1) * 16) / 2 + k * 16 + 4;
          L.place(`ln${i}${k}`, [[colX + colW / 2, y]], t, k === 0 ? c.chartInk : undefined);
        });
      });
      // The depth axis between the column and the chart: 0, the boundaries, z_w and z.
      const marks = [...new Set([0, ...layers.slice(0, -1).map((l) => l.bottom), zw, z])]
        .filter((d) => d <= zMax)
        .sort((a, b) => a - b);
      let last = -Infinity;
      body.push(
        <Line
          key="daxis"
          x1={cx0}
          x2={cx0}
          y1={top}
          y2={top + H}
          stroke={c.chartInk}
          strokeWidth={1.2}
        />,
      );
      for (const d of marks) {
        const y = Y(d);
        body.push(<Line key={`t${d}`} x1={cx0 - 4} x2={cx0} y1={y} y2={y} stroke={c.chartInk} />);
        if (y - last < 14 && d !== z) continue;
        last = y;
        L.place(
          `tl${d}`,
          [[cx0 - 22, y + 4]],
          `${fmt(d)} m`,
          d === z ? c.chartHighlight : c.chartMuted,
          false,
        );
      }
      // The stress axis along the top.
      body.push(
        <Line
          key="saxis"
          x1={cx0}
          x2={cx0 + cw}
          y1={top}
          y2={top}
          stroke={c.chartInk}
          strokeWidth={1.2}
        />,
        <Line key="smax" x1={X(scale)} x2={X(scale)} y1={top - 4} y2={top} stroke={c.chartInk} />,
      );
      L.place('s0', [[cx0, top - 8]], '0', c.chartMuted, false);
      L.place('smax', [[X(scale) - 8, top - 8]], `${fmt(scale)} kPa`, c.chartMuted, false);
      L.place('stitle', [[cx0 + cw / 2 - 20, top - 22]], 'Stress', c.chartMuted, false);
      // σ, u and σ′ through the bends.
      const ds = bendDepths(layers, zw, zMax);
      const line = (f: (d: number) => number) =>
        ds.map((d, k) => `${k ? 'L' : 'M'} ${X(f(d))} ${Y(d)}`).join(' ');
      const S = (d: number) => stressAt(layers, zw, d, gw);
      body.push(
        <Path
          key="sig"
          d={line((d) => S(d).sigma)}
          stroke={c.soilSigma}
          strokeWidth={2.4}
          fill="none"
        />,
        <Path
          key="u"
          d={line((d) => S(d).u)}
          stroke={c.soilPore}
          strokeWidth={2}
          strokeDasharray={chart.dash}
          fill="none"
        />,
        <Path
          key="eff"
          d={line((d) => S(d).eff)}
          stroke={c.soilEffective}
          strokeWidth={2}
          fill="none"
        />,
      );
      // Each line's name at the bottom.
      const names: [string, number, string][] = [
        ['σ', bottom.sigma, c.soilSigma],
        ['σ′', bottom.eff, c.soilEffective],
        ['u', bottom.u, c.soilPore],
      ];
      for (const [t, v, col] of names) {
        const x = X(v);
        L.place(
          `n${t}`,
          [
            [x + 10, Y(zMax) - 4],
            [x - 10, Y(zMax) - 4],
            [x + 12, Y(zMax) - 20],
            [x - 12, Y(zMax) - 20],
          ],
          t,
          col,
        );
      }
      // The marked depth: its line broken where its depth is named on the axis.
      const y = Y(z);
      const gap = labelW(`${fmt(z)} m`) / 2 + 2;
      body.push(
        ...[
          [colX, cx0 - 22 - gap],
          [cx0 - 22 + gap, cx0 + cw],
        ].map(([xa, xb], k) => (
          <Line
            key={`z${k}`}
            x1={xa}
            x2={xb}
            y1={y}
            y2={y}
            stroke={c.chartHighlight}
            strokeWidth={1.2}
            strokeDasharray={chart.dashFine}
          />
        )),
      );
      for (const [v, col] of [
        [at.sigma, c.soilSigma],
        [at.u, c.soilPore],
        [at.eff, c.soilEffective],
      ] as const)
        body.push(<Circle key={`p${col}`} cx={X(v)} cy={y} r={4} fill={col} stroke={c.card} />);
      const rows = [
        [lab(spec.sigma, 'σ', at.sigma, 'kPa'), c.soilSigma],
        [lab(spec.u, 'u', at.u, 'kPa'), c.soilPore],
        [lab(spec.sigmaEff, 'σ′', at.eff, 'kPa'), c.soilEffective],
      ] as const;
      const below = top + H + 24;
      rows.forEach(([t, col], k) => {
        if (t) L.place(`v${k}`, [[BW / 2, below + k * 18]], t, col, false);
      });
      BH = below + 2 * 18 + 12;
      caption.push(
        `At z = ${fmt(z)} m: σ′ = σ − u = ${fmt(at.sigma)} − ${fmt(at.u)} = ${fmt(at.eff)} kPa.`,
      );
      caption.push(
        z > zw
          ? `u = γ_w(z − z_w) = ${fmt(gw)} × ${fmt(z - zw)} kPa below the water table; 0 above it.`
          : 'Above the water table u = 0, so σ′ = σ.',
      );
    }
  } else if (spec.mode === 'consolidation') {
    // ── A clay layer under a new load ──
    const H = get(spec.H);
    const [s0, ds, Cc, e0] = [get(spec.s0), get(spec.ds), get(spec.Cc), get(spec.e0)];
    const [Cs, sp] = [get(spec.Cs), get(spec.sp)];
    const double = (spec.drainage ?? 'double') === 'double';
    const S =
      (spec.Cs === undefined || (Cs !== undefined && sp !== undefined)) &&
      H !== undefined &&
      s0 !== undefined &&
      ds !== undefined &&
      Cc !== undefined &&
      e0 !== undefined
        ? settlement(H, Cc, e0, s0, ds, Cs, sp)
        : undefined;
    const [x1, x2] = [20, 236];
    const surf = 70;
    const sandH = 36;
    const clayTop = surf + sandH;
    const clayH = 140;
    const clayBot = clayTop + clayH;
    const baseH = 34;
    body.push(
      <Patch key="sand" x={x1} y={surf} w={x2 - x1} h={sandH} m="sand" light={paint.light} c={c} />,
      <Patch
        key="clay"
        x={x1}
        y={clayTop}
        w={x2 - x1}
        h={clayH}
        m="clay"
        light={paint.light}
        c={c}
        seed={40}
      />,
      <Patch
        key="base"
        x={x1}
        y={clayBot}
        w={x2 - x1}
        h={baseH}
        m={double ? 'sand' : 'gravel'}
        light={paint.light}
        c={c}
        seed={90}
      />,
      <Line key="ct" x1={x1} x2={x2} y1={clayTop} y2={clayTop} stroke={c.chartInk} />,
      <Line
        key="cb"
        x1={x1}
        x2={x2}
        y1={clayBot}
        y2={clayBot}
        stroke={c.chartInk}
        strokeWidth={double ? 1 : 2.4}
      />,
      <Line key="gs" x1={x1} x2={x2} y1={surf} y2={surf} stroke={c.chartInk} strokeWidth={1.6} />,
    );
    L.place('sandn', [[x1 + 40, surf + 17]], 'Sand', c.chartInk);
    L.place(
      'basen',
      [[x1 + 70, clayBot + 28]],
      double ? 'Sand: drains' : 'Rock: no drainage',
      c.chartInk,
    );
    const clayText = [lab(spec.Cc, 'C_c', Cc), lab(spec.e0, 'e₀', e0)].filter(Boolean).join(', ');
    L.place(
      'clayn',
      [[(x1 + x2) / 2, clayBot - 24]],
      clayText ? `Clay: ${clayText}` : 'Clay',
      c.chartInk,
    );
    if (Cs !== undefined || sp !== undefined) {
      const oc = [lab(spec.Cs, 'C_s', Cs), lab(spec.sp, 'σ′_p', sp, 'kPa')]
        .filter(Boolean)
        .join(', ');
      if (oc) L.place('ocn', [[(x1 + x2) / 2, clayBot - 42]], oc, c.chartInk);
    }
    // The new load on the surface.
    if (spec.ds !== undefined && ds !== undefined) {
      for (let k = 0; k < 7; k++) {
        const x = x1 + 16 + (k * (x2 - x1 - 32)) / 6;
        body.push(
          <Arrow
            key={`q${k}`}
            x1={x}
            y1={surf - 30}
            x2={x}
            y2={surf - 3}
            color={c.beamLoad}
            width={2}
          />,
        );
      }
      L.place('ds', [[(x1 + x2) / 2, surf - 36]], lab(spec.ds, 'Δσ', ds, 'kPa'), c.beamLoad, false);
    }
    // Water leaves the clay through its drained faces.
    for (const k of [0.25, 0.5, 0.75]) {
      const x = x1 + (x2 - x1) * k + 18;
      body.push(
        <Arrow
          key={`du${k}`}
          x1={x}
          y1={clayTop + 16}
          x2={x}
          y2={clayTop - 8}
          color={c.soilPore}
          width={1.8}
        />,
      );
      if (double)
        body.push(
          <Arrow
            key={`dd${k}`}
            x1={x}
            y1={clayBot - 4}
            x2={x}
            y2={clayBot + 16}
            color={c.soilPore}
            width={1.8}
          />,
        );
    }
    // The mid-depth point.
    const my = clayTop + clayH / 2;
    body.push(
      <Circle
        key="mid"
        cx={(x1 + x2) / 2}
        cy={my}
        r={4.5}
        fill={c.chartHighlight}
        stroke={c.card}
      />,
    );
    L.place(
      's0',
      [[(x1 + x2) / 2 + 12 + labelW(lab(spec.s0, 'σ′₀', s0, 'kPa') ?? '') / 2, my + 4]],
      lab(spec.s0, 'σ′₀', s0, 'kPa'),
    );
    // H, and the drainage path.
    const bx = x2 + 10;
    body.push(
      <Line key="hb" x1={bx} x2={bx} y1={clayTop} y2={clayBot} stroke={c.chartInk} />,
      <Line key="hb1" x1={bx - 5} x2={bx + 5} y1={clayTop} y2={clayTop} stroke={c.chartInk} />,
      <Line key="hb2" x1={bx - 5} x2={bx + 5} y1={clayBot} y2={clayBot} stroke={c.chartInk} />,
    );
    const Ht = lab(spec.H, 'H', H, 'm');
    if (Ht) L.place('H', [[bx + 8 + labelW(Ht) / 2, my + 4]], Ht, undefined, false);
    const Hdr = get(spec.Hdr) ?? (H === undefined ? undefined : double ? H / 2 : H);
    if (spec.Hdr !== undefined && Hdr !== undefined && H) {
      const hy = clayTop + (Hdr / H) * clayH;
      body.push(
        <Line
          key="dr"
          x1={x1 + 18}
          x2={x1 + 18}
          y1={clayTop}
          y2={hy}
          stroke={c.soilPore}
          strokeWidth={1.6}
        />,
        <Line
          key="dr2"
          x1={x1 + 13}
          x2={x1 + 23}
          y1={hy}
          y2={hy}
          stroke={c.soilPore}
          strokeWidth={1.6}
        />,
      );
      const t = lab(spec.Hdr, 'H_dr', Hdr, 'm');
      if (t)
        L.place(
          'Hdr',
          [[x1 + 26 + labelW(t) / 2, clayTop + (hy - clayTop) / 2 + 4]],
          t,
          c.soilPore,
        );
    }
    // The settled surface, to scale with H.
    if (S !== undefined && H) {
      const sy = surf + (S / H) * clayH;
      body.push(
        <Line
          key="settled"
          x1={x1}
          x2={x2}
          y1={sy}
          y2={sy}
          stroke={c.beamDeflect}
          strokeWidth={1.8}
          strokeDasharray={chart.dash}
        />,
      );
      const St = lab(spec.S, 'S', S, 'm');
      if (St) L.place('S', [[bx + 8 + labelW(St) / 2, surf + 4]], St, c.beamDeflect, false);
      const end = s0! + ds!;
      const oc = Cs !== undefined && sp !== undefined;
      caption.push(
        oc && end > sp
          ? `S = H ÷ (1 + e₀) × (C_s log(σ′_p ÷ σ′₀) + C_c log((σ′₀ + Δσ) ÷ σ′_p)) = ${fmt(H)} ÷ ${fmt(1 + e0!)} × (${fmt(Cs)} log(${fmt(sp)} ÷ ${fmt(s0!)}) + ${fmt(Cc!)} log(${fmt(end)} ÷ ${fmt(sp)})) = ${fmt(S)} m.`
          : `S = ${oc ? 'C_s' : 'C_c'}·H ÷ (1 + e₀) × log((σ′₀ + Δσ) ÷ σ′₀) = ${fmt(oc ? Cs : Cc!)} × ${fmt(H)} ÷ ${fmt(1 + e0!)} × log(${fmt(end)} ÷ ${fmt(s0!)}) = ${fmt(S)} m.`,
      );
      caption.push('The dashed line is the surface after settling, drawn to the same scale as H.');
    }
    if (spec.Hdr !== undefined && Hdr !== undefined)
      caption.push(
        double
          ? `Drained top and bottom, water travels at most H_dr = H ÷ 2 = ${fmt(Hdr)} m.`
          : `Drained at the top only, water travels the whole H_dr = H = ${fmt(Hdr)} m.`,
      );
    if (!caption.length) caption.push('Type the layer and the loads to draw the settlement.');
    BH = clayBot + baseH + 8;
  } else if (spec.mode === 'footing') {
    // ── A footing and the general shear failure under it ──
    const [B, Df, phi] = [get(spec.B), get(spec.Df), get(spec.phi)];
    if (B === undefined || Df === undefined || phi === undefined || !(B > 0) || !(Df >= 0)) {
      caption.push('Type B, D_f and φ′ to draw the footing and its failure wedges.');
    } else {
      const mech = failureMechanism(B, phi);
      const deep = Math.max(mech.apex[1], ...mech.spiral.map((p) => p[1]));
      const half = Math.max(mech.top[0], B / 2) * 1.05;
      const s = Math.min((BW - 24) / (2 * half), 190 / (Df + deep * 1.08));
      const cx = BW / 2;
      const ground = 66;
      const base = ground + Df * s;
      const X = (x: number) => cx + x * s;
      const Y = (y: number) => base + y * s;
      const bottom = Y(deep * 1.08) + 6;
      body.push(
        <Patch
          key="soil"
          x={6}
          y={ground}
          w={BW - 12}
          h={bottom - ground}
          m="sand"
          light={paint.light}
          c={c}
        />,
        <Line
          key="gl"
          x1={6}
          x2={BW - 6}
          y1={ground}
          y2={ground}
          stroke={c.chartInk}
          strokeWidth={1.6}
        />,
      );
      // The wedges, each side: active, radial (the log spiral) and passive.
      const P = (p: [number, number], side: number) => `${X(side * p[0])},${Y(p[1])}`;
      for (const side of [1, -1]) {
        const E: [number, number] = [B / 2, 0];
        body.push(
          <Polygon
            key={`r${side}`}
            points={[E, mech.apex, ...mech.spiral].map((p) => P(p, side)).join(' ')}
            fill={c.soilWedge}
            stroke={c.soilWedgeLine}
            strokeWidth={1.2}
          />,
          <Polygon
            key={`p${side}`}
            points={[E, mech.spiral[mech.spiral.length - 1]!, mech.top]
              .map((p) => P(p, side))
              .join(' ')}
            fill={c.soilWedge}
            stroke={c.soilWedgeLine}
            strokeWidth={1.2}
          />,
        );
      }
      body.push(
        <Polygon
          key="active"
          points={[[-B / 2, 0], [B / 2, 0], mech.apex]
            .map((p) => `${X(p[0]!)},${Y(p[1]!)}`)
            .join(' ')}
          fill={c.soilWedge}
          stroke={c.soilWedgeLine}
          strokeWidth={1.4}
        />,
        <Line
          key="baseline"
          x1={X(-mech.top[0])}
          x2={X(mech.top[0])}
          y1={base}
          y2={base}
          stroke={c.soilWedgeLine}
          strokeDasharray={chart.dashFine}
        />,
      );
      // The footing (concrete) and its column.
      const th = Math.min(Df * 0.5, B * 0.3) * s;
      const colW = Math.max(8, B * 0.28 * s);
      body.push(
        <Patch
          key="col"
          x={cx - colW / 2}
          y={ground - 26}
          w={colW}
          h={base - th - ground + 26}
          m="concrete"
          light={paint.light}
          c={c}
          seed={7}
        />,
        <Rect
          key="colo"
          x={cx - colW / 2}
          y={ground - 26}
          width={colW}
          height={base - th - ground + 26}
          fill="none"
          stroke={c.beamConcreteDark}
        />,
        <Patch
          key="ftg"
          x={X(-B / 2)}
          y={base - th}
          w={B * s}
          h={th}
          m="concrete"
          light={paint.light}
          c={c}
          seed={3}
        />,
        <Rect
          key="ftgo"
          x={X(-B / 2)}
          y={base - th}
          width={B * s}
          height={th}
          fill="none"
          stroke={c.beamConcreteDark}
          strokeWidth={1.2}
        />,
      );
      // q pushing up on the base.
      const q = get(spec.q);
      if (q !== undefined || spec.q === undefined)
        for (let k = 0; k < 5; k++) {
          const x = X(-B / 2 + (B * (k + 0.5)) / 5);
          body.push(
            <Arrow
              key={`q${k}`}
              x1={x}
              y1={base + 16}
              x2={x}
              y2={base + 2}
              color={c.beamReaction}
              width={1.6}
              head={6}
            />,
          );
        }
      // B over the footing, D_f beside it.
      const dy = ground - 36;
      body.push(
        <Line key="bd" x1={X(-B / 2)} x2={X(B / 2)} y1={dy} y2={dy} stroke={c.chartInk} />,
        <Line
          key="bd1"
          x1={X(-B / 2)}
          x2={X(-B / 2)}
          y1={dy - 5}
          y2={ground}
          stroke={c.chartMuted}
          strokeDasharray={chart.dashFine}
        />,
        <Line
          key="bd2"
          x1={X(B / 2)}
          x2={X(B / 2)}
          y1={dy - 5}
          y2={ground}
          stroke={c.chartMuted}
          strokeDasharray={chart.dashFine}
        />,
      );
      L.place('B', [[cx, dy - 6]], lab(spec.B, 'B', B, 'm'), undefined, false);
      const fx = X(-B / 2) - 12;
      body.push(
        <Line key="df" x1={fx} x2={fx} y1={ground} y2={base} stroke={c.chartInk} />,
        <Line key="df1" x1={fx - 4} x2={fx + 4} y1={ground} y2={ground} stroke={c.chartInk} />,
        <Line key="df2" x1={fx - 4} x2={fx + 4} y1={base} y2={base} stroke={c.chartInk} />,
      );
      const dft = lab(spec.Df, 'D_f', Df, 'm');
      if (dft)
        L.place(
          'Df',
          [
            [fx - 6 - labelW(dft) / 2, ground - 8],
            [fx - 6 - labelW(dft) / 2, (ground + base) / 2 + 4],
          ],
          dft,
        );
      const rows = [lab(spec.phi, 'φ′', phi, '°'), lab(spec.q, 'q_u', q, 'kPa')].filter(
        (t): t is string => !!t,
      );
      L.place('rows', [[BW / 2, bottom + 18]], rows.join('    '), undefined, false);
      BH = bottom + 26;
      const f = bearingFactors(phi);
      const sq = spec.shape === 'square';
      caption.push(
        `N_q = ${fmt(f.Nq)}, N_c = ${fmt(f.Nc)}, N_γ = ${fmt(f.Ng)} from φ′ = ${fmt(phi)}°.`,
      );
      caption.push(
        sq
          ? 'A square footing: q_u = 1.3c′N_c + γD_f·N_q + 0.4γB·N_γ.'
          : 'A strip footing: q_u = c′N_c + γD_f·N_q + ½γB·N_γ.',
      );
      caption.push(
        `Drawn to scale: D_f ÷ B = ${fmt(Df / B)}. The wedges push the soil out and up beside the footing.`,
      );
    }
  } else if (spec.mode === 'plan') {
    // ── A square footing from above: the column and the punching perimeter ──
    const [B, cc, d] = [get(spec.B), get(spec.c), get(spec.d)];
    const k = spec.perB ?? 1;
    const ub = spec.units?.B ?? (k === 12 ? 'ft' : 'm');
    const uc = spec.units?.c ?? (k === 12 ? 'in' : 'm');
    if (B === undefined || cc === undefined || !(B > 0)) {
      caption.push('Type the footing’s side and the column to draw the plan.');
    } else {
      const side = 210;
      const s = side / (B * k);
      const [cx, cy] = [BW / 2, 30 + side / 2];
      const [fx, fy] = [cx - side / 2, cy - side / 2];
      const col = cc * s;
      const crit = d === undefined ? undefined : (cc + d) * s;
      body.push(
        <Patch key="ftg" x={fx} y={fy} w={side} h={side} m="concrete" light={paint.light} c={c} />,
      );
      if (crit !== undefined && crit < side)
        body.push(
          <Path
            key="shade"
            d={`M ${fx} ${fy} h ${side} v ${side} h ${-side} Z M ${cx - crit / 2} ${cy - crit / 2} v ${crit} h ${crit} v ${-crit} Z`}
            fill={c.soilWedge}
            fillRule="evenodd"
          />,
        );
      body.push(
        <Rect
          key="ftgo"
          x={fx}
          y={fy}
          width={side}
          height={side}
          fill="none"
          stroke={c.beamConcreteDark}
          strokeWidth={1.4}
        />,
        <Patch
          key="col"
          x={cx - col / 2}
          y={cy - col / 2}
          w={col}
          h={col}
          m="concrete"
          light={paint.light}
          c={c}
          seed={5}
        />,
        <Rect
          key="colo"
          x={cx - col / 2}
          y={cy - col / 2}
          width={col}
          height={col}
          fill={c.beamConcreteDark}
          opacity={0.45}
          stroke={c.chartInk}
          strokeWidth={1.4}
        />,
      );
      L.place('c', [[cx, cy + 4]], 'c', c.chartInk, false);
      if (crit !== undefined) {
        body.push(
          <Rect
            key="crit"
            x={cx - crit / 2}
            y={cy - crit / 2}
            width={crit}
            height={crit}
            fill="none"
            stroke={c.soilWedgeLine}
            strokeWidth={2}
            strokeDasharray={chart.dash}
          />,
        );
        // d ÷ 2 from the column's right face to the perimeter.
        const y = cy + col / 2 + (crit - col) / 4;
        body.push(
          <Line key="dh" x1={cx + col / 2} x2={cx + crit / 2} y1={y} y2={y} stroke={c.chartInk} />,
        );
        L.place('d2', [[cx + crit / 2 + 22, y + 4]], 'd ÷ 2', c.chartInk);
        const b0t = lab(spec.b0, 'b₀', 4 * (cc + d!), uc);
        L.place('b0', [[cx, cy - crit / 2 - 8]], b0t, c.soilWedgeLine);
      }
      // B under the footing.
      const by = fy + side + 16;
      body.push(
        <Line key="bd" x1={fx} x2={fx + side} y1={by} y2={by} stroke={c.chartInk} />,
        <Line key="bd1" x1={fx} x2={fx} y1={by - 5} y2={by + 5} stroke={c.chartInk} />,
        <Line
          key="bd2"
          x1={fx + side}
          x2={fx + side}
          y1={by - 5}
          y2={by + 5}
          stroke={c.chartInk}
        />,
      );
      L.place('B', [[cx, by + 18]], lab(spec.B, 'B', B, ub), undefined, false);
      const row = [lab(spec.c, 'c', cc, uc), lab(spec.d, 'd', d, uc)].filter(Boolean).join('    ');
      L.place('cd', [[cx, by + 38]], row, undefined, false);
      BH = by + 46;
      if (d !== undefined) {
        // In the units the page shows (a page in inches read in metric shows cm here too).
        const shown = (x: NumOrVar | undefined, v: number) =>
          typeof x === 'string' && rep.known(x) ? rep.value(x) : `${fmt(v)} ${uc}`;
        caption.push(
          `b₀ = 4(c + d) = 4 × (${shown(spec.c, cc)} + ${shown(spec.d, d)}) = ${shown(spec.b0, 4 * (cc + d))}, d ÷ 2 out from each face of the column.`,
        );
      }
      caption.push(
        'The shaded soil pressure outside the perimeter is the shear V_u the slab must carry.',
      );
    }
  } else {
    // ── A pavement: surface, base and subbase on the subgrade, and a wheel ──
    const ls = spec.layers.map((l) => ({ a: get(l.a), D: get(l.D), m: get(l.m) }));
    const known = ls.filter((l) => l.D !== undefined && l.D > 0);
    const total = known.reduce((s, l) => s + l.D!, 0);
    const top = 78;
    const s = total > 0 ? Math.min(10, 200 / total) : 0;
    const [x1, x2] = [16, 186];
    const mats: Material[] = ['asphalt', 'base', 'sand', 'gravel'];
    const names = ['Surface', 'Base', 'Subbase', 'Layer 4'];
    let y = top;
    const mids: number[] = [];
    ls.forEach((l, i) => {
      const h = l.D !== undefined && l.D > 0 ? l.D * s : 0;
      body.push(
        <Patch
          key={`l${i}`}
          x={x1}
          y={y}
          w={x2 - x1}
          h={h}
          m={mats[i] ?? 'gravel'}
          light={paint.light}
          c={c}
          seed={i * 50}
        />,
      );
      if (h > 0)
        body.push(
          <Line key={`lb${i}`} x1={x1} x2={x2} y1={y + h} y2={y + h} stroke={c.chartInk} />,
        );
      mids.push(y + h / 2);
      y += h;
    });
    const sub = 34;
    body.push(
      <Patch
        key="sg"
        x={x1}
        y={y}
        w={x2 - x1}
        h={sub}
        m="subgrade"
        light={paint.light}
        c={c}
        seed={333}
      />,
      <Rect
        key="out"
        x={x1}
        y={top}
        width={x2 - x1}
        height={y + sub - top}
        fill="none"
        stroke={c.chartInk}
        strokeWidth={1.2}
      />,
    );
    L.place('sgn', [[(x1 + x2) / 2, y + 22]], 'Subgrade', c.card, false);
    // The wheel on the surface and its load.
    const [wx, r] = [(x1 + x2) / 2, 20];
    body.push(
      <Circle key="tire" cx={wx} cy={top - r} r={r} fill={c.soilTire} />,
      <Circle
        key="tread"
        cx={wx}
        cy={top - r}
        r={r - 3}
        fill="none"
        stroke={c.soilTireTread}
        strokeWidth={2}
        strokeDasharray="3 3"
      />,
      <Circle key="hub" cx={wx} cy={top - r} r={8} fill={c.metal} stroke={c.metalDark} />,
      <Circle key="hubdot" cx={wx - 1.5} cy={top - r - 1.5} r={2} fill={c.metalDark} />,
    );
    const load = get(spec.load);
    if (spec.load !== undefined && load !== undefined) {
      body.push(
        <Arrow
          key="P"
          x1={wx + 34}
          y1={top - 2 * r - 6}
          x2={wx + 34}
          y2={top - r}
          color={c.beamLoad}
          width={2.2}
        />,
      );
      L.place(
        'Pl',
        [[wx + 40 + labelW(lab(spec.load, 'P', load, 'kN') ?? '') / 2, top - r - 14]],
        lab(spec.load, 'P', load, 'kN'),
        c.beamLoad,
        false,
      );
    }
    // Each layer's a, m and D at the right, a leader to its middle.
    let next = top;
    ls.forEach((l, i) => {
      const sp = spec.layers[i]!;
      const n = SUB[i] ?? '';
      const l1 = [names[i], lab(sp.a, `a${n}`, l.a)].filter(Boolean).join('  ');
      const l2 = [
        lab(sp.D, `D${n}`, l.D, 'in'),
        sp.m === undefined ? undefined : lab(sp.m, `m${n}`, l.m),
      ]
        .filter(Boolean)
        .join('  ');
      const ly = Math.max(next, mids[i]! - 8);
      next = ly + 36;
      body.push(
        <Line
          key={`ld${i}`}
          x1={x2 - 6}
          x2={x2 + 12}
          y1={mids[i]!}
          y2={ly + 6}
          stroke={c.chartMuted}
        />,
      );
      L.els.push(
        <HeLabel key={`a${i}`} x={x2 + 16} y={ly} text={l1} anchor="start" chip={false} w={BW} />,
        <HeLabel
          key={`d${i}`}
          x={x2 + 16}
          y={ly + 16}
          text={l2}
          anchor="start"
          chip={false}
          w={BW}
        />,
      );
    });
    BH = Math.max(y + sub, next) + 8;
    const SN = ls.every((l) => l.a !== undefined && l.D !== undefined)
      ? structuralNumber(ls.map((l) => ({ a: l.a!, D: l.D!, m: l.m })))
      : undefined;
    if (SN !== undefined) {
      const parts = ls.map((l) => fmt(l.a! * l.D! * (l.m ?? 1)));
      caption.push(`SN = a₁D₁ + a₂D₂m₂ + a₃D₃m₃ = ${parts.join(' + ')} = ${fmt(SN)}.`);
    } else caption.push('Type each layer’s a, D and m to find SN.');
    caption.push('Layers drawn to scale by thickness; a thicker, stronger layer adds more to SN.');
  }

  return (
    <View>
      <Canvas aspect={BH / BW}>
        {({ w, h }) => (
          <Svg width={w} height={h}>
            <Defs>
              <TopLight id={paint.light} />
            </Defs>
            <G transform={`scale(${w / BW})`}>
              {body}
              {L.els}
            </G>
          </Svg>
        )}
      </Canvas>
      <Caption>{caption.join(' · ')}</Caption>
    </View>
  );
}

import { View } from 'react-native';
import Svg, { Defs, G, Line, Rect } from 'react-native-svg';

import type { BeamSpec } from '@/data/modules/typesHe1a';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Arrow, BeamDefs, Dimension, Hatch, HeLabel, fmt, useBeamReader } from './beamKit';
import { Canvas, Caption } from './common';
import { url, usePaintIds } from './paint';

const SUB = '₁₂₃';
/** The tallest segment (the largest √A), px. */
const MAX_H = 44;
/** How far the free end moves in the drawing, whatever δ is (said in the caption). */
const SHOW_D = 22;

/**
 * `axial` (HC1): a bar of 1–3 segments, each as long as Lᵢ and as tall as √Aᵢ, fixed to a wall
 * at the left and pulled at its right end (and at each segment's end); the stretched bar dashed
 * (δ drawn bigger than life), each δᵢ and the total bracketed. `walls`: held at both ends; with
 * ΔT the free growth δ_T is drawn dashed past the right wall and the walls push back with σ.
 */
export function BeamAxial({ spec, calc }: { spec: BeamSpec; calc: Calculator }) {
  const c = usePalette();
  const B = useBeamReader(calc);
  const { v, known, all, rep } = B;
  const ids = usePaintIds('steel', 'light');
  const ax = spec.axial!;
  const segs = ax.segments.slice(0, 3);
  const walls = !!ax.walls;

  const firstLen = segs[0]?.length;
  const lenUnit =
    spec.units?.length ??
    (typeof firstLen === 'string' ? (rep.variable(firstLen).unit ?? 'mm') : 'mm');
  const fu =
    spec.units?.force ?? (typeof ax.load === 'string' ? (rep.variable(ax.load).unit ?? 'N') : 'N');
  const area = (i: number) => {
    const s = segs[i]!;
    if (s.area !== undefined) return Math.max(0, v(s.area));
    // No size named (a heated bar): every such segment drawn alike.
    if (s.diameter === undefined) return 1;
    const d = Math.max(0, v(s.diameter));
    return (Math.PI * d * d) / 4;
  };
  const lens = segs.map((s) => Math.max(1e-9, v(s.length)));
  const total = lens.reduce((t, x) => t + x, 0);
  const roots = segs.map((_, i) => Math.sqrt(area(i)));
  const rootMax = Math.max(1e-12, ...roots);
  const E = (i: number) => v(segs[i]!.modulus ?? ax.modulus, 1);
  const end = v(ax.load, 0);
  const force = segs.map((_, i) => end + segs.slice(i).reduce((t, s) => t + v(s.load, 0), 0));
  const flex = segs.map((_, i) => (force[i]! * lens[i]!) / Math.max(1e-30, area(i) * E(i)));
  // Everything the stretch needs is typed (a "?" draws no stretched bar).
  const stretchKnown =
    !walls &&
    all(ax.load, ax.modulus) &&
    segs.every((s) => all(s.length, s.area, s.diameter, s.modulus, s.load));
  const cum = flex.reduce<number[]>((acc, f) => [...acc, acc[acc.length - 1]! + f], [0]);
  const uMax = Math.max(1e-30, ...cum.map(Math.abs));
  const thermal = walls && ax.temperature !== undefined;

  const padL = 34;
  const padR = walls ? 46 : 74;

  return (
    <View>
      <Canvas aspect={(w) => (narrow(w) ? 206 : 178) / w}>
        {({ w }) => {
          const sx = (w - padL - padR) / total;
          const xs = cum.map((_, i) => padL + lens.slice(0, i).reduce((t, x) => t + x, 0) * sx);
          const stagger = narrow(w);
          const dimY = (i: number) => 22 + (stagger && i % 2 ? 16 : 0);
          const yc = (stagger ? 48 : 34) + 12 + MAX_H / 2;
          const hOf = (i: number) =>
            known(segs[i]!.area) && known(segs[i]!.diameter)
              ? Math.max(8, (MAX_H * roots[i]!) / rootMax)
              : 14;
          const rowA = yc + MAX_H / 2 + 20;
          const rowD = rowA + (stagger ? 38 : 24);
          const xEnd = xs[segs.length]!;
          const uPx = (k: number) => (stretchKnown ? (cum[k]! / uMax) * SHOW_D : 0);
          return (
            <Svg width={w} height={narrow(w) ? 206 : 178}>
              <Defs>
                <BeamDefs ids={ids} />
              </Defs>
              {/* The walls. */}
              <Rect
                x={padL - 12}
                y={yc - 34}
                width={12}
                height={68}
                fill={c.chartGrid}
                opacity={0.6}
              />
              <Hatch x1={yc - 34} x2={yc + 34} y={padL} vertical side={-1} depth={8} />
              {walls ? (
                <>
                  <Rect
                    x={xEnd}
                    y={yc - 34}
                    width={12}
                    height={68}
                    fill={c.chartGrid}
                    opacity={0.6}
                  />
                  <Hatch x1={yc - 34} x2={yc + 34} y={xEnd} vertical side={1} depth={8} />
                </>
              ) : null}
              {/* The bar, segment by segment, as tall as √A. */}
              {segs.map((s, i) => {
                const h = hOf(i);
                return (
                  <G key={i}>
                    <Rect
                      x={xs[i]!}
                      y={yc - h / 2}
                      width={xs[i + 1]! - xs[i]!}
                      height={h}
                      fill={url(ids.steel)}
                      stroke={c.metalDark}
                    />
                    {known(s.length) ? (
                      <Dimension
                        x1={xs[i]!}
                        x2={xs[i + 1]!}
                        y={dimY(i)}
                        text={B.named(
                          s.length,
                          `L${segs.length > 1 ? SUB[i] : ''}`,
                          lens[i]!,
                          lenUnit,
                        )}
                        w={w}
                      />
                    ) : null}
                    {s.area !== undefined && known(s.area) ? (
                      <HeLabel
                        x={(xs[i]! + xs[i + 1]!) / 2}
                        y={rowA + (stagger && i % 2 ? 16 : 0)}
                        text={B.named(
                          s.area,
                          `A${segs.length > 1 ? SUB[i] : ''}`,
                          area(i),
                          `${lenUnit}²`,
                        )}
                        w={w}
                      />
                    ) : null}
                    {s.diameter !== undefined && known(s.diameter) ? (
                      <HeLabel
                        x={(xs[i]! + xs[i + 1]!) / 2}
                        y={rowA + (stagger && i % 2 ? 16 : 0)}
                        text={B.named(s.diameter, 'd', v(s.diameter), lenUnit)}
                        w={w}
                      />
                    ) : null}
                    {s.delta !== undefined && known(s.delta) ? (
                      <HeLabel
                        x={(xs[i]! + xs[i + 1]!) / 2}
                        y={rowD + (stagger && i % 2 ? 16 : 0)}
                        text={B.named(s.delta, 'δ', 0)}
                        color={c.beamDeflect}
                        w={w}
                      />
                    ) : null}
                    {/* A load at this segment's end, between segments: along the bar, above it. */}
                    {i < segs.length - 1 &&
                    s.load !== undefined &&
                    known(s.load) &&
                    v(s.load) !== 0 ? (
                      <G>
                        <Arrow
                          x1={xs[i + 1]! + (v(s.load) > 0 ? 2 : 30)}
                          y1={yc - MAX_H / 2 - 6}
                          x2={xs[i + 1]! + (v(s.load) > 0 ? 30 : 2)}
                          y2={yc - MAX_H / 2 - 6}
                          color={c.beamLoad}
                          width={chart.stroke}
                        />
                        <Line
                          x1={xs[i + 1]!}
                          y1={yc - MAX_H / 2 - 6}
                          x2={xs[i + 1]!}
                          y2={yc - hOf(i) / 2}
                          stroke={c.beamLoad}
                          strokeWidth={1}
                        />
                        {/* A row over the end load's P, which sits at the same height. */}
                        <HeLabel
                          x={xs[i + 1]! + 2}
                          y={yc - MAX_H / 2 - 16}
                          text={B.named(s.load, 'Q', v(s.load), fu)}
                          color={c.beamLoad}
                          anchor="start"
                          w={w}
                        />
                      </G>
                    ) : null}
                  </G>
                );
              })}
              {/* The stretched bar, dashed: each node moved by the δ's to its left. */}
              {stretchKnown
                ? segs.map((_, i) => (
                    <Rect
                      key={`g${i}`}
                      x={xs[i]! + uPx(i)}
                      y={yc - hOf(i) / 2}
                      width={xs[i + 1]! + uPx(i + 1) - xs[i]! - uPx(i)}
                      height={hOf(i)}
                      fill="none"
                      stroke={c.beamDeflect}
                      strokeWidth={1.5}
                      strokeDasharray="5 3"
                    />
                  ))
                : null}
              {stretchKnown && ax.total !== undefined && known(ax.total) ? (
                <Dimension
                  x1={xEnd}
                  x2={xEnd + uPx(segs.length)}
                  y={rowD + (stagger ? 34 : 22)}
                  text={B.named(ax.total, 'δ', 0)}
                  color={c.beamDeflect}
                  w={w}
                />
              ) : null}
              {/* The pull at the free end. */}
              {!walls && ax.load !== undefined && known(ax.load) && end !== 0 ? (
                <G>
                  <Arrow
                    x1={xEnd + uPx(segs.length) + (end > 0 ? 3 : 40)}
                    y1={yc}
                    x2={xEnd + uPx(segs.length) + (end > 0 ? 40 : 3)}
                    y2={yc}
                    color={c.beamLoad}
                    width={chart.strokeHeavy}
                    head={10}
                  />
                  <HeLabel
                    x={w - 4}
                    y={yc - MAX_H / 2 - 4}
                    text={B.named(ax.load, 'P', end, fu)}
                    color={c.beamLoad}
                    anchor="end"
                    w={w}
                  />
                </G>
              ) : null}
              {/* One segment: its stress, inside the bar. */}
              {!walls && segs.length === 1 && ax.stress !== undefined && known(ax.stress) ? (
                <HeLabel
                  x={(xs[0]! + xEnd) / 2}
                  y={yc + 4}
                  text={B.named(ax.stress, 'σ', 0)}
                  w={w}
                />
              ) : null}
              {thermal ? renderThermal(xs, yc, xEnd, w, hOf(0)) : null}
            </Svg>
          );
        }}
      </Canvas>
      <Caption>{captionLines().join(' · ')}</Caption>
    </View>
  );

  function narrow(w: number) {
    const sx = (w - padL - padR) / total;
    return segs.length > 1 && lens.some((l) => l * sx < 100);
  }

  function renderThermal(xs: number[], yc: number, xEnd: number, w: number, h: number) {
    const t = ax.temperature!;
    const grow = known(ax.expansion) && known(t);
    return (
      <G>
        {known(t) ? (
          <HeLabel
            x={(xs[0]! + xEnd) / 2}
            y={yc - MAX_H / 2 - 6}
            text={B.named(t, 'ΔT', 0)}
            color={c.physHot}
            w={w}
          />
        ) : null}
        {grow ? (
          <>
            {/* Free, it would grow past the wall. */}
            <Rect
              x={xs[0]!}
              y={yc - h / 2 - 1}
              width={xEnd - xs[0]! + SHOW_D}
              height={h + 2}
              fill="none"
              stroke={c.beamDeflect}
              strokeWidth={1.5}
              strokeDasharray="5 3"
            />
            <Dimension
              x1={xEnd}
              x2={xEnd + SHOW_D}
              y={yc + MAX_H / 2 + 44}
              text={B.named(ax.expansion, 'δ_T', 0)}
              color={c.beamDeflect}
              w={w}
            />
          </>
        ) : null}
        {ax.stress !== undefined && known(ax.stress) ? (
          <>
            <Arrow
              x1={xs[0]! + 3}
              y1={yc}
              x2={xs[0]! + 34}
              y2={yc}
              color={c.beamReaction}
              width={chart.strokeHeavy}
              head={10}
            />
            <Arrow
              x1={xEnd - 3}
              y1={yc}
              x2={xEnd - 34}
              y2={yc}
              color={c.beamReaction}
              width={chart.strokeHeavy}
              head={10}
            />
            <HeLabel
              x={(xs[0]! + xEnd) / 2}
              y={yc + MAX_H / 2 + 20}
              text={B.named(ax.stress, 'σ', 0)}
              color={c.beamReaction}
              w={w}
            />
          </>
        ) : null}
      </G>
    );
  }

  function captionLines(): string[] {
    const out: string[] = [];
    const named = segs.map((s) =>
      typeof s.delta === 'string' && known(s.delta) ? v(s.delta) : undefined,
    );
    if (!walls) {
      out.push(
        segs.length > 1
          ? 'Each segment stretches by δᵢ = PᵢLᵢ ÷ (AᵢE); the bar stretches by their sum.'
          : 'The rod stretches by δ = PL ÷ (AE).',
      );
      if (
        ax.total !== undefined &&
        known(ax.total) &&
        named.every((x) => x !== undefined) &&
        segs.length > 1
      )
        out.push(
          `δ = ${named.map((x) => fmt(x!)).join(' + ')} = ${fmt(v(ax.total))} ${B.unit(ax.total, lenUnit)}.`,
        );
      if (stretchKnown) out.push('The stretch is drawn bigger than life.');
    } else if (thermal) {
      out.push(
        'Free, the bar would grow δ_T = αΔTL; the walls push it back to its length, so σ = −EαΔT.',
      );
      if (known(ax.expansion)) out.push('The growth is drawn bigger than life.');
    }
    return out;
  }
}

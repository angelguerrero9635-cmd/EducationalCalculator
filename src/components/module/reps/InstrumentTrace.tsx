/**
 * `instrumentTrace` (HC55, `typesHe3e.ts`): instrument traces computed from peak lists, flat as
 * a chart: a ¹H NMR spectrum (n + 1 multiplets, the integral trace, the structure lettered), a
 * chromatogram (Gaussian peaks, tangent triangles, Δt, base widths and R), or a rigid rotor's
 * microwave lines (2B apart, Boltzmann heights). The sums are in `instrumentTraceMath.ts`.
 */
import type { ReactNode } from 'react';
import { View } from 'react-native';
import Svg, { G, Line, Path, Rect } from 'react-native-svg';

import type { InstrumentTraceSpec } from '@/data/modules/typesHe3e';
import { formatNumber } from '@/engine/format';
import { chart, usePalette, type Palette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, Caption, ChartText, useRep } from './common';
import { reader } from './graphKit';
import { fig3 } from './he1dText';
import {
  gaussian,
  hydrogensOf,
  multipletLines,
  multipletName,
  peakHeight,
  plateCount,
  resolution,
  retentionFactor,
  rotorLine,
  rotorLines,
  rotorPeakJ,
  tangentTriangle,
} from './instrumentTraceMath';
import { fitLayout, SkeletalView } from './skeletalDraw';
import { layoutMol, neighbors, parseSmiles } from './skeletalMath';

type Read = ReturnType<typeof reader>;
const LETTERS = 'abcdefghij';

/** A tick step near a quarter of the span: 1, 2 or 5 × 10ⁿ. */
function tickStep(span: number, count = 5): number {
  const raw = span / count;
  const p = 10 ** Math.floor(Math.log10(raw));
  const m = raw / p;
  return (m < 1.5 ? 1 : m < 3.5 ? 2 : m < 7.5 ? 5 : 10) * p;
}

/** Tick values from `lo` to `hi` every `step` (snapped, no float dust). */
function ticks(lo: number, hi: number, step: number): number[] {
  const out: number[] = [];
  for (let v = Math.ceil(lo / step - 1e-9) * step; v <= hi + 1e-9; v += step)
    out.push(Number(v.toPrecision(10)));
  return out;
}

/** The axis line with its ticks and numbers, and its title under them. */
function Axis({
  x0,
  x1,
  y,
  marks,
  title,
  c,
  titleDy = 34,
}: {
  x0: number;
  x1: number;
  y: number;
  marks: { x: number; text: string }[];
  title: string;
  c: Palette;
  titleDy?: number;
}) {
  return (
    <G>
      <Line x1={x0} y1={y} x2={x1} y2={y} stroke={c.chartMuted} strokeWidth={1.2} />
      {marks.map((m, i) => (
        <G key={i}>
          <Line x1={m.x} y1={y} x2={m.x} y2={y + 5} stroke={c.chartMuted} strokeWidth={1.2} />
          <ChartText
            x={m.x}
            y={y + 17}
            fontSize={chart.label}
            textAnchor="middle"
            fill={c.chartMuted}
          >
            {m.text}
          </ChartText>
        </G>
      ))}
      <ChartText
        x={(x0 + x1) / 2}
        y={y + titleDy}
        fontSize={chart.label}
        textAnchor="middle"
        fill={c.chartMuted}
      >
        {title}
      </ChartText>
    </G>
  );
}

/** A spike: a narrow peak `half` px either side of x, `height` px tall over the baseline. */
const spike = (x: number, y0: number, height: number, half = 1.6) =>
  `M ${x - half} ${y0} L ${x} ${y0 - height} L ${x + half} ${y0} Z`;

/** A horizontal double-headed bracket from x0 to x1 at y. */
function Bracket({ x0, x1, y, color }: { x0: number; x1: number; y: number; color: string }) {
  const a = Math.min(5, Math.abs(x1 - x0) / 3);
  return (
    <G>
      <Line x1={x0} y1={y} x2={x1} y2={y} stroke={color} strokeWidth={1.4} />
      <Path d={`M ${x0} ${y} l ${a} -3.5 l 0 7 z`} fill={color} />
      <Path d={`M ${x1} ${y} l ${-a} -3.5 l 0 7 z`} fill={color} />
    </G>
  );
}

export function InstrumentTrace({ spec, calc }: { spec: InstrumentTraceSpec; calc: Calculator }) {
  switch (spec.mode) {
    case 'nmr':
      return <Nmr spec={spec} calc={calc} />;
    case 'chromatogram':
      return <Chromatogram spec={spec} calc={calc} />;
    case 'rotational':
      return <Rotational spec={spec} calc={calc} />;
  }
}

// ─── NMR ─────────────────────────────────────────────────────────────────────

type NmrSpec = Extract<InstrumentTraceSpec, { mode: 'nmr' }>;

function Nmr({ spec, calc }: { spec: NmrSpec; calc: Calculator }) {
  const c = usePalette();
  const read = reader(useRep(calc));
  const opt = (x: number | string | undefined) => (x === undefined ? undefined : read(x));
  const H = opt(spec.hydrogens);
  const J = opt(spec.coupling);
  const nu0 = opt(spec.field);
  const sigs = spec.signals.map((s, i) => {
    const shift = read(s.shift);
    const n = read(s.neighbors);
    const I = opt(s.integral);
    const count = opt(s.count);
    return {
      i,
      letter: LETTERS[i] ?? String(i + 1),
      shift,
      n: Math.max(0, Math.round(n.value)),
      drawn: shift.known && n.known,
      I,
      count,
      atoms: s.atoms ?? [],
    };
  });
  const drawn = sigs.filter((s) => s.drawn);
  const integrals = sigs.filter((s) => s.I?.known);
  // ΣI only once every signal's integral is known: a partial sum would mislabel the steps.
  const allIntegrals = sigs.every((s) => s.I?.known);
  const sumI = allIntegrals ? integrals.reduce((a, s) => a + s.I!.value, 0) : 0;
  // The H each signal stands for: as typed, else worked out from H × I ÷ ΣI.
  const hOf = (s: (typeof sigs)[number]) =>
    s.count?.known
      ? s.count.text
      : H?.known && s.I?.known && sumI > 0
        ? fig3(hydrogensOf(H.value, s.I.value, sumI))
        : undefined;
  const top = Math.min(
    12,
    Math.max(5, Math.ceil(Math.max(0, ...drawn.map((s) => s.shift.value)) + 1)),
  );
  const mol = spec.smiles ? parseSmiles(spec.smiles) : undefined;
  const lay = mol && !mol.error ? layoutMol(mol, { aspect: 2.6 }) : undefined;
  const headH = lay ? 92 : 0;
  const intTop = headH + 22;
  const intH = 50;
  const peakTop = intTop + intH + 22;
  const peakH = 100;
  const y0 = peakTop + peakH;
  const height = y0 + 42;
  const trueSpacing = J?.known && nu0?.known && nu0.value > 0 ? J.value / nu0.value : undefined;
  // Lines closer than 5 px (on a 330 px axis) are drawn 5 px apart, wider than scale.
  const minSpacing = (5 * top) / 330;
  const widened = trueSpacing === undefined || trueSpacing < minSpacing;
  const spacing = widened ? minSpacing : trueSpacing;

  const art = (w: number): ReactNode => {
    const xl = 14;
    const xr = w - 14;
    const xOf = (d: number) => xl + ((top - d) / top) * (xr - xl);
    const area = (s: (typeof sigs)[number]) =>
      s.I?.known ? s.I.value : s.count?.known ? s.count.value : undefined;
    const known = drawn.map((s) => area(s)).filter((a): a is number => a !== undefined);
    const unit = known.length ? Math.max(...known) / known.length : 1;
    const multiplets = drawn.map((s) => ({
      s,
      lines: multipletLines(s.shift.value, s.n, spacing, area(s) ?? unit),
      faded: area(s) === undefined,
    }));
    const tallest = Math.max(1e-9, ...multiplets.flatMap((m) => m.lines.map((l) => l.height)));
    const hpx = (x: number) => (x / tallest) * peakH * 0.9;
    // The integral trace: left (high δ) to right, rising over each multiplet by its integral.
    const steps = multiplets
      .filter((m) => m.s.I?.known && sumI > 0)
      .sort((a, b) => b.s.shift.value - a.s.shift.value);
    let level = 0;
    let d = `M ${xl} ${intTop + intH}`;
    const stepLabels: { x: number; y: number; text: string }[] = [];
    steps.forEach((m) => {
      const xs = m.lines.map((l) => xOf(l.at));
      const xa = Math.min(...xs) - 5;
      const xb = Math.max(...xs) + 5;
      const ya = intTop + intH - level * intH;
      level += m.s.I!.value / sumI;
      const yb = intTop + intH - level * intH;
      d += ` L ${xa} ${ya}`;
      for (let k = 1; k <= 12; k++) {
        const t = k / 12;
        d += ` L ${xa + (xb - xa) * t} ${ya + (yb - ya) * (0.5 - Math.cos(Math.PI * t) / 2)}`;
      }
      const text = hOf(m.s);
      if (text) stepLabels.push({ x: (xa + xb) / 2, y: yb - 6, text: `${text} H` });
    });
    d += ` L ${xr} ${intTop + intH - level * intH}`;
    // Labels that would touch move up a row.
    stepLabels.forEach((l, k) => {
      const prev = stepLabels[k - 1];
      if (prev && Math.abs(prev.x - l.x) < 40 && Math.abs(prev.y - l.y) < 14) l.y = prev.y - 14;
    });
    const tick = top > 8 ? 2 : 1;
    const tmsNear = drawn.some((s) => s.shift.value < 0.5);

    // The structure, each signal's letter beside its atoms.
    let structure: ReactNode = null;
    if (lay) {
      const boxW = Math.min(w - 28, 260);
      const fit = fitLayout(lay, boxW, headH - 8, 34, 22, chart.label);
      const x0 = w / 2;
      const yc = 4 + (headH - 8) / 2;
      const px = (a: number): [number, number] => [
        x0 + (lay.pos[a]![0] - fit.cx) * fit.scale,
        yc - (lay.pos[a]![1] - fit.cy) * fit.scale,
      ];
      const tags = drawn.flatMap((s) =>
        s.atoms
          .filter((a) => a >= 0 && a < lay.pos.length)
          .map((a) => {
            const [ax, ay] = px(a);
            // The letter sits in the widest gap between the atom's bonds (above a lone atom;
            // a written atom's letter goes further out, past its H).
            const angs = neighbors(lay.mol, a)
              .map((o) => Math.atan2(px(o)[1] - ay, px(o)[0] - ax))
              .sort((p, q) => p - q);
            let dir = -Math.PI / 2;
            if (angs.length === 1) dir = angs[0]! + Math.PI;
            else if (angs.length > 1) {
              let best = -1;
              angs.forEach((t, k) => {
                const next = k + 1 < angs.length ? angs[k + 1]! : angs[0]! + 2 * Math.PI;
                if (next - t > best) {
                  best = next - t;
                  dir = t + (next - t) / 2;
                }
              });
            }
            const off = lay.mol.atoms[a]!.el === 'C' ? 14 : 20;
            return {
              key: `${s.letter}${a}`,
              x: ax + Math.cos(dir) * off,
              y: ay + Math.sin(dir) * off + 4,
              letter: s.letter,
            };
          }),
      );
      structure = (
        <G>
          <SkeletalView lay={lay} x0={x0} y0={yc} {...fit} font={chart.label} c={c} />
          {tags.map((t) => (
            <ChartText
              key={t.key}
              x={t.x}
              y={t.y}
              fontSize={chart.value}
              fontWeight="700"
              fontStyle="italic"
              textAnchor="middle"
              fill={c.traceLit}
              halo
            >
              {t.letter}
            </ChartText>
          ))}
        </G>
      );
    }

    return (
      <Svg width={w} height={height}>
        {structure}
        {steps.length ? (
          <G>
            <Path d={d} fill="none" stroke={c.traceIntegral} strokeWidth={chart.stroke} />
            {stepLabels.map((l, k) => (
              <ChartText
                key={k}
                x={l.x}
                y={l.y}
                fontSize={chart.label}
                fontWeight="700"
                textAnchor="middle"
                fill={c.traceIntegral}
              >
                {l.text}
              </ChartText>
            ))}
          </G>
        ) : null}
        <Line x1={xl} y1={y0} x2={xr} y2={y0} stroke={c.traceSignal} strokeWidth={1.4} />
        {/* TMS, the reference at δ 0. */}
        <Path d={spike(xOf(0), y0, peakH * 0.3)} fill={c.traceSignal} />
        {tmsNear ? null : (
          <ChartText
            x={xOf(0) - 4}
            y={y0 - peakH * 0.3 - 5}
            fontSize={chart.label}
            textAnchor="end"
            fill={c.chartMuted}
          >
            TMS
          </ChartText>
        )}
        {multiplets.map((m) => {
          const tallestLine = Math.max(...m.lines.map((l) => hpx(l.height)));
          return (
            <G key={m.s.i} opacity={m.faded ? 0.4 : 1}>
              {m.lines.map((l, k) => (
                <Path key={k} d={spike(xOf(l.at), y0, hpx(l.height))} fill={c.traceSignal} />
              ))}
              <ChartText
                x={xOf(m.s.shift.value)}
                y={y0 - tallestLine - 6}
                fontSize={chart.value}
                fontWeight="700"
                fontStyle="italic"
                textAnchor="middle"
                fill={c.traceLit}
              >
                {m.s.letter}
              </ChartText>
            </G>
          );
        })}
        <Axis
          x0={xl}
          x1={xr}
          y={y0}
          c={c}
          marks={ticks(0, top, tick).map((v) => ({ x: xOf(v), text: formatNumber(v) }))}
          title="Chemical shift δ (ppm) ←"
        />
      </Svg>
    );
  };

  const words = drawn.map((s) => {
    const h = hOf(s);
    return `${s.letter}: δ ${s.shift.text}, ${multipletName(s.n)} (${s.n} neighboring H)${h ? `, ${h} H` : ''}`;
  });
  const widest = Math.max(0, ...drawn.map((s) => s.n));
  return (
    <View>
      <Canvas aspect={(w) => height / w}>{({ w }) => art(w)}</Canvas>
      <Caption>
        {drawn.length
          ? [
              spec.name ? `${spec.name}.` : undefined,
              `${words.join('; ')}.`,
              'Each signal splits into n + 1 lines with heights from Pascal’s triangle.',
              integrals.length && sumI > 0
                ? H?.known
                  ? `H per signal = ${H.text} × I ÷ ${fig3(sumI)} (the integrals add to ${fig3(sumI)}).`
                  : `The integral trace rises by each integral; the integrals add to ${fig3(sumI)}.`
                : undefined,
              J?.known && nu0?.known && widest > 0
                ? `J = ${J.text} Hz: a ${multipletName(widest)} is ${widest} × ${J.text} = ${fig3(widest * J.value)} Hz wide, ${fig3((widest * J.value) / nu0.value)} ppm at ${nu0.text} MHz.`
                : undefined,
              widened && widest > 0
                ? 'The lines of each multiplet are drawn wider apart than scale.'
                : undefined,
            ]
              .filter(Boolean)
              .join(' · ')
          : 'Type each signal’s shift and neighbors.'}
      </Caption>
    </View>
  );
}

// ─── Chromatogram ────────────────────────────────────────────────────────────

type ChromSpec = Extract<InstrumentTraceSpec, { mode: 'chromatogram' }>;

function Chromatogram({ spec, calc }: { spec: ChromSpec; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  const read: Read = reader(rep);
  const tM = read(spec.dead);
  const unit = typeof spec.dead === 'string' ? (rep.unit(spec.dead) ?? 'min') : 'min';
  const peaks = spec.peaks.map((p, i) => {
    const t = read(p.time);
    const wd = read(p.width);
    return { i, t, wd, name: p.name, on: t.known && wd.known && wd.value > 0 };
  });
  const on = peaks.filter((p) => p.on);
  const [p1, p2] = peaks;
  const pair = p1?.on && p2?.on ? ([p1, p2] as const) : undefined;
  const R = pair
    ? resolution(pair[0].t.value, pair[1].t.value, pair[0].wd.value, pair[1].wd.value)
    : undefined;
  const lo = on.length ? Math.min(...on.map((p) => p.t.value - p.wd.value)) : 0;
  const hi = on.length
    ? Math.max(...on.map((p) => p.t.value + p.wd.value))
    : tM.known
      ? tM.value * 2
      : 1;
  // Peaks far past t_M break the axis: t_M on a short stretch at the left, the peaks beyond.
  const broken = tM.known && on.length > 0 && lo - tM.value > 0.45 * hi;
  const twoRows = on.length > 1;
  const height = 196 + (twoRows ? 110 : 80);
  const y0 = 196;
  const plotTop = 64;

  const art = (w: number): ReactNode => {
    const xl = 16;
    const xr = w - 16;
    const aEnd = broken ? xl + (xr - xl) * 0.2 : xr;
    const bStart = broken ? aEnd + 16 : xl;
    const aRange: [number, number] = broken ? [0, tM.value * 1.6] : [0, hi * 1.05];
    const pad = (hi - lo) * 0.12;
    const bRange: [number, number] = broken ? [lo - pad, hi + pad] : aRange;
    const xOf = (t: number) =>
      broken && t > aRange[1]
        ? bStart + ((t - bRange[0]) / (bRange[1] - bRange[0])) * (xr - bStart)
        : xl + ((t - aRange[0]) / (aRange[1] - aRange[0])) * (aEnd - xl);
    const sumAt = (t: number) => on.reduce((s, p) => s + gaussian(t, p.t.value, p.wd.value), 0);
    const tallest = Math.max(1e-9, ...on.map((p) => peakHeight(p.wd.value)));
    const scale = ((y0 - plotTop) * 0.72) / tallest;
    const yOf = (v: number) => y0 - v * scale;
    // The trace across the peaks' stretch (sampled every 1.5 px).
    const [ta, tb] = broken ? bRange : aRange;
    const xa = xOf(ta);
    const xb = xOf(tb);
    const nS = Math.max(40, Math.round((xb - xa) / 1.5));
    const tOfX = (x: number) => ta + ((x - xa) / (xb - xa)) * (tb - ta);
    const path = (f: (t: number) => number) =>
      Array.from({ length: nS + 1 }, (_, k) => {
        const x = xa + ((xb - xa) * k) / nS;
        return `${k === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${yOf(f(tOfX(x))).toFixed(2)}`;
      }).join(' ');
    const fills = [c.traceFillA, c.traceFillB];
    const marks = broken
      ? [
          { x: xOf(0), text: '0' },
          ...ticks(bRange[0], bRange[1], tickStep(bRange[1] - bRange[0], 4)).map((v) => ({
            x: xOf(v),
            text: formatNumber(v),
          })),
        ]
      : ticks(0, aRange[1], tickStep(aRange[1], 5)).map((v) => ({
          x: xOf(v),
          text: formatNumber(v),
        }));
    // Peak labels above each triangle's apex; a label that would touch the last moves up.
    const labels = on.map((p) => {
      const apex = tangentTriangle(p.t.value, p.wd.value, peakHeight(p.wd.value)).apex;
      return { p, x: xOf(p.t.value), y: yOf(apex) - 6, text: `t_${p.i + 1} = ${p.t.text}` };
    });
    labels.forEach((l, k) => {
      const prev = labels[k - 1];
      if (prev && Math.abs(prev.x - l.x) < 74 && Math.abs(prev.y - l.y) < 15)
        l.y = Math.min(l.y, prev.y) - 15;
    });
    // Base widths under the axis numbers; a label that would touch the last drops a row.
    const wRow = y0 + 28;
    const wLabels = on.map((p) => {
      const [a, b] = [xOf(p.t.value - p.wd.value / 2), xOf(p.t.value + p.wd.value / 2)];
      return { p, a, b, x: (a + b) / 2, row: 0 };
    });
    wLabels.forEach((l, k) => {
      const prev = wLabels[k - 1];
      if (prev && prev.row === 0 && Math.abs(prev.x - l.x) < 80) l.row = 1;
    });
    return (
      <Svg width={w} height={height}>
        {on.map((p) => (
          <Path
            key={`f${p.i}`}
            d={`${path((t) => gaussian(t, p.t.value, p.wd.value))} L ${xb} ${y0} L ${xa} ${y0} Z`}
            fill={fills[p.i % 2]}
            opacity={0.75}
          />
        ))}
        {on.map((p) => {
          const tri = tangentTriangle(p.t.value, p.wd.value, peakHeight(p.wd.value));
          return (
            <Path
              key={`t${p.i}`}
              d={`M ${xOf(tri.left)} ${y0} L ${xOf(p.t.value)} ${yOf(tri.apex)} L ${xOf(tri.right)} ${y0}`}
              fill="none"
              stroke={c.chartMuted}
              strokeWidth={1.2}
              strokeDasharray={chart.dashFine}
            />
          );
        })}
        {on.length ? (
          <Path d={path(sumAt)} fill="none" stroke={c.traceSignal} strokeWidth={chart.stroke} />
        ) : null}
        {/* The baseline, broken between t_M and the peaks. */}
        <Line x1={xl} y1={y0} x2={aEnd} y2={y0} stroke={c.traceSignal} strokeWidth={1.4} />
        {broken ? (
          <G>
            <Line
              x1={xOf(bRange[0])}
              y1={y0}
              x2={xr}
              y2={y0}
              stroke={c.traceSignal}
              strokeWidth={1.4}
            />
            <Path
              d={`M ${aEnd + 3} ${y0 + 6} l 4 -12 M ${bStart - 7} ${y0 + 6} l 4 -12`}
              stroke={c.chartMuted}
              strokeWidth={1.4}
            />
          </G>
        ) : null}
        {/* The dead time: an unretained blip. */}
        {tM.known ? (
          <G>
            <Path d={spike(xOf(tM.value), y0, 22, 2.5)} fill={c.traceSignal} />
            <ChartText
              x={xOf(tM.value)}
              y={y0 - 28}
              fontSize={chart.label}
              fontWeight="700"
              textAnchor="middle"
            >
              t_M
            </ChartText>
          </G>
        ) : null}
        {labels.map((l) => (
          <ChartText
            key={`l${l.p.i}`}
            x={l.x}
            y={l.y}
            fontSize={chart.label}
            fontWeight="700"
            textAnchor="middle"
            halo
          >
            {l.text}
          </ChartText>
        ))}
        {/* Δt between the first two peaks, and R. */}
        {pair && R !== undefined ? (
          <G>
            <Bracket
              x0={xOf(pair[0].t.value)}
              x1={xOf(pair[1].t.value)}
              y={30}
              color={c.traceLit}
            />
            <ChartText
              x={Math.min(w - 90, Math.max(90, (xOf(pair[0].t.value) + xOf(pair[1].t.value)) / 2))}
              y={20}
              fontSize={chart.label}
              fontWeight="700"
              textAnchor="middle"
              fill={c.traceLit}
            >
              {`Δt = ${fig3(pair[1].t.value - pair[0].t.value)} ${unit} · R = ${fig3(R)}`}
            </ChartText>
          </G>
        ) : null}
        {/* Base widths, bracketed under the baseline. */}
        {wLabels.map(({ p, a, b, x, row }) => (
          <G key={`w${p.i}`}>
            <Bracket x0={a} x1={b} y={wRow + row * 30} color={c.chartInk} />
            <ChartText x={x} y={wRow + row * 30 + 15} fontSize={chart.label} textAnchor="middle">
              {`w_${p.i + 1} = ${p.wd.text}`}
            </ChartText>
          </G>
        ))}
        <Axis
          x0={xl}
          x1={xr}
          y={y0}
          c={c}
          marks={marks}
          title={`Time (${unit})`}
          titleDy={wLabels.some((l) => l.row) ? 102 : 72}
        />
      </Svg>
    );
  };

  const ks = tM.known && tM.value > 0 ? on.map((p) => retentionFactor(p.t.value, tM.value)) : [];
  return (
    <View>
      <Canvas aspect={(w) => height / w}>{({ w }) => art(w)}</Canvas>
      <Caption>
        {pair && R !== undefined
          ? [
              `R = 2Δt ÷ (w₁ + w₂) = 2 × ${fig3(pair[1].t.value - pair[0].t.value)} ÷ (${pair[0].wd.text} + ${pair[1].wd.text}) = ${fig3(R)}: ${R >= 1.5 ? 'separated to the baseline' : 'the peaks overlap (R under 1.5)'}.`,
              ks.length >= 2
                ? `k = (t − t_M) ÷ t_M = ${ks.map((k) => fig3(k)).join(' and ')}; α = k₂ ÷ k₁ = ${fig3(ks[1]! / ks[0]!)}.`
                : undefined,
              `N = 16(t₂ ÷ w₂)² = ${fig3(plateCount(pair[1].t.value, pair[1].wd.value))} plates.`,
              'The dashed tangents of each peak meet the baseline one base width w apart.',
            ]
              .filter(Boolean)
              .join(' · ')
          : 'Type the dead time and each peak’s retention time and base width.'}
      </Caption>
    </View>
  );
}

// ─── Rotational ──────────────────────────────────────────────────────────────

type RotSpec = Extract<InstrumentTraceSpec, { mode: 'rotational' }>;

function Rotational({ spec, calc }: { spec: RotSpec; calc: Calculator }) {
  const c = usePalette();
  const read = reader(useRep(calc));
  const Br = read(spec.constant);
  const Tr = spec.temperature === undefined ? undefined : read(spec.temperature);
  const T = Tr ? Tr.value : 298.15;
  const Jr = spec.lower === undefined ? undefined : read(spec.lower);
  const B = Br.value;
  const known = Br.known && B > 0 && (Tr?.known ?? true) && T > 0;
  const lines = known ? rotorLines(B, T) : [];
  const lit = Jr?.known ? Math.round(Jr.value) : undefined;
  const peakJ = known ? rotorPeakJ(B, T) : 0;
  const height = 262;
  const y0 = 190;
  const plotTop = 84;

  const art = (w: number): ReactNode => {
    const xl = 16;
    const xr = w - 16;
    const last = lines.length ? lines[lines.length - 1]!.at : 100;
    const litAt = lit !== undefined && known ? rotorLine(B, lit) : undefined;
    const end = Math.max(last, litAt ?? 0) + 2 * B;
    const xOf = (v: number) => xl + (v / end) * (xr - xl);
    const hOf = (x: number) => x * (y0 - plotTop);
    const gap = known ? xOf(2 * B) - xOf(0) : 0;
    // Under each line its lower J, every line or every other as room allows.
    const every = gap >= 16 ? 1 : gap >= 8 ? 2 : 5;
    // The 2B bracket over the strongest pair, away from the lit line.
    let j = peakJ;
    if (lit !== undefined && Math.abs(j - lit) <= 1)
      j = lit + 2 < lines.length - 1 ? lit + 2 : Math.max(0, lit - 3);
    const pairLines = [lines[j], lines[j + 1]];
    const bracketY =
      pairLines[0] && pairLines[1]
        ? y0 - Math.max(hOf(pairLines[0].height), hOf(pairLines[1].height)) - 12
        : 0;
    const litH = litAt !== undefined ? hOf(lit! < lines.length ? lines[lit!]!.height : 0) : 0;
    // The lit line's two labels sit over it, above the 2B bracket where they would meet it.
    const litX = litAt !== undefined ? xOf(litAt) : 0;
    const litStart = litX < w / 2;
    const span: [number, number] = litStart ? [litX, litX + 90] : [litX - 90, litX];
    let litY = y0 - litH - 8;
    if (pairLines[0] && pairLines[1]) {
      const [b0, b1] = [xOf(pairLines[0].at) - 50, xOf(pairLines[1].at) + 50];
      if (b0 < span[1] && b1 > span[0]) litY = Math.min(litY, bracketY - 26);
    }
    return (
      <Svg width={w} height={height}>
        {lines.map((l) => (
          <Rect
            key={l.J}
            x={xOf(l.at) - 1.2}
            y={y0 - hOf(l.height)}
            width={2.4}
            height={hOf(l.height)}
            fill={l.J === lit ? c.traceLit : c.traceSignal}
          />
        ))}
        {lines
          .filter((l) => l.J % every === 0)
          .map((l) => (
            <ChartText
              key={`j${l.J}`}
              x={xOf(l.at)}
              y={y0 + 14}
              fontSize={chart.label}
              textAnchor="middle"
              fill={l.J === lit ? c.traceLit : c.chartMuted}
            >
              {String(l.J)}
            </ChartText>
          ))}
        {lines.length && xOf(lines[0]!.at) > xl + 16 ? (
          <ChartText x={xl} y={y0 + 14} fontSize={chart.label} fill={c.chartMuted}>
            J
          </ChartText>
        ) : null}
        {pairLines[0] && pairLines[1] ? (
          <G>
            <Bracket
              x0={xOf(pairLines[0].at)}
              x1={xOf(pairLines[1].at)}
              y={bracketY}
              color={c.chartInk}
            />
            <ChartText
              x={Math.min(xr - 50, Math.max(xl + 50, xOf((pairLines[0].at + pairLines[1].at) / 2)))}
              y={bracketY - 8}
              fontSize={chart.label}
              fontWeight="700"
              textAnchor="middle"
              halo
            >
              {`2B = ${fig3(2 * B)} cm⁻¹`}
            </ChartText>
          </G>
        ) : null}
        {litAt !== undefined ? (
          <G>
            <ChartText
              x={litX}
              y={litY - 14}
              fontSize={chart.label}
              fontWeight="700"
              textAnchor={litStart ? 'start' : 'end'}
              fill={c.traceLit}
              halo
            >
              {`J = ${lit} → ${lit! + 1}`}
            </ChartText>
            <ChartText
              x={litX}
              y={litY}
              fontSize={chart.label}
              fontWeight="700"
              textAnchor={litStart ? 'start' : 'end'}
              fill={c.traceLit}
              halo
            >
              {`${fig3(litAt)} cm⁻¹`}
            </ChartText>
          </G>
        ) : null}
        <Line x1={xl} y1={y0} x2={xr} y2={y0} stroke={c.traceSignal} strokeWidth={1.4} />
        <Axis
          x0={xl}
          x1={xr}
          y={y0 + 18}
          c={c}
          marks={ticks(0, end, tickStep(end, 5)).map((v) => ({ x: xOf(v), text: formatNumber(v) }))}
          title="Wavenumber (cm⁻¹); lower level J over the axis"
        />
      </Svg>
    );
  };

  return (
    <View>
      <Canvas aspect={(w) => height / w}>{({ w }) => art(w)}</Canvas>
      <Caption>
        {known
          ? [
              `${spec.name ? `${spec.name}: lines` : 'Lines'} at ν̃ = 2B(J + 1), 2B = 2 × ${Br.text} = ${fig3(2 * B)} cm⁻¹ apart.`,
              `Heights follow the lower level’s share, (2J + 1)e^(−1.4388BJ(J + 1) ÷ T) at ${Tr ? Tr.text : '298.15'} K: the strongest line starts at J = ${peakJ}.`,
              lit !== undefined
                ? `Lit: J = ${lit} → ${lit + 1} at 2 × ${Br.text} × ${lit + 1} = ${fig3(rotorLine(B, lit))} cm⁻¹.`
                : undefined,
            ]
              .filter(Boolean)
              .join(' · ')
          : 'Type the rotational constant B.'}
      </Caption>
    </View>
  );
}

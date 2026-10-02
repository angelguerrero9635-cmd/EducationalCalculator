/**
 * Stem plots of discrete-time signals (HC63, `stemPlot`; EC-P9), flat. `cosine`: cos(2πkn ÷ N)
 * over two periods with the continuous cosine faint through the samples and the period
 * bracketed. `recursive`: the unit step into y[n] = αy[n − 1] + x[n], y[n] lit, the final value
 * dashed. `convolve`: x[k], then h[n − k] flipped and shifted under it, then their products
 * (which add to y[n]), then all of y with y[n] lit. `sampled`: a tone, its samples at f_s and the
 * alias tone dashed through every sample. A "?" draws nothing for its value.
 */
import Svg, { Circle, G, Line, Path } from 'react-native-svg';

import type { StemPlotSpec } from '@/data/modules/typesHe3k';
import { formatNumber } from '@/engine/format';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, Caption, ChartText, useRep } from './common';
import { aliasOf, convolveAt, cosinePeriod, sampleSpan, stepResponse } from './he3kMath';

const LABEL = chart.label;
const fig = (x: number) => formatNumber(Number(x.toPrecision(4)));
/** A number inside a sum: a negative one in brackets, 2 × (−2). */
const term = (x: number) => (x < 0 ? `(${fig(x)})` : fig(x));

type Stem = { n: number; v: number | undefined; lit?: boolean; faint?: boolean };

export function StemPlot({ spec, calc }: { spec: StemPlotSpec; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  const num = (x: string | number | undefined) =>
    x === undefined ? undefined : typeof x === 'number' ? x : rep.known(x) ? rep.val(x) : undefined;
  const sv = (x: string | number | undefined) =>
    x === undefined
      ? '?'
      : typeof x === 'number'
        ? fig(x)
        : rep.known(x)
          ? `${fig(rep.shown(x))}${rep.unit(x) ? ` ${rep.unit(x)}` : ''}`
          : '?';
  const conv = spec.convolve;
  const height = conv ? 380 : spec.sampled ? 250 : 230;

  /**
   * One strip of stems on its own zero line: `ns` columns from `lo` to `hi`, values scaled to the
   * strip's largest. Returns the drawing; `curve` adds a continuous line in the same scale.
   */
  function strip(o: {
    key: string;
    x0: number;
    x1: number;
    top: number;
    bottom: number;
    lo: number;
    hi: number;
    stems: Stem[];
    title?: string;
    vmax?: number;
    ticks?: boolean;
    curves?: { d: [number, number][]; dashed?: boolean; color: string; width?: number }[];
    level?: { v: number; text: string };
  }) {
    const vmax =
      o.vmax ??
      Math.max(1e-9, ...o.stems.map((s) => Math.abs(s.v ?? 0)), Math.abs(o.level?.v ?? 0));
    const anyNeg = o.stems.some((s) => (s.v ?? 0) < 0) || (o.curves?.length ?? 0) > 0;
    const zero = anyNeg ? (o.top + o.bottom) / 2 : o.bottom;
    const amp = anyNeg ? (o.bottom - o.top) / 2 : o.bottom - o.top;
    const X = (n: number) => o.x0 + ((n - o.lo) / Math.max(1, o.hi - o.lo)) * (o.x1 - o.x0);
    const Y = (v: number) => zero - (v / vmax) * amp * 0.92;
    const tickStep = o.hi - o.lo > 16 ? 4 : o.hi - o.lo > 10 ? 2 : 1;
    return (
      <G key={o.key}>
        {o.title ? (
          <ChartText x={4} y={o.top - 4} fontSize={LABEL} fontWeight="700">
            {o.title}
          </ChartText>
        ) : null}
        <Line
          x1={o.x0 - 6}
          x2={o.x1 + 6}
          y1={zero}
          y2={zero}
          stroke={c.chartInk}
          strokeWidth={1.2}
        />
        {o.level ? (
          <G>
            <Line
              x1={o.x0 - 6}
              x2={o.x1 + 6}
              y1={Y(o.level.v)}
              y2={Y(o.level.v)}
              stroke={c.chartMuted}
              strokeWidth={1.3}
              strokeDasharray={chart.dash}
            />
            <ChartText
              x={o.x1 + 6}
              y={o.top - 10}
              fontSize={LABEL}
              textAnchor="end"
              fill={c.chartMuted}
            >
              {o.level.text}
            </ChartText>
          </G>
        ) : null}
        {(o.curves ?? []).map((cv, i) => (
          <Path
            key={`cv${i}`}
            d={cv.d
              .map(([n, v], k) => `${k ? 'L' : 'M'} ${X(n).toFixed(1)} ${Y(v).toFixed(1)}`)
              .join(' ')}
            fill="none"
            stroke={cv.color}
            strokeWidth={cv.width ?? 1.3}
            strokeDasharray={cv.dashed ? chart.dash : undefined}
          />
        ))}
        {o.stems.map((s) =>
          s.v === undefined ? null : (
            <G key={`s${s.n}`} opacity={s.faint ? 0.45 : 1}>
              <Line
                x1={X(s.n)}
                x2={X(s.n)}
                y1={zero}
                y2={Y(s.v)}
                stroke={s.lit ? c.chartHighlight : c.chartInk}
                strokeWidth={s.lit ? 2.4 : 1.6}
              />
              <Circle
                cx={X(s.n)}
                cy={Y(s.v)}
                r={s.lit ? 4.5 : 3.5}
                fill={s.lit ? c.chartHighlight : c.background}
                stroke={s.lit ? c.chartHighlight : c.chartInk}
                strokeWidth={1.6}
              />
            </G>
          ),
        )}
        {o.ticks !== false
          ? Array.from({ length: o.hi - o.lo + 1 }, (_, i) => o.lo + i)
              .filter((n) => (n - o.lo) % tickStep === 0)
              .map((n) => (
                <ChartText
                  key={`t${n}`}
                  x={X(n)}
                  y={o.bottom + 15}
                  fontSize={LABEL}
                  textAnchor="middle"
                  fill={c.chartMuted}
                >
                  {String(n).replace('-', '−')}
                </ChartText>
              ))
          : null}
      </G>
    );
  }

  return (
    <>
      <Canvas aspect={(w) => height / w}>
        {({ w, h }) => {
          const x0 = 22;
          const x1 = w - 16;
          return (
            <Svg width={w} height={h}>
              {spec.cosine ? cosineView(x0, x1) : null}
              {spec.recursive ? recursiveView(x0, x1) : null}
              {conv ? convolveView(x0, x1) : null}
              {spec.sampled ? sampledView(x0, x1, w) : null}
            </Svg>
          );
        }}
      </Canvas>
      <Caption>{captionOf()}</Caption>
    </>
  );

  function cosineView(x0: number, x1: number) {
    const [k, N] = [num(spec.cosine!.k), num(spec.cosine!.N)];
    if (k === undefined || N === undefined || N < 1) return null;
    const P = cosinePeriod(k, N);
    const span = Math.min(32, 2 * P);
    const stems: Stem[] = Array.from({ length: span }, (_, n) => ({
      n,
      v: Math.cos((2 * Math.PI * k * n) / N),
      lit: n < P,
    }));
    const curve = Array.from({ length: 401 }, (_, i) => {
      const t = ((span - 1) * i) / 400;
      return [t, Math.cos((2 * Math.PI * k * t) / N)] as [number, number];
    });
    const top = 64;
    const bottom = 196;
    const X = (n: number) => x0 + (n / Math.max(1, span - 1)) * (x1 - x0);
    return (
      <G>
        <ChartText x={4} y={16} fontSize={LABEL} fontWeight="700">
          {`x[n] = cos(2π × ${fig(k)}n ÷ ${fig(N)})`}
        </ChartText>
        {/* The period, bracketed over the first P samples. */}
        <Line x1={X(0)} x2={X(P)} y1={36} y2={36} stroke={c.chartHighlight} strokeWidth={1.8} />
        <Line x1={X(0)} x2={X(0)} y1={30} y2={42} stroke={c.chartHighlight} strokeWidth={1.8} />
        <Line x1={X(P)} x2={X(P)} y1={30} y2={42} stroke={c.chartHighlight} strokeWidth={1.8} />
        <ChartText
          x={(X(0) + X(P)) / 2}
          y={30}
          fontSize={LABEL}
          fontWeight="700"
          textAnchor="middle"
          halo
        >
          {`period ${P} samples`}
        </ChartText>
        {strip({
          key: 'cos',
          x0,
          x1,
          top,
          bottom,
          lo: 0,
          hi: span - 1,
          stems,
          vmax: 1,
          curves: [{ d: curve, color: c.chartMuted, dashed: true, width: 1 }],
        })}
      </G>
    );
  }

  function recursiveView(x0: number, x1: number) {
    const r = spec.recursive!;
    const [alpha, n] = [num(r.alpha), num(r.n)];
    if (alpha === undefined) return null;
    const M = Math.min(24, Math.max(10, (n ?? 0) + 4));
    const stems: Stem[] = Array.from({ length: M + 1 }, (_, m) => ({
      n: m,
      v: stepResponse(alpha, m),
      lit: n !== undefined && m === Math.round(n),
    }));
    const settles = Math.abs(alpha) < 1;
    const fin = settles ? 1 / (1 - alpha) : undefined;
    return (
      <G>
        <ChartText x={4} y={16} fontSize={LABEL} fontWeight="700">
          {`y[n] = ${fig(alpha)}y[n − 1] + u[n]`}
        </ChartText>
        {n !== undefined ? (
          <ChartText
            x={x1}
            y={16}
            fontSize={LABEL}
            textAnchor="end"
            fill={c.chartHighlight}
            fontWeight="700"
          >
            {`y[${Math.round(n)}] = ${fig(stepResponse(alpha, Math.round(n)))}`}
          </ChartText>
        ) : null}
        {strip({
          key: 'rec',
          x0,
          x1,
          top: 58,
          bottom: 196,
          lo: 0,
          hi: M,
          stems,
          ...(fin !== undefined
            ? { level: { v: fin, text: `dashed: final value ${fig(fin)}` } }
            : {}),
        })}
      </G>
    );
  }

  function convolveView(x0: number, x1: number) {
    const xs = conv!.x.map(num);
    const hs = conv!.h.map(num);
    const n = num(conv!.n);
    const known = xs.every((v) => v !== undefined) && hs.every((v) => v !== undefined);
    const lo = -(hs.length - 1);
    const hi = xs.length + hs.length - 2;
    const at = n === undefined ? undefined : Math.round(n);
    const xv = xs.map((v) => v ?? 0);
    const hv = hs.map((v) => v ?? 0);
    const res = at === undefined ? undefined : convolveAt(xv, hv, at);
    const ys = Array.from(
      { length: xs.length + hs.length - 1 },
      (_, m) => convolveAt(xv, hv, m).sum,
    );
    const cols = Array.from({ length: hi - lo + 1 }, (_, i) => lo + i);
    const xStems: Stem[] = cols.map((k) => ({
      n: k,
      v: k >= 0 && k < xs.length ? xs[k] : 0,
      faint: !(k >= 0 && k < xs.length),
    }));
    const hStems: Stem[] = cols.map((k) => {
      const j = at === undefined ? -1 : at - k;
      return { n: k, v: j >= 0 && j < hs.length ? hs[j] : 0, faint: !(j >= 0 && j < hs.length) };
    });
    const pStems: Stem[] = cols.map((k) => {
      const t = res?.terms.find((p) => p.k === k);
      return { n: k, v: t ? t.x * t.h : 0, lit: !!t && t.h !== 0, faint: !t || t.h === 0 };
    });
    const yStems: Stem[] = cols.map((m) => ({
      n: m,
      v: m < 0 || m >= ys.length ? 0 : conv!.ys ? num(conv!.ys[m]) : known ? ys[m] : undefined,
      lit: m === at,
      faint: !(m >= 0 && m < ys.length),
    }));
    const vmax = Math.max(1e-9, ...xv.map(Math.abs), ...hv.map(Math.abs));
    const rows: [string, Stem[], number | undefined][] = [
      ['x[k]', xStems, vmax],
      [at === undefined ? 'h[n − k]' : `h[${at} − k], flipped and shifted`, hStems, vmax],
      [`x[k] h[${at ?? 'n'} − k]: add to ${res && known ? fig(res.sum) : '?'}`, pStems, undefined],
      ['y[n] = Σ x[k] h[n − k]', yStems, undefined],
    ];
    return (
      <G>
        {rows.map(([title, stems, vm], i) =>
          strip({
            key: `r${i}`,
            x0,
            x1,
            top: 20 + i * 92,
            bottom: 20 + i * 92 + 56,
            lo,
            hi,
            stems,
            title,
            ...(vm !== undefined ? { vmax: vm } : {}),
          }),
        )}
      </G>
    );
  }

  function sampledView(x0: number, x1: number, w: number) {
    const s = spec.sampled!;
    const [f, fs] = [num(s.f), num(s.fs)];
    if (f === undefined || fs === undefined || fs <= 0) return null;
    const fa = aliasOf(f, fs);
    const Ns = sampleSpan(f, fs);
    // Time in sampling periods: sample n is at t = n.
    const pts = Math.min(1600, Math.max(400, Math.ceil((f / fs) * Ns * 24)));
    const tone = Array.from({ length: pts + 1 }, (_, i) => {
      const t = (Ns * i) / pts;
      return [t, Math.cos((2 * Math.PI * f * t) / fs)] as [number, number];
    });
    const alias = Array.from({ length: 401 }, (_, i) => {
      const t = (Ns * i) / 400;
      return [t, Math.cos((2 * Math.PI * fa * t) / fs)] as [number, number];
    });
    const stems: Stem[] = Array.from({ length: Ns + 1 }, (_, n) => ({
      n,
      v: Math.cos((2 * Math.PI * f * n) / fs),
      lit: true,
    }));
    const unit = typeof s.f === 'string' ? (rep.unit(s.f) ?? '') : '';
    // Below f_s ÷ 2 the alias is the tone itself: one curve, no alias drawn.
    const aliased = Math.abs(fa - f) > 1e-9;
    const key = [
      { dash: undefined, color: c.chartMuted, text: `tone ${fig(f)} ${unit}` },
      ...(aliased
        ? [{ dash: chart.dash, color: c.chartSecond, text: `alias ${fig(fa)} ${unit}` }]
        : []),
    ];
    const keyY = 222;
    return (
      <G>
        <ChartText x={4} y={16} fontSize={LABEL} fontWeight="700">
          {`Sampled at f_s = ${fig(fs)} ${unit}`.trim()}
        </ChartText>
        {strip({
          key: 'smp',
          x0,
          x1,
          top: 32,
          bottom: 186,
          lo: 0,
          hi: Ns,
          stems,
          vmax: 1,
          ticks: true,
          curves: [
            { d: tone, color: c.chartMuted, width: aliased ? 1 : 1.6 },
            ...(aliased ? [{ d: alias, color: c.chartSecond, dashed: true, width: 2.2 }] : []),
          ],
        })}
        <ChartText x={w - 4} y={186 + 30} fontSize={LABEL} textAnchor="end" fill={c.chartMuted}>
          n
        </ChartText>
        {key.map((k, i) => {
          const x = 8 + i * 150;
          return (
            <G key={k.text}>
              <Line
                x1={x}
                x2={x + 22}
                y1={keyY + 8}
                y2={keyY + 8}
                stroke={k.color}
                strokeWidth={2}
                strokeDasharray={k.dash}
              />
              <ChartText x={x + 28} y={keyY + 12} fontSize={LABEL}>
                {k.text}
              </ChartText>
            </G>
          );
        })}
      </G>
    );
  }

  function captionOf() {
    if (spec.cosine) {
      const [k, N] = [num(spec.cosine.k), num(spec.cosine.N)];
      if (k === undefined || N === undefined) return 'Ω₀ = 2πk ÷ N: type k and N.';
      const g = Math.round(N) / cosinePeriod(k, N);
      return `k ÷ N = ${fig(k)} ÷ ${fig(N)}${g > 1 ? ` = ${fig(k / g)} ÷ ${fig(N / g)}` : ''} in lowest terms · Period: ${sv(spec.cosine.period ?? cosinePeriod(k, N))}`;
    }
    if (spec.recursive) {
      const r = spec.recursive;
      const alpha = num(r.alpha);
      const a = alpha === undefined ? '?' : term(alpha);
      const lines = [`y[${sv(r.n)}] = (1 − ${a}^(${sv(r.n)} + 1)) ÷ (1 − ${a}) = ${sv(r.y)}`];
      if (alpha !== undefined && Math.abs(alpha) >= 1)
        lines.push('With |α| ≥ 1 the output never settles: no final value.');
      else if (r.final !== undefined) lines.push(`Final value: 1 ÷ (1 − ${a}) = ${sv(r.final)}`);
      return lines.join(' · ');
    }
    if (conv) {
      const n = num(conv.n);
      if (n === undefined) return 'Choose n to slide h across x.';
      const xs = conv.x.map((x) => num(x) ?? NaN);
      const hs = conv.h.map((x) => num(x) ?? NaN);
      const res = convolveAt(xs, hs, Math.round(n));
      const parts = res.terms.filter((t) => t.h !== 0).map((t) => `${term(t.x)} × ${term(t.h)}`);
      const yId = conv.y ?? conv.ys?.[Math.round(n)];
      return `y[${Math.round(n)}] = ${parts.length ? parts.join(' + ') : '0'} = ${sv(yId)}`;
    }
    const s = spec.sampled!;
    const [f, fs] = [num(s.f), num(s.fs)];
    if (f === undefined || fs === undefined) return 'Type the tone and the sampling rate.';
    return f <= fs / 2
      ? `f = ${sv(s.f)} is below f_s ÷ 2: no alias; the samples show the tone itself.`.replace(
          'f_s',
          'fₛ',
        )
      : `Alias: |${sv(s.f).split(' ')[0]} − ${sv(s.fs).split(' ')[0]} × ${Math.round(f / fs)}| = ${sv(s.alias ?? aliasOf(f, fs))}`;
  }
}

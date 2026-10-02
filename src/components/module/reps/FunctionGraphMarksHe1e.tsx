/**
 * HC10 and HC12 (college round 1, group E): what `functionGraph` draws for the families hill,
 * bateman, erfc, levenspiel and equalArea, the repeated dose, and the regions (area, signed,
 * between, strip, level, accumulation). Called from FunctionGraph's drawing with its scale: the
 * points, dashed lines and labels go into the graph's own lists (so labels keep off each other);
 * the fills come back to be drawn under the curve, the outlines and the accumulation panel over
 * it. Flat; every number from the values.
 */
import type { ReactNode } from 'react';
import { Circle, G, Line, Path, Rect } from 'react-native-svg';

import type { FunctionGraphSpec } from '@/data/modules/typesFunctionGraph';
import { chart, type Palette } from '@/theme';

import { ChartText } from './common';
import {
  accumulate,
  decNum,
  dosesOf,
  doseNumbers,
  equalAreaParts,
  he1ePanel,
  labelNum,
  levelCrossings,
  levenspielVolumes,
  oneDose,
  regionOf,
  stripOf,
} from './functionGraphHe1e';
import { niceStep, tickText, ticks, type Curve, type Get, type Window } from './functionGraphMath';

const MINUS = '−';

interface Dot {
  x: number;
  y: number;
  color: string;
  open?: boolean;
  r?: number;
}
interface Dash {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  color: string;
  dash?: string;
}

export interface He1eLayerProps {
  spec: FunctionGraphSpec;
  main: Curve;
  other?: Curve;
  get: Get;
  allKnown: boolean;
  c: Palette;
  sx: (x: number) => number;
  sy: (y: number) => number;
  win: Window;
  L: number;
  pw: number;
  top: number;
  bottom: number;
  /** The canvas's width and height (the accumulation panel sits at the foot). */
  w: number;
  h: number;
  xName: string;
  fName: string;
  /** The graph's labeller (data coordinates; off the other labels) and its lists. */
  label: (x: number, y: number, text: string | undefined, color?: string) => void;
  dots: Dot[];
  dashes: Dash[];
  /** A module value as the page shows it ("80.5 L"), when typed or worked out. */
  valueOf: (id: string) => string | undefined;
}

/** A value's label: the page's own (with its unit) when the spec names it, else the number. */
const said = (p: He1eLayerProps, id: string | undefined, x: number, num = decNum) =>
  (id && p.valueOf(id)) ?? num(x);

/** The fills (under the curve) and the outlines, panel and marks (over it). */
export function he1eLayer(p: He1eLayerProps): { under: ReactNode; over: ReactNode } {
  const { spec, main, get, c, sx, sy, win, allKnown } = p;
  const under: ReactNode[] = [];
  const over: ReactNode[] = [];
  const [wx0, wx1] = win.x;
  const [wy0, wy1] = win.y;
  const clampY = (y: number) => Math.max(wy0 - 1, Math.min(wy1 + 1, y));
  const inX = (x: number) => x >= wx0 - 1e-9 && x <= wx1 + 1e-9;
  const inWin = (x: number, y: number) => inX(x) && y >= wy0 - 1e-9 && y <= wy1 + 1e-9;
  const opacity = allKnown ? 1 : 0.35;
  /** A filled band between lo(x) and hi(x) from a to b. */
  const band = (
    a: number,
    b: number,
    lo: (x: number) => number,
    hi: (x: number) => number,
    n = 200,
  ) => {
    const [l, r] = [Math.max(a, wx0), Math.min(b, wx1)];
    if (!(l < r)) return '';
    const xs = Array.from({ length: n + 1 }, (_, i) => l + ((r - l) * i) / n);
    const top = xs.map((x) => {
      const y = hi(x);
      return `${sx(x).toFixed(2)} ${sy(clampY(Number.isFinite(y) ? y : 0)).toFixed(2)}`;
    });
    const bot = xs
      .slice()
      .reverse()
      .map((x) => {
        const y = lo(x);
        return `${sx(x).toFixed(2)} ${sy(clampY(Number.isFinite(y) ? y : 0)).toFixed(2)}`;
      });
    return `M ${top.join(' L ')} L ${bot.join(' L ')} Z`;
  };
  const fill = (key: string, d: string, color: string, alpha: number) =>
    d ? <Path key={key} d={d} fill={color} opacity={alpha * opacity} /> : null;
  const hLine = (y: number, color: string, dash = chart.dash) => {
    if (y < wy0 || y > wy1) return;
    p.dashes.push({ x1: p.L, y1: sy(y), x2: p.L + p.pw, y2: sy(y), color, dash });
  };
  const vLine = (x: number, y0: number, y1: number, color: string, dash = chart.dashFine) => {
    if (!inX(x)) return;
    p.dashes.push({ x1: sx(x), y1: sy(clampY(y0)), x2: sx(x), y2: sy(clampY(y1)), color, dash });
  };

  // ── HC10 families: their marked points ──
  switch (spec.family) {
    case 'hill': {
      const K = get(spec.K, 1);
      const y = main.f(K);
      if (inWin(K, y)) {
        vLine(K, 0, y, c.chartMuted);
        p.dots.push({ x: K, y, color: c.chartHighlight });
        p.label(K, y, `half at K = ${said(p, spec.feature?.x, K)}`);
      }
      break;
    }
    case 'bateman': {
      if (spec.repeat || !main.key) break;
      const { x, y } = main.key;
      if (inWin(x, y)) {
        vLine(x, 0, y, c.chartMuted);
        p.dots.push({ x, y, color: c.chartHighlight });
        p.label(
          x,
          y,
          `tₘₐₓ = ${said(p, spec.feature?.x, x)}, Cₘₐₓ = ${said(p, spec.feature?.y, y)}`,
        );
      }
      break;
    }
    case 'erfc': {
      const [Cs, C0] = [get(spec.Cs, 1), get(spec.C0, 0)];
      hLine(C0, c.chartMuted);
      if (inWin(0, Cs)) {
        p.dots.push({ x: 0, y: Cs, color: c.chartHighlight });
        p.label(0, Cs, `surface Cₛ = ${decNum(Cs)}`);
      }
      p.label(wx0 + (wx1 - wx0) * 0.82, C0, `C₀ = ${decNum(C0)}`, c.chartMuted);
      break;
    }
    case 'levenspiel': {
      const [FA0, k, CA0, X] = [
        get(spec.FA0, 1),
        get(spec.k, 1),
        get(spec.CA0, 1),
        get(spec.X, 0.5),
      ];
      if (!(X > 0 && X < 1)) break;
      const v = levenspielVolumes(FA0, k, CA0, X, spec.order ?? 1);
      under.push(
        fill(
          'cstr',
          band(
            0,
            X,
            () => 0,
            () => v.height,
            2,
          ),
          c.fnSecond,
          0.13,
        ),
        fill(
          'pfr',
          band(0, X, () => 0, main.f),
          c.chartHighlight,
          0.28,
        ),
      );
      over.push(
        <Rect
          key="cstrEdge"
          x={sx(0)}
          y={sy(clampY(v.height))}
          width={sx(X) - sx(0)}
          height={sy(0) - sy(clampY(v.height))}
          fill="none"
          stroke={c.fnSecond}
          strokeWidth={chart.stroke}
          strokeDasharray={chart.dash}
          opacity={opacity}
        />,
      );
      p.dots.push({ x: X, y: v.height, color: c.chartInk });
      p.label(X * 0.5, v.height, `CSTR: V = ${said(p, spec.cstr, v.cstr)}`, c.fnSecond);
      p.label(
        X * 0.55,
        main.f(X * 0.55) * 0.45,
        `PFR: V = ${said(p, spec.pfr, v.pfr)}`,
        c.chartHighlight,
      );
      break;
    }
    case 'equalArea': {
      const pm = get(spec.pm, 1);
      const e = equalAreaParts(pm, get(spec.pmax, 2), get(spec.dc, 90), spec.radians);
      under.push(
        fill(
          'a1',
          band(
            e.d0,
            e.dc,
            () => 0,
            () => pm,
            2,
          ),
          c.regionPlus,
          0.32,
        ),
        fill(
          'a2',
          band(
            e.dc,
            e.dmax,
            () => pm,
            (d) => Math.max(pm, main.f(d)),
          ),
          c.regionMinus,
          0.32,
        ),
      );
      hLine(pm, c.chartInk);
      vLine(e.dc, 0, main.f(e.dc), c.chartMuted);
      const u = spec.radians ? '' : '°';
      p.label(wx0 + (wx1 - wx0) * 0.9, pm, `Pₘ = ${decNum(pm)}`, c.chartInk);
      p.dots.push({ x: e.d0, y: pm, color: c.chartHighlight });
      p.label(e.d0, pm, `δ₀ = ${said(p, spec.d0, e.d0)}${spec.d0 ? '' : u}`);
      p.dots.push({ x: e.dmax, y: pm, color: c.chartHighlight, open: true });
      p.label(e.dmax, pm, `δₘₐₓ = ${said(p, spec.dmax, e.dmax)}${spec.dmax ? '' : u}`);
      p.label(e.dc, main.f(e.dc), `δ_cr = ${decNum(e.dc)}${u}`);
      p.label((e.d0 + e.dc) / 2, pm / 2, `A₁ = ${decNum(e.A1)}`, c.regionPlus);
      const mid = (e.dc + e.dmax) / 2;
      p.label(mid, (pm + main.f(mid)) / 2, `A₂ = ${decNum(e.A2)}`, c.regionMinus);
      break;
    }
  }

  // ── HC10: the repeated dose ──
  const d = dosesOf(spec, get);
  const one = oneDose(main);
  if (d && one) {
    for (const t0 of d.times.slice(1)) {
      if (!inX(t0)) continue;
      const [a, b] = [main.side(t0, -1), main.f(t0)];
      if (Number.isFinite(a) && Number.isFinite(b))
        p.dashes.push({
          x1: sx(t0),
          y1: sy(clampY(a)),
          x2: sx(t0),
          y2: sy(clampY(b)),
          color: c.chartHighlight,
        });
    }
    const q = doseNumbers(one, d.every, d.count);
    hLine(q.avg, c.fnSecond);
    p.label(
      wx0 + (wx1 - wx0) * 0.86,
      q.avg,
      `C_ss,avg = ${said(p, spec.repeat?.avg, q.avg)}`,
      c.fnSecond,
    );
  }

  // ── HC12: regions ──
  const r = regionOf(spec, main, p.other, get);
  if (r) {
    const signed = !spec.between && spec.area?.signed;
    if (signed) {
      under.push(
        fill(
          'plus',
          band(
            r.from,
            r.to,
            () => 0,
            (x) => Math.max(0, main.f(x)),
          ),
          c.regionPlus,
          0.34,
        ),
        fill(
          'minus',
          band(
            r.from,
            r.to,
            (x) => Math.min(0, main.f(x)),
            () => 0,
          ),
          c.regionMinus,
          0.34,
        ),
      );
      // A + or − in each part big enough to hold it, at its middle.
      const cuts = [r.from, ...r.cuts, r.to];
      for (let i = 0; i + 1 < cuts.length; i++) {
        const m = (cuts[i]! + cuts[i + 1]!) / 2;
        const y = main.f(m);
        if (
          !Number.isFinite(y) ||
          Math.abs(sy(y) - sy(0)) < 22 ||
          sx(cuts[i + 1]!) - sx(cuts[i]!) < 18
        )
          continue;
        over.push(
          <ChartText
            key={`sg${i}`}
            x={sx(m)}
            y={sy(y / 2) + 5}
            fontSize={chart.emphasis}
            fontWeight="700"
            textAnchor="middle"
            fill={y > 0 ? c.regionPlus : c.regionMinus}
            opacity={opacity}
          >
            {y > 0 ? '+' : MINUS}
          </ChartText>,
        );
      }
    } else
      under.push(
        fill(
          'region',
          band(r.from, r.to, r.lower, r.upper),
          spec.between ? c.fnSecond : c.chartHighlight,
          0.2,
        ),
      );
    for (const x of [r.from, r.to]) vLine(x, r.lower(x), r.upper(x), c.chartMuted);
    const valueId = spec.between ? spec.between.value : (spec.area?.value ?? undefined);
    if (spec.area || spec.between) {
      // The value at the region's middle, where it is tallest.
      let [bx, bh] = [(r.from + r.to) / 2, -1];
      for (let i = 1; i < 40; i++) {
        const x = r.from + ((r.to - r.from) * i) / 40;
        const hgt = Math.abs(sy(r.upper(x)) - sy(r.lower(x)));
        if (hgt > bh) [bx, bh] = [x, hgt];
      }
      const name = spec.between ? 'A' : '∫';
      p.label(
        bx,
        (r.lower(bx) + r.upper(bx)) / 2,
        `${name} = ${said(p, valueId, r.value, labelNum)}`,
      );
    }
  }
  const s = stripOf(spec, r, get);
  if (s) {
    const thick = (s.dir === 'x' ? wx1 - wx0 : wy1 - wy0) / 36;
    const [x0, x1, y0, y1] =
      s.dir === 'x'
        ? [s.at - thick / 2, s.at + thick / 2, s.lo, s.hi]
        : [s.lo, s.hi, s.at - thick / 2, s.at + thick / 2];
    over.push(
      <G key="strip" opacity={opacity}>
        <Rect
          x={sx(x0)}
          y={sy(clampY(y1))}
          width={sx(x1) - sx(x0)}
          height={sy(clampY(y0)) - sy(clampY(y1))}
          fill={c.chartHighlight}
          opacity={0.55}
        />
        <Rect
          x={sx(x0)}
          y={sy(clampY(y1))}
          width={sx(x1) - sx(x0)}
          height={sy(clampY(y0)) - sy(clampY(y1))}
          fill="none"
          stroke={c.chartInk}
          strokeWidth={chart.strokeLight}
        />
      </G>,
    );
    if (s.dir === 'x') p.label(s.at, s.lo, `d${p.xName}`);
    else p.label(s.hi, s.at, 'dy');
  }

  // ── HC12: a level line, its crossings ringed ──
  if (spec.level) {
    const y = get(spec.level.y, 0);
    hLine(y, c.fnSecond);
    const name = spec.level.label ? `${spec.level.label} = ${labelNum(y)}` : `y = ${labelNum(y)}`;
    p.label(wx0 + (wx1 - wx0) * 0.08, y, name, c.fnSecond);
    for (const q of levelCrossings(main, y, wx0, wx1)) {
      p.dots.push({ x: q.x, y: q.y, color: c.fnSecond, open: true, r: 6.5 });
      p.label(q.x, q.y, `${p.xName} = ${labelNum(q.x)}`, c.fnSecond);
    }
  }

  // ── HC12: the accumulation panel ──
  if (spec.accumulation) over.push(accumulationPanel(p));

  return {
    under: <G key="he1eUnder">{under}</G>,
    over: <G key="he1eOver">{over}</G>,
  };
}

/** F(x) = ∫ from a to x of f under the graph, on the same x scale, its point and tangent. */
function accumulationPanel(p: He1eLayerProps): ReactNode {
  const { spec, main, get, c, sx, win } = p;
  const acc = spec.accumulation!;
  const H = he1ePanel(spec, p.w);
  const pTop = p.h - H + 16;
  const pBot = p.h - 24;
  const a = get(acc.from, 0);
  const X = get(acc.x, 0);
  const [wx0, wx1] = win.x;
  // F along the window, built up a step at a time (each step by quadrature).
  const n = 160;
  const xs = Array.from({ length: n + 1 }, (_, i) => wx0 + ((wx1 - wx0) * i) / n);
  const F0 = accumulate(main, a, wx0);
  const Fs: number[] = [F0];
  for (let i = 1; i <= n; i++) Fs.push(Fs[i - 1]! + accumulate(main, xs[i - 1]!, xs[i]!));
  const FX = accumulate(main, a, X);
  const fX = main.f(X);
  const finite = Fs.filter(Number.isFinite);
  let lo = Math.min(0, FX, ...finite);
  let hi = Math.max(0, FX, ...finite);
  if (hi - lo < 1e-9) [lo, hi] = [lo - 1, hi + 1];
  const step = niceStep(hi - lo, Math.max(2, Math.floor((pBot - pTop) / 28)));
  [lo, hi] = [Math.floor(lo / step) * step, Math.ceil(hi / step) * step];
  const sy = (y: number) => pBot - ((y - lo) / (hi - lo)) * (pBot - pTop);
  const F = acc.name ?? 'F';
  const d = xs
    .map((x, i) => (Number.isFinite(Fs[i]!) ? `${sx(x).toFixed(2)} ${sy(Fs[i]!).toFixed(2)}` : ''))
    .filter(Boolean)
    .join(' L ');
  // The tangent at X, slope f(X), a fifth of the window wide.
  const half = (wx1 - wx0) / 10;
  const tan = [X - half, X + half].map((x) => [sx(x), sy(FX + fX * (x - X))] as const);
  const opacity = p.allKnown ? 1 : 0.35;
  const say = (v: number) => labelNum(v);
  const tags = [
    `${F}(${say(X)}) = ${(acc.value && p.valueOf(acc.value)) ?? say(FX)}`,
    `slope ${p.fName}(${say(X)}) = ${say(fX)}`,
  ];
  return (
    <G key="accPanel">
      <Rect x={p.L} y={pTop} width={p.pw} height={pBot - pTop} fill="none" stroke={c.chartGrid} />
      {ticks(lo, hi, step).map((v) => (
        <G key={`ft${v}`}>
          <Line
            x1={p.L}
            x2={p.L + p.pw}
            y1={sy(v)}
            y2={sy(v)}
            stroke={c.chartGrid}
            strokeWidth={1}
          />
          <ChartText
            x={p.L - 4}
            y={sy(v) + 4}
            fontSize={chart.small}
            textAnchor="end"
            fill={c.chartMuted}
          >
            {tickText(v, false)}
          </ChartText>
        </G>
      ))}
      {lo < 0 && hi > 0 ? (
        <Line
          x1={p.L}
          x2={p.L + p.pw}
          y1={sy(0)}
          y2={sy(0)}
          stroke={c.chartInk}
          strokeWidth={chart.strokeLight}
        />
      ) : null}
      <ChartText x={p.L + 4} y={pTop - 4} fontSize={chart.label} fontWeight="700" fill={c.chartInk}>
        {`${F}(${p.xName}) = ∫ from ${say(a)} to ${p.xName} of ${p.fName}`}
      </ChartText>
      <G opacity={opacity}>
        <Path d={`M ${d}`} stroke={c.fnSecond} strokeWidth={chart.strokeHeavy} fill="none" />
        {X >= wx0 && X <= wx1 && Number.isFinite(FX) ? (
          <>
            <Line
              x1={sx(X)}
              x2={sx(X)}
              y1={p.bottom}
              y2={sy(FX)}
              stroke={c.chartMuted}
              strokeWidth={chart.strokeLight}
              strokeDasharray={chart.dashFine}
            />
            {Number.isFinite(fX) ? (
              <Line
                x1={tan[0]![0]}
                y1={tan[0]![1]}
                x2={tan[1]![0]}
                y2={tan[1]![1]}
                stroke={c.chartInk}
                strokeWidth={chart.stroke}
                strokeDasharray={chart.dash}
              />
            ) : null}
            <Circle cx={sx(X)} cy={sy(FX)} r={5} fill={c.fnSecond} />
          </>
        ) : null}
      </G>
      {p.allKnown
        ? tags.map((t, i) => (
            <ChartText
              key={`tag${i}`}
              x={p.L + p.pw - 4}
              y={pBot - 8 - (1 - i) * 16}
              fontSize={chart.label}
              fontWeight="700"
              textAnchor="end"
              fill={i ? c.chartInk : c.fnSecond}
              halo
            >
              {t}
            </ChartText>
          ))
        : null}
    </G>
  );
}

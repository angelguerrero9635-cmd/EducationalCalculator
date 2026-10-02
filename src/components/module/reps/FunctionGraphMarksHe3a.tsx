/**
 * HC42, HC45 and HC92 (college round 3, group A): what `functionGraph` draws for the families
 * `distribution` (Maxwell's three speeds, Planck's curves with λ_max and the visible band, the
 * three occupancies with the point at x) and `quantizer` (the lit tread, 1 LSB bracketed), and
 * for the options `newton` (tangents down to the axis), `bisect` (shrinking brackets under the
 * axis), `steps` (Euler, Heun or RK4 over the exact curve) and `through` (nodes ringed). Called
 * from FunctionGraph's drawing with the props of the round-1 layer: points, dashed lines and
 * labels go into the graph's own lists; fills and second curves come back to be drawn under the
 * main curve (clipped), marks over it. `QuadratureFill` draws the riemann sides 'trapezoid' and
 * 'simpson'. Flat; every number from the values; a "?" draws nothing for that value.
 */
import type { ReactNode } from 'react';
import { G, Path, Rect } from 'react-native-svg';

import type { NumOrVar } from '@/data/modules/typesGraphs';
import type { FunctionGraphHs3b } from '@/data/modules/typesHs3b';
import { chart, usePalette } from '@/theme';

import { ChartText } from './common';
import type { He1eLayerProps } from './FunctionGraphMarksHe1e';
import {
  VISIBLE,
  be,
  bisectBrackets,
  fd,
  fig4,
  maxwellNumbers,
  mb,
  newtonIterates,
  nodesOf,
  occupancyX,
  planckNumbers,
  quadratureOf,
  quantizerNumbers,
  stepsOf,
  subNum,
} from './functionGraphHe3a';
import type { Get } from './functionGraphMath';

/** A curve as path data over [lo, hi], broken where it has no value or runs far off. */
function curvePath(
  f: (x: number) => number,
  lo: number,
  hi: number,
  sx: (x: number) => number,
  sy: (y: number) => number,
  yLo: number,
  yHi: number,
  n = 300,
) {
  let d = '';
  let pen = false;
  for (let i = 0; i <= n; i++) {
    const x = lo + ((hi - lo) * i) / n;
    const y = f(x);
    if (!Number.isFinite(y)) {
      pen = false;
      continue;
    }
    const yc = Math.max(yLo, Math.min(yHi, y));
    d += `${pen ? 'L' : 'M'} ${sx(x).toFixed(2)} ${sy(yc).toFixed(2)} `;
    pen = yc === y;
  }
  return d;
}

/** The marks for HC42, HC45 and HC92, drawn on the graph's scale. */
export function he3aLayer(p: He1eLayerProps): { under: ReactNode; over: ReactNode } {
  const { spec, main, get, allKnown, c, sx, sy, win, L, pw, top, bottom, xName } = p;
  const under: ReactNode[] = [];
  const over: ReactNode[] = [];
  if (!allKnown) return { under: null, over: null };
  const known = (v: NumOrVar | undefined) =>
    v === undefined || typeof v === 'number' || p.valueOf(v) !== undefined;
  const [x0, x1] = win.x;
  const [y0, y1] = win.y;
  const span = y1 - y0;
  const inX = (x: number) => x >= x0 - 1e-9 && x <= x1 + 1e-9;
  const inWin = (x: number, y: number) => inX(x) && y >= y0 - 1e-9 && y <= y1 + 1e-9;
  const said = (id: string | undefined, x: number, num = fig4) => (id && p.valueOf(id)) ?? num(x);
  const upright = (x: number, y: number, color: string, dash: string = chart.dashFine) =>
    p.dashes.push({ x1: sx(x), y1: sy(Math.max(y0, 0)), x2: sx(x), y2: sy(y), color, dash });
  const second = (key: string, f: (x: number) => number, color: string, dash: string) =>
    under.push(
      <Path
        key={key}
        d={curvePath(f, x0, x1, sx, sy, y0 - span, y1 + span)}
        stroke={color}
        strokeWidth={chart.strokeHeavy}
        strokeDasharray={dash}
        fill="none"
      />,
    );

  // ── HC42: Maxwell's speeds ──
  if (spec.family === 'distribution' && spec.distribution === 'maxwell') {
    const m = maxwellNumbers(spec, get);
    const cmp = spec.compare;
    if (m.cmp && cmp && [cmp.molar, cmp.T].every(known)) {
      const g = (v: number) => m.cmp!.f(v) * m.scale;
      second('cmp', g, c.fnSecond, chart.dash);
      const who = cmp.gas ?? `${fig4(get(cmp.T ?? spec.T, 300))} K`;
      p.label(m.cmp.vp * 1.35, g(m.cmp.vp * 1.35), who, c.fnSecond);
    }
    const marks: [number, string, string | undefined][] = [
      [m.vp, 'vₚ', spec.speeds?.vp],
      [m.avg, '⟨v⟩', spec.speeds?.avg],
      [m.rms, 'vᵣₘₛ', spec.speeds?.rms],
    ];
    for (const [v] of marks) {
      const y = m.f(v) * m.scale;
      upright(v, y, c.chartInk);
      p.dots.push({ x: v, y, color: c.chartInk, r: 3.5 });
    }
    // The names stand in a row above the peak, each over its own line (the values are close:
    // 422, 476 and 517 m/s for nitrogen), so they never sit on each other.
    const peakY = m.peak * m.scale;
    marks.forEach(([v, name], i) =>
      p.label(v, peakY + (0.06 + 0.075 * i) * span, name, c.chartInk),
    );
  }

  // ── HC42: Planck's curves ──
  if (spec.family === 'distribution' && spec.distribution === 'planck') {
    const pl = planckNumbers(spec, get);
    const ok = [spec.T, ...(spec.others ?? [])].map((v) => known(v));
    if (spec.visible !== false) {
      const [a, b] = VISIBLE.map((v) => v * pl.per);
      const colors = [
        c.spectrumViolet,
        c.spectrumBlue,
        c.spectrumGreen,
        c.spectrumYellow,
        c.spectrumOrange,
        c.spectrumRed,
      ];
      const w = (b! - a!) / colors.length;
      colors.forEach((col, i) => {
        const l = sx(a! + i * w);
        under.push(
          <Rect
            key={`vis${i}`}
            x={l}
            y={top}
            width={Math.max(0.5, sx(a! + (i + 1) * w) - l)}
            height={bottom - top}
            fill={col}
            opacity={0.2}
          />,
        );
      });
      if (sx(b!) - sx(a!) > 30) p.label((a! + b!) / 2, y1 - 0.06 * span, 'visible', c.chartInk);
    }
    pl.Ts.forEach((T, i) => {
      if (!ok[i]) return;
      const f = pl.curve(T);
      if (i > 0) second(`T${i}`, f, c.fnSecond, chart.dash);
      const lx = pl.peaks[i]!;
      const ly = f(lx);
      upright(lx, ly, i ? c.fnSecond : c.chartInk);
      p.dots.push({ x: lx, y: ly, color: i ? c.fnSecond : c.chartHighlight, r: 4 });
      p.label(lx * 1.5, f(lx * 1.5), `${fig4(T)} K`, i ? c.fnSecond : c.chartHighlight);
    });
    if (ok[0]) {
      const u = spec.unit === 'nm' ? 'nm' : 'μm';
      p.label(
        pl.peaks[0]!,
        pl.curve(pl.Ts[0]!)(pl.peaks[0]!),
        `λₘₐₓ = ${said(spec.peak, pl.peaks[0]!)}${spec.peak ? '' : ` ${u}`}`,
      );
    }
  }

  // ── HC42: the three occupancies ──
  if (spec.family === 'distribution' && spec.distribution === 'occupancy') {
    second('be', be, c.fnSecond, chart.dash);
    second('mb', mb, c.chartMuted, chart.dashFine);
    p.label(x0 + (x1 - x0) * 0.08, 0.92, 'Fermi–Dirac', c.chartHighlight);
    const bx = Math.min(x1 - 0.5, 0.45);
    p.label(bx, Math.min(be(bx), y1 - 0.1 * span), 'Bose–Einstein', c.fnSecond);
    const mx = Math.max(x0 + 0.3, -Math.log(Math.min(y1 * 0.8, 1.6)));
    p.label(mx, mb(mx), 'Boltzmann', c.chartMuted);
    const x = occupancyX(spec, get);
    const given = spec.x !== undefined ? known(spec.x) : [spec.energy, spec.T].every(known);
    if (x !== undefined && given && inX(x)) {
      const ys = [fd(x), be(x), mb(x)].filter((y) => Number.isFinite(y));
      upright(x, Math.min(y1, Math.max(...ys)), c.chartInk);
      p.dots.push({ x, y: fd(x), color: c.chartHighlight, r: 4 });
      if (x > 0 && be(x) <= y1) p.dots.push({ x, y: be(x), color: c.fnSecond, r: 4 });
      if (mb(x) <= y1) p.dots.push({ x, y: mb(x), color: c.chartMuted, r: 4 });
      p.label(x, y0 + 0.06 * span, `x = ${fig4(x)}`, c.chartInk);
    }
  }

  // ── HC92: the quantizer's lit tread ──
  if (spec.family === 'quantizer') {
    const q = quantizerNumbers(spec, get, known);
    // The risers, fine, between the treads.
    let d = '';
    for (let k = q.c0 + 1; k < q.c1; k++) {
      const [x, ya, yb] = q.dac
        ? [k, (k - 1) * q.lsb, k * q.lsb]
        : [(k - (q.round ? 0.5 : 0)) * q.lsb, k - 1, k];
      d += `M ${sx(x).toFixed(2)} ${sy(ya).toFixed(2)} V ${sy(yb).toFixed(2)} `;
    }
    under.push(
      <Path
        key="risers"
        d={d}
        stroke={c.chartHighlight}
        strokeWidth={chart.strokeLight}
        strokeDasharray={chart.dashFine}
        fill="none"
      />,
    );
    if (q.D !== undefined) {
      const D = q.D;
      // The lit tread: from its left edge to its right, one LSB (or one code) wide.
      const [ta, tb, ty] = q.dac
        ? [D, D + 1, D * q.lsb]
        : [
            Math.max(0, (D - (q.round ? 0.5 : 0)) * q.lsb),
            (D + 1 - (q.round ? 0.5 : 0)) * q.lsb,
            D,
          ];
      const [pa, pb] = [Math.max(L, sx(ta)), Math.min(L + pw, sx(tb))];
      over.push(
        <Path
          key="lit"
          d={`M ${pa} ${sy(ty)} H ${pb}`}
          stroke={c.tangentLine}
          strokeWidth={chart.strokeHeavy + 3}
          strokeLinecap="round"
        />,
      );
      // 1 LSB bracketed under the tread (above it when the tread is low).
      const by = sy(ty) + (sy(ty) > bottom - 34 ? -14 : 14);
      over.push(
        <Path
          key="lsb"
          d={`M ${pa} ${by - 4} V ${by} H ${pb} V ${by - 4}`}
          stroke={c.chartInk}
          strokeWidth={chart.strokeLight}
          fill="none"
        />,
      );
      p.label(
        q.dac ? tb + 1.2 : tb + 1.3 * q.lsb,
        ty - 0.35 * (q.dac ? q.lsb : 1),
        q.dac ? '1 code' : '1 LSB',
        c.chartInk,
      );
      // The input up to the tread, the tread across to the axis.
      const xin = q.dac ? D + 0.5 : q.vin!;
      upright(xin, ty, c.chartInk, chart.dash);
      p.dashes.push({
        x1: L,
        y1: sy(ty),
        x2: sx(xin),
        y2: sy(ty),
        color: c.chartInk,
        dash: chart.dash,
      });
      p.dots.push({ x: xin, y: ty, color: c.tangentLine, r: 4 });
      p.label(
        x0 + (x1 - x0) * 0.12,
        ty + 0.06 * (y1 - y0),
        q.dac
          ? `${said(spec.back, ty)}${spec.back ? '' : ' V'}`
          : `D = ${said(typeof spec.code === 'string' ? spec.code : undefined, D)}`,
        c.tangentLine,
      );
    }
  }

  // ── HC45: Newton's tangents ──
  const nw = spec.newton;
  if (nw && known(nw.x0) && known(nw.steps)) {
    const it = newtonIterates(main.f, get(nw.x0, 1), get(nw.steps, 1));
    let lastPx = -Infinity;
    it.forEach((x, k) => {
      const y = main.f(x);
      if (inWin(x, y)) {
        upright(x, y, c.chartMuted);
        p.dots.push({ x, y, color: c.chartHighlight, r: 3.5 });
      }
      if (inX(x)) {
        p.dots.push({ x, y: 0, color: c.tangentLine, open: k > 0, r: 4 });
        // Each name once there's room (the late iterates crowd the root; the caption has them).
        if (Math.abs(sx(x) - lastPx) > 22) {
          p.label(x, -0.05 * span, `${xName}${subNum(k)}`, c.tangentLine);
          lastPx = sx(x);
        }
      }
      const next = it[k + 1];
      if (next !== undefined && inWin(x, y))
        over.push(
          <Path
            key={`nt${k}`}
            d={`M ${sx(x)} ${sy(y)} L ${Math.max(L, Math.min(L + pw, sx(next)))} ${sy(
              y + ((Math.max(x0, Math.min(x1, next)) - x) * (0 - y)) / (next - x),
            )}`}
            stroke={c.tangentLine}
            strokeWidth={chart.stroke}
            fill="none"
          />,
        );
    });
  }

  // ── HC45: bisection's brackets, stacked under the axis ──
  const bs = spec.bisect;
  if (bs && [bs.a, bs.b, bs.steps].every(known)) {
    const br = bisectBrackets(main.f, get(bs.a, 0), get(bs.b, 1), get(bs.steps, 1));
    const rows: ReactNode[] = [];
    br.forEach((q, i) => {
      const y = bottom - 12 - 14 * (br.length - 1 - i);
      const [a, b, m] = [sx(q.a), sx(q.b), sx(q.m)];
      rows.push(
        <Path
          key={`br${i}`}
          d={`M ${a} ${y - 4} V ${y + 4} M ${a} ${y} H ${b} M ${b} ${y - 4} V ${y + 4}`}
          stroke={c.tangentLine}
          strokeWidth={chart.stroke}
          fill="none"
        />,
        <Path
          key={`bm${i}`}
          d={`M ${m - 3} ${y} a 3 3 0 1 0 6 0 a 3 3 0 1 0 -6 0`}
          fill={c.chartInk}
        />,
        <ChartText
          key={`bs${i}`}
          x={Math.max(a, b) + 6}
          y={y + 4}
          fontSize={chart.label}
          fill={c.chartInk}
        >
          {`m${subNum(i + 1)}: ${q.fm < 0 ? '−' : q.fm > 0 ? '+' : '0'}`}
        </ChartText>,
      );
      const fm = q.fm;
      if (inWin(q.m, fm)) {
        p.dots.push({ x: q.m, y: fm, color: c.chartInk, r: 3 });
        p.dashes.push({
          x1: m,
          y1: sy(fm),
          x2: m,
          y2: y,
          color: c.chartMuted,
          dash: chart.dashFine,
        });
      }
    });
    over.push(<G key="brackets">{rows}</G>);
  }

  // ── HC45: an ODE solver's points ──
  const st = spec.steps;
  if (st && [st.h, st.n, st.y0, st.x0].every(known)) {
    const pts = stepsOf(spec, get)!;
    const d = pts
      .filter(([x, y]) => inWin(x, y))
      .map(([x, y], i) => `${i ? 'L' : 'M'} ${sx(x).toFixed(2)} ${sy(y).toFixed(2)}`)
      .join(' ');
    over.push(
      <Path key="steps" d={d} stroke={c.fnSecond} strokeWidth={chart.stroke} fill="none" />,
    );
    pts.forEach(([x, y]) => {
      if (inWin(x, y)) p.dots.push({ x, y, color: c.fnSecond, r: 4 });
    });
    const [xe, ye] = pts[pts.length - 1]!;
    const n = pts.length - 1;
    if (inWin(xe, ye)) p.label(xe, ye, `y${subNum(n)} = ${said(st.last, ye)}`, c.fnSecond);
  }

  // ── HC45: interpolation nodes ──
  if (spec.through?.length && spec.through.every((n) => known(n.x) && known(n.y)))
    for (const q of nodesOf(spec.through, get)) {
      if (!inWin(q.x, q.y)) continue;
      p.dots.push({ x: q.x, y: q.y, color: c.chartInk, open: true, r: 6 });
      p.label(q.x, q.y, `(${fig4(q.x)}, ${fig4(q.y)})`, c.chartInk);
    }

  return { under: under.length ? under : null, over: over.length ? over : null };
}

type RiemannSpec = NonNullable<FunctionGraphHs3b['riemann']>;

/** The trapezoids (or Simpson's parabolic panels), each node dotted: drawn in place of rectangles. */
export function QuadratureFill({
  r,
  f,
  get,
  sx,
  sy,
  faded,
}: {
  r: RiemannSpec;
  f: (x: number) => number;
  get: Get;
  sx: (x: number) => number;
  sy: (y: number) => number;
  faded: boolean;
}) {
  const c = usePalette();
  const q = quadratureOf(r, f, get);
  const simpson = r.side === 'simpson';
  const panels: ReactNode[] = [];
  const nodes: number[] = [];
  q.strips.slice(0, 200).forEach((s, i) => {
    let d = `M ${sx(s.x)} ${sy(0)} `;
    if (simpson) {
      // The parabola through the panel's three nodes.
      const [xa, xm, xb] = [s.x, s.x + s.w / 2, s.x + s.w];
      const [fa, fm, fb] = [f(xa), f(xm), f(xb)];
      for (let k = 0; k <= 24; k++) {
        const u = k / 24;
        const y = fa * (1 - u) * (1 - 2 * u) + 4 * fm * u * (1 - u) + fb * u * (2 * u - 1);
        d += `L ${sx(xa + u * s.w).toFixed(2)} ${sy(y).toFixed(2)} `;
      }
      nodes.push(xa, xm, xb);
    } else {
      d += `L ${sx(s.x)} ${sy(f(s.x))} L ${sx(s.x + s.w)} ${sy(f(s.x + s.w))} `;
      nodes.push(s.x, s.x + s.w);
    }
    d += `L ${sx(s.x + s.w)} ${sy(0)} Z`;
    panels.push(
      <Path
        key={`q${i}`}
        d={d}
        fill={c.chartSecond}
        fillOpacity={0.45}
        stroke={c.fnSecond}
        strokeWidth={chart.strokeLight}
      />,
    );
  });
  return (
    <G opacity={faded ? 0.4 : 1}>
      {panels}
      {q.n <= 24
        ? [...new Set(nodes)].map((x, i) => (
            <Path
              key={`n${i}`}
              d={`M ${sx(x) - 3} ${sy(f(x))} a 3 3 0 1 0 6 0 a 3 3 0 1 0 -6 0`}
              fill={c.fnSecond}
            />
          ))
        : null}
    </G>
  );
}

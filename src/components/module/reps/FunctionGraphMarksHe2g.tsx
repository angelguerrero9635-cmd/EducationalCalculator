/**
 * HC37 and HC38 (college round 2, group G): what `functionGraph` draws for `tangent` (the line,
 * its slope triangle, the linear approximation), `band` (y ± ε across, x ± δ up) and `series`
 * (the Taylor polynomial dashed over f, the gap at x bracketed, ∫P shaded). Called from
 * FunctionGraph's drawing with its scale and the props of the round-1 layer: points, dashed
 * lines and labels go into the graph's own lists (labels keep off each other); fills come back
 * to be drawn under the curve, lines over it. Flat; every number from the values.
 */
import type { ReactNode } from 'react';
import { Path, Rect } from 'react-native-svg';

import { chart } from '@/theme';

import type { He1eLayerProps } from './FunctionGraphMarksHe1e';
import { bandOf, fig4, fig6, seriesNumbers, tangentOf } from './functionGraphHe2g';

/** The tangent, the band and the series, drawn on the graph's scale. */
export function he2gLayer(p: He1eLayerProps): { under: ReactNode; over: ReactNode } {
  const { spec, main, get, allKnown, c, sx, sy, win, L, pw, top, bottom, xName, fName } = p;
  const under: ReactNode[] = [];
  const over: ReactNode[] = [];
  if (!allKnown) return { under: null, over: null };
  const [x0, x1] = win.x;
  const [y0, y1] = win.y;
  const inWin = (x: number, y: number) => x >= x0 && x <= x1 && y >= y0 && y <= y1;
  const said = (id: string | undefined, x: number, num = fig4) => (id && p.valueOf(id)) ?? num(x);

  // ── HC37: the ε–δ bands ──
  const b = bandOf(spec, get);
  if (b) {
    const [yLo, yHi] = [sy(b.y + b.dy), sy(b.y - b.dy)];
    const [xLo, xHi] = [sx(b.x - b.dx), sx(b.x + b.dx)];
    under.push(
      <Rect key="bandY" x={L} y={yLo} width={pw} height={yHi - yLo} fill={c.bandFill} opacity={0.14} />,
      <Rect key="bandX" x={xLo} y={top} width={xHi - xLo} height={bottom - top} fill={c.bandFill} opacity={0.14} />,
      <Path
        key="bandEdges"
        d={`M ${L} ${yLo} H ${L + pw} M ${L} ${yHi} H ${L + pw} M ${xLo} ${top} V ${bottom} M ${xHi} ${top} V ${bottom}`}
        stroke={c.bandFill}
        strokeWidth={chart.strokeLight}
        strokeDasharray={chart.dashFine}
        fill="none"
      />,
    );
    // The curve's run inside the δ band, heavier: it must stay inside the ε band.
    let d = '';
    for (let i = 0; i <= 60; i++) {
      const x = b.x - b.dx + (2 * b.dx * i) / 60;
      const y = main.f(x);
      if (Number.isFinite(y)) d += `${d ? 'L' : 'M'} ${sx(x).toFixed(2)} ${sy(y).toFixed(2)} `;
    }
    over.push(
      <Path key="bandCurve" d={d} stroke={c.tangentLine} strokeWidth={chart.strokeHeavy + 1.5} fill="none" />,
    );
    p.dots.push({ x: b.x, y: b.y, color: c.chartInk, open: !Number.isFinite(main.f(b.x)) });
    const band = spec.band!;
    p.label(x0 + (x1 - x0) * 0.82, b.y + b.dy, `${fig4(b.y)} + ε`, c.tangentLine);
    p.label(x0 + (x1 - x0) * 0.82, b.y - b.dy, `${fig4(b.y)} − ε`, c.tangentLine);
    p.label(b.x + b.dx, y0 + (y1 - y0) * 0.1, `δ = ${said(typeof band.dx === 'string' ? band.dx : undefined, b.dx)}`, c.tangentLine);
    p.label(b.x, b.y, `(${fig4(b.x)}, ${fig4(b.y)})`);
  }

  // ── HC37: the tangent and its slope triangle ──
  const t = tangentOf(spec, main, get);
  if (t) {
    const at = (x: number) => t.y + t.m * (x - t.x);
    over.push(
      <Path
        key="tangent"
        d={`M ${sx(x0)} ${sy(at(x0))} L ${sx(x1)} ${sy(at(x1))}`}
        stroke={c.tangentLine}
        strokeWidth={chart.stroke}
        fill="none"
      />,
    );
    // The triangle: one grid step across (to the right when it fits), m × that up.
    const run = win.xStep * (t.x + win.xStep <= x1 ? 1 : -1);
    const [qx, qy] = [t.x + run, at(t.x + run)];
    if (inWin(qx, t.y) && inWin(qx, qy)) {
      over.push(
        <Path
          key="slopeTri"
          d={`M ${sx(t.x)} ${sy(t.y)} H ${sx(qx)} V ${sy(qy)}`}
          stroke={c.tangentLine}
          strokeWidth={chart.strokeLight}
          strokeDasharray={chart.dashFine}
          fill="none"
        />,
      );
      p.label(t.x + run / 2, t.y, `Δ${xName} = ${fig4(Math.abs(run))}`, c.tangentLine);
      p.label(qx, (t.y + qy) / 2, `Δy = ${fig4(t.m * Math.abs(run))}`, c.tangentLine);
    }
    p.dots.push({ x: t.x, y: t.y, color: c.tangentLine, r: 5 });
    const tan = spec.tangent!;
    p.label(t.x, t.y, `slope ${said(tan.slope, t.m)}`, c.tangentLine);
    if (t.at !== undefined && t.L !== undefined && inWin(t.at, t.L)) {
      p.dots.push({ x: t.at, y: t.L, color: c.tangentLine, open: true });
      p.label(t.at, t.L, `L = ${said(tan.value, t.L, fig6)}`, c.tangentLine);
    }
  }

  // ── HC38: the Taylor polynomial, the gap at x, ∫P ──
  const s = seriesNumbers(spec, main, get);
  if (s) {
    if (s.from !== undefined && s.to !== undefined && s.from !== s.to) {
      const [a, z] = [Math.max(x0, Math.min(s.from, s.to)), Math.min(x1, Math.max(s.from, s.to))];
      let d = `M ${sx(a)} ${sy(0)} `;
      for (let i = 0; i <= 120; i++) {
        const x = a + ((z - a) * i) / 120;
        const y = Math.max(y0 - 1, Math.min(y1 + 1, s.P(x)));
        d += `L ${sx(x).toFixed(2)} ${sy(y).toFixed(2)} `;
      }
      under.push(<Path key="intP" d={`${d}L ${sx(z)} ${sy(0)} Z`} fill={c.fnSecond} opacity={0.16} />);
      const I = spec.series!.integral!;
      const mid = (a + z) / 2;
      p.label(mid, s.P(mid) / 2, `∫P = ${said(I.value, s.integral!, fig6)}`, c.fnSecond);
    }
    // The polynomial, dashed, only where it stays near the window (it runs away past it).
    let d = '';
    let pen = false;
    const n = Math.max(240, Math.round(pw * 1.6));
    const span = y1 - y0;
    for (let i = 0; i <= n; i++) {
      const x = x0 + ((x1 - x0) * i) / n;
      const y = s.P(x);
      if (!Number.isFinite(y) || y < y0 - span || y > y1 + span) {
        pen = false;
        continue;
      }
      d += `${pen ? 'L' : 'M'} ${sx(x).toFixed(2)} ${sy(y).toFixed(2)} `;
      pen = true;
    }
    over.push(
      <Path key="poly" d={d} stroke={c.fnSecond} strokeWidth={chart.strokeHeavy} strokeDasharray={chart.dash} fill="none" />,
    );
    const ser = spec.series!;
    if (inWin(s.a, s.P(s.a))) p.dots.push({ x: s.a, y: s.P(s.a), color: c.fnSecond });
    if (s.x !== undefined && s.Px !== undefined && s.fx !== undefined && Number.isFinite(s.fx)) {
      const [ya, yb] = [s.Px, s.fx];
      // The bracket: a short bar at each value and the upright between, beside x.
      const px = sx(s.x);
      const cx = px + 7;
      over.push(
        <Path
          key="gap"
          d={`M ${px} ${sy(ya)} H ${cx} V ${sy(yb)} H ${px}`}
          stroke={c.chartInk}
          strokeWidth={chart.stroke}
          fill="none"
        />,
      );
      p.dots.push({ x: s.x, y: ya, color: c.fnSecond, r: 4 });
      p.dots.push({ x: s.x, y: yb, color: c.chartHighlight, r: 4 });
      const err = Math.abs(yb - ya);
      const text = `error ${said(ser.error, err, fig4)}`;
      // Beside the bracket's middle; a gap too small to see still gets its number.
      p.label(s.x, (ya + yb) / 2, text, c.chartInk);
      p.label(s.x, ya, `P = ${said(ser.value, ya, fig6)}`, c.fnSecond);
      p.label(s.x, yb, `${fName} = ${fig6(yb)}`, c.chartHighlight);
    }
  }
  return { under: under.length ? under : null, over: over.length ? over : null };
}

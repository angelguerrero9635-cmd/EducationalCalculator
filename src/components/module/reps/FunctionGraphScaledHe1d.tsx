/**
 * HC9 (college round 1, group D): a `functionGraph` family on log or flipped axes. `scale.x`
 * reads the input's axis in powers of ten, `scale.y` the output's (decade ticks, minor ticks at
 * 2–9 × 10ⁿ); `invertY` makes the vertical axis grow downward (depth down); `swap` puts the input
 * on the vertical axis (temperature across, depth down). `family: 'gradation'` is a soil's
 * percent passing against grain size through D₁₀, D₃₀ and D₆₀. The traced point (`at`) is
 * dragged along the input; `reads` drops the page's values to the axes. A log axis has no place
 * for 0 or a negative value: such a point isn't drawn and the caption says why. Flat.
 */
import { useRef, type ReactNode } from 'react';
import { View } from 'react-native';
import Svg, { Circle, G, Line, Path, Rect } from 'react-native-svg';

import {
  familyVars,
  type FunctionGraphSpec,
  type NumOrVar,
} from '@/data/modules/typesFunctionGraph';
import { formatNumber } from '@/engine/format';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, Caption, ChartText, DragHandle, useFrozen, useRep } from './common';
import { fig3, Ital, textW } from './he1dText';
import {
  axisMap,
  axisUnmap,
  decadeText,
  decadesAround,
  gradationCoefficients,
  gradationCurve,
  linearTicks,
  logTicks,
  niceEnd,
  stepFor,
} from './functionGraphHe1dMath';
import { buildCurve, numText, plain, resolveWindow } from './functionGraphMath';

const SUB: Record<string, string> = { '1': '₁', '3': '₃', '6': '₆', '0': '₀' };
const subs = (s: string) => [...s].map((ch) => SUB[ch] ?? ch).join('');

type Range = [number, number];

/** One axis: its range, whether it is log, and its ticks. */
function axisOf(lo: number, hi: number, log: boolean) {
  if (log) {
    const t = logTicks(lo, hi);
    return { lo, hi, log, major: t.major, minor: t.minor, text: decadeText };
  }
  const major = linearTicks(lo, hi, stepFor(hi - lo, 5));
  return {
    lo,
    hi,
    log,
    major,
    minor: [] as number[],
    text: (v: number) => formatNumber(Number(v.toPrecision(10))),
  };
}

/** A linear range holding xs, padded to nice ticks (from 0 when `zero`). */
function linearRange(xs: number[], zero: boolean): Range {
  let lo = Math.min(...xs, ...(zero ? [0] : []));
  let hi = Math.max(...xs, ...(zero ? [0] : []));
  if (!(hi - lo > 1e-12)) {
    lo -= 1;
    hi += 1;
  }
  const st = stepFor(hi - lo, 5);
  return [Math.floor(lo / st - 1e-9) * st, Math.ceil(hi / st - 1e-9) * st];
}

/** A log range holding the positive xs: whole decades, at most 12, at least 2. */
function logRange(xs: number[]): Range {
  const pos = xs.filter((x) => x > 0 && Number.isFinite(x));
  if (!pos.length) return [1, 1000];
  const hi0 = Math.max(...pos);
  const lo0 = Math.max(Math.min(...pos), hi0 / 1e12);
  const [lo, hi] = decadesAround(lo0, hi0);
  return hi / lo < 100 ? [lo, hi * 10] : [lo, hi];
}

export function FunctionGraphScaledHe1d({
  spec,
  calc,
}: {
  spec: FunctionGraphSpec;
  calc: Calculator;
}) {
  const c = usePalette();
  const rep = useRep(calc);
  const frozen = useFrozen<{ inp: Range; out: Range } | undefined>(undefined);
  const drawn = useRef<{ inp: Range; out: Range } | undefined>(undefined);
  const start = useRef(0);

  const known = (v: NumOrVar | undefined) =>
    v === undefined || typeof v === 'number' || rep.known(v);
  // With `unitsOf` (the Units rule) the family reads the formula's units and the axes show
  // the menu's: x shown = x ÷ fₓ, y shown = f(x) ÷ f_y. Without it the graph reads shown numbers.
  const uo = spec.unitsOf;
  const fx = uo?.x ? rep.factor(uo.x) : 1;
  const fy = uo?.y ? rep.factor(uo.y) : 1;
  const get = (v: NumOrVar | undefined, d: number) =>
    v === undefined ? d : typeof v === 'number' ? v : uo ? rep.val(v) : rep.shown(v);
  const pageWindow = resolveWindow(spec.window, (v) =>
    typeof v === 'number' || rep.known(v) ? get(v, 0) : undefined,
  );
  const shownOf = (v: NumOrVar | undefined, d: number) =>
    v === undefined ? d : typeof v === 'number' ? v : rep.shown(v);
  const say = (v: NumOrVar | undefined, d: number) => (known(v) ? numText(get(v, d)) : '?');
  const xLog = spec.scale?.x === 'log';
  const yLog = spec.scale?.y === 'log';
  const xName = spec.input ?? (spec.at ? rep.variable(spec.at.x).symbol : 'x');
  const fName = spec.name ?? 'f';

  // The curve: a gradation from its three sizes, else the family.
  const grad = spec.family === 'gradation' ? spec : undefined;
  const gradDs = grad ? [grad.d10, grad.d30, grad.d60] : [];
  const gradOk =
    grad && gradDs.every(known)
      ? (() => {
          const [a, b, d] = gradDs.map((v) => get(v, 1)) as [number, number, number];
          return a > 0 && a < b && b < d ? gradationCurve(a, b, d) : undefined;
        })()
      : undefined;
  const famIds = familyVars(spec);
  const allKnown = grad ? !!gradOk : famIds.every((id) => rep.known(id));
  const curve =
    !grad && spec.family !== 'response' && allKnown ? buildCurve(spec, get, say, xName) : undefined;
  const f = gradOk ? gradOk.f : curve && ((x: number) => curve.f(x * fx) / fy);

  const atX = spec.at && rep.known(spec.at.x) ? rep.shown(spec.at.x) : undefined;
  const reads = [
    ...(grad && gradOk
      ? (['10', '30', '60'] as const).map((p, i) => ({
          x: shownOf(gradDs[i], 1),
          y: Number(p),
          id: gradDs[i],
          label: `D${subs(p)}`,
        }))
      : []),
    ...(spec.reads ?? [])
      .filter((r) => rep.known(r.x) && known(r.y))
      .map((r) => ({
        x: rep.shown(r.x),
        y: shownOf(r.y, 0),
        id: r.x as NumOrVar,
        label: r.label,
      })),
  ];
  const refused: string[] = [];
  if (xLog && atX !== undefined && !(atX > 0)) refused.push(`${xName} = ${numText(atX)}`);

  const live = (pw: number): { inp: Range; out: Range } => {
    const inXs = [
      ...(atX !== undefined && (!xLog || atX > 0) ? [atX] : []),
      ...reads.map((r) => r.x),
    ];
    let inp: Range;
    if (pageWindow?.x) inp = pageWindow.x;
    else if (gradOk) inp = logRange([gradOk.lo, gradOk.hi]);
    else if (xLog)
      inp = logRange(inXs.length ? [Math.min(...inXs) / 3, Math.max(...inXs) * 3] : []);
    else {
      const hi = niceEnd(Math.max(...inXs.map(Math.abs), 1) * 1.5);
      inp = [spec.xMin ?? 0, hi];
    }
    const outs: number[] = [];
    if (f) {
      const n = Math.max(120, Math.round(pw));
      const un = axisUnmap(inp[0], inp[1], xLog);
      for (let i = 0; i <= n; i++) {
        const y = f(un(i / n));
        if (Number.isFinite(y) && Math.abs(y) < 1e15) outs.push(y);
      }
    }
    for (const r of reads) outs.push(r.y);
    let out: Range;
    if (pageWindow?.y) out = pageWindow.y;
    else if (gradOk) out = [0, 100];
    else if (yLog) out = logRange(outs);
    else
      out = linearRange(outs.length ? outs : [0, 1], !!spec.invertY || outs.every((y) => y >= 0));
    return { inp, out };
  };

  const captions: string[] = [];
  if (grad) {
    if (!gradOk)
      captions.push(
        gradDs.every(known)
          ? 'D₁₀ < D₃₀ < D₆₀, all above 0, to draw the curve.'
          : 'Type D₁₀, D₃₀ and D₆₀ to draw the curve.',
      );
    else {
      const [a, b, d] = gradDs.map((v) => get(v, 1)) as [number, number, number];
      const { cu, cc } = gradationCoefficients(a, b, d);
      captions.push(
        `Percent passing against grain size${xLog ? ', on a log axis' : ''}`,
        `C_u = D₆₀ ÷ D₁₀ = ${fig3(cu)} · C_c = D₃₀² ÷ (D₁₀ × D₆₀) = ${fig3(cc)}`,
      );
    }
  } else if (curve) captions.push(`${fName}(${xName}) = ${plain(curve.text)}`);
  else captions.push('Type every value to draw the graph.');
  if (xLog && yLog) captions.push('Log–log axes: a power law draws as a straight line.');
  else if (yLog) captions.push('A log y-axis: an exponential draws as a straight line.');
  else if (xLog && !grad) captions.push('A log x-axis: each decade gets the same room.');
  if (spec.invertY) captions.push(`The vertical axis grows downward.`);
  for (const r of refused)
    captions.push(`${r} isn’t drawn: a log axis has no place for 0 or a negative number.`);

  const atDrag =
    spec.at && atX !== undefined && !spec.fixed && calc.status(spec.at.x) !== 'derived';

  return (
    <View>
      <Canvas aspect={(w) => (30 + w * 0.68 + 44) / w}>
        {({ w, h }) => {
          const win = frozen.value ?? live(w);
          drawn.current = win;
          // H is the horizontal axis, V the vertical: the input and the output, or swapped.
          const iAx = axisOf(win.inp[0], win.inp[1], xLog);
          const oAx = axisOf(win.out[0], win.out[1], yLog);
          const [hAx, vAx] = spec.swap ? [oAx, iAx] : [iAx, oAx];
          const vLabels = vAx.major.map(vAx.text);
          const L = Math.max(30, Math.max(...vLabels.map((s) => textW(s, chart.label))) + 12);
          const R = 18;
          const top = spec.swap && spec.invertY ? 34 : 24;
          const bottom = h - 40;
          const pw = w - L - R;
          const ph = bottom - top;
          const hMap = axisMap(hAx.lo, hAx.hi, hAx.log);
          const vMap = axisMap(vAx.lo, vAx.hi, vAx.log);
          const X = (v: number) => {
            const u = hMap(v);
            return u === undefined ? undefined : L + u * pw;
          };
          const Y = (v: number) => {
            const u = vMap(v);
            return u === undefined ? undefined : spec.invertY ? top + u * ph : bottom - u * ph;
          };
          /** A point (input, output) on the canvas, or undefined off a log axis. */
          const P = (i: number, o: number): [number, number] | undefined => {
            const [a, b] = spec.swap ? [X(o), Y(i)] : [X(i), Y(o)];
            return a === undefined || b === undefined ? undefined : [a, b];
          };
          const nodes: ReactNode[] = [];
          const lineAt = (horizontal: boolean, p: number, key: string, strong: boolean) =>
            horizontal ? (
              <Line
                key={key}
                x1={L}
                x2={L + pw}
                y1={p}
                y2={p}
                stroke={c.chartGrid}
                strokeWidth={strong ? 1 : 0.6}
              />
            ) : (
              <Line
                key={key}
                x1={p}
                x2={p}
                y1={top}
                y2={bottom}
                stroke={c.chartGrid}
                strokeWidth={strong ? 1 : 0.6}
              />
            );
          hAx.minor.forEach((v) => nodes.push(lineAt(false, X(v)!, `hm${v}`, false)));
          vAx.minor.forEach((v) => nodes.push(lineAt(true, Y(v)!, `vm${v}`, false)));
          hAx.major.forEach((v) => nodes.push(lineAt(false, X(v)!, `hM${v}`, true)));
          vAx.major.forEach((v) => nodes.push(lineAt(true, Y(v)!, `vM${v}`, true)));
          nodes.push(
            <Rect
              key="frame"
              x={L}
              y={top}
              width={pw}
              height={ph}
              fill="none"
              stroke={c.chartInk}
              strokeWidth={chart.strokeLight}
            />,
          );
          // The numbers: along the bottom (or the top, when depth runs down from it).
          const hy = spec.invertY && !spec.swap ? bottom + 15 : bottom + 15;
          hAx.major.forEach((v, i) => {
            const t = hAx.text(v);
            const x = X(v)!;
            // Crowded linear numbers give way every other one.
            if (!hAx.log && hAx.major.length * (textW(t, chart.label) + 8) > pw && i % 2) return;
            nodes.push(
              <ChartText
                key={`hn${v}`}
                x={x}
                y={hy}
                fontSize={chart.label}
                fill={c.chartMuted}
                textAnchor="middle"
              >
                {t}
              </ChartText>,
            );
          });
          vAx.major.forEach((v, i) =>
            nodes.push(
              <ChartText
                key={`vn${v}`}
                x={L - 5}
                y={Y(v)! + 4}
                fontSize={chart.label}
                fill={c.chartMuted}
                textAnchor="end"
              >
                {vLabels[i]}
              </ChartText>,
            ),
          );
          const unitOf = (id?: string) => (id && rep.unit(id) ? ` (${rep.unit(id)})` : '');
          const xAxis = `${spec.axes?.x ?? xName}${unitOf(uo?.x)}`;
          const yAxis = `${spec.axes?.y ?? fName}${unitOf(uo?.y)}`;
          const [hName, vName] = spec.swap ? [yAxis, xAxis] : [xAxis, yAxis];
          nodes.push(
            <ChartText
              key="hname"
              x={L + pw / 2}
              y={h - 8}
              fontSize={chart.label}
              fill={c.chartInk}
              textAnchor="middle"
            >
              <Ital text={`${hName}${hAx.log ? ', log scale' : ''}`} size={chart.label} />
            </ChartText>,
            <ChartText key="vname" x={L} y={top - 9} fontSize={chart.label} fill={c.chartInk}>
              <Ital
                text={`${vName}${vAx.log ? ', log scale' : ''}${spec.invertY ? ' ↓' : ''}`}
                size={chart.label}
              />
            </ChartText>,
          );

          // The curve, sampled evenly along the input's axis.
          if (f) {
            const n = Math.max(240, Math.round((spec.swap ? ph : pw) * 1.5));
            const un = axisUnmap(win.inp[0], win.inp[1], xLog);
            let d = '';
            let pen = false;
            for (let i = 0; i <= n; i++) {
              const x = un(i / n);
              const y = f(x);
              const p = Number.isFinite(y) ? P(x, y) : undefined;
              const inside =
                p && p[0] >= L - 1 && p[0] <= L + pw + 1 && p[1] >= top - 1 && p[1] <= bottom + 1;
              if (!p || !inside) {
                pen = false;
                continue;
              }
              d += `${pen ? 'L' : 'M'} ${p[0].toFixed(2)} ${p[1].toFixed(2)} `;
              pen = true;
            }
            nodes.push(
              <Path
                key="curve"
                d={d}
                stroke={c.chartHighlight}
                strokeWidth={chart.strokeHeavy - 0.5}
                fill="none"
              />,
            );
          }

          // The page's read-offs, dropped to both axes.
          reads.forEach((r, i) => {
            const p = P(r.x, r.y);
            if (!p) return;
            const [px, py] = p;
            const xEdge = spec.swap ? L : px;
            const text = `${r.label ?? ''}${r.label ? ' = ' : ''}${typeof r.id === 'string' ? rep.value(r.id) : fig3(r.x)}`;
            const below = spec.invertY ? top : bottom;
            nodes.push(
              <G key={`rd${i}`}>
                <Line
                  x1={L}
                  x2={px}
                  y1={py}
                  y2={py}
                  stroke={c.chartMuted}
                  strokeWidth={1}
                  strokeDasharray={chart.dashFine}
                />
                <Line
                  x1={px}
                  x2={px}
                  y1={py}
                  y2={spec.swap ? py : below}
                  stroke={c.chartMuted}
                  strokeWidth={1}
                  strokeDasharray={chart.dashFine}
                />
                <Circle
                  cx={px}
                  cy={py}
                  r={4.5}
                  fill={c.background}
                  stroke={c.chartInk}
                  strokeWidth={chart.strokeLight}
                />
                <ChartText
                  x={Math.min(L + pw - 2, xEdge + 6)}
                  y={py - 6}
                  fontSize={chart.label}
                  fill={c.chartInk}
                  textAnchor={xEdge + 6 + textW(text, chart.label) > L + pw ? 'end' : 'start'}
                  halo
                >
                  <Ital text={text} />
                </ChartText>
              </G>,
            );
          });

          // The traced point.
          const yAt = atX !== undefined && f ? f(atX) : undefined;
          const atP =
            atX !== undefined && yAt !== undefined && Number.isFinite(yAt)
              ? P(atX, yAt)
              : undefined;
          if (atP) {
            const yText = spec.at?.y && rep.known(spec.at.y) ? rep.value(spec.at.y) : fig3(yAt!);
            const label = `${xName} = ${rep.value(spec.at!.x)}, ${spec.at?.y ? rep.variable(spec.at.y).symbol : fName} = ${yText}`;
            // Beside the point on the side the curve leaves open (below-right of a rising
            // line, above-right of a falling one, else the opposite corner); a label too wide
            // for either side is centred over or under the point, inside the plot.
            const wide = textW(label, chart.value);
            const [px, py] = atP;
            const d = (along: number) => P(atX! * (1 + along), f!(atX! * (1 + along)));
            const [a0, a1] = [d(-0.02), d(0.02)];
            const rising = !!a0 && !!a1 && (a1[1] - a0[1]) * (a1[0] - a0[0]) < 0;
            const corners: [boolean, boolean][] = rising
              ? [
                  [true, false],
                  [false, true],
                ]
              : [
                  [true, true],
                  [false, false],
                ];
            const fits = ([r, up]: [boolean, boolean]) =>
              (r ? px + 12 + wide < L + pw : px - 12 - wide > L) &&
              (up ? py - 24 > top : py + 24 < bottom);
            const pick = corners.find(fits);
            const lx = pick
              ? px + (pick[0] ? 12 : -12)
              : Math.min(L + pw - wide / 2 - 2, Math.max(L + wide / 2 + 2, px));
            const ly = pick ? py + (pick[1] ? -10 : 22) : py + (py - 30 > top ? -14 : 26);
            nodes.push(
              <G key="at">
                <Circle cx={atP[0]} cy={atP[1]} r={5.5} fill={c.chartHighlight} />
                <ChartText
                  x={lx}
                  y={ly}
                  fontSize={chart.value}
                  fontWeight="600"
                  fill={c.chartHighlight}
                  textAnchor={pick ? (pick[0] ? 'start' : 'end') : 'middle'}
                  halo
                >
                  <Ital text={label} size={chart.value} />
                </ChartText>
              </G>,
            );
          }
          const along = spec.swap ? ph : pw;
          return (
            <>
              <Svg width={w} height={h}>
                {nodes}
              </Svg>
              {atP && atDrag ? (
                <DragHandle
                  testID="drag-point"
                  x={atP[0]}
                  y={atP[1]}
                  label="the point on the curve"
                  onStart={() => {
                    start.current = axisMap(win.inp[0], win.inp[1], xLog)(atX!) ?? 0;
                    frozen.freezeAt(drawn.current);
                  }}
                  onMove={(dx, dy) => {
                    const id = spec.at!.x;
                    const move = spec.swap ? (spec.invertY ? dy : -dy) : dx;
                    const u = Math.max(0, Math.min(1, start.current + move / along));
                    const x = axisUnmap(win.inp[0], win.inp[1], xLog)(u);
                    const k = rep.factor(id);
                    const keep = spec.keep ?? famIds.filter((v) => v !== id);
                    calc.set({ ...rep.pinTyped(keep), [id]: rep.snapTo(id, x * k) }, rep.slide(id));
                  }}
                  onEnd={frozen.release}
                />
              ) : null}
            </>
          );
        }}
      </Canvas>
      <Caption>{captions.join(' · ')}</Caption>
    </View>
  );
}

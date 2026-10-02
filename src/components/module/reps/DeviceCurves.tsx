/**
 * A device's curves (HC62, `deviceCurves`; EC-P8), flat. Diode: its I–V curve (the
 * constant-drop model, off below V_D and upright at it, or Shockley's exponential), the load
 * line from (V_s, 0) to (0, V_s ÷ R) and the Q point where they cross; `decade` marks the ΔV
 * that takes the current ten times higher. MOSFET: I_D against V_DS for V_GS (heavy) and a
 * family of other V_GS values (faint), the triode–saturation edge V_DS = V_OV dashed, a load
 * line, and the Q point (at the edge when the page has no V_DS). A "?" draws nothing for its
 * value.
 */
import Svg, { Circle, G, Line, Path } from 'react-native-svg';

import type { DeviceCurvesSpec } from '@/data/modules/typesHe3k';
import { formatNumber } from '@/engine/format';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, Caption, ChartText, fitLabel, useRep } from './common';
import { dropQ, mosfetId, niceStep, shockley } from './he3kMath';

const LABEL = chart.label;
const H = 300;

const fig = (x: number) => formatNumber(Number(x.toPrecision(3)));

/** Pushes label heights apart (each at least `gap` from the next), keeping their order. */
function spread(ys: number[], gap: number, lo: number, hi: number) {
  const order = ys.map((y, i) => ({ y, i })).sort((a, b) => a.y - b.y);
  for (let k = 1; k < order.length; k++) order[k]!.y = Math.max(order[k]!.y, order[k - 1]!.y + gap);
  const over = order.length ? order[order.length - 1]!.y - hi : 0;
  if (over > 0) order.forEach((o) => (o.y -= over));
  for (let k = order.length - 2; k >= 0; k--)
    order[k]!.y = Math.min(order[k]!.y, order[k + 1]!.y - gap);
  const out = [...ys];
  order.forEach((o) => (out[o.i] = Math.max(lo, o.y)));
  return out;
}

export function DeviceCurves({ spec, calc }: { spec: DeviceCurvesSpec; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  const num = (x: string | number | undefined) =>
    x === undefined ? undefined : typeof x === 'number' ? x : rep.known(x) ? rep.val(x) : undefined;
  // Axis units: the current's and the voltage's own (shown) units; a factor from formula units.
  const iId = spec.device === 'diode' ? spec.I : spec.Id;
  const vId = spec.device === 'diode' ? (spec.V ?? spec.VD ?? spec.Vs) : spec.Vds;
  const iUnit = typeof iId === 'string' ? (rep.unit(iId) ?? '') : '';
  const iFactor = typeof iId === 'string' ? rep.factor(iId) : 1;
  const vUnit = typeof vId === 'string' ? (rep.unit(vId) ?? 'V') : 'V';
  const vFactor = typeof vId === 'string' ? rep.factor(vId) : 1;
  const I = (x: number) => x / iFactor;
  /** A value as shown, to 3 figures, with its unit. */
  const sv = (id: string) =>
    rep.known(id) ? `${fig(rep.shown(id))}${rep.unit(id) ? ` ${rep.unit(id)}` : ''}` : '?';
  const V = (x: number) => x / vFactor;

  type Curve = { d: [number, number][]; heavy: boolean; dashed?: boolean; label?: string };
  const curves: Curve[] = [];
  let load: [[number, number], [number, number]] | undefined;
  let q: { v: number; i: number; text: string } | undefined;
  let decade: { v1: number; v2: number; i1: number; i2: number } | undefined;
  let xMax = 1;
  let xMin = 0;
  let yMax = 1;
  const notes: string[] = [];
  const regions: boolean = spec.device === 'mosfet';
  const edgeCurve: [number, number][] = [];

  if (spec.device === 'diode') {
    const Vs = num(spec.Vs);
    const R = num(spec.R);
    if (spec.model === 'shockley') {
      const [Is, n, VT, Vq] = [num(spec.Is), num(spec.n), num(spec.VT), num(spec.V)];
      if (Is !== undefined && n !== undefined && VT !== undefined && Is > 0 && n > 0 && VT > 0) {
        const Iq = Vq === undefined ? undefined : shockley(Is, n, VT, Vq);
        const dV = n * VT * Math.log(10);
        const v1 = Vq ?? n * VT * Math.log(1e-3 / Is);
        const i1 = shockley(Is, n, VT, v1);
        const v2 = v1 + dV;
        xMin = Math.max(0, v1 - 6 * dV);
        xMax = v2 + dV * 0.3;
        yMax = shockley(Is, n, VT, v2) * 1.25;
        curves.push({
          d: Array.from({ length: 121 }, (_, k) => {
            const v = xMin + ((xMax - xMin) * k) / 120;
            return [v, Math.min(yMax * 1.2, shockley(Is, n, VT, v))] as [number, number];
          }),
          heavy: true,
          label: 'I = I_S(e^(V ÷ nV_T) − 1)',
        });
        if (spec.decade !== undefined) decade = { v1, v2, i1, i2: 10 * i1 + 9 * Is };
        if (Iq !== undefined && Vq !== undefined)
          q = { v: Vq, i: Iq, text: `${fig(V(Vq))} ${vUnit}, ${fig(I(Iq))} ${iUnit}` };
      }
    } else {
      const VD = num(spec.VD);
      if (Vs !== undefined && R !== undefined && Vs > 0 && R > 0) {
        xMax = Vs * 1.08;
        yMax = (Vs / R) * 1.12;
        load = [
          [Vs, 0],
          [0, Vs / R],
        ];
      }
      if (VD !== undefined) {
        xMax = Math.max(xMax, VD * 1.3);
        curves.push({
          d: [
            [0, 0],
            [VD, 0],
            [VD, yMax * 1.5],
          ],
          heavy: true,
          label: 'Diode, constant drop',
        });
        const Q = Vs !== undefined && R !== undefined ? dropQ(Vs, VD, R) : undefined;
        if (Q) q = { v: Q.V, i: Q.I, text: `${fig(V(Q.V))} ${vUnit}, ${fig(I(Q.I))} ${iUnit}` };
        else if (Vs !== undefined && Vs <= VD)
          notes.push('Below its drop the diode is off: no current flows.');
      }
    }
  } else {
    const [kn, Vgs0, Vt, Vds] = [num(spec.kn), num(spec.Vgs), num(spec.Vt), num(spec.Vds)];
    // V_GS as the page's overdrive places it (V_t + V_OV), so Q sits on the heavy curve.
    const ovGiven = num(spec.Vov);
    const Vgs = ovGiven !== undefined && Vt !== undefined ? Vt + ovGiven : Vgs0;
    const VDD = num(spec.load?.VDD);
    const RD = num(spec.load?.RD);
    if (kn !== undefined && Vgs !== undefined && Vt !== undefined && kn > 0) {
      const family = (spec.family ?? [Vgs - 0.5, Vgs + 0.5, Vgs + 1]).filter(
        (v) => v > Vt && Math.abs(v - Vgs) > 1e-9,
      );
      const all = [...family, Vgs].filter((v) => v > Vt);
      const ovMax = Math.max(0.1, ...all.map((v) => v - Vt));
      xMax = Math.max((Vds ?? 0) * 1.6, ovMax * 1.7, VDD ?? 0, 1);
      yMax = Math.max(0.5 * kn * ovMax * ovMax, VDD !== undefined && RD ? VDD / RD : 0) * 1.15;
      const line = (vgs: number) =>
        Array.from({ length: 81 }, (_, k) => {
          const v = (xMax * k) / 80;
          return [v, mosfetId(kn, vgs - Vt, v)] as [number, number];
        });
      for (const v of family.sort((a, b) => a - b))
        curves.push({ d: line(v), heavy: false, label: `${fig(v)} V` });
      if (Vgs > Vt) curves.push({ d: line(Vgs), heavy: true, label: `${fig(Vgs)} V` });
      else notes.push('V_GS is below V_t: no channel, no current (cutoff).');
      for (let k = 0; k <= 40; k++) {
        const v = (ovMax * 1.02 * k) / 40;
        edgeCurve.push([v, 0.5 * kn * v * v]);
      }
      if (VDD !== undefined && RD !== undefined && RD > 0)
        load = [
          [VDD, 0],
          [0, VDD / RD],
        ];
      const Vov = Vgs - Vt;
      if (Vov > 0) {
        const vq = Vds ?? Vov;
        q = {
          v: vq,
          i: mosfetId(kn, Vov, vq),
          text:
            Vds === undefined
              ? `edge, V_DS = ${fig(Vov)} V`
              : `${fig(vq)} V, ${fig(I(mosfetId(kn, Vov, vq)))} ${iUnit}`,
        };
      }
    }
  }

  return (
    <>
      <Canvas aspect={(w) => H / w}>
        {({ w, h }) => {
          const rightPad = spec.device === 'mosfet' ? 48 : 14;
          const px0 = 46;
          const px1 = w - rightPad;
          const py0 = 22;
          const py1 = h - 44;
          const sx = (v: number) => px0 + ((v - xMin) / (xMax - xMin)) * (px1 - px0);
          const sy = (i: number) => py1 - (Math.min(i, yMax * 1.3) / yMax) * (py1 - py0);
          const clipY = (y: number) => Math.max(py0, y);
          const path = (pts: [number, number][]) =>
            pts
              .filter(([v]) => v >= xMin - 1e-9)
              // Up to the top of the plot, then stop (an upright line keeps its top point).
              .filter((p, k, all) => k === 0 || sy(all[k - 1]![1]) >= py0)
              .map(([v, i], k) => `${k ? 'L' : 'M'} ${sx(v).toFixed(1)} ${clipY(sy(i)).toFixed(1)}`)
              .join(' ');
          const xStep = niceStep(V(xMax - xMin), 4);
          const yStep = niceStep(I(yMax), 4);
          const xTicks: number[] = [];
          for (let t = Math.ceil(V(xMin) / xStep) * xStep; t <= V(xMax) + 1e-9; t += xStep)
            xTicks.push(Number(t.toPrecision(6)));
          const yTicks: number[] = [];
          for (let t = 0; t <= I(yMax) + 1e-9; t += yStep) yTicks.push(Number(t.toPrecision(6)));
          // MOSFET: each curve's V_GS at the right edge, spread so none overlap.
          const tags =
            spec.device === 'mosfet' ? curves.map((cv) => sy(cv.d[cv.d.length - 1]![1]) + 4) : [];
          const tagY = spread(tags, 15, py0 + 8, py1 - 2);
          const loadMid = load
            ? { x: (sx(load[0][0]) + sx(load[1][0])) / 2, y: (sy(load[0][1]) + sy(load[1][1])) / 2 }
            : undefined;
          return (
            <Svg width={w} height={h}>
              {/* Grid, axes and ticks. */}
              {yTicks.map((t) => (
                <G key={`y${t}`}>
                  <Line
                    x1={px0}
                    x2={px1}
                    y1={sy(t * iFactor)}
                    y2={sy(t * iFactor)}
                    stroke={c.chartGrid}
                    strokeWidth={1}
                  />
                  <ChartText
                    x={px0 - 5}
                    y={sy(t * iFactor) + 4}
                    fontSize={LABEL}
                    textAnchor="end"
                    fill={c.chartMuted}
                  >
                    {formatNumber(t)}
                  </ChartText>
                </G>
              ))}
              {xTicks.map((t) => (
                <G key={`x${t}`}>
                  <Line
                    x1={sx(t * vFactor)}
                    x2={sx(t * vFactor)}
                    y1={py0}
                    y2={py1}
                    stroke={c.chartGrid}
                    strokeWidth={1}
                  />
                  <ChartText
                    x={sx(t * vFactor)}
                    y={py1 + 15}
                    fontSize={LABEL}
                    textAnchor="middle"
                    fill={c.chartMuted}
                  >
                    {formatNumber(t)}
                  </ChartText>
                </G>
              ))}
              <Line x1={px0} x2={px1} y1={py1} y2={py1} stroke={c.chartInk} strokeWidth={1.5} />
              <Line x1={px0} x2={px0} y1={py0} y2={py1} stroke={c.chartInk} strokeWidth={1.5} />
              <ChartText
                x={px0 - 5}
                y={py0 - 8}
                fontSize={LABEL}
                fontWeight="700"
                textAnchor="start"
              >
                {`${spec.device === 'diode' ? 'I' : 'I_D'} (${iUnit})`}
              </ChartText>
              <ChartText x={px1} y={py1 + 32} fontSize={LABEL} fontWeight="700" textAnchor="end">
                {`${spec.device === 'diode' ? 'V' : 'V_DS'} (${vUnit})`}
              </ChartText>
              {/* MOSFET: the triode–saturation edge, dashed, and the regions named. */}
              {regions && edgeCurve.length ? (
                <>
                  <Path
                    d={path(edgeCurve)}
                    fill="none"
                    stroke={c.chartMuted}
                    strokeWidth={1.5}
                    strokeDasharray={chart.dash}
                  />
                  <ChartText x={px0 + 6} y={py0 + 14} fontSize={LABEL} fill={c.chartMuted} halo>
                    Triode
                  </ChartText>
                  <ChartText
                    x={px1 - 6}
                    y={py1 - 8}
                    fontSize={LABEL}
                    fill={c.chartMuted}
                    textAnchor="end"
                    halo
                  >
                    Saturation
                  </ChartText>
                </>
              ) : null}
              {/* The load line. */}
              {load ? (
                <>
                  <Line
                    x1={sx(load[0][0])}
                    y1={sy(load[0][1])}
                    x2={sx(load[1][0])}
                    y2={clipY(sy(load[1][1]))}
                    stroke={c.chartSecond}
                    strokeWidth={2}
                  />
                  <ChartText
                    {...fitLabel(loadMid!.x + 10, 'Load line', LABEL, px1, 'start')}
                    y={loadMid!.y - 6}
                    fontSize={LABEL}
                    fill={c.chartSecond}
                    fontWeight="700"
                    halo
                  >
                    Load line
                  </ChartText>
                </>
              ) : null}
              {/* The device's curves. */}
              {curves.map((cv, k) => (
                <Path
                  key={`c${k}`}
                  d={path(cv.d)}
                  fill="none"
                  stroke={cv.heavy ? c.chartHighlight : c.chartMuted}
                  strokeWidth={cv.heavy ? 2.6 : 1.4}
                />
              ))}
              {spec.device === 'mosfet'
                ? curves.map((cv, k) => (
                    <ChartText
                      key={`t${k}`}
                      x={px1 + 4}
                      y={tagY[k]}
                      fontSize={LABEL}
                      fontWeight={cv.heavy ? '700' : '400'}
                      fill={cv.heavy ? c.chartInk : c.chartMuted}
                    >
                      {cv.label}
                    </ChartText>
                  ))
                : null}
              {spec.device === 'mosfet' ? (
                <ChartText x={w - 2} y={py0 - 8} fontSize={LABEL} fontWeight="700" textAnchor="end">
                  V_GS
                </ChartText>
              ) : null}
              {/* Diode: the curve named beside its steep part. */}
              {spec.device === 'diode' && curves[0] ? (
                <ChartText
                  {...(spec.model === 'shockley'
                    ? { x: px0 + 6, textAnchor: 'start' as const }
                    : fitLabel(
                        sx(curves[0].d[1]![0]) + 8,
                        'Diode (constant drop)',
                        LABEL,
                        px1,
                        'start',
                        8,
                      ))}
                  y={py0 + 14}
                  fontSize={LABEL}
                  fill={c.chartHighlight}
                  fontWeight="700"
                  halo
                >
                  {spec.model === 'shockley' ? 'Shockley diode' : 'Diode (constant drop)'}
                </ChartText>
              ) : null}
              {/* Ten times the current: ΔV = nV_T ln 10. */}
              {decade ? (
                <G>
                  <Line
                    x1={sx(decade.v1)}
                    x2={sx(decade.v1)}
                    y1={sy(decade.i2)}
                    y2={py1}
                    stroke={c.chartMuted}
                    strokeWidth={1}
                    strokeDasharray={chart.dashFine}
                  />
                  <Line
                    x1={sx(decade.v2)}
                    x2={sx(decade.v2)}
                    y1={sy(decade.i2)}
                    y2={py1}
                    stroke={c.chartMuted}
                    strokeWidth={1}
                    strokeDasharray={chart.dashFine}
                  />
                  <Line
                    x1={sx(decade.v1)}
                    x2={sx(decade.v2)}
                    y1={sy(decade.i2)}
                    y2={sy(decade.i2)}
                    stroke={c.chartInk}
                    strokeWidth={1.5}
                  />
                  <ChartText
                    x={sx(decade.v1) - 6}
                    textAnchor="end"
                    y={sy(decade.i2) + 4}
                    fontSize={LABEL}
                    fontWeight="700"
                    halo
                  >
                    {`ΔV = ${typeof spec.decade === 'string' && rep.known(spec.decade) ? sv(spec.decade) : '?'}`}
                  </ChartText>
                  <Line
                    x1={sx(decade.v1)}
                    x2={sx(decade.v1)}
                    y1={sy(decade.i2) - 5}
                    y2={sy(decade.i2) + 5}
                    stroke={c.chartInk}
                    strokeWidth={1.5}
                  />
                  <Circle cx={sx(decade.v2)} cy={sy(decade.i2)} r={4} fill={c.chartMuted} />
                  <ChartText x={sx(decade.v2) + 7} y={sy(decade.i2) + 4} fontSize={LABEL} halo>
                    10I
                  </ChartText>
                </G>
              ) : null}
              {/* The Q point. */}
              {q ? (
                <G>
                  <Line
                    x1={sx(q.v)}
                    x2={sx(q.v)}
                    y1={sy(q.i)}
                    y2={py1}
                    stroke={c.chartInk}
                    strokeWidth={1}
                    strokeDasharray={chart.dashFine}
                  />
                  <Line
                    x1={px0}
                    x2={sx(q.v)}
                    y1={sy(q.i)}
                    y2={sy(q.i)}
                    stroke={c.chartInk}
                    strokeWidth={1}
                    strokeDasharray={chart.dashFine}
                  />
                  <Circle
                    cx={sx(q.v)}
                    cy={sy(q.i)}
                    r={5.5}
                    fill={c.chartInk}
                    stroke={c.background}
                    strokeWidth={1.5}
                  />
                  <ChartText
                    {...(spec.model === 'shockley'
                      ? { x: sx(q.v) - 8, textAnchor: 'end' as const }
                      : fitLabel(sx(q.v) + 9, `Q (${q.text})`, LABEL, px1, 'start', 9))}
                    y={
                      spec.model === 'shockley'
                        ? sy(q.i) - 9
                        : sy(q.i) - 8 < py0 + 26
                          ? sy(q.i) + 18
                          : sy(q.i) - 8
                    }
                    fontSize={LABEL}
                    fontWeight="700"
                    halo
                  >
                    {`Q (${q.text})`}
                  </ChartText>
                </G>
              ) : null}
            </Svg>
          );
        }}
      </Canvas>
      <Caption>{captionOf()}</Caption>
    </>
  );

  function captionOf() {
    const t = (x: string | number | undefined) =>
      x === undefined
        ? '?'
        : typeof x === 'number'
          ? fig(x)
          : rep.known(x)
            ? rep.value(x, false)
            : '?';
    const lines = [...notes];
    if (spec.device === 'diode' && spec.model !== 'shockley')
      lines.push(
        `I = (${t(spec.Vs)} − ${t(spec.VD)}) ÷ ${t(spec.R)} = ${typeof spec.I === 'string' ? sv(spec.I) : '?'}`,
      );
    if (spec.device === 'diode' && spec.model === 'shockley' && typeof spec.I === 'string')
      lines.push(`At V = ${t(spec.V)} V the diode carries ${sv(spec.I)}.`);
    if (spec.device === 'diode' && spec.model === 'shockley' && typeof spec.decade === 'string')
      lines.push(`Ten times the current takes ${sv(spec.decade)} more.`);
    if (spec.device === 'mosfet' && typeof spec.Id === 'string')
      lines.push(
        spec.Vds === undefined
          ? `Saturation: ½ × ${t(spec.kn)} × ${t(spec.Vov ?? '')}² = ${sv(spec.Id)}`
          : `Triode: ${t(spec.kn)} × (${t(spec.Vov ?? '')} × ${t(spec.Vds)} − ½ × ${t(spec.Vds)}²) = ${sv(spec.Id)}`,
      );
    return lines.join(' · ');
  }
}

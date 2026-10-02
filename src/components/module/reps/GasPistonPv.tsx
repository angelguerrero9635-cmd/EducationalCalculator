/**
 * HC43 `gasPiston` `pv` (round 3, group G): the piston beside its P–V diagram. The cylinder is
 * drawn at state 2 with state 1's piston dashed; the diagram draws the path from state 1 to 2 to
 * scale (an isotherm, an adiabat, an isobar or an isochore, or a cycle's legs), the area under
 * it shaded as the work with its sign, and the isotherms through both ends dashed. A "?" draws
 * nothing for its state. Drag state 2 along the path.
 */
import { useRef } from 'react';
import { View } from 'react-native';
import Svg, { Circle, Defs, G, Path, Polyline } from 'react-native-svg';

import type { NumOrVar } from '@/data/modules/typesGraphs';
import type { GasPv } from '@/data/modules/typesHe3g';
import type { GasPistonSpec } from '@/data/modules/typesHsj';
import { formatNumber } from '@/engine/format';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, Caption, ChartText, DragHandle, useFrozen, useRep } from './common';
import { Cylinder } from './gasHe3gKit';
import { particleCount } from './gasModel';
import {
  R_J,
  areaUnder,
  isLatm,
  legPoints,
  pathPressure,
  pressureUnitFor,
  pvOutline,
  pvWork,
  solvePv,
  type PvSolved,
} from './gasPvMath';
import { arrowHead } from './graphKit';
import { fig3 } from './he1dText';
import { MathChip } from './hsdText';
import { axisOf, leftFor, makePlot, PlotFrame, spread } from './hsjPlot';
import { Ball, Glass, Sheen, usePaintIds } from './paint';

type Rep = ReturnType<typeof useRep>;

const SUB = ['₁', '₂', '₃', '₄', '₅', '₆'];

/** A signed number to 3 figures ("+1730", "−1720"). */
const signed = (x: number) => (x > 0 ? `+${fig3(x)}` : fig3(x));

export function GasPistonPv({ spec, calc }: { spec: GasPistonSpec; calc: Calculator }) {
  const pv = spec.pv!;
  const c = usePalette();
  const rep = useRep(calc);
  const ids = usePaintIds('glass', 'sheen', 'rod', 'ball');
  const start = useRef(0);
  const num = (x: NumOrVar | undefined) =>
    x === undefined ? undefined : typeof x === 'number' ? x : rep.known(x) ? rep.val(x) : undefined;
  // The frame only: every value, the example's where a box shows "?" (nothing is drawn there).
  const any = (x: NumOrVar | undefined) =>
    x === undefined ? undefined : typeof x === 'number' ? x : rep.val(x);
  const solved = solvePv(pv, num);
  const framed = solvePv(pv, any) ?? solved;
  const R = pv.R ?? R_J;
  const vId = (pv.path === 'cycle' ? pv.corners?.[0]?.volume : pv.v1) ?? spec.volume;
  const vUnit = (typeof vId === 'string' ? rep.variable(vId)?.unit : undefined) ?? 'L';
  const pUnit =
    pv.units?.pressure ??
    (typeof pv.p1 === 'string' ? rep.variable(pv.p1)?.unit : undefined) ??
    pressureUnitFor(vUnit, R);
  const wUnit =
    pv.units?.work ??
    (typeof pv.work === 'string' ? rep.variable(pv.work)?.unit : undefined) ??
    (isLatm(R) ? 'L·atm' : 'J');
  const by = (pv.sign ?? 'by') === 'by';
  const sts = framed?.states ?? [];
  const vTop = Math.max(1e-9, ...sts.map((s) => s.v));
  const pTop = Math.max(1e-9, ...sts.map((s) => s.p));
  const live = { x: axisOf(0, vTop * 1.18, 4), y: axisOf(0, pTop * 1.15, 4) };
  const frame = useFrozen(live);
  const W = solved && solved.legs.length ? pvWork(solved) : undefined;
  const shown = W === undefined ? undefined : by ? W : -W;
  const sym = by ? 'W' : 'w';
  const workText =
    typeof pv.work === 'string' && rep.known(pv.work)
      ? `${rep.variable(pv.work).symbol} = ${signed(rep.val(pv.work))} ${wUnit}`
      : shown === undefined
        ? undefined
        : `${pv.path === 'cycle' ? `${sym} net` : sym} = ${signed(shown)} ${wUnit}`;
  const v2Id =
    pv.path !== 'cycle' && pv.path !== 'isochoric' && typeof pv.v2 === 'string' ? pv.v2 : undefined;
  const specIds = [pv.v1, pv.p1, pv.t1, pv.moles, pv.gamma, pv.cv].filter(
    (x): x is string => typeof x === 'string',
  );
  const n = num(pv.moles);
  const count = n !== undefined && n > 0 ? Math.min(40, particleCount(n)) : 20;

  return (
    <View>
      <Canvas aspect={(w) => Math.min(0.92, 330 / w)}>
        {({ w, h }) => {
          const panel = Math.max(80, Math.min(120, w * 0.26));
          const pl = makePlot(w, h, frame.value.x, frame.value.y, {
            L: panel + leftFor(frame.value.y, 46) - 4,
            B: 38,
            T: 16,
            R: 10,
          });
          const X = (v: number) => pl.sx(v);
          const Y = (p: number) => pl.sy(p);
          const outline = solved ? pvOutline(solved) : [];
          const pts = (xs: [number, number][]) => xs.map(([v, p]) => `${X(v)},${Y(p)}`).join(' ');
          const ex = solved?.states ?? [];
          const vRight = frame.value.x.hi;
          const pHi = frame.value.y.hi;
          // Isotherms through the ends (P = const ÷ V), dashed; one when both share a T.
          const consts = ex
            .map((s, i) => ({ k: s.p * s.v, i, t: s.t }))
            .filter((x, j, all) => all.findIndex((y) => Math.abs(y.k - x.k) < 1e-9 * x.k) === j);
          const isoLegs = solved?.legs.every((l) => l === 'isothermal') ?? false;
          const isotherms = isoLegs && !solved?.closed ? [] : consts;
          const isoLabels = spread(
            isotherms.map((s) => Y(s.k / vRight) - 5),
            15,
          );
          // The area: under the path for one leg, the enclosed loop for a cycle.
          const fill =
            outline.length > 1
              ? solved!.closed
                ? `M ${pts(outline).split(' ').join(' L ')} Z`
                : `M ${X(outline[0]![0])} ${Y(0)} L ${pts(outline).split(' ').join(' L ')} L ${X(outline[outline.length - 1]![0])} ${Y(0)} Z`
              : undefined;
          const positive = (W ?? 0) >= 0;
          const tint = positive ? c.gasPiston3gWorkBy : c.gasPiston3gWorkOn;
          // Where the work's chip goes: inside the shaded area.
          const vs = outline.map(([v]) => v);
          const midV = vs.length ? (Math.min(...vs) + Math.max(...vs)) / 2 : 0;
          const midP = outline.length
            ? solved!.closed
              ? (Math.min(...outline.map(([, p]) => p)) + Math.max(...outline.map(([, p]) => p))) /
                2
              : pathPressure(solved!.legs[0]!, ex[0]!, Math.max(1e-9, midV), solved!.gamma) * 0.42
            : 0;
          // The cylinder at state 2 (a cycle: state 1), state 1's piston dashed.
          const top = 34;
          const bottom = h - pl.B;
          const cyl = { left: panel * 0.18, cw: Math.min(54, panel * 0.5) };
          const vy = (v: number) => bottom - (v / vRight) * (bottom - top);
          const now = ex.length ? (solved!.closed ? ex[0]! : ex[ex.length - 1]!) : undefined;
          const handle =
            v2Id && !pv.fixed && ex.length === 2 ? { x: X(ex[1]!.v), y: Y(ex[1]!.p) } : undefined;
          return (
            <>
              <Svg width={w} height={h}>
                <Defs>
                  <Glass id={ids.glass} />
                  <Sheen id={ids.sheen} strength={0.8} />
                  <Sheen id={ids.rod} strength={1.2} />
                  <Ball id={ids.ball} color={c.gasParticle} />
                </Defs>
                <Cylinder
                  left={cyl.left}
                  cw={cyl.cw}
                  top={top}
                  bottom={bottom}
                  py={now ? Math.max(top + 4, vy(now.v)) : vy(vRight * 0.6)}
                  ghost={!solved?.closed && ex.length === 2 ? vy(ex[0]!.v) : undefined}
                  count={now ? count : 0}
                  kelvins={now?.t}
                  paint={ids}
                />
                <ChartText
                  x={cyl.left + cyl.cw / 2}
                  y={h - 8}
                  textAnchor="middle"
                  fontSize={chart.label}
                  fontWeight="700"
                >
                  {solved?.closed ? 'State 1' : 'State 2'}
                </ChartText>
                <PlotFrame p={pl} xName={`V (${vUnit})`} yName="" />
                <ChartText
                  x={panel + 10}
                  y={(pl.T + h - pl.B) / 2}
                  textAnchor="middle"
                  fontSize={chart.label}
                  transform={`rotate(-90 ${panel + 10} ${(pl.T + h - pl.B) / 2})`}
                >
                  {`P (${pUnit})`}
                </ChartText>
                {fill ? <Path d={fill} fill={tint} opacity={0.3} /> : null}
                {isotherms.map((s, j) => {
                  const vFrom = Math.max(s.k / pHi, frame.value.x.step * 0.05);
                  const curve = Array.from({ length: 41 }, (_, i) => {
                    const v = vFrom + ((vRight - vFrom) * i) / 40;
                    return [v, s.k / v] as [number, number];
                  });
                  const name = `T${SUB[s.i] ?? ''}`;
                  return (
                    <G key={`iso${j}`}>
                      <Polyline
                        points={pts(curve)}
                        fill="none"
                        stroke={c.chartMuted}
                        strokeWidth={chart.strokeLight}
                        strokeDasharray={chart.dash}
                      />
                      <ChartText
                        x={w - pl.R - 2}
                        y={isoLabels[j]}
                        textAnchor="end"
                        fontSize={chart.label}
                        fill={c.chartMuted}
                        halo
                      >
                        {name}
                      </ChartText>
                    </G>
                  );
                })}
                {solved?.legs.map((leg, i) => {
                  const a = ex[i]!;
                  const b = ex[(i + 1) % ex.length]!;
                  const line = legPoints(leg, a, b, solved.gamma);
                  const m = line[Math.floor(line.length / 2)]!;
                  const m2 = line[Math.min(line.length - 1, Math.floor(line.length / 2) + 1)]!;
                  const [dx, dy] =
                    leg === 'isochoric'
                      ? [0, Y(b.p) - Y(a.p)]
                      : [X(m2[0]) - X(m[0]), Y(m2[1]) - Y(m[1])];
                  const mid =
                    leg === 'isochoric'
                      ? { x: X(a.v), y: (Y(a.p) + Y(b.p)) / 2 }
                      : { x: X(m[0]), y: Y(m[1]) };
                  return (
                    <G key={`leg${i}`}>
                      <Polyline
                        points={pts(line)}
                        fill="none"
                        stroke={c.chartHighlight}
                        strokeWidth={chart.strokeHeavy}
                        strokeLinejoin="round"
                      />
                      {Math.hypot(dx, dy) > 0 ? (
                        <Path d={arrowHead(mid.x, mid.y, dx, dy, 10)} fill={c.chartHighlight} />
                      ) : null}
                    </G>
                  );
                })}
                {ex.map((s, i) => {
                  const right = i === ex.length - 1 && !solved?.closed;
                  return (
                    <G key={`s${i}`}>
                      <Circle
                        cx={X(s.v)}
                        cy={Y(s.p)}
                        r={4.5}
                        fill={c.card}
                        stroke={c.chartInk}
                        strokeWidth={2}
                      />
                      <ChartText
                        x={X(s.v) + (right ? 8 : -8)}
                        y={Y(s.p) - 8}
                        textAnchor={right ? 'start' : 'end'}
                        fontSize={chart.value}
                        fontWeight="700"
                        halo
                      >
                        {String(i + 1)}
                      </ChartText>
                    </G>
                  );
                })}
                {workText && fill && pv.path !== 'isochoric' ? (
                  <MathChip
                    x={X(midV)}
                    y={Y(midP) + 5}
                    text={workText}
                    anchor="middle"
                    color={positive ? c.chartInk : c.hopBack}
                    w={w}
                    h={h}
                  />
                ) : null}
              </Svg>
              {handle && v2Id ? (
                <DragHandle
                  testID="drag-state2"
                  x={handle.x}
                  y={handle.y}
                  label="state 2's volume (move along the path)"
                  onStart={() => {
                    start.current = rep.val(v2Id);
                    frame.freeze();
                  }}
                  onMove={(dx) => {
                    const perPx = (frame.value.x.hi - frame.value.x.lo) / (w - pl.L - pl.R);
                    const v = Math.max(perPx, start.current + dx * perPx);
                    calc.set(
                      {
                        ...(pv.keep ? rep.pin(pv.keep) : rep.pinTyped(specIds)),
                        [v2Id]: rep.snapTo(v2Id, v),
                      },
                      rep.slide(v2Id),
                    );
                  }}
                  onEnd={frame.release}
                />
              ) : null}
            </>
          );
        }}
      </Canvas>
      <Caption>{captionOf(pv, rep, solved, W, { pUnit, vUnit, wUnit, R })}</Caption>
    </View>
  );
}

function captionOf(
  pv: GasPv,
  rep: Rep,
  s: PvSolved | undefined,
  W: number | undefined,
  u: { pUnit: string; vUnit: string; wUnit: string; R: number },
): string {
  if (!s || !s.legs.length)
    return pv.path === 'adiabatic' && s
      ? 'Type γ (or the heat capacity) and V₂ to draw the adiabat.'
      : 'Type the states (V₁, V₂ and T or P) to draw the path.';
  const by = (pv.sign ?? 'by') === 'by';
  const out: string[] = [];
  const p = (x: number) => `${fig3(x)} ${u.pUnit}`;
  const v = (x: number) => formatNumber(Number(x.toPrecision(4)));
  const [a, b] = [s.states[0]!, s.states[1]];
  const area = Math.abs(areaUnder(pvOutline(s)));
  const sign =
    (W ?? 0) > 0
      ? 'expands: it does work'
      : (W ?? 0) < 0
        ? 'is compressed: work is done on it'
        : 'does no work';
  if (pv.path === 'cycle') {
    out.push(
      `The loop encloses ${fig3(Math.abs(W!))} ${u.wUnit}: the net work.`,
      W! >= 0
        ? `Clockwise, so the gas does net work: ${by ? 'W' : 'w'} = ${signed(by ? W! : -W!)} ${u.wUnit}.`
        : `Counterclockwise, so net work is done on the gas: ${by ? 'W' : 'w'} = ${signed(by ? W! : -W!)} ${u.wUnit}.`,
    );
  } else {
    const nRT = `${v(a.p * a.v)} ${u.pUnit}·${u.vUnit}`;
    switch (pv.path) {
      case 'isothermal':
        out.push(
          `PV = nRT = ${nRT} at both ends: P₁ = ${p(a.p)}, P₂ = ${p(b!.p)}.`,
          `${by ? 'W' : 'w'} = ${by ? '' : '−'}nRT ln(V₂/V₁) = ${by ? '' : '−'}${v(a.p * a.v)} × ln(${v(b!.v)}/${v(a.v)}) = ${signed(by ? W! : -W!)} ${u.wUnit}`,
        );
        break;
      case 'adiabatic':
        out.push(
          `P₂ = P₁(V₁/V₂)^γ = ${fig3(a.p)} × (${v(a.v)}/${v(b!.v)})^${v(s.gamma)} = ${p(b!.p)}`,
          ...(a.t !== undefined && b!.t !== undefined
            ? [
                `T₂ = T₁(V₁/V₂)^(γ − 1) = ${fig3(b!.t)} K, so the gas ${b!.t < a.t ? 'cools' : 'warms'}.`,
              ]
            : []),
          `${by ? 'W' : 'w'} = ${by ? '' : '−'}(P₁V₁ − P₂V₂)/(γ − 1) = ${signed(by ? W! : -W!)} ${u.wUnit}`,
        );
        break;
      case 'isobaric':
        out.push(
          `P is held at ${p(a.p)}: ${by ? 'W' : 'w'} = ${by ? '' : '−'}P(V₂ − V₁) = ${signed(by ? W! : -W!)} ${u.wUnit}`,
        );
        break;
      case 'isochoric':
        out.push(
          `V is held at ${v(a.v)} ${u.vUnit}: P goes from ${p(a.p)} to ${p(b!.p)} with no area under the path, so no work.`,
        );
        break;
    }
    if (pv.path !== 'isochoric')
      out.push(
        `The shaded area is ${fig3(area)} ${u.wUnit}. The gas ${sign}, so ${by ? 'W' : 'w'} is ${(by ? W! : -W!) >= 0 ? 'positive' : 'negative'}.`,
      );
  }
  if (typeof pv.heat === 'string' && rep.known(pv.heat))
    out.push(`${rep.variable(pv.heat).symbol} = ${signed(rep.val(pv.heat))} ${u.wUnit}.`);
  // The dashed isotherms, named once (the curves carry T₁, T₂ only).
  const temps = s.states
    .map((x, i) => ({ t: x.t, i }))
    .filter(
      (x, j, all) =>
        x.t !== undefined &&
        all.findIndex((y) => y.t !== undefined && Math.abs(y.t - x.t!) < 1e-9 * x.t!) === j,
    );
  const iso = s.legs.every((l) => l === 'isothermal') && !s.closed;
  if (temps.length && !iso)
    out.push(
      `Dashed: the isotherms ${temps.map((x) => `T${SUB[x.i] ?? ''} = ${fig3(x.t!)} K`).join(', ')}.`,
    );
  return out.join(' · ');
}

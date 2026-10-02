/**
 * A property plane (HC17, `propertyDiagram`; ME-P10, ACC-P10), flat like a chart: water's vapor
 * dome on T–v, P–v or T–s (computed from the IAPWS saturation equations in
 * propertyDiagramMath.ts, never read off a chart), states as numbered dots, processes and whole
 * cycles with q_in and q_out; air on T–s with its constant-pressure lines; a real gas's isotherm
 * (van der Waals or virial) beside the ideal one on P–v. A value still "?" draws nothing of its
 * own.
 */
import { useRef, type ReactNode } from 'react';
import { View } from 'react-native';
import Svg, { Circle, G, Line, Path } from 'react-native-svg';

import { formatNumber } from '@/engine/format';
import type { NumOrVar } from '@/data/modules/typesGraphs';
import type { PdState, PropertyDiagramSpec } from '@/data/modules/typesHe2c';
import { chart, usePalette, type Palette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, Caption, ChartText, DragHandle } from './common';
import { Arrow } from './he1fKit';
import { sig, ticks, useReadSpec } from './phaseEnvelopeKit';
import {
  gasConstants,
  gasIsobar,
  P_TO_PA,
  pdUnits,
  resolveStates,
  satAtP,
  stepPathTs,
  V_TO_SI,
  vdwCritical,
  vdwP,
  virialB,
  waterDome,
  WATER_CRIT,
  type PdGetter,
  type PdPoint,
} from './propertyDiagramMath';

type Pt = [number, number];

export const poly = (ps: Pt[]) =>
  ps.map(([x, y], i) => `${i ? 'L' : 'M'} ${x.toFixed(2)} ${y.toFixed(2)}`).join(' ');

// ─── Axes ────────────────────────────────────────────────────────────────────

interface Axis {
  log: boolean;
  lo: number;
  hi: number;
  name: string;
}

/** Maps a value to a pixel along [p0, p1] on a linear or log axis. */
const scaler = (a: Axis, p0: number, p1: number) => (x: number) => {
  const f = a.log
    ? (Math.log10(x) - Math.log10(a.lo)) / (Math.log10(a.hi) - Math.log10(a.lo))
    : (x - a.lo) / (a.hi - a.lo);
  return p0 + f * (p1 - p0);
};

/** Tick values: whole decades on a log axis, nice steps on a linear one. */
function tickValues(a: Axis): number[] {
  if (a.log) {
    const out: number[] = [];
    for (let k = Math.ceil(Math.log10(a.lo) - 1e-9); k <= Math.floor(Math.log10(a.hi) + 1e-9); k++)
      out.push(10 ** k);
    return out;
  }
  return ticks(a.lo, a.hi, 5).out.filter((v) => v >= a.lo - 1e-9 && v <= a.hi + 1e-9);
}

const tickText = (x: number) => formatNumber(Number(x.toPrecision(6)));

function Frame({
  c,
  box,
  xa,
  ya,
  sx,
  sy,
}: {
  c: Palette;
  box: { l: number; r: number; t: number; b: number };
  xa: Axis;
  ya: Axis;
  sx: (x: number) => number;
  sy: (y: number) => number;
}) {
  const { l, r, t, b } = box;
  return (
    <G>
      {tickValues(ya).map((y) => (
        <G key={`y${y}`}>
          <Line x1={l} y1={sy(y)} x2={r} y2={sy(y)} stroke={c.chartGrid} strokeWidth={0.8} />
          <ChartText
            x={l - 4}
            y={sy(y) + 4}
            textAnchor="end"
            fontSize={chart.label}
            fill={c.chartMuted}
          >
            {tickText(y)}
          </ChartText>
        </G>
      ))}
      {tickValues(xa).map((x) => (
        <G key={`x${x}`}>
          <Line x1={sx(x)} y1={t} x2={sx(x)} y2={b} stroke={c.chartGrid} strokeWidth={0.8} />
          <ChartText
            x={sx(x)}
            y={b + 16}
            textAnchor="middle"
            fontSize={chart.label}
            fill={c.chartMuted}
          >
            {tickText(x)}
          </ChartText>
        </G>
      ))}
      <Line x1={l} y1={t} x2={l} y2={b} stroke={c.chartInk} strokeWidth={1.2} />
      <Line x1={l} y1={b} x2={r} y2={b} stroke={c.chartInk} strokeWidth={1.2} />
      <ChartText x={(l + r) / 2} y={b + 32} textAnchor="middle" fontSize={chart.label}>
        {xa.name}
      </ChartText>
      <ChartText x={4} y={t - 10} fontSize={chart.label}>
        {ya.name}
      </ChartText>
    </G>
  );
}

// ─── Labels that keep clear of each other ────────────────────────────────────

interface Box {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
}

type Anchor = 'start' | 'middle' | 'end';

/** Offsets tried in turn round a point: right above, left above, right below, left below… */
const AROUND: [number, number, Anchor][] = [
  [8, -8, 'start'],
  [-8, -8, 'end'],
  [8, 17, 'start'],
  [-8, 17, 'end'],
  [0, -12, 'middle'],
  [0, 22, 'middle'],
  [12, 4, 'start'],
  [-12, 4, 'end'],
];

/**
 * Places each label at the first offset that overlaps nothing placed before (dots and labels)
 * and stays inside the canvas; else at the offset that overlaps least.
 */
function makePlacer(w: number, h: number) {
  const boxes: Box[] = [];
  const overlap = (a: Box, b: Box) =>
    Math.max(0, Math.min(a.x1, b.x1) - Math.max(a.x0, b.x0)) *
    Math.max(0, Math.min(a.y1, b.y1) - Math.max(a.y0, b.y0));
  const boxOf = (x: number, y: number, text: string, size: number, anchor: Anchor): Box => {
    const tw = [...text.replace(/_/g, '')].length * size * 0.56;
    const x0 = anchor === 'start' ? x : anchor === 'end' ? x - tw : x - tw / 2;
    return { x0, y0: y - size * 0.85, x1: x0 + tw, y1: y + size * 0.3 };
  };
  return {
    block: (b: Box) => boxes.push(b),
    dot: (x: number, y: number, r = 6) =>
      boxes.push({ x0: x - r, y0: y - r, x1: x + r, y1: y + r }),
    place: (
      x: number,
      y: number,
      text: string,
      size: number = chart.label,
      tries: [number, number, Anchor][] = AROUND,
    ) => {
      let best = {
        x,
        y,
        anchor: 'start' as Anchor,
        score: Infinity,
        box: undefined as Box | undefined,
      };
      tries.forEach(([dx, dy, anchor], i) => {
        const bx = boxOf(x + dx, y + dy, text, size, anchor);
        const out =
          Math.max(0, 2 - bx.x0) +
          Math.max(0, bx.x1 - (w - 2)) +
          Math.max(0, 2 - bx.y0) +
          Math.max(0, bx.y1 - (h - 2));
        const score = boxes.reduce((s, b) => s + overlap(bx, b), 0) + out * 50 + i * 0.01;
        if (score < best.score) best = { x: x + dx, y: y + dy, anchor, score, box: bx };
      });
      if (best.box) boxes.push(best.box);
      return { x: best.x, y: best.y, textAnchor: best.anchor };
    },
  };
}

// ─── The component ───────────────────────────────────────────────────────────

export function PropertyDiagram({ spec, calc }: { spec: PropertyDiagramSpec; calc: Calculator }) {
  if (spec.plane === 'Pv' && spec.substance === 'gas') return <Isotherm spec={spec} calc={calc} />;
  return <Plane spec={spec} calc={calc} />;
}

/** Reads spec fields in the variable's own unit; a "?" is undefined. */
function useGetter(calc: Calculator) {
  const { rep: base, read } = useReadSpec(calc);
  const get: PdGetter = (x) => {
    if (x === undefined) return undefined;
    if (typeof x === 'number') return x;
    return base.known(x) ? base.shown(x) : undefined;
  };
  // A worked-out value reads to 4 figures in the picture (3,200 kJ/kg, not 3,199.9301); a typed
  // one reads as typed.
  const value = (id: string, withUnit = true) => {
    if (!base.known(id) || base.typed(id)) return base.value(id, withUnit);
    const unit = base.unit(id);
    const num = formatNumber(Number(base.shown(id).toPrecision(4)));
    if (!withUnit || !unit) return num;
    return `${num}${['%', '°'].includes(unit) ? '' : ' '}${unit}`;
  };
  const rep = {
    ...base,
    value,
    label: (id: string, withUnit = true) => `${base.variable(id).symbol} = ${value(id, withUnit)}`,
  };
  return { rep, read, get };
}

const K = (T: number, toK: number) => T - toK;

/** Water and ideal-gas planes: T–v, P–v (water) and T–s. */
function Plane({ spec, calc }: { spec: PropertyDiagramSpec; calc: Calculator }) {
  const c = usePalette();
  const { rep, read, get } = useGetter(calc);
  const u = pdUnits(spec);
  const water = spec.substance === 'water';
  const pts = resolveStates(spec, get);
  const gas = water ? undefined : gasConstants(spec, get);
  const dome = water ? waterDome() : [];
  const start = useRef(0);

  // Axes from the plane and what is drawn on it.
  const placed = [...pts.values()];
  const Ts = placed.flatMap((p) => (p.T === undefined ? [] : [K(p.T, u.toK)]));
  let xa: Axis;
  let ya: Axis;
  const tName = `T (${u.T})`;
  if (spec.plane === 'Ts') {
    if (water) xa = { log: false, lo: 0, hi: 10, name: 's (kJ/(kg·K))' };
    else {
      const ss = placed.flatMap((p) => (p.s === undefined ? [] : [p.s]));
      const [s0, s1] = ss.length ? [Math.min(...ss), Math.max(...ss)] : [0, 1];
      const span = Math.max(s1 - s0, 0.3);
      const step = ticks(0, span * 1.4, 4).step;
      xa = {
        log: false,
        lo: Math.floor((s0 - 0.2 * span) / step) * step,
        hi: Math.ceil((s1 + 0.2 * span) / step) * step,
        name: `s − s${spec.states?.[0]?.name ? `_${spec.states[0].name}` : ''} (kJ/(kg·K))`,
      };
    }
    // Water from 0 °C (or 250 K) past the critical point; gas from 0 K, so areas are q.
    const lo = water && u.toK === 0 ? 250 : 0;
    const top = Math.max(water ? lo + 400 : 0, ...Ts.map((t) => t * 1.12));
    const step = ticks(lo, top, 5).step;
    ya = { log: false, lo, hi: Math.ceil(top / step) * step, name: tName };
  } else {
    xa = { log: true, lo: 10 ** -3.3, hi: 10 ** 2.3, name: 'v (m³/kg, log scale)' };
    if (spec.plane === 'Tv') {
      const lo = u.toK ? 0 : 250;
      const top = Math.max(lo + 400, ...Ts.map((t) => t * 1.1));
      const step = ticks(lo, top, 5).step;
      ya = { log: false, lo, hi: Math.ceil(top / step) * step, name: tName };
    } else {
      const f = u.toMPa;
      ya = { log: true, lo: 0.001 / f, hi: 100 / f, name: `P (${u.P}, log scale)` };
    }
  }

  // Coordinates of a state on this plane.
  const yOf = (p: PdPoint) =>
    spec.plane === 'Pv'
      ? p.P === undefined
        ? undefined
        : p.P / u.toMPa
      : p.T === undefined
        ? undefined
        : K(p.T, u.toK);
  const xOf = (p: PdPoint) => (spec.plane === 'Ts' ? p.s : p.v);

  // The tie line at the page's P.
  const tieP = get(spec.tie?.P);
  const sat = tieP !== undefined ? satAtP(tieP * u.toMPa) : undefined;
  const vf = get(spec.tie?.vf) ?? sat?.vf;
  const vg = get(spec.tie?.vg) ?? sat?.vg;

  const main = spec.states?.find((s) => !s.ideal);
  const mainPt = main ? pts.get(main.name) : undefined;
  const outOfDome = mainPt?.why !== undefined;

  const art = (w: number, h: number) => {
    const box = { l: 54, r: w - 20, t: 30, b: h - 42 };
    const sx = scaler(xa, box.l, box.r);
    const sy = scaler(ya, box.b, box.t);
    const inside = (x: number, y: number) =>
      x >= box.l - 0.5 && x <= box.r + 0.5 && y >= box.t - 0.5 && y <= box.b + 0.5;
    /** A curve on the plane, split where it leaves the plot. */
    const curve = (ps: Pt[]) => {
      const runs: Pt[][] = [];
      let run: Pt[] = [];
      for (const [x, y] of ps) {
        if (!(x > 0 || !xa.log) || !(y > 0 || !ya.log)) continue;
        const q: Pt = [sx(x), sy(y)];
        if (inside(...q)) run.push(q);
        else if (run.length) {
          runs.push(run);
          run = [];
        }
      }
      if (run.length) runs.push(run);
      return runs
        .filter((r) => r.length > 1)
        .map(poly)
        .join(' ');
    };
    const place = makePlacer(w, h);
    const parts: ReactNode[] = [];

    // The dome: liquid line up to the critical point, vapor line down.
    let domeLiquid: Pt[] = [];
    let domeVapor: Pt[] = [];
    if (water) {
      const yv = (d: { T: number; P: number }) =>
        spec.plane === 'Pv' ? d.P / u.toMPa : K(d.T, u.toK);
      domeLiquid = dome.map((d): Pt => [spec.plane === 'Ts' ? d.sf : d.vf, yv(d)]);
      domeVapor = dome.map((d): Pt => [spec.plane === 'Ts' ? d.sg : d.vg, yv(d)]);
      const ring = [...domeLiquid, ...[...domeVapor].reverse()];
      const fill = ring
        .filter(([x, y]) => (!xa.log || x > 0) && (!ya.log || y > 0))
        .map(([x, y]): Pt => [
          Math.min(box.r, Math.max(box.l, sx(x))),
          Math.min(box.b, Math.max(box.t, sy(y))),
        ]);
      parts.push(<Path key="domefill" d={`${poly(fill)} Z`} fill={c.propDome} />);
    }
    const frame = <Frame key="frame" c={c} box={box} xa={xa} ya={ya} sx={sx} sy={sy} />;
    parts.push(frame);
    if (water) {
      parts.push(
        <Path
          key="domeL"
          d={curve(domeLiquid)}
          stroke={c.chartInk}
          strokeWidth={chart.stroke}
          fill="none"
        />,
        <Path
          key="domeV"
          d={curve(domeVapor)}
          stroke={c.chartInk}
          strokeWidth={chart.stroke}
          fill="none"
        />,
      );
      const top = dome[dome.length - 1]!;
      const cx = sx(spec.plane === 'Ts' ? top.sf : top.vf);
      const cy = sy(spec.plane === 'Pv' ? WATER_CRIT.P / u.toMPa : K(WATER_CRIT.T, u.toK));
      parts.push(<Circle key="crit" cx={cx} cy={cy} r={4.5} fill={c.chartInk} />);
      place.dot(cx, cy, 5);
    }

    // Gas isobars across the plane.
    if (!water && spec.plane === 'Ts' && gas?.cp !== undefined && gas.R !== undefined) {
      const first = spec.states?.[0];
      const ref = first ? pts.get(first.name) : undefined;
      for (const ib of spec.isobars ?? []) {
        const P = get(ib.P);
        if (
          P === undefined ||
          !ref ||
          ref.P === undefined ||
          ref.T === undefined ||
          ref.s === undefined
        )
          continue;
        // Through (s, T) with s = c_p ln(T ÷ T_ref) − R ln(P ÷ P_ref).
        const s0 = -gas.R * Math.log(P / ref.P);
        const f = gasIsobar(s0, ref.T, gas.cp);
        const line = Array.from({ length: 61 }, (_, k): Pt => {
          const s = xa.lo + ((xa.hi - xa.lo) * k) / 60;
          return [s, K(f(s), u.toK)];
        });
        parts.push(
          <Path
            key={`iso${ib.name}`}
            d={curve(line)}
            stroke={c.chartMuted}
            strokeWidth={1.2}
            strokeDasharray={chart.dashFine}
            fill="none"
          />,
        );
        // Its name near where it leaves the top or the right of the plot.
        const inPlot = line.filter(([s, T]) => inside(sx(s), sy(T)));
        const end = inPlot[inPlot.length - 1];
        if (end) {
          const at = place.place(sx(end[0]), sy(end[1]), ib.name, chart.label, [
            [-4, 14, 'end'],
            [-6, -6, 'end'],
            [-30, 18, 'end'],
          ]);
          parts.push(
            <ChartText
              key={`isoT${ib.name}`}
              {...at}
              fontSize={chart.label}
              fill={c.chartMuted}
              halo
            >
              {ib.name}
            </ChartText>,
          );
        }
      }
    }

    // The tie line (water, T–v or P–v) at the page's P.
    if (water && spec.plane !== 'Ts' && sat && vf !== undefined && vg !== undefined) {
      const y = sy(spec.plane === 'Pv' ? sat.P / u.toMPa : K(sat.T, u.toK));
      const [x0, x1] = [sx(vf), sx(vg)];
      parts.push(
        <G key="tie">
          <Line
            x1={box.l}
            y1={y}
            x2={x0}
            y2={y}
            stroke={c.chartMuted}
            strokeDasharray={chart.dashFine}
          />
          <Line
            x1={x0}
            y1={y}
            x2={x1}
            y2={y}
            stroke={c.chartHighlight}
            strokeWidth={chart.strokeHeavy}
          />
          <Circle cx={x0} cy={y} r={4.5} fill={c.card} stroke={c.chartHighlight} strokeWidth={2} />
          <Circle cx={x1} cy={y} r={4.5} fill={c.card} stroke={c.chartHighlight} strokeWidth={2} />
        </G>,
      );
      place.dot(x0, y, 5);
      place.dot(x1, y, 5);
    }

    // Steps: paths, then their q arrows.
    const cp = gas?.cp;
    for (const [i, step] of (spec.steps ?? []).entries()) {
      const [a, b] = [pts.get(step.from), pts.get(step.to)];
      if (!a || !b) continue;
      let path: Pt[] | undefined;
      if (spec.plane === 'Ts')
        path = stepPathTs(spec, step, pts, cp)?.map(([s, T]): Pt => [s, K(T, u.toK)]);
      else {
        const [xa0, ya0, xb0, yb0] = [xOf(a), yOf(a), xOf(b), yOf(b)];
        if (xa0 !== undefined && ya0 !== undefined && xb0 !== undefined && yb0 !== undefined)
          path = [
            [xa0, ya0],
            [xb0, yb0],
          ];
      }
      if (!path) continue;
      const dashed = step.process === 'actual';
      parts.push(
        <Path
          key={`step${i}`}
          d={curve(path)}
          stroke={dashed ? c.fnSecond : c.chartHighlight}
          strokeWidth={chart.stroke + 0.5}
          strokeDasharray={dashed ? chart.dash : undefined}
          fill="none"
        />,
      );
      if (step.heat) {
        const px = path.map(([x, y]): Pt => [sx(x), sy(y)]);
        const mid = px[Math.floor(px.length / 2)]!;
        const into = step.heat === 'in';
        const len = 30;
        const [x1, y1, x2, y2] = into
          ? [mid[0], mid[1] - len - 4, mid[0], mid[1] - 4]
          : [mid[0], mid[1] + 4, mid[0], Math.min(box.b - 2, mid[1] + len + 4)];
        const color = into ? c.physHot : c.physCold;
        parts.push(
          <Arrow key={`q${i}`} x1={x1} y1={y1} x2={x2} y2={y2} color={color} width={2.5} />,
        );
        place.block({ x0: x1 - 6, y0: Math.min(y1, y2), x1: x1 + 6, y1: Math.max(y1, y2) });
        const q = step.q !== undefined ? read(step.q) : undefined;
        const text = `q_${into ? 'in' : 'out'}${q?.known ? ` = ${rep.value(step.q as string)}` : ''}`;
        const ly = into ? y1 + 4 : (y1 + y2) / 2 + 4;
        const at = place.place(x1, ly, text, chart.label, [
          [8, 0, 'start'],
          [-8, 0, 'end'],
          [0, into ? -6 : 14, 'middle'],
        ]);
        parts.push(
          <ChartText
            key={`qT${i}`}
            {...at}
            fontSize={chart.label}
            fontWeight="700"
            fill={color}
            halo
          >
            {text}
          </ChartText>,
        );
      }
    }

    // Δs bracketed under two states.
    if (spec.ds && spec.plane === 'Ts') {
      const [a, b] = [pts.get(spec.ds.from), pts.get(spec.ds.to)];
      const D = read(spec.ds.value);
      if (a?.s !== undefined && b?.s !== undefined && D.known) {
        const y = box.b - 12;
        const [x0, x1] = [sx(a.s), sx(b.s)];
        parts.push(
          <G key="ds">
            <Line x1={x0} y1={y} x2={x1} y2={y} stroke={c.chartInk} strokeWidth={1.2} />
            <Line x1={x0} y1={y - 5} x2={x0} y2={y + 5} stroke={c.chartInk} strokeWidth={1.2} />
            <Line x1={x1} y1={y - 5} x2={x1} y2={y + 5} stroke={c.chartInk} strokeWidth={1.2} />
          </G>,
        );
        const text = `Δs = ${typeof spec.ds.value === 'string' ? rep.value(spec.ds.value) : D.text}`;
        const at = place.place((x0 + x1) / 2, y - 6, text, chart.label, [
          [0, 0, 'middle'],
          [0, -16, 'middle'],
        ]);
        parts.push(
          <ChartText key="dsT" {...at} fontSize={chart.label} fontWeight="700" halo>
            {text}
          </ChartText>,
        );
      }
    }

    // States: dots, then names.
    const dots: { p: PdPoint; st: PdState; x: number; y: number }[] = [];
    for (const st of spec.states ?? []) {
      const p = pts.get(st.name);
      if (!p) continue;
      const [x0, y0] = [xOf(p), yOf(p)];
      if (x0 === undefined || y0 === undefined) continue;
      const [x, y] = [sx(x0), sy(y0)];
      if (!inside(x, y)) continue;
      dots.push({ p, st, x, y });
      place.dot(x, y, 6);
    }
    for (const { p, st, x, y } of dots) {
      const faded = p.why !== undefined;
      parts.push(
        <Circle
          key={`dot${st.name}`}
          cx={x}
          cy={y}
          r={5.5}
          fill={st.ideal ? c.card : c.chartInk}
          stroke={c.chartInk}
          strokeWidth={2}
          opacity={faded ? 0.4 : 1}
        />,
      );
    }
    // The tie line's names, then the states' names, so a state's name takes the clear side.
    if (water && spec.plane !== 'Ts' && sat && vf !== undefined && vg !== undefined) {
      const y = sy(spec.plane === 'Pv' ? sat.P / u.toMPa : K(sat.T, u.toK));
      const level = `T_sat = ${sig(K(sat.T, u.toK), 4)} ${u.T}`;
      const lvl = place.place(box.l + 4, y - 7, level, chart.label, [
        [0, 0, 'start'],
        [0, 22, 'start'],
      ]);
      // A short tie line (near the critical point) names its ends; the caption gives the values.
      const short = sx(vg) - sx(vf) < 110;
      const fText = short
        ? 'v_f'
        : `v_f = ${typeof spec.tie?.vf === 'string' ? rep.value(spec.tie.vf, false) : sig(vf, 4)}`;
      const gText = short
        ? 'v_g'
        : `v_g = ${typeof spec.tie?.vg === 'string' ? rep.value(spec.tie.vg, false) : sig(vg, 4)}`;
      const fl = place.place(sx(vf), y, fText, chart.label, [
        [4, 20, 'start'],
        [-4, 20, 'end'],
        [4, -10, 'start'],
        [-8, -8, 'end'],
      ]);
      const gl = place.place(sx(vg), y, gText, chart.label, [
        [4, 20, 'start'],
        [-4, 20, 'end'],
        [6, -10, 'start'],
        [8, 16, 'start'],
        [-4, 36, 'end'],
      ]);
      parts.push(
        <G key="tieT">
          <ChartText {...lvl} fontSize={chart.label} fontWeight="700" halo>
            {level}
          </ChartText>
          <ChartText {...fl} fontSize={chart.label} fill={c.chartHighlight} halo>
            {fText}
          </ChartText>
          <ChartText {...gl} fontSize={chart.label} fill={c.chartHighlight} halo>
            {gText}
          </ChartText>
        </G>,
      );
    }
    for (const { p, st, x, y } of dots) {
      const x0 = get(st.x);
      const text =
        spec.plane !== 'Ts' && water && typeof st.x === 'string' && x0 !== undefined
          ? `${st.name === 'State' ? '' : `${st.name}: `}x = ${rep.value(st.x)}`
          : st.name;
      const at = place.place(x, y, text, chart.value, [[0, -12, 'middle'], ...AROUND]);
      parts.push(
        <ChartText
          key={`name${st.name}`}
          {...at}
          fontSize={chart.value}
          fontWeight="700"
          opacity={p.why ? 0.5 : 1}
          halo
        >
          {text}
        </ChartText>,
      );
    }
    // Region names and the critical point's, last, where there is room.
    if (water) {
      const top = dome[dome.length - 1]!;
      const cx = sx(spec.plane === 'Ts' ? top.sf : top.vf);
      const cy = sy(spec.plane === 'Pv' ? WATER_CRIT.P / u.toMPa : K(WATER_CRIT.T, u.toK));
      const crit = place.place(cx, cy, 'Critical point', chart.label, [
        [8, -6, 'start'],
        [-8, -6, 'end'],
        [0, -10, 'middle'],
      ]);
      const mid = dome[Math.floor(dome.length * 0.35)]!;
      const yMid = spec.plane === 'Pv' ? mid.P / u.toMPa : K(mid.T, u.toK);
      const xMid = spec.plane === 'Ts' ? (mid.sf + mid.sg) / 2 : Math.sqrt(mid.vf * mid.vg);
      const mix = place.place(sx(xMid), sy(yMid), 'Liquid + vapor', chart.label, [
        [0, 0, 'middle'],
        [0, 18, 'middle'],
        [0, -18, 'middle'],
        [0, 36, 'middle'],
      ]);
      const liq = place.place(box.l + 4, box.t + 14, 'Liquid', chart.label, [
        [0, 0, 'start'],
        [0, 18, 'start'],
      ]);
      const vap = place.place(box.r - 4, box.t + 14, 'Vapor', chart.label, [
        [0, 0, 'end'],
        [0, 18, 'end'],
        [0, 40, 'end'],
      ]);
      parts.push(
        <G key="regions">
          <ChartText {...crit} fontSize={chart.label} halo>
            Critical point
          </ChartText>
          <ChartText {...mix} fontSize={chart.label} fill={c.chartMuted} halo>
            Liquid + vapor
          </ChartText>
          <ChartText {...liq} fontSize={chart.label} fill={c.chartMuted} halo>
            Liquid
          </ChartText>
          <ChartText {...vap} fontSize={chart.label} fill={c.chartMuted} halo>
            Vapor
          </ChartText>
        </G>,
      );
    }

    // A drag: water's typed v along the tie line; a gas state's typed T up and down.
    let handle: ReactNode = null;
    const dragV = main && typeof main.v === 'string' && rep.typed(main.v) ? main.v : undefined;
    const dragT =
      !water && spec.plane === 'Ts'
        ? (spec.states ?? []).find(
            (s) => typeof s.T === 'string' && rep.typed(s.T) && !s.ideal && s !== spec.states?.[0],
          )
        : undefined;
    if (water && spec.plane !== 'Ts' && dragV && mainPt?.v !== undefined) {
      const y0 = yOf(mainPt);
      if (y0 !== undefined)
        handle = (
          <DragHandle
            x={sx(mainPt.v)}
            y={sy(y0)}
            label="the specific volume"
            onStart={() => {
              start.current = Math.log10(mainPt.v!);
            }}
            onMove={(dx) => {
              const per = (box.r - box.l) / (Math.log10(xa.hi) - Math.log10(xa.lo));
              const v = 10 ** (start.current + dx / per);
              calc.set({ [dragV]: rep.snapTo(dragV, v) }, rep.slide(dragV));
            }}
          />
        );
    } else if (dragT && typeof dragT.T === 'string') {
      const p = pts.get(dragT.name);
      const id = dragT.T;
      if (p?.s !== undefined && p.T !== undefined)
        handle = (
          <DragHandle
            x={sx(p.s)}
            y={sy(K(p.T, u.toK))}
            label={`the temperature at ${dragT.name}`}
            onStart={() => {
              start.current = rep.shown(id);
            }}
            onMove={(_dx, dy) => {
              const per = (box.b - box.t) / (ya.hi - ya.lo);
              calc.set({ [id]: rep.snapTo(id, start.current - dy / per) }, rep.slide(id));
            }}
          />
        );
    }

    return (
      <>
        <Svg width={w} height={h}>
          {parts}
        </Svg>
        {handle}
      </>
    );
  };

  // The caption: what the plane shows, then the page's working.
  const lines: string[] = [];
  const dir = (x: NumOrVar | undefined) =>
    typeof x === 'string' && rep.known(x) ? rep.value(x) : x === undefined ? '?' : read(x).text;
  if (water) {
    lines.push(
      `Water’s vapor dome on the ${spec.plane === 'Ts' ? 'T–s' : spec.plane === 'Tv' ? 'T–v' : 'P–v'} plane, from the IAPWS-IF97 saturation equations; it closes at the critical point, ${sig(K(WATER_CRIT.T, u.toK), 4)} ${u.T} and ${sig(WATER_CRIT.P / u.toMPa, 4)} ${u.P}.`,
    );
  }
  if (water && spec.plane !== 'Ts') {
    if (!sat) lines.push('Type P to draw the tie line.');
    else if (vf !== undefined && vg !== undefined) {
      lines.push(
        `At P = ${dir(spec.tie?.P)} water boils at T_sat = ${sig(K(sat.T, u.toK), 4)} ${u.T}: the tie line runs from v_f to v_g.`,
      );
      const off = (a: number, b: number) => Math.abs(a - b) > 0.02 * b;
      if (off(vf, sat.vf) || off(vg, sat.vg))
        lines.push(
          `The typed v_f and v_g don’t match IAPWS-IF97 at this P (v_f = ${sig(sat.vf, 4)}, v_g = ${sig(sat.vg, 4)} m³/kg), so the tie line’s ends miss the dome: check the table row.`,
        );
      const x = main ? get(main.x) : undefined;
      const v = main ? get(main.v) : undefined;
      if (outOfDome && v !== undefined)
        lines.push(
          v > vg
            ? `v = ${dir(main?.v)} is past v_g, so x would pass 1: the steam is superheated, off the tie line (drawn faint).`
            : `v = ${dir(main?.v)} is short of v_f, so x would be below 0: the water is compressed liquid, off the tie line (drawn faint).`,
        );
      else if (x !== undefined && v !== undefined)
        lines.push(
          `x = (v − v_f) ÷ (v_g − v_f) = (${dir(main?.v)} − ${sig(vf, 4)}) ÷ (${sig(vg, 4)} − ${sig(vf, 4)}) = ${dir(main?.x)}: the state is under the dome, ${Math.round(x * 100)}% of the way from liquid to vapor.`,
        );
      else lines.push('Type v to place the state on the tie line.');
    }
  }
  if (spec.plane === 'Ts' && !water && spec.ds) {
    const [a, b] = [stateOfSpec(spec, spec.ds.from), stateOfSpec(spec, spec.ds.to)];
    if (a && b)
      lines.push(
        `Δs = c_p ln(T_${b.name} ÷ T_${a.name}) − R ln(P_${b.name} ÷ P_${a.name}) = ${dir(spec.ds.value)}: it depends on the end states only, so any path between them (dashed) gives it.`,
      );
  }
  const actual = (spec.steps ?? []).find((s) => s.process === 'actual');
  const ideal = spec.states?.find((s) => s.ideal);
  if (actual && ideal) {
    const [pa, pi] = [pts.get(actual.to), pts.get(ideal.name)];
    if (pa?.T !== undefined && pi?.T !== undefined)
      lines.push(
        `The ideal compression ends at ${ideal.name} (T = ${dir(ideal.T)}), straight up; the real one (dashed) ends at ${actual.to}, T = ${dir(stateOfSpec(spec, actual.to)?.T)}, hotter and to the right: friction makes entropy.`,
      );
  }
  if (spec.cycle === 'brayton')
    lines.push(
      'Brayton cycle: compression 1→2 and expansion 3→4 are vertical (isentropic); heat enters along the high-pressure line 2→3 and leaves along the low one 4→1.',
    );
  if (spec.cycle === 'rankine') {
    const s3 = [...pts.values()].find((p) => p.shape);
    lines.push(
      'Rankine cycle: the pump 1→2 and turbine 3→4 are vertical (isentropic); the boiler 2→3 heats along the high-pressure line, the condenser 4→1 runs flat under the dome.',
    );
    const st4 = spec.states?.find((s) => s.name === '4');
    const p4 = st4 ? pts.get('4') : undefined;
    if (p4?.x !== undefined && p4.P !== undefined) {
      const s4 = satAtP(p4.P)!;
      lines.push(
        `At 4, x₄ = (h₄ − h_f) ÷ h_fg = (${sig(p4.h!, 5)} − ${sig(s4.hf, 4)}) ÷ ${sig(s4.hg - s4.hf, 5)} = ${sig(p4.x, 3)} (h_f and h_fg from IAPWS at ${sig(p4.P / u.toMPa, 4)} ${u.P}).`,
      );
    }
    if (s3)
      lines.push(
        `State ${s3.name} sits above 4 (ideal turbine); the page gives h, not T, so its height is set by the area under 2→${s3.name} (q_in), not read from a table.`,
      );
  }
  for (const id of spec.more ?? []) if (rep.known(id)) lines.push(rep.label(id));

  return (
    <View>
      <Canvas aspect={(w) => Math.min(1, 372 / w)}>{({ w, h }) => art(w, h)}</Canvas>
      <Caption>{lines.join(' · ')}</Caption>
    </View>
  );
}

const stateOfSpec = (spec: PropertyDiagramSpec, name: string) =>
  spec.states?.find((s) => s.name === name);

// ─── A real gas's isotherm on P–v ────────────────────────────────────────────

function Isotherm({ spec, calc }: { spec: PropertyDiagramSpec; calc: Calculator }) {
  const c = usePalette();
  const { rep, read, get } = useGetter(calc);
  const it = spec.isotherm;
  const pUnit = spec.units?.P ?? 'bar';
  const vUnit = spec.units?.V ?? 'L/mol';
  const [fP, fV] = [P_TO_PA[pUnit] ?? 1e5, V_TO_SI[vUnit] ?? 1e-3];
  const T = get(it?.T);
  const R = get(it?.R);
  const a = get(it?.a);
  const b = get(it?.b);
  const Z = get(it?.Z);
  const Pst = get(it?.P);
  const Vtyped = get(it?.V);
  const start = useRef(0);
  const vdw = it?.model === 'vdw';
  // The state in SI.
  let V: number | undefined;
  let P: number | undefined;
  let B: number | undefined;
  if (T !== undefined && R !== undefined) {
    if (vdw && a !== undefined && b !== undefined && Vtyped !== undefined) {
      V = Vtyped * fV;
      P = Pst !== undefined ? Pst * fP : vdwP(T, V, a, b, R);
    } else if (!vdw && Z !== undefined && Pst !== undefined) {
      P = Pst * fP;
      B = virialB(T, P, Z, R);
      V = (Z * R * T) / P;
    }
  }
  const crit =
    vdw && a !== undefined && b !== undefined && R !== undefined ? vdwCritical(a, b, R) : undefined;
  // The axes: V on a log scale round the state (and down to near b), P from 0.
  const vLo = V !== undefined ? Math.min(V / 12, crit ? crit.V * 0.6 : V / 12) : 1e-5;
  const vHi = V !== undefined ? V * 6 : 1e-2;
  const xa: Axis = {
    log: true,
    lo: 10 ** Math.floor(Math.log10(vLo / fV)),
    hi: 10 ** Math.ceil(Math.log10(vHi / fV)),
    name: `V (${vUnit}, log scale)`,
  };
  const pTop = Math.max(P !== undefined ? P * 2.4 : 1, crit ? crit.P * 1.5 : 0) / fP;
  const step = ticks(0, pTop, 5).step;
  const ya: Axis = { log: false, lo: 0, hi: Math.ceil(pTop / step) * step, name: `P (${pUnit})` };

  const art = (w: number, h: number) => {
    const box = { l: 54, r: w - 20, t: 30, b: h - 42 };
    const sx = scaler(xa, box.l, box.r);
    const sy = scaler(ya, box.b, box.t);
    const place = makePlacer(w, h);
    const inside = (x: number, y: number) => x >= box.l && x <= box.r && y >= box.t && y <= box.b;
    const curve = (f: (v: number) => number) => {
      const runs: Pt[][] = [];
      let run: Pt[] = [];
      for (let k = 0; k <= 160; k++) {
        const v = 10 ** (Math.log10(xa.lo) + ((Math.log10(xa.hi) - Math.log10(xa.lo)) * k) / 160);
        const p = f(v * fV) / fP;
        const q: Pt = [sx(v), sy(p)];
        if (Number.isFinite(p) && inside(...q)) run.push(q);
        else if (run.length) {
          runs.push(run);
          run = [];
        }
      }
      if (run.length) runs.push(run);
      return runs
        .filter((r) => r.length > 1)
        .map(poly)
        .join(' ');
    };
    const parts: ReactNode[] = [<Frame key="f" c={c} box={box} xa={xa} ya={ya} sx={sx} sy={sy} />];
    if (T !== undefined && R !== undefined) {
      parts.push(
        <Path
          key="ideal"
          d={curve((v) => (R * T) / v)}
          stroke={c.chartMuted}
          strokeWidth={chart.stroke}
          strokeDasharray={chart.dash}
          fill="none"
        />,
      );
      const real =
        vdw && a !== undefined && b !== undefined
          ? (v: number) => (v > b ? vdwP(T, v, a, b, R) : NaN)
          : B !== undefined
            ? (v: number) => (v > B! ? (R * T) / (v - B!) : NaN)
            : undefined;
      if (crit && vdw)
        parts.push(
          <Path
            key="tc"
            d={curve((v) => (v > b! ? vdwP(crit.T, v, a!, b!, R) : NaN))}
            stroke={c.chartGrid}
            strokeWidth={chart.stroke}
            fill="none"
          />,
        );
      if (real)
        parts.push(
          <Path
            key="real"
            d={curve(real)}
            stroke={c.chartHighlight}
            strokeWidth={chart.stroke + 0.5}
            fill="none"
          />,
        );
    }
    if (crit) {
      const [x, y] = [sx(crit.V / fV), sy(crit.P / fP)];
      if (inside(x, y)) {
        parts.push(<Circle key="c" cx={x} cy={y} r={4.5} fill={c.chartInk} />);
        place.dot(x, y);
      }
    }
    let st: Pt | undefined;
    if (V !== undefined && P !== undefined) {
      st = [sx(V / fV), sy(P / fP)];
      parts.push(<Circle key="st" cx={st[0]} cy={st[1]} r={5.5} fill={c.chartInk} />);
      place.dot(...st);
      // The ideal gas at the same V: a hollow dot straight above or below (when it stands
      // clear of the state's dot; else the caption says it).
      if (T !== undefined && R !== undefined) {
        const yi = sy((R * T) / V / fP);
        if (inside(st[0], yi) && Math.abs(yi - st[1]) > 14) {
          parts.push(
            <Line
              key="gap"
              x1={st[0]}
              y1={st[1]}
              x2={st[0]}
              y2={yi}
              stroke={c.chartMuted}
              strokeDasharray={chart.dashFine}
            />,
          );
          parts.push(
            <Circle
              key="sti"
              cx={st[0]}
              cy={yi}
              r={4.5}
              fill={c.card}
              stroke={c.chartMuted}
              strokeWidth={2}
            />,
          );
          place.dot(st[0], yi, 5);
          const text = `ideal ${sig((R * T) / V / fP, 4)} ${pUnit}`;
          const at = place.place(st[0], yi, text, chart.label);
          parts.push(
            <ChartText key="stiT" {...at} fontSize={chart.label} fill={c.chartMuted} halo>
              {text}
            </ChartText>,
          );
        }
      }
      const text = `${sig(P / fP, 4)} ${pUnit}`;
      const at = place.place(st[0], st[1], text, chart.value);
      parts.push(
        <ChartText key="stT" {...at} fontSize={chart.value} fontWeight="700" halo>
          {text}
        </ChartText>,
      );
    }
    if (crit) {
      const [x, y] = [sx(crit.V / fV), sy(crit.P / fP)];
      if (inside(x, y)) {
        const at = place.place(x, y, 'Critical point', chart.label);
        parts.push(
          <ChartText key="cT" {...at} fontSize={chart.label} halo>
            Critical point
          </ChartText>,
        );
      }
    }
    // The key, across the top.
    const keyItems: [string, string, string | undefined][] = [
      [vdw ? 'van der Waals' : 'Virial', c.chartHighlight, undefined],
      ['Ideal gas', c.chartMuted, chart.dash],
      ...(crit && vdw
        ? ([['At T_c', c.chartGrid, undefined]] as [string, string, string | undefined][])
        : []),
    ];
    let kx = box.l + 4;
    keyItems.forEach(([text, color, dash]) => {
      parts.push(
        <G key={`k${text}`}>
          <Line
            x1={kx}
            y1={12}
            x2={kx + 18}
            y2={12}
            stroke={color}
            strokeWidth={2.5}
            strokeDasharray={dash}
          />
          <ChartText x={kx + 22} y={16} fontSize={chart.label}>
            {text}
          </ChartText>
        </G>,
      );
      kx += 30 + [...text.replace(/_/g, '')].length * chart.label * 0.56;
    });
    const dragV = typeof it?.V === 'string' && rep.typed(it.V) ? it.V : undefined;
    return (
      <>
        <Svg width={w} height={h}>
          {parts}
        </Svg>
        {dragV && st && V !== undefined ? (
          <DragHandle
            x={st[0]}
            y={st[1]}
            label="the molar volume"
            onStart={() => {
              start.current = Math.log10(V! / fV);
            }}
            onMove={(dx) => {
              const per = (box.r - box.l) / (Math.log10(xa.hi) - Math.log10(xa.lo));
              calc.set(
                { [dragV]: rep.snapTo(dragV, 10 ** (start.current + dx / per)) },
                rep.slide(dragV),
              );
            }}
          />
        ) : null}
      </>
    );
  };

  const lines: string[] = [];
  const gas = it?.name ?? 'the gas';
  if (T === undefined || R === undefined) lines.push('Type T to draw the isotherm.');
  else if (vdw && crit && a !== undefined && b !== undefined) {
    const v = it?.V;
    lines.push(
      `van der Waals isotherm of ${gas} at T = ${typeof it?.T === 'string' ? rep.value(it.T) : read(it?.T).text}: P = RT ÷ (V − b) − a ÷ V². The ideal gas, P = RT ÷ V, is dashed.`,
    );
    if (V !== undefined && P !== undefined)
      lines.push(
        `At V = ${typeof v === 'string' ? rep.value(v) : sig(V / fV)}, P = ${sig(P / fP, 4)} ${pUnit} against ${sig((R * T) / V / fP, 4)} ${pUnit} ideal: attraction (a) pulls it down, so Z = PV ÷ RT = ${sig((P * V) / (R * T), 3)}.`,
      );
    lines.push(
      T < crit.T
        ? `T is below the van der Waals T_c = 8a ÷ 27Rb = ${sig(crit.T, 4)} K, so the isotherm dips and rises (where the real gas condenses); far out, at large V, it meets the ideal one.`
        : `T is above the van der Waals T_c = 8a ÷ 27Rb = ${sig(crit.T, 4)} K, so the isotherm falls all the way; at large V it meets the ideal one.`,
    );
  } else if (B !== undefined && V !== undefined && P !== undefined) {
    lines.push(
      `Virial isotherm of ${gas} at T = ${typeof it?.T === 'string' ? rep.value(it.T) : read(it?.T).text}: Z = 1 + BP ÷ RT, so V = RT ÷ P + B, with B = (Z − 1)RT ÷ P = ${sig(B / fV, 3)} ${vUnit}. The ideal gas is dashed.`,
      `At P = ${typeof it?.P === 'string' ? rep.value(it.P) : sig(P / fP)}, Z = ${typeof it?.Z === 'string' ? rep.value(it.Z) : sig(Z!, 3)} puts the state at V = ZRT ÷ P = ${sig(V / fV, 4)} ${vUnit}, ${B < 0 ? 'left of' : 'right of'} the ideal gas’s ${sig((R * T) / P / fV, 4)} ${vUnit}.`,
    );
  } else
    lines.push(vdw ? 'Type a, b and V to draw the isotherm.' : 'Type P and Z to place the state.');
  for (const id of spec.more ?? []) if (rep.known(id)) lines.push(rep.label(id));

  return (
    <View>
      <Canvas aspect={(w) => Math.min(1, 372 / w)}>{({ w, h }) => art(w, h)}</Canvas>
      <Caption>{lines.join(' · ')}</Caption>
    </View>
  );
}

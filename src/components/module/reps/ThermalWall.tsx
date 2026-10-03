/**
 * Heat through things (HC23, `thermalWall`; ME-P14, ACC-P31 `temperature`): a layered wall in its
 * materials with the temperature stepping through each layer and film and the resistance network
 * beneath; an insulated pipe in section with its log profile; a pin fin fading from the base; flow
 * in a heated tube; a surface radiating to its surroundings; a wire with heat generation. Real
 * parts are painted (brick, foam, steel, water); the profiles and the network are flat. Every
 * profile is computed from the page's values (thermalWallMath.ts); a "?" draws nothing of its own.
 */
import type { ReactNode } from 'react';
import { View } from 'react-native';
import Svg, { Circle, Defs, G, Line, Path, Rect } from 'react-native-svg';

import { formatNumber } from '@/engine/format';
import type { NumOrVar } from '@/data/modules/typesGraphs';
import type { ThermalLayer, ThermalWallSpec } from '@/data/modules/typesHe2c';
import { chart, usePalette, type Palette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, Caption, ChartText } from './common';
import { Arrow } from './he1fKit';
import { makePlacer, poly, useGetter } from './he2cKit';
import { Deepen, Sheen, TopLight, url, usePaintIds } from './paint';
import {
  cylinderT,
  finM,
  finQ,
  finTheta,
  radiant,
  seriesTemperatures,
  toKelvin,
  wallResistances,
  wireT,
} from './thermalWallMath';

type Pt = [number, number];
type Spec = ThermalWallSpec;

/** A number to n figures; scientific past a million or under a thousandth. */
const fig = (x: number, n = 3) =>
  formatNumber(Number(x.toPrecision(n)), {
    scientific: Math.abs(x) >= 1e6 || (x !== 0 && Math.abs(x) < 1e-3),
  });

const MATERIAL_NAME: Record<ThermalLayer['material'], string> = {
  brick: 'Brick',
  foam: 'Foam',
  steel: 'Steel',
  concrete: 'Concrete',
  wood: 'Wood',
  glass: 'Glass',
};

export function ThermalWall({ spec, calc }: { spec: Spec; calc: Calculator }) {
  switch (spec.mode) {
    case 'wall':
      return <Wall spec={spec} calc={calc} />;
    case 'cylinder':
      return <Cylinder spec={spec} calc={calc} />;
    case 'fin':
      return <Fin spec={spec} calc={calc} />;
    case 'tube':
      return <Tube spec={spec} calc={calc} />;
    case 'radiation':
      return <Radiation spec={spec} calc={calc} />;
    case 'wire':
      return <Wire spec={spec} calc={calc} />;
  }
}

/** The reader every mode shares: values, labels ("k = 0.72 W/(m·K)") and the unit of T. */
function useThermal(spec: Spec, calc: Calculator) {
  const g = useGetter(calc);
  const { rep, get } = g;
  /** A length in metres (the page may type mm: `si`). */
  const len = (x: NumOrVar | undefined) => {
    const v = get(x);
    return v === undefined ? undefined : v * (spec.si ?? 1);
  };
  /** "T_in = 20 °C" for a variable, or the symbol and the number for a fixed value. */
  const label = (x: NumOrVar | undefined, symbol: string, unit = '') => {
    if (typeof x === 'string') return rep.known(x) ? rep.label(x) : undefined;
    return x === undefined ? undefined : `${symbol} = ${fig(x, 4)}${unit ? ` ${unit}` : ''}`;
  };
  /** A value's text with its unit, or "?". */
  const text = (x: NumOrVar | undefined) =>
    typeof x === 'string' ? rep.value(x) : x === undefined ? '?' : fig(x, 4);
  const tUnit = typeof spec.Tin === 'string' ? (rep.unit(spec.Tin) ?? '°C') : '°C';
  return { ...g, len, label, text, tUnit };
}

/** A resistor's zigzag between x0 and x1 on the line y. */
function Resistor({ x0, x1, y, color }: { x0: number; x1: number; y: number; color: string }) {
  const n = 6;
  const d = (x1 - x0) / n;
  const pts: Pt[] = [[x0, y]];
  for (let i = 0; i < n; i++) pts.push([x0 + d * (i + 0.5), y + (i % 2 ? 6 : -6)]);
  pts.push([x1, y]);
  return <Path d={poly(pts)} stroke={color} strokeWidth={1.8} fill="none" />;
}

/**
 * The resistance network: nodes evenly spaced across [x0, x1] at y, a resistor between each pair
 * with its value above and its name below, the nodes' names under them.
 */
function Network({
  c,
  x0,
  x1,
  y,
  parts,
  nodes,
  flow,
}: {
  c: Palette;
  x0: number;
  x1: number;
  y: number;
  parts: { name: string; value?: string }[];
  nodes: string[];
  flow?: string;
}) {
  const step = (x1 - x0) / parts.length;
  const out: ReactNode[] = [];
  parts.forEach((p, i) => {
    const [a, b] = [x0 + i * step, x0 + (i + 1) * step];
    const mid = (a + b) / 2;
    const half = Math.min(18, step / 2 - 8);
    out.push(
      <G key={`r${i}`}>
        <Line x1={a} y1={y} x2={mid - half} y2={y} stroke={c.chartInk} strokeWidth={1.8} />
        <Resistor x0={mid - half} x1={mid + half} y={y} color={c.chartInk} />
        <Line x1={mid + half} y1={y} x2={b} y2={y} stroke={c.chartInk} strokeWidth={1.8} />
        {p.value ? (
          <ChartText x={mid} y={y - 12} textAnchor="middle" fontSize={chart.label} fontWeight="700">
            {p.value}
          </ChartText>
        ) : null}
        <ChartText
          x={mid}
          y={y + 22}
          textAnchor="middle"
          fontSize={chart.label}
          fill={c.chartMuted}
        >
          {p.name}
        </ChartText>
      </G>,
    );
  });
  nodes.forEach((n, i) => {
    const x = x0 + i * step;
    out.push(
      <G key={`n${i}`}>
        <Circle cx={x} cy={y} r={3.5} fill={c.chartInk} />
        {n ? (
          <ChartText
            x={x}
            y={y + 38}
            textAnchor={i === 0 ? 'start' : i === nodes.length - 1 ? 'end' : 'middle'}
            fontSize={chart.label}
          >
            {n}
          </ChartText>
        ) : null}
      </G>,
    );
  });
  if (flow)
    out.push(
      <G key="flow">
        <Arrow x1={x0} y1={y - 30} x2={x0 + 46} y2={y - 30} color={c.physHot} width={2} />
        <ChartText x={x0 + 52} y={y - 26} fontSize={chart.label} fontWeight="700" fill={c.physHot}>
          {flow}
        </ChartText>
      </G>,
    );
  return <G>{out}</G>;
}

// ─── A plane wall in layers ──────────────────────────────────────────────────

/** One layer painted in its material, from x to x + w, y to y + h. */
function LayerPaint({
  c,
  ids,
  material,
  x,
  y,
  w,
  h,
}: {
  c: Palette;
  ids: Record<'light' | 'metal' | 'glass', string>;
  material: ThermalLayer['material'];
  x: number;
  y: number;
  w: number;
  h: number;
}) {
  const parts: ReactNode[] = [];
  if (material === 'brick') {
    parts.push(<Rect key="b" x={x} y={y} width={w} height={h} fill={c.thermalBrick} />);
    // Courses of brick: mortar beds every 14 px, the joints staggered.
    for (let yy = y + 14, i = 0; yy < y + h; yy += 14, i++) {
      parts.push(
        <Line
          key={`m${yy}`}
          x1={x}
          y1={yy}
          x2={x + w}
          y2={yy}
          stroke={c.thermalMortar}
          strokeWidth={1.6}
        />,
      );
      for (let xx = x + (i % 2 ? 10 : 22); xx < x + w; xx += 24)
        parts.push(
          <Line
            key={`j${yy}-${xx}`}
            x1={xx}
            y1={yy - 14}
            x2={xx}
            y2={yy}
            stroke={c.thermalMortar}
            strokeWidth={1.4}
          />,
        );
    }
  } else if (material === 'foam') {
    parts.push(<Rect key="f" x={x} y={y} width={w} height={h} fill={c.thermalFoam} />);
    for (let yy = y + 6, i = 0; yy < y + h - 3; yy += 9, i++)
      for (let xx = x + (i % 2 ? 4 : 8); xx < x + w - 2; xx += 9)
        parts.push(
          <Circle key={`c${yy}-${xx}`} cx={xx} cy={yy} r={2.2} fill={c.thermalFoamCell} />,
        );
  } else if (material === 'steel') {
    parts.push(<Rect key="s" x={x} y={y} width={w} height={h} fill={c.metal} />);
    parts.push(<Rect key="ss" x={x} y={y} width={w} height={h} fill={url(ids.metal)} />);
  } else if (material === 'concrete') {
    parts.push(<Rect key="k" x={x} y={y} width={w} height={h} fill={c.fluidConcrete} />);
    for (let i = 0; i < Math.floor((w * h) / 180); i++) {
      const [px, py] = [
        x + ((i * 37) % Math.max(1, w - 4)) + 2,
        y + ((i * 53) % Math.max(1, h - 4)) + 2,
      ];
      parts.push(<Circle key={`g${i}`} cx={px} cy={py} r={1.6} fill={c.fluidConcreteDark} />);
    }
  } else if (material === 'wood') {
    parts.push(<Rect key="w" x={x} y={y} width={w} height={h} fill={c.wood} />);
    for (let xx = x + 5; xx < x + w; xx += 7)
      parts.push(
        <Line
          key={`w${xx}`}
          x1={xx}
          y1={y}
          x2={xx + 2}
          y2={y + h}
          stroke={c.woodDark}
          strokeWidth={0.8}
        />,
      );
  } else {
    parts.push(
      <Rect key="gl" x={x} y={y} width={w} height={h} fill={url(ids.glass)} stroke={c.glassEdge} />,
    );
  }
  parts.push(<Rect key="l" x={x} y={y} width={w} height={h} fill={url(ids.light)} />);
  return <G>{parts}</G>;
}

function Wall({ spec, calc }: { spec: Spec; calc: Calculator }) {
  const c = usePalette();
  const ids = usePaintIds('light', 'metal', 'glass');
  const { get, len, text, tUnit, rep } = useThermal(spec, calc);
  const layers = (spec.layers ?? []).map((l, i) => ({
    ...l,
    i,
    Lv: len(l.L),
    kv: get(l.k),
    name: l.name ?? MATERIAL_NAME[l.material],
  }));
  const [Tin, Tout, hIn, hOut] = [get(spec.Tin), get(spec.Tout), get(spec.hIn), get(spec.hOut)];
  const allL = layers.every((l) => l.Lv !== undefined && l.Lv > 0);
  const known = allL && layers.every((l) => l.kv !== undefined && l.kv > 0);
  const Rs = known
    ? wallResistances(
        spec.hIn !== undefined ? hIn : undefined,
        layers.map((l) => ({ L: l.Lv! * 1, k: l.kv! })),
        spec.hOut !== undefined ? hOut : undefined,
      )
    : undefined;
  const filmsKnown =
    (spec.hIn === undefined || hIn !== undefined) &&
    (spec.hOut === undefined || hOut !== undefined);
  const Rsum = Rs && filmsKnown ? Rs.reduce((s, r) => s + r.R, 0) : undefined;
  const qv =
    get(spec.q) ??
    (Rsum && Tin !== undefined && Tout !== undefined ? (Tin - Tout) / Rsum : undefined);
  const nodes =
    Rs && filmsKnown && Tin !== undefined && qv !== undefined
      ? seriesTemperatures(
          Tin,
          qv,
          Rs.map((r) => r.R),
        )
      : undefined;
  const filmIn = spec.hIn !== undefined;
  const filmOut = spec.hOut !== undefined;
  // At a phone's width (358 px), a layer under 12 px is drawn at 12 (said in the caption).
  const sumL = layers.reduce((s, l) => s + (l.Lv ?? 0), 0);
  const squeezed = allL && sumL > 0 && layers.some((l) => (l.Lv! / sumL) * (358 - 2 * 54) < 12);

  const art = (w: number, h: number) => {
    const top = 34;
    const bot = 196;
    const air = 46;
    const xL = filmIn ? 8 + air : 16;
    const xR = w - (filmOut ? 8 + air : 16);
    // Layer widths to scale by L (at least 12 px each, said in the caption).
    const total = layers.reduce((s, l) => s + (l.Lv ?? 0), 0);
    const widths = layers.map((l) =>
      allL && total > 0
        ? ((l.Lv ?? 0) / total) * (xR - xL)
        : (xR - xL) / Math.max(1, layers.length),
    );
    const minW = 12;
    if (widths.some((x) => x < minW)) {
      const small = widths.filter((x) => x < minW).length;
      const rest = widths.filter((x) => x >= minW).reduce((s, x) => s + x, 0);
      const scale = (xR - xL - small * minW) / rest;
      widths.forEach((x, i) => (widths[i] = x < minW ? minW : x * scale));
    }
    const edges = [xL];
    widths.forEach((x) => edges.push(edges[edges.length - 1]! + x));
    const place = makePlacer(w, h);
    const parts: ReactNode[] = [];
    // Air either side, and the layers.
    if (filmIn)
      parts.push(
        <Rect
          key="ai"
          x={8}
          y={top}
          width={air}
          height={bot - top}
          fill={c.physHot}
          opacity={0.12}
        />,
      );
    if (filmOut)
      parts.push(
        <Rect
          key="ao"
          x={xR}
          y={top}
          width={air}
          height={bot - top}
          fill={c.physCold}
          opacity={0.12}
        />,
      );
    layers.forEach((l, i) =>
      parts.push(
        <LayerPaint
          key={`L${i}`}
          c={c}
          ids={ids}
          material={l.material}
          x={edges[i]!}
          y={top}
          w={widths[i]!}
          h={bot - top}
        />,
      ),
    );
    parts.push(
      <Rect
        key="frame"
        x={xL}
        y={top}
        width={xR - xL}
        height={bot - top}
        fill="none"
        stroke={c.chartInk}
        strokeWidth={1.2}
      />,
    );
    // The layers' names over them.
    layers.forEach((l, i) => {
      const mid = (edges[i]! + edges[i + 1]!) / 2;
      const at = place.place(mid, top - 6, l.name, chart.label, [
        [0, 0, 'middle'],
        [0, -14, 'middle'],
      ]);
      parts.push(
        <ChartText key={`n${i}`} {...at} fontSize={chart.label} fontWeight="700">
          {l.name}
        </ChartText>,
      );
    });
    // The profile.
    if (nodes) {
      const all = [...nodes, Tout ?? nodes[nodes.length - 1]!];
      const [lo, hi] = [Math.min(...all), Math.max(...all)];
      const span = hi - lo || 1;
      const yT = (T: number) => top + 16 + ((hi - T) / span) * (bot - top - 32);
      const pts: Pt[] = [];
      let k = 0;
      if (filmIn) {
        const [Ta, Tb] = [nodes[0]!, nodes[1]!];
        pts.push([8, yT(Ta)], [xL - 22, yT(Ta)]);
        for (let t = 0.1; t <= 1.0001; t += 0.1)
          pts.push([xL - 22 + 22 * t, yT(Ta - (Ta - Tb) * t * t)]);
        k = 1;
      } else pts.push([xL, yT(nodes[0]!)]);
      layers.forEach((_, i) => pts.push([edges[i + 1]!, yT(nodes[k + i + 1]!)]));
      if (filmOut) {
        const [Ta, Tb] = [nodes[nodes.length - 2]!, nodes[nodes.length - 1]!];
        for (let t = 0.1; t <= 1.0001; t += 0.1)
          pts.push([xR + 22 * t, yT(Tb + (Ta - Tb) * (1 - t) * (1 - t))]);
        pts.push([w - 8, yT(Tb)]);
      }
      parts.push(
        <Path
          key="prof"
          d={poly(pts)}
          stroke={c.chartHighlight}
          strokeWidth={chart.strokeHeavy}
          fill="none"
        />,
      );
      // The temperatures keep off the profile itself, not only its dots.
      pts.slice(1).forEach(([x1, y1], i) => {
        const [x0, y0] = pts[i]!;
        const n = Math.max(1, Math.ceil(Math.hypot(x1 - x0, y1 - y0) / 6));
        for (let j = 0; j <= n; j++)
          place.dot(x0 + ((x1 - x0) * j) / n, y0 + ((y1 - y0) * j) / n, 2);
      });
      // Dots at the surfaces and joints, each with its temperature.
      const surf = edges.map((x, i) => [x, nodes[k + i]!] as const);
      surf.forEach(([x, T]) => {
        parts.push(
          <Circle
            key={`d${x}`}
            cx={x}
            cy={yT(T)}
            r={4.5}
            fill={c.chartHighlight}
            stroke={c.card}
            strokeWidth={1.5}
          />,
        );
        place.dot(x, yT(T), 5);
      });
      const ends: [number, number, string][] = [];
      if (filmIn && Tin !== undefined) ends.push([8, yT(Tin), `${text(spec.Tin)}`]);
      if (filmOut && Tout !== undefined) ends.push([w - 8, yT(Tout), `${text(spec.Tout)}`]);
      ends.forEach(([x, y, s], i) => {
        const at = place.place(
          x,
          y,
          s,
          chart.label,
          i === 0
            ? [
                [0, -8, 'start'],
                [0, 18, 'start'],
              ]
            : [
                [0, -8, 'end'],
                [0, 18, 'end'],
              ],
        );
        parts.push(
          <ChartText key={`e${i}`} {...at} fontSize={chart.label} fontWeight="700" halo>
            {s}
          </ChartText>,
        );
      });
      surf.forEach(([x, T], i) => {
        const s = `${fig(T, 3)} ${tUnit}`;
        // A thin layer with next to no drop: its two faces read the same, so name it once.
        const prev = surf[i - 1];
        if (prev && Math.abs(x - prev[0]) < 20 && fig(prev[1], 3) === fig(T, 3)) return;
        const at = place.place(x, yT(T), s, chart.label, [
          [i === surf.length - 1 ? -6 : 6, -8, i === surf.length - 1 ? 'end' : 'start'],
          [i === surf.length - 1 ? 6 : -6, -8, i === surf.length - 1 ? 'start' : 'end'],
          [6, 18, 'start'],
          [-6, 18, 'end'],
          [0, -12, 'middle'],
          [0, 22, 'middle'],
        ]);
        parts.push(
          <ChartText key={`t${i}`} {...at} fontSize={chart.label} halo>
            {s}
          </ChartText>,
        );
      });
    }
    // The network beneath.
    const netParts = [
      ...(filmIn ? [{ name: '1 ÷ h_i', R: Rs?.[0]?.R }] : []),
      ...layers.map((l, i) => ({
        name: `L${sub(i + 1)} ÷ k${sub(i + 1)}`,
        R: Rs?.[(filmIn ? 1 : 0) + i]?.R,
      })),
      ...(filmOut ? [{ name: '1 ÷ h_o', R: Rs?.[Rs.length - 1]?.R }] : []),
    ];
    parts.push(
      <Network
        key="net"
        c={c}
        x0={16}
        x1={w - 16}
        y={bot + 62}
        parts={netParts.map((p) => ({
          name: p.name,
          value: p.R !== undefined && filmsKnown ? fig(p.R, 3) : undefined,
        }))}
        nodes={[
          filmIn ? 'T_in' : 'T₁',
          ...netParts.slice(1).map(() => ''),
          filmOut ? 'T_out' : 'T₂',
        ]}
        flow={
          qv !== undefined
            ? `q″ = ${typeof spec.q === 'string' && rep.known(spec.q) ? rep.value(spec.q) : `${fig(qv, 3)} W/m²`}`
            : undefined
        }
      />,
    );
    return (
      <Svg width={w} height={h}>
        <Defs>
          <TopLight id={ids.light} strength={0.6} />
          <Sheen id={ids.metal} vertical={false} />
          <Deepen id={ids.glass} from={c.glass} to={c.glassEdge} />
        </Defs>
        {parts}
      </Svg>
    );
  };

  const lines: string[] = [];
  if (!Rs || !filmsKnown)
    lines.push('Type each layer’s L and k (and the films’ h) to draw the profile.');
  else {
    const names = [
      ...(filmIn ? ['1 ÷ h_i'] : []),
      ...layers.map((_, i) => `L${sub(i + 1)} ÷ k${sub(i + 1)}`),
      ...(filmOut ? ['1 ÷ h_o'] : []),
    ];
    lines.push(
      `R″ = ${names.join(' + ')} = ${Rs.map((r) => fig(r.R, 4)).join(' + ')} = ${fig(Rsum!, 4)} m²·K/W.`,
    );
    if (qv !== undefined && nodes) {
      if (Tin !== undefined && Tout !== undefined)
        lines.push(
          `q″ = (T_in − T_out) ÷ R″ = ${fig(Tin - Tout, 4)} ÷ ${fig(Rsum!, 4)} = ${fig(qv, 4)} W/m².`,
        );
      const drops = Rs.map((r) => qv * r.R);
      const big = layers.reduce(
        (b, l, i) => (drops[(filmIn ? 1 : 0) + i]! > drops[(filmIn ? 1 : 0) + b.i]! ? { i } : b),
        { i: 0 },
      );
      lines.push(
        `Each drop is q″ × R: ${drops.map((d) => `${fig(d, 3)} K`).join(', ')}; the steepest line is through the ${layers[big.i]?.name.toLowerCase() ?? 'layer'}, the layer with the most L ÷ k.`,
      );
    } else lines.push('Type T_in and T_out to draw the temperatures.');
    if (squeezed) lines.push('The thinnest layer is drawn wider than to scale so it shows.');
  }
  for (const id of spec.more ?? []) if (rep.known(id)) lines.push(rep.label(id));
  return (
    <View>
      <Canvas aspect={(w) => Math.min(0.92, 330 / w)}>{({ w, h }) => art(w, h)}</Canvas>
      <Caption>{lines.join(' · ')}</Caption>
    </View>
  );
}

const SUBS = '₀₁₂₃₄₅₆₇₈₉';
const sub = (n: number) => [...String(n)].map((d) => SUBS[Number(d)]).join('');

// ─── An insulated pipe in section ────────────────────────────────────────────

function Cylinder({ spec, calc }: { spec: Spec; calc: Calculator }) {
  const c = usePalette();
  const ids = usePaintIds('metal', 'water', 'light');
  const { get, len, text, label, rep } = useThermal(spec, calc);
  const [r1, r2] = [len(spec.r1), len(spec.r2)];
  const rc = len(spec.rc);
  const Ti = get(spec.Tin);
  const To = get(spec.Tout);
  const dT = get(spec.dT);
  const Rcond = get(spec.Rcond) ?? get(spec.R);
  const Rconv = get(spec.Rconv);
  const tUnit = typeof spec.Tin === 'string' ? (rep.unit(spec.Tin) ?? '°C') : 'K';
  // Temperatures: absolute when the page has T_i and T∞, else from ΔT (the outside at 0).
  const absolute = Ti !== undefined && To !== undefined;
  const T1 = absolute ? Ti : dT;
  const Tend = absolute ? To : dT !== undefined ? 0 : undefined;
  const Rtot =
    Rcond !== undefined ? Rcond + (spec.h !== undefined ? (Rconv ?? NaN) : 0) : undefined;
  const Ts =
    T1 !== undefined &&
    Tend !== undefined &&
    Rcond !== undefined &&
    Rtot !== undefined &&
    Number.isFinite(Rtot)
      ? T1 - ((T1 - Tend) * Rcond) / Rtot
      : undefined;
  const ok = r1 !== undefined && r2 !== undefined && r2 > r1 && r1 > 0;

  const art = (w: number, h: number) => {
    const parts: ReactNode[] = [];
    const place = makePlacer(w, h);
    const cx = 86;
    const cy = 112;
    const R2 = 70;
    if (ok) {
      const s = R2 / r2!;
      const R1 = r1! * s;
      const wall = Math.max(3, R1 * 0.12);
      parts.push(
        <G key="pipe">
          {spec.h !== undefined ? (
            <Circle
              cx={cx}
              cy={cy}
              r={R2 + 9}
              fill="none"
              stroke={c.physCold}
              strokeWidth={1.5}
              strokeDasharray={chart.dashFine}
            />
          ) : null}
          <Circle
            cx={cx}
            cy={cy}
            r={R2}
            fill={c.thermalFoam}
            stroke={c.chartInk}
            strokeWidth={1.2}
          />
          {Array.from({ length: 40 }, (_, i) => {
            const a = (i * 2.4) % (2 * Math.PI);
            const rr = R1 + (((i * 7) % 10) / 10) * (R2 - R1 - 4) + 2;
            return (
              <Circle
                key={i}
                cx={cx + rr * Math.cos(a)}
                cy={cy + rr * Math.sin(a)}
                r={2}
                fill={c.thermalFoamCell}
              />
            );
          })}
          <Circle cx={cx} cy={cy} r={R1} fill={c.metal} />
          <Circle cx={cx} cy={cy} r={R1} fill={url(ids.metal)} />
          <Circle cx={cx} cy={cy} r={Math.max(1, R1 - wall)} fill={url(ids.water)} />
          {rc !== undefined && rc >= r1! && rc * s < R2 + 30 ? (
            <Circle
              cx={cx}
              cy={cy}
              r={rc * s}
              fill="none"
              stroke={c.chartInk}
              strokeWidth={1.2}
              strokeDasharray={chart.dash}
            />
          ) : null}
          <Line x1={cx} y1={cy} x2={cx + R2} y2={cy} stroke={c.chartInk} strokeWidth={1.2} />
          <Line
            x1={cx}
            y1={cy}
            x2={cx - R1 * 0.7}
            y2={cy - R1 * 0.7}
            stroke={c.chartInk}
            strokeWidth={1.2}
          />
        </G>,
      );
      place.block({ x0: cx - R2 - 10, y0: cy - R2 - 10, x1: cx + R2 + 10, y1: cy + R2 + 10 });
      parts.push(
        <ChartText
          key="r2"
          x={cx + R2 / 2 + 6}
          y={cy + 16}
          textAnchor="middle"
          fontSize={chart.label}
          fontWeight="700"
          halo
        >
          r₂
        </ChartText>,
        <ChartText
          key="r1"
          x={cx - R1 * 0.35 - 4}
          y={cy - R1 * 0.35 - 6}
          textAnchor="end"
          fontSize={chart.label}
          fontWeight="700"
          halo
        >
          r₁
        </ChartText>,
      );
      const top = [label(spec.r1, 'r₁'), label(spec.r2, 'r₂')].filter(Boolean).join(', ');
      parts.push(
        <ChartText key="rr" x={8} y={16} fontSize={chart.label} halo>
          {top}
        </ChartText>,
      );
      if (spec.h !== undefined) {
        const s2 = label(spec.h, 'h');
        if (s2)
          parts.push(
            <ChartText
              key="h"
              x={cx}
              y={cy + R2 + 26}
              textAnchor="middle"
              fontSize={chart.label}
              fill={c.physCold}
            >
              {`Air, ${s2}`}
            </ChartText>,
          );
      }
      if (rc !== undefined)
        parts.push(
          <ChartText key="rc" x={8} y={32} fontSize={chart.label} halo>
            {`${label(spec.rc, 'r_c') ?? ''} (${rc * s < r1! * s ? 'inside the pipe' : 'dashed'})`}
          </ChartText>,
        );
    }
    // T against r beside the section.
    if (ok && T1 !== undefined && Tend !== undefined && Ts !== undefined) {
      const l = 196;
      const r = w - 14;
      const t = 46;
      const b = 190;
      const rMax = r2! * (spec.h !== undefined ? 1.35 : 1.1);
      const sx = (x: number) => l + (x / rMax) * (r - l);
      const [lo, hi] = [Math.min(T1, Tend), Math.max(T1, Tend)];
      // With a film the outside temperature is named under the curve's end: room for it.
      const pad = spec.h !== undefined ? 22 : 0;
      const sy = (T: number) => t + ((hi - T) / (hi - lo || 1)) * (b - pad - t);
      const pts: Pt[] = [];
      for (let i = 0; i <= 30; i++) {
        const rr = r1! + ((r2! - r1!) * i) / 30;
        pts.push([sx(rr), sy(cylinderT(rr, r1!, r2!, T1, Ts))]);
      }
      if (spec.h !== undefined)
        for (let i = 1; i <= 10; i++) {
          const u = i / 10;
          pts.push([sx(r2! * (1 + 0.25 * u)), sy(Tend + (Ts - Tend) * (1 - u) * (1 - u))]);
        }
      pts.push([r, sy(Tend)]);
      parts.push(
        <G key="plot">
          <Line x1={l} y1={t - 6} x2={l} y2={b} stroke={c.chartInk} strokeWidth={1.2} />
          <Line x1={l} y1={b} x2={r} y2={b} stroke={c.chartInk} strokeWidth={1.2} />
          <Line
            x1={sx(r1!)}
            y1={b}
            x2={sx(r1!)}
            y2={sy(T1)}
            stroke={c.chartGrid}
            strokeDasharray={chart.dashFine}
          />
          <Line
            x1={sx(r2!)}
            y1={b}
            x2={sx(r2!)}
            y2={sy(Ts)}
            stroke={c.chartGrid}
            strokeDasharray={chart.dashFine}
          />
          <Path
            d={poly([[sx(r1!), sy(T1)], ...pts])}
            stroke={c.chartHighlight}
            strokeWidth={chart.strokeHeavy}
            fill="none"
          />
          <Circle cx={sx(r1!)} cy={sy(T1)} r={4} fill={c.chartHighlight} />
          <Circle cx={sx(r2!)} cy={sy(Ts)} r={4} fill={c.chartHighlight} />
          <ChartText
            x={sx(r1!)}
            y={b + 14}
            textAnchor="middle"
            fontSize={chart.label}
            fill={c.chartMuted}
          >
            r₁
          </ChartText>
          <ChartText
            x={sx(r2!)}
            y={b + 14}
            textAnchor="middle"
            fontSize={chart.label}
            fill={c.chartMuted}
          >
            r₂
          </ChartText>
          <ChartText x={r} y={b + 14} textAnchor="end" fontSize={chart.label} fill={c.chartMuted}>
            r
          </ChartText>
          <ChartText x={r} y={t - 12} textAnchor="end" fontSize={chart.label} fill={c.chartMuted}>
            {absolute ? `T (${tUnit})` : 'T − T₂ (K)'}
          </ChartText>
        </G>,
      );
      place.block({ x0: l, y0: b, x1: r, y1: b + 16 });
      // The axis title, top right.
      place.block({ x0: r - 80, y0: t - 24, x1: r, y1: t - 8 });
      const labels: [number, number, string][] = [
        [sx(r1!), sy(T1), absolute ? text(spec.Tin) : `ΔT = ${text(spec.dT)}`],
        [sx(r2!), sy(Ts), absolute ? `${fig(Ts, 3)} ${tUnit}` : 'T₂'],
        ...(absolute && spec.h !== undefined
          ? ([[r, sy(Tend), text(spec.Tout)]] as [number, number, string][])
          : []),
      ];
      labels.forEach(([x, y, s], i) => {
        place.dot(x, y, 5);
        const at = place.place(
          x,
          y,
          s,
          chart.label,
          i === 2
            ? [
                [0, 16, 'end'],
                [0, -8, 'end'],
              ]
            : [
                [6, -6, 'start'],
                [6, 16, 'start'],
                [-6, -6, 'end'],
              ],
        );
        parts.push(
          <ChartText key={`T${i}`} {...at} fontSize={chart.label} fontWeight="700" halo>
            {s}
          </ChartText>,
        );
      });
    }
    // The network.
    const net = [
      { name: 'R_cond', value: Rcond !== undefined ? fig(Rcond, 4) : undefined },
      ...(spec.h !== undefined
        ? [{ name: 'R_conv', value: Rconv !== undefined ? fig(Rconv, 4) : undefined }]
        : []),
    ];
    const qv = get(spec.q);
    parts.push(
      <Network
        key="net"
        c={c}
        x0={40}
        x1={w - 40}
        y={262}
        parts={net}
        nodes={spec.h !== undefined ? ['T_i', 'T_s', 'T∞'] : ['T₁', 'T₂']}
        flow={qv !== undefined && typeof spec.q === 'string' ? rep.label(spec.q) : undefined}
      />,
    );
    return (
      <Svg width={w} height={h}>
        <Defs>
          <Sheen id={ids.metal} />
          <Deepen id={ids.water} from={c.water} to={c.waterDeep} />
          <TopLight id={ids.light} />
        </Defs>
        {parts}
      </Svg>
    );
  };

  const lines: string[] = [];
  if (!ok) lines.push('Type r₁ and r₂ (r₂ > r₁) to draw the pipe and its insulation.');
  else {
    const perLength = spec.length === undefined;
    lines.push(
      `R_cond = ln(r₂ ÷ r₁) ÷ (2πk${perLength ? '' : 'L'}) = ln(${fig(r2! / r1!, 4)}) ÷ (2π × ${text(spec.k)}${perLength ? '' : ` × ${text(spec.length)}`})${Rcond !== undefined ? ` = ${fig(Rcond, 4)} K/W${perLength ? ' per m' : ''}` : ''}: the insulation’s drop follows ln r, steep inside, flatter out.`,
    );
    if (spec.h !== undefined && Rconv !== undefined)
      lines.push(`R_conv = 1 ÷ (2πr₂h) = ${fig(Rconv, 4)} K/W per m, in series after it.`);
    const qv = get(spec.q);
    if (qv !== undefined && typeof spec.q === 'string')
      lines.push(`${rep.label(spec.q)}: the temperature difference over the total resistance.`);
    if (rc !== undefined)
      lines.push(
        r2! > rc
          ? `r_c = k ÷ h = ${text(spec.rc)}; r₂ is past it, so more insulation always cuts the loss.`
          : `r_c = k ÷ h = ${text(spec.rc)}; r₂ is inside it, so a little insulation raises the loss.`,
      );
  }
  for (const id of spec.more ?? []) if (rep.known(id)) lines.push(rep.label(id));
  return (
    <View>
      <Canvas aspect={(w) => Math.min(0.92, 320 / w)}>{({ w, h }) => art(w, h)}</Canvas>
      <Caption>{lines.join(' · ')}</Caption>
    </View>
  );
}

// ─── A pin fin ───────────────────────────────────────────────────────────────

function Fin({ spec, calc }: { spec: Spec; calc: Calculator }) {
  const c = usePalette();
  const ids = usePaintIds('rod', 'base');
  const { get, len, label, rep } = useThermal(spec, calc);
  const [hv, kv, D, L, thB] = [
    get(spec.h),
    get(spec.k),
    len(spec.D),
    len(spec.L),
    get(spec.thetaB),
  ];
  const m =
    hv !== undefined && kv !== undefined && D !== undefined && hv > 0 && kv > 0 && D > 0
      ? finM(hv, kv, D)
      : undefined;
  const ok = m !== undefined && L !== undefined && L > 0;

  const art = (w: number, h: number) => {
    const parts: ReactNode[] = [];
    const x0 = 46;
    const x1 = w - 24;
    const yc = 70;
    const Lpx = x1 - x0;
    // Diameter to the same scale as the length (at least 10 px, said).
    const dPx = ok && D !== undefined ? Math.max(10, Math.min(60, (D / L!) * Lpx)) : 20;
    parts.push(
      <G key="base">
        <Rect x={10} y={yc - 50} width={x0 - 10} height={100} fill={c.metalDark} />
        <Rect x={10} y={yc - 50} width={x0 - 10} height={100} fill={c.physHot} opacity={0.55} />
        <Rect x={10} y={yc - 50} width={x0 - 10} height={100} fill={url(ids.base)} />
      </G>,
    );
    const n = 40;
    for (let i = 0; i < n; i++) {
      const xa = x0 + (Lpx * i) / n;
      const th = ok ? finTheta(((i + 0.5) / n) * L!, m!, L!) : 1;
      parts.push(
        <G key={`s${i}`}>
          <Rect x={xa} y={yc - dPx / 2} width={Lpx / n + 0.6} height={dPx} fill={c.physCold} />
          <Rect
            x={xa}
            y={yc - dPx / 2}
            width={Lpx / n + 0.6}
            height={dPx}
            fill={c.physHot}
            opacity={th}
          />
        </G>,
      );
    }
    parts.push(
      <Rect key="sheen" x={x0} y={yc - dPx / 2} width={Lpx} height={dPx} fill={url(ids.rod)} />,
      <Rect
        key="edge"
        x={x0}
        y={yc - dPx / 2}
        width={Lpx}
        height={dPx}
        fill="none"
        stroke={c.chartInk}
        strokeWidth={1}
      />,
    );
    // Heat leaving the surface, each arrow as long as the local excess temperature.
    if (ok)
      for (let i = 0; i < 6; i++) {
        const x = x0 + (Lpx * (i + 0.5)) / 6;
        const len6 = 6 + 16 * finTheta(((i + 0.5) / 6) * L!, m!, L!);
        parts.push(
          <Arrow
            key={`u${i}`}
            x1={x}
            y1={yc - dPx / 2 - 3}
            x2={x}
            y2={yc - dPx / 2 - 3 - len6}
            color={c.physHot}
            width={1.5}
          />,
          <Arrow
            key={`d${i}`}
            x1={x}
            y1={yc + dPx / 2 + 3}
            x2={x}
            y2={yc + dPx / 2 + 3 + len6}
            color={c.physHot}
            width={1.5}
          />,
        );
      }
    parts.push(
      <ChartText
        key="air"
        x={w - 8}
        y={14}
        textAnchor="end"
        fontSize={chart.label}
        fill={c.physCold}
      >
        {`Air, ${label(spec.h, 'h') ?? 'h = ?'}`}
      </ChartText>,
      <ChartText key="bse" x={10} y={yc + 68} fontSize={chart.label} fontWeight="700">
        Base
      </ChartText>,
    );
    // θ(x) under the fin.
    if (ok && thB !== undefined) {
      const l = x0;
      const r = x1;
      const t = 160;
      const b = h - 30;
      const sx = (x: number) => l + (x / L!) * (r - l);
      const sy = (th: number) => b - (th / thB) * (b - t);
      const pts = Array.from({ length: 41 }, (_, i): Pt => {
        const x = (L! * i) / 40;
        return [sx(x), sy(thB * finTheta(x, m!, L!))];
      });
      const tip = thB * finTheta(L!, m!, L!);
      const place = makePlacer(w, h);
      parts.push(
        <G key="plot">
          <Line x1={l} y1={t - 8} x2={l} y2={b} stroke={c.chartInk} strokeWidth={1.2} />
          <Line x1={l} y1={b} x2={r} y2={b} stroke={c.chartInk} strokeWidth={1.2} />
          <Path
            d={poly(pts)}
            stroke={c.chartHighlight}
            strokeWidth={chart.strokeHeavy}
            fill="none"
          />
          <Circle cx={sx(0)} cy={sy(thB)} r={4} fill={c.chartHighlight} />
          <Circle cx={sx(L!)} cy={sy(tip)} r={4} fill={c.chartHighlight} />
          <ChartText x={r} y={t - 14} textAnchor="end" fontSize={chart.label} fill={c.chartMuted}>
            θ = T − T∞
          </ChartText>
          <ChartText
            x={l}
            y={b + 16}
            textAnchor="middle"
            fontSize={chart.label}
            fill={c.chartMuted}
          >
            0
          </ChartText>
          <ChartText x={r} y={b + 16} textAnchor="end" fontSize={chart.label} fill={c.chartMuted}>
            {label(spec.L, 'L') ?? 'L'}
          </ChartText>
          <ChartText
            x={(l + r) / 2}
            y={b + 16}
            textAnchor="middle"
            fontSize={chart.label}
            fill={c.chartMuted}
          >
            x
          </ChartText>
        </G>,
      );
      for (const [x, y, s, a] of [
        [sx(0), sy(thB), label(spec.thetaB, 'θ_b') ?? '', 'start'],
        [sx(L!), sy(tip), `θ_tip = ${fig(tip, 3)} K`, 'end'],
      ] as [number, number, string, 'start' | 'end'][]) {
        const at = place.place(x, y, s, chart.label, [
          [a === 'start' ? 8 : -6, -8, a],
          [a === 'start' ? 8 : -6, 18, a],
        ]);
        parts.push(
          <ChartText key={s} {...at} fontSize={chart.label} fontWeight="700" halo>
            {s}
          </ChartText>,
        );
      }
    }
    return (
      <Svg width={w} height={h}>
        <Defs>
          <Sheen id={ids.rod} vertical />
          <TopLight id={ids.base} />
        </Defs>
        {parts}
      </Svg>
    );
  };

  const lines: string[] = [];
  if (!ok) lines.push('Type h, k, D and L to draw the fin.');
  else {
    lines.push(
      `m = √(hP ÷ kA_c) = √(4h ÷ kD) = ${typeof spec.m === 'string' && rep.known(spec.m) ? rep.value(spec.m) : `${fig(m!, 4)} m⁻¹`}, so mL = ${fig(m! * L!, 3)}.`,
    );
    if (thB !== undefined) {
      const qv = finQ(hv!, kv!, D!, L!, thB);
      lines.push(
        `q = √(hPkA_c) θ_b tanh(mL) = ${typeof spec.q === 'string' && rep.known(spec.q) ? rep.value(spec.q) : `${fig(qv, 3)} W`}: the fin cools along its length, θ = θ_b cosh(m(L − x)) ÷ cosh(mL) (adiabatic tip).`,
      );
    }
    if ((D! / L!) * 300 < 10) lines.push('The fin is drawn thicker than to scale so it shows.');
  }
  for (const id of spec.more ?? []) if (rep.known(id)) lines.push(rep.label(id));
  return (
    <View>
      <Canvas aspect={(w) => Math.min(0.92, 300 / w)}>{({ w, h }) => art(w, h)}</Canvas>
      <Caption>{lines.join(' · ')}</Caption>
    </View>
  );
}

// ─── Flow in a heated tube ───────────────────────────────────────────────────

function Tube({ spec, calc }: { spec: Spec; calc: Calculator }) {
  const c = usePalette();
  const ids = usePaintIds('wall', 'water');
  const { get, len, label, rep } = useThermal(spec, calc);
  const [D, hv, kv, Nu] = [len(spec.D), get(spec.h), get(spec.k), get(spec.Nu)];
  const film = hv !== undefined && kv !== undefined && hv > 0 ? kv / hv : undefined;

  const art = (w: number, h: number) => {
    const parts: ReactNode[] = [];
    const x0 = 16;
    const x1 = w - 52;
    const yt = 54;
    const yb = 164;
    const wall = 9;
    parts.push(
      <G key="tube">
        <Rect x={x0} y={yt} width={x1 - x0} height={yb - yt} fill={url(ids.water)} />
        <Rect x={x0} y={yt - wall} width={x1 - x0} height={wall} fill={c.metal} />
        <Rect x={x0} y={yt - wall} width={x1 - x0} height={wall} fill={url(ids.wall)} />
        <Rect x={x0} y={yb} width={x1 - x0} height={wall} fill={c.metal} />
        <Rect x={x0} y={yb} width={x1 - x0} height={wall} fill={url(ids.wall)} />
        {film !== undefined ? (
          <G>
            <Rect x={x0} y={yt} width={x1 - x0} height={6} fill={c.physHot} opacity={0.45} />
            <Rect x={x0} y={yb - 6} width={x1 - x0} height={6} fill={c.physHot} opacity={0.45} />
          </G>
        ) : null}
      </G>,
    );
    // The flow: a turbulent profile, nearly flat, slowing only near the wall.
    for (let i = 0; i < 5; i++) {
      const y = yt + ((yb - yt) * (i + 0.5)) / 5;
      const u = 1 - Math.abs((2 * (i + 0.5)) / 5 - 1) ** 7;
      parts.push(
        <Arrow
          key={`v${i}`}
          x1={x0 + 30}
          y1={y}
          x2={x0 + 30 + 70 * u}
          y2={y}
          color={c.chartInk}
          width={1.8}
        />,
      );
    }
    // Heat in through the wall.
    for (let i = 0; i < 4; i++) {
      const x = x0 + 150 + ((x1 - x0 - 170) * i) / 3;
      parts.push(
        <Arrow
          key={`qt${i}`}
          x1={x}
          y1={yt - wall - 22}
          x2={x}
          y2={yt + 2}
          color={c.physHot}
          width={2}
        />,
        <Arrow
          key={`qb${i}`}
          x1={x}
          y1={yb + wall + 22}
          x2={x}
          y2={yb - 2}
          color={c.physHot}
          width={2}
        />,
      );
    }
    parts.push(
      <G key="dim">
        <Line x1={x1 + 14} y1={yt} x2={x1 + 14} y2={yb} stroke={c.chartInk} strokeWidth={1.2} />
        <Line x1={x1 + 8} y1={yt} x2={x1 + 20} y2={yt} stroke={c.chartInk} strokeWidth={1.2} />
        <Line x1={x1 + 8} y1={yb} x2={x1 + 20} y2={yb} stroke={c.chartInk} strokeWidth={1.2} />
        <ChartText x={x1 + 20} y={(yt + yb) / 2 + 4} fontSize={chart.label} fontWeight="700">
          D
        </ChartText>
      </G>,
    );
    const top = [label(spec.V, 'V'), label(spec.D, 'D')].filter(Boolean).join(', ');
    parts.push(
      <ChartText key="vt" x={x0} y={18} fontSize={chart.label}>
        {top}
      </ChartText>,
      <ChartText
        key="ht"
        x={x0}
        y={yb + wall + 40}
        fontSize={chart.label}
        fontWeight="700"
        fill={c.physHot}
      >
        {`${label(spec.h, 'h') ?? 'h = ?'} at the wall`}
      </ChartText>,
    );
    if (film !== undefined)
      parts.push(
        <ChartText key="ft" x={x0} y={yb + wall + 58} fontSize={chart.label} fill={c.chartMuted}>
          {`Warm film k ÷ h ≈ ${fig(film * 1000, 2)} mm (drawn thicker)`}
        </ChartText>,
      );
    return (
      <Svg width={w} height={h}>
        <Defs>
          <Sheen id={ids.wall} vertical />
          <Deepen id={ids.water} from={c.water} to={c.waterDeep} />
        </Defs>
        {parts}
      </Svg>
    );
  };

  const lines: string[] = [];
  const vals = [spec.Re, spec.Pr, spec.Nu]
    .map((x, i) => label(x, ['Re', 'Pr', 'Nu'][i]!))
    .filter(Boolean);
  if (vals.length) lines.push(vals.join(', '));
  if (Nu !== undefined && kv !== undefined && D !== undefined)
    lines.push(
      `h = Nu k ÷ D = ${fig(Nu, 4)} × ${fig(kv, 4)} ÷ ${fig(D, 4)} = ${typeof spec.h === 'string' && rep.known(spec.h) ? rep.value(spec.h) : `${fig((Nu * kv) / D, 4)} W/(m²·K)`}: the heat crosses a thin film at the wall, where the water barely moves.`,
    );
  const Re = get(spec.Re);
  if (Re !== undefined && Re < 10000)
    lines.push('Re is under 10,000: Dittus–Boelter is for fully turbulent flow.');
  for (const id of spec.more ?? []) if (rep.known(id)) lines.push(rep.label(id));
  return (
    <View>
      <Canvas aspect={(w) => Math.min(0.8, 250 / w)}>{({ w, h }) => art(w, h)}</Canvas>
      <Caption>{lines.join(' · ')}</Caption>
    </View>
  );
}

// ─── Radiation to the surroundings ───────────────────────────────────────────

function Radiation({ spec, calc }: { spec: Spec; calc: Calculator }) {
  const c = usePalette();
  const ids = usePaintIds('plate');
  const { get, label, text, rep } = useThermal(spec, calc);
  const [eps, sigma] = [get(spec.eps), get(spec.sigma)];
  const unitOf = (x: NumOrVar | undefined) => (typeof x === 'string' ? rep.unit(x) : 'K');
  const Ts = get(spec.Ts);
  const Tsu = get(spec.Tsurr);
  const [TsK, TsuK] = [
    Ts === undefined ? undefined : toKelvin(Ts, unitOf(spec.Ts)),
    Tsu === undefined ? undefined : toKelvin(Tsu, unitOf(spec.Tsurr)),
  ];
  const Eout =
    eps !== undefined && sigma !== undefined && TsK !== undefined
      ? radiant(eps, sigma, TsK)
      : undefined;
  const Ein =
    eps !== undefined && sigma !== undefined && TsuK !== undefined
      ? radiant(eps, sigma, TsuK)
      : undefined;

  const art = (w: number, h: number) => {
    const parts: ReactNode[] = [];
    const base = h - 64;
    const px0 = w / 2 - 90;
    const px1 = w / 2 + 90;
    const big = Math.max(Eout ?? 0, Ein ?? 0);
    const full = base - 70;
    parts.push(
      <Rect
        key="enc"
        x={8}
        y={22}
        width={w - 16}
        height={h - 30}
        rx={14}
        fill="none"
        stroke={c.physCold}
        strokeWidth={1.5}
        strokeDasharray={chart.dash}
      />,
      <ChartText
        key="enct"
        x={w / 2}
        y={16}
        textAnchor="middle"
        fontSize={chart.label}
        fill={c.physCold}
        fontWeight="700"
      >
        {`Surroundings, ${label(spec.Tsurr, 'T_surr') ?? 'T_surr = ?'}`}
      </ChartText>,
      <Rect key="pl" x={px0} y={base} width={px1 - px0} height={22} fill={c.metalDark} />,
      <Rect key="pl2" x={px0} y={base} width={px1 - px0} height={22} fill={url(ids.plate)} />,
      <ChartText
        key="plt"
        x={w / 2}
        y={base + 40}
        textAnchor="middle"
        fontSize={chart.label}
        fontWeight="700"
      >
        {`Surface, ${[label(spec.Ts, 'T_s'), label(spec.eps, 'ε')].filter(Boolean).join(', ')}`}
      </ChartText>,
    );
    // Out: εσT_s⁴ (hot, up); in: εσT_surr⁴ absorbed (cold, down). Lengths to one scale.
    if (big > 0) {
      const xs = [0, 1, 2, 3, 4, 5].map((i) => px0 + 16 + ((px1 - px0 - 32) * i) / 5);
      xs.forEach((x, i) => {
        if (i % 2 === 0 && Eout !== undefined) {
          const L = (Eout / big) * full;
          parts.push(
            <Arrow
              key={`o${i}`}
              x1={x}
              y1={base - 4}
              x2={x}
              y2={base - 4 - L}
              color={c.physHot}
              width={2.5}
            />,
          );
        }
        if (i % 2 === 1 && Ein !== undefined) {
          const L = (Ein / big) * full;
          parts.push(
            <Arrow
              key={`i${i}`}
              x1={x}
              y1={base - 4 - L}
              x2={x}
              y2={base - 4}
              color={c.physCold}
              width={2.5}
            />,
          );
        }
      });
      if (Eout !== undefined)
        parts.push(
          <ChartText
            key="ot"
            x={px0 - 6}
            y={base - 4 - (Eout / big) * full + 10}
            textAnchor="end"
            fontSize={chart.label}
            fontWeight="700"
            fill={c.physHot}
            halo
          >
            εσT_s⁴
          </ChartText>,
          <ChartText
            key="ov"
            x={px0 - 6}
            y={base - 4 - (Eout / big) * full + 26}
            textAnchor="end"
            fontSize={chart.label}
            fill={c.physHot}
            halo
          >
            {`${fig(Eout, 4)} W/m²`}
          </ChartText>,
        );
      if (Ein !== undefined)
        parts.push(
          <ChartText
            key="it"
            x={px1 + 6}
            y={base - 4 - (Ein / big) * full + 10}
            fontSize={chart.label}
            fontWeight="700"
            fill={c.physCold}
            halo
          >
            εσT_surr⁴
          </ChartText>,
          <ChartText
            key="iv"
            x={px1 + 6}
            y={base - 4 - (Ein / big) * full + 26}
            fontSize={chart.label}
            fill={c.physCold}
            halo
          >
            {`${fig(Ein, 4)} W/m²`}
          </ChartText>,
        );
    }
    return (
      <Svg width={w} height={h}>
        <Defs>
          <TopLight id={ids.plate} />
        </Defs>
        {parts}
      </Svg>
    );
  };

  const lines: string[] = [];
  if (Eout === undefined || Ein === undefined)
    lines.push('Type ε, T_s and T_surr to draw the exchange.');
  else {
    lines.push(
      `Out: εσT_s⁴ = ${fig(Eout, 4)} W/m²; in (absorbed): εσT_surr⁴ = ${fig(Ein, 4)} W/m²; the arrows are to one scale, ${fig(Eout / Ein, 3)} : 1 = (T_s ÷ T_surr)⁴.`,
    );
    const qv = get(spec.q);
    if (qv !== undefined && typeof spec.q === 'string')
      lines.push(
        `q = εσA(T_s⁴ − T_surr⁴) = ${text(spec.A)} × ${fig(Eout - Ein, 4)} W/m² = ${rep.value(spec.q)}, in kelvins.`,
      );
  }
  for (const id of spec.more ?? []) if (rep.known(id)) lines.push(rep.label(id));
  return (
    <View>
      <Canvas aspect={(w) => Math.min(0.85, 300 / w)}>{({ w, h }) => art(w, h)}</Canvas>
      <Caption>{lines.join(' · ')}</Caption>
    </View>
  );
}

// ─── A wire with heat generation ─────────────────────────────────────────────

function Wire({ spec, calc }: { spec: Spec; calc: Calculator }) {
  const c = usePalette();
  const ids = usePaintIds('wire');
  const { get, len, label, text, rep } = useThermal(spec, calc);
  const [S, R, kv, Ts] = [get(spec.S), len(spec.radius), get(spec.k), get(spec.Ts)];
  const ok =
    S !== undefined && R !== undefined && kv !== undefined && Ts !== undefined && R > 0 && kv > 0;
  const tUnit = typeof spec.Ts === 'string' ? (rep.unit(spec.Ts) ?? '°C') : '°C';

  const art = (w: number, h: number) => {
    const parts: ReactNode[] = [];
    const cx = 80;
    const cy = 112;
    const Rp = 62;
    parts.push(
      <Circle key="w" cx={cx} cy={cy} r={Rp} fill={c.metal} />,
      <Circle
        key="ws"
        cx={cx}
        cy={cy}
        r={Rp}
        fill={url(ids.wire)}
        stroke={c.chartInk}
        strokeWidth={1.2}
      />,
    );
    // Heat made evenly through the wire: dots on a grid.
    for (let y = -Rp + 10; y < Rp; y += 14)
      for (let x = -Rp + 10; x < Rp; x += 14)
        if (x * x + y * y < (Rp - 6) ** 2)
          parts.push(
            <Circle key={`g${x},${y}`} cx={cx + x} cy={cy + y} r={2.2} fill={c.physHot} />,
          );
    parts.push(
      <Line key="rad" x1={cx} y1={cy} x2={cx + Rp} y2={cy} stroke={c.chartInk} strokeWidth={1.5} />,
      <ChartText
        key="rt"
        x={cx + Rp / 2}
        y={cy - 6}
        textAnchor="middle"
        fontSize={chart.label}
        fontWeight="700"
        halo
      >
        R
      </ChartText>,
      <ChartText key="st" x={8} y={16} fontSize={chart.label}>
        {[label(spec.S, 'S'), label(spec.radius, 'R')].filter(Boolean).join(', ')}
      </ChartText>,
      <ChartText key="kt" x={cx} y={cy + Rp + 22} textAnchor="middle" fontSize={chart.label}>
        {label(spec.k, 'k') ?? ''}
      </ChartText>,
    );
    if (ok) {
      const Tc = wireT(0, R!, S!, kv!, Ts!);
      const l = 176;
      const r = w - 14;
      const t = 50;
      const b = 176;
      const sx = (x: number) => l + ((x + R!) / (2 * R!)) * (r - l);
      const sy = (T: number) => b - ((T - Ts!) / (Tc - Ts! || 1)) * (b - t);
      const pts = Array.from({ length: 41 }, (_, i): Pt => {
        const x = -R! + (2 * R! * i) / 40;
        return [sx(x), sy(wireT(x, R!, S!, kv!, Ts!))];
      });
      parts.push(
        <G key="plot">
          <Line x1={l} y1={b} x2={r} y2={b} stroke={c.chartInk} strokeWidth={1.2} />
          <Line
            x1={sx(0)}
            y1={b}
            x2={sx(0)}
            y2={t - 4}
            stroke={c.chartGrid}
            strokeDasharray={chart.dashFine}
          />
          <Path
            d={poly(pts)}
            stroke={c.chartHighlight}
            strokeWidth={chart.strokeHeavy}
            fill="none"
          />
          <Circle cx={sx(0)} cy={sy(Tc)} r={4.5} fill={c.chartHighlight} />
          <Circle cx={sx(-R!)} cy={sy(Ts!)} r={4} fill={c.chartHighlight} />
          <Circle cx={sx(R!)} cy={sy(Ts!)} r={4} fill={c.chartHighlight} />
          <ChartText
            x={sx(0)}
            y={t - 12}
            textAnchor="middle"
            fontSize={chart.label}
            fontWeight="700"
            halo
          >
            {`T_c = ${typeof spec.Tc === 'string' && rep.known(spec.Tc) ? rep.value(spec.Tc) : `${fig(Tc, 4)} ${tUnit}`}`}
          </ChartText>
          <ChartText
            x={sx(R!)}
            y={b - 10}
            textAnchor="end"
            fontSize={chart.label}
            fontWeight="700"
            halo
          >
            {`T_s = ${text(spec.Ts)}`}
          </ChartText>
          <ChartText
            x={sx(-R!)}
            y={b + 16}
            textAnchor="middle"
            fontSize={chart.label}
            fill={c.chartMuted}
          >
            −R
          </ChartText>
          <ChartText
            x={sx(0)}
            y={b + 16}
            textAnchor="middle"
            fontSize={chart.label}
            fill={c.chartMuted}
          >
            0
          </ChartText>
          <ChartText
            x={sx(R!)}
            y={b + 16}
            textAnchor="middle"
            fontSize={chart.label}
            fill={c.chartMuted}
          >
            R
          </ChartText>
          <ChartText
            x={(l + r) / 2}
            y={b + 32}
            textAnchor="middle"
            fontSize={chart.label}
            fill={c.chartMuted}
          >
            r across the wire
          </ChartText>
        </G>,
      );
    }
    return (
      <Svg width={w} height={h}>
        <Defs>
          <Sheen id={ids.wire} />
        </Defs>
        {parts}
      </Svg>
    );
  };

  const lines: string[] = [];
  if (!ok) lines.push('Type S, R, k and T_s to draw the profile.');
  else
    lines.push(
      `T_c − T_s = SR² ÷ 4k = ${fig(S!, 3)} × ${fig(R!, 3)}² ÷ (4 × ${fig(kv!, 4)}) = ${fig((S! * R! * R!) / (4 * kv!), 4)} K: the heat made inside must flow out, so the centre runs hottest, a parabola in r.`,
    );
  for (const id of spec.more ?? []) if (rep.known(id)) lines.push(rep.label(id));
  return (
    <View>
      <Canvas aspect={(w) => Math.min(0.75, 230 / w)}>{({ w, h }) => art(w, h)}</Canvas>
      <Caption>{lines.join(' · ')}</Caption>
    </View>
  );
}

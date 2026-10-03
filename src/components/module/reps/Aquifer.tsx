/**
 * The college `aquifer` picture (HC75, EG-P17): a cross-section through the ground in three
 * modes. `section`: two wells L apart, the water table (or a potentiometric surface over a
 * confining layer) falling Δh between them, flow from high head to low, the face of area A.
 * `head`: one piezometer, z and the pressure head stacked to the total head. `well`: a pumped
 * confined aquifer, the Thiem cone of depression through two observation wells. Sand, clay,
 * water and the steel casings are painted; the math is in `aquiferMath.ts`.
 */
import { View } from 'react-native';
import Svg, { Circle, Defs, G, Line, LinearGradient, Path, Rect, Stop } from 'react-native-svg';

import type { AquiferSpec } from '@/data/modules/typesHe3m';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, Caption, ChartText } from './common';
import { Arrow, Dimension, HeLabel } from './beamKit';
import {
  WATER_GAMMA,
  discharge,
  exaggeration,
  gradient,
  pressureHead,
  seepage,
  thiemHead,
  thiemRate,
} from './aquiferMath';
import { n3, useReader, VDim } from './he3mKit';
import { url, usePaintIds } from './paint';

type Palette = ReturnType<typeof usePalette>;
type Spec<M extends AquiferSpec['mode']> = Extract<AquiferSpec, { mode: M }>;

export function Aquifer({ spec, calc }: { spec: AquiferSpec; calc: Calculator }) {
  switch (spec.mode) {
    case 'section':
      return <SectionView spec={spec} calc={calc} />;
    case 'head':
      return <HeadView spec={spec} calc={calc} />;
    case 'well':
      return <WellView spec={spec} calc={calc} />;
  }
}

/** A seeded scatter of sand grains (the same every render). */
function grains(x: number, y: number, w: number, h: number, every = 70): [number, number][] {
  const out: [number, number][] = [];
  const n = Math.max(0, Math.round((w * h) / every));
  let s = 12345;
  const rnd = () => {
    s = (s * 16807) % 2147483647;
    return s / 2147483647;
  };
  for (let i = 0; i < n; i++) out.push([x + rnd() * w, y + rnd() * h]);
  return out;
}

/** Sand: its colour, grains, and (below `wetTop`, a path) the water filling the pores. */
function Sand({ x, y, w, h, c }: { x: number; y: number; w: number; h: number; c: Palette }) {
  return (
    <G>
      <Rect x={x} y={y} width={w} height={h} fill={c.landSand} />
      {grains(x, y, w, h).map(([gx, gy], i) => (
        <Circle key={i} cx={gx} cy={gy} r={1.1} fill={c.soilDark} opacity={0.35} />
      ))}
    </G>
  );
}

/** Clay: its colour and thin flat streaks (layered, tight). */
function Clay({ x, y, w, h, c }: { x: number; y: number; w: number; h: number; c: Palette }) {
  const streaks: [number, number][] = grains(x, y + 3, w - 16, Math.max(0, h - 6), 260);
  return (
    <G>
      <Rect x={x} y={y} width={w} height={h} fill={c.landClay} />
      {streaks.map(([sx, sy], i) => (
        <Line
          key={i}
          x1={sx}
          y1={sy}
          x2={sx + 12}
          y2={sy}
          stroke={c.soilDark}
          strokeWidth={1}
          opacity={0.35}
        />
      ))}
    </G>
  );
}

/** A steel well casing from y1 down to y2, with a slotted screen over its last `screen` px. */
function Casing({
  x,
  y1,
  y2,
  width,
  screen,
  steel,
  c,
}: {
  x: number;
  y1: number;
  y2: number;
  width: number;
  screen: number;
  steel: string;
  c: Palette;
}) {
  const slots: number[] = [];
  for (let y = y2 - screen + 4; y < y2 - 2; y += 5) slots.push(y);
  return (
    <G>
      <Rect
        x={x - width / 2}
        y={y1}
        width={width}
        height={y2 - y1}
        fill={url(steel)}
        stroke={c.metalDark}
        strokeWidth={1}
      />
      {slots.map((y) => (
        <Line
          key={y}
          x1={x - width / 2 + 2}
          y1={y}
          x2={x + width / 2 - 2}
          y2={y}
          stroke={c.chartInk}
          strokeWidth={1.2}
        />
      ))}
    </G>
  );
}

/** The casing's horizontal steel gradient, under `id`. */
function SteelDefs({ id, c }: { id: string; c: Palette }) {
  return (
    <LinearGradient id={id} x1="0" y1="0" x2="1" y2="0">
      <Stop offset="0" stopColor={c.metalDark} />
      <Stop offset="0.35" stopColor={c.metal} />
      <Stop offset="0.5" stopColor={c.shine} stopOpacity={0.9} />
      <Stop offset="0.7" stopColor={c.metal} />
      <Stop offset="1" stopColor={c.metalDark} />
    </LinearGradient>
  );
}

/** A grass line along the land surface. */
function Surface({ w, y, c }: { w: number; y: number; c: Palette }) {
  return (
    <G>
      <Rect x={0} y={y} width={w} height={7} fill={c.soil} />
      <Line x1={0} y1={y} x2={w} y2={y} stroke={c.landGrass} strokeWidth={2.5} />
    </G>
  );
}

/** A water level in a well: a small inverted triangle over a line (the surveyors' mark). */
function Level({ x, y, c }: { x: number; y: number; c: Palette }) {
  return (
    <G>
      <Line x1={x - 9} y1={y} x2={x + 9} y2={y} stroke={c.waterDeep} strokeWidth={2} />
      <Path d={`M ${x - 5} ${y - 8} L ${x + 5} ${y - 8} L ${x} ${y - 1} Z`} fill={c.waterDeep} />
    </G>
  );
}

// ─── section: Darcy's law between two wells ─────────────────────────────────

function SectionView({ spec, calc }: { spec: Spec<'section'>; calc: Calculator }) {
  const c = usePalette();
  const r = useReader(calc);
  const ids = usePaintIds('steel');
  const dh = r.get(spec.drop);
  const L = r.get(spec.length);
  const K = r.get(spec.conductivity);
  const A = r.get(spec.area);
  const n = r.get(spec.porosity);
  const ok = L !== undefined && L > 0;
  const i = ok && dh !== undefined ? gradient(dh, L) : undefined;
  const confined = !!spec.confined;
  const X = i !== undefined ? exaggeration(i * (confined ? 1.4 : 1)) : 1;
  const Q = i !== undefined && K !== undefined && A !== undefined ? discharge(K, A, i) : undefined;
  const q = Q !== undefined && A ? Q / A : i !== undefined && K !== undefined ? K * i : undefined;
  const v = q !== undefined && n !== undefined && n > 0 ? seepage(q, n) : undefined;
  const t = v !== undefined && ok && v > 0 ? L / v : undefined;
  const H = 300;

  const art = (w: number) => {
    const ground = confined ? 34 : 40;
    const xa = 52;
    const xb = w - 56;
    const span = xb - xa;
    // Heights stretched × X: the drawn drop is i × X × the drawn L.
    const dd = i !== undefined ? i * X * span : 0;
    const top = confined ? 48 : 96;
    const ya = top + Math.max(0, -dd);
    const yb = ya + dd;
    const clayTop = confined ? 72 : 0;
    const aqTop = confined ? 104 : ground + 7;
    const base = 226;
    const tableAt = (x: number) => ya + ((x - xa) / span) * dd;
    // The saturated part: under the water table (unconfined) or the whole aquifer (confined).
    const wet = confined
      ? `M 0 ${aqTop} L ${w} ${aqTop} L ${w} ${base} L 0 ${base} Z`
      : `M 0 ${tableAt(0)} L ${w} ${tableAt(w)} L ${w} ${base} L 0 ${base} Z`;
    const flowY = confined ? [130, 165, 200] : [Math.max(ya, yb) + 30, 176, 206];
    const dir = dh === undefined || dh === 0 ? 0 : dh > 0 ? 1 : -1;
    const xm = (xa + xb) / 2;
    const faceTop = confined ? aqTop : tableAt(xm);
    return (
      <Svg width={w} height={H}>
        <Defs>
          <SteelDefs id={ids.steel} c={c} />
        </Defs>
        <Sand x={0} y={ground} w={w} h={base - ground} c={c} />
        <Path d={wet} fill={c.water} opacity={0.32} />
        {confined ? <Clay x={0} y={clayTop} w={w} h={aqTop - clayTop} c={c} /> : null}
        <Clay x={0} y={base} w={w} h={34} c={c} />
        <Surface w={w} y={ground} c={c} />
        {/* The water table or potentiometric surface, extended past both wells. */}
        {i !== undefined ? (
          <Line
            x1={0}
            y1={tableAt(0)}
            x2={w}
            y2={tableAt(w)}
            stroke={c.waterDeep}
            strokeWidth={2}
            strokeDasharray={confined ? chart.dash : undefined}
          />
        ) : null}
        {/* The face of area A, square to the flow. */}
        {A !== undefined ? (
          <G>
            <Path
              d={`M ${xm} ${faceTop} L ${xm + 14} ${faceTop - 10} L ${xm + 14} ${base - 10} L ${xm} ${base} Z`}
              fill={c.chartHighlight}
              opacity={0.22}
              stroke={c.chartHighlight}
              strokeWidth={1.4}
            />
          </G>
        ) : null}
        {dir !== 0
          ? flowY.map((y, k) => {
              const cx = k === 1 ? xm - 62 : xm + 52;
              const half = 20;
              return (
                <Arrow
                  key={k}
                  x1={cx - dir * half}
                  y1={y}
                  x2={cx + dir * half}
                  y2={y}
                  color={c.waterDeep}
                  width={2.4}
                />
              );
            })
          : null}
        {[xa, xb].map((x) => (
          <Casing
            key={x}
            x={x}
            y1={ground - 16}
            y2={confined ? 196 : 206}
            width={11}
            screen={confined ? 80 : 60}
            steel={ids.steel}
            c={c}
          />
        ))}
        {i !== undefined ? (
          <G>
            <Rect x={xa - 4} y={ya} width={8} height={206 - ya} fill={c.water} opacity={0.75} />
            <Rect x={xb - 4} y={yb} width={8} height={206 - yb} fill={c.water} opacity={0.75} />
            <Level x={xa} y={ya} c={c} />
            <Level x={xb} y={yb} c={c} />
            {/* Well 1's level carried across, so Δh reads at well 2. */}
            <Line
              x1={xa + 9}
              y1={ya}
              x2={xb + 14}
              y2={ya}
              stroke={c.chartMuted}
              strokeWidth={1}
              strokeDasharray={chart.dashFine}
            />
            <VDim
              x={xb + 22}
              y1={ya}
              y2={yb}
              text={r.named(spec.drop, 'Δh', dh!, 'm')}
              w={w}
              side={-1}
            />
          </G>
        ) : null}
        <ChartText
          x={xa}
          y={ground - 22}
          textAnchor="middle"
          fontSize={chart.small}
          fill={c.chartMuted}
        >
          well 1
        </ChartText>
        <ChartText
          x={xb}
          y={ground - 22}
          textAnchor="middle"
          fontSize={chart.small}
          fill={c.chartMuted}
        >
          well 2
        </ChartText>
        {A !== undefined ? (
          <HeLabel
            x={xm + 20}
            y={base - 14}
            text={r.named(spec.area, 'A', A, 'm²')}
            anchor="start"
            w={w}
          />
        ) : null}
        {K !== undefined || n !== undefined ? (
          <HeLabel
            x={8}
            y={base - 10}
            anchor="start"
            w={w}
            text={[
              K !== undefined ? r.named(spec.conductivity, 'K', K, 'm/day') : '',
              n !== undefined ? `${r.sym(spec.porosity, 'n')} = ${r.text(spec.porosity, n)}` : '',
            ]
              .filter(Boolean)
              .join(', ')}
          />
        ) : null}
        {confined ? (
          <ChartText x={xa + 14} y={clayTop + 20} fontSize={chart.small} fill={c.chartInk}>
            confining clay
          </ChartText>
        ) : null}
        <ChartText
          x={w - 6}
          y={base + 22}
          textAnchor="end"
          fontSize={chart.small}
          fill={c.chartInk}
        >
          clay
        </ChartText>
        {ok ? (
          <Dimension x1={xa} x2={xb} y={H - 12} text={r.named(spec.length, 'L', L!, 'm')} w={w} />
        ) : null}
      </Svg>
    );
  };

  const lines: string[] = [];
  if (L !== undefined && !ok) lines.push('L must be more than 0: the wells are L apart.');
  if (i !== undefined) {
    lines.push(
      `${r.sym(spec.gradient, 'i')} = ${r.sym(spec.drop, 'Δh')} ÷ ${r.sym(spec.length, 'L')} = ${r.bare(spec.drop, dh!)} ÷ ${r.bare(spec.length, L!)} = ${r.bare(spec.gradient, i)}.`,
    );
    if (Q !== undefined)
      lines.push(
        `${r.sym(spec.discharge, 'Q')} = ${r.sym(spec.conductivity, 'K')}${r.sym(spec.area, 'A')}${r.sym(spec.gradient, 'i')} = ${r.text(spec.discharge, Q, 'm³/day')}.`,
      );
    if (v !== undefined)
      lines.push(
        `${r.sym(spec.velocity, 'v')} = ${r.sym(spec.flux, 'q')} ÷ ${r.sym(spec.porosity, 'n')} = ${r.text(spec.velocity, v, 'm/day')}, faster than ${r.sym(spec.flux, 'q')}: water moves only through the pores.`,
      );
    if (t !== undefined)
      lines.push(`${r.sym(spec.time, 't')} = ${r.text(spec.time, t, 'days')} to cross L.`);
    if (dh === 0) lines.push('No head drop: the water does not flow.');
    else
      lines.push(
        `Water flows from high head to low (${dh! > 0 ? 'well 1 to well 2' : 'well 2 to well 1'}).`,
      );
    if (X !== 1)
      lines.push(
        `Heights drawn ${X > 1 ? `× ${n3(X)}` : `÷ ${n3(1 / X)}`}; lengths along the ground to scale.`,
      );
  }
  return (
    <View>
      <Canvas aspect={(w) => H / w}>{({ w }) => art(w)}</Canvas>
      <Caption>{lines.join(' ') || 'Type Δh and L to draw the water table.'}</Caption>
    </View>
  );
}

// ─── head: one piezometer ───────────────────────────────────────────────────

function HeadView({ spec, calc }: { spec: Spec<'head'>; calc: Calculator }) {
  const c = usePalette();
  const r = useReader(calc);
  const ids = usePaintIds('steel');
  const z = r.get(spec.elevation);
  const p = r.get(spec.pressure);
  const gamma = r.get(spec.weight) ?? WATER_GAMMA;
  const psiGiven = r.get(spec.pressureHead);
  const psi = psiGiven ?? (p !== undefined && gamma > 0 ? pressureHead(p, gamma) : undefined);
  const hGiven = r.get(spec.head);
  const h = hGiven ?? (z !== undefined && psi !== undefined ? z + psi : undefined);
  const below = psi !== undefined && psi < 0;
  const H = 300;

  const art = (w: number) => {
    const datum = 262;
    const top = Math.max(z ?? 0, h ?? 0, 1);
    const s = 180 / top;
    const yP = z !== undefined ? datum - z * s : datum - 120;
    const yW = h !== undefined ? datum - h * s : undefined;
    const ground = Math.max(26, Math.min(yP, yW ?? yP) - 26);
    const xp = w * 0.36;
    return (
      <Svg width={w} height={H}>
        <Defs>
          <SteelDefs id={ids.steel} c={c} />
        </Defs>
        <Sand x={0} y={ground} w={w} h={datum + 26 - ground} c={c} />
        <Surface w={w} y={ground} c={c} />
        <Line
          x1={0}
          y1={datum}
          x2={w}
          y2={datum}
          stroke={c.chartInk}
          strokeWidth={1.4}
          strokeDasharray={chart.dash}
        />
        <ChartText x={6} y={datum + 16} fontSize={chart.small} fill={c.chartInk}>
          datum, z = 0
        </ChartText>
        <G opacity={below ? 0.4 : 1}>
          <Casing
            x={xp}
            y1={ground - 18}
            y2={yP + 6}
            width={12}
            screen={16}
            steel={ids.steel}
            c={c}
          />
          {yW !== undefined && !below ? (
            <G>
              <Rect x={xp - 4} y={yW} width={8} height={yP + 6 - yW} fill={c.water} opacity={0.8} />
              <Level x={xp} y={yW} c={c} />
            </G>
          ) : null}
        </G>
        {z !== undefined ? (
          <G>
            <Circle
              cx={xp}
              cy={yP}
              r={4}
              fill={c.chartHighlight}
              stroke={c.paper}
              strokeWidth={1.2}
            />
            {p !== undefined ? (
              <HeLabel
                x={xp - 14}
                y={yP + 4}
                text={r.named(spec.pressure, 'p', p, 'kPa')}
                anchor="end"
                w={w}
              />
            ) : null}
            <VDim
              x={xp + 40}
              y1={datum}
              y2={yP}
              text={r.named(spec.elevation, 'z', z, 'm')}
              w={w}
            />
          </G>
        ) : null}
        {psi !== undefined && yW !== undefined && !below ? (
          <VDim
            x={xp + 40}
            y1={yP}
            y2={yW}
            text={`${r.sym(spec.pressureHead, 'ψ')} = ${r.text(spec.pressureHead, psi, 'm')}`}
            w={w}
            color={c.waterDeep}
          />
        ) : null}
        {h !== undefined && yW !== undefined ? (
          <G>
            <Line
              x1={xp + 9}
              y1={yW}
              x2={w - 26}
              y2={yW}
              stroke={c.chartMuted}
              strokeWidth={1}
              strokeDasharray={chart.dashFine}
            />
            <VDim
              x={w - 30}
              y1={datum}
              y2={yW}
              text={r.named(spec.head, 'h', h, 'm')}
              w={w}
              side={-1}
              color={c.chartHighlight}
            />
          </G>
        ) : null}
      </Svg>
    );
  };

  const lines: string[] = [];
  if (psi !== undefined && p !== undefined)
    lines.push(
      `${r.sym(spec.pressureHead, 'ψ')} = ${r.sym(spec.pressure, 'p')} ÷ γ = ${r.bare(spec.pressure, p)} ÷ ${n3(gamma)} = ${r.text(spec.pressureHead, psi, 'm')}.`,
    );
  if (h !== undefined && z !== undefined && psi !== undefined)
    lines.push(
      `${r.sym(spec.head, 'h')} = ${r.sym(spec.elevation, 'z')} + ${r.sym(spec.pressureHead, 'ψ')} = ${r.bare(spec.elevation, z)} + ${n3(psi)} = ${r.text(spec.head, h, 'm')}.`,
    );
  if (below)
    lines.push(
      'The pressure is below the air’s: water stands below the screen, which a tensiometer reads.',
    );
  else lines.push('Water rises in the pipe to the total head; heights to scale from the datum.');
  return (
    <View>
      <Canvas aspect={(w) => H / w}>{({ w }) => art(w)}</Canvas>
      <Caption>{lines.join(' ')}</Caption>
    </View>
  );
}

// ─── well: Thiem's cone of depression ───────────────────────────────────────

function WellView({ spec, calc }: { spec: Spec<'well'>; calc: Calculator }) {
  const c = usePalette();
  const r = useReader(calc);
  const ids = usePaintIds('steel');
  const b = r.get(spec.thickness);
  const r1 = r.get(spec.r1);
  const r2 = r.get(spec.r2);
  const h1 = r.get(spec.h1);
  const h2 = r.get(spec.h2);
  const K = r.get(spec.conductivity);
  const radii = r1 !== undefined && r2 !== undefined && r1 > 0 && r2 > r1;
  const heads = h1 !== undefined && h2 !== undefined;
  const cone = radii && heads;
  const rising = cone && h2! > h1!;
  const Q =
    cone && K !== undefined && b !== undefined ? thiemRate(K, b, h1!, h2!, r1!, r2!) : undefined;
  const xw = 54;
  const reach = radii ? r2! * 1.15 : 1;
  /** The aquifer's drawn thickness: b at the lengths' scale, kept between 28 and 104 px. */
  const thick = (w: number) =>
    b !== undefined && radii ? Math.max(28, Math.min(104, (b * (w - 16 - xw)) / reach)) : 64;
  const heightOf = (w: number) => thick(w) + 214;
  const scaled =
    b !== undefined && radii && Math.abs(thick(358) - (b * (358 - 16 - xw)) / reach) < 1e-9;

  const art = (w: number) => {
    const H = heightOf(w);
    const sx = (w - 16 - xw) / reach;
    const X = (rr: number) => xw + rr * sx;
    const ground = 30;
    const clayTop = 112;
    const clayBot = 138;
    const bpx = thick(w);
    const aqBot = clayBot + bpx;
    const base = aqBot + 22;
    // Heads on a stretched scale in the band above the confining clay.
    const rMin = radii ? Math.max(r1! / 6, 2.5 / sx) : 1;
    const hLow = cone ? thiemHead(rMin, h1!, h2!, r1!, r2!) : 0;
    const hHigh = cone ? thiemHead(reach, h1!, h2!, r1!, r2!) : 1;
    const span = Math.abs(hHigh - hLow) || 1;
    const yTop = 48;
    const yLow = 102;
    const hMin = Math.min(hLow, hHigh);
    const Y = (hh: number) => yLow - ((hh - hMin) / span) * (yLow - yTop);
    const curve: string[] = [];
    const dashed: string[][] = [[], []];
    if (cone) {
      for (let k = 0; k <= 120; k++) {
        const rr = rMin * (reach / rMin) ** (k / 120);
        const pt = `${X(rr).toFixed(1)} ${Y(thiemHead(rr, h1!, h2!, r1!, r2!)).toFixed(1)}`;
        if (rr < r1! * 0.999) dashed[0]!.push(pt);
        else if (rr > r2! * 1.001) dashed[1]!.push(pt);
        else curve.push(pt);
      }
    }
    const mirror = cone
      ? Array.from({ length: 40 }, (_, k) => {
          const rr = rMin * ((xw - 4) / sx / rMin) ** (k / 39);
          return `${(xw - rr * sx).toFixed(1)} ${Y(thiemHead(rr, h1!, h2!, r1!, r2!)).toFixed(1)}`;
        })
      : [];
    const path = (pts: string[]) => (pts.length > 1 ? `M ${pts.join(' L ')}` : '');
    const levelAt = (rr: number, hh: number) => (cone ? Y(hh) : undefined);
    const y1 = radii && heads ? levelAt(r1!, h1!) : undefined;
    const y2 = radii && heads ? levelAt(r2!, h2!) : undefined;
    return (
      <Svg width={w} height={H}>
        <Defs>
          <SteelDefs id={ids.steel} c={c} />
        </Defs>
        <Sand x={0} y={ground} w={w} h={clayTop - ground} c={c} />
        <Clay x={0} y={clayTop} w={w} h={clayBot - clayTop} c={c} />
        <Sand x={0} y={clayBot} w={w} h={bpx} c={c} />
        <Rect x={0} y={clayBot} width={w} height={bpx} fill={c.water} opacity={0.32} />
        <Clay x={0} y={aqBot} w={w} h={base - aqBot} c={c} />
        <Surface w={w} y={ground} c={c} />
        <G opacity={cone && !rising ? 0.4 : 1}>
          {cone ? (
            <G>
              <Path d={path(curve)} stroke={c.waterDeep} strokeWidth={2.4} fill="none" />
              <Path
                d={path(dashed[0]!)}
                stroke={c.waterDeep}
                strokeWidth={1.6}
                fill="none"
                strokeDasharray={chart.dashFine}
              />
              <Path
                d={path(dashed[1]!)}
                stroke={c.waterDeep}
                strokeWidth={1.6}
                fill="none"
                strokeDasharray={chart.dashFine}
              />
              <Path
                d={path(mirror)}
                stroke={c.waterDeep}
                strokeWidth={1.6}
                fill="none"
                strokeDasharray={chart.dashFine}
              />
            </G>
          ) : null}
          {/* Flow toward the well through the aquifer. */}
          {cone && rising
            ? [0.3, 0.62].map((f, k) => (
                <Arrow
                  key={k}
                  x1={X(reach * f) + 18}
                  y1={clayBot + bpx * (k ? 0.68 : 0.32)}
                  x2={X(reach * f) - 18}
                  y2={clayBot + bpx * (k ? 0.68 : 0.32)}
                  color={c.waterDeep}
                  width={2.2}
                />
              ))
            : null}
        </G>
        <Casing
          x={xw}
          y1={ground - 16}
          y2={aqBot - 2}
          width={13}
          screen={bpx - 6}
          steel={ids.steel}
          c={c}
        />
        {Q !== undefined ? (
          <G>
            <Arrow x1={xw} y1={ground - 14} x2={xw} y2={8} color={c.waterDeep} width={3} />
            <HeLabel
              x={xw + 12}
              y={16}
              text={r.named(spec.rate, 'Q', Q, 'm³/day')}
              anchor="start"
              w={w}
            />
          </G>
        ) : null}
        {radii
          ? [[r1!, y1, h1, spec.h1, 'h₁'] as const, [r2!, y2, h2, spec.h2, 'h₂'] as const].map(
              ([rr, yy, hh, field, name], k) => (
                <G key={k}>
                  <Casing
                    x={X(rr)}
                    y1={ground - 12}
                    y2={aqBot - 2}
                    width={7}
                    screen={bpx - 8}
                    steel={ids.steel}
                    c={c}
                  />
                  {yy !== undefined && hh !== undefined ? (
                    <G>
                      <Level x={X(rr)} y={yy} c={c} />
                      <HeLabel
                        x={k === 0 ? X(rr) + 12 : X(rr) - 12}
                        y={k === 0 ? yy + 18 : yy - 12}
                        text={r.named(field, name, hh, 'm')}
                        anchor={k === 0 ? 'start' : 'end'}
                        w={w}
                      />
                    </G>
                  ) : null}
                </G>
              ),
            )
          : null}
        {b !== undefined ? (
          <VDim
            x={w - 12}
            y1={clayBot}
            y2={aqBot}
            text={r.named(spec.thickness, 'b', b, 'm')}
            w={w}
            side={-1}
          />
        ) : null}
        <ChartText
          x={radii ? X(r2!) - 10 : w / 2}
          y={clayTop + 17}
          textAnchor="end"
          fontSize={chart.small}
        >
          confining clay
        </ChartText>
        {radii ? (
          <G>
            <Dimension x1={xw} x2={X(r1!)} y={base + 16} text={r.sym(spec.r1, 'r₁')} w={w} />
            <Dimension
              x1={xw}
              x2={X(r2!)}
              y={base + 36}
              text={r.named(spec.r2, 'r₂', r2!, 'm')}
              w={w}
            />
          </G>
        ) : null}
      </Svg>
    );
  };

  const lines: string[] = [];
  if (r1 !== undefined && r2 !== undefined && !radii)
    lines.push('The far well must be farther out: r₂ > r₁ > 0.');
  if (cone && !rising)
    lines.push('Heads rise toward the far well when a well pumps: h₂ must be above h₁.');
  if (cone && rising) {
    if (Q !== undefined)
      lines.push(
        `${r.sym(spec.rate, 'Q')} = 2π${r.sym(spec.conductivity, 'K')}${r.sym(spec.thickness, 'b')}(${r.sym(spec.h2, 'h₂')} − ${r.sym(spec.h1, 'h₁')}) ÷ ln(${r.sym(spec.r2, 'r₂')} ÷ ${r.sym(spec.r1, 'r₁')}) = 2π × ${r.bare(spec.conductivity, K!)} × ${r.bare(spec.thickness, b!)} × ${n3(h2! - h1!)} ÷ ln(${n3(r2! / r1!)}) = ${r.text(spec.rate, Q, 'm³/day')}.`,
      );
    lines.push(
      `The cone passes both observed heads (${r.sym(spec.r1, 'r₁')} = ${r.text(spec.r1, r1!, 'm')}); heads drawn on a stretched scale, solid where Thiem's equation is measured.`,
    );
    if (b !== undefined && !scaled) lines.push('The aquifer’s thickness is not drawn to scale.');
  }
  return (
    <View>
      <Canvas aspect={(w) => heightOf(w) / w}>{({ w }) => art(w)}</Canvas>
      <Caption>{lines.join(' ') || 'Type the radii and heads to draw the cone.'}</Caption>
    </View>
  );
}

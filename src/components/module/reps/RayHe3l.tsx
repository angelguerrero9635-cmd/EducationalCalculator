/**
 * HC68 `rayDiagram` modes `singleSlit`, `grating` and `thinFilm` (RayDiagramHe3lSpec in
 * typesHe3l.ts): diffraction by one slit with the screen's brightness and the central band,
 * a grating's orders as rays at their true angles, and a thin film's two reflected rays with the
 * extra path and the phase flips. Diagrams: flat. A "?" draws nothing for that value.
 */
import { View } from 'react-native';
import Svg, { Circle, G, Line, Path, Rect } from 'react-native-svg';

import type { RayDiagramHe3lSpec } from '@/data/modules/typesHe3l';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, Caption, ChartText } from './common';
import { Arrow } from './he1fKit';
import { fmt, Tag } from './he2fKit';
import { lightColor, lightName, useHe3l } from './he3lKit';
import { gratingAngle, gratingOf, singleSlitOf, slitBrightness, thinFilmOf } from './he3lMath';

type SingleSlit = Extract<RayDiagramHe3lSpec, { mode: 'singleSlit' }>;
type Grating = Extract<RayDiagramHe3lSpec, { mode: 'grating' }>;
type ThinFilm = Extract<RayDiagramHe3lSpec, { mode: 'thinFilm' }>;

const DEG = Math.PI / 180;
const fixedHeight = (h: number) => (w: number) => h / w;

export function RayHe3l({ spec, calc }: { spec: RayDiagramHe3lSpec; calc: Calculator }) {
  if (spec.mode === 'singleSlit') return <SingleSlitView spec={spec} calc={calc} />;
  if (spec.mode === 'grating') return <GratingView spec={spec} calc={calc} />;
  return <ThinFilmView spec={spec} calc={calc} />;
}

/** An arc of radius r about (x, y) from angle a0 to a1 (degrees, counterclockwise from +x, up). */
const arc = (x: number, y: number, r: number, a0: number, a1: number) => {
  const p = (a: number) => `${x + r * Math.cos(a * DEG)} ${y - r * Math.sin(a * DEG)}`;
  return `M ${p(a0)} A ${r} ${r} 0 0 ${a1 > a0 ? 0 : 1} ${p(a1)}`;
};

// ─── Single slit ─────────────────────────────────────────────────────────────

const SLIT_H = 320;

function SingleSlitView({ spec, calc }: { spec: SingleSlit; calc: Calculator }) {
  const c = usePalette();
  const { si, label } = useHe3l(calc);
  const lam = si(spec.wavelength, 1e-9);
  const a = si(spec.width, 1e-3);
  const L = si(spec.screen);
  const slit = lam !== undefined && a !== undefined ? singleSlitOf(lam, a, L ?? 1) : undefined;
  const none = slit !== undefined && slit.theta1 === undefined;
  const theta1 = slit?.theta1;
  const w1 = L !== undefined && slit?.central !== undefined ? slit.central : undefined;
  const nm = lam === undefined ? undefined : lam * 1e9;
  const col = lightColor(c, nm);

  const lamText = label(spec.wavelength, 'λ', nm, 'nm');
  const aText = label(spec.width, 'a', a === undefined ? undefined : a * 1e3, 'mm');
  const LText = label(spec.screen, 'L', L, 'm');
  const thText =
    typeof spec.angle === 'string'
      ? label(spec.angle, 'θ₁', undefined)
      : theta1 === undefined
        ? undefined
        : `θ₁ = ${fmt(theta1)}°`;
  const wText =
    typeof spec.central === 'string'
      ? label(spec.central, 'w', undefined)
      : w1 === undefined
        ? undefined
        : `w = ${fmt(w1 * 1e3)} mm`;

  const lines: string[] = [];
  if (lam !== undefined && a !== undefined && theta1 !== undefined)
    lines.push(
      `First dark fringe: sin θ₁ = λ ÷ a = ${fmt(lam * 1e9)} nm ÷ ${fmt(a * 1e3)} mm = ${fmt(lam / a)}, θ₁ = ${fmt(theta1)}°`,
    );
  else lines.push('Dark fringes where a sin θ = mλ (m = 1, 2, 3, …).');
  if (w1 !== undefined && L !== undefined && theta1 !== undefined)
    lines.push(
      `Central band: w = 2L tan θ₁ = 2 × ${fmt(L)} m × tan ${fmt(theta1)}° = ${fmt(w1 * 1e3)} mm, twice each side band.`,
    );
  else if (!none) lines.push('Central band: w = 2L tan θ₁.');
  if (none)
    lines.push(
      'The slit is no wider than the wavelength: a sin θ = λ has no angle, so there is no dark fringe and the light spreads over the whole screen.',
    );
  lines.push('Across is not to scale: the screen is much farther than drawn.');

  return (
    <View>
      <Canvas aspect={fixedHeight(SLIT_H)}>
        {({ w, h }) => {
          const mid = h / 2 + 4;
          const bx = Math.round(w * 0.25);
          const sx = Math.round(w * 0.56);
          const stripX = sx + 4;
          const curve0 = sx + 18;
          const curveW = Math.max(30, w - curve0 - 70);
          const brX = curve0 + curveW + 10;
          const half = h / 2 - 34;
          // Screen px per metre: the first dark fringe at a third of the half-height (with no dark
          // fringe, 45° at the edge).
          const yFirst = half * 0.36;
          const k = slit && theta1 !== undefined ? yFirst / Math.tan(theta1 * DEG) : half;
          const thetaAt = (py: number) => Math.atan(py / k) / DEG;
          const rows = Array.from({ length: Math.floor((2 * half) / 2) }, (_, i) => -half + i * 2);
          const curve =
            slit && lam !== undefined && a !== undefined
              ? rows
                  .map(
                    (py, i) =>
                      `${i ? 'L' : 'M'} ${curve0 + curveW * slitBrightness(lam, a, thetaAt(py))} ${mid - py}`,
                  )
                  .join(' ')
              : undefined;
          const y1 = theta1 !== undefined ? yFirst : undefined;
          const darks = (slit?.darks ?? []).filter(
            (d) => d.theta !== undefined && k * Math.tan(d.theta * DEG) <= half,
          );
          return (
            <Svg width={w} height={h}>
              <G opacity={none ? 0.45 : 1}>
                {/* The light coming in. */}
                <Rect x={6} y={mid - 16} width={bx - 6} height={32} fill={col} opacity={0.3} />
                {nm !== undefined ? (
                  <Arrow x1={10} y1={mid} x2={bx - 10} y2={mid} color={col} width={1.5} />
                ) : null}
                {/* The barrier and its slit (its width drawn larger than it is). */}
                <Rect x={bx - 3} y={28} width={6} height={mid - 6 - 28} fill={c.metalDark} />
                <Rect
                  x={bx - 3}
                  y={mid + 6}
                  width={6}
                  height={h - 34 - mid - 6}
                  fill={c.metalDark}
                />
                {/* The screen. */}
                <Rect x={sx - 2} y={mid - half} width={4} height={2 * half} fill={c.chartInk} />
                <Line
                  x1={bx}
                  y1={mid}
                  x2={sx}
                  y2={mid}
                  stroke={c.chartMuted}
                  strokeWidth={1}
                  strokeDasharray={chart.dashFine}
                />
                {/* Brightness along the screen, and the same as a curve. */}
                {curve
                  ? rows.map((py) => (
                      <Rect
                        key={py}
                        x={stripX}
                        y={mid - py - 1}
                        width={10}
                        height={2}
                        fill={col}
                        opacity={slitBrightness(lam!, a!, thetaAt(py))}
                      />
                    ))
                  : null}
                <Line
                  x1={curve0}
                  y1={mid - half}
                  x2={curve0}
                  y2={mid + half}
                  stroke={c.chartGrid}
                  strokeWidth={1}
                />
                {curve ? <Path d={curve} stroke={col} strokeWidth={2} fill="none" /> : null}
                {/* Rays to the first dark fringes, the angle arced. */}
                {y1 !== undefined
                  ? [-1, 1].map((s) => (
                      <Line
                        key={s}
                        x1={bx}
                        y1={mid}
                        x2={sx}
                        y2={mid - s * y1}
                        stroke={c.chartInk}
                        strokeWidth={1.5}
                      />
                    ))
                  : null}
                {y1 !== undefined ? (
                  <G>
                    <Path
                      d={arc(bx, mid, (sx - bx) * 0.45, 0, Math.atan(y1 / (sx - bx)) / DEG)}
                      stroke={c.chartInk}
                      strokeWidth={1}
                      fill="none"
                    />
                    <Tag
                      x={bx + (sx - bx) * 0.45 + 4}
                      y={mid - 5}
                      text="θ₁"
                      anchor="start"
                      chip={false}
                    />
                  </G>
                ) : null}
                {/* Dark fringes marked along the screen. */}
                {darks.flatMap((d) =>
                  [-1, 1].map((s) => {
                    const py = k * Math.tan(d.theta * DEG);
                    return (
                      <Line
                        key={`${d.m}${s}`}
                        x1={sx - 6}
                        y1={mid - s * py}
                        x2={sx + 2}
                        y2={mid - s * py}
                        stroke={c.chartInk}
                        strokeWidth={1.5}
                      />
                    );
                  }),
                )}
                {/* The central band bracketed. */}
                {y1 !== undefined ? (
                  <G>
                    <Line x1={brX} y1={mid - y1} x2={brX} y2={mid + y1} stroke={c.chartInk} />
                    <Line
                      x1={brX - 4}
                      y1={mid - y1}
                      x2={brX + 4}
                      y2={mid - y1}
                      stroke={c.chartInk}
                    />
                    <Line
                      x1={brX - 4}
                      y1={mid + y1}
                      x2={brX + 4}
                      y2={mid + y1}
                      stroke={c.chartInk}
                    />
                    {wText ? (
                      <>
                        <Tag
                          x={brX + 6}
                          y={mid - 3}
                          text={wText.split(' = ')[0]!}
                          anchor="start"
                          chip={false}
                          w={w}
                        />
                        <ChartText x={w - 4} y={mid + 13} fontSize={chart.label} textAnchor="end">
                          {wText.split(' = ')[1]!}
                        </ChartText>
                      </>
                    ) : null}
                  </G>
                ) : null}
              </G>
              {lamText ? <Tag x={6} y={mid - 24} text={lamText} anchor="start" w={w} /> : null}
              {aText ? <Tag x={bx} y={h - 12} text={aText} w={w} /> : null}
              {LText ? (
                <Tag x={(bx + sx) / 2} y={18} text={`${LText} (not to scale)`} w={w} />
              ) : null}
              {thText ? <Tag x={sx + 8} y={h - 12} text={thText} anchor="start" w={w} /> : null}
            </Svg>
          );
        }}
      </Canvas>
      <Caption>{lines.join(' · ')}</Caption>
    </View>
  );
}

// ─── Grating ─────────────────────────────────────────────────────────────────

const GRATING_H = 380;

function GratingView({ spec, calc }: { spec: Grating; calc: Calculator }) {
  const c = usePalette();
  const { si, label, rep } = useHe3l(calc);
  const lam = si(spec.wavelength, 1e-9);
  // The spacing as the page shows it when it has one (N rounded can move m_max at an edge).
  const dGiven = si(spec.spacing, 1e-6);
  const N = dGiven !== undefined && dGiven > 0 ? 1 / dGiven : si(spec.lines, 1e3);
  const g = lam !== undefined && N !== undefined && N > 0 ? gratingOf(lam, N) : undefined;
  const orderRaw =
    spec.order === undefined
      ? undefined
      : typeof spec.order === 'number'
        ? spec.order
        : rep.known(spec.order)
          ? rep.shown(spec.order)
          : undefined;
  const order = orderRaw !== undefined && Number.isInteger(orderRaw) ? orderRaw : undefined;
  const litAngle = g && order !== undefined ? gratingAngle(lam!, g.d, order) : undefined;
  const nm = lam === undefined ? undefined : lam * 1e9;
  const col = lightColor(c, nm);

  const lamText = label(spec.wavelength, 'λ', nm, 'nm');
  const NText = label(spec.lines, 'N', N === undefined ? undefined : N / 1e3, 'lines/mm');
  const dText =
    typeof spec.spacing === 'string'
      ? label(spec.spacing, 'd', undefined)
      : N !== undefined
        ? `d = ${fmt(1e6 / N)} μm`
        : undefined;
  const mMaxText =
    typeof spec.highest === 'string'
      ? label(spec.highest, 'm_max', undefined)
      : g
        ? `m_max = ${g.highest}`
        : undefined;

  const thetaText =
    litAngle === undefined
      ? ''
      : typeof spec.angle === 'string'
        ? (label(spec.angle, 'θ', undefined) ?? `θ = ${fmt(litAngle)}°`)
        : `θ = ${fmt(litAngle)}°`;
  const lines: string[] = [];
  if (N !== undefined) lines.push(`d = 1 ÷ N = 1 ÷ ${fmt(N / 1e3)} lines/mm = ${fmt(1e6 / N)} μm`);
  if (g && order !== undefined && litAngle !== undefined)
    lines.push(
      `Order ${order}: sin θ = mλ ÷ d = ${order} × ${fmt(lam! * 1e9)} nm ÷ ${fmt(g.d * 1e9)} nm = ${fmt((order * lam!) / g.d)}, θ = ${fmt(litAngle)}°`,
    );
  else lines.push('Bright orders where d sin θ = mλ.');
  if (g && order !== undefined && litAngle === undefined)
    lines.push(
      `Order ${order} would need sin θ = ${fmt((order * lam!) / g.d)}, past 1: there is no such beam.`,
    );
  if (g)
    lines.push(
      `Highest order: m_max = ⌊d ÷ λ⌋ = ⌊${fmt(g.d / lam!)}⌋ = ${g.highest}; m = ${g.highest + 1} would need sin θ = ${fmt(((g.highest + 1) * lam!) / g.d)}, past 1.`,
    );

  return (
    <View>
      <Canvas aspect={fixedHeight(GRATING_H)}>
        {({ w, h }) => {
          const mid = h / 2;
          const gx = Math.round(w * 0.25);
          const R = Math.min(w - gx - 92, mid - 34);
          const shown = g ? g.orders.filter((o) => o.m <= 40) : [];
          // Label the lit order, ±1, the last, and others while they stay apart.
          const labelled = new Set<number>();
          let lastY = -Infinity;
          for (const o of shown) {
            const y = R * Math.sin(o.theta * DEG);
            const must = o.m === order || o.m === g!.highest || o.m <= 1;
            if (must || y - lastY > 18) {
              labelled.add(o.m);
              lastY = y;
            }
          }
          const end = (theta: number, r = R) => ({
            x: gx + r * Math.cos(theta * DEG),
            y: mid - r * Math.sin(theta * DEG),
          });
          return (
            <Svg width={w} height={h}>
              {/* The light coming in, and the grating with its lines. */}
              <Rect x={6} y={mid - 10} width={gx - 6} height={20} fill={col} opacity={0.3} />
              {nm !== undefined ? (
                <Arrow x1={10} y1={mid} x2={gx - 8} y2={mid} color={col} width={1.5} />
              ) : null}
              <Rect
                x={gx - 3}
                y={mid - 70}
                width={6}
                height={140}
                fill={c.chartSurface}
                stroke={c.chartInk}
              />
              {Array.from({ length: 23 }, (_, i) => (
                <Line
                  key={i}
                  x1={gx - 3}
                  y1={mid - 66 + i * 6}
                  x2={gx + 3}
                  y2={mid - 66 + i * 6}
                  stroke={c.chartInk}
                  strokeWidth={0.8}
                />
              ))}
              {/* 90° either side: no order reaches it. */}
              <Path
                d={arc(gx, mid, R, -90, 90)}
                stroke={c.chartGrid}
                strokeWidth={1}
                strokeDasharray={chart.dashFine}
                fill="none"
              />
              {shown.flatMap((o) =>
                (o.m === 0 ? [1] : [1, -1]).map((s) => {
                  const lit = o.m * s === order;
                  const p = end(s * o.theta);
                  return (
                    <G key={`${o.m}${s}`}>
                      <Line
                        x1={gx}
                        y1={mid}
                        x2={p.x}
                        y2={p.y}
                        stroke={col}
                        strokeWidth={lit ? 3 : 1.5}
                        opacity={lit || o.m === 0 ? 1 : 0.75}
                      />
                      <Circle cx={p.x} cy={p.y} r={lit ? 5 : 3.5} fill={col} />
                    </G>
                  );
                }),
              )}
              {shown
                .filter((o) => labelled.has(o.m))
                .flatMap((o) =>
                  (o.m === 0 ? [1] : [1, -1]).map((s) => {
                    const p = end(s * o.theta, R + 9);
                    const lit = o.m * s === order;
                    const base = o.m === 0 ? 'm = 0' : s > 0 ? `m = ${o.m}` : `−${o.m}`;
                    const text =
                      lit && order !== 0 ? `${s > 0 ? base : `m = −${o.m}`}, ${thetaText}` : base;
                    return (
                      <Tag
                        key={`l${o.m}${s}`}
                        x={p.x}
                        y={p.y + (s * o.theta > 60 ? -2 : s * o.theta < -60 ? 12 : 4)}
                        text={text}
                        anchor={Math.abs(o.theta) > 60 ? 'middle' : 'start'}
                        chip={false}
                        bold={o.m * s === order}
                        w={w}
                      />
                    );
                  }),
                )}
              {litAngle !== undefined && order !== 0 ? (
                <G>
                  <Path
                    d={arc(gx, mid, R * 0.42, 0, litAngle)}
                    stroke={c.chartInk}
                    strokeWidth={1.2}
                    fill="none"
                  />
                </G>
              ) : null}
              {lamText ? <Tag x={6} y={mid - 18} text={lamText} anchor="start" w={w} /> : null}
              {NText ? <Tag x={6} y={h - 30} text={NText} anchor="start" w={w} /> : null}
              {dText ? <Tag x={6} y={h - 12} text={dText} anchor="start" w={w} /> : null}
              {mMaxText ? <Tag x={w - 6} y={h - 12} text={mMaxText} anchor="end" w={w} /> : null}
            </Svg>
          );
        }}
      </Canvas>
      <Caption>{lines.join(' · ')}</Caption>
    </View>
  );
}

// ─── Thin film ───────────────────────────────────────────────────────────────

const FILM_H = 330;
const BAND = [380, 750];

function ThinFilmView({ spec, calc }: { spec: ThinFilm; calc: Calculator }) {
  const c = usePalette();
  const { si, label, rep } = useHe3l(calc);
  const n = si(spec.index);
  const t = si(spec.thickness, 1e-9);
  const m =
    typeof spec.order === 'number'
      ? spec.order
      : rep.known(spec.order)
        ? rep.shown(spec.order)
        : undefined;
  const flips = spec.flips ?? 'one';
  const below = si(spec.below);
  const film =
    n !== undefined && t !== undefined && m !== undefined ? thinFilmOf(n, t, m, flips) : undefined;
  const nm = film?.lambda === undefined ? undefined : film.lambda * 1e9;
  const col = lightColor(c, nm);
  // Every order's bright λ in or near the visible band.
  const others =
    n !== undefined && t !== undefined
      ? Array.from({ length: 11 }, (_, k) => thinFilmOf(n, t, k, flips).lambda)
          .map((l, k) => ({ k, nm: l === undefined ? undefined : l * 1e9 }))
          .filter(
            (o): o is { k: number; nm: number } => o.nm !== undefined && o.nm >= 300 && o.nm <= 850,
          )
      : [];
  const halfText = flips === 'one' ? '(m + ½)λ' : 'mλ';
  const nText = label(spec.index, 'n', n);
  const tText = label(spec.thickness, 't', t === undefined ? undefined : t * 1e9, 'nm');
  const lamText =
    typeof spec.wavelength === 'string'
      ? label(spec.wavelength, 'λ', undefined)
      : nm !== undefined
        ? `λ = ${fmt(nm)} nm`
        : undefined;
  const lines: string[] = [];
  if (film && nm !== undefined)
    lines.push(
      `Bright: 2nt = ${halfText}, λ = 2 × ${fmt(n!)} × ${fmt(t! * 1e9)} nm ÷ ${flips === 'one' ? fmt(m! + 0.5) : fmt(m!)} = ${fmt(nm)} nm (${lightName(nm)})`,
    );
  else lines.push(`Bright: 2nt = ${halfText}.`);
  if (film && nm === undefined)
    lines.push(
      'With both reflections flipped (or neither), m = 0 gives no wavelength: m starts at 1.',
    );
  lines.push(
    flips === 'one'
      ? 'One reflection flips by half a wave (the top, into the denser film), so the extra path must be a whole number of waves plus a half.'
      : flips === 'both'
        ? 'Both reflections flip by half a wave, so the flips cancel and the extra path is a whole number of waves.'
        : 'Neither reflection flips, so the extra path is a whole number of waves.',
  );
  return (
    <View>
      <Canvas aspect={fixedHeight(FILM_H)}>
        {({ w }) => {
          const yT = 120;
          const yB = 196;
          const yS = 238;
          const x1 = Math.round(w * 0.3);
          const inc = 30;
          const sinT = n !== undefined && n >= 1 ? Math.sin(inc * DEG) / n : Math.sin(inc * DEG);
          const th = Math.asin(sinT) / DEG;
          const dx = (yB - yT) * Math.tan(th * DEG);
          const P1 = { x: x1, y: yT };
          const P2 = { x: x1 + dx, y: yB };
          const P3 = { x: x1 + 2 * dx, y: yT };
          const out = (p: { x: number; y: number }) => ({
            x: p.x + 92 * Math.sin(inc * DEG),
            y: p.y - 92 * Math.cos(inc * DEG),
          });
          const src = { x: x1 - 104 * Math.sin(inc * DEG), y: yT - 104 * Math.cos(inc * DEG) };
          const bandX0 = 24;
          const bandW = w - 48;
          const bandY = FILM_H - 50;
          const xOf = (l: number) =>
            bandX0 +
            (Math.min(Math.max(l, BAND[0]!), BAND[1]!) - BAND[0]!) *
              (bandW / (BAND[1]! - BAND[0]!));
          const spectrum = [
            [380, 450, c.spectrumViolet],
            [450, 495, c.spectrumBlue],
            [495, 570, c.spectrumGreen],
            [570, 590, c.spectrumYellow],
            [590, 620, c.spectrumOrange],
            [620, 750, c.spectrumRed],
          ] as const;
          const flipMark = (p: { x: number; y: number }, key: string, up: boolean) => (
            <G key={key}>
              <Circle cx={p.x} cy={p.y} r={5} fill="none" stroke={c.he3lFlip} strokeWidth={2} />
              <Tag
                x={up ? p.x - 18 : p.x + 12}
                y={up ? p.y - 4 : p.y + 18}
                text="flip ½λ"
                anchor={up ? 'end' : 'start'}
                color={c.he3lFlip}
                size={chart.label}
                w={w}
              />
            </G>
          );
          return (
            <Svg width={w} height={FILM_H}>
              <Tag x={8} y={20} text="air, n = 1" anchor="start" chip={false} bold={false} />
              <Rect x={0} y={yT} width={w} height={yB - yT} fill={c.he3lFilm} />
              <Line x1={0} y1={yT} x2={w} y2={yT} stroke={c.chartInk} strokeWidth={1.5} />
              <Line x1={0} y1={yB} x2={w} y2={yB} stroke={c.chartInk} strokeWidth={1.5} />
              {below !== undefined ? (
                <Rect x={0} y={yB} width={w} height={yS - yB} fill={c.chartSurface} />
              ) : null}
              {nText ? (
                <Tag x={8} y={yT + 20} text={`film, ${nText}`} anchor="start" chip={false} />
              ) : null}
              <Tag
                x={8}
                y={yB + 20}
                text={
                  below !== undefined ? `below, ${label(spec.below, 'n', below)}` : 'air, n = 1'
                }
                anchor="start"
                chip={false}
                bold={false}
              />
              {/* The incoming ray, both reflections and the path through the film. */}
              <Arrow x1={src.x} y1={src.y} x2={P1.x} y2={P1.y} color={c.chartInk} width={1.5} />
              <Line x1={P1.x} y1={P1.y} x2={P2.x} y2={P2.y} stroke={c.chartInk} strokeWidth={1.5} />
              <Line x1={P2.x} y1={P2.y} x2={P3.x} y2={P3.y} stroke={c.chartInk} strokeWidth={1.5} />
              {[P1, P3].map((p, i) => {
                const o = out(p);
                return (
                  <G key={i}>
                    <Arrow
                      x1={p.x}
                      y1={p.y}
                      x2={o.x}
                      y2={o.y}
                      color={nm === undefined ? c.chartMuted : col}
                      width={2.5}
                    />
                    <Tag
                      x={o.x + 6}
                      y={o.y + 4}
                      text={i === 0 ? '1' : '2'}
                      anchor="start"
                      chip={false}
                    />
                  </G>
                );
              })}
              {flips !== 'none' ? flipMark(P1, 'top', true) : null}
              {flips === 'both' ? flipMark(P2, 'bottom', false) : null}
              <Tag
                x={(P2.x + P3.x) / 2 + 10}
                y={(yT + yB) / 2 + 4}
                text={`extra path 2nt${film ? ` = ${fmt(film.path * 1e9)} nm` : ''}`}
                anchor="start"
                w={w}
              />
              {/* The thickness bracketed (drawn thicker than it is). */}
              <Line x1={w - 14} y1={yT} x2={w - 14} y2={yB} stroke={c.chartInk} />
              <Line x1={w - 18} y1={yT} x2={w - 10} y2={yT} stroke={c.chartInk} />
              <Line x1={w - 18} y1={yB} x2={w - 10} y2={yB} stroke={c.chartInk} />
              {tText ? <Tag x={w - 20} y={yT - 8} text={tText} anchor="end" w={w} /> : null}
              {/* The visible band with each order's bright λ; the page's order lit. */}
              {spectrum.map(([l0, l1, f]) => (
                <Rect
                  key={l0}
                  x={xOf(l0)}
                  y={bandY}
                  width={xOf(l1) - xOf(l0)}
                  height={12}
                  fill={f}
                />
              ))}
              {[400, 500, 600, 700].map((l) => (
                <G key={l}>
                  <Line
                    x1={xOf(l)}
                    y1={bandY + 12}
                    x2={xOf(l)}
                    y2={bandY + 17}
                    stroke={c.chartMuted}
                  />
                  <Tag x={xOf(l)} y={bandY + 30} text={`${l}`} chip={false} bold={false} w={w} />
                </G>
              ))}
              {others
                .filter((o) => o.k !== m && o.nm >= BAND[0]! && o.nm <= BAND[1]!)
                .map((o) => (
                  <Line
                    key={o.k}
                    x1={xOf(o.nm)}
                    y1={bandY - 6}
                    x2={xOf(o.nm)}
                    y2={bandY + 12}
                    stroke={c.chartInk}
                    strokeWidth={1}
                    strokeDasharray={chart.dashFine}
                  />
                ))}
              {nm !== undefined ? (
                <G>
                  <Path d={`M ${xOf(nm)} ${bandY - 1} l -6 -9 l 12 0 Z`} fill={c.chartInk} />
                  {lamText ? (
                    <Tag
                      x={xOf(nm)}
                      y={bandY - 14}
                      text={
                        nm < BAND[0]!
                          ? `${lamText} (UV)`
                          : nm > BAND[1]!
                            ? `${lamText} (IR)`
                            : lamText
                      }
                      w={w}
                    />
                  ) : null}
                </G>
              ) : null}
            </Svg>
          );
        }}
      </Canvas>
      <Caption>{lines.join(' · ')}</Caption>
    </View>
  );
}

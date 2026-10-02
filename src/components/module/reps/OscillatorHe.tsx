import { View } from 'react-native';
import Svg, { Circle, Defs, G, Line, Path, Rect } from 'react-native-svg';

import type { OscillatorSpec } from '@/data/modules/typesHs3a';
import type { OscillatorHe1h } from '@/data/modules/typesHe1h';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, Caption, ChartText, useRep } from './common';
import { niceStep } from './hsdGrid';
import { springPath } from './hs3aKit';
import { formulaOnly, sig, SubLabel, Vec } from './hskKit';
import { siFactor } from './netMath';
import { forced, freeVibration, transmissibility, twoModes } from './oscMath';
import { Crate, Sheen, TopLight, url, usePaintIds } from './paint';

type Swing = Extract<OscillatorSpec, { mode?: 'swing' }>;
type X = number | string | undefined;

const BLOCK = 40;
const FLOOR = 100;
/** Graph margins: room for the tick labels on the left, the axis name at the bottom. */
const GX0 = 48;

/**
 * The oscillator's college view (HC11): the block on its spring, with a dashpot (damping), a
 * driving force (forcing), two springs (springs) or a second block (coupled), above the graph
 * the option asks for: the damped x–t trace inside its envelope, the trace from x₀ and v₀ with
 * φ as the first crest's shift, X ÷ δ_st or TR against r with the page's point, or the two
 * blocks' traces handing the motion back and forth. Values in SI; a "?" draws no curve.
 */
export function OscillatorHe({ spec, calc }: { spec: Swing & OscillatorHe1h; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  const ids = usePaintIds('light', 'sheen');
  const known = (x: X) => typeof x !== 'string' || rep.known(x);
  const si = (x: X, fallback = NaN): number =>
    x === undefined
      ? fallback
      : typeof x === 'number'
        ? x
        : rep.val(x) * siFactor(rep.variable(x).unit);
  const lab = (x: X, name: string, unit: string) =>
    typeof x === 'string' ? rep.label(x) : `${name} = ${x === undefined ? '?' : sig(x)} ${unit}`;
  const unitOf = (x: X, fallback: string) =>
    typeof x === 'string' ? (rep.variable(x).unit ?? fallback) : fallback;

  const { damping: d, phase: ph, forcing: f, transmit: tr, coupled: cp, springs: sp } = spec;
  const m = si(spec.mass, 1);
  const k = si(spec.spring, 1);
  const cDamp = d ? si(d.c, 0) : 0;
  const zetaF = f?.zeta !== undefined ? si(f.zeta) : d ? cDamp / (2 * Math.sqrt(k * m)) : 0;
  const wn = Math.sqrt(k / m);
  const base = known(spec.mass) && known(spec.spring);

  // Which graph: the response curve, transmissibility, coupled traces, or a trace in time.
  const graph = f ? 'forced' : tr ? 'transmit' : cp ? 'coupled' : sp ? 'none' : 'trace';
  const sketchH = cp ? FLOOR + 110 : FLOOR + 34;
  const graphH = graph === 'none' ? 0 : graph === 'coupled' ? 184 : 198;

  return (
    <View>
      <Canvas aspect={(w) => (sketchH + graphH + 8) / w}>
        {({ w, h }) => (
          <Svg width={w} height={h}>
            <Defs>
              <TopLight id={ids.light} />
              <Sheen id={ids.sheen} vertical />
            </Defs>
            {cp ? coupledSketch(w) : sketch(w)}
            {graph === 'trace' ? trace(w, sketchH) : null}
            {graph === 'forced' ? curve(w, sketchH, 'forced') : null}
            {graph === 'transmit' ? curve(w, sketchH, 'transmit') : null}
            {graph === 'coupled' ? coupledTraces(w, sketchH) : null}
          </Svg>
        )}
      </Canvas>
      <Caption>{caption()}</Caption>
    </View>
  );

  /** Wall, floor, the spring (or two), the dashpot, the block and the driving force. */
  function sketch(w: number) {
    const bx = w * 0.56;
    const left = 18;
    const spring = (x1: number, x2: number, y: number, key: string) => (
      <Path
        key={key}
        d={springPath(x1, y, x2, y, 8, 6)}
        stroke={c.physSpring}
        strokeWidth={2.2}
        fill="none"
      />
    );
    const yS = d || tr ? FLOOR - 29 : FLOOR - 20;
    const yD = FLOOR - 11;
    const springs = sp
      ? sp.layout === 'series'
        ? [
            spring(left, w * 0.3, FLOOR - 20, 's1'),
            spring(w * 0.3, bx - BLOCK / 2, FLOOR - 20, 's2'),
          ]
        : [
            spring(left, bx - BLOCK / 2, FLOOR - 31, 's1'),
            spring(left, bx - BLOCK / 2, FLOOR - 9, 's2'),
          ]
      : [spring(left, bx - BLOCK / 2, yS, 's')];
    const dash = d || tr ? dashpot(left, bx - BLOCK / 2, yD) : null;
    const letter = d?.letter ?? 'c';
    return (
      <G>
        <Rect x={4} y={FLOOR - 66} width={12} height={66} fill={c.wood} />
        <Line x1={16} y1={FLOOR - 66} x2={16} y2={FLOOR} stroke={c.chartInk} />
        <Line x1={4} y1={FLOOR} x2={w - 4} y2={FLOOR} stroke={c.chartInk} />
        {springs}
        {dash}
        <Crate x={bx - BLOCK / 2} y={FLOOR - BLOCK} size={BLOCK} lightId={ids.light} />
        {/* A number the page doesn't name (a transmissibility page's block) goes unlabelled. */}
        {typeof spec.mass === 'string' ? (
          <SubLabel
            x={bx}
            y={FLOOR - BLOCK / 2 + 5}
            text={rep.value(spec.mass)}
            size={chart.label}
            w={w}
          />
        ) : null}
        {sp ? (
          sp.layout === 'series' ? (
            <G>
              <Circle cx={w * 0.3} cy={FLOOR - 20} r={3} fill={c.chartInk} />
              <SubLabel
                x={(left + w * 0.3) / 2}
                y={FLOOR - 40}
                text={lab(sp.k1, 'k₁', 'N/m')}
                w={w}
              />
              <SubLabel
                x={(w * 0.3 + bx - BLOCK / 2) / 2}
                y={FLOOR + 18}
                text={lab(sp.k2, 'k₂', 'N/m')}
                w={w}
              />
            </G>
          ) : (
            <G>
              <SubLabel
                x={(left + bx) / 2 - 10}
                y={FLOOR - 46}
                text={lab(sp.k1, 'k₁', 'N/m')}
                w={w}
              />
              <SubLabel
                x={(left + bx) / 2 - 10}
                y={FLOOR + 18}
                text={lab(sp.k2, 'k₂', 'N/m')}
                w={w}
              />
            </G>
          )
        ) : (
          <SubLabel
            x={(left + bx) / 2 - 10}
            y={yS - 16}
            text={typeof spec.spring === 'string' ? rep.label(spec.spring) : 'k'}
            w={w}
          />
        )}
        {d || tr ? (
          <SubLabel
            x={(left + bx) / 2 - 10}
            y={FLOOR + 18}
            text={d ? lab(d.c, letter, 'N·s/m') : 'c'}
            w={w}
          />
        ) : null}
        {sp?.total ? (
          <SubLabel
            x={bx + BLOCK / 2 + 8}
            y={FLOOR - 16}
            text={rep.label(sp.total)}
            anchor="start"
            color={c.chartHighlight}
            w={w}
          />
        ) : null}
        {f ? (
          <G>
            <Vec
              x1={bx + BLOCK / 2 + 2}
              y1={FLOOR - 22}
              x2={bx + BLOCK / 2 + 50}
              y2={FLOOR - 22}
              color={c.forceNet}
            />
            <SubLabel
              x={bx + BLOCK / 2 + 6}
              y={FLOOR - 52}
              text="F₀ sin ωt"
              anchor="start"
              color={c.forceNet}
              w={w}
            />
            <SubLabel
              x={bx + BLOCK / 2 + 6}
              y={FLOOR - 34}
              text={lab(f.force, 'F₀', 'N')}
              anchor="start"
              size={chart.label}
              bold={false}
              w={w}
            />
            <SubLabel
              x={bx + BLOCK / 2 + 6}
              y={FLOOR + 18}
              text={lab(f.omega, 'ω', 'rad/s')}
              anchor="start"
              size={chart.label}
              bold={false}
              w={w}
            />
          </G>
        ) : null}
      </G>
    );
  }

  /** A dashpot from the wall to the block: a cylinder of oil and a piston rod. */
  function dashpot(x1: number, x2: number, y: number) {
    const cx0 = x1 + 6;
    const len = Math.max(30, (x2 - x1) * 0.55);
    const rod = cx0 + len * 0.55;
    return (
      <G>
        <Line x1={x1} y1={y} x2={cx0} y2={y} stroke={c.chartInk} strokeWidth={2} />
        <Rect
          x={cx0}
          y={y - 7}
          width={len}
          height={14}
          fill={c.metal}
          stroke={c.metalDark}
          strokeWidth={1.2}
        />
        <Rect x={cx0} y={y - 7} width={len} height={14} fill={url(ids.sheen)} />
        <Line x1={rod} y1={y - 5} x2={rod} y2={y + 5} stroke={c.chartInk} strokeWidth={2.5} />
        <Line x1={rod} y1={y} x2={x2} y2={y} stroke={c.chartInk} strokeWidth={2} />
      </G>
    );
  }

  /** The x–t trace: damped from x₀ and v₀, or x = A cos(ωt + φ) from start conditions. */
  function trace(w: number, top: number) {
    const gy0 = top + 22;
    const gy1 = top + 170;
    const mid = (gy0 + gy1) / 2;
    const gx1 = w - 14;
    const x0 = si(d?.x0 ?? ph?.x0 ?? spec.amplitude);
    const v0 = si(d?.v0 ?? ph?.v0, 0);
    const unit = unitOf(d?.x0 ?? ph?.x0 ?? spec.amplitude, 'm');
    const uf = siFactor(unit);
    const ok =
      base && known(d?.c) && known(d?.x0 ?? ph?.x0 ?? spec.amplitude) && known(d?.v0 ?? ph?.v0);
    const fv = freeVibration(m, cDamp, k, x0, v0);
    const tMark = d?.t ?? ph?.t;
    const n = d?.cycles !== undefined ? Math.max(1, Math.round(si(d.cycles))) : 0;
    const period = fv.wd > 0 ? (2 * Math.PI) / fv.wd : 0;
    const tEnd =
      period > 0
        ? Math.max(
            2.2 * period,
            n ? fv.crests(n + 1)[n]! + 0.4 * period : 0,
            tMark !== undefined ? si(tMark) * 1.15 : 0,
          )
        : Math.max(
            6 / Math.max(fv.wn * (fv.zeta - Math.sqrt(Math.max(0, fv.zeta ** 2 - 1))), 1e-9),
            tMark !== undefined ? si(tMark) * 1.15 : 0,
          );
    const peak = Math.max(
      Math.abs(x0),
      fv.envelope ? fv.envelope(0) : 0,
      ...Array.from({ length: 60 }, (_, i) => Math.abs(fv.x((tEnd * i) / 59))),
    );
    const step = niceStep(peak / uf / 2);
    const yMax = Math.ceil(((peak / uf) * 1.05) / step) * step * uf || 1;
    const TX = (t: number) => GX0 + ((gx1 - GX0) * t) / tEnd;
    const TY = (x: number) => mid - ((gy1 - gy0) / 2) * (x / yMax);
    const path = (fn: (t: number) => number) =>
      Array.from({ length: 241 }, (_, i) => {
        const t = (tEnd * i) / 240;
        return `${i ? 'L' : 'M'} ${TX(t)} ${TY(fn(t))}`;
      }).join(' ');
    const tStep = niceStep(tEnd / 5);
    const ticks = Array.from({ length: Math.floor(tEnd / tStep) + 1 }, (_, i) => i * tStep);
    const crests = n && fv.envelope ? fv.crests(n + 1) : [];
    const first = crests[0];
    const last = crests[n];
    const showPhase = !!ph && !d && fv.regime === 'none';
    const tc = showPhase ? fv.crests(1)[0]! : 0;
    return (
      <G>
        {axes(w, gy0, gy1, mid, `x (${unit})`)}
        {[-yMax, yMax].map((y) => (
          <ChartText
            key={y}
            x={GX0 - 5}
            y={TY(y) + 4}
            textAnchor="end"
            fontSize={chart.label}
            fill={c.chartMuted}
          >
            {sig(y / uf)}
          </ChartText>
        ))}
        {ticks.map((t) => (
          <G key={t}>
            <Line x1={TX(t)} y1={mid - 3} x2={TX(t)} y2={mid + 3} stroke={c.chartInk} />
            {t > 0 ? (
              <ChartText
                x={TX(t)}
                y={gy1 + 14}
                textAnchor="middle"
                fontSize={chart.label}
                fill={c.chartMuted}
              >
                {sig(t)}
              </ChartText>
            ) : null}
          </G>
        ))}
        <ChartText x={gx1} y={gy1 + 28} textAnchor="end" fontSize={chart.label} fill={c.chartMuted}>
          t (s)
        </ChartText>
        {ok && fv.envelope && fv.regime === 'under' ? (
          <G>
            <Path
              d={path(fv.envelope)}
              stroke={c.chartMuted}
              strokeWidth={1.5}
              strokeDasharray={chart.dash}
              fill="none"
            />
            <Path
              d={path((t) => -fv.envelope!(t))}
              stroke={c.chartMuted}
              strokeWidth={1.5}
              strokeDasharray={chart.dash}
              fill="none"
            />
          </G>
        ) : null}
        {ok ? (
          <Path d={path(fv.x)} stroke={c.chartHighlight} strokeWidth={2.5} fill="none" />
        ) : null}
        {ok && first !== undefined && last !== undefined ? (
          <G>
            {[first, last].map((t, i) => (
              <G key={i}>
                <Circle cx={TX(t)} cy={TY(fv.x(t))} r={4.5} fill={c.forceNet} />
                <SubLabel
                  x={TX(t) + 6}
                  y={TY(fv.x(t)) - 8}
                  text={
                    i === 0
                      ? `x₀ = ${sig(fv.x(t) / uf)} ${unit}`
                      : d?.end
                        ? rep.label(d.end)
                        : `xₙ = ${sig(fv.x(t) / uf)} ${unit}`
                  }
                  anchor="start"
                  size={chart.label}
                  color={c.forceNet}
                  w={w}
                />
              </G>
            ))}
            <SubLabel
              x={(TX(first) + TX(last)) / 2}
              y={gy1 - 6}
              text={`${typeof d?.cycles === 'string' ? rep.label(d.cycles) : `n = ${n}`} cycles`}
              size={chart.label}
              w={w}
            />
          </G>
        ) : null}
        {ok && showPhase ? (
          <G>
            {/* The start: x₀ with the slope v₀, and the first crest's shift. */}
            <Line
              x1={TX(0)}
              y1={TY(x0)}
              x2={TX(Math.min(tEnd * 0.12, period / 6))}
              y2={TY(x0 + v0 * Math.min(tEnd * 0.12, period / 6))}
              stroke={c.forceNet}
              strokeWidth={2}
              strokeDasharray={chart.dashFine}
            />
            <Circle cx={TX(0)} cy={TY(x0)} r={4.5} fill={c.forceNet} />
            <Line
              x1={TX(tc)}
              y1={TY(fv.envelope!(0))}
              x2={TX(tc)}
              y2={mid}
              stroke={c.chartMuted}
              strokeDasharray={chart.dashFine}
            />
            <Line
              x1={TX(0)}
              y1={TY(fv.envelope!(0)) - 10}
              x2={TX(tc)}
              y2={TY(fv.envelope!(0)) - 10}
              stroke={c.chartInk}
            />
            <SubLabel
              x={TX(tc) + 6}
              y={TY(fv.envelope!(0)) - 4}
              text={ph?.phase ? `shift −φ/ω, ${rep.label(ph.phase)}` : 'shift −φ/ω'}
              anchor="start"
              size={chart.label}
              w={w}
            />
          </G>
        ) : null}
        {ok && tMark !== undefined && known(tMark) ? (
          <G>
            <Line
              x1={TX(si(tMark))}
              y1={mid}
              x2={TX(si(tMark))}
              y2={TY(fv.x(si(tMark)))}
              stroke={c.forceNet}
              strokeDasharray={chart.dashFine}
            />
            <Circle cx={TX(si(tMark))} cy={TY(fv.x(si(tMark)))} r={4.5} fill={c.forceNet} />
            {(d?.x ?? ph?.x) ? (
              <SubLabel
                x={TX(si(tMark))}
                y={
                  // Over the point when x ≥ 0, unless the phase shift's label is there.
                  fv.x(si(tMark)) >= 0 &&
                  !(
                    showPhase &&
                    fv.envelope &&
                    Math.abs(TY(fv.x(si(tMark))) - 10 - (TY(fv.envelope(0)) - 4)) < 18
                  )
                    ? TY(fv.x(si(tMark))) - 10
                    : TY(fv.x(si(tMark))) + 20
                }
                text={rep.label((d?.x ?? ph?.x)!)}
                size={chart.label}
                color={c.forceNet}
                w={w}
              />
            ) : null}
          </G>
        ) : null}
      </G>
    );
  }

  /** The axes of a graph: x = 0 (or the r axis) at `zero`, the value axis on the left. */
  function axes(w: number, y0: number, y1: number, zero: number, name: string) {
    return (
      <G>
        <Line x1={GX0} y1={y0 - 6} x2={GX0} y2={y1} stroke={c.chartInk} />
        <Line x1={GX0} y1={zero} x2={w - 10} y2={zero} stroke={c.chartInk} />
        <ChartText x={6} y={y0 - 10} fontSize={chart.label}>
          {name}
        </ChartText>
      </G>
    );
  }

  /** X ÷ δ_st (forcing) or TR (transmit) against r, with the page's point. */
  function curve(w: number, top: number, which: 'forced' | 'transmit') {
    const gy0 = top + 24;
    const gy1 = top + 168;
    const gx1 = w - 14;
    const r = which === 'forced' ? si(f!.omega) / wn : si(tr!.ratio);
    const zeta = which === 'forced' ? zetaF : si(tr!.zeta);
    const ok =
      which === 'forced'
        ? base && known(f!.omega) && (f!.zeta === undefined || known(f!.zeta)) && known(d?.c)
        : known(tr!.ratio) && known(tr!.zeta);
    const fn = (x: number) =>
      which === 'forced' ? forced(x, zeta).mag : transmissibility(x, zeta);
    const rMax = Math.max(3, Number.isFinite(r) ? Math.ceil(r * 1.25) : 3);
    const at = ok ? fn(r) : NaN;
    const top0 = Math.min(Math.max(3, Number.isFinite(at) ? at * 1.25 : 3), 12);
    const yStep = niceStep(top0 / 4);
    const yMax = Math.ceil(top0 / yStep) * yStep;
    const RX = (x: number) => GX0 + ((gx1 - GX0) * x) / rMax;
    const RY = (y: number) => gy1 - ((gy1 - gy0) * Math.min(y, yMax * 1.02)) / yMax;
    // Past the top the curve leaves the plot and comes back in (never flat along the top).
    const cap = yMax * 1.02;
    const path = (() => {
      const out: string[] = [];
      let prev: [number, number] | undefined;
      for (let i = 0; i <= 600; i++) {
        const x = (rMax * i) / 600;
        const y = fn(x);
        const inside = Number.isFinite(y) && y <= cap;
        const wasIn = !!prev && prev[1] <= cap;
        if (prev && inside !== wasIn && Number.isFinite(prev[1]) && Number.isFinite(y)) {
          const xc = prev[0] + ((cap - prev[1]) / (y - prev[1])) * (x - prev[0]);
          out.push(`${inside ? 'M' : 'L'} ${RX(xc)} ${RY(cap)}`);
        }
        if (inside) out.push(`${out.length ? 'L' : 'M'} ${RX(x)} ${RY(y)}`);
        prev = [x, Number.isFinite(y) ? y : Infinity];
      }
      return out.join(' ');
    })();
    const yTicks = Array.from({ length: Math.round(yMax / yStep) + 1 }, (_, i) => i * yStep);
    const name = which === 'forced' ? 'X ÷ δ_st' : 'TR';
    return (
      <G>
        {axes(w, gy0, gy1, gy1, name)}
        {yTicks.map((y) => (
          <G key={y}>
            <Line x1={GX0} y1={RY(y)} x2={gx1} y2={RY(y)} stroke={c.chartGrid} strokeWidth={0.8} />
            <ChartText
              x={GX0 - 5}
              y={RY(y) + 4}
              textAnchor="end"
              fontSize={chart.label}
              fill={c.chartMuted}
            >
              {sig(y)}
            </ChartText>
          </G>
        ))}
        {Array.from({ length: rMax + 1 }, (_, i) => i).map((x) => (
          <ChartText
            key={x}
            x={RX(x)}
            y={gy1 + 14}
            textAnchor="middle"
            fontSize={chart.label}
            fill={c.chartMuted}
          >
            {String(x)}
          </ChartText>
        ))}
        <ChartText x={gx1} y={gy1 + 28} textAnchor="end" fontSize={chart.label} fill={c.chartMuted}>
          r = ω ÷ ωₙ
        </ChartText>
        {which === 'transmit' ? (
          <G>
            <Line
              x1={RX(Math.SQRT2)}
              y1={gy0}
              x2={RX(Math.SQRT2)}
              y2={gy1}
              stroke={c.chartMuted}
              strokeDasharray={chart.dash}
            />
            <Line
              x1={GX0}
              y1={RY(1)}
              x2={gx1}
              y2={RY(1)}
              stroke={c.chartMuted}
              strokeDasharray={chart.dash}
            />
            <SubLabel
              x={RX(Math.SQRT2) + 4}
              y={gy0 + 12}
              text="r = √2"
              anchor="start"
              size={chart.label}
              w={w}
            />
            <SubLabel
              x={(RX(Math.SQRT2) + gx1) / 2 + 10}
              y={RY(1) - 8}
              text="isolation: TR < 1"
              size={chart.label}
              bold={false}
              color={c.chartMuted}
              w={w}
            />
          </G>
        ) : (
          <Line
            x1={RX(1)}
            y1={gy0}
            x2={RX(1)}
            y2={gy1}
            stroke={c.chartMuted}
            strokeDasharray={chart.dash}
          />
        )}
        {ok ? <Path d={path} stroke={c.chartHighlight} strokeWidth={2.5} fill="none" /> : null}
        {ok && Number.isFinite(at) ? (
          <G>
            <Line
              x1={RX(r)}
              y1={gy1}
              x2={RX(r)}
              y2={RY(at)}
              stroke={c.forceNet}
              strokeDasharray={chart.dashFine}
            />
            <Circle cx={RX(r)} cy={RY(at)} r={5} fill={c.forceNet} />
            <SubLabel
              x={RX(r) + (r > rMax * 0.6 ? -8 : 8)}
              y={RY(at) - 10}
              text={
                which === 'forced'
                  ? `${f!.ratio ? rep.label(f!.ratio) : `r = ${sig(r)}`}: X ÷ δ_st = ${sig(at)}`
                  : `${tr!.value ? rep.label(tr!.value) : `TR = ${sig(at)}`}`
              }
              anchor={r > rMax * 0.6 ? 'end' : 'start'}
              size={chart.label}
              color={c.forceNet}
              w={w}
            />
            {which === 'forced' ? (
              <SubLabel
                x={RX(r) + (r > rMax * 0.6 ? -8 : 8)}
                y={RY(at) + 18}
                text={
                  f!.lag
                    ? `lag ${rep.label(f!.lag)}`
                    : `lag φ = ${sig((forced(r, zeta).lag * 180) / Math.PI)}°`
                }
                anchor={r > rMax * 0.6 ? 'end' : 'start'}
                size={chart.label}
                bold={false}
                w={w}
              />
            ) : null}
          </G>
        ) : null}
        <SubLabel
          x={gx1}
          y={gy0 + 12}
          text={`ζ = ${ok || known(f?.zeta ?? tr?.zeta) ? sig(zeta) : '?'}`}
          anchor="end"
          size={chart.label}
          w={w}
        />
      </G>
    );
  }

  /** Two blocks and three springs (or the chain), and each mode's shape as arrows. */
  function coupledSketch(w: number) {
    const q = cp!;
    const chain = q.layout === 'chain';
    const [m1x, m2x] = [w * 0.36, w * 0.7];
    const left = 18;
    const right = w - 18;
    const y = FLOOR - 20;
    const spring = (x1: number, x2: number, key: string) => (
      <Path
        key={key}
        d={springPath(x1, y, x2, y, 7, 6)}
        stroke={c.physSpring}
        strokeWidth={2.2}
        fill="none"
      />
    );
    const modes = coupledModes();
    const rowY = [FLOOR + 30, FLOOR + 76];
    return (
      <G>
        <Rect x={4} y={FLOOR - 66} width={12} height={66} fill={c.wood} />
        <Line x1={16} y1={FLOOR - 66} x2={16} y2={FLOOR} stroke={c.chartInk} />
        {chain ? null : (
          <G>
            <Rect x={w - 16} y={FLOOR - 66} width={12} height={66} fill={c.wood} />
            <Line x1={w - 16} y1={FLOOR - 66} x2={w - 16} y2={FLOOR} stroke={c.chartInk} />
          </G>
        )}
        <Line x1={4} y1={FLOOR} x2={w - 4} y2={FLOOR} stroke={c.chartInk} />
        {spring(left, m1x - BLOCK / 2, 'k1')}
        {spring(m1x + BLOCK / 2, m2x - BLOCK / 2, 'k2')}
        {chain ? null : spring(m2x + BLOCK / 2, right, 'k3')}
        {[m1x, m2x].map((x, i) => (
          <G key={i}>
            <Crate x={x - BLOCK / 2} y={FLOOR - BLOCK} size={BLOCK} lightId={ids.light} />
            <SubLabel
              x={x}
              y={FLOOR - BLOCK / 2 + 5}
              text={lab(i ? (q.m2 ?? q.m1) : q.m1, i ? 'm₂' : 'm₁', 'kg').replace(/^.* = /, '')}
              size={chart.label}
              w={w}
            />
          </G>
        ))}
        <SubLabel
          x={(left + m1x - BLOCK / 2) / 2}
          y={y - 18}
          text={lab(q.k1, 'k₁', 'N/m')}
          size={chart.label}
          w={w}
        />
        <SubLabel
          x={(m1x + m2x) / 2}
          y={y - 18}
          text={lab(q.k2, 'k₂', 'N/m')}
          size={chart.label}
          w={w}
        />
        {chain ? null : (
          <SubLabel
            x={(m2x + BLOCK / 2 + right) / 2}
            y={y - 18}
            text={lab(q.k3 ?? q.k1, 'k₃', 'N/m')}
            size={chart.label}
            w={w}
          />
        )}
        {modes.ok
          ? [0, 1].map((j) => {
              const ratio = modes.ratios[j]!;
              const scale = 26 / Math.max(1, Math.abs(ratio));
              const wId = j ? q.fast : q.slow;
              const rId = q.ratios?.[j];
              const text = `${j ? 'Fast' : 'Slow'} mode: ${wId ? rep.label(wId) : `ω${j ? '₂' : '₁'} = ${sig(modes.w[j]!)} rad/s`}, ${rId ? rep.label(rId) : `x₂/x₁ = ${sig(ratio)}`}`;
              return (
                <G key={j}>
                  <SubLabel
                    x={6}
                    y={rowY[j]!}
                    text={text}
                    anchor="start"
                    size={chart.label}
                    bold={false}
                    w={w}
                  />
                  {[1, ratio].map((a, i) => {
                    const x = i ? m2x : m1x;
                    const len = a * scale;
                    return Math.abs(len) < 2 ? null : (
                      <Vec
                        key={i}
                        x1={x - len / 2}
                        y1={rowY[j]! + 18}
                        x2={x + len / 2}
                        y2={rowY[j]! + 18}
                        color={c.chartHighlight}
                        width={2.5}
                      />
                    );
                  })}
                </G>
              );
            })
          : null}
      </G>
    );
  }

  function coupledModes() {
    const q = cp!;
    const ok = [q.m1, q.m2, q.k1, q.k2, q.k3].every(known);
    const md = twoModes(
      si(q.m1),
      si(q.m2 ?? q.m1),
      si(q.k1),
      si(q.k2),
      q.layout === 'chain' ? 0 : si(q.k3 ?? q.k1),
    );
    return { ok, ...md };
  }

  /** m₁ started alone: both blocks' traces, the motion handed across and back. */
  function coupledTraces(w: number, top: number) {
    const md = coupledModes();
    if (!md.ok) return null;
    const gx1 = w - 14;
    const lanes = [top + 46, top + 120];
    const half = 30;
    const [w1, w2] = md.w;
    const tex = (2 * Math.PI) / Math.max(1e-9, w2 - w1);
    const tEnd = Math.min(Math.max(1.15 * tex, (4 * 2 * Math.PI) / w1), (40 * 2 * Math.PI) / w2);
    const TX = (t: number) => GX0 + ((gx1 - GX0) * t) / tEnd;
    const peak = Math.max(
      1,
      ...Array.from({ length: 400 }, (_, i) => Math.abs(md.motion((tEnd * i) / 399)[1])),
    );
    const path = (j: 0 | 1, y: number) =>
      Array.from({ length: 601 }, (_, i) => {
        const t = (tEnd * i) / 600;
        return `${i ? 'L' : 'M'} ${TX(t)} ${y - (half * md.motion(t)[j]) / peak}`;
      }).join(' ');
    const showEx = !!cp!.exchange && tex <= tEnd;
    return (
      <G>
        {lanes.map((y, j) => (
          <G key={j}>
            <Line x1={GX0} y1={y} x2={gx1} y2={y} stroke={c.chartInk} />
            <Line x1={GX0} y1={y - half - 4} x2={GX0} y2={y + half + 4} stroke={c.chartInk} />
            <ChartText x={GX0 - 6} y={y + 4} textAnchor="end" fontSize={chart.label}>
              {j ? 'x₂' : 'x₁'}
            </ChartText>
            <Path
              d={path(j as 0 | 1, y)}
              stroke={j ? c.forceNet : c.chartHighlight}
              strokeWidth={2}
              fill="none"
            />
          </G>
        ))}
        {showEx ? (
          <G>
            <Line
              x1={TX(0)}
              y1={lanes[1]! + half + 14}
              x2={TX(tex)}
              y2={lanes[1]! + half + 14}
              stroke={c.chartInk}
            />
            <Line
              x1={TX(tex)}
              y1={lanes[1]! + half + 8}
              x2={TX(tex)}
              y2={lanes[1]! + half + 20}
              stroke={c.chartInk}
            />
            <SubLabel
              x={TX(tex / 2)}
              y={lanes[1]! + half + 30}
              text={
                cp!.exchange
                  ? `${rep.label(cp!.exchange)}: back to m₁`
                  : `T_ex = ${sig(tex)} s: back to m₁`
              }
              size={chart.label}
              w={w}
            />
          </G>
        ) : null}
        {/* Over the first lane, not on its trace. */}
        <ChartText x={gx1} y={top + 10} textAnchor="end" fontSize={chart.label} fill={c.chartMuted}>
          m₁ let go alone, m₂ at rest
        </ChartText>
      </G>
    );
  }

  function caption(): string {
    const lines: string[] = [];
    const worked = (ok: boolean, line: string) => (ok ? [line] : formulaOnly([line]));
    if (d) {
      const zeta = cDamp / (2 * Math.sqrt(k * m));
      const ok = base && known(d.c);
      const fv = freeVibration(m, cDamp, k, 1, 0);
      const L = d.letter ?? 'c';
      lines.push(
        ...worked(base, `ωₙ = √(k ÷ m) = √(${sig(k)} ÷ ${sig(m)}) = ${sig(wn)} rad/s`),
        ...worked(
          ok,
          `ζ = ${L} ÷ (2√(km)) = ${sig(cDamp)} ÷ (2√(${sig(k)} × ${sig(m)})) = ${sig(zeta)}`,
        ),
      );
      if (ok)
        lines.push(
          fv.regime === 'under'
            ? `ζ < 1, underdamped: ω_d = ωₙ√(1 − ζ²) = ${sig(fv.wd)} rad/s, less than ωₙ; the crests shrink inside ±X exp(−ζωₙt).`
            : fv.regime === 'critical'
              ? 'ζ = 1, critically damped: back to rest fastest, with no swing past 0.'
              : 'ζ > 1, overdamped: it creeps back to rest without swinging.',
        );
      if (d.cycles !== undefined && d.decrement && ok && fv.regime === 'under') {
        const delta = (2 * Math.PI * zeta) / Math.sqrt(1 - zeta * zeta);
        lines.push(
          `δ = (1/n) ln(x₀ ÷ xₙ) = 2πζ ÷ √(1 − ζ²) = ${sig(delta)}: each crest is e⁻ᵟ of the one before.`,
        );
      }
    }
    if (ph && !d) {
      const ok = base && known(ph.x0) && known(ph.v0);
      const [x0, v0] = [si(ph.x0), si(ph.v0)];
      const A = Math.hypot(x0, v0 / wn);
      const phi = Math.atan2(-v0 / wn, x0);
      lines.push(
        ...worked(ok, `A = √(x₀² + (v₀/ω)²) = ${sig(A)} m`),
        ...worked(ok, `φ = atan2(−v₀/ω, x₀) = ${sig(phi)} rad`),
        ...worked(ok, `x(0) = A cos φ = ${sig(A * Math.cos(phi))} m = x₀`),
      );
    }
    if (f) {
      const r = si(f.omega) / wn;
      const ok = base && known(f.omega) && known(f.force);
      const fr = forced(r, zetaF);
      const X = (si(f.force) / k) * fr.mag;
      lines.push(
        ...worked(ok, `r = ω ÷ ωₙ = ${sig(si(f.omega))} ÷ ${sig(wn)} = ${sig(r)}`),
        ...worked(
          ok,
          `X = (F₀ ÷ k) ÷ √((1 − r²)² + (2ζr)²) = ${sig(si(f.force) / k)} × ${sig(fr.mag)} = ${sig(X)} m`,
        ),
        ...worked(ok, `tan φ = 2ζr ÷ (1 − r²): φ = ${sig((fr.lag * 180) / Math.PI)}°`),
        'Near r = 1 the response peaks; far above it the block barely moves and lags by nearly 180°.',
      );
    }
    if (tr) {
      const ok = known(tr.ratio) && known(tr.zeta);
      const [r, z] = [si(tr.ratio), si(tr.zeta)];
      lines.push(
        ...worked(
          ok,
          `TR = √(1 + (2ζr)²) ÷ √((1 − r²)² + (2ζr)²) = ${sig(transmissibility(r, z))}`,
        ),
        'Every curve passes TR = 1 at r = √2: only above it does the mount isolate.',
      );
    }
    if (cp) {
      const md = coupledModes();
      if (md.ok)
        lines.push(
          `det(K − ω²M) = 0: ω₁² = ${sig(md.w2[0])}, ω₂² = ${sig(md.w2[1])}, so ω₁ = ${sig(md.w[0])} and ω₂ = ${sig(md.w[1])} rad/s`,
          `Mode shapes x₂/x₁ = ${sig(md.ratios[0])} (slow) and ${sig(md.ratios[1])} (fast)`,
          'Started alone, m₁ hands its motion to m₂ and takes it back: the two modes beat.',
        );
      else lines.push('det(K − ω²M) = 0 gives the two modes’ ω².');
    }
    if (sp) {
      const [k1, k2] = [si(sp.k1), si(sp.k2)];
      const ok = known(sp.k1) && known(sp.k2);
      lines.push(
        ...worked(
          ok,
          sp.layout === 'series'
            ? `k_eq = k₁k₂ ÷ (k₁ + k₂) = ${sig(k1)} × ${sig(k2)} ÷ ${sig(k1 + k2)} = ${sig((k1 * k2) / (k1 + k2))} N/m`
            : `k_eq = k₁ + k₂ = ${sig(k1)} + ${sig(k2)} = ${sig(k1 + k2)} N/m`,
        ),
        sp.layout === 'series'
          ? 'In series both carry the same force and their stretches add: softer than either.'
          : 'In parallel both stretch the same and their forces add: stiffer than either.',
      );
    }
    return lines.join(' · ');
  }
}

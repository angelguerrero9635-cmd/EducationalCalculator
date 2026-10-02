/**
 * `binaryPhase` (HC82): a binary phase diagram, flat. An isomorphous lens, a eutectic diagram or
 * the iron–carbon steel corner, its fields tinted and named; the alloy's line at C₀, the tie line
 * at T with its ends; beneath, the tie line enlarged as a lever with both arms labelled, and two
 * bars of the phase fractions.
 */
import { View } from 'react-native';
import Svg, { Circle, G, Line, Path, Polygon, Rect } from 'react-native-svg';

import type { BinaryPhaseSpec } from '@/data/modules/typesHe3i';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { fmt, HeLabel } from './beamKit';
import {
  EUTECTIC,
  eutecticLines,
  lens,
  lever,
  STEEL,
  steelLines,
  type Pt,
} from './binaryPhaseMath';
import { Canvas, Caption, ChartText } from './common';
import { useHe3iReader } from './he3iKit';

const PL = 48;
const PR = 14;
const PT = 16;

export function BinaryPhase({ spec, calc }: { spec: BinaryPhaseSpec; calc: Calculator }) {
  const c = usePalette();
  const r = useHe3iReader(calc);
  const sys = spec.system;
  const steel = sys === 'steel';
  const [nameA, nameB] = steel ? ['Fe', 'C'] : (spec.names ?? ['A', 'B']);
  const wt = `wt% ${nameB}`;
  const c0 = r.v(spec.c0);
  const ca = r.v(spec.calpha, steel ? STEEL.calpha : 5);
  const ce = r.v(spec.ce, steel ? STEEL.ce : 60);
  const cl = r.v(spec.cl, 50);
  const cb = r.v(spec.cbeta, ce + (100 - ce) * 0.82);
  const T = r.v(spec.temperature, steel ? STEEL.eutectoid : 0);
  const known = r.known;
  // The tie line's ends: the liquid and the solid (isomorphous), α and the eutectic liquid
  // (eutectic), α and austenite at the eutectoid (steel).
  const [left, right, leftKnown, rightKnown] =
    sys === 'isomorphous'
      ? cl < ca
        ? [cl, ca, known(spec.cl), known(spec.calpha)]
        : [ca, cl, known(spec.calpha), known(spec.cl)]
      : [ca, ce, known(spec.calpha), known(spec.ce)];
  const lv = lever(c0, left, right);
  // The phase each end stands for, with the fraction that belongs to it.
  const liquidLeft = sys === 'isomorphous' && cl < ca;
  const leftPhase = sys === 'isomorphous' ? (liquidLeft ? 'L' : 'α') : sys === 'steel' ? 'α' : 'α';
  const rightPhase = sys === 'isomorphous' ? (liquidLeft ? 'α' : 'L') : sys === 'steel' ? 'γ' : 'L';
  const fracLeft = lv.toLeft;
  const fracRight = lv.toRight;
  // Which fraction field names which end.
  const fieldOf = (phase: string) =>
    sys === 'isomorphous'
      ? phase === 'L'
        ? { id: spec.wl, sym: 'W_L' }
        : { id: spec.walpha, sym: 'W_α' }
      : phase === 'α'
        ? { id: spec.walpha, sym: sys === 'steel' ? 'W_α′' : 'W_α′' }
        : { id: spec.we, sym: sys === 'steel' ? 'W_P' : 'W_e' };
  const fLeft = fieldOf(leftPhase);
  const fRight = fieldOf(rightPhase);
  const endsKnown = leftKnown && rightKnown;
  const allKnown = endsKnown && known(spec.c0);

  // A case the values can't make draws faded, the reason in the caption.
  const tStar = (() => {
    if (sys !== 'isomorphous') return 0.5;
    const m = spec.melts;
    if (!m || !known(spec.temperature) || !known(m[0]) || !known(m[1])) return 0.5;
    const [ta, tb] = [r.v(m[0]), r.v(m[1])];
    const lo = Math.min(ta, tb);
    const hi = Math.max(ta, tb);
    return hi > lo ? (T - lo) / (hi - lo) : NaN;
  })();
  const lensLines = sys === 'isomorphous' ? lens(cl, ca, tStar) : undefined;
  const reason = (() => {
    if (sys === 'isomorphous' && !lensLines)
      return 'These ends and this temperature can’t make a lens (each end between 0 and 100 wt%, T between the melting points).';
    if (sys === 'eutectic' && !(ca > 0 && ca < ce && ce < cb && cb < 100))
      return 'A eutectic needs 0 < C_α < C_E < C_β < 100 wt%.';
    if (steel && c0 > ce)
      return 'A hypereutectoid steel: proeutectoid cementite forms, off this corner’s lever.';
    if (steel && !(ca > 0 && ca < ce && ce < STEEL.xMax))
      return 'The eutectoid must lie between α’s end and the window’s edge.';
    if (known(spec.c0) && endsKnown && (c0 < left || c0 > right))
      return 'C₀ lies outside the tie line: the alloy is in a one-phase field, and the lever rule does not apply.';
    return undefined;
  })();

  const xMax = steel ? STEEL.xMax : 100;
  const unitT = r.unit(spec.temperature, '°C');
  const tieLabel =
    spec.temperature !== undefined && known(spec.temperature)
      ? r.tag(spec.temperature, 'T', T, unitT)
      : steel && spec.temperature === undefined
        ? `${STEEL.eutectoid} °C`
        : '';

  const caption = (() => {
    const out: string[] = [];
    if (reason) out.push(reason);
    const sL = r.symbol(
      sys === 'isomorphous' ? (liquidLeft ? spec.cl : spec.calpha) : spec.calpha,
      'C_α',
    );
    const sR = r.symbol(
      sys === 'isomorphous' ? (liquidLeft ? spec.calpha : spec.cl) : spec.ce,
      sys === 'steel' ? 'C_E' : 'C_E',
    );
    const s0 = r.symbol(spec.c0, 'C_0');
    if (!reason && allKnown) {
      const symR = r.symbol(fRight.id, fRight.sym);
      const symL = r.symbol(fLeft.id, fLeft.sym);
      out.push(
        `Lever rule: ${symR} = (${s0} − ${sL}) ÷ (${sR} − ${sL}) = ${fmt(lv.armLeft)} ÷ ${fmt(right - left)} = ${fmt(fracRight)}.`,
      );
      out.push(`${symL} = 1 − ${symR} = ${fmt(fracLeft)}.`);
      out.push('Each phase’s share is the arm on the far side of C₀.');
    } else if (!reason)
      out.push(`Lever rule: each phase’s share is the arm on the far side of ${s0}.`);
    if (steel) out.push('Below 727 °C the austenite becomes pearlite (α + Fe₃C).');
    return out.join(' ');
  })();

  return (
    <View>
      <Canvas aspect={1.05}>
        {({ w, h }) => {
          const plotW = w - PL - PR;
          const plotH = w * 0.54;
          const bottom = PT + plotH;
          const X = (x: number) => PL + (x / xMax) * plotW;
          // Heights: a share t of the plot (isomorphous, eutectic) or °C (steel).
          // The lens is padded so the melting points sit inside the plot.
          const [tLo, tHi] = sys === 'isomorphous' ? [-0.12, 1.1] : [0, 1];
          const Y = (t: number) =>
            steel
              ? bottom - ((t - STEEL.tMin) / (STEEL.tMax - STEEL.tMin)) * plotH
              : bottom - ((t - tLo) / (tHi - tLo)) * plotH;
          const path = (pts: Pt[]) =>
            pts.map((p, i) => `${i ? 'L' : 'M'} ${X(p[0])} ${Y(p[1])}`).join(' ');
          const poly = (pts: Pt[]) => pts.map((p) => `${X(p[0])},${Y(p[1])}`).join(' ');
          const top = steel ? STEEL.tMax : 1;
          const floor = steel ? STEEL.tMin : 0;
          const ink = c.chartInk;
          const tieT = steel
            ? STEEL.eutectoid + 6
            : sys === 'eutectic'
              ? EUTECTIC.eutectic + 0.02
              : Number.isFinite(tStar)
                ? tStar
                : 0.5;
          const region = (text: string, x: number, t: number, small = false) => {
            // Kept clear of the alloy's dashed line.
            const half = (text.length * (small ? chart.label : chart.value) * 0.58) / 2 + 6;
            let px = X(x);
            if (known(spec.c0) && Math.abs(px - X(c0)) < half)
              px = px < X(c0) ? X(c0) - half : X(c0) + half;
            px = Math.min(PL + plotW - half + 4, Math.max(PL + half - 4, px));
            return (
              <ChartText
                key={text + x}
                x={px}
                y={Y(t) + 4}
                textAnchor="middle"
                fontSize={small ? chart.label : chart.value}
                fontWeight="700"
                fill={c.chartMuted}
              >
                {text}
              </ChartText>
            );
          };
          const fields = () => {
            if (sys === 'isomorphous' && lensLines) {
              const { liquidus, solidus } = lensLines;
              const a = liquidus[0]![0];
              const b = liquidus[liquidus.length - 1]![0];
              // Liquid above the liquidus, solid below the solidus, the lens between.
              // The lens's widest point away from the tie line, named by a leader from the α side.
              const wid = liquidus.map((p, i) =>
                Math.abs(p[1] - tieT) > 0.2 && p[1] > 0.1 && p[1] < 0.9
                  ? Math.abs(solidus[i]![0] - p[0])
                  : 0,
              );
              const k = wid.indexOf(Math.max(...wid));
              const mid: Pt = [(liquidus[k]![0] + solidus[k]![0]) / 2, liquidus[k]![1]];
              return (
                <G>
                  <Polygon points={poly([...liquidus, [b, tHi], [a, tHi]])} fill={c.phaseLiquid} />
                  <Polygon points={poly([...solidus, [b, tLo], [a, tLo]])} fill={c.he3iAlpha} />
                  <Polygon
                    points={poly([...liquidus, ...[...solidus].reverse()])}
                    fill={c.he3iTwo}
                  />
                  <Path d={path(liquidus)} stroke={ink} strokeWidth={1.6} fill="none" />
                  <Path d={path(solidus)} stroke={ink} strokeWidth={1.6} fill="none" />
                  {region('L', a < b ? 10 : 90, 0.95)}
                  {region('α', a < b ? 85 : 15, 0.12)}
                  <Line
                    x1={X(mid[0])}
                    y1={Y(mid[1])}
                    x2={X(mid[0] + (a < b ? -9 : 9))}
                    y2={Y(mid[1] + 0.09)}
                    stroke={c.chartMuted}
                    strokeWidth={1}
                  />
                  {region('L + α', mid[0] + (a < b ? -14 : 14), mid[1] + 0.13, true)}
                </G>
              );
            }
            if (sys === 'eutectic') {
              const e = eutecticLines(ca, ce, cb);
              const tE = EUTECTIC.eutectic;
              const flo = EUTECTIC.floor;
              return (
                <G>
                  <Polygon
                    points={poly([...e.liquidusA, ...[...e.liquidusB].reverse(), [100, 1], [0, 1]])}
                    fill={c.phaseLiquid}
                  />
                  <Polygon
                    points={poly([...e.solidusA, ...[...e.solvusA].slice(1), [0, flo], [0, 0]])}
                    fill={c.he3iAlpha}
                  />
                  <Polygon
                    points={poly([...e.solidusB, ...[...e.solvusB].slice(1), [100, flo], [100, 0]])}
                    fill={c.he3iBeta}
                  />
                  <Polygon
                    points={poly([...e.liquidusA, ...[...e.solidusA].reverse()])}
                    fill={c.he3iTwo}
                  />
                  <Polygon
                    points={poly([...e.liquidusB, ...[...e.solidusB].reverse()])}
                    fill={c.he3iTwo}
                  />
                  <Polygon
                    points={poly([
                      [ca, tE],
                      [cb, tE],
                      ...e.solvusB.slice(1),
                      [100 - (100 - cb) * 0.25, 0],
                      [ca * 0.3, 0],
                      ...[...e.solvusA].reverse(),
                    ])}
                    fill={c.he3iTwo}
                  />
                  {[e.liquidusA, e.liquidusB, e.solidusA, e.solidusB, e.solvusA, e.solvusB].map(
                    (pts, i) => (
                      <Path key={i} d={path(pts)} stroke={ink} strokeWidth={1.6} fill="none" />
                    ),
                  )}
                  <Line
                    x1={X(ca)}
                    y1={Y(tE)}
                    x2={X(cb)}
                    y2={Y(tE)}
                    stroke={ink}
                    strokeWidth={1.6}
                  />
                  {region('L', ce, 0.8)}
                  {region('α', Math.max(4, ca * 0.45), tE * 0.7, true)}
                  {region('β', Math.min(96, 100 - (100 - cb) * 0.45), tE * 0.7, true)}
                  {region('L + α', (ca + ce) / 2 - 2, tE + 0.1, true)}
                  {region('L + β', (ce + cb) / 2 + 2, tE + 0.12, true)}
                  {region('α + β', (ca + cb) / 2, tE * 0.45)}
                </G>
              );
            }
            if (steel) {
              const s = steelLines(ce, ca, STEEL.eutectoid);
              const te = STEEL.eutectoid;
              return (
                <G>
                  <Polygon
                    points={poly([...s.a3, s.acm[1]!, [xMax, top], [0, top]])}
                    fill={c.he3iBeta}
                  />
                  <Polygon points={poly([...s.a3, ...s.alphaTop])} fill={c.he3iTwo} />
                  <Polygon points={poly([[ce, te], s.acm[1]!, [xMax, te]])} fill={c.he3iTwo} />
                  <Polygon
                    points={poly([...s.alphaTop, [0, floor], ...[...s.alphaSolvus].reverse()])}
                    fill={c.he3iAlpha}
                  />
                  <Polygon
                    points={poly([
                      [ca, te],
                      [xMax, te],
                      [xMax, floor],
                      ...[...s.alphaSolvus].reverse(),
                    ])}
                    fill={c.he3iTwo}
                  />
                  {[s.a3, s.acm, s.alphaTop, s.alphaSolvus].map((pts, i) => (
                    <Path key={i} d={path(pts)} stroke={ink} strokeWidth={1.6} fill="none" />
                  ))}
                  <Line
                    x1={X(ca)}
                    y1={Y(te)}
                    x2={X(xMax)}
                    y2={Y(te)}
                    stroke={ink}
                    strokeWidth={1.6}
                  />
                  {region('γ (austenite)', 0.98, 935)}
                  {region('α + γ', 0.3, 760, true)}
                  {region('γ + Fe₃C', 1.33, 800, true)}
                  {region('α + Fe₃C', 0.98, 650)}
                </G>
              );
            }
            return null;
          };
          // The enlarged tie line and the fraction bars, under the plot.
          const yLev = bottom + 76;
          const LX = 44;
          const RX = w - 44;
          const Z = (x: number) => LX + ((x - left) / Math.max(1e-12, right - left)) * (RX - LX);
          const x0 = Z(c0);
          const yBars = yLev + 50;
          const symOf = (x: string | number | undefined, f: string) => r.symbol(x, f);
          const leftSym = symOf(
            sys === 'isomorphous' ? (liquidLeft ? spec.cl : spec.calpha) : spec.calpha,
            sys === 'isomorphous' && liquidLeft ? 'C_L' : 'C_α',
          );
          const rightSym = symOf(
            sys === 'isomorphous' ? (liquidLeft ? spec.calpha : spec.cl) : spec.ce,
            sys === 'isomorphous' ? (liquidLeft ? 'C_α' : 'C_L') : sys === 'steel' ? 'C_E' : 'C_E',
          );
          const s0 = symOf(spec.c0, 'C_0');
          const phaseFill = (p: string) =>
            p === 'L' ? c.phaseLiquid : p === 'γ' ? c.he3iBeta : c.he3iAlpha;
          const leftId = sys === 'isomorphous' ? (liquidLeft ? spec.cl : spec.calpha) : spec.calpha;
          const rightId = sys === 'isomorphous' ? (liquidLeft ? spec.calpha : spec.cl) : spec.ce;
          return (
            <Svg width={w} height={h}>
              <G opacity={reason ? 0.4 : 1}>
                <Rect x={PL} y={PT} width={plotW} height={plotH} fill={c.chartSurface} />
                {fields()}
                <Rect
                  x={PL}
                  y={PT}
                  width={plotW}
                  height={plotH}
                  fill="none"
                  stroke={c.chartMuted}
                />
              </G>
              {/* Axes: composition across, temperature up. */}
              {(steel ? [0, 0.4, 0.8, 1.2, 1.6] : [0, 20, 40, 60, 80, 100]).map((x) => (
                <G key={x}>
                  <Line x1={X(x)} y1={bottom} x2={X(x)} y2={bottom + 4} stroke={c.chartMuted} />
                  <ChartText
                    x={X(x)}
                    y={bottom + 16}
                    textAnchor="middle"
                    fill={c.chartMuted}
                    fontSize={chart.label}
                  >
                    {steel ? fmt(x) : x === 0 ? nameA : x === 100 ? nameB : fmt(x)}
                  </ChartText>
                </G>
              ))}
              <ChartText
                x={PL + plotW / 2}
                y={bottom + 31}
                textAnchor="middle"
                fontSize={chart.label}
                fill={c.chartMuted}
              >
                {`Composition (${wt})`}
              </ChartText>
              {steel
                ? [600, 700, 800, 900].map((t) => (
                    <ChartText
                      key={t}
                      x={PL - 5}
                      y={Y(t) + 4}
                      textAnchor="end"
                      fontSize={chart.label}
                      fill={c.chartMuted}
                    >
                      {String(t)}
                    </ChartText>
                  ))
                : null}
              <ChartText
                x={PL - 5}
                y={PT + 8}
                textAnchor="end"
                fontSize={chart.label}
                fill={c.chartMuted}
              >
                {steel ? '°C' : 'T'}
              </ChartText>
              {/* The melting points, where the page gives them. */}
              {sys === 'isomorphous' && spec.melts && lensLines
                ? spec.melts.map((m, i) =>
                    known(m) ? (
                      <HeLabel
                        key={i}
                        x={i === 0 ? X(0) + 6 : X(100) - 6}
                        y={((tm) => Y(tm) + (tm === 0 ? 16 : -6))(
                          lensLines.flip === (i === 0) ? 1 : 0,
                        )}
                        anchor={i === 0 ? 'start' : 'end'}
                        text={r.text(m, r.v(m), unitT)}
                        w={w}
                        size={chart.label}
                      />
                    ) : null,
                  )
                : null}
              {/* The alloy's line. */}
              {known(spec.c0) ? (
                <G>
                  <Line
                    x1={X(c0)}
                    y1={PT}
                    x2={X(c0)}
                    y2={bottom}
                    stroke={c.he3iAlloy}
                    strokeWidth={1.8}
                    strokeDasharray="6 4"
                  />
                  <HeLabel
                    x={X(c0)}
                    y={PT + 13}
                    text={r.tag(spec.c0, 'C_0', c0, wt)}
                    color={c.he3iAlloy}
                    w={w}
                  />
                </G>
              ) : null}
              {/* The tie line at T and its ends. */}
              {endsKnown && !reason ? (
                <G>
                  <Line
                    x1={X(left)}
                    y1={Y(tieT)}
                    x2={X(right)}
                    y2={Y(tieT)}
                    stroke={c.he3iTie}
                    strokeWidth={3}
                  />
                  <Circle cx={X(left)} cy={Y(tieT)} r={4} fill={c.he3iTie} />
                  <Circle cx={X(right)} cy={Y(tieT)} r={4} fill={c.he3iTie} />
                  {known(spec.c0) ? (
                    <Circle
                      cx={X(c0)}
                      cy={Y(tieT)}
                      r={4.5}
                      fill={c.card}
                      stroke={c.he3iAlloy}
                      strokeWidth={2}
                    />
                  ) : null}
                  {tieLabel ? (
                    <HeLabel
                      x={X(right) + 8}
                      y={Y(tieT) + 4}
                      anchor="start"
                      w={w}
                      text={tieLabel}
                      color={c.he3iTie}
                      size={chart.label}
                    />
                  ) : null}
                  {/* The fan down to the enlarged tie line. */}
                  <Line
                    x1={X(left)}
                    y1={Y(tieT) + 4}
                    x2={LX}
                    y2={yLev}
                    stroke={c.he3iTie}
                    strokeWidth={1}
                    strokeDasharray="3 3"
                    opacity={0.6}
                  />
                  <Line
                    x1={X(right)}
                    y1={Y(tieT) + 4}
                    x2={RX}
                    y2={yLev}
                    stroke={c.he3iTie}
                    strokeWidth={1}
                    strokeDasharray="3 3"
                    opacity={0.6}
                  />
                  {/* The tie line enlarged: a lever on C₀. */}
                  <Rect x={LX} y={yLev - 3} width={RX - LX} height={6} rx={3} fill={c.he3iTie} />
                  <HeLabel
                    x={LX}
                    y={yLev + 30}
                    text={`${leftPhase}: ${r.tag(leftId, leftSym, left, wt)}`}
                    w={w}
                    size={chart.label}
                    anchor="start"
                  />
                  <HeLabel
                    x={RX}
                    y={yLev + 30}
                    text={`${rightPhase}: ${r.tag(rightId, rightSym, right, wt)}`}
                    w={w}
                    size={chart.label}
                    anchor="end"
                  />
                  {known(spec.c0) ? (
                    <G>
                      <Polygon
                        points={`${x0},${yLev + 3} ${x0 - 7},${yLev + 13} ${x0 + 7},${yLev + 13}`}
                        fill={c.he3iAlloy}
                      />
                      {/* The arms, each labelled above its half. */}
                      <HeLabel
                        x={(LX + x0) / 2}
                        y={yLev - 9}
                        text={`${s0} − ${leftSym} = ${fmt(lv.armLeft)}`}
                        w={w}
                        size={chart.label}
                        chip={false}
                      />
                      <HeLabel
                        x={(x0 + RX) / 2}
                        y={
                          yLev -
                          9 -
                          (Math.abs(RX - LX) > 0 && Math.min(x0 - LX, RX - x0) < 120 ? 15 : 0)
                        }
                        text={`${rightSym} − ${s0} = ${fmt(lv.armRight)}`}
                        w={w}
                        size={chart.label}
                        chip={false}
                      />
                    </G>
                  ) : null}
                </G>
              ) : null}
              {/* The fractions, as bars out of 1. */}
              {allKnown && !reason
                ? [
                    [rightPhase, fRight, fracRight],
                    [leftPhase, fLeft, fracLeft],
                  ]
                    .sort((a) => (a[0] === 'α' ? 1 : -1))
                    .map(([p, f, frac], i) => {
                      const ff = f as { id: string | number | undefined; sym: string };
                      const y = yBars + i * 24;
                      const bx = 112;
                      const bw = w - bx - 12;
                      return (
                        <G key={i}>
                          <HeLabel
                            x={8}
                            y={y + 10}
                            anchor="start"
                            chip={false}
                            size={chart.label}
                            text={r.tag(ff.id, ff.sym, frac as number, '')}
                          />
                          <Rect
                            x={bx}
                            y={y}
                            width={bw}
                            height={12}
                            rx={2}
                            fill="none"
                            stroke={c.chartGrid}
                          />
                          <Rect
                            x={bx}
                            y={y}
                            width={Math.max(0, Math.min(1, frac as number)) * bw}
                            height={12}
                            rx={2}
                            fill={phaseFill(p as string)}
                            stroke={c.chartMuted}
                          />
                        </G>
                      );
                    })
                : null}
            </Svg>
          );
        }}
      </Canvas>
      <Caption>{caption}</Caption>
    </View>
  );
}

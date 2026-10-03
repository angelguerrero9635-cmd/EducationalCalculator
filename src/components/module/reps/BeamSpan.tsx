import { useRef } from 'react';
import { View } from 'react-native';
import Svg, { Circle, Defs, G, Line, Path, Polygon, Rect } from 'react-native-svg';

import type { BeamLoad, BeamSpec } from '@/data/modules/typesHe1a';
import { geometryOf, he1aSpecVars } from '@/data/modules/typesHe1a';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import {
  Arrow,
  BeamBody,
  BeamDefs,
  Dimension,
  HeLabel,
  SUPPORT_DEPTH,
  SupportGlyph,
  fmt,
  useBeamReader,
} from './beamKit';
import {
  diagramSamples,
  extremes,
  influenceLine,
  loadTotals,
  maxDeflection,
  momentDistribution,
  solveBeam,
  type BeamLoadModel,
  type BeamModel,
} from './beamMath';
import { Canvas, Caption, ChartText, DragHandle } from './common';
import { CurvedArrow } from './hs3aKit';
import { usePaintIds } from './paint';

const LETTERS = 'ABCDEFGH';
/** The label row over the loads, and the tallest load arrow. */
const TOP = 20;
const LOAD_MAX = 46;
const PANEL = 112;
/** The shear and moment panels: lower, so a beam with both fits one screen with its input. */
const DPANEL = 86;
const ROW = 20;

/**
 * A beam on its supports (HC1): to scale, with point, uniform and triangular loads (arrows as
 * tall as the load), the reactions and a wall's moment; with `diagrams` the shear and moment
 * diagrams on the beam's x axis; `deflection` the bent shape dashed; `influence` an influence
 * line; `continuous` the moment-distribution table; `stirrups` a concrete beam's stirrups.
 */
export function BeamSpan({ spec, calc }: { spec: BeamSpec; calc: Calculator }) {
  const c = usePalette();
  const B = useBeamReader(calc);
  const { rep, v, known, all } = B;
  const ids = usePaintIds('steel', 'light');
  const drag = useRef({ x: 0 });

  // The geometry as drawn (a "?" box keeps its example) and as typed (undefined while "?").
  const geo = geometryOf(spec, (x) => v(x));
  const geoTyped = geometryOf(spec, (x) => (known(x) ? v(x) : undefined));
  const L = Math.max(1e-9, geo.length ?? 1);
  const lengthKnown = geoTyped.length !== undefined;
  const lengthVar = spec.spans?.find((x) => typeof x === 'string') ?? spec.length;
  const lenUnit =
    spec.units?.length ??
    (typeof lengthVar === 'string' ? (rep.variable(lengthVar).unit ?? 'm') : 'm');
  const fu = spec.units?.force ?? 'kN';
  const mu = `${fu}·${lenUnit}`;
  const clampX = (x: number) => Math.min(L, Math.max(0, x));
  const supports = geo.supports.map((s, i) => ({
    ...s,
    x: clampX(s.x ?? 0),
    placed: geoTyped.supports[i]?.x !== undefined,
    name: s.name ?? LETTERS[i] ?? '?',
  }));
  const material = spec.stirrups ? 'concrete' : (spec.material ?? 'steel');

  const loadModel = (l: BeamLoad): BeamLoadModel => {
    const size = v(l.size);
    if (l.kind === 'point') return { kind: 'point', x: clampX(v(l.at)), P: size };
    const a = clampX(v(l.from, 0));
    const b = clampX(v(l.to, L));
    if (l.kind === 'uniform') return { kind: 'spread', a, b, wa: size, wb: size };
    const high = l.peak === 'from';
    return { kind: 'spread', a, b, wa: high ? size : 0, wb: high ? 0 : size };
  };
  const loadKnown = (l: BeamLoad) => all(l.size, l.at, l.from, l.to);
  const loads = spec.loads ?? [];
  const inf = spec.influence;
  // Influence pages stand P and w on the beam for the picture; they aren't the beam's loads.
  const complete = lengthKnown && supports.every((s) => s.placed) && loads.every(loadKnown);
  const model: BeamModel = {
    L,
    supports: supports.map((s) => ({ x: s.x, kind: s.kind })),
    loads: loads.map(loadModel),
  };
  const sol = complete ? solveBeam(model) : undefined;
  const solved = !!sol?.ok;

  const table =
    spec.continuous && solved
      ? momentDistribution(
          model,
          supports.map((s) => s.name),
          spec.continuous.far,
        )
      : undefined;
  const infC = inf ? clampX(v(inf.at)) : 0;
  const infLine =
    inf && lengthKnown && supports.every((s) => s.placed) && known(inf.at)
      ? influenceLine({ ...model, loads: [] }, inf.of, infC)
      : undefined;

  const st = spec.stirrups;
  const depth = st ? Math.max(1e-9, v(st.depth)) : 0;
  const spacing = st ? Math.max(1e-9, v(st.spacing)) : 0;

  // ── Layout (px) ──
  const leftWall = supports.some((s) => s.kind === 'fixed' && s.x <= L * 1e-6);
  const rightWall = supports.some((s) => s.kind === 'fixed' && s.x >= L * (1 - 1e-6));
  const padL = leftWall ? 40 : 28;
  const padR = rightWall ? 40 : 28;
  const pointLoads = loads.filter((l) => l.kind === 'point');
  const dimRows: { from: number; to: number; text: string }[][] = [];
  /** The dimension rows of the section x and of the influence section c (their handles sit there). */
  let atRow = -1;
  let infRow = -1;
  {
    const row: { from: number; to: number; text: string }[] = [];
    for (const l of pointLoads) {
      if (typeof l.at !== 'string' || !known(l.at)) continue;
      const x = clampX(v(l.at));
      row.push({ from: 0, to: x, text: B.named(l.at, 'a', x, lenUnit) });
      if (l.rest !== undefined && known(l.rest))
        row.push({ from: x, to: L, text: B.named(l.rest, 'b', L - x, lenUnit) });
    }
    for (const l of loads) {
      if (l.kind === 'point') continue;
      for (const [end, key] of [
        [l.from, 'from'],
        [l.to, 'to'],
      ] as const) {
        if (typeof end !== 'string' || !known(end)) continue;
        const x = clampX(v(end));
        row.push(
          key === 'from'
            ? { from: 0, to: x, text: B.named(end, 'a', x, lenUnit) }
            : { from: 0, to: x, text: B.named(end, 'b', x, lenUnit) },
        );
      }
    }
    // A load at the far end measures the whole span: L's own row says it.
    const whole = (e: { from: number; to: number }) => e.from <= 1e-9 * L && e.to >= L * (1 - 1e-9);
    const lRow = lengthKnown && spec.length !== undefined && !spec.spans?.length;
    const kept = lRow ? row.filter((e) => !whole(e)) : row;
    if (kept.length) dimRows.push(kept);
    const res = spec.resultant;
    if (res && known(res.at))
      dimRows.push([
        { from: 0, to: clampX(v(res.at)), text: B.named(res.at, 'x̄', v(res.at), lenUnit) },
      ]);
    if (spec.at !== undefined && known(spec.at))
      atRow =
        dimRows.push([
          { from: 0, to: clampX(v(spec.at)), text: B.named(spec.at, 'x', v(spec.at), lenUnit) },
        ]) - 1;
    if (inf && known(inf.at) && inf.of !== 'reaction')
      infRow = dimRows.push([{ from: 0, to: infC, text: B.named(inf.at, 'c', infC, lenUnit) }]) - 1;
    if (spec.spans?.length) {
      // Each span, labelled by its own value.
      const spanRow = spec.spans.flatMap((sp, i) =>
        known(sp) && supports[i] && supports[i + 1]
          ? [
              {
                from: supports[i]!.x,
                to: supports[i + 1]!.x,
                text: B.named(sp, `L_${i + 1}`, supports[i + 1]!.x - supports[i]!.x, lenUnit),
              },
            ]
          : [],
      );
      if (spanRow.length) dimRows.push(spanRow);
    } else {
      // A support the page places (not at an end): its distance from the left end.
      for (const s of supports)
        if (typeof s.at === 'string' && s.placed && s.at !== spec.length && s.x > 0)
          dimRows.push([{ from: 0, to: s.x, text: B.named(s.at, 'x', s.x, lenUnit) }]);
      if (lengthKnown && spec.length !== undefined)
        dimRows.push([{ from: 0, to: L, text: B.named(spec.length, 'L', L, lenUnit) }]);
    }
  }

  const showReactions =
    solved &&
    !inf &&
    loads.length > 0 &&
    !st &&
    (supports.some((s) => s.reaction !== undefined) ? true : supports.length <= 3);
  const layout = (w: number) => {
    const sx = (w - padL - padR) / L;
    const thick = st
      ? Math.min(70, Math.max(16, (depth / 0.9) * sx))
      : material === 'steel'
        ? 14
        : 16;
    const y0 = TOP + LOAD_MAX + 8;
    const yB = y0 + thick;
    const yR = yB + SUPPORT_DEPTH + (showReactions || supports.some((s) => s.reaction) ? 50 : 6);
    const yDims = yR + 12;
    let y = yDims + dimRows.length * 24 + 4;
    const panels: Record<string, number> = {};
    if (spec.diagrams && !inf) {
      panels.V = y;
      panels.M = y + DPANEL;
      // (and room under the moment panel for a peak's label below its plot)
      y += 2 * DPANEL + 8;
    }
    if (inf) {
      panels.I = y;
      y += PANEL + 8;
    }
    if (st?.shear !== undefined) {
      panels.S = y;
      y += PANEL - 10;
    }
    if (table) {
      panels.T = y + 4;
      y += 4 + ROW * (4 + table.rows.length) + 10;
    }
    return { sx, X: (x: number) => padL + x * sx, thick, y0, yB, yR, yDims, panels, H: y };
  };

  const spreadMax = Math.max(
    1e-12,
    ...loads.filter((l) => l.kind !== 'point' && loadKnown(l)).map((l) => Math.abs(v(l.size))),
  );
  const pointMax = Math.max(1e-12, ...pointLoads.filter(loadKnown).map((l) => Math.abs(v(l.size))));
  /** A spread load's arrow height at x: as tall as w there (0 where a triangle starts). */
  const heightAt = (m: BeamLoadModel, x: number) => {
    if (m.kind !== 'spread' || m.b <= m.a) return 0;
    const wv = Math.abs(m.wa + ((m.wb - m.wa) * (x - m.a)) / (m.b - m.a));
    const uniform = m.wa === m.wb;
    return uniform ? 8 + (30 * wv) / spreadMax : (38 * wv) / spreadMax;
  };

  const ex = solved ? extremes(model, sol!) : undefined;
  const defl = solved && spec.deflection ? maxDeflection(model, sol!) : undefined;
  const reactionVar = (i: number) => supports[i]!.reaction;
  const dragIds = he1aSpecVars(spec);
  const pinOthers = (id: string) => rep.pinTyped(dragIds.filter((x) => x !== id));
  const dragX = (id: string, X0: number, sx: number, w: number) => ({
    onStart: () => {
      drag.current = { x: X0 };
    },
    onMove: (dx: number) => {
      const px = Math.min(w - padR, Math.max(padL, drag.current.x + dx));
      calc.set({ ...pinOthers(id), [id]: rep.snapTo(id, (px - padL) / sx) }, rep.slide(id));
    },
  });

  return (
    <View>
      <Canvas aspect={(w) => layout(w).H / w}>
        {({ w }) => {
          const Lay = layout(w);
          const { X, y0, yB, yR, thick } = Lay;
          const yC = y0 + thick / 2;
          return (
            <>
              <Svg width={w} height={Lay.H}>
                <Defs>
                  <BeamDefs ids={ids} />
                </Defs>
                <G opacity={complete && !solved ? 0.45 : 1}>
                  {renderLoads(X, y0, w)}
                  {inf ? renderInfluenceLoads(X, y0, w) : null}
                  {renderResultant(X, y0, w)}
                  <BeamBody x1={X(0)} x2={X(L)} y={y0} h={thick} material={material} ids={ids} />
                  {st ? renderStirrups(X, y0, thick, Lay.sx, w) : null}
                  {supports.map((s, i) =>
                    s.placed ? (
                      <SupportGlyph
                        key={i}
                        x={X(s.x)}
                        y={yB}
                        kind={s.kind}
                        side={s.x <= L / 2 ? -1 : 1}
                        wallTop={y0 - 22}
                        wallH={thick + 44}
                      />
                    ) : null,
                  )}
                  {supports.map((s, i) =>
                    s.placed ? (
                      <HeLabel
                        key={`n${i}`}
                        x={X(s.x) + (s.x <= L / 2 ? -1 : 1) * (s.kind === 'fixed' ? 18 : 14)}
                        y={s.kind === 'fixed' ? y0 - 26 : yB + 16}
                        text={s.name}
                        anchor={s.kind === 'fixed' ? 'middle' : s.x <= L / 2 ? 'end' : 'start'}
                        chip={false}
                        w={w}
                      />
                    ) : null,
                  )}
                  {showReactions || supports.some((s) => s.reaction)
                    ? renderReactions(X, yB, yR, yC, w)
                    : null}
                  {defl ? renderDeflection(X, yC, w) : null}
                  {spec.at !== undefined && known(spec.at) ? (
                    <Line
                      x1={X(clampX(v(spec.at)))}
                      y1={TOP - 4}
                      x2={X(clampX(v(spec.at)))}
                      y2={Lay.panels.M !== undefined ? Lay.panels.M + DPANEL - 8 : yB + 8}
                      stroke={c.chartMuted}
                      strokeDasharray={chart.dash}
                    />
                  ) : null}
                  {dimRows.map((row, r) =>
                    row.map((d, k) => (
                      <Dimension
                        key={`${r}-${k}`}
                        x1={X(d.from)}
                        x2={X(d.to)}
                        y={Lay.yDims + 14 + r * 24}
                        text={d.text}
                        w={w}
                      />
                    )),
                  )}
                  {Lay.panels.V !== undefined && solved ? renderDiagrams(X, Lay.panels, w) : null}
                  {Lay.panels.I !== undefined && infLine
                    ? renderInfluence(X, Lay.panels.I, w)
                    : null}
                  {Lay.panels.S !== undefined ? renderStirrupShear(X, Lay.panels.S, w) : null}
                  {Lay.panels.T !== undefined && table ? renderTable(Lay.panels.T, w) : null}
                </G>
              </Svg>
              {!spec.fixed
                ? pointLoads.map((l, i) =>
                    typeof l.at === 'string' && known(l.at) && l.at !== spec.length ? (
                      <DragHandle
                        key={i}
                        testID={`drag-load-${i}`}
                        x={X(clampX(v(l.at)))}
                        y={y0 + thick / 2}
                        label={rep.variable(l.at).name}
                        {...dragX(l.at, X(clampX(v(l.at))), Lay.sx, w)}
                      />
                    ) : null,
                  )
                : null}
              {!spec.fixed && typeof spec.at === 'string' && known(spec.at) ? (
                <DragHandle
                  testID="drag-section"
                  x={X(clampX(v(spec.at)))}
                  y={Lay.yDims + 14 + atRow * 24}
                  label={rep.variable(spec.at).name}
                  {...dragX(spec.at, X(clampX(v(spec.at))), Lay.sx, w)}
                />
              ) : null}
              {!spec.fixed && inf && typeof inf.at === 'string' && known(inf.at) ? (
                <DragHandle
                  testID="drag-section"
                  x={X(infC)}
                  y={Lay.yDims + 14 + infRow * 24}
                  label={rep.variable(inf.at).name}
                  {...dragX(inf.at, X(infC), Lay.sx, w)}
                />
              ) : null}
            </>
          );
        }}
      </Canvas>
      <Caption>{captionLines().join(' · ')}</Caption>
    </View>
  );

  // ── Loads ──

  function loadLabel(l: BeamLoad, value: number) {
    const unit = l.kind === 'point' ? fu : `${fu}/${lenUnit}`;
    return B.named(l.size, l.symbol ?? (l.kind === 'point' ? 'P' : 'w'), value, unit);
  }

  function renderLoads(X: (x: number) => number, y0: number, w: number) {
    const spreadTop = (x: number) => {
      let top = 0;
      for (const l of loads) {
        if (l.kind === 'point' || !loadKnown(l)) continue;
        const m = loadModel(l);
        if (m.kind === 'spread' && x >= m.a && x <= m.b) top = Math.max(top, heightAt(m, x));
      }
      return top;
    };
    return (
      <G>
        {loads.map((l, i) => {
          if (!loadKnown(l)) return null;
          const m = loadModel(l);
          if (m.kind === 'spread') {
            const [a, b] = [X(m.a), X(m.b)];
            if (b - a < 2) return null;
            // Positions here are px; the load's height at a px position.
            const hOf = (px: number) => heightAt(m, m.a + ((m.b - m.a) * (px - a)) / (b - a));
            const n = Math.max(2, Math.round((b - a) / 15));
            const xs = [...Array(n + 1).keys()].map((k) => a + ((b - a) * k) / n);
            const top = xs.map((x) => `${x},${y0 - 2 - hOf(x)}`).join(' ');
            const peakX = hOf(a) >= hOf(b) ? a : b;
            const size = v(l.size);
            return (
              <G key={i}>
                <Polygon
                  points={`${a},${y0 - 2} ${top} ${b},${y0 - 2}`}
                  fill={c.beamLoad}
                  opacity={0.12}
                />
                <Path
                  d={`M ${xs.map((x) => `${x} ${y0 - 2 - hOf(x)}`).join(' L ')}`}
                  stroke={c.beamLoad}
                  strokeWidth={chart.stroke}
                  fill="none"
                />
                {xs.map((x, k) =>
                  hOf(x) > 7 ? (
                    <Arrow
                      key={k}
                      x1={x}
                      y1={y0 - 2 - hOf(x)}
                      x2={x}
                      y2={y0 - 1}
                      color={c.beamLoad}
                      width={1.5}
                      head={6}
                    />
                  ) : null,
                )}
                <HeLabel
                  x={l.kind === 'triangle' ? peakX : (a + b) / 2}
                  y={y0 - 8 - Math.max(hOf(a), hOf(b), hOf((a + b) / 2))}
                  text={loadLabel(l, size)}
                  color={c.beamLoad}
                  anchor={l.kind === 'triangle' ? (peakX === a ? 'start' : 'end') : 'middle'}
                  w={w}
                />
              </G>
            );
          }
          const x = X(m.x);
          const len = Math.max(18 + (26 * Math.abs(m.P)) / pointMax, spreadTop(m.x) + 16);
          const up = m.P < 0;
          return (
            <G key={i}>
              {up ? (
                <Arrow
                  x1={x}
                  y1={y0 - 1}
                  x2={x}
                  y2={y0 - len}
                  color={c.beamLoad}
                  width={chart.strokeHeavy}
                  head={10}
                />
              ) : (
                <Arrow
                  x1={x}
                  y1={y0 - len}
                  x2={x}
                  y2={y0 - 1}
                  color={c.beamLoad}
                  width={chart.strokeHeavy}
                  head={10}
                />
              )}
              <HeLabel x={x} y={y0 - len - 5} text={loadLabel(l, m.P)} color={c.beamLoad} w={w} />
            </G>
          );
        })}
      </G>
    );
  }

  /** A spread load's resultant, dashed, at its centroid. */
  function renderResultant(X: (x: number) => number, y0: number, w: number) {
    const res = spec.resultant;
    if (!res || !known(res.size) || !known(res.at)) return null;
    const x = X(clampX(v(res.at)));
    return (
      <G>
        <Line
          x1={x}
          y1={y0 - LOAD_MAX - 4}
          x2={x}
          y2={y0 - 12}
          stroke={c.beamLoad}
          strokeWidth={chart.strokeHeavy}
          strokeDasharray="6 4"
        />
        <Arrow
          x1={x}
          y1={y0 - 14}
          x2={x}
          y2={y0 - 1}
          color={c.beamLoad}
          width={chart.strokeHeavy}
          head={10}
        />
        <HeLabel
          x={x + 8}
          y={y0 - LOAD_MAX + 10}
          text={B.named(res.size, 'F_R', v(res.size), fu)}
          color={c.beamLoad}
          anchor="start"
          w={w}
        />
      </G>
    );
  }

  /** Influence pages: P standing at the section, and w over the whole span, for the picture. */
  function renderInfluenceLoads(X: (x: number) => number, y0: number, w: number) {
    if (!inf) return null;
    const out = [];
    if (inf.uniform !== undefined && known(inf.uniform)) {
      const n = Math.max(2, Math.round((X(L) - X(0)) / 15));
      const hh = 16;
      out.push(
        <G key="w">
          <Rect
            x={X(0)}
            y={y0 - 2 - hh}
            width={X(L) - X(0)}
            height={hh}
            fill={c.beamLoad}
            opacity={0.12}
          />
          <Line
            x1={X(0)}
            y1={y0 - 2 - hh}
            x2={X(L)}
            y2={y0 - 2 - hh}
            stroke={c.beamLoad}
            strokeWidth={chart.stroke}
          />
          {[...Array(n + 1).keys()].map((k) => {
            const x = X(0) + ((X(L) - X(0)) * k) / n;
            return (
              <Arrow
                key={k}
                x1={x}
                y1={y0 - 2 - hh}
                x2={x}
                y2={y0 - 1}
                color={c.beamLoad}
                width={1.5}
                head={6}
              />
            );
          })}
          <HeLabel
            x={X(L) - 4}
            y={y0 - hh - 8}
            text={B.named(inf.uniform, 'w', v(inf.uniform), `${fu}/${lenUnit}`)}
            color={c.beamLoad}
            anchor="end"
            w={w}
          />
        </G>,
      );
    }
    if (inf.load !== undefined && known(inf.load) && known(inf.at)) {
      const x = X(infC);
      out.push(
        <G key="P">
          <Arrow
            x1={x}
            y1={y0 - 44}
            x2={x}
            y2={y0 - 1}
            color={c.beamLoad}
            width={chart.strokeHeavy}
            head={10}
          />
          <HeLabel
            x={x}
            y={y0 - 50}
            text={B.named(inf.load, 'P', v(inf.load), fu)}
            color={c.beamLoad}
            w={w}
          />
        </G>,
      );
    }
    if (known(inf.at) && inf.of !== 'reaction')
      out.push(
        <HeLabel key="C" x={X(infC) + 10} y={y0 - 8} text="C" anchor="start" chip={false} w={w} />,
      );
    return out;
  }

  // ── Reactions ──

  function renderReactions(
    X: (x: number) => number,
    yB: number,
    yR: number,
    yC: number,
    w: number,
  ) {
    return supports.map((s, i) => {
      const id = reactionVar(i);
      const pageKnown = id !== undefined && known(id);
      if (!pageKnown && !(solved && id === undefined)) return null;
      if (!s.placed) return null;
      const Rv = pageKnown ? v(id) : sol!.R[i]!;
      const x = X(s.x);
      const isWall = s.kind === 'fixed';
      const ax = isWall ? x + (s.x <= L / 2 ? 9 : -9) : x;
      const top = isWall ? yB + 2 : yB + SUPPORT_DEPTH + 1;
      const label = B.named(id, `R_${s.name}`, Rv, fu);
      const anchor = isWall ? (s.x <= L / 2 ? 'start' : 'end') : 'middle';
      const moment =
        isWall && (s.moment !== undefined ? known(s.moment) : solved)
          ? (solved ? sol!.Mr[i]! : v(s.moment)) || 0
          : 0;
      const ccw = moment > 0;
      const mText =
        isWall && Math.abs(moment) > 1e-12
          ? B.named(s.moment, `M_${s.name}`, Math.abs(moment), mu)
          : undefined;
      return (
        <G key={i}>
          {Math.abs(Rv) > 1e-12 ? (
            Rv > 0 ? (
              <Arrow
                x1={ax}
                y1={yR - 12}
                x2={ax}
                y2={top}
                color={c.beamReaction}
                width={chart.strokeHeavy}
                head={10}
              />
            ) : (
              <Arrow
                x1={ax}
                y1={top}
                x2={ax}
                y2={yR - 12}
                color={c.beamReaction}
                width={chart.strokeHeavy}
                head={10}
              />
            )
          ) : null}
          <HeLabel x={ax} y={yR + 2} text={label} color={c.beamReaction} anchor={anchor} w={w} />
          {mText ? (
            <>
              <CurvedArrow
                cx={x}
                cy={yC}
                r={22}
                from={s.x <= L / 2 ? (ccw ? -1.1 : 1.1) : ccw ? Math.PI - 1.1 + 0 : Math.PI + 1.1}
                to={s.x <= L / 2 ? (ccw ? 1.1 : -1.1) : ccw ? Math.PI + 1.1 : Math.PI - 1.1}
                color={c.beamReaction}
                width={2.5}
                head={9}
              />
              <HeLabel
                x={x + (s.x <= L / 2 ? 26 : -26)}
                y={yC - 30}
                text={mText}
                color={c.beamReaction}
                anchor={s.x <= L / 2 ? 'start' : 'end'}
                w={w}
              />
            </>
          ) : null}
        </G>
      );
    });
  }

  // ── The bent shape ──

  function renderDeflection(X: (x: number) => number, yC: number, w: number) {
    const s = sol!;
    const peak = Math.max(1e-30, Math.abs(defl!.y));
    const k = 24 / peak;
    const pts = [...Array(121).keys()].map((i) => {
      const x = (L * i) / 120;
      return `${X(x)} ${yC - s.y(x) * k}`;
    });
    const xm = X(defl!.x);
    const ym = yC - defl!.y * k;
    const id = typeof spec.deflection === 'string' ? spec.deflection : undefined;
    const showD = id === undefined || known(id);
    // The end slope: at the free end, else at the left support.
    const freeEnd = supports.every((p) => p.x < L * (1 - 1e-6))
      ? L
      : supports.every((p) => p.x > 1e-6 * L)
        ? 0
        : undefined;
    const xs = freeEnd ?? 0;
    const t = s.slope(xs) * k;
    const dir = xs === 0 ? 1 : -1;
    const ex = X(xs) + dir * 34;
    const ey = yC - s.y(xs) * k - dir * t * (34 / Math.max(1e-9, (X(L) - X(0)) / L));
    const showSlope = spec.slope !== undefined && known(spec.slope);
    return (
      <G>
        <Path
          d={`M ${pts.join(' L ')}`}
          stroke={c.beamDeflect}
          strokeWidth={chart.stroke}
          strokeDasharray="6 4"
          fill="none"
        />
        {showD ? (
          <>
            <Line x1={xm} y1={yC} x2={xm} y2={ym} stroke={c.beamDeflect} strokeWidth={1} />
            <HeLabel
              x={xm + (defl!.x < L / 2 ? 8 : -8)}
              y={ym + (defl!.y < 0 ? 16 : -6)}
              text={id ? B.named(id, 'δ_max', 0) : 'δ_max'}
              color={c.beamDeflect}
              anchor={defl!.x < L / 2 ? 'start' : 'end'}
              w={w}
            />
          </>
        ) : null}
        {showSlope ? (
          <>
            <Line
              x1={X(xs)}
              y1={yC - s.y(xs) * k}
              x2={ex}
              y2={ey}
              stroke={c.beamDeflect}
              strokeWidth={1.5}
            />
            <Line
              x1={X(xs)}
              y1={yC - s.y(xs) * k}
              x2={X(xs) + dir * 34}
              y2={yC - s.y(xs) * k}
              stroke={c.chartMuted}
              strokeWidth={1}
              strokeDasharray={chart.dashFine}
            />
            <HeLabel
              x={X(xs) + dir * 38}
              y={
                (yC - s.y(xs) * k + ey) / 2 +
                // A row lower where δ_max is labelled at the same end (a cantilever's tip).
                (showD && Math.abs(xm - X(xs)) < 80 ? 34 : 16)
              }
              text={B.named(spec.slope, 'θ', 0)}
              color={c.beamDeflect}
              anchor={dir > 0 ? 'start' : 'end'}
              w={w}
            />
          </>
        ) : null}
      </G>
    );
  }

  // ── Shear and moment diagrams ──

  function renderDiagrams(X: (x: number) => number, panels: Record<string, number>, w: number) {
    const s = diagramSamples(model, sol!, 60);
    const at = spec.at !== undefined && known(spec.at) ? clampX(v(spec.at)) : undefined;
    const one = (key: 'V' | 'M', top: number) => {
      const vals = s.map((p) => p[key]);
      const hi = Math.max(0, ...vals);
      const lo = Math.min(0, ...vals);
      const span = Math.max(1e-12, hi - lo);
      // Room under the title for a peak's label.
      const plotTop = top + 30;
      const plotH = DPANEL - 50;
      const Y = (y: number) => plotTop + ((hi - y) / span) * plotH;
      const color = key === 'V' ? c.beamShear : c.beamMoment;
      const pts = s.map((p) => `${X(p.x)},${Y(p[key])}`).join(' ');
      const peak = key === 'V' ? ex!.vMax : ex!.mMax;
      const peakVar = key === 'V' ? spec.maxShear : spec.maxMoment;
      const unit = key === 'V' ? fu : mu;
      const peakText =
        peakVar === undefined || known(peakVar)
          ? B.named(peakVar, key === 'V' ? 'V_max' : 'M_max', Math.abs(peak[key]), unit)
          : undefined;
      const atVar = key === 'V' ? spec.shear : spec.moment;
      const atVal = at === undefined ? 0 : key === 'V' ? sol!.V(at) : sol!.M(at);
      const atText =
        at !== undefined && atVar !== undefined && known(atVar)
          ? B.named(atVar, key, atVal, unit)
          : undefined;
      const nearPeak = at !== undefined && Math.abs(at - peak.x) < 0.2 * L;
      const peakAbove = peak[key] >= 0;
      return (
        <G key={key}>
          <ChartText x={4} y={top + 12} fontSize={chart.label} fill={c.chartMuted}>
            {key === 'V' ? `Shear V (${fu})` : `Moment M (${mu})`}
          </ChartText>
          <Polygon points={`${X(0)},${Y(0)} ${pts} ${X(L)},${Y(0)}`} fill={color} opacity={0.16} />
          <Path
            d={`M ${pts.split(' ').join(' L ')}`}
            stroke={color}
            strokeWidth={chart.stroke}
            fill="none"
          />
          <Line x1={X(0)} y1={Y(0)} x2={X(L)} y2={Y(0)} stroke={c.chartInk} strokeWidth={1} />
          {peakText && Math.abs(peak[key]) > 1e-12 ? (
            <>
              <Circle cx={X(peak.x)} cy={Y(peak[key])} r={3.5} fill={color} />
              <HeLabel
                x={X(peak.x) + (peak.x < L / 2 ? 6 : -6)}
                y={peakAbove ? Y(peak[key]) - 6 : Y(peak[key]) + 16}
                text={peakText}
                color={color}
                anchor={peak.x < L * 0.2 ? 'start' : peak.x > L * 0.8 ? 'end' : 'middle'}
                w={w}
              />
            </>
          ) : null}
          {atText ? (
            <>
              <Circle
                cx={X(at!)}
                cy={Y(atVal)}
                r={4}
                fill={c.card}
                stroke={color}
                strokeWidth={2}
              />
              <HeLabel
                x={X(at!) + (at! < L / 2 ? 8 : -8)}
                y={nearPeak === peakAbove ? Y(atVal) + 18 : Y(atVal) - 8}
                text={atText}
                color={color}
                anchor={at! < L / 2 ? 'start' : 'end'}
                w={w}
              />
            </>
          ) : null}
          {key === 'V'
            ? ex!.crossings.map((x, i) => (
                <G key={i}>
                  <Circle
                    cx={X(x)}
                    cy={Y(0)}
                    r={3}
                    fill={c.card}
                    stroke={color}
                    strokeWidth={1.5}
                  />
                  <Line
                    x1={X(x)}
                    y1={Y(0) + 4}
                    x2={X(x)}
                    y2={panels.M! + 30}
                    stroke={c.chartMuted}
                    strokeWidth={1}
                    strokeDasharray={chart.dashFine}
                  />
                </G>
              ))
            : null}
        </G>
      );
    };
    return (
      <G>
        {one('V', panels.V!)}
        {one('M', panels.M!)}
      </G>
    );
  }

  // ── Influence line ──

  function renderInfluence(X: (x: number) => number, top: number, w: number) {
    const pts = infLine!;
    const hi = Math.max(0, ...pts.map((p) => p.y));
    const lo = Math.min(0, ...pts.map((p) => p.y));
    const span = Math.max(1e-12, hi - lo);
    const plotTop = top + 36;
    const plotH = PANEL - 56;
    const Y = (y: number) => plotTop + ((hi - y) / span) * plotH;
    const color =
      inf!.of === 'moment' ? c.beamMoment : inf!.of === 'shear' ? c.beamShear : c.beamReaction;
    const path = pts.map((p) => `${X(p.x)},${Y(p.y)}`).join(' ');
    const support = supports.find((s) => Math.abs(s.x - infC) <= 1e-6 * L);
    const title =
      inf!.of === 'moment'
        ? 'Influence line of M at C'
        : inf!.of === 'shear'
          ? 'Influence line of V at C'
          : `Influence line of R_${support?.name ?? '?'}`;
    const marks: { x: number; y: number; text: string; below: boolean }[] = [];
    const eps = 1e-6 * L;
    const atC = (side: number) =>
      pts.reduce((best, p) =>
        Math.abs(p.x - (infC + side * eps)) < Math.abs(best.x - (infC + side * eps)) ? p : best,
      );
    if (inf!.of === 'shear') {
      const l = atC(-1);
      const r = atC(1);
      if (inf!.left === undefined || known(inf!.left))
        marks.push({ x: infC, y: l.y, text: B.named(inf!.left, 'y_L', l.y), below: true });
      if (inf!.right === undefined || known(inf!.right))
        marks.push({ x: infC, y: r.y, text: B.named(inf!.right, 'y_R', r.y), below: false });
    } else {
      const p = atC(0);
      if (inf!.ordinate === undefined || known(inf!.ordinate))
        marks.push({
          x: infC,
          y: p.y,
          text: B.named(inf!.ordinate, 'y_C', p.y, inf!.of === 'moment' ? lenUnit : ''),
          below: p.y < 0,
        });
    }
    const shade = inf!.uniform !== undefined && known(inf!.uniform);
    return (
      <G>
        <ChartText x={4} y={top + 12} fontSize={chart.label} fill={c.chartMuted}>
          {title}
        </ChartText>
        {shade ? (
          <Polygon points={`${X(0)},${Y(0)} ${path} ${X(L)},${Y(0)}`} fill={color} opacity={0.16} />
        ) : null}
        <Path
          d={`M ${path.split(' ').join(' L ')}`}
          stroke={color}
          strokeWidth={chart.strokeHeavy}
          fill="none"
        />
        <Line x1={X(0)} y1={Y(0)} x2={X(L)} y2={Y(0)} stroke={c.chartInk} strokeWidth={1} />
        {supports.map((s, i) => (
          <Line
            key={i}
            x1={X(s.x)}
            y1={Y(0) - 4}
            x2={X(s.x)}
            y2={Y(0) + 4}
            stroke={c.chartInk}
            strokeWidth={1.5}
          />
        ))}
        <Line
          x1={X(infC)}
          y1={plotTop - 6}
          x2={X(infC)}
          y2={plotTop + plotH + 4}
          stroke={c.chartMuted}
          strokeDasharray={chart.dashFine}
        />
        {marks.map((m, i) => (
          <G key={i}>
            <Circle cx={X(m.x)} cy={Y(m.y)} r={3.5} fill={color} />
            <HeLabel
              x={X(m.x) + (m.below ? -8 : 8)}
              y={m.below ? Y(m.y) + 16 : Y(m.y) - 6}
              text={m.text}
              color={color}
              anchor={m.below ? 'end' : 'start'}
              w={w}
            />
          </G>
        ))}
      </G>
    );
  }

  // ── Stirrups ──

  function stirrupXs(): number[] {
    const out: number[] = [];
    if (spacing <= 0) return out;
    for (let x = spacing / 2; x <= L / 2 + 1e-9 && out.length < 400; x += spacing) out.push(x);
    const mirror = out.map((x) => L - x).filter((x) => x > L / 2 + spacing / 4);
    return [...out, ...mirror];
  }

  function renderStirrups(
    X: (x: number) => number,
    y0: number,
    thick: number,
    sx: number,
    w: number,
  ) {
    const s = st!;
    const dPx = Math.min(thick - 3, depth * sx);
    const cover = Math.max(3, thick - dPx);
    const yTop = y0 + Math.min(cover, thick * 0.15);
    const yBot = y0 + Math.min(thick - 2, dPx);
    const xs = stirrupXs();
    const tooClose = xs.length > 1 && X(xs[1]!) - X(xs[0]!) < 2.5;
    const ok = !(s.max !== undefined && known(s.max)) || spacing <= v(s.max) + 1e-9;
    return (
      <G>
        <Line
          x1={X(0) + 3}
          y1={yBot}
          x2={X(L) - 3}
          y2={yBot}
          stroke={c.beamRebar}
          strokeWidth={3}
        />
        <Line
          x1={X(0) + 3}
          y1={yTop}
          x2={X(L) - 3}
          y2={yTop}
          stroke={c.beamRebar}
          strokeWidth={1.5}
        />
        {!tooClose && known(s.spacing)
          ? xs.map((x, i) => (
              <Line
                key={i}
                x1={X(x)}
                y1={yTop - 1}
                x2={X(x)}
                y2={yBot + 1}
                stroke={c.beamRebar}
                strokeWidth={1.5}
                opacity={ok ? 1 : 0.5}
              />
            ))
          : null}
        {known(s.depth) ? (
          <G>
            <Line
              x1={X(0) - 14}
              y1={y0}
              x2={X(0) - 14}
              y2={yBot}
              stroke={c.chartMuted}
              strokeWidth={1}
            />
            <Line
              x1={X(0) - 18}
              y1={y0}
              x2={X(0) - 10}
              y2={y0}
              stroke={c.chartMuted}
              strokeWidth={1}
            />
            <Line
              x1={X(0) - 18}
              y1={yBot}
              x2={X(0) - 10}
              y2={yBot}
              stroke={c.chartMuted}
              strokeWidth={1}
            />
          </G>
        ) : null}
        {known(s.depth) ? (
          <HeLabel
            x={X(0) + 2}
            y={y0 - 30}
            text={B.named(s.depth, 'd', depth, lenUnit)}
            anchor="start"
            w={w}
          />
        ) : null}
        {known(s.spacing) && xs.length > 1 && !tooClose ? (
          <Dimension
            x1={X(xs[0]!)}
            x2={X(xs[1]!)}
            y={y0 - 10}
            text={B.named(s.spacing, 's', spacing, lenUnit)}
            w={w}
          />
        ) : null}
      </G>
    );
  }

  function renderStirrupShear(X: (x: number) => number, top: number, w: number) {
    const s = st!;
    if (s.shear === undefined || !known(s.shear)) return null;
    const Vu = v(s.shear);
    const plotTop = top + 22;
    const plotH = PANEL - 50;
    const Y = (y: number) => plotTop + ((Vu - y) / Math.max(1e-12, 2 * Vu)) * plotH;
    return (
      <G>
        <ChartText x={4} y={top + 12} fontSize={chart.label} fill={c.chartMuted}>
          {`Factored shear V_u (${B.unit(s.shear, fu)})`}
        </ChartText>
        <Polygon
          points={`${X(0)},${Y(0)} ${X(0)},${Y(Vu)} ${X(L)},${Y(-Vu)} ${X(L)},${Y(0)}`}
          fill={c.beamShear}
          opacity={0.16}
        />
        <Line
          x1={X(0)}
          y1={Y(Vu)}
          x2={X(L)}
          y2={Y(-Vu)}
          stroke={c.beamShear}
          strokeWidth={chart.stroke}
        />
        <Line
          x1={X(0)}
          y1={Y(Vu)}
          x2={X(0)}
          y2={Y(0)}
          stroke={c.beamShear}
          strokeWidth={chart.stroke}
        />
        <Line
          x1={X(L)}
          y1={Y(-Vu)}
          x2={X(L)}
          y2={Y(0)}
          stroke={c.beamShear}
          strokeWidth={chart.stroke}
        />
        <Line x1={X(0)} y1={Y(0)} x2={X(L)} y2={Y(0)} stroke={c.chartInk} strokeWidth={1} />
        <HeLabel
          x={X(0) + 6}
          y={Y(Vu) + 2}
          text={B.named(s.shear, 'V_u', Vu)}
          color={c.beamShear}
          anchor="start"
          w={w}
        />
      </G>
    );
  }

  // ── Moment-distribution table ──

  function renderTable(top: number, w: number) {
    const t = table!;
    const cols = t.ends.length;
    const nameW = 92;
    const colW = (w - nameW - 8) / cols;
    const cx = (j: number) => nameW + colW * (j + 0.5);
    const cont = spec.continuous!;
    // The first interior joint's two member ends carry the page's DF, FEM and moment.
    const linked = (row: 'df' | 'fem' | 'moment', j: number): string | number | undefined => {
      if (j !== 1 && j !== 2) return undefined;
      if (row === 'moment') return cont.moment;
      return (row === 'df' ? cont.df : cont.fem)?.[j - 1];
    };
    const cell = (row: 'df' | 'fem' | 'moment' | 'other', j: number, x: number | undefined) => {
      const id = row === 'other' ? undefined : linked(row, j);
      if (x === undefined) return '';
      if (id !== undefined && !known(id)) return '';
      return row === 'df' ? fmt(x) : fmt(x);
    };
    const rows: { name: string; cells: string[]; bold?: boolean }[] = [
      { name: 'DF', cells: t.df.map((x, j) => cell('df', j, x)) },
      { name: 'FEM', cells: t.fem.map((x, j) => cell('fem', j, x)) },
      ...t.rows.map((r) => ({ name: r.name, cells: r.values.map((x, j) => cell('other', j, x)) })),
      { name: 'Final M', cells: t.final.map((x, j) => cell('moment', j, x)), bold: true },
    ];
    return (
      <G>
        <Rect
          x={4}
          y={top}
          width={w - 8}
          height={ROW * (rows.length + 1) + 4}
          fill={c.card}
          stroke={c.chartGrid}
          rx={6}
        />
        {t.ends.map((e, j) => (
          <ChartText
            key={e}
            x={cx(j)}
            y={top + 15}
            fontSize={chart.label}
            fontWeight="700"
            textAnchor="middle"
          >
            {e}
          </ChartText>
        ))}
        <ChartText x={10} y={top + 15} fontSize={chart.label} fill={c.chartMuted}>
          {`(${mu})`}
        </ChartText>
        {rows.map((r, i) => (
          <G key={r.name}>
            <Line
              x1={8}
              y1={top + ROW * (i + 1) + 2}
              x2={w - 8}
              y2={top + ROW * (i + 1) + 2}
              stroke={c.chartGrid}
              strokeWidth={1}
            />
            <ChartText
              x={10}
              y={top + ROW * (i + 2) - 3}
              fontSize={chart.label}
              fontWeight={r.bold ? '700' : '400'}
            >
              {r.name}
            </ChartText>
            {r.cells.map((txt, j) => (
              <ChartText
                key={j}
                x={cx(j)}
                y={top + ROW * (i + 2) - 3}
                fontSize={chart.label}
                textAnchor="middle"
                fontWeight={r.bold ? '700' : '400'}
              >
                {txt}
              </ChartText>
            ))}
          </G>
        ))}
      </G>
    );
  }

  // ── Caption ──

  function captionLines(): string[] {
    const out: string[] = [];
    if (!complete) {
      out.push('Type the span, the supports and every load to draw the reactions.');
      return out;
    }
    if (!sol!.ok) {
      out.push('These supports can’t hold the beam: it would turn or slide (drawn faded).');
      return out;
    }
    const tot = loadTotals(model.loads);
    if (!loads.length && !inf) {
      const kinds = { pin: 'a pin', roller: 'a roller', fixed: 'a fixed end' } as const;
      out.push(`Supports: ${supports.map((s) => `${kinds[s.kind]} at ${s.name}`).join(', ')}.`);
    }
    if (!inf && loads.length) {
      const names = supports.map((s) => `R_${s.name}`).join(' + ');
      const nums = sol!.R.map(fmt).join(' + ');
      out.push(
        `ΣF = 0: ${names} = ${supports.length > 1 ? `${nums} = ` : ''}${fmt(tot.F)} ${fu}, the total load.`,
      );
      const walls = supports
        .map((s, i) => ({ s, m: sol!.Mr[i]! }))
        .filter(
          (p) => p.s.kind === 'fixed' && Math.abs(p.m) > 1e-9 * Math.max(1, Math.abs(tot.M0)),
        );
      for (const p of walls)
        out.push(
          `The wall at ${p.s.name} holds M_${p.s.name} = ${fmt(Math.abs(p.m))} ${mu}, ${p.m > 0 ? 'counterclockwise' : 'clockwise'}.`,
        );
    }
    if (spec.diagrams && ex && !inf) {
      const z = ex.crossings[0];
      out.push(
        z !== undefined
          ? `M peaks where V crosses 0: M = ${fmt(sol!.M(z))} ${mu} at x = ${fmt(z)} ${lenUnit}.`
          : `|M| is largest at x = ${fmt(ex.mMax.x)} ${lenUnit}: ${fmt(ex.mMax.M)} ${mu}.`,
      );
      out.push('The area under V between two points is the change in M.');
    }
    if (defl) out.push('The bent shape is drawn bigger than life; it meets every support.');
    if (table)
      out.push(
        `Moments clockwise + on each member end; ${table.cycles} cycle${table.cycles === 1 ? '' : 's'} balance every joint.`,
      );
    if (inf && infLine) {
      const peak = infLine.reduce((b, p) => (Math.abs(p.y) > Math.abs(b.y) ? p : b));
      out.push(
        `Each ordinate is the ${inf.of === 'reaction' ? 'reaction' : inf.of} a load of 1 makes standing there; the largest is ${fmt(peak.y)} at x = ${fmt(peak.x)} ${lenUnit}.`,
      );
    }
    if (st && known(st.spacing)) {
      if (st.max !== undefined && known(st.max))
        out.push(
          spacing <= v(st.max) + 1e-9
            ? `s = ${fmt(spacing)} ${lenUnit} ≤ s_max = ${fmt(v(st.max))} ${lenUnit}: close enough.`
            : `s = ${fmt(spacing)} ${lenUnit} > s_max = ${fmt(v(st.max))} ${lenUnit}: too far apart (drawn faded).`,
        );
      out.push('Stirrups start s ÷ 2 from each support; depth drawn as d ÷ 0.9.');
    }
    return out;
  }
}

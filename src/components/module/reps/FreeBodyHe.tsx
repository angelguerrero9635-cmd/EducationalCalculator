/**
 * The college `freeBody` options (HC20, typesHe2f.ts): two blocks over a pulley with each
 * block's own free-body diagram, a ladder against a wall, a crate that tips or slips, a rope
 * round a drum, and a car on a banked curve. Forces are arrows on one scale (N) from the values;
 * the scenes are painted (wood, cardboard, brick, steel, asphalt), the free-body diagrams flat.
 * A "?" input draws no arrow that depends on it, and the caption keeps only the formulas.
 */
import { useRef } from 'react';
import { View } from 'react-native';
import Svg, { Circle, Defs, G, Line, Path, Polygon, Rect } from 'react-native-svg';

import type {
  FbBanked,
  FbDrum,
  FbLadder,
  FbPulley,
  FbTip,
  FreeBodyHe2fSpec,
} from '@/data/modules/typesHe2f';
import type { NumOrVar } from '@/data/modules/typesGraphs';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, Caption, DragHandle, useRep } from './common';
import { FreeBodyAircraft } from './FreeBodyAircraft';
import { bankOf, capstan, ladderOf, pulleyOf, tipOf } from './he2fMath';
import { fmt, Tag, tipLabel, valueText } from './he2fKit';
import { formulaOnly, RAD, Vec } from './hskKit';
import { Metal, TopLight, url, usePaintIds } from './paint';

type Pt = { x: number; y: number };

/** Values of a picture: numbers in formula units, whether boxes are known, and their text. */
function useVals(calc: Calculator) {
  const rep = useRep(calc);
  const num = (x: NumOrVar | undefined, d = 0) =>
    x === undefined ? d : typeof x === 'number' ? x : rep.val(x);
  const ok = (...xs: (NumOrVar | undefined)[]) =>
    xs.every((x) => typeof x !== 'string' || rep.known(x));
  /** A value as the page shows it, or the picture's own figure with its unit. */
  const text = (x: NumOrVar | undefined, computed: number, unit: string) =>
    valueText(rep, x, computed, unit);
  return { rep, num, ok, text };
}

/** The caption, cut to formulas while an input is "?". */
const captionOf = (lines: string[], all: boolean) => (all ? lines : formulaOnly(lines)).join(' · ');

export function FreeBodyHe({ spec, calc }: { spec: FreeBodyHe2fSpec; calc: Calculator }) {
  if ('pulley' in spec) return <PulleyView spec={spec} p={spec.pulley} calc={calc} />;
  if ('ladder' in spec) return <LadderView spec={spec} l={spec.ladder} calc={calc} />;
  if ('tip' in spec) return <TipView spec={spec} t={spec.tip} calc={calc} />;
  if ('drum' in spec) return <DrumView d={spec.drum} calc={calc} />;
  if ('aircraft' in spec) return <FreeBodyAircraft spec={spec} a={spec.aircraft} calc={calc} />;
  return <BankedView spec={spec} b={spec.banked} calc={calc} />;
}

/** A force arrow from `from` along (ux, uy) (screen), `len` px, labelled at its tip. */
function Force({
  from,
  ux,
  uy,
  len,
  color,
  text,
  w,
  dash,
  label,
}: {
  from: Pt;
  ux: number;
  uy: number;
  len: number;
  color: string;
  text: string;
  w: number;
  dash?: string;
  label?: { x: number; y: number; anchor: 'start' | 'middle' | 'end' };
}) {
  const to = { x: from.x + ux * len, y: from.y + uy * len };
  const at = label ?? tipLabel(from, to, text, w);
  return (
    <G>
      <Vec
        x1={from.x}
        y1={from.y}
        x2={to.x}
        y2={to.y}
        color={color}
        width={dash ? 2 : chart.strokeHeavy}
        dash={dash}
        head={dash ? 8 : 10}
      />
      <Tag x={at.x} y={at.y} text={text} anchor={at.anchor} color={color} w={w} />
    </G>
  );
}

// ─── Pulley ─────────────────────────────────────────────────────────────────

const SKETCH = 158;
const FBD = 222;

function PulleyView({ spec, p, calc }: { spec: FreeBodyHe2fSpec; p: FbPulley; calc: Calculator }) {
  const c = usePalette();
  const { num, ok, text } = useVals(calc);
  const ids = usePaintIds('light', 'disk', 'light2');
  const g = num(spec.g, 9.8);
  const [m1, m2] = [Math.max(0, num(p.m1)), Math.max(0, num(p.m2))];
  const mu = Math.max(0, num(p.mu));
  const M = Math.max(0, num(p.pulleyMass));
  const massive = p.pulleyMass !== undefined && M > 0;
  const table = p.layout === 'table';
  const all = ok(p.m1, p.m2, p.mu, p.pulleyMass, spec.g);
  const r = pulleyOf({ layout: p.layout, m1, m2, mu, M, g });
  const T1name = massive ? 'T₁' : 'T';
  const T2name = massive ? 'T₂' : 'T';
  const aT = text(p.a, Math.abs(r.a), 'm/s²');
  const m1T = ok(p.m1) ? text(p.m1, m1, 'kg') : '?';
  const m2T = ok(p.m2) ? text(p.m2, m2, 'kg') : '?';

  // Each block's forces: [screen direction, size, color, label].
  type F = { ux: number; uy: number; size: number; color: string; text: string };
  const f1: F[] = table
    ? [
        { ux: 0, uy: 1, size: r.W1, color: c.forceWeight, text: `W₁ = ${fmt(r.W1)} N` },
        { ux: 0, uy: -1, size: r.N1, color: c.forceNormal, text: `N₁ = ${fmt(r.N1)} N` },
        {
          ux: -1,
          uy: 0,
          size: r.f,
          color: c.forceFriction,
          text: `${r.holds ? 'fₛ' : 'f'} = ${fmt(r.f)} N`,
        },
        {
          ux: 1,
          uy: 0,
          size: r.T1,
          color: c.forceTension,
          text: `${T1name} = ${text(p.T, r.T1, 'N')}`,
        },
      ]
    : [
        {
          ux: 0,
          uy: -1,
          size: r.T1,
          color: c.forceTension,
          text: `${T1name} = ${text(p.T, r.T1, 'N')}`,
        },
        { ux: 0, uy: 1, size: r.W1, color: c.forceWeight, text: `W₁ = ${fmt(r.W1)} N` },
      ];
  const f2: F[] = [
    {
      ux: 0,
      uy: -1,
      size: r.T2,
      color: c.forceTension,
      text: `${T2name} = ${text(massive ? p.T2 : p.T, r.T2, 'N')}`,
    },
    { ux: 0, uy: 1, size: r.W2, color: c.forceWeight, text: `W₂ = ${fmt(r.W2)} N` },
  ];
  const biggest = Math.max(1e-9, ...[...f1, ...f2].map((q) => q.size));

  return (
    <View>
      <Canvas aspect={(w) => (SKETCH + FBD) / w}>
        {({ w }) => {
          const k = 76 / biggest;
          return (
            <Svg width={w} height={SKETCH + FBD}>
              <Defs>
                <TopLight id={ids.light} />
                <TopLight id={ids.light2} strength={0.6} />
                <Metal id={ids.disk} light={c.metal} dark={c.metalDark} />
              </Defs>
              {table ? tableSketch(w) : atwoodSketch(w)}
              {/* The two free-body diagrams on one scale. */}
              <Line
                x1={8}
                y1={SKETCH}
                x2={w - 8}
                y2={SKETCH}
                stroke={c.chartGrid}
                strokeWidth={1}
              />
              {[
                { at: w * 0.25, forces: f1, name: `Block 1 (m₁ = ${m1T})` },
                { at: w * 0.75, forces: f2, name: `Block 2 (m₂ = ${m2T})` },
              ].map((col, i) => {
                const C = { x: col.at, y: SKETCH + 120 };
                return (
                  <G key={i}>
                    <Tag
                      x={col.at}
                      y={SKETCH + 16}
                      text={col.name}
                      chip={false}
                      color={c.chartMuted}
                      w={w}
                    />
                    {all
                      ? col.forces.map((q, j) =>
                          q.size > 1e-9 ? (
                            <Force
                              key={j}
                              from={C}
                              ux={q.ux}
                              uy={q.uy}
                              len={q.size * k}
                              color={q.color}
                              text={q.text}
                              w={w}
                              label={
                                q.uy === 0
                                  ? {
                                      x: C.x + q.ux * (q.size * k + 6),
                                      y: C.y + 20,
                                      anchor: q.ux < 0 ? 'end' : 'start',
                                    }
                                  : undefined
                              }
                            />
                          ) : null,
                        )
                      : null}
                    <Rect
                      x={C.x - 15}
                      y={C.y - 12}
                      width={30}
                      height={24}
                      rx={2}
                      fill={c.wood}
                      stroke={c.woodDark}
                      strokeWidth={1.2}
                    />
                    <Circle cx={C.x} cy={C.y} r={2.5} fill={c.chartInk} />
                  </G>
                );
              })}
            </Svg>
          );
        }}
      </Canvas>
      <Caption>{captionOf(captionLines(), all)}</Caption>
    </View>
  );

  /** A block of wood lit from the top left, its mass written on it. */
  function block(x: number, y: number, bw: number, bh: number) {
    return (
      <G>
        <Rect
          x={x}
          y={y}
          width={bw}
          height={bh}
          rx={3}
          fill={c.wood}
          stroke={c.woodDark}
          strokeWidth={1.5}
        />
        <Rect x={x} y={y} width={bw} height={bh} rx={3} fill={url(ids.light)} />
      </G>
    );
  }

  /** The acceleration arrow, the way the block moves. */
  function aArrow(
    x: number,
    y: number,
    ux: number,
    uy: number,
    label: boolean,
    w: number,
    side = 1,
  ) {
    if (!all || Math.abs(r.a) < 1e-9) return null;
    const L = 30;
    return (
      <G>
        <Vec
          x1={x}
          y1={y}
          x2={x + ux * L}
          y2={y + uy * L}
          color={c.chartHighlight}
          width={2}
          head={8}
        />
        <Tag
          x={uy === 0 ? x + ux * L + 6 : x + side * 8}
          y={uy === 0 ? y + 4 : y + (uy * L) / 2 + 4}
          text={label ? `a = ${aT}` : 'a'}
          anchor={uy === 0 ? 'start' : side > 0 ? 'start' : 'end'}
          color={c.chartHighlight}
          w={w}
        />
      </G>
    );
  }

  function tableSketch(w: number) {
    const Ty = 82;
    const xe = w * 0.56;
    const [bw, bh] = [58, 38];
    const bx = xe * 0.5;
    const pr = 11;
    const pc = { x: xe + 4 + pr, y: Ty - bh / 2 + pr };
    const b2 = { x: pc.x + pr, top: Ty + 26 };
    return (
      <G>
        {/* The table: a wooden top on two legs. */}
        {[18, xe - 24].map((x) => (
          <Rect key={x} x={x} y={Ty + 10} width={9} height={SKETCH - Ty - 16} fill={c.woodDark} />
        ))}
        <Rect x={6} y={Ty} width={xe - 6} height={11} rx={2} fill={c.wood} stroke={c.woodDark} />
        <Rect x={6} y={Ty} width={xe - 6} height={11} rx={2} fill={url(ids.light2)} />
        {/* The pulley on its bracket at the table's corner. */}
        <Line x1={xe - 2} y1={Ty + 4} x2={pc.x} y2={pc.y} stroke={c.metalDark} strokeWidth={4} />
        <Circle cx={pc.x} cy={pc.y} r={pr} fill={url(ids.disk)} stroke={c.metalDark} />
        <Circle cx={pc.x} cy={pc.y} r={2} fill={c.metalDark} />
        {/* The rope: level from block 1, over the pulley, down to block 2. */}
        <Path
          d={`M ${bx + bw / 2} ${Ty - bh / 2} L ${pc.x} ${pc.y - pr} A ${pr} ${pr} 0 0 1 ${pc.x + pr} ${pc.y} L ${b2.x} ${b2.top}`}
          stroke={c.fbRope}
          strokeWidth={2.5}
          fill="none"
        />
        {block(bx - bw / 2, Ty - bh, bw, bh)}
        {block(b2.x - 23, b2.top, 46, 36)}
        <Tag x={bx} y={Ty - bh / 2 + 4} text={`m₁ = ${m1T}`} w={w} />
        <Tag x={b2.x} y={b2.top + 22} text={`m₂ = ${m2T}`} w={w} />
        <Tag
          x={bx}
          y={Ty + 30}
          text={`μₖ = ${ok(p.mu) ? text(p.mu, mu, '') : '?'}`.trim()}
          chip={false}
          w={w}
        />
        {aArrow(bx - 15, Ty - bh - 14, 1, 0, true, w)}
        {aArrow(b2.x + 35, b2.top + 2, 0, 1, false, w)}
      </G>
    );
  }

  function atwoodSketch(w: number) {
    const pr = 24;
    const pc = { x: w / 2, y: 46 };
    const [bw, bh] = [40, 32];
    // The heavier block hangs lower.
    const down2 = m2 >= m1;
    const top1 = down2 ? 84 : 104;
    const top2 = down2 ? 104 : 84;
    const x1 = pc.x - pr;
    const x2 = pc.x + pr;
    const sign = r.a >= 0 ? 1 : -1;
    return (
      <G>
        <Rect
          x={w * 0.32}
          y={4}
          width={w * 0.36}
          height={9}
          rx={2}
          fill={c.metal}
          stroke={c.metalDark}
        />
        <Line x1={pc.x} y1={13} x2={pc.x} y2={pc.y} stroke={c.metalDark} strokeWidth={4} />
        <Path
          d={`M ${x1} ${top1} L ${x1} ${pc.y} A ${pr} ${pr} 0 0 1 ${x2} ${pc.y} L ${x2} ${top2}`}
          stroke={c.fbRope}
          strokeWidth={2.5}
          fill="none"
        />
        <Circle
          cx={pc.x}
          cy={pc.y}
          r={pr - 1.5}
          fill={massive ? url(ids.disk) : 'none'}
          stroke={c.metalDark}
          strokeWidth={massive ? 1.5 : 2.5}
        />
        <Circle cx={pc.x} cy={pc.y} r={3} fill={c.metalDark} />
        {massive ? (
          <Tag
            x={x2 + 10}
            y={pc.y - 10}
            text={`M = ${ok(p.pulleyMass) ? text(p.pulleyMass, M, 'kg') : '?'}`}
            anchor="start"
            w={w}
          />
        ) : null}
        {block(x1 - bw / 2, top1, bw, bh)}
        {block(x2 - bw / 2, top2, bw, bh)}
        <Tag x={x1} y={top1 + bh + 16} text={`m₁ = ${m1T}`} w={w} />
        <Tag x={x2} y={top2 + bh + 16} text={`m₂ = ${m2T}`} w={w} />
        {aArrow(x1 - bw / 2 - 12, top1 + (sign > 0 ? bh : 0), 0, -sign, false, w, -1)}
        {aArrow(x2 + bw / 2 + 12, top2 + (sign > 0 ? 0 : bh), 0, sign, true, w)}
      </G>
    );
  }

  function captionLines(): string[] {
    const half = massive ? ` + ½ × ${fmt(M)}` : '';
    const halfSym = massive ? ' + ½M' : '';
    const out: string[] = [];
    if (table) {
      if (r.holds) {
        out.push(
          `μₖm₁ = ${fmt(mu)} × ${fmt(m1)} = ${fmt(mu * m1)} kg ≥ m₂ = ${fmt(m2)} kg: friction holds and nothing slides, so a = 0 and T = W₂ = ${fmt(r.W2)} N.`,
        );
        return out;
      }
      out.push(
        `a = (m₂ − μₖm₁)g ÷ (m₁ + m₂${halfSym}) = (${fmt(m2)} − ${fmt(mu)} × ${fmt(m1)}) × ${fmt(g)} ÷ (${fmt(m1)} + ${fmt(m2)}${half}) = ${fmt(r.a, 4)} m/s²`,
        `Block 1: ${T1name} − μₖm₁g = ${fmt(r.T1, 4)} − ${fmt(r.f, 4)} = ${fmt(r.T1 - r.f, 4)} N = m₁a`,
        `Block 2: m₂g − ${T2name} = ${fmt(r.W2, 4)} − ${fmt(r.T2, 4)} = ${fmt(r.W2 - r.T2, 4)} N = m₂a`,
      );
    } else {
      out.push(
        `a = (m₂ − m₁)g ÷ (m₁ + m₂${halfSym}) = (${fmt(m2)} − ${fmt(m1)}) × ${fmt(g)} ÷ (${fmt(m1)} + ${fmt(m2)}${half}) = ${fmt(r.a, 4)} m/s²`,
        `Block 1: ${T1name} − m₁g = ${fmt(r.T1, 4)} − ${fmt(r.W1, 4)} = ${fmt(r.T1 - r.W1, 4)} N = m₁a`,
        `Block 2: m₂g − ${T2name} = ${fmt(r.W2, 4)} − ${fmt(r.T2, 4)} = ${fmt(r.W2 - r.T2, 4)} N = m₂a`,
      );
      if (r.a < 0) out.push('a is negative: m₁ is the heavier, so it goes down and m₂ up.');
    }
    if (massive)
      out.push(
        `The pulley: T₂ − T₁ = ½Ma = ${fmt(r.T2, 4)} − ${fmt(r.T1, 4)} = ${fmt(r.T2 - r.T1, 4)} N turns it.`,
      );
    else out.push('A light pulley: the tension is the same on both sides.');
    return out;
  }
}

// ─── Ladder ─────────────────────────────────────────────────────────────────

const LADDER_H = 324;

function LadderView({ spec, l, calc }: { spec: FreeBodyHe2fSpec; l: FbLadder; calc: Calculator }) {
  const c = usePalette();
  const { rep, num, ok, text } = useVals(calc);
  const ids = usePaintIds('light', 'brick');
  const drag = useRef({ y: 0, deg: 0 });
  const deg = Math.min(89, Math.max(1, num(l.angle, 60)));
  const W = Math.max(0, num(l.weight));
  const all = ok(l.angle, l.weight);
  const r = ladderOf(W, deg);
  const th = deg * RAD;

  return (
    <View>
      <Canvas aspect={(w) => LADDER_H / w}>
        {({ w }) => {
          const h = LADDER_H;
          const Fy = h - 60;
          const Wx = w - 34;
          const L = Math.min((Fy - 40) / Math.sin(th), (Wx - 112) / Math.cos(th));
          const F = { x: Wx - L * Math.cos(th), y: Fy };
          const T = { x: Wx, y: Fy - L * Math.sin(th) };
          const M = { x: (F.x + T.x) / 2, y: (F.y + T.y) / 2 };
          const k = Math.min(96 / Math.max(1e-9, W, r.Nw), (h - 8 - M.y) / Math.max(1e-9, W));
          // Unit vectors along the ladder and across it (screen).
          const u = { x: Math.cos(th), y: -Math.sin(th) };
          const n = { x: Math.sin(th), y: Math.cos(th) };
          const rungs = Math.max(3, Math.floor(L / 22));
          const NfTip = F.y - k * r.Nf;
          // "L sin θ" just under the wall line; N_f's label beside its tip, or by the foot.
          const armY = T.y + 15;
          const nfY = Math.abs(NfTip + 12 - armY) < 22 ? F.y - 10 : NfTip + 12;
          // θ's glyph inside the angle; at low angles far enough out to clear the floor and rails.
          const low = deg < 40;
          const glyph = low ? Math.max(34, 24 / Math.tan(th)) : 34;
          const arcR = low ? glyph - 12 : 26;
          const handle = !spec.fixed && typeof l.angle === 'string' && rep.known(l.angle);
          return (
            <>
              <Svg width={w} height={h}>
                <Defs>
                  <TopLight id={ids.light} />
                  <TopLight id={ids.brick} strength={0.5} />
                </Defs>
                {/* Floor and wall. */}
                <Rect x={0} y={Fy} width={w} height={h - Fy} fill={c.chartSurface} />
                <Line x1={0} y1={Fy} x2={w} y2={Fy} stroke={c.chartInk} strokeWidth={1.5} />
                <Rect x={Wx} y={6} width={28} height={Fy - 6} fill={c.ladderWall} />
                {Array.from({ length: Math.floor((Fy - 6) / 14) }, (_, i) => (
                  <G key={i}>
                    <Line
                      x1={Wx}
                      y1={Fy - 14 * (i + 1)}
                      x2={Wx + 28}
                      y2={Fy - 14 * (i + 1)}
                      stroke={c.ladderWallDark}
                      strokeWidth={1}
                    />
                    <Line
                      x1={Wx + (i % 2 ? 10 : 20)}
                      y1={Fy - 14 * (i + 1)}
                      x2={Wx + (i % 2 ? 10 : 20)}
                      y2={Fy - 14 * i}
                      stroke={c.ladderWallDark}
                      strokeWidth={1}
                    />
                  </G>
                ))}
                <Rect x={Wx} y={6} width={28} height={Fy - 6} fill={url(ids.brick)} />
                <Line x1={Wx} y1={6} x2={Wx} y2={Fy} stroke={c.ladderWallDark} strokeWidth={1.5} />
                {/* The lever arms about the foot, dashed. */}
                <G opacity={all ? 1 : 0}>
                  <Path
                    d={`M ${F.x} ${F.y} L ${F.x} ${T.y} L ${T.x} ${T.y}`}
                    stroke={c.chartMuted}
                    strokeDasharray={chart.dashFine}
                    fill="none"
                  />
                  <Path
                    d={`M ${M.x} ${M.y} L ${M.x} ${Fy + 34} M ${F.x} ${Fy + 28} L ${F.x} ${Fy + 40} M ${F.x} ${Fy + 34} L ${M.x} ${Fy + 34}`}
                    stroke={c.chartMuted}
                    strokeDasharray={chart.dashFine}
                    fill="none"
                  />
                  <Tag x={F.x - 6} y={armY} text="L sin θ" anchor="end" chip={false} w={w} />
                  <Tag x={(F.x + M.x) / 2} y={Fy + 52} text="½L cos θ" chip={false} w={w} />
                </G>
                {/* The ladder: two wooden rails and rungs. */}
                {[-1, 1].map((s) => (
                  <Line
                    key={s}
                    x1={F.x + n.x * 5 * s}
                    y1={F.y + n.y * 5 * s}
                    x2={T.x + n.x * 5 * s}
                    y2={T.y + n.y * 5 * s}
                    stroke={c.woodDark}
                    strokeWidth={4}
                    strokeLinecap="round"
                  />
                ))}
                {Array.from({ length: rungs }, (_, i) => {
                  const t = (i + 0.5) / rungs;
                  const P = { x: F.x + u.x * L * t, y: F.y + u.y * L * t };
                  return (
                    <Line
                      key={i}
                      x1={P.x - n.x * 5}
                      y1={P.y - n.y * 5}
                      x2={P.x + n.x * 5}
                      y2={P.y + n.y * 5}
                      stroke={c.wood}
                      strokeWidth={2.5}
                    />
                  );
                })}
                <Path
                  d={`M ${F.x + arcR} ${F.y} A ${arcR} ${arcR} 0 0 0 ${F.x + arcR * u.x} ${F.y + arcR * u.y}`}
                  stroke={c.chartInk}
                  fill="none"
                />
                <Tag
                  x={low ? F.x + glyph : F.x + glyph * Math.cos(th / 2)}
                  y={low ? F.y - 4 : F.y - glyph * Math.sin(th / 2) + 4}
                  text="θ"
                  chip={false}
                  bold={false}
                  w={w}
                />
                {all ? (
                  <G>
                    <Force
                      from={M}
                      ux={0}
                      uy={1}
                      len={k * W}
                      color={c.forceWeight}
                      text={`W = ${text(l.weight, W, 'N')}`}
                      w={w}
                      label={{ x: M.x - 12, y: M.y - 10, anchor: 'end' }}
                    />
                    <Force
                      from={F}
                      ux={0}
                      uy={-1}
                      len={k * r.Nf}
                      color={c.forceNormal}
                      text={`N_f = ${text(l.floor, r.Nf, 'N')}`}
                      w={w}
                      label={{ x: F.x - 8, y: nfY, anchor: 'end' }}
                    />
                    <Force
                      from={{ x: F.x, y: F.y + 5 }}
                      ux={1}
                      uy={0}
                      len={k * r.f}
                      color={c.forceFriction}
                      text={`f = ${text(l.friction, r.f, 'N')}`}
                      w={w}
                      label={{ x: F.x + 4, y: Fy + 23, anchor: 'start' }}
                    />
                    <Force
                      from={T}
                      ux={-1}
                      uy={0}
                      len={k * r.Nw}
                      color={c.forceNormal}
                      text={`N_w = ${text(l.wall, r.Nw, 'N')}`}
                      w={w}
                      label={{ x: Wx - 4, y: T.y - 9, anchor: 'end' }}
                    />
                  </G>
                ) : null}
                <Circle cx={F.x} cy={F.y} r={3.5} fill={c.chartInk} />
              </Svg>
              {handle ? (
                <DragHandle
                  testID="drag-ladder-top"
                  x={T.x}
                  y={T.y}
                  label={rep.variable(l.angle as string).name}
                  onStart={() => {
                    drag.current = { y: T.y, deg };
                  }}
                  onMove={(_, dy) => {
                    const id = l.angle as string;
                    const rise = Math.min(
                      L * 0.999,
                      Math.max(L * 0.02, Fy - (drag.current.y + dy)),
                    );
                    const next = Math.asin(rise / L) / RAD;
                    calc.set(
                      {
                        ...rep.pin(typeof l.weight === 'string' ? [l.weight] : []),
                        [id]: rep.snapTo(id, next),
                      },
                      rep.slide(id),
                    );
                  }}
                />
              ) : null}
            </>
          );
        }}
      </Canvas>
      <Caption>{captionOf(captionLines(), all)}</Caption>
    </View>
  );

  function captionLines(): string[] {
    const t = fmt(deg, 4);
    return [
      `Up and down: N_f = W = ${fmt(W, 4)} N`,
      `Torques about the foot: N_w × L sin θ = W × ½L cos θ, so N_w = W ÷ (2 tan θ) = ${fmt(W, 4)} ÷ (2 × tan ${t}°) = ${fmt(r.Nw, 4)} N`,
      `Level: f = N_w = ${fmt(r.f, 4)} N, so it holds when μₛ ≥ f ÷ N_f = ${fmt(r.mu, 3)}`,
    ];
  }
}

// ─── Tip or slip ────────────────────────────────────────────────────────────

const TIP_H = 330;

function TipView({ spec, t, calc }: { spec: FreeBodyHe2fSpec; t: FbTip; calc: Calculator }) {
  const c = usePalette();
  const { rep, num, ok, text } = useVals(calc);
  const ids = usePaintIds('light');
  const drag = useRef({ y: 0, h: 0 });
  const W = Math.max(0, num(t.weight));
  const b = Math.max(1e-9, num(t.width, 1));
  const hh = Math.max(1e-9, num(t.height, 1));
  const mu = Math.max(0, num(t.mu));
  const all = ok(t.weight, t.width, t.height, t.mu);
  const r = tipOf(W, b, hh, mu);
  const H = Math.max(hh * 1.08, num(t.crateHeight, Math.max(hh * 1.25, b / 2)));
  // Slipping first, N sits where the torques balance: b/2 − Ph ÷ W back from the edge.
  const back = r.tips || W <= 0 ? 0 : Math.max(0, b / 2 - (r.P * hh) / W);
  const fUsed = r.tips ? r.P : r.slip;

  return (
    <View>
      <Canvas aspect={(w) => TIP_H / w}>
        {({ w }) => {
          const h = TIP_H;
          const Fy = h - 92;
          const s = Math.min(150 / b, (Fy - 34) / H, (w - 200) / b);
          const [bs, Hs] = [b * s, H * s];
          const x0 = Math.max(118, w * 0.5 - bs / 2);
          const ex = x0 + bs;
          const Cc = { x: x0 + bs / 2, y: Fy - Hs / 2 };
          const Py = Fy - hh * s;
          const k = Math.min(100 / Math.max(1e-9, W, r.P), 80 / Math.max(1e-9, W));
          const Nx = ex - back * s;
          const handle = !spec.fixed && typeof t.height === 'string' && rep.known(t.height);
          return (
            <>
              <Svg width={w} height={h}>
                <Defs>
                  <TopLight id={ids.light} />
                </Defs>
                <Rect x={0} y={Fy} width={w} height={h - Fy} fill={c.chartSurface} />
                <Line x1={0} y1={Fy} x2={w} y2={Fy} stroke={c.chartInk} strokeWidth={1.5} />
                {/* The crate: kraft cardboard with a strip of tape. */}
                <Rect
                  x={x0}
                  y={Fy - Hs}
                  width={bs}
                  height={Hs}
                  rx={2}
                  fill={c.boxKraft}
                  stroke={c.boxKraftDark}
                  strokeWidth={1.5}
                />
                <Rect
                  x={x0 + bs * 0.4}
                  y={Fy - Hs}
                  width={bs * 0.2}
                  height={Math.min(Hs * 0.3, 30)}
                  fill={c.boxTape}
                />
                <Rect x={x0} y={Fy - Hs} width={bs} height={Hs} rx={2} fill={url(ids.light)} />
                {/* b across the top, h up the right side. */}
                <Path
                  d={`M ${x0} ${Fy - Hs - 16} L ${ex} ${Fy - Hs - 16} M ${x0} ${Fy - Hs - 21} L ${x0} ${Fy - Hs - 11} M ${ex} ${Fy - Hs - 21} L ${ex} ${Fy - Hs - 11}`}
                  stroke={c.chartMuted}
                />
                <Tag
                  x={Cc.x}
                  y={Fy - Hs - 22}
                  text={`b = ${ok(t.width) ? text(t.width, b, 'm') : '?'}`}
                  chip={false}
                  w={w}
                />
                <Path
                  d={`M ${ex + 18} ${Fy} L ${ex + 18} ${Py} M ${ex + 13} ${Py} L ${ex + 23} ${Py}`}
                  stroke={c.chartMuted}
                  strokeDasharray={chart.dashFine}
                />
                <Tag
                  x={ex + 24}
                  y={(Fy + Py) / 2 + 4}
                  text={`h = ${ok(t.height) ? text(t.height, hh, 'm') : '?'}`}
                  anchor="start"
                  chip={false}
                  w={w}
                />
                <Line
                  x1={x0}
                  y1={Py}
                  x2={ex + 18}
                  y2={Py}
                  stroke={c.chartMuted}
                  strokeDasharray={chart.dashFine}
                />
                {/* The tipping edge, ringed. */}
                <Circle
                  cx={ex}
                  cy={Fy}
                  r={6}
                  fill="none"
                  stroke={c.chartHighlight}
                  strokeWidth={2}
                />
                {all ? (
                  <G>
                    <Force
                      from={Cc}
                      ux={0}
                      uy={1}
                      len={k * W}
                      color={c.forceWeight}
                      text={`W = ${text(t.weight, W, 'N')}`}
                      w={w}
                      label={{ x: Cc.x - 7, y: Cc.y + k * W * 0.55, anchor: 'end' }}
                    />
                    <Vec x1={x0 - k * r.P} y1={Py} x2={x0} y2={Py} color={c.forceApplied} />
                    <Tag
                      x={x0 - k * r.P - 6}
                      y={Py + 4}
                      text={`P = ${fmt(r.P)} N`}
                      anchor="end"
                      color={c.forceApplied}
                      w={w}
                    />
                    <Vec x1={Nx} y1={Fy + k * W} x2={Nx} y2={Fy} color={c.forceNormal} />
                    <Tag
                      x={Nx + 7}
                      y={Fy + k * W - 2}
                      text={`N = ${fmt(W)} N`}
                      anchor="start"
                      color={c.forceNormal}
                      w={w}
                    />
                    {fUsed > 1e-9 ? (
                      <G>
                        <Vec
                          x1={Nx}
                          y1={Fy + 6}
                          x2={Nx - k * fUsed}
                          y2={Fy + 6}
                          color={c.forceFriction}
                          width={2.5}
                        />
                        <Tag
                          x={Nx - k * fUsed - 4}
                          y={Fy + 24}
                          text={`${r.tips ? 'f' : 'f = μₛN'} = ${fmt(fUsed)} N`}
                          anchor="end"
                          color={c.forceFriction}
                          w={w}
                        />
                      </G>
                    ) : null}
                  </G>
                ) : null}
                <Circle cx={Cc.x} cy={Cc.y} r={3} fill={c.chartInk} />
              </Svg>
              {handle ? (
                <DragHandle
                  testID="drag-push-height"
                  x={x0}
                  y={Py}
                  label={rep.variable(t.height as string).name}
                  onStart={() => {
                    drag.current = { y: Py, h: hh };
                  }}
                  onMove={(_, dy) => {
                    const id = t.height as string;
                    const next = Math.max(1e-3, drag.current.h - dy / s);
                    calc.set(
                      {
                        ...rep.pin(
                          [t.weight, t.width, t.mu].filter(
                            (x): x is string => typeof x === 'string',
                          ),
                        ),
                        [id]: rep.snapTo(id, Math.min(H, next)),
                      },
                      rep.slide(id),
                    );
                  }}
                />
              ) : null}
            </>
          );
        }}
      </Canvas>
      <Caption>{captionOf(captionLines(), all)}</Caption>
    </View>
  );

  function captionLines(): string[] {
    const tipT = text(t.tip, r.tip, 'N');
    const slipT = text(t.slip, r.slip, 'N');
    const out = [
      `To tip, about the ringed edge: P_tip × h = W × b ÷ 2, so P_tip = Wb ÷ (2h) = ${fmt(W, 4)} × ${fmt(b, 4)} ÷ (2 × ${fmt(hh, 4)}) = ${fmt(r.tip, 4)} N`,
      `To slip: P_slip = μₛW = ${fmt(mu, 4)} × ${fmt(W, 4)} = ${fmt(r.slip, 4)} N`,
    ];
    if (r.tie) out.push(`Both at ${tipT}: it tips and slips together.`);
    else if (r.tips)
      out.push(`${tipT} < ${slipT}: it tips first, at ${tipT}, with N and f at the edge.`);
    else
      out.push(
        `${slipT} < ${tipT}: it slides first, at ${slipT}; N acts ${fmt(back, 3)} m in from the edge.`,
      );
    return out;
  }
}

// ─── Drum ───────────────────────────────────────────────────────────────────

const DRUM_H = 300;

function DrumView({ d, calc }: { d: FbDrum; calc: Calculator }) {
  const c = usePalette();
  const { num, ok, text } = useVals(calc);
  const ids = usePaintIds('disk');
  const t1 = Math.max(0, num(d.t1));
  const t2 = Math.max(0, num(d.t2));
  const mu = Math.max(0, num(d.mu));
  const betaRaw = Math.max(0, num(d.wrap));
  const betaRad = d.radians ? betaRaw : betaRaw * RAD;
  const betaDeg = betaRad / RAD;
  const all = ok(d.t1, d.t2, d.mu, d.wrap);
  // Past half a turn the ends hang down and the extra turns are drawn as coils.
  const drawn = Math.min(180, Math.max(4, betaDeg));
  const extra = betaDeg > 180.5 ? Math.ceil((betaDeg - 180) / 360 - 1e-9) : 0;
  const wrapT = ok(d.wrap) ? (d.radians ? `${fmt(betaRad, 4)} rad` : `${fmt(betaDeg, 4)}°`) : '?';

  return (
    <View>
      <Canvas aspect={(w) => DRUM_H / w}>
        {({ w }) => {
          const O = { x: w / 2, y: 92 };
          const R = 54;
          const aL = (90 + drawn / 2) * RAD;
          const aR = (90 - drawn / 2) * RAD;
          const at = (a: number, rr = R) => ({
            x: O.x + rr * Math.cos(a),
            y: O.y - rr * Math.sin(a),
          });
          const PL = at(aL);
          const PR = at(aR);
          // Leaving the drum along the tangent, away from the wrap (screen directions).
          const dL = { x: -Math.sin(aL), y: -Math.cos(aL) };
          const dR = { x: Math.sin(aR), y: Math.cos(aR) };
          const k = 118 / Math.max(1e-9, t1, t2);
          const free = 22;
          const L1 = Math.max(all && t1 > 0 ? 8 : 0, k * t1);
          const L2 = k * t2;
          const sL = { x: PL.x + dL.x * free, y: PL.y + dL.y * free };
          const sR = { x: PR.x + dR.x * free, y: PR.y + dR.y * free };
          const arcR = R + 14;
          const big = drawn > 180 ? 1 : 0;
          return (
            <Svg width={w} height={DRUM_H}>
              <Defs>
                <Metal id={ids.disk} light={c.metal} dark={c.metalDark} />
              </Defs>
              {/* The drum, steel, on its axle. */}
              <Circle
                cx={O.x}
                cy={O.y}
                r={R}
                fill={url(ids.disk)}
                stroke={c.metalDark}
                strokeWidth={1.5}
              />
              <Circle cx={O.x} cy={O.y} r={R * 0.22} fill={c.metalDark} opacity={0.5} />
              <Circle cx={O.x} cy={O.y} r={3} fill={c.chartInk} />
              {/* The rope in contact over β, then its free ends. */}
              <Path
                d={`M ${sL.x} ${sL.y} L ${PL.x} ${PL.y} A ${R} ${R} 0 ${big} 1 ${PR.x} ${PR.y} L ${sR.x} ${sR.y}`}
                stroke={c.fbRope}
                strokeWidth={4}
                fill="none"
              />
              {Array.from({ length: extra }, (_, i) => {
                const y = O.y - R * 0.55 + (i + 1) * ((R * 1.1) / (extra + 1));
                return (
                  <Line
                    key={i}
                    x1={O.x - R * Math.sqrt(1 - ((y - O.y) / R) ** 2)}
                    y1={y + 6}
                    x2={O.x + R * Math.sqrt(1 - ((y - O.y) / R) ** 2)}
                    y2={y - 6}
                    stroke={c.fbRope}
                    strokeWidth={4}
                  />
                );
              })}
              {/* β marked over the contact. */}
              <Path
                d={`M ${at(aL, arcR).x} ${at(aL, arcR).y} A ${arcR} ${arcR} 0 ${big} 1 ${at(aR, arcR).x} ${at(aR, arcR).y}`}
                stroke={c.chartMuted}
                strokeDasharray={chart.dashFine}
                fill="none"
              />
              <Tag
                x={O.x}
                y={O.y - arcR - 8}
                text={`β = ${wrapT}${extra ? ` (${fmt(betaDeg / 360, 3)} turns)` : ''}`}
                w={w}
              />
              <Tag
                x={O.x}
                y={O.y + R * 0.62}
                text={`μ = ${ok(d.mu) ? text(d.mu, mu, '') : '?'}`.trim()}
                w={w}
              />
              {all ? (
                <G>
                  <Force
                    from={sL}
                    ux={dL.x}
                    uy={dL.y}
                    len={L1}
                    color={c.forceTension}
                    text={`T₁ = ${text(d.t1, t1, 'N')}`}
                    w={w}
                  />
                  <Force
                    from={sR}
                    ux={dR.x}
                    uy={dR.y}
                    len={L2}
                    color={c.forceTension}
                    text={`T₂ = ${text(d.t2, t2, 'N')}`}
                    w={w}
                  />
                </G>
              ) : null}
            </Svg>
          );
        }}
      </Canvas>
      <Caption>{captionOf(captionLines(), all)}</Caption>
    </View>
  );

  function captionLines(): string[] {
    const want = capstan(t1, mu, betaRad);
    const out = [
      `T₂ = T₁e^(μβ) = ${fmt(t1, 4)} × e^(${fmt(mu, 4)} × ${fmt(betaRad, 4)}) = ${fmt(want, 4)} N`,
      'β is in radians in the formula; the rope is about to slip toward T₂.',
    ];
    if (t1 > 0 && 118 * (t1 / Math.max(t1, t2)) < 8)
      out.push('T₁ is drawn longer than to scale: at scale it would be too short to see.');
    return out;
  }
}

// ─── Banked curve ───────────────────────────────────────────────────────────

const BANK_H = 304;

function BankedView({ spec, b, calc }: { spec: FreeBodyHe2fSpec; b: FbBanked; calc: Calculator }) {
  const c = usePalette();
  const { num, ok, text } = useVals(calc);
  const ids = usePaintIds('light', 'road');
  const deg = Math.min(80, Math.max(0, num(b.angle)));
  const th = deg * RAD;
  const mu = Math.max(0, num(b.mu));
  const g = num(spec.g, 9.8);
  const hasMass = b.mass !== undefined;
  const m = Math.max(0, num(b.mass, 1));
  const mg = hasMass ? m * g : 1;
  const bk = bankOf(deg, b.mu === undefined ? 0 : mu);
  const all = ok(b.angle, b.mu, b.mass, spec.g) && Number.isFinite(bk.N);
  const N = bk.N * mg;
  const f = bk.friction * mg;
  const net = bk.inward * mg;
  // Newtons with a mass; else multiples of mg.
  const F = (x: number, id?: string) => (hasMass ? text(id, x, 'N') : `${fmt(x)}mg`);

  return (
    <View>
      <Canvas aspect={(w) => BANK_H / w}>
        {({ w }) => {
          const h = BANK_H;
          // The road rises to the right; the curve's center is off to the left.
          const P0 = { x: w * 0.58, y: h * 0.66 };
          const u = { x: Math.cos(th), y: -Math.sin(th) };
          const n = { x: -Math.sin(th), y: -Math.cos(th) };
          const reachL = Math.min(
            (P0.x - 10) / Math.max(0.2, u.x),
            (h - 14 - P0.y) / Math.max(1e-9, Math.sin(th)),
          );
          const reachR = Math.min(w - 10 - P0.x, (P0.y - 30) / Math.max(1e-9, Math.sin(th)));
          const A = { x: P0.x - u.x * reachL, y: P0.y - u.y * reachL };
          const B = { x: P0.x + u.x * reachR, y: P0.y + u.y * reachR };
          const CG = { x: P0.x + n.x * 30, y: P0.y + n.y * 30 };
          const k = Math.min(78 / mg, 112 / Math.max(1e-9, N, mg));
          const kN = k * N;
          const Nv = { x: n.x * kN, y: n.y * kN };
          const fLen = k * f;
          const netY = 30;
          const netX = w * 0.42;
          return (
            <Svg width={w} height={h}>
              <Defs>
                <TopLight id={ids.light} />
                <TopLight id={ids.road} strength={0.5} />
              </Defs>
              {/* Ground and the banked road in section. */}
              <Polygon
                points={`${A.x},${A.y} ${B.x},${B.y} ${B.x},${h} ${A.x},${h}`}
                fill={c.soil}
                opacity={0.55}
              />
              <Polygon
                points={`${A.x},${A.y} ${B.x},${B.y} ${B.x + n.x * -12},${B.y - n.y * 12} ${A.x - n.x * 12},${A.y - n.y * 12}`}
                fill={c.fbRoad}
                stroke={c.fbRoadDark}
              />
              <Line x1={A.x} y1={A.y} x2={B.x} y2={B.y} stroke={c.fbRoadDark} strokeWidth={1.5} />
              {/* θ at the road's foot against the level. */}
              <Line
                x1={A.x}
                y1={A.y}
                x2={A.x + 70}
                y2={A.y}
                stroke={c.chartMuted}
                strokeDasharray={chart.dashFine}
              />
              <Path
                d={`M ${A.x + 46} ${A.y} A 46 46 0 0 0 ${A.x + 46 * u.x} ${A.y + 46 * u.y}`}
                stroke={c.chartInk}
                fill="none"
              />
              <Tag
                x={A.x + 54}
                y={A.y + 18}
                text={`θ = ${ok(b.angle) ? text(b.angle, deg, '°') : '?'}`}
                anchor="start"
                chip={false}
                w={w}
              />
              {/* The car from behind: tires, body, rear window, lit from the top left. */}
              <G rotation={-deg} origin={`${P0.x}, ${P0.y}`}>
                {[-1, 1].map((s) => (
                  <Rect
                    key={s}
                    x={P0.x + s * 30 - 8}
                    y={P0.y - 16}
                    width={16}
                    height={16}
                    rx={3}
                    fill={c.rubber}
                  />
                ))}
                <Path
                  d={`M ${P0.x - 46} ${P0.y - 12} L ${P0.x - 46} ${P0.y - 34} Q ${P0.x - 44} ${P0.y - 40} ${P0.x - 34} ${P0.y - 41} L ${P0.x - 26} ${P0.y - 58} Q ${P0.x} ${P0.y - 63} ${P0.x + 26} ${P0.y - 58} L ${P0.x + 34} ${P0.y - 41} Q ${P0.x + 44} ${P0.y - 40} ${P0.x + 46} ${P0.y - 34} L ${P0.x + 46} ${P0.y - 12} Z`}
                  fill={c.physCartA}
                  stroke={c.chartInk}
                  strokeWidth={1}
                />
                <Path
                  d={`M ${P0.x - 22} ${P0.y - 43} L ${P0.x - 17} ${P0.y - 54} Q ${P0.x} ${P0.y - 57} ${P0.x + 17} ${P0.y - 54} L ${P0.x + 22} ${P0.y - 43} Z`}
                  fill={c.glass}
                />
                <Rect x={P0.x - 46} y={P0.y - 63} width={92} height={51} fill={url(ids.light)} />
              </G>
              {all ? (
                <G>
                  {/* N's parts, dashed: up (balances mg) and level (toward the center). */}
                  <Force
                    from={CG}
                    ux={0}
                    uy={-1}
                    len={kN * Math.cos(th)}
                    color={c.forceNormal}
                    text="N cos θ"
                    w={w}
                    dash={chart.dashFine}
                    label={{ x: CG.x + 6, y: CG.y - kN * Math.cos(th) + 10, anchor: 'start' }}
                  />
                  <Force
                    from={CG}
                    ux={-1}
                    uy={0}
                    len={kN * Math.sin(th)}
                    color={c.forceNormal}
                    text="N sin θ"
                    w={w}
                    dash={chart.dashFine}
                    label={{ x: CG.x - kN * Math.sin(th) - 6, y: CG.y + 4, anchor: 'end' }}
                  />
                  <Force
                    from={CG}
                    ux={n.x}
                    uy={n.y}
                    len={kN}
                    color={c.forceNormal}
                    text={`N = ${F(N, b.normal)}`}
                    w={w}
                    label={{ x: CG.x + Nv.x - 6, y: CG.y + Nv.y - 4, anchor: 'end' }}
                  />
                  <Force
                    from={CG}
                    ux={0}
                    uy={1}
                    len={k * mg}
                    color={c.forceWeight}
                    text={hasMass ? `mg = ${fmt(mg)} N` : 'mg'}
                    w={w}
                    label={{ x: CG.x + 8, y: CG.y + k * mg - 4, anchor: 'start' }}
                  />
                  {fLen > 1 ? (
                    <Force
                      from={{ x: P0.x - u.x * 30 + n.x * 4, y: P0.y - u.y * 30 + n.y * 4 }}
                      ux={-u.x}
                      uy={-u.y}
                      len={fLen}
                      color={c.forceFriction}
                      text={`f = μN = ${F(f)}`}
                      w={w}
                      label={{
                        x: P0.x - u.x * (30 + fLen) - 4,
                        y: P0.y - u.y * (30 + fLen) - 12,
                        anchor: 'end',
                      }}
                    />
                  ) : null}
                  {/* The net force: level, toward the center of the curve. */}
                  <Vec
                    x1={netX}
                    y1={netY}
                    x2={netX - k * net}
                    y2={netY}
                    color={c.forceNet}
                    width={4}
                  />
                  <Tag
                    x={netX + 6}
                    y={netY + 4}
                    text={`F_net = mv²/r = ${F(net, b.net)}`}
                    anchor="start"
                    color={c.forceNet}
                    w={w}
                  />
                  <Tag
                    x={8}
                    y={netY + 22}
                    text="to the center"
                    anchor="start"
                    chip={false}
                    bold={false}
                    color={c.chartMuted}
                    w={w}
                  />
                </G>
              ) : null}
              <Circle cx={CG.x} cy={CG.y} r={3} fill={c.chartInk} />
            </Svg>
          );
        }}
      </Canvas>
      <Caption>{captionOf(captionLines(), all)}</Caption>
    </View>
  );

  function captionLines(): string[] {
    const t = fmt(deg, 4);
    const r = num(b.radius);
    const out: string[] = [];
    if (b.mu === undefined) {
      out.push(
        hasMass
          ? `Up and down: N cos θ = mg, so N = mg ÷ cos θ = ${fmt(mg, 4)} ÷ cos ${t}° = ${fmt(N, 4)} N`
          : `Up and down: N cos θ = mg, so N = mg ÷ cos ${t}° = ${fmt(bk.N, 4)}mg`,
        'Level: N sin θ = mv²/r, the centripetal force',
      );
      if (b.radius !== undefined)
        out.push(
          `Dividing: tan θ = v² ÷ (rg), so v = √(rg tan θ) = √(${fmt(r, 4)} × ${fmt(g, 4)} × tan ${t}°) = ${fmt(Math.sqrt(r * g * Math.tan(th)), 4)} m/s`,
        );
    } else {
      out.push(
        'At the top speed friction μN points down the slope',
        `Up and down: N(cos θ − μ sin θ) = mg; level: N(sin θ + μ cos θ) = mv²/r`,
      );
      if (b.radius !== undefined && Number.isFinite(bk.ratio))
        out.push(
          `v_max = √(rg(sin θ + μ cos θ) ÷ (cos θ − μ sin θ)) = √(${fmt(r, 4)} × ${fmt(g, 4)} × ${fmt(bk.ratio, 4)}) = ${fmt(Math.sqrt(r * g * bk.ratio), 4)} m/s`,
        );
      if (!Number.isFinite(bk.N))
        out.push('μ ≥ 1 ÷ tan θ: friction alone holds the car at any speed.');
    }
    return out;
  }
}

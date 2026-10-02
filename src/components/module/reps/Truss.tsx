/**
 * HC27 `truss` (TrussSpec in typesHe2i.ts): a pin-jointed truss to scale, members painted as
 * steel angles on gusset plates, supports, joint loads and reactions; each member's force with
 * T or C and arrows pulling on or pushing at its joints; a section cut with its free body
 * shaded; the counts m, j and r; a joint's deflection; one bar element of a finite-element model.
 */
import type { ReactNode } from 'react';
import { View } from 'react-native';
import Svg, { Circle, G, Line, Path, Rect } from 'react-native-svg';

import type { NumOrVar } from '@/data/modules/typesGraphs';
import type { TrussSpec } from '@/data/modules/typesHe2i';
import { chart, usePalette, type Palette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Arrow, fmt, HeLabel, SupportGlyph } from './beamKit';
import { Canvas, Caption, useRep } from './common';
import { useValueLabel } from './he1fKit';
import {
  buildTruss,
  cutOf,
  elementStretch,
  reactionCount,
  solveTruss,
  unitLoadDeflection,
} from './trussMath';

const BW = 358;
const SIZE = chart.label;

/** A label's box, for keeping labels apart. */
type Box = { x1: number; y1: number; x2: number; y2: number };
const labelW = (t: string) => t.replace(/_/g, '').length * SIZE * 0.58 + 6;
const boxAt = (x: number, y: number, t: string): Box => {
  const w = labelW(t);
  return { x1: x - w / 2, y1: y - SIZE, x2: x + w / 2, y2: y + 5 };
};
const hits = (a: Box, b: Box) => a.x1 < b.x2 && b.x1 < a.x2 && a.y1 < b.y2 && b.y1 < a.y2;

/** A steel angle from (x1, y1) to (x2, y2): the leg in metal, its shaded edge and its lit edge. */
function SteelMember({
  x1,
  y1,
  x2,
  y2,
  c,
  faded,
}: {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  c: Palette;
  faded?: boolean;
}) {
  const L = Math.hypot(x2 - x1, y2 - y1) || 1;
  const [nx, ny] = [-(y2 - y1) / L, (x2 - x1) / L];
  // The shaded edge faces down (light from the top left).
  const s = ny < 0 || (ny === 0 && nx < 0) ? -1 : 1;
  const o = 2.2;
  return (
    <G opacity={faded ? 0.45 : 1}>
      <Line x1={x1} y1={y1} x2={x2} y2={y2} stroke={c.metal} strokeWidth={6.5} />
      <Line
        x1={x1 + s * nx * o}
        y1={y1 + s * ny * o}
        x2={x2 + s * nx * o}
        y2={y2 + s * ny * o}
        stroke={c.metalDark}
        strokeWidth={1.6}
      />
      <Line
        x1={x1 - s * nx * o}
        y1={y1 - s * ny * o}
        x2={x2 - s * nx * o}
        y2={y2 - s * ny * o}
        stroke={c.shine}
        strokeOpacity={0.55 * c.sheen}
        strokeWidth={1}
      />
    </G>
  );
}

/** A gusset plate at a joint: a steel disc with a bolt. */
function Gusset({ x, y, c }: { x: number; y: number; c: Palette }) {
  return (
    <G>
      <Circle cx={x} cy={y} r={6} fill={c.metal} stroke={c.metalDark} strokeWidth={1.2} />
      <Circle cx={x - 1} cy={y - 1} r={1.8} fill={c.metalDark} />
    </G>
  );
}

export function Truss({ spec, calc }: { spec: TrussSpec; calc: Calculator }) {
  if (spec.mode === 'element' && spec.element) return <TrussElement spec={spec} calc={calc} />;
  return <TrussFrame spec={spec} calc={calc} />;
}

function TrussFrame({ spec, calc }: { spec: TrussSpec; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  const valueLabel = useValueLabel(calc);
  const get = (x: NumOrVar | undefined) =>
    x === undefined ? undefined : typeof x === 'number' ? x : rep.known(x) ? rep.val(x) : undefined;
  const lu = spec.units?.length ?? 'm';
  const fu = spec.units?.force ?? 'kN';
  const r = spec.counts?.r === undefined ? undefined : get(spec.counts.r);
  const model = buildTruss(spec, get, r);
  /** "F = 45 kN": the page's value as shown, or a number worked out here. */
  const named = (x: NumOrVar | undefined, fallback: string, value: number, unit = fu) =>
    typeof x === 'string'
      ? rep.known(x)
        ? valueLabel(x)!
        : undefined
      : `${fallback} = ${fmt(value)} ${unit}`;

  if (!model) {
    return (
      <View>
        <Canvas aspect={60 / BW}>{() => null}</Canvas>
        <Caption>Type the truss’s sizes and loads to draw it.</Caption>
      </View>
    );
  }

  const sol = solveTruss(model);
  const cut = spec.cut && sol.ok ? cutOf(model, sol, spec.cut) : undefined;
  const forces = spec.forces ?? (spec.panels ? 'cut' : 'all');
  const deflect =
    spec.deflect && sol.ok
      ? (() => {
          const j = model.joints.findIndex((J) => J.name === spec.deflect!.joint);
          const [A, E] = [get(spec.deflect!.A), get(spec.deflect!.E)];
          return j < 0 || A === undefined || E === undefined
            ? undefined
            : { j, ...unitLoadDeflection(model, sol, j, A, E)! };
        })()
      : undefined;

  // ── Scale ──
  const xs = model.joints.map((j) => j.x);
  const ys = model.joints.map((j) => j.y);
  const [minX, maxX, minY, maxY] = [
    Math.min(...xs),
    Math.max(...xs),
    Math.min(...ys),
    Math.max(...ys),
  ];
  const span = Math.max(maxX - minX, 1e-9);
  const rise = maxY - minY;
  const sideRoom = 44;
  const s = Math.min((BW - 2 * sideRoom) / span, rise > 0 ? 150 / rise : Infinity);
  const topLoads = model.loads.some((l) => model.joints[l.j]!.y > minY + 1e-9 && l.dir === 'down');
  const yTop = 18 + (topLoads ? 44 : 0) + (cut ? 14 : 0);
  const x0 = (BW - span * s) / 2;
  const X = (x: number) => x0 + (x - minX) * s;
  const Y = (y: number) => yTop + (maxY - y) * s;
  const yBottom = Y(minY);
  const cx = X((minX + maxX) / 2);
  const cy = (yTop + yBottom) / 2;

  const placed: Box[] = [];
  const labels: ReactNode[] = [];
  /** A label at the first spot of `spots` that is clear of every label placed so far. */
  const place = (key: string, spots: [number, number][], text: string, color?: string) => {
    const spot =
      spots.find(([x, y]) => !placed.some((b) => hits(b, boxAt(x, y, text)))) ?? spots[0]!;
    placed.push(boxAt(spot[0], spot[1], text));
    labels.push(
      <HeLabel key={key} x={spot[0]} y={spot[1]} text={text} color={color} w={BW} size={SIZE} />,
    );
  };

  // ── Which members show their force ──
  const shownForce = (k: number): { text?: string; F: number } | undefined => {
    if (!sol.ok || forces === 'none') return undefined;
    const F = sol.forces[k]!;
    const m = model.members[k]!;
    if (cut && (k === cut.chord || k === cut.diagonal)) {
      const id = k === cut.chord ? spec.cut!.F : spec.cut!.Fd;
      if (typeof id === 'string' && !rep.known(id)) return undefined;
      return { F };
    }
    if (F === 0) return { text: '0', F };
    if (forces === 'cut') return cut && k === cut.top + cut.bottom - cut.chord ? { F } : undefined;
    if (typeof m.force === 'string' && !rep.known(m.force)) return undefined;
    const letter = F > 0 ? 'T' : 'C';
    // The size and the letter: a page's signed value is in its box; on the member, 8.33 kN (C).
    return { text: `${fmt(Math.abs(F))} ${fu} (${letter})`, F };
  };

  const tension = c.trussTension;
  const compression = c.trussCompression;
  const signColor = (F: number) => (F > 0 ? tension : compression);

  // ── Members ──
  const memberEls = model.members.map((m, k) => {
    const [a, b] = [model.joints[m.a]!, model.joints[m.b]!];
    const f = sol.ok ? sol.forces[k]! : undefined;
    const zero = f === 0 && forces !== 'none';
    return (
      <G key={`m${k}`}>
        <SteelMember x1={X(a.x)} y1={Y(a.y)} x2={X(b.x)} y2={Y(b.y)} c={c} faded={zero} />
        {zero ? (
          <Line
            x1={X(a.x)}
            y1={Y(a.y)}
            x2={X(b.x)}
            y2={Y(b.y)}
            stroke={c.chartMuted}
            strokeWidth={1.2}
            strokeDasharray={chart.dashFine}
          />
        ) : null}
      </G>
    );
  });

  // ── Forces on the members: a stripe in the sign's colour, arrows at the joints, a label ──
  const forceEls: ReactNode[] = [];
  model.members.forEach((m, k) => {
    const shown = shownForce(k);
    if (!shown || shown.F === 0) {
      if (shown?.text === '0') {
        const [a, b] = [model.joints[m.a]!, model.joints[m.b]!];
        const [mx, my] = [(X(a.x) + X(b.x)) / 2, (Y(a.y) + Y(b.y)) / 2];
        const vertical = Math.abs(X(a.x) - X(b.x)) < 1;
        place(
          `z${k}`,
          vertical
            ? [
                [mx + 11, my + 4],
                [mx - 11, my + 4],
              ]
            : [
                [mx, my - 9],
                [mx, my + 17],
              ],
          '0',
          c.chartMuted,
        );
      }
      return;
    }
    const [a, b] = [model.joints[m.a]!, model.joints[m.b]!];
    const [ax, ay, bx, by] = [X(a.x), Y(a.y), X(b.x), Y(b.y)];
    const L = Math.hypot(bx - ax, by - ay);
    const [ux, uy] = [(bx - ax) / L, (by - ay) / L];
    const col = signColor(shown.F);
    const cutHere = cut && [cut.top, cut.bottom, cut.diagonal].includes(k);
    forceEls.push(
      <Line
        key={`s${k}`}
        x1={ax + ux * 7}
        y1={ay + uy * 7}
        x2={bx - ux * 7}
        y2={by - uy * 7}
        stroke={col}
        strokeWidth={1.8}
      />,
    );
    // Pulling (T): toward the member's middle; pushing (C): toward the joint. Not on a cut
    // member, whose arrows sit at the cut.
    if (!cutHere && L > 56) {
      for (const [jx, jy, sx] of [
        [ax, ay, 1],
        [bx, by, -1],
      ] as const) {
        const [near, far] = [9, 22];
        const [p, q] = shown.F > 0 ? [near, far] : [far, near];
        forceEls.push(
          <Arrow
            key={`a${k}${sx}`}
            x1={jx + sx * ux * p}
            y1={jy + sx * uy * p}
            x2={jx + sx * ux * q}
            y2={jy + sx * uy * q}
            color={col}
            width={1.8}
            head={7}
          />,
        );
      }
    }
    if (shown.text) {
      // Outside the truss: the side of the member away from its middle.
      const [mx, my] = [(ax + bx) / 2, (ay + by) / 2];
      let [nx, ny] = [-uy, ux];
      if (nx * (mx - cx) + ny * (my - cy) < 0) [nx, ny] = [-nx, -ny];
      if (Math.abs(uy) > 0.15) {
        // A slanted member: the label runs along it, on its outer side.
        let r = (Math.atan2(by - ay, bx - ax) * 180) / Math.PI;
        if (r > 90) r -= 180;
        if (r <= -90) r += 180;
        const t = (r * Math.PI) / 180;
        const below = nx * -Math.sin(t) + ny * Math.cos(t) > 0;
        labels.push(
          <G key={`f${k}`} transform={`rotate(${r}, ${mx}, ${my})`}>
            <HeLabel x={mx} y={my + (below ? 16 : -6)} text={shown.text} color={col} size={SIZE} />
          </G>,
        );
        placed.push({
          x1: mx + nx * 12 - 8,
          y1: my + ny * 12 - 8,
          x2: mx + nx * 12 + 8,
          y2: my + ny * 12 + 8,
        });
      } else {
        const off = (d: number, t: number): [number, number] => [
          ax + (bx - ax) * t + nx * d,
          ay + (by - ay) * t + ny * d + (ny > 0 ? 10 : 0),
        ];
        place(
          `f${k}`,
          [off(12, 0.5), off(12, 0.36), off(12, 0.64), off(26, 0.5), off(-14, 0.5)],
          shown.text,
          col,
        );
      }
    }
  });

  // ── Supports and reactions ──
  const supportEls: ReactNode[] = [];
  const reactionEls: ReactNode[] = [];
  model.supports.forEach((sp, i) => {
    const J = model.joints[sp.j]!;
    const [x, y] = [X(J.x), Y(J.y)];
    supportEls.push(<SupportGlyph key={`sp${i}`} x={x} y={y + 6} kind={sp.kind} />);
    const ry = sol.ok ? sol.reactions[i]!.ry : undefined;
    const known =
      sp.reaction === undefined || typeof sp.reaction === 'number' || rep.known(sp.reaction);
    const left = J.x < (minX + maxX) / 2;
    const ax = x + (left ? -22 : 22);
    if (ry !== undefined && ry !== 0 && known) {
      reactionEls.push(
        <Arrow
          key={`r${i}`}
          x1={ax}
          y1={y + (ry > 0 ? 44 : 8)}
          x2={ax}
          y2={y + (ry > 0 ? 8 : 44)}
          color={c.beamReaction}
          width={2.2}
        />,
      );
      const name = model.panel ? 'R' : `R_${J.name}`;
      const text =
        typeof sp.reaction === 'string'
          ? valueLabel(sp.reaction)!
          : `${name} = ${fmt(Math.abs(ry))} ${fu}`;
      if (forces !== 'none')
        place(`rl${i}`, [[ax + (left ? 4 : -4), y + 60]], text, c.beamReaction);
    }
    if (sp.kind === 'pin' && spec.counts) {
      // The pin's second reaction, counted in r (zero under vertical loads).
      const hx = left ? x - 34 : x + 34;
      reactionEls.push(
        <Arrow
          key={`rx${i}`}
          x1={hx}
          y1={y + 22}
          x2={left ? x - 12 : x + 12}
          y2={y + 22}
          color={c.beamReaction}
          width={1.6}
        />,
      );
    }
  });

  // ── Loads ──
  const loadEls: ReactNode[] = [];
  model.loads.forEach((l, i) => {
    const J = model.joints[l.j]!;
    const [x, y] = [X(J.x), Y(J.y)];
    const [ux, uy] = ({ down: [0, 1], up: [0, -1], left: [-1, 0], right: [1, 0] } as const)[l.dir];
    const atTop = J.y > minY + 1e-9;
    // A load on a top joint pushes in from outside; on a bottom joint it hangs from the joint.
    const [x1, y1, x2, y2] = atTop
      ? [x - ux * 40, y - uy * 40, x - ux * 8, y - uy * 8]
      : [x + ux * 8, y + uy * 8, x + ux * 36, y + uy * 36];
    loadEls.push(
      <Arrow key={`l${i}`} x1={x1} y1={y1} x2={x2} y2={y2} color={c.beamLoad} width={2.2} />,
    );
    const spec_ = spec.panels ? spec.panels.load : spec.loads?.[i]?.P;
    // A panel truss's loads are labelled once, under the one nearest midspan.
    if (spec.panels && i !== Math.floor((model.loads.length - 1) / 2)) return;
    const each = spec.panels ? ' each' : '';
    const t = named(spec_, 'P', l.P);
    if (!t) return;
    place(
      `ll${i}`,
      atTop
        ? [
            [x, y1 - 6],
            [x + 50, y1 + 10],
          ]
        : [
            [x, y2 + 18],
            [x + 30, y2 + 18],
          ],
      `${t}${each}`,
      c.beamLoad,
    );
  });

  // ── The cut ──
  const cutEls: ReactNode[] = [];
  const cutLines: { text: string; color?: string }[] = [];
  if (cut && sol.ok && model.panel) {
    const xc = X(cut.x);
    cutEls.push(
      <Rect
        key="fb"
        x={X(minX) - 16}
        y={yTop - 10}
        width={xc - X(minX) + 16}
        height={yBottom - yTop + 20}
        rx={6}
        fill={c.trussFreeBody}
      />,
    );
    const cutPanel = (
      <G key="cutline">
        <Line
          x1={xc + 5}
          y1={yTop - 16}
          x2={xc - 5}
          y2={yBottom + 16}
          stroke={c.chartInk}
          strokeWidth={1.6}
          strokeDasharray={chart.dash}
        />
      </G>
    );
    cutEls.push(cutPanel);
    labels.push(<HeLabel key="cutname" x={xc} y={yTop - 19} text="cut" size={SIZE} w={BW} />);
    placed.push(boxAt(xc, yTop - 19, 'cut'));
    // Arrows where the cut crosses each member, on the free body: T pulls away, C pushes in.
    const roleName = { top: 'Top chord', bottom: 'Bottom chord', diagonal: 'Diagonal' } as const;
    (
      [
        ['top', cut.top],
        ['diagonal', cut.diagonal],
        ['bottom', cut.bottom],
      ] as const
    ).forEach(([role, k]) => {
      const shown = shownForce(k);
      if (!shown) return;
      const m = model.members[k]!;
      const [a, b] = [model.joints[m.a]!, model.joints[m.b]!];
      const [la, rb] = a.x < b.x ? [a, b] : [b, a];
      const t = (cut.x - la.x) / (rb.x - la.x);
      const [px, py] = [X(la.x + (rb.x - la.x) * t), Y(la.y + (rb.y - la.y) * t)];
      const L = Math.hypot(X(rb.x) - X(la.x), Y(rb.y) - Y(la.y));
      const [ux, uy] = [(X(rb.x) - X(la.x)) / L, (Y(rb.y) - Y(la.y)) / L];
      const col = signColor(shown.F);
      const [p, q] = shown.F > 0 ? [-6, 20] : [20, -6];
      cutEls.push(
        <Arrow
          key={`ca${k}`}
          x1={px + ux * p}
          y1={py + uy * p}
          x2={px + ux * q}
          y2={py + uy * q}
          color={col}
          width={2.2}
        />,
      );
      const letter = shown.F > 0 ? 'T' : 'C';
      const id = k === cut.chord ? spec.cut!.F : k === cut.diagonal ? spec.cut!.Fd : undefined;
      const value = typeof id === 'string' ? valueLabel(id)! : `${fmt(Math.abs(shown.F))} ${fu}`;
      cutLines.push({ text: `${roleName[role]}: ${value} (${letter})`, color: col });
    });
    const C = model.joints[cut.centre]!;
    cutEls.push(
      <Circle
        key="centre"
        cx={X(C.x)}
        cy={Y(C.y)}
        r={10}
        fill="none"
        stroke={c.chartHighlight}
        strokeWidth={2}
      />,
    );
    const above = C.y > minY + 1e-9;
    const [qx, qy] = [X(C.x), Y(C.y)];
    place(
      'centreName',
      above
        ? [
            [qx + 22, qy - 12],
            [qx - 22, qy - 12],
            [qx + 24, qy + 18],
          ]
        : [
            [qx + 22, qy + 18],
            [qx - 22, qy + 18],
            [qx + 24, qy - 10],
          ],
      C.name,
      c.chartHighlight,
    );
  }

  // ── The angle ──
  if (spec.angle) {
    const ji = model.joints.findIndex((J) => J.name === spec.angle!.joint);
    const fi = model.joints.findIndex((J) => J.name === spec.angle!.from);
    const ti = model.joints.findIndex((J) => J.name === spec.angle!.to);
    if (ji >= 0 && fi >= 0 && ti >= 0) {
      const [J, F, T] = [model.joints[ji]!, model.joints[fi]!, model.joints[ti]!];
      const a1 = Math.atan2(-(Y(F.y) - Y(J.y)), X(F.x) - X(J.x));
      const a2 = Math.atan2(-(Y(T.y) - Y(J.y)), X(T.x) - X(J.x));
      const R = 26;
      const pt = (a: number, rr: number): [number, number] => [
        X(J.x) + rr * Math.cos(a),
        Y(J.y) - rr * Math.sin(a),
      ];
      const [p1, p2] = [pt(a1, R), pt(a2, R)];
      const sweep = (a2 - a1 + 2 * Math.PI) % (2 * Math.PI) < Math.PI ? 0 : 1;
      labels.push(
        <Path
          key="arc"
          d={`M ${p1[0]} ${p1[1]} A ${R} ${R} 0 0 ${sweep} ${p2[0]} ${p2[1]}`}
          stroke={c.chartInk}
          strokeWidth={1.4}
          fill="none"
        />,
      );
      const v = spec.angle.value;
      const deg = (Math.abs(a2 - a1) * 180) / Math.PI;
      const text =
        typeof v === 'string' ? (rep.known(v) ? valueLabel(v)! : undefined) : `θ = ${fmt(deg)}°`;
      const mid = (a1 + a2) / 2;
      const [lx, ly] = pt(mid, R + 10);
      if (text) place('angle', [[lx + labelW(text) / 2, ly + 4]], text);
    }
  }

  // ── The deflected joint ──
  const deflectEls: ReactNode[] = [];
  if (deflect && spec.deflect) {
    const id = spec.deflect.delta;
    const show = typeof id !== 'string' || rep.known(id);
    const J = model.joints[deflect.j]!;
    const drop = 22;
    const moved = (k: number) => (k === deflect.j ? drop : 0);
    model.members.forEach((m, k) => {
      const [a, b] = [model.joints[m.a]!, model.joints[m.b]!];
      deflectEls.push(
        <Line
          key={`d${k}`}
          x1={X(a.x)}
          y1={Y(a.y) + moved(m.a)}
          x2={X(b.x)}
          y2={Y(b.y) + moved(m.b)}
          stroke={c.beamDeflect}
          strokeWidth={1.4}
          strokeDasharray={chart.dash}
        />,
      );
    });
    if (show) {
      const text = typeof id === 'string' ? valueLabel(id)! : `δ = ${fmt(deflect.delta)} mm`;
      place(
        'delta',
        [
          [X(J.x), Y(J.y) + drop + 22],
          [X(J.x), Y(J.y) + drop + 40],
        ],
        text,
        c.beamDeflect,
      );
    }
  }

  // ── Counts ──
  const countLines: { text: string; color?: string }[] = [];
  if (spec.counts) {
    const m = model.members.length;
    const j = model.joints.length;
    const rr = reactionCount(model);
    const label = (x: NumOrVar | undefined, sym: string, v: number) =>
      typeof x === 'string'
        ? rep.known(x)
          ? `${rep.variable(x).symbol} = ${rep.value(x, false)}`
          : undefined
        : `${sym} = ${v}`;
    const parts = [
      label(spec.counts.m, 'm', m),
      label(spec.counts.j, 'j', j),
      label(spec.counts.r, 'r', rr),
    ].filter(Boolean);
    if (parts.length) countLines.push({ text: parts.join('   ') });
  }

  // ── Layout: the drawing, then the lines under it ──
  const below = yBottom + 72;
  const lines = [...cutLines, ...countLines];
  const BH = below + lines.length * 18 + 4;

  return (
    <View>
      <Canvas aspect={BH / BW}>
        {({ w, h }) => (
          <Svg width={w} height={h}>
            <G transform={`scale(${w / BW})`}>
              {cutEls.slice(0, 1)}
              {deflectEls}
              {memberEls}
              {forceEls}
              {model.joints.map((J, i) => (
                <Gusset key={`g${i}`} x={X(J.x)} y={Y(J.y)} c={c} />
              ))}
              {supportEls}
              {reactionEls}
              {loadEls}
              {cutEls.slice(1)}
              {!model.panel
                ? model.joints.map((J, i) => {
                    // The joint's name, outside the truss.
                    const [x, y] = [X(J.x), Y(J.y)];
                    const dx = x - cx;
                    const dy = y - cy;
                    const d = Math.hypot(dx, dy) || 1;
                    const sup = model.supports.some((sp) => sp.j === i);
                    // Beside a joint a load comes into from above.
                    const side =
                      sup || model.loads.some((l) => l.j === i && l.dir === 'down' && J.y > minY);
                    const tx = side ? x + (dx < 0 ? -14 : 14) : x + (dx / d) * 16;
                    const ty = side ? y - 6 : y + (dy / d) * 16 + 4 - (dy < 0 ? 4 : 0);
                    return (
                      <HeLabel key={`n${i}`} x={tx} y={ty} text={J.name} chip={false} w={BW} />
                    );
                  })
                : null}
              {labels}
              {lines.map((t, i) => (
                <HeLabel
                  key={`line${i}`}
                  x={BW / 2}
                  y={below + i * 18 + 6}
                  text={t.text}
                  color={t.color}
                  chip={false}
                  w={BW}
                />
              ))}
            </G>
          </Svg>
        )}
      </Canvas>
      <Caption>{captionOf()}</Caption>
    </View>
  );

  function captionOf(): string {
    const out: string[] = [];
    const lu2 = `${fu}·${lu}`;
    if (!sol.ok) {
      const m = model!.members.length;
      const j = model!.joints.length;
      const rr = reactionCount(model!);
      out.push(
        sol.why === 'indeterminate'
          ? `m + r − 2j = ${m} + ${rr} − ${2 * j} = ${m + rr - 2 * j}: one more unknown than the joints give, so the forces need the members’ stiffness too.`
          : `m + r − 2j = ${m} + ${rr} − ${2 * j} = ${m + rr - 2 * j}: too few members or supports; the truss would move.`,
      );
      return out.join(' · ');
    }
    if (spec.counts) {
      const m = model!.members.length;
      const j = model!.joints.length;
      const rr = reactionCount(model!);
      out.push(
        `m + r − 2j = ${m} + ${rr} − ${2 * j} = ${m + rr - 2 * j}: statically determinate, so the joints alone give every force.`,
      );
    }
    if (cut && model!.panel) {
      const h = model!.panel.h;
      const C = model!.joints[cut.centre]!;
      const F = Math.abs(sol.forces[cut.chord]!);
      const fd = Math.abs(sol.forces[cut.diagonal]!);
      out.push(
        `ΣM about ${C.name} = 0: F × h = M, so ${fmt(F)} × ${fmt(h)} = ${fmt(Math.abs(cut.M))} ${lu2}.`,
      );
      out.push(
        `ΣF_y = 0 on the free body: F_d sin θ = V, so ${fmt(fd)} × sin ${fmt(cut.theta)}° = ${fmt(Math.abs(cut.V))} ${fu}.`,
      );
    } else if (!spec.counts) {
      const R = sol.reactions.map((x) => fmt(x.ry)).join(' + ');
      const P = model!.loads.reduce((t, l) => t - l.fy, 0);
      out.push(`ΣF_y = 0: ${R} = ${fmt(P)} ${fu}, the load.`);
      out.push('Every joint balances. T pulls on its joints, C pushes on them.');
    }
    if (model!.panel && !spec.counts && sol.forces.some((f) => f === 0))
      out.push('The dashed 0 member meets an unloaded joint where nothing else can balance it.');
    if (deflect) {
      out.push(
        `δ = ΣFfL ÷ (AE) = ${fmt(deflect.sum)} ${lu2} ÷ (AE) = ${fmt(deflect.delta)} mm, f from a load of 1 at ${model!.joints[deflect.j]!.name}. The dashed shape is drawn far bigger than life.`,
      );
    }
    return out.join(' · ');
  }
}

/** One bar element: its two nodes, θ, node 2's move (Δu, Δv) and δ, the part along the bar. */
function TrussElement({ spec, calc }: { spec: TrussSpec; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  const valueLabel = useValueLabel(calc);
  const e = spec.element!;
  const get = (x: NumOrVar | undefined) =>
    x === undefined ? undefined : typeof x === 'number' ? x : rep.known(x) ? rep.val(x) : undefined;
  const label = (x: NumOrVar | undefined, sym: string, v: number | undefined, unit: string) =>
    typeof x === 'string'
      ? valueLabel(x)
      : v === undefined
        ? undefined
        : `${sym} = ${fmt(v)} ${unit}`;
  const theta = get(e.theta) ?? 0;
  const [du, dv] = [get(e.du), get(e.dv)];
  const t = (theta * Math.PI) / 180;
  const [cs, sn] = [Math.cos(t), Math.sin(t)];
  const moved = du !== undefined && dv !== undefined;
  const delta = moved ? elementStretch(du, dv, theta) : undefined;
  const mag = moved ? Math.hypot(du, dv) : 0;
  // Node 2's move drawn 52 px long; the bar as long as the canvas allows.
  const k = mag > 0 ? 52 / mag : 0;
  const [mu, mv] = moved ? [du * k, dv * k] : [0, 0];
  const along = (delta ?? 0) * k;
  // Points with node 1 at the origin, y up: the bar `b` px long, the moves in px.
  const pts = (b: number) => [
    [0, 0],
    [b * cs, b * sn],
    [b * cs + mu, b * sn + mv],
    [b * cs + along * cs, b * sn + along * sn],
  ];
  const span = (b: number, i: 0 | 1) => {
    const v = pts(b).map((p) => p[i]!);
    return [Math.min(...v), Math.max(...v)] as const;
  };
  // Room for labels at the sides and above; the pin and θ below.
  let len = 220;
  for (let n = 0; n < 40; n++) {
    const [x1, x2] = span(len, 0);
    const [y1, y2] = span(len, 1);
    if (x2 - x1 <= BW - 150 && y2 - y1 <= 220) break;
    len *= 0.92;
  }
  const [xmin, xmax] = span(len, 0);
  const [ymin, ymax] = span(len, 1);
  const top = 40;
  const BH = top + (ymax - ymin) + 62;
  const ox = (BW - (xmax - xmin)) / 2 - xmin;
  const oy = top + ymax;
  const P = (x: number, y: number) => [ox + x, oy - y] as const;
  const [n1x, n1y] = P(0, 0);
  const [n2x, n2y] = P(len * cs, len * sn);
  const [mx, my] = P(len * cs + mu, len * sn + mv);
  const [ux, uy] = P(len * cs + mu, len * sn);
  const [fx, fy] = P(len * cs + along * cs, len * sn + along * sn);
  const els: ReactNode[] = [];
  const placed: Box[] = [];
  const put = (
    key: string,
    spots: [number, number][],
    text: string | undefined,
    color?: string,
  ) => {
    if (!text) return;
    const spot =
      spots.find(
        ([x, y]) =>
          !placed.some((b) => hits(b, boxAt(x, y, text))) &&
          x - labelW(text) / 2 > 2 &&
          x + labelW(text) / 2 < BW - 2,
      ) ??
      spots.find(([x]) => x - labelW(text) / 2 > 2 && x + labelW(text) / 2 < BW - 2) ??
      spots[0]!;
    placed.push(boxAt(spot[0], spot[1], text));
    els.push(
      <HeLabel key={key} x={spot[0]} y={spot[1]} text={text} color={color} w={BW} size={SIZE} />,
    );
  };
  const half = (s: string | undefined) => (s ? labelW(s) / 2 : 0);
  // The element's number beside the bar's middle, node 2's beside the node: kept clear.
  const [bx, by] = [(n1x + n2x) / 2, (n1y + n2y) / 2];
  const [nx, ny] = [-sn, -cs];
  placed.push(boxAt(bx + nx * 18, by + ny * 18 + 4, '00'));
  placed.push(boxAt(n2x + nx * 18, n2y + ny * 18 + 4, '0'));
  // θ from the x axis at node 1.
  const R = 30;
  const thetaText = label(e.theta, 'θ', theta, '°');
  put(
    'theta',
    [
      [n1x + R + 8 + half(thetaText), n1y + 16],
      [n1x + R + 8 + half(thetaText), n1y - 8],
    ],
    thetaText,
  );
  if (moved && k > 0) {
    els.push(
      <Circle
        key="node2moved"
        cx={mx}
        cy={my}
        r={5}
        fill="none"
        stroke={c.beamDeflect}
        strokeWidth={1.6}
        strokeDasharray={chart.dashFine}
      />,
      <Line
        key="foot"
        x1={mx}
        y1={my}
        x2={fx}
        y2={fy}
        stroke={c.chartMuted}
        strokeDasharray={chart.dashFine}
      />,
    );
    if (Math.abs(mu) > 3)
      els.push(<Arrow key="du" x1={n2x} y1={n2y} x2={ux} y2={uy} color={c.trussTension} />);
    if (Math.abs(mv) > 3)
      els.push(<Arrow key="dv" x1={ux} y1={uy} x2={mx} y2={my} color={c.trussCompression} />);
    if (Math.abs(along) > 3)
      els.push(
        <Arrow key="delta" x1={n2x} y1={n2y} x2={fx} y2={fy} color={c.beamDeflect} width={3} />,
      );
    // The arrows are kept clear of the labels.
    for (const [x1, y1, x2, y2] of [
      [n2x, n2y, ux, uy],
      [ux, uy, mx, my],
      [n2x, n2y, fx, fy],
    ])
      placed.push({
        x1: Math.min(x1!, x2!) - 4,
        y1: Math.min(y1!, y2!) - 4,
        x2: Math.max(x1!, x2!) + 4,
        y2: Math.max(y1!, y2!) + 4,
      });
    const duText = label(e.du, 'Δu', du, 'mm');
    put(
      'dul',
      [
        [(n2x + ux) / 2, n2y + (mv > 0 ? 18 : -10)],
        [(n2x + ux) / 2, n2y + (mv > 0 ? -10 : 18)],
        [n2x - (mu >= 0 ? 1 : -1) * (14 + half(duText)), n2y + 18],
        [n2x + (mu >= 0 ? 1 : -1) * half(duText), n2y + 34],
      ],
      duText,
      c.trussTension,
    );
    const dvText = label(e.dv, 'Δv', dv, 'mm');
    const side = mu >= 0 ? 1 : -1;
    put(
      'dvl',
      [
        [ux + side * (10 + half(dvText)), (uy + my) / 2 + 4],
        [ux - side * (10 + half(dvText)), (uy + my) / 2 + 4],
        [ux - side * half(dvText), Math.min(uy, my) - 10],
        [ux - side * half(dvText), Math.max(uy, my) + 18],
      ],
      dvText,
      c.trussCompression,
    );
    const dText = label(e.delta, 'δ', delta, 'mm');
    // Beyond δ's tip along the bar, or beside it.
    const [tx, ty] = [fx + cs * 12, fy - sn * 12];
    put(
      'dl',
      [
        [tx + (cs >= 0 ? 1 : -1) * half(dText), ty + 4],
        [fx - nx * 18, fy - ny * 18 + 4],
        [fx + nx * 18, fy + ny * 18 + 4],
        [tx, ty - 14],
        [Math.min(BW - 4 - half(dText), Math.max(4 + half(dText), fx)), Math.min(fy, my) - 18],
      ],
      dText,
      c.beamDeflect,
    );
  }
  const Lt = label(e.L, 'L', get(e.L), spec.units?.length ?? 'm');
  put(
    'L',
    [
      [bx - nx * 22, by - ny * 22 + 4],
      [bx + nx * 40, by + ny * 40 + 4],
    ],
    Lt,
  );
  const fdisp = (() => {
    const [A, E, L] = [get(e.A), get(e.E), get(e.L)];
    if (delta === undefined || A === undefined || E === undefined || !L) return undefined;
    return (A * E * delta) / (L * 1000);
  })();
  const caption: string[] = [];
  if (delta !== undefined && du !== undefined && dv !== undefined) {
    caption.push(
      `δ = Δu cos θ + Δv sin θ = ${fmt(du)} cos ${fmt(theta)}° + ${fmt(dv)} sin ${fmt(theta)}° = ${fmt(delta)} mm.`,
    );
    if (fdisp !== undefined)
      caption.push(
        `f = (AE ÷ L)δ = ${fmt(fdisp)} kN; σ = f ÷ A = ${fmt((fdisp * 1000) / get(e.A)!)} MPa.`,
      );
    const L = get(e.L);
    if (L)
      caption.push(`Node 2’s move is drawn ${fmt(k / (len / (L * 1000)))} times the bar’s scale.`);
  } else caption.push('Type node 2’s moves Δu and Δv to draw them.');
  return (
    <View>
      <Canvas aspect={BH / BW}>
        {({ w, h }) => (
          <Svg width={w} height={h}>
            <G transform={`scale(${w / BW})`}>
              <Line
                x1={n1x}
                y1={n1y}
                x2={n1x + R + 34}
                y2={n1y}
                stroke={c.chartMuted}
                strokeDasharray={chart.dashFine}
              />
              <Path
                d={`M ${n1x + R} ${n1y} A ${R} ${R} 0 0 0 ${n1x + R * cs} ${n1y - R * sn}`}
                stroke={c.chartInk}
                fill="none"
                strokeWidth={1.4}
              />
              <SupportGlyph x={n1x} y={n1y + 6} kind="pin" />
              <SteelMember x1={n1x} y1={n1y} x2={n2x} y2={n2y} c={c} />
              <Gusset x={n1x} y={n1y} c={c} />
              <Gusset x={n2x} y={n2y} c={c} />
              {/* The element's number, circled, and the two nodes'. */}
              <Circle
                cx={bx + nx * 18}
                cy={by + ny * 18}
                r={10}
                fill={c.card}
                stroke={c.chartInk}
              />
              <HeLabel x={bx + nx * 18} y={by + ny * 18 + 4} text="1" chip={false} w={BW} />
              <HeLabel x={n1x - 18} y={n1y - 6} text="1" chip={false} w={BW} />
              <HeLabel x={n2x + nx * 18} y={n2y + ny * 18 + 4} text="2" chip={false} w={BW} />
              {els}
            </G>
          </Svg>
        )}
      </Canvas>
      <Caption>{caption.join(' · ')}</Caption>
    </View>
  );
}

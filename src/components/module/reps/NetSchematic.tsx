import { Fragment, type ReactElement } from 'react';
import { View } from 'react-native';
import Svg, { Circle, G, Line, Path, Rect, TSpan } from 'react-native-svg';

import type { CircuitNet, CircuitNetSpec, NetElement } from '@/data/modules/typesHe1h';
import { subscriptRuns } from '@/engine/subscripts';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, Caption, ChartText, useRep } from './common';
import { arrowHead } from './graphKit';
import { CurvedArrow } from './hs3aKit';
import { formulaOnly, sig } from './hskKit';
import { layoutNet, type Drawing, type Pt, type Slot, type Spot } from './netLayout';
import {
  DC,
  kindsOf,
  lowpassOf,
  netlistOf,
  siFactor,
  solveNet,
  type Netlist,
  type Solved,
} from './netMath';

const LINE = 16;
const SIZE = chart.label;
/** Each part's body along its wire. */
const BODY = { R: 40, L: 40, C: 10, V: 26, I: 26 } as const;
const UNIT = { R: 'Ω', C: 'F', L: 'H', V: 'V', I: 'A' } as const;

type Row = { text: string; color?: string };

/**
 * A passive circuit in textbook symbols (HC7), from `seriesCircuit` or `circuit` with `net`: a
 * zig-zag R, the plates of C, the coil of L, a circle source with + and − (V) or an arrow (I),
 * junction dots, ground. Each part carries its value, and the voltages, currents and charges the
 * page names; node voltages sit at their dots, mesh currents in circular arrows, branch currents
 * as arrows on their wires the way they really flow. A "?" reads "?" and draws no arrow. The
 * caption sums KCL at the junctions and KVL round the loops with the page's numbers. Flat.
 */
export function NetSchematic({ spec, calc }: { spec: CircuitNetSpec; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  const net: CircuitNet = spec.net;
  const list = netlistOf(net);
  const known = (x: NetElement['id']) => typeof x !== 'string' || rep.known(x);
  /** A value in SI units, or undefined while it is "?". */
  const si = (x: NetElement['id']): number | undefined => {
    if (x === undefined) return undefined;
    if (typeof x === 'number') return x;
    return rep.known(x) ? rep.val(x) * siFactor(rep.variable(x).unit) : undefined;
  };
  const sym = (id: string) => rep.variable(id).symbol;

  // The current a part's block names: its own, or the branch current on its wire.
  const branchOf = new Map<number, string>();
  // (A single loop's current goes on its circular arrow instead.)
  const loop = ['series', 'rc', 'rl', 'rlc'].includes(net.topology);
  (loop ? [] : (net.branches ?? [])).forEach((id, k) => {
    const el = list.edges[list.branchAt[k]!]?.el;
    if (el !== undefined && el >= 0 && !net.elements[el]?.i) branchOf.set(el, id);
  });
  const currentOf = (el: number) => net.elements[el]?.i ?? branchOf.get(el);

  const nameOf = (e: NetElement) =>
    e.name ?? (typeof e.id === 'string' ? sym(e.id) : e.kind === 'V' ? 'V' : e.kind);
  const mainRow = (e: NetElement): string =>
    typeof e.id === 'string'
      ? rep.label(e.id)
      : typeof e.id === 'number'
        ? `${nameOf(e)} = ${sig(e.id)} ${UNIT[e.kind]}`
        : nameOf(e);
  const rowsOf = (slot: Slot): Row[] => {
    if (slot.el === 'short') return [];
    if (slot.el === 'r') return [{ text: label(net.internal!.r, 'r', 'Ω') }];
    if (slot.el === 'eqV') return [{ text: rep.label(net.equivalent!.v) }];
    if (slot.el === 'eqR') return [{ text: rep.label(net.equivalent!.r) }];
    const e = net.elements[slot.el]!;
    if (slot.nameOnly) return [{ text: nameOf(e) }];
    if (net.topology === 'element')
      return [e.v, e.p].flatMap((id) => (id ? [{ text: rep.label(id) }] : []));
    const rows: Row[] = [{ text: mainRow(e) }];
    if (net.topology === 'bridge' && slot.el === 4)
      rows.push({ text: 'gauge', color: c.chartMuted });
    const cur = currentOf(slot.el);
    for (const [id, color] of [
      [e.q, c.chartInk],
      [e.v, c.chartInk],
      [cur, c.chartHighlight],
      [e.p, c.chartInk],
    ] as const)
      if (id) rows.push({ text: rep.label(id), color });
    return rows;
  };
  const label = (x: NetElement['id'], name: string, unit: string) =>
    typeof x === 'string' ? rep.label(x) : `${name} = ${x === undefined ? '?' : sig(x)} ${unit}`;

  // The top margin holds the tallest block above a top wire.
  const probe = layoutNet(net, 358, 1);
  const above = Math.max(
    1,
    ...probe.slots.filter((s) => s.spot?.at === 'above').map((s) => rowsOf(s).length),
  );

  return (
    <View>
      <Canvas aspect={(w) => layoutNet(net, w, above).height / w}>
        {({ w, h }) => {
          const d = layoutNet(net, w, above);
          return (
            <Svg width={w} height={h}>
              {d.boxes.map((b, i) => (
                <Rect
                  key={`box${i}`}
                  x={b.x}
                  y={b.y}
                  width={b.w}
                  height={b.h}
                  rx={b.r ?? 0}
                  fill="none"
                  stroke={c.chartMuted}
                  strokeWidth={chart.strokeLight}
                  strokeDasharray={chart.dash}
                />
              ))}
              {d.wires.map((pts, i) => (
                <Path
                  key={`w${i}`}
                  d={pts.map((p, j) => `${j ? 'L' : 'M'} ${p.x} ${p.y}`).join(' ')}
                  stroke={c.chartInk}
                  strokeWidth={chart.stroke}
                  strokeLinecap="round"
                  fill="none"
                />
              ))}
              {d.switchAt ? <Switch a={d.switchAt.a} b={d.switchAt.b} w={w} /> : null}
              {d.slots.map((s, i) => (
                <Part key={`p${i}`} slot={s} net={net} />
              ))}
              {d.slots.map((s, i) => (typeof s.el === 'number' ? flow(s, i) : null))}
              {d.dots.map((p, i) => (
                <Circle key={`d${i}`} cx={p.p.x} cy={p.p.y} r={3.5} fill={c.chartInk} />
              ))}
              {d.terminals.map((t, i) => (
                <G key={`t${i}`}>
                  <Circle
                    cx={t.p.x}
                    cy={t.p.y}
                    r={4.5}
                    fill={c.card}
                    stroke={c.chartInk}
                    strokeWidth={chart.stroke}
                  />
                  <Block spot={t.spot} rows={[{ text: t.letter }]} w={w} />
                </G>
              ))}
              {d.grounds.map((g, i) => (
                <Ground key={`g${i}`} p={g} />
              ))}
              {d.meshes.map((m, i) => {
                const id =
                  m.k >= 0
                    ? (net.meshes?.[m.k] ?? (loop ? net.branches?.[0] : undefined))
                    : undefined;
                return (
                  <G key={`m${i}`}>
                    <CurvedArrow
                      cx={m.c.x}
                      cy={m.c.y}
                      r={14}
                      from={Math.PI * 0.75}
                      to={Math.PI * 0.75 - Math.PI * 1.6}
                      color={c.chartHighlight}
                      width={chart.stroke}
                      head={8}
                    />
                    {id ? (
                      <Block
                        spot={m.spot}
                        rows={[{ text: rep.label(id), color: c.chartHighlight }]}
                        w={w}
                      />
                    ) : null}
                  </G>
                );
              })}
              {d.slots.map((s, i) =>
                s.spot ? <Block key={`b${i}`} spot={s.spot} rows={rowsOf(s)} w={w} /> : null,
              )}
              {d.dots.map((p, i) => {
                const id =
                  p.node !== undefined
                    ? net.nodes?.[p.node]
                    : p.part !== undefined
                      ? net.parts?.[p.part]
                      : undefined;
                return id && p.spot ? (
                  <Block key={`n${i}`} spot={p.spot} rows={[{ text: rep.label(id) }]} w={w} />
                ) : null;
              })}
              {d.texts.map((t, i) => (
                <Block
                  key={`x${i}`}
                  spot={t.spot}
                  rows={[{ text: t.text, color: t.muted ? c.chartMuted : undefined }]}
                  w={w}
                  plain
                />
              ))}
              {d.meter ? <Meter c={d.meter.c} /> : null}
              {extras(d, w)}
            </Svg>
          );
        }}
      </Canvas>
      <Caption>{caption()}</Caption>
    </View>
  );

  /** A current's arrow on its part's lead, the way it flows; none while it is "?" or 0. */
  function flow(s: Slot, i: number) {
    if (typeof s.el !== 'number' || s.nameOnly) return null;
    const e = net.elements[s.el]!;
    if (net.topology === 'element' || e.kind === 'I') return null;
    const id = currentOf(s.el);
    if (!id || !rep.known(id)) return null;
    const x = rep.val(id);
    if (x === 0) return null;
    const len = Math.hypot(s.b.x - s.a.x, s.b.y - s.a.y) || 1;
    const u = { x: (s.b.x - s.a.x) / len, y: (s.b.y - s.a.y) / len };
    const half = BODY[e.kind] / 2;
    // The middle of the lead on the side the current leaves by.
    const t = x > 0 ? (3 * len) / 4 + half / 2 : len / 4 - half / 2;
    const p = { x: s.a.x + u.x * t, y: s.a.y + u.y * t };
    const dir = x > 0 ? u : { x: -u.x, y: -u.y };
    return (
      <Path
        key={`f${i}`}
        d={arrowHead(p.x + dir.x * 5, p.y + dir.y * 5, dir.x, dir.y, 11)}
        fill={c.chartHighlight}
      />
    );
  }

  /** The lines a topology adds: the element's current, the filter, V_out, the totals. */
  function extras(d: Drawing, w: number) {
    const spot = d.extra;
    const e0 = net.elements[0];
    if (net.topology === 'element' && spot && e0?.i) {
      const p = d.slots[0]!.a;
      return (
        <G>
          <Line
            x1={p.x}
            y1={p.y}
            x2={p.x}
            y2={p.y + 30}
            stroke={c.chartHighlight}
            strokeWidth={chart.stroke}
          />
          <Path d={arrowHead(p.x, p.y + 36, 0, 1, 11)} fill={c.chartHighlight} />
          <Block
            spot={spot}
            rows={[{ text: `${rep.label(e0.i)} into +`, color: c.chartHighlight }]}
            w={w}
          />
        </G>
      );
    }
    if (net.internal?.terminal && spot)
      return (
        <Block
          spot={spot}
          rows={[{ text: `${rep.label(net.internal.terminal)} across the terminals` }]}
          w={w}
        />
      );
    if (net.topology === 'lowpass' && spot && net.filter) {
      const f = net.filter;
      const rows: Row[] = [];
      if (f.cutoff) rows.push({ text: `cutoff ${rep.label(f.cutoff)}` });
      const at = f.frequency === undefined ? '' : `at ${label(f.frequency, 'f', 'Hz')}: `;
      const gains = [f.gain, f.db].flatMap((id) => (id ? [rep.label(id)] : []));
      if (gains.length) rows.push({ text: `${at}${gains.join(', ')}`, color: c.chartHighlight });
      return <Block spot={spot} rows={rows} w={w} />;
    }
    if (net.topology === 'bridge' && d.meter && net.bridge) {
      const b = net.bridge;
      const rows: Row[] = [];
      if (b.out) rows.push({ text: `${rep.label(b.out)} on the meter`, color: c.chartHighlight });
      rows.push({
        text: `${label(b.factor, 'GF', '')}, ${label(b.strain, 'ε', 'με')}`.replace(/ ,/g, ','),
      });
      return <Block spot={d.meter.spot} rows={rows} w={w} />;
    }
    if (net.total && spot)
      return <Block spot={spot} rows={[{ text: `equivalent ${rep.label(net.total)}` }]} w={w} />;
    return null;
  }

  /** KCL at the junctions and KVL round the loops, with the page's numbers. */
  function caption(): string {
    const P = net.topology;
    const lines: string[] = [];
    const values = list.edges.map((ed) =>
      si(ed.el < 0 ? net.internal?.r : net.elements[ed.el]!.id),
    );
    const all = values.every((x) => x !== undefined);
    const kinds = kindsOf(net, list);
    const s =
      DC.has(P) && all ? solveNet(list.nodes, list.edges, kinds, values as number[]) : undefined;
    const charge = net.elements.slice(1).every((e) => e.kind === 'C');
    const ampUnit = charge ? 'C' : 'A';
    if (s) lines.push(...kirchhoff(P, list, s, ampUnit));
    else if (DC.has(P))
      lines.push(
        'KCL: the currents into each junction add to 0. KVL: the rises round a loop equal its drops.',
      );
    const v = (id: string) => rep.value(id);
    const ok = (...xs: (NetElement['id'] | undefined)[]) =>
      xs.every((x) => x === undefined || known(x));
    const worked = (good: boolean, line: string) => (good ? [line] : formulaOnly([line]));
    const els = net.elements;
    if (P === 'thevenin' && net.equivalent) {
      const [Vs, R1, R2, RL] = els.map((e) => e.id);
      const { v: vt, r: rt } = net.equivalent;
      lines.push(
        ...worked(ok(Vs, R1, R2, vt), `${sym(vt)} = Vₛ R₂ ÷ (R₁ + R₂) = ${v(vt)}`),
        ...worked(ok(R1, R2, rt), `${sym(rt)} = R₁R₂ ÷ (R₁ + R₂), Vₛ shorted, = ${v(rt)}`),
      );
      const iL = currentOf(3);
      if (iL && typeof RL === 'string')
        lines.push(
          ...worked(
            ok(vt, rt, RL, iL),
            `${sym(iL)} = ${sym(vt)} ÷ (${sym(rt)} + ${sym(RL)}) = ${v(vt)} ÷ (${v(rt)} + ${v(RL)}) = ${v(iL)}`,
          ),
        );
    }
    if (P === 'superposition' && net.parts && net.nodes?.[0]) {
      const [a, b] = net.parts;
      const V = net.nodes[0];
      lines.push(
        ...worked(ok(a, b, V), `${sym(V)} = ${sym(a)} + ${sym(b)} = ${v(a)} + ${v(b)} = ${v(V)}`),
      );
    }
    if (P === 'norton') {
      const [Vt, Rt, In] = els.map((e) => e.id);
      if (typeof Vt === 'string' && typeof Rt === 'string' && typeof In === 'string')
        lines.push(
          ...worked(
            ok(Vt, Rt, In),
            `${sym(In)} = ${sym(Vt)} ÷ ${sym(Rt)} = ${v(Vt)} ÷ ${v(Rt)} = ${v(In)}`,
          ),
          'The same source seen from a and b: either form gives the load the same V and I.',
        );
    }
    if (P === 'element' && els[0]) {
      const e = els[0];
      const V = e.v ?? (typeof e.id === 'string' ? e.id : undefined);
      if (V && e.i && e.p) {
        const P0 = si(e.p);
        lines.push(
          ...worked(
            ok(V, e.i, e.p),
            `${sym(e.p)} = ${sym(V)}${sym(e.i)} = ${v(V)} × ${par(v(e.i))} = ${v(e.p)}`,
          ),
        );
        if (P0 !== undefined)
          lines.push(
            P0 < 0
              ? 'Negative: the element delivers power (a source).'
              : 'Positive: the element absorbs power (passive sign: current into +).',
          );
      }
    }
    if ((P === 'rc' || P === 'rl' || P === 'rlc') && els[0]?.kind === 'V') {
      const named = els.slice(1).filter((e) => e.v);
      if (typeof els[0].id === 'string' && named.length === els.length - 1)
        lines.push(
          ...worked(
            ok(els[0].id, ...named.map((e) => e.v)),
            `KVL now: ${sym(els[0].id)} = ${named.map((e) => sym(e.v!)).join(' + ')} = ${named.map((e) => v(e.v!)).join(' + ')} = ${v(els[0].id)}`,
          ),
        );
      lines.push(
        P === 'rc'
          ? 'The switch closes at t = 0; the capacitor’s voltage can’t jump, so it starts at its old value.'
          : P === 'rl'
            ? 'The switch closes at t = 0; the inductor’s current can’t jump, so it starts at its old value.'
            : 'The switch closes at t = 0; R, L and C share one current round the loop.',
      );
    }
    if (P === 'bridge' && net.bridge?.out) {
      const b = { ...net.bridge, out: net.bridge.out };
      const E = els[0]?.id;
      lines.push(
        ...worked(
          ok(E, b.factor, b.strain, b.out),
          `V_out = V_ex × GF × ε ÷ 4 = ${typeof E === 'string' ? v(E) : sig(E ?? NaN)} × ${typeof b.factor === 'string' ? v(b.factor) : sig(b.factor)} × ${typeof b.strain === 'string' ? v(b.strain) : sig(b.strain)} ÷ 4 = ${v(b.out)}`,
        ),
        'One gauge stretched: its R rises by ΔR = GF × ε × R and the bridge leaves balance.',
      );
    }
    if (P === 'lowpass' && net.filter) {
      const f = net.filter;
      const [R, C] = [els[1]?.id, els[2]?.id];
      const [Rs, Cs] = [si(R), si(C)];
      if (f.cutoff && Rs !== undefined && Cs !== undefined) {
        const lp = lowpassOf(Rs, Cs, si(f.frequency) ?? 0);
        lines.push(`f_c = 1 ÷ (2πRC) = ${sig(lp.fc)} Hz`);
        if (f.gain && si(f.frequency) !== undefined)
          lines.push(`|H| = 1 ÷ √(1 + (f ÷ f_c)²) = ${sig(lp.gain)}, or ${sig(lp.db)} dB`);
      } else lines.push('f_c = 1 ÷ (2πRC); |H| = 1 ÷ √(1 + (f ÷ f_c)²)');
    }
    if (P === 'twoLoop')
      lines.push(
        'Each arrow shows the way its current really flows; a negative value runs against its reference.',
      );
    return lines.join(' · ');
  }

  /** The KCL and KVL lines a DC circuit's caption shows. */
  function kirchhoff(P: string, l: Netlist, s: Solved, base: string): string[] {
    const out: string[] = [];
    const nodeName = (n: number) => {
      const k = l.nodeAt.indexOf(n);
      const id = k >= 0 ? net.nodes?.[k] : undefined;
      return id ? sym(id) : 'the junction';
    };
    const kcl = [
      'parallel',
      'twoNode',
      'twoLoop',
      'superposition',
      'thevenin',
      'seriesParallel',
      'parallelSeries',
    ];
    if (kcl.includes(P))
      for (let n = 1; n < l.nodes; n++) {
        const touching = l.edges
          .map((ed, k) => ({ ed, k }))
          .filter(({ ed }) => ed.a === n || ed.b === n);
        if (touching.length < 3) continue;
        const into = touching.map(({ ed, k }) => (ed.b === n ? s.i[k]! : -s.i[k]!));
        const ins = into.filter((x) => x > 1e-15);
        const outs = into.filter((x) => x < -1e-15).map((x) => -x);
        const [f, unit] = prefix(Math.max(...ins, ...outs), base);
        out.push(
          `KCL at ${nodeName(n)}: ${ins.map((x) => sig(x / f)).join(' + ')} = ${outs.map((x) => sig(x / f)).join(' + ')} ${unit} (in = out)`,
        );
      }
    if (P === 'supernode') {
      const [f, unit] = prefix(Math.max(Math.abs(s.i[0]!), 1e-30), base);
      out.push(
        `KCL round the supernode: ${sig(s.i[0]! / f)} = ${sig(s.i[1]! / f)} + ${sig(s.i[3]! / f)} ${unit}`,
        `${sym(net.nodes?.[0] ?? '') || 'V₁'} − ${sym(net.nodes?.[1] ?? '') || 'V₂'} = ${sig(s.v[1]!)} − ${sig(s.v[2]!)} = ${sig(s.v[1]! - s.v[2]!)} V, the source between them`,
      );
    }
    const kvl = ['series', 'twoMesh', 'twoLoop', 'seriesParallel', 'parallelSeries'];
    if (kvl.includes(P))
      l.loops.forEach((loop, j) => {
        const drops = loop.map(([k, dir]) => dir * (s.v[l.edges[k]!.a]! - s.v[l.edges[k]!.b]!));
        const rises = drops.filter((x) => x < -1e-12).map((x) => -x);
        const falls = drops.filter((x) => x > 1e-12);
        if (!rises.length || !falls.length) return;
        const [f, unit] = prefix(Math.max(...rises, ...falls), 'V');
        const where = l.loops.length > 1 ? `KVL round loop ${j + 1}` : 'KVL';
        out.push(
          `${where}: ${rises.map((x) => sig(x / f)).join(' + ')} = ${falls.map((x) => sig(x / f)).join(' + ')} ${unit} (rises = drops)`,
        );
      });
    return out;
  }
}

/** A signed number in brackets for multiplying: (−2 A). */
const par = (t: string) => (t.startsWith('−') ? `(${t})` : t);

/** The SI prefix that writes `x` (of unit `base`) with 1 to 3 digits before the point. */
function prefix(x: number, base: string): [number, string] {
  const steps: [number, string][] = [
    [1e6, 'M'],
    [1e3, 'k'],
    [1, ''],
    [1e-3, 'm'],
    [1e-6, 'μ'],
    [1e-9, 'n'],
    [1e-12, 'p'],
  ];
  const a = Math.abs(x);
  const found = steps.find(([f]) => a >= f * 0.9999) ?? steps[steps.length - 1]!;
  // Volts and amps past a thousand stay in the base unit on these pages.
  if (found[0] > 1 && base !== 'Ω') return [1, base];
  return [found[0], `${found[1]}${base}`];
}

/** One part on its wire: the leads and the symbol between them. */
export function Part({ slot, net }: { slot: Slot; net: CircuitNet }) {
  const c = usePalette();
  const { a, b } = slot;
  const len = Math.hypot(b.x - a.x, b.y - a.y) || 1;
  const u = { x: (b.x - a.x) / len, y: (b.y - a.y) / len };
  const nrm = { x: -u.y, y: u.x };
  const m = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
  const at = (t: number, s = 0) => ({ x: m.x + u.x * t + nrm.x * s, y: m.y + u.y * t + nrm.y * s });
  const stroke = { stroke: c.chartInk, strokeWidth: chart.stroke, fill: 'none' as const };
  const lead = (half: number) => (
    <Path
      d={`M ${a.x} ${a.y} L ${at(-half).x} ${at(-half).y} M ${at(half).x} ${at(half).y} L ${b.x} ${b.y}`}
      {...stroke}
      strokeLinecap="round"
    />
  );
  if (slot.el === 'short')
    return <Line x1={a.x} y1={a.y} x2={b.x} y2={b.y} {...stroke} strokeLinecap="round" />;
  const kind =
    slot.el === 'r' || slot.el === 'eqR'
      ? 'R'
      : slot.el === 'eqV'
        ? 'V'
        : net.elements[slot.el]!.kind;
  const boxed = net.topology === 'element';
  const ac = net.topology === 'lowpass' && slot.el === 0;
  const gauge = net.topology === 'bridge' && slot.el === 4;
  if (boxed) {
    const [bw, bh] = [34, 64];
    return (
      <G>
        {lead(bh / 2)}
        <Rect
          x={m.x - bw / 2}
          y={m.y - bh / 2}
          width={bw}
          height={bh}
          rx={3}
          {...stroke}
          fill={c.card}
        />
      </G>
    );
  }
  const half = BODY[kind] / 2;
  let body: string;
  const extra: ReactElement[] = [];
  switch (kind) {
    case 'R': {
      const n = 6;
      const pts = [at(-half)];
      for (let i = 0; i < n; i++) pts.push(at(-half + (2 * half * (i + 0.5)) / n, i % 2 ? 7 : -7));
      pts.push(at(half));
      body = pts.map((p, i) => `${i ? 'L' : 'M'} ${p.x} ${p.y}`).join(' ');
      if (gauge) {
        const p = at(-16, 14);
        const q = at(16, -14);
        extra.push(
          <Line
            key="ga"
            x1={p.x}
            y1={p.y}
            x2={q.x}
            y2={q.y}
            {...stroke}
            strokeWidth={chart.strokeLight}
          />,
          <Path key="gh" d={arrowHead(q.x, q.y, q.x - p.x, q.y - p.y, 8)} fill={c.chartInk} />,
        );
      }
      break;
    }
    case 'C': {
      const [p1, p2] = [at(-half), at(half)];
      body = [p1, p2]
        .map(
          (p) =>
            `M ${p.x + nrm.x * 13} ${p.y + nrm.y * 13} L ${p.x - nrm.x * 13} ${p.y - nrm.y * 13}`,
        )
        .join(' ');
      break;
    }
    case 'L': {
      const n = 4;
      const step = (2 * half) / n;
      let dd = `M ${at(-half).x} ${at(-half).y}`;
      for (let i = 0; i < n; i++) {
        const p = at(-half + step * i, -11);
        const q = at(-half + step * (i + 1), -11);
        const e = at(-half + step * (i + 1));
        dd += ` C ${p.x} ${p.y} ${q.x} ${q.y} ${e.x} ${e.y}`;
      }
      body = dd;
      break;
    }
    case 'V':
    case 'I': {
      body = '';
      extra.push(<Circle key="o" cx={m.x} cy={m.y} r={half} {...stroke} fill={c.card} />);
      if (kind === 'I') {
        const p = at(-8);
        const q = at(9);
        extra.push(
          <Line key="ia" x1={p.x} y1={p.y} x2={at(3).x} y2={at(3).y} {...stroke} />,
          <Path key="ih" d={arrowHead(q.x, q.y, u.x, u.y, 8)} fill={c.chartInk} />,
        );
      } else if (ac) {
        const pts = Array.from({ length: 17 }, (_, i) => {
          const t = -8 + i;
          const p = at(0, 0);
          // A sine across the circle, drawn upright whatever the wire's direction.
          return { x: p.x + t, y: p.y - 5 * Math.sin((Math.PI * t) / 8) };
        });
        extra.push(
          <Path
            key="ac"
            d={pts.map((p, i) => `${i ? 'L' : 'M'} ${p.x} ${p.y}`).join(' ')}
            {...stroke}
            strokeWidth={chart.strokeLight}
          />,
        );
      } else {
        const plus = at(6.5);
        const minus = at(-6.5);
        extra.push(
          <Path
            key="pl"
            d={`M ${plus.x - 4} ${plus.y} L ${plus.x + 4} ${plus.y} M ${plus.x} ${plus.y - 4} L ${plus.x} ${plus.y + 4}`}
            {...stroke}
            strokeWidth={1.6}
          />,
          <Path
            key="mi"
            d={`M ${minus.x - 4} ${minus.y} L ${minus.x + 4} ${minus.y}`}
            {...stroke}
            strokeWidth={1.6}
          />,
        );
      }
      break;
    }
  }
  return (
    <G>
      {lead(half)}
      {body ? <Path d={body} {...stroke} strokeLinejoin="round" strokeLinecap="round" /> : null}
      {extra.map((x, i) => (
        <Fragment key={i}>{x}</Fragment>
      ))}
    </G>
  );
}

/**
 * A label's symbol (italic) and the rest (upright) as spans, each "_" subscript (R_Th, V_out,
 * I_N) drawn small and lowered, never as a raw underscore.
 */
function typeset([symbol, rest]: [string, string]) {
  const runs = [
    ...subscriptRuns(symbol).map((x) => ({ ...x, it: true })),
    ...subscriptRuns(rest).map((x) => ({ ...x, it: false })),
  ].filter((x) => x.s !== '');
  const drop = SIZE * 0.3;
  return runs.map((x, i) => {
    const before = i > 0 && !!runs[i - 1]!.sub;
    const dy = x.sub && !before ? drop : !x.sub && before ? -drop : 0;
    return (
      <TSpan
        key={i}
        dy={dy}
        fontSize={x.sub ? SIZE * 0.75 : SIZE}
        fontStyle={x.it ? 'italic' : 'normal'}
      >
        {x.s}
      </TSpan>
    );
  });
}

/** A block of label lines at a spot, kept inside the canvas; a symbol before " = " in italics. */
function Block({ spot, rows, w, plain }: { spot: Spot; rows: Row[]; w: number; plain?: boolean }) {
  const c = usePalette();
  if (!rows.length) return null;
  const n = rows.length;
  const first =
    spot.at === 'center'
      ? spot.y + 4 - ((n - 1) * LINE) / 2
      : spot.at === 'above'
        ? spot.y - (n - 1) * LINE
        : spot.y;
  return (
    <G>
      {rows.map((r, i) => {
        const width = r.text.length * SIZE * 0.58;
        const lo = spot.anchor === 'start' ? 4 : spot.anchor === 'end' ? 4 + width : 4 + width / 2;
        const hi =
          spot.anchor === 'start'
            ? w - 4 - width
            : spot.anchor === 'end'
              ? w - 4
              : w - 4 - width / 2;
        const x = Math.max(lo, Math.min(hi, spot.x));
        const cut = plain ? -1 : r.text.indexOf(' = ');
        return (
          <ChartText
            key={i}
            x={x}
            y={first + i * LINE}
            textAnchor={spot.anchor}
            fontSize={SIZE}
            fontWeight="600"
            fill={r.color ?? c.chartInk}
            halo={c.card}
          >
            {typeset(cut > 0 ? [r.text.slice(0, cut), r.text.slice(cut)] : ['', r.text])}
          </ChartText>
        );
      })}
    </G>
  );
}

/** A ground: three bars under the wire. */
export function Ground({ p }: { p: Pt }) {
  const c = usePalette();
  const s = { stroke: c.chartInk, strokeWidth: chart.stroke, strokeLinecap: 'round' as const };
  return (
    <G>
      <Line x1={p.x} y1={p.y} x2={p.x} y2={p.y + 8} {...s} />
      {[0, 1, 2].map((i) => (
        <Line
          key={i}
          x1={p.x - 10 + 3 * i}
          y1={p.y + 8 + 4 * i}
          x2={p.x + 10 - 3 * i}
          y2={p.y + 8 + 4 * i}
          {...s}
        />
      ))}
    </G>
  );
}

/** The switch: a blade from its hinge to the contact, closed at t = 0 (the arrow says when). */
function Switch({ a, b, w }: { a: Pt; b: Pt; w: number }) {
  const c = usePalette();
  const s = { stroke: c.chartInk, strokeWidth: chart.stroke, strokeLinecap: 'round' as const };
  return (
    <G>
      <Circle cx={a.x} cy={a.y} r={3} fill={c.chartInk} />
      <Circle cx={b.x} cy={b.y} r={3} fill={c.card} stroke={c.chartInk} strokeWidth={1.5} />
      <Line x1={a.x} y1={a.y} x2={b.x - 3} y2={b.y - 2} {...s} />
      <CurvedArrow
        cx={a.x}
        cy={a.y}
        r={(b.x - a.x) * 0.75}
        from={Math.PI * 0.42}
        to={Math.PI * 0.12}
        color={c.chartMuted}
        width={1.5}
        head={7}
      />
      <Block
        spot={{ x: (a.x + b.x) / 2, y: a.y - 26, anchor: 'middle', at: 'above' }}
        rows={[{ text: 't = 0', color: c.chartMuted }]}
        w={w}
      />
    </G>
  );
}

/** The bridge's voltmeter between its middle nodes, + on the right. */
function Meter({ c: p }: { c: Pt }) {
  const c = usePalette();
  const s = { stroke: c.chartInk, strokeWidth: chart.stroke };
  return (
    <G>
      <Circle cx={p.x} cy={p.y} r={14} {...s} fill={c.card} />
      <ChartText x={p.x} y={p.y + 5} textAnchor="middle" fontSize={chart.value} fontWeight="700">
        V
      </ChartText>
      <ChartText x={p.x + 22} y={p.y - 6} textAnchor="middle" fontSize={SIZE} fontWeight="700">
        +
      </ChartText>
      <ChartText x={p.x - 22} y={p.y - 6} textAnchor="middle" fontSize={SIZE} fontWeight="700">
        −
      </ChartText>
    </G>
  );
}

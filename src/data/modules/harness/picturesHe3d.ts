/**
 * Harness checks for the college round 3 group D pictures (docs/RENDERINGS_HE.md): HC48 code
 * traces and code cards, HC49 timing diagrams, HC50 graphs and graph cards. Test-only.
 */
import { TIME_UNITS } from '@/components/module/reps/he3dTime';
import {
  cheapestPath,
  degreesOf,
  dijkstra,
  leastHeight,
  planarGraph,
  prefixCode,
  treeLevels,
} from '@/components/module/reps/graphMath';
import { HERTZ, METRES, uartFrame } from '@/components/module/reps/timingMath';

import type { CardFigure, LayoutDef } from '../layouts';
import type { Representation } from '../types';
import type { NumOrVar } from '../typesGraphs';
import type { CodeTraceFigure, CodeTraceScene, GraphSpec, TimingDiagramSpec } from '../typesHe3d';
import { graphCardSize } from '../typesHe3d';

type Get = (x: NumOrVar) => number | undefined;
type UnitOf = (x: NumOrVar) => string | undefined;

/** Equal to 0.5% (values shown to 3–4 figures). */
const near = (a: number, b: number) =>
  Math.abs(a - b) <= 5e-3 * Math.max(Math.abs(a), Math.abs(b), 1e-30);

/** A reader of a spec's fields in base units by a unit table; undefined when absent or "?". */
function reader(get: Get, unitOf: UnitOf) {
  const v = (x: NumOrVar | undefined) => {
    if (x === undefined) return undefined;
    const n = get(x);
    return n === undefined || Number.isNaN(n) ? undefined : n;
  };
  const base = (x: NumOrVar | undefined, table: Record<string, number>) => {
    const n = v(x);
    if (n === undefined) return undefined;
    const u = x === undefined ? undefined : unitOf(x);
    return n * (u !== undefined && table[u] !== undefined ? table[u]! : 1);
  };
  return { v, base };
}

/** Group D's calculator pictures. */
export function he3dIssues(rep: Representation, get: Get, unitOf: UnitOf): string[] {
  switch (rep.kind) {
    case 'timingDiagram':
      return timingIssues(rep, get, unitOf);
    case 'graph':
      return graphIssues(rep, get, unitOf);
    default:
      return [];
  }
}

/** HC49: each bracket equals its value; the frame has the stated bit count. */
function timingIssues(s: TimingDiagramSpec, get: Get, unitOf: UnitOf): string[] {
  const out: string[] = [];
  const { v, base } = reader(get, unitOf);
  const t = (x: NumOrVar | undefined) => base(x, TIME_UNITS);
  const hz = (x: NumOrVar | undefined) => base(x, HERTZ);
  switch (s.mode) {
    case 'register': {
      const [tcq, tl, ts, T, f] = [t(s.tcq), t(s.tlogic), t(s.tsetup), t(s.period), hz(s.freq)];
      if (tcq !== undefined && tl !== undefined && ts !== undefined) {
        for (const x of [tcq, tl, ts])
          if (!(x > 0)) out.push(`register: a delay ${x} is not positive`);
        if (T !== undefined && T < tcq + tl + ts && !near(T, tcq + tl + ts)) {
          out.push(`register: the period ${T} is shorter than t_cq + t_logic + t_setup`);
        }
        if (T !== undefined && f !== undefined && !near(f * T, 1)) out.push(`register: f ≠ 1 ÷ T`);
      }
      break;
    }
    case 'timer': {
      const [fclk, N, ft, P, ticks, cmp, bits] = [
        hz(s.fclk),
        v(s.prescaler),
        hz(s.ftimer),
        t(s.period),
        v(s.ticks),
        v(s.compare),
        v(s.bits),
      ];
      if (fclk !== undefined && N !== undefined && ft !== undefined && !near(ft, fclk / N)) {
        out.push(`timer: f_t ${ft} ≠ f_clk ÷ N`);
      }
      if (P !== undefined && ft !== undefined && ticks !== undefined && !near(ticks, P * ft)) {
        out.push(`timer: the bracket's ${ticks} ticks ≠ P × f_t`);
      }
      if (ticks !== undefined && cmp !== undefined && !near(cmp, ticks - 1)) {
        out.push(`timer: compare ${cmp} ≠ ticks − 1`);
      }
      if (cmp !== undefined && bits !== undefined && cmp >= 2 ** bits) {
        out.push(`timer: compare ${cmp} is past a ${bits}-bit timer`);
      }
      break;
    }
    case 'pwm': {
      const [top, cmp, duty, f, fclk, N, vdd, vavg] = [
        v(s.top),
        v(s.compare),
        v(s.duty),
        hz(s.freq),
        hz(s.fclk),
        v(s.prescaler),
        v(s.vdd),
        v(s.vavg),
      ];
      if (top !== undefined && cmp !== undefined) {
        if (cmp > top + 1) out.push(`pwm: compare ${cmp} past TOP + 1`);
        if (duty !== undefined && !near(duty, (100 * cmp) / (top + 1))) {
          out.push(`pwm: the duty bracket ${duty}% ≠ compare ÷ (TOP + 1)`);
        }
      }
      if (top !== undefined && f !== undefined && fclk !== undefined && N !== undefined) {
        if (!near(f, fclk / (N * (top + 1)))) out.push(`pwm: f_PWM ≠ f_clk ÷ (N(TOP + 1))`);
      }
      if (vdd !== undefined && vavg !== undefined && (vavg < 0 || vavg > vdd)) {
        out.push(`pwm: V_avg ${vavg} outside 0 to V_DD`);
      }
      break;
    }
    case 'uart': {
      const [data, par, stop, frame, baud, time] = [
        v(s.dataBits),
        v(s.parity),
        v(s.stopBits),
        v(s.frame),
        hz(s.baud),
        t(s.time),
      ];
      if (data !== undefined && par !== undefined && stop !== undefined) {
        const cells = uartFrame(data, par, stop, s.byte ?? 0x4b);
        if (frame !== undefined && cells.length !== frame) {
          out.push(`uart: ${cells.length} bits drawn for a frame of ${frame}`);
        }
        if (baud !== undefined && time !== undefined && !near(time, cells.length / baud)) {
          out.push(`uart: the frame bracket ${cells.length} ÷ baud ≠ the time per byte`);
        }
        if (cells[0]!.bit !== 0 || cells[cells.length - 1]!.bit !== 1) {
          out.push('uart: a frame must start low and stop high');
        }
      }
      break;
    }
    case 'link': {
      const [L, R, dt, d, sp, dp, dq, total] = [
        v(s.L),
        hz(s.R),
        t(s.dt),
        base(s.d, METRES),
        v(s.s),
        t(s.dp),
        t(s.dq),
        t(s.total),
      ];
      if (L !== undefined && R !== undefined && dt !== undefined && !near(dt, (8 * L) / R)) {
        out.push(`link: the band's d_t ≠ 8L ÷ R`);
      }
      if (d !== undefined && sp !== undefined && dp !== undefined && !near(dp, d / sp)) {
        out.push(`link: the slope's d_p ≠ d ÷ s`);
      }
      if (dt !== undefined && dp !== undefined && total !== undefined) {
        if (!near(total, dt + dp + (dq ?? 0))) out.push('link: total ≠ d_t + d_p + d_q');
      }
      break;
    }
  }
  return out;
}

/** "32 <= 20" (or with <, >, >=, ==, ~=, !=) worked out; undefined when it isn't numbers. */
export function testHolds(text: string): boolean | undefined {
  const m = /^\s*(-?\d+(?:\.\d+)?)\s*(<=|>=|==|~=|!=|<|>)\s*(-?\d+(?:\.\d+)?)\s*$/.exec(text);
  if (!m) return undefined;
  const [a, b] = [Number(m[1]), Number(m[3])];
  switch (m[2]) {
    case '<=':
      return a <= b;
    case '>=':
      return a >= b;
    case '<':
      return a < b;
    case '>':
      return a > b;
    case '==':
      return a === b;
    default:
      return a !== b;
  }
}

/** HC50: degree sum = 2E, the drawn V and E, Euler's faces, the cheapest path's cost, tree and code sums. */
function graphIssues(s: GraphSpec, get: Get, unitOf: UnitOf): string[] {
  const out: string[] = [];
  const { v } = reader(get, unitOf);
  if (s.mode === 'tree') {
    const [n, hmin, h, most, leaves] = [v(s.n), v(s.hmin), v(s.h), v(s.most), v(s.leaves)];
    if (n !== undefined && hmin !== undefined && n >= 1 && hmin !== leastHeight(n)) {
      out.push(`tree: h_min ${hmin} for ${n} nodes, drawn ${leastHeight(n)}`);
    }
    if (n !== undefined && n >= 1) {
      const levels = treeLevels(n, leastHeight(n) + 1);
      if (levels.reduce((a, b) => a + b, 0) !== Math.round(n)) out.push(`tree: levels miss nodes`);
    }
    if (h !== undefined && most !== undefined && !near(most, 2 ** (h + 1) - 1)) {
      out.push(`tree: most nodes ${most} ≠ 2^(h + 1) − 1`);
    }
    if (h !== undefined && leaves !== undefined && !near(leaves, 2 ** h)) {
      out.push(`tree: most leaves ${leaves} ≠ 2^h`);
    }
    return out;
  }
  if (s.mode === 'code') {
    const lengths = (s.lengths ?? []).map(v);
    const probs = (s.probs ?? []).map(v);
    if (lengths.some((l) => l === undefined)) return out;
    const ls = lengths as number[];
    const { kraft, codes } = prefixCode(ls);
    const K = v(s.kraft);
    if (K !== undefined && !near(K, kraft)) out.push(`code: Kraft sum ${K}, drawn ${kraft}`);
    if (codes) {
      for (let i = 0; i < codes.length; i++) {
        if (codes[i]!.length !== ls[i]) out.push(`code: codeword ${codes[i]} for length ${ls[i]}`);
        for (let j = 0; j < codes.length; j++) {
          if (i !== j && codes[j]!.startsWith(codes[i]!)) {
            out.push(`code: ${codes[i]} starts ${codes[j]}`);
          }
        }
      }
    }
    const L = v(s.L);
    if (L !== undefined && probs.every((p) => p !== undefined) && probs.length === ls.length) {
      const sum = probs.reduce((a, p, i) => a + p! * ls[i]!, 0);
      if (!near(L, sum)) out.push(`code: L ${L} ≠ Σ p l = ${sum}`);
    }
    return out;
  }
  const [V, E, sum, avg, F] = [v(s.V), v(s.E), v(s.degreeSum), v(s.average), v(s.F)];
  if (E !== undefined && sum !== undefined && !near(sum, 2 * E))
    out.push(`graph: degree sum ${sum} ≠ 2E`);
  if (V !== undefined && E !== undefined && avg !== undefined && !near(avg * V, 2 * E)) {
    out.push(`graph: average degree ${avg} ≠ 2E ÷ V`);
  }
  if (V !== undefined && E !== undefined && F !== undefined && !near(V - E + F, 2)) {
    out.push(`graph: V − E + F = ${V - E + F}, not 2`);
  }
  const fits =
    s.vertices &&
    s.edges &&
    (V === undefined || V === s.vertices.length) &&
    (E === undefined || E === s.edges.length);
  if (fits) {
    const names = s.vertices!.map((x) => x.name);
    for (const e of s.edges!) {
      if (!names.includes(e.from) || !names.includes(e.to)) {
        out.push(`graph: edge ${e.from}–${e.to} names no vertex`);
      }
    }
    const deg = degreesOf(names, s.edges!);
    const total = [...deg.values()].reduce((a, b) => a + b, 0);
    if (total !== 2 * s.edges!.length) out.push(`graph: drawn degree sum ${total} ≠ 2E`);
    if (s.best) {
      const costs = s.edges!.map((e) => (e.cost === undefined ? 1 : v(e.cost)));
      if (costs.every((c) => c !== undefined)) {
        const edges = s.edges!.map((e, i) => ({ from: e.from, to: e.to, cost: costs[i]! }));
        const best = cheapestPath(names, edges, s.best.from, s.best.to);
        const want = v(s.best.cost);
        if (!best) out.push(`graph: no path from ${s.best.from} to ${s.best.to}`);
        else if (want !== undefined && !near(best.cost, want)) {
          out.push(`graph: the lit path costs ${best.cost}, the page says ${want}`);
        }
      }
    }
  } else if (V !== undefined && E !== undefined) {
    const g = planarGraph(V, E);
    if (g) {
      if (g.pos.length !== V || g.edges.length !== E)
        out.push(`graph: drew ${g.pos.length}, ${g.edges.length}`);
      const keys = new Set(g.edges.map(([a, b]) => `${Math.min(a, b)}-${Math.max(a, b)}`));
      if (keys.size !== g.edges.length) out.push('graph: a repeated edge');
    }
  }
  return out;
}

/** A graph card: edges name vertices, vertices apart, Dijkstra labels right, a degree list matches. */
export function graphCardIssues(f: CardFigure, where: string): string[] {
  if (f.kind !== 'graph') return [];
  const out: string[] = [];
  const names = f.vertices.map((x) => x.name);
  for (const e of f.edges) {
    if (!names.includes(e.from) || !names.includes(e.to))
      out.push(`${where}: edge ${e.from}–${e.to}`);
  }
  const [w, h] = graphCardSize(f);
  const m = f.wide ? 16 : 11;
  const r = f.wide ? 10 : 8;
  const px = f.vertices.map((p) => [m + p.x * (w - 2 * m), m + p.y * (h - 2 * m)] as const);
  px.forEach((a, i) =>
    px.slice(i + 1).forEach((b, j) => {
      if (Math.hypot(a[0] - b[0], a[1] - b[1]) < 2 * r + 4) {
        out.push(`${where}: vertices ${names[i]} and ${names[i + 1 + j]} touch`);
      }
    }),
  );
  if (f.dist) {
    const src = Object.entries(f.dist).find(([, d]) => d === 0)?.[0];
    if (src) {
      const { dist } = dijkstra(
        names,
        f.edges.map((e) => ({ from: e.from, to: e.to, cost: e.cost ?? 1 })),
        src,
      );
      for (const [n, d] of Object.entries(f.dist)) {
        const want = dist.get(n);
        if (d !== '∞' && want !== undefined && Math.abs(want - d) > 1e-9) {
          out.push(`${where}: ${n} labelled ${d}, its distance is ${want}`);
        }
      }
    }
  }
  if (f.degrees) {
    const list = /^Degrees ([\d, ]+)$/.exec(where);
    if (list) {
      const said = list[1]!.split(/,\s*/).map(Number).sort();
      const deg = [...degreesOf(names, f.edges).values()].sort();
      if (said.join() !== deg.join()) out.push(`${where}: drawn degrees ${deg.join(', ')}`);
    }
  }
  return out;
}

/** A code trace scene: the lit lines exist and aren't blank, each row fills the table, the test agrees. */
export function codeTraceIssues(f: CodeTraceFigure, s: CodeTraceScene, where: string): string[] {
  const out: string[] = [];
  if (!f.matlab && !f.python) out.push(`codeTrace: no code`);
  const lit = (lines: string[] | undefined, n: number | undefined, lang: string) => {
    if (!lines || n === undefined) return;
    if (!(n >= 1 && n <= lines.length)) out.push(`${where}: ${lang} line ${n} is not in the code`);
    else if (!lines[n - 1]!.trim()) out.push(`${where}: ${lang} line ${n} is blank`);
  };
  lit(f.matlab, s.line, 'MATLAB');
  lit(f.python, s.pyLine ?? s.line, 'Python');
  if (s.rows.length === 0) out.push(`${where}: an empty variables table`);
  s.rows.forEach((r, i) => {
    if (r.length !== f.vars.length) {
      out.push(`${where}: row ${i} has ${r.length} values for ${f.vars.length} variables`);
    }
  });
  if (s.test) {
    const holds = testHolds(s.test.text);
    if (holds !== undefined && holds !== s.test.holds) {
      out.push(`${where}: the test ${s.test.text} is ${holds}, drawn ${s.test.holds}`);
    }
  }
  for (const line of [...(f.matlab ?? []), ...(f.python ?? [])]) {
    if (/[“”‘’]/.test(line)) out.push(`codeTrace: curly quotes in code: ${line}`);
    if (line.length > 40) out.push(`codeTrace: a line longer than 40 characters: ${line}`);
  }
  return out;
}

/** A code card: up to 4 lines of up to 24 characters, straight quotes. */
export function codeCardIssues(f: CardFigure, where: string): string[] {
  if (f.kind !== 'code') return [];
  const out: string[] = [];
  const lines = f.code.split('\n');
  if (lines.length > 4) out.push(`${where}: a code card of ${lines.length} lines`);
  for (const l of lines) {
    if (l.length > 24) out.push(`${where}: a code line of ${l.length} characters: ${l}`);
    if (/[“”‘’]/.test(l)) out.push(`${where}: curly quotes in code: ${l}`);
  }
  return out;
}

/** Group D's layout figures: code traces and code cards. */
export function he3dFigureIssues(l: LayoutDef): string[] {
  const out: string[] = [];
  if (l.kind === 'explore' && l.figure.kind === 'codeTrace') {
    const f = l.figure;
    for (const s of l.scenes) {
      if (s.trace) out.push(...codeTraceIssues(f, s.trace, `${l.id} ${s.label}`));
    }
  }
  if (l.kind === 'sort') {
    for (const card of l.cards)
      if (card.figure)
        out.push(
          ...codeCardIssues(card.figure, card.label),
          ...graphCardIssues(card.figure, card.label),
        );
    for (const bin of l.bins)
      if (bin.figure)
        out.push(
          ...codeCardIssues(bin.figure, bin.label),
          ...graphCardIssues(bin.figure, bin.label),
        );
  }
  if (l.kind === 'sequence') {
    for (const st of l.stages)
      if (st.figure)
        out.push(...codeCardIssues(st.figure, st.label), ...graphCardIssues(st.figure, st.label));
  }
  return out;
}

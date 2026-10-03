/**
 * Harness checks for the college round 4 group N pictures (docs/RENDERINGS_HE.md): HC184
 * `karnaugh` (the calculator picture and the explore figure). Test-only.
 */
import {
  columnOf,
  cubeCells,
  cubeOf,
  minimalCover,
  sopOf,
} from '@/components/module/reps/karnaughMath';

import type { LayoutDef } from '../layouts';
import type { Representation } from '../types';
import type { NumOrVar } from '../typesGraphs';
import {
  binarySteps,
  classTime,
  dsReplay,
  fsmReplay,
  pipelineCycles,
  pipelineRow,
  stageNames,
  vennRegions,
  worstRanges,
} from '@/components/module/reps/he4nMath';
import type {
  DatapathSpec,
  InstrClass,
  MemoryMapSpec,
  VennThree,
  DataStructureScene,
  SearchSpec,
  KarnaughScene,
  KarnaughSpec,
  PipelineSpec,
  StateDiagramFigure,
  StateDiagramScene,
} from '../typesHe4n';

type Get = (x: NumOrVar) => number | undefined;

const near = (a: number, b: number) =>
  Math.abs(a - b) <= 5e-3 * Math.max(Math.abs(a), Math.abs(b), 1e-30);

const opt = (get: Get, x: NumOrVar | undefined) => (x === undefined ? undefined : get(x));

/** Group N's calculator pictures. */
export function he4nIssues(rep: Representation, get: Get): string[] {
  switch (rep.kind) {
    case 'karnaugh':
      return karnaughIssues(rep, get);
    case 'pipelineDiagram':
      return pipelineIssues(rep, get);
    case 'dataStructure':
      return searchIssues(rep, get);
    case 'memoryMap':
      return memoryIssues(rep, get);
    case 'datapath':
      return datapathIssues(rep, get);
    default:
      return [];
  }
}

// ─── HC191 ───────────────────────────────────────────────────────────────────

/** The lit delays (or the slowest class's) add to the period. */
function datapathIssues(s: DatapathSpec, get: Get): string[] {
  const out: string[] = [];
  if (s.delays && s.delays.length !== 5) return [`datapath: ${s.delays.length} delays, not 5`];
  const ds = (s.delays ?? []).map((d) => get(d));
  const period = opt(get, s.period);
  if (ds.length !== 5 || ds.some((d) => d === undefined) || period === undefined) return out;
  const classes: InstrClass[] = s.classes
    ? ['load', 'store', 'rtype', 'branch']
    : s.instr
      ? [s.instr]
      : [];
  if (!classes.length) return out;
  const want = Math.max(...classes.map((cl) => classTime(cl, ds as number[])));
  if (!near(period, want)) out.push(`datapath: period ${period}, the lit delays add to ${want}`);
  return out;
}

// ─── HC189 ───────────────────────────────────────────────────────────────────

/** Paging: page, offset and PA = frame × size + offset. Inode: k, d + k + k² + k³, bytes. */
function memoryIssues(s: MemoryMapSpec, get: Get): string[] {
  const out: string[] = [];
  const g = (x: NumOrVar | undefined) => opt(get, x);
  if (s.mode === 'paging') {
    const [size, va, page, offset, frame, pa] = [s.size, s.va, s.page, s.offset, s.frame, s.pa].map(
      g,
    );
    if (size === undefined || va === undefined || !(size >= 1)) return out;
    const pg = Math.floor(va / size);
    const off = va - pg * size;
    if (page !== undefined && page !== pg) out.push(`memoryMap: page ${page}, ⌊VA ÷ size⌋ = ${pg}`);
    if (offset !== undefined && !near(offset, off))
      out.push(`memoryMap: offset ${offset}, VA mod size = ${off}`);
    if (frame !== undefined && pa !== undefined && !near(pa, frame * size + off))
      out.push(`memoryMap: PA ${pa}, frame × size + offset = ${frame * size + off}`);
    return out;
  }
  const [B, p, k, d, blocks, bytes] = [s.B, s.p, s.k, s.d, s.blocks, s.bytes].map(g);
  const kk = B !== undefined && p !== undefined && p > 0 ? Math.floor(B / p) : k;
  if (k !== undefined && kk !== undefined && k !== kk) out.push(`memoryMap: k ${k}, B ÷ p = ${kk}`);
  if (kk === undefined || d === undefined) return out;
  const want = d + kk + kk ** 2 + kk ** 3;
  if (blocks !== undefined && !near(blocks, want))
    out.push(`memoryMap: blocks ${blocks}, d + k + k² + k³ = ${want}`);
  if (bytes !== undefined && B !== undefined && !near(bytes, want * B))
    out.push(`memoryMap: bytes ${bytes}, blocks × B = ${want * B}`);
  return out;
}

// ─── HC188 ───────────────────────────────────────────────────────────────────

/**
 * The 7 regions add to the union and to the page's value. Counts the page's limit refuses (a
 * region below 0, a total under the union) are drawn faded with the reason, so they are not
 * errors; the regions are checked whenever every one is 0 or more.
 */
export function vennThreeIssues(s: VennThree, get: Get): string[] {
  const out: string[] = [];
  const g = (x: NumOrVar | undefined) => opt(get, x);
  const reg = vennRegions({
    a: g(s.a),
    b: g(s.b),
    c: g(s.c),
    ab: g(s.ab),
    ac: g(s.ac),
    bc: g(s.bc),
    abc: g(s.abc),
  });
  const { union, ...parts } = reg;
  const xs = Object.values(parts);
  if (xs.some((x) => x !== undefined && x < -1e-9)) return out;
  if (union !== undefined && xs.every((x) => x !== undefined)) {
    const sum = xs.reduce((a: number, x) => a + x!, 0);
    if (!near(sum, union)) out.push(`venn three: regions add to ${sum}, the union is ${union}`);
    const u = g(s.union);
    if (u !== undefined && !near(u, union)) out.push(`venn three: union ${u}, worked ${union}`);
  }
  return out;
}

// ─── HC187 ───────────────────────────────────────────────────────────────────

/** The bars counted are ⌊log₂n⌋ + 1; linear n and (n + 1)/2. */
function searchIssues(s: SearchSpec, get: Get): string[] {
  const out: string[] = [];
  const n = get(s.n);
  if (n === undefined || n < 1) return out;
  const bars = worstRanges(n).length;
  if (bars !== Math.floor(Math.log2(Math.floor(n)) + 1e-9) + 1)
    out.push(`search: ${bars} halvings, ⌊log₂n⌋ + 1 = ${Math.floor(Math.log2(n)) + 1}`);
  const b = opt(get, s.binary);
  if (b !== undefined && b !== bars) out.push(`search: binary ${b}, drawn ${bars}`);
  const l = opt(get, s.linear);
  if (l !== undefined && !near(l, Math.floor(n))) out.push(`search: linear ${l}, n = ${n}`);
  const a = opt(get, s.average);
  if (a !== undefined && !near(a, (Math.floor(n) + 1) / 2)) out.push(`search: average ${a}`);
  return out;
}

/** A scene's operations replayed give what it says it holds and what came out. */
function dataSceneIssues(s: DataStructureScene, where: string): string[] {
  const out: string[] = [];
  if (s.structure === 'array') {
    const v = s.values ?? [];
    if (v.length < 2 || v.length > 16) out.push(`${where}: an array of ${v.length}`);
    if (v.some((x, i) => i > 0 && x < v[i - 1]!)) out.push(`${where}: the array is not sorted`);
    if (s.target === undefined) out.push(`${where}: no target`);
    const steps = binarySteps(v, s.target ?? 0);
    if ((s.step ?? 1) < 1 || (s.step ?? 1) > steps.length)
      out.push(`${where}: comparison ${s.step} of ${steps.length}`);
    return out;
  }
  const st = dsReplay(s);
  if (st.error) return [`${where}: ${st.error}`];
  if (s.holds && s.holds.join(',') !== st.items.join(','))
    out.push(`${where}: holds ${st.items.join(', ')}, not ${s.holds.join(', ')}`);
  if (s.out !== undefined && s.out !== st.out)
    out.push(`${where}: ${st.out} comes out, not ${s.out}`);
  const cap = s.structure === 'ring' ? (s.slots ?? 8) : s.structure === 'stack' ? 7 : 6;
  if (st.items.length > cap) out.push(`${where}: ${st.items.length} items, more than ${cap} fit`);
  if (s.structure === 'ring' && !((s.slots ?? 8) >= 3 && (s.slots ?? 8) <= 12))
    out.push(`${where}: a ring of ${s.slots} slots`);
  return out;
}

// ─── HC186 ───────────────────────────────────────────────────────────────────

/** The last cell sits at k + n − 1 (+ stalls); cycles, and the speedup n·t₁ ÷ (cycles·t_s). */
function pipelineIssues(s: PipelineSpec, get: Get): string[] {
  const out: string[] = [];
  const k = get(s.k);
  const n = get(s.n);
  if (k === undefined || n === undefined) return out;
  if (!Number.isInteger(k) || k < 1) out.push(`pipeline: k = ${k} stages`);
  if (!Number.isInteger(n) || n < 1) out.push(`pipeline: n = ${n} instructions`);
  if (out.length) return out;
  const stalls = (s.stalls ?? []).flatMap((x) => {
    const count = get(x.count);
    return count !== undefined && count > 0 && x.instr <= n ? [{ ...x, count }] : [];
  });
  const names = stageNames(k, s.stages);
  for (const x of stalls)
    if (x.before !== undefined && (k === 5 || s.stages) && !names.includes(x.before))
      out.push(`pipeline: a stall before ${x.before}, not a stage`);
  const last = pipelineRow(n, k, names, stalls);
  const end = last[last.length - 1]!.cycle;
  const want = pipelineCycles(k, n, stalls);
  if (end !== want) out.push(`pipeline: the last cell is at cycle ${end}, not ${want}`);
  if (!stalls.length && end !== k + n - 1) out.push(`pipeline: no stalls but ${end} ≠ k + n − 1`);
  const cycles = opt(get, s.cycles);
  if (cycles !== undefined && cycles !== want)
    out.push(`pipeline: cycles ${cycles}, drawn ${want}`);
  const [ts, t1, sp] = [opt(get, s.ts), opt(get, s.t1), opt(get, s.speedup)];
  if (ts !== undefined && t1 !== undefined && sp !== undefined && ts > 0)
    if (!near(sp, (n * t1) / (want * ts)))
      out.push(`pipeline: speedup ${sp}, n·t₁ ÷ (cycles·t_s) = ${(n * t1) / (want * ts)}`);
  for (const fw of s.forward ?? [])
    if (!(fw.from >= 1 && fw.to > fw.from))
      out.push(`pipeline: forwarding ${fw.from} → ${fw.to} is not to a later instruction`);
  return out;
}

// ─── HC184 ───────────────────────────────────────────────────────────────────

/** A function's map: its 1s and don't-cares fit 2ⁿ cells and don't share one. */
function functionIssues(n: number, ones: number[], dcs: number[], where: string): string[] {
  const out: string[] = [];
  for (const m of [...ones, ...dcs])
    if (!Number.isInteger(m) || m < 0 || m >= 1 << n)
      out.push(`${where}: minterm ${m} is not a cell of a ${n}-variable map`);
  const shared = ones.filter((m) => dcs.includes(m));
  if (shared.length) out.push(`${where}: ${shared.join(', ')} both 1 and don't-care`);
  return out;
}

/** The written sum of products, read back as a truth table, matches the function off the X's. */
function sopMatches(n: number, names: string[], ones: number[], dcs: number[], sop: string) {
  const col = sop === '0' ? Array.from({ length: 1 << n }, () => 0) : columnOf(sop, names);
  return col.every((v, m) => dcs.includes(m) || v === (ones.includes(m) ? 1 : 0));
}

function karnaughIssues(s: KarnaughSpec, get: Get): string[] {
  const out: string[] = [];
  const n = get(s.n);
  if (n === undefined) return out;
  if (!Number.isInteger(n) || n < 2 || n > 4) return [`karnaugh: n = ${n} is not 2, 3 or 4`];
  const names = (s.names ?? ['A', 'B', 'C', 'D']).slice(0, n);
  const rows = opt(get, s.rows);
  if (rows !== undefined && rows !== 2 ** n) out.push(`karnaugh: rows ${rows}, 2ⁿ = ${2 ** n}`);
  const fns = opt(get, s.functions);
  if (fns !== undefined && !near(fns, 2 ** (2 ** n)))
    out.push(`karnaugh: functions ${fns}, 2^(2ⁿ) = ${2 ** (2 ** n)}`);
  const lit = opt(get, s.lit);
  if (lit !== undefined && !Number.isInteger(lit)) out.push(`karnaugh: minterm ${lit} not whole`);
  if (s.minterms) {
    const ones = s.minterms;
    const dcs = s.dontCares ?? [];
    // (a page whose n is typed may not fit its function: the picture says so, not an error)
    if ([...ones, ...dcs].every((m) => m < 1 << n)) {
      out.push(...functionIssues(n, ones, dcs, 'karnaugh'));
      const sop = sopOf(minimalCover(n, ones, dcs), names);
      if (!sopMatches(n, names, ones, dcs, sop)) out.push(`karnaugh: ${sop} is not the function`);
    }
  }
  return out;
}

/** A K-map scene: each group a power-of-two block of 1s and X's; the SOP equals the function. */
export function karnaughSceneIssues(mode: 'map' | 'table', s: KarnaughScene, where: string) {
  const out: string[] = [];
  const n = s.names.length;
  if (new Set(s.names).size !== n || s.names.some((v) => !/^[A-Za-z]$/.test(v)))
    out.push(`${where}: variables ${s.names.join(', ')} are not distinct single letters`);
  if (mode === 'table') {
    if (n < 1 || n > 4) out.push(`${where}: a truth table of ${n} variables`);
    const cols = s.columns ?? [];
    if (!cols.length) out.push(`${where}: a truth table with no columns`);
    for (const e of cols) {
      try {
        columnOf(e, s.names);
      } catch (err) {
        out.push(`${where}: column “${e}”: ${(err as Error).message}`);
      }
    }
    for (const i of s.lit ?? [])
      if (!(i >= 0 && i < cols.length)) out.push(`${where}: lit column ${i} is not a column`);
    if ((s.lit ?? []).length > 2) out.push(`${where}: more than two lit columns`);
    return out;
  }
  if (n < 2 || n > 4) return [...out, `${where}: a K-map of ${n} variables`];
  const ones = s.minterms ?? [];
  const dcs = s.dontCares ?? [];
  out.push(...functionIssues(n, ones, dcs, where));
  const ok = new Set([...ones, ...dcs]);
  const groups = s.groups ?? minimalCover(n, ones, dcs).map((q) => cubeCells(q, n));
  const cubes = groups.flatMap((g, i) => {
    const q = cubeOf(g, n);
    if (!q) {
      out.push(`${where}: group ${i + 1} (${g.join(', ')}) is not a power-of-two block`);
      return [];
    }
    if (g.some((m) => !ok.has(m))) out.push(`${where}: group ${i + 1} rings a 0`);
    if (!g.some((m) => ones.includes(m))) out.push(`${where}: group ${i + 1} rings no 1`);
    return [q];
  });
  if (groups.length > 4) out.push(`${where}: more than 4 groups (4 outline styles)`);
  const sop = sopOf(cubes, s.names);
  if (!sopMatches(n, s.names, ones, dcs, sop))
    out.push(`${where}: f = ${sop} is not the function's truth table`);
  return out;
}

// ─── HC185 ───────────────────────────────────────────────────────────────────

/** A state machine: every state has one arrow per input value; Moore outputs in the states. */
export function stateDiagramIssues(f: StateDiagramFigure, where: string): string[] {
  const out: string[] = [];
  const names = f.states.map((s) => s.name);
  if (new Set(names).size !== names.length) out.push(`${where}: two states share a name`);
  if (!names.includes(f.start)) out.push(`${where}: start ${f.start} is not a state`);
  for (const s of f.states) {
    if (!(s.x >= 0 && s.x <= 1 && s.y >= 0 && s.y <= 1))
      out.push(`${where}: ${s.name} off the box`);
    if (f.machine === 'moore' && s.output === undefined)
      out.push(`${where}: ${s.name} has no output`);
    for (const v of f.inputs) {
      const n = f.arrows.filter((a) => a.from === s.name && a.input === v).length;
      if (n !== 1) out.push(`${where}: ${s.name} has ${n} arrows on input ${v}`);
    }
  }
  for (const a of f.arrows) {
    if (!names.includes(a.from) || !names.includes(a.to))
      out.push(`${where}: arrow ${a.from} → ${a.to} names a missing state`);
    if (!f.inputs.includes(a.input)) out.push(`${where}: arrow on ${a.input}, not an input`);
    if (f.machine === 'mealy' && a.output === undefined)
      out.push(`${where}: Mealy arrow ${a.from} → ${a.to} has no output`);
  }
  for (const bit of f.tape ?? '')
    if (!f.inputs.includes(bit)) out.push(`${where}: tape bit ${bit} is not an input`);
  return out;
}

/** A scene's input replays from the start to the state it names, along the tape. */
function stateSceneIssues(f: StateDiagramFigure, s: StateDiagramScene, where: string) {
  const out: string[] = [];
  if (f.tape !== undefined && !f.tape.startsWith(s.input))
    out.push(`${where}: input ${s.input} is not the start of the tape ${f.tape}`);
  const steps = fsmReplay(f, s.input);
  if (steps.some((x) => !x.arrow)) out.push(`${where}: input ${s.input} leaves the machine`);
  const end = steps.length ? steps[steps.length - 1]!.state : f.start;
  if (s.state !== undefined && s.state !== end)
    out.push(`${where}: the input ends in ${end}, not ${s.state}`);
  return out;
}

/** Group N's explore figures (layout checks). */
export function he4nFigureIssues(l: LayoutDef): string[] {
  const out: string[] = [];
  if (l.kind !== 'explore') return out;
  const f = l.figure;
  if (f.kind === 'stateDiagram') out.push(...stateDiagramIssues(f, l.id));
  for (const s of l.scenes) {
    const where = `${l.id} ${s.label}`;
    if (f.kind === 'karnaugh' && s.kmap)
      out.push(...karnaughSceneIssues(f.mode ?? 'map', s.kmap, where));
    if (f.kind === 'stateDiagram' && s.fsm) out.push(...stateSceneIssues(f, s.fsm, where));
    if (f.kind === 'dataStructure' && s.ds) out.push(...dataSceneIssues(s.ds, where));
  }
  return out;
}

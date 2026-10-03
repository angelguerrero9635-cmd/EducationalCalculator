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
import type { KarnaughScene, KarnaughSpec } from '../typesHe4n';

type Get = (x: NumOrVar) => number | undefined;

const near = (a: number, b: number) =>
  Math.abs(a - b) <= 5e-3 * Math.max(Math.abs(a), Math.abs(b), 1e-30);

const opt = (get: Get, x: NumOrVar | undefined) => (x === undefined ? undefined : get(x));

/** Group N's calculator pictures. */
export function he4nIssues(rep: Representation, get: Get): string[] {
  switch (rep.kind) {
    case 'karnaugh':
      return karnaughIssues(rep, get);
    default:
      return [];
  }
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

/** Group N's explore figures (layout checks). */
export function he4nFigureIssues(l: LayoutDef): string[] {
  const out: string[] = [];
  if (l.kind !== 'explore') return out;
  const f = l.figure;
  for (const s of l.scenes) {
    const where = `${l.id} ${s.label}`;
    if (f.kind === 'karnaugh' && s.kmap)
      out.push(...karnaughSceneIssues(f.mode ?? 'map', s.kmap, where));
  }
  return out;
}

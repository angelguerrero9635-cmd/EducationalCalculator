/**
 * Layout figure checks for group HB's `studyDesign` figure: the sample a method takes is what
 * the method says (every band in a stratified sample, whole blocks in a cluster sample, equal
 * gaps in a systematic one), and an experiment's two groups split the sample. Called from
 * `layoutFigureIssues`. Test-only.
 */
import {
  STUDY_GRID,
  assignOf,
  clustersOf,
  sampleOf,
  strataOf,
} from '@/components/module/layouts/studyMath';

import type { LayoutDef } from '../layouts';

export function studyFigureIssues(l: LayoutDef): string[] {
  const out: string[] = [];
  if (l.kind !== 'explore' || l.figure.kind !== 'studyDesign') return out;
  const g = STUDY_GRID;
  const n = g.cols * g.rows;
  for (const s of l.scenes) {
    const st = s.study;
    if (!st) {
      out.push(`scene "${s.label}": no study`);
      continue;
    }
    const size = st.sample ?? 12;
    if (size < 6 || size > 24) out.push(`scene "${s.label}": a sample of ${size} (6 to 24 fit)`);
    const method = st.method ?? 'simple random';
    const picked = sampleOf(method, g, Math.min(24, Math.max(6, size)));
    const set = new Set(picked);
    if (set.size !== picked.length || picked.some((p) => p < 0 || p >= n))
      out.push(`scene "${s.label}": the sample repeats or leaves the population`);
    if (method === 'stratified' && strataOf(g).some((band) => !band.some((p) => set.has(p))))
      out.push(`scene "${s.label}": a band has no one in the stratified sample`);
    if (method === 'cluster') {
      for (const cl of clustersOf(g)) {
        const k = cl.filter((p) => set.has(p)).length;
        if (k && k !== cl.length) out.push(`scene "${s.label}": a block is only partly sampled`);
      }
    }
    if (method === 'systematic') {
      const gaps = new Set(picked.slice(1).map((p, i) => p - picked[i]!));
      if (gaps.size > 1) out.push(`scene "${s.label}": systematic gaps differ (${[...gaps]})`);
    }
    if (st.design === 'experiment') {
      const [a, b] = assignOf(picked);
      const both = [...a, ...b].sort((x, y) => x - y);
      if (both.join() !== [...picked].sort((x, y) => x - y).join() || a.some((p) => b.includes(p)))
        out.push(`scene "${s.label}": the two groups don't split the sample`);
      if (Math.abs(a.length - b.length) > 1)
        out.push(`scene "${s.label}": the groups differ in size`);
    }
  }
  return out;
}

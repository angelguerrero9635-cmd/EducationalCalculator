/**
 * Picture checks for the Grades 9–12 group H pictures (`typesHsh.ts`, biology H37–H42): what
 * each one draws must agree with the values. Called from `repIssues` in `pictures.ts`.
 * Test-only.
 */
import {
  ALLELE_BEADS,
  antibodyAt,
  IMMUNE_DEFAULTS,
  bandAt,
  beadsFor,
  GEL_BANDS,
  GEL_LADDER,
  GEL_LANES,
  gelWindow,
  pcrRows,
  PCR_DRAWN,
} from '@/components/module/reps/bioModel';

import type { HshSpec } from '../typesHsh';

/** Equal to display rounding. */
const near = (a: number, b: number, tol = 1e-6) =>
  Math.abs(a - b) <= tol * Math.max(1, Math.abs(a), Math.abs(b));

export function hshIssues(rep: HshSpec, val: (id: string) => number | undefined): string[] {
  const out: string[] = [];
  const num = (x: string | number | undefined) =>
    x === undefined ? undefined : typeof x === 'number' ? x : val(x);
  switch (rep.kind) {
    case 'gel': {
      if (!rep.lanes === !rep.pcr) {
        out.push('a gel draws either lanes or PCR');
        break;
      }
      if (rep.pcr) {
        const n = num(rep.pcr.cycles);
        const n0 = num(rep.pcr.start ?? 1);
        const N = num(rep.pcr.copies);
        if (n !== undefined && (!Number.isInteger(n) || n < 0 || n > 60))
          out.push(`PCR cycles ${n} is not a whole number from 0 to 60`);
        if (n0 !== undefined && (!Number.isInteger(n0) || n0 < 1))
          out.push(`PCR starts from ${n0} copies, not a whole number of at least 1`);
        if (n === undefined || n0 === undefined) break;
        if (N !== undefined && !near(N, n0 * 2 ** n))
          out.push(`${N} copies after ${n} cycles; ${n0} × 2^${n} is ${n0 * 2 ** n}`);
        // Every drawn row holds exactly start × 2ᵏ double strands, two strands each, and only
        // the first row's strands are all original.
        pcrRows(n0, n).forEach((row, k) => {
          if (row.length !== n0 * 2 ** k)
            out.push(`cycle ${k} draws ${row.length} copies, not ${n0 * 2 ** k}`);
          if (row.length > PCR_DRAWN) out.push(`cycle ${k} draws more than ${PCR_DRAWN}`);
          const originals = row.flat().filter((a) => a === 0).length;
          if (originals !== 2 * n0)
            out.push(`cycle ${k} keeps ${originals} original strands, not ${2 * n0}`);
        });
        break;
      }
      const lanes = rep.lanes!;
      if (lanes.length < 1 || lanes.length > GEL_LANES)
        out.push(`${lanes.length} gel lanes (1 to ${GEL_LANES} are drawn)`);
      const ladder = rep.ladder === false ? [] : (rep.ladder ?? GEL_LADDER);
      if (ladder.some((s, i) => s <= 0 || (i > 0 && s >= ladder[i - 1]!)))
        out.push('the ladder must list positive sizes from largest to smallest');
      const sizes: number[] = [];
      for (const lane of lanes) {
        if (lane.bands.length < 1 || lane.bands.length > GEL_BANDS)
          out.push(`lane ${lane.label}: ${lane.bands.length} bands (1 to ${GEL_BANDS})`);
        for (const b of lane.bands) {
          const s = num(b);
          if (s === undefined) continue;
          if (!(s > 0)) out.push(`lane ${lane.label}: a band of ${s} bp`);
          else sizes.push(s);
        }
      }
      // Placement: distance falls with log size, the same step for each × 10, inside the gel.
      const win = gelWindow([...ladder, ...sizes]);
      const all = [...ladder, ...sizes].sort((a, b) => b - a);
      all.forEach((s, i) => {
        const t = bandAt(s, win);
        if (t <= 0 || t >= 1) out.push(`a ${s} bp band sits off the gel`);
        const next = all[i + 1];
        if (next === undefined) return;
        const step = bandAt(next, win) - t;
        if (next < s && !(step > 0)) out.push(`${next} bp runs no farther than ${s} bp`);
        if (next < s && !near(step / Math.log10(s / next), bandAt(10, win) - bandAt(100, win)))
          out.push(`${s} bp to ${next} bp is not placed on the log scale`);
      });
      break;
    }
    case 'alleleFrequencies': {
      const p = num(rep.p);
      if (p === undefined) break;
      if (p < 0 || p > 1) out.push(`p = ${p} is not a frequency`);
      const q = num(rep.q);
      if (q !== undefined && !near(p + q, 1, 1e-4)) out.push(`p + q = ${p + q}, not 1`);
      const want = [p * p, 2 * p * (1 - p), (1 - p) * (1 - p)];
      (rep.genotypes ?? []).forEach((g, i) => {
        const f = g === null ? undefined : num(g);
        if (f !== undefined && !near(f, want[i]!, 1e-4))
          out.push(`genotype ${i + 1} shows ${f}, the bar draws ${want[i]}`);
      });
      if (!near(want[0]! + want[1]! + want[2]!, 1, 1e-9)) out.push('genotype bars do not add to 1');
      const n = beadsFor(p);
      if (Math.abs(n - p * ALLELE_BEADS) > 0.5 + 1e-9)
        out.push(`${n} beads for p = ${p}, not the nearest to ${p * ALLELE_BEADS}`);
      break;
    }
    case 'immuneResponse': {
      const r = {
        first: num(rep.first),
        second: num(rep.second),
        firstDays: num(rep.firstDays ?? IMMUNE_DEFAULTS.firstDays),
        secondDays: num(rep.secondDays ?? IMMUNE_DEFAULTS.secondDays),
        secondAt: num(rep.secondAt ?? IMMUNE_DEFAULTS.secondAt),
      };
      if (Object.values(r).some((x) => x === undefined)) break;
      const v = r as Record<keyof typeof r, number>;
      if (v.first <= 0 || v.second <= 0) out.push('an antibody peak is not above 0');
      if (v.firstDays <= 0 || v.secondDays <= 0) out.push('a peak is not after its exposure');
      if (v.secondAt <= v.firstDays)
        out.push(`second exposure on day ${v.secondAt}, before the first peak`);
      // The curve drawn passes through both marked peaks, and never above the higher one.
      const peaks: [number, number][] = [
        [v.firstDays, v.first],
        [v.secondAt + v.secondDays, v.second],
      ];
      for (const [t, p] of peaks) {
        const at = antibodyAt(t, v);
        if (!near(at, Math.max(p, at)) || at < p - 1e-6 * p)
          out.push(`the curve is at ${at} on day ${t}, not the peak ${p}`);
      }
      const top = Math.max(v.first, v.second);
      for (let t = 0; t <= v.secondAt + v.secondDays * 4; t += 0.25)
        if (antibodyAt(t, v) > top * (1 + 1e-9)) out.push(`the curve passes ${top} on day ${t}`);
      break;
    }
  }
  return out;
}

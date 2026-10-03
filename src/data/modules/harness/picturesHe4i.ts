/**
 * Picture checks for college round 4, group I (docs/RENDERINGS_HE.md). HC141: a cell's A, V and
 * A ÷ V agree with r to 3 significant figures, on a sphere. HC142: chromatids and c by stage.
 * HC143: an evolution icon sits in the bin for its kind of evidence. Called from `repIssues` in
 * `pictures.ts` (and the layout checks from `layoutFigures.ts`). Test-only.
 */
import { cellRatio } from '@/components/module/reps/he4iMath';

import { divisionStages } from '../typesHe4i';

import type { LayoutDef } from '../layouts';
import { EVIDENCE_OF } from '../layouts/icons/he4i';
import type { Representation } from '../types';

type Val = (x: string | number) => number | undefined;

/** Equal to 3 significant figures. */
const sameTo3 = (a: number, b: number) =>
  Number(a.toPrecision(3)) === Number(b.toPrecision(3)) ||
  Math.abs(a - b) <= 1e-9 * Math.max(1, Math.abs(b));

/** HC141 on `curvedSolid`. */
export function cellRatioIssues(rep: Representation, val: Val): string[] {
  if (rep.kind !== 'curvedSolid' || !rep.ratio) return [];
  const out: string[] = [];
  if (rep.shape !== 'sphere') out.push(`ratio: a ${rep.shape} is not a cell's sphere`);
  const r = val(rep.radius);
  const q = rep.ratio;
  if (q.compare !== undefined && q.compare !== false) {
    const k = val(q.compare);
    if (k !== undefined && !(k > 0)) out.push(`ratio: compare factor ${k} is not positive`);
  }
  if (r === undefined) return out;
  if (!(r > 0)) return [...out, `ratio: r = ${r} is not positive`];
  const m = cellRatio(r);
  const check = (id: string | undefined, want: number, what: string) => {
    const x = id ? val(id) : undefined;
    if (x !== undefined && !sameTo3(x, want))
      out.push(`ratio: ${what} ${x} for r = ${r} (${Number(want.toPrecision(3))})`);
  };
  check(q.area, m.area, 'A = 4πr² is');
  check(q.volume, m.volume, 'V = 4/3 πr³ is');
  check(q.ratio, m.ratio, 'A ÷ V = 3 ÷ r is');
  return out;
}

/**
 * HC142 on `cellDivision` `content`: chromatids = 2 × chromosomes from S to metaphase II (the
 * page's chromatids after S are 2 × 2n), and c halves at each meiotic division (the gamete's
 * content is the G₁ content ÷ 2, after S doubled it).
 */
export function divisionContentIssues(rep: Representation, val: Val): string[] {
  if (rep.kind !== 'cellDivision' || !rep.content) return [];
  const out: string[] = [];
  const k = rep.content;
  const d = val(rep.diploid);
  const g1 = k.dna === undefined ? 2 : val(k.dna);
  if (g1 !== undefined && !(g1 > 0)) out.push(`content: G₁ DNA ${g1}c is not positive`);
  if (d !== undefined && Number.isInteger(d / 2) && d >= 2) {
    const s = divisionStages(d, g1 ?? 2);
    // Duplicated (2 chromatids each) after S and after meiosis I; single in G₁ and the gamete.
    s.forEach((x, i) => {
      const per = i === 1 || i === 2 ? 2 : 1;
      if (x.chromatids !== per * x.chromosomes)
        out.push(`content: ${x.stage} has ${x.chromatids} chromatids on ${x.chromosomes}`);
    });
    if (s[2]!.dna * 2 !== s[1]!.dna || s[3]!.dna * 2 !== s[2]!.dna)
      out.push('content: c does not halve at each meiotic division');
    const ct = k.chromatids ? val(k.chromatids) : undefined;
    if (ct !== undefined && ct !== 2 * d)
      out.push(`content: ${ct} chromatids after S, 2 × 2n is ${2 * d}`);
  }
  const gam = k.gamete ? val(k.gamete) : undefined;
  if (gam !== undefined && g1 !== undefined && Math.abs(gam - g1 / 2) > 1e-9)
    out.push(`content: a gamete holds ${gam}c, half of G₁'s ${g1}c is ${g1 / 2}c`);
  return out;
}

/** The layout checks for group I's card icons and figures (from `layoutFigures.ts`). */
export function he4iLayoutIssues(l: LayoutDef): string[] {
  const out: string[] = [];
  if (l.kind === 'sort') {
    // HC143: in a sort by kind of evidence, an evolution icon goes in the bin naming its kind.
    const words = ['homologous', 'analogous', 'vestigial'];
    const named = (b: { id: string; label: string }) =>
      words.filter((w) => `${b.id} ${b.label}`.toLowerCase().includes(w));
    if (l.bins.some((b) => named(b).length)) {
      for (const card of l.cards) {
        const f = card.figure;
        const kind = f?.kind === 'icon' ? EVIDENCE_OF[f.icon] : undefined;
        if (!kind) continue;
        const bin = l.bins.find((b) => b.id === card.bin);
        if (!bin || !named(bin).includes(kind))
          out.push(`card "${card.label}": a ${kind} structure in bin "${bin?.label ?? card.bin}"`);
      }
    }
  }
  return out;
}

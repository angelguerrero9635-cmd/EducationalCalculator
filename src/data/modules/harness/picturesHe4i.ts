/**
 * Picture checks for college round 4, group I (docs/RENDERINGS_HE.md). HC141: a cell's A, V and
 * A ÷ V agree with r to 3 significant figures, on a sphere. HC142: chromatids and c by stage.
 * HC143: an evolution icon sits in the bin for its kind of evidence. HC144: the child's chance
 * is the parents' × 1/4; a pedigree card is possible under its bin's mode and not another's. Called from `repIssues` in
 * `pictures.ts` (and the layout checks from `layoutFigures.ts`). Test-only.
 */
import { cellRatio } from '@/components/module/reps/he4iMath';
import { modeOfBin, modePossible, type Mode } from '@/components/module/reps/pedigreeHe4iMath';

import { divisionStages } from '../typesHe4i';

import type { LayoutDef, PedigreePerson } from '../layouts';
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
    // HC144: a pedigree card is possible under its bin's mode and impossible under another bin's.
    const modes = l.bins.map((b) => [b.id, modeOfBin(b)] as const);
    for (const card of l.cards) {
      if (card.figure?.kind !== 'pedigree') continue;
      const f = card.figure;
      out.push(...familyIssues(f.people).map((x) => `card "${card.label}": ${x}`));
      const own = modes.find(([id]) => id === card.bin)?.[1];
      if (!own) {
        out.push(`card "${card.label}": its bin names no mode of inheritance`);
        continue;
      }
      if (!modePossible(f.people, own, f.marked))
        out.push(`card "${card.label}": impossible under its bin's mode ${own}`);
      const others = modes.flatMap(([id, m]) => (id !== card.bin && m ? [m] : []));
      if (!others.some((m: Mode) => !modePossible(f.people, m, f.marked)))
        out.push(`card "${card.label}": possible under every other bin's mode too`);
    }
  }
  return out;
}

/** A family's structure: parents in the family, one male and one female, a generation up. */
export function familyIssues(people: PedigreePerson[]): string[] {
  const out: string[] = [];
  const byId = new Map(people.map((p) => [p.id, p]));
  if (byId.size !== people.length) out.push('two people share an id');
  for (const p of people) {
    if (p.parents) {
      const [a, b] = p.parents.map((id) => byId.get(id));
      if (!a || !b) out.push(`${p.id}: a parent is not in the family`);
      else {
        if (a.sex === b.sex) out.push(`${p.id}: both parents are ${a.sex}`);
        if (a.generation !== p.generation - 1 || b.generation !== p.generation - 1)
          out.push(`${p.id}: parents are not one generation up`);
      }
    }
    if (p.partner && !byId.has(p.partner)) out.push(`${p.id}: partner not in the family`);
    if (p.trait && p.carrier) out.push(`${p.id}: both shows the trait and carries it`);
  }
  return out;
}

/** HC144 on `pedigree`: the family's structure; chances in 0–1; the child's is the product × 1/4. */
export function pedigreeIssues(rep: Representation, val: Val): string[] {
  if (rep.kind !== 'pedigree') return [];
  const out = familyIssues(rep.people);
  const ids = new Set(rep.people.map((p) => p.id));
  for (const [who, id] of Object.entries(rep.chances ?? {})) {
    if (!ids.has(who)) out.push(`pedigree: a chance on ${who}, not in the family`);
    const x = val(id);
    if (x !== undefined && !(x >= 0 && x <= 1)) out.push(`pedigree: chance ${id} = ${x}`);
  }
  const k = rep.child;
  if (k) {
    const [a, b] = k.parents.map((id) => rep.people.find((p) => p.id === id));
    if (!a || !b) out.push('pedigree: the child’s parents are not in the family');
    else if (a.sex === b.sex) out.push('pedigree: the child’s parents are both ' + a.sex);
    const ps = k.parents.map((id) => (rep.chances?.[id] ? val(rep.chances[id]) : undefined));
    const P = val(k.chance);
    if (k.parents.some((id) => !rep.chances?.[id]))
      out.push('pedigree: a parent of the child has no chance written');
    else if (P !== undefined && ps[0] !== undefined && ps[1] !== undefined) {
      const want = ps[0] * ps[1] * 0.25;
      if (Math.abs(P - want) > 1e-9 * Math.max(1, want))
        out.push(
          `pedigree: the child's chance ${P}, the parents' ${ps[0]} × ${ps[1]} × 1/4 = ${want}`,
        );
    }
  }
  return out;
}

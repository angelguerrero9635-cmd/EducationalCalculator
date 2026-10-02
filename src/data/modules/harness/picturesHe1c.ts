/**
 * Harness checks for the college round 1 group C pictures (HC2, `typesHe1c.ts`): the
 * `skeletal` kind (called from its case in `pictures.ts`) and the `skeletal` card figure
 * (called from `layoutFigures.ts`). Every C makes 4 bonds; the IHD counted on the drawing (rings
 * + π bonds) is the formula's; each wedge gives the written R or S; nothing overlaps; the chair's
 * share is 100K ÷ (1 + K). Test-only.
 */
import {
  cipRanks,
  configurationOf,
  countsOf,
  drawnConfiguration,
  fitLayout,
  formulaIhd,
  formulaOf,
  ihdOf,
  layoutMol,
  litAtoms,
  parseSmiles,
  pickCandidate,
  unsaturation,
  valenceProblems,
  type SkLayout,
} from '@/components/module/reps/skeletalMath';

import type { LayoutDef } from '../layouts';
import {
  SKELETAL_CARD_H,
  SKELETAL_CARD_W,
  type SkeletalCard,
  type SkeletalSpec,
} from '../typesHe1c';

type Val = (x: string | number) => number | undefined;

/** A structure's own checks: it reads, every C makes 4 bonds, wedges match, atoms apart. */
export function structureIssues(
  smiles: string,
  what: string,
  opts: { aspect?: number; center?: number } = {},
): { out: string[]; lay?: SkLayout } {
  const m = parseSmiles(smiles);
  if (m.error) return { out: [`${what}: can't read ${smiles} (${m.error})`] };
  const out = valenceProblems(m).map((p) => `${what} ${smiles}: ${p}`);
  const lay = layoutMol(m, opts);
  m.atoms.forEach((at, a) => {
    if (!at.chiral) return;
    const written = configurationOf(m, a);
    if (!written) {
      out.push(
        `${what} ${smiles}: atom ${a} is marked ${at.chiral} but two of its groups rank the same`,
      );
      return;
    }
    const drawn = drawnConfiguration(lay, a);
    if (drawn !== written)
      out.push(
        `${what} ${smiles}: atom ${a} is ${written} as written but drawn ${drawn ?? 'flat'}`,
      );
  });
  const f = formulaOf(m);
  const u = unsaturation(m);
  if (f.charge === 0 && formulaIhd(f) !== u.ihd)
    out.push(
      `${what} ${smiles}: ${u.rings} rings + ${u.pi} π bonds ≠ the formula's IHD ${formulaIhd(f)}`,
    );
  for (let i = 0; i < lay.pos.length; i++)
    for (let j = i + 1; j < lay.pos.length; j++) {
      const d = Math.hypot(lay.pos[i]![0] - lay.pos[j]![0], lay.pos[i]![1] - lay.pos[j]![1]);
      if (d < 0.6)
        out.push(`${what} ${smiles}: atoms ${i} and ${j} are drawn on top of each other`);
    }
  if (opts.center !== undefined && !cipRanks(m, opts.center))
    out.push(`${what} ${smiles}: atom ${opts.center} has no four groups of different rank`);
  return { out, lay };
}

export function skeletalIssues(rep: SkeletalSpec, val: Val): string[] {
  const out: string[] = [];
  if (rep.mode === 'chair') {
    const ch = rep.chair;
    if (!ch?.groups.length) return ['chair: no groups'];
    const ats = ch.groups.map((g) => g.at);
    if (ats.some((a) => !Number.isInteger(a) || a < 1 || a > 6))
      out.push(`chair: a group on carbon ${ats.join(', ')} (1–6)`);
    if (new Set(ats).size !== ats.length) out.push('chair: two groups on one carbon');
    const k = ch.k === undefined ? undefined : val(ch.k);
    const p = ch.percent === undefined ? undefined : val(ch.percent);
    if (p !== undefined && (p < 0 || p > 100)) out.push(`chair: share ${p}% is not 0–100`);
    if (k !== undefined && p !== undefined && k >= 0) {
      const want = (100 * k) / (1 + k);
      if (Math.abs(want - p) > 0.05 + 0.005 * want)
        out.push(`chair: share ${p}% but 100K ÷ (1 + K) = ${want.toFixed(2)}% for K = ${k}`);
    }
    return out;
  }
  for (const c of rep.candidates ?? [])
    out.push(...structureIssues(c.smiles, `candidate ${c.name}`).out);
  if (rep.smiles) {
    const r = structureIssues(rep.smiles, 'structure', { center: rep.center });
    out.push(...r.out);
    if (r.lay && rep.group && litAtoms(r.lay.mol, rep.group).size === 0)
      out.push(`structure ${rep.smiles}: no ${String(rep.group)} to light`);
  }
  if (rep.ihd) {
    const i = rep.ihd;
    const [c, h] = [val(i.carbons), val(i.hydrogens)];
    const n = i.nitrogens === undefined ? 0 : val(i.nitrogens);
    const x = i.halogens === undefined ? 0 : val(i.halogens);
    if (c === undefined || h === undefined || n === undefined || x === undefined) return out;
    const ihd = ihdOf(c, h, n, x);
    const typed = i.value === undefined ? undefined : val(i.value);
    if (typed !== undefined && Math.abs(typed - ihd) > 1e-9)
      out.push(`IHD ${typed} but (2C + 2 + N − H − X) ÷ 2 = ${ihd}`);
    if (!Number.isInteger(ihd) || ihd < 0) return out;
    const pi = i.pi === undefined ? undefined : val(i.pi);
    const rings = i.rings === undefined ? undefined : val(i.rings);
    const list = rep.candidates ?? (rep.smiles ? [{ smiles: rep.smiles, name: '' }] : []);
    const k = pickCandidate(
      list.map((s) => s.smiles),
      {
        c,
        h,
        n,
        x,
        ...(pi !== undefined ? { pi } : {}),
        ...(rings !== undefined ? { rings } : {}),
      },
    );
    if (k >= 0) {
      const m = parseSmiles(list[k]!.smiles);
      const u = unsaturation(m);
      const cnt = countsOf(m);
      if (u.ihd !== ihd)
        out.push(
          `${list[k]!.name}: ${u.rings} rings + ${u.pi} π bonds drawn, but the formula's IHD is ${ihd}`,
        );
      if (cnt.c !== c || cnt.h !== h) out.push(`${list[k]!.name} is not C${c}H${h}`);
      if (pi !== undefined && rings !== undefined && pi + rings !== ihd)
        out.push(`π bonds ${pi} + rings ${rings} ≠ IHD ${ihd}`);
    }
  }
  if (rep.enantiomers) {
    const mj = val(rep.enantiomers.major);
    if (mj !== undefined && (mj < 0 || mj > 100))
      out.push(`enantiomers: share ${mj}% is not 0–100`);
    if (rep.center === undefined) out.push('enantiomers: no center to name R or S');
  }
  return out;
}

/** Card checks: each `skeletal` card reads, lights a group it has, and fits 112 × 76. */
export function skeletalCardIssues(l: LayoutDef): string[] {
  const out: string[] = [];
  const figures =
    l.kind === 'sort'
      ? l.cards.map((c) => [c.label, c.figure] as const)
      : l.kind === 'sequence'
        ? l.stages.map((s) => [s.label, s.figure] as const)
        : [];
  for (const [label, f] of figures) {
    if (f?.kind !== 'skeletal') continue;
    const card = f as SkeletalCard;
    const r = structureIssues(card.smiles, `card "${label}"`, {
      aspect: SKELETAL_CARD_W / SKELETAL_CARD_H,
      center: card.center,
    });
    out.push(...r.out);
    if (!r.lay) continue;
    if (card.group && litAtoms(r.lay.mol, card.group).size === 0)
      out.push(`card "${label}": ${card.smiles} has no ${String(card.group)} to light`);
    const fit = fitLayout(r.lay, SKELETAL_CARD_W, SKELETAL_CARD_H, 24, 5, 12);
    if (fit.scale < 12)
      out.push(
        `card "${label}": ${card.smiles} is too big for a card (bonds ${fit.scale.toFixed(1)} px)`,
      );
  }
  return out;
}

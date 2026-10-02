/**
 * Layout checks for the college round 3 group G figures (HC57): the pathway detail of the
 * `organelleEnergy` explore figure and the `pathwayStep` stage cards. Called from
 * `layoutFigureIssues` in `layoutFigures.ts`. Test-only.
 */
import { PATHWAYS, PROTONS_PER_ATP, pathwayTally } from '../typesHe3g';
import type { LayoutDef } from '../layouts';

/** The pathway data itself: the tallies the pages teach and carbon kept through each step. */
export function pathwayDataIssues(): string[] {
  const out: string[] = [];
  const g = pathwayTally('glycolysis');
  if (g.ATP !== 2 || g.NADH !== 2) out.push(`glycolysis nets ${g.ATP} ATP, ${g.NADH} NADH`);
  const k = pathwayTally('krebs');
  if (k.NADH !== 3 || k.FADH2 !== 1 || k.GTP !== 1 || k.CO2 !== 2)
    out.push(
      `a turn of the cycle makes ${k.NADH} NADH, ${k.FADH2} FADH₂, ${k.GTP} GTP, ${k.CO2} CO₂`,
    );
  for (const name of ['glycolysis', 'krebs'] as const)
    PATHWAYS[name].forEach((s, i) => {
      const cin = s.from.reduce((a, m) => a + m.carbons, 0);
      const cout = s.to.reduce((a, m) => a + m.carbons, 0) + (s.yields.CO2 ?? 0);
      if (cin !== cout) out.push(`${name} step ${i + 1}: ${cin} carbons in, ${cout} out`);
    });
  // Each turn ends where it started: oxaloacetate.
  const kr = PATHWAYS.krebs;
  if (kr[kr.length - 1]!.to[0]!.short !== 'OAA') out.push('the cycle does not end at OAA');
  const pumped = (names: string[]) =>
    PATHWAYS.etc.filter((s) => names.includes(s.enzyme)).reduce((a, s) => a + (s.protons ?? 0), 0);
  if (pumped(['Complex I', 'Complex III', 'Complex IV']) / PROTONS_PER_ATP !== 2.5)
    out.push('an NADH does not give 2.5 ATP');
  if (pumped(['Complex II', 'Complex III', 'Complex IV']) / PROTONS_PER_ATP !== 1.5)
    out.push('an FADH₂ does not give 1.5 ATP');
  return out;
}

export function he3gFigureIssues(l: LayoutDef): string[] {
  const out: string[] = [];
  if (l.kind === 'explore' && l.figure.kind === 'organelleEnergy')
    for (const s of l.scenes) {
      const e = s.energy;
      if (!e?.detail) continue;
      out.push(...pathwayDataIssues());
      if (e.step !== undefined && (e.step < 1 || e.step > PATHWAYS[e.detail].length))
        out.push(`scene "${s.label}": step ${e.step} is not in ${e.detail}`);
    }
  if (l.kind === 'sequence') {
    const cards = l.stages.flatMap((s) => (s.figure?.kind === 'pathwayStep' ? [s.figure] : []));
    if (cards.length) {
      out.push(...pathwayDataIssues());
      // The cards in order: one pathway, its steps one after another.
      cards.forEach((f, i) => {
        if (f.pathway !== cards[0]!.pathway) out.push('pathwayStep: cards from two pathways');
        if (f.step !== cards[0]!.step + i) out.push(`pathwayStep: card ${i + 1} is step ${f.step}`);
        if (f.step < 1 || f.step > PATHWAYS[f.pathway].length)
          out.push(`pathwayStep: no step ${f.step} in ${f.pathway}`);
      });
    }
  }
  return [...new Set(out)];
}

/**
 * Layout figure checks for group H2F (earth and space round 2, H103): every scene asks for
 * something the figure draws. Called from `layoutFigureIssues`. Test-only.
 */
import type { LayoutDef } from '../layouts';

export function hs2fFigureIssues(l: LayoutDef): string[] {
  const out: string[] = [];
  if (l.kind !== 'explore') return out;
  const f = l.figure;
  for (const s of l.scenes) {
    const at = `scene "${s.label}"`;
    if (s.spectra && f.kind !== 'spectra') out.push(`${at}: spectra on a ${f.kind} figure`);
    if (f.kind === 'spectra' && !s.spectra) out.push(`${at}: no spectra scene`);
    if (s.greenhouse?.particles && s.greenhouse.view !== 'energy')
      out.push(`${at}: particles set on the zones view`);
    // Their label sits in space past the escaping infrared, which fills it with no greenhouse gases.
    if (s.greenhouse?.particles && s.greenhouse.co2 === 'none')
      out.push(`${at}: particles with no greenhouse gases (no room for their label)`);
    if (s.spectra) {
      const { star } = s.spectra;
      if (new Set(star).size !== star.length) out.push(`${at}: an element listed twice`);
      if (star.length === 0) out.push(`${at}: the star shows no lines`);
    }
  }
  return out;
}

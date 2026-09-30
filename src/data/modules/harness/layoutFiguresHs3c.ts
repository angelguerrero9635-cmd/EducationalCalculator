/**
 * Layout figure checks for group H3C (earth and space round 3, H110): every scene asks for
 * something the figure draws. Called from `layoutFigureIssues`. Test-only.
 */
import { wavesAt } from '@/components/module/reps/earthModel';

import type { LayoutDef } from '../layouts';

export function hs3cFigureIssues(l: LayoutDef): string[] {
  const out: string[] = [];
  if (l.kind !== 'explore') return out;
  const f = l.figure;
  for (const s of l.scenes) {
    const at = `scene "${s.label}"`;
    if (s.earthSection && f.kind !== 'earthLayers')
      out.push(`${at}: a station on a ${f.kind} figure`);
    if (f.kind !== 'earthLayers') continue;
    if (!s.earthSection) {
      out.push(`${at}: no station distance`);
      continue;
    }
    const d = s.earthSection.distance;
    if (!(d >= 0 && d <= 180)) out.push(`${at}: station ${d}° is not from 0° to 180°`);
    // The lines must not claim a wave the drawing shows missing (or deny one it shows arriving).
    const text = s.lines.join(' ').toLowerCase();
    const waves = wavesAt(d);
    if (!waves.s && /\bs waves? (both )?(arrive|reach)/.test(text) && !/no s waves?/.test(text))
      out.push(`${at}: the lines say S waves arrive at ${d}°, past the S shadow`);
    if (waves.p && waves.s && /shadow zone/.test(text) && !/(outside|before|short of)/.test(text))
      out.push(`${at}: the lines put ${d}° in a shadow zone, but both waves arrive`);
  }
  return out;
}

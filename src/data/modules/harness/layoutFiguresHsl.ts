/**
 * Layout figure checks for group HL's explore figures (earth and space H71–H80): every scene
 * asks for something the figure draws. Called from `layoutFigureIssues`. Test-only.
 */
import type { LayoutDef } from '../layouts';

export function hslFigureIssues(l: LayoutDef): string[] {
  const out: string[] = [];
  if (l.kind !== 'explore') return out;
  const f = l.figure;
  for (const s of l.scenes) {
    const at = `scene "${s.label}"`;
    if (s.mohs && f.kind !== 'mohsScale') out.push(`${at}: mohs on a ${f.kind} figure`);
    if (s.landform && f.kind !== 'landforms') out.push(`${at}: landform on a ${f.kind} figure`);
    if (f.kind === 'mohsScale' && s.mohs) {
      const { lit, between } = s.mohs;
      if (lit !== undefined && (!Number.isInteger(lit) || lit < 1 || lit > 10))
        out.push(`${at}: lit ${lit} is not a Mohs rank 1–10`);
      if (between) {
        const [a, b] = between;
        if (!(a >= 1 && b <= 10 && a < b)) out.push(`${at}: range ${a}–${b} is not within 1–10`);
      }
    }
  }
  return out;
}

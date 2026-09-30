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
    if (s.currents && f.kind !== 'oceanCurrents') out.push(`${at}: currents on a ${f.kind} figure`);
    if (s.greenhouse && f.kind !== 'greenhouse')
      out.push(`${at}: greenhouse on a ${f.kind} figure`);
    if (s.greenhouse?.lit && s.greenhouse.view !== 'zones')
      out.push(`${at}: a zone lit on the energy view`);
    if (s.greenhouse?.co2 && s.greenhouse.view !== 'energy')
      out.push(`${at}: CO₂ set on the zones view`);
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

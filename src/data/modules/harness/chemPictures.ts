/**
 * Picture checks for the chemistry kinds (typesChem.ts), called from `pictures.ts`: counts
 * of molecules whole and drawable, atom tallies that match the formula, heating curves that
 * rise, and periodic-table cells that exist. Test-only.
 */
import {
  ELEMENTS,
  MAX_MOLECULES,
  atomsOf,
  groupOf,
  periodOf,
  heatingCorners,
  heatingTemp,
  parseFormula,
} from '@/components/module/reps/chem';

import type { ChemSpec } from '../typesChem';

export function chemIssues(
  rep: ChemSpec,
  val: (x: string | number) => number | undefined,
): string[] {
  const out: string[] = [];
  const whole = (x: number | undefined, what: string, max: number) => {
    if (x === undefined) return;
    if (x < 0 || Math.abs(x - Math.round(x)) > 1e-9) out.push(`${what} ${x} is not a whole count`);
    else if (x > max) out.push(`${what} ${x} is more than the ${max} drawn`);
  };
  const formulaOk = (f: string) => {
    const parts = parseFormula(f);
    if (parts.length === 0) out.push(`formula "${f}" has no atoms`);
    for (const { el } of parts)
      if (!ELEMENTS.some(([s]) => s === el)) out.push(`"${el}" in ${f} is not an element`);
  };
  switch (rep.kind) {
    case 'molecules': {
      formulaOk(rep.formula);
      const n = val(rep.count);
      // More than MAX_MOLECULES are counted but not all drawn (the picture says so).
      whole(n, 'molecules', 10_000);
      if (n !== undefined && n > MAX_MOLECULES) out.push(`~${n} molecules: ${MAX_MOLECULES} drawn`);
      for (const [el, id] of Object.entries(rep.atoms ?? {})) {
        const t = val(id);
        const each = atomsOf(rep.formula, el);
        if (each === 0) out.push(`${rep.formula} has no ${el} atoms to count`);
        if (n !== undefined && t !== undefined && Math.abs(t - each * n) > 1e-9)
          out.push(`${each} × ${n} ${el} atoms drawn, the value shows ${t}`);
      }
      break;
    }
    case 'reaction': {
      if (rep.combustion) break; // HC74: picturesHe3e.ts
      const terms = [...rep.reactants, ...rep.products];
      if (rep.reactants.length < 1 || rep.reactants.length > 3)
        out.push(`${rep.reactants.length} reactants (1 to 3 fit)`);
      if (rep.products.length < 1 || rep.products.length > 3)
        out.push(`${rep.products.length} products (1 to 3 fit)`);
      for (const t of terms) {
        formulaOk(t.formula);
        whole(val(t.count), `${t.formula} count`, rep.most ?? (rep.many ? 18 : 8));
      }
      for (const [el, [before, after]] of Object.entries(rep.atoms ?? {})) {
        const side = (ts: typeof terms) => {
          const ns = ts.map((t) => val(t.count));
          if (ns.some((x) => x === undefined)) return undefined;
          return ts.reduce((s, t, i) => s + atomsOf(t.formula, el) * ns[i]!, 0);
        };
        const [b, a] = [side(rep.reactants), side(rep.products)];
        const [vb, va] = [val(before), val(after)];
        if (b !== undefined && vb !== undefined && b !== vb)
          out.push(`${b} ${el} atoms drawn before, the value shows ${vb}`);
        if (a !== undefined && va !== undefined && a !== va)
          out.push(`${a} ${el} atoms drawn after, the value shows ${va}`);
      }
      break;
    }
    case 'heatingCurve': {
      const [s, m, b] = [val(rep.start), val(rep.melt), val(rep.boil)];
      const e = rep.end === undefined ? undefined : val(rep.end);
      const spans = rep.spans.map(val);
      if (rep.spans.length < 4 || rep.spans.length > 5)
        out.push(`${rep.spans.length} spans (4, or 5 with the gas warming)`);
      if ((rep.spans.length === 5) !== (rep.end !== undefined))
        out.push('a fifth span needs an end temperature, and an end temperature a fifth span');
      if (s !== undefined && m !== undefined && s > m)
        out.push(`starts at ${s}, above melting ${m}`);
      if (m !== undefined && b !== undefined && m >= b) out.push(`melts at ${m}, boils at ${b}`);
      if (b !== undefined && e !== undefined && e < b) out.push(`ends at ${e}, below boiling ${b}`);
      spans.forEach((x, i) => {
        if (x !== undefined && x < 0) out.push(`span ${i + 1} is negative (${x})`);
      });
      if ([s, m, b, ...spans].some((x) => x === undefined)) break;
      if (rep.end !== undefined && e === undefined) break;
      const corners = heatingCorners(s!, m!, b!, spans as number[], e);
      const t = rep.at ? val(rep.at) : undefined;
      const last = corners[corners.length - 1]![0];
      if (t !== undefined && (t < 0 || t > last + 1e-9))
        out.push(`time ${t} is off the curve (0 to ${last})`);
      const y = rep.temp ? val(rep.temp) : undefined;
      if (t !== undefined && y !== undefined && Math.abs(heatingTemp(corners, t) - y) > 1e-6)
        out.push(`curve reads ${heatingTemp(corners, t)} at ${t}, the value shows ${y}`);
      break;
    }
    case 'periodicTable': {
      const z = rep.element === undefined ? undefined : val(rep.element);
      if (z !== undefined && (z < 1 || z > ELEMENTS.length || z !== Math.round(z)))
        out.push(`atomic number ${z} is not an element`);
      const g = rep.group === undefined ? undefined : val(rep.group);
      if (g !== undefined && (g < 1 || g > 18 || g !== Math.round(g))) out.push(`group ${g}`);
      const p = rep.period === undefined ? undefined : val(rep.period);
      if (p !== undefined && (p < 1 || p > 7 || p !== Math.round(p))) out.push(`period ${p}`);
      // An element and its own group or period, when a module has both.
      if (z !== undefined && z >= 1 && z <= ELEMENTS.length && z === Math.round(z)) {
        if (g !== undefined && groupOf(z) !== g) out.push(`element ${z} is not in group ${g}`);
        if (p !== undefined && periodOf(z) !== p) out.push(`element ${z} is not in period ${p}`);
      }
      break;
    }
  }
  return out;
}

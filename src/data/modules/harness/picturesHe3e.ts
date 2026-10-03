/**
 * Harness checks for the college pictures of round 3, group E (docs/RENDERINGS_HE.md): HC55
 * `instrumentTrace` and the `ir` card. `val` reads a value as the picture draws it (the
 * variable's shown unit). Test-only.
 */
import {
  irBandShape,
  multipletLines,
  plateCount,
  resolution,
  retentionFactor,
  rotorLine,
  rotorLines,
  tangentTriangle,
  peakHeight,
} from '@/components/module/reps/instrumentTraceMath';
import { diatomicMOs, frost, heteronuclear, secular } from '@/components/module/reps/orbitalMoMath';
import {
  combustion,
  combustionAtoms,
  gasVolume,
  litres,
  R_LATM,
} from '@/components/module/reps/moleHe3eMath';
import { parseSmiles } from '@/components/module/reps/skeletalMath';
import {
  angleBetween,
  complexPlaces,
  domainAngleOf,
  expandedDirections,
  expandedShape,
  isomerFits,
  isomerPlaces,
} from '@/components/module/reps/vseprHe3eMath';

import type { LayoutDef } from '../layouts';
import type { CombustionTrain, InstrumentTraceSpec, IrCard, OrbitalMoSpec } from '../typesHe3e';
import type { MoleMapSpec, VseprSpec } from '../typesHsi';

type Val = (x: string | number) => number | undefined;

const near = (a: number, b: number, rel = 2e-3) =>
  Math.abs(a - b) <= rel * Math.max(1e-9, Math.abs(b));

/** HC55: peak positions and widths from the values; n + 1 lines; line spacing 2B. */
export function instrumentTraceIssues(rep: InstrumentTraceSpec, val: Val): string[] {
  const out: string[] = [];
  const opt = (x: string | number | undefined) => (x === undefined ? undefined : val(x));
  const same = (x: string | number | undefined, want: number, what: string) => {
    const got = opt(x);
    if (got !== undefined && Number.isFinite(want) && !near(got, want))
      out.push(`instrumentTrace: ${what} ${String(x)} = ${got}, the picture draws ${want}`);
  };
  switch (rep.mode) {
    case 'nmr': {
      const mol = rep.smiles ? parseSmiles(rep.smiles) : undefined;
      if (mol?.error) out.push(`instrumentTrace: ${rep.smiles} does not parse (${mol.error})`);
      const H = opt(rep.hydrogens);
      // ΣI only once every integral is known (the picture works H × I ÷ ΣI only then).
      const Is = rep.signals.map((x) => opt(x.integral));
      const sum = Is.every((x) => x !== undefined) ? Is.reduce<number>((s, x) => s + x!, 0) : 0;
      rep.signals.forEach((s, i) => {
        const d = val(s.shift);
        const n = val(s.neighbors);
        if (d !== undefined && (d < 0 || d > 12))
          out.push(`instrumentTrace: signal ${i} at δ ${d}, outside 0–12 ppm`);
        if (n !== undefined) {
          if (n < 0 || n > 8 || Math.abs(n - Math.round(n)) > 1e-9)
            out.push(`instrumentTrace: signal ${i} has ${n} neighbors (whole, 0–8)`);
          const lines = multipletLines(d ?? 0, Math.round(n), 0.01, 1);
          if (lines.length !== Math.round(n) + 1)
            out.push(`instrumentTrace: signal ${i} draws ${lines.length} lines for n = ${n}`);
          const area = lines.reduce((a, l) => a + l.height, 0);
          if (!near(area, 1, 1e-9)) out.push(`instrumentTrace: signal ${i}'s lines add to ${area}`);
          // Centered on δ: the lines' mean is the shift.
          const mean = lines.reduce((a, l) => a + l.at * l.height, 0);
          if (d !== undefined && Math.abs(mean - d) > 1e-9)
            out.push(`instrumentTrace: signal ${i}'s multiplet is not centered on δ ${d}`);
        }
        const I = opt(s.integral);
        if (I !== undefined && I <= 0) out.push(`instrumentTrace: signal ${i} integral ${I} ≤ 0`);
        if (H !== undefined && I !== undefined && sum > 0) same(s.count, (H * I) / sum, 'count');
        if (mol && !mol.error)
          for (const a of s.atoms ?? []) {
            const at = mol.atoms[a];
            if (!at) out.push(`instrumentTrace: signal ${i} names atom ${a}, not in ${rep.smiles}`);
            else if (at.h === 0 && at.el !== 'C')
              out.push(`instrumentTrace: signal ${i} names atom ${a} (${at.el}), which has no H`);
          }
      });
      break;
    }
    case 'chromatogram': {
      const tM = val(rep.dead);
      const ps = rep.peaks.map((p) => ({ t: val(p.time), w: val(p.width) }));
      ps.forEach((p, i) => {
        if (p.w !== undefined && p.w <= 0) out.push(`instrumentTrace: peak ${i} width ${p.w} ≤ 0`);
        if (p.t !== undefined && tM !== undefined && p.t <= tM)
          out.push(`instrumentTrace: peak ${i} at ${p.t}, not after t_M = ${tM}`);
        if (p.t !== undefined && p.w !== undefined && p.w > 0) {
          // The tangent triangle meets the baseline one base width apart, centered on t.
          const tri = tangentTriangle(p.t, p.w, peakHeight(p.w));
          if (
            !near(tri.right - tri.left, p.w, 1e-9) ||
            !near((tri.left + tri.right) / 2, p.t, 1e-9)
          )
            out.push(`instrumentTrace: peak ${i}'s triangle is not w wide about t`);
        }
        const k = rep.factors?.[i];
        if (k !== undefined && p.t !== undefined && tM !== undefined && tM > 0)
          same(k, retentionFactor(p.t, tM), `k${i + 1}`);
      });
      const [a, b] = ps;
      if (a?.t !== undefined && b?.t !== undefined && a.w !== undefined && b.w !== undefined) {
        same(rep.resolution, resolution(a.t, b.t, a.w, b.w), 'R');
        same(rep.plates, plateCount(b.t, b.w), 'N');
        if (tM !== undefined && tM > 0)
          same(rep.selectivity, retentionFactor(b.t, tM) / retentionFactor(a.t, tM), 'α');
      }
      break;
    }
    case 'rotational': {
      const B = val(rep.constant);
      const T = opt(rep.temperature) ?? 298.15;
      if (B === undefined || B <= 0) break;
      const lines = rotorLines(B, T);
      lines.forEach((l, k) => {
        if (!near(l.at, 2 * B * (l.J + 1), 1e-9))
          out.push(`instrumentTrace: line J = ${l.J} misplaced`);
        const next = lines[k + 1];
        if (next && !near(next.at - l.at, 2 * B, 1e-9))
          out.push(`instrumentTrace: lines ${l.J} and ${next.J} are not 2B apart`);
      });
      same(rep.spacing, 2 * B, 'spacing');
      const J = opt(rep.lower);
      if (J !== undefined) {
        if (J < 0 || Math.abs(J - Math.round(J)) > 1e-9)
          out.push(`instrumentTrace: lower level J = ${J} (whole, from 0)`);
        same(rep.line, rotorLine(B, Math.round(J)), 'line');
      }
      break;
    }
  }
  return out;
}

/** HC55 `ir` cards: bands inside 4000–400 cm⁻¹, one to six of them. */
export function irCardIssues(l: LayoutDef): string[] {
  const out: string[] = [];
  const figures =
    l.kind === 'sort'
      ? l.cards.map((c) => [c.label, c.figure] as const)
      : l.kind === 'sequence'
        ? l.stages.map((s) => [s.label, s.figure] as const)
        : [];
  for (const [label, f] of figures) {
    if (f?.kind !== 'ir') continue;
    const card = f as IrCard;
    if (card.bands.length < 1 || card.bands.length > 6)
      out.push(`card "${label}": ${card.bands.length} IR bands (1 to 6 fit)`);
    for (const b of card.bands) {
      const { center, half } = irBandShape(b);
      if (center - half < 400 || center + half > 4000)
        out.push(`card "${label}": the band at ${b.at} cm⁻¹ runs past 4000–400 cm⁻¹`);
    }
  }
  return out;
}

/** HC70: electron count, bond order, unpaired; E± from the determinant; Frost levels. */
export function orbitalMoIssues(rep: OrbitalMoSpec, val: Val): string[] {
  const out: string[] = [];
  const opt = (x: string | number | undefined) => (x === undefined ? undefined : val(x));
  const same = (x: string | number | undefined, want: number, what: string) => {
    const got = opt(x);
    if (got !== undefined && Number.isFinite(want) && !near(got, want, 1e-3))
      out.push(`orbitalDiagram mo: ${what} ${String(x)} = ${got}, the picture draws ${want}`);
  };
  const whole = (x: number | undefined, lo: number, hi: number, what: string) => {
    if (x !== undefined && (x < lo || x > hi || Math.abs(x - Math.round(x)) > 1e-9))
      out.push(`orbitalDiagram mo: ${what} ${x} (whole, ${lo} to ${hi} drawn)`);
  };
  switch (rep.view) {
    case 'diatomic': {
      const e = opt(rep.electrons);
      whole(e, 2, 16, 'valence electrons');
      if (e === undefined) break;
      const mo = diatomicMOs(e);
      const drawn = mo.levels.reduce((s, l) => s + l.fill.reduce((a, x) => a + x, 0), 0);
      if (drawn !== Math.round(e)) out.push(`orbitalDiagram mo: ${drawn} electrons drawn for ${e}`);
      if (mo.levels.some((l) => l.fill.some((x) => x > 2)))
        out.push('orbitalDiagram mo: an orbital holds more than two electrons');
      same(rep.bonding, mo.bonding, 'bonding');
      same(rep.antibonding, mo.antibonding, 'antibonding');
      same(rep.bondOrder, mo.bondOrder, 'bond order');
      same(rep.unpaired, mo.unpaired, 'unpaired');
      break;
    }
    case 'heteronuclear': {
      const [a, b, beta] = [opt(rep.alphaA), opt(rep.alphaB), opt(rep.beta)];
      if (beta !== undefined && beta >= 0) out.push(`orbitalDiagram mo: β = ${beta} (negative)`);
      if (a === undefined || b === undefined || beta === undefined) break;
      const mo = heteronuclear(a, b, beta);
      for (const E of [mo.plus, mo.minus])
        if (Math.abs(secular(a, b, beta, E)) > 1e-9 * (1 + a * a + b * b))
          out.push(`orbitalDiagram mo: E = ${E} is not a root of the determinant`);
      if (!(mo.plus <= Math.min(a, b) && mo.minus >= Math.max(a, b)))
        out.push('orbitalDiagram mo: E₊ must lie below both AOs and E₋ above');
      same(rep.plus, mo.plus, 'E₊');
      same(rep.minus, mo.minus, 'E₋');
      same(rep.splitting, mo.splitting, 'splitting');
      whole(opt(rep.electrons), 0, 4, 'electrons');
      break;
    }
    case 'frost': {
      const [N, e] = [opt(rep.ring), opt(rep.electrons)];
      whole(N, 3, 8, 'ring carbons');
      if (N === undefined) break;
      whole(e, 0, 2 * N, 'π electrons');
      if (e === undefined) break;
      const f = frost(N, e);
      for (const l of f.levels)
        for (const k of l.ks)
          if (Math.abs(2 * Math.cos((2 * Math.PI * k) / N) - l.coef) > 1e-12)
            out.push(`orbitalDiagram mo: the level at k = ${k} is not 2β cos(2πk ÷ N)`);
      const drawn = f.levels.reduce((s, l) => s + l.fill.reduce((a, x) => a + x, 0), 0);
      if (drawn !== Math.round(e)) out.push(`orbitalDiagram mo: ${drawn} electrons drawn for ${e}`);
      same(rep.energy, f.energy, 'π energy');
      same(rep.isolated, f.isolated, 'isolated');
      same(rep.delocalization, f.delocalization, 'delocalization');
      same(rep.unpaired, f.unpaired, 'unpaired');
      break;
    }
  }
  return out;
}

/** HC72: lone pairs equatorial in 5 domains, trans in 6; angles; a complex's isomer places. */
export function vseprHe3eIssues(rep: VseprSpec, val: Val): string[] {
  const out: string[] = [];
  if (rep.mode === 'expanded') {
    const [b, l] = [val(rep.bonded), val(rep.lone)];
    if (b === undefined || l === undefined) return out;
    const shape = expandedShape(b, l);
    if (!shape || b !== Math.round(b) || l !== Math.round(l)) {
      out.push(`vsepr: ${b} bonded atoms and ${l} lone pairs: no shape drawn (2–6 domains)`);
      return out;
    }
    const d = b + l;
    const dirs = expandedDirections(b, l);
    if (dirs.bonds.length !== b || dirs.lone.length !== l)
      out.push(`vsepr: ${dirs.bonds.length} bonds and ${dirs.lone.length} lone pairs drawn`);
    if (d === 5 && dirs.lone.some((v) => Math.abs(v[1]) > 1e-9))
      out.push('vsepr: a lone pair is not equatorial in 5 domains');
    if (d === 6 && l === 2 && Math.abs(angleBetween(dirs.lone[0]!, dirs.lone[1]!) - 180) > 1e-6)
      out.push('vsepr: the two lone pairs are not trans in 6 domains');
    // Every two domains at least θ apart, and some two exactly θ.
    const all = [...dirs.bonds, ...dirs.lone];
    let least = 180;
    for (let i = 0; i < all.length; i++)
      for (let j = i + 1; j < all.length; j++)
        least = Math.min(least, angleBetween(all[i]!, all[j]!));
    // 2–4 domains keep the Grades 9–12 measured angles (H₂O 104.5°); 5–6 are ideal.
    if (d >= 5 && Math.abs(least - shape.domainAngle) > 0.6)
      out.push(`vsepr: domains drawn ${least.toFixed(1)}° apart, θ is ${shape.domainAngle}°`);
    const a = rep.angle === undefined ? undefined : val(rep.angle);
    if (a !== undefined && Math.abs(a - domainAngleOf(d)) > 1e-9)
      out.push(`vsepr: θ for ${d} domains is ${domainAngleOf(d)}°, the value shows ${a}`);
    const dv = rep.domains === undefined ? undefined : val(rep.domains);
    if (dv !== undefined && dv !== d) out.push(`vsepr: ${d} domains drawn, the value shows ${dv}`);
    return out;
  }
  if (rep.mode !== 'complex') return out;
  const cx = rep.complex;
  const places = complexPlaces(cx.geometry);
  const total = cx.ligands.reduce((s, x) => s + x.count, 0);
  if (total !== places.length)
    out.push(`vsepr: ${total} ligands on a ${cx.geometry} metal with ${places.length} places`);
  if (cx.ligands.length < 1 || cx.ligands.length > 2) out.push('vsepr: one or two kinds of ligand');
  const minor = cx.ligands[1]?.count ?? 0;
  if (cx.isomer) {
    if (!isomerFits(cx.geometry, minor, cx.isomer))
      out.push(`vsepr: no ${cx.isomer} isomer with ${minor} of a ligand, ${cx.geometry}`);
    else {
      const lit = isomerPlaces(cx.geometry, minor, cx.isomer).map((i) => places[i]!);
      const angs: number[] = [];
      for (let i = 0; i < lit.length; i++)
        for (let j = i + 1; j < lit.length; j++)
          angs.push(Math.round(angleBetween(lit[i]!, lit[j]!)));
      const want = {
        cis: (x: number[]) => x.every((y) => y === 90),
        trans: (x: number[]) => x.every((y) => y === 180),
        fac: (x: number[]) => x.every((y) => y === 90),
        mer: (x: number[]) => x.filter((y) => y === 180).length === 1,
      }[cx.isomer];
      if (!want(angs)) out.push(`vsepr: ${cx.isomer} places at ${angs.join(', ')}°`);
    }
  }
  const cn = rep.coordination === undefined ? undefined : val(rep.coordination);
  if (cn !== undefined && cn !== total)
    out.push(`vsepr: ${total} ligands drawn, the coordination number shows ${cn}`);
  return out;
}

/** HC74: each box's arithmetic, n = CV, V = n ÷ C and V = nRT ÷ P (units from the variables). */
export function moleMapHe3eIssues(
  rep: MoleMapSpec,
  val: Val,
  unitOf: (id: string) => string | undefined,
): string[] {
  const out: string[] = [];
  const opt = (x: string | number | undefined) => (x === undefined ? undefined : val(x));
  const L = (x: string | number) => {
    const v = val(x);
    return v === undefined ? undefined : litres(v, typeof x === 'string' ? unitOf(x) : 'L');
  };
  const near3 = (a: number, b: number) => Math.abs(a - b) <= 1e-3 * Math.max(1e-12, Math.abs(b));
  const n1 = val(rep.moles);
  const n2 = rep.second ? val(rep.second.moles) : undefined;
  const s1 = rep.solution?.first;
  const s2 = rep.solution?.second;
  if (s2 && !rep.second) out.push('moleMap: a second solution box needs a second substance');
  for (const [s, n, what] of [
    [s1, n1, 'first'],
    [s2, n2, 'second'],
  ] as const) {
    if (!s) continue;
    const C = val(s.molarity);
    const V = L(s.volume);
    if (C !== undefined && C <= 0) out.push(`moleMap: ${what} solution at ${C} M`);
    if (C !== undefined && V !== undefined && n !== undefined && !near3(n, C * V))
      out.push(`moleMap: ${what} solution n = ${n}, C × V = ${C * V}`);
  }
  const g = rep.gas;
  if (g) {
    const n = (g.of ?? 'second') === 'first' ? n1 : n2;
    const [T, P, V] = [val(g.temperature), val(g.pressure), val(g.volume)];
    const R = opt(g.R) ?? R_LATM;
    if (T !== undefined && T <= 0) out.push(`moleMap: gas at ${T} K`);
    if (n !== undefined && T !== undefined && P !== undefined && V !== undefined && P > 0)
      if (!near3(V, gasVolume(n, T, P, R)))
        out.push(`moleMap: gas V = ${V} L, nRT ÷ P = ${gasVolume(n, T, P, R)} L`);
  }
  return out;
}

/** HC74 `combustion`: each element's moles and ratio; the formula's combustion balances. */
export function combustionIssues(t: CombustionTrain, val: Val): string[] {
  const out: string[] = [];
  const [m, co2, h2o] = [val(t.sample), val(t.co2), val(t.h2o)];
  if (m === undefined || co2 === undefined || h2o === undefined) return out;
  const r = combustion(m, co2, h2o, t.masses ?? {});
  const same = (x: string | number | undefined, want: number, what: string) => {
    const got = x === undefined ? undefined : val(x);
    if (got !== undefined && !near(got, want, 1e-3))
      out.push(`combustion: ${what} ${String(x)} = ${got}, the picture draws ${want}`);
  };
  if (r.mO < -0.01 * m) out.push(`combustion: C and H weigh ${m - r.mO} g, more than the sample`);
  same(t.carbon, r.nC, 'n_C');
  same(t.hydrogen, r.nH, 'n_H');
  same(t.oxygenMass, r.mO, 'm_O');
  same(t.oxygen, r.nO, 'n_O');
  same(t.hPerC, r.hPerC, 'H per C');
  same(t.oPerC, r.oPerC, 'O per C');
  if (r.formula && r.equation) {
    const { before, after } = combustionAtoms([r.formula.x, r.formula.y, r.formula.z], r.equation);
    for (const el of ['C', 'H', 'O'] as const)
      if (before[el] !== after[el])
        out.push(`combustion: ${el} does not balance (${before[el]} → ${after[el]})`);
  }
  return out;
}

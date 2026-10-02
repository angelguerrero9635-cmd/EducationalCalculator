/**
 * Picture checks for the Grades 9–12 group I pictures (`typesHsi.ts`): what each one draws must
 * agree with the values. Called from `repIssues` in `pictures.ts`. Test-only.
 */
import {
  cancelUnits,
  chainValue,
  meanOf,
  percentError,
  placesOf,
} from '@/components/module/reps/unitChainMath';

import {
  MAX_ELECTRONS,
  configuration,
  photonEnergy,
  photonWavelength,
  shells,
  unpaired,
} from '@/components/module/reps/electrons';

import { trendValue } from '@/components/module/reps/chemTrends';

import {
  IONIC_METALS,
  IONIC_NONMETALS,
  LEWIS,
  electronsAround,
  hydrogensOf,
  ionic,
  lewisCounts,
  lewisKey,
  valenceElectrons,
} from '@/components/module/reps/lewis';

import { MAX_PARTICLES, balanced, limitingOutcome } from '@/components/module/reps/limiting';
import { AVOGADRO, MOLAR_VOLUME, molarMassOf } from '@/components/module/reps/moles';
import { hydrogenBonds, shapeOf } from '@/components/module/reps/vseprGeo';

import { branchIssues } from './picturesHs2d';
import { ionicChargeIssues } from './picturesHs3e';

import type { ChemSpec } from '../typesChem';
import type { HsiSpec } from '../typesHsi';

/** Equal to display rounding (values are read as shown, 4 decimals or 4 significant figures). */
const near = (a: number, b: number, tol = 1e-4) =>
  Math.abs(a - b) <= tol * Math.max(1, Math.abs(a), Math.abs(b));

export function hsiIssues(rep: HsiSpec, val: (id: string) => number | undefined): string[] {
  const out: string[] = [];
  const num = (x: string | number | undefined) =>
    x === undefined ? undefined : typeof x === 'number' ? x : val(x);
  switch (rep.kind) {
    case 'unitChain': {
      if (rep.mode === 'chain') {
        if (rep.factors.length < 1 || rep.factors.length > 4)
          out.push(`${rep.factors.length} factors (1 to 4 fit)`);
        const { result } = cancelUnits(rep.unit, rep.per, rep.factors);
        if (result === '1') out.push('every unit cancels: the chain has no unit left');
        const s = num(rep.start);
        const fs = rep.factors.map((f) => [num(f.top), num(f.bottom)]);
        const r = num(rep.result);
        if (s === undefined || r === undefined || fs.flat().some((x) => x === undefined)) break;
        const want = chainValue(s, fs as [number, number][]);
        if (want === undefined) out.push('a factor has a bottom of 0');
        else if (!near(want, r)) out.push(`the chain gives ${want}, the value shows ${r}`);
        break;
      }
      if (rep.mode === 'ruler') {
        const places = placesOf(rep.division);
        if (Math.abs(1 / rep.division - Math.round(1 / rep.division)) > 1e-9)
          out.push(`a division of ${rep.division} does not split a unit evenly`);
        const [s, e] = [num(rep.start ?? 0), num(rep.end)];
        if (s === undefined || e === undefined) break;
        const span = rep.span ?? Math.max(5, Math.ceil(e + 0.5));
        if (s < 0 || e > span) out.push(`rod from ${s} to ${e} is off the ruler (0 to ${span})`);
        if (e < s) out.push(`rod ends at ${e}, before its start ${s}`);
        for (const x of [s, e]) {
          const scaled = x * 10 ** (places + 1);
          if (Math.abs(scaled - Math.round(scaled)) > 1e-6)
            out.push(`reading ${x} has more than one digit past the ${rep.division} marks`);
        }
        const L = num(rep.length);
        if (L !== undefined && !near(L, e - s, 1e-9))
          out.push(`rod is ${e - s} long, the value shows ${L}`);
        break;
      }
      if (rep.trials.length < 2 || rep.trials.length > 6)
        out.push(`${rep.trials.length} trials (2 to 6 fit)`);
      const xs = rep.trials.map(num);
      const acc = num(rep.accepted);
      if (acc !== undefined && acc <= 0) out.push(`accepted value ${acc} is not positive`);
      if (xs.some((x) => x === undefined)) break;
      const mean = meanOf(xs as number[]);
      const m = num(rep.mean);
      if (m !== undefined && !near(m, mean))
        out.push(`mean of the trials is ${mean}, the value shows ${m}`);
      const e = num(rep.error);
      if (acc === undefined || e === undefined) break;
      const want = percentError(mean, acc);
      if (want !== undefined && !near(e, want, 1e-3))
        out.push(`percent error is ${want}, the value shows ${e}`);
      break;
    }
    case 'atomModel': {
      const whole = (x: number | undefined, what: string, lo: number, hi: number) => {
        if (x === undefined) return;
        if (x !== Math.round(x) || x < lo || x > hi)
          out.push(`${what} ${x} (whole, ${lo} to ${hi} drawn)`);
      };
      const p = num(rep.protons);
      const n = num(rep.neutrons);
      const e = rep.electrons === undefined ? p : num(rep.electrons);
      whole(p, 'protons', 1, MAX_ELECTRONS);
      whole(n, 'neutrons', 0, 90);
      whole(e, 'electrons', 0, MAX_ELECTRONS);
      const A = num(rep.mass);
      if (A !== undefined && p !== undefined && n !== undefined && A !== p + n)
        out.push(`mass number ${A}, but ${p} + ${n} particles are drawn in the nucleus`);
      const q = num(rep.charge);
      if (q !== undefined && p !== undefined && e !== undefined && q !== p - e)
        out.push(`charge ${q}, but ${p} protons and ${e} electrons are drawn`);
      const v = num(rep.valence);
      if (v !== undefined && p !== undefined && e !== undefined && e >= 1) {
        const sh = shells(configuration(p, e));
        if (sh[sh.length - 1] !== v)
          out.push(`outer shell holds ${sh[sh.length - 1]}, the value shows ${v}`);
      }
      break;
    }
    case 'orbitalDiagram': {
      if (rep.mode === 'mo') break; // HC70: picturesHe3e.ts
      if (rep.mode === 'boxes') {
        if (rep.element === undefined && rep.electrons === undefined)
          out.push('boxes need an element or a number of electrons');
        const z = num(rep.element);
        const e = rep.electrons === undefined ? z : num(rep.electrons);
        if (z !== undefined && (z !== Math.round(z) || z < 1 || z > MAX_ELECTRONS))
          out.push(`atomic number ${z} (1 to ${MAX_ELECTRONS} drawn)`);
        if (e !== undefined && (e !== Math.round(e) || e < 0 || e > MAX_ELECTRONS))
          out.push(`${e} electrons (0 to ${MAX_ELECTRONS} drawn)`);
        const u = num(rep.unpaired);
        if (u !== undefined && e !== undefined) {
          const want = unpaired(configuration(z ?? e, e));
          if (want !== u) out.push(`${want} unpaired electrons drawn, the value shows ${u}`);
        }
        break;
      }
      const [hi, lo] = [num(rep.upper), num(rep.lower)];
      const levels = rep.levels ?? 6;
      if (levels < 2 || levels > 8) out.push(`${levels} levels (2 to 8 drawn)`);
      if (hi === undefined || lo === undefined) break;
      if (hi !== Math.round(hi) || lo !== Math.round(lo) || lo < 1 || hi > levels || hi <= lo)
        out.push(`a drop from n = ${hi} to n = ${lo} is not drawn (1 ≤ lower < upper ≤ ${levels})`);
      const E = photonEnergy(hi, lo);
      const en = num(rep.energy);
      if (en !== undefined && !near(en, E, 1e-3))
        out.push(`photon energy ${E} eV, the value shows ${en}`);
      const lam = num(rep.wavelength);
      if (lam !== undefined && !near(lam, photonWavelength(en ?? E), 1e-3))
        out.push(`wavelength ${photonWavelength(en ?? E)} nm, the value shows ${lam}`);
      break;
    }
    case 'moleMap': {
      const n = num(rep.moles);
      const M = num(rep.molarMass) ?? (rep.formula ? molarMassOf(rep.formula) : undefined);
      const fromFormula = rep.formula ? molarMassOf(rep.formula) : undefined;
      if (rep.formula && fromFormula === undefined) out.push(`no molar mass for ${rep.formula}`);
      const Mv = num(rep.molarMass);
      if (Mv !== undefined && fromFormula !== undefined && !near(Mv, fromFormula, 1e-3))
        out.push(`${rep.formula} has a molar mass of ${fromFormula}, the value shows ${Mv}`);
      const check = (id: string | number | undefined, want: number | undefined, what: string) => {
        const v = num(id);
        if (v !== undefined && want !== undefined && !near(v, want, 1e-3))
          out.push(`${what} should be ${want}, the value shows ${v}`);
      };
      if (n === undefined) break;
      check(rep.mass, M === undefined ? undefined : n * M, 'mass');
      check(rep.particles, n * AVOGADRO, 'particles');
      check(rep.volume, n * MOLAR_VOLUME, 'volume');
      if (rep.second) {
        const [a, b] = rep.second.ratio.map(num);
        if (a === undefined || b === undefined) break;
        const n2 = (n * b) / a;
        check(rep.second.moles, n2, 'moles of the second substance');
        const M2 =
          num(rep.second.molarMass) ??
          (rep.second.formula ? molarMassOf(rep.second.formula) : undefined);
        check(
          rep.second.mass,
          M2 === undefined ? undefined : n2 * M2,
          'mass of the second substance',
        );
      }
      break;
    }
    case 'vsepr': {
      if (rep.mode === 'expanded' || rep.mode === 'complex') break; // HC72: picturesHe3e.ts
      if (rep.mode === 'hbonds') {
        const n = num(rep.molecules);
        if (n !== undefined && (n !== Math.round(n) || n < 2 || n > 5))
          out.push(`${n} water molecules (whole, 2 to 5 drawn)`);
        const k = num(rep.bonds);
        if (n !== undefined && k !== undefined && k !== hydrogenBonds(n))
          out.push(`${hydrogenBonds(n)} hydrogen bonds drawn, the value shows ${k}`);
        break;
      }
      const [b, l] = [num(rep.bonded), num(rep.lone)];
      if (b === undefined || l === undefined) break;
      const shape = shapeOf(b, l);
      if (!shape || b !== Math.round(b) || l !== Math.round(l)) {
        out.push(`${b} bonded atoms and ${l} lone pairs: no shape drawn (2 to 4 domains)`);
        break;
      }
      const a = num(rep.angle);
      if (a !== undefined && !near(a, shape.angle, 1e-9))
        out.push(`${shape.name} is drawn at ${shape.angle}°, the value shows ${a}`);
      break;
    }
    case 'lewisStructure': {
      const whole = (x: number | undefined, what: string, lo: number, hi: number) => {
        if (x !== undefined && (x !== Math.round(x) || x < lo || x > hi))
          out.push(`${what} ${x} (whole, ${lo} to ${hi} drawn)`);
      };
      if (rep.mode === 'molecule') {
        const counts = Object.entries(rep.atoms ?? {}).map(([el, x]) => [el, num(x)] as const);
        const q = rep.charge === undefined ? 0 : num(rep.charge);
        if (!rep.formula && !rep.atoms) out.push('a molecule needs a formula or atom counts');
        if (counts.some(([, n]) => n === undefined) || q === undefined) break;
        const key = rep.formula ?? lewisKey(Object.fromEntries(counts as [string, number][]), q);
        if (rep.formula && !LEWIS[rep.formula]) out.push(`no Lewis structure for ${rep.formula}`);
        const s = key ? LEWIS[key] : undefined;
        if (!s) break; // The caption names the structures that are drawn.
        s.atoms.forEach((a, i) => {
          const want = a.el === 'H' ? 2 : 8;
          if (electronsAround(s, i) !== want)
            out.push(
              `${a.el} in ${key} has ${electronsAround(s, i)} electrons around it, not ${want}`,
            );
        });
        const c = lewisCounts(s);
        if (c.valence !== 2 * (c.bonding + c.lone))
          out.push(`${key}: ${c.valence} valence electrons, ${2 * (c.bonding + c.lone)} drawn`);
        for (const [id, want, what] of [
          [rep.valence, c.valence, 'valence electrons'],
          [rep.bonding, c.bonding, 'shared pairs'],
          [rep.lone, c.lone, 'lone pairs'],
        ] as const) {
          const v = num(id);
          if (v !== undefined && v !== want)
            out.push(`${want} ${what} drawn in ${key}, the value shows ${v}`);
        }
        break;
      }
      if (rep.mode === 'ionic') {
        if (!IONIC_METALS.includes(rep.metal))
          out.push(`${rep.metal} is not a metal the picture draws`);
        if (!IONIC_NONMETALS.includes(rep.nonmetal))
          out.push(`${rep.nonmetal} is not a nonmetal the picture draws`);
        // Round 3 (H108 part 2): the elements may come from the ions' charges.
        const pick = ionicChargeIssues(rep, num, out);
        const ion = ionic(pick.metal, pick.nonmetal);
        const a = num(rep.metals) ?? ion.metals;
        const b = num(rep.nonmetals) ?? ion.nonmetals;
        const t = num(rep.transferred);
        // Unbalanced charges or more than 6 ions draw the formula unit faded, the reason in the caption.
        if (a * ion.give !== b * ion.take || a + b > 6) break;
        if (t !== undefined && t !== a * ion.give)
          out.push(`${a * ion.give} electrons move, the value shows ${t}`);
        break;
      }
      if (rep.mode === 'metallic') {
        const v = valenceElectrons(rep.element);
        if (!IONIC_METALS.includes(rep.element))
          out.push(`${rep.element} is not a metal the picture draws`);
        const n = num(rep.atoms);
        whole(n, 'metal atoms', 1, 24);
        const e = num(rep.electrons);
        if (n !== undefined && e !== undefined && e !== n * v)
          out.push(`${n} × ${v} = ${n * v} electrons drawn, the value shows ${e}`);
        break;
      }
      const bond = rep.bond ?? 'single';
      const n = num(rep.carbons);
      whole(n, 'carbons', bond === 'single' ? 1 : 2, 8);
      const h = num(rep.hydrogens);
      // Round 2: methyl branches add carbons to the formula (H101 part 9b).
      const all = n === undefined ? undefined : n + (rep.branches?.length ?? 0);
      if (rep.branches?.length) out.push(...branchIssues(rep.branches, bond, n));
      if (all !== undefined && h !== undefined && h !== hydrogensOf(all, bond))
        out.push(`${hydrogensOf(all, bond)} hydrogens drawn, the value shows ${h}`);
      break;
    }
  }
  return out;
}

/** The group I options on the Grade 7–8 chemistry kinds: a periodic trend (H46). */
export function chemHsiIssues(
  rep: ChemSpec,
  val: (x: string | number) => number | undefined,
): string[] {
  const out: string[] = [];
  const num = (x: string | number | undefined) => (x === undefined ? undefined : val(x));
  if (rep.kind === 'reaction' && rep.limiting) {
    const lim = rep.limiting;
    if (lim.amounts.length !== rep.reactants.length)
      out.push(`${lim.amounts.length} amounts for ${rep.reactants.length} reactants`);
    const coefs = rep.reactants.map((t) => num(t.count));
    const pcoefs = rep.products.map((t) => num(t.count));
    const amounts = lim.amounts.map((a) => num(a));
    if ([...coefs, ...pcoefs, ...amounts].some((x) => x === undefined)) return out;
    for (const a of amounts as number[])
      if (a !== Math.round(a) || a < 0 || a > MAX_PARTICLES)
        out.push(`${a} particles (whole, 0 to ${MAX_PARTICLES} drawn)`);
    if (
      !balanced(
        rep.reactants.map((t, i) => ({ formula: t.formula, n: coefs[i]! })),
        rep.products.map((t, i) => ({ formula: t.formula, n: pcoefs[i]! })),
      )
    )
      out.push('the limiting-reactant picture needs a balanced equation');
    const o = limitingOutcome(coefs as number[], amounts as number[], pcoefs as number[]);
    o.made.forEach((m, i) => {
      if (m > MAX_PARTICLES) out.push(`${m} particles of a product made (${MAX_PARTICLES} drawn)`);
      const v = num(lim.made?.[i]);
      if (v !== undefined && v !== m)
        out.push(`${m} of product ${i + 1} drawn, the value shows ${v}`);
    });
    o.left.forEach((l, i) => {
      const v = num(lim.left?.[i]);
      if (v !== undefined && v !== l)
        out.push(`${l} of reactant ${i + 1} left over, the value shows ${v}`);
    });
    const r = num(lim.runs);
    if (r !== undefined && r !== o.runs) out.push(`${o.runs} runs drawn, the value shows ${r}`);
  }
  if (rep.kind === 'periodicTable' && rep.trend) {
    const pairs: [string | number | undefined, string | undefined][] = [
      [rep.element, rep.trend.value],
      [rep.trend.compare, rep.trend.compareValue],
    ];
    for (const [el, value] of pairs) {
      const z = num(el);
      const v = num(value);
      if (value !== undefined && el === undefined)
        out.push(`a trend value ${value} with no element`);
      if (z === undefined || v === undefined) continue;
      const want = trendValue(rep.trend.property, z);
      if (want === undefined)
        out.push(`element ${z} has no ${rep.trend.property} value to show ${v}`);
      else if (!near(want, v, 1e-6))
        out.push(`element ${z}'s ${rep.trend.property} is ${want}, the value shows ${v}`);
    }
  }
  return out;
}
